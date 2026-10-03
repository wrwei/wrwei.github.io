## 从固定特征到学习得到的特征 {#s1}

[模块 01](module_01_ZH.html)以手工构造特征上的线性模型作结，即 $f(\mathbf{x}) = \mathbf{w}^\top\boldsymbol{\psi}(\mathbf{x})$。（模块 01 把特征映射写作 $\boldsymbol{\phi}$；本模块把 $\phi$ 留给激活函数。）只有当有人知道 $\boldsymbol{\psi}$ 时，这样的模型才行得通：对于环内的圆盘，$\boldsymbol{\psi}(\mathbf{x}) = (x_1^2, x_2^2, x_1x_2)$ 就能让两个类别线性可分。而对于一幅图像或一条振动频谱，没有人能把 $\boldsymbol{\psi}$ 写出来。**神经网络**（neural network）把特征映射变成模型的一部分，并从数据中学出来：

$$
f(\mathbf{x}) = \mathbf{w}^\top\mathbf{h}(\mathbf{x};\theta), \qquad \mathbf{h} = \phi\big(\mathbf{W}^\top\mathbf{x} + \mathbf{b}\big),
$$

其中 $\mathbf{W}$ 和 $\mathbf{b}$ 与 $\mathbf{w}$ 一起训练，用的是同一种梯度下降。

### 多层感知机

**多层感知机**（multilayer perceptron，MLP）把这样的层堆叠起来。本模块将它写作

$$
\begin{aligned}
\mathbf{h}^{(0)} &= \mathbf{x},\\
\mathbf{z}^{(l)} &= \mathbf{W}^{(l)\top}\mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}, \qquad \mathbf{h}^{(l)} = \phi\big(\mathbf{z}^{(l)}\big), \qquad l = 1, \dots, L-1,\\
\mathbf{z}^{(L)} &= \mathbf{W}^{(L)\top}\mathbf{h}^{(L-1)} + \mathbf{b}^{(L)},
\end{aligned}
$$

其中 $\mathbf{W}^{(l)} \in \mathbb{R}^{d_{l-1}\times d_l}$（每一行对应该层的一个输入，每一列对应一个单元），$\mathbf{b}^{(l)} \in \mathbb{R}^{d_l}$。下文处处沿用这一约定。**激活函数**（activation function）$\phi$ 是逐分量作用的固定非线性函数（[第 5 节](#s5)比较各种选择）。最后一层没有 $\phi$：它的输出 $\mathbf{z}^{(L)}$ 在回归中就是预测值，在分类中就是 **logits** 向量，由损失函数来处理它，即平方误差或 softmax 交叉熵（cross-entropy）（[模块 01，第 5 节](module_01_ZH.html#s5)）。术语如下：$\mathbf{x}$ 是**输入**；第 $1$ 到 $L-1$ 层是**隐藏层**（hidden layer），$\mathbf{h}^{(l)}$ 的每个分量是一个**隐藏单元**（hidden unit）；第 $L$ 层是**输出层**；$d_l$ 是第 $l$ 层的**宽度**（width）；$L$，即权重层的数目，是**深度**（depth）；$\mathbf{z}^{(l)}$ 是**预激活**（pre-activation）。图 2.1 在一个小网络上标出了这些量。

::: figure id=fig-02-1
一个 MLP：输入维度为 2，两个各含 4 个单元的隐藏层，一个输出，从左到右画出，每条连接都画出。每个权重层都标注了本模块约定下的参数形状：$\mathbf{W}^{(1)} \in \mathbb{R}^{2\times 4}$，$\mathbf{b}^{(1)} \in \mathbb{R}^{4}$；$\mathbf{W}^{(2)} \in \mathbb{R}^{4\times 4}$，$\mathbf{b}^{(2)} \in \mathbb{R}^{4}$；$\mathbf{W}^{(3)} \in \mathbb{R}^{4\times 1}$，$b^{(3)} \in \mathbb{R}$。每个隐藏列先计算 $\mathbf{z} = \mathbf{W}^\top\mathbf{h} + \mathbf{b}$，再计算 $\mathbf{h} = \phi(\mathbf{z})$；输出节点是一个 logit 或一个预测值，不带 $\phi$。括号标出宽度（每层的单元数）和深度（$L = 3$ 个权重层）。
:::

### 为什么必须有非线性

没有 $\phi$，深度什么也换不来。两层给出

$$
\mathbf{z}^{(2)} = \mathbf{W}^{(2)\top}\big(\mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)}\big) + \mathbf{b}^{(2)}
= \big(\mathbf{W}^{(1)}\mathbf{W}^{(2)}\big)^\top\mathbf{x} + \big(\mathbf{W}^{(2)\top}\mathbf{b}^{(1)} + \mathbf{b}^{(2)}\big),
$$

这里用到 $\mathbf{B}^\top\mathbf{A}^\top = (\mathbf{A}\mathbf{B})^\top$：结果是一个仿射映射。由归纳法，任意多个仿射层的堆叠都塌缩成一个，所以没有激活函数的深层网络就是带冗余参数的线性模型。

::: worked title="用数字看仿射塌缩"
取 $\mathbf{W}^{(1)} = \begin{bmatrix}1 & 2\\ 0 & 1\end{bmatrix}$（行对应输入），$\mathbf{b}^{(1)} = (1, 0)$，$\mathbf{W}^{(2)} = \begin{bmatrix}1\\ -1\end{bmatrix}$，$b^{(2)} = 0.5$，且没有激活函数。

- 第 1 层：$\mathbf{z}^{(1)} = \mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)} = (x_1 + 1,\; 2x_1 + x_2)$。
- 第 2 层：$z^{(2)} = (x_1 + 1) - (2x_1 + x_2) + 0.5 = -x_1 - x_2 + 1.5$。
- 公式给出同样的结果：$\mathbf{W}^{(1)}\mathbf{W}^{(2)} = (1 - 2,\; 0 - 1)^\top = (-1, -1)^\top$，且 $\mathbf{W}^{(2)\top}\mathbf{b}^{(1)} + b^{(2)} = 1 - 0 + 0.5 = 1.5$。

决策边界 $z^{(2)} = 0$ 是直线 $x_1 + x_2 = 1.5$，再多这样的层也无法把它弯曲。
:::

### 通用近似定理说了什么

有了 $\phi$，原则上一个隐藏层就够了。**通用近似定理**（universal approximation theorem）：设 $\phi$ 连续且不是多项式。对紧集 $K \subset \mathbb{R}^d$ 上的每个连续函数 $f$ 和每个 $\varepsilon > 0$，都存在有限的宽度 $N$ 和一组权重，使单隐藏层网络 $g(\mathbf{x}) = \sum_{j=1}^{N} a_j\,\phi(\mathbf{w}_j^\top\mathbf{x} + b_j) + c$ 满足

$$
\sup_{\mathbf{x}\in K}\,\big|f(\mathbf{x}) - g(\mathbf{x})\big| < \varepsilon.
$$

Cybenko（1989）对 sigmoid 证明了它，Hornik（1991）推广到有界、非常数的激活函数；Leshno 等人（1993）表明“不是多项式”恰好是充要条件，因此 ReLU 也在其内。这个例外不难理解：若 $\phi$ 是 $p$ 次多项式，则每个这样的 $g$ 都是次数至多为 $p$ 的多项式，这是一个固定的函数族，无法任意接近 $\sin 3x$。

