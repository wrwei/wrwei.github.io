## 学习问题 {#s1}

工程师心里有一个函数，却写不出它的表达式。脚手架的下垂量是材料和几何形状的函数，求解器可以算出来，但这个求解器花了一个人一年才造好。某个危险是否可控的概率是情境的函数，根本无法计算，只能由人来估计。**机器学习**（machine learning）就是在示例比理论更便宜的时候，从输入输出的示例中得到这样一个函数的做法。

形式化地说，存在一个未知函数 $f^\ast$，以及输入输出对 $(\mathbf{x}, y)$ 上的数据分布 $P$，其中输入 $\mathbf{x} \in \R^d$。函数 $f^\ast$ 是由 $\mathbf{x}$ 预测 $y$ 的最佳可能预测；输出会围绕它散开，因为输入并不能完全决定输出。我们看到一个从 $P$ 中抽取的样本 $\mathcal{D} = \{(\mathbf{x}_i, y_i)\}_{i=1}^{N}$，希望得到一个函数 $f$，使它在**没见过的输入上**也能很好地由 $\mathbf{x}$ 预测 $y$。最后这半句就是整个学科的核心。只会预测已有的示例，那不过是一张查找表。

### 期望风险与经验风险

**损失**（loss）$\ell(f(\mathbf{x}), y) \ge 0$ 衡量一次预测错得有多厉害，例如平方误差 $(f(\mathbf{x}) - y)^2$。我们希望变小的是**期望风险**（expected risk），即在输入将来自的分布上的平均损失：

$$
R(f) = \E_{(\mathbf{x},y)\sim P}\big[\ell(f(\mathbf{x}), y)\big].
$$

由于 $P$ 未知，它无法计算。能够计算的是：对于参数为 $\theta$ 的模型 $f_\theta$，**经验风险**（empirical risk），即样本上的平均损失：

$$
\mathcal{L}(\theta) = \frac{1}{N}\sum_{i=1}^{N} \ell\big(f_\theta(\mathbf{x}_i), y_i\big).
$$

对于在抽样之前就固定的参数，$\mathcal{L}(\theta)$ 是 $R(f_\theta)$ 的无偏估计：每一项的期望都是 $R(f_\theta)$。拟合会破坏这一性质。优化器选择 $\hat\theta$，使 $\mathcal{L}$ 在这 $N$ 个示例上变小，噪声也一并拟合进去，所以 $\hat\theta$ 处的训练损失是**偏低的**。对于能找到最小值的优化器，论证分三步。把 $R(f_\theta)$ 记作 $R(\theta)$，并令 $\theta^\circ$ 在模型族上使它最小。那么对每个样本都有 $\mathcal{L}(\hat\theta) \le \mathcal{L}(\theta^\circ)$，因为 $\hat\theta$ 使 $\mathcal{L}$ 最小；又有 $\E[\mathcal{L}(\theta^\circ)] = R(\theta^\circ)$，因为 $\theta^\circ$ 不依赖于样本；还有 $R(\theta^\circ) \le R(\hat\theta)$，因为 $\theta^\circ$ 是最优的。串起来：

$$
\E\big[\mathcal{L}(\hat\theta)\big] \;\le\; R(\theta^\circ) \;\le\; \E\big[R(\hat\theta)\big].
$$

