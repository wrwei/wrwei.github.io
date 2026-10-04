## 练习 {#exercises}

十五道练习按它们所练习的各节顺序排列，并按工作量分级：★ 是概念题，约 5 分钟，至多需要读出一个比值或一个和；★★ 是推导或计算，需要 10 到 12 分钟；★★★ 是编程，约 25 分钟。第一类有八道，第二类六道，第三类一道，合计 127 分钟。概念题先在脑中或纸上做完，再打开解答：它们之所以短，是因为全部难点都在于定下一个答案。

没有一道练习重复例题、正文检查题或实验的数字或情形。各节在一组数字上讲授每种方法；这里同一种方法遇到另一组数字，使能迁移的是方法而不是答案。解答中引用的每个数字都经过计算，产生它的代码或者列出，或者有所说明。唯一的编程练习（[练习 12](#e12)）从[实验 4](#lab4) 的物理信息神经网络出发，并且自成一体：它的代码在一个新的 Python 会话中按原样即可运行。

每个解答在你打开之前都是隐藏的。只有在写下自己的答案之后，哪怕很粗糙，再打开它：真正有用的检查，是你的答案与解答分道扬镳的那个地方。

::: exercise id=e1 level=1 kind=conceptual minutes=5
一个自编码器把 64 像素的图像映射为 128 维的编码再映射回去，没有其他任何约束，它的训练重建误差降到了零。解释为什么这个编码作为表示毫无用处，并举出两种能迫使网络学习数据结构的改动。
:::

::: solution
**为什么零误差什么也说明不了**。重建误差衡量的是输出是否等于输入，它不衡量编码是否*选择*了什么。这里编码的维数比输入多（$d_z = 128 > d_x = 64$），所以网络可以随意复制。一个显式的解：让编码器把 64 个像素放进编码的前 64 个坐标，其余 64 个放零，$\mathbf{z} = (\mathbf{x}, \mathbf{0})$，再让解码器把前 64 个读回来。任何可逆映射都同样可行：对 $\mathbf{x}$ 做一个随机旋转再做其逆变换，也能完美重建，此时编码就是像素的一份打乱的副本。梯度下降会找到其中之一，因为这是把损失降到零最容易的办法，而目标函数中没有任何东西偏爱别的解。

于是，这个编码在[第 2 节](#s2)列出的三个方面都毫无用处。它没有压缩任何东西（用 128 个数表示 64 个数）。它没有把可能的输入和不可能的输入区分开，因为这个映射对 $\mathbb{R}^{64}$ 中的每个输入，包括噪声，都有定义且是精确的。它作为异常检测器也失败了：模型从未见过的输入和其他输入重建得一样好，所以作为异常分数的重建误差对一切输入都是零。

**两种把恒等映射从极小值点集合中排除的改动**。

1. *瓶颈*，$d_z < d_x$。数字个数比输入少的编码无法复制输入。网络必须决定保留哪些变化方向，而对于平方误差，它保留承载方差最多的那些方向（对线性映射，最优解张成主导的主子空间，如[第 2 节](#s2)所示）。它学到的结构是“数据位于何处”。
2. *去噪目标*：把输入破坏为 $\tilde{\mathbf{x}}$，要求输出干净的 $\mathbf{x}$。恒等映射此时给出 $\tilde{\mathbf{x}}$，与目标相差恰好一份噪声。最好的映射是条件均值 $\mathbb{E}[\mathbf{x}\mid\tilde{\mathbf{x}}]$，它把被破坏的点拉回干净数据密集的地方，而这正是关于数据必须学到的东西。这时过完备的编码就变得无害了。（这与[第 5 节](#s5)变成扩散目标的是同一个回归。）

另外两种改动出于同样的原因而有效。对 $\mathbf{z}$ 施加稀疏惩罚（L1 项），允许存在很多坐标，但只允许少数坐标处于激活状态，所以编码无法携带一份稠密的副本。变分自编码器的 KL 项（[第 3 节](#s3)）对编码所携带的关于 $\mathbf{x}$ 的每一点信息都收取若干奈特，所以复制代价高昂，只有在重建中物有所值的信息才能留下来。

规律是：自编码器能学到结构，仅限于架构或目标阻止它学习恒等映射的程度。因此，训练误差低从来不是表示良好的证据；要在被破坏的、留出的或异常的输入上检验它。
:::

::: exercise id=e2 level=2 kind=derivation minutes=12
(a) 从 $\log p_\theta(\mathbf{x}) = \log \int p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})\,d\mathbf{z}$ 出发，插入 $q_\phi(\mathbf{z}\mid\mathbf{x})/q_\phi(\mathbf{z}\mid\mathbf{x})$，应用詹森不等式，得到证据下界 $\mathbb{E}_q[\log p_\theta(\mathbf{x}\mid\mathbf{z})] - D_{\KL}(q_\phi(\mathbf{z}\mid\mathbf{x}) \,\|\, p(\mathbf{z}))$。

(b) 不用詹森不等式，证明 $\log p_\theta(\mathbf{x}) - \text{ELBO} = D_{\KL}(q_\phi(\mathbf{z}\mid\mathbf{x}) \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x}))$，并说明这个下界何时是紧的。

(c) 证明 $D_{\KL}(\mathcal{N}(\mu, \sigma^2) \,\|\, \mathcal{N}(0, 1)) = \tfrac12(\mu^2 + \sigma^2 - \log\sigma^2 - 1)$，并证明对角高斯分布的 KL 是各维之和。对 $\boldsymbol{\mu} = (0.3, -1.5, 0.0)$ 和 $\boldsymbol{\sigma} = (0.8, 1.0, 2.0)$ 计算它，并说明每一维在为什么付出代价。
:::

::: solution
以下用 $q$ 表示 $q_\phi(\mathbf{z}\mid\mathbf{x})$，并假设凡是 $p_\theta(\mathbf{x}\mid\mathbf{z})p(\mathbf{z})$ 为正的地方 $q$ 也为正，使下面的除法有定义。

**(a) 由詹森不等式得到下界**。乘以再除以 $q$ 不改变任何东西，却把积分变成了在 $q$ 下的期望，而 $q$ 是我们能够采样的分布：

$$
\log p_\theta(\mathbf{x}) = \log \int q\,\frac{p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})}{q}\,d\mathbf{z}
= \log \mathbb{E}_q\!\left[\frac{p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})}{q}\right].
$$

对数是凹函数，所以对正随机变量 $Y$，詹森不等式给出 $\log \mathbb{E}[Y] \ge \mathbb{E}[\log Y]$。取 $Y$ 为方括号内的比值，

$$
\log p_\theta(\mathbf{x}) \ge \mathbb{E}_q\big[\log p_\theta(\mathbf{x}\mid\mathbf{z}) + \log p(\mathbf{z}) - \log q\big]
= \mathbb{E}_q\big[\log p_\theta(\mathbf{x}\mid\mathbf{z})\big] - \mathbb{E}_q\!\left[\log\frac{q}{p(\mathbf{z})}\right].
$$

按定义，最后一个期望就是 $D_{\KL}(q \,\|\, p(\mathbf{z}))$，于是得到所述的证据下界（ELBO）。我们把对数移进了期望里面，正是这一步让我们失去了等号：它把一个无法无偏估计的量，换成了一个可以用 $\mathbf{z}$ 的样本来估计的量。

**(b) 精确的差距**。模型的贝叶斯公式 $p_\theta(\mathbf{x}) = p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})\,/\,p_\theta(\mathbf{z}\mid\mathbf{x})$ 对每个 $\mathbf{z}$ 都成立。取对数，并通过乘以再除以 $q$，把右边写成两个比值之积：

$$
\log p_\theta(\mathbf{x}) = \log\frac{p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})}{q} + \log\frac{q}{p_\theta(\mathbf{z}\mid\mathbf{x})}.
$$

左边不依赖于 $\mathbf{z}$，所以它在任何 $q$ 下的期望就是它自己。对两边取 $\mathbb{E}_q$：

$$
\log p_\theta(\mathbf{x}) = \underbrace{\mathbb{E}_q\!\left[\log\frac{p_\theta(\mathbf{x}\mid\mathbf{z})\,p(\mathbf{z})}{q}\right]}_{\text{ELBO}} + D_{\KL}\big(q \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x})\big).
$$

由 (a) 部分的代数运算，第一项就是证据下界。所以 $\log p_\theta(\mathbf{x}) - \text{ELBO} = D_{\KL}(q \,\|\, p_\theta(\mathbf{z}\mid\mathbf{x})) \ge 0$，这不用詹森不等式再次证明了下界，并且显示出詹森不等式丢掉了什么。KL 散度恰好在它的两个自变量相等时为零，所以**下界是紧的，当且仅当 $q_\phi(\mathbf{z}\mid\mathbf{x}) = p_\theta(\mathbf{z}\mid\mathbf{x})$**，即真实后验。由此得到两个推论。在 $\theta$ 固定时对 $\phi$ 最大化证据下界，等价于最小化到真实后验的 KL，因为 $\log p_\theta(\mathbf{x})$ 不依赖于 $\phi$。而差距是编码器族的一种性质：对角高斯 $q$ 无论训练得多好，都无法匹配有两个峰或坐标相关的后验。

**(c) 高斯 KL**。对一维的 $q = \mathcal{N}(\mu, \sigma^2)$ 和 $p = \mathcal{N}(0, 1)$，两个对数密度为

$$
\log q(z) = -\tfrac12\log(2\pi) - \tfrac12\log\sigma^2 - \frac{(z-\mu)^2}{2\sigma^2},
\qquad
\log p(z) = -\tfrac12\log(2\pi) - \frac{z^2}{2}.
$$

KL 为 $\mathbb{E}_q[\log q - \log p]$。两个 $\tfrac12\log 2\pi$ 项相消。在 $q$ 下，$\mathbb{E}[(z-\mu)^2] = \sigma^2$（方差的定义），$\mathbb{E}[z^2] = \mu^2 + \sigma^2$（方差加均值的平方）。因此

$$
D_{\KL} = -\tfrac12\log\sigma^2 - \frac{\sigma^2}{2\sigma^2} + \frac{\mu^2 + \sigma^2}{2}
= \tfrac12\big(\mu^2 + \sigma^2 - \log\sigma^2 - 1\big).
$$

对于对角高斯，$q(\mathbf{z}) = \prod_j q_j(z_j)$，$p(\mathbf{z}) = \prod_j p_j(z_j)$，所以 $\log q - \log p = \sum_j(\log q_j - \log p_j)$。和的期望等于期望之和，而每一项只依赖于一个坐标，所以只有它的边缘分布起作用：$D_{\KL}(q\,\|\,p) = \sum_j D_{\KL}(q_j \,\|\, p_j)$。

**数值**。逐维计算，利用 $\log\sigma^2 = 2\log\sigma$：

- $j = 1$：$\tfrac12(0.09 + 0.64 - \log 0.64 - 1) = \tfrac12(0.09 + 0.64 + 0.4463 - 1) = \tfrac12(0.1763) = 0.0881$；
- $j = 2$：$\tfrac12(2.25 + 1 - 0 - 1) = \tfrac12(2.25) = 1.1250$；
- $j = 3$：$\tfrac12(0 + 4 - \log 4 - 1) = \tfrac12(4 - 1.3863 - 1) = \tfrac12(1.6137) = 0.8069$。

