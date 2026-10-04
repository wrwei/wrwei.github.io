## 扩散 I：前向过程与训练目标 {#s5}

[第 3 节](#s3)的 VAE 一步到位地学习生成器，从简单的潜变量直接到数据，代价是样本模糊。[第 4 节](#s4)的 GAN 生成的样本清晰，但训练是一场不稳定的博弈。**扩散模型**（diffusion model）把生成拆成许多小步。破坏数据很容易：加一点高斯噪声，再加一点，直到只剩下噪声。每一小步破坏几乎都是可逆的，而撤销一步是一个去噪问题，也就是一个回归问题。训练一个网络去撤销每一步，然后从纯噪声出发，反复应用它。本节构建这个破坏过程并推导回归损失；[第 6 节](#s6)把训练好的网络变成采样器。

### 前向过程

固定步数 $T$ 和一个**噪声调度**（noise schedule）$\beta_1, \dots, \beta_T$，即一组小的正数。**前向过程**（forward process）每次加一步噪声：

$$
q(\mathbf{x}_t \mid \mathbf{x}_{t-1}) = \mathcal{N}\big(\sqrt{1-\beta_t}\,\mathbf{x}_{t-1},\ \beta_t \mathbf{I}\big), \qquad t = 1, \dots, T.
$$

记 $\alpha_t = 1 - \beta_t$，一步就是 $\mathbf{x}_t = \sqrt{\alpha_t}\,\mathbf{x}_{t-1} + \sqrt{1-\alpha_t}\,\boldsymbol{\epsilon}_t$，其中 $\boldsymbol{\epsilon}_t \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ 每步重新抽取。收缩因子 $\sqrt{1-\beta_t}$ 是有原因的。若 $\mathbf{x}_{t-1}$ 的某个坐标方差为 1，则 $\mathbf{x}_t$ 的方差为 $(1-\beta_t) \cdot 1 + \beta_t = 1$：标准化到单位方差的数据始终保持单位方差，过程收敛到 $\mathcal{N}(\mathbf{0}, \mathbf{I})$，而不像单纯叠加噪声那样漂向越来越大的值。

这里没有任何东西是学出来的。前向过程没有参数；调度是人工选定的。

**闭式解**。训练需要随机 $t$ 下的 $\mathbf{x}_t$，为此跑 $t$ 步会很浪费。其实也没有必要。利用[第 1 节](#s1)的高斯代数，把两步复合起来：

$$
\begin{aligned}
\mathbf{x}_2 &= \sqrt{\alpha_2}\,\big(\sqrt{\alpha_1}\,\mathbf{x}_0 + \sqrt{1-\alpha_1}\,\boldsymbol{\epsilon}_1\big) + \sqrt{1-\alpha_2}\,\boldsymbol{\epsilon}_2 \\
&= \sqrt{\alpha_1\alpha_2}\,\mathbf{x}_0 + \Big(\sqrt{\alpha_2(1-\alpha_1)}\,\boldsymbol{\epsilon}_1 + \sqrt{1-\alpha_2}\,\boldsymbol{\epsilon}_2\Big).
\end{aligned}
$$

括号里是两个相互独立的零均值高斯变量之和，因此它也是高斯的，每个坐标的方差为 $\alpha_2(1-\alpha_1) + (1-\alpha_2) = 1 - \alpha_1\alpha_2$。记 $\bar\alpha_t = \prod_{s=1}^{t}\alpha_s$。两步给出 $\mathbf{x}_2 = \sqrt{\bar\alpha_2}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_2}\,\boldsymbol{\epsilon}$，其中只有一个 $\boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$。同一个恒等式 $\alpha_t(1-\bar\alpha_{t-1}) + (1-\alpha_t) = 1 - \bar\alpha_t$ 把结果从 $t-1$ 推到 $t$，由归纳法得

$$
q(\mathbf{x}_t \mid \mathbf{x}_0) = \mathcal{N}\big(\sqrt{\bar\alpha_t}\,\mathbf{x}_0,\ (1-\bar\alpha_t)\mathbf{I}\big),
\qquad
\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}.
\tag{5.4}
$$

