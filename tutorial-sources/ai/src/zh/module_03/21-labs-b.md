## 实验 4 — 逐层看迁移学习 {#lab4}

**目标。** 你在数字 0 到 4 上预训练一个小型 CNN，然后只用每类 5 张或 20 张带标签图像，把它适配到数字 5 到 9。在完全相同的条件下比较六种适配方式：从头训练，复制并冻结三个卷积块中的一个、两个或三个，以及在冻结起步之后再微调。这一比较说明哪些层能迁移、哪些层不能，为什么冻结的骨干网络可能是糟糕的特征提取器，以及随着目标数据集增大，差距缩小了多少。最后一步重现[第 10 节](#s10)中的输入归一化错误：一个完全没问题的骨干网络，看上去却根本无法迁移。本实验只需要[第 10 节](#s10)。数据随 scikit-learn 提供，无需下载，整个实验在笔记本电脑的 CPU 上运行一到两分钟。

### 步骤 1：数据、划分，以及源任务与目标任务

数字是实验 2 中的 8 × 8 图像，划分方式也相同：`test_size=0.25`，分层，`random_state=0`。**源任务**（source task）是在标签为 0 到 4 的 675 张训练图像上的五分类问题。**目标任务**（target task）是数字 5 到 9 上的五分类问题，其测试集是这些数字的 224 张留出图像。目标训练集很小：每类 5 张或 20 张，按给定随机种子从 672 张目标训练图像中抽取，这样五个随机种子就从同一个池子里给出五个不同的小数据集。

所有图像都用*源训练集*的均值和标准差做标准化。这正是[第 10 节](#s10)的规则：骨干网络是在具有这些统计量的输入上训练的，所以无论后面接什么任务，它看到的输入都必须具有这些统计量。第 7 步展示忘记这一点时会发生什么。

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

### 步骤 2：骨干网络

骨干网络有三个块，每个块是卷积、批归一化和 ReLU。第一块看的是像素，只能计算局部模式：笔画和边缘。第二块加了一个最大池化，把特征图减半到 4 × 4，并把这些局部模式组合成短曲线和拐角。第三块把通道加宽到 64，并以全局平均池化结尾，所以骨干网络对每张图像输出一个由 64 个数组成的向量。顶上的线性层就是**分类头**（head）。把三个块保持为独立的模块，就可以复制、冻结或重新初始化骨干网络的任意前缀。

参数量是精确的算术。第 1 块：卷积 $1 \cdot 16 \cdot 9 + 16 = 160$ 个参数，批归一化 $2 \cdot 16 = 32$ 个。第 2 块：$16 \cdot 32 \cdot 9 + 32 = 4{,}640$ 和 64。第 3 块：$32 \cdot 64 \cdot 9 + 64 = 18{,}496$ 和 128。总和为 23,520，代码打印出同样的数字；分类头另加 $64 \cdot 5 + 5 = 325$ 个。

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

### 步骤 3：所有变体共用一个训练函数

六个实验都是同一个循环，只是冻结的部分不同，所以循环只写一次。`fit` 接受一个模型、一个训练集、轮次数、学习率，以及前端被冻结的块数。有三个细节在实践中最容易出错：

- 被冻结的参数设为 `requires_grad = False`，并且只把仍可训练的参数交给优化器，这样任何更新都碰不到被冻结的块。
- 冻结参数并不会冻结**批归一化统计量**。在训练模式下，批归一化层每次前向传播都会更新它的滑动均值和方差，所以一个“被冻结”的块会悄悄地向目标数据漂移。每次调用 `model.train()` 之后，都必须把被冻结的块重新设回 `eval()` 模式。
- 目标标签 5 到 9 映射为 0 到 4，以适配新的五分类头。

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

### 步骤 4：在源任务上预训练

在 675 张图像上以 $3 \times 10^{-3}$ 的学习率用 Adam 训练 30 个轮次，只需几秒钟。源测试集是数字 0 到 4 的 226 张留出图像。这样的五个数字类别很容易，所以精度应当接近 1；预训练只需要能用，不需要有什么意思。

```python
t0 = time.time()
source = Net(5)
fit(source, Z_tr[src_tr], y_tr[src_tr], epochs=30, lr=3e-3)
print(f"source test accuracy: {accuracy(source, Z_te[src_te], y_te[src_te]):.3f}")
```

```output
source test accuracy: 1.000
```

### 步骤 5：适配到数字 5 到 9 的六种方式

每个变体都新建一个网络，配上全新的五分类头，并从预训练网络复制若干块：

| 名称 | 复制的块 | 第 1 阶段冻结的块 | 第 2 阶段 |
|---|---|---|---|
| (a) 从头训练 | 无 | 无 | 无 |
| (b) 第 1 块 | 1 | 1 | 无 |
| (c) 第 1–2 块 | 1, 2 | 1, 2 | 无 |
| (d) 探测 | 1, 2, 3 | 1, 2, 3 | 无 |
| (e) 探测 + 微调 | 1, 2, 3 | 1, 2, 3 | 所有块，$3 \times 10^{-4}$ |
| (f) 第 1 块 + 微调 | 1 | 1 | 所有块，$3 \times 10^{-4}$ |

变体 (d) 是**线性探测**（linear probe）：所有块都被冻结，唯一学习的是 64 个池化特征上的线性分类器。变体 (e) 和 (f) 遵循[第 10 节](#s10)的流程：先以正常学习率训练新的部分，再解冻全部参数，以该学习率的十分之一训练，使复制来的权重只做温和的移动。第 1 阶段用 $3 \times 10^{-3}$ 训练 100 个轮次，batch 大小为 16；微调阶段再训练 100 个轮次。

`target_set` 按给定随机种子从目标训练池中每类抽取 $n$ 张图像，并把标签减去 5。`run_variant` 返回目标测试精度。

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

### 步骤 6：实验，五个随机种子，两种规模

比较在 $n = 5$ 和 $n = 20$ 下、对随机种子 0 到 4 运行每个变体。只有 25 或 100 张训练图像时，目标测试精度明显取决于抽到的是*哪些*图像，所以单个随机种子无异于掷硬币。五个随机种子给出均值和离散程度；离散程度为两到三个点时，变体之间一个点的差异是噪声，不作解读。表中列出在 224 张目标测试图像上精度的均值和（跨随机种子的）标准差。

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

把同样的数字画成图，更容易判断各变体的排序和误差棒的大小。

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

### 步骤 7：归一化错误

变体 (d) 对输入统计量最敏感，因为它下游没有任何部分能适应这些统计量。这个实验在每类 $n = 10$ 时训练线性探测，并评估两次：一次在用源统计量标准化的目标测试图像上，与训练时一致；一次在原始的 $[0, 1]$ 像素上。部署的模型收到的输入，如果其预处理与训练流水线不同，就会发生这种情况：预训练的骨干网络假定了某种输入尺度，它之后的一切都是针对这个尺度校准的。

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

### 你应该看到什么

- **源任务学会了，目标任务却不是白送的。** 预训练网络在 226 张源测试图像上达到 1.000，但它被冻结的特征对数字 5 到 9 来说是很差的基础。线性探测 (d) 在 $n = 5$ 时约为 0.66，$n = 20$ 时约为 0.76，而在同样图像上从头训练的网络约为 0.91 和 0.97。最后一块被训练来区分 0、1、2、3 和 4。它的 64 个池化特征保留了这五个类别需要的东西，丢掉了 5 到 9 需要的东西，再多的标签也找不回被丢掉的信息。早期层是通用的，后期层是专用的（[第 10 节](#s10)；Yosinski 等人，2014）。窄的源任务能迁移的几乎只有它的第一块，而 ImageNet 的广度正是整个 ImageNet 骨干网络能够迁移的原因。
- **第一块的迁移无害，但也无益。** 复制并冻结第 1 块 (b)，在两种规模下都与从头训练相差不超过随机种子间的离散程度（0.909 对 0.913，0.966 对 0.969）。它的 3 × 3 笔画和边缘检测器与从 25 张图像中学到的一样好，但它只有 $16 \cdot 9 = 144$ 个权重，学起来也很便宜，所以收益甚微。冻结第 1 和第 2 块 (c) 在 $n = 5$ 时略差（0.873）：第 2 块的特征已经专属于源数字。按复制深度排出的顺序，先 (b)，再 (c)，再 (d)，才是这里的观察结果；(a) 与 (b) 之间一个点的差异不是。
- **微调挽回了大部分损失，差距随数据增多而缩小。** 先探测再微调 (e)，在 $n = 5$ 时从 0.662 升到 0.807，在 $n = 20$ 时从 0.762 升到 0.960，与从头训练相差约一个点以内。在 $n = 5$ 时它仍比从头训练落后约 10 个点：25 张图像太少，推不动一个起点很差的骨干网络。第 1 块加微调 (f) 在 $n = 5$ 时与从头训练一样好（0.902），在 $n = 20$ 时是最好的变体（0.981 对 0.969），但在 $n = 20$ 时它与从头训练的差异约为随机种子间离散程度的一个标准差，所以这只是一个迹象，而不是结论。在 $n = 20$ 时，除线性探测外的所有变体彼此相差都在几个点以内。
- **归一化错误看起来像迁移失败。** 在正确标准化的输入上，线性探测在 $n = 10$ 时约为 0.71。输入原始的 $[0, 1]$ 像素，其均值为 0.31、标准差为 0.38，而不是 0 和 1，它就跌到约 0.21，即五个类别的随机水平。骨干网络、权重和代码都没有问题；问题在于输入所处的尺度，批归一化层和被冻结的分类头都没有针对它校准。这就是[第 10 节](#s10)中“迁移学习不起作用”的那种报告，检查只需两行：打印送入模型的数据的均值和标准差，并与训练流水线中的数值比较。
- **噪声决定了每个结论的尺度。** 跨随机种子的标准差从 0.007 到 0.034 不等。换用其他随机种子重跑，最后几位数字会变；线性探测低于其他所有变体的排序，以及在原始像素上的崩溃，则不会变。

### 动手试试

1. **判别式学习率。** 在 Adam 中为每个块设一个参数组，对第 1、2、3 块分别用 $3 \times 10^{-5}$、$10^{-4}$ 和 $3 \times 10^{-4}$，对分类头用 $3 \times 10^{-3}$ 来微调，并与变体 (e) 比较。
2. **批归一化陷阱。** 删掉把被冻结的块重新设回 `eval()` 模式的那一行。在训练分类头前后各打印一个批归一化层的 `running_mean`，并比较线性探测的精度。“被冻结”的骨干网络已经不再是预训练的那个了。
3. **源任务在哪里起作用。** 在[实验 2](#lab2) 的 16 × 16 画布上，把数字 0 到 4 放在随机位置进行预训练，在画布上重复这六个变体，并把线性探测与重新采样位置的从头训练进行比较。教训是一样的：在专属于源任务的特征上做线性探测，效果始终很弱。
4. **范围广的源任务。** 下面的代码块在这里不执行，因为它需要 `torchvision`，还要下载 44.7 MB 的 ImageNet 权重。在 Colab 上运行它，可以看到一个*范围广*的源任务迁移它的整个骨干网络：在 512 维池化特征上的线性探测，远强于本实验中的线性探测。本模块中没有任何数字依赖于它。

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

## 实验 5 — 合成图像上的 U-Net 分割，以及从掩码到测量 {#lab5}

**目标。** 你训练一个小型 U-Net，在类似显微图像的合成图像中分割出圆，并且只分割圆，而这些图像中还有亮度相同的矩形。你先说明全局强度阈值无法完成这项任务，然后通过有、无跳跃连接各训练一次 U-Net，测量跳跃连接的贡献，并用 Dice 系数和交并比（[第 12 节](#s12)）为两者打分。最后，你把预测的掩码转换为测量值，即面积和周长，并与真实的圆比较。这是[第 13 节](#s13)中从掩码到曲面这一步的二维版本：面积相当于体积，周长相当于表面积，而周长的测量方式比网络更重要。数据用 NumPy 生成，无需下载。在完整模式下，整个实验在台式机 CPU 上约需两分钟，在笔记本电脑上需两到四分钟；在第一个代码块中设置 `QUICK = True`，全部运行约 15 秒，代价是结果更差、噪声更大。

### 步骤 1：合成图像

每张图像为 64 × 64，包含二到四个物体，每个物体是一个圆（半径 4 到 10 像素）或一个矩形（边长 6 到 18 像素），强度从同一个范围 0.5 到 1.0 中抽取。物体可以重叠，后画的物体覆盖先画的物体。然后像光学系统那样，用标准差为 1 像素的高斯核模糊图像，沿随机方向加上幅度至多 0.3 的线性照明梯度，再叠加标准差为 0.1 的高斯噪声。目标掩码只包含圆。

有两个约定对后面的测量很重要。像素 $(i, j)$ 的中心位于 $(i + 0.5,\; j + 0.5)$，像素的*中心*落在圆内时，该像素属于这个圆。生成器还返回**孤立**圆的列表：这些圆没有被任何后画的物体覆盖，并且 3 像素之内没有其他物体。只有它们才有干净的真实面积 $\pi r^2$ 和周长 $2\pi r$，供第 8 步使用。

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

前景比例接近 6%，意味着 94% 的像素是背景，所以一个什么都不预测的模型的像素准确率就有 94%。这就是分割要用重叠度量来评分的原因，也是第 4 步在损失中加入 Dice 项的原因。先看八张图像。

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

### 步骤 2：阈值基线

在使用任何网络之前，先看最简单的分割方法：像素强度超过某个全局阈值，就判为前景。在 0.1 到 0.9 之间扫描 33 个值，选出在 300 张训练图像上使 Dice 最大的阈值，然后在验证集上评估。指标在所有图像的所有像素上汇总计算：

$$
\text{Dice} = \frac{2\,|P \cap T|}{|P| + |T|}, \qquad
\text{IoU} = \frac{|P \cap T|}{|P \cup T|},
$$

其中 $P$ 是预测的前景，$T$ 是目标。阈值一次只看一个像素，所以分不清圆和同样亮度的矩形，而照明梯度又会改变整幅图像上的亮度。它最多只能在照明梯度允许的范围内分割出*物体*，两种都包括在内，于是矩形就算作假阳性。

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

### 步骤 3：U-Net

网络遵循[第 12 节](#s12)。`cbr` 是设计中的基本单元：两个卷积，每个之后接批归一化和 ReLU，去掉偏置，因为批归一化的平移项使偏置变得多余。编码器有三级，分别为 64 × 64、32 × 32 和 16 × 16，通道数为 8、16 和 32，各级之间是 2 × 2 最大池化。8 × 8 的瓶颈有 64 个通道。解码器与编码器镜像对称：一个卷积核为 2、步长为 2 的转置卷积把分辨率加倍、通道数减半，结果与同一分辨率的编码器特征图**拼接**，再由一个 `cbr` 把它们混合。最后一个 1 × 1 卷积为每个像素给出一个 logit。

设 `skips=False` 时，拼接被去掉，解码器卷积的输入通道数减半。两个模型唯一的区别是解码器能否看到编码器的全分辨率特征图。

池化步骤要求输入能被 $2^3 = 8$ 整除，64 满足这一点。

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

带跳跃连接的模型多 12,096 个参数，全部在解码器的第一个卷积中，它们现在要读取两倍的通道。跳跃连接在参数上很便宜。它们的代价在内存：编码器特征图必须一直保留到解码器用上它们。

### 步骤 4：损失、训练循环和指标

损失是 logits 上的二元交叉熵与软 Dice 损失之和。交叉熵对每个像素都给出性质良好的梯度，但它被 94% 的背景所主导。软 Dice 损失 $1 - (2\sum p\,t + \epsilon)/(\sum p + \sum t + \epsilon)$，其中 $p$ 是预测概率，$t$ 是目标，$\epsilon = 1$，直接优化重叠度，不受类别比例的影响。它逐图像计算后取平均，使小圆和大圆的分量一样重。

训练用 Adam 和 one-cycle 学习率调度（10% 的预热升到峰值 $3 \times 10^{-3}$，然后余弦衰减），batch 大小为 16。每三个轮次，循环打印一次训练损失和阈值为 0.5 时的三个验证指标：在所有像素上汇总的 Dice 和 IoU，以及**边界带准确率**（boundary-band accuracy），即真实边界两侧 ±2 像素带内的像素准确率；这条带由目标掩码的二值膨胀减去二值腐蚀得到，结构元素为二维十字形。整体 Dice 被物体内部所主导，而内部很容易。模型之间的差别在边界带上。

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

### 步骤 5：有、无跳跃连接各训练一次

两次运行使用相同的随机种子、数据、调度和 batch 顺序，唯一不同的是 `skips`。在完整模式下，每次在四线程的台式机 CPU 上约需 40 到 60 秒。

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

没有跳跃连接的解码器必须从 8 × 8 的瓶颈重建边界，其中每个单元对应一个 8 × 8 的像素块。它能放对物体的位置、把形状大致做对，但单像素分辨率的精细位置信息已经在池化中丢失了。跳跃连接把这些信息交还给它。

下图展示四张验证图像、目标，以及两个模型在阈值 0.5 下的预测。两个模型的差异集中在边界上。

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

### 步骤 6：Dice 与 IoU 给出相同的排序

对单张图像，记 $a = |P \cap T|$，则 $|P| + |T| = a + u$，其中 $u = |P \cup T|$（因为
$|P| + |T| = |P \cup T| + |P \cap T|$），所以 $\text{Dice} = 2a/(a + u)$，$\text{IoU} = a/u$。代入 $a = \text{IoU} \cdot u$ 得
$$
\text{Dice} = \frac{2\,\text{IoU}\cdot u}{\text{IoU}\cdot u + u} = \frac{2\,\text{IoU}}{1 + \text{IoU}}.
$$
这一关系是单调的，所以两个指标对任何一组模型的排序都完全相同；它们只在尺度上不同，Dice 较大。下面的检查在逐张图像上以及对汇总的那一对数值，用数值验证这个恒等式。报告其中一个即可，要说明是哪一个，并且不要把一篇论文的 Dice 和另一篇论文的 IoU 相比较。

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

### 步骤 7：连通分量与孤立圆

为了测量物体，用 `ndi.label` 把二值预测分成若干**连通分量**（connected components），它给每一组相互接触的前景像素分配一个整数。对验证集中的每个孤立真实圆，与之匹配的预测是包含该圆中心像素的那个连通分量。如果圆的中心在预测中是背景，就记为漏检。接着做两项测量，每项都除以真实圆的精确值，所以 1.0 表示无偏：

- **面积**是连通分量的像素数，与 $\pi r^2$ 比较。
- **周长**用两种方式测量。(a) 前景与背景之间的像素边的数目，这是测量掩码边界最粗糙的方法。(b) *预测概率*在 0.5 处的等值线长度，由 `contourpy` 用移动正方形算法（marching squares）计算，它是移动立方体算法的二维版本：沿每个格子的边插值，找出概率穿过 0.5 的位置，再把这些交点连成折线。在连通分量周围两像素宽的边缘之外，概率图被置零，使等值线只属于这一个连通分量。两者都与 $2\pi r$ 比较。

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

面积比的标准差只有百分之几，这是测量的*方差*：一个圆的预测面积与另一个圆相差多少。周长比的均值则是*偏差*：对像素边周长，偏差约为 27%，网络做什么都改变不了它。这是模块 01 的误差分解以一种可测量的形式出现，也是第 8 步的由来。

### 步骤 8：为什么像素边周长长了 27%

取任何网络所能给出的最好掩码：一个理想的数字圆盘，即中心落在半径为 $r$ 的圆内的所有像素。它的像素边周长是一段阶梯的长度。逼近一条曲线的阶梯，覆盖的水平和垂直范围与曲线相同，所以它的长度是这些范围之和，而不是弧长：在四分之一圆上是 $2r$，在整个圆上是 $8r$，而弧长是 $2\pi r$。比值在每个半径下都是 $4/\pi = 1.273$，无论网格多细。因此在*任何*分辨率下，数边都有 27% 的偏差；这是度量本身的性质，而不是图像的性质。

下面的测试使用半径为 4、8、16 和 24、带亚像素偏移的圆盘，以及三种边界度量：像素边，二值掩码上的移动正方形算法（水平 0.5），以及在用标准差为 1 的高斯核模糊后的掩码上的移动正方形算法，网络输出的平滑概率图就是这个样子。

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

*二值*掩码上的移动正方形算法比数边好，因为它的顶点位于格子边的中点，切掉了阶梯的拐角；但二值输入给它的插值精度不会细于半个像素。在平滑的概率图上，插值能恢复边界的亚像素位置，半径 8 及以上时误差降到约百分之一以内。最小的圆盘短了 3%，因为模糊会使小圆盘的 0.5 等值线向内移动。这正是[第 13 节](#s13)在三维中所用的机制：数暴露在外的体素面，会以一个常数因子偏高，而在平滑场上用移动立方体算法则不会。

### 你应该看到什么

- **阈值做不了这项任务。** 最佳全局阈值（0.40）在验证图像上达到 Dice 0.641、IoU 0.471，它的训练 Dice（0.662）也好不到哪去，所以这是方法本身的极限，而不是过拟合。像素的强度无法说明它所属的物体是不是圆的。U-Net 达到 Dice 0.965，是因为它的瓶颈单元各自看到的图像区域比一个物体还大，所以能计算形状。
- **跳跃连接对边界的影响大于对整体的影响。** 有跳跃连接时：Dice 0.965，IoU 0.933，边界带准确率 0.950。没有时：0.952、0.908、0.920。整体 Dice 变化 1.3 个点，边界带准确率变化 3.0 个点；边界带上的差距在每个报告的轮次都可见，而汇总的 Dice 并非如此（带跳跃连接的模型在第 6 轮甚至跌到 0.836，当时学习率仍很高，之后又恢复了）。Dice 被物体内部所主导，而两个模型在内部都是对的。单靠解码器无法恢复在 8 × 8 瓶颈中丢失的细节。每个模型只运行了一次：边界带上的排序在每个报告的轮次都成立，但一个 Dice 点的差异需要多个随机种子才值得相信。在 QUICK 模式下差距预计会更大，因为没有跳跃连接的解码器用来弥补的时间更少。
- **Dice 与 IoU 是同一个排序。** 恒等式 $\text{Dice} = 2\,\text{IoU}/(1 + \text{IoU})$ 在每张图像上以及对汇总的那一对数值都在舍入误差（$10^{-16}$）内成立（两种算法都是 0.9651）。无论用哪一个，模型的排序都相同。
- **像素计数无偏；像素边周长有偏。** 在 161 个孤立圆中的 160 个上（漏检一个），面积比的均值为 0.999，标准差为 0.029。像素边周长比的均值为 1.266，接近 $4/\pi = 1.273$，标准差为 0.035：偏差几乎就是全部误差。预测概率的等值线给出 1.033，标准差为 0.017，偏差为 3%，离散程度减半。第 8 步说明，在理想圆盘上，像素边比值在每个半径下都恰好是 1.273，二值掩码上的移动正方形算法偏高 4% 到 6%，而在模糊后的掩码上，$r \geq 8$ 时误差在 1% 以内。
- **这对体积和表面意味着什么。** 同样的规律在三维中也成立（[第 13 节](#s13)）：体素计数给出的体积偏差很小，面计数会以一个依赖于朝向的常数因子高估表面积，而平滑场的等值面才是准确的度量。好的 Dice 分数对其中第二点几乎说明不了什么。

### 动手试试

1. **棋盘格伪影。** 把 `ConvTranspose2d(k=2, s=2)` 换成 `ConvTranspose2d(k=3, s=2, padding=1, output_padding=1)`，在训练早期观察预测概率中的棋盘格图案。卷积核为 3、步长为 2 时，各输出像素收到的贡献个数不同，这就是原因（[第 12 节](#s12)）。然后改用 `nn.Upsample(scale_factor=2, mode="bilinear")` 后接一个 3 × 3 卷积，并加以比较。
2. **损失。** 分别只用 BCE 和只用 Dice 训练。比较小圆（半径小于 6）上的 Dice 和训练曲线；两者中通常有一个起步较慢。
3. **输入尺寸。** 把一张 100 × 100 的图像送入训练好的 U-Net。解释报错（三次池化要求尺寸是 8 的倍数，跳跃连接要求形状匹配），并通过填充到 104 再裁剪输出来修复它。
4. **三维。** 用 `Conv3d` 和[第 13 节](#s13)的 `Down3D` 块重建网络，用 `GroupNorm(8, C)` 代替批归一化，在由球和立方体构成的 32³ 合成体数据上训练。像第 7 步那样用体素计数测量体积，并把每个轮次的时间与二维模型比较。

## 实验 6 — Grad-CAM 识破捷径 {#lab6}

**目标。** 你训练两个小型 CNN 来区分圆和正方形。一个在这样的数据上训练：每个正方形的左上角都带有一个小的亮标记，所以标记能完美地预测类别；另一个在干净的数据上训练。两者在与各自训练集同分布的数据上都得分很高，只有在标记不再能预测类别的测试集上，差别才会暴露出来。然后你按定义（[第 14 节](#s14)）实现显著图和 Grad-CAM，看每个模型关注哪里，验证带全局平均池化分类头的 Grad-CAM 就是 Zhou 等人的类激活图，并运行 Adebayo 等人的模型随机化合理性检查。数据是合成的，无需下载，本实验在笔记本电脑的 CPU 上约需十秒。

### 步骤 1：带捷径和不带捷径的图像

每张图像为 32 × 32，包含一个形状：一个圆或一个正方形，其半径或半边长从 5 到 9 像素中抽取，位置随机但避开左上角，强度为 0.6 到 1.0，再加上标准差为 0.7 像素的高斯模糊和标准差为 0.1 的噪声。标记是一个强度为 1.0 的 3 × 3 图块，位于第 1 到 3 行和第 1 到 3 列。`make` 的 `rule` 参数决定标记出现在哪里：

- `"spurious"`：出现在每个正方形上，不出现在任何圆上，所以标记是完美的预测因子；
- `"none"`：从不出现，即干净数据；
- `"random"`：出现在随机的一半图像上，与类别无关。

用前两种规则（随机种子 0）各生成 2,000 张图像的训练集。用随机种子 1（干净）和随机种子 2（随机标记）生成 500 张的测试集；另外用 spurious 规则（随机种子 3）生成 500 张图像，充当开发者通常会查看的验证集：它与训练数据同分布。

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

### 步骤 2：网络

网络刻意做得很小，并以经典 CNN 的方式结尾：在最后一个卷积特征图上做全局平均池化，再接一个线性层。`forward` 同时返回 logits *和*最后一个卷积特征图 $A$，其形状为 $(B, 32, 16, 16)$，因为 Grad-CAM 需要对它求导。参数量：$160 + 4{,}640 + 9{,}248 + 66 = 14{,}114$。

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

### 步骤 3：掩盖了捷径的验证精度

训练两个模型，并在三个测试集上为它们打分：与捷径训练数据同分布的验证集、干净测试集，以及随机标记测试集。问题在于，对于一个只看过第一个数字的开发者，每个数字分别会告诉他什么。

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

捷径模型在与其训练集同分布的数据上得分 1.000，在干净数据上为 0.750，在标记与类别去相关之后为 0.718。它的第一个分数是完美的，因为单凭标记就能给出答案；第二个分数表明它只部分地学会了形状，因为标记使它几乎没有学习形状的压力。在干净数据集上，每个正方形都没有标记，在类别均衡时，把每个圆都判对、把一半的正方形判对，得到的正是 0.750。干净模型在干净数据上得分 0.984。它在第一个数据集上的 0.986 说明，正方形上的标记不会让它困惑；它在随机标记数据集上的 0.958 说明，圆上的标记会让它有些困惑：标记是一块它从未见过的亮斑。表的第一列完全看不出两个模型之间的差别。只有让捷径失效的测试集，或者深入模型内部看一看，才能揭示它。

### 步骤 4：按定义实现显著图和 Grad-CAM

两种方法回答的都是“类别 $c$ 的证据在哪里？”，两者都从该类别在 softmax 之前的 logit $y^c$ 出发。

**显著图**（saliency map）是 logit 对输入像素的梯度的幅值 $|\partial y^c / \partial x_{ij}|$：微小的变化会使得分改变最多的那些像素。它具有图像的分辨率，并且噪声很大，因为 ReLU 网络的梯度是输入的分段常数函数。

**Grad-CAM** 则作用于最后一个卷积特征图。对每个通道 $k$，它计算权重 $\alpha_k^c$，即 $y^c$ 对该通道特征图的梯度在其 $Z = H \cdot W$ 个位置上的平均，再求加权和，只保留正的证据：

$$
\alpha_k^c = \frac{1}{Z}\sum_{i,j} \frac{\partial y^c}{\partial A^k_{ij}}, \qquad
L^c_{\text{Grad-CAM}} = \text{ReLU}\Big(\sum_k \alpha_k^c A^k\Big).
$$

结果具有 $A$ 的分辨率（这里是 16 × 16），显示时用双线性插值上采样到图像大小。在代码中，`A.retain_grad()` 让 PyTorch 保留这个中间张量的梯度，而对单个 logit 调用 `backward` 会填充它。

两种图要读出的量，是图的总质量中落在左上角 6 × 6 区域内的比例；这个角落容纳了标记及其周围的边距，占图像的 $36/1024 = 3.5\%$。不理会这个角落的图，大约会把 3.5% 的质量放在那里。测试图像是随机标记数据集中带标记的 100 个正方形，类别是正方形，两个模型使用同样的图像。

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

### 步骤 5：看这些图

网格展示一个带标记的正方形，两行分别对应两个模型，每行给出叠加了 Grad-CAM 的输入以及显著图。标题注明该图像的图中角落所占的比例。

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

### 步骤 6：带池化分类头的 Grad-CAM 就是 CAM

对这种架构，权重 $\alpha_k^c$ 不需要反向传播。logit 为
$y^c = \sum_k w_k^c \cdot \frac{1}{Z}\sum_{i,j} A^k_{ij} + b^c$，它对 $A$ 是线性的，所以

$$
\frac{\partial y^c}{\partial A^k_{ij}} = \frac{w_k^c}{Z}
\quad\Rightarrow\quad \alpha_k^c = \frac{1}{Z}\sum_{i,j}\frac{w_k^c}{Z} = \frac{w_k^c}{Z}.
$$

由于因子 $1/Z$ 缩放的是整张图，而显示时会对图做归一化，所以 Grad-CAM 等于 Zhou 等人（2016）的**类激活图**（class activation map）$\sum_k w_k^c A^k$，即在每个位置上应用分类头的权重。Grad-CAM 的贡献在于用梯度代替 $w_k^c/Z$，把这一思想推广到带任意分类头的网络。检查使用训练好的捷径模型，并从特征图本身读出位置数 `A.shape[2] * A.shape[3]`。

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

### 步骤 7：对图做随机化测试

一张热力图可能看起来合理，却什么也解释不了：例如边缘检测器无论是否涉及网络，都会给出物体形状的图。Adebayo 等人（2018）提出了一个必要条件：破坏最靠近输出的几层所学到的权重，图就必须改变。测试复制捷径模型，用 `reset_parameters()` 重新初始化它的分类头和最后一个卷积，在同样的 100 张图像上重新计算 Grad-CAM，并打印每对图之间皮尔逊相关系数的均值。相关系数接近 1 意味着该方法忽略了权重。

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

### 你应该看到什么

- **从训练分布中抽取的验证精度，对捷径什么也说明不了。** 捷径模型在那里得分 1.000，在干净数据上为 0.750，相差 25 个点，而干净模型的得分为 0.986 和 0.984。只看第一列的开发者会把捷径模型发布出去。补救办法是构建一个专门打破可疑捷径的测试集，这里就是随机标记数据集（0.718 对 0.958），而不是更多同样的验证数据。
- **对捷径模型，Grad-CAM 指向标记。** 在 100 个带标记的正方形上平均，捷径模型 Grad-CAM 质量的 0.269 落在占图像 3.5% 的 6 × 6 角落中，约为其面积占比的 8 倍，而干净模型为 0.101。显著图的占比是 0.088 和 0.061，方向相同，但远没有那么确定，这是对原始梯度的通常评价：它们噪声很大，两个模型之间的差别处在一个人们会犹豫是否称之为发现的范围内。在第 5 步的例子中，两个模型也都对正方形的上下边缘有响应，所以捷径模型既用了标记，*也*用了一些形状证据，这与它在干净数据上的 0.750 相符；图中所示的并不是一个只看标记的模型。
- **干净模型的角落占比也不是 3.5%。** 它为 0.101，约为面积占比的三倍，因为标记是一块明亮、拐角锐利的图块，干净模型的边缘和拐角检测器会对它产生响应。热力图是关于模型对这个输入的响应的证据；在一个本不该有影响的位置上出现很小的非零占比，是去掉标记再做测试的理由，而不是结论。
- **对全局平均池化分类头，Grad-CAM 就是 CAM。** 对 $Z = 256$，权重 $\alpha_k^c$ 与 $w_k^c/Z$ 的差在 $2 \times 10^{-10}$ 以内，即 float32 的舍入误差，所以梯度计算重现了第 6 步的闭式解。
- **图依赖于模型。** 重新初始化分类头和最后一个卷积之后，与训练好的模型的图的平均相关系数为 0.18，角落占比降到 0.015。这是该方法对学到的权重有响应的必要证据；但它不是图能解释模型的充分证据，因为一种方法可能通过这项测试却仍然误导人。遮挡（动手试试第 1 项）是一项不使用梯度的独立检查。

### 动手试试

1. **遮挡。** 在一个带标记的正方形上滑动一个 6 × 6 的灰色图块（取图像均值），记录每个位置上类别得分的下降，并把它画成一张图。这完全不需要梯度；在两个模型上把它与 Grad-CAM 以及显著图进行比较。
2. **分辨率。** 在[实验 2](#lab2) 的数字 CNN 上计算 Grad-CAM。它的最后一个卷积特征图是 4 × 4，而图像是 8 × 8，所以热力图至多有 16 个格子；解释为什么这个结果太粗，无法说明证据位于数字的哪个部位。
3. **去除相关性。** 在标记出现在所有图像中随机一半上的训练集（规则 `"random"`）上重新训练捷径模型，确认它在角落中的 Grad-CAM 质量下降，干净精度上升。然后思考数据中还有什么可能成为捷径，例如同样半径的圆与正方形之间的面积差，并设计一个能揭示它的测试。

