## 自测题 {#quiz}

每题选择一个答案，作答后阅读解释；错误选项对应不同核算错误。

```quiz
? 一个 2B 参数密集模型训练 100B token，简化估计约需多少训练 FLOP？
- [x] 1.2 x 10^21
- [ ] 4 x 10^20
- [ ] 2.4 x 10^21
- [ ] 1.2 x 10^20
> 简化公式 C ≈ 6ND = 6 x 2 x 10^9 x 10^11 = 1.2 x 10^21。本系列不计输入查表、另加注意力的规则会使结果变化几个百分点。4 x 10^20 只算前向 2ND；2.4 x 10^21 多算一倍；1.2 x 10^20 少了十倍。

? bf16 混合精度采用 Adam 和 fp32 主权重，尚未计入激活时，每参数需多少字节模型状态？
- [x] 16
- [ ] 8
- [ ] 12
- [ ] 4
> bf16 权重 2 + bf16 梯度 2 + fp32 主权重 4 + Adam 两个矩各 4 = 16。12 只算主权重与矩；4 和 8 仅对应 bf16 或 fp32 权重加梯度。

? 为什么 LLM 预训练常把 Adam 的 beta2 设为 0.95，而非默认 0.999？
- [x] 二阶矩约在 20 步内适应梯度尺度变化，避免更新过大
- [ ] 减少优化器内存
- [ ] 使 Adam 等价于带动量 SGD
- [ ] 使预热不再必要
> 二阶矩记忆尺度为 1/(1 - beta2)：0.95 对应 20 步，0.999 对应 1,000 步。较短记忆可更快跟上突然增大的梯度尺度。内存不变，Adam 仍是自适应优化器，也仍需预热。

? MinHash 使用 k = 128 个哈希函数，真实 Jaccard 相似度为 0.8。估计的标准误约为多少？
- [x] 约 0.035
- [ ] 约 0.071
- [ ] 约 0.16
- [ ] 约 0.8/128 = 0.0063
> 每个哈希以概率 J 一致。估计为 128 个 Bernoulli 变量的平均，SE = sqrt(J(1 - J)/k) = sqrt(0.16/128) ≈ 0.035。0.071 约为两个标准误，0.16 为单个哈希的方差，0.0063 错在没有取平方根。

? LSH 有 b = 16 个带、每带 r = 8 行，Jaccard 为 0.5 的文档对成为候选的概率约为多少？
- [x] 6%
- [ ] 50%
- [ ] 0.4%
- [ ] 94%
> P = 1 - (1 - 0.5^8)^16 = 1 - (0.9961)^16 ≈ 0.061。0.4% 是单带概率；50% 混同于相似度本身；94% 接近相似度为 0.8 时的概率。

? N 个参数、N_d 张 GPU、每参数共 16 字节，ZeRO 阶段 2 每 GPU 的模型状态内存为多少？
- [x] 2N + 14N/N_d
- [ ] 4N + 12N/N_d
- [ ] 16N/N_d
- [ ] 16N
> 阶段 2 分片梯度 2 字节及优化器状态 12 字节，完整保留 bf16 权重 2 字节。4N + 12N/N_d 对应阶段 1，16N/N_d 对应阶段 3，16N 对应普通数据并行。

? GPipe 有 p = 4 个阶段、m = 12 个 micro-batch，每个阶段的空闲时间比例是多少？
- [x] 20%
- [ ] 25%
- [ ] 33%
- [ ] 8%
> 空闲比例为 (p - 1)/(m + p - 1) = 3/15 = 20%。25% 是 (p - 1)/m，描述相对理想计算时间的额外气泡，而非占总时间比例；其余来自错误公式。

? 以下关于 bf16 与 fp16 的说法，哪项正确？
- [x] bf16 与 fp32 指数位数相同，尾数位少于 fp16；常用 bf16 方案无需 fp16 式损失缩放
- [ ] bf16 尾数位比 fp16 多，因此更精确
- [ ] fp16 范围比 bf16 大
- [ ] 两者训练 LLM 都必须动态损失缩放
> bf16 的符号/指数/小数尾数为 1/8/7 位，fp16 为 1/5/10。较宽指数范围缓解了 fp16 损失缩放针对的下溢。极小 bf16 值仍可能下溢，两格式次正规值范围也不同。

? 完整激活检查点保存每层输入、反向时重算前向，训练计算量约增加多少？
- [x] 三分之一
- [ ] 一倍
- [ ] 5%
- [ ] 不增加，只改变内存位置
> 每 token 6N FLOP 中的前向 2N 被重复，8N/6N ≈ 1.33。重算需要额外计算，但只重复前向，不重复反向。

? 为什么张量并行通常限制在单节点 GPU 内？
- [x] 每层都对激活做 all-reduce，需要节点内链路带宽
- [ ] 不能与数据并行组合
- [ ] 会改变模型数学
- [ ] 必须搭配流水线并行
> Megatron 式 TP 每层前向两次、反向两次 all-reduce。案例 TP = 2 时，每 micro-batch 约 9.7 GB，NVLink 理想约 21 ms，InfiniBand 约 0.19 s。TP 可与 DP、PP 组合，计算同一函数。

? 只用领域文本继续预训练，使通用留出损失大幅上升。应先做什么修改？
- [x] 混入通用回放，降低峰值学习率
- [ ] 提高学习率以更快完成
- [ ] 用领域文本训练更久
- [ ] 去掉预热
> 通用回放提供保留梯度，较低峰值限制相对基座的移动。应重新评估两类分布及任务门槛；两项修改都不保证保留所有能力。

? 同一 500 题基准中，检查点 A 得分 41%，B 得分 44%。可以得出什么结论？
- [x] 仅凭总分不能判断配对差异
- [ ] B 更好
- [ ] A 更好，因为它更早
- [ ] 基准永远无法支持任何结论
> 各准确率标准误约 2.2 个百分点，但差异的显著性取决于哪些题目改变结果。保留逐题结果，采用配对区间或检验；两个边际百分比不能判断三个百分点改善是否稳定。

```

