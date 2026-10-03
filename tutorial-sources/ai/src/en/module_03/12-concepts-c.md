## Detection: boxes, anchors, IoU and NMS {#s11}

An inspection system must say where, and how many: every pore on a weld radiograph. **Object
detection** outputs a set of triples (box, class, score), of any size, empty included. A box is
written by its corners $(x_1, y_1, x_2, y_2)$ or by its centre and size $(x, y, w, h)$. The backbone
is the CNN of the previous sections; what is new is box geometry, turning dense predictions into a
list, and scoring the list.

### Intersection over union

Two boxes are compared by their **intersection over union**,

$$
\mathrm{IoU}(A, B) = \frac{|A \cap B|}{|A \cup B|} = \frac{|A \cap B|}{|A| + |B| - |A \cap B|}.
$$

The intersection of two axis-aligned boxes is a box whose lower corner is the larger of the two
lower corners and whose upper corner is the smaller of the two upper corners; its width is
$\max\big(0, \min(x_2^A, x_2^B) - \max(x_1^A, x_1^B)\big)$, and likewise its height. PASCAL VOC
counts a detection as a true positive if its IoU with a not-yet-matched ground-truth box of the same
class exceeds 0.5; COCO repeats the evaluation at the ten thresholds $0.50, 0.55, \dots, 0.95$
and averages, which rewards tight boxes.

::: worked title="Three IoUs"
$A = (0, 0, 10, 10)$, $B = (1, 1, 11, 11)$, $D = (5, 5, 15, 15)$; each box has area 100.

- $A$ and $B$: the intersection runs from $\max(0, 1) = 1$ to $\min(10, 11) = 10$ on both axes,
  $9 \times 9 = 81$; the union is $100 + 100 - 81 = 119$; IoU $= 81/119 = 0.681$.
- $A$ and $D$: from 5 to 10 on both axes, 25; union 175; IoU $= 0.143$.
- $B$ and $D$: from 5 to 11, 36; union 164; IoU $= 0.220$.

A diagonal one-pixel shift of a 10-pixel box already costs a third of the IoU.
:::

### Anchors and the box parameterisation

A network cannot regress an unknown number of boxes directly. Faster R-CNN (Ren et al. 2015) places
$k$ **anchors**, reference boxes of several scales and aspect ratios, at every feature-map position:
3 scales × 3 ratios, $k = 9$ (Figure 3.27, left). For each anchor the network predicts class scores and
four offsets:

$$
t_x = \frac{x - x_a}{w_a}, \quad t_y = \frac{y - y_a}{h_a}, \quad
t_w = \ln\frac{w}{w_a}, \quad t_h = \ln\frac{h}{h_a}.
$$

Decoding inverts this: $x = x_a + t_x w_a$, $w = w_a e^{t_w}$. Dividing by the anchor's size makes
the shifts scale-free, and the logarithm keeps every decoded width positive and makes size errors
relative. A 1000 × 600 image at stride 16 gives about 60 × 40 = 2,400 positions, and so about 20,000
anchors, the figure Ren et al. give.

::: worked title="Offsets for one anchor"
Anchor: centre $(50, 50)$, size $32 \times 32$. Object: centre $(54, 46)$, size $40 \times 24$.

$$
\begin{aligned}
t_x &= (54 - 50)/32 = 0.125, & t_y &= (46 - 50)/32 = -0.125, \\
t_w &= \ln(40/32) = \ln 1.25 = 0.223, & t_h &= \ln(24/32) = \ln 0.75 = -0.288.
\end{aligned}
$$

The network learns small corrections, not pixel coordinates.
:::

::: figure id=fig-03-27
Anchors and NMS. Left: one feature-map cell with its 9 anchors (3 scales × 3 aspect ratios) drawn
over an image. Right: the A–D example before and after NMS at 0.5, each box labelled with its score,
B greyed out as suppressed.
:::

### The loss

A classification term over the sampled anchors plus a box term over those matched to objects:

$$
\mathcal{L} = \frac{1}{N_{\text{cls}}} \sum_a \ell_{\text{cls}}(\mathbf{p}_a, c_a)
+ \frac{\lambda}{N_{\text{reg}}} \sum_{a \text{ matched}}
\sum_{m \in \{x, y, w, h\}} \operatorname{smooth}_{L_1}\big(t_{a,m} - t^*_{a,m}\big),
$$

with targets $t^*$ computed as above and $\operatorname{smooth}_{L_1}(e) = 0.5e^2$ for $|e| < 1$,
$|e| - 0.5$ otherwise: quadratic near zero, linear for outliers. Later detectors use IoU-based box
losses, which optimise what evaluation measures.

### Two stages or one

A **two-stage detector** proposes, then classifies. In Faster R-CNN a **region proposal network**
scores every anchor as object or background and keeps a few hundred to about two thousand proposals.
**RoI pooling** max-pools each proposal's region of the feature map into a fixed 7 × 7 grid, and a
second head classifies the region and refines its box. Mask R-CNN (He et al. 2017) replaced it by
**RoI align**, which samples bilinearly instead of rounding the region's edges. Two stages are
accurate but slower. Figure 3.28 sets the two pipelines, and the set-prediction detector described
below, side by side.

A **one-stage detector** predicts class and box at every cell or anchor in one pass. YOLO (Redmon et
al. 2016) divides the image into a 7 × 7 grid; each cell predicts 2 boxes of 5 numbers (four
coordinates and a confidence) and 20 class probabilities, an output of
$7 \times 7 \times (2 \cdot 5 + 20) = 7 \times 7 \times 30$. SSD (Liu et al. 2016) places anchors on
several feature maps. Of about 20,000 anchors nearly all are easy background, and their summed
cross-entropy swamps the few objects. RetinaNet (Lin et al. 2017) introduced the **focal loss**;
with $p_t$ the predicted probability of the true class,

