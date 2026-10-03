## Lab 4 — Sequence to sequence with attention {#lab4}

**Goal.** Build a GRU encoder–decoder that reverses strings of digits, once with a single summary
vector between encoder and decoder ([Section 10](#s10)) and once with Bahdanau's additive
attention ([Section 11](#s11)). You measure the bottleneck (sequence accuracy against source
length), the gap between teacher-forced and free-running accuracy (exposure bias), and what beam
search can and cannot repair, and you plot the alignment the attention model finds without being
told where to look. Everything is synthetic; nothing is downloaded. The task is trivial for a
person, which is what makes the failure of the model without attention informative.

### Step 1: Tokens, batches and the QUICK switch

The vocabulary has 13 tokens: the digits 0–9, `PAD` (10), `BOS` (11) and `EOS` (12). A source is a
string of 3 to 12 digits, **always padded on the right to 12 positions**, as it is in training. The
decoder input is `BOS` followed by the reversed digits, and the decoder target is the reversed
digits followed by `EOS`; both are padded to 13 positions, and the loss will ignore `PAD`. The
function also returns the true lengths, which the encoder needs for packing and the attention
needs for masking. With `QUICK = True` the training runs shrink from 1,500 to 400 steps.

```python
import time
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

QUICK = False                      # True: 400 training steps instead of 1,500
STEPS = 400 if QUICK else 1500
PAD, BOS, EOS, V = 10, 11, 12, 13  # digits are tokens 0-9
MAX_LEN = 12                       # longest source; the decoder emits up to 13 tokens
np.random.seed(0)
torch.manual_seed(0)

def make_batch(n, rng, minl, maxl):
    """n random digit strings; returns source, decoder input, target, true lengths."""
    lens = rng.integers(minl, maxl + 1, size=n)
    src = np.full((n, MAX_LEN), PAD, dtype=np.int64)
    dec_in = np.full((n, MAX_LEN + 1), PAD, dtype=np.int64)
    tgt = np.full((n, MAX_LEN + 1), PAD, dtype=np.int64)
    for i, L in enumerate(lens):
        digits = rng.integers(0, 10, size=L)
        src[i, :L] = digits
        dec_in[i, 0] = BOS
        dec_in[i, 1:L + 1] = digits[::-1]
        tgt[i, :L] = digits[::-1]
        tgt[i, L] = EOS
    return (torch.from_numpy(src), torch.from_numpy(dec_in),
            torch.from_numpy(tgt), torch.from_numpy(lens))

rng = np.random.default_rng(0)
src, dec_in, tgt, lens = make_batch(3, rng, 3, 12)
for i in range(3):
    print("length", int(lens[i]))
    print("  src   ", src[i].tolist())
    print("  dec_in", dec_in[i].tolist())
    print("  target", tgt[i].tolist())
```

```output
length 11
  src    [2, 3, 0, 0, 0, 1, 8, 6, 9, 5, 6, 10]
  dec_in [11, 6, 5, 9, 6, 8, 1, 0, 0, 0, 3, 2, 10]
  target [6, 5, 9, 6, 8, 1, 0, 0, 0, 3, 2, 12, 10]
length 9
  src    [9, 7, 6, 5, 5, 9, 2, 8, 6, 10, 10, 10]
  dec_in [11, 6, 8, 2, 9, 5, 5, 6, 7, 9, 10, 10, 10]
  target [6, 8, 2, 9, 5, 5, 6, 7, 9, 12, 10, 10, 10]
length 8
  src    [0, 3, 8, 5, 0, 7, 7, 8, 10, 10, 10, 10]
  dec_in [11, 8, 7, 7, 0, 5, 8, 3, 0, 10, 10, 10, 10]
  target [8, 7, 7, 0, 5, 8, 3, 0, 12, 10, 10, 10, 10]
```

Read one row to check the layout: the target is the source's digits in reverse order, then 12
(`EOS`), then `PAD` (10). The decoder input is the target shifted right by one with `BOS` (11) in
front: at step $t$ the decoder sees the true previous token and must produce the next one. That
shift is teacher forcing.

### Step 2: The model, with attention as a switch

One class serves both experiments, so that the two models differ in the attention parameters and
nothing else. The encoder is a bidirectional `nn.GRU` of width $H = 64$ per direction. It runs on
**packed** sequences (`pack_padded_sequence` with `enforce_sorted=False`), so that the backward
direction starts at each string's true last digit and not at the padding ([Section 7](#s7)). The
annotations $\mathbf{h}_j$ are the 128-wide concatenations of the two directions. The decoder's
initial state is $\mathbf{s}_0 = \tanh(\mathbf{W}[\overrightarrow{\mathbf{h}}_S; \overleftarrow{\mathbf{h}}_1])$:
the forward state at the true last position and the backward state at position 0, which `h_n` of a
packed GRU holds exactly. The decoder is an `nn.GRUCell` stepped in a Python loop.

With attention the cell's input is `[embedding; context]` and the output layer reads `[s; context]`,
as in [Section 11](#s11). The additive score is
$e_j = \mathbf{v}_a^\top\tanh(\mathbf{W}_a\mathbf{s} + \mathbf{U}_a\mathbf{h}_j)$; the product
$\mathbf{U}_a\mathbf{h}_j$ is computed once per source, padded positions get score $-10^9$ so the
softmax gives them exactly zero weight, and the context is the weighted sum of annotations.
$\mathbf{W}_a$, $\mathbf{U}_a$ and $\mathbf{v}_a$ are created only when attention is on.

The class has two methods the later steps reuse: `encode`, which runs once per source, and `step`,
which advances the decoder by one token and also returns the attention weights (all zeros when
attention is off). The `pack` argument exists for the optional cell at the end of the lab.

```python
class Seq2Seq(nn.Module):
    def __init__(self, attention, pack=True, emb=32, hid=64, att=64):
        super().__init__()
        self.attention, self.pack, self.hid = attention, pack, hid
        self.src_emb = nn.Embedding(V, emb)
        self.tgt_emb = nn.Embedding(V, emb)
        self.enc = nn.GRU(emb, hid, batch_first=True, bidirectional=True)
        self.init_state = nn.Linear(2 * hid, hid)
        ctx = 2 * hid if attention else 0           # context vector width
        self.cell = nn.GRUCell(emb + ctx, hid)
        self.out = nn.Linear(hid + ctx, V)
        if attention:
            self.W_a = nn.Linear(hid, att, bias=False)
            self.U_a = nn.Linear(2 * hid, att, bias=False)
            self.v_a = nn.Linear(att, 1, bias=False)

    def encode(self, src, lens):
        e = self.src_emb(src)
        if self.pack:
            packed = pack_padded_sequence(e, lens, batch_first=True, enforce_sorted=False)
            out, h_n = self.enc(packed)
            H, _ = pad_packed_sequence(out, batch_first=True, total_length=src.shape[1])
        else:
            H, h_n = self.enc(e)                    # reads the padding too
        mask = torch.arange(H.shape[1])[None, :] < lens[:, None]      # True on real digits
        s0 = torch.tanh(self.init_state(torch.cat([h_n[0], h_n[1]], dim=-1)))
        UaH = self.U_a(H) if self.attention else None   # precomputed once per source
        return H, UaH, mask, s0

    def step(self, s, y_prev, H, UaH, mask):
        """One decoder step: previous state and token -> logits, new state, weights."""
        x = self.tgt_emb(y_prev)
        if self.attention:
            scores = self.v_a(torch.tanh(self.W_a(s)[:, None, :] + UaH)).squeeze(-1)
            scores = scores.masked_fill(~mask, -1e9)          # padded positions: weight 0
            alpha = torch.softmax(scores, dim=-1)             # (batch, S)
            ctx = torch.bmm(alpha[:, None, :], H).squeeze(1)  # (batch, 2*hid)
            s = self.cell(torch.cat([x, ctx], dim=-1), s)
            logits = self.out(torch.cat([s, ctx], dim=-1))
        else:
            alpha = torch.zeros(s.shape[0], H.shape[1])
            s = self.cell(x, s)
            logits = self.out(s)
        return logits, s, alpha

    def forward(self, src, dec_in, lens):
        """Teacher forcing: the decoder reads the true previous token at every step."""
        H, UaH, mask, s = self.encode(src, lens)
        all_logits = []
        for t in range(dec_in.shape[1]):
            logits, s, _ = self.step(s, dec_in[:, t], H, UaH, mask)
            all_logits.append(logits)
        return torch.stack(all_logits, dim=1)               # (batch, 13, V)

    @torch.no_grad()
    def greedy(self, src, lens, steps=MAX_LEN + 1):
        """Free-running: the decoder reads its own previous argmax."""
        H, UaH, mask, s = self.encode(src, lens)
        y = torch.full((src.shape[0],), BOS, dtype=torch.long)
        toks, alphas = [], []
        for _ in range(steps):
            logits, s, alpha = self.step(s, y, H, UaH, mask)
            y = logits.argmax(dim=-1)
            toks.append(y)
            alphas.append(alpha)
        return torch.stack(toks, dim=1), torch.stack(alphas, dim=1)

def count(model):
    return sum(p.numel() for p in model.parameters())

print("without attention:", f"{count(Seq2Seq(False)):,}", "parameters")
print("with attention:   ", f"{count(Seq2Seq(True)):,}", "parameters")
```

```output
without attention: 66,381 parameters
with attention:    104,973 parameters
```

The attention model has about 38,600 more parameters. Only 12,352 of them are the attention network
itself ($64\times64 + 128\times64 + 64$); the rest come from the decoder cell and the output layer
becoming wider, because both now also read the 128-wide context. Counting by hand is a good check
that the architecture is the one you meant to build: the decoder `GRUCell(32, 64)` has
$3\cdot64\cdot32 + 3\cdot64\cdot64 + 2\cdot3\cdot64 = 18{,}816$ parameters, and `GRUCell(160, 64)`
has 43,392.

### Step 3: Train both models with teacher forcing

Cross-entropy over the target positions, ignoring `PAD`; Adam at $3\times10^{-3}$; gradient norm
clipped at 1; batch 64; a fresh random batch of lengths 3 to 12 at every step, so there is no
finite training set to overfit. Both models start from `torch.manual_seed(0)` and see the same
batches (the data generator is seeded identically). The printed loss is the mean over the last 50
steps.

```python
def train(model, steps, seed=0):
    torch.manual_seed(seed)
    data_rng = np.random.default_rng(seed)
    opt = torch.optim.Adam(model.parameters(), lr=3e-3)
    recent = []
    for step in range(1, steps + 1):
        src, dec_in, tgt, lens = make_batch(64, data_rng, 3, 12)
        logits = model(src, dec_in, lens)
        loss = F.cross_entropy(logits.reshape(-1, V), tgt.reshape(-1), ignore_index=PAD)
        opt.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
        recent.append(loss.item())
        if step % (steps // 3) == 0:
            print(f"  step {step:4d}  loss {np.mean(recent[-50:]):.4f}")

torch.manual_seed(0)
plain = Seq2Seq(attention=False)
print("without attention")
train(plain, STEPS)
torch.manual_seed(0)
attn = Seq2Seq(attention=True)
print("with attention")
train(attn, STEPS)
```

```output
without attention
  step  500  loss 0.5832
  step 1000  loss 0.4171
  step 1500  loss 0.3391
with attention
  step  500  loss 0.0180
  step 1000  loss 0.0061
  step 1500  loss 0.0001
```

The loss is a mean over real target tokens, in nats. The model with attention is below 0.02 by step
500 and is essentially done. The model without it is still at about 0.34 after 1,500 steps: it gets
some digits right and makes mistakes elsewhere in the string, which the next step quantifies.

### Step 4: Accuracy against length, teacher-forced and free-running

Three numbers per model and per length, on 500 fresh strings each of length 4, 8 and 12:

- **sequence accuracy**: every digit and the `EOS` correct, decoding greedily on the model's own
  outputs (the only number that matters in deployment);
- **teacher-forced token accuracy**: each step is given the *true* previous token, as in training;
- **free-running token accuracy**: each step is given the model's own previous output.

Token accuracy counts the $L+1$ real target positions, `EOS` included. The gap between the last
two is exposure bias.

```python
@torch.no_grad()
def evaluate(model, length, n=500, seed=123):
    rng = np.random.default_rng(seed + length)
    src, dec_in, tgt, lens = make_batch(n, rng, length, length)
    real = tgt != PAD                                          # the L+1 real positions
    forced = model(src, dec_in, lens).argmax(-1)
    free, _ = model.greedy(src, lens)
    tf_acc = ((forced == tgt) & real).sum().item() / real.sum().item()
    fr_acc = ((free == tgt) & real).sum().item() / real.sum().item()
    seq_acc = (((free == tgt) | ~real).all(dim=1)).float().mean().item()
    return seq_acc, tf_acc, fr_acc

results = {}
print("model         length  sequence  teacher-forced  free-running")
for name, model in [("no attention", plain), ("attention", attn)]:
    model.eval()
    for length in (4, 8, 12):
        seq_acc, tf_acc, fr_acc = evaluate(model, length)
        results[(name, length)] = seq_acc
        print(f"{name:12s} {length:6d}  {100*seq_acc:7.1f}%  {100*tf_acc:13.1f}%  {100*fr_acc:11.1f}%")
```

```output
model         length  sequence  teacher-forced  free-running
no attention      4     99.2%           99.8%         99.7%
no attention      8     35.6%           90.6%         78.2%
no attention     12      0.8%           73.0%         51.1%
attention         4    100.0%          100.0%        100.0%
attention         8    100.0%          100.0%        100.0%
attention        12    100.0%          100.0%        100.0%
```

Three observations, each one a claim of the text that you can now check.

1. **The bottleneck.** Without attention, sequence accuracy collapses with length: about 99% at
   length 4, 36% at length 8 and 1% at length 12 in this run. One vector of 64 numbers has to carry
   up to 12 digits in order, and a 64-dimensional state trained by gradient descent in 1,500
   updates does not. Most of the damage is at the far end of the string: token accuracy is 91%
   (teacher-forced) at length 8 and 73% at length 12, so the model gets many digits right and almost
   never all of them.
2. **Exposure bias.** Without attention the free-running token accuracy is below the
   teacher-forced one, and the gap widens with length: none worth the name at length 4, 12 points
   at length 8 (90.6% against 78.2%) and 22 points at length 12 (73.0% against 51.1%). A wrong
   digit pushes the decoder into a state it never saw in training, and the following predictions
   suffer.
3. **Attention removes both problems.** With it, accuracy is 100% at every length in both
   modes, so there is no gap to find: the decoder can read the digit it needs, and the errors that
   start the compounding do not occur.

### Step 5: Beam search against greedy

Can better search rescue the bottleneck model? The beam search below follows
[Section 10](#s10): keep the $k = 4$ best partial sequences by cumulative log-probability, set
aside a hypothesis when it emits `EOS`, continue with the rest, and stop when no hypothesis is
left or after 13 steps. It processes one example at a time. It is run on 200 strings of length 12
and compared with greedy on the same strings.

```python
@torch.no_grad()
def beam_search(model, src, lens, k=4, steps=MAX_LEN + 1):
    """Beam search for one example (src has shape (1, S)); returns the best token list."""
    H, UaH, mask, s0 = model.encode(src, lens)
    beams = [(0.0, [], s0)]                        # (cumulative log-prob, tokens, state)
    finished = []
    for _ in range(steps):
        cands = []
        for score, toks, s in beams:
            y = torch.tensor([toks[-1] if toks else BOS])
            logits, s_new, _ = model.step(s, y, H, UaH, mask)
            logp = torch.log_softmax(logits, dim=-1)[0]
            top_lp, top_tok = logp.topk(k)
            for lp, tok in zip(top_lp.tolist(), top_tok.tolist()):
                cands.append((score + lp, toks + [tok], s_new))
        cands.sort(key=lambda c: c[0], reverse=True)
        beams = []
        for cand in cands[:k]:
            (finished if cand[1][-1] == EOS else beams).append(cand)
        if not beams:
            break
    pool = finished if finished else beams
    return max(pool, key=lambda c: c[0])[1]

rng = np.random.default_rng(7)
src, dec_in, tgt, lens = make_batch(200, rng, 12, 12)
plain.eval()
greedy_toks, _ = plain.greedy(src, lens)
greedy_ok = beam_ok = greedy_tok = beam_tok = 0
for i in range(200):
    want = tgt[i].tolist()                         # 12 reversed digits, then EOS
    g = greedy_toks[i, :13].tolist()
    b = beam_search(plain, src[i:i + 1], lens[i:i + 1])
    b = b + [PAD] * (13 - len(b))                  # a hypothesis that stopped early
    greedy_ok += g == want
    beam_ok += b == want
    greedy_tok += sum(x == y for x, y in zip(g, want))
    beam_tok += sum(x == y for x, y in zip(b, want))
print(f"greedy   {greedy_ok:3d}/200 correct strings, token accuracy {100 * greedy_tok / 2600:.1f}%")
print(f"beam k=4 {beam_ok:3d}/200 correct strings, token accuracy {100 * beam_tok / 2600:.1f}%")
```

```output
greedy     0/200 correct strings, token accuracy 51.8%
beam k=4   0/200 correct strings, token accuracy 52.5%
```

Beam search changes almost nothing: no string out of 200 is right under either method, and token
accuracy moves from 51.8% to 52.5%. (Greedy decoding gives 51.8% here against the free-running
51.1% of Step 4 because this is a different set of 200 strings.) The model without attention does
not know the answer, and no search over its outputs can supply information it never received. Search helps when the model's
distribution is right but its greedy path is unlucky, as in the toy example of
[Section 10](#s10); it cannot repair a distribution that is wrong.

### Step 6: Read the alignment

The attention weights are the model's account of where it looked, subject to the caveat of
[Section 11](#s11). Decode one 8-digit string with the attention model, stack the weight vectors
into a $9\times8$ matrix (rows: the output steps, including `EOS`; columns: source positions) and
plot it with the digits as tick labels. Because the source was padded to 12, the weights are
sliced to the 8 real positions; the padded ones are exactly zero by construction, which the last
print confirms. The right panel plots the sequence accuracies of Step 4.

```python
attn.eval()
rng = np.random.default_rng(11)
src, dec_in, tgt, lens = make_batch(1, rng, 8, 8)
toks, alphas = attn.greedy(src, lens)
A = alphas[0, :9, :8].numpy()                      # rows: 8 digits + EOS; columns: source
digits = src[0, :8].tolist()
print("source :", digits)
print("output :", toks[0, :9].tolist(), "(12 = EOS)")
print("argmax of each row:", A.argmax(axis=1).tolist())
print("peak weights:      ", [f"{w:.2f}" for w in A.max(axis=1)])
print("weight on padding: ", f"{alphas[0, :9, 8:].sum().item():.6f}")

fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))
im = axes[0].imshow(A, cmap="viridis", vmin=0, vmax=1)
axes[0].set_xticks(range(8))
axes[0].set_xticklabels(digits)
axes[0].set_yticks(range(9))
axes[0].set_yticklabels([str(t) if t != EOS else "EOS" for t in toks[0, :9].tolist()])
axes[0].set_xlabel("source digit (position left to right)")
axes[0].set_ylabel("output token (step top to bottom)")
axes[0].set_title("Attention weights for an 8-digit reversal")
fig.colorbar(im, ax=axes[0], label="weight")

width = 0.38
lengths = (4, 8, 12)
for off, name in [(-width / 2, "no attention"), (width / 2, "attention")]:
    axes[1].bar(np.arange(3) + off, [100 * results[(name, L)] for L in lengths],
                width, label=name)
axes[1].set_xticks(range(3))
axes[1].set_xticklabels([f"length {L}" for L in lengths])
axes[1].set_ylabel("sequence accuracy (%)")
axes[1].set_title("Whole-string accuracy, greedy decoding")
axes[1].legend()
plt.tight_layout()
plt.show()
```

```output
source : [1, 1, 7, 4, 5, 6, 7, 0]
output : [0, 7, 6, 5, 4, 7, 1, 1, 12] (12 = EOS)
argmax of each row: [7, 6, 5, 4, 3, 2, 1, 0, 0]
peak weights:       ['0.74', '0.72', '0.72', '0.81', '0.74', '0.79', '0.65', '0.83', '0.25']
weight on padding:  0.000000
```

The alignment is the anti-diagonal: to emit the first output digit the decoder looks at the last
source digit, then at the one before, and so on, and at the first position when it emits `EOS`. The
model was never told this; the only signal was the cross-entropy of the output. The peak
weights on the eight digit rows are between 0.65 and 0.83; the `EOS` row is the least sure, with a
peak of 0.25 on position 0, which is the position the last digit came from. A bright anti-diagonal
is what a correct solution of this task looks like.

### Step 7 (optional): The packing bug, reproduced on purpose

[Section 7](#s7) warned that a bidirectional encoder on unpacked, padded input behaves differently
from one on unpadded input. Here is the failure. Train an attention model with `pack=False` on the
padded batches (with fewer steps), then test it on strings of length 4 in two ways: padded to 12
as in training, and cut to their true width of 4. The packed model, trained identically, is tested
the same way.

```python
def width_test(model, length, padded, n=500):
    rng = np.random.default_rng(900 + length)
    src, _, tgt, lens = make_batch(n, rng, length, length)
    if not padded:
        src = src[:, :length]                      # the real digits only, no padding
    free, _ = model.greedy(src, lens)
    real = tgt != PAD
    return (((free == tgt) | ~real).all(dim=1)).float().mean().item()

bug_steps = 400 if QUICK else 800
torch.manual_seed(0)
unpacked = Seq2Seq(attention=True, pack=False)
print("unpacked encoder")
train(unpacked, bug_steps)
torch.manual_seed(0)
packed = Seq2Seq(attention=True, pack=True)
print("packed encoder")
train(packed, bug_steps)
for name, model in [("unpacked", unpacked), ("packed", packed)]:
    model.eval()
    print(f"{name:9s} length 4: padded to 12 {100 * width_test(model, 4, True):5.1f}%"
          f"   cut to 4 {100 * width_test(model, 4, False):5.1f}%")
```

```output
unpacked encoder
  step  266  loss 0.0250
  step  532  loss 0.0108
  step  798  loss 0.0042
packed encoder
  step  266  loss 0.0206
  step  532  loss 0.0099
  step  798  loss 0.0065
unpacked  length 4: padded to 12 100.0%   cut to 4   0.0%
packed    length 4: padded to 12 100.0%   cut to 4 100.0%
```

The unpacked encoder learned to read padding tokens before it reached the first digit; shown a string
without that padding, its backward states are ones it never produced in training, and it fails.
The packed encoder starts the backward direction at the true last digit whatever surrounds it, so
its answer does not depend on how the batch was padded. In practice the lesson is: whichever way
you pad, test exactly the way you trained, and pack whenever a layer reads backwards.

### What you should see

- **Parameters.** 66,381 without attention and 104,973 with; the attention network proper is
  12,352 of the difference.
- **Training.** The attention model's loss is near zero within a few hundred steps; the model
  without attention stays far above it after 1,500 steps.
- **The bottleneck.** Without attention, sequence accuracy is about 99% at length 4, 36% at
  length 8 and 1% at length 12. With attention it is 100% at all three. (The numbers of this run;
  another seed moves the middle one by several points.)
- **Exposure bias.** Without attention, free-running token accuracy trails teacher-forced token
  accuracy, by 0.1 points at length 4, 12 at length 8 and 22 at length 12. With attention both are
  at 100%.
- **Search.** Beam search with $k = 4$ leaves the bottleneck model at 0 correct strings out of
  200 at length 12, with token accuracy 51.8% against 52.5%: search cannot supply what the model
  does not know.
- **Alignment.** Row $t$ of the heat map peaks at source position $7 - t$ (and at position 0 for
  `EOS`), with peak weights of 0.65 to 0.83 on the digit rows.
- **The bug.** The unpacked model is accurate on strings padded as in training and fails on
  strings cut to their true width; the packed model handles both.

Exact digits depend on the seed and on the BLAS library in use, and the last digit of any
percentage may differ on your machine. The pattern should not.

### Try this

1. **Scheduled sampling.** In `forward`, feed the model's own previous argmax instead of the true
   token with a probability that rises linearly from 0 to 0.5 over training. Compare the
   free-running accuracy of the model without attention with the table above. Which of the two
   columns moves, and does the gap close?
2. **A different score.** Replace the additive score with Luong's dot product: project the 128-wide
   annotations to 64 with a linear layer, and score each with $\mathbf{s}^\top\mathbf{h}_j$.
   Compare the training loss at steps 500, 1,000 and 1,500.
3. **Beyond the training lengths.** Test the attention model on lengths 13 to 16, never seen in
   training (the source width and `MAX_LEN` must grow with them). Where does the anti-diagonal
   break, and what does the model have to know to extend it?
4. **A non-monotonic alignment.** Generate date pairs with Python's `datetime` (`'14 March 2026'`
   to `'2026-03-14'`), as characters, and train the attention model on them. The alignment is no
   longer an anti-diagonal: it is a set of blocks that jump between the three fields.

## Lab 5 — A diagonal linear recurrence versus an LSTM {#lab5}

**Goal.** Implement a diagonal complex linear recurrence in the style of the Linear Recurrent Unit
([Section 13](#s13)), confirm that its recurrent form and its convolutional form compute the same
map, time both, and then compare the recurrence with a vanilla RNN and an LSTM on a recall task
at long lags. You see a memory length that is set by the eigenvalue moduli at initialisation, and
how much work an LSTM's forget bias has to do to match it. Everything is synthetic; nothing is
downloaded.

### Step 1: The layer

The layer has $N = 64$ complex modes. Each has an eigenvalue
$\lambda_n = \exp(-e^{\nu_n} + i e^{\vartheta_n})$ with $\nu_n$ and $\vartheta_n$ real parameters
(`nu_log` and `theta_log` in the code), so $|\lambda_n| = \exp(-e^{\nu_n}) < 1$ for every value of
the parameters: the recurrence cannot be made unstable by a gradient step. At initialisation the
moduli are drawn uniformly on the ring $[r_{\min}, r_{\max}] = [0.9, 0.999]$ (uniformly in $|\lambda|^2$)
and the phases uniformly in $[0, \pi/10]$. For the moduli: if $u\sim U(0,1)$ then
$|\lambda|^2 = u(r_{\max}^2 - r_{\min}^2) + r_{\min}^2$, and $\nu = \ln(-\tfrac12\ln|\lambda|^2)$
follows from $|\lambda| = e^{-e^\nu}$; the code does exactly that.

With a batch dimension named `batch` and the input matrix named `B_in` (the symbol $B$ is the
batch size elsewhere in the module), the layer computes

$$h_t = \lambda \odot h_{t-1} + \gamma \odot (\mathbf{B}_\text{in} x_t), \qquad
y_t = \operatorname{Re}(\mathbf{C} h_t) + \mathbf{D} x_t, \qquad
\gamma = \sqrt{1 - |\lambda|^2},$$

where $\gamma$ normalises each mode so that its state keeps unit variance on white input
([Section 13](#s13)). It has two forward functions that must agree.

- `forward_loop` is the recurrence, one step at a time: constant memory, the form for generation.
- `forward` is the convolution. Unrolling gives $h_t = \sum_{k\ge0}\lambda^k\,\gamma\mathbf{B}_\text{in}x_{t-k}$,
  so each of the $N$ modes is a causal convolution of its drive $u_t = \gamma\mathbf{B}_\text{in}x_t$
  with the kernel $(\lambda^0, \lambda^1, \dots, \lambda^{T-1})$. The FFT turns that convolution
  into a product; padding both to length $2T$ avoids the circular wrap-around, and the first $T$
  outputs are the causal ones.

Both functions share the drive $u$ so that the timing compares only the two ways of mixing time.

```python
import time
import math
import numpy as np
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

np.random.seed(0)
torch.manual_seed(0)

class DiagLinearRecurrence(nn.Module):
    """Diagonal complex linear recurrence (Linear Recurrent Unit style), batch-first."""
    def __init__(self, d_in, d_out, N=64, r_min=0.9, r_max=0.999, max_phase=math.pi / 10):
        super().__init__()
        u = torch.rand(N)                                     # modulus, uniform in |lambda|^2
        self.nu_log = nn.Parameter(torch.log(-0.5 * torch.log(
            u * (r_max ** 2 - r_min ** 2) + r_min ** 2)))
        self.theta_log = nn.Parameter(torch.log(max_phase * torch.rand(N)))   # phase
        self.B_re = nn.Parameter(torch.randn(N, d_in) / math.sqrt(2 * d_in))
        self.B_im = nn.Parameter(torch.randn(N, d_in) / math.sqrt(2 * d_in))
        self.C_re = nn.Parameter(torch.randn(d_out, N) / math.sqrt(N))
        self.C_im = nn.Parameter(torch.randn(d_out, N) / math.sqrt(N))
        self.D = nn.Parameter(torch.randn(d_out, d_in) / math.sqrt(d_in))

    def log_lambda(self):
        return torch.complex(-torch.exp(self.nu_log), torch.exp(self.theta_log))

    def drive(self, x):
        """u_t = gamma * (B_in x_t), shape (batch, T, N), complex."""
        lam_abs = torch.exp(-torch.exp(self.nu_log))
        gamma = torch.sqrt(1.0 - lam_abs ** 2)
        B_in = torch.complex(self.B_re, self.B_im) * gamma[:, None]
        return x.to(torch.complex64) @ B_in.T

    def readout(self, h, x):
        C = torch.complex(self.C_re, self.C_im)
        return (h @ C.T).real + x @ self.D.T

    def forward_loop(self, x):
        u, lam = self.drive(x), torch.exp(self.log_lambda())
        h = torch.zeros(u.shape[0], u.shape[2], dtype=torch.complex64)
        states = []
        for t in range(u.shape[1]):
            h = lam * h + u[:, t]                        # the recurrence
            states.append(h)
        return self.readout(torch.stack(states, dim=1), x)

    def forward(self, x):
        u, T = self.drive(x), x.shape[1]
        k = torch.arange(T, dtype=torch.float32)[:, None]
        kernel = torch.exp(k * self.log_lambda()[None, :])        # lambda^k, (T, N)
        h = torch.fft.ifft(torch.fft.fft(u, n=2 * T, dim=1)
                           * torch.fft.fft(kernel, n=2 * T, dim=0)[None], dim=1)[:, :T]
        return self.readout(h, x)

torch.manual_seed(0)                                   # first draw is torch.rand(64)
layer = DiagLinearRecurrence(d_in=4, d_out=3, N=64)
lam_abs = torch.exp(-torch.exp(layer.nu_log)).detach()
half_life = math.log(0.5) / torch.log(lam_abs)
print("parameters:", sum(p.numel() for p in layer.parameters()))
print(f"|lambda| range: {lam_abs.min():.6f} to {lam_abs.max():.6f}")
print(f"half-lives (steps): {half_life.min():.1f} to {half_life.max():.1f}")
```

```output
parameters: 1036
|lambda| range: 0.902329 to 0.998724
half-lives (steps): 6.7 to 542.8
```

The moduli of the 64 modes span 0.902–0.9987, so the layer starts out with memories whose
half-life, $\ln 0.5/\ln|\lambda|$, ranges from a handful of steps to several hundred. The ring's
endpoints would give 6.6 and 693 steps; 64 random draws do not reach the endpoints. The moduli are
printed to six decimals on purpose: near the unit circle the half-life depends on the fifth
decimal (0.9987 gives 533 steps, 0.998724 gives 543). Here the memory is set by a number you can
read, before any training.

### Step 2: One map, two algorithms

Test the claim of [Section 13](#s13): the loop and the FFT convolution are the same linear
time-invariant system. For $T = 256$, 1,024 and 4,096 (batch 8, 4 input channels, 3 outputs), print
the largest difference between the two outputs and the best of three wall-clock times for each,
with gradients off.

```python
def best_of(fn, repeats=3):
    times = []
    for _ in range(repeats):
        t0 = time.perf_counter()
        fn()
        times.append(time.perf_counter() - t0)
    return min(times) * 1e3                            # milliseconds

Ts, t_loop, t_fft = [256, 1024, 4096], [], []
print("   T   max|loop - fft|   loop ms   fft ms   speed-up")
with torch.no_grad():
    for T in Ts:
        x = torch.randn(8, T, 4)
        y_loop, y_fft = layer.forward_loop(x), layer(x)
        err = (y_loop - y_fft).abs().max().item()
        t_loop.append(best_of(lambda: layer.forward_loop(x)))
        t_fft.append(best_of(lambda: layer(x)))
        print(f"{T:5d}   {err:13.2e}   {t_loop[-1]:8.1f}  {t_fft[-1]:7.1f}   "
              f"{t_loop[-1] / t_fft[-1]:6.1f}x")

plt.figure(figsize=(5.5, 4))
plt.loglog(Ts, t_loop, "o-", label="recurrent loop")
plt.loglog(Ts, t_fft, "s-", label="FFT convolution")
plt.xlabel("sequence length T")
plt.ylabel("time per forward pass (ms)")
plt.title("One linear recurrence, two algorithms (CPU)")
plt.legend()
plt.grid(True, which="both", alpha=0.3)
plt.tight_layout()
plt.show()
```

```output
   T   max|loop - fft|   loop ms   fft ms   speed-up
  256        3.58e-06        1.3      0.4      2.9x
 1024        1.35e-05        5.0      2.1      2.4x
 4096        1.48e-05       20.3     17.7      1.1x
```

The two outputs agree to float32 round-off, of the order of $10^{-5}$ on outputs of order 1, a
little larger at longer $T$ because the kernel $\lambda^k$ is evaluated in float32 and its phase
error grows with $k$: this is one function computed two ways, not two approximations of each other.
The loop costs $T$ sequential steps, so its time grows linearly with $T$. The honest finding on a
CPU is that the FFT form is only modestly faster, and that the advantage shrinks as $T$ grows:
over repeated runs it was 2.5 to 5 times faster at $T = 256$ and only 1.1 to 1.4 times faster at
$T = 4{,}096$. That is
no contradiction. The FFT does $O(T\log T)$ work with a large constant (three transforms of length
$2T$ for each of the 64 modes), the loop does $O(T)$ small operations, and a CPU with a few cores
has little parallelism for the FFT form to exploit. The convolution form pays off where the
parallelism exists: on a GPU, where the loop's tiny sequential steps leave the hardware idle and the
transforms fill it, and in training, where the whole sequence's gradient is wanted at once. The loop
remains the right form at generation time, because it needs a state of $N$ numbers per channel and
constant work per token. Timings depend on the machine and on what else it is running; expect the
same ordering and different numbers.

### Step 3: A recall task that needs a long memory

**Delayed recall.** A sequence has length $L+1$. Its first token is one of 8 symbols (0–7); the
other $L$ tokens are a blank (token 8). The target is the first symbol, read at the last step. Chance
is 12.5%. A model succeeds only if information about token 0 survives $L$ steps, and both the
forward signal and the gradient need that survival ([Section 4](#s4)). There is nothing else to
learn, which makes the task a clean measure of memory reach. $L$ is the lag.

Four models, each an `Embedding(9, 16)`, a recurrent core of width 64, and a read-out from the last
step:

1. `nn.RNN(16, 64)`, a vanilla tanh network;
2. `nn.LSTM(16, 64)` with forget-gate bias 1 (half-life 2.2 steps at initialisation);
3. the same with forget-gate bias 5 (half-life 103 steps; the table in [Section 5](#s5));
4. `DiagLinearRecurrence(16, 64, N=64)`, then GELU and `Linear(64, 8)`.

The forget-bias slices are `bias_ih_l0[H:2*H]` and `bias_hh_l0[H:2*H]`, as in
[Section 5](#s5): set the first to the value and zero the second so that the two add to the value.

```python
class Recall(nn.Module):
    def __init__(self, kind, forget_bias=1.0):
        super().__init__()
        self.kind = kind
        self.emb = nn.Embedding(9, 16)
        if kind == "rnn":
            self.core, self.head = nn.RNN(16, 64, batch_first=True), nn.Linear(64, 8)
        elif kind == "lstm":
            self.core, self.head = nn.LSTM(16, 64, batch_first=True), nn.Linear(64, 8)
            H = 64
            with torch.no_grad():
                self.core.bias_ih_l0[H:2 * H].fill_(forget_bias)
                self.core.bias_hh_l0[H:2 * H].zero_()
        else:
            self.core = DiagLinearRecurrence(16, 64, N=64)
            self.head = nn.Sequential(nn.GELU(), nn.Linear(64, 8))

    def forward(self, tokens):
        e = self.emb(tokens)
        out = self.core(e) if self.kind == "lin" else self.core(e)[0]
        return self.head(out[:, -1])                   # predict from the last step

def recall_batch(batch, lag, gen):
    first = torch.randint(0, 8, (batch,), generator=gen)
    x = torch.full((batch, lag + 1), 8, dtype=torch.long)    # 8 is the blank
    x[:, 0] = first
    return x, first

def run_recall(kind, lag, forget_bias=1.0, updates=400, seed=0):
    torch.manual_seed(seed)
    model = Recall(kind, forget_bias)
    gen = torch.Generator().manual_seed(seed + 1)
    opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
    losses, solved = [], None
    for update in range(1, updates + 1):
        x, y = recall_batch(64, lag, gen)
        loss = nn.functional.cross_entropy(model(x), y)
        opt.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
        losses.append(loss.item())
        if solved is None and update >= 10 and np.mean(losses[-10:]) < 0.05:
            solved = update
    test_gen = torch.Generator().manual_seed(12345)
    x, y = recall_batch(1000, lag, test_gen)
    with torch.no_grad():
        acc = (model(x).argmax(-1) == y).float().mean().item()
    return acc, solved, losses

x, y = recall_batch(2, 5, torch.Generator().manual_seed(0))
print(x.tolist(), "->", y.tolist())
print("untrained LSTM output shape:", tuple(Recall("lstm")(x).shape))
```

```output
[[4, 8, 8, 8, 8, 8], [7, 8, 8, 8, 8, 8]] -> [4, 7]
untrained LSTM output shape: (2, 8)
```

### Step 4: Train, at three lags

Each model trains for 400 updates (batch 64, AdamW at $3\times10^{-3}$, gradient norm clipped at 1)
at lags 25, 100 and 200. The vanilla RNN is run only at 25 and 100: it is slow at 200 and already
fails at 100. The table reports the test accuracy on 1,000 fresh sequences and the first update at
which the mean loss over the last 10 updates fell below 0.05 (a dash if that never happened).
Chance accuracy is 12.5%, and the initial loss is near $\ln 8 = 2.08$.

```python
configs = [("vanilla RNN", "rnn", 0.0), ("LSTM, forget bias 1", "lstm", 1.0),
           ("LSTM, forget bias 5", "lstm", 5.0), ("diagonal linear", "lin", 0.0)]
lags = [25, 100, 200]
table, curves = {}, {}
print(f"{'model':21s}" + "".join(f"  lag {L:<3d}: acc  solved" for L in lags))
for name, kind, fb in configs:
    row = f"{name:21s}"
    for lag in lags:
        if kind == "rnn" and lag == 200:
            row += f"  {'skipped':>10s}  {'':>6s}"
            continue
        acc, solved, losses = run_recall(kind, lag, fb)
        table[(name, lag)], curves[(name, lag)] = (acc, solved), losses
        row += f"  {100 * acc:9.1f}%  {str(solved) if solved else '-':>6s}"
    print(row)
```

```output
model                  lag 25 : acc  solved  lag 100: acc  solved  lag 200: acc  solved
vanilla RNN                 63.3%       -       75.1%       -     skipped
LSTM, forget bias 1         11.8%       -       11.8%       -       11.8%       -
LSTM, forget bias 5        100.0%      74       12.6%       -       12.6%       -
diagonal linear            100.0%     124      100.0%     238      100.0%       -
```

Each entry comes from one training run, from `torch.manual_seed(0)`. A different seed can change
which cell in the table succeeds, above all at the edge of a model's reach: an LSTM with forget
bias 5 learned lag 100 on one of three seeds, and the vanilla RNN's partial scores move by tens of
points. Read the table for its pattern, not for any single cell. The pattern: a memory that is
set by a gate bias or by the eigenvalue moduli at initialisation reaches as far as that setting
allows within the budget, and a model that starts with a short memory (the vanilla RNN, the LSTM
with bias 1) does not find its way to a long one in 400 updates. A dash in the "solved" column
means the mean loss never fell below 0.05, which can happen at 100% test accuracy when the
logits are right but not yet confident.

### Step 5: Look at the learning curves

The accuracy table hides how training went. Plot the loss of every model at lag 100: a model that
succeeds shows a plateau at $\ln 8 = 2.08$ followed by a drop, and a model that fails stays on the
plateau. The length of the plateau is the time spent finding a gradient to follow.

```python
plt.figure(figsize=(7, 4.2))
for name, _, _ in configs:
    if (name, 100) in curves:
        k = 10                                         # smooth over 10 updates
        smooth = np.convolve(curves[(name, 100)], np.ones(k) / k, mode="valid")
        plt.plot(np.arange(k, len(smooth) + k), smooth, label=name)
plt.axhline(math.log(8), color="grey", linestyle=":", label="chance (ln 8)")
plt.xlabel("update")
plt.ylabel("cross-entropy loss (mean of 10 updates)")
plt.title("Delayed recall at lag 100")
plt.legend()
plt.grid(alpha=0.3)
plt.tight_layout()
plt.show()
```

### What you should see

- **Equality.** The loop and the FFT convolution agree to a few parts in $10^{6}$ to $10^{5}$ in
  float32.
- **Speed.** On a CPU the FFT form is faster than the loop at every length but only modestly, and
  the advantage shrinks as $T$ grows (several times at $T = 256$, 1.1 to 1.4 times at $T = 4{,}096$ over repeated runs; the timings are noisy). The case for
  convolution mode is parallelism, which a GPU supplies.
- **Memory by initialisation.** The 64 moduli span 0.902–0.998724, with half-lives of about 6.7 to
  543 steps. That range, not anything learned, is why the linear recurrence can reach the first
  token.
- **Recall.** After 400 updates the linear recurrence reaches 100% at all three lags (seeds 0, 1
  and 2 all agree on the accuracy; the update at which the loss first drops below 0.05 varies, and
  at lag 200 it is within the budget on one seed of the three). The vanilla RNN learns lag 25 only
  partly (63–87% over three seeds) and is erratic at lag 100 (11–75%). The LSTM with forget bias 1
  stays at chance even at lag 25. The LSTM with forget bias 5 is the fastest learner at lag 25
  (100% after 56–75 updates on all three seeds), learns lag 100 on one seed of three, and is at
  chance at lag 200. Seeds 1 and 2 were run once, when this lab was prepared, with
  `run_recall(..., seed=1)` and `seed=2`; try them.
- **What this does and does not show.** It shows trainability within a budget: a memory length set
  directly at initialisation against one that the LSTM has to find through a gate bias. It does not
  show that an LSTM cannot hold a long memory; with a longer budget, chrono initialisation
  ([Section 5](#s5)) or a larger bias it can in principle.

The numbers in the table come from the run on your machine; the last digits, and the update counts
in particular, vary with the library version.

### Try this

1. **Distractors.** Replace the blanks with random tokens from a separate set of 8 distractor
   symbols. The linear recurrence still learns lags 25 and 100 in a trial run: its embedding learns to map the
   distractors near zero, a filter on content at the input. Selectivity matters when what to keep
   depends on context. Build the selective-copying variant, in which the symbol to recall is the one
   that follows a marker token at a random position, and compare the models.
2. **A parallel scan.** Compute the recurrence with the associative operator
   $(a_1, b_1)$ then $(a_2, b_2) \mapsto (a_1a_2,\ a_2b_1 + b_2)$ in $\log_2 T$ rounds, and check it
   against `forward_loop`.
3. **The initial ring is the memory.** Narrow the ring to $[0.9, 0.95]$ and rerun lags 100 and 200.
   Predict first which will fail: the half-life of $|\lambda| = 0.95$ is 13.5 steps.
4. **A minimal selective recurrence.** Make the step depend on the input,
   $\lambda_t = \exp(\Delta_t\log\lambda)$ with $\Delta_t = \operatorname{softplus}(\mathbf{w}^\top x_t + c)$,
   and compute it with the loop. On the distractor task of item 1, does it learn to ignore the
   distractors without help from the embedding?