## 论文导读 {#reading}

重点阅读实验比较及核算假设。接受某个训练方案之前，先重现一项结果或计算。

::: paper minutes=20
[Penedo, G., Kydlíček, H., Ben Allal, L., Lozhkov, A., Mitchell, M., Raffel, C., von Werra, L., Wolf, T. "The FineWeb datasets: Decanting the web for the finest text data at scale." NeurIPS Datasets and Benchmarks Track, 2024.](https://arxiv.org/abs/2406.17557)

**阅读目的。** 了解有明确记录、包含过滤和去重消融的网络数据流程，特别是初始方案未改善模型的那些决策。

**阅读范围。** 阅读引言、文本提取、基础过滤、去重（包括逐快照的结论）及 FineWeb-Edu 标注和分类器部分。略读自定义启发式过滤及与其他数据集比较；跳过附录。

**阅读时要回答的问题。**

1. 为什么作者使用 trafilatura 从 WARC 文件中提取文本而不是使用 WET 文本，他们如何证明它很重要？
2. 对全部快照一起去重出现了什么问题？作者改用什么方案？为何全局去重可能偏向较旧、较低质量文本？
3. 教育质量分类器如何构建，包括标注者、评分尺度、标注样本数和模型？哪个阈值得到 FineWeb-Edu？
4. 数据消融使用多大模型、多少 token？这说明如何测试数据决策？
:::

::: paper minutes=15
[Rajbhandari, S., Rasley, J., Ruwase, O., He, Y. "ZeRO: Memory optimizations toward training trillion parameter models." SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, 2020.](https://arxiv.org/abs/1910.02054)

**阅读目的。** 理解每参数 16 字节及三个分片阶段的来源，第 8、9 节推导这些阶段，FSDP 实现对应机制。

**阅读范围。** 阅读引言及内存图、模型状态和剩余状态的内存分析、三个 ZeRO-DP 阶段及通信分析。略读 ZeRO-R，跳过实现和评估部分。

**阅读时要回答的问题。**

1. 重现论文中 7.5B 参数模型在 64 GPU 上的每 GPU 内存：基线和三个阶段分别为 120、31.4、16.6、1.9 GB。
2. 为什么参数分片的成本仅为数据并行通信的 1.5 倍而不是更多？
3. 什么是“剩余状态”？本模块哪些技术分别处理这些状态？
:::

::: paper minutes=15
[Wortsman, M. et al. "Small-scale proxies for large-scale Transformer training instabilities." ICLR, 2024 (arXiv 2023).](https://arxiv.org/abs/2309.14322)

**阅读目的。** 论文表明，大训练的不稳定可在高学习率小模型上重现和修复。实验 3 采用同样方法；论文也提供 QK-norm、z-loss 和 AdamW epsilon 建议的证据。

**阅读范围。** 阅读引言、qk-layernorm 与注意力 logit 增长、z-loss 与输出 logit 发散，以及学习率敏感性定义。略读其他干预措施：预热、独立权重衰减、muParam、AdamW epsilon；跳过附录。

**阅读时要回答的问题。**

1. 什么是学习率敏感性？为什么它比最佳损失更有助概括训练表现？
2. 什么证据将注意力 logit 增长与发散联系起来？qk-layernorm 如何改变敏感性曲线？与实验 3 实测比较。
3. z-loss 为什么能修复输出 logit 发散？不用时 logits 如何变化？
4. 随模型增大，作者对 AdamW epsilon 有什么发现和建议？
:::

## 小结 {#summary}

- 主训练投入之前确定分词器、结构、数据策略和调度终点；记录所有后续阶段变化。
- 训练计算包含矩阵权重及随上下文变化的注意力；规划 token、时间和 MFU 时采用一致约定。
- 数据清理是会误删的策略，每篇被删文档都应留下可审计原因。
- 精确指纹、MinHash-LSH 候选生成及精确重叠验证，分别回答不同的重复检测问题。
- 混合权重决定来源使用次数；重复 token 提供的新信息递减，也可能增加记忆。
- 打包避免填充浪费，但须明确 EOS 边界、跨文档注意力及验证划分策略。
- 学习率调度、batch 大小和优化器矩影响训练轨迹，应监测实际学习率及裁剪前梯度。
- 分别诊断注意力 logit 增长与输出 logit 漂移；裁剪、QK 归一化和 z-loss 作用于不同量。
- 选择分片、检查点或并行之前，先计算模型状态、保存激活、logits 及运行时余量。
- 恢复必须还原优化器和采样器状态，只能采用已完整写入的检查点。
- 评估固定留出分布及配对任务结果；仅训练损失下降或小幅通用基准改善并不足够。
- 继续预训练在领域适配与通用保留之间取舍，查看结果前必须声明验收门槛。

保留的基座检查点是一个分布模型。[第 09 模块](module_09_ZH.html) 通过监督微调和偏好训练，把它转向指令遵循。案例团队只有在领域及通用门槛都通过时，才采用继续预训练检查点；否则保留已发布检查点。

## 参考文献 {#refs}

- Hoffmann, J. et al. "Training compute-optimal large language models." NeurIPS, 2022. Chinchilla: the L(N, D) fit and the 20-tokens-per-parameter rule used in s1.
- Kaplan, J. et al. "Scaling laws for neural language models." arXiv, 2020. The 6N-per-token approximation and the insensitivity of loss to model shape at fixed N.
- Besiroglu, T., Erdil, E., Barnett, M., You, J. "Chinchilla scaling: A replication attempt." arXiv, 2024. Re-analysis of the Chinchilla parametric fit.
- Rae, J. W. et al. "Scaling language models: Methods, analysis and insights from training Gopher." arXiv, 2021. The Gopher quality and repetition filters.
- Raffel, C. et al. "Exploring the limits of transfer learning with a unified text-to-text transformer." JMLR, 2020. C4 and its line-level cleaning rules.
- Dodge, J. et al. "Documenting large webtext corpora: A case study on the Colossal Clean Crawled Corpus." EMNLP, 2021. What C4's blocklist removed, and from whom.
- Penedo, G. et al. "The FineWeb datasets: Decanting the web for the finest text data at scale." NeurIPS Datasets and Benchmarks Track, 2024. A documented public web pipeline and FineWeb-Edu.
- Li, J. et al. "DataComp-LM: In search of the next generation of training sets for language models." NeurIPS Datasets and Benchmarks Track, 2024. DCLM and its fastText quality classifier.
- Barbaresi, A. "Trafilatura: A web scraping library and command-line tool for text discovery and extraction." ACL System Demonstrations, 2021. Boilerplate removal.
- Joulin, A., Grave, E., Bojanowski, P., Mikolov, T. "Bag of tricks for efficient text classification." EACL, 2017. fastText, the basis of common language-identification models.
- Broder, A. Z. "On the resemblance and containment of documents." Compression and Complexity of Sequences, 1997. MinHash.
- Leskovec, J., Rajaraman, A., Ullman, J. D. Mining of Massive Datasets, Chapter 3. Cambridge University Press. Shingling, MinHash and LSH banding with the S-curve.
- Lee, K. et al. "Deduplicating training data makes language models better." ACL, 2022.
- Hernandez, D. et al. "Scaling laws and interpretability of learning from repeated data." arXiv, 2022. The cost of a small fraction of heavily repeated data.
- Brown, T. et al. "Language models are few-shot learners." NeurIPS, 2020. GPT-3; 13-gram decontamination.
- Muennighoff, N. et al. "Scaling data-constrained language models." NeurIPS, 2023. How much repeated data is worth.
- Xie, S. M. et al. "DoReMi: Optimizing data mixtures speeds up language model pretraining." NeurIPS, 2023. Learned mixture weights.
- Xue, L. et al. "mT5: A massively multilingual pre-trained text-to-text transformer." NAACL, 2021. Temperature sampling of languages.
- Ding, H. et al. "Fewer truncations improve language modeling." ICML, 2024. Best-fit packing.
- Eldan, R., Li, Y. "TinyStories: How small can language models be and still speak coherent English?" arXiv, 2023. The dataset of Labs 1, 2, 3 and 5.
- Touvron, H. et al. "Llama 2: Open foundation and fine-tuned chat models." arXiv, 2023. A published recipe: learning rates, schedule, batch, clipping.
- Grattafiori, A. et al. "The Llama 3 herd of models." arXiv, 2024. Annealing, context extension, document masking and interruption statistics at scale.
- Chowdhery, A. et al. "PaLM: Scaling language modeling with Pathways." JMLR, 2023. Rewind-and-skip for loss spikes; the MFU definition.
- Fedus, W., Zoph, B., Shazeer, N. "Switch Transformers: Scaling to trillion parameter models with simple and efficient sparsity." JMLR, 2022. Load-balancing loss and capacity factor.
- Lepikhin, D. et al. "GShard: Scaling giant models with conditional computation and automatic sharding." ICLR, 2021. Expert parallelism.
- Jiang, A. Q. et al. "Mixtral of experts." arXiv, 2024.
- Dai, D. et al. "DeepSeekMoE: Towards ultimate expert specialization in mixture-of-experts language models." ACL, 2024. Fine-grained and shared experts.
- DeepSeek-AI. "DeepSeek-V3 technical report." arXiv, 2024. Auxiliary-loss-free load balancing; FP8 training with fine-grained scaling.
- DeepSeek-AI. "DeepSeek LLM: Scaling open-source language models with longtermism." arXiv, 2024. Fitted scaling of learning rate and batch size with compute.
- Yang, G. et al. "Tensor Programs V: Tuning large neural networks via zero-shot hyperparameter transfer." NeurIPS, 2021. muP.
- Loshchilov, I., Hutter, F. "Decoupled weight decay regularization." ICLR, 2019. AdamW.
- McCandlish, S., Kaplan, J., Amodei, D. et al. "An empirical model of large-batch training." arXiv, 2018. The gradient noise scale and the critical batch size.
- Hägele, A. et al. "Scaling laws and compute-optimal training beyond fixed training durations." NeurIPS, 2024. Warmup-stable-decay against cosine.
- Hu, S. et al. "MiniCPM: Unveiling the potential of small language models with scalable training strategies." arXiv, 2024. The WSD schedule.
- Micikevicius, P. et al. "Mixed precision training." ICLR, 2018. Loss scaling and fp32 master weights.
- Micikevicius, P. et al. "FP8 formats for deep learning." arXiv, 2022. E4M3 and E5M2.
- Dehghani, M. et al. "Scaling vision transformers to 22 billion parameters." ICML, 2023. QK normalisation against attention-logit growth.
- Wortsman, M. et al. "Small-scale proxies for large-scale Transformer training instabilities." ICLR, 2024. Instabilities reproduced at small scale; QK-norm, z-loss, AdamW epsilon.
- Chen, T., Xu, B., Zhang, C., Guestrin, C. "Training deep nets with sublinear memory cost." arXiv, 2016. Activation (gradient) checkpointing.
- Korthikanti, V. et al. "Reducing activation recomputation in large transformer models." MLSys, 2023. The activation-memory count, sequence parallelism, selective recomputation.
- Dao, T. et al. "FlashAttention: Fast and memory-efficient exact attention with IO-awareness." NeurIPS, 2022.
- Rajbhandari, S., Rasley, J., Ruwase, O., He, Y. "ZeRO: Memory optimizations toward training trillion parameter models." SC, 2020.
- Zhao, Y. et al. "PyTorch FSDP: Experiences on scaling fully sharded data parallel." VLDB, 2023.
- Shoeybi, M. et al. "Megatron-LM: Training multi-billion parameter language models using model parallelism." arXiv, 2019. Tensor parallelism.
- Narayanan, D. et al. "Efficient large-scale language model training on GPU clusters using Megatron-LM." SC, 2021. Interleaved pipeline schedules and 3D parallelism.
- Huang, Y. et al. "GPipe: Efficient training of giant neural networks using pipeline parallelism." NeurIPS, 2019.
- Liu, H., Zaharia, M., Abbeel, P. "Ring attention with blockwise transformers for near-infinite context." ICLR, 2024. Context parallelism.
- Jacobs, S. A. et al. "DeepSpeed Ulysses: System optimizations for enabling training of extreme long sequence Transformer models." arXiv, 2023.
- Young, J. W. "A first order approximation to the optimum checkpoint interval." Communications of the ACM, 1974.
- Dixit, H. D. et al. "Silent data corruptions at scale." arXiv, 2021.
- Chen, S. et al. "Extending context window of large language models via positional interpolation." arXiv, 2023.
- Peng, B. et al. "YaRN: Efficient context window extension of large language models." ICLR, 2024.
- Gururangan, S. et al. "Don't stop pretraining: Adapt language models to domains and tasks." ACL, 2020. Domain- and task-adaptive continued pretraining.
- Gupta, K. et al. "Continual pre-training of large language models: How to (re)warm your model?" arXiv, 2023.
- Ibrahim, A. et al. "Simple and scalable strategies to continually pre-train large language models." TMLR, 2024. Re-warming, re-decaying and replay.