总和为 $0.0881 + 1.1250 + 0.8069 = 2.020$ 奈特。作为核对，用 $\mathbf{z}$ 的两百万个样本对 $\mathbb{E}_q[\log q - \log p]$ 做蒙特卡洛估计，得到 $2.0196$，与闭式解的差在抽样误差之内。

**每一维在为什么付出代价**。把每一项拆成均值部分 $\tfrac12\mu^2$ 和宽度部分 $\tfrac12(\sigma^2 - \log\sigma^2 - 1)$，后者在 $\sigma = 1$ 处为零，在其两侧都为正：

| 维度 | 均值部分 | 宽度部分 | 它对 $\mathbf{x}$ 说明了什么 |
|---|---|---|---|
| 1 | 0.0450 | 0.0431 | 很少：接近先验，略窄一些 |
| 2 | 1.1250 | 0 | 很多，体现在位置上：均值离 0 有 1.5 个先验标准差 |
| 3 | 0 | 0.8069 | 只有宽度：后验比先验*更宽* |

第 2 维是典型的携带信息的坐标：它为把均值从先验移开而付出代价。第 3 维出人意料。比先验更宽的后验，其均值不携带关于 $\mathbf{x}$ 的任何信息，却要付出 0.81 奈特，因为 KL 惩罚任何偏离 $\mathcal{N}(0, 1)$ 的情形，而非常弥散的 $q$ 也是一种偏离。实践中，编码器会把每个它不需要的坐标推向 $\sigma \approx 1$ 和 $\mu \approx 0$，这就是后验坍塌在数字上的样子。
:::

::: exercise id=e3 level=1 kind=conceptual minutes=5
一个 $d_z = 8$ 的 VAE 在测试集上报告了以下各维的 KL 值（单位为奈特）：$(2.1, 1.7, 0.003, 0.002, 1.2, 0.001, 0.004, 0.002)$。有多少个潜在维度携带关于 $\mathbf{x}$ 的信息？解码器如何处理其余的维度？如果任务需要更多携带信息的维度，举出两种你会尝试的改动。
:::

