## 自测题 {#quiz}

为每个问题选择一个答案。错误后重新访问相关概念部分。

```quiz
? 对于 batch 中的 B 个序列，每个序列长 T，每层有 h 个头且每头宽度为 d_k，注意力权重张量的形状是什么？
- [ ] (B, T, d)
- [ ] (B, h, T, d_k)
- [x] (B, h, T, T)
- [ ] (B, T, T, h)
> 每个头都要为每个查询位置与每个键位置的组合打分，因此每个序列的每个头都有一个 T x T 矩阵，整体形状为 (B, h, T, T)。(B, h, T, d_k) 是 q、k、v 以及每个头输出的形状；(B, T, d) 是层输入和输出的形状；(B, T, T, h) 也是一种合法布局，但不是这里的代码所生成的布局。

? 为什么要将分数除以 sqrt(d_k)？
- [x] 使分数的方差大致保持为 1，避免 softmax 在初始化时饱和、梯度消失
- [ ] 使每行注意力权重之和为 1
- [ ] 减少 Q K^T 的 FLOP 数
- [ ] 使注意力与序列长度无关
> 若各分量独立且方差为 1，q.k 的方差就是 d_k；除以 sqrt(d_k) 后，方差恢复为 1。每行和为 1 已由 softmax 保证；这个除法会增加而非减少 FLOP 数，而且与 T 无关。

? 在因果掩码下，位置 3 对位置 5 的注意力权重是多少？
- [ ] 一个小的正数，训练会使它趋近于零
- [x] 恰好为零
- [ ] 等于位置 5 对位置 3 的权重
- [ ] 1/T
> 这个分数在 softmax 之前就被设为 -inf，而 exp(-inf) 恰好等于 0。这个零权重不是训练学出来的；模型的结构使未来位置不可见。注意力并不对称，1/T 则是无掩码且各分数相同时的均匀权重。

? 一个没有位置编码、没有掩码的 Transformer 层先接收一个句子，再接收将同一句子的 token 顺序打乱后的版本。两组输出向量有何关系？
- [ ] 向量相同，排列顺序也相同
- [ ] 完全不同
- [x] 向量相同，并按与输入相同的方式重新排列
- [ ] 只相差一个缩放因子
> 没有位置信息的自注意力具有置换等变性：Attention(PX) = P Attention(X)。模型只看到了一个集合，所以必须另行注入顺序信息。输出不会保持原始顺序，也不会变成另一组不同的向量。

? RoPE 旋转哪些张量？
- [ ] 只在输入处旋转一次 token 嵌入
- [ ] 查询、键和值
- [ ] 只有注意力输出
- [x] 每个注意力层中的查询和键
> RoPE 旋转 q 和 k，使点积对位置的依赖只通过 t - s 体现；值保持不变，而且旋转在每一层内部进行。在输入处添加位置向量是正弦编码和可学习绝对位置编码的做法。

? 一个解码器有 L = 32 层、宽度 d = 4,096，采用多头注意力，每层 FFN 有 8d^2 个参数。不计嵌入，各层一共约有多少参数？
- [ ] 0.5B
- [x] 6.4B
- [ ] 2.1B
- [ ] 12.9B
> 12 L d^2 = 12 x 32 x 4,096^2 = 6.44e9：每层注意力占 4d^2，FFN 占 8d^2。2.1B 只计算了注意力 (4L d^2)；12.9B 将每层计算了两次；同样深度下，0.5B 对应的宽度约为 1,100。

? 对于短上下文的稠密解码器，若参与矩阵乘法的参数为 N_matmul，前向传播和一次训练分别约需多少 FLOP/token？
- [x] 2 N_matmul 和 6 N_matmul
- [ ] N_matmul 和 3 N_matmul
- [ ] 2 N_matmul 和 4 N_matmul
- [ ] 6 N_matmul 和 18 N_matmul
> 每个这样的权重在前向传播中对每个 token 参与一次乘加，即 2 FLOPs；反向传播还要为输入梯度和权重梯度计算两个同等规模的矩阵乘积，因此训练成本约为前向传播的三倍。长上下文时还须计入注意力：上下文为 t 时每个 token 是 4Ldt，对因果序列取平均为 2LdT，训练时同样乘以三。

? 与多头注意力相比，采用 32 个查询头、8 个键值头的分组查询注意力减少了什么？
- [ ] 将查询头数量减少到 8
- [ ] 将 Q K^T 的 FLOP 数减少到四分之一
- [ ] 减小 FFN 宽度
- [x] 将 KV cache 以及 K、V 投影权重减少到四分之一
> 每组四个查询头共用一个 KV 头，因此 K、V 投影和缓存都缩小到四分之一。32 个查询头仍全部保留，每个查询头仍对每个键打分，所以 Q K^T 的 FLOP 数不变，FFN 也不受影响。

? FlashAttention 如何将注意力的内存需求从 O(T^2) 降到 O(T)？
- [ ] 用低秩核函数近似 softmax
- [x] 用持续更新的最大值与总和逐块计算注意力，从不存储完整的 T x T 矩阵
- [ ] 将每个查询限制在滑动窗口内的键上
- [ ] 用 8 位整数存储分数
> 在线 softmax 将每个 tile 的信息并入累计统计量与输出累加器，然后丢弃该 tile；结果仍是精确注意力。低秩核函数和滑动窗口会改变所计算的函数；分数量化只能减少一个常数因子，不能改变内存复杂度的阶数。

? 一个 V = 46 的字符级模型在第 0 步报告损失为 3.88。这说明什么？
- [ ] 模型出错了：初始化损失应接近零
- [ ] 模型已经学到了二元组统计规律
- [x] 初始 logits 对应的分布近乎均匀，符合预期：ln 46 = 3.83
- [ ] 学习率过高
> 尚未学到任何规律的模型应当近似均匀地分配概率，交叉熵为 log V；小幅随机 logits 会使它略高，大约增加 sigma^2/2。这个语料的二元组熵是 1.72，所以模型尚未学到它；此时还没有任何训练更新，学习率也尚未产生影响。

? 关于采用前置归一化的 Transformer，哪一项正确？
- [ ] 在残差相加之后进行归一化
- [ ] 不再需要残差连接
- [x] 中间层的残差相加保留了直接的恒等路径，使梯度传播更容易
- [ ] 归一化参数的数量翻倍
> 前置归一化使用 x + F(Norm(x))，后置归一化使用 Norm(x + F(x))。恒等路径有助于梯度传播，但不能保证在任何学习率下都稳定训练。两者都保留残差连接，归一化参数的数量也相同。

? 以下哪一项最能解释为什么仅解码器结构成为大语言模型的默认选择？
- [x] 每个 token 都提供训练目标，同一个下一个 token 预测目标可以覆盖用文本表示的各种任务，而生成正是产品所需的能力
- [ ] 无论模型规模如何，它的每 token 成本都低于另外两种结构
- [ ] 编码器的参数量不能超过十亿
- [ ] FlashAttention 无法实现交叉注意力
> 原因在于训练信号、任务通用性和产品需求。同等规模下，各种结构的每 token 成本相近；编码器也能扩大规模，融合 kernel 也能处理交叉注意力。

```