训练损失与期望风险之间的差距，是[第 8 节](#s8)的主题，该节度量这一差距如何随模型的灵活性增长；也是[第 10 节](#s10)的主题，该节讲如何估计期望风险而不自欺欺人。

### 三种设定

- **监督学习**（supervised learning）。每个示例都给出了 $y$：$y$ 连续时是**回归**（regression），$y$ 取 $K$ 个标签之一时是**分类**（classification）。本系列的大部分内容属于这一类。
- **无监督学习**（unsupervised learning）。没有 $y$。任务是发现结构：聚类、低维坐标、密度。k 均值和主成分分析出现在[第 11 节](#s11)；它们的神经网络形式见[模块 05](module_05_ZH.html)。
- **强化学习**（reinforcement learning）。同样没有 $y$，但在动作之后会收到奖励。[模块 09](module_09_ZH.html)用它来训练语言模型。

### 五个要素

从一条直线到一个语言模型，每一种学习方法都由五项选择确定。遇到任何方法，都把这五项写下来；无法这样陈述的方法，就是你还没有理解的方法。

1. **数据。** $\mathcal{D}$，以及它所来自的分布 $P$。第二项是人们最容易忘记的。学到的一切都是关于 $P$ 的，所以模型的好坏，只取决于 $P$ 与它在使用中遇到的输入之间的匹配程度。
2. **模型。** 以参数 $\theta$ 为索引的一族函数 $f_\theta$，也称**假设类**（hypothesis class）。它决定了究竟能学到什么：直线有两个参数，永远只能是直线；语言模型有数十亿个参数。
3. **损失。** $\ell \ge 0$ 及其在数据上的平均，即经验风险 $\mathcal{L}(\theta)$。它决定哪些错误算数、算多少；[第 5 节](#s5)会说明，它同时也陈述了对噪声的一个假设。
4. **优化器。** 找到使 $\mathcal{L}$ 变小的 $\theta$ 的过程，几乎总是梯度下降的某个变体（[第 3 节](#s3)和[第 4 节](#s4)）。它决定损失所要求的 $\theta$ 是否真能找到，以及代价多大。
5. **评估。** 衡量 $f_\theta$ 在未参与拟合的数据上表现如何：这是对 $R$ 的估计，而不是在 $\mathcal{D}$ 上的损失，后者已经被优化器最小化过了。

::: worked title="取值范围两端的五个要素"
| 要素 | 本模块的线性回归 | 模块 07–10 的语言模型 |
|---|---|---|
| 数据 | 200 行，3 个特征；标准差为 0.1 的高斯噪声 | 万亿级 token 的文本 |
| 模型 | $\mathbf{w}^\top\mathbf{x} + b$：4 个参数 | 一个 Transformer：约 95 亿个参数 |
| 损失 | 平方误差 | 每个位置上对词表的交叉熵 |
| 优化器 | 正规方程，或梯度下降 | AdamW |
| 评估 | 留出行上的 RMSE | 留出数据上的困惑度和任务基准 |

五个位置完全相同。参数量相差 $9.5\times10^{9}/4 \approx 2.4\times10^{9}$ 倍，超过九个数量级。这个语言模型是模块 07–10 所跟随的假想案例研究；在那之前不需要了解它的任何内容。
:::

::: worked title="第 12 节的水凝胶拟合，放进同一张表"
| 要素 | 对一次压缩试验的新胡克拟合 |
|---|---|
| 数据 | 来自一次试验的 16 个三元组（拉伸比、应力、记录的不确定度）；分布是以这种方式试验的这种凝胶的试样 |
| 模型 | 拉伸比 $\lambda$ 下的名义应力 $P = 2c_1(\lambda - \lambda^{-2})$：一个参数 $c_1$ |
| 损失 | 以 $1/\sigma_i^2$ 加权的平方误差，即每个点不确定度的平方的倒数 |
| 优化器 | 闭式解 |
| 评估 | 在拟合时留出的应变范围上的残差 |

符号 $P$ 和 $\lambda$ 只在本例和第 12 节中具有这些含义。第 12 节的主要问题就在评估这一栏：拟合应变范围内的残差可以检查，而范围之外的预测是外推，范围内的任何残差都无法为它担保。
:::

### 输入是数

模型看到的是一个**特征输入向量**（feature vector）$\mathbf{x} \in \R^d$。测得的量本身就是数；类别则不是，例如材料牌号、供应商或缺陷类型。把 $K$ 类的类别编码成**独热编码**（one-hot）：$K$ 个二值列，观测到的类别所在列为 1，其余为 0。绝不要把它编码成整数 $1, \dots, K$：线性模型会把类别当作一个量，这就强加了顺序，并且相邻编码之间间距相等。例外是真正的有序量表，例如从轻微到严重的严重程度，其顺序是真实的；即便如此，整数编码也假设各级之间等距，这是需要检验的建模选择，而不是事实。

独热编码也能解释学到的表示。独热行向量 $\mathbf{e}_k^\top$ 乘以一张可训练的 $K \times m$ 表，取出的是表的第 $k$ 行，所以**嵌入**（embedding）就是随模型其余部分一起学习的这样一张表，它对任何类别特征（零件编号、供应商、传感器 ID）的作用方式，与对语言模型的 token 相同。[模块 06 第 4 节](module_06_ZH.html#s4)展示了 token 嵌入如何进入 Transformer 的残差流，[模块 06 第 11 节](module_06_ZH.html#s11)则统计了它的 $V \times d$ 表的大小。

### 贯穿全模块的示例

本模块反复出现四个示例，使每个新概念都落在已经熟悉的东西上：

- 一个合成的线性回归，$N = 200$ 行、$d = 3$ 个特征（[第 2–4 节](#s2)，[实验 1](#lab1)）；
- 带噪声的 $\sin(2\pi x)$ 样本，用多项式拟合（[第 8–9 节](#s8)，[实验 3](#lab3)）；
- 在 scikit-learn 自带的数据集上，把乳腺肿瘤分为恶性或良性的分类器（[第 6–7 节](#s6)，[实验 2](#lab2)和[实验 4](#lab4)）；
- 拟合软水凝胶压缩试验的超弹性材料模型（[第 5 节](#s5)和[第 12 节](#s12)，[实验 5](#lab5)）。

::: check
为什么训练损失不能衡量模型有多好？
:::

::: answer
优化器正是在这些示例上选择 $\theta$ 使它变小，噪声也包括在内，所以它是偏低的。只有未参与拟合的数据，才能无偏地估计期望风险。
:::

::: check
缺陷严重程度 {轻微, 一般, 严重} 在线性模型中被编码为 1、2、3。这假设了什么，什么时候可以接受？
:::

::: answer
它假设了顺序（这里的顺序是真实的）和等距：“一般”的效应恰好位于“轻微”和“严重”的效应正中间。只有在等距合理，或验证数据支持等距时，才保留整数编码；否则用独热编码，它不保留顺序，也不假设间距。（[练习 2](#e2)讨论无序的情形。）
:::

## 最小二乘及其几何 {#s2}

线性回归是能涉及全部五个要素的最简单的模型，也是本模块中唯一一个其所有性质都能精确计算的模型。本节用闭式解来拟合它，把结果解读为一个投影，并说明问题何时是病态的，以及如何稳定地计算答案。

### 设定

令 $f(\mathbf{x}) = \mathbf{w}^\top\mathbf{x} + b$。给每个输入追加一个常数 1，把截距 $b$ 吸收进去，于是 $f(\mathbf{x}) = \mathbf{w}^\top\mathbf{x}$，其中 $\mathbf{w} \in \R^{d+1}$，$b$ 是它的最后一个分量。把输入堆叠为 $\mathbf{X} \in \R^{N\times(d+1)}$ 的各行，其最后一列全为 1，把输出堆叠为 $\mathbf{y} \in \R^N$。损失是均方误差：

$$
\mathcal{L}(\mathbf{w}) = \frac{1}{N}\sum_{i=1}^{N}\big(\mathbf{w}^\top\mathbf{x}_i - y_i\big)^2
= \frac{1}{N}\|\mathbf{X}\mathbf{w} - \mathbf{y}\|^2.
$$

[第 5 节](#s5)会说明为什么噪声为高斯时平方误差是正确的损失；这里先把它当作已知。

### 梯度的推导

把范数的平方展开为内积：

$$
\|\mathbf{X}\mathbf{w} - \mathbf{y}\|^2 = (\mathbf{X}\mathbf{w} - \mathbf{y})^\top(\mathbf{X}\mathbf{w} - \mathbf{y})
= \mathbf{w}^\top\mathbf{X}^\top\mathbf{X}\mathbf{w} - 2\,\mathbf{y}^\top\mathbf{X}\mathbf{w} + \mathbf{y}^\top\mathbf{y}.
$$

两个交叉项 $\mathbf{w}^\top\mathbf{X}^\top\mathbf{y}$ 和 $\mathbf{y}^\top\mathbf{X}\mathbf{w}$ 是同一个标量，互为转置，系数 2 由此而来。两个恒等式可以对各项求导。对于对称矩阵 $\mathbf{A}$，有 $\nabla_{\mathbf{w}}(\mathbf{w}^\top\mathbf{A}\mathbf{w}) = 2\mathbf{A}\mathbf{w}$：把求和写开，$\partial_{w_k}\sum_{j,l}w_jA_{jl}w_l = \sum_l A_{kl}w_l + \sum_j w_jA_{jk} = 2(\mathbf{A}\mathbf{w})_k$，最后一步用到对称性。对于常向量 $\mathbf{c}$，有 $\nabla_{\mathbf{w}}(\mathbf{c}^\top\mathbf{w}) = \mathbf{c}$。取 $\mathbf{A} = \mathbf{X}^\top\mathbf{X}$，$\mathbf{c} = \mathbf{X}^\top\mathbf{y}$，则

$$
\nabla_{\mathbf{w}}\mathcal{L} = \frac{1}{N}\big(2\mathbf{X}^\top\mathbf{X}\mathbf{w} - 2\mathbf{X}^\top\mathbf{y}\big)
= \frac{2}{N}\mathbf{X}^\top(\mathbf{X}\mathbf{w} - \mathbf{y}).
$$

梯度就是残差向量 $\mathbf{X}\mathbf{w} - \mathbf{y}$ 经 $\mathbf{X}^\top$ 映射回参数空间。再求一次导，得到海森矩阵（Hessian）$\frac{2}{N}\mathbf{X}^\top\mathbf{X}$，它在每个 $\mathbf{w}$ 处都相同。它是半正定的，因为对每个 $\mathbf{v}$ 都有 $\mathbf{v}^\top\mathbf{X}^\top\mathbf{X}\mathbf{v} = \|\mathbf{X}\mathbf{v}\|^2 \ge 0$。所以 $\mathcal{L}$ 是凸二次函数，梯度为零的每个点都是全局最小值。

### 正规方程

令梯度为零，得到**正规方程**（normal equations）

$$
\mathbf{X}^\top\mathbf{X}\,\mathbf{w} = \mathbf{X}^\top\mathbf{y}.
$$

若 $\mathbf{X}$ 列满秩，即它的 $d + 1$ 列线性无关，则对每个 $\mathbf{v} \ne \mathbf{0}$ 都有 $\|\mathbf{X}\mathbf{v}\|^2 > 0$，所以 $\mathbf{X}^\top\mathbf{X}$ 正定且可逆，最小值点唯一：

$$
\mathbf{w}^\ast = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}.
$$

列满秩要求至少有 $d + 1$ 个线性无关的行：示例数不能少于参数数。这个公式是用来读的；如何计算 $\mathbf{w}^\ast$ 见下文。

### 几何：正交投影

随着 $\mathbf{w}$ 变化，$\mathbf{X}\mathbf{w}$ 是 $\mathbf{X}$ 各列的线性组合，扫出 $\mathbf{X}$ 的**列空间**（column space），即 $\R^N$ 中一个 $d + 1$ 维的子空间。最小二乘选取该子空间中离 $\mathbf{y}$ 最近的点。记残差 $\mathbf{r} = \mathbf{y} - \mathbf{X}\mathbf{w}^\ast$，正规方程可以写成

$$
\mathbf{X}^\top\mathbf{r} = \mathbf{0}：
$$

$\mathbf{X}$ 的每一列与残差的内积都为零。残差垂直于（即“正规于”）列空间，这就是这组方程名称的由来，而 $\hat{\mathbf{y}} = \mathbf{X}\mathbf{w}^\ast$ 就是 $\mathbf{y}$ 在列空间上的**正交投影**（orthogonal projection）：从 $\mathbf{y}$ 向子空间作垂线的垂足，也就是最近点（图 1.2）。

::: figure id=fig-01-2
把最小二乘画成三维空间中的投影。过原点的一个平面，由两个列向量 $\mathbf{x}_{(1)}$ 和 $\mathbf{x}_{(2)}$ 张成，是 $\mathbf{X}$ 的列空间。数据向量 $\mathbf{y}$ 高出平面；它在平面内的垂足是 $\hat{\mathbf{y}} = \mathbf{X}\mathbf{w}^\ast$；残差 $\mathbf{r} = \mathbf{y} - \hat{\mathbf{y}}$ 是一条虚线段，与平面成直角相交。$\mathbf{X}^\top\mathbf{r} = \mathbf{0}$ 就是正规方程。
:::

这个投影是线性的：$\hat{\mathbf{y}} = \mathbf{P}\mathbf{y}$，其中

$$
\mathbf{P} = \mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top,
$$

即**帽子矩阵**（hat matrix），因为它给 $\mathbf{y}$ 戴上了“帽子”。（统计学教材把它写作 $\mathbf{H}$；本模块把 $\mathbf{H}$ 留给海森矩阵。）它是对称的，并且**幂等**（idempotent），
$\mathbf{P}^2 = \mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}(\mathbf{X}^\top\mathbf{X})(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top = \mathbf{P}$：投影两次不改变任何东西。它的迹等于它所投影到的空间的维数。利用 $\operatorname{tr}(\mathbf{A}\mathbf{B}) = \operatorname{tr}(\mathbf{B}\mathbf{A})$，
$\operatorname{tr}\mathbf{P} = \operatorname{tr}\big((\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{X}\big) = \operatorname{tr}\mathbf{I}_{d+1} = d + 1$，即被拟合的参数个数。[第 9 节](#s9)把这个计数变成岭回归的有效自由度。

当 $\mathbf{X}$ 包含全 1 的列时，有两个推论。$\mathbf{X}^\top\mathbf{r} = \mathbf{0}$ 中对应该列的那一行写作 $\sum_i r_i = 0$：残差之和为零，$\hat{\mathbf{y}}$ 与 $\mathbf{y}$ 有相同的均值 $\bar y$。又因为 $\bar y\mathbf{1}$ 也位于列空间内，$\mathbf{y} - \bar y\mathbf{1} = (\hat{\mathbf{y}} - \bar y\mathbf{1}) + \mathbf{r}$ 把中心化后的数据分成位于列空间内的一部分和垂直于它的一部分。由勾股定理，

$$
\underbrace{\|\mathbf{y} - \bar y\mathbf{1}\|^2}_{\text{TSS}}
= \underbrace{\|\hat{\mathbf{y}} - \bar y\mathbf{1}\|^2}_{\text{ESS}}
+ \underbrace{\|\mathbf{r}\|^2}_{\text{RSS}}：
$$

总平方和等于解释平方和加残差平方和。由此定义**决定系数**（coefficient of determination）

$$
R^2 = 1 - \frac{\text{RSS}}{\text{TSS}} = \frac{\text{ESS}}{\text{TSS}},
$$

即拟合所解释的 $\mathbf{y}$ 关于其均值的方差所占的比例；在训练数据上它介于 0 和 1 之间。处处预测均值，是只有截距的模型，所以 $R^2$ 把拟合与这条基线作比较。[第 7 节](#s7)在留出数据上使用 $R^2$，那里这个恒等式不再成立，$R^2$ 可以为负。

::: worked title="手算四个点"
用 $y = b + wx$ 拟合 $x = (0, 1, 2, 3)$、$y = (1, 3, 2, 5)$。$\mathbf{X}$ 的各行是 $(1, x_i)$，所以

$$
\mathbf{X}^\top\mathbf{X} = \begin{bmatrix} N & \sum x_i \\ \sum x_i & \sum x_i^2 \end{bmatrix}
= \begin{bmatrix} 4 & 6 \\ 6 & 14 \end{bmatrix}, \qquad
\mathbf{X}^\top\mathbf{y} = \begin{bmatrix} \sum y_i \\ \sum x_iy_i \end{bmatrix}
= \begin{bmatrix} 11 \\ 22 \end{bmatrix},
$$

其中 $\sum x_iy_i = 0 + 3 + 4 + 15 = 22$。行列式为 $4\cdot14 - 6\cdot6 = 20$，由克莱默法则（Cramer's rule）得

$$
b = \frac{14\cdot11 - 6\cdot22}{20} = \frac{22}{20} = 1.1, \qquad
w = \frac{4\cdot22 - 6\cdot11}{20} = \frac{22}{20} = 1.1.
$$

拟合值为 $\hat{\mathbf{y}} = (1.1, 2.2, 3.3, 4.4)$，残差为 $\mathbf{r} = (-0.1, 0.8, -1.3, 0.6)$。检验正规方程：$\sum r_i = -0.1 + 0.8 - 1.3 + 0.6 = 0$，$\sum x_ir_i = 0 + 0.8 - 2.6 + 1.8 = 0$，两者都精确成立。各平方和为 RSS $= 0.01 + 0.64 + 1.69 + 0.36 = 2.70$；由 $\bar y = 2.75$，TSS $= 1.75^2 + 0.25^2 + 0.75^2 + 2.25^2 = 8.75$；ESS $= 1.65^2 + 0.55^2 + 0.55^2 + 1.65^2 = 6.05$，于是 $6.05 + 2.70 = 8.75$，正如勾股定理所要求。因此 $R^2 = 1 - 2.70/8.75 = 0.691$。帽子矩阵的对角线为 $(0.7, 0.3, 0.3, 0.7)$，迹为 2，等于参数个数。
:::

### 当各列相关时

若 $\mathbf{X}$ 的某一列是其他列的线性组合，就存在 $\mathbf{v} \ne \mathbf{0}$ 使 $\mathbf{X}\mathbf{v} = \mathbf{0}$；于是 $\mathbf{X}^\top\mathbf{X}\mathbf{v} = \mathbf{0}$，$\mathbf{X}^\top\mathbf{X}$ 是奇异的。实践中有两种情形：以 °C 计的温度旁边又放了同一温度的 °F 值，并且带有截距，因为 $T_{\text{F}} = 1.8\,T_{\text{C}} + 32$ 使 °F 列成为 °C 列与全 1 列的组合；以及一个类别的全部 $K$ 个独热列与截距并存，因为这 $K$ 列之和等于全 1 列。此时每个 $\mathbf{w}^\ast + t\mathbf{v}$ 的拟合效果都一样好。投影 $\hat{\mathbf{y}}$ 仍然唯一，训练输入处的预测以及任何服从同一相关关系的新输入处的预测也唯一；权重则不唯一。**伪逆**（pseudo-inverse）解 $\mathbf{X}^{+}\mathbf{y}$ 在所有最小值点中取范数最小的那个，`np.linalg.lstsq` 返回的就是它。[第 9 节](#s9)的岭惩罚同样能消除这种歧义。两者都不会使相关列各自的权重变得有意义。

::: worked title="重复的一列"
给这四个点追加一列 $2x$，于是 $\mathbf{X}$ 的各行是 $(1, x_i, 2x_i)$，

$$
\mathbf{X}^\top\mathbf{X} = \begin{bmatrix} 4 & 6 & 12 \\ 6 & 14 & 28 \\ 12 & 28 & 56 \end{bmatrix},
$$

它的第三行是第二行的两倍：行列式为 0。用 $a$ 和 $c$ 表示 $x$ 和 $2x$ 上的权重。拟合为 $b + (a + 2c)x$，所以只要 $b = 1.1$ 且 $a + 2c = 1.1$，每种选择都会重现上一例中的直线，预测值为 $(1.1, 2.2, 3.3, 4.4)$。范数最小的选择，是直线 $a + 2c = 1.1$ 上离原点最近的点，它位于该直线的法向 $(1, 2)$ 上：$(a, c) = 1.1\cdot(1, 2)/(1^2 + 2^2) = (0.22, 0.44)$。`np.linalg.lstsq` 返回 $(b, a, c) = (1.1, 0.22, 0.44)$，并报告秩为 2。
:::

### 如何计算

绝不要显式形成 $(\mathbf{X}^\top\mathbf{X})^{-1}$；要去解方程。**条件数**（condition number）$\kappa(\mathbf{X})$ 是 $\mathbf{X}$ 最大奇异值与最小奇异值之比，它给出舍入误差最多会被放大多少：双精度有 16 位有效数字，一次求解大约会损失 $\log_{10}\kappa$ 位。三种方法，稳健性依次递增：

- **对 $\mathbf{X}^\top\mathbf{X}$ 做 Cholesky 分解。** 分解 $\mathbf{X}^\top\mathbf{X} = \mathbf{L}\mathbf{L}^\top$，其中 $\mathbf{L}$ 为下三角矩阵，再解两个三角方程组。它最快，但形成 $\mathbf{X}^\top\mathbf{X}$ 会使条件数平方，$\kappa(\mathbf{X}^\top\mathbf{X}) = \kappa(\mathbf{X})^2$，因为 $\mathbf{X}^\top\mathbf{X}$ 的特征值是 $\mathbf{X}$ 的奇异值的平方。当 $\kappa(\mathbf{X}) = 10^6$ 时，这意味着最多损失 12 位而不是 6 位。
- **对 $\mathbf{X}$ 做 QR 分解。** 写 $\mathbf{X} = \mathbf{Q}\mathbf{R}$，其中 $\mathbf{Q}$ 的各列标准正交，$\mathbf{R}$ 为上三角矩阵。由于 $\mathbf{Q}^\top\mathbf{Q} = \mathbf{I}$，正规方程化为 $\mathbf{R}^\top\mathbf{R}\mathbf{w} = \mathbf{R}^\top\mathbf{Q}^\top\mathbf{y}$，即 $\mathbf{R}\mathbf{w} = \mathbf{Q}^\top\mathbf{y}$，用回代法求解。这种方法直接处理 $\mathbf{X}$ 本身，从不使 $\kappa$ 平方。
- **奇异值分解（SVD）。** $\mathbf{X} = \mathbf{U}\boldsymbol{\Sigma}\mathbf{V}^\top$ 给出 $\mathbf{w} = \mathbf{V}\boldsymbol{\Sigma}^{-1}\mathbf{U}^\top\mathbf{y}$。$\boldsymbol{\Sigma}$ 对角线上的奇异值直观显示了条件状况，而只对非零奇异值求逆，就得到秩亏情形下的最小范数解。

`np.linalg.lstsq` 使用基于 SVD 的 LAPACK 驱动程序，是默认应当选用的方法。形成 $\mathbf{X}^\top\mathbf{X}$ 或分解 $\mathbf{X}$，每种方法的代价都约为 $Nd^2$ 次运算，随后的小规模求解再约为 $d^3$ 次。

### 代码，以及不可约误差

下面是用 NumPy 写出的全部内容，数据取自[实验 1](#lab1)：200 个输入，各有三个标准正态特征，真实权重为 $(1.5, -2.0, 0.5)$，截距为 0.7，高斯噪声的标准差为 0.1。下一节的主题是梯度下降，这里也放进来作比较。

```python
import numpy as np

rng = np.random.default_rng(0)
N, d = 200, 3
X = rng.normal(size=(N, d))
w_true = np.array([1.5, -2.0, 0.5]); b_true = 0.7
y = X @ w_true + b_true + 0.1 * rng.normal(size=N)   # noise: the part no model recovers

Xb = np.hstack([X, np.ones((N, 1))])                 # absorb the bias

# closed form
w_closed = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)

# gradient descent
w = np.zeros(d + 1); eta = 0.1
for step in range(500):
    grad = (2 / N) * Xb.T @ (Xb @ w - y)
    w -= eta * grad
print(np.round(w_closed, 3), np.round(w, 3))         # both near [1.5, -2.0, 0.5, 0.7]

# the robust default: an SVD-based solver that never forms Xb.T @ Xb
w_lstsq = np.linalg.lstsq(Xb, y, rcond=None)[0]
rss = np.sum((y - Xb @ w_lstsq) ** 2)               # residual sum of squares
print(np.round(w_lstsq, 3))
print(f"residual RMS {np.sqrt(rss / N):.4f}")
print(f"sqrt(RSS / (N - 4)) {np.sqrt(rss / (N - 4)):.4f}")
```

```output
[ 1.491 -2.01   0.505  0.696] [ 1.491 -2.01   0.505  0.696]
[ 1.491 -2.01   0.505  0.696]
residual RMS 0.1000
sqrt(RSS / (N - 4)) 0.1010
```

::: worked title="代码的输出说明了什么"
正规方程、`lstsq` 以及 $\eta = 0.1$ 下的 500 步梯度下降，在小数点后三位上一致：$(1.491, -2.010, 0.505, 0.696)$，对应真实值 $(1.5, -2.0, 0.5, 0.7)$。与真实值的差异并不是求解器误差，而是这个特定样本的噪声：由于 $\mathbf{X}^\top\mathbf{X} \approx 200\,\mathbf{I}$，每个权重的标准误约为 $0.1/\sqrt{200} = 0.007$，差异正是这个量级。残差 RMS 为 $\sqrt{\text{RSS}/N} = 0.1000$。改为除以 $N - 4$（对应四个被拟合的参数），得到 0.1010，而实际抽取的噪声的 RMS 为 0.1011：噪声水平被还原出来了。残差比噪声略小，是因为拟合用掉了 200 个自由度中的 4 个去追随噪声；[第 5 节](#s5)会推导这一修正。
:::

数据中的项 $0.1\cdot\mathcal{N}(0, 1)$ 就是**不可约误差**（irreducible error）：$\mathbf{x}$ 的任何函数都无法预测它，所以没有任何模型能把新数据上的期望平方误差降到它的方差 0.01 以下。残差 RMS 等于噪声水平，说明已经没有可恢复的东西剩下。训练残差远低于噪声水平的模型，是在拟合噪声，而新数据并不具有这些噪声。这就是[第 8 节](#s8)中心问题的第一次出现。

::: check
为什么叫正规方程？
:::

::: answer
它们表示 $\mathbf{X}^\top(\mathbf{y} - \mathbf{X}\mathbf{w}) = \mathbf{0}$：残差与 $\mathbf{X}$ 的每一列都正规，也就是垂直。
:::

::: check
你在以 °C 计的温度旁边加入以 °F 计的温度，并且带有截距。$\mathbf{X}^\top\mathbf{X}$ 和预测会怎样？
:::

::: answer
$\mathbf{X}^\top\mathbf{X}$ 变得奇异，因为 °F 列等于 1.8 倍的 °C 列加上 32 倍的截距列。权重不再唯一，但投影 $\hat{\mathbf{y}}$，从而预测，保持不变。
:::

::: check
为什么用 QR 或 SVD，而不是用 Cholesky 去解 $\mathbf{X}^\top\mathbf{X}\mathbf{w} = \mathbf{X}^\top\mathbf{y}$？
:::

::: answer
形成 $\mathbf{X}^\top\mathbf{X}$ 会使条件数平方，因舍入而损失的位数大致翻倍；QR 和 SVD 直接处理 $\mathbf{X}$。
:::

## 二次函数上的梯度下降 {#s3}

正规方程一步就解出最小二乘。**梯度下降**（gradient descent）则通过迭代来解它，

$$
\mathbf{w}_{t+1} = \mathbf{w}_t - \eta\,\nabla\mathcal{L}(\mathbf{w}_t),
$$

其中步长 $\eta > 0$ 称为**学习率**（learning rate）。已有闭式解时仍要迭代，有三个理由。代价：求解约需 $Nd^2 + d^3$ 次运算，而一步梯度只需约 $Nd$ 次，即两次矩阵-向量乘法。内存：求解需要同时拿到全部数据，而[第 4 节](#s4)的随机步只需要几行。普适性：[模块 02](module_02_ZH.html)起的所有模型都没有闭式解，训练它们的都是梯度下降。最小二乘是唯一一个能精确推导梯度下降行为的情形，所以在这里推导。经验法则：$d$ 小时调用 `lstsq`；$N$ 或 $d$ 很大，或数据以流的形式到来时，使用[第 4 节](#s4)的随机梯度下降；问题病态时，先对特征重新缩放（见下文）。

### 二次函数的精确分析

记 $\mathbf{H} = \frac{2}{N}\mathbf{X}^\top\mathbf{X}$，即[第 2 节](#s2)的海森矩阵。把 $\mathbf{w} = \mathbf{w}^\ast + \mathbf{e}$ 代入损失并展开：

$$
\begin{aligned}
N\mathcal{L}(\mathbf{w}^\ast + \mathbf{e}) &= \|(\mathbf{X}\mathbf{w}^\ast - \mathbf{y}) + \mathbf{X}\mathbf{e}\|^2 \\
&= \|\mathbf{X}\mathbf{w}^\ast - \mathbf{y}\|^2 + 2\,\mathbf{e}^\top\mathbf{X}^\top(\mathbf{X}\mathbf{w}^\ast - \mathbf{y}) + \mathbf{e}^\top\mathbf{X}^\top\mathbf{X}\mathbf{e}.
\end{aligned}
$$

由正规方程，中间一项为零。除以 $N$，

$$
\mathcal{L}(\mathbf{w}) = \mathcal{L}(\mathbf{w}^\ast) + \tfrac{1}{2}(\mathbf{w} - \mathbf{w}^\ast)^\top\mathbf{H}\,(\mathbf{w} - \mathbf{w}^\ast), \tag{3.1}
$$

其梯度为 $\nabla\mathcal{L}(\mathbf{w}) = \mathbf{H}(\mathbf{w} - \mathbf{w}^\ast)$。损失就是它的最小值加上一个形状由 $\mathbf{H}$ 决定的碗。跟踪误差 $\mathbf{e}_t = \mathbf{w}_t - \mathbf{w}^\ast$：在更新式两边同时减去 $\mathbf{w}^\ast$，得到

$$
\mathbf{e}_{t+1} = \mathbf{e}_t - \eta\mathbf{H}\mathbf{e}_t = (\mathbf{I} - \eta\mathbf{H})\,\mathbf{e}_t,
\qquad\text{于是}\qquad \mathbf{e}_t = (\mathbf{I} - \eta\mathbf{H})^t\,\mathbf{e}_0.
$$

由于 $\mathbf{H}$ 是对称的，它有一组标准正交的特征向量基，$\mathbf{H} = \mathbf{Q}\boldsymbol{\Lambda}\mathbf{Q}^\top$，特征值为 $\lambda_{\min} = \lambda_1 \le \dots \le \lambda_{d+1} = \lambda_{\max}$，全部非负。在旋转后的坐标 $\tilde{\mathbf{e}} = \mathbf{Q}^\top\mathbf{e}$ 下，矩阵 $\mathbf{I} - \eta\mathbf{H}$ 变成对角矩阵 $\mathbf{I} - \eta\boldsymbol{\Lambda}$，每个分量各自独立演化：

$$
\tilde e_{i,t} = (1 - \eta\lambda_i)^t\,\tilde e_{i,0}.
$$

关于二次函数上的学习率，所有该知道的都包含在这一行里了。

### 稳定性

只有当对每个 $i$ 都有 $|1 - \eta\lambda_i| < 1$，即 $0 < \eta\lambda_i < 2$ 时，每个分量才会从任何起点出发都收缩。最陡的方向最先达到限制：

$$
0 < \eta < \frac{2}{\lambda_{\max}}.
$$

随着 $\eta$ 增大，观察最陡方向的因子 $1 - \eta\lambda_{\max}$（图 1.4 在同一个问题上展示了第一、第三和第五种情形）：

- $\eta < 1/\lambda_{\max}$：每个因子都在 0 和 1 之间，每个分量单调收缩，不变号。
- $\eta = 1/\lambda_{\max}$：最陡方向的因子为 0，该分量一步就解决。
- $1/\lambda_{\max} < \eta < 2/\lambda_{\max}$：最陡方向的因子为负，介于 −1 和 0 之间。该分量每一步都变号，所以迭代点在谷中来回之字形穿越，同时收敛。
- $\eta = 2/\lambda_{\max}$：因子为 −1，该分量永远翻转符号，既不增长也不衰减。
- $\eta > 2/\lambda_{\max}$：因子小于 −1，该分量按几何级数增长；损失爆炸。

边界是尖锐的。[实验 1](#lab1) 在 $2/\lambda_{\max}$ 的 0.99 倍和 1.01 倍处各运行 200 步，前者得到的训练 MSE 为 0.0104，后者为 $3.8\times10^3$。

::: figure id=fig-01-4
在 $\kappa = 10$ 的二维二次函数上做梯度下降，其特征向量相对坐标轴旋转了 30°：等高线是围绕最小值点 $\mathbf{w}^\ast$ 的椭圆，坐标轴 $w_1$ 和 $w_2$ 的比例相同。三条路径从同一点出发。$\eta = 0.5/\lambda_{\max}$ 时（陡方向的因子为 0.5，平坦方向为 0.95），路径平滑，沿着谷底缓慢爬行；$\eta = 1.8/\lambda_{\max}$ 时（因子为 −0.8 和 0.82），路径在谷中呈之字形穿越，同时收敛；$\eta = 2.1/\lambda_{\max}$ 时（因子为 −1.1 和 0.79），路径向外弹开并发散。图例给出了每个 $\eta$ 及其两个因子。
:::

### 速度

稳定性由最陡的方向决定；速度则由最平坦的方向决定。误差范数每步至多收缩 $\rho(\eta) = \max_i|1 - \eta\lambda_i|$，即绝对值最大的因子（旋转 $\mathbf{Q}$ 保持范数）。由于 $|1 - \eta\lambda|$ 作为 $\lambda$ 的函数呈 V 形，它在各特征值上的最大值出现在两端之一：$\rho = \max(|1 - \eta\lambda_{\min}|, |1 - \eta\lambda_{\max}|)$。增大 $\eta$ 会使第一项变小，而在超过 $1/\lambda_{\max}$ 之后会使第二项变大。最优的固定步长使两者相等：

$$
1 - \eta\lambda_{\min} = \eta\lambda_{\max} - 1
\;\;\Rightarrow\;\; \eta^\ast = \frac{2}{\lambda_{\max} + \lambda_{\min}},
\qquad \rho^\ast = 1 - \frac{2\lambda_{\min}}{\lambda_{\max} + \lambda_{\min}} = \frac{\kappa - 1}{\kappa + 1},
$$

其中 $\kappa = \lambda_{\max}/\lambda_{\min}$ 是 $\mathbf{H}$ 的**条件数**（对于 $\mathbf{H} \propto \mathbf{X}^\top\mathbf{X}$，按第 2 节的记号它等于 $\kappa(\mathbf{X})^2$）。把误差缩小为原来的 $\epsilon$ 倍，需要 $\rho^t \le \epsilon$，即

$$
t = \frac{\ln(1/\epsilon)}{-\ln\rho} \;\approx\; \frac{\kappa}{2}\,\ln\frac{1}{\epsilon}
\quad\text{当 } \kappa \text{ 很大时},
$$

这里用到 $-\ln\rho^\ast = \ln(1 + 1/\kappa) - \ln(1 - 1/\kappa) \approx 2/\kappa$。由 (3.1)，超额损失是误差的二次函数，所以它按 $\rho^{2t}$ 收缩。即使取最优的固定步长，步数也与 $\kappa$ 成正比增长：这就是病态的代价。[模块 02 第 7 节](module_02_ZH.html#s7)说明动量法如何把它降低到约 $\sqrt{\kappa}$。

::: worked title="对角海森矩阵上的四种步长"
取 $\mathbf{H} = \operatorname{diag}(1, 10)$：$\lambda_{\min} = 1$，$\lambda_{\max} = 10$，$\kappa = 10$，稳定性要求 $\eta < 2/10 = 0.2$。数一数把误差缩小 $10^6$ 倍所需的步数，$t = \ln(10^6)/(-\ln\rho) = 13.82/(-\ln\rho)$，向上取整：

| $\eta$ | 平坦方向因子 $1 - \eta$ | 陡方向因子 $1 - 10\eta$ | $\rho$ | 步数 |
|---|---|---|---|---|
| 0.1 | 0.9 | 0.0 | 0.9 | $13.82/0.1054 = 131.1$，即 132 |
| 0.18 | 0.82 | −0.80 | 0.82 | $13.82/0.1985 = 69.6$，即 70 |
| $2/11 = 0.182$ | 0.818 | −0.818 | 0.818 | $13.82/0.2007 = 68.8$，即 69 |
| 0.21 | 0.79 | −1.10 | 1.10 | 发散 |

在 $\eta = 0.1$ 时，陡方向的分量一步就消失，由平坦方向的分量决定节奏。把 $\eta$ 提高到 0.18，步数几乎减半，代价是之字形振荡。最优值 $\eta^\ast = 2/11$ 再省一步，其 $\rho^\ast = 9/11 = (\kappa - 1)/(\kappa + 1)$。刚刚越过极限，取 0.21 时，陡方向的分量每步被乘以 −1.1，50 步之后已经增长了 $1.1^{50} = 117$ 倍。
:::

### 条件数从何而来

条件数是特征的性质，可以直接从特征中读出。

**单位。** 若特征已中心化且互不相关，标准差为 $s_j$，则 $\frac{1}{N}\mathbf{X}^\top\mathbf{X}$ 是对角矩阵：每个特征对应 $s_j^2$，截距对应 1，因为截距的全 1 列与每个中心化列都正交。于是 $\kappa = (s_{\max}/s_{\min})^2$（前提是截距的 1 介于两个极值之间）。设跨度长度以毫米计，标准差为 1000 mm，旁边是以吉帕计的弹性模量，标准差为 0.001 GPa，即批次间 1 MPa 的离散。两者的标准差相差 $10^6$ 倍，所以 $\kappa = 10^{12}$，即使取最优固定步长，梯度下降也需要约 $(\kappa/2)\ln(10^6) \approx 6.9\times10^{12}$ 次迭代才能多得到六位有效数字。标准化之后 $\kappa \approx 1$。

**偏移。** 没有中心化的特征会与截距耦合。一个均值为 100、标准差为 1 的特征，与全 1 列放在一起，给出

$$
\frac{1}{N}\mathbf{X}^\top\mathbf{X} = \begin{bmatrix} 1 & 100 \\ 100 & 10001 \end{bmatrix},
$$

因为非对角元是该特征的均值，右下角是它的均方，$100^2 + 1^2$。迹为 10002，行列式为 $10001 - 10000 = 1$，所以特征值约为 10002 和 $1/10002 = 1.0\times10^{-4}$，$\kappa \approx 1.0\times10^{8}$，而这只是来自一个尺度并不起眼的特征。当权重和截距一起变动，一个上升而另一个下降 100 倍时，损失几乎不变，这就是一个狭长平坦的山谷。仅仅中心化就能解决：减去均值，矩阵就变成单位矩阵。

**相关。** 两个相关系数为 $r$ 的标准化特征，给出相关矩阵 $\begin{bmatrix} 1 & r \\ r & 1 \end{bmatrix}$，其特征值沿 $(1, 1)$ 为 $1 + r$，沿 $(1, -1)$ 为 $1 - r$，所以 $\kappa = (1 + r)/(1 - r)$：$r = 0.9$ 时为 19，$r = 0.99$ 时为 199。标准化解决的是单位问题，解决不了相关问题。

针对单位和偏移的补救办法是对每个特征做**标准化**（standardisation），$x'_j = (x_j - \mu_j)/s_j$，其中均值 $\mu_j$ 和标准差 $s_j$ 只在训练集上计算，并原样应用于验证数据、测试数据和使用中的输入。若在全部数据上计算它们，留出的行就会影响拟合：这是缩微版的泄漏，[第 10 节](#s10)会一般地讨论。标准化后的模型就是同一个模型换了坐标，所以它的权重可以精确地映射回去：

$$
\sum_j w'_j\,\frac{x_j - \mu_j}{s_j} + b' = \sum_j \frac{w'_j}{s_j}\,x_j + \Big(b' - \sum_j \frac{\mu_jw'_j}{s_j}\Big),
\quad\text{故}\quad w_j = \frac{w'_j}{s_j}, \quad b = b' - \sum_j \frac{\mu_jw'_j}{s_j}.
$$

::: worked title="实验 1 的回归：缩放得当与缩放不当"
对于第 2 节的数据，$\mathbf{H} = \frac{2}{200}\mathbf{X}^\top\mathbf{X}$ 的特征值为 1.711、1.922、2.126 和 2.207。标准正态特征本来就接近标准化，所以 $\kappa = 2.207/1.711 = 1.29$，$\eta_{\max} = 2/2.207 = 0.906$，$\eta^\ast = 2/(2.207 + 1.711) = 0.511$。从零出发做梯度下降，$\eta = 0.1$ 时 76 步使 $\|\mathbf{w} - \mathbf{w}^\ast\|$ 低于 $10^{-6}$，$\eta^\ast$ 时只要 7 步。

现在破坏单位：把第一个特征乘以 1000，仿佛米换成了毫米，并给第二个特征加上 100。条件数变为 $1.0\times10^{10}$；单是缩放就给出 $1.1\times10^{6}$，单是偏移就给出 $1.0\times10^{8}$。最大稳定步长降到 $\eta_{\max} = 9.7\times10^{-7}$。以 $0.9\,\eta_{\max}$ 走了 100,000 步之后，训练 MSE 仍为 4.28，而同样的数据上 `lstsq` 给出 0.0100：梯度下降看上去像是没有学到东西，虽然模型本身毫无问题。用训练集统计量标准化之后，问题的 $\kappa = 1.22$，梯度下降在 $\eta^\ast$ 下 6 步收敛，映射回原始单位的权重等于缩放不当那个问题的 `lstsq` 解。解决办法是变量替换，而不是新算法。
:::

### 超越二次函数

在任何光滑的最小值点附近，损失都近似为二次函数，$\mathbf{H}$ 是它在最小值点处的海森矩阵，所以 $\eta < 2/\lambda_{\max}(\mathbf{H})$ 同样决定[模块 02](module_02_ZH.html)中网络的局部稳定性。对于逻辑回归（[第 6 节](#s6)），曲率随 $\mathbf{w}$ 变化，由最坏情形算出的界是充分而非必要的：在[实验 2](#lab2) 中，损失在超过该界八倍以上的步长下仍然下降。

::: widget name=gd-quadratic
默认设置 $\kappa = 20$、$\eta = 1.8$（以 $1/\lambda_{\max}$ 为单位）时，路径一边沿谷底缓慢爬行，一边在谷中来回穿越，如图 1.4 所示。把 $\eta$ 推到刚好超过 2，就能看到陡方向爆炸；设为 1，陡方向一步就解决，而平坦方向仍在缓慢爬行。然后保持 $\eta = 1.8$，把 $\kappa$ 从 20 提高到 1000：步数从 66 增加到 2,386。带相关特征的预设展示了标准化单位下的一个狭窄山谷。
:::

::: check
当 $\mathbf{H} = \operatorname{diag}(2, 200)$ 时，最大的稳定学习率是多少，哪个坐标限制了速度？
:::

::: answer
$\eta < 2/200 = 0.01$。即使在这个极限上，$\lambda = 2$ 的坐标每步仍保留其误差的 $1 - 0.01\cdot2 = 0.98$，所以由它决定节奏：$\kappa = 100$。
:::

::: check
为什么对特征做标准化，不能解决由特征相关造成的病态？
:::

::: answer
标准化只是分别重新缩放每根坐标轴。相关使椭圆形的等高线沿对角线 $(1, 1)$ 和 $(1, -1)$ 倾斜并拉伸，而相关矩阵的特征值 $1 \pm r$，无论怎样缩放坐标轴，都仍然相距甚远。
:::

::: check
在原始特征上做梯度下降“学不到东西”。说出最先要检查的两件事。
:::

::: answer
中心化和缩放：计算 $\mathbf{X}^\top\mathbf{X}/N$ 的 $\kappa$。然后检查学习率与 $2/\lambda_{\max}$ 的关系。
:::

## 随机梯度下降与小批量梯度下降 {#s4}

经验风险的梯度是对全部 $N$ 个示例的平均，所以精确计算它，每一步都要遍历一遍数据。**随机梯度下降**（stochastic gradient descent，SGD）把它替换成对随机抽取的、含 $B$ 个示例的**mini-batch** $\mathcal{B}$ 的平均：

$$
\theta \leftarrow \theta - \eta\,\mathbf{g}_{\mathcal{B}}, \qquad
\mathbf{g}_{\mathcal{B}} = \frac{1}{B}\sum_{i\in\mathcal{B}}\nabla_\theta\,\ell_i(\theta),
$$

其中 $\ell_i(\theta) = \ell(f_\theta(\mathbf{x}_i), y_i)$。$B = N$ 就是[第 3 节](#s3)的全 batch 梯度下降；$B = 1$ 是 SGD 的原始形式。

### 无偏，方差按 1/B 下降

从 $1, \dots, N$ 中独立、均匀地（有放回地）抽取 $B$ 个下标。于是每个被抽中的梯度 $\nabla\ell_{i_k}$ 都是一个随机向量，均值为 $\frac{1}{N}\sum_i\nabla\ell_i = \nabla\mathcal{L}$，协方差为

$$
\boldsymbol{\Sigma}_g = \frac{1}{N}\sum_{i=1}^{N}\big(\nabla\ell_i - \nabla\mathcal{L}\big)\big(\nabla\ell_i - \nabla\mathcal{L}\big)^\top,
$$

即逐示例梯度的离散程度。由期望的线性性，$\E[\mathbf{g}_{\mathcal{B}}] = \nabla\mathcal{L}$：mini-batch 梯度是**无偏的**。独立性使 $B$ 项的协方差相加，而因子 $1/B$ 是以平方形式进入的：

$$
\operatorname{Cov}(\mathbf{g}_{\mathcal{B}}) = \frac{1}{B^2}\cdot B\,\boldsymbol{\Sigma}_g = \frac{\boldsymbol{\Sigma}_g}{B}.
$$

batch 大四倍，噪声的标准差减半，代价却是四倍。无放回抽样（如对数据洗牌后依次遍历）会把协方差乘以 $(N - B)/(N - 1)$：略小一些，并且在 $B = N$ 时恰为零，此时 batch 就是整个数据集。

遍历一遍数据，即一个**轮次**（epoch），是 $\lceil N/B\rceil$ 次更新而不是一次，对线性模型而言每次更新的代价约为 $Bd$ 而不是 $Nd$ 次运算。远离最小值点时，各示例的梯度大体一致，所以一步 mini-batch 更新几乎取得与完整一步相同的进展，而代价只是其一小部分；这就是 SGD 在大数据上取胜的原因。实践中：每个轮次都重新洗牌，因为按顺序存放的数据（按类别、按时间、按机器）否则会给出并非整体样本的 batch；固定随机种子以便复现运行；$B$ 取在 32 到几千之间。语言模型用数百万 token 的 batch 来训练，原因见[模块 08 第 6 节](module_08_ZH.html#s6)。

::: worked title="数一数更新次数"
在 N = 50,000 个示例、$B = 64$ 的情况下，$N/B = 781.25$，所以一个轮次是 $\lceil 781.25\rceil = 782$ 次更新，最后一次的 batch 只有 $50{,}000 - 781\cdot64 = 16$ 个示例。二十个轮次共 15,640 次更新。同样遍历二十遍数据，全 batch 梯度下降只做 20 次更新。
:::

完成这一过程的循环，接续[第 2 节](#s2)的代码：

```python
rng = np.random.default_rng(1)
w = np.zeros(d + 1); eta, B = 0.1, 32
for epoch in range(50):
    order = rng.permutation(N)                       # reshuffle every epoch
    for k in range(0, N, B):
        idx = order[k:k + B]                         # the last batch holds 8 rows
        grad = (2 / len(idx)) * Xb[idx].T @ (Xb[idx] @ w - y[idx])
        w -= eta * grad
excess = np.mean((Xb @ w - y) ** 2) - np.mean((Xb @ w_lstsq - y) ** 2)
print(np.round(w, 3), f"excess loss {excess:.1e}")
```

```output
[ 1.489 -2.016  0.507  0.688] excess loss 1.3e-04
```

经过 350 次更新后，权重接近最小二乘解，但并未落在其上，而且在同样步长下增加轮次也不会使它们更接近。原因是本节其余部分的主题。

### 噪声下限

在最小值点处，完整梯度为零，但逐示例梯度不为零，所以 mini-batch 梯度也不为零，迭代点会继续移动。取一维二次函数 $\mathcal{L}(\theta) = \mathcal{L}(\theta^\ast) + \frac{1}{2}\lambda(\theta - \theta^\ast)^2$，把 mini-batch 梯度建模为真实梯度 $\lambda(\theta - \theta^\ast)$ 加上噪声 $\xi_t$，噪声每一步重新抽取，均值为零，方差为 $s^2/B$，其中 $s^2$ 是逐示例梯度的方差。更新给出

$$
\theta_{t+1} - \theta^\ast = (1 - \eta\lambda)(\theta_t - \theta^\ast) - \eta\,\xi_t.
$$

两边平方并取期望。交叉项消失，因为 $\xi_t$ 均值为零，且独立于由先前 batch 决定的 $\theta_t$。令 $V_t = \E[(\theta_t - \theta^\ast)^2]$，

$$
V_{t+1} = (1 - \eta\lambda)^2\,V_t + \eta^2\,\frac{s^2}{B}.
$$

对于稳定的步长 $|1 - \eta\lambda| < 1$，到不动点的距离 $V_t - V$ 每步按 $(1 - \eta\lambda)^2$ 收缩，所以 $V_t$ 收敛到满足 $V = (1 - \eta\lambda)^2V + \eta^2s^2/B$ 的 $V$。利用 $1 - (1 - \eta\lambda)^2 = \eta\lambda(2 - \eta\lambda)$：

$$
V = \frac{\eta\,s^2}{B\lambda(2 - \eta\lambda)} \;\approx\; \frac{\eta\,s^2}{2B\lambda}
\quad\text{当 } \eta\lambda \ll 1 \text{ 时}. \tag{4.1}
$$

固定步长不会收敛。迭代点在 $\theta^\ast$ 周围徘徊，方差为 $V$，期望超额损失为 $\frac{1}{2}\lambda V = \eta s^2/\big(2B(2 - \eta\lambda)\big)$：一个正比于 $\eta/B$ 的**噪声下限**（noise floor）。

::: worked title="用数字看下限"
取 $\lambda = 1$，$s^2 = 1$。$B = 1$、$\eta = 0.1$ 时，$V = 0.1/(1\cdot1\cdot1.9) = 0.0526$，超额损失为 $\frac{1}{2}\cdot0.0526 = 0.0263$；对该递推式做 400,000 步模拟，测得 $V = 0.0526$。$\eta = 0.01$ 时，$V = 0.01/1.99 = 0.00503$，超额损失为 0.00251。$B = 10$、$\eta = 0.1$ 时，$V = 0.1/(10\cdot1.9) = 0.00526$。步长缩小十倍，或 batch 增大十倍，都能把下限降低约十倍：缩小步长的代价是进展变慢，增大 batch 的代价是每次更新的成本变为十倍。
:::

### 降到下限以下

有两条路可以降下来。增大 batch，它把下限除以 $B$，代价是每次更新的成本成比例增加；或者让步长衰减。罗宾斯（Robbins）和门罗（Monro）（1951）给出了步长调度 $\eta_t$ 使迭代点收敛的条件：

$$
\sum_{t=0}^{\infty}\eta_t = \infty, \qquad \sum_{t=0}^{\infty}\eta_t^2 < \infty.
$$

第一个条件使各步加起来可以走到任意远的距离，所以迭代点能从任何起点到达最小值点。第二个条件限制各步注入的噪声，其方差在上面的递推式中以 $\eta_t^2s^2/B$ 的形式出现。调度 $\eta_t = \eta_0/(1 + t/\tau)$ 同时满足两者：在最初约 $\tau$ 次更新内它保持在 $\eta_0$ 附近，之后表现得像 $\eta_0\tau/t$，其和像 $\ln t$ 一样发散，而其平方和收敛。

回到[第 3 节](#s3)的小部件，把它的梯度噪声滑块 $\sigma_g$ 调大：损失先像以前一样下降，然后在预测下限的虚线处变平。当 $\kappa = 20$、$\sigma_g = 0.3$ 时，$\eta = 0.1$ 的下限是 0.0046，把 $\eta$ 减半到 0.05，下限也减半，为 0.0023。步长较大时，因子 $2 - \eta\lambda$ 也会起作用：$\eta = 0.5$ 时下限为 0.0264，$\eta = 1.0$ 时为 0.0681。

::: worked title="实验 1 的下限：实测与预测"
对最小二乘而言，最优点处的逐示例梯度是 $2\mathbf{x}_i(\mathbf{x}_i^\top\mathbf{w}^\ast - y_i) = -2\mathbf{x}_ir_i$，其中 $r_i$ 为残差。若残差与输入独立，方差为 $\sigma^2$，则其协方差为 $4\sigma^2\cdot\frac{1}{N}\mathbf{X}^\top\mathbf{X} = 2\sigma^2\mathbf{H}$：沿特征值为 $\lambda_i$ 的 $\mathbf{H}$ 的特征向量，梯度噪声的方差为 $2\sigma^2\lambda_i$。沿每个特征向量应用 (4.1)，并对超额损失 $\frac{1}{2}\lambda_iV_i$ 求和，

$$
\text{下限} = \sum_i \frac{\eta\,\sigma^2\lambda_i}{B\,(2 - \eta\lambda_i)}.
$$

取实验 1 的 $\sigma^2 = 0.0100$ 和第 3 节的特征值，并取 50 个轮次中后半段的平均超额训练损失作为实测值：

| $B$ | $\eta$ | 实测 | 预测 |
|---|---|---|---|
| 32 | 0.1 | $1.0\times10^{-4}$ | $1.4\times10^{-4}$ |
| 10 | 0.1 | $3.1\times10^{-4}$ | $4.4\times10^{-4}$ |
| 1 | 0.01 | $2.7\times10^{-4}$ | $4.0\times10^{-4}$ |
| 1 | 0.03 | $1.3\times10^{-3}$ | $1.2\times10^{-3}$ |
| 1 | 0.1 | $9.6\times10^{-3}$ | $4.4\times10^{-3}$ |

预测与实测相差在约两倍之内，并且正确给出了随 $\eta/B$ 变化的比例关系。大多数实测下限都低于预测，因为每个洗牌后的轮次恰好使用每个示例一次，这抵消了一部分噪声；若改用独立抽取的 batch，同样的运行结果落在预测值或其上方，最多高出约一半（$B = 32$ 时为 2.0，对应预测的 $1.4\times10^{-4}$）。在 $B = 1$、$\eta = 0.1$ 时，实测是预测的两倍，因为模型忽略了梯度噪声中随离最优点距离增大的那一部分，而这里这段距离最大。用衰减步长 $\eta_t = 0.1/(1 + t/200)$、$B = 1$，在 10,000 次更新的最后一次之后，超额损失为 $3\times10^{-6}$，在最后一个轮次上平均约为 $2\times10^{-5}$：低于表中每一个固定步长的下限（图 1.6）。
:::

::: figure id=fig-01-6
实验 1 的回归中，超额训练损失 $\mathcal{L}(\mathbf{w}_t) - \mathcal{L}(\mathbf{w}^\ast)$（对数刻度）随更新次数（对数刻度）的变化。四条曲线：$\eta = 0.1$ 的全 batch 梯度下降（每个轮次更新一次，平滑）；$\eta = 0.1$、$B = 32$（下降很快，随后在 $10^{-4}$ 附近变平）；$\eta = 0.1$、$B = 1$（有噪声，在 $10^{-2}$ 附近变平）；以及 $B = 1$、$\eta_t = 0.1/(1 + t/200)$（持续下降，低于各固定步长的下限）。虚线水平线标出两次 $B < N$ 的固定步长运行的预测下限。由[实验 1](#lab1) 生成。
:::

### 选择学习率

曲率已知时，例如最小二乘，从 $2/\lambda_{\max}$ 出发，并保持在它之下留出安全系数。否则就去测量：在对数刻度上以约 3 倍的间隔，从 $10^{-4}$ 到 1（0.0001、0.0003、0.001、……、0.3、1）做一次学习率的短扫描，每个跑几百次更新，取损失平稳下降的最大 $\eta$，并在整个运行中让它衰减。然后在对数刻度上读损失曲线：

- 上升，或几步之内出现 NaN：$\eta$ 超出了稳定极限；把它除以 3 到 10；
- 笔直但平缓的下降：$\eta$ 太小，或问题是病态的；先计算 $\kappa$，再考虑提高 $\eta$；
- 下降之后变成有噪声的平台：噪声下限；让步长衰减或增大 batch，不要把平台当作收敛。

动量法和 Adam 见[模块 02 第 7 节](module_02_ZH.html#s7)和[第 8 节](module_02_ZH.html#s8)，学习率范围测试和学习率调度见该模块的[第 9 节](module_02_ZH.html#s9)。

### 噪声、平坦极小点与非凸损失

噪声还有第二重作用，可能是有益的：小 batch 倾向于找到更平坦的极小点，而更平坦的极小点倾向于泛化得更好。Keskar 等人（2017）观察到，大 batch 训练网络会收敛到更尖锐、泛化更差的极小点。这是一个经验观察，只有部分理论解释，而不是定律，平坦程度与泛化之间的联系仍有争论。

对于非凸模型，也就是[模块 02](module_02_ZH.html) 起的每一个模型，梯度下降找到的是局部极小点或鞍点，并不保证它是最好的那个。实践中，对于大型网络，找到的极小点通常已经足够好，困难在别处：在条件数、参数初始化和学习率上，这些由模块 02 处理。

::: check
在固定步长下把 batch 加倍：梯度噪声的方差和下限会怎样？
:::

::: answer
两者都减半，代价是每次更新的成本加倍。
:::

::: check
为什么 SGD 必须让步长衰减才能收敛，而全 batch 梯度下降用固定步长就能收敛？
:::

::: answer
逐示例梯度在最小值点处并不消失，所以 mini-batch 梯度在那里是有噪声的，固定 $\eta$ 时，迭代点保持一个正比于 $\eta/B$ 的平稳方差。全 batch 梯度在最小值点处恰好为零，所以固定步长就能在那里稳定下来。
:::
