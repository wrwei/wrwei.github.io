## 实验 1——屋顶线与容量计算器 {#lab1}

**目标。**复现案例的内存与时延边界，再测量自己 CPU 的矩阵乘法屋顶线。无需下载。计算采用十进制单位、50% 预填充 MFU 和峰值解码带宽；这些是假设，不是 GPU 实测性能。预留 25 分钟完成实验。

### 统计参数与字节

现代解码器块中的七个投影矩阵，是四个注意力投影和三个 SwiGLU 投影。两个 RMSNorm 向量补全该块。假设模型的输出头未绑定。我们将很小的归一化计数保留在本系列近似的矩阵 FLOP 约定中。

```python
from dataclasses import dataclass, replace
import time
import statistics
import numpy as np
import matplotlib.pyplot as plt
import torch

torch.set_num_threads(4)
torch.manual_seed(0)

@dataclass
class Model:
    name: str
    layers: int
    d: int
    heads: int
    kv_heads: int
    head_dim: int
    d_ff: int
    vocab: int
    tied: bool
    weight_bytes: float

    @property
    def n_params(self):
        attention = 2*self.d*self.d + 2*self.d*self.kv_heads*self.head_dim
        block = attention + 3*self.d*self.d_ff + 2*self.d
        return self.layers*block + self.d + self.vocab*self.d*(1 if self.tied else 2)

    @property
    def n_matmul(self):
        return self.n_params - (0 if self.tied else self.vocab*self.d)

@dataclass
class Accelerator:
    name: str
    mem_gb: float
    bw_tb_s: float
    tflops: float

case = Model('case', 36, 4096, 32, 8, 128, 15360, 152064, False, 5.5e9)
linears = case.layers*(2*case.d**2 + 2*case.d*case.kv_heads*case.head_dim
                       + 3*case.d*case.d_ff)
norms = (2*case.layers+1)*case.d
file_bytes = linears*4.125/8 + norms*2 + 2*case.vocab*case.d
cards = [Accelerator('24GB-1.0',24,1.0,165), Accelerator('24GB-0.3',24,.30,121),
         Accelerator('48GB',48,.864,362), Accelerator('80GB-2.039',80,2.039,312),
         Accelerator('80GB-3.35',80,3.35,989)]
print('N:', case.n_params, 'N_matmul:', case.n_matmul)
print('Serving file before packaging metadata: %.6f GB' % (file_bytes/1e9))
for a in cards:
    print(a.name, 'ridge %.1f FLOP/byte' % (a.tflops/a.bw_tb_s))

def kv_token(m, bytes_value=2):
    return 2*m.layers*m.kv_heads*m.head_dim*bytes_value

def prefill(m,a,t,mfu=.5):
    return (2*m.n_matmul*t + 2*m.layers*m.d*t*t)/(mfu*a.tflops*1e12)

def step(m,a,b,ctx,bytes_kv=2):
    mem = (m.weight_bytes+b*kv_token(m,bytes_kv)*ctx)/(a.bw_tb_s*1e12)
    comp = (2*m.n_matmul*b+4*m.layers*m.d*b*ctx)/(a.tflops*1e12)
    return max(mem,comp)

def size(m,a,prompt=4000,out=2000,overhead=2.5):
    free = a.mem_gb*1e9-m.weight_bytes-overhead*1e9
    b = max(0,int(free//(kv_token(m)*(prompt+out))))
    ctx = prompt+out/2
    return free/1e9,b,prefill(m,a,prompt),1/step(m,a,1,ctx),b/step(m,a,max(1,b),ctx)

print('KV B/token:',kv_token(case),'int8:',kv_token(case,1))
print('KV for 6000 tokens: %.6f GB' % (kv_token(case)*6000/1e9))
print('card         freeGB  B  TTFTs  solo tok/s  batch tok/s')
for a in cards:
    free,b,ttft,solo,total=size(case,a)
    print('%-13s %5.1f %2d %6.3f %10.1f %12.1f' % (a.name,free,b,ttft,solo,total))
for precision,bytes_w in [('bf16',2*case.n_params),('int8',case.n_params)]:
    m=replace(case,weight_bytes=bytes_w)
    print(precision, 'B=%d, solo=%.1f tok/s' % (size(m,cards[0])[1],size(m,cards[0])[3]))
```

