## 自测题 {#quiz}

共 12 道题，约 18 分钟，不看笔记：先作答，再打开解析；答错的题，回到解析中指出的小节，或回到测量过该现象的实验。

```quiz
? 对于只有一个隐藏层、激活函数为非多项式的网络，通用近似定理保证了什么？
- [x] 对紧集上的任意连续函数和任意 $\varepsilon > 0$，存在某个有限宽度，使网络在该集合上处处误差小于 $\varepsilon$。
- [ ] 只要层足够宽，从随机初始化出发的梯度下降就能达到任意目标误差。
- [ ] 所需宽度最多随输入维度线性增长。
- [ ] 在训练数据上拟合误差小于 $\varepsilon$ 的网络，在未见过的输入上误差也小于 $\varepsilon$。
> 该定理只涉及存在性。它没有说训练能否找到这些权重（第二项）；构造所需的单元数可能随输入维度呈指数增长（第三项）；而从有限数据泛化是另一个问题（[模块 01](module_01_ZH.html)，第四项）。见[第 1 节](#s1)。

? 在 $B = 32$ 的 batch 中，第 $l$ 层的输入为 $\mathbf{H}^{(l-1)} \in \mathbb{R}^{32 \times 100}$，权重为 $\mathbf{W}^{(l)} \in \mathbb{R}^{100 \times 50}$，误差信号为 $\boldsymbol{\Delta}^{(l)} \in \mathbb{R}^{32 \times 50}$。下列哪个表达式是 $\partial \mathcal{L} / \partial \mathbf{W}^{(l)}$？
- [ ] $\boldsymbol{\Delta}^{(l)\top}\mathbf{H}^{(l-1)}$，形状为 $50 \times 100$
- [ ] $\boldsymbol{\Delta}^{(l)}\mathbf{W}^{(l)\top}$，形状为 $32 \times 100$
- [x] $\mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$，形状为 $100 \times 50$
- [ ] $\mathbf{H}^{(l-1)}\mathbf{W}^{(l)}$，形状为 $32 \times 50$
> 梯度与 $\mathbf{W}^{(l)}$ 同形（$100 \times 50$），等于 batch 内外积 $\mathbf{h}\boldsymbol{\delta}^\top$ 之和，即 $\mathbf{H}^\top\boldsymbol{\Delta}$。第一项是它的转置，这正是 PyTorch 为 `nn.Linear` 存储权重的布局，但不是本模块的约定。第二项是传给上一层输出的误差，尚未经过 $\phi'$ 的门控。最后一项是不含偏置的前向预激活。见[第 3 节](#s3)。

? 一个标量损失依赖于 $n = 10^6$ 个参数。关于计算它的梯度，下列哪项说法正确？
- [ ] 前向模式需要一次遍历，反向模式需要 $10^6$ 次。
- [ ] 两种模式都需要 $10^6$ 次遍历，但反向模式的遍历更便宜。
- [x] 反向模式只需一次反向传播，代价是前向传播的几倍以内；前向模式则大约需要 $10^6$ 次遍历。
- [ ] 反向模式只需一次遍历，且除参数外不需要额外内存。
> 反向模式每次遍历计算雅可比矩阵的一行（一个向量-雅可比积），而标量损失只有一行。前向模式每次遍历计算一列，所以每个输入需要一次遍历。反向模式的代价是内存：前向的中间值必须保存或重新计算，因此最后一项不成立。见[第 4 节](#s4)。

? 在深层网络中，ReLU 取代 sigmoid 成为默认的隐藏层激活函数，靠的是哪一条性质？
- [ ] 它处处光滑，对优化器有利。
- [ ] 它的输出以零为中心。
- [ ] 它不会产生停止学习的单元。
- [x] 它在输入为正时导数恰为 1，因此在激活一侧不会缩小反向传播的误差。
> sigmoid 每经过一层，误差至多乘以 $1/4$。ReLU 在 0 处有折点（GELU 和 SiLU 才是光滑的），它的输出是非负的而不是以零为中心，而失效单元恰恰是它的失败模式。见[第 5 节](#s5)。

? 对 ReLU 层，He 初始化为什么取 $\operatorname{Var}(w) = 2/n_{\text{in}}$，是 tanh 所用 $1/n_{\text{in}}$ 的两倍？
- [ ] ReLU 输出的方差是其输入的两倍。
- [x] ReLU 把负的预激活置零，所以 $\mathbb{E}[h^2] = \operatorname{Var}(z)/2$；把权重方差加倍，才能使 $\operatorname{Var}(z)$ 在层与层之间保持不变。
- [ ] 为了平衡前向和反向传播，就像 Glorot 初始化那样。
- [ ] 因为 ReLU 的导数在激活一侧是 2。
> 输入均值为零时，$\operatorname{Var}(z_{\text{next}}) = n_{\text{in}}\sigma_w^2\,\mathbb{E}[h^2]$；对于对称的 $z$，$\mathbb{E}[\operatorname{ReLU}(z)^2] = \operatorname{Var}(z)/2$。第一项是错的：输出方差是 $0.34\operatorname{Var}(z)$，减半的是二阶矩。第三项描述的是 Glorot 的折中取值 $2/(n_{\text{in}} + n_{\text{out}})$。导数是 1，不是 2。见[第 6 节](#s6)。

? 重球动量法按 $\mathbf{v} \leftarrow \mu\mathbf{v} + \mathbf{g}$ 更新速度，$\mu = 0.9$。某个梯度分量在各步之间保持不变，另一个分量每步都变号。在稳态下，速度对它们的放大倍数大约分别是：
- [ ] $0.9$ 和 $0.9$
- [ ] $10$ 和 $10$
- [ ] $1.9$ 和 $0.1$
- [x] $10$ 和 $0.53$
> 动量是一个线性滤波器。它在零频（恒定梯度）处的增益是 $1/(1-\mu) = 10$，在交替频率处的增益是 $1/(1+\mu) = 0.526$。这就是动量既能抑制谷壁间的振荡、又能加快沿谷底前进的原因。见[第 7 节](#s7)。

? $\beta_1 = 0.9$、$\beta_2 = 0.999$ 的 Adam 在第一步不做偏差修正。与修正后的步长（每个坐标约为 $\eta$）相比，未修正的步长：
- [ ] 约小 10 倍，因为 $m_1 = 0.1g$。
- [x] 约大 3.16 倍，因为 $v_1 = 0.001g^2$ 比 $m_1 = 0.1g$ 被压低得更多。
- [ ] 相同，因为两处修正相互抵消。
- [ ] 约大 1000 倍，因为 $v_1 = 0.001g^2$。
> $m_1/\sqrt{v_1} = 0.1g/(0.0316|g|) = 3.16\,\operatorname{sign}(g)$，而修正后的比值为 1。第一项忽略了 $v$ 被压低的效应；最后一项忽略了 $m$ 和平方根。对恒定梯度，未修正与修正后的比值为 $(1-\beta_1^t)/\sqrt{1-\beta_2^t}$，它会一直增大到 $t = 12$ 附近的约 6.6，之后才回到 1。见[第 8 节](#s8)。

? 当优化器是 Adam 时，加到梯度上的 L2 正则化为什么不等同于 AdamW 的解耦权重衰减？
- [ ] 二者只差一个 $\lambda$ 的缩放，和 SGD 时完全一样。
- [ ] AdamW 只对偏置做衰减。
- [ ] L2 正则化只在评估时使用。
- [x] L2 项和梯度的其余部分一样被 $\sqrt{\hat v}$ 除，所以梯度历史大的参数衰减得更少；AdamW 则以相同的因子收缩每个参数。
> 对 SGD 二者重合，所以第一项在那里成立，在这里不成立。在 Adam 下，耦合的惩罚项按参数逐个归一化，除非所有参数的 $\hat v$ 相同，否则没有任何单一的 L2 系数能复现均匀衰减。见[第 8 节](#s8)。

? 一个带批归一化的网络在 `model.eval()` 之后做评估。测试输入用哪些统计量归一化？
- [ ] 当前测试 batch 的均值和方差。
- [x] 训练期间累积的 batch 均值和方差的滑动平均。
- [ ] 该测试输入自身各特征上的均值和方差。
- [ ] 都不用：评估模式下批归一化被关闭。
> 评估模式用滑动平均取代 batch 统计量，因此预测不依赖于同一 batch 里还有哪些样本。第一项是忘记调用 `eval()` 时发生的情况；第三项描述的是层归一化；而该层并没有被关闭，它仍然在归一化，并应用 $\gamma$ 和 $\beta$。见[第 10 节](#s10)。

? 对隐藏激活 $h$ 使用 $p = 0.25$ 的倒置随机失活（dropout）。训练和评估时分别发生什么？
- [ ] 训练：以概率 0.25 置零；评估：乘以 0.75。
- [ ] 训练：乘以 0.75；评估：以概率 0.25 置零。
- [ ] 训练：以概率 0.75 置零，否则乘以 4。
- [x] 训练：以概率 0.25 置零，否则乘以 $4/3$；评估：不变。
> 把保留下来的激活乘以 $1/(1-p) = 4/3$，使 $\mathbb{E}[\tilde h] = h$，因此评估时无需改动。第一项是原始的、非倒置的写法：期望上正确，但不是框架的实现方式。第三项把 $p$ 与保留概率弄混了。见[第 11 节](#s11)。

? 为什么训练时通常更偏好 bf16 而不是 fp16，且不需要损失缩放？
- [ ] bf16 的尾数位更多，所以更精确。
- [ ] bf16 能精确表示不超过 $10^6$ 的所有整数。
- [x] bf16 和 fp32 一样有 8 位指数，所以范围可达约 $3.4\times 10^{38}$，而 fp16 在超过 65,504 时上溢，并使很小的梯度下溢。
- [ ] fp16 不能表示负数。
> bf16 用精度换范围：它有 7 位尾数（刚好大于 1 处的间距为 $2^{-7} = 0.0078$），fp16 有 10 位；但它有 fp32 的 8 位指数，fp16 只有 5 位。这就是 fp16 训练需要损失缩放而 bf16 通常不需要的原因。bf16 是精度较低的格式，只能精确表示不超过 256 的整数。见[第 12 节](#s12)。

? 一个新的 10 类分类器开始训练时损失为 47，而不是约 2.3。最可能的原因是什么？
- [ ] 学习率太小。
- [ ] 验证集泄漏进了训练集。
- [ ] 训练时 dropout 处于开启状态。
- [x] 初始权重太大，所以 logits 很大，并且自信地给出错误预测。
> 初始化合理的网络预测的概率接近均匀，所以在迈出任何一步之前，损失就接近 $\ln 10 = 2.30$。学习率和数据泄漏都不会影响第 0 步的损失，dropout 也不可能把损失抬高二十倍。[实验 5](#lab5) 中 $\mathcal{N}(0, 1)$ 的初始化一开始的损失约为 677。见[第 14 节](#s14)。
```