这个定理说的比看上去的要少。它没有说 $N$ 要多大：构造性的证明实际上是用网格铺满 $K$，而 $d$ 维空间中间距为 $h$ 的网格约有 $h^{-d}$ 个单元格，所以单元数可能随 $d$ 指数增长。它没有说从随机初始点出发的梯度下降能找到这样的权重。它也没有说拟合有限个样本得到的网络能够泛化。本模块其余部分讨论第二个问题；[模块 01 第 10 节](module_01_ZH.html#s10)的评估规范则针对第三个问题。

### 一维情形下的构造性证明

在一维中，权重可以直接写出来。取节点 $a = x_0 < x_1 < \dots < x_K = b$，令 $p$ 为 $f$ 的分段线性插值，它在第 $k$ 段上的斜率为 $s_k = \big(f(x_{k+1}) - f(x_k)\big)/(x_{k+1} - x_k)$。在 $[a, b]$ 上，

$$
p(x) = f(x_0) + \sum_{k=0}^{K-1} c_k\,\operatorname{ReLU}(x - x_k), \qquad c_0 = s_0, \quad c_k = s_k - s_{k-1}.
$$

在第一段上只有第一个铰链处于激活状态，所以 $p$ 从 $f(x_0)$ 出发，斜率为 $s_0$；之后每个铰链在其节点处打开，并使斜率恰好改变 $c_k$。这就是一个含 $K$ 个单元的单隐藏层 ReLU 网络：输入权重为 1，偏置为 $-x_k$，输出权重为 $c_k$，输出偏置为 $f(x_0)$。

它的误差来自线性插值的余项。固定 $[x_k, x_{k+1}]$ 段中的 $x$，段长为 $h$，选常数 $C$，使 $e(u) = f(u) - p(u) - C(u - x_k)(u - x_{k+1})$ 在 $u = x$ 处为零。那么 $e$ 有三个零点 $x_k$、$x$ 和 $x_{k+1}$，所以两次应用罗尔定理，得到某个 $\xi$ 使 $e''(\xi) = f''(\xi) - 2C = 0$；于是 $f(x) - p(x) = \tfrac12 f''(\xi)(x - x_k)(x - x_{k+1})$。这个乘积的绝对值在中点处最大，为 $h^2/4$，所以令 $M = \max|f''|$，

$$
|f(x) - p(x)| \le \frac{M h^2}{8}.
$$

要达到精度 $\varepsilon$，需要 $h \le \sqrt{8\varepsilon/M}$：在一维中，所需单元数正比于 $\varepsilon^{-1/2}$。

::: worked title="逼近 sin 3x 的 22 个铰链"
在 $[-1, 1]$ 上逼近 $f(x) = \sin 3x$，也就是[实验 1](#lab1) 拟合的函数。这里 $f''(x) = -9\sin 3x$，所以 $M = 9$；取 $K$ 个等长段，$h = 2/K$，界为 $9(2/K)^2/8 = 4.5/K^2$。在 200 万个点上测得的最大误差如下：

| $K$ | 界 $4.5/K^2$ | 实测最大误差 |
|---|---|---|
| 6 | 0.125 | 0.122 |
| 16 | 0.0176 | 0.0174 |
| 21 | 0.0102 | 0.0101 |
| 22 | 0.0093 | 0.0093 |

所以 22 个等长段是达到 $\varepsilon = 0.01$ 所需的最少段数。当 $K = 6$ 时，节点为 $-1, -\tfrac23, \dots, 1$，六个斜率为 $(-2.305, 0.203, 2.524, 2.524, 0.203, -2.305)$，铰链系数为 $c = (-2.305, 2.508, 2.321, 0, -2.321, -2.508)$。第四个恰好为零：$\sin 3x$ 是奇函数，所以 $x = 0$ 两侧的斜率相等（2.524），5 个单元就够了（图 2.2）。同样的对称性对每个偶数 $K$ 都去掉 0 处的铰链，所以 21 个单元就能达到 $\varepsilon = 0.01$。对比实验 1：在 64 个单元上做梯度下降，3,000 步后训练均方误差为 $2.8\times10^{-4}$（RMS 误差 0.017）：单元数是三倍，拟合更差，而且事先不能保证它至少能走到这一步。
:::

::: figure id=fig-02-2
上图：$[-1, 1]$ 上的 $\sin 3x$（实线）及其 6 段分段线性插值（虚线），7 个节点用圆点标出，并标注最大误差 0.122。下图：铰链函数 $c_k\operatorname{ReLU}(x - x_k)$，$k = 0, \dots, 5$，每个节点一种颜色，图例中给出 $c = (-2.305, 2.508, 2.321, 0, -2.321, -2.508)$；$k = 3$ 的铰链是平的，因为 $c_3 = 0$。$f(-1)$ 加上六个铰链之和，就是上图的虚线插值。
:::

### 深度为什么有帮助

这一构造每个线性段花费一个单元。对某些函数，深度要高效得多。$[0, 1]$ 上的**帐篷映射**（tent map）用两个 ReLU 单元：

$$
t(x) = 2\operatorname{ReLU}(x) - 4\operatorname{ReLU}\big(x - \tfrac12\big) =
\begin{cases} 2x, & 0 \le x \le \tfrac12,\\ 2 - 2x, & \tfrac12 < x \le 1. \end{cases}
$$

它把 $[0, 1]$ 的每一半都映满整个 $[0, 1]$，前一半上升，后一半下降，所以再作用一次，就把每个线性段对折：$k$ 重复合 $t^k$ 是一个有 $2^k$ 段的锯齿波（Telgarsky 2016）。作为网络，$t^k$ 是 $k$ 层、每层 2 个单元。第一层有 2 个权重和 2 个偏置；之后每一层通过 4 个权重和 2 个偏置读取上一层的一对输出 $(h_1, h_2)$，因为 $t = 2h_1 - 4h_2$ 是这一对输出的线性函数；输出 $2h_1 - 4h_2$ 需要 2 个权重和 1 个偏置。合计：$2k$ 个单元，$4 + 6(k - 1) + 3 = 6k + 1$ 个参数。

标量输入上的单隐藏层 ReLU 网络 $g(x) = \sum_j a_j\operatorname{ReLU}(w_jx + b_j) + c$，只在某个单元切换的地方改变斜率，即 $x = -b_j/w_j$ 处。有 $n$ 个单元时，它至多有 $n$ 个断点，因而至多有 $n + 1$ 段。因此表示 $t^k$ 至少需要 $2^k - 1$ 个单元和 $3(2^k - 1) + 1$ 个参数（每个单元有一个输入权重、一个偏置和一个输出权重，外加 $c$）。复合在每一段上重用同样的两个单元；宽度则要为每一段分别付出代价。

::: worked title="数一数锯齿"
在 $[0, 1]$ 上取 $2^{12} + 1$ 个点的网格，细到足以包含每个断点，则对 $k = 1, \dots, 6$，$t^k$ 分别有 2、4、8、16、32 和 64 个线性段。参数数量如下：

| $k$ | 深层：$2k$ 个单元，$6k + 1$ 个参数 | 单隐藏层：至少 |
|---|---|---|
| 4 | 8 个单元，25 个参数 | 15 个单元，46 个参数 |
| 10 | 20 个单元，61 个参数 | 1,023 个单元，3,070 个参数 |
| 20 | 40 个单元，121 个参数 | 1,048,575 个单元，3,145,726 个参数 |

深层的代价随 $k$ 线性增长，浅层的代价则呈指数增长（图 2.3）。
:::

::: figure id=fig-02-3
左：$[0, 1]$ 上的四个小图，分别是 $t$、$t\circ t$、$t^3$ 和 $t^4$，标注为 2、4、8 和 16 段。右：深层构造（$k$ 层，每层 2 个 ReLU 单元，$6k + 1$ 个参数）与单隐藏层方案（$2^k - 1$ 个单元，$3(2^k - 1) + 1$ 个参数）并排，以及 $k = 4$、10 和 20 时的参数数量表：25 对 46，61 对 3,070，121 对 3,145,726。
:::

这个论证所表明的是：存在这样的函数，深层网络表示它的代价比浅层网络低指数倍；更一般地，ReLU 网络能产生的线性区域数随深度指数增长（Montúfar 等人 2014）。它并没有表明你关心的函数属于这一类，也没有表明梯度下降能找到这种深层构造。深度也有代价：梯度必须穿过每一层往回传，而[第 3 节](#s3)会说明它在途中如何消失，[第 5 节](#s5)、[第 6 节](#s6)和[第 10 节](#s10)处理这个问题。支持深度的非正式理由是：真实数据看上去具有组合结构，边缘组成纹理，纹理组成部件（[模块 03](module_03_ZH.html)），而简单映射的复合正好契合这种结构。

### 隐藏单元学到了什么

第一层的 ReLU 单元计算 $\operatorname{ReLU}(\mathbf{w}^\top\mathbf{x} + b)$：在直线 $\mathbf{w}^\top\mathbf{x} + b = 0$ 的一侧为零，在另一侧随到直线的距离线性上升，沿这条直线为常数。它是一个**脊函数**（ridge function），即半平面上的一个斜坡。输出层用权重把这些斜坡相加，所以 logit 是分段线性的，决策边界（logit 为零处）是一个多边形。三个斜坡可以用一个三角形围住圆盘；两个只能形成一个楔形，什么也围不住。

::: widget name=mlp-playground
在 circles 数据上点击 Play，观察八个缩略图变成半平面斜坡，它们的和在内部圆盘周围闭合成一个多边形。然后试三个实验：把隐藏层设为 0（准确率停在 50% 附近）；选择激活函数“none”并设三个隐藏层（得到同样的一条直线）；把单元数设为 2，再设为 3（楔形围不住圆盘，三角形可以）。
:::

::: worked title="用数字看 playground"
这些数字来自对该组件规格的 NumPy 模拟（circles 数据，200 个训练点，Adam，$\eta = 0.03$）；组件生成随机数的方式不同，所以具体数字会有出入。

- 没有隐藏层：训练准确率 53.5%，损失 0.692，基本等于 $\ln 2 = 0.693$：即随机猜测。
- 三个隐藏层，恒等激活：准确率同样恰好是 53.5%，这就是本节所说的塌缩。
- 一个含 2 个 ReLU 单元的隐藏层：84.5%（两个半平面围不住圆盘）。3 个单元：约 245 步后达到 100%（一个三角形）。8 个单元：约 58 步后达到 100%。
- 双臂螺旋：两个各含 16 个单元的隐藏层（337 个参数）约 740 步拟合训练集，一个含 64 个单元的隐藏层（257 个参数）约 2,430 步，一个含 128 个单元的隐藏层（513 个参数）约 1,830 步；一个含 16 个单元的隐藏层在 3,000 步内只达到 74%。

用八个不同的数据和初始化种子重复 circles 实验，可以看出这类数字波动有多大。两个单元的准确率在 70% 到 90% 之间。三个单元在八次运行中有五次在 1,000 步内找到三角形，另外三次停滞：三角形每次都存在，但梯度下降并不总能找到它。八个单元总是成功，用 61 到 235 步。螺旋的对比说明了深度的作用，但并不证明什么。
:::

::: keyidea
隐藏层就是学出来的特征映射。没有非线性，任意深度都塌缩成一个仿射映射；有了非线性，单个隐藏层就能逼近任意连续函数，但没有任何保证说网络会很小，或者训练能找到它。
:::

::: check
一个有三个隐藏层但没有激活函数的网络，在 circles 数据上训练。它能表示什么样的决策边界？
:::

::: answer
只有直线。仿射映射的复合仍是仿射的，所以这个网络就是多了些参数的逻辑回归。
:::

::: check
一个含 5 个隐藏单元的单隐藏层 ReLU 网络，输入是标量。它的输出至多有多少个线性段？
:::

::: answer
六个。每个单元至多增加一个断点，位于 $x = -b/w$，5 个断点至多把直线切成 6 段。
:::

::: check
通用近似定理是否保证，在足够宽的网络上做梯度下降就能拟合给定的连续函数？
:::

::: answer
不保证。它只保证合适的权重存在。它对如何找到这些权重没有任何说明，对从有限数据泛化也没有任何说明。
:::

## 带形状的前向传播 {#s2}

第 1 节把一个样本写成列向量。训练一次处理 $B$ 个样本组成的一个 **batch**，把它们堆成矩阵的各行。网络代码中的大多数 bug 都是形状 bug，所以本节把每个形状都写下来。它还统计前向传播在参数、运算量和内存上的开销，因为本系列后面所有的开销估算都从这些计数出发。

### batch 形式

令 $\mathbf{H}^{(0)} = \mathbf{X} \in \mathbb{R}^{B\times d_0}$，每行一个样本，

$$
\mathbf{Z}^{(l)} = \mathbf{H}^{(l-1)}\mathbf{W}^{(l)} + \mathbf{1}\mathbf{b}^{(l)\top} \in \mathbb{R}^{B\times d_l}, \qquad \mathbf{H}^{(l)} = \phi\big(\mathbf{Z}^{(l)}\big),
$$

其中 $\mathbf{1} \in \mathbb{R}^{B}$ 是全 1 向量，所以 $\mathbf{1}\mathbf{b}^{(l)\top}$ 把偏置复制到每一行。$\mathbf{Z}^{(l)}$ 的第 $i$ 行是 $\mathbf{h}_i^{(l-1)\top}\mathbf{W}^{(l)} + \mathbf{b}^{(l)\top}$，即第 1 节 $\mathbf{W}^{(l)\top}\mathbf{h}_i^{(l-1)} + \mathbf{b}^{(l)}$ 的转置：计算相同，只是样本按行而不是按列排列。在 NumPy 中偏置不需要复制：把形状为 `(d_l,)` 的数组加到形状为 `(B, d_l)` 的数组上，会沿行**广播**（broadcast）。输出 $\mathbf{Z}^{(L)} \in \mathbb{R}^{B\times K}$ 为每个样本给出一行 $K$ 个 logits；softmax 发生在损失函数内部（[第 12 节](#s12)），绝不作为它前面的一层。

```python
import numpy as np

rng = np.random.default_rng(0)
sizes = [64, 128, 128, 10]                         # d0 ... d3: the digits network
params = [(rng.normal(0, np.sqrt(2 / m), (m, n)), np.zeros(n))    # W is (d_{l-1}, d_l)
          for m, n in zip(sizes[:-1], sizes[1:])]

X = rng.normal(size=(64, sizes[0]))                # a batch: B = 64 rows
H = X
for l, (W, b) in enumerate(params, start=1):
    Z = H @ W + b                                  # (B, d_{l-1}) @ (d_{l-1}, d_l) + (d_l,)
    assert Z.shape == (X.shape[0], W.shape[1])
    H = np.maximum(Z, 0) if l < len(params) else Z     # no activation on the logits
print(H.shape, sum(W.size + b.size for W, b in params))
```

```output
(64, 10) 26122
```

### 参数、FLOPs 与内存

第 $l$ 层有 $d_{l-1}d_l$ 个权重和 $d_l$ 个偏置，所以网络共有 $\sum_{l=1}^{L}(d_{l-1}d_l + d_l)$ 个参数。一个 $(B\times m)$ 矩阵与一个 $(m\times n)$ 矩阵相乘，要算 $Bn$ 个长度为 $m$ 的点积：$Bmn$ 次乘法和差不多同样多的加法，即 $2Bmn$ 次**浮点运算**（floating-point operations，FLOPs）。对各层求和，前向传播约花费权重数的 $2B$ 倍：每个权重对每个样本参与一次乘法和一次加法。偏置加法和激活每层花费 $O(Bd_l)$，对宽层而言，与 $Bd_{l-1}d_l$ 相比可以忽略。大模型前向传播每个 token 约花费 $2N$ FLOPs 的经验法则就来源于此。

本系列把这类计数的约定一次定下，见[模块 06 第 11 节](module_06_ZH.html#s11)：在 FLOP 计数中，$N$ 指参与矩阵乘法的权重（嵌入查表不花 FLOPs），注意力另加一项，随上下文增长，一个训练步按三次前向传播计（[第 3 节](#s3)说明为什么反向传播至多花两次）。相比之下，内存要计入每一个参数。

反向传播（[第 3 节](#s3)）需要每一层的输入 $\mathbf{H}^{(l-1)}$ 和预激活 $\mathbf{Z}^{(l)}$（或足以计算 $\phi'$ 的信息），所以为训练而做的前向传播要存储 $O(B\sum_l d_l)$ 个数。参数只存一份；激活则 batch 中每个样本存一份，这就是为什么激活内存随 batch 大小乘以深度增长。字节单位遵循本系列的约定：kB、MB 和 GB 是十进制（$10^3$、$10^6$ 和 $10^9$ 字节）；KiB、MiB 和 GiB 是二进制（$2^{10}$、$2^{20}$ 和 $2^{30}$ 字节）。

::: worked title="第 2 到 4 节使用的小网络"
两个输入，两个 ReLU 隐藏单元，一个线性输出，平方误差：$\mathbf{x} = (2, 1)$；$\mathbf{W}^{(1)} = \begin{bmatrix}0.5 & -1.0\\ 0.25 & 0.5\end{bmatrix}$（行对应输入，列对应隐藏单元），$\mathbf{b}^{(1)} = (0.1, 0)$；$\mathbf{W}^{(2)} = \begin{bmatrix}0.8\\ -0.6\end{bmatrix}$，$b^{(2)} = 0.2$；目标 $t = 1$；损失 $(\hat y - t)^2$。

- 第 1 层：$\mathbf{z}^{(1)} = \mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)} = (0.5\cdot 2 + 0.25\cdot 1 + 0.1,\; -1.0\cdot 2 + 0.5\cdot 1 + 0) = (1.35, -1.5)$。
- ReLU：$\mathbf{h}^{(1)} = (1.35, 0)$。第二个单元未激活。
- 第 2 层：$\hat y = 0.8\cdot 1.35 - 0.6\cdot 0 + 0.2 = 1.28$。
- 损失：$(1.28 - 1)^2 = 0.28^2 = 0.0784$。

共九个参数（$4 + 2 + 2 + 1$）。按 $B = 1$ 的 $2Bmn$ 计数，两次乘积花费 12 FLOPs：第 1 层 $2\cdot 2\cdot 2 = 8$，第 2 层 $2\cdot 2\cdot 1 = 4$，另加 3 次偏置加法。当作只含一个样本的 batch，$\mathbf{X} = [\,2\;\;1\,]$，$\mathbf{X}\mathbf{W}^{(1)} + \mathbf{b}^{(1)\top} = [\,1.35\;\;{-1.5}\,]$：数字与列形式相同，只是写成一行。
:::

::: worked title="实验 3 到 5 的 digits 网络"
网络 $64 \to 128 \to 128 \to 10$ 有
$64\cdot 128 + 128 + 128\cdot 128 + 128 + 128\cdot 10 + 10 = 8{,}320 + 16{,}512 + 1{,}290 = 26{,}122$
个参数（fp32 下 104,488 字节，每个 4 字节），其中 25,856 个是权重。前向传播每个样本花费 $2\times 25{,}856 = 51{,}712$ FLOPs。对于 64 个样本的 batch：

- 第 1 层：$2\cdot 64\cdot 64\cdot 128 = 1{,}048{,}576$；
- 第 2 层：$2\cdot 64\cdot 128\cdot 128 = 2{,}097{,}152$；
- 第 3 层：$2\cdot 64\cdot 128\cdot 10 = 163{,}840$；

合计 3,309,568，约 3.3 MFLOPs。为反向传播存储的内容，在 $B = 64$ 时包括：输入、两个隐藏层的 $\mathbf{Z}$ 和 $\mathbf{H}$，以及 logits，共 $(64 + 2\cdot 128 + 2\cdot 128 + 10)\times 64\times 4 = 150{,}016$ 字节。激活占用的内存已经超过参数。图 2.4 给出这些形状和开销。
:::

::: figure id=fig-02-4
$B = 64$ 时 digits 网络的 batch 前向传播。$\mathbf{X}$（$64\times 64$，标注为 $B\times d_0$）乘以 $\mathbf{W}^{(1)}$（$64\times 128$），再加上沿行向下复制（广播）的偏置行 $\mathbf{b}^{(1)\top}$（$1\times 128$），得到 $\mathbf{Z}^{(1)}$（$64\times 128$）；$\phi$ 把它映射为 $\mathbf{H}^{(1)}$。然后 $\mathbf{H}^{(1)}\mathbf{W}^{(2)}$ 给出 $\mathbf{Z}^{(2)}$ 和 $\mathbf{H}^{(2)}$，$\mathbf{H}^{(2)}\mathbf{W}^{(3)}$ 给出 logits（$64\times 10$）。每个乘积下方标出其开销：$2\cdot 64\cdot 64\cdot 128 = 1{,}048{,}576$、$2\cdot 64\cdot 128\cdot 128 = 2{,}097{,}152$ 和 $2\cdot 64\cdot 128\cdot 10 = 163{,}840$ FLOPs。为反向传播保留的张量用阴影标出。
:::

::: worked title="激活占主导的情形"
一个 50 层、宽度 1,024 的 MLP 有 $50\times(1{,}024^2 + 1{,}024) = 52{,}480{,}000$ 个参数，fp32 下 210 MB。对 batch 为 256，存储每层的 $\mathbf{Z}$ 和 $\mathbf{H}$ 需要 $2\times 50\times 256\times 1{,}024\times 4 = 104{,}857{,}600$ 字节，恰好 100 MiB（105 MB）；batch 为 4,096 时是它的 16 倍，1.6 GiB（1.7 GB）。一旦 batch 很大，决定训练内存的就是激活，而不是参数。在另一端，一个有 $7\times 10^9$ 个参数的模型，前向传播每个 token 大约需要 $2\times 7\times 10^9 = 1.4\times 10^{10}$ FLOPs，这一估计把每个参数都当作矩阵权重，并忽略注意力；模块 06 第 11 节会对它做细化。
:::

### 实践中的形状

PyTorch 的 `nn.Linear(d_in, d_out)` 把权重存成 `(d_out, d_in)` 张量，计算 $\mathbf{X}\mathbf{W}^\top + \mathbf{b}$。数学上完全相同，只是存储布局不同，在 NumPy 和 PyTorch 之间复制权重时这一点很要紧。[实验 1](#lab1) 正是出于这个原因把 `W1.T` 复制进 PyTorch 的层。

```python
import torch, torch.nn as nn

layer = nn.Linear(64, 128)                         # PyTorch stores (d_out, d_in)
print(tuple(layer.weight.shape), tuple(layer.bias.shape))

pred, t = torch.zeros(256, 1), torch.zeros(256)    # (B, 1) against (B,)
print(tuple((pred - t).shape))                     # broadcast, silently
```

```output
(128, 64) (128,)
(256, 256)
```

在每个数组旁边写下它的形状，写在注释里或写成 `assert`。第二个 print 显示了回归中最常见的静默形状 bug：形状为 `(B, 1)` 的预测减去形状为 `(B,)` 的目标，会广播成 `(B, B)`，即每个预测对每个目标。NumPy 毫无提示地算出结果。PyTorch 的 `F.mse_loss` 会警告：“Using a target size (torch.Size([256])) that is different to the input size (torch.Size([256, 1])). This will likely lead to incorrect results due to broadcasting”，然后继续运行。模型于是学到错误的东西。对预测 $\hat y_i$，在所有目标上的均值是 $\frac1B\sum_j(\hat y_i - t_j)^2 = (\hat y_i - \bar t)^2 + \operatorname{Var}(t)$，所以当每个预测都等于目标均值 $\bar t$ 时损失最小，与输入无关，此时损失等于目标的方差。

::: worked title="实测广播陷阱"
实验 1 的网络用 PyTorch 实现（`nn.Linear(1, 64)`、ReLU、`nn.Linear(64, 1)`），在 `torch.manual_seed(0)` 之后抽取 256 个点，拟合 $t = \sin 3x$，目标形状为 `(256,)`，预测形状为 `(256, 1)`，用 Adam，$\eta = 10^{-2}$，训练 2,000 步。每一步都会触发警告（Python 只打印一次）。预测塌缩成常数，256 个输入上的标准差为 0.0006，“损失”稳定在 0.5174：恰好是目标的方差，与上面的公式所预测的一致。
:::

::: check
$\mathbf{X}$ 的形状是 $(32, 64)$，$\mathbf{W}^{(1)}$ 的形状是 $(64, 128)$。$\mathbf{Z}^{(1)}$ 的形状是什么？这个乘积花费多少？
:::

::: answer
$(32, 128)$，花费 $2\cdot 32\cdot 64\cdot 128 = 524{,}288$ FLOPs。
:::

::: check
一个回归模型输出形状为 $(B, 1)$，目标形状为 $(B,)$。NumPy 对 `(pred - t) ** 2` 会算出什么？以其均值为损失训练的模型会学到什么？
:::

::: answer
一个 $(B, B)$ 矩阵，由所有成对差的平方构成。它的均值在“处处预测目标均值”时最小，所以模型忽略输入，损失停在目标的方差上。
:::

## 反向传播：四个方程 {#s3}

梯度下降需要每一层的 $\partial\mathcal{L}/\partial\mathbf{W}^{(l)}$ 和 $\partial\mathcal{L}/\partial\mathbf{b}^{(l)}$。**反向传播**（backpropagation）是经过组织的链式法则，使每一层的梯度都由下一层的梯度算出，只需一次反向扫描，代价与前向传播相当。本节推导它，使反向传播的每一行都能手工写出、检验和估算开销。

### 矩阵微积分，够用即可

标量对向量或矩阵的梯度，与该向量或矩阵形状相同。对于 $\mathbf{y} = f(\mathbf{x})$，$\mathbf{y} \in \mathbb{R}^m$，$\mathbf{x} \in \mathbb{R}^n$，**雅可比矩阵**（Jacobian）$\mathbf{J} \in \mathbb{R}^{m\times n}$ 的元素为 $J_{ij} = \partial y_i/\partial x_j$。链式法则把雅可比矩阵复合起来，$\mathbf{J}_{g\circ f} = \mathbf{J}_g\mathbf{J}_f$，对标量损失，它写成

$$
\frac{\partial\mathcal{L}}{\partial x_j} = \sum_i \frac{\partial\mathcal{L}}{\partial y_i}\,\frac{\partial y_i}{\partial x_j}
\quad\Longrightarrow\quad \nabla_{\mathbf{x}}\mathcal{L} = \mathbf{J}_f^\top\,\nabla_{\mathbf{y}}\mathcal{L}.
$$

由此得到三个事实，本节只用这三个。

1. 对 $\mathbf{z} = \mathbf{W}^\top\mathbf{h} + \mathbf{b}$，$z_j = \sum_i W_{ij}h_i + b_j$，所以 $\partial z_j/\partial h_i = W_{ij}$：雅可比矩阵是 $\mathbf{W}^\top$，且 $\nabla_{\mathbf{h}}\mathcal{L} = \mathbf{W}\,\nabla_{\mathbf{z}}\mathcal{L}$。
2. $W_{ij}$ 只出现在 $z_j$ 中，系数为 $h_i$，所以 $\partial\mathcal{L}/\partial W_{ij} = h_i\,\partial\mathcal{L}/\partial z_j$：$\nabla_{\mathbf{W}}\mathcal{L} = \mathbf{h}\,(\nabla_{\mathbf{z}}\mathcal{L})^\top$，是一个外积。
3. 对逐元素的 $\mathbf{h} = \phi(\mathbf{z})$，$h_i$ 只依赖于 $z_i$，所以雅可比矩阵是 $\operatorname{diag}(\phi'(\mathbf{z}))$，且 $\nabla_{\mathbf{z}}\mathcal{L} = \nabla_{\mathbf{h}}\mathcal{L}\odot\phi'(\mathbf{z})$，其中 $\odot$ 是逐元素乘积。

拿不准转置放在哪里时，检查形状：$\nabla_{\mathbf{W}}\mathcal{L}$ 必须是 $d_{\text{in}}\times d_{\text{out}}$，$\mathbf{h}$ 的长度是 $d_{\text{in}}$，$\nabla_{\mathbf{z}}\mathcal{L}$ 的长度是 $d_{\text{out}}$，只有 $\mathbf{h}(\nabla_{\mathbf{z}}\mathcal{L})^\top$ 具有这个形状。

### 误差信号与输出处的方程

把第 $l$ 层的**误差信号**（error signal）定义为损失对其预激活的梯度，针对一个样本：$\boldsymbol{\delta}^{(l)} = \partial\mathcal{L}/\partial\mathbf{z}^{(l)} \in \mathbb{R}^{d_l}$。

**方程 1，在输出处。**对于 softmax 交叉熵，$\mathcal{L} = -\sum_k y_k\ln\hat p_k$，其中 $\hat{\mathbf{p}} = \softmax(\mathbf{z})$，$\mathbf{y}$ 为独热向量。[模块 01 第 6 节](module_01_ZH.html#s6)是分情形推导这个梯度的；借助雅可比矩阵，两行就够了。对 $\hat p_k = e^{z_k}/\sum_m e^{z_m}$ 求导，得 $\partial\hat p_k/\partial z_j = \hat p_k([k = j] - \hat p_j)$，其中 $[k = j]$ 在 $k = j$ 时为 1，否则为 0：softmax 的雅可比矩阵是 $\operatorname{diag}(\hat{\mathbf{p}}) - \hat{\mathbf{p}}\hat{\mathbf{p}}^\top$。于是

$$
\frac{\partial\mathcal{L}}{\partial z_j} = -\sum_k \frac{y_k}{\hat p_k}\,\hat p_k\big([k = j] - \hat p_j\big)
= -y_j + \hat p_j\sum_k y_k = \hat p_j - y_j,
$$

因为 $\sum_k y_k = 1$。所以 $\boldsymbol{\delta}^{(L)} = \hat{\mathbf{p}} - \mathbf{y}$，与逻辑回归中的 $\hat p - y$ 相同，其各项之和为零。对线性输出上的平方误差 $(\hat y - y)^2$，$\delta^{(L)} = 2(\hat y - y)$。当损失在一个 batch 上取平均时，每个样本的 $\boldsymbol{\delta}$ 带有一个因子 $1/B$。

::: worked title="用数字算 softmax 交叉熵"
Logits $\mathbf{z} = (2.0, 1.0, 0.1)$，真实类别为 0。指数为 $(7.389, 2.718, 1.105)$，和为 11.213，所以 $\hat{\mathbf{p}} = (0.6590, 0.2424, 0.0986)$。损失为 $-\ln 0.6590 = 0.4170$，$\boldsymbol{\delta} = \hat{\mathbf{p}} - \mathbf{y} = (-0.3410, 0.2424, 0.0986)$，和为零：提高真实类别的 logit 会降低损失，提高另外任何一个的 logit 都会使损失升高。
:::

### 方程 2，层与层之间

第 $l + 1$ 层计算 $\mathbf{z}^{(l+1)} = \mathbf{W}^{(l+1)\top}\phi(\mathbf{z}^{(l)}) + \mathbf{b}^{(l+1)}$。事实 1 把误差从 $\mathbf{z}^{(l+1)}$ 传回 $\mathbf{h}^{(l)}$，事实 3 再把它传过 $\phi$：

$$
\boldsymbol{\delta}^{(l)} = \big(\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)}\big)\odot\phi'\big(\mathbf{z}^{(l)}\big),
\qquad \text{即}\qquad
\delta^{(l)}_i = \phi'\big(z^{(l)}_i\big)\sum_j W^{(l+1)}_{ij}\,\delta^{(l+1)}_j.
$$

误差沿着当初传递信号的同一组权重被推回去，并受激活函数导数的门控：$\phi'(z_i) = 0$ 的单元什么也传不回去。

### 方程 3 和 4，参数梯度

对第 $l$ 层应用事实 2，再加上 $\partial\mathbf{z}^{(l)}/\partial\mathbf{b}^{(l)} = \mathbf{I}$，得到

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{W}^{(l)}} = \mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top} \in \mathbb{R}^{d_{l-1}\times d_l},
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{b}^{(l)}} = \boldsymbol{\delta}^{(l)}.
$$

权重梯度是流入该层的量与流出的误差的外积，其形状与 $\mathbf{W}^{(l)}$ 相同。这四个方程就是整个算法：一次前向传播，存下方程需要的量，然后一次反向扫描（图 2.5）。

```text
forward:   h(0) = x
           for l = 1 … L:   z(l) = W(l)ᵀ h(l−1) + b(l);   h(l) = φ(z(l))   (no φ at l = L)
           keep every h(l−1) and z(l)
backward:  δ(L) = ∂𝓛/∂z(L)                      p̂ − y, or 2(ŷ − y)            Equation 1
           for l = L … 1:
               ∂𝓛/∂W(l) = h(l−1) δ(l)ᵀ;   ∂𝓛/∂b(l) = δ(l)                  Equations 3, 4
               if l > 1:   δ(l−1) = (W(l) δ(l)) ⊙ φ′(z(l−1))                Equation 2
```

::: figure id=fig-02-5
三层 MLP 的反向传播。上排自左向右是前向传播：$\mathbf{h}^{(0)} = \mathbf{x} \to \mathbf{z}^{(1)} \to \mathbf{h}^{(1)} \to \mathbf{z}^{(2)} \to \mathbf{h}^{(2)} \to \mathbf{z}^{(3)} \to \mathcal{L}$，每个被存储的张量画成节点下方的一个带阴影小方框，标注“为反向传播保留”。下排自右向左是反向传播：$\boldsymbol{\delta}^{(3)} = \hat{\mathbf{p}} - \mathbf{y} \to \boldsymbol{\delta}^{(2)} \to \boldsymbol{\delta}^{(1)}$。每一层有两个分支：$\mathbf{W}^{(l)}\boldsymbol{\delta}^{(l)}$ 经 $\phi'(\mathbf{z}^{(l-1)})$ 门控，得到 $\boldsymbol{\delta}^{(l-1)}$；$\mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top}$ 得到 $\partial\mathcal{L}/\partial\mathbf{W}^{(l)}$，并用一条虚线连到被存储的 $\mathbf{h}^{(l-1)}$。
:::

::: worked title="小网络的反向传播"
接着第 2 节的例子（图 2.6 给出了每个数字）：$\mathbf{x} = (2, 1)$，$\mathbf{z}^{(1)} = (1.35, -1.5)$，$\mathbf{h}^{(1)} = (1.35, 0)$，$\hat y = 1.28$，$t = 1$。

- 方程 1，平方误差：$\delta^{(2)} = 2(\hat y - t) = 2(1.28 - 1) = 0.56$。
- 第 2 层的方程 3 和 4：
  $\partial\mathcal{L}/\partial\mathbf{W}^{(2)} = \mathbf{h}^{(1)}\delta^{(2)} = (1.35\cdot 0.56,\; 0\cdot 0.56) = (0.756, 0)$，
  $\partial\mathcal{L}/\partial b^{(2)} = 0.56$。
- 方程 2：$\mathbf{W}^{(2)}\delta^{(2)} = (0.8\cdot 0.56,\; -0.6\cdot 0.56) = (0.448, -0.336)$，经 $\phi'(\mathbf{z}^{(1)}) = (1, 0)$ 门控，所以 $\boldsymbol{\delta}^{(1)} = (0.448, 0)$。
- 第 1 层的方程 3 和 4：
  $\partial\mathcal{L}/\partial\mathbf{W}^{(1)} = \mathbf{x}\boldsymbol{\delta}^{(1)\top} = \begin{bmatrix}2\cdot 0.448 & 2\cdot 0\\ 1\cdot 0.448 & 1\cdot 0\end{bmatrix} = \begin{bmatrix}0.896 & 0\\ 0.448 & 0\end{bmatrix}$，
  $\partial\mathcal{L}/\partial\mathbf{b}^{(1)} = (0.448, 0)$。

未激活的第二个单元（$z = -1.5$）不传递梯度，所以它的输入权重不会从这个样本中学到任何东西。它的输出权重同样得不到梯度，因为它的输出是 0。

用步长 $\epsilon_{\text{fd}} = 10^{-3}$ 的中心差分检验其中一项。令 $W^{(1)}_{11} = 0.501$，得 $z^{(1)}_1 = 1.352$，$\hat y = 1.2816$，$\mathcal{L} = 0.07929856$；令它为 $0.499$，得 $1.348$、$1.2784$ 和 $0.07750656$。于是 $(0.07929856 - 0.07750656)/0.002 = 0.896000$，与反向传播得到的值一致。吻合是精确的，因为在这一点附近，$\mathcal{L}$ 是 $W^{(1)}_{11}$ 的二次函数，而中心差分对二次函数是精确的；[第 14 节](#s14)说明一般情况下如何选取 $\epsilon_{\text{fd}}$。
:::

::: figure id=fig-02-6
第 2 节的小网络及其数值。前向值用黑色：$\mathbf{x} = (2, 1)$，$\mathbf{z}^{(1)} = (1.35, -1.5)$，$\mathbf{h}^{(1)} = (1.35, 0)$，$\hat y = 1.28$，$\mathcal{L} = 0.0784$。梯度用红色：$\delta^{(2)} = 0.56$，$\partial\mathcal{L}/\partial\mathbf{W}^{(2)} = (0.756, 0)$，$\boldsymbol{\delta}^{(1)} = (0.448, 0)$，以及 $\partial\mathcal{L}/\partial\mathbf{W}^{(1)}$，其元素为 0.896、0.448、0 和 0。未激活的第二个隐藏单元以灰色显示，旁边标注 $\phi' = 0$。
:::

### batch 形式与代码

对一个 batch，把误差信号堆成各行，$\boldsymbol{\Delta}^{(l)} \in \mathbb{R}^{B\times d_l}$，第 $i$ 行等于 $\boldsymbol{\delta}_i^{(l)\top}$。逐行转置这些方程，并把参数梯度在 batch 上求和：

$$
\boldsymbol{\Delta}^{(l)} = \big(\boldsymbol{\Delta}^{(l+1)}\mathbf{W}^{(l+1)\top}\big)\odot\phi'\big(\mathbf{Z}^{(l)}\big),
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{W}^{(l)}} = \mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)},
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{b}^{(l)}} = \boldsymbol{\Delta}^{(l)\top}\mathbf{1}.
$$

