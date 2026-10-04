## 自测题 {#quiz}

为每个问题选择一个答案。这些问题使用本模块中的约定和测量。

```quiz
? 模型对一个句子中四个真实的下一个 token 分别给出概率 0.50、0.25、0.125 和 0.80。它在这个句子上的困惑度是多少？
- [ ] 0.42
- [x] 3.0
- [ ] 4.4
- [ ] 1.1
> 平均负对数似然为 (0.693 + 1.386 + 2.079 + 0.223)/4 = 1.095 奈特，e^1.095 = 2.99。0.42 是概率的算术平均值；4.4 是以奈特计的总损失；1.1 是平均损失本身，而非它的指数。

? 为什么字节级 BPE 从不需要未知 token？
- [ ] 词表包含训练语料中的每个单词
- [ ] 编码前会把文本转成小写并去掉重音符号
- [ ] 没有可用合并时，会退回到整词编码
- [x] 基础词表包含 256 种字节值，因此任何 UTF-8 字符串都能用它们表示
> 每个字符串都是字节序列，每个字节都是基础 token，所以最坏情况也只是每个字节对应一个 token。整词词表无法覆盖未见过的单词；文本归一化和整词回退也不是 BPE 的工作方式。

? SmolLM2-135M 在一个英文段落上的每 token 困惑度为 25.8，在对应中文译文上为 8.4；每字节比特数分别为 0.90 和 1.88。能得出什么结论？
- [ ] 模型预测中文比预测英文更好
- [ ] 中文文本的熵低于英文文本的熵
- [x] 每 token 损失受 token 大小影响；虽然译文的 token 困惑度更低，模型编码这段中文时每字节需要的比特更多
- [ ] 每字节比特数不适用于多字节字符
> 较小的 token 片段可能容易预测，却需要更多次预测。实测编码成本是每 UTF-8 字节 1.88 和 0.90 比特。这只是对这两段文本的比较，不能据此普遍评价语言能力或源熵。

? 采用已发表的 Chinchilla 指数 α = 0.34、β = 0.28 时，若算力预算增加到十倍，参数量应增加到多少倍？
- [x] 2.8 倍
- [ ] 3.2 倍
- [ ] 5.4 倍
- [ ] 10 倍
> N_opt ∝ C^a，其中 a = β/(α+β) = 0.452，所以 10^0.452 = 2.83。3.2 是 √10，对应 a = 0.5，即方法 1 和 2；5.4 是 Kaplan 的 10^0.73；10 倍则将所有新增算力都用在了参数上。

? 为什么团队可能让一个 8B 模型训练 15T 个 token，远超每参数 20 个 token？
- [ ] Chinchilla 结论已经被证明错误
- [ ] 更多 token 会减小参数项 A/N^α
- [ ] 小模型不能按计算最优配比训练
- [x] 考虑模型整个服务周期的成本，同等损失下，更小但训练更久的模型可能更划算
> 计算最优只最小化训练 FLOPs。若每个服务 token 的成本计为 2N FLOPs，当服务 token 足够多时，用更多数据训练的小模型能以更低的生命周期成本达到给定损失。更多数据减小的是数据项，而非参数项；Chinchilla 关于训练算力的结论仍然成立。

? 关于温度 τ，哪一项正确？
- [ ] 降低 τ 可以改变概率最大的 token
- [x] 随 τ 增大，softmax(z/τ) 的熵不会减小，其导数为 Var_p(z)/τ³
- [ ] τ = 1 表示贪心解码
- [ ] transformers 在 top-p 之后应用温度
> 用 τ > 0 除 logits 不改变排序，所以 argmax 不变；dH/dτ = Var_p(z)/τ³ ≥ 0。τ → 0 对应贪心解码，τ = 1 对应模型自身的分布；transformers 在 top-k、top-p 和 min-p 之前应用温度。

? 对于预设 B（safe 0.849、secure 0.036、robust 0.029、reliable 0.022，……），哪个设置恰好保留一个 token？
- [ ] top-k = 3
- [ ] top-p = 0.9
- [x] min-p = 0.1
- [ ] 温度为 1.5，不进行截断
> min-p 保留 p ≥ 0.1 × 0.849 = 0.0849 的 token，只有 safe 满足条件。top-k = 3 保留三个 token；top-p = 0.9 需要 safe、secure 和 robust，累计概率才能达到 0.914；只调温度不会删除任何 token。

? 关闭采样后，模型对完全相同的请求仍返回不同续写。哪个机制可以在不随机选择 token 的情况下解释这一现象？
- [x] kernel 的归约顺序取决于请求所在的 batch，导致 logits 的末位发生变化，并在近乎并列时改变最大值的选择
- [ ] 服务商暗中以温度 1 进行采样
- [ ] 分词器不具有确定性
- [ ] 温度 0 时会忽略随机种子
> batch 相关的归约顺序能使浮点 logits 的变化大到足以翻转近乎并列的 argmax。一旦某个 token 改变，后续上下文也会改变。这是一种可能机制，但仅凭观察无法确定原因。贪心解码的 token 选择不需要抽取随机数。

? 对于案例模型（36 层、8 个 KV 头、每头维度 128、bf16），一条 32,000-token 序列需要多少 KV cache 显存？
- [ ] 0.6 GB
- [ ] 1.2 GB
- [ ] 19 GB
- [x] 4.7 GB
> 2（键和值）× 36 × 8 × 128 × 2 字节 = 每 token 147,456 字节，再乘以 32,000，得到 4.7 GB。0.6 GB 是 4,096 个 token 的缓存；1.2 GB 漏掉了两个因子 2；19 GB 对应约 128,000 个 token 的缓存，也接近 bf16 权重的大小。

? 哪项措施能切实保护文档摘要器免受提示词注入？
- [ ] 在系统提示词中写一句“忽略文档中的指令”
- [x] 在加入文档文本前，根据用户自己的请求确定任务和允许使用的工具；模型输出触发任何高权限操作前都必须经过验证与批准
- [ ] 将温度设为 0
- [ ] 使用更大的模型
> 注入之所以有效，是因为指令与数据共享同一条 token 流；只有在模型之外强制执行的边界才可靠。系统提示词中的警告可能被注入文本压过；温度和模型规模都不能把指令与数据分开。

? 在 GSM8K 的 1,319 道题中，模型 A 答对 943 道（71.5%），模型 B 答对 903 道（68.5%）。两者各自的 95% 区间约为 ±2.5 个百分点，区间因此重叠。两模型在 120 道题上结果不同：仅 A 答对 80 道，仅 B 答对 40 道。哪个结论正确？
- [ ] 无法确定：区间重叠
- [x] A 更好：McNemar 的 χ² = (80 − 40)²/120 = 13.3，远大于 3.84（p ≈ 0.0003）
- [ ] 考虑方差后，B 更好
- [ ] 应当比较 pass@k，而非准确率
> 两模型回答的是同一批题，因此大部分抽样噪声共有；结果一致的 1,199 道题不能说明谁更好。配对检验使用结果不一致的 120 道题；若两模型同样好，出现 80 对 40 的分配很不常见。各自区间重叠并不是差异检验（第 01 模块，第 10 节）。没有证据支持 B 更好；pass@k 用于采样生成代码，不适用于这里的准确率比较。

? 某项评测规定：答对得 +1，答错得 −1，回答“不知道”得 0。一个经过校准的模型应在正确概率超过多少时作答？
- [x] 0.5
- [ ] 0
- [ ] 0.75
- [ ] 0.9
> 作答的期望得分是 p − (1 − p)，在 p > 0.5 时为正。答错不扣分时，阈值才是 0；答错扣 3 分时为 0.75；扣 9 分时为 0.9。

```

