# GLOSSARY — canonical Chinese terms for the AI series

Every translator uses these renderings, so the same English term reads the same in all ten
modules. Rules first, then the full term list compiled from the ten module plans.

## Rules

- **token** stays "token": 下一个 token 预测, 特殊 token, 首 token 时延, 每输出 token 时延,
  token 间时延, 每秒 token 数. Never 词元.
- **KV cache** stays English. Never 键值缓存.
- **LoRA**, **QLoRA** stay English (not 低秩适配, 量化低秩适配).
- **logits** stays English (not 逻辑值).
- **batch**, **mini-batch** stay English; batch size is batch 大小; critical batch size is 临界 batch 大小.
- **prompt** is 提示词 everywhere: 系统提示词, 提示词注入, 提示词缓存.
- **latent space** is 潜在空间; latent diffusion is 潜在扩散.
- **RMSNorm** is 均方根归一化（RMSNorm）at first use.
- Compounds take an ASCII hyphen: 编码器-解码器, 偏差-方差权衡, 精确率-召回率曲线.
- **kernel**: 核函数 for kernel methods (Module 01), 卷积核 for convolution (Module 03),
  and plain "kernel" for GPU kernels (Modules 06, 10).
- **dilated convolution** is 空洞卷积.
- **inference** is 推理; **reasoning model** is 推理模型（reasoning model）;
  **statistical inference** is 统计推断.
- **contamination** is 数据污染 (benchmark contamination 基准污染); **decontamination** is 去污染.
- **reward hacking** is 奖励投机.
- Also fixed: 缩放定律, 校准, 自助法, 梯度裁剪, 预热, 灾难性遗忘, 计算最优, 过度训练, 混合专家,
  分词器, 梯度消失 / 梯度爆炸, 微调, 注意力, 自注意力, 残差连接, 浮点运算次数（FLOPs）, 幻觉,
  谄媚, 分组查询注意力, 投机解码, 预填充, 前缀缓存.
- Names that Chinese engineers say in English stay English: Transformer, softmax, Adam, AdamW,
  PyTorch, GPU, ReLU, GELU, SwiGLU, RoPE, FlashAttention, MoE (混合专家（MoE）at first use).

## Terms

