## Lab 4 — A physics-informed network for a damped oscillator: forward, failure, fixes and an inverse problem {#lab4}

**Goal.** You build the physics-informed network of [Section 9](#s9) for a problem whose exact
answer is known, the damped oscillator

$$ u'' + 2\zeta\omega_0\, u' + \omega_0^2\, u = 0, \qquad u(0) = 1, \quad u'(0) = 0, $$

with $\omega_0 = 2\pi$ rad/s and $\zeta = 0.1$, on $t \in [0, 2]$ s. Because the exact solution is
known you can measure the error, which is what makes the failures visible. You first train the
network the obvious way and watch it converge to the trivial solution $u = 0$, which satisfies the
equation exactly and the initial conditions not at all. You then repair it two ways: by changing
the loss weights and by changing the units (a third repair, building the initial condition into the
network, is an extension). Last you treat $\zeta$ as unknown, recover it from twelve noisy
readings, and compare the result with a classical least-squares fit of the closed form. The data
are generated in the lab, nothing is downloaded, and the lab runs in a few minutes on a laptop
CPU. You need NumPy, SciPy, PyTorch and matplotlib. Printed numbers may differ from yours in the
last digits.

### Step 1: the problem and its exact solution

For $\zeta < 1$ the solution with these initial conditions is

$$ u(t) = e^{-\zeta\omega_0 t}\left(\cos\omega_d t + \frac{\zeta\omega_0}{\omega_d}\sin\omega_d t\right),
\qquad \omega_d = \omega_0\sqrt{1 - \zeta^2}. $$

You can check it against the two conditions: at $t = 0$ it gives $1$, and its derivative at $0$
is $-\zeta\omega_0 + \zeta\omega_0 = 0$. The code also fixes the working conventions. The thread
count is set to one: a network this small does too little arithmetic per step to gain from
several threads, and a single thread avoids the large slowdowns that appear when other programs
compete for the cores (in a prototype a step took about 1.2 ms either way when the machine was
idle, and about 30 ms with four threads when it was busy). The error measure is the relative L2
error on 1,000 test times, $\lVert u_\theta - u\rVert_2 / \lVert u\rVert_2$, which is 1 for a
network that outputs zero.

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

The oscillator completes two periods in the interval and its envelope falls to about 29% of the
initial amplitude. Remember these two facts: a network must reproduce two oscillations, and the
amplitude it is asked to reproduce is of order 1.

### Step 2: the network, its derivatives and the loss

The network $u_\theta(t)$ is a multilayer perceptron with three hidden layers of 32 tanh units. It
divides its input by the interval length, so that the first layer sees numbers in $[0, 1]$
whatever the units. The smooth tanh matters: the residual needs two derivatives of the network,
and a ReLU network has a second derivative that is zero almost everywhere.

The derivative helper is the whole mechanism of a PINN. `torch.autograd.grad` differentiates the
output with respect to the input time, and `create_graph=True` keeps the derivative itself
differentiable, so that it can be differentiated again (for $u''$) and so that the loss built from
it can be differentiated with respect to the weights. The residual of the equation is written
for any coefficients $c_1, c_2$, as $u'' + c_1 u' + c_2 u$; the dimensional problem has
$c_1 = 2\zeta\omega_0$ and $c_2 = \omega_0^2$, and Step 6 will use another pair. The loss of
[Section 9](#s9) is

$$ \mathcal{L}(\theta) = \underbrace{\frac{1}{N}\sum_{i=1}^{N} r_\theta(t_i)^2}_{\text{residual}}
+ \lambda_{\text{ic}}\underbrace{\Big[(u_\theta(0) - 1)^2 + u_\theta'(0)^2\Big]}_{\text{initial conditions}}, $$

with $N = 200$ evenly spaced collocation points. The `fit` function trains for a given number of
steps with Adam at learning rate $10^{-3}$, and records the two loss terms, the test error and the
largest $|u_\theta|$ on the test times at the steps you ask for.

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

The residual term is already about forty times larger than the initial-condition term before any
training. That is not an accident of the initialisation. The equation contains $\omega_0^2 \approx
39.5$, so a unit error in $u$ costs a residual of order 40 and a squared residual of order 1,500,
while the same unit error in $u(0)$ costs 1. The two terms live on scales that differ by three
orders of magnitude, and the optimiser follows the larger one.

### Step 3: the obvious loss, and the trivial solution

Now train in the problem's own units, with the two terms weighted equally ($\lambda_{\text{ic}} =
1$), for 3,000 steps. Use the dimensional coefficients and the interval $[0, 2]$.

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

The loss has fallen to a small number and the answer is wrong. The residual term is tiny, the
initial-condition term has barely moved from its starting value of about 1, and the network
outputs a curve of size 0.01 that has nothing to do with the oscillation. The relative error is
close to 1. This is the failure mode of [Section 9](#s9) in its cleanest form: $u \equiv 0$ is a
solution of the differential equation, so the residual can be driven to zero by switching the
network off, and the initial conditions, which are the only thing that distinguishes the wanted
solution from zero, have a gradient too weak to resist. Nothing in the printed loss warns you.
Only a comparison with a known answer (or with measurements) does.

### Step 4: remove the initial conditions altogether

To confirm that the conditions are the only barrier, set $\lambda_{\text{ic}} = 0$. Now nothing at
all distinguishes the wanted solution from zero.

```python
model_b, log_b, curve_b, _ = fit(T_END, C1_DIM, C2_DIM, 0.0, 3000, log_at=(0, 3000))
show(log_b)
```

```output
  step   residual   ic term   rel. L2 error   max|u|
     0   5.25e+01    1.3626          1.0914   0.1951
  3000   5.07e-06    1.0002          1.0000   0.0001
```

The residual falls to about $5	imes10^{-6}$, three orders of magnitude below that of the
previous run, and the network's amplitude is of order $10^{-4}$. The error is 1.000: the network has found exactly the
function with zero residual that is easiest to find. A well-posed problem needs its conditions,
and a loss that does not make the conditions binding has a trivial minimum.

### Step 5: the first fix, a large weight on the conditions

Raise $\lambda_{\text{ic}}$ to 100, so that the two terms are of comparable size when the network
is wrong in the way that matters, and train for 10,000 steps. Training is longer because the
problem is harder than it looks: two periods of a decaying oscillation are being fitted by a
function that starts out almost flat.

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

The weight works, and slowly: the error is still 33% after 1,000 steps, about 1.5% after 5,000
and 0.4% after 10,000. The residual term, which stays far above zero for thousands of steps,
shows how hard the optimiser is pulled between the two terms. The cost is a hyperparameter. A weight of 100 was chosen here because we
could see the failure at weight 1; with an unknown solution there is no error to look at, and the
weight has to be found by trial or by an adaptive scheme (see [Section 9](#s9)).

### Step 6: the second fix, non-dimensionalise

The deeper cause is the units. Define the dimensionless time $\hat t = \omega_0 t$, which runs
over $[0, 4\pi]$ for our interval. The chain rule gives $\mathrm{d}/\mathrm{d}t = \omega_0\,
\mathrm{d}/\mathrm{d}\hat t$, so

$$ \omega_0^2\, u_{\hat t\hat t} + 2\zeta\omega_0^2\, u_{\hat t} + \omega_0^2\, u = 0
\quad\Longleftrightarrow\quad u_{\hat t\hat t} + 2\zeta\, u_{\hat t} + u = 0, $$

with the same initial conditions, $u(0) = 1$ and $u_{\hat t}(0) = 0$. The coefficients are now
$c_1 = 2\zeta = 0.2$ and $c_2 = 1$, all terms are of order 1, and the residual and the
initial-condition term are comparable without any hand-tuned weight. The network is the same,
the weight is back to 1, and only the coordinate has changed.

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

The initial residual is now 0.034 rather than 52, so the imbalance of Step 2 has gone, and
indeed reversed: the initial-condition term (1.36) is now the larger one, and the optimiser
satisfies it first and then fits the oscillation. Training is not faster at the start (the error
is 0.39 after 2,500 steps and 0.06 after 5,000, against 0.015 at 5,000 for the weighted run),
but it keeps improving and ends at 0.0004, ten times lower than the weighted run and with no
tuned weight. (The residuals of the two runs cannot be compared directly, because the equations
differ by the factor $\omega_0^2$.) The lesson is general and transfers beyond this equation:
before reaching for loss-balancing schemes, put the equation in a form where its terms are of
order 1.

The convergence curves recorded during the three runs show it directly.

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

### Step 7: the inverse problem

Now the damping ratio is unknown. Twelve displacement readings are generated at random times in
$[0, 2]$ s from the exact solution with $\zeta = 0.1$ and Gaussian noise of standard deviation
0.02, as twelve accelerometer-derived samples might be. The network is non-dimensional as in
Step 6. The unknown enters the residual as a trainable scalar, parameterised as $\log\zeta$ so
that it stays positive, starting from $\zeta = 0.5$, a value five times too large. The loss adds a
data term, ten times the mean squared error at the readings; the weight 10 states that the
readings are trusted a little more than the physics is satisfied at a single collocation point.
Network weights and $\log\zeta$ are optimised together by the same Adam.

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

Starting five times too high, the estimate falls to 0.12 by step 5,000 and settles at 0.0987,
1.3% below the true 0.1. The solution error ends at about 0.019. Noise of 0.02 on a signal whose
root-mean-square value is 0.44 is a relative error of about 0.046 at the twelve readings, so the
network's solution is closer to the truth than the readings are: the equation filters the noise.
Twelve readings and an equation are enough because the equation supplies the shape of the curve
and the readings only have to pin down one number. The solution error is not as small as in
Step 6 (0.0004) because the data term pulls the network toward noisy points.

### Step 8: the classical baseline

The honest comparison for a one-parameter inverse problem with a closed form is a least-squares
fit of the closed form to the same readings. `curve_fit` minimises the squared difference between
`exact(t, zeta)` and the readings, and returns an uncertainty from the curvature of the fit.

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

The two estimates, 0.0977 and 0.0987, differ by about two thirds of the fit's own standard error
of 0.0015, and the true value 0.1 is about 1.5 standard errors from the least-squares one: both
are consistent with the truth and with each other. This is the correct conclusion, not a
disappointing one. When the solution is a closed form with one unknown, a least-squares fit is
faster, returns an error bar, and cannot get stuck in a trivial solution. The PINN earns its
cost when no closed form exists: a nonlinear equation, an irregular geometry, an unknown that is
a spatial field. The lab's value is that you have seen every step on a problem small enough to
check.

### What you should see

- In dimensional units the residual term starts about 40 times larger than the initial-condition term (52.5 against 1.4). With equal weights the optimiser drives the network to nearly zero: the loss is small (residual 0.006) and the relative error is 0.999. Without initial conditions the result is the same, with a residual of $5	imes10^{-6}$. The trivial solution satisfies the equation exactly.
- Weighting the initial conditions by 100 fixes it (error 0.0039 after 10,000 steps); non-dimensionalising fixes it better (0.0004) and needs no weight, because the terms of the equation are all of order 1.
- The inverse problem recovers $\zeta = 0.0987$ from twelve noisy readings, within 1.3% of the true value and consistent with the least-squares fit of the closed form (0.0977 $\pm$ 0.0015). When a closed form exists, use it; the PINN earns its cost when it does not.
- Second derivatives through autograd cost several forward and backward passes, yet this network takes a few milliseconds per step, so the whole lab runs in a couple of minutes on a CPU. The cost is in the number of steps (10,000 to reach 0.0004), not in the step.

### Try this

1. **Hard constraint.** Build the initial conditions into the network, $u_\theta(t) = 1 + (t/t_{\text{end}})^2\,N_\theta(t)$, which equals 1 at $t = 0$ and has zero derivative there whatever $N_\theta$ is. Drop the initial-condition term, and train in dimensional units for 10,000 steps. A trivial solution is no longer possible, so the failure of Step 3 cannot occur. Is the error nonetheless still large, and why? (The scaling problem has not gone away.)
2. **Spectral bias.** Set $\omega_0 = 8\pi$ (eight periods in the 2 s) and train the non-dimensional form again; the network now needs eight oscillations. Then add Fourier features $[\sin k\hat t, \cos k\hat t]$ for $k = 1, 2, 4$ as extra inputs and compare the two runs. Why does a tanh network with inputs of size 1 struggle with high frequencies?
3. **From ODE to PDE.** Exercise [e12](#e12) starts from this code and moves to the heat equation, where the collocation points become a grid in space and time.

## Lab 5 — Contrastive pretraining on unlabelled vibration signals {#lab5}

**Goal.** You pretrain an encoder with the InfoNCE loss of [Section 11](#s11) on machine-vibration
windows whose labels are never shown to it, and measure what that bought with a linear probe:
a logistic regression trained on only 5, 20 or 100 labelled windows per class. The comparison
is against the two things an engineer would try first, the raw waveform and its spectral
magnitudes, and against an encoder that was never trained. Then you remove the augmentations one
at a time and watch the representation get worse, which is the point of the lab: in contrastive
learning the augmentations are the supervision. The vibration data are generated in the lab
(four classes, random phases), so nothing is downloaded, and the lab runs in a couple of minutes
on a laptop CPU. You need NumPy, scikit-learn, PyTorch and matplotlib. Printed numbers may differ
from yours in the last digits.

### Step 1: a generator of vibration windows

A real rotating machine would be recorded with an accelerometer. Here a window is one second at
256 Hz, so 256 samples, of a shaft turning at a speed $f_r$ drawn uniformly from 9 to 11 Hz.
The four classes differ in the harmonics of $f_r$ they contain:

| class | signal (before noise) |
|---|---|
| 0 healthy | $1.0\sin(2\pi f_r t + \varphi_1) + 0.2\sin(2\pi\,2 f_r t + \varphi_2)$ |
| 1 imbalance | the same with the 1x amplitude raised to 2.5 |
| 2 misalignment | 1x, 2x and 3x components with amplitudes 1.0, 1.5 and 0.5 |
| 3 bearing defect | healthy, plus impulses repeating at $3.57 f_r$, each a 60 Hz oscillation of amplitude 1.5 decaying as $e^{-30\tau}$ |

All phases are random, the sensor gain is uniform on 0.8 to 1.2, and Gaussian noise of standard
deviation 0.3 is added. The random phases are the heart of the problem. They are what a real
recording looks like when the window starts at an arbitrary moment of the cycle, and they mean
that two windows of the same class share *no* sample values. The label depends on the
amplitudes of the harmonics, not on the phases.

The impulse train is built from the time $\tau$ since the last impulse, which is $(t - t_0)$
modulo the impulse period $1/(3.57 f_r)$; this gives the full decaying oscillation after each
impulse in one vectorised line.

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

Read the spectra before the waveforms, and note that the vertical axes differ. The healthy
window has a peak at about $f_r$ and a small one at $2f_r$. The imbalance window has a taller
peak at $f_r$ (the 1x amplitude is 2.5 times larger, though the peak height is also reduced by
spectral leakage, because the window does not hold a whole number of cycles). The misalignment
window has its largest peak at $2f_r$ and a third at $3f_r$. The bearing-defect window adds a comb
of peaks at multiples of the impulse rate $3.57 f_r$, near 39 and 78 Hz in this window. In the
time domain the classes are hard to tell apart by eye, and the phases differ from window to
window. The spectra are what an engineer computes by habit, and Step 3 uses them as a baseline.

### Step 2: the probe protocol

The quality of a representation is measured by how well a *linear* classifier does on it with
few labels. A linear probe cannot repair a bad representation by learning a clever nonlinear
function of it, so its accuracy reflects the features. For each label budget of 5, 20 and 100
windows per class, the helper draws that many labelled windows per class from the pool, five
times with different draws, fits a standardised logistic regression on each draw, and averages
the accuracy on the 2,000 test windows. The five draws matter at 5 labels per class, where a
single draw of 20 windows could be unlucky.

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

### Step 3: baselines

Three baselines set the bar. The first is a logistic regression on the 256 raw samples. The
second is on the 129 FFT magnitudes: the classical feature for rotating machinery, which discards
phase by construction. The third is the encoder of Step 5 *before* any training, with random
weights: a random network is a surprisingly informative featuriser, and any claim that
pretraining helps has to beat it.

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

Three facts are visible. The raw waveform is far below the others: with random phases no fixed
linear combination of the 256 samples identifies a class, which is the problem stated above.
The FFT magnitudes are far better, because the magnitude does not depend on the phase, but with
five labels per class they reach only about 0.85, and the gap to the best representation of Step 6
is largest there. And the untrained network is
already better than the raw waveform, because random nonlinear features of a signal are partly
phase-insensitive; it is still far below the FFT at 5 labels per class (0.53 against 0.85), and
it is the bar the trained encoder must clear.

### Step 4: the loss

The loss is the NT-Xent form of InfoNCE ([Section 11](#s11)). A batch of $B$ windows gives $2B$
views, two augmentations of each window. Let $\mathbf{z}_1, \dots, \mathbf{z}_{2B}$ be their
L2-normalised embeddings, so that the dot product is the cosine similarity. For view $i$ with twin
view $j(i)$ the loss is

$$ \ell_i = -\log\frac{\exp(\mathbf{z}_i^\top\mathbf{z}_{j(i)}/\tau)}
{\sum_{k\ne i}\exp(\mathbf{z}_i^\top\mathbf{z}_k/\tau)}, $$

which is a cross-entropy over the other $2B - 1$ views with the twin as the correct class. In code
this is one matrix product, a diagonal set to $-\infty$ (a view is never its own candidate), and
`F.cross_entropy` with the twin's index as the target. The temperature $\tau$ divides the
similarities: a small $\tau$ makes the softmax sharp and punishes the hardest negatives.

The sanity check reuses the worked example of [Section 11](#s11): one anchor with similarities
$(0.9, 0.2, 0.1, -0.3)$ to the positive and three negatives. At $\tau = 1$ the softmax is nearly
flat and the loss is 0.81; at $\tau = 0.1$ the positive dominates and the loss is 0.0013.

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

The collapse value is the loss of a representation that carries no information: every candidate
looks the same, so the softmax is uniform over $2B - 1 = 511$ views and the loss is $\log 511$.
Training must bring the loss well below this number, and a loss that sits near it means the
encoder has collapsed or the augmentations are too destructive.

### Step 5: the augmentations and the pretraining loop

Each view is made by three random operations, chosen to say what must *not* matter to the
representation: a **circular time shift** by a random number of samples (the window start is
arbitrary, so the phase must not matter), a **gain** drawn log-uniformly from 0.8 to 1.25 (the
sensor sensitivity must not matter) and **extra noise** of standard deviation 0.1. The shift is
done with `torch.gather` so that every window in the batch gets its own shift. A circular shift
keeps the magnitudes of the spectrum almost exactly and changes the phases, which is the
invariance we want to teach (the wrap-around joins the end of the window to its start, a small
artefact that a real pipeline would avoid by cutting windows from a longer recording).

The encoder is the one built in Step 3. The training uses batches of $B = 256$ (so each view has its twin and
$2B - 2 = 510$ views of other windows as negatives), Adam at learning rate $10^{-3}$, $\tau = 0.2$, and 60 epochs over the 4,000 pool windows: 15 batches an
epoch, 900 steps. The labels are not used.

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

The loss starts at 6.15, close to the collapse value of 6.24, and falls to about 2.4, which is
38% of it. It does not reach zero, and it should not: two views of one window can never be perfectly matched among 510 others
while the noise and gain differ, and tending to zero would suggest that the task is trivial.

### Step 6: the linear probe on the pretrained representation

The encoder is now used as a frozen feature extractor. The probe is trained on the same labelled
draws as the baselines, with the same protocol. Two representations are probed: $\mathbf{h}$, the
128-dimensional output of the encoder proper, and $\mathbf{z}$, the 64-dimensional output after
the projection head that the loss saw. Two more pretraining runs with other seeds give a feel for
the variation.

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

Read the table by columns. With 5 labels per class, the pretrained $\mathbf{h}$ scores 0.955,
against 0.850 for the FFT magnitudes, 0.532 for the untrained encoder and 0.371 for the raw
waveform: ten points above the classical feature, from a network that never saw a label during
pretraining. The other two seeds give 0.952 and 0.942, so the margin does not depend on one
lucky initialisation. With 100 labels per class the advantage has nearly gone (0.997 against
0.974): once labels are plentiful, a good hand-made feature is enough, and what pretraining
buys is *label efficiency*. The projection output $\mathbf{z}$ is a different story: at 5 labels
it reaches only 0.605, far below $\mathbf{h}$, and at 100 it catches up. The head was trained to
be invariant to whatever the augmentations vary, and it throws away more than the class needs;
this is why SimCLR keeps $\mathbf{h}$ and discards the head. The error bars of this
protocol are not small (five draws of labelled windows, three pretraining seeds), so a
difference of a point or two between rows should not be read as a ranking.

### Step 7: the augmentations are the supervision

The last experiment removes augmentations. First the time shift only (gain and noise remain),
then all three. Without the shift, the two views of a window have the *same phases*, so the
easiest way to match them is to remember phase-dependent details of the waveform, which is
exactly the feature that is useless for the classes. The loss still goes down, since the task is
still solved, but it is solved by the wrong features. The confusion matrix of the no-shift model
with 100 labels per class shows which classes pay.

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

Two observations. Without the time shift the probe accuracy at 5 labels per class falls from 0.955
to 0.628, which is about 0.1 above the untrained encoder's 0.532 and far below the shifted
model; with no augmentation at all it is 0.580. At 100 labels the gap closes to under 2 points
(0.977 against 0.997), so the damage is again one of label efficiency: the features are
usable but they are not organised by class. The final losses are the more instructive
numbers: 1.75 without the shift and 1.70 with no augmentation, both *lower* than the 2.38 of the
full recipe. The task of matching two views is easier when the views share their phases, so the
loss improves while the representation gets worse. A contrastive loss measures how well the
encoder solves the pretext task, not how good the features are for the downstream one, which is
why the probe, and not the loss, decides. The confusion matrix of the no-shift model (one probe,
one draw of 100 labels per class) puts the errors where the physics predicts: bearing defects
taken for healthy (19 of 490), whose impulses are small compared with the harmonics, and a few
misalignment windows taken for imbalance (8 of 473). These counts depend on the draw; the
pattern, not the digits, is the point.

### What you should see

- A linear classifier on the raw waveform is near chance for four classes at 5 labels per class (0.37, chance 0.25) and reaches only 0.47 at 100: with random phases no fixed linear combination of samples identifies a class. Spectral magnitudes, the classical feature, remove phase by construction and do well (0.85 rising to 0.97).
- Contrastive pretraining with a time-shift augmentation learns a phase-invariant representation without labels. With 5 labels per class it reaches 0.955, about ten points above the FFT features and two other pretraining seeds give 0.95 and 0.94; with 100 labels the two are within 2.5 points.
- The augmentation is the supervision. Without the time shift, the 5-label accuracy falls to 0.63, only a little above an untrained encoder (0.53), although the pretraining loss is lower (1.75 against 2.38). A lower contrastive loss does not mean better features.
- The projection head absorbs what the augmentations vary: probing $\mathbf{z}$ with 5 labels per class gives 0.61 against 0.955 for $\mathbf{h}$, which is why $\mathbf{h}$ is kept.
- The InfoNCE loss ends at about 2.4, well above zero and well below $\log(2B - 1) = 6.24$, the value for embeddings that carry no information.

### Try this

1. **A wider gain augmentation.** Replace the gain range 0.8 to 1.25 by 0.25 to 4 and probe $\mathbf{h}$ again. The probe barely changes (we measured 0.957, 0.989 and 0.998 for 5, 20 and 100 labels, against 0.955, 0.989 and 0.997), because healthy and imbalance windows also differ in harmonic ratios and in signal-to-noise ratio, so amplitude is not the only cue. Design an augmentation that does destroy a class distinction in these data, and confirm it with the confusion matrix. This is the conceptual failure of [Section 11](#s11), the 6 and the 9 under rotation, made concrete.
2. **Temperature and batch size.** Vary $\tau$ over 0.05, 0.5 and 1.0 and the batch size over 64 and 512, keeping the number of epochs. Which settings change the probe's 5-label accuracy, and does the final loss predict that?
3. **A class the encoder has never seen.** Add a fifth class to the test set only, mechanical looseness (many harmonics of $f_r$ with decaying amplitudes), and plot a two-dimensional PCA of $\mathbf{h}$ for the test windows, coloured by class. Does the pretrained $\mathbf{h}$ separate the new class from the old without any retraining? Compare with the PCA of the FFT magnitudes.