## 论文导读 {#reading}

读论文要读两遍，而不是一遍。第一遍用五分钟，并不是通常意义上的阅读：你只看标题、摘要和引言、各节标题、图及其说明，以及结论。然后用一句话写下作者的主张，并判断这一主张对你是否重要。大多数论文到这里就可以放下了。第二遍就是下面各篇所标注的时间估计所对应的那一遍。你带着笔，读导读中指明的部分，并亲手做那些论文要求你"想当然接受"的工作：复现一个推导，核对表格中的一个数字与正文所述是否一致，记下论证所需的每一个假设。阅读问题是浓缩版的第二遍。读论文之前先读这些问题，这样论文就会在你读的过程中逐一作答。第三遍是重新实现该方法，本模块的实验对反向传播、动量法和 Adam 已经做过了。关于这一习惯的更多内容，见 Keshav 的 "How to read a paper"（在参考文献中）。

这三篇论文覆盖了本模块的主线：反向传播的原始表述，让初始化成为可以计算的问题的分析，以及把 Adam 变成今天所用优化器的修正。三篇合计 50 分钟。页码和节号只在版式稳定处给出；期刊版、会议版和 arXiv 版之间的论文会有差异，如果你手上的版本对不上，请以标题为准，而不是页码。

::: paper minutes=15
Rumelhart, D. E., Hinton, G. E., Williams, R. J. "Learning representations by back-propagating errors." *Nature* 323, 533–536, 1986.

