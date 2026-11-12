## 实验 4 — 预算和内存计算器 {#lab4}

**目标。** 将模型结构换算为训练预算和内存估计，比较 ZeRO 阶段、激活检查点、micro-batch 大小、流水线气泡和检查点间隔。不需数据集、模型下载或 GPU。公式只是保留明确假设的估算；通过估算的配置仍需实测。

### 步骤一：参数计数

采用无偏置、RMSNorm、SwiGLU 解码器。假想案例配置与 [第 07 模块](module_07_ZH.html) 相同；其他行用于核对已发布结构及两种计划中的小型训练结构。

```python
import math
import numpy as np

np.random.seed(0)


def params(L, d, n_h, n_kv, d_ff, V, tied=False):
    assert d % n_h == 0 and n_h % n_kv == 0
    attention = 2 * d * d + 2 * d * n_kv * (d // n_h)
    ffn = 3 * d * d_ff
    norms = 2 * d
    blocks = L * (attention + ffn + norms)
    embeddings = V * d * (1 if tied else 2)
    total = blocks + embeddings + d
    return dict(total=total, blocks=blocks, attention=L * attention, ffn=L * ffn,
                norms=L * norms + d, embeddings=embeddings,
                lookup=0 if tied else V * d)


case = dict(L=36, d=4096, n_h=32, n_kv=8, d_ff=15360, V=152064)
llama3 = dict(L=32, d=4096, n_h=32, n_kv=8, d_ff=14336, V=128256)
recipe = dict(L=12, d=768, n_h=12, n_kv=12, d_ff=2048, V=32000, tied=True)
laptop = dict(L=6, d=256, n_h=8, n_kv=8, d_ff=688, V=4096, tied=True)
for name, cfg in (("case study", case), ("Llama-3 shape", llama3),
                  ("small recipe", recipe), ("laptop shape", laptop)):
    c = params(**cfg)
    rule = 12 * cfg["L"] * cfg["d"] ** 2
    print(f"{name:15s} total {c['total']:>13,}, blocks {c['blocks']:>13,}, "
          f"12Ld^2 {rule:>13,}")
assert params(**case)["total"] == 9_550_729_216
assert params(**llama3)["total"] == 8_030_261_248
assert params(**recipe)["total"] == 109_529_856
assert params(**laptop)["total"] == 5_795_072
```

```output
case study      total 9,550,729,216, blocks 8,305,016,832, 12Ld^2 7,247,757,312
Llama-3 shape   total 8,030,261,248, blocks 6,979,584,000, 12Ld^2 6,442,450,944
small recipe    total   109,529,856, blocks    84,953,088, 12Ld^2    84,934,656
laptop shape    total     5,795,072, blocks     4,746,240, 12Ld^2     4,718,592
```

小型方案的块有 84,953,088 个参数，共享嵌入有 24,576,000 个，最终归一化再加 768，总量 109,529,856。若漏掉最终归一化，则为 109,529,088。笔记本模型一行仅计算结构，不需要其他实验的检查点。

### 第 2 步：训练计算和经过的时间

