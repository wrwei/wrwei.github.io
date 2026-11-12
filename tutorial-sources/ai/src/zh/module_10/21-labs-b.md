## 实验 4——从零量化：权重、离群值与激活 {#lab4}

**目标。**测量量化误差，区分权重误差与激活误差。预留 40 分钟。首次运行下载固定版本 SmolLM2-135M 权重（约 270 MB，实验 2 后已缓存），以及 0.73 MB 的 WikiText-2 测试 parquet 文件。在 PyTorch 和 Transformers 之外安装 `pandas`、`pyarrow`。使用 float32 CPU 推理、四个线程，以及 `QUICK = True` 的四个评估窗口；所示完整运行采用八个。校准与评估窗口不重叠，但来自同一数据集。

### 加载模型与固定文本窗口

```python
import math
import torch
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from torch import nn
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import hf_hub_download

torch.set_num_threads(4)
torch.manual_seed(0)
QUICK=False
MODEL='HuggingFaceTB/SmolLM2-135M'
REV='93efa2f097d58c2a74874c7e644dbc9b0cee75a2'
DATA_REV='b08601e04326c79dfdd32d625aee71d232d685c3'
tok=AutoTokenizer.from_pretrained(MODEL,revision=REV)
model=AutoModelForCausalLM.from_pretrained(MODEL,revision=REV,dtype=torch.float32,attn_implementation='sdpa').eval()
path=hf_hub_download('Salesforce/wikitext','wikitext-2-raw-v1/test-00000-of-00001.parquet',
                     repo_type='dataset',revision=DATA_REV)
text='\n\n'.join(pd.read_parquet(path)['text'].tolist())
ids=torch.tensor(tok.encode(text,add_special_tokens=False))
windows=4 if QUICK else 8
evaluation=ids[:windows*512].reshape(windows,512)
calibration=ids[200000:200000+4*512].reshape(4,512)
linears={name:layer for name,layer in model.named_modules()
         if isinstance(layer,nn.Linear) and name!='lm_head'}
original={name:layer.weight.detach().clone() for name,layer in linears.items()}
print('Text tokens:',len(ids),'evaluation tokens:',evaluation.numel())
print('Linear layers:',len(linears),'quantised parameters:',sum(w.numel() for w in original.values()))

@torch.inference_mode()
def perplexity():
    total=0.; count=0
    for batch in evaluation.split(4):
        logits=model(batch,use_cache=False).logits[:,:-1]
        labels=batch[:,1:]
        total+=F.cross_entropy(logits.reshape(-1,logits.shape[-1]),labels.reshape(-1),reduction='sum').item()
        count+=labels.numel()
    return math.exp(total/count)

baseline=perplexity()
print('float32 perplexity: %.4f' % baseline)
```

```output
Text tokens: 304986 evaluation tokens: 4096
Linear layers: 210 quantised parameters: 106168320
float32 perplexity: 20.8462
```

每个窗口评估 511 个下一 token 预测，不含跨窗口预测。困惑度是这些预测平均损失的指数，不是窗口困惑度的平均。与论文比较时，分词、拼接约定和窗口边界都重要。

### 量化后立即反量化

这是**伪量化（fake quantisation）**：模拟舍入损伤，却保留 float32 张量和内核。打印存储是假设打包后的线性层大小，不含嵌入、归一化、文件头和对齐。它不是进程内存，也不预测本实验中的加速。