::: solution
**三个维度携带信息：第 1、2、5 维**。单维的 KL 是 $q(z_j\mid\mathbf{x})$ 偏离先验 $\mathcal{N}(0, 1)$ 的代价，以奈特计，并在测试输入上取平均（[练习 2](#e2) 给出了单个坐标的代价）。0.001 到 0.004 奈特的代价意味着，对每个输入，$q(z_j\mid\mathbf{x})$ 本质上都是 $\mathcal{N}(0, 1)$：均值不随 $\mathbf{x}$ 移动，宽度保持为 1。三个活跃维度共用掉 $2.1 + 1.7 + 1.2 = 5.0$ 奈特，而另外五个只有 0.012 奈特，所以编码把 99.8% 的预算花在了三个坐标上。作为量级参考，5.0 奈特是 7.2 比特，这是平均输入的编码最多能告诉解码器的关于该输入的信息量（平均 KL 是编码所携带的关于 $\mathbf{x}$ 的信息的上界）。

**解码器如何处理其余维度**。在那五个坐标上，无论输入是什么，$z_j$ 都是从先验中新抽取的一个值：纯噪声，与 $\mathbf{x}$ 无关。噪声只会损害重建，所以解码器学会忽略这些输入，来自它们的权重向零收缩。这就是**部分后验坍塌**：坐标存在，但没有被使用。可以直接检验：用一个不活跃坐标的不同取值去解码同一个活跃编码，输出应当不变。

**这是否成问题取决于任务**。如果数据确实沿三个因素变化，三个活跃维度就是一个好的答案，另外五个是空闲的容量。只有当重建或采样质量差，而且更多信息能够改善时，这才是问题。可以尝试两种改动，按代价从低到高：

1. *减弱 KL 项的压力*：KL 权重小于 1，或者用预热在前几个轮次里把它从 0 逐渐升到 1，使解码器在惩罚生效之前就开始使用编码。一种相关的手段是**自由比特**（free bits），它给每个坐标设一个以奈特计的下限，低于这个下限的 KL 不计入惩罚。
2. *让重建更值钱，或者让解码器不那么自给自足*。方差相对于数据较大的高斯解码器，会让误差变得便宜而信息变得昂贵；求和的平方误差就是 $\sigma_x^2 = \tfrac12$ 时的这种似然（[第 3 节](#s3)），所以更小的方差（或者对 $[0, 1]$ 中的像素使用伯努利似然）会把兑换比率调向有利于重建的一方。另一方面，较小的或自回归程度较低的解码器离开编码就无法对 $\mathbf{x}$ 建模，所以它必须使用编码。

两者都不能保证一个未被使用的坐标会变得有用。衡量结果要看你最初需要什么，例如留出数据上的证据下界，或在编码上训练的探测器的精度，而不是看活跃维度的个数。
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
(a) 对固定的 $G$，GAN 的值函数为 $V = \int\big[p_{\text{data}}(\mathbf{x})\log D(\mathbf{x}) + p_g(\mathbf{x})\log(1 - D(\mathbf{x}))\big]\,d\mathbf{x}$。逐点最大化被积函数，求出 $D^*(\mathbf{x})$。

(b) 代入 $D^*$，证明 $V(G, D^*) = -\log 4 + 2\,\mathrm{JSD}(p_{\text{data}} \,\|\, p_g)$，其中 $\mathrm{JSD}(p \,\|\, q) = \tfrac12 D_{\KL}(p \,\|\, m) + \tfrac12 D_{\KL}(q \,\|\, m)$，$m = (p + q)/2$。

(c) 在三个点上用 $p_{\text{data}} = (0.6, 0.3, 0.1)$ 和 $p_g = (0.2, 0.3, 0.5)$ 核对这个结果。
:::

::: solution
**(a) 最优判别器**。这个积分是彼此独立的被积函数之和，每个 $\mathbf{x}$ 一个，而 $D$ 是一个自由函数，所以对 $D$ 的最大值可以通过对每个被积函数分别关于数 $y = D(\mathbf{x}) \in (0, 1)$ 求最大来得到。记 $a = p_{\text{data}}(\mathbf{x})$ 和 $b = p_g(\mathbf{x})$，二者都为正，并记 $f(y) = a\log y + b\log(1 - y)$。于是

$$
f'(y) = \frac{a}{y} - \frac{b}{1-y} = 0 \;\Longrightarrow\; a(1 - y) = b\,y \;\Longrightarrow\; y^* = \frac{a}{a + b}.
$$

二阶导数 $f''(y) = -a/y^2 - b/(1-y)^2$ 为负，所以 $f$ 是凹的，驻点就是它的最大值点。因此

$$
D^*(\mathbf{x}) = \frac{p_{\text{data}}(\mathbf{x})}{p_{\text{data}}(\mathbf{x}) + p_g(\mathbf{x})}.
$$

这是在真实点和生成点一比一混合的情况下，$\mathbf{x}$ 为真实样本的后验概率：贝叶斯最优分类器。

**(b) 最优处的值**。代入，利用 $1 - D^* = p_g/(p_{\text{data}} + p_g)$，并记 $p = p_{\text{data}}$，$q = p_g$：

$$
V(G, D^*) = \mathbb{E}_{p}\!\left[\log\frac{p}{p + q}\right] + \mathbb{E}_{q}\!\left[\log\frac{q}{p + q}\right].
$$

令 $m = (p + q)/2$，则 $p + q = 2m$，所以 $\log\frac{p}{p+q} = \log\frac{p}{m} - \log 2$，$q$ 的情形同理。常数可以从期望中提出来（$\mathbb{E}_p[1] = \mathbb{E}_q[1] = 1$）：

$$
V = \underbrace{\mathbb{E}_{p}\!\left[\log\frac{p}{m}\right]}_{D_{\KL}(p\|m)} + \underbrace{\mathbb{E}_{q}\!\left[\log\frac{q}{m}\right]}_{D_{\KL}(q\|m)} - 2\log 2
= D_{\KL}(p\,\|\,m) + D_{\KL}(q\,\|\,m) - \log 4.
$$

按 JSD 的定义，两个 KL 项之和为 $2\,\mathrm{JSD}(p\,\|\,q)$，所以 $V(G, D^*) = -\log 4 + 2\,\mathrm{JSD}(p_{\text{data}}\,\|\,p_g)$。JSD 非负，且只有在两个分布相等时为零，所以生成器的最好值是 $-\log 4 = -1.3863$，在 $p_g = p_{\text{data}}$ 时取到。在这个意义上，配有完美判别器的 GAN 是在最小化一种散度。而这个前提条件就是 GAN 训练困难的全部故事：判别器从来不是完美的，而当它接近完美时，它传给生成器的梯度会消失（[第 4 节](#s4)）。

**(c) 核对**。

*最优判别器*。$D^* = \big(\tfrac{0.6}{0.8}, \tfrac{0.3}{0.6}, \tfrac{0.1}{0.6}\big) = (0.75, 0.5, 0.1667)$。

*值*。数据项为 $0.6\log 0.75 + 0.3\log 0.5 + 0.1\log 0.1667 = -0.1726 - 0.2079 - 0.1792 = -0.5597$。生成器项，利用 $1 - D^* = (0.25, 0.5, 0.8333)$，为 $0.2\log 0.25 + 0.3\log 0.5 + 0.5\log 0.8333 = -0.2773 - 0.2079 - 0.0912 = -0.5764$。所以 $V = -1.1361$。

*经由 JSD*。$m = (0.4, 0.3, 0.3)$。$D_{\KL}(p\,\|\,m) = 0.6\log\tfrac{0.6}{0.4} + 0.3\log 1 + 0.1\log\tfrac{0.1}{0.3} = 0.2433 + 0 - 0.1099 = 0.1334$，$D_{\KL}(q\,\|\,m) = 0.2\log\tfrac{0.2}{0.4} + 0 + 0.5\log\tfrac{0.5}{0.3} = -0.1386 + 0.2554 = 0.1168$。所以 $\mathrm{JSD} = \tfrac12(0.1334 + 0.1168) = 0.1251$，而 $-1.3863 + 2(0.1251) = -1.1361$。两条途径在四位小数上一致。

这个值位于两个极端 $-\log 4 = -1.3863$（分布相同）和 $0$（支撑集不相交，此时 $D^*$ 能完美区分真实样本和生成样本）之间，理应如此。一段简短的脚本复现了所有这些数字。

```python
import numpy as np

p = np.array([0.6, 0.3, 0.1])        # p_data
q = np.array([0.2, 0.3, 0.5])        # p_g
d_star = p / (p + q)
value = (p * np.log(d_star)).sum() + (q * np.log(1 - d_star)).sum()
m = (p + q) / 2
jsd = 0.5 * (p * np.log(p / m)).sum() + 0.5 * (q * np.log(q / m)).sum()
print("D* =", d_star.round(4))
print(f"V = {value:.4f}   -log 4 + 2 JSD = {-np.log(4) + 2 * jsd:.4f}   JSD = {jsd:.4f}")
```

```output
D* = [0.75   0.5    0.1667]
V = -1.1361   -log 4 + 2 JSD = -1.1361   JSD = 0.1251
```
:::

::: exercise id=e5 level=1 kind=conceptual minutes=5
一个在涡轮叶片横截面图像上训练的 GAN 生成的样本，工程师无法与真实图像区分开，而它的判别器精度在 50% 附近徘徊。描述一种能揭示模式坍塌的测量：计算什么，与什么比较，什么样的结果表明发生了坍塌。然后解释为什么判别器 50% 的精度不能作为反驳模式坍塌的证据。
:::

::: solution
**测量覆盖度，而不是真实感**。模式坍塌是生成器未能到达 $p_{\text{data}}$ 的某些部分。一个问“样本看起来真实吗？”的测量，从构造上就看不到它，因为每个样本都可以看起来很真实，而样本的种类仍然可以很少。应当反过来问：真实数据是否靠近样本。

1. 用一个向量描述每个叶片截面：可以是用在别的数据上训练的网络得到的图像特征嵌入，或者，对工程用途更好的是，少数几个几何参数（弦长、厚度、弯度、冷却孔数量）。对一组留出的真实截面，以及数量相同的生成截面，都这样做。
2. 对每个留出的真实截面，求它到最近的生成样本的距离（一种**类似召回率的**距离）。
3. 把它与一个可信的参照比较：每个留出的真实截面到*同样大小的另一组真实截面*中最近邻的距离。这个参照说明在这个样本量下完美的生成器能接近到什么程度，因为完美的生成器从同一个分布中抽样。
4. 同时计算**类似精确率的**距离，即每个生成样本到最近真实截面的距离，这就是真实感的度量。

**什么表明发生了坍塌**。真实到样本的距离远大于真实到真实的参照距离，而且超出的部分是集中的：一组真实截面（一个叶片族）附近根本没有生成样本。一个在偏斜分布下也站得住的汇总量，是到样本的距离超过（比如）参照距离第 99 百分位数的真实截面所占的比例。对于覆盖了数据的生成器，按百分位数的定义，这个比例约为 1%。真实感，即类似精确率的距离，始终很小，这就是为什么真实感指标或人工评判无法发现这个问题。

下面是一个构造出来的示例，并不是对任何真实 GAN 的测量：把八种截面看作一个圆环上的八个紧凑的簇，一个生成器只完美地采样其中三种，另一个生成器覆盖全部八种。

```python
import numpy as np
from scipy.spatial import cKDTree

rng = np.random.default_rng(0)
angles = 2 * np.pi * np.arange(8) / 8
centres = 2.0 * np.stack([np.cos(angles), np.sin(angles)], axis=1)   # 8 kinds of section

def draw(n, kinds):
    k = rng.choice(kinds, size=n)
    return centres[k] + 0.1 * rng.standard_normal((n, 2))

train_real = draw(2000, range(8))           # stands in for the real sections
held_out = draw(1000, range(8))             # held-out real sections
full = draw(1000, range(8))                 # a generator that covers every kind
collapsed = draw(1000, [0, 3, 5])           # perfect samples, but only 3 kinds

def median_nn(queries, reference):
    return np.median(cKDTree(reference).query(queries)[0])

print(f"real -> real (reference)   {median_nn(held_out, train_real[:1000]):.3f}")
d_ref = cKDTree(train_real[:1000]).query(held_out)[0]
for name, gen in (("covering generator", full), ("collapsed generator", collapsed)):
    d_gen = cKDTree(gen).query(held_out)[0]
    uncovered = np.mean(d_gen > np.quantile(d_ref, 0.99))
    print(f"{name}: sample->real {median_nn(gen, held_out):.3f}, "
          f"real->sample {median_nn(held_out, gen):.3f}, "
          f"uncovered real sections {uncovered:.3f}")
```

```output
real -> real (reference)   0.016
covering generator: sample->real 0.016, real->sample 0.016, uncovered real sections 0.011
collapsed generator: sample->real 0.016, real->sample 1.141, uncovered real sections 0.621
```

坍塌的生成器和覆盖全部的生成器同样真实（都是 0.016），但 62% 的真实截面离每个样本的距离都超过了参照距离；这正是 $5/8 = 62.5\%$，即它从未访问的五个簇。真实到样本距离的中位数从 0.016 跳到 1.141，仅仅是因为一半以上的数据没有被覆盖：如果坍塌只遗漏了三分之一的数据，中位数就不会变，这就是为什么未覆盖比例是更好的汇总量。同样的样本到训练集的距离也能揭示相反的失败：近乎复制训练图像。

**为什么 50% 的判别器精度什么也证明不了**。判别器被训练来*在样本所在之处*区分样本和数据。生成器从未访问的 $p_{\text{data}}$ 区域对生成器的损失没有任何贡献，因为生成器只因它生成的样本而得到奖励；判别器在那里也看不到可供区分的生成样本。接近 50% 意味着在生成器访问的地方它与数据无法区分，对它没有访问的地方则什么也没说。此外，两个网络进行的是一场博弈，而不是一个优化问题：一个周期性振荡、总在追逐生成器当前偏爱的模式的判别器，平均精度会在 50% 附近，而生成器则从一个模式跳到下一个模式（[第 4 节](#s4)）。这个精度是两个参与者之间平衡的表征，而不是覆盖度的表征。
:::

::: exercise id=e6 level=2 kind=derivation minutes=10
证明逐步前向过程 $q(\mathbf{x}_t\mid\mathbf{x}_{t-1}) = \mathcal{N}\big(\sqrt{1-\beta_t}\,\mathbf{x}_{t-1},\ \beta_t\mathbf{I}\big)$ 给出 $q(\mathbf{x}_t\mid\mathbf{x}_0) = \mathcal{N}\big(\sqrt{\bar\alpha_t}\,\mathbf{x}_0,\ (1-\bar\alpha_t)\mathbf{I}\big)$，其中 $\bar\alpha_t = \prod_{s\le t}(1-\beta_s)$。写出 $\mathbf{x}_t = \sqrt{\alpha_t}\,\mathbf{x}_{t-1} + \sqrt{1-\alpha_t}\,\boldsymbol{\epsilon}_t$，假设结论对 $t - 1$ 成立，并利用这样一个事实：独立的零均值高斯变量之和是高斯变量，其方差为各方差之和。
:::

::: solution
**准备**。记 $\alpha_t = 1 - \beta_t$，从 $\mathcal{N}(\sqrt{\alpha_t}\,\mathbf{x}_{t-1}, \beta_t\mathbf{I})$ 中采样，等同于题中所给的单行更新，其中 $\boldsymbol{\epsilon}_t \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ 是新抽取的，与第 $t$ 步之前的一切都独立：把标准正态变量乘以 $\sqrt{\beta_t} = \sqrt{1-\alpha_t}$ 得到方差 $\beta_t$，加上均值则使其平移。我们对 $t$ 用归纳法证明这个结论，归纳命题为：“$\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\bar{\boldsymbol{\epsilon}}_t$，其中某个 $\bar{\boldsymbol{\epsilon}}_t \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ 与之后的噪声 $\boldsymbol{\epsilon}_{t+1}, \boldsymbol{\epsilon}_{t+2}, \dots$ 独立”。归纳步需要的正是与之后噪声的独立性。

**基础情形，$t = 1$**。$\mathbf{x}_1 = \sqrt{\alpha_1}\,\mathbf{x}_0 + \sqrt{1-\alpha_1}\,\boldsymbol{\epsilon}_1$，且 $\bar\alpha_1 = \alpha_1$，所以取 $\bar{\boldsymbol{\epsilon}}_1 = \boldsymbol{\epsilon}_1$ 时命题成立。

**归纳步**。假设命题对 $t - 1$ 成立，把它代入第 $t$ 步的更新：

$$
\mathbf{x}_t = \sqrt{\alpha_t}\Big(\sqrt{\bar\alpha_{t-1}}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_{t-1}}\,\bar{\boldsymbol{\epsilon}}_{t-1}\Big) + \sqrt{1-\alpha_t}\,\boldsymbol{\epsilon}_t
= \sqrt{\alpha_t\bar\alpha_{t-1}}\,\mathbf{x}_0 + \underbrace{\sqrt{\alpha_t(1-\bar\alpha_{t-1})}\,\bar{\boldsymbol{\epsilon}}_{t-1} + \sqrt{1-\alpha_t}\,\boldsymbol{\epsilon}_t}_{\text{噪声}}.
$$

由于 $\alpha_t\bar\alpha_{t-1} = \bar\alpha_t$，均值为 $\sqrt{\bar\alpha_t}\,\mathbf{x}_0$。噪声是两个独立的零均值高斯向量之和（由归纳假设，$\bar{\boldsymbol{\epsilon}}_{t-1}$ 与 $\boldsymbol{\epsilon}_t$ 独立），协方差分别为 $\alpha_t(1-\bar\alpha_{t-1})\mathbf{I}$ 和 $(1-\alpha_t)\mathbf{I}$。它们的和是均值为零的高斯向量，协方差为

$$
\big[\alpha_t - \alpha_t\bar\alpha_{t-1} + 1 - \alpha_t\big]\mathbf{I} = \big(1 - \alpha_t\bar\alpha_{t-1}\big)\mathbf{I} = (1 - \bar\alpha_t)\,\mathbf{I}.
$$

协方差为 $(1-\bar\alpha_t)\mathbf{I}$ 的零均值高斯向量可以写成 $\sqrt{1-\bar\alpha_t}\,\bar{\boldsymbol{\epsilon}}_t$，其中 $\bar{\boldsymbol{\epsilon}}_t \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$，而 $\bar{\boldsymbol{\epsilon}}_t$ 只由 $\bar{\boldsymbol{\epsilon}}_{t-1}$ 和 $\boldsymbol{\epsilon}_t$ 构成，所以它与 $\boldsymbol{\epsilon}_{t+1}, \dots$ 独立。归纳就此完成，并给出

$$
q(\mathbf{x}_t\mid\mathbf{x}_0) = \mathcal{N}\big(\sqrt{\bar\alpha_t}\,\mathbf{x}_0,\ (1-\bar\alpha_t)\mathbf{I}\big).
$$

**归纳步为什么成立**。关键的恒等式是 $\alpha_t(1-\bar\alpha_{t-1}) + (1-\alpha_t) = 1 - \alpha_t\bar\alpha_{t-1}$：之前的噪声已经累积的方差，乘以信号所乘的同一个因子 $\alpha_t$ 而缩小，再加上这一步的新噪声，恰好等于信号缩小的权重所缺少的部分。两个尺度的平方在每个 $t$ 上都相加为 1，这就是这个过程能让单位方差的数据保持单位方差的原因。

**数值核对**。取三步，$\beta = (0.1, 0.2, 0.3)$（有意夸大，使数字清晰可见），于是 $\alpha = (0.9, 0.8, 0.7)$，$\bar\alpha = (0.9,\ 0.72,\ 0.504)$。对固定的 $\mathbf{x}_0$，$\mathbf{x}_t$ 的方差满足 $\mathrm{Var}_t = \alpha_t\mathrm{Var}_{t-1} + \beta_t$。递推给出 $0.1$，然后 $0.8 \times 0.1 + 0.2 = 0.28$，然后 $0.7 \times 0.28 + 0.3 = 0.496$，正如公式所说，它们等于 $1 - \bar\alpha_t = 0.1, 0.28, 0.496$。

```python
import numpy as np

beta = np.array([0.1, 0.2, 0.3])
alpha = 1 - beta
alpha_bar = np.cumprod(alpha)

var = 0.0
for t in range(3):
    var = alpha[t] * var + beta[t]       # variance recursion for fixed x_0
    print(f"t={t + 1}: recursion {var:.4f}   1 - alpha_bar {1 - alpha_bar[t]:.4f}")

rng = np.random.default_rng(0)
x = np.ones(1_000_000)                   # one million chains started at x_0 = 1
for t in range(3):
    x = np.sqrt(alpha[t]) * x + np.sqrt(beta[t]) * rng.standard_normal(x.size)
print(f"sampled mean {x.mean():.4f} (sqrt(alpha_bar) = {np.sqrt(alpha_bar[2]):.4f}), "
      f"sampled variance {x.var():.4f}")
```

```output
t=1: recursion 0.1000   1 - alpha_bar 0.1000
t=2: recursion 0.2800   1 - alpha_bar 0.2800
t=3: recursion 0.4960   1 - alpha_bar 0.4960
sampled mean 0.7097 (sqrt(alpha_bar) = 0.7099), sampled variance 0.4953
```

把这条链运行一百万次，得到的均值 $0.7097$ 对比 $\sqrt{0.504} = 0.7099$，方差 $0.4953$ 对比 $0.496$，与闭式解的预测一致（最后几位是抽样噪声）。
:::

::: exercise id=e7 level=2 kind=calculation minutes=10
Ho 等人的线性调度在 $T = 1000$ 步上让 $\beta_t$ 从 $10^{-4}$ 均匀增加到 $0.02$。

(a) 利用 $\log(1-\beta) \approx -\beta$ 估计 $\bar\alpha_T$，并与精确乘积 $4.04\times10^{-5}$ 比较。

(b) 有人保持同样的 $\beta$ 范围，但设 $T = 100$。估计 $\bar\alpha_T$ 和 $\sqrt{\bar\alpha_T}$。

(c) 解释从 $\mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ 出发对这个模型采样时会出什么问题，并给出两种修正方法。
:::

::: solution
**工具**。$\bar\alpha_T = \prod_t(1-\beta_t)$，所以 $\log\bar\alpha_T = \sum_t\log(1-\beta_t)$。级数 $\log(1-\beta) = -\beta - \tfrac12\beta^2 - \dots$ 表明，对小的 $\beta$，第一项占主导，$\bar\alpha_T \approx \exp(-\sum_t\beta_t)$。

**(a)** 各 $\beta_t$ 构成等差数列，所以它们的和等于项数乘以两端点的平均值：$1000 \times (10^{-4} + 0.02)/2 = 1000 \times 0.01005 = 10.05$。于是 $\bar\alpha_T \approx e^{-10.05} = 4.32\times10^{-5}$，与精确值 $4.04\times10^{-5}$ 相差在 7% 以内。差异的大部分来自级数的下一项。这里 $\sum_t\beta_t^2/2 = 0.067$，所以 $\bar\alpha_T \approx e^{-10.05 - 0.067} = 4.04\times10^{-5}$，在三位有效数字上吻合。最后一步留下的信号幅度为 $\sqrt{\bar\alpha_T} = 0.0064$：不是零，但约为信号的 0.6%，小到足以从纯噪声出发对模型采样。

**(b)** 当 $T = 100$ 时，同样的范围给出 $\sum_t\beta_t = 100 \times 0.01005 = 1.005$，所以 $\bar\alpha_T \approx e^{-1.005} = 0.366$。精确乘积为 $0.364$（修正项现在只有 $\sum\beta^2/2 = 0.0067$）。所以 $\sqrt{\bar\alpha_T} \approx 0.60$：**在噪声最大的一步，仍有 60% 的信号幅度留存**，$\mathbf{x}_T$ 远非 $\mathcal{N}(\mathbf{0}, \mathbf{I})$。这个调度是为十倍的步数设计的；每一步加入固定的少量噪声，步数只有十分之一时，总噪声就远远不够。

**(c) 会出什么问题**。采样从 $\mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ 开始，这是一个不含信号的抽样。但训练时网络在 $t = T$ 看到的输入是 $\mathbf{x}_T = 0.60\,\mathbf{x}_0 + 0.80\,\boldsymbol{\epsilon}$，其中仍含有清晰的信号。在第一个反向步，网络遇到了一个它从未在其上训练过的输入分布，即训练与测试不匹配，它对噪声的预测会出现系统性的错误：它预期在输入中找到 $\mathbf{x}_0$，于是从噪声中读出结构，而这个误差会传播到之后的所有步。对于最后一步不是纯噪声的图像模型，这个效应已有文献记录：这类模型无法生成很亮或很暗的图像，因为训练信号的平均亮度会透过噪声泄漏出来（Lin 等人 2024，见参考文献）。

**两种修正方法**。

1. *把调度按新的 $T$ 重新缩放*，使 $\bar\alpha_T$ 再次接近 0：把范围乘以 $1000/T = 10$，得到从 $10^{-3}$ 到 $0.2$ 的 $\beta_t$。和又是 10.05，精确的 $\bar\alpha_T = 2.0\times10^{-5}$。
2. *使用一个设计为以噪声结束的调度*，例如余弦调度，它在 $T = 100$ 时给出 $\bar\alpha_T = 2.4\times10^{-7}$（与原文一样，把 $\beta_T$ 裁剪到 0.999），或者把任何调度重新缩放到终端信噪比为零。

（步数更少也会使每一步更大，所以粗糙的线性调度在反向过程中会损失精度；重新缩放修正的是端点，而不是离散化。）

```python
import numpy as np

def report(name, beta):
    alpha_bar = np.prod(1 - beta)
    print(f"{name:34s} sum(beta) {beta.sum():6.3f}  e^-sum {np.exp(-beta.sum()):.3e}  "
          f"alpha_bar_T {alpha_bar:.3e}  sqrt {np.sqrt(alpha_bar):.4f}")

report("T=1000, 1e-4 to 0.02", np.linspace(1e-4, 0.02, 1000))
report("T=100,  1e-4 to 0.02", np.linspace(1e-4, 0.02, 100))
report("T=100,  rescaled 1e-3 to 0.2", np.linspace(1e-3, 0.2, 100))

T, s = 100, 0.008                        # cosine schedule, s = 0.008
t = np.arange(T + 1) / T
f = np.cos((t + s) / (1 + s) * np.pi / 2) ** 2
report("T=100, cosine (clip 0.999)", np.clip(1 - f[1:] / f[:-1], 0, 0.999))
```

```output
T=1000, 1e-4 to 0.02               sum(beta) 10.050  e^-sum 4.319e-05  alpha_bar_T 4.036e-05  sqrt 0.0064
T=100,  1e-4 to 0.02               sum(beta)  1.005  e^-sum 3.660e-01  alpha_bar_T 3.636e-01  sqrt 0.6030
T=100,  rescaled 1e-3 to 0.2       sum(beta) 10.050  e^-sum 4.319e-05  alpha_bar_T 2.039e-05  sqrt 0.0045
T=100, cosine (clip 0.999)         sum(beta)  7.879  e^-sum 3.787e-04  alpha_bar_T 2.429e-07  sqrt 0.0005
```

读这张表时要注意两点。对余弦调度那一行，$e^{-\sum\beta}$ 近似很差（它的最后一个 $\beta$ 是 0.999，一阶级数不适用），所以应当使用精确乘积。而 $\beta$ 高达 0.2 的重新缩放调度，单步很大；它的端点是对的，但路径不一定最好。
:::

::: exercise id=e8 level=2 kind=calculation minutes=10
一个有三个基本事件输入的门构成一个星形图：中心 $c$ 与叶子 $a$、$b$ 和 $d$ 相连。

(a) 写出 $\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}(\mathbf{A} + \mathbf{I})\tilde{\mathbf{D}}^{-1/2}$。

(b) 取标量特征 $\mathbf{x} = (1, 0, 0, 0)$（中心排在第一位），计算 $\hat{\mathbf{A}}\mathbf{x}$ 和 $\hat{\mathbf{A}}^2\mathbf{x}$。

(c) 利用特征向量 $\mathbf{u} \propto \tilde{\mathbf{D}}^{1/2}\mathbf{1}$，求 $k$ 增大时 $\hat{\mathbf{A}}^k\mathbf{x}$ 的极限，以及中心的值与叶子的值之比。

(d) $\hat{\mathbf{A}}$ 的特征值为 $1$、$0.5$、$0.5$ 和 $-0.25$，属于 $0.5$ 的特征向量在中心处为零，在各叶子上之和为零。对这个 $\mathbf{x}$，$\hat{\mathbf{A}}^k\mathbf{x}$ 以多快的速度趋于其极限？为什么不是 $0.5^k$？
:::

::: solution
**(a) 矩阵**。加上自环得到 $\tilde{\mathbf{A}} = \mathbf{A} + \mathbf{I}$，其中中心与每个节点相连，每个叶子与中心及自身相连。行和就是含自环的度：$\tilde{d}_c = 1 + 3 = 4$，$\tilde{d}_{\text{leaf}} = 1 + 1 = 2$。$\hat{\mathbf{A}}$ 的第 $(i, j)$ 个元素为 $\tilde{A}_{ij}/\sqrt{\tilde{d}_i\tilde{d}_j}$，所以：

- 中心到自身：$1/\sqrt{4\cdot4} = 1/4$；
- 中心到一个叶子，以及反方向：$1/\sqrt{4\cdot2} = 1/\sqrt8 = 0.3536$；
- 一个叶子到自身：$1/\sqrt{2\cdot2} = 1/2$；
- 两个叶子之间：0（它们不相邻）。

$$
\hat{\mathbf{A}} = \begin{pmatrix} 0.25 & 0.3536 & 0.3536 & 0.3536 \\ 0.3536 & 0.5 & 0 & 0 \\ 0.3536 & 0 & 0.5 & 0 \\ 0.3536 & 0 & 0 & 0.5 \end{pmatrix}.
$$

**(b) 两层传播**。$\hat{\mathbf{A}}\mathbf{x}$ 就是 $\hat{\mathbf{A}}$ 的第一列：$(0.25,\ 0.3536,\ 0.3536,\ 0.3536)$。一步之后，特征已经到达每个叶子，每个叶子得到 $0.3536$，比中心自己的 $0.25$ 还多（中心的值被除以 $4$，而每个叶子的值被除以 $\sqrt8$）。再应用一次 $\hat{\mathbf{A}}$，逐行计算：

- 中心：$0.25\times0.25 + 3\times(0.3536\times0.3536) = 0.0625 + 3\times0.125 = 0.4375$；
- 每个叶子：$0.3536\times0.25 + 0.5\times0.3536 = 0.0884 + 0.1768 = 0.2652$。

所以 $\hat{\mathbf{A}}^2\mathbf{x} = (0.4375,\ 0.2652,\ 0.2652,\ 0.2652)$。中心的值上下摆动，而叶子的值逐渐稳定。

**(c) 极限**。向量 $\tilde{\mathbf{D}}^{1/2}\mathbf{1}$ 是 $\hat{\mathbf{A}}$ 属于特征值 1 的特征向量：

$$
\hat{\mathbf{A}}\,\tilde{\mathbf{D}}^{1/2}\mathbf{1} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{A}}\,\tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{D}}^{1/2}\mathbf{1} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{A}}\,\mathbf{1} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{d}} = \tilde{\mathbf{D}}^{1/2}\mathbf{1},
$$

