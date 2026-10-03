## 实验 1 — 从零实现卷积 {#lab1}

**目标。**你用 NumPy 把二维卷积层实现两遍：一遍用显式循环，也就是把定义直接写成代码；一遍用 im2col，把整个层变成一次矩阵乘法。两者都在填充、步长和空洞的七种组合下与 `torch.nn.functional.conv2d` 比对，[第 3 节](#s3)的输出尺寸公式也与代码实际产生的尺寸比对。在此过程中你会确认：深度学习中的“卷积”其实是互相关；平移等变性在循环填充下严格成立，在零填充下只在边界处失效；循环版本处理一个 PyTorch 几毫秒就能跑完的层，大约需要一分钟。步骤 1 到 4 只需要[第 2 节](#s2)；步骤 5 到 8 需要[第 3 节](#s3)和[第 4 节](#s4)。数据是合成的，无需下载，本实验在台式机 CPU 上约需 3 秒，在笔记本电脑上也远不到一分钟。

### 步骤 1：公式与朴素实现

该层把形状为 $(B, C_{\text{in}}, H, W)$ 的输入和形状为
$(C_{\text{out}}, C_{\text{in}}, k, k)$ 的权重映射为 $(B, C_{\text{out}}, H_{\text{out}}, W_{\text{out}})$。按[第 2 节](#s2)和[第 4 节](#s4)，定义为

$$
Y_{b,c,i,j} = \text{bias}_c + \sum_{c'=0}^{C_{\text{in}}-1} \sum_{u=0}^{k-1} \sum_{v=0}^{k-1}
K_{c,c',u,v}\; X^{\text{pad}}_{b,c',\,is+ud,\,js+vd},
$$

其中步长为 $s$，空洞为 $d$，$X^{\text{pad}}$ 是零填充后的输入。输出尺寸为
$H_{\text{out}} = \lfloor (H + 2p - d(k-1) - 1)/s \rfloor + 1$，推导见[第 3 节](#s3)。

第一个函数就是这个公式。第二个函数就是这个和式，每个下标一层 Python 循环：batch、输出通道、输出行、输出列、输入通道，以及两个卷积核偏移。它故意写得很慢，这样其中就不可能藏着难以察觉的错误。

```python
import time
import numpy as np
import torch
import torch.nn.functional as F
from scipy.signal import correlate2d, convolve2d

np.random.seed(0)
torch.manual_seed(0)
rng = np.random.default_rng(0)


def out_size(H, k, p=0, s=1, d=1):
    """Output length along one axis: floor((H + 2p - d(k-1) - 1) / s) + 1."""
    return (H + 2 * p - d * (k - 1) - 1) // s + 1


def conv2d_naive(x, w, b=None, stride=1, padding=0, dilation=1):
    """Convolution as the definition: one explicit loop per index of the sum."""
    B, C_in, H, W = x.shape
    C_out, _, k, _ = w.shape
    H_out = out_size(H, k, padding, stride, dilation)
    W_out = out_size(W, k, padding, stride, dilation)
    xp = np.pad(x, ((0, 0), (0, 0), (padding, padding), (padding, padding)))
    y = np.zeros((B, C_out, H_out, W_out), dtype=x.dtype)
    for n in range(B):
        for c in range(C_out):
            for i in range(H_out):
                for j in range(W_out):
                    acc = 0.0 if b is None else b[c]
                    for c_in in range(C_in):
                        for u in range(k):
                            for v in range(k):
                                acc += (w[c, c_in, u, v]
                                        * xp[n, c_in, i * stride + u * dilation,
                                             j * stride + v * dilation])
                    y[n, c, i, j] = acc
    return y


print(out_size(32, 3, p=1, s=2))  # the layer of Section 3: 32 -> 16
```

```output
16
```

### 步骤 2：第 2 节的示例

[第 2 节](#s2)的 5 × 5 图像和垂直边缘卷积核（三行 $[1, 0, -1]$）已在那里手算过。函数必须精确重现手算结果：
$[[-1,-4,0],[-3,-2,4],[-1,-2,1]]$。

```python
X5 = np.array([[1, 2, 0, 1, 3],
               [0, 1, 3, 2, 1],
               [2, 0, 1, 4, 0],
               [1, 3, 2, 0, 1],
               [0, 1, 1, 2, 2]], dtype=np.float64)
K_edge = np.array([[1, 0, -1]] * 3, dtype=np.float64)

y5 = conv2d_naive(X5[None, None], K_edge[None, None])
print(y5[0, 0])
```

```output
[[-1. -4.  0.]
 [-3. -2.  4.]
 [-1. -2.  1.]]
```

### 步骤 3：互相关还是卷积

深度学习库把这个运算称为卷积，却不翻转卷积核；严格地说，它是互相关（[第 2 节](#s2)）。取一幅随机的 6 × 6 图像和一个非对称卷积核，三次比较就能区分这几种情形：`correlate2d`（不翻转）、`convolve2d`（翻转），以及传给 `convolve2d` 一个事先翻转过的卷积核，这会抵消它自己的翻转。

```python
img = rng.standard_normal((6, 6))
ker = np.array([[1, 2, 0], [0, 1, -1], [3, 0, 1]], dtype=np.float64)

ours = F.conv2d(torch.from_numpy(img)[None, None], torch.from_numpy(ker)[None, None])[0, 0]
ours = ours.numpy()
corr = correlate2d(img, ker, mode="valid")
conv = convolve2d(img, ker, mode="valid")
conv_flipped = convolve2d(img, ker[::-1, ::-1], mode="valid")

print(f"F.conv2d vs correlate2d               : {np.abs(ours - corr).max():.1e}")
print(f"F.conv2d vs convolve2d                : {np.abs(ours - conv).max():.1e}")
print(f"F.conv2d vs convolve2d, flipped kernel: {np.abs(ours - conv_flipped).max():.1e}")
```

```output
F.conv2d vs correlate2d               : 8.9e-16
F.conv2d vs convolve2d                : 6.7e+00
F.conv2d vs convolve2d, flipped kernel: 1.8e-15
```

对网络而言，这个区别无关紧要，因为卷积核是学出来的，翻转后的卷积核不过是另一组权重。当你与信号处理库比对，或者拿手工构造的滤波器去对照教科书时，它才变得重要。

### 步骤 4：平移等变性

[第 2 节](#s2)证明了输入平移则输出平移，也说明了证明在边界处不成立。两部分都来检验。用 `torch.roll` 把一幅随机的 32 × 32 图像平移 $(2, 3)$；它是环绕式的，所以没有像素离开图像。在循环填充下，边界就是环绕，这也正是 `torch.roll` 的做法，所以恒等式应当严格成立。在零填充下则不可能成立：那一圈零不属于图像，不会随图像移动。

```python
x = torch.randn(1, 1, 32, 32)
w = torch.randn(1, 1, 3, 3)
shift = (2, 3)


def conv_pad(x, mode):
    """3 x 3 convolution that keeps the size, padding by `mode`."""
    if mode == "circular":
        return F.conv2d(F.pad(x, (1, 1, 1, 1), mode="circular"), w)
    return F.conv2d(x, w, padding=1)


for mode in ("circular", "zeros"):
    y_then_shift = torch.roll(conv_pad(x, mode), shifts=shift, dims=(2, 3))
    shift_then_y = conv_pad(torch.roll(x, shifts=shift, dims=(2, 3)), mode)
    err = (y_then_shift - shift_then_y).abs()[0, 0]
    interior = err[4:-4, 4:-4].max().item()
    whole = err.max().item()
    print(f"{mode:9s} interior error {interior:.1f}   whole-map error {whole:.1f}")

# where do the zero-padding errors sit? count them inside and outside a 4-pixel frame
bad = err > 1e-6
frame = torch.ones_like(bad)
frame[4:-4, 4:-4] = False
print(f"erroneous positions: {int(bad.sum())} of {bad.numel()};"
      f" inside the interior: {int((bad & ~frame).sum())},"
      f" in the 4-pixel border frame: {int((bad & frame).sum())} of {int(frame.sum())}")
```

```output
circular  interior error 0.0   whole-map error 0.0
zeros     interior error 0.0   whole-map error 10.1
erroneous positions: 240 of 1024; inside the interior: 0, in the 4-pixel border frame: 240 of 448
```

### 步骤 5：输出尺寸

[第 3 节](#s3)示例中的七种配置，$H = 11$、$k = 3$，公式预测的尺寸为 9、11、6、5、11、7、3。最后一种的步长为 3，所以窗口从第 0、3、6 列开始，第 9 列和第 10 列从未被读到。PyTorch 自己给出的答案在步骤 7 中比对。这里使用公式，并在 5 × 5 示例上以填充 1、步长 2 运行朴素函数。

```python
CONFIGS = [(0, 1, 1), (1, 1, 1), (1, 2, 1), (0, 2, 1), (2, 1, 2), (0, 1, 2), (0, 3, 1)]
H, k = 11, 3
print([out_size(H, k, p, s, d) for p, s, d in CONFIGS])

y5s = conv2d_naive(X5[None, None], K_edge[None, None], stride=2, padding=1)
print(y5s[0, 0])
```

```output
[9, 11, 6, 5, 11, 7, 3]
[[-3.  0.  3.]
 [-4. -2.  6.]
 [-4.  2.  2.]]
```

在 5 × 5 的输入上，填充 1、步长 2 得到 3 × 3 的输出。

### 步骤 6：im2col，把层写成一次矩阵乘法

[第 4 节](#s4)把该层写成了一次矩阵乘法。诀窍是：对每个输出位置，把它的窗口读取的 $C_{\text{in}} k^2$ 个输入值排成一列，于是每幅图像得到一个形状为 $(C_{\text{in}} k^2,\; H_{\text{out}} W_{\text{out}})$ 的数组。把权重重塑为 $(C_{\text{out}},\; C_{\text{in}} k^2)$ 再与它相乘，乘积经重塑就是输出。构建这些列不需要对位置做循环：对 $k^2$ 个卷积核偏移 $(u, v)$ 中的每一个，填充后输入的一个带步长的切片就同时包含了所有输出位置上该偏移读取的值。

```python
def im2col(x, k, stride=1, padding=0, dilation=1):
    """(B, C, H, W) -> (B, C*k*k, H_out*W_out); column order matches w.reshape(C_out, -1)."""
    B, C, H, W = x.shape
    H_out = out_size(H, k, padding, stride, dilation)
    W_out = out_size(W, k, padding, stride, dilation)
    xp = np.pad(x, ((0, 0), (0, 0), (padding, padding), (padding, padding)))
    cols = np.empty((B, C, k, k, H_out, W_out), dtype=x.dtype)
    for u in range(k):
        for v in range(k):
            r0, c0 = u * dilation, v * dilation
            cols[:, :, u, v] = xp[:, :, r0:r0 + stride * (H_out - 1) + 1:stride,
                                  c0:c0 + stride * (W_out - 1) + 1:stride]
    return cols.reshape(B, C * k * k, H_out * W_out)


def conv2d_im2col(x, w, b=None, stride=1, padding=0, dilation=1):
    """One matrix multiply: (C_out, C*k*k) @ (B, C*k*k, P) -> (B, C_out, P)."""
    B, C_in, H, W = x.shape
    C_out, _, k, _ = w.shape
    H_out = out_size(H, k, padding, stride, dilation)
    W_out = out_size(W, k, padding, stride, dilation)
    cols = im2col(x, k, stride, padding, dilation)
    y = w.reshape(C_out, -1) @ cols
    if b is not None:
        y = y + b[None, :, None]
    return y.reshape(B, C_out, H_out, W_out)


y_check = conv2d_im2col(X5[None, None], K_edge[None, None])
print(y_check[0, 0])
```

```output
[[-1. -4.  0.]
 [-3. -2.  4.]
 [-1. -2.  1.]]
```

剩下的唯一循环遍历 $k^2 = 9$ 个卷积核偏移，这是一个与图像大小无关的常数；对位置、通道和 batch 的计算都在 NumPy 向量化的切片复制和矩阵乘法内部完成。

### 步骤 7：两者都与 PyTorch 比对，使用 float64

float64 使这次比较检验的是逻辑而不是舍入：如果下标有错，误差是 1 的量级；如果正确，误差是 $10^{-15}$ 的量级。表中每种配置打印 PyTorch 的输出宽度、公式给出的宽度以及两个误差。

```python
xt = rng.standard_normal((2, 3, 11, 11))
wt = rng.standard_normal((4, 3, 3, 3))
bt = rng.standard_normal(4)

print(" p  s  d | torch W | formula | max|naive-torch| | max|im2col-torch|")
for p, s, d in CONFIGS:
    ref = F.conv2d(torch.from_numpy(xt), torch.from_numpy(wt), torch.from_numpy(bt),
                   stride=s, padding=p, dilation=d).numpy()
    a = conv2d_naive(xt, wt, bt, stride=s, padding=p, dilation=d)
    c = conv2d_im2col(xt, wt, bt, stride=s, padding=p, dilation=d)
    print(f" {p}  {s}  {d} | {ref.shape[-1]:7d} | {out_size(11, 3, p, s, d):7d} |"
          f" {np.abs(a - ref).max():16.1e} | {np.abs(c - ref).max():17.1e}")
```

```output
 p  s  d | torch W | formula | max|naive-torch| | max|im2col-torch|
 0  1  1 |       9 |       9 |          3.6e-15 |           1.8e-15
 1  1  1 |      11 |      11 |          3.6e-15 |           8.9e-16
 1  2  1 |       6 |       6 |          3.6e-15 |           1.1e-15
 0  2  1 |       5 |       5 |          3.6e-15 |           1.8e-15
 2  1  2 |      11 |      11 |          4.0e-15 |           8.9e-16
 0  1  2 |       7 |       7 |          4.0e-15 |           1.8e-15
 0  3  1 |       3 |       3 |          3.6e-15 |           1.8e-15
```

每一行都吻合到舍入误差，公式预测了每一个宽度。步长为 3 的那一行证实了输入被悄悄丢弃：宽度为 3 的输出来自只读取第 0 到 8 列的窗口。

### 步骤 8：循环的代价

[第 4 节](#s4)的那一层，输入 $(1, 64, 56, 56)$，输出 128 个通道，3 × 3 卷积核，填充 1，执行 $9 \cdot 64 \cdot 128 \cdot 56 \cdot 56 = 231{,}211{,}008$ 次乘加运算。在它上面运行循环版本大约要一分钟，所以改为给一个小层计时，即 $(1, 8, 16, 16)$ 到 16 个通道（294,912 次 MAC），由此推出每次 MAC 的开销并外推。然后在大层本身上给 im2col 版本和 PyTorch 计时，并打印列数组的大小。

```python
def best_of(fn, repeats=3):
    """Smallest wall-clock time over a few repeats, in seconds."""
    times = []
    for _ in range(repeats):
        t0 = time.perf_counter()
        fn()
        times.append(time.perf_counter() - t0)
    return min(times)


xs = rng.standard_normal((1, 8, 16, 16)).astype(np.float32)
ws = rng.standard_normal((16, 8, 3, 3)).astype(np.float32)
macs_small = 9 * 8 * 16 * 16 * 16
t_small = best_of(lambda: conv2d_naive(xs, ws, padding=1), repeats=2)
per_mac = t_small / macs_small
macs_big = 9 * 64 * 128 * 56 * 56
print(f"small layer: {macs_small:,} MACs; naive loop under half a second:",
      t_small < 0.5)
est = per_mac * macs_big
print(f"big layer: {macs_big:,} MACs; naive estimate between 20 s and 3 min:",
      20 < est < 180)

xb = rng.standard_normal((1, 64, 56, 56)).astype(np.float32)
wb = rng.standard_normal((128, 64, 3, 3)).astype(np.float32)
xb_t, wb_t = torch.from_numpy(xb), torch.from_numpy(wb)
t_im2col = best_of(lambda: conv2d_im2col(xb, wb, padding=1))
t_torch = best_of(lambda: F.conv2d(xb_t, wb_t, padding=1))
print("im2col under 100 ms:", t_im2col < 0.1, "  F.conv2d under 100 ms:", t_torch < 0.1)
print(f"naive estimate is over 100 times slower than im2col: {est > 100 * t_im2col}")
# the exact times differ on every machine and every run, so print them yourself:
# print(est, t_im2col, t_torch)

cols = im2col(xb, 3, padding=1)
print("column array shape:", cols.shape[1:], " entries:", f"{cols[0].size:,}",
      " ratio to input:", f"{cols[0].size / xb[0].size:.1f}")
```

```output
small layer: 294,912 MACs; naive loop under half a second: True
big layer: 231,211,008 MACs; naive estimate between 20 s and 3 min: True
im2col under 100 ms: True   F.conv2d under 100 ms: True
naive estimate is over 100 times slower than im2col: True
column array shape: (576, 3136)  entries: 1,806,336  ratio to input: 9.0
```

$k^2 = 9$ 这个比值就是 im2col 的代价：每个输入值被复制到最多九列中。快速的库会避免把这个数组实际构造出来，这是 `F.conv2d` 还要更快的原因之一，也是隐式 GEMM kernel 存在的原因。计时取决于机器以及同时在运行的其他程序，所以代码只打印对计时的检查；结果是这些数量级。

### 你应该看到什么

- 在全部七种配置下，两种实现都与 PyTorch 吻合到舍入误差，在 float64 下约为 $10^{-15}$。公式预测了每一个输出宽度，包括步长为 3 时的 3。
- `F.conv2d` 是互相关。它与 `correlate2d` 吻合到舍入误差，与 `convolve2d` 相差很大，把卷积核翻转后又与 `convolve2d` 吻合。
- 等变性在循环填充下严格成立。在零填充下，误差在内部为零，只在距边界几个像素之内不为零（4 像素边框的 448 个位置中有 240 个，边框以内的 576 个位置中没有一个），因为平移后的图像在不同的位置看到那一圈零。
- 朴素循环每次乘加运算的开销不到一微秒，所以那个 64 到 128 通道的层在笔记本电脑 CPU 上大约要一分钟（估计值在 20 秒到 3 分钟之间时，检查都打印 `True`）。把层写成一次矩阵乘法，可以把它降到毫秒级，代价是一个九倍于输入大小的中间数组。PyTorch 的 kernel 通常还要更快。按代码注释所说，自己打印这三个时间；要学的是比值，而不是绝对时间。

### 动手试试

1. 给 `conv2d_im2col` 加一个 `groups` 参数，并用 `F.conv2d` 检验逐通道卷积（`groups = C_in`）。每一组都是在自己那部分通道上独立的一次 im2col 和矩阵乘法。
2. 写出 `conv2d_im2col` 的反向传播：$\partial\mathcal{L}/\partial W = dY\, \text{cols}^{\top}$；$\partial\mathcal{L}/\partial X$ 则先计算 $W^{\top} dY$，再经 im2col 的逆运算（col2im，在窗口重叠处相加）把结果散射回去。像[模块 02](module_02_ZH.html) 那样，用有限差分检验两者。
3. 数值检验[第 2 节](#s2)的伴随性质：对随机的 $x$ 和 $y$ 以及同一个卷积核，$\langle \text{conv2d}(x), y\rangle = \langle x, \text{conv\_transpose2d}(y)\rangle$，使用 `F.conv2d` 和 `F.conv_transpose2d`。

## 实验 2 — CNN 对 MLP：归纳偏置换来了什么 {#lab2}

**目标。**你在参数量相同的条件下，用 scikit-learn 的 8 × 8 digits 数据集测量卷积的假设值多少，方法有三种：破坏这些假设（对 64 个像素做一个固定的打乱，这会摧毁局部性）；检验一个你可能会预期的推论（把测试图像平移一个像素）；以及让这些假设变得重要（把数字放在更大画布上的随机位置）。结果对 CNN 而言，在居中的数字上不如坊间说法那么好看，在位置变化时则好看得多；它还表明，[第 1 节](#s1)的两个性质，即局部性和权值共享，在每种情形下各自起了什么作用。数据随 scikit-learn 一起提供，无需下载。本实验在台式机 CPU 上约需 30 秒，在笔记本电脑上需一到两分钟。

### 步骤 1：数据

`load_digits` 有 1,797 幅 8 × 8 像素的图像，取值为 0 到 16 的整数。它们被缩放到 $[0, 1]$，并用 `train_test_split(test_size=0.25, stratify=y, random_state=0)` 划分，得到 1,347 幅训练图像和 450 幅测试图像，[实验 3](#lab3) 也使用这一划分。然后用训练集的均值和标准差对图像做标准化（两个标量；逐像素的统计量会在始终空白的角落像素上除以零），并重塑为 $(N, 1, 8, 8)$。原始的 $[0, 1]$ 数组也保留下来，因为步骤 5 的平移检验必须先用背景填充，再做标准化。

```python
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

np.random.seed(0)
torch.manual_seed(0)

digits = load_digits()
X_all = (digits.data / 16.0).astype(np.float32).reshape(-1, 8, 8)
y_all = digits.target
X_tr_raw, X_te_raw, y_tr, y_te = train_test_split(
    X_all, y_all, test_size=0.25, stratify=y_all, random_state=0)

mean, std = X_tr_raw.mean(), X_tr_raw.std()


def standardise(a):
    """Training-set mean and standard deviation, as a float tensor of shape (N, 1, H, W)."""
    return torch.from_numpy(((a - mean) / std).astype(np.float32))[:, None]


X_tr, X_te = standardise(X_tr_raw), standardise(X_te_raw)
y_tr_t, y_te_t = torch.from_numpy(y_tr), torch.from_numpy(y_te)
print("train", tuple(X_tr.shape), "test", tuple(X_te.shape))
print(f"pixel mean {mean:.3f}, std {std:.3f}; images per class: "
      f"{np.bincount(y_tr).min()}-{np.bincount(y_tr).max()} train, "
      f"{np.bincount(y_te).min()}-{np.bincount(y_te).max()} test")
```

```output
train (1347, 1, 8, 8) test (450, 1, 8, 8)
pixel mean 0.305, std 0.376; images per class: 131-137 train, 43-46 test
```

### 步骤 2：两个同样大小的网络

CNN 有两个卷积阶段，以及作用在展平后 64 个特征上的线性头部：$\text{Conv}(1, 8, 3) \to \text{ReLU} \to \text{MaxPool}(2) \to \text{Conv}(8, 16, 3) \to \text{ReLU} \to \text{MaxPool}(2) \to \text{flatten} \to \text{Linear}(64, 10)$。它的参数为 $8 \cdot 9 + 8 = 80$、$16 \cdot 8 \cdot 9 + 16 = 1{,}168$ 和 $64 \cdot 10 + 10 = 650$，共 1,898 个。MLP 有一个 25 个单元的隐藏层：$64 \cdot 25 + 25 + 25 \cdot 10 + 10 =
1{,}885$ 个参数。两者只差 13 个，所以比较的公平程度在百分之一以内。这里选用微型网络是对的：问题在于架构贡献了什么，而不是容量贡献了什么。

```python
def make_cnn():
    return nn.Sequential(
        nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
        nn.Conv2d(8, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
        nn.Flatten(), nn.Linear(16 * 2 * 2, 10))


def make_mlp():
    return nn.Sequential(nn.Flatten(), nn.Linear(64, 25), nn.ReLU(), nn.Linear(25, 10))


def n_params(model):
    return sum(p.numel() for p in model.parameters())


print("CNN parameters:", f"{n_params(make_cnn()):,}")
print("MLP parameters:", f"{n_params(make_mlp()):,}")
```

```output
CNN parameters: 1,898
MLP parameters: 1,885
```

### 步骤 3：训练两者，各用五个种子

随机种子改变初始权重和 mini-batch 的顺序，这么小的网络单次运行的波动肉眼可见，所以下面的每次比较都用多个种子，并报告均值和标准差。训练使用 Adam，学习率 $3 \times 10^{-3}$，batch 大小 64，60 个轮次，在 logits 上计算交叉熵。本实验中的每个网络都由同一个函数训练。训练好的模型保留下来，供平移检验使用。

```python
def accuracy(model, X, y):
    model.eval()
    with torch.no_grad():
        return (model(X).argmax(dim=1) == y).float().mean().item()


def fit(model, X, y, epochs, lr=3e-3, batch=64, seed=0):
    """Mini-batch Adam on cross-entropy; the seed fixes the batch order."""
    g = torch.Generator().manual_seed(seed)
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    n = len(X)
    for _ in range(epochs):
        model.train()
        order = torch.randperm(n, generator=g)
        for i in range(0, n, batch):
            idx = order[i:i + batch]
            opt.zero_grad()
            F.cross_entropy(model(X[idx]), y[idx]).backward()
            opt.step()
    return model


def run_seeds(make, Xtr, ytr, Xte, yte, seeds, epochs):
    models, accs = [], []
    for seed in seeds:
        torch.manual_seed(seed)
        m = fit(make(), Xtr, ytr, epochs, seed=seed)
        models.append(m)
        accs.append(accuracy(m, Xte, yte))
    return models, np.array(accs)


def report(name, accs):
    per_seed = ", ".join(f"{a:.3f}" for a in accs)
    print(f"{name:13s} test accuracy {accs.mean():.3f} +/- {accs.std():.3f}"
          f"   (seeds: {per_seed})")


SEEDS = range(5)
cnns, acc_cnn = run_seeds(make_cnn, X_tr, y_tr_t, X_te, y_te_t, SEEDS, epochs=60)
mlps, acc_mlp = run_seeds(make_mlp, X_tr, y_tr_t, X_te, y_te_t, SEEDS, epochs=60)
report("CNN", acc_cnn)
report("MLP", acc_mlp)
```

```output
CNN           test accuracy 0.984 +/- 0.003   (seeds: 0.984, 0.987, 0.984, 0.978, 0.984)
MLP           test accuracy 0.972 +/- 0.005   (seeds: 0.964, 0.978, 0.971, 0.978, 0.969)
```

在居中的数字上，CNN 领先的幅度不大，约 98.4% 对 97.2%，即约 1.6% 的测试图像被错分对 2.8%。图像只有 8 × 8：经过两次池化后特征图是 2 × 2，一个数字几乎没有空间容纳卷积所利用的“同一特征出现在不同位置”的结构。CNN 在这里的优势主要来自局部性（每个单元看一个邻域），以及它在各个位置上共享自己为数不多的权重。

### 步骤 4：破坏局部性假设

对每幅训练图像和测试图像的 64 个像素位置施加同一个固定的随机排列，然后重新训练两个网络。对人来说，排列后的数字无法辨认。对 MLP 来说，它们与之前一样容易：它的第一层是一个完整的 $64 \times 25$ 矩阵，对输入做排列只是对这个矩阵的列做排列，所以函数类不变，优化问题也是等价的。CNN“相邻像素属于一体”的假设现在是错的，它的 3 × 3 卷积核看到的是互不相干的像素。

```python
perm = np.random.default_rng(0).permutation(64)


def permute(a):
    return a.reshape(len(a), 64)[:, perm].reshape(-1, 8, 8)


Xp_tr, Xp_te = standardise(permute(X_tr_raw)), standardise(permute(X_te_raw))
_, acc_cnn_p = run_seeds(make_cnn, Xp_tr, y_tr_t, Xp_te, y_te_t, SEEDS, epochs=60)
_, acc_mlp_p = run_seeds(make_mlp, Xp_tr, y_tr_t, Xp_te, y_te_t, SEEDS, epochs=60)
report("CNN permuted", acc_cnn_p)
report("MLP permuted", acc_mlp_p)
```

```output
CNN permuted  test accuracy 0.960 +/- 0.008   (seeds: 0.949, 0.962, 0.967, 0.953, 0.971)
MLP permuted  test accuracy 0.976 +/- 0.003   (seeds: 0.976, 0.980, 0.971, 0.976, 0.980)
```

排列使 CNN 失去了领先：它从约 98.4% 降到 96.0%，低于 MLP，而 MLP 在噪声范围内没有变化（97.6% 对 97.2%）。CNN 的分类结果仍远高于随机猜测（10%），因为 8 × 8 的数字足够小，最后的全连接层可以把卷积提取出的任何东西重新组合起来。它失去的是优势：使它成为 CNN 的那个结构，正是起作用的东西。

### 步骤 5：平移测试图像

卷积是平移等变的，所以人们可能希望 CNN 对平移具有鲁棒性。用步骤 3 的模型测试向右平移一个像素的测试图像，空出的那一列用背景填充（原始像素中为零，之后再标准化）。不重新训练任何东西。对人来说，把居中的数字平移一个像素几乎没有改变什么。

```python
def shift_right(a, pixels=1):
    out = np.zeros_like(a)
    out[:, :, pixels:] = a[:, :, :-pixels]
    return out


X_te_shift = standardise(shift_right(X_te_raw))
acc_cnn_s = np.array([accuracy(m, X_te_shift, y_te_t) for m in cnns])
acc_mlp_s = np.array([accuracy(m, X_te_shift, y_te_t) for m in mlps])
report("CNN shifted", acc_cnn_s)
report("MLP shifted", acc_mlp_s)
```

```output
CNN shifted   test accuracy 0.655 +/- 0.055   (seeds: 0.564, 0.640, 0.736, 0.662, 0.673)
MLP shifted   test accuracy 0.444 +/- 0.014   (seeds: 0.458, 0.444, 0.451, 0.418, 0.447)
```

两者都大幅下降，CNN 降到约 66%，MLP 降到约 44%，而且 CNN 各种子之间的波动很大。CNN 降得少一些，但等变的层并不能造出不变的分类器：展平之后，线性头部对最终 2 × 2 特征图每个位置上的每个通道都有单独的权重，所以它学到的是东西在哪里。不变性需要一个丢弃位置的步骤，例如全局平均池化，还需要位置有变化的训练数据。步骤 6 两者都提供。

### 步骤 6：随机位置上的数字

每个 8 × 8 的数字被粘贴到一块 16 × 16 画布上的随机偏移处，每个方向的偏移为 0 到 8（共 81 个位置）。训练集使用种子为 1 的随机数生成器，测试集使用种子 2，所以两个集合的摆放位置不同。比较三个大小大致相当的网络：

- `CNN-GAP`：$\text{Conv}(1, 8) \to \text{ReLU} \to \text{pool} \to \text{Conv}(8, 16) \to \text{ReLU} \to \text{pool} \to \text{Conv}(16, 32) \to \text{ReLU} \to$ 全局平均池化
  $\to \text{Linear}(32, 10)$，有 $80 + 1{,}168 + 4{,}640 + 330 = 6{,}218$ 个参数；
- `CNN-flatten`：同样的三个卷积，但把 $32 \times 4 \times 4$ 的特征图展平后送入
  $\text{Linear}(512, 10)$：11,018 个参数；
- `MLP`：$256 \to 23 \to 10$，有 6,151 个参数。

第一个和第三个的大小几乎相同；第二个展示了位置相关的头部会带来什么。训练使用 40 个轮次，种子为 0 到 2。

```python
def place_on_canvas(imgs, rng, size=16):
    """Paste each 8x8 image at a uniformly random offset in 0..size-8 on a blank canvas."""
    out = np.zeros((len(imgs), size, size), dtype=np.float32)
    for n, im in enumerate(imgs):
        r, c = rng.integers(0, size - 8 + 1, size=2)
        out[n, r:r + 8, c:c + 8] = im
    return out


Ct_tr_raw = place_on_canvas(X_tr_raw, np.random.default_rng(1))
Ct_te_raw = place_on_canvas(X_te_raw, np.random.default_rng(2))
c_mean, c_std = Ct_tr_raw.mean(), Ct_tr_raw.std()
Ct_tr = torch.from_numpy((Ct_tr_raw - c_mean) / c_std)[:, None]
Ct_te = torch.from_numpy((Ct_te_raw - c_mean) / c_std)[:, None]


def conv_stack():
    return [nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(8, 16, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1), nn.ReLU()]


def make_cnn_gap():
    return nn.Sequential(*conv_stack(), nn.AdaptiveAvgPool2d(1), nn.Flatten(),
                         nn.Linear(32, 10))


def make_cnn_flat():
    return nn.Sequential(*conv_stack(), nn.Flatten(), nn.Linear(32 * 4 * 4, 10))


def make_mlp16():
    return nn.Sequential(nn.Flatten(), nn.Linear(256, 23), nn.ReLU(), nn.Linear(23, 10))


for name, make in [("CNN-GAP", make_cnn_gap), ("CNN-flatten", make_cnn_flat),
                   ("MLP", make_mlp16)]:
    _, accs = run_seeds(make, Ct_tr, y_tr_t, Ct_te, y_te_t, range(3), epochs=40)
    print(f"{n_params(make()):6,} parameters", end="   ")
    report(name, accs)
```

```output
 6,218 parameters   CNN-GAP       test accuracy 0.931 +/- 0.010   (seeds: 0.918, 0.940, 0.936)
11,018 parameters   CNN-flatten   test accuracy 0.893 +/- 0.014   (seeds: 0.873, 0.904, 0.900)
 6,151 parameters   MLP           test accuracy 0.440 +/- 0.029   (seeds: 0.413, 0.427, 0.480)
```

位置变化之后，局面反转了。用全局平均池化的 CNN 保住了大部分精度（约 93%，展平头部为 89%，MLP 为 44%），而参数量与 MLP 相当，因为同样的 3 × 3 滤波器无论笔画出现在哪里都能检测到它，而头部只看到每种特征有多少。MLP 必须从 1,347 个样本中学会每个数字在 81 个位置中每一个位置上的样子，平均每个位置约 17 个样本，且要覆盖全部十个类别，结果只达到 44%。展平头部介于两者之间：它的卷积特征在各位置间共享，但它的头部不共享。

### 步骤 7：第一层学到了什么

取步骤 3 中一个 CNN 第一层的八个 3 × 3 滤波器，显示为放大的灰度图块。[第 14 节](#s14)讨论了这类滤波器的样子；在训练一分钟的 8 × 8 网络中，它们是带噪声的有向边缘检测器和斑点检测器，而不是在照片上训练的网络那种干净的滤波器。

```python
filters = cnns[0][0].weight.detach().numpy()[:, 0]  # (8, 3, 3)
fig, axes = plt.subplots(1, 8, figsize=(12, 2.0))
vmax = np.abs(filters).max()
for k, (ax, f) in enumerate(zip(axes, filters)):
    ax.imshow(f, cmap="gray", vmin=-vmax, vmax=vmax, interpolation="nearest")
    ax.set_title(f"filter {k}", fontsize=8)
    ax.set_xticks([])
    ax.set_yticks([])
fig.suptitle("First-layer 3 x 3 filters of the digit CNN (black negative, white positive)")
plt.tight_layout()
plt.show()
```

### 你应该看到什么

- 在同样大小下，CNN 在居中的数字上犯错更少，但增益不大，因为 8 × 8 的图像太小了。
- 对像素做固定的排列不会伤害 MLP，因为它本来就没有相邻像素的概念，但这会消除 CNN 的领先：它的局部性假设现在不成立了。
- 在这些图像上，两个网络都不具有平移不变性。CNN 的全连接头部带有位置相关的权重，所以等变的层本身并不能给出不变的分类器。
- 当位置变化时，带全局平均池化头部的 CNN 在同样的参数预算下保住了精度，而 MLP 必须从 1,347 个样本中学会每个数字在 81 个位置中每一个上的样子，因而失败。这就是归纳偏置的回报。

### 动手试试

1. **居中数字上的数据效率。**用每类 5、10、20 和 50 幅图像训练两个网络（150 个轮次，batch 32）。两者的差距始终在约一个百分点之内：居中的 8 × 8 数字完全不需要平移等变性。与步骤 6 比较，并说明架构在什么时候才重要。
2. **数据增强，第一部分。**在居中的数字上，每类 20 幅图像、300 个轮次，训练步骤 2 的 CNN，分别带与不带数据增强：$\pm 10°$ 以内的随机旋转（`scipy.ndimage.rotate`，`order=1`）和 $\pm 1$ 像素的平移（填充 1，再随机裁剪 8 × 8）；不要翻转，因为翻转后的 2 或 5 不再是 2 或 5。使用 batch 32 和种子 0 到 2，并在步骤 1 的测试划分上评估。画出两者的训练损失和验证损失。不做增强时，训练损失塌缩到接近零，而验证损失上升；做增强时，训练损失保持在较高水平。解释为什么这里做了增强之后验证精度仍可能更低，并与[第 10 节](#s10)比较。
3. **数据增强，第二部分。**在 16 × 16 画布上用 CNN-GAP，以每类 5 或 20 幅图像训练，一次让每个数字固定在一个位置，另一次在每个轮次都把每个数字重新放到一个新的随机位置（300 个轮次，batch 32，种子 0 到 2，在步骤 6 的测试画布上评估；具体精度会随种子变动几个百分点，但增益的方向和大致幅度不变）。把增益与第一部分比较，并说出规律：当数据增强加入了测试数据具有、而模型自己无法生成的变化时，它才有帮助。
4. 把步骤 2 的展平头部换成全局平均池化，并重做步骤 5 的平移检验。池化去掉了什么？在 2 × 2 的特征图上它的代价是什么？

## 实验 3 — ResNet 内部：计数、感受野与深度 {#lab3}

**目标。**你取[第 8 节](#s8)的 `SmallResNet`，用代码检验本模块对它的说法：它的参数量和乘加次数（用测量每一层的前向钩子）、它的理论感受野（用[第 3 节](#s3)的递推式），以及它的有效感受野（用梯度）。然后你在 8 × 8 的数字上复现退化问题：深的朴素网络比浅的训练得更差，这体现在训练损失上，而不只是在测试集上；恒等捷径消除了这个问题。对初始化时梯度的测量说明了原因。计数和感受野部分使用合成张量，深度实验使用 scikit-learn 的 digits，划分与[实验 2](#lab2) 相同。无需下载。本实验在台式机 CPU 上约需两分钟，在笔记本电脑上需三到四分钟。

### 步骤 1：网络及其参数

两个类就是[第 8 节](#s8)中的那两个，未作改动。`Block` 是两个 3 × 3 卷积，中间有批归一化和 ReLU，再与一条捷径相加：形状不变时捷径是恒等映射，形状改变时是带批归一化的步长 1 × 1 卷积。`SmallResNet` 由一个 3 × 3 的 stem、四个块（三次使宽度加倍、分辨率减半）、全局平均池化和一个线性头部组成。卷积不带偏置，因为每个卷积后面的批归一化都有自己的平移。预期的计数就是[第 8 节](#s8)示例中的那些：stem 928 个，四个块分别为 18,560、57,728、230,144 和 919,040 个，头部 2,570 个，共 1,228,970 个。

```python
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt

np.random.seed(0)
torch.manual_seed(0)


class Block(nn.Module):                      # conv-BN-ReLU twice, with a residual path
    def __init__(self, cin, cout, stride=1):
        super().__init__()
        self.c1 = nn.Conv2d(cin, cout, 3, stride, 1, bias=False)
        self.b1 = nn.BatchNorm2d(cout)
        self.c2 = nn.Conv2d(cout, cout, 3, 1, 1, bias=False)
        self.b2 = nn.BatchNorm2d(cout)
        self.skip = nn.Identity() if stride == 1 and cin == cout else nn.Sequential(
            nn.Conv2d(cin, cout, 1, stride, bias=False), nn.BatchNorm2d(cout))
    def forward(self, x):
        y = F.relu(self.b1(self.c1(x)))
        y = self.b2(self.c2(y))
        return F.relu(y + self.skip(x))

class SmallResNet(nn.Module):
    def __init__(self, classes=10):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv2d(3, 32, 3, 1, 1, bias=False), nn.BatchNorm2d(32), nn.ReLU())
        self.stages = nn.Sequential(
            Block(32, 32), Block(32, 64, 2), Block(64, 128, 2), Block(128, 256, 2))
        self.head = nn.Linear(256, classes)
    def forward(self, x):
        x = self.stages(self.stem(x))
        return self.head(x.mean(dim=(2, 3)))   # global average pooling


def count(module):
    return sum(p.numel() for p in module.parameters())


net = SmallResNet()
print("total parameters:", f"{count(net):,}")
print("stem:", f"{count(net.stem):,}", " blocks:", [f"{count(b):,}" for b in net.stages],
      " head:", f"{count(net.head):,}")
```

```output
total parameters: 1,228,970
stem: 928  blocks: ['18,560', '57,728', '230,144', '919,040']  head: 2,570
```

### 步骤 2：用钩子统计乘加次数

前向钩子（forward hook）是一个函数，PyTorch 在某个模块运行之后调用它，并传入该模块的输入和输出。在每个 `Conv2d` 和 `Linear` 上注册一个钩子，就能记录每一层的输出形状，再按[第 4 节](#s4)由此算出 MAC：对有 $g$ 组的卷积为 $k_h k_w (C_{\text{in}}/g)\, C_{\text{out}}\,
H_{\text{out}} W_{\text{out}}$，对线性层为
$\text{in\_features} \times \text{out\_features}$。与[第 4 节](#s4)一样，批归一化、ReLU、加法和池化都不计入：它们的算术量很小，尽管内存访问量并不小。在 eval 模式下输入一幅形状为 $(1, 3, 32, 32)$ 的全零图像就够了，因为计数只取决于形状。

```python
records = []


def make_hook(name):
    def hook(module, inputs, output):
        if isinstance(module, nn.Conv2d):
            kh, kw = module.kernel_size
            macs = (kh * kw * (module.in_channels // module.groups) * module.out_channels
                    * output.shape[2] * output.shape[3])
        else:
            macs = module.in_features * module.out_features
        records.append((name, tuple(output.shape[1:]), macs))
    return hook


net = SmallResNet().eval()
handles = [m.register_forward_hook(make_hook(n)) for n, m in net.named_modules()
           if isinstance(m, (nn.Conv2d, nn.Linear))]
with torch.no_grad():
    net(torch.zeros(1, 3, 32, 32))
for h in handles:
    h.remove()

print(f"{'layer':16s} {'output (C,H,W)':>16s} {'MACs':>12s}")
for name, shape, macs in records:
    print(f"{name:16s} {str(shape):>16s} {macs:12,d}")
total = sum(m for _, _, m in records)
print(f"{'total':16s} {'':>16s} {total:12,d}   = {2 * total / 1e6:.1f} MFLOPs")
print("check stages.0.c1 by hand:", f"{9 * 32 * 32 * 32 * 32:,}")
```

```output
layer              output (C,H,W)         MACs
stem.0               (32, 32, 32)      884,736
stages.0.c1          (32, 32, 32)    9,437,184
stages.0.c2          (32, 32, 32)    9,437,184
stages.1.c1          (64, 16, 16)    4,718,592
stages.1.c2          (64, 16, 16)    9,437,184
stages.1.skip.0      (64, 16, 16)      524,288
stages.2.c1           (128, 8, 8)    4,718,592
stages.2.c2           (128, 8, 8)    9,437,184
stages.2.skip.0       (128, 8, 8)      524,288
stages.3.c1           (256, 4, 4)    4,718,592
stages.3.c2           (256, 4, 4)    9,437,184
stages.3.skip.0       (256, 4, 4)      524,288
head                        (10,)        2,560
total                               63,801,856   = 127.6 MFLOPs
check stages.0.c1 by hand: 9,437,184
```

每一行都可以手算核对。对 `stages.0.c1`，就是九个卷积核偏移乘以 32 个输入通道，乘以 32 个输出通道，再乘以 32 × 32 的特征图。第 2 至 4 阶段带步长的卷积，开销是第 1 阶段不带步长的卷积的一半，因为它们产生的位置数是四分之一，而输出通道数是两倍；1 × 1 投影很便宜。总数与[第 8 节](#s8)的示例一致。用代码计数，正是发现手算错误、或者发现从别处记来的数字有误的方法。

### 步骤 3：理论感受野

[第 3 节](#s3)的递推式在各层之间跟踪两个数：当前层一个单元的感受野 $r$（以输入像素计），以及跳距 $\Delta$，即相邻单元之间以输入像素计的距离（代码中的变量 `jump`）。卷积核为 $k$、步长为 $s$、空洞为 $d$ 的层按 $r \leftarrow r + (k-1)\,d\,\Delta$ 和
$\Delta \leftarrow \Delta\,s$ 依次更新它们。只需列出主路径上的卷积：带步长的 1 × 1 投影只读取一个位置，它位于旁边 3 × 3 卷积的窗口之内，因此不增加任何东西。

```python
def receptive_field(layers):
    """layers: list of (kernel, stride, dilation). Returns [(r, jump)] after each layer."""
    r, jump, out = 1, 1, []
    for k, s, d in layers:
        r = r + (k - 1) * d * jump      # uses the jump *before* this layer's stride
        jump = jump * s
        out.append((r, jump))
    return out


main_path = [("stem", 3, 1)]
for stage, block in enumerate(net.stages):
    for conv in ("c1", "c2"):
        main_path.append((f"stages.{stage}.{conv}", 3, getattr(block, conv).stride[0]))
rf = receptive_field([(k, s, 1) for _, k, s in main_path])
print("layer           r  jump")
for (name, _, _), (r, jump) in zip(main_path, rf):
    print(f"{name:14s} {r:3d}  {jump:3d}")
```

```output
layer           r  jump
stem             3    1
stages.0.c1      5    1
stages.0.c2      7    1
stages.1.c1      9    2
stages.1.c2     13    2
stages.2.c1     17    4
stages.2.c2     25    4
stages.3.c1     33    8
stages.3.c2     49    8
```

最后一个单元看到输入的一个 $49 \times 49$ 窗口，比该网络所针对的 32 × 32 CIFAR 图像还大。这是理论感受野：能够影响该单元的最大输入像素集合。步骤 4 测量的是实际上有哪些像素影响它。

### 步骤 4：实测的感受野

一个单元的激活对输入的梯度，恰好在输入能影响它的地方不为零。为了得到干净的答案，让每条路径都为正：把每个卷积权重设为 $1/\text{fan-in}$，使激活保持为正；使用全 1 的输入（全零会给出零梯度，因为在 PyTorch 中 ReLU 在 0 处的导数为 0）；并切换到 eval 模式，使批归一化成为一个固定的缩放。输入为 $96 \times 96$，所以最后一个阶段是 $12 \times
12$ 的特征图，考察的单元是它的中心 $(6, 6)$，对各通道求和。反向传播随后对每个输入像素返回它对该单元的贡献大小。

```python
torch.manual_seed(0)
probe = SmallResNet().eval()
for m in probe.modules():
    if isinstance(m, nn.Conv2d):
        fan_in = m.in_channels * m.kernel_size[0] * m.kernel_size[1]
        nn.init.constant_(m.weight, 1.0 / fan_in)

x = torch.ones(1, 3, 96, 96, requires_grad=True)
feat = probe.stages(probe.stem(x))                     # (1, 256, 12, 12)
feat[0, :, 6, 6].sum().backward()
grad = x.grad[0].abs().sum(dim=0).numpy()              # (96, 96), summed over colour channels

rows = np.where(grad.sum(axis=1) > 0)[0]
cols = np.where(grad.sum(axis=0) > 0)[0]
print("last-stage map:", tuple(feat.shape[2:]))
print(f"nonzero gradient: rows {rows.min()}-{rows.max()} ({len(rows)} wide),"
      f" columns {cols.min()}-{cols.max()} ({len(cols)} wide)")
```

```output
last-stage map: (12, 12)
nonzero gradient: rows 24-72 (49 wide), columns 24-72 (49 wide)
```

非零区域恰好是步骤 3 的 $49 \times 49$ 窗口，所以递推式是对的；它位于第 24 到 72 行和列，即该单元的位置（6 × 8 = 48）上下各 24。

### 步骤 5：有效感受野

非零不等于重要。把梯度的绝对值归一化，使其和为 1，再看这些质量中有多少落在以中心为准、逐渐增大的窗口之内。这就是 Luo 等人（2016）的有效感受野，即[第 3 节](#s3)的那个概念。用默认的随机初始化重复这一检验，它的符号是随机的，所以梯度不那么规则。然后画出这张图，勾出理论窗口，并画出包含 50% 和 90% 质量的等值线。

```python
def mass_in_windows(g, centre=48, sizes=(9, 17, 25, 33, 49)):
    g = g / g.sum()
    return [g[centre - s // 2:centre + s // 2 + 1, centre - s // 2:centre + s // 2 + 1].sum()
            for s in sizes]


def input_gradient(model):
    x = torch.ones(1, 3, 96, 96, requires_grad=True)
    model.eval()
    feat = model.stages(model.stem(x))
    feat[0, :, 6, 6].sum().backward()
    return x.grad[0].abs().sum(dim=0).numpy()


torch.manual_seed(1)
default_net = SmallResNet()
grad_default = input_gradient(default_net)

sizes = (9, 17, 25, 33, 49)
print("window size       ", "  ".join(f"{s:5d}" for s in sizes))
print("1/fan-in weights  ", "  ".join(f"{v:5.2f}" for v in mass_in_windows(grad, 48, sizes)))
print("default init      ", "  ".join(f"{v:5.2f}" for v in mass_in_windows(grad_default, 48, sizes)))

g = grad / grad.sum()
order = np.sort(g.ravel())[::-1]
cum = np.cumsum(order)
levels = [order[np.searchsorted(cum, q)] for q in (0.5, 0.9)]
fig, ax = plt.subplots(figsize=(5.2, 4.6))
im = ax.imshow(g, cmap="viridis")
ax.contour(g, levels=sorted(levels), colors=["white", "orange"], linewidths=1.2)
ax.add_patch(plt.Rectangle((23.5, 23.5), 49, 49, fill=False, edgecolor="red", linewidth=1.5))
ax.set_xlabel("input column")
ax.set_ylabel("input row")
ax.set_title("Effective receptive field of one SmallResNet unit\n"
             "(red: theoretical 49 x 49; contours: 50% and 90% of the gradient)", fontsize=9)
fig.colorbar(im, ax=ax, label="share of absolute input gradient")
plt.tight_layout()
plt.show()
```

```output
window size            9     17     25     33     49
1/fan-in weights    0.44   0.72   0.89   0.98   1.00
default init        0.52   0.73   0.87   0.97   1.00
```

理论窗口宽 49 个像素，但约 90% 的梯度落在中间 25 个像素之内，98% 落在中间 33 个之内，单是中央 9 × 9 的像素就占了 40% 以上。随机初始化给出几乎相同的分布。该单元对靠近其中心的像素远比对其理论感受野边缘的像素敏感。经过堆叠卷积的梯度像随机游走之和那样累加，所以权重大致像高斯分布那样衰减，其宽度只按深度的平方根增长。如果任务需要一个单元看到给定大小的目标，那么可用的感受野要比递推式报告的小。

### 步骤 6：初始化时的梯度

初始化时的梯度说明了深度为什么会损害朴素网络。这里的网络足够小，可以在 8 × 8 的数字上运行：一个到 16 个通道的 3 × 3 stem，然后是 $n$ 个块，每块两个 16 通道的 3 × 3 卷积，再接全局平均池化和一个线性层。取 $n = 1, 4, 9, 27$ 个块，网络分别有 $1 + 2n = 3, 9, 19$ 和 55 个卷积层。每种都以四种方式构建：带与不带恒等捷径，带与不带批归一化。用 PyTorch 的默认初始化，在 256 幅训练图像上做一次前向和反向传播，得到到达 stem 权重的梯度范数。

```python
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X_all = (digits.data / 16.0).astype(np.float32).reshape(-1, 8, 8)
X_tr_raw, X_te_raw, y_tr, y_te = train_test_split(
    X_all, digits.target, test_size=0.25, stratify=digits.target, random_state=0)
mean, std = X_tr_raw.mean(), X_tr_raw.std()
X_tr = torch.from_numpy((X_tr_raw - mean) / std)[:, None]
X_te = torch.from_numpy((X_te_raw - mean) / std)[:, None]
y_tr, y_te = torch.from_numpy(y_tr), torch.from_numpy(y_te)


class DepthBlock(nn.Module):
    """Two 16-channel 3x3 convolutions, with or without BN and an identity shortcut."""
    def __init__(self, width, residual, bn):
        super().__init__()
        self.residual = residual
        self.c1 = nn.Conv2d(width, width, 3, padding=1, bias=not bn)
        self.c2 = nn.Conv2d(width, width, 3, padding=1, bias=not bn)
        self.b1 = nn.BatchNorm2d(width) if bn else nn.Identity()
        self.b2 = nn.BatchNorm2d(width) if bn else nn.Identity()

    def forward(self, x):
        y = self.b2(self.c2(F.relu(self.b1(self.c1(x)))))
        return F.relu(y + x) if self.residual else F.relu(y)


class DepthNet(nn.Module):
    def __init__(self, blocks, residual, bn, width=16):
        super().__init__()
        self.stem = nn.Conv2d(1, width, 3, padding=1, bias=not bn)
        self.stem_bn = nn.BatchNorm2d(width) if bn else nn.Identity()
        self.blocks = nn.Sequential(*[DepthBlock(width, residual, bn) for _ in range(blocks)])
        self.head = nn.Linear(width, 10)

    def forward(self, x):
        x = self.blocks(F.relu(self.stem_bn(self.stem(x))))
        return self.head(x.mean(dim=(2, 3)))


def stem_gradient_norm(blocks, residual, bn):
    torch.manual_seed(0)
    model = DepthNet(blocks, residual, bn).train()
    loss = F.cross_entropy(model(X_tr[:256]), y_tr[:256])
    loss.backward()
    return model.stem.weight.grad.norm().item()


layers = [1 + 2 * n for n in (1, 4, 9, 27)]
print("conv layers:           ", "  ".join(f"{L:9d}" for L in layers))
for bn in (False, True):
    for residual in (False, True):
        norms = [stem_gradient_norm(n, residual, bn) for n in (1, 4, 9, 27)]
        label = f"{'BN' if bn else 'no BN':5s} {'residual' if residual else 'plain':8s}"
        print(f"{label}  stem grad:", "  ".join(f"{v:9.2e}" for v in norms))
```

```output
conv layers:                    3          9         19         55
no BN plain     stem grad:  5.24e-03   1.41e-05   9.38e-10   0.00e+00
no BN residual  stem grad:  2.18e-02   3.30e-02   5.18e-02   8.71e-02
BN    plain     stem grad:  5.70e-02   9.52e-02   4.99e-01   1.92e+02
BN    residual  stem grad:  7.30e-02   1.76e-01   2.30e-01   7.89e-01
```

这个规律正是[第 8 节](#s8)推导出的那个。不做归一化时，朴素网络的梯度每层缩小一个大致恒定的倍数，这是几何衰减：PyTorch 的默认卷积初始化以方差 $1/(3\,\text{fan-in})$ 抽取权重，是 He 初始化 $2/\text{fan-in}$ 的六分之一（[模块 02，第 6 节](module_02_ZH.html#s6)），所以每个 ReLU 层把信号缩放约 $1/\sqrt{6} \approx 0.41$，到 55 层时它在 float32 中已下溢为零。批归一化在每一层恢复前向信号的尺度，但它对反向传播的影响并不温和：在深的朴素网络中，梯度反而爆炸了。恒等捷径在两种情况下都使梯度保持在 1 的量级，因为每个块都给自己的雅可比矩阵加上了一个恒等项。

### 步骤 7：退化实验

现在开始训练。朴素网络和残差网络都带批归一化，深度为 7、19 和 55 个卷积层（$n = 3, 9, 27$ 个块），在 digits 上用 SGD（动量 0.9，权重衰减 $10^{-4}$）训练，配合单周期余弦调度：学习率升到峰值 0.05，再降到接近零；batch 大小 64，12 个轮次，种子 0。训练损失按轮次记录，取该轮次各 mini-batch 的均值。训练结束时，每个网络在 eval 模式下在整个训练集上评估，以得到不依赖训练时 batch 统计量的训练损失，并在测试集上评估。如果更深的朴素网络在训练集上更差，那么失败的就是优化，而不是泛化：网络不是在过拟合，而是拟合不了。

```python
def train_depth(blocks, residual, epochs=12, batch=64, peak=0.05, seed=0):
    torch.manual_seed(seed)
    model = DepthNet(blocks, residual, bn=True)
    opt = torch.optim.SGD(model.parameters(), lr=peak, momentum=0.9, weight_decay=1e-4)
    steps = epochs * ((len(X_tr) + batch - 1) // batch)
    sched = torch.optim.lr_scheduler.OneCycleLR(
        opt, max_lr=peak, total_steps=steps, anneal_strategy="cos", cycle_momentum=False)
    g = torch.Generator().manual_seed(seed)
    curve = []
    for _ in range(epochs):
        model.train()
        order = torch.randperm(len(X_tr), generator=g)
        total = 0.0
        for i in range(0, len(X_tr), batch):
            idx = order[i:i + batch]
            opt.zero_grad()
            loss = F.cross_entropy(model(X_tr[idx]), y_tr[idx])
            loss.backward()
            opt.step()
            sched.step()
            total += loss.item() * len(idx)
        curve.append(total / len(X_tr))
    model.eval()
    with torch.no_grad():
        train_loss = F.cross_entropy(model(X_tr), y_tr).item()
        test_acc = (model(X_te).argmax(1) == y_te).float().mean().item()
    return curve, train_loss, test_acc


results = {}
for blocks in (3, 9, 27):
    for residual in (False, True):
        results[(blocks, residual)] = train_depth(blocks, residual)

print("training loss per epoch (mean over mini-batches)")
for (blocks, residual), (curve, _, _) in results.items():
    label = f"{1 + 2 * blocks:2d} layers {'residual' if residual else 'plain   '}"
    print(f"{label}:", " ".join(f"{v:5.2f}" for v in curve))
print()
print("after training, evaluation mode: train loss / test accuracy")
for (blocks, residual), (_, tl, acc) in results.items():
    label = f"{1 + 2 * blocks:2d} layers {'residual' if residual else 'plain   '}"
    print(f"{label}:  {tl:.3f} / {acc:.3f}")
```

```output
training loss per epoch (mean over mini-batches)
 7 layers plain   :  2.27  1.93  1.31  0.65  0.29  0.46  0.20  0.20  0.12  0.08  0.05  0.05
 7 layers residual:  2.25  1.62  0.75  0.27  0.29  0.25  0.10  0.17  0.10  0.04  0.05  0.04
19 layers plain   :  2.27  1.97  1.69  1.42  1.31  1.13  1.09  0.80  0.60  0.54  0.47  0.43
19 layers residual:  2.41  1.08  0.70  0.38  0.23  0.68  0.25  0.23  0.22  0.08  0.06  0.05
55 layers plain   :  2.27  2.21  2.17  2.13  2.15  2.11  2.11  2.10  2.09  2.09  2.08  2.09
55 layers residual:  2.47  0.83  1.91  1.61  3.00  2.43  0.90  0.75  0.41  0.32  0.32  0.31

after training, evaluation mode: train loss / test accuracy
 7 layers plain   :  0.037 / 0.987
 7 layers residual:  0.034 / 0.984
19 layers plain   :  0.399 / 0.842
19 layers residual:  0.044 / 0.987
55 layers plain   :  2.079 / 0.202
55 layers residual:  0.279 / 0.900
```

然后画出曲线，损失取对数坐标轴，使三个要紧的尺度（约 0.05、0.5 和 2）都能看清。虚线是随机猜测水平 $\ln 10 = 2.30$，即一个始终预测均匀分布的网络的损失。

```python
fig, ax = plt.subplots(figsize=(6.4, 4.2))
styles = {3: "tab:blue", 9: "tab:orange", 27: "tab:red"}
for (blocks, residual), (curve, _, _) in results.items():
    ax.plot(range(1, len(curve) + 1), curve, color=styles[blocks],
            linestyle="-" if residual else "--", marker="o" if residual else "s",
            markersize=3, label=f"{1 + 2 * blocks} layers, {'residual' if residual else 'plain'}")
ax.axhline(np.log(10), color="grey", linestyle=":", label="chance (ln 10)")
ax.set_yscale("log")
ax.set_xlabel("epoch")
ax.set_ylabel("training loss (log scale)")
ax.set_title("Degradation: deeper plain networks train worse; residual networks do not")
ax.legend(fontsize=7, ncol=2)
plt.tight_layout()
plt.show()
```

更深的朴素网络训练损失更高。在 7 层时，朴素网络和残差网络相差无几，都在 0.04 附近。在 19 层时，朴素网络已明显落后（约 0.4，残差网络为 0.04），在 55 层时，经过 12 个轮次它仍停留在随机猜测水平附近，为 2.08，而 ln 10 =
2.30。它约 20% 的测试精度，属于一个几乎什么都没学到的网络。原则上，更深的朴素网络能表示较浅网络能表示的任何东西（把多出来的层设为恒等映射即可）；它们做不到，是因为优化找不到那个解。残差块把恒等映射作为默认，把学习对它的修正作为任务。

55 层的残差网络是唯一的瑕疵。在训练中途、学习率接近峰值时，它的损失跳升到 3.0，最终停在 0.28，测试精度 90%，比更浅的同类网络差：朴素网络训练不动，它训练得动，但在这个峰值学习率下并不稳定。步骤 8 要问的是，这其中有多少归因于学习率。

### 步骤 8：深层残差网络的稳定性

残差连接消除了梯度消失，但 55 层的网络有最多的层，每一层都可能放大一次更新，适合 7 层的学习率对它可能太大。用三个峰值学习率、每个三个种子训练 55 层残差网络，并打印最终训练损失和测试精度。

```python
print("55-layer residual network: final train loss / test accuracy, three seeds")
for peak in (0.05, 0.03, 0.02):
    runs = [train_depth(27, True, peak=peak, seed=seed) for seed in range(3)]
    cells = "   ".join(f"{tl:.3f} / {acc:.3f}" for _, tl, acc in runs)
    print(f"peak {peak:.2f}:   {cells}")

print("plain networks at the lower peaks, seed 0: final train loss / test accuracy")
for peak in (0.03, 0.02):
    cells = "   ".join(
        f"{layers} layers {tl:.2f} / {acc:.2f}"
        for layers, (_, tl, acc) in ((2 * b + 1, train_depth(b, False, peak=peak, seed=0))
                                     for b in (9, 27)))
    print(f"peak {peak:.2f}:   {cells}")
```

```output
55-layer residual network: final train loss / test accuracy, three seeds
peak 0.05:   0.279 / 0.900   0.322 / 0.904   0.105 / 0.938
peak 0.03:   0.061 / 0.969   0.084 / 0.971   0.063 / 0.962
peak 0.02:   0.044 / 0.976   0.052 / 0.967   0.047 / 0.964
plain networks at the lower peaks, seed 0: final train loss / test accuracy
peak 0.03:   19 layers 0.93 / 0.64   55 layers 1.66 / 0.32
peak 0.02:   19 layers 0.88 / 0.68   55 layers 1.91 / 0.27
```

峰值为 0.05 时，三个种子的最终训练损失为 0.1 到 0.3；在 0.03 和 0.02 时，三个都在 0.04 到 0.09 之间，测试精度为 96% 到 98%，与较浅的残差网络处于同一水平。降低学习率救不了朴素网络：在第二个循环中，峰值为 0.03 和 0.02 时，它们 19 层的训练损失仍约为 0.9，55 层的为 1.7 到 1.9，测试精度为 0.27 到 0.68。退化是架构的属性，而不是某一个学习率的属性。捷径使深度变得可训练；适中的峰值学习率、预热或零初始化的分支缩放因子（动手试试第 2 项）使很深的网络变得稳定。

### 你应该看到什么

- 每个钩子计数都与[第 4 节](#s4)的公式和[第 8 节](#s8)的示例一致：1,228,970 个参数和 63,801,856 次 MAC。当手算的计数与记住的数字不一致时，以代码打印的计数为准。
- 递推式给出的 49 恰好是非零梯度的范围。大部分梯度集中在中间，所以有效感受野远小于理论感受野。
- 不做归一化时，朴素网络的梯度随深度几何级数地消失。只加批归一化时，深的朴素网络的梯度反而爆炸。恒等捷径在两种情况下都使它保持在 1 的量级。
- 更深的朴素网络训练损失更高，这是优化的失败而不是过拟合；在 55 层时，它几乎没有离开随机猜测水平（ln 10 = 2.30）。残差版本在 7 层和 19 层时达到约 0.04；在 55 层时，它们需要更低的峰值学习率（0.03 或 0.02）才能降到 0.04–0.08，而所试的任何学习率都救不了朴素网络。

### 动手试试

1. **深度可分离块。**把 `Block` 中的 `c1` 和 `c2` 换成一个逐通道 3 × 3 后接一个 1 × 1（称之为 `SepBlock`）。参数量从 1,228,970 降到 187,018，缩小为原来的 1/6.6（[第 6 节](#s6)的示例；如果 stem 只接收 1 个输入通道，则每个计数各减去 576）。在[实验 2](#lab2) 的 16 × 16 平移数字上把两者各训练 10 个轮次，比较精度和每个轮次的用时。解释为什么用时没有降到 1/6.6：逐通道层每搬运一个字节只做很少的算术（[第 6 节](#s6)）。
2. **零初始化的残差分支。**把每个残差分支最后一个批归一化的缩放因子置零（`nn.init.zeros_(block.b2.weight)`），重做 55 层残差网络的运行。把前两个轮次与默认情况比较：每个块一开始都是恒等映射。
3. **不带批归一化的朴素网络。**在朴素网络中去掉批归一化，改用 He 初始化（`nn.init.kaiming_normal_`）。它能深到什么程度，训练才会停滞？
4. **全尺寸的 CIFAR-10。**下面的代码块不在本实验中运行：它需要 `torchvision` 的 CIFAR-10 加载器（下载约 170 MB），最好在免费的 Google Colab GPU 上运行。用随机裁剪、水平翻转和余弦调度把 `SmallResNet` 训练 30 个轮次，分别带与不带数据增强，并画出两条验证曲线。本模块的其他内容都不依赖它的结果。

```python norun
import torchvision, torchvision.transforms as T
from torch.utils.data import DataLoader

norm = T.Normalize((0.4914, 0.4822, 0.4465), (0.2470, 0.2435, 0.2616))
aug = T.Compose([T.RandomCrop(32, padding=4), T.RandomHorizontalFlip(), T.ToTensor(), norm])
plain = T.Compose([T.ToTensor(), norm])
device = "cuda" if torch.cuda.is_available() else "cpu"


def run(train_tf, epochs=30):
    train = torchvision.datasets.CIFAR10("data", train=True, download=True, transform=train_tf)
    val = torchvision.datasets.CIFAR10("data", train=False, download=True, transform=plain)
    tl = DataLoader(train, batch_size=128, shuffle=True, num_workers=2)
    vl = DataLoader(val, batch_size=512)
    model = SmallResNet().to(device)
    opt = torch.optim.SGD(model.parameters(), lr=0.1, momentum=0.9, weight_decay=5e-4,
                          nesterov=True)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, epochs * len(tl))
    curve = []
    for _ in range(epochs):
        model.train()
        for xb, yb in tl:
            opt.zero_grad()
            F.cross_entropy(model(xb.to(device)), yb.to(device)).backward()
            opt.step()
            sched.step()
        model.eval()
        with torch.no_grad():
            hits = sum((model(xb.to(device)).argmax(1).cpu() == yb).sum().item()
                       for xb, yb in vl)
        curve.append(hits / len(val))
    return curve


curves = {"augmented": run(aug), "not augmented": run(plain)}
```