$$
\mathrm{FL}(p_t) = -\alpha_t (1 - p_t)^{\gamma} \ln p_t ,
$$

cross-entropy scaled by $(1 - p_t)^\gamma$, with $\gamma = 2$ and $\alpha = 0.25$ for the object
class in the paper.

::: worked title="The focal factor with γ = 2"
Leaving $\alpha_t$ aside:

| $p_t$ | $-\ln p_t$ | $(1 - p_t)^2$ | focal loss |
|---|---|---|---|
| 0.99 (easy) | 0.01005 | $10^{-4}$ | $1.0 \times 10^{-6}$ |
| 0.5 | 0.693 | 0.25 | 0.173 |
| 0.1 (hard) | 2.303 | 0.81 | 1.865 |

19,900 easy negatives at $p_t = 0.99$ contribute $19{,}900 \times 0.01005 = 200$ of cross-entropy,
as much as 87 hard examples, but only 0.020 of focal loss.
:::

::: figure id=fig-03-28
Three detection pipelines as block diagrams. One-stage: backbone, dense head with class and box per
anchor, NMS. Two-stage: backbone, region proposal network, RoI pooling or align, classification and
box refinement, NMS. DETR: backbone, transformer, N box predictions, with Hungarian matching to the
ground truth used in training only.
:::

### Non-maximum suppression

A detector fires on many anchors around each object. **Non-maximum suppression** (NMS) keeps one
(Figure 3.27, right): sort the boxes by score; keep the highest; delete every remaining box of the
same class whose IoU with it exceeds a threshold (0.5 is common); repeat with the best survivor.

::: worked title="NMS on four boxes"
$A$ (score 0.9), $B$ (0.8), $C = (20, 20, 30, 30)$ (0.7) and $D$ (0.6), with $A$, $B$, $D$ as above.
At threshold 0.5: keep $A$; delete $B$ (0.681 with $A$); keep $C$ (IoU 0 with $A$); keep $D$ (0.143
with $A$; $B$ is already gone, so its 0.220 plays no part). Result: $A$, $C$, $D$. At threshold 0.1,
$D$'s 0.143 with $A$ is too much and it goes too: $A$, $C$.
:::

NMS fails in crowds: if two true boxes overlap by more than the threshold, the lower-scoring one is
deleted. **Soft-NMS** (Bodla et al. 2017) instead lowers overlapping boxes' scores by a factor that
shrinks as the IoU grows.

### Average precision

Sort a class's detections by score; at each rank, precision is the fraction of detections so far
that are true positives and recall the fraction of ground-truth objects found. The interpolated
precision at recall $r$ is the highest precision at any recall $\ge r$, and **average precision**
(AP) is the area under that curve. **mAP** averages AP over classes, and COCO's AP also over the ten
IoU thresholds.

::: worked title="AP for five detections"
Five detections ranked by score, TP, TP, FP, TP, FP, against 4 ground-truth objects:

| Rank | Result | Precision | Recall |
|---|---|---|---|
| 1 | TP | 1/1 = 1.000 | 1/4 = 0.25 |
| 2 | TP | 2/2 = 1.000 | 0.50 |
| 3 | FP | 2/3 = 0.667 | 0.50 |
| 4 | TP | 3/4 = 0.750 | 0.75 |
| 5 | FP | 3/5 = 0.600 | 0.75 |

Interpolated precision is 1 up to recall 0.5 and 0.75 from 0.5 to 0.75, so all-point AP is
$0.25 \times 1 + 0.25 \times 1 + 0.25 \times 0.75 = 0.6875$. Recall never reaches 1, so the last
quarter contributes nothing. VOC 2007's 11-point rule gives 0.682 on the same list: say which rule a
quoted AP uses.
:::

### Set prediction

DETR (Carion et al. 2020) puts a transformer ([Module 06](module_06_EN.html)) on a CNN backbone and
outputs a fixed number of (box, class) predictions, most of them "no object". Inside the loss the
Hungarian algorithm matches predictions one-to-one to the ground truth at the lowest total cost, so
each object is claimed by exactly one prediction and duplicates are trained away: no anchors and no
NMS. Mask R-CNN's mask branch extends detection to instance segmentation ([Section 12](#s12)).

::: keyidea
A detector is a dense classifier and box regressor over anchors or cells; IoU defines a match, NMS
turns dense predictions into a set, and AP scores the ranked set.
:::

::: check
Why predict $\ln(w/w_a)$ rather than $w - w_a$?
:::

::: answer
It keeps the decoded width $w_a e^{t_w}$ positive and makes errors relative: 10 pixels matter more
on a 20-pixel box than on a 400-pixel one.
:::

::: check
Two adjacent people produce true boxes with IoU 0.55. What does NMS at 0.5 do, and what are the
options?
:::

::: answer
It deletes the lower-scoring person. Raise the threshold, use Soft-NMS, or use a set-prediction
detector such as DETR that needs no NMS.
:::

## Segmentation: FCN, transposed convolution, U-Net and Dice {#s12}

**Semantic segmentation** labels every pixel with a class; **instance segmentation** also separates
objects of the same class, so two touching cells get two labels (Mask R-CNN adds a mask head to each
detected box). For semantic segmentation the network outputs a map of logits
$\mathbf{Z} \in \R^{C \times H \times W}$, one score per class per pixel, and the basic loss is the
cross-entropy of [Module 01](module_01_EN.html) averaged over pixels:

$$
\mathcal{L} = -\frac{1}{HW} \sum_{i,j} \ln \softmax(\mathbf{Z}_{:,i,j})_{y_{ij}}.
$$

### The fully convolutional network