```python
def quantise(w,bits=8,mode='tensor',zero=False,group=64):
    shape=w.shape
    if mode=='tensor': rows=w.reshape(1,-1)
    elif mode=='channel': rows=w.reshape(w.shape[0],-1)
    elif mode=='group': rows=w.reshape(-1,group)
    else: raise ValueError(mode)
    if zero:
        lo=rows.amin(-1,keepdim=True); hi=rows.amax(-1,keepdim=True)
        scale=((hi-lo)/(2**bits-1)).clamp_min(1e-12)
        zp=torch.round(-lo/scale)
        q=(torch.round(rows/scale)+zp).clamp(0,2**bits-1)
        out=scale*(q-zp)
    else:
        top=2**(bits-1)-1
        scale=(rows.abs().amax(-1,keepdim=True)/top).clamp_min(1e-12)
        out=torch.round(rows/scale).clamp(-top,top)*scale
    return out.reshape(shape)

def restore():
    with torch.no_grad():
        for name,layer in linears.items(): layer.weight.copy_(original[name])

records=[]
schemes=[('int8 tensor',8,'tensor',False),('int8 channel',8,'channel',False),
         ('int4 tensor',4,'tensor',False),('int4 channel',4,'channel',False),
         ('int4 group64',4,'group',False),('int4 group64 zero',4,'group',True)]
print('scheme              bits/w  linearMB mean_rel_error perplexity')
for label,bits,mode,zero in schemes:
    errors=[]; storage=0.
    with torch.no_grad():
        for name,layer in linears.items():
            w=original[name]; qw=quantise(w,bits,mode,zero)
            layer.weight.copy_(qw); errors.append(((w-qw).norm()/w.norm()).item())
            groups=1 if mode=='tensor' else (w.shape[0] if mode=='channel' else w.numel()//64)
            storage+=w.numel()*bits/8 + groups*(4 if zero else 2)
    n=sum(w.numel() for w in original.values())
    bpw=storage*8/n; ppl=perplexity()
    records.append((label,bpw,ppl))
    print('%-19s %6.3f %8.2f %14.4f %10.4f' % (label,bpw,storage/1e6,np.mean(errors),ppl))
restore()
```

```output
scheme              bits/w  linearMB mean_rel_error perplexity
int8 tensor          8.000   106.17         0.0290    21.6252
int8 channel         8.023   106.48         0.0085    20.9937
int4 tensor          4.000    53.08         0.4889 5834512.4874
int4 channel         4.023    53.40         0.1546    46.2519
int4 group64         4.250    56.40         0.1136    29.1763
int4 group64 zero    4.500    59.72         0.0947    27.1402
```

### 在校准文本上寻找激活离群值

钩子观察每个线性层的输入。逐输入通道最大值在全部校准 token 上汇总，再与通道中位数比较。最差权重比值采用相同输入通道方向。平滑缩放因子的选择不使用评估激活。

```python
stats={}; hooks=[]
for name,layer in linears.items():
    def collect(module,args,name=name):
        x=args[0].detach().reshape(-1,args[0].shape[-1]).abs().amax(0)
        stats[name]=x if name not in stats else torch.maximum(stats[name],x)
    hooks.append(layer.register_forward_pre_hook(collect))
with torch.inference_mode():
    for batch in calibration.split(2): model(batch,use_cache=False)
for hook in hooks: hook.remove()
ratios={name:float(x.max()/x.median().clamp_min(1e-12)) for name,x in stats.items()}
worst=max(ratios,key=ratios.get)
weight_ratios=[]
for w in original.values():
    x=w.abs().amax(0); weight_ratios.append(float(x.max()/x.median()))
print('Worst activation layer:',worst)
print('max=%.3f median=%.3f ratio=%.1f' % (stats[worst].max(),stats[worst].median(),ratios[worst]))
print('Median activation ratio %.2f; worst weight ratio %.2f' % (np.median(list(ratios.values())),max(weight_ratios)))
```

```output
Worst activation layer: model.layers.11.mlp.down_proj
max=2479.243 median=1.307 ratio=1897.2
Median activation ratio 7.95; worst weight ratio 12.42
```

### 模拟 W8A8 与 SmoothQuant

对于 PyTorch 按行存储的权重矩阵，等价变换为 `weight * s` 和 `input / s`。钩子显式执行除法，使效果可见；代码不实现融合生产内核。将缩放因子折叠进前面的运算，需要尊重激活的所有使用者；有些投影需要比修改一个 RMSNorm 向量更谨慎。

