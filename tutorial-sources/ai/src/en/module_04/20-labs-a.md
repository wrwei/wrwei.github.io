## Lab 1 — A character-level RNN from scratch in NumPy {#lab1}

**Goal.** You implement the forward pass of [Section 2](#s2) and the backpropagation through
time of [Section 3](#s3) in plain NumPy, check the gradients numerically, and train the network
with truncated BPTT to predict the next character of a synthetic maintenance log. Then you
measure what it has learned. You compare it with n-gram baselines, sample from it at two
temperatures, and audit the samples line by line against the log's rules. The network learns
every local rule, including a numerical threshold. It does not learn the one rule that needs a
memory longer than its backward pass reaches: the closing tag that must repeat the opening tag.
That failure is the vanishing gradient of [Section 4](#s4), seen as behaviour, and
[Lab 2](#lab2) shows an LSTM fixing it. The data is synthetic, there is no download, and the
lab runs in about a minute on a laptop CPU. Only NumPy and matplotlib are needed.

### Step 1: a maintenance log with one long-range rule

The corpus is generated, so that every rule in it is known and can be audited afterwards. Each
line has the form

```text
F2 pres 4.0 bar night shift ok /F2
```

and obeys four rules. The unit must agree with the quantity (`temp` with `C`, `vib` with `mm/s`,
`pres` with `bar`). The status must agree with the value (`high` when temp $\ge 75.0$,
vib $\ge 7.1$ or pres $\ge 5.0$, otherwise `ok`). An optional note comes before the status.
The closing tag repeats the asset tag that opened the line; its first character comes 18 to 36
characters after the last character of the opening tag (measured on the generated lines). Three of the rules are local:
the unit sits next to the value, and the value and unit lie at most 24 characters before the
status, so a model that sees the last 25 characters can follow them. The fourth is not
local in the same way: the opening tag is one of eight, and the closing tag is a copy of it, so
nothing but a memory that spans the whole line can predict the closing tag better than a
one-in-eight guess.

The first block writes the generator, prints the first five lines and the numbers that later
steps are checked against, including the generator's own entropy: the smallest loss any model
can reach on this text, computed from the random draws the generator makes. It is the lab's
floor, which real data never lets you compute. A model that has learned nothing outputs the uniform distribution
over the $V$ characters, so its loss is $\ln V$; the first training loss must be close to that
([Section 2](#s2)). The last 10% of the characters are held out as the validation text.

```python
import re
import time

import matplotlib.pyplot as plt
import numpy as np

np.random.seed(0)

TAGS = ["P1", "P2", "P3", "P4", "F1", "F2", "C1", "C2"]
# quantity -> (unit, low, high, threshold at which the status becomes "high")
QUANTITIES = {
    "temp": ("C", 40.0, 90.0, 75.0),
    "vib": ("mm/s", 0.5, 9.9, 7.1),
    "pres": ("bar", 1.0, 6.0, 5.0),
}
NOTES = ["after restart", "during wash", "operator check", "night shift", "", "", ""]


def make_log(n_lines, seed):
    """Generate the maintenance log; 3 of the 7 note choices are empty."""
    rng = np.random.default_rng(seed)
    lines = []
    for _ in range(n_lines):
        tag = TAGS[rng.integers(8)]
        quantity = list(QUANTITIES)[rng.integers(3)]
        unit, low, high, threshold = QUANTITIES[quantity]
        value = round(float(rng.uniform(low, high)), 1)
        note = NOTES[rng.integers(7)]
        status = "high" if value >= threshold else "ok"
        words = [tag, quantity, f"{value:.1f}", unit] + ([note] if note else [])
        lines.append(" ".join(words + [status, "/" + tag]))
    return "\n".join(lines) + "\n"


text = make_log(1500, seed=0)
chars = sorted(set(text))
V = len(chars)
stoi = {c: i for i, c in enumerate(chars)}
data = np.array([stoi[c] for c in text])
n_val = len(data) // 10
train_data, val_data = data[:-n_val], data[-n_val:]

print("\n".join(text.split("\n")[:5]))
print(f"characters {len(text):,}   V = {V}   train/val {len(train_data):,}/{len(val_data):,}")
print(f"ln V = {np.log(V):.3f} nats: the loss of a uniform guess")
ok_share = np.mean([line.split()[-2] == "ok" for line in text.strip().split("\n")])
print(f"lines with status 'ok': {ok_share:.0%}  (accuracy of always predicting ok)")

# Entropy of the generator, in nats per line: what no model can predict. The tag, the
# quantity, the value (to one decimal) and the note are random draws; the unit, the status
# and the closing tag are determined by them.
n_values = [round((hi - lo) * 10) + 1 for _, lo, hi, _ in QUANTITIES.values()]
note_p = np.array([1 / 7] * 4 + [3 / 7])  # four notes at 1/7 each, the empty note at 3/7
entropy_line = (np.log(8) + np.log(3) + np.mean(np.log(n_values))
                - np.sum(note_p * np.log(note_p)))
chars_per_line = len(text) / 1500
print(f"entropy of the generator: {entropy_line:.2f} nats per line, "
      f"{entropy_line / chars_per_line:.3f} per character")
print(f"if the closing tag is also a 1-in-8 guess: "
      f"{(entropy_line + np.log(8)) / chars_per_line:.3f} per character")
```

```output
C1 vib 3.0 mm/s operator check ok /C1
P1 temp 80.7 C after restart high /P1
F2 pres 4.0 bar ok /F2
F2 vib 9.3 mm/s night shift high /F2
P3 pres 1.0 bar operator check ok /P3
characters 46,196   V = 37   train/val 41,577/4,619
ln V = 3.611 nats: the loss of a uniform guess
lines with status 'ok': 73%  (accuracy of always predicting ok)
entropy of the generator: 9.55 nats per line, 0.310 per character
if the closing tag is also a 1-in-8 guess: 0.378 per character
```

The vocabulary has 37 characters: the letters and digits the log uses, the space, the full stop,
the slash and the newline. Always predicting `ok` is right for about three lines in four, so a
model that claims to have learned the status rule must beat that figure, not 50%. This is
[Module 01](module_01_EN.html)'s rule that every number carries its baseline.

### Step 2: n-gram baselines

Before building the network, find out what is cheap. A character **n-gram model** predicts the
next character from the previous $n-1$ characters by counting. Counts alone give zero
probability to anything unseen, so each order is smoothed with the one below it:

$$
p_n(c \mid \text{ctx}) = \frac{\operatorname{count}(\text{ctx}, c) + \alpha\, p_{n-1}(c \mid \text{ctx}')}
{\operatorname{count}(\text{ctx}) + \alpha},
$$

where $\text{ctx}'$ is the context with its oldest character dropped and $p_1$ is the unigram
distribution with add-$\alpha$ smoothing. This is the additive smoothing of
[Module 01](module_01_EN.html) applied recursively; $\alpha = 0.1$ keeps the counts in charge
wherever there are enough of them. The cross-entropy on the validation text, in nats per
character, is the number the network must beat. A 5-gram sees four characters of context.

```python
from collections import Counter


def fit_ngram(train, order, alpha=0.1):
    """Return p(next | context) for an interpolated n-gram of the given order."""
    counts = [Counter() for _ in range(order)]  # counts[k]: (k-char context + next char)
    for k in range(order):
        for i in range(k, len(train)):
            counts[k][train[i - k : i + 1]] += 1
    context_counts = [Counter() for _ in range(order)]
    for k in range(order):
        for key, n in counts[k].items():
            context_counts[k][key[:-1]] += n
    total = sum(counts[0].values())

    def prob(context, char):
        p = (counts[0][char] + alpha) / (total + alpha * V)  # unigram, add-alpha
        for k in range(1, order):
            if len(context) < k:  # not enough context yet (start of the text)
                break
            ctx = context[len(context) - k :]
            p = (counts[k][ctx + char] + alpha * p) / (context_counts[k][ctx] + alpha)
        return p

    return prob


def ngram_loss(prob, order, val):
    """Mean cross-entropy (nats per character) on val; contexts do not cross into train."""
    total = 0.0
    for i in range(len(val)):
        context = val[max(0, i - (order - 1)) : i]
        total -= np.log(prob(context, val[i]))
    return total / len(val)


train_text = "".join(chars[i] for i in train_data)
val_text = "".join(chars[i] for i in val_data)
baseline = {}
for order in (1, 2, 3, 5):
    prob = fit_ngram(train_text, order)
    baseline[order] = ngram_loss(prob, order, val_text)
    print(f"order {order} (context {order - 1} chars): validation loss "
          f"{baseline[order]:.3f} nats/char")
```

```output
order 1 (context 0 chars): validation loss 3.201 nats/char
order 2 (context 1 chars): validation loss 1.457 nats/char
order 3 (context 2 chars): validation loss 0.653 nats/char
order 5 (context 4 chars): validation loss 0.476 nats/char
```

The loss falls from about 3.2 nats per character with no context, which is only a little below
$\ln 37 = 3.61$, to about 0.48 with four characters of context. Each extra character of
context pays, and the gains would stop only when the context covered the longest dependency of
the local rules, which an n-gram's table cannot reach: a 25-character context has far more
possible values than the log has lines. The 5-gram's loss is the figure to beat to show that the
network uses more than four characters. The baselines are fitted on the training text and
scored on the validation text, the honest split; scoring on the training text would reward
memorisation.

### Step 3: the parameters

The network is the plain recurrence of [Section 2](#s2) with the one-hot input implemented as a
column lookup:

$$
\mathbf{h}_t = \tanh\!\big(\mathbf{W}_{xh}[:, x_t] + \mathbf{W}_{hh}\mathbf{h}_{t-1} + \mathbf{b}_h\big),
\qquad
\mathbf{y}_t = \mathbf{W}_{hy}\mathbf{h}_t + \mathbf{b}_y .
$$

The code names each matrix by what it connects: `W_xh` is the $\mathbf{W}_x$ of the text, `W_hh`
is $\mathbf{W}_h$ and `W_hy` is $\mathbf{W}_y$. The initialisation follows
[Section 2](#s2). The recurrent matrix has entries $N(0, 1/H)$, so that its singular values are
of order 1 and the state neither dies nor saturates at the start. The input and output weights
are small ($N(0, 0.01^2)$), so the first logits are almost zero and the first loss is close to
$\ln V$. With $H = 128$ and $V = 37$ the parameter count is the 26,021 of the worked example in
[Section 2](#s2).

```python
H = 128


def init_params(hidden, vocab, rng):
    return {
        "W_xh": rng.normal(0, 0.01, (hidden, vocab)),
        "W_hh": rng.normal(0, 1 / np.sqrt(hidden), (hidden, hidden)),
        "b_h": np.zeros(hidden),
        "W_hy": rng.normal(0, 0.01, (vocab, hidden)),
        "b_y": np.zeros(vocab),
    }


params = init_params(H, V, np.random.default_rng(0))
n_params = sum(p.size for p in params.values())
print({k: v.shape for k, v in params.items()})
print(f"parameters: {n_params:,}")
```

```output
{'W_xh': (128, 37), 'W_hh': (128, 128), 'b_h': (128,), 'W_hy': (37, 128), 'b_y': (37,)}
parameters: 26,021
```

### Step 4: the forward and backward passes

The function takes integer arrays `X` and `Y` of shape $(B, T)$: the input characters and the
characters that follow them. The state is stored as a matrix of shape $(H, B)$, one column per
stream in the batch, so that one matrix multiply advances all $B$ streams by a step.

The forward loop is the recurrence. The loss is the mean over the $B \cdot T$ positions of
$-\ln p_t(c_{t+1})$, the negative log-probability given to the character $c_{t+1}$ that actually
follows, with the softmax computed after subtracting the maximum logit, as in
[Module 02](module_02_EN.html), so that no exponential overflows.

The backward loop is [Section 3](#s3) written as code, running from $t = T-1$ down to $0$, in
Section 3's notation: $\boldsymbol{\delta}_t = \partial\mathcal{L}/\partial\mathbf{h}_t$ is the
gradient at the state (`dh` in the code), $\mathbf{g}_t = \partial\mathcal{L}/\partial\mathbf{z}_t$
the gradient at the pre-activation (`dz`), and $\partial\mathcal{L}/\partial\mathbf{y}_t$ the
gradient at the logits (`g`), all column vectors:

$$
\begin{aligned}
\frac{\partial\mathcal{L}}{\partial\mathbf{y}_t} &= \tfrac{1}{BT}\,\big(\mathbf{p}_t - \text{onehot}(c_{t+1})\big)
&& \text{softmax and cross-entropy}\\
\boldsymbol{\delta}_t &= \mathbf{W}_{hy}^\top \frac{\partial\mathcal{L}}{\partial\mathbf{y}_t} + \mathbf{W}_{hh}^\top \mathbf{g}_{t+1}
&& \text{from the output and from the future}\\
\mathbf{g}_t &= \boldsymbol{\delta}_t \odot (1 - \mathbf{h}_t^2)
&& \text{through the tanh}
\end{aligned}
$$

and the parameter gradients accumulate over $t$: $\partial\mathcal{L}/\partial\mathbf{W}_{hh}$ gets
$\mathbf{g}_t\mathbf{h}_{t-1}^\top$, $\partial\mathcal{L}/\partial\mathbf{b}_h$ gets $\mathbf{g}_t$,
$\partial\mathcal{L}/\partial\mathbf{W}_{hy}$ gets $(\partial\mathcal{L}/\partial\mathbf{y}_t)\,\mathbf{h}_t^\top$,
and the column of $\mathbf{W}_{xh}$ for the input character $x_t$ gets $\mathbf{g}_t$. `np.add.at` handles
the case where several streams of the batch have the same character at step $t$. The start state
$\mathbf{h}_0$ is an argument, because training carries it from chunk to chunk; no gradient is
propagated into it, which is what truncation means.

```python
def forward_backward(p, X, Y, h0, need_grad=True):
    """Mean cross-entropy over (B, T) and, if asked, its gradients (BPTT)."""
    B, T = X.shape
    hs = np.empty((T + 1, p["W_hh"].shape[0], B), dtype=p["W_hh"].dtype)
    hs[0] = h0
    for t in range(T):  # forward: the recurrence
        z = p["W_xh"][:, X[:, t]] + p["W_hh"] @ hs[t] + p["b_h"][:, None]
        hs[t + 1] = np.tanh(z)
    logits = np.einsum("vh,thb->tvb", p["W_hy"], hs[1:]) + p["b_y"][None, :, None]
    logits -= logits.max(axis=1, keepdims=True)  # stable softmax
    probs = np.exp(logits)
    probs /= probs.sum(axis=1, keepdims=True)
    rows = np.arange(B)
    loss = -np.mean([np.log(probs[t, Y[:, t], rows]) for t in range(T)])
    if not need_grad:
        return loss, None, hs[-1]

    grads = {k: np.zeros_like(v) for k, v in p.items()}
    g = probs.copy()  # dL/dlogits = (p - onehot) / (B T)
    for t in range(T):
        g[t, Y[:, t], rows] -= 1.0
    g /= B * T
    grads["W_hy"] = np.einsum("tvb,thb->vh", g, hs[1:])
    grads["b_y"] = g.sum(axis=(0, 2))
    dh_from_output = np.einsum("vh,tvb->thb", p["W_hy"], g)
    dh_next = np.zeros_like(h0)
    for t in reversed(range(T)):  # backward through time
        dh = dh_from_output[t] + dh_next
        dz = dh * (1.0 - hs[t + 1] ** 2)  # tanh'
        grads["W_hh"] += dz @ hs[t].T
        grads["b_h"] += dz.sum(axis=1)
        np.add.at(grads["W_xh"].T, X[:, t], dz.T)  # column lookup, so scatter-add
        dh_next = p["W_hh"].T @ dz  # reaches step t-1 through the Jacobian
    return loss, grads, hs[-1]


# the first loss, on one chunk of 32 streams x 32 steps at initialisation
B0, T0 = 32, 32
X0 = train_data[: B0 * T0].reshape(B0, T0)
Y0 = train_data[1 : B0 * T0 + 1].reshape(B0, T0)
loss0, _, _ = forward_backward(params, X0, Y0, np.zeros((H, B0)))
print(f"initial loss {loss0:.3f}  (ln V = {np.log(V):.3f})")
```

```output
initial loss 3.611  (ln V = 3.611)
```

The initial loss matches $\ln 37$: the output layer starts uninformative. A first loss far from
this would mean a bug before any training. It checks only the forward pass, though; the backward
pass needs its own test.

### Step 5: check the gradients

A hand-written backward pass is checked on a tiny model in float64, as in
[Section 3](#s3): perturb an entry of a parameter by $\pm\epsilon$ with $\epsilon = 10^{-5}$, form
the central difference $\big(\mathcal{L}(\theta+\epsilon) - \mathcal{L}(\theta-\epsilon)\big)/2\epsilon$ and
compare it with the analytic gradient through the relative error $|a - n|/\max(|a|, |n|, 10^{-12})$.
The model has $H = 5$, a batch of 2 and $T = 4$ steps. Several steps matter: a missing
$\mathbf{W}_{hh}^\top\mathbf{g}_{t+1}$ term passes the test at $T = 1$ and fails at
$T = 4$. Five random entries of every parameter are tested.

```python
rng_check = np.random.default_rng(42)
small = init_params(5, V, rng_check)
small["W_xh"] = rng_check.normal(0, 0.5, small["W_xh"].shape)  # larger, so the test bites
small["W_hy"] = rng_check.normal(0, 0.5, small["W_hy"].shape)
Xs = rng_check.integers(0, V, (2, 4))
Ys = rng_check.integers(0, V, (2, 4))
h0s = rng_check.normal(0, 0.1, (5, 2))
_, analytic, _ = forward_backward(small, Xs, Ys, h0s)

eps, worst = 1e-5, 0.0
for name, array in small.items():
    errors = []
    for _ in range(5):
        index = tuple(rng_check.integers(0, s) for s in array.shape)
        original = array[index]
        array[index] = original + eps
        loss_plus = forward_backward(small, Xs, Ys, h0s, need_grad=False)[0]
        array[index] = original - eps
        loss_minus = forward_backward(small, Xs, Ys, h0s, need_grad=False)[0]
        array[index] = original
        numeric = (loss_plus - loss_minus) / (2 * eps)
        a = analytic[name][index]
        errors.append(abs(a - numeric) / max(abs(a), abs(numeric), 1e-12))
    worst = max(worst, max(errors))
    print(f"{name:5s} worst relative error {max(errors):.2e}")
print(f"overall worst: {worst:.2e}  (about 1e-6 is right; above 1e-4 is a bug)")
```

```output
W_xh  worst relative error 0.00e+00
W_hh  worst relative error 1.64e-09
b_h   worst relative error 7.03e-10
W_hy  worst relative error 2.61e-07
b_y   worst relative error 1.03e-09
overall worst: 2.61e-07  (about 1e-6 is right; above 1e-4 is a bug)
```

Every parameter agrees with finite differences to a few parts in a million or better. The
backward pass is the gradient of the forward pass, and training can start.

### Step 6: train with truncated BPTT

The training text is laid out as $B = 32$ parallel streams, each a contiguous piece of the log.
Every update processes the next $T = 32$ characters of every stream, and the state at the end of
the chunk is the start state of the next one. It is carried forward in value and cut off in
gradient, which is truncated BPTT ([Section 3](#s3)). When the streams run out the state is
reset to zero and the pass starts again from the beginning. Stream $i$ stays in batch column $i$
throughout, so the state in a column belongs to the data that continues there
([Section 7](#s7)).

The optimiser is Adam, written out in four lines ([Module 02](module_02_EN.html)), with learning
rate $3\times 10^{-3}$. Gradients are clipped to a global norm of 5: the global norm is the
square root of the sum of squares over all parameters, and if it exceeds 5 every gradient is
multiplied by $5/\text{norm}$ ([Section 4](#s4)). Every 250 updates the script prints the mean
training loss of that window, the validation loss (one pass over the whole validation text,
starting at $\mathbf{h} = \mathbf{0}$), the latest gradient norm and the elapsed time, and keeps the
parameters with the best validation loss, which is early stopping.

```python
B, T = 32, 32
stream_len = (len(train_data) - 1) // B
streams_x = train_data[: B * stream_len].reshape(B, stream_len)
streams_y = train_data[1 : B * stream_len + 1].reshape(B, stream_len)
n_chunks = stream_len // T
Xv = val_data[:-1][None, :]
Yv = val_data[1:][None, :]


def val_loss(p):
    return forward_backward(p, Xv, Yv, np.zeros((H, 1)), need_grad=False)[0]


params = init_params(H, V, np.random.default_rng(0))
adam_m = {k: np.zeros_like(v) for k, v in params.items()}
adam_v = {k: np.zeros_like(v) for k, v in params.items()}
lr, beta1, beta2, adam_eps, clip, n_updates = 3e-3, 0.9, 0.999, 1e-8, 5.0, 2000

h = np.zeros((H, B))
chunk = 0
best = {"val": np.inf, "step": 0, "params": None}
history = {"step": [], "train": [], "val": []}
window, grad_norm_log = [], []
print(f"{n_chunks} chunks of {T} characters per pass over {B} streams")
for step in range(1, n_updates + 1):
    if chunk == n_chunks:  # the streams wrapped: restart them from zero state
        chunk, h = 0, np.zeros((H, B))
    sl = slice(chunk * T, (chunk + 1) * T)
    loss, grads, h = forward_backward(params, streams_x[:, sl], streams_y[:, sl], h)
    chunk += 1  # h is carried to the next chunk: a value, with no gradient attached
    norm = np.sqrt(sum((g**2).sum() for g in grads.values()))
    scale = min(1.0, clip / (norm + 1e-12))
    for k in params:  # Adam, four lines
        g = grads[k] * scale
        adam_m[k] = beta1 * adam_m[k] + (1 - beta1) * g
        adam_v[k] = beta2 * adam_v[k] + (1 - beta2) * g * g
        params[k] -= lr * (adam_m[k] / (1 - beta1**step)) / (
            np.sqrt(adam_v[k] / (1 - beta2**step)) + adam_eps)
    window.append(loss)
    grad_norm_log.append(norm)
    if step % 250 == 0:
        v = val_loss(params)
        history["step"].append(step)
        history["train"].append(np.mean(window))
        history["val"].append(v)
        if v < best["val"]:
            best = {"val": v, "step": step, "params": {k: a.copy() for k, a in params.items()}}
        print(f"update {step:4d}  train {np.mean(window):.3f}  val {v:.3f}  "
              f"grad norm {norm:.2f}")
        window = []
print(f"best validation loss {best['val']:.3f} at update {best['step']}; "
      f"5-gram {baseline[5]:.3f}")
print(f"largest gradient norm before clipping: {max(grad_norm_log):.2f}; "
      f"updates clipped: {sum(n > clip for n in grad_norm_log)}")
```

```output
40 chunks of 32 characters per pass over 32 streams
update  250  train 1.154  val 0.416  grad norm 0.22
update  500  train 0.408  val 0.391  grad norm 0.20
update  750  train 0.395  val 0.391  grad norm 0.16
update 1000  train 0.388  val 0.405  grad norm 0.27
update 1250  train 0.390  val 0.393  grad norm 0.24
update 1500  train 0.383  val 0.388  grad norm 0.21
update 1750  train 0.382  val 0.390  grad norm 0.16
update 2000  train 0.378  val 0.399  grad norm 0.27
best validation loss 0.388 at update 1500; 5-gram 0.476
largest gradient norm before clipping: 1.43; updates clipped: 0
```

The first window's mean training loss, about 1.15, is dominated by the first few dozen updates,
when the loss falls from 3.61; by update 500 the network is at about 0.4 on both texts. From
there the validation loss wanders between about 0.39 and 0.41 while the training loss creeps down
to about 0.38, so the best checkpoint is simply the lowest of a flat region (the exact update
may differ from run to run). That best validation loss, about 0.39 nats per character, is clearly
below the 5-gram's 0.48, so the network uses context beyond four characters. The largest
gradient norm over all 2,000 updates stays near 1, so clipping at 5 never triggers: it is a
safety net here, not an active ingredient. [Section 7](#s7) says to clip always, because it
costs nothing and the one run in which it matters is the one that would otherwise end in `nan`.

The loss has a floor, and Step 1 computed it. The log's randomness is the asset tag, the quantity,
the digits of the value and the choice of note; the unit, the status and the closing tag follow
from them. Summing the entropies gives 9.55 nats per line, which at about 31 characters per
line is 0.310 nats per character: no model, however large, scores lower on text from this
generator. A model that gets every local rule right but guesses the closing tag one time in
eight pays an extra $\ln 8 = 2.08$ nats per line, and its floor is 0.378. The network's 0.39 is
within 0.01 of that second floor. It has learned the local rules almost perfectly, and what is
left of its loss is the closing tag it cannot remember. (The floors are computed for the
generator; the validation text is one sample from it, so the two numbers agree only to about
this accuracy.)

```python
fig, ax = plt.subplots(figsize=(6.5, 3.6))
ax.plot(history["step"], history["train"], "o-", label="training loss (mean of window)")
ax.plot(history["step"], history["val"], "s-", label="validation loss")
ax.axhline(baseline[5], color="grey", linestyle="--", label="5-gram baseline")
ax.axhline(baseline[3], color="grey", linestyle=":", label="3-gram baseline")
ax.set_xlabel("update")
ax.set_ylabel("cross-entropy (nats per character)")
ax.set_title("Lab 1: character RNN on the maintenance log")
ax.set_ylim(0, 1.5)
ax.legend()
plt.tight_layout()
plt.show()
```

### Step 7: sample from the trained network

Sampling is the one-to-many shape of [Section 1](#s1). Start from $\mathbf{h} = \mathbf{0}$ and a
newline, compute the logits, divide them by the temperature $\tau$, take the softmax, draw a
character with a seeded generator, and feed it back. The temperature is explained in
[Section 2](#s2); [Module 07](module_07_EN.html) treats sampling in general. At $\tau = 0.5$ the
distribution is sharpened towards the likeliest character; at $\tau = 1$ it is the model's own.

```python
def sample(p, n_chars, temperature, seed):
    rng = np.random.default_rng(seed)
    h_state = np.zeros((H, 1))
    index = stoi["\n"]
    out = []
    for _ in range(n_chars):
        z = p["W_xh"][:, [index]] + p["W_hh"] @ h_state + p["b_h"][:, None]
        h_state = np.tanh(z)
        logits = (p["W_hy"] @ h_state + p["b_y"][:, None])[:, 0] / temperature
        probs = np.exp(logits - logits.max())
        probs /= probs.sum()
        index = rng.choice(V, p=probs)
        out.append(chars[index])
    return "".join(out)


samples = {tau: sample(best["params"], 6000, tau, seed=1) for tau in (0.5, 1.0)}
for tau, generated in samples.items():
    print(f"--- temperature {tau} ---")
    print("\n".join(generated.split("\n")[1:7]))
```

```output
--- temperature 0.5 ---
P4 temp 55.5 C ok /P1
P2 pres 4.0 bar after restart ok /P3
P1 pres 3.3 bar ok /P2
P2 vib 2.7 mm/s ok /P1
P1 temp 68.5 C ok /P2
P2 temp 58.9 C ok /P3
--- temperature 1.0 ---
P1 temp 58.5 C ok /C1
P4 temp 52.7 C ok /P4
P3 vib 8.4 mm/s high /F2
P2 pres 1.7 bar operator check ok /P1
C1 temp 84.8 C night shift ok /F1
C2 pres 1.9 bar night shift ok /P1
```

The samples read like the log. Units follow quantities, values are plausible numbers, and statuses
mostly agree with values (one line at $\tau = 1$, `C1 temp 84.8 C night shift ok`, should say
`high`). Look at the closing tags, though: every one of the six lines at $\tau = 0.5$ above closes
with a tag that is not the one that opened the line. The network has learned what a
closing tag looks like (a slash, one of the eight tags) but not which one. Counting settles it.

### Step 8: audit the samples against the rules

One regular expression describes a well-formed line: an asset tag, a quantity, a one-decimal
value, a unit, an optional note from the list of four, a status and a closing tag. Capturing the
groups lets the audit test each rule separately on the lines that parse. The first and last lines
of a sample may be cut off, so the audit skips them. Four fractions are reported: well-formed
lines, and, among those, units that agree with their quantity, statuses that agree with their value
and closing tags that match their opening tags. Guessing the tag uniformly gives
$1/8 = 12.5\%$.

```python
LINE = re.compile(
    r"^([PFC][1-4]) (temp|vib|pres) (\d+\.\d) (C|mm/s|bar) "
    r"(?:(?:after restart|during wash|operator check|night shift) )?"
    r"(ok|high) /([PFC][1-4])$"
)
UNIT_OF = {q: spec[0] for q, spec in QUANTITIES.items()}
THRESHOLD_OF = {q: spec[3] for q, spec in QUANTITIES.items()}


def audit(generated):
    lines = generated.split("\n")[1:-1]  # drop the possibly cut first and last lines
    parsed = [m.groups() for m in map(LINE.match, lines) if m]
    n = len(parsed)
    return {
        "lines": len(lines),
        "well-formed": n / len(lines),
        "unit agrees": sum(UNIT_OF[q] == u for _, q, _, u, _, _ in parsed) / n,
        "status agrees": sum(
            (float(v) >= THRESHOLD_OF[q]) == (s == "high")
            for _, q, v, _, s, _ in parsed) / n,
        "closing tag matches": sum(t1 == t2 for t1, _, _, _, _, t2 in parsed) / n,
    }


print(f"{'':22s}{'tau = 0.5':>10s}{'tau = 1.0':>10s}")
results = {tau: audit(g) for tau, g in samples.items()}
for key in ["lines", "well-formed", "unit agrees", "status agrees", "closing tag matches"]:
    row = [results[tau][key] for tau in (0.5, 1.0)]
    if key == "lines":
        print(f"{key:22s}{row[0]:10d}{row[1]:10d}")
    else:
        print(f"{key:22s}{row[0]:10.1%}{row[1]:10.1%}")
print("always-ok baseline for the status: about 73%;  guessing the tag: 12.5%")
```

```output
                       tau = 0.5 tau = 1.0
lines                        225       193
well-formed               100.0%     95.3%
unit agrees               100.0%    100.0%
status agrees              99.1%     95.7%
closing tag matches        20.9%     12.0%
always-ok baseline for the status: about 73%;  guessing the tag: 12.5%
```

One more thing about the table: the closing-tag figure is computed from about 225 lines at
$\tau = 0.5$ and 193 at $\tau = 1$, so it carries a sampling error of about 3 percentage
points. Re-run `sample` with another seed to see it move.

### What you should see

- **The first loss is $\ln 37 = 3.611$.** The output layer starts uninformative, as it should.
- **The gradient check passes.** The worst relative error over 25 sampled entries is of the order
  of $10^{-7}$ or below. Anything above $10^{-4}$ would be a bug.
- **The network beats the 5-gram.** Its best validation loss is about 0.39 nats per character,
  against 0.48 for the 5-gram, so it uses context longer than four characters. It is about 0.01
  above the 0.378 floor of a model that has every local rule right and guesses the closing tag,
  and about 0.08 above the 0.310 floor of a model that also remembers the tag. The gradient norm
  stays below 2, so clipping never triggers.
- **Every local rule is learned.** At $\tau = 0.5$ essentially all lines are well-formed and
  every unit agrees with its quantity. The status agrees with the value about 99% of the time,
  against 73% for always predicting `ok`: the network has learned a numerical threshold, a
  different one for each quantity, from nothing but next-character prediction.
- **The closing tag is not learned.** It matches the opening tag in about a fifth of the lines at
  $\tau = 0.5$ and in about one in eight at $\tau = 1$, the 12.5% of guessing. The tag has to
  survive 18 to 36 steps of the recurrence, and the truncated backward pass never connects the
  two tags when they fall in different 32-character chunks. The figure at $\tau = 0.5$ is
  somewhat above chance, probably because the shortest gaps sometimes fall inside one chunk,
  where the gradient over 18 steps has not yet vanished. This is [Section 4](#s4)'s
  vanishing gradient seen as behaviour. The loss does not show it clearly, because the missing
  memory costs only 0.07 nats per character out of 0.39; the audit does.
- **Temperature trades validity for variety.** At $\tau = 1$ about 5% of the lines are malformed
  and about 4% of the statuses disagree with their values; at $\tau = 0.5$ almost none do, but the lines repeat the likeliest patterns.

### Try this

1. **A longer truncation window.** Set `T = 64` in Step 6 (the number of chunks changes
   accordingly) and compare the closing-tag accuracy. The window is now long enough to contain
   most opening and closing tags together, so the gradient can connect them. Does the accuracy rise
   above 21%? If it does not, the vanishing of the gradient, not the truncation, is the limit.
   Then try `H = 256`.
2. **ReLU instead of tanh.** Replace `np.tanh` in the forward pass and `1 - h**2` in the backward
   pass (the derivative of a ReLU is 1 where its input is positive and 0 elsewhere; store the
   pre-activation or use `hs > 0`). Is training stable with clipping disabled? Compare the gradient
   norm with the tanh network's.
3. **Real text.** Embed 3,000 to 4,000 characters of public-domain text as a string (six of
   Shakespeare's sonnets come to about 3,700) and train on it. With so little text the network
   memorises: the training loss keeps falling while the validation loss reaches its minimum early
   and then rises, and the bigram and trigram baselines of Step 2 come close to the network. In a
   run on six sonnets made when this module was prepared, the validation loss was lowest after
   about 250 updates, at 2.46 nats per character, while a bigram model scored 2.45 and an
   interpolated trigram 2.26. Data size, not architecture, is the limit. The log was chosen
   because it is a data set where the network has something to find.
4. **Gradient against lag.** Inside one 32-step chunk of the trained model, record
   $\lVert\partial\mathcal{L}/\partial\mathbf{h}_t\rVert$ in the backward loop and plot it
   against $t$. Compare with the curves you will draw in [Lab 2](#lab2).

## Lab 2 — Watching gradients vanish, and the LSTM that does not {#lab2}

**Goal.** [Lab 1](#lab1)'s network could not learn the closing tag. Here you measure why, and
what changes with a gated cell. You write the LSTM cell of [Section 5](#s5) from its equations
and check it against PyTorch's `nn.LSTMCell`. You measure how much of the gradient from the last
step reaches an input $T$ steps earlier, as a function of the lag, for plain recurrent networks
and LSTMs under different initialisations: Section 4's two failures appear from one knob, and
the forget gate's bias sets how far the LSTM reaches. You then reproduce the
$\partial\mathbf{c}_{100}/\partial\mathbf{c}_0$ experiment, which compares the measured gradient
with the product of forget gates that [Section 5](#s5) predicts. Finally you train a plain RNN and
two LSTMs on the maintenance log with Lab 1's truncated-BPTT layout and watch the closing-tag
accuracy. The lab uses PyTorch and a few seconds of CPU per model; the whole lab takes about two
minutes on a laptop. There is no download.

### Step 1: the LSTM cell from its equations

The cell of [Section 5](#s5) computes four gates from the input $\mathbf{x}$ and the previous
state $(\mathbf{h}, \mathbf{c})$ with one stacked linear map:

$$
\mathbf{z} = \mathbf{W}_{ih}\mathbf{x} + \mathbf{b}_{ih} + \mathbf{W}_{hh}\mathbf{h} + \mathbf{b}_{hh},
\qquad
(\mathbf{z}_i, \mathbf{z}_f, \mathbf{z}_g, \mathbf{z}_o) = \text{chunks of }\mathbf{z}\ \text{of size } H,
$$

$$
\mathbf{c}' = \sigma(\mathbf{z}_f) \odot \mathbf{c} + \sigma(\mathbf{z}_i) \odot \tanh(\mathbf{z}_g),
\qquad
\mathbf{h}' = \sigma(\mathbf{z}_o) \odot \tanh(\mathbf{c}').
$$

So $\sigma(\mathbf{z}_f)$ is the forget gate $\mathbf{f}_t$ of [Section 5](#s5), $\sigma(\mathbf{z}_i)$
the input gate and $\sigma(\mathbf{z}_o)$ the output gate. PyTorch calls the candidate's block $g$
(the text's $\tilde{\mathbf{c}} = \tanh(\mathbf{z}_g)$) and stacks the four blocks in the order
$i, f, g, o$; in the code, `i, f, g, o` are these pre-activation chunks. The code uses row vectors with a batch dimension, so
$\mathbf{x}\mathbf{W}_{ih}^\top$ appears where the equation has $\mathbf{W}_{ih}\mathbf{x}$.
PyTorch keeps two bias vectors, $\mathbf{b}_{ih}$ and $\mathbf{b}_{hh}$, although only their sum
matters; this is why the parameter count is $4H(d + H) + 8H$ rather than $4H(d + H + 1)$
([Section 5](#s5)). With $d = 8$ and $H = 16$ it is $4\cdot 16\cdot 24 + 128 = 1{,}664$.

```python
import time

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn

np.random.seed(0)
torch.manual_seed(0)


def lstm_cell(x, h, c, W_ih, W_hh, b_ih, b_hh):
    """One LSTM step in PyTorch's conventions: gate order i, f, g, o."""
    z = x @ W_ih.T + b_ih + h @ W_hh.T + b_hh
    i, f, g, o = z.chunk(4, dim=1)
    c_new = torch.sigmoid(f) * c + torch.sigmoid(i) * torch.tanh(g)
    h_new = torch.sigmoid(o) * torch.tanh(c_new)
    return h_new, c_new


reference = nn.LSTMCell(8, 16)
x = torch.randn(5, 8)
h0, c0 = torch.randn(5, 16), torch.randn(5, 16)
h_mine, c_mine = lstm_cell(x, h0, c0, reference.weight_ih, reference.weight_hh,
                           reference.bias_ih, reference.bias_hh)
h_ref, c_ref = reference(x, (h0, c0))
n_params = sum(p.numel() for p in reference.parameters())
print(f"max |dh| = {(h_mine - h_ref).abs().max().item():.1e}   "
      f"max |dc| = {(c_mine - c_ref).abs().max().item():.1e}")
print(f"parameters: {n_params:,} = 4*16*(8+16) + 2*4*16 = {4 * 16 * 24 + 2 * 4 * 16:,}")
```

```output
max |dh| = 3.7e-08   max |dc| = 1.2e-07
parameters: 1,664 = 4*16*(8+16) + 2*4*16 = 1,664
```

The two agree to float32 rounding: the equations of Section 5 are what `nn.LSTM` computes, with
gates in the order $i, f, g, o$. This order matters in practice: the forget-gate bias lives in
the slice `bias_ih_l0[H:2*H]`, and a slice off by one block silently sets a different gate.

### Step 2: gradient against lag

A recurrent network can use an input $T$ steps back only if a gradient from the loss at the end
reaches it. To measure this, take a batch of random inputs $\mathbf{x}$ of shape
$(B, T, d) = (32, 200, 8)$ and a scalar loss that depends on the last hidden state only,
$L = \sum_b \mathbf{v}\cdot\mathbf{h}_T^{(b)}$ for a fixed random vector $\mathbf{v}$. After
`backward`, the norm of $\partial L/\partial\mathbf{x}_t$ (over the batch and the input
features) measures how much input $t$ influences $L$. Dividing by its value at $t = T-1$ gives
the **gradient ratio** at lag $T - 1 - t$: 1 at lag 0 and, for a network with perfect memory, 1
everywhere. The inputs are random and there is no training: the ratio is a property of the
initialisation and of the architecture. The gradient with respect to the input stands in
for the gradient with respect to the state at that step, which [Section 3](#s3) writes as a product
of Jacobians; the two differ by one fixed matrix per step, so they decay together.

Six models, each with $H = 64$ and `torch.manual_seed(1)` before it is built: `nn.RNN` with
PyTorch's default initialisation; `nn.RNN` with $\mathbf{W}_{hh}$ orthogonal (all singular values
1); the same orthogonal matrix times 1.5; and `nn.LSTM` with the forget-gate bias set to 0, 3 and
5. The default initialisation draws $\mathbf{W}_{hh}$ uniformly from $[-1/\sqrt H, 1/\sqrt H]$,
and [Section 4](#s4) predicts a spectral radius near $1/\sqrt{3} = 0.58$ and a largest singular
value above 1; the code prints both.

```python
B, T, d, H = 32, 200, 8, 64
torch.manual_seed(1)
inputs = torch.randn(B, T, d)
readout = torch.randn(H)  # the fixed vector v of the loss


def make_rnn(kind):
    torch.manual_seed(1)
    if kind.startswith("rnn"):
        model = nn.RNN(d, H, batch_first=True)
        with torch.no_grad():
            if kind != "rnn default":
                nn.init.orthogonal_(model.weight_hh_l0)
            if kind == "rnn orthogonal x1.5":
                model.weight_hh_l0.mul_(1.5)
        return model
    forget_bias = float(kind.split("b=")[1])
    model = nn.LSTM(d, H, batch_first=True)
    with torch.no_grad():
        model.bias_ih_l0[H : 2 * H] = forget_bias  # the forget-gate slice, order i f g o
        model.bias_hh_l0[H : 2 * H] = 0.0
    return model


def gradient_ratio(model):
    """||dL/dx_t|| / ||dL/dx_(T-1)|| for t = T-1 down to 0, i.e. indexed by lag."""
    x = inputs.clone().requires_grad_(True)
    out, _ = model(x)
    (out[:, -1, :] @ readout).sum().backward()
    norms = torch.linalg.vector_norm(x.grad.double(), dim=(0, 2))  # float64: squares of 1e-25 survive
    return (norms / norms[-1]).flip(0).numpy()


default_rnn = make_rnn("rnn default")
W = default_rnn.weight_hh_l0.detach()
radius = torch.linalg.eigvals(W).abs().max().item()
sigma_max = torch.linalg.matrix_norm(W, ord=2).item()
print(f"default W_hh: spectral radius {radius:.2f}, largest singular value {sigma_max:.2f}")

kinds = ["rnn default", "rnn orthogonal", "rnn orthogonal x1.5",
         "lstm b=0", "lstm b=3", "lstm b=5"]
ratios = {kind: gradient_ratio(make_rnn(kind)) for kind in kinds}
lags = [1, 10, 25, 50, 100, 199]
print(f"{'':22s}" + "".join(f"lag {lag:<8d}" for lag in lags))
for kind in kinds:
    print(f"{kind:22s}" + "".join(f"{ratios[kind][lag]:<12.2e}" for lag in lags))
```

```output
default W_hh: spectral radius 0.57, largest singular value 1.10
                      lag 1       lag 10      lag 25      lag 50      lag 100     lag 199
rnn default           5.23e-01    1.66e-03    1.76e-07    2.38e-14    7.83e-28    0.00e+00
rnn orthogonal        1.23e+00    2.26e-01    3.08e-02    1.50e-03    1.71e-06    3.04e-12
rnn orthogonal x1.5   1.32e+00    1.74e+00    3.38e+00    9.64e+00    1.17e+02    2.02e+04
lstm b=0              5.05e-01    6.22e-03    4.83e-06    4.24e-11    2.75e-21    6.48e-41
lstm b=3              4.36e-01    3.34e-01    3.20e-01    2.84e-01    3.36e-01    7.77e+00
lstm b=5              1.85e-01    1.41e-01    1.50e-01    1.93e-01    3.85e-01    3.41e+01
```

The default initialisation has spectral radius 0.57 and largest singular value 1.10, as
[Section 4](#s4) predicted for a matrix drawn this way. Now the table, one row per model.

- **The default RNN** loses a factor of about 600 by lag 10, and the ratio is $2\times 10^{-7}$ by lag 25. From lag 10 to
  lag 50 the ratio falls by $1.4\times 10^{-11}$ in 40 steps, a factor of $0.53$ per step. That is
  close to the spectral radius 0.57 and nowhere near the largest singular value 1.10: the
  long-run rate is set by the eigenvalues and the tanh derivatives, and the singular value
  matters only for the first few steps (the "non-normal" remark of [Section 4](#s4)). At lag 199
  the gradient is below the smallest float32 number, so it prints as exactly 0.
- **Orthogonal $\mathbf{W}_{hh}$** slows the decay (about 0.2 at lag 10, $10^{-3}$ at lag 50) but does
  not stop it. Every singular value of the matrix is 1; the remaining loss is the tanh derivative,
  which is below 1 wherever a unit is not near zero. This is the point of [Section 4](#s4): the
  matrix is one factor of the Jacobian, and the activation is the other.
- **Orthogonal times 1.5** explodes: the ratio rises through 1.7, 9.6 and 117 at lags 10, 50 and 100
  to about $2\times 10^{4}$ at lag 199, roughly 5% per step. Section 4's two failures come from
  one scale factor. This is the case where gradient clipping would act.
- **The LSTM with forget bias 0** decays like the plain RNN. A forget gate at $\sigma(0) = 0.5$ halves
  the cell-path gradient at every step, and $0.5^{50} \approx 10^{-15}$.
- **The LSTM with forget bias 3 or 5** keeps the ratio between about 0.14 and 0.4 from lag 10 to
  lag 100. The cell path is a product of forget gates, and with the bias at 3 or 5 each gate is
  0.95 or 0.99 at initialisation. The curves go *up* at lag 199, to 8 and 34: with the forget
  gates almost always open the cell sums its whole input history, and the earliest inputs
  influence the last state more than the latest ones do. That is a different imperfection, not
  a vanishing gradient: such a network must learn to forget.

The gradient-flow explorer of [Section 4](#s4) draws the same comparison. The numbers here are for
random inputs and one seed; other seeds change the digits but not the orders of magnitude.

```python
fig, ax = plt.subplots(figsize=(7, 4))
lag_axis = np.arange(T)
styles = {"rnn default": "C0-", "rnn orthogonal": "C0--", "rnn orthogonal x1.5": "C0:",
          "lstm b=0": "C3-", "lstm b=3": "C3--", "lstm b=5": "C3:"}
for kind in kinds:
    curve = np.maximum(ratios[kind], 1e-45)  # an exact 0 (float32 underflow) is drawn at the floor
    ax.semilogy(lag_axis, curve, styles[kind], label=kind)
ax.set_xlabel("lag (steps between the input and the loss)")
ax.set_ylabel("gradient ratio, relative to lag 0")
ax.set_title("Lab 2: gradient against lag at initialisation (random inputs)")
ax.set_ylim(1e-46, 1e6)
ax.legend(fontsize=8, ncol=2)
plt.tight_layout()
plt.show()
```

### Step 3: the gradient of the cell state

[Section 5](#s5) argues that along the LSTM's cell path the gradient is multiplied at each step
by the forget gate: $\partial\mathbf{c}_t/\partial\mathbf{c}_{t-1} = \operatorname{diag}(\mathbf{f}_t)$
plus terms that go through $\mathbf{h}_{t-1}$. If the second kind of term is small, the gradient
of $\mathbf{c}_{100}$ with respect to $\mathbf{c}_0$ should be close to the product of 100 forget
gates, about $\sigma(b_f)^{100}$ when every gate sits near its bias. The test: an
`nn.LSTMCell(8, 64)` with all weights scaled by 0.1 (so the gates are close to $\sigma(b_f)$
whatever the input), forget bias $b_f \in \{0, 2, 5, 10\}$, 100 steps on random inputs, backward
from the sum of $\mathbf{c}_{100}$, and the root-mean-square entry of the gradient with respect
to $\mathbf{c}_0$, $\lVert\partial\mathbf{c}_{100}/\partial\mathbf{c}_0\rVert/\sqrt H$, set beside
$\sigma(b_f)^{100}$. For comparison, the same measurement on a default `nn.RNNCell`, whose
state gradient is the product of Jacobians of Section 4.

```python
def lstm_c0_gradient(forget_bias, steps=100):
    torch.manual_seed(2)
    cell = nn.LSTMCell(8, 64)
    with torch.no_grad():
        for p in cell.parameters():
            p.mul_(0.1)
        cell.bias_ih[64:128] = forget_bias
        cell.bias_hh[64:128] = 0.0
    h = torch.zeros(1, 64)
    c = torch.zeros(1, 64, requires_grad=True)
    c_start = c
    for _ in range(steps):
        h, c = cell(torch.randn(1, 8), (h, c))
    c.sum().backward()
    return c_start.grad.double().norm().item() / np.sqrt(64)


print("LSTM cell, weights x 0.1:       ||dc_100/dc_0|| / sqrt(H)   sigmoid(b_f)^100")
for b_f in (0, 2, 5, 10):
    measured = lstm_c0_gradient(b_f)
    predicted = (1 / (1 + np.exp(-b_f))) ** 100
    print(f"  forget bias {b_f:2d}                {measured:20.2e}   {predicted:16.2e}")

torch.manual_seed(2)
rnn_cell = nn.RNNCell(8, 64)
h = torch.zeros(1, 64, requires_grad=True)
h_start = h
for _ in range(100):
    h = rnn_cell(torch.randn(1, 8), h)
h.sum().backward()
print(f"default RNNCell:                ||dh_100/dh_0|| / sqrt(H) = "
      f"{h_start.grad.double().norm().item() / np.sqrt(64):.2e}")
```

```output
LSTM cell, weights x 0.1:       ||dc_100/dc_0|| / sqrt(H)   sigmoid(b_f)^100
  forget bias  0                            5.58e-30           7.89e-31
  forget bias  2                            6.62e-06           3.07e-06
  forget bias  5                            8.99e-01           5.11e-01
  forget bias 10                            1.70e+00           9.95e-01
default RNNCell:                ||dh_100/dh_0|| / sqrt(H) = 8.13e-24
```

The measured gradient follows the product of forget gates in order of magnitude but not in
digits. With bias 2 it is $6.6\times 10^{-6}$ against $3.1\times 10^{-6}$; with bias 5, 0.90 against
0.51; with bias 10, 1.7 against 0.995. It is always larger than the product, for two reasons.
The gates are not exactly at $\sigma(b_f)$, since they depend on the input and the state a little,
and the terms through $\mathbf{h}_{t-1}$ add to the direct path. That second kind of term is why
a measurement of 1.7 above 1 is possible: nothing bounds the sum of paths by the product along one
of them. Both effects are small compared with the 30 orders of magnitude between bias 0
($\approx 10^{-30}$) and bias 10 (about 1) that one bias parameter produces. A default `nn.RNNCell`
over the same 100 steps gives $10^{-23}$.

A useful reading is the half-life of the cell path at a fixed gate value: the lag $n$ with
$\sigma(b_f)^n = 1/2$ is $\ln 0.5/\ln\sigma(b_f)$, which is 2.2 steps for $b_f = 1$, 14 for
$b_f = 3$ and 103 for $b_f = 5$. A bias of 1 therefore does not keep a value for 30 steps by
itself: training has to raise the forget gate of the units that store the tag. The bias makes that
easy by starting the gate in a region where its own gradient is not small; it does not do the
remembering.

### Step 4: the maintenance log again

Now the behavioural test. The generator of [Lab 1](#lab1) is repeated here so that the lab is
self-contained; it writes the same 46,196 characters. The data layout is Lab 1's: the first
90% for training in $B = 32$ parallel streams, the last 10% for validation, chunks of $T = 32$
with the state carried and detached at chunk boundaries, and reset to zero when the streams
wrap. The regular expression is Lab 1's too; its audit is reduced to the one quantity of interest,
the share of well-formed lines whose closing tag matches the opening tag.

```python
import re

TAGS = ["P1", "P2", "P3", "P4", "F1", "F2", "C1", "C2"]
QUANTITIES = {"temp": ("C", 40.0, 90.0, 75.0), "vib": ("mm/s", 0.5, 9.9, 7.1),
              "pres": ("bar", 1.0, 6.0, 5.0)}
NOTES = ["after restart", "during wash", "operator check", "night shift", "", "", ""]


def make_log(n_lines, seed):
    rng = np.random.default_rng(seed)
    lines = []
    for _ in range(n_lines):
        tag = TAGS[rng.integers(8)]
        quantity = list(QUANTITIES)[rng.integers(3)]
        unit, low, high, threshold = QUANTITIES[quantity]
        value = round(float(rng.uniform(low, high)), 1)
        note = NOTES[rng.integers(7)]
        status = "high" if value >= threshold else "ok"
        words = [tag, quantity, f"{value:.1f}", unit] + ([note] if note else [])
        lines.append(" ".join(words + [status, "/" + tag]))
    return "\n".join(lines) + "\n"


text = make_log(1500, seed=0)
chars = sorted(set(text))
V = len(chars)
stoi = {ch: i for i, ch in enumerate(chars)}
data = torch.tensor([stoi[ch] for ch in text])
n_val = len(data) // 10
train_data, val_data = data[:-n_val], data[-n_val:]

BATCH, CHUNK = 32, 32
stream_len = (len(train_data) - 1) // BATCH
streams_x = train_data[: BATCH * stream_len].reshape(BATCH, stream_len)
streams_y = train_data[1 : BATCH * stream_len + 1].reshape(BATCH, stream_len)
n_chunks = stream_len // CHUNK

LINE = re.compile(
    r"^([PFC][1-4]) (temp|vib|pres) (\d+\.\d) (C|mm/s|bar) "
    r"(?:(?:after restart|during wash|operator check|night shift) )?"
    r"(ok|high) /([PFC][1-4])$"
)
print(f"characters {len(text):,}   V = {V}   train/val {len(train_data):,}/{len(val_data):,}")
```

```output
characters 46,196   V = 37   train/val 41,577/4,619
```

The model is `Embedding(37, 32)`, a recurrent layer of $H = 128$ units, and `Linear(128, 37)`. The
embedding is the column lookup of Lab 1 with a lower-dimensional input. Three versions differ only
in the recurrent layer: `nn.RNN`; `nn.LSTM` with forget bias 0; and `nn.LSTM` with forget bias 1.
PyTorch's default LSTM initialisation draws the forget bias like every other bias, from a small
interval around 0, which is why the first LSTM sets it to exactly 0 and the second to exactly 1
([Section 5](#s5) gave the reason for 1: memory should be the default). The code prints the
effective forget bias, the sum of the two bias slices, to confirm it.

Every 500 updates the loop prints the validation loss and samples 4,000 characters at
temperature 0.5 from $\mathbf{h} = \mathbf{0}$ to measure the closing-tag accuracy, as in Lab 1.
Adam with learning rate $3\times 10^{-3}$, global-norm clipping at 5, 2,500 updates each.

```python
class CharModel(nn.Module):
    def __init__(self, kind, forget_bias=0.0, hidden=128):
        super().__init__()
        self.kind = kind
        self.embed = nn.Embedding(V, 32)
        self.core = (nn.RNN if kind == "rnn" else nn.LSTM)(32, hidden, batch_first=True)
        self.out = nn.Linear(hidden, V)
        if kind == "lstm":
            with torch.no_grad():
                self.core.bias_ih_l0[hidden : 2 * hidden] = forget_bias
                self.core.bias_hh_l0[hidden : 2 * hidden] = 0.0

    def forward(self, tokens, state=None):
        out, state = self.core(self.embed(tokens), state)
        return self.out(out), state


def detach(state):
    if state is None:
        return None
    return tuple(s.detach() for s in state) if isinstance(state, tuple) else state.detach()


@torch.no_grad()
def val_loss(model):
    logits, _ = model(val_data[:-1][None, :])
    return nn.functional.cross_entropy(logits[0], val_data[1:]).item()


@torch.no_grad()
def sample_text(model, n_chars, temperature, seed):
    generator = torch.Generator().manual_seed(seed)
    token, state, out = torch.tensor([[stoi["\n"]]]), None, []
    for _ in range(n_chars):
        logits, state = model(token, state)
        probs = torch.softmax(logits[0, -1] / temperature, dim=0)
        token = torch.multinomial(probs, 1, generator=generator)[None, :]
        out.append(chars[token.item()])
    return "".join(out)


def tag_accuracy(generated):
    lines = generated.split("\n")[1:-1]
    parsed = [m.groups() for m in map(LINE.match, lines) if m]
    return np.mean([g[0] == g[5] for g in parsed]) if parsed else float("nan")


def train_log_model(name, kind, forget_bias=0.0, n_updates=2500):
    torch.manual_seed(0)
    model = CharModel(kind, forget_bias)
    opt = torch.optim.Adam(model.parameters(), lr=3e-3)
    state, chunk, history = None, 0, []
    for step in range(1, n_updates + 1):
        if chunk == n_chunks:
            chunk, state = 0, None
        sl = slice(chunk * CHUNK, (chunk + 1) * CHUNK)
        logits, state = model(streams_x[:, sl], state)
        state = detach(state)  # truncated BPTT: the state is a value at the boundary
        chunk += 1
        loss = nn.functional.cross_entropy(logits.reshape(-1, V), streams_y[:, sl].reshape(-1))
        opt.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(), 5.0)
        opt.step()
        if step % 500 == 0:
            acc = tag_accuracy(sample_text(model, 4000, 0.5, seed=1))
            history.append((step, val_loss(model), acc))
            print(f"{name:12s} update {step:4d}  val {history[-1][1]:.3f}  "
                  f"closing-tag accuracy {acc:5.1%}")
    return model, history


effective = CharModel("lstm", 1.0).core
print("effective forget bias at initialisation (bias_ih + bias_hh), forget slice:",
      (effective.bias_ih_l0 + effective.bias_hh_l0)[128:256].mean().item())
histories = {}
for name, kind, bias in [("RNN", "rnn", 0.0), ("LSTM b_f=0", "lstm", 0.0),
                         ("LSTM b_f=1", "lstm", 1.0)]:
    _, histories[name] = train_log_model(name, kind, bias)
```

```output
effective forget bias at initialisation (bias_ih + bias_hh), forget slice: 1.0
RNN          update  500  val 0.400  closing-tag accuracy 24.7%
RNN          update 1000  val 0.399  closing-tag accuracy 15.0%
RNN          update 1500  val 0.390  closing-tag accuracy 19.9%
RNN          update 2000  val 0.406  closing-tag accuracy 14.1%
RNN          update 2500  val 0.415  closing-tag accuracy 15.0%
LSTM b_f=0   update  500  val 0.384  closing-tag accuracy 10.9%
LSTM b_f=0   update 1000  val 0.396  closing-tag accuracy 12.2%
LSTM b_f=0   update 1500  val 0.383  closing-tag accuracy 21.8%
LSTM b_f=0   update 2000  val 0.374  closing-tag accuracy 64.6%
LSTM b_f=0   update 2500  val 0.379  closing-tag accuracy 77.5%
LSTM b_f=1   update  500  val 0.387  closing-tag accuracy 10.2%
LSTM b_f=1   update 1000  val 0.395  closing-tag accuracy 16.7%
LSTM b_f=1   update 1500  val 0.373  closing-tag accuracy 35.3%
LSTM b_f=1   update 2000  val 0.396  closing-tag accuracy 39.8%
LSTM b_f=1   update 2500  val 0.395  closing-tag accuracy 64.2%
```

The effective forget bias is 1, as intended. Each curve is one run, and
the closing-tag accuracy is a noisy measurement: 4,000 characters make about 130 lines, so a
percentage has a standard error of about 3 to 4 points. Read the pattern, not single values.

- **The plain RNN** stays at 14 to 25% for the whole run, around the level of Lab 1, whatever the
  number of updates. Its validation loss, about 0.39 to 0.42, does not improve after update 500.
- **Both LSTMs** show the same shape: a long plateau near the level of guessing, then a rise. The
  bias-0 LSTM reaches about 78% and the forget-bias-1 LSTM about 64% at update 2,500. The rise is
  abrupt for bias 0 (22% at update 1,500, 65% at 2,000) and steadier for bias 1. It is abrupt
  because the tag needs a unit that stores it *and* an output pathway that
  reads it: until both exist the gradient of the closing-tag loss is weak, and once one of them
  starts to form the other follows.
- **The validation loss** of the two LSTMs reaches 0.373 to 0.374 at its best, just under the 0.378
  that Lab 1 computed as the floor for a model that guesses the closing tag, against 0.390 at best
  for the plain RNN. At update 2,500 it is 0.379 and 0.395 against the plain RNN's 0.415. The loss
  differs by 0.02 to 0.04 nats per character while the accuracy differs by a factor of four to
  five: the loss is dominated by the random digits, and the behavioural audit shows what it hides.
- **Which LSTM is ahead** is not stable. Repeating the run with `torch.manual_seed(7)` in
  `train_log_model` gave 79% for the bias-0 LSTM and 74% for the bias-1 LSTM at update 2,500, the
  reverse of the order above, and both again far above the plain RNN at 25%. The robust finding is
  that the gated cell learns the tag within 2,500 updates and the plain cell does not. The
  forget bias helps in principle, as Step 3 showed, but one run of this size does not measure
  how much.

### What you should see

- **The hand-written cell matches PyTorch** to float32 precision (differences of order $10^{-7}$),
  and the count is $1{,}664 = 4\cdot 16\cdot(8 + 16) + 2\cdot 4\cdot 16$. Section 5's equations, with gate
  order $i, f, g, o$, are what `nn.LSTM` computes.
- **PyTorch's default RNN initialisation is non-normal:** spectral radius about 0.57, largest
  singular value about 1.10. Its gradient ratio is about $10^{-3}$ at lag 10, $10^{-7}$ at lag 25 and
  $10^{-14}$ at lag 50, and the gradient underflows float32 by lag 199.
- **Orthogonal initialisation helps but does not solve it.** The ratio decays to about $10^{-6}$ at
  lag 100 because of the tanh derivative; scaled by 1.5 it grows to about $10^{2}$ at lag 100 and
  $10^{4}$ at lag 199. One knob produces both of Section 4's failures.
- **The LSTM's reach is set by its forget bias.** Bias 0 behaves like the plain RNN; bias 3 or 5 keeps
  the ratio between about 0.14 and 0.4 to lag 100. With the gates almost always open the earliest
  inputs come to dominate (ratios well above 1 at lag 199).
- **The gradient of $\mathbf{c}_{100}$ with respect to $\mathbf{c}_0$ follows $\sigma(b_f)^{100}$** in order of
  magnitude, from about $10^{-30}$ at $b_f = 0$ to about 1 at $b_f = 10$, within a factor of 2 to 7
  of the product. The plain cell's state gradient is about $10^{-23}$.
- **On the log, after 2,500 updates,** the plain RNN's closing-tag accuracy stays at 14 to 25% (the
  guessing level is 12.5%) while both LSTMs reach 70 to 90%. Each LSTM spends the first 1,500
  updates near the level of guessing and then rises quickly. The validation loss shows only a small
  gap.
- **Run time:** about 10 s per model in the run shown, and up to about 25 s per LSTM and 20 s for
  the RNN on a busier machine (under a few minutes in total for the lab), so the whole lab fits in
  the time stated above.

### Try this

1. **Swap in a GRU.** Replace `nn.LSTM` with `nn.GRU` in `CharModel` and compare the closing-tag
   accuracy and the parameter count. A GRU has three gate blocks instead of four, so three quarters
   of the LSTM's recurrent parameters ([Section 6](#s6)). It has no separate cell state and no forget
   bias to set; which of its two gates plays the part of the forget gate? (Note the $z$ convention
   warning in Section 6.)
2. **Profile the trained models.** Repeat Step 2's gradient profile with the trained log models,
   feeding embedded log text instead of random inputs. How has training changed the curve for the
   plain RNN, and for the LSTM with bias 0?
3. **Watch a blow-up.** Train the orthogonal-times-1.5 `nn.RNN` on the log with clipping disabled,
   logging the loss and the gradient norm each update. Then re-enable clipping at 5 and compare.
4. **Sweep the bias.** Run the LSTM with forget bias $b_f \in \{-2, 0, 1, 3, 5\}$ for 2,500 updates
   with two seeds each, and plot the tag accuracy at the final checkpoint. Is there a bias beyond
   which accuracy falls again? Use Step 2's observation about the earliest inputs dominating to
   guess why.

## Lab 3 — Forecasting and monitoring a sensor stream {#lab3}

**Goal.** You forecast a simulated sensor on a mounted machine, honestly, and then turn the
forecaster into a monitor. The honesty has four parts. The evaluation is walk-forward, never
shuffled. Every number is set beside a naive forecast, a seasonal-naive forecast and a linear
autoregression. The code of [Section 8](#s8) that loses to the naive forecast is run, its failure
is explained (the signal drifts out of the range the network saw in training), and it is fixed
with per-window normalisation. Multi-step forecasts are compared, recursive against direct. The
forecaster's residuals then feed three detectors, and four injected faults show that each kind of
fault needs its own detector ([Section 9](#s9)). The data is synthetic, with no download. This is
the module's one larger training lab: with `QUICK = False` it takes about two minutes on a laptop
CPU, and `QUICK = True` finishes in about a third of that time.

### Step 1: simulate the machine

The signal stands for the displacement sensor of a machine on a mount that stiffens as it
deflects: a forced, damped **Duffing oscillator**,

$$
\ddot x + 2\zeta\omega_0\dot x + \omega_0^2 x + k_3 x^3 = A\sin(2\pi t/5\,\text{s}) + \sigma_F\,\xi(t),
$$

with natural frequency $\omega_0 = \pi$ rad/s (a natural period of 2 s), damping ratio
$\zeta = 0.05$, cubic stiffness $k_3 = 40$, a periodic load of amplitude $A = 3$ and period 5 s, and
white-noise forcing of strength $\sigma_F = 3$. The cubic term makes the system nonlinear: the
stiffer the mount, the faster it oscillates at large amplitude. That nonlinearity is what a
neural forecaster can use and a linear one cannot. The oscillator is integrated by
semi-implicit Euler with $dt = 0.01$ s (the noise enters as $\sigma_F\sqrt{dt}\,\mathcal{N}(0,1)$
per substep) and sampled every 0.1 s for 8,000 samples (800 s). The measurement adds a drift of
$10^{-3}$ per sample, standing for sensor drift or wear, and noise of standard deviation 0.05. The
periodic load has a period of $P = 50$ samples.

The first block sets `QUICK`, writes the simulator and plots the series. `QUICK = True` trains for
4 epochs instead of 10 and uses only the last two walk-forward folds.

```python
import time

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn

QUICK = False  # True: 4 epochs, last two folds only; about a third of the run time
EPOCHS = 4 if QUICK else 10
np.random.seed(0)
torch.manual_seed(0)
torch.set_num_threads(4)

N, SUB, DT, P, W = 8000, 10, 0.01, 50, 64  # samples, substeps per sample, step, period, window
ZETA, OMEGA0, K3, LOAD, SIGMA_F = 0.05, np.pi, 40.0, 3.0, 3.0
DRIFT, MEAS_NOISE = 1e-3, 0.05


def simulate(seed=0, force_scale=None):
    """Duffing oscillator sampled every 0.1 s; force_scale multiplies the noise per substep."""
    rng = np.random.default_rng(seed)
    force_noise = rng.standard_normal(N * SUB)
    meas_noise = rng.standard_normal(N)
    scale = np.ones(N * SUB) if force_scale is None else force_scale
    x, v, out = 0.0, 0.0, np.empty(N)
    for k in range(N * SUB):
        acc = (-2 * ZETA * OMEGA0 * v - OMEGA0**2 * x - K3 * x**3
               + LOAD * np.sin(2 * np.pi * k * DT / 5.0))
        v += DT * acc + SIGMA_F * scale[k] * np.sqrt(DT) * force_noise[k]
        x += DT * v
        if (k + 1) % SUB == 0:
            out[(k + 1) // SUB - 1] = x
    return out + DRIFT * np.arange(N) + MEAS_NOISE * meas_noise


series = simulate(seed=0)
print(f"{N} samples, range {series.min():.2f} .. {series.max():.2f}, "
      f"standard deviation {series.std():.2f}")
print(f"first 1000 samples: mean {series[:1000].mean():.2f}; "
      f"last 1000: mean {series[-1000:].mean():.2f}")

fig, axes = plt.subplots(2, 1, figsize=(8, 5))
axes[0].plot(series, lw=0.5)
axes[0].set_title("Lab 3: simulated mount displacement (8,000 samples)")
axes[0].set_xlabel("sample (0.1 s)")
axes[0].set_ylabel("displacement")
axes[1].plot(np.arange(300), series[:300], lw=1)
axes[1].set_title("First 300 samples")
axes[1].set_xlabel("sample (0.1 s)")
axes[1].set_ylabel("displacement")
plt.tight_layout()
plt.show()
```

```output
8000 samples, range -1.00 .. 9.49, standard deviation 2.38
first 1000 samples: mean 0.49; last 1000: mean 7.48
```

The series rises from a mean of about 0.5 over the first 1,000 samples to about 7.5 over the last
1,000: the drift of $10^{-3}$ per sample adds 7 units over 7,000 samples, so most of the series'
standard deviation of 2.4 is drift, with the oscillation riding on it. In the zoom the
oscillation has a period of roughly 11 samples (1.1 s), about half the natural period of 2 s of
the linear oscillator: the stiffening spring raises the frequency at the amplitudes reached
here, and the response is far from a clean sinusoid because the random forcing keeps changing the
amplitude and phase. (The 50-sample periodic load is a minor part of the signal; the next steps
show the consequence for the seasonal-naive baseline.) A drifting level is the property that
broke the code of [Section 8](#s8).

### Step 2: Section 8's mistake, run as written

[Section 8](#s8) gave a forecaster and a split that look careful. It uses windows of
$W = 64$ samples and one-step targets, a two-layer `nn.LSTM` with hidden size 32, dropout 0.1
between the layers and a linear head on the last state. It trains with AdamW at $3\times 10^{-3}$,
clipping at 1, batches of 128 and 10 epochs. The data is z-scored with the statistics of the
training period only (no leak), and the test period is the future: here the first 6,000 samples
train and the last 2,000 test. The block below does exactly that. It prints the normalised ranges
of the inputs the network sees in training and in testing, then the LSTM's RMSE in the series'
original units, the naive RMSE (the forecast "the next value equals the last one") and the mean
error of the LSTM.

```python
class Forecaster(nn.Module):
    def __init__(self, hidden=32, outputs=1, per_window=False):
        super().__init__()
        self.per_window = per_window
        self.lstm = nn.LSTM(1, hidden, num_layers=2, batch_first=True, dropout=0.1)
        self.head = nn.Linear(hidden, outputs)

    def forward(self, x):  # x: (batch, W, 1), already z-scored
        if self.per_window:  # the fix: predict the change from the window's last value
            last = x[:, -1:, :]
            out, _ = self.lstm(x - last)
            return self.head(out[:, -1]) + last[:, 0]
        out, _ = self.lstm(x)
        return self.head(out[:, -1])


def windows(z, first_target, last_target, horizon=1):
    """Windows z[t-W:t] with targets z[t:t+horizon] for t in [first_target, last_target]."""
    ts = np.arange(first_target, last_target + 1)
    X = np.stack([z[t - W : t] for t in ts])
    Y = np.stack([z[t : t + horizon] for t in ts])
    return (torch.tensor(X, dtype=torch.float32).unsqueeze(-1),
            torch.tensor(Y, dtype=torch.float32))


def fit(model, X, Y, epochs=EPOCHS, seed=0):
    torch.manual_seed(seed)
    opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
    model.train()
    for _ in range(epochs):
        perm = torch.randperm(len(X))
        for i in range(0, len(X), 128):
            idx = perm[i : i + 128]
            loss = nn.functional.mse_loss(model(X[idx]), Y[idx])
            opt.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()
    model.eval()
    return model


@torch.no_grad()
def predict(model, X):
    return model(X).numpy()


def rmse(a, b):
    return float(np.sqrt(np.mean((np.asarray(a) - np.asarray(b)) ** 2)))


# Step 2: Section 8's split and its global z-scoring
ORIGIN = 6000
mu, sd = series[:ORIGIN].mean(), series[:ORIGIN].std()
z = (series - mu) / sd
X_tr, Y_tr = windows(z, W, ORIGIN - 1)  # targets inside the training period
X_te, Y_te = windows(z, ORIGIN + W, N - 1)  # test windows lie wholly in the test period
print(f"normalised inputs, training: {X_tr.min():.2f} .. {X_tr.max():.2f}   "
      f"test: {X_te.min():.2f} .. {X_te.max():.2f}")

global_model = fit(Forecaster(), X_tr, Y_tr)
pred = predict(global_model, X_te)
last_value = X_te[:, -1, 0].numpy()[:, None]
print(f"parameters {sum(p.numel() for p in global_model.parameters()):,}")
print(f"LSTM  RMSE {rmse(pred, Y_te.numpy()) * sd:.3f}   "
      f"naive RMSE {rmse(last_value, Y_te.numpy()) * sd:.3f}   "
      f"LSTM mean error {np.mean(pred - Y_te.numpy()) * sd:+.3f}")
```

```output
normalised inputs, training: -2.18 .. 2.32   test: 1.02 .. 3.55
parameters 12,961
LSTM  RMSE 0.427   naive RMSE 0.361   LSTM mean error -0.317
```

The test windows, after normalising with the training statistics, lie between 1.02 and 3.55, while
the network was trained on inputs between $-2.18$ and 2.32. Almost all of the test period is
above the range the network has ever seen: the drift has carried the level out of it. The LSTM's
RMSE, about 0.43, is *worse* than the naive forecast's 0.36, and its mean error is $-0.3$: it
systematically predicts too low, as a network does when its saturating units cannot represent a
level beyond the training range. The model has learned a map on the range it saw, and does not
extrapolate it as a linear model would. A second seed (`torch.manual_seed(1)` at the top, and
`seed=1` in `fit`) gave 0.63 against the same naive 0.37 and a mean error of $-0.57$ when this lab
was prepared, so the size of the failure varies with the seed and its sign does not.

This is the failure of [Section 8](#s8), reproduced on a nonlinear signal. Nothing in the code is
wrong in the usual sense: there is no leak, the baseline is honest and the split respects time.
The model is wrong for this signal. A one-line check would have exposed it before any training:
print the range of the test inputs next to the range of the training inputs.

### Step 3: the fix, in three lines

Normalise each window by its own last value. The network sees the shape of the last 64 samples,
not their level; it predicts the change from the last value, and the last value is added back. In
`forward` this is the `per_window` branch of the class above:

```python norun
last = x[:, -1:, :]                    # each window's last value, (batch, 1, 1)
out, _ = self.lstm(x - last)           # the network sees shape, not level
return self.head(out[:, -1]) + last[:, 0]
```

The model, data and training are otherwise the same. Train it and compare the two on the first
150 test samples.

```python
fixed_model = fit(Forecaster(per_window=True), X_tr, Y_tr)
pred_fixed = predict(fixed_model, X_te)
print(f"fixed LSTM RMSE {rmse(pred_fixed, Y_te.numpy()) * sd:.3f}   "
      f"mean error {np.mean(pred_fixed - Y_te.numpy()) * sd:+.3f}")

fig, ax = plt.subplots(figsize=(8, 3.6))
span = slice(0, 150)
steps = np.arange(ORIGIN + W, ORIGIN + W + 150)
ax.plot(steps, Y_te.numpy()[span, 0] * sd + mu, "k", lw=1.5, label="measured")
ax.plot(steps, pred[span, 0] * sd + mu, "C3--", lw=1, label="LSTM, global z-score")
ax.plot(steps, pred_fixed[span, 0] * sd + mu, "C0-", lw=1, label="fixed LSTM (per window)")
ax.set_xlabel("sample")
ax.set_ylabel("displacement")
ax.set_title("Lab 3: one-step forecasts on the first test samples")
ax.legend(fontsize=8)
plt.tight_layout()
plt.show()
```

```output
fixed LSTM RMSE 0.132   mean error +0.024
```

The fixed model's RMSE is about 0.13 with a mean error close to zero, a third of the naive error
and about a third of the globally normalised model's. The plot shows why: that model's forecasts
(dashed) sit slightly below the measurement at the peaks, the bias that the mean error reports,
while the fixed model follows both level and shape. The three lines changed what the network is
asked to learn: instead of "the next level, given the last 64 levels", "the next change, given the
shape of the last 64 values". The shape of the oscillation is the same at any level, so the range
problem disappears.

Differencing the series (feeding changes instead of levels) does the same job in many settings,
and reversible instance normalisation generalises it ([Section 8](#s8)). What none of them can do
is recover information the window does not contain.

### Step 4: walk-forward validation against three baselines

One split can flatter or punish a model by luck, so [Section 8](#s8) evaluates on a sequence of
**walk-forward** folds. Four forecast origins, 4,000, 5,000, 6,000 and 7,000: each fold trains on
everything before its origin and validates on the 1,000 samples after it. The z-scoring statistics
are recomputed from each fold's training part. A validation window may reach back into the training
period, because those values are in the past at forecast time; its target never does.

Four forecasters are compared on every fold, all in the series' original units:

- **naive:** the last value;
- **seasonal naive:** the value one period ($P = 50$ samples) before the target;
- **linear autoregression:** least squares on the same 64-value windows with the last value
  subtracted, plus an intercept ([Module 01](module_01_EN.html)); this is the baseline a nonlinear
  model must beat to justify itself;
- **the fixed LSTM.**

Fold 3 (origin 6,000) is the model trained in Step 3; it is reused rather than retrained, so
Steps 5 and 6 use the same network.

```python
def linear_fit(series_, origin, horizon=1):
    """Least squares on last-value-subtracted windows; returns (coef, intercept) per horizon."""
    ts = np.arange(W, origin - horizon + 1)
    Xw = np.stack([series_[t - W : t] for t in ts])
    last = Xw[:, -1:]
    design = np.hstack([Xw - last, np.ones((len(ts), 1))])
    target = np.stack([series_[t : t + horizon] for t in ts]) - last
    coef, *_ = np.linalg.lstsq(design, target, rcond=None)
    return coef


def linear_predict(coef, windows_):
    last = windows_[:, -1:]
    return last + np.hstack([windows_ - last, np.ones((len(windows_), 1))]) @ coef


origins = [6000, 7000] if QUICK else [4000, 5000, 6000, 7000]
fold_models, fold_stats, table = {}, {}, {}
for origin in origins:
    mu_f, sd_f = series[:origin].mean(), series[:origin].std()
    z_f = (series - mu_f) / sd_f
    targets = np.arange(origin, origin + 1000)
    X_val = torch.tensor(np.stack([z_f[t - W : t] for t in targets]),
                         dtype=torch.float32).unsqueeze(-1)
    y_true = series[targets]
    if origin == ORIGIN:
        model = fixed_model
    else:
        X_f, Y_f = windows(z_f, W, origin - 1)
        model = fit(Forecaster(per_window=True), X_f, Y_f)
    fold_models[origin], fold_stats[origin] = model, (mu_f, sd_f)
    raw_windows = np.stack([series[t - W : t] for t in targets])
    coef = linear_fit(series, origin)
    table[origin] = {
        "naive": rmse(raw_windows[:, -1], y_true),
        "seasonal naive": rmse(series[targets - P], y_true),
        "linear AR": rmse(linear_predict(coef, raw_windows)[:, 0], y_true),
        "LSTM": rmse(predict(model, X_val)[:, 0] * sd_f + mu_f, y_true),
    }

methods = ["naive", "seasonal naive", "linear AR", "LSTM"]
print(f"{'origin':>8s}" + "".join(f"{m:>16s}" for m in methods))
for origin in origins:
    print(f"{origin:8d}" + "".join(f"{table[origin][m]:16.3f}" for m in methods))
means = {m: np.mean([table[o][m] for o in origins]) for m in methods}
stds = {m: np.std([table[o][m] for o in origins]) for m in methods}
print(f"{'mean':>8s}" + "".join(f"{means[m]:16.3f}" for m in methods))
print(f"{'sd':>8s}" + "".join(f"{stds[m]:16.3f}" for m in methods))
gain = [1 - table[o]["LSTM"] / table[o]["linear AR"] for o in origins]
print("LSTM improvement over linear AR per fold: " + ", ".join(f"{g:.0%}" for g in gain))
```

```output
  origin           naive  seasonal naive       linear AR            LSTM
    4000           0.393           0.869           0.166           0.145
    5000           0.389           0.844           0.148           0.130
    6000           0.342           0.791           0.151           0.134
    7000           0.377           0.854           0.154           0.130
    mean           0.375           0.840           0.155           0.135
      sd           0.020           0.029           0.007           0.006
LSTM improvement over linear AR per fold: 13%, 12%, 12%, 16%
```

The ordering is the same in every fold. The naive forecast has an RMSE of about 0.375. The
seasonal-naive forecast is much worse, about 0.84, worse than naive by a factor of more than two:
the period-50 load is a small part of this signal, the response is dominated by the random
forcing and the stiffened oscillation, and the value one period ago is almost unrelated to the
value now. A baseline has to be computed, not assumed; here the textbook choice for a periodic
signal is the wrong one. The linear autoregression, at about 0.155, is a strong baseline
that nobody should skip. The LSTM, at about 0.135 with a standard deviation over folds of about
0.006, is the best in every fold, by 12 to 16% over the linear model in this run (9 to 17% in
the second seed). That margin is real but modest, and it is the honest size of the benefit of a
neural forecaster here.

The LSTM wins because the spring is nonlinear. A linear model is the optimal predictor for a
linear system with Gaussian noise ([Section 8](#s8)); on a signal built from sinusoids plus drift
plus noise it wins outright, which is why this lab uses a stiffening mount. Without that
nonlinearity the table would show the linear model ahead or tied, at a fraction of the cost.

### Step 5: several steps ahead, recursive or direct

A one-step model can be iterated, or a model can be trained to predict all $h$ steps at once
([Section 8](#s8)). From the origin 6,000, forecast the next $h = 1, \dots, 20$ samples at every
origin $s$ in $[6000, 6980]$, so that every horizon is scored on the same 981 forecasts. Six methods:

- **LSTM, recursive:** fold 3's one-step model; append each prediction to the window, drop the oldest
  value and predict again;
- **LSTM, direct:** the same architecture with a 20-output head, trained once on 20-step targets;
- **linear, recursive** and **linear, direct** (20 outputs fitted by least squares);
- **naive** and **seasonal naive.**

```python
HMAX = 20
mu3, sd3 = fold_stats[ORIGIN]
z3 = (series - mu3) / sd3
starts = np.arange(ORIGIN, ORIGIN + 1000 - HMAX + 1)  # forecast origins s: first target at s
truth = np.stack([series[s : s + HMAX] for s in starts])  # (n, 20)
raw_start = np.stack([series[s - W : s] for s in starts])  # (n, 64), original units


@torch.no_grad()
def recursive_lstm(model, windows_z):
    window = windows_z.clone()
    steps = []
    for _ in range(HMAX):
        nxt = model(window)  # (n, 1)
        steps.append(nxt[:, 0].numpy())
        window = torch.cat([window[:, 1:, :], nxt.unsqueeze(-1)], dim=1)
    return np.stack(steps, axis=1)


def recursive_linear(coef, windows_raw):
    window, steps = windows_raw.copy(), []
    for _ in range(HMAX):
        nxt = linear_predict(coef, window)[:, 0]
        steps.append(nxt)
        window = np.hstack([window[:, 1:], nxt[:, None]])
    return np.stack(steps, axis=1)


X_start = torch.tensor(z3[np.stack([np.arange(s - W, s) for s in starts])],
                       dtype=torch.float32).unsqueeze(-1)
X_dir, Y_dir = windows(z3, W, ORIGIN - HMAX, horizon=HMAX)  # 20-step targets, all in training
direct_model = fit(Forecaster(outputs=HMAX, per_window=True), X_dir, Y_dir)
forecasts = {
    "naive": np.repeat(raw_start[:, -1:], HMAX, axis=1),
    "seasonal naive": np.stack([series[s - P : s - P + HMAX] for s in starts]),
    "linear recursive": recursive_linear(linear_fit(series, ORIGIN), raw_start),
    "linear direct": linear_predict(linear_fit(series, ORIGIN, HMAX), raw_start),
    "LSTM recursive": recursive_lstm(fold_models[ORIGIN], X_start) * sd3 + mu3,
    "LSTM direct": predict(direct_model, X_start) * sd3 + mu3,
}
rmse_by_h = {m: np.sqrt(np.mean((f - truth) ** 2, axis=0)) for m, f in forecasts.items()}
print(f"direct model trained; {len(starts)} forecast origins")
print(f"{'RMSE at h =':>18s}" + "".join(f"{h:>8d}" for h in (1, 5, 10, 20)))
for m, r in rmse_by_h.items():
    print(f"{m:>18s}" + "".join(f"{r[h - 1]:8.3f}" for h in (1, 5, 10, 20)))

fig, ax = plt.subplots(figsize=(7, 4))
for m, r in rmse_by_h.items():
    ax.plot(np.arange(1, HMAX + 1), r, marker="o", ms=3, label=m)
ax.set_xlabel("forecast horizon h (samples)")
ax.set_ylabel("RMSE")
ax.set_title("Lab 3: error against horizon, origin 6,000")
ax.legend(fontsize=8)
plt.tight_layout()
plt.show()
```

```output
direct model trained; 981 forecast origins
       RMSE at h =       1       5      10      20
             naive   0.342   1.018   0.621   0.720
    seasonal naive   0.792   0.791   0.790   0.789
  linear recursive   0.151   0.400   0.526   0.551
     linear direct   0.151   0.400   0.526   0.552
    LSTM recursive   0.133   0.418   0.531   0.775
       LSTM direct   0.152   0.402   0.497   0.561
```

Look at three things.

- **The naive forecast is not monotonic in $h$:** 0.34, 1.02, 0.62 and 0.72 at $h = 1, 5, 10, 20$. It
  follows the oscillation, whose period is about 11 samples: persistence is worst when the signal has
  turned by half a period (here $h$ around 5) and recovers near a full period ($h$ around 10 to 11).
  Seasonal naive is flat at about 0.79, because its error does not depend on $h$ for $h \le P$.
- **Recursion compounds.** The recursive LSTM is the best forecaster at $h = 1$ (0.133), and its error
  grows to 0.42, 0.53 and 0.78 at $h = 5, 10, 20$, already slightly behind the linear model at $h = 5$.
  It reads its own predictions as inputs, so it carries its errors forward: [Section 8](#s8)'s
  forecasting form of exposure bias. By $h = 20$ it is worse than the naive forecast's 0.72 and far
  above the direct LSTM's 0.56.
- **For the linear model the two strategies coincide.** Recursive and direct linear forecasts agree
  to about three decimals (0.551 and 0.552 at $h = 20$), as [Section 8](#s8) predicts when the window
  holds the system's whole linear state. The direct LSTM (0.15, 0.40, 0.50, 0.56) is slightly worse than
  the recursive one at $h = 1$, where its shared head pays for also predicting 19 other horizons, and
  slightly better than the linear model at $h = 10$; at $h = 20$ it is level with the linear model. Beyond
  about $h = 10$ nothing in the observed window predicts the random forcing, so the direct LSTM and
  both linear models head for the same floor, near 0.55.

### Step 6: from forecaster to monitor

[Section 9](#s9) turns the forecaster into a monitor: a large residual $r_t = x_t - \hat x_t$ means the
sensor does not behave as the model of normal operation predicts. Four faults are injected into
samples 7,000 to 7,999, which the model has never seen:

1. a **spike** of $+1.5$ on the single sample 7,100;
2. a **sensor offset** of $+0.8$ on samples 7,250 to 7,349;
3. **doubled excitation**, $\sigma_F \to 2\sigma_F$, on samples 7,450 to 7,749, standing for cavitation
   or a loose part. It is made by re-simulating with the same seed and a doubled noise scale, so
   the series is identical to the clean one before sample 7,450, which the code asserts;
4. a **stuck sensor**: the value frozen at its reading from sample 7,849 on samples 7,850 to 7,949.

The residuals come from fold 3's model, on the clean hold-out 6,000 to 6,999 and on 7,000 to 7,999 of
the faulted series. Three detectors, with thresholds set on the clean hold-out only:

- the **point test**, $|r_t| > 4\sigma$, with $\sigma$ the hold-out residual standard deviation;
- the **rolling RMS** of the residual over 50 samples, alarming above 1.1 times its maximum on the
  hold-out (it detects a change in the level of the residuals);
- the **rolling standard deviation** over 20 samples, alarming below half its minimum on the
  hold-out (it detects the loss of variation).

An alarm is counted when it falls in $[\text{start}, \text{end} + 20)$ of a fault. The normal stretches
exclude 70 samples after each fault, so that residuals still disturbed by the fault do not count as
false alarms.

```python
FAULTS = {"spike": (7100, 7101), "offset": (7250, 7350),
          "excitation": (7450, 7750), "stuck": (7850, 7950)}

scale = np.ones(N * SUB)
scale[7450 * SUB : 7750 * SUB] = 2.0
faulty = simulate(seed=0, force_scale=scale)
assert np.array_equal(faulty[:7450], series[:7450]), "re-simulation must match before 7,450"
faulty[7100] += 1.5
faulty[7250:7350] += 0.8
faulty[7850:7950] = faulty[7849]

mu3, sd3 = fold_stats[ORIGIN]


def residuals(values, first, last):
    """One-step residuals r_t = x_t - prediction for t in [first, last)."""
    zv = (values - mu3) / sd3
    ts = np.arange(first, last)
    X_ = torch.tensor(np.stack([zv[t - W : t] for t in ts]), dtype=torch.float32).unsqueeze(-1)
    return values[ts] - (predict(fold_models[ORIGIN], X_)[:, 0] * sd3 + mu3)


res_clean = residuals(series, 6000, 7000)
res = residuals(faulty, 6000, 8000)  # index i corresponds to sample 6000 + i
sigma = res_clean.std()


def rolling(values, width, fn):
    out = np.full(len(values), np.nan)
    for i in range(width - 1, len(values)):
        out[i] = fn(values[i - width + 1 : i + 1])
    return out


rms = lambda a: np.sqrt(np.mean(a**2))
roll_rms, roll_std = rolling(res, 50, rms), rolling(res, 20, np.std)
hold = slice(0, 1000)  # the clean hold-out inside the residual array
limit_rms = 1.1 * np.nanmax(roll_rms[hold])
limit_std = 0.5 * np.nanmin(roll_std[hold])
print(f"hold-out residual sigma {sigma:.3f}; point threshold {4 * sigma:.3f}; "
      f"rolling-RMS limit {limit_rms:.3f}; rolling-std floor {limit_std:.3f}")
print(f"residual RMS on the clean hold-out {rms(res_clean):.3f}; "
      f"during the excitation fault {rms(res[1450:1750]):.3f}")

alarms = {
    "point": np.abs(res) > 4 * sigma,
    "rolling RMS": np.nan_to_num(roll_rms) > limit_rms,
    "rolling std": (~np.isnan(roll_std)) & (roll_std < limit_std),
}
alarms["point"][:1000] = alarms["rolling RMS"][:1000] = alarms["rolling std"][:1000] = False

print(f"\n{'fault':12s}" + "".join(f"{name:>22s}" for name in alarms))
for fault, (start, end) in FAULTS.items():
    cells = []
    for name, a in alarms.items():
        inside = np.flatnonzero(a[start - 6000 : end + 20 - 6000]) + start
        cells.append(f"{len(inside)} alarms, first +{inside[0] - start}" if len(inside)
                     else "none")
    print(f"{fault:12s}" + "".join(f"{c:>26s}" for c in cells))

normal = np.zeros(2000, dtype=bool)
normal[1000:] = True
for start, end in FAULTS.values():
    normal[start - 6000 : end + 70 - 6000] = False
print(f"\nnormal samples in 7,000-7,999: {normal.sum()}; false-alarm samples: " +
      ", ".join(f"{name} {int((a & normal).sum())}" for name, a in alarms.items()))

fig, axes = plt.subplots(3, 1, figsize=(9, 7), sharex=True)
xs = np.arange(6000, 8000)
for ax, (title, y) in zip(axes, [("residual (point test: dashed at 4 sigma)", res),
                                 ("rolling RMS over 50 samples", roll_rms),
                                 ("rolling std over 20 samples", roll_std)]):
    ax.plot(xs, y, lw=0.8)
    for start, end in FAULTS.values():
        ax.axvspan(start, max(end, start + 3), color="orange", alpha=0.3)
    ax.set_title(title, fontsize=9)
axes[0].axhline(4 * sigma, color="r", ls="--")
axes[0].axhline(-4 * sigma, color="r", ls="--")
axes[1].axhline(limit_rms, color="r", ls="--")
axes[2].axhline(limit_std, color="r", ls="--")
axes[2].set_xlabel("sample (faults shaded: spike, offset, excitation, stuck sensor)")
axes[0].set_ylabel("residual")
axes[1].set_ylabel("RMS")
axes[2].set_ylabel("std")
fig.suptitle("Lab 3: residual monitoring of the faulted stream")
plt.tight_layout()
plt.show()
```

```output
hold-out residual sigma 0.131; point threshold 0.525; rolling-RMS limit 0.195; rolling-std floor 0.038
residual RMS on the clean hold-out 0.134; during the excitation fault 0.210

fault                        point           rolling RMS           rolling std
spike               2 alarms, first +0       21 alarms, first +0                      none
offset              3 alarms, first +0       58 alarms, first +4                      none
excitation        5 alarms, first +151     208 alarms, first +99                      none
stuck             1 alarms, first +100                      none      79 alarms, first +21

normal samples in 7,000-7,999: 239; false-alarm samples: point 0, rolling RMS 0, rolling std 0
```

The thresholds come from the clean hold-out alone: $\sigma = 0.131$ gives a point threshold of
$4\sigma = 0.52$, and the two rolling thresholds sit 10% above and 50% below the extremes of
normal operation. The faulted residual plot above shows why each fault needs its own detector.

- **The spike** is caught at once by the point test. It raises two alarms, because the sample
  after the spike is predicted from a window that ends in the spike and is wrong by about the same
  amount in the opposite direction. The rolling RMS also fires and stays above its limit while the
  spike remains in its 50-sample window; the table cuts the count at the end of the alarm window, so the
  full episode is longer than the 21 samples shown.
- **The offset** is caught by the point test only at its onset and at its end (5 alarms in all). In
  between, the residual is normal: with per-window normalisation the model re-centres on the new
  level within a step, so a sustained offset is invisible once the window has filled with it
  ([Section 9](#s9)). The rolling RMS fires too, only because each of the two jumps stays in
  its 50-sample window. A forecaster that sees a constant offset as normal needs a reference that
  does not move with the sensor.
- **The doubled excitation** produces no extreme residual (two point alarms in this run), but the
  residual RMS rises from 0.135 on the hold-out to about 0.21 during the fault. The rolling RMS crosses
  its limit about 85 samples after the fault starts (30 to 100 samples in the runs prepared with this lab). The margin is small, which is why the
  delay is long: a smaller change would take longer to detect or be missed.
- **The stuck sensor** raises no residual alarm: a frozen reading is predicted with an error that is
  small and nearly constant. The variance floor detects it after the 20-sample window has filled
  with identical values, about 19 samples after the start, and it keeps firing until the sensor
  recovers.
- **False alarms:** none of the three detectors fired in the 239 normal samples. That count is
  too small to estimate a false-alarm rate: by the "rule of three", zero events in 239 samples
  is consistent with a true rate up to about $3/239 \approx 1.3\%$ per sample. A real deployment needs
  days of normal data to set a threshold and to measure its false-alarm rate
  ([Section 9](#s9)), and a longer simulation if you want that number here.

### What you should see

- **Step 1.** The series drifts upward by about 7 over the 8,000 samples, with an oscillation of period
  about 11 samples riding on it.
- **Step 2: Section 8's code loses to the naive forecast.** The normalised test inputs lie almost
  wholly above the range of the training inputs (about 1.0 to 3.6 against $-2.2$ to 2.3), and the
  LSTM's RMSE (about 0.42, naive 0.37) is worse than naive with a negative bias of about 0.3 (0.63
  with the second seed). The model is not mis-trained; it was asked to extrapolate.
- **Step 3: per-window normalisation fixes it.** The RMSE falls to about 0.135 and the bias to about
  zero.
- **Step 4: walk-forward.** Naive about 0.38, seasonal naive about 0.85, linear about 0.16,
  LSTM about 0.136, each with a spread over folds of 0.005 to 0.02. The LSTM is best in every fold, by
  roughly 10 to 20% over the linear model; the seasonal-naive baseline is poor because random
  forcing dominates the periodic load.
- **Step 5: multi-step.** Errors compound in the recursive LSTM (0.13 to 0.73 over 20 steps); the direct
  LSTM and both linear models end near 0.57. Linear recursive and direct are the same.
- **Step 6: the monitor.** The point test catches the spike and the two edges of the offset; the rolling
  RMS catches the excitation fault after about 85 samples; the variance floor alone catches the stuck
  sensor; no false alarms in 239 normal samples. Each fault type needs its own detector.
- **Run time.** Between half a minute and a minute on the machine used to prepare the lab, depending
  on what else was running, with `QUICK = False` (the simulation takes well under a second), and about
  20 seconds with `QUICK = True`, which trains 4 epochs and only the last two folds; with fewer epochs the Step 2 failure is larger (0.61 against 0.37). Expect two to three times
  longer on a laptop.

### Try this

1. **A temporal convolutional network.** Replace the LSTM with a causal stack of dilated 1D
   convolutions that covers the 64-sample window ([Module 03](module_03_EN.html);
   [Exercise 15](#e15)). Compare the walk-forward RMSE and the training time. Both models use the
   per-window normalisation of Step 3.
2. **A probabilistic head.** Give the model two outputs, a mean and a log-variance, and train with
   `torch.nn.GaussianNLLLoss`. Divide the residuals by the predicted standard deviation before the
   point test. Does the rate of false alarms change when the excitation level changes?
3. **A second channel.** Add the known periodic load $\sin(2\pi t/5\,\text{s})$ as a second input
   channel, and compare the LSTM's lead over the linear model (which can take the same channel).
   Does the lead grow?
4. **A CUSUM.** Accumulate the standardised squared residuals, $S_t = \max(0, S_{t-1} + r_t^2/\sigma^2 - k)$
   with a reference value $k$ slightly above 1 (Page 1954), and alarm at a limit. Compare its detection
   delay on the excitation fault with the rolling RMS's 85 samples, at the same false-alarm count.
5. **Another seed.** Re-simulate with `seed=1` and re-run. Which of the lab's conclusions (the
   ordering of the four forecasters, the failure of the globally normalised model, the detection delays) hold, and
   by how much do the numbers move?
