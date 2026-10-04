## 实验 4 — Llama 类模型的参数与 FLOP 计数器 {#lab4}

**目标。** 编写计数器，读取解码器配置（词表、宽度、深度、查询头、KV 头、前馈宽度、权重共享、偏置），返回参数量、按 [第 11 节](#s11) 约定的单 token FLOPs，以及单 token KV cache 大小。用三种方式验证：构造本模块的 `Decoder`，与 PyTorch 参数量比较；与从 GPT-2 small 到 Llama-3-8B 的五个开放模型的公布规模比较；若安装 Hugging Face `transformers`，再在 PyTorch meta 设备上构造参考模型，无需分配 8B 权重或下载。你将理解为何 $12Ld^2$ 规则对某模型误差不足 1%，对另一个却达 55%；小模型有多少参数用于嵌入；GQA 如何减少缓存；多长上下文下注意力不再可忽略。配置从各模型 `config.json` 手工录入，无需下载，运行只需几秒。

### 第 1 步 — 设置

计数本身不需要随机数，但本系列各实验都先固定种子，使构造的张量（这里是步骤 3 的解码器）每次相同。

```python
from dataclasses import dataclass

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

np.random.seed(0)
torch.manual_seed(0)
```

### 第 2 步 — 描述模型，然后对其进行计数

仅解码器 Transformer 可以用少数数值与开关描述：

- 词表大小 $V$，残差流宽度 $d$；
- 层数 $L$，每层具有 $h$ 宽度为 $d_{\text{head}} = d/h$ 的查询头和 $n_{kv}$ 键值头：$n_{kv} = h$ 是多头注意力，$1 < n_{kv} < h$ 是分组查询注意力， $n_{kv} = 1$ 是多查询注意力（[第 9 节](#s9)）；
- 前馈宽度 $d_{\text{ff}}$，以及前馈网络是 SwiGLU （三个矩阵）还是普通的两矩阵 MLP ([第 5 节](#s5))；
- 输出投影是否与输入嵌入共享权重；
- 哪些线性层有偏置；位置使用可学习表（GPT-2）还是无参数的 RoPE；归一化使用 LayerNorm（增益与偏置，共 $2d$ 个数）还是 RMSNorm（只有增益，共 $d$ 个数）。

计数器将各个块逐块相加，与 第 11 节 完全相同。每层都容纳

$$
\begin{aligned}
\text{attention} &= \underbrace{d \cdot h d_{\text{head}}}_{\mathbf{W}_Q}
 + \underbrace{2 \cdot d \cdot n_{kv} d_{\text{head}}}_{\mathbf{W}_K,\ \mathbf{W}_V}
 + \underbrace{h d_{\text{head}} \cdot d}_{\mathbf{W}_O} \quad (+\ \text{biases}), \\
\text{FFN} &= 3\, d\, d_{\text{ff}} \ \text{(SwiGLU)} \quad \text{或} \quad 2\, d\, d_{\text{ff}}
 \quad (+\ \text{biases}), \\
\text{归一化} &= 2 \times d \ \text{(RMSNorm)} \quad \text{或} \quad 2 \times 2d \ \text{(LayerNorm)},
\end{aligned}
$$

模型还需一次性添加 $Vd$ 个参数的 token 表；若输出不共享，再添加 $Vd$ 个参数；可学习位置表增加 $T_{\max} d$，最终归一化另计。这里各模型满足 $h d_{\text{head}} = d$，所以注意力项为 $2d^2 + 2d\,n_{kv} d_{\text{head}}$；多头注意力为 $4d^2$，分组查询则更少。

计数器也返回 $N_{\text{matmul}}$，即每个 token 参与矩阵乘法的参数量。它等于 $N_{\text{total}}$ 减去仅用于查找的表：不共享的输入嵌入与可学习位置表；读取第 $i$ 行不需要矩阵运算。共享词表仍计入 $N_{\text{matmul}}$，因为每个 token 都用它计算输出投影。字典分别列出单层和整个模型的数值，便于与论文对一个块的描述比较。

```python
@dataclass
class Cfg:
    name: str
    V: int                   # vocabulary size
    d: int                   # width of the residual stream
    L: int                   # number of layers (blocks)
    h: int                   # query heads
    n_kv: int                # key-value heads: h is multi-head, 1 is multi-query
    d_ff: int                # inner width of the feed-forward network
    tied: bool               # does the output projection reuse the input embedding?
    glu: bool = True         # SwiGLU (three matrices) or a plain two-matrix MLP
    bias: str = "none"       # "none", "qkv" (on W_Q, W_K, W_V only) or "all"
    learned_pos: int = 0     # rows of a learned position table (0 with RoPE)
    norm_bias: bool = False  # LayerNorm has a gain and a bias; RMSNorm a gain only
    published: str = "-"     # the size its authors quote


def count(cfg):
    """Parameters of a decoder-only transformer, itemised as in Section 11."""
    d_head = cfg.d // cfg.h
    q_width = cfg.h * d_head        # all query heads side by side (equals d here)
    kv_width = cfg.n_kv * d_head    # narrower than d under GQA and MQA

    # Attention: W_Q is d x q_width, W_K and W_V are d x kv_width, W_O is q_width x d.
    attention = cfg.d * q_width + 2 * cfg.d * kv_width + q_width * cfg.d
    if cfg.bias in ("qkv", "all"):
        attention += q_width + 2 * kv_width     # one bias per output unit
    if cfg.bias == "all":
        attention += cfg.d                      # and one on W_O

    # Feed-forward: W_1 and W_3 (d x d_ff) and W_2 (d_ff x d), or W_1 and W_2 only.
    mlp = (3 if cfg.glu else 2) * cfg.d * cfg.d_ff
    if cfg.bias == "all":
        mlp += (2 if cfg.glu else 1) * cfg.d_ff + cfg.d

    # Two norms per layer (before attention, before the FFN) and one at the end.
    one_norm = 2 * cfg.d if cfg.norm_bias else cfg.d
    per_layer = attention + mlp + 2 * one_norm

    token_table = cfg.V * cfg.d
    embeddings = token_table * (1 if cfg.tied else 2) + cfg.learned_pos * cfg.d
    total = embeddings + cfg.L * per_layer + one_norm

    # A lookup is not a matrix multiply: an untied input embedding and a position
    # table cost no FLOPs. A tied table stays in, because it is used once per
    # token as the output projection.
    lookups = (0 if cfg.tied else token_table) + cfg.learned_pos * cfg.d
    return {
        "attention_per_layer": attention,
        "mlp_per_layer": mlp,
        "norms_per_layer": 2 * one_norm,
        "embeddings": embeddings,
        "attention": cfg.L * attention,
        "mlp": cfg.L * mlp,
        "norms": cfg.L * 2 * one_norm + one_norm,
        "total": total,
        "n_matmul": total - lookups,
    }


llama2 = Cfg("Llama-2-7B", V=32000, d=4096, L=32, h=32, n_kv=32, d_ff=11008,
             tied=False, published="6.7B")
c = count(llama2)
layer = c["attention_per_layer"] + c["mlp_per_layer"] + c["norms_per_layer"]
print(f"attention per layer   {c['attention_per_layer']:>15,}")
print(f"FFN per layer         {c['mlp_per_layer']:>15,}")
print(f"norms per layer       {c['norms_per_layer']:>15,}")
print(f"one layer             {layer:>15,}")
print(f"{llama2.L} layers             {llama2.L * layer:>15,}")
print(f"embeddings (untied)   {c['embeddings']:>15,}")
print(f"final norm            {llama2.d:>15,}")
print(f"N_total               {c['total']:>15,}")
print(f"N_matmul              {c['n_matmul']:>15,}")
```

```output
attention per layer        67,108,864
FFN per layer             135,266,304
norms per layer                 8,192
one layer                 202,383,360
32 layers               6,476,267,520
embeddings (untied)       262,144,000
final norm                      4,096
N_total                 6,738,415,616
N_matmul                6,607,343,616
```

各项都可手算复核。注意力包含四个 $4096 \times 4096$ 矩阵，共 $4 \times 16{,}777{,}216 = 67{,}108{,}864$；SwiGLU 包含三个 $4096 \times 11{,}008$ 矩阵，共 $135{,}266{,}304$，略多于近似规则的 $8d^2 = 134{,}217{,}728$，因为 $11{,}008$ 是将 $\tfrac{8}{3}d = 10{,}922.7$ 向上取整为 256 的倍数。两个 RMSNorm 增益共 $2 \times 4{,}096 = 8{,}192$。三十二层、两个不共享的 $32{,}000 \times 4{,}096$ 表、最终归一化共 $6{,}738{,}415{,}616$，即 Llama 2 论文的 6.7B。减去仅查找的输入表，剩下 $N_{\text{matmul}} = 6{,}607{,}343{,}616$，用于步骤 7 的 FLOP 乘法计数。

### 步骤 3 — 用 PyTorch 验证计数器

公式需要验证，最可靠的检查之一是实际构造模型：PyTorch 能统计它分配的参数张量。下面代码与 [第 12 节](#s12) 的 `Decoder` 相同，只重新排版为每行 88 字符；初始化和 [实验 5](#lab5) 使用的 `causal` 开关也保留。两者都不影响参数计数。

构造两种大小：模块默认配置（词表 4,096、$d = 256$、四层、八个查询头、两个 KV 头），以及实验 5 的配置（词表 46、$d = 128$、四层、四个查询头、两个 KV 头）。将计数器与张量元素总数比较。输出投影与输入嵌入为同一个张量（`self.head.weight = self.emb.weight`），`model.parameters()` 只遍历每个张量一次，因此共享矩阵只计一次。若逐模块累加各自权重，会重复计数；最后一行展示这种错误脚本的结果。

```python
def rope(x, base=10000.0):
    """x: (B, h, T, dk). Rotate pairs of dims by position-dependent angles."""
    B, h, T, dk = x.shape
    theta = base ** (-torch.arange(0, dk, 2, device=x.device) / dk)   # (dk/2,)
    ang = torch.arange(T, device=x.device)[:, None] * theta[None, :]   # (T, dk/2)
    cos, sin = ang.cos()[None, None], ang.sin()[None, None]
    x1, x2 = x[..., 0::2], x[..., 1::2]
    return torch.stack([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1).flatten(-2)


class Attention(nn.Module):
    def __init__(self, d, n_heads, n_kv_heads, causal=True):
        super().__init__()
        self.h, self.kv, self.dk = n_heads, n_kv_heads, d // n_heads
        self.causal = causal
        self.wq = nn.Linear(d, d, bias=False)
        self.wk = nn.Linear(d, n_kv_heads * self.dk, bias=False)
        self.wv = nn.Linear(d, n_kv_heads * self.dk, bias=False)
        self.wo = nn.Linear(d, d, bias=False)

    def forward(self, x):
        B, T, d = x.shape
        q = self.wq(x).view(B, T, self.h, self.dk).transpose(1, 2)    # (B, h, T, dk)
        k = self.wk(x).view(B, T, self.kv, self.dk).transpose(1, 2)
        v = self.wv(x).view(B, T, self.kv, self.dk).transpose(1, 2)
        q, k = rope(q), rope(k)
        k = k.repeat_interleave(self.h // self.kv, dim=1)    # grouped-query: share KV
        v = v.repeat_interleave(self.h // self.kv, dim=1)
        y = F.scaled_dot_product_attention(q, k, v, is_causal=self.causal)
        return self.wo(y.transpose(1, 2).reshape(B, T, d))


class Block(nn.Module):
    def __init__(self, d, n_heads, n_kv_heads, d_ff, causal=True):
        super().__init__()
        self.n1, self.n2 = nn.RMSNorm(d), nn.RMSNorm(d)
        self.attn = Attention(d, n_heads, n_kv_heads, causal)
        self.w1 = nn.Linear(d, d_ff, bias=False)
        self.w3 = nn.Linear(d, d_ff, bias=False)
        self.w2 = nn.Linear(d_ff, d, bias=False)

    def forward(self, x):
        x = x + self.attn(self.n1(x))                           # pre-norm residual
        h = self.n2(x)
        return x + self.w2(F.silu(self.w1(h)) * self.w3(h))    # SwiGLU feed-forward


class Decoder(nn.Module):
    def __init__(self, vocab, d=256, layers=4, n_heads=8, n_kv_heads=2, d_ff=None,
                 causal=True):
        super().__init__()
        d_ff = d_ff or int(8 * d / 3)
        self.emb = nn.Embedding(vocab, d)
        self.blocks = nn.ModuleList(Block(d, n_heads, n_kv_heads, d_ff, causal)
                                    for _ in range(layers))
        self.norm = nn.RMSNorm(d)
        self.head = nn.Linear(d, vocab, bias=False)
        self.head.weight = self.emb.weight                          # tied embeddings
        nn.init.normal_(self.emb.weight, std=0.02)    # keeps step-0 logits small

    def forward(self, tokens):                                  # tokens: (B, T) ints
        x = self.emb(tokens)
        for b in self.blocks:
            x = b(x)
        return self.head(self.norm(x))                          # logits: (B, T, vocab)


tiny = Cfg("tiny decoder", V=4096, d=256, L=4, h=8, n_kv=2, d_ff=int(8 * 256 / 3),
           tied=True)
lab5 = Cfg("Lab 5 decoder", V=46, d=128, L=4, h=4, n_kv=2, d_ff=int(8 * 128 / 3),
           tied=True)
for cfg in (tiny, lab5):
    model = Decoder(vocab=cfg.V, d=cfg.d, layers=cfg.L, n_heads=cfg.h,
                    n_kv_heads=cfg.n_kv)
    in_torch = sum(p.numel() for p in model.parameters())   # shared tensor: once
    print(f"{cfg.name:<14} d_ff {cfg.d_ff:>3}   counter {count(cfg)['total']:>10,}"
          f"   PyTorch {in_torch:>10,}")

model = Decoder(vocab=4096)
print("head and embedding are one tensor:", model.head.weight is model.emb.weight)
twice = sum(p.numel() for _, p in model.named_parameters(remove_duplicate=False))
print(f"counting the shared matrix twice would give {twice:,}")
```

```output
tiny decoder   d_ff 682   counter  3,801,344   PyTorch  3,801,344
Lab 5 decoder  d_ff 341   counter    727,424   PyTorch    727,424
head and embedding are one tensor: True
counting the shared matrix twice would give 4,849,920
```

计数器与 PyTorch 在两种配置上完全一致：3,801,344 是第 12 节的“约 3.8M”，727,424 是实验 5 的模型。注意 `d_ff`：$\tfrac{8}{3} \times 256 = 682.7$、$\tfrac{8}{3} \times 128 = 341.3$，`int` 将二者截断。共享矩阵若计两次，会额外增加 $4{,}096 \times 256 = 1{,}048{,}576$ 个参数，夸大 28%；从 `state_dict` 计数时容易出现这一错误，因为共享张量列在两个名称下。[练习 12](#e12) 要求手工逐项算出 3,801,344；可在步骤 4 前完成，并与 `count(tiny)` 返回的字典逐项比较。

### 步骤 4 — 对照公开模型配置

接下来检查公开模型。以下配置来自各模型 `config.json`，各有 $12Ld^2$ 规则未考虑的特征：

- **GPT-2 小**（2019）：多头注意力，宽度为 $4d$ 的 GELU MLP，每个线性层上的偏差，带有偏差的 LayerNorm，1,024 个位置的学习表，共享嵌入。
- **SmolLM2-135M**：九个查询头共享三个 KV 头，宽度为 $1{,}536 = \tfrac{8}{3}d$ 的 SwiGLU 网络，共享嵌入。
- **Qwen2.5-0.5B**：十四个查询头共享两个 KV 头，仅 $\mathbf{W}_Q$、$\mathbf{W}_K$、$\mathbf{W}_V$ 有偏置；SwiGLU 很宽（$4{,}864 \approx 5.4d$），词表 151,936 个 token，嵌入共享。
- **Llama-2-7B**：步骤 2 的配置。
- **Llama-3-8B**：32 个查询头共享 8 个 KV 头，SwiGLU 宽度 $14{,}336 = 3.5d$，词表包含 128,256 个 token，输入与输出权重不共享。

代码打印各模型精确计数、$12Ld^2$ 估计、非嵌入参数与该估计的比值、嵌入占比（token 表及 GPT-2 位置表），以及论文规模。第二张表用 $d^2$ 为单位表示一层，从而解释近似规则为何有偏差。

```python
configs = [
    tiny,
    Cfg("GPT-2 small", V=50257, d=768, L=12, h=12, n_kv=12, d_ff=3072, tied=True,
        glu=False, bias="all", learned_pos=1024, norm_bias=True, published="124M"),
    Cfg("SmolLM2-135M", V=49152, d=576, L=30, h=9, n_kv=3, d_ff=1536, tied=True,
        published="135M"),
    Cfg("Qwen2.5-0.5B", V=151936, d=896, L=24, h=14, n_kv=2, d_ff=4864, tied=True,
        bias="qkv", published="0.49B"),
    llama2,
    Cfg("Llama-3-8B", V=128256, d=4096, L=32, h=32, n_kv=8, d_ff=14336, tied=False,
        published="8B"),
]

print(f"{'model':<16}{'N_total':>15}{'12Ld^2':>15}{'ratio':>7}{'emb':>7}"
      f"{'published':>11}")
for cfg in configs:
    c = count(cfg)
    rule = 12 * cfg.L * cfg.d ** 2
    non_embedding = c["total"] - c["embeddings"]
    print(f"{cfg.name:<16}{c['total']:>15,}{rule:>15,}{non_embedding / rule:>7.3f}"
          f"{c['embeddings'] / c['total']:>7.1%}{cfg.published:>11}")

print("\none layer in units of d^2 (the rule assumes 4 + 8 = 12)")
for cfg in configs:
    c = count(cfg)
    d2 = cfg.d ** 2
    print(f"{cfg.name:<16} attention {c['attention_per_layer'] / d2:5.2f}"
          f"   FFN {c['mlp_per_layer'] / d2:5.2f}"
          f"   layer {(c['attention_per_layer'] + c['mlp_per_layer']) / d2:5.2f}")
```

```output
model                   N_total         12Ld^2  ratio    emb  published
tiny decoder          3,801,344      3,145,728  0.875  27.6%          -
GPT-2 small         124,439,808     84,934,656  1.001  31.6%       124M
SmolLM2-135M        134,515,008    119,439,360  0.889  21.0%       135M
Qwen2.5-0.5B        494,032,768    231,211,008  1.548  27.6%      0.49B
Llama-2-7B        6,738,415,616  6,442,450,944  1.005   3.9%       6.7B
Llama-3-8B        8,030,261,248  6,442,450,944  1.083  13.1%         8B

one layer in units of d^2 (the rule assumes 4 + 8 = 12)
tiny decoder     attention  2.50   FFN  7.99   layer 10.49
GPT-2 small      attention  4.01   FFN  8.01   layer 12.01
SmolLM2-135M     attention  2.67   FFN  8.00   layer 10.67
Qwen2.5-0.5B     attention  2.29   FFN 16.29   layer 18.57
Llama-2-7B       attention  4.00   FFN  8.06   layer 12.06
Llama-3-8B       attention  2.50   FFN 10.50   layer 13.00
```

每个计数都四舍五入到其作者引用的大小，并且每个与规则的偏离都可以从第二个表中读出。在分组下，$\mathbf{W}_K$和$\mathbf{W}_V$将$d$映射到$n_{kv} d_{\text{head}} = (n_{kv}/h)\,d$维度，因此注意力成本为$2d^2 + 2d^2 n_{kv}/h$ $4d^2$：$2 + 2/3 = 2.67$ 用于 SmolLM2（三个 KV 头对应 9 个），$2 + 2/7 = 2.29$ 用于 Qwen2.5（两个对应 14 个），$2 + 2/4 = 2.5$ 用于 Llama-3 和小型解码器（两个对应 8 个）。前馈网络的成本为 $3 d_{\text{ff}}/d$，单位为 $d^2$：当 $d_{\text{ff}} = \tfrac{8}{3}d$ (SmolLM2) 时恰好为 8，对于 Llama-3 为 $3 \times 3.5 = 10.5$，$3 \times 5.43 = 16.29$ 对于 Qwen2.5，其前馈网络本身就大于规则的整个层。因此，SmolLM2-135M 的非嵌入计数比规则低 11%，Qwen2.5-0.5B 比规则高 55%，而对于 GPT-2 Small 和 Llama-2-7B（这两个模型按照规则假设的方式构建），其误差在 0.5% 以内。

嵌入列解释了另一半原因。50,000–150,000 个 token 的词表，乘以 576–896 的宽度，就是数千万参数；所以小模型的五分之一到三分之一用于嵌入，Llama-2-7B 则不到 4%。Llama-3-8B 升回 13%，因为词表是 Llama 2 的四倍，且输入与输出不共享。第 11 节的结论是按配置计数；近似规则只适合满足 $d_{\text{ff}} \approx \tfrac{8}{3}d$（SwiGLU）或 $4d$（GELU）的较大多头模型，并应标明是估计。

### 步骤 5 — 每个 token 的 KV cache

生成时，每层保存此前所有 token 的键和值（[第 9 节](#s9)），因此每新增一个 token，缓存增加量为

$$
\text{bytes per token} = 2 \times L \times n_{kv} \times d_{\text{head}} \times
\text{bytes per value},
$$

因子 2 计入 K 与 V，bf16 每值占 2 字节。查询头数不出现，因为只存储 $n_{kv}$ 个 KV 头。与第 9 节相同，张量大小用二进制单位（1 KiB = 1,024 B，1 MiB = $2^{20}$ B，1 GiB = $2^{30}$ B），后续第 07–10 模块引用时同时给出十进制 GB。代码后半固定 Llama-2-7B 配置，只改变 $n_{kv}$，比较长度 4,096 的单序列缓存与权重；图 6.19 使用这一结果。

```python
def kv_cache_bytes_per_token(cfg, bytes_per_value=2):
    """K and V of one token, in every layer and every KV head (bf16: 2 bytes)."""
    d_head = cfg.d // cfg.h
    return 2 * cfg.L * cfg.n_kv * d_head * bytes_per_value


print(f"{'model':<16}{'KV heads':>9}{'bytes/token':>13}{'KiB':>8}")
for cfg in configs:
    per_token = kv_cache_bytes_per_token(cfg)
    print(f"{cfg.name:<16}{cfg.n_kv:>9}{per_token:>13,}{per_token / 1024:>8.1f}")

seq_len = 4096
print(f"\none {seq_len:,}-token sequence at the Llama-2-7B shape, bf16")
for label, n_kv in (("multi-head, 32 KV heads", 32), ("grouped, 8 KV heads", 8),
                    ("multi-query, 1 KV head", 1)):
    shape = Cfg(label, V=32000, d=4096, L=32, h=32, n_kv=n_kv, d_ff=11008,
                tied=False)
    per_token = kv_cache_bytes_per_token(shape)
    per_sequence = per_token * seq_len
    print(f"{label:<24}{per_token:>9,} B/token {per_sequence / 2**20:>7,.0f} MiB"
          f"  ({per_sequence / 1e9:.3f} GB)")
weight_bytes = count(llama2)["total"] * 2
print(f"Llama-2-7B weights in bf16: {weight_bytes / 1e9:.1f} GB"
      f" ({weight_bytes / 2**30:.1f} GiB)")
```

```output
model            KV heads  bytes/token     KiB
tiny decoder            2        1,024     1.0
GPT-2 small            12       36,864    36.0
SmolLM2-135M            3       23,040    22.5
Qwen2.5-0.5B            2       12,288    12.0
Llama-2-7B             32      524,288   512.0
Llama-3-8B              8      131,072   128.0

one 4,096-token sequence at the Llama-2-7B shape, bf16
multi-head, 32 KV heads   524,288 B/token   2,048 MiB  (2.147 GB)
grouped, 8 KV heads       131,072 B/token     512 MiB  (0.537 GB)
multi-query, 1 KV head     16,384 B/token      64 MiB  (0.067 GB)
Llama-2-7B weights in bf16: 13.5 GB (12.6 GiB)
```

缓存取决于 KV 头，并不直接取决于参数量。GPT-2 small 保留全部 12 个头，每 token 缓存是参数量约大四倍的 Qwen2.5-0.5B 的三倍；后者十四个查询头只共享两个 KV 头。Llama-2-7B 的 4,096-token 序列缓存为 2,048 MiB = 2 GiB（2.15 GB），是 12.6 GiB 权重的六分之一；约六条并发序列的缓存就与权重一样大。八个 KV 头（Llama-3-8B 布局）将缓存降四倍至 512 MiB，再降到一个 KV 头可减少八倍至 64 MiB。缓存与权重的比例影响服务器 batch 中可容纳的请求数，[第 10 模块](module_10_ZH.html) 据此构建内存预算。

### 步骤 6 — 在 meta 设备上验证参考实现

公布规模经过取整，不能核对最后一位。Hugging Face `transformers` 的参考实现无需下载权重。在 PyTorch 的 **meta 设备**上，张量只有形状和 dtype，没有数据存储；在 `with torch.device("meta"):` 中构造模型，会执行构造函数并注册参数，不分配权重。8B 模型可以在几分之一秒内、仅用少量元数据构造。配置类使用与 `Cfg` 相同的数值。GPT-2 默认配置就是 small；SmolLM2 与两个 Llama 使用 Llama 类；Qwen2.5 使用 Qwen2 类，为查询、键、值投影添加偏置。未安装 `transformers` 时，代码提示后继续其他步骤。

```python
try:
    from transformers import (GPT2Config, GPT2LMHeadModel, LlamaConfig,
                              LlamaForCausalLM, Qwen2Config, Qwen2ForCausalLM)
    have_transformers = True
except ImportError:
    have_transformers = False
    print("transformers is not installed: skipping the cross-check")


def reference_model(cfg):
    """The Hugging Face implementation of a configuration (weights not allocated
    when built on the meta device)."""
    if cfg.name == "GPT-2 small":
        return GPT2LMHeadModel(GPT2Config())       # the defaults are GPT-2 small
    shape = dict(vocab_size=cfg.V, hidden_size=cfg.d, intermediate_size=cfg.d_ff,
                 num_hidden_layers=cfg.L, num_attention_heads=cfg.h,
                 num_key_value_heads=cfg.n_kv, tie_word_embeddings=cfg.tied)
    if cfg.bias == "qkv":
        return Qwen2ForCausalLM(Qwen2Config(**shape))
    return LlamaForCausalLM(LlamaConfig(**shape))


if have_transformers:
    for cfg in configs[1:]:
        with torch.device("meta"):         # shapes only: no memory is allocated
            reference = reference_model(cfg)
        n_reference = sum(p.numel() for p in reference.parameters())
        verdict = "same" if n_reference == count(cfg)["total"] else "DIFFERENT"
        print(f"{cfg.name:<14} transformers {n_reference:>15,}   counter "
              f"{count(cfg)['total']:>15,}   {verdict}")
```

```output
GPT-2 small    transformers     124,439,808   counter     124,439,808   same
SmolLM2-135M   transformers     134,515,008   counter     134,515,008   same
Qwen2.5-0.5B   transformers     494,032,768   counter     494,032,768   same
Llama-2-7B     transformers   6,738,415,616   counter   6,738,415,616   same
Llama-3-8B     transformers   8,030,261,248   counter   8,030,261,248   same
```

五个模型的参数量全部一致。参考实现由其他人为其他目的编写，所以一致性检验了计数器的假设：偏置的位置、GPT-2 位置表和 LayerNorm 偏置的计数，以及输入输出表究竟是否共享。

### 第 7 步 — 每个 token 的前向 FLOPs

第 11 节约定，$(m \times n)$ 与 $(n \times p)$ 矩阵相乘需 $2mnp$ FLOPs，每项计一次乘法与一次加法。单 token 时 $m = 1$，所以 $N_{\text{matmul}}$ 中每个权重参与一次乘加，矩阵成本为 $2N_{\text{matmul}}$ FLOP。注意力还添加两项无参数乘积。上下文 $t$ 时，查询给 $t$ 个键打分，每层跨头共 $2td$ FLOPs（因为 $h d_{\text{head}} = d$），再以 $2td$ FLOPs 混合 $t$ 个值；$L$ 层共 $4Ldt$。因果掩码下，位置 $t$ 只看到 $t$ 个键，长度 $T$ 序列的平均为

$$
\frac{1}{T}\sum_{t=1}^{T} 4Ldt = 4Ld\,\frac{T+1}{2} \approx 2LdT,
$$

前提是 kernel 跳过被屏蔽的一半，就像 FlashAttention 的因果分块所做的那样 ([第 10 节](#s10))。下面的函数实现了这两种形式，并且在 `train=True` 的情况下，实现了步骤 8 的 3 的因子。最后两行找到了注意力成本与矩阵相乘一样多的地方。对于一个 token，$4Ldt = 2N_{\text{matmul}}$ 给出 $t = N_{\text{matmul}}/(2Ld)$；与 $N_{\text{matmul}} \approx 12Ld^2$ 是 $t \approx 6d$。对因果序列进行平均，$2LdT = 2N_{\text{matmul}}$ 给出 $T = N_{\text{matmul}}/(Ld) \approx 12d$。

```python
def flops_per_token(cfg, t, causal_avg=False, train=False):
    """Section 11's convention. With causal_avg=False, t is the context of one token;
    with causal_avg=True, t is the length T of a causally masked sequence and the
    attention term is the average over its positions."""
    matmul = 2 * count(cfg)["n_matmul"]
    if causal_avg:
        attention = 2 * cfg.L * cfg.d * t
    else:
        attention = 4 * cfg.L * cfg.d * t
    forward = matmul + attention
    return 3 * forward if train else forward


GFLOP = 1e9
matmul = flops_per_token(llama2, 0)
print(f"matrix multiplies, 2 N_matmul: {matmul / GFLOP:.2f} GFLOP per token")
for t in (512, 4096, 32768):
    attention = flops_per_token(llama2, t) - matmul
    print(f"one token at context {t:>6,}: attention {attention / GFLOP:5.2f} GFLOP,"
          f" {attention / (matmul + attention):5.1%} of its total,"
          f" +{attention / matmul:.1%} on the matmuls")
average = flops_per_token(llama2, 4096, causal_avg=True) - matmul
print(f"causal 4,096-token sequence, average: attention {average / GFLOP:.2f} GFLOP,"
      f" +{average / matmul:.1%}")

t_cross = matmul / (4 * llama2.L * llama2.d)
T_cross = matmul / (2 * llama2.L * llama2.d)
print(f"one token: attention = matmuls at t = {t_cross:,.0f}"
      f"   (rule 6d = {6 * llama2.d:,})")
print(f"causal average: attention = matmuls at T = {T_cross:,.0f}"
      f"   (rule 12d = {12 * llama2.d:,})")
```

```output
matrix multiplies, 2 N_matmul: 13.21 GFLOP per token
one token at context    512: attention  0.27 GFLOP,  2.0% of its total, +2.0% on the matmuls
one token at context  4,096: attention  2.15 GFLOP, 14.0% of its total, +16.3% on the matmuls
one token at context 32,768: attention 17.18 GFLOP, 56.5% of its total, +130.0% on the matmuls
causal 4,096-token sequence, average: attention 1.07 GFLOP, +8.1%
one token: attention = matmuls at t = 25,205   (rule 6d = 24,576)
causal average: attention = matmuls at T = 50,410   (rule 12d = 49,152)
```

上下文 512 个 token 时，注意力仅占 2%，几乎可忽略。在完整 4,096 上下文的最后 token，注意力占总 FLOPs 的 14%（在矩阵乘法成本上增加 16%）；整个训练序列平均只增加 8.1%，因为各位置平均只看到一半上下文。32,768 时，注意力超过总计算的一半。精确交叉点 25,205、50,410 比近似 $6d$、$12d$ 高 2.6%，因为 $N_{\text{matmul}}$ 比 $12Ld^2$ 大 2.6%，包含输出投影（$Vd = 131{,}072{,}000$）和略宽的 FFN。

### 第 8 步 — 每个 token 的训练 FLOPs

层 $\mathbf{Y} = \mathbf{X}\mathbf{W}$ 的反向传播计算两个乘积，其主导计算量都与前向相同：$\partial\mathcal{L}/\partial\mathbf{X} = (\partial\mathcal{L}/\partial\mathbf{Y})\,\mathbf{W}^\top$ 传递梯度，$\partial\mathcal{L}/\partial\mathbf{W} = \mathbf{X}^\top(\partial\mathcal{L}/\partial\mathbf{Y})$ 计算权重梯度。注意力的两项无参数乘积也如此，所以训练约需三次前向，即每 token $6N_{\text{matmul}} + 6LdT$，对长度 $T$ 的因果序列取平均（第 11 节推导）。常用简化公式 $6N_{\text{total}}$ 计入全部参数、忽略注意力。代码在 Llama-2-7B 的训练长度 4,096 下比较二者，并拆分两种误差来源。

```python
T = 4096
convention = flops_per_token(llama2, T, causal_avg=True, train=True)
shortcut = 6 * count(llama2)["total"]
matmul_part = 6 * count(llama2)["n_matmul"]
attention_part = 6 * llama2.L * llama2.d * T
lookup_part = 6 * llama2.V * llama2.d        # the input embedding: never multiplied
print(f"convention, 6 N_matmul + 6LdT: {matmul_part / GFLOP:.2f}"
      f" + {attention_part / GFLOP:.2f} = {convention / GFLOP:.2f} GFLOP per token")
print(f"shortcut, 6 N_total:           {shortcut / GFLOP:.2f} GFLOP per token,"
      f" {(convention - shortcut) / convention:.1%} low")
print(f"  counts the input embedding:  +{lookup_part / GFLOP:.2f} GFLOP never spent")
print(f"  leaves out attention:        -{attention_part / GFLOP:.2f} GFLOP")
```

```output
convention, 6 N_matmul + 6LdT: 39.64 + 3.22 = 42.87 GFLOP per token
shortcut, 6 N_total:           40.43 GFLOP per token, 5.7% low
  counts the input embedding:  +0.79 GFLOP never spent
  leaves out attention:        -3.22 GFLOP
```

简化公式有两个反向误差：为只需查找的输入嵌入错误计入每 token 0.79 GFLOP，又漏掉注意力的 3.22 GFLOP。两者不抵消，$6N_{\text{total}}$ 比本模块约定低 5.7%。作为初步估计已足够接近，所以常被采用；但计算利用率时，该差别仍有意义。[练习 13](#e13) 将单 token 成本换算为整个 Llama 2 训练的计算预算与 GPU 利用率；用 $6ND$ 规划预算则是 [第 08 模块](module_08_ZH.html) 的内容。

### 第 9 步 — 参数所在位置

将步骤 4 的表变成图：各公开模型一根条形，归一化为 100%，分为嵌入、注意力、前馈网络、归一化，总数标在末端。这就是第 11 节的图 6.23。归一化不足各模型的 0.1%，因此比条形轮廓还薄。

```python
published = configs[1:]
parts = ["embeddings", "attention", "mlp", "norms"]
part_names = {"embeddings": "embeddings", "attention": "attention",
              "mlp": "feed-forward", "norms": "norms"}
colours = {"embeddings": "#2563EB", "attention": "#C2410C",
           "mlp": "#7E22CE", "norms": "#15803D"}


def short(n):
    """124439808 -> '124.4M', 6738415616 -> '6.74B'."""
    return f"{n / 1e9:.2f}B" if n >= 1e9 else f"{n / 1e6:.1f}M"


fig, ax = plt.subplots(figsize=(8, 3.6))
for row, cfg in enumerate(published):
    c = count(cfg)
    left = 0.0
    for part in parts:
        share = 100 * c[part] / c["total"]
        ax.barh(row, share, left=left, height=0.6, color=colours[part],
                edgecolor="white", linewidth=1.5,
                label=part_names[part] if row == 0 else None)
        left += share
    ax.text(101.5, row, short(c["total"]), va="center", fontsize=10)
ax.set_yticks(range(len(published)), [cfg.name for cfg in published])
ax.invert_yaxis()                      # first model at the top
ax.set_xlim(0, 112)
ax.set_xticks(range(0, 101, 20))
ax.set_xlabel("share of all parameters (%)")
ax.set_title("Where the parameters are: five published decoders")
ax.legend(ncols=4, loc="upper center", bbox_to_anchor=(0.45, -0.2), frameon=False)
plt.tight_layout()
plt.show()
```

三个小模型有五分之一到三分之一用于嵌入（SmolLM2 21%、Qwen2.5 28%、GPT-2 32%）。Llama-2-7B 几乎全部是层，而每层约三分之二是 FFN。Qwen2.5-0.5B 的注意力占比最小，因为分组减少注意力参数，同时很宽的 FFN 增大了其他部分。

### 步骤 10 — 注意力与矩阵乘法的成本

最后绘制步骤 7 的结果，上下文长度在对数轴上从 512 到 131,072：固定的矩阵乘法成本、上下文 $t$ 下单 token 的注意力成本与总成本、长度 $T$ 因果序列的平均注意力成本。两条竖线标出交叉点，对应图 6.24。

```python
contexts = np.logspace(np.log10(512), np.log10(131072), 200)
matmul_g = np.full_like(contexts, matmul / GFLOP)
one_token_g = 4 * llama2.L * llama2.d * contexts / GFLOP
causal_avg_g = 2 * llama2.L * llama2.d * contexts / GFLOP

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(contexts, matmul_g, color="#1A2E4A", label="matrix multiplies, 2 N_matmul")
ax.plot(contexts, one_token_g, color="#C2410C",
        label="attention, one token at context t (4Ldt)")
ax.plot(contexts, matmul_g + one_token_g, color="#2563EB",
        label="total for that token")
ax.plot(contexts, causal_avg_g, color="#15803D", linestyle="--",
        label="attention, average over a causal sequence of length T (2LdT)")
# mark the crossovers; the labels sit on opposite sides so that they never overlap
for x, text, side in ((t_cross, f"t = {t_cross:,.0f}\n(6d = {6 * llama2.d:,})", "right"),
                      (T_cross, f"T = {T_cross:,.0f}\n(12d = {12 * llama2.d:,})", "left")):
    ax.axvline(x, color="#94A3B8", linewidth=1, linestyle=":")
    nudge = 0.95 if side == "right" else 1.05
    ax.text(x * nudge, 76, text, ha=side, fontsize=9, color="#475569")
ax.set_xscale("log")
ax.set_xlim(512, 131072)
ax.set_ylim(0, 85)
ax.set_xlabel("context length (tokens, log scale)")
ax.set_ylabel("forward GFLOP per token")
ax.set_title("Llama-2-7B: attention overtakes the matrix multiplies at about 6d")
ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.14), ncols=2, fontsize=9,
          frameon=False)
plt.tight_layout()
plt.show()
```

从左到右看图：上下文只有几千 token 时，总成本接近平线，“每参数每 token 两次 FLOP”很准确。单 token 注意力线在 $t = 25{,}205$ 与平线相交，之后注意力比全部模型权重的乘法还贵；因果平均在两倍距离 $T = 50{,}410$ 相交。两条注意力曲线对 $t$ 都是线性，因此在对数横轴上向上弯曲：上下文加倍，注意力项加倍，矩阵乘法项不变。

### 预期观察

- 计数器与模块的两个解码器（3,801,344 和 727,424）的 PyTorch 参数以及所有五个已发布模型的参考实现一致，并且每个计数四舍五入到其作者引用的大小：124M、135M、0.49B、6.7B 和 8B。
- 对于 GPT-2 Small 和 Llama-2-7B，非嵌入计数在 $12Ld^2$ 规则的 0.5% 范围内，这两个模型是按照规则假设构建的（多头注意力，前馈网络约为 $8d^2$），但 SmolLM2-135M 比它低 11%，Qwen2.5-0.5B 比它高 55%：分组查询注意力每层删除最多 $2d^2$，宽前馈网络添加 $3 d_{\text{ff}}/d - 8$ 个 $d^2$ 单位。
- 小模型的五分之一到三分之一用于嵌入，Llama-2-7B 不足 4%；Llama-3-8B 更大的词表和不共享的权重使其回升至 13%。
- KV cache 遵循 KV 头的数量：对于 Llama-2-7B 的 32 个头，每个 token 512 KiB；对于 Llama-3-8B 的 8 个头，每个 token 128 KiB； Llama-2-7B 形状的单个 4,096 个 token 序列花费 2 GiB，即权重的六分之一。
- 短上下文时注意力 FLOPs 很小（512 个 token 下占 2%）。单 token 上下文超过约 $6d$ 时，注意力超过矩阵乘法（Llama-2-7B 为 25,205）；因果序列平均的交叉点约为 $12d$（50,410）。
- 按本模块约定，在 $T = 4{,}096$ 下训练 Llama-2-7B，每 token 需 42.87 GFLOP；简化公式 $6N_{\text{total}}$ 得到 40.43，低估 5.7%。

### 进一步尝试

1. **混合专家。** 为 `Cfg` 添加 `n_experts`、`top_k` 两个字段。改变计数器，使各层存储 `n_experts` 份 FFN 加一个路由器（$d \times n_{\text{experts}}$ 矩阵），而 `n_matmul` 只计入每 token 实际经过的 `top_k` 个专家。基于 Llama-2-7B 配置，采用 8 个专家、top-2 路由，打印总参数与活跃参数；应约为 37.0B 与 11.1B（包括两个嵌入表）。概念见 [第 05 模块](module_05_ZH.html)，工程见 [第 08 模块](module_08_ZH.html)。
2. **未录入的配置。** 联网时，用 `transformers.AutoConfig.from_pretrained` 获取 `HuggingFaceTB/SmolLM2-360M` 的配置（约 1 KB，不下载权重），从字段构造 `Cfg`，确认 361,821,120 个参数；再用 meta 设备上的 `LlamaForCausalLM` 核对。
3. **缓存随上下文长度变化。** 编写函数返回单序列 KV cache 大小。对 Llama-2-7B 配置，分别绘制 32、8、1 个 KV 头，从 1,000 到 128,000 token 的曲线，并在权重大小 12.6 GiB 处画水平线。读出各布局中单序列缓存超过权重所需的上下文长度。

## 实验 5 — 训练小型 GPT、采样并移除掩码 {#lab5}

**目标。** 用生成的维护记录训练字符级解码器，将损失与数据源熵比较，并测试生成记录。再用相同架构去掉因果掩码训练；仅前缀评分会揭示普通留出窗口损失遗漏的问题。实验独立运行，不下载数据。

### 步骤一：生成记录

`QUICK = True` 采用 300 步因果训练、200 步无掩码训练。设为 `False` 后，因果训练变为 `FULL_STEPS = 1500` 步，无掩码仍为 200 步。使用四个 CPU 线程，与其他实验可比；实际耗时取决于机器，完整运行可能需几分钟。较长训练给复制机制更多形成时间。

```python
import collections
import json
import math
import random
import re
import time
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F

QUICK = True
FULL_STEPS = 1500
torch.set_num_threads(4)
torch.manual_seed(0)
np.random.seed(0)
source_rng = random.Random(0)
specs = {
    "P": ("pump", "pressure", "bar", 0.5, 7.5, 2.0, 6.0),
    "T": ("tank", "level", "%", 2, 99, 10, 90),
    "C": ("compressor", "speed", "rpm", 2400, 3300, 2600, 3100),
    "H": ("exchanger", "outlet", "C", 35, 95, 40, 85),
    "V": ("valve", "position", "%", 0, 100, None, None),
}


def status_for(letter, value):
    low, high = specs[letter][-2:]
    if low is None:
        return "OK"
    return "LOW" if value < low else "HIGH" if value > high else "OK"


lines = []
for _ in range(12000):
    letter = source_rng.choice("PTCHV")
    identifier = f"{letter}-{source_rng.randint(0, 999):03d}"
    kind, quantity, unit, low, high, _, _ = specs[letter]
    value = (source_rng.uniform(low, high) if letter == "P"
             else source_rng.randint(low, high))
    shown = f"{value:.1f}" if letter == "P" else str(value)
    # Status is determined by the displayed value so records can be checked exactly.
    status = status_for(letter, float(shown))
    lines.append(f"{identifier} {kind} {quantity} {shown} {unit} "
                 f"{status} end {identifier}\n")
corpus = "".join(lines)
alphabet = sorted(set(corpus))
encode = {character: index for index, character in enumerate(alphabet)}
tokens = torch.tensor([encode[c] for c in corpus], dtype=torch.long)
split = int(0.9 * len(tokens))
train_data, valid_data = tokens[:split], tokens[split:]
vocab = len(alphabet)
print(f"mode: {'QUICK' if QUICK else 'FULL'}")
print(f"characters {len(corpus):,}, lines {len(lines):,}, vocabulary {vocab}")
print("".join(lines[:3]), end="")
```

```output
mode: QUICK
characters 486,841, lines 12,000, vocabulary 46
H-776 exchanger outlet 91 C HIGH end H-776
H-041 exchanger outlet 51 C OK end H-041
V-497 valve position 51 % OK end V-497
```

结束标识符重复开头标识符，状态由显示数值确定。因此，生成器只在记录类型、标识符和值上引入随机性。按字符位置划分可能切开记录，但窗口严格留在各自划分内，不会将验证目标暴露给训练窗口。

### 步骤 2：参考熵

下面的单元组与二元组熵，是训练字符的代入估计。生成器熵按记录类型、数量及取整压力值的真实分布计算。对均匀压力取整后，两端区间只有普通区间的一半宽，71 个显示值并非等概率。

```python
def entropy(probabilities):
    p = np.asarray(probabilities, dtype=float)
    p = p[p > 0]
    return float(-(p * np.log(p)).sum())


training_text = corpus[:split]
counts = collections.Counter(training_text)
unigram = entropy(np.array(list(counts.values())) / len(training_text))
pairs = collections.Counter(zip(training_text[:-1], training_text[1:]))
previous = collections.Counter(training_text[:-1])
bigram = -sum(n / (len(training_text) - 1) * math.log(n / previous[a])
              for (a, b), n in pairs.items())
mean_length, value_entropy = 0., 0.
for letter, (kind, quantity, unit, low, high, _, _) in specs.items():
    if letter == "P":
        values = np.arange(5, 76) / 10
        probabilities = np.full(71, 1 / 70)
        probabilities[[0, -1]] /= 2
    else:
        values = np.arange(low, high + 1)
        probabilities = np.full(len(values), 1 / len(values))
    value_entropy += entropy(probabilities) / 5
    for value, probability in zip(values, probabilities):
        shown = f"{value:.1f}" if letter == "P" else str(int(value))
        record = (f"{letter}-000 {kind} {quantity} {shown} {unit} "
                  f"{status_for(letter, float(value))} end {letter}-000\n")
        mean_length += len(record) * probability / 5
line_entropy = math.log(5) + math.log(1000) + value_entropy
true_floor = line_entropy / mean_length
no_copy_floor = (line_entropy + math.log(1000)) / mean_length
print(f"uniform {math.log(vocab):.3f}, unigram {unigram:.3f}, bigram {bigram:.3f}")
print(f"generator: {line_entropy:.3f} nats/line, {mean_length:.3f} chars/line")
print(f"true entropy {true_floor:.3f}, no-copy reference {no_copy_floor:.3f} nats/char")
```

```output
uniform 3.829, unigram 3.410, bigram 1.717
generator: 13.392 nats/line, 40.558 chars/line
true entropy 0.330, no-copy reference 0.501 nats/char
```

无法复制参考值假设设备字母已由记录确定，但重复的三位数字要重新预测，每行增加 `log(1000)`。它描述一种受限预测器，不是完整数据源的熵。

### 第 3 步：完整的解码器和初始化检查

此处重复了模型代码，因此本实验不需要 实验 4 中的变量。 RoPE 使用相邻对，并且键头和值头都在连续组中扩展。

```python
def rope(x, base=10000.0):
    """x: (B, h, T, dk). Rotate pairs of dims by position-dependent angles."""
    B, h, T, dk = x.shape
    theta = base ** (-torch.arange(0, dk, 2, device=x.device) / dk)   # (dk/2,)
    ang = torch.arange(T, device=x.device)[:, None] * theta[None, :]   # (T, dk/2)
    cos, sin = ang.cos()[None, None], ang.sin()[None, None]
    x1, x2 = x[..., 0::2], x[..., 1::2]
    return torch.stack([x1 * cos - x2 * sin, x1 * sin + x2 * cos], dim=-1).flatten(-2)


class Attention(nn.Module):
    def __init__(self, d, n_heads, n_kv_heads, causal=True):
        super().__init__()
        self.h, self.kv, self.dk = n_heads, n_kv_heads, d // n_heads
        self.causal = causal
        self.wq = nn.Linear(d, d, bias=False)
        self.wk = nn.Linear(d, n_kv_heads * self.dk, bias=False)
        self.wv = nn.Linear(d, n_kv_heads * self.dk, bias=False)
        self.wo = nn.Linear(d, d, bias=False)

    def forward(self, x):
        B, T, d = x.shape
        q = self.wq(x).view(B, T, self.h, self.dk).transpose(1, 2)    # (B, h, T, dk)
        k = self.wk(x).view(B, T, self.kv, self.dk).transpose(1, 2)
        v = self.wv(x).view(B, T, self.kv, self.dk).transpose(1, 2)
        q, k = rope(q), rope(k)
        k = k.repeat_interleave(self.h // self.kv, dim=1)    # grouped-query: share KV
        v = v.repeat_interleave(self.h // self.kv, dim=1)
        y = F.scaled_dot_product_attention(q, k, v, is_causal=self.causal)
        return self.wo(y.transpose(1, 2).reshape(B, T, d))


class Block(nn.Module):
    def __init__(self, d, n_heads, n_kv_heads, d_ff, causal=True):
        super().__init__()
        self.n1, self.n2 = nn.RMSNorm(d), nn.RMSNorm(d)
        self.attn = Attention(d, n_heads, n_kv_heads, causal)
        self.w1 = nn.Linear(d, d_ff, bias=False)
        self.w3 = nn.Linear(d, d_ff, bias=False)
        self.w2 = nn.Linear(d_ff, d, bias=False)

    def forward(self, x):
        x = x + self.attn(self.n1(x))                           # pre-norm residual
        h = self.n2(x)
        return x + self.w2(F.silu(self.w1(h)) * self.w3(h))    # SwiGLU feed-forward


class Decoder(nn.Module):
    def __init__(self, vocab, d=256, layers=4, n_heads=8, n_kv_heads=2, d_ff=None,
                 causal=True):
        super().__init__()
        d_ff = d_ff or int(8 * d / 3)
        self.emb = nn.Embedding(vocab, d)
        self.blocks = nn.ModuleList(Block(d, n_heads, n_kv_heads, d_ff, causal)
                                    for _ in range(layers))
        self.norm = nn.RMSNorm(d)
        self.head = nn.Linear(d, vocab, bias=False)
        self.head.weight = self.emb.weight                          # tied embeddings
        nn.init.normal_(self.emb.weight, std=0.02)    # keeps step-0 logits small

    def forward(self, tokens):                                  # tokens: (B, T) ints
        x = self.emb(tokens)
        for b in self.blocks:
            x = b(x)
        return self.head(self.norm(x))                          # logits: (B, T, vocab)


def make_model(causal):
    torch.manual_seed(0)
    return Decoder(vocab=vocab, d=128, layers=4, n_heads=4, n_kv_heads=2,
                   causal=causal)


def batch(data, generator, B=32, T=128):
    starts = torch.randint(len(data) - T, (B,), generator=generator)
    windows = data[starts[:, None] + torch.arange(T + 1)]
    return windows[:, :-1], windows[:, 1:]


x0, y0 = batch(train_data, torch.Generator().manual_seed(1))
bad = make_model(True)
with torch.no_grad():
    nn.init.normal_(bad.emb.weight, std=1.0)
    bad_loss = F.cross_entropy(bad(x0).reshape(-1, vocab), y0.reshape(-1)).item()
good = make_model(True)
with torch.no_grad():
    good_loss = F.cross_entropy(good(x0).reshape(-1, vocab), y0.reshape(-1)).item()
print(f"parameters: {sum(p.numel() for p in good.parameters()):,}")
print(f"unit-scale tied embeddings: {bad_loss:.3f}")
print(f"std 0.02 embeddings: {good_loss:.3f}; uniform baseline {math.log(vocab):.3f}")
assert sum(p.numel() for p in good.parameters()) == 727424
del bad, good
```

```output
parameters: 727,424
unit-scale tied embeddings: 115.321
std 0.02 embeddings: 3.881; uniform baseline 3.829
```

单位尺度反例故意重新初始化共享表，具体值随随机抽样变化。它说明，若初始损失远高于 `log(vocab)`，应在训练前调查。

### 第四步：因果训练

验证始终采用十个固定的留出 batch，训练使用独立随机生成器；模型没有 dropout。因此，各检查点损失对应同一组验证窗口。输出不打印耗时，避免机器负载干扰数值比较。

```python
@torch.no_grad()
def validation_loss(model):
    model.eval()
    generator = torch.Generator().manual_seed(2)
    losses = []
    for _ in range(10):
        x, y = batch(valid_data, generator)
        losses.append(F.cross_entropy(model(x).reshape(-1, vocab), y.reshape(-1)).item())
    return float(np.mean(losses))


def train(causal, steps):
    model = make_model(causal)
    optimiser = torch.optim.AdamW(model.parameters(), lr=3e-3,
                                 betas=(0.9, 0.95), weight_decay=0.1)
    generator = torch.Generator().manual_seed(1)
    curve = []
    for step in range(1, steps + 1):
        progress = max(0, (step - 50) / (steps - 50))
        scale = step / 50 if step <= 50 else 0.5 * (1 + math.cos(math.pi * progress))
        for group in optimiser.param_groups:
            group["lr"] = 3e-3 * scale
        model.train()
        x, y = batch(train_data, generator)
        loss = F.cross_entropy(model(x).reshape(-1, vocab), y.reshape(-1))
        optimiser.zero_grad(set_to_none=True)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimiser.step()
        if step == 1 or step % 100 == 0 or step == steps:
            held_out = validation_loss(model)
            curve.append((step, loss.item(), held_out))
            print(f"step {step:4d}: train {loss.item():.3f}, validation {held_out:.3f}",
                  flush=True)
    return model, curve


causal, causal_curve = train(True, 300 if QUICK else FULL_STEPS)
```

```output
step    1: train 3.881, validation 3.858
step  100: train 0.562, validation 0.567
step  200: train 0.540, validation 0.542
step  300: train 0.533, validation 0.532
```

QUICK 不保证学会远距离复制。若模型学会复用开头标识符，较长训练可将损失降到无法复制参考值以下；转变时刻会随浮点计算与训练配置变化。若完整运行恰在转变期间结束，可尝试 `FULL_STEPS = 2000`，并报告额外计算量。

### 第 5 步：采样和解析

用固定采样生成器、温度 0.8，采样 32 条独立序列。排除各样本最后一条不完整行；单独报告格式错误。标识符与状态准确率只对格式正确的行计算。

```python
@torch.no_grad()
def sample(model, count=32, steps=240):
    model.eval()
    generator = torch.Generator().manual_seed(3)
    sequence = torch.full((count, 1), encode["\n"], dtype=torch.long)
    for _ in range(steps):
        probabilities = (model(sequence[:, -128:])[:, -1] / 0.8).softmax(-1)
        next_token = torch.multinomial(probabilities, 1, generator=generator)
        sequence = torch.cat((sequence, next_token), dim=1)
    return ["".join(alphabet[i] for i in row) for row in sequence.tolist()]


pattern = re.compile(
    r"^([PTCHV])-(\d{3}) (\w+) (\w+) (\d+(?:\.\d)?) (\S+) "
    r"(OK|LOW|HIGH) end ([PTCHV]-\d{3})$")


def score_samples(texts):
    complete = [line for text in texts for line in text.split("\n")[1:-1]]
    parsed, copied, correct_status = 0, 0, 0
    for line in complete:
        match = pattern.fullmatch(line)
        if match is None:
            continue
        letter, digits, kind, quantity, shown, unit, status, closing = match.groups()
        spec = specs[letter]
        if (kind, quantity, unit) != spec[:3]:
            continue
        parsed += 1
        copied += closing == f"{letter}-{digits}"
        correct_status += status == status_for(letter, float(shown))
    print(f"complete {len(complete)}, well-formed {parsed} "
          f"({parsed / max(1, len(complete)):.1%})")
    print(f"among well-formed: identifier copied {copied / max(1, parsed):.1%}, "
          f"correct status {correct_status / max(1, parsed):.1%}")
    return dict(complete=len(complete), parsed=parsed, copied=copied,
                correct_status=correct_status)


causal_samples = sample(causal)
print(causal_samples[0])
causal_scores = score_samples(causal_samples)
```

```output
P-201 pump pressure 4.6 bar OK end P-828
C-143 compressor speed 3096 rpm HIGH end C-583
T-238 tank level 40 % OK end T-413
P-172 pump pressure 4.7 bar OK end P-495
T-280 tank level 79 % OK end T-998
C-987 compressor speed 3325 rpm HIGH end
complete 176, well-formed 170 (96.6%)
among well-formed: identifier copied 0.0%, correct status 90.0%
```

格式、复制、状态是三个不同的成功标准。看似合理的记录，结尾标识符仍可能错误。这个合成解析器只能检验本实验的规则，不能验证真实维护决策。

### 第 6 步：不使用掩码进行训练并评估前缀

采用相同初始化与训练 batch 种子，只改变因果标志。随机留出窗口为各次仅前缀预测提供实际可用的 8–127 个前缀字符，不提供目标。

```python
unmasked, unmasked_curve = train(False, 200)
unmasked_samples = sample(unmasked)
print("unmasked sample:")
print(unmasked_samples[0])
unmasked_scores = score_samples(unmasked_samples)


@torch.no_grad()
def prefix_loss(model, predictions=200):
    model.eval()
    generator = torch.Generator().manual_seed(5)
    losses = []
    for _ in range(predictions):
        start = int(torch.randint(len(valid_data) - 129, (), generator=generator))
        length = int(torch.randint(8, 128, (), generator=generator))
        prefix = valid_data[start:start + length][None]
        target = valid_data[start + length][None]
        losses.append(F.cross_entropy(model(prefix)[:, -1], target).item())
    return float(np.mean(losses))


causal_prefix, unmasked_prefix = prefix_loss(causal), prefix_loss(unmasked)
print(f"prefix-only loss: causal {causal_prefix:.3f}, unmasked {unmasked_prefix:.3f}")
print(f"window validation: causal {validation_loss(causal):.3f}, "
      f"unmasked {validation_loss(unmasked):.3f}")
```

```output
step    1: train 3.907, validation 3.860
step  100: train 0.336, validation 0.338
step  200: train 0.011, validation 0.014
unmasked sample:

-iitir rrrerl rr aar e er 88888888888888888888878888  an e H-888 H-888 excharer r 89 % OK end T-888
H-78 exchanger outlet 888 C LOW end H-888
H-888 exchGH-8888 lve bale C OK end H-888
T-888 tanr level 88 % OK end T-880
H-883 exchanger outle
complete 83, well-formed 0 (0.0%)
among well-formed: identifier copied 0.0%, correct status 0.0%
prefix-only loss: causal 0.521, unmasked 1.291
window validation: causal 0.532, unmasked 0.014
```

无掩码模型在窗口评估中能读取大多数目标；最后输入位置例外，因为下一字符在窗口之外。仅前缀评估去掉各测试位置的泄漏。模型预测时使用未来输入，无法用留出划分弥补。

### 第 7 步：比较曲线

```python
fig, ax = plt.subplots(figsize=(8, 4.5))
for name, curve, style in (("causal", causal_curve, "-"),
                            ("unmasked", unmasked_curve, "--")):
    values = np.asarray(curve)
    ax.plot(values[:, 0], values[:, 2], style, label=f"{name}, validation")
for level, name in ((math.log(vocab), "uniform"), (unigram, "unigram"),
                    (bigram, "bigram"), (no_copy_floor, "no-copy reference"),
                    (true_floor, "generator entropy")):
    ax.axhline(level, linewidth=0.8, alpha=0.5, label=f"{name}: {level:.3f}")
ax.set_xscale("log")
ax.set_xlabel("training step")
ax.set_ylabel("loss (nats per character)")
ax.set_title(f"Maintenance records: {'QUICK' if QUICK else 'FULL'} run")
ax.legend(fontsize=8)
plt.tight_layout()
plt.show()
metrics = dict(mode="QUICK" if QUICK else "FULL", causal_curve=causal_curve,
               unmasked_curve=unmasked_curve, causal_scores=causal_scores,
               unmasked_scores=unmasked_scores, causal_prefix=causal_prefix,
               unmasked_prefix=unmasked_prefix, true_floor=true_floor,
               no_copy_floor=no_copy_floor)
with open("m06-lab5-metrics.json", "w", encoding="utf-8") as stream:
    json.dump(metrics, stream, indent=2)
```

### 预期观察

格式与局部规律改善时，因果损失会低于单元组、二元组参考。比较复制成功率与损失是否低于无法复制参考。无掩码模型的窗口损失可能很低，但仅前缀损失和生成记录会暴露泄漏。上面打印的是实际 QUICK 运行；完整运行观察单独列在下面。

使用 `QUICK = False`，实际 1500 步因果训练得到验证损失 0.399、仅前缀损失 0.394。生成 172 条完整行，全部可解析；155 条正确复制标识符（90.1%），171 条状态正确（99.4%）。约 1000 步后，验证损失低于无法复制参考。无掩码对照仍为窗口损失 0.014、仅前缀损失 1.291，83 条完整生成行均不可解析。保留上方 QUICK 输出，使默认代码与显示结果对应同一次运行。

### 进一步尝试

1. 使用 0.2–2 MB 的公共领域文本；重新计算词汇和经验熵。
2. 将上下文缩至 32 个字符，检查预测各结尾字符时，开头标识符的哪些部分仍可见。不要假定一层适用于所有记录长度，因为该语料包含不同格式与长度。
3. 在温度 0.3 和 1.5 下重复采样并再次评分格式、复制和状态。

## 实验 6 — 寻找归纳头 {#lab6}

**目标。** 用重复随机片段训练仅包含注意力的 Transformer，测量前一 token 与归纳注意力模式，并干预各头。比较两层模型与一层对照。全部数据在本地生成，不下载模型。

### 步骤 1：生成一个复制距离不同的任务

抽取一条 64-token 序列，再抽取 10–32 的片段长度，将首段立即重复。重复部分的首个 token 无法由前缀预测，后续 token 则可预测。目标向前移一位，所以位置 `j` 的可预测目标，由查询位置 `j - 1` 评估。

```python
import json
import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F

np.random.seed(0)
torch.manual_seed(0)
torch.set_num_threads(4)
VOCAB, LENGTH, STEPS = 64, 64, 1500


def repeated_batch(generator, count=64):
    tokens = torch.randint(VOCAB, (count, LENGTH), generator=generator)
    segment = torch.randint(10, 33, (count,), generator=generator)
    predictable = torch.zeros_like(tokens, dtype=torch.bool)
    for row, n in enumerate(segment.tolist()):
        tokens[row, n:2 * n] = tokens[row, :n].clone()
        predictable[row, n + 1:2 * n] = True
    return tokens[:, :-1], tokens[:, 1:], predictable[:, 1:], segment


x, y, predictable, segment = repeated_batch(torch.Generator().manual_seed(1))
print("inputs", tuple(x.shape), "targets", tuple(y.shape))
print("segment lengths:", segment[:8].tolist())
print(f"predictable target share: {predictable.float().mean():.3f}")
assert all(torch.equal(x[row, n:2 * n - 1], x[row, :n - 1])
           for row, n in enumerate(segment.tolist()))
```

```output
inputs (64, 63) targets (64, 63)
segment lengths: [13, 13, 21, 25, 16, 22, 13, 14]
predictable target share: 0.295
```

固定复制距离可被位置规则解决；改变距离，迫使模型寻找较早的匹配 token，再使用其后继 token。随机 token 冲突仍会造成歧义；该任务分布不保证每个重复 token 都有唯一匹配。

### 步骤 2 — 暴露注意力权重与各头输出

显式 softmax 允许检查注意力，并在输出投影前将某个头的输出置零。消融移除整个头的贡献，而非单个注意力条目。模型没有前馈子层。

```python
def rotary(x):
    T, dk = x.shape[-2:]
    frequencies = 10000.0 ** (-torch.arange(0, dk, 2) / dk)
    angles = torch.arange(T)[:, None] * frequencies[None]
    cosine, sine = angles.cos()[None, None], angles.sin()[None, None]
    first, second = x[..., 0::2], x[..., 1::2]
    return torch.stack((first * cosine - second * sine,
                        first * sine + second * cosine), dim=-1).flatten(-2)


class InspectableBlock(nn.Module):
    def __init__(self, width=64, heads=4):
        super().__init__()
        self.heads, self.dk = heads, width // heads
        self.norm = nn.RMSNorm(width)
        self.qkv = nn.Linear(width, 3 * width, bias=False)
        self.output = nn.Linear(width, width, bias=False)

    def forward(self, x, zero_heads=()):
        B, T, d = x.shape
        q, k, v = (a.reshape(B, T, self.heads, self.dk).transpose(1, 2)
                   for a in self.qkv(self.norm(x)).chunk(3, dim=-1))
        q, k = rotary(q), rotary(k)
        scores = q @ k.transpose(-1, -2) / self.dk ** 0.5
        future = torch.ones(T, T, dtype=torch.bool).triu(1)
        weights = scores.masked_fill(future, -torch.inf).softmax(-1)
        head_output = weights @ v
        if zero_heads:
            head_output = head_output.clone()
            head_output[:, list(zero_heads)] = 0
        merged = head_output.transpose(1, 2).reshape(B, T, d)
        return x + self.output(merged), weights


class CopyModel(nn.Module):
    def __init__(self, layers):
        super().__init__()
        self.embedding = nn.Embedding(VOCAB, 64)
        nn.init.normal_(self.embedding.weight, std=0.02)
        self.blocks = nn.ModuleList(InspectableBlock() for _ in range(layers))
        self.norm = nn.RMSNorm(64)
        self.head = nn.Linear(64, VOCAB, bias=False)

    def forward(self, tokens, ablate=None):
        x, maps = self.embedding(tokens), []
        for layer, block in enumerate(self.blocks):
            x, weights = block(x, (ablate or {}).get(layer, ()))
            maps.append(weights)
        return self.head(self.norm(x)), maps


model = CopyModel(2)
print(f"two-layer parameters: {sum(p.numel() for p in model.parameters()):,}")
```

```output
two-layer parameters: 41,152
```

### 第 3 步：训练和分离可预测目标

对所有目标训练，不只训练重复区域。用固定的新 batch 分别报告可预测与不可预测位置的损失。后者是有用对照：即使复制改善，随机非复制目标仍应很难。

```python
@torch.no_grad()
def evaluate(model, count=256, seed=9, ablate=None):
    model.eval()
    x, y, predictable, segment = repeated_batch(
        torch.Generator().manual_seed(seed), count)
    logits, maps = model(x, ablate)
    losses = F.cross_entropy(logits.reshape(-1, VOCAB), y.reshape(-1),
                             reduction="none").reshape_as(y)
    return (losses[predictable].mean().item(),
            losses[~predictable].mean().item(), maps, predictable, segment, x)


def fit(layers):
    torch.manual_seed(0)
    model = CopyModel(layers)
    optimiser = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0)
    generator = torch.Generator().manual_seed(1)
    curve = []
    for step in range(1, STEPS + 1):
        model.train()
        x, y, _, _ = repeated_batch(generator)
        logits, _ = model(x)
        loss = F.cross_entropy(logits.reshape(-1, VOCAB), y.reshape(-1))
        optimiser.zero_grad(set_to_none=True)
        loss.backward()
        optimiser.step()
        if step == 1 or step % 100 == 0:
            repeated, random_loss, *_ = evaluate(model, count=64)
            curve.append((step, repeated, random_loss))
            print(f"layers {layers}, step {step:4d}: copy {repeated:.3f}, "
                  f"other {random_loss:.3f}", flush=True)
    return model, curve


two_layer, two_curve = fit(2)
```

```output
layers 2, step    1: copy 4.290, other 4.307
layers 2, step  100: copy 3.917, other 4.211
layers 2, step  200: copy 3.771, other 4.221
layers 2, step  300: copy 3.639, other 4.231
layers 2, step  400: copy 3.524, other 4.256
layers 2, step  500: copy 3.401, other 4.281
layers 2, step  600: copy 2.871, other 4.346
layers 2, step  700: copy 1.197, other 4.513
layers 2, step  800: copy 0.829, other 4.424
layers 2, step  900: copy 0.579, other 4.361
layers 2, step 1000: copy 0.436, other 4.332
layers 2, step 1100: copy 0.374, other 4.324
layers 2, step 1200: copy 0.346, other 4.305
layers 2, step 1300: copy 0.374, other 4.285
layers 2, step 1400: copy 0.338, other 4.287
layers 2, step 1500: copy 0.304, other 4.288
```

### 步骤 4 — 量化各头关注的位置

前一 token 分数，对所有非首位查询，平均从查询 `t` 到键 `t - 1` 的权重。对于可预测查询 `t`，较早的后继位于键 `t - n + 1`，其中 `n` 是片段长度。归纳分数平均该键的权重。使用 256 条新序列计算，而不是挑选一个好看的例子。

```python
@torch.no_grad()
def head_scores(model):
    repeated, random_loss, maps, predictable, segment, x = evaluate(model)
    previous_scores, induction_scores = [], []
    batch_ids, query_ids = predictable.nonzero(as_tuple=True)
    key_ids = query_ids - segment[batch_ids] + 1
    for layer, weights in enumerate(maps):
        previous = weights.diagonal(offset=-1, dim1=-2, dim2=-1).mean(dim=(0, 2))
        induction = weights[batch_ids, :, query_ids, key_ids].mean(dim=0)
        previous_scores.append(previous.numpy())
        induction_scores.append(induction.numpy())
        print(f"layer {layer}: previous "
              + " ".join(f"{v:.3f}" for v in previous.tolist()))
        print(f"layer {layer}: induction "
              + " ".join(f"{v:.3f}" for v in induction.tolist()))
    print(f"held-out copy loss {repeated:.3f}, other loss {random_loss:.3f}")
    return previous_scores, induction_scores, maps, segment


previous, induction, maps, segments = head_scores(two_layer)
previous_head = int(np.argmax(previous[0]))
induction_head = int(np.argmax(induction[1]))
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
for ax, layer, head, title in (
        (axes[0], 0, previous_head, "strongest layer-0 previous-token score"),
        (axes[1], 1, induction_head, "strongest layer-1 induction score")):
    pattern = maps[layer][0, head].numpy()
    image = ax.imshow(pattern, vmin=0, vmax=1, origin="upper", cmap="Blues")
    ax.set_xlabel("key position")
    ax.set_ylabel("query position")
    ax.set_title(f"{title}\nhead {head}, segment length {int(segments[0])}", fontsize=9)
    fig.colorbar(image, ax=ax, fraction=0.046)
plt.tight_layout()
plt.show()
```

```output
layer 0: previous 0.631 0.300 0.119 0.110
layer 0: induction 0.000 0.000 0.001 0.001
layer 1: previous 0.052 0.035 0.041 0.037
layer 1: induction 0.927 0.920 0.935 0.922
held-out copy loss 0.286, other loss 4.297
```

### 第五步：对每个头进行干预

在相同的 512 条新序列上评估各干预。损失增大说明该头对当前模型在该分布上的预测有贡献，却不能证明它是某个人类概念的唯一实现。

```python
baseline = evaluate(two_layer, count=512, seed=11)[0]
print(f"baseline copy loss {baseline:.3f}")
ablations = []
for layer in range(2):
    for head in range(4):
        loss = evaluate(two_layer, count=512, seed=11, ablate={layer: [head]})[0]
        ablations.append((layer, head, loss))
        print(f"zero layer {layer}, head {head}: {loss:.3f}, change {loss - baseline:+.3f}")
    loss = evaluate(two_layer, count=512, seed=11, ablate={layer: list(range(4))})[0]
    print(f"zero all heads in layer {layer}: {loss:.3f}")
```

```output
baseline copy loss 0.270
zero layer 0, head 0: 2.866, change +2.596
zero layer 0, head 1: 1.373, change +1.103
zero layer 0, head 2: 2.855, change +2.585
zero layer 0, head 3: 2.811, change +2.541
zero all heads in layer 0: 4.518
zero layer 1, head 0: 2.265, change +1.995
zero layer 1, head 1: 1.986, change +1.716
zero layer 1, head 2: 2.513, change +2.242
zero layer 1, head 3: 1.873, change +1.603
zero all heads in layer 1: 4.399
```

移除整层是超出训练状态分布的干预。应结合单头干预和注意力分数解读，不把某次损失变化视为完整解释。

### 第 6 步：单层控制

使用相同 batch 生成器、训练步数与优化器。一层模型参数更少，且只有一个注意力阶段，因此同时改变容量与可用计算。它测试的是此处的具体设置，不能证明一层 Transformer 普遍无法复制。

```python
one_layer, one_curve = fit(1)
one_previous, one_induction, _, _ = head_scores(one_layer)
fig, ax = plt.subplots(figsize=(8, 4))
for name, curve in (("two layers", two_curve), ("one layer", one_curve)):
    curve = np.asarray(curve)
    ax.plot(curve[:, 0], curve[:, 1], label=f"{name}, predictable")
ax.axhline(math_log_vocab := float(np.log(VOCAB)), color="grey", linestyle=":",
           label=f"uniform guess: {math_log_vocab:.2f}")
ax.set_xlabel("training step")
ax.set_ylabel("held-out loss (nats per token)")
ax.set_title("Copying a variable-distance repeated segment")
ax.legend()
plt.tight_layout()
plt.show()
metrics = dict(two_curve=two_curve, one_curve=one_curve,
               previous=[a.tolist() for a in previous],
               induction=[a.tolist() for a in induction],
               ablations=ablations, baseline=baseline,
               one_induction=[a.tolist() for a in one_induction])
with open("m06-lab6-metrics.json", "w", encoding="utf-8") as stream:
    json.dump(metrics, stream, indent=2)
```

```output
layers 1, step    1: copy 4.259, other 4.303
layers 1, step  100: copy 4.068, other 4.172
layers 1, step  200: copy 3.681, other 4.218
layers 1, step  300: copy 3.547, other 4.223
layers 1, step  400: copy 3.474, other 4.234
layers 1, step  500: copy 3.436, other 4.232
layers 1, step  600: copy 3.433, other 4.224
layers 1, step  700: copy 3.378, other 4.242
layers 1, step  800: copy 3.378, other 4.237
layers 1, step  900: copy 3.353, other 4.244
layers 1, step 1000: copy 3.339, other 4.240
layers 1, step 1100: copy 3.331, other 4.248
layers 1, step 1200: copy 3.337, other 4.242
layers 1, step 1300: copy 3.334, other 4.243
layers 1, step 1400: copy 3.324, other 4.240
layers 1, step 1500: copy 3.317, other 4.240
layer 0: previous 0.025 0.031 0.024 0.032
layer 0: induction 0.068 0.065 0.068 0.063
held-out copy loss 3.338, other loss 4.243
```

### 预期观察

比较复制损失曲线、注意力分数与消融效果。两层架构在这个任务中可以结合早期搬运的 token 信息和后续查找；一层对照检验这种组合的帮助程度。即使注意力分数不高，某个头仍可能通过值与输出投影影响结果；热图不是完整证据。打印数值来自本实验实际运行，其他机器的末位或转变时刻可能不同。

### 进一步尝试

1. 将段长度固定为 32，并与可变距离的一层控制进行比较。
2. 添加 SwiGLU，分别比较同宽度与相近参数量的损失曲线，明确报告采用哪一种比较。
3. 用种子 1、2 重复训练，检查是否学会复制，以及哪些头呈现相应模式；不同种子下，头编号不必对应相同作用。