```python
for alpha in [None,.5,.8]:
    restore(); hooks=[]
    with torch.no_grad():
        for name,layer in linears.items():
            w=original[name]
            s=torch.ones(w.shape[1]) if alpha is None else (
                stats[name].clamp_min(1e-8)**alpha /
                w.abs().amax(0).clamp_min(1e-8)**(1-alpha))
            layer.weight.copy_(quantise(w*s,8,'channel'))
            def activation(module,args,s=s):
                return (quantise(args[0]/s,8,'tensor'),)
            hooks.append(layer.register_forward_pre_hook(activation))
    ppl=perplexity()
    label='W8A8' if alpha is None else 'SmoothQuant %.1f' % alpha
    print(label,'perplexity %.4f' % ppl); records.append((label,8.03,ppl))
    for hook in hooks: hook.remove()
restore()
fig,ax=plt.subplots(figsize=(8,4))
for i,(label,bits,ppl) in enumerate(records):
    ax.scatter(bits,ppl); ax.annotate(label,(bits,ppl),xytext=(5,4+i%3*10),textcoords='offset points',fontsize=8)
ax.axhline(baseline,linestyle='--',color='black',label='float32 baseline')
ax.set(yscale='log',xlabel='Bits per stored linear weight',ylabel='Perplexity'); ax.legend()
fig.tight_layout(); plt.show()
```

```output
W8A8 perplexity 40.8337
SmoothQuant 0.5 perplexity 26.2966
SmoothQuant 0.8 perplexity 23.6349
```

**解释。**更细的权重粒度通常有益，但激活离群值可能破坏原本准确的 int8 权重。SmoothQuant 在舍入前重新分配范围，保留未量化乘积，而非舍入乘积。这些结果涉及一个 135M 模型、一个短文本样本和这些简单量化器，不能确定 int4 或校准方法的普遍质量损失。

**继续尝试。**将下投影保留八位，测量权衡。在提升任何量化产物前，除通用困惑度外，还应使用留出的工程任务。

## 实验 5——从零实现投机解码 {#lab5}

**目标。**一次提出多个 token，同时保留目标模型贪心输出，再独立验证随机接受定理。预留 35 分钟。下载固定版本 SmolLM2-360M，约 724 MB，另需实验 2 已使用的 270 MB 草稿。两者均在 CPU 上以 float32 运行。CPU 加速是实验结果，不是算法正确的必要条件。

### 加载兼容模型，测量单步成本

词表 id 必须表示相同 token。我们检查完整分词器映射，而不仅是词表大小。计时前预热，并采用中位数。计时的短上下文单步，是后续生成成本的近似。

```python
import math
import time
import statistics
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, DynamicCache

torch.set_num_threads(4)
torch.manual_seed(0)
DRAFT='HuggingFaceTB/SmolLM2-135M'
TARGET='HuggingFaceTB/SmolLM2-360M'
DREV='93efa2f097d58c2a74874c7e644dbc9b0cee75a2'
TREV='f8027fd0eaeea54caa13c31d31b9fdc459c38b49'
tok=AutoTokenizer.from_pretrained(DRAFT,revision=DREV)
target_tok=AutoTokenizer.from_pretrained(TARGET,revision=TREV)
assert tok.get_vocab()==target_tok.get_vocab()
draft=AutoModelForCausalLM.from_pretrained(DRAFT,revision=DREV,dtype=torch.float32,attn_implementation='sdpa').eval()
target=AutoModelForCausalLM.from_pretrained(TARGET,revision=TREV,dtype=torch.float32,attn_implementation='sdpa').eval()
print('Draft parameters:',sum(p.numel() for p in draft.parameters()))
print('Target parameters:',sum(p.numel() for p in target.parameters()))

@torch.inference_mode()
def step_cost(model,width):
    prefix=torch.tensor([tok.encode('A safety case links a claim to evidence and states assumptions about the system.',add_special_tokens=False)])
    cache=model(prefix,past_key_values=DynamicCache(config=model.config),use_cache=True).past_key_values
    length=cache.get_seq_length(); suffix=torch.full((1,width),100,dtype=torch.long)
    durations=[]
    for i in range(23):
        cache.crop(length)
        begin=time.perf_counter(); model(suffix,past_key_values=cache,use_cache=True)
        elapsed=time.perf_counter()-begin
        if i>=3: durations.append(elapsed)
    return statistics.median(durations)

td=step_cost(draft,1); tt=step_cost(target,1)
verification={g:step_cost(target,g+1)/tt for g in [2,4,6]}
c=td/tt
print('Draft %.2fms target %.2fms c=%.3f' % (td*1000,tt*1000,c))
for g,v in verification.items(): print('gamma=%d verification=%.3f target steps' % (g,v))
```

