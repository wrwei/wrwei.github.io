## 实验 1 — 手算注意力，并与 PyTorch 核对 {#lab1}

**目标。** 在 NumPy 中复现 [第 3 节](#s3) 算例的全部数值，再用独立检查验证：PyTorch 的融合注意力 kernel 及自动求导，应在舍入误差范围内与手算一致；有限差分应与 [第 2 节](#s2) 的 softmax 雅可比矩阵一致。随后测量 $1/\sqrt{d_k}$ 缩放因子对随机分数的影响，绘制图 6.4，并打印实际多头注意力的张量形状。全部数据均为合成，仅需 NumPy、PyTorch、matplotlib，无需下载，CPU 运行约一分钟。

### 第 1 步：设置

本系列各实验都先固定随机种子。NumPy 的打印选项统一设为三位小数，与正文显示精度一致。

```python
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F

np.random.seed(0)
torch.manual_seed(0)
rng = np.random.default_rng(0)           # used by the random experiments below
np.set_printoptions(precision=3, suppress=True)
print("torch", torch.__version__.split("+")[0], "| numpy", np.__version__)
```

```output
torch 2.14.1 | numpy 2.4.6
```

### 步骤 2 — NumPy 手算示例

第 3 节直接给出了三个 token 的投影向量，所以无需学习权重，也没有嵌入：输入为 $\mathbf{Q} = \mathbf{K}$ 和 $\mathbf{V}$。全部计算使用 `float64`，舍入误差远小于正文显示的精度。

`softmax` 在求指数前减去各行最大值。这不改变结果（分子与分母都乘以 $e^{-m}$），却能避免溢出；实验 3 将再次使用这一性质。`attention` 返回推导中的分数 $\mathbf{S}$、权重 $\mathbf{P}$、输出 $\mathbf{O}$ 三个矩阵。因果掩码在 softmax 之前将满足 $j > i$ 的条目写为 $-\infty$，使对应权重精确为零。

```python
Q = np.array([[1., 0.], [0., 1.], [1., 1.]])
K = Q.copy()
V = np.array([[1., 0.], [0., 2.], [3., 3.]])


def softmax(s, axis=-1):
    """Row-wise softmax; subtracting the maximum keeps exp() from overflowing."""
    e = np.exp(s - s.max(axis=axis, keepdims=True))
    return e / e.sum(axis=axis, keepdims=True)


def attention(Q, K, V, causal=True, scale=True):
    """Return scores S, weights P and output O = P V for one head, shapes (T, d)."""
    S = Q @ K.T
    if scale:
        S = S / np.sqrt(Q.shape[-1])
    if causal:
        S = np.where(np.tril(np.ones_like(S, dtype=bool)), S, -np.inf)
    P = softmax(S)
    return S, P, P @ V


S, P, O = attention(Q, K, V, causal=True, scale=True)
print("scores S (masked entries are -inf):")
print(S)
print("weights P:")
print(P)
print("output O:")
print(O)
```

```output
scores S (masked entries are -inf):
[[0.707  -inf  -inf]
 [0.    0.707  -inf]
 [0.707 0.707 1.414]]
weights P:
[[1.    0.    0.   ]
 [0.33  0.67  0.   ]
 [0.248 0.248 0.503]]
output O:
[[1.    0.   ]
 [0.33  1.34 ]
 [1.759 2.007]]
```

第 1 行正好是 $\mathbf{v}_1 = (1, 0)$，第 2 行是 $(0.330, 1.340)$，第 3 行是 $(1.759, 2.007)$：第 3 节 的数字，这里有精确的权重。

### 步骤 3 — 另外三个变体

正文也计算了无掩码和无缩放的情况。四次调用覆盖 {因果掩码，无掩码} × {缩放，无缩放} 的 2 × 2 组合。

```python
for causal in (True, False):
    for scale in (True, False):
        _, P_, O_ = attention(Q, K, V, causal=causal, scale=scale)
        tag = f"{'causal  ' if causal else 'unmasked'} {'scaled  ' if scale else 'unscaled'}"
        print(tag, "O =", np.round(O_, 3).tolist())
        print(" " * 17, "row 3 weights", np.round(P_[2], 3).tolist())
```

```output
causal   scaled   O = [[1.0, 0.0], [0.33, 1.34], [1.759, 2.007]]
                  row 3 weights [0.248, 0.248, 0.503]
causal   unscaled O = [[1.0, 0.0], [0.269, 1.462], [1.94, 2.152]]
                  row 3 weights [0.212, 0.212, 0.576]
unmasked scaled   O = [[1.604, 1.599], [1.401, 2.006], [1.759, 2.007]]
                  row 3 weights [0.248, 0.248, 0.503]
unmasked unscaled O = [[1.689, 1.578], [1.422, 2.112], [1.94, 2.152]]
                  row 3 weights [0.212, 0.212, 0.576]
```

与正文一致，无掩码、保留缩放时，只有第 1、2 行不同。去掉缩放后，第 3 行权重从 $(0.248, 0.248, 0.503)$ 变为 $(0.212, 0.212, 0.576)$，输出从 $(1.759, 2.007)$ 变为 $\mathbf{v}_3 = (3, 3)$。

### 步骤 4 — 与 PyTorch 融合 kernel 核对

`torch.nn.functional.scaled_dot_product_attention`（SDPA）是本模块各模型调用的函数。它接收形状为 `(B, h, T, d_k)` 的张量，自行应用 $1/\sqrt{d_k}$ 缩放，并在 `is_causal=True` 时使用因果掩码。在 CPU 上可能采用融合 kernel 或直接公式，但两者都应与步骤 2 一致。比较指标为所有元素的最大绝对差。

```python
def to4(a):
    """(T, d) NumPy array -> (1, 1, T, d) float64 tensor: batch 1, one head."""
    return torch.tensor(a, dtype=torch.float64)[None, None]


q4, k4, v4 = to4(Q), to4(K), to4(V)
for causal in (True, False):
    ref = attention(Q, K, V, causal=causal, scale=True)[2]
    out = F.scaled_dot_product_attention(q4, k4, v4, is_causal=causal)[0, 0].numpy()
    print(f"is_causal={causal!s:5}  max |numpy - torch| = {np.abs(out - ref).max():.1e}")
```

```output
is_causal=True   max |numpy - torch| = 5.6e-17
is_causal=False  max |numpy - torch| = 0.0e+00
```

误差小于 $10^{-16}$，处于 `float64` 舍入精度，说明手算、公式与融合 kernel 对应相同计算。

### 步骤 5 — 填充掩码

batch 中的序列可不等长，短序列需要填充。**填充掩码**隐藏填充键，并与因果掩码做逻辑 AND：只有 $j \le i$ 且键 $j$ 是真实 token 时，查询 $i$ 才能看到键 $j$。此处将同一示例堆叠两次，并将第二条序列的第三个 token 设为填充。SDPA 接收布尔 `attn_mask`，其中 `True` 表示“允许关注”；它在头维度广播，形状为 `(B, 1, T, T)`。

```python
qb = to4(Q).expand(2, 1, 3, 2).clone()               # batch of two copies, (2, 1, 3, 2)
kb = qb.clone()
vb = to4(V).expand(2, 1, 3, 2).clone()
real = torch.tensor([[True, True, True], [True, True, False]])        # (B, T) keys
causal_mask = torch.tril(torch.ones(3, 3, dtype=torch.bool))          # (T, T)
mask = causal_mask[None, None] & real[:, None, None, :]               # (B, 1, T, T)
print("mask shape:", tuple(mask.shape))
print("second sequence's mask:")
print(mask[1, 0].int().numpy())

out = F.scaled_dot_product_attention(qb, kb, vb, attn_mask=mask)
print("sequence 1 output:")
print(out[0, 0].numpy())
print("sequence 2 output (row 3 is a padded query):")
print(out[1, 0].numpy())
```

```output
mask shape: (2, 1, 3, 3)
second sequence's mask:
[[1 0 0]
 [1 1 0]
 [1 1 0]]
sequence 1 output:
[[1.    0.   ]
 [0.33  1.34 ]
 [1.759 2.007]]
sequence 2 output (row 3 is a padded query):
[[1.   0.  ]
 [0.33 1.34]
 [0.5  1.  ]]
```

第一条序列不变。第二条序列的第 1、2 行也不变，因为原本就看不到 token 3。第 3 行属于填充位置，但查询仍能看到键 1、2，所以得到看似合理的 $(0.500, 1.000)$。这正是填充的陷阱：填充位置也有输出，而且貌似正常；只有损失掩码才能排除这些位置的训练贡献。

### 步骤 6 — 第 3 行的 softmax 雅可比矩阵

[第 2 节](#s2) 已为 $\mathbf{p} = \operatorname{softmax}(\mathbf{s})$ 推导 $\mathbf{J} = \operatorname{diag}(\mathbf{p}) - \mathbf{p}\mathbf{p}^\top$。这里检查两个性质：行和为零（权重总和为 1，改变分数不能改变这个总和），以及它与中心有限差分一致，使用 $\partial p_i / \partial s_j \approx [p_i(\mathbf{s} + \epsilon\mathbf{e}_j) - p_i(\mathbf{s} - \epsilon\mathbf{e}_j)]/(2\epsilon)$ 和 $\epsilon = 10^{-6}$。

```python
s3 = S[2]                                      # scaled scores of row 3: 0.707, 0.707, 1.414
p3 = softmax(s3)
J = np.diag(p3) - np.outer(p3, p3)
print("J = diag(p) - p p^T:")
print(J)
print("largest |row sum|:", f"{np.abs(J.sum(axis=1)).max():.1e}")

eps = 1e-6
J_fd = np.zeros((3, 3))
for j in range(3):
    step = np.zeros(3)
    step[j] = eps
    J_fd[:, j] = (softmax(s3 + step) - softmax(s3 - step)) / (2 * eps)
print(f"max |J - finite differences| = {np.abs(J - J_fd).max():.1e}")
```

```output
J = diag(p) - p p^T:
[[ 0.187 -0.062 -0.125]
 [-0.062  0.187 -0.125]
 [-0.125 -0.125  0.25 ]]
largest |row sum|: 2.8e-17
max |J - finite differences| = 4.9e-11
```

$10^{-11}$ 阶的残差是有限差分的截断和舍入误差，而不是 $\mathbf{J}$ 的缺陷。

### 步骤 7：第 3 节的梯度，通过 autograd

第 3 节手算了 $\mathcal{L} = o_{3,2}$ 的反向传播：$\partial\mathcal{L}/\partial\mathbf{q}_3 = (0.001, 0.352)$，键的梯度为 $(-0.352, -0.352)$、$(-0.001, -0.001)$、$(0.354, 0.354)$，$\partial\mathcal{L}/\partial\mathbf{V}$ 的第二列等于 $\mathbf{P}$ 的第 3 行。自动求导无需这些答案即可对融合 kernel 求导。

```python
Qt, Kt, Vt = (to4(a).requires_grad_() for a in (Q, K, V))
Ot = F.scaled_dot_product_attention(Qt, Kt, Vt, is_causal=True)
loss = Ot[0, 0, 2, 1]                      # second component of token 3's output
loss.backward()
print("loss =", f"{loss.item():.3f}")
print("dL/dQ:")
print(Qt.grad[0, 0].numpy())
print("dL/dK:")
print(Kt.grad[0, 0].numpy())
print("dL/dV:")
print(Vt.grad[0, 0].numpy())
```

```output
loss = 2.007
dL/dQ:
[[0.    0.   ]
 [0.    0.   ]
 [0.001 0.352]]
dL/dK:
[[-0.352 -0.352]
 [-0.001 -0.001]
 [ 0.354  0.354]]
dL/dV:
[[0.    0.248]
 [0.    0.248]
 [0.    0.503]]
```

只有 $\mathbf{Q}$ 的第 3 行接收梯度，因为其他查询不影响 $o_{3,2}$。$\mathbf{V}$ 梯度的第一列为零（损失仅读取第二分量），第二列为 $(0.248, 0.248, 0.503)$，即注意力权重本身。

### 步骤 8 — 为何缩放分数

第 2 节的方差推导表明，元素独立且方差为 1 时，有 $\operatorname{Var}(\mathbf{q}\cdot\mathbf{k}) = d_k$。这里实际测量：为四种头宽度分别抽取 100,000 对标准正态向量。保留这些点积，用于图 6.4 的左图。

```python
dots = {}
print(f"{'d_k':>5} {'std(q.k)':>9} {'sqrt(d_k)':>10}")
for dk in (2, 16, 64, 128):
    q = rng.standard_normal((100_000, dk))
    k = rng.standard_normal((100_000, dk))
    dots[dk] = (q * k).sum(axis=1)
    print(f"{dk:>5} {dots[dk].std():>9.2f} {np.sqrt(dk):>10.2f}")
```

```output
  d_k  std(q.k)  sqrt(d_k)
    2      1.43       1.41
   16      3.99       4.00
   64      7.99       8.00
  128     11.33      11.31
```

各实测标准差与 $\sqrt{d_k}$ 相差约不超过 1%；原始分数的标准差随头宽度增长。

### 步骤 9 — 饱和

接下来测量这种增长对 softmax 的影响。在 $d_k = 128$ 下，独立抽取一个查询和 16 个键，元素服从标准正态分布，共重复 5,000 次。每次分别对未缩放分数和除以 $\sqrt{128}$ 后的分数计算 softmax，记录最大权重与熵 $H = -\sum_j p_j \ln p_j$。均匀行的熵为 $\ln 16 = 2.77$ 奈特，独热分布 0。两张图对应图 6.4：原始分数分布、最大权重直方图。

```python
dk, n_keys, n_draws = 128, 16, 5000
rng_sat = np.random.default_rng(0)                  # a fresh generator: the draw does not
qd = rng_sat.standard_normal((n_draws, dk))         # depend on how much Step 8 consumed
kd = rng_sat.standard_normal((n_draws, n_keys, dk))
raw = np.einsum("nd,nkd->nk", qd, kd)               # unscaled scores, (5000, 16)


def stats(scores):
    """Largest weight and entropy (nats) of the softmax of each row."""
    p = softmax(scores)
    entropy = -(p * np.log(p + 1e-300)).sum(axis=1)
    return p.max(axis=1), entropy


for name, sc in (("unscaled", raw), ("scaled", raw / np.sqrt(dk))):
    pmax, ent = stats(sc)
    print(f"{name:9s} median largest weight {np.median(pmax):.3f}   "
          f"mean entropy {ent.mean():.2f} nats   (uniform: {np.log(n_keys):.2f})")
    if name == "unscaled":
        print(f"{'':9s} share of rows with largest weight above 0.95: "
              f"{(pmax > 0.95).mean():.2f}")

fig, axes = plt.subplots(1, 2, figsize=(10, 3.6))
for dk_, colour in ((2, "tab:blue"), (16, "tab:orange"), (128, "tab:green")):
    axes[0].hist(dots[dk_], bins=np.linspace(-40, 40, 81), alpha=0.6, color=colour,
                 density=True, label=f"$d_k$ = {dk_}  (std {dots[dk_].std():.1f})")
axes[0].set_xlabel("score  q . k")
axes[0].set_ylabel("density")
axes[0].set_title("Spread of raw scores grows with $d_k$")
axes[0].legend()
for name, sc, colour in (("unscaled", raw, "tab:red"),
                         ("scaled by $1/\\sqrt{d_k}$", raw / np.sqrt(dk), "tab:blue")):
    pmax, _ = stats(sc)
    axes[1].hist(pmax, bins=np.linspace(0, 1, 41), alpha=0.6, color=colour,
                 label=f"{name} (median {np.median(pmax):.3f})")
axes[1].set_xlabel("largest softmax weight in the row")
axes[1].set_ylabel("number of draws")
axes[1].set_title("16 keys, $d_k$ = 128: saturation")
axes[1].legend(loc="upper center")
plt.tight_layout()
plt.show()
```

```output
unscaled  median largest weight 0.978   mean entropy 0.28 nats   (uniform: 2.77)
          share of rows with largest weight above 0.95: 0.58
scaled    median largest weight 0.225   mean entropy 2.35 nats   (uniform: 2.77)
```

未缩放时，大多数抽样的最大权重接近 1，平均熵约为均匀分布的十分之一：softmax 接近硬查找，传递梯度给 $\mathbf{W}_Q$、$\mathbf{W}_K$ 的雅可比矩阵接近零。缩放后，权重分布较分散。

### 第 10 步：多头形状

[第 4 节](#s4) 追踪形状 $(B, T, d)$ 的张量在多头计算中的变化。这里采用同样的路径，设置 $B = 2$、$T = 16$、$d = 256$、$h = 8$，头宽度为 $d_k = 32$。投影得到 `(B, T, d)`；`view` 将最后轴拆为各头；`transpose(1, 2)` 将头轴移到 batch 轴旁，使矩阵乘法作用于最后两个轴 `(T, d_k)`。最后转置并 reshape，合并各头。将结果与同样投影张量的 SDPA 输出比较。

```python
B, T, d, h = 2, 16, 256, 8
dk = d // h
x = torch.randn(B, T, d)
wq, wk, wv = (nn.Linear(d, d, bias=False) for _ in range(3))

q = wq(x).view(B, T, h, dk)
print("after the projection and view:", tuple(q.shape))
q = q.transpose(1, 2)
k = wk(x).view(B, T, h, dk).transpose(1, 2)
v = wv(x).view(B, T, h, dk).transpose(1, 2)
print("after transpose(1, 2):        ", tuple(q.shape))

scores = q @ k.transpose(-2, -1) / dk ** 0.5
print("scores:                       ", tuple(scores.shape))
causal_mask = torch.tril(torch.ones(T, T, dtype=torch.bool))
weights = scores.masked_fill(~causal_mask, float("-inf")).softmax(dim=-1)
per_head = weights @ v
print("per-head output:              ", tuple(per_head.shape))
merged = per_head.transpose(1, 2).reshape(B, T, d)
print("merged:                       ", tuple(merged.shape))

fused = F.scaled_dot_product_attention(q, k, v, is_causal=True)
print(f"max |explicit - fused| = {(per_head - fused).abs().max().item():.1e}")
```

```output
after the projection and view: (2, 16, 8, 32)
after transpose(1, 2):         (2, 8, 16, 32)
scores:                        (2, 8, 16, 16)
per-head output:               (2, 8, 16, 32)
merged:                        (2, 16, 256)
max |explicit - fused| = 2.4e-07
```

显式 softmax 与融合 kernel 在 `float32` 舍入精度内一致，约 $10^{-7}$。这不同于前面 $10^{-16}$ 的精度，因此前面使用 `float64`。

### 预期观察

- NumPy 与 PyTorch 的输出在 $10^{-16}$ 下误差小于 `float64`。手算、公式与融合 kernel 对应相同计算。
- 各输出行是可见值向量的凸组合。有因果掩码时，无论 $\mathbf{Q}$、$\mathbf{K}$ 为何，第 1 行精确等于 $\mathbf{v}_1$。
- 去掉缩放使各行权重更集中，第 3 行最大权重从 0.503 升至 0.576。在 $d_k = 128$ 下，大多数未缩放抽样接近独热分布，雅可比矩阵及到达 $\mathbf{W}_Q$、$\mathbf{W}_K$ 的梯度几乎消失。
- 第 3 行各分数的梯度总和为零。来自 $\mathcal{L} = o_{3,2}$ 的梯度只到达 $\mathbf{q}_3$、键，以及 $\mathbf{V}$ 的第二列。

### 进一步尝试

1. 将 `Q` 乘以 10，重跑步骤 2。第 3 行接近 $(0, 0, 1)$，输出接近 $\mathbf{v}_3 = (3, 3)$，即 [第 1 节](#s1) 的硬查找极限。步骤 6 的雅可比矩阵会怎样变化？
2. 将一个查询的全部键屏蔽（全填充行），观察 NumPy $-\infty$ 将 `softmax` 减去 $-\infty$ 后的结果，并与 SDPA 比较。再编写保护逻辑，令这种行返回零。
3. 用显式 Python 循环逐头实现多头注意力，与步骤 10 的批量实现比较，确认误差不超过 $10^{-6}$。
## 实验 2 — 用数值检验 RoPE {#lab2}

**目标。** 实现旋转位置编码，验证相对位置性质，再故意破坏它。比较实数与复数实现，测量频率和位置插值如何改变分数。输入均为合成，无需下载；输出末位可能随机器变化。

### 步骤 1：旋转相邻对

`x` 的各行表示对应位置的向量。最后维度必须为偶数，因为旋转逐对进行。如 [第 6 节](#s6) 推导，查询与键同时平移相同位置，其点积中的平移会抵消。

```python
import numpy as np
import matplotlib.pyplot as plt
import torch

np.random.seed(0)
torch.manual_seed(0)
rng = np.random.default_rng(0)
np.set_printoptions(precision=3, suppress=True)


def rope_np(x, positions, base=10000.0):
    width = x.shape[-1]
    assert width % 2 == 0
    frequencies = base ** (-np.arange(0, width, 2) / width)
    angles = np.asarray(positions)[..., None] * frequencies
    first, second = x[..., 0::2], x[..., 1::2]
    result = np.empty_like(x)
    result[..., 0::2] = first * np.cos(angles) - second * np.sin(angles)
    result[..., 1::2] = first * np.sin(angles) + second * np.cos(angles)
    return result


q, k = np.array([[1., 0.]]), np.array([[0., 1.]])
for t, s in ((3, 1), (7, 5), (1, 3), (5, 5)):
    score = (rope_np(q, [t]) * rope_np(k, [s])).sum()
    print(f"positions ({t}, {s}): score {score:.3f}")
```

```output
positions (3, 1): score 0.909
positions (7, 5): score 0.909
positions (1, 3): score -0.909
positions (5, 5): score 0.000
```

### 第 2 步：测试每条对角线

在每个位置使用相同的内容向量，只让位置改变。沿各对角线数值恒定的矩阵称为 **Toeplitz 矩阵**，各对角线偏移对应相对位置。这不意味着真实句子的分数矩阵也是 Toeplitz，因为内容会变化。

```python
positions = np.arange(64)
q = np.broadcast_to(rng.normal(size=64), (64, 64)).copy()
k = np.broadcast_to(rng.normal(size=64), (64, 64)).copy()
qr, kr = rope_np(q, positions), rope_np(k, positions)
scores = qr @ kr.T


def diagonal_deviation(matrix):
    return max(np.abs(np.diag(matrix, offset) -
                      np.diag(matrix, offset).mean()).max()
               for offset in range(1 - len(matrix), len(matrix)))


print(f"both rotated: diagonal deviation {diagonal_deviation(scores):.1e}")
norm_error = np.abs(np.linalg.norm(qr, axis=1) - np.linalg.norm(q, axis=1))
print(f"maximum norm change: {norm_error.max():.1e}")
broken = qr @ k.T
print(f"query only: diagonal deviation {diagonal_deviation(broken):.3f}")
assert diagonal_deviation(scores) < 1e-11
assert norm_error.max() < 1e-11
```

```output
both rotated: diagonal deviation 2.1e-14
maximum norm change: 8.9e-16
query only: diagonal deviation 10.936
```

仅旋转查询会留下绝对位置依赖性。代码仍然运行并且形状仍然匹配，这使得这对于错误的 RoPE 调用来说是一个有用的诊断。

### 步骤 3 — 用复数乘法核对

两个实坐标分别作为复数的实部与虚部，乘以单位复数即可完成相同旋转。它能检查配对约定和符号。有些模型将头的前半维度与后半维度配对，投影权重也必须采用相应排列。

```python
def rope(x, base=10000.0):
    B, h, T, dk = x.shape
    theta = base ** (-torch.arange(0, dk, 2, device=x.device) / dk)
    ang = torch.arange(T, device=x.device)[:, None] * theta[None, :]
    cos, sin = ang.cos()[None, None], ang.sin()[None, None]
    x1, x2 = x[..., 0::2], x[..., 1::2]
    return torch.stack([x1 * cos - x2 * sin, x1 * sin + x2 * cos],
                       dim=-1).flatten(-2)


x = torch.randn(2, 4, 32, 64)
theta = 10000.0 ** (-torch.arange(0, 64, 2) / 64)
angle = torch.arange(32)[:, None] * theta[None, :]
complex_x = torch.view_as_complex(x.reshape(2, 4, 32, 32, 2))
phase = torch.polar(torch.ones_like(angle), angle)
complex_result = torch.view_as_real(complex_x * phase).flatten(-2)
print(f"real versus complex: {(rope(x) - complex_result).abs().max():.1e}")
assert torch.allclose(rope(x), complex_result, atol=1e-6)
qt = torch.tensor(q[0], dtype=torch.float32).expand(1, 1, 256, 64)
kt = torch.tensor(k[0], dtype=torch.float32).expand(1, 1, 256, 64)
float_scores = (rope(qt) @ rope(kt).transpose(-1, -2))[0, 0].numpy()
print(f"float32, 256 positions: {diagonal_deviation(float_scores):.1e}")
```

```output
real versus complex: 4.8e-07
float32, 256 positions: 4.4e-05
```

float32 误差随位置增大，因为更大的角度会损失更多绝对精度。这是数值误差，并非相对位置恒等式失效。

### 步骤 4 — 波长与振荡

对于宽度 128、相互对齐的全一向量，归一化点积就是 64 个旋转角的余弦平均。各频率会振荡，总和不保证单调衰减。这张图描述一个示意性位置 kernel，并非测量训练后注意力头的权重。

```python
offsets = np.arange(1, 16385)
fig, ax = plt.subplots(figsize=(8, 4))
for base in (10000.0, 500000.0):
    frequencies = base ** (-np.arange(0, 128, 2) / 128)
    wavelengths = 2 * np.pi / frequencies
    correlation = np.cos(offsets[:, None] * frequencies).mean(axis=1)
    print(f"base {base:.0f}: wavelengths {wavelengths[0]:.2f} to "
          f"{wavelengths[-1]:.0f}; above 4096: {(wavelengths > 4096).sum()}/64")
    if base == 10000:
        for offset in (1, 16, 128, 1024, 4096):
            print(f"  offset {offset:5d}: {correlation[offset - 1]:.3f}")
    ax.plot(offsets, correlation, label=f"base {base:.0f}", alpha=0.8)
ax.set_xscale("log")
ax.set_xlabel("relative position (tokens)")
ax.set_ylabel("dot product / dot product at zero offset")
ax.set_title("RoPE positional kernel for aligned all-one vectors")
ax.legend()
plt.tight_layout()
plt.show()
```

```output
base 10000: wavelengths 6.28 to 54410; above 4096: 18/64
  offset     1: 0.970
  offset    16: 0.620
  offset   128: 0.333
  offset  1024: 0.204
  offset  4096: -0.053
base 500000: wavelengths 6.28 to 2559196; above 4096: 32/64
```

### 第 5 步：插值和 ALiBi

位置除以四，将 256 个位置映射到原来 64 个位置所覆盖的大致角度范围。在位置编号可被四整除处，分数矩阵与原矩阵精确一致。仅凭这一等式，不能证明训练后的模型能处理更长序列，因为中间位置间距和竞争键的分布已改变。

```python
long_positions = np.arange(256) / 4
long_q = np.broadcast_to(q[0], (256, 64))
long_k = np.broadcast_to(k[0], (256, 64))
interpolated = rope_np(long_q, long_positions) @ rope_np(long_k, long_positions).T
print(f"interpolated submatrix error: {np.abs(interpolated[::4, ::4] - scores).max():.1e}")
assert np.allclose(interpolated[::4, ::4], scores, atol=1e-11)
slopes = 2.0 ** (-np.arange(1, 9))
distance = np.maximum(0, np.arange(6)[:, None] - np.arange(6)[None, :])
bias = -slopes[:, None, None] * distance
print("ALiBi slopes:", slopes)
print("first head's bias:")
print(bias[0])
```

```output
interpolated submatrix error: 0.0e+00
ALiBi slopes: [0.5   0.25  0.125 0.062 0.031 0.016 0.008 0.004]
first head's bias:
[[-0.  -0.  -0.  -0.  -0.  -0. ]
 [-0.5 -0.  -0.  -0.  -0.  -0. ]
 [-1.  -0.5 -0.  -0.  -0.  -0. ]
 [-1.5 -1.  -0.5 -0.  -0.  -0. ]
 [-2.  -1.5 -1.  -0.5 -0.  -0. ]
 [-2.5 -2.  -1.5 -1.  -0.5 -0. ]]
```

对角线上方的零偏置不意味着允许读取未来 token；还需单独的因果掩码。这里的几何斜率适用于八个头，其他头数应采用目标实现规定的斜率构造。

### 预期观察

同时旋转两个向量，在舍入误差内保留范数和各对角线分数；只旋转一个则破坏对角线性质。较大基数使衰减更慢；位置除以四，在对应子矩阵上保留原分数。

### 进一步尝试

1. 计算 NTK 感知基数 `10000 * 4 ** (128 / 126)` 并比较波长。
2. 将坐标 `i` 与 `i + 32` 配对，而不是相邻坐标。检查 Toeplitzness，然后显示相同未排列向量的分数不同。
3. 为三 token 算例加入旋转，将所有位置同时平移七格。验证查询与键都平移时，每个输出都不变。

## 实验 3 — 在线 softmax 与分块注意力 {#lab3}

**目标。** 不构造完整分数矩阵，仍精确计算注意力。实现累积 softmax 归一化常数，追踪三 token 算例，并将分块注意力与稠密参考实现比较。本 NumPy 实验测量存储与数值一致性；CPU 计时不能预测 GPU kernel 的速度。

### 步骤一：避免溢出

```python
import time
import numpy as np

np.random.seed(0)
rng = np.random.default_rng(0)
np.set_printoptions(precision=3, suppress=True)


def safe_softmax(scores):
    weights = np.exp(scores - scores.max(axis=-1, keepdims=True))
    return weights / weights.sum(axis=-1, keepdims=True)


large = np.array([1000., 1001., 1002.])
with np.errstate(over="ignore", invalid="ignore"):
    naive = np.exp(large) / np.exp(large).sum()
print("naive:", naive)
print("safe: ", safe_softmax(large))
```

```output
naive: [nan nan nan]
safe:  [0.09  0.245 0.665]
```

减去最大值的因子在分子和分母中抵消。最大指数值为 1，所有指数都不会溢出。

### 步骤 2 — 累积归一化常数

当前最大值定义累积和的尺度。若后续分数提高最大值，须先将旧和乘以 `exp(old_max - new_max)`，再加入新项。输出各概率需要第二遍计算；注意力直接累积加权值，可免去这一遍。

```python
def online_softmax_stats(scores):
    maximum, normaliser = -np.inf, 0.0
    for score in scores:
        new_maximum = max(maximum, score)
        normaliser = (normaliser * np.exp(maximum - new_maximum)
                      + np.exp(score - new_maximum))
        maximum = new_maximum
    return maximum, normaliser


scores = rng.normal(0, 5, 10000)
maximum, normaliser = online_softmax_stats(scores)
online = np.exp(scores - maximum) / normaliser
print(f"online versus safe: {np.abs(online - safe_softmax(scores)).max():.1e}")
assert np.allclose(online, safe_softmax(scores), atol=1e-14)
```

```output
online versus safe: 8.9e-16
```

### 步骤 3：跟踪输出累加器

累加器保存值向量未归一化的加权和。它的尺度必须与归一化常数同步变化；只重新缩放其中一个会得到错误答案。

```python
Q = np.array([[1., 0.], [0., 1.], [1., 1.]])
K = Q.copy()
V = np.array([[1., 0.], [0., 2.], [3., 3.]])
row = Q[2] @ K.T / np.sqrt(2)
maximum, normaliser, accumulator = -np.inf, 0., np.zeros(2)
for start in (0, 2):
    block = row[start:start + 2]
    new_maximum = max(maximum, block.max())
    rescale = np.exp(maximum - new_maximum)
    weights = np.exp(block - new_maximum)
    accumulator = accumulator * rescale + weights @ V[start:start + 2]
    normaliser = normaliser * rescale + weights.sum()
    maximum = new_maximum
    print(f"block {start // 2 + 1}: m={maximum:.3f}, rescale={rescale:.3f}, "
          f"l={normaliser:.3f}, a={accumulator}")
print("output:", accumulator / normaliser)
```

```output
block 1: m=0.707, rescale=0.000, l=2.000, a=[1. 2.]
block 2: m=1.414, rescale=0.493, l=1.986, a=[3.493 3.986]
output: [1.759 2.007]
```

### 步骤 4 — 将查询与键分块

各查询行分别保存最大值、归一化常数和累加器。完全位于未来的键块跳过，对角块内的未来元素用掩码遮盖。代码支持不等块大小，此时某些行可能没有可见键；对这些行采用有限的备用最大值，避免零贡献变为 NaN。

```python
def tiled_attention(Q, K, V, Br=64, Bc=64, causal=True):
    assert Br > 0 and Bc > 0
    assert Q.shape == K.shape and len(Q) == len(V)
    T, width = Q.shape
    output = np.empty((T, V.shape[1]), dtype=Q.dtype)
    tiles, largest = 0, 0
    for row_start in range(0, T, Br):
        query = Q[row_start:row_start + Br]
        rows = row_start + np.arange(len(query))
        maximum = np.full(len(query), -np.inf, dtype=Q.dtype)
        normaliser = np.zeros(len(query), dtype=Q.dtype)
        acc = np.zeros((len(query), V.shape[1]), dtype=Q.dtype)
        key_stop = min(T, row_start + Br) if causal else T
        for key_start in range(0, key_stop, Bc):
            key = K[key_start:key_start + Bc]
            scores = query @ key.T / np.sqrt(width)
            if causal:
                columns = key_start + np.arange(len(key))
                scores = np.where(columns[None, :] <= rows[:, None], scores, -np.inf)
            new_max = np.maximum(maximum, scores.max(axis=1))
            finite_max = np.where(np.isfinite(new_max), new_max, 0)
            rescale = np.exp(maximum - finite_max)
            weights = np.exp(scores - finite_max[:, None])
            acc = acc * rescale[:, None] + weights @ V[key_start:key_start + Bc]
            normaliser = normaliser * rescale + weights.sum(axis=1)
            maximum = new_max
            tiles += 1
            largest = max(largest, scores.nbytes)
        output[row_start:row_start + Br] = acc / normaliser[:, None]
    return output, tiles, largest


def dense_attention(Q, K, V, causal=True):
    scores = Q @ K.T / np.sqrt(Q.shape[1])
    if causal:
        scores = np.where(np.tri(len(Q), dtype=bool), scores, -np.inf)
    return safe_softmax(scores) @ V


print("three-token tiled output:")
print(tiled_attention(Q, K, V, Br=1, Bc=2)[0])
Q, K, V = (rng.normal(size=(1024, 64)) for _ in range(3))
for causal in (True, False):
    reference = dense_attention(Q, K, V, causal)
    result, tiles, largest = tiled_attention(Q, K, V, causal=causal)
    print(f"causal={causal}: float64 error {np.abs(result - reference).max():.1e}, "
          f"tiles {tiles}/256, largest scores {largest // 1024} KiB")
    assert np.allclose(result, reference, atol=1e-12)
    float_inputs = [a.astype(np.float32) for a in (Q, K, V)]
    float_result = tiled_attention(*float_inputs, causal=causal)[0]
    float_dense = dense_attention(*float_inputs, causal=causal)
    print(f"  float32 tiled error {np.abs(float_result - reference).max():.1e}, "
          f"dense error {np.abs(float_dense - reference).max():.1e}")
    assert np.allclose(float_result, reference, atol=2e-6)
print(f"dense scores: {1024 ** 2 * 8 // 1024 ** 2} MiB")
for Br, Bc in ((32, 128), (37, 53)):
    result = tiled_attention(Q, K, V, Br=Br, Bc=Bc)[0]
    assert np.allclose(result, dense_attention(Q, K, V), atol=1e-12)
print("unequal and non-dividing tiles: passed")
```

```output
three-token tiled output:
[[1.    0.   ]
 [0.33  1.34 ]
 [1.759 2.007]]
causal=True: float64 error 5.6e-16, tiles 136/256, largest scores 32 KiB
  float32 tiled error 3.4e-07, dense error 3.3e-07
causal=False: float64 error 1.7e-16, tiles 256/256, largest scores 32 KiB
  float32 tiled error 1.7e-07, dense error 1.7e-07
dense scores: 8 MiB
unequal and non-dividing tiles: passed
```

最大分数块为 32 KiB，完整稠密分数矩阵为 8 MiB。这只是分数存储：分块实现还保留当前块的权重、累加器、输入与输出。这是教学用前向实现，不包含自定义反向传播，也没有利用 GPU 存储层级。

### 第 5 步：对 CPU 实现进行计时

```python
for name, function in (("dense", dense_attention), ("tiled", tiled_attention)):
    started = time.perf_counter()
    function(Q, K, V)
    print(f"{name}: {time.perf_counter() - started:.3f} seconds (CPU NumPy)")
```

```output
dense: 0.012 seconds (CPU NumPy)
tiled: 0.008 seconds (CPU NumPy)
```

这些单次计时受 BLAS、线程数和其他进程影响。GPU FlashAttention 的关键是避免在 HBM 中写入、读回巨大的分数和权重矩阵；CPU 的 Python 循环不能复现这种性能比较。

### 预期观察

在线、稠密、分块结果在舍入误差内一致。64 × 64 的因果分块只计算 256 块中的 136 块；改为不等或不完整的块，仍保持答案。

### 进一步尝试

1. 删除累加器的重新缩放，用三 token 算例找到首个出错块。
2. 保存逐行 log-sum-exp，反向传播时重算概率块。在长度 128 下，将梯度与 PyTorch 自动求导比较。
3. 固定块大小，统计长度 512、1024、2048 时的分数存储；将输入输出存储与中间分数存储分开。
