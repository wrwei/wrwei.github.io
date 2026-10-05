## 自测测验 {#quiz}

先回答，再显示解释。问题区分边界估算、测量和服务级结论。预留约 15 分钟。

```quiz
? 忽略缓存读取，5.5 GB 文件在 1.0 TB/s 下，仅权重的单序列解码上界是多少？
- [ ] 约 18 token/s
- [x] 约 180 token/s
- [ ] 约 1,800 token/s
- [ ] 约 9,000 token/s
> 流量时间下界为 5.5 ms，即约 182 token/s。加入案例在 5,000-token 上下文的缓存后，约为 160。两者都不是实测服务性能。

? 模型有 L = 32 层、八个 KV 头，头维度为 128。bf16 每 token KV cache 为：
- [ ] 32,768 字节
- [ ] 65,536 字节
- [x] 131,072 字节
- [ ] 524,288 字节
> 2（K 和 V）× 32 × 8 × 128 × 2 字节 = 131,072 字节。65,536 漏掉 K、V 的二或每值两字节；524,288 是 32 个 KV 头的多头值；32,768 同时漏掉两个二。

? 关于解码批处理，哪个陈述正确？
- [ ] 批处理缩短每个序列的每步时间。
- [ ] 批处理在序列间摊薄权重与 KV cache 读取。
- [ ] 批处理只帮助预填充。
- [x] 批处理摊薄权重读取，却不摊薄每序列 KV cache 读取，因此长上下文下收益趋平。
> 批处理复用投影权重，但无关序列仍提供自身缓存状态。长上下文下，理想总吞吐曲线趋平；单个步长可能上升。

? 连续批处理相对静态批处理的主要优势是：
- [x] 每步让完成序列离开、等待序列加入，槽位不必闲置到最长序列结束
- [ ] 消除 KV cache 需求
- [ ] 使预填充计算受限
- [ ] 保证任何负载下 TTFT 更低
> 迭代级调度让完成请求离开，等待工作加入。它仍需要缓存存储，也无法在超过可持续负载后保证低 TTFT。

? 服务的前缀缓存从不命中，最可能的原因是：
- [ ] GPU 带宽太低
- [ ] 模型使用分组查询注意力
- [ ] 缓存以八位存储
- [x] 系统提示以每请求时间戳开头
> 命中需要相同 token 前缀。提示开头变化，使第一块不同，后续也无法匹配。带宽、GQA 和缓存精度不影响匹配。

? 用每张量一个绝对最大值缩放因子，将 SmolLM2-135M 线性权重量化为 int4，困惑度达到数百万；分组 64 却约为 29。为什么？
- [x] 少量大权重决定缩放，使大多数权重舍入为零；分组限制各离群值的影响
- [ ] int4 不能表示负数
- [ ] 逐张量缩放因子使用更多位
- [ ] 模型未校准
> 每张量一个缩放因子时，最大幅值决定步长，大量小权重落入零区间。对称 int4 能表示负数；逐张量缩放因子使用更少位；最近舍入不需要校准。

? 仅权重 int4 量化主要加速：
- [ ] 长提示预填充，因为减少 FLOPs
- [ ] 预填充与解码，收益相同
- [x] 小 batch 解码，因为减少每步读取字节
- [ ] 都不加速，只节省内存
> 受支持的仅权重量化内核减少权重存储流量，通常在浮点乘法前反量化。它本身不减少运算量，也不保证计算受限预填充收益。元数据和混合格式，使标称四倍字节节省需要限定。

? 投机采样的草稿很差，接受率为 0.3。输出分布是：
- [ ] 按接受率加权的目标与草稿混合
- [ ] 草稿分布
- [ ] 仅贪心解码时才是目标分布
- [x] 接受与残差算法下仍是目标分布；加速可能很小或为负
> 接受重叠加残差质量，在每个条件位置恢复 p。必须采用正确采样分布和缓存回滚；差草稿可能让正确算法更慢。

? 独立接受概率为 0.8，草稿长度为四。未截断时，每次投机迭代期望输出是多少？
- [ ] 3.2
- [x] 3.36
- [ ] 4.0
- [ ] 5.0
> (1 − 0.8⁵)/(1 − 0.8) = 3.36。3.2 = γα 忽略首次拒绝截断，以及每迭代都有的额外 token；4 假设全部草稿接受且无额外 token；5 假设每次全部接受并有奖励 token。

? SmoothQuant 通过什么机制改善 int8 激活量化？
- [x] 每激活通道除以 s_j，对应权重行乘以 s_j，保持 XW 不变，将范围从激活移到权重
- [ ] 将激活离群值裁剪到某百分位
- [ ] 将离群通道保持为 fp16
- [ ] 将量化放入训练循环，重新训练模型
> 补偿缩放保留未舍入乘积。舍入仍引入误差；折叠到前置运算时必须保留所有使用者。混合离群值分解与裁剪是不同机制。

? 中等负载下，p50 TTFT 为 0.4 s、p99 为 9 s，TPOT 正常。最合理的原因与措施是：
- [ ] 带宽太低，购买更快 GPU
- [ ] 八位 KV cache
- [x] 接近拐点时，请求排在长预填充之后；采用分块预填充、接纳控制或更多容量
- [ ] 温度太高
> 排队与长预填充是 TTFT 尾部的合理原因。选择措施前，应检查到达、队列深度和 ITL；平均 TPOT 正常不绝对排除其他资源问题。

? 服务器每秒完成 0.33 个请求，每请求在系统内平均停留 55 s。按 Little 定律，系统内平均请求数是：
- [ ] 约 0.006
- [x] 约十八个
- [ ] 约五十五个
- [ ] 约一百六十七个
> L = λW = 0.33 × 55 ≈ 18，是案例在 24 GB 显卡上的缓存限制。167 = W/λ 和 0.006 = λ/W 错用除法；55 忽略到达率。

```

