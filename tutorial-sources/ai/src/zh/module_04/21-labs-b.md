## 实验 4 — 带注意力的序列到序列 {#lab4}

**目标。** 你构建一个把数字串反转的 GRU 编码器-解码器，做两遍：一遍在编码器和解码器之间只传一个汇总向量（[第 10 节](#s10)），一遍使用 Bahdanau 的加性注意力（[第 11 节](#s11)）。你要测量瓶颈（序列准确率随源序列长度的变化）、教师强制下与自由运行时准确率之间的差距（暴露偏差），以及束搜索能修复什么、不能修复什么；你还要画出注意力模型在没有被告知该看哪里的情况下自己找到的对齐。一切数据都是合成的，无需下载。这个任务对人来说轻而易举，正因如此，没有注意力的模型的失败才有说服力。

### 步骤 1：token、batch 与 QUICK 开关

词表有 13 个 token：数字 0–9、`PAD`（10）、`BOS`（11）和 `EOS`（12）。源序列是一个 3 到 12 位的数字串，**总是在右侧填充到 12 个位置**，与训练时一致。解码器输入是 `BOS` 后接反转后的数字，解码器目标是反转后的数字后接 `EOS`；两者都填充到 13 个位置，损失会忽略 `PAD`。函数还返回真实长度：编码器做打包（packing）时需要它，注意力做掩码时也需要它。设 `QUICK = True` 时，训练从 1,500 步缩减到 400 步。

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

读一行来检查布局：目标是源序列的数字倒序排列，接着是 12（`EOS`），然后是 `PAD`（10）。解码器输入是目标右移一位、前面加上 `BOS`（11）：在第 $t$ 步，解码器看到真实的前一个 token，并且必须输出下一个。这一移位就是教师强制（teacher forcing）。

### 步骤 2：模型，注意力作为开关

两个实验共用一个类，这样两个模型的区别只在注意力参数上，别无其他。编码器是一个双向 `nn.GRU`，每个方向宽度为 $H = 64$。它在**打包**序列上运行（`pack_padded_sequence`，`enforce_sorted=False`），使反向方向从每个数字串真实的最后一位开始，而不是从填充处开始（[第 7 节](#s7)）。注释向量（annotation）$\mathbf{h}_j$ 是两个方向拼接成的 128 维向量。解码器的初始状态为 $\mathbf{s}_0 = \tanh(\mathbf{W}[\overrightarrow{\mathbf{h}}_S; \overleftarrow{\mathbf{h}}_1])$：即真实最后位置上的前向状态与位置 0 上的反向状态，打包 GRU 的 `h_n` 恰好保存的就是这两个。解码器是一个 `nn.GRUCell`，在 Python 循环中逐步执行。

有注意力时，单元的输入是 `[embedding; context]`，输出层读取 `[s; context]`，与[第 11 节](#s11)相同。加性得分为 $e_j = \mathbf{v}_a^\top\tanh(\mathbf{W}_a\mathbf{s} + \mathbf{U}_a\mathbf{h}_j)$；乘积 $\mathbf{U}_a\mathbf{h}_j$ 对每个源序列只算一次，填充位置的得分设为 $-10^9$，使 softmax 给它们的权重恰好为零，上下文向量则是注释向量的加权和。$\mathbf{W}_a$、$\mathbf{U}_a$ 和 $\mathbf{v}_a$ 只在开启注意力时才创建。

这个类有两个方法供后面的步骤复用：`encode`，对每个源序列运行一次；`step`，让解码器前进一个 token，并同时返回注意力权重（关闭注意力时全为零）。`pack` 参数是为实验末尾的可选部分准备的。

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

注意力模型多出约 38,600 个参数。其中只有 12,352 个属于注意力网络本身（$64\times64 + 128\times64 + 64$）；其余来自解码器单元和输出层变宽，因为两者现在都还要读取 128 维的上下文向量。手工计数是检查架构是否就是你想搭的那个的好办法：解码器 `GRUCell(32, 64)` 有 $3\cdot64\cdot32 + 3\cdot64\cdot64 + 2\cdot3\cdot64 = 18{,}816$ 个参数，`GRUCell(160, 64)` 有 43,392 个。

### 步骤 3：用教师强制训练两个模型

在目标位置上计算交叉熵，忽略 `PAD`；Adam，学习率 $3\times10^{-3}$；梯度范数裁剪到 1；batch 大小 64；每一步都随机生成一个长度为 3 到 12 的新 batch，因此不存在可供过拟合的有限训练集。两个模型都从 `torch.manual_seed(0)` 开始，看到的 batch 也相同（数据生成器的随机种子一致）。打印的损失是最后 50 步的平均值。

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
  step  500  loss 0.5913
  step 1000  loss 0.4242
  step 1500  loss 0.3684
with attention
  step  500  loss 0.0149
  step 1000  loss 0.0100
  step 1500  loss 0.0002
```

损失是在真实目标 token 上的平均值，单位为奈特（nat）。有注意力的模型在第 500 步时已低于 0.02，基本上训练完毕。没有注意力的模型在 1,500 步之后仍在 0.37 左右：它能答对一些数字，却在串中其他位置出错，下一步会把这一点量化。

### 步骤 4：准确率随长度的变化，教师强制与自由运行

对每个模型、每种长度给出三个数，分别在长度为 4、8 和 12 的各 500 个新数字串上计算：

- **序列准确率**：每一位数字和 `EOS` 都正确，解码时在模型自己的输出上贪心解码（这是部署时唯一要紧的数字）；
- **教师强制下的 token 准确率**：每一步都给定*真实*的前一个 token，与训练时相同；
- **自由运行时的 token 准确率**：每一步都给定模型自己的前一个输出。

token 准确率统计 $L+1$ 个真实目标位置，包括 `EOS`。后两者之间的差距就是暴露偏差（exposure bias）。

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
no attention      4     98.4%           99.7%         99.4%
no attention      8     42.6%           91.4%         80.3%
no attention     12      1.0%           74.1%         52.7%
attention         4    100.0%          100.0%        100.0%
attention         8    100.0%          100.0%        100.0%
attention        12    100.0%          100.0%        100.0%
```

三点观察，每一点都是正文中的一个论断，现在你可以检验它。

1. **瓶颈。** 没有注意力时，序列准确率随长度急剧下降：在这次运行中，长度 4 时约为 98%，长度 8 时为 43%，长度 12 时为 1%。一个由 64 个数组成的向量必须按顺序携带最多 12 位数字，而一个用梯度下降训练了 1,500 次更新的 64 维状态做不到这一点。大部分损伤发生在串的远端：长度 8 时 token 准确率（教师强制）为 91%，长度 12 时为 74%，所以模型能答对许多位数字，却几乎从不能全部答对。
2. **暴露偏差。** 没有注意力时，自由运行的 token 准确率低于教师强制下的准确率，而且差距随长度扩大：长度 4 时几乎没有差距，长度 8 时相差 11 个百分点（91.4% 对 80.3%），长度 12 时相差 21 个百分点（74.1% 对 52.7%）。一位错误的数字会把解码器推入一个它在训练中从未见过的状态，之后的预测随之受损。
3. **注意力消除了这两个问题。** 有注意力时，两种模式下每种长度的准确率都是 100%，所以根本找不到差距：解码器能读取它需要的那位数字，引发误差累积的那些错误也就不会出现。

### 步骤 5：束搜索对贪心解码

更好的搜索能挽救瓶颈模型吗？下面的束搜索（beam search）遵循[第 10 节](#s10)：按累积对数概率保留 $k = 4$ 个最好的部分序列，某个假设输出 `EOS` 时就把它放到一边，其余的继续扩展，当没有剩余假设或满 13 步时停止。它一次处理一个样本。在 200 个长度为 12 的数字串上运行它，并在同样的数字串上与贪心解码比较。

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
greedy     0/200 correct strings, token accuracy 52.3%
beam k=4   0/200 correct strings, token accuracy 49.1%
```

束搜索并没有挽救这个模型：两种方法在 200 个数字串中都一个也没答对，token 准确率还从 52.3% 降到了 49.1%。（这里贪心解码给出 52.3%，而步骤 4 中自由运行为 52.7%，是因为这是另一组 200 个数字串。）搜索本身完成了它的任务。在修订本文时做的一次检查中（同一次运行，用模型自己的对数概率给每个输出打分），对全部 200 个数字串，束搜索的答案都至少与贪心的答案一样可能，而且在 12 位数字中答对的略多一些，为 49.9% 对 48.6%。token 准确率更低来自最后一个位置：束搜索在它的 `EOS` 处停止，代码把其余位置填充掉；它在 122 个数字串上提前一到两个 token 停止，贪心解码则是 114 个；而贪心解码总是运行满 13 步，只要它在那个位置输出 `EOS`，即使之前已经输出过一次，该位置也算它对。一个错误模型给出的更可能的输出，并不是更准确的输出。没有注意力的模型并不知道答案，对它的输出做任何搜索都无法提供它从未得到过的信息。当模型的分布是对的、只是贪心路径不走运时，搜索才有帮助，就像[第 10 节](#s10)的玩具例子那样；它无法修复一个错误的分布。

### 步骤 6：读出对齐

注意力权重是模型对自己看了哪里的陈述，但要附上[第 11 节](#s11)的那条告诫。用注意力模型解码一个 8 位数字串，把权重向量堆叠成一个 $9\times8$ 矩阵（行：输出步，包括 `EOS`；列：源位置），并以数字作为刻度标签画出来。由于源序列被填充到了 12，权重被切片到 8 个真实位置；填充位置的权重按构造恰好为零，最后一行打印会确认这一点。右图画出步骤 4 的序列准确率。

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
peak weights:       ['0.84', '0.75', '0.66', '0.71', '0.65', '0.79', '0.63', '0.68', '0.26']
weight on padding:  0.000000
```

对齐是反对角线：为了输出第一位数字，解码器看源序列的最后一位，接着看它前面那一位，依此类推，输出 `EOS` 时看第一个位置。模型从未被告知这一点；唯一的信号是输出的交叉熵。八个数字行上的峰值权重在 0.63 到 0.84 之间；`EOS` 行最不确定，峰值为 0.26，落在位置 0 上，而最后一位输出数字正来自这个位置。一条明亮的反对角线，就是这个任务的正确解的样子。

### 步骤 7（可选）：故意重现打包错误

[第 7 节](#s7)警告过，双向编码器在未打包的填充输入上，与在未填充输入上的表现不同。下面就是这种失败。用 `pack=False` 在填充后的 batch 上训练一个注意力模型（步数更少），然后用两种方式在长度为 4 的数字串上测试它：像训练时那样填充到 12，以及截到真实宽度 4。同样训练的打包模型也用相同方式测试。

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
  step  266  loss 0.0273
  step  532  loss 0.0194
  step  798  loss 0.0105
packed encoder
  step  266  loss 0.0128
  step  532  loss 0.0083
  step  798  loss 0.0054
unpacked  length 4: padded to 12 100.0%   cut to 4   0.0%
packed    length 4: padded to 12 100.0%   cut to 4 100.0%
```

未打包的编码器学会了在到达第一位数字之前先读填充 token；给它一个没有这些填充的数字串，它的反向状态就是训练中从未产生过的状态，于是它失败了。打包的编码器无论周围是什么，都从真实的最后一位数字开始反向方向，所以它的答案不取决于 batch 是怎样填充的。实践中的教训是：无论用哪种方式填充，都要严格按训练时的方式测试；只要某一层是反向读取的，就要打包。

### 你应该看到什么

- **参数量。** 没有注意力时 66,381 个，有注意力时 104,973 个；其差值中，注意力网络本身占 12,352 个。
- **训练。** 注意力模型的损失在几百步内接近零；没有注意力的模型在 1,500 步之后仍远高于此。
- **瓶颈。** 没有注意力时，序列准确率在长度 4 时约为 98%，长度 8 时为 43%，长度 12 时为 1%。有注意力时三者都是 100%。（这是本次运行的数字；换一个随机种子，中间那个数会变动几个百分点。）
- **暴露偏差。** 没有注意力时，自由运行的 token 准确率落后于教师强制下的 token 准确率，长度 4 时落后 0.3 个百分点，长度 8 时 11 个，长度 12 时 21 个。有注意力时两者都是 100%。
- **搜索。** $k = 4$ 的束搜索与贪心解码一样，让瓶颈模型在长度 12 时 200 个数字串中仍是 0 个正确，token 准确率从 52.3% 降到 49.1%（束搜索稍微更常提前在 `EOS` 处停止）：搜索无法提供模型不知道的东西。
- **对齐。** 热图的第 $t$ 行在源位置 $7 - t$ 处达到峰值（`EOS` 在位置 0 处），数字行上的峰值权重为 0.63 到 0.84。
- **错误。** 未打包的模型在像训练时那样填充的数字串上很准确，在截到真实宽度的数字串上失败；打包的模型两者都能处理。

具体数字取决于随机种子和所用的 BLAS 库，任何百分比的最后一位在你的机器上都可能不同。规律不应改变。

### 动手试试

1. **计划采样。** 在 `forward` 中，以一个在训练过程中从 0 线性升到 0.5 的概率，输入模型自己的前一个 argmax，而不是真实 token。把没有注意力的模型的自由运行准确率与上表比较。两列中哪一列变了，差距缩小了吗？
2. **换一种得分。** 把加性得分换成 Luong 的点积：用一个线性层把 128 维的注释向量投影到 64 维，并用 $\mathbf{s}^\top\mathbf{h}_j$ 给每个位置打分。比较第 500、1,000 和 1,500 步的训练损失。
3. **超出训练长度。** 在训练中从未见过的长度 13 到 16 上测试注意力模型（源宽度和 `MAX_LEN` 必须随之增大）。反对角线在哪里断开？模型需要知道什么才能把它延伸下去？
4. **非单调的对齐。** 用 Python 的 `datetime` 生成日期对（`'14 March 2026'` 到 `'2026-03-14'`），按字符处理，并在其上训练注意力模型。对齐不再是一条反对角线，而是在三个字段之间跳转的一组块。

## 实验 5 — 对角线性循环对 LSTM {#lab5}

**目标。** 你按线性循环单元（Linear Recurrent Unit，LRU）的风格实现一个对角复数线性循环（[第 13 节](#s13)），确认它的循环形式和卷积形式计算的是同一个映射，给两者计时，然后在长滞后的回忆任务上把这个线性循环与普通 RNN 和 LSTM 比较。你会看到一个由初始化时特征值的模决定的记忆长度，以及 LSTM 的遗忘门偏置要做多少工作才能与之匹敌。一切数据都是合成的，无需下载。

### 步骤 1：这一层

这一层有 $N = 64$ 个复数模态。每个模态有一个特征值 $\lambda_n = \exp(-e^{\nu_n} + i e^{\vartheta_n})$，其中 $\nu_n$ 和 $\vartheta_n$ 是实参数（代码中的 `nu_log` 和 `theta_log`），所以对参数的任何取值都有 $|\lambda_n| = \exp(-e^{\nu_n}) < 1$：一次梯度步不可能让循环变得不稳定。初始化时，模在圆环 $[r_{\min}, r_{\max}] = [0.9, 0.999]$ 上均匀抽取（按 $|\lambda|^2$ 均匀），相位在 $[0, \pi/10]$ 中均匀抽取。对于模：若 $u\sim U(0,1)$，则 $|\lambda|^2 = u(r_{\max}^2 - r_{\min}^2) + r_{\min}^2$，而由 $|\lambda| = e^{-e^\nu}$ 可得 $\nu = \ln(-\tfrac12\ln|\lambda|^2)$；代码正是这样做的。

batch 维记作 `batch`，输入矩阵记作 `B_in`（符号 $B$ 在本模块其他地方表示 batch 大小），这一层计算

$$h_t = \lambda \odot h_{t-1} + \gamma \odot (\mathbf{B}_\text{in} x_t), \qquad
y_t = \operatorname{Re}(\mathbf{C} h_t) + \mathbf{D} x_t, \qquad
\gamma = \sqrt{1 - |\lambda|^2},$$

其中 $\gamma$ 对每个模态做归一化，使其状态在白噪声输入下保持单位方差（[第 13 节](#s13)）。它有两个必须一致的前向函数。

- `forward_loop` 是循环形式，一次一步：内存恒定，是生成时使用的形式。
- `forward` 是卷积形式。展开得到 $h_t = \sum_{k\ge0}\lambda^k\,\gamma\mathbf{B}_\text{in}x_{t-k}$，所以 $N$ 个模态中的每一个，都是其驱动 $u_t = \gamma\mathbf{B}_\text{in}x_t$ 与卷积核 $(\lambda^0, \lambda^1, \dots, \lambda^{T-1})$ 的因果卷积。FFT 把这个卷积变成乘积；把两者都填充到长度 $2T$ 可以避免循环卷积的环绕，前 $T$ 个输出就是因果的那部分。

两个函数共用驱动 $u$，这样计时比较的只是混合时间维度的两种方式。

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

64 个模态的模分布在 0.902–0.9987 之间，所以这一层一开始就具有半衰期 $\ln 0.5/\ln|\lambda|$ 从几步到几百步不等的记忆。圆环的两个端点对应 6.6 步和 693 步；64 次随机抽取达不到端点。模有意打印到小数点后六位：在单位圆附近，半衰期取决于小数点后第五位（0.9987 对应 533 步，0.998724 对应 543 步）。在这里，记忆在任何训练之前就由一个你能读出来的数决定了。

### 步骤 2：一个映射，两种算法

检验[第 13 节](#s13)的论断：循环和 FFT 卷积是同一个线性时不变系统。对 $T = 256$、1,024 和 4,096（batch 大小 8，4 个输入通道，3 个输出），在关闭梯度的情况下，打印两个输出之间的最大差值，以及各自三次墙钟时间中的最好成绩。

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
  256        3.10e-06        4.2      3.8      1.1x
 1024        1.29e-05       19.8     13.8      1.4x
 4096        1.41e-05       79.1     70.0      1.1x
```

两个输出在 float32 舍入误差范围内一致，在量级为 1 的输出上约为 $10^{-5}$ 量级；$T$ 越长差值略大，因为卷积核 $\lambda^k$ 是用 float32 计算的，其相位误差随 $k$ 增长：这是用两种方式计算的同一个函数，而不是彼此近似的两个函数。循环需要 $T$ 个顺序步，所以它的时间随 $T$ 线性增长。在 CPU 上的如实结论是：FFT 形式最多只是略快一些，而在最长的长度上优势就消失了：在准备本实验所用的机器上跑五次，它在 $T = 256$ 时快 1.1 到 1.7 倍，在 $T = 1{,}024$ 时快 1.2 到 1.6 倍，在 $T = 4{,}096$ 时为 0.7 到 1.1 倍，五次中有三次比循环还慢。这并不矛盾。FFT 做 $O(T\log T)$ 的工作，但常数很大（64 个模态中的每一个都要做三次长度为 $2T$ 的变换），循环做 $O(T)$ 个小运算，而只有几个核心的 CPU 几乎没有可供 FFT 形式利用的并行度。卷积形式在存在并行度的地方才划算：在 GPU 上，循环那些微小的顺序步让硬件闲置，而变换能把硬件填满；在训练中，需要一次得到整个序列的梯度。在生成时，循环仍然是正确的形式，因为它每个通道只需要 $N$ 个数的状态，每个 token 的工作量恒定。计时取决于机器以及机器上同时运行的其他程序；预期顺序相同，数字不同。

### 步骤 3：一个需要长记忆的回忆任务

**延迟回忆。** 一个序列的长度为 $L+1$。它的第一个 token 是 8 个符号（0–7）之一；其余 $L$ 个 token 是空白（token 8）。目标是第一个符号，在最后一步读出。随机水平为 12.5%。只有当关于 token 0 的信息在 $L$ 步之后仍然保留时，模型才能成功，而前向信号和梯度都需要这种保留（[第 4 节](#s4)）。除此之外没有别的可学，这使该任务成为衡量记忆所及范围的干净指标。$L$ 就是滞后（lag）。

四个模型，每个都由一个 `Embedding(9, 16)`、一个宽度为 64 的循环核心，以及一个读取最后一步的输出层组成：

1. `nn.RNN(16, 64)`，一个普通的 tanh 网络；
2. `nn.LSTM(16, 64)`，遗忘门偏置为 1（初始化时半衰期为 2.2 步）；
3. 同上，但遗忘门偏置为 5（半衰期为 103 步；见[第 5 节](#s5)中的表）；
4. `DiagLinearRecurrence(16, 64, N=64)`，之后接 GELU 和 `Linear(64, 8)`。

遗忘门偏置的切片是 `bias_ih_l0[H:2*H]` 和 `bias_hh_l0[H:2*H]`，与[第 5 节](#s5)相同：把前者设为该值，后者置零，使两者之和等于该值。

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

### 步骤 4：在三种滞后下训练

每个模型在滞后 25、100 和 200 下各训练 400 次更新（batch 大小 64，AdamW，学习率 $3\times10^{-3}$，梯度范数裁剪到 1）。普通 RNN 只在 25 和 100 下运行：它在 200 时很慢，而在 100 时，它在某些随机种子上成功，在另一些上停留在随机水平。表中报告在 1,000 个新序列上的测试准确率，以及最近 10 次更新的平均损失首次降到 0.05 以下时的更新序号（如果从未发生，则为一条短横线）。随机水平的准确率为 12.5%，初始损失接近 $\ln 8 = 2.08$。

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
vanilla RNN                 77.2%       -      100.0%       -     skipped
LSTM, forget bias 1         11.8%       -       11.8%       -       11.8%       -
LSTM, forget bias 5        100.0%      74       12.6%       -       12.6%       -
diagonal linear            100.0%     124      100.0%     238      100.0%       -
```

每个条目都来自一次训练运行，从 `torch.manual_seed(0)` 开始。换一个随机种子，表中哪个格子成功就可能改变，在模型记忆所及范围的边缘尤其如此。在用随机种子 1 到 4 做的运行中（`run_recall(..., seed=s)`，在修订本文时完成），遗忘门偏置为 5 的 LSTM 在四次中有两次学会了滞后 100，普通 RNN 在一次（随机种子 2）中达到滞后 100 下的 100%，在另外三次中停留在随机水平。读这张表要看它的规律，而不是任何单个格子。规律是：由初始化时特征值的模决定的记忆，在每个随机种子上都能覆盖全部三种滞后；由门偏置决定的记忆，所及范围大约就是该设置所允许的那么远（偏置 5 总能学会滞后 25，从不能学会滞后 200），而偏置为 1 的 LSTM 从未脱离随机水平。普通 RNN 是这次运行中的异类：在滞后 100 下为 100%，在滞后 25 下却只有 77%；而在滞后 100 下，它的损失在 400 次更新后仍约为 1.1，所以它是很晚才找到答案，还不够自信。在五个随机种子中有三个，它从未找到答案。一个起初只有短记忆的模型可以在预算内找到长记忆，但能否找到要看运气。“solved”一列中的短横线表示平均损失从未降到 0.05 以下，这在测试准确率为 100% 时也可能发生，即 logits 已经正确但还不够自信，就像这里的普通 RNN 一样。

### 步骤 5：查看学习曲线

准确率表掩盖了训练的过程。画出每个模型在滞后 100 下的损失：成功的模型会先出现一段停留在 $\ln 8 = 2.08$ 的平台，然后下降；失败的模型则一直停在平台上。平台的长度就是寻找一个可以跟随的梯度所花的时间。在所示的运行中，线性循环在约 100 次更新后离开平台，而普通 RNN 要到约 200 次之后才离开，而且不稳定，到第 400 次更新时仍接近 1.1。

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

### 你应该看到什么

- **相等。** 在 float32 下，循环和 FFT 卷积的结果一致，差异只有 $10^{6}$ 分之几到 $10^{5}$ 分之几。
- **速度。** 在 CPU 上，FFT 形式最多只比循环略快（五次运行中，$T = 256$ 和 1,024 时快 1.1 到 1.7 倍），在 $T = 4{,}096$ 时并不更快（0.7 到 1.1 倍）；计时噪声很大。卷积模式的理由在于并行度，而 GPU 提供了并行度。
- **由初始化决定的记忆。** 64 个模分布在 0.902–0.998724 之间，半衰期约为 6.7 到 543 步。正是这个范围，而不是任何学到的东西，使线性循环能够触及第一个 token。
- **回忆。** 400 次更新后，线性循环在全部三种滞后下都达到 100%（随机种子 0 到 4 在准确率上全部一致；损失首次降到 0.05 以下的更新序号有所不同，在滞后 200 下，五个随机种子中有三个在预算之内）。普通 RNN 只部分学会了滞后 25（五个随机种子上为 62–87%），在滞后 100 下表现飘忽：随机种子 0 和 2 上为 100%，其余三个为随机水平（11–14%）。遗忘门偏置为 1 的 LSTM 即使在滞后 25 下也停留在随机水平，每个随机种子都如此。遗忘门偏置为 5 的 LSTM 在滞后 25 下学得最快（全部五个随机种子上都在 56–83 次更新后达到 100%），在五个随机种子中有两个学会了滞后 100（第三个为 73%），在滞后 200 下为随机水平。随机种子 1 到 4 在修订本文时用 `run_recall(..., seed=s)` 各跑了一次；你可以试试。
- **这说明了什么，没说明什么。** 它说明的是在预算内的可训练性：一种是在初始化时直接设定的记忆长度，另一种是 LSTM 必须通过门偏置去寻找的记忆长度。它并没有说明 LSTM 无法保持长记忆；有了更长的预算、chrono 初始化（[第 5 节](#s5)）或更大的偏置，原则上它可以做到。

表中的数字来自你机器上的运行；最后几位数字，尤其是更新序号，会随库版本而变化。

### 动手试试

1. **干扰符号。** 把空白换成从另一组 8 个干扰符号中随机抽取的 token。在一次试运行中，线性循环仍然学会了滞后 25 和 100：它的嵌入学会把干扰符号映射到零附近，这是在输入处对内容的过滤。当保留什么取决于上下文时，选择性就很重要了。构建选择性复制的变体，即要回忆的符号是随机位置上一个标记 token 之后的那个符号，并比较各个模型。
2. **并行扫描。** 用结合算子 $(a_1, b_1)$ 之后接 $(a_2, b_2) \mapsto (a_1a_2,\ a_2b_1 + b_2)$ 在 $\log_2 T$ 轮内计算这个循环，并与 `forward_loop` 对照检查。
3. **初始圆环就是记忆。** 把圆环收窄到 $[0.9, 0.95]$，重新运行滞后 100 和 200。先预测哪一个会失败：$|\lambda| = 0.95$ 的半衰期是 13.5 步。
4. **一个最简单的选择性循环。** 让步长依赖于输入，$\lambda_t = \exp(\Delta_t\log\lambda)$，其中 $\Delta_t = \operatorname{softplus}(\mathbf{w}^\top x_t + c)$，并用循环计算它。在第 1 项的干扰符号任务上，它能在没有嵌入帮助的情况下学会忽略干扰符号吗？