[练习 6](#e6) 要求你写出这个归纳。式 (5.4) 是训练廉价的关键：任意噪声水平下的训练输入只需一行代码，不必对 $t$ 循环。信号按 $\sqrt{\bar\alpha_t}$ 缩放，噪声按 $\sqrt{1-\bar\alpha_t}$ 缩放，两个缩放因子的平方和为 1。

::: worked title="用闭式解做一步加噪"
取 $x_0 = 2.0$，某一步的 $\bar\alpha_t = 0.5$，噪声抽样为 $\epsilon = -0.4$。由 (5.4)：

$$
x_t = \sqrt{0.5} \times 2 + \sqrt{0.5} \times (-0.4) = 1.4142 - 0.2828 = 1.1314.
$$

[第 1 节](#s1)手工复合了两步；(5.4) 对任意步数都能做到这一点，这里一次跨过了前向过程的一整段。是哪一段取决于调度：当 $T = 1000$ 时，在下文的线性调度下 $\bar\alpha_t$ 约在 $t = 260$ 处降到 0.5，在余弦调度下约在 $t = 497$ 处。
:::

### 调度

调度决定信号消退的快慢。一个有用的单一指标是**信噪比**（signal-to-noise ratio）

$$
\mathrm{SNR}(t) = \frac{\bar\alpha_t}{1-\bar\alpha_t},
$$

即对单位方差数据而言 (5.4) 中信号方差与噪声方差之比，常以分贝表示，$10\log_{10}\mathrm{SNR}$。有一条要求没有商量余地：$\bar\alpha_T$ 必须接近 0，使 $\mathbf{x}_T$ 接近 $\mathcal{N}(\mathbf{0}, \mathbf{I})$。采样从 $\mathcal{N}(\mathbf{0}, \mathbf{I})$ 开始；如果训练中网络从未见过这样的输入，采样的第一步就是迈向未知。

Ho、Jain 和 Abbeel（2020）使用**线性调度**（linear schedule）：在 $T = 1000$ 步内，$\beta_t$ 从 $10^{-4}$ 均匀增大到 0.02，最终 $\bar\alpha_T = 4.0 \times 10^{-5}$。Nichol 和 Dhariwal（2021）注意到它过早地破坏了信息，提出了**余弦调度**（cosine schedule），直接定义 $\bar\alpha_t$：

$$
\bar\alpha_t = \frac{f(t)}{f(0)}, \qquad f(t) = \cos^2\!\left(\frac{t/T + s}{1 + s}\cdot\frac{\pi}{2}\right), \qquad s = 0.008,
$$

并取 $\beta_t = 1 - \bar\alpha_t/\bar\alpha_{t-1}$，在 0.999 处截断，否则 $f(T) = 0$ 会使最后的 $\beta_T$ 等于 1。小偏移量 $s$ 使 $\beta_1$ 不至于小到可以忽略。

::: worked title="两种调度的具体数字"
两种调度都取 $T = 1000$，$\bar\alpha_t$ 按 $1 - \beta_s$ 的连乘计算：

| $t$ | 100 | 250 | 500 | 750 | 1000 |
|---|---|---|---|---|---|
| 线性 $\bar\alpha_t$ | 0.897 | 0.524 | 0.0786 | 0.00335 | $4.0 \times 10^{-5}$ |
| 余弦 $\bar\alpha_t$ | 0.972 | 0.847 | 0.494 | 0.144 | $2.4 \times 10^{-9}$ |

在 $t = 500$ 处，线性调度保留了 $\sqrt{0.0786} = 0.28$ 的信号幅度（SNR $-10.7$ dB）；余弦调度保留了 $\sqrt{0.494} = 0.70$（SNR $-0.1$ dB，信号与噪声大致相当）。现在取 $\bar\alpha = 0.01$，即 SNR 为 $10\log_{10}(0.01/0.99) = -20$ dB，作为输入几乎是纯噪声的分界点。线性调度在 $t = 674$ 处越过它，所以第 674 到 1000 步，即全部步数的 33%，都花在那里。余弦调度在 $t = 936$ 处越过它：占 6.5%。从那个区域抽出的一步对模型帮助不大，因为从几乎纯粹的噪声出发，对 $\mathbf{x}_0$ 的最佳预测无论输入如何都接近数据均值。余弦调度把训练花在仍有东西可学的噪声水平上。图 5.11 画出了两种调度。
:::

::: figure id=fig-05-11
$T = 1000$ 时线性调度与余弦调度的 $\bar\alpha_t$（左轴，线性刻度）和以 dB 为单位的 SNR（右轴）随 $t$ 的变化。一条水平线标出 $\bar\alpha = 0.01$；线性调度位于其下方的区域 $t > 674$ 加了阴影。
:::

::: widget name=diffusion-explorer
扩散探索器打开时显示 $t = 500$ 下由八个高斯分布组成的环：左侧面板（线性调度，$\bar\alpha = 0.079$）已经是一团圆形的斑点，而右侧面板（余弦调度，$\bar\alpha = 0.494$）仍能看出环形，中心变得稀疏，不过八个簇已经融在一起。拖动 $t$，观察信号缩放、噪声缩放和 SNR 的读数，以及 $x$ 坐标的直方图如何逼近标准正态曲线。按播放键可以动画演示整个前向过程；把数据集切换为双月，可以看到从另一个起点出发的同一条路径。反向采样器留到[第 6 节](#s6)再用。
:::

### 如果已知 $\mathbf{x}_0$，反向的一步

生成需要反方向的 $q(\mathbf{x}_{t-1} \mid \mathbf{x}_t)$。这个分布是难以处理的：它依赖于整个数据分布，因为许多干净的点都可能导向 $\mathbf{x}_t$。若再以干净的点为条件，它就是高斯的。由贝叶斯公式，$q(\mathbf{x}_{t-1} \mid \mathbf{x}_t, \mathbf{x}_0) \propto q(\mathbf{x}_t \mid \mathbf{x}_{t-1})\, q(\mathbf{x}_{t-1} \mid \mathbf{x}_0)$，这是关于 $\mathbf{x}_{t-1}$ 的两个高斯的乘积。对 $\mathbf{x}_{t-1}$ 配方（代数推导是常规的，这里略过），两者的精度相加，$\alpha_t/\beta_t + 1/(1-\bar\alpha_{t-1}) = (1-\bar\alpha_t)/\big(\beta_t(1-\bar\alpha_{t-1})\big)$，并得到

$$
q(\mathbf{x}_{t-1} \mid \mathbf{x}_t, \mathbf{x}_0) = \mathcal{N}\big(\tilde{\boldsymbol{\mu}}_t,\ \tilde\beta_t \mathbf{I}\big),
\quad
\tilde{\boldsymbol{\mu}}_t = \frac{\sqrt{\bar\alpha_{t-1}}\,\beta_t}{1-\bar\alpha_t}\,\mathbf{x}_0 + \frac{\sqrt{\alpha_t}\,(1-\bar\alpha_{t-1})}{1-\bar\alpha_t}\,\mathbf{x}_t,
\quad
\tilde\beta_t = \frac{1-\bar\alpha_{t-1}}{1-\bar\alpha_t}\,\beta_t.
\tag{5.5}
$$

均值把点的来处和它现在的位置混合在一起；缺失的 $\mathbf{x}_0$ 必须由模型提供。

### 从证据下界到预测噪声

把 $\mathbf{x}_1, \dots, \mathbf{x}_T$ 当作潜变量，把反向模型 $p_\theta(\mathbf{x}_{t-1} \mid \mathbf{x}_t) = \mathcal{N}\big(\boldsymbol{\mu}_\theta(\mathbf{x}_t, t),\ \sigma_t^2 \mathbf{I}\big)$（$\sigma_t^2$ 固定）当作解码器。以 $q(\mathbf{x}_{1:T} \mid \mathbf{x}_0)$ 为编码器，[第 3 节](#s3)的证据下界可以重新整理为每步一个 KL 项（这需要一页记账式的推导，对每个前向步应用贝叶斯公式，见 Ho 等人的扩展推导）：

$$
-\log p_\theta(\mathbf{x}_0) \le \E_q\Big[\underbrace{D_{\KL}\big(q(\mathbf{x}_T \mid \mathbf{x}_0)\,\|\,p(\mathbf{x}_T)\big)}_{L_T} +
\sum_{t=2}^{T}\underbrace{D_{\KL}\big(q(\mathbf{x}_{t-1} \mid \mathbf{x}_t, \mathbf{x}_0)\,\|\,p_\theta(\mathbf{x}_{t-1} \mid \mathbf{x}_t)\big)}_{L_{t-1}}
\underbrace{-\log p_\theta(\mathbf{x}_0 \mid \mathbf{x}_1)}_{L_0}\Big].
$$

$L_T$ 不含参数。每个 $L_{t-1}$ 都是两个高斯之间的 KL 散度；当 $p_\theta$ 的方差固定时，它化为均值之间的平方距离，$L_{t-1} = \frac{1}{2\sigma_t^2}\|\tilde{\boldsymbol{\mu}}_t - \boldsymbol{\mu}_\theta\|^2 + C$，其中 $C$ 与 $\theta$ 无关。

现在从 (5.5) 中消去 $\mathbf{x}_0$。由 (5.4)，$\mathbf{x}_0 = (\mathbf{x}_t - \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon})/\sqrt{\bar\alpha_t}$。代入后，$\mathbf{x}_t$ 的系数变为 $\big(\beta_t + \alpha_t(1-\bar\alpha_{t-1})\big)/\big((1-\bar\alpha_t)\sqrt{\alpha_t}\big) = 1/\sqrt{\alpha_t}$，于是

$$
\tilde{\boldsymbol{\mu}}_t = \frac{1}{\sqrt{\alpha_t}}\Big(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\boldsymbol{\epsilon}\Big).
$$

网络能看到 $\mathbf{x}_t$，所以唯一的未知量是 $\boldsymbol{\epsilon}$。用同样的方式参数化模型均值，用网络 $\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)$ 代替 $\boldsymbol{\epsilon}$。两者相减时 $\mathbf{x}_t$ 项相互抵消，得到

$$
L_{t-1} = \frac{\beta_t^2}{2\sigma_t^2\,\alpha_t\,(1-\bar\alpha_t)}\,\big\|\boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)\big\|^2 + C.
$$

界中的每一项都是加权的噪声预测误差。Ho 等人去掉了权重，并对 $t$ 均匀采样，得到实践中使用的损失：

$$
\mathcal{L}_{\text{simple}}(\theta) = \E_{t,\,\mathbf{x}_0,\,\boldsymbol{\epsilon}}\Big\|\boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta\big(\sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon},\ t\big)\Big\|^2.
\tag{5.6}
$$

被去掉的权重并非细微差别。取 $\sigma_t^2 = \beta_t$ 时权重为 $\beta_t/\big(2\alpha_t(1-\bar\alpha_t)\big)$；对线性调度，它在 $t = 1$ 处为 0.50（此处 $1-\bar\alpha_1 = \beta_1$），在 $t = 100$ 处为 0.010，在 $t = 500$ 处为 0.0055，在 $t = 1000$ 处为 0.010。界把最小噪声水平上的权重放大了五十到九十倍，而在那里去噪最容易，对样本的观感影响也最小。相对于证据下界，$\mathcal{L}_{\text{simple}}$ 把重心移到了更难、噪声更大的步上；Ho 等人发现它给出的样本更好，代价是它不再是似然的一个界。图 5.12 展示了一个训练步。

::: figure id=fig-05-12
一个训练步的示意图：从数据中抽取 $\mathbf{x}_0$，从 $\{1, \dots, T\}$ 中均匀抽取 $t$，并抽取 $\boldsymbol{\epsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$；构造 $\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}$；把 $(\mathbf{x}_t, t)$ 送入网络 $\boldsymbol{\epsilon}_\theta$；计算其与 $\boldsymbol{\epsilon}$ 之间的平方误差。
:::

写成代码，(5.6) 的一个 batch 只需六行：

