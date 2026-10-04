## Lab 4 — A parameter and FLOP counter for Llama-style models {#lab4}

**Goal.** Write a counter that reads a decoder's configuration (vocabulary size, width, depth,
query heads, key-value heads, feed-forward width, tying, biases) and returns its parameter count,
its FLOPs per token under the convention of [Section 11](#s11), and its KV-cache size per token.
Then check the counter three ways: against PyTorch, by building the module's own `Decoder`;
against the sizes published for five open models, from GPT-2 small to Llama-3-8B; and, if
Hugging Face `transformers` is installed, against the reference implementations of those five
models, built on PyTorch's meta device so that an eight-billion-parameter model costs neither
memory nor a download. With the counter in hand you will see why the $12Ld^2$ rule is within 1%
for one model and 55% out for another, how much of a small model is embedding table, what
grouped-query attention does to the cache, and at what context length attention stops being a
rounding error in the FLOP count. The configurations are typed in from each model's
`config.json`; nothing is downloaded and the lab runs in seconds.

### Step 1 — Set up

Counting needs no randomness, but every lab in the series fixes its seeds first, so that any
tensor it creates (here, the decoders built in Step 3) is the same on every run.

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

### Step 2 — Describe a model, then count it

A decoder-only transformer is pinned down by a handful of numbers and switches:

- the vocabulary size $V$ and the width $d$ of the residual stream;
- the number of layers $L$, each with $h$ query heads of width $d_{\text{head}} = d/h$ and
  $n_{kv}$ key-value heads: $n_{kv} = h$ is multi-head attention, $1 < n_{kv} < h$ is
  grouped-query attention and $n_{kv} = 1$ is multi-query attention ([Section 9](#s9));
- the feed-forward width $d_{\text{ff}}$, and whether the feed-forward network is SwiGLU (three
  matrices) or a plain two-matrix MLP ([Section 5](#s5));
- whether the output projection is tied to the input embedding;
- which linear layers carry biases, whether positions come from a learned table (GPT-2) or from
  RoPE (no parameters at all), and whether each norm is LayerNorm (a gain and a bias, $2d$
  numbers) or RMSNorm (a gain only, $d$ numbers).

The counter adds the pieces up block by block, exactly as Section 11 does. Each layer holds

$$
\begin{aligned}
\text{attention} &= \underbrace{d \cdot h d_{\text{head}}}_{\mathbf{W}_Q}
 + \underbrace{2 \cdot d \cdot n_{kv} d_{\text{head}}}_{\mathbf{W}_K,\ \mathbf{W}_V}
 + \underbrace{h d_{\text{head}} \cdot d}_{\mathbf{W}_O} \quad (+\ \text{biases}), \\
\text{FFN} &= 3\, d\, d_{\text{ff}} \ \text{(SwiGLU)} \quad \text{or} \quad 2\, d\, d_{\text{ff}}
 \quad (+\ \text{biases}), \\
\text{norms} &= 2 \times d \ \text{(RMSNorm)} \quad \text{or} \quad 2 \times 2d \ \text{(LayerNorm)},
\end{aligned}
$$

and the model adds, once, a token table of $Vd$ numbers, a second $Vd$ if the output projection
is untied, $T_{\max} d$ for a learned position table, and a final norm. Since $h d_{\text{head}}
= d$ in every model here, the attention line is $2d^2 + 2d\,n_{kv} d_{\text{head}}$, which is
$4d^2$ for multi-head attention and less under grouping.

The counter also returns $N_{\text{matmul}}$, the parameters that take part in a matrix multiply
for every token. It is $N_{\text{total}}$ minus the lookup tables, which are an untied input
embedding and a learned position table: reading row $i$ of a table costs no arithmetic. A tied
matrix stays in $N_{\text{matmul}}$, because it is still used once per token, as the output
projection. The dictionary keeps per-layer and whole-model figures apart, because the
per-layer ones are what you compare with a paper's description of one block.

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

Every line is a product you can redo by hand. The attention layer is four $4096 \times 4096$
matrices, $4 \times 16{,}777{,}216 = 67{,}108{,}864$. The SwiGLU network is three
$4096 \times 11{,}008$ matrices, $135{,}266{,}304$, a little more than the
$8d^2 = 134{,}217{,}728$ of the rule because $11{,}008$ is $\tfrac{8}{3}d = 10{,}922.7$ rounded
up to a multiple of 256. The two RMSNorm gains add $2 \times 4{,}096 = 8{,}192$. Thirty-two
layers, two untied $32{,}000 \times 4{,}096$ tables and a final norm make
$6{,}738{,}415{,}616$, the 6.7B of the Llama 2 paper. Removing the input table, which is a
lookup, leaves $N_{\text{matmul}} = 6{,}607{,}343{,}616$: the number that the FLOP count of
Step 7 multiplies.

### Step 3 — Check the counter against PyTorch

A formula is only as good as its check, and the surest check is a model built in code: PyTorch
knows every tensor it allocated. The block below is the `Decoder` of [Section 12](#s12),
reformatted to 88-character lines but otherwise the same, including the initialisation line
and the `causal` switch that [Lab 5](#lab5) uses. Counting does not depend on either.

Build it twice, at the module's default size (vocabulary 4,096, $d = 256$, four layers, eight
query heads, two KV heads) and at the size Lab 5 trains (vocabulary 46, $d = 128$, four layers,
four query heads, two KV heads), and compare the counter with the sum of the tensors. One
subtlety decides the answer. The output projection and the input embedding are a single tensor
(`self.head.weight = self.emb.weight`), and `model.parameters()` yields each tensor once, so the
shared matrix is counted once. A script that walks the modules and adds up every weight it meets
counts it twice; the last line shows the number such a script would report.

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

The counter and PyTorch agree to the parameter at both sizes: 3,801,344 is the "about 3.8M"
that the decoder's code prints in Section 12, and 727,424 is the model Lab 5 trains. Note
`d_ff`: $\tfrac{8}{3} \times 256 = 682.7$ and $\tfrac{8}{3} \times 128 = 341.3$, and `int`
truncates both. Counting the shared matrix twice adds the $4{,}096 \times 256 = 1{,}048{,}576$
numbers of the table again and overstates the model by 28%, a mistake that is easy to make when
parameters are counted from a `state_dict`, which lists the shared tensor under both of its names.
[Exercise 12](#e12) asks you to itemise the 3,801,344 by hand; do it before Step 4 if you have
not, and compare each part with the dictionary that `count(tiny)` returns.

### Step 4 — Five published models against the rule

Now the published models. The configurations below are copied from each model's `config.json`,
and each has a feature that the $12Ld^2$ rule does not know about:

- **GPT-2 small** (2019): multi-head attention, a GELU MLP of width $4d$, biases on every linear
  layer, LayerNorm with a bias, a learned table of 1,024 positions, tied embeddings.
- **SmolLM2-135M**: nine query heads sharing three KV heads, a SwiGLU network of width
  $1{,}536 = \tfrac{8}{3}d$, tied embeddings.
- **Qwen2.5-0.5B**: fourteen query heads sharing two KV heads, biases on $\mathbf{W}_Q$,
  $\mathbf{W}_K$ and $\mathbf{W}_V$ only, an unusually wide SwiGLU network
  ($4{,}864 \approx 5.4d$) and a 151,936-token vocabulary, tied.
- **Llama-2-7B**: the configuration of Step 2.
- **Llama-3-8B**: 32 query heads sharing 8 KV heads, a SwiGLU width of $14{,}336 = 3.5d$, and a
  128,256-token vocabulary, untied.

The block prints, for each model, the exact count, the rule $12Ld^2$, the ratio of the
non-embedding parameters to the rule, the share of the parameters that sits in embeddings
(token tables, plus the position table for GPT-2) and the size the authors quote. A second
table expresses one layer in units of $d^2$, which is the language in which the rule is wrong.

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

Each count rounds to the size its authors quote, and each departure from the rule can be read
off the second table. Under grouping, $\mathbf{W}_K$ and $\mathbf{W}_V$ map $d$ to
$n_{kv} d_{\text{head}} = (n_{kv}/h)\,d$ dimensions, so attention costs
$2d^2 + 2d^2 n_{kv}/h$ instead of $4d^2$: $2 + 2/3 = 2.67$ for SmolLM2 (three KV heads for
nine), $2 + 2/7 = 2.29$ for Qwen2.5 (two for fourteen) and $2 + 2/4 = 2.5$ for Llama-3 and for
the tiny decoder (two for eight). The feed-forward network costs $3 d_{\text{ff}}/d$ in units
of $d^2$: exactly 8 when $d_{\text{ff}} = \tfrac{8}{3}d$ (SmolLM2), $3 \times 3.5 = 10.5$ for
Llama-3 and $3 \times 5.43 = 16.29$ for Qwen2.5, whose feed-forward network alone is larger than
the rule's whole layer. So the non-embedding count is 11% below the rule for SmolLM2-135M and
55% above it for Qwen2.5-0.5B, while for GPT-2 small and Llama-2-7B, the two models built the
way the rule assumes, it is within 0.5% of it.

The embedding column tells the other half of the story. A vocabulary of 50,000 to 150,000 tokens
times a width of 576 to 896 is tens of millions of parameters, so embeddings are a fifth to a
third of every small model here; in Llama-2-7B the same kind of table is under 4%. Llama-3-8B
climbs back to 13% because its vocabulary is four times Llama 2's and its tables are untied. The
lesson is the one Section 11 draws: count from the configuration, not from the rule, and quote
the rule only for what it is, an estimate that holds for large multi-head models with
$d_{\text{ff}} \approx \tfrac{8}{3}d$ (SwiGLU) or $4d$ (GELU).

### Step 5 — The KV cache per token

During generation every layer keeps the keys and values of every past token ([Section 9](#s9)),
so the cache grows by

$$
\text{bytes per token} = 2 \times L \times n_{kv} \times d_{\text{head}} \times
\text{bytes per value},
$$

where the 2 counts K and V and a bf16 value takes 2 bytes. Query heads do not appear: only the
$n_{kv}$ key-value heads are stored. As in Section 9, sizes computed from tensor shapes are given
in binary units (1 KiB = 1,024 B, 1 MiB = $2^{20}$ B, 1 GiB = $2^{30}$ B), and a size that
Modules 07 to 10 quote in decimal gigabytes is given in both forms. The second half of the block
holds the Llama-2-7B shape fixed and changes only $n_{kv}$, the comparison that Figure 6.19
draws, and sets the cache of one 4,096-token sequence beside the weights.

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

The cache follows the KV heads, not the parameters. GPT-2 small keeps all twelve of its heads and
caches three times as much per token as Qwen2.5-0.5B, a model four times its size whose fourteen
query heads share two KV heads. At the Llama-2-7B shape one 4,096-token sequence needs
2,048 MiB = 2 GiB (2.15 GB) of cache, a sixth of the 12.6 GiB of weights, so about six such
sequences in flight hold as much cache as the model holds weights; grouping eight KV heads (Llama-3-8B's
layout) cuts the cache four-fold to 512 MiB, and a single KV head eight-fold more, to 64 MiB.
That ratio, cache per sequence against weights, is what decides how many requests a server can
batch, and [Module 10](module_10_EN.html) builds its memory budget from exactly this formula.

### Step 6 — Optional: the reference implementations, on the meta device

The published sizes are rounded, so they cannot confirm the last digit. The reference
implementations in Hugging Face `transformers` can, without downloading a single weight. On
PyTorch's **meta device** a tensor has a shape and a dtype but no storage, so building a model
inside `with torch.device("meta"):` runs every constructor, registers every parameter and
allocates nothing: an eight-billion-parameter model is built in a fraction of a second in a few
kilobytes. The configuration classes take the same numbers as `Cfg`. GPT-2's default
configuration is GPT-2 small, SmolLM2 and both Llamas use the Llama classes, and Qwen2.5 uses
the Qwen2 classes, which put biases on the query, key and value projections. If `transformers`
is not installed, the block says so and the lab carries on.

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

All five agree to the parameter. The reference code was written by other people for other
purposes, so the agreement checks every assumption the counter makes: where the biases are, that
GPT-2's position table and LayerNorm biases count, that the tied tables are shared and the
untied ones are not.

### Step 7 — Forward FLOPs per token

Section 11 fixed the convention: a product of an $(m \times n)$ and an $(n \times p)$ matrix
costs $2mnp$ FLOPs, one multiply and one add per term. For a single token $m = 1$, so every
weight in $N_{\text{matmul}}$ takes part in exactly one multiply-add and the matrix multiplies
cost $2N_{\text{matmul}}$ FLOPs. Attention adds two products that have no weights. A token at
context $t$ scores its query against $t$ keys, $2td$ FLOPs per layer summed over the heads
(since $h d_{\text{head}} = d$), and mixes $t$ value rows, another $2td$; over $L$ layers that is
$4Ldt$. Under a causal mask the token at position $t$ sees $t$ keys, so over a sequence of
length $T$ the average is

$$
\frac{1}{T}\sum_{t=1}^{T} 4Ldt = 4Ld\,\frac{T+1}{2} \approx 2LdT,
$$

provided the kernel skips the masked half, as FlashAttention's causal tiling does
([Section 10](#s10)). The function below implements both forms and, with `train=True`, the
factor of three of Step 8. The last two lines find where attention costs as much as the matrix
multiplies. For one token, $4Ldt = 2N_{\text{matmul}}$ gives $t = N_{\text{matmul}}/(2Ld)$; with
$N_{\text{matmul}} \approx 12Ld^2$ this is $t \approx 6d$. Averaged over a causal sequence,
$2LdT = 2N_{\text{matmul}}$ gives $T = N_{\text{matmul}}/(Ld) \approx 12d$.

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

At 512 tokens of context attention is a rounding error, 2% of the work. At 4,096 the last token
of a full context pays 14% of its FLOPs for attention (+16% on top of the matrix multiplies),
but a training sequence of 4,096 tokens pays only +8.1% per token on average, because its
positions see on average half the context. At 32,768 attention is more than half of the work.
The exact crossovers, 25,205 and 50,410, sit 2.6% above the rule's $6d$ and $12d$ because
$N_{\text{matmul}}$ is 2.6% larger than $12Ld^2$: it contains the output projection
($Vd = 131{,}072{,}000$) and the slightly oversized feed-forward network of Step 2.

### Step 8 — Training FLOPs per token

The backward pass of a layer $\mathbf{Y} = \mathbf{X}\mathbf{W}$ computes two products, each the
size of the forward one: $\partial\mathcal{L}/\partial\mathbf{X} =
(\partial\mathcal{L}/\partial\mathbf{Y})\,\mathbf{W}^\top$ to pass the gradient on and
$\partial\mathcal{L}/\partial\mathbf{W} = \mathbf{X}^\top(\partial\mathcal{L}/\partial\mathbf{Y})$
to update the weight. The same holds for the two weightless products of attention. A training
step therefore costs three forward passes: $6N_{\text{matmul}} + 6LdT$ per token, averaged over a
causal sequence of length $T$ (Section 11 derives it). The familiar shortcut is
$6N_{\text{total}}$, which counts every parameter and ignores attention. The block compares the
two for Llama-2-7B at its training length of 4,096 and splits the difference into its two
causes.

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

The shortcut makes two errors of opposite sign: it charges 0.79 GFLOP per token for the input
embedding, which is a lookup, and it leaves out the 3.22 GFLOP of attention. They do not cancel,
and $6N_{\text{total}}$ lands 5.7% below the convention. That is close enough for a first
estimate, which is why the shortcut survives, and far enough to matter when a utilisation figure
is computed from it. [Exercise 13](#e13) turns this per-token cost into the compute budget of
the whole Llama 2 run and a GPU utilisation; planning a budget with $6ND$ is
[Module 08](module_08_EN.html)'s subject.

### Step 9 — Where the parameters are

The table of Step 4 becomes a picture: one bar per published model, normalised to 100% and split
into embeddings, attention, feed-forward network and norms, with the total at the end of each
bar. This is the plot behind Figure 6.23 in Section 11. The norms are there too, but at under
0.1% of every model they are thinner than the bar's outline.

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

The three small models are a fifth to a third table (SmolLM2 21%, Qwen2.5 28%, GPT-2 32%);
Llama-2-7B is almost all layers, and two-thirds of each layer is feed-forward network. The attention share is smallest in
Qwen2.5-0.5B, where grouping shrinks the attention and the wide feed-forward network grows
around it.

### Step 10 — Attention against the matrix multiplies

The last plot is Step 7 drawn over context lengths from 512 to 131,072 on a logarithmic axis:
the flat cost of the matrix multiplies, the attention paid by one token at context $t$, that
token's total, and the attention averaged over a causal sequence of length $T$. The two vertical
lines mark the crossovers. This is the plot behind Figure 6.24.

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

Read the plot from left to right. Up to a few thousand tokens the total hugs the flat line and
the familiar "2 FLOPs per parameter per token" is accurate. The single-token attention line
crosses the flat line at $t = 25{,}205$, and beyond it a long-context token costs more for
attention than for all the weights of the model together; the causal average crosses twice as
far out, at $T = 50{,}410$. Both curves are straight lines in $t$, so on this logarithmic axis
they bend upwards: doubling the context doubles the attention term and leaves the matrix
multiplies alone.

### What you should see

- The counter agrees to the parameter with PyTorch for the module's two decoders (3,801,344 and
  727,424) and with the reference implementations for all five published models, and each count
  rounds to the size its authors quote: 124M, 135M, 0.49B, 6.7B and 8B.
- The non-embedding count is within 0.5% of the $12Ld^2$ rule for GPT-2 small and Llama-2-7B,
  the two models built as the rule assumes (multi-head attention, a feed-forward network of
  about $8d^2$), but 11% below it for SmolLM2-135M and 55% above it for Qwen2.5-0.5B:
  grouped-query attention removes up to $2d^2$ per layer and a wide feed-forward network adds
  $3 d_{\text{ff}}/d - 8$ units of $d^2$.
- Embeddings are a fifth to a third of the small models and under 4% of Llama-2-7B; Llama-3-8B's
  larger, untied vocabulary brings it back to 13%.
- The KV cache follows the number of KV heads: 512 KiB per token for Llama-2-7B's 32 heads,
  128 KiB for Llama-3-8B's 8; a single 4,096-token sequence at the Llama-2-7B shape costs 2 GiB,
  a sixth of the weights.
- Attention FLOPs are a rounding error at short context (2% at 512 tokens) and overtake the
  matrix multiplies beyond about $6d$ tokens of context for a single token (25,205 for
  Llama-2-7B) and beyond about $12d$ averaged over a causal sequence (50,410).
- Training costs 42.87 GFLOP per token for Llama-2-7B at $T = 4{,}096$ under the convention; the
  shortcut $6N_{\text{total}}$ gives 40.43, 5.7% low.

### Try this

1. **Mixture of experts.** Add two fields to `Cfg`, `n_experts` and `top_k`, and change the
   counter so that each layer holds `n_experts` copies of the feed-forward network plus a router
   (a $d \times n_{\text{experts}}$ matrix), while `n_matmul` counts only `top_k` experts per
   layer, the ones a token actually passes through. Print total against active parameters for
   the Llama-2-7B shape with 8 experts and top-2 routing; you should find about 37.0B in total
   and 11.1B active (both embedding tables included). The concept is in
   [Module 05](module_05_EN.html), the engineering in [Module 08](module_08_EN.html).
2. **A configuration you did not type.** If you are online, fetch the configuration of
   `HuggingFaceTB/SmolLM2-360M` with `transformers.AutoConfig.from_pretrained` (a download of
   about 1 KB, no weights), build a `Cfg` from its fields and confirm 361,821,120 parameters,
   then the same number from `LlamaForCausalLM` on the meta device.
3. **The cache against context length.** Write a function that returns the KV-cache size of one
   sequence as a function of its length and plot it for the Llama-2-7B shape with 32, 8 and 1 KV
   heads, from 1,000 to 128,000 tokens, with a horizontal line at the 12.6 GiB of the weights.
   Read off the context length at which one sequence's cache outweighs the model in each layout.

## Lab 5 — Train a tiny GPT, sample from it, then remove the mask {#lab5}

**Goal.** Train a character-level decoder on generated maintenance records, compare its
loss with source entropies, and test generated records. Then train the same architecture
without a causal mask. Prefix-only scoring will reveal a failure that held-out window
loss misses. The lab is self-contained and downloads no data.

### Step 1: generate the records

`QUICK = True` trains for 300 causal steps and 200 unmasked steps. Set it to `False`
for `FULL_STEPS = 1500` causal steps and the same 200 unmasked steps. Four CPU threads
keep the run comparable with the other labs; runtime depends on the machine. A full
run can take several minutes. The longer run gives copying more time to develop.

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

Each closing identifier repeats the opening one. The status is a deterministic function
of the displayed value. Thus the generator introduces uncertainty only in the record
type, identifier and value. A split by character position may cut one record; it does
not expose validation targets to training windows because windows stay within each split.

### Step 2: reference entropies

Unigram and bigram entropy below are plug-in estimates from training characters. The
generator entropy is calculated from the actual distribution of record types, numbers
and rounded pressure values. Rounding a uniform pressure gives half-width bins at the
two endpoints, rather than making all 71 printed values equally likely.

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

The no-copy reference assumes that the equipment letter is known from the record but
the repeated three digits are predicted afresh. It adds `log(1000)` per line. It is a
reference for a restricted predictor, rather than the entropy of the complete source.

### Step 3: the complete decoder and initialisation check

The model code is repeated here so this lab does not need variables from Lab 4. RoPE
uses adjacent pairs and both key and value heads are expanded in contiguous groups.

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

The unit-scale counterexample deliberately reinitialises the shared table; its exact
number depends on the draw. It demonstrates why an initial loss far above `log(vocab)`
deserves investigation before a training run.

### Step 4: causal training

Validation uses ten fixed held-out batches each time, while training has its own random
generator. The model has no dropout. Losses therefore compare the same validation
windows across checkpoints. Elapsed time is omitted from the printed output so machine
load does not obscure the numerical comparison.

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

QUICK need not learn the long-range copying rule. The longer schedule lets the loss
move below the no-copy reference, if the model learns to reuse the opening identifier.
Transition timing varies with floating-point arithmetic and schedule. If a full run
ends during the transition, try `FULL_STEPS = 2000` and report the extra compute.

### Step 5: sample and parse

Sample 32 independent sequences with a fixed sampling generator at temperature 0.8.
Exclude the incomplete last line of each sample. Report malformed lines separately;
identifier and status accuracy are conditional on the lines that satisfy the format.

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

Format, copying and status are distinct success criteria. A plausible record can have
the wrong closing identifier. This synthetic parser establishes correctness only for
the rules written here, rather than for a real maintenance decision.

### Step 6: train without the mask and evaluate prefixes

Use the same initialisation and training-batch seed. Changing the causal flag is the
only architecture change. A random held-out window supplies each prefix-only prediction
with between eight and 127 actual prefix characters, never its target.

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

The unmasked model can read most targets during window evaluation. The final input
position is an exception, since its next-character target lies beyond the window.
Prefix-only evaluation removes the leakage at every tested position. No held-out split
can compensate for using future input when predicting a target.

### Step 7: compare the curves

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

### What you should see

The causal loss crosses the unigram and bigram references while format and local
regularities improve. Compare the measured copying share with whether loss crosses the
no-copy reference. The unmasked model's window loss can become much lower while its
prefix-only loss and generated records expose the information leak. The printed outputs
are from the executed QUICK run; FULL observations are reported separately in the text.

With `QUICK = False`, the executed 1500-step causal run reached validation loss 0.399
and prefix-only loss 0.394. It generated 172 complete lines: all parsed, 155 copied
the opening identifier correctly (90.1%), and 171 had the correct status (99.4%).
Its validation loss fell below the no-copy reference after about 1000 steps. The
unmasked control remained at window loss 0.014 and prefix-only loss 1.291, and none
of its 83 complete generated lines parsed. The QUICK output fences above are retained
so the default code and displayed outputs describe the same run.

### Try this

1. Use a public-domain text of 0.2–2 MB; recompute the vocabulary and empirical entropies.
2. Reduce the context to 32 characters and inspect which parts of the opening identifier
   remain visible when each closing character is predicted. Do not assume one floor
   applies to every record length: this corpus contains different formats and lengths.
3. Repeat sampling at temperatures 0.3 and 1.5 and score format, copying and status again.

## Lab 6 — Find an induction head {#lab6}

**Goal.** Train an attention-only transformer on repeated random segments, measure
previous-token and induction attention, and intervene on the heads. Compare a two-layer
model with a one-layer control. Everything is generated locally; no model is downloaded.

### Step 1: generate a task whose copy distance varies

Draw a 64-token sequence and a segment length from 10 through 32. Repeat the first
segment immediately after itself. The first token of the repetition is not predictable
from its prefix; subsequent repeated tokens are. Targets are shifted one token ahead,
so a predictable target at position `j` is evaluated from query position `j - 1`.

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

A fixed copy distance could be solved by a position-based rule. Varying the distance
makes the model find a matching earlier token and use the token that followed it.
Random token collisions can still make the next token ambiguous; this is a task
distribution, rather than a guarantee that every repeated token has a unique match.

### Step 2: attention with accessible weights and head outputs

Explicit softmax lets the lab inspect attention and zero head outputs before the
output projection. Ablation removes the whole head's contribution, not just one
entry of its attention map. The model has no feed-forward sublayers.

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

### Step 3: train and separate predictable targets

Train on every target, not just the repeated region. Report predictable and unpredictable
losses on fixed fresh batches. The latter provide a useful control: random non-copy
targets should remain difficult even after copying improves.

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

### Step 4: quantify where heads attend

The previous-token score averages weight from query `t` to key `t - 1` over all
non-initial queries. For a predictable query `t`, the earlier successor is key
`t - n + 1`, with `n` the segment length. The induction score averages weight on
that key. Compute scores over 256 fresh sequences, rather than selecting a flattering
single example.

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

### Step 5: intervene on every head

Evaluate each intervention on the same 512 fresh sequences. A larger loss means the
head's contribution mattered to this trained model on this distribution. It does not
prove that the head is the unique implementation of a human-defined concept.

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

Removing a whole layer is an intervention outside the trained state distribution.
Compare it with single-head interventions and the attention scores instead of treating
any one loss change as a complete explanation.

### Step 6: a one-layer control

Use the same batch generator, training steps and optimiser. A one-layer model has fewer
parameters and only one attention stage, so the comparison changes both capacity and
available computation. It tests this particular setup, not a universal impossibility
theorem about one-layer transformers.

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

### What you should see

Compare the copying-loss curves, attention scores and ablation effects. In this task
the two-layer architecture can compose earlier-token information with a later lookup.
The one-layer control tests how much that composition helps. Heads with modest attention
scores can still affect outputs through their value and output projections; a heat map
alone is incomplete evidence. The printed numbers above come from this lab's execution,
and may differ in the last digits or transition timing on another machine.

### Try this

1. Fix the segment length at 32 and compare the one-layer control with variable distance.
2. Add SwiGLU sublayers and compare loss curves at both equal width and similar parameter
   count. Report which comparison is being made.
3. Repeat training with seeds 1 and 2. Check whether copying appears and which heads
   carry the measured patterns; head numbers need not have stable roles across seeds.