**为什么读它。** 正是这篇四页的短文，让反向传播成为训练网络的方式。它很短，其中的方程就是[第 3 节](#s3)的方程，只是记号不同；它还已经包含了动量、随机初始化的对称性破缺论证，以及学到的内部特征。

**读哪些部分。** 全文都读。文末关于把循环网络按时间展开成分层网络的那一段可以略读，[模块 04](module_04_ZH.html) 会专门讲。

**阅读时要回答的问题。**

1. 把论文的记号对应到本模块的记号。它的 $x_j$、$y_j$、$E$、$\partial E/\partial y_j$ 和 $\partial E/\partial x_j$ 分别是什么？它的哪个方程是[第 3 节](#s3)中层与层之间的方程？（它的权重 $w_{ji}$ 从单元 $i$ 指向单元 $j$，与本模块的布局互为转置。）
2. 论文的加速方法是 $\Delta w(t) = -\varepsilon\,\partial E/\partial w(t) + \alpha\,\Delta w(t-1)$。证明它就是重球动量法，并说明 $\varepsilon$ 和 $\alpha$ 与本模块的 $\eta$ 和 $\mu$ 是什么关系。
3. 作者为什么从小的随机权重开始？本模块的哪一节给出了同样的论证？
4. 在家谱任务中，隐藏单元最终编码了什么？为什么这是[第 1 节](#s1)所讲的学到特征的一个实例？
5. 论文使用了哪种误差度量和输出非线性？对于分类输出，[模块 01](module_01_ZH.html) 会推荐什么来代替？

**读完之后。** 不看原文，用本模块的记号在一页纸上写出论文的三步算法（前向传播、反向传播、权重更新）。然后与[实验 1](#lab1) 的 NumPy 循环对照：论文没有涉及的一切，例如激活函数的选择、初始化尺度、损失和优化器，正是本模块其余部分要讲的内容。
:::

::: paper minutes=20
Glorot, X., Bengio, Y. "Understanding the difficulty of training deep feedforward neural networks." *Proceedings of the 13th International Conference on Artificial Intelligence and Statistics (AISTATS)*, 2010.

**为什么读它。** 这是 Xavier 初始化背后的实验性论文。它逐层展示了在深层 sigmoid 和 tanh 网络中激活如何饱和、梯度如何缩小，并推导出[第 6 节](#s6)所用的 $2/(n_{\text{in}} + n_{\text{out}})$ 方差。如果在[第 10 节](#s10)之后再读，你还会看到，归一化层后来不仅在初始化时、而且在训练过程中也解决了这个问题。

**读哪些部分。** 读第 1 节、第 3 节中使用 sigmoid 和 tanh 单元的实验，以及第 4 节关于初始化时梯度的内容，包括归一化初始化的理论推导，以及激活和反向传播梯度的直方图。略读第 2 节（数据集和实验设置）和 softsign 实验。读第 5 节的结论。

**阅读时要回答的问题。**

1. 推导假设单元在初始化时处于线性区。写出它得到的、关于 $\operatorname{Var}(W)$ 的前向条件和反向条件，并说明为什么除非 $n_{\text{in}} = n_{\text{out}}$，两者不能同时成立。
2. 证明均匀分布范围 $\pm\sqrt{6}/\sqrt{n_{\text{in}} + n_{\text{out}}}$ 给出 $\operatorname{Var}(W) = 2/(n_{\text{in}} + n_{\text{out}})$。
3. 在训练早期，sigmoid 网络最顶层的隐藏层会发生什么？作者如何解释？把你的回答与[第 5 节](#s5)关于零中心化的论证联系起来。
4. 作者发现哪种代价函数训练得更好？这与[模块 01](module_01_ZH.html) 关于交叉熵与平方误差的论证如何吻合？
5. 这篇论文早于 ReLU 的广泛使用。对于 ReLU 单元（He 等，2015），它的推导要改变什么？为什么批归一化（2015）使确切的初始尺度变得不那么重要？

**读完之后。** 用几行 NumPy 复现论文的一张直方图：一个 5 层、宽度 100 的 tanh 网络，输入为标准正态分布，权重依次取自论文的"标准"初始化 $U(-1/\sqrt{n_{\text{in}}}, 1/\sqrt{n_{\text{in}}})$（方差 $1/(3n_{\text{in}})$）、它的归一化初始化（方差 $2/(n_{\text{in}} + n_{\text{out}})$），以及方差为 1 的初始化。把各层激活的分布范围逐层与论文的图对比，并与[第 6 节](#s6)的预测对比。
:::

::: paper minutes=15
Loshchilov, I., Hutter, F. "Decoupled weight decay regularization." *International Conference on Learning Representations (ICLR)*, 2019.

**为什么读它。** 这是 AdamW 背后的论文，而在现代实践中，"Adam"指的就是 AdamW。它表明，L2 正则化与权重衰减对 SGD 是等价的，但对自适应方法并不等价；而把二者解耦之后，最佳的权重衰减几乎与学习率无关。

**读哪些部分。** 读第 1 节、第 2 节（命题和算法 2，其中解耦项被高亮标出），以及第 4 节中的实验：它在学习率和权重衰减的网格上，为 Adam 和 AdamW 绘制最终测试误差。跳过第 3 节（贝叶斯滤波的论证）和热重启（AdamWR）实验。

**阅读时要回答的问题。**

1. 用本模块的记号重述命题 1：L2 系数取什么值，才能使带 L2 正则化的 SGD 与带权重衰减的 SGD 完全相同？
2. 借助[第 8 节](#s8)的推导，用一句话解释命题 2：为什么在 Adam 下，没有任何 L2 系数能复现解耦的权重衰减？
3. 比较 Adam 和 AdamW 在"学习率 × 权重衰减"热力图中良好区域的形状。为什么 AdamW 的形状使超参数搜索更便宜？
4. 在 PyTorch 中，`torch.optim.Adam(weight_decay=λ)` 和 `torch.optim.AdamW(weight_decay=λ)` 哪一个实现了论文中带解耦项的算法 2？

**读完之后。** 把论文的衰减项与[实验 3](#lab3) 的代码对照。注意论文与 PyTorch 在形式上有一处不同：论文把衰减系数 $\lambda$ 只乘以调度乘子 $\eta_t$，而 PyTorch 把 `weight_decay` 乘以当前学习率，即基础学习率 $\alpha$ 乘以 $\eta_t$。算出哪个 `weight_decay` 能复现论文的 $\lambda$，并验证在余弦调度下，两种衰减都随调度而缩小。
:::

## 小结 {#summary}

- 多层感知机交替使用仿射映射 $\mathbf{Z} = \mathbf{H}\mathbf{W} + \mathbf{1}\mathbf{b}^\top$ 和非线性，并自己学习特征；没有非线性，整个堆叠就会塌缩成一个线性映射。数字识别网络 64 → 128 → 128 → 10 有 26,122 个参数，前向传播中每个权重对每个样本花费两次浮点运算（FLOPs）。
- 通用近似定理是一个存在性结果：一个足够宽的隐藏层可以逼近紧集上的任意连续函数，但它没有说训练能否找到这些权重、该层需要多宽，也没有说拟合能否泛化。深度换来的是表示效率，因为线性片段的数量可以随层数呈指数增长。
- 反向传播是经过组织的链式法则，使每一层的误差信号只计算一次：softmax 加交叉熵时 $\boldsymbol{\delta}^{(L)} = \hat{\mathbf{p}} - \mathbf{y}$，向下传播时 $\boldsymbol{\delta}^{(l)} = (\mathbf{W}^{(l+1)}\boldsymbol{\delta}^{(l+1)}) \odot \phi'(\mathbf{z}^{(l)})$，对一个 batch 则有 $\partial \mathcal{L}/\partial\mathbf{W}^{(l)} = \mathbf{H}^{(l-1)\top}\boldsymbol{\Delta}^{(l)}$。它就是反向模式的自动微分：一次反向传播得到整个梯度，代价至多约为前向传播的两倍（数字识别网络为 1.68 倍），代价是要保存前向的中间值；而前向模式对每个参数都需要一次遍历，因此适合输入很少的函数。
- ReLU 在激活一侧传递的梯度恰好为 1，而 sigmoid 每层至多把梯度缩小到 $1/4$，这就是 ReLU 取代它的原因；ReLU 的失败模式是失效单元，GELU 和 SiLU 是现代 Transformer 所用的光滑变体。
- 初始化要使激活和梯度的二阶矩在各层之间保持不变：ReLU 取 $\operatorname{Var}(w) = 2/n_{\text{in}}$（He），原点附近的 tanh 取 $1/n_{\text{in}}$，而 $2/(n_{\text{in}} + n_{\text{out}})$ 是 Glorot 的折中。ReLU 使二阶矩减半，其输出方差是输入方差的 $0.34$。初始损失远离 $\ln K$，例如十分类时是 677 而不是 2.30，说明在迈出任何一步之前，尺度就已经错了。
- 在二次函数上，梯度下降在 $\eta < 2/\lambda_{\max}$ 时稳定，收敛速率由条件数 $\kappa$ 决定；重球动量法是一个低通滤波器，对恒定梯度的增益为 $1/(1-\mu)$，对交替梯度的增益为 $1/(1+\mu)$，因此既抑制沟壑两壁间的振荡，又加快沿沟壑方向的前进。
- Adam 用梯度的动量平均除以其平方的滑动平均的平方根，使每个参数的步长约为 $\eta$；不做偏差修正时，在 $\beta_1 = 0.9$、$\beta_2 = 0.999$ 下，它的第一步大约偏大 3.16 倍。AdamW 把权重衰减直接作用在权重上，因为加进 Adam 梯度的 L2 项会被 $\sqrt{\hat v}$ 除，从而使各参数的衰减不均匀。
- 学习率范围测试几分钟就能找到峰值学习率；预热保护自适应方法免受其不稳定的最初几步的影响；衰减消除恒定学习率在最小值附近留下的噪声下限；全局范数梯度裁剪则防止单个坏 batch 破坏优化器的状态。
- 批归一化在训练时使用 batch 统计量，在评估时使用滑动平均，所以忘记调用 `model.eval()` 会改变结果；层归一化和均方根归一化（RMSNorm）只对每个样本自己的特征做归一化，是 Transformer 所用的方式，其中 RMSNorm 不减均值。
- 概率为 $p$ 的 dropout 把激活置零，并把保留下来的激活乘以 $1/(1-p)$，使评估时无需改动；权重衰减、早停、数据增强和标签平滑各自以不同的方式约束模型，不可互相替代。
- 交叉熵必须用 log-sum-exp 恒等式从 logits 计算，绝不能写成 softmax 的对数；fp16 在超过 65,504 时上溢，需要损失缩放来防止小梯度下溢，而 bf16 保留 fp32 约 $3.4\times10^{38}$ 的范围，代价是精度。
- 训练中的问题要靠诊断，而不是靠猜：对照 $\ln K$ 检查初始损失，在一个小 batch 上过拟合，比较解析梯度与数值梯度，并把损失、梯度范数和学习率画在一起。

[模块 03](module_03_ZH.html) 保留本模块的一切，只改变一点：把全连接的第一层换成卷积，它在图像的所有位置上共享同一小组权重。训练循环、初始化、优化器、归一化和调试清单都原样沿用，而 ResNet 的残差连接就是模块 03 让很深的网络保持可训练的办法。模块 04 和 06 随后再次改变结构，分别换成循环和注意力，而在这两者中，训练能否成功仍由同样四件事决定：初始化的尺度、优化器、归一化，以及数值格式。

## 参考文献 {#refs}

- Rumelhart, D. E., Hinton, G. E., Williams, R. J. "Learning representations by back-propagating errors." *Nature*, 1986. 多层网络的反向传播，并包含动量和随机初始化。
- Cybenko, G. "Approximation by superpositions of a sigmoidal function." *Mathematics of Control, Signals and Systems*, 1989. 以 sigmoid 为激活的通用近似。
- Hornik, K. "Approximation capabilities of multilayer feedforward networks." *Neural Networks*, 1991. 一般激活函数下的通用近似。
- Leshno, M., Lin, V. Ya., Pinkus, A., Schocken, S. "Multilayer feedforward networks with a nonpolynomial activation function can approximate any function." *Neural Networks*, 1993. 任何非多项式激活函数都足够。
- Montúfar, G., Pascanu, R., Cho, K., Bengio, Y. "On the number of linear regions of deep neural networks." *NeurIPS*, 2014. 线性区域随深度呈指数增长。
- Telgarsky, M. "Benefits of depth in neural networks." *COLT*, 2016. [第 1 节](#s1)中的锯齿形深度分离论证。
- Baydin, A. G., Pearlmutter, B. A., Radul, A. A., Siskind, J. M. "Automatic differentiation in machine learning: a survey." *JMLR*, 2018. 前向与反向模式；[第 4 节](#s4)的算例出自此处。
- Griewank, A., Walther, A. *Evaluating Derivatives: Principles and Techniques of Algorithmic Differentiation*, 2nd ed. SIAM, 2008. 自动微分及其代价的权威参考。
- Chen, T., Xu, B., Zhang, C., Guestrin, C. "Training deep nets with sublinear memory cost." *arXiv*, 2016. 梯度检查点。
- LeCun, Y., Bottou, L., Orr, G. B., Müller, K.-R. "Efficient BackProp." In *Neural Networks: Tricks of the Trade*, Springer, 1998. 输入标准化，以及 tanh 的 $1/n_{\text{in}}$ 初始化。
- Glorot, X., Bengio, Y. "Understanding the difficulty of training deep feedforward neural networks." *AISTATS*, 2010. Xavier 初始化。
- He, K., Zhang, X., Ren, S., Sun, J. "Delving deep into rectifiers: surpassing human-level performance on ImageNet classification." *ICCV*, 2015. He 初始化。
- Maas, A. L., Hannun, A. Y., Ng, A. Y. "Rectifier nonlinearities improve neural network acoustic models." *ICML Workshop on Deep Learning for Audio, Speech and Language Processing*, 2013. Leaky ReLU。
- Hendrycks, D., Gimpel, K. "Gaussian error linear units (GELUs)." *arXiv*, 2016. GELU。
- Elfwing, S., Uchibe, E., Doya, K. "Sigmoid-weighted linear units for neural network function approximation in reinforcement learning." *Neural Networks*, 2018. SiLU。
- Ramachandran, P., Zoph, B., Le, Q. V. "Searching for activation functions." *arXiv*, 2017. Swish，与 SiLU 是同一个函数。
- Polyak, B. T. "Some methods of speeding up the convergence of iteration methods." *USSR Computational Mathematics and Mathematical Physics*, 1964. 重球动量法。
- Nesterov, Y. "A method of solving a convex programming problem with convergence rate $O(1/k^2)$." *Soviet Mathematics Doklady*, 1983. Nesterov 动量。
- Sutskever, I., Martens, J., Dahl, G., Hinton, G. "On the importance of initialization and momentum in deep learning." *ICML*, 2013. 深度网络中的动量与 Nesterov 动量。
- Duchi, J., Hazan, E., Singer, Y. "Adaptive subgradient methods for online learning and stochastic optimization." *JMLR*, 2011. AdaGrad。
- Tieleman, T., Hinton, G. "Lecture 6.5 — RMSProp." *Coursera: Neural Networks for Machine Learning*, 2012. RMSProp，仅以课程幻灯片的形式发表。
- Kingma, D. P., Ba, J. "Adam: a method for stochastic optimization." *ICLR*, 2015. Adam。
- Reddi, S. J., Kale, S., Kumar, S. "On the convergence of Adam and beyond." *ICLR*, 2018. Adam 原始收敛性证明中的缺陷。
- Loshchilov, I., Hutter, F. "SGDR: stochastic gradient descent with warm restarts." *ICLR*, 2017. 余弦学习率调度。
- Loshchilov, I., Hutter, F. "Decoupled weight decay regularization." *ICLR*, 2019. AdamW。
- Smith, L. N. "Cyclical learning rates for training neural networks." *WACV*, 2017. 学习率范围测试。
- Goyal, P. et al. "Accurate, large minibatch SGD: training ImageNet in 1 hour." *arXiv*, 2017. 学习率随 batch 大小线性缩放，以及渐进式预热。
- Liu, L. et al. "On the variance of the adaptive learning rate and beyond." *ICLR*, 2020. 自适应方法为什么需要预热。
- Pascanu, R., Mikolov, T., Bengio, Y. "On the difficulty of training recurrent neural networks." *ICML*, 2013. 梯度范数裁剪。
- Cohen, J. M., Kaur, S., Li, Y., Kolter, J. Z., Talwalkar, A. "Gradient descent on neural networks typically occurs at the edge of stability." *ICLR*, 2021. 锐度上升到 $2/\eta$。
- Ioffe, S., Szegedy, C. "Batch normalization: accelerating deep network training by reducing internal covariate shift." *ICML*, 2015. 批归一化。
- Santurkar, S., Tsipras, D., Ilyas, A., Madry, A. "How does batch normalization help optimization?" *NeurIPS*, 2018. 平滑性解释。
- Ba, J. L., Kiros, J. R., Hinton, G. E. "Layer normalization." *arXiv*, 2016. 层归一化。
- Zhang, B., Sennrich, R. "Root mean square layer normalization." *NeurIPS*, 2019. RMSNorm。
- Wu, Y., He, K. "Group normalization." *ECCV*, 2018. 适用于小 batch 的归一化。
- Srivastava, N., Hinton, G., Krizhevsky, A., Sutskever, I., Salakhutdinov, R. "Dropout: a simple way to prevent neural networks from overfitting." *JMLR*, 2014. Dropout。
- Hinton, G. E., Srivastava, N., Krizhevsky, A., Sutskever, I., Salakhutdinov, R. R. "Improving neural networks by preventing co-adaptation of feature detectors." *arXiv*, 2012. dropout 的最早描述，以及几何平均论证。
- Gal, Y., Ghahramani, Z. "Dropout as a Bayesian approximation: representing model uncertainty in deep learning." *ICML*, 2016. 蒙特卡洛 dropout。
- Szegedy, C., Vanhoucke, V., Ioffe, S., Shlens, J., Wojna, Z. "Rethinking the Inception architecture for computer vision." *CVPR*, 2016. 标签平滑。
- Müller, R., Kornblith, S., Hinton, G. "When does label smoothing help?" *NeurIPS*, 2019. 标签平滑对校准和蒸馏的影响。
- Guo, C., Pleiss, G., Sun, Y., Weinberger, K. Q. "On calibration of modern neural networks." *ICML*, 2017. 现代网络的过度自信与温度缩放。
- Bishop, C. M. "Training with noise is equivalent to Tikhonov regularization." *Neural Computation*, 1995. 输入噪声作为正则项。
- Micikevicius, P. et al. "Mixed precision training." *ICLR*, 2018. 带损失缩放的 fp16 训练。
- Goodfellow, I., Bengio, Y., Courville, A. *Deep Learning*. MIT Press, 2016. 第 6–8 章；第 7.8 节讲早停等价于 L2 正则化。
- Karpathy, A. *micrograd* (open-source software), 2020. [实验 2](#lab2) 所遵循设计的标量自动微分引擎。
- Keshav, S. "How to read a paper." *ACM SIGCOMM Computer Communication Review*, 2007. 论文导读所改编的三遍阅读法。