```python
def diffusion_loss(eps_model, x0, alpha_bar):
    """L_simple for one batch; alpha_bar has length T + 1 with alpha_bar[0] = 1."""
    T = len(alpha_bar) - 1
    t = torch.randint(1, T + 1, (x0.shape[0],))         # one noise level per example
    eps = torch.randn_like(x0)
    ab = alpha_bar[t].view(-1, *[1] * (x0.dim() - 1))   # broadcast over feature dims
    xt = ab.sqrt() * x0 + (1 - ab).sqrt() * eps         # equation (5.4): no loop over t
    return ((eps - eps_model(xt, t)) ** 2).mean()
```

### 同一个损失，从分数估计的角度看

通往 (5.6) 的第二条路径能说明网络学到了什么。对数密度关于其自变量的梯度 $\nabla_{\mathbf{x}} \log p(\mathbf{x})$ 称为**分数函数**（score function）：一个指向密度更高处的向量场。对一步加噪，

$$
\nabla_{\mathbf{x}_t} \log q(\mathbf{x}_t \mid \mathbf{x}_0) = -\frac{\mathbf{x}_t - \sqrt{\bar\alpha_t}\,\mathbf{x}_0}{1-\bar\alpha_t} = -\frac{\boldsymbol{\epsilon}}{\sqrt{1-\bar\alpha_t}}.
$$

在加噪样本上把网络回归到这个条件分数，在最优处恢复的是加噪边缘分布 $p_t(\mathbf{x}_t)$ 的分数；这就是**去噪分数匹配**（denoising score matching，Vincent，2011），Song 和 Ermon（2019）把它变成了生成器。预测 $\boldsymbol{\epsilon}$ 是同一个回归，只差一个固定的比例，所以训练好的噪声预测器就是一个分数估计器：$\mathbf{s}_\theta(\mathbf{x}_t, t) = -\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)/\sqrt{1-\bar\alpha_t}$。

分数还说明了网络对干净数据的看法。**Tweedie 公式**（Tweedie's formula）由加噪边缘分布的分数给出 $\mathbf{x}_0$ 的后验均值：

$$
\E[\mathbf{x}_0 \mid \mathbf{x}_t] = \frac{\mathbf{x}_t + (1-\bar\alpha_t)\,\nabla \log p_t(\mathbf{x}_t)}{\sqrt{\bar\alpha_t}}
\quad\Longrightarrow\quad
\hat{\mathbf{x}}_0 = \frac{\mathbf{x}_t - \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)}{\sqrt{\bar\alpha_t}}.
$$