```output
Draft parameters: 134515008
Target parameters: 361821120
Draft 17.02ms target 38.07ms c=0.447
gamma=2 verification=1.188 target steps
gamma=4 verification=1.224 target steps
gamma=6 verification=1.281 target steps
```

### 实现目标基线与缓存回滚

迭代边界处，目标缓存覆盖除最后一个以外的所有已提交 token。目标一起处理最后 token 和全部提议，产生提议预测与一个奖励 token。拒绝后，裁剪全部未提交状态。草稿可能落后一个已接受 token；其下次调用输入缓存中缺少的每个已提交 token。这避免在一次全部接受的迭代之后，悄悄向草稿提供错误前缀。

```python
@torch.inference_mode()
def greedy(model,ids,n=64):
    out=ids.clone(); cache=DynamicCache(config=model.config)
    if ids.shape[1]>1: model(ids[:,:-1],past_key_values=cache,use_cache=True)
    for _ in range(n):
        logits=model(out[:,cache.get_seq_length():],past_key_values=cache,use_cache=True).logits[:,-1]
        out=torch.cat((out,logits.argmax(-1)[:,None]),1)
    return out

@torch.inference_mode()
def speculative(ids,n=64,gamma=4):
    out=ids.clone(); initial=out.shape[1]
    dc=DynamicCache(config=draft.config); tc=DynamicCache(config=target.config)
    if initial>1:
        draft(out[:,:-1],past_key_values=dc,use_cache=True)
        target(out[:,:-1],past_key_values=tc,use_cache=True)
    accepted=0; rejected=0; iterations=0; min_gap=math.inf
    while out.shape[1]<initial+n:
        base=out.shape[1]; proposed=out.clone()
        for _ in range(gamma):
            logits=draft(proposed[:,dc.get_seq_length():],past_key_values=dc,use_cache=True).logits[:,-1]
            proposed=torch.cat((proposed,logits.argmax(-1)[:,None]),1)
        scores=target(proposed[:,tc.get_seq_length():],past_key_values=tc,use_cache=True).logits[0]
        picks=scores.argmax(-1); proposals=proposed[0,base:]
        k=0
        while k<gamma and proposals[k]==picks[k]: k+=1
        accepted+=k; rejected+=int(k<gamma); iterations+=1
        gaps=scores.topk(2,dim=-1).values
        min_gap=min(min_gap,float((gaps[:,0]-gaps[:,1]).min()))
        emitted=torch.cat((proposals[:k],picks[k:k+1]))
        remaining=initial+n-base
        out=torch.cat((out,emitted[:remaining][None]),1)
        committed=out.shape[1]-1
        tc.crop(committed); dc.crop(min(committed,dc.get_seq_length()))
    return out,accepted,rejected,iterations,min_gap

prompts=['A safety case is a structured argument that',
         'The main steps of a hazard analysis and risk assessment are',
         'def fibonacci(n):\n    ',
         'The industrial revolution began in',
         'Thermal runaway in a lithium-ion battery occurs when']
inputs=[torch.tensor([tok.encode(p,add_special_tokens=False)]) for p in prompts]
_ = greedy(target,inputs[0],4)
begin=time.perf_counter(); baseline=[greedy(target,x) for x in inputs]
baseline_s=time.perf_counter()-begin
print('Target baseline %.3fs, %.2f output tok/s' % (baseline_s,320/baseline_s))
for gamma in [2,4,6]:
    begin=time.perf_counter(); runs=[speculative(x,gamma=gamma) for x in inputs]
    elapsed=time.perf_counter()-begin
    a=sum(r[1] for r in runs); rejects=sum(r[2] for r in runs); iters=sum(r[3] for r in runs)
    alpha=a/(a+rejects); expected=sum(alpha**k for k in range(gamma+1))
    matches=[torch.equal(r[0],b) for r,b in zip(runs,baseline)]
    print('gamma=%d alpha=%.3f tokens/iter=%.3f predicted=%.3f equal=%s time=%.3fs speedup=%.3f predicted_speedup=%.3f min_verified_gap=%.3g' %
          (gamma,alpha,320/iters,expected,matches,elapsed,baseline_s/elapsed,
           expected/(gamma*c+verification[gamma]),min(r[4] for r in runs)))
    assert all(matches), 'Inspect the first differing token and its target top-two gap'
```

