## 激活函数 {#s5}

[第 3 节](#s3)的式 2 在误差信号向下传播的每一层都要乘以 $\phi'(\mathbf{z})$。因此，选择激活函数（activation function）首先就是在选择一个导数：每个反向传播的误差在每一层都要被它缩放一次。本节推导这些导数，并说明单元停止传递梯度的两种方式：饱和（saturation）与死亡。

### 常见选择

| 名称 | $\phi(z)$ | $\phi'(z)$ | 值域 | 零中心 | 是否饱和 | 典型用途 |
|---|---|---|---|---|---|---|
| sigmoid | $\sigma(z) = 1/(1+e^{-z})$ | $\sigma(z)(1-\sigma(z)) \le 1/4$ | $(0, 1)$ | 否 | 两侧均饱和 | 二分类输出概率；门（[模块 04](module_04_ZH.html#s5)） |
| tanh | $\tanh z$ | $1-\tanh^2 z \le 1$ | $(-1, 1)$ | 是 | 两侧均饱和 | 早期的 MLP 和循环网络 |
| ReLU | $\max(0, z)$ | $\mathbb{1}[z>0]$ | $[0, \infty)$ | 否 | 不饱和；$z<0$ 时恰为 0 | MLP 和 CNN 的隐藏层 |
| leaky ReLU | $\max(az, z)$，$a = 0.01$ | $a$ 或 1 | $(-\infty, \infty)$ | 近似 | 不饱和 | 不会死亡的 ReLU |
| GELU | $z\,\Phi(z)$ | $\Phi(z) + z\,\phi_N(z)$ | $[-0.170, \infty)$ | 近似 | 不饱和 | Transformer 的默认选择（BERT、GPT-2） |
| SiLU / Swish | $z\,\sigma(z)$ | $\sigma(z)\big(1 + z(1-\sigma(z))\big)$ | $[-0.278, \infty)$ | 近似 | 不饱和 | 门控前馈块（SwiGLU） |

$\Phi$ 是标准正态分布的累积分布函数，$\phi_N$ 是标准正态分布的密度函数。截至 2026 年，大多数开放权重的大语言模型在 SwiGLU 前馈块中使用 SiLU（[模块 06，第 9 节](module_06_ZH.html#s9)）。PyTorch 约定 ReLU 在 $z = 0$ 处的导数为 0。图 2.9 画出了这六个函数及其导数。

::: figure id=fig-02-9
$z \in [-5, 5]$ 上的两行图。上行：sigmoid、tanh、ReLU、leaky ReLU（插图取 $a = 0.1$，以便看清斜率）、GELU 和 SiLU。下行：它们的导数。$|\phi'| < 0.01$ 的区域对 sigmoid（$|z| > 4.6$）和 tanh（$|z| > 3.0$）以阴影标为“饱和”；ReLU 导数为零的半直线标为“死亡侧”；GELU 在 $(-0.752, -0.170)$ 处的最小值和 SiLU 在 $(-1.278, -0.278)$ 处的最小值也已标出。
:::

### 推导导数

把 sigmoid 写成 $(1+e^{-z})^{-1}$ 并求导：

$$
\sigma'(z) = \frac{e^{-z}}{(1+e^{-z})^2}
= \frac{1}{1+e^{-z}}\cdot\frac{e^{-z}}{1+e^{-z}}
= \sigma(z)\big(1-\sigma(z)\big),
$$

这是因为 $e^{-z}/(1+e^{-z}) = 1 - 1/(1+e^{-z})$。$(0, 1)$ 内的一个数与它的补数之积 $s(1-s)$ 在 $s = 1/2$，即 $z = 0$ 处最大，等于 $1/4$。反向传播时可以直接用存下来的输出来计算它。

对于 tanh，把 $(e^z - e^{-z})/(e^z + e^{-z})$ 的分子分母同乘 $e^{-z}$：

$$
\tanh z = \frac{1-e^{-2z}}{1+e^{-2z}} = \frac{2}{1+e^{-2z}} - 1 = 2\sigma(2z) - 1 .
$$

tanh 就是一个在纵向拉伸到 $(-1, 1)$、在横向压缩为二分之一的 sigmoid。由链式法则，$\tanh'(z) = 4\sigma'(2z)$，在原点处等于 $4\cdot\tfrac14 = 1$：形状相同，但以零为中心，斜率是 sigmoid 的四倍。GELU 和 SiLU 都是乘积，用乘积法则可直接得到导数：$\Phi + z\phi_N$ 和 $\sigma + z\sigma(1-\sigma)$。

::: worked title="几个点上的导数"
Sigmoid：$\sigma(0) = 0.5$，所以 $\sigma'(0) = 0.5\cdot 0.5 = 0.25$；$\sigma(2) = 0.8808$，所以
$\sigma'(2) = 0.8808\cdot 0.1192 = 0.105$；$\sigma(5) = 0.99331$，所以
$\sigma'(5) = 0.99331\cdot 0.00669 = 0.0066$。

tanh：$\tanh'(0) = 1 - 0 = 1$；$\tanh 2 = 0.9640$，所以 $\tanh'(2) = 1 - 0.9293 = 0.0707$；
$\tanh 3 = 0.99505$，所以 $\tanh'(3) = 1 - 0.99013 = 0.0099$。

GELU：$\mathrm{GELU}'(0) = \Phi(0) + 0 = 0.5$；
$\mathrm{GELU}'(1) = \Phi(1) + \phi_N(1) = 0.8413 + 0.2420 = 1.083$；
$\mathrm{GELU}'(-3) = 0.00135 + (-3)(0.00443) = -0.012$。

SiLU：$\mathrm{SiLU}'(0) = 0.5\,(1 + 0) = 0.5$；
$\mathrm{SiLU}'(2) = 0.8808\,(1 + 2\cdot 0.1192) = 0.8808\cdot 1.2384 = 1.091$。

光滑激活函数在 $z$ 为较大正数时斜率大于 1（GELU 在 $z = 0.75$ 之后，SiLU 在 $z = 1.28$ 之后；$\mathrm{SiLU}'(1)$ 仍为 0.928），而 GELU 在 $-3$ 处的斜率为负。
:::

自动微分（autograd）能复现这些数值，这是检查你自己实现的任何激活函数的廉价办法：

```python
import torch
import torch.nn as nn

z = torch.tensor([-3.0, 0.0, 1.0, 2.0, 5.0], requires_grad=True)
acts = {"sigmoid": torch.sigmoid, "tanh": torch.tanh, "relu": torch.relu,
        "gelu": nn.GELU(), "silu": nn.SiLU()}
for name, phi in acts.items():
    (grad,) = torch.autograd.grad(phi(z).sum(), z)   # elementwise, so this is phi'(z)
    print(f"{name:8s}", " ".join(f"{g:8.4f}" for g in grad.tolist()))
```

```output
sigmoid    0.0452   0.2500   0.1966   0.1050   0.0066
tanh       0.0099   1.0000   0.4200   0.0707   0.0002
relu       0.0000   0.0000   1.0000   1.0000   1.0000
gelu      -0.0119   0.5000   1.0833   1.0852   1.0000
silu      -0.0881   0.5000   0.9277   1.0908   1.0265
```

### 饱和，以及 ReLU 为何胜出

当 $\phi' \approx 0$ 时，单元几乎不传递梯度，称为**饱和**。sigmoid 的导数在 $|z| > 4.6$ 时低于 0.01，tanh 的导数在 $|z| > 3.0$ 时低于 0.01。饱和的单元并非永远死亡：它仍在学习，只是速率由那个极小的导数决定。

ReLU 胜出，靠的是它的导数。在激活一侧导数恰为 1，所以误差穿过许多层时不会被激活函数削弱，而 sigmoid 每层最多把误差乘以 $1/4$。它的计算也很廉价：一次比较，没有指数运算。GELU 和 SiLU 保留了正侧近似线性的特点，并增加了光滑性。

::: worked title="十层激活导数之积"
只把沿一条路径穿过十层的激活导数相乘。sigmoid 取最好的点：$0.25^{10} = 9.5\times 10^{-7}$，与第 3 节相同。tanh 在 $z = 0$：$1^{10} = 1$。ReLU 在激活一侧：$1^{10} = 1$。tanh 只有在原点附近才与 ReLU 相当；在 $z = 2$ 处，它的因子是 $0.0707^{10} \approx 3\times 10^{-12}$。
:::

GELU 和 SiLU 都不是单调的。GELU 在 $z = -0.752$ 处取最小值 $-0.170$，SiLU 在 $z = -1.278$ 处取最小值 $-0.278$，在这些点之下它们的导数略为负。GELU 常用如下近似来计算：
$0.5z\big(1 + \tanh(\sqrt{2/\pi}\,(z + 0.044715z^3))\big)$，它与 $z\Phi(z)$ 至多相差 $4.7\times 10^{-4}$（在 $|z| = 2.7$ 附近最大）。PyTorch 的 `nn.GELU()` 使用精确的误差函数形式；`nn.GELU(approximate="tanh")` 使用该近似。

### 零中心

sigmoid 层的输出全为正。对于单个样本，流入单元 $j$ 的权重的梯度是 $\partial\mathcal{L}/\partial W_{ij} = h_i\delta_j$（第 3 节），而当所有 $h_i > 0$ 时，这些梯度的符号都与 $\delta_j$ 相同。于是单元 $j$ 的入边权重向量只能沿各分量同号的方向移动，要到达目标就得走之字形。tanh 因为是零中心的，避免了这个问题；零均值的输入和归一化层同样如此（[第 6 节](#s6)和[第 10 节](#s10)）。这一约束只对单个样本成立；mini-batch 梯度是对多个样本求和，各样本的 $\delta_j$ 符号不同，约束因此被放松。

::: worked title="方差不是二阶矩"
设 $z \sim \mathcal{N}(0, 1)$。由对称性，$z > 0$ 的那一半概率质量承担了 $\mathbb{E}[z^2]$ 的一半，所以 $\mathbb{E}[\operatorname{ReLU}(z)^2] = 0.5$。均值是
$\mathbb{E}[\operatorname{ReLU}(z)] = \int_0^\infty z\,\phi_N(z)\,dz = \phi_N(0) = 1/\sqrt{2\pi} = 0.399$，
所以 $\operatorname{Var}(\operatorname{ReLU}(z)) = 0.5 - 1/(2\pi) = 0.5 - 0.159 = 0.341$。ReLU 把二阶矩减半；它的方差降到输入方差的 0.341 倍。第 6 节需要用到的是二阶矩。
:::

### 死亡 ReLU 单元

如果某个 ReLU 单元的预激活对每个训练样本都为负，它的导数处处为零：它的入边权重和偏置得不到任何梯度，普通梯度下降永远无法使它复活（[练习 5](#e5)）。常见原因有两个：一次很大的更新（学习率过高）把偏置推到很负的位置，以及不佳的参数初始化。补救办法是降低学习率、使用 He 初始化（[第 6 节](#s6)），或者改用左侧斜率非零的激活函数（leaky ReLU、GELU）。要把它量化出来：**死亡比例**是指在一个 batch 的所有样本上输出都为 0 的单元所占的比例，[实验 4](#lab4)和[实验 5](#lab5)都会记录它。

::: worked title="由学习率造成的死亡单元"
还是 playground 的圆环问题（[第 1 节](#s1)），8 个 ReLU 隐藏单元，用 NumPy 按该控件的规格做模拟。Adam 在 $\eta = 1$ 时有 8 个单元中的 4 个死亡（换其他随机种子是 0 到 5 个）；存活的单元仍能拟合数据。普通梯度下降在 $\eta = 10$ 时把 8 个全部杀死。此时只有输出偏置还有梯度，在这个步长下它在两个值之间来回跳：损失卡在 1.04（比常数猜测的 $\ln 2 = 0.693$ 还差），准确率 50%。
:::

### 输出层不同

输出层的“激活函数”由损失函数决定，而不是为梯度流动而选：平方误差用恒等函数，交叉熵内部则是 logits 进入 softmax 或 sigmoid（[第 12 节](#s12)）。

::: check
为什么即使优化器调得很好，十层 sigmoid 网络也可能训练失败？
:::

::: answer
每一层都把反向传播的误差乘以 $\sigma' \le 1/4$，所以除非权重加以补偿，最早的几层至多只能收到输出误差的约 $10^{-6}$。
:::

::: check
某个 ReLU 单元的偏置为 $-10$，入边权重很小，输入已经标准化。训练中它会怎样？
:::

::: answer
对几乎每个输入，它的预激活都为负，所以它的导数从而梯度为零，它会一直死亡。
:::

::: check
$\mathrm{GELU}'(0)$ 是多少？
:::

::: answer
$\Phi(0) + 0\cdot\phi_N(0) = 0.5$。
:::

## 参数初始化 {#s6}

训练是从初始权重所计算出的结果开始的。如果权重的尺度不对，在优化器迈出第一步之前，前向信号和反向误差就会随深度呈几何级数增长或衰减（即[第 3 节](#s3)中的雅可比矩阵连乘）。本节从一个要求出发推导尺度，即信号在每一层的大小应当相同，并测量要求不满足时会发生什么。

### 对称性

把一层的所有权重设成同一个值，无论是零还是别的常数，这一层的每个单元对其输入计算的是同一个函数，收到的误差信号相同，因而梯度也相同。更新之后这些单元仍然完全相同，并且永远保持相同：这一层只有一个单元的表达能力。若权重为零且使用 ReLU，情况更糟，因为
$\boldsymbol{\delta}^{(l)} = (\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)})\odot\phi'$ 为零，连第一层的梯度也消失。随机权重打破**对称性**（symmetry）；偏置可以从零开始，因为随机权重已经使各单元彼此不同。Rumelhart、Hinton 和 Williams（1986）正是出于这个原因从小的随机权重出发。剩下的问题就是尺度。

### 前向推导

取一个单元，$z_j = \sum_{i=1}^{n} w_{ij}h_i$，输入数 $n = n_{\text{in}}$（初始化时偏置为零）。假设 $w_{ij}$ 相互独立，均值为零、方差为 $\sigma_w^2$，并且与输入 $h_i$ 独立。于是
$\mathbb{E}[z_j] = \sum_i \mathbb{E}[w_{ij}]\mathbb{E}[h_i] = 0$。$z_j^2$ 的交叉项也为零，因为当 $i \ne k$ 时
$\mathbb{E}[w_{ij}h_iw_{kj}h_k] = \mathbb{E}[w_{ij}]\,\mathbb{E}[w_{kj}]\,\mathbb{E}[h_ih_k] = 0$，所以

$$
\operatorname{Var}(z_j) = \sum_{i=1}^{n}\mathbb{E}[w_{ij}^2h_i^2]
= \sum_{i=1}^{n}\mathbb{E}[w_{ij}^2]\,\mathbb{E}[h_i^2]
= n\,\sigma_w^2\,\mathbb{E}[h^2]. \tag{6.1}
$$

输入是通过它的**二阶矩** $\mathbb{E}[h^2]$ 而不是方差进入的。只有当 $h$ 均值为零时两者才一致，而 ReLU 的输出不满足这一点。

现在要求 $\operatorname{Var}(z^{(l)}) = \operatorname{Var}(z^{(l-1)})$。对于原点附近的 tanh，$h \approx z$，所以 $\mathbb{E}[h^2] \approx \operatorname{Var}(z^{(l-1)})$，式 6.1 要求 $\sigma_w^2 = 1/n_{\text{in}}$（LeCun 等 1998）。对于 ReLU，$z^{(l-1)}$ 关于零对称，所以 $\mathbb{E}[h^2] = \tfrac12\operatorname{Var}(z^{(l-1)})$（第 5 节的例题），要保持不变就需要

$$
\sigma_w^2 = \frac{2}{n_{\text{in}}},
$$

这就是 **He 初始化**（He 等 2015）。ReLU 把二阶矩减半，因子 2 把它补回来。它并没有把方差减半，方差会降到 $0.341\operatorname{Var}(z)$。

### 反向推导

误差满足 $\delta^{(l)}_i = \phi'(z^{(l)}_i)\sum_{j=1}^{n_{\text{out}}} w^{(l+1)}_{ij}\delta^{(l+1)}_j$，这是对该单元所连接的 $n_{\text{out}}$ 个单元求和。同样的论证，在权重与误差独立的前提下，给出

$$
\operatorname{Var}(\delta^{(l)}) = n_{\text{out}}\,\sigma_w^2\,\mathbb{E}[\phi'^2]\,\operatorname{Var}(\delta^{(l+1)}).
$$

在原点附近，tanh 的 $\phi' \approx 1$；ReLU 的 $\mathbb{E}[\phi'^2] = P(z > 0) = 1/2$。因此反向传播的保持条件是：tanh 用 $\sigma_w^2 = 1/n_{\text{out}}$，ReLU 用 $2/n_{\text{out}}$。Glorot 和 Bengio（2010）取折中，
$\sigma_w^2 = 2/(n_{\text{in}} + n_{\text{out}})$，即 **Xavier** 或 **Glorot** 初始化。在均匀分布形式下，权重取自 $U(-a, a)$；因为 $\operatorname{Var}(U(-a, a)) = a^2/3$，边界为 $a = \sqrt{6/(n_{\text{in}} + n_{\text{out}})}$。He 等人指出只满足一个方向就够了：按扇入缩放时，每层的反向因子为
$n_{\text{out}}\cdot(2/n_{\text{in}})\cdot\tfrac12 = n_{\text{out}}/n_{\text{in}}$，各层的乘积逐项相消，只剩两个宽度之比，不随深度增长。扇入模式是 ReLU 的常用选择。

::: worked title="逐层计算"
扇入为 512 的 ReLU 层：He 标准差为 $\sqrt{2/512} = \sqrt{1/256} = 0.0625$。一个 $784 \to 256$ 的层：Glorot 均匀分布的边界是 $\sqrt{6/(784 + 256)} = \sqrt{6/1{,}040} = 0.0760$，He 标准差是 $\sqrt{2/784} = 0.0505$。
:::

### 十层上的实测

::: worked title="预测与实测对照，十层、宽度 256"
输入 $\mathbf{x} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$，1,000 个样本，十层，宽度 256，随机种子固定。表中给出第 1、2、5、10 层 $z$ 的标准差。

| 方案 | 第 1 层 | 第 2 层 | 第 5 层 | 第 10 层 |
|---|---|---|---|---|
| ReLU，He（$2/n$） | 1.42 | 1.39 | 1.46 | 1.43 |
| ReLU，$1/n$ | 1.01 | 0.694 | 0.258 | 0.0447 |
| ReLU，$\mathcal{N}(0, 0.01^2)$ | 0.161 | 0.0178 | $2.7\times 10^{-5}$ | $4.9\times 10^{-10}$ |
| ReLU，PyTorch 默认 | 0.579 | 0.246 | 0.0435 | 0.0402 |
| tanh，$\mathcal{N}(0, 1)$ | 16.1 | 15.6 | 15.5 | 15.6 |
| tanh，$1/n$ | 1.01 | 0.626 | 0.356 | 0.249 |

预测值来自式 6.1。He：第 1 层是 $256\cdot(2/256)\cdot 1 = 2$，标准差为 $\sqrt 2 = 1.414$，之后每层把方差乘以
$256\cdot(2/256)\cdot\tfrac12 = 1$。用 $1/n$ 时，每层把方差乘以 $\tfrac12$，所以标准差为 $2^{-(l-1)/2}$：1、0.707、0.25、0.044。取 $\sigma_w = 0.01$ 时，第 1 层是
$\sqrt{256\cdot 10^{-4}} = 0.16$，之后每层把标准差乘以
$\sqrt{256\cdot 10^{-4}\cdot\tfrac12} = 0.113$，所以第 10 层是 $0.16\cdot 0.113^9 = 4.9\times 10^{-10}$。权重方差为 1 的 tanh 网络起点是 $\sqrt{256} = 16$；它第 10 层的输出中有 87% 落在 $|h| = 0.99$ 之外，那里 $\tanh' < 0.02$。用 $1/n$ 时，tanh 衰减得很慢，因为它是收缩的：$|\tanh z| < |z|$。图 2.10 把测量延伸到 20 层。
:::

::: figure id=fig-02-10
预激活标准差（对数坐标，$10^{-10}$ 到 $10^2$）随层号 1 到 20 的变化，数据来自把例题的脚本扩展到 20 层、宽度 256。ReLU + He 保持在 1.41，是一条水平线；ReLU + $1/n$ 每层下降 $\sqrt 2$ 倍；ReLU + $\mathcal{N}(0, 0.01^2)$ 每层下降到 0.113 倍；ReLU + PyTorch 默认先下降，然后趋于平稳，停在 0.04；tanh + $\mathcal{N}(0, 1)$ 在 16 附近保持水平，标注“饱和：87% 的 $|h| > 0.99$”；tanh + $1/n$ 缓慢衰减。插图给出第 10 层输出的直方图：tanh + $\mathcal{N}(0, 1)$ 在 $\pm 1$ 处有两个尖峰，tanh + $1/n$ 则呈钟形。
:::

### 错误的尺度会造成什么

尺度过大时，tanh 单元饱和：前向信号仍有界，但大多数单元上 $\phi' \approx 0$，梯度消失；而 ReLU 的激活值会呈几何级数增长直至溢出。尺度过小时，信号呈几何级数缩小，于是不论输入是什么，输出都等于偏置。误差在回传时也会缩小，因为它被同样很小的权重相乘，所以前面的层只能得到很小的梯度，训练一开始就处在平台期。[实验 1](#lab1)第 7 步在一个以 $\mathcal{N}(0, 10^{-4})$ 初始化的浅层网络上展示了这个平台期。

### 框架默认值不是 He

PyTorch 的 `nn.Linear` 从 $U(-1/\sqrt{n_{\text{in}}}, 1/\sqrt{n_{\text{in}}})$ 中抽取权重和偏置，权重方差为 $1/(3n_{\text{in}})$。这只有 He 的六分之一。

::: worked title="默认初始化的偏置下限"
权重方差为 $1/(3n)$ 时，每个 ReLU 层把二阶矩乘以 $n\cdot\frac{1}{3n}\cdot\frac12 = \frac16$，同时偏置加上它自己的方差 $1/(3n)$。因此 $z$ 的方差 $v$ 稳定在满足 $v = v/6 + 1/(3n)$ 的位置，即 $\frac56 v = \frac{1}{3n}$，也就是 $v = 0.4/n$。对 $n = 256$，标准差为 $\sqrt{0.4/256} = 0.0395$：与第 10 层的实测值 0.0402 吻合。顶层的信号已经几乎不再依赖输入。
:::

对于没有归一化的深层 ReLU 堆叠，请显式调用 He 初始化器。浅层网络以及带归一化层的网络可以容忍默认值；实验 3 到 5 在深度为 3 时使用默认值。

```python
for m in model.modules():
    if isinstance(m, nn.Linear):
        nn.init.kaiming_normal_(m.weight, nonlinearity="relu")  # std sqrt(2 / fan_in)
        nn.init.zeros_(m.bias)
```

### 残差连接

深层网络还要再加一种手段。**残差连接**（residual connection）
$\mathbf{h}^{(l)} = \mathbf{h}^{(l-1)} + f(\mathbf{h}^{(l-1)})$ 的雅可比矩阵是
$\mathbf{I} + \partial f/\partial\mathbf{h}^{(l-1)}$。于是第 3 节的反向连乘中总含有一条恒等路径，梯度沿这条路径不会消失。此时前向方差变成相加，$\operatorname{Var}(\mathbf{h}^{(l)}) \approx \operatorname{Var}(\mathbf{h}^{(l-1)}) + \operatorname{Var}(f)$，如果每个分支都保持其输入的方差，每经过一个块方差就会翻倍。因此深层残差网络会缩小每个分支最后一层的尺度，或者把它初始化为零，使每个块在起始时接近恒等映射。[模块 03](module_03_ZH.html#s8)通过 ResNet 引入残差连接，[模块 06](module_06_ZH.html#s5)则表明每个 Transformer 块里都有它。

### 输出层

较小的输出尺度会使初始预测接近均匀分布，所以 $K$ 类分类器一开始的损失接近 $\ln K$（数字识别是 $\ln 10 = 2.303$）。检查这一点是[第 14 节](#s14)的第一项测试。

::: keyidea
选择权重方差，使每一层传出的信号大小相同：ReLU 用 $2/n_{\text{in}}$，tanh 约用 $1/n$；任何常数的、过小或过大的尺度，都会在每一层被重复相乘。
:::

::: check
所有权重都从 0.5 而不是零开始。对称性被打破了吗？
:::

::: answer
没有。任何常数初始化都会得到完全相同的单元和完全相同的梯度，它们会一直保持相同；只有随机值才能打破对称性。
:::

::: check
某个 ReLU 层的扇入为 512。He 初始化使用多大的标准差？
:::

::: answer
$\sqrt{2/512} = 0.0625$。
:::

::: check
为什么 Glorot 用 $2/(n_{\text{in}} + n_{\text{out}})$ 而不是 $1/n_{\text{in}}$？
:::

::: answer
保持前向方差需要 $1/n_{\text{in}}$，保持反向方差需要 $1/n_{\text{out}}$；折中方案在两个宽度相近时能近似同时满足两者。
:::

## 梯度下降与动量 {#s7}

固定学习率的普通随机梯度下降很少被直接使用。原因在最简单的损失函数，即二次函数上就能看出来，第一个补救办法动量（momentum）也是如此。本节在二次函数上分析两者，并推导各自能取的最大学习率。

### 二次函数上的梯度下降

[模块 01，第 3 节](module_01_ZH.html#s3)分析过这种情形；这里给出后文所需的形式。取 $\mathcal{L}(\theta) = \tfrac12\theta^\top\mathbf{A}\theta$，其中 $\mathbf{A}$ 为对称正定矩阵，特征值为 $\lambda_1 \le \dots \le \lambda_d$，标准正交特征向量为 $\mathbf{q}_i$。梯度是 $\mathbf{A}\theta$，所以一步为 $\theta \leftarrow (\mathbf{I} - \eta\mathbf{A})\theta$。在特征坐标 $u_i = \mathbf{q}_i^\top\theta$ 下，矩阵是对角的，每个坐标各自演化：

$$
u_i \leftarrow (1 - \eta\lambda_i)\,u_i .
$$

当且仅当 $|1 - \eta\lambda_i| < 1$ 时，坐标 $i$ 收缩，所以当且仅当 $\eta < 2/\lambda_{\max}$ 时所有坐标都收缩。最慢的坐标决定速率 $\max_i|1 - \eta\lambda_i|$，而且只有两个极端特征值在竞争。令二者平衡，$1 - \eta\lambda_{\min} = -(1 - \eta\lambda_{\max})$，得到 $\eta = 2/(\lambda_{\max} + \lambda_{\min})$ 和最佳速率

$$
\rho_{\text{GD}} = \frac{\lambda_{\max} - \lambda_{\min}}{\lambda_{\max} + \lambda_{\min}} = \frac{\kappa - 1}{\kappa + 1},
\qquad \kappa = \frac{\lambda_{\max}}{\lambda_{\min}} .
$$

当 $\kappa$ 很大时，$\ln\rho_{\text{GD}} \approx -2/\kappa$：误差每缩小到原来的 $1/e$ 约需 $\kappa/2$ 步。陡峭方向决定步长，平缓方向决定所需的时间。

在极小点 $\theta^*$ 附近，梯度为零，网络损失的二阶泰勒展开是 $\mathcal{L}(\theta^*) + \tfrac12(\theta - \theta^*)^\top\mathbf{H}(\theta - \theta^*)$，其中海森矩阵 $\mathbf{H}$ 取代了 $\mathbf{A}$。同样的局部限制 $\eta < 2/\lambda_{\max}(\mathbf{H})$ 在此成立。在全 batch 训练中，$\lambda_{\max}(\mathbf{H})$ 倾向于上升，直到约为 $2/\eta$，然后在那里徘徊，而损失仍在不均匀地下降：这就是**稳定性边缘**（edge of stability，Cohen 等 2021）。学习率不仅要顺应曲率；它还塑造了网络最终所处的曲率。

使用 mini-batch 时，梯度等于完整梯度加上零均值噪声，噪声协方差按 $1/B$ 下降（[模块 01，第 4 节](module_01_ZH.html#s4)）。噪声使损失不再单调下降，并留下一个与 $\eta$ 成正比的噪声底；[第 9 节](#s9)会测量它，学习率调度则能消除它。

### 重球动量

**动量**维护一个速度，采用 Polyak（1964）的形式，Rumelhart、Hinton 和 Williams（1986）以及 PyTorch 的 `SGD` 都使用它：

$$
\mathbf{v} \leftarrow \mu\mathbf{v} + \mathbf{g}, \qquad \theta \leftarrow \theta - \eta\mathbf{v},
\qquad \mu \approx 0.9 .
$$

从 $\mathbf{v}_0 = \mathbf{0}$ 展开，$\mathbf{v}_t = \sum_{k=0}^{t-1}\mu^k\mathbf{g}_{t-k}$，是过去梯度的指数加权和。对于恒定的梯度，它趋于 $\mathbf{g}/(1-\mu)$，所以步长趋于 $\eta\mathbf{g}/(1-\mu)$：即**有效学习率**（effective learning rate）$\eta/(1-\mu)$，当 $\mu = 0.9$ 时是 $\eta$ 的十倍。消去 $\mathbf{v}$ 得到等价形式 $\theta_{t+1} = \theta_t - \eta\mathbf{g}_t + \mu(\theta_t - \theta_{t-1})$：一步梯度步，加上上一步位移的 $\mu$ 倍，也就是小球的惯性。图 2.11 展示了在峡谷地形上两者的差别。

::: figure id=fig-02-11
$\mathcal{L} = \tfrac12(\theta_1^2 + 25\theta_2^2)$ 的等高线图（$\kappa = 25$，为了看得清楚），范围 $\theta_1 \in [-2, 0.5]$，$\theta_2 \in [-0.5, 0.5]$，从 $(-1.8, 0.35)$ 出发的两条 40 步路径，每步一个点，极小点已标出。梯度下降取 $\eta = 0.07$，每步把 $\theta_2$ 乘以 $-0.75$，所以它在谷底两侧来回之字形，沿谷底爬行。重球取 $\eta = 0.015$、$\mu = 0.9$（有效速率 $\eta/(1-\mu) = 0.15$），运动平滑，沿谷底方向冲过头，再螺旋收敛。
:::

为什么这样有帮助，用滤波器的角度看最清楚。给递推 $v_t = \mu v_{t-1} + g_t$ 输入一个以频率 $\omega$ 振荡的梯度分量 $g_t = e^{i\omega t}$：$\omega = 0$ 是每一步都相同的分量，$\omega = \pi$ 是每一步都变号的分量。稳态下 $v_t = H(\omega)e^{i\omega t}$；代入得
$H e^{i\omega t} = \mu H e^{i\omega(t-1)} + e^{i\omega t}$，所以

$$
H(\omega) = \frac{1}{1 - \mu e^{-i\omega}}, \qquad |H(0)| = \frac{1}{1-\mu}, \qquad |H(\pi)| = \frac{1}{1+\mu}.
$$

动量是一个低通滤波器。沿峡谷的横向，梯度每一步都变号，被衰减 $1/(1+\mu) = 0.53$ 倍；沿峡谷的纵向，梯度方向一致，被放大 $1/(1-\mu) = 10$ 倍，二者之比是 $(1+\mu)/(1-\mu) = 19$（图 2.12）。

::: worked title="滤波器增益，用迭代验证"
从 $v = 0$ 开始迭代 $v \leftarrow 0.9v + (-1)^t$。稳态下 $v_t = (-1)^tc$，代入得 $c = -0.9c + 1$，所以 $c = 1/1.9 = 0.5263$；迭代 200 次得到 $|v| = 0.5263$。输入恒定时，$c = 0.9c + 1$ 给出 $c = 10$。
:::

::: figure id=fig-02-12
增益 $|H(\omega)| = 1/|1 - \mu e^{-i\omega}|$，纵轴为对数坐标，横轴为 $\omega \in [0, \pi]$，曲线对应 $\mu = 0$、0.5 和 0.9。$\mu = 0.9$ 的两个端点已标注：$\omega = 0$ 处为 10（“方向一致”），$\omega = \pi$ 处为 0.53（“每一步都变号”）。
:::

在二次函数上，这一分析是精确的。沿曲率为 $\lambda$ 的特征向量，等价形式写成 $u_{t+1} = (1 + \mu - \eta\lambda)u_t - \mu u_{t-1}$，这是一个线性递推，其解为 $u_t = r^t$，其中

$$
r^2 - (1 + \mu - \eta\lambda)\,r + \mu = 0 .
$$

两个根之积为 $\mu$，所以当它们是复数时，二者的模都是 $\sqrt\mu$：不论 $\lambda$ 是多少，误差每步都收缩 $\sqrt\mu$ 倍。当且仅当多项式在 $r = 1$ 和 $r = -1$ 处都为正（且 $\mu < 1$）时，两个根都位于单位圆内：在 $r = 1$ 处它等于 $\eta\lambda > 0$，在 $r = -1$ 处它等于 $2(1 + \mu) - \eta\lambda > 0$。因此重球在 $\eta\lambda_{\max} < 2(1 + \mu)$ 时稳定，$\mu = 0.9$ 时这个界是 3.8，梯度下降则是 2。取 $\eta = 4/(\sqrt{\lambda_{\max}} + \sqrt{\lambda_{\min}})^2$ 和
$\mu = \big((\sqrt\kappa - 1)/(\sqrt\kappa + 1)\big)^2$，两个极端特征值就恰好落在复数区域的边缘（代数推导见 Polyak 1964），得到速率
$(\sqrt\kappa - 1)/(\sqrt\kappa + 1)$：误差每缩小到原来的 $1/e$ 约需 $\sqrt\kappa/2$ 步，而不是 $\kappa/2$ 步。

### Nesterov 动量

**Nesterov 动量**在速度即将把参数带到的那个点上计算梯度：
$\mathbf{v} \leftarrow \mu\mathbf{v} + \nabla\mathcal{L}(\theta - \eta\mu\mathbf{v})$，
$\theta \leftarrow \theta - \eta\mathbf{v}$。PyTorch 的 `SGD(nesterov=True)` 使用一种等价改写，在存储的参数处计算梯度，$\mathbf{v} \leftarrow \mu\mathbf{v} + \mathbf{g}$，
$\theta \leftarrow \theta - \eta(\mathbf{g} + \mu\mathbf{v})$。这种前瞻在速度冲过头之前就对其进行修正，在 $\eta$ 适中时 Nesterov 更快。但它并不更稳定。它的特征方程是 $r^2 - (1+\mu)(1-\eta\lambda)\,r + \mu(1-\eta\lambda) = 0$，在 $r = -1$ 处做同样的检验，得到 $\eta\lambda_{\max} < 2(1+\mu)/(1+2\mu)$：$\mu = 0.9$ 时为 1.36，低于梯度下降的 2 和重球的 3.8。

::: worked title="κ = 100 的峡谷上的三种方法"
$\mathcal{L} = \tfrac12(\theta_1^2 + 100\theta_2^2)$，所以 $\lambda_{\min} = 1$，$\lambda_{\max} = 100$。从 $\theta = (1, 1)$ 出发，数一数多少步之后 $\|\theta\| < 10^{-3}\|\theta_0\|$。

梯度下降，取最佳的固定 $\eta = 2/101 = 0.0198$：两个坐标分别乘以 $1 - 0.0198 = 0.980$ 和 $1 - 1.98 = -0.980$，速率为 $99/101$。预测步数为 $\ln 10^{-3}/\ln 0.980 = 345$；模拟结果是 346。取 $\eta = 0.0201$ 时，$\eta\lambda_{\max} = 2.01$：陡峭的坐标每步乘以 $-1.01$，发散。

重球，$\mu = 0.9$，$\eta$ 同上：对 $\lambda = 1$，判别式为 $(1.9 - 0.0198)^2 - 3.6 = -0.065$，对 $\lambda = 100$ 为 $(1.9 - 1.98)^2 - 3.6 = -3.59$；两者都为负，所以两个模态每步都收缩 $\sqrt{0.9} = 0.949$ 倍。包络预测需要 131 步；模拟需要 125 步，因为振荡的误差比它的包络略早一点越过阈值。

重球取最优参数：$\eta = 4/(10 + 1)^2 = 0.0331$，$\mu = (9/11)^2 = 0.669$，速率为 $9/11 = 0.818$，预测步数为 $\ln 10^{-3}/\ln 0.818 = 34$。模拟需要 56 步。在最优参数处，两个极端特征值对应的根重合，二重根使误差在一段时间内表现为 $t\cdot 0.818^t$ 而不是 $0.818^t$。

Nesterov，$\mu = 0.9$：它的界是 $1.357/100 = 0.0136$，所以 $\eta = 0.0198$ 时发散。$\eta = 0.01$ 时它需要 62 步，而重球需要 124 步。
:::

::: widget name=optimiser-paths
用默认设置按下播放（$\kappa = 50$ 的峡谷，$\eta = 0.035$，$\mu = 0.9$）。梯度下降走之字形，因为每步都把陡峭坐标乘以 $1 - 0.035\cdot 50 = -0.75$，大约在第 179 步达到初始损失的 $10^{-6}$；重球约在第 110 步到达，Adam 约在第 126 步。勾选 Nesterov：$\eta = 0.035$ 时它发散（界为 0.027），而 $\eta = 0.025$ 时它最先到达，约在第 55 步。然后把峡谷旋转 45°，注意哪些方法会察觉到这一变化（[第 8 节](#s8)作出解释）。
:::

### 实践中的情形

动量的作用主要是提高有效学习率。在[实验 3](#lab3)的数字识别网络上，普通 SGD 在 $\eta = 0.05$ 时 20 个轮次（epoch）内训练损失始终没有降到 0.1 以下，而 $\eta = 0.5$ 的 SGD 与 $\eta = 0.05$、$\mu = 0.9$ 的 SGD 分别在第 3 轮和第 4 轮就达到了，最终验证准确率相差不超过 0.3 个百分点。在不同库或论文之间转换时，有两个约定需要注意。PyTorch 的动量缓冲没有 $(1-\mu)$ 因子（`dampening=0`），这与 Adam 的一阶矩不同（[第 8 节](#s8)）；在两种形式之间切换，会使有效学习率变化 $1/(1-\mu)$ 倍。动量为 0.9 并配合学习率调度的 SGD 对卷积网络仍然很强（[模块 03](module_03_ZH.html#s10)）；第 8 节的自适应方法则是 Transformer 的默认选择。

::: keyidea
梯度下降的步长受最陡曲率限制，$\eta < 2/\lambda_{\max}$，速度由最平缓的曲率决定，误差每缩小到原来的 $1/e$ 约需 $\kappa/2$ 步；动量对梯度做低通滤波，把它降到约 $\sqrt\kappa/2$ 步。
:::

::: check
$\mu = 0.9$ 时，动量把一个每步都恒定的梯度分量放大多少倍，又把一个每步都变号的分量放大多少倍？
:::

::: answer
$1/(1-\mu) = 10$ 和 $1/(1+\mu) \approx 0.53$。
:::

::: check
在 $\lambda_{\max} = 50$ 的二次函数上以 $\eta = 0.05$ 运行梯度下降。会发生什么？
:::

::: answer
$\eta\lambda_{\max} = 2.5 > 2$：最陡的模态每步乘以 $1 - 2.5 = -1.5$，发散。
:::

::: check
在同一个二次函数上，$\mu = 0.9$ 的重球取 $\eta = 0.05$ 是否稳定？
:::

::: answer
稳定。它的界是 $2(1+\mu)/\lambda_{\max} = 3.8/50 = 0.076$。
:::

## 自适应方法：AdaGrad、RMSProp、Adam 与 AdamW {#s8}

动量改进的是步的方向；它对尺度无能为力。网络各参数的梯度大小可以相差几个数量级：在[实验 3](#lab3)的数字识别网络的第一步，非零梯度分量从 $1.8\times 10^{-7}$ 到 $6.4\times 10^{-2}$ 不等。于是单个 $\eta$ 对一些参数太大，对另一些又太小。自适应方法施加一个对角预条件矩阵，$\theta \leftarrow \theta - \eta\mathbf{D}^{-1}\mathbf{g}$，其中 $\mathbf{D}$ 由梯度自身的历史估计，使每个参数都有自己的步长。

### AdaGrad 与 RMSProp

**AdaGrad**（Duchi、Hazan 和 Singer 2011）逐元素地除以累积平方梯度的平方根：

$$
\mathbf{G} \leftarrow \mathbf{G} + \mathbf{g}^2, \qquad
\theta \leftarrow \theta - \eta\,\frac{\mathbf{g}}{\sqrt{\mathbf{G}} + \epsilon}.
$$

很少被更新的参数保持较大的步长，这适合稀疏特征。但 $\mathbf{G}$ 只增不减：梯度大小大致恒定时，$\sqrt{\mathbf{G}}$ 按 $\sqrt t$ 增长，有效步长按 $1/\sqrt t$ 衰减，所以长时间的非凸训练会停滞。**RMSProp**（Tieleman 和 Hinton 2012，出自一张讲义幻灯片而不是论文）把求和换成指数滑动平均，使其遗忘旧的梯度：

$$
\mathbf{v} \leftarrow \rho\mathbf{v} + (1-\rho)\mathbf{g}^2, \qquad
\theta \leftarrow \theta - \eta\,\frac{\mathbf{g}}{\sqrt{\mathbf{v}} + \epsilon}, \qquad \rho = 0.9 \text{ or } 0.99 .
$$

### Adam

**Adam**（Kingma 和 Ba 2015）在 RMSProp 上加入动量，即梯度的滑动平均，并对两个平均都做了从零启动的修正：

$$
\begin{aligned}
\mathbf{m} &\leftarrow \beta_1\mathbf{m} + (1-\beta_1)\mathbf{g}, &
\mathbf{v} &\leftarrow \beta_2\mathbf{v} + (1-\beta_2)\mathbf{g}^2, \\
\hat{\mathbf{m}} &= \frac{\mathbf{m}}{1-\beta_1^t}, &
\hat{\mathbf{v}} &= \frac{\mathbf{v}}{1-\beta_2^t}, \qquad
\theta \leftarrow \theta - \eta\,\frac{\hat{\mathbf{m}}}{\sqrt{\hat{\mathbf{v}}} + \epsilon},
\end{aligned}
$$

其中 $\beta_1 = 0.9$，$\beta_2 = 0.999$，$\epsilon = 10^{-8}$。大语言模型常取 $\beta_2 = 0.95$，使 $\mathbf{v}$ 能更快地跟上梯度尺度的变化。

**偏差修正（bias correction）。** 取 $\mathbf{m}_0 = \mathbf{0}$，把滑动平均展开得到 $m_t = (1-\beta_1)\sum_{s=1}^{t}\beta_1^{t-s}g_s$。若梯度均值恒定，

$$
\mathbb{E}[m_t] = (1-\beta_1)\,\mathbb{E}[g]\sum_{k=0}^{t-1}\beta_1^k = (1-\beta_1^t)\,\mathbb{E}[g],
$$

这用到了等比级数求和。平均值被偏向零，偏差因子是 $1-\beta_1^t$，除以它就消除了偏差；对 $\beta_2$ 和 $g^2$ 做同样的论证，就得到 $\hat{\mathbf{v}}$。不做修正时，步长 $m/\sqrt v$ 等于修正后的步长乘以 $(1-\beta_1^t)/\sqrt{1-\beta_2^t}$。对 $\beta_2 = 0.999$，这个因子在 $t = 1$ 时是 3.16，在 $t = 12$ 时达到峰值 6.57，到 $t = 1{,}000$ 时仍有 1.26：早期的步长大了好几倍。对 $\beta_2 = 0.95$，它在 $t = 1$ 时是 0.45，从未超过 1.10。误差朝哪个方向，取决于 $\beta_2$ 与 $\beta_1$ 的相对大小（图 2.13）。

::: worked title="恒定梯度下的偏差修正"
取每一步 $g = 0.5$。在 $t = 1$：$m = 0.1\cdot 0.5 = 0.05$，$v = 0.001\cdot 0.25 = 0.00025$。修正后，$\hat m = 0.05/0.1 = 0.5$，$\hat v = 0.00025/0.001 = 0.25$，所以步长是 $\eta\cdot 0.5/\sqrt{0.25} = \eta$。不修正的话，$0.05/\sqrt{0.00025} = 0.05/0.01581 = 3.162$，所以步长是 $3.162\eta$。因子 $(1-0.9^t)/\sqrt{1-0.999^t}$ 在 $t = 1$、10、100 和 1,000 时分别为 3.16、6.53、3.24 和 1.26。
:::

::: figure id=fig-02-13
未修正与已修正步长之比 $(1-\beta_1^t)/\sqrt{1-\beta_2^t}$ 随 $t$ 的变化，横轴为 1 到 $10^4$ 的对数坐标，$\beta_1 = 0.9$。对 $\beta_2 = 0.999$，它从 3.16 升到 $t = 12$ 处的峰值 6.57，然后向 1 下降；对 $\beta_2 = 0.95$，它从 0.45 升到 $t = 20$ 处的峰值 1.10。一条水平线标出 1。
:::

**Adam 的步长是什么。** 参数 $i$ 移动的距离约为 $\eta|\hat m_i|/\sqrt{\hat v_i}$。由于 $\hat v_i$ 估计的是 $\mathbb{E}[g_i^2] = \mathbb{E}[g_i]^2 + \operatorname{Var}(g_i)$，梯度一致时步长约为 $\eta$，梯度有噪声时步长更小。在 $t = 1$ 时，$\hat m = g$ 且 $\hat v = g^2$，所以步长恰为 $\eta g/(|g| + \epsilon) \approx \eta\,\operatorname{sign}(g)$：每个梯度不可忽略的参数都移动 $\eta$。

::: worked title="Adam 在数字识别网络上的第一步"
在[实验 3](#lab3)中，26,122 个参数里，有 615 个在第一步的梯度恰为零：512 个是来自在每张训练图像中都为零的四个像素的第一层权重，另外 103 个是第二层中、在该 batch 上从不同时激活的单元之间的权重。其余参数中，99.96% 的移动量超过 $0.99\eta$，没有一个超过 $\eta$，尽管它们的梯度从 $1.8\times 10^{-7}$ 到 $6.4\times 10^{-2}$ 不等。
:::

这一更新对损失的缩放不变：$\mathbf{g} \to c\mathbf{g}$ 使 $\hat{\mathbf{m}} \to c\hat{\mathbf{m}}$，$\sqrt{\hat{\mathbf{v}}} \to |c|\sqrt{\hat{\mathbf{v}}}$，比值不变（不计 $\epsilon$）。把损失乘以 1,000，SGD 的步长就变成 1,000 倍，所以凡是原先稳定的 $\eta$ 都会发散；Adam 的步长则不变。这就是 Adam 能容忍未缩放损失的原因。它对参数的缩放并不具有不变性，这也是未缩放的输入仍会伤害它的原因（[练习 15](#e15)）。

Adam 还是逐坐标的：它在参数坐标轴方向上均衡尺度，却无法消除旋转方向上的曲率。在 optimiser-paths 控件的峡谷上（[第 7 节](#s7)），谷底与坐标轴对齐时它需要约 126 步，谷底旋转 45° 时需要约 214 步，而梯度下降和重球不受影响。

**内存。** Adam 为每个参数多保存两个数。若权重和梯度为 fp32，则每个参数 $4 + 4 + 4 + 4 = 16$ 字节；若权重和梯度为 bf16，再加一份 fp32 主副本，则同样是 $2 + 2 + 4 + 4 + 4 = 16$ 字节。数字识别网络需要 $26{,}122\cdot 16 = 417{,}952$ 字节，即 418 kB；一个有 $7\times 10^9$ 个参数的模型在还没算任何激活之前就需要 112 GB。完整的核算见[模块 08，第 8 节](module_08_ZH.html#s8)。

### 在 Adam 下，权重衰减不等于 L2

在 SGD 下两者相同。在损失中加上 $(\lambda/2)\|\theta\|^2$，就是在梯度中加上 $\lambda\theta$，于是

$$
\theta \leftarrow \theta - \eta(\mathbf{g} + \lambda\theta) = (1 - \eta\lambda)\,\theta - \eta\mathbf{g},
$$

每一步把权重收缩 $1 - \eta\lambda$ 倍：这就是**权重衰减**（weight decay）。PyTorch 的 `weight_decay=λ` 对应惩罚项 $(\lambda/2)\|\theta\|^2$；模块 01 把惩罚项写成 $\lambda\|\theta\|^2$，系数翻了一倍。

在 Adam 下两者不同（Loshchilov 和 Hutter 2019）。使用 L2 惩罚时，$\mathbf{g} + \lambda\theta$ 进入 $\mathbf{m}$ 和 $\mathbf{v}$，衰减项与其他所有量一样被除以 $\sqrt{\hat{\mathbf{v}}}$：参数 $i$ 每步收缩约 $\eta\lambda\theta_i/\sqrt{\hat v_i}$。梯度历史大的参数被正则化得更少，梯度小的则更多。**AdamW** 把衰减放在归一化之外，

$$
\theta \leftarrow \theta - \eta\left(\frac{\hat{\mathbf{m}}}{\sqrt{\hat{\mathbf{v}}} + \epsilon} + \lambda\theta\right),
$$

使每个参数每步都收缩相同的倍数，并且遵循学习率调度。除非 $\hat{\mathbf{v}}$ 对所有参数都相同，否则任何 L2 系数都无法复现它。

::: worked title="两个权重，两种正则化"
$\eta = 10^{-3}$，$\lambda = 10^{-4}$，两个权重都等于 1，一个的梯度均方根为 10，另一个为 0.1。Adam + L2 每步把它们分别收缩 $\eta\lambda/\sqrt{\hat v} = 10^{-7}/10 = 10^{-8}$ 和 $10^{-7}/0.1 = 10^{-6}$，相差 100 倍：耦合式的收缩量与梯度均方根成反比。AdamW 则不论均方根是多少，都把二者收缩 $\eta\lambda = 10^{-7}$。
:::

在 PyTorch 中，`torch.optim.AdamW` 是解耦形式（默认 `weight_decay=0.01`），`torch.optim.Adam(weight_decay=λ)` 是耦合的 L2 形式（默认 0）；较新的版本还接受 `Adam(..., decoupled_weight_decay=True)`，它就是 AdamW。应当对权重矩阵做衰减，而不是对偏置或归一化的增益，后两者决定偏移和尺度，衰减只会扭曲它们。用两个参数组即可做到：

```python
decay = [p for p in model.parameters() if p.ndim >= 2]      # weight matrices
no_decay = [p for p in model.parameters() if p.ndim < 2]    # biases, norm gains
opt = torch.optim.AdamW([{"params": decay, "weight_decay": 0.01},
                         {"params": no_decay, "weight_decay": 0.0}], lr=2e-3)
print(sum(p.numel() for p in decay), sum(p.numel() for p in no_decay))
```

```output
25856 266
```

对于数字识别网络，25,856 个权重做衰减，266 个偏置不做。Adam 最初的收敛性证明后来被证明有缺陷（Reddi、Kale 和 Kumar 2018）。这个方法在实践中有效，而这就是它的证据。

::: keyidea
Adam 把每个参数的平均梯度除以它自己的滑动均方根，所以不论梯度的尺度如何，每一步都约为 $\eta$；AdamW 再把所有权重按同一个因子 $\eta\lambda$ 衰减，而 Adam 下的 L2 惩罚做不到这一点。
:::

::: check
不做偏差修正且 $\beta_2 = 0.999$ 时，Adam 的早期步长是过大还是过小，为什么？
:::

::: answer
过大。$\beta_2 = 0.999$ 的平均值因从零启动而被压低的程度，远大于 $\beta_1 = 0.9$ 的平均值，所以 $\sqrt v$ 比 $m$ 低估得更多：$t = 1$ 时相差 3.16 倍，$t = 12$ 附近约为 6.5 倍。
:::

::: check
把损失乘以 1,000。SGD 的步长和 Adam 的步长会怎样？
:::

::: answer
SGD 的步长变为 1,000 倍；Adam 的步长不变，只有 $\epsilon$ 带来的差别。
:::

::: check
在 optimiser-paths 控件的峡谷上，谷底与坐标轴对齐时 Adam 需要约 126 步，旋转 45° 后需要约 214 步，而梯度下降和重球不变。为什么？
:::

::: answer
Adam 对每个坐标分别重新缩放。与坐标轴对齐时，这种缩放与曲率相匹配；旋转之后，每个坐标都混合了陡峭方向和平缓方向，任何逐坐标的缩放都无法消除这种混合。梯度下降和动量把梯度向量作为一个整体来处理，所以旋转问题只会旋转它们的路径。
:::

## 学习率调度、范围测试与梯度裁剪 {#s9}

优化器周围有三种手段：调度在训练过程中改变 $\eta$，范围测试找出它的量级，梯度裁剪则限制偶尔出现的巨大梯度。

### 为什么要衰减

[模块 01，第 4 节](module_01_ZH.html#s4)推导过原因。在曲率为 $\lambda$、mini-batch 梯度噪声方差为 $s^2/B$ 的一个二次方向上，恒定步长使迭代点在极小点附近徘徊，其稳态方差为

$$
V = \frac{\eta s^2}{B\lambda(2 - \eta\lambda)} \approx \frac{\eta s^2}{2B\lambda},
$$

额外损失 $\tfrac12\lambda V$ 与 $\eta/B$ 成正比。因此，恒定学习率会让最终模型停在一个带状区域内的随机一点，这个带的宽度由 $\eta$ 决定；衰减 $\eta$ 就能缩小这个带。

::: worked title="噪声底：预测与实测"
取 $\lambda = 1$、$s^2/B = 1$，与模块 01 的例子相同，额外损失为 $\tfrac12 V = \eta/(2(2-\eta))$：$\eta = 0.1$ 时是 $0.1/3.8 = 0.0263$；$\eta = 0.01$ 时是 $0.01/3.98 = 0.0025$。$\eta$ 小十倍，噪声底就低十倍。[实验 3](#lab3) 在一个拟合 $y = \sin 3x$ 加标准差 0.1 的高斯噪声的网络上测量了这一点，真实函数的验证 MSE，即任何模型都无法超越的底线，是 0.0104。恒定 $\eta = 0.05$ 的带动量 SGD 最终验证 MSE 为 0.0130，比底线高 26%，最后五个轮次的标准差为 0.0007；阶梯衰减最终为 0.01041，预热加余弦为 0.01043，都在底线的半个百分点以内。每种调度只跑了一次：恒定调度的超出量的大小只是一条抖动曲线上的一个点，但它的符号和抖动正是上面预测的效应。
:::

### 调度方式

**阶梯衰减**（step decay）在训练的固定比例处，例如 50% 和 75%，把 $\eta$ 乘以 0.1。**余弦衰减**（cosine decay，Loshchilov 和 Hutter 2017）在 $T$ 步内沿半个余弦曲线从 $\eta_{\max}$ 降到 $\eta_{\min}$：

$$
\eta_t = \eta_{\min} + \tfrac12(\eta_{\max} - \eta_{\min})\big(1 + \cos(\pi t/T)\big).
$$

**线性预热**（linear warmup）在前 $T_w$ 步内把 $\eta$ 从接近 0 升到 $\eta_{\max}$，通常占训练的 1–5%，也就是几百到几千步；之后余弦衰减在剩余的 $T - T_w$ 步上进行。预热加余弦、降到峰值的十分之一或更低，是语言模型的默认做法；截至 2026 年，保持峰值、只在接近结束时才衰减的**预热-稳定-衰减**调度也是常见的替代方案（[模块 08，第 6 节](module_08_ZH.html#s6)）。图 2.14 在同一组坐标轴上画出了三种调度。

::: worked title="预热加余弦，逐步计算"
$\eta_{\max} = 3\times 10^{-3}$，$\eta_{\min} = 3\times 10^{-5}$（峰值的 1%），$T = 10{,}000$，$T_w = 500$，所以余弦部分覆盖 9,500 步，进度为 $p = (t - 500)/9{,}500$。

- 第 250 步，处于预热阶段：$3\times 10^{-3}\cdot 250/500 = 1.5\times 10^{-3}$。
- 第 500 步：峰值，$3\times 10^{-3}$。
- 第 2,875 步：$p = 0.25$，$\cos(\pi/4) = 0.7071$，所以
  $\eta = 3\times 10^{-5} + \tfrac12(2.97\times 10^{-3})(1.7071) = 2.565\times 10^{-3}$。
- 第 5,250 步：$p = 0.5$，$\cos(\pi/2) = 0$，所以 $\eta = 3\times 10^{-5} + 1.485\times 10^{-3} = 1.515\times 10^{-3}$。
- 第 7,625 步：$p = 0.75$，$\cos(3\pi/4) = -0.7071$，所以
  $\eta = 3\times 10^{-5} + \tfrac12(2.97\times 10^{-3})(0.2929) = 4.65\times 10^{-4}$。
- 第 10,000 步：$p = 1$，$\eta = \eta_{\min} = 3\times 10^{-5}$。
:::

::: figure id=fig-02-14
同一组坐标轴上 10,000 步内的三种调度，$\eta$ 为线性纵轴：阶梯衰减从 $3\times 10^{-3}$ 出发，在第 5,000 步和第 7,500 步各乘以 $0.1$；不带预热的余弦从 $3\times 10^{-3}$ 降到 $3\times 10^{-5}$；500 步线性预热后接余弦，降到 $3\times 10^{-5}$。例题中第 250、5,250 和 10,000 步的数值已标出。
:::

预热有三个理由。起始时 Adam 的 $\hat{\mathbf{v}}$ 只由少数几个梯度估计，即便经过偏差修正仍有噪声，所以早期步长不稳定（Liu 等 2020）。初始化时的曲率可能很高，所以后来安全的步长在那时就太大了。此外，大 batch SGD 在放大学习率之后需要一个爬升过程：Goyal 等（2017）把 $\eta$ 与 batch 大小成线性比例放大，并用 5 个轮次预热。大 batch 的情形属于[模块 08](module_08_ZH.html#s6)。

### 范围测试

峰值学习率是除架构之外最重要的超参数。**学习率范围测试**（learning-rate range test，Smith 2017）几分钟就能找到它的量级：训练几百步，同时把 $\eta$ 从约 $10^{-6}$ 按几何级数升到 10，记录经指数滑动平均平滑后的损失，并对 $\log\eta$ 作图。曲线在 $\eta$ 太小时是平的，在大约一个数量级的范围内下降得最快，到达最小值，随后陡然上升。选择比最小值小约 3–10 倍、靠近下降最陡处的值作为峰值：完整训练比测试更长也更嘈杂。

::: worked title="数字识别网络上的范围测试"
[实验 3](#lab3) 从 $10^{-5}$ 到 10 运行 200 步，当平滑后的损失超过其最小值的四倍时就停止测试。动量为 0.9 的 SGD 在 $\eta = 0.048$ 附近下降最快，平滑后的最小值为 0.44，在 0.58 处停止。Adam 在 $2.4\times 10^{-3}$ 附近下降最快，最小值为 0.017，在 0.089 处停止。所选的峰值 0.05 和 $2\times 10^{-3}$ 位于下降最陡处，比最小值处小约九倍。实验 3 把两条曲线都画了出来。
:::

在 PyTorch 中，`CosineAnnealingLR(opt, T_max)` 统计的是 `scheduler.step()` 的调用次数：按轮次调用就是轮次，按 batch 调用就是 batch。预热来自 `SequentialLR` 内部的 `LinearLR`，或者来自 `LambdaLR`。请在 `optimizer.step()` 之后调用 `scheduler.step()`。例题中的调度写成代码如下：

```python
from torch.optim.lr_scheduler import CosineAnnealingLR, LinearLR, SequentialLR

opt = torch.optim.AdamW(model.parameters(), lr=3e-3)
total, warm = 10_000, 500
sched = SequentialLR(opt, milestones=[warm], schedulers=[
    LinearLR(opt, start_factor=1e-3, end_factor=1.0, total_iters=warm),
    CosineAnnealingLR(opt, T_max=total - warm, eta_min=3e-5)])   # T_max in batches
```

### 梯度裁剪

按全局范数的**梯度裁剪**（gradient clipping）把所有参数的梯度拼接成一个向量，如果它的范数超过阈值 $c$，就把它重新缩放：$\mathbf{g} \leftarrow c\,\mathbf{g}/\|\mathbf{g}\|$。方向保持不变。Transformer 和循环网络常取 $c = 1.0$（Pascanu、Mikolov 和 Bengio 2013；[模块 04，第 4 节](module_04_ZH.html#s4)）。逐个值分别裁剪（`clip_grad_value_`）会改变方向，是更粗糙的工具。

::: worked title="按范数裁剪与按值裁剪"
$\mathbf{g} = (3, 4)$ 的范数是 5。把范数裁剪到 1 得到 $(3, 4)/5 = (0.6, 0.8)$，与第一个坐标轴的夹角仍是 $\arctan(4/3)$，即 53.1°。把每个值裁剪到 1 得到 $(1, 1)$，夹角为 45°：方向不同了。
:::

即使在步长已被归一化的 Adam 下，裁剪也很重要，因为尖峰仍会进入 $\mathbf{m}$ 和 $\mathbf{v}$。以典型梯度为单位（$g \approx 1$，$m \approx 1$，$v \approx 1$），设某一步来了一个大小为 100 的梯度。则 $v = 0.999 + 0.001\cdot 100^2 = 11.0$，$\sqrt v = 3.3$，所以该参数后续的步长缩小约 3.3 倍。超出的部分按 $10\cdot 0.999^t$ 衰减，时间常数为 $1/(1-\beta_2) = 1{,}000$ 步：$\sqrt v$ 需要约 3,860 步才能回到正常值的 10% 以内。与此同时，$m = 0.9 + 0.1\cdot 100 = 10.9$ 指向尖峰方向，那一步的大小是 $10.9/3.3 \approx 3$ 倍于通常。先裁剪就能同时避免这两种后果。`clip_grad_norm_` 返回裁剪之前的范数：请把它记录下来。如果裁剪在大多数步上都触发，就说明阈值或学习率不对。

```python
loss.backward()
grad_norm = torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)  # pre-clip
opt.step()
sched.step()
```

::: keyidea
用范围测试找出峰值学习率，预热到它，再衰减它来缩小噪声带，并裁剪全局梯度范数，使一次尖峰不会破坏优化器的状态。
:::

::: check
为什么恒定学习率会让最终模型停在“振荡中的一个随机点”？
:::

::: answer
梯度有噪声时，迭代点在极小点附近波动，方差大致与 $\eta$ 成正比；只有减小 $\eta$ 才能减小波动。
:::

::: check
梯度 $(3, 4)$ 分别按全局范数 1 和按值 1 裁剪。结果是什么？
:::

::: answer
$(0.6, 0.8)$，方向不变；以及 $(1, 1)$，方向改变。
:::

::: check
在范围测试中，损失在 $\eta = 0.1$ 时最低，在 0.3 时发散。你选择什么峰值学习率？
:::

::: answer
约 0.01–0.03，比最小值处小 3–10 倍。
:::
