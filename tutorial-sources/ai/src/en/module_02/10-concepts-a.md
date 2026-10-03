## From fixed features to learned ones {#s1}

[Module 01](module_01_EN.html) ended with linear models on hand-made features,
$f(\mathbf{x}) = \mathbf{w}^\top\boldsymbol{\psi}(\mathbf{x})$. (Module 01 wrote the feature map
as $\boldsymbol{\phi}$; this module keeps $\phi$ for the activation function.) Such a model works
when someone knows $\boldsymbol{\psi}$: for a disc inside a ring,
$\boldsymbol{\psi}(\mathbf{x}) = (x_1^2, x_2^2, x_1x_2)$ makes the two classes linearly
separable. For an image or a vibration spectrum nobody can write $\boldsymbol{\psi}$ down. A
**neural network** makes the feature map part of the model and learns it from the data:

$$
f(\mathbf{x}) = \mathbf{w}^\top\mathbf{h}(\mathbf{x};\theta), \qquad \mathbf{h} = \phi\big(\mathbf{W}^\top\mathbf{x} + \mathbf{b}\big),
$$

with $\mathbf{W}$ and $\mathbf{b}$ trained together with $\mathbf{w}$, by the same gradient
descent.

### The multilayer perceptron

The **multilayer perceptron** (MLP) stacks layers of this kind. This module writes it as

$$
\begin{aligned}
\mathbf{h}^{(0)} &= \mathbf{x},\\
\mathbf{z}^{(l)} &= \mathbf{W}^{(l)\top}\mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}, \qquad \mathbf{h}^{(l)} = \phi\big(\mathbf{z}^{(l)}\big), \qquad l = 1, \dots, L-1,\\
\mathbf{z}^{(L)} &= \mathbf{W}^{(L)\top}\mathbf{h}^{(L-1)} + \mathbf{b}^{(L)},
\end{aligned}
$$

with $\mathbf{W}^{(l)} \in \mathbb{R}^{d_{l-1}\times d_l}$ (one row per input of the layer, one
column per unit) and $\mathbf{b}^{(l)} \in \mathbb{R}^{d_l}$. This convention holds everywhere
below. The **activation function** $\phi$ is a fixed nonlinear function applied to each component
separately ([Section 5](#s5) compares the choices). The last layer has no $\phi$: its output
$\mathbf{z}^{(L)}$ is the prediction in regression and the vector of **logits** in
classification, and the loss consumes it — squared error, or softmax cross-entropy
([Module 01, Section 5](module_01_EN.html#s5)). The vocabulary: $\mathbf{x}$ is the **input**;
layers $1$ to $L-1$ are **hidden layers**, and each component of $\mathbf{h}^{(l)}$ is a
**hidden unit**; layer $L$ is the **output layer**; $d_l$ is the **width** of layer $l$; $L$, the
number of weight layers, is the **depth**; and $\mathbf{z}^{(l)}$ is a **pre-activation**.
Figure 2.1 labels each of them on a small network.

::: figure id=fig-02-1
An MLP with input dimension 2, two hidden layers of 4 units and one output, drawn left to right
with every connection. Each weight layer carries its parameter shapes in this module's convention:
$\mathbf{W}^{(1)} \in \mathbb{R}^{2\times 4}$, $\mathbf{b}^{(1)} \in \mathbb{R}^{4}$;
$\mathbf{W}^{(2)} \in \mathbb{R}^{4\times 4}$, $\mathbf{b}^{(2)} \in \mathbb{R}^{4}$;
$\mathbf{W}^{(3)} \in \mathbb{R}^{4\times 1}$, $b^{(3)} \in \mathbb{R}$. Each hidden column
computes $\mathbf{z} = \mathbf{W}^\top\mathbf{h} + \mathbf{b}$, then $\mathbf{h} = \phi(\mathbf{z})$;
the output node is a logit or a prediction, with no $\phi$. Brackets mark the width (units per
layer) and the depth ($L = 3$ weight layers).
:::

### Why the nonlinearity is necessary

Without $\phi$, depth buys nothing. Two layers give

$$
\mathbf{z}^{(2)} = \mathbf{W}^{(2)\top}\big(\mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)}\big) + \mathbf{b}^{(2)}
= \big(\mathbf{W}^{(1)}\mathbf{W}^{(2)}\big)^\top\mathbf{x} + \big(\mathbf{W}^{(2)\top}\mathbf{b}^{(1)} + \mathbf{b}^{(2)}\big),
$$

using $\mathbf{B}^\top\mathbf{A}^\top = (\mathbf{A}\mathbf{B})^\top$: one affine map. By induction
any stack of affine layers collapses to one, so a deep network without activations is a linear
model with redundant parameters.

::: worked title="The affine collapse with numbers"
Take $\mathbf{W}^{(1)} = \begin{bmatrix}1 & 2\\ 0 & 1\end{bmatrix}$ (rows index the inputs),
$\mathbf{b}^{(1)} = (1, 0)$, $\mathbf{W}^{(2)} = \begin{bmatrix}1\\ -1\end{bmatrix}$,
$b^{(2)} = 0.5$, and no activation.

- Layer 1: $\mathbf{z}^{(1)} = \mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)} = (x_1 + 1,\; 2x_1 + x_2)$.
- Layer 2: $z^{(2)} = (x_1 + 1) - (2x_1 + x_2) + 0.5 = -x_1 - x_2 + 1.5$.
- The formula agrees: $\mathbf{W}^{(1)}\mathbf{W}^{(2)} = (1 - 2,\; 0 - 1)^\top = (-1, -1)^\top$ and
  $\mathbf{W}^{(2)\top}\mathbf{b}^{(1)} + b^{(2)} = 1 - 0 + 0.5 = 1.5$.

The decision boundary $z^{(2)} = 0$ is the line $x_1 + x_2 = 1.5$, and no number of such layers
can bend it.
:::

### What the universal approximation theorem says

With $\phi$, one hidden layer is enough in principle. The **universal approximation theorem**:
let $\phi$ be continuous and not a polynomial. For every continuous $f$ on a compact set
$K \subset \mathbb{R}^d$ and every $\varepsilon > 0$ there are a finite width $N$ and weights such
that the one-hidden-layer network
$g(\mathbf{x}) = \sum_{j=1}^{N} a_j\,\phi(\mathbf{w}_j^\top\mathbf{x} + b_j) + c$ satisfies

$$
\sup_{\mathbf{x}\in K}\,\big|f(\mathbf{x}) - g(\mathbf{x})\big| < \varepsilon.
$$

Cybenko (1989) proved it for sigmoids and Hornik (1991) for bounded, non-constant activations;
Leshno et al. (1993) showed that "not a polynomial" is exactly the condition, which admits ReLU.
The exception is easy to see: if $\phi$ is a polynomial of degree $p$, every such $g$ is a
polynomial of degree at most $p$, a fixed family that cannot come arbitrarily close to
$\sin 3x$.