```output
N: 9550729216 N_matmul: 8927875072
Serving file before packaging metadata: 5.528429 GB
24GB-1.0 ridge 165.0 FLOP/byte
24GB-0.3 ridge 403.3 FLOP/byte
48GB ridge 419.0 FLOP/byte
80GB-2.039 ridge 153.0 FLOP/byte
80GB-3.35 ridge 295.2 FLOP/byte
KV B/token: 147456 int8: 73728
KV for 6000 tokens: 0.884736 GB
card         freeGB  B  TTFTs  solo tok/s  batch tok/s
24GB-1.0       16.0 18  0.923      160.3        958.9
24GB-0.3       16.0 18  1.259       48.1        287.7
48GB           40.0 45  0.421      138.5       1005.2
80GB-2.039     72.0 81  0.488      326.9       2532.3
80GB-3.35      72.0 81  0.154      537.1       4160.6
bf16 B=2, solo=50.4 tok/s
int8 B=13, solo=97.2 tok/s
```

### 测量 CPU，而不凭时钟频率猜测

8,192 阶方形 float32 矩阵占 268 MB，即 256 MiB。预热后重复五次减少噪声，但后台活动仍有影响。有效 GB/s 计入每个输入的一次读取和输出的一次写入；它是流量模型，不是硬件计数器测量。保留实测 B = 1 带宽和最大乘积的 GFLOP/s，用于实验 5 和 6。B = 1 可能采用单独的矩阵向量内核，因此 B = 2 未必耗时相同。

```python
d=8192
w=torch.randn(d,d)
rows=[]
print('B  ms       GFLOP/s  effectiveGB/s  FLOP/byte')
for b in [1,2,4,8,16,32,64,128,256,512]:
    x=torch.randn(d,b)
    _=w@x
    times=[]
    for _ in range(5):
        begin=time.perf_counter(); y=w@x; times.append(time.perf_counter()-begin)
    sec=statistics.median(times)
    flops=2*d*d*b
    moved=4*(d*d+2*d*b)
    rows.append((b,sec,flops/sec/1e9,moved/sec/1e9,flops/moved))
    print('%3d %8.3f %8.1f %13.2f %10.2f' % (b,sec*1000,flops/sec/1e9,moved/sec/1e9,flops/moved))
bw=rows[0][3]; peak=rows[-1][2]
print('CPU model: %.2f GB/s, %.1f GFLOP/s, ridge %.2f FLOP/byte' % (bw,peak,peak/bw))
for name,n in [('SmolLM2-135M',134515008),('SmolLM2-360M',361821120)]:
    print(name,'float32 weights-only floor %.2f ms' % (4*n/(bw*1e9)*1000))
i=np.logspace(-1,4,300)
fig,axes=plt.subplots(1,2,figsize=(10,4))
for a in [cards[0],cards[-1]]:
    axes[0].loglog(i,np.minimum(a.tflops,i*a.bw_tb_s),label=a.name)
axes[0].set(xlabel='FLOP/byte',ylabel='TFLOP/s'); axes[0].legend()
axes[1].loglog(i,np.minimum(peak,i*bw),label='CPU estimated roof')
axes[1].scatter([r[4] for r in rows],[r[2] for r in rows],label='measured products')
axes[1].set(xlabel='FLOP/byte',ylabel='GFLOP/s'); axes[1].legend()
fig.tight_layout(); plt.show()
```

```output
B  ms       GFLOP/s  effectiveGB/s  FLOP/byte
  1    5.566     24.1         48.24       0.50
  2   10.643     25.2         25.23       1.00
  4   10.364     51.8         25.93       2.00
  8   10.579    101.5         25.42       3.99
 16   11.100    193.5         24.28       7.97
 32   14.447    297.3         18.73      15.88
 64   19.956    430.4         13.66      31.51
128   32.615    526.7          8.49      62.06
256   57.618    596.3          4.95     120.47
512  110.550    621.6          2.73     227.56
CPU model: 48.24 GB/s, 621.6 GFLOP/s, ridge 12.88 FLOP/byte
SmolLM2-135M float32 weights-only floor 11.15 ms
SmolLM2-360M float32 weights-only floor 30.00 ms
```