因此 $\hat{\mathbf{x}}_0$，即经 (5.4) 反解噪声预测得到的量，是一个后验均值：对所有可能产生 $\mathbf{x}_t$ 的干净点取平均。在高噪声下，许多截然不同的点都可能产生它，它们的平均是一团模糊。这就是为什么从纯噪声出发的一步去噪生成不了任何东西，也是为什么[第 6 节](#s6)的采样器要走许多小步。

::: worked title="高斯数据的最优去噪器"
设数据是一维的，$x_0 \sim \mathcal{N}(2, 0.25)$，噪声水平为 $\bar\alpha_t = 0.5$。由 (5.4)，$x_t$ 是均值为 $\sqrt{0.5} \times 2 = 1.4142$、方差为 $0.5 \times 0.25 + 0.5 = 0.625$ 的高斯变量。它的分数是 $-(x_t - 1.4142)/0.625$，所以最优噪声预测为

$$
\epsilon^*(x_t) = \sqrt{1-\bar\alpha_t}\,\frac{x_t - 1.4142}{0.625}.
$$

在 $x_t = 1.0$ 处：$\epsilon^* = 0.7071 \times (-0.4142)/0.625 = -0.4686$，并且

$$
\hat{x}_0 = \frac{1.0 - 0.7071 \times (-0.4686)}{0.7071} = \frac{1.3314}{0.7071} = 1.8828.
$$

用高斯条件分布验证：$\operatorname{Cov}(x_0, x_t) = \sqrt{0.5} \times 0.25 = 0.1768$，所以 $\E[x_0 \mid x_t] = 2 + (0.1768/0.625)(1.0 - 1.4142) = 2 - 0.1172 = 1.8828$。两者一致：噪声预测器所隐含的 $\hat{x}_0$ 就是后验均值。注意 $1.8828$ 位于经过缩放的噪声观测与数据均值 2 之间。对高斯数据，理想的去噪器关于 $x_t$ 是线性的；对有多个模态的数据，比如双月或八个簇，它必须判断 $x_t$ 来自哪个模态，这是非线性的，而这正是网络必须学会的。
:::

### 它为什么好训练，网络长什么样

式 (5.6) 是对一个分布固定的目标做普通回归：噪声由训练循环抽取，不会随网络的学习而移动。没有对手，也没有博弈，所以损失虽然在 batch 之间有波动，却稳定下降，并且在整个训练过程中含义不变。这比什么都更能解释扩散模型为何取代了 GAN（[第 4 节](#s4)）。

预测 $\boldsymbol{\epsilon}$ 只是携带相同信息的三种选择之一。网络也可以直接预测 $\mathbf{x}_0$，或预测**速度**（velocity）$\mathbf{v} = \sqrt{\bar\alpha_t}\,\boldsymbol{\epsilon} - \sqrt{1-\bar\alpha_t}\,\mathbf{x}_0$（Salimans 和 Ho，2022）。三者都可以通过 (5.4) 互相转换；区别在于对它们取平方误差时各噪声水平的权重不同，因而网络拟合得最好的步也不同。

对图像而言，$\boldsymbol{\epsilon}_\theta$ 是一个输出形状与输入相同的 U-Net（[模块 03 第 12 节](module_03_ZH.html#s12)），或一个作用于图像块的 Transformer；在[实验 2](#lab2) 中，它是一个作用于两个坐标的小 MLP。时间步通过 $t$ 的正弦嵌入输入网络，构造方式与[模块 06 第 6 节](module_06_ZH.html#s6)的位置编码相同，这样同一个网络可以在每个噪声水平上表现不同。

::: check
为什么训练时可以直接抽取 $\mathbf{x}_t$，而不必运行 $t$ 步加噪？
:::

::: answer
高斯步的复合仍是高斯的，噪声方差相加：$q(\mathbf{x}_t \mid \mathbf{x}_0) = \mathcal{N}(\sqrt{\bar\alpha_t}\,\mathbf{x}_0, (1-\bar\alpha_t)\mathbf{I})$。所以 $\mathbf{x}_t = \sqrt{\bar\alpha_t}\,\mathbf{x}_0 + \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}$，只需抽取一次噪声。
:::

::: check
网络的噪声预测告诉了你关于干净数据的什么信息？
:::

::: answer
反解 (5.4) 得到 $\hat{\mathbf{x}}_0 = (\mathbf{x}_t - \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}_\theta)/\sqrt{\bar\alpha_t}$，对最优网络而言它就是后验均值 $\E[\mathbf{x}_0 \mid \mathbf{x}_t]$。等价地，$\boldsymbol{\epsilon}_\theta$ 是分数 $\nabla \log p_t(\mathbf{x}_t)$ 乘以 $-\sqrt{1-\bar\alpha_t}$。
:::

::: check
在扩散探索器中设 $t = 500$。哪种调度仍然显示出环形？为什么？
:::

::: answer
余弦调度：$\bar\alpha_{500} = 0.49$，SNR 约为 0 dB，所以信号与噪声的方差相近，环形仍然可见，中心变得稀疏（它的八个簇彼此相距约 1.5 个噪声标准差，已经融在一起）。在线性调度下 $\bar\alpha_{500} = 0.079$（SNR $-10.7$ dB），环形已经消失。
:::

## 扩散 II：采样、引导、潜在扩散与代价 {#s6}

训练好的 $\boldsymbol{\epsilon}_\theta$ 预测的是噪声。本节把它变成生成器，用条件引导它，让它负担得起，并计算它的代价。

### 祖先采样

[第 5 节](#s5)的反向模型均值为 $\boldsymbol{\mu}_\theta = \frac{1}{\sqrt{\alpha_t}}\big(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)\big)$，方差 $\sigma_t^2$ 固定。从 $t = T$ 一直采样到 1，就是**祖先采样**（ancestral sampling，即 Ho 等人的采样算法）：

$$
\mathbf{x}_T \sim \mathcal{N}(\mathbf{0}, \mathbf{I}), \qquad
\mathbf{x}_{t-1} = \frac{1}{\sqrt{\alpha_t}}\Big(\mathbf{x}_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)\Big) + \sigma_t\,\mathbf{z},
\quad \mathbf{z} \sim \mathcal{N}(\mathbf{0}, \mathbf{I}),
$$

最后一步取 $\mathbf{z} = \mathbf{0}$，$\sigma_t^2 = \beta_t$ 或 $\tilde\beta_t$（两者都可行）。每一步减去预测噪声的一部分，重新缩放，再加一点新的噪声。一个样本要做 $T$ 次网络求值。

```python
@torch.no_grad()
def ddpm_sample(eps_model, shape, alpha_bar):
    """Ancestral sampling with sigma_t^2 = beta_t."""
    T = len(alpha_bar) - 1
    x = torch.randn(shape)
    for t in range(T, 0, -1):
        alpha_t = alpha_bar[t] / alpha_bar[t - 1]
        beta_t = 1 - alpha_t
        eps = eps_model(x, torch.full((shape[0],), t))
        x = (x - beta_t / (1 - alpha_bar[t]).sqrt() * eps) / alpha_t.sqrt()
        if t > 1:                                        # no noise on the last step
            x = x + beta_t.sqrt() * torch.randn_like(x)
    return x
```

::: figure id=fig-05-13
实验 2 的反向过程：$t$ = 200、150、100、50、20、5 和 0 时的 2,000 个样本，每个面板标注了从样本到数据的平均最近邻距离（0.246、0.234、0.212、0.134、0.057、0.027、0.022）；第八个面板作为参照，显示从数据中新抽取的 2,000 个点（0.013）。双月形状只在最后几个面板中出现：结构出现得很晚。
:::

图 5.13 显示了功夫花在哪里。在实验 2 的 200 步中，前 100 步里距离几乎不动（从 0.246 到 0.212；纯高斯抽样给出 0.242）；双月在最后 50 步才成形，最终为 0.022，而新抽取的数据为 0.013。

**第一步**。更新要除以 $\sqrt{\alpha_t}$，这会放大 $\boldsymbol{\epsilon}_\theta$ 中的任何误差；通常 $\alpha_t$ 接近 1。余弦调度在 $\beta_T = 0.999$ 处的截断使第一步的放大因子为 $1/\sqrt{0.001} = 31.6$。因此实验 2 在 $T = 200$ 时把 $\beta_t$ 限制在 0.5 以内：$\bar\alpha_T$ 仍为 $6.8 \times 10^{-5}$，放大因子为 $1/\sqrt{0.5} = 1.41$。在实验 2 的数据上，0.999 的截断未必有害（用它重新训练的实验副本在 $w = 7$ 时给出 0.019 的类精确率距离），但一次原型运行用它时发散了，而这个上限没有任何代价。另一种等价的修正保留原调度：计算 $\hat{\mathbf{x}}_0$，把它截断到数据范围内，然后走到 (5.5) 的后验均值 $\tilde{\boldsymbol{\mu}}_t(\mathbf{x}_t, \hat{\mathbf{x}}_0)$。

### 更少的步数：DDIM

Song、Meng 和 Ermon（2021）注意到，训练损失只约束边缘分布 $q(\mathbf{x}_t \mid \mathbf{x}_0)$，而不约束逐步的过程，因此同一个训练好的网络可以服务于其他采样器。**DDIM** 走一个确定性的步：先估计干净的点，再用预测的噪声而不是新噪声把它重新加噪到更低的水平 $t' < t$，

$$
\hat{\mathbf{x}}_0 = \frac{\mathbf{x}_t - \sqrt{1-\bar\alpha_t}\,\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t)}{\sqrt{\bar\alpha_t}}, \qquad
\mathbf{x}_{t'} = \sqrt{\bar\alpha_{t'}}\,\hat{\mathbf{x}}_0 + \sqrt{1-\bar\alpha_{t'}}\,\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t),
$$

所用的时间是一个带步幅的子序列，比如 200、190、……、0。实验 2 的扫描测出了这能换来什么：类精确率距离在 200 步时为 0.022，20 步时为 0.025，5 步时为 0.046，一步时为 1.71。从纯噪声出发的单步返回的是 $\hat{\mathbf{x}}_0$，即给定噪声时后验均值的估计。即使网络完美，这也是数据均值附近的一团模糊，而训练所得网络的小误差还会被放大 $\sqrt{1-\bar\alpha_T}/\sqrt{\bar\alpha_T} = 121$ 倍。

[第 5 节](#s5)的高斯例子在没有任何训练误差的情况下展示了这一机制。用它的精确噪声预测器（线性调度，$T = 1000$，20,000 个样本），祖先采样给出标准差 0.50，正如应有的那样；DDIM 在 50、10 和 3 步时分别给出 0.47、0.37 和 0.16，一步时为 0.002，每个样本都落在后验均值 2.00 上。步数少时，首先丢失的是分布的离散程度。在扩散探索器中，分别用 10 步和 3 步在环上运行 DDIM：余弦面板退化得更慢，而在 3 步时，线性面板把点落在了簇与簇之间。

### 条件与引导

要生成所要求的东西，就给网络一个条件 $\mathbf{c}$：$\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \mathbf{c})$，其中 $\mathbf{c}$ 可以是一个类别、一个文本嵌入、一张低分辨率图像或一个实测的边界条件。除了多一个输入，训练不变。条件模型常常只是松散地遵循它的条件；引导会加强这一点。**分类器引导**（classifier guidance，Dhariwal 和 Nichol，2021）在每一步把一个在加噪输入上训练的分类器的梯度 $\nabla_{\mathbf{x}_t} \log p(\mathbf{c} \mid \mathbf{x}_t)$ 加到分数上。

**无分类器引导**（classifier-free guidance，Ho 和 Salimans，2022）不需要分类器。只训练一个网络，以概率 $p_{\text{uncond}}$（0.1 到 0.2；[实验 2](#lab2) 中为 0.2）把 $\mathbf{c}$ 替换为空 token $\varnothing$，使它同时学会条件预测和无条件预测。采样时用

$$
\tilde{\boldsymbol{\epsilon}} = \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \varnothing) + w\,\big[\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \mathbf{c}) - \boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \varnothing)\big].
$$

$w = 0$ 是无条件模型，$w = 1$ 是条件模型，$w > 1$ 则越过它向外外推。Ho 和 Salimans 把缩放写作 $(1 + w)$，所以他们的 $w$ 等于本模块的 $w$ 减 1；跨论文比较数字之前，先核对约定。

$w > 1$ 意味着什么，可以从分数的角度得出。由于 $\mathbf{s} = -\boldsymbol{\epsilon}/\sqrt{1-\bar\alpha_t}$，同样的组合对分数也成立；再由贝叶斯公式 $\nabla \log p(\mathbf{x} \mid \mathbf{c}) = \nabla \log p(\mathbf{x}) + \nabla \log p(\mathbf{c} \mid \mathbf{x})$，得到

$$
\tilde{\mathbf{s}} = \nabla \log p(\mathbf{x}) + w\,\nabla \log p(\mathbf{c} \mid \mathbf{x})
= \nabla \log p(\mathbf{x} \mid \mathbf{c}) + (w - 1)\,\nabla \log p(\mathbf{c} \mid \mathbf{x}).
$$

引导从条件分布中采样，但把分布向一个隐式分类器有把握地标为 $\mathbf{c}$ 的那些点倾斜。现在每一步要做两次网络求值。

::: worked title="二维中的无分类器引导"
在某个 $\mathbf{x}_t$ 处，网络预测 $\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, \varnothing) = (0.2, -0.1)$ 和 $\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, \mathbf{c}) = (0.5, 0.3)$。两者之差为 $(0.3, 0.4)$。

