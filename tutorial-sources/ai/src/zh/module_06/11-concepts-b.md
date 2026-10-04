## Transformer 块：残差、归一化与前馈网络 {#s5}

Transformer 层，也称为**块（block）**，依次包含两个子层：在位置之间搬运信息的多头注意力，以及在各位置内部变换信息的**前馈网络（feed-forward network，FFN）**。每个子层都经过归一化读取 [第 4 节](#s4) 的残差流，再将输出加回：

$$
\mathbf{X} \leftarrow \mathbf{X} + \operatorname{MHA}\big(\operatorname{Norm}(\mathbf{X})\big),
\qquad
\mathbf{X} \leftarrow \mathbf{X} + \operatorname{FFN}\big(\operatorname{Norm}(\mathbf{X})\big).
$$

这是**前置归一化（pre-norm）**块：归一化位于子层之前的分支上。原始论文则将归一化放在残差相加之后的主路径上，即**后置归一化（post-norm）**块：

$$
\mathbf{X} \leftarrow \operatorname{Norm}\big(\mathbf{X} + \operatorname{MHA}(\mathbf{X})\big),
\qquad
\mathbf{X} \leftarrow \operatorname{Norm}\big(\mathbf{X} + \operatorname{FFN}(\mathbf{X})\big).
$$

这一差别看似细微，却会影响深层网络的训练稳定性和所需的训练措施。约自 2020 年起，前置归一化成为常见配置（图 6.9）。

::: figure id=fig-06-9
后置与前置归一化块并列展示，计算方向由下至上。左侧后置归一化：$\mathbf{x}$ → 注意力 → 圆圈加号（接收从 $\mathbf{x}$ 的跳连）→ Norm → FFN → 圆圈加号 → Norm → 输出；两个 Norm 都位于粗线表示的主路径上。右侧前置归一化：主路径从 $\mathbf{x}$ 直达输出，标为“恒等路径：不经过 Norm”；两条分支分别经过 Norm 和注意力、Norm 和 FFN，再在各自的加号处返回。
:::

### 前置归一化为何有助于稳定训练

沿一个位置的向量追踪前置归一化堆栈：用 $\mathbf{x}_l$ 表示进入子层 $l$ 的残差流，用 $F_l$ 表示该子层。每一步为 $\mathbf{x}_{l+1} = \mathbf{x}_l + F_l(\operatorname{Norm}(\mathbf{x}_l))$。从层 $l$ 到最上层 $L$ 反复展开，得到

$$
\mathbf{x}_L = \mathbf{x}_l + \sum_{m=l}^{L-1} F_m\big(\operatorname{Norm}(\mathbf{x}_m)\big).
$$

对 $\mathbf{x}_l$ 求导（$\mathbf{x}_m$ 中每个满足 $m > l$ 的项也依赖 $\mathbf{x}_l$，导数中包含这条依赖）：

$$
\frac{\partial \mathbf{x}_L}{\partial \mathbf{x}_l} = \mathbf{I} + \sum_{m=l}^{L-1}
\frac{\partial F_m\big(\operatorname{Norm}(\mathbf{x}_m)\big)}{\partial \mathbf{x}_l}.
$$

层 $l$ 处的损失梯度等于 $\partial\mathcal{L}/\partial\mathbf{x}_L$ 乘以上述矩阵，因此恒等项直接贡献 $\partial\mathcal{L}/\partial\mathbf{x}_L$，不受子层具体计算的影响。这条不含权重或归一化的**恒等路径**，即使在子层随机初始化时，也能将输出梯度传到每一层。

后置归一化中，$\mathbf{x}_{l+1} = \operatorname{Norm}(\mathbf{x}_l + F_l(\mathbf{x}_l))$，链式法则给出

$$
\frac{\partial \mathbf{x}_{l+1}}{\partial \mathbf{x}_l} = \mathbf{J}_{\text{Norm}}
\Big(\mathbf{I} + \frac{\partial F_l}{\partial \mathbf{x}_l}\Big),
$$

其中 $\mathbf{J}_{\text{Norm}}$ 是该层输入处归一化运算的雅可比矩阵。从顶部到层 $l$ 的梯度要经过 $L - l$ 个这样的因子。每个因子都按该层激活的尺度进行缩放，深层乘积可能显著增大或减小。Xiong 等（2020）表明，初始化时，后置归一化 Transformer 靠近输出的参数梯度较大，不随深度增大而缩小；前置归一化则会缩小。因此，从第一步就采用较大学习率时，后置归一化模型可能不稳定。原始论文在前 4,000 步逐渐提高学习率，即**预热（warmup）**（[第 02 模块，第 9 节](module_02_ZH.html#s9)）。前置归一化往往降低预热需求，Xiong 等也展示了无需预热的训练配置。两种布局都不能保证在任意学习率下稳定；深度、初始化和其他训练配置仍有影响（[练习 5](#e5)）。

### 回顾归一化

[第 02 模块，第 10 节](module_02_ZH.html#s10) 已介绍归一化层、算例及 PyTorch 实现。LayerNorm 减去均值、除以标准差，再应用可学习的缩放和平移，即 $\operatorname{LayerNorm}(\mathbf{x}) = \boldsymbol{\gamma}\odot(\mathbf{x} - \mu)/\sigma + \boldsymbol{\beta}$。**均方根归一化（RMSNorm）**（Zhang 和 Sennrich，2019）省去减均值和平移，在 Transformer 中计算更便宜，效果相当：

$$
\operatorname{RMSNorm}(\mathbf{x}) = \boldsymbol{\gamma}\odot
\frac{\mathbf{x}}{\sqrt{\tfrac{1}{d}\sum_{j} x_j^2 + \epsilon}}.
$$

本模块还需用到 RMSNorm 的**尺度不变性**。对 $c > 0$，有 $\tfrac1d\sum_j (cx_j)^2 = c^2\cdot\tfrac1d\sum_j x_j^2$，因此

$$
\operatorname{RMSNorm}(c\,\mathbf{x}) =
\boldsymbol{\gamma}\odot\frac{c\,\mathbf{x}}{\sqrt{c^2\,\tfrac1d\sum_j x_j^2 + \epsilon}} =
\boldsymbol{\gamma}\odot\frac{\mathbf{x}}{\sqrt{\tfrac1d\sum_j x_j^2 + \epsilon/c^2}}
\approx \operatorname{RMSNorm}(\mathbf{x})
$$

当 $\epsilon$ 可忽略时，上式成立。前置归一化块的各子层只读取残差流的“方向”，不读取其大小。

### 前置归一化的代价

残差流本身从不归一化。每个子层都向其中添加更新，因此深层前置归一化模型的残差流范数往往随深度增长。同样大小的写入，对较长向量方向的改变小于对较短向量的改变。

::: worked title="同样的写入，在短流和长流上"
取两个方向相同的残差流，均方根（RMS）大小分别为 1 和 8。由于尺度不变性，它们给子层的归一化输入相同，因此子层计算相同的更新。设更新的 RMS 为 1，且与原残差流正交。

1. 短流：垂直边的比例为 $1 : 1$，因此流转动 $\arctan(1/1) = 45°$。
2. 长流：比率$1 : 8$，所以转了$\arctan(1/8) = 7.1°$。

下一次 RMSNorm 只保留方向，因此同样的写入对较长残差流的方向影响约小六倍（$45/7.1 = 6.3$）。除非后续层学会更大的输出，否则它们的影响会减弱。
:::

由此引出两项措施。最后一个块之后、输出词表投影之前，需要最终归一化（[第 12 节](#s12) 代码中的 `self.norm`）；否则 logits 会随残差流大小一起缩放。GPT-2（Radford 等，2019）还将写入残差流的层的初始权重按 $1/\sqrt{N}$ 缩放，$N$ 是残差子层数。$N$ 次独立写入、每次方差 $\sigma^2$，累加后方差为 $N\sigma^2$；将各次写入的方差除以 $N$，即可令总方差保持为 $\sigma^2$，不随深度增长。

### 前馈网络

FFN 独立应用于每个位置。将一个位置的向量写为一列，如 `nn.Linear` 存储它，

$$
\operatorname{FFN}(\mathbf{x}) = \mathbf{W}_2\,\phi(\mathbf{W}_1\mathbf{x}), \qquad
\mathbf{W}_1 \in \R^{d_{\text{ff}}\times d},\quad \mathbf{W}_2 \in \R^{d\times d_{\text{ff}}},
$$

其中 $\phi$ 为非线性函数（原始模型使用 ReLU，BERT 和 GPT-2 使用 GELU）。原始模型的内部宽度为 $d_{\text{ff}} = 4d$，每层有 $2 \times d \times 4d = 8d^2$ 个参数，是注意力 $4d^2$ 的两倍。注意力在位置之间搬运信息；FFN 在各位置内部变换信息。

**FFN 作为键值记忆。** $\mathbf{W}_1\mathbf{x}$ 的第 $i$ 个元素为 $\mathbf{k}_i\cdot\mathbf{x}$，其中 $\mathbf{k}_i$ 是 $\mathbf{W}_1$ 的第 $i$ 行；又有 $\mathbf{W}_2\mathbf{a} = \sum_i a_i\mathbf{v}_i$，其中 $\mathbf{v}_i$ 是 $\mathbf{W}_2$ 的第 $i$ 列。合并得到：

$$
\operatorname{FFN}(\mathbf{x}) = \sum_{i=1}^{d_{\text{ff}}} \phi(\mathbf{k}_i\cdot\mathbf{x})\,
\mathbf{v}_i .
$$

每个隐藏单元都是一个记忆槽：输入匹配它的键时激活，并按激活强度将对应值方向添加到残差流。与注意力不同，这里的键和值是参数，$\phi$ 也不在各槽之间归一化，所以可以同时激活任意数量的槽。Geva 等（2021）在训练后的语言模型中发现，键会响应可辨认的输入模式：低层偏表面模式，高层偏语义模式；对应的值则提高合理后续 token 的概率。Meng 等（2022）将实体事实的检索定位到中间层 FFN，并通过修改一个 FFN 的权重编辑单个事实。因此，知识*似乎*存储在 FFN 中：这是对训练模型的经验解释，并非架构本身保证的性质。


### SwiGLU

当前模型使用门控 FFN (Shazeer 2020)：

$$
\operatorname{FFN}_{\text{SwiGLU}}(\mathbf{x}) =
\mathbf{W}_2\big(\operatorname{SiLU}(\mathbf{W}_1\mathbf{x})\odot\mathbf{W}_3\mathbf{x}\big),
\qquad \operatorname{SiLU}(z) = z\,\sigma(z),
$$

其中 $\sigma$ 是逻辑 sigmoid（[第 02 模块，第 5 节](module_02_ZH.html#s5) 比较 SiLU、ReLU 和 GELU）。单元 $i$ 计算 $\operatorname{SiLU}(\mathbf{k}_i\cdot\mathbf{x})\,(\mathbf{u}_i\cdot\mathbf{x})$，$\mathbf{u}_i$ 是 $\mathbf{W}_3$ 的第 $i$ 行。门与一个可正可负的线性分支相乘，因此各单元可随输入开启、关闭，或产生负输出。Shazeer 在参数量和计算量匹配的条件下比较门控变体，报告其留出集对数困惑度低于 ReLU 或 GELU FFN，并承认尚未解释为何这些架构有效。这个经验结果后来在许多模型中得到验证。

三个矩阵共有 $3\,d\,d_{\text{ff}}$ 个参数；要保持 $8d^2$ 的预算，需要 $d_{\text{ff}} = \tfrac83 d$。

::: worked title="SwiGLU 真实模型中的宽度"
在 $d = 4{,}096$ 处：

1. $\tfrac83 \times 4{,}096 = 10{,}922.7$。
2. 四舍五入为 256 的倍数，适合硬件：$43 \times 256 = 11{,}008$，即 Llama-2-7B 的 $d_{\text{ff}}$。
3. 每层参数：$3 \times 4{,}096 \times 11{,}008 = 135{,}266{,}304$，或 135.3M。
4. $4d = 16{,}384$ 处的 GELU FFN：$2 \times 4{,}096 \times 16{,}384 = 134{,}217{,}728$ 或 134.2M。

宽度取整仅增加 0.8% 的参数；除此之外，两种 FFN 的预算基本相同。
:::

::: keyidea
前置归一化保留从损失到各层的恒等路径，有助于训练深层堆栈；代价是未经归一化的残差流会增大，因此输出前需要最终归一化。
:::

::: check
前置归一化模型还必须在哪里添加一次归一化，为什么？
:::

::: answer
最后一个块之后、输出词表投影之前。前置归一化不归一化残差流本身；若无最终归一化，logits 会随残差流的大小缩放。
:::

::: check
为什么 SwiGLU 使用大约 $8d/3$ 的 $d_{\text{ff}}$ 而不是 $4d$？
:::

::: answer
它有三个 $d \times d_{\text{ff}}$ 矩阵而不是两个。对于 $d_{\text{ff}} = 8d/3$，计数为 $3 \times d \times \tfrac83 d = 8d^2$，与 $4d$ 处的二矩阵 FFN 相同。
:::

## 位置 {#s6}

至此定义的注意力没有顺序概念。用置换矩阵 $\mathbf{P}$ 打乱输入行。投影逐行计算，所以查询、键、值变为 $\mathbf{P}\mathbf{Q}$、$\mathbf{P}\mathbf{K}$、$\mathbf{P}\mathbf{V}$，分数变为 $\mathbf{P}\mathbf{Q}\mathbf{K}^\top\mathbf{P}^\top$，只是重新排列旧分数。逐行 softmax 与这种排列可交换；结合 $\mathbf{P}^\top\mathbf{P} = \mathbf{I}$，输出就是 $\mathbf{P}$ 乘以原输出。因此，无掩码注意力具有**置换等变性（permutation equivariance）**（[练习 4](#e4) 给出完整证明）。逐位置计算的 FFN 和归一化也如此，所以整个堆栈会将“阀门隔离泵”当作“泵隔离阀门”的位置重排。

因果掩码部分打破这种对称性：位置 $t$ 恰好看到 $t$ 个 token，因此均匀权重的头在位置 1 返回 $\mathbf{v}_1$，在位置 100 返回前 100 个值的平均。Haviv 等（2022）发现，即使没有位置编码，仅解码器模型仍能借此学习位置。以下方案显式加入顺序：输入处加一次向量（绝对位置），或在每个注意力层中改变计算，使分数依赖位置偏移（相对位置）。

### 正弦编码

原始的 Transformer 在输入处向位置 $t$ 的 token 嵌入添加一次固定向量：

$$
PE(t, 2i) = \sin(t\,\omega_i), \qquad PE(t, 2i+1) = \cos(t\,\omega_i), \qquad
\omega_i = 10000^{-2i/d}, \quad i = 0, \dots, d/2 - 1.
$$

每对维度对应同一频率的正弦与余弦，频率从 $\omega_0 = 1$（波长约 $2\pi \approx 6.3$ 个位置）按几何比例下降至 $1/10000$（波长接近 $2\pi\times 10{,}000$）。高频维度对区分邻近位置，低频维度对在较粗尺度上定位 token，类似时钟的不同指针（图 6.11）。

::: figure id=fig-06-11
$d = 64$ 正弦位置编码 $PE(t, j)$ 的热图，纵轴为位置 $t = 0, \dots, 127$，横轴为维度 $j = 0, \dots, 63$，色阶为 $-1$–$1$。左侧高频维度形成密集条纹，向右频率降低，条纹变宽。
:::

该设计具有论文中未证明的属性：$t + k$ 的编码是 $t$ 编码的线性函数。角加法公式给出：

$$
\begin{aligned}
\sin((t+k)\omega) &= \sin(t\omega)\cos(k\omega) + \cos(t\omega)\sin(k\omega), \\
\cos((t+k)\omega) &= \cos(t\omega)\cos(k\omega) - \sin(t\omega)\sin(k\omega),
\end{aligned}
$$

于是，一对一对地，

$$
\begin{pmatrix}\sin((t+k)\omega)\\ \cos((t+k)\omega)\end{pmatrix} =
\begin{pmatrix}\cos k\omega & \sin k\omega\\ -\sin k\omega & \cos k\omega\end{pmatrix}
\begin{pmatrix}\sin(t\omega)\\ \cos(t\omega)\end{pmatrix}.
$$

为每对维度堆叠一个 $2\times2$ 旋转矩阵，得到 $PE(t+k) = \mathbf{M}_k\,PE(t)$；矩阵 $\mathbf{M}_k$ 只依赖偏移量 $k$，不依赖 $t$。因此，层可以通过适用于各位置的线性映射，学习关注“前面 $k$ 个位置”。

::: worked title="d = 4 时的正弦编码"
当 $d = 4$ 时，频率为 $\omega_0 = 10000^{0} = 1$ 和 $\omega_1 = 10000^{-2/4} = 0.01$。

1. $PE(0) = (\sin 0, \cos 0, \sin 0, \cos 0) = (0, 1, 0, 1)$。
2. $PE(1) = (\sin 1, \cos 1, \sin 0.01, \cos 0.01) = (0.841, 0.540, 0.010, 1.000)$。
3. $PE(2) = (\sin 2, \cos 2, \sin 0.02, \cos 0.02) = (0.909, -0.416, 0.020, 1.000)$。

检查第一对上的 $k = 1$ 的移位，$\omega = 1$：

$$
\begin{pmatrix}\cos 1 & \sin 1\\ -\sin 1 & \cos 1\end{pmatrix}
\begin{pmatrix}0.841\\ 0.540\end{pmatrix}
= \begin{pmatrix}0.540\times0.841 + 0.841\times0.540\\ -0.841\times0.841 + 0.540\times0.540\end{pmatrix}
= \begin{pmatrix}0.909\\ -0.416\end{pmatrix},
$$

第一对 $PE(2)$。对于每个 $t$，相同的矩阵采用第一对 $PE(t)$ 到 $PE(t+1)$ 的第一对。
:::

### 学习绝对位置

GPT-2 和 BERT 则为每个位置学习一个向量，构成一直覆盖到训练长度的表。GPT-2 最小模型的位置表有 $1{,}024 \times 768 = 786{,}432$ 个参数；BERT 有 512 行。训练长度之外没有对应条目：GPT-2 的第 1,025 个位置没有行；即使表更长，超出训练序列的行也未受训练。可学习绝对位置无法外推（[练习 7](#e7)）。

### 旋转位置编码

当前模型常用**旋转位置编码（rotary position embedding，RoPE）**（Su 等，2021）。它不向输入添加向量，而是在每个注意力层投影之后，将查询和键的 $(q_{2i}, q_{2i+1})$ 个维度两两配对，并按与位置成比例的角度旋转各对：

$$
\begin{pmatrix} q'_{2i}\\ q'_{2i+1}\end{pmatrix} =
\begin{pmatrix}\cos t\theta_i & -\sin t\theta_i\\ \sin t\theta_i & \cos t\theta_i\end{pmatrix}
\begin{pmatrix} q_{2i}\\ q_{2i+1}\end{pmatrix},
\qquad \theta_i = 10000^{-2i/d_k}, \quad i = 0, \dots, d_k/2 - 1,
$$

查询位于 $t$；位置 $s$ 的键同样按 $s\theta_i$ 旋转。值不旋转。

**证明只依赖相对偏移。** 将一对维度表示为复数 $z = x_{2i} + \mathrm{i}\,x_{2i+1}$。需要两个事实。

1. *二维点积是共轭乘积的实部。* 对于 $a$ 和 $b$ 对， $a\,\overline{b} = (a_x + \mathrm{i}a_y)(b_x - \mathrm{i}b_y) = (a_xb_x + a_yb_y) + \mathrm{i}(a_yb_x - a_xb_y)$，所以 $\operatorname{Re}(a\,\overline{b}) = a_xb_x + a_yb_y$。
2. *旋转 $\varphi$ 是乘以 $e^{\mathrm{i}\varphi}$。* $(x + \mathrm{i}y)(\cos\varphi + \mathrm{i}\sin\varphi) = (x\cos\varphi - y\sin\varphi) + \mathrm{i}(x\sin\varphi + y\cos\varphi)$，即上面的矩阵。

因此 $i$ 对对分数有贡献

$$
\operatorname{Re}\Big(z_q e^{\mathrm{i}t\theta_i}\;\overline{z_k e^{\mathrm{i}s\theta_i}}\Big)
= \operatorname{Re}\Big(z_q\,\overline{z_k}\;e^{\mathrm{i}t\theta_i}e^{-\mathrm{i}s\theta_i}\Big)
= \operatorname{Re}\Big(z_q\,\overline{z_k}\;e^{\mathrm{i}(t-s)\theta_i}\Big),
$$

这里使用 $\overline{e^{\mathrm{i}\varphi}} = e^{-\mathrm{i}\varphi}$。右边只通过 $t - s$ 依赖位置。对 $d_k/2$ 对求和后，$\mathbf{q}'_t\cdot\mathbf{k}'_s$ 只依赖 $\mathbf{q}$、$\mathbf{k}$、$t - s$；相对位置无需额外参数即可进入分数。[练习 6](#e6) 给出同一证明的矩阵形式。


::: worked title="RoPE 一对"
取$d_k = 2$，因此存在一对$\theta_0 = 10000^{0} = 1$和$\mathbf{q} = (1, 0)$、$\mathbf{k} = (0, 1)$。

1. $t$ 处的旋转查询：$(\cos t - 0, \sin t + 0) = (\cos t, \sin t)$。
2. $s$ 处的旋转键：$(0 - \sin s, 0 + \cos s) = (-\sin s, \cos s)$。
3. 得分：$-\cos t\sin s + \sin t\cos s = \sin(t - s)$。

因此 $(t, s) = (3, 1)$ 给出 $\sin 2 = 0.909$； $(7, 5)$ 给出相同的 $0.909$； $(1, 3)$ 给出 $\sin(-2) = -0.909$； $(5, 5)$ 给出 0。相等的偏移量，相等的分数。 $t - s$ 的符号很重要，因为 $\mathbf{q} \neq \mathbf{k}$: RoPE 编码方向和距离。
:::

::: widget name=rope-explorer
打开“锁定偏移”并拖动 $t$：各转盘都会旋转，但每对箭头夹角固定，两个读数中的分数保持相等。第一对旋转明显，最后一对几乎不动。将基数提高到 500,000，观察分数曲线变平，再选上下文扩展方法，比较波长条与原始轮廓。
:::

### 频率有什么作用

RoPE 没有参数，也不旋转值，因为位置应改变查询查找哪里，而非返回什么。旋转为正交变换，所以 $\mathbf{q}$、$\mathbf{k}$ 的范数和分数尺度不变。高频对（较小 $i$）编码精细位置，低频对编码较粗位置。

::: worked title="两对，快的和慢的"
$d_k = 4$ 和基数 10,000 给出 $\theta_0 = 1$ 和 $\theta_1 = 10000^{-2/4} = 0.01$。取$\mathbf{q} = \mathbf{k} = (1, 0, 1, 0)$，因此每对是$z = 1$和$z_q\overline{z_k} = 1$；对 $i$ 在偏移量 $\Delta = t - s$ 处贡献 $\cos(\Delta\theta_i)$，并且

$$
\text{score}(\Delta) = \cos\Delta + \cos(0.01\,\Delta).
$$

$\Delta = 0$: $1 + 1 = 2.000$。 $\Delta = 1$: $0.540 + 1.000 = 1.540$。 $\Delta = 2$: $-0.416 + 1.000 = 0.584$。 $\Delta = 10$: $-0.839 + 0.995 = 0.156$。 $\Delta = 100$: $0.862 + 0.540 = 1.403$。 $\Delta = 300$: $-0.022 - 0.990 = -1.012$。

高频对每约 6.3 个 token 重复一次；低频对在数百个 token 的范围内缓慢变化。两者共同区分近距离与远距离偏移。
:::

维度对较多时，高频振荡往往相互抵消；对于对齐的 $\mathbf{q}$ 和 $\mathbf{k}$，分数随偏移增大而衰减，并伴有波动。Su 等称之为**远距离衰减**。

::: worked title="d_k = 128 时的远距离衰减"
取 $\mathbf{q} = \mathbf{k}$ = 全一，$d_k = 128$，基数为 10,000。每对都是 $z = 1 + \mathrm{i}$，因此 $z_q\overline{z_k} = (1+\mathrm{i})(1-\mathrm{i}) = 2$ 和对 $i$ 贡献 $2\cos(\Delta\theta_i)$。在 $\Delta = 0$ 处，64 对给出 $128$。除以 128，标准化分数为 $\Delta = 1$ 处的 $0.970$、16 处的 $0.620$、128 处的 $0.333$、1,024 处的 $0.204$ 和 4,096 处的 $-0.053$。 [实验 2](#lab2) 计算整条曲线。以 500,000 为基数时，衰减速度较慢：相同的计算得出 $0.383$ 为 4,096。
:::

::: figure id=fig-06-13
RoPE 相对于偏移量的得分：$\mathbf{q} = \mathbf{k}$ = 全 1 和 $d_k = 128$ 的归一化得分 $\mathbf{q}'\cdot\mathbf{k}'/128$（其在偏移量 0 处的值为 1），针对 $\Delta$ 绘制对数轴从 1 到 16,384。实线：基数 10,000；虚线：基数 500,000； 0 处的水平参考线。数据来自 实验 2。
:::

低频端对长上下文尤其重要。维度对 $i$ 每 $2\pi/\theta_i$ 个 token 转一整圈，这就是它的**波长**。当 $d_k = 128$、基数为 10,000 时，波长从第 0 对的 $2\pi/1 = 6.28$ 个 token，增长到第 63 对的 $2\pi \times 10000^{126/128} = 54{,}410$ 个 token。64 对中有 18 对（46 到 63）的波长超过 4,096 个 token，因此训练长度为 4,096 的模型从未见它们完成整圈旋转。扩展上下文时，这些对将遇到未见过的角度。

### ALiBi

**ALiBi**（Attention with Linear Biases，带线性偏置的注意力；Press 等，2022）不使用位置向量。头 $h$ 给每个分数添加与距离成比例的固定惩罚：

$$
S_{ts} = \frac{\mathbf{q}_t\cdot\mathbf{k}_s}{\sqrt{d_k}} - m_h\,(t - s), \qquad s \le t.
$$

斜率 $m_h$ 构成几何序列；8 个头时为 $\tfrac12, \tfrac14, \dots, \tfrac1{256}$。大斜率头主要关注局部，小斜率头可以看得更远（图 6.14）。

::: worked title="ALiBi 距离惩罚"
八个头的斜率从 $2^{-1}$ 到 $2^{-8}$。从分数中减去惩罚，等价于将该键未归一化的权重乘以 $e^{-\text{penalty}}$。

1. 距离 100，头 1（$m = 1/2$）：惩罚为 50，乘数 $e^{-50} \approx 2\times10^{-22}$，该键几乎不可见。
2. 距离 100，头 8（$m = 1/256$）：惩罚为 $100/256 = 0.39$，乘数 $e^{-0.39} = 0.68$，该键只受到很小的折减。
3. 距离 1,000，头 8：罚分 $3.9$，系数 $e^{-3.9} = 0.020$。

即使是看得最远的头，1,000 个 token 之前的键，其原始分数也须比近处键高约 3.9，才能与之竞争。
:::

::: figure id=fig-06-14
ALiBi 偏见。左：斜率 $1/2$ 的 $12\times12$ 偏置矩阵，由 $-m(t - s)$ 阴影的下三角形，从对角线上的 0 到左下角的 $-5.5$，以及掩码的上三角形。右：从 0 到 100 的距离的偏差为斜率 $1/2, 1/4, \dots, 1/256$ 的八条直线，垂直轴上从 $-50$ 到 0。
:::

ALiBi 可外推到训练长度之外，因为任意距离都有明确定义的偏置，而且远距离受到很大惩罚，影响很小。这也是它的代价：近因偏置由设计固定，原始分数相同时，远处 token 永远不及近处 token 重要。

### 扩展已训练的上下文

RoPE 模型超过训练长度时性能下降，因为低频对会遇到未见过的角度。下面用扩展因子 $\kappa = L_{\text{target}} / L_{\text{train}}$（写成 $\kappa$，因为 $s$ 已用于键位置）介绍三种方法。

**位置插值（position interpolation）**（Chen 等，2023）将各位置除以 $\kappa$，使所有角度 $t\theta_i/\kappa$ 保持在训练时见过的范围内，再通过短期微调让模型适应。代价是分辨率：相邻 token 的角度差在所有维度对上都缩小 $\theta_i/\kappa$，包括高频对，因而精细位置变得模糊。

**NTK 感知缩放**（于 2023 年非正式提出；YaRN 论文记录了这一点）反而提高了基数，因此最慢的对恰好减慢了 $\kappa$，而最快的对根本没有减慢。最慢的频率是$\theta_{\text{last}} = b^{-(d_k-2)/d_k}$。要求 $b'^{-(d_k-2)/d_k} = b^{-(d_k-2)/d_k}/\kappa$ 并将两边同时求幂 $-d_k/(d_k-2)$ 给出

$$
b' = b\,\kappa^{d_k/(d_k-2)},
$$

而 $\theta_0 = b'^{0} = 1$ 不变。其间的对被 1 和 $\kappa$: $\theta'_i = \theta_i\,\kappa^{-2i/(d_k-2)}$ 之间的因子减慢。

::: worked title="NTK 感知的基数"
$\kappa = 4$、$d_k = 128$、$b = 10{,}000$: $b' = 10{,}000 \times 4^{128/126} = 10{,}000 \times 4.089 = 40{,}890$。对 63 的频率恰好下降了 4，对 0 根本没有下降，对 32 的频率下降了 $4^{64/126} = 2.02$。
:::

**YaRN**（Peng 等，2024）按波长处理：对波长超过训练上下文的维度对按 $\kappa$ 插值，高频对保持不变，中间用斜坡过渡，并对注意力 logits 应用小幅温度调整。当前也有模型从训练之初就使用更大的基数；Llama 3 使用 500,000（Grattafiori 等，2024）。[第 07 模块，第 9 节](module_07_ZH.html#s9) 讨论用户面对的上下文窗口，[第 08 模块，第 14 节](module_08_ZH.html#s14) 讨论长上下文中期训练。

::: figure id=fig-06-15
通过波长看到的上下文扩展。每 RoPE 对 $i = 0, \dots, 63$ ($d_k = 128$) 一根柱，其波长 $2\pi/\theta_i$ 的高度 $\log_{10}$，水平线位于 4,096（“训练上下文”）和 16,384（“目标”）上下文”）。每条三个 token：原始（基础 $10^4$）；使用 $\kappa = 4$ 进行位置插值，每个柱由 $\log_{10}4$ 升高； NTK 感知基数 40,890，慢速对提升至 $\log_{10}4$，最快对不变。文中讨论了 YaRN 的独立波长相关斜坡；这里没有绘制。
:::

::: keyidea
RoPE 按与位置成比例的角度旋转查询与键的维度对，使分数只依赖相对偏移。训练时未完成整圈旋转的低频对，是扩展上下文时容易失效的部分，也是扩展方法重点处理的部分。
:::

::: check
为什么这些值没有旋转？
:::

::: answer
位置应该改变查询查找的位置，而不是返回的内容。旋转值将使输出取决于每个键的绝对位置。
:::

::: check
基数为 10,000、训练长度为 4,096 个 token 的模型，在长度 16,384 下运行。哪些维度对会遇到训练时未见过的角度？
:::

::: answer
波长超过 4,096 个 token 的低频对：在 $d_k = 128$ 下，64 对中有 18 对，即第 46 到
63 对。更高频的对在训练中已经完成整圈旋转，因此见过各种角度。
:::

::: check
哪个 ALiBi 头的行为最像本地窗口？
:::

::: answer
斜率最大的头 $1/2$：20 个 token 之前的键，权重已乘以 $e^{-10}$。
:::

## 模型的三种形状 {#s7}

同一个块可以通过三种方式连接。这三种形状的不同之处在于哪些位置可以关注哪些位置，以及它们被训练来预测什么，并且它们的注意力掩码最清晰地区分了它们：编码器的完整正方形，解码器的下三角形，连接两者的交叉注意力的完整矩形（图 6.16）。

::: figure id=fig-06-16
标题为“仅编码器（BERT）”、“仅解码器（GPT）”和“编码器-解码器（T5，原始）”的三个专栏。每个都显示一个块堆栈，其下方的注意力掩码或掩码为 $6\times6$ 网格，其中填充了允许的单元格：编码器的完整正方形；解码器的下三角；对于编码器-解码器，编码器的完整正方形、解码器的下三角形和交叉注意力的完整 $5\times6$ 矩形（六个编码器键的五个解码器查询）。在每一列下，其训练目标在一行中：“填写屏蔽的 token”、“预测下一个 token”、“将输入映射到输出文本”。插图显示了六个位置上的前缀 LM 掩码：前三个位置是完整的，之后是因果关系。
:::

### 编码器-解码器

最初的 Transformer 和后来的 T5 有两个堆栈。 **编码器**以双向注意力读取输入：每个位置都能看到其他位置。 **解码器**生成具有因果自注意力的输出，并且在每层中都有一个**交叉注意力**子层，该子层读取编码器的最终状态 $\mathbf{H}_{\text{enc}} \in \R^{T_{\text{enc}}\times d}$：

$$
\mathbf{Q} = \mathbf{X}_{\text{dec}}\mathbf{W}_Q, \qquad
\mathbf{K} = \mathbf{H}_{\text{enc}}\mathbf{W}_K, \qquad
\mathbf{V} = \mathbf{H}_{\text{enc}}\mathbf{W}_V .
$$

查询来自解码器，键和值来自编码器，分数的形状为 $(B, h, T_{\text{dec}}, T_{\text{enc}})$。交叉注意力没有因果掩码，因为在解码开始之前整个输入都是已知的；它只需要编码器位置上的填充掩码。编码器的 $\mathbf{K}$ 和 $\mathbf{V}$ 每个输入计算一次，并在每个解码步骤中重用。解码器层具有三个子层：自注意力 ($4d^2$)、交叉注意力 ($4d^2$) 和 FFN ($8d^2$)，因此 $16d^2$ 参数与编码器层的 $12d^2$ 相对应。该形状适合将一个文本映射到另一个文本的任务：翻译、摘要。

::: worked title="计算原始 base 模型"
Vaswani 等人的基座模型具有 $d = 512$、$d_{\text{ff}} = 2{,}048 = 4d$ 和 6 个编码器层和 6 个解码器层。

1. 编码器层：$12d^2 = 12\times512^2 = 3{,}145{,}728 \approx 3.15$M。
2. 解码器层：$16d^2 = 4{,}194{,}304 \approx 4.19$M。
3. 层数：$6\times3.15\text{M} + 6\times4.19\text{M} = 44.0$M。
4. 嵌入：编码器输入、解码器输入和输出投影共享一个矩阵，约 $37{,}000\times512 = 18.9$M，共享词汇表约为 37,000 个 token。
5. 总计：大约 63M，与论文报告的 65M 相比（表 3）。

论文没有逐项说明剩下的 3%。偏置和归一化权重只约 0.1M，词表大小也仅写作“约 37,000”个 token；剩余差异无法根据论文给出的信息分配，所以此处计数止于“约 63M”。
:::

### 仅编码器

**BERT**（Devlin 等，2019）只保留编码器，通过**掩码语言建模（masked language modelling）**训练：选取 15% 的位置，其中 80% 替换为 `[MASK]`，10% 替换为随机 token，10% 保持不变；只在选中位置计算损失。这种混合避免模型学成“只有 `[MASK]` 位置才需要预测”，因为实际使用时不会出现 `[MASK]`。结果是各 token 的上下文表示，可读取输入前置的 `[CLS]` 向量，或对最终状态求平均，用于分类、检索、嵌入。BERT-Base 有 12 层，$d = 768$，110M 参数。仅编码器模型不能直接生成文本续写（[练习 8](#e8)）。

### 仅解码器

**GPT** 只保留解码器，并去掉交叉注意力：采用因果注意力，在各位置计算下一个 token 的预测损失。它原生支持生成；规模足够大时，也能通过提示词完成其他架构所处理的任务。两者之间还有**前缀语言模型（prefix LM）**：对提示词部分使用双向注意力，对续写部分使用因果注意力；T5 研究比较过这一变体（Raffel 等，2020）。

### 为什么仅解码器获胜

它获胜是因为一个目标、一种架构和一次训练涵盖了每一项任务，而且因为生成是人们想要的任务。这句话的每一部分都有其背后的证据。

- **每个位置都是训练目标。** 因果模型预测序列的所有 $T - 1$ 位置处的下一个 token；掩码语言模型的学习对象约为 15%。
- **一个目标涵盖各项任务**，只要将任务写成文本。GPT-2 在未专门训练的任务上表现出零样本能力；GPT-3（Brown 等，2020）则从提示词中的少量示例学习（[第 07 模块，第 6 节](module_07_ZH.html#s6) 介绍上下文学习）。
- **生成是人们想要的任务**，解码器原生地完成它。
- **服务很简单**：根据提示和回答，一个堆栈和一个 KV cache ([第 9 节](#s9))。
- **[第 07 模块，第 4 节](module_07_ZH.html#s4) 的缩放证据**是在此形状上收集的，因此它的缩放行为是最好理解的。

::: worked title="来自一个序列的训练信号"
一条包含 512 个 token 的序列，仅解码器模型得到 511 个下一个 token 的目标，即除最后位置外，每个位置一个。BERT 得到 $0.15\times512 = 76.8$，约 77 个。读取相同数量的 token，因果模型得到的训练目标多于六倍。
:::

也有反面的证据。在受控比较中，结果取决于评估方式。Raffel 等（2020）发现，在预训练后再微调的任务中，同等计算预算下，采用去噪目标的编码器-解码器效果最好。Wang 等（2022）发现，若预训练后直接进行零样本应用，以简单下一个 token 预测训练的因果解码器最好。市场选择了通用性与简单性，这不意味着它在所有任务上都更强。编码器仍是嵌入与检索的有效选择；[人工智能特工系列](../agent/index.html) 展示其在检索增强生成中的应用。

[模块 07 至 10](module_07_ZH.html) 将采用这一架构，并贯穿一个假设案例：使用约 9.5B 参数的开放权重模型，起草和检查反应堆容器泄压系统的安全论证。

::: keyidea
三种架构的区别在掩码与目标：编码器使用双向注意力预测被遮盖的 token；解码器使用因果注意力预测下一个 token；二者之间的交叉注意力由解码器提供查询、编码器提供键和值，不使用因果掩码。
:::

::: check
在交叉注意力中，哪一方提供查询，哪一方提供键和值？
:::

::: answer
解码器提供查询；编码器的输出提供键和值。
:::

::: check
为什么交叉注意力没有被因果掩盖？
:::

::: answer
解码开始前，整个输入序列已经确定，所以各解码器位置都能读取全部输入。只有解码器自身的未来位置，由自注意力的因果掩码遮盖。
:::

## 视觉 Transformer {#s8}

Transformer 并不限定于文本；它处理向量序列，因此也可以把图像变成这种序列（Dosovitskiy 等，2021）。将 $224\times224\times3$ 图像切成 $16\times16$ 图像块，每边 $224/16 = 14$ 块，共 $14\times14 = 196$ 块。各块展平成 $16\times16\times3 = 768$ 个数，再用共享线性层映射到宽度 $d$；这等价于 kernel 大小和步幅均为 16 的卷积。前置一个可学习的 `[CLS]` token，共 197 个 token，再加上可学习位置嵌入，送入仅编码器堆栈。类别由最终 `[CLS]` 向量读出（图 6.17）。这个 token 初始不含图像内容，而是一个可学习向量；它在每层读取所有图像块后，最终状态概括整幅图像。

使用图像块而非像素，是因为注意力成本随 token 数量二次增长。若每个像素对应一个 token，就有 $224^2 = 50{,}176$ 个 token，每层每个头约 $2.5\times10^9$ 个分数；197 个 token 则只有 38,809 个分数。

::: figure id=fig-06-17
示意泵图像分成 196 个形状为 $16\times16\times3$ 的图像块。展平后各块包含 768 个数，用共享线性映射变为模型宽度 $d$。添加类别 token 和位置嵌入后，197 个 token 送入十二层 Transformer 编码器；分类读取类别 token 的输出。
:::

::: worked title="计数 ViT-Base/16"
ViT-Base/16 有 12 层，$d = 768$，12 个头，MLP 宽度为 3,072。根据[第 11 节](#s11)的规则：

1. Transformer 主体：$12Ld^2 = 12\times12\times768^2 = 84{,}934{,}656$，即 84.9M；带有偏差和层范数权重，85.1M。
2. 补丁嵌入：$768\times768 + 768 = 590{,}592$ (0.59M)。
3. 位置嵌入：$197\times768 = 151{,}296$ (0.15M)。
4. 1000 类的线性分类头：$768\times1{,}000 + 1{,}000 = 769{,}000$（0.77M）。

总计约 86.6M，与论文的 86M 相近；Transformer 主体占 98%。
:::

**归纳偏置。** 卷积自带局部性与平移等变性（[第 03 模块](module_03_ZH.html#s2)）；ViT 除了图像块网格外，没有显式加入这些性质，必须从数据学习。只用 ImageNet 规模的数据训练时，它落后于同类 CNN；大规模预训练，或强数据增强与蒸馏，可使它达到或超过 CNN（DeiT，Touvron 等，2021）。作为交换，各层都可联系任意两个图像块，而 CNN 的感受野必须逐层增大。

**成本。** token 的数量随着分辨率的平方增长，注意力随着 token 的平方增长，因此分辨率加倍会使每层的注意力成本乘以约 16。

::: worked title="分辨率加倍"
在 $224\times224$ 下，共 $14^2 + 1 = 197$ 个 token；在 $448\times448$ 下，共 $28^2 + 1 = 785$ 个 token。每层每个头的分数条目为 $197^2 = 38{,}809$ 与 $785^2 = 616{,}225$，相差 15.9 倍。投影和 FFN 成本随 token 数线性增长，增大 $785/197 = 4.0$ 倍。
:::

ViT 如今既可独立使用，也可作为组件。CLIP 的图像编码器（[第 05 模块，第 11 节](module_05_ZH.html#s11)）就是一种；多模态语言模型将视觉编码器的图像块输出投影到解码器的 token 流中（[第 07 模块](module_07_ZH.html)）。

::: check
$384\times384$ 图像使用 $16\times16$ 补丁和 `[CLS]` token 提供多少个 token？
:::

::: answer
每边有 $384/16 = 24$ 个补丁，因此 $24^2 + 1 = 577$ token。
:::
