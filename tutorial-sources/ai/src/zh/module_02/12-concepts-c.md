## 归一化层 {#s10}

[第 6 节](#s6)选取初始权重，使预激活在起点具有合理的尺度。但这只在第 0 步成立。训练会改变权重，一旦预激活的均值或离散程度漂移得很大，对应的单元就会进入饱和区或死亡区。**归一化层**（normalisation layer）在网络内部的每一步都对激活重新做标准化。常用的变体有三种，区别在于均值和离散程度是对哪些数取的（图 2.15）。

::: figure id=fig-02-15
同一个 $B\times d$ 激活矩阵画了两次，都是 6 行 8 列的网格，行标为“样本”，列标为“特征”。左图：高亮一列，说明为“批归一化：对特征 $j$ 的 $B$ 个样本取 $\mu_j$、$\sigma_j$；评估时使用滑动平均”。右图：高亮一行，说明为“层归一化 / RMSNorm：对单个样本的 $d$ 个特征取统计量；训练和评估时相同”，RMSNorm 下方注明“不减均值”。
:::

### 批归一化

**批归一化**（batch normalisation，Ioffe 和 Szegedy 2015）对每个特征在 mini-batch 上做标准化。设一个 batch 的预激活为 $\mathbf{Z} \in \mathbb{R}^{B\times d}$，考虑其中一个特征 $j$，

$$
\begin{aligned}
\mu_{\mathcal{B}} &= \frac{1}{B}\sum_{i=1}^{B} z_{ij}, &
\sigma^2_{\mathcal{B}} &= \frac{1}{B}\sum_{i=1}^{B}\big(z_{ij} - \mu_{\mathcal{B}}\big)^2, \\
\hat z_{ij} &= \frac{z_{ij} - \mu_{\mathcal{B}}}{\sqrt{\sigma^2_{\mathcal{B}} + \epsilon}}, &
y_{ij} &= \gamma_j\,\hat z_{ij} + \beta_j .
\end{aligned}
$$

在整个 batch 上，$\hat{\mathbf{Z}}$ 的每个特征均值为 0，方差略小于 1。可学习的**增益**（gain）$\gamma_j$（初始化为 1）和**偏移**（shift）$\beta_j$（初始化为 0）把标准化拿走的自由度还给网络：取 $\gamma_j = \sqrt{\sigma^2_{\mathcal{B}} + \epsilon}$、$\beta_j = \mu_{\mathcal{B}}$ 时，该层原样返回输入，所以插入它不会去掉网络本来能表示的任何函数。常数 $\epsilon$ 通常取 $10^{-5}$，保证除法有限。

由于减去了均值，加在某个特征上的常数会从 $\hat z$ 中消失。因此，批归一化前一层的偏置是冗余的，其作用由 $\beta$ 接替；这正是[第 3 模块](module_03_ZH.html#s10)在每个批归一化之前都写 `bias=False` 的原因。

**训练与评估。** 在训练模式下，该层使用当前 batch 的统计量，同时更新滑动平均，

$$
\mu_{\text{run}} \leftarrow (1 - m)\,\mu_{\text{run}} + m\,\mu_{\mathcal{B}}, \qquad
\sigma^2_{\text{run}} \leftarrow (1 - m)\,\sigma^2_{\text{run}} + m\,\frac{B}{B - 1}\,\sigma^2_{\mathcal{B}} .
$$

在 PyTorch 中，滑动方差使用的是无偏的 batch 方差，如上式所写；`momentum=0.1` 就是 $m$，即*新*值的权重，与优化器中动量的约定相反。在评估模式（`model.eval()`）下，该层使用 $\mu_{\text{run}}$ 和 $\sigma^2_{\text{run}}$，因此单个样本的输出不再依赖同一 batch 中的其他样本。忘记调用 `model.eval()` 是经典的错误（[实验 5](#lab5)）。在训练早期就评判模型也是如此，因为这时滑动平均还跟不上快速变化的权重。

::: worked title="同一特征在两种模式下的批归一化"
一个特征，batch 大小为 4，$\mathbf{z} = (2, 4, 6, 8)$，$\gamma = 1$，$\beta = 0$。

- $\mu_{\mathcal{B}} = 20/4 = 5$；偏差为 $(-3, -1, 1, 3)$；$\sigma^2_{\mathcal{B}} = (9 + 1 + 1 + 9)/4 = 5$。
- 训练模式的输出：偏差除以 $\sqrt{5} = 2.236$，得到
  $(-1.342, -0.447, 0.447, 1.342)$。
- 滑动统计量，从 $(0, 1)$ 出发，$m = 0.1$：均值变为
  $0.9\cdot 0 + 0.1\cdot 5 = 0.5$；无偏方差为 $20/3 = 6.667$，所以方差变为
  $0.9\cdot 1 + 0.1\cdot 6.667 = 1.567$。
- 输入 6 在训练模式下被归一化为 0.447，而在评估模式下为
  $(6 - 0.5)/\sqrt{1.567} = 5.5/1.252 = 4.394$。

一步之后，滑动统计量与数据的统计量相差很远，评估输出是训练输出的十倍。`torch.nn.BatchNorm1d` 会给出这四个数：
:::

```python
import torch, torch.nn as nn

bn = nn.BatchNorm1d(1)                           # gamma = 1, beta = 0, momentum = 0.1
z = torch.tensor([[2.0], [4.0], [6.0], [8.0]])   # one feature, a batch of four
y = bn(z)                                        # training mode: batch statistics
print("train out:", [f"{v:.3f}" for v in y.detach().ravel().tolist()])
print(f"running mean {bn.running_mean.item():.3f}, var {bn.running_var.item():.3f}")
bn.eval()                                        # evaluation mode: running statistics
print(f"eval out for 6: {bn(torch.tensor([[6.0]])).item():.3f}")
```

```output
train out: ['-1.342', '-0.447', '0.447', '1.342']
running mean 0.500, var 1.567
eval out for 6: 4.394
```

在 batch 上做归一化有四个后果。其一，样本在训练中的输出依赖同一 batch 的其他样本，这会带来噪声（一种温和的正则化），也会引出上面那些错误。其二，小 batch 的统计量噪声大；每个 batch 少于 16 个样本时，应改用组归一化或层归一化（[第 3 模块](module_03_ZH.html#s10)）。其三，长度不一的序列与之不相配，因为填充会污染统计量。其四，batch 大小为 1 时，每个特征的方差都为零；在训练模式下，PyTorch 会拒绝这种输入，并报错 `Expected more than 1 value per channel when training`。

::: worked title="方差为零的特征"
如果 batch 中每个样本在特征 $j$ 上的取值都是 $c$，那么 $\mu_{\mathcal{B}} = c$，$\sigma^2_{\mathcal{B}} = 0$，对每个 $i$ 都有 $\hat z_{ij} = 0/\sqrt{\epsilon} = 0$：该层恰好输出 $\beta_j$，借助 $\epsilon$ 它是有限的，却不携带任何信息。可以对比[实验 4](#lab4) 中始终为零的像素：那里的输入标准化没有 $\epsilon$，如果不处理零标准差，就会产生 NaN。
:::

### 为什么有效

原论文把批归一化的作用归因于减少“内部协变量偏移”（internal covariate shift），即每一层输入分布的漂移。Santurkar 等人（2018）质疑了这种解释：即使用噪声在每个批归一化之后重新制造漂移，网络依然训练得很好；他们测得的收益主要是损失曲面更平滑、条件更好，因而能容忍更大的学习率。

有一个精确的事实，解释了批归一化与优化器的大部分相互作用。设权重 $\mathbf{W}$ 的输出送入一个批归一化。把权重缩放 $c > 0$ 倍，$\mathbf{z}$、$\mu_{\mathcal{B}}$ 和 $\sigma_{\mathcal{B}}$ 都缩放 $c$ 倍，于是 $\hat z$ 不变（忽略 $\epsilon$），$\mathcal{L}(c\mathbf{W}) = \mathcal{L}(\mathbf{W})$。两边对 $\mathbf{W}$ 求导，

$$
c\,\nabla\mathcal{L}(c\mathbf{W}) = \nabla\mathcal{L}(\mathbf{W})
\quad\Longrightarrow\quad
\nabla\mathcal{L}(c\mathbf{W}) = \frac{1}{c}\,\nabla\mathcal{L}(\mathbf{W}).
$$

权重越大，得到的梯度按比例越小，所以一步梯度更新的相对变化 $\eta\|\nabla\mathcal{L}\|/\|\mathbf{W}\|$ 按 $\eta/\|\mathbf{W}\|^2$ 变化：有效学习率取决于权重的范数。再对 $\mathcal{L}(c\mathbf{W})$ 在 $c = 1$ 处对 $c$ 求导，还得到 $\langle\mathbf{W}, \nabla\mathcal{L}\rangle = 0$：梯度与 $\mathbf{W}$ 正交，所以朴素的梯度步会使 $\|\mathbf{W}\|$ 缓慢增大，有效学习率随之下降。对这类权重做权重衰减无法限制函数本身，因为函数与 $\|\mathbf{W}\|$ 无关；它的主要作用是让范数保持较小，从而使有效学习率保持较高。

### 层归一化与 RMSNorm

**层归一化**（layer normalisation，Ba、Kiros 和 Hinton 2016）改为对单个样本的 $d$ 个特征取统计量：

$$
\mu = \frac{1}{d}\sum_{j=1}^{d} z_j, \qquad
\sigma^2 = \frac{1}{d}\sum_{j=1}^{d}(z_j - \mu)^2, \qquad
\mathbf{y} = \boldsymbol{\gamma}\odot\frac{\mathbf{z} - \mu}{\sqrt{\sigma^2 + \epsilon}} + \boldsymbol{\beta}.
$$

它在训练和评估时完全一致，也与 batch 无关，所以批归一化的那四个后果都不会出现。循环神经网络和 Transformer 使用它。

**均方根归一化**（RMSNorm，Zhang 和 Sennrich 2019）去掉了减均值和偏移，改为除以均方根：

$$
\mathbf{y} = \boldsymbol{\gamma}\odot\frac{\mathbf{z}}{\sqrt{\operatorname{mean}(\mathbf{z}^2) + \epsilon}} .
$$

它只需一次归约而不是两次，实际效果一样好，截至 2026 年大多数大语言模型都采用它；[第 6 模块](module_06_ZH.html#s5)说明它在模块中的位置（前置归一化与后置归一化之比较）。PyTorch 提供 `nn.BatchNorm1d`、`nn.LayerNorm`，以及自 2.4 版起的 `nn.RMSNorm`。

::: worked title="手算层归一化和 RMSNorm"
$\mathbf{z} = (1, 2, 3, 6)$，$\boldsymbol{\gamma} = \mathbf{1}$，$\boldsymbol{\beta} = \mathbf{0}$，
$\epsilon = 0$。

- 层归一化：均值 $12/4 = 3$；偏差 $(-2, -1, 0, 3)$；方差 $(4 + 1 + 0 + 9)/4 = 3.5$；
  标准差 $1.871$；输出 $(-1.069, -0.535, 0, 1.604)$，均值为 0，方差为 1。
- RMSNorm：均方 $(1 + 4 + 9 + 36)/4 = 12.5$；RMS 为 $\sqrt{12.5} = 3.536$；输出
  $(0.283, 0.566, 0.849, 1.697)$。

RMSNorm 的输出 RMS 恰为 1，但均值是 0.849：它只做了缩放，没有中心化。这两个输出就是 `nn.LayerNorm(4, eps=0, elementwise_affine=False)` 和 `nn.RMSNorm(4, eps=0)` 的返回值。
:::

### 归一化的反向传播

归一化改变了梯度能做的事。取层归一化，$\boldsymbol{\gamma} = \mathbf{1}$，
$\boldsymbol{\beta} = \mathbf{0}$，忽略 $\epsilon$，于是 $\hat z_k = (z_k - \mu)/\sigma$，并记 $\bar{\mathbf{g}} = \partial\mathcal{L}/\partial\mathbf{y}$。各个部分如下：

- $\partial\mu/\partial z_j = 1/d$。
- $\partial\sigma^2/\partial z_j = \frac{2}{d}\sum_k (z_k - \mu)\big([k = j] - \tfrac{1}{d}\big) = \frac{2}{d}(z_j - \mu)$，
  因为各偏差之和为零；所以 $\partial\sigma/\partial z_j = (z_j - \mu)/(d\sigma) = \hat z_j/d$。
- 由商的求导法则，
  $\dfrac{\partial\hat z_k}{\partial z_j} = \dfrac{[k = j] - 1/d}{\sigma} - \dfrac{z_k - \mu}{\sigma^2}\,\dfrac{\hat z_j}{d} = \dfrac{1}{\sigma}\Big([k = j] - \dfrac{1}{d} - \dfrac{\hat z_k\hat z_j}{d}\Big)$。
- 与 $\bar g_k$ 相乘并求和：

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{z}} = \frac{1}{\sigma}\Big(\bar{\mathbf{g}} - \operatorname{mean}(\bar{\mathbf{g}}) - \hat{\mathbf{z}}\,\operatorname{mean}(\bar{\mathbf{g}}\odot\hat{\mathbf{z}})\Big).
$$

由于 $\sum_j\hat z_j = 0$ 且 $\sum_j\hat z_j^2 = d$，这个梯度的各分量之和为零，并且与 $\hat{\mathbf{z}}$ 正交。经过归一化之后，下面的各层无法改变它们向上传递的内容的均值或尺度，只能改变其模式；尺度和偏移由 $\boldsymbol{\gamma}$ 和 $\boldsymbol{\beta}$ 决定。批归一化的反向传播是同一个公式，只是均值改为在 batch 上而不是在特征上取。

::: keyidea
归一化层对激活做标准化，范围是整个 batch（批归一化）或单个样本的各个特征（层归一化、RMSNorm），然后让可学习的增益和偏移恢复任意尺度；只有批归一化在训练和评估时表现不同。
:::

::: check
一个使用批归一化的模型，对同一个输入给出的预测会随 batch 中的其他样本而变。忘了什么？
:::

::: answer
`model.eval()`。在训练模式下，批归一化用当前 batch 的均值和方差做归一化，所以每个样本的输出依赖同一 batch 的其他样本；在评估模式下，它使用固定的滑动平均。
:::

::: check
计算 $(3, 4)$ 的 RMSNorm，$\gamma = 1$，$\epsilon = 0$。
:::

::: answer
均方为 $(9 + 16)/2 = 12.5$，RMS 为 $\sqrt{12.5} = 3.536$，所以输出为
$(3/3.536, 4/3.536) = (0.849, 1.131)$。
:::

::: check
为什么批归一化前面的线性层可以去掉偏置？
:::

::: answer
减均值会消去加在特征上的任何常数，所以偏置对输出没有影响，偏移由 $\beta$ 提供。
:::

## 网络的正则化 {#s11}

[第 1 模块第 9 节](module_01_ZH.html#s9)把正则化看作用方差换偏差，其强度在验证集上调节。网络让这幅图景变得更复杂。它们通常是过参数化的（[实验 4](#lab4) 用 26,122 个参数拟合 1,078 张训练图像），却依然能泛化，一部分靠 SGD 噪声的隐式正则化（[第 1 模块第 4 节](module_01_ZH.html#s4)），一部分靠下面这些显式方法。

### 权重衰减

权重衰减就是第 1 模块的 $L_2$ 惩罚，通过 AdamW 实现，使每个权重每步都按相同的比例收缩，而不论其梯度历史如何（[第 8 节](#s8)）。$\lambda$ 的典型取值从 $10^{-4}$ 到 $10^{-1}$，取决于优化器及其约定。偏置和归一化增益不做衰减；对于输出送入归一化层的权重，衰减的主要作用是提高有效学习率（[第 10 节](#s10)）。

### 随机失活

**随机失活**（dropout，Srivastava 等 2014）在训练时破坏隐藏单元。每个单元乘以一个独立的掩码 $m_i \sim \text{Bernoulli}(1 - p)$，它以概率 $p$ 取 0，存活的单元再放大 $1/(1 - p)$ 倍，这就是**反向**（inverted）形式：

$$
\tilde h_i = \frac{m_i}{1 - p}\,h_i .
$$

评估时不丢弃也不缩放。正是这个缩放使两种模式一致。对掩码取期望，

$$
\mathbb{E}[\tilde h_i] = (1 - p)\cdot\frac{h_i}{1 - p} + p\cdot 0 = h_i,
$$

所以下一层在两种模式下看到的期望输入相同。至于方差，
$\mathbb{E}[\tilde h_i^2] = (1 - p)\,h_i^2/(1 - p)^2 = h_i^2/(1 - p)$，因此

$$
\operatorname{Var}(\tilde h_i) = \frac{h_i^2}{1 - p} - h_i^2 = h_i^2\,\frac{p}{1 - p}:
$$

这是乘性噪声，大小与单元自身的大小成正比，相对方差在 $p = 0.5$ 时为 1，在 $p = 0.1$ 时为 0.11。最初的表述是在测试时把权重乘以 $1 - p$；框架实现的是反向形式，这样评估时完全不需要改动。

::: worked title="四个单元上的反向 dropout"
$p = 0.5$，$\mathbf{h} = (2.0, 0.5, 1.0, 3.0)$，掩码为 $(1, 0, 1, 0)$。存活的单元放大 $1/(1 - 0.5) = 2$ 倍：$\tilde{\mathbf{h}} = (4.0, 0, 2.0, 0)$。每个单元在 16 种掩码中的一半里存活，并被加倍，所以对所有掩码取平均后 $\tilde{\mathbf{h}} = \mathbf{h}$。若 $p = 0.1$，存活单元放大 $1/0.9 = 1.111$ 倍。
:::

它为什么有效：没有哪个单元可以依赖，因为任何一个都可能缺席。等价地说，训练是在一个 $n$ 单元层的 $2^n$ 个共享权重的“瘦身”网络中采样，评估则近似它们的集成：对于接 softmax 的单层，是精确的，等于它们预测的重新归一化的几何平均（Hinton 等 2012）；对更深的网络则是近似的。测试时保持 dropout 开启并对多次前向取平均，可以得到廉价的不确定性估计，即 **Monte Carlo dropout**（Gal 和 Ghahramani 2016）。

典型的 $p$：旧式 MLP 和 AlexNet 的全连接层中最高到 0.5；Transformer 中为 0.1。截至 2026 年，许多大语言模型的预训练不使用它，因为每个 token 大约只被看到一次（[第 8 模块](module_08_ZH.html)）。

### 早停

**早停**（early stopping）每个轮次（epoch）评估一次验证损失，保留验证损失最低的检查点，并在连续若干个轮次没有改进（即**耐心值** patience）之后停止；随后恢复最佳权重。[第 1 模块](module_01_ZH.html#s9)说明了它为什么起正则化作用：从零出发做 $t$ 步梯度下降，二次函数的第 $i$ 个特征方向停在
$\big[1 - (1 - \eta\lambda_i)^t\big]\theta^*_i$，接近岭回归的
$\lambda_i/(\lambda_i + \tau)\cdot\theta^*_i$，其中 $\tau \approx 1/(\eta t)$，$\tau$ 是惩罚项 $(\tau/2)\|\theta\|^2$ 的系数（Goodfellow 等 2016，§7.8）：这近似于强度由训练时间决定的 $L_2$ 正则化。对网络而言，新的是流程：检查点、耐心值，以及恢复最佳权重。

::: worked title="早停的数值例子"
取 $\eta = 0.01$、$t = 1{,}000$ 步，等效的岭强度约为
$\tau \approx 1/(0.01\cdot 1{,}000) = 0.1$；训练时间延长十倍，它就除以十。
[实验 4](#lab4) 在手写数字上测量了这一流程：验证损失在第 34 个轮次最低（0.1159），而训练损失继续下降，直到 0.002；耐心值为 15 时，训练在第 49 个轮次停止，并恢复第 34 个轮次的权重（图 2.16，右）。
:::

::: figure id=fig-02-16
左：训练期间一个含四个单元的隐藏层，$p = 0.5$，两个单元被划掉，两个存活单元标注“×2”；旁边是评估时的同一层，四个单元都在，且不做缩放。右：实验 4 那次运行的训练损失和验证损失随轮次的变化，训练损失降到 0.002，验证损失在 0.116 附近趋平，标出最佳轮次（34），并用阴影标出耐心窗口（第 35–49 轮）。
:::

### 校准与温度缩放

[第 1 模块第 7 节](module_01_ZH.html#s7)度量了校准，并把网络的情形推迟到本模块。用交叉熵长时间训练的网络往往**过度自信**：它们的最高概率超过其准确率。标签平滑（见下）在训练时起作用，可能矫枉过正，变成自信不足。**温度缩放**（temperature scaling，Guo 等 2017）把 logits 除以一个标量 $T > 0$，$\hat{\mathbf{p}} = \softmax(\mathbf{z}/T)$，$T$ 在验证集上通过最小化负对数似然来拟合。除以一个正常数不改变 logits 的顺序，所以 argmax 和准确率不受影响；$T > 1$ 使过度自信的模型变得温和，$T < 1$ 使自信不足的模型变得尖锐。

::: worked title="实验 4 模型上的温度缩放"
实验 4 的网络（种子 0，第 34 个轮次的检查点），在 $[0.05, 5]$ 上以验证集 NLL 做网格搜索拟合 $T$：得到 $T = 1.27$，说明该模型轻微过度自信。测试集 NLL 从 0.148 降到 0.132，准确率保持 96.9%。期望校准误差（取最高标签形式，15 个等宽分箱，与第 1 模块相同）几乎没有变化，从 0.019 变为 0.018：在 360 张图像上，噪声太大，无法显示这样小的修正。

同一个网络用 0.1 的标签平滑训练（见下）则是*自信不足*：平均最高概率为 0.864，测试准确率 98.1%，校准误差 0.117。拟合得到的 $T = 0.49$ 使校准误差降到 0.015，测试 NLL 从 0.178 降到 0.061。每种设置只有一个种子：1.1 个百分点的准确率差异约为单次测试准确率 0.9 个百分点标准误的 1.2 倍（[第 14 节](#s14)），算不上发现。这些数字来自实验 4 的代码，并加入了其“试一试”第 2 项所述的校准扩展。
:::

[第 7 模块](module_07_ZH.html#s10)会回到语言模型的校准。

### 数据增强与输入噪声

数据增强是对训练数据做保持标签不变的变换。对图像来说，它是最有效的单一正则化手段（[第 3 模块](module_03_ZH.html#s10)）。对传感器数据或表格数据，可选的是输入噪声，以及标签确实对其不变的时间平移或缩放。用小的高斯输入噪声训练，到一阶近似等价于对输出关于输入的导数施加 Tikhonov 惩罚（Bishop 1995）。

### 标签平滑

**标签平滑**（label smoothing，Szegedy 等 2016）用软化的目标
$\mathbf{y}_{\text{LS}} = (1 - \alpha)\mathbf{y} + \alpha/K$ 来训练，真实类别得到
$1 - \alpha + \alpha/K$，其他每个类别得到 $\alpha/K$。交叉熵对 logits 的梯度保持[第 3 节](#s3)的形式，即 $\hat{\mathbf{p}} - \mathbf{y}_{\text{LS}}$。

这样做的原因在于硬标签的行为。在可分的训练数据上，对任何有限的 logit 间隔，$-\ln\hat p_y$ 都为正，只有间隔趋于无穷时才达到 0，所以梯度永不消失，logits 不断增大。使用平滑后的目标时，交叉熵 $-\sum_k y_{\text{LS},k}\ln\hat p_k$ 在 $\hat{\mathbf{p}} = \mathbf{y}_{\text{LS}}$ 处取最小，此处梯度为零；又因为对 softmax 有 $z_{\text{true}} - z_{\text{other}} = \ln(\hat p_{\text{true}}/\hat p_{\text{other}})$，最优间隔是有限的：

$$
z_{\text{true}} - z_{\text{other}} = \ln\frac{1 - \alpha + \alpha/K}{\alpha/K}.
$$

::: worked title="alpha = 0.1、十个类别的标签平滑"
目标：真实类别为 $0.9 + 0.01 = 0.91$，其他每个类别为 $0.1/10 = 0.01$。最优的 logit 间隔为 $\ln(0.91/0.01) = \ln 91 = 4.51$。

取一个很自信的预测，$\hat p_{\text{true}} = 0.999$，其他每个类别为 $0.001/9 = 0.000111$。用硬标签时 $\delta_{\text{true}} = 0.999 - 1 = -0.001$：梯度仍在把真实类别的 logit 往上推。用平滑时 $\delta_{\text{true}} = 0.999 - 0.91 = +0.089$，$\delta_{\text{other}} = 0.000111 - 0.01 = -0.0099$：梯度把预测拉回到 0.91 附近。
:::

标签平滑常常能提高准确率和校准，但也可能矫枉过正，变成自信不足。它还会抹去错误类别概率之间的相对大小，而知识蒸馏恰恰会用到这些信息（Müller 等 2019）。在 PyTorch 中，它只是一个参数，
`F.cross_entropy(logits, targets, label_smoothing=0.1)`。

### 最重要的是更多数据

网络的方差随 $N$ 下降，没有任何正则化手段能替代更多数据。每种正则化手段也会改变最佳学习率，因为它改变了梯度：加入之后要重新调 $\eta$。

::: keyidea
每种正则化手段以已知的方式改变梯度：衰减使权重收缩，dropout 注入均值为零的乘性噪声，标签平滑使损失有了有限的最优点；早停限制权重走多远，它们都不能取代更多数据。
:::

::: check
$p = 0.2$ 时，训练期间存活的激活被放大多少倍？评估时会怎样？
:::

::: answer
放大 $1/(1 - 0.2) = 1.25$ 倍，这使期望激活等于 $h_i$。评估时不丢弃也不缩放。
:::

::: check
为什么在可分数据上，用硬标签交叉熵时 logits 会无界增长？标签平滑怎样改变这一点？
:::

::: answer
$-\ln\hat p_y$ 只有在间隔趋于无穷时才达到 0，所以梯度永不消失，间隔不断增大。使用平滑时，损失在 $\hat{\mathbf{p}} = \mathbf{y}_{\text{LS}}$ 处最小，对应有限的间隔
$\ln\big((1 - \alpha + \alpha/K)/(\alpha/K)\big)$。
:::

## 损失与数值稳定性 {#s12}

损失由指数和对数构成，作用对象是网络自己选出的数。在精确算术中，[第 1 模块第 5 节](module_01_ZH.html#s5)的公式没有问题。在浮点运算中，$e^z$ 对中等大的 $z$ 就会上溢，很小的概率会下溢为零，$\ln 0 = -\infty$，而一个无穷大在一步之内就会让整个网络变成 NaN。本节划出这些界限，并说明怎样计算损失才能永远碰不到它们。

### 浮点格式

浮点数有一个符号位、决定范围的指数位，以及决定精度的尾数位；机器 epsilon，即 1 与下一个数之间的间隔，等于 $2^{-\text{尾数位数}}$。

| 格式 | 符号 / 指数 / 尾数 | 最大值 | 最小规格化数 | 最小非规格化数 | Epsilon |
|---|---|---|---|---|---|
| fp32 | 1 / 8 / 23 | $3.40\times 10^{38}$ | $1.18\times 10^{-38}$ | $1.4\times 10^{-45}$ | $1.19\times 10^{-7}$ |
| bf16 | 1 / 8 / 7 | $3.39\times 10^{38}$ | $1.18\times 10^{-38}$ | $9.2\times 10^{-41}$ | $7.8\times 10^{-3}$ |
| fp16 | 1 / 5 / 10 | 65,504 | $6.1\times 10^{-5}$ | $6.0\times 10^{-8}$ | $9.8\times 10^{-4}$ |

这些数值是 `torch.finfo` 和 `numpy.finfo` 报告的。bf16 保留了 fp32 的八个指数位，因此范围相同，但只有两到三位有效数字；fp16 多三个尾数位，但范围止于 65,504。对最大值取对数，$e^z$ 在 fp32 和 bf16 中于 $z \approx 88.7$ 以上上溢，在 fp16 中于 $z = \ln 65{,}504 = 11.09$ 以上上溢。在另一个方向，$e^{-z}$ 在 fp32 中于 $z \approx 103$、在 fp16 中于 $z \approx 16.6$ 处低于最小非规格化数，随后很快被舍入为恰好等于零（分别从约 104 和 17.3 起）。

::: worked title="fp16 在 e 的 11.09 次方处上溢"
在 NumPy 中，`np.exp(np.float16(11))` 返回 59,870，而 `np.exp(np.float16(12))` 返回 `inf`，因为 $e^{12} = 162{,}755$ 超过 65,504，而 $\ln 65{,}504 = 11.09$。logit 为 12 毫不稀奇；但在 fp16 中，它的指数根本无法表示。
:::

### log-sum-exp 恒等式

每个 $K$ 类损失都需要 $\ln\sum_j e^{z_j}$。对任意常数 $m$，

$$
\sum_j e^{z_j} = e^{m}\sum_j e^{z_j - m}
\quad\Longrightarrow\quad
\ln\sum_j e^{z_j} = m + \ln\sum_j e^{z_j - m}.
$$

这就是第 1 模块的观察（给每个 logit 加同一个常数不改变任何结果）的实际应用。取 $m = \max_j z_j$。这时每个指数 $z_j - m$ 至多为 0，所以不会上溢，并且有一项等于 $e^0 = 1$，所以和至少为 1，其对数绝不会是 $\ln 0$。真实类别为 $y$ 时的交叉熵随之直接得出：

$$
\ell = -\ln\hat p_y = -\big(z_y - \operatorname{logsumexp}(\mathbf{z})\big) = \operatorname{logsumexp}(\mathbf{z}) - z_y,
\qquad
\operatorname{log\_softmax}(\mathbf{z}) = \mathbf{z} - \operatorname{logsumexp}(\mathbf{z}).
$$

融合函数，即作用于 logits 的 `F.cross_entropy`，就是这样计算损失的，其梯度 $\hat{\mathbf{p}} - \mathbf{y}$ 也由同样稳定的量算出。第 1 模块中稳定的二分类形式就是 $K = 2$ 的情形。

::: worked title="上千的 logits"
$\mathbf{z} = (1000, 999, 998)$，目标类别为 0。朴素地算，即便在 float64 中 $e^{1000}$ 也是 `inf`，而 $\infty/\infty$ 是 NaN。稳定地算，$m = 1000$，
$\sum_j e^{z_j - m} = 1 + e^{-1} + e^{-2} = 1 + 0.36788 + 0.13534 = 1.50321$，所以
$\operatorname{logsumexp}(\mathbf{z}) = 1000 + \ln 1.50321 = 1000.40761$，损失为
$1000.40761 - 1000 = 0.40761$。`F.cross_entropy` 返回 0.407606。
:::

```python
import torch, torch.nn.functional as F

z = torch.tensor([[1000.0, 999.0, 998.0]])
print(z.exp() / z.exp().sum())                 # by hand: inf / inf
print(f"{F.cross_entropy(z, torch.tensor([0])).item():.6f}")  # logsumexp(z) - z_0

z2 = torch.tensor([0.0, -120.0])
print(torch.log(torch.softmax(z2, dim=0)))     # softmax underflows to 0, then log 0
print(torch.log_softmax(z2, dim=0))            # z - logsumexp(z): finite

logit, target = torch.tensor([17.0]), torch.tensor([0.0])
print(F.binary_cross_entropy(torch.sigmoid(logit), target).item())  # clamped
print(F.binary_cross_entropy_with_logits(logit, target).item())     # correct
```

```output
tensor([[nan, nan, nan]])
0.407606
tensor([0., -inf])
tensor([   0., -120.])
100.0
17.0
```

### 三种出错的方式

**分两步先取 softmax 再取对数。** 对于很负的 logit，softmax 可能下溢为恰好 0，而 $\ln 0 = -\infty$ 会给出无穷大的损失和 NaN 梯度。

::: worked title="softmax 取对数时的下溢"
fp32 中 $\mathbf{z} = (0, -120)$。softmax 需要 $e^{-120} = 7.7\times 10^{-53}$，远低于 fp32 的最小非规格化数（$1.4\times 10^{-45}$），所以它被存为 0，softmax 为 $(1, 0)$。其对数为 $(0, -\infty)$。`log_softmax` 计算
$\mathbf{z} - \operatorname{logsumexp}(\mathbf{z}) = (0, -120) - \ln(1 + 7.7\times 10^{-53}) = (0, -120)$，
结果有限，正如上面的代码所打印的。
:::

**在 `F.cross_entropy` 之前先做 softmax。** 损失自己会做 log-softmax，所以网络的概率会被当作限制在 $[0, 1]$ 内的 logits。最好的情形是真实类别得到概率 1，其他类别为 0，而这些“logits”给出 $\hat p_y = e/(e + K - 1)$，于是

$$
\ell \;\ge\; -\ln\frac{e}{e + K - 1} = \ln\Big(1 + \frac{K - 1}{e}\Big).
$$

梯度还要经过多出来的那个 softmax 的雅可比矩阵，其元素的大小至多为 $1/4$，所以学习非常慢。准确率仍可能上升，这正是它成为常见而隐蔽的错误的原因。

::: worked title="先 softmax 再交叉熵的损失下限"
$K = 10$：$\ln(1 + 9/2.71828) = \ln 4.311 = 1.461$。$K = 2$：$\ln(1 + 1/2.71828) = 0.313$。
$K = 100$：3.622。$K = 1{,}000$：5.909。[实验 5](#lab5) 的脚本 A 有这个错误，在十个数字类别上停在 1.469，刚好高于下限。
:::

**在二分类损失之前先做 sigmoid。** `BCEWithLogitsLoss` 从 logit 出发计算
$\ell = \max(z, 0) - zy + \ln(1 + e^{-|z|})$，永远不会上溢。先 sigmoid 再用 `BCELoss` 则会饱和：在 fp32 中，一旦 $e^{-z} < 2^{-24}$，$1 + e^{-z}$ 就舍入为恰好 1，也就是从 $z = 24\ln 2 \approx 16.64$ 起，$\sigma(z)$ 变成恰好 1.0，$\ln(1 - 1) = -\infty$。PyTorch 把对数钳制在 $-100$，所以损失被悄悄截断在 100，其梯度是错的。

::: worked title="饱和的 sigmoid"
在 fp32 中，$\sigma(16.6) = 0.99999988$，而 $\sigma(16.7) = 1.0$ 恰好。对 $z = 17$、$y = 0$，对 $\sigma(z)$ 做 `BCELoss` 返回 100（即钳制值），而 `BCEWithLogitsLoss` 返回正确的
$\max(17, 0) - 0 + \ln(1 + e^{-17}) = 17.0$。对 $z$ 的梯度差得更多：经过饱和的 sigmoid 是 0，而正确值是 $\sigma(17) - 0 = 1.0$，所以 batch 中错得最厉害的样本什么也教不了网络。
:::

### 回归损失与规约

平方误差是高斯负对数似然（第 1 模块），对离群值的惩罚是二次的。**Huber 损失**在 $|r| \le \delta_{\text{H}}$ 时为 $\tfrac12 r^2$，超出后为
$\delta_{\text{H}}(|r| - \delta_{\text{H}}/2)$，其梯度被裁剪在
$\pm\delta_{\text{H}}$，是常用的折中：取 $\delta_{\text{H}} = 1$（PyTorch 的
`delta`），残差为 3 时代价是 2.5 而不是 4.5。绝对误差对应拉普拉斯噪声。

**规约**（reduction）方式同样重要。对 batch 取平均，使梯度的尺度与 $B$ 无关；取和则会把梯度乘以 $B$，有效学习率也随之乘以 $B$。PyTorch 默认取平均；改变 batch 大小时要保持一致。

### 混合精度与方差

混合精度计算用 bf16 或 fp16 做矩阵乘法，但把主权重、softmax、损失和归一化统计量保留在 fp32 中；`torch.autocast` 按算子选择精度。fp16 还需要**损失缩放**（loss scaling）：在 `backward` 之前把损失乘以 $S$（例如 $2^{16}$），再把梯度除以 $S$，使小的梯度不会下溢（Micikevicius 等 2018）。bf16 的范围与 fp32 相同，不需要这样做，这也是遇到 NaN 损失时的第一条建议是用 bf16 而不是 fp16 的原因。[第 8 模块](module_08_ZH.html#s7)讲述大规模下的混合精度。

方差应按 $\operatorname{mean}\big((x - \mu)^2\big)$ 计算，绝不要按
$\operatorname{mean}(x^2) - \mu^2$，后者要把两个几乎相等的大数相减。在 fp32 中，对
$x = (10000, 10001, 10002)$，前者给出 0.6667，后者恰好给出 0。

::: keyidea
用建立在 log-sum-exp 之上的融合函数，从 logits 出发计算损失，把规约和统计量保留在 fp32 中，并清楚每种格式的范围：fp16 止于 65,504，约为 $e^{11}$。
:::

::: check
一个 10 类分类器的训练损失降到 1.46 就不再下降，而验证准确率仍在上升。你首先检查什么？
:::

::: answer
检查是否在 `F.cross_entropy` 之前应用了 softmax。把概率当作 logits，损失不可能低于 $-\ln\big(e/(e + 9)\big) = 1.46$，而 argmax，也就是准确率，仍然可以提高。
:::

::: check
为什么 bf16 能表示 $e^{80}$，而 fp16 却表示不了 $e^{12}$？
:::

::: answer
bf16 有与 fp32 相同的八个指数位，所以其最大值约为 $3.4\times 10^{38}$
（$\approx e^{88.7}$），$e^{80} = 5.5\times 10^{34}$ 可以容纳。fp16 只有五个指数位，其最大值为 $65{,}504 \approx e^{11.09}$。
:::

## 完整的训练循环 {#s13}

到目前为止的每一节，都在为训练循环中的某一行提供理由。本节把它们合在一起：一个约三十行的循环，训练一个两隐藏层的网络，去区分正方形里圆的内部和外部（与[第 1 节](#s1)游乐场中的圆形数据类似），后面的表格则说明每一行来自哪一节，这样循环就可以被读懂，而不只是被照抄。

```python
import torch, torch.nn as nn, torch.nn.functional as F

torch.manual_seed(0)
X = torch.rand(2048, 2) * 2 - 1                       # points in the square
T = ((X ** 2).sum(1) < 0.5).long()                    # inside the circle of radius sqrt(0.5)
Xtr, Ttr, Xva, Tva = X[:1536], T[:1536], X[1536:], T[1536:]
mu, sd = Xtr.mean(0), Xtr.std(0)                      # standardise with TRAINING statistics
norm = lambda x: (x - mu) / sd

model = nn.Sequential(nn.Linear(2, 32), nn.GELU(), nn.Linear(32, 32), nn.GELU(),
                      nn.Linear(32, 2))
opt = torch.optim.AdamW(model.parameters(), lr=3e-3, weight_decay=1e-2)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=400)

for epoch in range(400):
    model.train()
    perm = torch.randperm(len(Xtr))
    for i in range(0, len(Xtr), 64):
        idx = perm[i:i + 64]
        loss = F.cross_entropy(model(norm(Xtr[idx])), Ttr[idx])   # on logits
        opt.zero_grad(); loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        opt.step()
    sched.step()
    if epoch % 100 == 99:
        model.eval()
        with torch.no_grad():
            acc = (model(norm(Xva)).argmax(1) == Tva).float().mean()
        print(epoch + 1, round(loss.item(), 4), round(acc.item(), 3))
```

```output
100 0.0069 0.992
200 0.0205 0.996
300 0.0056 0.996
400 0.0107 0.996
```

| 行 | 为什么要有它 |
|---|---|
| `torch.manual_seed(0)` | 可复现；之后再报告多个种子上的波动（[第 14 节](#s14)） |
| `Xtr.mean(0), Xtr.std(0)` | 只用训练集统计量，因而没有泄漏（[第 1 模块第 10 节](module_01_ZH.html#s10)） |
| `nn.GELU()` | 一种平滑的、类似 ReLU 的激活函数（[第 5 节](#s5)） |
| 默认的 `nn.Linear` 初始化 | 在这个深度下足够用（[第 6 节](#s6)） |
| `AdamW(..., weight_decay=1e-2)` | 自适应步长加解耦衰减（[第 8 节](#s8)） |
| `CosineAnnealingLR` | 衰减到零，使训练最终稳定下来（[第 9 节](#s9)） |
| 作用于 logits 的 `F.cross_entropy` | 稳定的 log-sum-exp（[第 12 节](#s12)） |
| `backward` 之前的 `opt.zero_grad()` | 否则梯度会累积（[第 4 节](#s4)） |
| `clip_grad_norm_(..., 1.0)` | 防范偶尔出现的巨大一步（[第 9 节](#s9)） |
| `model.train()`、`model.eval()` | 切换 dropout 和批归一化（[第 10 节](#s10)和[第 11 节](#s11)）；这个模型两者都没有，但养成习惯没有代价 |
| `torch.no_grad()` | 评估时不建图（[第 4 节](#s4)） |

两点读法说明。打印出的损失是最后一个 mini-batch 的损失，噪声很大：它在第 100 和第 200 个轮次之间从 0.0069 跳到 0.0205，而各轮次的平均值是稳步下降的（0.0108、0.0065、0.0054、0.0046）。应当记录每个轮次的平均值。另外，`T_max` 数的是 `scheduler.step()` 的调用次数，这里就是轮次数。

::: worked title="这些数字意味着什么"
种子 0 在笔记本 CPU 上只需几秒，最终验证准确率为 99.6%。在种子 0 到 4 上，最终验证准确率分别为 0.9961、0.9980、0.9922、0.9980 和 1.0000：均值 99.69%，标准差 0.30 个百分点。应该报告的是这个波动，而不是最好的一次运行。正类占训练点的 40.7%（圆盘覆盖正方形的 $\pi\cdot 0.5/4 = 39.3\%$）。在同样标准化的输入上，逻辑回归的验证准确率为 59.2%，恰好等于多数类的占比，因为一条直线无法把圆盘与其补集分开。这个基线才让 99.7% 有了意义。图 2.17 给出了两条决策边界。
:::

::: figure id=fig-02-17
正方形 $[-1, 1]^2$ 上的两幅图。左：按类别着色的 512 个验证点，训练好的网络的决策边界画成等值线 $\hat p = 0.5$（近似于圆），真实的半径为 $\sqrt{0.5}$ 的圆用虚线画出。右：同样的点，加上逻辑回归的边界（一条直线，或在正方形内没有边界），并注明“59.2% = 多数类”。
:::

同一个模型也可以写成 `nn.Module` 的子类：`__init__` 把各层创建为属性，这就注册了它们的参数，`forward` 把它们组合起来。在相同的种子下，它构造出的权重与上面的 `nn.Sequential` 完全相同（1,218 个参数）。[实验 4](#lab4) 就用这种方式写模型，第 3 模块的残差块也以这种形式为基础。

```python
class CircleNet(nn.Module):
    def __init__(self, width=32):
        super().__init__()                    # must run before layers are assigned
        self.l1 = nn.Linear(2, width)
        self.l2 = nn.Linear(width, width)
        self.out = nn.Linear(width, 2)

    def forward(self, x):                     # called by model(x)
        return self.out(F.gelu(self.l2(F.gelu(self.l1(x)))))
```

::: check
如果调度器改为每个 batch 步进一次而不是每个轮次一次，哪一行要改？还有什么必须随之改变？
:::

::: answer
`sched.step()` 移到 batch 循环内部，`T_max` 变成 batch 的总数，
$400\times 24 = 9{,}600$（1,536 个训练点按 64 一批，每个轮次 24 个 batch）。
:::

::: check
打印出的损失从第 100 个轮次的 0.0069 跳到第 200 个轮次的 0.0205。训练出问题了吗？
:::

::: answer
没有。那只是单个 mini-batch 的损失。该看的信号是轮次平均损失（从 0.0108 降到 0.0065）和验证准确率（从 0.992 升到 0.996）。
:::

## 训练动态与调试 {#s14}

出问题的训练很少会自己说明原因：十几种不同的故障都会产生一条不下降的损失曲线。本节把症状转化为诊断：训练前要做的测试、训练中要记录什么、怎样读曲线、多大的差异只是噪声，以及一份检查清单。

### 训练之前：四个廉价的测试

**1. 初始损失。** 较小的随机权重给出接近零的 logits，所以 $\hat p_k \approx 1/K$，初始交叉熵约为 $-\ln(1/K) = \ln K$：十个类别时为 2.303。远高于这个值，说明 logits 很大，并且自信地出错。对于初始输出接近零的回归，初始均方误差约等于目标平方的均值。

::: worked title="手写数字上的初始损失检查"
[实验 4](#lab4) 的网络起始损失为 2.309，而 $\ln 10 = 2.303$：符合预期。同一个网络，如果每个权重改为从 $\mathcal{N}(0, 1)$ 中抽取（[实验 5](#lab5)，脚本 C），起始损失为 677，这是在第一步之前就能看出初始化有误的信号（[第 6 节](#s6)）。
:::

**2. 过拟合一个 batch。** 有数千个参数的网络可以记住 8 到 32 个固定样本，所以任何正常的流程都应在几百步内把它们的损失压到接近零。如果做不到，说明流程有问题，再多的数据也无济于事。

::: worked title="过拟合 32 个数字"
实验 4 用 $10^{-3}$ 的 AdamW、不加权重衰减，在 32 个数字上训练。损失在第 0 步为 2.31，第 50 步为 0.046，第 100 步为 0.0037，第 200 步为 0.0012：模型、损失和优化器的连接都是正确的。
:::

**3. 对每个手写或自定义的组件做梯度检验**（见下）。**4. 看数据**：看几个输入及其标签、各类别的数量、取值范围、是否有 NaN，以及是否有方差为零的特征。

### 正确地做梯度检验

中心差分用
$\big(\mathcal{L}(\theta + \epsilon_{\text{fd}}) - \mathcal{L}(\theta - \epsilon_{\text{fd}})\big)/(2\epsilon_{\text{fd}})$
来近似导数。它的误差有两部分。把 $\mathcal{L}(\theta \pm \epsilon_{\text{fd}})$ 做泰勒展开，偶次项抵消，**截断误差**约为
$|\mathcal{L}'''|\,\epsilon_{\text{fd}}^2/6$。每次计算 $\mathcal{L}$ 也有舍入，相对误差至多为单位舍入误差 $u$，所以差值的误差至多为 $2u|\mathcal{L}|$，除以 $2\epsilon_{\text{fd}}$ 之后，**舍入误差**约为
$u|\mathcal{L}|/\epsilon_{\text{fd}}$。前者随 $\epsilon_{\text{fd}}$ 增大而增大，后者则随之减小。取 $|\mathcal{L}'''| \approx |\mathcal{L}| \approx 1$，令
$\epsilon_{\text{fd}}^2/6 + u/\epsilon_{\text{fd}}$ 的导数为零，得到
$\epsilon_{\text{fd}}/3 = u/\epsilon_{\text{fd}}^2$，所以

$$
\epsilon_{\text{fd}}^{*} = (3u)^{1/3}.
$$

在 float64 中，$u = 1.1\times 10^{-16}$，所以 $\epsilon_{\text{fd}}^{*} \approx 10^{-5}$，可达到的误差约为 $10^{-11}$。在 float32 中，$u = 6\times 10^{-8}$，所以
$\epsilon_{\text{fd}}^{*} \approx 5\times 10^{-3}$，即使梯度是正确的，误差也约为 $10^{-5}$。因此要在 float64 中检验。

::: worked title="float64 中的误差预算"
设 $\mathcal{L} \approx 1$：在 $\epsilon_{\text{fd}} = 10^{-5}$ 时，截断误差约为
$(10^{-5})^2/6 = 2\times 10^{-11}$，舍入误差约为 $10^{-16}/10^{-5} = 10^{-11}$。在
$\epsilon_{\text{fd}} = 10^{-12}$ 时，截断误差消失，但舍入误差约为
$10^{-16}/10^{-12} = 10^{-4}$，差了几百万倍。步长更小并不意味着更好。
:::

用逐元素的相对误差 $|a - n|/\max(10^{-8}, |a| + |n|)$ 来比较解析梯度 $a$ 与数值梯度 $n$，它能把错误定位到某个张量；第 1 模块的向量形式
$\|\mathbf{g}_{\text{num}} - \mathbf{g}\|/\|\mathbf{g}_{\text{num}} + \mathbf{g}\|$ 也是一种相对误差。低于 $10^{-7}$ 为通过；
$10^{-4}$ 或更大就是有错误，除非涉及拐点。当某个预激活与零的距离在 $\epsilon_{\text{fd}}$ 之内时，ReLU 的拐点会引起误报，因为这时两次计算落在拐点的两侧（[实验 1](#lab1) 在 $2\times 10^{-7}$ 处碰到过一个）。要对每个张量检查多个元素。`torch.autograd.gradcheck` 对任何以双精度张量为输入的函数完成这一切，默认值为 `eps=1e-6`、`atol=1e-5` 和 `rtol=1e-3`：

```python
import torch

def layer(x, W, b):                                  # a custom function to be checked
    return torch.tanh(x @ W + b)

torch.manual_seed(0)
x = torch.randn(4, 3, dtype=torch.float64, requires_grad=True)
W = torch.randn(3, 2, dtype=torch.float64, requires_grad=True)
b = torch.randn(2, dtype=torch.float64, requires_grad=True)
print(torch.autograd.gradcheck(layer, (x, W, b)))    # raises an error if a check fails
```

```output
True
```

### 训练期间：记录什么

在共享的横轴上记录并绘制：训练损失（轮次平均值，取对数坐标）、每个轮次的验证损失和指标、学习率，以及裁剪之前的全局梯度范数（由 `clip_grad_norm_` 返回）。多数问题都能从这几条线上看出来。逐层来看，前向 hook 可以记录激活的标准差和死亡 ReLU 单元的比例，每个权重的 `.grad` 给出其梯度范数，而**更新与权重之比**（update-to-weight ratio）$\|\Delta\theta\|/\|\theta\|$，由实际的参数变化测得，说明优化器移动每一层有多快。常见的经验法则是让它接近
$10^{-3}$；在 $10^{-3}$ 的 AdamW 下，实验 4 在第 1 个轮次看到约 $10^{-2}$，第 10 个轮次为 $1.5$ 到 $1.8\times 10^{-3}$，第 30 个轮次为 $2.3$ 到 $2.6\times 10^{-4}$，这是因为余弦调度降低了 $\eta$，而且变小、变得更嘈杂的梯度缩短了 Adam 的步长。

```python norun
stats = {}
def record(name):
    def hook(module, inputs, output):                # runs after each forward pass
        dead = (output <= 0).all(dim=0).float().mean().item()   # zero for every example
        stats[name] = (output.std().item(), dead)
    return hook
for name, m in model.named_modules():
    if isinstance(m, nn.ReLU):
        m.register_forward_hook(record(name))

gnorm = torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)   # norm before clipping
before = [p.detach().clone() for p in model.parameters()]
opt.step()
ratios = [((p.detach() - q).norm() / q.norm()).item()
          for p, q in zip(model.parameters(), before)]
```

::: worked title="一次健康训练的逐层数据"
实验 4 在第 1、10 和 30 个轮次的监控数据。两个隐藏层的激活标准差：0.37/0.22，然后 0.62/1.02，然后 0.68/1.25。死亡单元的比例：0/0.008，然后 0/0.016，然后 0/0.016。三个权重矩阵在该轮次最后一个 mini-batch 步的梯度范数：0.29/0.35/0.43，然后 0.12/0.08/0.16，然后 0.015/0.010/0.020。激活保持在 1 的量级，几乎没有单元死亡，梯度随损失下降缩小到原来的二十到三十五分之一。无需采取任何措施：这是一次健康的训练，是用来对照判读不健康训练的参照。
:::

### 读曲线

损失曲线的每种形状都指向一小串可能的原因；图 2.18 画出了其中四种。

- **损失从一开始就是平的。** 学习率远远太小，或者没有梯度传来：反向传播有错误、张量被 detach、单元死亡，或者标签与输入没有对齐。
- **损失变成 NaN。** 学习率太大，或者某处上溢（[第 12 节](#s12)）。降低 $\eta$、加预热、做裁剪、从 logits 出发计算、用 bf16 而不是 fp16；
  `torch.autograd.set_detect_anomaly(True)` 能找到第一个出错的运算。
- **损失下降，然后出现尖峰或上升。** 训练后期学习率过高、缺少预热、某个 batch 有问题，或者缺少 `zero_grad`。
- **训练损失下降而验证损失上升。** 过拟合（[第 11 节](#s11)）。
- **两者都停在较高处。** 欠拟合，或者学习率衰减得太早：用更大的模型、更长的调度。
- **验证损失低于训练损失。** dropout 或数据增强只在训练中起作用（正常），或者存在泄漏。
- **十个类别时训练损失卡在 1.46 附近。** 损失之前有一个 softmax（[第 12 节](#s12)）。
- **损失在下降，准确率不变。** 类别不平衡，或者指标的计算有错误。

::: figure id=fig-02-18
2 × 2 网格，给出具有代表性的训练和验证损失曲线，纵轴为对数坐标，每幅图都在双纵轴上带一条细的梯度范数曲线。(a) 健康：两条损失都下降，验证损失趋平，梯度范数衰减。(b) 学习率过高：损失下降、出现尖峰，然后变成 NaN（用叉号标出），梯度范数先出现尖峰。(c) 过拟合：训练损失持续下降，验证损失在标出的轮次开始上升。(d) 没有学习：停在 $\ln 10 = 2.30$ 不动，梯度范数接近零。每幅图的标题是其诊断和首先要做的修复。
:::

### 测量中的噪声

在 $n$ 个样本上得到的测试准确率 $p$ 是一个二项比例，标准误为
$\sqrt{p(1 - p)/n}$：$p = 0.97$、$n = 360$ 时为 0.009，所以相差一个百分点的两次运行无法区分。种子之间的波动是另一回事（实验 4：五个种子上为 $97.28\% \pm 0.36$）。两者都要报告，还要报告基线。

::: worked title="测试准确率的标准误"
实验 4，种子 0：360 张测试图像上为 0.9694。$\sqrt{0.9694\cdot 0.0306/360} = \sqrt{8.24\times 10^{-5}} = 0.0091$，
所以结果是 $96.9\% \pm 0.9$ 个百分点。
:::

### 检查清单

1. 看数据。
2. 用训练集统计量做标准化，并处理零方差。
3. 检查整个模型中的形状，以及目标与输出是否匹配。
4. 检查初始损失。
5. 在 float64 中对自定义代码做梯度检验。
6. 过拟合一个 batch。
7. 训练时记录损失、验证指标、学习率和梯度范数。
8. 观察逐层统计量。
9. 与基线比较。
10. 在 `model.eval()` 和 `torch.no_grad()` 下评估，测试集只碰一次，并报告其标准误和种子波动。

::: keyidea
训练前先测试（初始损失接近 $\ln K$、能过拟合一个 batch、在 float64 中检验过梯度），训练中记录损失、学习率和梯度范数，并对照标准误和种子波动来判断差异。
:::

::: check
一个新的 10 类模型开始训练时的损失为 47。你首先怀疑什么？
:::

::: answer
初始权重或输出尺度太大，所以 logits 很大，并且自信地出错。合理的初始化应当从接近 $\ln 10 = 2.30$ 处开始。
:::

::: check
两种配置在 360 张测试图像上分别得到 97.2% 和 97.8%。第二个更好吗？
:::

::: answer
不能这样说。两者的标准误都约为 0.8 到 0.9 个百分点，大于 0.6 个百分点的差距，而种子之间的波动还会带来更多不确定性。
:::

::: check
为什么要在 float64 中做梯度检验？
:::

::: answer
在 float32 中，中心差分能达到的最佳精度约为 $10^{-5}$，即使梯度是正确的也如此，太粗糙，无法区分错误与舍入。在 float64 中则约为 $10^{-11}$。
:::

## 常见问题与排查 {#wrong}

每一条给出你在运行中遇到的症状、原因和修复办法，并指出解释其机制的小节或实验。症状不明确时，按[第 14 节](#s14)检查清单的顺序逐条排查。

### 损失不下降，或停得太高

**训练损失从第一步起就停在 $\ln K$ 附近**（十个类别时为 2.30）。*原因：*没有梯度传到权重：张量被 detach 或 `requires_grad=False`、所有 ReLU 单元都已死亡、标签与输入各自独立地被打乱，或者学习率接近零。*修复：*过拟合一个 32 个样本的 batch；打印逐层梯度范数；检查 `loss.grad_fn` 不是 `None`；看几对（输入，标签）（[第 14 节](#s14)）。

**10 类问题上训练损失停在 1.46 附近**（2 类问题为 0.31），而准确率看上去还行。*原因：*在 `F.cross_entropy` 之前应用了 softmax，于是概率被当作 logits，损失不可能低于 $-\ln\big(e/(e + K - 1)\big)$。*修复：*把原始 logits 传给损失（[第 12 节](#s12)；[实验 5](#lab5) 的脚本 A 在 20 个轮次后停在 1.469）。

**回归损失恰好停在目标的方差处，预测是常数。** *原因：*形状为 `(B,)` 的目标与形状为 `(B, 1)` 的预测广播成一个 `(B, B)` 的差值矩阵，预测均值时其平均值最小。*修复：*用 `squeeze` 或 `unsqueeze` 使形状相等，并把 PyTorch 的广播警告当作错误处理（[第 2 节](#s2)）。

**最终损失在各轮次之间抖动，并且停在噪声下限之上**（[实验 3](#lab3)：验证 MSE 为 0.0130，下限为 0.0104）。*原因：*学习率恒定；SGD 噪声把迭代点保持在一个带内，带宽随 $\eta$ 增大，最终模型是这种振荡中的一个随机点。*修复：*用余弦或分段方式衰减学习率，使训练最终稳定下来（[第 9 节](#s9)）。

### 损失爆炸

**初始损失远高于 $\ln K$**（实验 5 中是 677，而不是 2.30）。*原因：*初始权重太大，用了 $\mathcal{N}(0, 1)$ 而不是 He 初始化或框架默认值，所以 logits 很大，并且自信地出错。*修复：*使用保持方差的初始化，并在训练之前检查初始损失（[第 6 节](#s6)和[第 14 节](#s14)）。

**若干步之后损失变成 NaN 或 inf。** *原因：*学习率太高，或者某处上溢（大 logits 的指数、超过 65,504 的 fp16）、取了 $\ln 0$，或者除以零标准差。*修复：*降低 $\eta$ 或加预热，把全局梯度范数裁剪到 1.0，从 logits 出发计算损失，优先用 bf16 而不是 fp16，给除法加保护；`torch.autograd.set_detect_anomaly(True)` 会指出第一个出错的运算（[第 12 节](#s12)）。

**损失先降后升并游走，同时梯度范数每个轮次都在增大**（实验 5 中从 7 增大到 195）。*原因：*缺少 `optimizer.zero_grad()`，所以 `.grad` 在各步之间累积，每一步都加上之前所有的梯度。*修复：*每次反向传播之前把梯度清零（[第 4 节](#s4)）。

### 训练与评估不一致

**同一组权重的两次评估得到不同的验证准确率，或者准确率依赖评估的 batch 大小**（实验 5 中，训练模式下为 94.2% 和 93.6%，batch 为 8 时为 85.5%，而评估模式下为 96.9%）。*原因：*忘了调用 `model.eval()`，所以 dropout 掩码和批归一化的 batch 统计量仍在起作用。*修复：*在 `model.eval()` 和 `torch.no_grad()` 下评估，并在恢复训练之前调用 `model.train()`（[第 10 节](#s10)和[第 11 节](#s11)）。

**batch 为 1 时，批归一化报错 `Expected more than 1 value per channel when training`；batch 为 2 或 4 时，训练噪声很大，评估与训练不一致。** *原因：*对很小的 batch，batch 统计量要么没有定义，要么没有意义。*修复：*改用层归一化、RMSNorm 或组归一化，或者使用更大的 batch（[第 10 节](#s10)）。

**验证集统计量泄漏进了输入标准化，或者常数特征被零除**（`load_digits` 中四个始终为零的像素在验证集中产生 1,436 个 NaN）。*原因：*均值和标准差是在错误的数据划分上算出的，或者某个标准差为 0。*修复：*只在训练集上计算它们，并把为零的标准差替换为 1（[实验 4](#lab4)）。

### 梯度有误、消失或被误用

**自定义层或手写的反向传播“能训练”，但有一部分始终没有改进。** *原因：*梯度错误或缺失：漏了一项、转置有误，或者多了一个 `detach`。*修复：*在 float64 中与中心有限差分对比（相对误差低于 $10^{-7}$），并考虑 ReLU 拐点和接近零的梯度（[第 14 节](#s14)，[实验 1](#lab1)）。

**一个很深的朴素网络，比如二十层 sigmoid，用任何优化器都训练不动。** *原因：*梯度消失：每一层都把误差乘以 $\sigma' \le 1/4$。*修复：*改架构，而不是改优化器：用 ReLU 系列激活函数、He 初始化、归一化、残差连接（[第 3 节](#s3)、[第 5 节](#s5)和[第 10 节](#s10)）。

**激活缩小到偏置的量级（标准差约 0.04），或在初始化时随深度爆炸。** *原因：*初始尺度没有保持方差；PyTorch 的 `nn.Linear` 默认值 $\mathcal{U}(\pm 1/\sqrt{n_{\text{in}}})$ 的权重方差为 $1/(3n_{\text{in}})$，所以每一层都把 ReLU 信号的二阶矩缩小到六分之一。*修复：*对深的 ReLU 堆叠使用 He 初始化，并在第 0 步记录逐层激活统计量（[第 6 节](#s6)）。

**用 `Adam(weight_decay=λ)` 调好的权重衰减在各层之间表现不一致，每当学习率变化就必须重新调。** *原因：*耦合的 $L_2$：衰减项被加到梯度上，然后再除以 $\sqrt{\hat v}$，所以在梯度大的地方恰恰衰减很弱。*修复：*使用 AdamW（解耦衰减），并把偏置和归一化增益排除在衰减之外（[第 8 节](#s8)）。
