## 自测题 {#quiz}

共 12 道题，每题只有一个正确答案。先不回看正文作答，再读每一条解析，包括你排除的那些选项的解析，因为每个错误选项都是人们真实会犯的错误。

```quiz
? 在 $T$ 步上展开后，一个循环网络等价于：
- [x] 一个 $T$ 层、各层共享同一组权重的前馈网络
- [ ] 一个作用在拼接后序列上的单层网络
- [ ] 一个每层都有独立权重的 $T$ 层网络
- [ ] 一个卷积核宽 $T$ 步的卷积
> 每一步都使用同样的 $\mathbf{W}_h$、$\mathbf{W}_x$ 和 $\mathbf{b}$，所以每一步就是一层，且所有层共享权重（[第 2 节](#s2)）。作用在拼接序列上的单层网络需要固定的长度，也不会在不同位置之间复用权重。每层独立的权重描述的是一个深层的窗口网络，参数量是 $T$ 倍。只有线性时不变的循环才等价于卷积（[第 13 节](#s13)），而且那时它的卷积核是 $\mathbf{C}\mathbf{A}^k\mathbf{B}$，而不是任意的滤波器。

? 一个线性 RNN 的循环矩阵的特征值为 0.95 和 1.05。从一个一般的初始向量出发，把梯度向回传播 100 步，会发生什么？
- [ ] 它会消失，因为两个特征值的平均为 1
- [ ] 它的大小基本不变
- [x] 它增大约 130 倍，并转向特征值 1.05 的特征向量
- [ ] 它振荡但不增大
> 两个特征分量分别按 $0.95^{100} = 0.0059$ 和 $1.05^{100} = 131.5$ 缩放。后者占主导，所以梯度增大约 130 倍，并与它的特征向量对齐（[第 4 节](#s4)）。对特征值取平均在这里没有意义，因为每个分量乘的是它自己的特征值，而幂不会相互平均。出于同样的原因，大小也不会保持不变。振荡而不增大需要模为 1 的复特征值，而这两个特征值是实数。

? 阈值为 $c$ 的全局范数梯度裁剪：
- [ ] 把每个大于 $c$ 的梯度分量设为 $c$
- [ ] 给小梯度加上大小为 $c$ 的噪声，防止它们消失
- [ ] 每当损失上升时把学习率除以 $c$
- [x] 当梯度范数超过 $c$ 时，把整个梯度重新缩放到范数为 $c$，方向保持不变
> 范数裁剪限制了步长，同时保留方向，这就是它在损失曲面的悬崖处有用的原因（[第 4 节](#s4)）。把分量设为 $c$ 是按值裁剪，它会改变方向。给小梯度加噪声不是裁剪，也找不回已经丢失的信号。把学习率除以 $c$ 是一种调度，不是裁剪。裁剪从不放大小梯度，所以它对梯度消失毫无作用。

? 在 LSTM 中，沿直接路径（细胞路径），$\mathbf{c}_t$ 对 $\mathbf{c}_{t-1}$ 的导数是：
- [ ] 遗忘门的权重矩阵 $\mathbf{W}_f$
- [x] $\operatorname{diag}(\mathbf{f}_t)$
- [ ] $\operatorname{diag}(\mathbf{o}_t \odot \tanh'(\mathbf{c}_t))$
- [ ] $\operatorname{diag}(\mathbf{i}_t)$
> 由 $\mathbf{c}_t = \mathbf{f}_t \odot \mathbf{c}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{c}}_t$，对第一项关于 $\mathbf{c}_{t-1}$ 求导，得到 $\operatorname{diag}(\mathbf{f}_t)$：这是每一步的门值，网络可以把它保持在接近 1 的位置（[第 5 节](#s5)）。$\mathbf{W}_f$ 只通过经由 $\mathbf{h}_{t-1}$ 的路径进入，不在直接路径上。$\operatorname{diag}(\mathbf{o}_t \odot \tanh'(\mathbf{c}_t))$ 是 $\mathbf{h}_t$ 对 $\mathbf{c}_t$ 的导数。$\operatorname{diag}(\mathbf{i}_t)$ 乘的是候选值，而候选值并不直接包含 $\mathbf{c}_{t-1}$。

? PyTorch 的 `nn.LSTM(10, 20)` 有多少个参数？
- [x] 2,560
- [ ] 2,480
- [ ] 1,920
- [ ] 640
> 四个门块，每块 $20 \times (10 + 20)$，共 $4\cdot20\cdot30 = 2{,}400$ 个权重；PyTorch 的两个偏置向量各有 $4\cdot20 = 80$ 个元素，再加上 160 个，共 2,560。2,480 是只有一个偏置向量时的数目。1,920 是 `nn.GRU(10, 20)`，三个块：$3\cdot20\cdot30 + 3\cdot20\cdot2 = 1{,}920$。640 是普通的 `nn.RNN(10, 20)`，一个块：$20\cdot30 + 2\cdot20 = 640$。

? 哪项任务适合使用双向 LSTM？
- [ ] 实时预测轴承温度的下一个值
- [ ] 时延预算为 10 ms 的流式异常检测
- [x] 一次测试记录完成后，把其中每一秒标记为正常或故障
- [ ] 一次一个字符地生成文本
> 双向网络在每个位置既读取过去也读取未来，所以只有能拿到整个序列的离线任务才可以使用它（[第 6 节](#s6)）。预测、流式检测和生成都是因果的：做决策的那一刻，未来还不存在；在这些任务上训练的双向模型所用到的信息，在上线服务时永远拿不到。

? 一个只用教师强制训练的序列到序列模型，开头几个 token 很流畅，之后逐渐跑偏。最可能的原因是：
- [ ] 学习率过高
- [ ] 双向编码器
- [ ] 束宽过大
- [x] 暴露偏差：解码器在训练中从未以它自己的预测为条件
> 在教师强制下，解码器看到的总是真实的前一个 token；推理时，它自己的、有时出错的 token 会把它带入训练中从未遇到过的状态，误差随之累积（[第 10 节](#s10)）。学习率过高表现为训练不稳定或发散，而不是推理时开头流畅、随后跑偏。双向编码器很常见，而且只读取源序列。束宽过大会导致偏向短输出，而不是这种模式。

? 束宽 $k = 1$ 的束搜索就是：
- [ ] 对所有序列的穷举搜索
- [x] 贪心解码
- [ ] 温度为 1 的采样
- [ ] 长度归一化搜索
> 每一步只保留唯一最好的部分假设，这正是贪心解码（[第 10 节](#s10)）。穷举搜索保留每一个假设，是不可行的（词表有 10,000 个 token、长度为 20 个 token 时为 $V^{20} = 10^{80}$）。采样是随机的，而束搜索是确定性的。长度归一化是一种打分方式，可以与任意 $k$ 一起使用，包括 1，也包括穷举搜索。

? 在 Bahdanau 注意力中，解码器第 $t$ 步的权重 $\alpha_{t,j}$：
- [ ] 是可学习的参数，每个源位置一个
- [ ] 在解码器各步 $t$ 上求和为 1
- [x] 在源位置 $j$ 上求和为 1，并由 $\mathbf{s}_{t-1}$ 和每个 $\mathbf{h}_j$ 计算得到
- [ ] 对单调任务固定在对角线上
> 它们是分数 $\mathbf{v}_a^\top\tanh(\mathbf{W}_a\mathbf{s}_{t-1} + \mathbf{U}_a\mathbf{h}_j)$ 在 $j$ 上的 softmax，对每个输入、每一步都重新计算（[第 11 节](#s11)）。参数是 $\mathbf{v}_a$、$\mathbf{W}_a$ 和 $\mathbf{U}_a$；权重依赖于输入，所以不可能按位置固定。归一化是在某一步的各个源位置上进行的，而不是跨步进行。也没有任何东西迫使它们落在对角线上：实验 4 中数字反转任务的对齐就是反对角线。

? 评估一个预测模型时，下列哪一项不是数据泄漏？
- [ ] 用整个序列的均值和标准差做 z 分数标准化
- [ ] 先打乱相互重叠的窗口，再随机按 80/20 划分
- [ ] 根据最后测试时段上的 RMSE 选择训练轮数
- [x] 在前向滚动验证的每一折中，只用训练部分重新计算归一化统计量
> 只用训练部分计算的逐折统计量才是正确做法（[第 8 节](#s8)）。整个序列的统计量用到了未来。打乱后的重叠窗口会把每个测试窗口的近似副本放进训练集，模型只需在记住的邻居之间插值。根据测试时段选择轮数，是把测试集重复用于模型选择，于是它的误差不再是诚实的估计。

? 一个一步 LSTM 预测器先从每个窗口中减去该窗口的最后一个值，用来监测某个传感器。传感器出现一个 $+0.8$ 的恒定偏移，并持续 100 个样本。基于残差阈值的检测器会：
- [ ] 在这 100 个样本中持续报警
- [x] 只在开始时（以及结束时）报警，因为模型在一步之内就以新水平重新居中
- [ ] 从不报警
- [ ] 只在 50 个样本之后报警
> 输入是相对于最后一个值取的，所以一步之后，偏移后的水平就成了新的参考，残差恢复正常。变化只在发生和结束的时刻可见（[第 9 节](#s9)和实验 3）。它不会持续报警，因为只有在跳变那一步残差才大。它确实在开始时报警，所以“从不报警”是错的。模型里没有任何东西会数到 50；延迟报警需要一条累积证据的规则，而单步阈值没有这样的规则。持续的偏移需要对照独立的参考做水平检查，或者使用一个不会重新居中的模型的残差。

? 为什么 S4 式的状态空间层可以沿时间并行训练，而 LSTM 不行？
- [x] 它的循环是线性时不变的，所以输出是输入与卷积核 $\mathbf{C}\bar{\mathbf{A}}^k\bar{\mathbf{B}}$ 的卷积，可以一次算出所有步
- [ ] 它的参数比 LSTM 少
- [ ] 它在内部使用注意力
- [ ] 它没有隐状态
> 线性和时不变性把展开后的映射变成一个卷积，用 FFT 计算（[第 13 节](#s13)）；Mamba 那样的时变线性循环则改用结合律扫描。LSTM 的门非线性地依赖于 $\mathbf{h}_{t-1}$，这迫使计算成为串行循环。参数量并不决定各步能否一起计算。状态空间层不含注意力。它确实有隐状态，推理时在循环模式下使用。
```

