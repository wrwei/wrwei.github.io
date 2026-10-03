## 自测题 {#quiz}

共 12 道题，每题只有一个正确答案，总计约十五到二十分钟。先作答，再打开解析；凡是答错的题，请重读解析中指明的那一节。

```quiz
? 关于 KL 散度 $D_{\KL}(q \,\|\, p)$，下列哪个说法正确？
- [ ] 它是对称的：$D_{\KL}(q \,\|\, p) = D_{\KL}(p \,\|\, q)$。
- [ ] 它满足三角不等式，因此是一种距离。
- [ ] 它的上界是 $\log 2$。
- [x] 它非负，且仅当 $q = p$ 时为零。
> 由詹森不等式得 $D_{\KL} \ge 0$，当且仅当 $q = p$ 时取等号。它不是对称的（[第 1 节](#s1)的例子在一个方向上是 1.153 奈特，在另一个方向上是 0.597 奈特），也不是度量。以 $\log 2$ 为上界的是 Jensen-Shannon 散度，而不是 KL 散度。

? 在 VAE 中，$\log p_\theta(\mathbf{x}) - \text{ELBO}$ 等于：
- [ ] 重构误差
- [ ] $D_{\KL}\big(q_\phi(\mathbf{z}\mid\mathbf{x}) \,\|\, p(\mathbf{z})\big)$
- [x] $D_{\KL}\big(q_\phi(\mathbf{z}\mid\mathbf{x}) \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x})\big)$
- [ ] 只要解码器是高斯的，就为零
> 恒等式 $\log p_\theta(\mathbf{x}) = \text{ELBO} + D_{\KL}\big(q_\phi \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x})\big)$ 表明，这个差值就是到真实后验的 KL 散度。到先验的 KL 散度是 ELBO 内部的一项，而不是这个差值；重构项是 ELBO 的另一项；而无论解码器属于哪一族，只有当 $q_\phi$ 等于真实后验时，差值才为零。

? VAE 为什么需要重参数化技巧？
- [x] 因为抽样 $\mathbf{z} \sim \mathcal{N}(\boldsymbol\mu, \boldsymbol\sigma^2)$ 不是 $\boldsymbol\mu$ 和 $\boldsymbol\sigma$ 的可微函数；写成 $\mathbf{z} = \boldsymbol\mu + \boldsymbol\sigma \odot \boldsymbol\epsilon$ 并把 $\boldsymbol\epsilon$ 当作输入，它就成了可微函数。
- [ ] 因为两个高斯分布之间的 KL 散度没有闭式解。
- [ ] 因为解码器不能接受随机输入。
- [ ] 为了迫使近似后验等于先验。
> 梯度必须从重构项出发，经过样本流回编码器，而一次单纯的随机抽样会把梯度挡住；这个技巧把随机性移到了 $\boldsymbol\epsilon$ 中。高斯分布的 KL 散度确实有闭式解；解码器在采样时本来就接受随机输入；而把后验压到先验上，正是称为后验坍塌的失败，并不是这个技巧的目的。

? 为什么用非饱和的生成器损失 $-\log D(G(\mathbf{z}))$，而不用 $\log\big(1 - D(G(\mathbf{z}))\big)$？
- [ ] 它有不同的最优点，从而能防止模式坍塌。
- [ ] 它让判别器训练得更快。
- [ ] 它把 Jensen-Shannon 散度变成了 Wasserstein 距离。
- [x] 训练初期 $D(G(\mathbf{z}))$ 接近 0，此时 $\log(1-D)$ 对 $D$ 的 logit 几乎没有梯度，而 $-\log D$ 的梯度接近 $-1$。
> 设 $D = \sigma(a)$，$a$ 为 logit，则 $\partial_a \log(1-D) = -D$，$\partial_a(-\log D) = -(1-D)$。当 $D(G(\mathbf{z})) = 0.01$ 时，二者分别为 $-0.01$ 和 $-0.99$。两种损失有相同的不动点 $p_g = p_{\text{data}}$，所以这一改动影响的是训练动态，而不是最优点。它不能防止模式坍塌，不改变被最小化的散度，而且它关系到的是生成器的更新，而不是判别器的更新。

? 在 DDPM 训练中，对随机抽取的 $t$，带噪输入 $\mathbf{x}_t$ 是如何得到的？
- [ ] 必须从 $\mathbf{x}_0$ 出发依次执行 $t$ 个加噪步骤来计算。
- [x] 一步得到：$\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon$。
- [ ] $\mathbf{x}_t = \mathbf{x}_0 + \beta_t\,\boldsymbol\epsilon$。
- [ ] $\mathbf{x}_t = (1-\bar\alpha_t)\,\mathbf{x}_0 + \bar\alpha_t\,\boldsymbol\epsilon$。
> 高斯步骤的复合仍是高斯的，所以一次抽样就能精确得到 $\mathbf{x}_t$，无需逐步执行；这正是训练代价低的原因。$\beta_t$ 是单步的方差，不是累积的尺度。最后一个公式把信号和噪声对调了，并且用线性权重代替了平方根权重，所以它的方差是错的。

? 对于无分类器引导 $\tilde{\boldsymbol\epsilon} = \boldsymbol\epsilon_\theta(\mathbf{x}_t, \varnothing) + w\,\big[\boldsymbol\epsilon_\theta(\mathbf{x}_t, c) - \boldsymbol\epsilon_\theta(\mathbf{x}_t, \varnothing)\big]$，哪个说法正确？
- [ ] $w = 0$ 给出条件模型。
- [ ] 引导需要一个单独训练的、针对带噪图像的分类器。
- [x] $w = 1$ 给出条件模型；$w > 1$ 以多样性为代价提高对 $c$ 的忠实度。
- [ ] 引导使每一步的网络计算次数减半。
> $w = 0$ 是无条件模型，$w = 1$ 是条件模型；大于 1 时，预测从无条件预测出发，朝 $c$ 的方向外推。在[实验 2](#lab2) 中，随着样本挤到一起，类似召回率的距离从 $w = 1$ 时的 0.021 增大到 $w = 7$ 时的 0.043。无分类器引导不需要分类器，这正是它的意义所在；它使每一步的计算次数加倍，一次有条件，一次无条件。

? 在带自环的 GCN 中，对于一个有 3 个邻居的节点与一个有 1 个邻居的节点之间的边，$\hat{A}_{ij}$ 是多少？
- [x] $1/\sqrt{4 \times 2} = 0.354$
- [ ] $1/\sqrt{3 \times 1} = 0.577$
- [ ] $1/4 = 0.25$
- [ ] $1$
> 自环使每个度加 1，得到 $\tilde d_i = 4$ 和 $\tilde d_j = 2$，于是 $\hat{A}_{ij} = 1/\sqrt{\tilde d_i \tilde d_j} = 1/\sqrt 8 = 0.354$。0.577 忘了自环；0.25 是从枢纽节点看过去的随机游走权重；1 是未归一化的邻接矩阵元素。

? 对一个连通图的节点特征反复作用 $\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}(\mathbf{A}+\mathbf{I})\tilde{\mathbf{D}}^{-1/2}$，特征会收敛到：
- [ ] 零
- [ ] 原始特征
- [x] 所有节点共同的一个方向，按 $\sqrt{\tilde d_i}$ 缩放
- [ ] 表示各节点所属社区的独热向量
> $\hat{\mathbf{A}}$ 有特征值 1，对应特征向量 $\tilde{\mathbf{D}}^{1/2}\mathbf{1}$，其余特征值的模都小于 1，所以 $\hat{\mathbf{A}}^k\mathbf{X}$ 趋于 $\mathbf{u}\mathbf{u}^\top\mathbf{X}$，其中 $\mathbf{u}$ 是归一化的特征向量：每一行都变成同一个向量，按 $\sqrt{\tilde d_i}$ 缩放。特征不会趋于零，因为主特征值恰好是 1；原始特征会丢失；社区结构被抹平，而不是变得更清晰。

? 求解 $u'' + \omega_0^2 u = 0$、$u(0) = 1$、$u'(0) = 0$ 的 PINN 收敛到了 $u \equiv 0$。最可能的原因是：
- [ ] 配点太多
- [x] 初始条件项相对于残差项太弱，而 $u \equiv 0$ 恰好满足方程
- [ ] $\tanh$ 激活函数
- [ ] 学习率太小
> 对齐次方程，零解的残差为零；只有条件项能排除它，所以如果残差损失占主导，缩小输出就是降低总损失最快的办法（[实验 4](#lab4)：开始时残差损失为 52.5，条件项为 1.36，均为有量纲单位）。更多的配点和 $\tanh$ 都是标准选择；学习率太小会减慢训练，但不会使模型选中平凡解。

? 一个 DeepONet 在某一族边界条件的求解器运行结果上训练，然后被用于远离这一族的边界条件。你应该预期什么？
- [x] 精度未知：代理模型只在它的训练分布上经过验证，所以要用求解器核对。
- [ ] 精度相同，因为学到的算子适用于所有输入函数。
- [ ] 结果精确，因为主干网络是一组基。
- [ ] 形状错误，因为分支网络会拒绝新的输入。
> 算子学习近似的是训练分布上的映射；在分布之外，误差无法量化。主干网络的基是从同样的数据中学到的，输入形状（$m$ 个传感器值）也没有变，所以网络会毫无报错地运行，并返回一个自信却未经验证的答案。

? 用 InfoNCE 在 $N = 256$ 个候选上训练，互信息的下界 $\log N - \mathcal{L}$ 最多能确认大约多少？
- [ ] 2.4 奈特
- [x] 5.55 奈特
- [ ] 256 奈特
- [ ] 无上界
> 损失至少为 0，所以 $\log N - \mathcal{L} \le \log 256 = 5.545$ 奈特；要确认更多信息，就需要更多候选。2.4 是一个典型的损失值，不是界；256 则把 $N$ 和 $\log N$ 混淆了。

? 一个混合专家层有 8 个专家，把每个 token 路由到得分最高的 2 个专家。与一个大小等于单个专家的稠密 FFN 相比，它有：
- [ ] 2 倍的参数和 8 倍的计算量
- [ ] 8 倍的参数和 8 倍的计算量
- [ ] 相同的参数和四分之一的计算量
- [x] 8 倍的参数，每个 token 约 2 倍的计算量
> 8 个专家都要存储，但对任何一个 token 只运行其中 2 个，外加一个开销可以忽略的路由器。参数与计算量的这种分离正是这一设计的意义所在（Mixtral 8x7B：总参数约 47B，每个 token 激活约 13B）。
```

