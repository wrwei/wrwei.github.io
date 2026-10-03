## Lab 1 — Backpropagation by hand in NumPy {#lab1}

**Goal.** You implement the forward and backward pass of a two-layer MLP in NumPy, with nothing
but matrix products, and then you refuse to trust it. Every one of its 193 gradient entries is
compared with a finite-difference estimate, a deliberately broken backward pass shows what a
failed check looks like, and PyTorch's autograd is used as an independent referee. Then the
network learns $y = \sin 3x$ from 256 samples, and you see what the scale of the initial weights
does to that learning, over ten seeds so that no single lucky draw misleads you. The code is the
one from [Section 3](#s3) and the example of [Section 1](#s1), gathered in one place. The lab
needs NumPy, matplotlib and PyTorch, no download and under half a minute of CPU time.

### Step 1: the network, the data and the first loss

The model is the two-layer regression network whose code [Section 3](#s3) runs on its tiny
example, here as a $1 \to 64 \to 1$ network with a ReLU hidden layer and a mean squared error. `init` draws $\mathbf{W}^{(1)}$ from $\mathcal{N}(0, 2/1)$ and
$\mathbf{W}^{(2)}$ from $\mathcal{N}(0, 1/64)$ (He initialisation for the ReLU layer, variance
$1/n_{\text{in}}$ for the linear output) with zero biases. `forward` returns the output and a
cache of what the backward pass needs. `backward` is the four equations: the error signal at the
output is $2(\hat{\mathbf{y}} - \mathbf{t})/B$ (the factor $1/B$ comes from the mean over the
batch), the gradient of each weight matrix is the transposed layer input times the error signal,
and the error is pushed through $\mathbf{W}^{(2)}$ and gated by $\mathbb{1}[z > 0]$.

The order in which the random generator is used matters if you want the same numbers as the
text: first the inputs `X`, then the initial parameters, then the validation set. Shapes are
printed so that you can check them against [Section 2](#s2).

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

The mean of $t^2$ is the loss of predicting zero everywhere, 0.549. The initial loss, 0.327, is
lower only by the luck of this draw: at initialisation the output is a random combination of
random ReLU ridges, unrelated to the target, and other seeds start higher (Step 7 shows the
range). The parameter count, $64 + 64 + 64 + 1 = 193$, is the number of entries to check next.

### Step 2: gradient check of all 193 entries

[Section 14](#s14) gives the rule: any hand-written backward pass is compared with central
differences before it is trusted. For one parameter $\theta_k$ the estimate is
$$\frac{\partial\mathcal{L}}{\partial\theta_k} \approx \frac{\mathcal{L}(\theta_k + \epsilon_{\text{fd}}) - \mathcal{L}(\theta_k - \epsilon_{\text{fd}})}{2\epsilon_{\text{fd}}},$$
with error $O(\epsilon_{\text{fd}}^2)$ from the truncation of the Taylor series and $O(u/\epsilon_{\text{fd}})$ from
rounding ($u$ is the unit round-off, about $10^{-16}$ in float64). $\epsilon_{\text{fd}} = 10^{-5}$ balances
the two (it is `eps` in the code). The function below perturbs every entry of every tensor in turn and returns the
relative error $|a - n|/\max(10^{-8}, |a| + |n|)$ per entry, where $a$ is the analytic and $n$
the numerical value. This is a relative error like the vector version of Module 01, but per
entry, so that a bug can be localised to one tensor. Everything is in float64; in float32 the
rounding term would be $10^{9}$ times larger.

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

Three tensors agree to about eight digits or better, which is as good as double precision
allows with this $\epsilon_{\text{fd}}$. One does not: the worst error of $\mathbf{b}^{(1)}$ is about
$10^{5}$ times larger. Before concluding that the bias gradient is wrong, look at the entry.

### Step 3: the one entry that looks bad

A ReLU has a kink at zero. If a pre-activation $z$ lies within $\epsilon_{\text{fd}}$ of the kink, the two
points $b \pm \epsilon_{\text{fd}}$ fall on different sides of it and the difference quotient measures an
average slope over both linear pieces, not the derivative at $b$. The analytic gradient is
correct (it is the derivative of whichever piece $z$ is on) and the numerical one is the one that
is wrong. The next block finds the worst unit, prints its smallest $|z|$ over the batch, and
repeats the check with $\epsilon_{\text{fd}} = 10^{-7}$, small enough to resolve the kink for this unit.

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

Two practical rules follow. When one entry of a ReLU network fails the check and the others pass,
test whether a pre-activation sits within $\epsilon_{\text{fd}}$ of zero before debugging anything. And
when you really are unsure, change $\epsilon_{\text{fd}}$: a true bug is the same at every $\epsilon_{\text{fd}}$, a
kink artefact moves.

### Step 4: what a real bug looks like

Now break the backward pass on purpose: drop the ReLU gate, so that the error flows into
$\mathbf{Z}^{(1)}$ as if the activation were the identity. This is a realistic mistake (a custom
layer whose derivative is forgotten) and the check should find it, and say where it is.

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

The check does more than say "something is wrong". $\mathbf{W}^{(2)}$ and $\mathbf{b}^{(2)}$ are
unaffected, because they sit above the missing gate and their gradients do not pass through it;
$\mathbf{W}^{(1)}$ and $\mathbf{b}^{(1)}$ are off by order one. The failing tensors are the ones
below the faulty operation. In a deep network this reads as a bisection: the topmost failing
layer is the place to look. The function `backward` itself was never modified, so there is
nothing to restore.

### Step 5: PyTorch as a referee

An independent implementation is the strongest check. The same network in PyTorch is
`nn.Sequential(nn.Linear(1, 64), nn.ReLU(), nn.Linear(64, 1))`. PyTorch stores a linear layer's
weight as `(d_out, d_in)`, the transpose of this lab's `(d_in, d_out)`, so the weights are copied
transposed. Double precision is used so that agreement is limited by arithmetic, not by the
format. Then `torch.autograd.gradcheck` is run on a small function: it is the same finite-difference
test, packaged, and it is what you would apply to a custom `autograd.Function`.

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

The two implementations agree to rounding error, in loss and in all four gradients. PyTorch's
autograd does not use a different algorithm: it applies the four equations of
[Section 3](#s3), recorded as a graph ([Section 4](#s4)), and the layout of its weights is the
only visible difference.

### Step 6: training, and where the fit is good

With a verified gradient, training is plain gradient descent
([Module 01, Section 3](module_01_EN.html#s3)): 3,000 full-batch steps at $\eta = 0.05$, so every step uses the exact gradient of the mean loss
over the 256 points. After training, three numbers matter: the training and validation errors
(both inside $[-1, 1]$), the number of hidden units that are never active on the training set,
which is wasted capacity, and the error on $[1, 2]$, outside the data. A plot shows the last
point directly.

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

The training error falls by roughly three orders of magnitude. Inside the training range the
network is indistinguishable from the sine. Outside it, the last linear piece of the ReLU
network continues as a straight line, and the error on $[1, 2]$ is of order one: a ReLU network
is piecewise linear, so it extrapolates linearly, however well it interpolates. Nothing in the
training loss can detect this, because no training point lies outside the range.

### Step 7: what the initial scale does, over ten seeds

[Section 6](#s6) argues that the initial scale of the weights sets the scale of the signal and
of the gradients. A direct test replaces He initialisation with $\mathcal{N}(0, 1)$ and with
$\mathcal{N}(0, 10^{-4})$ (standard deviation 0.01). On a shallow
network a single seed is misleading, because the initial loss depends strongly on the draw, so
the experiment below uses ten initialisation seeds for each of the three schemes, the same data
and the same 3,000 steps. It prints the median loss at steps 0, 100, 1,000 and 3,000 (and the range at
step 0), and plots the median curve of each scheme on a logarithmic axis.

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

Read the table in three parts.

With $\mathcal{N}(0, 1)$ the first-layer weights are somewhat smaller than He's (standard
deviation 1 against $\sqrt 2$) but the output weights are eight times larger than the variance
$1/64$ asks for, so the initial output is large: the median initial loss is about 8 and the
range runs from 0.3 to 24, a factor of about seventy-five between seeds. At initialisation this
zero-bias network is two random straight lines glued at a kink; a wild draw gives a wild line.
The network is shallow, so gradient descent corrects it within a hundred steps, and the final
loss is comparable to He's. In a deep network the same excess would be multiplied at every
layer, as the table of [Section 6](#s6) shows.

With $\mathcal{N}(0, 10^{-4})$ the initial output is almost exactly zero, so the initial loss is
the mean of $t^2$ for every seed. The gradient of each layer is proportional to the weights of
the other, and both are tiny, so the gradient is tiny and the two layers must grow together
before the fit can start: at step 1,000 the median loss is still 0.114, more than twenty times
He's, and after 3,000 steps it is about 26 times He's. The network is in a flat region near the
origin of weight space, not unable to learn, but it costs steps. With a deeper network the
product of many tiny weights would make the region far flatter.

With He, the initial loss is moderate, there is no slow start, and the loss falls steadily.

### What you should see

- The three well-behaved tensors of the gradient check agree with finite differences to roughly
  $10^{-8}$ or better; the bias of the first layer has one outlier whose smallest $|z|$ is
  smaller than $\epsilon_{\text{fd}}$, and the outlier disappears at $\epsilon_{\text{fd}} = 10^{-7}$. A check is only
  as good as its $\epsilon_{\text{fd}}$ and the smoothness of the function.
- The broken backward pass corrupts only $\mathbf{W}^{(1)}$ and $\mathbf{b}^{(1)}$, the tensors
  below the missing gate: the check localises a bug to a layer.
- PyTorch agrees with the NumPy code to rounding error. Autograd computes the four equations of
  Section 3; the stored weight layout, `(out, in)`, is the only difference.
- The training error falls by three orders of magnitude, and the fit is good only inside the
  data's range: outside it a ReLU network extrapolates linearly.
- The initial scale matters in both directions: too large gives a large and seed-dependent
  initial loss (0.3 to 24 over ten seeds), too small a slow start (a final loss 26 times He's
  after the same 3,000 steps). Both are mild here because the network has one hidden layer,
  and both compound layer by layer in a deep one.

### Try this

1. Replace ReLU by $\tanh$ in `forward` and `backward` ($\phi'(z) = 1 - \tanh^2 z$, which is
   `1 - H1 ** 2`), rerun the gradient check and the training, and compare the final error with
   ReLU's. The kink artefact of Step 3 should disappear.
2. Generalise `forward` and `backward` to $L$ layers with loops over lists of weight matrices,
   gradient-check them, and repeat Step 7 with five hidden layers of 64 units. $\mathcal{N}(0, 1)$
   should now explode and $\mathcal{N}(0, 10^{-4})$ should stall.
3. Engineering variant: fit the neo-Hookean nominal stress $P = 2c_1(\lambda - \lambda^{-2})$ of
   [Module 01, Section 12](module_01_EN.html#s12) ($c_1 = 10$ kPa, stretches $\lambda$ from 0.6 to 1.0, 2% noise)
   with this network, and compare its prediction at $\lambda = 0.5$ with the one-parameter
   physical model's. Which of the two extrapolates, and why?
4. Switch to mini-batches of 32 and compare the loss curves with full-batch training at the
   same number of epochs.

## Lab 2 — A scalar autodiff engine in about 100 lines {#lab2}

**Goal.** You build reverse-mode automatic differentiation from scratch: a `Value` class that
records the computational graph of [Section 4](#s4) as the program runs, and a `backward` method
that sweeps the graph once and leaves $\partial f/\partial v$ on every node. You check it by hand,
against finite differences and against PyTorch, and then use it, with no tensors at all, to train
a 337-parameter MLP on the two-moons problem. The engine works on one number at a time, so it is
slow by design; the last step measures how slow, and why that is what tensor frameworks exist to
fix. No download; the whole lab runs in under a minute, most of it in the training loop.

### Step 1: a node that remembers how it was made

Reverse mode needs, for every intermediate result $v$, the list of values it was computed from
(its **parents**) and the local partial derivative $\partial v/\partial u$ for each parent $u$.
The engine computes these local derivatives during the forward pass, when the operands are at
hand, and stores them in the node. The backward sweep then needs no knowledge of what the
operation was: it only multiplies and adds.

The class has four fields. `data` is the value, `grad` accumulates $\partial f/\partial v$ for
the output $f$ of the whole computation (the **adjoint**), `_parents` and `_local` are the two
tuples just described. `__slots__` makes each node smaller and faster, which matters when a
single training step creates tens of thousands of them (Step 5 counts them). Each operator builds a new `Value`.
Subtraction is addition of a negation and negation is multiplication by the constant $-1$, and
division is multiplication by a power $-1$, so only five primitives need their own derivative:
$+$, $\times$, a constant power, and the functions below. Plain Python numbers are wrapped into
constant nodes by `_wrap`, which is also what makes `2 * x` and `1 + x` work through
`__rmul__` and `__radd__`.

The derivatives are the ones of [Section 4](#s4): for $v = u + w$ both local derivatives are 1;
for $v = uw$ they are $w$ and $u$; for $v = u^k$ it is $ku^{k-1}$; for $\exp$, $\log$, $\sin$,
$\tanh$ and ReLU they are $e^u$, $1/u$, $\cos u$, $1 - \tanh^2 u$ and $\mathbb{1}[u > 0]$.

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

`b` is an addition node whose two parents are the product $a \cdot a$ and the product $2 \cdot a$;
nothing has been differentiated yet. The graph is the record of the computation, and the local
derivatives are the only calculus the engine will ever do.

### Step 2: the backward sweep

Reverse mode is the chain rule applied once per edge, in the right order. Set $\partial f/\partial f = 1$
on the output. Then visit the nodes so that each node is visited only after every node that
*uses* it, and for each parent $u$ of the current node $v$ add
$$\frac{\partial f}{\partial u} \mathrel{+}= \frac{\partial f}{\partial v}\,\frac{\partial v}{\partial u}.$$
The `+=` is the whole treatment of fan-out: a variable used in three places receives three
contributions, and the multivariable chain rule says they add. (In `b = a*a + 2*a` the node `a`
is used three times and its gradient is $a + a + 2 = 8$.)

"Each node after all its users" is a reverse topological order, and the engine finds it with a
depth-first traversal. The traversal below is iterative, with an explicit stack. A recursive one
uses a Python stack frame per node on the current path, the loss of Step 5 is a running sum
over the examples, and a longer sum or a deeper network would exceed Python's default recursion
limit of 1,000 frames. A node is pushed twice, once to be expanded and
once, after its parents, to be emitted. Defining the method after the class and attaching it
keeps the explanation of Step 1 separate from this one.

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

The engine proper (the `Value` class, the five functions and `backward`) is about 90 lines.
Everything else in the lab is using it.

### Step 3: verify on a function with a known answer

[Section 4](#s4) differentiates $f(x_1, x_2) = \ln x_1 + x_1 x_2 - \sin x_2$ by hand at
$(2, 5)$: $\partial f/\partial x_1 = 1/x_1 + x_2 = 5.5$ and
$\partial f/\partial x_2 = x_1 - \cos x_2 = 2 - \cos 5 \approx 1.7163$. The next block
computes it with the engine and with central differences on the same function written in plain
floats, so that there are two independent references. The graph has nine nodes: two inputs,
$\ln x_1$, $x_1 x_2$, their sum, $\sin x_2$, the constant $-1$ that subtraction creates, the
negated sine, and the final sum.

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

The cost of the engine's answer is one forward evaluation and one sweep for both partial
derivatives; finite differences needed four extra function evaluations for two inputs, and would
need $2n$ for $n$ inputs. That asymmetry is why reverse mode is used for networks with millions
of parameters.

### Step 4: neurons, layers and an MLP

An MLP made of `Value`s is a few lines. A `Neuron` holds one weight `Value` per input and a bias,
computes $\sum_j w_j x_j + b$ and optionally applies ReLU. Weights are drawn from $\mathcal{N}(0, 2/n_{\text{in}})$,
He initialisation as in [Section 6](#s6), and biases start at zero. `random.gauss` is used instead
of NumPy so that the engine depends on nothing but the standard library. `MLP(2, [16, 16, 1])` is
the $2 \to 16 \to 16 \to 1$ network with ReLU in the two hidden layers and a linear output (the
output is a logit), so its parameter count is $(2 \cdot 16 + 16) + (16 \cdot 16 + 16) + (16 + 1)$.

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

### Step 5: the loss, and training

The task is [make_moons](https://scikit-learn.org/stable/modules/generated/sklearn.datasets.make_moons.html):
two interleaved half-circles, labels 0 and 1, 100 training points. The loss is the mean binary
cross-entropy computed from the logit $z$ in the stable form of [Section 12](#s12),
$$\ell(z, y) = \max(z, 0) - zy + \ln\!\big(1 + e^{-|z|}\big),$$
which never exponentiates a large positive number. The engine has no `abs`, but
$|z| = \max(z, 0) + \max(-z, 0)$ is built from two ReLUs, so the loss uses only primitives that
already exist. (At this size a naive sigmoid would also work; the stable form is the habit to
build, and it costs nothing.)

Training is full-batch gradient descent with $\eta = 1.0$. Two details are easy to get wrong.
Gradients accumulate with `+=`, so they must be zeroed on every parameter before each backward
pass; and the parameters are `Value`s whose `data` is changed in place, while every other node is
rebuilt on each step. The loop evaluates the loss before updating, so the number printed at step
$k$ is the loss of the parameters after $k$ updates; at step 100 only the evaluation and the
backward pass are done, which leaves the gradient at the final parameters for the PyTorch
comparison of Step 7. The graph size (`nodes`, the number of nodes in the graph of one
loss evaluation) is printed too.

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

The initial loss is above $\ln 2 = 0.693$, the loss of a classifier that outputs probability
$1/2$ everywhere. The cause is the output neuron: it is initialised like a hidden one, with
variance $2/16$, so its logits start with a spread of order one, and a confident wrong logit is
punished harder than a hesitant one. [Section 14](#s14)'s initial-loss check would flag this; the
remedy is a smaller output initialisation. It is left as it is because the network recovers within
twenty steps, as the table shows. The graph holds 66,440 nodes for 100 examples
and 337 parameters: it is the **tape** of [Section 4](#s4), and its size is the memory price of
reverse mode.

### Step 6: test accuracy and the decision boundary

The test accuracy needs no gradients, so it should not build a graph. The next block extracts
the trained weights into NumPy arrays and runs a plain float forward pass, which is also how a
deployed model works. The decision boundary is the zero contour of the logit on a
$100 \times 100$ grid.

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

### Step 7: PyTorch as a referee

The engine's weights are copied into float64 tensors and the same loss is computed with
`F.binary_cross_entropy_with_logits` on the same training points. `backward()` then gives
PyTorch's gradients, which are compared with the engine's, parameter by parameter. The engine
stores a neuron per object, PyTorch a matrix per layer, so the engine's flat parameter list is
matched to the arrays through the same ordering (weights of neuron 0, its bias, weights of
neuron 1, ...).

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

The two frameworks give the same loss and the same 337 gradients to rounding error. The engine
is a toy, but it is not a different kind of object from autograd: PyTorch records a graph of
tensor operations, each with a function that maps an incoming adjoint to adjoints of its inputs
(a vector-Jacobian product), and sweeps it in reverse.

### Step 8: what the tensor version buys

One forward and backward pass of the engine on the 100 training points is timed against the same
computation in PyTorch, after a warm-up call, averaged over 200 repetitions. Both do identical
arithmetic. The difference is entirely overhead: the engine creates 66,440 Python
objects and runs a Python loop over every edge, where PyTorch issues about ten tensor
operations that run in compiled code.

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

The exact times vary from run to run and from machine to machine (the engine takes a few
tenths of a second per step on a laptop), so the block prints two thresholds and the ratio to the
nearest power of ten. PyTorch's per-operation overhead means that its advantage
grows with the tensor sizes: on a larger matrix product the compiled code does thousands of
multiplications per call, where the engine's loop would do them one at a time.

### What you should see

- Reverse mode takes a few dozen lines once each primitive knows its local derivative. The
  `+=` in the backward sweep is what handles a variable used more than once.
- The engine reproduces the hand-computed gradients of the Section 4 example, agrees with finite
  differences, and gives the same 337 gradients as PyTorch to rounding error.
- Memory and time grow with the number of graph nodes: 66,440 for 100 examples through
  337 parameters. The tape is the price of reverse mode.
- The initial loss is above $\ln 2$ because the output neuron has the He scale; the initial-loss
  check of Section 14 would catch it, and a smaller output initialisation fixes it.
- With $\eta = 1.0$ the MLP fits the moons in 100 steps. The learning rate matters even for a toy
  (Section 9).

### Try this

1. Add a softplus primitive, $\ln(1 + e^x)$, and a `tanh` option for the hidden layers, and
   compare the training curves with ReLU's.
2. Add forward mode: give `Value` a `tangent` field propagated by every operation, and compute
   $\partial f/\partial x_1$ of the Section 4 example in one forward pass. Count how many passes
   the gradient with respect to both inputs needs.
3. Support a `Value` exponent in `x ** y` and check the gradient with respect to both arguments
   by finite differences. Which argument's derivative has a domain restriction?
4. Write a micro tensor version in which `data` is a NumPy array and each operation stores a VJP
   function instead of scalar local derivatives, and time it against the scalar engine.
5. Train with $\eta = 0.5$ for 50 steps and then $\eta = 0.1$, and compare the accuracy at step
   100 with the run above.

## Lab 3 — Optimisers, schedules and the range test {#lab3}

**Goal.** You find learning rates with a range test instead of guessing them, then run SGD,
momentum, Nesterov momentum, Adam and AdamW on the same network and data from the same
initialisation, and read what the differences are and are not. A second experiment measures what a
learning-rate schedule does to the noise floor of a noisy regression, and a last one verifies the
sign-descent behaviour of Adam's first step. The lab uses the digits data that ships with
scikit-learn and a synthetic regression, so nothing is downloaded, and it runs in under half a minute
of CPU time. Its network, a $64 \to 128 \to 128 \to 10$ ReLU MLP with 26,122 parameters, is the
digits network of [Section 2](#s2) and the one [Lab 4](#lab4) trains in full.

### Step 1: the data

`load_digits` holds 1,797 images of 8 by 8 pixels with 10 classes. The split is 60/20/20,
stratified so that every class keeps its share, which gives 1,078 training, 359 validation and
360 test images. Standardisation uses the **training** statistics only, as [Module 01, Section 10](module_01_EN.html#s10)
requires: a statistic computed on the validation or test images would leak them into training. A
few pixels are constant (always zero) in the training set; their standard deviation is replaced by 1
so the division is defined and the standardised column stays zero. The test set is not touched in
this lab.

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

### Step 2: the model and the evaluation function

`make(seed)` builds the network under `torch.manual_seed(seed)`, so the same seed gives the same
initial weights (PyTorch's default initialisation, which for `nn.Linear` is a uniform
distribution whose variance is $1/(3 n_{\text{in}})$; [Section 6](#s6) discusses how it
compares with He's). `evaluate` returns the loss and the accuracy. It calls `model.eval()` and
runs under `torch.no_grad()`, the two habits of [Section 13](#s13): the model has no dropout or
batch norm yet, so `eval()` changes nothing here, but the habit costs nothing and the day it
matters it matters a great deal.

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

An untrained 10-class classifier should have a loss near $\ln 10$, the loss of the uniform
prediction ([Section 14](#s14), the initial-loss check). That is what the run shows to the
precision that a random initialisation allows.

### Step 3: the range test, written out

The **learning-rate range test** of [Section 9](#s9) trains for a short run while the learning
rate grows geometrically, and records the loss. At a very small rate nothing happens; at a good
rate the loss falls fast; past the largest stable rate it rises and the run diverges. The block
below runs 200 steps with $\eta$ growing from $10^{-5}$ to $10$, so that every step multiplies it
by the same factor $(10^{6})^{1/199}$, with mini-batches of 64 cycled through the training set.
The raw mini-batch loss is noisy, so what is recorded is its exponential moving average with
factor 0.9, corrected for the bias that starts it at zero (the same correction as Adam's). The test stops when the
smoothed loss exceeds four times its minimum, and returns three read-outs: the rate at the
**steepest fall** of the smoothed loss against $\log \eta$, the rate at its **minimum**, and the
rate at which the run was **stopped**. The usual choice is a rate a factor of several below the
minimum, near the steepest fall.

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

### Step 4: reading the two curves

The plot puts the smoothed loss against the learning rate on a logarithmic axis, for both
optimisers. Vertical lines mark the steepest fall. Read it from left to right: a flat stretch
where the rate is too small to move the loss in 200 steps, a descent, a minimum, and a rise to the
point where the run was stopped.

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

The two optimisers do not share a scale. Adam's steepest fall (0.0024) and its minimum
(0.017) lie 20 and 26 times below those of SGD with momentum (0.048 and 0.44), and it diverges
earlier, at 0.089 against 0.58. This is the same fact as Adam's normalisation: its
step is about $\eta$ per parameter, whatever the gradient's size, where SGD's step is $\eta$ times
a gradient that is small for most parameters ([Section 8](#s8)). It is also why a learning rate
found for one optimiser is useless for another.

### Step 5: the shoot-out

Six optimiser settings, trained for 20 epochs from the *same* initial weights (seed 0) and with
the *same* order of mini-batches of 64, so that the only difference is the update rule. After every
epoch the loss on the whole training set is recorded (in `eval()` mode, without gradients), which is
a cleaner measure than the loss of the last mini-batch. The table reports the first epoch whose
full training loss is below 0.1, the final training loss, and the validation loss and accuracy.

The settings are SGD at $\eta = 0.05$ and at $\eta = 0.5$, momentum 0.9 at $\eta = 0.05$,
Nesterov momentum 0.9 at $\eta = 0.05$, Adam at $2 \times 10^{-3}$ (near the range test's steepest
fall), and AdamW at the same rate with weight decay $10^{-2}$.

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

Four observations. First, plain SGD at $\eta = 0.05$ is slow, and it is slow in a specific way:
its loss is still falling when training stops (0.129 after 20 epochs, a level the other settings
passed in epoch 3 or 4), and its validation accuracy, 93.3%, is that of an unfinished run. Raising
its rate to 0.5 fixes that, and on this problem 0.5 is stable. Second, momentum 0.9 at
$\eta = 0.05$ behaves like plain SGD at 0.5, which is the effective learning rate $\eta/(1 - \mu)$
of [Section 7](#s7): with a steady gradient the velocity grows to $1/(1-\mu) = 10$ times the
gradient. The two curves are close but not identical, because the steady-gradient picture holds
only where the gradient changes slowly. Third, Nesterov's variant is almost indistinguishable from
the classical one here; its advantage is a property of the analysis of smooth convex problems,
not a visible effect on a problem this easy. Fourth, Adam is not faster than well-tuned
SGD in reaching a training loss of 0.1 (epoch 4, against 3 for SGD at 0.5 and for Nesterov momentum), although it
reaches the lowest final training loss, 0.0018; AdamW, with a decay of $10^{-2}$ that is small on
this scale, differs from Adam only in the last digits. The five settings that train end with
validation accuracies between 96.7% and 97.5%, a spread of 0.8 points. The binomial standard
error of an accuracy near 97% on 359 images is $\sqrt{0.97 \cdot 0.03 / 359} \approx 0.009$, about
one point, so the ranking among them is not established by this experiment. On an easy problem the
choice of optimiser changes the speed, not the destination. (The validation loss, which is lower
for SGD at 0.5 than for Adam, is a different matter: a network that has driven its training loss
to 0.002 is confident, and its confidence is penalised on the images it gets wrong.)


### Step 6: schedules and the noise floor of SGD

[Section 9](#s9) argues that with a constant rate, SGD does not converge to the minimum but to a
noise floor whose excess loss is proportional to $\eta$, and that a decaying schedule removes
the excess. This step measures it. The data are a noisy regression, $y = \sin 3x + 0.1\,\xi$
with $\xi \sim \mathcal{N}(0, 1)$, 4,096 training and 2,048 validation points, so that even the true function has a validation
MSE equal to the noise variance, about $0.01$: that number, computed in the first print, is the
best that any model can reach, and the *excess* over it is what the schedule controls. A
$1 \to 64 \to 64 \to 1$ ReLU network is trained with SGD, momentum 0.9, peak $\eta = 0.05$,
batches of 32 and 20 epochs (2,560 steps) under three schedules: constant; step decay
($\times 0.1$ at 50% and $\times 0.01$ at 75% of the steps); and 5% linear warmup followed by
cosine decay to zero. The initial weights and the batch order are the same for all three.

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

The constant rate ends 26% above the floor, and its last five epochs vary with a standard
deviation of about $7 \times 10^{-4}$; the two decaying schedules end within half a per cent of
the floor, and their last epochs barely move. The excess of the constant schedule is the noise
floor of SGD: the iterate keeps being kicked by the gradient noise of mini-batches, and the size
of the kicks is set by $\eta$. Decaying the rate shrinks the kicks. Note also that the two
decaying schedules are indistinguishable at this scale; what matters is that the rate reaches a
small value, not the shape of the path. The comparison is one run per schedule, and the size of
the constant schedule's excess is the value of one last point of a jittering curve, not an
average: the last Try-this item separates the trend from the chance.

### Step 7: Adam's first step is sign descent

At the first step $t = 1$ the moment estimates are $m = (1 - \beta_1) g$ and
$v = (1 - \beta_2) g^2$, and after the bias correction of [Section 8](#s8) $\hat m = g$ and
$\hat v = g^2$, so the update is $\eta\, g / (|g| + \epsilon) \approx \eta\,\mathrm{sign}(g)$:
every parameter with a non-negligible gradient moves by almost exactly $\eta$, whether its
gradient is $10^{-7}$ or $10^{-2}$. The block checks it on the digits network: one Adam step with
$\eta = 10^{-3}$ on the first batch of 64 training images from a fresh model. It counts the
parameters whose gradient is exactly zero, reports the range of the other gradient magnitudes,
and the fraction of those parameters that moved by more than $0.99\eta$.

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

The step sizes of the parameters differ by almost nothing, although the gradients differ over
more than five orders of magnitude. This is Adam's strength and its hazard. It is a strength
because parameters with tiny gradients (a rarely used embedding, a layer far from the loss)
still move at a useful rate. It is a hazard because a parameter whose gradient is pure noise
moves just as far: this is the reason Adam needs a warmup when $\beta_2$ is close to 1 and the
second-moment estimate is poor in the first steps ([Section 9](#s9)). The zero-gradient
parameters do not move, because $0/(0 + \epsilon) = 0$. Of the 615, 512 are the first-layer
weights of the four constant pixels ($4 \times 128$); the other 103 are second-layer weights for
which no image of the batch has both the input unit and the output unit active, so the product
$h_i \delta_j$ of [Section 3](#s3) is zero on every example.

### What you should see

- The range test finds the right decade in seconds. Adam's usable range sits well below that of
  SGD with momentum: its steepest fall and its minimum are 20 and 26 times lower, and it
  diverges at a rate 6.5 times lower.
- Momentum 0.9 at $\eta = 0.05$ behaves like plain SGD at $\eta = 0.5$: the effective rate is
  $\eta/(1 - \mu)$.
- Adam is not faster than well-tuned SGD with momentum on this easy problem, and the five
  settings that train end within 0.8 points of one another on validation accuracy, inside one
  standard error.
- A constant learning rate ends 26% above the noise floor (in this run) and jitters from epoch
  to epoch; both decaying schedules end within half a per cent of the floor.
- Adam's first step moves almost every parameter by $\eta$, whatever the size of its gradient:
  sign descent.

### Try this

1. Add RMSprop and Adagrad (`torch.optim`) to the shoot-out, with rates from your own range
   tests, and place them in the table.
2. Repeat the shoot-out with six hidden layers of 64 units and find where plain SGD stops
   working.
3. Run AdamW at $\eta = 3 \times 10^{-2}$ (above the range test's minimum) with and without a 5%
   warmup, and plot the first 100 steps of each.
4. Repeat Step 6 with three seeds at $\eta = 0.02$ and $\eta = 0.05$ and average the final MSE of
   the constant schedule, to separate the trend (excess proportional to $\eta$) from the
   randomness of the last point.

