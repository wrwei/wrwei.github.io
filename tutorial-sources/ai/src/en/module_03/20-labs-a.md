## Lab 1 — Convolution from scratch {#lab1}

**Goal.** You implement a 2D convolution layer twice in NumPy: once with explicit loops, which is
the definition written as code, and once with im2col, which turns the whole layer into one matrix
multiply. Both are checked against `torch.nn.functional.conv2d` for seven combinations of padding,
stride and dilation, and the output-size formula of [Section 3](#s3) is checked against what the
code produces. Along the way you confirm that deep-learning "convolution" is cross-correlation,
that translation equivariance is exact with circular padding and fails only at the border with
zero padding, and that the loop version would need about a minute for a layer that PyTorch runs in
a few milliseconds. Steps 1 to 4 need only [Section 2](#s2); steps 5 to 8 need
[Sections 3](#s3) and [4](#s4). The data is synthetic, there is no download, and the lab runs in
about 3 seconds on a desktop CPU, so well under a minute on a laptop.

### Step 1: the formula and the naive implementation

The layer maps an input of shape $(B, C_{\text{in}}, H, W)$ and a weight of shape
$(C_{\text{out}}, C_{\text{in}}, k, k)$ to $(B, C_{\text{out}}, H_{\text{out}}, W_{\text{out}})$.
The definition, as in [Section 2](#s2) and [Section 4](#s4), is

$$
Y_{b,c,i,j} = \text{bias}_c + \sum_{c'=0}^{C_{\text{in}}-1} \sum_{u=0}^{k-1} \sum_{v=0}^{k-1}
K_{c,c',u,v}\; X^{\text{pad}}_{b,c',\,is+ud,\,js+vd},
$$

with stride $s$, dilation $d$ and the zero-padded input $X^{\text{pad}}$. The output size is
$H_{\text{out}} = \lfloor (H + 2p - d(k-1) - 1)/s \rfloor + 1$, derived in [Section 3](#s3).

The first function is that formula. The second is that sum with one Python loop per index: batch,
output channel, output row, output column, input channel and the two kernel offsets. It is slow
on purpose, so that nothing in it can be wrong in a way that is hard to see.

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

### Step 2: the worked example of Section 2

The 5 × 5 image of [Section 2](#s2) and the vertical-edge kernel (three rows of $[1, 0, -1]$) were
worked by hand there. The function must reproduce the hand result exactly:
$[[-1,-4,0],[-3,-2,4],[-1,-2,1]]$.

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

### Step 3: cross-correlation or convolution

Deep-learning libraries call the operation convolution but do not flip the kernel; strictly it is
cross-correlation ([Section 2](#s2)). With a random 6 × 6 image and an asymmetric kernel, three
comparisons separate the cases: `correlate2d` (no flip), `convolve2d` (flip) and `convolve2d`
given a kernel that has already been flipped, which undoes its flip.

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

For a network the distinction does not matter, since the kernel is learned and a flipped kernel
is just another set of weights. It matters when you compare against a signal-processing library,
or when you check a hand-built filter against a textbook.

### Step 4: translation equivariance

[Section 2](#s2) proves that shifting the input shifts the output, and that the proof fails at
the border. Test both halves. Roll a random 32 × 32 image by $(2, 3)$ with `torch.roll`, which
wraps around, so nothing leaves the image. With circular padding the border is the wrap-around,
which is also what `torch.roll` does, and the identity should hold exactly. With zero padding it
cannot: the zero frame is not part of the image and does not move with it.

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

### Step 5: output sizes

The seven configurations of the worked example in [Section 3](#s3), $H = 11$ and $k = 3$, with
the sizes the formula predicts: 9, 11, 6, 5, 11, 7, 3. The last has stride 3, so the windows start
at columns 0, 3 and 6 and columns 9 and 10 are never read. PyTorch's own answer is compared in
step 7. Here the formula is used, together with the naive function on the 5 × 5 example at
padding 1 and stride 2.

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

Padding 1 and stride 2 on a 5 × 5 input give a 3 × 3 output.

### Step 6: im2col, the layer as one matrix multiply

[Section 4](#s4) wrote the layer as a matrix multiply. The trick is to lay out, for every output
position, the $C_{\text{in}} k^2$ input values that its window reads as one column, giving an
array of shape $(C_{\text{in}} k^2,\; H_{\text{out}} W_{\text{out}})$ per image. The weight reshaped
to $(C_{\text{out}},\; C_{\text{in}} k^2)$ then multiplies it, and the product is the output,
reshaped. The columns are built without a loop over positions: for each of the $k^2$ kernel
offsets $(u, v)$ one strided slice of the padded input holds, for all output positions at once,
the value that offset reads.

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

The only loop left is over the $k^2 = 9$ kernel offsets, a constant independent of the image size;
the work over positions, channels and batch happens inside NumPy's vectorised slice copy and
matrix multiply.

### Step 7: both against PyTorch, in float64

Float64 makes the comparison a test of the logic, not of rounding: if the indexing is wrong the
error is of order one, and if it is right it is of order $10^{-15}$. The table prints each
configuration with PyTorch's output width, the formula's width and both errors.

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

Every row agrees at round-off, and the formula predicts every width. The stride-3 row confirms the
silent loss of input: an output of width 3 comes from windows that read columns 0 to 8 only.

### Step 8: what the loop costs

The layer of [Section 4](#s4), input $(1, 64, 56, 56)$ to 128 channels with 3 × 3 kernels and
padding 1, performs $9 \cdot 64 \cdot 128 \cdot 56 \cdot 56 = 231{,}211{,}008$ multiply-accumulates.
Running the loop on it would take about a minute, so time a small layer instead, $(1, 8, 16, 16)$ to 16
channels (294,912 MACs), derive the cost per MAC and extrapolate. Then time the im2col version and
PyTorch on the big layer itself, and print the size of the column array.

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

The ratio of $k^2 = 9$ is the price of im2col: every input value is copied into up to nine
columns. Fast libraries avoid materialising this array, which is one reason `F.conv2d` is faster
again, and why implicit-GEMM kernels exist. Timings depend on the machine and on what else is
running, which is why the code prints only checks on them; the orders of magnitude are the result.

### What you should see

- Both implementations agree with PyTorch to round-off, about $10^{-15}$ in float64, in all seven
  configurations. The formula predicts every output width, including 3 for stride 3.
- `F.conv2d` is a cross-correlation. It matches `correlate2d` to round-off, differs from
  `convolve2d` by a large amount, and matches `convolve2d` again after the kernel is flipped.
- Equivariance is exact with circular padding. With zero padding the error is zero in the
  interior and nonzero only within a few pixels of the border (240 of the 448 positions in the
  4-pixel frame, none of the 576 inside it), where the zero frame is seen at a different position
  in the shifted image.
- The naive loop costs a fraction of a microsecond per multiply-accumulate, so the 64 to 128
  channel layer would take around a minute on a laptop CPU (the checks print `True` for any
  estimate between 20 seconds and 3 minutes). Writing the layer as one matrix multiply brings it
  to milliseconds, at the price of an intermediate array nine times the size of the input.
  PyTorch's kernel is usually faster again. Print the three times yourself, as the comment in
  the code says; the ratios, not the absolute times, are the lesson.

### Try this

1. Add a `groups` argument to `conv2d_im2col` and check a depthwise convolution (`groups = C_in`)
   against `F.conv2d`. Each group is an independent im2col and matrix multiply on its own slice of
   channels.
2. Write the backward pass of `conv2d_im2col`: $\partial\mathcal{L}/\partial W = dY\, \text{cols}^{\top}$,
   and $\partial\mathcal{L}/\partial X$ by multiplying $W^{\top} dY$ and scattering the result back
   through the inverse of im2col (col2im, which adds where windows overlap). Check both with finite
   differences, as in [Module 02](module_02_EN.html).
3. Check the adjoint property from [Section 2](#s2) numerically: for random $x$ and $y$ and the
   same kernel, $\langle \text{conv2d}(x), y\rangle = \langle x, \text{conv\_transpose2d}(y)\rangle$,
   using `F.conv2d` and `F.conv_transpose2d`.

## Lab 2 — A CNN against an MLP: what the inductive bias buys {#lab2}

**Goal.** You measure what convolution's assumptions are worth on scikit-learn's 8 × 8 digits at
equal parameter count, in three ways: by breaking the assumptions (a fixed shuffle of the 64
pixels, which destroys locality), by testing a consequence you might expect (a one-pixel shift of
the test images), and by making the assumptions matter (digits placed at random positions on a
larger canvas). The result is less flattering to the CNN than the folklore on centred digits and
far more flattering when position varies, and it shows which of the two properties from
[Section 1](#s1), locality or weight sharing, does the work in each case. The data ships with
scikit-learn, so there is no download. The lab takes about 30 seconds on a desktop CPU, so one to two minutes on a laptop.

### Step 1: data

`load_digits` has 1,797 images of 8 × 8 pixels with integer values 0 to 16. They are scaled to
$[0, 1]$ and split with `train_test_split(test_size=0.25, stratify=y, random_state=0)`, giving
1,347 training and 450 test images, the split that [Lab 3](#lab3) also uses. The images are then
standardised with the training mean and standard deviation (two scalars; per-pixel statistics
would divide by zero at the always-blank corner pixels) and reshaped to $(N, 1, 8, 8)$. The raw
$[0, 1]$ arrays are kept as well, because the shift test in step 5 must pad with background
before standardising.

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

### Step 2: two networks of the same size

The CNN has two convolution stages and a linear head on the flattened 64 features:
$\text{Conv}(1, 8, 3) \to \text{ReLU} \to \text{MaxPool}(2) \to \text{Conv}(8, 16, 3) \to
\text{ReLU} \to \text{MaxPool}(2) \to \text{flatten} \to \text{Linear}(64, 10)$. Its parameters
are $8 \cdot 9 + 8 = 80$, $16 \cdot 8 \cdot 9 + 16 = 1{,}168$ and $64 \cdot 10 + 10 = 650$, in
total 1,898. The MLP has one hidden layer of 25 units: $64 \cdot 25 + 25 + 25 \cdot 10 + 10 =
1{,}885$ parameters. The sizes differ by 13, so the comparison is fair to within a fraction of a
per cent. Tiny networks are the right choice here: the question is what the architecture
contributes, not what capacity does.

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

### Step 3: train both, five seeds each

A seed changes the initial weights and the order of the mini-batches, and a single run of a
network this small has a visible spread, so every comparison below uses several seeds and reports
the mean and standard deviation. Training is Adam with learning rate $3 \times 10^{-3}$, batch size
64, 60 epochs and cross-entropy on the logits. The same function trains every network in the lab.
The trained models are kept for the shift test.

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

On centred digits the CNN is ahead by a modest margin, about 98.4% against 97.2%, which is roughly 1.6% of test images misclassified against 2.8%. The images are 8 × 8: after two pools the
map is 2 × 2, and a digit has little room for the "same feature at a different place" structure
that convolution exploits. The CNN's advantage here comes mostly from locality (each unit sees a
neighbourhood) and from sharing its few weights across positions.

### Step 4: break the locality assumption

Apply one fixed random permutation of the 64 pixel positions to every training and test image and
retrain both networks. For a human the permuted digits are unreadable. For an MLP they are
exactly as easy as before: its first layer is a full $64 \times 25$ matrix, and permuting the
inputs only permutes the columns of that matrix, so the function class is unchanged and the
optimisation problem is equivalent. The CNN's assumption that neighbouring pixels belong together
is now false, and its 3 × 3 kernels see unrelated pixels.

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

The permutation costs the CNN its lead: it drops from about 98.4% to 96.0%, below the MLP, while the MLP is unchanged within noise (97.6% against 97.2%). The CNN still
classifies far above chance (10%), because 8 × 8 digits are small enough that the final dense
layer can recombine whatever the convolutions extract. What it has lost is the advantage: the
structure that made it a CNN was the thing doing the work.

### Step 5: shift the test images

Convolution is translation equivariant, so one might hope that a CNN is robust to a shift. The
step-3 models are tested on test images moved one pixel to the right, with the vacated column
filled with background (zero in raw pixels, standardised afterwards). Nothing is retrained. To a
person, a one-pixel shift of a centred digit changes very little.

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

Both fall sharply, the CNN to about 66% and the MLP to about 44%, and the spread between CNN seeds is large. The CNN falls less, but equivariant layers do not make an invariant
classifier: after flattening, the linear head has a separate weight for every channel at every
position of the final 2 × 2 map, so it learns where things are. Invariance needs a step that
discards position, such as global average pooling, and training data in which position varies.
Step 6 supplies both.

### Step 6: digits at random positions

Each 8 × 8 digit is pasted at a random offset, 0 to 8 in each direction, on a 16 × 16 canvas (81
positions). The training set uses a random generator with seed 1 and the test set seed 2, so the
two sets have different placements. Three networks of about equal size are compared:

- `CNN-GAP`: $\text{Conv}(1, 8) \to \text{ReLU} \to \text{pool} \to \text{Conv}(8, 16) \to
  \text{ReLU} \to \text{pool} \to \text{Conv}(16, 32) \to \text{ReLU} \to$ global average pool
  $\to \text{Linear}(32, 10)$, with $80 + 1{,}168 + 4{,}640 + 330 = 6{,}218$ parameters;
- `CNN-flatten`: the same three convolutions, but the $32 \times 4 \times 4$ map is flattened into
  $\text{Linear}(512, 10)$: 11,018 parameters;
- `MLP`: $256 \to 23 \to 10$ with 6,151 parameters.

The first and third have almost the same size; the second shows what a position-specific head
adds. Training uses 40 epochs and seeds 0 to 2.

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

With the position varying, the picture reverses. The global-average-pooling CNN keeps most of its
accuracy (about 93%, against 89% for the flatten head and 44% for the MLP) at about the MLP's parameter count, because the same 3 × 3 filters detect strokes
wherever they occur and the head sees only how much of each feature is present. The MLP must
learn each digit at each of 81 positions from 1,347 examples, about 17 per position
across all ten classes, and reaches 44%. The flatten head sits in between: its convolutional features are
shared across positions, but its head is not.

### Step 7: what the first layer learned

The eight 3 × 3 filters of the first layer of one step-3 CNN, shown as enlarged greyscale tiles.
[Section 14](#s14) discusses what such filters look like; in an 8 × 8 network trained for a
minute they are noisy oriented-edge and blob detectors, not the clean filters of a network
trained on photographs.

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

### What you should see

- At equal size the CNN makes fewer errors on centred digits, but the gain is modest, because
  8 × 8 images are tiny.
- A fixed permutation of the pixels does not hurt the MLP, which has no notion of neighbouring
  pixels, but it removes the CNN's lead: its locality assumption is now false.
- Neither network is shift-invariant on these images. The CNN's dense head has position-specific
  weights, so equivariant layers do not give an invariant classifier by themselves.
- When position varies, the CNN with a global-average-pooling head keeps its accuracy at the same
  parameter budget, while the MLP, which has to learn every digit at each of 81 positions from
  1,347 examples, fails. That is the inductive bias paying for itself.

### Try this

1. **Data efficiency on centred digits.** Train both networks with 5, 10, 20 and 50 images per
   class (150 epochs, batch 32). They stay within about a point of each other: nothing about
   centred 8 × 8 digits needs translation equivariance. Compare with step 6 and state when the
   architecture matters.
2. **Augmentation, part 1.** On centred digits with 20 images per class and 300 epochs, train the
   step-2 CNN with and without random rotations within $\pm 10°$ (`scipy.ndimage.rotate`,
   `order=1`) and shifts of $\pm 1$ pixel (pad by 1, random 8 × 8 crop); never flips, since a
   flipped 2 or 5 is not a 2 or a 5. Use batch 32 and seeds 0 to 2, and evaluate on the
   test split of step 1. Plot training and validation loss for both. Without
   augmentation the training loss collapses towards zero while the validation loss rises; with it
   the training loss stays higher. Explain why validation accuracy can still be lower with
   augmentation here, and compare with [Section 10](#s10).
3. **Augmentation, part 2.** On the 16 × 16 canvas with CNN-GAP, train on 5 or 20 images per
   class, once with each digit at one fixed position and once with each digit re-placed at a
   fresh random position every epoch (300 epochs, batch 32, seeds 0 to 2, evaluated on the step-6
   test canvas; the exact accuracies move by a few points with the seed, the direction and rough
   size of the gain do not). Compare the gain with part 1 and state the rule:
   augmentation helps when it adds variation that the test data has and the model cannot
   generate for itself.
4. Replace the flatten head of step 2 with global average pooling and repeat the shift test of
   step 5. What does the pool remove, and what does it cost on a 2 × 2 map?

## Lab 3 — Inside a ResNet: counting, receptive fields and depth {#lab3}

**Goal.** You take the `SmallResNet` of [Section 8](#s8) and check, in code, what the module claims
about it: its parameter and multiply-accumulate counts (with forward hooks that measure every layer),
its theoretical receptive field (with the recurrence of [Section 3](#s3)) and its effective
receptive field (with a gradient). Then you reproduce the degradation problem on 8 × 8 digits: deep
plain networks train worse than shallow ones, in the training loss and not only on the test set,
and identity shortcuts remove the problem. A measurement of the gradient at initialisation shows
why. The data is synthetic tensors for the counting and the receptive fields, and scikit-learn's
digits with the split of [Lab 2](#lab2) for the depth experiment. There is no download. The lab
takes about two minutes on a desktop CPU, so three to four minutes on a laptop.

### Step 1: the network and its parameters

The two classes are those of [Section 8](#s8), unchanged. A `Block` is two 3 × 3 convolutions with
batch norm and a ReLU between them, added to a shortcut that is the identity when the shape is
unchanged and a strided 1 × 1 convolution with batch norm when it is not. `SmallResNet` is a 3 × 3
stem, four blocks that double the width and halve the resolution three times, global average
pooling and a linear head. The convolutions have no bias, since the batch norm that follows each
one has its own shift. The expected counts are those of the worked example in [Section 8](#s8):
928 for the stem, 18,560, 57,728, 230,144 and 919,040 for the four blocks, 2,570 for the head,
1,228,970 in all.

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

### Step 2: count the multiply-accumulates with hooks

A forward hook is a function that PyTorch calls after a module has run, with the module's input and
output. Registering one on every `Conv2d` and `Linear` records the output shape of each layer, from
which the MACs follow as in [Section 4](#s4): $k_h k_w (C_{\text{in}}/g)\, C_{\text{out}}\,
H_{\text{out}} W_{\text{out}}$ for a convolution with $g$ groups, and
$\text{in\_features} \times \text{out\_features}$ for a linear layer. Batch norm, ReLU, the additions
and the pooling are ignored, as in [Section 4](#s4): they are cheap in arithmetic, though not in
memory traffic. One zero image of shape $(1, 3, 32, 32)$ in evaluation mode is enough, because the
counts depend only on shapes.

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

Every row can be checked by hand. For `stages.0.c1` it is nine kernel offsets times 32 input
channels times 32 output channels times a 32 × 32 map. The strided convolutions of
stages 2 to 4 cost half as much as the unstrided ones in stage 1, because they produce a quarter
as many positions with twice as many output channels; the 1 × 1 projections are cheap. The totals
agree with the worked example of [Section 8](#s8). Counting in code is how errors in a hand count,
or in a number remembered from somewhere else, are caught.

### Step 3: the theoretical receptive field

The recurrence of [Section 3](#s3) tracks two numbers through the layers: the receptive field $r$
of one unit in the current layer, measured in input pixels, and the jump $\Delta$, the distance in
input pixels between neighbouring units (the variable `jump` in the code). A layer with kernel $k$,
stride $s$ and dilation $d$ updates them as $r \leftarrow r + (k-1)\,d\,\Delta$ and
$\Delta \leftarrow \Delta\,s$, in that order. Only the
main-path convolutions need listing: the strided 1 × 1 projection reads one position, which is
inside the window of the 3 × 3 convolution beside it and so adds nothing.

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

The last unit sees a $49 \times 49$ window of the input, which is larger than the 32 × 32 CIFAR
images the network is designed for. That is the theoretical field: the largest set of input pixels
that can influence the unit. Step 4 measures what does.

### Step 4: the empirical receptive field

The gradient of a unit's activation with respect to the input is nonzero exactly where the input
can influence it. To get a clean answer, make every path positive: set every convolution weight to
$1/\text{fan-in}$ so that activations stay positive, use an all-ones input (zeros would give a zero
gradient, since the derivative of ReLU at 0 is 0 in PyTorch), and switch to evaluation mode so that
batch norm acts as a fixed scaling. The input is $96 \times 96$, so the last stage is a $12 \times
12$ map, and the unit examined is its centre, $(6, 6)$, summed over channels. The backward pass
then returns, for every input pixel, how much it contributes to that unit.

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

The nonzero region is exactly the $49 \times 49$ window of step 3, so the recurrence is right, and it
sits at rows and columns 24 to 72, the position of the unit (6 × 8 = 48) plus and minus 24.

### Step 5: the effective receptive field

Nonzero is not the same as important. Normalise the absolute gradient so that it sums to 1 and ask
how much of that mass lies inside windows of increasing size around the centre. This is the
effective receptive field of Luo et al. (2016), the idea of [Section 3](#s3). The test is repeated
with the default random initialisation, which has random signs and so a less regular gradient. Then
the map is plotted with the theoretical window outlined and with the contours that enclose 50% and
90% of the mass.

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

The theoretical window is 49 pixels wide, but about 90% of the gradient lies in the middle 25
pixels, 98% in the middle 33, and the central 9 × 9 pixels alone hold over 40%. The random
initialisation gives nearly the same profile. The unit is far more sensitive to
the pixels near its centre than to those at the edge of its theoretical field. Gradients through
stacked convolutions add up like a sum of random walks, so the weight falls off roughly like a
Gaussian, whose width grows only as the square root of the depth. For a task that needs a unit to
see an object of a given size, the usable field is smaller than the one the recurrence reports.

### Step 6: the gradient at initialisation

The gradient at initialisation shows why depth hurts a plain network. The networks here are small
enough to run on 8 × 8 digits: a 3 × 3 stem to 16 channels, then $n$ blocks of two 16-channel 3 × 3
convolutions, then global average pooling and a linear layer. With $n = 1, 4, 9, 27$ blocks the network has $1 + 2n = 3, 9, 19$
and 55 convolution layers. Each is built four ways: with and without identity shortcuts, and with
and without batch norm. One forward and backward pass on 256 training images with PyTorch's default
initialisation gives the norm of the gradient that reaches the stem's weights.

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

The pattern is the one [Section 8](#s8) derives. Without normalisation the plain network's gradient
shrinks by a roughly constant factor per layer, which is a geometric decay: PyTorch's default
convolution initialisation draws weights with variance $1/(3\,\text{fan-in})$, a sixth of the
$2/\text{fan-in}$ of He initialisation ([Module 02, Section 6](module_02_EN.html#s6)), so each ReLU
layer scales the signal by about $1/\sqrt{6} \approx 0.41$, and by 55 layers it has underflowed to
zero in float32. Batch norm restores the scale of the forward signal at every layer, and its effect on the
backward pass is not benign: in a deep plain network the gradient now explodes instead. Identity
shortcuts keep it of order one in both cases, because every block adds an identity term to its
Jacobian.

### Step 7: the degradation experiment

Now train. Plain and residual networks, both with batch norm, of 7, 19 and 55 convolution layers
($n = 3, 9, 27$ blocks) are trained on the digits with SGD (momentum 0.9, weight decay $10^{-4}$) and a
one-cycle cosine schedule that rises to a peak learning rate of 0.05 and falls to nearly zero,
batch size 64, 12 epochs, seed 0. The training loss is recorded per epoch, as the mean over the
epoch's mini-batches. At the end each network is evaluated in evaluation mode on the whole
training set, to get a training loss that does not depend on the batch statistics of training, and
on the test set. If the deeper plain network is worse on the training set, the failure is one of
optimisation, not of generalisation: the network is not overfitting, it cannot fit.

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

Then the curves, with the loss on a logarithmic axis so that the three scales that matter (about
0.05, 0.5 and 2) are all visible. The dashed line is chance, $\ln 10 = 2.30$, the loss of a network
that always predicts the uniform distribution.

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

The deeper plain networks have the higher training loss. At 7 layers the plain and residual networks
are alike, both near 0.04. At 19 layers the plain network is already well behind (about 0.4,
against 0.04 for the residual one), and at 55 layers it stays near chance, 2.08 against ln 10 =
2.30, after 12 epochs. Its test accuracy, about 20%, is that of a network that has barely learnt
anything. Deeper plain networks could, in principle, represent anything the shallower ones can
(set the extra layers to the identity); they do not, because optimisation does not find that
solution. A residual block makes the identity the default and learning a correction to it the task.

The 55-layer residual network is the one blemish. Its loss jumps up to 3.0 in the middle of the
run, when the learning rate is near its peak, and it ends at 0.28 with 90% test accuracy, worse
than its shallower siblings: it trains, where the plain network does not, but at this peak
learning rate it is not stable. Step 8 asks how much of that is the learning rate.

### Step 8: the stability of the deep residual network

Residual connections remove the vanishing gradient, but a 55-layer network has the most layers
that can each amplify an update, and a learning rate that suits 7 layers can be too large for
it. Train the 55-layer residual network at three peak learning rates and three seeds each, and
print the final training loss and test accuracy.

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

At the peak of 0.05 the three seeds end at training losses of 0.1 to 0.3; at 0.03 and 0.02 all
three are between 0.04 and 0.09 and the test accuracy is 96% to 98%, the level of the shallower
residual networks. Lowering the rate does not rescue the plain networks: in the second loop, at peaks
of 0.03 and 0.02 their 19-layer training loss is still about 0.9 and their 55-layer loss 1.7 to
1.9, with test accuracy of 0.27 to 0.68. The degradation is a property of the architecture, not of one learning rate. Shortcuts make
depth trainable; a modest peak rate, warm-up or zero-initialised branch scales (Try this, 2) make a
very deep network stable.

### What you should see

- Every hook count matches the formulas of [Section 4](#s4) and the worked example of
  [Section 8](#s8): 1,228,970 parameters and 63,801,856 MACs. A count printed by code is the
  authority when a hand count and a remembered number disagree.
- The recurrence's 49 is exactly the extent of the nonzero gradient. Most of the gradient sits in
  the middle, so the effective receptive field is much smaller than the theoretical one.
- Without normalisation the plain network's gradient vanishes geometrically with depth. With
  batch norm alone the deep plain network's gradient explodes instead. Identity shortcuts keep it
  of order one in both cases.
- The deeper plain network has a higher training loss, an optimisation failure rather than
  overfitting, and at 55 layers barely leaves chance (ln 10 = 2.30). The residual versions reach
  about 0.04 at 7 and 19 layers; at 55 layers they need a lower peak learning rate (0.03 or
  0.02) to come down to 0.04–0.08, while no learning rate tried rescues the plain networks.

### Try this

1. **Depthwise-separable blocks.** Replace `c1` and `c2` in `Block` by a depthwise 3 × 3 followed by a
   1 × 1 (call it `SepBlock`). The parameter count falls from 1,228,970 to 187,018, a factor of 6.6
   (the worked example in [Section 6](#s6); subtract 576 from each count if the stem takes 1
   input channel). Train both on the 16 × 16 translated digits of [Lab 2](#lab2) for 10 epochs and compare
   accuracy and time per epoch. Explain why the time does not fall 6.6-fold: the depthwise layer
   does little arithmetic per byte moved ([Section 6](#s6)).
2. **Zero-initialised residual branches.** Zero the last batch-norm scale of every residual branch
   (`nn.init.zeros_(block.b2.weight)`) and repeat the 55-layer residual run. Compare the first two
   epochs with the default: every block starts as the identity.
3. **Plain without batch norm.** Remove batch norm and use He initialisation
   (`nn.init.kaiming_normal_`) in the plain network. How deep can it go before training stalls?
4. **CIFAR-10 at full size.** The block below is not run by the lab: it needs `torchvision`'s
   CIFAR-10 loader (a download of about 170 MB) and is best run on a free Google Colab GPU. Train
   `SmallResNet` for 30 epochs with random crops, horizontal flips and a cosine schedule, with and
   without augmentation, and plot both validation curves. Nothing else in the module depends on
   its result.

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