**解释。**两个 24 GB 配置接纳相同请求数，却具有不同解码速度。CPU 上，总算术吞吐量通常随 B 增加，尽管单个乘积变慢。屋顶线识别可能瓶颈；由于开销、局部性和低效内核，实测点可能远低于它。

**继续尝试。**增加一个容量和带宽翻倍的双设备配置，再应用假设通信损失。该估算在指导真实购买前，需要互连模型。

## 实验 2——小解码器的 KV cache 与手工前缀缓存 {#lab2}

**目标。**将缓存 logits 与完整因果前向传播比较，测量确切缓存字节数，暴露 token 比较遗漏的位置错误。最后一步下载固定版本的 SmolLM2-135M 权重，约 270 MB，后续实验复用。所有内容在 CPU 上以 float32、四个线程运行。预留 35 分钟。

### 构建显式位置的未训练解码器

随机权重已足够：缓存正确性是代数属性，不是语言学习结果。模型具有四个块、宽度 256、八个查询头、两个 KV 头和宽度 688 的 SwiGLU 中间层。缓存保持紧凑的双头表示，只在注意力计算中重复。

```python
import copy
import time
import statistics
import torch
from torch import nn
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForCausalLM, DynamicCache

torch.set_num_threads(4)
torch.manual_seed(0)

class RMS(nn.Module):
    def __init__(self,d):
        super().__init__(); self.weight=nn.Parameter(torch.ones(d))
    def forward(self,x):
        return x*torch.rsqrt(x.square().mean(-1,keepdim=True)+1e-5)*self.weight

def rope(x,start):
    # Split-half RoPE; positions are absolute, including a reused prefix.
    half=x.shape[-1]//2
    freq=10000.**(-torch.arange(half,dtype=x.dtype)/half)
    angles=torch.arange(start,start+x.shape[-2],dtype=x.dtype)[:,None]*freq[None,:]
    c=angles.cos()[None,None]; s=angles.sin()[None,None]
    a,b=x[...,:half],x[...,half:]
    return torch.cat((a*c-b*s,a*s+b*c),dim=-1)

class Block(nn.Module):
    def __init__(self):
        super().__init__()
        self.n1=RMS(256); self.n2=RMS(256)
        self.q=nn.Linear(256,256,bias=False)
        self.k=nn.Linear(256,64,bias=False); self.v=nn.Linear(256,64,bias=False)
        self.o=nn.Linear(256,256,bias=False)
        self.gate=nn.Linear(256,688,bias=False)
        self.up=nn.Linear(256,688,bias=False); self.down=nn.Linear(688,256,bias=False)
    def forward(self,x,past,start):
        z=self.n1(x); b,t,_=z.shape
        q=rope(self.q(z).view(b,t,8,32).transpose(1,2),start)
        k=rope(self.k(z).view(b,t,2,32).transpose(1,2),start)
        v=self.v(z).view(b,t,2,32).transpose(1,2)
        old=0 if past is None else past[0].shape[2]
        if past is not None:
            k=torch.cat((past[0],k),2); v=torch.cat((past[1],v),2)
        mask=torch.arange(k.shape[2])[None,:] <= old+torch.arange(t)[:,None]
        a=F.scaled_dot_product_attention(q,k.repeat_interleave(4,1),v.repeat_interleave(4,1),attn_mask=mask)
        x=x+self.o(a.transpose(1,2).reshape(b,t,256))
        z=self.n2(x); x=x+self.down(F.silu(self.gate(z))*self.up(z))
        return x,(k,v)

class Decoder(nn.Module):
    def __init__(self):
        super().__init__(); self.emb=nn.Embedding(512,256)
        self.blocks=nn.ModuleList([Block() for _ in range(4)])
        self.norm=RMS(256); self.head=nn.Linear(256,512,bias=False)
    def forward(self,ids,past=None,start=0):
        x=self.emb(ids); cache=[]
        for i,block in enumerate(self.blocks):
            x,kv=block(x,None if past is None else past[i],start); cache.append(kv)
        return self.head(self.norm(x)),cache

toy=Decoder().eval()
prompt=torch.randint(0,512,(1,16),generator=torch.Generator().manual_seed(1))
print('Toy parameters:',sum(p.numel() for p in toy.parameters()))

@torch.inference_mode()
def generate(n,cached,bug=None):
    ids=prompt.clone(); cache=None; logs=[]
    for i in range(n):
        if not cached or i==0:
            logits,cache=toy(ids); last=logits[:,-1]
        else:
            pos=ids.shape[1]-1
            if bug=='off-by-one': pos-=1
            if bug=='frozen': pos=16
            logits,cache=toy(ids[:,-1:],cache,pos); last=logits[:,-1]
        logs.append(last.clone()); ids=torch.cat((ids,last.argmax(-1)[:,None]),1)
    return ids,torch.stack(logs),cache

reference,ref_logs,_=generate(256,False)
ids,logs,cache=generate(256,True)
measured=sum(k.numel()*k.element_size()+v.numel()*v.element_size() for k,v in cache)
t=cache[0][0].shape[2]
print('Tokens equal:',torch.equal(reference,ids),'max logit error: %.3g' % (logs-ref_logs).abs().max())
print('Cached tokens:',t,'measured bytes:',measured,'formula:',2*4*2*32*4*t)
for bug in ['off-by-one','frozen']:
    bad,badlogs,_=generate(256,True,bug)
    differences=(bad!=reference).nonzero()
    first=None if differences.numel()==0 else int(differences[0,1])-16
    print(bug,'tokens equal:',torch.equal(bad,reference),'first differing output:',first,
          'max logit error: %.3g' % (badlogs-ref_logs).abs().max())
print('n  uncached_s  cached_s')
for n in [64,128,256,512]:
    durations=[]
    for cached in [False,True]:
        begin=time.perf_counter(); generate(n,cached); durations.append(time.perf_counter()-begin)
    print(n, '%.3f %.3f' % tuple(durations))
```