因为 $\tilde{\mathbf{A}}\mathbf{1}$ 是行和构成的向量 $\tilde{\mathbf{d}}$，而 $\tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{d}} = \tilde{\mathbf{D}}^{1/2}\mathbf{1}$。这里它是 $(2, \sqrt2, \sqrt2, \sqrt2)$；归一化为单位长度（它的范数平方为 $4 + 6 = 10$），得 $\mathbf{u} = (2, \sqrt2, \sqrt2, \sqrt2)/\sqrt{10} = (0.6325, 0.4472, 0.4472, 0.4472)$。

$\hat{\mathbf{A}}$ 是对称的，所以它的特征向量相互正交，$\mathbf{x}$ 可以按它们分解。其余每个特征值的模都小于 1（它们是 $0.5, 0.5, -0.25$），所以多次应用之后，只有沿 $\mathbf{u}$ 的分量留存：$\hat{\mathbf{A}}^k\mathbf{x} \to \mathbf{u}\,(\mathbf{u}^\top\mathbf{x})$。由 $\mathbf{u}^\top\mathbf{x} = 0.6325$，

$$
\lim_{k\to\infty}\hat{\mathbf{A}}^k\mathbf{x} = 0.6325\,\mathbf{u} = (0.4,\ 0.2828,\ 0.2828,\ 0.2828).
$$

