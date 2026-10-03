## 各模型族的全景图，以及它们共用的工具 {#s1}

模块 01 至 04 把输入映射到一个标签、一个数，或序列的下一个元素。本模块的各个模型族则压缩和生成数据、读取图、服从微分方程、在没有标签的情况下学习，或者在不增加计算量的情况下增加参数。每个模型族都由它优化的目标来定义，它的难点大多也源于这个目标。本节给出全景图，外加本模块其余部分所依赖的数学。

### 每个模型族优化什么

| 模型族 | 解决的问题 | 优化目标 | 输出 |
|---|---|---|---|
| 自编码器（autoencoder） | 压缩、去噪、检测异常 | 让 $\mathbf{x}$ 经过瓶颈后重构的平方误差 | 一个编码 $\mathbf{z}$，一个重构 |
| 变分自编码器（variational autoencoder，VAE） | 具有平滑潜在空间的生成模型 | ELBO，即 $\log p(\mathbf{x})$ 的一个下界 | 编码上的一个分布；样本 |
| 生成对抗网络（generative adversarial network，GAN） | 快速采样逼真的数据 | 生成器与判别器之间的极小极大博弈 | 样本，每个只需一次前向传播 |
| 扩散模型（diffusion model） | 高质量、可控的生成 | 在随机噪声水平下预测所加噪声的平方误差 | 样本，需经过多步去噪 |
| 图神经网络（graph neural network，GNN） | 图或网格上的数据 | 通过消息传递，在节点标签或图标签上的监督损失 | 每个节点或每个图一个向量 |
| 物理信息神经网络（physics-informed neural network，PINN） | 已知微分方程、数据稀疏 | 方程的残差，加上数据项和边界项 | 一个函数 $u_\theta(\mathbf{x}, t)$ |
| 对比学习（contrastive learning） | 无标签的表示 | InfoNCE：在 $N$ 个候选中挑出正样本 | 每个输入一个嵌入 |
| 混合专家（mixture of experts，MoE） | 不按比例增加计算量的容量 | 任意损失：一种把每个输入路由到 $E$ 个专家中 $k$ 个的架构 | 宿主网络输出的东西 |

