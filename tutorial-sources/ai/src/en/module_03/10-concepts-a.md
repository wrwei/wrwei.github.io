## Images are not vectors {#s1}

A colour image of 224 × 224 pixels is 224 × 224 × 3 = 150,528 numbers. Flattened, it can be fed
to the multilayer perceptron of [Module 02](module_02_EN.html), but at this size it fails twice:
on cost and on statistics.

::: worked title="A dense first layer on a 224 × 224 colour image"
A dense layer from 150,528 inputs to 1,000 hidden units has one weight per input–unit pair and
one bias per unit:

$$
150{,}528 \times 1{,}000 + 1{,}000 = 150{,}529{,}000 \text{ parameters.}
$$

At 4 bytes per float32 number that is 602,116,000 bytes: 574 MiB (602 MB in decimal units) for
one layer, before the gradients and Adam's two moment estimates
([Module 02, Section 8](module_02_EN.html#s8)) quadruple it.
:::

The statistical failure is worse. Each weight belongs to one input position, so the layer must
learn separately that an edge at the top left and the same edge at the bottom right are the same
thing, from examples that show an edge in each place. Two properties of images remove both
problems.

### Locality

A pixel's meaning depends far more on its neighbours than on distant pixels: edges, strokes and
textures are relations between pixels a few positions apart. This can be measured.

::: worked title="Locality, measured on scikit-learn's digits"
`load_digits` holds 1,797 images of 8 × 8 pixels with grey levels 0–16. Keep the 52 pixels whose
standard deviation exceeds 0.5 (the others are almost always blank), correlate every pair of them
across the images, and average the correlations by distance on the grid:

```python
import numpy as np
from sklearn.datasets import load_digits

X = load_digits().data                       # (1797, 64), grey levels 0..16
keep = np.flatnonzero(X.std(axis=0) > 0.5)   # skip pixels that are almost always blank
R = np.corrcoef(X[:, keep], rowvar=False)    # correlation of every pair of pixels
row, col = np.divmod(keep, 8)                # position of each kept pixel on the grid
dist = np.hypot(row[:, None] - row, col[:, None] - col)
iu = np.triu_indices(len(keep), k=1)         # each pair once
r, d = R[iu], dist[iu]
for lo, hi in [(0, 1), (1, 1.5), (1.5, 2), (2, 3), (3, 4.5), (4.5, 12)]:
    sel = (d > lo) & (d <= hi)
    print(f"distance ({lo}, {hi}]: mean r = {r[sel].mean():+.2f}  ({sel.sum()} pairs)")
```

```output
distance (0, 1]: mean r = +0.42  (88 pairs)
distance (1, 1.5]: mean r = +0.17  (76 pairs)
distance (1.5, 2]: mean r = -0.04  (72 pairs)
distance (2, 3]: mean r = -0.06  (236 pairs)
distance (3, 4.5]: mean r = -0.04  (406 pairs)
distance (4.5, 12]: mean r = -0.03  (448 pairs)
```

The first three bins hold exactly the distances 1, $\sqrt{2}$ and 2. Adjacent pixels are clearly
correlated (+0.42) and diagonal neighbours less so (+0.17); from distance 2 onwards the mean is
near zero and slightly negative, as a thin stroke through one pixel tends to leave background two
pixels away. Neighbours carry information about each other; distant pixels carry almost none.
:::

### Stationarity

The second property is **stationarity**: the statistics of small patches are the same everywhere
in the image. An edge looks the same at the top left as at the bottom right, so a detector useful
at one position is useful at every position. That licenses **weight sharing**: one small set of
weights, applied everywhere.

### One layer, three parameter counts

Take a layer from a 224 × 224 × 3 image to a 224 × 224 × 64 output (3,211,264 units, 64 at each
of 50,176 positions) and impose the two assumptions one at a time; Figure 3.1 draws the three cases
for one output unit.

::: worked title="Dense, locally connected, convolutional"
**Dense.** Every output unit sees all 150,528 inputs:

$$
150{,}528 \times 3{,}211{,}264 = 4.83 \times 10^{11} \text{ weights.}
$$

**Locally connected** (locality only). Each output unit sees only its own 3 × 3 × 3 window, with
27 weights of its own:

$$
3{,}211{,}264 \times 27 = 86{,}704{,}128 \text{ weights.}
$$

**Convolutional** (locality and weight sharing). The 27 weights of a window are shared by all
50,176 positions, with one set of weights and one bias per output channel:

$$
64 \times 27 + 64 = 1{,}792 \text{ parameters.}
$$

Locality replaced the factor 150,528 by 27. Weight sharing then divided by the number of
positions: $86{,}704{,}128 / 1{,}728 = 50{,}176$, where $1{,}728 = 64 \times 27$ is the number of
shared weights. The convolution's count does not depend on the image size: on a 1,024 × 1,024
image it is still 1,792.
:::

::: figure id=fig-03-1
One output unit over a 6 × 6 input, in three panels. Dense: lines from all 36 pixels to the unit.
Locally connected: lines from one 3 × 3 window, and a second unit elsewhere whose nine lines carry
different weights (w1…w9 against v1…v9). Convolutional: the same two windows, both labelled
w1…w9. For a 224 × 224 × 3 input and a 224 × 224 × 64 output the counts are 4.83 × 10¹¹, 86.7
million and 1,792.
:::

Weight sharing also pools statistical strength. A shared weight acts at every position, so the
chain rule sums its gradient over all 50,176 positions of every training image, where an untied
weight hears only from its own. Neighbouring positions are correlated, so one image is not worth
50,176 independent examples, but it is worth far more than one.

### Equivariance and invariance

Write $T_{\boldsymbol{\tau}}$ for the translation that shifts an image by
$\boldsymbol{\tau} = (\tau_1, \tau_2)$ pixels,
$(T_{\boldsymbol{\tau}} X)_{i,j} = X_{i-\tau_1,\, j-\tau_2}$. A function $f$ of images is

- **translation equivariant** if $f(T_{\boldsymbol{\tau}} X) = T_{\boldsymbol{\tau}} f(X)$:
  shifting the input shifts the output by the same amount;
- **translation invariant** if $f(T_{\boldsymbol{\tau}} X) = f(X)$: shifting the input leaves the
  output unchanged.

A convolution is equivariant ([Section 2](#s2) proves it); pooling and global averaging give
approximate invariance ([Section 5](#s5)). The task decides which is wanted. A label such as
"contains a crack" does not move when the crack moves, so a classifier should be invariant; a
segmentation mask or a detection box must move with the object, so those networks should be
equivariant.

### The inductive bias, and where it does not hold

A convolution is a dense layer whose weight matrix is constrained: most entries are zero
(locality) and the rest are tied (weight sharing), as [Section 2](#s2) shows. It represents fewer
functions than a dense layer with the same input and output, and that is the point: the functions
it gives up are ones images do not need, and every parameter it lacks need not be estimated from
data. An assumption built into an architecture in this way is an **inductive bias**.
[Lab 2](#lab2) tests it from both sides: shuffling the 64 pixels of every digit with one fixed
permutation leaves an MLP's accuracy unchanged, since it never knew which pixels were neighbours,
and lowers a CNN's from about 98.4% to about 96%.

The bias pays on grids with local, stationary statistics: images, audio and sensor signals,
spectra, CT and microscopy volumes ([Section 13](#s13)). It does not help on tabular data, whose
columns (age, pressure, alloy grade) have no neighbours and an arbitrary order.

::: keyidea
A convolution is a dense layer with locality and stationarity built in: it wins on data that obey
them and offers nothing to data that do not.
:::

::: check
A layer maps a 32 × 32 × 3 image to a 32 × 32 × 16 output with 5 × 5 windows. How many
parameters does it have as a convolution with biases, and how many weights as a locally
connected layer?
:::

::: answer
As a convolution, 16 filters of 5 × 5 × 3 = 75 weights plus 16 biases:
$16 \times 75 + 16 = 1{,}216$ parameters. Locally connected, 32 × 32 × 16 = 16,384 output units
with 75 weights each: $16{,}384 \times 75 = 1{,}228{,}800$ weights (plus 16,384 biases), about a
thousand times more.
:::

::: check
Should a classifier that answers "is there a crack in this image?" be equivariant or invariant
to shifts? And a network that segments the crack?
:::

::: answer
The classifier should be invariant: its label does not move when the crack does. The
segmentation network should be equivariant: its mask must move with the crack.
:::

## The convolution operation {#s2}

For a single-channel image $X \in \R^{H \times W}$, a kernel $K \in \R^{k \times k}$ and a bias
$b$, a convolution layer computes

$$
Y_{i,j} = b + \sum_{u=0}^{k-1} \sum_{v=0}^{k-1} K_{u,v}\, X_{i+u,\, j+v}.
$$

Indices start at 0, and $(i, j)$ is the top-left corner of the window the kernel covers: lay the
kernel over the window, multiply the overlapping numbers, add the products and the bias, slide one
place and repeat. The window fits at $H - k + 1$ positions per axis, so without padding a 3 × 3
kernel turns a 5 × 5 image into a 3 × 3 output; [Section 3](#s3) deals with the border.

::: worked title="A 3 × 3 kernel on a 5 × 5 image, by hand"
Take

$$
X = \begin{bmatrix} 1&2&0&1&3 \\ 0&1&3&2&1 \\ 2&0&1&4&0 \\ 1&3&2&0&1 \\ 0&1&1&2&2 \end{bmatrix},
\qquad
K = \begin{bmatrix} 1&0&-1 \\ 1&0&-1 \\ 1&0&-1 \end{bmatrix},
\qquad b = 0.
$$

For $Y_{0,0}$ the window is rows 0–2 and columns 0–2 (Figure 3.3 shows this window and the one
for $Y_{1,2}$). Multiplying cell by cell, one window row per line:

$$
\begin{aligned}
Y_{0,0} &= (1)(1) + (0)(2) + (-1)(0) \\
&\quad + (1)(0) + (0)(1) + (-1)(3) \\
&\quad + (1)(2) + (0)(0) + (-1)(1) \\
&= (1 + 0 + 2) - (0 + 3 + 1) = -1.
\end{aligned}
$$

The kernel adds the window's left column and subtracts its right column. For $Y_{1,2}$ the window
is rows 1–3 and columns 2–4, with left column 3, 1, 2 and right column 1, 0, 1:

$$
Y_{1,2} = (3 + 1 + 2) - (1 + 0 + 1) = 4.
$$

The same at all nine positions gives

$$
Y = \begin{bmatrix} -1&-4&0 \\ -3&-2&4 \\ -1&-2&1 \end{bmatrix}.
$$

Positive values mark windows brighter on the left than on the right, negative values the reverse:
the kernel detects vertical edges and their direction.
:::

::: figure id=fig-03-3
The sliding window on the 5 × 5 example: the input with the 3 × 3 window highlighted at output
positions (0, 0) and (1, 2), the kernel beside it, the nine products written in the cells of each
window, and arrows to the matching cells of the output, whose rows are (−1, −4, 0), (−3, −2, 4)
and (−1, −2, 1).
:::

### Cross-correlation or convolution

Strictly, the operation above is a **cross-correlation**, written $K \star X$ in this module when
the distinction matters. The convolution of mathematics and signal processing flips the kernel:

$$
(K * X)_{i,j} = \sum_{u}\sum_{v} K_{u,v}\, X_{i-u,\, j-v}.
$$

Here the output index sits at the window's bottom-right corner. Move it to the top-left
($i \to i + k - 1$, $j \to j + k - 1$) and substitute $u' = k - 1 - u$, $v' = k - 1 - v$: the sum
becomes $\sum_{u',v'} K_{k-1-u',\,k-1-v'}\, X_{i+u',\, j+v'}$, a cross-correlation with the
kernel rotated by 180°. The two differ only by the flip $K_{u,v} \to K_{k-1-u,\,k-1-v}$. For a
learned kernel this is immaterial, because the network simply learns the flipped kernel, and
every deep-learning framework computes the cross-correlation and calls it convolution. Three
consequences:

- `scipy.signal.convolve2d` flips the kernel, so it disagrees with `torch.nn.functional.conv2d`,
  while `correlate2d` agrees, as does `convolve2d` given `K[::-1, ::-1]` ([Lab 1](#lab1)).
- A kernel unchanged by the rotation, such as a blur, gives identical results either way.
- An antisymmetric kernel changes sign. Rotating the edge kernel above negates it, so the true
  convolution of the example is $-Y$, with rows (1, 4, 0), (3, 2, −4) and (1, 2, −1).

### Hand-designed kernels

Before kernels were learned they were designed, and the classic designs show what a 3 × 3 kernel
can do. One rule organises them. On a constant region, $X_{i,j} = c$, the output is
$b + c \sum_{u,v} K_{u,v}$: kernels whose weights sum to 1 reproduce flat regions and change only
the structure on top of them, while kernels whose weights sum to 0 output zero on flat regions and
respond only to change.

| Kernel | Weights | Sum | What it does |
|---|---|---|---|
| Box blur | all $\tfrac{1}{9}$ | 1 | replaces each pixel by its window's mean |
| Gaussian blur | $\tfrac{1}{16}\left[\begin{smallmatrix}1&2&1\\2&4&2\\1&2&1\end{smallmatrix}\right]$ | 1 | a mean weighted towards the centre |
| Sharpen | $\left[\begin{smallmatrix}0&-1&0\\-1&5&-1\\0&-1&0\end{smallmatrix}\right]$ | 1 | identity minus a Laplacian: pushes a pixel away from its neighbours |
| Sobel-x | $\left[\begin{smallmatrix}-1&0&1\\-2&0&2\\-1&0&1\end{smallmatrix}\right]$ | 0 | horizontal change, that is, vertical edges |
| Laplacian | $\left[\begin{smallmatrix}0&1&0\\1&-4&1\\0&1&0\end{smallmatrix}\right]$ | 0 | second difference: spots, thin lines, corners |

::: worked title="Blur and sharpen on the same image"
The Gaussian blur at $Y_{1,1}$ reads rows 1–3 and columns 1–3 of $X$, centred on $X_{2,2} = 1$:

$$
Y_{1,1} = \tfrac{1}{16}\,(1 \cdot 1 + 2 \cdot 3 + 1 \cdot 2 + 2 \cdot 0 + 4 \cdot 1 + 2 \cdot 4
+ 1 \cdot 3 + 2 \cdot 2 + 1 \cdot 0) = \tfrac{28}{16} = 1.75.
$$

The window's mean is $16/9 = 1.78$, so the blur has pulled the centre value most of the way to it.
Over all positions,

$$
\begin{bmatrix} 1.125&1.6875&1.875 \\ 1.25&1.75&1.8125 \\ 1.5&1.5625&1.375 \end{bmatrix}:
$$

the input's range of 0 to 4 has shrunk to 1.125–1.875. The sharpen kernel at the same position
gives $5 \cdot 1 - (3 + 2 + 0 + 4) = -4$. Read as identity minus Laplacian, it computes
$x_c + 4\,(x_c - \bar{x}_4)$, with $\bar{x}_4 = 2.25$ the mean of the four neighbours:
$1 + 4\,(1 - 2.25) = -4$. Over all positions it gives rows (0, 11, 1), (−7, −4, 17) and
(11, 5, −9): a range of −9 to 17 from an input of 0 to 4. Sharpening amplifies differences, noise
included.
:::

The filters a network learns in its first layer look much like these, oriented edge detectors and
blobs ([Lab 2](#lab2), step 7, plots the eight learned by its digit CNN, and
[Section 14](#s14) discusses them); deeper layers combine them into detectors nobody would design
by hand.

::: widget name=convolution-explorer
The default reproduces the worked example: step through to see $Y_{0,0} = -1$ as nine products,
then the rest of $Y$. Tick "flip the kernel" and every value changes sign. Try the letter F with
Sobel-x, then change padding, stride and dilation and watch the output-size panel.
:::

### Translation equivariance, proved

[Section 1](#s1) claimed that convolution is translation equivariant. With
$(T_{\boldsymbol{\tau}} X)_{i,j} = X_{i-\tau_1,\, j-\tau_2}$ the proof takes two lines:

$$
\begin{aligned}
(K \star T_{\boldsymbol{\tau}} X)_{i,j}
&= \sum_{u,v} K_{u,v}\, X_{i+u-\tau_1,\, j+v-\tau_2} \\
&= (K \star X)_{i-\tau_1,\, j-\tau_2} = \big(T_{\boldsymbol{\tau}} (K \star X)\big)_{i,j}.
\end{aligned}
$$

The first line substitutes the shifted image; the second reads the same sum as the output at
$(i - \tau_1, j - \tau_2)$. The bias is the same everywhere and passes through. The proof assumes
that every $X_{i+u-\tau_1,\, j+v-\tau_2}$ exists, which holds on an infinite grid and with
circular padding, where the image wraps around like a torus. With zero padding, the pixels a
shift pushes in at one border are zeros rather than those pushed out at the other, so equivariance
holds exactly away from the borders and fails near them; [Lab 1](#lab1) measures both cases.

### The convolution as a matrix

A convolution is linear in $X$, so it is a matrix product. In one dimension, a length-5 input and
the kernel (1, 2, 3) give three outputs, and writing each window's weights as a row gives

$$
\mathbf{y} = \mathbf{M}\mathbf{x}, \qquad
\mathbf{M} = \begin{bmatrix} 1&2&3&0&0 \\ 0&1&2&3&0 \\ 0&0&1&2&3 \end{bmatrix}.
$$

Each row is the previous one shifted one place right: $\mathbf{M}$ is a banded **Toeplitz**
matrix, constant along its diagonals. In two dimensions, with the image flattened row by row, the
matrix is doubly block-Toeplitz: Toeplitz blocks, one per kernel row, arranged in a Toeplitz
pattern. This is the precise sense of [Section 1](#s1)'s claim: a convolution layer is a dense
layer whose matrix has $k^2$ nonzeros per row and the same $k^2$ values in every row.

### The backward pass, and the transposed convolution

If $\mathbf{y} = \mathbf{M}\mathbf{x}$ and the gradient
$\mathbf{g} = \partial \mathcal{L}/\partial \mathbf{y}$ arrives from the layer above, the chain
rule ([Module 02, Section 3](module_02_EN.html#s3)) gives

$$
\frac{\partial \mathcal{L}}{\partial \mathbf{x}} = \mathbf{M}^\top \mathbf{g}.
$$

Column $m$ of $\mathbf{M}$ holds the weights with which $x_m$ entered each output, so
$\mathbf{M}^\top$ scatters every $g_i$ back through the kernel onto the inputs its window read.
The result is a "full" convolution of $\mathbf{g}$ with the kernel, over every overlap including
those that hang over the ends. Applying the transpose of a convolution's matrix is a **transposed
convolution**; [Section 12](#s12) runs it forwards to upsample. The weight gradient follows
because $K_{u,v}$ enters $Y_{i,j}$ only through the term $K_{u,v} X_{i+u,j+v}$:

$$
\frac{\partial \mathcal{L}}{\partial K_{u,v}} = \sum_{i,j}
\frac{\partial \mathcal{L}}{\partial Y_{i,j}}\, X_{i+u,\, j+v},
\qquad
\frac{\partial \mathcal{L}}{\partial b} = \sum_{i,j} \frac{\partial \mathcal{L}}{\partial Y_{i,j}},
$$

a cross-correlation of the input with the output gradient. The backward pass is therefore two
more convolutions, each with as many multiply-accumulates as the forward one: about twice the
forward cost, as for the dense layers of Module 02.

::: worked title="The 1D example as a matrix, forwards and backwards"
Forwards, with $\mathbf{x} = (1, 0, 2, 1, 3)$:

$$
\mathbf{M}\mathbf{x} = (1 \cdot 1 + 2 \cdot 0 + 3 \cdot 2,\;
1 \cdot 0 + 2 \cdot 2 + 3 \cdot 1,\; 1 \cdot 2 + 2 \cdot 1 + 3 \cdot 3) = (7, 7, 13).
$$

Backwards, with $\mathbf{g} = (1, -1, 2)$, each input collects the gradient of every output whose
window covered it:

$$
\mathbf{M}^\top \mathbf{g} = \big(1 \cdot 1,\; 2 \cdot 1 + 1 \cdot (-1),\;
3 \cdot 1 + 2 \cdot (-1) + 1 \cdot 2,\; 3 \cdot (-1) + 2 \cdot 2,\; 3 \cdot 2\big)
= (1, 1, 3, 1, 6).
$$

Figure 3.5 draws both products. The middle input, $x_2$, was read by all three windows, with
weights 3, 2 and 1. The weight
gradient is $\partial \mathcal{L}/\partial w_u = \sum_i g_i x_{i+u}$:
$(1 - 0 + 4,\; 0 - 2 + 2,\; 2 - 1 + 6) = (5, 0, 7)$. NumPy agrees on all three:

```python
import numpy as np

w = np.array([1.0, 2.0, 3.0])                # kernel
x = np.array([1.0, 0.0, 2.0, 1.0, 3.0])      # input of length 5
M = np.zeros((3, 5))
for i in range(3):
    M[i, i:i + 3] = w                        # row i: the kernel shifted i places
print(M @ x, np.correlate(x, w, "valid"))    # forward pass, two ways
g = np.array([1.0, -1.0, 2.0])               # dL/dy arriving from above
print(M.T @ g, np.convolve(g, w, "full"))    # dL/dx: the transposed convolution
print(np.correlate(x, g, "valid"))           # dL/dw: input correlated with dL/dy
```

```output
[ 7.  7. 13.] [ 7.  7. 13.]
[1. 1. 3. 1. 6.] [1. 1. 3. 1. 6.]
[5. 0. 7.]
```
:::

::: figure id=fig-03-5
The 1D convolution as a matrix. Left: the 3 × 5 banded matrix $\mathbf{M}$, with 1, 2 and 3 along
its three diagonals and zeros elsewhere, times $\mathbf{x} = (1, 0, 2, 1, 3)$, giving (7, 7, 13).
Right: its transpose $\mathbf{M}^\top$ (5 × 3) times the output gradient (1, −1, 2), giving
(1, 1, 3, 1, 6), labelled "transposed convolution".
:::

::: keyidea
A convolution is a sparse, weight-tied matrix: its forward pass slides a dot product, and its
backward pass is two more convolutions.
:::

::: check
Why does `F.conv2d` match `scipy.signal.correlate2d` but not `scipy.signal.convolve2d`?
:::

::: answer
Frameworks compute the cross-correlation; `convolve2d` computes the true convolution, which flips
the kernel. Flip it first, `K[::-1, ::-1]`, and all three agree.
:::

::: check
A kernel's weights sum to zero. What does it output on a constant image, away from the borders?
:::

::: answer
Zero (plus the bias): every window holds the same value $c$, and
$\sum_{u,v} K_{u,v}\, c = c \sum_{u,v} K_{u,v} = 0$. Such kernels respond only to change.
:::

::: check
For an input of length 6 and a 3-tap kernel without padding, what is the shape of $\mathbf{M}$
and how many of its entries can be nonzero?
:::

::: answer
There are $6 - 3 + 1 = 4$ outputs, so $\mathbf{M}$ is 4 × 6, with 12 nonzero entries: three per
row, out of 24.
:::

## Output size, padding, stride, dilation and the receptive field {#s3}

Every architecture diagram is a list of shapes, each following from one formula, and a recurrence
says how much of the image each unit can see. Both rest on three settings. **Padding** $p$ adds
$p$ cells at each end of an axis; **stride** $s$ is the step between windows; **dilation** $d$
spaces the kernel's taps $d$ apart, so a 3 × 3 kernel with $d = 2$ reads every second pixel of a
5 × 5 area. Dilation keeps the $k^2$ weights while the span grows to $d(k-1) + 1$.

### The output size

Count the window positions along one axis. After padding there are $H + 2p$ positions, numbered
$0$ to $H + 2p - 1$. A window starting at $t$ reads $t, t + d, \dots, t + (k-1)d$, so it fits if
$t + d(k-1) \le H + 2p - 1$. Windows start at $t = 0, s, 2s, \dots$, and the number of multiples
of $s$ in $[0,\, H + 2p - d(k-1) - 1]$ is

$$
H_{\text{out}} = \left\lfloor \frac{H + 2p - d(k-1) - 1}{s} \right\rfloor + 1.
$$

At $d = 1$ this is $\lfloor (H + 2p - k)/s \rfloor + 1$, and with $p = 0$, $s = 1$ it is
[Section 2](#s2)'s $H - k + 1$. Widths follow the same formula.

::: worked title="Seven configurations of a 3-tap kernel on 11 inputs"
With $H = 11$ and $k = 3$, the numerator $H + 2p - d(k-1) - 1$ and the output size are:

| $p$ | $s$ | $d$ | numerator | $H_{\text{out}}$ |
|---|---|---|---|---|
| 0 | 1 | 1 | 8 | 9 |
| 1 | 1 | 1 | 10 | 11 |
| 1 | 2 | 1 | 10 | 6 |
| 0 | 2 | 1 | 8 | 5 |
| 2 | 1 | 2 | 10 | 11 |
| 0 | 1 | 2 | 6 | 7 |
| 0 | 3 | 1 | 8 | 3 |

In the last row $\lfloor 8/3 \rfloor = 2$: windows start at 0, 3 and 6 and read columns 0–2, 3–5
and 6–8. Columns 9 and 10 are never read. The floor discards input silently, and no framework
warns. [Lab 1](#lab1) checks all seven rows against PyTorch.
:::

**"Same" padding.** With $s = 1$ and $p = d(k-1)/2$ the numerator is $H - 1$, so
$H_{\text{out}} = H$. This needs $d(k-1)$ even, which at $d = 1$ means an odd kernel (3 × 3 with
$p = 1$, 5 × 5 with $p = 2$). An even kernel cannot be padded symmetrically; PyTorch's
`padding="same"` then puts the extra zero on the right and bottom, and refuses strides above 1.

**Stride 2.** With $k = 3$, $p = 1$, $s = 2$ the formula gives $\lfloor (H - 1)/2 \rfloor + 1$:
$H/2$ for even $H$, $(H + 1)/2$ for odd. "Stride 2 halves the size" is exact for even sizes; 7
becomes 4.

**Padding modes.** Zero padding is the default; reflect (mirror), replicate (repeat the edge
pixel) and circular (wrap around) fill the border from the image instead. The choice matters: with
zero padding a kernel near the border sees an artificial dark frame, so the network can learn
where the border is, and through it the absolute position of a feature, which an equivariant layer
is not supposed to know.

### The receptive field

The **receptive field** of a unit is the set of input positions that can influence it; along one
axis its size is $r$. Track two quantities through the layers: $r_l$, the field of a unit of layer
$l$, and the **jump** $\Delta_l$, the distance in input pixels between adjacent units of layer
$l$, starting from $r_0 = 1$ and $\Delta_0 = 1$. A unit of layer $l$ reads $k_l$ units of layer
$l - 1$ spaced $d_l$ apart, so its outermost inputs lie $(k_l - 1)\,d_l\,\Delta_{l-1}$ input pixels
apart, each bringing a field of $r_{l-1}$; its own stride multiplies the spacing of its units:

$$
r_l = r_{l-1} + (k_l - 1)\, d_l\, \Delta_{l-1}, \qquad \Delta_l = \Delta_{l-1}\, s_l.
$$

Pooling layers enter the same way, with their window as $k_l$, their stride as $s_l$ and
$d_l = 1$. Padding does not change $r$; it decides only how far the field hangs over the border.

**Small kernels, stacked.** Each 3 × 3 layer with stride 1 adds 2, so $n$ of them reach
$r = 2n + 1$. With $C$ channels in and out, two stacked 3 × 3 layers see what one 5 × 5 sees with
$18C^2$ weights instead of $25C^2$ (28% fewer), and three see what one 7 × 7 sees with $27C^2$
instead of $49C^2$ (45% fewer), with a nonlinearity between each layer. This is the whole design of
VGG ([Section 7](#s7)).

**Downsampling multiplies the jump.** After one stride-2 layer every further 3 × 3 adds 4 pixels
instead of 2; after five, 64. That is how a network reaches whole-image context in a few dozen
layers.

::: worked title="ResNet's stem, and VGG-16 layer by layer"
ResNet's stem on a 224 × 224 image is a 7 × 7 convolution with stride 2 and padding 3, then a
3 × 3 max pool with stride 2 and padding 1:

$$
\left\lfloor \tfrac{224 + 6 - 7}{2} \right\rfloor + 1 = 111 + 1 = 112, \qquad
\left\lfloor \tfrac{112 + 2 - 3}{2} \right\rfloor + 1 = 55 + 1 = 56.
$$

The convolution gives $r_1 = 1 + 6 \cdot 1 = 7$ with $\Delta_1 = 2$; the pool adds
$(3 - 1) \cdot 2 = 4$, so $r_2 = 11$ with $\Delta_2 = 4$, and each later 3 × 3 adds 8.

VGG-16 alternates 3 × 3 convolutions (stride 1) with 2 × 2 max pools (stride 2). In block $b$ the
jump is $2^{b-1}$, so each convolution adds $2^b$ and the pool $2^{b-1}$:

| Block | Layers | $r$ after each layer | Jump after the pool |
|---|---|---|---|
| 1 | conv1_1, conv1_2, pool1 | 3, 5, 6 | 2 |
| 2 | conv2_1, conv2_2, pool2 | 10, 14, 16 | 4 |
| 3 | conv3_1 to conv3_3, pool3 | 24, 32, 40, 44 | 8 |
| 4 | conv4_1 to conv4_3, pool4 | 60, 76, 92, 100 | 16 |
| 5 | conv5_1 to conv5_3, pool5 | 132, 164, 196, 212 | 32 |

Thirteen 3 × 3 layers without pooling would reach 27. With it, the last units see 212 × 212 of the
224 × 224 pixels: near-global context, but only at the last layer.
:::

**Dilation grows the field exponentially.** A 3 × 3 stack with $d = 1, 2, 4, 8$ adds $2d$ per
layer, $r = 3, 7, 15, 31$, where an undilated stack needs 15 layers to reach 31, and no
resolution is lost. Dilations sharing a common factor leave gaps: three layers at $d = 2$ read
only every second input, a pattern called gridding, which starting at $d = 1$ avoids. Figure 3.7
sets the three ways of growing the field side by side: stacking, striding and dilating.

::: figure id=fig-03-7
Receptive-field growth in 1D, three panels. Each shows a row of input dots and three layers above
it, with the cone of inputs reaching one top unit. Left: three 3-tap layers at stride 1, fields 3,
5, 7. Middle: the middle layer at stride 2, fields 3, 5, 9, with the jump of 2 labelled. Right:
dilations 1, 2, 4, fields 3, 7, 15, the dilated taps drawn as skipping lines.
:::

::: widget name=receptive-field-builder
Start from "three 3x3" with the effective-field shading on, then load "one 7x7": both have a
theoretical field of 7, but the stack puts about half its path mass in the central 3 × 3, the
single kernel under a fifth. Then set every dilation of "dilated 1-2-4-8" to 2 to see gridding.
:::

### The effective receptive field

The theoretical field says which pixels can influence a unit, not how much. Count the paths: in
three stacked 3-tap layers the centre input reaches the top unit along 7 paths and each outermost
input along 1, the per-axis counts 1, 3, 6, 7, 6, 3, 1 being the triple self-convolution of
(1, 1, 1). With $n$ layers the counts are the kernel's $n$-fold self-convolution, which by the
central limit theorem tends to a Gaussian whose width grows as $\sqrt{n}$, while the field grows as
$n$. Luo et al. (2016) measured this **effective receptive field**, where the gradient of an
output unit actually lands, and found it roughly Gaussian and much smaller than the theoretical
one. For SmallResNet's last stage ([Section 8](#s8)), theoretical field 49 × 49, [Lab 3](#lab3)
measures about 44% of the input-gradient mass inside the central 9 × 9 and 89% inside 25 × 25;
half of it lies within about 11 × 11, a twentieth of the theoretical area. Step 5 of that lab
plots the gradient map with the theoretical window and the contours that enclose 50% and 90% of
the mass.

This matters when objects are large. A network whose effective field is smaller than an object can
judge it only by local texture, and ImageNet-trained CNNs show the bias: given images whose shape
says one class and whose texture another, they mostly answer with the texture (Geirhos et al.
2019). The recurrence makes computing the field a five-minute task; Lab 3 shows how to look at the
effective one.

::: check
Input size 64, $k = 5$, $p = 2$, $s = 2$, $d = 1$: what is the output size?
:::

::: answer
$\lfloor (64 + 4 - 5)/2 \rfloor + 1 = \lfloor 31.5 \rfloor + 1 = 32$.
:::

::: check
Four 3 × 3 layers are stacked, the second with stride 2 and the others with stride 1. What is the
receptive field after each layer?
:::

::: answer
3, 5, 9, 13. The first two layers add 2 each; the second's stride makes the jump 2, so the third
and fourth add $2 \times 2 = 4$ each.
:::

::: check
SmallResNet's theoretical receptive field is 49 × 49, but its inputs are 32 × 32. How can the
field be larger than the image?
:::

::: answer
The windows extend over the padding. Every unit of the last stage can see the whole image plus
border, but its effective field is concentrated near its centre.
:::

## Channels, parameters and FLOPs {#s4}

Real inputs have several channels (red, green and blue, or the fields of a simulation), and every
layer after the first produces many. The single-channel layer generalises by summing over input
channels:

$$
Y_{c,i,j} = b_c + \sum_{c'=1}^{C_{\text{in}}} \sum_{u=0}^{k-1}\sum_{v=0}^{k-1}
K_{c,c',u,v}\, X_{c',\, i+u,\, j+v}.
$$

The weight tensor has shape $(C_{\text{out}}, C_{\text{in}}, k, k)$, and PyTorch stores
activations as $(B, C, H, W)$, channels first; TensorFlow defaults to channels last,
$(B, H, W, C)$. Each output channel $c$ has one **filter** $K_{c,\cdot,\cdot,\cdot}$ of shape
$C_{\text{in}} \times k \times k$, which looks at a $k \times k$ patch through every input channel
at once and sums the results into one number. The map a filter produces as it slides is one
**feature map**; a layer is $C_{\text{out}}$ filters producing $C_{\text{out}}$ feature maps, the
next layer's channels (Figure 3.9).

::: figure id=fig-03-9
A multi-channel convolution as blocks: an input tensor of $C_{\text{in}} \times H \times W$; one
filter of $C_{\text{in}} \times k \times k$ sliding through it to produce one output map;
$C_{\text{out}}$ such filters stacked to give the output of
$C_{\text{out}} \times H_{\text{out}} \times W_{\text{out}}$; the weight tensor's shape
$(C_{\text{out}}, C_{\text{in}}, k, k)$ labelled.
:::

### The layer as one matrix multiply

For a fixed output position, the sum over $(c', u, v)$ is a dot product between the filter,
flattened to length $C_{\text{in}}k^2$, and the window, flattened the same way. Collect every
window as one column of a matrix $\mathbf{X}_{\text{col}}$ of shape
$C_{\text{in}}k^2 \times H_{\text{out}}W_{\text{out}}$, a step called **im2col** ("image to
columns"), and stack the $C_{\text{out}}$ flattened filters as the rows of $\mathbf{W}$. The whole
layer is then one matrix product,

$$
\underbrace{\mathbf{W}}_{C_{\text{out}} \times C_{\text{in}}k^2}\;
\underbrace{\mathbf{X}_{\text{col}}}_{C_{\text{in}}k^2 \times H_{\text{out}}W_{\text{out}}},
$$

plus the bias, reshaped to $(C_{\text{out}}, H_{\text{out}}, W_{\text{out}})$. This is how CPU
libraries and many GPU kernels compute convolutions, because matrix multiplication is the most
heavily optimised routine in numerical computing; FFT-based and Winograd algorithms exist for some
shapes. The price is memory: at stride 1 each input value is copied into up to $k^2$ columns, so a
3 × 3 layer's column matrix is about nine times its input. PyTorch exposes im2col as `F.unfold`:

```python
import torch
import torch.nn.functional as F

torch.manual_seed(0)
x = torch.randn(1, 64, 56, 56)                  # one image with 64 channels
w = torch.randn(128, 64, 3, 3)                  # 128 filters, each 64 x 3 x 3
cols = F.unfold(x, kernel_size=3, padding=1)    # im2col: one column per position
y = (w.reshape(128, -1) @ cols).reshape(1, 128, 56, 56)
print(tuple(cols.shape), cols.numel() / x.numel())
print(torch.allclose(y, F.conv2d(x, w, padding=1), atol=1e-3))
```

```output
(1, 576, 3136) 9.0
True
```

### Counting parameters, MACs and FLOPs

Read the counts off the equation. Each output channel has $k^2 C_{\text{in}}$ weights and a bias,
so a layer has $k^2 C_{\text{in}} C_{\text{out}} + C_{\text{out}}$ parameters. Each output value
costs $k^2 C_{\text{in}}$ **multiply-accumulates** (MACs), one multiplication and one addition
each, and there are $C_{\text{out}} H_{\text{out}} W_{\text{out}}$ output values:

$$
\text{MACs} = k^2 C_{\text{in}} C_{\text{out}} H_{\text{out}} W_{\text{out}}, \qquad
\text{FLOPs} = 2 \times \text{MACs}.
$$

The factor 2 is the counting behind the "2N FLOPs per forward pass" of
[Module 02, Section 2](module_02_EN.html#s2).

::: note
**The conventions of this module.** Counts are given in MACs, with FLOPs = 2 × MACs; bias
additions, activations, normalisation and pooling are left out unless stated. Many papers report
multiply-adds and call them FLOPs, among them ResNet, EfficientNet and ConvNeXt; MobileNet calls
them Mult-Adds. Check a paper's convention before comparing its numbers with yours. Memory computed
from tensor sizes is in binary units (1 MiB = 2²⁰ bytes, 1 GiB = 2³⁰ bytes); download sizes are
decimal MB, as published; where the two differ noticeably both are given once (574 MiB, 602 MB in
[Section 1](#s1)). The series' FLOP convention for transformers belongs to
[Module 06, Section 11](module_06_EN.html#s11); nothing in this module needs it.
:::

::: worked title="One layer, counted four ways"
A 3 × 3 convolution from 64 to 128 channels producing a 56 × 56 map (padding 1, stride 1).

**Parameters:** $3 \cdot 3 \cdot 64 \cdot 128 + 128 = 73{,}728 + 128 = 73{,}856$.

**MACs:** each of the 73,728 weights is used once per output position:
$73{,}728 \times 56 \times 56 = 73{,}728 \times 3{,}136 = 231{,}211{,}008$.

**FLOPs:** $2 \times 231{,}211{,}008 = 462{,}422{,}016$, about 462 million. Counting the
$128 \times 3{,}136 = 401{,}408$ bias additions as well gives 462,823,424, which rounds to
463 MFLOPs. Both are right under their convention, which is why every count here states its
convention.

**im2col:** the column matrix has $64 \times 9 = 576$ rows and 3,136 columns, 1,806,336 entries,
or 7,225,344 bytes (6.9 MiB) in float32: 9.0 times the $64 \times 56 \times 56 = 200{,}704$
entries of the input. The layer is the product $(128 \times 576)(576 \times 3{,}136)$.
:::

### Where the parameters and the compute live

Parameters, $k^2 C_{\text{in}}C_{\text{out}} + C_{\text{out}}$, do not depend on $H$ and $W$;
compute is proportional to $H_{\text{out}}W_{\text{out}}$. Early layers, at high resolution with
few channels, dominate the compute. Late layers, with many channels at low resolution, and above
all dense heads, dominate the parameters.

::: worked title="VGG-16 and ResNet-18, counted from their layer lists"
VGG-16 is thirteen 3 × 3 convolutions (padding 1) in five blocks separated by 2 × 2 max pools,
then three dense layers. A short script counts it:

```python
# VGG-16 on a 224x224 image, counted from its layer list
cfg = [64, 64, "M", 128, 128, "M", 256, 256, 256, "M",
       512, 512, 512, "M", 512, 512, 512, "M"]       # "M" is a 2x2 max pool
H, C, params, macs = 224, 3, 0, 0
for v in cfg:
    if v == "M":
        H //= 2                                    # pooling halves the map
        continue
    params += 3 * 3 * C * v + v                    # weights + biases
    macs += 3 * 3 * C * v * H * H                  # padding 1: output is H x H
    C = v
conv_params, conv_macs = params, macs
for n_in, n_out in [(512 * 7 * 7, 4096), (4096, 4096), (4096, 1000)]:
    params += n_in * n_out + n_out                 # fc6, fc7, fc8
    macs += n_in * n_out
print(f"parameters {params:,}, of which dense {params - conv_params:,}")
print(f"MACs: convolutions {conv_macs / 1e9:.2f} G, dense {(macs - conv_macs) / 1e9:.2f} G")
```

```output
parameters 138,357,544, of which dense 123,642,856
MACs: convolutions 15.35 G, dense 0.12 G
```

The three dense layers hold 89% of the parameters and perform 0.8% of the multiply-adds. Per layer
the contrast is starker: conv1_2 has 36,928 parameters and performs 1.85 G MACs; fc6 has 102.8
million parameters and performs 0.10 G.

Counted the same way, ResNet-18 at 224 × 224 has 11,689,512 parameters (batch-norm scales and
shifts included) and 1.81 G MACs. Its paper's Table 1 lists "1.8 × 10⁹ FLOPs" for it, so the
paper's FLOPs are multiply-adds.
:::

### Memory, the backward pass and the bias

**Activation memory.** An output of shape $(C, H, W)$ in float32 takes $4CHW$ bytes per image, and
training keeps it until the backward pass has used it, which is why training memory scales with
depth times batch ([Module 02, Section 3](module_02_EN.html#s3)). The 64 → 128 layer's output is
$128 \times 56 \times 56 \times 4 = 1{,}605{,}632$ bytes, 1.53 MiB per image and 392 MiB (411 MB)
for a batch of 256, against 0.28 MiB for the layer's parameters.

**Backward cost.** The backward pass computes two convolutions with as many MACs as the forward
one ([Section 2](#s2)), the input gradient and the weight gradient, so a training step costs about
three times the forward FLOPs: about 1.39 GFLOPs per image for the layer above, slightly less for
a first layer, whose input gradient is not needed.

**Bias and batch normalisation.** A convolution followed directly by batch normalisation needs no
bias: batch normalisation subtracts each channel's mean over the batch, which removes any constant
$b_c$ added before it, and then adds its own learned shift. Hence `bias=False` in the convolutions
of [Section 8](#s8)'s code; the normalisation itself is
[Module 02, Section 10](module_02_EN.html#s10)'s.

::: keyidea
Parameters depend on kernel size and channels only; compute also scales with the output area.
Every count should say whether it is MACs or FLOPs.
:::

::: check
A 5 × 5 convolution maps 3 channels to 16, with bias, and produces a 32 × 32 output. How many
parameters does it have, and how many MACs does it perform?
:::

::: answer
Parameters: $5 \cdot 5 \cdot 3 \cdot 16 + 16 = 1{,}216$. MACs:
$1{,}200 \times 32 \times 32 = 1{,}228{,}800$, the same number as the locally connected weights
of [Section 1](#s1)'s first check, because a locally connected layer has one weight for every
multiply-accumulate that the convolution performs with a shared one.
:::

::: check
Doubling an input's height and width changes a convolution layer's parameters and FLOPs how?
:::

::: answer
The parameters are unchanged; the FLOPs grow fourfold, with the output area.
:::

::: check
A paper says a network costs "4 GFLOPs"; your script counts 8 × 10⁹ floating-point operations.
What do you check first?
:::

::: answer
Whether the paper counts multiply-adds as FLOPs: 4 G multiply-adds are 8 GFLOPs, so the two
counts may agree.
:::

## Pooling, downsampling and invariance {#s5}

A classifier must turn a 224 × 224 map into one label, and it should not pay full-resolution
prices all the way. Both needs are met by reducing resolution as the network deepens.

**Max pooling** takes the maximum over each 2 × 2 window with stride 2: it halves $H$ and $W$,
keeps each window's strongest response and has no parameters. Since $\max(x_1, \dots, x_4)$ has
derivative 1 with respect to its largest input and 0 with respect to the others, the backward pass
sends each window's gradient entirely to the position that held the maximum (PyTorch picks the
first on a tie). **Average pooling** averages each window and passes a quarter of the gradient to
each position.

**Global average pooling** (GAP) averages each channel's entire map to one number, turning
$C \times H \times W$ into $C$. It replaces the giant dense layers that ended early networks and
lets a network accept any input size.

::: worked title="Two heads on VGG-16's last feature map"
VGG-16's last pooling layer outputs 7 × 7 × 512.

**Flatten and dense.** The $7 \cdot 7 \cdot 512 = 25{,}088$ values feed 4,096 units:
$25{,}088 \times 4{,}096 + 4{,}096 = 102{,}764{,}544$ parameters for fc6 alone, each input weight
tied to one position.

**GAP and dense.** Each of the 512 maps is averaged to one number, and 512 inputs feed 1,000
classes: $512 \times 1{,}000 + 1{,}000 = 513{,}000$ parameters, 200 times fewer than fc6, with no
weight tied to a position.

On a 448 × 448 input the last map is 14 × 14 × 512: the flatten head expects 25,088 inputs and
receives 100,352, so it fails, while GAP still returns 512 numbers.
:::

::: figure id=fig-03-13
Two classifier heads on the same final feature map. Flatten + dense: all $C \cdot H \cdot W$
values enter, each with position-specific weights; VGG-16's 7 × 7 × 512 = 25,088 inputs into
4,096 units take 102.8 million parameters. Global average pooling + dense: each channel is
averaged to one number, so only $C$ values enter; 512 inputs into 1,000 classes take 0.5 million.
:::

**Strided convolution** also halves the map, but its weights decide what to keep, where a max pool
always keeps the largest value, and modern networks often downsample this way. ResNet moves between
stages with stride-2 convolutions, a strided 1 × 1 on the shortcut ([Section 8](#s8)); ConvNeXt
uses separate downsampling layers, a normalisation and a 2 × 2 convolution with stride 2
([Section 9](#s9)).

### Invariance is only approximate

Pooling is often said to make a network translation invariant. It gives only a little invariance,
and only for some shifts. A stride-2 operation is equivariant only to shifts by multiples of 2: a
shift of two input pixels moves the output by one cell, but a shift of one pixel changes which
pixels share a window.

::: worked title="Max pooling under a one-pixel shift"
$$
X = \begin{bmatrix} 1&3&2&0 \\ 4&2&1&1 \\ 0&1&5&2 \\ 2&2&3&4 \end{bmatrix}
\;\to\;
\begin{bmatrix} 4&2 \\ 2&5 \end{bmatrix}.
$$

Shift one column left, dropping the first column and appending zeros. The windows now pair
different pixels:

$$
\begin{bmatrix} 3&2&0&0 \\ 2&1&1&0 \\ 1&5&2&0 \\ 2&3&4&0 \end{bmatrix}
\;\to\;
\begin{bmatrix} 3&1 \\ 5&4 \end{bmatrix}.
$$

Every output has changed, although the image content has barely moved. Shift two columns instead
and the output is
$\left[\begin{smallmatrix} 2&0 \\ 5&0 \end{smallmatrix}\right]$: the original right column
(2, 5) moved one cell left, as equivariance under stride 2 predicts.
:::

This is **aliasing**, as in signal processing: subsampling a signal that contains frequencies
above half the new sampling rate folds them into spurious low frequencies, so the result depends
on where the samples fall. The classical remedy is a low-pass filter before subsampling. Zhang
(2019) blurs before each strided operation ("anti-aliased" pooling) and reports more shift-stable
outputs; Azulay and Weiss (2019) document modern CNNs whose predictions change under one-pixel
shifts.

[Lab 2](#lab2) measures the effect on 8 × 8 digits. A CNN with two 2 × 2 max pools and a
flatten-and-dense head scores about 98.4% on the centred test images and about 66% when they move
one pixel to the right; an MLP of the same size falls from about 97% to 44%. On digits placed at
random on a 16 × 16 canvas, the same convolutions with a third layer reach about 93% with GAP and
89% with a flatten head (Figure 3.13 contrasts the two heads).
Equivariant layers do not by themselves make an invariant classifier: the head and the training
data decide.

### Why downsample

Each halving of $H$ and $W$ cuts the FLOPs of every later layer by 4 ([Section 4](#s4)). It
doubles the jump, so later layers grow the receptive field twice as fast ([Section 3](#s3)). And
the usual convention of halving $H$ and $W$ while doubling $C$ keeps the compute per layer roughly
constant across stages, because doubling $C$ multiplies $C_{\text{in}} C_{\text{out}}$ by 4 while
halving the map divides $H_{\text{out}} W_{\text{out}}$ by 4.

::: worked title="Constant compute per stage"
SmallResNet ([Section 8](#s8)) on a 32 × 32 input has stages at 32 × 32 with 32 channels, 16 × 16
with 64, 8 × 8 with 128 and 4 × 4 with 256. The second convolution of each stage, 3 × 3 from $C$
to $C$ channels, costs

$$
9 \cdot 32 \cdot 32 \cdot 32 \cdot 32 = 9 \cdot 64 \cdot 64 \cdot 16 \cdot 16
= 9 \cdot 128 \cdot 128 \cdot 8 \cdot 8 = 9 \cdot 256 \cdot 256 \cdot 4 \cdot 4
= 9{,}437{,}184 \text{ MACs}.
$$

VGG-16 shows the same pattern: conv1_2, conv2_2, conv3_2 and conv4_2 each cost 1.85 G MACs.
:::

::: keyidea
Pooling and striding buy compute and receptive field; translation invariance they buy only
approximately, and the head and the data decide how much.
:::

::: check
Where does the gradient go in the backward pass of 2 × 2 max pooling?
:::

::: answer
Entirely to the position that held each window's maximum; the other three positions receive
zero.
:::

::: check
A network ending in global average pooling was trained on 32 × 32 images and is given 48 × 48
ones. Does it run, and can you trust the answer?
:::

::: answer
It runs, because GAP returns $C$ numbers at any input size. But objects now sit at a different
scale relative to the receptive fields the network learned with, so test it at the new size
before trusting it.
:::