## 论文导读 {#reading}

读论文要读两遍，第一遍应当简短。

**第一遍，约占四分之一的时间。** 读标题、摘要、引言和结论，看每一张图和表及其说明，并浏览各节标题。然后不回看原文，写下作者主张了什么、和什么做了比较，以及什么能说服你。如果主张已经清楚，而这篇论文又不是你工作的核心，可以就此停下。

**第二遍，其余的时间。** 带着笔读下面指明的各节。做它们指向的推导：找到定义方法的那个公式，核对一行代数，并找出论文的符号与本模块所用符号的对应关系。在实验部分，找出基线，并问：它强不强，比较是否公平（相同的数据、相同的算力、同样用心地调参），方法在哪里失效；作者讨论局限性的那一段往往是信息量最大的一页。除非某个问题把你引向那里，否则跳过证明和附录。论文不是按顺序读的，下面的时间估计也假定你不会逐行读完。

下面每篇论文都给出了阅读理由、要读和要跳过的部分，以及答案可以在正文中找到的问题。不要凭记忆引用论文中的数字：找到它们本身就是练习的一部分。

::: paper minutes=20
Ho, J., Jain, A., Abbeel, P. "Denoising diffusion probabilistic models." *Advances in Neural Information Processing Systems (NeurIPS)*, 2020.