```output
Toy parameters: 3033344
Tokens equal: True max logit error: 1.79e-06
Cached tokens: 271 measured bytes: 555008 formula: 555008
off-by-one tokens equal: True first differing output: None max logit error: 0.0258
frozen tokens equal: False first differing output: 9 max logit error: 3.26
n  uncached_s  cached_s
64 0.120 0.055
128 0.332 0.110
256 0.974 0.243
512 3.241 0.491
```

最后输出的 token 尚未进行前向传播，因此 16-token 提示加 256 个输出 token，留下 271 个缓存位置。只有两条运行具有相同前缀时，才比较 logits：缺陷改变一个 token 后，后续差异也包含改变的上下文。上方报告打印整个运行的诊断，而不只是错误旋转的局部误差。

### 复用真实模型的前缀

显式构造 token 序列。分别对前缀、后缀分词，未必等于对拼接字符串分词：边界合并可能改变最后一个前缀 token。下面两条路径使用相同拼接 **id**，这是精确缓存复用的必要条件。DynamicCache 可变；分支到新问题前先复制，不要覆盖其推断位置。

```python
MODEL='HuggingFaceTB/SmolLM2-135M'
REV='93efa2f097d58c2a74874c7e644dbc9b0cee75a2'
tok=AutoTokenizer.from_pretrained(MODEL,revision=REV)
real=AutoModelForCausalLM.from_pretrained(MODEL,revision=REV,dtype=torch.float32,attn_implementation='sdpa').eval()
paragraph=('A safety case connects a claim about the pressure relief system to evidence. '
           'Separate assumptions, operating limits, faults, safeguards and remaining uncertainty. '
           'Each hazard log entry names the initiating event, consequence, prevention and evidence reference. '
           'A model drafts text for an engineer to check; it does not approve the system. ')
prefix=tok.encode(paragraph*60,add_special_tokens=False)[:3000]
questions=['\nExplain the evidence needed for a stuck valve.',
           '\nWhich assumptions should an engineer check?',
           '\nDraft a concise claim about overpressure protection.']
with torch.inference_mode():
    begin=time.perf_counter()
    shared=real(torch.tensor([prefix]),past_key_values=DynamicCache(config=real.config),use_cache=True).past_key_values
    initial=time.perf_counter()-begin
    print('Prefix tokens:',len(prefix),'one-time prefix seconds: %.3f' % initial)
    for question in questions:
        suffix=tok.encode(question,add_special_tokens=False)
        begin=time.perf_counter(); cold=real(torch.tensor([prefix+suffix]),use_cache=False).logits[:,-1]
        cold_s=time.perf_counter()-begin
        begin=time.perf_counter()
        warm=real(torch.tensor([suffix]),past_key_values=copy.deepcopy(shared),use_cache=True).logits[:,-1]
        warm_s=time.perf_counter()-begin
        error=(cold-warm).abs().max().item()
        assert torch.allclose(cold,warm,atol=2e-4,rtol=1e-5)
        print('suffix=%d cold=%.3fs warm=%.3fs max_error=%.3g' % (len(suffix),cold_s,warm_s,error))
```

