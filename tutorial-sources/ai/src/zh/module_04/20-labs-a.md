## 实验 1 — 用 NumPy 从零实现字符级 RNN {#lab1}

**目标。**你用纯 NumPy 实现[第 2 节](#s2)的前向传播和[第 3 节](#s3)的随时间反向传播，用数值方法检验梯度，再用截断的随时间反向传播训练网络，让它预测一份合成维护日志的下一个字符。然后你测量它学到了什么：把它与 n 元语法基线比较，在两个温度下从它采样，并逐行对照日志的规则核查样本。网络学会了每一条局部规则，包括一个数值阈值。它没有学会唯一一条需要比反向传播所及范围更长的记忆的规则：结束标签必须重复开头标签。这一失败就是[第 4 节](#s4)的梯度消失在行为上的表现，[实验 2](#lab2) 会展示 LSTM 如何修复它。数据是合成的，无需下载，本实验在笔记本电脑 CPU 上约需一分钟。只需要 NumPy 和 matplotlib。

### 步骤 1：一份带有一条长程规则的维护日志

语料是生成出来的，因此其中的每条规则都是已知的，事后可以逐条核查。每一行的形式为

```text
F2 pres 4.0 bar night shift ok /F2
```

并遵守四条规则。单位必须与物理量相符（`temp` 配 `C`，`vib` 配 `mm/s`，`pres` 配 `bar`）。状态必须与数值相符（temp $\ge 75.0$、vib $\ge 7.1$ 或 pres $\ge 5.0$ 时为 `high`，否则为 `ok`）。状态之前可以有一条可选的备注。结束标签重复开启这一行的设备标签；它的第一个字符出现在开头标签最后一个字符之后 18 到 36 个字符处（在生成的各行上测得）。其中三条规则是局部的：单位紧挨着数值，而数值和单位位于状态之前至多 24 个字符处，所以一个能看到最近 25 个字符的模型就能遵守它们。第四条在同样的意义上不是局部的：开头标签是八个之一，结束标签是它的副本，所以只有跨越整行的记忆，才能比八选一的猜测更好地预测结束标签。

第一段代码写出生成器，打印前五行以及后面各步骤要对照检验的数字，其中包括生成器自身的熵：任何模型在这份文本上所能达到的最小损失，由生成器所做的随机抽取算出。它是本实验的下限，而真实数据从不允许你算出这个下限。什么都没学到的模型输出 $V$ 个字符上的均匀分布，所以它的损失是 $\ln V$；第一个训练损失必须接近这个值（[第 2 节](#s2)）。最后 10% 的字符留作验证文本。

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

词表有 37 个字符：日志用到的字母和数字、空格、句点、斜杠和换行符。始终预测 `ok` 大约四行中能对三行，所以一个声称学会了状态规则的模型必须超过这个数字，而不是超过 50%。这就是[模块 01](module_01_ZH.html) 的规则：每一个数字都要带上它的基线。

### 步骤 2：n 元语法基线

在构建网络之前，先弄清楚廉价的方法能做到什么。字符 **n 元语法模型**（n-gram model）通过计数，由前 $n-1$ 个字符预测下一个字符。单靠计数会给任何没见过的东西零概率，所以每一阶都用低一阶的模型来平滑：

$$
p_n(c \mid \text{ctx}) = \frac{\operatorname{count}(\text{ctx}, c) + \alpha\, p_{n-1}(c \mid \text{ctx}')}
{\operatorname{count}(\text{ctx}) + \alpha},
$$

其中 $\text{ctx}'$ 是去掉最早一个字符后的上下文，$p_1$ 是做了加 $\alpha$ 平滑的一元分布。这是递归应用的加性平滑；$\alpha = 0.1$ 使得在计数足够多的地方由计数说了算。验证文本上的交叉熵，以每字符奈特数（nats）计，就是网络必须超过的数字。5 元语法模型能看到四个字符的上下文。

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

损失从没有上下文时的每字符约 3.2 奈特（只比 $\ln 37 = 3.61$ 略低），降到有四个字符上下文时的约 0.48。每多一个字符的上下文都有回报，而只有当上下文覆盖了局部规则中最长的依赖时，增益才会停止，但 n 元语法的计数表做不到这一点：25 个字符的上下文可能取值的数目远远多于日志的行数。5 元语法的损失就是网络要证明自己用到了四个字符以上的上下文所必须超过的数字。基线在训练文本上拟合、在验证文本上评分，这是诚实的划分；在训练文本上评分会奖励死记硬背。

### 步骤 3：参数

网络就是[第 2 节](#s2)的普通递推，其中独热输入实现为按列查表：

$$
\mathbf{h}_t = \tanh\!\big(\mathbf{W}_{xh}[:, x_t] + \mathbf{W}_{hh}\mathbf{h}_{t-1} + \mathbf{b}_h\big),
\qquad
\mathbf{y}_t = \mathbf{W}_{hy}\mathbf{h}_t + \mathbf{b}_y .
$$

代码按每个矩阵连接的对象为它命名：`W_xh` 是正文中的 $\mathbf{W}_x$，`W_hh` 是 $\mathbf{W}_h$，`W_hy` 是 $\mathbf{W}_y$。初始化遵循[第 2 节](#s2)。循环矩阵的元素取 $N(0, 1/H)$，使其奇异值为 1 的量级，状态在一开始既不消亡也不饱和。输入和输出权重很小（$N(0, 0.01^2)$），所以最初的 logits 几乎为零，第一个损失接近 $\ln V$。当 $H = 128$、$V = 37$ 时，参数量就是[第 2 节](#s2)示例中的 26,021。

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

### 步骤 4：前向传播与反向传播

函数接收形状为 $(B, T)$ 的整数数组 `X` 和 `Y`：输入字符以及紧随其后的字符。状态存为形状 $(H, B)$ 的矩阵，batch 中每个流占一列，于是一次矩阵乘法就把全部 $B$ 个流推进一步。

前向循环就是递推。损失是 $B \cdot T$ 个位置上 $-\ln p_t(c_{t+1})$ 的均值，即实际紧随其后的字符 $c_{t+1}$ 所得到的负对数概率；softmax 在减去最大 logit 之后计算，与[模块 02](module_02_ZH.html) 一样，这样就不会有指数溢出。

反向循环就是写成代码的[第 3 节](#s3)，从 $t = T-1$ 一直运行到 $0$，采用第 3 节的记号：$\boldsymbol{\delta}_t = \partial\mathcal{L}/\partial\mathbf{h}_t$ 是状态处的梯度（代码中的 `dh`），$\mathbf{g}_t = \partial\mathcal{L}/\partial\mathbf{z}_t$ 是预激活处的梯度（`dz`），$\partial\mathcal{L}/\partial\mathbf{y}_t$ 是 logits 处的梯度（`g`），它们都是列向量：

$$
\begin{aligned}
\frac{\partial\mathcal{L}}{\partial\mathbf{y}_t} &= \tfrac{1}{BT}\,\big(\mathbf{p}_t - \text{onehot}(c_{t+1})\big)
&& \text{softmax 与交叉熵}\\
\boldsymbol{\delta}_t &= \mathbf{W}_{hy}^\top \frac{\partial\mathcal{L}}{\partial\mathbf{y}_t} + \mathbf{W}_{hh}^\top \mathbf{g}_{t+1}
&& \text{来自输出与来自未来}\\
\mathbf{g}_t &= \boldsymbol{\delta}_t \odot (1 - \mathbf{h}_t^2)
&& \text{经过 tanh}
\end{aligned}
$$

参数梯度在 $t$ 上累加：$\partial\mathcal{L}/\partial\mathbf{W}_{hh}$ 累加 $\mathbf{g}_t\mathbf{h}_{t-1}^\top$，$\partial\mathcal{L}/\partial\mathbf{b}_h$ 累加 $\mathbf{g}_t$，$\partial\mathcal{L}/\partial\mathbf{W}_{hy}$ 累加 $(\partial\mathcal{L}/\partial\mathbf{y}_t)\,\mathbf{h}_t^\top$，而 $\mathbf{W}_{xh}$ 中对应输入字符 $x_t$ 的那一列累加 $\mathbf{g}_t$。`np.add.at` 处理 batch 中几个流在第 $t$ 步恰好是同一字符的情况。起始状态 $\mathbf{h}_0$ 是一个参数，因为训练要把它从一个块带到下一个块；梯度不会传播进它，这正是截断的含义。

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

初始损失与 $\ln 37$ 吻合：输出层一开始不携带任何信息。如果第一个损失与此相差很远，那就说明在任何训练之前已经有了 bug。不过它只检验了前向传播；反向传播需要自己的检验。

### 步骤 5：检验梯度

手写的反向传播在一个 float64 的微型模型上检验，与[第 3 节](#s3)一样：把参数的一个元素扰动 $\pm\epsilon$，$\epsilon = 10^{-5}$，构造中心差分 $\big(\mathcal{L}(\theta+\epsilon) - \mathcal{L}(\theta-\epsilon)\big)/2\epsilon$，再通过相对误差 $|a - n|/\max(|a|, |n|, 10^{-12})$ 与解析梯度比较。模型取 $H = 5$，batch 为 2，$T = 4$ 步。多步很重要：漏掉 $\mathbf{W}_{hh}^\top\mathbf{g}_{t+1}$ 项的实现，在 $T = 1$ 时能通过检验，在 $T = 4$ 时就会失败。每个参数随机检验五个元素。

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

每个参数都与有限差分吻合到百万分之几或更好。反向传播就是前向传播的梯度，可以开始训练了。

### 步骤 6：用截断的随时间反向传播训练

训练文本被排成 $B = 32$ 个并行流，每个流是日志中连续的一段。每次更新处理每个流接下来的 $T = 32$ 个字符，一个块结束时的状态就是下一个块的起始状态。状态在数值上向前传递，在梯度上被切断，这就是截断的随时间反向传播（[第 3 节](#s3)）。当流用完时，状态重置为零，遍历从头开始。流 $i$ 始终待在 batch 的第 $i$ 列，所以某一列中的状态属于在那里继续的数据（[第 7 节](#s7)）。

优化器是 Adam，用四行写出（[模块 02](module_02_ZH.html)），学习率为 $3\times 10^{-3}$。梯度按全局范数裁剪到 5：全局范数是所有参数平方和的平方根，若它超过 5，每个梯度都乘以 $5/\text{norm}$（[第 4 节](#s4)）。每 250 次更新，脚本打印该窗口内的平均训练损失、验证损失（从 $\mathbf{h} = \mathbf{0}$ 开始对整个验证文本做一遍）、最近一次的梯度范数和已用时间，并保留验证损失最好的参数，这就是早停。

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

第一个窗口的平均训练损失约为 1.15，它主要由最初几十次更新决定，那时损失从 3.61 往下降；到第 500 次更新时，网络在两份文本上都达到约 0.4。此后验证损失在约 0.39 和 0.41 之间徘徊，而训练损失缓慢降到约 0.38，所以最好的检查点只是一片平坦区域中最低的那一点（具体在哪次更新，每次运行可能不同）。最好的验证损失约为每字符 0.39 奈特，明显低于 5 元语法的 0.48，所以网络用到了四个字符以外的上下文。全部 2,000 次更新中最大的梯度范数始终在 1 附近，所以阈值为 5 的裁剪从未触发：在这里它是一张安全网，而不是起作用的成分。[第 7 节](#s7)说要始终做裁剪，因为它没有任何代价，而它真正起作用的那一次运行，恰恰是不裁剪就会以 `nan` 告终的那一次。

损失有一个下限，步骤 1 已经算出了它。日志的随机性在于设备标签、物理量、数值的各位数字和备注的选择；单位、状态和结束标签都由它们决定。把各项熵相加得到每行 9.55 奈特，按每行约 31 个字符计，就是每字符 0.310 奈特：无论模型多大，在这个生成器产生的文本上都不可能得分更低。一个把每条局部规则都学对、但结束标签只能八选一去猜的模型，每行要多付 $\ln 8 = 2.08$ 奈特，它的下限是 0.378。网络的 0.39 与这第二个下限相差不到 0.01。它几乎完美地学会了局部规则，而它的损失所剩下的部分，就是它记不住的结束标签。（这些下限是对生成器算出的；验证文本只是从中抽取的一个样本，所以两个数字只能在大约这个精度上吻合。）

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

### 步骤 7：从训练好的网络中采样

采样就是[第 1 节](#s1)的一对多形态。从 $\mathbf{h} = \mathbf{0}$ 和一个换行符开始，算出 logits，除以温度 $\tau$，取 softmax，用设定了种子的生成器抽取一个字符，再把它反馈回去。温度的解释见[第 2 节](#s2)；[模块 07](module_07_ZH.html) 讨论一般的采样。$\tau = 0.5$ 时，分布向最可能的字符锐化；$\tau = 1$ 时，就是模型自己的分布。

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

这些样本读起来像日志。单位跟着物理量走，数值是合理的数字，状态大多与数值相符（$\tau = 1$ 时有一行，`C1 temp 84.8 C night shift ok`，应当是 `high`）。不过，看看结束标签：上面 $\tau = 0.5$ 时的六行，每一行结束时用的标签都不是开启这一行的那个。网络学会了结束标签长什么样（一个斜杠，加上八个标签之一），却没有学会该用哪一个。计数可以定论。

### 步骤 8：对照规则核查样本

一个正则表达式描述了一行格式正确的日志：设备标签、物理量、一位小数的数值、单位、来自四条备注列表的可选备注、状态和结束标签。捕获各个分组，核查就可以在能解析的行上分别检验每条规则。样本的第一行和最后一行可能被截断，所以核查跳过它们。报告四个比例：格式正确的行，以及在这些行中，单位与物理量相符的、状态与数值相符的、结束标签与开头标签匹配的比例。均匀地猜测标签可以得到 $1/8 = 12.5\%$。

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

关于这张表还有一点：结束标签的比例在 $\tau = 0.5$ 时由约 225 行算出，在 $\tau = 1$ 时由 193 行算出，所以它带有约 3 个百分点的抽样误差。换一个种子重新运行 `sample`，就能看到它的变动。

### 你应该看到什么

- **第一个损失是 $\ln 37 = 3.611$。**输出层一开始不携带信息，这是应该的。
- **梯度检验通过。**在抽查的 25 个元素中，最坏的相对误差在 $10^{-7}$ 的量级或更低。任何高于 $10^{-4}$ 的值都意味着 bug。
- **网络胜过 5 元语法。**它最好的验证损失约为每字符 0.39 奈特，而 5 元语法为 0.48，所以它用到了长于四个字符的上下文。它比“局部规则全对、结束标签靠猜”的模型的下限 0.378 高约 0.01，比还能记住标签的模型的下限 0.310 高约 0.08。梯度范数始终低于 2，所以裁剪从未触发。
- **每一条局部规则都学会了。**$\tau = 0.5$ 时基本上所有行都格式正确，每个单位都与其物理量相符。状态与数值相符的比例约为 99%，而始终预测 `ok` 只有 73%：网络仅凭下一个字符预测，就学会了一个数值阈值，而且每个物理量的阈值各不相同。
- **结束标签没有学会。**$\tau = 0.5$ 时约五分之一的行中它与开头标签匹配，$\tau = 1$ 时约八分之一，正是猜测的 12.5%。标签必须在递推中保持 18 到 36 步，而当两个标签落在不同的 32 字符块中时，截断的反向传播从不把它们联系起来。$\tau = 0.5$ 时的数字略高于随机水平，可能是因为最短的间隔有时落在同一个块之内，而 18 步上的梯度还没有消失。这就是[第 4 节](#s4)的梯度消失在行为上的表现。损失并不能清楚地显示这一点，因为缺失的记忆只占 0.39 中的每字符 0.07 奈特；核查能显示出来。
- **温度在有效性与多样性之间权衡。**$\tau = 1$ 时约 5% 的行格式错误，约 4% 的状态与数值不符；$\tau = 0.5$ 时几乎没有这类错误，但各行重复着最可能的模式。

### 动手试试

1. **更长的截断窗口。**在步骤 6 中设 `T = 64`（块数随之改变），比较结束标签的准确率。现在窗口足够长，能把大多数开头标签和结束标签装在一起，梯度可以把它们联系起来。准确率会升到 21% 以上吗？如果不会，那么限制来自梯度的消失，而不是截断。然后试试 `H = 256`。
2. **用 ReLU 代替 tanh。**替换前向传播中的 `np.tanh` 和反向传播中的 `1 - h**2`（ReLU 的导数在输入为正处为 1，其余处为 0；保存预激活，或者使用 `hs > 0`）。关闭裁剪后训练稳定吗？把梯度范数与 tanh 网络的比较。
3. **真实文本。**把 3,000 到 4,000 个字符的公有领域文本作为字符串嵌入（莎士比亚的六首十四行诗约有 3,700 个字符），在它上面训练。文本这么少，网络会死记硬背：训练损失持续下降，而验证损失很早就达到最小值然后上升，步骤 2 的二元语法和三元语法基线与网络相差无几。在准备本模块时用六首十四行诗做的一次运行中，验证损失在约 250 次更新后最低，为每字符 2.46 奈特，而二元语法模型得分 2.45，插值的三元语法模型为 2.26。限制在于数据量，而不在于架构。之所以选用日志，是因为在这个数据集上，网络有东西可找。
4. **梯度与滞后。**在训练好的模型的一个 32 步块内，在反向循环中记录 $\lVert\partial\mathcal{L}/\partial\mathbf{h}_t\rVert$，并画出它随 $t$ 的变化。与你将在[实验 2](#lab2) 中画出的曲线比较。

## 实验 2 — 观察梯度消失，以及不会消失的 LSTM {#lab2}

**目标。**[实验 1](#lab1) 的网络学不会结束标签。这里你要测量原因，以及换成门控单元后有什么变化。你按[第 5 节](#s5)的方程写出 LSTM 单元，并与 PyTorch 的 `nn.LSTMCell` 比对。你测量最后一步的梯度有多少能到达 $T$ 步之前的输入，作为滞后的函数，对象是不同初始化下的普通循环网络和 LSTM：第 4 节的两种失败由同一个旋钮产生，而遗忘门的偏置决定了 LSTM 能触及多远。然后你复现 $\partial\mathbf{c}_{100}/\partial\mathbf{c}_0$ 实验，把实测的梯度与[第 5 节](#s5)所预测的遗忘门之积相比较。最后，你用实验 1 的截断的随时间反向传播布局，在维护日志上训练一个普通 RNN 和两个 LSTM，观察结束标签的准确率。本实验使用 PyTorch，每个模型约需半分钟 CPU 时间；整个实验在四线程 CPU 上约需两分钟。无需下载。

### 步骤 1：按方程写出 LSTM 单元

[第 5 节](#s5)的单元用一个堆叠的线性映射，由输入 $\mathbf{x}$ 和前一状态 $(\mathbf{h}, \mathbf{c})$ 计算四个门：

$$
\mathbf{z} = \mathbf{W}_{ih}\mathbf{x} + \mathbf{b}_{ih} + \mathbf{W}_{hh}\mathbf{h} + \mathbf{b}_{hh},
\qquad
(\mathbf{z}_i, \mathbf{z}_f, \mathbf{z}_g, \mathbf{z}_o) = \text{将 }\mathbf{z}\ \text{切块，每块大小为 } H,
$$

$$
\mathbf{c}' = \sigma(\mathbf{z}_f) \odot \mathbf{c} + \sigma(\mathbf{z}_i) \odot \tanh(\mathbf{z}_g),
\qquad
\mathbf{h}' = \sigma(\mathbf{z}_o) \odot \tanh(\mathbf{c}').
$$

因此 $\sigma(\mathbf{z}_f)$ 就是[第 5 节](#s5)的遗忘门 $\mathbf{f}_t$，$\sigma(\mathbf{z}_i)$ 是输入门，$\sigma(\mathbf{z}_o)$ 是输出门。PyTorch 把候选值那一块称为 $g$（即正文中的 $\tilde{\mathbf{c}} = \tanh(\mathbf{z}_g)$），并按 $i, f, g, o$ 的顺序堆叠四个块；代码中的 `i, f, g, o` 就是这些预激活块。代码使用带 batch 维的行向量，所以方程中的 $\mathbf{W}_{ih}\mathbf{x}$ 在代码里写成 $\mathbf{x}\mathbf{W}_{ih}^\top$。PyTorch 保留两个偏置向量 $\mathbf{b}_{ih}$ 和 $\mathbf{b}_{hh}$，尽管只有它们的和起作用；这就是参数量为 $4H(d + H) + 8H$ 而不是 $4H(d + H + 1)$ 的原因（[第 5 节](#s5)）。当 $d = 8$、$H = 16$ 时，它是 $4\cdot 16\cdot 24 + 128 = 1{,}664$。

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

两者吻合到 float32 的舍入误差：第 5 节的方程就是 `nn.LSTM` 所计算的，门的顺序为 $i, f, g, o$。这个顺序在实践中很重要：遗忘门偏置位于切片 `bias_ih_l0[H:2*H]`，切片错开一块，就会悄无声息地设置了另一个门。

### 步骤 2：梯度与滞后

只有当末端损失的梯度能到达 $T$ 步之前的输入时，循环网络才能利用这个输入。为了测量这一点，取一个形状为 $(B, T, d) = (32, 200, 8)$ 的随机输入 batch $\mathbf{x}$，以及一个只依赖最后隐状态的标量损失 $L = \sum_b \mathbf{v}\cdot\mathbf{h}_T^{(b)}$，其中 $\mathbf{v}$ 是一个固定的随机向量。执行 `backward` 之后，$\partial L/\partial\mathbf{x}_t$ 的范数（对 batch 和输入特征求）衡量输入 $t$ 对 $L$ 的影响有多大。除以它在 $t = T-1$ 处的值，就得到滞后 $T - 1 - t$ 处的**梯度比**：滞后 0 时为 1，对于记忆完美的网络则处处为 1。输入是随机的，也没有训练：这个比值是初始化和架构的性质。对输入的梯度代替了对该步状态的梯度，后者在[第 3 节](#s3)中写成雅可比矩阵之积；两者每步只差一个固定的矩阵，所以一起衰减。

六个模型，每个 $H = 64$，构建前都调用 `torch.manual_seed(1)`：使用 PyTorch 默认初始化的 `nn.RNN`；$\mathbf{W}_{hh}$ 为正交矩阵（所有奇异值为 1）的 `nn.RNN`；同一个正交矩阵乘以 1.5；以及遗忘门偏置分别设为 0、3 和 5 的 `nn.LSTM`。默认初始化从 $[-1/\sqrt H, 1/\sqrt H]$ 上均匀抽取 $\mathbf{W}_{hh}$，[第 4 节](#s4)预测其谱半径接近 $1/\sqrt{3} = 0.58$，最大奇异值大于 1；代码把两者都打印出来。

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

默认初始化的谱半径为 0.57，最大奇异值为 1.10，正如[第 4 节](#s4)对以这种方式抽取的矩阵所预测的。现在来看这张表，每行一个模型。

- **默认 RNN** 到滞后 10 时损失约 600 倍，到滞后 25 时比值为 $2\times 10^{-7}$。从滞后 10 到滞后 50，比值在 40 步内下降到原来的 $1.4\times 10^{-11}$，即每步乘以 $0.53$。这接近谱半径 0.57，而与最大奇异值 1.10 相去甚远：长期的衰减率由特征值和 tanh 的导数决定，奇异值只在最初几步起作用（[第 4 节](#s4)关于“非正规”矩阵的说明）。在滞后 199 处，梯度低于 float32 能表示的最小数，所以打印出来恰好为 0。
- **正交的 $\mathbf{W}_{hh}$** 减缓了衰减（滞后 10 时约 0.2，滞后 50 时为 $10^{-3}$），但没有阻止它。这个矩阵的每个奇异值都是 1；剩下的损失来自 tanh 的导数，只要单元不在零附近，它就小于 1。这正是[第 4 节](#s4)的要点：矩阵是雅可比矩阵的一个因子，激活函数是另一个。
- **正交矩阵乘以 1.5** 会爆炸：比值在滞后 10、50 和 100 处依次升到 1.7、9.6 和 117，到滞后 199 时约为 $2\times 10^{4}$，大致每步增长 5%。第 4 节的两种失败来自同一个缩放因子。这正是梯度裁剪会起作用的情形。
- **遗忘偏置为 0 的 LSTM** 像普通 RNN 一样衰减。处于 $\sigma(0) = 0.5$ 的遗忘门每一步都把细胞路径上的梯度减半，而 $0.5^{50} \approx 10^{-15}$。
- **遗忘偏置为 3 或 5 的 LSTM** 从滞后 10 到滞后 100 都把比值保持在约 0.14 到 0.4 之间。细胞路径是遗忘门之积，偏置为 3 或 5 时，每个门在初始化时为 0.95 或 0.99。曲线在滞后 199 处*上升*，到 8 和 34：遗忘门几乎始终敞开，细胞对它的整个输入历史求和，最早的输入对最后状态的影响比最近的输入还大。这是另一种不完美，而不是梯度消失：这样的网络必须学会遗忘。

[第 4 节](#s4)的梯度流探索器画出了同样的比较。这里的数字针对随机输入和一个种子；换别的种子会改变具体数字，但不会改变数量级。

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

### 步骤 3：细胞状态的梯度

[第 5 节](#s5)论证说，沿着 LSTM 的细胞路径，梯度每一步都乘以遗忘门：$\partial\mathbf{c}_t/\partial\mathbf{c}_{t-1} = \operatorname{diag}(\mathbf{f}_t)$，再加上经过 $\mathbf{h}_{t-1}$ 的项。如果第二类项很小，$\mathbf{c}_{100}$ 对 $\mathbf{c}_0$ 的梯度就应当接近 100 个遗忘门之积，当每个门都处在其偏置附近时约为 $\sigma(b_f)^{100}$。检验方法：一个 `nn.LSTMCell(8, 64)`，所有权重乘以 0.1（于是无论输入如何，各门都接近 $\sigma(b_f)$），遗忘偏置 $b_f \in \{0, 2, 5, 10\}$，在随机输入上运行 100 步，从 $\mathbf{c}_{100}$ 之和做反向传播，然后把对 $\mathbf{c}_0$ 的梯度的均方根元素 $\lVert\partial\mathbf{c}_{100}/\partial\mathbf{c}_0\rVert/\sqrt H$ 与 $\sigma(b_f)^{100}$ 并列。作为对照，在默认的 `nn.RNNCell` 上做同样的测量，它的状态梯度就是第 4 节的雅可比矩阵之积。

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

实测梯度在数量级上跟随遗忘门之积，但具体数字并不一致。偏置为 2 时是 $6.6\times 10^{-6}$ 对 $3.1\times 10^{-6}$；偏置为 5 时是 0.90 对 0.51；偏置为 10 时是 1.7 对 0.995。它总是大于乘积，原因有二。各门并不恰好处在 $\sigma(b_f)$，因为它们对输入和状态有少许依赖；而经过 $\mathbf{h}_{t-1}$ 的项会叠加到直接路径上。正是第二类项使得测量值 1.7 能够大于 1：没有任何东西让各路径之和受限于其中一条路径上的乘积。与一个偏置参数在偏置 0（$\approx 10^{-30}$）和偏置 10（约为 1）之间造成的 30 个数量级相比，这两种效应都很小。默认的 `nn.RNNCell` 在同样 100 步上给出 $10^{-23}$。

一种有用的解读是固定门值下细胞路径的半衰期：满足 $\sigma(b_f)^n = 1/2$ 的滞后 $n$ 为 $\ln 0.5/\ln\sigma(b_f)$，$b_f = 1$ 时为 2.2 步，$b_f = 3$ 时为 14 步，$b_f = 5$ 时为 103 步。因此偏置为 1 本身并不能把一个值保持 30 步：训练必须调高那些存储标签的单元的遗忘门。偏置让这件事变得容易，因为它使门从一个自身梯度不小的区域开始；但记忆本身并不由偏置完成。

### 步骤 4：再看维护日志

现在做行为检验。为了让本实验自成一体，这里重复了[实验 1](#lab1) 的生成器；它写出同样的 46,196 个字符。数据布局与实验 1 相同：前 90% 用于训练，排成 $B = 32$ 个并行流；后 10% 用于验证；块长 $T = 32$，状态在块边界处传递并分离（detach），流回绕时重置为零。正则表达式也来自实验 1；核查被简化为唯一关心的量，即格式正确的行中结束标签与开头标签匹配的比例。

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

模型是 `Embedding(37, 32)`、一个 $H = 128$ 个单元的循环层，以及 `Linear(128, 37)`。嵌入层就是实验 1 的按列查表，只是输入维度更低。三个版本只在循环层上不同：`nn.RNN`；遗忘偏置为 0 的 `nn.LSTM`；以及遗忘偏置为 1 的 `nn.LSTM`。PyTorch 默认的 LSTM 初始化像抽取其他所有偏置一样抽取遗忘偏置，取自 0 附近的一个小区间，所以第一个 LSTM 把它设为恰好 0，第二个设为恰好 1（[第 5 节](#s5)给出了取 1 的理由：记忆应当是默认行为）。代码打印有效遗忘偏置，即两个偏置切片之和，以确认这一点。

每 500 次更新，循环打印验证损失，并从 $\mathbf{h} = \mathbf{0}$ 出发以温度 0.5 采样 4,000 个字符，像实验 1 那样测量结束标签的准确率。使用 Adam，学习率 $3\times 10^{-3}$，全局范数裁剪阈值为 5，每个模型 2,500 次更新。

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

有效遗忘偏置为 1，符合预期。每条曲线都只是一次运行，结束标签准确率是一个有噪声的测量：4,000 个字符约合 130 行，所以一个百分比的标准误约为 3 到 4 个百分点。要读的是规律，而不是单个数值。

- **普通 RNN** 在整个运行中都停留在 14% 到 25%，与实验 1 的水平相当，更新次数再多也一样。它的验证损失约为 0.39 到 0.42，在第 500 次更新之后不再改善。
- **两个 LSTM** 呈现相同的形态：先是在猜测水平附近的一段长平台期，然后上升。在第 2,500 次更新时，偏置为 0 的 LSTM 达到约 78%，遗忘偏置为 1 的 LSTM 约 64%。偏置为 0 时上升很突然（第 1,500 次更新时 22%，第 2,000 次时 65%），偏置为 1 时则较为平稳。之所以突然，是因为标签既需要一个存储它的单元，*又*需要一条读取它的输出通路：在两者都形成之前，结束标签损失的梯度很弱，而一旦其中一个开始形成，另一个就会随之出现。
- **两个 LSTM 的验证损失**最好时达到 0.373 到 0.374，刚好低于实验 1 算出的“结束标签靠猜”的模型的下限 0.378，而普通 RNN 最好时为 0.390。在第 2,500 次更新时，它们分别为 0.379 和 0.395，普通 RNN 为 0.415。损失只差每字符 0.02 到 0.04 奈特，准确率却差四到五倍：损失主要由随机的数字决定，行为核查揭示了损失所掩盖的东西。
- **哪个 LSTM 领先**并不稳定。在 `train_log_model` 中改用 `torch.manual_seed(7)` 重复运行，第 2,500 次更新时偏置为 0 的 LSTM 得到 73%，偏置为 1 的 LSTM 得到 96%，与上面的顺序相反，而两者仍远高于普通 RNN 的 24%。稳健的结论是：门控单元在 2,500 次更新之内学会了标签，普通单元则没有。如步骤 3 所示，遗忘偏置在原理上有帮助，但这种规模的单次运行测不出它帮了多少。

### 你应该看到什么

- **手写的单元与 PyTorch 吻合**到 float32 精度（差异在 $10^{-7}$ 量级），参数量为 $1{,}664 = 4\cdot 16\cdot(8 + 16) + 2\cdot 4\cdot 16$。第 5 节的方程，连同门的顺序 $i, f, g, o$，就是 `nn.LSTM` 所计算的。
- **PyTorch 默认的 RNN 初始化是非正规的：**谱半径约 0.57，最大奇异值约 1.10。它的梯度比在滞后 10 时约为 $10^{-3}$，滞后 25 时 $10^{-7}$，滞后 50 时 $10^{-14}$，到滞后 199 时梯度在 float32 中下溢。
- **正交初始化有帮助，但解决不了问题。**由于 tanh 的导数，比值在滞后 100 时衰减到约 $10^{-6}$；乘以 1.5 后，它在滞后 100 时增长到约 $10^{2}$，滞后 199 时约 $10^{4}$。一个旋钮就产生了第 4 节的两种失败。
- **LSTM 能触及多远由遗忘偏置决定。**偏置为 0 时表现得像普通 RNN；偏置为 3 或 5 时，直到滞后 100 都把比值保持在约 0.14 到 0.4 之间。门几乎始终敞开时，最早的输入会占据主导（滞后 199 处的比值远大于 1）。
- **$\mathbf{c}_{100}$ 对 $\mathbf{c}_0$ 的梯度在数量级上跟随 $\sigma(b_f)^{100}$，**从 $b_f = 0$ 时的约 $10^{-30}$ 到 $b_f = 10$ 时的约 1，与乘积相差 2 到 7 倍以内。普通单元的状态梯度约为 $10^{-23}$。
- **在日志上，经过 2,500 次更新，**普通 RNN 的结束标签准确率停留在 14% 到 25%（猜测水平为 12.5%），而两个 LSTM 达到约 64% 和 78%。每个 LSTM 都要先在猜测水平附近停留 1,000 次或更多次更新，然后才上升。验证损失只显示出很小的差距。
- **运行时间：**在准备本实验的机器上（四个 CPU 线程）每个模型约 35 秒，整个实验约 105 秒，与上面所说的时间相符。

### 动手试试

1. **换成 GRU。**在 `CharModel` 中把 `nn.LSTM` 换成 `nn.GRU`，比较结束标签准确率和参数量。GRU 有三个门块而不是四个，所以循环部分的参数是 LSTM 的四分之三（[第 6 节](#s6)）。它没有单独的细胞状态，也没有需要设置的遗忘偏置；它的两个门中，哪一个扮演遗忘门的角色？（注意第 6 节中关于 $z$ 的约定的提醒。）
2. **剖析训练好的模型。**用训练好的日志模型重做步骤 2 的梯度剖面，输入嵌入后的日志文本而不是随机输入。训练如何改变了普通 RNN 的曲线，以及偏置为 0 的 LSTM 的曲线？
3. **观察一次爆炸。**关闭裁剪，在日志上训练正交矩阵乘以 1.5 的 `nn.RNN`，每次更新都记录损失和梯度范数。然后重新启用阈值为 5 的裁剪，加以比较。
4. **扫描偏置。**以遗忘偏置 $b_f \in \{-2, 0, 1, 3, 5\}$ 运行 LSTM，每种 2,500 次更新、两个种子，画出最终检查点上的标签准确率。是否存在某个偏置，超过它之后准确率又会下降？用步骤 2 中关于最早输入占据主导的观察来推测原因。

## 实验 3 — 传感器数据流的预测与监测 {#lab3}

**目标。**你诚实地预测一台安装在支座上的机器上的模拟传感器，然后把预测器变成监测器。诚实包括四个方面。评估采用前向滚动验证，从不打乱。每个数字都与朴素预测、季节性朴素预测和线性自回归并列。[第 8 节](#s8)中那段输给朴素预测的代码会被运行，它的失败会得到解释（信号漂出了网络在训练中见过的范围），并用逐窗口归一化加以修复。多步预测会被比较，递归对直接。随后，预测器的残差被送入三个检测器，四个注入的故障表明，每一类故障都需要它自己的检测器（[第 9 节](#s9)）。数据是合成的，无需下载。这是本模块唯一一个较大的训练实验：`QUICK = False` 时在四线程 CPU 上约需两分钟，`QUICK = True` 约需其三分之一的时间。

### 步骤 1：模拟机器

信号代表一台机器的位移传感器，机器所在的支座越偏转越硬：一个受迫、有阻尼的 **Duffing 振子**（Duffing oscillator），

$$
\ddot x + 2\zeta\omega_0\dot x + \omega_0^2 x + k_3 x^3 = A\sin(2\pi t/5\,\text{s}) + \sigma_F\,\xi(t),
$$

其固有频率 $\omega_0 = \pi$ rad/s（固有周期 2 s），阻尼比 $\zeta = 0.05$，三次刚度 $k_3 = 40$，周期载荷的幅值 $A = 3$、周期 5 s，白噪声激励的强度 $\sigma_F = 3$。三次项使系统成为非线性的：支座越硬，大幅值时振荡越快。神经网络预测器能利用的正是这种非线性，而线性预测器不能。振子用半隐式欧拉法积分，$dt = 0.01$ s（噪声在每个子步以 $\sigma_F\sqrt{dt}\,\mathcal{N}(0,1)$ 的形式进入），每 0.1 s 采样一次，共 8,000 个样本（800 s）。测量值加上每个样本 $10^{-3}$ 的漂移，代表传感器漂移或磨损，以及标准差为 0.05 的噪声。周期载荷的周期为 $P = 50$ 个样本。

第一段代码设置 `QUICK`，写出模拟器并画出序列。`QUICK = True` 只训练 4 个轮次而不是 10 个，并且只使用最后两个前向滚动折。

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

序列从前 1,000 个样本上约 0.5 的均值，升到最后 1,000 个样本上约 7.5：每个样本 $10^{-3}$ 的漂移在 7,000 个样本上累计 7 个单位，所以序列 2.4 的标准差大部分来自漂移，振荡叠加在漂移之上。在放大图中，振荡的周期约为 11 个样本（1.1 s），大约是线性振子 2 s 固有周期的一半：在这里达到的幅值下，变硬的弹簧提高了频率；而由于随机激励不断改变幅值和相位，响应远不是一条干净的正弦曲线。（50 个样本周期的载荷只是信号中次要的一部分；接下来的步骤会展示这对季节性朴素基线意味着什么。）漂移的水平正是让[第 8 节](#s8)的代码失效的那个性质。

### 步骤 2：第 8 节的错误，照原样运行

[第 8 节](#s8)给出了一个看起来很仔细的预测器和划分。它使用 $W = 64$ 个样本的窗口和单步目标，一个隐藏大小为 32 的两层 `nn.LSTM`，层间随机失活 0.1，最后状态上接一个线性头部。训练使用 AdamW，学习率 $3\times 10^{-3}$，裁剪阈值 1，batch 为 128，10 个轮次（第 8 节的运行用了 15 个）。数据只用训练期的统计量做 z 分数标准化（没有泄漏），测试期就是未来：这里前 6,000 个样本用于训练，最后 2,000 个用于测试。下面的代码块恰好照此执行。它打印网络在训练和测试中看到的输入的归一化范围，然后打印 LSTM 以序列原始单位计的 RMSE、朴素预测（“下一个值等于上一个值”）的 RMSE，以及 LSTM 的平均误差。

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

经训练统计量归一化之后，测试窗口位于 1.02 到 3.55 之间，而网络是在 $-2.18$ 到 2.32 之间的输入上训练的。测试期几乎全部高于网络见过的范围：漂移把水平带出了这个范围。LSTM 的 RMSE 约为 0.43，比朴素预测的 0.36 *还差*，平均误差为 $-0.3$：它系统性地预测得偏低，这正是网络的饱和单元无法表示超出训练范围的水平时的表现。模型在它见过的范围上学到了一个映射，却不会像线性模型那样把它外推出去。在准备本实验时，第二个种子（开头处 `torch.manual_seed(1)`，`fit` 中 `seed=1`）给出 0.66，对照同样的朴素 0.36，平均误差为 $-0.59$，所以失败的大小随种子变化，而它的符号不变。

这就是[第 8 节](#s8)的失败，在一个非线性信号上复现出来。代码在通常意义上没有任何错误：没有泄漏，基线是诚实的，划分尊重时间顺序。错的是模型对这个信号的适用性。一行检查就能在任何训练之前暴露它：把测试输入的范围打印在训练输入的范围旁边。

### 步骤 3：三行代码的修复

用每个窗口自己的最后一个值对它做归一化。网络看到的是最近 64 个样本的形状，而不是它们的水平；它预测相对最后一个值的变化，再把最后一个值加回去。在 `forward` 中，这就是上面那个类的 `per_window` 分支：

```python norun
last = x[:, -1:, :]                    # each window's last value, (batch, 1, 1)
out, _ = self.lstm(x - last)           # the network sees shape, not level
return self.head(out[:, -1]) + last[:, 0]
```

模型、数据和训练在其他方面都相同。训练它，并在前 150 个测试样本上比较两者。

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

修复后模型的 RMSE 约为 0.13，平均误差接近零，是朴素误差的三分之一，也约是全局归一化模型的三分之一。图中显示了原因：全局归一化模型的预测（虚线）在峰值处略低于测量值，这就是平均误差所报告的偏差，而修复后的模型既跟上了水平，也跟上了形状。这三行改变了网络被要求学习的东西：从“给定最近 64 个水平，预测下一个水平”，变为“给定最近 64 个值的形状，预测下一个变化”。振荡的形状在任何水平上都相同，所以范围问题消失了。

对序列做差分（输入变化而不是水平）在许多场合起同样的作用，而可逆实例归一化（reversible instance normalisation）是它的推广（[第 8 节](#s8)）。它们都做不到的，是找回窗口中本来就不包含的信息。

### 步骤 4：前向滚动验证，对比三个基线

一次划分可能因为运气而抬高或压低一个模型，所以[第 8 节](#s8)在一系列**前向滚动**折上评估。取四个预测起点：4,000、5,000、6,000 和 7,000；每一折在其起点之前的全部数据上训练，在其后的 1,000 个样本上验证。z 分数标准化的统计量由每一折的训练部分重新计算。验证窗口可以回溯到训练期，因为在预测时这些值已属于过去；它的目标则永远不会。

在每一折上比较四个预测器，全部以序列的原始单位计：

- **朴素预测：**最后一个值；
- **季节性朴素预测：**目标之前一个周期（$P = 50$ 个样本）的值；
- **线性自回归：**在同样的 64 值窗口上做最小二乘，窗口减去最后一个值，再加一个截距（[模块 01](module_01_ZH.html)）；非线性模型要证明自己的价值，就必须胜过这个基线；
- **修复后的 LSTM。**

第 3 折（起点 6,000）就是步骤 3 中训练的模型；它被复用而不重新训练，所以步骤 5 和步骤 6 使用的是同一个网络。

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

每一折中的排序都相同。朴素预测的 RMSE 约为 0.375。季节性朴素预测差得多，约为 0.84，比朴素预测差两倍以上：周期 50 的载荷只是这个信号的一小部分，响应主要由随机激励和变硬的振荡决定，一个周期之前的值与现在的值几乎无关。基线必须算出来，而不能想当然；在这里，教科书上针对周期信号的选择恰恰是错的。线性自回归约为 0.155，是一个谁都不该跳过的强基线。LSTM 约为 0.135，各折之间的标准差约为 0.006，在每一折中都是最好的，在这次运行中比线性模型好 12% 到 16%（用第二个种子为 8% 到 18%）。这个优势是真实的，但不大，它就是神经网络预测器在这里所带来收益的诚实大小。

LSTM 之所以获胜，是因为弹簧是非线性的。对于带高斯噪声的线性系统，线性模型就是最优预测器（[第 8 节](#s8)）；在由正弦波加漂移加噪声构成的信号上，它会完胜，这就是本实验使用会变硬的支座的原因。没有这种非线性，表中会显示线性模型领先或持平，而成本只是一小部分。

### 步骤 5：多步预测，递归还是直接

单步模型可以迭代使用，也可以训练一个模型一次预测全部 $h$ 步（[第 8 节](#s8)）。从起点 6,000 开始，在 $[6000, 6980]$ 中的每个起点 $s$ 上预测接下来的 $h = 1, \dots, 20$ 个样本，这样每个预测步长都在同样的 981 个预测上评分。六种方法：

- **LSTM，递归：**第 3 折的单步模型；把每个预测追加到窗口中，丢掉最旧的值，再次预测；
- **LSTM，直接：**同样的架构，配一个 20 输出的头部，在 20 步目标上训练一次；
- **线性，递归**和**线性，直接**（用最小二乘拟合 20 个输出）；
- **朴素预测**和**季节性朴素预测。**

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

看三件事。

- **朴素预测的误差并不随 $h$ 单调变化：**在 $h = 1, 5, 10, 20$ 处分别为 0.34、1.02、0.62 和 0.72。它跟随振荡，振荡周期约为 11 个样本：当信号转过半个周期时（这里 $h$ 约为 5），持续性预测最差，而在接近一个完整周期时（$h$ 约为 10 到 11）又恢复过来。季节性朴素预测平稳地保持在约 0.79，因为当 $h \le P$ 时它的误差与 $h$ 无关。
- **递归会累积误差。**递归 LSTM 在 $h = 1$ 时是最好的预测器（0.133），它的误差在 $h = 5, 10, 20$ 时增长到 0.42、0.53 和 0.78，在 $h = 5$ 时已经略逊于线性模型。它把自己的预测当作输入读入，所以把自己的误差带着向前走：这是[第 8 节](#s8)所说的暴露偏差在预测问题中的形式。到 $h = 20$ 时，它比朴素预测的 0.72 还差，也远高于直接 LSTM 的 0.56。
- **对线性模型而言，两种策略是一致的。**递归和直接的线性预测吻合到约三位小数（$h = 20$ 时为 0.551 和 0.552），正如[第 8 节](#s8)所预测的，当窗口包含系统的全部线性状态时就会如此。直接 LSTM（0.15、0.40、0.50、0.56）在 $h = 1$ 时比递归 LSTM 略差，因为它共享的头部还要为另外 19 个预测步长付出代价；在 $h = 10$ 时比线性模型略好；在 $h = 20$ 时与线性模型持平。大约在 $h = 10$ 之后，观测窗口中没有任何东西能预测随机激励，所以直接 LSTM 和两个线性模型都趋向同一个下限，约为 0.55。

### 步骤 6：从预测器到监测器

[第 9 节](#s9)把预测器变成了监测器：较大的残差 $r_t = x_t - \hat x_t$ 意味着传感器的行为不符合正常运行模型的预测。在模型从未见过的样本 7,000 到 7,999 中注入四个故障：

1. 一个**尖峰**：在单个样本 7,100 上加 $+1.5$；
2. 一个**传感器偏移**：在样本 7,250 到 7,349 上加 $+0.8$；
3. **激励加倍**：在样本 7,450 到 7,749 上 $\sigma_F \to 2\sigma_F$，代表气蚀或零件松动。它通过用同一个种子、加倍的噪声尺度重新模拟得到，所以在样本 7,450 之前，序列与干净序列完全相同，代码对此做了断言；
4. 一个**卡死的传感器**：在样本 7,850 到 7,949 上，数值冻结在样本 7,849 的读数。

残差来自第 3 折的模型，分别在干净的留出段 6,000 到 6,999 上，以及带故障序列的 7,000 到 7,999 上计算。三个检测器，阈值只在干净的留出段上设定：

- **逐点检验**，$|r_t| > 4\sigma$，其中 $\sigma$ 是留出段残差的标准差；
- 残差在 50 个样本上的**滚动 RMS**，超过其在留出段上最大值的 1.1 倍时报警（它检测残差水平的变化）；
- 20 个样本上的**滚动标准差**，低于其在留出段上最小值的一半时报警（它检测变化的消失）。

报警落在某个故障的 $[\text{起点}, \text{终点} + 20)$ 之内时才计入。正常段排除每个故障之后的 70 个样本，这样仍受故障扰动的残差不会被算作误报。

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

阈值只来自干净的留出段：$\sigma = 0.131$ 给出逐点阈值 $4\sigma = 0.52$，两个滚动阈值分别比正常运行时的极值高 10% 和低 50%。上面带故障的残差图说明了为什么每个故障都需要它自己的检测器。

- **尖峰**被逐点检验立即捕获。它触发两次报警，因为尖峰之后的那个样本是由一个以尖峰结尾的窗口预测的，误差大小大致相同、方向相反。滚动 RMS 也会报警，并且只要尖峰还在它的 50 样本窗口内，就一直高于限值；表格在报警窗口的末端截断了计数，所以完整的报警过程比显示的 21 个样本更长。
- **偏移**只在开始和结束附近被逐点检验捕获（共 3 次报警：开始时、4 个样本之后，以及偏移结束的那个样本）。在这之间，残差是正常的：有了逐窗口归一化，模型在一步之内就以新的水平为中心重新对齐，所以一旦窗口被持续的偏移填满，它就看不见了（[第 9 节](#s9)）。滚动 RMS 也会报警，只是因为两次跳变各自停留在它的 50 样本窗口里。一个把恒定偏移视为正常的预测器，需要一个不随传感器一起移动的参照。
- **激励加倍**产生的极端残差很少（这次运行中有五次逐点报警，第一次在故障开始后 151 个样本），但残差 RMS 从留出段上的 0.134 升到故障期间的约 0.21。滚动 RMS 在故障开始 99 个样本后越过其限值（第二个种子为 85，`QUICK = True` 时为 125）。余量很小，这就是延迟很长的原因：更小的变化需要更长时间才能检测到，或者会被漏掉。
- **卡死的传感器**在卡死期间不触发任何残差报警：冻结的读数被预测时，误差很小且几乎恒定。它那一行中唯一的逐点报警位于 +100，是传感器恢复、读数从冻结值跳回来的那个样本。方差下限在 20 样本窗口被近乎恒定的残差填满后检测到故障，即开始后 21 个样本，并持续报警直到传感器恢复。
- **误报：**三个检测器在 239 个正常样本中都没有报警。这个数量太小，不足以估计误报率：按“三法则”（rule of three），239 个样本中零次事件，与每个样本最高约 $3/239 \approx 1.3\%$ 的真实误报率都是相容的。真实部署需要数天的正常数据来设定阈值并测量其误报率（[第 9 节](#s9)），如果你想在这里得到这个数字，就需要更长的模拟。

### 你应该看到什么

- **步骤 1。**序列在 8,000 个样本上向上漂移约 7，上面叠加着周期约 11 个样本的振荡。
- **步骤 2：第 8 节的代码输给朴素预测。**归一化后的测试输入几乎全部位于训练输入范围之上（约 1.0 到 3.6，而训练为 $-2.2$ 到 2.3），LSTM 的 RMSE（约 0.43，朴素 0.36）比朴素预测差，并带有约 0.3 的负偏差（第二个种子为 0.66）。模型并没有训练错；它被要求做外推。
- **步骤 3：逐窗口归一化修复了它。**RMSE 降到约 0.13，偏差降到约为零。
- **步骤 4：前向滚动验证。**朴素约 0.375，季节性朴素约 0.84，线性约 0.155，LSTM 约 0.135，各自在各折间的离散为 0.006 到 0.03。LSTM 在每一折中都最好，比线性模型好 12% 到 16%；季节性朴素基线很差，因为随机激励压倒了周期载荷。
- **步骤 5：多步预测。**误差在递归 LSTM 中累积（20 步内从 0.13 增至 0.78，在 $h = 20$ 时比朴素预测还差）；直接 LSTM 和两个线性模型最终都在 0.55 到 0.56 附近。线性的递归与直接预测相同。
- **步骤 6：监测器。**逐点检验捕获尖峰和偏移的两个边缘；滚动 RMS 在 99 个样本后捕获激励故障；只有方差下限能在传感器卡死期间捕获它；在 239 个正常样本中没有误报。每一类故障都需要它自己的检测器。
- **运行时间。**在准备本实验的机器上（四个 CPU 线程），`QUICK = False` 时约 100 秒（模拟本身远不到一秒），`QUICK = True` 时约 35 秒，后者训练 4 个轮次且只训练最后两折；轮次更少时，步骤 2 的失败更大（0.65 对 0.36）。较慢的笔记本电脑会花更长时间。

### 动手试试

1. **时间卷积网络。**把 LSTM 换成一叠因果的一维空洞卷积，覆盖 64 个样本的窗口（[模块 03](module_03_ZH.html)；[练习 15](#e15)）。比较前向滚动验证的 RMSE 和训练时间。两个模型都使用步骤 3 的逐窗口归一化。
2. **概率输出头部。**让模型有两个输出，一个均值和一个对数方差，用 `torch.nn.GaussianNLLLoss` 训练。在逐点检验之前，把残差除以预测的标准差。激励水平变化时，误报率会改变吗？
3. **第二个通道。**把已知的周期载荷 $\sin(2\pi t/5\,\text{s})$ 作为第二个输入通道加入，比较 LSTM 相对线性模型（它也可以使用同一个通道）的领先幅度。领先会扩大吗？
4. **CUSUM。**累加标准化后的残差平方，$S_t = \max(0, S_{t-1} + r_t^2/\sigma^2 - k)$，参考值 $k$ 取略大于 1（Page 1954），在某个限值处报警。在相同的误报次数下，把它在激励故障上的检测延迟与滚动 RMS 的 99 个样本相比较。
5. **换一个种子。**用 `seed=1` 重新模拟并重新运行。本实验的哪些结论（四个预测器的排序、全局归一化模型的失败、检测延迟）仍然成立，数字又变动了多少？