```output
Target baseline 12.442s, 25.72 output tok/s
gamma=2 alpha=0.850 tokens/iter=2.540 predicted=2.574 equal=[True, True, True, True, True] time=11.146s speedup=1.116 predicted_speedup=1.236 min_verified_gap=0.00274
gamma=4 alpha=0.865 tokens/iter=3.636 predicted=3.819 equal=[True, True, True, True, True] time=11.082s speedup=1.123 predicted_speedup=1.268 min_verified_gap=0.00273
gamma=6 alpha=0.864 tokens/iter=4.324 predicted=4.711 equal=[True, True, True, True, True] time=12.294s speedup=1.012 predicted_speedup=1.189 min_verified_gap=0.00274
```

最后迭代在 64 个输出 token 处截断。被丢弃提议仍需时间，因此实测每次迭代 token 数可能低于未截断几何预测。接受事件也未必独立。如发生不匹配，需要诊断：可能是回滚或索引错误，也可能是不同数值内核改变了接近并列的 argmax。它不表示随机投机应有意改变目标分布。

### 不生成二十万句话，也能检查随机精确性

一个条件下一 token 分布，已足以测试接受恒等式。下面的向量化试验从完整的 49,152-token 词表采样。即使算法正确，有限样本总变差仍为正。

```python
with torch.inference_mode():
    ids=inputs[1]
    p=target(ids,use_cache=False).logits[0,-1].softmax(-1)
    q=draft(ids,use_cache=False).logits[0,-1].softmax(-1)
    overlap=torch.minimum(p,q).sum()
    residual=(p-q).clamp_min(0); residual/=residual.sum()
    count=200000
    torch.manual_seed(0)
    candidates=torch.multinomial(q,count,replacement=True)
    accept=torch.rand(count)<(p[candidates]/q[candidates]).clamp(max=1)
    replacements=torch.multinomial(residual,count,replacement=True)
    emitted=torch.where(accept,candidates,replacements)
    empirical=torch.bincount(emitted,minlength=p.numel()).float()/count
    analytic=torch.minimum(p,q)+(1-overlap)*residual
    print('Acceptance empirical %.5f analytic %.5f' % (accept.float().mean(),overlap))
    print('TV(empirical,p)=%.5f TV(q,p)=%.5f analytic_max_error=%.3g' %
          (.5*(empirical-p).abs().sum(),.5*(q-p).abs().sum(),(analytic-p).abs().max()))
    for token in p.topk(5).indices:
        print(repr(tok.decode([int(token)])),'p=%.5f empirical=%.5f' % (p[token],empirical[token]))
```

```output
Acceptance empirical 0.80998 analytic 0.81007
TV(empirical,p)=0.01633 TV(q,p)=0.18995 analytic_max_error=4.42e-06
':' p=0.36838 empirical=0.36836
' as' p=0.17046 empirical=0.17063
' to' p=0.06203 empirical=0.06236
' listed' p=0.05193 empirical=0.05187
' described' p=0.04327 empirical=0.04262
```

**解释。**正确性与加速是不同问题。接受与残差恒等式恢复目标概率。加速取决于接受率、草稿成本、验证成本和负载。这两个小型 CPU 模型适合检查，即使加速很小或为负。

**继续尝试。**在复制任务上，将神经草稿换成提示中匹配的 n-gram 续写。保留目标验证与回滚。