- $w = 0$：$(0.2, -0.1)$，即无条件预测。
- $w = 1$：$(0.2 + 0.3, -0.1 + 0.4) = (0.5, 0.3)$，即条件预测。
- $w = 3$：$(0.2 + 3 \times 0.3, -0.1 + 3 \times 0.4) = (1.1, 1.1)$。
- $w = 7.5$：$(0.2 + 7.5 \times 0.3, -0.1 + 7.5 \times 0.4) = (2.45, 2.9)$。

当 $w > 1$ 时，引导后的预测离开了两个估计之间的线段。网络从未给出过 $(2.45, 2.9)$；它是外推凭空造出来的，这就是大的 $w$ 把样本推离数据的方式。
:::

实验 2 在双月数据上请求 1,000 个类别 0 的样本。$w = 0$ 时，50% 落在所请求的那个月牙上；$w$ = 1、3 和 7 时为 100%。类召回率距离（从类别 0 的数据到样本）在 $w$ = 1、3、7 时依次增长为 0.021、0.029、0.043；类精确率距离在 $w$ = 0 到 3 时为 0.023、0.014、0.013，在 $w = 7$ 时因样本冲过头而变差到 0.020。保真度是用多样性换来的，而 $w$ 超过某个值后，保真度也会丢失。

### 潜在扩散

像素空间的扩散要在每个像素上多次运行一个大网络。**潜在扩散**（latent diffusion，Rombach 等人，2022）先训练一个自编码器（像 VAE 那样带一个小的 KL 项，并用感知损失和对抗损失保持清晰），把图像压缩成小得多的潜变量。扩散在潜变量上运行；解码器只在最后运行一次。文本条件通过交叉注意力（cross-attention）进入去噪器（从潜变量的各个位置注意文本的 token 嵌入，即[模块 06](module_06_ZH.html) 的机制）。

::: worked title="潜变量省下了什么"
在 Rombach 等人的一种配置中，$512 \times 512 \times 3$ 的图像映射为 $64 \times 64 \times 4$ 的潜变量（下采样因子 8，4 个通道）：

$$
512 \times 512 \times 3 = 786{,}432 \text{ 个值}, \qquad 64 \times 64 \times 4 = 16{,}384 \text{ 个值}, \qquad
\frac{786{,}432}{16{,}384} = 48.
$$

去噪器在每一步处理的值少了 48 倍。采样时不需要编码器，解码器的开销只付一次，而不是每步都付。图 5.15 沿着流水线跟踪了各处的形状。
:::

::: figure id=fig-05-15
每个箭头上都标有形状的潜在扩散流水线：图像 $512 \times 512 \times 3$ → 编码器 → 潜变量 $64 \times 64 \times 4$ → 扩散循环（反复应用去噪器，条件 $\mathbf{c}$ 通过交叉注意力进入）→ 解码器 → 图像 $512 \times 512 \times 3$。
:::

### 采样的代价

一个样本的代价 = 步数 × 每步的网络求值次数 × 一次求值的代价。

::: worked title="数一数求值次数"
一个 50 步 DDIM 加无分类器引导的采样器，每步运行网络两次：每张图像 $50 \times 2 = 100$ 次求值。GAN 的生成器只运行一次。一个蒸馏到 4 步的采样器，其学生网络被训练来复现引导后的输出，因此每步一次求值就够了，共需 $4 \times 1 = 4$ 次：比引导的 50 步采样器少 25 倍。
:::

蒸馏（distillation）训练一个快速的学生去匹配一个慢速的教师。**渐进式蒸馏**（progressive distillation，Salimans 和 Ho，2022）反复训练学生用一步完成教师的两步，每一轮把步数减半；**一致性模型**（consistency models，Song 等人，2023）训练一个网络，把采样路径上的任意一点直接映射到路径的终点。两者都能做到 1 到 4 步，在最少的步数下会损失一些质量。[模块 10](module_10_ZH.html) 会在部署服务的场景下再谈多次顺序求值的代价。

### 工程用途

有三类用途适合这一家族：以需求（一个载荷工况、一个包络）为条件生成候选几何形状；以已观测的传感器通道为条件补全缺失的通道，给出一组合理取值的分布；以及对粗糙的仿真场做超分辨率。样本是一个提议，而不是一个结果。每个生成的设计仍然要经过求解器和常规检查：模型复现的是其训练数据的统计特性，对它没见过的物理一无所知。

::: check
当 $p_{\text{uncond}} = 0.2$、$w = 1$ 时，无分类器引导计算的是什么？
:::

::: answer
只是条件预测 $\boldsymbol{\epsilon}_\theta(\mathbf{x}_t, t, \mathbf{c})$：两个无条件项相互抵消。$p_{\text{uncond}}$ 只在训练时起作用。只有当 $w > 1$ 时，引导才会外推。
:::

::: check
在同样的图像尺寸下，为什么潜在扩散比像素扩散便宜？
:::

::: answer
去噪器在每个采样步都要运行，而在潜在扩散中，它运行在一个值少 48 倍的潜变量上（从 $512 \times 512 \times 3$ 到 $64 \times 64 \times 4$）。映射回像素的解码器每张图像只运行一次。
:::

## 图神经网络 I：消息传递与 GCN {#s7}

到目前为止，每个网络都假定了一种规则的结构：定长的向量、像素网格（[模块 03](module_03_ZH.html)）、序列（[模块 04](module_04_ZH.html)）。许多工程数据并没有这样的结构。分子是由化学键连接的原子，有限元网格是由单元连接的节点，电路是由网络连接的元件，故障树是与其所馈入的门相连的事件。结构是一张图，它因样本而异，而且承载着信息。

### 作为数据的图

图 $\mathcal{G} = (\mathcal{V}, \mathcal{E})$ 有 $n$ 个节点和一组边。它的**邻接矩阵**（adjacency matrix）$\mathbf{A} \in \{0, 1\}^{n \times n}$ 在节点 $i$ 与 $j$ 相连时 $A_{ij} = 1$；对无向图它是对称的。度矩阵 $\mathbf{D}$ 是对角矩阵，$D_{ii} = \sum_j A_{ij}$ 即 $i$ 的邻居数，$\mathcal{N}(v)$ 表示 $v$ 的邻居集合。每个节点带有一个特征向量，按行堆叠成 $\mathbf{X} \in \R^{n \times d}$；边也可以带特征 $\mathbf{e}_{uv}$（化学键类型、相对位置）。工程领域提供了大量的图：分子、网格、电路、故障树、SysML 模块图，以及用目标结构化表示法（Goal Structuring Notation，GSN）写成的安全论证，其中的论点、策略和证据都是节点。

### 约束：编号是任意的

图本身并不规定哪个节点是 1 号节点。用置换矩阵 $\mathbf{P}$ 给节点重新编号，会把 $\mathbf{A}$ 变成 $\mathbf{P}\mathbf{A}\mathbf{P}^\top$，把 $\mathbf{X}$ 变成 $\mathbf{P}\mathbf{X}$，描述的仍是同一张图。因此，一个为每个节点输出一个向量的层必须是**置换等变的**（permutation-equivariant），

$$
f(\mathbf{P}\mathbf{A}\mathbf{P}^\top, \mathbf{P}\mathbf{X}) = \mathbf{P}\, f(\mathbf{A}, \mathbf{X}),
$$

这样给输入重新编号只会给输出重新编号，别的什么都不变。整张图的输出必须是置换不变的，$g(\mathbf{P}\mathbf{A}\mathbf{P}^\top, \mathbf{P}\mathbf{X}) = g(\mathbf{A}, \mathbf{X})$，对节点求和、求均值或取最大值都能做到这一点。作用于展平邻接矩阵的 MLP 在两方面都失败：同一张图的 $n!$ 种编号对它来说是不同的输入，而且它根本无法接受不同大小的图。

### 消息传递

出路是：用同一个函数计算每个节点的更新，这个函数的输入是节点自身的状态和其邻居状态的无序集合。Gilmer 等人（2017）写出了**消息传递**（message passing）层的一般形式：

