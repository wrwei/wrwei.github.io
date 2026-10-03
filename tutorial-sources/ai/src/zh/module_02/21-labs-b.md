## 实验 4 — 老老实实做手写数字：一次完整的 PyTorch 训练 {#lab4}

**目标。** 你在手写数字上训练一个 MLP，并且这一次，训练前后一个严谨的工程师该做的事你都要做。训练之前，先看数据，找出会破坏标准化的像素，检查初始损失。接着通过过拟合单个 batch 证明模型和训练循环确实能够学习。然后用 AdamW、余弦调度和基于验证集的早停（early stopping）训练，用钩子（hook）观察逐层统计量，只碰测试集一次，并报告它的标准误。最后在五个随机种子上重复整个流程，以便分辨有意义的差异和噪声。模型写成 `nn.Module` 的子类，这正是[模块 03](module_03_ZH.html)所依赖的形式。本实验需要 PyTorch、NumPy 和 scikit-learn，不需要下载任何东西，CPU 约需十五秒。

### 第 1 步：加载、划分，以及破坏标准化的像素

`load_digits` 内置于 scikit-learn：1,797 张 $8 \times 8$ 的灰度图像，像素值从 0 到 16，共十个类别，每类约 180 张。划分比例为 60/20/20，分别是训练集、验证集和测试集，按类别分层（stratified），使每个子集的类别比例相同，并固定 `random_state`。只有训练集可以用来计算关于数据的任何量。这就是[模块 01 第 10 节](module_01_ZH.html#s10)的规则：统计量在训练集上拟合，然后原样应用到其他子集。

标准化先减去逐像素的均值，再除以逐像素的标准差。对于在训练集上恒为常数的像素，这会失败，因为除数为零。在这个数据集中，一些边缘像素（左上角，以及左右两侧边缘的中间位置）几乎总是空白。下面的代码块找出这些像素，展示朴素标准化对验证集做了什么，并采用常用的保护措施：把为零的标准差替换为 1，这样常数像素就变成恒为零。

```python
import copy
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

np.random.seed(0)
torch.manual_seed(0)

digits = load_digits()
X_all, y_all = digits.data, digits.target
X_train, X_rest, y_train, y_rest = train_test_split(
    X_all, y_all, test_size=0.4, stratify=y_all, random_state=0)
X_val, X_test, y_val, y_test = train_test_split(
    X_rest, y_rest, test_size=0.5, stratify=y_rest, random_state=0)
print("split sizes (train/val/test):", len(X_train), len(X_val), len(X_test))
print("class counts in the whole set:", np.bincount(y_all).min(), "to", np.bincount(y_all).max())

mean = X_train.mean(axis=0)
std = X_train.std(axis=0)
constant = np.flatnonzero(std == 0)
print("pixels with zero standard deviation on the training set:", constant.tolist())

with np.errstate(divide="ignore", invalid="ignore"):
    naive = (X_val - mean) / std
print("non-finite values after naive standardisation of the validation set:",
      int((~np.isfinite(naive)).sum()))

std_safe = np.where(std == 0, 1.0, std)          # constant pixels become constant zeros


def prepare(X):
    return torch.tensor((X - mean) / std_safe, dtype=torch.float32)


Xtr, Xva, Xte = prepare(X_train), prepare(X_val), prepare(X_test)
ytr, yva, yte = (torch.tensor(y, dtype=torch.long) for y in (y_train, y_val, y_test))
print(f"standardised training set: mean {Xtr.mean():.3f}, std {Xtr.std():.3f}")
```

```output
split sizes (train/val/test): 1078 359 360
class counts in the whole set: 174 to 183
pixels with zero standard deviation on the training set: [0, 24, 32, 39]
non-finite values after naive standardisation of the validation set: 1436
standardised training set: mean 0.000, std 0.968
```

有四个像素在训练集中从未亮起。在验证集中它们同样是空白，所以朴素公式对 $4 \times 359 = 1{,}436$ 个元素中的每一个都计算 $0/0$，返回 `nan`（如果别的划分中出现非零像素，则得到 `inf`）。一个 `nan` 会污染第一次矩阵乘法，并经由它污染每一个权重。网络不会为此报错；损失只是悄悄变成 `nan`。这个保护措施只需一行，这个检查只需一次 print。标准化后训练集的整体标准差略低于 1，是因为常数像素贡献的都是零。

### 第 2 步：作为 `nn.Module` 的模型，以及初始损失

模型是 $64 \to 128 \to 128 \to 10$，使用 ReLU 激活函数。各层在 `__init__` 中创建，在 `forward` 中组合。两个 ReLU 作为带名字的子模块保存，以便在第 5 步给每一个挂上前向钩子；如果在 `forward` 里直接调用 `F.relu`，就没有可以挂钩子的对象了。`Dropout` 这一槽位是为扩展练习预留的，目前概率为 0，不起任何作用。

训练之前要检查两个数。参数量必须与手算结果一致：$64 \cdot 128 + 128 + 128 \cdot 128 + 128 + 128 \cdot 10 + 10 = 26{,}122$。而且未训练网络的损失必须接近 $\ln 10 = 2.303$，即对十个类别做均匀预测的损失（[第 14 节](#s14)）。如果与之相差很远，说明输出层过大、目标有误，或者损失作用在了错误的张量上。

```python
class MLP(nn.Module):
    def __init__(self, d_in=64, d_hidden=128, n_classes=10, p_drop=0.0):
        super().__init__()
        self.fc1 = nn.Linear(d_in, d_hidden)
        self.act1 = nn.ReLU()
        self.drop1 = nn.Dropout(p_drop)
        self.fc2 = nn.Linear(d_hidden, d_hidden)
        self.act2 = nn.ReLU()
        self.drop2 = nn.Dropout(p_drop)
        self.fc3 = nn.Linear(d_hidden, n_classes)

    def forward(self, x):
        x = self.drop1(self.act1(self.fc1(x)))
        x = self.drop2(self.act2(self.fc2(x)))
        return self.fc3(x)                       # logits; the softmax lives in the loss


torch.manual_seed(0)
model = MLP()
n_params = sum(p.numel() for p in model.parameters())
print("parameters:", n_params)

with torch.no_grad():
    initial_loss = F.cross_entropy(model(Xtr), ytr).item()
print(f"initial training loss: {initial_loss:.3f}   ln(10) = {np.log(10):.3f}")
```

```output
parameters: 26122
initial training loss: 2.309   ln(10) = 2.303
```

参数量与手算一致，初始损失与 $\ln 10$ 相差仅千分之几。这点多出来的部分来自随机 logits 的离散程度：网络一开始几乎（但不完全）处于均匀预测。注意模型返回的是 logits。损失函数在内部以[第 12 节](#s12)的稳定形式应用 softmax；如果在 `forward` 里再套一层 softmax，就是实验 5 中脚本 A 的 bug。

### 第 3 步：过拟合单个 batch

要检验模型、损失和优化器是否接对了，成本最低的测试是：取一个小 batch，看损失能否被压到接近零。三十二张图像远少于模型的 26,122 个参数，所以一个正常工作的训练循环必须能记住它们。如果做不到，在完整数据集上再怎么训练也没有用；bug 出在代码里，而不在数据或超参数。优化器是 $\eta = 10^{-3}$ 的 AdamW，不用权重衰减，因为权重衰减与记忆化作对。

```python
torch.manual_seed(0)
model = MLP()
opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.0)
xb, yb = Xtr[:32], ytr[:32]
for step in range(201):
    loss = F.cross_entropy(model(xb), yb)
    if step in (0, 50, 100, 200):
        print(f"step {step:3d}: loss {loss.item():.4f}")
    opt.zero_grad()
    loss.backward()
    opt.step()
```

```output
step   0: loss 2.3085
step  50: loss 0.0463
step 100: loss 0.0037
step 200: loss 0.0012
```

损失在 200 步内下降了三个数量级。这是配置健康的标志：梯度流到了每一层，优化器更新的是正确的参数，标签与输入相匹配。但它还完全不能说明泛化。

### 第 4 步：用验证集训练并早停

现在是正式的训练。各个部件来自[第 13 节](#s13)：每个轮次（epoch）重新打乱的 64 大小的 mini-batch，$\eta = 10^{-3}$、权重衰减为 $10^{-2}$ 的 AdamW，在 100 个轮次内把学习率降到零的余弦调度（`T_max` 以调度器的步数计，因此调度器每个轮次步进一次），以及早停：每个轮次结束后在评估模式下计算验证损失，用 `copy.deepcopy` 保存模型的最佳状态，当验证损失连续 15 个轮次没有改善时停止训练。

这个函数只写一次，在第 5 步和第 7 步中再次使用。它接受一个随机种子（决定初始权重和打乱顺序）、一个 dropout 概率，以及一组需要记录监控统计量的轮次。监控代码在第 5 步给出；这里该参数为空。它报告的训练损失是该轮次所有 mini-batch 的平均值，而不是最后一个 mini-batch 的损失。

```python
def evaluate(model, X, y):
    """Mean loss, accuracy and logits in evaluation mode, without gradients."""
    model.eval()
    with torch.no_grad():
        logits = model(X)
    return F.cross_entropy(logits, y).item(), (logits.argmax(1) == y).float().mean().item(), logits


def fit(seed, p_drop=0.0, epochs=100, patience=15, batch=64, lr=1e-3, wd=1e-2,
        monitor_epochs=(), verbose=False):
    torch.manual_seed(seed)
    model = MLP(p_drop=p_drop)
    opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=wd)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)
    history = []
    best = {"val_loss": float("inf"), "epoch": 0, "state": None}
    monitor = {}
    for epoch in range(1, epochs + 1):
        model.train()
        order = torch.randperm(len(Xtr))
        total, last_batch = 0.0, None
        for start in range(0, len(Xtr), batch):
            idx = order[start:start + batch]
            loss = F.cross_entropy(model(Xtr[idx]), ytr[idx])
            opt.zero_grad()
            loss.backward()
            before = [p.detach().clone() for p in model.parameters()]
            opt.step()
            total += loss.item() * len(idx)
            last_batch = before
        sched.step()
        train_loss = total / len(Xtr)
        val_loss, val_acc, _ = evaluate(model, Xva, yva)
        history.append((train_loss, val_loss, val_acc))
        if epoch in monitor_epochs:
            monitor[epoch] = collect_statistics(model, last_batch)
        if val_loss < best["val_loss"]:
            best = {"val_loss": val_loss, "epoch": epoch,
                    "state": copy.deepcopy(model.state_dict())}
        if verbose and epoch % 10 == 0:
            print(f"epoch {epoch:3d}: train loss {train_loss:.4f}  "
                  f"val loss {val_loss:.4f}  val acc {val_acc:.3f}")
        if epoch - best["epoch"] >= patience:
            if verbose:
                print(f"early stop at epoch {epoch}; best epoch {best['epoch']} "
                      f"(val loss {best['val_loss']:.4f})")
            break
    model.load_state_dict(best["state"])
    return model, history, best, monitor


def collect_statistics(model, weights_before_last_step):
    return None                                  # replaced by the real version in Step 5


model, history, best, _ = fit(seed=0, verbose=True)
```

```output
epoch  10: train loss 0.0489  val loss 0.1412  val acc 0.964
epoch  20: train loss 0.0096  val loss 0.1218  val acc 0.969
epoch  30: train loss 0.0039  val loss 0.1168  val acc 0.967
epoch  40: train loss 0.0022  val loss 0.1162  val acc 0.964
early stop at epoch 49; best epoch 34 (val loss 0.1159)
```

训练损失持续下降到千分之几，而验证损失在第 34 轮前后达到最小值，然后趋于平缓。两者之间的差距就是过拟合，而验证准确率并没有随之提高。早停选出验证损失最低的那个轮次，并恢复当时的状态。用损失而不是准确率作为停止准则更好，因为损失是平滑的，并且会持续反映置信度的变化，而 359 张图像上的准确率是以 0.28 个百分点为步长跳变的。还要注意，训练停止时，余弦调度的学习率仍约为初始值的一半：早停与退火到零是两种相互独立的机制。

### 第 5 步：用钩子看清内部

损失下降并不能说明各层是否健康。[第 14 节](#s14)列出了四个逐层统计量，这一步在训练的三个时间点（第 1、10 和 30 轮）测量它们：

- 每个隐藏层激活值的标准差，用**前向钩子**（forward hook）测量；前向钩子是这样一个函数：每当模块运行一次，PyTorch 就用该模块的输出调用它；
- 死亡单元的比例，即 ReLU 输出对训练集中每一张图像都为零的那些单元；
- 每个权重矩阵的梯度范数，取自该轮次最后一步的梯度；
- 最后一步的更新与权重之比 $\|\Delta\mathbf{W}\| / \|\mathbf{W}\|$，这需要保留一份该步之前的权重副本（第 4 步的循环已经保存了一份）。

监控是在 `torch.no_grad()` 下对整个训练集做一次全 batch 前向传播，并且处于训练模式，这样一旦打开 dropout，测到的就是它在训练中实际起作用的状态；当 dropout 设为 0 时，模式不产生任何影响。这个代码块重新定义了 `fit` 所调用的 `collect_statistics`，并用同一个随机种子再训练一次，因此训练过程本身与第 4 步完全相同。

```python
def collect_statistics(model, weights_before_last_step):
    captured = {}
    hooks = [m.register_forward_hook(lambda mod, inp, out, name=name: captured.update({name: out}))
             for name, m in (("act1", model.act1), ("act2", model.act2))]
    model.train()
    with torch.no_grad():
        model(Xtr)
    for h in hooks:
        h.remove()
    weights = [(n, p) for n, p in model.named_parameters() if n.endswith("weight")]
    named_before = dict(zip([n for n, _ in model.named_parameters()], weights_before_last_step))
    stats = {
        "act_std": [captured[k].std().item() for k in ("act1", "act2")],
        "dead": [(captured[k] == 0).all(dim=0).float().mean().item() for k in ("act1", "act2")],
        "grad_norm": [p.grad.norm().item() for _, p in weights],
        "update_ratio": [((p.detach() - named_before[n]).norm() / p.detach().norm()).item()
                         for n, p in weights],
    }
    return stats


model, history, best, monitor = fit(seed=0, monitor_epochs=(1, 10, 30))
print("epoch | activation std (L1/L2) | dead units (L1/L2) | grad norms (W1/W2/W3)"
      " | update ratios")
for epoch, s in monitor.items():
    print(f"{epoch:5d} | {s['act_std'][0]:.2f} / {s['act_std'][1]:.2f}"
          f"            | {s['dead'][0]:.3f} / {s['dead'][1]:.3f}"
          f"      | {s['grad_norm'][0]:.3f} / {s['grad_norm'][1]:.3f} / {s['grad_norm'][2]:.3f}"
          f" | {s['update_ratio'][0]:.1e} / {s['update_ratio'][1]:.1e} / {s['update_ratio'][2]:.1e}")
```

```output
epoch | activation std (L1/L2) | dead units (L1/L2) | grad norms (W1/W2/W3) | update ratios
    1 | 0.37 / 0.22            | 0.000 / 0.008      | 0.293 / 0.350 / 0.427 | 8.7e-03 / 1.2e-02 / 1.3e-02
   10 | 0.62 / 1.02            | 0.000 / 0.016      | 0.119 / 0.082 / 0.162 | 1.5e-03 / 1.8e-03 / 1.6e-03
   30 | 0.68 / 1.25            | 0.000 / 0.016      | 0.015 / 0.010 / 0.020 | 2.3e-04 / 2.6e-04 / 2.3e-04
```

把这张表当作健康训练的指纹来读。激活值从初始尺度开始增长，但始终保持在一的量级，所以没有饱和，也没有消失。死亡单元只占该层的一小部分。从第 1 轮到第 30 轮，梯度范数随着损失趋近于零下降到原来的二十分之一到三十五分之一，而三个矩阵的梯度范数相互之间始终相差不到两倍。更新与权重之比从约 $10^{-2}$ 降到几个 $10^{-4}$，这是余弦调度和不断缩小的梯度共同减小 Adam 步长的结果；[第 14 节](#s14)的经验法则认为健康值在 $10^{-3}$ 附近，而在训练末尾，更小的值只说明训练已经收敛。这里没有什么需要处理的，而这恰恰是重点：出问题时，这些列中通常会有一列跑出正常范围。

### 第 6 步：测试集，只用一次

应该报告的是由早停恢复的那个模型。测试集现在才使用，只用一次，得到写进报告的那个数。各种选择（架构、权重衰减、patience）都已在验证集上做出。360 张图像上的准确率是一个比例 $\hat p$，它的标准误是 $\sqrt{\hat p (1 - \hat p)/n}$（[模块 01 第 10 节](module_01_ZH.html#s10)）。接下来要读的是混淆矩阵和错误清单：它们说明哪些数字之间容易混淆，这是单个准确率所掩盖的信息。

```python
test_loss, test_acc, test_logits = evaluate(model, Xte, yte)
se = (test_acc * (1 - test_acc) / len(Xte)) ** 0.5
print(f"test accuracy {test_acc:.4f} +- {se:.4f} (standard error), test loss {test_loss:.4f}")

pred = test_logits.argmax(1)
confusion = torch.zeros(10, 10, dtype=torch.long)
for t, p_ in zip(yte, pred):
    confusion[t, p_] += 1
print("confusion matrix (rows: true class, columns: predicted class)")
print("     " + " ".join(f"{c:2d}" for c in range(10)))
for c in range(10):
    print(f"{c:3d}: " + " ".join(f"{v:2d}" if v else " ." for v in confusion[c].tolist()))

wrong = (pred != yte).nonzero().flatten().tolist()
print(f"{len(wrong)} misclassified test images (true, predicted):",
      [(int(yte[i]), int(pred[i])) for i in wrong])
```

```output
test accuracy 0.9694 +- 0.0091 (standard error), test loss 0.1481
confusion matrix (rows: true class, columns: predicted class)
      0  1  2  3  4  5  6  7  8  9
  0: 35  .  .  .  .  .  .  .  .  .
  1:  . 36  .  .  .  .  .  .  1  .
  2:  .  1 33  .  .  .  .  .  1  .
  3:  .  .  . 36  .  .  .  1  .  .
  4:  .  .  1  . 33  .  .  1  1  .
  5:  .  .  .  .  1 35  1  .  .  .
  6:  .  .  .  .  .  . 36  .  .  .
  7:  .  .  .  .  .  .  . 36  .  .
  8:  .  1  .  .  .  .  .  . 34  .
  9:  .  .  .  .  .  1  .  .  . 35
11 misclassified test images (true, predicted): [(8, 1), (1, 8), (5, 4), (5, 6), (4, 8), (4, 7), (9, 5), (3, 7), (2, 8), (4, 2), (2, 1)]
```

标准误接近一个百分点。这就是这个测试集的分辨率：在这 360 张图像上测得的两个模型 0.5 个点的差异，完全落在噪声之内。错误分散在外形相似的数字之间，并没有集中在某一个类别上。

### 第 7 步：五个随机种子

一次运行就是对初始权重和打乱顺序的一次抽样。下面的循环在同一划分上，对随机种子 0 到 4 重复第 4 步和第 6 步，并报告每次运行的测试准确率及其均值和标准差。这就是种子间的离散程度：它是不确定性中来自训练过程的那一部分，有别于第 6 步的标准误，后者来自有限的测试集。它们是不同的变异来源，二者都限制了比较所能说明的东西。

```python
accuracies = []
for seed in range(5):
    m, _, b, _ = fit(seed=seed)
    _, acc, _ = evaluate(m, Xte, yte)
    accuracies.append(acc)
    print(f"seed {seed}: best epoch {b['epoch']:3d}, test accuracy {acc:.4f}")
accuracies = np.array(accuracies)
print(f"test accuracy over 5 seeds: {100 * accuracies.mean():.2f}% "
      f"+- {100 * accuracies.std(ddof=1):.2f} (standard deviation)")
```

```output
seed 0: best epoch  34, test accuracy 0.9694
seed 1: best epoch  37, test accuracy 0.9722
seed 2: best epoch  21, test accuracy 0.9750
seed 3: best epoch  22, test accuracy 0.9694
seed 4: best epoch  37, test accuracy 0.9778
test accuracy over 5 seeds: 97.28% +- 0.36 (standard deviation)
```

种子间的离散程度只有零点几个百分点，小于单次测试评估的标准误。这个实验的报告应给出均值、跨种子的标准差和测试集大小，而不应把 0.3 个点的提升宣称为一种效应。

### 你应该看到什么

- 两项合理性检查在训练开始之前就能抓出真正的问题：常数像素破坏了朴素标准化（1,436 个非有限值来自 4 个像素乘以 359 张图像），而初始损失则确认初始化是合理的。
- 过拟合单个 batch 能把损失压到接近零，说明训练循环接线正确。
- 验证损失趋于平缓之后，训练损失仍在持续下降。这个差距就是过拟合，而早停选出的是差距变大之前的那个轮次。
- 隐藏层激活值保持在一的量级，死亡单元很少：监控中没有任何需要处理的地方，这正是健康训练的样子。
- 测试准确率的标准误是种子间离散程度的两倍多。二者都限制了在这份数据上任何比较所能说明的东西。
- MLP 把 $8 \times 8$ 的图像看成 64 个互不相关的数。[模块 03](module_03_ZH.html)会把它所忽略的结构构建进模型。

### 动手试试

1. 把 dropout 槽位设为 $p = 0.2$（`fit(seed, p_drop=0.2)`），在同样的五个随机种子上比较验证损失、最佳轮次和测试准确率。验证损失是否改善，这个变化是否大于种子间的离散程度？
2. 校准（[第 11 节](#s11)）：在验证集 logits 上，通过在 $[0.05, 5]$ 上做网格搜索拟合一个温度 $T$，使 `logits / T` 的负对数似然最小，并比较校准前后的测试 NLL 和期望校准误差（[模块 01 第 7 节](module_01_ZH.html#s7)）。然后改用 `F.cross_entropy(..., label_smoothing=0.1)` 重新训练并重复上述步骤：平滑后的模型置信度不足，它拟合出的温度应当小于 1。
3. 把 AdamW 换成 `torch.optim.SGD(lr=0.05, momentum=0.9)`，比较最佳轮次和测试准确率。
4. 分别用训练集的 25%、50% 和 100% 训练，并画出测试准确率随训练集大小变化的曲线：把“更多数据”量化出来。

## 实验 5 — 调试诊所：四个有问题的训练脚本 {#lab5}

**目标。** 给你四个训练脚本，它们运行时不报错，但结果是错的。每一个都是在实验 4 的数据和网络上运行的健康脚本，只加了一个现实中常见的 bug。你只凭日志来诊断每一个，使用症状和[第 14 节](#s14)的检查清单，然后修复它，并确认日志恢复成健康日志的形状。其中一个 bug 在打印的第一个数里就能看出来；一个藏在看似良好的准确率背后；一个是不断增长的梯度；一个让评估本身变得不可靠。本实验使用 `load_digits`，其划分和标准化与实验 4 完全相同，不需要下载，CPU 约需十秒。

### 第 1 步：数据、共用的测试框架和健康的基线

每个脚本使用相同的数据、相同的模型和相同的测试框架（harness），并打印相同的字段：初始损失，然后每个轮次的平均训练损失、验证损失和准确率（由同一个共用的 `evaluate` 函数计算，它是正确的）、最后一步的全局梯度范数，以及第 1 层中死亡单元的比例。这样，一个 bug 就体现为两份形状相同的日志之间的差异。第一个代码块以紧凑的形式重复了实验 4 的数据准备（说明见[实验 4 第 1 步](#lab4)），并定义了模型和测试框架。测试框架把 bug 会改变的部分作为参数：损失如何计算、梯度是否清零、权重如何初始化，以及使用哪个模型。

基线是实验 4 的模型，用 Adam 在 $\eta = 10^{-3}$、batch 大小 64 下训练 20 个轮次，不做早停。它的日志就是健康训练的样子；在实验的其余部分请把它放在眼前。

```python
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

np.random.seed(0)
torch.manual_seed(0)

digits = load_digits()
X_train, X_rest, y_train, y_rest = train_test_split(
    digits.data, digits.target, test_size=0.4, stratify=digits.target, random_state=0)
X_val, X_test, y_val, y_test = train_test_split(
    X_rest, y_rest, test_size=0.5, stratify=y_rest, random_state=0)
mean, std = X_train.mean(axis=0), X_train.std(axis=0)
std = np.where(std == 0, 1.0, std)                # guard the constant pixels
Xtr, Xva = (torch.tensor((a - mean) / std, dtype=torch.float32) for a in (X_train, X_val))
ytr, yva = torch.tensor(y_train), torch.tensor(y_val)


def make_mlp():
    return nn.Sequential(nn.Linear(64, 128), nn.ReLU(), nn.Linear(128, 128), nn.ReLU(),
                         nn.Linear(128, 10))


def evaluate(model, X, y, batch=None):
    """Correct evaluation: eval mode, no gradients; loss and accuracy."""
    model.eval()
    with torch.no_grad():
        if batch is None:
            logits = model(X)
        else:
            logits = torch.cat([model(X[i:i + batch]) for i in range(0, len(X), batch)])
    model.train()
    return F.cross_entropy(logits, y).item(), (logits.argmax(1) == y).float().mean().item()


def dead_fraction(model):
    """Fraction of layer-1 units whose ReLU output is zero for every training image."""
    with torch.no_grad():
        was_training = model.training
        model.eval()
        first_layer = model[0]                    # the first nn.Linear
        h = torch.relu(first_layer(Xtr))
        model.train(was_training)
    return (h == 0).all(dim=0).float().mean().item()


def run(name, model, loss_fn=None, zero_grad=True, epochs=20, lr=1e-3, seed=0, log=(1, 5, 10, 20)):
    """Train with Adam; print one line per logged epoch. Returns the final validation accuracy."""
    loss_fn = loss_fn or (lambda logits, y: F.cross_entropy(logits, y))
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    g = torch.Generator().manual_seed(seed)
    with torch.no_grad():
        initial = loss_fn(model(Xtr), ytr).item()
    print(f"[{name}] initial loss {initial:.3f}")
    model.train()
    for epoch in range(1, epochs + 1):
        order = torch.randperm(len(Xtr), generator=g)
        total, grad_norm = 0.0, 0.0
        for start in range(0, len(Xtr), 64):
            idx = order[start:start + 64]
            loss = loss_fn(model(Xtr[idx]), ytr[idx])
            if zero_grad:
                opt.zero_grad()
            loss.backward()
            grad_norm = torch.sqrt(sum((p.grad ** 2).sum() for p in model.parameters())).item()
            opt.step()
            total += loss.item() * len(idx)
        if epoch in log:
            val_loss, val_acc = evaluate(model, Xva, yva)
            print(f"[{name}] epoch {epoch:2d}: train loss {total / len(Xtr):8.3f}  "
                  f"val loss {val_loss:8.3f}  val acc {val_acc:.3f}  "
                  f"grad norm {grad_norm:8.3f}  dead {dead_fraction(model):.3f}")
    return val_acc


torch.manual_seed(0)
baseline_acc = run("baseline", make_mlp())
```

```output
[baseline] initial loss 2.309
[baseline] epoch  1: train loss    2.083  val loss    1.766  val acc 0.763  grad norm    0.693  dead 0.000
[baseline] epoch  5: train loss    0.191  val loss    0.245  val acc 0.928  grad norm    0.559  dead 0.000
[baseline] epoch 10: train loss    0.049  val loss    0.150  val acc 0.964  grad norm    0.377  dead 0.000
[baseline] epoch 20: train loss    0.009  val loss    0.121  val acc 0.969  grad norm    0.064  dead 0.000
```

这就是参照标准。初始损失接近 $\ln 10$；训练损失从第一个轮次的约 2 下降到第 10 轮的几个百分点；验证准确率攀升到约 0.97；梯度范数随着损失下降而稳步下降；没有单元死亡。下面的每个 bug 都是对这五个事实之一的偏离。

### 第 2 步：脚本 A，降不到 1.46 以下的损失

第一个脚本看起来人畜无害。它只改了一行：损失被计算为 `F.cross_entropy(F.softmax(logits, 1), y)`。作者想要概率，于是套了一个 softmax，却忘了 `cross_entropy` 自己已经应用了一个。先运行它，读日志，再读解释。

```python
torch.manual_seed(0)
acc_a = run("A", make_mlp(), loss_fn=lambda logits, y: F.cross_entropy(F.softmax(logits, 1), y))
```

```output
[A] initial loss 2.303
[A] epoch  1: train loss    2.274  val loss    1.755  val acc 0.708  grad norm    0.132  dead 0.000
[A] epoch  5: train loss    1.611  val loss    0.542  val acc 0.836  grad norm    0.189  dead 0.000
[A] epoch 10: train loss    1.491  val loss    0.166  val acc 0.955  grad norm    0.151  dead 0.000
[A] epoch 20: train loss    1.469  val loss    0.151  val acc 0.967  grad norm    0.031  dead 0.000
```

准确率没问题，损失却不对：它停在 1.47 附近，刚好高于下面推导的下限，而梯度范数比基线小两到五倍。这两个事实有同一个原因。softmax 的输出 $\hat p$ 位于 $[0, 1]$ 之内，而 `cross_entropy` 把它当作 logits，于是对一组最多只相差 1 的值又计算了一次 softmax。即使是完美且完全自信的预测 $\hat p = (1, 0, \ldots, 0)$，损失也是
$$-\ln\frac{e^{1}}{e^{1} + 9 e^{0}} = \ln\frac{e + 9}{e} = 1.461,$$
这就是训练损失所逼近的下限。准确率不受影响，因为 softmax 的 arg-max 就是其输入的 arg-max，所以分类器仍然在学习。梯度被削弱，是因为损失曲面在 logits 方向上几乎是平的：第二个 softmax 至多只能让自信的预测与不自信的预测相差一个 $e$ 倍。教训是：准确率可能掩盖一个损失值所无法掩盖的 bug，而损失下限有一个值得算一算的算术解释。修复方法是传入 logits。

```python
print(f"floor of the loss for a perfect prediction: {np.log((np.e + 9) / np.e):.3f}")
torch.manual_seed(0)
acc_a_fixed = run("A fixed", make_mlp())
```

```output
floor of the loss for a perfect prediction: 1.461
[A fixed] initial loss 2.309
[A fixed] epoch  1: train loss    2.083  val loss    1.766  val acc 0.763  grad norm    0.693  dead 0.000
[A fixed] epoch  5: train loss    0.191  val loss    0.245  val acc 0.928  grad norm    0.559  dead 0.000
[A fixed] epoch 10: train loss    0.049  val loss    0.150  val acc 0.964  grad norm    0.377  dead 0.000
[A fixed] epoch 20: train loss    0.009  val loss    0.121  val acc 0.969  grad norm    0.064  dead 0.000
```

### 第 3 步：脚本 B，不断累积的梯度

第二个脚本漏掉了一行：`opt.zero_grad()`。PyTorch 按设计会把梯度累加到 `.grad` 中（原因是要支持跨多个 mini-batch 的梯度累积），所以不重置的话，每一步使用的都是自训练开始以来所有梯度之和。运行之前，先预测会有什么症状。

```python
torch.manual_seed(0)
acc_b = run("B", make_mlp(), zero_grad=False)
```

```output
[B] initial loss 2.309
[B] epoch  1: train loss    2.060  val loss    1.688  val acc 0.752  grad norm    6.983  dead 0.000
[B] epoch  5: train loss    0.326  val loss    0.955  val acc 0.883  grad norm   23.178  dead 0.000
[B] epoch 10: train loss    1.806  val loss    4.092  val acc 0.833  grad norm  146.211  dead 0.000
[B] epoch 20: train loss    1.552  val loss    1.455  val acc 0.799  grad norm  194.745  dead 0.000
```

损失起初会下降，因为早期累积的梯度仍然指向下坡方向；随后它上升并来回游走：更新变成了对数百个过去梯度的求和，其中大多数已经过时，其行为就像系数为 1 且没有任何阻尼的动量。破绽在于打印出的梯度范数。它本应随损失下降而下降，实际却逐轮增长，因为 `.grad` 是一个滚动累加的和。验证准确率先达到峰值，然后衰减。在本应下降的损失旁边出现不断上升的梯度范数，是这个 bug 最直接的特征（[第 4 节](#s4)）。修复只需一行：每一步都在 `loss.backward()` 之前调用 `opt.zero_grad()`。

```python
torch.manual_seed(0)
acc_b_fixed = run("B fixed", make_mlp())
```

```output
[B fixed] initial loss 2.309
[B fixed] epoch  1: train loss    2.083  val loss    1.766  val acc 0.763  grad norm    0.693  dead 0.000
[B fixed] epoch  5: train loss    0.191  val loss    0.245  val acc 0.928  grad norm    0.559  dead 0.000
[B fixed] epoch 10: train loss    0.049  val loss    0.150  val acc 0.964  grad norm    0.377  dead 0.000
[B fixed] epoch 20: train loss    0.009  val loss    0.121  val acc 0.969  grad norm    0.064  dead 0.000
```

### 第 4 步：脚本 C，677 的初始损失

在第三个脚本中，每个线性层都用 `nn.init.normal_(w)` 初始化，它从 $\mathcal{N}(0, 1)$ 中抽样。作者想要的是“随机权重”，没有考虑它们的尺度。测试框架打印的第一个数就已经定了它的罪。

```python
def make_bad_init_mlp():
    model = make_mlp()
    for m in model:
        if isinstance(m, nn.Linear):
            nn.init.normal_(m.weight)             # standard deviation 1, not 1/sqrt(fan_in)
    return model


torch.manual_seed(0)
acc_c = run("C", make_bad_init_mlp())
```

```output
[C] initial loss 676.599
[C] epoch  1: train loss  576.259  val loss  478.250  val acc 0.217  grad norm  207.911  dead 0.000
[C] epoch  5: train loss  136.451  val loss  132.021  val acc 0.557  grad norm  184.543  dead 0.000
[C] epoch 10: train loss   43.317  val loss   66.271  val acc 0.710  grad norm   97.042  dead 0.000
[C] epoch 20: train loss    8.583  val loss   44.075  val acc 0.797  grad norm   34.758  dead 0.000
```

初始损失高达几百，而一个合理的网络给出的是约 2.3。原因在[第 6 节](#s6)：每一层把信号的标准差乘以约 $\sqrt{n_{\text{in}}\, \sigma_w^2}$，对 $\sigma_w = 1$ 和 128 个输入来说，每层约为 11（ReLU 的情况略小一些）。三层之后，logits 的量级达到几百，softmax 饱和，网络对几乎每个样本都自信地做出错误预测，损失等于最大 logit 与正确类别 logit 之间的差距。训练恢复得很慢，因为 Adam 会重新缩放步长，但 20 个轮次之后，验证损失仍然很大，准确率远低于基线。这个错误在第一次更新之前、只需一次前向传播就能看出来，这就是检查清单的第 4 项是“检查初始损失”的原因。修复方法是删掉自定义初始化（PyTorch 的默认值是方差为 $1/(3 n_{\text{in}})$ 的缩放均匀分布），或者使用偏置为零的 He 初始化（它的起点会略高，接近 2.9，因为最后一层也是按 ReLU 缩放的）。

```python
torch.manual_seed(1)                              # a different draw from the baseline's
acc_c_fixed = run("C fixed", make_mlp())              # PyTorch's default initialisation
```

```output
[C fixed] initial loss 2.318
[C fixed] epoch  1: train loss    2.119  val loss    1.826  val acc 0.794  grad norm    0.675  dead 0.000
[C fixed] epoch  5: train loss    0.197  val loss    0.244  val acc 0.933  grad norm    0.478  dead 0.000
[C fixed] epoch 10: train loss    0.054  val loss    0.148  val acc 0.964  grad norm    0.350  dead 0.000
[C fixed] epoch 20: train loss    0.009  val loss    0.115  val acc 0.972  grad norm    0.090  dead 0.000
```

### 第 5 步：脚本 D，不可重复的评估

第四个脚本是另一类 bug。训练是正确的。模型包含 `BatchNorm1d` 和 `Dropout(0.5)`，而评估函数从未调用 `model.eval()`，所以在给模型打分时，dropout 掩码和 batch 统计量都是开启的。症状完全不在损失曲线上，而在评估中：同样的权重评估两次，得到不同的答案，而且答案取决于 batch 大小。这个代码块先训练模型，然后用四种方式评估它：在训练模式下对完整验证集评估两次，在训练模式下以 8 为 batch 大小分批评估，以及在评估模式下评估。

```python
def make_dropout_bn_mlp():
    return nn.Sequential(nn.Linear(64, 128), nn.BatchNorm1d(128), nn.ReLU(), nn.Dropout(0.5),
                         nn.Linear(128, 128), nn.BatchNorm1d(128), nn.ReLU(), nn.Dropout(0.5),
                         nn.Linear(128, 10))


def evaluate_wrong(model, X, y, batch=None):
    """BUG: no model.eval(); dropout and batch statistics stay active."""
    model.train()
    with torch.no_grad():
        if batch is None:
            logits = model(X)
        else:
            logits = torch.cat([model(X[i:i + batch]) for i in range(0, len(X), batch)])
    return (logits.argmax(1) == y).float().mean().item()


torch.manual_seed(0)
model_d = make_dropout_bn_mlp()
run("D", model_d, log=(20,))
print(f"wrong evaluation, full set, first call:   {evaluate_wrong(model_d, Xva, yva):.3f}")
print(f"wrong evaluation, full set, second call:  {evaluate_wrong(model_d, Xva, yva):.3f}")
print(f"wrong evaluation, batches of 8:           {evaluate_wrong(model_d, Xva, yva, 8):.3f}")
print(f"evaluation with model.eval():             {evaluate(model_d, Xva, yva)[1]:.3f}")
print(f"evaluation with model.eval(), batches of 8: {evaluate(model_d, Xva, yva, 8)[1]:.3f}")
```

```output
[D] initial loss 2.437
[D] epoch 20: train loss    0.176  val loss    0.128  val acc 0.967  grad norm    1.426  dead 0.000
wrong evaluation, full set, first call:   0.942
wrong evaluation, full set, second call:  0.936
wrong evaluation, batches of 8:           0.855
evaluation with model.eval():             0.969
evaluation with model.eval(), batches of 8: 0.969
```

训练模式下的评估有两处错误。Dropout 在每次调用时都会随机置零一半隐藏单元，所以对同样数据的两次调用结果不一致：这样的评估是一次带噪声的采样，而被采样得到的指标无法在不同运行之间比较。批归一化用当前 batch 计算统计量，所以在 batch 大小为 8 时估计很差，结果取决于验证集恰好是怎样分批的。在评估模式下，dropout 是恒等映射（训练时已应用了反向缩放，[第 11 节](#s11)），批归一化使用滑动平均，所以答案是确定的，也与 batch 大小无关。注意，测试框架自带的 `evaluate` 是正确的，这就是脚本 D 本身的训练日志看起来合理的原因。修复方法是在评估函数内部使用 `model.eval()` 和 `torch.no_grad()`，并在下一个轮次之前再次调用 `model.train()`，共用的函数就是这样做的。

### 第 6 步：每个诊断一句话，以及检查清单

诊断只有短到可以写下来才有用：*症状 → 原因 → 修复*。这个代码块汇总了这四个诊断，以及修复后的脚本所达到的准确率，让你确认每份修复后的日志都具有基线的形状。然后，它在未训练的基线、脚本 C 和修复后的模型上，运行[第 14 节](#s14)检查清单中只需一次前向传播的两项，即输出形状和初始损失（第 3 项和第 4 项），以展示初始损失检查如何在第 0 步就拦下脚本 C：如果初始损失与 $\ln K$ 相差超过 10%，其他任何东西都不值得再运行。

```python
diagnoses = [
    ("A", "loss floors at 1.46, grad norm small, accuracy fine",
     "softmax applied before cross_entropy", "pass the logits"),
    ("B", "grad norm grows each epoch, loss rises, accuracy decays",
     "no opt.zero_grad(): gradients accumulate", "zero the gradients every step"),
    ("C", "initial loss in the hundreds",
     "weights drawn from N(0, 1): logits of order 100", "default or He initialisation"),
    ("D", "repeated evaluations differ, depend on batch size",
     "evaluating in training mode (dropout, batch statistics)", "model.eval() + no_grad()"),
]
for tag, symptom, cause, fix in diagnoses:
    print(f"{tag}: {symptom}\n   -> {cause}\n   -> fix: {fix}")

print()
print(f"baseline {baseline_acc:.3f} | A fixed {acc_a_fixed:.3f} | B fixed {acc_b_fixed:.3f} "
      f"| C fixed {acc_c_fixed:.3f}")


def pre_training_checklist(model, name, n_classes=10):
    """Items 3 and 4 of the checklist: the output shape and the initial loss."""
    with torch.no_grad():
        logits = model(Xtr[:64])
    assert logits.shape == (64, n_classes), f"shape {tuple(logits.shape)}"
    initial = F.cross_entropy(logits, ytr[:64]).item()
    expected = np.log(n_classes)
    verdict = "OK" if abs(initial - expected) < 0.1 * expected else "STOP: investigate before training"
    print(f"{name:10s} initial loss {initial:9.3f} (expected about {expected:.3f}) -> {verdict}")


torch.manual_seed(0)
pre_training_checklist(make_mlp(), "baseline")
torch.manual_seed(0)
pre_training_checklist(make_bad_init_mlp(), "script C")
torch.manual_seed(1)
pre_training_checklist(make_mlp(), "C, fixed")
```

```output
A: loss floors at 1.46, grad norm small, accuracy fine
   -> softmax applied before cross_entropy
   -> fix: pass the logits
B: grad norm grows each epoch, loss rises, accuracy decays
   -> no opt.zero_grad(): gradients accumulate
   -> fix: zero the gradients every step
C: initial loss in the hundreds
   -> weights drawn from N(0, 1): logits of order 100
   -> fix: default or He initialisation
D: repeated evaluations differ, depend on batch size
   -> evaluating in training mode (dropout, batch statistics)
   -> fix: model.eval() + no_grad()

baseline 0.969 | A fixed 0.969 | B fixed 0.969 | C fixed 0.972
baseline   initial loss     2.303 (expected about 2.303) -> OK
script C   initial loss   616.959 (expected about 2.303) -> STOP: investigate before training
C, fixed   initial loss     2.293 (expected about 2.303) -> OK
```

脚本 C 在第 0 步就被一个只花一次前向传播的检查拦下了；另外三个则不会。脚本 A 能通过初始损失检查，因为对近似均匀的输出再做一次 softmax 仍然近似均匀；脚本 B 也能通过，因为在第二步之前一切正常。它们要靠训练日志才能发现：一个下限，一个增长的梯度范数。D 要靠评估两次才能发现。没有哪一项检查能发现所有 bug，这就是检查清单有十项的原因。

### 你应该看到什么

- 四个脚本都不报错。每一个都有一个在第一分钟内就能读出的数值特征：1.46 的下限、不断增长的梯度范数、荒谬的初始损失、无法重复的评估。
- 仅看准确率可能掩盖 bug：脚本 A 的验证准确率接近基线，而它的训练损失毫无意义。
- 记录初始损失和梯度范数各只需一行，却能诊断出四个 bug 中的两个（C 和 B）；D 要靠评估两次发现，A 则靠 1.46 的损失下限发现。
- 修复之后，每份日志都具有基线的形状：损失下降，梯度范数下降，验证准确率接近 0.97。

### 动手试试

1. 脚本 E：Adam 取 $\eta = 0.1$。预测症状（训练损失升到初始值之上），并按照[实验 3](#lab3) 的方式，用学习率范围测试来诊断它。
2. 脚本 F：在 PyTorch 中写一个[实验 1](#lab1) 的 $y = \sin 3x$ 回归版本，目标的形状为 `(B,)`，预测的形状为 `(B, 1)`。找出 PyTorch 的广播警告，以及停在目标方差处的损失，然后修正形状（[第 2 节](#s2)）。
3. 脚本 G：在全部 1,797 张图像上而不是只在训练集上计算标准化统计量。测量测试准确率变化了多少，并解释为什么这类泄漏在这里很小，而在别处可能很大（[模块 01 第 10 节](module_01_ZH.html#s10)）。
4. 自己写一个 bug，把脚本和只含日志的输出交给一位同事，看诊断要花多长时间。