## 论文导读 {#reading}

### 阅读 1 {#paper1}

::: paper minutes=20
Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., Polosukhin, I. "Attention is all you need." NeurIPS, 2017. [Paper](https://arxiv.org/abs/1706.03762).

**阅读理由。** 这是原始论文。学完本模块后，你应能理解模型章节的每个方程，并识别它与现代块的区别：后置归一化、正弦位置编码、ReLU、编码器-解码器。

**阅读内容。** 完整阅读第 3 节“模型架构”、第 4 节“为何使用自注意力”和表 1。略读第 5 节“训练”，重点看含预热的学习率公式。第 6 节只看表 3 的 base 与 big 两行，其余结果和结论可跳过。

**阅读时要回答的问题**

1. 找到解释 1/sqrt(d_k) 缩放的脚注。它用了哪些假设，是否与本模块第 2 节相同？
2. 表 1 比较了每层的复杂性。对于哪些序列长度 n（相对于 d），自注意力层比循环层更便宜？
3. 论文使用前置还是后置归一化？引用子层方程，联系学习率公式的预热部分。
4. 使用该模块的规则（d = 512，d_ff = 2,048，12d^2 的 6 个编码器层，16d^2 的 6 个解码器层，大约 37,000 x 512 的一个共享嵌入）估计基本模型的参数，并与表 3 的 65M 进行比较。（大约 63M。）
5. 第 7 节 的三种形状中的哪一种是这个模型，它的交叉注意力键和值来自哪里？
:::

### 阅读 2 {#paper2}

::: paper minutes=13
Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., Liu, Y. "RoFormer: Enhanced transformer with rotary position embedding." arXiv:2104.09864, 2021. [Paper](https://arxiv.org/abs/2104.09864).

**阅读理由。** 作者给出 RoPE 的原始推导，包括第 6 节使用的复数形式，以及实验 2 绘制的远距离衰减性质。

**阅读内容。** 阅读相对位置目标的表述、二维复数推导、一般块对角旋转矩阵、逐元素高效实现及远距离衰减。跳过与线性注意力的结合及实验结果。

**阅读时要回答的问题**

1. 论文要求函数 f_q、f_k 且 <f_q(x_m, m), f_k(x_n, n)> = g(x_m, x_n, m - n)。将其写入该模块的符号 (q, k, t, s) 中。
2. 将本文的逐元素实现与模块的 RoPE() 函数进行比较。每对组合在一起的维度是什么？当权重在实现之间移动时，为什么约定很重要？
3. 用你自己的话陈述长期衰减特性，并将其与 实验 2 的 q = k = 全 1 的曲线进行比较。
:::

### 阅读 3 {#paper3}

::: paper minutes=17
Dao, T., Fu, D. Y., Ermon, S., Rudra, A., Ré, C. "FlashAttention: Fast and memory-efficient exact attention with IO-awareness." NeurIPS, 2022. [Paper](https://arxiv.org/abs/2205.14135).

**阅读理由。** 不做近似，即让注意力额外内存随序列长度线性增长。其算法 1 对应实验 3，背景部分也清楚解释注意力为何受内存限制。

**阅读内容。** 阅读第 2 节的 GPU 存储层级与算法 0，以及第 3.1 节的分块、重算和算法 1。阅读第 3.2 节 IO 复杂度定理的陈述，可跳过证明。略看块稀疏扩展，并查看一个加速测量结果。

**阅读时要回答的问题**

1. 将算法 1 的 m、l 更新对应到第 10 节的在线 softmax 递推。哪一行用 exp(m - m') 重新缩放？
2. 论文给出了标准注意力的 Theta(N d + N^2) HBM 访问和 FlashAttention 的 Theta(N^2 d^2 / M)，其中 M 是 SRAM 大小。证明当 N >> d 时，比率约为 M / d^2，并在 d = 64 且 M = 100 KB 的 fp16 值（约 51,200 个元素）时对其进行评估：约 12。
3. 反向传播为何重算 S、P，而不是从内存读取？为何 FLOPs 更多，反而可能更快？
4. 本文为 A100 上的 HBM 和片上 SRAM 提供了多少带宽？
:::

## 小结 {#summary}

- 注意力计算可见值向量的内容相关加权和。
- 查询键分数按头宽度的平方根缩放，以控制其初始方差。
- 因果掩码可防止每个预测读取其后继 token。
- 多头注意力将几个独立投影的值混合物写入共享的残差流中。
- 前置归一化在中间块保留直接残差路径。
- RoPE 旋转查询与键，使各维度对贡献相对位置分数。
- 编码器、解码器和编码器-解码器模型的信息边界和训练目标有所不同。
- 分组查询保留查询头，同时减少键/值投影宽度和缓存存储。
- FlashAttention 分块计算全注意力，维护累积归一化常数与输出累加器。
- 输入表只做查找时，参数存储量与计算量采用不同计数。
- 训练矩阵乘积的成本约为前向的三倍。
- 初始损失检查与仅前缀评分，可发现普通验证损失遗漏的错误。

下一模块讨论下一个 token 目标对语言建模的意义：分词、困惑度、缩放定律、提示词、采样与大语言模型的局限。继续阅读 [第 07 模块](module_07_ZH.html)。

## 参考文献 {#refs}

- Vaswani, A. et al. "Attention is all you need." NeurIPS, 2017. The original transformer; guided reading 1.
- Bahdanau, D., Cho, K., Bengio, Y. "Neural machine translation by jointly learning to align and translate." ICLR, 2015. The attention the transformer kept (Module 04).
- Devlin, J. et al. "BERT: Pre-training of deep bidirectional transformers for language understanding." NAACL, 2019. Encoder-only, masked language modelling.
- Radford, A. et al. "Improving language understanding by generative pre-training." 2018; "Language models are unsupervised multitask learners." 2019. GPT and GPT-2: decoder-only, learned positions, the 1/sqrt(N) residual initialisation.
- Brown, T. et al. "Language models are few-shot learners." NeurIPS, 2020. GPT-3; in-context learning as the argument for one decoder-only model.
- Raffel, C. et al. "Exploring the limits of transfer learning with a unified text-to-text transformer." JMLR, 2020. T5; the controlled comparison of shapes and objectives.
- Wang, T. et al. "What language model architecture and pretraining objective work best for zero-shot generalization?" ICML, 2022. Causal decoders win for zero-shot use after self-supervised pretraining.
- Xiong, R. et al. "On layer normalization in the transformer architecture." ICML, 2020. Why pre-norm trains without warmup.
- Zhang, B., Sennrich, R. "Root mean square layer normalization." NeurIPS, 2019. RMSNorm.
- Shazeer, N. "GLU variants improve transformer." arXiv, 2020. SwiGLU and its relatives.
- Geva, M., Schuster, R., Berant, J., Levy, O. "Transformer feed-forward layers are key-value memories." EMNLP, 2021.
- Meng, K., Bau, D., Andonian, A., Belinkov, Y. "Locating and editing factual associations in GPT." NeurIPS, 2022. Factual recall localised in mid-layer FFNs.
- Elhage, N. et al. "A mathematical framework for transformer circuits." Transformer Circuits Thread, 2021. The residual stream, QK and OV circuits.
- Olsson, C. et al. "In-context learning and induction heads." Transformer Circuits Thread, 2022. Induction heads and their abrupt formation (Lab 6).
- Jain, S., Wallace, B. C. "Attention is not explanation." NAACL, 2019. Why attention maps need interventions behind them.
- Su, J. et al. "RoFormer: Enhanced transformer with rotary position embedding." arXiv, 2021. RoPE; guided reading 2.
- Press, O., Smith, N. A., Lewis, M. "Train short, test long: attention with linear biases enables input length extrapolation." ICLR, 2022. ALiBi.
- Haviv, A., Ram, O., Press, O., Izsak, P., Levy, O. "Transformer language models without positional encodings still learn positional information." Findings of EMNLP, 2022.
- Chen, S., Wong, S., Chen, L., Tian, Y. "Extending context window of large language models via positional interpolation." arXiv, 2023.
- Peng, B., Quesnelle, J., Fan, H., Shippole, E. "YaRN: Efficient context window extension of large language models." ICLR, 2024. Also traces the history of NTK-aware scaling.
- Shazeer, N. "Fast transformer decoding: One write-head is all you need." arXiv, 2019. Multi-query attention.
- Ainslie, J. et al. "GQA: Training generalized multi-query transformer models from multi-head checkpoints." EMNLP, 2023.
- Beltagy, I., Peters, M. E., Cohan, A. "Longformer: The long-document transformer." arXiv, 2020. Sliding-window plus global attention.
- Jiang, A. Q. et al. "Mistral 7B." arXiv, 2023. Sliding-window attention with GQA in an open model.
- Xiao, G., Tian, Y., Chen, B., Han, S., Lewis, M. "Efficient streaming language models with attention sinks." ICLR, 2024.
- Milakov, M., Gimelshein, N. "Online normalizer calculation for softmax." arXiv, 2018. The online softmax.
- Dao, T., Fu, D. Y., Ermon, S., Rudra, A., Ré, C. "FlashAttention: Fast and memory-efficient exact attention with IO-awareness." NeurIPS, 2022. Guided reading 3.
- Dao, T. "FlashAttention-2: Faster attention with better parallelism and work partitioning." ICLR, 2024.
- Kaplan, J. et al. "Scaling laws for neural language models." arXiv, 2020. The per-token FLOP accounting used in Section 11.
- Touvron, H. et al. "LLaMA: Open and efficient foundation language models." arXiv, 2023. The reference decoder recipe; the 6.7B configuration.
- Touvron, H. et al. "Llama 2: Open foundation and fine-tuned chat models." arXiv, 2023. Training tokens and GPU-hours used in exercise e13.
- Grattafiori, A. et al. "The Llama 3 herd of models." arXiv, 2024. GQA with 8 KV heads; RoPE base 500,000.
- Dosovitskiy, A. et al. "An image is worth 16x16 words: Transformers for image recognition at scale." ICLR, 2021. The vision transformer.
- Touvron, H. et al. "Training data-efficient image transformers and distillation through attention." ICML, 2021. DeiT.
- Phuong, M., Hutter, M. "Formal algorithms for transformers." arXiv, 2022. Precise pseudocode for every variant in this module; a good companion to Section 12's code.
