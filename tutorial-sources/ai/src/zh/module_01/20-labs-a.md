## 实验 1 — 线性回归的三种解法：闭式解、梯度下降与 SGD {#lab1}

**目标。** 你用正规方程、梯度下降和随机梯度下降（stochastic gradient descent）三种方法，在同一个合成数据集上拟合同一个线性模型，并把每个结果与[第 2 至 4 节](#s2)的理论对照。你要扫描学习率，让它越过 $2/\lambda_{\max}$，找出梯度下降发散的步长；再用尺度很差的特征把优化器搞坏，并用标准化修复；最后测量恒定步长 SGD 的噪声下限，并与预测值比较。全部使用 NumPy，无需下载任何东西，整个实验几秒钟即可跑完。

### 步骤 1：数据与闭式解

数据与[第 2 节](#s2)相同：200 个样本，三个服从标准正态分布的输入，真实权重 $\mathbf{w} = (1.5, -2.0, 0.5)$，截距 $0.7$，噪声为标准差 $0.1$ 的高斯噪声。截距的处理方式是在输入后面追加一列 1，得到形状为 $(200, 4)$ 的设计矩阵 `Xb` 和参数向量 $(w_1, w_2, w_3, b)$。正规方程 $\mathbf{X}^\top\mathbf{X}\,\mathbf{w} = \mathbf{X}^\top\mathbf{y}$ 求解两次：一次直接求解，一次用 `np.linalg.lstsq`，后者基于 SVD，从不构造 $\mathbf{X}^\top\mathbf{X}$。在条件良好的问题上，两者可以一致到很多位有效数字。

接下来是两个噪声估计。残差的均方根作为噪声水平的估计是偏低的，因为拟合已经用掉了四个自由度来压低残差。如[第 5 节](#s5)所推导，用 $N - 4$ 而不是 $N$ 去除残差平方和，就能修正这一偏差。

```python
import numpy as np
import matplotlib.pyplot as plt

np.set_printoptions(precision=3, suppress=True)
np.random.seed(0)                       # the lab itself uses seeded generators

rng = np.random.default_rng(0)
N = 200
w_true = np.array([1.5, -2.0, 0.5])
b_true = 0.7
sigma = 0.1

X = rng.normal(size=(N, 3))
y = X @ w_true + b_true + sigma * rng.normal(size=N)
Xb = np.hstack([X, np.ones((N, 1))])          # shape (200, 4): last column is the intercept

w_normal = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)
w_lstsq, *_ = np.linalg.lstsq(Xb, y, rcond=None)
print("normal equations:", np.round(w_normal, 3))
print("lstsq:           ", np.round(w_lstsq, 3))

resid = y - Xb @ w_lstsq
print(f"residual RMS          = {np.sqrt(np.mean(resid**2)):.4f}")
print(f"sqrt(RSS / (N - 4))   = {np.sqrt(np.sum(resid**2) / (N - 4)):.4f}")
```

```output
normal equations: [ 1.491 -2.01   0.505  0.696]
lstsq:            [ 1.491 -2.01   0.505  0.696]
residual RMS          = 0.1000
sqrt(RSS / (N - 4))   = 0.1010
```

权重接近真值 $(1.5, -2.0, 0.5, 0.7)$，误差在[第 2 节](#s2)预测的采样误差之内，每个系数约为 $\sigma/\sqrt{N} = 0.007$。残差的均方根就是数据的噪声水平，也就是当初加进去的 0.1。残差中没有留下任何可恢复的信号。

### 步骤 2：Hessian 矩阵、它的特征值和两个临界步长

对均方误差 $\mathcal{L}(\mathbf{w}) = \frac{1}{N}\lVert\mathbf{X}_b\mathbf{w} -
\mathbf{y}\rVert^2$，梯度为 $\frac{2}{N}\mathbf{X}_b^\top(\mathbf{X}_b\mathbf{w} -
\mathbf{y})$，Hessian 矩阵为 $\mathbf{H} = \frac{2}{N}\mathbf{X}_b^\top\mathbf{X}_b$，是常数。[第 3 节](#s3)说明，梯度下降收敛当且仅当 $\eta < 2/\lambda_{\max}$，最快的固定步长是 $\eta^\ast = 2/(\lambda_{\max} + \lambda_{\min})$。两者都来自特征值，所以把特征值算出来。条件数（condition number）$\kappa = \lambda_{\max}/\lambda_{\min}$ 表示最差方向比最好方向慢多少。

```python
H = (2 / N) * Xb.T @ Xb
lam = np.linalg.eigvalsh(H)                   # ascending order
lam_min, lam_max = lam[0], lam[-1]
eta_max = 2 / lam_max
eta_star = 2 / (lam_max + lam_min)

print("eigenvalues of H:", np.round(lam, 3))
print(f"kappa             = {lam_max / lam_min:.2f}")
print(f"eta_max = 2/lmax  = {eta_max:.3f}")
print(f"eta*              = {eta_star:.3f}")
```

```output
eigenvalues of H: [1.711 1.922 2.126 2.207]
kappa             = 1.29
eta_max = 2/lmax  = 0.906
eta*              = 0.511
```

相互独立、方差为 1 的输入使 $\frac{1}{N}\mathbf{X}^\top\mathbf{X}$ 接近单位矩阵，所以 $\mathbf{H}$ 接近 $2\mathbf{I}$，条件数接近 1，最大的稳定步长略小于 1。这是梯度下降的最佳情形。接下来的步骤会离开这种情形。

### 步骤 3：梯度下降与步数统计

循环就是[第 3 节](#s3)中的那个：从零出发，沿梯度反方向走。它被包装成一个返回完整权重轨迹的函数，这样后面的步骤就可以在每一步测量损失以及到最优点的距离。第一次运行取 $\eta = 0.1$，共 500 步，应当落在闭式解的权重上。然后统计在 $\eta = 0.1$ 和 $\eta^\ast$ 下，使 $\lVert\mathbf{w} - \mathbf{w}^\ast\rVert$ 低于 $10^{-6}$ 所需的步数。

理论可以预测这个步数。沿特征值为 $\lambda_i$ 的特征向量，误差每步乘以 $1 - \eta\lambda_i$，所以最小特征值决定收敛速率：约为 $(1 - 0.1\lambda_{\min})^t$。起始距离约为 2.6（真实权重的范数），达到 $10^{-6}$ 大约需要 $\ln(2.6\times10^{6})/\ln(1/(1 - 0.1\lambda_{\min}))$ 步；打印出的步数应当与此接近。

```python
def gradient_descent(Xm, ym, eta, steps):
    """Full-batch GD on the mean squared error; returns the whole trajectory of weights."""
    n = len(ym)
    w = np.zeros(Xm.shape[1])
    path = [w.copy()]
    for _ in range(steps):
        grad = (2 / n) * Xm.T @ (Xm @ w - ym)
        w = w - eta * grad
        path.append(w.copy())
    return np.array(path)

path = gradient_descent(Xb, y, eta=0.1, steps=500)
print("GD, eta = 0.1, 500 steps:", np.round(path[-1], 3))

def steps_to_tolerance(Xm, ym, eta, w_star, tol=1e-6, max_steps=10_000):
    n = len(ym)
    w = np.zeros(Xm.shape[1])
    for t in range(1, max_steps + 1):
        w = w - eta * (2 / n) * Xm.T @ (Xm @ w - ym)
        if np.linalg.norm(w - w_star) < tol:
            return t
    return None

print("steps to 1e-6 at eta = 0.1 :", steps_to_tolerance(Xb, y, 0.1, w_lstsq))
print("steps to 1e-6 at eta*      :", steps_to_tolerance(Xb, y, eta_star, w_lstsq))
print("predicted at eta = 0.1     :",
      round(np.log(2.6e6) / np.log(1 / (1 - 0.1 * lam_min))))
```

```output
GD, eta = 0.1, 500 steps: [ 1.491 -2.01   0.505  0.696]
steps to 1e-6 at eta = 0.1 : 76
steps to 1e-6 at eta*      : 7
predicted at eta = 0.1     : 79
```

三种方法在小数点后三位给出同样的答案，理应如此：它们最小化的是同一个凸二次函数。步数显示了 $\eta^\ast$ 的好处：它使最慢和最快的方向以同样的速率收缩，即每步 $(\kappa - 1)/(\kappa + 1)$，当 $\kappa$ 接近 1 时这个值非常小。

### 步骤 4：发散边界

[第 3 节](#s3)断言，$2/\lambda_{\max}$ 处的边界是尖锐的。来检验它：取 $\eta = f\,\eta_{\max}$，$f$ 从 0.5 到 1.5，各运行 200 步，打印最终训练损失。当 $f < 1$ 时，所有方向都收缩。当 $f > 1$ 时，$\lambda_{\max}$ 方向每步乘以 $1 - 2f$，其绝对值 $2f - 1$ 大于 1，于是几何级数地增长。在 $f = 0.99$ 时，该方向每步的因子为 $-0.98$：它会收敛，但很慢，而且符号交替。

```python
mse = lambda w: np.mean((Xb @ w - y) ** 2)
runs = {}
print(f"{'f':>5} {'final MSE':>12} {'|w - w*|':>12}")
for f in [0.5, 0.9, 0.99, 1.01, 1.1, 1.5]:
    p = gradient_descent(Xb, y, eta=f * eta_max, steps=200)
    runs[f] = np.array([mse(w) for w in p])
    print(f"{f:5.2f} {runs[f][-1]:12.4g} {np.linalg.norm(p[-1] - w_lstsq):12.3g}")

fig, ax = plt.subplots(figsize=(6.5, 4))
for f in [0.5, 0.99, 1.01]:
    ax.semilogy(runs[f], label=f"$\\eta = {f}\\,\\eta_{{max}}$")
ax.set_xlabel("step")
ax.set_ylabel("training MSE (log scale)")
ax.set_title("Gradient descent either side of $2/\\lambda_{max}$")
ax.legend()
plt.show()
```

```output
    f    final MSE     |w - w*|
 0.50         0.01      2.4e-15
 0.90         0.01     2.73e-15
 0.99      0.01043       0.0196
 1.01         3782         58.5
 1.10    6.458e+31     7.65e+15
 1.50   3.545e+120     1.79e+60
```

当 $f$ 不超过 0.9 时，最终 MSE 就是噪声下限 0.0100（噪声方差 $\sigma^2$ 减去拟合吸收的那一小部分），到最优点的距离处于舍入误差的量级。$f = 0.99$ 的那次运行在 200 步之后仍在振荡，MSE 为 0.0104，距离为 0.020。刚刚越过边界时，损失不降反升，到 $f = 1.5$ 时已经大得离谱。在由特征值算出的阈值的 1.01 倍处发散，是本模块中最有力的证据，说明理论确实描述了这台机器。

::: pitfall
损失变成 `inf` 或 `nan`，几乎总是因为步长超过了 $2/\lambda_{\max}$。在动其他任何东西之前，先把 $\eta$ 减半，再看前十个损失值。如果它们现在下降了，原因就是步长。
:::

### 步骤 5：糟糕的单位

现在在不改变模型的前提下把问题搞坏。复制 $\mathbf{X}$，把第一列乘以 1,000，仿佛长度是以毫米而不是米记录的；再给第二列加 100，仿佛接近 100 °C 的温度是按 °C 记录的，而不是记成相对 100 °C 的偏差。模型能表示的函数集合完全不变：新的第一个权重是旧权重的 $1/1000$，截距吸收了偏移。变化的只有条件数。分别打印这两种改动单独作用以及合在一起时的条件数，然后让梯度下降在 $0.9\,\eta_{\max}$（它能安全采用的最佳步长）下运行 100,000 步。

```python
Xbad = X.copy()
Xbad[:, 0] *= 1000.0
Xbad[:, 1] += 100.0
Xbad_b = np.hstack([Xbad, np.ones((N, 1))])

def kappa_and_limit(Xm):
    lam_m = np.linalg.eigvalsh((2 / len(Xm)) * Xm.T @ Xm)
    return lam_m[-1] / lam_m[0], 2 / lam_m[-1]

Xscale_only = np.hstack([X * np.array([1000.0, 1.0, 1.0]), np.ones((N, 1))])
Xshift_only = np.hstack([X + np.array([0.0, 100.0, 0.0]), np.ones((N, 1))])
print(f"kappa, scaling only : {kappa_and_limit(Xscale_only)[0]:.1e}")
print(f"kappa, offset only  : {kappa_and_limit(Xshift_only)[0]:.1e}")
kappa_bad, eta_max_bad = kappa_and_limit(Xbad_b)
print(f"kappa, both         : {kappa_bad:.1e}")
print(f"eta_max, both       : {eta_max_bad:.1e}")

w_bad_lstsq, *_ = np.linalg.lstsq(Xbad_b, y, rcond=None)
mse_bad = lambda w: np.mean((Xbad_b @ w - y) ** 2)
path_bad = gradient_descent(Xbad_b, y, eta=0.9 * eta_max_bad, steps=100_000)
print(f"lstsq MSE on the bad data : {mse_bad(w_bad_lstsq):.4f}")
print(f"GD MSE after 100,000 steps: {mse_bad(path_bad[-1]):.4f}")
```

```output
kappa, scaling only : 1.1e+06
kappa, offset only  : 1.0e+08
kappa, both         : 1.0e+10
eta_max, both       : 9.7e-07
lstsq MSE on the bad data : 0.0100
GD MSE after 100,000 steps: 4.2760
```

$10^{10}$ 的条件数并不罕见：未经缩放的工程数据就会产生这样的数字。步长受最大曲率限制，而最大曲率属于以毫米计的那一列；其余方向的曲率小了许多个数量级，在 100,000 步里几乎没有移动。100,000 步之后，训练 MSE 为 4.28，而同一数据上 `lstsq` 的结果是 0.0100：模型没有问题，是优化器没有学会它。`lstsq` 不受影响，因为 SVD 在舍入误差范围内不在乎单位。闭式解从未察觉这个问题；而梯度下降，这个能推广到本系列其余所有场景的方法，却察觉到了。这就是[第 3 节](#s3)把标准化放在优化之前的原因。

### 步骤 6：标准化，并把权重映射回去

标准化是减去每一列的训练均值，再除以它的训练标准差，得到均值为 0、方差为 1 的各列。偏移从条件数中消失了（中心化的列与全 1 列正交），尺度也消失了。在标准化坐标下拟合出的权重，通过 $w_j = \tilde w_j/s_j$ 和 $b = \tilde b - \sum_j \mu_j\tilde w_j/s_j$ 映射回原始单位，这两个式子来自把 $\tilde x_j = (x_j - \mu_j)/s_j$ 代入模型。映射回去的权重必须等于在尺度很差的问题上直接用 `lstsq` 得到的结果：标准化改变的是路径，不是答案。

```python
mu = Xbad.mean(axis=0)
s = Xbad.std(axis=0)
Z = (Xbad - mu) / s
Zb = np.hstack([Z, np.ones((N, 1))])

kappa_z, _ = kappa_and_limit(Zb)
lam_z = np.linalg.eigvalsh((2 / N) * Zb.T @ Zb)
eta_star_z = 2 / (lam_z[-1] + lam_z[0])
print(f"kappa after standardising = {kappa_z:.2f}")

w_z_star, *_ = np.linalg.lstsq(Zb, y, rcond=None)
print("steps to 1e-6 at eta*     :", steps_to_tolerance(Zb, y, eta_star_z, w_z_star))

w_z = gradient_descent(Zb, y, eta=eta_star_z, steps=50)[-1]
w_orig = np.append(w_z[:3] / s, w_z[3] - np.sum(mu * w_z[:3] / s))
show = lambda v: np.array2string(v, precision=5, suppress_small=True)
print("GD weights, original units:", show(w_orig))
print("lstsq on the bad data     :", show(w_bad_lstsq))
print(f"largest difference        : {np.max(np.abs(w_orig - w_bad_lstsq)):.1e}")
```

```output
kappa after standardising = 1.22
steps to 1e-6 at eta*     : 6
GD weights, original units: [  0.00149  -2.00962   0.5053  201.65791]
lstsq on the bad data     : [  0.00149  -2.00962   0.5053  201.65791]
largest difference        : 7.1e-13
```

条件数回到约 1，几步就收敛，映射回去的权重与 SVD 的解一致。第一个权重在原始单位下约为 $1.5\times10^{-3}$：真值 1.5 除以 1,000。截距约为 201.7，即 $0.696 + 2.0096\times100$：它吸收了加在第二列上的偏移。这次修复是一次变量替换，而不是什么更聪明的算法。请保留训练时的均值和标准差：任何新输入都必须用*这些*数来变换，而[实验 4](#lab4)会展示不这样做会发生什么。

### 步骤 7：随机梯度下降及其噪声下限

[第 4 节](#s4)预测，恒定步长的 SGD 不会收敛，而是在一个下限附近徘徊。这个下限是超额训练损失 $\mathcal{L}(\mathbf{w}_t) - \mathcal{L}(\mathbf{w}^\ast)$，对最小二乘而言为

$$
\text{floor} = \sum_i \frac{\eta\,\sigma^2\lambda_i}{B\,(2 - \eta\lambda_i)}, \qquad \sigma^2 = 0.0100,
$$

其中 $\sigma^2$ 是残差方差（代码里的 `s2`），推导见该节的例题。代码在原始的、尺度良好的数据上运行七种配置，每种 50 个轮次（epoch）。每个轮次抽取一个新的排列（来自种子为 1 的生成器，与生成数据的那个生成器相互独立），把它切成大小为 $B$ 的 mini-batch，每个 batch 走一步。每次更新之后，代码记录超额损失，所用的恒等式为 $\mathcal{L}(\mathbf{w}) - \mathcal{L}(\mathbf{w}^\ast) = \frac{1}{2}
(\mathbf{w} - \mathbf{w}^\ast)^\top\mathbf{H}(\mathbf{w} - \mathbf{w}^\ast)$，它对二次函数是精确的。最后一种配置让步长按 $\eta_t = 0.1/(1 + t/200)$ 衰减，其中 $t$ 是更新次数。测得的下限是后一半更新中超额损失的均值，此时瞬态已经消失。

```python
def sgd(B, eta, epochs=50, decay_tau=None, seed=1):
    """Mini-batch SGD with per-epoch shuffling; returns the excess loss after every update."""
    gen = np.random.default_rng(seed)
    w = np.zeros(4)
    excess, t = [], 0
    for _ in range(epochs):
        perm = gen.permutation(N)
        for start in range(0, N, B):
            idx = perm[start:start + B]
            grad = (2 / len(idx)) * Xb[idx].T @ (Xb[idx] @ w - y[idx])
            step = eta if decay_tau is None else eta / (1 + t / decay_tau)
            w = w - step * grad
            d = w - w_lstsq
            excess.append(0.5 * d @ H @ d)
            t += 1
    return np.array(excess)

def predicted_floor(B, eta, s2=0.0100):
    return np.sum(eta * s2 * lam / (B * (2 - eta * lam)))

configs = [(200, 0.1, None), (32, 0.1, None), (10, 0.1, None),
           (1, 0.1, None), (1, 0.03, None), (1, 0.01, None), (1, 0.1, 200)]
curves = {}
print(f"{'B':>4} {'eta':>6} {'measured':>10} {'predicted':>10}")
for B, eta, tau in configs:
    ex = sgd(B, eta, decay_tau=tau)
    curves[(B, eta, tau)] = ex
    measured = ex[len(ex) // 2:].mean()
    label = f"{eta}" if tau is None else "decay"
    pred = predicted_floor(B, eta) if tau is None else float("nan")
    print(f"{B:4d} {label:>6} {measured:10.1e} {pred:10.1e}")
print(f"decaying step, last update: {curves[(1, 0.1, 200)][-1]:.1e}")
```

```output
   B    eta   measured  predicted
 200    0.1    1.7e-05    2.2e-05
  32    0.1    1.0e-04    1.4e-04
  10    0.1    3.1e-04    4.4e-04
   1    0.1    9.6e-03    4.4e-03
   1   0.03    1.3e-03    1.2e-03
   1   0.01    2.7e-04    4.0e-04
   1  decay    3.0e-05        nan
decaying step, last update: 3.1e-06
```

按列往下读这张表。测得的下限按 $\eta/B$ 缩放：把 batch 大小从 32 减到 10，下限大约升高到 3.2 倍；在 $B = 1$ 时减小 $\eta$，下限随之同步下降。对每个 $B < N$ 的恒定步长行，预测值都在两倍以内，对一个加性噪声模型来说这已经足够好了。对小步长，预测偏高（$B = 10$ 时为 4.4 对 3.1，单位 $10^{-4}$）；在 $B = 1$、$\eta = 0.1$ 时预测偏低（4.4 对 9.6，单位 $10^{-3}$），因为被忽略的、随到最优点距离增大的噪声在这里最大。全 batch 那一行并不是下限：$B = N$ 时没有采样噪声，这次运行就是普通的梯度下降，那个数字是一段仍在几何级数地缩小的瞬态的均值。公式不适用于它，它与打印出的预测值接近纯属巧合。衰减步长在最后一次更新后降到 $3\times10^{-6}$，远低于每一个恒定步长的下限。

### 步骤 8：绘图

图中把四次运行画在双对数坐标上：全 batch、$B = 32$、$B = 1$ 以及带衰减的 $B = 1$，每条曲线对各自的更新次数作图。两个恒定步长运行的预测下限用虚线表示。全 batch 梯度下降每个轮次只更新一次，所以只有 50 个点；它那条笔直下降的线就是[第 3 节](#s3)中的几何收敛。这就是图 1.6。

```python
fig, ax = plt.subplots(figsize=(7, 4.5))
spec = [((200, 0.1, None), "full batch, $\\eta = 0.1$", "C0"),
        ((32, 0.1, None), "$B = 32$, $\\eta = 0.1$", "C1"),
        ((1, 0.1, None), "$B = 1$, $\\eta = 0.1$", "C3"),
        ((1, 0.1, 200), "$B = 1$, $\\eta_t = 0.1/(1 + t/200)$", "C2")]
for key, label, colour in spec:
    ex = curves[key]
    ax.loglog(np.arange(1, len(ex) + 1), np.maximum(ex, 1e-12), color=colour,
              lw=1.0, alpha=0.9, label=label)
for (B, eta), colour in [((32, 0.1), "C1"), ((1, 0.1), "C3")]:
    ax.axhline(predicted_floor(B, eta), color=colour, ls="--", lw=1)
ax.set_xlabel("update number")
ax.set_ylabel("excess training loss  $L(w_t) - L(w^*)$")
ax.set_title("SGD hovers at a floor set by $\\eta/B$; decay goes below it")
ax.legend(loc="lower left", fontsize=8)
plt.show()
```

$B = 32$ 的曲线下降得很快，然后在 $10^{-4}$ 附近变平。$B = 1$ 的曲线在 $10^{-2}$ 附近是平的，并且锯齿状起伏。衰减的那次运行起初跟着噪声大的那条走，随后在其他曲线都已趋平之后继续下降。

### 你应当看到什么

- 正规方程、`lstsq` 和梯度下降在小数点后三位一致。残差的均方根等于噪声标准差：没有可恢复的信号被遗漏。
- 发散边界很尖锐，且位于特征值分析给出的位置：$0.99\,\eta_{\max}$ 收敛（缓慢，且振荡），$1.01\,\eta_{\max}$ 爆炸。
- 单位很差时，梯度下降看上去学不会，尽管模型本身没有问题。标准化几步之内就恢复了收敛，映射回原始单位的权重等于 `lstsq` 的解。修复靠的是变量替换，而不是新算法。闭式解从未察觉这个问题。
- 恒定步长的 SGD 在一个大致与 $\eta/B$ 成正比的下限附近徘徊。预测值在大约两倍之内吻合。衰减步长能降到每一个下限以下。

### 动手试试

1. 增加第五列，等于第 0 列的 $0.99$ 倍加上 $0.01$ 倍的噪声，把所有列标准化，观察 $\kappa$ 和梯度下降的步数如何增长。这是由相关性造成的病态，任何重新缩放都无法消除。
2. 用回溯法代替固定步长：把 $\eta$ 不断减半，直到损失下降，并把步数与 $\eta^\ast$ 下的步数比较。
3. 对 $N = 10^6$、$d = 100$，比较 `np.linalg.lstsq` 与 100 步梯度下降的耗时，并决定你会用哪一个。再对 $d = 10^5$ 决定你会用哪一个。
4. 让 SGD 的下标改为独立有放回抽取，而不是按打乱的轮次遍历，并把下限与表中的数字比较：[第 4 节](#s4)的例题说明了应当预期什么。

## 实验 2 — 从零实现逻辑回归，以及决策所需的指标 {#lab2}

**目标。** 你实现带正则化的逻辑回归，使用数值稳定的损失和一个经过检验的梯度，用梯度下降训练它，并确认两者都收敛后与 scikit-learn 的结果一致。然后按决策所需的方式度量这个分类器：混淆矩阵、满足召回率目标的阈值、ROC 曲线和精确率-召回率曲线，以及校准，其中包括一个比模型校准得更好却毫无用处的常数预测器。最后，在可分数据上去掉惩罚项，观察权重无限增长。数据随 scikit-learn 一起提供，所以无需下载，实验几秒钟即可跑完。

### 步骤 1：数据

scikit-learn 的乳腺癌数据有 569 个病例和 30 个数值特征，这些特征由细胞核图像计算得出。该库把恶性编码为 0，这使准确率和召回率很容易被读错。工程师要问的问题是“这是缺陷吗？”，所以缺陷（这里是恶性）必须是正类：用 `y = 1 - target` 翻转目标。划分是分层的，使训练集和测试集保持类别比例，标准化只使用训练集的统计量。测试数据绝不能参与任何被拟合的东西，均值和标准差也包括在内。

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.special import expit
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (confusion_matrix, roc_auc_score, average_precision_score,
                             roc_curve, precision_recall_curve, brier_score_loss)

np.set_printoptions(precision=4, suppress=True)
np.random.seed(0)

data = load_breast_cancer()
y_all = 1 - data.target                      # malignant = 1 (scikit-learn codes it as 0)
print("malignant:", int(y_all.sum()), " benign:", int((1 - y_all).sum()))

X_tr, X_te, y_tr, y_te = train_test_split(
    data.data, y_all, test_size=0.25, stratify=y_all, random_state=0)
print("train:", X_tr.shape, int(y_tr.sum()), "malignant")
print("test: ", X_te.shape, int(y_te.sum()), "malignant")

mu, sd = X_tr.mean(axis=0), X_tr.std(axis=0)
A_tr = np.hstack([(X_tr - mu) / sd, np.ones((len(X_tr), 1))])   # last column: intercept
A_te = np.hstack([(X_te - mu) / sd, np.ones((len(X_te), 1))])
N = len(y_tr)
```

```output
malignant: 212  benign: 357
train: (426, 30) 159 malignant
test:  (143, 30) 53 malignant
```

### 步骤 2：损失、梯度和步长上界

设 logit 为 $z = \mathbf{a}^\top\mathbf{w}$，概率为 $\hat p = \sigma(z)$，则单个样本的负对数似然为 $\ln(1 + e^{z}) - yz$，推导见[第 6 节](#s6)。直接计算时，$e^{z}$ 在 $z$ 很大时会溢出；`np.logaddexp(0, z)` 计算 $\ln(e^0 + e^z)$，而不构造指数本身。平均损失加上对 30 个特征权重（不含截距）的惩罚项 $\lambda\lVert\mathbf{w}\rVert^2$，其中 $\lambda = 1/(2NC)$，使之与 scikit-learn 的 $C = 1$ 相匹配。梯度为 $\frac{1}{N}\mathbf{A}^\top(\hat{\mathbf{p}} - \mathbf{y}) + 2\lambda
\mathbf{w}$，截距对应的惩罚项为零。

数据项的 Hessian 矩阵为 $\frac{1}{N}\mathbf{A}^\top\mathrm{diag}(\hat p(1 - \hat p))
\mathbf{A}$，而 $\hat p(1 - \hat p) \le \frac{1}{4}$，所以它的最大特征值至多为 $L = \lambda_{\max}(\mathbf{A}^\top\mathbf{A}/N)/4$。于是取 $\eta < 2/L$ 的梯度下降是安全的。把这个上界打印出来。

```python
C = 1.0
lam_reg = 1.0 / (2 * N * C)                  # ridge strength matching scikit-learn's C
mask = np.r_[np.ones(30), 0.0]               # the intercept is not penalised

def loss_fn(w, A=A_tr, y=y_tr, lam=lam_reg):
    z = A @ w
    return np.mean(np.logaddexp(0, z) - y * z) + lam * np.sum((mask * w) ** 2)

def grad_fn(w, A=A_tr, y=y_tr, lam=lam_reg):
    p = expit(A @ w)
    return A.T @ (p - y) / len(y) + 2 * lam * mask * w

L = np.linalg.eigvalsh(A_tr.T @ A_tr / N)[-1] / 4
print(f"curvature bound L = {L:.2f}; GD is safe for eta < 2/L = {2 / L:.2f}")
```

```output
curvature bound L = 3.39; GD is safe for eta < 2/L = 0.59
```

下面使用步长 $\eta = 0.5$。这个上界针对的是曲率达到最大可能值的损失；在最小值附近，曲率要小得多，这就是为什么对这个非二次的损失，该上界是充分条件而非必要条件，[第 6 节](#s6)对此有说明。

### 步骤 3：检验梯度

手写的梯度是最容易出现隐蔽错误的地方，而错误的梯度不会让程序崩溃：它只会让训练变慢或出错。检验方法是把它与中心差分 $(\mathcal{L}(\mathbf{w} + \epsilon\mathbf{e}_j) - \mathcal{L}(\mathbf{w} - \epsilon\mathbf{e}_j))/2\epsilon$ 比较，在一个随机点上，使用相对误差 $\lVert g_{\text{num}} - g\rVert / \lVert g_{\text{num}} + g\rVert$。正确的梯度给出的误差远低于 $10^{-6}$。[模块 02](module_02_ZH.html)把这项检验作为编写反向传播时的常规步骤。

```python
gen = np.random.default_rng(0)
w_probe = 0.1 * gen.normal(size=31)
g = grad_fn(w_probe)
eps = 1e-6
g_num = np.array([(loss_fn(w_probe + eps * e) - loss_fn(w_probe - eps * e)) / (2 * eps)
                  for e in np.eye(31)])
rel = np.linalg.norm(g_num - g) / np.linalg.norm(g_num + g)
print(f"relative error of the gradient: {rel:.1e}")
```

```output
relative error of the gradient: 1.2e-10
```

### 步骤 4：用梯度下降训练

从零出发，以 $\eta = 0.5$ 运行 20,000 步全 batch 梯度下降，并打印第 10、100、1,000 和 20,000 步的损失。开头下降很快、之后拖着很长的尾巴，这是曲率随方向不同而差异很大的问题的典型表现：这份数据标准化后的特征高度相关（这 30 个测量值在很大程度上是描述大小的不同方式）。

```python
w = np.zeros(31)
eta = 0.5
history = {}
for step in range(1, 20_001):
    w = w - eta * grad_fn(w)
    if step in (10, 100, 1_000, 20_000):
        history[step] = loss_fn(w)
for step, value in history.items():
    print(f"step {step:6d}: loss {value:.4f}")
w_gd = w.copy()
print(f"gradient norm at the end: {np.linalg.norm(grad_fn(w_gd)):.1e}")
```

```output
step     10: loss 0.1233
step    100: loss 0.0760
step   1000: loss 0.0685
step  20000: loss 0.0684
gradient norm at the end: 2.3e-14
```

### 步骤 5：与 scikit-learn 比较

`LogisticRegression(C=1.0)` 最小化的是同一个目标：$\sum_i$（负对数似然）$+
\frac{1}{2C}\lVert\mathbf{w}\rVert^2$，它是我们的目标（取 $\lambda = 1/(2NC)$）的 $N$ 倍。默认的收敛容差 `tol=1e-4` 会让求解器提前停止，此时系数与真正的最小值之间的差异，很容易被误认为是某一个实现中的 bug。代码分别用严格的容差和默认容差拟合，并打印各自与梯度下降解的最大系数差。

```python
def fit_sklearn(tol):
    m = LogisticRegression(C=1.0, tol=tol, max_iter=10_000)
    m.fit(A_tr[:, :30], y_tr)
    return np.append(m.coef_.ravel(), m.intercept_[0])

w_tight = fit_sklearn(1e-8)
w_default = fit_sklearn(1e-4)
print(f"tol = 1e-8: largest coefficient difference = {np.max(np.abs(w_tight - w_gd)):.1e}")
print(f"tol = 1e-4: largest coefficient difference = {np.max(np.abs(w_default - w_gd)):.1e}")
```

```output
tol = 1e-8: largest coefficient difference = 9.4e-07
tol = 1e-4: largest coefficient difference = 1.6e-02
```

容差严格时，两个解在约 $10^{-6}$ 内一致。用默认容差时，它们在小数点后第二位出现差异。模型是同一个，不同的是停止规则。在为一个很小的不一致去责怪某个实现之前，值得先知道这一点。

### 步骤 6：测试集上的混淆矩阵

概率通过阈值变成决策，这里阈值为 0.5。混淆矩阵统计四种结果；行是真实类别，列是预测，负类（良性）排在前面。准确率只有与总是预测多数类的基线相比才有意义，该基线的准确率就是测试集中多数类所占的比例。

```python
p_te = expit(A_te @ w_gd)
pred = (p_te >= 0.5).astype(int)
tn, fp, fn, tp = confusion_matrix(y_te, pred).ravel()
print("confusion matrix [[TN, FP], [FN, TP]]:")
print(np.array([[tn, fp], [fn, tp]]))

accuracy = (tp + tn) / len(y_te)
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
baseline = 1 - y_te.mean()
print(f"accuracy {accuracy:.3f}  precision {precision:.3f}  recall {recall:.3f}  "
      f"F1 {f1:.3f}")
print(f"majority-class baseline accuracy {baseline:.3f}")
```

```output
confusion matrix [[TN, FP], [FN, TP]]:
[[90  0]
 [ 2 51]]
accuracy 0.986  precision 1.000  recall 0.962  F1 0.981
majority-class baseline accuracy 0.629
```

接近 0.99 的准确率听上去极好，但只有放在一个无需任何模型的 0.629 基线旁边才有意义。这些错误的代价是不对称的：这里的一个假阴性，就是把恶性病例判为良性。精确率回答“被标记的当中有多少是真的？”，召回率回答“真正的病例当中有多少被标记了？”。这两者在准确率里都看不出来。

### 步骤 7：ROC 曲线与精确率-召回率曲线

这些曲线扫描阈值，而不是固定阈值。ROC 曲线画的是召回率（真阳性率）对假阳性率；它下面的面积即 AUC，是随机取一个正例得分高于随机取一个负例的概率。精确率-召回率曲线画的是精确率对召回率；随机排序的模型，其精确率等于患病率 $53/143 = 0.371$，所以这才是它的基线，而不是 0.5。图中标出的点是上一步阈值为 0.5 时的决策。

```python
auc = roc_auc_score(y_te, p_te)
ap = average_precision_score(y_te, p_te)
print(f"ROC AUC           = {auc:.3f}")
print(f"average precision = {ap:.3f}")

fpr, tpr, _ = roc_curve(y_te, p_te)
prec_c, rec_c, thr_c = precision_recall_curve(y_te, p_te)

fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))
axes[0].plot(fpr, tpr, label=f"logistic regression (AUC {auc:.3f})")
axes[0].plot([0, 1], [0, 1], "k--", lw=1, label="chance")
axes[0].plot(fp / (fp + tn), recall, "o", color="C3", label="threshold 0.5")
axes[0].set_xlabel("false-positive rate")
axes[0].set_ylabel("recall (true-positive rate)")
axes[0].set_title("ROC curve, 143 test cases")
axes[0].legend(loc="lower right")
axes[1].plot(rec_c, prec_c, label=f"logistic regression (AP {ap:.3f})")
axes[1].axhline(y_te.mean(), color="k", ls="--", lw=1, label="chance (prevalence 0.371)")
axes[1].plot(recall, precision, "o", color="C3", label="threshold 0.5")
axes[1].set_xlabel("recall")
axes[1].set_ylabel("precision")
axes[1].set_ylim(0.3, 1.05)
axes[1].set_title("Precision-recall curve, 143 test cases")
axes[1].legend(loc="lower left")
plt.tight_layout()
plt.show()
```

```output
ROC AUC           = 0.996
average precision = 0.994
```

ROC 曲线紧贴左上角：排序极好。然而 AUC 没有说明阈值该放在哪里，而那才是决策。

### 步骤 8：满足召回率目标的阈值

假设漏掉一个恶性病例是不可接受的，要求是召回率至少为 0.98。`precision_recall_curve` 在预测发生变化的每一个阈值处返回精确率和召回率。从最高阈值向下扫描，得到满足目标的最大阈值，也就是满足目标者中精确率最好的那个。

```python
def threshold_for_recall(target):
    ok = np.where(rec_c[:-1] >= target)[0]           # rec_c is non-increasing in the index
    i = ok[-1]
    return thr_c[i], prec_c[i], rec_c[i]

print(f"{'target recall':>14} {'threshold':>10} {'precision':>10} {'recall':>8}")
for target in [0.95, 0.98, 1.0]:
    thr, pr, rc = threshold_for_recall(target)
    print(f"{target:14.2f} {thr:10.3f} {pr:10.3f} {rc:8.3f}")
```

```output
 target recall  threshold  precision   recall
          0.95      0.509      1.000    0.962
          0.98      0.218      0.852    0.981
          1.00      0.116      0.828    1.000
```

排序极好，阈值依然是一个决策。要满足 0.98 的召回率，需要阈值 0.218，代价是精确率 0.852；要把 53 个恶性病例全部找出，需要 0.116，精确率为 0.828，大致每六个被标记的病例中有一个是良性。这是否可以接受，取决于误报与漏报各自的代价，这是关于应用的问题，而不是关于模型的问题。还要注意，这些是基于 53 个正例的测试集数字：换一个样本，阈值本身也会移动。阈值应当在验证数据上选择，只在测试数据上报告；这里为了说明才使用测试集，正确的流程见[实验 4](#lab4)。

### 步骤 9：校准

如果在被给出 0.8 概率的病例中大约 80% 是正例，则称模型是**校准的**（calibrated）。可靠性图把测试病例按预测概率分入 5 个等宽的箱，并画出每个箱中正例的比例对该箱平均预测值。**期望校准误差**（expected calibration error，ECE）是加权的平均差距，
$\sum_b \frac{n_b}{n}\lvert\text{freq}_b - \text{conf}_b\rvert$，对 $n$ 个测试病例求和，定义见[第 7 节](#s7)；**Brier 分数**是概率的均方误差，$\frac{1}{n}\sum_i(\hat p_i - y_i)^2$。两者都要计算，而这张图是本实验版本的图 1.12（见[第 7 节](#s7)）。然后给常数预测器打分，它对每个病例都输出训练集患病率 $159/426 = 0.373$。

```python
def binned_calibration(p, y, n_bins=5):
    edges = np.linspace(0, 1, n_bins + 1)
    idx = np.clip(np.digitize(p, edges[1:-1]), 0, n_bins - 1)
    rows, ece = [], 0.0
    for b in range(n_bins):
        sel = idx == b
        if sel.any():
            rows.append((p[sel].mean(), y[sel].mean(), sel.sum()))
            ece += sel.mean() * abs(y[sel].mean() - p[sel].mean())
    return np.array(rows), ece

rows, ece = binned_calibration(p_te, y_te)
brier = brier_score_loss(y_te, p_te)
print(f"model:    Brier {brier:.3f}  ECE {ece:.3f}  AUC {auc:.3f}")
for mean_p, frac, n in rows:
    print(f"   bin: mean prediction {mean_p:.3f}, fraction positive {frac:.3f}, n = {int(n)}")

p_const = np.full(len(y_te), y_tr.mean())
_, ece_c = binned_calibration(p_const, y_te)
print(f"constant: Brier {brier_score_loss(y_te, p_const):.3f}  ECE {ece_c:.3f}  "
      f"AUC {roc_auc_score(y_te, p_const):.3f}")

fig, ax = plt.subplots(figsize=(5, 4.5))
ax.plot([0, 1], [0, 1], "k--", lw=1, label="perfect calibration")
ax.plot(rows[:, 0], rows[:, 1], "o-", label="logistic regression")
for mean_p, frac, n in rows:
    ax.annotate(f"n={int(n)}", (mean_p, frac), textcoords="offset points", xytext=(5, -12),
                fontsize=8)
ax.set_xlabel("mean predicted probability in the bin")
ax.set_ylabel("fraction of positives in the bin")
ax.set_title("Reliability diagram, 5 bins, 143 test cases")
ax.legend(loc="upper left")
plt.show()
```

```output
model:    Brier 0.023  ECE 0.023  AUC 0.996
   bin: mean prediction 0.015, fraction positive 0.012, n = 82
   bin: mean prediction 0.278, fraction positive 0.143, n = 7
   bin: mean prediction 0.473, fraction positive 0.250, n = 4
   bin: mean prediction 0.665, fraction positive 1.000, n = 3
   bin: mean prediction 0.996, fraction positive 1.000, n = 47
constant: Brier 0.233  ECE 0.003  AUC 0.500
```

模型的 ECE 很小，但 143 个病例分到 5 个箱里，中间的箱只剩寥寥几个病例，所以每个箱的正例比例都是带噪声的估计，ECE 因这种噪声而偏高（[第 7 节](#s7)）。常数预测器说明了为什么不能单独使用 ECE。它的 ECE 比模型的还小，因为测试集中正例的总体频率接近训练集的患病率，所以它唯一的那个箱几乎是校准的。然而它的 Brier 分数差了十倍，AUC 恰好是 0.5：它对任何单个病例都说不出什么。校准不是区分能力，一种指标不能替代另一种。

### 步骤 10：在可分数据上去掉惩罚项会怎样

如果存在一个超平面把两类完全分开，那么随着权重沿分离方向增长，似然会不断上升，因为每个样本的 logit 都在正确的一侧离零越来越远。没有惩罚项就没有最小值：$\lVert\mathbf{w}\rVert$ 永远增长，损失趋向于零。是惩罚项让最小值得以存在（[第 6 节](#s6)）。本实验的训练集有 30 个特征和 426 个训练病例，是可分的，运行时令 $\lambda = 0$，把训练错误数降到零，就证实了这一点。步长取 $\eta = 1.0$，高于带惩罚问题的上界，这里可以接受，因为概率饱和时 Hessian 矩阵会缩小。

```python
w_sep = np.zeros(31)
checkpoints = {100, 1_000, 10_000, 100_000}
for step in range(1, 100_001):
    w_sep = w_sep - 1.0 * grad_fn(w_sep, lam=0.0)
    if step in checkpoints:
        print(f"step {step:7d}: ||w|| = {np.linalg.norm(w_sep):6.1f}   "
              f"loss = {loss_fn(w_sep, lam=0.0):.4f}")
train_errors = int(np.sum((A_tr @ w_sep >= 0).astype(int) != y_tr))
print("training errors:", train_errors)
```

```output
step     100: ||w|| =    3.2   loss = 0.0584
step    1000: ||w|| =    6.2   loss = 0.0413
step   10000: ||w|| =   16.1   loss = 0.0256
step  100000: ||w|| =   51.2   loss = 0.0088
training errors: 0
```

范数不断上升，永不稳定：在 100、1,000、10,000 和 100,000 步时分别为 3.2、6.2、16.1 和 51.2，同时损失从 0.058 降到 0.0088，训练错误数降到零。对于严格可分的数据，增长最终只是步数的对数级，但这次运行还没有进入那个区间（步数每增加十倍，范数依次乘以 1.9、2.6、3.2），所以不要据此外推。重要的是它没有极限：不带惩罚的“解”并不存在，你得到的只是运行停下来时恰好到达的位置。这就是 scikit-learn 默认使用 L2 惩罚的原因，也是为什么在不带惩罚的逻辑回归中看到 $10^{3}$ 的系数是一个警告，而不是一个发现。

### 你应当看到什么

- 从零实现的模型与 scikit-learn 在双方都收敛后一致。$10^{-2}$ 的不一致来自求解器的容差，而不是模型。
- AUC 接近 0.996 说明排序极好，但阈值依然是一个决策：找出每一个恶性病例，要付出精确率约 0.83 而不是 1.00 的代价。
- 0.986 的准确率只有放在 0.629 的基线旁边才有意义。
- 在可分数据上不带惩罚时，$\lVert\mathbf{w}\rVert$ 无限增长（在三个数量级的步数上从 3.2 增到 51），概率趋于饱和。L2 惩罚正是防止这一点的东西。
- 单看 ECE，常数预测器会排在模型之上；Brier 分数和 AUC 则不会。校准不是区分能力。

### 动手试试

1. 在 `load_iris` 上用你自己的梯度 $(\hat{\mathbf{P}} - \mathbf{Y})^\top\mathbf{X}/N$ 实现 softmax 回归，并与 `LogisticRegression` 比较。
2. 用 $\eta = 2$ 和 $\eta = 5$ 重复步骤 4。损失仍然下降：对这个非二次的损失，界 $\eta < 2/L$ 是充分条件，而非必要条件。
3. 在训练集上用 `CalibratedClassifierCV(method='sigmoid', cv=5)` 重新校准，并比较 Brier 分数和可靠性图。
4. 在训练集上用交叉验证得到的概率重新做步骤 8 的阈值搜索，固定阈值，然后在测试集上报告精确率和召回率。它们移动了多少？

## 实验 3 — 多项式：容量、偏差-方差与岭回归路径 {#lab3}

**目标。** 你在 $\sin(2\pi x)$ 的二十个带噪声的点上重现[第 8 节](#s8)的容量曲线，用蒙特卡洛方法估计每个多项式次数的偏差²和方差，并与固定设计下的精确公式对照，描绘 15 次多项式的岭回归路径，并用五折交叉验证选择惩罚强度。然后用十倍的数据重复这个实验。合成数据，只用 NumPy，无需下载；几秒钟即可跑完。

### 步骤 1：数据，以及基为什么重要

真实函数为 $f(x) = \sin(2\pi x)$，噪声的标准差为 $\sigma = 0.3$。训练输入是一个**固定设计**，即 $[0, 1]$ 上均匀分布的 20 个点，只有噪声是随机的。固定设计让实验保持干净：随机输入会在两端附近留下空隙，高次多项式在那里的方差会大到淹没所有图像。验证输入和测试输入是均匀抽取的，分别为 1,000 个和 10,000 个，抽样按固定顺序来自同一个生成器，所以数字可以复现。

特征是关于 $t = 2x - 1$ 的 Legendre 多项式 $P_0(t), \dots, P_d(t)$，它把 $[0, 1]$ 映射到 $[-1, 1]$。它们张成的函数空间与单项式 $x^k$ 完全相同，所以在精确算术下拟合出的曲线是一样的；改变的是设计矩阵的条件数。代码打印两种基下 15 次设计的条件数。

```python
import numpy as np
import matplotlib.pyplot as plt
from numpy.polynomial import legendre as L

np.set_printoptions(precision=3, suppress=True)
np.random.seed(0)
SIGMA = 0.3
f = lambda x: np.sin(2 * np.pi * x)

def make_data(n_train, seed=0):
    gen = np.random.default_rng(seed)
    x_tr = np.linspace(0, 1, n_train)                       # fixed design
    y_tr = f(x_tr) + SIGMA * gen.normal(size=n_train)
    x_va = gen.uniform(0, 1, 1000)
    y_va = f(x_va) + SIGMA * gen.normal(size=1000)
    x_te = gen.uniform(0, 1, 10_000)
    y_te = f(x_te) + SIGMA * gen.normal(size=10_000)
    return x_tr, y_tr, x_va, y_va, x_te, y_te

x_tr, y_tr, x_va, y_va, x_te, y_te = make_data(20)
phi = lambda x, d: L.legvander(2 * x - 1, d)                # shape (len(x), d + 1)

t = 2 * x_tr - 1
print(f"condition number, Legendre design, d = 15: {np.linalg.cond(phi(x_tr, 15)):.1f}")
print(f"condition number, monomial design, d = 15: "
      f"{np.linalg.cond(np.vander(t, 16, increasing=True)):.1e}")
```

```output
condition number, Legendre design, d = 15: 46.7
condition number, monomial design, d = 15: 6.7e+05
```

Legendre 基在区间上近似正交，这使条件数保持很小。单项式基在高次幂时各列彼此非常接近，它的条件数差了四个数量级。正规方程会把条件数平方，所以对 15 次的单项式，它们会丢掉双精度的大部分有效数字。我们全程使用 Legendre 基。

### 步骤 2：容量曲线

用最小二乘（`np.linalg.lstsq`）拟合 0 到 15 次，并记录训练集和验证集上的均方根误差。训练误差不会随次数增加而上升，因为每个模型都包含前一个。验证误差是对拟合在新数据上表现的估计：它应当先降到最小值，然后上升。

```python
def rmse(a, b):
    return float(np.sqrt(np.mean((a - b) ** 2)))

def fit_ls(x, y, d):
    w, *_ = np.linalg.lstsq(phi(x, d), y, rcond=None)
    return w

degrees = list(range(16))
train_err, val_err = [], []
for d in degrees:
    w = fit_ls(x_tr, y_tr, d)
    train_err.append(rmse(phi(x_tr, d) @ w, y_tr))
    val_err.append(rmse(phi(x_va, d) @ w, y_va))

print(" degree  train RMSE  validation RMSE")
for d in degrees:
    print(f"{d:7d} {train_err[d]:11.3f} {val_err[d]:16.3f}")
print("best validation degree:", int(np.argmin(val_err)))
```

```output
 degree  train RMSE  validation RMSE
      0       0.850            0.769
      1       0.655            0.536
      2       0.648            0.540
      3       0.217            0.354
      4       0.217            0.354
      5       0.183            0.360
      6       0.181            0.360
      7       0.178            0.361
      8       0.173            0.364
      9       0.173            0.365
     10       0.163            0.367
     11       0.141            0.393
     12       0.141            0.393
     13       0.128            0.385
     14       0.123            0.434
     15       0.112            0.720
best validation degree: 4
```

训练 RMSE 随每一次升阶而下降，在 15 次时达到 0.11，远低于 0.3 的噪声水平：拟合正在追随噪声。验证 RMSE 在 3 次和 4 次时降到约 0.35，到 15 次时升至约 0.72。3 次与 4 次几乎相同，因为 $\sin(2\pi x)$ 关于 $x = \tfrac12$ 是奇函数：4 次加入的偶次 Legendre 项，在这个对称的设计上真实系数恰好为零，所以它只能去拟合噪声。

### 步骤 3：拟合曲线本身

左图在细网格上画出真实函数、数据以及 1 次、3 次和 15 次的拟合；右图画出 RMSE 曲线。1 次是一条穿过正弦波的直线（欠拟合），3 次跟得上它，15 次穿过几乎每个训练点，并在这些点之间振荡，两端附近的摆幅最大，因为那里 20 个点对多项式的约束最弱。这就是图 1.13。

```python
grid = np.linspace(0, 1, 201)
fig, axes = plt.subplots(1, 2, figsize=(11, 4.3))
axes[0].plot(grid, f(grid), "k", lw=1.5, label=r"true $\sin(2\pi x)$")
axes[0].plot(x_tr, y_tr, "o", color="grey", ms=4, label="20 training points")
for d, colour in [(1, "C0"), (3, "C2"), (15, "C3")]:
    axes[0].plot(grid, phi(grid, d) @ fit_ls(x_tr, y_tr, d), color=colour, label=f"degree {d}")
axes[0].set_ylim(-2.2, 2.2)
axes[0].set_xlabel("x")
axes[0].set_ylabel("y")
axes[0].set_title("Least-squares polynomial fits to 20 noisy points")
axes[0].legend(fontsize=8)

axes[1].plot(degrees, train_err, "o-", label="training")
axes[1].plot(degrees, val_err, "s-", label="validation (1,000 points)")
axes[1].axhline(SIGMA, color="k", ls="--", lw=1, label="noise level $\\sigma$ = 0.3")
axes[1].set_xlabel("polynomial degree")
axes[1].set_ylabel("RMSE")
axes[1].set_title("Training error falls; validation error turns up")
axes[1].legend(fontsize=8)
plt.tight_layout()
plt.show()
```

### 步骤 4：偏差²与方差，模拟与精确计算

对固定设计，在点 $x$ 处的期望平方误差如[第 8 节](#s8)那样分解为偏差² $+$ 方差 $+$ $\sigma^2$，其中偏差是（对训练集取平均的）平均预测与真值之间的差距，方差是预测围绕其平均值的离散程度。两者都可以通过模拟来估计：在相同的输入上抽取 $R = 200$ 组新的噪声，分别重新拟合，并在 201 个点的网格上取平均。

对固定设计上的最小二乘，还有一个精确答案。网格上的拟合值是目标值的线性函数，$\hat f_{\text{grid}} = \mathbf{S}\mathbf{y}$，其中**平滑矩阵**（smoother matrix）为 $\mathbf{S} = \boldsymbol{\Phi}_g(\boldsymbol{\Phi}^\top\boldsymbol{\Phi})^{-1}
\boldsymbol{\Phi}^\top$。用 QR 分解 $\boldsymbol{\Phi} = \mathbf{QR}$，它等于 $\boldsymbol{\Phi}_g\mathbf{R}^{-1}\mathbf{Q}^\top$，这样就避免了构造 $\boldsymbol{\Phi}^\top\boldsymbol{\Phi}$。平均预测为 $\mathbf{S}f(x_{\text{train}})$，所以偏差²是 $(\mathbf{S}f_{\text{train}} - f_{\text{grid}})^2$ 在网格上的均值，方差是 $\sigma^2$ 乘以 $\mathbf{S}^2$ 各行之和在网格上的均值。

```python
gen_mc = np.random.default_rng(1)
R_DRAWS = 200
noise = SIGMA * gen_mc.normal(size=(R_DRAWS, 20))
Y_sims = f(x_tr)[None, :] + noise                            # (200, 20): fresh targets, same x

def bias_var_mc(d):
    P, Pg = phi(x_tr, d), phi(grid, d)
    W, *_ = np.linalg.lstsq(P, Y_sims.T, rcond=None)         # (d+1, 200): one fit per draw
    preds = Pg @ W                                           # (201, 200)
    return np.mean((preds.mean(axis=1) - f(grid)) ** 2), np.mean(preds.var(axis=1))

def bias_var_exact(d):
    Q, Rm = np.linalg.qr(phi(x_tr, d))
    S = phi(grid, d) @ np.linalg.solve(Rm, Q.T)             # (201, 20) smoother matrix
    return np.mean((S @ f(x_tr) - f(grid)) ** 2), SIGMA**2 * np.mean(np.sum(S**2, axis=1))

print("        Monte Carlo (R = 200)          exact")
print("degree  bias^2  variance  total      bias^2  variance  total")
for d in [0, 1, 2, 3, 4, 5, 9, 12, 15]:
    b_m, v_m = bias_var_mc(d)
    b_e, v_e = bias_var_exact(d)
    print(f"{d:6d} {b_m:7.4f} {v_m:9.4f} {b_m + v_m + SIGMA**2:7.4f}  "
          f"{b_e:9.4f} {v_e:8.4f} {b_e + v_e + SIGMA**2:7.4f}")
```

```output
        Monte Carlo (R = 200)          exact
degree  bias^2  variance  total      bias^2  variance  total
     0  0.4975    0.0044  0.5919     0.4975   0.0045  0.5920
     1  0.2051    0.0084  0.3034     0.2051   0.0086  0.3037
     2  0.2051    0.0119  0.3070     0.2051   0.0124  0.3075
     3  0.0051    0.0154  0.1104     0.0052   0.0161  0.1113
     4  0.0051    0.0189  0.1140     0.0052   0.0198  0.1150
     5  0.0002    0.0226  0.1128     0.0000   0.0236  0.1136
     9  0.0002    0.0414  0.1316     0.0000   0.0422  0.1322
    12  0.0006    0.0742  0.1648     0.0000   0.0754  0.1654
    15  0.0022    0.9209  1.0130     0.0000   0.8737  0.9637
```

两块结果在方差上吻合到几个百分点以内。蒙特卡洛的偏差²比精确值大，原因在估计量本身：$R = 200$ 个带噪预测的平均值有它自己的采样方差，即 $\text{variance}/R$，对平均值取平方就把这一项加进了偏差²。在 15 次，方差为 0.87，预期的膨胀量是 $0.87/200 \approx 0.004$；这次运行显示的是 0.002，这在一个其方差集中在区间两端附近的量的波动范围之内，那里 201 个网格点中只有很少几个承载了它。那里精确的偏差²精确到四位小数为零，因为 15 次多项式几乎可以完美地在 20 个点上跟随 $\sin(2\pi x)$。相应地，15 次时蒙特卡洛的总和为 1.01，而精确值为 0.96。总和，即偏差² $+$ 方差 $+ \sigma^2$，就是新点上的期望平方误差：3 次时约为 0.111（RMSE 0.334，接近那一个验证集给出的 0.354），15 次时约为 0.96（RMSE 0.98）。偏差²成对下降（1 次与 2 次，然后 3 次与 4 次），原因就是步骤 2 中的奇函数性质。

方差随次数增长，起初缓慢，到 15 次时变得剧烈，那时 20 个点要拟合 16 个参数，模型几乎在做插值。对 20 个*训练*输入取平均，方差恰好是 $\sigma^2(d + 1)/N$，在 15 次时为 0.072；0.87 则是对包含两端的网格取平均，多项式在两端远离数据。

### 步骤 5：15 次的岭回归路径

保留 15 次的 16 个特征，不删除它们，而是收缩它们。岭回归最小化 $\frac{1}{N}\lVert\mathbf{y} - \boldsymbol\Phi\mathbf{w}\rVert^2 +
\lambda\lVert\mathbf{w}\rVert^2$，其解满足 $(\boldsymbol\Phi^\top\boldsymbol\Phi +
\lambda N\mathbf{I}')\mathbf{w} = \boldsymbol\Phi^\top\mathbf{y}$，其中 $\mathbf{I}'$ 是常数项位置为零的单位矩阵，这样截距不会被收缩。代码在 $10^{-10}$ 到 10 之间取 23 个 $\lambda$ 值扫描，并打印训练和验证 RMSE 以及 $\lVert\mathbf{w}\rVert$。这里 Legendre 基同样重要：若用标准化的单项式，惩罚项作用在尺度很差的列上，即使 $\lambda = 10^{-10}$ 也已经在做正则化，于是路径上过拟合的那一端永远不会出现。

```python
def fit_ridge(x, y, d, lam):
    P = phi(x, d)
    pen = np.eye(P.shape[1])
    pen[0, 0] = 0.0                                          # leave the constant term alone
    return np.linalg.solve(P.T @ P + lam * len(y) * pen, P.T @ y)

lams = np.logspace(-10, 1, 23)
path = []
print("      lambda  train RMSE  val RMSE   ||w||")
for lam in lams:
    w = fit_ridge(x_tr, y_tr, 15, lam)
    row = (lam, rmse(phi(x_tr, 15) @ w, y_tr), rmse(phi(x_va, 15) @ w, y_va),
           np.linalg.norm(w))
    path.append(row)
for i in range(0, 23, 2):
    print(f"{path[i][0]:12.2e} {path[i][1]:11.3f} {path[i][2]:9.3f} {path[i][3]:9.2f}")
best_val = min(path, key=lambda r: r[2])
print(f"best validation RMSE {best_val[2]:.3f} at lambda = {best_val[0]:.3f}")

fig, ax = plt.subplots(figsize=(6.5, 4.2))
ax.semilogx(lams, [r[1] for r in path], "o-", ms=3, label="training")
ax.semilogx(lams, [r[2] for r in path], "s-", ms=3, label="validation")
ax.axhline(SIGMA, color="k", ls="--", lw=1, label="noise level $\\sigma$")
ax.set_xlabel("regularisation strength $\\lambda$")
ax.set_ylabel("RMSE")
ax.set_title("Ridge path at degree 15: from interpolation to underfitting")
ax.legend()
plt.show()
```

```output
      lambda  train RMSE  val RMSE   ||w||
    1.00e-10       0.112     0.720      2.98
    1.00e-09       0.112     0.720      2.98
    1.00e-08       0.112     0.720      2.98
    1.00e-07       0.112     0.720      2.98
    1.00e-06       0.112     0.719      2.98
    1.00e-05       0.112     0.710      2.95
    1.00e-04       0.112     0.641      2.73
    1.00e-03       0.117     0.441      2.14
    1.00e-02       0.133     0.362      1.85
    1.00e-01       0.319     0.348      1.22
    1.00e+00       0.702     0.629      0.33
    1.00e+01       0.832     0.751      0.07
best validation RMSE 0.335 at lambda = 0.032
```

在最左端，惩罚几乎为零，拟合就是未正则化的 15 次拟合：训练 RMSE 接近 0.11，验证 RMSE 接近 0.72。随着 $\lambda$ 增大，权重收缩，训练误差上升而验证误差下降；$\lambda$ 很大时两者一起上升，因为模型被压平成常数。这与次数曲线上的 U 形相同，只是现在沿着一条连续的轴，更容易搜索。验证最小值约为 0.335，出现在 $\lambda = 0.03$ 附近，低于步骤 2 中未正则化的最佳次数（0.354）。

### 步骤 6：用交叉验证选择 λ

1,000 个点的验证集是一种奢侈。只有 20 个训练点时，诚实的做法只使用这些点：五折交叉验证，即把点打乱，切成五折，每折四个点，每一折轮流由在其余 16 个点上拟合的模型来预测。五个折误差的均值估计该 $\lambda$ 下的误差；它们的标准差除以 $\sqrt5$ 是一个粗略的标准误（[第 8 节](#s8)）。**一倍标准误规则**（one-standard-error rule）选择平均误差在最小值的一个标准误之内的最强惩罚。选定 $\lambda$ 之后，在全部 20 个点上重新拟合，并在 10,000 个点的测试集上只评估一次，同时评估未正则化的 3 次和 15 次作为对照。

```python
perm = np.random.default_rng(0).permutation(20)
folds = np.array_split(perm, 5)

def cv_scores(lam):
    errs = []
    for k in range(5):
        va = folds[k]
        tr = np.concatenate([folds[j] for j in range(5) if j != k])
        w = fit_ridge(x_tr[tr], y_tr[tr], 15, lam)
        errs.append(np.mean((phi(x_tr[va], 15) @ w - y_tr[va]) ** 2))
    return np.mean(errs), np.std(errs, ddof=1) / np.sqrt(5)

cv = np.array([cv_scores(lam) for lam in lams])
i_min = int(np.argmin(cv[:, 0]))
within = np.where(cv[:, 0] <= cv[i_min, 0] + cv[i_min, 1])[0]
i_1se = int(within.max())
print(f"CV minimum:  lambda = {lams[i_min]:.3f}, CV MSE {cv[i_min, 0]:.3f} "
      f"(standard error {cv[i_min, 1]:.3f})")
print(f"one-SE rule: lambda = {lams[i_1se]:.3f}")

w_cv = fit_ridge(x_tr, y_tr, 15, lams[i_min])
print(f"test RMSE, ridge degree 15 with CV lambda : {rmse(phi(x_te, 15) @ w_cv, y_te):.3f}")
for d in (3, 15):
    print(f"test RMSE, unregularised degree {d:2d}       : "
          f"{rmse(phi(x_te, d) @ fit_ls(x_tr, y_tr, d), y_te):.3f}")
```

```output
CV minimum:  lambda = 0.032, CV MSE 0.164 (standard error 0.041)
one-SE rule: lambda = 0.032
test RMSE, ridge degree 15 with CV lambda : 0.324
test RMSE, unregularised degree  3       : 0.348
test RMSE, unregularised degree 15       : 0.684
```

交叉验证选出的 $\lambda$ 接近上一步的验证最小值，尽管它只见过那 20 个训练点。重新拟合的岭回归模型在测试集上胜过最好的未正则化多项式，而未正则化的 15 次多项式则差了两倍多。收缩一个灵活的模型，可以比选择一个小模型做得更好，因为惩罚去掉了灵活模型的大部分方差，却没有带来小模型那样的偏差。测试集只在所有选择都完成之后碰了一次。

### 步骤 7：与库对照

scikit-learn 中的岭回归 `Ridge(alpha=...)` 最小化 $\lVert\mathbf{y} -
\mathbf{Xw}\rVert^2 + \alpha\lVert\mathbf{w}\rVert^2$，不带 $1/N$ 因子，所以 $\alpha =
\lambda N$。它自己拟合截距，且不对截距施加惩罚，所以给它的特征要去掉常数列。

```python
from sklearn.linear_model import Ridge

lam_c = lams[i_min]
w_mine = fit_ridge(x_tr, y_tr, 15, lam_c)
sk = Ridge(alpha=lam_c * 20, fit_intercept=True).fit(phi(x_tr, 15)[:, 1:], y_tr)
w_sk = np.append(sk.intercept_, sk.coef_)
print(f"largest coefficient difference from Ridge: {np.max(np.abs(w_mine - w_sk)):.1e}")
```

```output
largest coefficient difference from Ridge: 1.0e-15
```

两者在舍入误差内一致：本实验的闭式解就是库里的岭回归。

### 步骤 8：十倍的数据

用 $N = 200$ 个训练点重新跑一遍容量曲线，数据由同一个种子按同样的顺序生成。最小二乘拟合的方差按 $\sigma^2(d+1)/N$ 缩放，所以十倍的数据应当把它降到十分之一，灵活性的代价也随之降低。

```python
x_tr2, y_tr2, x_va2, y_va2, _, _ = make_data(200)
val2 = []
for d in degrees:
    w = fit_ls(x_tr2, y_tr2, d)
    val2.append(rmse(phi(x_va2, d) @ w, y_va2))
print(" degree  validation RMSE (N = 200)   (N = 20)")
for d in [0, 1, 3, 4, 5, 7, 9, 12, 15]:
    print(f"{d:7d} {val2[d]:20.3f} {val_err[d]:12.3f}")
print("best validation degree, N = 200:", int(np.argmin(val2)))
```

```output
 degree  validation RMSE (N = 200)   (N = 20)
      0                0.797        0.769
      1                0.541        0.536
      3                0.315        0.354
      4                0.315        0.354
      5                0.308        0.360
      7                0.310        0.361
      9                0.310        0.365
     12                0.311        0.393
     15                0.314        0.720
best validation degree, N = 200: 5
```

有 200 个点时，验证误差从 3 次或 4 次起达到约 0.31 的平台，略高于 0.3 的噪声水平，并且直到 15 次都保持在它的 0.01 以内（最小值 0.308 出现在 5 次）：灵活的模型不再受到惩罚，因为它们的方差分摊到了十倍多的点上。数据越多，就越负担得起灵活性，最佳次数也随之上移。这就是[第 8 节](#s8)学习曲线图景的缩影。

### 你应当看到什么

- 训练 RMSE 从不随次数增加而上升。验证 RMSE 降到约 0.35，到 15 次时升至 0.72。
- 偏差² $+$ 方差 $+ \sigma^2$ 在数据采样误差之内重现了验证 MSE。偏差²成对下降，因为 $\sin(2\pi x)$ 关于 $x = \tfrac12$ 是奇函数。
- 蒙特卡洛的偏差²比精确值大约 variance$/R$，而精确公式完全不需要模拟。
- 经过正则化的 15 次模型在测试集上胜过最好的小型未正则化模型：收缩一个灵活的模型，可以胜过选择一个小模型。
- 数据多十倍时，方差项约小十倍，灵活的模型不再受到惩罚。

### 动手试试

1. 对 15 次，使用原始单项式 $x^k$ 和正规方程 $\boldsymbol\Phi^\top\boldsymbol\Phi$，观察数据的微小扰动如何让解发生变化：$\kappa(\boldsymbol\Phi^\top\boldsymbol\Phi) = \kappa(\boldsymbol\Phi)^2$。
2. 画学习曲线：对 3 次和 9 次，$N$ 从 10 到 1,000 的期望训练和验证 MSE（图 1.15），对许多次噪声抽样取平均。
3. 把五折交叉验证换成留一法（$k = 20$），并比较所选的 $\lambda$ 和各折误差的离散程度。
4. 把固定设计换成 20 个均匀随机输入，对十次不同的抽样重复精确方差的计算：两端的空隙使 15 次多项式爆炸的频率有多高？
