## 自测测验 {#quiz}

先选择答案，再阅读解释。

```quiz

? 一个用 ChatML 微调的模型只在生产环境忽略系统提示词。最可能的原因是什么？
- [ ] LoRA 秩太低，无法可靠学会系统提示词
- [x] 服务端渲染的模板与训练不同，例如默认系统提示词或换行
- [ ] 服务端温度高于评估，导致模型偏离指令
- [ ] 训练轮数太少，模型未能记住系统提示词
> 训练与服务必须使用逐字节一致的模板。单侧插入默认系统提示词或空白差异会改变模型看到的 token。秩、训练轮数和采样温度的问题通常也会在离线评估中出现，而不只出现在生产环境。

? 带损失掩码的 SFT 中，哪些 token 计算损失？
- [ ] 所有 token
- [ ] 助手 token，但不含轮次结束 token
- [ ] 用户和助手 token，但不含系统提示词
- [x] 助手 token，包含轮次结束 token
> 模型的目标是生成响应，而非预测用户或系统提示词。必须训练轮次结束 token，因为预测它正是学习停止的方式。排除它会移除停止训练信号；包含用户 token 则会教模型模仿用户。

? LoRA 随机初始化 A，将 B 初始化为零。第一步时哪项正确？
- [x] 模型等于基座模型，只有 B 一般会获得非零梯度
- [ ] A 和 B 的梯度都为零，因此适配器只在后续步骤才改变
- [ ] B 训练完成前，模型相对基座有 (alpha / r) A 的偏差
- [ ] 只有 A 获得非零梯度，因为 B 乘在它前面
> B A = 0，因此模型等于基座。dL/dB = (alpha / r) g (A x)^T 一般非零；dL/dA = (alpha / r) B^T g x^T 因 B 为零而为零。若两者都为零，则在这些梯度更新下都无法改变。

? 奖励模型对提示词 x 的每个响应都增加 3 分。在 Bradley–Terry 下，什么会改变？
- [ ] x 的所有偏好概率上升
- [ ] 概率向 0.5 移动
- [x] 没有变化
- [ ] 训练损失增加
> Bradley–Terry 只依赖同一提示词下的奖励差，因此每提示词的常数偏移会抵消。奖励只能识别到这样的常数，这也是 RL 前进行归一化的原因。

? 在 KL 正则化目标 E[r] - beta KL(pi || pi_ref) 中，奖励固定而 beta 减小时，最优策略如何变化？
- [ ] 更接近参考策略，因为惩罚相对更强
- [x] 更集中于高奖励响应；KL 增大，奖励误差可能被利用
- [ ] 不变，因为 beta 只缩放整个目标
- [ ] 响应分布变为均匀，因为 KL 不再锚定策略
> pi* 正比于 pi_ref exp(r / beta)。较小的 beta 使策略集中于最高奖励响应，并增大 KL。若使用学得的奖励，这也可能放大奖励漏洞，交互组件的代理模式展示了这一点。

? 在 DPO 推导中，为什么配分函数 Z(x) 消失？
- [x] 它只依赖 x，因此在同一提示词的 r_w - r_l 中抵消
- [ ] 两个策略都归一化，因此 Z(x) 等于 1
- [ ] DPO 每步从参考策略采样以估计它
- [ ] beta 被选择为让数据中每个提示词的 Z(x) 都等于 1
> r = beta log(pi* / pi_ref) + beta log Z(x)。Bradley–Terry 使用同一提示词的 r_w - r_l，因此 beta log Z(x) 抵消。Z 通常不等于 1，DPO 也不采样或估计它。

? 在来自差异很大模型的偏好对上，DPO 达到 100% 偏好对正确率和近零损失，但任务指标下降，选中响应的概率也低于参考。发生了什么？
- [ ] 训练步数不足造成欠拟合
- [ ] KL 项对这些数据过强
- [ ] 缓存的参考对数概率存在错误
- [x] 离策略偏好对造成似然位移
> 拒绝响应若是模型几乎不会生成的字符串，偏好对可能很容易分离，但压低它们并不保证选中响应获益；概率可能流向两列之外。实验 4 中，正确率从 0.478 降至 0.229，选中响应对数比为 -0.93。欠拟合通常不会产生近零损失。

? G = 8 的 GRPO 用于策略已能以 95% 概率解决的提示词。多少比例的组具有非零任务优势？
- [ ] 约 95%
- [ ] 约 5%
- [x] 约 34%
- [ ] 100%，因为优势在组内标准化
> 只有非全对、非全错的组才有信号：1 - 0.95^8 - 0.05^8 = 0.337。标准化无法在零方差组中制造信号；代码在这些组返回零优势。

? 一个困难提示词没有任何响应通过检查器时，采样、验证、保留方法受到什么限制？
- [x] 它只从成功中学习；没有解出的提示词不提供训练目标
- [ ] 它不能使用验证器，只能在未过滤样本上训练
- [ ] 它需要学得的价值模型，因此不稳定
- [ ] 它需要昂贵的偏好对
> 该提示词没有监督目标。GRPO 可以在混合组中利用失败相对成功的信号，但全失败组的任务优势也为零。实验 5 并未展示 GRPO 的普遍优势：专家迭代在这个封闭任务上表现很好。

? 评分器对正确答案给 1 分，对错误答案和“我不知道”都给 0 分。针对它做 RL，会鼓励模型：
- [ ] 不确定时总是弃权
- [ ] 仅当正确概率大于 0.5 时回答
- [x] 只要存在正的正确概率，就选择回答
- [ ] 更频繁地拒绝
> 回答的期望奖励为 p，弃权为 0，因此任意 p > 0 时回答更优。只有给错误答案惩罚，例如 -lambda，才产生 lambda / (1 + lambda) 的阈值，参见模块 07 第 10 节。

? 在 50 个共同测试项中，A 通过而 B 失败的有 8 项，B 通过而 A 失败的有 3 项。最恰当的结论是什么？
- [ ] A 在 5% 水平显著更好，因为 72% 比 62% 高十个百分点
- [ ] B 更好，因为只有 11 项不一致
- [ ] 两者等价，因为 39 项一致
- [x] 不显著，精确 McNemar p 约为 0.23；需要更多测试项
> 只有 11 个不一致项提供差异信息。在 p = 0.5 下，8 对 3 的精确双侧 p 为 0.227，成对区间约为 [-2.7, 22.7] 个百分点。相同通过率在 500 项上会得到显著结果。

? 同一基座上为不同任务训练的两个 LoRA 适配器需等权合并。哪项正确？
- [ ] 分别平均 A 和 B 矩阵，再使用平均后的因子对
- [x] 将每个乘积 (alpha / r) B_i A_i 的一半加到 W
- [ ] 将两个更新相乘，让两个任务依次作用
- [ ] 只保留范数较大的适配器，另一个是冗余的
> 更新是乘积 B A；乘积的平均不等于平均因子的乘积。第 13 节的示例分别得到 0.5 I 和元素均为 0.25 的矩阵。合并乘积或拼接因子可以精确保留两个更新。
```

