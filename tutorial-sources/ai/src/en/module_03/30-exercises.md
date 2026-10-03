## Exercises {#exercises}

Fifteen exercises, graded by the effort they ask for. A one-star exercise (★) is conceptual and
takes about five minutes: answer it in a few sentences. A two-star exercise (★★) is a derivation or
a calculation of about ten minutes, to be done on paper with a calculator. The one three-star
exercise (★★★) is a project of about 25 minutes that needs code. There are seven of the first
kind (35 minutes), seven of the second (70 minutes) and one of the third, 130 minutes in all. The
study plan places each exercise after the reading it tests, so that no reading block runs on
without something to do.

Attempt every exercise before you open its solution. The solutions are hidden until you open them,
and they are written to be read in full: each gives the answer first, then every step and the
reason for taking it, and every number in them was computed and checked. Where a solution
includes code, the code was run and the output shown is what it printed; the last digits may
differ on your machine. If your answer differs from the solution's, find the first line where the
two part company before you read on. A wrong number with a correct method is usually a slip. A
correct number reached by a different method is worth comparing with the solution's, because the
difference often shows an assumption. The exercises use numbers of their own: none repeats a
worked example or a check from the text, apart from Exercises 4 and 8, which refer to results of
[Lab 2](#lab2) and [Lab 4](#lab4).

::: exercise id=e1 level=2 kind=calculation minutes=10
**Output sizes, and the rows a window never reads.** A 7 × 7 single-channel input is convolved
with a 3 × 3 kernel. Padding $p$, stride $s$ and dilation $d$ are the same along both axes.

(a) Give the output size for $(p, s, d) = (0,1,1)$, $(1,1,1)$, $(1,2,1)$, $(0,1,2)$ and
$(0,2,2)$.

(b) For the two stride-2 cases, list the input rows that each output row reads. Which input rows,
if any, are never read?

(c) What padding keeps the output at 7 × 7 with dilation 2 and stride 1?
:::

::: solution
**(a) The sizes.** The formula of [Section 3](#s3) counts window positions. A window of a
$3 \times 3$ kernel with dilation $d$ spans $d(k-1) + 1$ cells; after padding the axis has
$H + 2p$ cells. Windows start at cells $0, s, 2s, \dots$, and the last start is the one that still
leaves room for the span, at $H + 2p - d(k-1) - 1$. Counting the starts gives

$$
H_{\text{out}} = \left\lfloor \frac{H + 2p - d(k-1) - 1}{s} \right\rfloor + 1 .
$$

With $H = 7$ and $k = 3$ the numerator is $7 + 2p - 2d - 1 = 6 + 2p - 2d$:

| $(p, s, d)$ | span | numerator | output size |
|---|---|---|---|
| $(0, 1, 1)$ | 3 | 4 | $\lfloor 4/1 \rfloor + 1 = 5$ |
| $(1, 1, 1)$ | 3 | 6 | $\lfloor 6/1 \rfloor + 1 = 7$ |
| $(1, 2, 1)$ | 3 | 6 | $\lfloor 6/2 \rfloor + 1 = 4$ |
| $(0, 1, 2)$ | 5 | 2 | $\lfloor 2/1 \rfloor + 1 = 3$ |
| $(0, 2, 2)$ | 5 | 2 | $\lfloor 2/2 \rfloor + 1 = 2$ |

The sizes are 5, 7, 4, 3 and 2, along each axis, so the outputs are $5 \times 5$, $7 \times 7$,
$4 \times 4$, $3 \times 3$ and $2 \times 2$.

**(b) What the stride-2 windows read.** Work in padded coordinates, where padded cell $q$ is input
row $q - p$; cells that fall outside $0, \dots, 6$ are padding.

- $(1, 2, 1)$: the padded axis has 9 cells, $0$ to $8$. Windows start at $0, 2, 4, 6$ and read the
  padded cells $\{0,1,2\}$, $\{2,3,4\}$, $\{4,5,6\}$ and $\{6,7,8\}$. Subtracting $p = 1$, the output
  rows read the input rows $\{-1,0,1\}$, $\{1,2,3\}$, $\{3,4,5\}$ and $\{5,6,7\}$, where $-1$ and
  $7$ are padding. **Every input row is read.** Rows 1, 3 and 5 are read twice, because a window of
  width 3 at stride 2 overlaps its neighbour by $k - s = 1$ row; rows 0, 2, 4 and 6 are read once.
- $(0, 2, 2)$: no padding, and each window spans 5 cells. Windows start at $0$ and $2$ (the next
  start, $4$, would end at row 8). Their taps are rows $\{0, 2, 4\}$ and $\{2, 4, 6\}$. **Rows 1, 3
  and 5 are never read.**

The second case is not an accident of the size. Every window starts at a multiple of the stride,
$t = s m$, and reads $t, t + d, t + 2d$, so every row it reads is a multiple of $\gcd(s, d)$.
Here $\gcd(2, 2) = 2$ and only even rows are visible. It is the same defect as the gridding of a
dilated stack in [Section 3](#s3), arriving through the stride instead of through repeated
dilations. In two dimensions it is worse: only the 16 pixels with both coordinates even are read,
a third of the 49.

**(c) 'Same' padding with dilation.** Stride 1 and a numerator of $H - 1$ keep the size, so
$H + 2p - d(k-1) - 1 = H - 1$, which gives $p = d(k-1)/2$. With $d = 2$ and $k = 3$ that is
$p = 2$, and indeed $\lfloor (7 + 4 - 4 - 1)/1 \rfloor + 1 = 7$. The span of the dilated kernel is
5, so it needs the same border as a $5 \times 5$ kernel.

The loop below checks all of it with PyTorch. It runs one axis as a 1D convolution of ones and
reads off the gradient of the output's sum with respect to each input cell, which is the number of
windows that read it.

```python
import torch
import torch.nn as nn

def rows_read(h, k, p, s, d):
    """Output length, and how many windows read each input row (one axis)."""
    conv = nn.Conv1d(1, 1, k, stride=s, padding=p, dilation=d, bias=False)
    nn.init.ones_(conv.weight)
    x = torch.ones(1, 1, h, requires_grad=True)
    y = conv(x)
    y.sum().backward()          # d(sum y)/dx[i] = number of windows that read x[i]
    return y.shape[-1], x.grad[0, 0].int().tolist()

for p, s, d in [(0, 1, 1), (1, 1, 1), (1, 2, 1), (0, 1, 2), (0, 2, 2), (2, 1, 2)]:
    size, counts = rows_read(7, 3, p, s, d)
    print(f"p={p} s={s} d={d}: output {size}, reads per row {counts}")
```

```output
p=0 s=1 d=1: output 5, reads per row [1, 2, 3, 3, 3, 2, 1]
p=1 s=1 d=1: output 7, reads per row [2, 3, 3, 3, 3, 3, 2]
p=1 s=2 d=1: output 4, reads per row [1, 2, 1, 2, 1, 2, 1]
p=0 s=1 d=2: output 3, reads per row [1, 1, 2, 1, 2, 1, 1]
p=0 s=2 d=2: output 2, reads per row [1, 0, 2, 0, 2, 0, 1]
p=2 s=1 d=2: output 7, reads per row [2, 2, 3, 3, 3, 2, 2]
```

The output sizes agree with the formula, the rows read by $(1, 2, 1)$ and $(0, 2, 2)$ are the
ones listed above, and the last line is part (c). A shape that comes out right does not show
that every input was used: the $(0, 2, 2)$ layer returns a perfectly ordinary $2 \times 2$ map
while ignoring two thirds of its input.
:::

::: exercise id=e2 level=2 kind=derivation minutes=10
**Three ways to a 9 × 9 receptive field.** (a) Show that $n$ stacked $k \times k$ convolutions with
stride 1 have the receptive field of a single convolution of size $n(k-1) + 1$.

(b) With $C$ input and $C$ output channels in every layer and no biases, compare three ways of
reaching a $9 \times 9$ field: one $9 \times 9$ layer, two $5 \times 5$ layers and four
$3 \times 3$ layers. Count the weights, the multiply-accumulates per output position and the
nonlinearities (one after each layer).

(c) Generalise to $n$ stacked $3 \times 3$ layers against one $(2n+1) \times (2n+1)$ layer. What
fraction of the weights does the stack use as $n$ grows, and what does it give up?
:::

::: solution
**(a) The field of a stack.** Work along one axis. A single layer's unit reads $k$ consecutive
inputs, so $r_1 = k$. Suppose a unit of layer $n - 1$ depends on a window of $r_{n-1}$ consecutive
inputs. A unit of layer $n$ reads $k$ adjacent units of layer $n - 1$, and adjacent units have
windows shifted by one input, because the stride is 1. The union of $k$ windows of width $r_{n-1}$,
each shifted by one cell from the last, is a window of width $r_{n-1} + (k - 1)$. So
$r_n = r_{n-1} + (k - 1)$, which is the recurrence of [Section 3](#s3) with every jump equal to 1
and every dilation equal to 1. Starting from $r_0 = 1$ (a unit sees only itself),

$$
r_n = 1 + n(k - 1) .
$$

For $k = 3$ this is $2n + 1$, for $k = 5$ it is $4n + 1$, and a $9 \times 9$ field needs
$n(k-1) = 8$: $(k, n) = (9, 1)$, $(5, 2)$ or $(3, 4)$.

**(b) The three designs.** A $k \times k$ layer with $C$ channels in and out has $k^2 C^2$ weights.
At stride 1 with 'same' padding it computes one output vector at every position, and each weight is
used once per position, so the multiply-accumulates per output position equal the weights
([Section 4](#s4)):

| Design | Field | Weights | MACs per position | Nonlinearities |
|---|---|---|---|---|
| one $9 \times 9$ | 9 | $81\,C^2$ | $81\,C^2$ | 1 |
| two $5 \times 5$ | 9 | $2 \cdot 25\,C^2 = 50\,C^2$ | $50\,C^2$ | 2 |
| four $3 \times 3$ | 9 | $4 \cdot 9\,C^2 = 36\,C^2$ | $36\,C^2$ | 4 |

For concreteness take $C = 32$ on a $40 \times 40$ map (1,600 positions): the weights are 82,944,
51,200 and 36,864, and the layers cost 132.7, 81.9 and 59.0 million MACs. The deepest stack is the
cheapest, with less than half the weights of the single layer, and it has the most nonlinearities.
This is the argument for VGG in [Section 7](#s7) taken two steps further: each step trades a
large kernel for a deeper stack of small ones.

**(c) The general stack.** $n$ layers of $3 \times 3$ reach the field $2n + 1$ and use $9n\,C^2$
weights; one $(2n+1)^2$ layer uses $(2n+1)^2 C^2$. The fraction is

$$
f(n) = \frac{9n}{(2n+1)^2} .
$$

It equals 1 at $n = 1$ (the same layer), 72% at $n = 2$, $36/81 = 44\%$ at $n = 4$ and
$90/441 = 20\%$ at $n = 10$. For large $n$, $(2n+1)^2 \approx 4n^2$, so $f(n) \to 9/(4n)$: the
stack's cost grows linearly in the field's width while the single kernel's grows quadratically.
At $n = 100$ the stack uses 2.2% of the weights, close to the approximation $9/400 = 2.25\%$.

**What the stack gives up.**

1. *Expressiveness of a single linear map.* Without the nonlinearities a stack composes into one
   convolution, but only into those $(2n+1) \times (2n+1)$ kernels that factor as a chain of
   $3 \times 3$ kernels. For $C = 1$ and $n = 2$ that is a family of at most 18 parameters (17 once
   you divide one kernel by a constant and multiply the other) inside the 25 values of a
   $5 \times 5$ kernel: a generic $5 \times 5$ kernel is not the convolution of two $3 \times 3$
   ones. With the nonlinearities in between the stack computes a different, richer kind of
   function, not a subset of the single layer's, but it cannot represent every kernel the big
   layer can.
2. *The shape of the field.* The stack's effective receptive field is concentrated at the centre,
   Gaussian-like ([Section 3](#s3)); the single kernel can weight the edge of its window as heavily
   as the centre. A task that depends on a thin ring at a fixed distance is easier for the kernel.
3. *Memory.* Each extra layer stores another activation map for the backward pass: four maps of
   $C$ channels for the stack against one for the single layer, which at high resolution is often
   a tighter constraint than the weights ([Section 4](#s4)).
4. *Depth.* Four layers run one after another, which costs latency on parallel hardware, and each
   adds to the depth the optimiser has to get through ([Section 8](#s8)).

The check below builds the three designs with positive weights and no nonlinearity, so that no
path can cancel, and measures the field as the extent of the gradient of the central output.

```python
import torch
import torch.nn as nn

def stack(kernel_sizes, channels=4):
    """Stride-1 'same' convolutions with positive weights and no nonlinearity."""
    layers = []
    for k in kernel_sizes:
        conv = nn.Conv2d(channels, channels, k, padding=k // 2, bias=False)
        nn.init.uniform_(conv.weight, 0.1, 1.0)   # positive: no path can cancel
        layers.append(conv)
    return nn.Sequential(*layers)

for name, ks in [("one 9x9", [9]), ("two 5x5", [5, 5]), ("four 3x3", [3, 3, 3, 3])]:
    net = stack(ks)
    x = torch.ones(1, 4, 31, 31, requires_grad=True)
    net(x)[0, 0, 15, 15].backward()               # centre output unit
    rows = (x.grad[0].sum(dim=(0, 2)) != 0).nonzero().flatten()
    field = rows.max().item() - rows.min().item() + 1
    weights = sum(p.numel() for p in net.parameters())
    # 4 channels in and out, so weights = (number of layers) * k^2 * C^2 with C^2 = 16
    print(f"{name}: field {field}, weights {weights}, per C^2 {weights // 16}")
```

```output
one 9x9: field 9, weights 1296, per C^2 81
two 5x5: field 9, weights 800, per C^2 50
four 3x3: field 9, weights 576, per C^2 36
```

All three see $9 \times 9$, and the weights per $C^2$ (the stacks have $C = 4$, so $C^2 = 16$) are
81, 50 and 36, as derived.
:::

::: exercise id=e3 level=2 kind=calculation minutes=10
**The receptive field of ResNet-18.** ResNet-18 at $224 \times 224$ begins with the stem of
[Section 3](#s3)'s worked example (a $7 \times 7$ convolution with stride 2 and padding 3, then a
$3 \times 3$ max pool with stride 2 and padding 1) and continues with four stages of two basic
blocks each. A basic block is two $3 \times 3$ convolutions with padding 1; the first convolution
of stages 2, 3 and 4 has stride 2 and its block's shortcut is a $1 \times 1$ projection with
stride 2; every other convolution has stride 1.

(a) Compute the receptive field and the jump after the pool and after each stage.

(b) How large is the last feature map, what is the theoretical field of each of its units, and how
can that exceed 224?

(c) In the first block of stage 2, compare the field reached through the main path with the one
reached through the projection shortcut. What does a path that takes every shortcut see?
:::

::: solution
**(a) The recurrence.** From [Section 3](#s3): $r_l = r_{l-1} + (k_l - 1)\,d_l\,\Delta_{l-1}$ and
$\Delta_l = \Delta_{l-1}\,s_l$, from $r_0 = 1$, $\Delta_0 = 1$. The new taps of a layer lie
$(k_l - 1)$ units apart in the previous layer, and a unit of the previous layer is $\Delta_{l-1}$
input pixels from its neighbour; the layer's own stride then widens the spacing for the layers
above it, so it enters $\Delta$ after $r$.

- Stem: the convolution gives $r = 1 + 6 \cdot 1 = 7$ and $\Delta = 2$; the pool adds
  $2 \cdot 2 = 4$: $r = 11$, $\Delta = 4$.
- Stage 1 (stride 1 throughout): four convolutions at jump 4 add $2 \cdot 4 = 8$ each:
  $19, 27, 35, 43$. The jump stays 4.
- Stage 2: the first convolution has stride 2. It still adds $2 \cdot 4 = 8$, because the
  recurrence uses the jump of the layer *below* it ($43 \to 51$), and only then makes the jump 8.
  The other three add $2 \cdot 8 = 16$ each: $67, 83, 99$.
- Stage 3: $99 + 16 = 115$ (jump becomes 16), then $+32$ three times: $147, 179, 211$.
- Stage 4: $211 + 32 = 243$ (jump becomes 32), then $+64$ three times: $307, 371, 435$.

| After | $r$ | $\Delta$ | map size |
|---|---|---|---|
| stem convolution | 7 | 2 | 112 |
| max pool | 11 | 4 | 56 |
| stage 1 | 43 | 4 | 56 |
| stage 2 | 99 | 8 | 28 |
| stage 3 | 211 | 16 | 14 |
| stage 4 | 435 | 32 | 7 |

There is a closed form to check the arithmetic against. A stage whose first convolution has
stride 2 adds $2\Delta + 3 \cdot 2 \cdot 2\Delta = 14\Delta$ to the field, with $\Delta$ the jump
entering the stage: $43 + 14 \cdot 4 = 99$, $99 + 14 \cdot 8 = 211$ and $211 + 14 \cdot 16 = 435$.
Stage 1 adds $4 \cdot 2 \cdot 4 = 32$.

```python
# Receptive field and jump through ResNet-18 at 224 x 224 (one axis).
layers = [("stem conv 7x7/2", 7, 2), ("max pool 3x3/2", 3, 2)]
for stage, first_stride in zip(range(1, 5), [1, 2, 2, 2]):
    for block in range(2):
        for conv in range(2):
            stride = first_stride if (block == 0 and conv == 0) else 1
            label = f"stage {stage} block {block + 1} conv {conv + 1}"
            layers.append((label, 3, stride))

r, jump = 1, 1
for name, k, s in layers:
    r += (k - 1) * jump          # the new taps lie (k - 1) units of the old jump apart
    jump *= s                    # then the stride widens the spacing of the units
    if "stem" in name or "pool" in name or name.endswith("block 2 conv 2"):
        print(f"{name:28s} r = {r:3d}  jump = {jump}")
```

```output
stem conv 7x7/2              r =   7  jump = 2
max pool 3x3/2               r =  11  jump = 4
stage 1 block 2 conv 2       r =  43  jump = 4
stage 2 block 2 conv 2       r =  99  jump = 8
stage 3 block 2 conv 2       r = 211  jump = 16
stage 4 block 2 conv 2       r = 435  jump = 32
```

**(b) The last map, and a field larger than the image.** The map sizes follow the formula of
[Section 3](#s3): $224 \to 112 \to 56 \to 56 \to 28 \to 14 \to 7$, so the last map is $7 \times 7$
(with 512 channels in the real network). Each of its units has a theoretical field of
$435 \times 435$, nearly twice the image's side. The window of a unit runs over the zero padding
at every layer, and those padded positions are counted although they hold nothing. With these
paddings the unit at index $i$ is centred on input position $32\,i$, so its field covers
$32\,i - 217$ to $32\,i + 217$. The central units see everything. The corner unit, $i = 0$, covers
$-217$ to $217$, so it sees the first 218 rows and columns and never the last 6. A theoretical field
beyond the image says that the unit *can* see all of it, not that it does; the effective field is
far smaller ([Section 3](#s3), and [Lab 3](#lab3) for a measured case).

**(c) The shortcut and the main path.** In the first block of stage 2 the input has $r = 43$ and
$\Delta = 4$. The main path is two $3 \times 3$ convolutions, the first with stride 2: $r = 51$,
then $67$, as in part (a). The projection is a $1 \times 1$ convolution with stride 2: it adds
$(1 - 1) \cdot 4 = 0$, so the field stays 43, while its stride makes the jump 8 so that its output
sits on the same grid as the main path's. The block's output is the sum of features that look at
$67 \times 67$ and at $43 \times 43$ pixels. A path that takes every shortcut skips all the
branches, and the $1 \times 1$ projections add nothing, so it sees only what the stem sees, 11 pixels. A
unit of the last map is a sum over many paths whose fields range from 11 to 435.

The second check builds the real shapes with positive weights, no ReLU and no normalisation (and
average pooling in place of max pooling, which would route the gradient to a single cell of each
window and hide the theoretical field), and finds the rows of the input that influence one unit.

```python
import torch
import torch.nn as nn

torch.manual_seed(0)

def conv(cin, cout, k, stride, pad):
    layer = nn.Conv2d(cin, cout, k, stride, pad, bias=False)
    nn.init.uniform_(layer.weight, 0.1, 1.0)      # positive weights, no ReLU, no BN
    return layer

class Block(nn.Module):
    def __init__(self, cin, cout, stride):
        super().__init__()
        self.c1, self.c2 = conv(cin, cout, 3, stride, 1), conv(cout, cout, 3, 1, 1)
        self.skip = (nn.Identity() if stride == 1 and cin == cout
                     else conv(cin, cout, 1, stride, 0))
    def forward(self, x):
        return self.c2(self.c1(x)) + self.skip(x)

# Average pooling stands in for max pooling: a max pool sends the gradient to one
# element of its window, which would hide the theoretical field.
stem = nn.Sequential(conv(1, 4, 7, 2, 3), nn.AvgPool2d(3, 2, 1))
stages = nn.Sequential(Block(4, 4, 1), Block(4, 4, 1), Block(4, 8, 2), Block(8, 8, 1),
                       Block(8, 16, 2), Block(16, 16, 1), Block(16, 32, 2),
                       Block(32, 32, 1))

def rows_seen(modules, i, j):
    """First and last input row that influences unit (i, j); and the map width."""
    x = torch.ones(1, 1, 224, 224, requires_grad=True)
    h = x
    for m in modules:
        h = m(h)
    h[0, 0, i, j].backward()
    seen = (x.grad[0, 0].sum(dim=1) > 0).nonzero().flatten()
    return seen.min().item(), seen.max().item(), h.shape[-1]

print("last map, corner unit (0, 0):", rows_seen([stem, stages], 0, 0))
print("last map, unit (3, 3):       ", rows_seen([stem, stages], 3, 3))
stage1 = [stem, stages[:2]]
print("after stage 1, unit (28, 28):", rows_seen(stage1, 28, 28))
blk = stages[2]                                   # stage 2, block 1
print("main path of stage 2 block 1:", rows_seen(stage1 + [blk.c1, blk.c2], 14, 14))
print("shortcut of stage 2 block 1: ", rows_seen(stage1 + [blk.skip], 14, 14))
```

```output
last map, corner unit (0, 0): (0, 217, 7)
last map, unit (3, 3):        (0, 223, 7)
after stage 1, unit (28, 28): (91, 133, 56)
main path of stage 2 block 1: (79, 145, 28)
shortcut of stage 2 block 1:  (91, 133, 28)
```

The corner unit of the last map reads rows 0 to 217 and the interior units read the whole image,
as derived. After stage 1 the field is 43 ($91$ to $133$), and in the block of part (c) the main
path reaches 67 and the shortcut 43.
:::

::: exercise id=e4 level=1 kind=conceptual minutes=5
**Why global average pooling won.** In [Lab 2](#lab2), on digits placed at random positions on a
$16 \times 16$ canvas, a CNN ending in global average pooling reached about 0.93 test accuracy
while the same convolutions with a flatten-and-dense head reached about 0.89 with more parameters
(11,018 against 6,218). Explain the difference, and name a task where the flatten head is the
better choice.
:::

::: solution
**What each head asks of the data.** The convolutional layers are the same in both networks. They
are equivariant: a stroke detector fires wherever the stroke is. What differs is how the last
feature map, 32 channels of $4 \times 4$ cells, is turned into ten class scores.

- *Global average pooling* averages each channel over the 16 cells and gives 32 numbers, then a
  linear layer with $32 \times 10 + 10 = 330$ weights. The head cannot tell where a feature fired,
  only how strongly it fired somewhere, so the classifier is invariant to the digit's position by
  construction (approximately: the canvas border, the zero padding and the alignment of the two
  $2 \times 2$ pools with the digit still leak a little position information).
- *Flatten* keeps all $32 \times 16 = 512$ values and uses a linear layer with
  $512 \times 10 + 10 = 5{,}130$ weights, a separate one for every channel at every cell. A '3'-like
  feature in the top-left cell and the same feature in the bottom-right cell reach the output
  through different weights. The network must learn what a 3 looks like at each location from the
  examples that happen to have a 3 there: with 1,347 training images over 16 cells, about 84
  images per cell and 8 per class per cell.

The first head builds in the symmetry the task has; the second must learn it from data, and it
learns it imperfectly. In a re-run of Lab 2's configuration the flatten network fits the training
set completely (training accuracy 1.00) and loses about ten points on the test set, while the
pooled network, with 4,800 fewer parameters, fits it less closely (about 0.98) and generalises
better. Most of the gain still comes from the convolutions themselves: an MLP on the same canvas
reaches only about 0.44, because it has no shared detectors at all. So the convolutions account
for the larger part (0.44 to 0.89), and the pooling head adds the rest (0.89 to 0.93).

**When flatten is better.** When the label depends on *where*, because the position-specific
weights are then exactly what is needed and pooling throws the answer away. Examples: deciding
whether a defect lies in the left or the right half of a part; reading a field at a fixed place on
a scanned form; checking that a component is present at the position where the assembly drawing puts
it, in images from a fixed camera. A network that must output positions, such as the segmentation
networks of [Section 12](#s12), keeps the spatial map for the same reason. A middle course is to
pool, but append coordinate channels to the input so that the network can use position when it
needs it.
:::

::: exercise id=e5 level=2 kind=derivation minutes=10
**The price of a depthwise-separable layer.** Derive the ratio of multiply-accumulates of a
depthwise-separable $k \times k$ convolution (depthwise, then pointwise) to a standard $k \times k$
convolution with $C_{\text{in}}$ input and $C_{\text{out}}$ output channels, at the same output
size.

(a) Evaluate it for a $5 \times 5$ convolution from 96 to 192 channels on a $28 \times 28$ map,
giving both versions' parameters (with biases), MACs and FLOPs.

(b) What does the ratio approach as $C_{\text{out}}$ grows, for $k = 3$ and for $k = 5$?

(c) In the separable version, what share of the cost is the depthwise part, and how much more does
the block cost with $5 \times 5$ depthwise kernels than with $3 \times 3$? What does that suggest
about kernel sizes in separable designs?
:::

::: solution
**The ratio.** Count per output position; the number of positions, $H_{\text{out}} W_{\text{out}}$,
is the same in both and cancels.

- Standard: each of the $C_{\text{out}}$ outputs is a sum of $k^2 C_{\text{in}}$ products, so
  $k^2 C_{\text{in}} C_{\text{out}}$ MACs.
- Depthwise: each of the $C_{\text{in}}$ channels is filtered by its own $k \times k$ kernel, so
  $k^2 C_{\text{in}}$ MACs, and the output still has $C_{\text{in}}$ channels.
- Pointwise: a $1 \times 1$ convolution from $C_{\text{in}}$ to $C_{\text{out}}$, so
  $C_{\text{in}} C_{\text{out}}$ MACs.

$$
\frac{k^2 C_{\text{in}} + C_{\text{in}} C_{\text{out}}}{k^2 C_{\text{in}} C_{\text{out}}}
= \frac{1}{C_{\text{out}}} + \frac{1}{k^2} .
$$

The weights obey the same ratio, since every weight is used once per position.

**(a) The numbers.** Standard: $25 \cdot 96 \cdot 192 = 460{,}800$ weights plus 192 biases is
460,992 parameters; at $28 \cdot 28 = 784$ positions that is $460{,}800 \cdot 784 = 361.3$ million
MACs, or 722.5 MFLOPs (FLOPs are twice the MACs, bias additions not counted).
Separable: depthwise $25 \cdot 96 = 2{,}400$ weights, pointwise $96 \cdot 192 = 18{,}432$; together
20,832 weights, and with 96 and 192 biases 21,120 parameters; $20{,}832 \cdot 784 = 16.3$ million
MACs, or 32.7 MFLOPs. The ratio is $1/192 + 1/25 = 0.0452$: the separable layer needs $22.1$
times fewer MACs. Parameters differ by a little less, $460{,}992 / 21{,}120 = 21.8$, because the
biases do not shrink in the same proportion.

**(b) The limit.** As $C_{\text{out}} \to \infty$ the first term vanishes and the ratio tends to
$1/k^2$: a saving of 9 times for $3 \times 3$ and 25 times for $5 \times 5$. The saving is always
a little smaller than the limit: at $C_{\text{out}} = 192$ it is $1/(1/192 + 1/9) = 8.6$ times for
$3 \times 3$ and the 22.1 above for $5 \times 5$.

**(c) Where the cost sits.** The depthwise part is 2,400 of the 20,832 weights, $11.5\%$ of the
cost. The pointwise layer is the rest. With $3 \times 3$ depthwise kernels the block has
$864 + 18{,}432 = 19{,}296$ weights, so the $5 \times 5$ version costs $20{,}832 / 19{,}296 = 1.080$
times as much: 8% more for a field that grows from 3 to 5. In a separable block the spatial
filter is the cheap part, so enlarging it costs little in FLOPs. That is why separable designs are
free to use $5 \times 5$ depthwise kernels (EfficientNet) and $7 \times 7$ ones (ConvNeXt,
[Section 9](#s9)).

The caveat is that FLOPs are not run time ([Section 6](#s6)). A depthwise layer performs few
operations per byte it reads and writes, so on a GPU it is limited by memory traffic, not by
arithmetic, and a kernel that is free in FLOPs is not always free in milliseconds. The check below
reproduces the counts from PyTorch's own layers.

```python
import torch.nn as nn

c_in, c_out, k, h, w = 96, 192, 5, 28, 28

def params(*layers):
    return sum(p.numel() for layer in layers for p in layer.parameters())

def macs(layer):
    """Multiply-accumulates at h x w output positions (weights only, no biases)."""
    return layer.weight.numel() * h * w         # each weight is used once per position

standard = nn.Conv2d(c_in, c_out, k, padding=k // 2)
depthwise = nn.Conv2d(c_in, c_in, k, padding=k // 2, groups=c_in)
pointwise = nn.Conv2d(c_in, c_out, 1)
separable_macs = macs(depthwise) + macs(pointwise)

print(f"standard : {params(standard):,} parameters, {macs(standard) / 1e6:.1f} M MACs, "
      f"{2 * macs(standard) / 1e6:.1f} MFLOPs")
print(f"separable: {params(depthwise, pointwise):,} parameters, "
      f"{separable_macs / 1e6:.1f} M MACs, {2 * separable_macs / 1e6:.1f} MFLOPs")
print(f"ratio {separable_macs / macs(standard):.4f} = 1/{c_out} + 1/{k * k} "
      f"= {1 / c_out + 1 / k**2:.4f}")
print(f"depthwise share of the separable block: {macs(depthwise) / separable_macs:.3f}")
depthwise3 = nn.Conv2d(c_in, c_in, 3, padding=1, groups=c_in)
separable3_macs = macs(depthwise3) + macs(pointwise)
print(f"5x5 depthwise costs {100 * (separable_macs / separable3_macs - 1):.1f}% "
      f"more than 3x3 depthwise")
```

```output
standard : 460,992 parameters, 361.3 M MACs, 722.5 MFLOPs
separable: 21,120 parameters, 16.3 M MACs, 32.7 MFLOPs
ratio 0.0452 = 1/192 + 1/25 = 0.0452
depthwise share of the separable block: 0.115
5x5 depthwise costs 8.0% more than 3x3 depthwise
```
:::

::: exercise id=e6 level=2 kind=derivation minutes=10
**The gradient through the original residual block.** (a) The original residual block applies a
ReLU after the addition: $\mathbf{h}_{l+1} = \mathrm{ReLU}(\mathbf{h}_l + F_l(\mathbf{h}_l))$. Write
the Jacobian $\partial \mathbf{h}_{l+1}/\partial \mathbf{h}_l$ and the Jacobian of a stack of such
blocks from $l$ to $L$, and say what takes the place of the identity term of the pre-activation
derivation in [Section 8](#s8).

(b) Scalar gradient factors over 100 layers: a plain network whose layers each have gain 0.95, or
each 1.05; a residual network whose branches all have derivative $+0.02$, all $-0.02$, or
alternately $+0.02$ and $-0.02$.

(c) What would it take for the residual gradient to vanish?
:::

::: solution
**(a) The Jacobian.** Write $\mathbf{z}_l = \mathbf{h}_l + F_l(\mathbf{h}_l)$ for the value before
the ReLU and $\mathbf{J}_l = \partial F_l / \partial \mathbf{h}_l$ for the branch's Jacobian. The
chain rule gives

$$
\frac{\partial \mathbf{h}_{l+1}}{\partial \mathbf{h}_l}
= \mathbf{D}_l\,(\mathbf{I} + \mathbf{J}_l),
\qquad
\mathbf{D}_l = \operatorname{diag}\big(\mathbb{1}[\mathbf{z}_l > 0]\big),
$$

where $\mathbf{D}_l$ holds the ReLU's derivatives, 1 for a unit that is positive and 0 for one that
is not (PyTorch takes the derivative at exactly 0 to be 0). Over a stack, the later factors go on
the left:

$$
\frac{\partial \mathbf{h}_L}{\partial \mathbf{h}_l}
= \mathbf{D}_{L-1}(\mathbf{I} + \mathbf{J}_{L-1}) \cdots \mathbf{D}_{l}(\mathbf{I} + \mathbf{J}_{l}) .
$$

Multiply it out. Each factor $(\mathbf{I} + \mathbf{J}_i)$ contributes either $\mathbf{I}$ or
$\mathbf{J}_i$, so the product is a sum of $2^{L-l}$ terms, one for each subset of branches the
path goes through. The term that goes through no branch is the product of the $\mathbf{D}_i$
alone:

$$
\mathbf{D}_{L-1} \cdots \mathbf{D}_{l} ,
$$

a diagonal matrix whose $m$-th entry is 1 if unit $m$ is positive after *every* addition from
block $l$ to block $L - 1$, and 0 otherwise. This takes the place of the identity matrix in
[Section 8](#s8)'s equation. The gradient still has a highway, but the highway has a gate on every
unit at every block, and a unit that is switched off anywhere along the way loses it. For the
units that stay on, the highway is as good as the identity. The pre-activation form puts nothing
after the addition and restores the bare $\mathbf{I}$ (He et al. 2016b). The original design trains
well at the depths of ResNet-50 to 152; the gating matters most at very large depth, which is
where He et al. report the pre-activation form helping.

The code below checks the algebra on a toy stack of four blocks of width 6 (double precision, so
that the comparison is sharp), compares autograd's Jacobian with the product of
$\mathbf{D}_i(\mathbf{I} + \mathbf{J}_i)$, prints the highway term, and then switches one unit
off in the third block to show that its diagonal entry of $\partial \mathbf{h}_L / \partial
\mathbf{h}_0$ collapses from about 1 to 0.

```python
import torch

torch.manual_seed(0)
width, depth = 6, 4
eye = torch.eye(width, dtype=torch.double)
branches = [torch.nn.Sequential(torch.nn.Linear(width, width), torch.nn.Tanh(),
                                torch.nn.Linear(width, width)).double()
            for _ in range(depth)]
for branch in branches:                  # small branches, as with gamma = 0
    for p in branch.parameters():
        p.data *= 0.3

def stack(h):
    for branch in branches:
        h = torch.relu(h + branch(h))    # the original block: ReLU after the addition
    return h

h0 = torch.rand(width, dtype=torch.double) + 0.2     # non-negative, as after a ReLU
jacobian = torch.autograd.functional.jacobian(stack, h0)

def highway_and_product():
    """The product of D_i (I + J_i), and the product of the D_i alone."""
    h, product, highway = h0, eye, eye
    for branch in branches:
        pre = h + branch(h)
        d = torch.diag((pre > 0).double())           # the ReLU's 0/1 derivatives
        j = torch.autograd.functional.jacobian(branch, h)
        product, highway = d @ (eye + j) @ product, d @ highway
        h = torch.relu(pre)
    return product, highway

product, highway = highway_and_product()
print(f"max |autograd - product of D(I+J)| = {(jacobian - product).abs().max():.1e}")
print("highway diagonal:", highway.diag().tolist())
print("diagonal of dh_L/dh_0:", [f"{v:.3f}" for v in jacobian.diag().tolist()])

# Push unit 2 below zero in the third block: its highway closes from there on.
branches[2][2].bias.data[2] = -5.0
jacobian = torch.autograd.functional.jacobian(stack, h0)
_, highway = highway_and_product()
print("highway diagonal, unit 2 off in block 3:", highway.diag().tolist())
print("diagonal of dh_L/dh_0:", [f"{v:.3f}" for v in jacobian.diag().tolist()])
```

```output
max |autograd - product of D(I+J)| = 4.4e-16
highway diagonal: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0]
diagonal of dh_L/dh_0: ['1.035', '0.977', '0.957', '1.000', '0.992', '1.042']
highway diagonal, unit 2 off in block 3: [1.0, 1.0, 0.0, 1.0, 1.0, 1.0]
diagonal of dh_L/dh_0: ['1.035', '0.977', '-0.000', '1.000', '0.992', '1.042']
```

The two Jacobians agree to round-off. Before the unit is switched off the diagonal of
$\partial \mathbf{h}_L / \partial \mathbf{h}_0$ is within a few per cent of 1, the identity term plus
small branch contributions. After the third block's branch pushes unit 2 below zero its entry is
0, and the other entries are untouched: only that unit's highway has closed.

**(b) The scalar factors.** Treat each Jacobian as a scalar. The numbers are:

| Network | Per-layer factor | Over 100 layers |
|---|---|---|
| plain | $0.95$ | $0.95^{100} = 0.0059$ |
| plain | $1.05$ | $1.05^{100} = 131.5$ |
| residual, all $\epsilon = +0.02$ | $1.02$ | $1.02^{100} = 7.24$ |
| residual, all $\epsilon = -0.02$ | $0.98$ | $0.98^{100} = 0.133$ |
| residual, alternating | $1.02, 0.98$ | $(1.02 \cdot 0.98)^{50} = 0.9996^{50} = 0.980$ |

The arithmetic of the plain and the residual rows is the same: a plain network with gain $0.98$ per
layer would also pass 0.133 through 100 layers. The difference lies in where the number comes from
and how likely it is to be close to 1. A plain layer's gain is whatever its weights make it, and
nothing keeps it near 1: in a plain network without normalisation and with PyTorch's default
initialisation it is about 0.4 per layer ([Section 8](#s8)), and a deviation of $0.05$ is an
ordinary miss. A residual block's gain is $1 + \epsilon$, where $\epsilon$ is the derivative of a branch that starts small and is exactly 0 if
its last batch-norm scale is initialised to 0. The 1 is built in. With mixed signs the deviations
largely cancel: for random signs $\ln \prod (1 + \epsilon_i)$ is a sum of 100 terms of about
$\pm 0.02$, with standard deviation $0.02\sqrt{100} = 0.2$, so one standard deviation either way
is a factor between $e^{-0.2} = 0.82$ and $e^{0.2} = 1.22$.

**(c) What it would take to vanish.** The product of the factors $(1 + \epsilon_i)$ must approach 0,
so some factor must be near 0: a branch whose derivative is close to $-1$ and so cancels the
identity, at some block and for every example. For matrices the condition is that
$\mathbf{I} + \mathbf{J}_i$ is nearly singular, with $\mathbf{J}_i$ having an eigenvalue near $-1$ in
the direction the gradient arrives from. That is not a generic situation, and it is not where
training starts, because the branches begin small. The residual network is not immune to drift:
if the $\epsilon_i$ share a sign, the product still moves away from 1 geometrically (the 7.24 and
0.133 of part (b)), only far more slowly than a plain stack's. [Section 8](#s8)'s 55-layer
networks with batch norm show the contrast: a stem gradient of about 190 for the plain network
against 0.8 with shortcuts.
:::

::: exercise id=e7 level=1 kind=conceptual minutes=5
**Augmentations that keep the label.** For each dataset, which of these augmentations preserve the
label: horizontal flip, vertical flip, 90-degree rotation, rotation within $\pm 10^\circ$,
brightness and contrast jitter, mixup? (a) Handwritten digits. (b) Aerial images of farmland
classified by crop. (c) Chest X-rays labelled for pneumonia. (d) Micrographs of cells segmented
into nucleus and cytoplasm.
:::

::: solution
The test is whether a person who knows the domain would still give the transformed image the same
label, and whether the transformed image looks like something the deployed system will meet.

| Augmentation | (a) digits | (b) crops | (c) chest X-rays | (d) cell masks |
|---|---|---|---|---|
| horizontal flip | no | yes | doubtful | yes |
| vertical flip | no | yes | no | yes |
| 90° rotation | no | yes | no | yes |
| rotation within $\pm 10^\circ$ | yes | yes | yes | yes |
| brightness and contrast | yes | mild | yes | yes, image only |
| mixup | not label-preserving | not label-preserving | not label-preserving | not used |

**(a) Digits.** Small rotations and photometric jitter are the transformations a handwriter or a
scanner produces. A flip turns a 2, 3, 5 or 7 into a mirror image that is not a digit, and a
vertical flip or a 180° rotation turns a 6 into a 9 and changes the label. A 90° rotation produces
images no writer produces. Mixup blends two images and their labels into a soft label, which makes
it a regulariser, not a label-preserving transformation.

**(b) Aerial crops.** The camera looks straight down and the field has no canonical orientation, so
flips and 90° rotations are all fine, and small rotations too (fill the empty corners by reflection
or crop). Brightness and contrast are fine in moderation; strong hue shifts are not, because colour
is much of what distinguishes crops.

**(c) Chest X-rays.** Small rotations and exposure changes mimic patient posture and the machine's
settings, and are safe. A vertical flip or 90° rotation yields images nobody takes. A horizontal
flip is doubtful: it puts the heart on the right and the markers' letters back to front, which
never occurs in practice (apart from rare conditions), and for any label that depends on a side it
changes the label. A pneumonia label may survive it, but the flipped images are a distribution shift
you introduced, so use it only if validation on unflipped data shows a gain.

**(d) Cell segmentation.** The label is the mask, so every geometric transform is allowed provided
it is applied to the image and the mask together, with nearest-neighbour interpolation for the
mask so that no class values are invented; flips and 90° rotations are natural for micrographs. Photometric
jitter applies to the image only. Mixup of masks has no standard meaning, and is not used.
:::

::: exercise id=e8 level=1 kind=conceptual minutes=5
**Which layers transfer.** In [Lab 4](#lab4) a network pretrained on digits 0 to 4 did as well as
training from scratch when only its first block was kept, worse with two blocks, and badly as a
frozen feature extractor. Yet an ImageNet
backbone is often a reasonable frozen feature extractor even for microscopy. Explain the
difference, and give two situations in which training from scratch can match a pretrained
backbone.
:::

::: solution
**The layers differ in generality.** Early layers learn generic detectors (edges, strokes, colour
blobs, simple textures) that any image needs, and they transfer. Later layers become specific to
the source task's classes (Yosinski et al. 2014). Lab 4's source has 5 classes and 675 images, so
its last block encodes 'a 0, 1, 2, 3 or 4' and little else: copied and frozen it gives the
target's classifier features tuned to the wrong digits, while the first block's stroke detectors
are general enough to do no harm (and so cheap to learn that, at 25 images, they bring no gain
either). A source with such a narrow task can supply only its early layers.

ImageNet is the other extreme: 1.28 million training images in 1,000 classes, many of them
textures, parts and materials. To separate a thousand classes the later layers must encode a broad
vocabulary of shapes and textures, a good part of which is useful for images that look nothing like
photographs. That breadth is why the whole backbone often transfers, and also why the transfer is
not guaranteed for microscopy: it is a bet that the vocabulary covers the target, to be checked on
a validation set.

**When scratch can match pretraining.**

1. *A large target set and long training.* He, Girshick and Dollár (2019) trained detectors on COCO
   from random initialisation and matched the ImageNet-pretrained ones, given enough iterations and
   suitable normalisation (group norm or synchronised batch norm). Pretraining mainly sped up
   convergence, and it helped clearly only when the target data were small.
2. *A target domain far from the source, with plenty of data.* Raghu et al. (2019) found, on large
   medical-imaging sets, that ImageNet pretraining gave little or no gain in final accuracy over
   training from scratch, and that smaller models trained from scratch could match the standard
   large pretrained ones; pretraining still tended to converge faster.

Scratch training loses where data are scarce and a broad source covers the target, and when you
cannot afford the training time. Lab 4 shows the other side of the bargain: with a narrow source,
training from scratch on 25 images was as good as any transfer variant.
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
**Why the focal loss.** A one-stage detector scores about 20,000 anchors per image, of which
perhaps 10 overlap an object. (a) Why does plain cross-entropy summed over all anchors train it
poorly? (b) The focal loss multiplies each anchor's cross-entropy by $(1 - p_t)^\gamma$, where
$p_t$ is the probability the model gives the anchor's true class. Without computing, say what this
does to an anchor the model already classifies confidently and correctly and to one it gets badly
wrong, and what $\gamma = 0$ gives back. (c) Why would re-weighting the classes with a weight
$\alpha_t$ alone not fix the problem? (d) Why do two-stage detectors suffer less from it?
:::

::: solution
**(a) The sum is dominated by the easy majority.** Each background anchor that the model already
gets right contributes a small loss and a small gradient. But there are some 20,000 of them, and
their total outweighs the few positives. Take 19,990 background anchors at $p_t = 0.98$ and 10
positives at $p_t = 0.2$, early in training. Cross-entropy is $-\ln p_t$, so the background anchors
sum to $19{,}990 \cdot 0.0202 = 404$ and the positives to $10 \cdot 1.609 = 16.1$: the background
makes up 96% of the loss. The gradient of the sum then mostly pushes the model to be still more
certain about background it already has right, and the signal from the objects is a small part of
it.

**(b) What the factor does.** For a confident, correct anchor $p_t$ is near 1, so
$(1 - p_t)^\gamma$ is near 0 and its loss is nearly silenced. For a badly wrong anchor $p_t$ is
small, the factor is near 1, and its loss is kept. Training concentrates on the hard examples.
With $\gamma = 2$: at $p_t = 0.98$ the factor is $0.0004$; at 0.5 it is 0.25; at 0.2 it is 0.64;
at 0.05 it is 0.90. The same two groups as above now give $0.16$ for the background and $10.3$ for
the positives: the background's share falls from 96% to 1.5%. With $\gamma = 0$ the factor is 1
everywhere and the focal loss is the (class-weighted) cross-entropy again.

**(c) Why a class weight is not enough.** A weight $\alpha_t$ scales every anchor of a class by the
same amount. It can balance the totals: weight the background by $10/19{,}990 = 0.0005$ and the
group's total drops to about 0.2. But it cannot tell an easy negative from a hard one. A confident
false positive ($p_t = 0.2$ on a background anchor) is scaled to $0.0008$ along with the rest, so
the model is no longer taught to remove its mistakes, which are the informative negatives. The
focal factor depends on the anchor's own $p_t$, so it keeps the hard negatives (factor 0.64) and
silences the easy ones (factor 0.0004). Once $\gamma = 2$ has done that, RetinaNet gives the
positives the *smaller* weight, $\alpha = 0.25$ against $0.75$ for the negatives (Lin et al. 2017).

**(d) Two-stage detectors.** The region-proposal stage discards most of the background before the
second stage, which then trains on a sampled mini-batch with a fixed positive-to-negative ratio, in
the usual set-ups up to a quarter of the sampled regions positive. The imbalance is handled by
sampling, not by the loss. The numbers above are reproduced here.

```python
import numpy as np

n_negative, n_positive = 19_990, 10
p_negative = 0.98       # p_t of a typical easy background anchor
p_positive = 0.20       # p_t of a positive early in training

def loss(p_t, gamma):
    """Focal loss for one anchor; gamma = 0 is plain cross-entropy."""
    return -((1 - p_t) ** gamma) * np.log(p_t)

for gamma in (0, 2):
    neg = n_negative * loss(p_negative, gamma)
    pos = n_positive * loss(p_positive, gamma)
    print(f"gamma={gamma}: negatives {neg:8.3f}, positives {pos:6.3f}, "
          f"negatives' share {neg / (neg + pos):.1%}")

for p_t in (0.98, 0.90, 0.50, 0.20, 0.05):
    print(f"p_t={p_t:.2f}: CE {loss(p_t, 0):.4f}, focal {loss(p_t, 2):.6f}, "
          f"factor {(1 - p_t) ** 2:.4f}")

# A class weight alone, chosen to balance the totals: alpha_negative = 10 / 19,990.
alpha = n_positive / n_negative
print(f"alpha only: a confident false positive (p_t = 0.2) now costs "
      f"{alpha * loss(0.2, 0):.5f} instead of {loss(0.2, 0):.4f}")
```

```output
gamma=0: negatives  403.852, positives 16.094, negatives' share 96.2%
gamma=2: negatives    0.162, positives 10.300, negatives' share 1.5%
p_t=0.98: CE 0.0202, focal 0.000008, factor 0.0004
p_t=0.90: CE 0.1054, focal 0.001054, factor 0.0100
p_t=0.50: CE 0.6931, focal 0.173287, factor 0.2500
p_t=0.20: CE 1.6094, focal 1.030040, factor 0.6400
p_t=0.05: CE 2.9957, focal 2.703648, factor 0.9025
alpha only: a confident false positive (p_t = 0.2) now costs 0.00081 instead of 1.6094
```
:::


::: exercise id=e10 level=2 kind=calculation minutes=10
**IoU, NMS and average precision by hand.** Boxes are $(x_1, y_1, x_2, y_2)$, all of one class:
A $= (0,0,8,8)$ with score 0.90, B $= (2,0,10,8)$ with 0.85, C $= (20,20,28,28)$ with 0.70 and
D $= (3,3,11,11)$ with 0.60.

(a) Compute IoU(A, B), IoU(A, D) and IoU(B, D).

(b) Run non-maximum suppression with threshold 0.5, then with 0.3. Does D survive at 0.3, although
its IoU with B exceeds 0.3?

(c) The ground truth is two objects, exactly at A and at C. Rank the detections by score and mark
each as a true or a false positive at IoU $\ge 0.5$ (each object can be matched once). Compute the
all-point interpolated average precision for the boxes that survive NMS at 0.5 and for all four
boxes without NMS. What do the two results say about NMS, and about AP as a summary?
:::

::: solution
**(a) The overlaps.** The intersection's corners are the larger of the two minimum coordinates and
the smaller of the two maximum ones ([Section 11](#s11)); its width and height are
$\max(0, \cdot)$ of the differences.

- A and B: the intersection is $x$ from 2 to 8 and $y$ from 0 to 8, $6 \times 8 = 48$. Each box
  has area $8 \times 8 = 64$, so the union is $64 + 64 - 48 = 80$ and IoU $= 48/80 = 0.600$.
- A and D: $x$ from 3 to 8 and $y$ from 3 to 8, $5 \times 5 = 25$; union $128 - 25 = 103$;
  IoU $= 25/103 = 0.243$.
- B and D: $x$ from 3 to 10 (width 7) and $y$ from 3 to 8 (height 5), $35$; union
  $128 - 35 = 93$; IoU $= 35/93 = 0.376$.

(The union subtracts the intersection once, because adding the two areas counts it twice.)

**(b) Suppression.** NMS sorts by score, keeps the best box, deletes every remaining box whose IoU
with it exceeds the threshold, and repeats on what is left.

- *Threshold 0.5.* Keep A. IoU(A, B) $= 0.600 > 0.5$: delete B. Keep C, whose IoU with A is 0.
  D: IoU(A, D) $= 0.243 \le 0.5$, so D stays. The result is A, C, D.
- *Threshold 0.3.* The same: B is deleted (0.600 $> 0.3$) and D is kept (0.243 $\le 0.3$).

D survives at 0.3 although IoU(B, D) $= 0.376$ is above it, because B was deleted before D was
considered, and a deleted box suppresses nothing. NMS compares each box only with the boxes
already kept. D would go only at a threshold below 0.243, where A itself removes it; the code below
shows it going at 0.2.

**(c) Average precision.** *With NMS*, the detections in score order are A, C, D. A matches the
object at A (IoU 1): true positive. C matches the object at C: true positive. D has IoU 0.243 with
the object at A and 0 with the one at C: false positive. Precision after each rank is
$1/1, 2/2, 2/3$ and recall $0.5, 1, 1$. The interpolated precision at recall $r$ is the largest
precision at any recall $\ge r$, which is 1 everywhere, because the second detection already
reaches recall 1 with precision 1. All-point AP is the area under that curve:

$$
\text{AP} = 0.5 \cdot 1 + 0.5 \cdot 1 = 1.0 .
$$

*Without NMS*, the order is A, B, C, D. A is a true positive. B overlaps the object at A with
IoU 0.600, enough for a match, but that object is already matched, so B is a false positive: a
duplicate. C is a true positive and D a false positive. Precision after each rank is
$1/1, 1/2, 2/3, 2/4$ and recall $0.5, 0.5, 1, 1$. The interpolated precision is 1 for recall up to
0.5 (the first detection) and $2/3$ for recall above 0.5 (the best precision at recall 1 is the
third detection's). So

$$
\text{AP} = 0.5 \cdot 1 + 0.5 \cdot \tfrac{2}{3} = 0.833 .
$$

NMS is worth $0.167$ of AP here, because it removed a duplicate ranked above a true positive. The
false positive D ranks below every true positive and costs nothing in AP either way. That is the
limit of AP as a summary: a perfect AP of 1.0 coexists with a detector whose list contains one
wrong box out of three. AP rewards the ordering of the list, not the list you will act on, which
is why it is reported together with the precision and recall at the operating threshold (here
$2/3$ and 1).

```python
import numpy as np

def iou(a, b):
    """IoU of two boxes (x1, y1, x2, y2)."""
    iw = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    ih = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    inter = iw * ih
    union = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - inter
    return inter / union

boxes = {"A": (0, 0, 8, 8), "B": (2, 0, 10, 8),
         "C": (20, 20, 28, 28), "D": (3, 3, 11, 11)}
scores = {"A": 0.90, "B": 0.85, "C": 0.70, "D": 0.60}
for p, q in [("A", "B"), ("A", "D"), ("B", "D")]:
    print(f"IoU({p},{q}) = {iou(boxes[p], boxes[q]):.3f}")

def nms(names, threshold):
    order = sorted(names, key=lambda n: -scores[n])
    keep = []
    for n in order:
        if all(iou(boxes[n], boxes[k]) <= threshold for k in keep):
            keep.append(n)
    return keep

for t in (0.5, 0.3, 0.2):
    print(f"NMS at {t}: {nms(boxes, t)}")

truth = [(0, 0, 8, 8), (20, 20, 28, 28)]

def average_precision(names):
    """All-point interpolated AP; each ground-truth box may be matched once."""
    order = sorted(names, key=lambda n: -scores[n])
    matched, flags = set(), []
    for n in order:
        best, best_iou = None, 0.5          # need IoU >= 0.5
        for g, box in enumerate(truth):
            if g not in matched and iou(boxes[n], box) >= best_iou:
                best, best_iou = g, iou(boxes[n], box)
        if best is None:
            flags.append(0)
        else:
            matched.add(best); flags.append(1)
    tp = np.cumsum(flags); fp = np.cumsum(1 - np.array(flags))
    precision = tp / (tp + fp); recall = tp / len(truth)
    # envelope: precision at recall r is the best precision at any recall >= r
    envelope = np.maximum.accumulate(precision[::-1])[::-1]
    recall_prev = np.concatenate([[0.0], recall[:-1]])
    ap = float(np.sum((recall - recall_prev) * envelope))
    return order, flags, precision.round(3), recall.round(3), ap

for label, names in [("with NMS 0.5", nms(boxes, 0.5)), ("without NMS", list(boxes))]:
    order, flags, prec, rec, ap = average_precision(names)
    print(f"{label}: order {order} TP flags {flags}")
    print(f"  precision {prec.tolist()} recall {rec.tolist()} AP = {ap:.3f}")
```

```output
IoU(A,B) = 0.600
IoU(A,D) = 0.243
IoU(B,D) = 0.376
NMS at 0.5: ['A', 'C', 'D']
NMS at 0.3: ['A', 'C', 'D']
NMS at 0.2: ['A', 'C']
with NMS 0.5: order ['A', 'C', 'D'] TP flags [1, 1, 0]
  precision [1.0, 1.0, 0.667] recall [0.5, 1.0, 1.0] AP = 1.000
without NMS: order ['A', 'B', 'C', 'D'] TP flags [1, 0, 1, 0]
  precision [1.0, 0.5, 0.667, 0.5] recall [0.5, 0.5, 1.0, 1.0] AP = 0.833
```
:::

::: exercise id=e11 level=1 kind=conceptual minutes=5
**Slices are not independent.** A team segments liver tumours on CT: 40 patients with 100 annotated
slices each and a 2D U-Net. They shuffle all 4,000 slices and split them 80/20, reporting a Dice of
0.91; on 10 new patients the Dice is 0.74. (The numbers are a scenario, not a result.) Explain the
gap and how the evaluation should have been set up.
:::

::: solution
**The gap.** Neighbouring slices of one patient are nearly the same picture: they share the
anatomy, the scanner, the contrast phase and often the tumour, and a tumour appears in a run of
consecutive slices. A random split over slices puts, for almost every test slice, near-copies of it
into the training set. The 0.91 then measures how well the network memorised these 40 patients, not
how well it segments a new one. This is leakage ([Module 01, Section 10](module_01_EN.html#s10)): the unit of
generalisation is the patient, and the split ignored it. The effective sample size of the study is
40, not 4,000.

The 0.74 on 10 new patients is the more honest estimate of deployment performance, with two caveats.
Ten patients is a small sample, so it is uncertain. And the new patients may come from another
scanner or hospital, so part of the gap may be a shift between sites, not leakage. The two causes can be
told apart by re-doing the evaluation inside the original 40 with a patient-level split: if it
returns about 0.75 the gap was leakage, and if it returns 0.9 the new patients are different.

**How to set it up.**

- Split by patient: for example 32 patients for training and 8 for testing, or five-fold grouped
  cross-validation with the patient as the group, so that all 100 slices of a patient fall on one
  side and every patient is tested once. Tune hyperparameters on validation patients taken from the
  training set, never on the test patients.
- If possible, keep a second site or scanner entirely for a final test.
- Report the mean and spread over *patients* (a Dice per patient, then its mean and a bootstrap
  interval over patients), not a Dice pooled over slices, which lets large tumours dominate.
- Say how slices without a tumour are scored ([Section 12](#s12)): an empty prediction on an
  empty mask is a Dice of $0/0$, and the convention changes the number.
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
**Batch norm on a batch of two volumes.** A 3D U-Net trains on $64^3$ patches with a batch of 2;
batch norm gives noisy training and a validation score that depends on batch composition. (a) How
many values enter each batch-norm mean of a 32-channel layer, and why are they still too few?
(b) With group norm (8 groups) on the same layer, which values enter each mean and variance, and
how many are there?
:::

::: solution
**(a) Many values, few examples.** Batch norm computes one mean and one variance per channel,
over the batch and all spatial positions: $2 \cdot 64^3 = 524{,}288$ values per channel. That
looks like plenty, but the values come from two volumes, and the voxels within a volume are
strongly correlated: a channel's average over one volume is governed by what that volume contains,
for example how much of the patch is foreground. Model the mean of a volume as varying between
volumes with standard deviation $\sigma_b$. The batch mean is the average of $B$ such volume means, so
its standard deviation is about $\sigma_b/\sqrt{B}$ however many voxels each volume has: $0.71\,\sigma_b$
for $B = 2$, against $0.25\,\sigma_b$ for $B = 16$. What matters is the number of independent
examples, and half a million voxels from two of them do not make half a million samples.

The result is a normalisation whose shift and scale change from batch to batch, a training signal
that is noisy for that reason, and a mismatch at test time, where the layer uses running averages
accumulated over many batches and so computes something different from what the network saw in
training. The validation score then depends on whether the test batch resembles the training
batches.

**(b) Group norm uses one example.** Group norm splits the 32 channels into 8 groups of 4 and
computes, for each example separately and each group, a mean and a variance over the group's
channels and all positions: $4 \cdot 64^3 = 1{,}048{,}576$ values per statistic, all from one
volume. Training and testing compute exactly the same thing, nothing depends on the batch size or
on the other volumes in the batch, and the statistic is estimated from 4 channels of one volume,
which is a stable thing to estimate. This is why the 3D U-Net block of
[Section 13](#s13) uses group norm.
:::

::: exercise id=e13 level=2 kind=calculation minutes=10
**Activation memory of a 3D U-Net.** A 3D U-Net encoder has four levels with 32, 64, 128 and 256
channels. The first level works at the patch's full resolution and every deeper level halves each
spatial dimension. Training keeps six tensors per level for the backward pass (two convolution
outputs, two normalisation outputs, two activations), in float32.

(a) Compute the encoder's activation memory for a batch of 4 patches of $96^3$ voxels.

(b) The decoder costs about as much again. Does training fit on a GPU with 8 GiB if the weights and
optimiser state take 0.5 GiB?

(c) Halve the activation memory in two ways: through the batch, and through a cubic patch size at
batch 4 that a network with three poolings accepts. Which would you choose, and why?

(d) Compare one 32-channel feature map of a $96^3$ patch with one of a $1{,}024 \times 1{,}024$ 2D
slice.
:::

::: solution
**(a) The encoder.** A float32 value takes 4 bytes. One tensor of level 0, per patch, is
$96^3 \cdot 32 \cdot 4\ \text{B} = 113{,}246{,}208\ \text{B} = 108\ \text{MiB}$, and there are six of
them: 648 MiB. Each deeper level has $1/8$ of the voxels (each edge halves) and twice the channels,
so $1/4$ of the memory: 162, 40.5 and 10.1 MiB. The encoder holds
$648 + 162 + 40.5 + 10.1 = 860.6$ MiB per patch, and $4 \cdot 860.6 = 3{,}442.5$ MiB, or 3.36 GiB, for
the batch of 4. The first level alone is three quarters of it, which is why the full-resolution
level dominates and why patch size is the lever.

**(b) The whole network.** With the decoder as large again, the activations are about
$2 \cdot 3.36 = 6.72$ GiB, and with the 0.5 GiB for weights and optimiser state, 7.22 GiB. On paper
that fits in 8 GiB, with 0.78 GiB to spare. That margin is thin. The estimate leaves out the
decoder's concatenated skip inputs and upsampled maps (which are extra tensors, not the same ones),
the workspace the convolution library asks for, memory the allocator loses to fragmentation, and the
CUDA context itself, which typically takes a few hundred MiB. Measure the real peak with
`torch.cuda.max_memory_allocated()` before trusting the estimate, and expect to drop to a batch of 3
or 2.

**(c) Two ways to halve it.**

- *The batch.* Memory is linear in the batch, so batch 2 halves it exactly: 1,721 MiB for the
  encoder, and about 3.9 GiB for the whole network with the weights.
- *The patch.* Memory is cubic in the side. At batch 4 a side $s$ with $s^3 = 96^3/2$ needs
  $s = 96 \cdot 0.5^{1/3} = 76.2$. The side must be divisible by $2^3 = 8$ for three poolings, so
  the choices are 80, which keeps 58% of the memory, and 72, which keeps 42%.

Prefer the smaller batch. With group norm nothing depends on the batch size ([Exercise 12](#e12)), so a
batch of 2 costs only some gradient noise, which accumulating the gradient over two steps removes at
the price of time, not memory. A smaller patch changes what the network sees: each prediction gets
less context, border voxels are a larger share of the output, and inference needs more overlapping
tiles ([Section 13](#s13)). (Recomputing activations during the backward pass, 'checkpointing',
is a third lever, trading about a third more compute for much of the activation memory.)

**(d) Against 2D.** One map of $96^3$ voxels with 32 channels is $96^3 \cdot 32 \cdot 4\ \text{B} =
108$ MiB. One map of a $1{,}024 \times 1{,}024$ slice with 32 channels is
$1{,}024^2 \cdot 32 \cdot 4\ \text{B} = 128$ MiB. A single small $96^3$ patch costs about as much
per feature map as a one-megapixel slice, and the 3D network keeps such maps at every level and for
six tensors each, which is why 3D training is memory-bound where the 2D case is not.

```python
MIB = 2**20
CHANNELS = (32, 64, 128, 256)
TENSORS_PER_LEVEL = 6                      # 2 convolutions, 2 norms, 2 activations

def level_mib(side, level, batch=1):
    """Float32 memory of one level; level l has side / 2^l voxels per edge."""
    voxels = (side // 2**level) ** 3
    return voxels * CHANNELS[level] * 4 * TENSORS_PER_LEVEL * batch / MIB

def encoder_mib(side, batch):
    return sum(level_mib(side, level, batch) for level in range(4))

print("per level, one patch, MiB:", [level_mib(96, l) for l in range(4)])
one, four = encoder_mib(96, 1), encoder_mib(96, 4)
print(f"one patch {one:.1f} MiB; batch of 4 {four:.1f} MiB = {four / 1024:.2f} GiB")
total = 2 * four / 1024 + 0.5
print(f"encoder + decoder + 0.5 GiB = {total:.2f} GiB; {8 - total:.2f} GiB left of 8")
print(f"batch 2: {encoder_mib(96, 2):.1f} MiB ({encoder_mib(96, 2) / four:.0%})")
print(f"side that halves it: 96 * 0.5**(1/3) = {96 * 0.5 ** (1 / 3):.1f}")
for side in (80, 72):
    print(f"side {side}, batch 4: {encoder_mib(side, 4):.1f} MiB "
          f"({encoder_mib(side, 4) / four:.0%})")
print(f"one 32-channel map: 96^3 patch {96**3 * 32 * 4 / MIB:.0f} MiB, "
      f"1024^2 slice {1024**2 * 32 * 4 / MIB:.0f} MiB")
```

```output
per level, one patch, MiB: [648.0, 162.0, 40.5, 10.125]
one patch 860.6 MiB; batch of 4 3442.5 MiB = 3.36 GiB
encoder + decoder + 0.5 GiB = 7.22 GiB; 0.78 GiB left of 8
batch 2: 1721.2 MiB (50%)
side that halves it: 96 * 0.5**(1/3) = 76.2
side 80, batch 4: 1992.2 MiB (58%)
side 72, batch 4: 1452.3 MiB (42%)
one 32-channel map: 96^3 patch 108 MiB, 1024^2 slice 128 MiB
```
:::

::: exercise id=e14 level=3 kind=project minutes=25
**Volumes from masks, with an error budget.** A mask is only as good as the measurements taken
from it. Work through a second object ([Section 13](#s13) followed a first one).

1. On a grid with voxel spacing 0.4 × 0.4 micrometres in plane and 1.5 micrometres between slices,
   build the mask of an ellipsoid with semi-axes 10, 8 and 5 micrometres along $x$, $y$ and $z$ by
   testing each voxel centre. Put the ellipsoid's centre at (0.3, 0.6, 0.2) voxels from a voxel
   centre, in $(x, y, z)$, and leave a margin of voxels around it.
2. Compute its volume as voxel count times voxel volume and compare it with
   $\tfrac{4}{3}\pi a b c$.
3. Repeat for the 20 sub-voxel offsets `np.random.default_rng(0).random((20, 3))` and report the
   mean and the standard deviation (`ddof=1`).
4. Compute the surface area by counting exposed voxel faces, each weighted by its physical area,
   and compare it with the exact area, 730.6 square micrometres (from the elliptic-integral
   formula; Knud Thomsen's approximation with $p = 1.6075$ gives 731.1). What does the face count
   tend to as the voxels shrink?
5. Optional, with scikit-image installed and the mask indexed $(z, y, x)$: run
   `measure.marching_cubes` on the binary mask (level 0.5, spacing $(1.5, 0.4, 0.4)$) and on the mask
   blurred with a Gaussian of 0.5 micrometres along each axis (`scipy.ndimage.gaussian_filter`, with
   the sigma converted to voxels), and compare `measure.mesh_surface_area` with the exact value.
6. A file converter drops the slice spacing and reports isotropic 0.4-micrometre voxels. What
   volume does the mask then report?
7. Classify each discrepancy, using [Module 01, Section 8](module_01_EN.html#s8)'s decomposition, as bias,
   variance or a gross error, and say which of them shrink with finer voxels.
:::

::: solution
**Plan.** There are three things to get right before the numbers mean anything.

- *Order.* A NumPy volume is indexed $(z, y, x)$ while spacings and offsets are quoted in
  $(x, y, z)$. The code builds the mask with `np.meshgrid(..., indexing="ij")` over
  $(z, y, x)$ and converts to physical positions with the spacing of the matching axis; the
  marching-cubes call is given the spacing reversed, $(1.5, 0.4, 0.4)$.
- *Margin.* The grid extends 1.2 times each semi-axis (rounded up to whole voxels) on either side
  of the middle voxel, so that no object touches the border; a mask clipped by the grid would
  lose volume for reasons that have nothing to do with the exercise.
- *The exact values.* The volume is $\tfrac{4}{3}\pi abc$. The area has no elementary formula; for
  $a \ge b \ge c$ it is
  $$
  S = 2\pi c^2 + \frac{2\pi a b}{\sin\varphi}\Big(E(\varphi, k)\sin^2\varphi
  + F(\varphi, k)\cos^2\varphi\Big), \quad
  \cos\varphi = \frac{c}{a},\quad k^2 = \frac{a^2(b^2 - c^2)}{b^2(a^2 - c^2)},
  $$
  with $E$ and $F$ the incomplete elliptic integrals of the second and first kind. SciPy has
  them as `ellipeinc` and `ellipkinc`, taking $k^2$. A brute-force integration of the surface
  (not shown) gives the same 730.6 to five digits, which is how the formula's transcription was
  checked.

The face count works as follows: pad the mask with one layer of zeros; along each axis, every
change between neighbouring voxels (`np.diff` non-zero) is one exposed face, and its area is the
product of the two other spacings. The marching-cubes lines need scikit-image (the output below
was produced with version 0.26); without it the script skips them, and everything else runs on
NumPy and SciPy.

```python
import numpy as np
from scipy import ndimage, special

SPACING = np.array([0.4, 0.4, 1.5])          # micrometres, in (x, y, z) order
SEMI = np.array([10.0, 8.0, 5.0])            # semi-axes a, b, c along x, y, z

def ellipsoid_mask(offset_xyz, spacing=SPACING):
    """Mask indexed (z, y, x); centre = middle voxel plus an offset in voxels."""
    nx, ny, nz = 2 * np.ceil(1.2 * SEMI / spacing).astype(int) + 1   # room to spare
    centre = np.array([nx // 2, ny // 2, nz // 2]) + np.asarray(offset_xyz)
    z, y, x = np.meshgrid(np.arange(nz), np.arange(ny), np.arange(nx), indexing="ij")
    px = (x - centre[0]) * spacing[0]        # physical position of each voxel centre
    py = (y - centre[1]) * spacing[1]
    pz = (z - centre[2]) * spacing[2]
    return (px / SEMI[0]) ** 2 + (py / SEMI[1]) ** 2 + (pz / SEMI[2]) ** 2 <= 1.0

def exposed_face_area(mask, spacing=SPACING):
    """Sum of the physical areas of the voxel faces between inside and outside."""
    padded = np.pad(mask, 1).astype(np.int8)
    face_area = [spacing[0] * spacing[1],    # axis 0 is z: faces span x and y
                 spacing[0] * spacing[2],    # axis 1 is y: faces span x and z
                 spacing[1] * spacing[2]]    # axis 2 is x: faces span y and z
    return sum(np.count_nonzero(np.diff(padded, axis=axis)) * face_area[axis]
               for axis in range(3))

def ellipsoid_area(a, b, c):
    """Exact surface area from the elliptic integrals, for a >= b >= c."""
    a, b, c = sorted((a, b, c), reverse=True)
    phi = np.arccos(c / a)
    m = a**2 * (b**2 - c**2) / (b**2 * (a**2 - c**2))       # k squared
    e, f = special.ellipeinc(phi, m), special.ellipkinc(phi, m)
    return 2 * np.pi * c**2 + 2 * np.pi * a * b / np.sin(phi) * (
        e * np.sin(phi) ** 2 + f * np.cos(phi) ** 2)

exact_volume = 4 / 3 * np.pi * SEMI.prod()
exact_area = ellipsoid_area(*SEMI)
p = 1.6075
thomsen = 4 * np.pi * (sum((SEMI[i] * SEMI[j]) ** p
                           for i, j in [(0, 1), (0, 2), (1, 2)]) / 3) ** (1 / p)
print(f"exact volume {exact_volume:.1f}, exact area {exact_area:.1f} "
      f"(Thomsen {thomsen:.1f})")

# (1) and (2): one placement of the ellipsoid on the grid
mask = ellipsoid_mask((0.3, 0.6, 0.2))
voxel_volume = SPACING.prod()                # 0.24 cubic micrometres
volume = mask.sum() * voxel_volume
print(f"voxels {mask.sum()}, volume {volume:.1f} ({volume / exact_volume - 1:+.1%})")

# (3): twenty sub-voxel offsets
offsets = np.random.default_rng(0).random((20, 3))
volumes = np.array([ellipsoid_mask(o).sum() * voxel_volume for o in offsets])
mean, sd = volumes.mean(), volumes.std(ddof=1)
print(f"20 offsets: mean {mean:.1f} ({mean / exact_volume - 1:+.2%}), "
      f"sd {sd:.1f} ({sd / exact_volume:.2%})")

# (4): exposed faces against the exact area, and the limit of the face count
faces = exposed_face_area(mask)
a, b, c = SEMI
limit = 2 * np.pi * (a * b + a * c + b * c)
print(f"exposed faces {faces:.1f} ({faces / exact_area - 1:+.1%}); "
      f"limit 2*pi*(ab+ac+bc) = {limit:.1f} ({limit / exact_area - 1:+.1%})")
for scale in (2, 1, 0.5, 0.25):              # coarser and finer grids, same ratios
    spacing = SPACING * scale
    masks = [ellipsoid_mask(o, spacing) for o in offsets]
    vols = np.array([m.sum() * spacing.prod() for m in masks])
    areas = np.array([exposed_face_area(m, spacing) for m in masks])
    print(f"  voxels x{scale:<4}: volume sd {vols.std(ddof=1):5.2f}, "
          f"mean face area {areas.mean():7.1f} ({areas.mean() / exact_area - 1:+.1%})")

# (5): marching cubes, if scikit-image is installed
try:
    from skimage import measure
except ImportError:
    measure = None

def mesh_area(volume_zyx, spacing):
    """Area of the 0.5 isosurface; the volume is indexed (z, y, x)."""
    spacing_zyx = (spacing[2], spacing[1], spacing[0])
    verts, tris, _, _ = measure.marching_cubes(volume_zyx, level=0.5,
                                               spacing=spacing_zyx)
    return measure.mesh_surface_area(verts, tris)

if measure is not None:
    for scale in (2, 1, 0.5, 0.25):
        spacing = SPACING * scale
        binary = ellipsoid_mask((0.3, 0.6, 0.2), spacing).astype(float)
        sigma = tuple(0.5 / s for s in spacing[::-1])        # 0.5 um in voxels
        blurred = ndimage.gaussian_filter(binary, sigma)
        area_binary = mesh_area(binary, spacing)
        area_blurred = mesh_area(blurred, spacing)
        print(f"marching cubes, voxels x{scale:<4}: binary {area_binary:6.1f} "
              f"({area_binary / exact_area - 1:+.1%}), blurred {area_blurred:6.1f} "
              f"({area_blurred / exact_area - 1:+.1%})")
    cube = np.array([0.4, 0.4, 0.4])                         # isotropic voxels
    area_cube = mesh_area(ellipsoid_mask((0.3, 0.6, 0.2), cube).astype(float), cube)
    print(f"marching cubes, isotropic 0.4 um voxels, binary: {area_cube:.1f} "
          f"({area_cube / exact_area - 1:+.1%})")

# (6): the converter that drops the slice spacing and reports 0.4 micrometres everywhere
wrong_volume = mask.sum() * 0.4**3
print(f"isotropic misread: {wrong_volume:.1f} = {wrong_volume / exact_volume:.0%} "
      f"of the true volume")

# (7): a segmentation boundary displaced outward by 0.25 micrometres
grown = 4 / 3 * np.pi * np.prod(SEMI + 0.25)
print(f"boundary +0.25 um: volume {grown:.1f} ({grown / exact_volume - 1:+.1%})")
```

```output
exact volume 1675.5, exact area 730.6 (Thomsen 731.1)
voxels 7005, volume 1681.2 (+0.3%)
20 offsets: mean 1676.9 (+0.08%), sd 11.4 (0.68%)
exposed faces 1077.4 (+47.5%); limit 2*pi*(ab+ac+bc) = 1068.1 (+46.2%)
  voxels x2   : volume sd 35.00, mean face area  1054.0 (+44.3%)
  voxels x1   : volume sd 11.45, mean face area  1064.5 (+45.7%)
  voxels x0.5 : volume sd  2.63, mean face area  1067.4 (+46.1%)
  voxels x0.25: volume sd  0.66, mean face area  1068.0 (+46.2%)
marching cubes, voxels x2   : binary  857.7 (+17.4%), blurred  775.6 (+6.2%)
marching cubes, voxels x1   : binary  887.2 (+21.4%), blurred  755.5 (+3.4%)
marching cubes, voxels x0.5 : binary  883.7 (+21.0%), blurred  727.4 (-0.4%)
marching cubes, voxels x0.25: binary  886.4 (+21.3%), blurred  723.0 (-1.0%)
marching cubes, isotropic 0.4 um voxels, binary: 795.5 (+8.9%)
isotropic misread: 448.3 = 27% of the true volume
boundary +0.25 um: volume 1859.6 (+11.0%)
```

**(2) One placement.** 7,005 voxels at $0.4 \cdot 0.4 \cdot 1.5 = 0.24$ cubic micrometres give
1,681.2 against the exact $\tfrac{4}{3}\pi \cdot 10 \cdot 8 \cdot 5 = 1{,}675.5$: $+0.3\%$. That
single number could not distinguish bias from luck, which is why the next step exists.

**(3) Twenty placements.** The mean is 1,676.9 ($+0.08\%$) and the standard deviation 11.4
($0.68\%$). The mean is close to the truth: counting voxel centres inside a smooth body is nearly
unbiased, and the single placement above was an ordinary draw, 0.4 standard deviations from the
mean. The spread is variance that comes from where the object happens to fall on the grid. It
shrinks as the voxels shrink, and the table shows how: each halving of the voxel size cuts it about
fourfold (35.0, 11.4, 2.6, 0.66). The reason is that only voxels straddling the boundary can be
wrong; their number grows as $1/h^2$ in the voxel size $h$, each is wrong by up to a volume $h^3$,
and independent errors add as a square root: $\sqrt{1/h^2} \cdot h^3 = h^2$.

**(4) Exposed faces.** The face count gives 1,077 square micrometres, 47.5% above the exact area.
No resolution can fix this. Every face is axis-aligned, and for a convex body the faces facing
$+x$ and $-x$ together cover twice the body's shadow on the $yz$ plane, $2\pi bc$; adding the
three directions,

$$
S_{\text{faces}} \to 2\pi(ab + ac + bc) = 2\pi \cdot 170 = 1{,}068.1 ,
$$

which is 46.2% above 730.6. The refinement table approaches exactly that: $+44.3\%$, $+45.7\%$,
$+46.1\%$ and $+46.2\%$ as the voxels shrink. Finer voxels make the staircase finer, not flatter.
This is a **bias** of the method, and the area of a voxel mask must not be measured this way.

**(5) Marching cubes.** An isosurface algorithm places vertices where the interpolated field
crosses 0.5, on the edges of cubes of eight neighbouring voxel centres, and the mesh's area is
the sum of its triangles'. On the binary mask it gives 887 ($+21\%$): better than the faces, but
still far off, and the refinement rows show that it does not improve as the voxels shrink: $+21.4\%$,
$+21.0\%$ and $+21.3\%$ at the three finest grids, which keep the same voxel shape (the coarsest
gives $+17.4\%$). A binary field has only two values, so every vertex sits at the midpoint of its edge and the mesh keeps the staircase; the
anisotropic voxels make it worse, since with isotropic 0.4-micrometre voxels the same mask gives
795.5 ($+8.9\%$). On the mask blurred with a Gaussian of 0.5 micrometres the field has intermediate
values, the vertices move to sub-voxel positions, and the area is 755 ($+3.4\%$). That is the
practical rule of [Section 13](#s13): mesh a probability volume, or at least a lightly smoothed mask.
The blur has a price of its own. It shrinks a convex object slightly (the 0.5 level of a blurred
body lies inside the original boundary), so as the voxels get finer the staircase bias vanishes
and the smoothing bias shows, $-0.4\%$ and $-1.0\%$ in the last two rows. Choose the blur, in
physical units, small against the features you want to measure.

**(6) The converter.** Seven thousand and five voxels at $0.4^3 = 0.064$ cubic micrometres give
448.3, 27% of the true volume. The slice spacing was 3.75 times too small, and the volume is wrong
by that factor. This is a **gross error**: no mask quality or resolution touches it, and no
statistic computed on the voxels reveals it. The only defence is to carry the spacing with the
mask and refuse a mask without one ([Section 13](#s13)).

**(7) The classification.**

| Discrepancy | Size | Kind | Shrinks with finer voxels? |
|---|---|---|---|
| Volume, one placement | $+0.3\%$ | a draw from the variance | yes |
| Volume, mean over placements | $+0.08\%$ | bias, negligible | goes to 0 |
| Volume, spread over placements | 11.4 (0.68%) | variance | yes, about fourfold per halving |
| Face-count area | $+47.5\%$ | bias, structural | no: tends to $+46.2\%$ |
| Marching cubes, binary mask | $+21\%$ | bias, from the binary field and the voxel shape | no, only with more isotropic voxels |
| Marching cubes, blurred mask | $+3.4\%$ | small bias from the blur | the staircase part does; the smoothing part does not |
| Dropped slice spacing | $-73\%$ (27% of the truth) | gross error | no |

To these add the one the exercise cannot show, because it uses a perfect mask: a real
segmentation has its own bias. A boundary displaced outward by a quarter of a micrometre, which is
0.6 of an in-plane voxel, adds $\tfrac{4}{3}\pi \cdot 10.25 \cdot 8.25 \cdot 5.25 - 1{,}675.5 =
184$ cubic micrometres, $+11\%$ (the area times the displacement gives 183, the same to first
order). The grid's variance, 0.7%, is about sixteen times smaller than the effect of a sub-voxel
boundary error. In a real measurement the budget is dominated by where the network puts the edge
and by metadata, not by the discretisation. Evaluating that part takes held-out specimens and
manual measurements, and the discretisation analysis here is the part you can do without them.
:::

::: exercise id=e15 level=1 kind=conceptual minutes=5
**Do the maps prove it?** A colleague shows Grad-CAM maps from a crack classifier on concrete
images; every map highlights the crack. Does this establish that the classifier detects cracks for
the right reason? Give two limitations of the evidence and two further tests.
:::

::: solution
**No.** It is evidence that the classifier finds cracks *among other things*, on the images that
were shown, at a coarse scale. There are four limitations (two are enough for an answer):

1. *Resolution.* Grad-CAM has the resolution of the last convolutional layer. For a ResNet-50 at
   $224 \times 224$ that is $7 \times 7$, a cell covers $32 \times 32$ pixels, and a crack a few
   pixels wide fits inside one. The map says the evidence was found in that region, not on the
   crack itself.
2. *It shows where, not what.* Cracks come with stains, shadows, spalled edges and moisture marks
   that lie along them. A classifier that keys on the stain lights the same cell. A map cannot
   distinguish the crack from what travels with it, and this is the usual way a shortcut hides
   ([Section 14](#s14)).
3. *Selection.* The maps shown may be the successes. The informative ones are those for false
   positives and false negatives, and for images without cracks.
4. *Plausible is not faithful.* Some saliency methods produce maps that look sensible even for a
   network with randomised weights (Adebayo et al. 2018), so a map that looks right does not prove
   that it depends on what the model learned.

**Two further tests.**

- *Randomise the model.* Re-initialise the top layers (or all layers, progressively) and recompute
  the maps. If they still highlight the cracks, the method is showing the image, not the model;
  if they change, the original maps depended on the trained weights ([Lab 6](#lab6) runs this
  check).
- *Counterfactuals.* Paint out the crack, with inpainting or a patch of surrounding concrete, and
  watch the score fall; add a crack-like stain or a shadow along a line without a crack and see
  whether the score rises. Move a crack to another place or change the background. A classifier
  that uses the crack passes both, and one that uses the stain fails the second.

Beyond these, inspect the maps of the errors and evaluate on images from another site, camera or
surface type, where a shortcut tied to the training source stops working.
:::