## 论文导读 {#reading}

读论文要读两遍，而不是一遍。第一遍用五到十分钟，并不是通常意义上的阅读：读标题、摘要和引言、各节标题、每一张图及其说明，以及结论。然后用自己的话写下三件事：论文要解决什么问题，它声称做到了什么，以及哪张图或哪个表是证据。如果写不出来，说明这篇论文暂时还不值得读第二遍，或者你缺少某项前置知识；学完本模块的相关章节后再回来读。第二遍要慢，而且要主动。带着笔读**读哪些部分**中指明的各节，并做问题要求的小计算：一个界、一个形状、一个参数量。你亲手重算过的数字，才是你真正理解的数字。初读时跳过证明和附录，把没跟上的每一步记下来，而不是把它丢在一边。这一方案改编自 Keshav 在 "How to read a paper"（2007）中提出的三遍阅读法。

这三篇论文覆盖了本模块的主线：循环网络的梯度为什么失常，以及裁剪如何抑制梯度爆炸（[第 4 节](#s4)）；消除了编码器-解码器瓶颈的注意力（[第 11 节](#s11)）；以及让循环重新回归的选择性状态空间模型（[第 13 节](#s13)）。三篇合计 50 分钟。同一篇论文不同版本的节号和图号并不相同，所以下面的说明用主题来指明各个部分；请对应到你手上的版本。

::: paper minutes=20
Pascanu, R., Mikolov, T., Bengio, Y. "On the difficulty of training recurrent neural networks." *International Conference on Machine Learning (ICML)*, 2013.

**为什么读它。** 它对循环网络的梯度为何消失和爆炸做了最清晰的分析：雅可比矩阵的连乘、把网络看作动力系统的视角，以及损失曲面上悬崖的几何形状。梯度范数裁剪也起源于此，截至 2026 年，它仍是循环网络和 Transformer 训练中的标准做法。这篇论文说明了[第 4 节](#s4)的论断中，哪些是充分条件，哪些只是必要条件。

**读哪些部分。** 完整地读引言和关于梯度爆炸与梯度消失的那一节：先是其中的机制，包括梯度消失的充分条件和梯度爆炸的必要条件，然后是动力系统视角，以及附有“墙”示意图的几何解释。接着读关于缩小梯度的小节，也就是裁剪算法。略读作者为梯度消失提出的正则项和实验部分。跳过推导，它们在补充材料中。

**阅读时要回答的问题。**

1. 用 $\mathbf{W}_{\text{rec}}$ 的最大奇异值和激活函数导数的界 $\gamma$，写出梯度消失的充分条件。对 tanh 和 logistic sigmoid，$\gamma$ 分别是多少？
2. 为什么相应的梯度爆炸条件只是必要条件，而不是充分条件？
3. 描述损失曲面上的“墙”，并解释当一步撞上它时，为什么重新缩放梯度的范数（而不是它的各个分量）会有帮助。
4. 作者建议如何选择裁剪阈值？这与[第 7 节](#s7)给出的 1 到 5 的范围相比如何？

**读完之后。** 取[第 4 节](#s4)例题中的 $2\times2$ 矩阵 $\begin{pmatrix}0.8 & 0.3\\0.3 & 0.8\end{pmatrix}$，用论文的条件判断 tanh 单元是否保证梯度消失（它的最大奇异值为 1.1，且 $\gamma = 1$）。然后用两句话说明为什么答案是“不能保证”，以及尽管如此，这个例子对 tanh 的导数说明了什么。
:::

::: paper minutes=15
Bahdanau, D., Cho, K., Bengio, Y. "Neural machine translation by jointly learning to align and translate." *International Conference on Learning Representations (ICLR)*, 2015 (arXiv:1409.0473).

**为什么读它。** 它引入了注意力，用来解决编码器-解码器的瓶颈。去掉循环之后，这个想法就成了 Transformer，所以[模块 06](module_06_ZH.html) 的机制正是在这篇论文中首次出现的，形式是加性注意力。

**读哪些部分。** 读引言、关于 RNN 编码器-解码器的背景，以及关于联合学习对齐与翻译的那一节：带对齐模型的解码器，以及产生注释（annotation）的双向编码器。看一看翻译质量随句子长度变化的图，以及各张对齐图。跳过实验设置和附录的大部分内容，但对齐模型的定义除外。

**阅读时要回答的问题。**

1. “注释” $\mathbf{h}_j$ 是什么？作者为什么用双向 RNN 来计算它？
2. 写出他们的对齐模型 $a(\mathbf{s}_{i-1}, \mathbf{h}_j)$，并把每个符号对应到[第 11 节](#s11)的记号。
3. 质量随句子长度变化的图，对不带注意力和带注意力的编码器-解码器分别显示了什么？与[实验 4](#lab4) 中数字反转的准确率比较。
4. 在图中找出一个非单调的对齐，并用两种语言的语序来解释它。

**读完之后。** 按[第 11 节](#s11)的形状（注释宽度 $2H$，注意力宽度 $d_a$）重写论文的解码器步骤，并列出在三个矩阵中，哪些与注释的乘积可以对每个源句子只计算一次。然后指出把论文的打分函数变成 Luong 点积打分所需的那一处改动，以及这一改动去掉了什么。
:::

::: paper minutes=15
Gu, A., Dao, T. "Mamba: Linear-time sequence modeling with selective state spaces." arXiv:2312.00752, 2023.

**为什么读它。** 它让状态空间模型的参数依赖于输入，从而使循环在语言规模的序列建模上重新具有竞争力。它是[第 12 节](#s12)和[第 13 节](#s13)所讨论的权衡的最清晰的当代例子：代价恒定的循环，对比注意力的精确查找。

**读哪些部分。** 读摘要和引言。读关于状态空间模型的一节：连续系统、离散化、循环计算与卷积计算，以及线性时不变性。在关于选择性状态空间模型的一节中，读动机部分（把选择作为一种压缩手段，配以选择性复制和归纳头两个任务），以及对比时不变模型与选择性模型的算法。略读硬件感知扫描的描述。跳过实验部分，只需看一眼合成任务的结果。

**阅读时要回答的问题。**

1. 作者用模型把上下文压缩进状态的程度，描述了效率与效果之间的一种权衡。写出这一权衡，并把 Transformer 和 LTI 状态空间模型分别放在它的两端。
2. 在选择性模型中，哪些参数变成了输入的函数？为什么这就排除了卷积模式？
3. 用一句话说明：在 GPU 上如何高效地计算选择性循环？
4. 论文把 $\Delta$ 与经典循环网络的门联系起来。写出这种联系，并与[第 6 节](#s6)中 GRU 的更新门比较。

**读完之后。** 用[第 13 节](#s13)的零阶保持公式，对 $\Delta = 0.01$ 和 $\Delta = 5$ 计算 $a = e^{-\Delta}$，并说明每个值适合选择性复制任务中的哪一类 token。然后写出一个任务：在这个任务上，选择性模型固定大小的状态相对于注意力是一个劣势。
:::

## 小结 {#summary}

- 循环网络在每一步都应用同一个函数 $\mathbf{h}_t = \phi(\mathbf{W}_h\mathbf{h}_{t-1} + \mathbf{W}_x\mathbf{x}_t + \mathbf{b})$，这使它成为一个共享权重的深层网络；一个普通的循环层有 $H(H + d_{\text{in}}) + H$ 个参数，按 PyTorch 的双偏置约定还要再加 $H$ 个。
- 随时间反向传播就是在展开后的网络上做普通的反向传播：对某个状态的梯度是雅可比矩阵 $\mathbf{J}_k = \operatorname{diag}(\phi'(\mathbf{z}_k))\mathbf{W}_h$ 的连乘，共享权重的梯度是它在每一步的贡献之和；截断反向传播是用依赖范围换取内存，而有限差分可以检验任何实现。
- 梯度随时间间隔呈几何级数地消失或爆炸，因为 $n$ 个雅可比矩阵的乘积按 $\rho^n$ 缩放：$0.9^{100} = 2.7\times10^{-5}$，$1.1^{100} = 1.4\times10^{4}$；tanh 的导数使梯度消失更严重，所以在实践中，即使是正交的循环矩阵也会损失梯度。
- 裁剪全局梯度范数（通常取 1 到 5）能治梯度爆炸，仅此而已；正交初始化或单位矩阵初始化能推迟梯度消失，但不能消除它，结构上的解决办法是一条加性路径。
- LSTM 的细胞状态以加法方式更新，$\mathbf{c}_t = \mathbf{f}_t \odot \mathbf{c}_{t-1} + \mathbf{i}_t \odot \tilde{\mathbf{c}}_t$，所以沿着这条路径，梯度乘的是遗忘门 $\mathbf{f}_t$，一个网络可以保持在接近 1 的数；遗忘门偏置取 5 时，默认的半衰期约为 103 步，而偏置取 0 时只有 1 步。
- 参数量的计算是机械的：`nn.LSTM(1, 32)` 有 4,480 个参数，`nn.GRU(1, 32)` 有 3,360 个；LSTM 是默认选择，模型大小或速度吃紧时选 GRU，而只有在离线拿到整个序列时，使用双向网络才是正当的。
- 在实践中训练循环网络，需要对变长序列做填充、掩码或打包，需要裁剪梯度、合理的遗忘门偏置，以及一套调试顺序：从单个小 batch 开始，模型必须能在它上面过拟合。
- 预测的好坏取决于它的划分和基线：用前向滚动验证的各折按时间划分，所有统计量都在训练部分上计算，在模型的误差旁边报告朴素预测、季节性朴素预测和线性自回归的误差（或 MASE 这样的尺度化分数），并在水平漂移时按窗口归一化，因为网络不会外推水平。
- 基于残差的监测器要在留出的正常数据上设定阈值，因为训练残差小得过于乐观；如果残差独立且服从高斯分布，1 Hz 下的 $3\sigma$ 检验每天约有 233 次误报；每种故障类型（尖峰、噪声变化、传感器卡死、持续偏移）都需要自己的检测器。
- 编码器-解码器把 $p(y \mid x)$ 逐个 token 地分解，训练时用教师强制，以真实前缀为条件，解码时却以自己的预测为条件（暴露偏差）；束宽为 1 的束搜索就是贪心解码，更宽的束能找到概率更高的序列，但除非分数做了长度归一化，否则会偏向短序列；任何搜索都修复不了一个不知道答案的模型。
- 单个摘要向量是一个瓶颈（在实验 4 中，数字反转的整串正确率从长度 4 时的约 98% 降到长度 12 时的约 1%），注意力消除了这个瓶颈：解码器对所有编码器状态做 softmax 加权平均，使每个输出到每个输入都只有一步的路径，而这些权重构成的对齐是一种诊断手段，而不是解释。
- Transformer 取代了循环，因为非线性循环需要 $T$ 个相互依赖的步骤，路径长度为 $O(T)$，而注意力的路径只有一步，代价是平方级的；循环保持恒定大小的状态（宽度为 1,024 的 4 层 LSTM 为 32.8 kB，而宽度为 2,048 的 24 层 Transformer 在 32,768 个 token 时的 KV cache 为 6.44 GB），线性时不变的循环是一种可以并行训练的卷积，而 Mamba 依赖输入的步长又把它变回了一个门。

[模块 05](module_05_ZH.html) 把视野从序列扩展到其他值得了解的网络家族：自编码器与 VAE、GAN、扩散模型、图网络、物理信息网络和对比学习，其中有几种会在后续模块的大模型中再次出现。[模块 06](module_06_ZH.html) 随后取出[第 11 节](#s11)的注意力，彻底去掉循环，构建出 Transformer：同样的查询-键-值查找，由每个位置对其他每个位置施加，带有[第 11 节](#s11)所论证的缩放因子 $\sqrt{d_k}$，以及循环原本免费提供的位置信息。

## 参考文献 {#refs}

- Elman, J. L. "Finding structure in time." *Cognitive Science*, 1990. 第 2 节的简单循环网络。
- Werbos, P. J. "Backpropagation through time: what it does and how to do it." *Proceedings of the IEEE*, 1990. 随时间反向传播。
- Williams, R. J., Zipser, D. "A learning algorithm for continually running fully recurrent neural networks." *Neural Computation*, 1989. 实时循环学习，即前向模式的替代方案。
- Williams, R. J., Peng, J. "An efficient gradient-based algorithm for on-line training of recurrent network trajectories." *Neural Computation*, 1990. 更新长度与反向传播长度分开设定的截断 BPTT。
- Hochreiter, S. "Untersuchungen zu dynamischen neuronalen Netzen." Diploma thesis, Technische Universität München, 1991. 对梯度消失的首次分析，德文。
- Bengio, Y., Simard, P., Frasconi, P. "Learning long-term dependencies with gradient descent is difficult." *IEEE Transactions on Neural Networks*, 1994. 循环网络中的梯度消失问题。
- Pascanu, R., Mikolov, T., Bengio, Y. "On the difficulty of training recurrent neural networks." *ICML*, 2013. 谱条件与梯度裁剪（论文导读）。
- Saxe, A. M., McClelland, J. L., Ganguli, S. "Exact solutions to the nonlinear dynamics of learning in deep linear neural networks." *ICLR*, 2014. 正交初始化。
- Le, Q. V., Jaitly, N., Hinton, G. E. "A simple way to initialize recurrent networks of rectified linear units." *arXiv*, 2015. 配合 ReLU 的单位矩阵初始化。
- Arjovsky, M., Shah, A., Bengio, Y. "Unitary evolution recurrent neural networks." *ICML*, 2016. 保持范数的循环。
- Hochreiter, S., Schmidhuber, J. "Long short-term memory." *Neural Computation*, 1997. LSTM 与恒定误差传送带。
- Gers, F. A., Schmidhuber, J., Cummins, F. "Learning to forget: continual prediction with LSTM." *Neural Computation*, 2000. 遗忘门。
- Greff, K. et al. "LSTM: a search space odyssey." *IEEE Transactions on Neural Networks and Learning Systems*, 2017. 比较了八种变体。
- Jozefowicz, R., Zaremba, W., Sutskever, I. "An empirical exploration of recurrent network architectures." *ICML*, 2015. 取 1 的遗忘门偏置。
- Tallec, C., Ollivier, Y. "Can recurrent neural networks warp time?" *ICLR*, 2018. 门偏置的 chrono 初始化。
- Cho, K. et al. "Learning phrase representations using RNN encoder-decoder for statistical machine translation." *EMNLP*, 2014. GRU 与编码器-解码器。
- Cho, K., van Merriënboer, B., Bahdanau, D., Bengio, Y. "On the properties of neural machine translation: encoder-decoder approaches." *SSST-8 Workshop*, 2014. 翻译质量随句子长度下降。
- Chung, J., Gulcehre, C., Cho, K., Bengio, Y. "Empirical evaluation of gated recurrent neural networks on sequence modeling." *arXiv*, 2014. GRU 与 LSTM 的对比。
- Weiss, G., Goldberg, Y., Yahav, E. "On the practical computational power of finite precision RNNs for language recognition." *ACL*, 2018. LSTM 能计数；GRU 在实践中不能。
- Schuster, M., Paliwal, K. K. "Bidirectional recurrent neural networks." *IEEE Transactions on Signal Processing*, 1997. 双向网络。
- Gal, Y., Ghahramani, Z. "A theoretically grounded application of dropout in recurrent neural networks." *NeurIPS*, 2016. 变分 dropout。
- Merity, S., Keskar, N. S., Socher, R. "Regularizing and optimizing LSTM language models." *ICLR*, 2018. 作用于循环权重的 dropout（AWD-LSTM）。
- Ba, J. L., Kiros, J. R., Hinton, G. E. "Layer normalization." *arXiv*, 2016. 包括循环网络。
- Graves, A. "Generating sequences with recurrent neural networks." *arXiv*, 2013. 字符级生成与手写生成。
- Karpathy, A. "The unreasonable effectiveness of recurrent neural networks." Blog post, 2015. 字符级模型写出散文、代码和标记语言。
- Karpathy, A., Johnson, J., Fei-Fei, L. "Visualizing and understanding recurrent networks." *ICLR Workshop*, 2016. 可解释的 LSTM 单元。
- Sutskever, I., Vinyals, O., Le, Q. V. "Sequence to sequence learning with neural networks." *NeurIPS*, 2014. 编码器-解码器与反转的源序列。
- Bengio, S., Vinyals, O., Jaitly, N., Shazeer, N. "Scheduled sampling for sequence prediction with recurrent neural networks." *NeurIPS*, 2015. 暴露偏差的一种补救方法。
- Ranzato, M. et al. "Sequence level training with recurrent neural networks." *ICLR*, 2016. 提出了“暴露偏差”这一名称。
- Wu, Y. et al. "Google's neural machine translation system: bridging the gap between human and machine translation." *arXiv*, 2016. 深层残差 LSTM 堆叠；束搜索中的长度归一化。
- Bahdanau, D., Cho, K., Bengio, Y. "Neural machine translation by jointly learning to align and translate." *ICLR*, 2015. 加性注意力（论文导读）。
- Luong, M.-T., Pham, H., Manning, C. D. "Effective approaches to attention-based neural machine translation." *EMNLP*, 2015. 乘性注意力。
- Jain, S., Wallace, B. C. "Attention is not explanation." *NAACL*, 2019; with Wiegreffe, S., Pinter, Y. "Attention is not not explanation." *EMNLP*, 2019. 谨慎解读注意力权重。
- Vaswani, A. et al. "Attention is all you need." *NeurIPS*, 2017. Transformer，见模块 06；它的复杂度表是第 12 节那张表的蓝本。
- van den Oord, A. et al. "WaveNet: a generative model for raw audio." *arXiv*, 2016. 空洞因果卷积。
- Bai, S., Kolter, J. Z., Koltun, V. "An empirical evaluation of generic convolutional and recurrent networks for sequence modeling." *arXiv*, 2018. 时间卷积网络。
- Katharopoulos, A., Vyas, A., Pappas, N., Fleuret, F. "Transformers are RNNs: fast autoregressive transformers with linear attention." *ICML*, 2020. 把线性注意力看作一种循环。
- Blelloch, G. E. "Prefix sums and their applications." Technical report CMU-CS-90-190, Carnegie Mellon University, 1990. 并行扫描。
- Gu, A., Dao, T., Ermon, S., Rudra, A., Ré, C. "HiPPO: recurrent memory with optimal polynomial projections." *NeurIPS*, 2020. S4 背后的初始化方法。
- Gu, A., Goel, K., Ré, C. "Efficiently modeling long sequences with structured state spaces." *ICLR*, 2022. S4。
- Tay, Y. et al. "Long Range Arena: a benchmark for efficient transformers." *ICLR*, 2021. 长序列基准。
- Gupta, A., Gu, A., Berant, J. "Diagonal state spaces are as effective as structured state spaces." *NeurIPS*, 2022; and Gu, A., Gupta, A., Goel, K., Ré, C. "On the parameterization and initialization of diagonal state space models." *NeurIPS*, 2022. DSS 与 S4D。
- Orvieto, A. et al. "Resurrecting recurrent neural networks for long sequences." *ICML*, 2023. 实验 5 所采用的线性循环单元（LRU）。
- Gu, A., Dao, T. "Mamba: linear-time sequence modeling with selective state spaces." *arXiv*:2312.00752, 2023. 选择性状态空间模型（论文导读）。
- Dao, T., Gu, A. "Transformers are SSMs: generalized models and efficient algorithms through structured state space duality." *ICML*, 2024. Mamba-2。
- Lieber, O. et al. "Jamba: a hybrid transformer-Mamba language model." *arXiv*, 2024. 一个已发表的混合模型。
- Beck, M. et al. "xLSTM: extended long short-term memory." *NeurIPS*, 2024. 重新设计的 LSTM。
- Hyndman, R. J., Athanasopoulos, G. *Forecasting: Principles and Practice*, 3rd edition. OTexts, 2021. 可免费在线阅读；基线方法与时间序列交叉验证。
- Hyndman, R. J., Koehler, A. B. "Another look at measures of forecast accuracy." *International Journal of Forecasting*, 2006. MASE。
- Tashman, L. J. "Out-of-sample tests of forecasting accuracy: an analysis and review." *International Journal of Forecasting*, 2000. 滚动起点评估。
- Ben Taieb, S., Bontempi, G., Atiya, A. F., Sorjamaa, A. "A review and comparison of strategies for multi-step ahead time series forecasting based on the NN5 forecasting competition." *Expert Systems with Applications*, 2012. 递归策略与直接策略的比较。
- Kim, T. et al. "Reversible instance normalization for accurate time-series forecasting against distribution shift." *ICLR*, 2022. RevIN。
- Makridakis, S., Spiliotis, E., Assimakopoulos, V. "The M4 Competition: 100,000 time series and 61 forecasting methods." *International Journal of Forecasting*, 2020; and Smyl, S. "A hybrid method of exponential smoothing and recurrent neural networks for time series forecasting." *International Journal of Forecasting*, 2020. 这场预测竞赛，以及夺冠的混合方法。
- Salinas, D., Flunkert, V., Gasthaus, J., Januschowski, T. "DeepAR: probabilistic forecasting with autoregressive recurrent networks." *International Journal of Forecasting*, 2020. 概率式循环网络预测。
- Hundman, K. et al. "Detecting spacecraft anomalies using LSTMs and nonparametric dynamic thresholding." *KDD*, 2018. 用预测残差监测遥测数据。
- Page, E. S. "Continuous inspection schemes." *Biometrika*, 1954. CUSUM 检验。
- Isermann, R. *Fault-Diagnosis Systems*. Springer, 2006. 基于模型、利用残差的故障检测。
- Keshav, S. "How to read a paper." *ACM SIGCOMM Computer Communication Review*, 2007. 三遍阅读法，论文导读中两遍阅读方案的来源。