## 导读 {#reading}

阅读所引用的版本，并区分论文的实测结论与本模块采用的假设。后续修订中的节编号可能不同。

::: paper minutes=12

[Ouyang, L. et al. "Training language models to follow instructions with human feedback." NeurIPS, 2022.](https://arxiv.org/html/2203.02155v1)

**阅读理由。** 这篇论文确立了 SFT、奖励模型、PPO 流程，并展示一个经过后训练的 1.3B 模型可以比 175B 基座模型更受偏好。许多后来的训练方案都是其图 2 的变体。

**阅读范围。** 阅读摘要、主要发现、图 2、人工数据收集、模型部分（SFT、奖励建模、PPO 和 PPO-ptx），以及附录中的数据集规模表。关注标注者筛选和提示词分布。首次阅读可跳过详细基准表。

**阅读时回答以下问题。**

1. 图 2 的三个步骤分别使用什么数据，各约有多少示例？
2. 为什么作者把同一提示词下全部 K(K-1)/2 个比较作为一个批次元素训练奖励模型？
3. PPO-ptx 是什么，它解决“对齐税”中的什么问题？
4. 为什么报告的标注者一致率本身不是奖励模型正确率的硬性上限？要建立界限，还需要怎样的噪声模型或共识目标？
:::

::: paper minutes=18

[Rafailov, R. et al. "Direct preference optimization: Your language model is secretly a reward model." NeurIPS, 2023.](https://arxiv.org/html/2305.18290v2)

**阅读理由。** 用作者的符号理解本模块的核心推导，包括支持重参数化的定理，以及在奖励–KL 前沿上比较 DPO 与 PPO 的实验。

**阅读范围。** 阅读 RLHF 背景、最优策略和 DPO 推导、展示的梯度、奖励重参数化定理，以及情感任务的奖励–KL 比较。分别用 Gibbs 不等式和拉格朗日乘子重现最优解。必要时阅读附录中的最优策略证明；首次阅读可跳过其他实验。

**阅读时回答以下问题。**

1. 重新推导最优策略，即论文式 4，以及用它表达的奖励，即式 5。Z(x) 去了哪里？
2. 第 4 节的梯度对每个示例赋予什么权重？为什么这会影响已经正确排序的偏好对？
3. 情感任务的奖励–KL 比较在该实验中说明了什么？对于其他任务或有限偏好数据，还有哪些不确定性？
4. 用 beta log(pi_theta / pi_ref) 表达“你的语言模型暗中也是奖励模型”的含义。
:::

::: paper minutes=15

[DeepSeek-AI. "DeepSeek-R1: Incentivizing reasoning capability in LLMs via reinforcement learning." arXiv, January 2025.](https://arxiv.org/html/2501.12948v1)

**阅读理由。** 这份公开报告先从预训练基座进行规则奖励 RL，再引入冷启动示例、拒绝采样 SFT 和蒸馏。它帮助区分“不使用示范的 RL 阶段”与预训练已提供的能力。

**阅读范围。** 在 2025 年 1 月 arXiv 版本中，阅读第 2.2 节的 R1-Zero：GRPO 目标、规则化正确性与格式奖励、训练模板、AIME 曲线和“顿悟时刻”；第 2.3 节的冷启动、推理导向 RL、拒绝采样与 SFT、全场景 RL；第 2.4 节的蒸馏；第 4 节的蒸馏与 RL 比较，以及过程奖励模型和树搜索的不成功尝试。跳过第 3 节基准表。

**阅读时回答以下问题。**

1. R1-Zero 使用了哪些奖励？为什么作者避免使用神经奖励模型？
2. R1-Zero 输出有什么问题？冷启动 SFT 修复了什么？
3. 后续阶段如何用拒绝采样构建 SFT 数据？
4. 作者对蒸馏与直接在较小模型上进行 RL 得出什么结论，原因是什么？
:::

## 总结 {#summary}

- 将训练信号与行为对应：示范、偏好和可验证结果回答不同问题。
- 渲染部署时的对话模板，训练助手停止 token，并有意识地选择损失分母。
- LoRA 消除冻结权重的梯度和优化器成本，但冻结投影仍传递激活梯度。
- 奖励差识别偏好；任意偏移、标签噪声和分布变化需要分别诊断。
- PPO 使用采样策略梯度、价值评估和裁剪；裁剪不是严格的信赖域。
- DPO 消去配分项，却拟合的是偏好对间隔，并不无条件保证选中答案概率增加。
- 有成功示例时，采样、验证、保留可以有效；要追踪提示词覆盖率，并限制简单提示词的重复。
- GRPO 任务信号需要组内奖励变化；KL 项仍可作用于零优势组。
- 验证器教会模型它实际接受的内容，包括意料之外的捷径。
- 分别评估拒绝、无害请求服从、弃权、校准和行动诚实性。
- 候选晋升前，采用成对不确定性分析，审计检查器与评判者，并控制污染。
- 合并缩放后的适配器乘积，随后量化，再评估实际发布产物并计算哈希。

[模块 10](module_10_ZH.html) 将后训练模型带入推理与服务：解码、KV 缓存、量化、批处理及工作负载成本。

## 参考文献 {#refs}



- Ouyang, L. et al. "Training language models to follow instructions with human feedback." NeurIPS, 2022. InstructGPT: SFT, reward model, PPO.
- Christiano, P. et al. "Deep reinforcement learning from human preferences." NeurIPS, 2017. Learning a reward from comparisons.
- Stiennon, N. et al. "Learning to summarize from human feedback." NeurIPS, 2020. RLHF on summarisation; best-of-n and its KL.
- Schulman, J. et al. "Proximal policy optimization algorithms." 2017. PPO.
- Rafailov, R. et al. "Direct preference optimization: Your language model is secretly a reward model." NeurIPS, 2023. DPO.
- Azar, M. G. et al. "A general theoretical paradigm to understand learning from human preferences." 2023. IPO and the deterministic-preference argument.
- Ethayarajh, K. et al. "KTO: Model alignment as prospect theoretic optimization." 2024.
- Hong, J., Lee, N., Thorne, J. "ORPO: Monolithic preference optimization without reference model." 2024.
- Meng, Y., Xia, M., Chen, D. "SimPO: Simple preference optimization with a reference-free reward." 2024.
- Shao, Z. et al. "DeepSeekMath: Pushing the limits of mathematical reasoning in open language models." 2024. GRPO.
- DeepSeek-AI. "DeepSeek-R1: Incentivizing reasoning capability in LLMs via reinforcement learning." 2025. R1-Zero, the R1 pipeline, distillation.
- Hu, E. J. et al. "LoRA: Low-rank adaptation of large language models." ICLR, 2022.
- Dettmers, T. et al. "QLoRA: Efficient finetuning of quantized LLMs." NeurIPS, 2023. NF4, double quantisation, paged optimisers.
- Zhou, C. et al. "LIMA: Less is more for alignment." NeurIPS, 2023. 1,000 curated examples.
- Bai, Y. et al. "Training a helpful and harmless assistant with reinforcement learning from human feedback." 2022. The helpful-harmless tension.
- Bai, Y. et al. "Constitutional AI: Harmlessness from AI feedback." 2022.
- Zheng, L. et al. "Judging LLM-as-a-judge with MT-Bench and Chatbot Arena." NeurIPS Datasets and Benchmarks, 2023. Judge agreement and biases.
- Zhou, J. et al. "Instruction-following evaluation for large language models." 2023. IFEval.
- Dong, H. et al. "RAFT: Reward ranked finetuning for generative foundation model alignment." 2023.
- Gulcehre, C. et al. "Reinforced self-training (ReST) for language modeling." 2023.
- Wortsman, M. et al. "Model soups: averaging weights of multiple fine-tuned models improves accuracy without increasing inference time." ICML, 2022.
- Gekhman, Z. et al. "Does fine-tuning LLMs on new knowledge encourage hallucinations?" 2024.
- Touvron, H. et al. "Llama 2: Open foundation and fine-tuned chat models." arXiv, 2023. Iterated rejection sampling and PPO.
- Lambert, N. et al. "Tulu 3: Pushing frontiers in open language model post-training." 2024. SFT, DPO, RLVR; an open recipe.
- Gao, L., Schulman, J., Hilton, J. "Scaling laws for reward model overoptimization." ICML, 2023.
- Lightman, H. et al. "Let's verify step by step." 2023. Process reward models.
- Aghajanyan, A., Zettlemoyer, L., Gupta, S. "Intrinsic dimensionality explains the effectiveness of language model fine-tuning." ACL, 2021.
- Kalajdzievski, D. "A rank stabilization scaling factor for fine-tuning with LoRA." 2023.
- Biderman, D. et al. "LoRA learns less and forgets less." TMLR, 2024.
- Razin, N. et al. "Unintentional unalignment: Likelihood displacement in direct preference optimization." 2024.
- Park, R. et al. "Disentangling length from quality in direct preference optimization." 2024.
- Xu, S. et al. "Is DPO superior to PPO for LLM alignment? A comprehensive study." ICML, 2024.
- Ahmadian, A. et al. "Back to basics: Revisiting REINFORCE style optimization for learning from human feedback in LLMs." ACL, 2024. RLOO.
- Liu, Z. et al. "Understanding R1-Zero-like training: A critical perspective." 2025. Dr. GRPO: length and difficulty biases.
- Yu, Q. et al. "DAPO: An open-source LLM reinforcement learning system at scale." 2025. Clip-higher, dynamic sampling, token-level loss.
- Beirami, A. et al. "Theoretical guarantees on the best-of-n alignment policy." 2024. The KL formula as an upper bound.
- Anthony, T., Tian, Z., Barber, D. "Thinking fast and slow with deep learning and tree search." NeurIPS, 2017. Expert iteration.
- Zelikman, E. et al. "STaR: Bootstrapping reasoning with reasoning." NeurIPS, 2022.
- Schick, T. et al. "Toolformer: Language models can teach themselves to use tools." NeurIPS, 2023.
- Rottger, P. et al. "XSTest: A test suite for identifying exaggerated safety behaviours in large language models." NAACL, 2024.
- Perez, E. et al. "Red teaming language models with language models." EMNLP, 2022.
- Kadavath, S. et al. "Language models (mostly) know what they know." 2022.
- OpenAI. "GPT-4 technical report." 2023. Calibration before and after post-training.
- Sharma, M. et al. "Towards understanding sycophancy in language models." ICLR, 2024.
- Kalai, A. T. et al. "Why language models hallucinate." 2025. Binary grading rewards guessing.
- Brown, T. et al. "Language models are few-shot learners." NeurIPS, 2020. 13-gram contamination analysis.
- Dubois, Y. et al. "Length-controlled AlpacaEval: A simple way to debias automatic evaluators." 2024.
- Miller, E. "Adding error bars to evals: A statistical approach to language model evaluations." 2024.
- Frankle, J. et al. "Linear mode connectivity and the lottery ticket hypothesis." ICML, 2020.
- Ilharco, G. et al. "Editing models with task arithmetic." ICLR, 2023.
- Yadav, P. et al. "TIES-Merging: Resolving interference when merging models." NeurIPS, 2023.
- Yu, L. et al. "Language models are Super Mario: Absorbing abilities from homologous models as a free lunch." ICML, 2024. DARE.
- Hewitt, J. "Initializing new word embeddings for pretrained language models." 2021. Technical note; the mean-and-covariance initialisation used for the template rows in Labs 1-2.