## 实验 6——CPU 批量生成：吞吐量与确定性 {#lab6}

**目标。**测量批处理对总吞吐量和每请求速度的影响，再比较同一提示单独运行与放入 batch 的结果。预留 20 分钟。使用实验 2 已缓存的固定版本 SmolLM2-135M，无需服务器或新下载。这是固定 batch CPU 实验，不是开环部署负载测试。

### 左侧填充提示，提供正确位置

左侧填充使每行最后一个输入列是真实 token。位置 id 来自注意力掩码，因此填充不会沿 RoPE 位置移动真实 token。缓存张量长度仍包含填充列：物理缓存长度与某行语义位置是不同量。

```python
import time
import statistics
import torch
import numpy as np
import matplotlib.pyplot as plt
from transformers import AutoTokenizer, AutoModelForCausalLM, DynamicCache

torch.set_num_threads(4)
torch.manual_seed(0)
MODEL='HuggingFaceTB/SmolLM2-135M'
REV='93efa2f097d58c2a74874c7e644dbc9b0cee75a2'
tok=AutoTokenizer.from_pretrained(MODEL,revision=REV)
tok.pad_token=tok.eos_token; tok.padding_side='left'
model=AutoModelForCausalLM.from_pretrained(MODEL,revision=REV,dtype=torch.float32,attn_implementation='sdpa').eval()
prompts=['The pressure relief valve protects the reactor vessel from overpressure.',
         'A hazard log entry identifies an initiating event, a consequence and the evidence for each credited safeguard.',
         'An engineer checks every assumption in the safety case before accepting a claim.',
         'The reactor vessel pressure sensor should detect a dangerous rise in pressure.',
         'A blocked discharge pipe changes the performance of the relief system because',
         'Evidence for the inspection interval includes operating records and the results of a component test.',
         'A claim without an evidence reference should be marked for review.',
         'The model drafts a structured argument, while a competent engineer checks its validity against the plant design.',
         'The industrial revolution began in Britain and spread because',
         'The first step in debugging a Python program is to reproduce the error.',
         'A function that sorts a list of integers returns',
         'A normal distribution is described by its mean and variance.',
         'The Earth orbits the Sun once every year because',
         'A robust measurement records its units and uncertainty.',
         'The operator follows the shutdown procedure when the pressure exceeds its allowed operating limit.',
         'A test of the backup protection system should include the failure of its primary sensor.']
print('Parameters:',sum(p.numel() for p in model.parameters()))
print('Prompt lengths:',[len(tok.encode(p,add_special_tokens=False)) for p in prompts])

@torch.inference_mode()
def batched_greedy(texts,n_new=64,keep_logits=False):
    encoded=tok(texts,return_tensors='pt',padding=True,add_special_tokens=False)
    ids=encoded.input_ids; mask=encoded.attention_mask
    pos=(mask.cumsum(-1)-1).clamp_min(0)
    next_pos=pos[:,-1:]+1
    cache=DynamicCache(config=model.config)
    begin=time.perf_counter()
    result=model(ids,attention_mask=mask,position_ids=pos,past_key_values=cache,use_cache=True)
    prefill=time.perf_counter()-begin
    logits=result.logits[:,-1]; logs=[logits[0].clone()] if keep_logits else []
    tokens=[logits.argmax(-1)]; times=[]
    for _ in range(n_new-1):
        mask=torch.cat((mask,torch.ones_like(mask[:,:1])),1)
        begin=time.perf_counter()
        result=model(tokens[-1][:,None],attention_mask=mask,position_ids=next_pos,
                     past_key_values=cache,use_cache=True)
        times.append(time.perf_counter()-begin)
        next_pos+=1; logits=result.logits[:,-1]; tokens.append(logits.argmax(-1))
        if keep_logits: logs.append(logits[0].clone())
    return torch.stack(tokens,1),prefill,times,(torch.stack(logs) if keep_logits else None),ids.shape[1]

# Replace these with your own Lab 1 measurements.
CPU_BW_GB=48.24
CPU_PEAK_GFLOPS=621.6
n=sum(p.numel() for p in model.parameters())
rows=[]
print('B TTFTms stepms per_sequence aggregate predictedms measured/predicted')
for b in [1,2,4,8,16]:
    batched_greedy(prompts[:b],4)
    tokens,ttft,times,_,padded=batched_greedy(prompts[:b])
    sec=statistics.median(times); ctx=padded+32
    memory=(4*n+b*46080*ctx)/(CPU_BW_GB*1e9)
    compute=(2*n*b+4*30*576*ctx*b)/(CPU_PEAK_GFLOPS*1e9)
    predicted=max(memory,compute)
    rows.append((b,1/sec,b/sec,1/predicted,b/predicted))
    print('%2d %7.2f %6.2f %12.2f %9.2f %11.2f %18.2f' %
          (b,ttft*1000,sec*1000,1/sec,b/sec,predicted*1000,sec/predicted))
fig,ax=plt.subplots(figsize=(7,4))
for column,label in [(1,'per sequence'),(2,'aggregate')]:
    ax.plot([r[0] for r in rows],[r[column] for r in rows],'o-',label=label)
    ax.plot([r[0] for r in rows],[r[column+2] for r in rows],'--',label=label+' roofline')
ax.set(xscale='log',yscale='log',xlabel='Batch size',ylabel='Output tokens/s'); ax.legend()
fig.tight_layout(); plt.show()
```