Long et al. (2015) observed that a classifier's dense layers are convolutions: a dense layer from
$C$ inputs to $C'$ outputs applied to a $1 \times 1$ map is a $1 \times 1$ convolution with the same
$C' \times C$ weights, and a dense layer reading a $7 \times 7 \times 512$ map is a $7 \times 7$
convolution. Rewritten this way, the classifier runs at every position of a larger input, a **fully
convolutional network** (FCN). Its score map is coarse: after five poolings the stride is 32, so a
512 × 512 image gives 16 × 16 scores. The FCN upsamples them to full size and fuses in predictions
from finer maps (stride 16 and 8). Every segmentation network since downsamples to gather context,
then upsamples to recover position.

### Upsampling and the transposed convolution

The decoder upsamples either by interpolation followed by a convolution, or by a **transposed
convolution**, which scatters each input value through the kernel: input $i$ adds $K_t \, x_i$ to
output position $i s + t - p$ for each tap $t$. It is the gradient of a strided convolution with
respect to its input ([Section 2](#s2)), run forwards as a layer with learned weights. Its output
size inverts the convolution's:

$$
H_{\text{out}} = (H - 1)s - 2p + d(k - 1) + \text{output\_padding} + 1,
$$

where `output_padding` picks one of the input sizes that a strided convolution maps to the same
output size.

Output position $o$ receives one contribution for every tap $t$ with $t \equiv o + p \pmod s$. If
$s$ divides $k$, every residue class contains $k/s$ taps and every interior output receives the same
number of contributions. If it does not, some positions receive $\lceil k/s \rceil$ and others
$\lfloor k/s \rfloor$, and in two dimensions the product of two such patterns is a checkerboard
(Figure 3.32).
Training can hide it, but the artefact is easy to produce and hard to remove (Odena et al. 2016).
Kernel sizes divisible by the stride ($k = 2$ or 4 with $s = 2$), or resizing followed by a
convolution, avoid it.

::: worked title="Sizes and overlaps of a transposed convolution"
Doubling a 16 × 16 map:

- $k = 4$, $s = 2$, $p = 1$: $15 \times 2 - 2 + 3 + 1 = 32$.
- $k = 3$, $s = 2$, $p = 1$, `output_padding` $= 1$: $30 - 2 + 2 + 1 + 1 = 32$.

Contributions per output position along one axis, for an all-ones input and kernel with $p = 0$:
$k = 3$ gives 1, 1, 2, 1, 2, 1, 2, … (uneven, so a checkerboard in 2D); $k = 4$ gives 2 at every
interior position; $k = 2$ gives 1 everywhere.
:::

::: figure id=fig-03-32
Transposed convolution with $k = 3$, $s = 2$ in 1D: four input cells, each scattering a 3-cell copy
of the kernel into the output, with the overlap counts written beneath (1, 1, 2, 1, 2, 1, 2, 1, 1);
beside it, the resulting 2D checkerboard for an all-ones input.
:::

### U-Net

The **U-Net** (Ronneberger et al. 2015) is a symmetric encoder–decoder. The contracting path repeats
two 3 × 3 convolutions with ReLU and a 2 × 2 max pooling, doubling the channels from 64 to 1,024.
The expanding path repeats a 2 × 2 up-convolution that halves the channels, a **concatenation** with
the encoder map of the same resolution, and two 3 × 3 convolutions. A final 1 × 1 convolution maps
the 64 channels to class scores (Figure 3.30). The bottleneck sees wide context at a sixteenth of
the resolution; the skips carry the detail it has lost straight across, so fine boundaries
survive.

::: worked title="U-Net's sizes, traced"
The original uses unpadded convolutions, so each 3 × 3 convolution removes 2 pixels. With a
572 × 572 input:

- Encoder: 572 → 570 → 568, pool to 284 → 282 → 280, pool to 140 → 138 → 136, pool to 68 → 66 → 64,
  pool to 32 → 30 → 28 at the bottom.
- Decoder: up to 56 → 52, up to 104 → 100, up to 200 → 196, up to 392 → 388.

The output is 388 × 388, and each encoder map is cropped before concatenation: the first skip crops
568 to 392, $(568 - 392)/2 = 88$ pixels from each side. Large images are tiled with overlapping
context (the overlap-tile strategy). Modern implementations pad, so the output equals the input
whenever the input size is divisible by $2^{\text{depth}}$, here 16.
:::

::: figure id=fig-03-30
U-Net in the style of the original paper. Encoder blocks descend with their map sizes after the
convolutions (568, 280, 136, 64, 28) and channel counts (64, 128, 256, 512, 1,024); decoder blocks
ascend; grey copy-and-crop arrows carry the skips across; red arrows mark 2 × 2 max pooling, green
arrows 2 × 2 up-convolution, and a final 1 × 1 convolution produces the class map.
:::

[Lab 5](#lab5) measures what the skips buy on synthetic images: segment the circles, not the
rectangles of the same brightness (Dice and IoU, defined below, pooled over all validation pixels).
A tuned global threshold reaches Dice 0.64 (IoU 0.47), since brightness cannot tell shapes apart. In
full mode the U-Net reaches Dice 0.965 (IoU 0.933), the same network without skips 0.952 (0.908).
The larger difference is at the boundaries: pixel accuracy within 2 pixels of the true edge is 0.950
with skips and 0.920 without, and the lab's prediction plots show the no-skip model's errors lying
along the object outlines.

### Dice, IoU and the soft Dice loss

With $P$ the predicted foreground and $G$ the true one, the **Dice coefficient** and the **IoU**
(Jaccard index) are

$$
D = \frac{2|P \cap G|}{|P| + |G|} = \frac{2\,\mathrm{TP}}{2\,\mathrm{TP} + \mathrm{FP} + \mathrm{FN}},
\qquad
J = \frac{\mathrm{TP}}{\mathrm{TP} + \mathrm{FP} + \mathrm{FN}}.
$$

They are tied. From the second, $\mathrm{TP} + \mathrm{FP} + \mathrm{FN} = \mathrm{TP}/J$, so
$2\mathrm{TP} + \mathrm{FP} + \mathrm{FN} = \mathrm{TP}(1 + J)/J$ and

$$
D = \frac{2J}{1 + J}.
$$

$D \ge J$, and since $D$ increases with $J$ both rank models identically. Quote one and say which.

To train on Dice directly, replace the sets by probabilities $p_i \in [0, 1]$ and binary targets
$g_i$. With $I = \sum_i p_i g_i$, $P = \sum_i p_i$ and $G = \sum_i g_i$, the **soft Dice loss** is

$$
\mathcal{L}_{\text{Dice}} = 1 - \frac{2I + \epsilon}{P + G + \epsilon}.
$$

(Milletari et al. 2016 square the terms of the denominator.) By the quotient rule, with
$\partial I/\partial p_i = g_i$ and $\partial P/\partial p_i = 1$,

$$
\frac{\partial D}{\partial p_i} = \frac{2 g_i (P + G) - 2I}{(P + G)^2},
$$

positive on foreground pixels and negative on background ones. Every gradient depends on the global
sums, so the loss is normalised by object size. Dice plus cross-entropy is the common combination.

::: worked title="Dice and IoU, hard and soft"
Hard counts $\mathrm{TP} = 80$, $\mathrm{FP} = 20$, $\mathrm{FN} = 20$: $D = 160/200 = 0.80$,
$J = 80/120 = 0.667$, and $2(0.667)/1.667 = 0.80$ as the identity says.

Soft, on four pixels with $\mathbf{p} = (0.9, 0.8, 0.3, 0.1)$ and $\mathbf{g} = (1, 1, 0, 0)$:
$I = 0.9 + 0.8 = 1.7$, $P = 2.1$, $G = 2$, so $D = 3.4/4.1 = 0.829$ and the loss is 0.171. The
gradient of $D$ on a foreground pixel is $(2 \cdot 4.1 - 3.4)/4.1^2 = 4.8/16.81 = +0.286$; on a
background pixel $-3.4/16.81 = -0.202$.
:::

Background usually dominates. A 20 × 20 object in a 256 × 256 image is $400/65{,}536 = 0.61\%$ of
the pixels, so predicting all background scores 99.4% pixel accuracy and Dice 0. Report Dice or IoU
per class instead. Empty masks raise the opposite problem: with no foreground in prediction or
truth, Dice is $0/0$. The $\epsilon$ term defines it as 1, computing Dice over the batch avoids it;
either way, state how images without objects were scored.

U-Net is the standard architecture for biomedical segmentation. Its output is a label mask, the
input a meshing step expects: an isosurface algorithm turns it into a surface whose volume and area
can be measured, as [Section 13](#s13) does with its error budget.

::: keyidea
Segmentation is downsampling for context and upsampling for position; U-Net's skips restore the
boundaries, and Dice, not pixel accuracy, says whether the objects were found.
:::

::: check
Dice is 0.9. What is the IoU?
:::

::: answer
Invert $D = 2J/(1 + J)$: $J = D/(2 - D) = 0.9/1.1 = 0.818$.
:::

::: check
A padded U-Net with four 2 × 2 poolings receives a 100 × 100 image. What goes wrong, and what is the
fix?
:::

::: answer
The encoder gives 100 → 50 → 25 → 12 → 6, the floor discarding a row at 25 → 12. The decoder doubles
6 to 12, which matches, then 12 to 24, which cannot be concatenated with the 25 × 25 encoder map.
Pad the input to a multiple of $2^4 = 16$ (112 × 112) and crop the output back to 100 × 100.
:::

## Signals and volumes: 1D and 3D convolution, and from masks to surfaces {#s13}

Sensor streams, the observation series of a digital twin and spectra are 1D signals; CT scans and
confocal microscopy stacks are 3D volumes. The convolution carries over to both unchanged; what
changes is causality in 1D and cost in 3D.

### 1D convolution and causality

With dilation $d$, a 1D convolution computes $y_t = \sum_{u=0}^{k-1} w_u\, x_{t - u d}$, written so
that the window ends at $t$. The receptive-field arithmetic of [Section 3](#s3) is unchanged: a
stride-1 stack has $r = 1 + \sum_l (k_l - 1) d_l$. What is new is direction. A forecaster must not
see the future, so a **causal convolution** pads $(k - 1)d$ zeros on the left only: the output keeps
the input's length, and the output at time $t$ depends only on inputs up to $t$. Symmetric padding
would let each output read $(k - 1)d/2$ future samples, a leak that flatters a forecaster offline.

Dilation gives long histories without the loss of time resolution stride would cause. WaveNet (van
den Oord et al. 2016) stacked causal convolutions of kernel 2 with dilations doubling at every
layer; Figure 3.33 draws the first three layers of such a stack.

::: worked title="A WaveNet-style receptive field"
Kernel 2, dilations $1, 2, 4, \dots, 512$ (ten layers):

$$
r = 1 + \sum_{l=0}^{9} (2 - 1)\, 2^l = 1 + (2^{10} - 1) = 1{,}024 \text{ samples}.
$$

Three such blocks reach $1 + 3 \times 1{,}023 = 3{,}070$. Undilated kernel-2 layers would need 1,023
layers for the same field.
:::

::: figure id=fig-03-33
A dilated causal stack: four rows of dots (the input and three layers with dilations 1, 2 and 4,
kernel 2). The connections of one output at time $t$ fan back to the inputs $t - 7, \dots, t$, none
reaching the future; the receptive field of 8 is labelled.
:::

Such residual stacks, **temporal convolutional networks** (Bai et al. 2018), are strong baselines
against recurrent networks for sequence tasks. [Module 04, Exercise 15](module_04_EN.html#e15)
replaces an LSTM forecaster with a dilated causal stack and compares the two.

### 3D convolution and its cost

A 3D layer has $k^3 C_{\text{in}} C_{\text{out}} + C_{\text{out}}$ parameters and costs
$k^3 C_{\text{in}} C_{\text{out}} D_{\text{out}} H_{\text{out}} W_{\text{out}}$ MACs: one more
factor of $k$ than 2D. The **3D U-Net** (Çiçek et al. 2016) is [Section 12](#s12)'s U-Net with
3 × 3 × 3 convolutions, trained from sparsely annotated slices.

::: worked title="3D against 2D, and one encoder block"
A 3 × 3 × 3 convolution from 32 to 32 channels has $27 \times 32 \times 32 + 32 = 27{,}680$
parameters, against $9 \times 32 \times 32 + 32 = 9{,}248$ for 3 × 3 in 2D.

The block below (convolution, group norm, ReLU, twice, then pooling, returning the pre-pool map for
the skip) has, for 1 → 32 channels, $27 \times 32 + 32 = 896$ for the first convolution, 64 for its
group norm, 27,680 for the second convolution and 64 for its norm: $28{,}704$.
:::

```python
import torch.nn as nn
import torch.nn.functional as F

class Down3D(nn.Module):
    def __init__(self, cin, cout):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv3d(cin, cout, 3, padding=1), nn.GroupNorm(8, cout), nn.ReLU(),
            nn.Conv3d(cout, cout, 3, padding=1), nn.GroupNorm(8, cout), nn.ReLU())

    def forward(self, x):
        skip = self.conv(x)                  # kept for the decoder's skip connection
        return F.max_pool3d(skip, 2), skip

print(sum(p.numel() for p in Down3D(1, 32).parameters()))
```

```output
28704
```

Group norm, because a volume batch is usually one or two stacks, where batch norm's statistics
([Module 02, Section 10](module_02_EN.html#s10)) are meaningless; group norm normalises each example
over groups of channels and all voxels, independently of the batch.

### Memory decides the patch size

In 3D the binding constraint is the activations kept for the backward pass.

::: worked title="Activation memory of a 3D encoder"
Float32, batch 1, a $128^3$ patch, four levels with 32, 64, 128 and 256 channels, six stored tensors
per level (two convolution outputs, two normalisation outputs, two activations). One 32-channel map
is $128^3 \times 32 \times 4\ \text{B} = 256\ \text{MiB}$. Each level halves every axis and doubles
the channels, so a map shrinks fourfold per level:

$$
6 \times (256 + 64 + 16 + 4)\ \text{MiB} = 1{,}536 + 384 + 96 + 24 = 2{,}040\ \text{MiB}
\approx 2.0\ \text{GiB},
$$

before the decoder, which costs about as much again. A 32-channel map of a 512 × 512 slice is
32 MiB.
:::

So volumes are trained on patches with a batch of one or two. **Sliding-window inference** tiles the
volume with overlapping patches and blends the overlaps, by averaging or with Gaussian weights that
trust a patch's centre more than its padded edges, so that no seams appear. The U-Net paper's
overlap-tile strategy is the 2D version.

### Anisotropic voxels and cheaper 3D

Confocal stacks are often sampled at 0.5 × 0.5 µm in plane and 2 µm between slices: a 3 × 3 × 3
kernel spans 1.5 µm across but 6 µm deep. Remedies: resample to isotropic voxels, use anisotropic
kernels (1 × 3 × 3 in early layers), or segment slice by slice in 2D. Whichever is chosen, the
spacing must travel with the data.

The **(2+1)D** factorisation replaces a 3 × 3 × 3 convolution by a 1 × 3 × 3 spatial one and a
3 × 1 × 1 axial one: $9C^2 + 3C^2 = 12C^2$ weights instead of $27C^2$ at width $C$. Depthwise 3D
convolutions follow [Section 6](#s6).

### From mask to surface

A U-Net trained on annotated microscopy or CT produces a probability volume and, thresholded, a
mask. Volume is voxel count times voxel volume. The surface is an isosurface extracted by **marching
cubes** (Lorensen and Cline 1987): visit each cube of 8 neighbouring voxel centres; classify its
corners as inside or outside ($2^8 = 256$ cases, 15 up to rotation and complement); on each edge
whose corners disagree, place a vertex by linear interpolation of the probability at level 0.5; and
join the vertices into triangles from a lookup table. Scaled by the spacing, the mesh gives area and
enclosed volume.

Counting exposed voxel faces is biased at every resolution. For a convex object the faces looking
along $+x$ add up to its projected area on the $yz$ plane, so a sphere shows $6\pi r^2$ of faces
against $4\pi r^2$, a factor of 1.5 at any voxel size. In 2D a disc's pixel-edge perimeter is $8r$
against $2\pi r$, a factor of $4/\pi = 1.27$. Figure 3.35 sets the staircase beside the isosurface
in both dimensions.

::: worked title="Measuring ideal shapes"
NumPy and contourpy, with the centre offset from a pixel centre by (0.2, 0.2) pixels for the disc
and from a voxel centre by (0.3, 0.3, 0.3) voxels for the spheres.

- A disc of radius 8: 201 pixels against $\pi \times 64 = 201.1$; pixel-edge perimeter $64 = 8r$,
  27% over $2\pi r = 50.3$; marching squares (marching cubes in 2D) on the binary mask 52.9 (+5%),
  on the mask blurred by a Gaussian of 0.9 pixels 50.2.
- A sphere of radius 10: 4,199 voxels against 4,188.8; exposed faces 1,884 against
  $4\pi r^2 = 1{,}256.6$, ratio 1.50 (1.51 at $r = 5$, 1.50 at $r = 20$).

On [Lab 5](#lab5)'s predicted masks (full mode, the 160 of 161 isolated validation circles that
the U-Net found) the area by pixel count averages 0.999 of $\pi r^2$ (standard deviation 0.029),
the pixel-edge perimeter 1.266 of $2\pi r$ (close to $4/\pi$), and the 0.5 iso-contour of the
predicted probability 1.033 (standard deviation 0.017).
:::

::: figure id=fig-03-35
Staircase against isosurface. Left: a digital disc of radius 8 with its pixel-edge boundary
(length 64), the marching-squares contour of the mask blurred by a Gaussian of 0.9 pixels (50.2)
and the true circle (50.3). Right: a cut-away voxelised sphere beside its smooth marching-cubes
mesh. Beneath: icons of the 15 marching-cubes base cases.
:::

### An error budget

[Module 01, Section 8](module_01_EN.html#s8)'s split into bias and variance organises a measurement.
**Bias** comes from discretisation (the staircase), the threshold level and systematic segmentation
errors; **variance** from noise and from where the object falls on the voxel grid.

::: worked title="An anisotropic ellipsoid"
Semi-axes 12, 9 and 7 µm, spacing 0.5 × 0.5 × 2.0 µm (0.5 µm³ per voxel). True volume
$\frac{4}{3}\pi \times 12 \times 9 \times 7 = 3{,}166.7$ µm³; true area 1,083.1 µm².

- At one sub-voxel placement, 6,372 voxels: $6{,}372 \times 0.5 = 3{,}186.0$ µm³, +0.6%.
- Over 20 random placements: mean about 3,170 (bias +0.1%), standard deviation about 30 (1%). The
  volume error is mostly variance.
- Exposed faces: about 1,610 µm², +48.6%.
- Marching cubes (scikit-image) on the binary mask: about 1,316 µm², +21%. A binary field puts
  every vertex at the midpoint of its edge, so the mesh keeps the terraces of the staircase, and
  the 4:1 voxel shape makes them coarse; refining the grid at the same shape does not remove the
  excess, while isotropic voxels reduce it. After a 0.5 µm Gaussian blur, about 1,137 µm², +5%.
  Mesh a probability volume or a lightly smoothed mask.
- Read with spacing 1 × 1 × 1: 6,372 µm³, twice the truth.

[Exercise 14](#e14) repeats the analysis on a second ellipsoid.
:::

Slices of one volume are near-duplicates, so split evaluation data by specimen, not by slice
([Module 01, Section 10](module_01_EN.html#s10)).

::: keyidea
1D and 3D convolutions are the same operation; in 3D, memory sets the patch size, the spacing is
part of the data, and a measured surface needs an isosurface and an error budget.
:::

::: check
How much left padding does a causal 1D convolution with $k = 3$ and $d = 4$ need to keep the output
as long as the input?
:::

::: answer
$(k - 1)d = 2 \times 4 = 8$ zeros, all on the left.
:::

::: check
Why does the exposed-face area of a voxelised sphere not converge to $4\pi r^2$ as the voxels
shrink?
:::

::: answer
Every face is axis-aligned, and the faces sum to twice the projected area on each axis plane,
$6\pi r^2$, at any resolution: refinement makes the staircase finer, not flatter.
:::

::: check
Group norm with 16 groups on 64 channels of a $32^3$ patch: how many values enter each mean?
:::

::: answer
$64/16 = 4$ channels per group, so $4 \times 32^3 = 131{,}072$ values, all from one example.
:::

## Looking inside: filters, saliency and Grad-CAM {#s14}

A classifier with a high test score may still be using the wrong evidence. This section gives the
cheap tools for checking what a CNN uses, derives the most useful of them, Grad-CAM, and states what
such maps can and cannot show.

### Filters and feature maps

Early filters learn edges and colour blobs; later layers respond to textures, then parts, then
objects. Krizhevsky et al. (2012, Figure 3) showed AlexNet's 96 first-layer filters as small colour
images, and Zeiler and Fergus (2014) projected the strongest activations of deeper units back to
pixel space to show what each layer responds to. First-layer filters can be displayed directly,
because their weights live in pixel space: a 3 × 3 filter on a greyscale image is a 3 × 3 image.
Step 7 of [Lab 2](#lab2) shows the eight first-layer filters of its digit CNN this way; trained for
a minute on 8 × 8 images, they are noisy versions of the edge and blob detectors of [Section
2](#s2)'s table. Deeper filters cannot, because their inputs are other filters' outputs. For those,
look at the feature maps a given input produces, or collect the input patches that activate a unit
most strongly.

### The saliency map

The **saliency map** (Simonyan et al. 2014) asks which pixels the class score is most sensitive to.
With $y^c$ the score of class $c$ before the softmax and $X_{c',i,j}$ the input,

$$
S_{ij} = \max_{c'} \left| \frac{\partial y^c}{\partial X_{c',i,j}} \right|,
$$

the largest absolute gradient over the colour channels. One backward pass computes it, at full input
resolution. It is also noisy: the input gradient of a deep ReLU network changes sharply from one
pixel to the next, so saliency maps look speckled.

### Grad-CAM, derived

**Grad-CAM** (Selvaraju et al. 2017) works at the last convolutional layer instead, where the
features are semantic but still spatial. Let $A^k$, $k = 1, \dots, K$, be that layer's maps, each
with $Z = H \times W$ positions. First, weight each map by the average gradient of the class score
over its positions:

$$
\alpha_k^c = \frac{1}{Z} \sum_{i,j} \frac{\partial y^c}{\partial A^k_{ij}}.
$$

Then form the weighted sum, keep its positive part and upsample it to the input size:

$$
L^c = \mathrm{ReLU}\Big(\sum_k \alpha_k^c A^k\Big).
$$

$\alpha_k^c$ measures how much feature $k$ raises the score of class $c$; the weighted sum says
where those features are present. The ReLU keeps the regions whose features raise the class score;
negative regions are evidence for other classes.

::: worked title="Grad-CAM by hand"
$K = 2$ maps of 2 × 2, with their gradients:

$$
A^1 = \begin{bmatrix} 1 & 0 \\ 2 & 1 \end{bmatrix}, \quad
\frac{\partial y}{\partial A^1} = \begin{bmatrix} 0.2 & 0.2 \\ 0.4 & 0 \end{bmatrix}, \qquad
A^2 = \begin{bmatrix} 0 & 3 \\ 1 & 0 \end{bmatrix}, \quad
\frac{\partial y}{\partial A^2} = \begin{bmatrix} -0.1 & -0.3 \\ 0 & 0 \end{bmatrix}.
$$

Weights: $\alpha^1 = (0.2 + 0.2 + 0.4 + 0)/4 = 0.2$ and $\alpha^2 = (-0.1 - 0.3 + 0 + 0)/4 = -0.1$.
Weighted sum:

$$
0.2 A^1 - 0.1 A^2 =
\begin{bmatrix} 0.2 & 0 \\ 0.4 & 0.2 \end{bmatrix} -
\begin{bmatrix} 0 & 0.3 \\ 0.1 & 0 \end{bmatrix} =
\begin{bmatrix} 0.2 & -0.3 \\ 0.3 & 0.2 \end{bmatrix},
\qquad
L = \begin{bmatrix} 0.2 & 0 \\ 0.3 & 0.2 \end{bmatrix}.
$$

The top-right cell, where feature 2 (evidence against the class) is strong, is switched off.
:::

**Grad-CAM generalises CAM.** The class activation map of Zhou et al. (2016) applies to networks
whose head is global average pooling followed by a linear layer, as in [Section 8](#s8)'s
`SmallResNet`. There

$$
y^c = \sum_k w_k^c \, \frac{1}{Z} \sum_{i,j} A^k_{ij} + b^c,
\qquad\text{so}\qquad
\frac{\partial y^c}{\partial A^k_{ij}} = \frac{w_k^c}{Z}
$$

at every position, and averaging over positions changes nothing: $\alpha_k^c = w_k^c / Z$. Grad-CAM
is then CAM, $\sum_k w_k^c A^k$, up to the constant $1/Z$ and the ReLU; the gradient form extends it
to any architecture.

::: worked title="The CAM identity, measured"
[Lab 6](#lab6)'s network ends in a 32-channel 16 × 16 map, global average pooling and a linear
layer, so the head averages $16 \times 16 = 256$ positions and the derivation predicts
$\alpha_k^c = w_k^c / 256$. The lab computes $\alpha$ by backpropagation and prints the largest
$|\alpha_k^c - w_k^c/256|$ over all $k$: about $2 \times 10^{-10}$, float32 round-off.
:::

Figure 3.36 draws the whole pipeline for this kind of network.

::: figure id=fig-03-36
The Grad-CAM pipeline: input, CNN, the last convolutional maps $A^1, \dots, A^K$ drawn as a stack,
global average pooling and a linear head, class score $y^c$. A backward arrow runs from $y^c$ to the
maps, whose gradients are global-averaged into the weights $\alpha_k^c$; the weighted sum and a ReLU
give a coarse 16 × 16 map, upsampled and overlaid on the input.
:::

The map is as coarse as the layer it comes from: 7 × 7 for ResNet-50 on a 224 × 224 image, 16 × 16
for Lab 6's 32 × 32 inputs. It says roughly where, not which pixels.

### The use that matters: catching a shortcut

The most common way an image classifier fails silently is by using a background, marker or
acquisition artefact that happened to co-occur with the label in training. Geirhos et al. (2020)
call this **shortcut learning**. A documented case: Zech et al. (2018) trained pneumonia classifiers
on chest radiographs from several hospital systems; a CNN could identify the hospital system of an
image with high accuracy, and the classifiers often did worse on hospitals not seen in training. A
test set drawn like the training set cannot reveal a shortcut, because it contains the same one.

::: worked title="Lab 6's shortcut"
Two small CNNs tell circles from squares on 32 × 32 images. In the shortcut model's training data,
every square carries a 3 × 3 bright marker in its top-left corner.

- Accuracy: the shortcut model scores 1.00 on validation data with the same marker rule, 0.75 on
  clean images and 0.72 when the marker is placed at random. A model trained on clean data scores
  0.98 on clean images and 0.96 with the marker at random.
- Grad-CAM, averaged over 100 squares carrying the marker: the shortcut model puts 27% of its
  map's mass in the 6 × 6 top-left corner, which is $36/1{,}024 = 3.5\%$ of the image; the clean
  model puts 10% there, more than the area share because a bright, sharp-cornered patch excites its
  edge detectors too.
- The saliency map shows the same tendency less clearly: corner shares of 9% and 6%.

The validation score showed nothing; Grad-CAM points at the shortcut, and a test set in which the
marker no longer predicts the class confirms it.
:::

### What the maps cannot show

1. **A map can look plausible and ignore the model.** Adebayo et al. (2018) found that some saliency
   methods produce nearly the same map after the weights are randomised, behaving more like edge
   detectors than explanations. Run that test: Lab 6 re-initialises the shortcut model's last
   convolution and head and finds a Grad-CAM correlation of about 0.18 with the trained map, a
   pass.
2. **A map shows where evidence was found, not what the evidence is or why it counts.** A bright
   region on a crack may mean the crack's shape or the discolouration around it.
3. **A clean map on the images you looked at is not proof.** Use counterfactual tests: move or
   remove the object, change the background, and check that the prediction follows the object. Then
   test on data from a different source.

::: keyidea
Grad-CAM weights the last convolutional maps by their average gradient; it is cheap, coarse and the
fastest way to catch a classifier that is right for the wrong reason, but it is a check, not a
proof.
:::

::: check
Why does Grad-CAM apply a ReLU to the weighted sum?
:::

::: answer
To keep only the regions whose features increase the class score; negative regions are evidence for
other classes.
:::

::: check
Grad-CAM on a ResNet-50 at 224 × 224 gives a 7 × 7 map. Can it tell which of two adjacent 10-pixel
cracks the classifier used?
:::

::: answer
No. Each cell covers about 32 × 32 input pixels, so both cracks fall in the same cell or in
neighbouring ones. Use Grad-CAM at an earlier, finer layer, a saliency map, or an occlusion test
that masks each crack in turn and watches the score.
:::

## What goes wrong {#wrong}

Each entry gives the symptom as you meet it, its cause, and the fix, with the section or lab that
explains the mechanism.

### Pretrained backbones and normalisation layers

**Transfer learning "does not work": the fine-tuned model is worse than one trained from scratch.**
*Cause:* the backbone's input preprocessing was skipped: its mean and standard deviation, channel
order, 0–1 versus 0–255 range or resize convention. *Fix:* apply exactly the backbone's
preprocessing, and print one batch's per-channel mean and standard deviation after it; they should
be near 0 and 1. In [Lab 4](#lab4) skipping it drops the linear probe from 0.71 to 0.21, chance
for five classes ([Section 10](#s10)).

**Training is noisy, and test accuracy changes with the composition of the batch, in a 3D or
high-resolution model.** *Cause:* batch norm with a batch of one or two volumes, whose statistics
are unreliable and differ from the running averages used at test time. *Fix:* group norm or layer
norm, or a pretrained network's frozen batch-norm statistics. Batch norm wants roughly 16 or more
independent examples per batch ([Section 10](#s10); [Section 13](#s13) for volumes).

**A backbone meant to be frozen drifts during fine-tuning: its features, and a linear probe on them,
change from epoch to epoch although no weight was updated.** *Cause:* `requires_grad=False` stops
weight updates, but batch-norm running statistics still update whenever the layer is in train mode.
*Fix:* put the frozen blocks' batch-norm layers in eval mode, and again after every `model.train()`
call.

### Receptive field and augmentation

**The network classifies texture, not shape, and fails on objects larger than those in training.**
*Cause:* the effective receptive field is smaller than the object; the theoretical field may cover
it, but the influence is concentrated near its centre. *Fix:* compute the receptive field ([Section
3](#s3)), look at the effective one with a gradient map ([Lab 3](#lab3)), and add downsampling or
dilation, or rescale the input.

**Accuracy on some classes collapses after adding augmentation.** *Cause:* the augmentation changed
the label (flips of chiral objects, rotations of oriented parts or of digits such as 6 and 9), or a
geometric transform was applied to an image but not to its mask. *Fix:* keep only transforms that
preserve the label in this domain, and apply geometric transforms to masks too, with
nearest-neighbour interpolation.

**Augmentation lowers accuracy although every transform preserves the label.** *Cause:* it adds
variation the deployment data do not contain, or is too strong for the image size or the model's
capacity. Shifts and rotations on centred 8 × 8 digits ([Lab 2](#lab2), Try this 2) took accuracy
from 0.90 to 0.83 in the runs quoted in [Section 10](#s10). *Fix:* match the augmentation to the
variation expected at test time, and check it on a validation set drawn like the deployment data.

### Scores that do not survive new data

**Excellent test scores that collapse on new specimens.** *Cause:* leakage: slices of one volume,
frames of one video or tiles of one slide on both sides of the split. Neighbouring slices share
anatomy, scanner and contrast, so the score measures recognition of specimens already seen. *Fix:*
split by specimen, patient, video or slide (grouped cross-validation), and hold out a whole
acquisition site if possible ([Module 01, Section 10](module_01_EN.html#s10)).

**The classifier is right for the wrong reason: high accuracy that collapses on data from a new
source.** *Cause:* it learned a co-occurring background, marker or acquisition artefact. *Fix:*
inspect Grad-CAM on correct and incorrect predictions, run counterfactual tests (move the object,
change the background), and fix the data ([Section 14](#s14), [Lab 6](#lab6)).

### Segmentation and measurement

**Segmented volumes or areas are off by a constant factor on another scanner.** *Cause:* the model
was trained at one voxel spacing and applied at another, or the spacing was dropped somewhere in the
pipeline. *Fix:* carry the spacing with every volume and mask, resample to the training spacing, and
make the measurement step refuse a mask without a spacing rather than assume 1 × 1 × 1. In [Section
13](#s13) the wrong spacing doubled a volume.

**A shape-mismatch error at a U-Net concatenation, for some image sizes only.** *Cause:* the input
size is not divisible by $2^{\text{depth}}$, so the encoder's floors and the decoder's doublings
disagree. *Fix:* pad the input to a multiple of $2^{\text{depth}}$ and crop the output, or crop or
pad the skip tensors ([Section 12](#s12)).

**Checkerboard patterns in segmented or generated outputs.** *Cause:* a transposed convolution whose
kernel size is not divisible by its stride overlaps unevenly. *Fix:* use $k$ divisible by $s$
($k = 2$ or 4 with $s = 2$), or bilinear upsampling followed by a 3 × 3 convolution.

**The Dice loss is NaN, or the model predicts all background on images without objects.** *Cause:*
Dice is $0/0$ on empty masks, and tiny denominators give huge gradients early in training, when
predicted probabilities are small and a patch may contain no foreground at all. *Fix:* add a
smoothing $\epsilon$ to numerator and denominator, compute Dice over the batch, and combine it with
cross-entropy.

**Pixel accuracy of 99% while objects are missed.** *Cause:* class imbalance; background dominates
the pixel count, and all-background scores 99.4% on a 20 × 20 object in a 256 × 256 image. *Fix:*
report Dice or IoU per class (per object for small objects), and train with Dice or focal losses.

### Shift sensitivity and detection

**Predictions flip when the image moves by one pixel, or a detector misses one of two overlapping
objects.** *Cause:* strided pooling aliases and is not shift-invariant ([Section 5](#s5)); an NMS
threshold that is too low suppresses true neighbours, while one too high keeps duplicates. *Fix:*
augment with shifts and consider anti-aliased downsampling, a low-pass filter before each
subsampling step (Zhang 2019); tune the NMS IoU threshold per class on validation data, or use
Soft-NMS ([Section 11](#s11)).
