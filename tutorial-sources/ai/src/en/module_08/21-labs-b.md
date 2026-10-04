## Lab 4 — A budget and memory calculator {#lab4}

**Goal.** Turn model shapes into a training budget and memory estimate. Compare ZeRO
stages, activation checkpointing, micro-batch sizes, pipeline bubbles and checkpoint
intervals. No datasets, model downloads or GPU are required. The formulas are estimates
whose assumptions remain visible; a configuration that passes still needs a measured run.

### Step 1: parameter counts

Use a bias-free, RMSNorm, SwiGLU decoder. The hypothetical case-study configuration is
the same one introduced in [Module 07](module_07_EN.html). The other rows let the
count be checked at a published shape and at the two planned small training shapes.

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

The small recipe's blocks contain 84,953,088 parameters and its tied embedding
24,576,000. The final norm adds 768, giving 109,529,856 in total. A count excluding
the final norm would be 109,529,088.
The laptop row is a shape calculation; it does not require another lab's checkpoint.

### Step 2: training compute and elapsed time

[Module 06, Section 11](module_06_EN.html#s11) owns the FLOP convention. Here its
result is a function: exclude lookup-only input embeddings, add causal-average attention,
then multiply by training tokens. The shortcut retains every parameter and omits attention.

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

Peak 989 TFLOP/s and sustained $4\times10^{14}$ FLOP/s are scenario inputs for this
calculation. Model FLOP utilisation uses the same arithmetic convention in numerator
and denominator. These elapsed times exclude downtime and assume the sustained rate
already reflects the selected implementation's communication and recomputation overhead.

### Step 3: model states under sharding

Assume two-byte weights, two-byte gradients and twelve bytes for fp32 master weights
plus two fp32 Adam moments. Plain data parallelism replicates all 16 bytes per parameter.
ZeRO-1 shards the twelve-byte optimiser state, ZeRO-2 also shards gradients and ZeRO-3
also shards weights. Actual systems may use different gradient dtypes or master weights.

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

ZeRO-3's permanent weight shard is not its peak allocation. Computing a layer requires
gathering its weights; communication buffers and overlapping gathers need extra memory.
The fit table below is a component estimate, not a guarantee from the allocator.

### Step 4: activations, logits and fits

The approximate saved-activation budget for this recipe is
$BTL(12d+4n_{\text{kv}}d_{\text{head}}+6d_{\text{ff}})$ bytes with fused attention.
Full checkpointing saves bf16 layer inputs and retains one recomputed layer's workspace.
The separate logits estimate reserves four bytes per vocabulary logit for fp32 loss
computation. A fused loss can require less; extra materialised probabilities can require more.

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

The numbers exclude allocator fragmentation, communication buffers, temporary layer
gathers and other framework allocations. Leave headroom and measure peak memory.
Reducing micro-batch size with gradient accumulation preserves the chosen global token
batch while reducing activations; it does not reduce permanent optimiser state.

### Step 5: pipeline bubbles and recovery intervals

For an ideal balanced pipeline with $p$ stages and $m$ micro-batches, the simple bubble
fraction is $(p-1)/(m+p-1)$. Actual schedules, uneven layers and interleaving change it.
For checkpoint write time $\delta$ and mean time between interruptions $M$, the
approximate overhead is $\delta/\tau+\tau/(2M)$. Differentiating with respect to the
interval $\tau$ gives $\tau^*=\sqrt{2\delta M}$.

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

The interruption rates are assumed scenarios. Independent per-device failure scaling
is a rough planning model; shared network and storage failures need not follow it.
The interval formula omits restart time and assumes complete, restorable checkpoints.
Test recovery of optimiser, scheduler, RNG and data-loader state before a long run.

### Step 6: reproduce the five-row shortcut table

Keep this table separate from the architecture-aware estimates above. It uses the
rounded 9.5B parameter count and $6ND$ throughout, matching Section 1's quick first
pass. The rows are planning scenarios, not records of completed training runs.

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

The 2T shortcut gives 41.2 days rather than the series rule's 44.0 days at the same
sustained throughput. Rounding a count and omitting attention are different
approximations; retain the labels when copying either result into a budget.

### Step 7: training allocation and equal-loss payback

Use Module 07's published parametric law, with raw parameter and token counts. Its
budget variable is $C_6=6ND$, so it does not use the architecture-aware FLOP function.
At fixed $C_6$, compare the analytic fitted minimum and the point constrained to
twenty tokens per parameter. Then solve for the *smallest training budget* whose
fitted optimum reaches the case study's predicted loss.

This equal-loss optimum can cost less to train but more per served token. Using
the same approximate serving charge of $2N$, solve
$C_6+2NS=C'_6+2N'S$ for the served-token break-even. A fixed-budget minimum has
a different loss and is not the right comparison for this equal-quality question.

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

These are extrapolated predictions: both the size and token counts extend beyond
the original fitting experiments. The break-even compares model arithmetic,
excluding attention, quantisation, capacity, batching and prices. It does not say
that either model achieves the same score on the team's safety-case evaluation.
The analogous planner exposes the same assumptions interactively.

### What you should see

The 2T-token base plan costs about $1.22\times10^{23}$ model FLOPs; the 2B-token
continued-pretraining plan costs a thousandth as much. On eight GPUs the case-study
state estimates are 152.8, 52.5, 35.8 and 19.1 GB for DP and ZeRO stages 1–3. Saved
activations drop from about 42.9 GB to 3.61 GB with full checkpointing. These savings
cost recomputation and do not include all runtime allocations.

### Try this

1. Sweep micro-batch size and plot total memory with and without checkpointing. Keep
   a separately labelled allowance for measured temporary and communication allocations.
2. Change gradients to fp32 and add another fp32 logits-sized loss intermediate to
   see which apparent fits disappear.
3. Add an eight-expert, top-two FFN. Separate total stored weights from active compute;
   sharding and capacity must account for all experts, including those not selected.

## Lab 5 — Continued pretraining with and without replay {#lab5}

**Goal.** Train a small story-language base inside this lab, adapt it to synthetic
safety-case text, and measure domain adaptation and forgetting across replay
ratios and learning rates. Compare each run with a gate fixed before training.

Use the same pinned 10 MB TinyStories file, downloaded if absent. This lab trains
its own tokenizer and base; it does not read Lab 2's checkpoint. Expect a few
minutes on a CPU or use a free Colab GPU. The generated engineering statements
are fictional training strings, including their claimed evidence and integrity
targets. They cannot establish that a real system meets a safety requirement.

### Repeat the independent base setup

Repeat the model declaration to make the lab runnable by itself. The base uses
width 128, four layers, four heads, feed-forward width 352 and context 128. Its
tokenizer is fitted on general stories only and stays fixed throughout adaptation.

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

### Generate domain text and audit tokenizer fit

Eight toy systems give the corpus varied engineering vocabulary. The first is
the case study's pressure-relief system. Random causes, mitigations, evidence
labels and timing claims create combinations of the same templates. Hold out
300 distinct documents, and explicitly exclude exact copies across the split.
Shared templates make this an easy adaptation experiment; the held-out loss is
not a test of whether the generated arguments are sound.

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

The mixed tokenizer is a diagnostic only. Replacing token ids underneath the
story base would change what its embedding and output rows mean. Adapting a
tokenizer requires an explicit embedding transition and more training; this lab
keeps the original vocabulary to isolate replay and learning rate.

### Train the small base and freeze the baseline

Train 400 steps on stories with warmup-cosine, matrix-only weight decay and
clipping. Evaluate ten fixed batches each of general and domain validation.
For this toy exercise, write the gate now: at least a one-nat domain-loss reduction
and at most a 0.20-nat general-loss rise. This is a diagnostic gate, not the real
case study's task-level acceptance rule.

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

### Continue from identical weights, varying replay and peak rate

Each continued run starts with fresh Adam state, 10 warmup steps and 100 total
updates. Each sequence comes wholly from general or domain data; replay is a
Bernoulli draw per sequence, not a forced exact fraction per batch. The same
sampler seed aligns the candidate windows across runs. Re-evaluate the same
held-out batches, then apply the already declared gate.

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

### Compare the text with the quantitative test

Use the same sampling seed, temperature and token limit for every prompt/model.
The small samples illustrate the kind of text produced; the held-out losses and
declared gate carry the comparison. A convincing-looking safety argument can
still contain invented evidence or unsupported claims.

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

### What you should see

This run's base had general/domain losses 3.510/7.019. At the low peak, general
loss rose by 1.044, 0.269 and 0.133 for 0%, 10% and 30% requested replay; domain
loss ended at 2.331, 2.466 and 2.706. Only the last passed the declared gate.
At the high peak, no replay raised general loss by 5.681 while reaching domain
loss 0.117; 30% replay reduced that rise to 0.287 and reached 0.176, still failing
the 0.20-nat limit. Actual replay shares were 10.75% and 31.0% because they were
sampled. Gate decisions precede inspection of the generated examples.

The story tokenizer fragments unfamiliar engineering words. A domain-aware BPE
can improve compression, but it is not interchangeable with the base's token
mapping. Continued training lowers loss on the shared domain templates; without
replay, updates can raise general held-out loss. The replay/rate table shows the
trade, including any conditions that fail the gate.

A stronger learning rate can adapt faster within the same step budget while
moving further from the base. Replay supplies gradients for preserving the old
distribution; lowering the rate limits movement. Neither guarantees retention
on every capability. The losses here use one fixed tokenizer, so comparisons
between checkpoints are meaningful; comparisons between different tokenizers
would also need a common unit such as bits per byte.

### Try this

1. Sweep replay ratios with a gate declared first. Repeat seeds and evaluate
   separate domain templates before choosing a real adaptation recipe.
2. Give the domain-only checkpoint a recovery phase on general stories, then
   measure both losses again. Recovery can also erase the adaptation.
3. Train small BPEs on saved English/Chinese tutorial text at two language
   mixtures. Compare compression, keep the test text held out, and explain the
   embedding transition needed before an existing base could use either mapping.