```output
Prefix tokens: 3000 one-time prefix seconds: 2.524
suffix=10 cold=2.511s warm=0.074s max_error=3.24e-05
suffix=8 cold=2.413s warm=0.063s max_error=2.48e-05
suffix=11 cold=2.453s warm=0.076s max_error=3.34e-05
```

**解释。**热缓存请求避免大部分前缀计算，但新查询仍读取前缀。它不是绕过模型语义的捷径。位置缺陷可能通过贪心 token 测试；logit 比较是更强检查。

**继续尝试。**预先分配简化缓存，避免重复拼接。改变 KV 头数，并在计时前检查字节公式。

## 实验 3——连续批处理模拟器 {#lab3}

**目标。**在相同固定种子负载上比较调度策略，再寻找两个时延目标下的容量。这是可执行数学模型，不是任何部署引擎的基准。预留 30 分钟，无需下载。

### 定义成本模型与负载

FLOP 计数包含每个新位置对其缓存上下文的注意力。一次混合迭代在预填充与解码间共享权重读取：采用内存时间和计算时间的最大值，而非相加。简化模型不表示主机开销、分页聚集读取或内核启动成本。它将所有缓存位置视为一个连续池；按需策略模拟容量，而非 PagedAttention 的物理实现。

```python
import math
import random
import heapq
from collections import deque
from dataclasses import dataclass, field
import numpy as np
import matplotlib.pyplot as plt

N=8927875072
L=36
D=4096
W=5.5e9

@dataclass
class Device:
    memory: float=16e9
    bandwidth: float=1e12
    compute: float=.5*165e12
    kv: int=147456

def iteration(decodes,chunks,device):
    # decodes: cached context lengths; chunks: (new tokens, cached tokens).
    positions=len(decodes)+sum(k for k,c in chunks)
    attention=sum(decodes)+sum(k*c+k*(k+1)/2 for k,c in chunks)
    flops=2*N*positions+4*L*D*attention
    moved=W+device.kv*(sum(decodes)+sum(c for k,c in chunks))
    return max(moved/device.bandwidth,flops/device.compute)

dev=Device()
print('prefill4000 %.3fs, decode18 %.2fms' % (iteration([],[(4000,0)],dev),1000*iteration([5000]*18,[],dev)))
for chunk in [512,128]:
    print('chunk',chunk,'17 decodes: %.2fms opening, %.2fms after2000' %
          (1000*iteration([5000]*17,[(chunk,0)],dev),1000*iteration([5000]*17,[(chunk,2000)],dev)))

@dataclass
class Request:
    arrival: float
    prompt: int
    output: int
    number: int
    filled: int=0
    generated: int=0
    stamps: list=field(default_factory=list)
    @property
    def context(self):
        return self.filled
    @property
    def required_prefill(self):
        return self.prompt+self.generated

def workload(rate,count=300):
    rng=random.Random(0); now=0.; requests=[]
    for number in range(count):
        now+=rng.expovariate(rate)
        prompt=rng.randint(2000,6000)
        output=min(4000,max(16,int(rng.lognormvariate(math.log(1500),.6))))
        requests.append(Request(now,prompt,output,number))
    return requests

sample=workload(.2)
print('Mean output %.1f, nominal .200, realised %.3f requests/s' %
      (np.mean([r.output for r in sample]),len(sample)/sample[-1].arrival))
```

