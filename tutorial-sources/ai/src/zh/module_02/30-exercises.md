## 练习 {#exercises}

共十五道练习，合计 130 分钟，按所需工作量分级。一星练习（★）是概念题，除引用正文外不需要任何计算，约五分钟。二星练习（★★）是推导或计算，十到十五分钟。三星练习（★★★）是编程任务，约 25 分钟。第一类有八道，第二类六道，第三类一道；本模块的编程练习集中在五个实验里，所以这里的练习偏重实验没有涉及的推理。

先在纸上做每一道练习，再打开它的解答；解答默认是折叠的。解答会给出推导的每一步，说明为什么这样做；凡是引用数值之处，数值都是算出来的，并附有代码。解答打印输出的地方，最后几位数字在你的机器上可能不同。练习 5 和练习 15 扩展[实验 1](#lab1)的网络：请先完成该实验。

| 练习 | 难度 | 类型 | 分钟 | 练习内容 |
|---|---|---|---|---|
| [1](#e1) | ★ | 概念 | 5 | 为什么需要非线性（[第 1 节](#s1)） |
| [2](#e2) | ★★ | 推导 | 15 | 三层网络的反向传播及其代价（[第 3 节](#s3)） |
| [3](#e3) | ★ | 概念 | 5 | 深度带来了什么（[第 1 节](#s1)） |
| [4](#e4) | ★★ | 计算 | 10 | 手算前向模式与反向模式（[第 4 节](#s4)） |
| [5](#e5) | ★★ | 推导 | 10 | 死亡 ReLU 单元（[第 5 节](#s5)，[实验 1](#lab1)） |
| [6](#e6) | ★ | 概念 | 5 | 参数初始化与深度（[第 6 节](#s6)） |
| [7](#e7) | ★★ | 计算 | 10 | 二次函数上的步长上限与动量（[第 7 节](#s7)） |
| [8](#e8) | ★★ | 计算 | 10 | 手算 Adam（[第 8 节](#s8)） |
| [9](#e9) | ★ | 概念 | 5 | AdamW 与 L2 正则化（[第 8 节](#s8)） |
| [10](#e10) | ★ | 概念 | 5 | 反向随机失活（inverted dropout）（[第 11 节](#s11)） |
| [11](#e11) | ★★ | 计算 | 10 | log-sum-exp 与上溢（[第 12 节](#s12)） |
| [12](#e12) | ★ | 概念 | 5 | 两次 softmax（[第 12 节](#s12)） |
| [13](#e13) | ★ | 概念 | 5 | 解读梯度检验（[第 14 节](#s14)） |
| [14](#e14) | ★ | 概念 | 5 | 诊断训练日志（[第 14 节](#s14)） |
| [15](#e15) | ★★★ | 编程 | 25 | Adam 对比 SGD，以及输入尺度（[第 7 节](#s7)，[第 8 节](#s8)，[实验 1](#lab1)） |

::: exercise id=e1 level=1 kind=conceptual minutes=5
一位同事在二维输入上训练一个有三个隐藏层、每层 64 个单元的网络，却忘了加激活函数，于是
$\mathbf{z}^{(l)} = \mathbf{W}^{(l)\top}\mathbf{h}^{(l-1)} + \mathbf{b}^{(l)}$，
$\mathbf{h}^{(l)} = \mathbf{z}^{(l)}$（$l = 1, 2, 3$），其中 $\mathbf{h}^{(0)} = \mathbf{x}$，
输出为 $\mathbf{z}^{(4)}$。

(a) 证明该网络计算的是输入的仿射函数，并用 $\mathbf{W}^{(1)}, \dots, \mathbf{W}^{(4)}$ 和
$\mathbf{b}^{(1)}, \dots, \mathbf{b}^{(4)}$ 写出它的等效权重矩阵和偏置。

(b) 同事随后只在第三个隐藏层之后加了一个 ReLU。现在这个网络能表示哪些函数？把它与只有一个隐藏层、含 64 个 ReLU 单元的网络比较，并说明多出来的两个 $64 \times 64$ 层起了什么作用。
:::

::: solution
**(a)** 逐层代入。每一层都是仿射映射，而代入的要点在于：仿射映射的仿射映射仍是仿射映射：

$$
\mathbf{z}^{(4)} = \mathbf{W}^{(4)\top}\Big(\mathbf{W}^{(3)\top}\big(\mathbf{W}^{(2)\top}(\mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)}) + \mathbf{b}^{(2)}\big) + \mathbf{b}^{(3)}\Big) + \mathbf{b}^{(4)}.
$$

展开。含 $\mathbf{x}$ 的项是
$\mathbf{W}^{(4)\top}\mathbf{W}^{(3)\top}\mathbf{W}^{(2)\top}\mathbf{W}^{(1)\top}\mathbf{x}$，
而由于 $(\mathbf{A}\mathbf{B})^\top = \mathbf{B}^\top\mathbf{A}^\top$，转置之积就是按相反顺序相乘的积的转置。其余各项不含
$\mathbf{x}$。因此 $\mathbf{z}^{(4)} = \mathbf{W}_{\text{eff}}^\top\mathbf{x} + \mathbf{b}_{\text{eff}}$，其中

$$
\mathbf{W}_{\text{eff}} = \mathbf{W}^{(1)}\mathbf{W}^{(2)}\mathbf{W}^{(3)}\mathbf{W}^{(4)},
\qquad
\mathbf{b}_{\text{eff}} = \mathbf{W}^{(4)\top}\mathbf{W}^{(3)\top}\mathbf{W}^{(2)\top}\mathbf{b}^{(1)}
+ \mathbf{W}^{(4)\top}\mathbf{W}^{(3)\top}\mathbf{b}^{(2)}
+ \mathbf{W}^{(4)\top}\mathbf{b}^{(3)} + \mathbf{b}^{(4)}.
$$

形状检查：对 $K$ 个输出，$(2 \times 64)(64 \times 64)(64 \times 64)(64 \times K) = 2 \times K$，与应有的形状一致。四层的表达能力等同于一层：多出来的深度什么也没有带来，这正是[第 1 节](#s1)主张在层与层之间放入非线性的理由。

**(b)** 前三层仍然塌缩成一层，因为它们之间没有任何非线性。它们的输出是 $\mathbf{z}^{(3)} = \mathbf{A}^\top\mathbf{x} + \mathbf{c}$，其中
$\mathbf{A} = \mathbf{W}^{(1)}\mathbf{W}^{(2)}\mathbf{W}^{(3)} \in \mathbb{R}^{2 \times 64}$，
$\mathbf{c} = \mathbf{W}^{(3)\top}\mathbf{W}^{(2)\top}\mathbf{b}^{(1)} + \mathbf{W}^{(3)\top}\mathbf{b}^{(2)} + \mathbf{b}^{(3)}$。
再经过 ReLU 和输出层，得到

$$
f(\mathbf{x}) = \mathbf{W}^{(4)\top}\operatorname{ReLU}(\mathbf{A}^\top\mathbf{x} + \mathbf{c}) + \mathbf{b}^{(4)}
= \sum_{j=1}^{64}\mathbf{v}_j\operatorname{ReLU}(\mathbf{a}_j^\top\mathbf{x} + c_j) + \mathbf{b}^{(4)},
$$

其中 $\mathbf{a}_j$ 是 $\mathbf{A}$ 的第 $j$ 列，$\mathbf{v}_j$ 是 $\mathbf{W}^{(4)}$ 的第 $j$ 行。
这恰好是一个有 64 个单元、第一层权重为 $\mathbf{A}$ 的单隐藏层 ReLU 网络。反过来也成立：任何这样的网络都可以通过取
$\mathbf{W}^{(1)} = \mathbf{A}$，$\mathbf{W}^{(2)} = \mathbf{W}^{(3)} = \mathbf{I}$，
$\mathbf{b}^{(1)} = \mathbf{b}^{(2)} = \mathbf{0}$ 以及 $\mathbf{b}^{(3)} = \mathbf{c}$ 得到。两族函数完全相同：它们都是 64 个岭函数（沿平面内某条直线取常数）之和，是连续的分段线性函数，决策边界是折线。在圆环数据上，这样的网络可以把圆盘围起来，如[第 1 节](#s1)的 playground 所示，而同事的更深的网络并不能做得更多。

多出来的两层贡献的是参数，而不是函数。前三层共有
$192 + 4{,}160 + 4{,}160 = 8{,}512$ 个参数，但函数只通过 $\mathbf{A}$ 和 $\mathbf{c}$ 依赖于它们，而它们只有 $2 \cdot 64 + 64 = 192$ 个元素。从参数到函数的映射是多对一的，改变的是梯度下降在参数空间中走的路径（三个矩阵之积的梯度，是其余矩阵的乘积），而不是它能到达的范围。
:::

::: exercise id=e2 level=2 kind=derivation minutes=15
一个网络有三个权重层：
$\mathbf{z}^{(1)} = \mathbf{W}^{(1)\top}\mathbf{x} + \mathbf{b}^{(1)}$，$\mathbf{h}^{(1)} = \tanh\mathbf{z}^{(1)}$；
$\mathbf{z}^{(2)} = \mathbf{W}^{(2)\top}\mathbf{h}^{(1)} + \mathbf{b}^{(2)}$，$\mathbf{h}^{(2)} = \tanh\mathbf{z}^{(2)}$；
$\mathbf{z}^{(3)} = \mathbf{W}^{(3)\top}\mathbf{h}^{(2)} + \mathbf{b}^{(3)}$，在 $\mathbf{z}^{(3)}$ 上使用 softmax
交叉熵，各层宽度为 $d_0, d_1, d_2, d_3$。

(a) 对单个样本，写出 $\boldsymbol{\delta}^{(3)}, \boldsymbol{\delta}^{(2)}, \boldsymbol{\delta}^{(1)}$ 以及全部六个参数梯度。

(b) 对在 $B$ 个样本上取平均的损失，给出批量矩阵形式。

(c) 计算前向传播与反向传播中矩阵乘积的 FLOPs，并证明反向传播的代价至多是前向传播的两倍。

(d) 对宽度 $(784, 256, 256, 10)$ 求该比值。
:::

::: solution
**(a)** 取 $\boldsymbol{\delta}^{(l)} = \partial\mathcal{L}/\partial\mathbf{z}^{(l)}$ 作为误差信号，从顶层开始。对 softmax 交叉熵，关于 logits 的梯度是
$\hat{\mathbf{p}} - \mathbf{y}$（[模块 01，第 6 节](module_01_ZH.html#s6)对 softmax 回归推导了它，[第 3 节](#s3)则通过 softmax 的雅可比矩阵重新得到它），因此

$$
\boldsymbol{\delta}^{(3)} = \hat{\mathbf{p}} - \mathbf{y}.
$$

向下走一层，要让 $\boldsymbol{\delta}^{(3)}$ 穿过线性映射。由于
$z^{(3)}_k = \sum_i W^{(3)}_{ik}h^{(2)}_i + b^{(3)}_k$，有 $\partial z^{(3)}_k/\partial h^{(2)}_i = W^{(3)}_{ik}$，以及
$\partial\mathcal{L}/\partial h^{(2)}_i = \sum_k W^{(3)}_{ik}\delta^{(3)}_k = (\mathbf{W}^{(3)}\boldsymbol{\delta}^{(3)})_i$。
再穿过激活函数。激活函数对每个分量单独作用，且
$\tanh' z = 1 - \tanh^2 z$（把导数写成输出 $h$ 的函数，要点就在这里，因为 $h$ 已经存储好了）：

$$
\boldsymbol{\delta}^{(2)} = (\mathbf{W}^{(3)}\boldsymbol{\delta}^{(3)})\odot\big(1 - (\mathbf{h}^{(2)})^2\big),
\qquad
\boldsymbol{\delta}^{(1)} = (\mathbf{W}^{(2)}\boldsymbol{\delta}^{(2)})\odot\big(1 - (\mathbf{h}^{(1)})^2\big).
$$

参数的梯度随之而来：$z^{(l)}_k$ 只通过 $h^{(l-1)}_iW^{(l)}_{ik}$ 这一项依赖于 $W^{(l)}_{ik}$，对 $b^{(l)}_k$ 的系数为 1，所以
$\partial\mathcal{L}/\partial W^{(l)}_{ik} = h^{(l-1)}_i\delta^{(l)}_k$，
$\partial\mathcal{L}/\partial b^{(l)}_k = \delta^{(l)}_k$。写成矩阵形式，取
$\mathbf{h}^{(0)} = \mathbf{x}$，$l = 1, 2, 3$，

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{W}^{(l)}} = \mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top},
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{b}^{(l)}} = \boldsymbol{\delta}^{(l)}.
$$

形状是吻合的：$\mathbf{h}^{(l-1)}\boldsymbol{\delta}^{(l)\top}$ 是 $d_{l-1} \times d_l$，正是 $\mathbf{W}^{(l)}$ 的形状。

**(b)** 把 $B$ 个样本按行堆叠：$\mathbf{H}^{(l)} \in \mathbb{R}^{B \times d_l}$，
$\mathbf{H}^{(0)} = \mathbf{X}$。损失是 $\frac1B\sum_n\mathcal{L}_n$，所以 $1/B$ 这个因子只需在顶层一次性并入 $\boldsymbol{\Delta}^{(3)}$，之后的每个量都会继承它。$\boldsymbol{\Delta}^{(l)}$ 的第 $n$ 行是 $\boldsymbol{\delta}^{(l)\top}_n/B$：

$$
\begin{aligned}
\boldsymbol{\Delta}^{(3)} &= (\hat{\mathbf{P}} - \mathbf{Y})/B,\\
\boldsymbol{\Delta}^{(2)} &= \big(\boldsymbol{\Delta}^{(3)}\mathbf{W}^{(3)\top}\big)\odot\big(1 - \mathbf{H}^{(2)}\odot\mathbf{H}^{(2)}\big),\\
\boldsymbol{\Delta}^{(1)} &= \big(\boldsymbol{\Delta}^{(2)}\mathbf{W}^{(2)\top}\big)\odot\big(1 - \mathbf{H}^{(1)}\odot\mathbf{H}^{(1)}\big),\\
\frac{\partial\mathcal{L}}{\partial\mathbf{W}^{(l)}} &= \mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)},
\qquad
\frac{\partial\mathcal{L}}{\partial\mathbf{b}^{(l)}} = \mathbf{1}^\top\boldsymbol{\Delta}^{(l)}.
\end{aligned}
$$

因为样本按行排列，转置移到了 $\boldsymbol{\Delta}$ 的右侧。乘积
$\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$ 把各样本的外积
$\mathbf{h}_n\boldsymbol{\delta}_n^\top/B$ 在 batch 上求和，也就是各样本梯度的均值；而 $\mathbf{1}^\top\boldsymbol{\Delta}^{(l)}$ 对各行求和，得到偏置的梯度。下面的检验在 float64 下，用一个小网络（宽度 4、6、5、3，五个样本）把这些公式与自动微分（autograd）的结果作比较。

```python
import torch
import torch.nn.functional as F

torch.manual_seed(0)
B, d = 5, (4, 6, 5, 3)                            # small widths so that the shapes show
W = [torch.randn(d[i], d[i + 1], dtype=torch.double, requires_grad=True)
     for i in range(3)]
b = [torch.randn(d[i + 1], dtype=torch.double, requires_grad=True) for i in range(3)]
X = torch.randn(B, d[0], dtype=torch.double)
y = torch.tensor([0, 2, 1, 1, 0])

H1 = torch.tanh(X @ W[0] + b[0])
H2 = torch.tanh(H1 @ W[1] + b[1])
Z3 = H2 @ W[2] + b[2]
F.cross_entropy(Z3, y).backward()                 # autograd: the referee

with torch.no_grad():                             # the batch equations of part (b)
    P, Y = torch.softmax(Z3, 1), F.one_hot(y, 3).double()
    D3 = (P - Y) / B
    D2 = (D3 @ W[2].T) * (1 - H2 ** 2)
    D1 = (D2 @ W[1].T) * (1 - H1 ** 2)
    mine_W = [X.T @ D1, H1.T @ D2, H2.T @ D3]
    mine_b = [D1.sum(0), D2.sum(0), D3.sum(0)]
for l in range(3):
    err_W = (mine_W[l] - W[l].grad).abs().max()
    err_b = (mine_b[l] - b[l].grad).abs().max()
    print(f"layer {l + 1}: shape {tuple(W[l].shape)}, largest difference "
          f"in W {err_W:.1e}, in b {err_b:.1e}")
```

```output
layer 1: shape (4, 6), largest difference in W 4.2e-17, in b 3.1e-17
layer 2: shape (6, 5), largest difference in W 5.6e-17, in b 5.6e-17
layer 3: shape (5, 3), largest difference in W 2.8e-17, in b 2.8e-17
```

**(c)** 采用[模块 06，第 11 节](module_06_ZH.html#s11)的约定：$m \times k$ 矩阵与 $k \times n$ 矩阵的乘积花费 $2mkn$ FLOPs，逐元素运算（$\tanh$ 的导数、偏置求和）是低阶项，略去不计。前向传播有三个乘积：

$$
F = 2B\,(d_0d_1 + d_1d_2 + d_2d_3).
$$

反向传播有两种乘积。权重梯度
$\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$（$l = 1, 2, 3$）的形状与前向乘积相同，总共花费同样的 $F$。向下传递的误差
$\boldsymbol{\Delta}^{(3)}\mathbf{W}^{(3)\top}$ 和
$\boldsymbol{\Delta}^{(2)}\mathbf{W}^{(2)\top}$ 分别花费 $2Bd_2d_3$ 和 $2Bd_1d_2$。第三个这样的乘积
$\boldsymbol{\Delta}^{(1)}\mathbf{W}^{(1)\top}$ 会给出 $\partial\mathcal{L}/\partial\mathbf{X}$，而没有任何参数需要它，所以不去计算。因此

$$
\frac{\text{反向}}{\text{前向}}
= \frac{F + 2B(d_1d_2 + d_2d_3)}{F}
= 1 + \frac{d_1d_2 + d_2d_3}{d_0d_1 + d_1d_2 + d_2d_3} \le 2,
$$

因为这个分数至多为 1，只有当 $d_0d_1 = 0$ 时才取等号，也就是说，只有在连第一层的输入梯度也要计算、且第一层本身不花任何代价时才会如此。因此“反向传播的代价约为前向传播的两倍”是一个上界，在第一层只占一小部分工作量时才会逼近它。

**(d)** 对 $(784, 256, 256, 10)$：$d_0d_1 = 200{,}704$，$d_1d_2 = 65{,}536$，$d_2d_3 = 2{,}560$。
前向的和为 $268{,}800$，传递误差的和为 $68{,}096$，所以比值是
$1 + 68{,}096/268{,}800 = 1.253$。每个样本前向为 $2 \cdot 268{,}800 = 537{,}600$ FLOPs，
反向为 $2(268{,}800 + 68{,}096) = 673{,}792$ FLOPs。第一层占了四分之三的权重，而它的输入梯度恰是被跳过的那个乘积，所以比值离 2 很远。[第 3 节](#s3)的数字网络 $(64, 128, 128, 10)$ 的第一层较小：
$1 + 17{,}664/25{,}856 = 1.68$。
:::

::: exercise id=e3 level=1 kind=conceptual minutes=5
[第 1 节](#s1)把锯齿函数 $t^k$（即折叠映射
$t(x) = 2\operatorname{ReLU}(x) - 4\operatorname{ReLU}(x - \tfrac12)$ 与自身复合 $k$ 次）与一个表示同一函数的单隐藏层 ReLU 网络作了比较。

(a) 不用计数，解释为什么每多复合一次，线性段的数目就翻一倍，却只增加两个单元；而单隐藏层网络每多一段就必须多加一个单元。

(b) 一位同事得出结论：深层网络总是比宽网络指数级地高效。说明这个论证确立了什么，并指出它没有确立的两件事。
:::

::: solution
**(a)** $t^{k-1}$ 的每个线性段都是单调的，并把它的区间映到整个 $[0, 1]$ 上。折叠映射在 $[0, \frac12]$ 上升，在 $[\frac12, 1]$ 上降，所以把它作用到某一段上时，该段的值域恰好经过 $\frac12$ 一次，输出在此处掉头。因此原有的每一段都变成两段，一段上升，一段下降。同样的两个单元同时作用于所有的段，因为它们作用的是上一层的*值*，而不是位置 $x$：复合让这些单元在每一段上被重复使用。标量输入上的单隐藏层网络
$g(x) = \sum_j a_j\operatorname{ReLU}(w_jx + b_j) + c$
只有在某个单元切换的地方，即 $x = -b_j/w_j$ 处，斜率才会改变。每个单元提供一个断点，所以每多一段就要多一个单元：宽度要为每一段单独付费。当 $k = 10$ 时，深层网络有 20 个单元和 1,024 段，而浅层网络至少需要 1,023 个单元。

**(b)** 这个论证对一族函数确立了一种分离：有指数多个线性段的锯齿类函数，可以由单元数随深度线性增长的深层网络表示，而浅层网络只有用指数多的单元才能表示（更一般地，ReLU 网络所能产生的线性区域数随深度指数增长，见 Montúfar et al. 2014）。它没有表明实践中遇到的函数属于这一类：真实的目标函数不必一再折叠它的输入空间。它没有表明从随机起点出发的梯度下降能找到这种深层构造，而那是权重的一种特殊而脆弱的设置。它对从有限数据中泛化（generalisation）也没有任何说明，因为精确拟合 $2^k$ 段是关于表示能力的陈述，而不是关于学习的陈述。而且深度是有代价的：梯度必须反向穿过每一层，所以深度带来梯度消失与梯度爆炸（[第 3 节](#s3)），而[第 5 节](#s5)、[第 6 节](#s6)和[第 10 节](#s10)中的激活函数、参数初始化和归一化正是为控制它们而存在的。这几点中的任何一点，都足以驳倒“总是”。
:::

::: exercise id=e4 level=2 kind=calculation minutes=10
对 $f(x_1, x_2) = x_1^2x_2 + \exp(x_1x_2)$ 在 $(x_1, x_2) = (1, 2)$ 处：

(a) 写出带有命名中间变量的计算图并求值；

(b) 用一次前向模式传播计算 $\partial f/\partial x_1$，切向量取 $(\dot x_1, \dot x_2) = (1, 0)$；

(c) 用一次反向模式传播计算两个偏导数；

(d) 对函数 $\mathbb{R}^n \to \mathbb{R}$，求完整梯度时每种模式各需要几次传播？
:::

::: solution
**(a)** 把 $f$ 拆成每个节点一个运算，使每个节点的局部导数都容易写出：

| 节点 | 运算 | 值 |
|---|---|---|
| $v_1$ | $x_1^2$ | 1 |
| $v_2$ | $v_1x_2$ | 2 |
| $v_3$ | $x_1x_2$ | 2 |
| $v_4$ | $\exp v_3$ | $e^2 = 7.3891$ |
| $f$ | $v_2 + v_4$ | 9.3891 |

**(b)** 前向模式在每个值旁边携带一个切向量 $\dot v$，从
$\dot x_1 = 1$，$\dot x_2 = 0$（即求导的方向）出发，对其输入的切向量应用每个节点的求导规则：

$$
\begin{aligned}
\dot v_1 &= 2x_1\dot x_1 = 2, &
\dot v_2 &= \dot v_1x_2 + v_1\dot x_2 = 4,\\
\dot v_3 &= \dot x_1x_2 + x_1\dot x_2 = 2, &
\dot v_4 &= v_4\dot v_3 = 14.778,\\
\dot f &= \dot v_2 + \dot v_4 = 18.778.
\end{aligned}
$$

于是 $\partial f/\partial x_1 = 18.778$。手算为 $\partial f/\partial x_1 = 2x_1x_2 + x_2e^{x_1x_2} = 4 + 2e^2$，数值相同。

**(c)** 反向模式从 $\bar f = \partial f/\partial f = 1$ 出发，沿计算图向后扫一遍，把节点的伴随量乘以局部导数，送给该节点的每个输入。被使用两次的变量，会收到沿每次使用送来的量之和，这就是对各条路径求和的链式法则。按反向拓扑顺序：

$$
\begin{aligned}
\bar v_2 &= \bar f = 1, & \bar v_4 &= \bar f = 1,\\
\bar v_3 &= \bar v_4v_4 = e^2 = 7.389, & &\\
\bar v_1 &= \bar v_2x_2 = 2, & &\\
\bar x_1 &= \underbrace{\bar v_1\cdot 2x_1}_{\text{经由 } v_1} + \underbrace{\bar v_3x_2}_{\text{经由 } v_3} = 4 + 14.778 = 18.778, & &\\
\bar x_2 &= \underbrace{\bar v_2v_1}_{\text{经由 } v_2} + \underbrace{\bar v_3x_1}_{\text{经由 } v_3} = 1 + 7.389 = 8.389. & &
\end{aligned}
$$

一次反向扫描就给出了两个偏导数。两者都与手算一致，其中 $\partial f/\partial x_2 = x_1^2 + x_1e^{x_1x_2} = 1 + e^2$。下面的检验用 PyTorch 做同样的事：用 `backward()` 做反向扫描，用 `torch.func.jvp` 做前向传播。

```python
import math
import torch
from torch.func import jvp

def f(x1, x2):
    return x1 ** 2 * x2 + torch.exp(x1 * x2)

x1 = torch.tensor(1.0, dtype=torch.double, requires_grad=True)
x2 = torch.tensor(2.0, dtype=torch.double, requires_grad=True)
value = f(x1, x2)
value.backward()                                   # one reverse pass: both partials
print(f"f = {value.item():.4f}   df/dx1 = {x1.grad.item():.4f}   "
      f"df/dx2 = {x2.grad.item():.4f}")

point = (torch.tensor(1.0), torch.tensor(2.0))
tangent = (torch.tensor(1.0), torch.tensor(0.0))       # the direction (1, 0)
_, df_dx1 = jvp(f, point, tangent)                     # one forward pass
print(f"forward mode, tangent (1, 0): {df_dx1.item():.4f}")
print(f"by hand: 4 + 2e^2 = {4 + 2 * math.e ** 2:.4f},  "
      f"1 + e^2 = {1 + math.e ** 2:.4f}")
```

```output
f = 9.3891   df/dx1 = 18.7781   df/dx2 = 8.3891
forward mode, tangent (1, 0): 18.7781
by hand: 4 + 2e^2 = 18.7781,  1 + e^2 = 8.3891
```

**(d)** 前向模式每次传播只产生一个方向导数，即雅可比矩阵的一列，所以函数 $\mathbb{R}^n \to \mathbb{R}$ 的梯度需要 $n$ 次传播（每个基方向一次）。反向模式每次传播产生雅可比矩阵的一行；输出为标量时，雅可比矩阵只有一行，所以一次传播就给出整个梯度，代价是计算 $f$ 的一个较小的常数倍（[第 4 节](#s4)）。对于有 $10^6$ 个参数的网络，这就是一次传播与一百万次传播的差别；这也是训练采用反向模式的原因。反向模式的代价是内存：值 $v_i$ 必须一直存储（即记录带 tape），直到扫描到它们为止。
:::

::: exercise id=e5 level=2 kind=derivation minutes=10
(a) 利用 $\boldsymbol{\delta}^{(l)} = (\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)})\odot\phi'(\mathbf{z}^{(l)})$，
证明：若某个 ReLU 单元的预激活对每个训练样本都是负的，则它的输入权重和偏置得到的梯度为零，所以朴素的梯度下降永远无法让它复活。再证明解耦权重衰减也无法让它复活。

(b) 在实验 1 的代码中，初始化之后令 `b1[5] = -10`，以
$\eta = 0.05$ 训练 3,000 步。确认 `W1[:, 5]` 和 `b1[5]` 的梯度始终恰好为零，并且该单元的参数最终停在起点。

(c) 说出两种能防止这类单元出现、或让它们恢复的改动。
:::

::: solution
**(a)** 写出第 $l$ 层第 $j$ 个单元的公式：
$\delta^{(l)}_j = \phi'(z^{(l)}_j)\,(\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)})_j$。对 ReLU，
当 $z < 0$ 时 $\phi'(z) = 0$。若对每个训练样本 $n$ 都有 $z_j^{(l)} < 0$，则无论上层传来什么，对每个 $n$ 都有
$\delta^{(l)}_{j,n} = 0$。该单元的输入参数得到

$$
\frac{\partial\mathcal{L}}{\partial W^{(l)}_{ij}} = \sum_n h^{(l-1)}_{i,n}\,\delta^{(l)}_{j,n} = 0,
\qquad
\frac{\partial\mathcal{L}}{\partial b^{(l)}_j} = \sum_n\delta^{(l)}_{j,n} = 0,
$$

所以 $\theta \leftarrow \theta - \eta\cdot 0$ 使它们保持不变，该单元一直是死的：它的预激活不变，所以始终为负。（这一论断针对的是训练集。在 mini-batch 训练中，一个在某个 batch 上为负的单元，可能在另一个 batch 上为正，于是从那个 batch 得到梯度；只有当训练集中没有任何样本能激活某个单元时，它才是永久死亡的。）该单元的输出权重同样被冻结，因为它们的梯度是
$h^{(l)}_j\delta^{(l+1)}$，而 $h^{(l)}_j = 0$。

解耦权重衰减把更新换成 $\theta \leftarrow (1 - \eta\lambda)\theta - \eta g$。
当 $g = 0$ 时，这会把 $\mathbf{w}_j$ 和 $b_j$ 乘以同一个因子 $1 - \eta\lambda$，对任何合理的 $\eta\lambda < 1$，它都是正的。于是每个预激活
$z_j = \mathbf{w}_j^\top\mathbf{h} + b_j$ 也都乘以这个正因子，这会缩小 $|z_j|$，却不能改变它的符号。负数乘以正数仍是负数，所以该单元依旧死亡（而且只是渐近地向边界靠近）。加上动量时，该单元会靠死亡前积累的动量再滑行几步，然后停下；对于 Adam，随着梯度保持为零，$\hat m/(\sqrt{\hat v} + \epsilon)$ 趋于 0。

**(b)** 下面的代码块紧接在[实验 1](#lab1)的第一个代码块之后运行（在第 6 步就地训练 `p` 之前）。它复制初始网络，把单元 5 的偏置设为 $-10$，并在 3,000 步中记录该单元三组参数（输入权重、偏置和输出权重）上出现过的最大梯度绝对值。输入位于 $[-1, 1]$ 内，且这个随机种子下 `W1[0, 5]` 为 0.109，所以在整个输入范围上 $z_5 = 0.109x - 10 < 0$。

```python
q = {k: v.copy() for k, v in p.items()}      # p is still the untrained Step 1 network
q["b1"][5] = -10.0                           # unit 5: z < 0 everywhere on [-1, 1]
z5 = forward(q, X)[1][1][:, 5]               # the cache is (X, Z1, H1)
print(f"unit 5 at the start: W1 {q['W1'][0, 5]:.5f}, b1 {q['b1'][5]:.1f}, "
      f"W2 {q['W2'][5, 0]:.5f}, largest z over the data {z5.max():.3f}")

largest_grad = 0.0
for step in range(3000):
    Y, cache = forward(q, X)
    g = backward(q, cache, Y, T)
    largest_grad = max(largest_grad, np.abs(g["W1"][:, 5]).max(),
                       abs(g["b1"][5]), abs(g["W2"][5, 0]))
    for k in q:
        q[k] -= 0.05 * g[k]

print(f"largest |gradient| on unit 5 in 3,000 steps: {largest_grad}")
print(f"unit 5 at the end:   W1 {q['W1'][0, 5]:.5f}, b1 {q['b1'][5]:.1f}, "
      f"W2 {q['W2'][5, 0]:.5f}")
print(f"final training MSE {mse(q, X, T):.2e}, validation MSE {mse(q, Xval, Tval):.2e}")
never_active = int(np.sum(~(forward(q, X)[1][2] > 0).any(axis=0)))
print("hidden units never active on the training set:", never_active)
```

```output
unit 5 at the start: W1 0.10894, b1 -10.0, W2 -0.08024, largest z over the data -9.891
largest |gradient| on unit 5 in 3,000 steps: 0.0
unit 5 at the end:   W1 0.10894, b1 -10.0, W2 -0.08024
final training MSE 2.81e-04, validation MSE 3.68e-04
hidden units never active on the training set: 2
```

该单元三个参数上的最大梯度恰好是 0.0，而不是一个很小的数，而且什么都没有移动：这个单元从第 0 步起就退出了网络。用其余的单元，训练达到均方误差 $2.8 \times 10^{-4}$（验证集 $3.7 \times 10^{-4}$），与实验 1 的第 6 步相同，所以损失曲线上没有任何迹象表明丢了一个单元。最后有两个隐藏单元从不激活：单元 5，以及在训练中死亡的另一个，就像实验 1 中有一个那样。这就是死亡的代价：容量不再被使用，而损失里没有任何信号。

**(c)** 预防的办法，是一开始就让单元远离很负的偏置：用较低的学习率（大的更新会把偏置推到很负的位置）、用 He 初始化并把偏置置零，或在最初几次迭代中用预热得到更小的步长。恢复则需要在负侧有非零导数，所以可以使用 leaky ReLU，它在负侧的斜率是 $a = 0.01$，或者使用 GELU 或 SiLU（[第 5 节](#s5)）；也可以监测从不激活的单元所占的比例，并重新初始化那些死亡的单元。
:::

::: exercise id=e6 level=1 kind=conceptual minutes=5
对一个由方阵 ReLU 层（$n_{\text{in}} = n_{\text{out}} = n$，无归一化）堆成的深层网络，用三种方式初始化：He 正态（$\sigma_w^2 = 2/n_{\text{in}}$）、Glorot 正态
（$\sigma_w^2 = 2/(n_{\text{in}} + n_{\text{out}})$）以及 PyTorch 的 `nn.Linear` 默认初始化（权重和偏置取自 $U(-1/\sqrt{n_{\text{in}}}, 1/\sqrt{n_{\text{in}}})$）。不做计算，回答：

(a) 三者中哪一个能让预激活的尺度随深度保持不变？另外两个会发生什么？

(b) 在默认初始化下，实测的预激活标准差最终不再下降，而停在一个下限上。为什么？为什么这个下限救不了训练？

(c) 为什么实验 3 到 5 用默认初始化也能过关？什么时候你会显式调用
`nn.init.kaiming_normal_`？
:::

::: solution
**(a)** [第 6 节](#s6)的式 6.1 给出预激活的方差为
$n\sigma_w^2\,\mathbb{E}[h^2]$，而对 ReLU，输出的二阶矩是（对称）输入方差的一半，所以每一层把方差乘以 $n\sigma_w^2/2$。对 He，
$n\cdot(2/n)/2 = 1$：每一层的尺度相同。对 $n_{\text{in}} = n_{\text{out}} = n$ 的 Glorot，
$\sigma_w^2 = 1/n$，这是 tanh 式的尺度，因子为 $\frac12$：方差每层减半，标准差每层缩小到原来的 $1/\sqrt2$。对默认初始化，权重方差为 $1/(3n)$，是 He 的六分之一，因子为 $\frac16$：标准差每层缩小到原来的 $1/\sqrt6$，即缩小 $\sqrt6 = 2.4$ 倍。反向信号服从同样的因子（对方阵层，扇入与扇出相同），所以到达靠前各层的梯度按同样的比例下降。

**(b)** 每一层都会加上自己的偏置，而偏置的方差（默认初始化下为 $1/(3n)$）不会随深度缩小。一旦传播的信号低于它，就由偏置决定尺度：
$v = v/6 + 1/(3n)$ 给出 $v = 0.4/n$，对 $n = 256$，标准差为 $\sqrt{0.4/256} = 0.040$，这就是第 6 节中那个算例的下限。但偏置对每个输入都是一样的。对学习起作用的，是激活中依赖于 $\mathbf{x}$ 的那一部分，它仍按上述因子不断缩小，而常数部分把总量维持在下限。到第 10 层，各个输入几乎得到同一个输出向量，而第一层的梯度在反向途中要乘以约 $(1/\sqrt6)^9 \approx 3 \times 10^{-4}$，几乎不动。下面的代码块在十层、宽度 256、1,000 个高斯输入的情形下，测量这两个量。

```python
import math
import torch

n, depth, samples = 256, 10, 1000
gen = torch.Generator().manual_seed(0)
x = torch.randn(samples, n, generator=gen)
for name in ("He", "Glorot", "default"):
    h = x
    for layer in range(1, depth + 1):
        if name == "default":                      # nn.Linear: U(-1/sqrt(n), 1/sqrt(n))
            a = 1 / math.sqrt(n)
            W = (torch.rand(n, n, generator=gen) * 2 - 1) * a
            bias = (torch.rand(n, generator=gen) * 2 - 1) * a
        else:
            std = math.sqrt(2 / n) if name == "He" else math.sqrt(2 / (n + n))
            W, bias = torch.randn(n, n, generator=gen) * std, torch.zeros(n)
        z = h @ W + bias
        h = torch.relu(z)
        if layer in (1, 5, 10):
            over_inputs = z.std(dim=0).mean().item()   # how much a unit varies with x
            print(f"{name:8s} layer {layer:2d}: std of z {z.std():.4f}   "
                  f"std of a unit over the inputs {over_inputs:.2e}")
```

```output
He       layer  1: std of z 1.4154   std of a unit over the inputs 1.41e+00
He       layer  5: std of z 1.2681   std of a unit over the inputs 7.93e-01
He       layer 10: std of z 1.0423   std of a unit over the inputs 4.71e-01
Glorot   layer  1: std of z 1.0016   std of a unit over the inputs 1.00e+00
Glorot   layer  5: std of z 0.2631   std of a unit over the inputs 1.47e-01
Glorot   layer 10: std of z 0.0576   std of a unit over the inputs 1.98e-02
default  layer  1: std of z 0.5799   std of a unit over the inputs 5.79e-01
default  layer  5: std of z 0.0454   std of a unit over the inputs 9.39e-03
default  layer 10: std of z 0.0383   std of a unit over the inputs 1.05e-04
```

在默认初始化下，预激活稳定在 0.04 左右，但一个单元随*输入*变化的幅度已从 0.58 降到 $10^{-4}$，约为总量的 0.3%。Glorot 网络表现出 $\sqrt2$ 的衰减（它在第 10 层测得的 0.058 与预测值 $2^{-9/2} = 0.044$ 在同一量级；十个随机层的一次抽样，会在它周围有百分之几十的波动），而 He 网络把两个量都保持在 1 的量级。

**(c)** 他们的网络，64 到 128 到 128 到 10，只有三个权重层，所以收缩只在两个 ReLU 层上累积（两次传递共缩小 6 倍标准差，而十层例子的九次传递约缩小 3,000 倍），而且输出从接近零开始，这正是分类器想要的：初始损失接近 $\ln 10 = 2.303$（实验 5 的基线从 2.309 开始）。Adam 还会重新缩放步长，所以小梯度并不致命。归一化层同样会在每一层重置尺度。对没有归一化或残差连接的深层 ReLU 堆叠（第 6 节的十层例子就是这种情形），应调用 `nn.init.kaiming_normal_(w, nonlinearity="relu")` 并把偏置置零；或者在[第 14 节](#s14)的激活尺度检查显示信号随深度缩小或增大时，也这样做。
:::

::: exercise id=e7 level=2 kind=calculation minutes=10
设 $\mathcal{L}(\boldsymbol{\theta}) = \tfrac12(\theta_1^2 + 64\theta_2^2)$。重球动量为
$\mathbf{v} \leftarrow \mu\mathbf{v} - \eta\nabla\mathcal{L}(\boldsymbol{\theta})$，
$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \mathbf{v}$；Nesterov 动量在前瞻点处读取梯度，
$\mathbf{v} \leftarrow \mu\mathbf{v} - \eta\nabla\mathcal{L}(\boldsymbol{\theta} + \mu\mathbf{v})$，
$\boldsymbol{\theta} \leftarrow \boldsymbol{\theta} + \mathbf{v}$。（这是[第 7 节](#s7)的更新式，只是把速度按 $-\eta$ 重新缩放；迭代点以及稳定性上限都相同。）

(a) 求梯度下降的最大稳定学习率。

(b) 分别求 $\mu = 0.9$ 时重球动量的最大稳定 $\eta$，以及 $\mu = 0.9$ 时 Nesterov 动量的最大稳定 $\eta$。

(c) 求 $\eta = 0.03$ 时梯度下降使 $\theta_1$ 每步的收缩因子，以及把 $\theta_1$ 缩小到千分之一所需的步数。

(d) 求这个损失的最优重球 $\eta$ 和 $\mu$、每步的渐近收缩因子，以及缩小到千分之一所需的步数。
:::

::: solution
这个损失是二次函数，海森矩阵为 $\operatorname{diag}(1, 64)$，所以每个坐标都是一个独立的一维问题，曲率 $\lambda$ 为 1 或 64，$\lambda_{\max} = 64$。记 $a = \eta\lambda$ 为以曲率为单位的步长。

**(a)** 对单个坐标，梯度下降为 $\theta \leftarrow \theta - \eta\lambda\theta = (1 - a)\theta$。
它收敛当且仅当 $|1 - a| < 1$，即 $0 < a < 2$，所以对所有坐标要求
$\eta < 2/\lambda_{\max} = 2/64 = 0.03125$。决定上限的是陡峭的方向。

**(b)** 加入动量后，一个坐标的状态为 $(\theta, v)$，更新是线性的，所以该过程收敛当且仅当 $2 \times 2$ 更新矩阵的两个特征值的模都小于 1。对二次多项式 $x^2 - \operatorname{tr}x + \det$，这成立当且仅当
$|\det| < 1$，$1 - \operatorname{tr} + \det > 0$ 且 $1 + \operatorname{tr} + \det > 0$（朱利判据：它们说的是，多项式在 $x = 1$ 和 $x = -1$ 处为正，且根之积在单位圆内）。

*重球。* $v' = \mu v - a\theta$，$\theta' = \theta + v' = (1 - a)\theta + \mu v$，所以矩阵是
$\begin{pmatrix}1 - a & \mu\\ -a & \mu\end{pmatrix}$，迹为 $1 - a + \mu$，行列式为
$\mu(1 - a) + a\mu = \mu$。于是 $1 - \operatorname{tr} + \det = a > 0$ 恒成立，而
$1 + \operatorname{tr} + \det = 2 + 2\mu - a > 0$ 给出 $a < 2(1 + \mu)$。条件
$|\det| = \mu < 1$ 成立。取 $\lambda_{\max} = 64$，$\mu = 0.9$：

$$
\eta < \frac{2(1 + \mu)}{\lambda_{\max}} = \frac{3.8}{64} = 0.0594.
$$

*Nesterov。* $v' = \mu v - a(\theta + \mu v) = -a\theta + \mu(1 - a)v$，
$\theta' = \theta + v' = (1 - a)\theta + \mu(1 - a)v$。矩阵为
$\begin{pmatrix}1 - a & \mu(1 - a)\\ -a & \mu(1 - a)\end{pmatrix}$，迹为 $(1 - a)(1 + \mu)$，行列式为
$\mu(1 - a)^2 + a\mu(1 - a) = \mu(1 - a)$。于是
$1 - \operatorname{tr} + \det = 1 - (1 - a)(1 + \mu) + \mu(1 - a) = a > 0$，而
$1 + \operatorname{tr} + \det = 1 + (1 - a)(1 + 2\mu) > 0$ 给出 $a < (2 + 2\mu)/(1 + 2\mu)$。
（条件 $|\det| < 1$ 给出较弱的 $a < 1 + 1/\mu$。）所以

$$
\eta < \frac{2(1 + \mu)}{(1 + 2\mu)\lambda_{\max}} = \frac{3.8}{2.8\cdot 64} = 0.0212.
$$

这个值*低于*梯度下降的上限 0.03125，而不是高于它：前瞻梯度也会对速度作出反应，步长一大就更早地冲过头。Nesterov 动量并不是让训练更稳定的办法。

下面的代码块模拟这三种情形，每种都从 $(1, 1)$ 出发，并在上限的略内侧和略外侧测试收敛性，同时也重现了 (c) 和 (d)。

```python
import numpy as np

lam = np.array([1.0, 64.0])                        # Hessian eigenvalues of the loss


def run(eta, mu, steps, theta0=(1.0, 1.0), nesterov=False):
    """Heavy ball, or Nesterov if asked; mu = 0 is plain gradient descent."""
    theta, v = np.array(theta0), np.zeros(2)
    norms = [np.linalg.norm(theta)]
    with np.errstate(all="ignore"):
        for _ in range(steps):
            look = theta + mu * v if nesterov else theta   # where the gradient is read
            v = mu * v - eta * lam * look
            theta = theta + v
            norms.append(np.linalg.norm(theta))
    return np.array(norms)


def survives(*args, **kw):
    return run(*args, **kw)[-1] < 1e-6


print("(a) gradient descent, limit 2/64 = 0.03125")
print("   eta 0.0311 converges:", survives(0.0311, 0.0, 3000),
      "  eta 0.0313 converges:", survives(0.0313, 0.0, 3000))
print("(b) heavy ball, mu 0.9, limit 3.8/64 = 0.05938")
print("   eta 0.0590 converges:", survives(0.0590, 0.9, 5000),
      "  eta 0.0596 converges:", survives(0.0596, 0.9, 5000))
print("    Nesterov, mu 0.9, limit 3.8/(2.8 * 64) = 0.02121")
print("   eta 0.0210 converges:", survives(0.0210, 0.9, 5000, nesterov=True),
      "  eta 0.0214 converges:", survives(0.0214, 0.9, 5000, nesterov=True))


def steps_to_shrink(norms, factor=1e3):
    return int(np.argmax(norms <= norms[0] / factor))


print("(c) gradient descent at eta 0.03")
print("   theta_1 alone:", steps_to_shrink(run(0.03, 0.0, 400, (1.0, 0.0))),
      "steps;  theta_2 alone:", steps_to_shrink(run(0.03, 0.0, 400, (0.0, 1.0))),
      "steps;  from (1, 1):", steps_to_shrink(run(0.03, 0.0, 400)), "steps")
eta, mu = 4 / 81, (7 / 9) ** 2
print(f"(d) heavy ball at eta {eta:.4f}, mu {mu:.4f}")
print("   from (1, 1):", steps_to_shrink(run(eta, mu, 200)),
      "steps;  asymptotic estimate:", f"{np.log(1e3) / -np.log(7 / 9):.1f} steps")
```

```output
(a) gradient descent, limit 2/64 = 0.03125
   eta 0.0311 converges: True   eta 0.0313 converges: False
(b) heavy ball, mu 0.9, limit 3.8/64 = 0.05938
   eta 0.0590 converges: True   eta 0.0596 converges: False
    Nesterov, mu 0.9, limit 3.8/(2.8 * 64) = 0.02121
   eta 0.0210 converges: True   eta 0.0214 converges: False
(c) gradient descent at eta 0.03
   theta_1 alone: 227 steps;  theta_2 alone: 83 steps;  from (1, 1): 216 steps
(d) heavy ball at eta 0.0494, mu 0.6049
   from (1, 1): 44 steps;  asymptotic estimate: 27.5 steps
```

**(c)** 在 $\eta = 0.03$ 时，坐标 $\theta_1$（曲率为 1）每步乘以 $1 - 0.03 = 0.97$。要缩小到千分之一，解 $0.97^t = 10^{-3}$：
$t = \ln 1000/(-\ln 0.97) = 6.908/0.03046 = 226.8$，所以是 227 步。陡峭的坐标每步乘以 $1 - 0.03\cdot 64 = -0.92$：它的符号来回振荡，缩小到千分之一需要
$6.908/0.0834 = 83$ 步。慢的方向起支配作用，所以整个过程大约需要 227 步，从 $(1, 1)$ 出发按范数 $\|\boldsymbol\theta\|$（起始值为 $\sqrt2$）测得是 216 步。想靠增大步长来加快平缓方向，余地不大，因为 $\eta = 0.03$ 已经是上限的 96%。

**(d)** 对重球，只要 $|1 - a + \mu| < 2\sqrt\mu$，即
$(1 - \sqrt\mu)^2 < a < (1 + \sqrt\mu)^2$，$x^2 - (1 - a + \mu)x + \mu$ 的根就是复数，模为
$\sqrt\mu$，与 $a$ 无关。此时每个方向每步的收缩因子都是 $\sqrt\mu$，所以最佳选择是让这个区间恰好覆盖两个 $a$ 值，即 $\eta\cdot 1$ 和 $\eta\cdot 64$：

$$
\eta = (1 - \sqrt\mu)^2,
\qquad
64\eta = (1 + \sqrt\mu)^2
\;\Rightarrow\;
\frac{1 + \sqrt\mu}{1 - \sqrt\mu} = \sqrt{64} = 8
\;\Rightarrow\;
\sqrt\mu = \frac79.
$$

于是 $\mu = (7/9)^2 = 49/81 = 0.605$，$\eta = (2/9)^2 = 4/81 = 0.0494$，这就是 Polyak 公式
$\eta = 4/(\sqrt{\lambda_{\max}} + \sqrt{\lambda_{\min}})^2 = 4/(8 + 1)^2$ 以及
$\mu = \big((\sqrt\kappa - 1)/(\sqrt\kappa + 1)\big)^2$（$\kappa = 64$）。渐近收缩因子是每步 $\sqrt\mu = 7/9 = 0.778$，所以缩小到千分之一需要
$6.908/\ln(9/7) = 27.5$，即 28 步，而梯度下降需要 227 步：步数大约相差 $\sqrt\kappa = 8$ 倍。模拟需要 44 步，因为在最优点处，两个坐标都恰好位于复数区域的边缘（平缓的坐标 $a = (1 - \sqrt\mu)^2$，陡峭的坐标 $a = (1 + \sqrt\mu)^2$），并且各有一个二重根，它们的解形如 $(c_1 + c_2t)(\pm 7/9)^t$，因子 $t$ 拖慢了衰减。对梯度下降用同样的度量得到 216，所以实际的加速约为五倍，而不是八倍。剩下的一点保留意见是，最优的 $\mu$ 和 $\eta$ 需要知道 $\lambda_{\min}$ 和 $\lambda_{\max}$，而在网络中人们并不知道它们；实践中取 $\mu = 0.9$，再调 $\eta$。
:::

::: exercise id=e8 level=2 kind=calculation minutes=10
对一个参数手算两步 Adam，梯度为 $g_1 = 1$ 和 $g_2 = 3$，
$\beta_1 = 0.9$，$\beta_2 = 0.999$，$\epsilon$ 可忽略，学习率为 $\eta$。

(a) 给出 $t = 1$ 和 $t = 2$ 时的 $m_t$、$v_t$、$\hat m_t$、$\hat v_t$ 以及步长。

(b) 不做偏差修正时，步长会是多少？

(c) 证明：对均值恒定的梯度，$\mathbb{E}[m_t] = (1 - \beta_1^t)\,\mathbb{E}[g]$。
:::

::: solution
**(a)** 递推式为 $m_t = \beta_1m_{t-1} + (1 - \beta_1)g_t$ 和
$v_t = \beta_2v_{t-1} + (1 - \beta_2)g_t^2$，二者都从 0 开始；修正后的值分别除以
$1 - \beta_1^t$ 和 $1 - \beta_2^t$，步长为 $\eta\,\hat m_t/(\sqrt{\hat v_t} + \epsilon)$。

对 $t = 1$：$m_1 = 0.1\cdot 1 = 0.1$，$v_1 = 0.001\cdot 1 = 0.001$。修正因子为
$1 - 0.9 = 0.1$ 和 $1 - 0.999 = 0.001$，所以 $\hat m_1 = 1$，$\hat v_1 = 1$，步长为 $\eta\cdot 1/1 = \eta$。

对 $t = 2$：$m_2 = 0.9\cdot 0.1 + 0.1\cdot 3 = 0.39$，
$v_2 = 0.999\cdot 0.001 + 0.001\cdot 9 = 0.000999 + 0.009 = 0.009999$。修正因子为
$1 - 0.81 = 0.19$ 和 $1 - 0.998001 = 0.001999$，所以 $\hat m_2 = 0.39/0.19 = 2.0526$，
$\hat v_2 = 0.009999/0.001999 = 5.0020$，$\sqrt{\hat v_2} = 2.2365$。步长为
$\eta\cdot 2.0526/2.2365 = 0.918\,\eta$。

尽管两个梯度相差三倍，两步的大小都约为 $\eta$。这就是 Adam 的决定性特征：步长是归一化的梯度，所以它的大小由 $\eta$ 决定，而不是由梯度的尺度决定。

**(b)** 不做修正时，步长为 $\eta\,m_t/\sqrt{v_t}$。$t = 1$ 时：$0.1/\sqrt{0.001} = 3.162\,\eta$。
$t = 2$ 时：$0.39/\sqrt{0.009999} = 3.900\,\eta$。最初几步大了三到四倍。原因是两个平均值都从零开始，而 $v$（它的 $\beta_2 = 0.999$ 更接近 1）相对而言比 $m$ 起点离真值更远：$m_1$ 是梯度的 0.1，$v_1$ 是梯度平方的 0.001，所以 $\sqrt{v_1}$ 是梯度大小的 0.0316，比值为 $0.1/0.0316 = 3.16$。如果 $\beta_2$ 是 0.95，那么未修正的第一步反而会太*小*（$0.1/\sqrt{0.05} = 0.45\,\eta$）。下面的代码块核对这些数字。

```python
import math

beta1, beta2 = 0.9, 0.999
m = v = 0.0
for t, g in ((1, 1.0), (2, 3.0)):
    m = beta1 * m + (1 - beta1) * g
    v = beta2 * v + (1 - beta2) * g * g
    m_hat, v_hat = m / (1 - beta1 ** t), v / (1 - beta2 ** t)
    print(f"t={t}: m {m:.4f}  v {v:.6f}  m_hat {m_hat:.4f}  v_hat {v_hat:.4f}")
    print(f"     step/eta {m_hat / math.sqrt(v_hat):.4f}   "
          f"uncorrected step/eta {m / math.sqrt(v):.4f}")
```

```output
t=1: m 0.1000  v 0.001000  m_hat 1.0000  v_hat 1.0000
     step/eta 1.0000   uncorrected step/eta 3.1623
t=2: m 0.3900  v 0.009999  m_hat 2.0526  v_hat 5.0020
     step/eta 0.9178   uncorrected step/eta 3.9002
```

**(c)** 展开递推式。由 $m_0 = 0$，

$$
m_t = (1 - \beta_1)\sum_{s=1}^{t}\beta_1^{\,t-s}g_s.
$$

（检查 $t = 2$：$0.1\cdot(0.9g_1 + g_2) = 0.09g_1 + 0.1g_2$，即 (a) 中的 $0.9\cdot 0.1g_1 + 0.1g_2$。）对所有 $s$ 取 $\mathbb{E}[g_s] = \mathbb{E}[g]$，求期望并对等比级数求和：

$$
\mathbb{E}[m_t] = (1 - \beta_1)\,\mathbb{E}[g]\sum_{k=0}^{t-1}\beta_1^k
= (1 - \beta_1)\,\mathbb{E}[g]\,\frac{1 - \beta_1^t}{1 - \beta_1}
= (1 - \beta_1^t)\,\mathbb{E}[g].
$$

所以 $m_t$ 恰好以因子 $1 - \beta_1^t$ 低估了均值，除以这个因子就消除了偏差；同样的论证给出二阶矩的 $\mathbb{E}[v_t] = (1 - \beta_2^t)\,\mathbb{E}[g^2]$。修正在大约最初 $1/(1 - \beta)$ 步内起作用，对 $m$ 约为 10 步，对 $v$ 约为 1,000 步，并随着 $\beta^t \to 0$ 而逐渐消失。
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
用三四句话回答：为什么加到梯度上的 L2 正则化
（`torch.optim.Adam(weight_decay=λ)`）与 AdamW 的解耦权重衰减不是一回事？耦合版本对哪些参数的正则化最弱？哪个 PyTorch 调用给出解耦版本？为什么对朴素的 SGD 来说这个区别消失了？
:::

::: solution
在 Adam 中，L2 项 $\lambda\theta$ 在更新*之前*加到梯度上，所以它和梯度的其余部分一起被 $\sqrt{\hat v}$ 除：参数 $i$ 每步被收缩约 $\eta\lambda\theta_i/\sqrt{\hat v_i}$，惩罚被那个本来要让各步长相等的归一化重新缩放了，于是梯度历史较大（$\sqrt{\hat v_i}$ 较大）的参数受到的正则化最弱：取 $\eta = 10^{-3}$，$\lambda = 10^{-4}$，梯度 RMS 为 10 的参数每步损失其值的 $10^{-7}/10 = 10^{-8}$，而 RMS 为 0.1 的参数损失 $10^{-6}$。AdamW 在归一化之外减去 $\eta\lambda\theta_i$，使两者每步都收缩 $10^{-7}$，对每个参数的相对量都相同，它对应 `torch.optim.AdamW`（较新的版本也接受 `torch.optim.Adam(..., decoupled_weight_decay=True)`）。对朴素的 SGD，没有什么需要归一化的：$\theta \leftarrow \theta - \eta(g + \lambda\theta) = (1 - \eta\lambda)\theta - \eta g$，两种写法都是按 $1 - \eta\lambda$ 衰减，所以两种形式一致。
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
丢弃概率 $p = 0.4$ 的反向随机失活：

(a) 训练时，保留下来的激活被缩放多少倍？

(b) 证明单元输出的期望值不变。

(c) 如果忘了 `model.eval()`，评估时会出什么问题？

(d) 如果训练时省略缩放，而评估时仍关闭随机失活，会出什么问题？
:::

::: solution
**(a)** 一个单元以概率 $1 - p = 0.6$ 保留，保留下来的除以 $1 - p$：因子为 $1/0.6 = 5/3 \approx 1.67$。

**(b)** 输出为 $\tilde h = h\,m/(1 - p)$，其中 $m$ 以概率 $0.6$ 取 1，以概率 $0.4$ 取 0。于是

$$
\mathbb{E}[\tilde h] = 0.6\cdot\frac{h}{0.6} + 0.4\cdot 0 = h.
$$

所以下一层看到的期望是对的，而在评估时随机失活关闭，它看到的就是 $h$ 本身。不过输出是有噪声的：$\operatorname{Var}(\tilde h) = h^2\,p/(1 - p) = 0.667\,h^2$。取 $h = 2.5$、抽样一百万次的模拟，证实了这两个矩：

```python
import torch

p, h = 0.4, 2.5                      # drop probability, one activation value
generator = torch.Generator().manual_seed(0)
keep = (torch.rand(1_000_000, generator=generator) >= p).float()
out = keep * h / (1 - p)                          # inverted dropout on one unit
print(f"scale {1 / (1 - p):.4f}   mean {out.mean():.3f} (h = {h})   "
      f"variance {out.var():.3f} (theory h^2 p/(1-p) = {h * h * p / (1 - p):.3f})")
```

```output
scale 1.6667   mean 2.501 (h = 2.5)   variance 4.166 (theory h^2 p/(1-p) = 4.167)
```

**(c)** 随机掩码一直处于激活状态，所以每次调用都把网络当作一个随机的子网络来评估：预测在不同调用之间会变化，准确率也低于真实模型（上面的方差被加到了每个单元上）。带抽样的指标无法在不同的运行之间比较。实验 5 的脚本 D 展示了这一点：同样的权重，每次评估的准确率都不同，而且比评估模式下的值低几个百分点。如果模型还有批归一化，它会用当前 batch 的统计量，而不是滑动平均来归一化，所以结果依赖于 batch 大小。

**(d)** 这样训练时，下一层看到的输入的期望是 $0.6\,h$（每个单元以 0.6 的概率为 $h$，否则为 0），而评估时它看到的是 $h$：输入平均比它训练时见过的任何输入大 $1/0.6 = 1.67$ 倍，后面的每一层都产生系统性的偏移。两种约定是等价的，只要恰好有一方施加修正：要么训练时乘以 $1/(1 - p)$（反向随机失活，是标准做法），评估时什么也不做；要么评估时乘以 $1 - p$，训练时什么也不做（原始的表述）。
:::

::: exercise id=e11 level=2 kind=calculation minutes=10
(a) 对任意 $m$ 推导 $\log\sum_je^{z_j} = m + \log\sum_je^{z_j - m}$，并解释为什么取
$m = \max_jz_j$ 能使右端既不上溢，也不会出现 $\log 0$。

(b) 手算 logits 为 $\mathbf{z} = (800, 803, 799)$、目标类别为 0 时的交叉熵。

(c) 在 NumPy 中证明：对这些 logits，朴素的 $-\log\operatorname{softmax}(\mathbf{z})_0$ 在 float64 下返回 `nan`，并求出使 `np.exp` 在 float64 下上溢的最小整数 logit。
:::

::: solution
**(a)** 从每一项中提出 $e^m$：$e^{z_j} = e^me^{z_j - m}$，所以
$\sum_je^{z_j} = e^m\sum_je^{z_j - m}$。取对数，并利用 $\log(ab) = \log a + \log b$：
$\log\sum_je^{z_j} = m + \log\sum_je^{z_j - m}$。它对每个 $m$ 都成立，因为这只是改写；选取 $m$ 是出于数值上的考虑。取 $m = \max_jz_j$ 时，每个指数
$z_j - m$ 都至多为 0，所以没有哪一项超过 $e^0 = 1$，不会上溢。而且最大值那一项恰好是 $e^0 = 1$，所以和至少为 1，它的对数至少为 0：和不会下溢为零，$\log 0$ 也不会出现。其他项可能下溢为 0（当
$z_j - m$ 很负时），这是无害的，因为与 1 相比它们可以忽略。于是交叉熵按
$\text{loss} = \operatorname{logsumexp}(\mathbf{z}) - z_y$ 计算，这是一次减法，没有除法，也没有对小概率取对数。

**(b)** 这里 $m = 803$，三个平移后的指数是 $-3$、$0$ 和 $-4$：

$$
\sum_je^{z_j - m} = e^{-3} + 1 + e^{-4} = 0.049787 + 1 + 0.018316 = 1.068103,
$$

所以 $\operatorname{logsumexp}(\mathbf{z}) = 803 + \ln 1.068103 = 803 + 0.065884 = 803.065884$，并且

$$
\text{loss} = 803.065884 - 800 = 3.065884.
$$

目标不是最大的 logit，所以损失等于与最大值之差 3，再加上一个小的修正
$\ln(1 + e^{-3} + e^{-4}) = 0.0659$，这是另外两个 logit 所占的份额。
`F.cross_entropy` 返回同样的值 3.0659。

**(c)** 朴素的计算先取指数：$e^{800}$ 大于 float64 的最大数
$1.80 \times 10^{308} = e^{709.78}$，所以它是 `inf`，和是 `inf`，而 `inf/inf` 是
`nan`。float64 最大值的 $\ln$ 为 709.78，所以 `np.exp(709)` 还能放得下，而 `np.exp(710)`
上溢：710 是会上溢的最小整数 logit。（在 float32 中对应的阈值是 $\ln(3.4 \times 10^{38}) = 88.7$，所以 logits 超过 88 就会在那里上溢，这就是 log-sum-exp 形式不是可有可无的原因。）

```python
import numpy as np

z = np.array([800.0, 803.0, 799.0])
with np.errstate(all="ignore"):                    # silence the overflow warning
    naive = -np.log(np.exp(z)[0] / np.exp(z).sum())
    print("exp(800) =", np.exp(800.0), "  naive cross-entropy:", naive)

m = z.max()
lse = m + np.log(np.exp(z - m).sum())         # log-sum-exp, maximum removed
print(f"log-sum-exp {lse:.6f}   loss {lse - z[0]:.6f}")

with np.errstate(all="ignore"):
    print("exp(709) =", np.exp(709.0), "  exp(710) =", np.exp(710.0))
largest = np.finfo(np.float64).max
print("float64 max", largest, "  its logarithm", np.log(largest))
```

```output
exp(800) = inf   naive cross-entropy: nan
log-sum-exp 803.065884   loss 3.065884
exp(709) = 8.218407461554972e+307   exp(710) = inf
float64 max 1.7976931348623157e+308   its logarithm 709.782712893384
```
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
一个 10 类网络以 softmax 层结尾，它的输出又被传给 `F.cross_entropy`，后者再次施加 log-softmax，就像实验 5 的脚本 A 那样。不计算界，回答：

(a) 为什么训练损失无法逼近零？为什么类别越多，它的下限越高？

(b) 为什么训练中准确率仍然会提高？

(c) 为什么传到网络中的梯度很小？哪些样本几乎得不到梯度？
:::

::: solution
**(a)** 第二个 softmax 收到的“logits”是概率 $\mathbf{q}$：每个都在 $[0, 1]$ 内，和为 1。对至多相差 1 的数取 softmax，不可能给出高置信度。下面把这点说精确。设 $y$ 为真实类别，$\hat p_y = e^{q_y}/\sum_je^{q_j}$ 为第二个 softmax 给它的概率，于是几率（odds）为 $\hat p_y/(1 - \hat p_y) = e^{q_y}/\sum_{j\ne y}e^{q_j}$。
竞争者的 $q_j$ 之和为 $1 - q_y$，所以由詹森不等式（指数函数是凸的），

$$
\sum_{j\ne y}e^{q_j} \ge (K - 1)\,e^{(1 - q_y)/(K - 1)}
\quad\Rightarrow\quad
\frac{\hat p_y}{1 - \hat p_y} \le \frac{1}{K - 1}\exp\!\Big(\frac{Kq_y - 1}{K - 1}\Big) \le \frac{e}{K - 1},
$$

其中最后一步用到 $q_y \le 1$（指数随 $q_y$ 增大，在
$q_y = 1$ 时等于 1）。几率至多为 $e/(K - 1)$，意味着 $\hat p_y \le e/(e + K - 1)$，当
$\mathbf{q}$ 恰好是独热向量时取等号。因此损失 $-\ln\hat p_y$ 不可能低于
$\ln\big((e + K - 1)/e\big)$。当 $K = 10$ 时，它是 $\ln(11.718/2.718) = 1.461$，即实验 5 中看到的下限。类别越多，就有越多的竞争者分享剩余的质量，所以上界下降，损失的下限上升：

| $K$ | 2 | 10 | 100 | 1,000 |
|---|---|---|---|---|
| 可能的最大 $\hat p_y$ | 0.731 | 0.232 | 0.0267 | 0.0027 |
| 损失的下限 | 0.313 | 1.461 | 3.622 | 5.909 |

当 $K = 1{,}000$ 时，一个完全自信的网络得分为 5.909，而均匀猜测的得分是
$\ln 1000 = 6.908$，只好一点点。

**(b)** softmax 是单调的：概率最大的类别就是真实 logit 最大的类别，所以类别的排序恰好就是真实 logits 的排序。当真实类别的 $q_y$ 上升时，第二个 softmax 的损失仍然下降，当某个竞争者的 $q$ 上升时则上升，所以最小化它仍然会把真实类别推向排序的顶端。因此网络可以继续学习这个排序，而准确率只看排序。这就是这个 bug 藏在良好准确率背后的原因。

**(c)** 关于真实 logits $\mathbf{z}$ 的梯度要经过第一个 softmax 的雅可比矩阵
$\mathbf{J} = \operatorname{diag}(\mathbf{q}) - \mathbf{q}\mathbf{q}^\top$
（[第 3 节](#s3)），它的元素的绝对值至多为 $\frac14$（对角元是
$q_i(1 - q_i)$，非对角元是 $-q_iq_j$，而 $q_iq_j \le \frac14$，因为 $q_i + q_j \le 1$）。
梯度为 $\mathbf{J}(\hat{\mathbf{p}}_2 - \mathbf{y})$，其中 $\hat{\mathbf{p}}_2$ 是第二个 softmax 的输出，括号内的因子大小有界。因此梯度处处很小，并且当 $\mathbf{q}$ 趋近*任何*一个独热向量时，它都趋于零，无论这个热点类别是不是正确的。正确的损失在要紧的情形下表现不同：一个自信地*答错*的样本损失很大，梯度范数约为 1.4，而在双重 softmax 之下，它的损失约为 2.5，梯度要小一千多倍。下面的代码块在一个 10 类问题的五种情形下比较两种损失（设定真实 logit 和一个竞争者，其余八个为 0）。

```python
import numpy as np
import torch
import torch.nn.functional as F

K = 10
print(f"floor of the loss for K = {K}: {np.log((np.e + K - 1) / np.e):.4f}")


def losses_and_gradients(true_logit, other_logit):
    """Loss and logit-gradient norm, without and with the extra softmax."""
    z = torch.zeros(1, K)
    z[0, 0], z[0, 1] = true_logit, other_logit
    target = torch.tensor([0])
    results = []
    for double in (False, True):
        zz = z.clone().requires_grad_(True)
        loss = F.cross_entropy(F.softmax(zz, 1) if double else zz, target)
        grad, = torch.autograd.grad(loss, zz)
        results += [loss.item(), grad.norm().item()]
    return results


print(f"{'case':18s} {'loss':>8s} {'|grad|':>9s} | "
      f"{'loss(2x)':>8s} {'|grad|(2x)':>10s}")
cases = (("uniform", 0, 0), ("mildly right", 2, 0), ("confidently right", 8, 0),
         ("mildly wrong", 0, 2), ("confidently wrong", 0, 8))
for name, a, c in cases:
    l1, g1, l2, g2 = losses_and_gradients(a, c)
    print(f"{name:18s} {l1:8.4f} {g1:9.2e} | {l2:8.4f} {g2:10.2e}")
```

```output
floor of the loss for K = 10: 1.4612
case                   loss    |grad| | loss(2x) |grad|(2x)
uniform              2.3026  9.49e-01 |   2.3026   9.49e-02
mildly right         0.7966  5.79e-01 |   1.9593   2.49e-01
confidently right    0.0030  3.17e-03 |   1.4637   2.70e-03
mildly wrong         2.7966  1.06e+00 |   2.3492   7.06e-02
confidently wrong    8.0030  1.41e+00 |   2.4604   8.72e-04
```

一个自信的错误几乎得不到梯度（最后一行：$8.7 \times 10^{-4}$ 对 1.41），所以最需要纠正的样本，恰恰是优化器听到声音最小的那些，而一个自信且正确的样本，无论多么自信，损失都停在约 1.46。训练不会停下，因为较温和的情形仍会产生梯度，但它很慢，而且这个损失作为监控指标毫无意义。解决办法是传入 logits。
:::

::: exercise id=e13 level=1 kind=conceptual minutes=5
对手写反向传播的三次梯度检验，每次都使用中心差分，以及逐元素相对误差
$|a - n|/\max(10^{-8}, |a| + |n|)$，其中 $a$ 为解析梯度，$n$ 为数值梯度。对每一次，判断它是否指向一个 bug，以及下一步你会做什么。

(a) 一次 float64 检验在 $\epsilon_{\text{fd}} = 10^{-11}$ 下报告：典型元素的误差约为 $10^{-5}$，最差的达到 $10^{-2}$，分布在每个张量上，没有规律。

(b) 一次 float64 检验在 $\epsilon_{\text{fd}} = 10^{-5}$ 下报告：除了一个 ReLU 层中第一层偏置的一个元素误差为 $3 \times 10^{-3}$ 之外，其余各处误差都低于 $10^{-7}$；改变 $\epsilon_{\text{fd}}$ 时，这个元素的误差变化毫无规律。

(c) 一次 float64 检验在 $\epsilon_{\text{fd}} = 10^{-5}$ 下报告：第一层权重和偏置的每个元素误差都在 0.2 到 1 之间，而第二层的都低于 $10^{-7}$。
:::

::: solution
**(a)** 多半不是 bug。中心差分有两项误差：截断误差，随 $\epsilon_{\text{fd}}^2$ 下降；舍入误差，随 $u/\epsilon_{\text{fd}}$ 增长，其中 $u \approx 10^{-16}$。在
$\epsilon_{\text{fd}} = 10^{-11}$ 时，舍入项（对接近 0.3 的损失，量级为 $10^{-16}\cdot 0.3/10^{-11} \approx 3 \times 10^{-6}$）压倒了一切，并且它对每个张量一视同仁，包括那些不可能出错的张量，这是噪声而不是故障的特征。实验 1 的网络在这个 $\epsilon_{\text{fd}}$ 下，四个张量上的中位误差都在
$3 \times 10^{-6}$ 到 $3 \times 10^{-5}$ 之间（只有一个元素的输出偏置为 $9 \times 10^{-6}$），最差元素为 $3 \times 10^{-2}$。改用
$\epsilon_{\text{fd}} \approx 10^{-5}$ 重新运行（[第 14 节](#s14)）：真正的 bug 在这一改动下依然存在，而舍入伪影则会消失。

**(b)** 多半不是 bug。ReLU 层中的一个坏元素，其大小随 $\epsilon_{\text{fd}}$ 毫无规律地变化，这是折点的特征。如果某个样本在该单元上的预激活距 0 不到 $\epsilon_{\text{fd}}$，则 $b \pm \epsilon_{\text{fd}}$ 这两次求值落在折点的两侧，商就是两个斜率的平均，而解析梯度是该点所在那一段的导数。打印该单元在这个 batch 上最小的 $|z|$（实验 1 的第 3 步发现是 $2 \times 10^{-7}$，误差为 $8 \times 10^{-4}$）。然后用更小的 $\epsilon_{\text{fd}}$ 重新运行（实验 1 用 $10^{-7}$，误差降到 $2 \times 10^{-7}$），或者把这个点稍微挪一下。真正的 bug 在每个
$\epsilon_{\text{fd}}$ 下都是一样的。

**(c)** 这是 bug，而且检验指出了位置。第二层的梯度是对的，而它以下的每个梯度都是错的，所以第二层自己的梯度计算没有问题，错误出在把 $\boldsymbol{\delta}$ 从第二层传到第一层的那一步：缺失或错误的 ReLU 门，或者转置有误。在深层网络中，应该去看最顶端出错的那一层。实验 1 的第 4 步通过去掉这个门，恰好产生了这种模式：$\mathbf{W}^{(1)}$ 和 $\mathbf{b}^{(1)}$ 的误差在 0.29 到 1.00 之间，而 $\mathbf{W}^{(2)}$ 和
$\mathbf{b}^{(2)}$ 的误差为 $10^{-8}$ 或更小。
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
对一个 10 类分类器的每次训练，说出最可能的原因和首先要尝试的事。

(a) 损失从 2.30 开始，并停在那里。

(b) 损失在最初 200 步中从 2.3 降到 0.4，然后在第 230 步跳到 9，到第 240 步变成 `NaN`，梯度范数在此前不久飙升。

(c) 训练损失为 0.02 并仍在下降，而验证损失为 0.9，并且从第 8 个 epoch 起一直在上升。

(d) 训练损失和验证损失都从第 5 个 epoch 起停滞在 0.9，而阶梯式调度恰在那里把学习率降低了 100 倍。
:::

::: solution
**(a)** 初始损失 $2.30 = \ln 10$ 恰好正确，所以问题不在初始化；缺少的是学习。可能的原因：学习率为零或小得离谱；优化器是用错误（或空）的参数列表构建的；计算图被 `.detach()`、`.item()` 或一次 NumPy 往返切断；死亡单元；标签与输入不对应。第一步是让模型在一个 16 个样本的小 batch 上过拟合，同时打印每一层的梯度范数：梯度为零，指向计算图或参数；梯度非零而损失不动，指向学习率或优化器；而小 batch 能过拟合、完整数据集却不能，则指向数据管道和标签（[第 14 节](#s14)）。

**(b)** 对训练的这个阶段而言学习率过高（[第 14 节](#s14)中的“先降后飙”），也可能是被某个坏 batch 或损失中的上溢推倒的。损失在 200 步中一直正常，所以模型和数据基本是对的。降低 $\eta$（做范围测试，[第 9 节](#s9)），如果没有预热就加上预热，把全局梯度范数裁剪到 1.0，并从 logits 计算损失。如果这还不够，`torch.autograd.set_detect_anomaly(True)` 会指出第一个产生非有限值的运算。梯度范数在损失*之前*飙升是个明显的迹象：如果它从第 0 步起就在稳步增长，那么该怀疑的是缺少 `zero_grad()`（实验 5，脚本 B）。

**(c)** 过拟合：训练损失 0.02 对验证损失 0.9，后者从第 8 个 epoch 起上升，这是典型的差距。在大约第 8 个 epoch（验证损失的最小值）处早停，并保留那个检查点。然后缩小这个差距：权重衰减、随机失活、数据增强、更小的模型，或更多的数据，其中最有效的补救办法就是更多的数据（[第 11 节](#s11)）。

**(d)** 学习率降得太早：两个损失都很高且彼此接近，说明模型训练不足，而不是过拟合，进一步正则化只会让情况更糟。调度在第 5 个 epoch 就把步长降低了 100 倍，此时模型还没有到达一个好的区域，所以优化器再也无法取得进展。应使用更长的调度、更平缓的衰减（例如余弦调度，或者用 10 倍而不是 100 倍的因子），然后再检查模型是否太小（欠拟合）。
:::

::: exercise id=e15 level=3 kind=coding minutes=25
在实验 1 的 NumPy 网络中，实现带偏差修正的 Adam，作为更新那一行的直接替代。

(a) 对 SGD 和 Adam，在一个因子约为 3 的网格上，用 3,000 步全 batch 训练找出各自最好的学习率，并比较最终的训练 MSE 和损失曲线。

(b) 把 `X` 乘以 1,000，就像输入记录的单位是毫米而不是米一样（目标保持不变），然后在不重新标准化的情况下重复实验。

(c) 解释每种优化器发生了什么变化，以及什么办法能同时修复两者。
:::

::: solution
这段代码与[实验 1](#lab1)的第一个代码块（定义 `init`、`forward`、`backward`、`mse`、`X`、`T` 和 `p` 的那个）在同一个会话中运行，位于第 6 步就地训练 `p` 之前。两个优化器都从同一个保存下来的初始网络出发，所以只有更新规则不同。`Adam` 为每个张量保存两个滑动平均，并除以偏差修正因子，如[第 8 节](#s8)所述。`fit` 在每一步之前记录损失，所以曲线有 3,001 个点。发散的运行会上溢为 `inf` 和 `nan`，`sweep` 在挑选最佳学习率时会略去它们，并把它们打印为 `nan`。输出的 (a)、(b) 和 (c) 三块回答了练习的三个部分；(b') 块问的是，重新缩放初始权重能否代替标准化。

```python
p0 = {k: v.copy() for k, v in p.items()}      # the untrained Step 1 network, saved once


class SGD:
    def __init__(self, eta):
        self.eta = eta

    def step(self, q, g):
        for k in q:
            q[k] -= self.eta * g[k]


class Adam:
    def __init__(self, eta, beta1=0.9, beta2=0.999, eps=1e-8):
        self.eta, self.beta1, self.beta2, self.eps, self.t = eta, beta1, beta2, eps, 0
        self.m, self.v = {}, {}

    def step(self, q, g):
        self.t += 1
        for k in q:
            m = self.beta1 * self.m.get(k, 0.0) + (1 - self.beta1) * g[k]
            v = self.beta2 * self.v.get(k, 0.0) + (1 - self.beta2) * g[k] ** 2
            self.m[k], self.v[k] = m, v
            m_hat = m / (1 - self.beta1 ** self.t)      # bias corrections: both
            v_hat = v / (1 - self.beta2 ** self.t)      # averages start at zero
            q[k] -= self.eta * m_hat / (np.sqrt(v_hat) + self.eps)


def fit(optimiser, X, T, steps=3000):
    """Full-batch training from the saved initial network; returns the loss curve."""
    q = {k: v.copy() for k, v in p0.items()}
    curve = []
    with np.errstate(all="ignore"):              # a diverging run overflows to inf/nan
        for _ in range(steps):
            Y, cache = forward(q, X)
            curve.append(float(np.mean((Y - T) ** 2)))
            optimiser.step(q, backward(q, cache, Y, T))
        curve.append(mse(q, X, T))
    return curve


def sweep(label, make_optimiser, X, T, etas):
    """Train at every learning rate on the grid; return the best finite curve."""
    best_eta, best_curve = None, None
    for eta in etas:
        curve = fit(make_optimiser(eta), X, T)
        print(f"  {label:4s} eta {eta:7.0e}: final MSE {curve[-1]:9.3e}")
        finite = np.isfinite(curve[-1])
        if finite and (best_curve is None or curve[-1] < best_curve[-1]):
            best_eta, best_curve = eta, curve
    print(f"  {label:4s} best on the grid: eta {best_eta:.0e}, "
          f"MSE {best_curve[-1]:.2e}")
    return best_curve


sgd_etas = [1e-3, 3e-3, 1e-2, 3e-2, 1e-1, 3e-1, 1.0]
adam_etas = [1e-4, 3e-4, 1e-3, 3e-3, 1e-2, 3e-2, 1e-1]

print("(a) input in metres")
best_sgd = sweep("SGD", SGD, X, T, sgd_etas)
best_adam = sweep("Adam", Adam, X, T, adam_etas)
print("training MSE at steps 0, 100, 500, 1000, 3000")
for name, curve in (("SGD", best_sgd), ("Adam", best_adam)):
    print(f"  {name:4s}", "  ".join(f"{curve[s]:.2e}"
                                   for s in (0, 100, 500, 1000, 3000)))
print(f"Adam over SGD: {best_sgd[-1] / best_adam[-1]:.0f} times lower")

X_mm = 1000 * X                          # the same inputs, recorded in millimetres
print("(b) input in millimetres, not standardised")
print(f"  initial MSE: {fit(SGD(0.0), X_mm, T, steps=1)[0]:.3e}")
sweep("SGD", SGD, X_mm, T, [1e-9, 1e-8, 1e-7, 1e-6, 1e-4, 1e-2])
sweep("Adam", Adam, X_mm, T, [1e-4, 1e-3, 1e-2, 3e-2, 1e-1, 3e-1, 1.0])
# All 64 kinks start at x = 0 (b1 = 0). A network whose kinks stay there is a two-piece
# linear function; its best possible fit is a least-squares problem.
basis = np.hstack([np.maximum(X_mm, 0), np.maximum(-X_mm, 0)])
coef = np.linalg.lstsq(basis, T, rcond=None)[0]
two_piece = np.mean((basis @ coef - T) ** 2)
print(f"  best two-piece fit with the kink at 0: MSE {two_piece:.4f}")

# Is a rescaled start enough? Divide the first-layer weights by 1,000 so that the
# network computes the same function of X_mm as the original one did of X.
p0_original = p0
p0 = dict(p0_original, W1=p0_original["W1"] / 1000)
print("(b') millimetres, W1 divided by 1,000 at initialisation")
print(f"  initial MSE: {fit(SGD(0.0), X_mm, T, steps=1)[0]:.3e}")
sweep("SGD", SGD, X_mm, T, [1e-7, 1e-6, 1e-5, 1e-4])
sweep("Adam", Adam, X_mm, T, [1e-5, 1e-4, 1e-3, 1e-2, 1e-1])
p0 = p0_original

X_std = (X_mm - X_mm.mean()) / X_mm.std()   # standardise with training statistics
print("(c) millimetres, standardised")
print(f"  initial MSE: {fit(SGD(0.0), X_std, T, steps=1)[0]:.3e}")
sweep("SGD", SGD, X_std, T, [1e-2, 3e-2, 6e-2, 1e-1, 3e-1])
sweep("Adam", Adam, X_std, T, adam_etas)
```

```output
(a) input in metres
  SGD  eta   1e-03: final MSE 1.225e-01
  SGD  eta   3e-03: final MSE 6.716e-02
  SGD  eta   1e-02: final MSE 1.510e-02
  SGD  eta   3e-02: final MSE 1.020e-03
  SGD  eta   1e-01: final MSE 1.138e-04
  SGD  eta   3e-01: final MSE 1.273e-01
  SGD  eta   1e+00: final MSE 1.316e+03
  SGD  best on the grid: eta 1e-01, MSE 1.14e-04
  Adam eta   1e-04: final MSE 2.716e-02
  Adam eta   3e-04: final MSE 6.311e-04
  Adam eta   1e-03: final MSE 1.492e-05
  Adam eta   3e-03: final MSE 1.369e-06
  Adam eta   1e-02: final MSE 2.191e-05
  Adam eta   3e-02: final MSE 2.001e-06
  Adam eta   1e-01: final MSE 2.157e-05
  Adam best on the grid: eta 3e-03, MSE 1.37e-06
training MSE at steps 0, 100, 500, 1000, 3000
  SGD  3.27e-01  6.07e-02  5.48e-03  1.01e-03  1.14e-04
  Adam 3.27e-01  4.93e-02  3.10e-04  5.58e-05  1.37e-06
Adam over SGD: 83 times lower
(b) input in millimetres, not standardised
  initial MSE: 4.872e+04
  SGD  eta   1e-09: final MSE 1.657e-01
  SGD  eta   1e-08: final MSE 1.657e-01
  SGD  eta   1e-07: final MSE 1.657e-01
  SGD  eta   1e-06: final MSE       nan
  SGD  eta   1e-04: final MSE       nan
  SGD  eta   1e-02: final MSE       nan
  SGD  best on the grid: eta 1e-07, MSE 1.66e-01
  Adam eta   1e-04: final MSE 1.749e-01
  Adam eta   1e-03: final MSE 1.286e-01
  Adam eta   1e-02: final MSE 8.319e-02
  Adam eta   3e-02: final MSE 1.911e-01
  Adam eta   1e-01: final MSE 7.989e-02
  Adam eta   3e-01: final MSE 1.061e-01
  Adam eta   1e+00: final MSE 7.634e-01
  Adam best on the grid: eta 1e-01, MSE 7.99e-02
  best two-piece fit with the kink at 0: MSE 0.1657
(b') millimetres, W1 divided by 1,000 at initialisation
  initial MSE: 3.270e-01
  SGD  eta   1e-07: final MSE 1.657e-01
  SGD  eta   1e-06: final MSE 1.656e-01
  SGD  eta   1e-05: final MSE 1.651e-01
  SGD  eta   1e-04: final MSE       nan
  SGD  best on the grid: eta 1e-05, MSE 1.65e-01
  Adam eta   1e-05: final MSE 1.397e-01
  Adam eta   1e-04: final MSE 5.124e-03
  Adam eta   1e-03: final MSE 2.797e-03
  Adam eta   1e-02: final MSE 6.442e-02
  Adam eta   1e-01: final MSE 4.488e-03
  Adam best on the grid: eta 1e-03, MSE 2.80e-03
(c) millimetres, standardised
  initial MSE: 2.223e-01
  SGD  eta   1e-02: final MSE 2.721e-02
  SGD  eta   3e-02: final MSE 2.495e-03
  SGD  eta   6e-02: final MSE 9.612e-05
  SGD  eta   1e-01: final MSE 5.491e-01
  SGD  eta   3e-01: final MSE       nan
  SGD  best on the grid: eta 6e-02, MSE 9.61e-05
  Adam eta   1e-04: final MSE 1.921e-02
  Adam eta   3e-04: final MSE 3.426e-04
  Adam eta   1e-03: final MSE 1.144e-05
  Adam eta   3e-03: final MSE 3.795e-06
  Adam eta   1e-02: final MSE 3.651e-04
  Adam eta   3e-02: final MSE 1.559e-06
  Adam eta   1e-01: final MSE 1.837e-05
  Adam best on the grid: eta 3e-02, MSE 1.56e-06
```

**(a)** SGD 在网格上的最佳学习率是 0.1，最终 MSE 为 $1.1 \times 10^{-4}$；再高一档的 0.3 不稳定：损失在三步之内升到 43，杀死 64 个隐藏单元中的 63 个，最终停在 0.127，即唯一幸存者的拟合。Adam 的最佳学习率是 $3 \times 10^{-3}$，MSE 为
$1.4 \times 10^{-6}$（0.03 给出 $2.0 \times 10^{-6}$，几乎一样好；Adam 的最终值对 $\eta$ 不是光滑的，因为最后一次迭代带有步长的抖动），大约低 83 倍。曲线显示这个差距很早就拉开，并持续扩大：在第 500 步，$5.5 \times 10^{-3}$ 对 $3.1 \times 10^{-4}$（18 倍），在第 3,000 步则是 83 倍。通常的解释是，损失在各个方向上的曲率差别很大，所以 SGD 唯一的 $\eta$ 受最陡的方向限制（它在 0.1 与 0.3 之间发散），而 Adam 的逐参数归一化，则无论局部曲率如何，都让每个参数走大约 $\eta$ 的一步。

**(b)** 输入以毫米计时，SGD 对每个 $\eta \ge 10^{-6}$ 都发散为 `nan`，而对 $\eta \le 10^{-7}$ 则卡在均方误差 0.166；Adam 在网格上从不产生 `nan`，但它最好的结果是 0.080（在 $\eta = 0.1$ 处），比以米计时差了近 60,000 倍。初始损失是 $4.9 \times 10^{4}$，而不是 0.327：He 初始化假设输入的大小为 1，所以打印出的第一个数字就已经宣判了这次运行的失败。

SGD 的原因是曲率。把输入缩放 $s = 1{,}000$ 倍，会使 $\partial z/\partial\mathbf{W}^{(1)}$
乘以 $s$，所以 $\mathbf{W}^{(1)}$ 的梯度放大 $s$ 倍，其海森矩阵元素放大 $s^2 = 10^6$ 倍。稳定步长随之缩小同样的 $10^6$ 倍，从 0.1 到 0.3 之间，降到 $10^{-7}$ 到 $10^{-6}$ 之间，网格正是这样显示的。
偏置 $\mathbf{b}^{(1)}$ 和第二层的曲率仍是原来的，而在
$\eta = 10^{-7}$ 时，它们每步只移动梯度的千万分之一。全部 64 个折点都从
$x = 0$ 起步，因为 $\mathbf{b}^{(1)} = \mathbf{0}$，而位于 0 的折点会留在 0 附近，所以网络是一个有两个线性段的函数，每个半轴上各一段。(b) 中打印的最小二乘拟合给出了这类函数中最好的那个，均方误差为 0.1657：这就是 SGD 停滞的数值，精确到四位数字。

Adam 的步长在每个参数上都约为 $\eta$，与梯度的尺度无关。这就是它不发散的原因：巨大的初始梯度被它自己的大小除掉了。但问题已经失去了共同的尺度。以毫米计时，一个好的 $\mathbf{W}^{(1)}$ 约为 $10^{-3}$（即原权重除以 1,000），而 $\mathbf{b}^{(1)}$ 仍在 1 附近，这是折点所需要的值。对 $\mathbf{W}^{(1)}$ 而言足够小的步长 $\eta$（$\eta = 0.1$ 的抖动是它自然大小的 100 倍，并被大小为 1,000 的输入放大）会使偏置移动得太慢，在 3,000 步内无足轻重；而对偏置而言足够大的步长，则会毁掉 $\mathbf{W}^{(1)}$。没有哪个单一的 $\eta$ 能同时照顾两者。

**(c)** SGD 受限于：对一个各参数组之间曲率相差 $10^6$ 的损失，只有一个学习率；Adam 受限于：对自然尺度相差 $10^3$ 的参数，只有一个步长。Adam 消除的是*梯度尺度*问题，SGD 则深受其害，但它无法消除*参数尺度*问题。能同时修复两者的办法，是用训练集的均值和标准差对输入做标准化，这使问题恢复成参数初始化和学习率当初所针对的那个问题。输出的最后一块显示了这一点：把毫米数据标准化之后，Adam 的最佳结果是 $\eta = 0.03$ 时的 $1.6 \times 10^{-6}$（以米计时是 $1.4 \times 10^{-6}$），而 SGD 的最佳结果是 $\eta = 0.06$ 时的
$9.6 \times 10^{-5}$（原先是 0.1 时的 $1.1 \times 10^{-4}$；标准化后的输入比原来的大 1.77 倍，所以曲率约大三倍，稳定上限约低三倍，在这个网格上位于 0.06 与 0.1 之间，而仅凭因子为 3 的网格，在 0.03 处只能看到
$2.5 \times 10^{-3}$）。初始损失回到了 0.22。重新缩放起点不能代替标准化（输出中标有 (b') 的那一块）：在初始化时把
$\mathbf{W}^{(1)}$ 除以 1,000，可以把初始损失恢复到 0.327，但 SGD 只在约 $10^{-5}$ 以内稳定，并且仍然停滞在 0.165，因为 $\mathbf{W}^{(1)}$ 的曲率由输入的大小决定，而不是由权重决定；Adam 也只达到 $2.8 \times 10^{-3}$，比以米计时差了两千倍。请像[模块 01，第 3 节](module_01_ZH.html#s3)已经对线性模型建议过的那样，对输入做标准化，并检查初始损失（[第 14 节](#s14)）。
:::
