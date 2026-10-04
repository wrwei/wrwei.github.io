## 实验 4 — 阻尼振子的物理信息神经网络：正问题、失败、修复与反问题 {#lab4}

**目标。** 你为一个精确解已知的问题构建[第 9 节](#s9)的物理信息神经网络，即阻尼振子

$$ u'' + 2\zeta\omega_0\, u' + \omega_0^2\, u = 0, \qquad u(0) = 1, \quad u'(0) = 0, $$

其中 $\omega_0 = 2\pi$ rad/s，$\zeta = 0.1$，区间为 $t \in [0, 2]$ s。由于精确解已知，你可以测量误差，失败也正因此才看得见。你先用显而易见的方式训练网络，看着它收敛到平凡解 $u = 0$：它精确满足方程，却完全不满足初始条件。然后你用两种方式修复它：改变损失权重，以及改变单位（第三种修复是把初始条件直接构建进网络，留作扩展）。最后你把 $\zeta$ 当作未知量，从十二个带噪声的读数中把它恢复出来，并与对闭式解做经典最小二乘拟合的结果比较。数据在实验中生成，无需下载，整个实验在笔记本电脑的 CPU 上大约运行三分钟（所示运行用时 190 s）。你需要 NumPy、SciPy、PyTorch 和 matplotlib。打印出的数字与你的结果在最后几位上可能不同。

### 步骤 1：问题及其精确解

当 $\zeta < 1$ 时，满足这两个初始条件的解为

$$ u(t) = e^{-\zeta\omega_0 t}\left(\cos\omega_d t + \frac{\zeta\omega_0}{\omega_d}\sin\omega_d t\right),
\qquad \omega_d = \omega_0\sqrt{1 - \zeta^2}. $$

你可以用这两个条件来检验它：在 $t = 0$ 处它等于 $1$，它在 $0$ 处的导数为 $-\zeta\omega_0 + \zeta\omega_0 = 0$。代码还确定了本实验的工作约定。线程数设为一：这么小的网络每一步的运算量太少，无法从多线程中获益，而单线程可以避免其他程序争抢核心时出现的严重减速（在一个原型中，机器空闲时无论线程数多少，每一步约需 1.2 ms；机器繁忙时用四个线程，每一步约需 30 ms）。误差指标是在 1,000 个测试时刻上的相对 L2 误差 $\lVert u_\theta - u\rVert_2 / \lVert u\rVert_2$，对于输出恒为零的网络，它等于 1。

```python
import time

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
from scipy.optimize import curve_fit

torch.manual_seed(0)
torch.set_num_threads(1)

ZETA, W0, T_END = 0.1, 2 * np.pi, 2.0


def exact(t, zeta=ZETA):
    """Closed-form solution of u'' + 2 zeta w0 u' + w0^2 u = 0, u(0) = 1, u'(0) = 0."""
    wd = W0 * np.sqrt(1.0 - zeta**2)
    return np.exp(-zeta * W0 * t) * (np.cos(wd * t) + (zeta * W0 / wd) * np.sin(wd * t))


def rel_l2(u_pred, u_true):
    return float(np.linalg.norm(u_pred - u_true) / np.linalg.norm(u_true))


t_test = np.linspace(0.0, T_END, 1000)
u_test = exact(t_test)
print(f"damped frequency {W0 * np.sqrt(1 - ZETA**2) / (2 * np.pi):.4f} Hz")
print(f"u(0) = {exact(0.0):.4f}, u(0.25 s) = {exact(0.25):.4f}, u(2 s) = {exact(2.0):.4f}")
print(f"largest |u| after 1 s: {np.abs(u_test[t_test > 1.0]).max():.4f}")

plt.figure(figsize=(7, 3.2))
plt.plot(t_test, u_test, color="black")
plt.xlabel("time t (s)")
plt.ylabel("displacement u")
plt.title("Exact solution: damped oscillator, w0 = 2 pi rad/s, zeta = 0.1")
plt.show()
```

```output
damped frequency 0.9950 Hz
u(0) = 1.0000, u(0.25 s) = 0.0926, u(2 s) = 0.2822
largest |u| after 1 s: 0.5318
```

振子在这个区间内完成两个周期，其包络衰减到初始幅值的约 29%。记住这两个事实：网络必须重现两次振荡，而它要重现的幅值量级为 1。

### 步骤 2：网络、它的导数与损失

网络 $u_\theta(t)$ 是一个多层感知机，有三个隐藏层，每层 32 个 tanh 单元。它把输入除以区间长度，使第一层看到的数总在 $[0, 1]$ 之内，无论采用什么单位。光滑的 tanh 很重要：残差需要网络的二阶导数，而 ReLU 网络的二阶导数几乎处处为零。

求导的辅助函数就是 PINN 的全部机制。`torch.autograd.grad` 对输出关于输入时间求导，`create_graph=True` 使导数本身仍然可微，这样它既可以再求一次导（得到 $u''$），由它构建的损失也可以对权重求导。方程的残差对任意系数 $c_1, c_2$ 写成 $u'' + c_1 u' + c_2 u$；有量纲问题中 $c_1 = 2\zeta\omega_0$、$c_2 = \omega_0^2$，步骤 6 会使用另一组系数。[第 9 节](#s9)的损失为

$$ \mathcal{L}(\theta) = \underbrace{\frac{1}{N}\sum_{i=1}^{N} r_\theta(t_i)^2}_{\text{残差}}
+ \lambda_{\text{ic}}\underbrace{\Big[(u_\theta(0) - 1)^2 + u_\theta'(0)^2\Big]}_{\text{初始条件}}, $$

其中 $N = 200$ 个配点（collocation points）均匀分布。`fit` 函数用学习率为 $10^{-3}$ 的 Adam 训练给定的步数，并在你指定的步上记录两个损失项、测试误差，以及测试时刻上最大的 $|u_\theta|$。

```python
class PINN(nn.Module):
    def __init__(self, t_scale, width=32):
        super().__init__()
        self.t_scale = t_scale  # input is divided by the interval length
        self.net = nn.Sequential(
            nn.Linear(1, width), nn.Tanh(),
            nn.Linear(width, width), nn.Tanh(),
            nn.Linear(width, width), nn.Tanh(),
            nn.Linear(width, 1),
        )

    def forward(self, t):
        return self.net(t / self.t_scale)


def d(u, t):
    """du/dt by autograd; create_graph keeps the result differentiable."""
    return torch.autograd.grad(u, t, torch.ones_like(u), create_graph=True)[0]


def loss_terms(model, t_col, t_zero, c1, c2):
    u = model(t_col)
    u_t = d(u, t_col)
    u_tt = d(u_t, t_col)
    residual = (u_tt + c1 * u_t + c2 * u).pow(2).mean()
    u0 = model(t_zero)
    initial = (u0 - 1.0).pow(2).mean() + d(u0, t_zero).pow(2).mean()
    return residual, initial


def fit(t_end, c1, c2, lam_ic, steps, log_at=(), lr=1e-3, seed=0):
    """Train a PINN; return the model and a log of (step, residual, ic, error, max|u|)."""
    torch.manual_seed(seed)
    model = PINN(t_end)
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    t_col = torch.linspace(0.0, t_end, 200).reshape(-1, 1).requires_grad_(True)
    t_zero = torch.zeros(1, 1, requires_grad=True)
    t_eval = torch.tensor(t_test / T_END * t_end, dtype=torch.float32).reshape(-1, 1)
    log, curve = [], []
    t0 = time.time()
    for step in range(steps + 1):
        residual, initial = loss_terms(model, t_col, t_zero, c1, c2)
        if step % 100 == 0 or step in log_at:
            with torch.no_grad():
                u_hat = model(t_eval).numpy().ravel()
            err = rel_l2(u_hat, u_test)
            curve.append((step, err))
            if step in log_at:
                log.append((step, residual.item(), initial.item(), err, np.abs(u_hat).max()))
        if step == steps:
            break
        loss = residual + lam_ic * initial
        opt.zero_grad()
        loss.backward()
        opt.step()
    ms = 1000 * (time.time() - t0) / steps
    return model, log, curve, ms


def show(log):
    print("  step   residual   ic term   rel. L2 error   max|u|")
    for step, res, ic, err, umax in log:
        print(f"{step:6d}   {res:8.2e}   {ic:7.4f}   {err:13.4f}   {umax:6.4f}")


# one forward pass at initialisation: the sizes of the two loss terms
model0 = PINN(T_END)
t_col0 = torch.linspace(0.0, T_END, 200).reshape(-1, 1).requires_grad_(True)
t_zero0 = torch.zeros(1, 1, requires_grad=True)
res0, ic0 = loss_terms(model0, t_col0, t_zero0, 2 * ZETA * W0, W0**2)
print(f"at initialisation: residual {res0.item():.2f}, initial conditions {ic0.item():.2f}")
print(f"parameters: {sum(p.numel() for p in model0.parameters())}")
```

```output
at initialisation: residual 52.46, initial conditions 1.36
parameters: 2209
```

还没有任何训练，残差项就已经比初始条件项大约四十倍。这并不是初始化的偶然结果。方程中含有 $\omega_0^2 \approx
39.5$，所以 $u$ 上一个单位的误差会带来量级为 40 的残差、量级为 1,500 的残差平方，而 $u(0)$ 上同样一个单位的误差只带来 1。两项所处的尺度相差三个数量级，优化器跟着大的那一项走。

### 步骤 3：显而易见的损失，以及平凡解

现在在问题本身的单位下训练，两项权重相等（$\lambda_{\text{ic}} =
1$），训练 3,000 步。使用有量纲的系数和区间 $[0, 2]$。

```python
C1_DIM, C2_DIM = 2 * ZETA * W0, W0**2
model_a, log_a, curve_a, ms = fit(T_END, C1_DIM, C2_DIM, 1.0, 3000, log_at=(0, 1000, 3000))
show(log_a)
print(f"{ms:.1f} ms per step")

with torch.no_grad():
    u_a = model_a(torch.tensor(t_test, dtype=torch.float32).reshape(-1, 1)).numpy().ravel()
plt.figure(figsize=(7, 3.2))
plt.plot(t_test, u_test, color="black", label="exact")
plt.plot(t_test, u_a, color="tab:red", label="PINN, lambda_ic = 1")
plt.xlabel("time t (s)")
plt.ylabel("displacement u")
plt.title("Dimensional units, equal weights: the trivial solution")
plt.legend()
plt.show()
```

```output
  step   residual   ic term   rel. L2 error   max|u|
     0   5.25e+01    1.3626          1.0914   0.1951
  1000   3.14e-03    0.9922          0.9993   0.0039
  3000   5.92e-03    0.9877          0.9986   0.0063
5.1 ms per step
```

损失降到了一个很小的数，答案却是错的。残差项很小，初始条件项几乎没有离开它约为 1 的初始值，网络输出的是一条大小约 0.01 的曲线，与振荡毫无关系。相对误差接近 1。这就是[第 9 节](#s9)所述失败模式最纯粹的形式：$u \equiv 0$ 是该微分方程的一个解，所以把网络“关掉”就能把残差压到零；而初始条件是区分所要的解与零解的唯一依据，它们的梯度太弱，抵挡不住。打印出的损失中没有任何迹象提醒你，只有与已知答案（或与测量值）比较才能发现。

### 步骤 4：彻底去掉初始条件

为了确认初始条件是唯一的屏障，令 $\lambda_{\text{ic}} = 0$。这时已经没有任何东西能把所要的解与零区分开来。

```python
model_b, log_b, curve_b, _ = fit(T_END, C1_DIM, C2_DIM, 0.0, 3000, log_at=(0, 3000))
show(log_b)
```

```output
  step   residual   ic term   rel. L2 error   max|u|
     0   5.25e+01    1.3626          1.0914   0.1951
  3000   5.07e-06    1.0002          1.0000   0.0001
```

残差降到约 $5\times10^{-6}$，比上一次运行低三个数量级，网络的幅值量级为 $10^{-4}$。误差为 1.000：网络找到的恰恰是残差为零的函数中最容易找到的那一个。一个适定问题需要它的条件，而一个不让条件成为硬性要求的损失存在平凡的极小值。

### 步骤 5：第一种修复，给条件一个大权重

把 $\lambda_{\text{ic}}$ 提高到 100，使网络以关键方式出错时两项的大小相当，并训练 10,000 步。训练更长，是因为这个问题比看上去更难：要用一个起初几乎平坦的函数去拟合衰减振荡的两个周期。

```python
model_c, log_c, curve_c, _ = fit(
    T_END, C1_DIM, C2_DIM, 100.0, 10000, log_at=(0, 1000, 5000, 10000)
)
show(log_c)
```

```output
  step   residual   ic term   rel. L2 error   max|u|
     0   5.25e+01    1.3626          1.0914   0.1951
  1000   5.24e+00    0.0086          0.3306   0.9071
  5000   1.07e-01    0.0000          0.0152   0.9973
 10000   1.89e-02    0.0000          0.0039   0.9992
```

权重起了作用，但很慢：1,000 步后误差仍为 33%，5,000 步后约 1.5%，10,000 步后 0.4%。残差项在数千步内一直远高于零，说明优化器在两项之间被拉扯得多么厉害。代价是多了一个超参数。这里选 100，是因为我们在权重为 1 时看到了失败；而当解未知时，没有误差可看，权重只能通过试错或自适应方案来确定（见[第 9 节](#s9)）。

### 步骤 6：第二种修复，无量纲化

更深层的原因在于单位。定义无量纲时间 $\hat t = \omega_0 t$，对我们的区间，它的取值范围是 $[0, 4\pi]$。由链式法则得 $\mathrm{d}/\mathrm{d}t = \omega_0\,
\mathrm{d}/\mathrm{d}\hat t$，于是

$$ \omega_0^2\, u_{\hat t\hat t} + 2\zeta\omega_0^2\, u_{\hat t} + \omega_0^2\, u = 0
\quad\Longleftrightarrow\quad u_{\hat t\hat t} + 2\zeta\, u_{\hat t} + u = 0, $$

初始条件不变，仍为 $u(0) = 1$ 和 $u_{\hat t}(0) = 0$。现在系数为 $c_1 = 2\zeta = 0.2$ 和 $c_2 = 1$，所有项的量级都是 1，残差项与初始条件项无需任何手工调节的权重就大小相当。网络相同，权重回到 1，变的只是坐标。

```python
C1_ND, C2_ND = 2 * ZETA, 1.0
model_d, log_d, curve_d, ms = fit(
    4 * np.pi, C1_ND, C2_ND, 1.0, 10000, log_at=(0, 2500, 5000, 7500, 10000)
)
show(log_d)
print(f"{ms:.1f} ms per step")
```

```output
  step   residual   ic term   rel. L2 error   max|u|
     0   3.37e-02    1.3623          1.0914   0.1951
  2500   4.67e-03    0.0000          0.3892   0.9946
  5000   2.84e-04    0.0000          0.0603   1.0004
  7500   4.35e-07    0.0000          0.0004   1.0002
 10000   9.52e-06    0.0000          0.0073   1.0039
4.8 ms per step
```

现在初始残差是 0.034 而不是 52，所以步骤 2 中的失衡消失了，甚至反了过来：初始条件项（1.36）现在是较大的一项，优化器先满足它，再去拟合振荡。训练在开始阶段并没有更快（2,500 步后误差为 0.39，5,000 步后为 0.06，而加权运行在 5,000 步时为 0.015），但它持续改进，在 7,500 步时达到 0.0004，比加权运行的最终值 0.0039 低十倍，而且不需要调节任何权重。它并没有停留在那里。在第 10,000 步，打印出的误差为 0.0073，因为固定学习率 $10^{-3}$ 的 Adam 不断把网络从极小值附近踢开：在本实验一个打印了 `curve_d` 的副本中，每 100 步记录一次的误差在第 6,000 步之后在约 0.0001 和 0.016 之间跳动，最低值（0.00006）出现在第 8,700 步。加权运行同样会振荡，在最后 1,000 步内介于 0.004 和 0.013 之间。常用的补救办法是使用衰减的学习率，或按某个验证指标保留最好的检查点；这里要说明的是，无量纲形式不用权重就能达到很低的误差。（两次运行的残差不能直接比较，因为两个方程相差一个因子 $\omega_0^2$。）这个教训具有普遍性，不局限于这个方程：在动用损失平衡方案之前，先把方程写成各项量级都为 1 的形式。

三次运行中记录的收敛曲线直接展示了这一点。

```python
fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
for curve, label, colour in [
    (curve_a, "dimensional, weight 1", "tab:red"),
    (curve_c, "dimensional, weight 100", "tab:orange"),
    (curve_d, "non-dimensional, weight 1", "tab:blue"),
]:
    steps_, errs = zip(*curve)
    ax[0].semilogy(steps_, errs, label=label, color=colour)
ax[0].set_xlabel("training step")
ax[0].set_ylabel("relative L2 error")
ax[0].set_title("Error against the exact solution")
ax[0].legend()

with torch.no_grad():
    u_d = model_d(torch.tensor(W0 * t_test, dtype=torch.float32).reshape(-1, 1))
ax[1].plot(t_test, u_test, color="black", label="exact")
ax[1].plot(t_test, u_d.numpy().ravel(), "--", color="tab:blue", label="PINN, non-dimensional")
ax[1].set_xlabel("time t (s)")
ax[1].set_ylabel("displacement u")
ax[1].set_title("The repaired network")
ax[1].legend()
plt.tight_layout()
plt.show()
```

### 步骤 7：反问题

现在阻尼比未知。在 $[0, 2]$ s 内的随机时刻，由 $\zeta = 0.1$ 的精确解加上标准差为 0.02 的高斯噪声，生成十二个位移读数，就像由加速度计数据得到的十二个样本那样。网络与步骤 6 一样是无量纲的。未知量作为一个可训练的标量进入残差，参数化为 $\log\zeta$ 以保证它为正，初始值为 $\zeta = 0.5$，比真值大五倍。损失中加入一个数据项，即读数处均方误差的十倍；权重 10 表示：对读数的信任程度，略高于对单个配点上满足物理方程的要求。网络权重和 $\log\zeta$ 由同一个 Adam 一起优化。

```python
g = torch.Generator().manual_seed(1)
t_meas = T_END * torch.rand(12, generator=g)
y_meas = torch.tensor(exact(t_meas.numpy()), dtype=torch.float32) + 0.02 * torch.randn(
    12, generator=g
)
th_meas = (W0 * t_meas).reshape(-1, 1)  # readings in the non-dimensional time


def fit_inverse(steps=10000, lr=1e-3, seed=0, w_data=10.0):
    torch.manual_seed(seed)
    model = PINN(4 * np.pi)
    log_zeta = nn.Parameter(torch.log(torch.tensor(0.5)))
    opt = torch.optim.Adam(list(model.parameters()) + [log_zeta], lr=lr)
    t_col = torch.linspace(0.0, 4 * np.pi, 200).reshape(-1, 1).requires_grad_(True)
    t_zero = torch.zeros(1, 1, requires_grad=True)
    t_eval = torch.tensor(W0 * t_test, dtype=torch.float32).reshape(-1, 1)
    path = []
    for step in range(steps + 1):
        zeta = log_zeta.exp()
        residual, initial = loss_terms(model, t_col, t_zero, 2 * zeta, 1.0)
        data = (model(th_meas).squeeze(1) - y_meas).pow(2).mean()
        if step % 1000 == 0:
            with torch.no_grad():
                err = rel_l2(model(t_eval).numpy().ravel(), u_test)
            path.append((step, zeta.item(), err))
        if step == steps:
            break
        loss = residual + initial + w_data * data
        opt.zero_grad()
        loss.backward()
        opt.step()
    return model, zeta.item(), path


model_e, zeta_hat, path = fit_inverse()
print("  step   zeta    solution error")
for step, z, err in path:
    print(f"{step:6d}   {z:.4f}   {err:.4f}")
print(f"recovered zeta = {zeta_hat:.4f} (true {ZETA})")
```

```output
  step   zeta    solution error
     0   0.5000   1.0914
  1000   0.4235   0.2269
  2000   0.2372   0.1180
  3000   0.1736   0.0806
  4000   0.1400   0.0599
  5000   0.1201   0.0473
  6000   0.1087   0.0345
  7000   0.1030   0.0305
  8000   0.1007   0.0169
  9000   0.0996   0.0181
 10000   0.0987   0.0192
recovered zeta = 0.0987 (true 0.1)
```

估计值从高出五倍的位置出发，到第 5,000 步降到 0.12，最终稳定在 0.0987，比真值 0.1 低 1.3%。解的误差最终约为 0.019。在均方根值为 0.44 的信号上，0.02 的噪声相当于十二个读数处约 0.046 的相对误差，所以网络给出的解比读数本身更接近真值：方程滤掉了噪声。十二个读数加一个方程就够了，因为方程提供了曲线的形状，读数只需要确定一个数。解的误差没有步骤 6 的最好结果（0.0004）那么小，是因为数据项把网络拉向带噪声的点。

### 步骤 8：经典基线

对于一个有闭式解的单参数反问题，公允的比较对象是用同样的读数对闭式解做最小二乘拟合。`curve_fit` 最小化 `exact(t, zeta)` 与读数之差的平方，并根据拟合的曲率给出不确定度。

```python
popt, pcov = curve_fit(
    lambda t, z: exact(t, z), t_meas.numpy(), y_meas.numpy(), p0=[0.5], bounds=(0.01, 0.99)
)
print(f"curve_fit: zeta = {popt[0]:.4f} +/- {np.sqrt(pcov[0, 0]):.4f}")
print(f"PINN:      zeta = {zeta_hat:.4f}")

fig, ax = plt.subplots(1, 2, figsize=(10, 3.6))
ax[0].plot(t_test, u_test, color="black", label="exact (zeta = 0.1)")
with torch.no_grad():
    u_e = model_e(torch.tensor(W0 * t_test, dtype=torch.float32).reshape(-1, 1)).numpy()
ax[0].plot(t_test, u_e.ravel(), "--", color="tab:blue", label="PINN, inverse problem")
ax[0].scatter(t_meas.numpy(), y_meas.numpy(), color="tab:red", zorder=3, label="12 readings")
ax[0].set_xlabel("time t (s)")
ax[0].set_ylabel("displacement u")
ax[0].set_title("Twelve noisy readings and the recovered solution")
ax[0].legend()
steps_p, zetas, _ = zip(*path)
ax[1].plot(steps_p, zetas, "o-", color="tab:blue", label="PINN estimate")
ax[1].axhline(ZETA, color="black", label="true value")
ax[1].axhline(popt[0], color="tab:green", linestyle="--", label="curve_fit")
ax[1].set_xlabel("training step")
ax[1].set_ylabel("damping ratio zeta")
ax[1].set_title("The estimate of zeta during training")
ax[1].legend()
plt.tight_layout()
plt.show()
```

```output
curve_fit: zeta = 0.0977 +/- 0.0015
PINN:      zeta = 0.0987
```

两个估计值 0.0977 和 0.0987 相差约为拟合自身标准误差 0.0015 的三分之二，而真值 0.1 与最小二乘估计相差约 1.5 个标准误差：两者都与真值一致，彼此也一致。这是正确的结论，而不是令人失望的结论。当解是只含一个未知量的闭式解时，最小二乘拟合更快，能给出误差棒，也不会陷入平凡解。PINN 的价值在没有闭式解时才体现出来：非线性方程、不规则几何、作为空间场的未知量。本实验的价值在于，你在一个小到可以核对的问题上看到了每一步。

### 你应该看到什么

- 在有量纲单位下，残差项一开始约比初始条件项大 40 倍（52.5 对 1.4）。权重相等时，优化器把网络推向几乎为零：损失很小（残差 0.006），相对误差却是 0.999。没有初始条件时结果相同，残差为 $5\times10^{-6}$。平凡解精确满足方程。
- 给初始条件加权 100 可以修复它（10,000 步后误差 0.0039）；无量纲化不用权重也能修复它，因为方程各项的量级都是 1，而且能达到更低的误差（7,500 步时 0.0004），只是在固定学习率下误差会来回跳动，在 10,000 步时读数为 0.0073。
- 反问题从十二个带噪声的读数中恢复出 $\zeta = 0.0987$，与真值相差 1.3% 以内，并与对闭式解的最小二乘拟合（0.0977 $\pm$ 0.0015）一致。有闭式解时就用闭式解；没有闭式解时，PINN 才物有所值。
- 通过自动微分求二阶导数需要多次前向和反向传播，但这个网络每一步只需约 5 ms，所以整个实验在 CPU 上大约三分钟就能跑完。开销在于步数（达到 0.0004 需要 7,500 步），而不在于每一步。

### 动手试试

1. **硬约束。** 把初始条件构建进网络，$u_\theta(t) = 1 + (t/t_{\text{end}})^2\,N_\theta(t)$：无论 $N_\theta$ 是什么，它在 $t = 0$ 处都等于 1，且导数为零。去掉初始条件项，在有量纲单位下训练 10,000 步。平凡解不再可能出现，所以步骤 3 的失败不会发生。误差是否仍然很大？为什么？（尺度问题并没有消失。）
2. **谱偏差。** 令 $\omega_0 = 8\pi$（2 s 内有八个周期），再次训练无量纲形式；网络现在需要八次振荡。然后加入傅里叶特征 $[\sin k\hat t, \cos k\hat t]$（$k = 1, 2, 4$）作为额外输入，比较两次运行。为什么输入量级为 1 的 tanh 网络难以处理高频？
3. **从常微分方程到偏微分方程。** 练习 [e12](#e12) 从这段代码出发，转向热传导方程，那里的配点变成空间和时间上的网格。

## 实验 5 — 在无标签振动信号上做对比预训练 {#lab5}

**目标。** 你在机器振动窗口上用[第 11 节](#s11)的 InfoNCE 损失预训练一个编码器，训练中从不向它展示这些窗口的标签，然后用线性探测（linear probe）衡量预训练带来了什么：一个只用每类 5、20 或 100 个有标签窗口训练的逻辑回归。比较对象是工程师首先会尝试的两样东西，即原始波形及其频谱幅值，以及一个从未训练过的编码器。随后你逐一去掉数据增强，看着表示变差，这正是本实验的要点：在对比学习中，数据增强就是监督。振动数据在实验中生成（四个类别，随机相位），所以无需下载，整个实验在笔记本电脑的 CPU 上运行一到两分钟。你需要 NumPy、scikit-learn、PyTorch 和 matplotlib。打印出的数字与你的结果在最后几位上可能不同。

### 步骤 1：振动窗口生成器

真实的旋转机械会用加速度计记录。这里一个窗口是以 256 Hz 采样的一秒钟，即 256 个样本，对应一根以转速 $f_r$ 旋转的轴，$f_r$ 在 9 到 11 Hz 之间均匀抽取。四个类别的区别在于它们包含 $f_r$ 的哪些谐波：

| 类别 | 信号（加噪声前） |
|---|---|
| 0 健康 | $1.0\sin(2\pi f_r t + \varphi_1) + 0.2\sin(2\pi\,2 f_r t + \varphi_2)$ |
| 1 不平衡 | 同上，但 1x 幅值提高到 2.5 |
| 2 不对中 | 1x、2x 和 3x 分量，幅值分别为 1.0、1.5 和 0.5 |
| 3 轴承缺陷 | 健康信号，加上以 $3.57 f_r$ 重复的冲击，每次冲击是一个幅值为 1.5、按 $e^{-30\tau}$ 衰减的 60 Hz 振荡 |

所有相位都是随机的，传感器增益在 0.8 到 1.2 上均匀分布，并加上标准差为 0.3 的高斯噪声。随机相位是这个问题的核心。当窗口从周期中任意时刻开始时，真实的记录就是这个样子；这也意味着同一类别的两个窗口*没有*任何共同的样本值。标签取决于各谐波的幅值，而不取决于相位。

冲击序列由距上一次冲击的时间 $\tau$ 构建，它等于 $(t - t_0)$ 对冲击周期 $1/(3.57 f_r)$ 取模；这样只用一行向量化代码，就能得到每次冲击之后完整的衰减振荡。

```python
import time

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix
from sklearn.preprocessing import StandardScaler

np.random.seed(0)
torch.manual_seed(0)
rng = np.random.default_rng(0)

FS, N_SAMPLES = 256, 256
T = np.arange(N_SAMPLES) / FS
CLASS_NAMES = ["healthy", "imbalance", "misalignment", "bearing defect"]


def make_windows(n, rng):
    labels = rng.integers(0, 4, size=n)
    f_r = rng.uniform(9.0, 11.0, size=(n, 1))
    ph = rng.uniform(0.0, 2 * np.pi, size=(n, 3))

    def wave(k, i):  # k-th harmonic of the shaft speed with its own random phase
        return np.sin(2 * np.pi * k * f_r * T + ph[:, i:i + 1])

    amp = np.array([[1.0, 0.2, 0.0],      # healthy: amplitudes of 1x, 2x, 3x
                    [2.5, 0.2, 0.0],      # imbalance
                    [1.0, 1.5, 0.5],      # misalignment
                    [1.0, 0.2, 0.0]])[labels]  # bearing defect: healthy + impulses
    x = amp[:, 0:1] * wave(1, 0) + amp[:, 1:2] * wave(2, 1) + amp[:, 2:3] * wave(3, 2)
    period = 1.0 / (3.57 * f_r)
    t0 = rng.uniform(0.0, 1.0, size=(n, 1)) * period
    tau = np.mod(T - t0, period)  # time since the most recent impulse
    impulses = 1.5 * np.exp(-30.0 * tau) * np.sin(2 * np.pi * 60.0 * tau)
    x = x + (labels == 3)[:, None] * impulses
    x = x * rng.uniform(0.8, 1.2, size=(n, 1)) + 0.3 * rng.standard_normal((n, N_SAMPLES))
    return x.astype(np.float32), labels


X_pool, y_pool = make_windows(4000, rng)  # pretraining pool; labels kept aside
X_test, y_test = make_windows(2000, rng)
print(X_pool.shape, X_test.shape)
print("class counts in the pool:", np.bincount(y_pool))
print(f"signal standard deviation {X_pool.std():.3f}")

fig, axes = plt.subplots(2, 4, figsize=(13, 4.8))
spec_axis = np.fft.rfftfreq(N_SAMPLES, 1 / FS)
for c in range(4):
    x = X_pool[np.flatnonzero(y_pool == c)[0]]
    axes[0, c].plot(T, x, color="black", linewidth=0.8)
    axes[0, c].set_title(CLASS_NAMES[c])
    axes[0, c].set_xlabel("time (s)")
    axes[1, c].plot(spec_axis, np.abs(np.fft.rfft(x)) / N_SAMPLES * 2, color="tab:blue")
    axes[1, c].set_xlabel("frequency (Hz)")
    axes[1, c].set_xlim(0, 128)
axes[0, 0].set_ylabel("acceleration (a.u.)")
axes[1, 0].set_ylabel("spectral magnitude")
fig.suptitle("One window of each class (top) and its magnitude spectrum (bottom)")
plt.tight_layout()
plt.show()
```

```output
(4000, 256) (2000, 256)
class counts in the pool: [ 986  985  991 1038]
signal standard deviation 1.306
```

先看频谱再看波形，并注意各纵轴的刻度不同。健康窗口在约 $f_r$ 处有一个峰，在 $2f_r$ 处有一个小峰。不平衡窗口在 $f_r$ 处的峰更高（1x 幅值大 2.5 倍，不过由于窗口里不是整数个周期，频谱泄漏也会降低峰高）。不对中窗口的最大峰在 $2f_r$ 处，在 $3f_r$ 处还有第三个峰。轴承缺陷窗口多出一排位于冲击频率 $3.57 f_r$ 整数倍处的梳状峰，在这个窗口中靠近 39 和 78 Hz。在时域里，这些类别很难用肉眼区分，而且相位在窗口之间各不相同。频谱是工程师习惯计算的东西，步骤 3 把它们用作基线。

### 步骤 2：探测协议

表示的质量，用一个*线性*分类器在标签很少时在它上面的表现来衡量。线性探测无法通过学习表示的某个巧妙非线性函数来弥补一个糟糕的表示，所以它的准确率反映的是特征本身。对每类 5、20 和 100 个窗口这三种标签预算，辅助函数从池中为每类抽取这么多有标签窗口，用不同的抽取重复五次，在每次抽取上拟合一个经过标准化的逻辑回归，并对 2,000 个测试窗口上的准确率求平均。在每类 5 个标签时，五次抽取很重要，因为单独一次抽取的 20 个窗口可能运气不好。

```python
BUDGETS = (5, 20, 100)


def probe(feat_pool, feat_test, budgets=BUDGETS, n_draws=5, seed=0, return_model=False):
    """Mean test accuracy of a logistic regression on a few labelled windows per class."""
    draw_rng = np.random.default_rng(seed)
    accs, last = [], None
    for n_per_class in budgets:
        scores = []
        for _ in range(n_draws):
            idx = np.concatenate([
                draw_rng.choice(np.flatnonzero(y_pool == c), n_per_class, replace=False)
                for c in range(4)
            ])
            scaler = StandardScaler().fit(feat_pool[idx])
            clf = LogisticRegression(max_iter=5000).fit(scaler.transform(feat_pool[idx]),
                                                         y_pool[idx])
            pred = clf.predict(scaler.transform(feat_test))
            scores.append((pred == y_test).mean())
            last = pred
        accs.append(float(np.mean(scores)))
    return (accs, last) if return_model else accs


def fmt(accs):
    return "  ".join(f"{a:.3f}" for a in accs)

```

### 步骤 3：基线

三条基线给出了门槛。第一条是在 256 个原始样本上的逻辑回归。第二条是在 129 个 FFT 幅值上的逻辑回归：这是旋转机械的经典特征，按构造就丢弃了相位。第三条是步骤 5 的编码器在*任何*训练之前、权重随机时的结果：随机网络是一个信息量出奇丰富的特征提取器，任何声称预训练有帮助的说法都必须胜过它。

```python
acc_raw = probe(X_pool, X_test)
fft_pool = np.abs(np.fft.rfft(X_pool, axis=1)).astype(np.float32)
fft_test = np.abs(np.fft.rfft(X_test, axis=1)).astype(np.float32)
acc_fft = probe(fft_pool, fft_test)
print(f"raw waveform (256 features):   {fmt(acc_raw)}")
print(f"FFT magnitude (129 features):  {fmt(acc_fft)}")


class Encoder(nn.Module):
    """h = f(x) is the representation kept after pretraining; z = g(h) feeds the loss."""

    def __init__(self, d_in=256, d_hidden=256, d_h=128, d_z=64):
        super().__init__()
        self.f = nn.Sequential(nn.Linear(d_in, d_hidden), nn.ReLU(), nn.Linear(d_hidden, d_h))
        self.g = nn.Sequential(nn.ReLU(), nn.Linear(d_h, d_z))  # projection head

    def forward(self, x):
        h = self.f(x)
        return h, F.normalize(self.g(h), dim=1)


def embed(model, X):
    with torch.no_grad():
        h, z = model(torch.from_numpy(X))
    return h.numpy(), z.numpy()


torch.manual_seed(0)
untrained = Encoder()
h_pool0, _ = embed(untrained, X_pool)
h_test0, _ = embed(untrained, X_test)
acc_untrained = probe(h_pool0, h_test0)
print(f"untrained encoder, h (128):    {fmt(acc_untrained)}")
```

```output
raw waveform (256 features):   0.371  0.448  0.473
FFT magnitude (129 features):  0.850  0.899  0.974
untrained encoder, h (128):    0.532  0.738  0.895
```

可以看出三个事实。原始波形远远落后于其他两者：在相位随机时，256 个样本的任何固定线性组合都无法识别类别，这正是上面陈述的问题。FFT 幅值要好得多，因为幅值不依赖于相位，但在每类 5 个标签时，它们只达到约 0.85，与步骤 6 中最好的表示之间的差距也在这里最大。未训练的网络已经优于原始波形，因为信号的随机非线性特征在一定程度上对相位不敏感；但在每类 5 个标签时它仍远低于 FFT（0.53 对 0.85），而它就是训练后的编码器必须越过的门槛。

### 步骤 4：损失

损失是 InfoNCE 的 NT-Xent 形式（[第 11 节](#s11)）。一个含 $B$ 个窗口的 batch 给出 $2B$ 个视图，即每个窗口的两个增强版本。设 $\mathbf{z}_1, \dots, \mathbf{z}_{2B}$ 是它们经过 L2 归一化的嵌入，于是点积就是余弦相似度。对于视图 $i$，设其孪生视图为 $j(i)$，损失为

$$ \ell_i = -\log\frac{\exp(\mathbf{z}_i^\top\mathbf{z}_{j(i)}/\tau)}
{\sum_{k\ne i}\exp(\mathbf{z}_i^\top\mathbf{z}_k/\tau)}, $$

这是在其余 $2B - 1$ 个视图上的交叉熵，孪生视图是正确的类别。在代码中，这是一次矩阵乘法、把对角线设为 $-\infty$（一个视图永远不是它自己的候选），再以孪生视图的索引为目标调用 `F.cross_entropy`。温度 $\tau$ 去除相似度：$\tau$ 越小，softmax 越尖锐，对最难的负样本惩罚越重。

合理性检查复用[第 11 节](#s11)的算例：一个锚点与正样本和三个负样本的相似度为 $(0.9, 0.2, 0.1, -0.3)$。在 $\tau = 1$ 时，softmax 几乎是平的，损失为 0.81；在 $\tau = 0.1$ 时，正样本占主导，损失为 0.0013。

```python
def nt_xent(z1, z2, tau):
    """InfoNCE over 2B views; z1[i] and z2[i] are two views of window i (unit vectors)."""
    b = z1.shape[0]
    z = torch.cat([z1, z2], dim=0)                     # 2B x d
    logits = z @ z.T / tau                             # 2B x 2B cosine similarities / tau
    logits.fill_diagonal_(float("-inf"))               # a view is not its own negative
    target = torch.cat([torch.arange(b, 2 * b), torch.arange(0, b)])  # index of the twin
    return F.cross_entropy(logits, target)


sims = torch.tensor([[0.9, 0.2, 0.1, -0.3]])
for tau in (1.0, 0.1):
    print(f"tau = {tau}: loss {F.cross_entropy(sims / tau, torch.tensor([0])).item():.4f}")

# Collapse check: identical embeddings for every view give log(2B - 1).
B = 256
collapsed = F.normalize(torch.ones(B, 64), dim=1)
print(f"collapsed embeddings: {nt_xent(collapsed, collapsed, 0.2).item():.4f}")
print(f"log(2B - 1) = log({2 * B - 1}) = {np.log(2 * B - 1):.4f}")
```

```output
tau = 1.0: loss 0.8096
tau = 0.1: loss 0.0013
collapsed embeddings: 6.2364
log(2B - 1) = log(511) = 6.2364
```

坍塌值是一个不携带任何信息的表示的损失：每个候选看起来都一样，所以 softmax 在 $2B - 1 = 511$ 个视图上是均匀的，损失为 $\log 511$。训练必须把损失降到远低于这个数；如果损失停在它附近，说明编码器已经坍塌，或者数据增强破坏性太强。

### 步骤 5：数据增强与预训练循环

每个视图由三个随机操作生成，选择它们是为了说明哪些东西对表示来说*不应*有影响：随机若干个样本的**循环时移**（窗口起点是任意的，所以相位不应有影响）、在 0.8 到 1.25 之间按对数均匀分布抽取的**增益**（传感器灵敏度不应有影响），以及标准差为 0.1 的**附加噪声**。时移用 `torch.gather` 实现，使 batch 中每个窗口都有自己的时移量。循环时移几乎完全保留频谱的幅值，而改变相位，这正是我们想教给模型的不变性（环绕把窗口的末尾接到了开头，这是一个小的伪影，真实的流水线会从更长的记录中截取窗口来避免它）。

编码器就是步骤 3 中构建的那个。训练使用 $B = 256$ 的 batch（于是每个视图有一个孪生视图，以及来自其他窗口的 $2B - 2 = 510$ 个视图作为负样本），学习率为 $10^{-3}$ 的 Adam，$\tau = 0.2$，在 4,000 个池窗口上训练 60 个轮次：每个轮次 15 个 batch，共 900 步。不使用标签。

```python
def augment(x, gen, shift=True, gain=True, noise=True):
    b, n = x.shape
    if shift:
        s = torch.randint(0, n, (b, 1), generator=gen)
        idx = (torch.arange(n).unsqueeze(0) + s) % n
        x = torch.gather(x, 1, idx)
    if gain:
        x = x * torch.exp(torch.empty(b, 1).uniform_(np.log(0.8), np.log(1.25), generator=gen))
    if noise:
        x = x + 0.1 * torch.randn(x.shape, generator=gen)
    return x


def pretrain(seed=0, epochs=60, batch=256, tau=0.2, lr=1e-3, **aug):
    torch.manual_seed(seed)
    gen = torch.Generator().manual_seed(seed)
    model = Encoder()
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    data = torch.from_numpy(X_pool)
    losses = []
    for epoch in range(epochs):
        order = torch.randperm(len(data), generator=gen)
        for start in range(0, len(data) - batch + 1, batch):  # drop the last short batch
            xb = data[order[start:start + batch]]
            _, z1 = model(augment(xb, gen, **aug))
            _, z2 = model(augment(xb, gen, **aug))
            loss = nt_xent(z1, z2, tau)
            opt.zero_grad()
            loss.backward()
            opt.step()
            losses.append(loss.item())
    return model, losses


t0 = time.time()
model_full, losses_full = pretrain(seed=0)
print(f"{len(losses_full)} steps in {time.time() - t0:.1f} s")
print(f"loss at step 0: {losses_full[0]:.3f}, final loss (mean of last 15): "
      f"{np.mean(losses_full[-15:]):.3f}")
print(f"loss of collapsed embeddings: log(2B - 1) = {np.log(511):.3f}")

plt.figure(figsize=(7, 3.2))
plt.plot(losses_full, color="tab:blue")
plt.axhline(np.log(511), color="grey", linestyle="--", label="log(2B - 1), collapsed")
plt.xlabel("training step")
plt.ylabel("InfoNCE loss")
plt.title("Contrastive pretraining loss (tau = 0.2, B = 256)")
plt.legend()
plt.show()
```

```output
900 steps in 12.4 s
loss at step 0: 6.150, final loss (mean of last 15): 2.376
loss of collapsed embeddings: log(2B - 1) = 6.236
```

损失从 6.15 开始，接近坍塌值 6.24，然后降到约 2.4，即坍塌值的 38%。它不会降到零，也不应该降到零：在噪声和增益都不同的情况下，一个窗口的两个视图永远不可能在其他 510 个视图中被完美匹配；如果损失趋于零，反倒说明这个任务是平凡的。

### 步骤 6：在预训练表示上做线性探测

编码器现在用作冻结的特征提取器。探测在与基线相同的有标签抽取上、按相同的协议训练。探测两种表示：$\mathbf{h}$，即编码器本体的 128 维输出；以及 $\mathbf{z}$，即经过损失所看到的投影头之后的 64 维输出。另外用两个随机种子再做两次预训练，可以感受一下波动的大小。

```python
h_pool, z_pool = embed(model_full, X_pool)
h_test, z_test = embed(model_full, X_test)
acc_h = probe(h_pool, h_test)
acc_z = probe(z_pool, z_test)
print("labels per class:           ", "   ".join(f"{b:>3d}  " for b in BUDGETS))
print(f"raw waveform:               {fmt(acc_raw)}")
print(f"FFT magnitude:              {fmt(acc_fft)}")
print(f"untrained encoder, h:       {fmt(acc_untrained)}")
print(f"contrastive, h:             {fmt(acc_h)}")
print(f"contrastive, z (after head):{fmt(acc_z)}")

for seed in (1, 2):
    m, _ = pretrain(seed=seed)
    hp, _ = embed(m, X_pool)
    ht, _ = embed(m, X_test)
    print(f"seed {seed}, h, 5 labels per class: {probe(hp, ht, budgets=(5,))[0]:.3f}")

fig, ax = plt.subplots(figsize=(7.5, 3.8))
xs = np.arange(len(BUDGETS))
for k, (label, accs) in enumerate([("raw waveform", acc_raw), ("FFT magnitude", acc_fft),
                                   ("untrained encoder h", acc_untrained),
                                   ("contrastive h", acc_h), ("contrastive z", acc_z)]):
    ax.bar(xs + 0.16 * (k - 2), accs, width=0.16, label=label)
ax.set_xticks(xs, [str(b) for b in BUDGETS])
ax.set_xlabel("labelled windows per class")
ax.set_ylabel("test accuracy of a linear probe")
ax.set_title("What pretraining buys when labels are scarce")
ax.legend(fontsize=8)
plt.show()
```

```output
labels per class:              5      20     100
raw waveform:               0.371  0.448  0.473
FFT magnitude:              0.850  0.899  0.974
untrained encoder, h:       0.532  0.738  0.895
contrastive, h:             0.956  0.988  0.996
contrastive, z (after head):0.620  0.920  0.996
seed 1, h, 5 labels per class: 0.954
seed 2, h, 5 labels per class: 0.944
```

按列读这张表。每类 5 个标签时，预训练得到的 $\mathbf{h}$ 得分 0.956，FFT 幅值为 0.850，未训练的编码器为 0.532，原始波形为 0.371：一个在预训练中从未见过标签的网络，比经典特征高出十一个点。另外两个随机种子给出 0.954 和 0.944，所以这个优势并不依赖于某一次幸运的初始化。每类 100 个标签时，优势几乎消失（0.996 对 0.974）：一旦标签充足，一个好的手工特征就够了，预训练带来的是*标签效率*。投影输出 $\mathbf{z}$ 则是另一回事：在 5 个标签时它只有 0.620，远低于 $\mathbf{h}$，到 100 个标签时才追上来。投影头被训练成对数据增强所改变的一切都保持不变，它丢掉的信息多于类别所需；这就是 SimCLR 保留 $\mathbf{h}$、丢弃投影头的原因。这个协议的误差棒并不小（五次有标签窗口的抽取，三个预训练随机种子），所以行与行之间一两个点的差异不应被读作排名。

### 步骤 7：数据增强就是监督

最后一个实验去掉数据增强。先只去掉时移（保留增益和噪声），再把三者全部去掉。没有时移时，一个窗口的两个视图具有*相同的相位*，所以匹配它们最容易的方法是记住波形中依赖相位的细节，而这恰恰是对分类毫无用处的特征。损失仍然下降，因为任务仍然被解决了，但它是用错误的特征解决的。无时移模型在每类 100 个标签时的混淆矩阵显示了哪些类别为此付出代价。

```python
model_noshift, loss_noshift = pretrain(seed=0, shift=False)
model_noaug, loss_noaug = pretrain(seed=0, shift=False, gain=False, noise=False)
ablation = {}
for name, m in [("no time shift", model_noshift), ("no augmentation", model_noaug)]:
    hp, _ = embed(m, X_pool)
    ht, _ = embed(m, X_test)
    ablation[name] = probe(hp, ht, return_model=True)
    print(f"{name:<22s}{fmt(ablation[name][0])}")
print(f"{'with all three':<22s}{fmt(acc_h)}")
print(f"final losses: full {np.mean(losses_full[-15:]):.3f}, "
      f"no shift {np.mean(loss_noshift[-15:]):.3f}, none {np.mean(loss_noaug[-15:]):.3f}")

pred = ablation["no time shift"][1]
cm = confusion_matrix(y_test, pred)
print("confusion matrix of the no-shift model (100 labels per class; rows = true):")
print(cm)
print(f"misalignment predicted as imbalance: {cm[2, 1]} of {cm[2].sum()}")
print(f"bearing defect predicted as healthy: {cm[3, 0]} of {cm[3].sum()}")
```

```output
no time shift         0.622  0.809  0.977
no augmentation       0.581  0.747  0.942
with all three        0.956  0.988  0.996
final losses: full 2.376, no shift 1.746, none 1.692
confusion matrix of the no-shift model (100 labels per class; rows = true):
[[503   0   0   3]
 [  0 531   0   0]
 [  0  18 454   1]
 [ 13   0   0 477]]
misalignment predicted as imbalance: 18 of 473
bearing defect predicted as healthy: 13 of 490
```

两点观察。没有时移时，每类 5 个标签下的探测准确率从 0.956 降到 0.622，只比未训练编码器的 0.532 高约 0.09，远低于使用时移的模型；完全没有数据增强时为 0.581。在 100 个标签时，差距缩小到 2 个点以内（0.977 对 0.996），所以损害同样体现在标签效率上：特征可用，但没有按类别组织起来。最终的损失才是更有启发性的数字：没有时移时为 1.75，没有任何数据增强时为 1.69，两者都*低于*完整方案的 2.38。当两个视图共享相位时，匹配它们的任务更容易，所以损失在改善，表示却在变差。对比损失衡量的是编码器解决前置任务（pretext task）的程度，而不是特征对下游任务有多好，这就是为什么由探测而不是损失来做判断。无时移模型的混淆矩阵（一次探测，每类 100 个标签的一次抽取）把错误放在了物理规律所预言的地方：不对中窗口被当作不平衡（473 个中有 18 个），两者都有很强的低次谐波；轴承缺陷被当作健康（490 个中有 13 个），它们的冲击比谐波小。这些计数取决于抽取；要看的是规律，而不是具体数字。

### 你应该看到什么

- 每类 5 个标签时，原始波形上的线性分类器在四个类别上接近随机水平（0.37，随机水平为 0.25），在 100 个标签时也只达到 0.47：在相位随机时，样本的任何固定线性组合都无法识别类别。频谱幅值这一经典特征按构造去掉了相位，表现很好（从 0.85 升到 0.97）。
- 带时移增强的对比预训练无需标签就能学到相位不变的表示。每类 5 个标签时它达到 0.956，比 FFT 特征高出约十一个点，另外两个预训练随机种子给出 0.95 和 0.94；在 100 个标签时，两者相差不到 2.5 个点。
- 数据增强就是监督。没有时移时，5 个标签下的准确率降到 0.62，只比未训练的编码器（0.53）略高，尽管预训练损失更低（1.75 对 2.38）。对比损失更低并不意味着特征更好。
- 投影头吸收了数据增强所改变的东西：每类 5 个标签时探测 $\mathbf{z}$ 得到 0.62，而 $\mathbf{h}$ 为 0.956，这就是保留 $\mathbf{h}$ 的原因。
- InfoNCE 损失最终约为 2.4，远高于零，也远低于 $\log(2B - 1) = 6.24$，即不携带任何信息的嵌入所对应的值。

### 动手试试

1. **更宽的增益增强。** 把增益范围从 0.8 到 1.25 换成 0.25 到 4，再次探测 $\mathbf{h}$。探测结果几乎不变（本实验一个使用更宽范围的副本在 5、20 和 100 个标签时给出 0.956、0.990 和 0.997，原来为 0.956、0.988 和 0.996），因为健康窗口和不平衡窗口在谐波比例和信噪比上也有差异，幅值并不是唯一的线索。设计一种在这些数据中确实会抹掉某个类别区分的数据增强，并用混淆矩阵确认。这就是[第 11 节](#s11)中的概念性失败，即旋转之下的 6 和 9，在这里变得具体。
2. **温度与 batch 大小。** 让 $\tau$ 取 0.05、0.5 和 1.0，batch 大小取 64 和 512，保持轮次数不变。哪些设置会改变探测在 5 个标签时的准确率？最终损失能预测这一点吗？
3. **编码器从未见过的类别。** 只在测试集中加入第五个类别——机械松动（$f_r$ 的许多次谐波，幅值逐次衰减），并对测试窗口的 $\mathbf{h}$ 画出按类别着色的二维主成分分析（PCA）图。预训练得到的 $\mathbf{h}$ 能否在不做任何重新训练的情况下，把新类别与旧类别分开？与 FFT 幅值的 PCA 图比较。