```output
prefill4000 0.923s, decode18 18.77ms
chunk 512 17 decodes: 116.04ms opening, 123.36ms after2000
chunk 128 17 decodes: 32.05ms opening, 33.88ms after2000
Mean output 1737.4, nominal .200, realised 0.224 requests/s
```

### 运行静态与迭代级策略

静态 batch 在达到十六个请求，或最老请求已等待两秒时调度。它保留填充槽位直到最长输出完成。**静态 batch 不检查内存**：这偏向静态策略，因为最坏缓存可能超过 16 GB 预算。连续策略具有 256 序列上限、先进先出接纳，并采用完整长度预留或实际使用接纳。增长超出内存时，最新运行请求被抢占，随后重新预填充原提示与已生成 token。分块将每次迭代的新预填充位置限制为 256。中断请求保留此前的 token 时间戳。

首 token 在预填充结束时输出；每个后续 token 在对应解码迭代结束时输出。模型没有网络延迟。

```python
def metrics(requests,now,preemptions=0):
    ttft=np.array([r.stamps[0]-r.arrival for r in requests])
    gaps=np.concatenate([np.diff(r.stamps) for r in requests])
    e2e=np.array([r.stamps[-1]-r.arrival for r in requests])
    tpot=np.array([(r.stamps[-1]-r.stamps[0])/(r.output-1) for r in requests])
    good=sum((r.stamps[0]-r.arrival<=3 and max(np.diff(r.stamps))<=.1) for r in requests)
    return dict(ttft50=float(np.quantile(ttft,.5)),ttft99=float(np.quantile(ttft,.99)),
                itl50=float(np.quantile(gaps,.5)),itl99=float(np.quantile(gaps,.99)),itlmax=float(max(gaps)),
                tpot50=float(np.median(tpot)),e2e50=float(np.median(e2e)),
                throughput=sum(r.output for r in requests)/now,
                goodput=good/now,preemptions=preemptions,
                realised=len(requests)/requests[-1].arrival)

def simulate(rate,policy='chunked',device=None,count=300):
    device=Device() if device is None else device
    requests=workload(rate,count); pending=deque(requests)
    queue=deque(); running=[]; now=0.; completed=0; preemptions=0; iterations=0
    while completed<count:
        iterations+=1
        if iterations>2000000:
            raise RuntimeError('Simulation exceeded its bounded iteration budget')
        while pending and pending[0].arrival<=now:
            queue.append(pending.popleft())
        if not running and not queue:
            now=pending[0].arrival; continue
        if policy=='static':
            if not running:
                dispatch=queue[0].arrival+2
                if len(queue)<16 and now<dispatch:
                    now=min(dispatch,pending[0].arrival if pending else math.inf); continue
                running=[queue.popleft() for _ in range(min(16,len(queue)))]
                now+=iteration([],[(r.prompt,0) for r in running],device)
                for r in running:
                    r.filled=r.prompt; r.generated=1; r.stamps.append(now)
            else:
                now+=iteration([r.filled for r in running],[],device)
                for r in running:
                    r.filled+=1
                    if r.generated<r.output:
                        r.generated+=1; r.stamps.append(now)
                if all(r.generated==r.output for r in running):
                    completed+=len(running); running=[]
            continue
        # Reserve admission charges the full possible output. Actual admission
        # charges current cache plus the whole prompt of each new joiner.
        used=sum((r.prompt+4000 if policy=='reserve' else r.context)*device.kv for r in running)
        while queue and len(running)<256:
            r=queue[0]
            cost=(r.prompt+4000 if policy=='reserve' else r.required_prefill)*device.kv
            if used+cost>device.memory*.99: break
            queue.popleft(); running.append(r); used+=cost
        if not running:
            raise ValueError('A request cannot fit in the configured cache')
        budget=256 if policy=='chunked' else math.inf
        chunks=[]; decoding=[]; actions=[]
        for r in running:
            remaining=r.required_prefill-r.filled
            if remaining>0:
                k=int(min(remaining,budget))
                if k:
                    chunks.append((k,r.filled)); actions.append((r,k,True)); budget-=k
            else:
                decoding.append(r.filled); actions.append((r,1,False))
        growth=sum(k for r,k,is_prefill in actions)
        current=sum(r.context for r in running)
        if (current+growth)*device.kv>device.memory:
            victim=running.pop(); victim.filled=0; queue.appendleft(victim); preemptions+=1
            continue
        now+=iteration(decoding,chunks,device)
        for r,k,is_prefill in actions:
            r.filled+=k
            if not is_prefill or r.filled==r.required_prefill:
                r.generated+=1; r.stamps.append(now)
        finished=[r for r in running if r.generated==r.output]
        completed+=len(finished)
        running=[r for r in running if r.generated<r.output]
    return metrics(requests,now,preemptions)

rates=[.10,.20,.25,.30,.35,.40]
results={}
print('policy  nominal real  TTFTp50/p99s ITLp50/p99/maxms tok/s preempt')
for policy in ['static','reserve','paged','chunked']:
    results[policy]=[]
    for rate in rates:
        m=simulate(rate,policy); results[policy].append(m)
        print('%-7s %.2f %.3f %6.2f/%6.2f %5.1f/%5.1f/%7.1f %6.1f %5d' %
              (policy,rate,m['realised'],m['ttft50'],m['ttft99'],1000*m['itl50'],
               1000*m['itl99'],1000*m['itlmax'],m['throughput'],m['preemptions']))
fig,axes=plt.subplots(2,1,figsize=(7,6),sharex=True)
for policy,ms in results.items():
    axes[0].semilogy(rates,[m['ttft99'] for m in ms],label=policy+' p99')
    axes[0].semilogy(rates,[m['ttft50'] for m in ms],linestyle=':',alpha=.6)
    axes[1].semilogy(rates,[1000*m['itl99'] for m in ms],label=policy+' p99')
axes[0].axhline(3,color='black',linestyle='--'); axes[0].set_ylabel('TTFT seconds')
axes[1].axhline(100,color='black',linestyle='--'); axes[1].set(ylabel='ITL ms',xlabel='Nominal requests/s')
axes[0].legend(); fig.tight_layout(); plt.show()
```

