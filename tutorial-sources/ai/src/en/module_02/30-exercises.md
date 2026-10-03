## Exercises {#exercises}

Fifteen exercises, 130 minutes in all, graded by the work they ask for. A one-star exercise
(★) is a conceptual question that needs no arithmetic beyond quoting the text and takes about
five minutes. A two-star exercise (★★) is a derivation or a calculation, ten to fifteen minutes.
The three-star exercise (★★★) is a coding task of about 25 minutes. There are eight of the
first kind, six of the second and one of the third; the coding practice of this module is
concentrated in the five labs, so the exercises lean towards the reasoning that the labs do not
exercise.

Work each exercise on paper before you open its solution; the solutions are collapsed. A
solution gives every step of a derivation, says why the step is taken, and where it quotes a
number the number was computed, with code shown. Where a solution prints output, the last digits
may differ on your machine. Exercises 5 and 15 extend the network of [Lab 1](#lab1): do that
lab first.

| Exercise | Grade | Kind | Minutes | Practises |
|---|---|---|---|---|
| [1](#e1) | ★ | conceptual | 5 | why the nonlinearity is needed ([Section 1](#s1)) |
| [2](#e2) | ★★ | derivation | 15 | backpropagation for a three-layer network, and its cost ([Section 3](#s3)) |
| [3](#e3) | ★ | conceptual | 5 | what depth buys ([Section 1](#s1)) |
| [4](#e4) | ★★ | calculation | 10 | forward and reverse mode by hand ([Section 4](#s4)) |
| [5](#e5) | ★★ | derivation | 10 | dead ReLU units ([Section 5](#s5), [Lab 1](#lab1)) |
| [6](#e6) | ★ | conceptual | 5 | initialisation through depth ([Section 6](#s6)) |
| [7](#e7) | ★★ | calculation | 10 | step-size limits and momentum on a quadratic ([Section 7](#s7)) |
| [8](#e8) | ★★ | calculation | 10 | Adam by hand ([Section 8](#s8)) |
| [9](#e9) | ★ | conceptual | 5 | AdamW against L2 regularisation ([Section 8](#s8)) |
| [10](#e10) | ★ | conceptual | 5 | inverted dropout ([Section 11](#s11)) |
| [11](#e11) | ★★ | calculation | 10 | log-sum-exp and overflow ([Section 12](#s12)) |
| [12](#e12) | ★ | conceptual | 5 | softmax applied twice ([Section 12](#s12)) |
| [13](#e13) | ★ | conceptual | 5 | reading gradient checks ([Section 14](#s14)) |
| [14](#e14) | ★ | conceptual | 5 | diagnosing training logs ([Section 14](#s14)) |
| [15](#e15) | ★★★ | coding | 25 | Adam against SGD, and input scale ([Section 7](#s7), [Section 8](#s8), [Lab 1](#lab1)) |

::: exercise id=e1 level=1 kind=conceptual minutes=5
A colleague trains a network on two-dimensional inputs with three hidden layers of 64 units and
forgot the activation functions, so that
$\mathbf{z}^{(l)} = \mathbf{W}^{(l)\top}\mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}$ and
$\mathbf{h}^{(l)} = \mathbf{z}^{(l)}$ for $l = 1, 2, 3$, with $\mathbf{h}^{(0)} = \mathbf{x}$ and
the output $\mathbf{z}^{(4)}$.

(a) Show that the network computes an affine function of its input, and write its effective
weight matrix and bias in terms of $\mathbf{W}^{(1)}, \dots, \mathbf{W}^{(4)}$ and
$\mathbf{b}^{(1)}, \dots, \mathbf{b}^{(4)}$.

(b) The colleague then adds a ReLU after the third hidden layer only. Which functions can the
network represent now? Compare it with a network that has a single hidden layer of 64 ReLU
units, and say what the two extra $64 \times 64$ layers contribute.
:::

::: solution
**(a)** Substitute layer by layer. Each layer is an affine map, and the point of the
substitution is that an affine map of an affine map is again affine:

$$
\mathbf{z}^{(4)} = \mathbf{W}^{(4)\top}\Big(\mathbf{W}^{(3)\top}\big(\mathbf{W}^{(2)\top}(\mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)}) + \mathbf{b}^{(2)}\big) + \mathbf{b}^{(3)}\Big) + \mathbf{b}^{(4)}.
$$

Multiply out. The terms that contain $\mathbf{x}$ are
$\mathbf{W}^{(4)\top}\mathbf{W}^{(3)\top}\mathbf{W}^{(2)\top}\mathbf{W}^{(1)\top}\mathbf{x}$, and
because $(\mathbf{A}\mathbf{B})^\top = \mathbf{B}^\top\mathbf{A}^\top$ the product of transposes
is the transpose of the product in the opposite order. The remaining terms do not contain
$\mathbf{x}$. So $\mathbf{z}^{(4)} = \mathbf{W}_{\text{eff}}^\top\mathbf{x} + \mathbf{b}_{\text{eff}}$ with

$$
\mathbf{W}_{\text{eff}} = \mathbf{W}^{(1)}\mathbf{W}^{(2)}\mathbf{W}^{(3)}\mathbf{W}^{(4)},
\qquad
\mathbf{b}_{\text{eff}} = \mathbf{W}^{(4)\top}\mathbf{W}^{(3)\top}\mathbf{W}^{(2)\top}\mathbf{b}^{(1)}
+ \mathbf{W}^{(4)\top}\mathbf{W}^{(3)\top}\mathbf{b}^{(2)}
+ \mathbf{W}^{(4)\top}\mathbf{b}^{(3)} + \mathbf{b}^{(4)}.
$$

The shape check is $(2 \times 64)(64 \times 64)(64 \times 64)(64 \times K) = 2 \times K$ for $K$
outputs, as it must be. The four layers have the expressive power of one: the extra depth
bought nothing, which is the reason [Section 1](#s1) gives for putting a nonlinearity between
layers.

**(b)** The first three layers still collapse, because nothing nonlinear lies between them. Their
output is $\mathbf{z}^{(3)} = \mathbf{A}^\top\mathbf{x} + \mathbf{c}$ with
$\mathbf{A} = \mathbf{W}^{(1)}\mathbf{W}^{(2)}\mathbf{W}^{(3)} \in \mathbb{R}^{2 \times 64}$ and
$\mathbf{c} = \mathbf{W}^{(3)\top}\mathbf{W}^{(2)\top}\mathbf{b}^{(1)} + \mathbf{W}^{(3)\top}\mathbf{b}^{(2)} + \mathbf{b}^{(3)}$.
The ReLU and the output layer then give

$$
f(\mathbf{x}) = \mathbf{W}^{(4)\top}\operatorname{ReLU}(\mathbf{A}^\top\mathbf{x} + \mathbf{c}) + \mathbf{b}^{(4)}
= \sum_{j=1}^{64}\mathbf{v}_j\operatorname{ReLU}(\mathbf{a}_j^\top\mathbf{x} + c_j) + \mathbf{b}^{(4)},
$$

where $\mathbf{a}_j$ is column $j$ of $\mathbf{A}$ and $\mathbf{v}_j$ is row $j$ of $\mathbf{W}^{(4)}$.
That is exactly a one-hidden-layer ReLU network with 64 units and first-layer weights
$\mathbf{A}$. The converse holds as well: any such network is obtained by choosing
$\mathbf{W}^{(1)} = \mathbf{A}$, $\mathbf{W}^{(2)} = \mathbf{W}^{(3)} = \mathbf{I}$,
$\mathbf{b}^{(1)} = \mathbf{b}^{(2)} = \mathbf{0}$ and $\mathbf{b}^{(3)} = \mathbf{c}$. The two
families of functions are identical: sums of 64 ridge functions (each constant along a line in the
plane), continuous and piecewise linear, whose decision boundaries are polygonal curves. On the
circles data such a network can enclose the disc, as the playground of [Section 1](#s1) shows,
and the colleague's deeper network can do no more.

What the two extra layers contribute is parameters, not functions. The first three layers hold
$192 + 4{,}160 + 4{,}160 = 8{,}512$ parameters, yet the function depends on them only through
$\mathbf{A}$ and $\mathbf{c}$, which have $2 \cdot 64 + 64 = 192$ entries. The map from the
parameters to the function is many-to-one, and what changes is the path gradient descent takes
through parameter space (a product of three matrices has gradients that are products of the
others), not what it can reach.
:::

::: exercise id=e2 level=2 kind=derivation minutes=15
A network has three weight layers:
$\mathbf{z}^{(1)} = \mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)}$, $\mathbf{h}^{(1)} = \tanh\mathbf{z}^{(1)}$;
$\mathbf{z}^{(2)} = \mathbf{W}^{(2)\top}\mathbf{h}^{(1)} + \mathbf{b}^{(2)}$, $\mathbf{h}^{(2)} = \tanh\mathbf{z}^{(2)}$;
$\mathbf{z}^{(3)} = \mathbf{W}^{(3)\top}\mathbf{h}^{(2)} + \mathbf{b}^{(3)}$, with softmax
cross-entropy on $\mathbf{z}^{(3)}$ and widths $d_0, d_1, d_2, d_3$.

(a) Write $\boldsymbol{\delta}^{(3)}, \boldsymbol{\delta}^{(2)}, \boldsymbol{\delta}^{(1)}$ and all six
parameter gradients for one example.

(b) Give the batch-matrix forms for a loss averaged over $B$ examples.

(c) Count the FLOPs of the matrix products in the forward and in the backward pass, and show that
the backward pass costs at most twice the forward pass.

(d) Evaluate the ratio for the widths $(784, 256, 256, 10)$.
:::

::: solution
**(a)** Take $\boldsymbol{\delta}^{(l)} = \partial\mathcal{L}/\partial\mathbf{z}^{(l)}$ as the error
signal and start at the top. For softmax cross-entropy the gradient with respect to the logits is
$\hat{\mathbf{p}} - \mathbf{y}$ ([Module 01, Section 6](module_01_EN.html#s6) derives it for softmax regression
and [Section 3](#s3) recovers it through the softmax Jacobian), so

$$
\boldsymbol{\delta}^{(3)} = \hat{\mathbf{p}} - \mathbf{y}.
$$

To go down one layer, push $\boldsymbol{\delta}^{(3)}$ through the linear map. Since
$z^{(3)}_k = \sum_i W^{(3)}_{ik}h^{(2)}_i + b^{(3)}_k$, we have $\partial z^{(3)}_k/\partial h^{(2)}_i = W^{(3)}_{ik}$ and
$\partial\mathcal{L}/\partial h^{(2)}_i = \sum_k W^{(3)}_{ik}\delta^{(3)}_k = (\mathbf{W}^{(3)}\boldsymbol{\delta}^{(3)})_i$.
Then through the activation, which acts on each coordinate separately, with
$\tanh' z = 1 - \tanh^2 z$ (this is the point of writing the derivative in terms of the output
$h$, which is stored already):

$$
\boldsymbol{\delta}^{(2)} = (\mathbf{W}^{(3)}\boldsymbol{\delta}^{(3)})\odot\big(1 - (\mathbf{h}^{(2)})^2\big),
\qquad
\boldsymbol{\delta}^{(1)} = (\mathbf{W}^{(2)}\boldsymbol{\delta}^{(2)})\odot\big(1 - (\mathbf{h}^{(1)})^2\big).
$$

The parameters follow because $z^{(l)}_k$ depends on $W^{(l)}_{ik}$ only through the term
$h^{(l-1)}_iW^{(l)}_{ik}$ and on $b^{(l)}_k$ with coefficient 1, so
$\partial\mathcal{L}/\partial W^{(l)}_{ik} = h^{(l-1)}_i\delta^{(l)}_k$ and
$\partial\mathcal{L}/\partial b^{(l)}_k = \delta^{(l)}_k$. In matrix form, with
$\mathbf{h}^{(0)} = \mathbf{x}$ and $l = 1, 2, 3$,

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{W}^{(l)}} = \mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top},
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{b}^{(l)}} = \boldsymbol{\delta}^{(l)}.
$$

The shapes agree: $\mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top}$ is $d_{l-1} \times d_l$, the
shape of $\mathbf{W}^{(l)}$.

**(b)** Stack the $B$ examples as rows: $\mathbf{H}^{(l)} \in \mathbb{R}^{B \times d_l}$ and
$\mathbf{H}^{(0)} = \mathbf{X}$. The loss is $\frac1B\sum_n\mathcal{L}_n$, so the factor $1/B$ is
absorbed once, at the top, into $\boldsymbol{\Delta}^{(3)}$, and every later quantity inherits
it. Row $n$ of $\boldsymbol{\Delta}^{(l)}$ is $\boldsymbol{\delta}^{(l)\top}_n/B$:

$$
\begin{aligned}
\boldsymbol{\Delta}^{(3)} &= (\hat{\mathbf{P}} - \mathbf{Y})/B,\\
\boldsymbol{\Delta}^{(2)} &= \big(\boldsymbol{\Delta}^{(3)}\mathbf{W}^{(3)\top}\big)\odot\big(1 - \mathbf{H}^{(2)}\odot\mathbf{H}^{(2)}\big),\\
\boldsymbol{\Delta}^{(1)} &= \big(\boldsymbol{\Delta}^{(2)}\mathbf{W}^{(2)\top}\big)\odot\big(1 - \mathbf{H}^{(1)}\odot\mathbf{H}^{(1)}\big),\\
\frac{\partial\mathcal{L}}{\partial\mathbf{W}^{(l)}} &= \mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)},
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{b}^{(l)}} = \mathbf{1}^\top\boldsymbol{\Delta}^{(l)}.
\end{aligned}
$$

The transposes move to the right of $\boldsymbol{\Delta}$ because the examples are rows. The
product $\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$ sums the per-example outer products
$\mathbf{h}_n\boldsymbol{\delta}_n^\top/B$ over the batch, which is the mean of the per-example
gradients, and $\mathbf{1}^\top\boldsymbol{\Delta}^{(l)}$ sums the rows for the bias. The check
below compares these equations with autograd on a small network (widths 4, 6, 5, 3 and five
examples) in float64.

```python
import torch
import torch.nn.functional as F

torch.manual_seed(0)
B, d = 5, (4, 6, 5, 3)                            # small widths so that the shapes show
W = [torch.randn(d[i], d[i + 1], dtype=torch.double, requires_grad=True)
     for i in range(3)]
b = [torch.randn(d[i + 1], dtype=torch.double, requires_grad=True) for i in range(3)]
X = torch.randn(B, d[0], dtype=torch.double)
y = torch.tensor([0, 2, 1, 1, 0])

H1 = torch.tanh(X @ W[0] + b[0])
H2 = torch.tanh(H1 @ W[1] + b[1])
Z3 = H2 @ W[2] + b[2]
F.cross_entropy(Z3, y).backward()                 # autograd: the referee

with torch.no_grad():                             # the batch equations of part (b)
    P, Y = torch.softmax(Z3, 1), F.one_hot(y, 3).double()
    D3 = (P - Y) / B
    D2 = (D3 @ W[2].T) * (1 - H2 ** 2)
    D1 = (D2 @ W[1].T) * (1 - H1 ** 2)
    mine_W = [X.T @ D1, H1.T @ D2, H2.T @ D3]
    mine_b = [D1.sum(0), D2.sum(0), D3.sum(0)]
for l in range(3):
    err_W = (mine_W[l] - W[l].grad).abs().max()
    err_b = (mine_b[l] - b[l].grad).abs().max()
    print(f"layer {l + 1}: shape {tuple(W[l].shape)}, largest difference "
          f"in W {err_W:.1e}, in b {err_b:.1e}")
```

```output
layer 1: shape (4, 6), largest difference in W 4.2e-17, in b 3.1e-17
layer 2: shape (6, 5), largest difference in W 5.6e-17, in b 5.6e-17
layer 3: shape (5, 3), largest difference in W 2.8e-17, in b 2.8e-17
```

**(c)** Use the convention of [Module 06, Section 11](module_06_EN.html#s11): a product of an
$m \times k$ and a $k \times n$ matrix costs $2mkn$ FLOPs, and the elementwise operations (the
$\tanh$ derivative, the bias sums) are of lower order and are left out. The forward pass has three
products:

$$
F = 2B\,(d_0d_1 + d_1d_2 + d_2d_3).
$$

The backward pass has two kinds of product. The weight gradients
$\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$ for $l = 1, 2, 3$ have the shapes of the forward
products and cost the same $F$ in total. The errors passed down, $\boldsymbol{\Delta}^{(3)}\mathbf{W}^{(3)\top}$ and
$\boldsymbol{\Delta}^{(2)}\mathbf{W}^{(2)\top}$, cost $2Bd_2d_3$ and $2Bd_1d_2$. The third such
product, $\boldsymbol{\Delta}^{(1)}\mathbf{W}^{(1)\top}$, would give $\partial\mathcal{L}/\partial\mathbf{X}$,
which no parameter needs, so it is not computed. Hence

$$
\frac{\text{backward}}{\text{forward}}
= \frac{F + 2B(d_1d_2 + d_2d_3)}{F}
= 1 + \frac{d_1d_2 + d_2d_3}{d_0d_1 + d_1d_2 + d_2d_3} \le 2,
$$

because the fraction is at most 1, with equality only if $d_0d_1 = 0$, that is, only if the
first layer's input gradient were computed as well and the first layer cost nothing. "The
backward pass costs about twice the forward pass" is therefore an upper bound, approached when
the first layer is a small share of the work.

**(d)** For $(784, 256, 256, 10)$: $d_0d_1 = 200{,}704$, $d_1d_2 = 65{,}536$ and $d_2d_3 = 2{,}560$.
The forward sum is $268{,}800$ and the error-passing sum is $68{,}096$, so the ratio is
$1 + 68{,}096/268{,}800 = 1.253$. Per example that is $2 \cdot 268{,}800 = 537{,}600$ FLOPs forward and
$2(268{,}800 + 68{,}096) = 673{,}792$ backward. The first layer holds three quarters of the
weights, and its input gradient is the one product skipped, so the ratio is far from 2. The
digits network of [Section 3](#s3), $(64, 128, 128, 10)$, has a smaller first layer:
$1 + 17{,}664/25{,}856 = 1.68$.
:::

::: exercise id=e3 level=1 kind=conceptual minutes=5
[Section 1](#s1) compares the sawtooth $t^k$, the tent map
$t(x) = 2\operatorname{ReLU}(x) - 4\operatorname{ReLU}(x - \tfrac12)$ composed with itself $k$
times, with a one-hidden-layer ReLU network that represents the same function.

(a) Explain, without counting, why one more composition doubles the number of linear pieces while
adding only two units, whereas a one-hidden-layer network must add a unit for every new piece.

(b) A colleague concludes that deep networks are always exponentially more efficient than wide
ones. Say what the argument establishes, and name two things it does not.
:::

::: solution
**(a)** Every linear piece of $t^{k-1}$ is monotone and maps its interval onto the whole of
$[0, 1]$. The tent map rises on $[0, \frac12]$ and falls on $[\frac12, 1]$, so when it is applied
to a piece, the piece's range passes through $\frac12$ exactly once, at which point the output
turns round. Each existing piece therefore becomes two, one rising and one falling. The same two
units act on all the pieces at once, because they are applied to the *value* of the previous layer
and not to the position $x$: composition reuses the units on every piece. A one-hidden-layer
network on a scalar input,
$g(x) = \sum_j a_j\operatorname{ReLU}(w_jx + b_j) + c$, can change slope only where a unit
switches, at $x = -b_j/w_j$. Each unit supplies one breakpoint, so each additional piece costs one
additional unit: width pays for every piece separately. For $k = 10$ the deep network has 20
units and 1,024 pieces, and the shallow one needs at least 1,023 units.

**(b)** The argument establishes a separation for one family of functions: sawtooth-like
functions with exponentially many linear pieces are represented by a deep network with a number of
units that grows linearly in the depth, and by a shallow network only with exponentially many (more
generally, the number of linear regions a ReLU network can produce grows exponentially with depth,
Montúfar et al. 2014). It does not show that the functions met in practice are of this kind: a
real target need not fold its input space again and again. It does not show that gradient descent
from a random start finds the deep construction, which is a particular and delicate setting of the
weights. It says nothing about generalising from finite data, since fitting $2^k$ pieces exactly
is a statement about representation, not about learning. And depth has a cost: the gradient must
travel back through every layer, so depth brings vanishing and exploding gradients
([Section 3](#s3)), which the activations, initialisation and normalisation of
[Sections 5](#s5), [6](#s6) and [10](#s10) exist to control. Any one of the points is enough to refute
"always".
:::

::: exercise id=e4 level=2 kind=calculation minutes=10
For $f(x_1, x_2) = x_1^2x_2 + \exp(x_1x_2)$ at $(x_1, x_2) = (1, 2)$:

(a) write the computational graph with named intermediate variables and evaluate it;

(b) compute $\partial f/\partial x_1$ in one forward-mode pass, with tangent $(\dot x_1, \dot x_2) = (1, 0)$;

(c) compute both partial derivatives in one reverse-mode pass;

(d) for a function $\mathbb{R}^n \to \mathbb{R}$, how many passes does each mode need for the full gradient?
:::

::: solution
**(a)** Break $f$ into one operation per node, so that each node has a local derivative that is
easy to write down:

| node | operation | value |
|---|---|---|
| $v_1$ | $x_1^2$ | 1 |
| $v_2$ | $v_1x_2$ | 2 |
| $v_3$ | $x_1x_2$ | 2 |
| $v_4$ | $\exp v_3$ | $e^2 = 7.3891$ |
| $f$ | $v_2 + v_4$ | 9.3891 |

**(b)** Forward mode carries a tangent $\dot v$ alongside every value, starting from
$\dot x_1 = 1$, $\dot x_2 = 0$ (the direction in which we differentiate), and applies each node's
derivative rule to the tangents of its inputs:

$$
\begin{aligned}
\dot v_1 &= 2x_1\dot x_1 = 2, &
\dot v_2 &= \dot v_1x_2 + v_1\dot x_2 = 4,\\
\dot v_3 &= \dot x_1x_2 + x_1\dot x_2 = 2, &
\dot v_4 &= v_4\dot v_3 = 14.778,\\
\dot f &= \dot v_2 + \dot v_4 = 18.778.
\end{aligned}
$$

So $\partial f/\partial x_1 = 18.778$. By hand, $\partial f/\partial x_1 = 2x_1x_2 + x_2e^{x_1x_2} = 4 + 2e^2$,
which is the same number.

**(c)** Reverse mode sweeps the graph backwards from $\bar f = \partial f/\partial f = 1$,
sending to each input of a node the node's adjoint times the local derivative. A variable used
twice receives the sum of what it is sent along each use, which is the chain rule summed over
paths. In reverse topological order:

$$
\begin{aligned}
\bar v_2 &= \bar f = 1, & \bar v_4 &= \bar f = 1,\\
\bar v_3 &= \bar v_4v_4 = e^2 = 7.389, & &\\
\bar v_1 &= \bar v_2x_2 = 2, & &\\
\bar x_1 &= \underbrace{\bar v_1\cdot 2x_1}_{\text{via } v_1} + \underbrace{\bar v_3x_2}_{\text{via } v_3} = 4 + 14.778 = 18.778, & &\\
\bar x_2 &= \underbrace{\bar v_2v_1}_{\text{via } v_2} + \underbrace{\bar v_3x_1}_{\text{via } v_3} = 1 + 7.389 = 8.389. & &
\end{aligned}
$$

One backward sweep delivered both partial derivatives. Both agree with $x_1^2 + x_1e^{x_1x_2} = 1 + e^2$ for $\partial f/\partial x_2$. The
check below does the same with PyTorch: `backward()` for the reverse sweep and `torch.func.jvp`
for the forward pass.

```python
import math
import torch
from torch.func import jvp

def f(x1, x2):
    return x1 ** 2 * x2 + torch.exp(x1 * x2)

x1 = torch.tensor(1.0, dtype=torch.double, requires_grad=True)
x2 = torch.tensor(2.0, dtype=torch.double, requires_grad=True)
value = f(x1, x2)
value.backward()                                   # one reverse pass: both partials
print(f"f = {value.item():.4f}   df/dx1 = {x1.grad.item():.4f}   "
      f"df/dx2 = {x2.grad.item():.4f}")

point = (torch.tensor(1.0), torch.tensor(2.0))
tangent = (torch.tensor(1.0), torch.tensor(0.0))       # the direction (1, 0)
_, df_dx1 = jvp(f, point, tangent)                     # one forward pass
print(f"forward mode, tangent (1, 0): {df_dx1.item():.4f}")
print(f"by hand: 4 + 2e^2 = {4 + 2 * math.e ** 2:.4f},  "
      f"1 + e^2 = {1 + math.e ** 2:.4f}")
```

```output
f = 9.3891   df/dx1 = 18.7781   df/dx2 = 8.3891
forward mode, tangent (1, 0): 18.7781
by hand: 4 + 2e^2 = 18.7781,  1 + e^2 = 8.3891
```

**(d)** Forward mode produces one directional derivative per pass, one column of the Jacobian,
so the gradient of a function $\mathbb{R}^n \to \mathbb{R}$ needs $n$ passes (one per basis
direction). Reverse mode produces one row of the Jacobian per pass; with a scalar output the
Jacobian is a single row, so one pass gives the whole gradient, at a cost that is a small constant
multiple of evaluating $f$ ([Section 4](#s4)). For a network with $10^6$ parameters that is the
difference between one pass and a million; it is why training uses reverse mode. The price of
reverse mode is memory: the values $v_i$ must be stored (the tape) until the sweep reaches them.
:::

::: exercise id=e5 level=2 kind=derivation minutes=10
(a) Using $\boldsymbol{\delta}^{(l)} = (\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)})\odot\phi'(\mathbf{z}^{(l)})$,
show that a ReLU unit whose pre-activation is negative for every training example receives zero
gradient on its incoming weights and bias, so plain gradient descent can never revive it. Then
show that decoupled weight decay cannot revive it either.

(b) In Lab 1's code, set `b1[5] = -10` after initialisation and train for 3,000 steps with
$\eta = 0.05$. Confirm that the gradients of `W1[:, 5]` and `b1[5]` are exactly zero throughout and that the
unit's parameters end where they started.

(c) Name two changes that prevent such units, or let them recover.
:::

::: solution
**(a)** Write the equation for unit $j$ of layer $l$:
$\delta^{(l)}_j = \phi'(z^{(l)}_j)\,(\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)})_j$. For ReLU,
$\phi'(z) = 0$ when $z < 0$. If $z_j^{(l)} < 0$ for every training example $n$, then
$\delta^{(l)}_{j,n} = 0$ for every $n$, whatever arrives from above. The incoming parameters of
the unit receive

$$
\frac{\partial\mathcal{L}}{\partial W^{(l)}_{ij}} = \sum_n h^{(l-1)}_{i,n}\,\delta^{(l)}_{j,n} = 0,
\qquad
\frac{\partial\mathcal{L}}{\partial b^{(l)}_j} = \sum_n\delta^{(l)}_{j,n} = 0,
$$

so $\theta \leftarrow \theta - \eta\cdot 0$ leaves them unchanged, and the unit stays dead: its
pre-activations do not change, so they stay negative. (The statement is about the training set.
In mini-batch training a unit that is negative on one batch may be positive on another, and then it
receives gradient from that one; a unit is permanently dead when no example in the training set
activates it.) The unit's outgoing weights are frozen as well, since their gradient is
$h^{(l)}_j\delta^{(l+1)}$ and $h^{(l)}_j = 0$.

Decoupled weight decay replaces the update by $\theta \leftarrow (1 - \eta\lambda)\theta - \eta g$.
With $g = 0$ this multiplies $\mathbf{w}_j$ and $b_j$ by the same factor $1 - \eta\lambda$, which
is positive for any sensible $\eta\lambda < 1$. Then every pre-activation
$z_j = \mathbf{w}_j^\top\mathbf{h} + b_j$ is multiplied by that positive factor as well, which
shrinks $|z_j|$ but cannot change its sign. A negative number times a positive number is still
negative, so the unit remains dead (and moves towards the boundary only asymptotically). With
momentum, the unit coasts for a few steps on the momentum accumulated before it died and then
stops; with Adam, $\hat m/(\sqrt{\hat v} + \epsilon)$ goes to 0 as the gradients stay at zero.

**(b)** The block below runs directly after the first code block of [Lab 1](#lab1) (before Step 6
trains `p` in place). It copies the initial network, sets the bias of unit 5 to $-10$ and
records the largest absolute gradient seen on the three parameter groups of that unit, its
incoming weight, its bias and its outgoing weight, over 3,000 steps. The inputs lie in $[-1, 1]$
and `W1[0, 5]` is 0.109 with this seed, so $z_5 = 0.109x - 10 < 0$ on the whole input range.

```python
q = {k: v.copy() for k, v in p.items()}      # p is still the untrained Step 1 network
q["b1"][5] = -10.0                           # unit 5: z < 0 everywhere on [-1, 1]
z5 = forward(q, X)[1][1][:, 5]               # the cache is (X, Z1, H1)
print(f"unit 5 at the start: W1 {q['W1'][0, 5]:.5f}, b1 {q['b1'][5]:.1f}, "
      f"W2 {q['W2'][5, 0]:.5f}, largest z over the data {z5.max():.3f}")

largest_grad = 0.0
for step in range(3000):
    Y, cache = forward(q, X)
    g = backward(q, cache, Y, T)
    largest_grad = max(largest_grad, np.abs(g["W1"][:, 5]).max(),
                       abs(g["b1"][5]), abs(g["W2"][5, 0]))
    for k in q:
        q[k] -= 0.05 * g[k]

print(f"largest |gradient| on unit 5 in 3,000 steps: {largest_grad}")
print(f"unit 5 at the end:   W1 {q['W1'][0, 5]:.5f}, b1 {q['b1'][5]:.1f}, "
      f"W2 {q['W2'][5, 0]:.5f}")
print(f"final training MSE {mse(q, X, T):.2e}, validation MSE {mse(q, Xval, Tval):.2e}")
never_active = int(np.sum(~(forward(q, X)[1][2] > 0).any(axis=0)))
print("hidden units never active on the training set:", never_active)
```

```output
unit 5 at the start: W1 0.10894, b1 -10.0, W2 -0.08024, largest z over the data -9.891
largest |gradient| on unit 5 in 3,000 steps: 0.0
unit 5 at the end:   W1 0.10894, b1 -10.0, W2 -0.08024
final training MSE 2.81e-04, validation MSE 3.68e-04
hidden units never active on the training set: 2
```

The largest gradient on the unit's three parameters is exactly 0.0, not a small number, and
nothing has moved: the unit is out of the network from step 0. Training reaches a mean squared
error of $2.8 \times 10^{-4}$ (validation $3.7 \times 10^{-4}$) with the remaining units, the same
as Lab 1's Step 6, so nothing in the loss curve shows that a unit has been lost. Two hidden
units are never active at the end: unit 5, and a second one that died during training, as one
did in Lab 1. That is the cost of dying: capacity that is no longer used, with no signal in the
loss.

**(c)** Prevention comes from keeping units away from the large negative bias in the first place:
a lower learning rate (large updates are what push biases far negative), He initialisation with
zero biases, or a smaller step from warmup in the first iterations. Recovery needs a non-zero
derivative on the negative side, so use leaky ReLU, whose slope is $a = 0.01$ there, or GELU or SiLU
([Section 5](#s5)); or monitor the fraction of units that are never active and re-initialise the
dead ones.
:::

::: exercise id=e6 level=1 kind=conceptual minutes=5
A deep stack of square ReLU layers ($n_{\text{in}} = n_{\text{out}} = n$, no normalisation) is
initialised in three ways: He normal ($\sigma_w^2 = 2/n_{\text{in}}$), Glorot normal
($\sigma_w^2 = 2/(n_{\text{in}} + n_{\text{out}})$) and PyTorch's `nn.Linear` default (weights and
biases from $U(-1/\sqrt{n_{\text{in}}}, 1/\sqrt{n_{\text{in}}})$). Without computing:

(a) which of the three keeps the scale of the pre-activations constant through depth, and what
happens under the other two?

(b) Under the default, the measured standard deviation of the pre-activations eventually stops
falling and settles at a floor. Why, and why does the floor not rescue training?

(c) Why do Labs 3 to 5 get away with the default, and when would you call
`nn.init.kaiming_normal_` explicitly?
:::

::: solution
**(a)** Equation 6.1 of [Section 6](#s6) gives the variance of a pre-activation as
$n\sigma_w^2\,\mathbb{E}[h^2]$, and for ReLU the second moment of the output is half the variance
of the (symmetric) input, so each layer multiplies the variance by $n\sigma_w^2/2$. For He,
$n\cdot(2/n)/2 = 1$: the scale is the same at every layer. For Glorot with $n_{\text{in}} = n_{\text{out}} = n$,
$\sigma_w^2 = 1/n$, the tanh-style scale, and the factor is $\frac12$: the variance halves at every
layer and the standard deviation falls by $\sqrt2$ per layer. For the default, the weight variance
is $1/(3n)$, a sixth of He's, and the factor is $\frac16$: the standard deviation falls by
$\sqrt6 = 2.4$ per layer. The backward signal obeys the same factors (for square layers fan-in and
fan-out coincide), so the gradients reaching the early layers fall in the same proportions.

**(b)** Every layer adds its bias, and the bias variance, $1/(3n)$ for the default, does not
shrink with depth. Once the propagated signal falls below it, the biases set the scale:
$v = v/6 + 1/(3n)$ gives $v = 0.4/n$, a standard deviation of $\sqrt{0.4/256} = 0.040$ for
$n = 256$, the floor of the worked example in Section 6. But a bias is the same for every input.
What matters for learning is the part of the activation that depends on $\mathbf{x}$, and that part keeps
shrinking at the factor above, while the constant part holds the total at the floor. By layer 10
the output is almost the same vector for every input, and the first layers, whose gradient is
multiplied by about $(1/\sqrt6)^9 \approx 3 \times 10^{-4}$ on the way back, barely move. The
block below measures both quantities in ten layers of width 256 with 1,000 Gaussian inputs.

```python
import math
import torch

n, depth, samples = 256, 10, 1000
gen = torch.Generator().manual_seed(0)
x = torch.randn(samples, n, generator=gen)
for name in ("He", "Glorot", "default"):
    h = x
    for layer in range(1, depth + 1):
        if name == "default":                      # nn.Linear: U(-1/sqrt(n), 1/sqrt(n))
            a = 1 / math.sqrt(n)
            W = (torch.rand(n, n, generator=gen) * 2 - 1) * a
            bias = (torch.rand(n, generator=gen) * 2 - 1) * a
        else:
            std = math.sqrt(2 / n) if name == "He" else math.sqrt(2 / (n + n))
            W, bias = torch.randn(n, n, generator=gen) * std, torch.zeros(n)
        z = h @ W + bias
        h = torch.relu(z)
        if layer in (1, 5, 10):
            over_inputs = z.std(dim=0).mean().item()   # how much a unit varies with x
            print(f"{name:8s} layer {layer:2d}: std of z {z.std():.4f}   "
                  f"std of a unit over the inputs {over_inputs:.2e}")
```

```output
He       layer  1: std of z 1.4154   std of a unit over the inputs 1.41e+00
He       layer  5: std of z 1.2681   std of a unit over the inputs 7.93e-01
He       layer 10: std of z 1.0423   std of a unit over the inputs 4.71e-01
Glorot   layer  1: std of z 1.0016   std of a unit over the inputs 1.00e+00
Glorot   layer  5: std of z 0.2631   std of a unit over the inputs 1.47e-01
Glorot   layer 10: std of z 0.0576   std of a unit over the inputs 1.98e-02
default  layer  1: std of z 0.5799   std of a unit over the inputs 5.79e-01
default  layer  5: std of z 0.0454   std of a unit over the inputs 9.39e-03
default  layer 10: std of z 0.0383   std of a unit over the inputs 1.05e-04
```

Under the default the pre-activations settle near 0.04, but how much a unit varies *with the
input* has fallen from 0.58 to $10^{-4}$, about 0.3% of the total. The Glorot network shows the
$\sqrt2$ decay (its measured 0.058 at layer 10 is of the order of the predicted $2^{-9/2} = 0.044$; a single draw of ten
random layers scatters by tens of per cent around it), and the He network keeps both quantities at order
one.

**(c)** Their network, 64 to 128 to 128 to 10, has three weight layers, so the shrinkage compounds
over two ReLU layers only (a factor of 6 in standard deviation over the two transitions, against about 3,000 over the
nine transitions of the ten-layer example), and the
output starts near zero, which is what a classifier wants: the initial loss is close to $\ln 10 = 2.303$ (Lab 5's baseline
starts at 2.309). Adam also rescales the steps, so small gradients are not fatal. Normalisation
layers would reset the scale at every layer as well. Call `nn.init.kaiming_normal_(w, nonlinearity="relu")`
with zero biases for a deep ReLU stack without normalisation or residual connections (the
ten-layer example of Section 6 is the case), or whenever the activation-scale check of
[Section 14](#s14) shows the signal shrinking or growing with depth.
:::

::: exercise id=e7 level=2 kind=calculation minutes=10
Let $\mathcal{L}(\boldsymbol{\theta}) = \tfrac12(\theta_1^2 + 64\theta_2^2)$. Heavy-ball momentum is
$\mathbf{v} \leftarrow \mu\mathbf{v} - \eta\nabla\mathcal{L}(\boldsymbol{\theta})$,
$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \mathbf{v}$; Nesterov momentum reads the
gradient at the look-ahead point,
$\mathbf{v} \leftarrow \mu\mathbf{v} - \eta\nabla\mathcal{L}(\boldsymbol{\theta} + \mu\mathbf{v})$,
$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \mathbf{v}$. (These are the updates of
[Section 7](#s7) with the velocity rescaled by $-\eta$; the iterates, and so the stability limits,
are the same.)

(a) Find the largest stable learning rate for gradient descent.

(b) Find the largest stable $\eta$ for heavy-ball momentum with $\mu = 0.9$, and for Nesterov
momentum with $\mu = 0.9$.

(c) Find the per-step contraction of $\theta_1$ under gradient descent at $\eta = 0.03$, and the
number of steps needed to shrink $\theta_1$ by a factor of 1,000.

(d) Find the optimal heavy-ball $\eta$ and $\mu$ for this loss, the asymptotic contraction per
step, and the number of steps to shrink by 1,000.
:::

::: solution
The loss is a quadratic with Hessian $\operatorname{diag}(1, 64)$, so each coordinate is an
independent one-dimensional problem with curvature $\lambda$ equal to 1 or 64, and
$\lambda_{\max} = 64$. Write $a = \eta\lambda$ for the step size in units of the curvature.

**(a)** Gradient descent on one coordinate is $\theta \leftarrow \theta - \eta\lambda\theta = (1 - a)\theta$.
It converges if and only if $|1 - a| < 1$, that is $0 < a < 2$, so for all coordinates
$\eta < 2/\lambda_{\max} = 2/64 = 0.03125$. The steep direction is the one that sets the limit.

**(b)** With momentum a coordinate has state $(\theta, v)$ and the update is linear, so the process
converges if and only if both eigenvalues of the $2 \times 2$ update matrix have modulus below 1.
For a quadratic polynomial $x^2 - \operatorname{tr}x + \det$ this holds if and only if
$|\det| < 1$, $1 - \operatorname{tr} + \det > 0$ and $1 + \operatorname{tr} + \det > 0$ (the Jury
conditions: they say that the polynomial is positive at $x = 1$ and $x = -1$ and that the roots'
product is inside the unit circle).

*Heavy ball.* $v' = \mu v - a\theta$ and $\theta' = \theta + v' = (1 - a)\theta + \mu v$, so the matrix is
$\begin{pmatrix}1 - a & \mu\\ -a & \mu\end{pmatrix}$, with trace $1 - a + \mu$ and determinant
$\mu(1 - a) + a\mu = \mu$. Then $1 - \operatorname{tr} + \det = a > 0$ always, and
$1 + \operatorname{tr} + \det = 2 + 2\mu - a > 0$ gives $a < 2(1 + \mu)$. The condition
$|\det| = \mu < 1$ holds. With $\lambda_{\max} = 64$ and $\mu = 0.9$:

$$
\eta < \frac{2(1 + \mu)}{\lambda_{\max}} = \frac{3.8}{64} = 0.0594.
$$

*Nesterov.* $v' = \mu v - a(\theta + \mu v) = -a\theta + \mu(1 - a)v$ and
$\theta' = \theta + v' = (1 - a)\theta + \mu(1 - a)v$. The matrix is
$\begin{pmatrix}1 - a & \mu(1 - a)\\ -a & \mu(1 - a)\end{pmatrix}$, with trace $(1 - a)(1 + \mu)$ and
determinant $\mu(1 - a)^2 + a\mu(1 - a) = \mu(1 - a)$. Then
$1 - \operatorname{tr} + \det = 1 - (1 - a)(1 + \mu) + \mu(1 - a) = a > 0$, and
$1 + \operatorname{tr} + \det = 1 + (1 - a)(1 + 2\mu) > 0$ gives $a < (2 + 2\mu)/(1 + 2\mu)$.
(The condition $|\det| < 1$ gives the weaker $a < 1 + 1/\mu$.) So

$$
\eta < \frac{2(1 + \mu)}{(1 + 2\mu)\lambda_{\max}} = \frac{3.8}{2.8\cdot 64} = 0.0212.
$$

This is *below* gradient descent's limit of 0.03125, not above it: the look-ahead gradient
reacts to the velocity as well, and a large step overshoots sooner. Nesterov momentum is not a
way to make a run more stable.

The block below simulates all three, running each from $(1, 1)$ and testing convergence just
inside and just outside the limits, and also reproduces (c) and (d).

```python
import numpy as np

lam = np.array([1.0, 64.0])                        # Hessian eigenvalues of the loss


def run(eta, mu, steps, theta0=(1.0, 1.0), nesterov=False):
    """Heavy ball, or Nesterov if asked; mu = 0 is plain gradient descent."""
    theta, v = np.array(theta0), np.zeros(2)
    norms = [np.linalg.norm(theta)]
    with np.errstate(all="ignore"):
        for _ in range(steps):
            look = theta + mu * v if nesterov else theta   # where the gradient is read
            v = mu * v - eta * lam * look
            theta = theta + v
            norms.append(np.linalg.norm(theta))
    return np.array(norms)


def survives(*args, **kw):
    return run(*args, **kw)[-1] < 1e-6


print("(a) gradient descent, limit 2/64 = 0.03125")
print("   eta 0.0311 converges:", survives(0.0311, 0.0, 3000),
      "  eta 0.0313 converges:", survives(0.0313, 0.0, 3000))
print("(b) heavy ball, mu 0.9, limit 3.8/64 = 0.05938")
print("   eta 0.0590 converges:", survives(0.0590, 0.9, 5000),
      "  eta 0.0596 converges:", survives(0.0596, 0.9, 5000))
print("    Nesterov, mu 0.9, limit 3.8/(2.8 * 64) = 0.02121")
print("   eta 0.0210 converges:", survives(0.0210, 0.9, 5000, nesterov=True),
      "  eta 0.0214 converges:", survives(0.0214, 0.9, 5000, nesterov=True))


def steps_to_shrink(norms, factor=1e3):
    return int(np.argmax(norms <= norms[0] / factor))


print("(c) gradient descent at eta 0.03")
print("   theta_1 alone:", steps_to_shrink(run(0.03, 0.0, 400, (1.0, 0.0))),
      "steps;  theta_2 alone:", steps_to_shrink(run(0.03, 0.0, 400, (0.0, 1.0))),
      "steps;  from (1, 1):", steps_to_shrink(run(0.03, 0.0, 400)), "steps")
eta, mu = 4 / 81, (7 / 9) ** 2
print(f"(d) heavy ball at eta {eta:.4f}, mu {mu:.4f}")
print("   from (1, 1):", steps_to_shrink(run(eta, mu, 200)),
      "steps;  asymptotic estimate:", f"{np.log(1e3) / -np.log(7 / 9):.1f} steps")
```

```output
(a) gradient descent, limit 2/64 = 0.03125
   eta 0.0311 converges: True   eta 0.0313 converges: False
(b) heavy ball, mu 0.9, limit 3.8/64 = 0.05938
   eta 0.0590 converges: True   eta 0.0596 converges: False
    Nesterov, mu 0.9, limit 3.8/(2.8 * 64) = 0.02121
   eta 0.0210 converges: True   eta 0.0214 converges: False
(c) gradient descent at eta 0.03
   theta_1 alone: 227 steps;  theta_2 alone: 83 steps;  from (1, 1): 216 steps
(d) heavy ball at eta 0.0494, mu 0.6049
   from (1, 1): 44 steps;  asymptotic estimate: 27.5 steps
```

**(c)** At $\eta = 0.03$ the coordinate $\theta_1$ (curvature 1) is multiplied by $1 - 0.03 = 0.97$ each
step. To shrink by 1,000, solve $0.97^t = 10^{-3}$:
$t = \ln 1000/(-\ln 0.97) = 6.908/0.03046 = 226.8$, so 227 steps. The steep coordinate is
multiplied by $1 - 0.03\cdot 64 = -0.92$: it oscillates in sign and shrinks by 1,000 in
$6.908/0.0834 = 83$ steps. The slow direction dominates, so the whole run needs about 227 steps,
or 216 measured on the norm $\|\boldsymbol\theta\|$ from $(1, 1)$, whose starting value is $\sqrt2$. The step size
cannot be raised much to speed the flat direction up, because $\eta = 0.03$ is already 96% of
the limit.

**(d)** For heavy ball the roots of $x^2 - (1 - a + \mu)x + \mu$ are complex, with modulus
$\sqrt\mu$ whatever $a$ is, whenever $|1 - a + \mu| < 2\sqrt\mu$, that is for
$(1 - \sqrt\mu)^2 < a < (1 + \sqrt\mu)^2$. The contraction per step is then $\sqrt\mu$ for every
direction, so the best choice makes the interval just cover both $a$ values, $\eta\cdot 1$ and $\eta\cdot 64$:

$$
\eta = (1 - \sqrt\mu)^2,
\qquad
64\eta = (1 + \sqrt\mu)^2
\;\Rightarrow\;
\frac{1 + \sqrt\mu}{1 - \sqrt\mu} = \sqrt{64} = 8
\;\Rightarrow\;
\sqrt\mu = \frac79.
$$

Hence $\mu = (7/9)^2 = 49/81 = 0.605$ and $\eta = (2/9)^2 = 4/81 = 0.0494$, which is Polyak's
formula $\eta = 4/(\sqrt{\lambda_{\max}} + \sqrt{\lambda_{\min}})^2 = 4/(8 + 1)^2$ and
$\mu = \big((\sqrt\kappa - 1)/(\sqrt\kappa + 1)\big)^2$ with $\kappa = 64$. The asymptotic contraction
is $\sqrt\mu = 7/9 = 0.778$ per step, so shrinking by 1,000 takes
$6.908/\ln(9/7) = 27.5$, that is 28 steps, against 227 for gradient descent: a factor of about
$\sqrt\kappa = 8$ in the number of steps. The simulation needs 44 steps, because at the optimum both coordinates sit on the edge
of the complex region ($a = (1 - \sqrt\mu)^2$ for the flat one and $a = (1 + \sqrt\mu)^2$ for the steep one) and have
a double root, so their solutions are $(c_1 + c_2t)(\pm 7/9)^t$ and the factor $t$ delays the decay. The same
measure for gradient descent gives 216, so the real speed-up is about five, not eight. The remaining
caveat is that the optimal $\mu$ and $\eta$ need $\lambda_{\min}$ and $\lambda_{\max}$, which in a
network one does not know; in practice $\mu = 0.9$ is used and $\eta$ is tuned.
:::

::: exercise id=e8 level=2 kind=calculation minutes=10
Run Adam by hand for two steps on one parameter, with gradients $g_1 = 1$ and $g_2 = 3$,
$\beta_1 = 0.9$, $\beta_2 = 0.999$, $\epsilon$ negligible and learning rate $\eta$.

(a) Give $m_t$, $v_t$, $\hat m_t$, $\hat v_t$ and the step for $t = 1$ and $t = 2$.

(b) What would the steps be without bias correction?

(c) Prove that for gradients with a constant mean, $\mathbb{E}[m_t] = (1 - \beta_1^t)\,\mathbb{E}[g]$.
:::

::: solution
**(a)** The recursions are $m_t = \beta_1m_{t-1} + (1 - \beta_1)g_t$ and
$v_t = \beta_2v_{t-1} + (1 - \beta_2)g_t^2$, both starting from 0; the corrected values divide by
$1 - \beta_1^t$ and $1 - \beta_2^t$, and the step is $\eta\,\hat m_t/(\sqrt{\hat v_t} + \epsilon)$.

For $t = 1$: $m_1 = 0.1\cdot 1 = 0.1$ and $v_1 = 0.001\cdot 1 = 0.001$. The corrections are
$1 - 0.9 = 0.1$ and $1 - 0.999 = 0.001$, so $\hat m_1 = 1$, $\hat v_1 = 1$ and the step is $\eta\cdot 1/1 = \eta$.

For $t = 2$: $m_2 = 0.9\cdot 0.1 + 0.1\cdot 3 = 0.39$ and
$v_2 = 0.999\cdot 0.001 + 0.001\cdot 9 = 0.000999 + 0.009 = 0.009999$. The corrections are
$1 - 0.81 = 0.19$ and $1 - 0.998001 = 0.001999$, so $\hat m_2 = 0.39/0.19 = 2.0526$ and
$\hat v_2 = 0.009999/0.001999 = 5.0020$, with $\sqrt{\hat v_2} = 2.2365$. The step is
$\eta\cdot 2.0526/2.2365 = 0.918\,\eta$.

Both steps are about $\eta$ in size, although the gradients differ by a factor of three. That is
Adam's defining property: the step is a normalised gradient, so its size is set by $\eta$, not
by the scale of the gradient.

**(b)** Without the corrections the step is $\eta\,m_t/\sqrt{v_t}$. At $t = 1$: $0.1/\sqrt{0.001} = 3.162\,\eta$.
At $t = 2$: $0.39/\sqrt{0.009999} = 3.900\,\eta$. The first steps are three to four times too large. The
reason is that the averages start at zero, and $v$ (whose $\beta_2 = 0.999$ is closer to 1)
starts further below its true value, in relative terms, than $m$ does: $m_1$ is 0.1 of the gradient
and $v_1$ is 0.001 of its square, so $\sqrt{v_1}$ is 0.0316 of the gradient's size, and the
ratio is $0.1/0.0316 = 3.16$. If $\beta_2$ were 0.95 the first uncorrected step would be too
*small* ($0.1/\sqrt{0.05} = 0.45\,\eta$). The block below checks the numbers.

```python
import math

beta1, beta2 = 0.9, 0.999
m = v = 0.0
for t, g in ((1, 1.0), (2, 3.0)):
    m = beta1 * m + (1 - beta1) * g
    v = beta2 * v + (1 - beta2) * g * g
    m_hat, v_hat = m / (1 - beta1 ** t), v / (1 - beta2 ** t)
    print(f"t={t}: m {m:.4f}  v {v:.6f}  m_hat {m_hat:.4f}  v_hat {v_hat:.4f}")
    print(f"     step/eta {m_hat / math.sqrt(v_hat):.4f}   "
          f"uncorrected step/eta {m / math.sqrt(v):.4f}")
```

```output
t=1: m 0.1000  v 0.001000  m_hat 1.0000  v_hat 1.0000
     step/eta 1.0000   uncorrected step/eta 3.1623
t=2: m 0.3900  v 0.009999  m_hat 2.0526  v_hat 5.0020
     step/eta 0.9178   uncorrected step/eta 3.9002
```

**(c)** Unroll the recursion. With $m_0 = 0$,

$$
m_t = (1 - \beta_1)\sum_{s=1}^{t}\beta_1^{\,t-s}g_s.
$$

(Check $t = 2$: $0.1\cdot(0.9g_1 + g_2) = 0.09g_1 + 0.1g_2$, which is $0.9\cdot 0.1g_1 + 0.1g_2$ as in (a).) Take expectations with
$\mathbb{E}[g_s] = \mathbb{E}[g]$ for all $s$ and sum the geometric series:

$$
\mathbb{E}[m_t] = (1 - \beta_1)\,\mathbb{E}[g]\sum_{k=0}^{t-1}\beta_1^k
= (1 - \beta_1)\,\mathbb{E}[g]\,\frac{1 - \beta_1^t}{1 - \beta_1}
= (1 - \beta_1^t)\,\mathbb{E}[g].
$$

So $m_t$ underestimates the mean by exactly the factor $1 - \beta_1^t$, and dividing by it removes
the bias; the same argument gives $\mathbb{E}[v_t] = (1 - \beta_2^t)\,\mathbb{E}[g^2]$ for the
second moment. The correction matters for roughly the first $1/(1 - \beta)$ steps, about 10 for $m$
and 1,000 for $v$, and fades as $\beta^t \to 0$.
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
In three or four sentences: why is L2 regularisation added to the gradient
(`torch.optim.Adam(weight_decay=λ)`) not the same as AdamW's decoupled weight decay? Which
parameters does the coupled version regularise least? Which PyTorch call gives the decoupled
version, and why does the distinction vanish for plain SGD?
:::

::: solution
Under Adam the L2 term $\lambda\theta$ is added to the gradient *before* the update, so it is
divided by $\sqrt{\hat v}$ together with the rest of the gradient: parameter $i$ is shrunk by about
$\eta\lambda\theta_i/\sqrt{\hat v_i}$ per step, the penalty is rescaled by the very normalisation
that equalises step sizes, and the parameters with a large gradient history (large $\sqrt{\hat v_i}$) are regularised
least: with $\eta = 10^{-3}$ and $\lambda = 10^{-4}$ a parameter whose gradient RMS is 10 loses a
fraction $10^{-7}/10 = 10^{-8}$ of its value per step and one whose RMS is 0.1 loses $10^{-6}$. AdamW
subtracts $\eta\lambda\theta_i$ outside the normalisation and shrinks both by $10^{-7}$ per step,
the same relative amount for every parameter, and it is `torch.optim.AdamW` (recent versions also
accept `torch.optim.Adam(..., decoupled_weight_decay=True)`). For plain SGD there is nothing to
normalise: $\theta \leftarrow \theta - \eta(g + \lambda\theta) = (1 - \eta\lambda)\theta - \eta g$ is decay by
$1 - \eta\lambda$ either way, so the two forms coincide.
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
Inverted dropout with drop probability $p = 0.4$:

(a) By what factor are the surviving activations scaled during training?

(b) Show that the expected value of a unit's output is unchanged.

(c) What goes wrong at evaluation if `model.eval()` is forgotten?

(d) What would go wrong if the scaling were omitted during training while dropout is still
switched off at evaluation?
:::

::: solution
**(a)** A unit survives with probability $1 - p = 0.6$, and the survivors are divided by $1 - p$:
the factor is $1/0.6 = 5/3 \approx 1.67$.

**(b)** The output is $\tilde h = h\,m/(1 - p)$, where $m$ is 1 with probability $0.6$ and 0 with
probability $0.4$. Then

$$
\mathbb{E}[\tilde h] = 0.6\cdot\frac{h}{0.6} + 0.4\cdot 0 = h.
$$

So the next layer sees the right expectation, and at evaluation, with dropout off, it sees $h$
itself. The output is noisy, though: $\operatorname{Var}(\tilde h) = h^2\,p/(1 - p) = 0.667\,h^2$.
A simulation with $h = 2.5$ and a million draws confirms both moments:

```python
import torch

p, h = 0.4, 2.5                      # drop probability, one activation value
generator = torch.Generator().manual_seed(0)
keep = (torch.rand(1_000_000, generator=generator) >= p).float()
out = keep * h / (1 - p)                          # inverted dropout on one unit
print(f"scale {1 / (1 - p):.4f}   mean {out.mean():.3f} (h = {h})   "
      f"variance {out.var():.3f} (theory h^2 p/(1-p) = {h * h * p / (1 - p):.3f})")
```

```output
scale 1.6667   mean 2.501 (h = 2.5)   variance 4.166 (theory h^2 p/(1-p) = 4.167)
```

**(c)** The random masks stay active, so the network is evaluated as one random sub-network per
call: predictions change from call to call, and accuracy is lower than that of the real model
(the variance above is added to every unit). A metric that is sampled cannot be compared between
runs. Lab 5's script D shows it: the accuracy of the same weights differs from one evaluation
to the next and is a few points below the evaluation-mode value. If the model also has batch
normalisation, it normalises with the statistics of the current batch instead of its running averages, so the result
depends on the batch size.

**(d)** During training the next layer then sees inputs whose expectation is $0.6\,h$ (each unit
is $h$ with probability 0.6 and 0 otherwise), and at evaluation it sees $h$: inputs larger by
$1/0.6 = 1.67$ on average than anything it was trained on, a systematic shift in every layer
that follows. The two conventions are equivalent if exactly one of them applies the correction:
either scale by $1/(1 - p)$ in training (inverted dropout, the standard) and do nothing at
evaluation, or scale by $1 - p$ at evaluation and do nothing in training (the original
formulation).
:::

::: exercise id=e11 level=2 kind=calculation minutes=10
(a) Derive $\log\sum_je^{z_j} = m + \log\sum_je^{z_j - m}$ for any $m$, and explain why
$m = \max_jz_j$ makes the right-hand side safe from both overflow and $\log 0$.

(b) Compute by hand the cross-entropy for the logits $\mathbf{z} = (800, 803, 799)$ with target
class 0.

(c) In NumPy, show that the naive $-\log\operatorname{softmax}(\mathbf{z})_0$ returns `nan` in float64
for these logits, and find the smallest integer logit at which `np.exp` overflows in float64.
:::

::: solution
**(a)** Factor $e^m$ out of every term: $e^{z_j} = e^me^{z_j - m}$, so
$\sum_je^{z_j} = e^m\sum_je^{z_j - m}$. Take logarithms, using $\log(ab) = \log a + \log b$:
$\log\sum_je^{z_j} = m + \log\sum_je^{z_j - m}$. It holds for every $m$, because it is only a
rewriting; the choice of $m$ is a numerical one. With $m = \max_jz_j$, every exponent
$z_j - m$ is at most 0, so no term exceeds $e^0 = 1$ and nothing overflows. And the term of the
maximum is exactly $e^0 = 1$, so the sum is at least 1 and its logarithm is at least 0: the sum
cannot underflow to zero, and $\log 0$ cannot occur. Other terms may underflow to 0 (when
$z_j - m$ is very negative), and that is harmless because they are negligible next to the 1. The
cross-entropy is then computed as $\text{loss} = \operatorname{logsumexp}(\mathbf{z}) - z_y$, a
subtraction, with no division and no logarithm of a small probability.

**(b)** Here $m = 803$, and the three shifted exponents are $-3$, $0$ and $-4$:

$$
\sum_je^{z_j - m} = e^{-3} + 1 + e^{-4} = 0.049787 + 1 + 0.018316 = 1.068103,
$$

so $\operatorname{logsumexp}(\mathbf{z}) = 803 + \ln 1.068103 = 803 + 0.065884 = 803.065884$, and

$$
\text{loss} = 803.065884 - 800 = 3.065884.
$$

The target is not the largest logit, so the loss is the gap of 3 to the maximum plus the small
correction $\ln(1 + e^{-3} + e^{-4}) = 0.0659$, which is the share of the other two logits.
`F.cross_entropy` returns the same value, 3.0659.

**(c)** The naive computation exponentiates first: $e^{800}$ is larger than the largest float64 number,
$1.80 \times 10^{308} = e^{709.78}$, so it is `inf`, the sum is `inf`, and `inf/inf` is
`nan`. The largest float64 value has $\ln = 709.78$, so `np.exp(709)` still fits and `np.exp(710)`
overflows: 710 is the smallest integer logit that overflows. (In float32 the corresponding
threshold is $\ln(3.4 \times 10^{38}) = 88.7$, so logits above 88 overflow there, which is why the
log-sum-exp form is not optional.)

```python
import numpy as np

z = np.array([800.0, 803.0, 799.0])
with np.errstate(all="ignore"):                    # silence the overflow warning
    naive = -np.log(np.exp(z)[0] / np.exp(z).sum())
    print("exp(800) =", np.exp(800.0), "  naive cross-entropy:", naive)

m = z.max()
lse = m + np.log(np.exp(z - m).sum())         # log-sum-exp, maximum removed
print(f"log-sum-exp {lse:.6f}   loss {lse - z[0]:.6f}")

with np.errstate(all="ignore"):
    print("exp(709) =", np.exp(709.0), "  exp(710) =", np.exp(710.0))
largest = np.finfo(np.float64).max
print("float64 max", largest, "  its logarithm", np.log(largest))
```

```output
exp(800) = inf   naive cross-entropy: nan
log-sum-exp 803.065884   loss 3.065884
exp(709) = 8.218407461554972e+307   exp(710) = inf
float64 max 1.7976931348623157e+308   its logarithm 709.782712893384
```
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
A 10-class network ends in a softmax layer, and its outputs are passed to `F.cross_entropy`,
which applies a log-softmax again, as in Lab 5's script A. Without computing the bound:

(a) Why can the training loss not approach zero, and why is its floor higher for more classes?

(b) Why does the accuracy still improve during training?

(c) Why are the gradients that reach the network small, and which examples receive almost none?
:::

::: solution
**(a)** The second softmax receives "logits" that are probabilities $\mathbf{q}$: each in $[0, 1]$
and summing to 1. A softmax of numbers that differ by at most 1 cannot be confident. Make this
precise. Let $y$ be the true class and $\hat p_y = e^{q_y}/\sum_je^{q_j}$ the second softmax's
probability for it, so that the odds are $\hat p_y/(1 - \hat p_y) = e^{q_y}/\sum_{j\ne y}e^{q_j}$.
The competitors' $q_j$ sum to $1 - q_y$, so by Jensen's inequality (the exponential is convex)

$$
\sum_{j\ne y}e^{q_j} \ge (K - 1)\,e^{(1 - q_y)/(K - 1)}
\quad\Rightarrow\quad
\frac{\hat p_y}{1 - \hat p_y} \le \frac{1}{K - 1}\exp\!\Big(\frac{Kq_y - 1}{K - 1}\Big) \le \frac{e}{K - 1},
$$

where the last step uses $q_y \le 1$ (the exponent increases with $q_y$ and equals 1 at
$q_y = 1$). Odds at most $e/(K - 1)$ mean $\hat p_y \le e/(e + K - 1)$, with equality when
$\mathbf{q}$ is exactly one-hot. The loss $-\ln\hat p_y$ therefore cannot fall below
$\ln\big((e + K - 1)/e\big)$. For $K = 10$ this is $\ln(11.718/2.718) = 1.461$, the floor Lab 5 shows.
More classes mean more competitors sharing the remaining mass, so the bound falls and the floor
rises:

| $K$ | 2 | 10 | 100 | 1,000 |
|---|---|---|---|---|
| largest possible $\hat p_y$ | 0.731 | 0.232 | 0.0267 | 0.0027 |
| floor of the loss | 0.313 | 1.461 | 3.622 | 5.909 |

At $K = 1{,}000$ a perfectly confident network scores 5.909 against the uniform guess's
$\ln 1000 = 6.908$, barely better.

**(b)** The softmax is monotone: the class with the largest probability is the class with the
largest real logit, so the ranking of the classes is exactly the ranking of the real logits.
The second softmax's loss still decreases when the true class's $q_y$ rises and increases when a
competitor's rises, so minimising it still pushes the true class towards the top of the ranking.
The network can therefore keep learning the ranking, and accuracy counts only the ranking. This is why the bug hides
behind a good accuracy.

**(c)** The gradient with respect to the real logits $\mathbf{z}$ passes through the Jacobian of the
first softmax, $\mathbf{J} = \operatorname{diag}(\mathbf{q}) - \mathbf{q}\mathbf{q}^\top$
([Section 3](#s3)), whose entries have absolute value at most $\frac14$ (a diagonal entry is
$q_i(1 - q_i)$, an off-diagonal one $-q_iq_j$, and $q_iq_j \le \frac14$ because $q_i + q_j \le 1$).
The gradient is $\mathbf{J}(\hat{\mathbf{p}}_2 - \mathbf{y})$, where $\hat{\mathbf{p}}_2$ is the second
softmax's output and the factor in brackets has bounded size. Hence the gradient is small
everywhere, and it tends to zero as $\mathbf{q}$ approaches *any* one-hot vector, whether the hot
class is the right one or not. The correct loss behaves differently in the case that matters: an
example that is confidently *wrong* has a large loss and a gradient of norm about 1.4, while
under the double softmax it has a loss of about 2.5 and a gradient more than a thousand times smaller. The
block compares the two losses on five cases of a 10-class problem (the true logit and one
competitor are set, the other eight are 0).

```python
import numpy as np
import torch
import torch.nn.functional as F

K = 10
print(f"floor of the loss for K = {K}: {np.log((np.e + K - 1) / np.e):.4f}")


def losses_and_gradients(true_logit, other_logit):
    """Loss and logit-gradient norm, without and with the extra softmax."""
    z = torch.zeros(1, K)
    z[0, 0], z[0, 1] = true_logit, other_logit
    target = torch.tensor([0])
    results = []
    for double in (False, True):
        zz = z.clone().requires_grad_(True)
        loss = F.cross_entropy(F.softmax(zz, 1) if double else zz, target)
        grad, = torch.autograd.grad(loss, zz)
        results += [loss.item(), grad.norm().item()]
    return results


print(f"{'case':18s} {'loss':>8s} {'|grad|':>9s} | "
      f"{'loss(2x)':>8s} {'|grad|(2x)':>10s}")
cases = (("uniform", 0, 0), ("mildly right", 2, 0), ("confidently right", 8, 0),
         ("mildly wrong", 0, 2), ("confidently wrong", 0, 8))
for name, a, c in cases:
    l1, g1, l2, g2 = losses_and_gradients(a, c)
    print(f"{name:18s} {l1:8.4f} {g1:9.2e} | {l2:8.4f} {g2:10.2e}")
```

```output
floor of the loss for K = 10: 1.4612
case                   loss    |grad| | loss(2x) |grad|(2x)
uniform              2.3026  9.49e-01 |   2.3026   9.49e-02
mildly right         0.7966  5.79e-01 |   1.9593   2.49e-01
confidently right    0.0030  3.17e-03 |   1.4637   2.70e-03
mildly wrong         2.7966  1.06e+00 |   2.3492   7.06e-02
confidently wrong    8.0030  1.41e+00 |   2.4604   8.72e-04
```

A confident mistake receives almost no gradient (the last row: $8.7 \times 10^{-4}$ against 1.41), so
the examples that most need correcting are the ones the optimiser hears least, and a confident,
correct example sits at a loss of about 1.46 however confident it becomes. Training does not stop, since mild cases
still produce gradients, but it is slow and the loss is meaningless as a monitor. The fix is to
pass the logits.
:::

::: exercise id=e13 level=1 kind=conceptual minutes=5
Three gradient checks of hand-written backward passes, each using central differences and the
per-entry relative error $|a - n|/\max(10^{-8}, |a| + |n|)$, where $a$ is the analytic and $n$ the
numerical gradient. For each, say whether it points to a bug and what you would do next.

(a) A float64 check at $\epsilon_{\text{fd}} = 10^{-11}$ reports errors of about $10^{-5}$ for typical entries and up to $10^{-2}$ for
the worst, spread over every tensor with no pattern.

(b) A float64 check at $\epsilon_{\text{fd}} = 10^{-5}$ reports errors below $10^{-7}$ everywhere except one
entry of the first layer's bias, in a ReLU layer, at $3 \times 10^{-3}$; the entry's error changes
erratically as $\epsilon_{\text{fd}}$ is varied.

(c) A float64 check at $\epsilon_{\text{fd}} = 10^{-5}$ reports errors between 0.2 and 1 for every entry of
the first layer's weights and bias, and below $10^{-7}$ for the second layer's.
:::

::: solution
**(a)** Probably not a bug. A central difference has two error terms: truncation, which falls as
$\epsilon_{\text{fd}}^2$, and rounding, which grows as $u/\epsilon_{\text{fd}}$ with $u \approx 10^{-16}$. At
$\epsilon_{\text{fd}} = 10^{-11}$ the rounding term, of order $10^{-16}\cdot 0.3/10^{-11} \approx 3 \times 10^{-6}$ for a loss near 0.3,
swamps everything, and it hits every tensor alike, including those that cannot be wrong, which is
the signature of noise and not of a fault. Lab 1's network at this $\epsilon_{\text{fd}}$ gives median errors between
$3 \times 10^{-6}$ and $3 \times 10^{-5}$ on all four tensors (the one-entry output bias gives $9 \times 10^{-6}$) and a worst
entry of $3 \times 10^{-2}$. Rerun at
$\epsilon_{\text{fd}} \approx 10^{-5}$ ([Section 14](#s14)): a real bug survives the change and a rounding
artefact vanishes.

**(b)** Probably not a bug. One bad entry in a ReLU layer, whose size changes erratically with
$\epsilon_{\text{fd}}$, is the signature of a kink. If some example's pre-activation for that unit lies
within $\epsilon_{\text{fd}}$ of 0, the two evaluations $b \pm \epsilon_{\text{fd}}$ fall on different sides of the
kink and the quotient averages two slopes, while the analytic gradient is the derivative of
whichever piece the point is on. Print the smallest $|z|$ of that unit over the batch (Lab 1,
Step 3 finds $2 \times 10^{-7}$ and an error of $8 \times 10^{-4}$). Then rerun with a smaller $\epsilon_{\text{fd}}$ (Lab 1 uses $10^{-7}$, and
the error falls to $2 \times 10^{-7}$), or move the point slightly. A true bug would be the same at every
$\epsilon_{\text{fd}}$.

**(c)** A bug, and the check says where. The second layer's gradients are right and every
gradient below them is wrong, so the second layer's own gradient computation is fine and the error
is in the step that passes $\boldsymbol{\delta}$ from the second layer to the first: a missing or
wrong ReLU gate, or a wrong transpose. In a deep network the topmost failing layer is where to
look. Lab 1, Step 4 produces this pattern exactly by dropping the gate: the errors of
$\mathbf{W}^{(1)}$ and $\mathbf{b}^{(1)}$ are between 0.29 and 1.00, and those of $\mathbf{W}^{(2)}$ and
$\mathbf{b}^{(2)}$ are $10^{-8}$ or better.
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
Name the most likely cause and the first thing to try for each run of a 10-class classifier.

(a) The loss starts at 2.30 and stays there.

(b) The loss falls from 2.3 to 0.4 over the first 200 steps, then jumps to 9 at step 230 and
becomes `NaN` at step 240, the gradient norm spiking just before.

(c) The training loss is 0.02 and falling while the validation loss is 0.9 and has risen since
epoch 8.

(d) Training and validation losses both stall at 0.9 from epoch 5, where a step schedule cut the
learning rate by a factor of 100.
:::

::: solution
**(a)** The initial loss $2.30 = \ln 10$ is exactly right, so initialisation is not the
problem; what is missing is learning. Candidates: a learning rate of zero or far too small, an
optimiser built with the wrong (or an empty) parameter list, a graph cut by a `.detach()`, `.item()` or a NumPy
round trip, dead units, labels that do not belong to the inputs. The first step is to overfit one
small batch of 16 examples while printing the gradient norm of each layer: zero gradients point to the graph or the
parameters, non-zero gradients and a loss that does not move point to the learning rate or the
optimiser, and a batch that overfits while the full set does not points to the data pipeline and
the labels ([Section 14](#s14)).

**(b)** A learning rate too high for this stage of training ([Section 14](#s14)'s "falls, then
spikes"), possibly tipped over by one bad batch or by an overflow in the loss. The loss was
healthy for 200 steps, so the model and the data are basically right. Lower $\eta$ (a range test,
[Section 9](#s9)), add warmup if there is none, clip the global gradient norm at 1.0, and compute
the loss from logits. If that is not enough, `torch.autograd.set_detect_anomaly(True)` names the
first operation that produced a non-finite value. The gradient norm spiking *before* the loss is
the tell: had it grown steadily from step 0, a missing `zero_grad()` would be the suspect
(Lab 5, script B).

**(c)** Overfitting: a training loss of 0.02 against a validation loss of 0.9, the latter rising
since epoch 8, is the classic gap. Stop early at about epoch 8 (the minimum of the validation
loss) and keep that checkpoint. Then reduce the gap: weight decay, dropout, augmentation, a smaller
model, or more data, which is the most effective remedy ([Section 11](#s11)).

**(d)** The learning rate was cut too early: with both losses high and close together the model is
under-trained, not overfitting, and regularising it further would make matters worse. The schedule dropped the step
size by 100 at epoch 5, before the model had reached a good region, so the optimiser can no longer
make progress. Use a longer schedule, a gentler decay (for example a cosine schedule or a factor of 10 instead of
100), and then check whether the model is too small (underfitting).
:::

::: exercise id=e15 level=3 kind=coding minutes=25
In Lab 1's NumPy network, implement Adam with bias correction as a drop-in replacement for the
update line.

(a) For SGD and for Adam, find the best learning rate on a grid of factors of about 3 over 3,000
full-batch steps, and compare the final training MSE and the loss curves.

(b) Multiply `X` by 1,000, as if the input had been recorded in millimetres instead of metres
(the targets stay as they are), and repeat without re-standardising.

(c) Explain what changed for each optimiser, and what fixes both.
:::

::: solution
The code runs in the same session as the first block of [Lab 1](#lab1) (the one that defines
`init`, `forward`, `backward`, `mse`, `X`, `T` and `p`), before Step 6 trains `p` in place. Both
optimisers start from the same saved initial network, so only the update rule differs. `Adam`
keeps the two running averages per tensor and divides by the bias corrections, as in
[Section 8](#s8). `fit` records the loss before every step, so the curve has 3,001 points. A
diverging run overflows to `inf` and `nan`, which `sweep` leaves out when choosing the best
learning rate and prints as `nan`. Blocks (a), (b) and (c) of the output answer the three parts of
the exercise; block (b') asks whether rescaling the initial weights could replace the
standardisation.

```python
p0 = {k: v.copy() for k, v in p.items()}      # the untrained Step 1 network, saved once


class SGD:
    def __init__(self, eta):
        self.eta = eta

    def step(self, q, g):
        for k in q:
            q[k] -= self.eta * g[k]


class Adam:
    def __init__(self, eta, beta1=0.9, beta2=0.999, eps=1e-8):
        self.eta, self.beta1, self.beta2, self.eps, self.t = eta, beta1, beta2, eps, 0
        self.m, self.v = {}, {}

    def step(self, q, g):
        self.t += 1
        for k in q:
            m = self.beta1 * self.m.get(k, 0.0) + (1 - self.beta1) * g[k]
            v = self.beta2 * self.v.get(k, 0.0) + (1 - self.beta2) * g[k] ** 2
            self.m[k], self.v[k] = m, v
            m_hat = m / (1 - self.beta1 ** self.t)      # bias corrections: both
            v_hat = v / (1 - self.beta2 ** self.t)      # averages start at zero
            q[k] -= self.eta * m_hat / (np.sqrt(v_hat) + self.eps)


def fit(optimiser, X, T, steps=3000):
    """Full-batch training from the saved initial network; returns the loss curve."""
    q = {k: v.copy() for k, v in p0.items()}
    curve = []
    with np.errstate(all="ignore"):              # a diverging run overflows to inf/nan
        for _ in range(steps):
            Y, cache = forward(q, X)
            curve.append(float(np.mean((Y - T) ** 2)))
            optimiser.step(q, backward(q, cache, Y, T))
        curve.append(mse(q, X, T))
    return curve


def sweep(label, make_optimiser, X, T, etas):
    """Train at every learning rate on the grid; return the best finite curve."""
    best_eta, best_curve = None, None
    for eta in etas:
        curve = fit(make_optimiser(eta), X, T)
        print(f"  {label:4s} eta {eta:7.0e}: final MSE {curve[-1]:9.3e}")
        finite = np.isfinite(curve[-1])
        if finite and (best_curve is None or curve[-1] < best_curve[-1]):
            best_eta, best_curve = eta, curve
    print(f"  {label:4s} best on the grid: eta {best_eta:.0e}, "
          f"MSE {best_curve[-1]:.2e}")
    return best_curve


sgd_etas = [1e-3, 3e-3, 1e-2, 3e-2, 1e-1, 3e-1, 1.0]
adam_etas = [1e-4, 3e-4, 1e-3, 3e-3, 1e-2, 3e-2, 1e-1]

print("(a) input in metres")
best_sgd = sweep("SGD", SGD, X, T, sgd_etas)
best_adam = sweep("Adam", Adam, X, T, adam_etas)
print("training MSE at steps 0, 100, 500, 1000, 3000")
for name, curve in (("SGD", best_sgd), ("Adam", best_adam)):
    print(f"  {name:4s}", "  ".join(f"{curve[s]:.2e}"
                                   for s in (0, 100, 500, 1000, 3000)))
print(f"Adam over SGD: {best_sgd[-1] / best_adam[-1]:.0f} times lower")

X_mm = 1000 * X                          # the same inputs, recorded in millimetres
print("(b) input in millimetres, not standardised")
print(f"  initial MSE: {fit(SGD(0.0), X_mm, T, steps=1)[0]:.3e}")
sweep("SGD", SGD, X_mm, T, [1e-9, 1e-8, 1e-7, 1e-6, 1e-4, 1e-2])
sweep("Adam", Adam, X_mm, T, [1e-4, 1e-3, 1e-2, 3e-2, 1e-1, 3e-1, 1.0])
# All 64 kinks start at x = 0 (b1 = 0). A network whose kinks stay there is a two-piece
# linear function; its best possible fit is a least-squares problem.
basis = np.hstack([np.maximum(X_mm, 0), np.maximum(-X_mm, 0)])
coef = np.linalg.lstsq(basis, T, rcond=None)[0]
two_piece = np.mean((basis @ coef - T) ** 2)
print(f"  best two-piece fit with the kink at 0: MSE {two_piece:.4f}")

# Is a rescaled start enough? Divide the first-layer weights by 1,000 so that the
# network computes the same function of X_mm as the original one did of X.
p0_original = p0
p0 = dict(p0_original, W1=p0_original["W1"] / 1000)
print("(b') millimetres, W1 divided by 1,000 at initialisation")
print(f"  initial MSE: {fit(SGD(0.0), X_mm, T, steps=1)[0]:.3e}")
sweep("SGD", SGD, X_mm, T, [1e-7, 1e-6, 1e-5, 1e-4])
sweep("Adam", Adam, X_mm, T, [1e-5, 1e-4, 1e-3, 1e-2, 1e-1])
p0 = p0_original

X_std = (X_mm - X_mm.mean()) / X_mm.std()   # standardise with training statistics
print("(c) millimetres, standardised")
print(f"  initial MSE: {fit(SGD(0.0), X_std, T, steps=1)[0]:.3e}")
sweep("SGD", SGD, X_std, T, [1e-2, 3e-2, 6e-2, 1e-1, 3e-1])
sweep("Adam", Adam, X_std, T, adam_etas)
```

```output
(a) input in metres
  SGD  eta   1e-03: final MSE 1.225e-01
  SGD  eta   3e-03: final MSE 6.716e-02
  SGD  eta   1e-02: final MSE 1.510e-02
  SGD  eta   3e-02: final MSE 1.020e-03
  SGD  eta   1e-01: final MSE 1.138e-04
  SGD  eta   3e-01: final MSE 1.273e-01
  SGD  eta   1e+00: final MSE 1.316e+03
  SGD  best on the grid: eta 1e-01, MSE 1.14e-04
  Adam eta   1e-04: final MSE 2.716e-02
  Adam eta   3e-04: final MSE 6.311e-04
  Adam eta   1e-03: final MSE 1.492e-05
  Adam eta   3e-03: final MSE 1.369e-06
  Adam eta   1e-02: final MSE 2.191e-05
  Adam eta   3e-02: final MSE 2.001e-06
  Adam eta   1e-01: final MSE 2.157e-05
  Adam best on the grid: eta 3e-03, MSE 1.37e-06
training MSE at steps 0, 100, 500, 1000, 3000
  SGD  3.27e-01  6.07e-02  5.48e-03  1.01e-03  1.14e-04
  Adam 3.27e-01  4.93e-02  3.10e-04  5.58e-05  1.37e-06
Adam over SGD: 83 times lower
(b) input in millimetres, not standardised
  initial MSE: 4.872e+04
  SGD  eta   1e-09: final MSE 1.657e-01
  SGD  eta   1e-08: final MSE 1.657e-01
  SGD  eta   1e-07: final MSE 1.657e-01
  SGD  eta   1e-06: final MSE       nan
  SGD  eta   1e-04: final MSE       nan
  SGD  eta   1e-02: final MSE       nan
  SGD  best on the grid: eta 1e-07, MSE 1.66e-01
  Adam eta   1e-04: final MSE 1.749e-01
  Adam eta   1e-03: final MSE 1.286e-01
  Adam eta   1e-02: final MSE 8.319e-02
  Adam eta   3e-02: final MSE 1.911e-01
  Adam eta   1e-01: final MSE 7.989e-02
  Adam eta   3e-01: final MSE 1.061e-01
  Adam eta   1e+00: final MSE 7.634e-01
  Adam best on the grid: eta 1e-01, MSE 7.99e-02
  best two-piece fit with the kink at 0: MSE 0.1657
(b') millimetres, W1 divided by 1,000 at initialisation
  initial MSE: 3.270e-01
  SGD  eta   1e-07: final MSE 1.657e-01
  SGD  eta   1e-06: final MSE 1.656e-01
  SGD  eta   1e-05: final MSE 1.651e-01
  SGD  eta   1e-04: final MSE       nan
  SGD  best on the grid: eta 1e-05, MSE 1.65e-01
  Adam eta   1e-05: final MSE 1.397e-01
  Adam eta   1e-04: final MSE 5.124e-03
  Adam eta   1e-03: final MSE 2.797e-03
  Adam eta   1e-02: final MSE 6.442e-02
  Adam eta   1e-01: final MSE 4.488e-03
  Adam best on the grid: eta 1e-03, MSE 2.80e-03
(c) millimetres, standardised
  initial MSE: 2.223e-01
  SGD  eta   1e-02: final MSE 2.721e-02
  SGD  eta   3e-02: final MSE 2.495e-03
  SGD  eta   6e-02: final MSE 9.612e-05
  SGD  eta   1e-01: final MSE 5.491e-01
  SGD  eta   3e-01: final MSE       nan
  SGD  best on the grid: eta 6e-02, MSE 9.61e-05
  Adam eta   1e-04: final MSE 1.921e-02
  Adam eta   3e-04: final MSE 3.426e-04
  Adam eta   1e-03: final MSE 1.144e-05
  Adam eta   3e-03: final MSE 3.795e-06
  Adam eta   1e-02: final MSE 3.651e-04
  Adam eta   3e-02: final MSE 1.559e-06
  Adam eta   1e-01: final MSE 1.837e-05
  Adam best on the grid: eta 3e-02, MSE 1.56e-06
```

**(a)** SGD's best learning rate on the grid is 0.1, with a final MSE of $1.1 \times 10^{-4}$; the next
step up, 0.3, is unstable: the loss rises to 43 within three steps, kills 63 of the 64 hidden units
and ends at 0.127, the fit of the single survivor. Adam's best is $3 \times 10^{-3}$ with
$1.4 \times 10^{-6}$ (a rate of 0.03 gives $2.0 \times 10^{-6}$, almost as good; the final value of Adam
is not smooth in $\eta$ because the last iterate carries the jitter of the step size), about 83
times lower. The curves show that the gap opens early and keeps widening: at step 500, $5.5 \times 10^{-3}$
against $3.1 \times 10^{-4}$ (18 times), and at step 3,000, 83 times. The usual explanation is that the loss has
directions of very different curvature, so that SGD's single $\eta$ is limited by the stiffest one
(it diverges between 0.1 and 0.3), whereas Adam's per-parameter normalisation takes a step of about
$\eta$ in every parameter whatever the local curvature.

**(b)** With the input in millimetres, SGD diverges to `nan` for every $\eta \ge 10^{-6}$ and is
stuck at a mean squared error of 0.166 for $\eta \le 10^{-7}$, while Adam never produces `nan` on
the grid but its best is 0.080 (at $\eta = 0.1$), nearly 60,000 times worse than in metres. The initial
loss is $4.9 \times 10^{4}$ against 0.327: the He initialisation assumed unit-size inputs, and the
first number printed was already condemning the run.

The reason for SGD is curvature. Scaling the input by $s = 1{,}000$ multiplies $\partial z/\partial\mathbf{W}^{(1)}$
by $s$, so the gradient of $\mathbf{W}^{(1)}$ grows by $s$ and its Hessian entries by $s^2 = 10^6$. The stable step size
falls by the same $10^6$, from between 0.1 and 0.3 to between $10^{-7}$ and $10^{-6}$, as the grid shows.
The bias $\mathbf{b}^{(1)}$ and the second layer have the curvature they had, and at
$\eta = 10^{-7}$ they move by a ten-millionth of their gradients per step. All 64 kinks start at
$x = 0$, because $\mathbf{b}^{(1)} = \mathbf{0}$, and a kink at 0 stays near 0, so the network is a
function with two linear pieces, one on each half-line. The least-squares fit printed in (b) gives the
best such function, with a mean squared error of 0.1657: the number SGD stalls at, to four digits.

Adam's step is about $\eta$ in every parameter, independent of the gradient's scale. That is why it
does not diverge: the enormous initial gradient is divided by its own size. But the problem has
lost its common scale. In millimetres a good $\mathbf{W}^{(1)}$ is about $10^{-3}$ (the original
weights divided by 1,000) while $\mathbf{b}^{(1)}$ stays near 1, the values the kinks need. A step of $\eta$ small enough for
$\mathbf{W}^{(1)}$ (a jitter of $\eta = 0.1$ is 100 times its natural size and is amplified by inputs of size 1,000) moves
the biases too slowly to matter in 3,000 steps, and one large enough for the biases ruins
$\mathbf{W}^{(1)}$. No single $\eta$ serves both.

**(c)** SGD is limited by one learning rate for a loss whose curvature differs by $10^6$ between
parameter groups, and Adam by one step size for parameters whose natural scales differ by $10^3$. Adam
removes a *gradient-scale* problem, which SGD suffers from, but it cannot remove a
*parameter-scale* problem. What fixes both is to standardise the input with the training mean
and standard deviation, which makes the problem the one the initialisation and the learning rates
were designed for. The last block of the output shows it: with the millimetre data standardised,
Adam's best is $1.6 \times 10^{-6}$ at $\eta = 0.03$ (it was $1.4 \times 10^{-6}$ in metres), and SGD's best is
$9.6 \times 10^{-5}$ at $\eta = 0.06$ (it was $1.1 \times 10^{-4}$ at 0.1; the standardised input is
1.77 times larger than the original, so the curvature is about three times larger and the stable limit about three
times lower, between 0.06 and 0.1 on this grid, and the factor-3 grid alone would have shown only
$2.5 \times 10^{-3}$ at 0.03). The initial loss is back to 0.22. Rescaling the start is not a
substitute (the block headed (b') in the output): dividing
$\mathbf{W}^{(1)}$ by 1,000 at initialisation restores the initial loss to 0.327, but SGD is stable
only up to about $10^{-5}$ and still stalls at 0.165, because the curvature of $\mathbf{W}^{(1)}$ is set by the
size of the inputs and not by the weights, and Adam reaches only $2.8 \times 10^{-3}$, two thousand times worse than in
metres. Standardise the inputs, as [Module 01, Section 3](module_01_EN.html#s3) already advised for linear
models, and check the initial loss ([Section 14](#s14)).
:::
