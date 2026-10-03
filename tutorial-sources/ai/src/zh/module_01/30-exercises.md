## 练习 {#exercises}

共十五道练习，按所需的工作量分级。一星练习（★）是概念题，约需五分钟：用几句话口头作答即可。二星练习（★★）是推导或计算题，需十到二十分钟，在纸上配合计算器完成。唯一的三星练习（★★★）是一个约 25 分钟的编程小项目。总计 130 分钟。学习计划把每道练习安排在它所检验的阅读内容之后，这样任何一段阅读都不会长时间没有练习可做。

请在打开解答之前先做完每一道练习。解答默认折叠，打开后应当完整阅读：它们给出每一步，说明为什么这样做，并给出数值，每个数值都经过计算和核对。如果你的答案与解答不同，请先找出两者最早分歧的那一行，再往下读。方法正确而数值错误，通常只是笔误；数值正确但方法不同，则值得与解答的方法对照，因为差异往往揭示了某个假设。

::: exercise id=e1 level=1 kind=conceptual minutes=5
**五个要素。** 针对下面两种情形，写出[第 1 节](#s1)中的五个要素（数据、模型、损失、优化器、评估）：

(a) 在电子表格中对应变片标定数据拟合的线性趋势线，横轴为施加的应变，纵轴为应变片电压；

(b) 一个 $k$ 近邻分类器（$k = 5$），根据 20 个测得的特征把焊缝射线底片判为合格或缺陷。

对于 (b)，哪个要素是退化的？这意味着它的误差来自哪里？
:::

::: solution
**(a) 趋势线。**

- *数据。* 来自一次标定实验的（施加应变，应变片电压）数据对，抽自分布 $P$，也就是标定装置中的应变片。应变片在服役中遇到的温度、应变范围和引线长度属于另一个分布，标定对此毫无说明。
- *模型。* 一条直线，$\text{电压} = a + b\cdot\text{应变}$，两个参数。标定结果要反过来用，即把测得的电压换算成应变，所以使用时要对拟合直线求逆。施加的应变由试验台设定，比电压准确得多，因此电压作为纵轴变量：损失把纵轴变量视为含噪声的那一个。
- *损失。* 平方误差。如果电压噪声近似为高斯分布，且在各应变水平下幅度相同，这就是正确的选择（[第 5 节](#s5)）。
- *优化器。* 闭式解，即正规方程（[第 2 节](#s2)）。电子表格替你求解。
- *评估。* 在未参与拟合的检验点上看残差，或做第二次标定实验。电子表格给出的 $R^2$ 是在拟合所用的点上算出的：它是训练分数。两个参数的直线不会严重过拟合，但六个参数的趋势线可以让它凭空变高。

**(b) $k$-NN 分类器。**

- *数据。* 过往检测的带标签射线底片。$P$ 是这一工艺生产的这类焊缝，所以分类器的好坏取决于存储的样本对明天的焊缝有多典型。
- *模型。* 在 20 维特征空间中，取距新焊缝最近的五个已存样本的多数标签。它的“参数”就是存储的数据本身，外加超参数 $k$ 和距离度量（包括各特征如何缩放）。
- *损失。* 0–1 损失，仅用于在验证数据上比较不同的 $k$ 和缩放方式。训练过程中没有任何东西被最小化。
- *优化器。* 没有。“训练”就是存储数据，所以这就是退化的要素。
- *评估。* 留出的焊缝，按焊缝或按生产批次划分；如果一条焊缝有多张底片，绝不能按底片划分。

**优化器退化意味着什么。** 没有优化，就不会出现收敛失败导致的误差，也没有训练曲线可查。一切都押在数据和距离度量上。误差来自：存储样本缺乏代表性；与缺陷无关的特征在距离中却同等计数；特征尺度不一；以及 20 维空间中“近”几乎没有意义（[第 11 节](#s11)）。第二个后果是训练误差毫无用处：当 $k = 1$ 时，每个存储点都是它自己的最近邻，训练误差按构造为零；$k = 5$ 时也几乎为零。只有留出数据才能告诉你真相。
:::

::: exercise id=e2 level=1 kind=conceptual minutes=5
**类别输入的编码。** 一个线性模型根据材料牌号预测抗拉强度，牌号取自 {钢, 铝, 钛}。

(a) 把牌号编码为 1、2、3，隐含了什么假设？

(b) 你把牌号独热编码为三列，并保留全 1 的截距列。证明 $\mathbf{X}^\top\mathbf{X}$ 是奇异的，并说明拟合权重和预测会怎样。

(c) 给出两种修正办法。
:::

::: solution
**(a)** 单独一列取值 1、2、3，给牌号分配一个权重 $w$，所以编码每加一，模型的预测就加 $w$，无论从哪个牌号起算。这假设了一种顺序（钢 $<$ 铝 $<$ 钛）和等间距：铝的效应必须恰好落在钢与钛的效应正中间。关于这三种材料的任何事实都不支持这两点。无论数据怎么说，穿过各编码的直线对中间牌号的预测，总是另外两个牌号预测的平均值。如果真实强度分别是 400、300 和 900 MPa，对中间牌号的这个预测就会错得很厉害。

**(b)** 独热设计矩阵的每一行，在截距列取 1，并在三个牌号列中恰有一个 1，所以每一行中三个牌号列之和等于截距列。取 $\mathbf{v} = (-1, 1, 1, 1)$，对应（截距，钢，铝，钛）。则 $\mathbf{X}\mathbf{v}$ 的每一行都是 $-1 + 1 = 0$，于是 $\mathbf{X}\mathbf{v} = \mathbf{0}$，因此 $\mathbf{X}^\top\mathbf{X}\mathbf{v} = \mathbf{X}^\top\mathbf{0} = \mathbf{0}$。被矩阵映为零的非零向量是特征值为 0 的特征向量：$\mathbf{X}^\top\mathbf{X}$ 是奇异的，正规方程没有唯一解，$(\mathbf{X}^\top\mathbf{X})^{-1}$ 不存在。这就是[第 2 节](#s2)中列相关的情形，它有个名字，叫**虚拟变量陷阱**（dummy-variable trap）。

这对拟合的影响是：如果 $\mathbf{w}$ 满足正规方程，那么对任意 $t$，$\mathbf{w} + t\mathbf{v}$ 也满足，因为 $\mathbf{X}(\mathbf{w} + t\mathbf{v}) = \mathbf{X}\mathbf{w}$。把截距加 $t$、同时把三个牌号权重都减 $t$，什么都不会改变。所以*权重*是不可识别的：只要其余权重相应补偿，其中任何一个都可以取任意值，像“钛增加 493 MPa”这样的说法单独看没有意义。*预测*则是可识别的，因为预测是 $\mathbf{y}$ 在列空间上的正交投影，与你选择该空间的哪一组基无关；这里每个牌号的预测就是该牌号试样的平均强度。库函数各有处理奇异性的办法：`np.linalg.lstsq` 返回范数最小的解。

用 12 个合成试样（每个牌号四个）做一次数值验证：

```python
import numpy as np

rng = np.random.default_rng(0)
grade = np.repeat([0, 1, 2], 4)                      # 4 specimens per grade
strength = np.array([400.0, 300.0, 900.0])[grade] + rng.normal(0, 10, 12)  # MPa

X = np.column_stack([np.ones(12), np.eye(3)[grade]])   # intercept + one-hot grade
print("columns:", X.shape[1], " rank:", np.linalg.matrix_rank(X))
print("eigenvalues of X^T X:", np.round(np.linalg.eigvalsh(X.T @ X), 2))

v = np.array([-1.0, 1.0, 1.0, 1.0])
print("largest entry of X v:", np.abs(X @ v).max())

w_min = np.linalg.lstsq(X, strength, rcond=None)[0]    # minimum-norm solution
w_shift = w_min + 50 * v                               # another exact solution
print("same predictions:", np.allclose(X @ w_min, X @ w_shift))
print("weights, minimum norm:", np.round(w_min, 1))
print("weights, shifted     :", np.round(w_shift, 1))

X_ref = X[:, [0, 2, 3]]                                # drop the steel column
w_ref = np.linalg.lstsq(X_ref, strength, rcond=None)[0]
print("reference coding:", np.round(w_ref, 1), " same predictions:",
      np.allclose(X_ref @ w_ref, X @ w_min))
```

```output
columns: 4  rank: 3
eigenvalues of X^T X: [ 0.  4.  4. 16.]
largest entry of X v: 0.0
same predictions: True
weights, minimum norm: [400.2   1.7 -95.  493.5]
weights, shifted     : [350.2  51.7 -45.  543.5]
reference coding: [401.8 -96.7 491.8]  same predictions: True
```

四列但秩为 3，且 $\mathbf{X}^\top\mathbf{X}$ 有一个特征值恰为零。两个权重向量相差 $50\,\mathbf{v}$，却给出完全相同的预测。以钢为参照类别后，权重变得可解释：401.8 是钢的平均强度，另外两个是相对钢的差值（铝为 $-96.7$，钛为 $+491.8$）。

**(c)** 两种修正办法，含义不同：

1. **消除冗余。** 去掉一个牌号列并保留截距（*参照类别*：截距是该牌号的均值，其余每个权重是相对它的差值），或者去掉截距并保留全部三列（每个权重就是该牌号的均值）。两种情况下预测完全相同，矩阵也是列满秩的。
2. **正则化。** 岭惩罚把 $\mathbf{X}^\top\mathbf{X}$ 换成 $\mathbf{X}^\top\mathbf{X} + \lambda N\mathbf{I}$，其特征值至少为 $\lambda N > 0$，所以方程组有唯一解（[练习 8](#e8)）。在拟合效果同样好的权重向量中，惩罚选出范数最小的那个，也就决定了共同的常数如何在截距与牌号权重之间分配。这是一种建模选择，并非中性，而且它还会使拟合略有收缩。
:::

::: exercise id=e3 level=2 kind=calculation minutes=10
**由特征值求步长与步数。** 一个双特征问题的最小二乘 Hessian 矩阵，特征值为 1 和 25。

(a) 最大的稳定学习率是多少？

(b) 最佳的固定学习率是多少？它给出的每步误差收缩因子是多少？

(c) 在最佳学习率下，以及在 $\eta = 1/\lambda_{\max}$ 下，把误差降低 $10^6$ 倍各需多少步？

(d) 标准化之后特征值为 0.8 和 1.2。重做 (b) 和 (c)。
:::

::: solution
**设定。** 对 Hessian 矩阵为 $\mathbf{H}$ 的二次函数，误差 $\mathbf{e}_t = \mathbf{w}_t - \mathbf{w}^\ast$ 满足 $\mathbf{e}_{t+1} = (\mathbf{I} - \eta\mathbf{H})\mathbf{e}_t$（[第 3 节](#s3)）。在 $\mathbf{H}$ 的特征基下各分量互不影响，沿特征值为 $\lambda_i$ 的特征向量的分量，每一步都乘以 $1 - \eta\lambda_i$。整体误差的收缩速度取决于其最慢的分量，所以每步的收缩因子为 $\rho(\eta) = \max_i |1 - \eta\lambda_i|$。

**(a) 稳定性。** 每个分量都必须收缩，所以对每个 $i$ 都有 $|1 - \eta\lambda_i| < 1$。对正的 $\lambda_i$，这意味着 $0 < \eta < 2/\lambda_i$，而当 $\eta < 2/\lambda_{\max}$ 时它们全部成立：

$$\eta < \frac{2}{25} = 0.08.$$

恰好为 0.08 时，快分量每步乘以 $1 - 0.08 \cdot 25 = -1$：它翻转符号，既不增大也不缩小，所以迭代永远不会收敛。

**(b) 最佳固定学习率。** 两项相互竞争：$|1 - \eta\lambda_{\min}|$ 随 $\eta$ 增大而下降（慢方向希望步子大），而一旦 $\eta$ 超过 $1/\lambda_{\max}$，快方向就要承受 $|1 - \eta\lambda_{\max}|$（它会冲过头，因子为负）。最佳的 $\eta$ 在两者大小相等、符号相反之处：

$$1 - \eta\lambda_{\min} = -(1 - \eta\lambda_{\max}) \;\Longrightarrow\; \eta^\ast =
\frac{2}{\lambda_{\min} + \lambda_{\max}} = \frac{2}{1 + 25} = 0.0769.$$

于是 $\rho = 1 - \eta^\ast\lambda_{\min} = 1 - 0.0769 = 0.9231$，一般地有
$$\rho = \frac{\kappa - 1}{\kappa + 1} = \frac{24}{26} = 0.9231, \qquad \kappa =
\frac{\lambda_{\max}}{\lambda_{\min}} = 25.$$
现在两个分量的收缩因子大小相同：慢分量为 $+0.9231$，快分量为 $1 - 0.0769\cdot 25 = -0.9231$。

**(c) 步数。** 要把误差降低 $10^6$ 倍，需要 $\rho^t \le 10^{-6}$，即 $t \ge \ln 10^6/(-\ln\rho)$。其中 $\ln 10^6 = 13.816$：

- 在最佳学习率下，$-\ln 0.9231 = 0.0800$，所以 $t \ge 13.816/0.0800 = 172.6$：**173 步**。
- 在 $\eta = 1/\lambda_{\max} = 0.04$ 下，慢分量的因子是 $1 - 0.04\cdot 1 = 0.96$，快分量的因子是 $1 - 0.04 \cdot 25 = 0$。由慢分量决定：$-\ln 0.96 = 0.0408$，所以 $t \ge 13.816/0.0408 = 338.4$：**339 步**。

最佳学习率使步数大约减半，办法是放弃快方向的瞬间收敛，换取更快的慢方向。两者都逃不出步数与 $\kappa$ 同阶这一事实：当 $\kappa$ 很大时，$-\ln\rho = \ln\frac{\kappa+1}{\kappa-1} \approx 2/\kappa$，所以 $t \approx (\kappa/2)\ln 10^6$（这里为 $12.5 \times 13.8 = 173$）。对两个分量做一次直接模拟，可以确认 173 和 339。

**(d) 标准化之后。** 现在 $\kappa = 1.2/0.8 = 1.5$。

- $\eta^\ast = 2/(0.8 + 1.2) = 1.0$。
- 两个因子分别为 $1 - 1.0\cdot 0.8 = +0.2$ 和 $1 - 1.0\cdot 1.2 = -0.2$，所以 $\rho = 0.2$，与 $(\kappa - 1)/(\kappa + 1) = 0.5/2.5 = 0.2$ 一致。
- $t \ge 13.816/(-\ln 0.2) = 13.816/1.609 = 8.58$：**9 步**。

标准化使步数从 173 降到 9，约少了二十倍，既没有更换方法，也没有改变模型能表示的内容。这就是为什么对特征做中心化和缩放，是最廉价的优化改进。
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
**交叉熵与经过 sigmoid 的平方误差。**

(a) 证明二元交叉熵对 logit $z$ 的梯度为 $\hat p - y$，其中 $\hat p = \sigma(z)$。

(b) 计算 $\tfrac12(\sigma(z) - y)^2$ 对 $z$ 的梯度。

(c) 对一个自信但错误的预测（$\hat p = 0.999$，$y = 0$）和一个自信且正确的预测（$\hat p = 0.001$，$y = 0$），分别求两者的值。

(d) 这些数字对学习意味着什么？
:::

::: solution
**(a)** 单个样本的损失为 $\ell = -y\ln\sigma(z) - (1-y)\ln(1-\sigma(z))$。sigmoid 的导数为 $\sigma'(z) = \sigma(z)(1 - \sigma(z))$（对 $1/(1 + e^{-z})$ 求导并化简）。由链式法则，

$$\frac{\partial\ell}{\partial z} = \left(-\frac{y}{\sigma} + \frac{1-y}{1-\sigma}\right)
\sigma(1-\sigma) = -y(1-\sigma) + (1-y)\sigma = \sigma - y.$$

sigmoid 带来的因子 $\sigma(1 - \sigma)$ 抵消了对数带来的分母。这种抵消就是交叉熵与 sigmoid 总是搭配使用的原因。

**(b)** 记 $\ell_2 = \tfrac12(\sigma(z) - y)^2$。则

$$\frac{\partial\ell_2}{\partial z} = (\sigma - y)\,\sigma'(z) = (\sigma - y)\,\sigma(1-\sigma).$$

没有任何东西被抵消：sigmoid 的导数作为额外因子留了下来。

**(c) 数值。** 当 $y = 0$ 时，两个梯度分别为 $\hat p$ 和 $\hat p\cdot\hat p(1 - \hat p) = \hat p^2(1-\hat p)$。

| | 交叉熵梯度 | 平方误差梯度 |
|---|---|---|
| 自信但错误，$\hat p = 0.999$ | $0.999$ | $0.999^2 \times 0.001 = 0.000998$ |
| 自信且正确，$\hat p = 0.001$ | $0.001$ | $0.001^2 \times 0.999 = 9.99\times10^{-7}$ |

两行中的比值都是 $1/(\hat p(1 - \hat p))$（在 $\hat p = 0.999$ 或 $0.001$ 处），即 $1/(0.999 \times 0.001) = 1001$：交叉熵梯度约为平方误差梯度的 1,001 倍。

**(d) 含义。** 梯度步使 logit 的移动量与梯度成正比。交叉熵的梯度 $\hat p - y$ 就是预测误差本身：模型自信地出错时它接近 1，随模型改进而平滑地减小，模型正确时接近 0。平方误差的梯度多带一个因子 $\hat p(1 - \hat p)$，它在*两个*极端都接近零，因为 sigmoid 在那里是平的（它*饱和*了）。所以错得最厉害的模型，对负样本来说其 logit 约为 $z = \ln(0.999/0.001) = +6.9$，几乎收不到任何信号：它的梯度是 0.001，学习速度比用交叉熵时慢约一千倍。平方误差梯度 $\hat p^2(1-\hat p)$ 的最大值只有 $4/27 = 0.148$（在 $\hat p = 2/3$ 处），而交叉熵梯度可达 1。

交叉熵给出的*损失值*也是合理的：对自信但错误的预测，$-\ln 0.001 = 6.9$，而平方误差给出 $\tfrac12(0.999)^2 = 0.5$，且永远不会超过 $\tfrac12$。一个分不清轻度错误与灾难性错误的损失，加上一个恰在模型最需要纠正时消失的梯度，就是分类问题用交叉熵训练的原因（[第 6 节](#s6)）。同样的抵消，即 $\hat{\mathbf{p}} - \mathbf{y}$，对 softmax 也成立，因此对语言模型的输出层同样成立。
:::

::: exercise id=e5 level=2 kind=calculation minutes=10
**报警意味着什么。** 一个裂纹检测器的召回率为 0.90，假阳性率为 0.03，被检零件中有 2% 存在裂纹。

(a) 被标记的零件中，真有裂纹的占多大比例？每出现一次真报警，伴随多少次误报警？

(b) 证明在给定报警的条件下，有裂纹的几率等于先验几率乘以 TPR/FPR，并据此求出使一半报警为真的裂纹发生率。

(c) 每个被标记的零件都送去做第二次检测，其召回率和假阳性率相同，且在给定真实状态时，其错误与第一次的错误相互独立。两次都被标记的零件中，有裂纹的占多大比例？两阶段合起来的召回率是多少？第二阶段要检测全部零件的多大比例？

(d) 供应商的宣传册上的哪些数字会掩盖 (a) 的答案？
:::

::: solution
**(a)** 以占全部零件的比例来计算。设 $\pi = 0.02$ 为发生率，TPR $= 0.90$ 为召回率，FPR $= 0.03$。

- 被标记的有裂纹零件：$\text{TPR}\cdot\pi = 0.90 \times 0.02 = 0.0180$，占全部零件。
- 被标记的合格零件：$\text{FPR}\cdot(1-\pi) = 0.03 \times 0.98 = 0.0294$，占全部零件。
- 全部被标记的：$0.0180 + 0.0294 = 0.0474$。

精确率是被标记零件中有裂纹的比例：

$$\text{精确率} = \frac{0.0180}{0.0474} = 0.380.$$

十次报警中真报警不到四次。每次真报警对应的误报警次数：$0.0294/0.0180 = 1.63$。

**(b)** 由贝叶斯公式，

$$\frac{P(\text{裂纹}\mid\text{报警})}{P(\text{合格}\mid\text{报警})} =
\frac{\text{TPR}\cdot\pi}{\text{FPR}\cdot(1-\pi)} = \frac{\pi}{1-\pi}\cdot\frac{\text{TPR}}{\text{FPR}}.$$

两个概率有共同的分母 $P(\text{报警})$，它在比值中约去。所以后验几率等于先验几率乘以**似然比**（likelihood ratio）TPR/FPR，这里为 $0.90/0.03 = 30$。用 (a) 检验：先验几率 $0.02/0.98 = 0.0204$，乘以 30 得 $0.612$，几率 $0.612$ 对应的概率为 $0.612/1.612 = 0.380$。吻合。

当后验几率为 1 时，一半的报警为真，所以 $\pi/(1-\pi) = \text{FPR}/\text{TPR}$，由此得

$$\pi = \frac{\text{FPR}}{\text{TPR} + \text{FPR}} = \frac{0.03}{0.93} = 3.2\%.$$

在发生率为 2% 时报警大多为假的检测器，在 3.2% 及以上时则大多为真：同一个分类器，召回率和假阳性率都不变，在不同的总体中就是不同的工具（[第 7 节](#s7)，基础率）。

**(c)** 第二阶段只看到第一阶段标记过的零件，所以它面对的先验几率就是第一阶段的后验几率 0.612。由于在给定真实状态时两次错误相互独立，它的报警再次把几率乘以似然比：

$$0.612 \times 30 = 18.4 \;\Longrightarrow\; P(\text{裂纹}\mid\text{两次报警}) =
\frac{18.4}{19.4} = 0.948.$$

也可以直接计算：有裂纹且两次被标记 $0.90^2\times 0.02 = 0.0162$；合格但两次被标记 $0.03^2\times 0.98 = 0.000882$；比值 $0.0162/(0.0162 + 0.000882) = 0.948$。

- *两阶段合起来的召回率：* 裂纹必须被两次都检出，所以为 $0.90 \times 0.90 = 0.81$。第二阶段使召回率损失 9 个百分点（0.90 降到 0.81），换来精确率从 0.38 提升到 0.95；每次真报警对应的误报警次数从 1.63 降到 $0.000882/0.0162 = 0.054$。
- *第二阶段检测的零件：* 第一阶段标记的那些，即全部零件的 **4.74%**。

独立性假设是乐观的，且两个方向都是如此。如果两次检测漏掉的是同样的隐蔽裂纹，那么第一阶段标记出来的是容易发现的裂纹，第二阶段检出它们的概率高于 0.90，所以真实的合并召回率高于 0.81。如果两次检测在同样难判但完好的零件上误报，第二阶段剔除的误报就比 30 倍这个因子所暗示的少，真实的精确率低于 0.948。依靠这些乘积之前，先在真实数据上测量相关性。

**(d)** 有两个数字会掩盖它。*准确率*：$0.0180 + 0.97\times0.98 = 0.9686$，听上去极好，却低于一个从不报警的“检测器”所达到的 0.98。准确率被 98% 被正确放行的合格零件所主导。*ROC AUC*，以及任何以 TPR 和 FPR 为坐标画出的曲线，因为二者都与发生率无关：宣传册若只报告这些，就完全没说明在你的总体中会有多少报警是假的。在平衡测试集（一半有裂纹）上做基准测试的宣传册，还会给这同一个检测器标出精确率 $0.90/0.93 = 0.97$。能说明 (a) 的是在*部署时*发生率下的精确率，或者在真实裂纹与合格零件混合比例的数据上算出的精确率-召回率曲线。
:::

::: exercise id=e6 level=2 kind=calculation minutes=10
**数对子求 AUC。** 六个测试零件得到分数。缺陷件：0.9、0.7、0.4。合格件：0.8、0.3、0.2。

(a) 通过数对子计算 AUC。

(b) 把阈值向下扫描，列出 ROC 曲线上的（FPR，TPR）点；验证阶梯下方的面积等于 (a)。

(c) 在阈值 0.5 处，给出精确率和召回率。

(d) 哪一个分数的单独改动可以使 AUC 升到 1？
:::

::: solution
**(a) 数对子。** AUC 是随机选取的一个缺陷件得分高于随机选取的一个合格件的概率（平局算一半；此处没有平局）。缺陷-合格的对子共有 $3 \times 3 = 9$ 个。对每个缺陷件，数出它得分高于的合格件：

- 0.9 胜过 0.8、0.3 和 0.2：3 对。
- 0.7 胜过 0.3 和 0.2，但不胜过 0.8：2 对。
- 0.4 胜过 0.3 和 0.2，但不胜过 0.8：2 对。

$$\text{AUC} = \frac{3 + 2 + 2}{9} = \frac{7}{9} = 0.778.$$

**(b) ROC 曲线。** 让阈值按得分从高到低依次下降。阈值标记所有得分不低于它的零件。每经过一个缺陷件，TPR 增加 $1/3$；每经过一个合格件，FPR 增加 $1/3$。

| 阈值到达 | 零件 | FPR | TPR |
|---|---|---|---|
| （高于 0.9） | 无标记 | 0 | 0 |
| 0.9 | 缺陷 | 0 | 1/3 |
| 0.8 | 合格 | 1/3 | 1/3 |
| 0.7 | 缺陷 | 1/3 | 2/3 |
| 0.4 | 缺陷 | 1/3 | 1 |
| 0.3 | 合格 | 2/3 | 1 |
| 0.2 | 合格 | 1 | 1 |

阶梯下方的面积，按竖直条带计算：FPR 从 0 到 $1/3$ 时高度为 $1/3$，面积 $\tfrac13\cdot\tfrac13 = 1/9$；FPR 从 $1/3$ 到 1 时高度为 1，面积 $\tfrac23\cdot 1 = 6/9$。总计 $7/9$，与 (a) 一致。（两种算法是同一个和的不同排列：按缺陷件数对子，或按合格件数对子。）用 `sklearn.metrics.roc_auc_score` 做机器核对，返回 0.7778。

**(c) 阈值 0.5。** 得分不低于 0.5 的零件是 0.9（缺陷）、0.8（合格）和 0.7（缺陷）。所以 TP $= 2$，FP $= 1$；得分 0.4 的缺陷件被漏掉，FN $= 1$；TN $= 2$。

$$\text{精确率} = \frac{\text{TP}}{\text{TP} + \text{FP}} = \frac23, \qquad
\text{召回率} = \frac{\text{TP}}{\text{TP} + \text{FN}} = \frac23.$$

**(d) 一处改动。** AUC 为 1 意味着每个缺陷件的得分都高于每个合格件，所以三个得分 $0.9, 0.7, 0.4$ 必须全都高于三个合格件的得分。唯一的障碍是得分 0.8 的合格件，它胜过缺陷件 0.7 和 0.4。把它降到 0.4 以下，例如 0.35，就得到 AUC 为 1。单独提高缺陷件 0.4 行不通：把它升到 0.95 只修复一个对子，缺陷件 0.7 仍低于合格件 0.8，AUC 只变为 $8/9$。（把 0.7 和 0.4 都提到 0.8 以上同样可行，但那是两处改动。）这道题表明 AUC 度量的是什么：它描述的是得分的*排序*，一个得分错误的合格件就会损失九个对子中的两个。
:::


::: exercise id=e7 level=2 kind=derivation minutes=10
**一维收缩。** 你用 $n$ 个方差为 $\sigma^2$ 的独立读数估计均值 $\mu$，使用收缩估计量 $\hat\mu_c = c\,\bar y$，其中 $0 \le c \le 1$。

(a) 推导它的偏差$^2$、方差和均方误差。

(b) 求使 MSE 最小的 $c$。

(c) 取 $\sigma = 3$、$n = 9$。分别对 $\mu = 2$ 和 $\mu = 0.5$ 求 $c^\ast$ 及其 MSE，并与 $\bar y$ 的 MSE 比较。

(d) 为什么实践中不能直接使用 $c^\ast$？计算当使用 $\mu = 0.5$ 对应的 $c^\ast$、而 $\mu$ 实际为 2 时的 MSE，并说明这与用交叉验证选取 $\lambda$ 有何关系。
:::

::: solution
**(a)** 样本均值 $\bar y$ 满足 $\mathbb{E}[\bar y] = \mu$ 和 $\operatorname{Var}(\bar y) = \sigma^2/n$（$n$ 个独立读数的平均值的方差）。乘以常数 $c$：

- $\mathbb{E}[\hat\mu_c] = c\mu$，所以偏差为 $c\mu - \mu = -(1-c)\mu$，且 $\text{偏差}^2 = (1-c)^2\mu^2$。
- $\operatorname{Var}(\hat\mu_c) = c^2\sigma^2/n$。

均方误差是两者之和（交叉项消失，与[第 8 节](#s8)相同）：

$$\text{MSE}(c) = (1-c)^2\mu^2 + c^2\frac{\sigma^2}{n}.$$

**(b)** 记 $v = \sigma^2/n$。对 $c$ 求导并令导数为零：

$$\frac{d\,\text{MSE}}{dc} = -2(1-c)\mu^2 + 2cv = 0 \;\Longrightarrow\;
c^\ast = \frac{\mu^2}{\mu^2 + v}.$$

二阶导数 $2\mu^2 + 2v$ 为正，所以这是极小值；且 $c^\ast$ 位于 0 与 1 之间，约束不起作用。代入 $1 - c^\ast = v/(\mu^2 + v)$，

$$\text{MSE}(c^\ast) = \frac{v^2\mu^2 + \mu^4 v}{(\mu^2+v)^2} = \frac{v\mu^2(v + \mu^2)}
{(\mu^2+v)^2} = \frac{v\mu^2}{\mu^2+v} = c^\ast v.$$

由于 $c^\ast < 1$，这低于 $v = \text{MSE}(1)$，即无偏估计 $\bar y$ 的 MSE：*一定程度的*偏差总是值得的，最佳的 $c$ 如同偏差-方差分解那样，在偏差与方差之间折中。（这个收缩因子与[练习 8](#e8) 中岭回归的因子 $s^2/(s^2 + \lambda N)$ 形式相同。若如[第 9 节](#s9)那样给 $\mu$ 一个方差为 $\tau^2$ 的高斯先验，则后验均值为 $\tau^2/(\tau^2 + v)\,\bar y$，形式相同，只是用 $\tau^2$ 取代了未知的 $\mu^2$。）

**(c) 数值。** 这里 $v = \sigma^2/n = 9/9 = 1$，所以无论 $\mu$ 为何，$\bar y$ 的 MSE 都是 $1.0$。

- $\mu = 2$：$c^\ast = 4/(4 + 1) = 0.8$。偏差$^2 = (0.2)^2\cdot 4 = 0.16$，方差 $0.8^2\cdot 1 = 0.64$，MSE $= 0.80 = c^\ast v$。降低 20%。
- $\mu = 0.5$：$c^\ast = 0.25/(0.25 + 1) = 0.2$。偏差$^2 = 0.8^2 \cdot 0.25 = 0.16$，方差 $0.2^2\cdot 1 = 0.04$，MSE $= 0.20$。降低 80%。

信号相对噪声较小时，收缩的帮助最大，因为此时无偏估计主要是噪声，丢弃其中一部分代价很小。（用 $10^6$ 个样本做模拟，得到 0.800 和 0.200。）

**(d) 问题所在。** $c^\ast$ 依赖于 $\mu$，也就是正要估计的那个量。假设你相信 $\mu = 0.5$，于是用 $c = 0.2$ 收缩，但 $\mu$ 实际为 2：

$$\text{MSE} = (1 - 0.2)^2\cdot 2^2 + 0.2^2 \cdot 1 = 2.56 + 0.04 = 2.60,$$

是普通均值 $\bar y$ 的 MSE（1.0）的两倍半。没有证据支持、或基于错误信念选取的收缩，可能造成实实在在的伤害：偏差项随与真值距离的平方增长，公式里没有任何东西向你示警。

补救办法是从数据中选取收缩的程度，即在留出数据上直接估计误差，这正是验证和交叉验证所做的事。在岭回归中，更大的强度 $\lambda$ 对应更小的 $c$：由交叉验证选出的 $\lambda$ 是对不可知的 $c^\ast$ 的一个估计，[实验 3](#lab3) 展示了在含噪数据上的岭路径及其最小值。这个估计本身也有噪声，但与上面那种猜测不同，它是以数据为依据的。
:::

::: exercise id=e8 level=2 kind=derivation minutes=10
**正规方程与岭回归。**

(a) 由 $\mathcal{L}(\mathbf{w}) = \tfrac1N\|\mathbf{X}\mathbf{w} - \mathbf{y}\|^2$ 的梯度推导正规方程。

(b) 加上岭惩罚 $\lambda\|\mathbf{w}\|^2$，证明方程组变为 $(\mathbf{X}^\top\mathbf{X} + \lambda N\mathbf{I})\mathbf{w} = \mathbf{X}^\top\mathbf{y}$。

(c) 利用 $\mathbf{X}^\top\mathbf{X}$ 的特征值，解释为什么对每个 $\lambda > 0$ 这个方程组都可解，即使 $\mathbf{X}$ 的行数少于列数。

(d) 若 $\mathbf{X}^\top\mathbf{X}$ 的特征值为 50 和 0.5，且 $\lambda N = 5$，给出各方向的收缩因子 $s^2/(s^2 + \lambda N)$，以及收缩前后的条件数。
:::

::: solution
**(a)** 展开平方范数：$\|\mathbf{X}\mathbf{w} - \mathbf{y}\|^2 =
\mathbf{w}^\top\mathbf{X}^\top\mathbf{X}\mathbf{w} - 2\mathbf{w}^\top\mathbf{X}^\top\mathbf{y} +
\mathbf{y}^\top\mathbf{y}$。对称矩阵 $\mathbf{A}$ 的二次型 $\mathbf{w}^\top\mathbf{A}\mathbf{w}$ 的梯度为 $2\mathbf{A}\mathbf{w}$，$\mathbf{w}^\top\mathbf{b}$ 的梯度为 $\mathbf{b}$，最后一项与 $\mathbf{w}$ 无关，所以

$$\nabla_{\mathbf{w}}\mathcal{L} = \frac1N\left(2\mathbf{X}^\top\mathbf{X}\mathbf{w} -
2\mathbf{X}^\top\mathbf{y}\right) = \frac2N\mathbf{X}^\top(\mathbf{X}\mathbf{w} - \mathbf{y}).$$

在极小值处梯度为零：$\mathbf{X}^\top\mathbf{X}\mathbf{w} = \mathbf{X}^\top\mathbf{y}$。这就是正规方程。（Hessian 矩阵为 $\tfrac2N\mathbf{X}^\top\mathbf{X}$，半正定，所以损失是凸的，梯度为零的点就是全局最小值。）

**(b)** 带惩罚的损失为 $\mathcal{L}(\mathbf{w}) + \lambda\|\mathbf{w}\|^2$，且 $\nabla_{\mathbf{w}}\lambda\|\mathbf{w}\|^2 = 2\lambda\mathbf{w}$。令总梯度为零：

$$\frac2N\mathbf{X}^\top(\mathbf{X}\mathbf{w} - \mathbf{y}) + 2\lambda\mathbf{w} = \mathbf{0}.$$

两边乘以 $N/2$：$\mathbf{X}^\top\mathbf{X}\mathbf{w} - \mathbf{X}^\top\mathbf{y} + \lambda
N\mathbf{w} = \mathbf{0}$，整理得

$$(\mathbf{X}^\top\mathbf{X} + \lambda N\mathbf{I})\,\mathbf{w} = \mathbf{X}^\top\mathbf{y}.$$

因子 $N$ 的出现，是因为 $\mathcal{L}$ 是*平均*损失，而惩罚项未经缩放就加了上去；如果损失写成求和形式，则得到的是 $\lambda\mathbf{I}$。

**(c)** $\mathbf{X}^\top\mathbf{X}$ 是对称的，所以它有实特征值 $s_i^2$ 和正交的特征向量 $\mathbf{v}_i$，并且每个特征值都非负：$s_i^2 = \mathbf{v}_i^\top
\mathbf{X}^\top\mathbf{X}\mathbf{v}_i = \|\mathbf{X}\mathbf{v}_i\|^2 \ge 0$（对单位特征向量）。加上 $\lambda N\mathbf{I}$ 使*每个*特征值都加 $\lambda N$，而特征向量保持不变，所以岭矩阵的特征值为 $s_i^2 + \lambda N \ge \lambda N >
0$。特征值全为正的对称矩阵是可逆的，所以对每个 $\lambda > 0$，方程组恰有一个解。

即使 $\mathbf{X}$ 的行数少于列数（$N < d + 1$）或存在相关列（[练习 2](#e2)），这一结论也成立。此时 $\mathbf{X}^\top\mathbf{X}$ 的秩至多为 $N$，所以至少有 $d + 1 - N$ 个特征值恰为零，未加惩罚的方程组有无穷多解。惩罚把这些零提升为 $\lambda N$，并在所有拟合效果同样好的权重向量中，选出范数最小的那个。

**(d) 一个具体例子。** 在特征基下，岭回归把最小二乘解沿各方向的分量乘以 $s^2/(s^2 + \lambda N)$。（推导：在 $\mathbf{v}_i$ 构成的基下，方程组解耦为 $(s_i^2 + \lambda N)\,\tilde w_i = s_i^2\,\tilde w_i^{\text{LS}}$，因为只要最小二乘解存在，就有 $\mathbf{X}^\top\mathbf{y} = \mathbf{X}^\top\mathbf{X}\mathbf{w}^{\text{LS}}$。）取 $\lambda N = 5$：

- $s^2 = 50$ 的方向：$50/55 = 0.909$；
- $s^2 = 0.5$ 的方向：$0.5/5.5 = 0.091$。

数据把权重定得很紧的、确定得好的方向，保留其最小二乘值的 91%。确定得差的方向，即数据几乎没有约束的方向，只保留 9%：岭回归去掉了数据无法支持的大部分，而很少去掉数据能够支持的部分。条件数从 $50/0.5 = 100$ 降到 $(50 + 5)/(0.5 + 5) = 55/5.5 = 10$，所以在岭损失上做梯度下降，按[练习 3](#e3) 的意义也大约快十倍收敛。
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
**找出泄漏。** 对下面每种设置，说明是否存在泄漏，属于哪一类，以及如何修正。

(a) 用整个数据集的列均值填补缺失值，然后做 5 折交叉验证。

(b) 12 台泵的振动频谱，每台 500 条，按 80/20 随机划分。

(c) 预测次日故障，使用的特征包括“距上次维护的小时数”，该特征是在故障当天结束时记录的。

(d) 因为验证集“太小”，就在测试集上调参。
:::

::: solution
**(a) 预处理泄漏，通常较轻微。** 列均值包含了每一折用作验证的那些行的取值，所以关于留出行的一点信息通过输入进入了模型。对于由许多行平均得到的均值，影响很小，这正是这种泄漏常常不被察觉的原因；而对于更依赖个别行的统计量（目标编码、按与标签的相关性做特征选择、在全部数据上拟合的 PCA），影响可能很大。*修正：* 把填补器放进 `Pipeline`，让交叉验证只在每个训练折上拟合它：`make_pipeline(SimpleImputer(strategy="mean"), model)`。规则是：任何带有 `fit` 步骤的东西都是模型的一部分。

**(b) 分组泄漏。** 随机划分把同一台泵的频谱分在两边，而同一台泵的频谱彼此之间的相似度，远高于与另一台泵的频谱的相似度，所以模型可以靠识别*泵*而不是故障来取得高分。这个分数对模型从未见过的泵毫无说明，而实际使用时遇到的恰是这种情形。*修正：* 按使用时会是新对象的那个单位来划分：以泵为分组的 `GroupKFold`，或者完整留出两三台泵。

一个模拟可以显示这种影响有多大。十二台泵各有一个由五个特征构成的特征标记，以及一个与该标记无关的“磨损”值；用 5 近邻回归器预测磨损：

```python
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.model_selection import GroupKFold, KFold, cross_val_score
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
n_pumps, per_pump = 12, 500
pump = np.repeat(np.arange(n_pumps), per_pump)
signature = rng.normal(0, 3, size=(n_pumps, 5))        # each pump's own spectrum
wear = rng.normal(0, 1, n_pumps)                       # unrelated to its spectrum
X = signature[pump] + rng.normal(0, 1, size=(n_pumps * per_pump, 5))
y = wear[pump] + rng.normal(0, 0.2, n_pumps * per_pump)
X[rng.random(X.shape) < 0.05] = np.nan                 # 5% missing values

# (a) the imputer sits inside the pipeline, so each fold fits it on its training rows
model = make_pipeline(SimpleImputer(strategy="mean"), KNeighborsRegressor(5))
score = "neg_root_mean_squared_error"
rmse_random = -cross_val_score(model, X, y, cv=KFold(4, shuffle=True, random_state=0),
                               scoring=score).mean()
rmse_by_pump = -cross_val_score(model, X, y, cv=GroupKFold(4), groups=pump,
                                scoring=score).mean()
print(f"spread of y             : {y.std():.2f}")
print(f"random split, RMSE      : {rmse_random:.2f}")
print(f"split by pump, RMSE     : {rmse_by_pump:.2f}")
```

```output
spread of y             : 1.12
random split, RMSE      : 0.44
split by pump, RMSE     : 1.72
```

随机划分报告的 RMSE 为 0.44，而 $y$ 的离散程度为 1.12：看上去是个不错的模型。按泵划分后，RMSE 为 1.72，比直接预测均值还差，因为对于没见过的泵，模型无物可供。按构造，这里本来就没有什么可学的。（这里用 RMSE 而不用 $R^2$，因为 $R^2$ 的分母会随折而变。）

**(c) 目标泄漏，带有时间特征。** 故障之后进行的维护会重置“距上次维护的小时数”，所以故障当天结束时记录的值编码了结果。这个特征在作出预测的时刻并不可得，使用它的模型是在预测过去。*修正：* 为每个特征定义它被获知的时间，并以预测时刻为准构建特征表，设置明确的截止时间。典型症状是准确率很高，但模型一上线运行就崩溃。检查模型最依赖哪个特征（并追问为什么），能发现许多这类泄漏。

**(d) 测试集复用。** 测试集一旦指导了某个选择（模型、超参数、阈值），它就成了验证集，其得分会乐观，乐观的程度取决于选择的幅度（[第 10 节](#s10)）。验证集小，是使用交叉验证的理由，而不是借用测试集的理由。*修正：* 在训练数据上用交叉验证调参（若要报告交叉验证分数本身，则用嵌套交叉验证），并保留或另行收集一个从未被碰过的测试集，在所有决定做完之后只打开一次。
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
**相信 98% 之前。** 一位同事报告，某个把危险源分为可控或不可控的模型，准确率为 98%。列出你在相信这个数字之前要问的五个问题，并对每个问题说明怎样的回答会让你信任这个数字。
:::

::: solution
五个问题，每个针对高准确率可能空洞无物的一种方式：

1. **类别比例是多少？多数类规则能得多少分？** 如果 97% 的危险源是可控的，一个总回答“可控”的模型就能得 97%，98% 几乎没有增加什么。*信任的条件：* 98% 明显高于多数类基线，且基线与它一并报告。
2. **混淆矩阵以及各类的精确率和召回率是什么？** 准确率按各类的频率加权平均，所以它掩盖了对稀少而代价高昂的那一类是如何处理的。把危险源误判为可控，是危险的错误。*信任的条件：* “不可控”类的召回率和报警的精确率，对该模型所支持的决策而言是可接受的。
3. **数据是怎样划分的？重复项是否已去除？** 同一个危险源，或对同一系统的不同分析中它的近似副本，出现在划分的两侧，会抬高分数（[练习 9](#e9)）。*信任的条件：* 划分是按使用时会是新对象的单位（系统、项目或危险场景，而不是行）进行的，且在划分之前已经去除了完全重复和近似重复的项。
4. **试过多少个模型和设置？测试集是否只打开过一次？** 许多分数中的最佳者是乐观的（[练习 11](#e11)），而被反复查阅的测试集就是验证集。*信任的条件：* 所有选择都是在训练数据上或通过交叉验证做出的，测试集只评分一次，且数字是在看结果之前写下的。
5. **测试用例是否来自实际使用条件？有多少个？** 来自另一个行业、较旧的标注做法或去年的系统的测试集，度量的是另一个问题；而只有 100 个用例的测试集，会留下几个百分点宽的区间（[第 10 节](#s10)）。*信任的条件：* 这些用例在类型和时间上都与未来的输入相像，并且报告了区间（例如来自自助法），区间窄到足以有意义。

当标签由人来制作时，还值得问第六个问题：**标注者之间的一致程度如何？** 如果两位工程师对危险源的判断有 95% 一致，那么模型就无法有意义地按 98% 来评判，因为在这部分用例上，“真值”本身是错的或有争议的。
:::

::: exercise id=e11 level=1 kind=conceptual minutes=5
**120 个中的最佳者。** 你对一个梯度提升模型的 120 种配置做随机搜索，用 5 折交叉验证给每个配置评分，并报告最佳分数。

(a) 即使每个配置同样好，为什么这个分数也是乐观的？

(b) 乐观程度会随下列情况增大还是缩小：(i) 配置更多，(ii) 数据更多，(iii) 配置彼此太相像以至于分数几乎相同？各用一句话回答。

(c) 补救办法是什么？它为什么有效？
:::

::: solution
**(a)** 交叉验证分数等于该配置的真实性能加上由具体的折和具体的数据带来的噪声。从 120 个中选出最佳者，就是选出噪声恰好最有利的那个配置，所以即使没有哪个配置比别的更好，最大值也会向上偏。这种偏差是选择与噪声的性质，并不需要任何配置发生过拟合（[第 10 节](#s10)）。

**(b)**

- (i) *配置更多：* 乐观程度增大，但增长缓慢。$n$ 个独立标准正态抽样的期望最大值大致按 $\sqrt{2\ln n}$ 上升；模拟给出 10 个抽样为 1.5，120 个为 2.6，1,200 个为 3.3，单位为噪声的标准差。搜索量增加十倍所得有限，这也是随机搜索不再划算的原因。
- (ii) *数据更多：* 乐观程度缩小，因为每个分数的噪声按 $1/\sqrt{N}$ 下降，而选择偏差是该噪声的某个倍数。
- (iii) *配置几乎相同：* 乐观程度缩小，因为强相关的分数表现得像更少的独立抽样，可供挑选最幸运者的空间就更小。（全部 120 个配置共用同样的折，这已经使它们的噪声相关，所以 (i) 中的数字是上界。）

**(c)** 在未参与选择的数据上给选定的配置评分：**嵌套交叉验证**（内层循环做选择，外层循环给包含选择在内的整个流程评分），或者在所有选择都已完成之后只打开一次的**测试集**。这样，被选中的模型是在它没有被选择过的噪声上被度量的，它的运气与该噪声无关，会被平均掉，分数就成为对该流程性能的诚实估计。嵌套交叉验证的代价是额外的拟合次数；单个测试集的代价是只能用一次。[实验 4](#lab4) 的扩展部分展示了在纯噪声上这种影响的大小，那里每个配置都恰好只相当于随机猜测。
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
**四十七个无用特征。** 一个 $k$ 近邻分类器（$k = 5$，特征已标准化）利用在约 3,000 个带标签窗口上算出的 3 个振动特征，能很好地检测轴承故障。新的数据记录仪又增加了 47 个特征，其中大多数与故障无关，交叉验证准确率因此下降，尽管并没有信息被移除。

(a) 给出两个原因，都与距离有关。

(b) 说出两种补救办法。

(c) 为什么梯度提升树集成面对同样的 47 个特征，损失要小得多？
:::

::: solution
**(a) 两个原因。**

1. *无关特征稀释了距离。* 标准化之后，每个特征对平方距离贡献的离散程度大致相同。47 个无关特征中的每一个，在两个随机窗口之间所增加的平方距离，与一个有信息的特征一样多，所以 47 个噪声项淹没了 3 个信号项，“最近”的邻居是在毫无意义的方向上近。有信息的差异仍然存在，只是在总量中占了一小部分。
2. *维数灾难。* 在 50 维中，容纳固定比例数据的邻域必须跨越每个特征的大部分取值范围。容纳均匀分布数据的 1% 的立方体，边长是取值范围的 $0.01^{1/d}$：$d = 3$ 时为 0.22，$d = 50$ 时则为 0.91（[第 11 节](#s11)）。在 3,000 个窗口下，最近的五个邻居根本谈不上局部，并且一个点到它最近邻与最远邻的距离变得几乎相等。

**(b) 两种补救办法。**

- *选择或缩减特征。* 通过验证来选取特征，且要在交叉验证的折*内部*进行，使选择不泄漏标签（[实验 4](#lab4)）；或者利用领域知识，保留物理上确实重要的特征；或者用 PCA 降维，但要记住 PCA 保留的是方差大的方向，不一定是携带故障信息的方向。
- *学习距离。* 给特征加权（例如按经验证的相关性），或者使用能够学到哪些输入重要的模型，而把 $k$-NN 留给特征少而精的问题。

**(c) 树为何应付得来。** 树的每次分裂只用一个特征和一个阈值，从可用特征中选出使不纯度下降最多的那个。无关特征很少在这一选择中胜出，所以很少被用到，也没有哪一步把全部 50 个特征合并成一个距离。因此集成模型会忽略大部分噪声特征，而不是对它们求平均。它们也不是毫无代价：每次分裂有 47 个候选，噪声特征时不时会碰巧胜出，树就会拟合到一点噪声。

对这一设置（3,000 个窗口，三个均值随故障而偏移的特征，47 个与故障无关的标准正态特征）做的模拟显示了差异：

```python
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
n = 3000
fault = rng.integers(0, 2, n)
# three informative features: the mean shifts when a fault is present
signal = rng.normal(size=(n, 3)) + fault[:, None] * np.array([1.2, 0.8, 1.0])
noise = rng.normal(size=(n, 47))                       # 47 unrelated features
cv = StratifiedKFold(5, shuffle=True, random_state=0)

for name, X in [("3 features ", signal), ("50 features", np.hstack([signal, noise]))]:
    knn = make_pipeline(StandardScaler(), KNeighborsClassifier(5))
    boost = HistGradientBoostingClassifier(random_state=0)
    acc_knn = cross_val_score(knn, X, fault, cv=cv).mean()
    acc_boost = cross_val_score(boost, X, fault, cv=cv).mean()
    print(f"{name}: k-NN {acc_knn:.3f}   boosting {acc_boost:.3f}")
```

```output
3 features : k-NN 0.772   boosting 0.769
50 features: k-NN 0.659   boosting 0.789
```

$k$-NN 的准确率下降了 11 个百分点，从 0.77 降到 0.66；提升树则完全没有下降。（实际上，在这个模拟中以及试过的其他每个随机种子下，提升树加入噪声特征后还好了约两个百分点。本练习不解释这一点，它也不是噪声特征的好处；这里只想说明树没有下降。）
:::


::: exercise id=e13 level=3 kind=coding minutes=25
**梯度提升是需要击败的基线吗？** 检验“在表格数据上梯度提升是需要击败的基线”这一说法。用 5 折交叉验证，所有模型使用同样的折（`KFold(5, shuffle=True, random_state=0)`），比较以下模型的 RMSE：

- 预测均值（`DummyRegressor`）；
- 岭回归（`StandardScaler` + `RidgeCV(alphas=np.logspace(-3, 3, 13))`）；
- $k$-NN（`StandardScaler` + `KNeighborsRegressor(10)`）；
- RBF 支持向量回归器（`StandardScaler` + `SVR(C=10)`）；
- 随机森林（300 棵树，`random_state=0`）；
- `HistGradientBoostingRegressor(random_state=0)`，

数据集为 (a) `make_friedman1(n_samples=2000, n_features=10, noise=1.0, random_state=0)` 和 (b) `load_diabetes`。报告各折的均值 $\pm$ 标准差以及拟合时间。然后在每个数据集上，计算最好的两个模型的逐折 RMSE 之差，并说明这一排名是否有证据支持。
:::

::: solution
**方案。** 把六个模型构建为流水线，使缩放在每一折内部拟合（基于距离的模型和岭回归需要缩放，树不在乎）。每次调用都使用同一个 `KFold` 对象，使每个模型都在完全相同的测试折上评分；正是这一点使逐折之差有意义。`cross_validate` 配合 `neg_root_mean_squared_error` 返回每折一个 RMSE。“最好的两个”按平均 RMSE 选出，然后要问的是：二者的差距相对于该差距的折间波动是否足够大。

```python
import time
import numpy as np
from sklearn.datasets import make_friedman1, load_diabetes
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import RidgeCV
from sklearn.model_selection import KFold, cross_validate
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR

models = {
    "mean": DummyRegressor(),
    "ridge": make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 13))),
    "k-NN": make_pipeline(StandardScaler(), KNeighborsRegressor(10)),
    "SVR": make_pipeline(StandardScaler(), SVR(C=10)),
    "forest": RandomForestRegressor(300, random_state=0),
    "boosting": HistGradientBoostingRegressor(random_state=0),
}
X1, y1 = make_friedman1(n_samples=2000, n_features=10, noise=1.0, random_state=0)
X2, y2 = load_diabetes(return_X_y=True)
datasets = {"Friedman #1": (X1, y1), "diabetes": (X2, y2)}
cv = KFold(5, shuffle=True, random_state=0)  # one splitter object: same folds for all

for dname, (X, y) in datasets.items():
    print(f"{dname}: {X.shape[0]} rows, {X.shape[1]} features")
    rmse = {}
    for mname, model in models.items():
        t0 = time.perf_counter()
        res = cross_validate(model, X, y, cv=cv, scoring="neg_root_mean_squared_error")
        rmse[mname] = -res["test_score"]
        secs = time.perf_counter() - t0
        print(f"  {mname:9s} RMSE {rmse[mname].mean():6.2f} +- "
              f"{rmse[mname].std(ddof=1):5.2f}   time {secs:5.1f} s")
    # The two best by mean RMSE, compared fold by fold on identical test folds.
    best = sorted(rmse, key=lambda m: rmse[m].mean())[:2]
    diff = rmse[best[1]] - rmse[best[0]]
    print(f"  {best[1]} minus {best[0]}, per fold:", np.round(diff, 2))
    print(f"  mean {diff.mean():.2f}, SD {diff.std(ddof=1):.2f}, "
          f"{best[0]} better in {(diff > 0).sum()} of 5 folds")
```

```output
Friedman #1: 2000 rows, 10 features
  mean      RMSE   5.02 +-  0.09   time   0.0 s
  ridge     RMSE   2.59 +-  0.09   time   0.0 s
  k-NN      RMSE   2.52 +-  0.07   time   0.0 s
  SVR       RMSE   1.40 +-  0.05   time   0.6 s
  forest    RMSE   1.79 +-  0.07   time   5.6 s
  boosting  RMSE   1.34 +-  0.04   time   0.5 s
  SVR minus boosting, per fold: [0.09 0.09 0.03 0.01 0.07]
  mean 0.06, SD 0.04, boosting better in 5 of 5 folds
diabetes: 442 rows, 10 features
  mean      RMSE  76.93 +-  4.53   time   0.0 s
  ridge     RMSE  54.65 +-  2.19   time   0.0 s
  k-NN      RMSE  56.83 +-  2.99   time   0.0 s
  SVR       RMSE  55.63 +-  2.84   time   0.0 s
  forest    RMSE  57.78 +-  4.11   time   1.4 s
  boosting  RMSE  59.02 +-  5.50   time   0.2 s
  SVR minus ridge, per fold: [ 0.11  0.76 -1.92  4.79  1.18]
  mean 0.99, SD 2.44, ridge better in 4 of 5 folds
```

时间取决于机器，列出只是为了给出数量级；整个脚本的运行时间远不到一分钟。（如果 `HistGradientBoostingRegressor` 意外地慢，原因是在繁忙的机器上它的 OpenMP 后端发生了线程争用：把环境变量 `OMP_NUM_THREADS` 设为 1 或 2。）

**解读 Friedman #1 的表格。** 这份数据具有线性模型无法表达的结构：目标为 $10\sin(\pi x_1 x_2) + 20(x_3 - 0.5)^2 + 10x_4 + 5x_5$ 加噪声，即一个交互项、一个二次项和两个线性项，另有五个什么作用也没有的特征。均值预测器的 5.02 设定了尺度。岭回归（2.59）和 $k$-NN（2.52）约达到其一半：岭回归是因为除两个线性项之外它几乎抓不到什么，$k$-NN 则是因为五个无关特征损害了它的距离（[练习 12](#e12)）。接下来依次是随机森林（1.79）、SVR（1.40）和提升（1.34）。噪声的标准差为 1.0，所以下限，即不可约误差，是约 1.0 的 RMSE；提升与它相差不到 0.34。

*前两名的排名是否有证据支持？* 提升在全部五折中都胜过 SVR，分别领先 0.09、0.09、0.03、0.01 和 0.07，平均 0.059，折间标准差 0.038。把这五个差值视为一个样本，均值距零 3.5 个标准误（$0.059/(0.038/\sqrt5)$），并且每折的符号都相同。提升优于 SVR 的排名是有证据支持的，不过差距很小：占 RMSE 的 4%。各折并不独立（每一对训练集有四分之三重叠），所以形式上的显著性被夸大了；符号的一致性才是更有说服力的证据。提升与线性模型和最近邻模型之间的差距超过 1.1 的 RMSE，不需要这样小心。随机森林远居第三，比提升高约 0.45，而折间标准差分别为 0.07（随机森林）和 0.04（提升）。

**解读 diabetes 的表格。** 情形变了。这份数据有 442 行、十个特征，信号近乎可加且大多是线性的。岭回归最好（54.65 $\pm$ 2.19），SVR 第二（55.63），而提升是真实模型中的*最后一名*（59.02 $\pm$ 5.50，波动最大）。SVR 减岭回归的差值为 $0.11, 0.76, -1.92, 4.79, 1.18$：均值 0.99，标准差 2.44，所以均值距零 0.9 个标准误，并且有一折符号反转。**岭回归优于 SVR 的排名没有证据支持**：在这份数据上两者无法区分。提升减岭回归为 $7.47, 0.34, -1.60, 9.01, 6.61$，均值 4.37，岭回归在五折中的四折更好。平均差距是这五个差值（标准差 4.69）的 2.1 个标准误：有提示意义，但五折不足以使之可靠。

**结论。** 这一说法是有条件的。当目标具有交互和非线性，并且有足够多的行可供学习时，梯度提升获胜（Friedman #1，2,000 行），在那里它也胜过调得很好的核方法，尽管只是险胜。在只有几百行且信号可加的数据上，正则化线性模型同样好甚至更好，而且拟合、解释和检查的成本都更低。明智的做法不是预设赢家，而是按成本顺序在同样的折上走完这个阶梯：基线、线性模型，然后是提升或随机森林，并逐折地、对照其波动来判断差异。仅看各折的均值，你无从知道差距何时小到无关紧要。

*扩展。* 提升在其灵活性有回报之前比岭回归需要更多的行，这一说法是可以用学习曲线检验的预测（[第 8 节](#s8)）：在 100、200 和 400 行上重复 diabetes 的比较，看提升与岭回归之间的差距是否变化。结果在此不作断言。
:::

::: exercise id=e14 level=2 kind=calculation minutes=10
**加权拟合中的一个坏点。** 在实验 5 中应变至 20% 的 neo-Hookean 拟合里，把 $\lambda = 0.90$ 处的点从 $-6.98$ kPa 改为 $-8.00$ kPa。

(a) 使用其记录的 $\sigma = 0.185$ kPa 重新拟合：$c_1$ 移动了多少？该点的归一化残差是多少？$\chi^2_\nu$ 怎样变化？

(b) 把该点的 $\sigma$ 乘以十后重新拟合。

(c) 你希望出现哪种行为？这对记录不确定度说明了什么？
:::

::: solution
**设定。** 实验 5 的数据是一次合成的软水凝胶压缩试验：拉伸比 $\lambda_k = 1 - 0.025k$，$k = 1, \dots, 16$，真实材料为 Gent 模型，$c_1 = 10$ kPa，$\beta = 0.2$，记录的不确定度 $\sigma_k = 0.05 + 0.02|P_{\text{true},k}|$ kPa，测得的应力 $P_k = P_{\text{true},k} + \sigma_k\varepsilon_k$，其中 $\varepsilon_k$ 取自 `default_rng(1)`。$c_1$ 的加权拟合使用[第 12 节](#s12)的闭式解：$c_1^\ast = \sum w_i P_i g_i / (2\sum w_i g_i^2)$，其中 $w_i = 1/\sigma_i^2$，$g(\lambda) =
\lambda - \lambda^{-2}$，标准误为 $1/(2\sqrt{\sum w_i g_i^2})$。下面的代码是自包含的：

```python
import numpy as np

def g(lam):
    return lam - lam**-2                     # neo-Hookean shape function

def p_gent(lam, c1=10.0, beta=0.2):          # the true material of the test
    i1m3 = lam**2 + 2/lam - 3
    return 2*c1*g(lam)/(1 - beta*i1m3)

lam = 1 - 0.025*np.arange(1, 17)
sigma = 0.05 + 0.02*np.abs(p_gent(lam))      # recorded uncertainty, kPa
P = p_gent(lam) + sigma*np.random.default_rng(1).normal(size=16)

def fit_neo_hookean(lam, P, sigma):
    """Weighted least squares for c1: closed form, standard error, residuals."""
    w = 1/sigma**2
    sum_wgg = np.sum(w*g(lam)**2)
    c1 = np.sum(w*P*g(lam))/(2*sum_wgg)
    se = 1/(2*np.sqrt(sum_wgg))
    r = (P - 2*c1*g(lam))/sigma              # normalised residuals
    chi2_nu = np.sum(r**2)/(len(P) - 1)      # one parameter fitted
    return c1, se, r, chi2_nu

n = 8                                        # strains up to 20%
lam8, P8, s8 = lam[:n], P[:n].copy(), sigma[:n].copy()
k = 3                                        # the point at lambda = 0.90
print(f"point {k}: lambda = {lam8[k]:.2f}, P = {P8[k]:.2f}, sigma = {s8[k]:.3f}")

def report(label, P, s):
    c1, se, r, chi = fit_neo_hookean(lam8, P, s)
    print(f"{label:22s} c1 = {c1:6.2f} +- {se:.2f} kPa   r[{k}] = {r[k]:5.2f}"
          f"   chi2_nu = {chi:.2f}")

report("original", P8, s8)
P8[k] = -8.00
report("point moved to -8.00", P8, s8)
s8[k] *= 10
report("... and its sigma x 10", P8, s8)
```

```output
point 3: lambda = 0.90, P = -6.98, sigma = 0.185
original               c1 =  10.09 +- 0.10 kPa   r[3] = -1.21   chi2_nu = 0.71
point moved to -8.00   c1 =  10.29 +- 0.10 kPa   r[3] = -6.03   chi2_nu = 6.44
... and its sigma x 10 c1 =  10.04 +- 0.11 kPa   r[3] = -0.69   chi2_nu = 0.54
```

**(a) 保留记录的不确定度。** 拟合的 $c_1$ 从 10.09 移到 10.29 kPa，变化为 $+0.20$ kPa：占该值的 2.0%，或两个标准误（0.20/0.0997）。该点的归一化残差为 $-6.03$：拟合曲线在 $\lambda = 0.90$ 处，比该测量值高出约六个该点自身的标准差。而 $\chi^2_\nu$ 从 0.71 升到 6.44，是之前的九倍，额外的贡献几乎全部来自这一个点（其余七个残差仍在约 $\pm 1.6$ 之内）。

拉动的大小可以手算验证。$c_1^\ast$ 对数据是线性的，所以把某个 $P_i$ 改变 $\Delta P$，它就改变 $\Delta c_1 = w_i g_i\,\Delta P/(2\sum w_j g_j^2)$。这里 $w_i = 1/0.1847^2 = 29.3$，$g(0.90) = 0.90 - 1/0.81 = -0.3346$，$\Delta P = -8.00 -
(-6.975) = -1.025$，且 $2\sum w_j g_j^2 = 1/(2\,\text{SE}^2) = 50.3$。所以 $\Delta c_1 =
29.3\times(-0.3346)\times(-1.025)/50.3 = +0.20$，与重新拟合的结果相符。拟合被拖动的幅度与该点的*权重*成正比，但诊断量清楚地标出了它。

**(b) 放大不确定度。** 把该点的 $\sigma$ 乘以十，就是把它的权重除以一百。现在 $c_1 = 10.04$ kPa，基本就是完全没有这个点时的值（把它剔除时为 10.04），该点的残差为 $-0.69$ 个标准差，$\chi^2_\nu = 0.54$。这个点实际上被忽略了。$c_1$ 的标准误略微升到 0.107，因为拟合现在拥有的信息更少。

**(c) 你想要什么，以及这道练习说明了什么。** 这取决于这个读数*当时是什么情况*。如果仪器工作正常，读数确实与其记录的 $\sigma$ 一样精确，那么 (a) 就是诚实的答案：偏离六个标准差的点，是试样、模型或试验装置需要解释的真实证据，而大的 $\chi^2_\nu$ 就是警报。把这个点降权会掩盖证据。如果取这个点时已知有问题（压板打滑，载荷传感器下有气泡），则对这一测量价值的诚实记录就是一个大的 $\sigma$，如 (b) 所示，这时拟合理所当然地忽略它。

绝不能发生的是第三种情形：一个坏读数配上错误的、很小的 $\sigma$，这会产生 (a) 的结果而没有诊断，得到一个没人检查的结果。$\sigma_i$ 是数据的一部分，而不是一个设置：它们说明每个点可以在多大程度上改变答案，而拟合的诚实程度只取决于它们。接受不带不确定度的点的程序根本无法做这项检查，这也是实验 5 的 `check_inputs` 拒绝它们的原因。而且诊断的顺序很重要：在调整任何 $\sigma$ *之前*先看归一化残差，因为把不确定度放大到 $\chi^2_\nu$ 看起来不错，是让拟合“过关”而不是去理解它的做法。
:::

::: exercise id=e15 level=1 kind=conceptual minutes=5
**标错的加载方向。** 一位同事导出一次压缩试验的数据，把拉伸比写成 $1 + \text{应变}$，把应力写成正数，并在把加载方向声明为拉伸的情况下拟合 neo-Hookean 模型。

(a) 实验 5 的哪些输入检查会触发？为什么没有任何输入检查能发现这个错误？

(b) 在前 5% 的应变范围内，读错的拟合看上去很干净；在 20% 范围内则不然。不用计算，从 $g(\lambda) = \lambda - \lambda^{-2}$ 在 $\lambda = 1$ 两侧的弯曲方式作出解释。

(c) 拟合出的 $c_1$ 旁边必须存储什么，才能使下一位使用者不再犯同样的错误？
:::

::: solution
**(a) 没有检查会触发。** 这些检查拒绝的是相互矛盾的输入：缺失或非正的不确定度，对于所声明的方向落在 1 错误一侧的拉伸比，符号对该方向不正确的应力。拉伸比大于 1、应力为正、声明为拉伸试验，这些彼此相容：它们描述的是一次完全有效的拉伸试验。错误不在于这些数字彼此之间的关系，而在于它们与实验室里实际发生之事的关系，在那里压板是*相向*移动的。检查只能发现各项声明之间的矛盾，而这里并没有矛盾；只有试验记录才能说明加载的是哪个方向。这是基于规则的验证的一般局限：自洽的错误标注会通过每一项一致性检查。

**(b) 为什么错误只在较大应变时才显现。** $g(\lambda) = \lambda - \lambda^{-2}$ 在 $\lambda = 1$ 两侧斜率相同：$g'(\lambda) = 1 + 2\lambda^{-3}$ 在 $\lambda =
1$ 处等于 3。但 $g''(\lambda) = -6\lambda^{-4}$ 为负，所以 $g$ 向下弯曲。以应变 $\varepsilon$ 离开 $\lambda = 1$，在 $\lambda = 1$ 附近的展开为

$$g(1 + \varepsilon) = 3\varepsilon - 3\varepsilon^2 + \dots, \qquad g(1 - \varepsilon) =
-(3\varepsilon + 3\varepsilon^2 + \dots).$$

在压缩中，$|g|$ 随应变的增长快于线性（曲线偏离切线，朝更负的值弯去）；在拉伸中则增长得比线性慢。对 $\varepsilon$ 的一阶近似，两个分支一致，读错的数据看起来就像一种稍硬材料的拉伸试验，单参数拟合把它吸收进一个更大的 $c_1$，不留下任何模式。两个分支相差约 $6\varepsilon^2$，而一阶项为 $3\varepsilon$：相对差异约为 $2\varepsilon$。在前 5% 的应变内，两个分支的比值从约 1.05 变到 1.10；单个 $c_1$ 吸收了其平均值，剩下的在整个范围内只有百分之几，低于噪声允许残差显示出来的水平。在 20% 范围内，比值从 1.05 变到 1.5，远非一个系数所能吸收，残差呈现成串的同号，$\chi^2_\nu$ 远高于 1。在实验 5 的测量数据中，前 5% 范围内读错的拟合使 $c_1$ 偏高 8.7%，$\chi^2_\nu = 0.38$（对错误模型的一次干净拟合）；在 20% 范围内则偏高 28.5%，$\chi^2_\nu = 20.7$。干净的拟合并不说明模型是对的：它说明的是数据无法区分两者。

**(c) 要存储什么。** 与系数一起，记录**加载方向**，以及拉伸比和应力的符号约定（压缩为负吗？），拟合所用的**应变范围**，**不确定度**和**诊断量**（$\chi^2_\nu$ 与归一化残差），以及所用的模型（neo-Hookean，Gent）。拟合出的 $c_1$ 只对它所来自的那次试验、在拟合它所用的模型中才有意义。一个光秃秃的数字，“$c_1 = 12.97$ kPa”，等于邀请别人在它不适用的场合重用它，而随数字一同流转的报告，是下一位使用者唯一的保护。
:::
