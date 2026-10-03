## Physics-informed neural networks {#s9}

Every family so far learns from examples. An engineer is often in the opposite position: the
differential equation is known, from a conservation law and a constitutive model, and the
measurements are few. A **physics-informed neural network** (PINN; Raissi, Perdikaris and
Karniadakis 2019) uses the equation itself as the training signal. A network represents the
solution, $u_\theta(\mathbf{x}, t)$, a smooth function of space and time with parameters
$\theta$, and the loss measures how badly that function satisfies the equation, the boundary and
initial conditions, and whatever data exist.

### The composite loss

Write the equation as $\mathcal{N}[u] = 0$, where $\mathcal{N}$ is a differential operator (for
the heat equation, $\mathcal{N}[u] = u_t - u_{xx}$), and the initial and boundary conditions as
$\mathcal{B}[u] = 0$ (for an end held at zero, $\mathcal{B}[u] = u(0, t)$). The loss has three
terms:

$$
\mathcal{L}(\theta) =
\lambda_d \underbrace{\frac{1}{N_d}\sum_{i=1}^{N_d}\big(u_\theta(\mathbf{x}_i,t_i) - u_i\big)^2}_{\text{data}}
+ \lambda_r \underbrace{\frac{1}{N_c}\sum_{j=1}^{N_c}\big(\mathcal{N}[u_\theta]\,(\mathbf{x}_j,t_j)\big)^2}_{\text{residual}}
+ \lambda_b \underbrace{\frac{1}{N_b}\sum_{k=1}^{N_b}\big(\mathcal{B}[u_\theta]\,(\mathbf{x}_k,t_k)\big)^2}_{\text{boundary and initial}}.
$$

The data term is ordinary regression on $N_d$ measurements $u_i$. The residual term is evaluated
at $N_c$ **collocation points**, places where the equation is enforced; they need no
measurements, so there can be as many as compute allows, on a grid or redrawn at random every
step. The boundary term enforces the conditions at $N_b$ points on the boundary and at $t = 0$.
The weights $\lambda_d$, $\lambda_r$ and $\lambda_b$ set the exchange rate between the terms, and
choosing them is most of the difficulty, as the rest of this section shows. With no data the
PINN is a solver; with data and an unknown coefficient it is an estimator.

Nothing here needs a mesh: collocation points are just points. That is the attraction. It is
also why the method inherits none of the error estimates that come with a mesh-based solver's
convergence theory.

::: figure id=fig-05-21
PINN schematic. The input $t$ (and $\mathbf{x}$ for a PDE) enters an MLP whose output is
$u_\theta$. Two automatic-differentiation branches compute $u_\theta'$ and $u_\theta''$, which
feed a residual box $\mathcal{N}[u] = u'' + 2\zeta\omega_0 u' + \omega_0^2 u$. Three loss terms
leave the diagram: the squared residual at the collocation points, the initial conditions at
$t = 0$, and the data misfit at the measurement times; they are multiplied by their weights
$\lambda$ and summed into $\mathcal{L}(\theta)$.
:::

### Derivatives with respect to the inputs

The residual needs derivatives of the network's output with respect to its *input*, not its
weights. Reverse-mode automatic differentiation ([Module 02](module_02_EN.html)) computes them
exactly, to floating-point precision, with no finite differences:

```python
import math, torch, torch.nn as nn

W0, ZETA, T_END = 2 * math.pi, 0.1, 2.0

def d(u, t):
    """du/dt at every point; create_graph keeps the result differentiable."""
    return torch.autograd.grad(u, t, grad_outputs=torch.ones_like(u),
                               create_graph=True)[0]

net = nn.Sequential(nn.Linear(1, 32), nn.Tanh(), nn.Linear(32, 32), nn.Tanh(),
                    nn.Linear(32, 32), nn.Tanh(), nn.Linear(32, 1))
t_c = torch.linspace(0, T_END, 200).reshape(-1, 1).requires_grad_(True)
u = net(t_c / T_END)                     # inputs scaled to [0, 1]
u_t = d(u, t_c)
u_tt = d(u_t, t_c)                       # the same call applied twice
residual = u_tt + 2 * ZETA * W0 * u_t + W0**2 * u
loss_res = residual.pow(2).mean()        # then add the condition terms and backward()
```

Two details matter. `grad_outputs=torch.ones_like(u)` asks for the gradient of
$\sum_j u_\theta(t_j)$; each output depends only on its own input, so that gradient is the vector
of the 200 pointwise derivatives. `create_graph=True` records the derivative computation itself
in the graph. Without it the first derivative comes back as a constant tensor: it cannot be
differentiated again to give $u''$, and the residual has no path back to $\theta$. With it,
`backward()` differentiates through the derivatives, at the cost of a few forward passes' worth
of work per step.

The activation must have useful second derivatives. ReLU is piecewise linear, so its second
derivative is zero almost everywhere: a ReLU network's $u_\theta''$ vanishes at every collocation
point and the $u''$ term silently drops out of the residual. PINNs use smooth activations, most
often tanh.

### The damped oscillator

The running example is a mass–spring–damper released from rest at unit displacement:

$$
u'' + 2\zeta\omega_0 u' + \omega_0^2 u = 0, \qquad u(0) = 1, \quad u'(0) = 0,
$$

with natural frequency $\omega_0 = 2\pi$ rad/s (1 Hz) and damping ratio $\zeta = 0.1$, on
$t \in [0, 2]$ s. The residual of a candidate is
$r(t) = u_\theta'' + 2\zeta\omega_0 u_\theta' + \omega_0^2 u_\theta$, and the exact solution for
$\zeta < 1$ is

$$
u(t) = e^{-\zeta\omega_0 t}\Big[\cos\omega_d t + \frac{\zeta\omega_0}{\omega_d}\sin\omega_d t\Big],
\qquad \omega_d = \omega_0\sqrt{1 - \zeta^2},
$$