```output
policy  nominal real  TTFTp50/p99s ITLp50/p99/maxms tok/s preempt
static  0.10 0.112  13.04/ 52.59   7.9/ 14.5/   16.6  193.3     0
static  0.20 0.224 247.48/423.15  17.0/ 24.4/   25.3  295.0     0
static  0.25 0.281 385.93/710.34  17.0/ 24.1/   25.7  290.5     0
static  0.30 0.337 455.14/792.05  17.1/ 24.1/   25.7  302.7     0
static  0.35 0.393 507.56/940.23  17.2/ 24.3/   25.3  301.2     0
static  0.40 0.449 551.91/1035.02  17.2/ 24.3/   25.3  301.3     0
reserve 0.10 0.112   1.01/  2.65   7.3/ 12.8/ 2337.9  193.6     0
reserve 0.20 0.224   1.10/  6.53  10.2/ 16.2/ 2338.2  384.2     0
reserve 0.25 0.281   1.29/ 21.52  14.2/ 16.8/ 3130.1  477.7     0
reserve 0.30 0.337  45.34/ 73.68  15.3/ 17.2/ 2194.9  548.4     0
reserve 0.35 0.393 114.24/170.96  15.3/ 17.2/ 2576.3  553.9     0
reserve 0.40 0.449 159.43/251.51  15.3/ 17.2/ 2576.3  556.9     0
paged   0.10 0.112   1.01/  2.65   7.3/ 12.8/ 2337.9  193.6     0
paged   0.20 0.224   1.08/  2.94  10.2/ 17.6/ 2338.2  384.2     0
paged   0.25 0.281   1.14/  3.52  13.8/ 21.4/ 3130.1  477.7     2
paged   0.30 0.337  20.56/ 46.29  21.0/ 21.5/15405.2  564.0    46
paged   0.35 0.393  86.34/136.90  21.1/ 21.5/10245.8  571.1    52
paged   0.40 0.449 142.72/234.65  21.1/ 21.5/15395.6  564.8    64
chunked 0.10 0.112   1.01/  2.20   7.3/ 58.0/   65.9  193.6     0
chunked 0.20 0.224   1.09/  2.89  10.1/ 61.6/   65.9  384.3     0
chunked 0.25 0.281   1.15/  3.07  12.9/ 62.6/   66.0  477.9     0
chunked 0.30 0.337   1.53/ 29.87  19.4/ 63.9/ 6433.1  570.3   280
chunked 0.35 0.393  74.71/116.71  21.2/ 64.3/10303.5  586.9  1966
chunked 0.40 0.449 122.92/201.47  21.3/ 64.3/10131.6  589.2  2694
```