混合专家改变的是网络如何构建，而不是网络为什么而训练。神经算子（[第 10 节](#s10)）与 PINN 并列，但它从求解器的输出中学习，而不是从方程中学习。

::: figure id=fig-05-1
本模块的全景图，分为两行。上行是三条生成器流水线：VAE（$\mathbf{x}$ → 编码器 → $(\boldsymbol{\mu}, \boldsymbol{\sigma})$ → $\mathbf{z}$ → 解码器 → $\hat{\mathbf{x}}$，标注“最大化 ELBO”）；GAN（$\mathbf{z}$ → $G$ → 伪造的 $\mathbf{x}$ → $D$ ← 真实的 $\mathbf{x}$，标注“极小极大”）；扩散（$\mathbf{x}_0$ → 加噪 → … → $\mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$，虚线箭头指回，标注“学到的去噪器 $\boldsymbol{\epsilon}_\theta$，数十到数百步”）。下行是四个方框：GNN（一个小图，箭头汇聚到一个节点上，“消息传递”）；PINN（网络 $u_\theta(\mathbf{x}, t)$ → 方框“$\mathcal{N}[u] = 0$”，“残差损失”）；对比学习（一个输入 → 两个增强视图 → 编码器 → 圆上被拉近的两个点，其余的点被推开，“InfoNCE”）；MoE（输入 → 路由器 → 8 个专家中突出显示的 2 个，“top-$k$”）。每个方框用一行写出它的目标。
:::

### 构建生成器的三种方式

图 5.1 的上行展示了三种取舍。**VAE** 是一个显式的潜变量模型，在似然的一个下界上训练。**GAN** 是一个隐式模型：生成器把噪声变成样本，并且只能通过第二个网络来学习，这个网络试图把样本与数据区分开。**扩散模型**学习逆转对数据的逐步加噪，每次一小步。

| | VAE | GAN | 扩散 |
|---|---|---|---|
| 每个样本的网络计算次数 | 1 | 1 | 数十到数百 |
| 训练 | 稳定（一个损失，梯度下降） | 不稳定（两个网络必须保持平衡） | 稳定（一个回归） |
| 模式覆盖 | 好，但样本模糊 | 常常很差（模式坍塌） | 好 |
| 能否得到似然 | 一个下界 | 不能 | 一个下界 |

第 3 至 6 节逐一解释表中的每一行。

### KL 散度与詹森不等式

从分布 $q$ 到分布 $p$ 的 **KL 散度**（Kullback–Leibler divergence）为

$$
D_{\KL}(q \,\|\, p) = \E_{q}\!\left[\log \frac{q(\mathbf{z})}{p(\mathbf{z})}\right].
$$

它永不为负。**詹森不等式**（Jensen's inequality）指出，对 $\log$ 这样的凹函数，$\E[\log Y] \le \log \E[Y]$。在 $q$ 下取 $Y = p/q$ 应用它：

$$
-D_{\KL}(q \,\|\, p) = \E_q\!\left[\log \frac{p}{q}\right] \le \log \E_q\!\left[\frac{p}{q}\right]
= \log \int q(\mathbf{z}) \frac{p(\mathbf{z})}{q(\mathbf{z})}\, d\mathbf{z} = \log 1 = 0.
$$

等号成立要求 $p/q$ 在 $q > 0$ 处为常数，对归一化的密度而言，这意味着 $q = p$。这个散度不对称，所以它不是距离。

对两个一元高斯分布，对数密度之差为

$$
\log q(z) - \log p(z) = \log\frac{s_2}{s_1} - \frac{(z - \mu_1)^2}{2 s_1^2} + \frac{(z - \mu_2)^2}{2 s_2^2},
$$

而在 $q = \mathcal{N}(\mu_1, s_1^2)$ 下，$\E_q[(z - \mu_1)^2] = s_1^2$，$\E_q[(z - \mu_2)^2] = s_1^2 + (\mu_1 - \mu_2)^2$。因此

$$
D_{\KL}\big(\mathcal{N}(\mu_1, s_1^2) \,\|\, \mathcal{N}(\mu_2, s_2^2)\big)
= \log\frac{s_2}{s_1} + \frac{s_1^2 + (\mu_1 - \mu_2)^2}{2 s_2^2} - \frac{1}{2}. \tag{5.1}
$$

相对于标准正态分布（$\mu_2 = 0$，$s_2 = 1$），它变为 $\tfrac12(\mu^2 + s^2 - \log s^2 - 1)$，这正是[第 3 节](#s3)中每个 VAE 都要计算的那一项。

::: worked title="两个高斯分布之间的正向 KL 与反向 KL"
取 $q = \mathcal{N}(0, 1)$ 和 $p = \mathcal{N}(1, 0.5)$，其中 0.5 是方差，所以 $s_p = \sqrt{0.5} = 0.7071$。

$D_{\KL}(q \,\|\, p)$，在 (5.1) 中取 $s_1 = 1$、$s_2 = 0.7071$：

$$
\log 0.7071 + \frac{1 + (0 - 1)^2}{2 \times 0.5} - \frac12 = -0.3466 + 2 - 0.5 = 1.1534 \text{ 奈特。}
$$

$D_{\KL}(p \,\|\, q)$，取 $s_1 = 0.7071$、$s_2 = 1$：

$$
\log\frac{1}{0.7071} + \frac{0.5 + 1}{2 \times 1} - \frac12 = 0.3466 + 0.75 - 0.5 = 0.5966 \text{ 奈特。}
$$

两个数不同：这个散度不对称。第一个更大，因为宽的 $q$ 把概率质量放在了窄的 $p$ 几乎没有质量的地方。这两个数都会在[第 3 节](#s3)中再次出现，分别是一个精确例子中的 ELBO 差距和 KL 项。
:::

### 高斯代数

[第 5 节](#s5)用到三个事实。相互独立的 $a \sim \mathcal{N}(0, s_a^2)$ 和 $b \sim \mathcal{N}(0, s_b^2)$ 给出 $a + b \sim \mathcal{N}(0, s_a^2 + s_b^2)$：方差相加。对 $\epsilon \sim \mathcal{N}(0, 1)$，有 $c\,\epsilon \sim \mathcal{N}(0, c^2)$。任何高斯样本都可以写成 $\mu + \sigma \epsilon$。

::: worked title="两步加噪合为一步"
把数据点 $x_0 = 2$ 乘以 $\sqrt{0.8}$ 加以收缩，再加上方差为 0.2 的噪声：

$$
x_1 = \sqrt{0.8}\, x_0 + \sqrt{0.2}\, \epsilon_1 = 1.7889 + 0.4472\,\epsilon_1 \sim \mathcal{N}(1.7889,\ 0.2).
$$

取抽样 $\epsilon_1 = 0.5$：$x_1 = 1.7889 + 0.2236 = 2.0125$。再应用同样的一步，$x_2 = \sqrt{0.8}\, x_1 + \sqrt{0.2}\, \epsilon_2$。给定 $x_0$，$x_2$ 的均值为 $0.8 \times 2 = 1.6$，方差为 $0.8 \times 0.2 + 0.2 = 0.36$，因为第一步的噪声随信号一起被收缩，而方差相加。所以 $x_2 \sim \mathcal{N}(1.6,\ 0.36)$，即用单次抽样 $\epsilon$ 写成的 $\sqrt{0.64}\, x_0 + \sqrt{0.36}\, \epsilon$：两步等于把信号因子相乘后的一步。[第 5 节](#s5)的前向过程就是这一步的重复，它的闭式 (5.4) 就是对任意步数的这种复合。
:::

### 蒙特卡洛，以及它求不了的梯度

期望用样本平均来估计，$\E_p[f(\mathbf{x})] \approx \frac{1}{S}\sum_{s=1}^{S} f(\mathbf{x}_s)$，其中 $\mathbf{x}_s \sim p$；这一估计是无偏的，标准误差按 $1/\sqrt{S}$ 下降。当分布依赖于正在训练的参数时，麻烦就来了：

$$
\nabla_\phi \E_{q_\phi}[f(\mathbf{z})] = \nabla_\phi \int q_\phi(\mathbf{z}) f(\mathbf{z})\, d\mathbf{z}
= \int f(\mathbf{z})\, \nabla_\phi q_\phi(\mathbf{z})\, d\mathbf{z}
\ne \E_{q_\phi}[\nabla_\phi f(\mathbf{z})].
$$

参数位于密度中，而不在 $f$ 中。取 $f(z) = z^2$、$q = \mathcal{N}(\mu, 1)$，期望为 $\mu^2 + 1$，梯度为 $2\mu$；而把一个采样得到的 $z^2$ 对 $\mu$ 求导得 0，因为样本不记录自己从何而来。[第 3 节](#s3)解决这个问题。

有三个先前的工具直接使用，不再重新推导：极大似然及其损失（[模块 01 第 5 节](module_01_ZH.html#s5)）、反向模式自动微分（[模块 02 第 4 节](module_02_ZH.html#s4)），以及主成分分析（[模块 01 第 11 节](module_01_ZH.html#s11)）。

::: check
为什么 $D_{\KL}(q \,\|\, p)$ 永不为负？
:::

::: answer
由凹函数 $\log$ 的詹森不等式：$\E_q[\log(p/q)] \le \log \E_q[p/q] = \log \int p\, d\mathbf{z} = \log 1 = 0$，所以 $-D_{\KL} \le 0$，仅当 $q = p$ 时取等号。
:::

::: check
哪个生成器族每生成一个样本需要多次网络计算？为什么？
:::

::: answer
扩散模型。它通过一次一步地逆转加噪来生成，每一步都是去噪网络的一次计算，所以数十到数百步就要花费数十到数百次计算。VAE 的解码器和 GAN 的生成器一次传播就能产生一个样本。
:::

## 自编码器：瓶颈、去噪与异常检测 {#s2}

**自编码器**是作为一个整体来训练的两个网络。编码器把输入映射为一个编码 $\mathbf{z} = f_\phi(\mathbf{x}) \in \R^{d_z}$，解码器再把编码映射回去，$\hat{\mathbf{x}} = g_\theta(\mathbf{z}) \in \R^{d_x}$。训练在数据上最小化重构误差：

$$
\mathcal{L}(\phi, \theta) = \frac{1}{N}\sum_{i=1}^{N} \big\|\mathbf{x}_i - g_\theta(f_\phi(\mathbf{x}_i))\big\|^2 .
$$

不需要标签；输入就是它自己的目标。编码位于**潜在空间**（latent space）中，而让它有价值的是一个约束。**欠完备**（undercomplete）自编码器满足 $d_z < d_x$，即有一个**瓶颈**（bottleneck）：编码装不下一切，所以训练必须决定保留什么，它保留的是在整个数据集上最能降低误差的东西（图 5.2）。一个没有其他约束的过完备（overcomplete）自编码器（$d_z \ge d_x$）可以学到恒等映射，完美地重构，却对哪些输入是可能出现的一无所知。

::: figure id=fig-05-2
自编码器架构：一个 8×8 数字（64 个像素）→ 编码器（64 → 128 → $d_z$）→ 画成两个神经元的瓶颈 $\mathbf{z}$（$d_z = 2$）→ 解码器（$d_z$ → 128 → 64）→ 重构的数字。一条损失箭头比较输入与输出。
:::

### 线性自编码器就是 PCA

取中心化的数据、线性编码器 $\mathbf{z} = \mathbf{W}_e\mathbf{x}$（其中 $\mathbf{W}_e \in \R^{d_z \times d_x}$）、线性解码器 $\hat{\mathbf{x}} = \mathbf{W}_d\mathbf{z}$，以及平方误差。重构为 $\mathbf{M}\mathbf{x}$，其中 $\mathbf{M} = \mathbf{W}_d\mathbf{W}_e$ 是秩至多为 $d_z$ 的矩阵，所以每个重构都位于一个 $d_z$ 维子空间中。对固定的子空间，离 $\mathbf{x}$ 最近的点是它的正交投影，所以问题在于选哪个子空间。把到一组标准正交基 $\mathbf{U} \in \R^{d_x \times d_z}$ 上的投影写成 $\mathbf{U}\mathbf{U}^\top$，协方差写成 $\mathbf{C} = \frac{1}{N}\sum_i \mathbf{x}_i\mathbf{x}_i^\top$。平均误差为

$$
\frac{1}{N}\sum_i \|\mathbf{x}_i - \mathbf{U}\mathbf{U}^\top\mathbf{x}_i\|^2
= \operatorname{tr}(\mathbf{C}) - \operatorname{tr}(\mathbf{U}^\top\mathbf{C}\mathbf{U}),
$$

这是因为投影与残差正交。最小化它，就是最大化保留下来的方差 $\operatorname{tr}(\mathbf{U}^\top\mathbf{C}\mathbf{U})$，而 $\mathbf{C}$ 的前 $d_z$ 个特征向量做到了这一点（Eckart–Young 定理）。最小误差是 $\operatorname{tr}(\mathbf{C})$ 减去前 $d_z$ 个特征值，即被舍弃的特征值之和。Baldi 和 Hornik（1989）证明，线性自编码器上的梯度下降没有其他局部极小值，所以它能找到这个子空间。

它找到的是子空间，而不是主成分本身。对任意可逆的 $d_z \times d_z$ 矩阵 $\mathbf{A}$，$(\mathbf{A}\mathbf{W}_e,\ \mathbf{W}_d\mathbf{A}^{-1})$ 这一对给出相同的乘积 $\mathbf{M}$ 和相同的误差，所以编码坐标可以是各主成分的任意混合。

::: worked title="手算一个线性自编码器"
四个中心化的点：$(2, 2)$、$(-2, -2)$、$(1, -1)$、$(-1, 1)$。协方差为

$$
\mathbf{C} = \frac14\left(\begin{bmatrix}4&4\\4&4\end{bmatrix}\times 2 + \begin{bmatrix}1&-1\\-1&1\end{bmatrix}\times 2\right)
= \begin{bmatrix}2.5&1.5\\1.5&2.5\end{bmatrix},
$$

特征值为 4 和 1，特征向量为 $(1, 1)/\sqrt2$ 和 $(1, -1)/\sqrt2$。最好的一维编码是到 $(1, 1)/\sqrt2$ 上的投影。点 $(2, 2)$ 和 $(-2, -2)$ 位于这条轴上，能精确重构。点 $(1, -1)$ 和 $(-1, 1)$ 与它正交，投影为 0，重构为 $(0, 0)$，平方误差各为 $1 + 1 = 2$。均方误差为 $(0 + 0 + 2 + 2)/4 = 1.0$：正是被舍弃的特征值。
:::

非线性的编码器和解码器能沿着弯曲的流形走，而没有哪个平直的子空间能拟合这样的流形。在[实验 1](#lab1) 中，在缩放到 $[0, 1]$ 的 8×8 数字上，一个两侧各有一个 128 单元隐藏层的自编码器，在 $d_z = 2$ 时达到每像素 0.037 的测试误差，PCA 为 0.053；在 $d_z = 8$ 时为 0.011 对 0.025。PCA 仍是应当首先拟合的基线：它是精确的，瞬间就能算完，而且当数据接近一个子空间时，它几乎一样好。

### 去噪

**去噪自编码器**（denoising autoencoder，Vincent 等人 2008）的输入是一个被破坏的 $\tilde{\mathbf{x}}$（加上高斯噪声，或遮住部分像素），训练它输出干净的 $\mathbf{x}$。即使是过完备的网络，也无法靠复制输入来完成这个任务；它必须学到数据位于何处，并把点移回数据那里。

它学到的东西有精确的形式。在平方误差下，最好的去噪器是条件均值 $r(\tilde{\mathbf{x}}) = \E[\mathbf{x} \mid \tilde{\mathbf{x}}]$。取 $\tilde{\mathbf{x}} = \mathbf{x} + \sigma\boldsymbol{\epsilon}$，带噪声的密度为 $p_\sigma(\tilde{\mathbf{x}}) = \int p(\mathbf{x})\,\mathcal{N}(\tilde{\mathbf{x}}; \mathbf{x}, \sigma^2\mathbf{I})\, d\mathbf{x}$。在积分号下求导；高斯函数的梯度等于高斯函数乘以 $(\mathbf{x} - \tilde{\mathbf{x}})/\sigma^2$：

$$
\nabla \log p_\sigma(\tilde{\mathbf{x}})
= \frac{\int p(\mathbf{x})\,\mathcal{N}(\tilde{\mathbf{x}}; \mathbf{x}, \sigma^2\mathbf{I})\,(\mathbf{x} - \tilde{\mathbf{x}})\, d\mathbf{x}}{\sigma^2\, p_\sigma(\tilde{\mathbf{x}})}
= \frac{\E[\mathbf{x} \mid \tilde{\mathbf{x}}] - \tilde{\mathbf{x}}}{\sigma^2}.
$$

所以 $r(\tilde{\mathbf{x}}) - \tilde{\mathbf{x}} = \sigma^2 \nabla \log p_\sigma(\tilde{\mathbf{x}})$，在噪声较小时近似为 $\sigma^2 \nabla \log p(\tilde{\mathbf{x}})$（Vincent 2011）。去噪器的修正指向对数密度上升的方向。这个梯度，即**分数**（score），正是[第 5 节](#s5)中扩散模型要学习的东西。

### 异常检测

基于重构的**异常检测**（anomaly detection）只在正常运行的数据上训练自编码器，并用重构误差给新输入打分。一个与训练数据中任何东西都不相像的输入，例如一个以新方式表现的传感器通道，或一个超出设计空间的零件，应当重构得很差。真正要紧的决定是阈值。把它设在留出正常数据误差的一个高百分位上，比如第 95 百分位，误报率按构造就约为 5%。检出率无法设定，只能测量，而且只能在你已知的异常上测量，它取决于异常长什么样。

::: worked title="数字上的异常阈值"
[实验 1](#lab1) 只在数字 0–8 上训练 $d_z = 8$ 的自编码器，并留出其中 20% 用于验证。验证误差的第 95 百分位是每像素 0.0261。在测试集上，4.0% 的正常数字超过它（误报率，接近预期的 5%），而 9 有 58.3% 超过它（检出率）。对所有阈值取平均的 ROC AUC 为 0.952。

来自过程监控的经典基线是 8 个成分的 PCA，它用平方预测误差给每个输入打分，即 **Q 统计量**（Q statistic）$\|\mathbf{x} - \mathbf{U}\mathbf{U}^\top\mathbf{x}\|^2$。它的 AUC 为 0.791；在它自己的第 95 百分位阈值上，它以 7.7% 的误报率检出 22.2% 的 9。

两组数都重要。网络明显胜过基线，这证明了使用它的理由；但 0.95 的 AUC 掩盖了一个事实：42% 的异常通过了工作阈值，因为许多 9 看起来像模型能重构得很好的数字。
:::

同样的配方也适用于预测残差，而不只是重构（[模块 04 第 9 节](module_04_ZH.html#s9)）。它有三种失效方式。与正常数据相似的异常重构得很好，于是通过了检测，许多 9 就是这样。运行工况的改变，例如新的载荷工况或更换了传感器，会把正常误差推到阈值之上，用误报淹没操作人员。而藏在“正常”训练数据中的异常会被当作正常学进去：检测器的干净程度，取决于被告知是健康的那些数据有多干净。

::: check
一个 $d_z = 3$ 的线性自编码器在中心化数据上用平方误差训练。它恢复出什么？
:::

::: answer
前三个主成分张成的子空间：它的重构是到该子空间上的正交投影。它的三个编码坐标是这些主成分的某种可逆混合，不一定是主成分本身。
:::

::: check
异常阈值如何选取？这一选择固定了哪个错误率？
:::

::: answer
取留出正常数据重构误差的一个高百分位。这固定了误报率，约为 100 减去该百分位（以百分比计）。检出率不由这一选择决定，必须在已知的异常上测量。
:::

## 变分自编码器：ELBO 与重参数化技巧 {#s3}

自编码器的潜在空间有空洞。解码两个编码簇之间的一个点，输出不是任何特定的数字（[实验 1](#lab1) 展示了这一点），所以解码器不能用来生成：没有任何东西规定编码位于何处。**变分自编码器**（VAE；Kingma 和 Welling 2014，Rezende、Mohamed 和 Wierstra 2014 年独立提出了它）把编码变成一个带先验的随机变量，并把编码器和解码器作为一个概率模型来训练。

### 模型，以及为什么它的似然无法求得

生成过程分两步：抽取一个编码 $\mathbf{z} \sim p(\mathbf{z}) = \mathcal{N}(\mathbf{0}, \mathbf{I})$，再抽取 $\mathbf{x} \sim p_\theta(\mathbf{x} \mid \mathbf{z})$，这是一个简单分布，它的参数由解码器网络从 $\mathbf{z}$ 算出。一个数据点的似然为

$$
p_\theta(\mathbf{x}) = \int p_\theta(\mathbf{x} \mid \mathbf{z})\, p(\mathbf{z})\, d\mathbf{z}.
$$

极大似然（[模块 01 第 5 节](module_01_ZH.html#s5)）需要每个训练点的 $\log p_\theta(\mathbf{x}_i)$，而这个积分里面有一个神经网络，还要覆盖 $d_z$ 个维度。对从先验抽取的编码求 $p_\theta(\mathbf{x} \mid \mathbf{z})$ 的平均是无偏的，却毫无希望：几乎每个编码解码出来的都是与 $\mathbf{x}$ 无关的东西。要紧的编码是后验 $p_\theta(\mathbf{z} \mid \mathbf{x}) = p_\theta(\mathbf{x} \mid \mathbf{z})p(\mathbf{z}) / p_\theta(\mathbf{x})$ 中的编码，而后验需要 $p_\theta(\mathbf{x})$，正是我们无法计算的那个量。

### 证据下界的两种推导

引入一个近似后验 $q_\phi(\mathbf{z} \mid \mathbf{x})$，它可以是任何我们能采样、能求值的密度，并把它用作重要性分布。在积分内乘上再除以它，然后应用詹森不等式（[第 1 节](#s1)）：

$$
\begin{aligned}
\log p_\theta(\mathbf{x})
&= \log \int q_\phi(\mathbf{z} \mid \mathbf{x})\, \frac{p_\theta(\mathbf{x} \mid \mathbf{z})\, p(\mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}\, d\mathbf{z}
= \log \E_{q_\phi}\!\left[\frac{p_\theta(\mathbf{x} \mid \mathbf{z})\, p(\mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}\right] \\
&\ge \E_{q_\phi}\!\left[\log p_\theta(\mathbf{x} \mid \mathbf{z}) + \log p(\mathbf{z}) - \log q_\phi(\mathbf{z} \mid \mathbf{x})\right] \\
&= \underbrace{\E_{q_\phi}\!\left[\log p_\theta(\mathbf{x} \mid \mathbf{z})\right]}_{\text{重构}}
 - \underbrace{D_{\KL}\big(q_\phi(\mathbf{z} \mid \mathbf{x}) \,\|\, p(\mathbf{z})\big)}_{\text{使编码靠近先验}} .
\end{aligned} \tag{5.2}
$$

这就是**证据下界**（evidence lower bound，ELBO）。第一项奖励那些能让解码器复现 $\mathbf{x}$ 的编码；第二项按每个编码的分布偏离先验的程度向它收费，以奈特（nats）计。

不等式掩盖了放弃的东西；一个恒等式能把它显示出来。由贝叶斯法则，对每个 $\mathbf{z}$，有 $\log p_\theta(\mathbf{x}) = \log p_\theta(\mathbf{x} \mid \mathbf{z}) + \log p(\mathbf{z}) - \log p_\theta(\mathbf{z} \mid \mathbf{x})$。左边不依赖于 $\mathbf{z}$，所以它等于自身在 $q_\phi$ 下的期望。在里面加上再减去 $\log q_\phi$：

$$
\log p_\theta(\mathbf{x})
= \E_{q_\phi}\!\left[\log \frac{p_\theta(\mathbf{x} \mid \mathbf{z})\, p(\mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}\right]
+ \E_{q_\phi}\!\left[\log \frac{q_\phi(\mathbf{z} \mid \mathbf{x})}{p_\theta(\mathbf{z} \mid \mathbf{x})}\right]
= \text{ELBO} + D_{\KL}\big(q_\phi(\mathbf{z} \mid \mathbf{x}) \,\|\, p_\theta(\mathbf{z} \mid \mathbf{x})\big).
\tag{5.3}
$$

差距恰好是从近似后验到真实后验的 KL 散度。由于 $\log p_\theta(\mathbf{x})$ 不依赖于 $\phi$，在 $\phi$ 上提高 ELBO 只能缩小差距：编码器学会逼近后验。在 $\theta$ 上提高 ELBO，则提高似然，或提高下界的紧度，或两者兼有。训练同时做这两件事。

::: worked title="一个处处精确的模型"
取 $p(z) = \mathcal{N}(0, 1)$ 和 $p(x \mid z) = \mathcal{N}(z, 1)$。于是 $x$ 是两个相互独立的单位方差正态变量之和，所以 $p(x) = \mathcal{N}(0, 2)$。后验由 $\log p(z \mid x) = -\tfrac12 z^2 - \tfrac12(x - z)^2 + \text{const} = -(z - x/2)^2 + \text{const}$ 得出，所以 $p(z \mid x) = \mathcal{N}(x/2,\ 1/2)$。取 $x = 2$：

$$
\log p(x) = -\tfrac12 \log(2\pi \times 2) - \frac{2^2}{2 \times 2} = -\tfrac12\log(4\pi) - 1 = -1.2655 - 1 = -2.2655.
$$

对 $q = \mathcal{N}(m, s^2)$，重构项为 $\E_q[\log p(x \mid z)] = -\tfrac12\log(2\pi) - \tfrac12\big[(x - m)^2 + s^2\big]$，其中 $\tfrac12\log(2\pi) = 0.9189$。

取 $q = \mathcal{N}(1, 0.5)$，即真实后验：重构为 $-0.9189 - \tfrac12(1 + 0.5) = -1.6689$；到先验的 KL 为 $\tfrac12(1 + 0.5 - \log 0.5 - 1) = 0.5966$；ELBO $= -1.6689 - 0.5966 = -2.2655 = \log p(x)$。下界是紧的。

取 $q = \mathcal{N}(0, 1)$，即一个坍塌为先验的后验：重构为 $-0.9189 - \tfrac12(4 + 1) = -3.4189$；KL 为 0；ELBO $= -3.4189$。差距为 $-2.2655 - (-3.4189) = 1.1534 = D_{\KL}\big(\mathcal{N}(0, 1) \,\|\, \mathcal{N}(1, 0.5)\big)$，也就是[第 1 节](#s1)算出的那个数，正如 (5.3) 所要求的。图 5.5 画出了这两种情形。
:::

::: figure id=fig-05-5
这个精确例子。左：在从 −3 到 4 的 $z$ 轴上，先验 $\mathcal{N}(0, 1)$，以及 $x = 2$ 时的真实后验 $\mathcal{N}(1, 0.5)$。右：$\log p(x) = \text{ELBO} + \text{差距}$，针对 $q$ 的两种选择画出，并以 $\log p(x) = -2.27$ 处的一条虚线作对照：$q$ 等于后验时，ELBO 为 −2.27，差距为 0；$q$ 等于先验时，ELBO 为 −3.42，差距 1.15 把它补回到 −2.27。
:::

### 摊销推断与高斯编码器

经典的变分推断为每个数据点单独拟合一个 $q$，各自做一次优化。VAE 使用**摊销推断**（amortised inference）：一个编码器网络对每个 $\mathbf{x}$ 输出 $q_\phi(\mathbf{z} \mid \mathbf{x}) = \mathcal{N}\big(\boldsymbol{\mu}_\phi(\mathbf{x}), \operatorname{diag}\boldsymbol{\sigma}^2_\phi(\mathbf{x})\big)$ 的参数，所以一个新输入只需一次前向传播。代价是编码器未必能对每个点都输出最好的 $q$，这是在高斯形状之外又一个使下界变松的来源。编码器输出 $\log \boldsymbol{\sigma}^2$ 而不是 $\boldsymbol{\sigma}^2$，因为网络输出是不受约束的实数，取指数能使它为正。

对角高斯 $q$ 配以标准正态先验时，两个对数密度都是对各维求和，所以 KL 是[第 1 节](#s1)中一元公式之和：

$$
D_{\KL}\big(q_\phi(\mathbf{z} \mid \mathbf{x}) \,\|\, \mathcal{N}(\mathbf{0}, \mathbf{I})\big)
= \frac12 \sum_{j=1}^{d_z} \left(\mu_j^2 + \sigma_j^2 - \log \sigma_j^2 - 1\right).
$$

::: worked title="二维中的 KL 项"
设 $\boldsymbol{\mu} = (1.0, -0.5)$，$\boldsymbol{\sigma} = (0.5, 1.0)$。

第 1 维：$\tfrac12(1 + 0.25 - \log 0.25 - 1) = \tfrac12(0.25 + 1.3863) = 0.8181$。

第 2 维：$\tfrac12(0.25 + 1 - 0 - 1) = 0.125$。

合计：0.9431 奈特。第一维主要为它较窄的宽度付费（$-\log\sigma_1^2 = 1.386$），而不是为它的均值；第二维只为它的均值付费。对一个编码确信，与移动它的代价一样高。
:::

### 让梯度穿过采样

重构项是 $q_\phi$ 下的期望，而 $q_\phi$ 依赖于编码器的参数：这正是[第 1 节](#s1)留下的问题。它有两种解法。

**分数函数**（score-function）估计量，即 REINFORCE，利用 $\nabla_\phi q_\phi = q_\phi \nabla_\phi \log q_\phi$：

$$
\nabla_\phi \E_{q_\phi}[f(\mathbf{z})] = \int f(\mathbf{z})\, q_\phi(\mathbf{z})\, \nabla_\phi \log q_\phi(\mathbf{z})\, d\mathbf{z}
= \E_{q_\phi}\!\left[f(\mathbf{z})\, \nabla_\phi \log q_\phi(\mathbf{z})\right].
$$

它是无偏的，即使对离散的 $\mathbf{z}$ 也适用，但方差很高，因为每个样本都把 $f$ 的大小乘上一个随机方向。对 $f(z) = z^2$ 和 $q = \mathcal{N}(\mu, 1)$，在 $\mu = 1$ 处，单样本估计 $z^2(z - 1)$ 的均值为 2，即真实梯度，方差为 30。

**重参数化技巧**（reparameterisation trick）把样本写成参数和一个噪声输入的确定性函数，而噪声的分布不依赖于参数：

$$
\mathbf{z} = \boldsymbol{\mu}_\phi(\mathbf{x}) + \boldsymbol{\sigma}_\phi(\mathbf{x}) \odot \boldsymbol{\epsilon},
\quad \boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I}),
\qquad
\nabla_\phi \E_{\boldsymbol{\epsilon}}\big[f(\boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon})\big]
= \E_{\boldsymbol{\epsilon}}\big[\nabla_\phi f(\boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon})\big].
$$

梯度能移到期望里面，因为现在期望是对 $\boldsymbol{\epsilon}$ 取的，而 $\phi$ 不触及 $\boldsymbol{\epsilon}$。逐维看，$\partial z_j/\partial \mu_j = 1$，$\partial z_j/\partial \sigma_j = \epsilon_j$。在同一个例子中，估计为 $2z$，均值为 2，方差为 4，而分数函数估计量为 30。这个技巧要求 $\mathbf{z}$ 连续、$f$ 可微。

::: worked title="一个重参数化样本"
取 $\boldsymbol{\mu} = (1.0, -0.5)$、$\boldsymbol{\sigma} = (0.5, 1.0)$ 和抽样 $\boldsymbol{\epsilon} = (0.3, -1.2)$：

$$
\mathbf{z} = (1.0 + 0.5 \times 0.3,\ -0.5 + 1.0 \times (-1.2)) = (1.15,\ -1.70).
$$

局部导数为 $\partial\mathbf{z}/\partial\boldsymbol{\mu} = (1, 1)$ 和 $\partial\mathbf{z}/\partial\boldsymbol{\sigma} = \boldsymbol{\epsilon} = (0.3, -1.2)$。从解码器到达 $\mathbf{z}$ 的梯度，经过一次普通的乘法和加法到达 $\boldsymbol{\mu}$ 和 $\boldsymbol{\sigma}$；$\boldsymbol{\epsilon}$ 是一个输入，就像一个数据值一样（图 5.4）。
:::

::: figure id=fig-05-4
VAE 的计算图：$\mathbf{x}$ → 编码器 → $\boldsymbol{\mu}$ 和 $\log\boldsymbol{\sigma}^2$；$\boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ 画成一个外部输入节点；$\mathbf{z} = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon}$ → 解码器 → $\hat{\mathbf{x}}$ → 重构项；$\boldsymbol{\mu}$ 和 $\boldsymbol{\sigma}$ → KL 项；两者相加得到 −ELBO。红色虚线梯度箭头经 $\mathbf{z}$ 回流到 $\boldsymbol{\mu}$ 和 $\boldsymbol{\sigma}$，并且明显地不进入 $\boldsymbol{\epsilon}$。
:::

### 解码器的似然设定了兑换率

重构项是一个对数似然，所以必须给解码器一个噪声模型。对 $[0, 1]$ 中的强度，**伯努利**（Bernoulli）解码器为每个像素输出一个 logit，$-\log p_\theta(\mathbf{x} \mid \mathbf{z})$ 就是对各像素求和的二元交叉熵。**高斯**解码器 $\mathcal{N}(\hat{\mathbf{x}}, \sigma_x^2\mathbf{I})$ 给出

$$
-\log p_\theta(\mathbf{x} \mid \mathbf{z}) = \frac{\|\mathbf{x} - \hat{\mathbf{x}}\|^2}{2\sigma_x^2} + \frac{d_x}{2}\log(2\pi\sigma_x^2).
$$

求和的平方误差，就是这个式子取 $\sigma_x^2 = 1/2$ 并丢掉常数。对 $[0, 1]$ 中的像素，这相当于 0.71 的噪声标准差，等于说图像几乎不由它的编码决定。$\sigma_x$ 的值是重构与 KL 之间的兑换率：小的 $\sigma_x$ 让每一单位误差都很昂贵，于是值得为 $\mathbf{z}$ 中的信息付费；大的 $\sigma_x$ 则让 KL 占主导。**beta-VAE**（Higgins 等人 2017）把这一权衡显式写出，用 $\beta$ 给 KL 加权；$\beta = 1$ 就是 ELBO。

下面的类就是[实验 1](#lab1) 中使用的紧凑 VAE，并写明了它的似然：

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class VAE(nn.Module):
    def __init__(self, d_in, d_z=2, h=128):
        super().__init__()
        self.enc = nn.Sequential(nn.Linear(d_in, h), nn.GELU(), nn.Linear(h, 2 * d_z))
        self.dec = nn.Sequential(nn.Linear(d_z, h), nn.GELU(), nn.Linear(h, d_in))
        self.beta = 1.0  # KL weight; 1 gives the ELBO itself

    def forward(self, x):
        mu, logvar = self.enc(x).chunk(2, dim=-1)
        z = mu + torch.exp(0.5 * logvar) * torch.randn_like(mu)  # reparameterisation
        xhat = self.dec(z)
        # Gaussian decoder with sigma_x^2 = 1/2: -log p(x|z) = ||x - xhat||^2 + const
        recon = F.mse_loss(xhat, x, reduction="sum") / len(x)
        # closed-form KL to N(0, I), summed over latent dimensions, averaged over batch
        kl = -0.5 * (1 + logvar - mu**2 - logvar.exp()).sum(-1).mean()
        return recon + self.beta * kl, xhat


def bernoulli_recon(logits, x):
    """-log p(x|z) for pixels in [0, 1]: decoder outputs are Bernoulli logits."""
    return F.binary_cross_entropy_with_logits(logits, x, reduction="sum") / len(x)
```

把 `recon` 换成 `bernoulli_recon(xhat, x)`，就得到实验 1 的主要结果所用的伯努利解码器。

### 后验坍塌

**后验坍塌**（posterior collapse）是这样一种状态：对每个 $\mathbf{x}$，$q_\phi(\mathbf{z} \mid \mathbf{x})$ 在部分维度或全部维度上都接近先验，而解码器学会忽略这些维度。它有两种成因。一是 KL 的权重相对于重构项可能太大：$\beta > 1$，或者隐含的 $\sigma_x^2$ 很大。二是解码器可能不需要 $\mathbf{z}$ 就能很好地建模 $\mathbf{x}$，文本 VAE 的自回归解码器就是如此（Bowman 等人 2016）。

可以用每个维度的 KL 来诊断它，也可以用**活跃单元**（active units，Burda 等人 2016）：若 $\operatorname{Var}_{\mathbf{x}}\big(\E_{q}[z_j]\big) > 0.01$，即它的均值编码随输入变化而移动，则维度 $j$ 是活跃的。常用的修正有：KL 预热（把 $\beta$ 从 0 逐渐升高）、自由比特（free bits；Kingma 等人 2016：每个维度在一个奈特下限之下不施加 KL 惩罚）、$\beta \le 1$，以及缩放得更好的似然。

[实验 1](#lab1) 在测试数字上用 $d_z = 8$ 和伯努利解码器测量了这一点：

| 设置 | 总 KL（奈特） | 活跃单元 | 重构（奈特） |
|---|---|---|---|
| $\beta = 0.5$ | 6.5 | 8 | 18.9 |
| $\beta = 1$ | 3.6 | 6 | 21.0 |
| $\beta = 4$ | 0.00 | 0 | 27.2 |
| $\beta = 1$，求和的平方误差 | 0.5 | 3 | 不可比（另一种似然） |

在 $\beta = 4$ 时，坍塌是最优解，而不是训练中的偶然结果。$\beta = 1$ 的解在 $\beta = 4$ 的目标下计分，代价为 $21.0 + 4 \times 3.6 = 35.4$ 奈特；坍塌的解代价为 $27.2 + 4 \times 0 = 27.2$。使用编码能省下 6.2 奈特的重构，却要付出 14.4 奈特的加权 KL。这就是预热救不了它的原因：在实验 1 的“动手试试”第 1 项中，预热到 $\beta = 4$ 仍会坍塌（KL 0.01 奈特，没有活跃单元），而预热到 $\beta = 1$ 则把活跃单元从 6 个提高到 8 个。预热修正的是由优化路径造成的坍塌，而不是目标中内置的坍塌。求和平方误差那一行就是 $\sigma_x^2 = 1/2$ 的效应：放弃重构的代价很低，只有三个维度仍在使用。

### 模糊的样本，以及 VAE 的用途

VAE 的样本是模糊的。一个编码与许多略有不同的图像都相容，而在高斯或伯努利似然上训练的解码器输出它们的平均，在它们不一致的地方就是平滑的。VAE 的价值反而在于它的潜在空间：平滑，处处接近先验，所以每个点都能解码出看似合理的东西，两个编码之间的直线也是合理的插值。用工程的话说，它是一个潜在设计空间。而一个 VAE 式的自编码器，加上较轻的 KL 惩罚和一个保持清晰度的对抗项，就是潜在扩散（[第 6 节](#s6)）内部的压缩器。

::: check
$\log p_\theta(\mathbf{x})$ 与 ELBO 之间的差距是什么？
:::

::: answer
由恒等式 (5.3)，差距是 $D_{\KL}\big(q_\phi(\mathbf{z} \mid \mathbf{x}) \,\|\, p_\theta(\mathbf{z} \mid \mathbf{x})\big)$，即从近似后验到真实后验的 KL 散度。仅当 $q$ 等于真实后验时它才为零。
:::

::: check
为什么不能直接对“从 $\mathcal{N}(\boldsymbol{\mu}, \boldsymbol{\sigma}^2)$ 中抽取 $\mathbf{z}$”做反向传播？重参数化改变了什么？
:::

::: answer
抽取一个样本不是 $\boldsymbol{\mu}$ 和 $\boldsymbol{\sigma}$ 的可微函数：取出来的那个数不带导数。把 $\mathbf{z}$ 写成 $\mathbf{z} = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\epsilon}$，并把 $\boldsymbol{\epsilon}$ 作为外部输入，就使 $\mathbf{z}$ 成为两者的可微函数，其中 $\partial z_j/\partial\mu_j = 1$，$\partial z_j/\partial\sigma_j = \epsilon_j$。
:::

::: check
一个 VAE 的 KL 项在每个维度上都是 0.00 奈特。它的样本是什么样的？为什么？
:::

::: answer
全都一样，大致是一张平均图像。每个 $q_\phi(\mathbf{z} \mid \mathbf{x})$ 都等于先验，所以 $\mathbf{z}$ 不携带关于 $\mathbf{x}$ 的任何信息，解码器已经学会忽略它；无论抽到什么编码，输出都相同。
:::

## 生成对抗网络 {#s4}

**生成对抗网络**（GAN；Goodfellow 等人 2014）完全放弃了似然。**生成器**（generator）$G$ 把噪声 $\mathbf{z} \sim p(\mathbf{z})$ 映射为样本 $G(\mathbf{z})$；这些样本服从某个分布 $p_g$，但它的密度没有公式可写，所以不能用极大似然训练。取而代之的是一个**判别器**（discriminator）$D$，它输出其输入为真实数据的概率，$D(\mathbf{x}) = \sigma(a(\mathbf{x}))$，其中 $a$ 是一个 logit；两者进行一场博弈：

$$
\min_G \max_D\ V(G, D) = \E_{\mathbf{x} \sim p_{\text{data}}}[\log D(\mathbf{x})]
+ \E_{\mathbf{z} \sim p(\mathbf{z})}\big[\log\big(1 - D(G(\mathbf{z}))\big)\big].
$$

$D$ 是使用交叉熵损失的二元分类器（[模块 01 第 6 节](module_01_ZH.html#s6)），数据标签为 1，样本标签为 0。$G$ 被训练来让这个分类器失败。训练交替进行：在 $D$ 上走一步，再在 $G$ 上走一步（图 5.7）。

::: figure id=fig-05-7
GAN 训练循环：噪声 $\mathbf{z}$ → $G$ → 伪造样本；来自数据的真实样本；两者都送入 $D$ → “真实”的概率。两条损失箭头：$D$ 的（区分真实与伪造）和 $G$ 的（骗过 $D$），后者标注“非饱和：最大化 $\log D(G(\mathbf{z}))$”。
:::

### 这场博弈优化的是什么

把第二个期望写成对 $\mathbf{x} = G(\mathbf{z})$ 的期望，使两项都成为对 $\mathbf{x}$ 的积分：

$$
V(G, D) = \int \Big[p_{\text{data}}(\mathbf{x}) \log D(\mathbf{x}) + p_g(\mathbf{x}) \log\big(1 - D(\mathbf{x})\big)\Big]\, d\mathbf{x}.
$$

对固定的 $G$，$D$ 可以在每个 $\mathbf{x}$ 处分别选择自己的取值，所以逐点最大化被积函数。记 $a = p_{\text{data}}(\mathbf{x})$，$b = p_g(\mathbf{x})$，则 $h(y) = a\log y + b\log(1 - y)$ 有 $h'(y) = a/y - b/(1 - y)$，它在 $y = a/(a + b)$ 处为零；由于 $h$ 是凹的，这是极大值点。因此

$$
D^*(\mathbf{x}) = \frac{p_{\text{data}}(\mathbf{x})}{p_{\text{data}}(\mathbf{x}) + p_g(\mathbf{x})}.
$$

最优判别器估计的是一个密度比：$D^*/(1 - D^*) = p_{\text{data}}/p_g$。代入它，并记 $p_{\text{data}} + p_g = 2m$，$m$ 为混合分布：

$$
\begin{aligned}
V(G, D^*) &= \E_{p_{\text{data}}}\!\left[\log \frac{p_{\text{data}}}{2m}\right] + \E_{p_g}\!\left[\log \frac{p_g}{2m}\right]
= D_{\KL}(p_{\text{data}} \,\|\, m) + D_{\KL}(p_g \,\|\, m) - \log 4 \\
&= -\log 4 + 2\,\mathrm{JSD}(p_{\text{data}} \,\|\, p_g),
\end{aligned}
$$

其中 **Jensen–Shannon 散度**（Jensen–Shannon divergence，JSD）为 $\mathrm{JSD}(p \,\|\, q) = \tfrac12 D_{\KL}(p \,\|\, m) + \tfrac12 D_{\KL}(q \,\|\, m)$。它仅当两个分布相等时为零，所以面对一个完美的判别器，生成器最小化的是 JSD，而博弈的值 $-\log 4$ 恰好在 $p_g = p_{\text{data}}$ 时达到。

::: worked title="三个点上的最优判别器"
设在三个点上 $p_{\text{data}} = (0.5, 0.5, 0)$，$p_g = (0, 0.5, 0.5)$。则 $D^* = \big(0.5/0.5,\ 0.5/1,\ 0/0.5\big) = (1, 0.5, 0)$，并且

$$
V = \underbrace{0.5\log 1 + 0.5\log 0.5}_{\text{数据}} + \underbrace{0.5\log 0.5 + 0.5\log 1}_{\text{生成器}} = -0.6931.
$$

用 JSD 验算：$m = (0.25, 0.5, 0.25)$；$D_{\KL}(p_{\text{data}} \,\|\, m) = 0.5\log 2 + 0.5\log 1 = 0.3466$，$p_g$ 的也一样，所以 $\mathrm{JSD} = 0.3466$，而 $-1.3863 + 2 \times 0.3466 = -0.6931$。

当 $p_g = p_{\text{data}}$ 时，$D^*$ 处处为 $1/2$，$V = -\log 4 = -1.3863$，即最小值。当两者不相交，$p_{\text{data}} = (1, 0)$、$p_g = (0, 1)$ 时，$D^* = (1, 0)$，$V = 0$，$\mathrm{JSD} = \log 2 = 0.6931$，即 JSD 的最大值。
:::

### 饱和与非饱和损失

上面的分析假设 $D$ 是最优的，但训练是一串梯度步，而原始的生成器损失给出的梯度步很差。训练早期样本很差，$D$ 轻易地拒绝它们，$D(G(\mathbf{z})) = \sigma(a)$ 接近 0。生成器最小化 $\log(1 - \sigma(a))$，它对 logit 的导数是 $-\sigma(a)$：接近 0，恰恰是在生成器最需要信号的时候。**非饱和**（non-saturating）损失改为让生成器最小化 $-\log D(G(\mathbf{z}))$，其导数为 $-(1 - \sigma(a))$，在同一处接近 $-1$。两种损失都靠骗过 $D$ 来最小化，所以不动点相同；不同的是动力学。

::: worked title="用数字看饱和"
在 $D(G(\mathbf{z})) = 0.01$ 处，logit 为 $a = \log(0.01/0.99) = -4.60$。

$$
\frac{d}{da}\log\big(1 - \sigma(a)\big) = -\sigma(a) = -0.01,
\qquad
\frac{d}{da}\big[-\log\sigma(a)\big] = -\big(1 - \sigma(a)\big) = -0.99.
$$

非饱和损失在生成器最需要梯度的时刻，给它一个大 99 倍的梯度。
:::

### 模式坍塌

损失中没有任何东西奖励覆盖整个 $p_{\text{data}}$。一个把许多 $\mathbf{z}$ 映射到当前 $D$ 所接受的少数几个输出上的生成器，按损失来看表现良好。随后 $D$ 适应过来，学会拒绝这些输出，$G$ 又跳到其他模式上：两者互相追逐，而不是收敛。Metz 等人（2017）在由八个高斯分布组成的一个环上展示了这一点，标准 GAN 在那里一个接一个地访问各个模式。这就是**模式坍塌**（mode collapse，图 5.9）。损失揭示不了它，查看单个样本也不行，因为每个样本单独看都令人信服。要用多样性度量来诊断它：覆盖了多少已知模式、留出数据点到其最近样本的距离，以及样本相对于数据的精确率和召回率。

::: figure id=fig-05-9
模式坍塌，示意图而非数据（仿照 Metz 等人 2017）：由八个高斯模式组成的一个环。四个训练快照中的 GAN 样本落在一两个模式上，而这些模式在不同快照之间变化。旁边，扩散模型的样本覆盖了全部八个模式。
:::

### 不相交的支撑集与 Wasserstein 距离

真实数据（例如图像）位于一个巨大空间中某些低维集合的附近，训练早期生成器的样本也是如此。两个这样的集合通常不重叠。此时 $m$ 在两者各自的支撑集上都等于它的一半，两者的 $D_{\KL}(p \,\|\, m)$ 都是 $\log 2$，无论两个分布相距多远，JSD 都是 $\log 2$。一个在每次微小移动下都保持不变的散度，不给生成器任何方向。

**Wasserstein-1 距离**，即**推土机距离**（earth mover's distance），度量概率质量必须移动多远：

$$
W(p, q) = \inf_{\gamma \in \Pi(p, q)} \E_{(\mathbf{x}, \mathbf{y}) \sim \gamma}\,\|\mathbf{x} - \mathbf{y}\|,
$$

其中 $\Pi(p, q)$ 是边缘分布为 $p$ 和 $q$ 的联合分布（耦合）的集合。对耦合取下确界无法直接计算，但 Kantorovich–Rubinstein 对偶把它变成一个对函数的优化：$W(p, q) = \sup_{\|f\|_L \le 1} \E_p[f] - \E_q[f]$，即对 1-Lipschitz 函数 $f$ 取上确界。**Wasserstein GAN**（Arjovsky、Chintala 和 Bottou 2017）训练一个网络 $f$，即评论器（critic），去达到这个上确界，并训练生成器去减小它。难点在于保持 $f$ 的 Lipschitz 性。WGAN 把评论器的权重裁剪到一个小方框内，这样做有效，但限制了评论器。WGAN-GP（Gulrajani 等人 2017）在数据与样本之间的随机插值点 $\hat{\mathbf{x}}$ 处加入惩罚 $\lambda\,\E\big[(\|\nabla f(\hat{\mathbf{x}})\| - 1)^2\big]$。谱归一化（spectral normalisation，Miyato 等人 2018）把每层的权重除以其最大奇异值，把每层的 Lipschitz 常数限制在 1 以内，是另一种常用的稳定手段。

::: worked title="两个点质量"
设 $p_{\text{data}}$ 是 0 处的点质量，$p_g$ 是 $\theta$ 处的点质量。对每个 $\theta \ne 0$，两个支撑集都不相交，所以 $\mathrm{JSD} = \log 2 = 0.693$，它对 $\theta$ 的导数为零。唯一的耦合把全部质量从 $\theta$ 移到 0，所以 $W = |\theta|$，导数为 $\operatorname{sign}(\theta)$：无论相距多远，它都把生成器指回原点。
:::

### GAN 的现状

GAN 生成了第一批照片级逼真的图像，至今仍是最快的生成器，每个样本只需一次前向传播。不过，截至 2026 年，扩散模型（[第 5 节](#s5)）已在大多数新的图像生成任务中取代了它们；这一转变大约始于 2021 年，当时 Dhariwal 和 Nichol 报告扩散模型在图像合成上击败了 GAN。扩散模型的胜出有四个原因：它作为一个稳定的回归来训练，只有一个网络和一个损失；它能覆盖各个模式，因为它的目标是一个会惩罚遗漏数据的似然下界；它很容易以文本、类别或图像为条件；它能扩展到大模型和大数据集。对抗损失作为一个附加项保留了下来：在图像和音频编解码器中，在潜在扩散的自编码器中（Rombach 等人用一个基于图像块的对抗项训练它，以保持清晰），以及在把扩散模型蒸馏到只需几步时。

在工程中，GAN 曾被用作探索设计空间的快速采样器，用于数据增强，以及对仿真得到的场做超分辨率。在信任它们的样本之前，先检查覆盖度：只生成常见设计的生成器看起来会非常出色，却会漏掉那些真正要紧的罕见设计。

::: check
在 $p_{\text{data}} = 0.3$、$p_g = 0.1$ 的点上，$D^*$ 是多少？
:::

::: answer
$D^* = 0.3/(0.3 + 0.1) = 0.75$。等价地，$D^*/(1 - D^*) = 3$，即密度比 $p_{\text{data}}/p_g$。
:::

::: check
当 $p_{\text{data}}$ 和 $p_g$ 位于不相交的支撑集上时，为什么 Jensen–Shannon 散度不给生成器任何方向？Wasserstein-1 距离又是怎样做的？
:::

::: answer
对任意两个支撑集不相交的分布，无论它们相距多远，JSD 都等于 $\log 2$，所以 $p_g$ 的微小移动不会改变它，它的梯度为零。Wasserstein-1 距离随质量必须移动的距离而增长（两个点质量时为 $|\theta|$），所以它的梯度把 $p_g$ 指向 $p_{\text{data}}$。
:::
