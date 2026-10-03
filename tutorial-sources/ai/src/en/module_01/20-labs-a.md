## Lab 1 — Linear regression three ways: closed form, gradient descent and SGD {#lab1}

**Goal.** You fit one linear model to one synthetic dataset by the normal equations, by gradient
descent and by stochastic gradient descent, and check each against the theory of
[Sections 2 to 4](#s2). You find the step size at which gradient descent diverges by sweeping the
learning rate across $2/\lambda_{\max}$, break the optimiser with badly scaled features and repair
it with standardisation, and measure the noise floor of constant-step SGD against its prediction.
Everything is NumPy and needs no download; the whole lab runs in a few seconds.

### Step 1: the data and the closed form

The data are those of [Section 2](#s2): 200 examples, three standard-normal inputs, true weights
$\mathbf{w} = (1.5, -2.0, 0.5)$, intercept $0.7$ and Gaussian noise with standard deviation $0.1$.
The intercept is handled by appending a column of ones to the inputs, which gives a design matrix
`Xb` of shape $(200, 4)$ and a parameter vector $(w_1, w_2, w_3, b)$. The normal equations
$\mathbf{X}^\top\mathbf{X}\,\mathbf{w} = \mathbf{X}^\top\mathbf{y}$ are solved twice: directly, and
with `np.linalg.lstsq`, which uses an SVD and never forms $\mathbf{X}^\top\mathbf{X}$. On a
well-conditioned problem the two agree to many digits.

Two noise estimates follow. The root mean square of the residuals is biased low as an estimate of
the noise level, because the fit has used four degrees of freedom to make the residuals small.
Dividing the residual sum of squares by $N - 4$ instead of $N$ corrects this, as
[Section 5](#s5) derives.

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

The weights are close to the truth, $(1.5, -2.0, 0.5, 0.7)$, within the sampling error that
[Section 2](#s2) predicts, about $\sigma/\sqrt{N} = 0.007$ per coefficient. The residual RMS is the
noise level of the data, which was put there at 0.1. Nothing recoverable is left in the residuals.

### Step 2: the Hessian, its eigenvalues and the two critical step sizes

For the mean squared error $\mathcal{L}(\mathbf{w}) = \frac{1}{N}\lVert\mathbf{X}_b\mathbf{w} -
\mathbf{y}\rVert^2$ the gradient is $\frac{2}{N}\mathbf{X}_b^\top(\mathbf{X}_b\mathbf{w} -
\mathbf{y})$ and the Hessian is $\mathbf{H} = \frac{2}{N}\mathbf{X}_b^\top\mathbf{X}_b$, constant.
[Section 3](#s3) showed that gradient descent converges if and only if $\eta < 2/\lambda_{\max}$,
and that the fastest fixed step is $\eta^\ast = 2/(\lambda_{\max} + \lambda_{\min})$. Both come
from the eigenvalues, so compute them. The condition number $\kappa = \lambda_{\max}/\lambda_{\min}$
says how much slower the worst direction is than the best.

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

Independent inputs with unit variance give $\frac{1}{N}\mathbf{X}^\top\mathbf{X}$ close to the
identity, so $\mathbf{H}$ is close to $2\mathbf{I}$, the condition number is near 1 and the largest
stable step is a little under 1. This is the best case for gradient descent. The next steps leave
it.

### Step 3: gradient descent, and counting steps

The loop is the one from [Section 3](#s3): start from zeros, step against the gradient. It is
wrapped in a function that returns the whole trajectory of weights, so that later steps can measure
the loss and the distance to the optimum at every step. The first run uses $\eta = 0.1$ for 500
steps and should land on the closed-form weights. Then count the steps needed to bring
$\lVert\mathbf{w} - \mathbf{w}^\ast\rVert$ below $10^{-6}$, at $\eta = 0.1$ and at $\eta^\ast$.

Theory predicts the count. Along the eigenvector with eigenvalue $\lambda_i$ the error is multiplied
by $1 - \eta\lambda_i$ per step, so the smallest eigenvalue sets the rate: about
$(1 - 0.1\lambda_{\min})^t$. Starting from a distance of about 2.6 (the norm of the true
weights), reaching $10^{-6}$ takes of the order of $\ln(2.6\times10^{6})/\ln(1/(1 - 0.1\lambda_{\min}))$
steps; the printed count should be near that.

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

The three methods give the same answer to three decimals, as they must: all minimise the same
convex quadratic. The step counts show what $\eta^\ast$ buys. It makes the slowest and the fastest
directions shrink at the same rate, $(\kappa - 1)/(\kappa + 1)$ per step, which for $\kappa$ near 1
is very small.

### Step 4: the divergence boundary

[Section 3](#s3) claims that the boundary at $2/\lambda_{\max}$ is sharp. Test it by running 200
steps at $\eta = f\,\eta_{\max}$ for $f$ from 0.5 to 1.5 and printing the final training loss. For
$f < 1$ every direction contracts. For $f > 1$ the direction with $\lambda_{\max}$ is multiplied by
$1 - 2f$, whose magnitude $2f - 1$ exceeds 1, and grows geometrically. At $f = 0.99$ that direction
has a factor of $-0.98$ per step: it converges, but slowly and with alternating sign.

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

For $f$ up to 0.9 the final MSE is the noise floor, 0.0100 (the noise variance $\sigma^2$, less
the small fraction the fit absorbs), and the distance to the optimum is at rounding error. The
$f = 0.99$ run is still ringing after 200 steps, at 0.0104 and a distance of 0.020. Just over the boundary the loss grows instead of falling,
and by $f = 1.5$ it is astronomically large. A divergence at 1.01 times a threshold computed from
the eigenvalues is the cleanest evidence in this module that the theory describes the machine.

::: pitfall
A loss that becomes `inf` or `nan` is nearly always a step size above $2/\lambda_{\max}$. Before
touching anything else, halve $\eta$ and look at the first ten losses. If they now fall, the cause
was the step.
:::

### Step 5: bad units

Now break the problem without changing the model. Copy $\mathbf{X}$, multiply the first column by
1,000, as if a length were recorded in millimetres rather than metres, and add 100 to the second,
as if a temperature near 100 °C were recorded in °C rather than as a deviation from 100 °C. The set of functions the
model can represent is exactly the same: the new first weight is $1/1000$ of the old, and the
intercept absorbs the offset. Only the conditioning changes. The condition number is printed for
the two changes alone and together, and gradient descent then runs for 100,000 steps at
$0.9\,\eta_{\max}$, the best step it can safely take.

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

A condition number of $10^{10}$ is not exotic: it is what unscaled engineering data produce. The
step is limited by the largest curvature, which belongs to the column in millimetres, while the
other directions have curvatures many orders of magnitude smaller and barely move in 100,000
steps. After 100,000 steps the training MSE is 4.28, against 0.0100 for `lstsq` on the same data: the
model is fine and the optimiser has not learned it. `lstsq` is unaffected, because an
SVD does not care about units to within rounding. The closed form never noticed the problem;
gradient descent, the method that scales to everything else in this series, did. That is why
[Section 3](#s3) puts standardisation before optimisation.

### Step 6: standardise, and map the weights back

Standardising subtracts each column's training mean and divides by its training standard
deviation, giving columns with mean 0 and variance 1. The offset disappears from the conditioning
(centred columns are orthogonal to the column of ones) and so does the scale. The weights fitted in
the standardised coordinates are mapped back to the original units by $w_j = \tilde w_j/s_j$ and
$b = \tilde b - \sum_j \mu_j\tilde w_j/s_j$, which follow from substituting
$\tilde x_j = (x_j - \mu_j)/s_j$ into the model. The mapped-back weights must equal `lstsq` on the
badly scaled problem: standardisation changes the path, not the answer.

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

The condition number returns to about 1, convergence takes a handful of steps, and the mapped-back
weights agree with the SVD solution. The first weight, in original units, is about $1.5\times10^{-3}$:
the true 1.5 divided by the factor of 1,000. The intercept is about 201.7, which is
$0.696 + 2.0096\times100$: it has absorbed the offset added to the second column. The repair was a change of variables, not a cleverer
algorithm. Keep the training mean and standard deviation: any new input must be transformed with
*these* numbers, and [Lab 4](#lab4) shows what happens when it is not.

### Step 7: stochastic gradient descent and its noise floor

[Section 4](#s4) predicts that constant-step SGD does not converge but hovers at a floor, the
excess training loss $\mathcal{L}(\mathbf{w}_t) - \mathcal{L}(\mathbf{w}^\ast)$, which for least
squares is

$$
\text{floor} = \sum_i \frac{\eta\,\sigma^2\lambda_i}{B\,(2 - \eta\lambda_i)}, \qquad \sigma^2 = 0.0100,
$$

with $\sigma^2$ the residual variance (the code's `s2`), as derived in the worked example of that section. The code runs
seven configurations on the original, well-scaled data, each for 50 epochs. Each epoch draws a fresh
permutation (from a generator seeded with 1, separate from the one that made the data), cuts it
into mini-batches of $B$, and takes one step per batch. After every update it records the excess
loss, using the identity $\mathcal{L}(\mathbf{w}) - \mathcal{L}(\mathbf{w}^\ast) = \frac{1}{2}
(\mathbf{w} - \mathbf{w}^\ast)^\top\mathbf{H}(\mathbf{w} - \mathbf{w}^\ast)$, exact for a
quadratic. The last configuration decays the step as $\eta_t = 0.1/(1 + t/200)$, with $t$ the
update count. The measured floor is the mean excess over the second half of the updates, when the
transient has gone.

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

Read the table down the columns. The measured floor scales as $\eta/B$: cutting the batch size
from 32 to 10 raises it by roughly the factor 3.2, and cutting $\eta$ at $B = 1$ lowers it in step.
The prediction is within a factor of about two for every constant-step row with $B < N$, which
is as good as an additive-noise model deserves. It runs high for the small steps (4.4 against 3.1
at $B = 10$, in units of $10^{-4}$) and low at $B = 1$, $\eta = 0.1$ (4.4 against 9.6, in units of
$10^{-3}$), where the neglected noise that grows with the distance from the optimum is largest.
The full-batch row is not a floor: with $B = N$ there is no sampling noise, the run is plain
gradient descent, and the number is the mean of a transient that is still shrinking geometrically.
The formula does not apply to it, and its closeness to the printed prediction is a coincidence. The
decaying step ends at $3\times10^{-6}$ after the last update, far below every constant-step floor.

### Step 8: the plot

The plot puts four runs on log-log axes: full batch, $B = 32$, $B = 1$ and $B = 1$ with decay, each
against its own update count. The predicted floors of the two constant-step runs are dashed.
Full-batch gradient descent makes one update per epoch, so it has only 50 points; its straight
descent is the geometric convergence of [Section 3](#s3). This is Figure 1.6.

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

The $B = 32$ curve falls quickly, then goes flat near $10^{-4}$. The $B = 1$ curve is flat near
$10^{-2}$ and jagged. The decaying run follows the noisy one at first, then keeps descending after
the others have levelled off.

### What you should see

- The normal equations, `lstsq` and gradient descent agree to three decimals. The residual RMS
  equals the noise standard deviation: no recoverable signal is left unexplained.
- The divergence boundary is sharp and where the eigenvalue analysis puts it: $0.99\,\eta_{\max}$
  converges (slowly, ringing), $1.01\,\eta_{\max}$ explodes.
- With bad units gradient descent appears not to learn although the model is fine. Standardising
  restores convergence in a handful of steps, and the weights mapped back to the original units
  equal the `lstsq` solution. The fix is a change of variables, not a new algorithm. The closed form
  never noticed the problem.
- Constant-step SGD hovers at a floor roughly proportional to $\eta/B$. The predictions agree
  within about a factor of two. A decaying step goes below every floor.

### Try this

1. Add a fifth column equal to $0.99\times$ column 0 plus $0.01\times$ noise, standardise everything
   and watch $\kappa$ and the gradient descent step count grow. This is conditioning from
   correlation, which no rescaling removes.
2. Replace the fixed step by backtracking: halve $\eta$ until the loss decreases, and compare the
   number of steps with those at $\eta^\ast$.
3. Time `np.linalg.lstsq` against 100 gradient descent steps for $N = 10^6$, $d = 100$, and decide
   which you would use. Then decide which you would use for $d = 10^5$.
4. Run SGD with indices drawn independently with replacement instead of shuffled epochs, and
   compare the floors with the table: the worked example in [Section 4](#s4) says what to expect.

## Lab 2 — Logistic regression from scratch, and the metrics a decision needs {#lab2}

**Goal.** You implement regularised logistic regression with a numerically stable loss and a
gradient you have checked, train it by gradient descent, and confirm that it matches scikit-learn
once both have converged. You then measure the classifier the way a decision needs: a confusion
matrix, the threshold that meets a recall target, the ROC and precision–recall curves, and
calibration, including a constant predictor that is better calibrated than the model and useless.
You finish by removing the penalty on separable data and watching the weights grow without bound.
The data ship with scikit-learn, so there is no download, and the lab runs in a few seconds.

### Step 1: the data

scikit-learn's breast-cancer data have 569 cases and 30 numeric features computed from images of
cell nuclei. The library codes malignant as 0, which makes accuracy and recall easy to misread. The
question an engineer asks is "is this a defect?", so the defect, here malignant, must be the
positive class: flip the target with `y = 1 - target`. The split is stratified, so that the
training and test sets keep the class proportions, and the standardisation uses training statistics
only. Test data must never contribute to anything that is fitted, and that includes the mean and
the standard deviation.

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

### Step 2: the loss, its gradient and the step-size bound

With logit $z = \mathbf{a}^\top\mathbf{w}$ and probability $\hat p = \sigma(z)$, the per-example
negative log-likelihood is $\ln(1 + e^{z}) - yz$, derived in [Section 6](#s6). Computed naively,
$e^{z}$ overflows for large $z$; `np.logaddexp(0, z)` evaluates $\ln(e^0 + e^z)$ without forming
the exponential. The mean loss adds the penalty $\lambda\lVert\mathbf{w}\rVert^2$ on the 30 feature
weights, not on the intercept, with $\lambda = 1/(2NC)$ so that it matches scikit-learn's
$C = 1$. The gradient is $\frac{1}{N}\mathbf{A}^\top(\hat{\mathbf{p}} - \mathbf{y}) + 2\lambda
\mathbf{w}$ with the penalty term zero for the intercept.

The Hessian of the data term is $\frac{1}{N}\mathbf{A}^\top\mathrm{diag}(\hat p(1 - \hat p))
\mathbf{A}$, and $\hat p(1 - \hat p) \le \frac{1}{4}$, so its largest eigenvalue is at most
$L = \lambda_{\max}(\mathbf{A}^\top\mathbf{A}/N)/4$. Gradient descent with $\eta < 2/L$ is then safe.
Print the bound.

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

The step $\eta = 0.5$ is used below. The bound is for a loss that curves as sharply as it ever can;
near the minimum it curves much less, which is why the bound is sufficient but not necessary for
this non-quadratic loss, as [Section 6](#s6) notes.

### Step 3: check the gradient

A hand-written gradient is the most likely place for a silent bug, and a wrong gradient does not
crash: it makes training slow or wrong. The check compares it with central differences,
$(\mathcal{L}(\mathbf{w} + \epsilon\mathbf{e}_j) - \mathcal{L}(\mathbf{w} - \epsilon\mathbf{e}_j))/2\epsilon$,
at a random point, using the relative error
$\lVert g_{\text{num}} - g\rVert / \lVert g_{\text{num}} + g\rVert$. A correct gradient gives an error far below $10^{-6}$. [Module 02](module_02_EN.html)
makes this check a routine part of writing backpropagation.

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

### Step 4: train by gradient descent

Run 20,000 steps of full-batch gradient descent from zero at $\eta = 0.5$ and print the loss at
steps 10, 100, 1,000 and 20,000. The fast fall at first and the long tail after it are typical of
a problem whose curvature differs by directions: the standardised features of this data are
strongly correlated (the 30 measurements are largely different ways of describing size).

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

### Step 5: compare with scikit-learn

`LogisticRegression(C=1.0)` minimises the same objective: $\sum_i$ (negative log-likelihood) $+
\frac{1}{2C}\lVert\mathbf{w}\rVert^2$, which is $N$ times ours with $\lambda = 1/(2NC)$. The default
convergence tolerance, `tol=1e-4`, stops the solver early, and the coefficients then differ from
the true minimum by an amount that is easy to mistake for a bug in one implementation or the
other. The code fits with a tight tolerance and with the default and prints the largest coefficient
difference from the gradient descent solution in each case.

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

With a tight tolerance the two solutions agree to about $10^{-6}$. With the default, they differ
in the second decimal. The model is the same; the stopping rule is not. This is worth knowing
before blaming either implementation for a small disagreement.

### Step 6: the confusion matrix on the test set

Probabilities become decisions at a threshold, here 0.5. The confusion matrix counts the four
outcomes; rows are the true class and columns the prediction, with negative (benign) first.
Accuracy is only meaningful next to the baseline of always predicting the majority class, whose
accuracy is the proportion of the majority class in the test set.

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

Accuracy near 0.99 sounds excellent, and it means something only next to a baseline of 0.629 that
needs no model. The errors are not symmetric in cost: a false negative here is a malignant case
called benign. Precision answers "of those flagged, how many are real?" and recall answers "of the
real ones, how many were flagged?". Neither is visible in accuracy.

### Step 7: ROC and precision–recall curves

The curves sweep the threshold instead of fixing it. The ROC curve plots recall (true-positive
rate) against the false-positive rate; its area, the AUC, is the probability that a random
positive scores above a random negative. The precision–recall curve plots precision against
recall; a model that ranks at random has precision equal to the prevalence, $53/143 = 0.371$, so
that is its baseline, not 0.5. The marked point is the threshold-0.5 decision of the last step.

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

The ROC curve hugs the top-left corner: the ranking is excellent. An AUC says nothing, however,
about where to put the threshold, and that is the decision.

### Step 8: a threshold for a recall target

Suppose a missed malignant case is unacceptable and the requirement is a recall of at least 0.98.
`precision_recall_curve` returns precision and recall at every threshold at which the
predictions change. Scanning from the highest threshold down gives the largest threshold that
meets the target, which is the one with the best precision among those that do.

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

The ranking is excellent, and the threshold is still a decision. Meeting a recall of 0.98 needs a
threshold of 0.218 and costs precision 0.852; catching every one of the 53 malignant cases needs
0.116 and a precision of 0.828, roughly one flagged case in six benign. Whether that is acceptable depends on what a false alarm costs against a
miss, which is a question about the application, not about the model. Note also that these are
test-set numbers from 53 positives: the thresholds themselves would move with another sample. The
threshold should be chosen on validation data and only reported on test data; here the test set is
used for illustration, and [Lab 4](#lab4) shows the right protocol.

### Step 9: calibration

A model is **calibrated** if, among cases given probability 0.8, about 80% are positive. The
reliability diagram groups the test cases into 5 equal-width bins of predicted probability and
plots the fraction of positives in each against the bin's mean prediction. The **expected
calibration error** (ECE) is the weighted mean gap,
$\sum_b \frac{n_b}{n}\lvert\text{freq}_b - \text{conf}_b\rvert$ over the $n$ test cases,
as defined in [Section 7](#s7), and the **Brier score** is the mean squared error of the
probabilities, $\frac{1}{n}\sum_i(\hat p_i - y_i)^2$. Both are computed, and the diagram
is this lab's version of Figure 1.12 in [Section 7](#s7). Then score the constant predictor that outputs the training prevalence, $159/426 = 0.373$, for every case.

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

The model's ECE is small, but 143 cases spread over 5 bins leave only a handful of cases in the
middle bins, so each bin's fraction positive is a noisy estimate and ECE is biased upward by that
noise ([Section 7](#s7)). The constant predictor shows why ECE cannot be used alone. Its ECE is
smaller than the model's, because the overall frequency of positives in the test set is close to
the training prevalence, so its single bin is nearly calibrated. Yet its Brier score is ten times
worse and its AUC is exactly 0.5: it says nothing about any individual case. Calibration is not
discrimination, and a metric of one kind cannot stand in for the other.

### Step 10: what happens without a penalty on separable data

If a hyperplane separates the classes perfectly, the likelihood keeps increasing as the weights
grow along the separating direction, because every example's logit moves further from zero on the
correct side. Without a penalty there is no minimum: $\lVert\mathbf{w}\rVert$ grows for ever, and
the loss falls towards zero. The penalty is what makes the minimum exist ([Section 6](#s6)). With 30
features and 426 training cases the training set of this lab is separable, which the run confirms
by driving the training errors to zero with $\lambda = 0$. The step is $\eta = 1.0$, above the
bound for the penalised problem, which is acceptable here because the Hessian shrinks as the
probabilities saturate.

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

The norm keeps rising and never settles: 3.2, 6.2, 16.1 and 51.2 at 100, 1,000, 10,000 and
100,000 steps, while the loss falls from 0.058 to 0.0088 and the training errors reach zero. For
exactly separable data the growth is eventually only logarithmic in the step count, but this run has
not reached that regime (each tenfold increase in steps multiplies the norm by 1.9, then 2.6, then
3.2), so do not extrapolate from it. What matters is that there is no limit: the unpenalised
"solution" does not exist, and what you get is whatever the run had reached when you stopped it.
This is why scikit-learn defaults to an L2 penalty, and why a coefficient of $10^{3}$ in an
unpenalised logistic regression is a warning, not a finding.

### What you should see

- The from-scratch model and scikit-learn agree once both have converged. A disagreement of
  $10^{-2}$ comes from a solver tolerance, not from the model.
- AUC near 0.996 says the ranking is excellent, but the threshold is still a decision: catching
  every malignant case costs precision of about 0.83 instead of 1.00.
- Accuracy of 0.986 means something only next to the 0.629 baseline.
- Without a penalty on separable data $\lVert\mathbf{w}\rVert$ grows without limit (3.2 to 51 over
  three decades of steps) and the probabilities saturate. The L2 penalty is what prevents it.
- ECE alone would rank the constant predictor above the model; the Brier score and the AUC do not.
  Calibration is not discrimination.

### Try this

1. Implement softmax regression on `load_iris` with your own gradient,
   $(\hat{\mathbf{P}} - \mathbf{Y})^\top\mathbf{X}/N$, and compare with `LogisticRegression`.
2. Repeat step 4 with $\eta = 2$ and $\eta = 5$. The loss still falls: the bound $\eta < 2/L$ is
   sufficient, not necessary, for this non-quadratic loss.
3. Recalibrate with `CalibratedClassifierCV(method='sigmoid', cv=5)` on the training set and compare
   Brier scores and the reliability diagram.
4. Rerun the threshold search of step 8 on the training set with cross-validated probabilities, fix
   the threshold, then report precision and recall on the test set. How far do they move?

## Lab 3 — Polynomials: capacity, bias–variance and the ridge path {#lab3}

**Goal.** You reproduce the capacity curve of [Section 8](#s8) on twenty noisy points of
$\sin(2\pi x)$, estimate the bias² and variance of each polynomial degree by Monte Carlo and check
them against the exact formulas for a fixed design, trace the ridge path at degree 15, and choose
the penalty by five-fold cross-validation. The lab then repeats the experiment with ten times as
much data. Synthetic data, NumPy only, no download; it runs in a few seconds.

### Step 1: the data, and why the basis matters

The true function is $f(x) = \sin(2\pi x)$ and the noise has standard deviation $\sigma = 0.3$. The
training inputs are a **fixed design**, 20 evenly spaced points on $[0, 1]$, and only the noise is
random. A fixed design keeps the experiment clean: random inputs leave gaps near the ends, and a
high-degree polynomial then has a variance so large there that it swamps every plot. The
validation and test inputs are drawn uniformly, 1,000 and 10,000 of them, and the draws happen in
a fixed order from one generator, so the numbers are reproducible.

The features are Legendre polynomials $P_0(t), \dots, P_d(t)$ in $t = 2x - 1$, which maps $[0, 1]$
onto $[-1, 1]$. They span exactly the same functions as the monomials $x^k$, so the fitted curve is
the same in exact arithmetic; what changes is the conditioning of the design matrix. The condition
number of the degree-15 design is printed for both bases.

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

The Legendre basis is nearly orthogonal on the interval, which keeps the condition number small.
The monomial basis has columns that are all close to one another for large powers, and its
condition number is four orders of magnitude worse. The normal equations square the condition
number, so with monomials at degree 15 they lose most of the digits of double precision. We use
Legendre throughout.

### Step 2: the capacity curve

Fit degrees 0 to 15 by least squares (`np.linalg.lstsq`) and record the root mean squared error on
the training and validation sets. The training error cannot increase with the degree, because each
model contains the previous one. The validation error is the estimate of how the fit will do on new
data: it should fall to a minimum and then rise.

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

The training RMSE falls with every degree and reaches 0.11 at degree 15, far below the noise level
of 0.3: the fit is following the noise. The validation RMSE falls to about 0.35 at degrees 3 and 4
and climbs to about 0.72 at degree 15. Degrees 3 and 4 are nearly identical because
$\sin(2\pi x)$ is odd about $x = \tfrac12$: the even Legendre term added at degree 4 has a true
coefficient of exactly zero on this symmetric design, so it can only fit noise.

### Step 3: the fits themselves

The left panel draws the true function, the data and the fits of degrees 1, 3 and 15 on a fine
grid; the right panel draws the RMSE curves. Degree 1 is a straight line through a sine wave
(underfit), degree 3 follows it, and degree 15 passes close to every training point and oscillates
between them, with the largest swings near the ends, where 20 points constrain the polynomial
least. This is Figure 1.13.

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

### Step 4: bias² and variance, by simulation and exactly

For a fixed design, the expected squared error at a point $x$ splits, as in [Section 8](#s8), into
bias² $+$ variance $+$ $\sigma^2$, where bias is the gap between the average prediction (over
training sets) and the truth and variance is the spread of the prediction around its average. Both
can be estimated by simulation: draw $R = 200$ new sets of noise on the same inputs, refit each,
and average over a grid of 201 points.

For least squares on a fixed design there is also an exact answer. The fitted values at the grid
are linear in the targets, $\hat f_{\text{grid}} = \mathbf{S}\mathbf{y}$, with the **smoother
matrix** $\mathbf{S} = \boldsymbol{\Phi}_g(\boldsymbol{\Phi}^\top\boldsymbol{\Phi})^{-1}
\boldsymbol{\Phi}^\top$. Using the QR factorisation $\boldsymbol{\Phi} = \mathbf{QR}$ this is
$\boldsymbol{\Phi}_g\mathbf{R}^{-1}\mathbf{Q}^\top$, which avoids forming
$\boldsymbol{\Phi}^\top\boldsymbol{\Phi}$. The mean prediction is $\mathbf{S}f(x_{\text{train}})$,
so the bias² is the mean over the grid of $(\mathbf{S}f_{\text{train}} - f_{\text{grid}})^2$, and the
variance is $\sigma^2$ times the mean over the grid of the row sums of $\mathbf{S}^2$.

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

The two blocks agree to within a few per cent on the variance. The Monte Carlo bias² is larger than
the exact value, and the reason is the estimator itself: the average of $R = 200$ noisy predictions
has its own sampling variance, $\text{variance}/R$, and squaring the average adds that to the
bias². At degree 15, with variance 0.87, the expected inflation is $0.87/200 \approx 0.004$; this
run shows 0.002, which is within the scatter of a quantity whose variance is concentrated near the
two ends of the interval, where few of the 201 grid points carry it. The exact bias² there is zero
to four decimals, because a degree-15 polynomial can follow $\sin(2\pi x)$ at 20 points almost
perfectly. The Monte Carlo total at degree 15 is correspondingly 1.01 against the exact 0.96. The totals, bias² $+$ variance $+ \sigma^2$, are the
expected squared error at a new point: at degree 3 about 0.111 (RMSE 0.334, close to the 0.354
that the one validation set gave) and at degree 15 about 0.96 (RMSE 0.98). Bias² falls in pairs
(degrees 1 and 2, then 3 and 4) for the oddness reason of step 2.

The variance grows with the degree, slowly at first and then violently at 15, where 16 parameters
are fitted by 20 points and the model nearly interpolates. Averaged over the 20 *training* inputs
the variance is exactly $\sigma^2(d + 1)/N$, which is 0.072 at degree 15; the 0.87 is over a grid
that includes the ends, where the polynomial is far from the data.

### Step 5: the ridge path at degree 15

Keep the 16 features of degree 15 and shrink them instead of removing them. Ridge regression
minimises $\frac{1}{N}\lVert\mathbf{y} - \boldsymbol\Phi\mathbf{w}\rVert^2 +
\lambda\lVert\mathbf{w}\rVert^2$ and has the solution $(\boldsymbol\Phi^\top\boldsymbol\Phi +
\lambda N\mathbf{I}')\mathbf{w} = \boldsymbol\Phi^\top\mathbf{y}$, where $\mathbf{I}'$ is the identity
with a zero for the constant term, so that the intercept is not shrunk. The code sweeps $\lambda$
over 23 values from $10^{-10}$ to 10 and prints the training and validation RMSE and
$\lVert\mathbf{w}\rVert$. The Legendre basis matters here too: with standardised monomials the
penalty acts on badly scaled columns, and even $\lambda = 10^{-10}$ would already regularise, so the
overfitting end of the path would never appear.

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

At the left, with almost no penalty, the fit is the unregularised degree-15 fit: training RMSE near
0.11, validation near 0.72. As $\lambda$ grows the weights shrink, the training error rises and the
validation error falls; at large $\lambda$ both rise together as the model is flattened towards a
constant. It is the same U-shape as in the degree curve, now along a continuous axis that is easier
to search. The validation minimum, about 0.335 near $\lambda = 0.03$, is lower than the best
unregularised degree of step 2 (0.354).

### Step 6: choosing λ by cross-validation

A validation set of 1,000 points is a luxury. With 20 training points an honest procedure uses only
those: five-fold cross-validation, in which the points are permuted, cut into five folds of four,
and each fold in turn is predicted by a model fitted to the other 16. The mean of the five fold
errors estimates the error at that $\lambda$; their standard deviation over $\sqrt5$ is a rough
standard error ([Section 8](#s8)). The **one-standard-error rule** picks the strongest penalty whose
mean error is within one standard error of the minimum. After choosing $\lambda$, refit on all 20
points and evaluate once on the 10,000-point test set, alongside unregularised degrees 3 and 15.

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

Cross-validation chooses a $\lambda$ near the validation minimum of the last step, although it saw
only the 20 training points. The refitted ridge model beats the best unregularised polynomial on the
test set, and the unregularised degree-15 polynomial is more than twice as bad. Shrinking a
flexible model can do better than choosing a small one, because the penalty removes most of the
flexible model's variance without imposing the bias of a small one. The test set was touched
once, after every choice had been made.

### Step 7: check against the library

The ridge solution in scikit-learn, `Ridge(alpha=...)`, minimises $\lVert\mathbf{y} -
\mathbf{Xw}\rVert^2 + \alpha\lVert\mathbf{w}\rVert^2$ without the factor $1/N$, so $\alpha =
\lambda N$. It fits the intercept itself, without penalising it, so give it the features without
the constant column.

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

The two agree to rounding error: the closed form of this lab is the library's ridge.

### Step 8: ten times more data

Rerun the capacity curve with $N = 200$ training points, generated in the same order from the same
seed. The variance of a least-squares fit scales as $\sigma^2(d+1)/N$, so ten times the data should
cut it by a factor of ten and with it the penalty for flexibility.

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

With 200 points the validation error reaches a plateau of about 0.31, just above the noise level
of 0.3, from degree 3 or 4 onwards and stays within 0.01 of it up to degree 15 (the minimum, 0.308, is at degree
5): flexible models stop being punished, because their
variance is spread over ten times as many points. The more data, the more flexibility is
affordable, and the best degree moves up. This is the learning-curve picture of
[Section 8](#s8) in miniature.

### What you should see

- Training RMSE never increases with degree. Validation RMSE falls to about 0.35 and climbs to 0.72
  at degree 15.
- Bias² $+$ variance $+ \sigma^2$ reproduces the validation MSE to within the sampling error of the
  data. Bias² falls in pairs of degrees, because $\sin(2\pi x)$ is odd about $x = \tfrac12$.
- The Monte Carlo bias² exceeds the exact one by about variance$/R$, and the exact formulas need no
  simulation at all.
- A regularised degree-15 model beats the best small unregularised model on the test set: shrinking
  a flexible model can beat choosing a small one.
- With ten times as many points the variance term is about ten times smaller and flexible models
  stop being punished.

### Try this

1. Use raw monomials $x^k$ with the normal equations $\boldsymbol\Phi^\top\boldsymbol\Phi$ at
   degree 15 and watch the solution change with a tiny perturbation of the data:
   $\kappa(\boldsymbol\Phi^\top\boldsymbol\Phi) = \kappa(\boldsymbol\Phi)^2$.
2. Draw learning curves: expected training and validation MSE for $N$ from 10 to 1,000 at degrees
   3 and 9 (Figure 1.15), averaging over many noise draws.
3. Replace five-fold cross-validation by leave-one-out ($k = 20$) and compare the chosen $\lambda$
   and the spread of the fold errors.
4. Replace the fixed design by 20 uniform random inputs and repeat the exact variance computation
   for ten different draws: how often do the gaps at the ends make degree 15 explode?
