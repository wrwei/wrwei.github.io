## Activation functions {#s5}

Equation 2 of [Section 3](#s3) multiplies the error signal by $\phi'(\mathbf{z})$ at every layer on
its way down. Choosing an activation is therefore choosing, first of all, a derivative: the number
by which every backpropagated error is scaled, once per layer. This section derives the
derivatives and describes the two ways a unit stops passing gradient: saturation and death.

### The choices

| name | $\phi(z)$ | $\phi'(z)$ | range | zero-centred | saturates | typical use |
|---|---|---|---|---|---|---|
| sigmoid | $\sigma(z) = 1/(1+e^{-z})$ | $\sigma(z)(1-\sigma(z)) \le 1/4$ | $(0, 1)$ | no | both sides | binary output probabilities; gates ([Module 04](module_04_EN.html#s5)) |
| tanh | $\tanh z$ | $1-\tanh^2 z \le 1$ | $(-1, 1)$ | yes | both sides | older MLPs and recurrent networks |
| ReLU | $\max(0, z)$ | $\mathbb{1}[z>0]$ | $[0, \infty)$ | no | no; exactly 0 for $z<0$ | hidden layers of MLPs and CNNs |
| leaky ReLU | $\max(az, z)$, $a = 0.01$ | $a$ or 1 | $(-\infty, \infty)$ | nearly | no | a ReLU that cannot die |
| GELU | $z\,\Phi(z)$ | $\Phi(z) + z\,\phi_N(z)$ | $[-0.170, \infty)$ | nearly | no | the transformer default (BERT, GPT-2) |
| SiLU / Swish | $z\,\sigma(z)$ | $\sigma(z)\big(1 + z(1-\sigma(z))\big)$ | $[-0.278, \infty)$ | nearly | no | gated feed-forward blocks (SwiGLU) |

$\Phi$ is the standard normal CDF and $\phi_N$ the standard normal density. As of 2026 most open
large language models use SiLU inside SwiGLU feed-forward blocks
([Module 06, Section 9](module_06_EN.html#s9)). PyTorch takes ReLU's derivative at $z = 0$ to be
0. Figure 2.9 plots all six and their derivatives.

::: figure id=fig-02-9
Two rows of plots over $z \in [-5, 5]$. Top row: sigmoid, tanh, ReLU, leaky ReLU (with an inset
drawn at $a = 0.1$ so that the slope is visible), GELU and SiLU. Bottom row: their derivatives.
The regions where $|\phi'| < 0.01$ are shaded "saturated" for sigmoid ($|z| > 4.6$) and tanh
($|z| > 3.0$); ReLU's zero-derivative half-line is marked "dead side"; the minima of GELU at
$(-0.752, -0.170)$ and of SiLU at $(-1.278, -0.278)$ are marked.
:::

### Deriving the derivatives

Write the sigmoid as $(1+e^{-z})^{-1}$ and differentiate:

$$
\sigma'(z) = \frac{e^{-z}}{(1+e^{-z})^2}
= \frac{1}{1+e^{-z}}\cdot\frac{e^{-z}}{1+e^{-z}}
= \sigma(z)\big(1-\sigma(z)\big),
$$

because $e^{-z}/(1+e^{-z}) = 1 - 1/(1+e^{-z})$. The product $s(1-s)$ of a number in $(0, 1)$ and
its complement is largest at $s = 1/2$, that is at $z = 0$, where it equals $1/4$. The backward
pass computes it from the stored output.

For tanh, multiply the numerator and denominator of $(e^z - e^{-z})/(e^z + e^{-z})$ by $e^{-z}$:

$$
\tanh z = \frac{1-e^{-2z}}{1+e^{-2z}} = \frac{2}{1+e^{-2z}} - 1 = 2\sigma(2z) - 1 .
$$

tanh is a sigmoid stretched vertically to $(-1, 1)$ and squeezed horizontally by 2. By the chain
rule $\tanh'(z) = 4\sigma'(2z)$, which at the origin is $4\cdot\tfrac14 = 1$: the same shape, but
centred on zero and with four times the slope. GELU and SiLU are products, so the product rule
gives their derivatives directly: $\Phi + z\phi_N$ and $\sigma + z\sigma(1-\sigma)$.

::: worked title="Derivatives at a few points"
Sigmoid: $\sigma(0) = 0.5$, so $\sigma'(0) = 0.5\cdot 0.5 = 0.25$; $\sigma(2) = 0.8808$, so
$\sigma'(2) = 0.8808\cdot 0.1192 = 0.105$; $\sigma(5) = 0.99331$, so
$\sigma'(5) = 0.99331\cdot 0.00669 = 0.0066$.

tanh: $\tanh'(0) = 1 - 0 = 1$; $\tanh 2 = 0.9640$, so $\tanh'(2) = 1 - 0.9293 = 0.0707$;
$\tanh 3 = 0.99505$, so $\tanh'(3) = 1 - 0.99013 = 0.0099$.

GELU: $\mathrm{GELU}'(0) = \Phi(0) + 0 = 0.5$;
$\mathrm{GELU}'(1) = \Phi(1) + \phi_N(1) = 0.8413 + 0.2420 = 1.083$;
$\mathrm{GELU}'(-3) = 0.00135 + (-3)(0.00443) = -0.012$.

SiLU: $\mathrm{SiLU}'(0) = 0.5\,(1 + 0) = 0.5$;
$\mathrm{SiLU}'(2) = 0.8808\,(1 + 2\cdot 0.1192) = 0.8808\cdot 1.2384 = 1.091$.

The smooth activations have slopes above 1 for moderately large positive $z$ (GELU beyond
$z = 0.75$, SiLU beyond $z = 1.28$; $\mathrm{SiLU}'(1)$ is still 0.928), and GELU's slope at $-3$
is negative.
:::

Autograd reproduces these values, a cheap check on any activation you implement:

```python
import torch
import torch.nn as nn

z = torch.tensor([-3.0, 0.0, 1.0, 2.0, 5.0], requires_grad=True)
acts = {"sigmoid": torch.sigmoid, "tanh": torch.tanh, "relu": torch.relu,
        "gelu": nn.GELU(), "silu": nn.SiLU()}
for name, phi in acts.items():
    (grad,) = torch.autograd.grad(phi(z).sum(), z)   # elementwise, so this is phi'(z)
    print(f"{name:8s}", " ".join(f"{g:8.4f}" for g in grad.tolist()))
```

```output
sigmoid    0.0452   0.2500   0.1966   0.1050   0.0066
tanh       0.0099   1.0000   0.4200   0.0707   0.0002
relu       0.0000   0.0000   1.0000   1.0000   1.0000
gelu      -0.0119   0.5000   1.0833   1.0852   1.0000
silu      -0.0881   0.5000   0.9277   1.0908   1.0265
```

### Saturation, and why ReLU won

Where $\phi' \approx 0$ a unit passes almost no gradient; it is **saturated**. The sigmoid's
derivative falls below 0.01 for $|z| > 4.6$ and tanh's for $|z| > 3.0$. A saturated unit is not
dead for ever: it still learns, but at a rate set by that tiny derivative.

ReLU won because of its derivative. On the active side it is exactly 1, so an error passes
through many layers undiminished by the activations, where sigmoids multiply it by at most $1/4$
per layer. It is also cheap: a comparison, with no exponential. GELU and SiLU keep the
near-linear positive side and add smoothness.

::: worked title="Ten layers of activation derivatives"
Multiply only the activation derivatives along one path through ten layers. Sigmoid at its best
point: $0.25^{10} = 9.5\times 10^{-7}$, as in Section 3. tanh at $z = 0$: $1^{10} = 1$. ReLU on
its active side: $1^{10} = 1$. tanh matches ReLU only near the origin; at $z = 2$ its factor is
$0.0707^{10} \approx 3\times 10^{-12}$.
:::

GELU and SiLU are not monotonic. GELU has its minimum $-0.170$ at $z = -0.752$, SiLU its minimum
$-0.278$ at $z = -1.278$, and below those points their derivatives are slightly negative. GELU is
often computed with the approximation
$0.5z\big(1 + \tanh(\sqrt{2/\pi}\,(z + 0.044715z^3))\big)$, which differs from $z\Phi(z)$ by at
most $4.7\times 10^{-4}$ (largest near $|z| = 2.7$). PyTorch's `nn.GELU()` uses the exact error-
function form; `nn.GELU(approximate="tanh")` uses the approximation.

### Zero-centring

A sigmoid layer's outputs are all positive. For one example the gradient of a weight into unit
$j$ is $\partial\mathcal{L}/\partial W_{ij} = h_i\delta_j$ (Section 3), and with every $h_i > 0$
all these gradients share the sign of $\delta_j$. The incoming weight vector of unit $j$ can then
only move in directions whose components share a sign, so reaching a target takes a zig-zag.
tanh avoids this by being zero-centred; so do zero-mean inputs and normalisation layers
([Sections 6](#s6) and [10](#s10)). The constraint holds for one example only; a mini-batch
gradient sums over examples whose $\delta_j$ differ in sign, which loosens it.

::: worked title="Variance is not the second moment"
Take $z \sim \mathcal{N}(0, 1)$. By symmetry, the half of the mass with $z > 0$ carries half of
$\mathbb{E}[z^2]$, so $\mathbb{E}[\operatorname{ReLU}(z)^2] = 0.5$. The mean is
$\mathbb{E}[\operatorname{ReLU}(z)] = \int_0^\infty z\,\phi_N(z)\,dz = \phi_N(0) = 1/\sqrt{2\pi} = 0.399$,
so $\operatorname{Var}(\operatorname{ReLU}(z)) = 0.5 - 1/(2\pi) = 0.5 - 0.159 = 0.341$. A ReLU
halves the second moment; its variance falls to 0.341 of the input's. Section 6 needs the second
moment.
:::

### Dead ReLU units

If a ReLU unit's pre-activation is negative for every training example, its derivative is zero
everywhere: its incoming weights and bias receive zero gradient, and plain gradient descent can
never revive it ([Exercise 5](#e5)). The usual causes are a large update (too high a learning
rate) that pushes the bias far negative, and a poor initialisation. The remedies are a lower
learning rate, He initialisation ([Section 6](#s6)), or an activation with a non-zero left side
(leaky ReLU, GELU). Measure it: the **dead fraction** is the share of units whose output is 0 for
every example of a batch, and [Labs 4](#lab4) and [5](#lab5) log it.

::: worked title="Dead units made by the learning rate"
The playground's circles problem ([Section 1](#s1)) with 8 hidden ReLU units, in a NumPy
simulation of the widget's specification. Adam at $\eta = 1$ leaves 4 of the 8 units dead (0 to 5
over other seeds); the survivors still fit the data. Plain gradient descent at $\eta = 10$ kills
all 8. Only the output bias still has a gradient, and at this step size it bounces in a
two-cycle: the loss sticks at 1.04 (worse than a constant guess's $\ln 2 = 0.693$), accuracy 50%.
:::

### The output layer is different

The output's "activation" is fixed by the loss, not chosen for gradient flow: the identity for
squared error, logits into a softmax or sigmoid inside a cross-entropy ([Section 12](#s12)).

::: check
Why can a ten-layer sigmoid network fail to train even with a well-tuned optimiser?
:::

::: answer
Each layer multiplies the backpropagated error by $\sigma' \le 1/4$, so the earliest layers
receive at most about $10^{-6}$ of the output error unless the weights compensate.
:::

::: check
A ReLU unit has bias $-10$ and small incoming weights, and the inputs are standardised. What
happens to it in training?
:::

::: answer
Its pre-activation is negative for essentially every input, so its derivative and therefore its
gradient are zero, and it stays dead.
:::

::: check
What is $\mathrm{GELU}'(0)$?
:::

::: answer
$\Phi(0) + 0\cdot\phi_N(0) = 0.5$.
:::

## Initialisation {#s6}

Training starts from whatever the initial weights compute. If their scale is wrong, the forward
signal and the backward error both grow or shrink geometrically with depth (the product of
Jacobians in [Section 3](#s3)) before the optimiser has taken a single step. This section derives
the scale from one requirement, that the signal have the same size at every layer, and measures
what happens when the requirement is not met.

### Symmetry

Set all weights of a layer to the same value, zero or any other constant, and every unit in the
layer computes the same function of its input, receives the same error signal, and therefore the
same gradient. After the update the units are still identical, and they stay identical for ever:
the layer has the expressive power of one unit. With zero weights and ReLU it is worse, since
$\boldsymbol{\delta}^{(l)} = (\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)})\odot\phi'$ is zero
and even the first layer's gradient vanishes. Random weights break the **symmetry**; biases can
start at zero, because the random weights already make the units differ. Rumelhart, Hinton and
Williams (1986) started from small random weights for exactly this reason. What remains is the
scale.

### The forward derivation

Take one unit, $z_j = \sum_{i=1}^{n} w_{ij}h_i$ with $n = n_{\text{in}}$ inputs (biases are zero
at initialisation). Assume the $w_{ij}$ are independent, have zero mean and variance
$\sigma_w^2$, and are independent of the inputs $h_i$. Then
$\mathbb{E}[z_j] = \sum_i \mathbb{E}[w_{ij}]\mathbb{E}[h_i] = 0$. The cross terms of $z_j^2$
vanish too, since $\mathbb{E}[w_{ij}h_iw_{kj}h_k] = \mathbb{E}[w_{ij}]\,\mathbb{E}[w_{kj}]\,\mathbb{E}[h_ih_k] = 0$
for $i \ne k$, so

$$
\operatorname{Var}(z_j) = \sum_{i=1}^{n}\mathbb{E}[w_{ij}^2h_i^2]
= \sum_{i=1}^{n}\mathbb{E}[w_{ij}^2]\,\mathbb{E}[h_i^2]
= n\,\sigma_w^2\,\mathbb{E}[h^2]. \tag{6.1}
$$

The input enters through its **second moment** $\mathbb{E}[h^2]$, not its variance. The two agree
only when $h$ has zero mean, which ReLU outputs do not.

Now ask that $\operatorname{Var}(z^{(l)}) = \operatorname{Var}(z^{(l-1)})$. For tanh near the
origin $h \approx z$, so $\mathbb{E}[h^2] \approx \operatorname{Var}(z^{(l-1)})$ and Equation 6.1
needs $\sigma_w^2 = 1/n_{\text{in}}$ (LeCun et al. 1998). For ReLU, $z^{(l-1)}$ is symmetric about
zero, so $\mathbb{E}[h^2] = \tfrac12\operatorname{Var}(z^{(l-1)})$ (Section 5's worked example) and
preservation needs

$$
\sigma_w^2 = \frac{2}{n_{\text{in}}},
$$

**He initialisation** (He et al. 2015). A ReLU halves the second moment, and the factor 2 puts it
back. It does not halve the variance, which falls to $0.341\operatorname{Var}(z)$.

### The backward derivation

The error obeys $\delta^{(l)}_i = \phi'(z^{(l)}_i)\sum_{j=1}^{n_{\text{out}}} w^{(l+1)}_{ij}\delta^{(l+1)}_j$,
a sum over the $n_{\text{out}}$ units the unit feeds. The same argument, with the weights
independent of the errors, gives

$$
\operatorname{Var}(\delta^{(l)}) = n_{\text{out}}\,\sigma_w^2\,\mathbb{E}[\phi'^2]\,\operatorname{Var}(\delta^{(l+1)}).
$$

Near the origin tanh has $\phi' \approx 1$; ReLU has $\mathbb{E}[\phi'^2] = P(z > 0) = 1/2$. So the
backward pass is preserved by $\sigma_w^2 = 1/n_{\text{out}}$ for tanh and $2/n_{\text{out}}$ for
ReLU. Glorot and Bengio (2010) split the difference with
$\sigma_w^2 = 2/(n_{\text{in}} + n_{\text{out}})$, the **Xavier** or **Glorot** initialisation. In
uniform form the weights are drawn from $U(-a, a)$; since $\operatorname{Var}(U(-a, a)) = a^2/3$,
the bound is $a = \sqrt{6/(n_{\text{in}} + n_{\text{out}})}$. He et al. noted that one direction
suffices: with fan-in scaling the backward factor of each layer is
$n_{\text{out}}\cdot(2/n_{\text{in}})\cdot\tfrac12 = n_{\text{out}}/n_{\text{in}}$, and the product
over layers telescopes to the ratio of two widths, which does not grow with depth. Fan-in mode is
the usual choice for ReLU.

::: worked title="One layer at a time"
A ReLU layer with fan-in 512: He standard deviation $\sqrt{2/512} = \sqrt{1/256} = 0.0625$. A
$784 \to 256$ layer: the Glorot uniform bound is $\sqrt{6/(784 + 256)} = \sqrt{6/1{,}040} = 0.0760$,
and the He standard deviation is $\sqrt{2/784} = 0.0505$.
:::

### Measured through ten layers

::: worked title="Predicted against measured, ten layers of width 256"
Inputs $\mathbf{x} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$, 1,000 samples, ten layers of width
256, one fixed seed. The table gives the standard deviation of $z$ at layers 1, 2, 5 and 10.

| scheme | layer 1 | layer 2 | layer 5 | layer 10 |
|---|---|---|---|---|
| ReLU, He ($2/n$) | 1.42 | 1.39 | 1.46 | 1.43 |
| ReLU, $1/n$ | 1.01 | 0.694 | 0.258 | 0.0447 |
| ReLU, $\mathcal{N}(0, 0.01^2)$ | 0.161 | 0.0178 | $2.7\times 10^{-5}$ | $4.9\times 10^{-10}$ |
| ReLU, PyTorch default | 0.579 | 0.246 | 0.0435 | 0.0402 |
| tanh, $\mathcal{N}(0, 1)$ | 16.1 | 15.6 | 15.5 | 15.6 |
| tanh, $1/n$ | 1.01 | 0.626 | 0.356 | 0.249 |

The predictions follow from Equation 6.1. He: layer 1 has $256\cdot(2/256)\cdot 1 = 2$, a standard
deviation of $\sqrt 2 = 1.414$, and each later layer multiplies the variance by
$256\cdot(2/256)\cdot\tfrac12 = 1$. With $1/n$ each layer multiplies it by $\tfrac12$, so the
standard deviation is $2^{-(l-1)/2}$: 1, 0.707, 0.25, 0.044. With $\sigma_w = 0.01$, layer 1 has
$\sqrt{256\cdot 10^{-4}} = 0.16$ and each layer multiplies the standard deviation by
$\sqrt{256\cdot 10^{-4}\cdot\tfrac12} = 0.113$, so layer 10 is at $0.16\cdot 0.113^9 = 4.9\times 10^{-10}$.
The tanh network with unit-variance weights starts at $\sqrt{256} = 16$; 87% of its layer-10
outputs lie beyond $|h| = 0.99$, where $\tanh' < 0.02$. With $1/n$, tanh decays slowly because it
contracts: $|\tanh z| < |z|$. Figure 2.10 extends the measurement to 20 layers.
:::

::: figure id=fig-02-10
Standard deviation of the pre-activations (log scale, $10^{-10}$ to $10^2$) against layer index 1
to 20, from the worked example's script extended to 20 layers of width 256. ReLU + He is flat at
1.41; ReLU + $1/n$ falls by $\sqrt 2$ per layer; ReLU + $\mathcal{N}(0, 0.01^2)$ falls by a factor
0.113 per layer; ReLU + PyTorch default falls and then levels off at 0.04; tanh + $\mathcal{N}(0, 1)$
is flat near 16, annotated "saturated: 87% of $|h| > 0.99$"; tanh + $1/n$ decays slowly. An inset
shows histograms of the layer-10 outputs: two spikes at $\pm 1$ for tanh + $\mathcal{N}(0, 1)$, a
bell for tanh + $1/n$.
:::

### What wrong scales do

Too large, and tanh units saturate: the forward signal stays bounded, but $\phi' \approx 0$ at
most units and the gradient vanishes; ReLU activations instead grow geometrically and overflow.
Too small, and the signal shrinks geometrically, so the output equals the biases whatever the
input. The error shrinks on the way back too, because it is multiplied by the same small weights,
so the early layers receive tiny gradients and training starts on a plateau. [Lab 1](#lab1), step
7, shows the plateau on a shallow network initialised from $\mathcal{N}(0, 10^{-4})$.

### Framework defaults are not He

PyTorch's `nn.Linear` draws its weights and biases from $U(-1/\sqrt{n_{\text{in}}}, 1/\sqrt{n_{\text{in}}})$,
a weight variance of $1/(3n_{\text{in}})$. That is a sixth of He's.

::: worked title="The bias floor of the default"
With weight variance $1/(3n)$, each ReLU layer multiplies the second moment by
$n\cdot\frac{1}{3n}\cdot\frac12 = \frac16$, and the bias adds its own variance $1/(3n)$. The
variance $v$ of $z$ therefore settles where $v = v/6 + 1/(3n)$, that is $\frac56 v = \frac{1}{3n}$,
or $v = 0.4/n$. For $n = 256$ the standard deviation is $\sqrt{0.4/256} = 0.0395$: the measured
0.0402 at layer 10. The signal at the top no longer depends on the input much at all.
:::

For deep ReLU stacks without normalisation, call the He initialiser explicitly. Shallow networks,
and networks with normalisation layers, tolerate the default; Labs 3 to 5 use it at depth 3.

```python
for m in model.modules():
    if isinstance(m, nn.Linear):
        nn.init.kaiming_normal_(m.weight, nonlinearity="relu")  # std sqrt(2 / fan_in)
        nn.init.zeros_(m.bias)
```

### Residual connections

Deep networks add one more device. A **residual connection**,
$\mathbf{h}^{(l)} = \mathbf{h}^{(l-1)} + f(\mathbf{h}^{(l-1)})$, has the Jacobian
$\mathbf{I} + \partial f/\partial\mathbf{h}^{(l-1)}$. The backward product of Section 3 then
always contains an identity path, and the gradient cannot vanish along it. The forward variance
now adds, $\operatorname{Var}(\mathbf{h}^{(l)}) \approx \operatorname{Var}(\mathbf{h}^{(l-1)}) + \operatorname{Var}(f)$,
and would double at every block if each branch preserved its input's variance. Deep residual
networks therefore scale down or zero-initialise the last layer of each branch, so that every
block starts close to the identity. [Module 03](module_03_EN.html#s8) introduces residual
connections with ResNet, and [Module 06](module_06_EN.html#s5) shows them in every transformer
block.

### The output layer

A small output scale makes the initial predictions near-uniform, so a $K$-class classifier starts
at a loss near $\ln K$ ($\ln 10 = 2.303$ for digits). Checking it is the first test of
[Section 14](#s14).

::: keyidea
Choose the weight variance so that each layer passes on a signal of the same size, $2/n_{\text{in}}$
for ReLU and about $1/n$ for tanh; any constant, too small or too large scale is multiplied at
every layer.
:::

::: check
All weights start at 0.5 rather than zero. Is the symmetry broken?
:::

::: answer
No. Any constant initialisation gives identical units with identical gradients, which stay
identical; only random values break the symmetry.
:::

::: check
A ReLU layer has fan-in 512. What standard deviation does He initialisation use?
:::

::: answer
$\sqrt{2/512} = 0.0625$.
:::

::: check
Why does Glorot use $2/(n_{\text{in}} + n_{\text{out}})$ rather than $1/n_{\text{in}}$?
:::

::: answer
Preserving the forward variance needs $1/n_{\text{in}}$ and preserving the backward variance
needs $1/n_{\text{out}}$; the compromise satisfies both approximately when the widths are
similar.
:::

## Gradient descent and momentum {#s7}

Plain stochastic gradient descent with a fixed learning rate is rarely used. The reason is visible
on the simplest loss there is, a quadratic, and so is the first cure, momentum. This section
analyses both on the quadratic and derives the largest learning rate each can take.

### Gradient descent on a quadratic

[Module 01, Section 3](module_01_EN.html#s3) analysed this case; here is the result in the form
needed below. Take $\mathcal{L}(\theta) = \tfrac12\theta^\top\mathbf{A}\theta$ with $\mathbf{A}$
symmetric positive definite, eigenvalues $\lambda_1 \le \dots \le \lambda_d$ and orthonormal
eigenvectors $\mathbf{q}_i$. The gradient is $\mathbf{A}\theta$, so a step is
$\theta \leftarrow (\mathbf{I} - \eta\mathbf{A})\theta$. In the eigen-coordinates
$u_i = \mathbf{q}_i^\top\theta$ the matrix is diagonal, and each coordinate evolves on its own:

$$
u_i \leftarrow (1 - \eta\lambda_i)\,u_i .
$$

Coordinate $i$ shrinks if and only if $|1 - \eta\lambda_i| < 1$, so all of them shrink if and only
if $\eta < 2/\lambda_{\max}$. The slowest coordinate sets the rate, $\max_i|1 - \eta\lambda_i|$,
and only the two extreme eigenvalues compete. Balancing them, $1 - \eta\lambda_{\min} = -(1 - \eta\lambda_{\max})$,
gives $\eta = 2/(\lambda_{\max} + \lambda_{\min})$ and the best rate

$$
\rho_{\text{GD}} = \frac{\lambda_{\max} - \lambda_{\min}}{\lambda_{\max} + \lambda_{\min}} = \frac{\kappa - 1}{\kappa + 1},
\qquad \kappa = \frac{\lambda_{\max}}{\lambda_{\min}} .
$$

For large $\kappa$, $\ln\rho_{\text{GD}} \approx -2/\kappa$: about $\kappa/2$ steps per factor $e$.
The steep direction fixes the step size; the shallow direction sets the time.

Near a minimum $\theta^*$, where the gradient vanishes, the second-order Taylor expansion of a
network's loss is $\mathcal{L}(\theta^*) + \tfrac12(\theta - \theta^*)^\top\mathbf{H}(\theta - \theta^*)$,
with the Hessian $\mathbf{H}$ in place of $\mathbf{A}$. The same limit $\eta < 2/\lambda_{\max}(\mathbf{H})$
applies locally. In full-batch training $\lambda_{\max}(\mathbf{H})$ tends to rise until it
reaches about $2/\eta$ and then hovers there while the loss keeps falling, unevenly: the **edge of
stability** (Cohen et al. 2021). The learning rate does not only have to respect the curvature;
it shapes the curvature the network ends up in.

With mini-batches the gradient is the full gradient plus zero-mean noise whose covariance falls as
$1/B$ ([Module 01, Section 4](module_01_EN.html#s4)). The noise makes the loss non-monotone and
leaves a noise floor proportional to $\eta$, which [Section 9](#s9) measures and schedules remove.

### Heavy-ball momentum

**Momentum** keeps a velocity, the form of Polyak (1964) used by Rumelhart, Hinton and Williams
(1986) and by PyTorch's `SGD`:

$$
\mathbf{v} \leftarrow \mu\mathbf{v} + \mathbf{g}, \qquad \theta \leftarrow \theta - \eta\mathbf{v},
\qquad \mu \approx 0.9 .
$$

Unrolled from $\mathbf{v}_0 = \mathbf{0}$, $\mathbf{v}_t = \sum_{k=0}^{t-1}\mu^k\mathbf{g}_{t-k}$, an
exponentially weighted sum of past gradients. For a constant gradient it tends to
$\mathbf{g}/(1-\mu)$, so the step tends to $\eta\mathbf{g}/(1-\mu)$: an **effective learning
rate** $\eta/(1-\mu)$, ten times $\eta$ for $\mu = 0.9$. Eliminating $\mathbf{v}$ gives the
equivalent form $\theta_{t+1} = \theta_t - \eta\mathbf{g}_t + \mu(\theta_t - \theta_{t-1})$: a
gradient step plus a fraction $\mu$ of the previous step, the ball's inertia. Figure 2.11 shows
the difference on a ravine.

::: figure id=fig-02-11
Contour plot of $\mathcal{L} = \tfrac12(\theta_1^2 + 25\theta_2^2)$ ($\kappa = 25$, for legibility)
over $\theta_1 \in [-2, 0.5]$, $\theta_2 \in [-0.5, 0.5]$, with two 40-step paths from
$(-1.8, 0.35)$, a dot per step and the minimum marked. Gradient descent at $\eta = 0.07$ multiplies
$\theta_2$ by $-0.75$ each step, so it zig-zags across the valley and crawls along it. Heavy ball
at $\eta = 0.015$, $\mu = 0.9$ (an effective rate $\eta/(1-\mu) = 0.15$) moves smoothly,
overshoots along the valley and spirals in.
:::

Why this helps is clearest as a filter. Feed the recursion $v_t = \mu v_{t-1} + g_t$ a gradient
component that oscillates with frequency $\omega$, $g_t = e^{i\omega t}$: $\omega = 0$ is a
component that is the same every step, $\omega = \pi$ one that flips sign every step. In the
steady state $v_t = H(\omega)e^{i\omega t}$; substituting,
$H e^{i\omega t} = \mu H e^{i\omega(t-1)} + e^{i\omega t}$, so

$$
H(\omega) = \frac{1}{1 - \mu e^{-i\omega}}, \qquad |H(0)| = \frac{1}{1-\mu}, \qquad |H(\pi)| = \frac{1}{1+\mu}.
$$

Momentum is a low-pass filter. Across a ravine the gradient flips sign at every step and is
damped by $1/(1+\mu) = 0.53$; along the ravine it is consistent and is amplified by
$1/(1-\mu) = 10$, a ratio of $(1+\mu)/(1-\mu) = 19$ (Figure 2.12).

::: worked title="Filter gains, checked by iteration"
Iterate $v \leftarrow 0.9v + (-1)^t$ from $v = 0$. In the steady state $v_t = (-1)^tc$, and
substituting gives $c = -0.9c + 1$, so $c = 1/1.9 = 0.5263$; 200 iterations give $|v| = 0.5263$.
With a constant input, $c = 0.9c + 1$ gives $c = 10$.
:::

::: figure id=fig-02-12
The gain $|H(\omega)| = 1/|1 - \mu e^{-i\omega}|$ on a log y-axis against $\omega \in [0, \pi]$ for
$\mu = 0$, 0.5 and 0.9. The endpoints for $\mu = 0.9$ are labelled: 10 at $\omega = 0$
("consistent direction") and 0.53 at $\omega = \pi$ ("sign flips every step").
:::

On the quadratic the analysis is exact. Along an eigenvector with curvature $\lambda$ the
equivalent form reads $u_{t+1} = (1 + \mu - \eta\lambda)u_t - \mu u_{t-1}$, a linear recurrence
whose solutions are $u_t = r^t$ with

$$
r^2 - (1 + \mu - \eta\lambda)\,r + \mu = 0 .
$$

The two roots multiply to $\mu$, so when they are complex both have modulus $\sqrt\mu$: the error
contracts by $\sqrt\mu$ per step whatever $\lambda$ is. Both roots lie inside the unit circle if
and only if the polynomial is positive at $r = 1$ and $r = -1$ (with $\mu < 1$): at $r = 1$ it is
$\eta\lambda > 0$, at $r = -1$ it is $2(1 + \mu) - \eta\lambda > 0$. Heavy ball is therefore stable
for $\eta\lambda_{\max} < 2(1 + \mu)$, which is 3.8 for $\mu = 0.9$ against 2 for gradient
descent. Choosing $\eta = 4/(\sqrt{\lambda_{\max}} + \sqrt{\lambda_{\min}})^2$ and
$\mu = \big((\sqrt\kappa - 1)/(\sqrt\kappa + 1)\big)^2$ puts both extreme eigenvalues at the edge
of the complex region (the algebra is in Polyak 1964) and gives the rate
$(\sqrt\kappa - 1)/(\sqrt\kappa + 1)$: about $\sqrt\kappa/2$ steps per factor $e$ instead of
$\kappa/2$.

### Nesterov momentum

**Nesterov momentum** evaluates the gradient at the point the velocity is about to carry the
parameters to: $\mathbf{v} \leftarrow \mu\mathbf{v} + \nabla\mathcal{L}(\theta - \eta\mu\mathbf{v})$,
$\theta \leftarrow \theta - \eta\mathbf{v}$. PyTorch's `SGD(nesterov=True)` uses an equivalent
rewrite that evaluates the gradient at the stored parameters, $\mathbf{v} \leftarrow \mu\mathbf{v} + \mathbf{g}$,
$\theta \leftarrow \theta - \eta(\mathbf{g} + \mu\mathbf{v})$. The look-ahead corrects the velocity
before it overshoots, and at moderate $\eta$ Nesterov is faster. It is not more stable. Its
characteristic equation is $r^2 - (1+\mu)(1-\eta\lambda)\,r + \mu(1-\eta\lambda) = 0$, and the
same test at $r = -1$ gives $\eta\lambda_{\max} < 2(1+\mu)/(1+2\mu)$: 1.36 for $\mu = 0.9$, below
gradient descent's 2 and heavy ball's 3.8.

::: worked title="Three methods on a ravine with κ = 100"
$\mathcal{L} = \tfrac12(\theta_1^2 + 100\theta_2^2)$, so $\lambda_{\min} = 1$, $\lambda_{\max} = 100$.
Start at $\theta = (1, 1)$ and count steps until $\|\theta\| < 10^{-3}\|\theta_0\|$.

Gradient descent at the best fixed $\eta = 2/101 = 0.0198$: the coordinates are multiplied by
$1 - 0.0198 = 0.980$ and $1 - 1.98 = -0.980$, rate $99/101$. Predicted steps
$\ln 10^{-3}/\ln 0.980 = 345$; simulated, 346. At $\eta = 0.0201$, $\eta\lambda_{\max} = 2.01$:
the steep coordinate is multiplied by $-1.01$ every step and diverges.

Heavy ball, $\mu = 0.9$, same $\eta$: for $\lambda = 1$ the discriminant is
$(1.9 - 0.0198)^2 - 3.6 = -0.065$ and for $\lambda = 100$ it is $(1.9 - 1.98)^2 - 3.6 = -3.59$; both
negative, so both modes contract by $\sqrt{0.9} = 0.949$ per step. The envelope predicts 131
steps; the simulation needs 125, because the oscillating error crosses the threshold a little
before its envelope does.

Heavy ball at the optimum: $\eta = 4/(10 + 1)^2 = 0.0331$, $\mu = (9/11)^2 = 0.669$, rate
$9/11 = 0.818$, which predicts $\ln 10^{-3}/\ln 0.818 = 34$ steps. The simulation needs 56. At the
optimum the roots for both extreme eigenvalues coincide, and a double root makes the error behave
like $t\cdot 0.818^t$ rather than $0.818^t$ for a while.

Nesterov, $\mu = 0.9$: its limit is $1.357/100 = 0.0136$, so at $\eta = 0.0198$ it diverges. At
$\eta = 0.01$ it needs 62 steps where heavy ball needs 124.
:::

::: widget name=optimiser-paths
Press Play with the defaults (a ravine with $\kappa = 50$, $\eta = 0.035$, $\mu = 0.9$). Gradient
descent zig-zags, since each step multiplies the steep coordinate by $1 - 0.035\cdot 50 = -0.75$,
and reaches $10^{-6}$ of the initial loss at about step 179; heavy ball arrives at about step 110
and Adam at about 126. Tick Nesterov: at $\eta = 0.035$ it diverges (its limit is 0.027), and at
$\eta = 0.025$ it arrives first, at about step 55. Then rotate the ravine by 45° and note which
methods notice ([Section 8](#s8) explains).
:::

### In practice

Momentum acts mostly as a larger effective learning rate. In [Lab 3](#lab3), on the digits
network, plain SGD at $\eta = 0.05$ never gets the training loss below 0.1 in 20 epochs, while
SGD at $\eta = 0.5$ and SGD with $\mu = 0.9$ at $\eta = 0.05$ get there by epochs 3 and 4 and end
within 0.3 points of each other in validation accuracy. Two conventions matter when moving
between libraries or papers. PyTorch's momentum buffer has no $(1-\mu)$ factor (`dampening=0`),
unlike Adam's first moment ([Section 8](#s8)); switching between the two forms changes the
effective learning rate by $1/(1-\mu)$. SGD with momentum 0.9 and a schedule remains strong for
convolutional networks ([Module 03](module_03_EN.html#s10)); the adaptive methods of Section 8
are the default for transformers.

::: keyidea
Gradient descent's step is capped by the steepest curvature, $\eta < 2/\lambda_{\max}$, and its
speed is set by the shallowest, about $\kappa/2$ steps per factor $e$; momentum low-pass filters
the gradient and cuts this to about $\sqrt\kappa/2$.
:::

::: check
With $\mu = 0.9$, by what factor does momentum amplify a gradient component that is constant from
step to step, and one that flips sign every step?
:::

::: answer
$1/(1-\mu) = 10$ and $1/(1+\mu) \approx 0.53$.
:::

::: check
Gradient descent on a quadratic with $\lambda_{\max} = 50$ is run at $\eta = 0.05$. What happens?
:::

::: answer
$\eta\lambda_{\max} = 2.5 > 2$: the steepest mode is multiplied by $1 - 2.5 = -1.5$ every step and
diverges.
:::

::: check
Is heavy ball with $\mu = 0.9$ stable on the same quadratic at $\eta = 0.05$?
:::

::: answer
Yes. Its limit is $2(1+\mu)/\lambda_{\max} = 3.8/50 = 0.076$.
:::

## Adaptive methods: AdaGrad, RMSProp, Adam and AdamW {#s8}

Momentum improves the direction of a step; it does nothing about scale. Gradient sizes differ by
orders of magnitude across a network's parameters: at the first step of [Lab 3](#lab3)'s digits
network the non-zero gradient entries range from $1.8\times 10^{-7}$ to $6.4\times 10^{-2}$. A
single $\eta$ is then too large for some parameters and too small for others. The adaptive
methods apply a diagonal preconditioner, $\theta \leftarrow \theta - \eta\mathbf{D}^{-1}\mathbf{g}$,
with $\mathbf{D}$ estimated from the gradients' own history, so that each parameter gets its own
step size.

### AdaGrad and RMSProp

**AdaGrad** (Duchi, Hazan and Singer 2011) divides by the root of the accumulated squared
gradients, elementwise:

$$
\mathbf{G} \leftarrow \mathbf{G} + \mathbf{g}^2, \qquad
\theta \leftarrow \theta - \eta\,\frac{\mathbf{g}}{\sqrt{\mathbf{G}} + \epsilon}.
$$

A parameter that is rarely updated keeps a large step, which suits sparse features. But
$\mathbf{G}$ only grows: with gradients of roughly constant size, $\sqrt{\mathbf{G}}$ grows like
$\sqrt t$ and the effective step decays like $1/\sqrt t$, so long non-convex training stalls.
**RMSProp** (Tieleman and Hinton 2012, from a lecture slide rather than a paper) replaces the sum
by an exponential moving average, which forgets old gradients:

$$
\mathbf{v} \leftarrow \rho\mathbf{v} + (1-\rho)\mathbf{g}^2, \qquad
\theta \leftarrow \theta - \eta\,\frac{\mathbf{g}}{\sqrt{\mathbf{v}} + \epsilon}, \qquad \rho = 0.9 \text{ or } 0.99 .
$$

### Adam

**Adam** (Kingma and Ba 2015) adds momentum to RMSProp, as a moving average of the gradient, and
corrects both averages for their start at zero:

$$
\begin{aligned}
\mathbf{m} &\leftarrow \beta_1\mathbf{m} + (1-\beta_1)\mathbf{g}, &
\mathbf{v} &\leftarrow \beta_2\mathbf{v} + (1-\beta_2)\mathbf{g}^2, \\
\hat{\mathbf{m}} &= \frac{\mathbf{m}}{1-\beta_1^t}, &
\hat{\mathbf{v}} &= \frac{\mathbf{v}}{1-\beta_2^t}, \qquad
\theta \leftarrow \theta - \eta\,\frac{\hat{\mathbf{m}}}{\sqrt{\hat{\mathbf{v}}} + \epsilon},
\end{aligned}
$$

with $\beta_1 = 0.9$, $\beta_2 = 0.999$ and $\epsilon = 10^{-8}$. Large language models often use
$\beta_2 = 0.95$, so that $\mathbf{v}$ follows changes in the gradient's scale faster.

**Bias correction.** With $\mathbf{m}_0 = \mathbf{0}$, unrolling the average gives
$m_t = (1-\beta_1)\sum_{s=1}^{t}\beta_1^{t-s}g_s$. If the gradients have a constant mean,

$$
\mathbb{E}[m_t] = (1-\beta_1)\,\mathbb{E}[g]\sum_{k=0}^{t-1}\beta_1^k = (1-\beta_1^t)\,\mathbb{E}[g],
$$

by the geometric series. The average is biased towards zero by the factor $1-\beta_1^t$, and
dividing by it removes the bias; the same argument with $\beta_2$ and $g^2$ gives $\hat{\mathbf{v}}$.
Without the correction the step $m/\sqrt v$ equals the corrected step times
$(1-\beta_1^t)/\sqrt{1-\beta_2^t}$. For $\beta_2 = 0.999$ that factor is 3.16 at $t = 1$, peaks at
6.57 at $t = 12$, and is still 1.26 at $t = 1{,}000$: early steps several times too large. For
$\beta_2 = 0.95$ it is 0.45 at $t = 1$ and never exceeds 1.10. Which way the error goes depends on
$\beta_2$ against $\beta_1$ (Figure 2.13).

::: worked title="Bias correction with a constant gradient"
Take $g = 0.5$ at every step. At $t = 1$: $m = 0.1\cdot 0.5 = 0.05$ and
$v = 0.001\cdot 0.25 = 0.00025$. Corrected, $\hat m = 0.05/0.1 = 0.5$ and
$\hat v = 0.00025/0.001 = 0.25$, so the step is $\eta\cdot 0.5/\sqrt{0.25} = \eta$. Uncorrected,
$0.05/\sqrt{0.00025} = 0.05/0.01581 = 3.162$, so the step is $3.162\eta$. The factor
$(1-0.9^t)/\sqrt{1-0.999^t}$ at $t = 1$, 10, 100 and 1,000 is 3.16, 6.53, 3.24 and 1.26.
:::

::: figure id=fig-02-13
The uncorrected-to-corrected step ratio $(1-\beta_1^t)/\sqrt{1-\beta_2^t}$ against $t$ on a log
x-axis from 1 to $10^4$, with $\beta_1 = 0.9$. For $\beta_2 = 0.999$ it rises from 3.16 to a peak
of 6.57 at $t = 12$ and falls towards 1; for $\beta_2 = 0.95$ it rises from 0.45 to a peak of 1.10
at $t = 20$. A horizontal line marks 1.
:::

**What Adam's step is.** Parameter $i$ moves by about $\eta|\hat m_i|/\sqrt{\hat v_i}$. Since
$\hat v_i$ estimates $\mathbb{E}[g_i^2] = \mathbb{E}[g_i]^2 + \operatorname{Var}(g_i)$, the step is
about $\eta$ when the gradient is consistent and smaller when it is noisy. At $t = 1$,
$\hat m = g$ and $\hat v = g^2$, so the step is exactly $\eta g/(|g| + \epsilon) \approx \eta\,\operatorname{sign}(g)$:
every parameter with a non-negligible gradient moves by $\eta$.

::: worked title="Adam's first step on the digits network"
In [Lab 3](#lab3), of the 26,122 parameters, 615 have exactly zero gradient at the first step:
the 512 first-layer weights from the four pixels that are zero in every training image, and 103
second-layer weights between units that are never both active on that batch. Of the rest, 99.96%
move by more than $0.99\eta$, and none by more than $\eta$, although their gradients range from
$1.8\times 10^{-7}$ to $6.4\times 10^{-2}$.
:::

The update is invariant to rescaling the loss: $\mathbf{g} \to c\mathbf{g}$ gives
$\hat{\mathbf{m}} \to c\hat{\mathbf{m}}$ and $\sqrt{\hat{\mathbf{v}}} \to |c|\sqrt{\hat{\mathbf{v}}}$,
and the ratio is unchanged ($\epsilon$ aside). Multiply the loss by 1,000 and SGD's step becomes
1,000 times larger, so it diverges at any $\eta$ that was stable before; Adam's step does not
change. This is why Adam forgives unscaled losses. It is not invariant to rescaling the
parameters, which is why unscaled inputs still hurt it ([Exercise 15](#e15)).

Adam is also per-coordinate: it equalises scales along the parameter axes but cannot undo
curvature in rotated directions. On the optimiser-paths widget's ravine ([Section 7](#s7)) it
needs about 126 steps when the valley is aligned with the axes and about 214 when the valley is
rotated by 45°, while gradient descent and heavy ball do not change.

**Memory.** Adam keeps two extra numbers per parameter. With fp32 weights and gradients that is
$4 + 4 + 4 + 4 = 16$ bytes per parameter; with bf16 weights and gradients plus an fp32 master copy
it is $2 + 2 + 4 + 4 + 4 = 16$ bytes as well. The digits network needs
$26{,}122\cdot 16 = 417{,}952$ bytes, 418 kB; a model of $7\times 10^9$ parameters needs 112 GB
before any activations. [Module 08, Section 8](module_08_EN.html#s8) does the full accounting.

### Weight decay is not L2 under Adam

Under SGD the two are the same. Adding $(\lambda/2)\|\theta\|^2$ to the loss adds $\lambda\theta$ to
the gradient, and

$$
\theta \leftarrow \theta - \eta(\mathbf{g} + \lambda\theta) = (1 - \eta\lambda)\,\theta - \eta\mathbf{g},
$$

which shrinks the weights by the factor $1 - \eta\lambda$ every step: **weight decay**. PyTorch's
`weight_decay=λ` corresponds to the penalty $(\lambda/2)\|\theta\|^2$; Module 01 wrote the penalty
as $\lambda\|\theta\|^2$, which doubles the coefficient.

Under Adam they differ (Loshchilov and Hutter 2019). With an L2 penalty, $\mathbf{g} + \lambda\theta$
goes into $\mathbf{m}$ and $\mathbf{v}$, and the decay term is divided by $\sqrt{\hat{\mathbf{v}}}$
like everything else: parameter $i$ shrinks by about $\eta\lambda\theta_i/\sqrt{\hat v_i}$ per
step. Parameters with a large gradient history are regularised less, those with small gradients
more. **AdamW** applies the decay outside the normalisation,

$$
\theta \leftarrow \theta - \eta\left(\frac{\hat{\mathbf{m}}}{\sqrt{\hat{\mathbf{v}}} + \epsilon} + \lambda\theta\right),
$$

shrinking every parameter by the same factor per step, and following the learning-rate schedule.
No L2 coefficient reproduces it unless $\hat{\mathbf{v}}$ is the same for every parameter.

::: worked title="Two weights, two regularisers"
$\eta = 10^{-3}$, $\lambda = 10^{-4}$, two weights both equal to 1, one with gradient RMS 10 and
one with 0.1. Adam + L2 shrinks them by $\eta\lambda/\sqrt{\hat v} = 10^{-7}/10 = 10^{-8}$ and
$10^{-7}/0.1 = 10^{-6}$ per step, a factor of 100 apart: the coupled shrinkage falls in
proportion to the gradient RMS. AdamW shrinks both by $\eta\lambda = 10^{-7}$, whatever the RMS.
:::

In PyTorch, `torch.optim.AdamW` is the decoupled form (default `weight_decay=0.01`), and
`torch.optim.Adam(weight_decay=λ)` is the coupled L2 form (default 0); recent versions also
accept `Adam(..., decoupled_weight_decay=True)`, which is AdamW. Decay the weight matrices, not
biases or normalisation gains, which set offsets and scales that decay would only distort. Two
parameter groups do it:

```python
decay = [p for p in model.parameters() if p.ndim >= 2]      # weight matrices
no_decay = [p for p in model.parameters() if p.ndim < 2]    # biases, norm gains
opt = torch.optim.AdamW([{"params": decay, "weight_decay": 0.01},
                         {"params": no_decay, "weight_decay": 0.0}], lr=2e-3)
print(sum(p.numel() for p in decay), sum(p.numel() for p in no_decay))
```

```output
25856 266
```

For the digits network, 25,856 weights are decayed and 266 biases are not. Adam's original
convergence proof was later shown to be flawed (Reddi, Kale and Kumar 2018). The method works in
practice, and that is the evidence for it.

::: keyidea
Adam divides each parameter's averaged gradient by its own running RMS, so every step is about
$\eta$ whatever the gradient's scale; AdamW then decays all weights by the same factor $\eta\lambda$,
which an L2 penalty under Adam does not.
:::

::: check
Without bias correction and with $\beta_2 = 0.999$, are Adam's early steps too large or too
small, and why?
:::

::: answer
Too large. The average with $\beta_2 = 0.999$ is far more depleted by its zero start than the
average with $\beta_1 = 0.9$, so $\sqrt v$ underestimates more than $m$ does: a factor 3.16 at
$t = 1$ and about 6.5 near $t = 12$.
:::

::: check
Multiply the loss by 1,000. What happens to the SGD step and to the Adam step?
:::

::: answer
SGD's step is 1,000 times larger; Adam's is unchanged, apart from $\epsilon$.
:::

::: check
On the optimiser-paths widget's ravine Adam needs about 126 steps when the valley is aligned with
the axes and about 214 when it is rotated by 45°, while gradient descent and heavy ball are
unchanged. Why?
:::

::: answer
Adam rescales each coordinate separately. Aligned with the axes, that rescaling matches the
curvature; rotated, every coordinate mixes the steep and the shallow direction, which no
per-coordinate scaling can undo. Gradient descent and momentum act on the gradient vector as a
whole, so rotating the problem only rotates their paths.
:::

## Learning-rate schedules, the range test and gradient clipping {#s9}

Three devices surround the optimiser: a schedule changes $\eta$ during training, the range test
finds its scale, and gradient clipping caps the occasional huge gradient.

### Why decay

[Module 01, Section 4](module_01_EN.html#s4) derived the reason. On one quadratic direction with
curvature $\lambda$ and mini-batch gradient noise of variance $s^2/B$, a constant step leaves the
iterate hovering around the minimum with stationary variance

$$
V = \frac{\eta s^2}{B\lambda(2 - \eta\lambda)} \approx \frac{\eta s^2}{2B\lambda},
$$

an excess loss $\tfrac12\lambda V$ proportional to $\eta/B$. A constant learning rate therefore
leaves the final model at a random point of a band whose width $\eta$ sets; decaying $\eta$
shrinks the band.

::: worked title="The noise floor, predicted and measured"
With $\lambda = 1$ and $s^2/B = 1$, as in Module 01's example, the excess loss is $\tfrac12 V = \eta/(2(2-\eta))$: at
$\eta = 0.1$, $0.1/3.8 = 0.0263$; at $\eta = 0.01$, $0.01/3.98 = 0.0025$. Ten times smaller
$\eta$, ten times lower floor. [Lab 3](#lab3) measures it on a network fitted to $y = \sin 3x$
plus Gaussian noise of standard deviation 0.1, whose validation MSE for the true function, the
floor no model can beat, is 0.0104. SGD with momentum at a constant $\eta = 0.05$ ends at a
validation MSE of 0.0130, 26% above the floor, and its last five epochs scatter with a standard
deviation of 0.0007; step decay ends at 0.01041 and warmup plus cosine at 0.01043, both within
half a per cent of the floor. One run per schedule: the size of the constant schedule's excess is
one point of a jittering curve, but its sign and its jitter are the effect predicted above.
:::

### Schedules

**Step decay** multiplies $\eta$ by 0.1 at fixed fractions of training, for example 50% and 75%.
**Cosine decay** (Loshchilov and Hutter 2017) follows half a cosine from $\eta_{\max}$ to $\eta_{\min}$
over $T$ steps:

$$
\eta_t = \eta_{\min} + \tfrac12(\eta_{\max} - \eta_{\min})\big(1 + \cos(\pi t/T)\big).
$$

**Linear warmup** raises $\eta$ from near 0 to $\eta_{\max}$ over the first $T_w$ steps, typically
1–5% of training, a few hundred to a few thousand steps; the cosine then runs over the remaining
$T - T_w$. Warmup plus cosine to a tenth of the peak or less is the language-model default; as of
2026, **warmup–stable–decay** schedules, which hold the peak and decay only near the end, are a
common alternative ([Module 08, Section 6](module_08_EN.html#s6)). Figure 2.14 draws three
schedules on one set of axes.

::: worked title="Warmup plus cosine, step by step"
$\eta_{\max} = 3\times 10^{-3}$, $\eta_{\min} = 3\times 10^{-5}$ (1% of the peak), $T = 10{,}000$,
$T_w = 500$, so the cosine runs over 9,500 steps with progress $p = (t - 500)/9{,}500$.

- Step 250, in the warmup: $3\times 10^{-3}\cdot 250/500 = 1.5\times 10^{-3}$.
- Step 500: the peak, $3\times 10^{-3}$.
- Step 2,875: $p = 0.25$, $\cos(\pi/4) = 0.7071$, so
  $\eta = 3\times 10^{-5} + \tfrac12(2.97\times 10^{-3})(1.7071) = 2.565\times 10^{-3}$.
- Step 5,250: $p = 0.5$, $\cos(\pi/2) = 0$, so $\eta = 3\times 10^{-5} + 1.485\times 10^{-3} = 1.515\times 10^{-3}$.
- Step 7,625: $p = 0.75$, $\cos(3\pi/4) = -0.7071$, so
  $\eta = 3\times 10^{-5} + \tfrac12(2.97\times 10^{-3})(0.2929) = 4.65\times 10^{-4}$.
- Step 10,000: $p = 1$, $\eta = \eta_{\min} = 3\times 10^{-5}$.
:::

::: figure id=fig-02-14
Three schedules over 10,000 steps on one set of axes, $\eta$ on a linear y-axis: step decay from
$3\times 10^{-3}$ with $\times 0.1$ at steps 5,000 and 7,500; cosine from $3\times 10^{-3}$ to
$3\times 10^{-5}$ without warmup; a 500-step linear warmup followed by cosine to $3\times 10^{-5}$.
The worked example's values at steps 250, 5,250 and 10,000 are marked.
:::

Warmup has three reasons. At the start Adam's $\hat{\mathbf{v}}$ is estimated from a handful of
gradients and is noisy even after bias correction, so the early steps are erratic (Liu et al.
2020). The curvature at initialisation can be high, so a step that is safe later is too large
then. And large-batch SGD with a scaled-up learning rate needs a ramp: Goyal et al. (2017) scale
$\eta$ linearly with the batch size and warm up over 5 epochs. The large-batch regime belongs to
[Module 08](module_08_EN.html#s6).

### The range test

The peak learning rate is the most important hyperparameter after the architecture. The
**learning-rate range test** (Smith 2017) finds its scale in minutes: train for a few hundred
steps while raising $\eta$ geometrically from about $10^{-6}$ to 10, record the loss smoothed by an
exponential moving average, and plot it against $\log\eta$. The curve is flat while $\eta$ is too
small, falls fastest over about a decade, reaches a minimum, and then rises steeply. Choose the
peak about 3–10 times below the minimum, near the steepest fall: the full run is longer and
noisier than the test.

::: worked title="Range tests on the digits network"
[Lab 3](#lab3) runs 200 steps from $10^{-5}$ to 10 and stops a test once the smoothed loss
exceeds four times its minimum. SGD with momentum 0.9 falls fastest near $\eta = 0.048$, has its
smoothed minimum at 0.44 and is stopped at 0.58. Adam falls fastest near $2.4\times 10^{-3}$, has
its minimum at 0.017 and is stopped at 0.089. The chosen peaks, 0.05 and $2\times 10^{-3}$, sit at
the steepest falls, about nine times below the minima. Lab 3 plots both curves.
:::

In PyTorch, `CosineAnnealingLR(opt, T_max)` counts calls to `scheduler.step()`: epochs if stepped
per epoch, batches if per batch. Warmup comes from `LinearLR` inside `SequentialLR`, or from a
`LambdaLR`. Call `scheduler.step()` after `optimizer.step()`. The worked example's schedule:

```python
from torch.optim.lr_scheduler import CosineAnnealingLR, LinearLR, SequentialLR

opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
total, warm = 10_000, 500
sched = SequentialLR(opt, milestones=[warm], schedulers=[
    LinearLR(opt, start_factor=1e-3, end_factor=1.0, total_iters=warm),
    CosineAnnealingLR(opt, T_max=total - warm, eta_min=3e-5)])   # T_max in batches
```

### Gradient clipping

**Gradient clipping** by global norm concatenates all parameters' gradients into one vector and,
if its norm exceeds a threshold $c$, rescales it: $\mathbf{g} \leftarrow c\,\mathbf{g}/\|\mathbf{g}\|$.
The direction is kept. $c = 1.0$ is common for transformers and recurrent networks (Pascanu,
Mikolov and Bengio 2013; [Module 04, Section 4](module_04_EN.html#s4)). Clipping each value
separately (`clip_grad_value_`) changes the direction and is a cruder tool.

::: worked title="Clipping by norm and by value"
$\mathbf{g} = (3, 4)$ has norm 5. Clipping the norm at 1 gives $(3, 4)/5 = (0.6, 0.8)$, still at
$\arctan(4/3)$, or 53.1°, to the first axis. Clipping each value at 1 gives $(1, 1)$, at 45°: a
different direction.
:::

Clipping matters even under Adam, whose step is normalised, because a spike still enters
$\mathbf{m}$ and $\mathbf{v}$. In units of the typical gradient ($g \approx 1$, $m \approx 1$,
$v \approx 1$), let one step bring a gradient of 100. Then $v = 0.999 + 0.001\cdot 100^2 = 11.0$ and
$\sqrt v = 3.3$, so the following steps of that parameter shrink about 3.3 times. The excess decays
as $10\cdot 0.999^t$, with time constant $1/(1-\beta_2) = 1{,}000$ steps: $\sqrt v$ needs about 3,860
steps to return within 10% of normal. Meanwhile $m = 0.9 + 0.1\cdot 100 = 10.9$ points along the
spike, and that step is $10.9/3.3 \approx 3$ times the usual size. Clipping first prevents both.
`clip_grad_norm_` returns the norm before clipping: log it. If clipping fires on most steps, the
threshold or the learning rate is wrong.

```python
loss.backward()
grad_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)  # pre-clip
opt.step()
sched.step()
```

::: keyidea
Find the peak learning rate with a range test, warm up to it, decay it to shrink the noise band,
and clip the global gradient norm so that one spike cannot corrupt the optimiser's state.
:::

::: check
Why does a constant learning rate leave the final model at "a random point on the oscillation"?
:::

::: answer
With noisy gradients the iterate fluctuates around the minimum with a variance roughly
proportional to $\eta$; only reducing $\eta$ reduces the fluctuation.
:::

::: check
Gradients $(3, 4)$ are clipped to global norm 1 and, separately, to value 1. What are the
results?
:::

::: answer
$(0.6, 0.8)$, in the same direction; and $(1, 1)$, in a different direction.
:::

::: check
In a range test the loss is lowest at $\eta = 0.1$ and explodes at 0.3. What peak learning rate
do you choose?
:::

::: answer
About 0.01–0.03, a factor of 3–10 below the minimum.
:::