$$
\mathbf{m}_v = \operatorname*{AGG}_{u \in \mathcal{N}(v)} M\big(\mathbf{h}_u, \mathbf{h}_v, \mathbf{e}_{uv}\big), \qquad
\mathbf{h}_v' = U(\mathbf{h}_v, \mathbf{m}_v),
$$

其中聚合函数是求和、均值或最大值，任何与顺序无关的函数都可以。最简单的实例是

$$
\mathbf{h}_v^{(l+1)} = \phi\Big(\mathbf{W}_{\text{self}}\,\mathbf{h}_v^{(l)} + \sum_{u \in \mathcal{N}(v)} \mathbf{W}_{\text{nbr}}\,\mathbf{h}_u^{(l)}\Big).
$$

权重由所有节点共享，就像卷积在各个位置上共享卷积核（[模块 03 第 2 节](module_03_ZH.html#s2)）；图就像一个邻域大小不一、且没有顺序的网格。一层让节点看到它的邻居；$L$ 层给它一个 $L$ 跳的感受野（图 5.17）。

::: figure id=fig-05-17
单个节点的消息传递：邻居的特征向量画成指向枢纽节点的箭头，每个都乘以 $\mathbf{W}$ 和权重 $1/\sqrt{\tilde d_i \tilde d_j}$，与该节点自身变换后的向量相加，再经过一个非线性函数。侧面板用阴影标出两层之后某个基本事件的两跳感受野。
:::

### 为什么要归一化

如果直接求和，度为 50 的节点收到的消息是叶节点的五十倍，于是节点特征的尺度取决于它连接得有多紧密，而不是它是什么。堆叠多层会让情况更糟：$L$ 个未归一化的层把特征乘以 $\mathbf{A}^L$，而 $\mathbf{A}$ 的最大特征值至少等于平均度。在消息传递探索器（[第 8 节](#s8)）的 12 节点冷却系统故障树上，从独热特征出发，带自环的未归一化传播在 8 步之后，特征中的最大值达到 $1.22 \times 10^4$。这么大的特征会使激活函数饱和，破坏优化。

### 从消息传递到 GCN

**图卷积网络**（graph convolutional network，GCN；Kipf 和 Welling，2017）做了三个选择。只用一个权重矩阵，$\mathbf{W}_{\text{self}} = \mathbf{W}_{\text{nbr}} = \mathbf{W}$，于是节点自身的状态只是又一条消息；加入自环，$\tilde{\mathbf{A}} = \mathbf{A} + \mathbf{I}$，相应的度 $\tilde d_i = d_i + 1$ 放在 $\tilde{\mathbf{D}}$ 中；并做对称归一化。以节点特征为行，这一层为

$$
\mathbf{H}^{(l+1)} = \phi\big(\hat{\mathbf{A}}\,\mathbf{H}^{(l)}\,\mathbf{W}^{(l)}\big), \qquad
\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{-1/2}\,\tilde{\mathbf{A}}\,\tilde{\mathbf{D}}^{-1/2}, \qquad
\hat A_{ij} = \frac{\tilde A_{ij}}{\sqrt{\tilde d_i\, \tilde d_j}}.
\tag{5.7}
$$

每条消息都除以两个端点的度的平方根，所以枢纽节点发出的消息在每个接收者那里分量更轻，枢纽节点自身的求和也被缩小。

为什么这能保持尺度不变：令 $\mathbf{u} = \tilde{\mathbf{D}}^{1/2}\mathbf{1}$，即由 $\sqrt{\tilde d_i}$ 组成的向量。那么 $\hat{\mathbf{A}}\mathbf{u} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{A}}\mathbf{1} = \tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{d}} = \tilde{\mathbf{D}}^{1/2}\mathbf{1} = \mathbf{u}$，因为 $\tilde{\mathbf{A}}$ 的行和就是各节点的度。所以 1 是一个特征值。它也是最大的：$\hat{\mathbf{A}} = \tilde{\mathbf{D}}^{1/2}(\tilde{\mathbf{D}}^{-1}\tilde{\mathbf{A}})\tilde{\mathbf{D}}^{-1/2}$ 与 $\tilde{\mathbf{D}}^{-1}\tilde{\mathbf{A}}$ 有相同的特征值，后者每行非负且行和为 1，这样的矩阵没有模大于 1 的特征值。反复应用既不会爆炸，也不会消失。另一种选择是**随机游走归一化**（random-walk normalisation）$\tilde{\mathbf{D}}^{-1}\tilde{\mathbf{A}}$：每个节点取其邻域上的均值。它的特征值相同，但不对称。这一层是置换等变的，因为重新编号给出 $\hat{\mathbf{A}} \to \mathbf{P}\hat{\mathbf{A}}\mathbf{P}^\top$，且利用 $\mathbf{P}^\top\mathbf{P} = \mathbf{I}$ 有 $\mathbf{P}\hat{\mathbf{A}}\mathbf{P}^\top\mathbf{P}\mathbf{H}\mathbf{W} = \mathbf{P}\hat{\mathbf{A}}\mathbf{H}\mathbf{W}$。

Kipf 和 Welling 是从另一个方向得到 (5.7) 的。谱图理论通过图拉普拉斯矩阵的特征向量定义图上的卷积，代价很高。他们把谱滤波器在拉普拉斯矩阵上做一阶近似，把它的两个系数合并为一个，得到传播矩阵 $\mathbf{I} + \mathbf{D}^{-1/2}\mathbf{A}\mathbf{D}^{-1/2}$，它的特征值可达 2，所以反复使用并不稳定。他们的“重归一化技巧”（renormalisation trick）把它换成 $\tilde{\mathbf{D}}^{-1/2}\tilde{\mathbf{A}}\tilde{\mathbf{D}}^{-1/2}$，也就是 (5.7)。本模块的内容都不需要谱的观点；消息传递的推导得到的是同一个层。

### 计算

在稠密矩阵上，这一层只需一行：

```python
def gcn_layer(A_hat, H, W):
    """A_hat: normalised adjacency with self-loops (n x n); H: (n x d); W: (d x d')."""
    return torch.relu(A_hat @ H @ W)
```

