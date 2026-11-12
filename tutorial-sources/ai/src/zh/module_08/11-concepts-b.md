## 大规模架构：结构、混合专家与 muP {#s5}

[第 1 节](#s1) 确定参数预算，本节把预算变成模型结构。块本身来自 [第 06 模块](module_06_ZH.html#s9)：RMSNorm 前置归一化、RoPE 分组查询注意力、SwiGLU 前馈网络及无偏置。剩余选择是尺寸和若干通常参考先例的开关，还有规模增大后出现的两个问题：是否把前馈层换成混合专家，以及如何将小模型调好的超参数迁移到大模型。

### 计算一个块

[第 06 模块，第 11 节](module_06_ZH.html#s11) 推导了块的参数量。设有 $n_h$ 个查询头、$n_{kv}$ 个键值头，头维度为 $d_h$，每层包含

$$
N_{\text{layer}} = \underbrace{d\,(n_h d_h)}_{\mathbf{W}_Q} + \underbrace{2d\,(n_{kv} d_h)}_{\mathbf{W}_K,\,\mathbf{W}_V} + \underbrace{(n_h d_h)\,d}_{\mathbf{W}_O} + \underbrace{3\,d\,d_{\text{ff}}}_{\text{SwiGLU}} + \underbrace{2d}_{\text{norms}},
$$

模型另外加入嵌入参数 $Vd$（输出头不共享时加倍）及最终归一化参数 $d$。通常 $n_h d_h = d$、$n_{kv} = n_h/4$，注意力参数为 $d^2 + d^2/2 + d^2 = 2.5d^2$，因此每层为 $(2.5 + 3d_{\text{ff}}/d)\,d^2$ 加归一化参数：$d_{\text{ff}} = 3.5d$ 时为 $13d^2$，例如 Llama 3 8B；案例中的 $3.75d$ 则为 $13.75d^2$。

粗略规则 $N \approx 12Ld^2$ 来自旧式块：完整多头注意力（$4d^2$）与隐藏宽度 $4d$ 的 GELU MLP，两个矩阵为 $d \times 4d$、$8d^2$。SwiGLU 的 $\mathbf{W}_{\text{down}}\big(\mathrm{SiLU}(\mathbf{W}_{\text{gate}}\mathbf{x}) \odot \mathbf{W}_{\text{up}}\mathbf{x}\big)$ 含三个矩阵，合计 $d \times d_{\text{ff}}$；若要与 GELU MLP 参数相同，需 $3d\,d_{\text{ff}} = 8d^2$，即 $d_{\text{ff}} = 8d/3$，这就是 8/3 规则的来源。许多较新模型扩大到 $3$–$3.75d$，再减少层数以维持参数预算。

::: worked title="计算案例研究的 9,550,729,216 个参数"
配置沿用模块 07 的假设案例，并补上预训练细节：$L = 36$、$d = 4{,}096$，32 个查询头、8 个 KV 头，$d_h = 128$，每个 GQA 组含 4 个查询头，因此 $h_{kv} = n_{kv}d_h = 1{,}024$；SwiGLU $d_{\text{ff}} = 15{,}360$；RMSNorm 前置归一化及最终归一化；RoPE 基数 500,000；预训练上下文 8,192；中英字节级 BPE 词表大小 152,064；嵌入不共享、无偏置。

- 注意力：$4{,}096 \times 4{,}096$（Q）$+\ 2 \times 4{,}096 \times 1{,}024$（K、V）$+\ 4{,}096 \times 4{,}096$（O）$= 41{,}943{,}040$。
- SwiGLU：$3 \times 4{,}096 \times 15{,}360 = 188{,}743{,}680$。两个归一化：$8{,}192$。
- 每层 $230{,}694{,}912$（$13.75d^2 + 2d$），36 层合计 $8{,}305{,}016{,}832$。
- 嵌入：每表 $152{,}064 \times 4{,}096 = 622{,}854{,}144$，两表共 $1{,}245{,}708{,}288$；最终归一化 $4{,}096$。

总量为 $9{,}550{,}729{,}216$：块占 8.31B，两张嵌入表占 1.25B。规则 $12Ld^2 = 7.25\text{B}$ 少算了 1.06B 个块参数：在 $3.75d$ 下，FFN 实际为 $11.25d^2$，规则却假设 $8d^2$；GQA 仅节省注意力的 $1.5d^2$，即 $4d^2$。

对另一结构同样计数：$L = 32$、$d = 4{,}096$，32/8 个头，$d_{\text{ff}} = 14{,}336$、$V = 128{,}256$，嵌入不共享，得到 $6{,}979{,}584{,}000 + 1{,}050{,}673{,}152 + 4{,}096 = 8{,}030{,}261{,}248$，即已发布 Llama 3 8B 的 8.03B。[实验 4](#lab4) 核对这两种参数量。
:::

::: figure id=fig-08-7
案例解码器块以一条 8,192 token 序列标注张量形状：残差流 `(1, 8192, 4096)`，Q `(1, 32, 8192, 128)`，K、V `(1, 8, 8192, 128)`，SwiGLU 隐藏激活 `(1, 8192, 15360)`。各矩阵参数量：Q 16.8M、K 4.2M、V 4.2M、O 16.8M、门控 62.9M、上投影 62.9M、下投影 62.9M。块重复 36 次，位于输入嵌入（622.9M）与不共享输出头（622.9M）之间。
:::

### 选择形状

9–10B 模型的候选选择，需用代理训练验证：

| 决定 | 典型选择 | 原因 |
|---|---|---|
| 层数 $L$ | 32–42 | 不同结构的损失差异较平坦；更深模型增加每 token 时间和流水线阶段成本 |
| 宽度 $d$ | 3,584–4,096 | 根据 $N$、$L$ 推得；128 的倍数利于 kernel |
| 查询头 / KV 头 | 28–32 / 4–8 | 每组 4–8 个查询头的 GQA 缩小 K、V 和 KV cache，损失代价较小 |
| 头维度 | 128 | 约定和 kernel 效率 |
| FFN | SwiGLU | 在相同参数下，损失低于 GELU MLP |
| 归一化 | RMSNorm 前置归一化，加最终归一化 | 稳定深层训练，比层归一化便宜 |
| 位置 | RoPE，基数 $10^4$–$10^6$ | 更大基数适用于更长预期上下文（[第 14 节](#s14)） |
| 词表 | 双语 128k–152k；共享或不共享 | 压缩两种语言（[第 4 节](#s4)）；不共享增加 $Vd$ 参数 |
| 预训练上下文 | 4k–8k，训练中期延长 | 注意力成本随 $T$ 增长；从一开始就采用极长上下文较浪费 |
| 偏置 | 无 | 质量收益有限；移除可改善稳定性并简化实现 |
| 密集或 MoE | 这个规模采用密集模型 | 混合专家以内存和通信换取 FLOP，见下文 |

先确定参数预算，再选结构，检查 kernel 效率及逐层执行成本。代理消融提供迁移证据，却不保证每项选择在完整规模下都表现相同。

### 大规模混合专家

[第 05 模块，第 12 节](module_05_ZH.html#s12) 引入了混合专家。LLM 规模下，每个 FFN 换成 $E$ 个专家 FFN 和路由器；路由器由 $d \times E$ 线性层及 softmax 组成。每个 token 进入得分最高的 $k$ 个专家，输出按路由权重加权求和：

$$
\mathbf{y} = \sum_{e \,\in\, \text{top-}k(\mathbf{g})} g_e\, \mathrm{FFN}_e(\mathbf{x}), \qquad \mathbf{g} = \softmax(\mathbf{W}_r\mathbf{x}).
$$

每 token 计算量取决于它经过的**激活参数**；内存取决于**总参数**，因为每个专家的权重、梯度和优化器状态都需存储。

::: worked title="混合专家案例研究"
将 36 个 FFN 各换成 8 个同大小专家，每层采用 top-2 路由及 $4{,}096 \times 8$ 路由器。

- 总参数：$36 \times (41{,}943{,}040 + 8 \times 188{,}743{,}680 + 32{,}768 + 8{,}192)$，加上嵌入和最终归一化后为 $= 57.1\text{B}$。
- 每 token 激活参数（注意力、两个专家、路由器、归一化）：$36 \times 419{,}471{,}360$，加嵌入及最终归一化后为 $= 16.3\text{B}$。其中 15.7B 参与矩阵乘法，即除输入嵌入之外的全部参数。
- 按本系列规则（[第 1 节](#s1)），每 token 训练 FLOP 为 $6 \times 15.7 \times 10^9 + 7.25 \times 10^9$，加注意力 $T = 8{,}192$，合计 $= 1.02 \times 10^{11}$，约为密集模型 $6.08 \times 10^{10}$ 的 1.7 倍。
- 模型状态每参数 16 字节（[第 8 节](#s8)），合计 $16 \times 57.1\text{B} = 914$ GB，是密集模型 152.8 GB 的 6.0 倍。

八倍 FFN 参数带来 1.7 倍计算量和六倍内存。
:::

**专家并行**将专家分到多个 GPU。每个 token 经一次 all-to-all 调度到持有目标专家的 GPU，输出再经第二次 all-to-all 合并回原 GPU。bf16 下，每 token、每 MoE 层约移动 $2 \times k \times d \times 2$ 字节；上例为 $2 \times 2 \times 4{,}096 \times 2 = 32{,}768$ 字节。因此一条 8,192 token 序列经过 36 层，前向最多传输 9.7 GB，反向也约相同。所选专家位于其他节点时，较慢的 [第 9 节](#s9) 链路可能让 all-to-all 成为瓶颈（图 8.8）。

::: figure id=fig-08-8
四张 GPU 上的专家并行调度与合并，每张持有两个专家。每个 token 路由到两个专家所在 GPU，输出返回原 GPU。示例中每个专家容量为 2,560 次分配。溢出分配的贡献从专家和中省略，残差路径仍保留。箭头表示执行阶段，不是实测通信量。
:::

**负载均衡。** 若不约束，路由器可能只选择少数专家：被偏好的专家获得更多梯度，进而改善并获得更多选择。Switch Transformer 的辅助损失（Fedus 等，2022）抑制这个反馈：

$$
\mathcal{L}_{\text{aux}} = \alpha E \sum_{i=1}^{E} f_i P_i,
$$

其中 $f_i$ 是分派到专家 $i$ 的 token 比例，$P_i$ 是该 batch 中专家 $i$ 的平均路由概率。完全均衡时 $f_i = P_i = 1/E$，和为 $E \cdot E \cdot (1/E^2) = 1$，损失为 $\alpha$；Switch 使用 $\alpha = 10^{-2}$。计数 $f_i$ 不可微，梯度通过 $P_i$ 传播：$\partial\mathcal{L}_{\text{aux}}/\partial P_i = \alpha E f_i$，最忙专家的梯度最大。

**容量。** 容量受限路由器在一个含 $B_{\text{tok}}$ token 的路由组 batch 中，每个专家最多处理 $\mathrm{CF}\cdot kB_{\text{tok}}/E$ 次分配，CF 为**容量因子**。该策略丢弃溢出的分配；没有任何保留分配的 token 只沿残差路径传播。其他路由器可采用无丢弃调度。比较前应说明策略。

::: worked title="不平衡的路由器和溢出的专家"
$E = 4$ 的负载均衡损失：$f = (0.55, 0.15, 0.15, 0.15)$ 和 $P = (0.50, 0.167, 0.167, 0.167)$ 得到 $E\sum_i f_i P_i = 4 \times (0.275 + 3 \times 0.025) = 1.40$，完全均衡时则为 1.00。$P_1$ 上的梯度正比于 $f_1 = 0.55$，为其他专家的 3.7 倍，因此专家 1 的路由概率下降最快。

整个路由组共有 8,192 token，$k = 2$、$E = 8$、$\mathrm{CF} = 1.25$，每个专家有 $1.25 \times 2 \times 8{,}192/8 = 2{,}560$ 个槽位。若某专家得到 16,384 次路由分配中的 30%，即 4,915 次，就会丢弃 $4{,}915 - 2{,}560 = 2{,}355$ 次，近一半分配失去该专家贡献。另一个选中专家若接受这个 token，它仍会获得那部分输出。
:::

后续两项概念性改进：DeepSeek-V3 主要不靠辅助损失均衡负载，而仅在 top-$k$ 选择的路由分数中加入每专家偏置，不改合并输出的权重。每步后降低过载专家偏置、提高空闲专家偏置，使均衡机制不再干扰语言建模梯度。DeepSeekMoE 把专家拆成许多较小专家，每 token 路由到更多专家，并增加所有 token 都经过的共享专家，避免各专家重复存储常识。

**何时采用 MoE。** 应比较实测激活运算量、全部专家存储和路由通信。Mixtral 8x7B 的已发表计数为总量 46.7B、激活 12.9B；DeepSeek-V3 为 671B、37B。激活参数量本身不能预测延迟或等效密集模型损失。案例保留密集模型，避免专家路由，使每个副本可在一个节点内分片。

### 跨宽度迁移学习率：muP

标准参数化下，最优学习率随宽度变化，所以宽度 256 的扫描结果不能直接用于 4,096。原因在 Adam 的归一化更新：$\Delta\mathbf{W}$ 每个元素大小约为 $\eta$，基本不依赖梯度尺度（[第 02 模块，第 8 节](module_02_ZH.html#s8)）。对扇入为 $n$ 的隐藏矩阵，梯度是外积 $\boldsymbol{\delta}\mathbf{x}^\top$，所以 $\Delta W_{ji}$ 的符号为 $-\mathrm{sign}(\delta_j)\,\mathrm{sign}(x_i)$，同一输入对应的输出变化为

$$
\Delta y_j = \sum_{i=1}^{n} \Delta W_{ji}\, x_i \approx -\eta\,\mathrm{sign}(\delta_j) \sum_{i=1}^{n} |x_i|.
$$

这 $n$ 项同向累加，因此变化按 $\eta n$ 增长，而不是随机符号和的 $\eta\sqrt{n}$。若要在宽度增长时保持一阶变化不变，隐藏矩阵需采用 $\eta \propto 1/n$。**muP（最大更新参数化）**（Yang 等，2021）结合相应初始化和输出缩放构建 logits，使窄代理模型上的最优学习率可迁移到宽模型。

::: worked title="迁移学习率"
宽度 256 的扫描找到最优隐藏矩阵学习率 $1 \times 10^{-2}$。宽度 4,096 时，扇入扩大 16 倍，muP 对隐藏矩阵设 $1 \times 10^{-2} \times 256/4{,}096 = 6.25 \times 10^{-4}$；嵌入与输出层遵循其他规则。
:::

实际替代方法包括对最优学习率和 batch 大小随计算量拟合幂律（DeepSeek LLM，2024），或在两三个规模上做简单扫描。

::: check
为什么 MoE 内存由总参数决定，而 FLOP 由激活参数决定？
:::

::: answer
全部专家的权重、梯度和优化器状态都必须存储在某些 GPU 上，但每个 token 只经过 $k$ 个专家，只有这些专家的权重参与其矩阵乘法。
:::

::: check
在辅助损失中 $f_i$ 是不可微的。损失如何仍然平衡负载？
:::

::: answer
梯度通过 $P_i$ 传播，由 $f_i$ 加权：$\partial\mathcal{L}_{\text{aux}}/\partial P_i = \alpha E f_i$。收到最多 token 的专家，路由概率下降最多，从而将 token 分流到其他专家。
:::

::: check
为什么在 Adam 的标准参数化下，在宽度 256 处调整的学习率必须在宽度 4,096 处下降？
:::

::: answer
Adam 的每个更新元素大小约固定为 $\eta$。更宽矩阵让更多更新项同向累加到各输出，因此相同 $\eta$ 带来约 $n$ 倍输出变化。保持变化不变需要 $\eta \propto 1/n$。
:::

## 优化方案：AdamW、调度与 batch 大小 {#s6}

预训练会把一套优化器设置保持数周，不能靠昂贵主训练本身逐项调参。本节为案例计划确定各设置并解释原因。算法来自 [第 02 模块](module_02_ZH.html#s8)；新挑战是约五十万步、每步数百万 token 的规模，而且没有轻易重来一次的机会。

### 预训练中的 AdamW 设置

更新公式（[第 02 模块，第 8 节](module_02_ZH.html#s8)），梯度为 $\mathbf{g}$，偏差校正后的矩为 $\hat{\mathbf{m}}$、$\hat{\mathbf{v}}$，解耦权重衰减为 $\lambda$：

$$
\begin{aligned}
\mathbf{m} &\leftarrow \beta_1\mathbf{m} + (1-\beta_1)\,\mathbf{g}, \qquad \mathbf{v} \leftarrow \beta_2\mathbf{v} + (1-\beta_2)\,\mathbf{g}^2,\\
\theta &\leftarrow \theta - \eta\left(\frac{\hat{\mathbf{m}}}{\sqrt{\hat{\mathbf{v}}} + \epsilon} + \lambda\theta\right).
\end{aligned}
$$

预训练采用 $\beta_1 = 0.9$、$\beta_2 = 0.95$、$\epsilon = 10^{-8}$、$\lambda = 0.1$，只对权重矩阵做权重衰减，不对归一化增益或偏置衰减；许多方案也不对嵌入衰减。

**为什么采用 $\beta_2 = 0.95$，而非 0.999。** 二阶矩平均约记住 $1/(1-\beta_2)$ 步：0.95 对应 20 步，0.999 对应 1,000 步。记忆过长时，梯度尺度突然上升，却遇到陈旧而偏小的 $\mathbf{v}$，使更新 $\hat{\mathbf{m}}/\sqrt{\hat{\mathbf{v}}}$ 过大。

::: worked title="一次异常梯度与两种记忆长度"
某权重的梯度 RMS 为 $10^{-3}$，于是 $v = 10^{-6}$；因梯度符号不断改变，$m$ 接近零。随后出现一次 $10^{-2}$ 的梯度，此时 $m = 0.1 \times 10^{-2} = 10^{-3}$。忽略在训练后期已接近 1 的偏差校正：

- $\beta_2 = 0.999$：$v = 0.999 \times 10^{-6} + 0.001 \times 10^{-4} = 1.099 \times 10^{-6}$，$\sqrt{v} = 1.048 \times 10^{-3}$，更新为 $\eta\,m/\sqrt{v} = 0.954\,\eta$。
- $\beta_2 = 0.95$：$v = 0.95 \times 10^{-6} + 0.05 \times 10^{-4} = 5.95 \times 10^{-6}$，$\sqrt{v} = 2.44 \times 10^{-3}$，更新为 $0.410\,\eta$。

若梯度持续扩大十倍，$v_t = 10^{-4} - 0.99 \times 10^{-4}\,\beta_2^{\,t}$ 在 $\beta_2^{\,t} = 0.505$ 时达到新水平的一半：0.95 需 14 步，0.999 需 683 步。与此同时，$m$ 约 20 步便跟上；因此 0.999 下更新在第 19 步增到 $5.1\,\eta$，300 步后仍为 $1.9\,\eta$，而 0.95 下从不超过 $1.1\,\eta$。
:::

**$\epsilon$。** 大型或深层模型、训练后期的参数梯度 RMS 可能降至 $\epsilon$，这时分母 $\sqrt{\hat{v}} + \epsilon$ 被 $\epsilon$ 主导，无意中抑制更新。Wortsman 等（2024）因此把 $\epsilon$ 降到约 $10^{-15}$。Llama 2 使用 $10^{-5}$；$10^{-8}$ 则是常见默认值。

**权重衰减的时间尺度。** 每步解耦衰减将需衰减权重乘以 $(1 - \eta\lambda)$，因此权重约在 $1/(\eta\lambda)$ 步内忘记初值。应将该时间尺度与训练长度比较。

::: worked title="训练期间权重衰减的时间尺度"
$\eta = 3 \times 10^{-4}$、$\lambda = 0.1$ 对应 $1/(\eta\lambda) = 33{,}333$ 步。案例计划共 508,626 步，若一直保持峰值学习率，相当于 15 个时间尺度；对下方平均速率为峰值 55% 的衰减调度积分，约为 8.4，单靠衰减便将初始权重缩小到 $e^{-8.4} = 2 \times 10^{-4}$。实验 2 的 $\eta = 3 \times 10^{-3}$ 对应 3,333 步，长于其 600 步训练，所以权重衰减在那里作用很小。
:::

### 学习率与调度

峰值学习率是训练中最重要的数值，通过小规模扫描加 muP 或拟合缩放规则（[第 5 节](#s5)）确定；大模型通常需更低峰值。可参考已发表方案：Llama 2 的 7B、13B 采用峰值 $3 \times 10^{-4}$，34B、70B 采用 $1.5 \times 10^{-4}$；预热 2,000 步，余弦衰减到峰值的 10%，batch 为 4M token，裁剪阈值 1.0。7–10B 可预期 $1 \times 10^{-4}$–$3 \times 10^{-4}$，更大模型通常更低。

**预热（warmup）**在最初 1,000–2,000 步线性提高学习率，原因有三：Adam 的 $\mathbf{v}$ 即使校正偏差，初始样本仍太少；早期梯度大，初始化附近曲率高；最初几步若直接使用完整学习率，可能把模型推到无法离开的区域（[实验 3](#lab3) 展示了类似情况）。

**预热加余弦衰减**，设预热 $T_w$ 步、总计 $T$ 步，$\eta_{\min} = 0.1\,\eta_{\max}$：

$$
\eta(t) =
\begin{cases}
\eta_{\max}\, t/T_w, & t < T_w,\\[4pt]
\eta_{\min} + \tfrac{1}{2}(\eta_{\max} - \eta_{\min})\left(1 + \cos\dfrac{\pi(t - T_w)}{T - T_w}\right), & t \ge T_w.
\end{cases}
$$

弱点是 $T$：训练开始前就固定终点。提前停止时尚未完成衰减，延长训练时却已衰减到底。

**预热—稳定—衰减（WSD）**先预热，大部分训练保持峰值，最后 10%–20% 步数再衰减到接近零。相同预算下可匹敌余弦调度（Hägele 等，2024；MiniCPM 推广了它），且无需预定终点：可以延长训练，或从任意稳定阶段检查点分支衰减，一次训练得到多个预算的模型。衰减期间损失明显下降，是步长缩小时噪声被平均的结果，而非学到新知识；因此最后阶段之前，WSD 可能看起来比余弦更差。

::: figure id=fig-08-9
计算得到的 10,000 步学习率调度：预热后余弦衰减至峰值的 10%，WSD 最后 20% 线性衰减至零，以及无预热的恒定学习率。预热在第 500 步结束。这些是调度曲线，不是实测损失曲线。
:::

::: worked title="案例学习率调度"
全局 batch 含 480 条 8,192 token 序列，每步 $3{,}932{,}160$ token，接近 Llama 2 的 4M。2T token 计划因此需 $2 \times 10^{12}/3{,}932{,}160 = 508{,}626$ 步。预热 2,000 步，占训练 0.4%，达到峰值 $3 \times 10^{-4}$，再余弦衰减至 $3 \times 10^{-5}$：

| 步数 | 阶段 | 学习率 |
|---|---|---|
| 1,000 | 预热进行到一半 | $1.5 \times 10^{-4}$ |
| 2,000 | 峰值 | $3.0 \times 10^{-4}$ |
| 127,000 | 衰减进程约四分之一 | $2.61 \times 10^{-4}$ |
| 254,313 | 训练中点 | $1.66 \times 10^{-4}$ |
| 381,000 | 衰减进程约四分之三 | $7.0 \times 10^{-5}$ |
| 508,626 | 结束 | $3.0 \times 10^{-5}$ |

例如第 127,000 步，衰减进度为 $(127{,}000 - 2{,}000)/506{,}626 = 0.247$，$\cos(0.247\pi) = 0.714$，$\eta = 3 \times 10^{-5} + 0.5 \times 2.7 \times 10^{-4} \times 1.714 = 2.61 \times 10^{-4}$。
:::

同一调度的代码形式，供训练循环每步调用：

```python
import math


def lr_at(step, peak=3e-4, warmup=2_000, total=508_626, floor_frac=0.1):
    """Linear warmup to `peak`, then cosine decay to floor_frac * peak at `total`."""
    if step < warmup:
        return peak * step / warmup
    progress = (step - warmup) / (total - warmup)
    floor = floor_frac * peak
    return floor + 0.5 * (peak - floor) * (1 + math.cos(math.pi * progress))


for step in (1_000, 2_000, 127_000, 254_313, 381_000, 508_626):
    print(f"{step:>7,}  {lr_at(step):.2e}")
```

```output
  1,000  1.50e-04
  2,000  3.00e-04
127,000  2.61e-04
254,313  1.66e-04
381,000  7.01e-05
508,626  3.00e-05
```

### batch 大小与临界 batch

Batch 以 token 计：9B 规模常为每步 1M–4M token，有时在训练中逐步增大。McCandlish 等（2018）推导了多大 batch 有用。采用当前权重附近损失的二次近似，真实梯度 $\mathbf{G}$、Hessian $\mathbf{H}$、每 token 梯度协方差 $\boldsymbol{\Sigma}$。在 $B$ token 的 batch 上执行普通 SGD 更新 $-\eta\hat{\mathbf{G}}$，其中 $\hat{\mathbf{G}}$ 的均值为 $\mathbf{G}$、协方差为 $\boldsymbol{\Sigma}/B$。展开至二阶，对 batch 取平均，并使用 $\mathbb{E}[\hat{\mathbf{G}}^\top\mathbf{H}\hat{\mathbf{G}}] = \mathbf{G}^\top\mathbf{H}\mathbf{G} + \operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})/B$：

$$
\mathbb{E}[\Delta L] = -\eta\,\lVert\mathbf{G}\rVert^2 + \tfrac{1}{2}\eta^2\left(\mathbf{G}^\top\mathbf{H}\mathbf{G} + \frac{\operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})}{B}\right).
$$

令关于 $\eta$ 的导数为零，得到最优步长及每步最优损失变化：

$$
\eta^\ast = \frac{\lVert\mathbf{G}\rVert^2}{\mathbf{G}^\top\mathbf{H}\mathbf{G} + \operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})/B},
\qquad
\Delta L_{\text{opt}}(B) = -\frac{1}{2}\,\frac{\lVert\mathbf{G}\rVert^4}{\mathbf{G}^\top\mathbf{H}\mathbf{G} + \operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})/B} = \frac{\Delta L_{\max}}{1 + B_{\text{noise}}/B},
$$

其中 $\Delta L_{\max} = -\lVert\mathbf{G}\rVert^4/(2\,\mathbf{G}^\top\mathbf{H}\mathbf{G})$ 是无限 batch 能达到的效果，**梯度噪声尺度**为

$$
B_{\text{noise}} = \frac{\operatorname{tr}(\mathbf{H}\boldsymbol{\Sigma})}{\mathbf{G}^\top\mathbf{H}\mathbf{G}} \;\approx\; \frac{\operatorname{tr}\boldsymbol{\Sigma}}{\lVert\mathbf{G}\rVert^2},
$$

当 $\mathbf{H}$ 接近单位矩阵的倍数时可作上述近似。McCandlish 等用 $\epsilon$ 表示学习率；这里用 $\eta$，避免与 Adam 的 $\epsilon$ 混淆。Batch 为 $B$ 时，每步达到最大可能进展的 $1/(1 + B_{\text{noise}}/B)$，所以达到给定损失需要

$$
S = S_{\min}\left(1 + \frac{B_{\text{noise}}}{B}\right) \text{ steps}, \qquad
D = SB = D_{\min}\left(1 + \frac{B}{B_{\text{noise}}}\right) \text{ tokens},
$$

其中 $D_{\min} = S_{\min}B_{\text{noise}}$。McCandlish 等用 $E$ 表示样本数；这里用 $D$ 保留本模块的 token 记号，因为 $E$ 已表示 [第 5 节](#s5) 中的专家数。把两项超额部分相乘，得到 $(S/S_{\min} - 1)(D/D_{\min} - 1) = (B_{\text{noise}}/B)(B/B_{\text{noise}}) = 1$，即用步数换 token 的双曲线。**临界 batch 大小** $B_{\text{crit}} = B_{\text{noise}}$ 处，两者均为各自最小值的两倍。损失下降时，平均梯度缩小快于噪声，$B_{\text{noise}}$ 随之增大，这为训练中增大 batch 提供理由。

::: worked title="2M token 噪声尺度附近的步数与 token"
对于 $B_{\text{noise}} = 2\text{M}$ token、$S/S_{\min} = 1 + 2\text{M}/B$ 和 $D/D_{\min} = 1 + B/2\text{M}$：

| batch $B$ (token) | 0.25M | 0.5M | 1M | 2M | 4M | 8M | 16M |
|---|---|---|---|---|---|---|---|
| 步数，$S/S_{\min}$ | 9.0 | 5.0 | 3.0 | 2.0 | 1.5 | 1.25 | 1.125 |
| token, $D/D_{\min}$ | 1.125 | 1.25 | 1.5 | 2.0 | 3.0 | 5.0 | 9.0 |

低于 $B_{\text{noise}}$ 时，batch 加倍几乎让步数减半，只增加少量数据；高于该值后，每次加倍节省的步数越来越少，额外数据成本却越来越高。
:::

::: figure id=fig-08-10
达到固定损失所需步数与 token 的关系，在双对数坐标中绘制 $D/D_{\min}$ 对 $S/S_{\min}$ 的曲线：双曲线 $(S/S_{\min} - 1)(D/D_{\min} - 1) = 1$，batch 为 0.25M、0.5M、1M、2M、4M、8M、16M token 的点位于 $B_{\text{noise}} = 2\text{M}$。临界 batch 标在 (2, 2)；小 batch 一端数据效率高，大 batch 一端时间效率高。
:::

**梯度累积**将 batch 大小与内存需求解耦：一次优化器更新前，累加多个 micro-batch 的梯度。全局 batch 为 micro-batch × 累积步数 × 数据并行度（[第 9 节](#s9)）。

**学习率随 batch 一起调整。** 低于临界 batch 时，更大 batch 可容忍更大学习率；SGD 大致按比例增长，Adam 更接近平方根增长。上方推导假设普通 SGD，因此用于 Adam 时应视为经验模型，通过扫描确认。

::: check
对于 $\beta_2 = 0.95$，Adam 的二阶矩估计大约记住了多少步？
:::

::: answer
约 $1/(1-\beta_2) = 20$ 步，因此可在几十步内适应梯度尺度变化；若为 0.999，则约记住一千步。
:::

::: check
WSD 调度允许哪些余弦调度难以做到的操作？
:::

::: answer
可随时延长训练或决定结束。稳定阶段不依赖预定终点，可从任意稳定检查点分支衰减，因此一次训练可产生多个预算的模型。
:::

::: check
在 $B = B_{\text{crit}}$ 处，与最小值相比，一次运行需要多少步数和 token？
:::

::: answer
均为两倍：$S/S_{\min} = 1 + B_{\text{noise}}/B = 2$、$D/D_{\min} = 1 + B/B_{\text{noise}} = 2$。
:::

## 稳定性与精度：裁剪、z-loss、QK-norm、bf16 与 fp8 {#s7}

长期训练必须避免发散。两个因素影响稳定性：运算采用的数值格式，以及对损失和模块的小幅修改，使数值保持在格式可表示范围内。每项修改针对具体失败机制，理解机制才知道何时采用。

### 格式

浮点数有符号位、决定范围的指数位及决定精度的尾数位。尾数有 $m$ 位时，$x$ 附近相邻数值间距约为 $x \cdot 2^{-m}$。

| 格式 | 符号 / 指数 / 尾数位数 | 最大值 | 最小正规值 | 相对间距 |
|---|---|---|---|---|
| FP32 | 1 / 8 / 23 | $3.4 \times 10^{38}$ | $1.2 \times 10^{-38}$ | $2^{-23} \approx 1.2 \times 10^{-7}$ |
| fp16 | 1 / 5 / 10 | 65,504 | $6.1 \times 10^{-5}$；次正规值可低至 $6.0 \times 10^{-8}$ | $2^{-10} \approx 9.8 \times 10^{-4}$ |
| BF16 | 1 / 8 / 7 | $3.4 \times 10^{38}$ | $1.2 \times 10^{-38}$ | $2^{-7} \approx 7.8 \times 10^{-3}$ |
| fp8 E4M3FN | 1 / 4 / 3 | 448 | $1.6 \times 10^{-2}$ | $2^{-3} = 0.125$ |
| FP8 E5M2 | 1 / 5 / 2 | 57,344 | $6.1 \times 10^{-5}$ | $2^{-2} = 0.25$ |

bf16 有 7 个小数尾数位，fp32 有 23 个；两者指数位数相同，但 bf16 精度更低。fp16 把位数分配到另一方向，比 bf16 多三位尾数，但最大值仅 65,504。[第 10 模块，第 7 节](module_10_ZH.html#s7) 在推理时使用相同格式。

::: figure id=fig-08-11
fp32、fp16、bf16、E4M3FN 和 E5M2 的位数分配与正数可表示范围，包括次正规值。左侧箭头表示低于图示下界的范围。$2\times10^{-8}$ 梯度小于 fp16 最小次正规值；乘以 65,536 后移到 $1.31\times10^{-3}$。
:::

### 运行时的混合精度

典型方案：bf16 输入做矩阵乘法，张量核心内采用 fp32 累加；保留 fp32 主权重和优化器状态；softmax、归一化及损失用 fp32 计算。保留主权重，是因为直接给 bf16 权重加上微小更新会被舍入掉。

::: worked title="为什么主权重是 fp32"
$[2^{-6}, 2^{-5})$ 中一个权重为 0.02，bf16 的 7 位尾数给出间距 $2^{-6} \times 2^{-7} = 2^{-13} = 1.22 \times 10^{-4}$。训练后期学习率 $3 \times 10^{-5}$，归一化 Adam 更新约为 1，实际更新为 $3 \times 10^{-5}$，小于半个间距，因此 $6.1 \times 10^{-5}$。每步更新都被舍入成零，权重始终不动。fp32 在 0.02 附近间距为 $2^{-6} \times 2^{-23} = 1.9 \times 10^{-9}$，可以保留该更新。
:::

```python
import torch

w_bf16 = torch.tensor(0.02, dtype=torch.bfloat16)
w_fp32 = torch.tensor(0.02, dtype=torch.float32)
update = 3e-5                       # late-run learning rate x an Adam step of about 1

print(f"bf16 stores 0.02 as {w_bf16.item():.11f}")
print(f"bf16 after update:  {(w_bf16 + update).item():.11f}")   # unchanged
print(f"fp32 after update:  {(w_fp32 + update).item():.11f}")   # moved by 3e-5
```

```output
bf16 stores 0.02 as 0.02001953125
bf16 after update:  0.02001953125
fp32 after update:  0.02002999932
```

**fp16 与损失缩放。** fp16 精度高于 bf16，范围却很窄：小于最小次正规值约一半的梯度会舍入成零，有些 kernel 还会把次正规值直接置零；注意力分数或激活超过 65,504 则溢出为无穷。损失缩放（Micikevicius 等，2018）在反向前将损失乘以**缩放系数** $s$，使所有梯度扩大 $s$ 倍并可表示，再在更新前除以 $s$。动态缩放自动选择 $s$：梯度出现 inf 或 NaN 时将 $s$ 减半并跳过更新；连续若干干净步骤后将 $s$ 加倍，PyTorch 默认间隔 2,000 步。bf16 与 fp32 有相同指数位数，常用方案无需 fp16 式损失缩放，这是现代训练更稳定的重要原因。

::: worked title="通过损失缩放拯救的梯度"
$2 \times 10^{-8}$ 梯度低于 fp16 最小次正规值 $2^{-24} = 5.96 \times 10^{-8}$ 的一半，所以舍入为零。使用 $s = 65{,}536 = 2^{16}$ 后，计算得到 $2 \times 10^{-8} \times 65{,}536 = 1.31 \times 10^{-3}$，可轻松表示，再在更新前以 fp32 除以 $s$。
:::

**fp8。** 较新训练方案（截至 2026 年）仅对大型矩阵乘法进一步降低精度。精度较高的 E4M3 保存前向权重和激活；一些方案用范围更大的 E5M2 保存梯度。最大值分别只有 448、57,344，因此每个张量都需缩放系数，可根据近期最大绝对值历史设置一个，或像 DeepSeek-V3 按块设置：激活采用 $1 \times 128$ 块，权重采用 $128 \times 128$ 块，乘积以更高精度累加。归一化、softmax、损失和优化器仍保留较高精度。需审慎验证，目前尚非通用默认方案。

### 梯度裁剪

当其范数超过阈值 $c$（通常为 1.0）时，按全局范数进行裁剪会在所有参数上重新缩放整个梯度：

$$
\mathbf{g} \leftarrow \mathbf{g}\cdot\min\left(1, \frac{c}{\lVert\mathbf{g}\rVert_2}\right).
$$

$c = 1.0$ 时，全局范数 4.0 会让所有梯度乘以 0.25，方向保持不变。记录被裁剪步骤的比例。裁剪应处理偶发尖峰；若多数步骤都裁剪，实际有效学习率低于调度值，可能掩盖持续问题。

### z-loss

交叉熵只取决于 logits 差值。对 logits $\mathbf{z}$、目标 $y$，损失为 $-z_y + \log Z$，其中 $Z = \sum_j e^{z_j}$。给每个 logit 加常数 $c$，两项都会增加 $c$ 并抵消。损失不约束 logits 整体水平，因而它可能漂移；较大 logits 在 bf16 中会损失精度，不稳定的指数实现还可能溢出。**z-loss** 把 $\log Z$ 拉向零。采用 $\partial\log Z/\partial z_j = e^{z_j}/Z$：

$$
\mathcal{L}_z = 10^{-4}\,(\log Z)^2, \qquad
\frac{\partial \mathcal{L}_z}{\partial z_j} = 2\cdot 10^{-4}\,\log Z\,\frac{\partial \log Z}{\partial z_j} = 2\cdot10^{-4}\,\log Z\;\softmax(\mathbf{z})_j.
$$

::: worked title="bf16 中漂移的 logit 成本是多少"
Logit 30 位于 $[16, 32)$，bf16 间距为 $16 \times 2^{-7} = 0.125$，附近只能以 0.125 为步长变化，每步改变概率比 $e^{0.125} = 1.13$。4–8 附近的间距为 $4 \times 2^{-7} = 0.031$。若 $\log Z = 30$、系数 $10^{-4}$，z-loss 为每个 logit 梯度加入 $2 \times 10^{-4} \times 30 = 6 \times 10^{-3}$ 乘以 $\softmax(\mathbf{z})_j$，持续将其拉回 $\log Z = 0$；单独交叉熵没有这种约束。
:::

代码中，z-loss 只是交叉熵旁的一行；演示展示它如何约束交叉熵不敏感的整体平移：

```python
import torch
import torch.nn.functional as F


def lm_loss(logits, targets, z_coef=1e-4):
    """Cross-entropy plus z-loss. logits: (B, T, V), maybe bf16; targets: (B, T)."""
    logits = logits.float()                     # the loss is computed in fp32
    log_z = torch.logsumexp(logits, dim=-1)     # (B, T): log of the normaliser Z
    ce = F.cross_entropy(logits.flatten(0, 1), targets.flatten())
    return ce + z_coef * (log_z ** 2).mean()


torch.manual_seed(0)
logits = torch.randn(2, 8, 50, dtype=torch.bfloat16)
targets = torch.randint(0, 50, (2, 8))
shifted = logits.float() + 30.0                 # same softmax, log Z larger by 30
for name, z in (("original", logits), ("shifted by 30", shifted)):
    ce = F.cross_entropy(z.float().flatten(0, 1), targets.flatten())
    print(f"{name:>13}: cross-entropy {ce:.4f}, with z-loss {lm_loss(z, targets):.4f}")
```

```output
     original: cross-entropy 4.4256, with z-loss 4.4277
shifted by 30: cross-entropy 4.4256, with z-loss 4.5448
```

### QK 归一化与注意力 logit 增长

注意力 logits 为 $\mathbf{q}\cdot\mathbf{k}/\sqrt{d_h}$，本身没有上界。训练中查询和键投影增大，会放大 logits，使 softmax 过度集中、注意力熵下降，训练可能停滞或发散（Dehghani 等，2023；Wortsman 等，2024）。**QK-norm** 在点积前，对每头的 $\mathbf{q}$、$\mathbf{k}$ 使用带可学习增益的 RMSNorm。维度 $d_h$、单位 RMS 的向量长度为 $\sqrt{d_h}$，因此

$$
\frac{|\mathbf{q}\cdot\mathbf{k}|}{\sqrt{d_h}} \le \frac{\lVert\mathbf{q}\rVert\,\lVert\mathbf{k}\rVert}{\sqrt{d_h}} = \frac{d_h}{\sqrt{d_h}} = \sqrt{d_h} \approx 11.3 \quad \text{for } d_h = 128,
$$

再乘以可学习增益。其他概念性稳定措施包括更低峰值学习率、更长预热、移除偏置、输出头前归一化，以及对残差投影使用缩放初始化。

### 在小模型上测试修复

Wortsman 等（2024）表明，高学习率小模型可重现大模型的不稳定，允许廉价测试缓解方法：用多个学习率训练，绘制最终损失，考察**学习率敏感性**，即偏离最优学习率后损失恶化多快。[实验 3](#lab3) 在笔记本上进行该实验，同样发现高学习率下注意力 logit 增长导致不稳定；QK 归一化抑制了增长，单独预热、裁剪或 z-loss 则未解决。

::: worked title="实验 3 的不稳定性测量"
当前环境中，$3\times10^{-3}$ 的 150 步参考运行，最后 20 步平均损失为 4.273，最终 batch 的最大注意力 logit 为 28.4。$3\times10^{-2}$ 时，损失为 5.234、logit 为 971.7。逐项累加预热、裁剪、z-loss 后，损失为 5.389–5.549，logit 为 753–1,138；再加 QK 归一化后降为 4.786、12.4。四项措施在参考学习率下共同使用时，损失为 4.024。这是受控训练诊断，不是九个留出评估检查点的比较。
:::

::: check
为什么典型的 bf16 配方避免了 fp16 式的损失缩放？
:::

::: answer
bf16 有 8 位指数，可以表示小得多的数，但极小值仍可能下溢。fp16 只有 5 位指数，最小正次正规值约 $6 \times 10^{-8}$。采用渐进下溢和舍入到最近值时，低于最小间距一半的数舍入为零；部分 kernel 还会把次正规值直接置零。
:::

::: check
z-loss 约束了交叉熵未约束的什么量？
:::

::: answer
Logits 的整体水平 $\log Z$。交叉熵只依赖差值，对所有 logits 的共同平移不敏感。
:::

::: check
某次训练有 95% 步骤被裁剪，这说明什么？
:::

::: answer
有效学习率主要由裁剪阈值而非调度决定，学习率、数据或某层可能持续产生大梯度。应找出原因，而非直接提高阈值。
:::

## 内存核算 {#s8}

配置能否放进 GPU，应先计算再试运行。训练步骤需要四类内存：模型状态（权重、梯度、优化器状态）、反向所需激活、logits 和各类缓冲区。本节逐项核算案例模型。单位约定：GB 为 $10^9$ 字节，GiB 为 $2^{30}$ 字节；本模块采用 GB，其他模块复用的数值旁也给出 GiB。

### 模型状态：每个参数 16 个字节

两种计算得到相同结果。(a) bf16 混合精度加 Adam：bf16 权重 2、bf16 梯度 2、fp32 主权重 4、Adam 一阶矩 4、二阶矩 4，合计每参数 16 字节。(b) PyTorch 采用 fp32 参数加 autocast：fp32 权重 4、梯度 4、$\mathbf{m}$ 4、$\mathbf{v}$ 4，合计 16；bf16 权重副本临时生成。变体包括 fp32 梯度或累积缓冲区再加 2，得到 18 字节；8 位优化器状态为 2 + 2 + 4 + 1 + 1 = 10 字节；带动量 SGD 只保存 4 字节状态，而 Adam 为 8 字节。ZeRO 论文将规则写为 $2 + 2 + K$、$K = 12$。

::: worked title="案例模型状态"
$16 \times 9.551 \times 10^9 = 152.8$ GB，即 142.3 GiB：bf16 权重和梯度各 19.1 GB，fp32 主权重及两个 Adam 矩各 38.2 GB。尚未保存任何激活，单张 80 GB GPU 就已经放不下。
:::

### 激活

反向传播需要每层矩阵乘法及非线性操作的输入（[第 02 模块](module_02_ZH.html#s3)）。案例块采用 FlashAttention、无 dropout，bf16 下每层每 token 保存：

| 保存的张量 | 字节 |
|---|---|
| 两个 RMSNorm 的输入 | $2 \times 2d$ |
| Q、K、V 投影的输入 | $2d$ |
| Q | $2d$ |
| K 和 V | $2 \times 2h_{kv}$ |
| 注意力输出，即 O 的输入 | $2d$ |
| MLP 的输入 | $2d$ |
| SwiGLU 门控、上投影及二者乘积 | $3 \times 2d_{\text{ff}}$ |
| 总计 | $12d + 4h_{kv} + 6d_{\text{ff}}$ |

案例中共 $12 \times 4{,}096 + 4 \times 1{,}024 + 6 \times 15{,}360 = 145{,}408$ 字节，即 $35.5d$。不同实现因融合或重计算策略可相差约 20%。Korthikanti 等（2023）对原始 GPT 块的计数为 $34sbh$ 字节，其中 $s$ 为序列长度，$b$ 为 batch，$h$ 为宽度；dropout 掩码和 GELU 带来不同项，但总量相近。

若不用 FlashAttention，每层 softmax 概率再加 $2n_hT^2$ 字节，dropout 掩码还需更多。FlashAttention 在反向时分块重算，去掉 $T^2$ 项。以 fp32 计算损失的 **logits** 再加 $T \times V \times 4$ 字节，常是单步最大的单个张量；分块或融合交叉熵可避免同时生成全部 logits。

::: worked title="一个 8,192 个 token 序列的激活和 logits"
激活共 $145{,}408 \times 8{,}192 \times 36 = 42.9$ GB，每层 1.19 GB；fp32 logits 为 $8{,}192 \times 152{,}064 \times 4 = 4.98$ GB。若不用 FlashAttention，bf16 注意力概率每层再需 $2 \times 32 \times 8{,}192^2 = 4.29$ GB，全部层合计 155 GB。
:::

### 激活检查点

**激活检查点**也称梯度检查点，只保存每层输入，每层每 token $2d$ 字节，在反向时重算该层前向。内存由全部保存输入及一层激活构成。代价是多一次前向：每 token 训练由三次前向等价量变为四次，约增加三分之一。**选择性检查点**只重算廉价且占内存大的部分，例如注意力分数和激活函数。每 $\sqrt{L}$ 层保存一个分段检查点（Chen 等，2016），以相同的一次额外前向代价获得 $O(\sqrt{L})$ 内存复杂度。

::: worked title="案例研究的完整检查点"
保存层输入需 $2 \times 4{,}096 \times 8{,}192 \times 36 = 2.42$ GB，逐层重算时再需 1.19 GB；合计 3.61 GB，而非 42.9 GB，计算量增加约三分之一。
:::

其余内存用于通信缓冲区、临时工作区和分配器碎片，应预留 5%–10%。将优化器状态卸载到 CPU 内存的 ZeRO-Offload 可缓解容量，却较慢。推理则只需每参数 2 字节的 bf16 权重，案例为 19.1 GB，再加 KV cache（[第 10 模块](module_10_ZH.html#s3)）。

::: figure id=fig-08-12
案例模型内存在单张 80 GB GPU 上的堆叠条形图：bf16 权重 19.1 GB、梯度 19.1 GB，fp32 主权重及两个 Adam 矩各 38.2 GB，模型状态共 152.8 GB；一条 8,192 token 序列再需激活 42.9 GB、fp32 logits 5.0 GB。第二条采用完整激活检查点，激活降为 3.6 GB。两条都超过 80 GB 虚线，这解释了 [第 9 节](#s9) 的必要性。
:::

::: worked title="实验 2 模型的内存量级"
模型状态为 $5.8\text{M} \times 16$ 字节，即 $= 93$ MB。实验在 CPU 用 fp32 运行，对应没有 bf16 副本的方案 (b)。对 $16 \times 256$ token 的 batch，激活按每值 4 字节计约 0.4 GB，logits 为 67 MB，笔记本即可轻松容纳，所以 [实验 2](#lab2) 可省略本节全部节省内存技术。
:::

::: check
bf16 混合精度加 Adam 的每参数 16 字节分别用在哪里？
:::

::: answer
2 用于 bf16 权重，2 用于 bf16 梯度，4 用于 fp32 主权重，4 + 4 用于 Adam 的两个矩。
:::

::: check
为什么激活检查点的计算成本比原来高出大约三分之一而不是两倍？
:::

::: answer
仅重复前向传播：每个 token 的 $6N$ FLOP 的 $2N$，因此训练成本为 $8N$ 而不是 $6N$。
:::

## 数据并行、ZeRO 和 FSDP {#s9}

案例的 152.8 GB 模型状态无法放进单张 GPU；2T token 计划的约 84,500 GPU 小时也要在数周内完成，而非数年。把同一模型的训练分到多张 GPU 可解决两类问题。本节从复制或分片模型状态的方法开始；[第 10 节](#s10) 再切分层本身。

### 数据并行与环形 all-reduce

**数据并行**中，每张 GPU 保存完整模型，处理全局 batch 的一部分。更新前，通过 **all-reduce** 在 GPU 间平均梯度，让各副本权重保持相同。限制是每张 GPU 都需容纳完整模型。

All-reduce 常用环形实现。将 $N_d$ 张 GPU 排成环，把 $S$ 字节缓冲区分成 $N_d$ 块。在 **reduce-scatter** 阶段的 $N_d - 1$ 步中，每张 GPU 每步向邻居发送一块 $S/N_d$ 字节，将收到的块加到本地副本，再转发刚累加的块。$N_d - 1$ 步后，每张 GPU 持有一个已跨全部 GPU 求和的块。**all-gather** 阶段再经 $N_d - 1$ 步传递这些块，直到各 GPU 持有全部求和结果。每张 GPU 发送及接收量均为

$$
2(N_d - 1)\,\frac{S}{N_d} = \frac{2(N_d - 1)}{N_d}\,S \;\longrightarrow\; 2S \quad (N_d \to \infty).
$$

各链路同时工作，若每张 GPU 的链路带宽为 $\mathrm{BW}$，时间约为 $2S/\mathrm{BW}$，几乎不依赖 GPU 数；只有步数及对应延迟随 $N_d$ 增长。框架将梯度分桶，在反向生成某桶后立即归约，使大部分通信与计算重叠。

::: figure id=fig-08-14
四 GPU 环形 all-reduce。Reduce-scatter 表标出每个步骤接收的块及已贡献的 GPU 编号；all-gather 表列出每步后已知的完整求和块。每張 GPU 共发送六个四分之一大小的块，对 $S$ 字节梯度，共发送 $1.5S$ 字节。
:::

带宽数量级（截至 2026 年的典型值）：8 GPU H100 节点内，NVLink 每 GPU 单向约 450 GB/s，双向共 900 GB/s；节点间 InfiniBand 或 RoCE 每 GPU 约 50 GB/s，即 400 Gb/s。约九倍差距影响并行布局选择。

::: worked title="普通数据并行的梯度全归约"
案例的 bf16 梯度为 $S = 2 \times 9.551 \times 10^9 = 19.1$ GB。一个节点内（$N_d = 8$），每 GPU 发送 $2 \times 7/8 \times 19.1 = 33.4$ GB，按 450 GB/s 需 0.074 秒；80 GPU 间每 GPU 发送 $2 \times 79/80 \times 19.1 = 37.7$ GB，按 50 GB/s 需 0.75 秒。2T token 计划每优化器步的计算时间约 7.5 秒（[第 10 节](#s10)）。通信可被计算隐藏，内存需求却无法隐藏，因为各 GPU 仍需 152.8 GB。
:::

### ZeRO：对模型状态进行分片

ZeRO（Rajbhandari 等，2020）保留数据并行，但停止复制无需复制的状态。设模型有 $N$ 个参数，分布到 $N_d$ 张 GPU，论文将并行度写为 $\Psi$；优化器状态每参数 $K = 12$ 字节。各阶段逐步分片每参数 16 字节中的更多部分：

| 策略 | 分片内容 | 每 GPU 内存 | 案例，8 张 GPU |
|---|---|---|---|
| 数据并行 | 无 | $16N$ | 152.8 GB |
| ZeRO-1 | 优化器状态 | $4N + 12N/N_d$ | 52.5 GB |
| ZeRO-2 | 再加梯度 | $2N + 14N/N_d$ | 35.8 GB |
| ZeRO-3 | 再加权重 | $16N/N_d$ | 19.1 GB |

80 张 GPU 上，ZeRO-3 每 GPU 只需 1.9 GB 模型状态。通信由各 GPU 持有的内容决定。阶段 1、2 中，各 GPU 只更新自己的 $1/N_d$ 参数，因此对梯度做 reduce-scatter，让各 GPU 收到自身分片的总和，再 all-gather 更新后的 bf16 权重；每步 $N + N = 2N$ 个元素，与数据并行 all-reduce 相同。阶段 3 还分片权重，因此每层在前向和反向之前各 all-gather 一次，再对梯度 reduce-scatter，共 $3N$，是数据并行的 1.5 倍。

::: worked title="哪些阶段可容纳于 8 × 80 GB 节点"
根据 [第 8 节](#s8)，每张 GPU 再加入一条 8,192 token 序列：激活 42.9 GB，完整检查点时为 3.61 GB；logits 为 4.98 GB。

- ZeRO-3：$19.1 + 42.9 + 5.0 = 67.0$ GB，可容纳，余约 13 GB；完整检查点下为 $19.1 + 3.6 + 5.0 = 27.7$ GB。
- ZeRO-2：$35.8 + 42.9 + 5.0 = 83.7$ GB，无法容纳；完整检查点下为 44.4 GB。
- ZeRO-1：无检查点时 100.4 GB，有检查点时 61.1 GB。

无检查点时只有 ZeRO-3 可容纳；采用检查点后，ZeRO-1 和 ZeRO-2 也能容纳。
:::

::: figure id=fig-08-13
案例在八张 GPU 上的每 GPU 总内存估计：DP、ZeRO 阶段 1–3，分别采用或不采用完整激活检查点。各条包含模型状态、一条 8,192 token 序列的激活和 fp32 logits。80 GB 线未包含运行时余量。按简化估计，阶段 3 即使不用检查点也可容纳。
:::

### FSDP 和混合分片

**FSDP（完全分片数据并行）**是 PyTorch 对阶段 3 的实现。模型划分成单元，通常每个单元为一个 Transformer 块；使用前 all-gather 权重，使用后释放，当前单元计算时预取下一单元。梯度累积是一个陷阱：默认每个 micro-batch 都两次聚集权重并对梯度 reduce-scatter，因此每步通信量随 micro-batch 数增长。若将 reduce-scatter 延到最后一个 micro-batch，各 GPU 就需保存未分片梯度；若跨 micro-batch 保留聚集权重，则保存未分片权重副本。两者都会消耗原本想靠分片节省的内存。

**混合分片（HSDP）**在节点内通过 NVLink 分片，跨节点复制。每个优化器步骤，GPU 的梯度分片与其他节点对应分片做 all-reduce，而频繁的聚集始终留在节点内。[第 10 节](#s10) 解释案例为何采用此布局。

### 全局 batch

[第 6 节](#s6) 的全局 batch 由布局决定：

$$
\text{全局 batch} = \text{微批量} \times \text{累积步数} \times \text{数据并行度}.
$$

案例在 80 GPU 上每步 480 序列，即每 micro-batch 1 序列 × 累积 6 步 × 80。[第 14 节](#s14) 在单节点继续预训练采用 1 × 16 × 8 = 128。并行布局和 batch 大小必须一同选择。

::: widget name=memory-planner
默认显示案例在一个 8 GPU 节点上的估算，只有 ZeRO-3 位于 80 GB 线下。改为完整检查点，观察 ZeRO-1、ZeRO-2 也降到线下。再将序列长度提高到 32,768：完整检查点下，fp32 logits 成为最大的激活相关项。最后关闭 FlashAttention，观察变化。
:::

::: check
为什么 GPU 数增加时，环形 all-reduce 的每 GPU 流量几乎不增长？
:::

::: answer
每 GPU 发送缓冲区大小的 $2(N_d - 1)/N_d$，极限接近 $2S$；GPU 更多意味着更多步骤、每块更小，而非每 GPU 发送更多字节。
:::

::: check
ZeRO-3 为获得 $1/N_d$ 内存付出什么代价？
:::

::: answer
反向前多一次权重 all-gather，每步 $3N$ 个元素，而数据并行为 $2N$，即 1.5 倍；每层还需等待聚集，除非通过预取隐藏。
:::
