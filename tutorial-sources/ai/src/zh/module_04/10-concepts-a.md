## 序列及其上的任务 {#s1}

泵上的一路振动信号、数字孪生的观测序列、一份维护日志、一个句子、延时摄影的各帧：在每一种数据里，元素的顺序都承载着含义。把一段振动记录的采样点打乱，它所记录的共振就消失了。有三个性质把这类数据与模块 01 至 03 中固定大小的向量区分开来。**顺序承载含义**：同样的值换一种顺序，就是另一个信号。**长度可变**：一段记录持续十分钟，下一段持续十小时。**依赖存在于不同的滞后上**：一个振动采样点既依赖于几个采样点之前的激励，也依赖于几小时前设定的运行工况。

在工程实践中，一台受监测设备或其数字孪生的观测流（来自许多传感器的温度、振动和压力）是多元时间序列；一次试验的响应曲线，或基于智能体的组织仿真中一次运行的细胞计数，是一条较短的一元序列；而当 ODE 求解器太慢、无法在优化循环中调用时，循环代理模型要学会模仿的正是它的轨迹。

序列记作 $\mathbf{x}_{1:T} = (\mathbf{x}_1, \dots, \mathbf{x}_T)$，其中 $\mathbf{x}_t \in \R^{d_{\text{in}}}$，$T$ 随样本而变。目标可以每步一个，即 $\mathbf{y}_t$，也可以每条序列一个。一个 batch 的形状是 $(B, T, d)$，较短的序列经过填充并加掩码（[第 7 节](#s7)）。

### 四种任务形态

这些形态的区别在于输出位于何处，因而损失在何处计算（图 4.1）。

1. **多对一。**把一段十分钟的泵记录分类为健康、气蚀或不对中；损失只在最后一个输出上计算。
2. **对齐的多对多。**每步一个输出：把每一秒标为正常或故障，或在每一步预测下一个值；损失对各步求和。
3. **序列到序列，长度不同。**把一条自由文本的维护记录转换为故障代码，或翻译一个句子。输出位置与输入位置不对齐，这需要[第 10 节](#s10)的编码器-解码器。
4. **一对多。**从一个初始条件生成一条合成记录，或从一个起始符号生成一行日志，每个输出都作为下一个输入反馈回去。

::: figure id=fig-04-1
四种任务形态并排，每种都是一行输入框 $\mathbf{x}_1 \dots \mathbf{x}_T$（底部）、循环单元（中部）和输出（顶部）。多对一：最后一个单元上方有一个输出，“故障类别”。对齐的多对多：每个单元上方都有一个输出，“下一个值”或“正常/故障”。序列到序列：一行编码器送入一行长度不同的解码器，“记录 → 故障代码”。一对多：一个输入，输出反馈为下一个输入，“生成一条记录”。每种形态下方的标签写着“因果”或“离线”。
:::

### 在线与离线

$\mathbf{y}_t$ 可以依赖 $t$ 之后的输入吗？**在线**（online）任务，也称**因果**（causal）任务，必须在时刻 $t$ 仅凭 $\mathbf{x}_{1:t}$ 作答：预测，以及监测正在运行的机器。**离线**（offline）任务先拿到整条记录好的序列：事后标注一次已记录的试验，给一个完整句子中的词加标签。只有离线任务可以双向读取序列（[第 6 节](#s6)的双向网络）。一个见过未来的模型，在因果任务上评估，就是一次验证指标极好的泄漏（[第 8 节](#s8)）。

### 预测下一个元素

概率的链式法则可以精确地分解序列上的任意分布：

$$
p(\mathbf{x}_{1:T}) = \prod_{t=1}^{T} p(\mathbf{x}_t \mid \mathbf{x}_{<t}).
$$

因此，一个给定过去预测下一个元素的模型就是一个完整的生成模型：采样 $\mathbf{x}_1$，反馈回去，采样 $\mathbf{x}_2$，依此类推。极大似然训练它的方式是：对符号把每步的交叉熵相加，对带高斯噪声的实数值把每步的平方误差相加（[模块 01](module_01_ZH.html)）。这就是[模块 07](module_07_ZH.html) 的语言建模目标，也是[第 8 节](#s8)的一步预测。

### 为什么固定窗口不够

显而易见的替代方案是把最后 $w$ 个值送入[模块 02](module_02_ZH.html) 的多层感知机。它是值得拟合的基线，但有三个缺陷。窗口是一种猜测：更早的一切都看不见。每个窗口位置有自己的权重，所以在位置 3 学到的模式必须在位置 7 重新学一遍。而且第一层随 $w$ 线性增长。

::: worked title="窗口 MLP 与循环层的参数量"
一个窗口 MLP 读取一元信号最后 $w = 64$ 个值，送入 32 个隐藏单元，它有

$$
64 \times 32 + 32 = 2{,}080 \text{ 个第一层参数；} \qquad
w = 1{,}000:\ 1{,}000 \times 32 + 32 = 32{,}032.
$$

一个 $d_{\text{in}} = 1$、$H = 32$ 的循环层（[第 2 节](#s2)）给每个单元来自上一状态的 32 个权重、来自输入的一个权重和一个偏置：

$$
32 \times (32 + 1 + 1) = 1{,}088 \text{ 个参数，与序列长度无关。}
$$

PyTorch 的 `nn.RNN(1, 32)` 报告 1,120 个，因为它保留了两个直接相加的偏置向量（[第 2 节](#s2)）。
:::

### 两种归纳偏置

循环内置了**平稳性**（stationarity）：每一步使用同一条更新规则，所以权重在时间上共享，这对应于[模块 03](module_03_ZH.html) 中卷积的平移等变性。它还内置了一个**状态**（state），即迄今所见一切的固定大小摘要 $\mathbf{h}_t$。一维卷积同样在时间上共享权重，但每个输出看到的是一个固定窗口，只随深度增长；而循环的感受野在原则上是无界的。训练能否利用这一点，是[第 3 节](#s3)和[第 4 节](#s4)的主题。

从工程师的角度看，$\mathbf{h}_t = f(\mathbf{h}_{t-1}, \mathbf{x}_t)$、$\mathbf{y}_t = g(\mathbf{h}_t)$ 就是控制论中的离散时间非线性状态空间模型 $\mathbf{x}_{k+1} = f(\mathbf{x}_k, \mathbf{u}_k)$，只是把状态改名为 $\mathbf{h}$，把输入改名为 $\mathbf{x}$。写过卡尔曼滤波器的人，都曾根据已知模型手写过一个循环；循环网络从数据中学习 $f$ 和 $g$，代价是放弃了已知线性高斯模型的保证。[第 12 节](#s12)完成这一比较：

| 模型 | 感受野 | 在时间上共享权重 | 串行步数 |
|---|---|---|---|
| 窗口 MLP | 固定，$w$ | 否 | 1 |
| 一维 CNN / TCN | 随深度和空洞增长 | 是 | 每层 1 |
| RNN | 原则上无界 | 是 | $T$ |
| 注意力 | 整个序列 | 是 | 每层 1（[第 12 节](#s12)） |

::: check
一个模型必须在飞行结束后，把一段已记录的飞行试验振动记录的每一秒标为正常或颤振。这是哪种任务形态？$\mathbf{y}_t$ 可以依赖之后的输入吗？
:::

::: answer
对齐的多对多，也就是序列标注。这个任务是离线的，所以 $\mathbf{y}_t$ 可以依赖之后的输入，允许使用双向模型。
:::

::: check
为什么把 MLP 预测器的窗口加倍，它的第一层参数也加倍，而循环层的参数量不变？
:::

::: answer
MLP 对每个窗口位置都有单独的权重；循环层在每一步应用同样的权重，所以它的参数量与读取多少步无关。
:::

## 循环神经网络 {#s2}

最简单的循环网络是 **Elman 网络**（Elman network，Elman 1990），它保存一个状态向量，每一步用一个层更新一次：

$$
\begin{aligned}
\mathbf{z}_t &= \mathbf{W}_h \mathbf{h}_{t-1} + \mathbf{W}_x \mathbf{x}_t + \mathbf{b}, \\
\mathbf{h}_t &= \phi(\mathbf{z}_t), \\
\mathbf{y}_t &= \mathbf{W}_y \mathbf{h}_t + \mathbf{c}.
\end{aligned}
$$

各形状为 $\mathbf{h}_t \in \R^{H}$、$\mathbf{x}_t \in \R^{d_{\text{in}}}$、$\mathbf{W}_h \in \R^{H \times H}$、$\mathbf{W}_x \in \R^{H \times d_{\text{in}}}$、$\mathbf{W}_y \in \R^{d_{\text{out}} \times H}$、$\mathbf{b} \in \R^{H}$ 和 $\mathbf{c} \in \R^{d_{\text{out}}}$；$\mathbf{z}_t$ 是预激活。初始状态 $\mathbf{h}_0$ 为零或一个学习得到的向量。非线性 $\phi$ 默认为 $\tanh$，理由有三：它有界，所以无论序列多长，状态都不会无限增长；它以零为中心；它在原点的导数为 1，所以较小的状态几乎线性地通过。每个**隐状态**（hidden state）$\mathbf{h}_t$ 都通过这一串更新，成为整个前缀 $\mathbf{x}_{1:t}$ 的函数。

### batch 形式

框架把一个 batch 存为 $(B, T, d)$，每个样本占一行，所以同样的方程用行向量和转置的权重来写。记 $\mathbf{X}_t \in \R^{B \times d_{\text{in}}}$ 为第 $t$ 步的输入，$\mathbf{H}_t \in \R^{B \times H}$ 为状态（粗体 $\mathbf{H}_t$ 是矩阵，斜体 $H$ 是它的宽度），则

$$
\mathbf{H}_t = \phi\big(\mathbf{H}_{t-1}\mathbf{W}_h^\top + \mathbf{X}_t\mathbf{W}_x^\top +
\mathbf{b}^\top\big).
$$

对 $t$ 做一个循环，每步两次矩阵乘法：

```python
import torch

def rnn_forward(X, W_h, W_x, b, h0):
    """X: (B, T, d_in); h0: (B, H). Returns all states, (B, T, H)."""
    pre_in = X @ W_x.T + b          # input part for every step at once: (B, T, H)
    h, states = h0, []
    for t in range(X.shape[1]):     # the recurrent part must run one step at a time
        h = torch.tanh(h @ W_h.T + pre_in[:, t])
        states.append(h)
    return torch.stack(states, dim=1)
```

输入投影不依赖于状态，所以在循环之前用一次大的乘法对所有步一起算出；只有与 $\mathbf{W}_h$ 的乘积必须等待上一步。优化过的实现也是这样做的。

### 展开

每一步的权重都相同。画出自环时，网络是一个小单元；沿 $T$ 步画开，即**按时间展开**（unrolled in time），它是一个 $T$ 层的前馈网络，每一层的权重都相同（图 4.3）。训练就是在这个展开的计算图上做反向传播，这是[第 3 节](#s3)的主题。

::: figure id=fig-04-3
左：折叠的循环单元，一个标有 tanh 的方框，下方是输入 $\mathbf{x}_t$，上方是输出 $\mathbf{y}_t$，一条标有 $\mathbf{W}_h$ 的自环把 $\mathbf{h}_{t-1}$ 送回。右：同一个单元展开为四步，$\mathbf{h}_0$ 从左侧进入，箭头为 $\mathbf{h}_1 \to \mathbf{h}_2 \to \mathbf{h}_3 \to \mathbf{h}_4$。每条水平箭头都标为 $\mathbf{W}_h$，每条竖直输入箭头标为 $\mathbf{W}_x$，每条输出箭头标为 $\mathbf{W}_y$，处处标签相同，以表示共享。每个输出上方的每步损失 $\mathcal{L}_t$ 汇入总和 $\mathcal{L}$。
:::

### 参数与损失

数一数上面的矩阵和向量，

$$
\underbrace{H(H + d_{\text{in}} + 1)}_{\text{循环层}} +
\underbrace{d_{\text{out}}(H + 1)}_{\text{输出层}}.
$$

PyTorch 的 `nn.RNN` 保留两个偏置向量 `bias_ih_l0` 和 `bias_hh_l0`，二者直接相加；第二个是为了兼容 NVIDIA 的 cuDNN kernel 而存在的，并不增加表达能力。因此它的循环层有 $H(H + d_{\text{in}} + 2)$ 个参数。

对于对齐的任务，损失是每步损失之和 $\mathcal{L} = \sum_t \mathcal{L}_t(\mathbf{y}_t, \text{目标}_t)$，通常对步数和 batch 取平均，使学习率不依赖于 $T$ 或 $B$。对于多对一任务，只使用 $\mathcal{L}_T$。

### 状态的作用

状态的行为在单个单元上最容易看清。

::: worked title="标量 RNN 记住一个脉冲，或者锁存"
取 $h_t = \tanh(w h_{t-1} + u x_t)$，$u = 1$，无偏置，$h_0 = 0$，输入脉冲 $\mathbf{x} = (1, 0, 0)$。

**$w = 0.5$。**

$$
\begin{aligned}
h_1 &= \tanh(0.5 \cdot 0 + 1) = \tanh(1) = 0.7616, \\
h_2 &= \tanh(0.5 \cdot 0.7616) = \tanh(0.3808) = 0.3634, \\
h_3 &= \tanh(0.5 \cdot 0.3634) = \tanh(0.1817) = 0.1797.
\end{aligned}
$$

对脉冲的记忆大约每步减半。每一步的局部导数 $\partial h_t / \partial h_{t-1} = w(1 - h_t^2)$ 为

$$
0.5(1 - 0.7616^2) = 0.210, \quad 0.5(1 - 0.3634^2) = 0.434, \quad 0.5(1 - 0.1797^2) = 0.484.
$$

**$w = 2$。**

$$
\begin{aligned}
h_1 &= \tanh(1) = 0.7616, \\
h_2 &= \tanh(2 \cdot 0.7616) = \tanh(1.5232) = 0.9093, \\
h_3 &= \tanh(2 \cdot 0.9093) = \tanh(1.8186) = 0.9487.
\end{aligned}
$$

状态锁存在 1 附近：脉冲被记住了，但靠的是一个处于饱和的单元。局部导数为 $2(1 - 0.7616^2) = 0.840$、$2(1 - 0.9093^2) = 0.347$ 和 $2(1 - 0.9487^2) = 0.200$，随着单元饱和而下降。

两种设置给出的局部因子都小于 1。小权重会遗忘，大权重会饱和，无论哪种，[第 3 节](#s3)要连乘的那些因子都已经在缩小。
:::

### 字符级语言模型

实验 1 训练这个网络，预测一份合成维护日志的下一个字符，日志的各行形如 `F2 pres 4.0 bar night shift ok /F2`。词表有 $V$ 个字符。输入 $\mathbf{x}_t$ 是一个**独热**（one-hot）向量，除当前字符的索引处为 1 外全为零，所以 $\mathbf{W}_x\mathbf{x}_t$ 就是 $\mathbf{W}_x$ 中对应该字符的那一列：这个乘法实现为按列查表，而这正是嵌入层的本质。输出 $\mathbf{y}_t \in \R^{V}$ 保存下一个字符的 **logits**，softmax 把它们变成概率，损失是相对于实际出现的下一个字符的平均交叉熵，单位为每字符奈特（nats）（除以 $\ln 2$ 得到比特）。

初始化时，输出权重很小，logits 接近零，softmax 接近均匀分布，每个字符都是 $1/V$，所以第一个损失应当接近 $-\ln(1/V) = \ln V$。这就是[模块 02](module_02_ZH.html) 的合理性检查：第一个损失远离 $\ln V$，说明在任何训练发生之前就已经有 bug。（[模块 07](module_07_ZH.html) 把这个量转换为困惑度；本模块始终使用每字符奈特。）

::: worked title="实验 1 的模型，逐项计数"
$V = 37$ 个字符，$H = 128$ 个状态单元，一个偏置向量：

| 张量 | 形状 | 参数 |
|---|---|---|
| $\mathbf{W}_x$ | $128 \times 37$ | 4,736 |
| $\mathbf{W}_h$ | $128 \times 128$ | 16,384 |
| $\mathbf{b}$ | $128$ | 128 |
| $\mathbf{W}_y$ | $37 \times 128$ | 4,736 |
| $\mathbf{c}$ | $37$ | 37 |
| 合计 | | 26,021 |

公式与之一致：$128(128 + 37 + 1) + 37(128 + 1) = 21{,}248 + 4{,}773 = 26{,}021$。第一个损失应为 $\ln 37 = 3.611$ 奈特每字符。
:::

### 带温度的采样

训练好的模型按[第 1 节](#s1)的一对多形态生成文本：送入一个起始字符，从预测的分布中抽取下一个字符，把它反馈回去，重复。**温度**（temperature）$\tau$ 在 softmax 之前去除 logits，所以下一个字符从 $\softmax(\mathbf{y}_t / \tau)$ 中抽取。$\tau < 1$ 时，分布向最可能的字符锐化；$\tau > 1$ 时，分布变平。对 logits $(2, 1, 0)$，$\tau = 1$ 时概率为 $(0.665, 0.245, 0.090)$，$\tau = 0.5$ 时为 $(0.867, 0.117, 0.016)$，$\tau = 2$ 时为 $(0.506, 0.307, 0.186)$。低温度给出重复但格式良好的文本；高温度给出多样性，也带来更多错误。实验 1 对两者都做了测量。

### 由来

这类循环网络在整个 1990 年代都有研究，它们的训练问题（[第 4 节](#s4)的主题）在那个十年的中期就已为人理解。它们的复兴发生在 2013–2015 年：门控循环网络生成了令人信服的手写笔迹和字符级文本（Graves 2013），Karpathy 2015 年关于字符级模型的文章展示了一个小网络逐字符写出看似合理的散文、源代码和标记文本。那些字符模型是[模块 07](module_07_ZH.html) 中语言模型的直接祖先。

::: check
一个 RNN 的 $d_{\text{in}} = 10$、$H = 64$，有一个偏置向量。它的循环层有多少个参数？序列长度加倍时，这个数如何变化？
:::

::: answer
$64 \times (64 + 10 + 1) = 64 \times 75 = 4{,}800$。它不变：每一步都应用同样的权重，所以参数量与序列长度无关。
:::

::: check
一个刚初始化的、作用于 37 个符号的字符模型报告第一个损失为 7.2 奈特。这说明什么？
:::

::: answer
存在 bug 或初始化不当。一个没有任何信息的模型应当得到接近 $\ln 37 = 3.61$ 奈特。损失为 7.2 意味着输出层一开始就自信地出错，通常是因为它的初始权重太大，或者损失是对各步求和而不是取平均。
:::


## 随时间反向传播 {#s3}

展开后，循环网络是一个各层共享权重的深层前馈网络。训练它就是[模块 02](module_02_ZH.html) 的反向传播，只是把层换成时间步，但有一处要紧的差别：因为每一步都使用同样的权重，每个权重的梯度要从每一步收集一份贡献。这就是**随时间反向传播**（backpropagation through time，BPTT）。

### 设定与约定

取[第 2 节](#s2)的网络，损失对各步求和：

$$
\mathbf{z}_t = \mathbf{W}_h\mathbf{h}_{t-1} + \mathbf{W}_x\mathbf{x}_t + \mathbf{b}, \qquad
\mathbf{h}_t = \phi(\mathbf{z}_t), \qquad
\mathbf{y}_t = \mathbf{W}_y\mathbf{h}_t + \mathbf{c}, \qquad
\mathcal{L} = \sum_{t=1}^{T}\mathcal{L}_t.
$$

梯度是与变量形状相同的列向量。雅可比矩阵 $\partial\mathbf{a}/\partial\mathbf{b}$ 的 $(i, j)$ 元素等于 $\partial a_i/\partial b_j$，所以梯度的链式法则写作 $\partial\mathcal{L}/\partial\mathbf{b} = (\partial\mathbf{a}/\partial\mathbf{b})^\top\, \partial\mathcal{L}/\partial\mathbf{a}$。下文各因子的顺序由这一约定决定，不能随意调换。

### 反向递推

定义 $\boldsymbol{\delta}_t = \partial\mathcal{L}/\partial\mathbf{h}_t$，即整个损失对第 $t$ 步状态的全导数。状态 $\mathbf{h}_t$ 沿两条路径影响损失：经由 $\mathbf{y}_t$ 进入 $\mathcal{L}_t$，以及经由 $\mathbf{z}_{t+1}$ 进入之后发生的一切。多元链式法则把两条路径相加：

$$
\boldsymbol{\delta}_t =
\Big(\frac{\partial\mathbf{y}_t}{\partial\mathbf{h}_t}\Big)^{\!\top}
\frac{\partial\mathcal{L}_t}{\partial\mathbf{y}_t} +
\Big(\frac{\partial\mathbf{z}_{t+1}}{\partial\mathbf{h}_t}\Big)^{\!\top}
\frac{\partial\mathcal{L}}{\partial\mathbf{z}_{t+1}}.
$$

两个雅可比矩阵可以直接从方程读出：$\partial\mathbf{y}_t/\partial\mathbf{h}_t = \mathbf{W}_y$，$\partial\mathbf{z}_{t+1}/\partial\mathbf{h}_t = \mathbf{W}_h$。由于 $\phi$ 逐元素作用，它的雅可比矩阵是对角矩阵 $\operatorname{diag}(\phi'(\mathbf{z}_t))$，对预激活的梯度是一个逐元素乘积。记为 $\mathbf{g}_t$：

$$
\mathbf{g}_t = \frac{\partial\mathcal{L}}{\partial\mathbf{z}_t} = \phi'(\mathbf{z}_t) \odot
\boldsymbol{\delta}_t, \qquad
\boldsymbol{\delta}_t = \mathbf{W}_y^\top\frac{\partial\mathcal{L}_t}{\partial\mathbf{y}_t} +
\mathbf{W}_h^\top\mathbf{g}_{t+1},
$$

在 $t = T$ 处第二项不存在，因为之后再没有任何步。从 $t = T$ 向下运行到 $t = 1$，这就是模块 02 反向传播中的误差信号，只不过是沿时间向后传递，而不是沿层向下传递（图 4.4，左）。

### 参数梯度是对时间的求和

设想第 $t$ 步有循环矩阵的一份自己的副本 $\mathbf{W}_h^{(t)}$。损失通过每一份副本依赖于共享的 $\mathbf{W}_h$，所以它的梯度是对各副本梯度之和。在第 $t$ 步内，副本只通过 $\mathbf{z}_t = \mathbf{W}_h^{(t)}\mathbf{h}_{t-1} + \dots$ 进入，由此得到模块 02 的外积 $\mathbf{g}_t\mathbf{h}_{t-1}^\top$。因此

$$
\begin{aligned}
\frac{\partial\mathcal{L}}{\partial\mathbf{W}_h} &= \sum_{t=1}^{T}\mathbf{g}_t\mathbf{h}_{t-1}^\top, &
\frac{\partial\mathcal{L}}{\partial\mathbf{W}_x} &= \sum_{t=1}^{T}\mathbf{g}_t\mathbf{x}_t^\top, &
\frac{\partial\mathcal{L}}{\partial\mathbf{b}} &= \sum_{t=1}^{T}\mathbf{g}_t, \\
\frac{\partial\mathcal{L}}{\partial\mathbf{W}_y} &= \sum_{t=1}^{T}
\frac{\partial\mathcal{L}_t}{\partial\mathbf{y}_t}\mathbf{h}_t^\top, &
\frac{\partial\mathcal{L}}{\partial\mathbf{c}} &= \sum_{t=1}^{T}
\frac{\partial\mathcal{L}_t}{\partial\mathbf{y}_t}. &&
\end{aligned}
$$

### 展开递推式

递推式掩盖了梯度由什么构成。把循环一步的雅可比矩阵写成

$$
\mathbf{J}_k = \frac{\partial\mathbf{h}_k}{\partial\mathbf{h}_{k-1}} =
\operatorname{diag}\big(\phi'(\mathbf{z}_k)\big)\,\mathbf{W}_h .
$$

仅经由状态，对 $s > t$ 有 $\partial\mathbf{h}_s/\partial\mathbf{h}_t = \mathbf{J}_s\mathbf{J}_{s-1}\cdots\mathbf{J}_{t+1}$。为求梯度取转置会反转顺序，所以第 $s$ 步的损失对第 $t$ 步状态处梯度的贡献是

$$
\frac{\partial\mathcal{L}_s}{\partial\mathbf{h}_t} =
\mathbf{J}_{t+1}^\top\mathbf{J}_{t+2}^\top\cdots\mathbf{J}_s^\top\,
\frac{\partial\mathcal{L}_s}{\partial\mathbf{h}_s}, \qquad
\mathbf{J}_k^\top = \mathbf{W}_h^\top\operatorname{diag}\big(\phi'(\mathbf{z}_k)\big).
$$

离损失最近的因子 $\mathbf{J}_s^\top$ 最先作用于梯度。矩阵乘法不可交换，所以把各因子按别的顺序写，或写成 $\operatorname{diag}(\phi')\,\mathbf{W}_h^\top$，得到的是不同的矩阵，除非每个 $\phi'$ 都相同。

代入参数梯度，它就变成一个二重和，一重是产生损失的步 $s$，另一重是使用过 $\mathbf{W}_h$ 的每个更早的步 $t \le s$：

$$
\frac{\partial\mathcal{L}}{\partial\mathbf{W}_h} = \sum_{s=1}^{T}\sum_{t=1}^{s}
\Big[\phi'(\mathbf{z}_t)\odot\big(\mathbf{J}_{t+1}^\top\cdots\mathbf{J}_s^\top\,
\mathbf{W}_y^\top\tfrac{\partial\mathcal{L}_s}{\partial\mathbf{y}_s}\big)\Big]
\mathbf{h}_{t-1}^\top ,
$$

其中 $t = s$ 时乘积为空（即单位矩阵）。每一项带有 $s - t$ 个雅可比因子。$s - t$ 较小的项是**短程**项：它们教网络一个输入如何影响接下来的几个输出。$s - t$ 较大的项是**长程**项，只有它们能教网络学会跨越许多步的依赖。[第 4 节](#s4)讨论许多雅可比矩阵的乘积能有多大。递推式通过复用部分乘积，在一次反向扫描中算出整个二重和；逐项单独计算则需要 $O(T^2)$ 次矩阵-向量乘积。

::: worked title="手算标量 RNN 的 BPTT"
取[第 2 节](#s2)的标量网络：$w = 0.5$，$u = 1$，无偏置，$h_0 = 0$，$\mathbf{x} = (1, 0, 0)$，所以 $h = (0.7616, 0.3634, 0.1797)$。在最后一个状态上放一个损失，$\mathcal{L} = \tfrac12(h_3 - 0.5)^2 = \tfrac12(-0.3203)^2 = 0.0513$。

**反向。**$\tanh' = 1 - h^2$，第 1 步和第 2 步没有损失，所以递推式为 $g_t = (1 - h_t^2)\,w\,g_{t+1}$：

$$
\begin{aligned}
\delta_3 &= h_3 - 0.5 = -0.3203, \\
g_3 &= (1 - 0.1797^2)\,\delta_3 = 0.9677 \times (-0.3203) = -0.3099, \\
g_2 &= (1 - 0.3634^2)\,w\,g_3 = 0.4340 \times (-0.3099) = -0.1345, \\
g_1 &= (1 - 0.7616^2)\,w\,g_2 = 0.2100 \times (-0.1345) = -0.02824.
\end{aligned}
$$

**参数梯度**，对各步求和：

$$
\begin{aligned}
\frac{\partial\mathcal{L}}{\partial w} &= g_3h_2 + g_2h_1 + g_1h_0
= (-0.3099)(0.3634) + (-0.1345)(0.7616) + 0 = -0.1126 - 0.1024 = -0.2151, \\
\frac{\partial\mathcal{L}}{\partial u} &= g_1x_1 + g_2x_2 + g_3x_3 = g_1 = -0.02824.
\end{aligned}
$$

唯一非零的输入在损失之前两步进入，所以它的梯度经过了两个雅可比因子 $J_3 = w(1 - h_3^2) = 0.484$ 和 $J_2 = w(1 - h_2^2) = 0.434$，二者之积为 0.21。在 float64 中取 $\epsilon = 10^{-6}$ 做中心差分 $(\mathcal{L}(w + \epsilon) - \mathcal{L}(w - \epsilon))/2\epsilon$，得到 $-0.21506$ 和 $-0.028243$，在所示位数上完全一致。
:::

### 代价

每一层的前向传播在循环乘积上约花费 $B \cdot T \cdot H^2$ 次乘加（输入部分另有 $B \cdot T \cdot H \cdot d_{\text{in}}$ 次）。反向传播约为其两倍：一次与 $\mathbf{W}_h^\top$ 的乘积把 $\mathbf{g}_{t+1}$ 传回，一次外积累加 $\mathbf{g}_t\mathbf{h}_{t-1}^\top$。它和前向传播一样在 $t$ 上是串行的。它还需要前向传播的每一个 $\mathbf{h}_t$ 和 $\mathbf{z}_t$，所以内存为 $O(B \cdot T \cdot H)$：与序列长度成正比。

还有一种前向模式的替代方案。**实时循环学习**（real-time recurrent learning，RTRL；Williams 和 Zipser 1989）把灵敏度 $\partial\mathbf{h}_t/\partial\mathbf{W}_h$ 随状态一起向前传递，并在每一步更新它，所以它不存储任何过去的东西，并能在线地在每一步给出梯度。灵敏度是一个 $H \times H^2$ 的数组，更新它需要一个 $H \times H$ 矩阵与之相乘：每步 $O(H^4)$ 的工作量，而 BPTT 是 $O(H^2)$。在 $H = 128$ 时，每条序列每步需要 $2.7 \times 10^8$ 次乘加，每条序列要存储 210 万个数，这就是 RTRL 不在大规模上使用的原因。

### 截断的随时间反向传播

一条长数据流无法作为一个展开的计算图放进内存。**截断的随时间反向传播**（truncated BPTT）把它切成 $k$ 步的块。状态从一个块传到下一个块，梯度却不传：计算图在每个块的边界处被切断（图 4.4，右）。在 PyTorch 中，切断只需一次调用 `detach()`：

```python
h = torch.zeros(1, B, H)
for X, Y in chunks:              # consecutive k-step pieces of the same B streams
    h = h.detach()               # keep the value, cut the graph behind it
    out, h = rnn(X, h)
    loss = loss_fn(head(out), Y)
    opt.zero_grad()
    loss.backward()
    opt.step()
```

内存从 $O(B \cdot T \cdot H)$ 降到 $O(B \cdot k \cdot H)$。代价是，长于 $k$ 步的依赖永远得不到直接的梯度。信息仍然可以通过传递的状态向前流动，所以网络可能用上它碰巧携带的长依赖，但损失中没有任何东西告诉它去学这样的依赖。一种常见的变体每 $k_1$ 步更新一次，反向传播 $k_2 \ge k_1$ 步（Williams 和 Peng 1990）。

本模块中的内存大小采用十进制：1 kB = $10^3$ B，1 MB = $10^6$ B，1 GB = $10^9$ B。二进制单位写作 KiB、MiB 和 GiB（1 GiB = $2^{30}$ B），在大小为 2 的幂或在其他模块中再次出现时，在括号中给出。

::: worked title="传感器数据流上的完整 BPTT 与截断 BPTT"
一条 $T = 100{,}000$ 个传感器采样点的数据流，一个 batch 有 $B = 32$ 条流，$H = 256$ 个状态单元，float32（4 字节）。完整 BPTT 保存每一个 $\mathbf{h}_t$ 需要

$$
100{,}000 \times 32 \times 256 \times 4\ \text{B} = 3.28 \times 10^9\ \text{B} = 3.28\ \text{GB}
$$

而这还只是状态。LSTM（[第 5 节](#s5)）每步要保存约六个这样大小的张量（它的各个门、细胞状态和输出），约 $6 \times 3.28 \approx 20$ GB。截断为 $k = 200$ 步的块时，同样的缓冲区是

$$
200 \times 32 \times 256 \times 4\ \text{B} = 6.55 \times 10^6\ \text{B} = 6.55\ \text{MB},
$$

小 500 倍，代价是超过 200 步就没有直接的梯度。
:::

::: figure id=fig-04-4
左：图 4.3 的展开计算图，前向箭头为灰色，反向箭头为红色：$\boldsymbol{\delta}_t$ 从 $\mathcal{L}_t$（竖直方向）以及从 $\boldsymbol{\delta}_{t+1}$ 经过 $\phi'$ 和 $\mathbf{W}_h^\top$（水平方向）到达。其下方的一条带状图把 $\partial\mathcal{L}/\partial\mathbf{W}_h$ 表示为每步外积 $\mathbf{g}_t\mathbf{h}_{t-1}^\top$ 之和。右：一条长数据流被切成 $k$ 步的块，边界处画着剪刀：灰色的状态箭头穿过每个切口继续（前向），红色的梯度箭头在切口处停止（“detach”）。
:::

### 检验梯度

手写的反向传播按[模块 02](module_02_ZH.html) 的方法检验：在 float64 下的一个小模型上，把每个参数的几个元素扰动 $\pm\epsilon$（$\epsilon = 10^{-5}$），构造中心差分，并用相对误差 $|a - n| / \max(|a|, |n|)$ 与解析梯度比较。误差在 $10^{-6}$ 到 $10^{-9}$ 左右说明反向传播是对的；高于 $10^{-4}$ 的都是 bug。实验 1 在训练之前做这一检验。一个典型的循环网络 bug，即漏掉 $\mathbf{W}_h^\top\mathbf{g}_{t+1}$ 项，在 $T = 1$ 时能通过检验，在 $T = 4$ 时就会失败，所以要用多步来检验。

::: check
为什么 RNN 的参数梯度是对时间步的求和？
:::

::: answer
同样的 $\mathbf{W}_h$、$\mathbf{W}_x$ 和 $\mathbf{b}$ 在每一步都被使用。损失通过每一次使用依赖于每个权重，多元链式法则把每次使用的贡献相加。
:::

::: check
用 $k = 25$ 步的截断 BPTT，模型能利用 50 步之前的信息吗？
:::

::: answer
它可以把这些信息携带在状态中，因为状态会跨越块边界传递，但没有任何梯度告诉它这样做。长于 $k$ 的依赖即便能学到，也只能间接学到。实验 1 中的闭合标签必须重复 18 到 36 个字符之前的起始标签，就是一个具体的例子。
:::

## 梯度消失与梯度爆炸 {#s4}

[第 3 节](#s3)中的每个长程项都包含 $n$ 个雅可比矩阵的乘积，$n$ 是权重的一次使用与它所影响的损失之间的距离。这样的乘积随 $n$ 几何地缩小或增长，几乎从不保持在 1 的量级。正是这一点，而不是容量不足，使普通循环网络学不会长依赖。

### 一个单元，没有非线性

对线性标量循环 $h_t = wh_{t-1} + ux_t$，每个雅可比都等于 $w$，所以 $\partial h_T/\partial h_{T-n} = w^n$：

| $w$ | $n = 10$ | $n = 50$ | $n = 100$ |
|---|---|---|---|
| 0.5 | $9.8 \times 10^{-4}$ | $8.9 \times 10^{-16}$ | $7.9 \times 10^{-31}$ |
| 0.9 | 0.349 | $5.2 \times 10^{-3}$ | $2.7 \times 10^{-5}$ |
| 0.99 | 0.904 | 0.605 | 0.366 |
| 1.01 | 1.10 | 1.64 | 2.70 |
| 1.1 | 2.59 | 117 | $1.4 \times 10^{4}$ |
| 2 | $1.0 \times 10^{3}$ | $1.1 \times 10^{15}$ | $1.3 \times 10^{30}$ |

::: worked title="循环权重能回溯多远"
把比值 $10^{-3}$ 当作有用学习信号的边界。它在滞后 $n = \ln 10^{-3} / \ln w$ 处达到：

$$
w = 0.5:\ n = \frac{-6.908}{-0.6931} = 9.97, \qquad
w = 0.9:\ n = \frac{-6.908}{-0.1054} = 65.6, \qquad
w = 0.99:\ n = \frac{-6.908}{-0.01005} = 687.
$$

即便 $w = 0.99$ 也会耗尽：$0.99^{500} = 6.6 \times 10^{-3}$。在另一侧，$1.01^{100} = 2.70$ 无害，$1.1^{50} = 117$ 就有害了，而 $2^{50} = 1.1 \times 10^{15}$ 会毁掉任何一次更新。对 $w = 0.5$，这个因子在 $n = 126$ 处达到 float32 的最小正规数 $2^{-126} \approx 1.2 \times 10^{-38}$。只有 $|w| = 1$ 附近的一个窄带能把信号传过数百步。
:::

### 多个单元，仍然线性

没有非线性时，梯度每向后一步就乘以 $\mathbf{W}_h^\top$。若 $\mathbf{W}_h = \mathbf{Q}\boldsymbol{\Lambda}\mathbf{Q}^{-1}$ 可对角化，则 $(\mathbf{W}_h^\top)^n = \mathbf{Q}^{-\top}\boldsymbol{\Lambda}^n\mathbf{Q}^\top$：在坐标 $\mathbf{a} = \mathbf{Q}^\top\mathbf{g}$ 下，每个分量乘以 $\lambda_i^n$。$|\lambda_i| < 1$ 的分量消失，$|\lambda_i| > 1$ 的分量爆炸，最终最大的 $|\lambda_i|$ 占主导，所以无论梯度来自哪个输出，它都指向同一个方向。长期的速率是**谱半径**（spectral radius）$\rho(\mathbf{W}) = \max_i |\lambda_i|$；Gelfand 公式 $\lVert\mathbf{W}^n\rVert^{1/n} \to \rho(\mathbf{W})$ 使这一点在任何范数下都成立，无论是否可对角化。

::: worked title="一个 2 × 2 循环，线性的与带 tanh 的"
$\mathbf{W}_h = \begin{pmatrix} 0.8 & 0.3 \\ 0.3 & 0.8 \end{pmatrix}$ 是对称矩阵，特征值为 $0.8 \pm 0.3$：沿 $(1, 1)/\sqrt2$ 的 $\lambda_1 = 1.1$，沿 $(1, -1)/\sqrt2$ 的 $\lambda_2 = 0.5$。向后送入 $\mathbf{g} = (1, 0) = \tfrac12(1, 1) + \tfrac12(1, -1)$：

$$
(\mathbf{W}_h^\top)^n\mathbf{g} = \tfrac12(1.1)^n(1, 1) + \tfrac12(0.5)^n(1, -1).
$$

- $n = 1$：$(0.55 + 0.25,\ 0.55 - 0.25) = (0.8, 0.3)$。
- $n = 20$：$\tfrac12(1.1)^{20} = 3.364$，$\tfrac12(0.5)^{20} = 4.8 \times 10^{-7}$，所以得到 $(3.364, 3.364)$，范数 4.76。
- $n = 50$：$(58.70, 58.70)$，范数 83.0。

0.5 分量已经消失（$0.5^{20} = 9.5 \times 10^{-7}$），梯度指向 $(1, 1)$。现在把单元换成 tanh，两者都处在 $|h| \approx 0.6$，所以每一步 $\tanh' = 1 - 0.6^2 = 0.64$。沿 $(1, 1)$ 的每步因子是 $1.1 \times 0.64 = 0.704$：$0.704^{20} = 8.9 \times 10^{-4}$，$0.704^{50} = 2.4 \times 10^{-8}$。非线性把一个爆炸的方向变成了消失的方向。
:::

### 由奇异值给出的界

特征值描述长期行为；奇异值则约束每一步。由于 $\mathbf{J}_k^\top = \mathbf{W}_h^\top\operatorname{diag}(\phi'(\mathbf{z}_k))$，

$$
\lVert\mathbf{J}_k^\top\rVert \le \gamma\,\sigma_{\max}(\mathbf{W}_h),
\qquad
\big\lVert\mathbf{J}_{t+1}^\top\cdots\mathbf{J}_T^\top\big\rVert \le
\big(\gamma\,\sigma_{\max}\big)^{T-t},
$$

其中 $\gamma = \sup|\phi'|$（tanh 和 ReLU 为 1，logistic sigmoid $\sigma$ 为 $1/4$），$\sigma_{\max}$ 是最大奇异值。因此（Pascanu、Mikolov 和 Bengio 2013），$\gamma\sigma_{\max} < 1$ 是**梯度消失的充分条件**，$\gamma\sigma_{\max} > 1$ 是**梯度爆炸的必要条件**：它允许增长，但并不强制增长。

::: note
**非正规矩阵先增长后衰减。**$\mathbf{N} = \begin{pmatrix} 0.5 & 1 \\ 0 & 0.5 \end{pmatrix}$ 的 $\rho = 0.5$，但 $\sigma_{\max} = 1.207$；$n = 1$ 到 5 时 $\lVert\mathbf{N}^n\rVert$ 依次为 1.207、1.059、0.770、0.508、0.316，$n = 10$ 时为 0.0196。PyTorch 默认的 `nn.RNN` 初始化就属于这一类。它从 $[-1/\sqrt H, 1/\sqrt H]$ 中均匀抽取 $\mathbf{W}_h$，元素方差为 $1/(3H)$；这种随机矩阵的特征值填满半径约为 $1/\sqrt3 = 0.58$ 的圆盘，而它的最大奇异值趋近 $2/\sqrt3 = 1.15$。实验 2 对 $H = 64$ 测得 $\rho \approx 0.57$、$\sigma_{\max} \approx 1.10$。
:::

### 非线性带来了什么

在 $\mathbf{J}_k = \operatorname{diag}(\phi'(\mathbf{z}_k))\mathbf{W}_h$ 中，tanh 的导数 $1 - \tanh^2 z$ 只在 $z = 0$ 处为 1：$z = 1$ 时为 0.42，$z = 2$ 时为 0.071，$z = 3$ 时为 0.0099。每个离开线性区的单元都向乘积中乘入一个小因子，所以即使是正交的 $\mathbf{W}_h$（每个奇异值都恰好为 1）也会丢失梯度。爆炸需要 $\rho$ 远大于 1，因为大的增益会把单元推入饱和，从而部分地抵消自身。

一次仿真给出具体的大小：$H = 32$，正交的 $\mathbf{W}_h$ 缩放到半径 $\rho$，tanh，每一步向预激活加入标准差为 $\sigma_x$ 的独立输入，从最后一步向后送入一个随机的单位梯度。在 $\rho = 1$、$\sigma_x = 1$ 时，一次抽样在滞后 10、50 和 100 处给出的比值为 $1.8 \times 10^{-2}$、$5.5 \times 10^{-11}$ 和 $5.1 \times 10^{-21}$，而线性网络恰好保持为 1。$\sigma_x = 0.1$ 时，滞后 100 处仍有 $1.3 \times 10^{-3}$；$\rho = 1.5$ 时为 $1.3 \times 10^{-7}$；只有 $\rho = 3$ 才会爆炸（$5.5 \times 10^{8}$）。换一次抽样，这些值会变化几倍，但数量级不变。

::: widget name=gradient-flow-explorer
默认设置就是上面的仿真，用的是控件自己的随机抽样：比值在滞后 10、50 和 100 处依次经过 $6.7 \times 10^{-3}$、$3.1 \times 10^{-11}$ 和 $1.1 \times 10^{-21}$。切换到线性，曲线就落在平直的 $\rho^n$ 线上；切换回来并降低 $\sigma_x$，观察 $\phi'$ 的直方图移向 1。把 $\rho$ 提高到 1.5，再提高到 3。选择高斯矩阵并使用线性设置，可以看到虚线上方的暂态增长。比较 LSTM 的细胞路径，即遗忘门的乘积：$b_f = 4$ 时它在滞后 100 处接近 0.1（没有离散时 $\sigma(4)^{100} = 0.163$）。[第 5 节](#s5)会解释它。
:::

### 为什么梯度消失比看起来更糟

梯度的长程项比短程项指数级地小，所以总梯度看起来很健康，损失在下降，网络学到了短程相关；长依赖的贡献被埋没在这些项和 mini-batch 噪声之下。网络从未被告知这个依赖存在。Hochreiter 在他 1991 年的毕业论文（Diplom）中发现了这一点；Bengio、Simard 和 Frasconi（1994）用要求在不断增长的延迟上锁存一个比特的网络展示了它，并证明：以稳定状态附近的收缩动力学稳健地存储一个比特，恰恰就是让梯度消失的条件。[第 2 节](#s2)中锁存的单元就是一个小例子：它的局部因子降到了 0.347 和 0.200。

在[实验 1](#lab1) 中，后果体现在行为上。RNN 学会了日志的每一条局部规则，包括一个数值阈值，但在温度 0.5 下，它的样本只有大约五分之一会用 18 到 36 个字符之前开启这一行的标签来闭合这一行（实验 1 的运行中为 21%，实验 2 的普通 RNN 为 14% 到 25%），而在八个设备标签中随机猜测为 12.5%。[实验 2](#lab2) 的 LSTM 学会了它。

### 悬崖与裁剪

在雅可比乘积很大的地方，损失曲面上有一堵近乎竖直的墙（图 4.6）。在墙脚处按巨大梯度成比例地迈一步，会把参数抛到很远：损失尖峰或 NaN，常常发生在数千次平静的更新之后。

::: figure id=fig-04-6
循环网络的损失沿一个参数的一维切片：一道缓坡的山谷被一堵近乎竖直的墙，即悬崖，打断。从墙脚的一点出发，未裁剪的梯度步跳出图外很远，而沿同一方向、长度有界的裁剪步则留在山谷中。仿照 Pascanu、Mikolov 和 Bengio（2013）中的图。
:::

按全局范数做的**梯度裁剪**（gradient clipping）在 $\lVert\mathbf{g}\rVert > c$ 时把 $\mathbf{g}$ 替换为 $(c/\lVert\mathbf{g}\rVert)\,\mathbf{g}$：方向保持不变，步长有界。对循环网络，$c$ 通常取 1 到 5（[模块 02](module_02_ZH.html) 给出了一般规则）。对每个分量单独裁剪，即**按值裁剪**（value clipping），会改变方向。

::: worked title="按范数裁剪与按值裁剪"
$\mathbf{g} = (3, 4)$ 的范数为 5；裁剪到 $c = 1$ 得到 $(0.6, 0.8)$，方向相同。$\mathbf{g} = (30, 0.4)$ 偏离第一个坐标轴 $\arctan(0.4/30) = 0.8^\circ$。按值裁剪到 $[-1, 1]$ 得到 $(1, 0.4)$，角度为 $\arctan 0.4 = 21.8^\circ$。按范数裁剪除以 30.003，得到 $(0.99991, 0.01333)$，仍是 $0.8^\circ$。
:::

裁剪能治好梯度爆炸，对梯度消失却毫无作用：它从不放大梯度。

### 初始化，以及结构上的修正

正交的 $\mathbf{W}_h$（Saxe、McClelland 和 Ganguli 2014）让每个奇异值从 1 开始。用 ReLU 单元配合单位矩阵初始化（Le、Jaitly 和 Hinton 2015）与之类似，而在整个训练过程中保持的酉约束（Arjovsky、Shah 和 Bengio 2016）走得更远。它们都无法消除非线性带来的因子，而且只有约束能阻止训练改变 $\mathbf{W}_h$。结构上的修正是一条加性路径，梯度在这条路径上不会每一步都乘以 $\mathbf{W}_h$ 和 $\phi'$：这就是[第 5 节](#s5)的 LSTM，与[模块 03](module_03_ZH.html) 中跨越深度的残差连接是同一种补救。

::: check
使用 tanh 单元、且 $\mathbf{W}_h$ 的最大奇异值为 0.8 时，梯度会爆炸吗？
:::

::: answer
不会。每个雅可比矩阵的范数至多为 $1 \times 0.8$，所以 $n$ 步上的乘积至多为 $0.8^n$。
:::

::: check
为什么正交的 $\mathbf{W}_h$ 不能防止 tanh RNN 中的梯度消失？
:::

::: answer
雅可比矩阵中还含有 $\operatorname{diag}(\tanh'(\mathbf{z}_k))$，它至多为 1，且只在 $z = 0$ 处等于 1。只要单元离开线性区，每一步都会乘入小于 1 的因子。
:::

::: check
梯度裁剪和正交初始化，各自针对哪种失效？
:::

::: answer
裁剪约束每一次更新：针对梯度爆炸。正交初始化让奇异值从 1 开始，在训练早期有助于对抗梯度消失。一旦 tanh 饱和，两者都无法修正梯度消失。
:::