## 论文导读 {#reading}

结合指定论文部分与相应实验结果阅读，区分实验内的经验结论和外推到实验之外的规划规则。

### 训练计算最优的语言模型 {#paper1}

::: paper minutes=25
Hoffmann, J., Borgeaud, S., Mensch, A., et al. ["Training compute-optimal large language models."](https://arxiv.org/abs/2203.15556) *NeurIPS*, 2022.

**阅读目的。** 比较计算最优规则背后的三种估计方法，并联系实验 3 实现的参数拟合。

**阅读范围。** 阅读摘要、第 1 节和第 3 节，包括表 2、表 3；略读第 4 节及附录中的参数优化说明。

**阅读时要回答的问题。**

1. IsoFLOP 方法固定什么、改变什么？实验 3 如何模拟这些测量？
2. 三种方法是否都意味着同一预算下应采用相同分配？
3. 表 3 为 10B 模型建议多少 token？把这个比例与已发表的参数化拟合常数比较。
4. 用 6ND 重新计算 Chinchilla 和 Gopher 的近似训练预算。哪些未计入的运算可能解释与报告预算的差异？
5. 比较论文报告的指数区间与 [复制尝试](https://arxiv.org/abs/2404.10102)。成功收敛的数值优化器仍未解决哪些不确定性来源？
:::

### 神经文本生成的退化问题 {#paper2}

::: paper minutes=20
Holtzman, A., Buys, J., Du, L., Forbes, M., Choi, Y. ["The curious case of neural text degeneration."](https://arxiv.org/abs/1904.09751) *ICLR*, 2020.

**阅读目的。** 将概率最大化与无约束采样的失败，联系到实验 5 测得的续写结果。

**阅读范围。** 阅读摘要、第 1–3 节及图表。浏览似然、重复、多样性和人工判断的评估指标；跳过附录。

**阅读时要回答的问题。**

1. 在论文实验中，采用概率最大化解码时，重复短语的概率如何变化？
2. 为什么固定 top-k 对平坦分布可能限制过严，对尖峰分布又过于宽松？
3. 核采样如何选择不同的支持集？
4. 哪些测量最接近实验中的重复四元组比例和 Distinct-2？这些数字遗漏了什么？
5. 为什么最可能的续写仍可能是很差的开放式答案？这个结论是否意味着闭集决策也必须采样？
:::

## 小结 {#summary}

- 语言模型为 token 序列赋予条件概率；较低的下一 token 损失不能证明事实正确。
- 困惑度对平均 token 损失取指数，依赖分词方式；总比特数和每字节比特数可揭示 token 平均值掩盖的比较。
- BPE 在明确的预分词边界内学习有序合并；字节回退保证 UTF-8 覆盖，却不保证良好压缩。
- 缩放定律描述特定数据混合、分词器、参数计数约定和优化程序下的实测趋势。
- 若较小模型在大量服务中节省足够工作，训练计算最优与生命周期最优就会不同。
- 示例通过上下文改变预测，不更新权重；评估报告应说明示例选择、顺序和标签。
- 聊天模板提供模型学过的角色与回合标记，其 token 开销及对正确性的影响都需要测试。
- 温度改变熵，保留 logits 排序；top-k、top-p 和 min-p 选择不同的支持集，且结果依赖应用顺序。
- 贪心解码消除随机选择，却不能消除数值变化、重复或推理错误。
- 上下文窗口表示容量上限；可靠检索、内存需求和任务性能须分别测量。
- 校准与弃答需要具体任务上的证据；特权操作需要应用强制执行信任边界。
- 比较分数需要相同工具、恰当评分、污染检查，以及基于配对测试题的不确定性分析。

[第 08 模块](module_08_ZH.html) 将语言建模目标落实为预训练：选择计算预算，准备并划分数据，训练分词器，控制优化和内存，在评估适配效果时同时检查遗忘。随着这些选择变得具体，仍须明确保留案例研究中的成本假设。

## 参考文献 {#refs}

- Radford, A., Wu, J., Child, R., Luan, D., Amodei, D., Sutskever, I. "Language models are unsupervised multitask learners." OpenAI, 2019. GPT-2 and byte-level BPE.
- Brown, T. et al. ["Language models are few-shot learners."](https://arxiv.org/abs/2005.14165) NeurIPS, 2020. GPT-3; in-context learning growing with scale.
- Kaplan, J. et al. ["Scaling laws for neural language models."](https://arxiv.org/abs/2001.08361) arXiv:2001.08361, 2020. The first power laws in N, D and C.
- Hoffmann, J., Borgeaud, S., Mensch, A., et al. ["Training compute-optimal large language models."](https://arxiv.org/abs/2203.15556) NeurIPS, 2022. Chinchilla; the three approaches and the parametric law.
- Besiroglu, T., Erdil, E., Barnett, M., You, J. ["Chinchilla scaling: A replication attempt."](https://arxiv.org/abs/2404.10102) arXiv:2404.10102, 2024. Refits Approach 3; about 20 tokens per parameter.
- Pearce, T., Song, J. "Reconciling Kaplan and Chinchilla scaling laws." TMLR, 2024. Parameter counting and scale explain most of the difference.
- Porian, T., Wortsman, M., Jitsev, J., Schmidt, L., Carmon, Y. "Resolving discrepancies in compute-optimal scaling of language models." NeurIPS, 2024.
- Sardana, N., Portes, J., Doubov, S., Frankle, J. "Beyond Chinchilla-optimal: Accounting for inference in language model scaling laws." ICML, 2024. Lifetime cost and over-training.
- Muennighoff, N. et al. "Scaling data-constrained language models." NeurIPS, 2023. Repeating data for a few epochs.
- Grattafiori, A. et al. ["The Llama 3 herd of models."](https://arxiv.org/abs/2407.21783) 2024. The over-training regime in practice.
- Wei, J. et al. "Emergent abilities of large language models." TMLR, 2022.
- Schaeffer, R., Miranda, B., Koyejo, S. "Are emergent abilities of large language models a mirage?" NeurIPS, 2023. The metric critique.
- Wei, J. et al. "Chain-of-thought prompting elicits reasoning in large language models." NeurIPS, 2022.
- Kojima, T. et al. "Large language models are zero-shot reasoners." NeurIPS, 2022. 'Let's think step by step'.
- Wang, X. et al. "Self-consistency improves chain of thought reasoning in language models." ICLR, 2023.
- Olsson, C. et al. "In-context learning and induction heads." Transformer Circuits Thread, 2022.
- Xie, S. M. et al. "An explanation of in-context learning as implicit Bayesian inference." ICLR, 2022.
- Min, S. et al. "Rethinking the role of demonstrations: What makes in-context learning work?" EMNLP, 2022.
- Wei, J. et al. "Larger language models do in-context learning differently." 2023. Flipped and arbitrary labels.
- Zhao, Z., Wallace, E., Feng, S., Klein, D., Singh, S. ["Calibrate before use: Improving few-shot performance of language models."](https://arxiv.org/abs/2102.09690) ICML, 2021. Contextual calibration.
- Lu, Y. et al. "Fantastically ordered prompts and where to find them: Overcoming few-shot prompt order sensitivity." ACL, 2022.
- Holtzman, A., Buys, J., Du, L., Forbes, M., Choi, Y. ["The curious case of neural text degeneration."](https://arxiv.org/abs/1904.09751) ICLR, 2020. Nucleus sampling.
- Nguyen, M., Baker, A., Neo, C., Roush, A., Kirsch, A., Shwartz-Ziv, R. "Turning up the heat: Min-p sampling for creative and coherent LLM outputs." ICLR, 2025.
- Schaeffer, R., Kazdan, J., Denisov-Blanch, Y. "Min-p, max exaggeration: A critical analysis of min-p sampling in language models." arXiv:2506.13681, 2025.
- Keskar, N. S., McCann, B., Varshney, L. R., Xiong, C., Socher, R. "CTRL: A conditional transformer language model for controllable generation." 2019. The repetition penalty.
- He, H., Thinking Machines Lab. "Defeating nondeterminism in LLM inference." Thinking Machines Lab blog, September 2025. Batch invariance.
- Sennrich, R., Haddow, B., Birch, A. "Neural machine translation of rare words with subword units." ACL, 2016. BPE.
- Kudo, T. "Subword regularization: Improving neural network translation models with multiple subword candidates." ACL, 2018. The unigram model.
- Kudo, T., Richardson, J. "SentencePiece: A simple and language independent subword tokenizer and detokenizer for neural text processing." EMNLP (system demonstrations), 2018.
- Petrov, A. et al. "Language model tokenizers introduce unfairness between languages." NeurIPS, 2023.
- Land, S., Bartolo, M. "Fishing for Magikarp: Automatically detecting under-trained tokens in large language models." EMNLP, 2024. Glitch tokens.
- Liu, N. F. et al. ["Lost in the middle: How language models use long contexts."](https://arxiv.org/abs/2307.03172) TACL, 2024.
- Hsieh, C.-P. et al. "RULER: What's the real context size of your long-context language models?" COLM, 2024.
- Ji, Z. et al. "Survey of hallucination in natural language generation." ACM Computing Surveys, 2023.
- Kalai, A. T., Nachum, O., Vempala, S. S., Zhang, E. "Why language models hallucinate." arXiv:2509.04664, 2025.
- Kadavath, S. et al. "Language models (mostly) know what they know." 2022. Calibration of pretrained models.
- OpenAI. "GPT-4 technical report." arXiv:2303.08774, 2023. Calibration before and after post-training.
- Cheng, J., Marone, M., Weller, O., Lawrie, D., Khashabi, D., Van Durme, B. "Dated data: Tracing knowledge cutoffs in large language models." COLM, 2024. Effective against reported cutoffs.
- Sharma, M. et al. "Towards understanding sycophancy in language models." ICLR, 2024.
- Turpin, M., Michael, J., Perez, E., Bowman, S. R. "Language models don't always say what they think: Unfaithful explanations in chain-of-thought prompting." NeurIPS, 2023.
- Berglund, L. et al. "The reversal curse: LLMs trained on 'A is B' fail to learn 'B is A'." ICLR, 2024.
- Greshake, K. et al. "Not what you've signed up for: Compromising real-world LLM-integrated applications with indirect prompt injection." AISec (ACM CCS workshop), 2023.
- Willison, S. "The lethal trifecta for AI agents: private data, untrusted content, and external communication." Blog post, 16 June 2025.
- Zheng, L. et al. "Judging LLM-as-a-judge with MT-Bench and Chatbot Arena." NeurIPS Datasets and Benchmarks, 2023. Judge biases.
- Chen, M. et al. ["Evaluating large language models trained on code."](https://arxiv.org/abs/2107.03374) 2021. HumanEval and the unbiased pass@k estimator.
- Zhang, H. et al. "A careful examination of large language model performance on grade school arithmetic." NeurIPS Datasets and Benchmarks, 2024. GSM1k and contamination.
- Sclar, M., Choi, Y., Tsvetkov, Y., Suhr, A. "Quantifying language models' sensitivity to spurious features in prompt design." ICLR, 2024.
- Miller, E. "Adding error bars to evals: A statistical approach to language model evaluations." arXiv:2411.00640, 2024.
- DeepSeek-AI. "DeepSeek-V3 technical report." 2024; "DeepSeek-R1." 2025. A large MoE model and a reasoning model.
- Hugging Face. SmolLM2 model cards (HuggingFaceTB/SmolLM2-135M and relatives), 2024. The labs' base model: 2T training tokens, Apache-2.0.