**为什么读它。** 正是这篇论文让扩散模型变得实用：它把变分界与去噪分数匹配联系起来，并表明一个简化的噪声预测损失能给出最好的样本。[第 5 节](#s5)、[第 6 节](#s6)和[实验 2](#lab2) 紧跟这篇论文，所以你读它的时候，代数已经推过一遍了。

**读哪些部分。** 读背景一节（前向过程、变分界，以及 $q(\mathbf{x}_t \mid \mathbf{x}_0)$ 的闭式解）；读把扩散模型与去噪自编码器联系起来的那一节，尤其是反向过程的参数化和简化的训练目标；读算法 1 和算法 2；读实验中比较不同参数化和目标的消融表。略读样本质量的结果。跳过渐进编码、插值和附录，但如果你想看完整的代数，可以读附录中变分界的推导。

**阅读时要回答的问题。**

1. 找出 $q(\mathbf{x}_t \mid \mathbf{x}_0)$ 的公式。论文中的哪个符号对应本模块的 $\bar\alpha_t$？
2. 在他们最好的模型中，网络预测的是什么？如果改为预测均值 $\tilde{\boldsymbol\mu}$，分别用真实的变分界和简化目标训练，消融表显示了什么？
3. 他们用的 $T$ 和 $\beta$ 调度是什么？据此计算 $\bar\alpha_T$，并与[第 5 节](#s5)引用的值比较。
4. 把算法 1 和算法 2 逐行对应到[实验 2](#lab2) 的训练循环和采样器。二者在哪里不同？
5. 按作者的说法，简化目标为什么能提高样本质量？把他们的论证与[第 5 节](#s5)算出的权重（$t = 1$ 时为 0.50，$t = 100$ 时约为 0.01）联系起来。

**读完之后。** 你应当能用两句话说明：为什么预测噪声等价于预测反向步骤的均值，以及为什么去掉变分界中的权重是用似然换取样本质量。如果说不出来，就对照权重表重做问题 5。
:::

::: paper minutes=12
Kipf, T. N., Welling, M. "Semi-supervised classification with graph convolutional networks." *International Conference on Learning Representations (ICLR)*, 2017.

**为什么读它。** 它简短而清晰。它通过两步近似从谱图卷积推导出 GCN 层，并展示了它在极少标签下的效果；它的深度实验预示了[第 8 节](#s8)的过平滑。

**读哪些部分。** 读关于图上快速近似卷积的一节（一阶近似和重归一化技巧）；读用于半监督节点分类的两层模型及其前向模型公式；读结果中对传播模型的比较；读关于模型深度的附录。初读时，如果你对图拉普拉斯矩阵还不熟悉，可以跳过谱方法的细节，也跳过相关工作和数据集统计。

**阅读时要回答的问题。**

1. 什么是“重归一化技巧”？它解决了哪个数值问题？
2. 写出他们的两层前向模型，并在[实验 3](#lab3) 的代码中找出每个因子。
3. 在他们的比较中，哪个传播模型胜出？比不带重归一化的一阶模型好多少？
4. 在附录的实验中，随着深度增加，训练准确率和测试准确率在有残差连接和无残差连接时分别怎样变化？与[实验 3](#lab3) 中 8、12 和 16 层的结果比较。

**读完之后。** 为你自己设计的一个五节点图重写传播规则，并像[第 7 节](#s7)那样手算一层。如果算出的结果再现了论文公式中的结构，你就读懂了这篇论文。
:::

::: paper minutes=13
Raissi, M., Perdikaris, P., Karniadakis, G. E. "Physics-informed neural networks: a deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations." *Journal of Computational Physics*, 378, 2019.

**为什么读它。** 正是这篇论文为这种方法命名并确立了它的范式：用自动微分计算残差、配点，以及带可训练系数的反问题。在[实验 4](#lab4) 之后读它，你就能用自己复现过的失败模式来评判它的论断。

**读哪些部分。** 读引言；问题设定；偏微分方程的连续时间数据驱动求解，及其 Burgers 方程的例子；以及连续时间数据驱动发现问题的设定，及其 Navier–Stokes 例子。跳过离散时间的 Runge–Kutta 模型和 Korteweg–de Vries 例子。

**阅读时要回答的问题。**

1. Burgers 例子用了多少个初始和边界训练点、多少个配点？作者报告的误差是多少？
2. 写出他们对 Burgers 方程的残差 $f$，并把它对应到[实验 4](#lab4) 的残差函数。
3. 在发现问题中，学习的是哪些系数？用了多少数据、多大的噪声？系数恢复得有多准？
4. 关于精度或代价的哪些论断，你会在依赖它们之前先用经典求解器核对？怎样核对？借助[第 9 节](#s9)以及 McGreivy 和 Hakim（2024）来判断。

**读完之后。** 写下在你自己的问题上信任 PINN 之前你会运行的基线，以及 PINN 必须超过的那个数字。
:::

## 小结 {#summary}

- **KL 散度**非负，仅当两个分布相等时为零，且不对称；对高斯分布它有闭式解，例子 $\mathcal{N}(0,1)$ 对 $\mathcal{N}(1, 0.5)$ 在一个方向上为 1.153 奈特，在另一个方向上为 0.597 奈特。
- **线性自编码器**恢复的是 PCA 子空间，所以只有当非线性自编码器胜过 PCA 基线时，它才值得付出代价；自编码器异常检测器的阈值取自留出的正常数据。
- **VAE** 最大化 ELBO，而 ELBO 等于 $\log p_\theta(\mathbf{x})$ 减去 $q_\phi(\mathbf{z}\mid\mathbf{x})$ 到真实后验的 KL 散度；**重参数化技巧** $\mathbf{z} = \boldsymbol\mu + \boldsymbol\sigma\odot\boldsymbol\epsilon$ 让梯度能到达编码器，而每一维的 KL 接近零是后验坍塌的信号。
- 判别器最优时，**GAN** 最小化 $p_g$ 与数据之间的 Jensen-Shannon 散度；非饱和的生成器损失解决了梯度消失，但解决不了模式坍塌；截至 2026 年，在大多数图像生成任务中，扩散模型已经取代了 GAN。
- **扩散模型**用一个固定的高斯过程给数据加噪，其边缘分布为 $\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol\epsilon$，并通过回归噪声来训练；简化损失对变分界重新加权，使其偏向更难、噪声更大的步骤。
- 扩散模型的**采样**需要多次网络计算；DDIM、蒸馏和一致性模型能减少次数，尺度为 $w$ 的**无分类器引导**以每步两倍的计算量用多样性换取忠实度，而噪声调度必须在 $\bar\alpha_T$ 接近零时结束。
- **GCN 层**计算 $\mathbf{H}^{(l+1)} = \sigma(\hat{\mathbf{A}}\mathbf{H}^{(l)}\mathbf{W}^{(l)})$，其中 $\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}(\mathbf{A}+\mathbf{I})\tilde{\mathbf{D}}^{-1/2}$；反复作用会把所有节点特征推向同一个方向（过平滑），所以除非加入残差连接或归一化，有用的深度很小。
- 消息传递网络无法区分 Weisfeiler–Lehman 检验区分不了的图，而来自远处节点的信息要挤过狭窄的边（过度挤压）；故障树和安全论证这样的工程模型都是图，而第一个基线永远是一条简单的结构规则。
- **物理信息神经网络**最小化由自动微分计算的偏微分方程残差，再加上边界项和初始项；当条件项被压过时，它可能收敛到平凡解，补救办法是无量纲化、给各项加权，或把条件作为硬约束构造进模型。
- DeepONet 和 傅里叶神经算子这样的**神经算子**从求解器运行结果中学习函数之间的映射；它们是代理模型，只在训练所用的那一族输入上有效，每个模型在用于新设计之前都需要用求解器核对。
- 基于 InfoNCE 的**对比学习**是 $N$ 个候选上的分类损失，随机猜测时的取值为 $\log N$，所以 $\log N - \mathcal{L}$ 最多只能确认 $\log N$ 奈特的互信息；数据增强决定表示保留什么，线性探测衡量它换来了什么。
- **混合专家**层存储 $E$ 个专家，但每个 token 只运行 $k$ 个，所以参数随 $E$ 增长，计算量随 $k$ 增长；路由坍塌用负载均衡损失来对抗，一个模型的总参数和激活参数要分开计算。

本模块的所有内容，都是在模型、损失或数据中加入结构的方法：瓶颈、噪声过程、图、方程、数据增强、路由器。下一个模块，[模块 06](module_06_ZH.html)，取出其中一种结构——注意力——并把它完整地构建出来。Transformer 用序列中所有位置之间学到的、依赖于内容的权重，取代了[模块 04](module_04_ZH.html) 的循环和本模块图网络的固定邻域。它是本模块所见的扩散主干网络、CLIP 编码器和混合专家层背后的架构，也是模块 07 到 10 中语言模型背后的架构。

## 参考文献 {#refs}

- Kingma, D. P., Welling, M. "Auto-encoding variational Bayes." *ICLR*, 2014. VAE、ELBO 估计量与重参数化技巧。
- Rezende, D. J., Mohamed, S., Wierstra, D. "Stochastic backpropagation and approximate inference in deep generative models." *ICML*, 2014. 独立提出的同一想法。
- Baldi, P., Hornik, K. "Neural networks and principal component analysis: learning from examples without local minima." *Neural Networks*, 1989. 线性自编码器恢复 PCA 子空间。
- Vincent, P., Larochelle, H., Bengio, Y., Manzagol, P.-A. "Extracting and composing robust features with denoising autoencoders." *ICML*, 2008. 去噪自编码器。
- Vincent, P. "A connection between score matching and denoising autoencoders." *Neural Computation*, 2011. 去噪估计的是分数；通向扩散模型的桥梁。
- Bowman, S. R. et al. "Generating sentences from a continuous space." *CoNLL*, 2016. 强解码器下的后验坍塌；KL 退火。
- Burda, Y., Grosse, R., Salakhutdinov, R. "Importance weighted autoencoders." *ICLR*, 2016. 定义了活跃单元。
- Kingma, D. P. et al. "Improved variational inference with inverse autoregressive flow." *NeurIPS*, 2016. 提出了 free bits。
- Higgins, I. et al. "beta-VAE: learning basic visual concepts with a constrained variational framework." *ICLR*, 2017. KL 权重 $\beta$。
- Goodfellow, I. et al. "Generative adversarial nets." *NeurIPS*, 2014. GAN 博弈、最优判别器与 Jensen-Shannon 散度。
- Metz, L., Poole, B., Pfau, D., Sohl-Dickstein, J. "Unrolled generative adversarial networks." *ICLR*, 2017. 高斯环上的模式坍塌与模式跳跃。
- Arjovsky, M., Chintala, S., Bottou, L. "Wasserstein GAN." *ICML*, 2017. 推土机距离与评判器（critic）。
- Gulrajani, I. et al. "Improved training of Wasserstein GANs." *NeurIPS*, 2017. 梯度惩罚。
- Miyato, T. et al. "Spectral normalization for generative adversarial networks." *ICLR*, 2018. 逐层的 Lipschitz 约束。
- Sohl-Dickstein, J. et al. "Deep unsupervised learning using nonequilibrium thermodynamics." *ICML*, 2015. 第一个扩散模型。
- Song, Y., Ermon, S. "Generative modeling by estimating gradients of the data distribution." *NeurIPS*, 2019. 基于分数的生成。
- Ho, J., Jain, A., Abbeel, P. "Denoising diffusion probabilistic models." *NeurIPS*, 2020. DDPM 与简化的噪声预测损失（论文导读）。
- Song, Y. et al. "Score-based generative modeling through stochastic differential equations." *ICLR*, 2021. 统一分数与扩散的连续时间视角。
- Nichol, A., Dhariwal, P. "Improved denoising diffusion probabilistic models." *ICML*, 2021. 余弦调度。
- Song, J., Meng, C., Ermon, S. "Denoising diffusion implicit models." *ICLR*, 2021. DDIM：步数更少的确定性采样。
- Dhariwal, P., Nichol, A. "Diffusion models beat GANs on image synthesis." *NeurIPS*, 2021. 分类器引导；扩散模型超越 GAN 的节点。
- Ho, J., Salimans, T. "Classifier-free diffusion guidance." arXiv:2207.12598, 2022 (first presented at a NeurIPS 2021 workshop). 不需要分类器的引导。
- Rombach, R. et al. "High-resolution image synthesis with latent diffusion models." *CVPR*, 2022. 在自编码器的潜在空间中做扩散。
- Salimans, T., Ho, J. "Progressive distillation for fast sampling of diffusion models." *ICLR*, 2022. 少步采样器；$v$ 参数化。
- Song, Y., Dhariwal, P., Chen, M., Sutskever, I. "Consistency models." *ICML*, 2023. 一步和少步生成。
- Lin, S. et al. "Common diffusion noise schedules and sample steps are flawed." *WACV*, 2024. 终端信噪比不为零及其症状。
- Carlini, N. et al. "Extracting training data from diffusion models." *USENIX Security Symposium*, 2023. 扩散模型中的记忆现象。
- Gilmer, J. et al. "Neural message passing for quantum chemistry." *ICML*, 2017. 通用的消息传递框架。
- Kipf, T. N., Welling, M. "Semi-supervised classification with graph convolutional networks." *ICLR*, 2017. GCN（论文导读）。
- Velickovic, P. et al. "Graph attention networks." *ICLR*, 2018. 学习得到的邻居权重。
- Li, Q., Han, Z., Wu, X.-M. "Deeper insights into graph convolutional networks for semi-supervised learning." *AAAI*, 2018. 把 GCN 看作拉普拉斯平滑；过平滑。
- Xu, K., Hu, W., Leskovec, J., Jegelka, S. "How powerful are graph neural networks?" *ICLR*, 2019. Weisfeiler–Lehman 上界与 GIN。
- Schlichtkrull, M. et al. "Modeling relational data with graph convolutional networks." *ESWC*, 2018. 每种边类型和方向各用一个权重矩阵。
- Alon, U., Yahav, E. "On the bottleneck of graph neural networks and its practical implications." *ICLR*, 2021. 过度挤压。
- Pfaff, T. et al. "Learning mesh-based simulation with graph networks." *ICLR*, 2021. MeshGraphNets，网格上的学习型模拟器。
- Lagaris, I. E., Likas, A., Fotiadis, D. I. "Artificial neural networks for solving ordinary and partial differential equations." *IEEE Transactions on Neural Networks*, 1998. 按构造满足条件的试探解。
- Raissi, M., Perdikaris, P., Karniadakis, G. E. "Physics-informed neural networks: a deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations." *Journal of Computational Physics*, 2019. PINN（论文导读）。
- Rahaman, N. et al. "On the spectral bias of neural networks." *ICML*, 2019. 网络先拟合低频。
- Tancik, M. et al. "Fourier features let networks learn high frequency functions in low dimensional domains." *NeurIPS*, 2020. 傅里叶特征这一补救办法。
- Wang, S., Teng, Y., Perdikaris, P. "Understanding and mitigating gradient flow pathologies in physics-informed neural networks." *SIAM Journal on Scientific Computing*, 2021. 损失失衡与自适应权重。
- Krishnapriyan, A. S. et al. "Characterizing possible failure modes in physics-informed neural networks." *NeurIPS*, 2021. PINN 训练失败的情形。
- McGreivy, N., Hakim, A. "Weak baselines and reporting biases lead to overoptimism in machine learning for fluid-related partial differential equations." *Nature Machine Intelligence*, 2024. 为什么学习型偏微分方程求解器需要强的经典基线。
- Chen, T., Chen, H. "Universal approximation to nonlinear operators by neural networks with arbitrary activation functions and its application to dynamical systems." *IEEE Transactions on Neural Networks*, 1995. DeepONet 背后的定理。
- Lu, L. et al. "Learning nonlinear operators via DeepONet based on the universal approximation theorem of operators." *Nature Machine Intelligence*, 2021. DeepONet。
- Li, Z. et al. "Fourier neural operator for parametric partial differential equations." *ICLR*, 2021. 傅里叶神经算子。
- van den Oord, A., Li, Y., Vinyals, O. "Representation learning with contrastive predictive coding." arXiv:1807.03748, 2018. InfoNCE 及其互信息下界。
- Chen, T. et al. "A simple framework for contrastive learning of visual representations." *ICML*, 2020. SimCLR 与投影头。
- Wang, T., Isola, P. "Understanding contrastive representation learning through alignment and uniformity on the hypersphere." *ICML*, 2020. 对比损失优化的是什么。
- Grill, J.-B. et al. "Bootstrap your own latent: a new approach to self-supervised learning." *NeurIPS*, 2020. BYOL，不需要负样本。
- Radford, A. et al. "Learning transferable visual models from natural language supervision." *ICML*, 2021. CLIP。
- He, K. et al. "Masked autoencoders are scalable vision learners." *CVPR*, 2022. 图像的掩码建模。
- Jacobs, R. A., Jordan, M. I., Nowlan, S. J., Hinton, G. E. "Adaptive mixtures of local experts." *Neural Computation*, 1991. 最早的混合专家。
- Shazeer, N. et al. "Outrageously large neural networks: the sparsely-gated mixture-of-experts layer." *ICLR*, 2017. 稀疏的 top-$k$ 门控。
- Fedus, W., Zoph, B., Shazeer, N. "Switch transformers: scaling to trillion parameter models with simple and efficient sparsity." *Journal of Machine Learning Research*, 2022. Top-1 路由、负载均衡损失与容量。
- Jiang, A. Q. et al. "Mixtral of experts." arXiv, 2024. [第 12 节](#s12)中计数的配置，以及路由分析。
- DeepSeek-AI. "DeepSeek-V3 technical report." arXiv, 2024. 细粒度专家与共享专家；无辅助损失的负载均衡。