```output
Parameters: 134515008
Prompt lengths: [12, 19, 14, 13, 12, 16, 12, 19, 9, 14, 9, 11, 9, 9, 15, 16]
B TTFTms stepms per_sequence aggregate predictedms measured/predicted
 1   39.39  17.69        56.54     56.54       11.20               1.58
 2   36.37  21.80        45.87     91.74       11.25               1.94
 4   57.29  22.86        43.74    174.97       11.35               2.01
 8  121.52  26.39        37.90    303.16       11.54               2.29
16  161.47  30.59        32.69    523.05       11.93               2.56
```

实测预填充区间只包含模型前向传播；客户端 TTFT 还包括分词、调度、采样与传输。这里每序列 token/s 使用中位解码步，总 token/s 再乘 B。两者都不是端到端服务容量。即使遇到 EOS，模型仍生成 64 个位置，使比较长度相同。

### 在不同 batch 形状下比较相同语义提示

```python
solo,_,_,solo_logits,_=batched_greedy(prompts[:1],keep_logits=True)
batch,_,_,batch_logits,padded=batched_greedy(prompts[:8],keep_logits=True)
diff=(solo_logits-batch_logits).abs().amax(-1)
top=solo_logits.topk(2,dim=-1).values
gaps=top[:,0]-top[:,1]; smallest=int(gaps.argmin())
same=torch.equal(solo[0],batch[0]); differences=(solo[0]!=batch[0]).nonzero()
first=None if differences.numel()==0 else int(differences[0])
print('Padding columns for row0:',padded-len(tok.encode(prompts[0],add_special_tokens=False)))
print('Tokens equal:',same,'first differing output:',first)
print('Max logit difference %.6g; median %.6g' % (diff.max(),diff.median()))
print('Smallest top-two gap %.6g at output step %d' % (gaps[smallest],smallest))
if not same:
    print('Gap at first difference:',float(gaps[first]))
```

```output
Padding columns for row0: 7
Tokens equal: True first differing output: None
Max logit difference 5.76973e-05; median 3.52859e-05
Smallest top-two gap 0.0557842 at output step 22
```

如果输出分歧，首个不同 token 之后的 logit 比较，会混合算术差异和不同条件文本。应在共同前缀上检查首个差异。有限测试中的相同输出，只支持该次运行，不保证另一精度或引擎下相等。

**继续尝试。**将输出延长至 512 个 token，比较不同填充长度，并记录首个不同 token。可选 GPU 扩展，是用 vLLM 部署受支持的小模型，再采用流式客户端时间戳与开环到达重复实验；引擎安装、GPU 内存与下载属于额外要求，因此正文结果均不依赖该扩展。
