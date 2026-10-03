## Cheaper convolutions: 1 × 1, grouped and depthwise-separable {#s6}

A standard $k \times k$ convolution does two jobs at once. It filters in space, over a $k \times k$
window, and it mixes channels, because every output channel reads every input channel. Its cost
per output position, $k^2 C_{\text{in}} C_{\text{out}}$ multiply-accumulates ([Section 4](#s4)),
is the product of the two. The efficient architectures of Sections 7 to 9 are built by doing the
two jobs separately, or by doing the expensive one on fewer channels. This section derives what
each piece costs and what it gives up.

### The 1 × 1 convolution

With $k = 1$ the window is a single pixel and the multi-channel equation of Section 4 becomes

$$
Y_{c,i,j} = b_c + \sum_{c'=1}^{C_{\text{in}}} W_{c,c'}\, X_{c',i,j}.
$$

At every position the vector of $C_{\text{in}}$ channel values is multiplied by the same
$C_{\text{out}} \times C_{\text{in}}$ matrix $\mathbf{W}$. A **1 × 1 convolution** is a dense layer
applied independently at every pixel, with $C_{\text{in}} C_{\text{out}} + C_{\text{out}}$
parameters, and it never looks at a neighbour. It does two useful things: it changes the number
of channels cheaply, and, followed by a ReLU, it adds a nonlinearity per pixel. Lin et al. (2014)
followed every spatial convolution with a stack of such layers, a small MLP at each pixel
("Network in Network"); the same paper introduced global average pooling.

### Bottlenecks

At a fixed output size a $k \times k$ convolution costs
$k^2 C_{\text{in}} C_{\text{out}} H_{\text{out}} W_{\text{out}}$ MACs, proportional to the product
of its two channel counts. Divide both counts by $r$ and the cost falls by $r^2$. A **bottleneck**
exploits this: a 1 × 1 convolution reduces the channels before the expensive $k \times k$ one and,
where the width must be restored, a second 1 × 1 expands them after it. Inception used bottlenecks
to afford 5 × 5 branches; ResNet-50 and its deeper relatives use one in every block
([Section 8](#s8)).

::: worked title="The 5 × 5 branch of inception (3a)"
GoogLeNet's module (3a) reads a 28 × 28 map with 192 channels, and its 5 × 5 branch writes 32
channels. There are $28 \cdot 28 = 784$ output positions.

Directly: $5 \cdot 5 \cdot 192 \cdot 32 = 153{,}600$ weights and
$153{,}600 \times 784 = 120{,}422{,}400$ MACs, 120.4 M.

With a 1 × 1 reduction to 16 channels first:
$192 \cdot 16 + 5 \cdot 5 \cdot 16 \cdot 32 = 3{,}072 + 12{,}800 = 15{,}872$ weights and
$15{,}872 \times 784 = 12{,}443{,}648$ MACs, 12.4 M.

The reduced branch is $153{,}600 / 15{,}872 = 9.7$ times cheaper. The price is that everything the
branch computes must first pass through 16 numbers per pixel. Figure 3.15 shows the branch inside
the whole module, which [Section 7](#s7) describes.
:::

::: figure id=fig-03-15
The inception (3a) module. Four parallel branches leave a 28 × 28 × 192 input: a 1 × 1
convolution to 64 channels; a 1 × 1 reduction to 96 channels followed by a 3 × 3 convolution to
128; a 1 × 1 reduction to 16 channels followed by a 5 × 5 convolution to 32; and a 3 × 3 max pool
followed by a 1 × 1 projection to 32. The four outputs are concatenated along the channel axis
into 28 × 28 × 256 (64 + 128 + 32 + 32). The 1 × 1 reductions are highlighted, and the 5 × 5
branch is annotated with its cost without and with the reduction: 120.4 M against 12.4 M
multiply-adds.
:::

### Grouped and depthwise convolutions

A **grouped convolution** splits the $C_{\text{in}}$ input channels into $g$ groups and gives each
group its own $C_{\text{out}}/g$ filters, which read only that group's channels. Each filter now
spans $C_{\text{in}}/g$ channels, so the layer has $k^2 C_{\text{in}} C_{\text{out}}/g$ weights and
costs $g$ times less than the full layer. AlexNet's grouped layers were a hardware split: half of
the filters lived on each of two GPUs and read only the maps on their own GPU
([Section 7](#s7)). ResNeXt (Xie et al. 2017) made the number of groups a design dimension in its
own right.

At the extreme, $g = C_{\text{in}} = C_{\text{out}} = C$, every group is a single channel. This
is the **depthwise convolution**: one $k \times k$ filter per channel, $k^2 C$ weights, and no
mixing of channels at all.

### Depthwise-separable convolution

A **depthwise-separable convolution** does the two jobs one after the other: a depthwise $k \times k$
convolution filters each channel in space, then a pointwise (1 × 1) convolution mixes the channels
(Figure 3.14). Put any stride in the depthwise layer, so that both versions produce the same output
size, and count the MACs per output position:

$$
\begin{aligned}
\text{standard:}\quad & k^2 C_{\text{in}} C_{\text{out}}, \\
\text{separable:}\quad & k^2 C_{\text{in}} + C_{\text{in}} C_{\text{out}}, \\
\frac{\text{separable}}{\text{standard}}
  &= \frac{k^2 C_{\text{in}}}{k^2 C_{\text{in}} C_{\text{out}}}
   + \frac{C_{\text{in}} C_{\text{out}}}{k^2 C_{\text{in}} C_{\text{out}}}
   = \frac{1}{C_{\text{out}}} + \frac{1}{k^2}.
\end{aligned}
$$

The weights obey the same ratio, because without biases each layer's weight count equals its MACs
per position. On a wide layer the first term is negligible, and a 3 × 3 separable layer costs
about a ninth of the standard one: the saving is a factor of roughly $k^2$.

::: worked title="The Section 4 layer, made separable"
Replace the 3 × 3 convolution from 64 to 128 channels on a 56 × 56 output (Section 4):

- depthwise 3 × 3 on 64 channels: $3 \cdot 3 \cdot 64 = 576$ weights;
- pointwise from 64 to 128 channels: $64 \cdot 128 = 8{,}192$ weights;
- total 8,768 weights, or 8,960 parameters with both layers' biases
  ($576 + 64 + 8{,}192 + 128$), against 73,728 weights and 73,856 parameters.

MACs: $8{,}768 \times 3{,}136 = 27{,}496{,}448$, which is 55.0 MFLOPs against 462.4 MFLOPs for the
standard layer (FLOPs = 2 × MACs, bias additions left out). The ratio is
$73{,}728 / 8{,}768 = 8.41$, and the formula agrees:
$1/(1/128 + 1/9) = 1/0.11892 = 8.41$.
:::

::: figure id=fig-03-14
Standard against depthwise-separable convolution, drawn as blocks. Left: $C_{\text{out}}$
filters, each of size $k \times k \times C_{\text{in}}$, each producing one output map from all
the input channels. Right: $C_{\text{in}}$ separate $k \times k \times 1$ filters, each producing
one map from its own channel, followed by $C_{\text{out}}$ filters of size
$1 \times 1 \times C_{\text{in}}$ that mix those maps. Each side is annotated with its
multiply-accumulates per output position: $k^2 C_{\text{in}} C_{\text{out}}$ against
$k^2 C_{\text{in}} + C_{\text{in}} C_{\text{out}}$.
:::

### What the factorisation gives up

Compose the two layers. The depthwise filter $D_{c'}$ turns channel $c'$ into a filtered map, and
the pointwise weights $P_{c,c'}$ add those maps into output channel $c$ (biases omitted):

$$
Y_{c,i,j} = \sum_{c'} P_{c,c'} \sum_{u,v} D_{c',u,v}\, X_{c',\,i+u,\,j+v}
          = \sum_{c'} \sum_{u,v} \big(P_{c,c'}\, D_{c',u,v}\big)\, X_{c',\,i+u,\,j+v}.
$$

A separable layer is therefore a standard convolution whose kernel is forced into the form
$K_{c,c',u,v} = P_{c,c'} D_{c',u,v}$. On input channel $c'$, every output channel applies a scaled
copy of the same spatial filter $D_{c'}$, where a standard layer can give each of its
$C_{\text{in}} C_{\text{out}}$ channel pairs its own spatial pattern. MobileNet's Table 4 (Howard
et al. 2017) puts a price on the restriction. On ImageNet the depthwise-separable network reaches
70.6% top-1 with 569 million multiply-adds and 4.2 million parameters; the same network with full
convolutions reaches 71.7% with 4,866 million and 29.3 million. About one point of accuracy buys
8.5 times less compute.

::: worked title="SmallResNet made separable (a Lab 3 extension)"
Replace both 3 × 3 convolutions in every block of Section 8's SmallResNet by a depthwise 3 × 3
(carrying the stride) followed by a 1 × 1. The parameter count falls from 1,228,970 to 187,018, a
factor of 6.6. Stage by stage: 18,560 → 2,752; 57,728 → 9,440; 230,144 → 35,264;
919,040 → 136,064.

The factor is below the 8.7 of a single 256-channel layer for three reasons. The stem (928), the
head (2,570) and the batch norms are unchanged. The 1 × 1 shortcut projections, 2,176 + 8,448 +
33,280 = 43,904 parameters with their batch norms, are already pointwise and do not shrink, so
they become 23% of the smaller network. And in the 32-channel first stage the ratio is only
$1/(1/32 + 1/9) = 7.0$.
:::

::: keyidea
A depthwise-separable layer is a standard convolution with a factorised kernel: it costs about
$1/k^2$ as much, and it can represent only the kernels of that factorised form.
:::

### FLOPs are not run time

A FLOP count measures arithmetic, and a depthwise layer does little arithmetic per byte it moves.
On the 64-channel 56 × 56 map above, the depthwise 3 × 3 performs
$9 \times 64 \times 3{,}136 = 1.8$ million MACs while reading and writing 1.53 MiB of
activations, about 1.1 MACs per byte. The standard 3 × 3 layer performs 231 million MACs on
2.58 MiB of activations and weights, about 85 per byte. A GPU needs tens of operations per byte or
more to keep its arithmetic units busy (the roofline of
[Module 10, Section 2](module_10_EN.html#s2)), so depthwise layers run far below peak and a
separable network's measured speed-up is smaller than its FLOP ratio. Measure on the hardware you
will deploy on; [Lab 3](#lab3)'s extension asks why its separable network does not train 6.6
times faster.

::: check
A standard 3 × 3 convolution with $C_{\text{in}} = C_{\text{out}} = 256$ is replaced by a
depthwise-separable one. What is the cost ratio?
:::

::: answer
$1/256 + 1/9 = 0.0039 + 0.1111 = 0.115$: the separable layer costs 11.5% of the standard one,
about 8.7 times less. The ratio reaches $1/9$ only as $C_{\text{out}}$ grows without bound.
:::

::: check
A 1 × 1 convolution maps 256 channels to 64 on a 14 × 14 map. How many parameters does it have
with bias, and how many MACs does it cost?
:::

::: answer
Parameters $256 \cdot 64 + 64 = 16{,}448$. MACs $256 \cdot 64 \times 14 \cdot 14 =
16{,}384 \times 196 = 3{,}211{,}264$, about 6.4 MFLOPs.
:::

## The classic architectures: LeNet, AlexNet, VGG and Inception {#s7}

The history of convolutional architectures reads best as a sequence of single ideas, each added
to the network before it. Every number in their papers can be checked with the tools of Sections
3 to 6, and checking them is the quickest way to understand a design.

### Reading an architecture table

An architecture table lists, for every layer, the output shape, the kernel and stride, and often
the parameters and multiply-adds. Check each row: the output size with Section 3's formula, the
parameters and MACs with Section 4's. A row that does not follow from the formulas is a misprint
or hides something worth knowing: a partial connection, a bias convention, or multiply-adds
reported as FLOPs.

### LeNet-5: the pattern

LeNet-5 (LeCun et al. 1998) fixed the pattern every later network elaborates: convolution,
subsampling, convolution, subsampling, dense layers. It reads a 32 × 32 image in which the digit
occupies at most the central 20 × 20, so that strokes near the edge of a digit still fall in the
middle of the top detectors' fields. C1 applies six 5 × 5 filters (6 maps of 28 × 28). S2
subsamples each map to 14 × 14: a unit adds the four values of a 2 × 2 window, multiplies the sum
by one trainable coefficient per map, adds one trainable bias per map and applies a sigmoid. C3
applies 5 × 5 filters to give 16 maps of 10 × 10, but each map reads only 3, 4 or 6 of the six S2
maps, following a connection table; the authors give two reasons, to keep the number of
connections in bounds and to break the symmetry between maps. S4 subsamples to 16 maps of 5 × 5.
C5 is a 5 × 5 convolution with 120 filters on a 5 × 5 input, so each of its maps is 1 × 1: in
effect a dense layer. F6 is a dense layer of 84 units, followed by 10 output units. A
cheque-reading system built on this network was deployed commercially in the mid-1990s.

::: worked title="LeNet-5, counted layer by layer"
Parameters follow $k^2 C_{\text{in}} C_{\text{out}} + C_{\text{out}}$; connections count every
multiply-add, bias included, at every output position.

| Layer | Output | Trainable parameters | Connections |
|---|---|---|---|
| C1 | 6 @ 28 × 28 | 6 × (5 · 5 · 1 + 1) = 156 | 28 · 28 · 156 = 122,304 |
| S2 | 6 @ 14 × 14 | 6 × 2 = 12 | 14 · 14 · 6 · 5 = 5,880 |
| C3 | 16 @ 10 × 10 | 60 · 25 + 16 = 1,516 | 10 · 10 · 1,516 = 151,600 |
| S4 | 16 @ 5 × 5 | 16 × 2 = 32 | 5 · 5 · 16 · 5 = 2,000 |
| C5 | 120 @ 1 × 1 | 120 × (5 · 5 · 16 + 1) = 48,120 | 48,120 |
| F6 | 84 | 84 × (120 + 1) = 10,164 | 10,164 |
| Output | 10 | fixed | 10 · 84 = 840 |
| Total | | 60,000 | 340,908 |

C3's 60 is the number of (output map, input map) pairs in the table: six maps read 3 inputs, nine
read 4 and one reads all six, $6 \cdot 3 + 9 \cdot 4 + 1 \cdot 6 = 60$, each pair with its own
5 × 5 kernel. A subsampling unit has five connections (four inputs and the bias). The output
units compare F6's 84 values with fixed target codes, so their 840 connections carry no trainable
parameters. These per-layer counts are the ones LeCun et al. give. Weight sharing is visible in
the totals: 340,908 connections are 5.7 times the 60,000 parameters, and C1 alone has 156
parameters but 122,304 connections.
:::

A modern "LeNet-5" connects C3 fully, pools without weights and ends in a linear 10-way layer. It
has $156 + 2{,}416 + 48{,}120 + 10{,}164 + 850 = 61{,}706$ parameters, the number most tutorials
print:

```python
import torch, torch.nn as nn

lenet5 = nn.Sequential(                               # full C3, pooling without weights
    nn.Conv2d(1, 6, 5), nn.Tanh(), nn.AvgPool2d(2),    # C1, S2 -> 6 x 14 x 14
    nn.Conv2d(6, 16, 5), nn.Tanh(), nn.AvgPool2d(2),   # C3, S4 -> 16 x 5 x 5
    nn.Conv2d(16, 120, 5), nn.Tanh(), nn.Flatten(),    # C5 -> 120
    nn.Linear(120, 84), nn.Tanh(), nn.Linear(84, 10))  # F6, output
sizes = [sum(p.numel() for p in m.parameters()) for m in lenet5]
print([n for n in sizes if n > 0], sum(sizes))
print(lenet5(torch.zeros(1, 1, 32, 32)).shape)
```

```output
[156, 2416, 48120, 10164, 850] 61706
torch.Size([1, 10])
```

### AlexNet: scale, ReLU and regularisation

AlexNet (Krizhevsky et al. 2012) kept the pattern and scaled it to ImageNet: five convolutional
layers and three dense layers, about 60 million parameters, trained on two GPUs, whose split
survives as its grouped convolutions (Section 6). Most of the parameters sit in the dense layers:
the first maps the $6 \times 6 \times 256 = 9{,}216$ features of the last pooled map to 4,096
units, 37.7 million weights. Four ingredients made it train and generalise:

- ReLU instead of tanh. Their Figure 1 shows a four-layer CNN reaching 25% training error on
  CIFAR-10 six times faster with ReLUs than with tanh units.
- Dropout with probability 0.5 in the first two dense layers
  ([Module 02, Section 11](module_02_EN.html#s11)).
- Augmentation: random 224 × 224 crops of 256 × 256 images, horizontal flips, and colour jitter
  along the principal components of the RGB values.
- Overlapping max pooling: 3 × 3 windows with stride 2.

In the ILSVRC-2012 competition its top-5 test error was 15.3%, against 26.2% for the next entry.
It started the field's move to deep networks.

### VGG: only 3 × 3

VGG (Simonyan and Zisserman 2015) asked what depth alone buys. It uses only 3 × 3 convolutions
with stride 1 and padding 1, which keep the map size, and 2 × 2 max pools with stride 2, which
halve it; the channels double from 64 to 512 across the pools, and the networks it compares have
11 to 19 weight layers, of which VGG-16 and VGG-19 are the ones still in use. Section 3 gave the argument: two stacked 3 × 3 layers see a 5 × 5 window with 18
instead of 25 weights per channel pair, and with a nonlinearity between them. VGG-16 has 138
million parameters, 89% of them in its three dense layers, and costs about 15.5 G multiply-adds
per 224 × 224 image (Section 4). It placed second to GoogLeNet in the 2014 classification task,
and because it is simple it is still a common backbone and feature extractor.

::: worked title="VGG-16's shapes and its largest layers"
At 224 × 224 the five blocks produce 224 × 224 × 64, 112 × 112 × 128, 56 × 56 × 256,
28 × 28 × 512 and 14 × 14 × 512; the last pool leaves 7 × 7 × 512 = 25,088 features. fc6 maps them
to 4,096 units: $25{,}088 \times 4{,}096 + 4{,}096 = 102{,}764{,}544$ parameters, 74% of the
network's 138,357,544 in one layer. The most expensive layer is the second 3 × 3 at full
resolution: $9 \cdot 64 \cdot 64 \times 224^2 = 36{,}864 \times 50{,}176 = 1.85$ G MACs, with only
36,928 parameters.
:::

### Inception: parallel branches

GoogLeNet (Szegedy et al. 2015) asked which kernel size to use and answered "all of them". An
inception module runs 1 × 1, 3 × 3 and 5 × 5 convolutions and a 3 × 3 max pool in parallel and
concatenates their outputs along the channel axis (Figure 3.15). Section 6's 1 × 1 bottlenecks
keep it affordable: module (3a) as a whole has 163,328 weights and costs 128 M MACs, of which its
reduced 5 × 5 branch takes 12.4 M. The network is 22 layers deep, counting layers with parameters,
and the paper states that it uses 12 times fewer parameters than AlexNet. It won the ILSVRC-2014
classification task with 6.67% top-5 error. Two auxiliary classifiers, small heads on
intermediate layers whose losses were added with weight 0.3 during training, were meant to push
gradient into the early layers: a fix for depth from before residual connections.

### How the headline numbers are defined

The ImageNet numbers in this module come from the ILSVRC classification task (Russakovsky et al.
2015): 1.2 million training images in 1,000 classes, 50,000 validation images and 100,000 test
images. **Top-5 error** counts a prediction as correct when the true class is among the five
highest-scoring classes; **top-1** requires it to be the highest. The two cannot be compared with
each other. Competition entries were often ensembles of several networks evaluated on many crops,
so a competition result is not the accuracy of one network on one view.

### The thread

Each network is its predecessor plus one idea: LeNet's pattern, AlexNet's scale and
regularisation, VGG's uniform small kernels, Inception's cheap width. Top-5 error fell from 15.3%
in 2012 to 6.67% in 2014, and the parameter count did not have to rise to get there: VGG-16 has
138 million, GoogLeNet a few million. Depth was the obstacle left, and [Section 8](#s8) removes
it.

::: check
Why does VGG-16's fc6 hold 102.8 million parameters?
:::

::: answer
Its input is the flattened 7 × 7 × 512 map, 25,088 numbers, and it has 4,096 outputs:
$25{,}088 \times 4{,}096 + 4{,}096 = 102{,}764{,}544$. Every position-and-channel has its own
weight to every output, which is what global average pooling removes ([Section 5](#s5)).
:::

::: check
Two stacked 3 × 3 layers against one 5 × 5, both 256 → 256 channels, without bias: how many
weights does each have?
:::

::: answer
$2 \times 9 \times 256^2 = 1{,}179{,}648$ against $25 \times 256^2 = 1{,}638{,}400$: 28% fewer for
the same 5 × 5 receptive field, with one more nonlinearity.
:::

## Residual networks {#s8}

By 2014 depth was paying: VGG reached 19 layers and GoogLeNet 22, with auxiliary classifiers to
get the gradient through. Going much deeper made networks worse, and not because they overfitted.

### The degradation problem

He et al. (2016) trained plain networks, stacks of 3 × 3 convolutions with batch norm and ReLU,
with 20 and with 56 layers on CIFAR-10. Their Figure 1 shows the 56-layer network with the higher
error, on the test set and also on the training set. Higher *training* error rules out
overfitting: the deeper network does not even fit the data it sees. Nor is it short of capacity.
Copy the trained 20-layer network into the first 20 layers of the deeper one and make the other
36 compute the identity: the result has exactly the shallower network's training error. A
solution at least as good exists, and the optimiser does not find it. This is the **degradation
problem**, an optimisation failure. [Lab 3](#lab3) reproduces it on 8 × 8 digits and plots the
training curves.

### The residual block

The fix is to make the identity the default. A **residual block** computes

$$
\mathbf{h}_{l+1} = \mathbf{h}_l + F(\mathbf{h}_l),
$$

where the branch $F$ is a few convolution layers. The block learns only the *change* to its input;
if nothing needs to change, $F = 0$ and the input passes through. In the **basic block** $F$ is conv 3 ×
3, batch norm, ReLU, conv 3 × 3, batch norm, and the original design applies a ReLU after the
addition. When the block changes the shape, by a stride or a new channel count, the shortcut becomes
a strided 1 × 1 convolution with batch norm (a **projection**), so that the two terms can be added
(Figure 3.18, left). The code below is that block and a four-stage network built from it, with its
arithmetic printed.

```python
import torch, torch.nn as nn, torch.nn.functional as F

class Block(nn.Module):                      # conv-BN-ReLU twice, with a residual path
    def __init__(self, cin, cout, stride=1):
        super().__init__()
        self.c1 = nn.Conv2d(cin, cout, 3, stride, 1, bias=False)
        self.b1 = nn.BatchNorm2d(cout)
        self.c2 = nn.Conv2d(cout, cout, 3, 1, 1, bias=False)
        self.b2 = nn.BatchNorm2d(cout)
        self.skip = nn.Identity() if stride == 1 and cin == cout else nn.Sequential(
            nn.Conv2d(cin, cout, 1, stride, bias=False), nn.BatchNorm2d(cout))
    def forward(self, x):
        y = F.relu(self.b1(self.c1(x)))
        y = self.b2(self.c2(y))
        return F.relu(y + self.skip(x))

class SmallResNet(nn.Module):
    def __init__(self, classes=10):
        super().__init__()
        self.stem = nn.Sequential(
            nn.Conv2d(3, 32, 3, 1, 1, bias=False), nn.BatchNorm2d(32), nn.ReLU())
        self.stages = nn.Sequential(
            Block(32, 32), Block(32, 64, 2), Block(64, 128, 2), Block(128, 256, 2))
        self.head = nn.Linear(256, classes)
    def forward(self, x):
        x = self.stages(self.stem(x))
        return self.head(x.mean(dim=(2, 3)))   # global average pooling

net = SmallResNet()
print(sum(p.numel() for p in net.parameters()))          # 1,228,970 parameters
x = torch.zeros(1, 3, 32, 32)
print(net(x).shape)                                       # torch.Size([1, 10])

# output-size arithmetic for one layer
H, k, p, s = 32, 3, 1, 2
print((H + 2 * p - k) // s + 1)                           # 16

count = lambda m: sum(p.numel() for p in m.parameters())
print(count(net.stem), [count(b) for b in net.stages], count(net.head))
```

```output
1228970
torch.Size([1, 10])
16
928 [18560, 57728, 230144, 919040] 2570
```

::: worked title="SmallResNet, counted"
Each batch norm has two parameters per channel ($\gamma$ and $\beta$).

- Stem: $3 \cdot 3 \cdot 3 \cdot 32 + 2 \cdot 32 = 864 + 64 = 928$.
- Block(32, 32): $2 \times 9 \cdot 32 \cdot 32 + 2 \times 64 = 18{,}432 + 128 = 18{,}560$.
- Block(32, 64, 2): $9 \cdot 32 \cdot 64 + 9 \cdot 64 \cdot 64 + 32 \cdot 64 + 3 \times 128 =
  18{,}432 + 36{,}864 + 2{,}048 + 384 = 57{,}728$, the third term being the projection.
- Block(64, 128, 2): $73{,}728 + 147{,}456 + 8{,}192 + 768 = 230{,}144$.
- Block(128, 256, 2): $294{,}912 + 589{,}824 + 32{,}768 + 1{,}536 = 919{,}040$.
- Head: $256 \cdot 10 + 10 = 2{,}570$.

The total is 1,228,970 parameters. On one 32 × 32 image the maps are 32 × 32, 16 × 16, 8 × 8 and
4 × 4 in the four stages. The stem costs $864 \times 1{,}024 = 884{,}736$ MACs; every stage's
second convolution costs 9,437,184 (Section 5), as does stage 1's first; the strided first
convolutions of stages 2 to 4 cost 4,718,592 each, the projections 524,288 each, and the head
2,560. In all, 63,801,856 MACs, or 127.6 MFLOPs.
:::

::: figure id=fig-03-18
The residual block. Left, the original design: the input $\mathbf{h}_l$ splits into the identity
path (a straight line, or a strided 1 × 1 convolution with batch norm when the shapes differ) and
the branch conv 3 × 3, BN, ReLU, conv 3 × 3, BN; the two meet at an addition followed by a ReLU.
Right, the pre-activation variant: the branch is BN, ReLU, conv 3 × 3, BN, ReLU, conv 3 × 3, and
nothing follows the addition.
:::

### Making the identity easy to find

A plain layer computes the identity only if its weights learn it, and with batch norm and ReLU in
the way that is a hard target. A residual block reaches the identity by making $F$ small.
Initialise the last layer of each branch near zero (in practice set the scale $\gamma$ of the
branch's last batch norm to 0, as Goyal et al. 2017 do) and every block starts as the identity: a
deep ResNet begins as a shallow network and grows into its depth as its branches learn.

### Why the gradient survives

Take the pre-activation block of He et al.'s second paper (2016b), in which $F$ is BN, ReLU and
convolution twice and nothing follows the addition (Figure 3.18, right). Write the block equation
for $i = l, \dots, L-1$ and add the equations; the intermediate terms cancel in pairs:

$$
\mathbf{h}_L = \mathbf{h}_l + \sum_{i=l}^{L-1} F_i(\mathbf{h}_i).
$$

Every later representation is an earlier one plus a sum of branch outputs. Differentiate with the
chain rule, writing gradients as row vectors so that they multiply Jacobians from the left:

$$
\frac{\partial \mathcal{L}}{\partial \mathbf{h}_l}
= \frac{\partial \mathcal{L}}{\partial \mathbf{h}_L}\,
  \frac{\partial \mathbf{h}_L}{\partial \mathbf{h}_l}
= \frac{\partial \mathcal{L}}{\partial \mathbf{h}_L}
  \left(\mathbf{I} + \frac{\partial}{\partial \mathbf{h}_l}\sum_{i=l}^{L-1} F_i(\mathbf{h}_i)\right).
$$

The identity term delivers the top gradient to block $l$ unchanged, however deep the network.
For the total to vanish, the second term would have to cancel the identity exactly, for every
example. A plain network $\mathbf{h}_{i+1} = G_i(\mathbf{h}_i)$ has instead a product of Jacobians,
$\partial \mathbf{h}_L / \partial \mathbf{h}_l = \mathbf{J}_{L-1} \cdots \mathbf{J}_l$
([Module 02, Section 3](module_02_EN.html#s3)), which shrinks or grows geometrically when its
factors are a little smaller or larger than 1. Block by block, the residual Jacobian is
$\mathbf{I} + \partial F_i/\partial \mathbf{h}_i$; multiplying out the $L - l$ factors gives a sum
over all $2^{L-l}$ subsets of branches, so the gradient travels along every path, and the
shortest path crosses no branch at all (Figure 3.20).

The original block's ReLU after the addition multiplies each block's Jacobian by that ReLU's 0/1
derivative, so a unit switched off at any block closes its own highway ([Exercise 6](#e6) works
this out). That gate is why He et al. moved to the pre-activation form.

::: worked title="Gains over 50 layers"
Treat each layer's Jacobian as a scalar gain. A plain network with gain 0.9 per layer passes
$0.9^{50} = 0.0052$ of the gradient through 50 layers; with gain 1.1 it multiplies it by
$1.1^{50} = 117.4$. A residual block has gain $1 + \epsilon$, where $\epsilon$ is its branch's
derivative. With $\epsilon = +0.01$ in every block, 50 blocks give $1.01^{50} = 1.64$; with
$\epsilon = -0.01$, $0.99^{50} = 0.61$. Branches that deviate as much as the plain layers do still
compound, but small branches keep the product near 1 without any tuning.
:::

::: figure id=fig-03-20
Gradient flow along five residual blocks. The backward signal is drawn twice: once through the
residual branches, multiplied by each branch's Jacobian, and once along the identity highway,
unchanged from the top of the network to the bottom. Written underneath:
$\partial \mathcal{L}/\partial \mathbf{h}_l = \partial \mathcal{L}/\partial \mathbf{h}_L
\,(\mathbf{I} + \partial/\partial \mathbf{h}_l \sum_i F_i)$.
:::

[Lab 3](#lab3) measures this on 8 × 8 digits with networks of 16-channel 3 × 3 layers. At
initialisation and without normalisation, the gradient reaching the stem of a plain network is
$1.4 \times 10^{-5}$ at 9 layers and $9 \times 10^{-10}$ at 19, and at 55 it underflows to 0 in
float32; the residual network's stays between 0.02 and 0.09 at every depth. The plain network
loses a factor of about 0.4 per layer, close to the $1/\sqrt{6} = 0.41$ predicted for PyTorch's
default initialisation, whose weight variance is a sixth of He's
([Module 02, Section 6](module_02_EN.html#s6)). Batch norm does not cure the plain network: with
it, the 55-layer stem gradient is about 190, exploding instead, against 0.8 with shortcuts. Trained
for 12 epochs with batch norm, the plain 55-layer network's training loss is still about 2.1,
barely below chance, while the residual one reaches about 0.3; at 19 layers the plain network
already trails, about 0.4 against 0.04 with shortcuts. The deep residual network is held back by
the learning rate, not the architecture: at a peak rate of 0.03 or 0.02 instead of 0.05 its loss
falls to 0.04–0.08 over three seeds, while the plain networks stay far behind at every rate tried.

::: keyidea
A residual block adds its input to its output, so the gradient has a path through every block
that multiplies it by the identity: depth no longer makes it vanish.
:::

### The bottleneck block

For ResNet-50, 101 and 152 the branch is 1 × 1, 3 × 3, 1 × 1: a 256-channel input is reduced to
64 channels, filtered by a 3 × 3 at 64 channels and expanded back to 256 (Section 6's
bottleneck).

::: worked title="Bottleneck against basic block at 256 channels"
Bottleneck: $256 \cdot 64 + 9 \cdot 64 \cdot 64 + 64 \cdot 256 = 16{,}384 + 36{,}864 + 16{,}384 =
69{,}632$ weights. A basic block at 256 channels: $2 \times 9 \times 256 \times 256 = 1{,}179{,}648$,
17 times more. The ResNet paper's Figure 5 pairs the 256-channel bottleneck with a basic block at
64 channels, $2 \times 9 \times 64 \times 64 = 73{,}728$ weights, of similar cost: the bottleneck
buys a block four times wider for the same price.
:::

### Results

He et al. trained ResNets up to 152 layers on ImageNet, and an ensemble of them won the
ILSVRC-2015 classification task with 3.57% top-5 error. On CIFAR-10, ResNet-110, with 1.7 million
parameters, reached 6.43% test error (ResNet-20, 0.27 million: 8.75%). A 1,202-layer network
reached a similar training error to the 110-layer one but tested worse, 7.93%: that is
overfitting, 19.4 million parameters on 50,000 training images, not degradation. Depth had
stopped being an obstacle.

### DenseNet: concatenate instead of add

DenseNet (Huang et al. 2017) connects every layer of a block to every earlier one: layer $\ell$
receives the concatenation of all earlier outputs along the channel axis and adds $k$ new
channels, the **growth rate**. In DenseNet-121, with $k = 32$ and 64 channels entering the first
block, that block's sixth layer reads $64 + 5 \cdot 32 = 224$ channels and the block outputs
$64 + 6 \cdot 32 = 256$. DenseNet-121 has about 8 million parameters and strong accuracy per
parameter; the price is activation memory, since every concatenated map is kept for the backward
pass. Concatenation (DenseNet, and U-Net in [Section 12](#s12)) keeps features separate and grows
the width; addition (ResNet) keeps the width fixed and merges them.

The same form, $\mathbf{x} + F(\mathbf{x})$, wraps every attention and feed-forward sublayer of the
transformer ([Module 06, Section 5](module_06_EN.html#s5)), and the derivation above is why
transformers can be stacked dozens of layers deep.

::: check
A residual block with an identity shortcut has its last batch norm's $\gamma$ set to 0. What does
the block compute at initialisation?
:::

::: answer
The branch's last batch norm outputs $\gamma \hat{z} + \beta = 0$ (both start at zero), so
$F(\mathbf{h}) = 0$ and the block returns $\mathrm{ReLU}(\mathbf{h})$ with the original
post-addition ReLU. The input comes from a previous ReLU and is non-negative, so this is
$\mathbf{h}$: the identity.
:::

::: check
Why is Figure 1 of the ResNet paper evidence of an optimisation problem rather than overfitting?
:::

::: answer
The deeper plain network's training error is higher too, not only its test error. An overfitting
network fits its training data better than a smaller one; this one fits it worse, although it
could represent the smaller network exactly.
:::

## Efficient and modern CNNs, and where vision transformers fit {#s9}

Once ResNet had made depth trainable, the work moved to cost: how much accuracy a network delivers
per multiply-add, and how much of a reported gain is due to the architecture at all.

### MobileNet

MobileNet (Howard et al. 2017) uses depthwise-separable blocks throughout (Section 6) and adds two
knobs for trading accuracy against cost. The **width multiplier** $\alpha$ scales every channel
count by $\alpha$; the pointwise layers' cost is proportional to $C_{\text{in}} C_{\text{out}}$,
so it falls by about $\alpha^2$. The **resolution multiplier** $\rho$ scales the input, and with it
every map's height and width, so the cost falls by $\rho^2$. The baseline MobileNet-224 has 4.2
million parameters and costs 569 million multiply-adds at 70.6% ImageNet top-1. It runs on a
phone.

::: worked title="Halving the width"
With $\alpha = 0.5$ both channel counts of every pointwise layer halve, so its MACs fall to
$0.5^2 = 0.25$ of the original. A depthwise layer's MACs, $k^2 C$ per position, fall only to 0.5,
since it has a single channel count; so do the first full convolution (its 3 input channels are
fixed) and the classifier. Counting the layer table of Howard et al. (their Table 1, 224 × 224
input) gives 569 M MACs, 95% of them in the 1 × 1 convolutions. The total therefore falls to
$0.95 \times 0.25 + 0.05 \times 0.5 = 0.26$ of the original: the same count gives 149 M MACs.
:::

### MobileNetV2: the inverted residual

MobileNetV2 (Sandler et al. 2018) adds shortcuts, arranged the other way round from ResNet's
bottleneck. Its **inverted residual** block expands a narrow input with a 1 × 1 convolution (by a
factor of 6), filters at the wide width with a depthwise 3 × 3, and projects back to the narrow
width with a 1 × 1 convolution that has no ReLU after it; the shortcut joins the narrow ends. The
wide middle is affordable because it is depthwise. The projection is left linear because a ReLU
on a narrow representation zeroes part of it, and what it zeroes there is lost: the paper calls
this a linear bottleneck.

### EfficientNet: compound scaling

A network can be enlarged in three ways: deeper, wider or at higher resolution. EfficientNet (Tan
and Le 2019) scales all three together by a fixed ratio. A convolution costs
$k^2 C_{\text{in}} C_{\text{out}} H W$ MACs. Multiplying the width by $w$ multiplies both channel
counts, and the cost by $w^2$; multiplying the resolution by $r$ multiplies $H$ and $W$, and the
cost by $r^2$; multiplying the depth by $d$ multiplies the number of layers, and the cost by $d$.
So the FLOPs scale as $d\,w^2 r^2$. Compound scaling sets

$$
d = \alpha^\phi, \quad w = \beta^\phi, \quad r = \gamma^\phi
\qquad\Longrightarrow\qquad
\text{FLOPs} \propto \left(\alpha\beta^2\gamma^2\right)^\phi,
$$

and the constraint $\alpha\beta^2\gamma^2 \approx 2$ makes each unit of $\phi$ double the FLOPs. A
grid search on the small baseline B0 at $\phi = 1$ chose $\alpha = 1.2$, $\beta = 1.1$,
$\gamma = 1.15$; B1 to B7 scale B0 with larger $\phi$. EfficientNet-B0 has 5.3 million parameters
and costs 0.39 billion FLOPs, which in this paper are multiply-adds; it reaches 76.3% top-1 in
Table 2 of the ICML paper. A later arXiv revision reports 77.1%, so quote the version you cite.

::: worked title="EfficientNet's constraint"
$\alpha\beta^2\gamma^2 = 1.2 \times 1.1^2 \times 1.15^2 = 1.2 \times 1.21 \times 1.3225 = 1.92$,
about 2. At $\phi = 3$ the rule prescribes depth $\times 1.2^3 = 1.73$, width
$\times 1.1^3 = 1.33$ and resolution $\times 1.15^3 = 1.52$ (224 pixels to about 341), and FLOPs
about $1.92^3 = 7.1$ times those of B0.
:::

### ConvNeXt: separating the recipe from the architecture

ConvNeXt (Liu et al. 2022) set out to measure how much of the vision transformer's advantage lay
in its training recipe rather than its architecture. The authors took ResNet-50 and first trained
it with the transformer era's recipe: AdamW, 300 epochs, mixup, CutMix, RandAugment, random
erasing, stochastic depth and label smoothing. Then they changed the architecture one step at a
time, measuring ImageNet-1k top-1 after each step. Appendix C, Table 10 of the paper lists every
step (Figure 2 plots the same values); rounded to 0.1:

| Step | Top-1 (%) |
|---|---|
| ResNet-50, original recipe | 76.1 |
| modern training recipe | 78.8 |
| stage ratio (3, 3, 9, 3) | 79.4 |
| 4 × 4 stride-4 "patchify" stem | 79.5 |
| depthwise convolution | 78.3 |
| width 64 → 96 | 80.5 |
| inverted bottleneck | 80.6 |
| depthwise layer moved up | 79.9 |
| 7 × 7 kernels | 80.6 |
| GELU instead of ReLU | 80.6 |
| fewer activations | 81.3 |
| fewer normalisations | 81.4 |
| layer norm instead of batch norm | 81.5 |
| separate downsampling layers | 82.0 |

The last value is $81.97 \pm 0.06$. Two steps lose accuracy, and the step after each pays it back:
the depthwise convolution cuts compute, which the widening then spends; moving the depthwise layer
up makes room for its larger kernel. The finished ConvNeXt-T (Table 1) reaches 82.1% with 28.6
million parameters (printed as 29M) and 4.5 G multiply-adds, against 81.3% for the Swin-T
transformer at 28 million and 4.5 G.

::: worked title="Recipe against architecture"
In Table 10 the recipe moves ResNet-50 from 76.1% to 78.8%, +2.7 points, and the architectural
steps move it from 78.8% to 82.0%, +3.2 points. A comparison of the published ConvNeXt-T (82.1%,
Table 1) with the 76.1% baseline would credit the architecture with 6.0 points, of which
$2.7 / 6.0 = 45\%$ is recipe.
:::

The lesson for reading papers: compare architectures only under the same training recipe. An
improvement over a baseline trained with an older recipe may be mostly recipe.

### Where the vision transformer fits

The vision transformer (Dosovitskiy et al. 2021) cuts the image into 16 × 16 patches, embeds each
patch as a token with what amounts to a 16 × 16 convolution of stride 16, and runs a transformer
over the tokens, with no other convolution. With less built in than a CNN it trails comparable
ResNets when trained on ImageNet-1k alone, and matches or beats them after pretraining on far
larger datasets: [Lab 2](#lab2)'s inductive-bias lesson at scale, which
[Module 06, Section 8](module_06_EN.html#s8) takes up in full.

### Where CNNs remain the default

As of 2026, convolutional networks remain a default choice where labelled data are scarce, where
inputs are large (high-resolution images, 3D volumes), where latency or power is constrained, and
where the output is dense, one value per pixel or voxel. Hybrids that combine convolutions with
attention are common.

::: check
Why do width and resolution enter EfficientNet's FLOP constraint squared, but depth only
linearly?
:::

::: answer
A convolution's FLOPs scale with $C_{\text{in}} C_{\text{out}}$, and both channel counts are
proportional to the width; they scale with $HW$, and both sides are proportional to the
resolution. They scale only linearly with the number of layers.
:::

::: check
A paper reports a new architecture at 80.5% ImageNet top-1 against a ResNet-50 baseline at 76.1%.
What do you check first?
:::

::: answer
Whether both were trained with the same recipe. The modern recipe alone moves ResNet-50 to 78.8%,
so up to 2.7 of the 4.4 points may owe nothing to the architecture.
:::

## Training a CNN: augmentation, normalisation and transfer learning {#s10}

An engineering image dataset is usually small: a few hundred labelled micrographs, a few thousand
inspection photographs. This section gives the practical recipe for training a CNN on such data,
with measurements that show when each ingredient helps and when it does not. Optimisers,
learning-rate schedules and the overfit-one-batch test are [Module 02](module_02_EN.html)'s; for a
CNN, train with random crops, flips where they are valid and a cosine schedule.

### Augmentation

**Augmentation** applies random transformations to each training image every time it is used. It
is the most effective regulariser for images, with one rule: every transform must leave the label
true. A vertical flip of a 6 is a 9, and a mirrored 2 is not a digit at all.

- Geometric: random crops (pad and crop back, or crop a random region and resize it), flips,
  small rotations and scalings, and elastic deformations, which the U-Net paper singles out as the
  key augmentation for microscopy with few annotated images. Rotate only where the label is
  rotation-invariant.
- Photometric: brightness, contrast, colour jitter, noise and blur.
- For segmentation the mask receives the same geometric transform as the image, resampled with
  nearest-neighbour interpolation so that it stays a set of labels; photometric transforms touch
  the image only.

**Mixing methods** blend two training examples. **Mixup** (Zhang et al. 2018) forms

$$
\tilde{\mathbf{x}} = \lambda \mathbf{x}_i + (1 - \lambda)\, \mathbf{x}_j, \qquad
\tilde{\mathbf{y}} = \lambda \mathbf{y}_i + (1 - \lambda)\, \mathbf{y}_j, \qquad
\lambda \sim \mathrm{Beta}(a, a),
$$

with one-hot labels $\mathbf{y}$ and $a$ around 0.2, which puts most $\lambda$ near 0 or 1.
**CutMix** (Yun et al. 2019) pastes a random rectangle of $\mathbf{x}_j$ into $\mathbf{x}_i$ and
mixes the labels in proportion to the area pasted. Both make the targets soft.

::: worked title="Mixup with λ = 0.7"
Mix a cat image with a dog image: the input is $0.7\,\mathbf{x}_{\text{cat}} +
0.3\,\mathbf{x}_{\text{dog}}$, pixel by pixel, and the target is $(0.7, 0.3)$. For a predicted
cat probability $q$, the cross-entropy against this target is
$\mathcal{L}(q) = -0.7 \ln q - 0.3 \ln(1 - q)$. Setting the derivative to zero,
$-0.7/q + 0.3/(1 - q) = 0$, gives $0.3q = 0.7(1 - q)$, so $q = 0.7$: the loss is minimised by
predicting exactly $(0.7, 0.3)$. Its minimum is the target's entropy,
$-0.7 \ln 0.7 - 0.3 \ln 0.3 = 0.611$, not 0, so the network is rewarded for being as uncertain as
the blend.
:::

### Augmentation must match deployment

A transform can preserve every label and still hurt. Augmentation tells the network which
variation to ignore; if the test data never contain that variation, the network spends capacity
on it for nothing. Try-this items 2 and 3 of [Lab 2](#lab2) measure both sides on digits; runs
made when this module was prepared gave these numbers:

- On the centred 8 × 8 digits, with 20 training images per class, random shifts of ±1 pixel and
  rotations of ±10° lower validation accuracy from about 0.90 to about 0.83. A one-pixel shift is
  an eighth of the image, the centred test set contains no such shifts, and the 1,898-parameter
  network cannot absorb the extra variation.
- On the 16 × 16 canvas, where digits really do appear at different positions, re-placing each
  training digit at a fresh random position every epoch raises test accuracy from 0.36 to 0.66 at
  5 images per class, and from 0.76 to 0.90 at 20.

Augment with the variation the deployment data contain, and check the choice on a validation set
drawn like those data.

### Normalising the input

Subtract the training set's per-channel mean and divide by its per-channel standard deviation,
so that the first layer sees inputs of order 1. With a pretrained backbone, use *its* statistics,
not your dataset's: for torchvision's ImageNet models, RGB values scaled to $[0, 1]$, then mean
$(0.485, 0.456, 0.406)$ and standard deviation $(0.229, 0.224, 0.225)$. The channel order, the
value range and the resize convention are part of the same contract.

::: worked title="What a pretrained backbone expects"
A white pixel $(1, 1, 1)$ becomes
$\big((1 - 0.485)/0.229,\ (1 - 0.456)/0.224,\ (1 - 0.406)/0.225\big) = (2.25, 2.43, 2.64)$, and a
black one $(0, 0, 0)$ becomes $(-0.485/0.229, -0.456/0.224, -0.406/0.225) = (-2.12, -2.04, -1.80)$.
Skip the normalisation and the backbone receives 1.0 and 0.0 where it expects these values; feed
0–255 integers and it receives 255, a hundred times its usual scale. In [Lab 4](#lab4), feeding
raw $[0, 1]$ pixels instead of standardised ones to the pretrained digit backbone drops the linear
probe from about 0.71 to about 0.21, chance for five classes, at 10 images per class.
:::

### Batch normalisation in CNNs

In a CNN, batch norm computes its statistics per channel over the batch and both spatial axes,
$(B, H, W)$; conv, BN, ReLU was ResNet's recipe and remains common. [Module 02, Section
10](module_02_EN.html#s10) owns the mechanics. Below about 16 examples per batch the statistics
become unreliable, and **group normalisation** (Wu and He 2018), which normalises each example over
groups of channels, or layer norm replaces it. What counts is the number of independent examples,
not the number of values: two 64 × 64 images give 8,192 values per channel, but from two examples.
When fine-tuning with small batches, keep a pretrained backbone's batch-norm layers in eval mode.
`requires_grad=False` stops their weights from changing, but not their running means and
variances, which update from your batches whenever the layer is in train mode.

### Transfer learning

A backbone pretrained on a large, generic dataset has learned edge, texture and shape detectors
that transfer. Replace its final layer with one for your labels and fine-tune: first the new
layer alone at a normal learning rate, then the whole network at about a tenth of it. The
options, from the fewest trained parameters to the most (Figure 3.24 draws them with the
accuracies of [Lab 4](#lab4)):

1. **Linear probe**: freeze the whole backbone and train only a new linear head on its features.
2. **Keep early layers**: copy the first blocks, frozen, and train the rest from random weights.
3. **Fine-tuning**: start every layer from its pretrained weights and train them all, with
   **discriminative learning rates** (smaller for earlier layers) as a refinement.
4. **Training from scratch**.

The choice depends on two things: how many labelled images there are, and how close the source
data are to the target. A probe needs the least data but works only if the backbone's last
features suit the new task. Yosinski et al. (2014) found early layers general and later layers
specific to the source task, so a distant or narrow source should contribute only its early
layers.

::: worked title="Lab 4's transfer table"
[Lab 4](#lab4) pretrains a three-block CNN on a narrow source, the 675 training images of digits
0–4, and adapts it to digits 5–9 from $n$ labelled images per class. Mean accuracy over seeds 0–4
on the 224 held-out images of digits 5–9:

| Strategy | $n = 5$ | $n = 20$ |
|---|---|---|
| (a) scratch | 0.913 | 0.969 |
| (b) block 1 kept and frozen | 0.909 | 0.966 |
| (c) blocks 1–2 kept and frozen | 0.873 | 0.959 |
| (d) linear probe | 0.662 | 0.762 |
| (e) probe, then fine-tune everything at a tenth of the rate | 0.807 | 0.960 |
| (f) block 1, then fine-tune everything at a tenth of the rate | 0.902 | 0.981 |

The deeper the copied features, the worse the result at $n = 5$. The first block, stroke and edge
detectors, matches training from scratch (0.909 against 0.913): its features are general, but
with 144 weights they are also cheap to learn from 25 images, so copying them gains nothing here.
Copying blocks 1–2 costs 4 points, and the probe is 25 points worse than scratch: the last block's
features are specific to digits 0–4. Fine-tuning recovers part of what the probe loses
(0.662 → 0.807) but still trails scratch at $n = 5$. Seed-to-seed standard deviations are
0.007–0.034, so at $n = 20$ every option except the probe lies within about one spread of the
others; the argument rests on $n = 5$ and on the probe. A narrow source transfers little beyond
its first block. ImageNet's 1.28 million images in 1,000 classes are why its whole backbone
transfers (Lab 4 shows a torchvision ResNet-18 version as an extension that is not executed; no
number here depends on it).
:::

::: figure id=fig-03-24
Four transfer strategies on a three-block backbone with a new head: (a) training from scratch, all
blocks new; (b) the first block kept and frozen (a padlock), the other two new; (c) a linear
probe, all three blocks frozen and only the head trained; (d) fine-tuning, the head trained first
and then all blocks at a tenth of the learning rate. Each panel is annotated with Lab 4's mean
accuracy over five seeds at 5 images per class: 0.91, 0.91, 0.66 and 0.81.
:::

Pretraining helps less when the target set is large. He, Girshick and Dollár (2019) trained
detectors on COCO from scratch and matched ImageNet-pretrained ones given longer schedules; Raghu
et al. (2019) found small accuracy gains from ImageNet pretraining on large medical-imaging
datasets, with faster convergence. With a few hundred labelled images, pretraining remains the
default starting point, including for scientific images that look nothing like the pretraining
set.

### A small-data checklist

- Start from a pretrained backbone, or at least from pretrained early layers.
- Use strong augmentation that preserves the label and matches deployment.
- Keep the head small.
- Stop early on a validation set split by specimen, not by image
  ([Module 01, Section 10](module_01_EN.html#s10)).
- Report results over several seeds and folds.

::: keyidea
Augment with the variation the test data contain, normalise exactly as the backbone expects, and
reuse as much of a pretrained network as the closeness of its source justifies.
:::

::: check
You set `requires_grad=False` on a pretrained backbone and train a new head with the whole model
in train mode. What in the backbone still changes?
:::

::: answer
Its batch-norm running means and variances, which update from your batches whenever those layers
are in train mode. Put the frozen blocks' batch-norm layers in eval mode, and again after every
`model.train()` call.
:::

::: check
Top-down images of solar panels are inspected for cracks. Are horizontal flips, vertical flips and
90° rotations label-preserving?
:::

::: answer
All three, if the crack labels carry no orientation. If a label encodes direction (for example,
"crack parallel to the busbar"), the label must be transformed with the image, or those transforms
dropped.
:::