The theorem says less than it seems to. It does not say how large $N$ must be: the constructive
proofs in effect tile $K$ with a grid, and a grid of spacing $h$ in $d$ dimensions has about
$h^{-d}$ cells, so the unit count can grow exponentially with $d$. It does not say that gradient
descent from a random start finds such weights. And it does not say that a network fitted to
finitely many samples generalises. The rest of this module is about the second question; the
evaluation discipline of [Module 01, Section 10](module_01_EN.html#s10) is about the third.

### The theorem made constructive in one dimension

In one dimension the weights can be written down. Take knots $a = x_0 < x_1 < \dots < x_K = b$
and let $p$ be the piecewise-linear interpolant of $f$, with slope
$s_k = \big(f(x_{k+1}) - f(x_k)\big)/(x_{k+1} - x_k)$ on segment $k$. On $[a, b]$,

$$
p(x) = f(x_0) + \sum_{k=0}^{K-1} c_k\,\operatorname{ReLU}(x - x_k), \qquad c_0 = s_0, \quad c_k = s_k - s_{k-1}.
$$

On the first segment only the first hinge is active, so $p$ starts at $f(x_0)$ with slope $s_0$;
each later hinge switches on at its knot and changes the slope by exactly $c_k$. This is a
one-hidden-layer ReLU network with $K$ units: input weights 1, biases $-x_k$, output weights
$c_k$ and output bias $f(x_0)$.

Its error follows from the remainder of linear interpolation. Fix $x$ in a segment
$[x_k, x_{k+1}]$ of length $h$ and choose the constant $C$ so that
$e(u) = f(u) - p(u) - C(u - x_k)(u - x_{k+1})$ vanishes at $u = x$. Then $e$ has three zeros,
$x_k$, $x$ and $x_{k+1}$, so Rolle's theorem applied twice gives a $\xi$ with
$e''(\xi) = f''(\xi) - 2C = 0$; hence
$f(x) - p(x) = \tfrac12 f''(\xi)(x - x_k)(x - x_{k+1})$. The product is largest in size at the
midpoint, where it is $h^2/4$, so with $M = \max|f''|$

$$
|f(x) - p(x)| \le \frac{M h^2}{8}.
$$

Accuracy $\varepsilon$ needs $h \le \sqrt{8\varepsilon/M}$: in one dimension, a number of units
proportional to $\varepsilon^{-1/2}$.

::: worked title="Twenty-two hinges for sin 3x"
Approximate $f(x) = \sin 3x$ on $[-1, 1]$, the function [Lab 1](#lab1) fits. Here
$f''(x) = -9\sin 3x$, so $M = 9$; with $K$ equal segments $h = 2/K$, and the bound is
$9(2/K)^2/8 = 4.5/K^2$. The maximum errors, measured on 2 million points:

| $K$ | bound $4.5/K^2$ | measured maximum error |
|---|---|---|
| 6 | 0.125 | 0.122 |
| 16 | 0.0176 | 0.0174 |
| 21 | 0.0102 | 0.0101 |
| 22 | 0.0093 | 0.0093 |

So 22 equal segments are the fewest that reach $\varepsilon = 0.01$. For $K = 6$ the knots are
$-1, -\tfrac23, \dots, 1$, the six slopes are $(-2.305, 0.203, 2.524, 2.524, 0.203, -2.305)$, and
the hinge coefficients are $c = (-2.305, 2.508, 2.321, 0, -2.321, -2.508)$. The fourth is exactly
zero: $\sin 3x$ is odd, so the slopes either side of $x = 0$ are equal (2.524), and 5 units
suffice (Figure 2.2). The same symmetry removes the hinge at 0 for every even $K$, so 21 units reach
$\varepsilon = 0.01$. Compare Lab 1, where gradient descent on 64 units reaches a training mean
squared error of $2.8\times10^{-4}$ (RMS error 0.017) in 3,000 steps: three times the units, a
worse fit, and no guarantee in advance that it would get even that far.
:::

::: figure id=fig-02-2
Top: $\sin 3x$ on $[-1, 1]$ (solid) and its 6-segment piecewise-linear interpolant (dashed), with
the 7 knots marked as dots and the maximum error, 0.122, annotated. Bottom: the hinge functions
$c_k\operatorname{ReLU}(x - x_k)$ for $k = 0, \dots, 5$, one colour per knot, with
$c = (-2.305, 2.508, 2.321, 0, -2.321, -2.508)$ in the legend; the $k = 3$ hinge is flat because
$c_3 = 0$. $f(-1)$ plus the sum of the six hinges is the dashed interpolant of the top panel.
:::

### Why depth helps

The construction spends one unit per linear piece. For some functions depth does far better.
The **tent map** on $[0, 1]$ uses two ReLU units:

$$
t(x) = 2\operatorname{ReLU}(x) - 4\operatorname{ReLU}\big(x - \tfrac12\big) =
\begin{cases} 2x, & 0 \le x \le \tfrac12,\\ 2 - 2x, & \tfrac12 < x \le 1. \end{cases}
$$

It maps each half of $[0, 1]$ onto all of $[0, 1]$, rising on the first half and falling on the
second, so applying it once more folds every linear piece in two: the $k$-fold composition $t^k$
is a sawtooth with $2^k$ pieces (Telgarsky 2016). As a network, $t^k$ is $k$ layers of 2 units.
The first layer has 2 weights and 2 biases; each further layer reads the previous pair
$(h_1, h_2)$ through 4 weights and 2 biases, since $t = 2h_1 - 4h_2$ is a linear function of the
pair; the output $2h_1 - 4h_2$ takes 2 weights and a bias. In all: $2k$ units and
$4 + 6(k - 1) + 3 = 6k + 1$ parameters.

A one-hidden-layer ReLU network on a scalar input,
$g(x) = \sum_j a_j\operatorname{ReLU}(w_jx + b_j) + c$, changes slope only where a unit switches,
at $x = -b_j/w_j$. With $n$ units it has at most $n$ breakpoints and so at most $n + 1$ pieces.
Representing $t^k$ therefore needs at least $2^k - 1$ units and $3(2^k - 1) + 1$ parameters (an
input weight, a bias and an output weight per unit, plus $c$). Composition reuses the same two
units on every piece; width pays for every piece separately.

::: worked title="Counting the sawtooth"
On a grid of $2^{12} + 1$ points of $[0, 1]$, fine enough to contain every breakpoint, $t^k$ has
2, 4, 8, 16, 32 and 64 linear pieces for $k = 1, \dots, 6$. The parameter counts:

| $k$ | deep: $2k$ units, $6k + 1$ parameters | one hidden layer: at least |
|---|---|---|
| 4 | 8 units, 25 parameters | 15 units, 46 parameters |
| 10 | 20 units, 61 parameters | 1,023 units, 3,070 parameters |
| 20 | 40 units, 121 parameters | 1,048,575 units, 3,145,726 parameters |

The deep cost grows linearly in $k$, the shallow one exponentially (Figure 2.3).
:::

::: figure id=fig-02-3
Left: four small panels on $[0, 1]$ showing $t$, $t\circ t$, $t^3$ and $t^4$, labelled 2, 4, 8
and 16 pieces. Right: the deep construction ($k$ layers of 2 ReLU units, $6k + 1$ parameters)
beside the one-hidden-layer alternative ($2^k - 1$ units, $3(2^k - 1) + 1$ parameters), and a
table of parameter counts for $k = 4$, 10 and 20: 25 against 46, 61 against 3,070, and 121
against 3,145,726.
:::

What the argument shows is that functions exist that a deep network represents exponentially
more cheaply than a shallow one; more generally, the number of linear regions a ReLU network can
produce grows exponentially with depth (Montúfar et al. 2014). It does not show that the
functions you care about are of this kind, nor that gradient descent finds the deep
construction. Depth also has a price: the gradient must travel back through every layer, and
[Section 3](#s3) shows how it can vanish on the way, which [Sections 5](#s5), [6](#s6) and
[10](#s10) address. The informal case for depth is that real data look compositional — edges
make textures, textures make parts ([Module 03](module_03_EN.html)) — and a composition of simple
maps matches that structure.

### What the hidden units learn

A first-layer ReLU unit computes $\operatorname{ReLU}(\mathbf{w}^\top\mathbf{x} + b)$: zero on one
side of the line $\mathbf{w}^\top\mathbf{x} + b = 0$, rising linearly with distance on the other,
and constant along the line. It is a **ridge function**, a ramp over a half-plane. The output
layer adds the ramps with weights, so the logit is piecewise linear and the decision boundary,
where the logit is zero, is a polygon. Three ramps can surround a disc with a triangle; two can
only form a wedge, which encloses nothing.

::: widget name=mlp-playground
Press Play on the circles data and watch the eight thumbnails become half-plane ramps whose sum
closes a polygon around the inner disc. Then try three experiments: set the hidden layers to 0
(the accuracy stays near 50%); choose the activation "none" with three hidden layers (the same
straight line); set the units to 2 and then 3 (a wedge cannot enclose the disc; a triangle can).
:::

::: worked title="The playground in numbers"
These numbers come from a NumPy simulation of the widget's specification (circles data, 200
training points, Adam at $\eta = 0.03$); the widget draws its random numbers differently, so
expect other digits.

- No hidden layer: 53.5% training accuracy at a loss of 0.692, essentially $\ln 2 = 0.693$:
  chance.
- Three hidden layers with the identity activation: exactly the same 53.5%, the collapse of this
  section.
- One hidden layer of 2 ReLU units: 84.5% (two half-planes cannot enclose a disc). Of 3 units:
  100% after about 245 steps (a triangle). Of 8 units: 100% after about 58.
- The two-arm spiral: two hidden layers of 16 units (337 parameters) fit the training set in
  about 740 steps, one layer of 64 (257 parameters) in about 2,430, one of 128 (513 parameters)
  in about 1,830; one layer of 16 reaches only 74% in 3,000 steps.

Repeating the circles runs over eight seeds for data and initialisation shows how much such
numbers move. Two units reach between 70% and 90%. Three units find a triangle in five runs out
of eight within 1,000 steps and stall in the other three: the triangle exists every time, but
gradient descent does not always find it. Eight units always succeed, in 61 to 235 steps. The
spiral comparison illustrates depth; it proves nothing about it.
:::

::: keyidea
A hidden layer is a learned feature map. Without a nonlinearity any depth collapses to one affine
map; with one, a single hidden layer can approximate any continuous function, but nothing promises
a small network or that training will find it.
:::

::: check
A network with three hidden layers but no activation functions is trained on the circles data.
What decision boundaries can it represent?
:::

::: answer
Only straight lines. A composition of affine maps is affine, so the network is logistic regression
with extra parameters.
:::

::: check
A one-hidden-layer ReLU network with 5 hidden units takes a scalar input. At most how many linear
pieces can its output have?
:::

::: answer
Six. Each unit adds at most one breakpoint, at $x = -b/w$, and 5 breakpoints cut the line into at
most 6 pieces.
:::

::: check
Does the universal approximation theorem guarantee that gradient descent on a wide enough network
will fit a given continuous function?
:::

::: answer
No. It guarantees that suitable weights exist. It says nothing about finding them, and nothing
about generalising from finite data.
:::

## The forward pass, with shapes {#s2}

Section 1 wrote one example as a column. Training processes a **batch** of $B$ examples at once,
stacked as the rows of a matrix. Most bugs in network code are shape bugs, so this section writes
every shape down. It also counts what the forward pass costs in parameters, arithmetic and
memory, because every cost estimate later in the series starts from these counts.

### The batch form

With $\mathbf{H}^{(0)} = \mathbf{X} \in \mathbb{R}^{B\times d_0}$, one example per row,

$$
\mathbf{Z}^{(l)} = \mathbf{H}^{(l-1)}\mathbf{W}^{(l)} + \mathbf{1}\mathbf{b}^{(l)\top} \in \mathbb{R}^{B\times d_l}, \qquad \mathbf{H}^{(l)} = \phi\big(\mathbf{Z}^{(l)}\big),
$$

where $\mathbf{1} \in \mathbb{R}^{B}$ is a vector of ones, so $\mathbf{1}\mathbf{b}^{(l)\top}$
copies the bias into every row. Row $i$ of $\mathbf{Z}^{(l)}$ is
$\mathbf{h}_i^{(l-1)\top}\mathbf{W}^{(l)} + \mathbf{b}^{(l)\top}$, the transpose of Section 1's
$\mathbf{W}^{(l)\top}\mathbf{h}_i^{(l-1)} + \mathbf{b}^{(l)}$: the same computation, with examples
as rows instead of columns. In NumPy the bias needs no copying: adding an array of shape `(d_l,)`
to one of shape `(B, d_l)` **broadcasts** it over the rows. The output
$\mathbf{Z}^{(L)} \in \mathbb{R}^{B\times K}$ holds one row of $K$ logits per example; the softmax
happens inside the loss ([Section 12](#s12)), never as a layer in front of it.

```python
import numpy as np

rng = np.random.default_rng(0)
sizes = [64, 128, 128, 10]                         # d0 ... d3: the digits network
params = [(rng.normal(0, np.sqrt(2 / m), (m, n)), np.zeros(n))    # W is (d_{l-1}, d_l)
          for m, n in zip(sizes[:-1], sizes[1:])]

X = rng.normal(size=(64, sizes[0]))                # a batch: B = 64 rows
H = X
for l, (W, b) in enumerate(params, start=1):
    Z = H @ W + b                                  # (B, d_{l-1}) @ (d_{l-1}, d_l) + (d_l,)
    assert Z.shape == (X.shape[0], W.shape[1])
    H = np.maximum(Z, 0) if l < len(params) else Z     # no activation on the logits
print(H.shape, sum(W.size + b.size for W, b in params))
```

```output
(64, 10) 26122
```

### Parameters, FLOPs and memory

Layer $l$ has $d_{l-1}d_l$ weights and $d_l$ biases, so the network has
$\sum_{l=1}^{L}(d_{l-1}d_l + d_l)$ parameters. A product of a $(B\times m)$ and an $(m\times n)$
matrix computes $Bn$ dot products of length $m$: $Bmn$ multiplications and about as many
additions, $2Bmn$ **floating-point operations** (FLOPs). Summed over the layers, the forward pass
costs about $2B$ times the number of weights: each weight takes part in one multiplication and one
addition per example. Bias additions and activations cost $O(Bd_l)$ per layer, negligible next to
$Bd_{l-1}d_l$ for wide layers. This is where the rule of thumb comes from that a large model costs
about $2N$ FLOPs per token for a forward pass.

The series fixes the convention for such counts once, in
[Module 06, Section 11](module_06_EN.html#s11): in a FLOP count $N$ means the weights used in
matrix products (an embedding lookup costs no FLOPs), attention adds a term that grows with the
context, and a training step counts as three forward passes ([Section 3](#s3) shows why the
backward pass costs at most two). Memory, by contrast, counts every parameter.

The backward pass ([Section 3](#s3)) needs each layer's input $\mathbf{H}^{(l-1)}$ and its
pre-activation $\mathbf{Z}^{(l)}$ (or enough to evaluate $\phi'$), so a forward pass done for
training stores $O(B\sum_l d_l)$ numbers. Parameters are stored once; activations once per example
in the batch, which is why activation memory grows with batch size times depth. Byte units
follow the series convention: kB, MB and GB are decimal ($10^3$, $10^6$ and $10^9$ bytes); KiB, MiB
and GiB are binary ($2^{10}$, $2^{20}$ and $2^{30}$ bytes).

::: worked title="The tiny network used in Sections 2 to 4"
Two inputs, two ReLU hidden units, one linear output, squared error: $\mathbf{x} = (2, 1)$;
$\mathbf{W}^{(1)} = \begin{bmatrix}0.5 & -1.0\\ 0.25 & 0.5\end{bmatrix}$ (rows index the inputs,
columns the hidden units), $\mathbf{b}^{(1)} = (0.1, 0)$;
$\mathbf{W}^{(2)} = \begin{bmatrix}0.8\\ -0.6\end{bmatrix}$, $b^{(2)} = 0.2$; target $t = 1$;
loss $(\hat y - t)^2$.

- Layer 1: $\mathbf{z}^{(1)} = \mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)} = (0.5\cdot 2 + 0.25\cdot 1 + 0.1,\; -1.0\cdot 2 + 0.5\cdot 1 + 0) = (1.35, -1.5)$.
- ReLU: $\mathbf{h}^{(1)} = (1.35, 0)$. The second unit is inactive.
- Layer 2: $\hat y = 0.8\cdot 1.35 - 0.6\cdot 0 + 0.2 = 1.28$.
- Loss: $(1.28 - 1)^2 = 0.28^2 = 0.0784$.

Nine parameters ($4 + 2 + 2 + 1$). The two products cost 12 FLOPs by the $2Bmn$ count with
$B = 1$: $2\cdot 2\cdot 2 = 8$ in layer 1 and $2\cdot 2\cdot 1 = 4$ in layer 2, plus 3 bias
additions. As a batch of one, $\mathbf{X} = [\,2\;\;1\,]$ and
$\mathbf{X}\mathbf{W}^{(1)} + \mathbf{b}^{(1)\top} = [\,1.35\;\;{-1.5}\,]$: the same numbers as a
row.
:::

::: worked title="The digits network of Labs 3 to 5"
The network $64 \to 128 \to 128 \to 10$ has
$64\cdot 128 + 128 + 128\cdot 128 + 128 + 128\cdot 10 + 10 = 8{,}320 + 16{,}512 + 1{,}290 = 26{,}122$
parameters (104,488 bytes in fp32, at 4 bytes each), of which 25,856 are weights. The forward
pass costs $2\times 25{,}856 = 51{,}712$ FLOPs per example. For a batch of 64:

- layer 1: $2\cdot 64\cdot 64\cdot 128 = 1{,}048{,}576$;
- layer 2: $2\cdot 64\cdot 128\cdot 128 = 2{,}097{,}152$;
- layer 3: $2\cdot 64\cdot 128\cdot 10 = 163{,}840$;

in all 3,309,568, about 3.3 MFLOPs. Stored for the backward pass with $B = 64$: the input, $\mathbf{Z}$ and
$\mathbf{H}$ of both hidden layers, and the logits, $(64 + 2\cdot 128 + 2\cdot 128 + 10)\times 64\times 4 = 150{,}016$
bytes. The activations already take more memory than the parameters. Figure 2.4 lays out the
shapes and costs.
:::

::: figure id=fig-02-4
The batch forward pass of the digits network for $B = 64$. $\mathbf{X}$ ($64\times 64$, labelled
$B\times d_0$) times $\mathbf{W}^{(1)}$ ($64\times 128$), plus the bias row
$\mathbf{b}^{(1)\top}$ ($1\times 128$) copied down the rows (broadcast), gives $\mathbf{Z}^{(1)}$
($64\times 128$); $\phi$ maps it to $\mathbf{H}^{(1)}$. Then $\mathbf{H}^{(1)}\mathbf{W}^{(2)}$
gives $\mathbf{Z}^{(2)}$ and $\mathbf{H}^{(2)}$, and $\mathbf{H}^{(2)}\mathbf{W}^{(3)}$ the logits
($64\times 10$). Under each product, its cost: $2\cdot 64\cdot 64\cdot 128 = 1{,}048{,}576$,
$2\cdot 64\cdot 128\cdot 128 = 2{,}097{,}152$ and $2\cdot 64\cdot 128\cdot 10 = 163{,}840$ FLOPs.
The tensors kept for the backward pass are shaded.
:::

::: worked title="Where activations dominate"
An MLP of 50 layers of width 1,024 has $50\times(1{,}024^2 + 1{,}024) = 52{,}480{,}000$
parameters, 210 MB in fp32. Storing $\mathbf{Z}$ and $\mathbf{H}$ of every layer for a batch of
256 takes $2\times 50\times 256\times 1{,}024\times 4 = 104{,}857{,}600$ bytes, exactly 100 MiB
(105 MB); at batch 4,096 it is 16 times as much, 1.6 GiB (1.7 GB). Once batches are large,
activations, not parameters, set training memory. At the other end of the scale, a model with
$7\times 10^9$ parameters needs roughly $2\times 7\times 10^9 = 1.4\times 10^{10}$ FLOPs per token
for a forward pass, an estimate that treats every parameter as a matrix weight and ignores
attention; Module 06, Section 11 refines it.
:::

### Shapes in practice

PyTorch's `nn.Linear(d_in, d_out)` stores its weight as a `(d_out, d_in)` tensor and computes
$\mathbf{X}\mathbf{W}^\top + \mathbf{b}$. The mathematics is identical; only the stored layout
differs, which matters when weights are copied between NumPy and PyTorch. [Lab 1](#lab1) copies
`W1.T` into a PyTorch layer for exactly this reason.

```python
import torch, torch.nn as nn

layer = nn.Linear(64, 128)                         # PyTorch stores (d_out, d_in)
print(tuple(layer.weight.shape), tuple(layer.bias.shape))

pred, t = torch.zeros(256, 1), torch.zeros(256)    # (B, 1) against (B,)
print(tuple((pred - t).shape))                     # broadcast, silently
```

```output
(128, 64) (128,)
(256, 256)
```

Write the shape beside every array, in a comment or an `assert`. The second print shows the
commonest silent shape bug in regression: a prediction of shape `(B, 1)` minus a target of shape
`(B,)` broadcasts to `(B, B)`, every prediction against every target. NumPy computes it without
comment. PyTorch's `F.mse_loss` warns, "Using a target size (torch.Size([256])) that is different
to the input size (torch.Size([256, 1])). This will likely lead to incorrect results due to
broadcasting", and carries on. The model then learns the wrong thing. For prediction $\hat y_i$
the mean over all targets is $\frac1B\sum_j(\hat y_i - t_j)^2 = (\hat y_i - \bar t)^2 + \operatorname{Var}(t)$,
so the loss is smallest when every prediction equals the mean target $\bar t$, whatever the
input, and it then equals the variance of the targets.

::: worked title="The broadcasting trap, measured"
Lab 1's network in PyTorch (`nn.Linear(1, 64)`, ReLU, `nn.Linear(64, 1)`), fitted to
$t = \sin 3x$ on 256 points drawn after `torch.manual_seed(0)`, with targets of shape `(256,)`
against predictions of shape `(256, 1)` and Adam at $\eta = 10^{-2}$ for 2,000 steps. The
warning is raised on every step (Python prints it once). The predictions collapse to a constant,
with a standard deviation of 0.0006 across the 256 inputs, and the "loss" settles at 0.5174:
exactly the variance of the targets, as the formula above predicts.
:::

::: check
$\mathbf{X}$ has shape $(32, 64)$ and $\mathbf{W}^{(1)}$ has shape $(64, 128)$. What is the shape
of $\mathbf{Z}^{(1)}$, and what does the product cost?
:::

::: answer
$(32, 128)$, and $2\cdot 32\cdot 64\cdot 128 = 524{,}288$ FLOPs.
:::

::: check
A regression model outputs shape $(B, 1)$ and the targets have shape $(B,)$. What does NumPy
compute for `(pred - t) ** 2`, and what does a model trained on its mean learn?
:::

::: answer
A $(B, B)$ matrix of all pairwise differences, squared. Its mean is minimised by predicting the
mean target everywhere, so the model ignores its input and the loss stalls at the variance of the
targets.
:::

## Backpropagation: the four equations {#s3}

Gradient descent needs $\partial\mathcal{L}/\partial\mathbf{W}^{(l)}$ and
$\partial\mathcal{L}/\partial\mathbf{b}^{(l)}$ for every layer. **Backpropagation** is the chain
rule organised so that each layer's gradient is computed from the next layer's in one backward
sweep, at a cost comparable to the forward pass. This section derives it, so that every line of a
backward pass can be written, checked and costed by hand.

### Matrix calculus, as much as is needed

The gradient of a scalar with respect to a vector or matrix has the shape of that vector or
matrix. For $\mathbf{y} = f(\mathbf{x})$ with $\mathbf{y} \in \mathbb{R}^m$ and
$\mathbf{x} \in \mathbb{R}^n$, the **Jacobian** $\mathbf{J} \in \mathbb{R}^{m\times n}$ has
entries $J_{ij} = \partial y_i/\partial x_j$. The chain rule composes Jacobians,
$\mathbf{J}_{g\circ f} = \mathbf{J}_g\mathbf{J}_f$, and for a scalar loss it reads

$$
\frac{\partial\mathcal{L}}{\partial x_j} = \sum_i \frac{\partial\mathcal{L}}{\partial y_i}\,\frac{\partial y_i}{\partial x_j}
\quad\Longrightarrow\quad \nabla_{\mathbf{x}}\mathcal{L} = \mathbf{J}_f^\top\,\nabla_{\mathbf{y}}\mathcal{L}.
$$

Three facts follow, and this section uses nothing else.

1. For $\mathbf{z} = \mathbf{W}^\top\mathbf{h} + \mathbf{b}$, $z_j = \sum_i W_{ij}h_i + b_j$, so
   $\partial z_j/\partial h_i = W_{ij}$: the Jacobian is $\mathbf{W}^\top$, and
   $\nabla_{\mathbf{h}}\mathcal{L} = \mathbf{W}\,\nabla_{\mathbf{z}}\mathcal{L}$.
2. $W_{ij}$ appears only in $z_j$, with coefficient $h_i$, so
   $\partial\mathcal{L}/\partial W_{ij} = h_i\,\partial\mathcal{L}/\partial z_j$:
   $\nabla_{\mathbf{W}}\mathcal{L} = \mathbf{h}\,(\nabla_{\mathbf{z}}\mathcal{L})^\top$, an outer
   product.
3. For an elementwise $\mathbf{h} = \phi(\mathbf{z})$, $h_i$ depends only on $z_i$, so the
   Jacobian is $\operatorname{diag}(\phi'(\mathbf{z}))$ and
   $\nabla_{\mathbf{z}}\mathcal{L} = \nabla_{\mathbf{h}}\mathcal{L}\odot\phi'(\mathbf{z})$, where
   $\odot$ is the elementwise product.

When unsure where a transpose goes, check shapes: $\nabla_{\mathbf{W}}\mathcal{L}$ must be
$d_{\text{in}}\times d_{\text{out}}$, $\mathbf{h}$ has length $d_{\text{in}}$ and
$\nabla_{\mathbf{z}}\mathcal{L}$ length $d_{\text{out}}$, and only
$\mathbf{h}(\nabla_{\mathbf{z}}\mathcal{L})^\top$ has that shape.

### The error signal, and the equation at the output

Define the **error signal** of layer $l$ as the gradient with respect to its pre-activation, for
one example: $\boldsymbol{\delta}^{(l)} = \partial\mathcal{L}/\partial\mathbf{z}^{(l)} \in \mathbb{R}^{d_l}$.

**Equation 1, at the output.** For softmax cross-entropy,
$\mathcal{L} = -\sum_k y_k\ln\hat p_k$ with $\hat{\mathbf{p}} = \softmax(\mathbf{z})$ and a
one-hot $\mathbf{y}$. [Module 01, Section 6](module_01_EN.html#s6) derived the gradient case by
case; with the Jacobian it takes two lines. Differentiating
$\hat p_k = e^{z_k}/\sum_m e^{z_m}$ gives $\partial\hat p_k/\partial z_j = \hat p_k([k = j] - \hat p_j)$,
where $[k = j]$ is 1 if $k = j$ and 0 otherwise: the softmax Jacobian is
$\operatorname{diag}(\hat{\mathbf{p}}) - \hat{\mathbf{p}}\hat{\mathbf{p}}^\top$. Then

$$
\frac{\partial\mathcal{L}}{\partial z_j} = -\sum_k \frac{y_k}{\hat p_k}\,\hat p_k\big([k = j] - \hat p_j\big)
= -y_j + \hat p_j\sum_k y_k = \hat p_j - y_j,
$$

because $\sum_k y_k = 1$. So $\boldsymbol{\delta}^{(L)} = \hat{\mathbf{p}} - \mathbf{y}$, the same
$\hat p - y$ as logistic regression, and its entries sum to zero. For squared error
$(\hat y - y)^2$ on a linear output, $\delta^{(L)} = 2(\hat y - y)$. When the loss is averaged
over a batch, each example's $\boldsymbol{\delta}$ carries a factor $1/B$.

::: worked title="Softmax cross-entropy, by numbers"
Logits $\mathbf{z} = (2.0, 1.0, 0.1)$, true class 0. The exponentials are
$(7.389, 2.718, 1.105)$, summing to 11.213, so $\hat{\mathbf{p}} = (0.6590, 0.2424, 0.0986)$.
The loss is $-\ln 0.6590 = 0.4170$ and
$\boldsymbol{\delta} = \hat{\mathbf{p}} - \mathbf{y} = (-0.3410, 0.2424, 0.0986)$, which sums to
zero: raising the true class's logit lowers the loss, raising either of the others raises it.
:::

### Equation 2, between layers

Layer $l + 1$ computes $\mathbf{z}^{(l+1)} = \mathbf{W}^{(l+1)\top}\phi(\mathbf{z}^{(l)}) + \mathbf{b}^{(l+1)}$.
Fact 1 carries the error from $\mathbf{z}^{(l+1)}$ back to $\mathbf{h}^{(l)}$, and fact 3 carries
it through $\phi$:

$$
\boldsymbol{\delta}^{(l)} = \big(\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)}\big)\odot\phi'\big(\mathbf{z}^{(l)}\big),
\qquad \text{that is}\qquad
\delta^{(l)}_i = \phi'\big(z^{(l)}_i\big)\sum_j W^{(l+1)}_{ij}\,\delta^{(l+1)}_j.
$$

The error is pushed back through the same weights that carried the signal forward, and gated by
the activation's derivative: a unit with $\phi'(z_i) = 0$ passes nothing back.

### Equations 3 and 4, the parameter gradients

Fact 2 applied to layer $l$, together with $\partial\mathbf{z}^{(l)}/\partial\mathbf{b}^{(l)} = \mathbf{I}$, gives

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{W}^{(l)}} = \mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top} \in \mathbb{R}^{d_{l-1}\times d_l},
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{b}^{(l)}} = \boldsymbol{\delta}^{(l)}.
$$

The weight gradient is the outer product of what came into the layer and the error that went
out, and it has the shape of $\mathbf{W}^{(l)}$. Those four equations are the whole algorithm: a
forward pass that stores what the equations will need, then one sweep backwards (Figure 2.5).

```text
forward:   h(0) = x
           for l = 1 … L:   z(l) = W(l)ᵀ h(l−1) + b(l);   h(l) = φ(z(l))   (no φ at l = L)
           keep every h(l−1) and z(l)
backward:  δ(L) = ∂𝓛/∂z(L)                      p̂ − y, or 2(ŷ − y)            Equation 1
           for l = L … 1:
               ∂𝓛/∂W(l) = h(l−1) δ(l)ᵀ;   ∂𝓛/∂b(l) = δ(l)                  Equations 3, 4
               if l > 1:   δ(l−1) = (W(l) δ(l)) ⊙ φ′(z(l−1))                Equation 2
```

::: figure id=fig-02-5
Backpropagation through a three-layer MLP. Top row, left to right, the forward pass:
$\mathbf{h}^{(0)} = \mathbf{x} \to \mathbf{z}^{(1)} \to \mathbf{h}^{(1)} \to \mathbf{z}^{(2)} \to \mathbf{h}^{(2)} \to \mathbf{z}^{(3)} \to \mathcal{L}$,
each stored tensor drawn as a small shaded box under its node, labelled "kept for backward".
Bottom row, right to left, the backward pass:
$\boldsymbol{\delta}^{(3)} = \hat{\mathbf{p}} - \mathbf{y} \to \boldsymbol{\delta}^{(2)} \to \boldsymbol{\delta}^{(1)}$.
At each layer two branches: $\mathbf{W}^{(l)}\boldsymbol{\delta}^{(l)}$, gated by
$\phi'(\mathbf{z}^{(l-1)})$, gives $\boldsymbol{\delta}^{(l-1)}$; and
$\mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top}$ gives $\partial\mathcal{L}/\partial\mathbf{W}^{(l)}$,
with a dotted line up to the stored $\mathbf{h}^{(l-1)}$.
:::

::: worked title="The tiny network, backwards"
Continue Section 2's example (Figure 2.6 shows every number): $\mathbf{x} = (2, 1)$, $\mathbf{z}^{(1)} = (1.35, -1.5)$,
$\mathbf{h}^{(1)} = (1.35, 0)$, $\hat y = 1.28$, $t = 1$.

- Equation 1, squared error: $\delta^{(2)} = 2(\hat y - t) = 2(1.28 - 1) = 0.56$.
- Equations 3 and 4 at layer 2:
  $\partial\mathcal{L}/\partial\mathbf{W}^{(2)} = \mathbf{h}^{(1)}\delta^{(2)} = (1.35\cdot 0.56,\; 0\cdot 0.56) = (0.756, 0)$
  and $\partial\mathcal{L}/\partial b^{(2)} = 0.56$.
- Equation 2: $\mathbf{W}^{(2)}\delta^{(2)} = (0.8\cdot 0.56,\; -0.6\cdot 0.56) = (0.448, -0.336)$,
  gated by $\phi'(\mathbf{z}^{(1)}) = (1, 0)$, so $\boldsymbol{\delta}^{(1)} = (0.448, 0)$.
- Equations 3 and 4 at layer 1:
  $\partial\mathcal{L}/\partial\mathbf{W}^{(1)} = \mathbf{x}\boldsymbol{\delta}^{(1)\top} = \begin{bmatrix}2\cdot 0.448 & 2\cdot 0\\ 1\cdot 0.448 & 1\cdot 0\end{bmatrix} = \begin{bmatrix}0.896 & 0\\ 0.448 & 0\end{bmatrix}$
  and $\partial\mathcal{L}/\partial\mathbf{b}^{(1)} = (0.448, 0)$.

The inactive second unit ($z = -1.5$) passes no gradient, so its incoming weights learn nothing
from this example. Its outgoing weight gets nothing either, because its output is 0.

Check one entry by central differences with step $\epsilon_{\text{fd}} = 10^{-3}$. Setting
$W^{(1)}_{11} = 0.501$ gives $z^{(1)}_1 = 1.352$, $\hat y = 1.2816$ and
$\mathcal{L} = 0.07929856$; setting it to $0.499$ gives $1.348$, $1.2784$ and $0.07750656$. Then
$(0.07929856 - 0.07750656)/0.002 = 0.896000$, the backpropagated value. The agreement is exact
because, near this point, $\mathcal{L}$ is a quadratic function of $W^{(1)}_{11}$, and central
differences are exact for quadratics; [Section 14](#s14) shows how to choose
$\epsilon_{\text{fd}}$ in general.
:::

::: figure id=fig-02-6
The tiny network of Section 2 with its numbers. Forward values in black: $\mathbf{x} = (2, 1)$,
$\mathbf{z}^{(1)} = (1.35, -1.5)$, $\mathbf{h}^{(1)} = (1.35, 0)$, $\hat y = 1.28$,
$\mathcal{L} = 0.0784$. Gradients in red: $\delta^{(2)} = 0.56$,
$\partial\mathcal{L}/\partial\mathbf{W}^{(2)} = (0.756, 0)$, $\boldsymbol{\delta}^{(1)} = (0.448, 0)$,
and $\partial\mathcal{L}/\partial\mathbf{W}^{(1)}$ with entries 0.896, 0.448, 0 and 0. The
inactive second hidden unit is greyed out, with $\phi' = 0$ beside it.
:::

### The batch form, and the code

For a batch, stack the error signals as rows, $\boldsymbol{\Delta}^{(l)} \in \mathbb{R}^{B\times d_l}$
with row $i$ equal to $\boldsymbol{\delta}_i^{(l)\top}$. Transposing the equations row by row and
summing the parameter gradients over the batch:

$$
\boldsymbol{\Delta}^{(l)} = \big(\boldsymbol{\Delta}^{(l+1)}\mathbf{W}^{(l+1)\top}\big)\odot\phi'\big(\mathbf{Z}^{(l)}\big),
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{W}^{(l)}} = \mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)},
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{b}^{(l)}} = \boldsymbol{\Delta}^{(l)\top}\mathbf{1}.
$$

Since $(\mathbf{H}^\top\boldsymbol{\Delta})_{jk} = \sum_i H_{ij}\Delta_{ik}$, the product
$\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$ is the sum over the batch of the outer products
$\mathbf{h}_i\boldsymbol{\delta}_i^\top$; the bias gradient is the column sums of
$\boldsymbol{\Delta}^{(l)}$. [Lab 1](#lab1)'s backward function, for a two-layer regression
network with mean squared error, is these lines one for one. Run on the tiny network as a batch of
one, it prints the numbers above:

```python
import numpy as np

def forward(p, X):
    Z1 = X @ p["W1"] + p["b1"]; H1 = np.maximum(Z1, 0)        # (B, d1), ReLU
    Y = H1 @ p["W2"] + p["b2"]                                # (B, 1), no activation
    return Y, (X, Z1, H1)                                     # keep what backward needs

def backward(p, cache, Y, T):
    X, Z1, H1 = cache; B = X.shape[0]
    dY = 2 * (Y - T) / B                  # Delta(2): Equation 1, mean over the batch
    g = {"W2": H1.T @ dY, "b2": dY.sum(0)}    # Equations 3 and 4: H1^T Delta, column sums
    dH1 = dY @ p["W2"].T                  # Equation 2: the error passed down ...
    dZ1 = dH1 * (Z1 > 0)                  # ... gated by ReLU'(Z1)
    g["W1"] = X.T @ dZ1; g["b1"] = dZ1.sum(0)
    return g

p = {"W1": np.array([[0.5, -1.0], [0.25, 0.5]]), "b1": np.array([0.1, 0.0]),
     "W2": np.array([[0.8], [-0.6]]), "b2": np.array([0.2])}
X, T = np.array([[2.0, 1.0]]), np.array([[1.0]])             # one example: B = 1
Y, cache = forward(p, X)
g = backward(p, cache, Y, T)
for k in ("W1", "b1", "W2", "b2"):
    print(k, np.round(g[k], 4).tolist())
```

```output
W1 [[0.896, 0.0], [0.448, 0.0]]
b1 [0.448, 0.0]
W2 [[0.756], [0.0]]
b2 [0.56]
```

### What the backward pass costs

Layer $l$'s forward pass is one product, $\mathbf{H}^{(l-1)}\mathbf{W}^{(l)}$, of
$2Bd_{l-1}d_l$ FLOPs. Its backward pass does two products of exactly that size:
$\boldsymbol{\Delta}^{(l)}\mathbf{W}^{(l)\top}$ to pass the error down, and
$\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$ for the weight gradient. The gating and the
bias sums cost $O(Bd_l)$. So the backward pass costs at most twice the forward, and a training
step at most about three forward passes. It costs less than twice when the first layer is a large
share of the work, because the gradient with respect to the input $\mathbf{X}$ is never needed
and the first layer skips its error product. [Module 06, Section 11](module_06_EN.html#s11) turns
this argument into the training-FLOP count for transformers.

::: worked title="The backward pass of the digits network"
For $64 \to 128 \to 128 \to 10$ with $B = 64$, the forward pass costs 3,309,568 FLOPs (Section
2). The weight gradients cost the same again, 3,309,568. The errors passed down by layers 3 and 2
cost $2\cdot 64\cdot(128\cdot 10 + 128\cdot 128) = 163{,}840 + 2{,}097{,}152 = 2{,}260{,}992$;
layer 1 passes nothing down. The backward pass costs $3{,}309{,}568 + 2{,}260{,}992 = 5{,}570{,}560$
FLOPs, 1.68 times the forward pass, and a full training step 2.68 forward passes.
:::

### Two consequences

Two facts follow from the four equations and explain much of training practice.

**Gradients vanish or explode with depth.** Unrolling Equation 2 from the output,

$$
\boldsymbol{\delta}^{(l)} = \mathbf{D}^{(l)}\mathbf{W}^{(l+1)}\,\mathbf{D}^{(l+1)}\mathbf{W}^{(l+2)}\cdots\mathbf{D}^{(L-1)}\mathbf{W}^{(L)}\,\boldsymbol{\delta}^{(L)},
\qquad \mathbf{D}^{(k)} = \operatorname{diag}\big(\phi'(\mathbf{z}^{(k)})\big),
$$

a product of $L - l$ matrices $\mathbf{D}^{(k-1)}\mathbf{W}^{(k)}$, each the transposed Jacobian
of one layer. If their norms are below 1 the error shrinks geometrically on its way to the early
layers, and the gradient **vanishes**; if above 1 it grows, and the gradient **explodes**.
Deep sigmoid networks were notoriously hard to train in the 1990s largely for this reason, since
$\sigma' \le 1/4$.
ReLU, careful initialisation, normalisation and residual connections are the fixes, roughly in
that historical order ([Sections 5](#s5), [6](#s6) and [10](#s10)).

::: worked title="Ten sigmoid layers"
The sigmoid's derivative is at most $\sigma'(0) = 0.25$, so ten sigmoid layers multiply the error
by at most $0.25^{10} = 9.5\times 10^{-7}$ from the activations alone. At a typical
pre-activation of 2, $\sigma'(2) = 0.881\times 0.119 = 0.105$ and the factor is
$0.105^{10} = 1.6\times 10^{-10}$. Unless the weights compensate, the first layers receive a
millionth of the error signal or less.
:::

**Training memory grows with depth times batch.** Equation 3 needs each layer's input
$\mathbf{h}^{(l-1)}$, so the forward pass must keep every layer's input until the backward sweep
reaches it: memory proportional to depth times batch, as Section 2 counted. Gradient
checkpointing, which recomputes instead of storing, exists for this reason ([Section 4](#s4)).

::: keyidea
Backpropagation is four equations: $\boldsymbol{\delta}^{(L)}$ from the loss; each
$\boldsymbol{\delta}^{(l)}$ from the next through $\mathbf{W}$ and $\phi'$; each weight gradient
the outer product of the layer's stored input and its $\boldsymbol{\delta}$. It costs at most two
forward passes and the memory of every layer's input.
:::

::: check
$\mathbf{W}^{(l)}$ has shape $(64, 32)$. What are the shapes of $\boldsymbol{\delta}^{(l)}$ for
one example and of $\partial\mathcal{L}/\partial\mathbf{W}^{(l)}$?
:::

::: answer
$\boldsymbol{\delta}^{(l)} \in \mathbb{R}^{32}$, one entry per unit of the layer, and
$\partial\mathcal{L}/\partial\mathbf{W}^{(l)} = \mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top} \in \mathbb{R}^{64\times 32}$,
the shape of $\mathbf{W}^{(l)}$.
:::

::: check
Why does a training step cost about three forward passes?
:::

::: answer
Each layer's backward pass does two products the size of its forward product: one to pass the
error down, one for the weight gradient. Forward plus backward is therefore at most three forward
passes, a little less because the first layer passes no error down.
:::

::: check
A ReLU unit has $z < 0$ for one example. What gradient do its incoming weights receive from that
example?
:::

::: answer
Zero. Its $\phi'(z) = 0$ gates its $\delta$ to zero, and the gradient of each incoming weight is
the input times that $\delta$.
:::

## Automatic differentiation: graphs, reverse mode and forward mode {#s4}

Section 3 derived the backward pass of an MLP by hand. A new layer type, such as a convolution or
an attention block, would need a new derivation, and every hand derivation is a chance for a bug.
Frameworks avoid both by differentiating programs mechanically. **Automatic differentiation**
(autodiff) applies the chain rule to the primitive operations a program actually executes, and
backpropagation is one instance of its reverse mode. This section works both modes on a small
example, shows why reverse mode is the right one for a scalar loss, and describes what PyTorch
does when you call `loss.backward()`.

### Computational graphs

A **computational graph** has a node for each primitive operation (add, multiply, matrix product,
exp, log, sin, tanh, ReLU) and edges that carry the intermediate values $v_i$, numbered in an
evaluation order in which every node comes after its inputs (a topological order). Each primitive
knows its local partial derivatives: $\partial(uv)/\partial u = v$, $\partial\ln u/\partial u = 1/u$.
The running example, from Baydin et al. (2018), is

$$
f(x_1, x_2) = \ln x_1 + x_1x_2 - \sin x_2 \quad\text{at}\quad (x_1, x_2) = (2, 5),
$$

with $v_1 = \ln x_1$, $v_2 = x_1x_2$, $v_3 = \sin x_2$, $v_4 = v_1 + v_2$ and $f = v_4 - v_3$
(Figure 2.7). Each input feeds two nodes.

::: figure id=fig-02-7
The computational graph of $f(x_1, x_2) = \ln x_1 + x_1x_2 - \sin x_2$: input nodes $x_1 = 2$ and
$x_2 = 5$; operation nodes $\ln$, $\times$, $\sin$, $+$ and $-$ with their forward values in black
(0.693, 10, $-0.959$, 10.693, 11.652). Adjoints in red beside each node: 1 at the output and at
$+$, $-1$ at $\sin$, 1 at $\ln$ and at $\times$; then $5.5 = 0.5 + 5$ at $x_1$, where two red
arrows converge, labelled "+=", and $1.716 = 2 - 0.284$ at $x_2$.
:::

### Forward mode

Forward mode carries a **tangent** $\dot v_i$, the derivative of $v_i$ along a chosen direction
in input space, alongside each value:

$$
\dot v_i = \sum_{j\,\in\,\text{parents}(i)} \frac{\partial v_i}{\partial v_j}\,\dot v_j.
$$

Seeding the inputs with a direction, $\dot{\mathbf{x}} = \mathbf{u}$, gives in one pass the
directional derivative $\mathbf{J}\mathbf{u}$, a **Jacobian-vector product** (JVP). **Dual
numbers** implement it: numbers $a + b\epsilon$ with $\epsilon^2 = 0$. By Taylor's theorem
$f(a + b\epsilon) = f(a) + f'(a)\,b\epsilon$, every higher power of $\epsilon$ being zero, so
arithmetic on dual numbers carries the derivative along exactly. The product rule falls out of
$(a + b\epsilon)(c + d\epsilon) = ac + (ad + bc)\epsilon$.

```python
import math

class Dual:
    """a + b·ε with ε² = 0: the value a carries its derivative b along."""
    def __init__(self, a, b=0.0):
        self.a, self.b = a, b
    def __add__(self, o):
        return Dual(self.a + o.a, self.b + o.b)
    def __sub__(self, o):
        return Dual(self.a - o.a, self.b - o.b)
    def __mul__(self, o):                      # (a + bε)(c + dε) = ac + (ad + bc)ε
        return Dual(self.a * o.a, self.a * o.b + self.b * o.a)

def log(u): return Dual(math.log(u.a), u.b / u.a)
def sin(u): return Dual(math.sin(u.a), math.cos(u.a) * u.b)

def f(x1, x2):
    return log(x1) + x1 * x2 - sin(x2)

y = f(Dual(2.0, 1.0), Dual(5.0, 0.0))          # seed the tangent (1, 0)
print(f"f = {y.a:.4f}, df/dx1 = {y.b:.4f}")
y = f(Dual(2.0, 0.0), Dual(5.0, 1.0))          # seed the tangent (0, 1)
print(f"f = {y.a:.4f}, df/dx2 = {y.b:.4f}")
```

```output
f = 11.6521, df/dx1 = 5.5000
f = 11.6521, df/dx2 = 1.7163
```

### Reverse mode

Reverse mode first runs the program forward, keeping the values, then carries **adjoints**
$\bar v_i = \partial f/\partial v_i$ backwards from $\bar f = 1$:

$$
\bar v_j \mathrel{+}= \bar v_i\,\frac{\partial v_i}{\partial v_j} \qquad \text{for every child } i \text{ of } j.
$$

The "+=" is the multivariable chain rule: a variable used in several places influences the output
along several paths, and its adjoint is the sum of the contributions of all of them. Seeding the
output with $\mathbf{u}$ gives, in one pass, the **vector-Jacobian product** (VJP)
$\mathbf{u}^\top\mathbf{J}$. For a scalar loss, $u = 1$ and that single row is the whole gradient.

::: worked title="Both modes by hand"
Forward values: $v_1 = \ln 2 = 0.6931$, $v_2 = 2\cdot 5 = 10$, $v_3 = \sin 5 = -0.9589$,
$v_4 = v_1 + v_2 = 10.6931$, $f = v_4 - v_3 = 11.6521$.

Forward mode, tangent $(\dot x_1, \dot x_2) = (1, 0)$: $\dot v_1 = \dot x_1/x_1 = 0.5$;
$\dot v_2 = \dot x_1x_2 + x_1\dot x_2 = 5 + 0 = 5$; $\dot v_3 = \cos x_2\cdot\dot x_2 = 0$;
$\dot v_4 = 0.5 + 5 = 5.5$; $\dot f = \dot v_4 - \dot v_3 = 5.5 = \partial f/\partial x_1$. A
second pass with tangent $(0, 1)$ gives $\dot v_2 = 2$, $\dot v_3 = \cos 5 = 0.2837$ and
$\partial f/\partial x_2 = 2 - 0.2837 = 1.7163$. Two inputs, two passes.

Reverse mode, one pass from $\bar f = 1$. The node $f = v_4 - v_3$ gives $\bar v_4 = 1$ and
$\bar v_3 = -1$; the node $v_4 = v_1 + v_2$ gives $\bar v_1 = 1$ and $\bar v_2 = 1$. Each input
then collects from both of its children:

$$
\bar x_1 = \bar v_1\,\frac{1}{x_1} + \bar v_2\,x_2 = 0.5 + 5 = 5.5, \qquad
\bar x_2 = \bar v_2\,x_1 + \bar v_3\cos x_2 = 2 - 0.2837 = 1.7163.
$$

Both partial derivatives come from one pass. $x_1$ is used twice, by $\ln$ and by the product, and
its adjoint is the sum of the two paths.
:::

### Which mode, and what it costs

For $f: \mathbb{R}^n \to \mathbb{R}^m$ the full Jacobian takes $n$ forward-mode passes, a column
each, or $m$ reverse-mode passes, a row each (Figure 2.8), and every pass costs a small constant multiple of
evaluating $f$; for reverse mode this is the **cheap gradient principle** (Griewank and Walther
2008). Training has $m = 1$ and $n$ from about $10^4$ to $10^{11}$, so reverse mode wins by a
factor of order $n$. Forward mode wins when $n \ll m$. The sensitivity of a simulated trajectory
of 1,000 samples to 3 design parameters takes 3 forward passes against 1,000 reverse ones.
Hessian-vector products are computed as forward mode applied to a reverse-mode gradient. And
physics-informed networks ([Module 05, Section 9](module_05_EN.html#s9)) differentiate a network
with respect to its few inputs, a natural use of forward mode.

::: figure id=fig-02-8
A Jacobian $\mathbf{J} \in \mathbb{R}^{m\times n}$ drawn as a grid, twice. Left: filled one column
per pass, labelled "forward mode: $n$ passes, each $\mathbf{J}\mathbf{u}$ (JVP)". Right: filled
one row per pass, labelled "reverse mode: $m$ passes, each $\mathbf{u}^\top\mathbf{J}$ (VJP)".
Below, the case $m = 1$, a scalar loss, as a single row: the whole gradient in one reverse pass.
:::

::: worked title="Counting passes"
The digits network has 26,122 parameters. Its gradient by forward mode would take 26,122 forward
passes; reverse mode delivers it from one forward pass and one backward pass that costs about 1.7
forward passes more (Section 3). A model with $7\times 10^9$ parameters would need
$7\times 10^9$ forward-mode passes per step.
:::

### The tape, and gradient checkpointing

Reverse mode's price is memory. The backward sweep needs the forward values, so they are recorded
(the **tape**) and held until the sweep has used them. **Gradient checkpointing** stores only some
of them and recomputes the rest: keep the input of every $k$-th layer, and when the backward sweep
reaches a segment, rerun that segment's $k$ layers forward from its checkpoint to rebuild their
activations. The peak is about $L/k$ checkpoints plus one segment of $k$ layers, smallest near
$k = \sqrt L$: activation memory falls from $O(L)$ to $O(\sqrt L)$ for about one extra forward
pass (Chen et al. 2016).

::: worked title="Checkpointing the deep MLP"
Section 2's MLP of 50 layers of width 1,024 at batch 256 stores 2 MiB of $\mathbf{Z}$ and
$\mathbf{H}$ per layer, 100 MiB (105 MB) in all. Checkpointing every 7th layer ($\sqrt{50} \approx 7$)
keeps about 7 checkpoints, each a segment's input $\mathbf{H}$ of 1 MiB, plus the 7 recomputed
layers of the segment the backward sweep is working on, $7\times 2 = 14$ MiB: about 21 MiB
(22 MB) at the peak instead of 100 MiB, for one extra forward pass.
:::

### Layers as VJP rules

A framework never forms a Jacobian. Each layer supplies a rule that maps the adjoint of its output
to the adjoints of its inputs:

- linear, $\mathbf{z} = \mathbf{W}^\top\mathbf{h} + \mathbf{b}$: given $\bar{\mathbf{z}}$,
  $\bar{\mathbf{h}} = \mathbf{W}\bar{\mathbf{z}}$, $\bar{\mathbf{W}} = \mathbf{h}\bar{\mathbf{z}}^\top$
  and $\bar{\mathbf{b}} = \bar{\mathbf{z}}$;
- activation, $\mathbf{h} = \phi(\mathbf{z})$: $\bar{\mathbf{z}} = \bar{\mathbf{h}}\odot\phi'(\mathbf{z})$;
- softmax cross-entropy on logits: $\bar{\mathbf{z}} = \hat{\mathbf{p}} - \mathbf{y}$.

These are Section 3's equations with $\bar{\mathbf{z}}^{(l)} = \boldsymbol{\delta}^{(l)}$:
backpropagation is reverse mode with each layer treated as one primitive. Forming Jacobians
instead would be hopeless. For a 4,096 → 4,096 layer applied to a batch of 512, the Jacobian of
all outputs with respect to all inputs has $(512\cdot 4{,}096)^2 \approx 4.4\times 10^{12}$
entries, almost all of them zero, while the VJP is one matrix product.

### What PyTorch does when you call loss.backward()

Every operation on a tensor with `requires_grad=True` records a node, visible as the result's
`.grad_fn`, holding what its VJP rule will need. `loss.backward()` walks these nodes in reverse
topological order and accumulates into each leaf tensor's `.grad` with "+=". The graph is built
anew on every forward pass, as the code runs (**define-by-run**), and freed once `backward()` has
used it. `torch.no_grad()` turns the recording off, for evaluation and for the optimiser's own
updates; `.detach()` returns a tensor cut out of the graph, which silently stops the gradient if
done by mistake. On the tiny network of Section 2:

```python
import torch

x = torch.tensor([2.0, 1.0])
W1 = torch.tensor([[0.5, -1.0], [0.25, 0.5]], requires_grad=True)   # leaves
b1 = torch.tensor([0.1, 0.0], requires_grad=True)
W2 = torch.tensor([[0.8], [-0.6]], requires_grad=True)
b2 = torch.tensor([0.2], requires_grad=True)

def loss_fn():                                # the network of s2, target t = 1
    h1 = torch.relu(W1.T @ x + b1)            # every operation records a node
    return ((W2.T @ h1 + b2 - 1.0) ** 2).sum()

loss = loss_fn()
node, chain = loss.grad_fn, []
while node is not None:                       # follow the first input of each node
    chain.append(node.name().split("::")[-1])
    node = node.next_functions[0][0] if node.next_functions else None
print(" <- ".join(chain))

loss.backward()                               # reverse sweep; the graph is then freed
print(W1.grad, b2.grad)
loss_fn().backward()                          # the next step's backward, not zeroed
print(W1.grad[:, 0], b2.grad)                 # added to the old values: doubled

for p in (W1, b1, W2, b2):
    p.grad = None                             # what optimizer.zero_grad() does
with torch.no_grad():
    print(loss_fn().requires_grad)            # nothing was recorded
print(W1.detach().requires_grad)              # a tensor cut out of the graph
```

```output
SumBackward0 <- PowBackward0 <- SubBackward0 <- AddBackward0 <- MvBackward0 <- PermuteBackward0 <- AccumulateGrad
tensor([[0.8960, 0.0000],
        [0.4480, 0.0000]]) tensor([0.5600])
tensor([1.7920, 0.8960]) tensor([1.1200])
False
False
```

Following the first input of each node leads back from the loss through the sum, the square, the
subtraction of $t$, the bias, the product $\mathbf{W}^{(2)\top}\mathbf{h}^{(1)}$ and the
transpose, to `AccumulateGrad`, the node that adds into `W2.grad`. The gradients are Section 3's
numbers. The second backward call adds a second copy: because `.grad` accumulates, every optimiser
step must be preceded by `optimizer.zero_grad()`. The same "+=" that makes the chain rule work
makes a forgotten `zero_grad` add all past gradients into every step ([Lab 5](#lab5), script B).

[Lab 2](#lab2) builds a scalar reverse-mode engine of about 100 lines that does exactly this, one
number per node. It also shows why frameworks work on tensors: one training step of a
337-parameter network on 100 examples creates 66,440 scalar nodes, where PyTorch records about
ten tensor operations.

::: keyidea
Backpropagation is reverse-mode automatic differentiation: one backward sweep of vector-Jacobian
products gives the whole gradient of a scalar loss for a small multiple of the forward pass's
cost, and the price is the memory of the tape.
:::

::: check
In reverse mode, why is the adjoint of a variable used in two places a sum?
:::

::: answer
The output depends on the variable through two paths, and the multivariable chain rule adds the
contributions of the paths.
:::

::: check
$f: \mathbb{R}^3 \to \mathbb{R}^{1000}$ maps three design parameters to a simulated trajectory.
Which mode gives the full Jacobian more cheaply?
:::

::: answer
Forward mode: 3 passes, one per input, instead of 1,000 reverse passes, one per output.
:::

::: check
What does `optimizer.zero_grad()` protect against?
:::

::: answer
PyTorch adds each backward pass's gradients into `.grad`. Without zeroing, every step would use
the sum of all previous gradients.
:::