由于 $(\mathbf{H}^\top\boldsymbol{\Delta})_{jk} = \sum_i H_{ij}\Delta_{ik}$，乘积 $\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$ 就是外积 $\mathbf{h}_i\boldsymbol{\delta}_i^\top$ 在 batch 上的和；偏置梯度是 $\boldsymbol{\Delta}^{(l)}$ 的列和。[实验 1](#lab1) 中两层回归网络（均方误差）的 backward 函数，与这几行一一对应。把它在小网络上作为只含一个样本的 batch 运行，会打印出上面的数字：

```python
import numpy as np

def forward(p, X):
    Z1 = X @ p["W1"] + p["b1"]; H1 = np.maximum(Z1, 0)        # (B, d1), ReLU
    Y = H1 @ p["W2"] + p["b2"]                                # (B, 1), no activation
    return Y, (X, Z1, H1)                                     # keep what backward needs

def backward(p, cache, Y, T):
    X, Z1, H1 = cache; B = X.shape[0]
    dY = 2 * (Y - T) / B                  # Delta(2): Equation 1, mean over the batch
    g = {"W2": H1.T @ dY, "b2": dY.sum(0)}    # Equations 3 and 4: H1^T Delta, column sums
    dH1 = dY @ p["W2"].T                  # Equation 2: the error passed down ...
    dZ1 = dH1 * (Z1 > 0)                  # ... gated by ReLU'(Z1)
    g["W1"] = X.T @ dZ1; g["b1"] = dZ1.sum(0)
    return g

p = {"W1": np.array([[0.5, -1.0], [0.25, 0.5]]), "b1": np.array([0.1, 0.0]),
     "W2": np.array([[0.8], [-0.6]]), "b2": np.array([0.2])}
X, T = np.array([[2.0, 1.0]]), np.array([[1.0]])             # one example: B = 1
Y, cache = forward(p, X)
g = backward(p, cache, Y, T)
for k in ("W1", "b1", "W2", "b2"):
    print(k, np.round(g[k], 4).tolist())
```

```output
W1 [[0.896, 0.0], [0.448, 0.0]]
b1 [0.448, 0.0]
W2 [[0.756], [0.0]]
b2 [0.56]
```

### 反向传播的开销

第 $l$ 层的前向传播是一次乘积 $\mathbf{H}^{(l-1)}\mathbf{W}^{(l)}$，花费 $2Bd_{l-1}d_l$ FLOPs。它的反向传播做两次同样大小的乘积：用 $\boldsymbol{\Delta}^{(l)}\mathbf{W}^{(l)\top}$ 把误差往下传，用 $\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$ 求权重梯度。门控和偏置求和花费 $O(Bd_l)$。所以反向传播至多花前向传播的两倍，一个训练步至多约为三次前向传播。当第一层占了很大一部分工作量时，开销会低于两倍，因为不需要对输入 $\mathbf{X}$ 求梯度，第一层省去了误差乘积。[模块 06 第 11 节](module_06_ZH.html#s11)把这一论证推广为 Transformer 的训练 FLOPs 计数。

::: worked title="digits 网络的反向传播"
对 $64 \to 128 \to 128 \to 10$，$B = 64$，前向传播花费 3,309,568 FLOPs（第 2 节）。权重梯度花费同样多，3,309,568。第 3 层和第 2 层往下传的误差花费 $2\cdot 64\cdot(128\cdot 10 + 128\cdot 128) = 163{,}840 + 2{,}097{,}152 = 2{,}260{,}992$；第 1 层不往下传任何东西。反向传播花费 $3{,}309{,}568 + 2{,}260{,}992 = 5{,}570{,}560$ FLOPs，是前向传播的 1.68 倍，完整的一个训练步是 2.68 次前向传播。
:::

### 两个推论

从这四个方程可以得到两个事实，它们解释了训练实践中的很多做法。

**梯度随深度消失或爆炸。**从输出处展开方程 2，

$$
\boldsymbol{\delta}^{(l)} = \mathbf{D}^{(l)}\mathbf{W}^{(l+1)}\,\mathbf{D}^{(l+1)}\mathbf{W}^{(l+2)}\cdots\mathbf{D}^{(L-1)}\mathbf{W}^{(L)}\,\boldsymbol{\delta}^{(L)},
\qquad \mathbf{D}^{(k)} = \operatorname{diag}\big(\phi'(\mathbf{z}^{(k)})\big),
$$

这是 $L - l$ 个矩阵 $\mathbf{D}^{(k-1)}\mathbf{W}^{(k)}$ 的乘积，每个都是一层的转置雅可比矩阵。如果它们的范数小于 1，误差在传向前面各层的途中几何级数地缩小，梯度就**消失**（vanish）；如果大于 1，误差增大，梯度就**爆炸**（explode）。深层 sigmoid 网络在 20 世纪 90 年代出了名地难训练，很大程度上就是这个原因，因为 $\sigma' \le 1/4$。ReLU、仔细的初始化、归一化和残差连接是对应的补救办法，大致按这个历史顺序出现（[第 5 节](#s5)、[第 6 节](#s6)和[第 10 节](#s10)）。

::: worked title="十层 sigmoid"
sigmoid 的导数至多为 $\sigma'(0) = 0.25$，所以仅激活这一项，十层 sigmoid 就至多把误差乘以 $0.25^{10} = 9.5\times 10^{-7}$。在典型的预激活值 2 处，$\sigma'(2) = 0.881\times 0.119 = 0.105$，因子为 $0.105^{10} = 1.6\times 10^{-10}$。除非权重来补偿，前几层收到的误差信号只有百万分之一甚至更少。
:::

**训练内存随深度乘以 batch 增长。**方程 3 需要每一层的输入 $\mathbf{h}^{(l-1)}$，所以前向传播必须把每层的输入保留到反向扫描走到它为止：内存正比于深度乘以 batch，正如第 2 节所统计的。梯度检查点用重新计算代替存储，正是为此而存在（[第 4 节](#s4)）。

::: keyidea
反向传播就是四个方程：由损失得到 $\boldsymbol{\delta}^{(L)}$；每个 $\boldsymbol{\delta}^{(l)}$ 由下一层经 $\mathbf{W}$ 和 $\phi'$ 得到；每个权重梯度是该层存储的输入与其 $\boldsymbol{\delta}$ 的外积。它至多花两次前向传播的开销，外加每一层输入的内存。
:::

::: check
$\mathbf{W}^{(l)}$ 的形状是 $(64, 32)$。对一个样本，$\boldsymbol{\delta}^{(l)}$ 和 $\partial\mathcal{L}/\partial\mathbf{W}^{(l)}$ 的形状各是什么？
:::

::: answer
$\boldsymbol{\delta}^{(l)} \in \mathbb{R}^{32}$，该层每个单元一项；$\partial\mathcal{L}/\partial\mathbf{W}^{(l)} = \mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top} \in \mathbb{R}^{64\times 32}$，与 $\mathbf{W}^{(l)}$ 的形状相同。
:::

::: check
为什么一个训练步约花费三次前向传播？
:::

::: answer
每层的反向传播做两次与其前向乘积同样大小的乘积：一次把误差往下传，一次求权重梯度。所以前向加反向至多是三次前向传播，因为第一层不往下传误差，所以略少一些。
:::

::: check
对某个样本，一个 ReLU 单元的 $z < 0$。这个样本给它的输入权重带来什么梯度？
:::

::: answer
零。它的 $\phi'(z) = 0$ 把它的 $\delta$ 门控为零，而每个输入权重的梯度是输入乘以这个 $\delta$。
:::

## 自动微分：计算图、反向模式与前向模式 {#s4}

第 3 节手工推导了 MLP 的反向传播。一种新的层类型，比如卷积或注意力块，就需要一次新的推导，而每次手工推导都可能引入 bug。框架通过机械地对程序求导来避免这两点。**自动微分**（automatic differentiation，autodiff）把链式法则应用到程序实际执行的基本运算上，反向传播就是它的反向模式的一个实例。本节在一个小例子上演示两种模式，说明为什么对标量损失应当用反向模式，并描述调用 `loss.backward()` 时 PyTorch 做了什么。

### 计算图

**计算图**（computational graph）为每个基本运算（加、乘、矩阵乘积、exp、log、sin、tanh、ReLU）设一个节点，边传递中间值 $v_i$，这些值按一种求值顺序编号，其中每个节点都排在它的输入之后（拓扑序）。每个基本运算都知道自己的局部偏导数：$\partial(uv)/\partial u = v$，$\partial\ln u/\partial u = 1/u$。贯穿本节的例子来自 Baydin 等人（2018）：

$$
f(x_1, x_2) = \ln x_1 + x_1x_2 - \sin x_2 \quad\text{在}\quad (x_1, x_2) = (2, 5)\ \text{处},
$$

其中 $v_1 = \ln x_1$，$v_2 = x_1x_2$，$v_3 = \sin x_2$，$v_4 = v_1 + v_2$，$f = v_4 - v_3$（图 2.7）。每个输入连到两个节点。

::: figure id=fig-02-7
$f(x_1, x_2) = \ln x_1 + x_1x_2 - \sin x_2$ 的计算图：输入节点 $x_1 = 2$ 和 $x_2 = 5$；运算节点 $\ln$、$\times$、$\sin$、$+$ 和 $-$，其前向值用黑色标出（0.693、10、$-0.959$、10.693、11.652）。每个节点旁用红色标出伴随量：输出处和 $+$ 处为 1，$\sin$ 处为 $-1$，$\ln$ 和 $\times$ 处为 1；然后 $x_1$ 处为 $5.5 = 0.5 + 5$，两条红色箭头在此汇合，标注“+=”；$x_2$ 处为 $1.716 = 2 - 0.284$。
:::

### 前向模式

前向模式在每个值旁边携带一个**切向量**（tangent）$\dot v_i$，即 $v_i$ 沿输入空间中选定方向的导数：

$$
\dot v_i = \sum_{j\,\in\,\text{parents}(i)} \frac{\partial v_i}{\partial v_j}\,\dot v_j.
$$

用一个方向给输入赋初值，$\dot{\mathbf{x}} = \mathbf{u}$，一次传播就得到方向导数 $\mathbf{J}\mathbf{u}$，即**雅可比-向量积**（Jacobian-vector product，JVP）。**对偶数**（dual number）实现了它：形如 $a + b\epsilon$、$\epsilon^2 = 0$ 的数。由泰勒定理，$f(a + b\epsilon) = f(a) + f'(a)\,b\epsilon$，$\epsilon$ 的更高次幂都为零，所以对偶数上的算术可以精确地把导数带着走。乘积法则由 $(a + b\epsilon)(c + d\epsilon) = ac + (ad + bc)\epsilon$ 自然得出。

```python
import math

class Dual:
    """a + b·ε with ε² = 0: the value a carries its derivative b along."""
    def __init__(self, a, b=0.0):
        self.a, self.b = a, b
    def __add__(self, o):
        return Dual(self.a + o.a, self.b + o.b)
    def __sub__(self, o):
        return Dual(self.a - o.a, self.b - o.b)
    def __mul__(self, o):                      # (a + bε)(c + dε) = ac + (ad + bc)ε
        return Dual(self.a * o.a, self.a * o.b + self.b * o.a)

def log(u): return Dual(math.log(u.a), u.b / u.a)
def sin(u): return Dual(math.sin(u.a), math.cos(u.a) * u.b)

def f(x1, x2):
    return log(x1) + x1 * x2 - sin(x2)

y = f(Dual(2.0, 1.0), Dual(5.0, 0.0))          # seed the tangent (1, 0)
print(f"f = {y.a:.4f}, df/dx1 = {y.b:.4f}")
y = f(Dual(2.0, 0.0), Dual(5.0, 1.0))          # seed the tangent (0, 1)
print(f"f = {y.a:.4f}, df/dx2 = {y.b:.4f}")
```

```output
f = 11.6521, df/dx1 = 5.5000
f = 11.6521, df/dx2 = 1.7163
```

### 反向模式

反向模式先把程序向前运行一遍并保留各个值，然后从 $\bar f = 1$ 出发，向后传递**伴随量**（adjoint）$\bar v_i = \partial f/\partial v_i$：

$$
\bar v_j \mathrel{+}= \bar v_i\,\frac{\partial v_i}{\partial v_j} \qquad \text{对 } j \text{ 的每个子节点 } i.
$$

“+=”就是多元链式法则：一个变量在多处被使用，就会沿多条路径影响输出，它的伴随量是所有这些路径贡献之和。用 $\mathbf{u}$ 给输出赋初值，一次传播就得到**向量-雅可比积**（vector-Jacobian product，VJP）$\mathbf{u}^\top\mathbf{J}$。对标量损失，$u = 1$，这唯一的一行就是整个梯度。

::: worked title="手算两种模式"
前向值：$v_1 = \ln 2 = 0.6931$，$v_2 = 2\cdot 5 = 10$，$v_3 = \sin 5 = -0.9589$，$v_4 = v_1 + v_2 = 10.6931$，$f = v_4 - v_3 = 11.6521$。

前向模式，切向量 $(\dot x_1, \dot x_2) = (1, 0)$：$\dot v_1 = \dot x_1/x_1 = 0.5$；$\dot v_2 = \dot x_1x_2 + x_1\dot x_2 = 5 + 0 = 5$；$\dot v_3 = \cos x_2\cdot\dot x_2 = 0$；$\dot v_4 = 0.5 + 5 = 5.5$；$\dot f = \dot v_4 - \dot v_3 = 5.5 = \partial f/\partial x_1$。用切向量 $(0, 1)$ 再传播一次，得 $\dot v_2 = 2$，$\dot v_3 = \cos 5 = 0.2837$，$\partial f/\partial x_2 = 2 - 0.2837 = 1.7163$。两个输入，两次传播。

反向模式，从 $\bar f = 1$ 出发传播一次。节点 $f = v_4 - v_3$ 给出 $\bar v_4 = 1$ 和 $\bar v_3 = -1$；节点 $v_4 = v_1 + v_2$ 给出 $\bar v_1 = 1$ 和 $\bar v_2 = 1$。然后每个输入从它的两个子节点处汇总：

$$
\bar x_1 = \bar v_1\,\frac{1}{x_1} + \bar v_2\,x_2 = 0.5 + 5 = 5.5, \qquad
\bar x_2 = \bar v_2\,x_1 + \bar v_3\cos x_2 = 2 - 0.2837 = 1.7163.
$$

两个偏导数来自一次传播。$x_1$ 被使用了两次，分别在 $\ln$ 和乘积中，它的伴随量是两条路径之和。
:::

### 选哪种模式，开销是多少

对 $f: \mathbb{R}^n \to \mathbb{R}^m$，完整的雅可比矩阵需要 $n$ 次前向模式传播（每次一列），或 $m$ 次反向模式传播（每次一行）（图 2.8），每次传播的开销是计算一次 $f$ 的一个很小的常数倍；对反向模式而言，这就是**廉价梯度原理**（cheap gradient principle）（Griewank 和 Walther 2008）。训练中 $m = 1$，$n$ 从约 $10^4$ 到 $10^{11}$，所以反向模式胜出的倍数为 $n$ 的量级。当 $n \ll m$ 时，前向模式胜出。对一条含 1,000 个采样点的模拟轨迹，求它对 3 个设计参数的灵敏度，需要 3 次前向传播，而反向传播则要 1,000 次。海森矩阵-向量积（Hessian-vector product）的算法是：对反向模式的梯度再做前向模式。物理信息神经网络（[模块 05 第 9 节](module_05_ZH.html#s9)）对网络关于其少数几个输入求导，这是前向模式的自然用途。

::: figure id=fig-02-8
雅可比矩阵 $\mathbf{J} \in \mathbb{R}^{m\times n}$ 画成网格，共画两次。左：每次传播填一列，标注“前向模式：$n$ 次传播，每次 $\mathbf{J}\mathbf{u}$（JVP）”。右：每次传播填一行，标注“反向模式：$m$ 次传播，每次 $\mathbf{u}^\top\mathbf{J}$（VJP）”。下方是 $m = 1$ 的情形，即标量损失，画成单独一行：一次反向传播就得到整个梯度。
:::

::: worked title="数一数传播次数"
digits 网络有 26,122 个参数。用前向模式求它的梯度需要 26,122 次前向传播；反向模式则由一次前向传播加一次反向传播给出，后者大约多花 1.7 次前向传播的开销（第 3 节）。一个有 $7\times 10^9$ 个参数的模型，每步需要 $7\times 10^9$ 次前向模式传播。
:::

### 磁带与梯度检查点

反向模式的代价是内存。反向扫描需要前向值，所以要把它们记录下来（即**磁带**，tape），并一直保留到扫描用完它们为止。**梯度检查点**（gradient checkpointing）只存其中一部分，其余的重新计算：保留每第 $k$ 层的输入，当反向扫描到达某一段时，从它的检查点出发把这一段的 $k$ 层重新前向运行一遍，以重建它们的激活。峰值约为 $L/k$ 个检查点加一段 $k$ 层，在 $k = \sqrt L$ 附近最小：激活内存从 $O(L)$ 降到 $O(\sqrt L)$，代价是多做约一次前向传播（Chen 等人 2016）。

::: worked title="给深层 MLP 做检查点"
第 2 节那个 50 层、宽度 1,024、batch 为 256 的 MLP，每层存储 2 MiB 的 $\mathbf{Z}$ 和 $\mathbf{H}$，合计 100 MiB（105 MB）。每隔 7 层设一个检查点（$\sqrt{50} \approx 7$），保留约 7 个检查点，每个是一段的输入 $\mathbf{H}$，1 MiB，再加上反向扫描正在处理的那一段中重新计算出的 7 层，$7\times 2 = 14$ MiB：峰值约 21 MiB（22 MB），而不是 100 MiB，代价是多一次前向传播。
:::

### 作为 VJP 规则的层

框架从不构造雅可比矩阵。每个层提供一条规则，把其输出的伴随量映射为其输入的伴随量：

- 线性层，$\mathbf{z} = \mathbf{W}^\top\mathbf{h} + \mathbf{b}$：给定 $\bar{\mathbf{z}}$，$\bar{\mathbf{h}} = \mathbf{W}\bar{\mathbf{z}}$，$\bar{\mathbf{W}} = \mathbf{h}\bar{\mathbf{z}}^\top$，$\bar{\mathbf{b}} = \bar{\mathbf{z}}$；
- 激活，$\mathbf{h} = \phi(\mathbf{z})$：$\bar{\mathbf{z}} = \bar{\mathbf{h}}\odot\phi'(\mathbf{z})$；
- logits 上的 softmax 交叉熵：$\bar{\mathbf{z}} = \hat{\mathbf{p}} - \mathbf{y}$。

这些就是第 3 节的方程，其中 $\bar{\mathbf{z}}^{(l)} = \boldsymbol{\delta}^{(l)}$：反向传播就是把每一层视为一个基本运算的反向模式。改为构造雅可比矩阵是没有希望的。对一个作用于 512 个样本的 batch 的 4,096 → 4,096 层，全部输出对全部输入的雅可比矩阵有 $(512\cdot 4{,}096)^2 \approx 4.4\times 10^{12}$ 个元素，其中几乎全是零，而 VJP 只是一次矩阵乘积。

### 调用 loss.backward() 时 PyTorch 做了什么

对 `requires_grad=True` 的张量做的每个运算都会记录一个节点，可通过结果的 `.grad_fn` 看到，里面存着它的 VJP 规则所需的内容。`loss.backward()` 按反向拓扑序遍历这些节点，并用“+=”累加到每个叶子张量的 `.grad` 中。图在每次前向传播时随代码的运行重新构建（**define-by-run**，即运行时定义），在 `backward()` 用完之后释放。`torch.no_grad()` 关闭记录，用于评估和优化器自身的更新；`.detach()` 返回一个从图中切出的张量，若误用，会悄无声息地阻断梯度。在第 2 节的小网络上：

```python
import torch

x = torch.tensor([2.0, 1.0])
W1 = torch.tensor([[0.5, -1.0], [0.25, 0.5]], requires_grad=True)   # leaves
b1 = torch.tensor([0.1, 0.0], requires_grad=True)
W2 = torch.tensor([[0.8], [-0.6]], requires_grad=True)
b2 = torch.tensor([0.2], requires_grad=True)

def loss_fn():                                # the network of s2, target t = 1
    h1 = torch.relu(W1.T @ x + b1)            # every operation records a node
    return ((W2.T @ h1 + b2 - 1.0) ** 2).sum()

loss = loss_fn()
node, chain = loss.grad_fn, []
while node is not None:                       # follow the first input of each node
    chain.append(node.name().split("::")[-1])
    node = node.next_functions[0][0] if node.next_functions else None
print(" <- ".join(chain))

loss.backward()                               # reverse sweep; the graph is then freed
print(W1.grad, b2.grad)
loss_fn().backward()                          # the next step's backward, not zeroed
print(W1.grad[:, 0], b2.grad)                 # added to the old values: doubled

for p in (W1, b1, W2, b2):
    p.grad = None                             # what optimizer.zero_grad() does
with torch.no_grad():
    print(loss_fn().requires_grad)            # nothing was recorded
print(W1.detach().requires_grad)              # a tensor cut out of the graph
```

```output
SumBackward0 <- PowBackward0 <- SubBackward0 <- AddBackward0 <- MvBackward0 <- PermuteBackward0 <- AccumulateGrad
tensor([[0.8960, 0.0000],
        [0.4480, 0.0000]]) tensor([0.5600])
tensor([1.7920, 0.8960]) tensor([1.1200])
False
False
```

沿着每个节点的第一个输入往回走，从损失出发，依次经过求和、平方、减去 $t$、偏置、乘积 $\mathbf{W}^{(2)\top}\mathbf{h}^{(1)}$ 和转置，最后到达 `AccumulateGrad`，即把梯度加进 `W2.grad` 的节点。梯度就是第 3 节的数字。第二次 backward 调用又加上了第二份：因为 `.grad` 是累加的，所以每个优化器步骤之前都必须调用 `optimizer.zero_grad()`。使链式法则成立的同一个“+=”，也使忘记 `zero_grad` 的后果是把过去所有的梯度加进每一步（[实验 5](#lab5)，脚本 B）。

[实验 2](#lab2) 构建一个约 100 行的标量反向模式引擎，做的正是这件事，每个节点一个数。它还说明了为什么框架要在张量上工作：对 100 个样本做一个 337 参数网络的一个训练步，会创建 66,440 个标量节点，而 PyTorch 只记录约十个张量运算。

::: keyidea
反向传播就是反向模式自动微分：一次由向量-雅可比积组成的反向扫描，就以前向传播开销的一个小倍数，给出标量损失的整个梯度，代价是磁带的内存。
:::

::: check
在反向模式中，为什么在两处被使用的变量，其伴随量是一个和？
:::

::: answer
输出通过两条路径依赖于这个变量，而多元链式法则把各条路径的贡献相加。
:::

::: check
$f: \mathbb{R}^3 \to \mathbb{R}^{1000}$ 把三个设计参数映射为一条模拟轨迹。哪种模式求完整的雅可比矩阵更便宜？
:::

::: answer
前向模式：3 次传播，每个输入一次，而不是 1,000 次反向传播，每个输出一次。
:::

::: check
`optimizer.zero_grad()` 防止了什么？
:::

::: answer
PyTorch 把每次反向传播的梯度加进 `.grad`。如果不清零，每一步用的都是此前所有梯度之和。
:::
