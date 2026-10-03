## Lab 4 — Transfer learning, layer by layer {#lab4}

**Goal.** You pretrain a small CNN on the digits 0 to 4 and then adapt it to the digits 5 to 9
from only 5 or 20 labelled images per class. Six ways of doing the adaptation are compared
under identical conditions: training from scratch, copying and freezing one, two or three of the
three convolutional blocks, and fine-tuning after a frozen start. The comparison shows which
layers transfer and which do not, why a frozen backbone can be a poor feature extractor, and how
much the gap closes as the target set grows. The last step reproduces the input-normalisation
mistake of [Section 10](#s10), where a perfectly good backbone appears not to transfer at all.
The lab needs [Section 10](#s10) only. The data ships with scikit-learn, there is no download,
and the whole lab runs in one to two minutes on a laptop CPU.

### Step 1: data, the split and the source and target tasks

The digits are the 8 × 8 images of Lab 2, with the same split: `test_size=0.25`, stratified,
`random_state=0`. The **source task** is the five-way problem on the 675 training images whose
label is 0 to 4. The **target task** is the five-way problem on digits 5 to 9, and its test set
is the 224 held-out images of those digits. Target training sets are small: 5 or 20 images per
class, drawn from the 672 target training images with a seed, so that five seeds give five
different small sets from the same pool.

All images are standardised with the mean and standard deviation of the *source training set*.
That is the rule of [Section 10](#s10): the backbone is trained on inputs with these statistics,
so it must see inputs with these statistics, whatever task follows. Step 7 shows what happens
when this is forgotten.

```python
import time
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

np.random.seed(0)
torch.manual_seed(0)
torch.set_num_threads(4)

X, y = load_digits(return_X_y=True)
X = (X / 16.0).astype(np.float32).reshape(-1, 1, 8, 8)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

src_tr, src_te = ytr < 5, yte < 5
mean, std = Xtr[src_tr].mean(), Xtr[src_tr].std()  # source statistics, used everywhere
Z_tr = torch.from_numpy((Xtr - mean) / std)
Z_te = torch.from_numpy((Xte - mean) / std)
y_tr, y_te = torch.from_numpy(ytr), torch.from_numpy(yte)

print(f"source: {src_tr.sum()} train, {src_te.sum()} test (digits 0-4)")
print(f"target: {(~src_tr).sum()} train pool, {(~src_te).sum()} test (digits 5-9)")
print(f"source mean {mean:.4f}, std {std:.4f}")
```

```output
source: 675 train, 226 test (digits 0-4)
target: 672 train pool, 224 test (digits 5-9)
source mean 0.3052, std 0.3782
```

### Step 2: the backbone

The backbone has three blocks, each a convolution, batch normalisation and ReLU. The first
block sees pixels and can only compute local patterns: strokes and edges. The second adds a
max pool, which halves the map to 4 × 4, and mixes those into short curves and corners. The
third widens to 64 channels and ends in global average pooling, so the backbone's output is a
vector of 64 numbers per image. A linear layer on top is the **head**. Keeping the three blocks
as separate modules makes it possible to copy, freeze or re-initialise any prefix of the
backbone.

The parameter count is exact arithmetic. Block 1: $1 \cdot 16 \cdot 9 + 16 = 160$ convolution
parameters and $2 \cdot 16 = 32$ for batch norm. Block 2: $16 \cdot 32 \cdot 9 + 32 = 4{,}640$
and 64. Block 3: $32 \cdot 64 \cdot 9 + 64 = 18{,}496$ and 128. The sum is 23,520, and the code
prints the same figure; the head adds $64 \cdot 5 + 5 = 325$.

```python
def block(c_in, c_out, pool=False, gap=False):
    layers = [nn.Conv2d(c_in, c_out, 3, padding=1), nn.BatchNorm2d(c_out), nn.ReLU()]
    if pool:
        layers.append(nn.MaxPool2d(2))
    if gap:
        layers += [nn.AdaptiveAvgPool2d(1), nn.Flatten()]
    return nn.Sequential(*layers)


class Net(nn.Module):
    """Three feature blocks and a linear head; each block can be copied or frozen."""

    def __init__(self, n_classes):
        super().__init__()
        self.blocks = nn.ModuleList([block(1, 16), block(16, 32, pool=True),
                                     block(32, 64, gap=True)])
        self.head = nn.Linear(64, n_classes)

    def features(self, x):
        for b in self.blocks:
            x = b(x)
        return x

    def forward(self, x):
        return self.head(self.features(x))


n_backbone = sum(p.numel() for p in Net(5).blocks.parameters())
print(f"backbone parameters: {n_backbone:,}; head: {64 * 5 + 5}")
```

```output
backbone parameters: 23,520; head: 325
```

### Step 3: one training function for every variant

All six experiments are the same loop with different parts frozen, so the loop is written once.
`fit` takes a model, a training set, a number of epochs, a learning rate and the number of
frozen blocks at the front. Three details are the ones that go wrong in practice:

- Frozen parameters get `requires_grad = False`, and the optimiser is given only the parameters
  that are still trainable, so no update can touch the frozen blocks.
- Freezing parameters does not freeze **batch-normalisation statistics**. In training mode a
  batch-norm layer updates its running mean and variance on every forward pass, so a "frozen"
  block would quietly drift towards the target data. The frozen blocks must be put back into
  `eval()` mode after every call to `model.train()`.
- The target labels 5 to 9 are mapped to 0 to 4 for the new five-way head.

```python
def set_frozen(model, n_frozen):
    for i, b in enumerate(model.blocks):
        for p in b.parameters():
            p.requires_grad = i >= n_frozen


def fit(model, X, y, epochs, lr, n_frozen=0, batch=32, seed=0):
    """Train with Adam; the first n_frozen blocks are frozen, in eval mode."""
    set_frozen(model, n_frozen)
    params = [p for p in model.parameters() if p.requires_grad]
    opt = torch.optim.Adam(params, lr=lr)
    g = torch.Generator().manual_seed(seed)
    n = len(X)
    for _ in range(epochs):
        model.train()
        for i in range(n_frozen):
            model.blocks[i].eval()          # keeps the batch-norm statistics fixed
        perm = torch.randperm(n, generator=g)
        for k in range(0, n, batch):
            idx = perm[k:k + batch]
            loss = F.cross_entropy(model(X[idx]), y[idx])
            opt.zero_grad()
            loss.backward()
            opt.step()
    model.eval()
    return model


@torch.no_grad()
def accuracy(model, X, y):
    model.eval()
    return (model(X).argmax(1) == y).float().mean().item()
```

### Step 4: pretrain on the source task

Thirty epochs of Adam at $3 \times 10^{-3}$ on 675 images take a few seconds. The source test
set is the 226 held-out images of digits 0 to 4. Five digit classes of this kind are easy, so
the accuracy should be close to 1; the pretraining only has to work, not to be interesting.

```python
t0 = time.time()
source = Net(5)
fit(source, Z_tr[src_tr], y_tr[src_tr], epochs=30, lr=3e-3)
print(f"source test accuracy: {accuracy(source, Z_te[src_te], y_te[src_te]):.3f}")
```

```output
source test accuracy: 1.000
```

### Step 5: six ways to adapt to digits 5 to 9

Each variant builds a new network with a fresh five-way head and copies some blocks from the
pretrained one:

| Name | Blocks copied | Frozen during stage 1 | Stage 2 |
|---|---|---|---|
| (a) scratch | none | none | none |
| (b) block 1 | 1 | 1 | none |
| (c) blocks 1-2 | 1, 2 | 1, 2 | none |
| (d) probe | 1, 2, 3 | 1, 2, 3 | none |
| (e) probe + fine-tune | 1, 2, 3 | 1, 2, 3 | all blocks, $3 \times 10^{-4}$ |
| (f) block 1 + fine-tune | 1 | 1 | all blocks, $3 \times 10^{-4}$ |

Variant (d) is the **linear probe**: with every block frozen, the only thing learned is a
linear classifier on the 64 pooled features. Variants (e) and (f) follow the schedule of
[Section 10](#s10): train the new parts at a normal rate, then unfreeze everything and train at
a tenth of that rate, so that the copied weights move gently. Stage 1 uses 100 epochs at
$3 \times 10^{-3}$ with a batch of 16, and the fine-tuning stage another 100 epochs.

`target_set` draws $n$ images per class with a given seed from the target training pool and
subtracts 5 from the labels. `run_variant` returns the target test accuracy.

```python
tgt_idx = np.where(~src_tr)[0]


def target_set(n_per_class, seed):
    rng = np.random.default_rng(seed)
    pick = []
    for c in range(5, 10):
        pool = tgt_idx[ytr[tgt_idx] == c]
        pick += list(rng.choice(pool, n_per_class, replace=False))
    pick = np.array(pick)
    return Z_tr[pick], y_tr[pick] - 5


te_mask = torch.from_numpy(~src_te)
Zt_te, yt_te = Z_te[te_mask], y_te[te_mask] - 5


def run_variant(name, Xs, ys, seed):
    """Adapt `source` to the target task in one of six ways; return test accuracy."""
    torch.manual_seed(seed)
    model = Net(5)                                  # fresh head, fresh random blocks
    n_copy = {"a": 0, "b": 1, "c": 2, "d": 3, "e": 3, "f": 1}[name]
    for i in range(n_copy):
        model.blocks[i].load_state_dict(source.blocks[i].state_dict())
    kw = dict(epochs=100, lr=3e-3, batch=16, seed=seed)
    fit(model, Xs, ys, n_frozen=n_copy, **kw)
    if name in ("e", "f"):
        fit(model, Xs, ys, n_frozen=0, **{**kw, "lr": 3e-4})
    return accuracy(model, Zt_te, yt_te)


Xs, ys = target_set(5, seed=0)
print("target training set:", tuple(Xs.shape), "labels:", torch.bincount(ys).tolist())
t0 = time.time()
print(f"scratch, seed 0, n = 5: {run_variant('a', Xs, ys, 0):.3f}")
```

```output
target training set: (25, 1, 8, 8) labels: [5, 5, 5, 5, 5]
scratch, seed 0, n = 5: 0.897
```

### Step 6: the experiment, five seeds, two sizes

The comparison runs every variant at $n = 5$ and $n = 20$ for seeds 0 to 4. With 25 or 100
training images the target test accuracy depends noticeably on *which* images were drawn, so a
single seed would be a coin toss. Five seeds give a mean and a spread; with a spread of two to
three points, differences of one point between variants are noise and are not interpreted. The
table lists the mean and the standard deviation (over seeds) of the accuracy on the 224 target
test images.

```python
names = {"a": "scratch", "b": "block 1 frozen", "c": "blocks 1-2 frozen",
         "d": "linear probe (1-3)", "e": "probe, then fine-tune",
         "f": "block 1, then fine-tune"}
results = {}
t0 = time.time()
for n in (5, 20):
    for v in names:
        accs = []
        for seed in range(5):
            Xs, ys = target_set(n, seed)
            accs.append(run_variant(v, Xs, ys, seed))
        results[(n, v)] = np.array(accs)

print(f"{'variant':27s} {'n = 5':>14s} {'n = 20':>14s}")
for v, label in names.items():
    cells = [f"{results[(n, v)].mean():.3f} +/- {results[(n, v)].std():.3f}"
             for n in (5, 20)]
    print(f"({v}) {label:23s} {cells[0]:>14s} {cells[1]:>14s}")
```

```output
variant                              n = 5         n = 20
(a) scratch                 0.913 +/- 0.021 0.969 +/- 0.007
(b) block 1 frozen          0.909 +/- 0.033 0.966 +/- 0.019
(c) blocks 1-2 frozen       0.873 +/- 0.032 0.959 +/- 0.034
(d) linear probe (1-3)      0.662 +/- 0.033 0.762 +/- 0.010
(e) probe, then fine-tune   0.807 +/- 0.022 0.960 +/- 0.007
(f) block 1, then fine-tune 0.902 +/- 0.029 0.981 +/- 0.011
```

The same numbers as a plot make the ordering and the size of the error bars easier to judge.

```python
fig, axes = plt.subplots(1, 2, figsize=(10, 3.8), sharey=True)
for ax, n in zip(axes, (5, 20)):
    means = [results[(n, v)].mean() for v in names]
    sds = [results[(n, v)].std() for v in names]
    ax.bar(range(6), means, yerr=sds, capsize=3, color="#4c78a8")
    ax.set_xticks(range(6))
    ax.set_xticklabels([f"({v})" for v in names])
    ax.set_title(f"{n} labelled images per class")
    ax.set_xlabel("variant")
    ax.set_ylim(0.4, 1.0)
axes[0].set_ylabel("target test accuracy (mean, sd over 5 seeds)")
fig.suptitle("Digits 5-9 after pretraining on digits 0-4")
plt.tight_layout()
plt.show()
```

### Step 7: the normalisation mistake

Variant (d) is the most sensitive to input statistics, since nothing downstream can adapt to
them. The experiment trains the linear probe at $n = 10$ per class and evaluates it twice: on
target test images standardised with the source statistics, as in training, and on raw
$[0, 1]$ pixels. This is what happens when a deployed model is fed inputs preprocessed
differently from its training pipeline: a pretrained backbone assumes an input scale, and
everything after it is calibrated to that scale.

```python
raw_te = torch.from_numpy(Xte)[te_mask]
ok, bad = [], []
for seed in range(5):
    Xs, ys = target_set(10, seed)
    torch.manual_seed(seed)
    model = Net(5)
    for i in range(3):
        model.blocks[i].load_state_dict(source.blocks[i].state_dict())
    fit(model, Xs, ys, epochs=100, lr=3e-3, batch=16, n_frozen=3, seed=seed)
    ok.append(accuracy(model, Zt_te, yt_te))
    bad.append(accuracy(model, raw_te, yt_te))
print(f"probe, standardised inputs (correct): {np.mean(ok):.3f} +/- {np.std(ok):.3f}")
print(f"probe, raw [0,1] pixels  (mistake)  : {np.mean(bad):.3f} +/- {np.std(bad):.3f}")
```

```output
probe, standardised inputs (correct): 0.713 +/- 0.013
probe, raw [0,1] pixels  (mistake)  : 0.209 +/- 0.016
```

### What you should see

- **The source task is learned, the target is not free.** The pretrained network reaches 1.000 on
  the 226 source test images, yet its frozen features are a poor basis for digits 5 to 9. The
  linear probe (d) reaches about 0.66 at $n = 5$ and 0.76 at $n = 20$, while a network trained
  from scratch on the same images reaches about 0.91 and 0.97. The last block was trained to
  separate 0, 1, 2, 3 and 4. Its 64 pooled features keep what those five classes need and discard
  what 5 to 9 need, and more labels cannot bring the discarded information back. Early layers
  are general and later layers are specific ([Section 10](#s10); Yosinski et al., 2014). A narrow
  source transfers little more than its first block, and ImageNet's breadth is the reason a whole
  ImageNet backbone transfers.
- **The first block transfers harmlessly, not usefully.** Copying and freezing block 1 (b) matches
  scratch within the seed spread at both sizes (0.909 against 0.913, 0.966 against 0.969). Its
  3 × 3 stroke and edge detectors are as good as ones learned from 25 images, but with only
  $16 \cdot 9 = 144$ weights they are also cheap to learn, so little is gained. Freezing blocks
  1 and 2 (c) is slightly worse at $n = 5$ (0.873): block 2's features are already specific to
  the source digits. The ordering by depth of what is copied, (b) then (c) then (d), is the
  observation; the one-point differences between (a) and (b) are not.
- **Fine-tuning recovers most of the loss, and the gap closes with data.** The probe followed by
  fine-tuning (e) rises from 0.662 to 0.807 at $n = 5$ and from 0.762 to 0.960 at $n = 20$,
  where it is within about a point of scratch. At $n = 5$ it still trails scratch by about 10
  points: 25 images are too few to move a backbone that starts in a bad place. Block 1 followed
  by fine-tuning (f) is as good as scratch at $n = 5$ (0.902) and the best variant at $n = 20$
  (0.981 against 0.969), but the difference to scratch at $n = 20$ is about one standard
  deviation of the seed spread, so it is a hint and not a result. At $n = 20$ everything except
  the probe is within a few points of everything else.
- **The normalisation mistake looks like a failure to transfer.** On correctly standardised
  inputs the probe scores about 0.71 at $n = 10$. Fed raw $[0, 1]$ pixels, whose mean is 0.31
  and standard deviation 0.38 instead of 0 and 1, it falls to about 0.21, chance for five
  classes. Nothing is wrong with the backbone, the weights or the code; the inputs are on a
  scale that the batch-norm layers and the frozen head were not calibrated for. This is the
  "transfer learning does not work" report of [Section 10](#s10), and the check is two lines:
  print the mean and standard deviation of what the model is fed and compare them with those of
  its training pipeline.
- **Noise sets the scale of every claim.** The standard deviations over seeds range from 0.007 to
  0.034. Rerun with other seeds and the last digits will change; the ordering of
  the probe below everything else, and of the collapse on raw pixels, will not.

### Try this

1. **Discriminative learning rates.** Fine-tune with $3 \times 10^{-5}$, $10^{-4}$ and
   $3 \times 10^{-4}$ for blocks 1, 2 and 3 and $3 \times 10^{-3}$ for the head, using one
   parameter group per block in Adam, and compare with variant (e).
2. **The batch-norm trap.** Remove the line that puts the frozen blocks back into `eval()` mode.
   Print one batch-norm layer's `running_mean` before and after training the head, and compare
   the accuracy of the probe. The "frozen" backbone is no longer the pretrained one.
3. **Where the source matters.** Pretrain on digits 0 to 4 placed at random positions on the
   16 × 16 canvas of [Lab 2](#lab2), repeat the six variants on the canvas, and compare the
   linear probe with scratch training that re-samples positions. The lesson is the same: a probe
   on features that were specific to the source stays weak.
4. **A broad source.** The block below is not executed here, because it needs `torchvision` and a
   44.7 MB download of ImageNet weights. Run it on Colab to see a *broad* source transfer its
   whole backbone: a probe on the 512-dimensional pooled features is far stronger than the
   probe of this lab. No number in this module depends on it.

```python norun
import torchvision
from torchvision.models import resnet18

net = resnet18(weights="IMAGENET1K_V1").eval()
net.fc = torch.nn.Identity()                          # 512-dimensional pooled features
mean_in = torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)
std_in = torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1)


def imagenet_features(x_8x8):                         # (N, 1, 8, 8) in [0, 1]
    x = F.interpolate(torch.from_numpy(x_8x8), size=64, mode="bilinear")
    x = x.repeat(1, 3, 1, 1)                          # grey to three channels
    with torch.no_grad():
        return net((x - mean_in) / std_in)            # ImageNet's own statistics

# then: logistic regression on imagenet_features(...) for n = 5 per class (variant d),
# a small network from scratch (variant a), and fine-tuning the whole net (variant e).
```

## Lab 5 — U-Net segmentation on synthetic images, and from mask to measurement {#lab5}

**Goal.** You train a small U-Net to segment the circles, and only the circles, in synthetic
microscopy-like images that also contain rectangles of the same brightness. You first show that
a global intensity threshold cannot do the job, then measure what the U-Net's skip connections
contribute by training it twice, with and without them, and score both with the Dice coefficient
and the intersection over union ([Section 12](#s12)). Finally you turn the predicted masks into
measurements, area and perimeter, and compare them with the true circles. This is the
two-dimensional version of the mask-to-surface step of [Section 13](#s13): the area behaves
like a volume, the perimeter like a surface area, and the way the perimeter is measured matters
more than the network. The data is generated in NumPy and there is no download. In full mode the
whole lab takes about two minutes on a desktop CPU and two to four minutes on a
laptop; set `QUICK = True` in the first block for a run of about 15 seconds in all, at the
price of a worse and noisier result.

### Step 1: the synthetic images

Each image is 64 × 64 and contains two to four objects, each a circle (radius 4 to 10 pixels) or
a rectangle (sides 6 to 18 pixels), with intensities drawn from the same range, 0.5 to 1.0.
Objects may overlap, and a later object overwrites an earlier one. The image is then blurred
with a Gaussian of standard deviation 1 pixel, as an optical system would blur it, a linear
illumination ramp of amplitude up to 0.3 is added in a random direction, and Gaussian noise of
standard deviation 0.1 is added on top. The target mask contains the circles only.

Two conventions matter later for the measurements. Pixel $(i, j)$ has its centre at
$(i + 0.5,\; j + 0.5)$, and a pixel belongs to a circle if its *centre* lies inside the circle.
The generator also returns the list of **isolated** circles: those that are not overwritten by
any later object and have no other object within 3 pixels. Only these have a clean ground-truth
area $\pi r^2$ and perimeter $2\pi r$ for step 8.

```python
import time
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
from scipy import ndimage as ndi
import contourpy

QUICK = False                     # True: 400 images x 8 epochs, about 7 s per model
N_TRAIN, EPOCHS = (400, 8) if QUICK else (1500, 15)
SIZE = 64

np.random.seed(0)
torch.manual_seed(0)
torch.set_num_threads(4)

YY, XX = np.mgrid[0:SIZE, 0:SIZE] + 0.5          # pixel centres at (i + 0.5, j + 0.5)


def make_image(rng):
    """One image, its circle mask and the list of isolated circles (cy, cx, r)."""
    ids = np.zeros((SIZE, SIZE), dtype=int)       # object id per pixel, 0 = background
    img = np.zeros((SIZE, SIZE))
    kinds, discs = [None], [None]
    for k in range(1, rng.integers(2, 5) + 1):
        value = rng.uniform(0.5, 1.0)
        if rng.random() < 0.5:
            r = rng.uniform(4, 10)
            cy, cx = rng.uniform(r + 2, SIZE - r - 2, 2)
            m = (YY - cy) ** 2 + (XX - cx) ** 2 <= r * r
            kinds.append("circle")
            discs.append((cy, cx, r, m))
        else:
            h, w = rng.uniform(6, 18, 2)
            y0, x0 = rng.uniform(2, SIZE - h - 2), rng.uniform(2, SIZE - w - 2)
            m = (YY >= y0) & (YY < y0 + h) & (XX >= x0) & (XX < x0 + w)
            kinds.append("rect")
            discs.append(None)
        img[m] = value
        ids[m] = k
    mask = np.isin(ids, [k for k in range(1, len(kinds)) if kinds[k] == "circle"])
    circles = []
    for k in range(1, len(kinds)):
        if kinds[k] != "circle":
            continue
        cy, cx, r, m = discs[k]
        other = (ids > 0) & (ids != k)
        whole = (ids == k).sum() == m.sum()          # not overwritten by a later object
        if whole and not (ndi.binary_dilation(m, iterations=3) & other).any():
            circles.append((cy, cx, r))
    img = ndi.gaussian_filter(img, 1.0)
    theta, amp = rng.uniform(0, 2 * np.pi), rng.uniform(0, 0.3)
    u = ((XX - SIZE / 2) * np.cos(theta) + (YY - SIZE / 2) * np.sin(theta))
    img = img + amp * u / (SIZE / 2 * (abs(np.cos(theta)) + abs(np.sin(theta))))
    img = img + rng.normal(0, 0.1, img.shape)
    return img.astype(np.float32), mask, circles


def make_dataset(n, seed):
    rng = np.random.default_rng(seed)
    out = [make_image(rng) for _ in range(n)]
    return (np.stack([o[0] for o in out]), np.stack([o[1] for o in out]),
            [o[2] for o in out])


Xtr, Ytr, _ = make_dataset(N_TRAIN, seed=0)
Xva, Yva, circ_va = make_dataset(200, seed=1)
print("train:", Xtr.shape, Ytr.shape, " val:", Xva.shape)
print(f"foreground fraction: train {Ytr.mean():.3f}, val {Yva.mean():.3f}")
print(f"isolated circles in the validation set: {sum(len(c) for c in circ_va)}")
```

```output
train: (1500, 64, 64) (1500, 64, 64)  val: (200, 64, 64)
foreground fraction: train 0.056, val 0.056
isolated circles in the validation set: 161
```

The foreground fraction near 6% means that 94% of pixels are background, so pixel accuracy
would be 94% for a model that predicts nothing. That is why segmentation is scored with overlap
measures, and why Step 4 adds a Dice term to the loss. A look at eight images first.

```python
fig, axes = plt.subplots(2, 8, figsize=(14, 3.8))
for k in range(8):
    axes[0, k].imshow(Xtr[k], cmap="gray", vmin=0, vmax=1.2)
    axes[1, k].imshow(Ytr[k], cmap="gray")
    axes[0, k].axis("off")
    axes[1, k].axis("off")
axes[0, 0].set_title("image", loc="left")
axes[1, 0].set_title("target mask (circles only)", loc="left")
fig.suptitle("Synthetic training images: circles are targets, rectangles distract")
plt.tight_layout()
plt.show()
```

### Step 2: a threshold baseline

Before any network, the simplest segmenter: call a pixel foreground if its intensity exceeds a
global threshold. The threshold is chosen to maximise Dice on 300 training images, scanning 33
values from 0.1 to 0.9, and then evaluated on the validation set. The metrics are pooled over all
pixels of all images,

$$
\text{Dice} = \frac{2\,|P \cap T|}{|P| + |T|}, \qquad
\text{IoU} = \frac{|P \cap T|}{|P \cup T|},
$$

with $P$ the predicted foreground and $T$ the target. A threshold sees one pixel at a time, so
it cannot tell a circle from a rectangle of the same brightness, and the illumination ramp
shifts brightness across the image. The best it can do is segment *objects*, both kinds, as well
as the ramp allows, and the rectangles then count as false positives.

```python
def dice_iou(pred, target):
    """Pooled Dice and IoU over all pixels of boolean arrays."""
    inter = np.logical_and(pred, target).sum()
    union = np.logical_or(pred, target).sum()
    return 2 * inter / (pred.sum() + target.sum()), inter / union


ths = np.linspace(0.1, 0.9, 33)
scores = [dice_iou(Xtr[:300] > t, Ytr[:300])[0] for t in ths]
th = ths[int(np.argmax(scores))]
d, j = dice_iou(Xva > th, Yva)
print(f"best threshold {th:.2f} (train Dice {max(scores):.3f});"
      f" validation Dice {d:.3f}, IoU {j:.3f}")
```

```output
best threshold 0.40 (train Dice 0.662); validation Dice 0.641, IoU 0.471
```

### Step 3: the U-Net

The network follows [Section 12](#s12). `cbr` is the unit of the design: two convolutions, each
followed by batch normalisation and ReLU, with the bias dropped because batch norm's offset
makes it redundant. The encoder has three levels, at 64 × 64, 32 × 32 and 16 × 16, with channels
8, 16 and 32 and a 2 × 2 max pool between levels. The bottleneck at 8 × 8 has 64 channels. The
decoder mirrors the encoder: a transposed convolution with kernel 2 and stride 2 doubles the
resolution and halves the channels, the result is **concatenated** with the encoder map of the
same resolution, and a `cbr` mixes them. A final 1 × 1 convolution gives one logit per pixel.

With `skips=False` the concatenations are dropped, and the decoder's convolutions take half as
many input channels. The two models differ only in whether the decoder can see the encoder's
full-resolution maps.

The pooling steps need the input to be divisible by $2^3 = 8$, which 64 is.

```python
def cbr(c_in, c_out):
    return nn.Sequential(
        nn.Conv2d(c_in, c_out, 3, padding=1, bias=False),
        nn.BatchNorm2d(c_out), nn.ReLU(),
        nn.Conv2d(c_out, c_out, 3, padding=1, bias=False),
        nn.BatchNorm2d(c_out), nn.ReLU())


class UNet(nn.Module):
    def __init__(self, c=(8, 16, 32, 64), skips=True):
        super().__init__()
        self.skips = skips
        m = 2 if skips else 1                       # decoder input: upsampled (+ skip)
        self.enc = nn.ModuleList([cbr(1, c[0]), cbr(c[0], c[1]), cbr(c[1], c[2])])
        self.bott = cbr(c[2], c[3])
        self.up = nn.ModuleList([nn.ConvTranspose2d(c[3], c[2], 2, 2),
                                 nn.ConvTranspose2d(c[2], c[1], 2, 2),
                                 nn.ConvTranspose2d(c[1], c[0], 2, 2)])
        self.dec = nn.ModuleList([cbr(m * c[2], c[2]), cbr(m * c[1], c[1]),
                                  cbr(m * c[0], c[0])])
        self.out = nn.Conv2d(c[0], 1, 1)

    def forward(self, x):
        saved = []
        for enc in self.enc:
            x = enc(x)
            saved.append(x)                         # full-resolution maps for the skips
            x = F.max_pool2d(x, 2)
        x = self.bott(x)
        for up, dec in zip(self.up, self.dec):
            x = up(x)
            if self.skips:
                x = torch.cat([x, saved.pop()], dim=1)
            else:
                saved.pop()
            x = dec(x)
        return self.out(x)


for sk in (True, False):
    n_par = sum(p.numel() for p in UNet(skips=sk).parameters())
    print(f"skips={sk!s:5}: {n_par:,} parameters")
print("output shape:", tuple(UNet()(torch.zeros(2, 1, 64, 64)).shape))
```

```output
skips=True : 121,033 parameters
skips=False: 108,937 parameters
output shape: (2, 1, 64, 64)
```

The model with skips has 12,096 more parameters, all in the decoder's first convolutions, which
now read twice as many channels. Skip connections are cheap in parameters. Their cost is memory:
the encoder maps must be kept until the decoder uses them.

### Step 4: loss, training loop and metrics

The loss is the sum of binary cross-entropy on the logits and a soft Dice loss. Cross-entropy
gives a well-behaved gradient for every pixel but is dominated by the 94% background. The soft
Dice loss, $1 - (2\sum p\,t + \epsilon)/(\sum p + \sum t + \epsilon)$ with $p$ the predicted
probability, $t$ the target and $\epsilon = 1$, optimises overlap directly and does not care
about the class balance. It is computed per image and averaged, so that a small circle counts as
much as a large one.

Training uses Adam with a one-cycle learning-rate schedule (10% warm-up to a peak of
$3 \times 10^{-3}$, then cosine decay) and batches of 16. Every third epoch the loop prints the
training loss and three validation numbers at threshold 0.5: Dice and IoU pooled over all
pixels, and the **boundary-band accuracy**, the pixel accuracy inside a band of ±2 pixels around
the true boundaries, obtained as binary dilation minus binary erosion of the target mask with a
two-dimensional cross as the structuring element. Overall Dice is dominated by object interiors,
which are easy. The band is where the models differ.

```python
cross = np.zeros((3, 3, 3), dtype=bool)
cross[1] = ndi.generate_binary_structure(2, 1)      # 2D cross, per image
BAND = (ndi.binary_dilation(Yva, cross, iterations=2)
        & ~ndi.binary_erosion(Yva, cross, iterations=2))
print(f"band covers {BAND.mean():.3f} of the validation pixels")


def loss_fn(logits, target):
    bce = F.binary_cross_entropy_with_logits(logits, target)
    p = torch.sigmoid(logits)
    inter = (p * target).sum((1, 2, 3))
    dice = (2 * inter + 1) / (p.sum((1, 2, 3)) + target.sum((1, 2, 3)) + 1)
    return bce + (1 - dice).mean()


@torch.no_grad()
def predict(model, X, batch=100):
    model.eval()
    xs = torch.from_numpy(X)[:, None]
    return torch.cat([torch.sigmoid(model(xs[i:i + batch]))[:, 0]
                      for i in range(0, len(X), batch)]).numpy()


def evaluate(model):
    prob = predict(model, Xva)
    pred = prob > 0.5
    d, j = dice_iou(pred, Yva)
    return d, j, (pred == Yva)[BAND].mean()


def train(model, epochs=EPOCHS, bs=16, max_lr=3e-3, report=3):
    xs = torch.from_numpy(Xtr)[:, None]
    ys = torch.from_numpy(Ytr.astype(np.float32))[:, None]
    steps = epochs * int(np.ceil(len(xs) / bs))
    opt = torch.optim.Adam(model.parameters(), lr=max_lr)
    sched = torch.optim.lr_scheduler.OneCycleLR(opt, max_lr=max_lr, total_steps=steps,
                                                pct_start=0.1)
    g = torch.Generator().manual_seed(0)
    for ep in range(1, epochs + 1):
        model.train()
        perm = torch.randperm(len(xs), generator=g)
        total = 0.0
        for k in range(0, len(xs), bs):
            idx = perm[k:k + bs]
            loss = loss_fn(model(xs[idx]), ys[idx])
            opt.zero_grad()
            loss.backward()
            opt.step()
            sched.step()
            total += loss.item() * len(idx)
        if ep % report == 0 or ep == epochs:
            d, j, b = evaluate(model)
            print(f"  epoch {ep:2d}  loss {total / len(xs):.3f}  val Dice {d:.3f}"
                  f"  IoU {j:.3f}  band acc {b:.3f}")
    return model
```

```output
band covers 0.054 of the validation pixels
```

### Step 5: train with and without skip connections

The two runs use the same seed, data, schedule and batch order. Only `skips` differs. In full
mode each takes about 40 to 60 seconds on a four-thread desktop CPU.

```python
models, final = {}, {}
for skips in (True, False):
    torch.manual_seed(0)
    t0 = time.time()
    print(f"U-Net, skips={skips}")
    models[skips] = train(UNet(skips=skips))
    final[skips] = evaluate(models[skips])

print()
print(f"{'':14s} {'Dice':>6s} {'IoU':>6s} {'band acc':>9s}")
print(f"{'threshold':14s} {d:6.3f} {j:6.3f} {'-':>9s}")
for skips, label in ((True, "U-Net, skips"), (False, "U-Net, no skips")):
    dd, jj, bb = final[skips]
    print(f"{label:14s} {dd:6.3f} {jj:6.3f} {bb:9.3f}")
```

```output
U-Net, skips=True
  epoch  3  loss 0.447  val Dice 0.930  IoU 0.870  band acc 0.930
  epoch  6  loss 0.161  val Dice 0.836  IoU 0.718  band acc 0.901
  epoch  9  loss 0.083  val Dice 0.957  IoU 0.918  band acc 0.934
  epoch 12  loss 0.063  val Dice 0.965  IoU 0.932  band acc 0.948
  epoch 15  loss 0.057  val Dice 0.965  IoU 0.933  band acc 0.950
U-Net, skips=False
  epoch  3  loss 0.681  val Dice 0.875  IoU 0.778  band acc 0.850
  epoch  6  loss 0.265  val Dice 0.912  IoU 0.838  band acc 0.850
  epoch  9  loss 0.105  val Dice 0.939  IoU 0.885  band acc 0.900
  epoch 12  loss 0.073  val Dice 0.949  IoU 0.903  band acc 0.913
  epoch 15  loss 0.064  val Dice 0.952  IoU 0.908  band acc 0.920

                 Dice    IoU  band acc
threshold       0.641  0.471         -
U-Net, skips    0.965  0.933     0.950
U-Net, no skips  0.952  0.908     0.920
```

The decoder without skips has to rebuild boundaries from an 8 × 8 bottleneck, where each unit
covers an 8 × 8 pixel block. It can place an object and get its shape roughly right, but fine
position information at the resolution of single pixels has been pooled away. Skip connections
hand it that information back.

The next figure shows four validation images, the target, and both predictions at threshold 0.5.
The differences between the two models sit along the boundaries.

```python
prob = {k: predict(m, Xva[:4]) for k, m in models.items()}
fig, axes = plt.subplots(4, 4, figsize=(9, 9))
cols = ["image", "target", "with skips", "without skips"]
for r in range(4):
    axes[r, 0].imshow(Xva[r], cmap="gray", vmin=0, vmax=1.2)
    axes[r, 1].imshow(Yva[r], cmap="gray")
    axes[r, 2].imshow(prob[True][r] > 0.5, cmap="gray")
    axes[r, 3].imshow(prob[False][r] > 0.5, cmap="gray")
    for c in range(4):
        axes[r, c].axis("off")
        if r == 0:
            axes[r, c].set_title(cols[c])
fig.suptitle("Validation images: input, target and the two U-Nets' predictions")
plt.tight_layout()
plt.show()
```

### Step 6: Dice and IoU are the same ranking

For a single image with $a = |P \cap T|$, $|P| + |T| = a + u$ where $u = |P \cup T|$ (since
$|P| + |T| = |P \cup T| + |P \cap T|$), so $\text{Dice} = 2a/(a + u)$ and $\text{IoU} = a/u$.
Substituting $a = \text{IoU} \cdot u$ gives
$$
\text{Dice} = \frac{2\,\text{IoU}\cdot u}{\text{IoU}\cdot u + u} = \frac{2\,\text{IoU}}{1 + \text{IoU}}.
$$
The relation is monotone, so the two metrics rank any set of models identically; they differ
only in scale, and Dice is the larger. The check below verifies the identity numerically, image
by image and for the pooled pair. Report one of them, say which, and do not compare a Dice from
one paper with an IoU from another.

```python
pred = predict(models[True], Xva) > 0.5
per_image = []
for p_i, t_i in zip(pred, Yva):
    if p_i.sum() + t_i.sum() == 0:
        continue                                    # both empty: 0/0
    d_i, j_i = dice_iou(p_i, t_i)
    per_image.append(abs(d_i - 2 * j_i / (1 + j_i)))
d_all, j_all = dice_iou(pred, Yva)
print(f"images checked: {len(per_image)}, "
      f"max |Dice - 2 IoU/(1+IoU)| = {max(per_image):.1e}")
print(f"pooled: Dice {d_all:.4f}, IoU {j_all:.4f}, "
      f"2 IoU/(1+IoU) = {2 * j_all / (1 + j_all):.4f}")
```

```output
images checked: 166, max |Dice - 2 IoU/(1+IoU)| = 1.1e-16
pooled: Dice 0.9651, IoU 0.9325, 2 IoU/(1+IoU) = 0.9651
```

### Step 7: connected components and the isolated circles

To measure objects, the binary prediction is split into **connected components** with
`ndi.label`, which assigns an integer to each group of touching foreground pixels. For each of
the isolated true circles in the validation set, the matching prediction is the component that
contains the circle's centre pixel. A circle whose centre is background in the prediction is
counted as missed. Two measurements follow, each divided by the exact value for the true
circle, so that 1.0 means unbiased:

- **Area** is the number of pixels of the component, against $\pi r^2$.
- **Perimeter** is measured in two ways. (a) The number of pixel edges between foreground and
  background, the crudest way of measuring the boundary of a mask. (b) The length of the
  iso-contour at level 0.5 of the *predicted probability*, which `contourpy` computes with
  marching squares, the two-dimensional relative of marching cubes: it interpolates along each
  cell edge to find where the probability crosses 0.5, and joins the crossings into polylines.
  The probability map is zeroed outside a two-pixel margin around the component, so that the
  contour belongs to this component only. Both are compared with $2\pi r$.

```python
prob_va = predict(models[True], Xva)
bin_va = prob_va > 0.5
rows = []
for i in range(len(Xva)):
    labels, _ = ndi.label(bin_va[i])
    for cy, cx, r in circ_va[i]:
        lab = labels[int(cy), int(cx)]                 # component at the centre pixel
        if lab == 0:
            rows.append((np.nan, np.nan, np.nan))
            continue
        comp = labels == lab
        padded = np.pad(comp, 1).astype(int)
        edges = (np.abs(np.diff(padded, axis=0)).sum()
                 + np.abs(np.diff(padded, axis=1)).sum())
        z = prob_va[i] * ndi.binary_dilation(comp, iterations=2)
        lines = contourpy.contour_generator(z=z).lines(0.5)
        length = sum(np.hypot(*np.diff(np.asarray(ln), axis=0).T).sum() for ln in lines)
        rows.append((comp.sum() / (np.pi * r * r), edges / (2 * np.pi * r),
                     length / (2 * np.pi * r)))
rows = np.array(rows)
found = ~np.isnan(rows[:, 0])
print(f"isolated circles: {len(rows)}, found by the U-Net: {found.sum()}")
for name, col in (("area / (pi r^2)", 0), ("pixel-edge perimeter / (2 pi r)", 1),
                  ("iso-contour perimeter / (2 pi r)", 2)):
    v = rows[found, col]
    print(f"{name:34s} mean {v.mean():.3f}  sd {v.std():.3f}")

fig, axes = plt.subplots(1, 3, figsize=(11, 3.4))
titles = ("area", "pixel-edge perimeter", "iso-contour perimeter")
for ax, col, name in zip(axes, range(3), titles):
    ax.hist(rows[found, col], bins=25, color="#4c78a8")
    ax.axvline(1.0, color="k", lw=1)
    ax.set_title(name)
    ax.set_xlabel("measured / true")
axes[0].set_ylabel("circles")
fig.suptitle("Measurements from predicted masks, relative to the true circles")
plt.tight_layout()
plt.show()
```

```output
isolated circles: 161, found by the U-Net: 160
area / (pi r^2)                    mean 0.999  sd 0.029
pixel-edge perimeter / (2 pi r)    mean 1.266  sd 0.035
iso-contour perimeter / (2 pi r)   mean 1.033  sd 0.017
```

The standard deviation of the area ratio, a few per cent, is the *variance* of the measurement:
how much one circle's predicted area differs from another's. The mean of the perimeter ratios is
the *bias*: for the pixel-edge perimeter it is about 27% and nothing the network does can
change it. This is the error decomposition of Module 01 in a form that can be measured, and the
reason for step 8.

### Step 8: why the pixel-edge perimeter is 27% too long

Take the best mask any network could return: an ideal digital disc, the set of pixels whose
centres lie within a circle of radius $r$. Its pixel-edge perimeter is the length of a
staircase. A staircase approximating a curve covers the same horizontal and vertical extent as
the curve, so its length is the sum of the extents, not the arclength: over a quarter circle
that is $2r$, over the whole circle $8r$, against $2\pi r$. The ratio is $4/\pi = 1.273$ at every
radius, however fine the grid. Counting edges is therefore biased by 27% at *any* resolution;
this is a property of the measure, not of the image.

The test below uses discs of radius 4, 8, 16 and 24 at a sub-pixel offset, and three measures
of the boundary: pixel edges, marching squares on the binary mask (level 0.5), and marching
squares on a mask blurred with a Gaussian of standard deviation 1, which is what a smooth
probability map from a network looks like.

```python
def disc(r, size=128, offset=(0.3, 0.4)):
    c = size / 2 + np.array(offset)
    yy, xx = np.mgrid[0:size, 0:size] + 0.5
    return ((yy - c[0]) ** 2 + (xx - c[1]) ** 2 <= r * r).astype(float)


def edge_count(mask):
    p = np.pad(mask, 1)
    return np.abs(np.diff(p, axis=0)).sum() + np.abs(np.diff(p, axis=1)).sum()


def contour_length(z):
    lines = contourpy.contour_generator(z=z).lines(0.5)
    return sum(np.hypot(*np.diff(np.asarray(ln), axis=0).T).sum() for ln in lines)


print(f"{'r':>3s} {'pixel edges':>12s} {'squares, binary':>16s}"
      f" {'squares, blurred':>17s}")
for r in (4, 8, 16, 24):
    m = disc(r)
    print(f"{r:3d} {edge_count(m) / (2 * np.pi * r):12.3f}"
          f" {contour_length(m) / (2 * np.pi * r):16.3f}"
          f" {contour_length(ndi.gaussian_filter(m, 1.0)) / (2 * np.pi * r):17.3f}")
```

```output
  r  pixel edges  squares, binary  squares, blurred
  4        1.273            1.040             0.972
  8        1.273            1.052             0.996
 16        1.273            1.052             1.003
 24        1.273            1.056             1.005
```

Marching squares on the *binary* mask does better than the edge count, because its vertices sit
at the midpoints of the cell edges and cut the corners of the staircase, but a binary input
gives it nothing finer than half a pixel to interpolate with. On a smooth probability map the
interpolation recovers the sub-pixel position of the boundary, and the error falls to within
about one per cent for radii of 8 and above. The smallest disc is 3% short, because blurring
moves the 0.5 level of a small disc inwards. This is the mechanism that [Section 13](#s13) uses in three dimensions: counting
exposed voxel faces is biased high by a constant factor, and marching cubes on a smooth field is
not.

### What you should see

- **A threshold cannot do this task.** The best global threshold (0.40) reaches Dice 0.641 and
  IoU 0.471 on the validation images, and its training Dice (0.662) is no better, so this is a
  limit of the method and not overfitting. A pixel's intensity says nothing about whether the
  object it belongs to is round. The U-Net reaches Dice 0.965 because its bottleneck units
  each see an area of the image larger than an object, so they can compute shape.
- **Skip connections matter at the boundary more than overall.** With skips: Dice 0.965, IoU
  0.933, boundary-band accuracy 0.950. Without: 0.952, 0.908, 0.920. Overall Dice moves by 1.3
  points and band accuracy by 3.0, and the band gap is visible at every reported epoch while
  the pooled Dice is not (epoch 6 of the skip model even dips to 0.836, while the
  learning rate is still high, and recovers). Dice is dominated by object interiors, where both models
  are right. The decoder alone cannot recover detail lost in the 8 × 8 bottleneck. This is one
  run per model: the band ordering holds at every reported epoch, but a difference of one Dice point
  would need several seeds before it was believed. Expect larger gaps in QUICK mode, where the
  decoder without skips has less time to compensate.
- **Dice and IoU are one ranking.** The identity $\text{Dice} = 2\,\text{IoU}/(1 + \text{IoU})$
  holds to round-off ($10^{-16}$) on every image and for the pooled pair (0.9651 both ways).
  The models are ordered the same way by either.
- **Pixel counts are unbiased; pixel-edge perimeters are not.** Over 160 of the 161 isolated
  circles (one was missed), the area ratio has mean 0.999 and standard deviation 0.029. The
  pixel-edge perimeter ratio has mean 1.266, close to $4/\pi = 1.273$, with standard deviation
  0.035: the bias is almost the whole error. The iso-contour of the predicted probability gives
  1.033 with standard deviation 0.017, a bias of 3% and half the spread. Step 8 shows that on
  ideal discs the pixel-edge ratio is exactly 1.273 at every radius, marching squares on a
  binary mask is 4 to 6% high, and on a blurred mask it is within 1% for $r \geq 8$.
- **What this means for volumes and surfaces.** The same pattern holds in 3D ([Section 13](#s13)):
  voxel counts give volumes with small bias, face counts overstate surface areas by a constant
  factor that depends on orientation, and an isosurface of a smooth field is the accurate
  measure. A good Dice score says little about the second of these.

### Try this

1. **Checkerboards.** Replace `ConvTranspose2d(k=2, s=2)` by
   `ConvTranspose2d(k=3, s=2, padding=1, output_padding=1)` and look for a checkerboard pattern
   in the predicted probabilities early in training. With kernel 3 and stride 2 the output pixels
   receive different numbers of contributions, which is the cause ([Section 12](#s12)). Then use
   `nn.Upsample(scale_factor=2, mode="bilinear")` followed by a 3 × 3 convolution and compare.
2. **Losses.** Train with BCE only and with Dice only. Compare Dice on the small circles
   (radius below 6) and the training curves; one of the two is typically slower to start.
3. **Input size.** Feed a 100 × 100 image to the trained U-Net. Explain the error (three poolings
   need a multiple of 8, and the skips need matching shapes) and fix it by padding to 104 and
   cropping the output.
4. **Three dimensions.** Rebuild the network with `Conv3d` and the `Down3D` block of
   [Section 13](#s13), using `GroupNorm(8, C)` in place of batch norm, on synthetic 32³ volumes
   of spheres and cubes. Measure the volumes by voxel count, as in step 7, and compare the time
   per epoch with the 2D model.

## Lab 6 — Grad-CAM catches a shortcut {#lab6}

**Goal.** You train two small CNNs to tell circles from squares. One is trained on data in which
every square carries a small bright marker in the top-left corner, so the marker predicts the
class perfectly; the other is trained on clean data. Both score well on data drawn like their
training set, and only a test set in which the marker no longer predicts the class exposes the
difference. You then implement a saliency map and Grad-CAM from their definitions
([Section 14](#s14)), see where each model looks, verify that Grad-CAM for a global-average-pooling
head is the class activation map of Zhou et al., and run the model-randomisation sanity check
of Adebayo et al. The data is synthetic, there is no download, and the lab runs in about ten
seconds on a laptop CPU.

### Step 1: images with and without a shortcut

Each image is 32 × 32 and holds one shape, a circle with radius or a square with half-side drawn
from 5 to 9 pixels, at a random position that keeps it clear of the top-left corner, with
intensity 0.6 to 1.0, a Gaussian blur of standard deviation 0.7 pixels and noise of standard
deviation 0.1. The marker is a 3 × 3 patch of intensity 1.0 at rows and columns 1 to 3. The
`rule` argument of `make` decides where it appears:

- `"spurious"`: on every square and on no circle, so the marker is a perfect predictor;
- `"none"`: never, the clean data;
- `"random"`: on a random half of the images, independent of the class.

Training sets of 2,000 images are made with the first two rules (seed 0). Test sets of 500 are
made with seed 1 (clean) and seed 2 (random marker), and a further 500 images with the
spurious rule (seed 3) play the part of the validation set that a developer would normally look
at: drawn from the training distribution.

```python
import copy
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
import matplotlib.pyplot as plt
from scipy import ndimage as ndi

np.random.seed(0)
torch.manual_seed(0)
torch.set_num_threads(4)

S = 32
YY, XX = np.mgrid[0:S, 0:S] + 0.5


def shape_img(rng, cls, marker):
    """cls 0 = circle, 1 = square; marker adds the 3x3 corner patch."""
    img = np.zeros((S, S))
    a = rng.uniform(5, 9)
    cy, cx = rng.uniform(a + 4, S - a - 2, 2)           # clear of the top-left corner
    if cls == 0:
        m = (YY - cy) ** 2 + (XX - cx) ** 2 <= a * a
    else:
        m = (np.abs(YY - cy) <= a) & (np.abs(XX - cx) <= a)
    img[m] = rng.uniform(0.6, 1.0)
    if marker:
        img[1:4, 1:4] = 1.0
    img = ndi.gaussian_filter(img, 0.7) + rng.normal(0, 0.1, img.shape)
    return img.astype(np.float32)


def make(n, seed, rule):
    rng = np.random.default_rng(seed)
    y = rng.integers(0, 2, n)
    if rule == "spurious":
        marker = y == 1
    elif rule == "none":
        marker = np.zeros(n, dtype=bool)
    else:
        marker = rng.random(n) < 0.5
    X = np.stack([shape_img(rng, c, m) for c, m in zip(y, marker)])
    return torch.from_numpy(X)[:, None], torch.from_numpy(y), marker


Xs_tr, ys_tr, _ = make(2000, 0, "spurious")
Xc_tr, yc_tr, _ = make(2000, 0, "none")
Xs_va, ys_va, _ = make(500, 3, "spurious")
Xc_te, yc_te, _ = make(500, 1, "none")
Xr_te, yr_te, mr_te = make(500, 2, "random")
print("train:", tuple(Xs_tr.shape), f" class balance: {ys_tr.float().mean().item():.3f}")
print(f"random-marker test set: marker on {mr_te.mean():.2f} of images,"
      f" on {mr_te[yr_te.numpy() == 1].mean():.2f} of squares and"
      f" {mr_te[yr_te.numpy() == 0].mean():.2f} of circles")

fig, axes = plt.subplots(2, 8, figsize=(13, 3.6))
for r, (X, y, name) in enumerate([(Xs_tr, ys_tr, "spurious"), (Xc_tr, yc_tr, "clean")]):
    for k in range(8):
        axes[r, k].imshow(X[k, 0], cmap="gray", vmin=0, vmax=1.2)
        axes[r, k].set_title(["circle", "square"][int(y[k])], fontsize=9)
        axes[r, k].axis("off")
    axes[r, 0].text(-0.15, 0.5, name, transform=axes[r, 0].transAxes, rotation=90,
                    va="center", ha="right")
fig.suptitle("Training images: marker on every square (top), clean (bottom)")
plt.tight_layout()
plt.show()
```

```output
train: (2000, 1, 32, 32)  class balance: 0.521
random-marker test set: marker on 0.49 of images, on 0.52 of squares and 0.47 of circles
```

### Step 2: the network

The network is deliberately small and ends the way a classic CNN does: global average pooling
over the last convolutional map and one linear layer. `forward` returns the logits *and* the last
convolutional map $A$, of shape $(B, 32, 16, 16)$, because Grad-CAM needs to differentiate with
respect to it. Parameter count: $160 + 4{,}640 + 9{,}248 + 66 = 14{,}114$.

```python
class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.c1 = nn.Conv2d(1, 16, 3, padding=1)
        self.c2 = nn.Conv2d(16, 32, 3, padding=1)
        self.c3 = nn.Conv2d(32, 32, 3, padding=1)
        self.fc = nn.Linear(32, 2)

    def forward(self, x):
        x = F.max_pool2d(F.relu(self.c1(x)), 2)         # 16 x 16
        x = F.relu(self.c2(x))
        A = F.relu(self.c3(x))                          # last conv map (B, 32, 16, 16)
        return self.fc(A.mean((2, 3))), A


def train(X, y, epochs=8, bs=64, lr=2e-3, seed=0):
    torch.manual_seed(seed)
    model = Net()
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    g = torch.Generator().manual_seed(seed)
    for _ in range(epochs):
        model.train()
        perm = torch.randperm(len(X), generator=g)
        for k in range(0, len(X), bs):
            idx = perm[k:k + bs]
            loss = F.cross_entropy(model(X[idx])[0], y[idx])
            opt.zero_grad()
            loss.backward()
            opt.step()
    return model.eval()


@torch.no_grad()
def acc(model, X, y):
    return (model(X)[0].argmax(1) == y).float().mean().item()


print("parameters:", sum(p.numel() for p in Net().parameters()))
```

```output
parameters: 14114
```

### Step 3: validation accuracy that hides the shortcut

Train both models and score each on three test sets: the validation set drawn like the shortcut
training data, the clean test set, and the random-marker test set. The question is what each
number would tell a developer who only ever looked at the first one.

```python
shortcut = train(Xs_tr, ys_tr)
clean = train(Xc_tr, yc_tr)

print(f"{'':18s} {'marker = class':>15s} {'clean':>7s} {'random marker':>14s}")
for name, m in (("shortcut model", shortcut), ("clean model", clean)):
    print(f"{name:18s} {acc(m, Xs_va, ys_va):15.3f} {acc(m, Xc_te, yc_te):7.3f}"
          f" {acc(m, Xr_te, yr_te):14.3f}")
```

```output
                    marker = class   clean  random marker
shortcut model               1.000   0.750          0.718
clean model                  0.986   0.984          0.958
```

The shortcut model scores 1.000 on data drawn like its training set, 0.750 on clean data and
0.718 when the marker is decorrelated from the class. Its first score is perfect because the
marker alone gives the answer; the second shows that it learned the shapes only partly, because
the marker left little pressure to learn them. On the clean set the marker is missing for
every square, and with balanced classes 0.750 is what labelling every circle right and half the squares gives. The clean model scores 0.984 on clean data. Its
0.986 on the first set says that a marker on squares does not confuse it, and its 0.958 on the
random-marker set says that a marker on circles confuses it a little: the marker is a bright
patch it never saw. Nothing in the first column of the table reveals the difference between the
two models. Only a test set in which the shortcut breaks, or a look inside, does.

### Step 4: saliency and Grad-CAM from the definitions

Both methods answer "where is the evidence for class $c$?", and both start from the logit
$y^c$ of the class, before the softmax.

The **saliency map** is the magnitude of the gradient of the logit with respect to the input
pixels, $|\partial y^c / \partial x_{ij}|$: the pixels where a small change would move the score
most. It has the resolution of the image and is noisy, because the gradient of a ReLU network is
a piecewise-constant function of the input.

**Grad-CAM** works on the last convolutional map instead. For each channel $k$ it computes the
weight $\alpha_k^c$, the gradient of $y^c$ with respect to that channel's map averaged over its
$Z = H \cdot W$ positions, and forms the weighted sum, keeping only the positive evidence:

$$
\alpha_k^c = \frac{1}{Z}\sum_{i,j} \frac{\partial y^c}{\partial A^k_{ij}}, \qquad
L^c_{\text{Grad-CAM}} = \text{ReLU}\Big(\sum_k \alpha_k^c A^k\Big).
$$

The result has the resolution of $A$ (16 × 16 here) and is upsampled bilinearly to the image
size for display. In code, `A.retain_grad()` makes PyTorch keep the gradient of this
intermediate tensor, and `backward` on the single logit fills it.

The quantity to read from either map is the share of its total mass inside the top-left 6 × 6
corner, which holds the marker and a margin around it, and is $36/1024 = 3.5\%$ of the image. A
map that ignores the corner would put about 3.5% of its mass there. The test images are 100
squares from the random-marker set that carry the marker, the class is square, and the same
images go to both models.

```python
def grad_cam(model, x, c):
    """Grad-CAM for class c on one image x of shape (1, 1, S, S); returns (S, S)."""
    logits, A = model(x)
    A.retain_grad()
    logits[0, c].backward()
    alpha = A.grad.mean((2, 3), keepdim=True)       # (1, K, 1, 1): mean over positions
    cam = F.relu((alpha * A).sum(1, keepdim=True)).detach()
    up = F.interpolate(cam, size=(S, S), mode="bilinear", align_corners=False)
    return up[0, 0].numpy()


def saliency(model, x, c):
    x = x.clone().requires_grad_(True)
    model(x)[0][0, c].backward()
    return x.grad.abs()[0, 0].numpy()


def corner_share(m):
    return m[:6, :6].sum() / (m.sum() + 1e-12)


idx = np.where(mr_te & (yr_te.numpy() == 1))[0][:100]
share = {}
for name, model in (("shortcut", shortcut), ("clean", clean)):
    xs = [Xr_te[i:i + 1] for i in idx]
    share[name] = (np.mean([corner_share(grad_cam(model, x, 1)) for x in xs]),
                   np.mean([corner_share(saliency(model, x, 1)) for x in xs]))
print(f"{len(idx)} squares carrying the marker; "
      f"the corner is {36 / S ** 2:.3f} of the image")
print(f"{'':16s} {'Grad-CAM share':>15s} {'saliency share':>15s}")
for name, (g, s) in share.items():
    print(f"{name + ' model':16s} {g:15.3f} {s:15.3f}")
```

```output
100 squares carrying the marker; the corner is 0.035 of the image
                  Grad-CAM share  saliency share
shortcut model             0.269           0.088
clean model                0.101           0.061
```

### Step 5: look at the maps

The grid shows one square with the marker, the two models in the two rows, and for each the input
with its Grad-CAM overlaid and the saliency map. Titles state the corner share of that image's
map.

```python
i0 = int(idx[0])
x0 = Xr_te[i0:i0 + 1]
fig, axes = plt.subplots(2, 3, figsize=(9, 6))
pair = (("shortcut model", shortcut), ("clean model", clean))
for r, (name, model) in enumerate(pair):
    cam, sal = grad_cam(model, x0, 1), saliency(model, x0, 1)
    axes[r, 0].imshow(x0[0, 0], cmap="gray", vmin=0, vmax=1.2)
    axes[r, 0].set_title(f"{name}: input")
    axes[r, 1].imshow(x0[0, 0], cmap="gray", vmin=0, vmax=1.2)
    axes[r, 1].imshow(cam, cmap="jet", alpha=0.5)
    axes[r, 1].set_title(f"Grad-CAM, corner share {corner_share(cam):.2f}")
    axes[r, 2].imshow(sal, cmap="hot")
    axes[r, 2].set_title(f"saliency, corner share {corner_share(sal):.2f}")
    for c in range(3):
        axes[r, c].axis("off")
fig.suptitle("Evidence for 'square': shortcut model (top), clean model (bottom)")
plt.tight_layout()
plt.show()
```

### Step 6: Grad-CAM with a pooling head is the CAM

For this architecture the weights $\alpha_k^c$ do not need backpropagation. The logit is
$y^c = \sum_k w_k^c \cdot \frac{1}{Z}\sum_{i,j} A^k_{ij} + b^c$, which is linear in $A$, so

$$
\frac{\partial y^c}{\partial A^k_{ij}} = \frac{w_k^c}{Z}
\quad\Rightarrow\quad \alpha_k^c = \frac{1}{Z}\sum_{i,j}\frac{w_k^c}{Z} = \frac{w_k^c}{Z}.
$$

Since the factor $1/Z$ scales the whole map and the display normalises it, Grad-CAM equals the
**class activation map** of Zhou et al. (2016), $\sum_k w_k^c A^k$, the head's weights applied
at every position. Grad-CAM's contribution was to extend the idea to networks with any head, by
replacing $w_k^c/Z$ with the gradient. The check uses the trained shortcut model and reads the
number of positions from the map itself, `A.shape[2] * A.shape[3]`.

```python
x = Xr_te[i0:i0 + 1]
logits, A = shortcut(x)
A.retain_grad()
logits[0, 1].backward()
alpha = A.grad.mean((2, 3))[0]
Z = A.shape[2] * A.shape[3]
w = shortcut.fc.weight[1].detach()
print(f"Z = {Z}; max |alpha - w_c / Z| = {(alpha - w / Z).abs().max().item():.1e}")
```

```output
Z = 256; max |alpha - w_c / Z| = 2.3e-10
```

### Step 7: a randomisation test of the map

A heatmap can look plausible and still not explain anything: edge detectors, for instance, give
object-shaped maps whether or not a network is involved. Adebayo et al. (2018) proposed a
necessary condition. Destroy the learned weights of the layers closest to the output, and the
map must change. The test copies the shortcut model, re-initialises its head and its last
convolution with `reset_parameters()`, recomputes Grad-CAM on the same 100 images and prints the
mean Pearson correlation between each pair of maps. A correlation near 1 would mean that the
method ignores the weights.

```python
broken = copy.deepcopy(shortcut)
broken.fc.reset_parameters()
broken.c3.reset_parameters()

corrs = []
for i in idx:
    a = grad_cam(shortcut, Xr_te[i:i + 1], 1).ravel()
    b = grad_cam(broken, Xr_te[i:i + 1], 1).ravel()
    if a.std() > 0 and b.std() > 0:
        corrs.append(np.corrcoef(a, b)[0, 1])
print(f"maps compared: {len(corrs)}; mean correlation trained vs re-initialised: "
      f"{np.mean(corrs):.2f}")
shares = [corner_share(grad_cam(broken, Xr_te[i:i + 1], 1)) for i in idx]
print(f"corner share after re-initialisation: {np.mean(shares):.3f}")
```

```output
maps compared: 100; mean correlation trained vs re-initialised: 0.18
corner share after re-initialisation: 0.015
```

### What you should see

- **Validation accuracy drawn from the training distribution says nothing about the shortcut.**
  The shortcut model scores 1.000 there and 0.750 on clean data, a gap of 25 points, while the
  clean model scores 0.986 and 0.984. A developer who looked only at the first column would ship
  the shortcut model. The remedy is a test set built to break the suspected shortcut, here the
  random-marker set (0.718 against 0.958), and not more of the same validation data.
- **Grad-CAM points at the marker for the shortcut model.** Averaged over 100 marker-carrying
  squares, 0.269 of the shortcut model's Grad-CAM mass falls in the 6 × 6 corner that is 3.5% of
  the image, about 8 times its share of the area, against 0.101 for the clean model. The saliency
  shares are 0.088 and 0.061, in the same direction and much less decisive, which is the usual
  verdict on raw gradients: they are noisy, and the difference between the models is within what
  one would hesitate to call a finding. In the example of Step 5 both models also respond to the
  square's top and bottom edges, so the shortcut model uses the marker *and* some shape evidence,
  which fits its 0.750 on clean data; the figure does not show a model that looks only at the
  marker.
- **The clean model's corner share is not 3.5% either.** At 0.101 it is about three times the
  area share, because a marker is a bright, sharp-cornered patch and the clean model's
  edge-and-corner detectors respond to it. A heat map is evidence about the model's response to
  this input, and a small non-zero share in a place that should not matter is a reason to test
  with the marker removed, not a conclusion.
- **With a global-average-pooling head, Grad-CAM is CAM.** The weights $\alpha_k^c$ agree with
  $w_k^c/Z$ for $Z = 256$ to $2 \times 10^{-10}$, float32 round-off, so the gradient
  computation reproduces the closed form of Step 6.
- **The map depends on the model.** After re-initialising the head and the last convolution, the
  mean correlation with the trained model's map is 0.18, and the corner share falls to 0.015.
  This is necessary evidence that the method responds to the learned weights; it is not
  sufficient evidence that the map explains the model, since a method could pass this test and
  still mislead. Occlusion (Try this 1) is an independent check that uses no gradients.

### Try this

1. **Occlusion.** Slide a 6 × 6 grey patch (the image mean) over a marker-carrying square, record
   the drop in the class score at each position, and plot it as a map. It needs no gradients at
   all; compare it with Grad-CAM, and with saliency, on both models.
2. **Resolution.** Compute Grad-CAM on the digit CNN of [Lab 2](#lab2). Its last convolutional
   map is 4 × 4 and the images are 8 × 8, so the heat map has at most 16 cells, and explain why
   the result is too coarse to say where in a digit the evidence lies.
3. **Remove the correlation.** Retrain the shortcut model on a training set in which the marker
   appears on a random half of all images (rule `"random"`) and confirm that its Grad-CAM mass
   in the corner falls, and that its clean accuracy rises. Then ask what else in the data could
   still be a shortcut, such as the area difference between a circle and a square of the same
   radius, and design a test that would show it.