### 找到工作点，再按实测吞吐量计价

二分搜索假设通过与失败在局部单调。使用结果前，应检查附近速率：有限样本百分位与调度状态变化可能违背这一假设。两项目标都是**汇总百分位**目标，不表示每个请求满足最大间隔界。单独打印的有效吞吐量，采用更严格的每请求最大间隔规则。

```python
def capacity(device):
    low,high=.01,4.
    for _ in range(10):
        mid=(low+high)/2
        m=simulate(mid,'chunked',device)
        if m['ttft99']<=3 and m['itl99']<=.1: low=mid
        else: high=mid
    m=simulate(low,'chunked',device)
    return low,m

profiles=[('24GB-bf16',Device(),1.),('24GB-int8',Device(kv=73728),1.),
          ('H100-bf16',Device(memory=72e9,bandwidth=3.35e12,compute=.5*989e12),2.5),
          ('L4-bf16',Device(bandwidth=.30e12,compute=.5*121e12),.8)]
print('Prices below are assumptions, not current quotes.')
for name,device,price in profiles:
    rate,m=capacity(device)
    cost=price*1e6/(3600*m['throughput'])
    nearby=[simulate(rate+delta,'chunked',device) for delta in [-.005,.005]]
    passes=[v['ttft99']<=3 and v['itl99']<=.1 for v in nearby]
    print('%s nominal=%.3f/s realised=%.3f/s nominal_requests/h=%.0f output=%.1f tok/s USD/million=%.3f goodput=%.3f/s nearby_pass=%s' %
          (name,rate,m['realised'],rate*3600,m['throughput'],cost,m['goodput'],passes))
```

```output
Prices below are assumptions, not current quotes.
24GB-bf16 nominal=0.244/s realised=0.274/s nominal_requests/h=878 output=466.3 tok/s USD/million=0.596 goodput=0.266/s nearby_pass=[True, False]
24GB-int8 nominal=0.252/s realised=0.282/s nominal_requests/h=906 output=482.1 tok/s USD/million=0.576 goodput=0.275/s nearby_pass=[True, False]
H100-bf16 nominal=2.196/s realised=2.464/s nominal_requests/h=7905 output=3500.0 tok/s USD/million=0.198 goodput=2.008/s nearby_pass=[True, False]
L4-bf16 nominal=0.065/s realised=0.072/s nominal_requests/h=232 output=124.0 tok/s USD/million=1.792 goodput=0.071/s nearby_pass=[True, False]
```

**解释。**增加负载会改善批处理，直到排队或缓存压力成为主导。分块以若干较长解码迭代，换取消除整段提示停顿。8 位缓存同时改变容量和流量；该模拟假设其质量与缩放开销可接受，实际部署必须测试。成本来自打印的每秒输出 token，而非名义到达率乘以编造的输出长度。

**继续尝试。**让静态 batch 检查内存。加入突发到达或少量长文档，再重复服务等级目标搜索。每个结果都记录改变的假设。