## 论文导读 {#reading}

三篇各十五分钟的阅读，将本模块计算与原始方法连接。主动阅读：画出分配或概率机制，说明自己的部署中需要满足哪些实验假设。

::: paper minutes=15

Kwon, W. et al. [“Efficient memory management for large language model serving with PagedAttention.”](https://arxiv.org/abs/2309.06180) *SOSP*, 2023.

**为什么读。**它将不可预测的序列长度与分配器浪费连接，展示注意力内核和缓存管理器如何合作。区分论文测得的吞吐收益，与理论上内存能装下多少上下文的计数。

**读什么。**阅读引言、内存挑战、块表方法、共享与写时复制，以及调度和抢占。略读最初的评估比较。分布式执行和详细消融留待之后。

**阅读时回答。**

1. 实测内存中，哪些真正存放 token 状态？哪些预留、尾部和外部碎片浪费占其余部分？
2. 画出采用 16-token 块的 70-token 请求。解释五个块与十个空尾部槽位，避免混淆物理块和逻辑位置。
3. 四个续写共享 1,000-token 提示。统计完整共享块和最终部分块的私有副本：为什么包含提示的 66 个块已足够，而不是分别存储的 252 个块？
4. 一个续写向共享块写入时，必须做什么？有哪些抢占替代方案？如何由传输与计算成本选择？

:::

::: paper minutes=15

Lin, J. et al. [“AWQ: Activation-aware weight quantization for LLM compression and acceleration.”](https://arxiv.org/abs/2306.00978) *MLSys*, 2024.

**为什么读。**缩放论证具体展示权重幅值与激活重要性的区别，使我们能够在增加位数或缩小组之外，推理校准方法。

**读什么。**阅读引言、重要通道比较，以及方法的缩放与误差论证。结合模型大小和分组配置，略读困惑度结果。本次跳过部署系统优化。

**阅读时回答。**

1. 为什么激活幅值与权重幅值识别的重要通道不同？论文哪个比较检验了该选择？
2. 假设组量化步长固定，推导权重通道乘大于一的因子后，有效舍入误差的减少。为什么继续增大因子可能使假设失效？
3. 搜索哪一类缩放因子？用什么校准目标选择？哪些模型训练操作不需要？
4. AWQ 的仅权重缩放目标，与 SmoothQuant 的激活范围迁移有什么不同？解释为什么良好困惑度表，仍不能取代领域特定验收测试。

:::

::: paper minutes=15

Leviathan, Y., Kalman, M., Matias, Y. [“Fast inference from transformers via speculative decoding.”](https://arxiv.org/abs/2211.17192) *ICML*, 2023.

**为什么读。**概率证明区分保留目标分布与获得加速。应像阅读接受算法一样，仔细阅读实际时间假设，再与实验 5 实测 CPU 成本比较。

**读什么。**阅读投机采样方法、期望 token 数与实际时间分析、附录正确性证明，以及第 4.2 节草稿接受比较。略读表 2。算术工作核算留待之后。

**阅读时回答。**

1. 将论文的分布差异表示为总变差。不使用“验证修复错误”这类口号，重建接受重叠与拒绝贡献。
2. 哪个假设产生几何期望 token 求和？实验 5 的哪些有限长度和条件接受效应，会改变测量？
3. 什么时候为多个目标位置打分，成本高于一个目标步？将实验 5 实测验证比放入公式分母。
4. 第 4.2 节成本可忽略的双词草稿，接受率接近 0.2。解释为何即使提议很长，其极限收益也约为 1.25；再解释表 2 小 Transformer 为何能在运行成本更高时获得更好收益。

:::

## 总结 {#summary}

- 预填充一起处理提示位置；解码遵循 token 依赖，通常反复支付权重流量。
- 算术强度和兼容的稠密脊点，识别潜在计算或带宽限制；屋顶线仍是流量假设下的上限。
- 完整上下文 KV 存储为二乘层数、KV 头数、头维度、每值字节、token 位置数和序列数。
- 批处理共享权重读取；无关缓存仍分别增长与读取，因此总收益趋平，单个流可能变慢。
- 连续调度补充已完成槽位；分块预填充限制新提示干扰，接纳规则决定增长压力。
- 分页减少预留与碎片浪费；稳定前缀复用避免旧计算，却不将前缀从注意力中删除。
- 量化存储包含缩放因子、零点与混合精度张量；伪量化测量误差，不展示低位性能。
- 校准量化重新分配或补偿误差；确切转换产物提升部署前，需要留出任务评估。
- 投机接受与残差采样保留目标分布；加速取决于接受率、草稿成本、验证和负载。
- 语法掩码约束受支持的语法前缀；最终完整性与事实或领域有效性，仍需独立检查。
- 服务等级目标下的容量、客户端可见时延、实际到达与付费利用率，决定有用吞吐量与成本。
- 完整产物来源、演练恢复路径、计量与复现测试，使部署变化可审查、可撤销。

至此，十模块 AI 系列全部完成。返回[中文目录](index_ZH.html)重温依赖，或继续学习 [AI 智能体系列](../agent/index.html)中的客户端、工具和应用评估。一个有用的最终项目，是将同一个留出任务贯穿模型选择、适配、量化产物评估，以及明确测量的部署目标。

## 参考资料 {#refs}


- Pope, R. et al. [“Efficiently scaling transformer inference.”](https://arxiv.org/abs/2211.05102) *MLSys*, 2023.
- Williams, S., Waterman, A., Patterson, D. [“Roofline: an insightful visual performance model for multicore architectures.”](https://doi.org/10.1145/1498765.1498785) *Communications of the ACM*, 2009.
- Kaplan, J. et al. [“Scaling laws for neural language models.”](https://arxiv.org/abs/2001.08361) 2020. 前向运算约定。
- Kwon, W. et al. [“Efficient memory management for large language model serving with PagedAttention.”](https://arxiv.org/abs/2309.06180) *SOSP*, 2023.
- Yu, G.-I. et al. [“Orca: A distributed serving system for transformer-based generative models.”](https://www.usenix.org/conference/osdi22/presentation/yu) *OSDI*, 2022.
- Agrawal, A. et al. [“Taming throughput-latency tradeoff in LLM inference with Sarathi-Serve.”](https://www.usenix.org/conference/osdi24/presentation/agrawal) *OSDI*, 2024.
- Zhong, Y. et al. [“DistServe: Disaggregating prefill and decoding for goodput-optimized large language model serving.”](https://arxiv.org/abs/2401.09670) *OSDI*, 2024.
- Patel, P. et al. [“Splitwise: Efficient generative LLM inference using phase splitting.”](https://arxiv.org/abs/2311.18677) *ISCA*, 2024.
- Zheng, L. et al. [“SGLang: Efficient execution of structured language model programs.”](https://arxiv.org/abs/2312.07104) *NeurIPS*, 2024.
- Shazeer, N. [“Fast transformer decoding: One write-head is all you need.”](https://arxiv.org/abs/1911.02150) 2019.
- Ainslie, J. et al. [“GQA: Training generalized multi-query transformer models from multi-head checkpoints.”](https://arxiv.org/abs/2305.13245) *EMNLP*, 2023.
- DeepSeek-AI. [“DeepSeek-V2: A strong, economical, and efficient mixture-of-experts language model.”](https://arxiv.org/abs/2405.04434) 2024.
- Jiang, A. Q. et al. [“Mistral 7B.”](https://arxiv.org/abs/2310.06825) 2023.
- Jiang, A. Q. et al. [“Mixtral of experts.”](https://arxiv.org/abs/2401.04088) 2024.
- Dettmers, T. et al. [“LLM.int8(): 8-bit matrix multiplication for transformers at scale.”](https://arxiv.org/abs/2208.07339) *NeurIPS*, 2022.
- Xiao, G. et al. [“SmoothQuant: Accurate and efficient post-training quantization for large language models.”](https://arxiv.org/abs/2211.10438) *ICML*, 2023.
- Frantar, E. et al. [“GPTQ: Accurate post-training quantization for generative pre-trained transformers.”](https://arxiv.org/abs/2210.17323) *ICLR*, 2023.
- Lin, J. et al. [“AWQ: Activation-aware weight quantization for LLM compression and acceleration.”](https://arxiv.org/abs/2306.00978) *MLSys*, 2024.
- Liu, Z. et al. [“KIVI: A tuning-free asymmetric 2bit quantization for KV cache.”](https://arxiv.org/abs/2402.02750) *ICML*, 2024.
- Micikevicius, P. et al. [“FP8 formats for deep learning.”](https://arxiv.org/abs/2209.05433) 2022.
- Open Compute Project. [“OCP microscaling formats (MX) specification v1.0.”](https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf) 2023.
- Leviathan, Y., Kalman, M., Matias, Y. [“Fast inference from transformers via speculative decoding.”](https://arxiv.org/abs/2211.17192) *ICML*, 2023.
- Chen, C. et al. [“Accelerating large language model decoding with speculative sampling.”](https://arxiv.org/abs/2302.01318) 2023.
- Cai, T. et al. [“Medusa: Simple LLM inference acceleration framework with multiple decoding heads.”](https://arxiv.org/abs/2401.10774) *ICML*, 2024.
- Li, Y. et al. [“EAGLE: Speculative sampling requires rethinking feature uncertainty.”](https://arxiv.org/abs/2401.15077) *ICML*, 2024.
- Fu, Y. et al. [“Break the sequential dependency of LLM inference using lookahead decoding.”](https://arxiv.org/abs/2402.02057) *ICML*, 2024.
- Saxena, A. [“Prompt lookup decoding.”](https://github.com/apoorvumang/prompt-lookup-decoding) 2023.
- Willard, B. T., Louf, R. [“Efficient guided generation for large language models.”](https://arxiv.org/abs/2307.09702) 2023.
- Dean, J., Barroso, L. A. [“The tail at scale.”](https://research.google/pubs/the-tail-at-scale/) *Communications of the ACM*, 2013.
- Little, J. D. C. [“A proof for the queuing formula: L = λW.”](https://doi.org/10.1287/opre.9.3.383) *Operations Research*, 1961.
- 模型配置： [Llama-2-7B](https://huggingface.co/meta-llama/Llama-2-7b-hf/blob/main/config.json), [Llama-3.1-8B](https://huggingface.co/meta-llama/Meta-Llama-3.1-8B/blob/main/config.json), [Mistral-7B-v0.1](https://huggingface.co/mistralai/Mistral-7B-v0.1/blob/main/config.json), [Qwen2.5-7B](https://huggingface.co/Qwen/Qwen2.5-7B/blob/main/config.json), [Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/blob/main/config.json), [SmolLM2-135M](https://huggingface.co/HuggingFaceTB/SmolLM2-135M/tree/93efa2f097d58c2a74874c7e644dbc9b0cee75a2), [SmolLM2-360M](https://huggingface.co/HuggingFaceTB/SmolLM2-360M/tree/f8027fd0eaeea54caa13c31d31b9fdc459c38b49).
- 硬件官方来源： [H100](https://www.nvidia.com/en-us/data-center/h100/), [A100](https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a100/pdf/nvidia-a100-datasheet-us-nvidia-1758950-r4-web.pdf), [L40S](https://www.nvidia.com/en-us/data-center/l40s/), [L4](https://www.nvidia.com/en-us/data-center/l4/), [Ada architecture](https://images.nvidia.com/aem-dam/Solutions/geforce/ada/nvidia-ada-gpu-architecture.pdf), [M2 Ultra](https://www.apple.com/newsroom/2023/06/apple-introduces-m2-ultra/). 规格核查于 2026 年 10 月 5 日；价格与效率比例仍明确作为假设。