| English | 中文 | Modules |
|---|---|---|
| 1x1 convolution; bottleneck | 1×1 卷积；瓶颈结构 | 03 |
| 4-bit NormalFloat (NF4) | 4 位正态浮点 | 09 |
| activation checkpointing (gradient checkpointing) | 激活检查点（梯度检查点） | 08 |
| activation function | 激活函数 | 02 |
| adaptive learning rate | 自适应学习率 | 02 |
| ALiBi (attention with linear biases) | 线性偏置注意力（ALiBi） | 06 |
| all-reduce | 全归约 | 08 |
| anchor box | 锚框 | 03 |
| anomaly detection | 异常检测 | 05 |
| anomaly detection, residual | 异常检测，残差 | 04 |
| arithmetic intensity | 算术强度 | 10 |
| attention, alignment | 注意力，对齐 | 04 |
| autoencoder | 自编码器 | 05 |
| automatic differentiation | 自动微分 | 02 |
| average precision (AP, mAP) | 平均精度（AP，mAP） | 03 |
| backpropagation through time (BPTT) | 随时间反向传播 | 04 |
| backpropagation, chain rule | 反向传播，链式法则 | 02 |
| batch normalisation | 批归一化 | 02 |
| beam search | 束搜索 | 04 |
| benchmark contamination | 基准污染 | 07 |
| best-of-n sampling | N 选优采样 | 09 |
| bias correction | 偏差修正 | 02 |
| bias–variance trade-off | 偏差-方差权衡 | 01 |
| bidirectional RNN | 双向循环神经网络 | 04 |
| bits per byte | 每字节比特数 | 07 |
| bootstrap / confidence interval | 自助法 / 置信区间 | 01 |
| bootstrap confidence interval | 自助法置信区间 | 09 |
| Bradley-Terry model | 布拉德利-特里模型 | 09 |
| byte-level BPE | 字节级 BPE | 07 |
| byte-pair encoding (BPE) | 字节对编码 | 07 |
| calibration | 校准 | 07 |
| calibration / reliability diagram | 校准 / 可靠性图 | 01 |
| calibration data | 校准数据 | 10 |
| calibration, abstention | 校准，弃权 | 09 |
| catastrophic forgetting | 灾难性遗忘 | 08, 09 |
| causal mask | 因果掩码 | 06 |
| cell state | 细胞状态 | 04 |
| chain of thought | 思维链 | 07 |
| chat template, special token | 对话模板，特殊 token | 09 |
| chat template, system prompt | 对话模板，系统提示词 | 07 |
| chunked prefill | 分块预填充 | 10 |
| classifier-free guidance | 无分类器引导 | 05 |
| collocation points | 配点 | 05 |
| computational graph | 计算图 | 02 |
| compute budget | 算力预算 | 08 |
| compute-bound, memory-bound | 计算受限，访存受限 | 10 |
| compute-optimal | 计算最优 | 07 |
| compute-optimal, over-training | 计算最优，过度训练 | 08 |
| condition number | 条件数 | 01 |
| confusion matrix | 混淆矩阵 | 01 |
| constrained decoding | 受限解码 | 07 |
| contamination, decontamination | 数据污染，去污染 | 08 |
| context extension, position interpolation | 上下文扩展，位置插值 | 06 |
| context vector | 上下文向量 | 04 |
| context window, KV cache | 上下文窗口，KV cache | 07 |
| continued pretraining, replay | 继续预训练，回放 | 08 |
| continuous batching | 连续批处理 | 10 |
| contrastive learning / self-supervised learning | 对比学习 / 自监督学习 | 05 |
| convolution; kernel / filter | 卷积；卷积核 / 滤波器 | 03 |
| corpus, data mixture | 语料，数据配比 | 08 |
| cosine annealing | 余弦退火 | 02 |
| critical batch size | 临界 batch 大小 | 08 |
| cross-correlation | 互相关 | 03 |
| cross-entropy | 交叉熵 | 07 |
| cross-entropy / softmax / logits | 交叉熵 / softmax / logits | 01 |
| cross-validation / nested cross-validation | 交叉验证 / 嵌套交叉验证 | 01 |
| data / tensor / pipeline parallelism | 数据 / 张量 / 流水线并行 | 08 |
| data augmentation | 数据增强 | 03 |
| data contamination, decontamination | 数据污染，去污染 | 09 |
| data leakage / distribution shift | 数据泄漏 / 分布偏移 | 01 |
| dead ReLU | 死亡 ReLU | 02 |
| decision tree / random forest / gradient boosting | 决策树 / 随机森林 / 梯度提升 | 01 |
| decode (decoding phase) | 解码 | 10 |
| decoupled weight decay (AdamW) | 解耦权重衰减（AdamW） | 02 |
| deduplication, near-duplicate | 去重，近似重复 | 08 |
| denoising autoencoder | 去噪自编码器 | 05 |
| depthwise-separable convolution | 深度可分离卷积 | 03 |
| Dice coefficient | Dice 系数 | 03 |
| diffusion model | 扩散模型 | 05 |
| dilated convolution | 空洞卷积 | 03 |
| direct preference optimisation (DPO) | 直接偏好优化 | 09 |
| distillation | 蒸馏 | 09 |
| draft model, acceptance rate | 草稿模型，接受率 | 10 |
| dropout | 随机失活（dropout） | 02 |
| early stopping | 早停 | 02 |
| emergent abilities | 涌现能力 | 07 |
| encoder-decoder | 编码器-解码器 | 04 |
| encoder-decoder, cross-attention | 编码器-解码器，交叉注意力 | 06 |
| encoder-decoder; U-Net | 编码器-解码器；U-Net | 03 |
| encoder-only / decoder-only | 仅编码器 / 仅解码器 | 06 |
| evidence lower bound (ELBO) | 证据下界 | 05 |
| exposure bias | 暴露偏差 | 04 |
| fallback, versioning | 回退，版本化 | 10 |
| fault tree / single point of failure | 故障树 / 单点故障 | 05 |
| feature map; channel | 特征图；通道 | 03 |
| feed-forward network | 前馈网络 | 06 |
| FlashAttention | FlashAttention（IO 感知注意力） | 06 |
| floating-point operations (FLOPs) | 浮点运算次数（FLOPs） | 06 |
| forget gate | 遗忘门 | 04 |
| gate | 门（门控） | 04 |
| gated recurrent unit (GRU) | 门控循环单元 | 04 |
| generalisation | 泛化 | 01 |
| generative adversarial network (GAN) | 生成对抗网络 | 05 |
| generator / discriminator | 生成器 / 判别器 | 05 |
| goodput | 有效吞吐量 | 10 |
| GPU kernel, fused kernel | kernel，融合 kernel | 06 |
| gradient checking | 梯度检验 | 02 |
| gradient clipping | 梯度裁剪 | 02, 04, 08 |
| gradient descent / learning rate | 梯度下降 / 学习率 | 01 |
| graph attention network (GAT) | 图注意力网络 | 05 |
| graph convolutional network (GCN) | 图卷积网络 | 05 |
| graph neural network (GNN) | 图神经网络 | 05 |
| greedy decoding | 贪心解码 | 04 |
| greedy decoding, beam search | 贪心解码，束搜索 | 07 |
| group normalisation | 组归一化 | 03 |
| group relative policy optimisation (GRPO) | 组相对策略优化 | 09 |
| grouped convolution; depthwise convolution | 分组卷积；逐通道卷积 | 03 |
| grouped-query attention (GQA) | 分组查询注意力 | 10 |
| grouped-query attention / multi-query attention | 分组查询注意力 / 多查询注意力 | 06 |
| hallucination | 幻觉 | 07 |
| hidden state | 隐状态 | 04 |
| implicit reward | 隐式奖励 | 09 |
| in-context learning, few-shot, zero-shot | 上下文学习，少样本，零样本 | 07 |
| induction head | 归纳头 | 06 |
| inductive bias | 归纳偏置 | 03 |
| inference | 推理 | 10 |
| initialisation (Xavier, He) | 参数初始化（Xavier 初始化，He 初始化） | 02 |
| inter-token latency (ITL) | token 间时延 | 10 |
| intersection over union (IoU) | 交并比 | 03 |
| irreducible loss | 不可约损失 | 07 |
| Jacobian, vector-Jacobian product | 雅可比矩阵，向量-雅可比积 | 02 |
| k-means clustering / principal component analysis | k 均值聚类 / 主成分分析 | 01 |
| k-nearest neighbours / curse of dimensionality | k 近邻 / 维数灾难 | 01 |
| key-value (KV) cache | KV cache | 10 |
| KL divergence | KL 散度 | 05 |
| KL penalty | KL 惩罚 | 09 |
| knowledge cutoff | 知识截止日期 | 07 |
| KV cache (key-value cache) | KV cache | 06 |
| label smoothing | 标签平滑 | 02 |
| language identification | 语种识别 | 08 |
| large language model | 大语言模型 | 07 |
| latent diffusion | 潜在扩散 | 05 |
| latent space | 潜在空间 | 05 |
| layer normalisation, RMSNorm (root-mean-square normalisation) | 层归一化，均方根归一化（RMSNorm） | 02 |
| learning curve / double descent | 学习曲线 / 双下降 | 01 |
| learning-rate range test | 学习率范围测试 | 02 |
| learning-rate schedule, warmup | 学习率调度，预热 | 02 |
| least squares / normal equations | 最小二乘法 / 正规方程 | 01 |
| likelihood / maximum likelihood estimation | 似然 / 极大似然估计 | 01 |
| likelihood displacement | 似然位移 | 09 |
| linear recurrence, parallel scan | 线性循环（线性递推），并行扫描 | 04 |
| LLM-as-judge, position bias | 模型评判，位置偏差 | 09 |
| load balancing, capacity factor | 负载均衡，容量因子 | 08 |
| load-balancing loss | 负载均衡损失 | 05 |
| local connectivity; weight sharing | 局部连接；权值共享 | 03 |
| logistic regression / decision boundary | 逻辑回归 / 决策边界 | 01 |
| long short-term memory (LSTM) | 长短期记忆网络 | 04 |
| LoRA, QLoRA, adapter | LoRA，QLoRA，适配器 | 09 |
| loss function / empirical risk | 损失函数 / 经验风险 | 01 |
| loss masking | 损失掩码 | 09 |
| loss spike, divergence | 损失尖峰，发散 | 08 |
| marching cubes; isosurface | 移动立方体算法；等值面 | 03 |
| masked language modelling | 掩码语言建模 | 06 |
| memory bandwidth | 显存带宽 | 10 |
| message passing | 消息传递 | 05 |
| mid-training, context extension | 中期训练，上下文扩展 | 08 |
| MinHash, locality-sensitive hashing (LSH) | 最小哈希，局部敏感哈希 | 08 |
| mixed precision (bf16), loss scaling | 混合精度（bf16），损失缩放 | 08 |
| mixed precision (fp16, bf16) | 混合精度 | 02 |
| mixture of experts / router | 混合专家 / 路由器 | 05 |
| mixture of experts, expert parallelism | 混合专家，专家并行 | 08 |
| mode collapse | 模式坍塌 | 05 |
| model FLOPs utilisation (MFU) | 模型算力利用率 | 08 |
| model merging, task vector | 模型合并，任务向量 | 09 |
| momentum, Nesterov momentum | 动量法，Nesterov 动量 | 02 |
| multi-head attention | 多头注意力 | 06 |
| multilayer perceptron (MLP), hidden layer | 多层感知机，隐藏层 | 02 |
| multiply-accumulate (MAC); FLOPs | 乘加运算（MAC）；浮点运算次数（FLOPs） | 03 |
| naive forecast, seasonal naive forecast | 朴素预测，季节性朴素预测 | 04 |
| neural operator / surrogate model | 神经算子 / 代理模型 | 05 |
| next-token prediction | 下一个 token 预测 | 07 |
| noise schedule | 噪声调度 | 05 |
| non-maximum suppression (NMS) | 非极大值抑制 | 03 |
| nonlinear least squares / extrapolation / hyperelastic (neo-Hookean) model | 非线性最小二乘 / 外推 / 超弹性（新胡克）模型 | 01 |
| numerical stability, log-sum-exp | 数值稳定性，log-sum-exp 技巧 | 02 |
| object detection; bounding box | 目标检测；边界框 | 03 |
| online softmax | 在线 softmax | 06 |
| open-weight model | 开放权重模型 | 07 |
| outlier | 离群值 | 10 |
| over-refusal, sycophancy | 过度拒绝，谄媚 | 09 |
| over-smoothing | 过平滑 | 05 |
| over-training (beyond compute-optimal) | 过度训练（超出计算最优点） | 07 |
| overfitting / underfitting | 过拟合 / 欠拟合 | 01 |
| padding mask | 填充掩码 | 06 |
| PagedAttention | 分页注意力 | 10 |
| parameter-efficient fine-tuning (PEFT) | 参数高效微调 | 09 |
| per-channel, group-wise quantisation | 逐通道量化，分组量化 | 10 |
| permutation equivariance | 置换等变性 | 06 |
| perplexity | 困惑度 | 07 |
| physics-informed neural network (PINN) | 物理信息神经网络 | 05 |
| pipeline bubble | 流水线气泡 | 08 |
| policy gradient, baseline, advantage | 策略梯度，基线，优势 | 09 |
| pooling; global average pooling | 池化；全局平均池化 | 03 |
| positional encoding | 位置编码 | 06 |
| post-training, alignment | 后训练，对齐 | 09 |
| posterior collapse | 后验坍塌 | 05 |
| pre-norm / post-norm | 前置归一化 / 后置归一化 | 06 |
| precision / recall / F1 score | 精确率 / 召回率 / F1 分数 | 01 |
| preference data | 偏好数据 | 09 |
| prefill | 预填充 | 10 |
| prefix caching | 前缀缓存 | 10 |
| pretraining, base model | 预训练，基座模型 | 08 |
| prior / maximum a posteriori (MAP) estimation | 先验 / 最大后验估计 | 01 |
| prompt caching | 提示词缓存 | 07 |
| prompt injection | 提示词注入 | 07 |
| proximal policy optimisation (PPO), clipped objective | 近端策略优化，裁剪目标 | 09 |
| quality filter | 质量过滤器 | 08 |
| quantisation (int8, int4, fp8) | 量化 | 10 |
| query / key / value | 查询 / 键 / 值 | 06 |
| receptive field; effective receptive field | 感受野；有效感受野 | 03 |
| recurrent neural network (RNN) | 循环神经网络 | 04 |
| regularisation / weight decay | 正则化 / 权重衰减 | 01 |
| reinforcement learning from human feedback (RLHF) | 人类反馈强化学习 | 09 |
| rejection sampling, expert iteration | 拒绝采样，专家迭代 | 09 |
| reparameterisation trick | 重参数化技巧 | 05 |
| residual block; skip connection; degradation problem | 残差块；跳跃连接；退化问题 | 03 |
| residual connection | 残差连接 | 02 |
| residual stream | 残差流 | 06 |
| reverse mode / forward mode | 反向模式 / 前向模式 | 02 |
| reward hacking, overoptimisation | 奖励投机，过度优化 | 09 |
| reward model | 奖励模型 | 09 |
| ridge regression / lasso | 岭回归 / Lasso 回归（套索回归） | 01 |
| RMSNorm (root-mean-square normalisation) | 均方根归一化（RMSNorm） | 06 |
| ROC curve / AUC / precision–recall curve | ROC 曲线 / 曲线下面积（AUC） / 精确率-召回率曲线 | 01 |
| roofline model | 屋顶线模型（Roofline 模型） | 10 |
| rotary position embedding (RoPE) | 旋转位置编码（RoPE） | 06 |
| saliency map; class activation map (CAM, Grad-CAM) | 显著图；类激活图 | 03 |
| saturation | 饱和 | 02 |
| scale, zero-point | 缩放因子，零点 | 10 |
| scaled dot-product attention | 缩放点积注意力 | 06 |
| scaling law | 缩放定律 | 07 |
| score function | 分数函数 | 05 |
| selective state-space model | 选择性状态空间模型 | 04 |
| self-attention | 自注意力 | 06 |
| semantic / instance segmentation | 语义分割 / 实例分割 | 03 |
| sequence / context parallelism | 序列并行 / 上下文并行 | 08 |
| sequence packing | 序列打包 | 08 |
| sequence to sequence (seq2seq) | 序列到序列 | 04 |
| service-level objective (SLO) | 服务等级目标 | 10 |
| serving | 部署服务 | 10 |
| shortcut learning | 捷径学习 | 03 |
| silent data corruption | 静默数据损坏 | 08 |
| sliding-window attention | 滑动窗口注意力 | 06 |
| spectral radius | 谱半径 | 04 |
| speculative decoding | 投机解码 | 10 |
| standardisation / one-hot encoding | 标准化 / 独热编码 | 01 |
| state-space model | 状态空间模型 | 04 |
| stochastic gradient descent / mini-batch / batch size / epoch | 随机梯度下降 / mini-batch / batch 大小 / 轮次（epoch） | 01 |
| stride; padding; dilation | 步长；填充；空洞 | 03 |
| structured output / constrained decoding | 结构化输出 / 受限解码 | 10 |
| supervised / unsupervised learning | 监督学习 / 无监督学习 | 01 |
| supervised fine-tuning (SFT), demonstration | 监督微调，示范 | 09 |
| support vector machine / kernel | 支持向量机 / 核函数 | 01 |
| SwiGLU (gated linear unit) | SwiGLU（门控线性单元） | 06 |
| sycophancy | 谄媚（迎合用户） | 07 |
| symmetry breaking | 对称性破缺 | 02 |
| tail latency | 尾部时延 | 10 |
| teacher forcing | 教师强制 | 04 |
| temperature | 温度 | 07 |
| temporal convolutional network (TCN) | 时间卷积网络 | 04 |
| tied embeddings | 嵌入权重共享（权重绑定） | 06 |
| time per output token (TPOT) | 每输出 token 时延 | 10 |
| time series forecasting | 时间序列预测 | 04 |
| time to first token (TTFT) | 首 token 时延 | 10 |
| token, tokenizer | token，分词器 | 07 |
| tokenizer training | 分词器训练 | 08 |
| tokens per second, throughput | 每秒 token 数，吞吐量 | 10 |
| top-k sampling, nucleus (top-p) sampling, min-p sampling | top-k 采样，核采样（top-p），min-p 采样 | 07 |
| training / validation / test set | 训练集 / 验证集 / 测试集 | 01 |
| transfer learning; fine-tuning; linear probe | 迁移学习；微调；线性探测 | 03 |
| translation equivariance / invariance | 平移等变性 / 平移不变性 | 03 |
| transposed convolution; upsampling | 转置卷积；上采样 | 03 |
| truncated BPTT | 截断的随时间反向传播 | 04 |
| unigram tokenisation, SentencePiece | 一元语言模型分词，SentencePiece | 07 |
| universal approximation theorem | 通用近似定理 | 02 |
| unrolling in time | 按时间展开 | 04 |
| vanishing / exploding gradient | 梯度消失 / 梯度爆炸 | 02, 04 |
| variational autoencoder (VAE) | 变分自编码器 | 05 |
| verifiable reward (RLVR) | 可验证奖励 | 09 |
| vision transformer, patch embedding | 视觉 Transformer，图像块嵌入 | 06 |
| voxel; voxel spacing | 体素；体素间距 | 03 |
| walk-forward validation (rolling-origin evaluation) | 前向滚动验证（滚动起点评估） | 04 |
| warmup, cosine decay | 预热，余弦衰减 | 08 |
| warmup-stable-decay (WSD) schedule | 预热-稳定-衰减（WSD）调度 | 08 |
| Wasserstein distance (earth mover's distance) | Wasserstein 距离（推土机距离） | 05 |
| ZeRO, fully sharded data parallel (FSDP) | 零冗余优化器，全分片数据并行 | 08 |
