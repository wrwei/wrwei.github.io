## 实验 1 — 用 NumPy 手写反向传播 {#lab1}

**目标。**你只用矩阵乘积，在 NumPy 中实现一个两层 MLP 的前向和反向传播，然后拒绝轻信它。它的 193 个梯度分量逐一与有限差分估计比较；一个故意写错的反向传播让你看到检验失败是什么样子；PyTorch 的自动微分（autograd）则充当独立的裁判。接着网络用 256 个样本学习 $y = \sin 3x$，你会看到初始权重的尺度对学习有何影响，并且用十个随机种子来做，免得被某一次幸运的采样误导。代码取自[第 3 节](#s3)，示例取自[第 1 节](#s1)，这里把它们汇集到一处。本实验需要 NumPy、matplotlib 和 PyTorch，无需下载，CPU 用时不到半分钟。

### 步骤 1：网络、数据与第一个损失

模型是[第 3 节](#s3)在微型示例上运行的两层回归网络，这里是一个 $1 \to 64 \to 1$ 的网络，隐藏层用 ReLU，损失为均方误差。`init` 从 $\mathcal{N}(0, 2/1)$ 中抽取 $\mathbf{W}^{(1)}$，从 $\mathcal{N}(0, 1/64)$ 中抽取 $\mathbf{W}^{(2)}$（ReLU 层用 He 初始化，线性输出层的方差取 $1/n_{\text{in}}$），偏置为零。`forward` 返回输出，以及反向传播所需的缓存。`backward` 就是那四个方程：输出处的误差信号是 $2(\hat{\mathbf{y}} - \mathbf{t})/B$（因子 $1/B$ 来自对 batch 取平均），每个权重矩阵的梯度是该层输入的转置乘以误差信号，误差再经 $\mathbf{W}^{(2)}$ 向后传递，并由 $\mathbb{1}[z > 0]$ 门控。

若想得到与正文相同的数字，随机数生成器的使用顺序很重要：先是输入 `X`，然后是初始参数，最后是验证集。程序会打印各个形状，方便你对照[第 2 节](#s2)检查。

```python
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)


def init(d_in, d_h, d_out, rng=rng):
    return {"W1": rng.normal(0, np.sqrt(2 / d_in), (d_in, d_h)), "b1": np.zeros(d_h),
            "W2": rng.normal(0, np.sqrt(1 / d_h), (d_h, d_out)), "b2": np.zeros(d_out)}


def forward(p, X):
    Z1 = X @ p["W1"] + p["b1"]
    H1 = np.maximum(Z1, 0)                      # ReLU
    Y = H1 @ p["W2"] + p["b2"]
    return Y, (X, Z1, H1)


def backward(p, cache, Y, T):
    X, Z1, H1 = cache
    B = X.shape[0]
    dY = 2 * (Y - T) / B                        # error signal at the output (mean squared error)
    g = {"W2": H1.T @ dY, "b2": dY.sum(0)}
    dH1 = dY @ p["W2"].T                        # push the error back through W2
    dZ1 = dH1 * (Z1 > 0)                        # gate by the ReLU derivative
    g["W1"] = X.T @ dZ1
    g["b1"] = dZ1.sum(0)
    return g


def mse(p, X, T):
    return float(np.mean((forward(p, X)[0] - T) ** 2))


X = rng.uniform(-1, 1, (256, 1))
T = np.sin(3 * X)
p = init(1, 64, 1)
Xval = rng.uniform(-1, 1, (1000, 1))
Tval = np.sin(3 * Xval)

Y, (_, Z1, H1) = forward(p, X)
print("shapes X, Z1, H1, Y:", X.shape, Z1.shape, H1.shape, Y.shape)
print(f"initial training MSE: {mse(p, X, T):.4f}   mean of T^2: {np.mean(T ** 2):.3f}")
print("parameters:", sum(v.size for v in p.values()))
```

```output
shapes X, Z1, H1, Y: (256, 1) (256, 64) (256, 64) (256, 1)
initial training MSE: 0.3270   mean of T^2: 0.549
parameters: 193
```

$t^2$ 的均值是处处预测为零时的损失，即 0.549。初始损失 0.327 之所以更低，只是这次采样碰巧：初始化时输出是若干随机 ReLU 脊的随机组合，与目标无关，别的种子起点更高（步骤 7 会给出范围）。参数个数 $64 + 64 + 64 + 1 = 193$，就是接下来要检验的分量个数。

### 步骤 2：对全部 193 个分量做梯度检验

[第 14 节](#s14)给出了规则：任何手写的反向传播，在被信任之前都要与中心差分比较。对单个参数 $\theta_k$，估计为
$$\frac{\partial\mathcal{L}}{\partial\theta_k} \approx \frac{\mathcal{L}(\theta_k + \epsilon_{\text{fd}}) - \mathcal{L}(\theta_k - \epsilon_{\text{fd}})}{2\epsilon_{\text{fd}}},$$
其误差有两部分：泰勒级数截断带来的 $O(\epsilon_{\text{fd}}^2)$，以及舍入带来的 $O(u/\epsilon_{\text{fd}})$（$u$ 是单位舍入误差，float64 中约为 $10^{-16}$）。取 $\epsilon_{\text{fd}} = 10^{-5}$ 可使两者平衡（它在代码里叫 `eps`）。下面的函数依次扰动每个张量的每个分量，并对每个分量返回相对误差 $|a - n|/\max(10^{-8}, |a| + |n|)$，其中 $a$ 是解析值，$n$ 是数值值。这与模块 01 中向量形式的相对误差类似，但按分量计算，以便把错误定位到某一个张量。全部计算用 float64；若用 float32，舍入项会大 $10^{9}$ 倍。

```python
def grad_check(p, X, T, backward_fn=backward, eps=1e-5):
    """Return {name: array of per-entry relative errors}."""
    Y, cache = forward(p, X)
    g = backward_fn(p, cache, Y, T)
    errors = {}
    for name in p:
        numeric = np.zeros_like(p[name])
        for idx in np.ndindex(*p[name].shape):
            old = p[name][idx]
            p[name][idx] = old + eps
            loss_plus = mse(p, X, T)
            p[name][idx] = old - eps
            loss_minus = mse(p, X, T)
            p[name][idx] = old                  # restore before the next entry
            numeric[idx] = (loss_plus - loss_minus) / (2 * eps)
        a, n = g[name], numeric
        errors[name] = np.abs(a - n) / np.maximum(1e-8, np.abs(a) + np.abs(n))
    return errors


errors = grad_check(p, X, T)
for name, e in errors.items():
    print(f"{name}: {e.size:3d} entries, worst relative error {e.max():.1e}")
```

```output
W1:  64 entries, worst relative error 5.1e-09
b1:  64 entries, worst relative error 7.9e-04
W2:  64 entries, worst relative error 1.3e-08
b2:   1 entries, worst relative error 6.3e-12
```

三个张量吻合到约八位有效数字或更好，这已是此 $\epsilon_{\text{fd}}$ 下双精度所能达到的极限。有一个没有做到：$\mathbf{b}^{(1)}$ 的最坏误差大了约 $10^{5}$ 倍。在断定偏置梯度有误之前，先去看看这个分量。

### 步骤 3：那个看起来有问题的分量

ReLU 在零点有一个折点。若某个预激活 $z$ 与折点的距离在 $\epsilon_{\text{fd}}$ 以内，则两点 $b \pm \epsilon_{\text{fd}}$ 落在折点两侧，差商度量的是两段线性部分上的平均斜率，而不是 $b$ 处的导数。解析梯度是对的（它是 $z$ 所在那一段的导数），错的是数值梯度。下一段代码找出最坏的单元，打印它在整个 batch 上最小的 $|z|$，并用 $\epsilon_{\text{fd}} = 10^{-7}$ 重做检验，这个值小到足以分辨这个单元的折点。

```python
worst_unit = int(np.argmax(errors["b1"]))
smallest_z = float(np.abs(Z1[:, worst_unit]).min())
print(f"worst b1 unit: {worst_unit}, smallest |z| over the batch: {smallest_z:.1e}")

errors_small_eps = grad_check(p, X, T, eps=1e-7)
print(f"b1 worst relative error with eps = 1e-7: {errors_small_eps['b1'].max():.1e}")
# Conclusion: a kink inside +-eps, not a bug. A check is only as good as eps and the
# smoothness of the function it is applied to.
```

```output
worst b1 unit: 55, smallest |z| over the batch: 2.0e-07
b1 worst relative error with eps = 1e-7: 1.7e-07
```

由此得到两条实用规则。当 ReLU 网络中只有一个分量未通过检验而其余都通过时，先检查是否有某个预激活与零的距离在 $\epsilon_{\text{fd}}$ 以内，再去调试别的。而且当你确实拿不准时，就改变 $\epsilon_{\text{fd}}$：真正的错误在每个 $\epsilon_{\text{fd}}$ 下都一样，折点造成的假象则会移动。

### 步骤 4：真正的错误是什么样子

现在故意破坏反向传播：去掉 ReLU 的门，让误差流入 $\mathbf{Z}^{(1)}$ 时仿佛激活函数是恒等映射。这是个现实中会出现的错误（自定义层忘了写导数），检验应当发现它，并指出它在哪里。

```python
def backward_without_gate(p, cache, Y, T):
    X, Z1, H1 = cache
    B = X.shape[0]
    dY = 2 * (Y - T) / B
    g = {"W2": H1.T @ dY, "b2": dY.sum(0)}
    dZ1 = dY @ p["W2"].T                        # BUG: the factor (Z1 > 0) is missing
    g["W1"] = X.T @ dZ1
    g["b1"] = dZ1.sum(0)
    return g


broken = grad_check(p, X, T, backward_fn=backward_without_gate)
for name, e in broken.items():
    print(f"{name}: worst relative error {e.max():.1e}")
```

```output
W1: worst relative error 3.8e-01
b1: worst relative error 1.0e+00
W2: worst relative error 1.3e-08
b2: worst relative error 6.3e-12
```

检验做到的不只是说“有地方错了”。$\mathbf{W}^{(2)}$ 和 $\mathbf{b}^{(2)}$ 不受影响，因为它们位于缺失的门之上，其梯度不经过这道门；$\mathbf{W}^{(1)}$ 和 $\mathbf{b}^{(1)}$ 则相差一个量级为 1 的量。出错的张量是位于有问题的运算之下的那些。在深层网络中，这相当于一次二分查找：最靠上的出错层就是该查看的地方。函数 `backward` 本身从未被修改，所以无需恢复。

### 步骤 5：以 PyTorch 为裁判

独立的实现是最强的检验。PyTorch 中同样的网络是 `nn.Sequential(nn.Linear(1, 64), nn.ReLU(), nn.Linear(64, 1))`。PyTorch 把线性层的权重存为 `(d_out, d_in)`，是本实验 `(d_in, d_out)` 的转置，所以权重要转置后再复制。使用双精度，使一致程度受限于算术本身而非数值格式。然后在一个小函数上运行 `torch.autograd.gradcheck`：它就是同样的有限差分检验，只是打包好了，你对自定义的 `autograd.Function` 就该用它。

```python
import torch
import torch.nn as nn

net = nn.Sequential(nn.Linear(1, 64), nn.ReLU(), nn.Linear(64, 1)).double()
print("weight shapes:", tuple(net[0].weight.shape), tuple(net[2].weight.shape))
with torch.no_grad():
    net[0].weight.copy_(torch.from_numpy(p["W1"].T))
    net[0].bias.copy_(torch.from_numpy(p["b1"]))
    net[2].weight.copy_(torch.from_numpy(p["W2"].T))
    net[2].bias.copy_(torch.from_numpy(p["b2"]))

loss_torch = ((net(torch.from_numpy(X)) - torch.from_numpy(T)) ** 2).mean()
loss_torch.backward()

Y, cache = forward(p, X)
g = backward(p, cache, Y, T)
print(f"NumPy loss {mse(p, X, T):.14f}   PyTorch loss {loss_torch.item():.14f}")
gap = max(
    np.abs(net[0].weight.grad.numpy().T - g["W1"]).max(),
    np.abs(net[0].bias.grad.numpy() - g["b1"]).max(),
    np.abs(net[2].weight.grad.numpy().T - g["W2"]).max(),
    np.abs(net[2].bias.grad.numpy() - g["b2"]).max(),
)
print(f"largest gradient difference: {gap:.1e}")

A = torch.randn(4, 3, dtype=torch.double, requires_grad=True)
B_ = torch.randn(3, 2, dtype=torch.double, requires_grad=True)
print("gradcheck:", torch.autograd.gradcheck(lambda a, b: torch.relu(a @ b).sum(), (A, B_)))
```

```output
weight shapes: (64, 1) (1, 64)
NumPy loss 0.32700646052813   PyTorch loss 0.32700646052813
largest gradient difference: 2.2e-16
gradcheck: True
```

两种实现在损失和全部四个梯度上都吻合到舍入误差。PyTorch 的自动微分并没有使用不同的算法：它应用的是[第 3 节](#s3)的四个方程，把计算记录成一张图（[第 4 节](#s4)），可见的区别只有权重的布局。

### 步骤 6：训练，以及拟合在哪里是好的

梯度经过验证后，训练就是朴素的梯度下降（[模块 01，第 3 节](module_01_ZH.html#s3)）：以 $\eta = 0.05$ 做 3,000 步全 batch 更新，所以每一步都用 256 个点上平均损失的精确梯度。训练之后，有三个数字值得关注：训练误差和验证误差（都在 $[-1, 1]$ 内）；在训练集上从未被激活的隐藏单元数，那是被浪费的容量；以及数据之外的区间 $[1, 2]$ 上的误差。一幅图能直接显示最后一点。

```python
def train(p, X, T, steps, eta):
    """Full-batch gradient descent in place; returns the loss before each step and after the last."""
    curve = []
    for _ in range(steps):
        Y, cache = forward(p, X)
        curve.append(float(np.mean((Y - T) ** 2)))
        g = backward(p, cache, Y, T)
        for k in p:
            p[k] -= eta * g[k]
    curve.append(mse(p, X, T))
    return curve


curve = train(p, X, T, steps=3000, eta=0.05)
print("training MSE every 500 steps:", " ".join(f"{curve[i]:.3g}" for i in range(0, 3000, 500)))
print(f"final training MSE {curve[-1]:.2e}   validation MSE {mse(p, Xval, Tval):.2e}")

never_active = int(np.sum(~(forward(p, X)[1][1] > 0).any(axis=0)))
print("hidden units never active on the training set:", never_active)

x_out = np.linspace(1, 2, 200)[:, None]
print(f"MSE outside the training range, on [1, 2]: {mse(p, x_out, np.sin(3 * x_out)):.3f}")

grid = np.linspace(-2, 2, 400)[:, None]
plt.figure(figsize=(7, 4))
plt.axvspan(-1, 1, color="0.92", label="training range")
plt.plot(grid, np.sin(3 * grid), "k--", label=r"target $\sin 3x$")
plt.plot(grid, forward(p, grid)[0], label="network after 3,000 steps")
plt.scatter(X[::8], T[::8], s=8, color="C1", label="training points (every 8th)")
plt.xlabel("x")
plt.ylabel("y")
plt.title("The fit is good inside the data and linear outside it")
plt.legend(loc="lower right", fontsize=8)
plt.tight_layout()
plt.show()
```

```output
training MSE every 500 steps: 0.327 0.0204 0.00488 0.00164 0.000774 0.000439
final training MSE 2.81e-04   validation MSE 3.67e-04
hidden units never active on the training set: 1
MSE outside the training range, on [1, 2]: 0.403
```

训练误差下降了大约三个数量级。在训练范围内，网络与正弦曲线几乎无法区分。在范围之外，ReLU 网络的最后一段线性部分沿直线继续延伸，$[1, 2]$ 上的误差是 1 的量级：ReLU 网络是分段线性的，所以无论内插得多好，外推都是线性的。训练损失无法察觉这一点，因为没有任何训练点落在范围之外。

### 步骤 7：初始尺度的影响，十个种子

[第 6 节](#s6)论证过，权重的初始尺度决定了信号和梯度的尺度。一个直接的检验是把 He 初始化换成 $\mathcal{N}(0, 1)$ 和 $\mathcal{N}(0, 10^{-4})$（标准差 0.01）。在浅层网络上，单个种子会产生误导，因为初始损失强烈依赖于这次采样，所以下面的实验对三种方案各用十个初始化种子，数据相同，同样训练 3,000 步。它打印第 0、100、1,000、3,000 步的损失中位数（以及第 0 步的范围），并在对数坐标轴上画出每种方案的中位数曲线。

```python
def init_scaled(scheme, seed):
    r = np.random.default_rng(100 + seed)
    if scheme == "He":
        s1, s2 = np.sqrt(2.0), np.sqrt(1 / 64)
    elif scheme == "N(0, 1)":
        s1 = s2 = 1.0
    else:                                        # "N(0, 1e-4)": standard deviation 0.01
        s1 = s2 = 0.01
    return {"W1": r.normal(0, s1, (1, 64)), "b1": np.zeros(64),
            "W2": r.normal(0, s2, (64, 1)), "b2": np.zeros(1)}


schemes = ["He", "N(0, 1)", "N(0, 1e-4)"]
curves = {}
for scheme in schemes:
    curves[scheme] = np.array([train(init_scaled(scheme, s), X, T, 3000, 0.05)
                               for s in range(10)])

for scheme in schemes:
    c = curves[scheme]
    print(f"{scheme:11s} step 0: median {np.median(c[:, 0]):.3g} "
          f"(range {c[:, 0].min():.3g} to {c[:, 0].max():.3g})")
    print(f"{'':11s} step 100: {np.median(c[:, 100]):.3g}   step 1000: "
          f"{np.median(c[:, 1000]):.3g}   final: {np.median(c[:, -1]):.2g}")
ratio = np.median(curves["N(0, 1e-4)"][:, -1]) / np.median(curves["He"][:, -1])
print(f"final loss, N(0, 1e-4) over He: {ratio:.0f} times")

plt.figure(figsize=(7, 4))
for scheme in schemes:
    plt.semilogy(np.median(curves[scheme], axis=0), label=scheme)
plt.xlabel("gradient-descent step")
plt.ylabel("training MSE (median of 10 seeds)")
plt.title("Initial scale and training speed")
plt.legend()
plt.tight_layout()
plt.show()
```

```output
He          step 0: median 0.723 (range 0.185 to 2.02)
            step 100: 0.101   step 1000: 0.00501   final: 0.00035
N(0, 1)     step 0: median 7.87 (range 0.319 to 24.2)
            step 100: 0.0151   step 1000: 0.000582   final: 0.00023
N(0, 1e-4)  step 0: median 0.549 (range 0.549 to 0.55)
            step 100: 0.331   step 1000: 0.114   final: 0.009
final loss, N(0, 1e-4) over He: 26 times
```

这张表分三部分来读。

在 $\mathcal{N}(0, 1)$ 下，第一层权重比 He 的略小（标准差 1 对 $\sqrt 2$），但输出层权重比方差 $1/64$ 所要求的大八倍，所以初始输出很大：初始损失的中位数约为 8，范围从 0.3 到 24，种子之间相差约七十五倍。初始化时，这个零偏置网络是在折点处拼接起来的两条随机直线；采样越离谱，直线越离谱。网络很浅，所以梯度下降在一百步内就把它纠正过来，最终损失与 He 的相当。在深层网络中，同样的偏大会在每一层被放大，如[第 6 节](#s6)的表所示。

在 $\mathcal{N}(0, 10^{-4})$ 下，初始输出几乎恰好为零，所以每个种子的初始损失都是 $t^2$ 的均值。每一层的梯度正比于另一层的权重，而两者都很小，所以梯度很小，两层必须一起长大，拟合才能开始：第 1,000 步时损失中位数仍是 0.114，是 He 的二十多倍，3,000 步之后约为 He 的 26 倍。网络处在权重空间原点附近的平坦区域，并非学不会，只是要多花步数。网络更深时，许多微小权重的乘积会使这片区域平坦得多。

用 He 初始化时，初始损失适中，没有缓慢的起步，损失稳步下降。

### 你应该看到什么

- 梯度检验中表现正常的三个张量，与有限差分吻合到大约 $10^{-8}$ 或更好；第一层的偏置有一个离群值，其最小 $|z|$ 小于 $\epsilon_{\text{fd}}$，在 $\epsilon_{\text{fd}} = 10^{-7}$ 时这个离群值消失。检验的好坏取决于它的 $\epsilon_{\text{fd}}$ 和函数的光滑程度。
- 被破坏的反向传播只损坏 $\mathbf{W}^{(1)}$ 和 $\mathbf{b}^{(1)}$，即位于缺失的门之下的张量：检验能把错误定位到某一层。
- PyTorch 与 NumPy 代码吻合到舍入误差。自动微分计算的是第 3 节的四个方程；存储的权重布局 `(out, in)` 是唯一的区别。
- 训练误差下降三个数量级，拟合只在数据范围之内是好的：在范围之外，ReLU 网络线性外推。
- 初始尺度在两个方向上都有影响：太大会使初始损失既大又依赖种子（十个种子上为 0.3 到 24），太小则起步缓慢（同样训练 3,000 步后，最终损失是 He 的 26 倍）。这里两者都不严重，因为网络只有一个隐藏层，而在深层网络中它们会逐层累积。

### 动手试试

1. 在 `forward` 和 `backward` 中把 ReLU 换成 $\tanh$（$\phi'(z) = 1 - \tanh^2 z$，即 `1 - H1 ** 2`），重跑梯度检验和训练，把最终误差与 ReLU 的比较。步骤 3 的折点假象应当消失。
2. 用对权重矩阵列表的循环，把 `forward` 和 `backward` 推广到 $L$ 层，对其做梯度检验，并用五个各含 64 个单元的隐藏层重做步骤 7。这时 $\mathcal{N}(0, 1)$ 应当爆炸，$\mathcal{N}(0, 10^{-4})$ 应当停滞。
3. 工程变体：用这个网络拟合[模块 01，第 12 节](module_01_ZH.html#s12)的新胡克名义应力 $P = 2c_1(\lambda - \lambda^{-2})$（$c_1 = 10$ kPa，拉伸比 $\lambda$ 从 0.6 到 1.0，2% 的噪声），并把它在 $\lambda = 0.5$ 处的预测与单参数物理模型的预测比较。两者之中哪一个能外推，为什么？
4. 改用大小为 32 的 mini-batch，在相同的轮次（epoch）数下，把损失曲线与全 batch 训练的比较。

## 实验 2 — 约 100 行的标量自动微分引擎 {#lab2}

**目标。**你从零构建反向模式自动微分：一个 `Value` 类，在程序运行时记录[第 4 节](#s4)的计算图；以及一个 `backward` 方法，把图扫一遍，在每个节点上留下 $\partial f/\partial v$。你用手算、有限差分和 PyTorch 来检验它，然后完全不用张量，拿它在双月牙问题上训练一个有 337 个参数的 MLP。这个引擎一次只处理一个数，所以按设计就是慢的；最后一步测量它有多慢，以及为什么张量框架正是为解决这一点而存在。无需下载；整个实验在一分钟内跑完，大部分时间花在训练循环上。

### 步骤 1：记得自己是怎么生成的节点

反向模式需要，对每个中间结果 $v$，知道它由哪些值算出（它的**父节点**，parents），以及对每个父节点 $u$ 的局部偏导数 $\partial v/\partial u$。引擎在前向传播时、操作数在手边的时候就算出这些局部导数，并存进节点。于是反向扫描无需知道运算是什么：它只做乘法和加法。

这个类有四个字段。`data` 是值；`grad` 累积整个计算的输出 $f$ 对 $v$ 的偏导 $\partial f/\partial v$（即**伴随量**，adjoint）；`_parents` 和 `_local` 是刚才描述的两个元组。`__slots__` 使每个节点更小更快，这在单个训练步要创建数万个节点时很重要（步骤 5 会数一数）。每个运算符都构造一个新的 `Value`。减法是加上一个相反数，取负是乘以常数 $-1$，除法是乘以 $-1$ 次幂，所以只有五个基本运算需要各自的导数：$+$、$\times$、常数幂，以及下面这些函数。普通的 Python 数由 `_wrap` 包装成常数节点，`2 * x` 和 `1 + x` 能通过 `__rmul__` 和 `__radd__` 工作也靠它。

导数就是[第 4 节](#s4)中的那些：对 $v = u + w$，两个局部导数都是 1；对 $v = uw$，它们是 $w$ 和 $u$；对 $v = u^k$，是 $ku^{k-1}$；对 $\exp$、$\log$、$\sin$、$\tanh$ 和 ReLU，分别是 $e^u$、$1/u$、$\cos u$、$1 - \tanh^2 u$ 和 $\mathbb{1}[u > 0]$。

```python
import math
import random
import time

import numpy as np
import matplotlib.pyplot as plt


class Value:
    """A scalar that records how it was computed."""
    __slots__ = ("data", "grad", "_parents", "_local")

    def __init__(self, data, parents=(), local=()):
        self.data = float(data)
        self.grad = 0.0                  # d(output)/d(this node), filled by backward()
        self._parents = parents          # the nodes this one was computed from
        self._local = local              # d(this node)/d(parent), one number per parent

    def __add__(self, other):
        other = _wrap(other)
        return Value(self.data + other.data, (self, other), (1.0, 1.0))

    def __mul__(self, other):
        other = _wrap(other)
        return Value(self.data * other.data, (self, other), (other.data, self.data))

    def __pow__(self, k):                # constant exponent only
        assert isinstance(k, (int, float))
        return Value(self.data ** k, (self,), (k * self.data ** (k - 1),))

    def __neg__(self):
        return self * -1

    def __sub__(self, other):
        return self + (-_wrap(other))

    def __rsub__(self, other):
        return _wrap(other) + (-self)

    def __truediv__(self, other):
        return self * _wrap(other) ** -1

    def __rtruediv__(self, other):
        return _wrap(other) * self ** -1

    __radd__ = __add__
    __rmul__ = __mul__


def _wrap(x):
    return x if isinstance(x, Value) else Value(x)


def exp(x):
    e = math.exp(x.data)
    return Value(e, (x,), (e,))


def log(x):
    return Value(math.log(x.data), (x,), (1.0 / x.data,))


def sin(x):
    return Value(math.sin(x.data), (x,), (math.cos(x.data),))


def tanh(x):
    t = math.tanh(x.data)
    return Value(t, (x,), (1.0 - t * t,))


def relu(x):
    return Value(max(x.data, 0.0), (x,), (1.0 if x.data > 0 else 0.0,))


a = Value(3.0)
b = a * a + 2 * a
print(f"b = a*a + 2*a at a = 3: data {b.data:.1f}, parents {len(b._parents)}, "
      f"local derivatives {b._local}")
```

```output
b = a*a + 2*a at a = 3: data 15.0, parents 2, local derivatives (1.0, 1.0)
```

`b` 是一个加法节点，它的两个父节点是乘积 $a \cdot a$ 和乘积 $2 \cdot a$；此时还没有求过任何导数。图是计算的记录，而局部导数是这个引擎将要做的唯一的微积分。

### 步骤 2：反向扫描

反向模式就是对每条边按正确的顺序应用一次链式法则。先在输出上令 $\partial f/\partial f = 1$。然后访问各节点，使每个节点只在所有*使用*它的节点之后才被访问，并对当前节点 $v$ 的每个父节点 $u$ 加上
$$\frac{\partial f}{\partial u} \mathrel{+}= \frac{\partial f}{\partial v}\,\frac{\partial v}{\partial u}.$$
这个 `+=` 就是对扇出的全部处理：一个变量被用在三处，就会收到三份贡献，多元链式法则说它们相加。（在 `b = a*a + 2*a` 中，节点 `a` 被用了三次，它的梯度是 $a + a + 2 = 8$。）

“每个节点排在它的所有使用者之后”就是一个逆拓扑序，引擎用深度优先遍历来求它。下面的遍历是迭代式的，带一个显式栈。递归式的遍历会为当前路径上的每个节点占用一个 Python 栈帧，而步骤 5 的损失是对各样本的连续求和，更长的求和或更深的网络就会超过 Python 默认的 1,000 帧递归深度限制。每个节点被压栈两次：一次用于展开，一次在其父节点之后用于输出。把方法定义在类之后再挂上去，可以让步骤 1 的讲解与这一步分开。

```python
def backward(self):
    """Fill .grad on every node that self depends on. Returns the node count."""
    order, seen, stack = [], set(), [(self, False)]
    while stack:
        node, expanded = stack.pop()
        if expanded:
            order.append(node)           # all of its parents are already in `order`
            continue
        if id(node) in seen:
            continue
        seen.add(id(node))
        stack.append((node, True))
        for parent in node._parents:
            if id(parent) not in seen:
                stack.append((parent, False))
    self.grad = 1.0
    for node in reversed(order):         # users before the nodes they use
        for parent, local in zip(node._parents, node._local):
            parent.grad += node.grad * local
    return len(order)


Value.backward = backward

a = Value(3.0)
b = a * a + 2 * a
n_nodes = b.backward()
print(f"b = {b.data:.1f}, db/da = {a.grad:.1f} (analytic 2a + 2 = 8), nodes: {n_nodes}")
```

```output
b = 15.0, db/da = 8.0 (analytic 2a + 2 = 8), nodes: 5
```

引擎本体（`Value` 类、五个函数和 `backward`）约 90 行。实验中其余的一切都是在使用它。

### 步骤 3：在答案已知的函数上验证

[第 4 节](#s4)在 $(2, 5)$ 处手工求导 $f(x_1, x_2) = \ln x_1 + x_1 x_2 - \sin x_2$：$\partial f/\partial x_1 = 1/x_1 + x_2 = 5.5$，$\partial f/\partial x_2 = x_1 - \cos x_2 = 2 - \cos 5 \approx 1.7163$。下一段代码用引擎计算它，并对用普通浮点数写成的同一函数做中心差分，这样就有两个独立的参照。这张图有九个节点：两个输入、$\ln x_1$、$x_1 x_2$、它们的和、$\sin x_2$、减法产生的常数 $-1$、取负后的正弦，以及最后的和。

```python
x1, x2 = Value(2.0), Value(5.0)
f = log(x1) + x1 * x2 - sin(x2)
n_nodes = f.backward()
print(f"f = {f.data:.4f}   df/dx1 = {x1.grad:.4f}   df/dx2 = {x2.grad:.4f}   nodes: {n_nodes}")


def f_plain(u, v):
    return math.log(u) + u * v - math.sin(v)


eps = 1e-6
fd1 = (f_plain(2 + eps, 5) - f_plain(2 - eps, 5)) / (2 * eps)
fd2 = (f_plain(2, 5 + eps) - f_plain(2, 5 - eps)) / (2 * eps)
print(f"finite differences: {fd1:.4f} and {fd2:.4f}")
print(f"largest difference from the engine: {max(abs(fd1 - x1.grad), abs(fd2 - x2.grad)):.1e}")
```

```output
f = 11.6521   df/dx1 = 5.5000   df/dx2 = 1.7163   nodes: 9
finite differences: 5.5000 and 1.7163
largest difference from the engine: 4.5e-10
```

引擎给出答案的代价是一次前向求值加一次扫描，两个偏导数都有了；有限差分对两个输入需要另外四次函数求值，对 $n$ 个输入则需要 $2n$ 次。这种不对称正是反向模式被用于有百万参数的网络的原因。

### 步骤 4：神经元、层与 MLP

由 `Value` 构成的 MLP 只需几行。`Neuron` 为每个输入持有一个权重 `Value` 和一个偏置，计算 $\sum_j w_j x_j + b$，并可选地施加 ReLU。权重从 $\mathcal{N}(0, 2/n_{\text{in}})$ 中抽取，即[第 6 节](#s6)的 He 初始化，偏置从零开始。这里用 `random.gauss` 而不用 NumPy，使引擎除标准库外不依赖任何东西。`MLP(2, [16, 16, 1])` 是 $2 \to 16 \to 16 \to 1$ 的网络，两个隐藏层用 ReLU，输出是线性的（输出是一个 logit），所以参数个数是 $(2 \cdot 16 + 16) + (16 \cdot 16 + 16) + (16 + 1)$。

```python
class Neuron:
    def __init__(self, n_in, nonlinear):
        std = math.sqrt(2.0 / n_in)
        self.w = [Value(random.gauss(0.0, std)) for _ in range(n_in)]
        self.b = Value(0.0)
        self.nonlinear = nonlinear

    def __call__(self, x):
        z = sum((w * xi for w, xi in zip(self.w, x)), self.b)
        return relu(z) if self.nonlinear else z

    def parameters(self):
        return self.w + [self.b]


class Layer:
    def __init__(self, n_in, n_out, nonlinear):
        self.neurons = [Neuron(n_in, nonlinear) for _ in range(n_out)]

    def __call__(self, x):
        return [neuron(x) for neuron in self.neurons]

    def parameters(self):
        return [p for neuron in self.neurons for p in neuron.parameters()]


class MLP:
    def __init__(self, n_in, widths):
        sizes = [n_in] + widths
        self.layers = [Layer(sizes[i], sizes[i + 1], nonlinear=(i < len(widths) - 1))
                       for i in range(len(widths))]

    def __call__(self, x):
        for layer in self.layers:
            x = layer(x)
        return x

    def parameters(self):
        return [p for layer in self.layers for p in layer.parameters()]


random.seed(0)
model = MLP(2, [16, 16, 1])
params = model.parameters()
print("parameters:", len(params))
```

```output
parameters: 337
```

### 步骤 5：损失与训练

任务是 [make_moons](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_moons.html)：两个交错的半圆，标签为 0 和 1，100 个训练点。损失是由 logit $z$ 按[第 12 节](#s12)的稳定形式算出的平均二元交叉熵，
$$\ell(z, y) = \max(z, 0) - zy + \ln\!\big(1 + e^{-|z|}\big),$$
它从不对大的正数取指数。引擎没有 `abs`，但 $|z| = \max(z, 0) + \max(-z, 0)$ 可由两个 ReLU 构成，所以损失只用到已有的基本运算。（在这个规模上，朴素的 sigmoid 也行；稳定形式是应当养成的习惯，而且不花任何代价。）

训练是 $\eta = 1.0$ 的全 batch 梯度下降。有两个细节容易出错。梯度用 `+=` 累积，所以每次反向传播之前都必须把每个参数的梯度清零；并且参数是 `Value`，其 `data` 就地修改，而其他节点在每一步都重新构建。循环在更新之前计算损失，所以第 $k$ 步打印的是经过 $k$ 次更新后的参数的损失；在第 100 步只做求值和反向传播，这样梯度就留在最终参数处，供步骤 7 的 PyTorch 对比使用。图的大小（`nodes`，即一次损失求值的图中的节点数）也一并打印。

```python
from sklearn.datasets import make_moons

X_train, y_train = make_moons(n_samples=100, noise=0.1, random_state=0)
X_test, y_test = make_moons(n_samples=500, noise=0.1, random_state=1)


def bce_with_logits(z, y):
    """Stable binary cross-entropy of logit z (a Value) and label y in {0, 1}."""
    abs_z = relu(z) + relu(-z)
    return relu(z) - z * y + log(1.0 + exp(-abs_z))


def loss_and_accuracy(model, X, y):
    total, correct = Value(0.0), 0
    for xi, yi in zip(X, y):
        z = model([Value(xi[0]), Value(xi[1])])[0]   # inputs wrapped once per example
        total = total + bce_with_logits(z, float(yi))
        correct += int((z.data > 0) == (yi == 1))
    return total * (1.0 / len(X)), correct / len(X)


eta = 1.0
for step in range(101):
    for p in params:
        p.grad = 0.0                     # gradients accumulate, so zero them first
    loss, acc = loss_and_accuracy(model, X_train, y_train)
    n_nodes = loss.backward()
    if step % 20 == 0:
        print(f"step {step:3d}  loss {loss.data:.3f}  train accuracy {acc:.2f}  "
              f"nodes {n_nodes:,}")
    if step < 100:
        for p in params:
            p.data -= eta * p.grad
final_loss = loss.data
```

```output
step   0  loss 1.065  train accuracy 0.29  nodes 66,440
step  20  loss 0.198  train accuracy 0.92  nodes 66,440
step  40  loss 0.197  train accuracy 0.96  nodes 66,440
step  60  loss 0.131  train accuracy 0.97  nodes 66,440
step  80  loss 0.074  train accuracy 0.98  nodes 66,440
step 100  loss 0.035  train accuracy 0.99  nodes 66,440
```

初始损失高于 $\ln 2 = 0.693$，后者是处处输出概率 $1/2$ 的分类器的损失。原因在输出神经元：它的初始化与隐藏神经元一样，方差为 $2/16$，所以它的 logit 一开始的散布是 1 的量级，而一个自信的错误 logit 比犹豫的受到更重的惩罚。[第 14 节](#s14)的初始损失检查会标出这一点；补救办法是对输出层用更小的初始化。这里保持原样，因为网络在二十步之内就恢复了，如表所示。图中有 66,440 个节点，对应 100 个样本和 337 个参数：它就是[第 4 节](#s4)的**记录带**（tape），其大小就是反向模式在内存上付出的代价。

### 步骤 6：测试准确率与决策边界

测试准确率不需要梯度，所以不该构建图。下一段代码把训练好的权重取出为 NumPy 数组，运行一次朴素的浮点前向传播，已部署的模型也是这样工作的。决策边界是 logit 在 $100 \times 100$ 网格上的零等值线。

```python
def extract_arrays(model):
    """Weights as (n_in, n_out) arrays, biases as (n_out,) arrays, per layer."""
    arrays = []
    for layer in model.layers:
        W = np.array([[w.data for w in neuron.w] for neuron in layer.neurons]).T
        b = np.array([neuron.b.data for neuron in layer.neurons])
        arrays.append((W, b))
    return arrays


def float_logits(arrays, X):
    H = X
    for i, (W, b) in enumerate(arrays):
        H = H @ W + b
        if i < len(arrays) - 1:
            H = np.maximum(H, 0)
    return H[:, 0]


arrays = extract_arrays(model)
test_accuracy = np.mean((float_logits(arrays, X_test) > 0) == (y_test == 1))
print(f"test accuracy on 500 points: {test_accuracy:.3f}")

gx, gy = np.meshgrid(np.linspace(-1.6, 2.6, 100), np.linspace(-1.1, 1.6, 100))
grid_logits = float_logits(arrays, np.c_[gx.ravel(), gy.ravel()]).reshape(gx.shape)
plt.figure(figsize=(6, 4.5))
plt.contourf(gx, gy, grid_logits > 0, levels=[-0.5, 0.5, 1.5], colors=["#cfe3f5", "#f8d9c4"])
plt.scatter(*X_train[y_train == 0].T, s=14, color="C0", label="class 0 (training)")
plt.scatter(*X_train[y_train == 1].T, s=14, color="C1", label="class 1 (training)")
plt.xlabel("$x_1$")
plt.ylabel("$x_2$")
plt.title("Moons: decision regions of the scalar-engine MLP")
plt.legend(loc="upper right", fontsize=8)
plt.tight_layout()
plt.show()
```

```output
test accuracy on 500 points: 0.992
```

### 步骤 7：以 PyTorch 为裁判

把引擎的权重复制到 float64 张量中，在同样的训练点上用 `F.binary_cross_entropy_with_logits` 计算同一个损失。然后 `backward()` 给出 PyTorch 的梯度，逐个参数与引擎的比较。引擎为每个神经元存一个对象，PyTorch 为每一层存一个矩阵，所以引擎扁平的参数列表按相同的顺序与数组对应（神经元 0 的权重、它的偏置、神经元 1 的权重，……）。

```python
import torch
import torch.nn.functional as F

tensors = [(torch.tensor(W, dtype=torch.float64, requires_grad=True),
            torch.tensor(b, dtype=torch.float64, requires_grad=True)) for W, b in arrays]


def torch_logits(tensors, X):
    H = torch.tensor(X, dtype=torch.float64)
    for i, (W, b) in enumerate(tensors):
        H = H @ W + b
        if i < len(tensors) - 1:
            H = torch.relu(H)
    return H[:, 0]


loss_torch = F.binary_cross_entropy_with_logits(
    torch_logits(tensors, X_train), torch.tensor(y_train, dtype=torch.float64))
loss_torch.backward()

engine_grads = []        # in the engine's parameter order: per neuron, weights then bias
for layer, (W, b) in zip(model.layers, tensors):
    for j, neuron in enumerate(layer.neurons):
        engine_grads += [(w.grad, W.grad[i, j].item()) for i, w in enumerate(neuron.w)]
        engine_grads.append((neuron.b.grad, b.grad[j].item()))
gap = max(abs(a - t) for a, t in engine_grads)
print(f"loss: engine {final_loss:.10f}   PyTorch {loss_torch.item():.10f}")
print(f"largest gradient difference over {len(engine_grads)} parameters: {gap:.1e}")
```

```output
loss: engine 0.0347593932   PyTorch 0.0347593932
largest gradient difference over 337 parameters: 3.5e-17
```

两个框架给出相同的损失和相同的 337 个梯度，只差舍入误差。这个引擎是玩具，但它与自动微分并不是不同类的东西：PyTorch 记录一张张量运算的图，每个运算带一个函数，把传入的伴随量映射为各输入的伴随量（即向量-雅可比积），然后反向扫描这张图。

### 步骤 8：张量版本带来了什么

对 100 个训练点，给引擎的一次前向加反向传播计时，并与 PyTorch 中同样的计算比较，后者先做一次预热调用，再对 200 次重复取平均。两者做的算术完全相同。差别全在开销：引擎创建 66,440 个 Python 对象，并对每条边运行一次 Python 循环，而 PyTorch 只发出大约十个张量运算，在编译后的代码中运行。

```python
def engine_step():
    for p in params:
        p.grad = 0.0
    loss, _ = loss_and_accuracy(model, X_train, y_train)
    loss.backward()


def torch_step():
    for W, b in tensors:
        W.grad = None
        b.grad = None
    F.binary_cross_entropy_with_logits(
        torch_logits(tensors, X_train),
        torch.tensor(y_train, dtype=torch.float64)).backward()


start = time.perf_counter()
engine_step()
engine_seconds = time.perf_counter() - start

torch_step()                              # warm-up
start = time.perf_counter()
for _ in range(200):
    torch_step()
torch_seconds = (time.perf_counter() - start) / 200
ratio = engine_seconds / torch_seconds
print(f"engine over 0.05 s per step: {engine_seconds > 0.05}   "
      f"PyTorch under 1 ms: {torch_seconds < 1e-3}")   # exact times vary by machine
print(f"ratio, to the nearest power of ten: {10 ** round(math.log10(ratio)):,}")
```

```output
engine over 0.05 s per step: True   PyTorch under 1 ms: True
ratio, to the nearest power of ten: 1,000
```

确切的时间随每次运行、每台机器而变（在笔记本电脑上，引擎每步要零点几秒），所以这段代码打印两个阈值和取到最接近的 10 的幂的比值。PyTorch 的每运算开销意味着，张量越大，它的优势越大：在更大的矩阵乘积上，编译后的代码每次调用要做数千次乘法，而引擎的循环只能一个一个地做。

### 你应该看到什么

- 一旦每个基本运算都知道自己的局部导数，反向模式只需几十行。反向扫描中的 `+=` 负责处理被使用不止一次的变量。
- 引擎复现了第 4 节示例中手算的梯度，与有限差分吻合，并给出与 PyTorch 相同的 337 个梯度，只差舍入误差。
- 内存和时间随图中节点数增长：100 个样本通过 337 个参数，共 66,440 个节点。记录带就是反向模式的代价。
- 初始损失高于 $\ln 2$，是因为输出神经元取了 He 尺度；第 14 节的初始损失检查能发现它，对输出层用更小的初始化即可修正。
- 取 $\eta = 1.0$ 时，MLP 在 100 步内拟合了双月牙。即使对玩具问题，学习率也很重要（第 9 节）。

### 动手试试

1. 加入 softplus 基本运算 $\ln(1 + e^x)$，并为隐藏层加一个 `tanh` 选项，把训练曲线与 ReLU 的比较。
2. 加入前向模式：给 `Value` 一个由每个运算传播的 `tangent` 字段，并在一次前向传播中计算第 4 节示例的 $\partial f/\partial x_1$。数一数，对两个输入求梯度需要几次传播。
3. 在 `x ** y` 中支持 `Value` 指数，并用有限差分检验对两个参数的梯度。哪个参数的导数有定义域限制？
4. 写一个微型张量版本，其中 `data` 是 NumPy 数组，每个运算存储一个 VJP 函数而不是标量局部导数，并与标量引擎比较用时。
5. 先用 $\eta = 0.5$ 训练 50 步，再用 $\eta = 0.1$，把第 100 步的准确率与上面那次运行的比较。

## 实验 3 — 优化器、学习率调度与范围测试 {#lab3}

**目标。**你用范围测试来找学习率，而不是靠猜；然后在同一个网络、同样的数据和同样的初始化上运行 SGD、动量法、Nesterov 动量、Adam 和 AdamW，看清差异是什么、不是什么。第二个实验测量学习率调度对带噪回归的噪声下限有什么作用，最后一个实验验证 Adam 第一步的符号下降行为。本实验使用 scikit-learn 自带的 digits 数据和一个合成回归问题，所以无需下载，CPU 用时不到半分钟。它的网络是一个 $64 \to 128 \to 128 \to 10$ 的 ReLU MLP，有 26,122 个参数，即[第 2 节](#s2)的 digits 网络，也是[实验 4](#lab4) 完整训练的那个。

### 步骤 1：数据

`load_digits` 含有 1,797 张 8×8 像素的图像，共 10 个类别。按 60/20/20 划分，并分层抽样，使每个类别保持其占比，得到 1,078 张训练图像、359 张验证图像和 360 张测试图像。标准化只用**训练**集的统计量，这是[模块 01，第 10 节](module_01_ZH.html#s10)的要求：在验证或测试图像上算出的统计量会把它们泄漏进训练。训练集中有少数像素是常数（始终为零）；它们的标准差被替换为 1，使除法有定义，标准化后的该列仍为零。本实验不动测试集。

```python
import time

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

digits = load_digits()
X_all, y_all = digits.data.astype(np.float32), digits.target
X_tr, X_rest, y_tr, y_rest = train_test_split(
    X_all, y_all, test_size=0.4, stratify=y_all, random_state=0)
X_va, X_te, y_va, y_te = train_test_split(
    X_rest, y_rest, test_size=0.5, stratify=y_rest, random_state=0)

mean = X_tr.mean(axis=0)
std = X_tr.std(axis=0)
std[std == 0] = 1.0                       # constant pixels: leave them at zero
as_tensor = lambda a: torch.tensor((a - mean) / std)

Xtr, Xva = as_tensor(X_tr), as_tensor(X_va)
ytr, yva = torch.tensor(y_tr), torch.tensor(y_va)
print("split sizes:", len(X_tr), len(X_va), len(X_te))
print("constant pixels in the training set:", int((X_tr.std(axis=0) == 0).sum()))
```

```output
split sizes: 1078 359 360
constant pixels in the training set: 4
```

### 步骤 2：模型与评估函数

`make(seed)` 在 `torch.manual_seed(seed)` 之下构建网络，所以相同的种子给出相同的初始权重（PyTorch 的默认初始化；对 `nn.Linear` 是方差为 $1/(3 n_{\text{in}})$ 的均匀分布，它与 He 初始化的比较见[第 6 节](#s6)）。`evaluate` 返回损失和准确率。它调用 `model.eval()` 并在 `torch.no_grad()` 下运行，这是[第 13 节](#s13)的两个习惯：模型还没有 dropout 或批归一化，所以这里 `eval()` 什么也没改变，但这个习惯不花任何代价，而在它起作用的那一天，作用会非常大。

```python
def make(seed):
    torch.manual_seed(seed)
    return nn.Sequential(nn.Linear(64, 128), nn.ReLU(),
                         nn.Linear(128, 128), nn.ReLU(),
                         nn.Linear(128, 10))


def evaluate(model, X, y):
    model.eval()
    with torch.no_grad():
        logits = model(X)
        return F.cross_entropy(logits, y).item(), (logits.argmax(1) == y).float().mean().item()


model = make(0)
print("parameters:", sum(p.numel() for p in model.parameters()))
loss0, acc0 = evaluate(model, Xtr, ytr)
print(f"untrained: training loss {loss0:.3f} (ln 10 = {np.log(10):.3f}), accuracy {acc0:.3f}")
```

```output
parameters: 26122
untrained: training loss 2.309 (ln 10 = 2.303), accuracy 0.106
```

未训练的 10 类分类器，其损失应当接近 $\ln 10$，即均匀预测的损失（[第 14 节](#s14)，初始损失检查）。运行结果正是如此，精度在随机初始化所允许的范围内。

### 步骤 3：写出范围测试

[第 9 节](#s9)的**学习率范围测试**（learning-rate range test）在学习率按几何级数增长的同时做一次短训练，并记录损失。学习率很小时什么也不会发生；学习率合适时损失下降得很快；超过最大稳定学习率后损失上升，训练发散。下面的代码运行 200 步，$\eta$ 从 $10^{-5}$ 增长到 $10$，使每一步都乘以同一个因子 $(10^{6})^{1/199}$，mini-batch 大小为 64，在训练集上循环取用。原始的 mini-batch 损失有噪声，所以记录的是它的指数滑动平均（因子 0.9），并修正使其从零起步所带来的偏差（与 Adam 的修正相同）。当平滑后的损失超过其最小值的四倍时测试停止，并返回三个读数：平滑损失相对于 $\log \eta$ 的**最陡下降**处的学习率、其**最小值**处的学习率，以及运行被**停止**时的学习率。通常的选择是比最小值处低几倍的学习率，接近最陡下降处。

```python
def range_test(optimiser_factory, lr_min=1e-5, lr_max=10.0, steps=200, batch=64, seed=0):
    model = make(seed)
    optimiser = optimiser_factory(model.parameters(), lr_min)
    gamma = (lr_max / lr_min) ** (1 / (steps - 1))        # constant factor per step
    order = torch.cat([torch.randperm(len(Xtr), generator=torch.Generator().manual_seed(k))
                       for k in range(steps * batch // len(Xtr) + 1)])
    lrs, smooth, running, best = [], [], 0.0, float("inf")
    for step in range(steps):
        lr = lr_min * gamma ** step
        for group in optimiser.param_groups:
            group["lr"] = lr
        idx = order[step * batch:(step + 1) * batch]
        model.train()
        loss = F.cross_entropy(model(Xtr[idx]), ytr[idx])
        optimiser.zero_grad()
        loss.backward()
        optimiser.step()
        running = 0.9 * running + 0.1 * loss.item()
        value = running / (1 - 0.9 ** (step + 1))           # bias-corrected average
        lrs.append(lr)
        smooth.append(value)
        best = min(best, value)
        if not np.isfinite(value) or value > 4 * best:       # diverged: stop
            break
    lrs, smooth = np.array(lrs), np.array(smooth)
    slope = np.gradient(smooth, np.log10(lrs))               # change per decade of lr
    return {"lrs": lrs, "smooth": smooth, "steps": len(lrs),
            "steepest": lrs[np.argmin(slope)], "minimum": lrs[np.argmin(smooth)],
            "min_loss": smooth.min(), "stopped": lrs[-1]}


sgd_factory = lambda params, lr: torch.optim.SGD(params, lr=lr, momentum=0.9)
adam_factory = lambda params, lr: torch.optim.Adam(params, lr=lr)
tests = {"SGD + momentum 0.9": range_test(sgd_factory), "Adam": range_test(adam_factory)}
for name, r in tests.items():
    print(f"{name:20s} steepest fall at lr {r['steepest']:.2g}; minimum {r['min_loss']:.3f} "
          f"at lr {r['minimum']:.2g}; stopped at lr {r['stopped']:.2g} (step {r['steps']})")
```

```output
SGD + momentum 0.9   steepest fall at lr 0.048; minimum 0.310 at lr 0.44; stopped at lr 0.58 (step 159)
Adam                 steepest fall at lr 0.0024; minimum 0.249 at lr 0.017; stopped at lr 0.089 (step 132)
```

### 步骤 4：读这两条曲线

图在对数坐标轴上画出平滑损失随学习率的变化，两个优化器各一条。竖线标出最陡下降处。从左往右读：先是一段平坦区，学习率小到 200 步内无法使损失移动；然后是下降、最小值，以及上升直到运行被停止之处。

```python
fig, ax = plt.subplots(figsize=(7, 4))
for (name, r), colour in zip(tests.items(), ["C0", "C1"]):
    ax.plot(r["lrs"], r["smooth"], color=colour, label=name)
    ax.axvline(r["steepest"], color=colour, linestyle=":", label=f"{name}: steepest fall")
ax.set_xscale("log")
ax.set_xlabel("learning rate (grows by a constant factor per step)")
ax.set_ylabel("smoothed training loss")
ax.set_title("Learning-rate range test on the digits MLP")
ax.legend(fontsize=8)
plt.tight_layout()
plt.show()
```

两个优化器的尺度并不相同。Adam 的最陡下降处（0.0024）和最小值处（0.017）分别比带动量的 SGD（0.048 和 0.44）低 20 倍和 26 倍，并且它更早发散，在 0.089 而不是 0.58。这与 Adam 的归一化是同一回事：它的步长约为每个参数 $\eta$，与梯度大小无关，而 SGD 的步长是 $\eta$ 乘以一个对大多数参数都很小的梯度（[第 8 节](#s8)）。这也是为什么给一个优化器找到的学习率对另一个毫无用处。

### 步骤 5：对比实验

六种优化器设置，从*相同*的初始权重（种子 0）出发，用*相同*顺序的 64 个样本的 mini-batch 训练 20 个轮次（epoch），使唯一的差别是更新规则。每个轮次之后，记录整个训练集上的损失（在 `eval()` 模式下，不求梯度），这比最后一个 mini-batch 的损失更干净。表中给出整个训练损失首次低于 0.1 的轮次、最终训练损失，以及验证损失和准确率。

这些设置是：$\eta = 0.05$ 和 $\eta = 0.5$ 的 SGD，$\eta = 0.05$ 的动量 0.9，$\eta = 0.05$ 的 Nesterov 动量 0.9，$2 \times 10^{-3}$ 的 Adam（接近范围测试的最陡下降处），以及同样学习率、权重衰减为 $10^{-2}$ 的 AdamW。

```python
def train_run(optimiser_factory, epochs=20, batch=64, seed=0):
    model = make(seed)
    optimiser = optimiser_factory(model.parameters())
    shuffler = torch.Generator().manual_seed(123)         # same batch order for every run
    history = [evaluate(model, Xtr, ytr)[0]]
    for epoch in range(epochs):
        model.train()
        order = torch.randperm(len(Xtr), generator=shuffler)
        for i in range(0, len(Xtr), batch):
            idx = order[i:i + batch]
            loss = F.cross_entropy(model(Xtr[idx]), ytr[idx])
            optimiser.zero_grad()
            loss.backward()
            optimiser.step()
        history.append(evaluate(model, Xtr, ytr)[0])
    return model, history


configs = {
    "SGD 0.05": lambda ps: torch.optim.SGD(ps, lr=0.05),
    "SGD 0.5": lambda ps: torch.optim.SGD(ps, lr=0.5),
    "momentum 0.9, 0.05": lambda ps: torch.optim.SGD(ps, lr=0.05, momentum=0.9),
    "Nesterov 0.9, 0.05": lambda ps: torch.optim.SGD(ps, lr=0.05, momentum=0.9, nesterov=True),
    "Adam 2e-3": lambda ps: torch.optim.Adam(ps, lr=2e-3),
    "AdamW 2e-3, wd 1e-2": lambda ps: torch.optim.AdamW(ps, lr=2e-3, weight_decay=1e-2),
}
histories = {}
print(f"{'optimiser':22s} {'first epoch <0.1':>16s} {'train loss':>11s} "
      f"{'val loss':>9s} {'val acc':>8s}")
for name, factory in configs.items():
    model, history = train_run(factory)
    histories[name] = history
    below = [e for e, v in enumerate(history) if v < 0.1]
    first = str(below[0]) if below else "never"
    val_loss, val_acc = evaluate(model, Xva, yva)
    print(f"{name:22s} {first:>16s} {history[-1]:11.4f} {val_loss:9.3f} {val_acc:8.3f}")
```

```output
optimiser              first epoch <0.1  train loss  val loss  val acc
SGD 0.05                          never      0.1289     0.212    0.933
SGD 0.5                               3      0.0027     0.093    0.975
momentum 0.9, 0.05                    4      0.0024     0.132    0.972
Nesterov 0.9, 0.05                    3      0.0025     0.103    0.975
Adam 2e-3                             4      0.0018     0.125    0.967
AdamW 2e-3, wd 1e-2                   4      0.0019     0.124    0.967
```

```python
plt.figure(figsize=(7, 4))
for name, history in histories.items():
    plt.semilogy(history, marker="o", markersize=3, label=name)
plt.axhline(0.1, color="0.6", linestyle=":")
plt.xlabel("epoch (17 steps each)")
plt.ylabel("training loss on the whole training set")
plt.title("Six optimisers, same network, same start, same batches")
plt.legend(fontsize=8)
plt.tight_layout()
plt.show()
```

四点观察。第一，$\eta = 0.05$ 的朴素 SGD 很慢，并且慢得有特点：训练停止时它的损失仍在下降（20 个轮次后为 0.129，其他设置在第 3 或第 4 个轮次就越过了这个水平），它 93.3% 的验证准确率是一次未完成的训练的水平。把学习率提高到 0.5 就解决了这一点，在这个问题上 0.5 是稳定的。第二，$\eta = 0.05$ 的动量 0.9 表现得像 0.5 的朴素 SGD，这就是[第 7 节](#s7)的有效学习率 $\eta/(1 - \mu)$：梯度稳定时，速度会增长到梯度的 $1/(1-\mu) = 10$ 倍。两条曲线接近但并不相同，因为稳定梯度的图景只在梯度变化缓慢处成立。第三，Nesterov 变体在这里与经典动量几乎无法区分；它的优势是光滑凸问题分析中的性质，而不是在这么容易的问题上看得见的效果。第四，Adam 在达到 0.1 的训练损失上并不比调好的 SGD 更快（第 4 个轮次，而 0.5 的 SGD 和 Nesterov 动量是第 3 个），尽管它达到了最低的最终训练损失 0.0018；AdamW 的衰减 $10^{-2}$ 在这个尺度上很小，只在最后几位数字上与 Adam 不同。训练成功的五种设置，最终验证准确率在 96.7% 到 97.5% 之间，相差 0.8 个百分点。359 张图像上接近 97% 的准确率，其二项标准误差为 $\sqrt{0.97 \cdot 0.03 / 359} \approx 0.009$，约一个百分点，所以它们之间的排名并没有被这个实验确立。在容易的问题上，优化器的选择改变的是速度，而不是终点。（验证损失则是另一回事，SGD 0.5 的比 Adam 的低：把训练损失压到 0.002 的网络是自信的，它对自己判错的图像的自信会受到惩罚。）

### 步骤 6：学习率调度与 SGD 的噪声下限

[第 9 节](#s9)论证过，在恒定学习率下，SGD 不会收敛到极小值，而是收敛到一个噪声下限，其超额损失正比于 $\eta$，而衰减的学习率调度可以消除这部分超额。这一步来测量它。数据是一个带噪回归，$y = \sin 3x + 0.1\,\xi$，其中 $\xi \sim \mathcal{N}(0, 1)$，有 4,096 个训练点和 2,048 个验证点，因此即使是真实函数，其验证 MSE 也等于噪声方差，约 $0.01$：第一个 print 算出的这个数是任何模型所能达到的最好水平，而调度控制的是超出它的*超额*部分。用 SGD、动量 0.9、峰值 $\eta = 0.05$、大小为 32 的 batch 和 20 个轮次（2,560 步）训练一个 $1 \to 64 \to 64 \to 1$ 的 ReLU 网络，使用三种调度：恒定；阶梯衰减（在 50% 的步数处 $\times 0.1$，在 75% 处 $\times 0.01$）；以及 5% 的线性预热后接余弦衰减至零。三者的初始权重和 batch 顺序相同。

```python
torch.manual_seed(0)
x_tr = torch.rand(4096, 1) * 2 - 1
y_tr_reg = torch.sin(3 * x_tr) + 0.1 * torch.randn(4096, 1)
x_va = torch.rand(2048, 1) * 2 - 1
y_va_reg = torch.sin(3 * x_va) + 0.1 * torch.randn(2048, 1)
noise_floor = F.mse_loss(torch.sin(3 * x_va), y_va_reg).item()
print(f"noise floor: validation MSE of the true function = {noise_floor:.4f}")


def make_regressor(seed=0):
    torch.manual_seed(seed)
    return nn.Sequential(nn.Linear(1, 64), nn.ReLU(), nn.Linear(64, 64), nn.ReLU(),
                         nn.Linear(64, 1))


def lr_factor(kind, step, total):
    """Multiplier on the peak learning rate at a given step."""
    if kind == "constant":
        return 1.0
    if kind == "step":
        return 1.0 if step < 0.5 * total else (0.1 if step < 0.75 * total else 0.01)
    warm = int(0.05 * total)                               # cosine with 5% linear warmup
    if step < warm:
        return (step + 1) / warm
    return 0.5 * (1 + np.cos(np.pi * (step - warm) / (total - warm)))


def run_schedule(kind, peak=0.05, epochs=20, batch=32, seed=0):
    model = make_regressor(seed)
    optimiser = torch.optim.SGD(model.parameters(), lr=peak, momentum=0.9)
    shuffler = torch.Generator().manual_seed(7)
    total, step, val_curve, lr_curve = epochs * (4096 // batch), 0, [], []
    for epoch in range(epochs):
        model.train()
        order = torch.randperm(4096, generator=shuffler)
        for i in range(0, 4096, batch):
            for group in optimiser.param_groups:
                group["lr"] = peak * lr_factor(kind, step, total)
            idx = order[i:i + batch]
            loss = F.mse_loss(model(x_tr[idx]), y_tr_reg[idx])
            optimiser.zero_grad()
            loss.backward()
            optimiser.step()
            lr_curve.append(optimiser.param_groups[0]["lr"])
            step += 1
        model.eval()
        with torch.no_grad():
            val_curve.append(F.mse_loss(model(x_va), y_va_reg).item())
    return np.array(val_curve), np.array(lr_curve)


results = {kind: run_schedule(kind) for kind in ["constant", "step", "cosine"]}
for kind, (val_curve, _) in results.items():
    final = val_curve[-1]
    print(f"{kind:9s} final validation MSE {final:.5f} (excess over the floor "
          f"{100 * (final - noise_floor) / noise_floor:5.1f}%), "
          f"std of the last five epochs {val_curve[-5:].std():.5f}")
```

```output
noise floor: validation MSE of the true function = 0.0104
constant  final validation MSE 0.01305 (excess over the floor  25.7%), std of the last five epochs 0.00074
step      final validation MSE 0.01041 (excess over the floor   0.2%), std of the last five epochs 0.00002
cosine    final validation MSE 0.01043 (excess over the floor   0.4%), std of the last five epochs 0.00011
```

```python
fig, (ax_lr, ax_val) = plt.subplots(1, 2, figsize=(10, 3.8))
for kind, (val_curve, lr_curve) in results.items():
    ax_lr.plot(lr_curve, label=kind)
    ax_val.plot(np.arange(1, 21), val_curve - noise_floor, marker="o", markersize=3, label=kind)
ax_lr.set_xlabel("step")
ax_lr.set_ylabel("learning rate")
ax_lr.set_title("The three schedules")
ax_lr.legend(fontsize=8)
ax_val.set_yscale("symlog", linthresh=1e-4)
ax_val.set_xlabel("epoch")
ax_val.set_ylabel("validation MSE minus the noise floor")
ax_val.set_title("Excess validation loss under each schedule")
ax_val.legend(fontsize=8)
plt.tight_layout()
plt.show()
```

恒定学习率最终比下限高 26%，其最后五个轮次的标准差约为 $7 \times 10^{-4}$；两种衰减调度的最终结果都在下限的百分之半以内，它们最后几个轮次几乎不动。恒定调度的超额就是 SGD 的噪声下限：迭代点不断被 mini-batch 的梯度噪声踢动，踢动的幅度由 $\eta$ 决定。衰减学习率会缩小踢动的幅度。还要注意，两种衰减调度在这个尺度上无法区分；重要的是学习率降到了一个小值，而不是路径的形状。这个比较中每种调度只跑了一次，恒定调度超额的大小是一条抖动曲线上最后一个点的值，而不是平均值：最后一道动手试试的题目把趋势与偶然分开。

### 步骤 7：Adam 的第一步是符号下降

在第一步 $t = 1$，矩估计为 $m = (1 - \beta_1) g$ 和 $v = (1 - \beta_2) g^2$，经[第 8 节](#s8)的偏差修正后 $\hat m = g$，$\hat v = g^2$，所以更新量为 $\eta\, g / (|g| + \epsilon) \approx \eta\,\mathrm{sign}(g)$：每个梯度不可忽略的参数都移动几乎恰好 $\eta$，不论它的梯度是 $10^{-7}$ 还是 $10^{-2}$。这段代码在 digits 网络上检验这一点：对一个全新的模型，在前 64 张训练图像组成的第一个 batch 上，以 $\eta = 10^{-3}$ 做一次 Adam 步骤。它统计梯度恰好为零的参数个数，报告其余梯度的幅值范围，以及这些参数中移动量超过 $0.99\eta$ 的比例。

```python
model = make(0)
optimiser = torch.optim.Adam(model.parameters(), lr=1e-3)
idx = torch.arange(64)
F.cross_entropy(model(Xtr[idx]), ytr[idx]).backward()
before = torch.cat([p.detach().flatten().clone() for p in model.parameters()])
grads = torch.cat([p.grad.flatten() for p in model.parameters()])
optimiser.step()
after = torch.cat([p.detach().flatten() for p in model.parameters()])

nonzero = grads != 0
moved = (after - before).abs()[nonzero]
print(f"parameters with an exactly zero gradient: {int((~nonzero).sum())} of {grads.numel()}")
print(f"non-zero gradient magnitudes: {grads[nonzero].abs().min():.1e} "
      f"to {grads[nonzero].abs().max():.1e}")
print(f"fraction of those that moved by more than 0.99 * lr: "
      f"{(moved > 0.99e-3).float().mean():.4f}")
```

```output
parameters with an exactly zero gradient: 615 of 26122
non-zero gradient magnitudes: 1.8e-07 to 6.4e-02
fraction of those that moved by more than 0.99 * lr: 0.9996
```

各参数的步长几乎没有差别，尽管梯度相差超过五个数量级。这是 Adam 的长处，也是它的隐患。说是长处，是因为梯度很小的参数（很少使用的嵌入、远离损失的层）仍然以有用的速率移动。说是隐患，是因为梯度纯属噪声的参数也移动得一样远：这就是当 $\beta_2$ 接近 1、前几步二阶矩估计很差时 Adam 需要预热的原因（[第 9 节](#s9)）。梯度为零的参数不会移动，因为 $0/(0 + \epsilon) = 0$。这 615 个中，有 512 个是四个常数像素的第一层权重（$4 \times 128$）；其余 103 个是第二层权重，对它们而言，batch 中没有任何一张图像使输入单元和输出单元同时被激活，所以[第 3 节](#s3)的乘积 $h_i \delta_j$ 在每个样本上都是零。

### 你应该看到什么

- 范围测试在几秒钟内就能找到正确的数量级。Adam 的可用范围远低于带动量的 SGD：它的最陡下降处和最小值处分别低 20 倍和 26 倍，并且在低 6.5 倍的学习率处发散。
- $\eta = 0.05$ 的动量 0.9 表现得像 $\eta = 0.5$ 的朴素 SGD：有效学习率为 $\eta/(1 - \mu)$。
- 在这个容易的问题上，Adam 并不比带动量的、调好的 SGD 更快，训练成功的五种设置在验证准确率上彼此相差不超过 0.8 个百分点，在一个标准误差之内。
- 恒定学习率最终比噪声下限高 26%（在这次运行中），并且逐轮抖动；两种衰减调度的最终结果都在下限的百分之半以内。
- Adam 的第一步使几乎每个参数都移动 $\eta$，不论其梯度多大：符号下降。

### 动手试试

1. 把 RMSprop 和 Adagrad（`torch.optim`）加入对比实验，学习率取自你自己的范围测试，并把它们放进表里。
2. 用六个各含 64 个单元的隐藏层重复这个对比实验，找出朴素 SGD 从哪里开始失效。
3. 以 $\eta = 3 \times 10^{-2}$（高于范围测试的最小值）运行 AdamW，分别带与不带 5% 的预热，并画出两者的前 100 步。
4. 用三个种子，在 $\eta = 0.02$ 和 $\eta = 0.05$ 下重复步骤 6，并对恒定调度的最终 MSE 取平均，以把趋势（超额正比于 $\eta$）与最后一个点的随机性分开。