so $\omega_d = 6.252$ rad/s and the envelope decays as $e^{-0.628 t}$. The conditions hold:
$u(0) = 1$, and $u'(0) = -\zeta\omega_0 + \omega_d \cdot \zeta\omega_0/\omega_d = 0$. The exact
answer is what makes the example useful: [Lab 4](#lab4) can report a relative $L_2$ error, which
a real problem would not offer.

::: worked title="The residual of a near miss"
Try the undamped solution $u(t) = \cos\omega_0 t$. It meets both conditions exactly:
$u(0) = 1$ and $u'(0) = -\omega_0\sin 0 = 0$.

Its derivatives are $u' = -\omega_0\sin\omega_0 t$ and $u'' = -\omega_0^2\cos\omega_0 t$. The
$u''$ term cancels the $\omega_0^2 u$ term, leaving only the damping term:

$$
r(t) = -2\zeta\omega_0^2\sin\omega_0 t = -2(0.1)(2\pi)^2\sin 2\pi t = -0.8\pi^2\sin 2\pi t = -7.90\sin 2\pi t.
$$

At $t = 0.25$ s, $\sin(\pi/2) = 1$ and $r = -7.90$. Over $[0, 2]$ s, two whole periods, the mean
of $\sin^2$ is $\tfrac12$, so the mean of $r^2$ is $(0.8\pi^2)^2/2 = 62.3/2 = 31.2$ (31.0 on Lab
4's 200 evenly spaced collocation points, which include both ends).

Now the trivial solution $u = 0$: its residual is zero everywhere, and its initial-condition
loss is $(0 - 1)^2 + 0^2 = 1$.

With $\lambda_{ic} = 1$ the loss scores the near miss $31.2$ and zero $1$: a curve that lacks
only the damping is rated 31 times worse than doing nothing. That is the trivial-solution failure
in miniature. With $\lambda_{ic} = 100$, zero costs 100 against the near miss's 31.2, and the
ranking flips. That is Lab 4's first fix.
:::

### The trivial solution

The equation is homogeneous, so $u \equiv 0$ satisfies it exactly. Only the initial conditions
rule zero out, and the optimiser does not know which of its terms expresses what the modeller
wants: it reduces whichever is largest. In [Lab 4](#lab4) a freshly initialised network starts
with a residual loss of 52.5 against an initial-condition loss of 1.36 (Figure 5.23). The
quickest way to shrink 52.5 is to shrink the output, and the optimiser takes it. After 3,000
steps with $\lambda_{ic} = 1$ the residual term is about $6 \times 10^{-3}$, the
initial-condition term about 0.99, and the relative error 0.998: a flat line near zero. With
$\lambda_{ic} = 0$ the error is 1.000. The loss is small and the answer is wrong, which is the
most important thing to know about PINNs.

::: figure id=fig-05-23
Bar chart on a logarithmic vertical axis of the loss terms of Lab 4's freshly initialised
network. Dimensional formulation: residual 52.5, initial conditions 1.36. Non-dimensional
formulation: residual 0.034, initial conditions 1.36. The residual bar drops by a factor of
about 1,500 while the initial-condition bars are equal.
:::

### Three fixes, measured

**Weight the conditions.** With $\lambda_{ic} = 100$ the relative error is about 0.015 after
5,000 steps and 0.004 after 10,000. It works, but the weight was found by trial.

**Non-dimensionalise.** Measure time in units of $1/\omega_0$. This is the fix an engineer
would apply to a numerical solver anyway.

::: worked title="Why non-dimensionalising works"
Put $\hat t = \omega_0 t$, so $d/dt = \omega_0\, d/d\hat t$. Substituting,
$\omega_0^2 u_{\hat t\hat t} + 2\zeta\omega_0^2 u_{\hat t} + \omega_0^2 u = 0$; divide by
$\omega_0^2$:

$$
u_{\hat t\hat t} + 2\zeta u_{\hat t} + u = 0, \qquad \hat t \in [0, 4\pi].
$$

The coefficients are 1, $2\zeta = 0.2$ and 1, all of order 1.

The same near miss, $u = \cos\hat t$, now leaves $r = -0.2\sin\hat t$, and over the same two
periods the mean of $r^2$ is $0.2^2/2 = 0.02$, against 1.0 for zero. The loss ranks the near
miss 50 times better than the trivial solution, with no weight to tune.

In dimensional units every term of the residual carries a factor of up to
$\omega_0^2 = 39.5$, so a network output of order 1 gives residuals of order 40 and a residual
loss of order $10^3$, against an initial-condition loss of order 1. A small random network
outputs values well below 1, which is why Lab 4 starts at 52.5 rather than $10^3$. Halving the
output halves the residual; sending it to zero removes the residual entirely.
:::

In [Lab 4](#lab4) the non-dimensional PINN starts with a residual loss of 0.034 and reaches a
relative error of 0.0004 after 10,000 steps, ten times better than the weighted version, with
$\lambda_{ic} = 1$.

**Impose the conditions by construction.** Lagaris, Likas and Fotiadis (1998) wrote the solution
as a trial function that satisfies the conditions whatever the network does:
$u_\theta(t) = 1 + t^2 N_\theta(t)$ gives $u_\theta(0) = 1$ and
$u_\theta'(0) = [2tN_\theta + t^2N_\theta']_{t=0} = 0$. The initial-condition term disappears, and
zero is no longer reachable. Yet in dimensional units the error is still about 0.09 after
10,000 steps (a Lab 4 extension), because the badly scaled residual still dominates training.
The construction removes the trivial solution, not the scaling problem. Scale first.

### Inverse problems

PINNs come into their own when something in the equation is unknown. Make it a trainable
parameter. [Lab 4](#lab4) treats $\zeta$ as unknown, optimises $\log\zeta$ (which keeps $\zeta$
positive and makes steps relative) from a starting value of 0.5, and adds a data term with
weight 10 on 12 readings at random times with noise of standard deviation 0.02. After 10,000
steps $\zeta = 0.0987$ against the true 0.1.

The honest comparison is a least-squares fit of the closed-form solution to the same 12
readings (SciPy's `curve_fit`), which gives $0.0977 \pm 0.0015$. The PINN matches the classical
fit; it does not beat it. When a closed form or a cheap solver exists, wrap it in a
least-squares fit. The PINN earns its cost where neither exists, or where a whole field must be
recovered from a PDE: a damping ratio from a dozen accelerometer readings in a structure with no
closed form, a thermal conductivity from a few thermocouples, or a material parameter from a
handful of strain gauges.

::: figure id=fig-05-22
Lab 4's results on one time axis from 0 to 2 s. The exact solution, a decaying oscillation of
1 Hz; the dimensional PINN with $\lambda_{ic} = 1$, a flat line near zero; the PINN with
$\lambda_{ic} = 100$ and the non-dimensional PINN, both lying on the exact curve; the 12 noisy
readings as dots; and the inverse-problem fit with $\zeta = 0.099$ through them.
:::

### Failure modes beyond the trivial solution

- **Stiffness and multiscale behaviour.** Terms of very different sizes give gradients of very
  different sizes, and the largest term trains while the others stall. Wang, Teng and
  Perdikaris (2021) analyse this gradient imbalance and adapt the weights during training.
- **Spectral bias.** Networks fit low frequencies first (Rahaman et al. 2019), so oscillatory or
  sharp solutions converge slowly. Fourier-feature inputs, $[\sin k\hat t, \cos k\hat t]$ for a
  few $k$, help (Tancik et al. 2020).
- **Causality.** Over a long time window the optimiser fits late times before the early
  solution they depend on has settled. Time-marching over subintervals restores the order.
- **Regimes where training fails outright.** Krishnapriyan et al. (2021) show convection at high
  speed as one.
- **Hand-tuned weights.** Every $\lambda$ chosen by trial is a hyperparameter tuned against the
  answer you could not otherwise check.
- **Ill-posed set-ups.** Remove a boundary condition and infinitely many functions have zero
  residual; the PINN returns one of them with a small loss ([Exercise 12](#e12)).

### The honest comparison

For forward problems on a known geometry, a finite-element or finite-difference solver is
usually faster and more accurate. For the oscillator, SciPy's `solve_ivp` (RK45, relative
tolerance $10^{-8}$) reaches a relative error of about $7 \times 10^{-9}$ in a few milliseconds
on a desktop CPU; the best PINN above took 10,000 steps, about 15 s, to reach $4 \times 10^{-4}$.
Claims for learned PDE solvers should be checked against strong classical baselines run to the
same accuracy (McGreivy and Hakim 2024). PINNs earn their place in data assimilation and inverse
problems, on awkward domains where meshing is the bottleneck, and where a differentiable model
of the parameters is wanted.

::: keyidea
A PINN minimises a weighted sum of residual, condition and data terms, and it will satisfy the
largest term in the cheapest way available; scale the equation so that the terms are comparable,
and judge the result against a classical solver.
:::

::: check
Why does a PINN for a homogeneous equation need its initial or boundary terms to avoid
$u = 0$?
:::

::: answer
Zero satisfies the equation exactly, so the residual term alone cannot exclude it. Only the
conditions rule it out, and if their weight is small relative to the residual term the optimiser
finds zero first, as Lab 4 does with $\lambda_{ic} = 1$ in dimensional units.
:::

::: check
What does `create_graph=True` do in the derivative call?
:::

::: answer
It records the derivative computation in the autograd graph, so $u'$ can be differentiated again
to give $u''$ and the loss built from them can be differentiated with respect to the network's
weights. Without it the second derivative and the residual's gradient are not available.
:::

## Neural operators and surrogate models {#s10}

A PINN solves one instance. Change the load or the conductivity and it trains again. Design work
asks the same equation hundreds of times with different inputs, and wants each answer quickly.
**Operator learning** targets the map itself: an operator $\mathcal{G}$ takes an input function
$a$ (a coefficient field such as a conductivity $k(\mathbf{y})$, a forcing, a boundary condition
or a geometry) to the solution function $u = \mathcal{G}(a)$. A **neural operator**
$\mathcal{G}_\theta$ is trained on pairs $(a_i, u_i)$ produced by a solver, typically by
minimising $\frac{1}{N}\sum_i \|\mathcal{G}_\theta(a_i) - u_i\|^2 / \|u_i\|^2$, and then answers a
new instance in one forward pass.

### Surrogates are an old idea

Engineering has built **surrogate models** of expensive codes for decades. Response surfaces fit
low-order polynomials of the design variables to a few runs. Kriging, or Gaussian-process
regression, interpolates between runs and reports its own uncertainty. Reduced-order models by
proper orthogonal decomposition (POD) collect solution snapshots, take their leading singular
vectors as modes $\phi_k(\mathbf{y})$, and write a new solution as

$$
u(\mathbf{y}) \approx \sum_{k=1}^{p} c_k\, \phi_k(\mathbf{y}),
$$

with only the coefficients $c_k$ to find for each new input. Neural operators are the same idea
with learned bases.

### DeepONet

DeepONet (Lu et al. 2021) is the POD form with both halves learned. A **branch** net reads the
input function at $m$ fixed sensor locations and returns $p$ coefficients,
$\mathbf{b}(a) = b\big(a(\mathbf{y}_1), \dots, a(\mathbf{y}_m)\big) \in \R^p$. A **trunk** net reads
the query point and returns $p$ basis values, $\mathbf{t}(\mathbf{y}) \in \R^p$. The output is
their dot product:

$$
\mathcal{G}_\theta(a)(\mathbf{y}) \approx \sum_{k=1}^{p} b_k(a)\, t_k(\mathbf{y}) + b_0.
$$

The trunk plays the role of the POD modes and the branch of their coefficients. Its theory goes
back to Chen and Chen (1995), who proved a universal approximation theorem for operators in this
branch-and-trunk form.

::: worked title="DeepONet shapes for a 1D problem"
The input function is sampled at $m = 100$ sensors: a vector of 100 numbers enters the branch
net, which returns $p = 64$ coefficients. A query point $y$, one number, enters the trunk net,
which returns 64 basis values. The prediction at $y$ is the dot product of the two 64-vectors,
plus the bias.

For a field of 10,000 query points the branch runs once (the input function does not change),
the trunk runs 10,000 times (a batch of shape `(10000, 1)` giving `(10000, 64)`), and the
output is one matrix–vector product, `(10000, 64) @ (64,)`.
:::

::: figure id=fig-05-24
DeepONet. Left: an input function $a(y)$ drawn as a curve with $m$ sensor dots, feeding a branch
net that outputs a vector $\mathbf{b}$; a query point $y$ feeding a trunk net that outputs a
vector $\mathbf{t}$; the two meet in a dot product giving $\mathcal{G}(a)(y)$. Right, the POD
analogy: a few modes $\phi_k(y)$ drawn as curves and their coefficients $c_k$ as bars.
:::

### The Fourier neural operator

The Fourier neural operator (FNO; Li et al. 2021) works on a grid. It lifts the input pointwise
to a width-$d_v$ field, $\mathbf{v}_0 = P(a)$, applies $L$ Fourier layers, and projects back,
$u = Q(\mathbf{v}_L)$. Each layer is

$$
\mathbf{v}_{l+1} = \sigma\Big(\mathbf{W}\mathbf{v}_l + \mathcal{F}^{-1}\big(R_l \cdot \mathcal{F}(\mathbf{v}_l)\big)\Big),
$$

where $\mathcal{F}$ is the discrete Fourier transform along space, $R_l$ multiplies each of the
lowest $k_{\max}$ modes by a learned complex $d_v \times d_v$ matrix and zeroes the rest, and
$\mathbf{W}$ is a pointwise linear map. The spectral product is a convolution with a kernel as wide
as the domain, so one layer couples every point to every other.

::: worked title="Parameters of one 1D Fourier layer"
Take width $d_v = 32$ and $k_{\max} = 16$ retained modes.

The spectral tensor $R$ holds one $32 \times 32$ complex matrix per mode:
$16 \times 32 \times 32 = 16{,}384$ complex entries, that is $32{,}768$ real parameters.

The pointwise map $\mathbf{W}$ with its bias has $32 \times 32 + 32 = 1{,}056$.

The spectral part is 97% of the layer's $33{,}824$ real parameters, and none of these numbers
depends on the number of grid points.
:::

```python
import torch, torch.nn as nn, torch.nn.functional as F

class FourierLayer1d(nn.Module):
    def __init__(self, width=32, k_max=16):
        super().__init__()
        self.k_max = k_max
        self.R = nn.Parameter(torch.randn(k_max, width, width, dtype=torch.cfloat)
                              / width**2)
        self.W = nn.Conv1d(width, width, kernel_size=1)    # pointwise W v + bias

    def forward(self, v):                                  # v: (batch, width, n_grid)
        v_hat = torch.fft.rfft(v)                          # (batch, width, n_grid//2 + 1)
        out = torch.zeros_like(v_hat)
        out[..., :self.k_max] = torch.einsum("bik,kio->bok",
                                             v_hat[..., :self.k_max], self.R)
        spectral = torch.fft.irfft(out, n=v.shape[-1])     # back to the same grid
        return F.gelu(self.W(v) + spectral)
```

(PyTorch's `numel` counts a complex entry once and reports 17,440.) The same layer accepts `n_grid = 64` or `256`: the weights do not
depend on the grid, so a trained FNO can be evaluated at another resolution. The caveats are
real. Frequencies above $k_{\max}$ are never modelled, a coarse training grid aliases fine
detail into the retained modes, and a finer grid does not widen the training distribution.

::: figure id=fig-05-25
One Fourier layer. Upper path: $\mathbf{v}$ → FFT → keep the $k_{\max}$ lowest modes (the rest
set to zero) → multiply by $R$ → inverse FFT. Lower path, in parallel: $\mathbf{v}$ →
$\mathbf{W}$, a pointwise linear map. The two paths are summed and passed through the
nonlinearity $\sigma$.
:::

On unstructured meshes, graph-network simulators such as MeshGraphNets ([Section 8](#s8)) play
the operator's role: the mesh is the graph and message passing replaces the Fourier transform.

### Validity

A surrogate is valid on the distribution of inputs it was trained on. Outside it, in another
geometry family, load regime or material, its error is unquantified, and it does not say so: it
returns a smooth, confident field. Before using one:

- check every new input against the training ranges, variable by variable;
- validate against fresh solver runs in the region where it will be used;
- report the error per regime, not one average, and state a validity domain;
- compare speed only against a solver run to the same accuracy (McGreivy and Hakim 2024).

Used that way, a neural operator is the practical route to a fast approximate finite-element
solver for a family of designs: trained on a few thousand solver runs, it answers a new member
of the family in one forward pass, and only inside the family those runs covered.

::: check
What does a trained neural operator take as input, and what does it return?
:::

::: answer
A function (a coefficient field, forcing or boundary condition, sampled at points) and the
corresponding solution function, for any member of the family it was trained on, in one
forward pass.
:::

::: check
Name two checks before using a surrogate trained on solver output for a new design.
:::

::: answer
That the new input lies inside the training ranges; and validation against fresh solver runs in
the region where it will be used, with the error reported per regime.
:::

## Contrastive and self-supervised learning {#s11}

Labels are expensive; structure is free. A plant logs months of vibration data and has a handful
of labelled faults. **Self-supervised learning** trains an encoder on a **pretext task** that
the unlabelled data define by themselves, and the representation is judged by a **linear probe**:
a logistic regression fitted on a few labels to the frozen features. **Contrastive learning** is
the pretext task of telling which of several candidates is another view of the same input.

### InfoNCE is a classification loss

Take an anchor embedding $\mathbf{z}_i$, one positive $\mathbf{z}_i^+$ (another view of the same
input) and $N - 1$ negatives (views of other inputs), $N$ candidates in all. Score each candidate
by $\mathrm{sim}(\mathbf{z}_i, \mathbf{z}_j)/\tau$, where $\mathrm{sim}$ is the cosine
similarity of L2-normalised embeddings and $\tau$ a temperature. A softmax over the scores is a
classifier that must pick the positive, and its cross-entropy is the **InfoNCE** loss:

$$
\mathcal{L}_{\text{InfoNCE}} = -\log\frac{\exp\big(\mathrm{sim}(\mathbf{z}_i,\mathbf{z}_i^+)/\tau\big)}{\sum_{j=1}^{N}\exp\big(\mathrm{sim}(\mathbf{z}_i,\mathbf{z}_j)/\tau\big)},
$$

with the positive among the $N$ terms of the sum. Cosine scores lie in $[-1, 1]$, so a small
$\tau$ is what lets the softmax become confident.

van den Oord, Li and Vinyals (2018) showed that the loss bounds the mutual information between
the two views: $I(\mathbf{x}; \mathbf{x}^+) \ge \log N - \mathcal{L}_{\text{InfoNCE}}$. The loss
cannot fall below zero, so the estimate can never exceed $\log N$; more negatives, which means
bigger batches, allow larger values.

::: worked title="InfoNCE with four candidates"
Cosine similarities $s = (0.9, 0.2, 0.1, -0.3)$, positive first.

$\tau = 1$: the exponentials are $2.460$, $1.221$, $1.105$ and $0.741$, summing to $5.527$. The
positive's probability is $2.460/5.527 = 0.445$, the loss $-\log 0.445 = 0.810$, and the bound
$\log 4 - 0.810 = 1.386 - 0.810 = 0.577$ nats.

$\tau = 0.1$: the logits are $(9, 2, 1, -3)$. The positive's probability is
$1/(1 + e^{-7} + e^{-8} + e^{-12}) = 0.9987$, the loss $0.0013$, and the bound $1.385$:
essentially $\log 4 = 1.386$, the cap.
:::

### SimCLR, and why to probe before the head

SimCLR (Chen et al. 2020) applies two random augmentations to each of the $B$ inputs in a batch,
giving $2B$ views. Each view's positive is its twin; the other $2B - 2$ views are negatives, so
InfoNCE runs over $N = 2B - 1$ candidates per view. This is the NT-Xent loss. An encoder $f$
gives the representation $\mathbf{h}$, and a small projection head $g$ gives $\mathbf{z}$, on
which the loss is computed. Probe $\mathbf{h}$, not $\mathbf{z}$: the head learns to discard
whatever the augmentations vary, and that can include what the downstream task needs. In
[Lab 5](#lab5), with 5 labels per class, a probe on $\mathbf{z}$ scores 0.61 and one on
$\mathbf{h}$ 0.93.

::: figure id=fig-05-26
SimCLR pipeline. One vibration window passes through two random augmentations (time shift,
gain, noise) into a shared encoder $f$, giving $\mathbf{h}$, then a projection head $g$, giving
$\mathbf{z}$ on a unit circle. The two views of the window are pulled together; the other batch
members are pushed apart. An arrow leads from $\mathbf{h}$ to a box labelled "linear probe".
:::

Wang and Isola (2020) split what the loss does in two: **alignment** pulls positives together,
and **uniformity** spreads all embeddings over the sphere. If every embedding is the same, every
candidate is equally likely and the loss is $\log(2B - 1) = \log N$: the bound certifies no
information. The negatives are what prevent this collapse. Non-contrastive methods such as BYOL
(Grill et al. 2020) avoid negatives with two asymmetric networks instead.

### The augmentations are the supervision

The augmentations say which differences the encoder must ignore, and so define what it learns.
In [Lab 5](#lab5) the four classes of machine vibration differ in their spectra, but every window
starts at a random phase. With a random time shift among the augmentations the encoder learns
phase invariance; without it the 5-label probe drops from 0.93 to 0.58, near an untrained
encoder's 0.49.

::: worked title="Lab 5 in numbers"
Linear-probe accuracy with 5 / 20 / 100 labels per class:

| Features | 5 | 20 | 100 |
|---|---|---|---|
| Raw waveform | 0.376 | 0.447 | 0.485 |
| FFT magnitude | 0.790 | 0.890 | 0.975 |
| Untrained encoder | 0.494 | 0.733 | 0.882 |
| Contrastive encoder | 0.929 | 0.989 | 0.996 |

With 5 labels per class the pretrained features beat the classical spectral features by
$0.929 - 0.790 = 0.139$, 14 points; with 100 the gap is $0.996 - 0.975 = 0.021$, 2 points.
Pretraining pays most when labels are scarcest.
:::

An augmentation removes task information only if the classes differ in nothing it leaves intact.
Rotating by 180 degrees makes a 6 and a 9 the same digit; colour jitter removes the colour that
identifies corrosion. In Lab 5 a 16-fold gain range did not hurt, because the classes also differ
in harmonic ratios and signal-to-noise ratio. Choose augmentations from the task's real
invariances.

### CLIP, masked modelling, and the lesson

CLIP (Radford et al. 2021) trains an image encoder and a text encoder together on 400 million
image–caption pairs. For a batch of $B$ pairs it forms the $B \times B$ matrix of similarities,
positives on the diagonal, and applies InfoNCE to each row (an image against $B$ captions) and
each column (a caption against $B$ images), averaging the two. Zero-shot classification embeds
prompts such as "a photo of a {label}" and picks the nearest. These embeddings condition
text-to-image models and power many retrieval systems; retrieval-augmented generation is covered
in [AI Agents](../agent/index.html).

::: figure id=fig-05-27
CLIP's $B \times B$ similarity matrix for a batch of $B$ image–caption pairs, images along the
rows and captions along the columns, with the diagonal highlighted as the positives. Arrows
along a row and down a column show the two softmax directions of the symmetric loss.
:::

The other branch is **masked modelling**: hide part of the input and predict it. BERT predicts
masked tokens ([Module 06](module_06_EN.html)); masked autoencoders hide 75% of an image's
patches and reconstruct them (He et al. 2022). Next-token prediction, the objective of
[Modules 07](module_07_EN.html) and [08](module_08_EN.html), is self-supervised in the same
sense.

The general lesson is that a pretext task with no labels can produce a representation that
transfers to tasks with few. In engineering: pretrain on months of unlabelled sensor logs, then
fit a classifier on a handful of labelled faults; or embed incident reports to retrieve similar
past cases.

::: check
What is the largest value the InfoNCE lower bound on mutual information can reach with $N$
candidates?
:::

::: answer
$\log N$, because the loss cannot be negative. With 256 candidates that is
$\log 256 = 5.55$ nats.
:::

::: check
Why does SimCLR evaluate the representation before the projection head?
:::

::: answer
The head learns to discard what the augmentations vary, which can include information the
downstream task needs; $\mathbf{h}$ keeps more. In Lab 5 with 5 labels per class the probe
scores 0.93 on $\mathbf{h}$ against 0.61 on $\mathbf{z}$.
:::

## Mixture of experts {#s12}

A dense network runs all its parameters on every input, so capacity and compute grow together.
A **mixture of experts** (MoE) separates them: keep $E$ expert networks and a small **router**
that sends each input to $k$ of them. Only the chosen experts run.

### The layer

In a transformer ([Module 06](module_06_EN.html)) every block contains a feed-forward network, a
two-layer MLP applied to each token's vector on its own. An MoE layer replaces it with $E$ such
MLPs and a router:

$$
\mathbf{y} = \sum_{e \in \text{top-}k(\mathbf{g}(\mathbf{x}))} \tilde g_e(\mathbf{x})\, \mathrm{FFN}_e(\mathbf{x}),
\qquad \mathbf{g}(\mathbf{x}) = \softmax(\mathbf{W}_r\mathbf{x}),
\qquad \tilde g_e = \frac{g_e}{\sum_{e' \in \text{top-}k} g_{e'}},
$$

with $\mathbf{W}_r \in \R^{E \times d}$ and $k = 1$ or 2. The renormalised weights $\tilde g_e$
sum to 1 over the selected experts. The choice of experts is not differentiable, but the weights
are, and the router learns through them.

The idea is old. Jacobs, Jordan, Nowlan and Hinton (1991) trained adaptive mixtures of local
experts: a soft gate that chooses among expert networks, each of which specialises in a region
of the input space. An engineer who switches models between operating regimes, as gain scheduling does,
has built one by hand, with the scheduling variable as the gate. Shazeer et al. (2017) made the
gate sparse, with noisy top-$k$ gating, and put thousands of experts inside a language model.

```python
import torch, torch.nn as nn

class MoE(nn.Module):
    def __init__(self, d, d_ff, n_experts=8, k=2):
        super().__init__()
        self.k = k
        self.router = nn.Linear(d, n_experts, bias=False)
        self.experts = nn.ModuleList(
            nn.Sequential(nn.Linear(d, d_ff), nn.GELU(), nn.Linear(d_ff, d))
            for _ in range(n_experts))

    def forward(self, x):                                   # x: (n_tokens, d)
        probs = self.router(x).softmax(dim=-1)              # (n_tokens, E)
        top_p, top_e = probs.topk(self.k, dim=-1)
        top_p = top_p / top_p.sum(dim=-1, keepdim=True)     # renormalise over the k
        y = torch.zeros_like(x)
        for e, expert in enumerate(self.experts):
            token, slot = (top_e == e).nonzero(as_tuple=True)
            if len(token):                                  # run e on its tokens only
                y[token] += top_p[token, slot, None] * expert(x[token])
        return y
```

### Parameters against compute

The parameter count grows with $E$; the compute per token grows with $k$.

::: worked title="Counting Mixtral 8x7B"
The published configuration: 32 layers, width $d = 4096$, SwiGLU experts with
$d_{\text{ff}} = 14{,}336$, 8 experts with top-2 routing, attention with 32 query heads and 8
key–value heads of 128 dimensions, and a vocabulary of 32,000 with separate input and output
embeddings.

One SwiGLU expert has three $d \times d_{\text{ff}}$ matrices:
$3 \times 4096 \times 14{,}336 = 176.2$M parameters.
All experts in all layers: $8 \times 32 \times 176.2\text{M} = 45.1$B.

Attention per layer: the query and output projections are $4096 \times 4096$ each; the key and
value projections are $4096 \times 1024$ each ($8 \times 128 = 1024$). That is
$2 \times 16.8\text{M} + 2 \times 4.2\text{M} = 41.9$M per layer, 1.34B over 32 layers.

Embeddings: $2 \times 32{,}000 \times 4096 = 0.26$B.

Total: $45.1 + 1.34 + 0.26 = 46.7$B.

Active per token: two experts per layer, $2 \times 32 \times 176.2\text{M} = 11.3$B, plus the
same attention and embeddings: $11.3 + 1.34 + 0.26 = 12.9$B.

The paper reports 47B total and 13B active. The router ($32 \times 8 \times 4096 = 1.05$M) and
the normalisation weights (about 0.27M) are left out; they change neither figure. A token costs
about as much as in a 13B dense model, while the model holds 3.6 times the parameters.
:::

::: figure id=fig-05-28
An MoE layer in place of a transformer block's feed-forward network. A token vector enters a
router whose softmax over 8 experts is drawn as a bar chart; the two tallest bars select two
expert boxes, highlighted, while the other six are greyed out. The two expert outputs are
weighted by their renormalised router probabilities, summed, and added to the residual stream.
A side note reads "parameters: 8 FFNs; compute: 2 FFNs".
:::

### Routing collapse and the balancing loss

Routing has a feedback loop. An expert that receives more tokens gets more gradient, improves,
and is chosen more; the starved ones never improve. The symptom is most tokens on one or two
experts, and a model that has quietly become a small dense one.

The Switch Transformer (Fedus, Zoph and Shazeer 2022) adds a **load-balancing loss**. Over a
batch of tokens, let $f_e$ be the fraction dispatched to expert $e$ and $P_e$ the mean router
probability for $e$:

$$
\mathcal{L}_{\text{bal}} = \lambda_{\text{bal}}\, E \sum_{e=1}^{E} f_e P_e .
$$

The sum is large when the same experts get both the tokens and the probability. When routing
follows the probabilities, $f_e \approx P_e$, it becomes $E\sum_e P_e^2$; by the Cauchy–Schwarz
inequality, $1 = \big(\sum_e P_e\big)^2 \le E\sum_e P_e^2$, so it is at least 1, with equality
at uniform routing. $f_e$ comes from a hard choice and has no gradient; the loss trains the
router through $P_e$, lowering each expert's probability in proportion to the tokens it already
receives. Switch used $\lambda_{\text{bal}} = 0.01$.

::: worked title="The balancing loss with four experts"
Collapsed routing: every token goes to expert 1, $f = (1, 0, 0, 0)$, with mean router
probabilities $P = (0.7, 0.1, 0.1, 0.1)$. Then
$E\sum_e f_e P_e = 4 \times (1 \times 0.7) = 2.8$.

Uniform routing: $f = P = (0.25, 0.25, 0.25, 0.25)$, so
$E\sum_e f_e P_e = 4 \times 4 \times 0.0625 = 1.0$.

The collapsed router pays 2.8 times the minimum. The loss's gradient with respect to $P$ is
$\lambda_{\text{bal}} E f = \lambda_{\text{bal}}(4, 0, 0, 0)$: it pushes down expert 1's
probability alone, and the softmax hands that probability to the starved experts.
:::

**Capacity** is the other control. Each expert processes at most
$\text{capacity factor} \times (\text{tokens}/E)$ tokens per batch. Overflow tokens are dropped:
they skip the layer and pass on through the residual connection. Nothing fails, so dropped
tokens are a silent loss of quality; count them.

### Other difficulties

When experts are spread across accelerators, every MoE layer sends tokens to their experts and
back, which costs communication; training is also prone to instability early on. DeepSeek-V3
(671B parameters in total, 37B active per token) combines many fine-grained experts with shared
experts that every token uses, and balances load without an auxiliary loss by adjusting a
per-expert bias in the routing scores. As of 2026 MoE is a common design among the largest
openly documented language models; its engineering at that scale, expert parallelism included,
belongs to [Module 08](module_08_EN.html).

Specialisation is less semantic than the name suggests: the Mixtral authors report no obvious
assignment of experts by topic. And the saving is in compute, not memory. Every expert must be
loaded although each token uses $k$ of them: Mixtral's 46.7B parameters take about 93 GB at 2
bytes each, where a 13B dense model would take 26 GB ([Module 10](module_10_EN.html)).

::: check
A model has 8 experts per layer and routes each token to 2. How does its per-token FFN compute
compare with a dense model whose FFN is one expert?
:::

::: answer
About twice: two experts run per token. Its FFN parameters are eight times as many.
:::

::: check
What does the load-balancing loss measure, and what is its minimum?
:::

::: answer
$E\sum_e f_e P_e$ measures how far the token fractions and the router probabilities are
concentrated on the same experts. Its minimum is 1 (times $\lambda_{\text{bal}}$), reached at
uniform routing.
:::

## Choosing a family {#s13}

The families answer different needs, and each has a baseline it must beat before it has earned
its cost. The table keeps the nine needs and adds both.

| Need | Family | First baseline to beat | Main cost or risk |
|---|---|---|---|
| Compress, denoise, detect anomalies in unlabelled data | Autoencoder | PCA and its Q statistic | misses anomalies that resemble normal data |
| A smooth latent space to sample or interpolate designs | VAE, diffusion | PCA plus a Gaussian | VAE samples blur; diffusion is slow to sample |
| The best sample quality with conditioning | Diffusion | a GAN or VAE | tens to hundreds of network evaluations per sample |
| The fastest generator | GAN | diffusion distilled to a few steps | mode collapse |
| Data on a graph or mesh | GNN | hand-made graph features, or the obvious structural rule (the leaf rule) | over-smoothing; edge direction ignored |
| A known PDE and sparse data, or an inverse problem | PINN | a classical solver wrapped in a least-squares fit | trivial solutions; stiffness |
| A fast surrogate for a solver across a family of inputs | Neural operator | a Gaussian-process or POD surrogate, and the solver itself | valid only inside the training family |
| Representations without labels | Contrastive, masked prediction | spectral or engineered features; PCA | the augmentations decide what is learned |
| Capacity without proportional compute | Mixture of experts | a dense model of the same active size | routing collapse; memory |

::: figure id=fig-05-29
Decision flow. "Is the data a graph or mesh?" leads to GNN. "Is there a governing equation?"
leads to PINN (sparse data, inverse problem) or neural operator (many solver runs, many
queries). "Do you need to generate?" leads to diffusion (quality, conditioning), GAN (speed) or
VAE (latent space). "Are labels scarce?" leads to contrastive or masked pretraining. "Need
capacity at fixed compute?" leads to MoE. Each leaf lists its first baseline in small type.
:::

### Three walk-throughs

**Vibration monitoring of a pump fleet with no fault labels.** Train an autoencoder on windows
from normal operation, set the threshold at a percentile of held-out normal errors, and compare
it with PCA's Q statistic on the same data ([Section 2](#s2)). Once a few faults have been
labelled, pretrain an encoder contrastively on the unlabelled logs and fit a probe, as in
[Lab 5](#lab5); the FFT-magnitude probe is its baseline.

**Candidate bracket geometries for a given load case.** A conditional diffusion model, with the
load case as the condition, in a latent space if the geometry is an image or voxel grid
([Section 6](#s6)). A generated bracket is a proposal, not a design: every candidate is checked
by the solver, as any other would be.

**Stress fields across a family of perforated plates.** A neural operator, or a mesh GNN if the
meshes differ, trained on solver runs ([Section 10](#s10)). It is valid only for the hole sizes
and loads it saw, and it is first compared with a POD surrogate built from the same runs.

::: worked title="The labs as evidence"
Each lab compared its model with a baseline, and the comparisons do not all favour the network.

- [Lab 1](#lab1): the autoencoder beats PCA's Q statistic at detecting held-out 9s, AUC 0.952
  against 0.791.
- [Lab 3](#lab3): the GCN beats the plausible "gate is OR" rule (0.551) at every depth, but
  beats the majority class (0.838) only from 3 layers on.
- [Lab 5](#lab5): contrastive features beat FFT magnitudes by 14 points with 5 labels per class
  (0.929 against 0.790), and by only 2 with 100 (0.996 against 0.975).
- [Lab 4](#lab4): the PINN matches, and does not beat, a closed-form fit
  ($\zeta = 0.0987$ against $0.0977$).

The first three justify the network in the regime measured; the fourth says to use the closed
form whenever one exists.
:::

The rule for the whole series: state the baseline first. A model that does not beat it has
learned nothing useful, however good its loss curve looks.

::: check
You have a known heat-conduction PDE, 15 thermocouple readings and one unknown conductivity.
Which family, and what baseline?
:::

::: answer
A PINN, set up as an inverse problem with the conductivity as a trainable parameter. The
baseline is a classical solver wrapped in a least-squares fit of the conductivity to the 15
readings.
:::

## What goes wrong {#wrong}

Each failure below is given as the symptom you see, its usual cause, and the fix. Several appear,
on purpose, in the labs.

### VAE samples that all look alike

**Symptom.** Samples are near-identical blurs and the KL term reads 0.00 nats in every
dimension. **Cause.** Posterior collapse: the KL weight is too strong for the likelihood term
($\beta > 1$, or an MSE-sum loss that implies $\sigma_x^2 = \tfrac12$ on $[0, 1]$ pixels), or
the decoder can model $\mathbf{x}$ without $\mathbf{z}$. In [Lab 1](#lab1), $\beta = 4$ leaves 0
of 8 dimensions active. **Fix.** Use $\beta \le 1$ with a properly scaled likelihood, warm the KL
weight up from 0 or use free bits, and monitor KL per dimension and the number of active units.

### An anomaly detector with a high AUC that misses faults

**Symptom.** A reconstruction-error detector with a fine AUC misses many real faults in service.
**Cause.** AUC averages over all thresholds, and anomalies that resemble normal data reconstruct
well. In Lab 1 the AUC is 0.95 but only 58% of anomalies are detected at 4% false alarms.
**Fix.** Report the detection rate at the operating threshold, compare with the PCA Q statistic,
evaluate on known faults, and recalibrate when operating conditions change.

### A GAN that produces the same six images

**Symptom.** Training "went fine" and every sample is convincing, but there are few distinct
ones. **Cause.** Mode collapse: nothing in the adversarial loss rewards covering the data.
**Fix.** Measure diversity (modes covered; recall-style nearest-neighbour distances from held-out
data to samples), not only quality. Stabilise with a gradient penalty or spectral normalisation,
or use a diffusion model.

### Washed-out diffusion samples, or a first reverse step that blows up

**Symptom.** Samples never reach extreme values, or sampling diverges at once. **Cause.** A
schedule endpoint is wrong. With Ho et al.'s $\beta_t$ range and $T = 200$ instead of 1,000,
$\bar\alpha_T = 0.13$, so sampling starts from noise the network never saw. With $\beta_T$ near
1 (the cosine schedule's clip at 0.999) the first update multiplies errors by
$1/\sqrt{\alpha_T} = 31.6$, and guidance amplifies them. **Fix.** Check $\bar\alpha_T$ and the
largest $\beta_t$ before training; use a cosine schedule or zero-terminal-SNR rescaling; cap
$\beta_t$ (0.5 in [Lab 2](#lab2)) or clip $\hat{\mathbf{x}}_0$ to the data range.

### Blurred samples with a fast sampler, or uniform ones with strong guidance

**Symptom.** Few-step samples land off the data; strongly guided ones are oversaturated and
alike. **Cause.** Too few steps (Lab 2's DDIM precision-like distance: 0.023 at 200 steps, 0.045
at 5, 1.57 at 1) or too large a guidance scale (recall-like distance 0.022 at $w = 1$, 0.046 at
$w = 7$). **Fix.** Use 20–50 DDIM steps or a distilled sampler, and choose $w$ on a diversity
measure as well as on appearance.

### Near-copies of training items

**Symptom.** Generated items are almost identical to training items. **Cause.** Memorisation,
likelier with small or duplicated training sets and long training (Carlini et al. 2023).
**Fix.** Deduplicate the data, compare each sample's distance to its nearest training item with
held-out items' distances, and give generated designs the same checks as any other.

### A deep GNN that predicts one class

**Symptom.** A ten-layer GNN gives every node nearly the same features. **Cause.**
Over-smoothing: repeated averaging drives all node vectors to one direction at rate
$|\lambda_2|^k$, and a deep plain stack also trains poorly. In [Lab 3](#lab3) 16 plain layers
score 0.838, the majority class; with residual connections, about 0.95–0.97. **Fix.** Use 2–4
layers or residual connections, and measure feature similarity layer by layer.

### A GNN that plateaus on a direction-dependent property

**Symptom.** Accuracy stalls on a property that depends on edge direction or type, such as what
lies above a node in a fault tree. **Cause.** A symmetric normalised adjacency mixes parents,
children and siblings. **Fix.** Give each edge direction or type its own weights (a relational
GCN) or add edge features. In Lab 3: about 0.94–0.96 undirected against 1.000 direction-aware.

### A GNN that fails on new graphs

**Symptom.** Good evaluation scores, poor results on new graphs. **Cause.** Nodes of one graph
were split between training and test, so test nodes' neighbourhoods were seen in training.
**Fix.** Split by graph (whole fault trees, whole meshes) whenever the model will meet new graphs.

### A PINN that converges to zero

**Symptom.** The PINN returns $u = 0$, or a smooth curve that ignores the initial or boundary
data, with a small loss. **Cause.** Zero satisfies the homogeneous equation and the condition
terms are outweighed: in [Lab 4](#lab4) the residual loss starts at 52.5 against 1.36, and the
final error is 0.998. **Fix.** Non-dimensionalise (error 0.0004), raise the condition weights
(0.004), or impose the conditions by construction.

### A PINN with a small residual and a wrong answer

**Symptom.** Slow trends fit, but oscillations, sharp fronts or late times do not; or the
residual is tiny and the solution wrong. **Cause.** Spectral bias, stiffness and loss imbalance,
or an ill-posed set-up: without boundary conditions the heat equation has infinitely many
solutions, and a PINN found one with error 0.82 at a residual of $4 \times 10^{-5}$
([Exercise 12](#e12)). **Fix.** Fourier-feature inputs, adaptive loss weights, time-marching, a
check that the problem is fully posed, or a classical solver, usually faster and more accurate
for forward problems.

### A surrogate confidently wrong on a new design

**Symptom.** A neural operator or other surrogate returns a plausible field that a solver run
contradicts. **Cause.** The input lies outside the training family: another geometry family,
load regime or material. **Fix.** Check inputs against the training ranges, validate against
fresh solver runs where the surrogate is used, and report the error per regime and a validity
domain.

### A contrastive encoder that does not help

**Symptom.** The pretrained features are useless downstream, or the loss sits at
$\log(2B - 1)$. **Cause.** The augmentations removed information the task needs (a 180-degree
rotation makes 6 and 9 one class; colour jitter removes the colour of corrosion), or the
embeddings collapsed. **Fix.** Choose augmentations from the task's real invariances and check
per-class probe accuracy. The augmentations are the supervision: in [Lab 5](#lab5), without the
time shift, the 5-label probe scores 0.58 instead of 0.93.

### An MoE layer that uses one or two experts

**Symptom.** Most tokens go to one or two experts. **Cause.** Routing collapse from
rich-get-richer feedback. **Fix.** Add a load-balancing loss or bias-based balancing, and monitor
per-expert token fractions and the number of dropped tokens.