稠密的 $\hat{\mathbf{A}}$ 需要 $O(n^2)$ 的内存和时间，大部分花在乘零上。真实的图是稀疏的，所以[实验 3](#lab3) 把 $\hat{\mathbf{A}}$ 存成三元组 $(i, j, \hat A_{ij})$，包含每条边的两个方向以及自环，并用一次 scatter-add 计算 $\text{out}_i = \sum_j \hat A_{ij}\mathbf{H}_j$：

```python
def normalised_edges(edges, n):
    """A-hat as (i, j, weight) triples: both directions of every edge plus self-loops."""
    src = [a for a, b in edges] + [b for a, b in edges] + list(range(n))
    dst = [b for a, b in edges] + [a for a, b in edges] + list(range(n))
    i, j = torch.tensor(dst), torch.tensor(src)       # message travels j -> i
    deg = torch.zeros(n).index_add_(0, i, torch.ones(len(i)))  # d-tilde
    w = (deg[i] * deg[j]).rsqrt()                    # 1 / sqrt(d_i d_j)
    return i, j, w


def propagate(H, i, j, w):
    """out_i = sum over j of A-hat_ij H_j, one multiply-add per stored entry."""
    return torch.zeros_like(H).index_add_(0, i, w[:, None] * H[j])
```

于是一层就是 `torch.relu(propagate(H, i, j, w) @ W)`，代价为 $O(|\mathcal{E}|\,d + n\,d\,d')$：每条边、每个特征一次乘加，再加上与 $\mathbf{W}$ 的稠密乘积。

### 作为图的故障树

**故障树**（fault tree）把一个不希望发生的顶事件分解为各种原因。它的节点是事件和门：或门的输出事件在任一输入发生时发生，与门的输出事件只在所有输入都发生时发生，叶节点是基本事件（泵失效、阀门卡死）。边把每个输入连到它的门上。节点特征取独热编码的类型：[OR, AND, basic]，即（或门，与门，基本事件）。**单点故障**（single point of failure）是这样一个基本事件：它单独失效就会导致顶事件，当且仅当它通往顶事件的路径上每个门都是或门时成立。判断这一点需要几跳之外的信息，这正是它被选为[实验 3](#lab3) 任务的原因。

::: worked title="五节点故障树上的一层 GCN"
顶事件 T 是一个或门，输入为 G1（一个与门）和基本事件 E3；G1 的输入为 E1 和 E2。边：T–G1、T–E3、G1–E1、G1–E2。加上自环后，各节点的度为

$$
\tilde d = (\text{T}\ 3,\ \text{G1}\ 4,\ \text{E1}\ 2,\ \text{E2}\ 2,\ \text{E3}\ 2).
$$

$\hat{\mathbf{A}}$ 的非零元素，每个都是 $1/\sqrt{\tilde d_i \tilde d_j}$：T–T $1/3 = 0.3333$；T–G1 $1/\sqrt{12} = 0.2887$；T–E3 $1/\sqrt{6} = 0.4082$；G1–G1 $1/4 = 0.25$；G1–E1 和 G1–E2 $1/\sqrt{8} = 0.3536$；E1–E1、E2–E2 和 E3–E3 $1/2 = 0.5$。

特征 [OR, AND, basic]：T $(1, 0, 0)$，G1 $(0, 1, 0)$，E1、E2、E3 $(0, 0, 1)$。$\hat{\mathbf{A}}\mathbf{X}$ 的每一行都是该节点及其邻居各行的加权和：

- T：$0.3333\,(1,0,0) + 0.2887\,(0,1,0) + 0.4082\,(0,0,1) = (0.3333, 0.2887, 0.4082)$
- G1：$0.2887\,(1,0,0) + 0.25\,(0,1,0) + 2 \times 0.3536\,(0,0,1) = (0.2887, 0.25, 0.7071)$
- E1 = E2：$0.3536\,(0,1,0) + 0.5\,(0,0,1) = (0, 0.3536, 0.5)$
- E3：$0.4082\,(1,0,0) + 0.5\,(0,0,1) = (0.4082, 0, 0.5)$

取 $\mathbf{W} = \mathbf{I}$ 时，ReLU 不改变任何东西。一层之后，E3 的向量记录了它的门是或门，E1 的向量记录了它的门是与门：E3 是单点故障，E1 不是，对第一个分量做线性读出就能把它们分开。对于更大的树中更深处的事件，答案取决于更上层的门，而一层看不到它们。图 5.16 画出了这棵树和两个矩阵。
:::

::: figure id=fig-05-16
自上而下画出的五节点故障树：T 画成或门，G1 画成与门，E1、E2 和 E3 画成圆。旁边是 $5 \times 5$ 矩阵 $\hat{\mathbf{A}}$ 及其元素，以及 $5 \times 3$ 矩阵 $\hat{\mathbf{A}}\mathbf{X}$，其中 E3 的行 $(0.4082, 0, 0.5)$ 和 E1 的行 $(0, 0.3536, 0.5)$ 突出显示。
:::

::: worked title="归一化对一条边做了什么"
取一个有三个邻居的门，以及它的一个输入，一个只有一个邻居的叶节点。加上自环后，它们的度分别为 4 和 2，它们之间的边在两个方向上的权重都是 $1/\sqrt{4 \times 2} = 0.354$。若不归一化，权重为 1，门对其四条消息（三个邻居加它自己）的求和约为单个特征向量的四倍大。
:::

### 直推式学习与归纳式学习

GCN 论文在一张大图的节点上训练和测试：部分节点有标签，其余节点待预测。这是**直推式**（transductive）学习，测试节点的特征在训练时是可见的，只是没有标签。工程模型通常是**归纳式**（inductive）的：网络在一些故障树上训练，然后应用到新的故障树上。评估也要用同样的方式，按图而不是按节点划分，这是[模块 01 第 10 节](module_01_ZH.html#s10)防止泄漏的规则在图上的版本；[实验 3](#lab3) 在 200 棵树上训练，在另外 100 棵上测试。

::: check
为什么 GNN 层必须是置换等变的？
:::

::: answer
节点编号是任意的：同一张图可以有 $n!$ 种编号方式。给节点重新编号必须只给输出重新编号而不改变其他任何东西，否则模型的预测就会依赖于一个不携带任何信息的标号选择。
:::

::: check
GCN 需要多少层，深度为 3 的基本事件才能接收到来自顶事件的信息？
:::

::: answer
三层。每一层把感受野扩展一跳，而顶事件在深度为 3 的事件上方三条边处。
:::

## 图神经网络 II：注意力、深度的极限与工程中的图 {#s8}

GCN 只按度来给邻居加权，只能做浅层，忽略方向，而且无法区分某些图。

### 图注意力

**图注意力网络**（graph attention network，GAT；Veličković 等人，2018）让特征来决定每个邻居的分量：给每一对打分，在邻域（包括自身）上用 softmax 归一化，再取加权和：

$$
e_{vu} = \operatorname{LeakyReLU}\big(\mathbf{a}^\top[\mathbf{W}\mathbf{h}_v \,\|\, \mathbf{W}\mathbf{h}_u]\big), \qquad
\alpha_{vu} = \frac{\exp(e_{vu})}{\sum_{k \in \mathcal{N}(v) \cup \{v\}} \exp(e_{vk})}, \qquad
\mathbf{h}_v' = \phi\Big(\sum_{u \in \mathcal{N}(v) \cup \{v\}} \alpha_{vu}\,\mathbf{W}\mathbf{h}_u\Big),
$$

其中 $\|$ 表示拼接，$\mathbf{a}$ 是一个学习得到的向量。多个头并行运行；隐藏层把各头的输出拼接起来，最后一层则取平均。Transformer 层（[模块 06](module_06_ZH.html)）就是在其 token 构成的完全图上做注意力，再加上位置信息；GAT 则是限制在边上的注意力。

::: worked title="一个节点的注意力权重"
一个节点有三个邻居，分数为 $e = (0.5, 1.0, -0.2)$；为了让算术简短，略去它的自环。

$$
\exp(e) = (1.6487,\ 2.7183,\ 0.8187), \qquad \text{总和} = 5.1857, \qquad
\alpha = \Big(\frac{1.6487}{5.1857}, \frac{2.7183}{5.1857}, \frac{0.8187}{5.1857}\Big) = (0.318,\ 0.524,\ 0.158).
$$

得分最高的邻居拿到一半的权重。GCN 则只会按度给三者加权，不管它们的特征说了什么。
:::

### 过平滑

对邻域求平均的次数足够多，一切看起来就都一样了。$\hat{\mathbf{A}}$ 是对称的，所以 $\hat{\mathbf{A}} = \sum_i \lambda_i \mathbf{u}_i\mathbf{u}_i^\top$，其中特征向量是标准正交的，于是

$$
\hat{\mathbf{A}}^k\mathbf{X} = \sum_i \lambda_i^k\,\mathbf{u}_i\mathbf{u}_i^\top\mathbf{X}.
$$

[第 7 节](#s7)证明了 $\lambda_1 = 1$，对应的特征向量为 $\mathbf{u}_1 \propto \tilde{\mathbf{D}}^{1/2}\mathbf{1}$。对带自环的连通图，其余每个特征值都满足 $|\lambda_i| < 1$（Perron–Frobenius 定理；自环排除了 $-1$）。所以除第一项外每一项都会衰减，最慢的按 $|\lambda_2|^k$ 衰减，并且

$$
\hat{\mathbf{A}}^k\mathbf{X} \;\to\; \mathbf{u}_1\mathbf{u}_1^\top\mathbf{X}, \qquad
\mathbf{u}_1 = \frac{\tilde{\mathbf{D}}^{1/2}\mathbf{1}}{\|\tilde{\mathbf{D}}^{1/2}\mathbf{1}\|}.
$$

极限的第 $i$ 行是 $(\mathbf{u}_1)_i\,(\mathbf{u}_1^\top\mathbf{X})$，即同一个公共向量乘以 $\sqrt{\tilde d_i}$。所有节点都指向同一个方向，只有度能把它们区分开。这就是**过平滑**（over-smoothing，Li、Han 和 Wu，2018）；传播之间的权重和非线性改变的是细节，而不是这个趋势。

::: worked title="五节点树上的过平滑"
对[第 7 节](#s7)的那棵树，$\hat{\mathbf{A}}$ 的特征值为 1、0.7655、0.5、0.0974 和 $-0.2795$。用 $\hat{\mathbf{A}}^k\mathbf{X}$ 十对行之间的平均余弦来衡量相似度（$\mathbf{X}$ 本身为 0.300）：

| $k$ | 1 | 2 | 4 | 8 | 16 |
|---|---|---|---|---|---|
| 两两之间的平均余弦 | 0.846 | 0.933 | 0.976 | 0.997 | 1.000 |
| $\lvert\lambda_2\rvert^k = 0.7655^k$ | 0.766 | 0.586 | 0.343 | 0.118 | 0.014 |

与极限之间的距离按 $|\lambda_2|^k$ 的预测缩小。极限中，对 (T, G1, E1, E2, E3) 有 $\mathbf{u}_1 \propto (\sqrt 3, 2, \sqrt 2, \sqrt 2, \sqrt 2)$：作为单点故障的 E3 和不是单点故障的 E1，最终得到完全相同的向量。
:::

::: widget name=message-passing-explorer
在 $k = 2$ 时，或门下的基本事件（E1、E5、E6，即单点故障）染成红色，与门下的染成蓝色。把 $k$ 拖到 40：随着余弦以 $|\lambda_2|^k$ 的速率升到 1，所有节点都变成同一种颜色。然后试试把归一化设为“none”，取消勾选自环，再切换到六边形与两个三角形。
:::

没有自环时，树是**二部图**（bipartite；相邻层交替构成两类，每条边都连接这两类），$\mathbf{D}^{-1/2}\mathbf{A}\mathbf{D}^{-1/2}$ 有特征值 $-1$，它对应的项每一步都变号：特征来回振荡而不收敛。在消息传递探索器中，$k = 0$ 到 4 时余弦读数为 0.455、0.384、0.762、0.661、0.832，最终稳定在 0.976 附近，永远到不了 1。

### 实践中的深度

两到四层是典型的。在[实验 3](#lab3) 中，朴素的 GCN 在四层以内提升很快（测试准确率一层时为 0.810，三层时为 0.897，四层时为 0.938），在八层时达到峰值（0.959）；到 12 和 16 层时，它们对每个事件都预测多数类“不是单点故障”：0.781。深的朴素堆叠既会平滑其特征，又难以训练。残差更新 $\mathbf{H} \leftarrow \mathbf{H} + \phi(\hat{\mathbf{A}}\mathbf{H}\mathbf{W})$ 让 16 层恢复到 0.948。归一化层和跳跃知识连接（jumping-knowledge connection，读出能看到每一层）也有帮助。

第二个极限是**过度挤压**（over-squashing，Alon 和 Yahav，2021）：$r$ 跳以内的节点数可以随 $r$ 指数增长，它们的信息必须经过少数几条边挤进一个固定宽度的向量，所以即使深度已经够得着，长程依赖也会受损。

### 消息传递分不清什么

**Weisfeiler–Lehman 检验**（Weisfeiler–Lehman test，1-WL）通过颜色细化来比较图：从一种颜色开始，然后反复根据每个节点自身的颜色及其邻居颜色的多重集给它重新着色；只要颜色计数出现差异，两张图就不同。Xu 等人（2019）证明，从相同的特征出发，任何消息传递 GNN 都无法区分 1-WL 区分不了的图，而先求和再应用 MLP 的**图同构网络**（graph isomorphism network，GIN）能达到这个上限。均值或最大值丢掉了每条消息由多少个邻居发出的信息；求和则保留了它。

::: worked title="一个六边形与两个三角形"
图 P 是一个 6 元环；图 Q 是两个分离的三角形。两张图中每个节点的度都是 2。给每个节点相同的特征 $\mathbf{h}^{(0)}$。每个节点收到两条相同的消息，计算出相同的更新，所以一层之后十二个节点都持有相同的 $\mathbf{h}^{(1)}$，由归纳法，此后也都持有相同的 $\mathbf{h}^{(k)}$。对 GCN 而言，处处 $\tilde d = 3$，$\hat{\mathbf{A}}$ 的非零元素都是 $1/3$，$\hat{\mathbf{A}}\mathbf{X}$ 的每一行都是 $3 \times \tfrac13\,\mathbf{h}^{(0)} = \mathbf{h}^{(0)}$。无论多少层之后，任何读出都无法把一个 6 元环与两个 3 元环区分开，尽管一张图是连通的而另一张不是（图 5.20）。
:::

::: figure id=fig-05-20
消息传递无法区分的两张图：一个六边形与两个三角形，所有节点颜色相同。每张图旁边是一轮和两轮消息传递之后的节点向量，全部相同。
:::

修正办法是用结构特征（度、经过某节点的环的数目）、由图计算出的位置编码或随机的节点标识符来打破对称性。

### 有向边与带类型的边

故障树是有向的，门也有类型。对称的 $\hat{\mathbf{A}}$ 把来自门的消息与来自输入的消息同等对待，而在两跳之外还会混入兄弟节点。**关系图卷积网络**（relational GCN，Schlichtkrull 等人，2018）给每种边类型和方向各自的权重矩阵：$\mathbf{h}_v' = \phi\big(\mathbf{W}_0\mathbf{h}_v + \sum_r \sum_{u \in \mathcal{N}_r(v)} \frac{1}{c_{v,r}}\mathbf{W}_r\mathbf{h}_u\big)$，其中 $c_{v,r}$ 是一个归一化常数，比如 $r$ 类邻居的个数。在[实验 3](#lab3) 中，一个感知方向的层对来自节点所属门的消息和来自其输入的消息使用不同的权重，在两层、三层和四层时分别达到 0.853、0.941 和 1.000；无向 GCN 的最好成绩是八层时的 0.959。

### 工程中的图，以及整图输出

分子性质预测把分子读作它的化学键图。网格上的学习型模拟器，如 MeshGraphNets（Pfaff 等人，2021），对节点和边的特征编码（网格边携带相对位置），用消息传递块处理，再解码出逐节点的物理量，以此把一个偏微分方程在时间上向前推进一步；它们在传统求解器的轨迹上训练。系统模型也是图：故障树（事件和门）、GSN 安全论证（论点、策略、证据）、SysML 模型（部件和连接器）。把它们当作图而不是展平的文本来读的网络，是检查或补全它们的自然工具。

对于整张图上的标签，比如一棵故障树的顶事件概率是否超过目标值，按求和或均值池化节点向量，再应用一个 MLP。测试集必须是另外的图。

::: check
随着 $k$ 增大，$\hat{\mathbf{A}}^k\mathbf{X}$ 收敛到什么？还剩下什么信息？
:::

::: answer
收敛到 $\mathbf{u}_1\mathbf{u}_1^\top\mathbf{X}$，其中 $\mathbf{u}_1 \propto \tilde{\mathbf{D}}^{1/2}\mathbf{1}$，因为 $\hat{\mathbf{A}}$ 的其余每个特征值的模都小于 1。每一行都是同一个公共向量乘以 $\sqrt{\tilde d_i}$，所以只有度保留了下来。
:::

::: check
为什么在单点故障问题上，实验 3 的方向感知模型胜过 GCN？
:::

::: answer
这个性质只取决于一个事件上方的门。对来自门和来自输入的消息使用不同的权重，模型就能把“上方每个门都是或门”逐层向下传递，每层一级；对称的 $\hat{\mathbf{A}}$ 则把这个信号与来自兄弟节点和输入的无关信息混在一起。
:::

::: check
在探索器中，把归一化设为“none”。特征的数值会怎样？为什么？
:::

::: answer
它们会爆炸。传播矩阵为 $\tilde{\mathbf{A}}$ 时，每一步都把特征沿其最大特征向量方向的分量乘以特征值 3.392：8 步之后乘以 $3.392^8 = 1.75 \times 10^4$。读数，即 $k = 8$ 时最大的单个特征，为 $1.22 \times 10^4$，之所以更小，是因为独热特征只有一部分落在这个特征向量的方向上。
:::