它的中心与叶子之比为 $\sqrt{\tilde{d}_c/\tilde{d}_{\text{leaf}}} = \sqrt{4/2} = \sqrt2 = 1.414$。**在极限中，各节点只按其度的平方根而不同**：无论输入特征是什么，它都已被冲刷掉，剩下的只是每个节点连接的紧密程度。这是最纯粹形式的过平滑（[第 8 节](#s8)）。

**(d) 有多快**。$k$ 步之后的误差是 $\hat{\mathbf{A}}^k\mathbf{x}$ 减去极限，也就是 $\mathbf{x}$ 中与 $\mathbf{u}$ 正交的部分被其他特征值乘了 $k$ 次。把它分解：

$$
\mathbf{x} - \mathbf{u}(\mathbf{u}^\top\mathbf{x}) = (1, 0, 0, 0) - (0.4, 0.2828, 0.2828, 0.2828) = (0.6,\ -0.2828,\ -0.2828,\ -0.2828).
$$

属于 $0.5$ 的特征向量在中心处为零，在各叶子上之和为零，所以一个在三个叶子上取相同值的向量在它们上面没有分量（它与每个这样的特征向量的内积，等于该值乘以特征向量各叶子分量之和，即 0）。余下部分在三个叶子上都取值 $-0.2828$，所以它完全落在最后一个特征向量上，即属于 $\lambda = -0.25$ 的那个：确实，$(0.6, -0.2828, -0.2828, -0.2828)$ 与 $(-2.121, 1, 1, 1)$ 成比例，并且可以直接验证 $\hat{\mathbf{A}}\mathbf{v} = -0.25\,\mathbf{v}$（中心行：$0.25(-2.121) + 3(0.3536) = 0.530 = -0.25(-2.121)$；叶子行：$0.3536(-2.121) + 0.5 = -0.25$）。所以误差每一步乘以 $-0.25$：**它每步缩小为四分之一并改变符号**，这就是 (b) 中看到的摆动，中心的值依次为 $0.25 \to 0.4375 \to 0.3906 \to 0.4023 \to \dots$，围绕 0.4 摆动。对 $k = 1, \dots, 4$，相对误差 $\|\hat{\mathbf{A}}^k\mathbf{x} - \text{极限}\| / \|\text{极限}\|$ 为 $0.306,\ 0.0765,\ 0.0191,\ 0.0048$：从 $k = 4$ 起低于 1%。

第二大的特征值模（这里是 $0.5$）给出了*任何*特征向量收敛速率的界，但实际速率取决于特征触及了哪些特征向量。一个叶子的特征 $\mathbf{x} = (0, 1, 0, 0)$ 在 $\lambda = 0.5$ 的特征空间上有分量（这个分量是 $(0, \tfrac23, -\tfrac13, -\tfrac13)$，范数为 $0.8165$，而极限的范数为 $0.4472$），因而以 $0.5^k$ 收敛：相对误差为 $1.83 \times 0.5^k$ 加上 $-0.25$ 的部分，在 $k = 1$ 时为 $0.935$，$k = 4$ 时为 $0.114$，$k = 8$ 时为 $0.0071$，只有从 $k = 8$ 起才低于 1%。对称的输入收敛得快；不对称的输入则受最差的特征值限制。

```python
import numpy as np

A = np.zeros((4, 4))
A[0, 1:] = A[1:, 0] = 1                    # node 0 is the centre, 1-3 the leaves
A_tilde = A + np.eye(4)
d_tilde = A_tilde.sum(axis=1)              # (4, 2, 2, 2)
A_hat = A_tilde / np.sqrt(np.outer(d_tilde, d_tilde))
print("A_hat =\n", A_hat.round(4))
print("eigenvalues", np.linalg.eigvalsh(A_hat).round(4))

u = np.sqrt(d_tilde) / np.linalg.norm(np.sqrt(d_tilde))
for label, x in (("centre feature", np.array([1.0, 0, 0, 0])),
                 ("leaf feature  ", np.array([0, 1.0, 0, 0]))):
    limit = u * (u @ x)
    errors, h = [], x.copy()
    for k in range(1, 9):
        h = A_hat @ h
        errors.append(np.linalg.norm(h - limit) / np.linalg.norm(limit))
    print(label, "limit", limit.round(4))
    print("   relative error, k = 1..8:", " ".join(f"{e:.4f}" for e in errors))
    if label.startswith("centre"):
        print("   A_hat x   =", (A_hat @ x).round(4))
        print("   A_hat^2 x =", (A_hat @ A_hat @ x).round(4))
```

```output
A_hat =
 [[0.25   0.3536 0.3536 0.3536]
 [0.3536 0.5    0.     0.    ]
 [0.3536 0.     0.5    0.    ]
 [0.3536 0.     0.     0.5   ]]
eigenvalues [-0.25  0.5   0.5   1.  ]
centre feature limit [0.4    0.2828 0.2828 0.2828]
   relative error, k = 1..8: 0.3062 0.0765 0.0191 0.0048 0.0012 0.0003 0.0001 0.0000
   A_hat x   = [0.25   0.3536 0.3536 0.3536]
   A_hat^2 x = [0.4375 0.2652 0.2652 0.2652]
leaf feature   limit [0.2828 0.2    0.2    0.2   ]
   relative error, k = 1..8: 0.9354 0.4593 0.2286 0.1142 0.0571 0.0285 0.0143 0.0071
```
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
一位同事训练了一个两层 GCN，用来预测故障树中哪些节点是基本事件，特征中包含节点的度，并报告了 99% 的测试精度。这个结果应当与什么基线比较？这个基线得分多少？什么样的任务才能真正检验 GNN 是否学到了关于故障树结构的东西？
:::

::: solution
**基线是一条一行的规则**。在故障树中，基本事件恰好就是叶子，即下方没有输入的节点。叶子只与它的父门相连，所以每个只有一个邻居的非顶层节点都是基本事件。每个门至少有两个输入外加一个父节点（对顶事件而言，则至少有两个输入），所以门总是至少有两个邻居。因此，**“节点是基本事件，当且仅当它恰好有一个邻居”这条规则对每棵故障树的每个节点都正确：它的得分是 100%**。特征中含有度的模型等于被直接递上了答案：分类器只需要对一个输入设阈值。

所以 99% 的测试精度不能证明任何东西。它低于这个免费的基线。对任何分类结果，合理的比较都从使用同样输入的最廉价规则开始，如[模块 01](module_01_ZH.html) 所述，而应当报告的数字是超出它的幅度。

一个简短的实验说明了这一点。它生成 300 棵随机故障树（门有两个或三个输入，每个输入以 0.45 的概率是基本事件，否则是门，直到深度上限），对叶子规则打分，并在 200 棵树上训练一个只以度为特征的两层 GCN，在另外 100 棵树上测试：划分按树进行，绝不按节点进行，因为同一棵树的节点共享结构（数据泄漏，[模块 01](module_01_ZH.html)）。

```python
import numpy as np, torch, torch.nn as nn
rng = np.random.default_rng(0)
torch.manual_seed(0)

def random_fault_tree(max_depth=4):
    """Return (edges, is_basic_event). Node 0 is the top gate; gates have 2-3 inputs."""
    edges, is_basic, frontier = [], [False], [(0, 0)]
    while frontier:
        node, depth = frontier.pop()
        for _ in range(rng.integers(2, 4)):          # a gate has 2 or 3 inputs
            child = len(is_basic)
            leaf = depth + 1 >= max_depth or rng.random() < 0.45
            is_basic.append(bool(leaf))
            edges.append((node, child))
            if not leaf:
                frontier.append((child, depth + 1))
    return edges, np.array(is_basic)

def graph_tensors(edges, n):
    A = np.zeros((n, n), dtype=np.float32)
    for a, b in edges:
        A[a, b] = A[b, a] = 1.0
    At = A + np.eye(n, dtype=np.float32)
    dinv = 1.0 / np.sqrt(At.sum(1))
    return torch.tensor(dinv[:, None] * At * dinv[None, :]), A.sum(1)

trees = [random_fault_tree() for _ in range(300)]
data = []
for edges, basic in trees:
    n = len(basic)
    A_hat, deg = graph_tensors(edges, n)
    data.append((A_hat, torch.tensor(deg[:, None] / 4.0, dtype=torch.float32),
                 torch.tensor(basic, dtype=torch.float32)))
sizes = [len(b) for _, b in trees]
print("nodes per tree: min", min(sizes), "max", max(sizes))

# the baseline: a node with exactly one neighbour is a basic event
rule_correct = sum(int(((d[1].squeeze() == 0.25) == d[2].bool()).sum()) for d in data)
print(f"leaf rule accuracy: {rule_correct / sum(sizes):.4f}")

class GCN(nn.Module):
    def __init__(self, hidden=16):
        super().__init__()
        self.w1, self.w2 = nn.Linear(1, hidden), nn.Linear(hidden, 1)
    def forward(self, A_hat, x):
        h = torch.relu(A_hat @ self.w1(x))
        return (A_hat @ self.w2(h)).squeeze(-1)

train, test = data[:200], data[200:]            # split by tree, not by node
model = GCN()
opt = torch.optim.Adam(model.parameters(), lr=1e-2)
for epoch in range(300):
    for A_hat, x, y in train:
        loss = nn.functional.binary_cross_entropy_with_logits(model(A_hat, x), y)
        opt.zero_grad(); loss.backward(); opt.step()

def accuracy(split):
    ok = tot = 0
    with torch.no_grad():
        for A_hat, x, y in split:
            ok += int(((model(A_hat, x) > 0).float() == y).sum()); tot += len(y)
    return ok / tot

share = np.mean(np.concatenate([b for _, b in trees]))
print(f"GCN test accuracy: {accuracy(test):.4f}")
print(f"share of basic events (majority baseline): {max(share, 1 - share):.4f}")
```

```output
nodes per tree: min 3 max 58
leaf rule accuracy: 1.0000
GCN test accuracy: 0.8306
share of basic events (majority baseline): 0.6237
```

（最后几位在不同机器上可能不同。）叶子规则的得分恰好是 1.0000。GCN 接收度作为输入，并在每一层把它与邻居的度做平均，在这里得到 0.83，远高于多数类（0.62），也远低于规则：归一化的聚合把承载答案的那一个数字弄模糊了，网络必须学会撤销这种模糊。换一组特征或训练更久会改变这个数字，但它无法超过规则，也从来不可能超过。无论同事的 99% 反映的是什么，正确的解读都是：一条规则就解决了这个任务，而网络只是在近似它。

**一个检验结构的任务**。选一个需要几跳之外的信息、而且不是节点自身邻域大小的函数的标签。[实验 3](#lab3) 的例子是*单点故障*：一个基本事件单独失效就能导致顶事件发生，这在它通往顶层的路径上每个门都是或门时出现。一个节点是否满足条件，取决于一直到根节点的门类型，所以 $L$ 层的网络只能看到其中 $L$ 跳。按树划分来评估，与简单基线（多数类；“上方的门是或门”）以及精确算法比较，并报告精度随深度的变化。这样的结果才能说明消息传递是否学到了结构。
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
图 P 是完全二部图 $K_{3,3}$：两排各三个节点，每个节点与另一排的全部三个节点相连。图 Q 是三棱柱：两个三角形，对应的顶点相连。每个节点的特征向量都相同。解释为什么任何消息传递 GNN（GCN、GAT、GIN）无论有多少层，都会在两个图中给每个节点相同的嵌入，以及为什么求和或均值读出无法区分 P 和 Q。提出一种能区分它们的输入特征。
:::

::: solution
**两个图在局部看起来一样**。数一数：两者都有 6 个节点和 9 条边，而且两者中每个节点都恰好有三个邻居（在 $K_{3,3}$ 中是另一排的三个节点；在棱柱中是两个三角形邻居和对应的顶点）。它们都是 **3-正则图**。

**为什么每个节点最终得到相同的嵌入**。取消息传递网络的任意一层。一个节点的新嵌入是它自己当前嵌入和它的邻居嵌入构成的多重集的函数。最初，全部 12 个节点（每个图 6 个）携带相同的向量 $\mathbf{h}^{(0)}$。用归纳法，假设所有节点都携带相同的 $\mathbf{h}^{(l)}$。那么每个节点都收到同样的三条相同的消息，并应用同样的更新，所以全部携带相同的 $\mathbf{h}^{(l+1)}$。具体地：

- *GCN*：每个节点含自环的度都是 4，每个权重都是 $1/\sqrt{4\cdot4} = 1/4$，新嵌入为 $\phi\big(\tfrac14\mathbf{W}\mathbf{h} + 3\cdot\tfrac14\mathbf{W}\mathbf{h}\big)$，处处相同；
- *GAT*：注意力权重是在三个键相同的邻居上的 softmax，因此是均匀的（各 $1/3$）；相同向量的加权和就是该向量本身；
- *GIN*：三个相同向量之和是该向量的三倍，同样处处相同。

这对每一层都成立，所以任何深度都让所有节点嵌入保持相同，在两个图中都是如此，并且在 P 和 Q 中取相同的值。

**为什么读出也无济于事**。对六个相同向量的求和读出是 $6\mathbf{h}^{(L)}$，均值读出是 $\mathbf{h}^{(L)}$，对 P 和对 Q 都一样。最后一层之后的任何部分，看到的都只有这些相同的嵌入。

**背后的极限**。这就是 1-Weisfeiler-Lehman 极限：颜色细化（反复按节点自己的颜色及其邻居颜色构成的多重集为每个节点重新着色）永远不会把正则图的节点分开，而消息传递网络的区分能力至多与这个检验相当。然而这两个图是不同的对象：棱柱包含两个三角形，而 $K_{3,3}$ 是二部图，没有奇数长度的环，因而没有三角形。在安全分析的情境下，这就是两种冗余结构之间的差别，而消息传递网络会给它们打出相同的分数。

**打破平局的特征**（每一种都添加了消息传递自己算不出来的信息）：

- 经过每个节点的三角形个数：Q 的每个节点为 1，P 的每个节点为 0（等价地，$\mathbf{A}^3$ 的对角元除以 2；$\operatorname{tr}(\mathbf{A}^3)/6$ 对 Q 是 2 个三角形，对 P 是 0 个）；
- 经过该节点的最短环的长度：3 对 4；
- 随机节点标识符，它打破对称性，代价是嵌入依赖于随机抽取的结果；
- 谱位置编码。P 的邻接矩阵特征值为 $3, 0, 0, 0, 0, -3$，Q 的为 $3, 1, 0, 0, -2, -2$，所以连谱都能区分它们。

（特征值和三角形个数用 NumPy 计算；每个图的 $\mathbf{A}$ 的所有行和都等于 3。）
:::

::: exercise id=e11 level=2 kind=derivation minutes=10
对 $u'' + 2\zeta\omega_0 u' + \omega_0^2 u = 0$，$u(0) = 1$，$u'(0) = 0$，一个学生提出试探解 $u(t) = e^{-\zeta\omega_0 t}\cos\omega_0 t$：有衰减，但频率是无阻尼频率。

(a) 用符号运算求残差 $r(t)$。

(b) 对 $\zeta = 0.1$ 和 $\omega_0 = 2\pi$，计算 $r(0)$ 以及初始条件项 $(u(0) - 1)^2$ 和 $u'(0)^2$。

(c) 哪两处改动能给出精确解？PINN 的损失会如何报告这个试探函数的误差？
:::

::: solution
**(a) 残差**。记 $a = \zeta\omega_0$，于是方程为 $u'' + 2a\,u' + \omega_0^2 u = 0$，试探解为 $u = e^{-at}\cos\omega_0 t$。用乘积法则求两次导数：

$$
u' = -a\,e^{-at}\cos\omega_0 t - \omega_0\,e^{-at}\sin\omega_0 t = -e^{-at}\big(a\cos\omega_0 t + \omega_0\sin\omega_0 t\big),
$$

$$
u'' = a\,e^{-at}\big(a\cos\omega_0 t + \omega_0\sin\omega_0 t\big) - e^{-at}\big(-a\omega_0\sin\omega_0 t + \omega_0^2\cos\omega_0 t\big)
= e^{-at}\Big[(a^2 - \omega_0^2)\cos\omega_0 t + 2a\omega_0\sin\omega_0 t\Big].
$$

代入 $r = u'' + 2a\,u' + \omega_0^2 u$，提出因子 $e^{-at}$：

$$
r = e^{-at}\Big[(a^2 - \omega_0^2)\cos + 2a\omega_0\sin - 2a^2\cos - 2a\omega_0\sin + \omega_0^2\cos\Big].
$$

正弦项相消（$u''$ 中的 $+2a\omega_0$ 与 $2a\,u'$ 中的 $-2a\omega_0$）。余弦的系数为 $a^2 - \omega_0^2 - 2a^2 + \omega_0^2 = -a^2$。所以

$$
r(t) = -a^2e^{-at}\cos\omega_0 t = -\zeta^2\omega_0^2\,e^{-\zeta\omega_0 t}\cos\omega_0 t.
$$

残差是 $\zeta^2$ 量级的：一个衰减正确、频率略有偏差的试探解，就方程所能判断的而言，几乎就是一个解。这是 (c) 部分的关键。

**(b) 数值**。$\zeta^2\omega_0^2 = 0.01 \times (2\pi)^2 = 0.3948$，所以

- $r(0) = -0.3948$（余弦和指数都等于 1）；
- $u(0) = 1$，所以 $(u(0) - 1)^2 = 0$；
- $u'(0) = -a = -\zeta\omega_0 = -0.6283$（由 $u'$ 的表达式取 $t = 0$：$-a\cdot1 - \omega_0\cdot0$），所以 $u'(0)^2 = 0.3948$，等于 $a^2$。

**(c) 精确解，以及损失说明了什么**。误差在于无阻尼频率。形如 $e^{-at}\cos\omega t$ 的解的残差为 $e^{-at}(\omega_0^2 - a^2 - \omega^2)\cos\omega t$（在试探解自身的导数中以 $\omega$ 代替 $\omega_0$，做同样的代数运算），它为零当且仅当 $\omega^2 = \omega_0^2 - a^2 = \omega_0^2(1 - \zeta^2)$。因此两处改动是：

1. *在余弦中把 $\omega_0$ 换成阻尼频率* $\omega_d = \omega_0\sqrt{1 - \zeta^2} = 6.252$ rad/s。结果精确满足方程，但仍有 $u'(0) = -a \neq 0$。
2. *加上正弦项* $\dfrac{\zeta\omega_0}{\omega_d}\,e^{-at}\sin\omega_d t$。它也是同一个线性方程的解（对正弦做上面的代数运算，在同样的 $\omega$ 条件下给出零残差），所以加上它残差仍为零，而它在 0 处的导数为 $+a$，抵消了 $-a$：$u'(0) = 0$。

结果 $u = e^{-at}\big[\cos\omega_d t + (\zeta\omega_0/\omega_d)\sin\omega_d t\big]$ 就是[第 9 节](#s9)的精确解。符号运算核对证实了这一点：它的残差化简为 0，$u(0) = 1$，$u'(0) = 0$。

**PINN 的损失对这个试探解报告了什么**。三项：

- *初始位置*：$(u(0) - 1)^2 = 0$。
- *初始速度*：$u'(0)^2 = 0.395$。
- *残差*：$r^2$ 在 $[0, 2]$ s 上的均值。$\zeta^4\omega_0^4 e^{-2at}\cos^2\omega_0 t$ 在该区间上的积分除以区间长度 2，为 $0.0288$。在包含两个端点的 200 个均匀分布的配点上（如[实验 4](#lab4)），它为 $0.0291$。

所以在所有权重都为 1 时，损失把误差主要报告为*初始速度*误差（0.39），残差只贡献 0.03。方程几乎察觉不到错误的频率，因为残差在 $\zeta$ 上是二阶的；初始条件则对它非常敏感。两条教训：当解几乎正确时，小的残差只是一个很弱的证明；各损失项处在不同的尺度上，这就是权重要紧的原因。对比[第 9 节](#s9)中那个无阻尼的近似解，它的均方残差大了约一千倍（31.2 对 0.029）。

```python
import sympy as sp

t, z, w0 = sp.symbols("t zeta omega_0", positive=True)
a = z * w0

def residual(u):
    return sp.simplify(sp.diff(u, t, 2) + 2 * a * sp.diff(u, t) + w0**2 * u)

trial = sp.exp(-a * t) * sp.cos(w0 * t)
print("trial residual:", residual(trial))
wd = w0 * sp.sqrt(1 - z**2)
exact = sp.exp(-a * t) * (sp.cos(wd * t) + a / wd * sp.sin(wd * t))
print("exact residual:", residual(exact))
print("exact u(0), u'(0):", sp.simplify(exact.subs(t, 0)), sp.simplify(sp.diff(exact, t).subs(t, 0)))
vals = {z: 0.1, w0: 2 * sp.pi}
print("r(0) =", round(float(residual(trial).subs(t, 0).subs(vals)), 4))
print("u'(0) of trial =", round(float(sp.diff(trial, t).subs(t, 0).subs(vals)), 4))
```

```output
trial residual: -omega_0**2*zeta**2*exp(-omega_0*t*zeta)*cos(omega_0*t)
exact residual: 0
exact u(0), u'(0): 1 0
r(0) = -0.3948
u'(0) of trial = -0.6283
```
:::

::: exercise id=e12 level=3 kind=coding minutes=25
把[实验 4](#lab4) 的代码改用于热方程 $u_t = u_{xx}$，$x \in [0, 1]$，$t \in [0, 0.2]$，$u(x, 0) = \sin\pi x$，$u(0, t) = u(1, t) = 0$。

使用 tanh MLP（$2 \to 32 \to 32 \to 32 \to 1$），输入为 $(x,\ t/0.2)$；1,000 个随机配点，每步重新抽取；100 个初始条件点，每条边界上 100 个点；Adam，学习率 $10^{-3}$，8,000 步；所有损失权重为 1；并设 `torch.set_num_threads(1)`。在 $101 \times 51$ 的网格上报告相对于精确解 $e^{-\pi^2 t}\sin\pi x$ 的相对 $L_2$ 误差。

然后去掉边界项，从同一个种子再训练一次，报告误差以及 $u(0, 0.2)$、$u(0.5, 0.2)$ 和 $u(1, 0.2)$ 的值。解释网络收敛到了什么。
:::

::: solution
**计划**。损失有三项，每一项都是在各自的点上的平方均值：1,000 个内部点上的残差 $u_t - u_{xx}$，100 个点上的初始条件 $u(x, 0) - \sin\pi x$，以及 200 个点（每端 100 个）上的边界值 $u(0, t)$ 和 $u(1, t)$。网络的第二个输入是 $t/0.2$，所以它看到的两个输入都在 $[0, 1]$ 中；链式法则给出 $u_t = \tfrac{1}{0.2}\,\partial u/\partial s$，其中 $s = t/0.2$。为了避免这笔簿记，我通过一个辅助函数把 $(x, t)$ 送入网络，由它来做除法，并直接对 $t$ 求导，这样自动微分会自己乘上这个因子。每一步都用新的随机点，意味着损失在步与步之间带噪声，这就是为什么下面的日志报告的是固定网格上的误差，而不只是损失。

为了让两次运行*只*在边界项上不同，两者抽取完全相同的随机数（每一步都抽取所有的点；只有边界项的权重从 1 变为 0），并且从同一个种子开始。

```python
import time
import numpy as np
import torch
import torch.nn as nn

torch.set_num_threads(1)   # a network this small gains nothing from threads

T_END, STEPS = 0.2, 8000

def make_net():
    return nn.Sequential(nn.Linear(2, 32), nn.Tanh(), nn.Linear(32, 32), nn.Tanh(),
                         nn.Linear(32, 32), nn.Tanh(), nn.Linear(32, 1))

def u_net(net, x, t):
    """The network sees (x, t / T_END), both in [0, 1]."""
    return net(torch.cat([x, t / T_END], dim=1))

def grad(out, inp):
    return torch.autograd.grad(out, inp, grad_outputs=torch.ones_like(out),
                               create_graph=True)[0]

def residual(net, x, t):
    x = x.clone().requires_grad_(True)
    t = t.clone().requires_grad_(True)
    u = u_net(net, x, t)
    u_t = grad(u, t)
    u_xx = grad(grad(u, x), x)
    return u_t - u_xx

def sample_losses(net, gen):
    """Draw one fresh set of points and return the three loss terms."""
    x_c = torch.rand(1000, 1, generator=gen)
    t_c = T_END * torch.rand(1000, 1, generator=gen)
    x_i = torch.rand(100, 1, generator=gen)
    t_b = T_END * torch.rand(200, 1, generator=gen)           # 100 per end
    x_b = torch.cat([torch.zeros(100, 1), torch.ones(100, 1)])
    loss_r = residual(net, x_c, t_c).pow(2).mean()
    u0 = u_net(net, x_i, torch.zeros_like(x_i))
    loss_ic = (u0 - torch.sin(np.pi * x_i)).pow(2).mean()
    loss_bc = u_net(net, x_b, t_b).pow(2).mean()
    return loss_r, loss_ic, loss_bc

def exact(x, t):
    return np.exp(-np.pi ** 2 * t) * np.sin(np.pi * x)

def evaluate(net):
    xs, ts = np.linspace(0, 1, 101), np.linspace(0, T_END, 51)
    X, T = np.meshgrid(xs, ts, indexing="ij")
    with torch.no_grad():
        u = u_net(net, torch.tensor(X.reshape(-1, 1), dtype=torch.float32),
                  torch.tensor(T.reshape(-1, 1), dtype=torch.float32))
    u = u.numpy().reshape(X.shape)
    ue = exact(X, T)
    return np.linalg.norm(u - ue) / np.linalg.norm(ue), u

def train(lam_bc):
    torch.manual_seed(0)
    net = make_net()
    gen = torch.Generator().manual_seed(0)
    opt = torch.optim.Adam(net.parameters(), lr=1e-3)
    start = time.time()
    for step in range(1, STEPS + 1):
        loss_r, loss_ic, loss_bc = sample_losses(net, gen)
        loss = loss_r + loss_ic + lam_bc * loss_bc      # every weight 1, or 0 for bc
        opt.zero_grad()
        loss.backward()
        opt.step()
        if step in (2000, 4000, 8000):
            err, _ = evaluate(net)
            print(f"  step {step}: loss {loss.item():.2e}, rel L2 error {err:.4f}")
    print(f"  {time.time() - start:.0f} s")
    return net

for name, lam_bc in (("with boundary term", 1.0), ("without boundary term", 0.0)):
    print(name)
    net = train(lam_bc)
    err, u = evaluate(net)
    gen = torch.Generator().manual_seed(123)
    r, i, b = sample_losses(net, gen)
    print(f"  final rel L2 error {err:.4f}")
    print(f"  fresh-point losses: residual {r.item():.1e}, initial {i.item():.1e}, "
          f"boundary {b.item():.1e}")
    print(f"  u(0, 0.2) = {u[0, -1]:+.3f}   u(0.5, 0.2) = {u[50, -1]:+.3f}   "
          f"u(1, 0.2) = {u[100, -1]:+.3f}")
print(f"exact u(0.5, 0.2) = {exact(0.5, 0.2):.3f}")
```

```output
with boundary term
  step 2000: loss 1.55e-03, rel L2 error 0.0359
  step 4000: loss 6.06e-04, rel L2 error 0.0215
  step 8000: loss 3.15e-04, rel L2 error 0.0102
  69 s
  final rel L2 error 0.0102
  fresh-point losses: residual 3.5e-04, initial 7.5e-06, boundary 4.0e-05
  u(0, 0.2) = -0.011   u(0.5, 0.2) = +0.139   u(1, 0.2) = -0.008
without boundary term
  step 2000: loss 4.42e-04, rel L2 error 0.7804
  step 4000: loss 1.62e-04, rel L2 error 0.8204
  step 8000: loss 1.99e-04, rel L2 error 0.7515
  72 s
  final rel L2 error 0.7515
  fresh-point losses: residual 3.6e-05, initial 1.5e-04, boundary 1.9e-01
  u(0, 0.2) = -0.663   u(0.5, 0.2) = -0.213   u(1, 0.2) = -0.677
exact u(0.5, 0.2) = 0.139
```

（在一个 CPU 线程上运行，每次训练约需 70 s。最后几位可能因 PyTorch 构建版本和机器而不同；下面的现象则不会。）

**解读结果**。

*有边界项时*，误差稳步下降，在 2,000、4,000 和 8,000 步时依次为 $0.036 \to 0.022 \to 0.010$：网络复现了正弦的衰减，$u(0.5, 0.2) = 0.139$，在三位小数上与精确值相同，两端保持在零附近（$-0.011$ 和 $-0.008$）。误差约为 1%，这个结果不错，但也仅此而已：有限元求解器能在几毫秒内达到这个精度，并远远超过它，这就是[第 9 节](#s9)所说的诚实比较。到 8,000 步时误差仍在改善，而重新抽取的点带来的噪声损失，限制了这个学习率能把它推进到什么程度。

*没有边界项时*，相对误差为 $0.75$，从第 2,000 步起一直卡在 0.75 到 0.82 之间，而且答案在性质上就是错的。$u(0.5, 0.2)$ 为 $-0.21$，而热量只可能从 $+1$ 衰减到 $+0.139$；两端位于约 $-0.66$ 和 $-0.68$，而不是零。在新的点上，它的残差（$3.6\times10^{-5}$）比好的那次运行（$3.5\times10^{-4}$）*小*十倍，它的初始条件损失（$1.5\times10^{-4}$）也很小（好的那次是 $7.5\times10^{-6}$），所以按剩下的两项来看，这个网络满足方程的程度至少和正确的那个一样好。只有边界项暴露了它：它现在不被优化器观察，但仍然可以计算，$0.19$ 对 $4.0\times10^{-5}$。

（还有一个观察：无边界运行在第 8,000 步的损失比第 4,000 步高，这是日志中显示的带噪声的随机损失的一个尖峰，提醒我们不要把单个打印出来的损失当作收敛的标志。）

**网络收敛到了什么**。同一个方程的另一个解。在有界区间上，只有初始条件的热方程有*无穷多个*解，热量经由两端流入或流出的每一种方式对应一个。经典的唯一性定理需要边界值：具有相同初始数据和相同边界值的两个解之差，满足一个迫使它趋于零的能量衰减律，但没有边界值，就没有任何东西约束这个差。这里网络找到的解，是两端在 0.2 s 内都被冷却到约 $-0.7$、内部随之变化的解，这是 $u_t = u_{xx}$ 在 $u(x, 0) = \sin\pi x$ 和错误的边界数据下一个完全合法的解。它恰好满足了它被要求满足的东西。

**一般的教训**。小的残差证明方程在配点上成立，但它不能证明问题被完整地提出：缺少边界条件或初始条件，或者给错了，都会得到一个把损失最小化得很完美、却回答了另一个问题的网络。能发现这一点的检查是一个独立的检查，即与已知解、求解器或测量值比较，就像这里与 $e^{-\pi^2 t}\sin\pi x$ 比较。也可以对比[实验 4](#lab4) 中的阻尼振子，那里缺少的是初始条件，网络返回的则是 $u \equiv 0$。
:::

::: exercise id=e13 level=1 kind=conceptual minutes=5
为每种需求选择一个模型族，并指出它必须超过的第一个基线。

(a) 一个带翅片散热器稳态温度场的代理模型，覆盖 10 到 30 mm 的翅片高度和 1 到 5 m/s 的入口风速，在 2,000 次 CFD 计算上训练。

(b) 同一个代理模型被问到 12 m/s 的入口风速。

(c) 来自一条生产线的 50,000 幅未标注的焊缝热图像，以及 20 个已标注的缺陷，分属四种类型。

(d) 一个 30 节点的系统架构模型，其中某些部件可能是单点故障。
:::

::: solution
回答每种情形，都要问：数据是什么，输出是什么，以及什么简单方法已经能完成这项工作。

**(a) 覆盖一族设计的代理模型：神经算子，或基于网格的图网络，但先检查基线**。输出是一个场（散热器上的温度），输入是一族设计的参数，这正是[第 10 节](#s10)的情境。如果因为几何形状变化而每次计算都有自己的网格，那么网格上的图网络（[第 8 节](#s8)）是自然的读取方式；如果场位于共同的规则网格上，那么傅里叶神经算子或 DeepONet 是自然的选择。必须超过的基线是：

- *在同样 2,000 次计算上拟合的经典代理模型*：高斯过程，或本征正交分解（POD）加上对系数的回归。只有两个标量输入（翅片高度和风速）而有 2,000 次计算，输入空间被密集地采样，这些基线非常强；神经算子只有在以更低的成本达到同样效果，或者输入更丰富（自由形状的几何）时，才有存在的价值；
- *求解器本身*：代理模型必须足够精确，并且在同等精度下更快，还要把训练所花的 2,000 次计算算进去，这是一笔固定成本，只有经过大量查询才能收回。

**(b) 12 m/s 在这一族之外**。代理模型是在 1 到 5 m/s 上训练的；12 m/s 是范围上限的 2.4 倍，而且那里的流动可能处于不同的流态（比如层流与湍流之间的转捩）。网络是一个插值器：在训练范围之外，它的输出平滑而自信，却没有理由是对的，它的误差也是未知的。正确的做法是运行求解器，或者扩展训练计算以覆盖 12 m/s 并在留出的计算上检验，并且在每个使用代理模型的地方都注明它的适用范围（1 到 5 m/s，10 到 30 mm）。“代理模型的适用范围就是它见过的数据”（[第 10 节](#s10)）。

**(c) 自监督预训练，然后用探测器**。有 50,000 幅未标注图像而只有 20 个标签，所以标签无法训练一个网络，但图像可以。用对比目标或掩码目标（[第 11 节](#s11)）在这 50,000 幅图像上预训练一个编码器，然后在 20 个已标注样本上拟合一个线性探测器。基线是同样的探测器、同样的 20 个标签，用在不需要在这些图像上预训练的特征上：人工设计的强度和纹理统计量，或者在通用图像上预训练好的现成网络（[模块 03](module_03_ZH.html)）。只有 20 个样本，并按焊缝划分（如果一条焊缝给出多幅图像，就不要按图像划分），置信区间会很宽，所以要重复抽取这 20 个样本，并报告结果的离散程度。选择能保持温度分布形态的数据增强，因为温度分布形态正是缺陷的证据（[练习 14](#e14)）。如果完全没有标签，那么在合格焊缝上训练、以重建误差打分的自编码器，就是[第 2 节](#s2)的异常检测器。

**(d) 精确算法**。系统架构模型是一个有 30 个节点的图。单点故障是单独失效就使系统失效的部件，即大小为一的最小割集，找出全部单点故障是一次图遍历，耗时几微秒，而且是精确的。图网络在这里没有用武之地：它会不完美地近似一个可以精确计算的量，而精确计算所需的时间比加载网络还短。具有方向感知能力的 GNN 只有在该性质*无法*被精确计算时（它依赖于从数据中学到的东西，例如从现场报告推断出的失效可能性），或者图的数量太多、规模太大以至于精确分析太慢时，才物有所值。第一个基线就是这个算法。

四种情形背后的规律是：在选择模型族之前，先写下不需要学习的最好方法，然后让学习得到的模型在与它的比较中证明自己的价值。
:::

::: exercise id=e14 level=1 kind=conceptual minutes=5
对每种情形，说明这种数据增强对下游任务是否安全，以及为什么。

(a) 在复合材料铺层的俯视图像上预训练时使用随机 90 度旋转，下游任务是对纤维方向（0、+45、-45 或 90 度）分类。

(b) 在金相显微照片上为晶粒尺寸估计做预训练时，使用随机缩放裁剪（裁剪面积的 30% 到 100%，再缩放到完整图像大小）。

(c) 在发动机振动窗口上预训练时使用随机循环时间平移，每个窗口都从上止点开始，而各种故障是按冲击发生时的曲轴转角来区分的。

(d) 对同样的发动机窗口，在幅度约为 1 的信号上加入标准差为 0.1 的高斯噪声。
:::

::: solution
在对比学习中，数据增强定义了编码器必须忽略什么（[第 11 节](#s11)）：同一个输入的两个增强视图被拉到一起，所以增强改变的任何性质，都是表示被训练去丢弃的性质。一种增强是安全的，当且仅当它不改变下游任务所需要的任何东西。因此检验总是“这种增强改变证据了吗？”，并且要结合任务来回答。

**(a) 不安全**。标签是纤维方向。四分之一圈的旋转把 0 度映射为 90 度，把 +45 度映射为 -45 度：它改变了类别。编码器会被训练成给不同的类别相同的表示，这就是[第 11 节](#s11)中 6 与 9 的失败。半圈旋转（180 度）是安全的，因为纤维方向是一条轴线而不是一个箭头，旋转 180 度不改变 0、+45、-45 和 90。翻转也需要同样的检查：水平翻转会交换 +45 和 -45。

**(b) 不安全**。晶粒尺寸是从图像中晶粒的大小读出来的。裁剪 30% 的面积再缩放到完整大小，会把晶粒放大至多 $1/\sqrt{0.3} = 1.8$ 倍，所以同一幅显微照片的两个视图显示出不同的表观晶粒尺寸，而编码器被训练成同等对待不同的晶粒尺寸。应当裁剪而不缩放（从更大的显微照片中切出一个固定大小的窗口），使晶粒的尺度保持不变。

**(c) 在这里不安全，尽管它在[实验 5](#lab5) 中是必不可少的增强**。在实验 5 中，窗口从任意时刻开始，所以一个模式出现在窗口中的什么位置不携带信息，循环平移去掉的只是一个无关的干扰因素；没有它，编码器可能记住绝对位置。而这些发动机窗口是与循环对齐的：每个窗口都从上止点开始，冲击发生时的曲轴转角正是区分各种故障的证据。循环平移把冲击移到另一个角度，从而破坏了任务所依赖的唯一线索。同一种增强，在一种情境中是干扰的去除者，在另一种情境中却是证据的破坏者。**一种增强是否安全，取决于任务需要的证据，而不取决于增强本身**。

**(d) 适度时安全**。传感器噪声不是故障的证据。在幅度约为 1 的信号上加入标准差为 0.1 的噪声（信噪比约为 10，按幅度计为 20 dB），与信号大小相当的冲击仍然清晰可见，所以各视图仍然可以辨认为同一个窗口，编码器学到的是对一种干扰的鲁棒性，而部署的传感器本来就会产生这种干扰。它并非无条件安全：远大于所关心的最小冲击的噪声，会把要检测的故障本身淹没，所以要按你仍必须发现的最小事件来调节噪声水平，并检查探测器的逐类精度，而不只是平均精度。

四种情形共同的检查：取一个已标注的样本，施加这种增强，然后问一位细心的人在给结果标注时，是否仍会给出原来的标签。
:::

::: exercise id=e15 level=1 kind=conceptual minutes=5
一个有 8 个专家的 top-1 混合专家层在没有负载均衡损失的情况下训练。2,000 步之后，71% 的 token 被送往专家 3，有两个专家一个 token 也没有收到。解释产生这种情况的反馈回路；如果路由器的平均概率等于 token 比例 $f = (0.05, 0.08, 0.71, 0.06, 0.05, 0.05, 0, 0)$，计算 Switch 式的均衡项 $E\sum_e f_e P_e$；并说明这一项的梯度起什么作用。
:::

::: solution
**反馈回路（路由坍塌）**。收到更多 token 的专家得到更多梯度，因而在更多数据上训练，所以进步得更快。更好的专家对送给它的 token 产生更低的损失，而被训练成把每个 token 送往损失最低之处的路由器，就学会给它更高的分数，于是送给它更多的 token。起步稍稍落后的专家收到更少的 token，进步更慢，被选中的次数也就更少。语言建模损失中没有任何东西抵消这一点：从损失的角度看，一个好专家和八个一样好，这一层退化为一个只有八分之一大小的稠密层，七个闲置专家的参数被浪费。这个回路是对一个微小初始不平衡的正反馈，它开始得越早，就越难逆转。

**这些数字下的均衡项**。取 $P = f$，该项为 $E\sum_e f_e^2$：

$$
\sum_e f_e^2 = 0.05^2 + 0.08^2 + 0.71^2 + 0.06^2 + 0.05^2 + 0.05^2 + 0 + 0 = 0.0025 + 0.0064 + 0.5041 + 0.0036 + 0.0025 + 0.0025 = 0.5216.
$$

（各比例之和为 $1.00$，理应如此。）乘以 $E = 8$ 得 $8 \times 0.5216 = 4.17$。最小值为 $1.0$，在均匀路由 $f_e = P_e = 1/E$ 时取到，此时该项为 $E\cdot E\cdot(1/E)^2 = 1$（[第 12 节](#s12)的柯西-施瓦茨论证）。4.17 这个值意味着负载的集中程度是可能的最小值的四倍多；如果所有 token 都在一个专家上，它会达到 8。训练损失加上该项的 $\lambda_{\text{bal}}$ 倍，Switch 使用的是 $\lambda_{\text{bal}} = 0.01$。

**它的梯度起什么作用**。比例 $f_e$ 来自硬性的 top-1 选择，是一个计数，没有梯度。路由器概率 $P_e$，即 softmax 在该 batch 的 token 上的均值，则有梯度。所以 $\partial\mathcal{L}_{\text{bal}}/\partial P_e = \lambda_{\text{bal}}\,E\,f_e$：每个专家的概率被按它已经收到的 token 比例压低。对专家 3 这是 $8 \times 0.71 = 5.68$（乘以 $\lambda_{\text{bal}}$）；对专家 1 是 $8 \times 0.05 = 0.4$。

要看路由器 logits $\ell_j$ 的变化，应用 softmax 的雅可比矩阵 $\partial p_e/\partial\ell_j = p_e(\delta_{ej} - p_j)$。在路由器给每个 token 相同概率 $p = P$ 的简化下，

$$
\frac{\partial}{\partial\ell_j}\,E\sum_e f_e p_e = E\,p_j\Big(f_j - \sum_e f_e p_e\Big) = E\,f_j\,(f_j - 0.5216)\quad\text{当 } p = f \text{ 时}.
$$

括号把专家 $j$ 的负载与按负载加权的平均 $\sum_e f_e p_e = 0.5216$ 作比较。对专家 3，$8 \times 0.71 \times (0.71 - 0.5216) = +1.07$；梯度下降减去它，所以专家 3 的 logit 下降。对每个负载低于平均的专家，梯度为负，例如专家 1、5 和 6 为 $8 \times 0.05 \times (0.05 - 0.5216) = -0.19$，所以它们的 logits 上升。（对两个饿死的专家，在这种理想化下 $p_j = f_j = 0$，所以在这个精确点上梯度为零；在真实的 softmax 中，它们的概率小而为正，也会通过归一化被抬高：压低专家 3 的 logit，会把它的概率质量转移给所有其他专家。）

因此，梯度的作用就像负载上的一根弹簧：它把 token 从过载的专家推向利用不足的专家，并在负载均匀时消失。它是一种*软*修正，这就是为什么 $\lambda_{\text{bal}}$ 很小：太大的话，路由器会被迫以把 token 送给不那么合适的专家为代价来实现均衡。DeepSeek-V3 用一种无辅助损失的方案避免了这种权衡，它转而调整路由分数中每个专家的偏置（[第 12 节](#s12)）。
:::