[第 06 模块，第 11 节](module_06_ZH.html#s11) 给出 FLOP 约定。这里写成函数：不计仅查表的输入嵌入，加入因果平均注意力，再乘训练 token 数。简化公式则计入全部参数、不计注意力。

```python
def train_flops(cfg, tokens, length=8192):
    c = params(**cfg)
    weight = 6 * (c["total"] - c["lookup"])
    attention = 6 * cfg["L"] * cfg["d"] * length
    return (weight + attention) * tokens, 6 * c["total"] * tokens


def compute_for(cfg, tokens, length):
    c = params(**cfg)
    return (6 * (c["total"] - c["lookup"])
            + 6 * cfg["L"] * cfg["d"] * length) * tokens


def gpu_time(compute, sustained, n_gpus):
    gpu_hours = compute / sustained / 3600
    return gpu_hours, gpu_hours / n_gpus


for tokens, gpus in ((2e12, 80), (2e9, 8)):
    compute, quick = train_flops(case, tokens)
    gpu_hours, hours = gpu_time(compute, 4e14, gpus)
    print(f"{tokens:.0e} tokens, {gpus} GPUs: {compute:.3e} FLOPs, "
          f"{gpu_hours:,.1f} GPU-hours, {hours:.2f} hours ({hours / 24:.2f} days)")
    print(f"  6 N_total D shortcut: {quick:.3e} FLOPs, {quick / compute - 1:.1%}")
for mfu in (0.30, 0.40, 0.50):
    compute = compute_for(case, 2e12, 8192)
    _, hours = gpu_time(compute, 989e12 * mfu, 80)
    print(f"assumed MFU {mfu:.0%}: {hours / 24:.1f} days on 80 GPUs")
small_compute = compute_for(recipe, 2.5e9, 2048)
print(f"small recipe: {small_compute:.3e} FLOPs including attention")
```

```output
2e+12 tokens, 80 GPUs: 1.216e+23 FLOPs, 84,465.3 GPU-hours, 1055.82 hours (43.99 days)
  6 N_total D shortcut: 1.146e+23 FLOPs, -5.8%
2e+09 tokens, 8 GPUs: 1.216e+20 FLOPs, 84.5 GPU-hours, 10.56 hours (0.44 days)
  6 N_total D shortcut: 1.146e+20 FLOPs, -5.8%
assumed MFU 30%: 59.3 days on 80 GPUs
assumed MFU 40%: 44.5 days on 80 GPUs
assumed MFU 50%: 35.6 days on 80 GPUs
small recipe: 1.926e+18 FLOPs including attention
```

峰值 989 TFLOP/s 和持续 $4\times10^{14}$ FLOP/s 是此计算的假设输入。MFU 的分子分母必须采用一致运算约定。这些时间不含停机，并假设持续速率已反映所选实现的通信和重计算开销。

### 步骤 3：分片下的模型状态

假设权重 2 字节、梯度 2 字节、fp32 主权重及两个 Adam 矩共 12 字节。纯数据并行复制全部 16 字节。ZeRO-1 分片 12 字节优化器状态，ZeRO-2 再分片梯度，ZeRO-3 再分片权重。实际系统可能采用不同梯度类型或主权重策略。

```python
def model_states(N, replicas, stage):
    assert replicas >= 1
    if stage == "DP":
        return N * 16
    if stage == 1:
        return N * (4 + 12 / replicas)
    if stage == 2:
        return N * (2 + 14 / replicas)
    if stage == 3:
        return N * 16 / replicas
    raise ValueError("stage must be DP, 1, 2 or 3")


N = params(**case)["total"]
for replicas in (8, 64, 80):
    sizes = [model_states(N, replicas, stage) / 1e9 for stage in ("DP", 1, 2, 3)]
    print(f"{replicas:2d} GPUs: DP, ZeRO-1, ZeRO-2, ZeRO-3 GB "
          + ", ".join(f"{size:.1f}" for size in sizes))
```

```output
 8 GPUs: DP, ZeRO-1, ZeRO-2, ZeRO-3 GB 152.8, 52.5, 35.8, 19.1
64 GPUs: DP, ZeRO-1, ZeRO-2, ZeRO-3 GB 152.8, 40.0, 21.2, 2.4
80 GPUs: DP, ZeRO-1, ZeRO-2, ZeRO-3 GB 152.8, 39.6, 20.8, 1.9
```

ZeRO-3 的常驻权重分片不是峰值分配。计算一层时需聚集其权重，通信缓冲区和重叠聚集还要额外内存。下方容量表是组成项估算，不是分配器保证。

### 第 4 步：激活、logits 与容量

采用融合注意力时，保存激活的近似预算为 $BTL(12d+4n_{\text{kv}}d_{\text{head}}+6d_{\text{ff}})$ 字节。完整检查点保存 bf16 层输入，并留出一层重算工作区。Logits 单列估算，每个词表 logit 为 fp32 损失保留 4 字节。融合损失可能用得更少，若额外生成概率张量则可能更多。

```python
def activations(cfg, T, micro_batch, checkpoint=False, flash=True):
    L, d = cfg["L"], cfg["d"]
    kv_width = cfg["n_kv"] * (d // cfg["n_h"])
    layer = micro_batch * T * (12 * d + 4 * kv_width + 6 * cfg["d_ff"])
    if not flash:
        layer += 2 * micro_batch * cfg["n_h"] * T * T
    if checkpoint:
        return 2 * micro_batch * T * d * L + layer
    return L * layer


def logits_bytes(cfg, T, micro_batch):
    return 4 * micro_batch * T * cfg["V"]


print(f"case activations: {activations(case, 8192, 1) / 1e9:.2f} GB")
print(f"case checkpointed: {activations(case, 8192, 1, True) / 1e9:.2f} GB")
print(f"case logits: {logits_bytes(case, 8192, 1) / 1e9:.2f} GB")
probabilities = 2 * case["L"] * case["n_h"] * 8192 ** 2
print(f"additional dense bf16 attention probabilities: {probabilities / 1e9:.1f} GB")


def fit(name, cfg, replicas, stage, T, micro_batch, checkpoint, capacity):
    states = model_states(params(**cfg)["total"], replicas, stage)
    acts = activations(cfg, T, micro_batch, checkpoint)
    logits = logits_bytes(cfg, T, micro_batch)
    total = (states + acts + logits) / 1e9
    print(f"{name:27s} states {states / 1e9:5.2f}, acts {acts / 1e9:5.2f}, "
          f"logits {logits / 1e9:4.2f}, total {total:5.2f} GB; "
          f"under {capacity} GB: {total < capacity}")
    return total


fit("case ZeRO-3, 8 GPUs", case, 8, 3, 8192, 1, False, 80)
fit("case ZeRO-3, checkpointed", case, 8, 3, 8192, 1, True, 80)
fit("case ZeRO-1, 80 GPUs", case, 80, 1, 8192, 1, False, 80)
for micro_batch in (16, 32):
    fit(f"small recipe batch {micro_batch}", recipe, 1, "DP", 2048,
        micro_batch, False, 24)
```

```output
case activations: 42.88 GB
case checkpointed: 3.61 GB
case logits: 4.98 GB
additional dense bf16 attention probabilities: 154.6 GB
case ZeRO-3, 8 GPUs         states 19.10, acts 42.88, logits 4.98, total 66.97 GB; under 80 GB: True
case ZeRO-3, checkpointed   states 19.10, acts  3.61, logits 4.98, total 27.69 GB; under 80 GB: True
case ZeRO-1, 80 GPUs        states 39.64, acts 42.88, logits 4.98, total 87.50 GB; under 80 GB: False
small recipe batch 16       states  1.75, acts  9.66, logits 4.19, total 15.61 GB; under 24 GB: True
small recipe batch 32       states  1.75, acts 19.33, logits 8.39, total 29.47 GB; under 24 GB: False
```

数值未包含分配器碎片、通信缓冲区、临时聚集权重及其他框架分配。应留余量并测峰值。减小 micro-batch、增加梯度累积，可保持全局 token batch 同时降低激活需求，却不降低常驻优化器状态。

### 第五步：流水线气泡和恢复间隔

理想均衡流水线有 $p$ 阶段、$m$ 个 micro-batch，简单气泡比例为 $(p-1)/(m+p-1)$。实际调度、不均衡层及交错会改变它。检查点写入耗时 $\delta$、平均中断间隔 $M$ 时，近似开销为 $\delta/\tau+\tau/(2M)$。对间隔 $\tau$ 求导，得到 $\tau^*=\sqrt{2\delta M}$。

```python
def bubble(stages, micro_batches):
    return (stages - 1) / (micro_batches + stages - 1)


def young_interval(write_seconds, mtbf_seconds):
    return math.sqrt(2 * write_seconds * mtbf_seconds)


for stages, micro_batches in ((4, 4), (4, 16), (8, 8), (8, 64)):
    print(f"pipeline p={stages}, m={micro_batches}: "
          f"bubble {bubble(stages, micro_batches):.1%}")
for mtbf_hours in (3.09, 633):
    interval = young_interval(60, mtbf_hours * 3600)
    overhead = 60 / interval + interval / (2 * mtbf_hours * 3600)
    print(f"MTBF {mtbf_hours:.2f} hours: checkpoint every {interval / 60:.1f} minutes "
          f"({interval / 3600:.2f} hours), estimated overhead {overhead:.1%}")
```

```output
pipeline p=4, m=4: bubble 42.9%
pipeline p=4, m=16: bubble 15.8%
pipeline p=8, m=8: bubble 46.7%
pipeline p=8, m=64: bubble 9.9%
MTBF 3.09 hours: checkpoint every 19.3 minutes (0.32 hours), estimated overhead 10.4%
MTBF 633.00 hours: checkpoint every 275.6 minutes (4.59 hours), estimated overhead 0.7%
```

中断率是假设情景。按独立单设备故障扩展只是粗略规划模型；共享网络与存储故障未必遵循它。间隔公式忽略重启时间，假设检查点完整可恢复。长期运行前，测试优化器、调度、RNG 及加载器状态恢复。

### 第 6 步：重现五行简化估算表

此表与上方考虑架构的估算分开。全部采用舍入后的 9.5B 参数及 $6ND$，对应第 1 节的快速估算。这些是规划情景，不是已完成训练的记录。

```python
shortcut_rows = [
    ("9.5B / 190B", 9.5e9, 190e9, 16),
    ("9.5B / 2T", 9.5e9, 2e12, 80),
    ("9.5B / 15T", 9.5e9, 15e12, 80),
    ("1B / 20B", 1e9, 20e9, 4),
    ("9.5B CPT / 2B", 9.5e9, 2e9, 8),
]
print("Shortcut scenario   FLOPs       GPU-hours GPUs     days")
for name, N, D, gpus in shortcut_rows:
    compute = 6*N*D
    gpu_hours, hours = gpu_time(compute, 4e14, gpus)
    print(f"{name:18} {compute:9.3e} {gpu_hours:11,.1f} "
          f"{gpus:4d} {hours/24:8.2f}")
```

```output
Shortcut scenario   FLOPs       GPU-hours GPUs     days
9.5B / 190B        1.083e+22     7,520.8   16    19.59
9.5B / 2T          1.140e+23    79,166.7   80    41.23
9.5B / 15T         8.550e+23   593,750.0   80   309.24
1B / 20B           1.200e+20        83.3    4     0.87
9.5B CPT / 2B      1.140e+20        79.2    8     0.41
```

相同持续吞吐量下，2T token 简化估算为 41.2 天，而本系列计数为 44.0 天。舍入参数和忽略注意力是两种不同近似；将结果写入预算时应保留计数标签。

### 第 7 步：训练分配与等损失投资回收

采用模块 07 引用的已发表参数定律，参数和 token 使用原始计数。其预算变量为 $C_6=6ND$，不用考虑架构的 FLOP 函数。在固定 $C_6$ 下，比较解析拟合最小值与每参数二十 token 的点。再求最小训练预算，使其拟合最优模型达到案例预测损失。

等损失最优方案可降低训练成本，却增加每服务 token 成本。用相同近似服务成本 $2N$，解 $C_6+2NS=C'_6+2N'S$，得到服务 token 的盈亏平衡点。固定预算最小值的损失不同，不适合回答等质量问题。

```python
def chinchilla_loss(N, D):
    return 1.69 + 406.4/N**.34 + 410.7/D**.28

def chinchilla_optimum(C):
    N = (.34*406.4/(.28*410.7))**(1/(.34+.28))*(C/6)**(.28/(.34+.28))
    return N, C/(6*N)

def equal_loss_payback(N, D):
    target = chinchilla_loss(N, D)
    lo, hi = 15.0, 28.0
    assert chinchilla_loss(*chinchilla_optimum(10**lo)) > target
    assert chinchilla_loss(*chinchilla_optimum(10**hi)) < target
    for _ in range(80):
        middle = (lo+hi)/2
        minimum = chinchilla_loss(*chinchilla_optimum(10**middle))
        if minimum > target:
            lo = middle
        else:
            hi = middle
    Cprime = 10**((lo+hi)/2)
    Nprime, Dprime = chinchilla_optimum(Cprime)
    assert abs(chinchilla_loss(Nprime,Dprime)-target) < 1e-10
    if N < Nprime*(1-1e-8):
        status = "positive served-token break-even"
        served = (6*N*D-Cprime)/(2*(Nprime-N))
    elif N > Nprime*(1+1e-8):
        status = "original allocation costs more to train and serve"
        served = None
    else:
        status = "already at the fitted equal-loss optimum"
        served = None
    return dict(N=Nprime,D=Dprime,C=Cprime,served=served,status=status)

N = params(**case)["total"]
D = 2e12
C6 = 6*N*D
Nopt,Dopt = chinchilla_optimum(C6)
N20 = math.sqrt(C6/120)
D20 = 20*N20
for name,n,tokens in [("case study",N,D), ("fixed-budget fitted",Nopt,Dopt),
                      ("fixed-budget 20/token",N20,D20)]:
    print(f"{name:23} N {n/1e9:7.3f}B; D {tokens/1e12:6.3f}T; "
          f"loss {chinchilla_loss(n,tokens):.6f}")
payback = equal_loss_payback(N,D)
print(f"Equal-loss fitted: N {payback['N']/1e9:.3f}B; "
      f"D {payback['D']/1e12:.3f}T; C6 {payback['C']:.3e}")
print("Status:",payback["status"])
if payback["served"] is not None:
    print("Served-token break-even:",f"{payback['served']:.3e}")
```

```output
case study              N   9.551B; D  2.000T; loss 2.001990
fixed-budget fitted     N  15.526B; D  1.230T; loss 1.998483
fixed-budget 20/token   N  30.904B; D  0.618T; loss 2.005373
Equal-loss fitted: N 15.018B; D 1.182T; C6 1.065e+23
Status: positive served-token break-even
Served-token break-even: 7.439e+11
```

这些是外推预测，参数规模和 token 数都超出原始拟合实验。盈亏平衡比较模型运算量，不含注意力、量化、容量、batch 和价格，也不表示两模型在团队安全案例评估上得分相同。对应交互规划器明确展示相同假设。

### 预期观察

2T token 基座计划约需 $1.22\times10^{23}$ 模型 FLOP，2B token 继续预训练为其千分之一。八张 GPU 上，DP 与 ZeRO 阶段 1–3 的每 GPU 状态估计依次为 152.8、52.5、35.8、19.1 GB。完整检查点将激活从约 42.9 降至 3.61 GB，代价是重算；这些数值未计入全部运行时分配。

### 进一步尝试

1. 扫描 micro-batch 大小，绘制有无检查点的总内存。对实测临时分配和通信分配单独标出余量。
2. 改用 fp32 梯度，再加入一个与 fp32 logits 同大小的损失中间张量，观察哪些原本看似可容纳的配置超限。
3. 将 FFN 换成八专家、top-2 路由。区分全部存储权重与激活计算参数；分片及容量必须计入所有专家，包括未选中的专家。

## 实验 5 — 有无回放的继续预训练 {#lab5}

**目标。** 在本实验内训练小型故事基座模型，适配到合成安全案例文本，测量回放比例和学习率对领域适配及遗忘的影响。用训练前固定的验收门槛比较各次运行。

使用相同固定版本 10 MB TinyStories，未缓存则下载。本实验自行训练分词器和基座模型，不读实验 2 检查点。CPU 预计需几分钟，也可用免费 Colab GPU。生成的工程语句都是虚构训练文本，其证据和完整性目标也是假设，不能证明任何真实系统满足安全要求。

### 独立定义基座模型

为独立运行，再次定义模型：宽度 128、四层、四头、前馈宽度 352、上下文 128。分词器仅用通用故事训练，适配过程中保持固定。

```python
import math
import time
import json
from pathlib import Path
from contextlib import nullcontext
import numpy as np
import pandas as pd
import torch
from torch import nn
from torch.nn import functional as F
import matplotlib.pyplot as plt
from tokenizers import Tokenizer, models, trainers, pre_tokenizers, decoders
from huggingface_hub import hf_hub_download

torch.set_num_threads(4)
torch.manual_seed(0)
np.random.seed(0)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
use_bf16 = device.type == "cuda" and torch.cuda.is_bf16_supported()

def precision():
    return (torch.autocast("cuda", dtype=torch.bfloat16) if use_bf16
            else nullcontext())

revision = "f54c09fd23315a6f9c86f9dc80f725de7d8f9c64"
path = hf_hub_download(
    "roneneldan/TinyStories",
    "data/validation-00000-of-00001-869c898b519ad725.parquet",
    repo_type="dataset", revision=revision,
)
stories = pd.read_parquet(path)["text"].tolist()
order = np.random.default_rng(0).permutation(len(stories))
train_texts = [stories[i] for i in order[1000:]]
valid_texts = [stories[i] for i in order[:1000]]

def train_tokenizer(texts):
    tokenizer = Tokenizer(models.BPE())
    tokenizer.pre_tokenizer = pre_tokenizers.ByteLevel(add_prefix_space=False)
    tokenizer.decoder = decoders.ByteLevel()
    trainer = trainers.BpeTrainer(
        vocab_size=4096, special_tokens=["<|endoftext|>"],
        initial_alphabet=pre_tokenizers.ByteLevel.alphabet(), show_progress=False,
    )
    tokenizer.train_from_iterator(texts, trainer=trainer)
    return tokenizer

tokenizer = train_tokenizer(train_texts)
eos = tokenizer.token_to_id("<|endoftext|>")

def pack(texts, tok=tokenizer):
    ends = tok.token_to_id("<|endoftext|>")
    encoded = tok.encode_batch(texts)
    lengths = [len(item.ids)+1 for item in encoded]
    stream = np.fromiter(
        (token for item in encoded for token in [*item.ids, ends]),
        dtype=np.uint16, count=sum(lengths),
    )
    return torch.from_numpy(stream.astype(np.int64)), lengths

train_data, lengths = pack(train_texts)
valid_data, _ = pack(valid_texts)
print("Device:", device, "bf16 autocast:", use_bf16)
print("Stories:", len(train_texts), "train;", len(valid_texts), "validation")
print("Vocabulary:", tokenizer.get_vocab_size(), "EOS:", eos)
print("Tokens:", len(train_data), "train;", len(valid_data), "validation")
```

```output
Device: cpu bf16 autocast: False
Stories: 20990 train; 1000 validation
Vocabulary: 4096 EOS: 0
Tokens: 4650186 train; 228958 validation
```

```python
class RMSNorm(nn.Module):
    def __init__(self, width):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(width))

    def forward(self, x):
        return F.rms_norm(x, (x.shape[-1],), self.weight, eps=1e-5)

class Attention(nn.Module):
    def __init__(self, d, heads, context, qk_norm=False):
        super().__init__()
        self.heads, self.dh = heads, d//heads
        self.qkv = nn.Linear(d, 3*d, bias=False)
        self.out = nn.Linear(d, d, bias=False)
        self.qnorm = RMSNorm(self.dh) if qk_norm else nn.Identity()
        self.knorm = RMSNorm(self.dh) if qk_norm else nn.Identity()
        angles = torch.outer(torch.arange(context),
                             10000**(-torch.arange(0, self.dh, 2)/self.dh))
        self.register_buffer("cos", angles.cos(), persistent=False)
        self.register_buffer("sin", angles.sin(), persistent=False)
        self.probe = False
        self.max_logit = 0.0

    def rotate(self, x):
        pairs = x.reshape(*x.shape[:-1], self.dh//2, 2)
        a, b = pairs.unbind(-1)
        cos = self.cos[:x.shape[-2]].to(x.dtype)
        sin = self.sin[:x.shape[-2]].to(x.dtype)
        return torch.stack((a*cos-b*sin, a*sin+b*cos), -1).flatten(-2)

    def forward(self, x):
        B,T,d = x.shape
        q,k,v = self.qkv(x).chunk(3, -1)
        q,k,v = [y.view(B,T,self.heads,self.dh).transpose(1,2)
                 for y in (q,k,v)]
        q,k = self.rotate(self.qnorm(q)), self.rotate(self.knorm(k))
        if self.probe:
            with torch.no_grad():
                scores = q.float() @ k.float().transpose(-2,-1)/math.sqrt(self.dh)
                causal = torch.ones(T,T,device=x.device,dtype=torch.bool).tril()
                self.max_logit = scores.masked_select(causal).abs().max().item()
        y = F.scaled_dot_product_attention(q,k,v,is_causal=True)
        return self.out(y.transpose(1,2).contiguous().view(B,T,d))

class Block(nn.Module):
    def __init__(self, d, heads, ff, context, qk_norm=False):
        super().__init__()
        self.n1, self.n2 = RMSNorm(d), RMSNorm(d)
        self.attn = Attention(d,heads,context,qk_norm)
        self.gate = nn.Linear(d,ff,bias=False)
        self.up = nn.Linear(d,ff,bias=False)
        self.down = nn.Linear(ff,d,bias=False)

    def forward(self, x):
        x = x + self.attn(self.n1(x))
        y = self.n2(x)
        return x + self.down(F.silu(self.gate(y))*self.up(y))

class GPT(nn.Module):
    def __init__(self, V=4096, d=256, layers=6, heads=8, ff=688,
                 context=256, qk_norm=False):
        super().__init__()
        assert d%heads == 0 and (d//heads)%2 == 0
        self.context = context
        self.embedding = nn.Embedding(V,d)
        self.blocks = nn.ModuleList(
            [Block(d,heads,ff,context,qk_norm) for _ in range(layers)])
        self.norm = RMSNorm(d)
        self.head = nn.Linear(d,V,bias=False)
        self.head.weight = self.embedding.weight
        for param in self.parameters():
            if param.ndim >= 2:
                nn.init.normal_(param,std=.02)
        for block in self.blocks:
            nn.init.normal_(block.attn.out.weight,std=.02/math.sqrt(2*layers))
            nn.init.normal_(block.down.weight,std=.02/math.sqrt(2*layers))

    def forward(self, tokens):
        x = self.embedding(tokens)
        for block in self.blocks:
            x = block(x)
        return self.head(self.norm(x))

def make_optimizer(model, lr):
    matrices = [p for p in model.parameters() if p.ndim >= 2]
    norms = [p for p in model.parameters() if p.ndim < 2]
    return torch.optim.AdamW(
        [{"params": matrices, "weight_decay": .1},
         {"params": norms, "weight_decay": 0.0}],
        lr=lr, betas=(.9,.95), eps=1e-8,
    )

def batch(stream, generator, T, B=16):
    starts = torch.randint(len(stream)-T, (B,), generator=generator)
    indices = starts[:,None] + torch.arange(T+1)
    windows = stream[indices].to(device)
    return windows[:,:-1], windows[:,1:]

@torch.no_grad()
def evaluate(model, batches):
    was_training = model.training
    model.eval()
    losses = []
    for x,y in batches:
        with precision():
            logits = model(x)
            loss = F.cross_entropy(logits.float().flatten(0,1), y.flatten())
        losses.append(loss.item())
    model.train(was_training)
    return float(np.mean(losses))

def learning_rate(step, steps, warmup, peak):
    if step < warmup:
        return peak*(step+1)/warmup
    fraction = (step-warmup)/max(1,steps-1-warmup)
    return peak*(.1 + .9*(1+math.cos(math.pi*fraction))/2)

@torch.no_grad()
def generate(model, prompt, count=60, temperature=.8, seed=0):
    was_training = model.training
    model.eval()
    ids = tokenizer.encode(prompt).ids
    generator = torch.Generator().manual_seed(seed)
    for _ in range(count):
        tokens = torch.tensor([ids[-model.context:]],device=device)
        with precision():
            logits = model(tokens)[0,-1].float().cpu()
        next_id = torch.multinomial((logits/temperature).softmax(-1),
                                    1,generator=generator).item()
        if next_id == eos:
            break
        ids.append(next_id)
    model.train(was_training)
    return tokenizer.decode(ids)
```

### 生成领域文本并检查分词器适配程度

八个玩具系统提供不同工程词汇，第一个为案例中的泄压系统。随机组合原因、缓解措施、证据标签和时间声明，形成共享模板的不同文本。留出 300 篇不同文档，明确排除跨划分精确重复。共享模板使适配较容易，留出损失却不检验所生成论证是否合理。

```python
systems = [
    ("the pressure-relief system","a chemical plant","SIL 3",
     ["overpressure of the reactor vessel","a relief valve that fails to open",
      "a blocked vent line"]),
    ("a braking controller","a road vehicle","ASIL D",
     ["loss of braking","unintended braking","a stuck brake actuator"]),
    ("a reactor protection system","a power station","SIL 3",
     ["failure to shut down","a missed trip signal","a sensor disagreement"]),
    ("a flight control computer","an aircraft","DAL A",
     ["loss of control","an erroneous command","a frozen input"]),
    ("a railway interlocking","a railway station","SIL 3",
     ["a conflicting route","a wrong signal aspect","an unlocked point"]),
    ("a battery management system","a road vehicle","ASIL B",
     ["thermal runaway","overcharging","an isolation fault"]),
    ("a robot arm controller","a factory","SIL 2",
     ["unexpected motion","a trapped operator","an overspeed condition"]),
    ("a ventilator","a hospital","a specified integrity target",
     ["loss of airflow","excess pressure","a missed alarm"]),
]
causes = ["a stuck sensor","a corrupted message","a timing fault",
          "a failed actuator","an incorrect configuration","a software defect",
          "a disconnected cable","a power interruption"]
mitigations = ["a hardware watchdog that forces a safe state",
               "an independent shutdown channel","a checked redundant sensor",
               "a monitored interlock","a periodic diagnostic test",
               "a fail-safe actuator","a range and timing check"]
evidence = ["Fault tree analysis","Failure modes and effects analysis",
            "An integration test","A requirements review",
            "A fault-injection test","An independent assessment"]
rng = np.random.default_rng(0)
documents, seen = [], set()
while len(documents) < 3300:
    index = len(documents)%len(systems)
    system,environment,target,hazards = systems[index]
    hazard = hazards[0] if not documents else str(rng.choice(hazards))
    cause = str(rng.choice(causes))
    mitigation = str(rng.choice(mitigations))
    proof = str(rng.choice(evidence))
    delay = int(rng.choice([10,20,50,100,200,500,1000]))
    document = "\n".join([
        f"Context C1: The system is {system} operating in {environment}.",
        f"Goal G1: {system.capitalize()} is acceptably safe in its environment.",
        f"Context C2: The illustrative integrity target is {target}.",
        f"Strategy S1: Argue over identified hazards and their mitigations.",
        f"Goal G2: The hazard of {hazard} is acceptably mitigated.",
        f"Assumption A1: A single fault such as {cause} can initiate the hazard.",
        f"Strategy S2: Use {mitigation} and independent diagnostic coverage.",
        f"Goal G3: The fault is detected and a safe state reached within {delay} ms.",
        f"Solution Sn1: {proof} shows that {mitigation} detects the fault "
        f"within {delay} ms.",
        "Justification J1: The claimed evidence must be checked against the "
        "requirements, operating assumptions and configuration of the system.",
        "Context C3: This is synthetic tutorial text; the evidence is not real.",
    ])
    if document not in seen:
        documents.append(document)
        seen.add(document)
domain_train,domain_valid = documents[:3000],documents[3000:]
assert not set(domain_train)&set(domain_valid)
domain_data,_ = pack(domain_train)
domain_valid_data,_ = pack(domain_valid)
print(documents[0])
print("Domain tokens:",len(domain_data),"train;",len(domain_valid_data),"validation")

def tokens_per_word(tok,texts):
    encoded = tok.encode_batch(texts)
    return sum(len(x.ids) for x in encoded)/sum(len(x.split()) for x in texts)

mixed_texts = train_texts[:12000]+domain_train
mixed_tokenizer = train_tokenizer(mixed_texts)
fraction = sum(map(len,domain_train))/sum(map(len,mixed_texts))
fit = {}
for name,tok in [("story tokenizer",tokenizer),("mixed tokenizer",mixed_tokenizer)]:
    general = tokens_per_word(tok,valid_texts)
    domain = tokens_per_word(tok,domain_valid)
    fit[name] = dict(general=general,domain=domain)
    print(f"{name:16}: general {general:.3f}; domain {domain:.3f} tokens/word")
print(f"Domain character share of mixed-tokenizer training: {fraction:.1%}")
```

```output
Context C1: The system is the pressure-relief system operating in a chemical plant.
Goal G1: The pressure-relief system is acceptably safe in its environment.
Context C2: The illustrative integrity target is SIL 3.
Strategy S1: Argue over identified hazards and their mitigations.
Goal G2: The hazard of overpressure of the reactor vessel is acceptably mitigated.
Assumption A1: A single fault such as a disconnected cable can initiate the hazard.
Strategy S2: Use a periodic diagnostic test and independent diagnostic coverage.
Goal G3: The fault is detected and a safe state reached within 20 ms.
Solution Sn1: A requirements review shows that a periodic diagnostic test detects the fault within 20 ms.
Justification J1: The claimed evidence must be checked against the requirements, operating assumptions and configuration of the system.
Context C3: This is synthetic tutorial text; the evidence is not real.
Domain tokens: 1075107 train; 107470 validation
story tokenizer : general 1.296; domain 2.535 tokens/word
mixed tokenizer : general 1.304; domain 1.329 tokens/word
Domain character share of mixed-tokenizer training: 20.4%
```

混合数据分词器仅用于诊断。直接替换故事基座模型的 token ID，会改变嵌入和输出行含义。修改分词器需明确转换嵌入并追加训练；本实验保持原词表，隔离回放与学习率的影响。

### 训练小型基座模型并固定基线

在故事上训练 400 步，采用预热加余弦衰减、仅矩阵权重衰减及梯度裁剪。分别用十个固定 batch 评估通用和领域验证损失。此时就为玩具实验写定门槛：领域损失至少下降 1 奈特，通用损失最多上升 0.20 奈特。这是诊断门槛，不是真实案例的任务验收规则。

```python
config = dict(V=4096,d=128,layers=4,heads=4,ff=352,context=128)
torch.manual_seed(0)
base = GPT(**config).to(device)
print("Base parameters:",sum(p.numel() for p in base.parameters()))
optimizer = make_optimizer(base,3e-3)
generator = torch.Generator().manual_seed(0)
general_generator = torch.Generator().manual_seed(123)
domain_generator = torch.Generator().manual_seed(456)
general_batches = [batch(valid_data,general_generator,128) for _ in range(10)]
domain_batches = [batch(domain_valid_data,domain_generator,128) for _ in range(10)]
start = time.perf_counter()
for step in range(400):
    lr = learning_rate(step,400,30,3e-3)
    for group in optimizer.param_groups:
        group["lr"] = lr
    x,y = batch(train_data,generator,128)
    optimizer.zero_grad(set_to_none=True)
    with precision():
        logits = base(x)
        loss = F.cross_entropy(logits.float().flatten(0,1),y.flatten())
    loss.backward()
    nn.utils.clip_grad_norm_(base.parameters(),1.0)
    optimizer.step()
    if (step+1)%100 == 0:
        print(f"Base step {step+1}: training loss {loss.item():.4f}")
baseline = dict(general=evaluate(base,general_batches),
                domain=evaluate(base,domain_batches))
base_state = {key:value.detach().cpu().clone()
              for key,value in base.state_dict().items()}
print(f"Base time {time.perf_counter()-start:.1f}s; "
      f"general {baseline['general']:.4f}; domain {baseline['domain']:.4f}")
print("Gate fixed: domain reduction >= 1.00 nat; general rise <= 0.20 nat")
```

```output
Base parameters: 1328256
Base step 100: training loss 4.5289
Base step 200: training loss 4.0240
Base step 300: training loss 3.6192
Base step 400: training loss 3.5745
Base time 31.2s; general 3.5098; domain 7.0185
Gate fixed: domain reduction >= 1.00 nat; general rise <= 0.20 nat
```

### 从相同权重继续，改变回放与峰值学习率

每次继续训练采用新的 Adam 状态，预热 10 步，总更新 100 步。每条序列完全来自通用或领域数据；回放按序列做 Bernoulli 抽样，而非强制每 batch 精确比例。各次运行采用同一采样器种子，对齐候选窗口。重新评估相同留出 batch，再应用已定门槛。

```python
def continue_run(replay,peak):
    torch.manual_seed(0)
    model = GPT(**config).to(device)
    model.load_state_dict(base_state)
    optimizer = make_optimizer(model,peak)
    sampler = torch.Generator().manual_seed(0)
    actual_general = 0
    for step in range(100):
        mask = torch.rand(16,generator=sampler) < replay
        gx,gy = batch(train_data,sampler,128)
        dx,dy = batch(domain_data,sampler,128)
        mask_device = mask[:,None].to(device)
        x,y = torch.where(mask_device,gx,dx),torch.where(mask_device,gy,dy)
        actual_general += mask.sum().item()
        lr = learning_rate(step,100,10,peak)
        for group in optimizer.param_groups:
            group["lr"] = lr
        optimizer.zero_grad(set_to_none=True)
        with precision():
            logits = model(x)
            loss = F.cross_entropy(logits.float().flatten(0,1),y.flatten())
        loss.backward()
        nn.utils.clip_grad_norm_(model.parameters(),1.0)
        optimizer.step()
    general = evaluate(model,general_batches)
    domain = evaluate(model,domain_batches)
    rise = general-baseline["general"]
    reduction = baseline["domain"]-domain
    return model,dict(replay=replay,peak=peak,general=general,domain=domain,
                      general_rise=rise,domain_reduction=reduction,
                      actual_replay=actual_general/1600,
                      passes_gate=rise<=.20 and reduction>=1.00)

conditions = [("low / 0%",0,3e-4),("low / 10%",.1,3e-4),
              ("low / 30%",.3,3e-4),("high / 0%",0,3e-3),
              ("high / 30%",.3,3e-3)]
results, samples = {}, {}
print("Condition     general  domain  general rise  domain reduction  passes gate")
for name,replay,peak in conditions:
    adapted,result = continue_run(replay,peak)
    results[name] = result
    print(f"{name:12} {result['general']:8.3f} {result['domain']:7.3f} "
          f"{result['general_rise']:13.3f} {result['domain_reduction']:17.3f} "
          f"{str(result['passes_gate']):>12}")
    if name in ("low / 0%","low / 30%"):
        samples[name] = {prompt:generate(adapted,prompt)
                         for prompt in ("Goal G1:","Once upon a time")}
    del adapted

samples["base"] = {prompt:generate(base,prompt)
                   for prompt in ("Goal G1:","Once upon a time")}
Path("lab5-metrics.json").write_text(
    json.dumps(dict(config=config,baseline=baseline,tokenizer_fit=fit,
                    results=results,samples=samples),indent=2),encoding="utf8")
fig,ax = plt.subplots(figsize=(7.2,3.6))
colors = ["#D55E00","#E69F00","#009E73","#CC79A7","#0072B2"]
for (name,result),color in zip(results.items(),colors):
    ax.scatter(result["domain_reduction"],result["general_rise"],color=color,
               s=60,label=name)
ax.axhline(.20,color="gray",linestyle="--",label="General-loss gate")
ax.axvline(1.00,color="gray",linestyle=":")
ax.set(xlabel="Domain loss reduction (nats/token)",
       ylabel="General loss rise (nats/token)",
       title="Continued pretraining: adaptation and forgetting")
ax.legend(fontsize=8)
fig.tight_layout()
plt.show()
```

```output
Condition     general  domain  general rise  domain reduction  passes gate
low / 0%        4.554   2.331         1.044             4.688        False
low / 10%       3.779   2.466         0.269             4.553        False
low / 30%       3.643   2.706         0.133             4.312         True
high / 0%       9.191   0.117         5.681             6.902        False
high / 30%      3.797   0.176         0.287             6.843        False
```

### 将文本与定量测试进行比较

各提示和模型采用相同采样种子、温度及 token 上限。少量样本展示文本类型，比较则依靠留出损失和预定门槛。看似可信的安全论证仍可能包含伪造证据或无依据声明。

```python
for name in ("base","low / 0%","low / 30%"):
    for prompt,text in samples[name].items():
        print(name,"|",prompt,"|",text.replace("\n"," / "))
```

```output
base | Goal G1: | Goal G1:!" /  / The squirrel was so sad. She knew that he was scared and she looked down and wanted it. He was very angry and felt sad. He decided to do the stick and it shared it up. They soon smiled and said, "Look, that!" Lila thought for a while.
base | Once upon a time | Once upon a time, there was a little girl named Tim. Timmy loved to play with her friends. /  / She wanted to work his mommy. She went to the rope and decided to do the stick. The boy was very brave and soon he was always tired. So she could have to play with a toy,
low / 0% | Goal G1: | Goal G1: The its for me shoots anarely and a safe inone seArtped. / Context CSt: The red ms end. / Gooretate magfj. / LYor The Thidries in itstose a chegetstate
low / 0% | Once upon a time | Once upon a time, there was a little girl named Tim. / Tf€� was raining, Jane looked at the garden in a zoom ugg in a clxtion accidentally string. / Gooretate Snmet: The dist soon the stles Thaigss the clrate of a safe tra
low / 30% | Goal G1: | Goal G1: The its for me shoots a loud noise and a safe in a scared day. / Goed G1: A fauggor over 1: The end. /  Everyone had a smile and a great time. He thanked the bird and helped her mom that it was hurt. /  / "
low / 30% | Once upon a time | Once upon a time, there was a little girl named Tim. Timmy loved to play with her friends. One day, she saw a big storm old boy named Lily. Timmy loved to play with her friends. One morning, they went to the frog's house,ign. Lily was so happy to find a long time
```

### 预期观察

本次基座模型通用/领域损失为 3.510/7.019。低峰值学习率下，请求回放为 0%、10%、30% 时，通用损失分别上升 1.044、0.269、0.133，领域损失最终为 2.331、2.466、2.706，只有最后一个通过门槛。高峰值下，无回放使通用损失上升 5.681，领域降至 0.117；30% 回放将通用增幅降为 0.287、领域为 0.176，但仍超过 0.20 奈特上限。由于抽样，实际回放比例为 10.75%、31.0%。门槛判断发生在查看生成样本之前。

故事分词器将陌生工程词拆成多个片段。领域感知 BPE 可改善压缩，却不能直接替代基座 token 映射。继续训练可降低共享领域模板损失；无回放时，更新可能损害通用留出损失。回放与学习率表展示取舍，包括未通过的条件。

更大学习率可在相同步数预算内更快适配，也更远离基座模型。回放提供保留原分布的梯度，降低学习率则限制移动幅度；两者都不保证保留全部能力。这里采用固定分词器，检查点间损失可比较；跨分词器还需每字节比特数等共同单位。

### 进一步尝试

1. 先确定门槛，再提高回放比例。选择实际适配方案前，换种子重复，并在独立领域模板上评估。
2. 给仅领域训练的检查点增加通用数据恢复阶段，再测两类损失。恢复也可能抹去适配收益。
3. 用有记录的中英教程文本训练小型 BPE，保留两种语言的混合比例和测试文本。比较压缩，并解释已有基座模型采用任一新映射之前所需的嵌入转换。
