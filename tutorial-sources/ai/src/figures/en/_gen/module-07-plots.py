"""Computed Module 07 figures, with pinned-lab metrics. Usage: python ... en|zh."""
import json
import re
import sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0, str(ROOT / 'src/figures'))
import figstyle as fs

LANG = sys.argv[1] if len(sys.argv) > 1 else 'en'
assert LANG in ('en', 'zh')
def t(en, zh):
    return zh if LANG == 'zh' else en
def figure(height=4.6, **kwargs):
    return fs.figure(width=10, height=height, lang=LANG, **kwargs)
def save(fig, number):
    path = Path(fs.save(fig, f'fig-07-{number}', lang=LANG))
    s = path.read_text(encoding='utf8').replace('width="720pt"', 'width="720"')
    s = re.sub(r'height="([\d.]+)pt"', r'height="\1"', s, count=1)
    path.write_text(s, encoding='utf8')
def read(lab):
    return json.loads((ROOT / f'labs/module_07/lab{lab}-metrics.json').read_text(encoding='utf8'))

# Recorded Lab 1, sorted by actual coding cost.
m = read(1)
names = sorted([k for k,v in m.items() if isinstance(v, dict)],
               key=lambda k:m[k]['bits_per_byte'])
labels = {
    'Declaration':t('Declaration sentence','《独立宣言》句子'),
    'prose twice':t('Prose twice','重复两遍的散文'),
    'code':t('Python code','Python 代码'), 'prose':t('English prose','英语散文'),
    'shuffled':t('Shuffled words','打乱的词序'), 'Chinese':t('Chinese translation','中文译文'),
    'random':t('Random characters','随机字符'),
}
fig, ax = figure(height=4.8)
values = [m[k]['bits_per_byte'] for k in names]
ax.barh(np.arange(7), values, color=fs.BLUE)
for i,k in enumerate(names):
    ax.text(values[i]+.06, i, f'{values[i]:.2f}; PPL {np.exp(m[k]["nats"]):.2f}',
            va='center', fontsize=10)
ax.axvline(np.log2(37), color=fs.ORANGE, linestyle='--', label=t('Source entropy: log₂ 37','源熵：log₂ 37'))
ax.set(yticks=np.arange(7), yticklabels=[labels[k] for k in names],
       xlabel=t('Bits per UTF-8 byte','每 UTF-8 字节的比特数'), xlim=(0,7.1))
ax.invert_yaxis()
ax.legend(loc='lower right')
save(fig,2)

m = read(2)
names = ['GPT-2','SmolLM2','Qwen2.5']
fig, ax = figure(height=4.2)
x = np.arange(3)
for offset,key,label,colour in [(-.19,'en_tokens',t('English','英语'),fs.BLUE),
                               (.19,'zh_tokens',t('Chinese','中文'),fs.ORANGE)]:
    values = [m[k][key] for k in names]
    ax.bar(x+offset,values,width=.36,label=label,color=colour)
    for i,value in enumerate(values):ax.text(i+offset,value+5,str(value),ha='center',fontsize=10)
for i,k in enumerate(names):
    ax.text(i,max(m[k]['en_tokens'],m[k]['zh_tokens'])+30,
            t('ZH/EN = ','中/英 = ')+f'{m[k]["zh_tokens"]/m[k]["en_tokens"]:.2f}',ha='center')
ax.set(xticks=x,xticklabels=[f'{k}\nV = {m[k]["vocab"]:,}' for k in names],
       ylabel=t('Tokens for the paragraph','该段落的 token 数'),ylim=(0,315))
ax.legend(loc='upper right')
save(fig,4)

PUBLISHED = (1.69,406.4,410.7,.34,.28)
REFIT = (1.8172,482.01,2085.43,.3478,.3658)
def loss(N,D,constants=PUBLISHED):
    E,A,B,a,b=constants
    return E+A/N**a+B/D**b
def optimum(C,constants=PUBLISHED):
    E,A,B,a,b=constants
    return (a*A/(b*B))**(1/(a+b))*(C/6)**(b/(a+b))

N=np.logspace(7,12,500)
budgets=[1e19,1e20,1e21,1e22,1e23,5.76e23]
fig,ax=figure(height=5)
minimum=[]
for C,colour in zip(budgets,fs.SERIES):
    D=C/(6*N)
    L=loss(N,D)
    inside=(N>=70e6)&(N<=16e9)&(D>=5e9)&(D<=500e9)
    ax.plot(N,L,color=colour,alpha=.25)
    ax.plot(N,np.where(inside,L,np.nan),color=colour,label=f'C₆ = {C:.2g}')
    n=optimum(C);l=loss(n,C/(6*n));minimum.append((n,l))
    ax.scatter([n],[l],color=colour,s=25,zorder=4)
ax.plot(*np.array(minimum).T,color=fs.SLATE,linestyle='--',linewidth=1)
for name,n,d in [('Gopher',280e9,300e9),('Chinchilla',70e9,1.4e12)]:
    l=loss(n,d);ax.scatter([n],[l],marker='x',color=fs.NAVY,zorder=5)
    ax.annotate(f'{name}: {l:.3f}',(n,l),xytext=(0,16 if name=='Gopher' else -23),
                textcoords='offset points',ha='center',fontsize=10)
ax.set(xscale='log',xlabel=t('Parameters N','参数量 N'),
       ylabel=t('Predicted loss (nats/token)','预测损失（nat/token ）'),ylim=(1.8,4.5))
ax.legend(ncols=2,loc='upper center',fontsize=9)
save(fig,6)

C=np.logspace(18,26,500)
fig,ax=figure(height=4.8)
lines=[(optimum(C),fs.BLUE,t('Published a = 0.452','已发表拟合 a = 0.452')),
       (optimum(C,REFIT),fs.GREEN,t('Replication a = 0.513','复现拟合 a = 0.513')),
       (67e9*(C/5.76e23)**.5,fs.ORANGE,t('Square-root guide a = 0.50','平方根参考 a = 0.50')),
       (optimum(1e18)*(C/1e18)**.73,fs.PURPLE,t('Kaplan slope guide a = 0.73','Kaplan 斜率参考 a = 0.73'))]
inside=(C>=6*70e6*5e9)&(C<=6*16e9*500e9)
for values,colour,label in lines:
    ax.loglog(C,values,color=colour,linestyle='--',alpha=.6)
    ax.loglog(C,np.where(inside,values,np.nan),color=colour,label=label)
ax.scatter([5.76e23,5.76e23],[70e9,280e9],color=fs.NAVY,zorder=4)
ax.annotate('Chinchilla',(5.76e23,70e9),xytext=(9,-15),textcoords='offset points',fontsize=10)
ax.annotate('Gopher',(5.76e23,280e9),xytext=(9,6),textcoords='offset points',fontsize=10)
ax.set(xlabel=t('Training budget C₆ (FLOPs)','训练预算 C₆（FLOP）'),
       ylabel=t('Compute-optimal parameters N','计算最优参数量 N'))
ax.legend(loc='upper left',fontsize=9)
save(fig,7)

fig,ax=figure(height=3.7)
p=np.linspace(0,1,401)
ax.axhline(0,color=fs.SLATE,label=t('Abstain','弃答'))
for penalty,colour in zip([0,1,3],[fs.BLUE,fs.ORANGE,fs.GREEN]):
    reward=p-penalty*(1-p);threshold=penalty/(1+penalty)
    ax.plot(p,reward,color=colour,label=f'λ = {penalty}')
    ax.scatter([threshold],[0],color=colour,zorder=4)
ax.fill_between(p,0,np.maximum(0,4*p-3),where=p>.75,color=fs.GREEN,alpha=.12)
ax.set(xlabel=t('Probability of correctness p','正确概率 p'),
       ylabel=t('Expected score','期望得分'),xlim=(0,1))
ax.legend(ncols=4,loc='lower right')
save(fig,16)

# Illustrative marginal intervals, not a paired significance comparison.
fig,ax=figure(height=3.5)
names=['HumanEval','GSM8K','MMLU'];sizes=np.array([164,1319,14042])
for offset,prob,colour,label in [(-.12,np.array([.60,.80,.70]),fs.BLUE,t('Model A','模型 A')),
                                (.12,np.array([.57,.77,.67]),fs.ORANGE,t('Model B','模型 B'))]:
    half=1.96*np.sqrt(prob*(1-prob)/sizes)
    ax.errorbar(100*prob,np.arange(3)+offset,xerr=100*half,fmt='o',color=colour,
                capsize=4,label=label)
ax.set(yticks=np.arange(3),yticklabels=[f'{k} (n = {n:,})' for k,n in zip(names,sizes)],
       xlabel=t('Hypothetical score with marginal 95% interval (%)','假设得分及边际 95% 区间（%）'))
ax.legend(loc='upper left')
save(fig,18)

fig,axes=figure(ncols=2,height=4.2)
counts=np.array([.5e9,9.550729216e9,70e9,671e9]);names=['0.5B','9.55B','70B','671B MoE']
axes[0].scatter(counts,np.arange(4),color=fs.BLUE,s=50,label=t('Total','总量'))
axes[0].scatter([37e9],[3],color=fs.ORANGE,marker='s',s=50,label=t('Active 37B','激活 37B'))
axes[0].plot([37e9,671e9],[3,3],color=fs.ORANGE)
axes[0].set(xscale='log',yticks=np.arange(4),yticklabels=names,
            xlabel=t('Parameters','参数量'),xlim=(1e8,1e12))
axes[0].legend(loc='lower right')
for multiplier,offset,colour,label in [(2,-.12,fs.BLUE,'bf16'),(.58,.12,fs.ORANGE,t('4-bit scenario','4-bit 情景'))]:
    gb=counts*multiplier/1e9
    axes[1].scatter(gb,np.arange(4)+offset,color=colour,label=label)
    for i,value in enumerate(gb):axes[1].annotate(f'{value:.2g}',(value,i+offset),
                                                 xytext=(5,4),textcoords='offset points',fontsize=9)
axes[1].set(xscale='log',yticks=np.arange(4),yticklabels=names,
            xlabel=t('Weight storage (decimal GB)','权重存储（十进制 GB）'),xlim=(.2,2500))
axes[1].legend(loc='lower right')
save(fig,19)

Ntotal=9550729216;Nmatmul=8927875072;L=36;d=4096
weights=np.array([2*Ntotal,8305016832*4.125/8+2*622854144+2*4096])
kv=5000*147456;bandwidth=3.35e12
fig,axes=figure(ncols=2,height=4.3)
ceilings=np.array([1e12/weights[0],1e12/weights[1],bandwidth/weights[0],bandwidth/weights[1]])
axes[0].bar(np.arange(4),ceilings,color=[fs.BLUE,fs.ORANGE,fs.BLUE,fs.ORANGE])
for i,v in enumerate(ceilings):axes[0].text(i,v+12,f'{v:.0f}',ha='center')
axes[0].set(xticks=np.arange(4),xticklabels=['bf16\n1.0 TB/s','4-bit\n1.0 TB/s','bf16\n3.35 TB/s','4-bit\n3.35 TB/s'],
            ylabel=t('Weights-only ceiling (tokens/s)','仅权重读取上限（ token/秒）'),ylim=(0,700))
prices=2.5*(weights+kv)/bandwidth/3600*1e6
axes[1].bar([0,1],prices,color=[fs.BLUE,fs.ORANGE])
for i,v in enumerate(prices):axes[1].text(i,v+.12,f'USD {v:.2f}',ha='center')
axes[1].axhline(.8,color=fs.GREEN,linestyle='--',label=t('API scenario: 0.80','API 情景：0.80'))
axes[1].set(xticks=[0,1],xticklabels=['bf16','4-bit'],ylim=(0,5),
            ylabel=t('USD per million output tokens','每百万输出 token USD'))
axes[1].legend(loc='upper right',fontsize=9)
save(fig,20)

volume=np.logspace(2,5,500)
prefill=(2*Nmatmul*4000+2*L*d*4000**2)/4e14
capacity=86400/(prefill+2000*(weights+kv)/bandwidth)
fig,ax=figure(height=4.7)
ax.loglog(volume,.0024*volume,color=fs.BLUE,label=t('API uncached','API 未缓存'))
ax.loglog(volume,.00186*volume,color=fs.GREEN,label=t('API cached prefix','API 前缀缓存'))
ax.axhline(60,color=fs.ORANGE,label=t('Dedicated GPU: USD 60/day','专用 GPU：USD 60/天'))
ax.axvspan(capacity[0],capacity[1],color=fs.BLUE,alpha=.07)
ax.axvspan(capacity[1],1e5,color=fs.ORANGE,alpha=.09)
for c,label,y in zip(capacity,[t('bf16 capacity','bf16 容量'),t('4-bit capacity','4-bit 容量')],[.6,1.1]):
    ax.axvline(c,color=fs.SLATE,linestyle=':',linewidth=1)
    ax.text(c,y,f'{label}\n{c:,.0f}/'+t('day','天'),ha='center',fontsize=9)
for cost in [.0024,.00186]:ax.scatter([60/cost],[60],color=fs.ORANGE,zorder=5)
ax.axvline(2000,color=fs.PURPLE,linestyle='--',linewidth=1)
ax.text(2000,180,t('Case: 2,000/day','案例：2,000/天'),rotation=90,ha='right',fontsize=9)
ax.set(xlabel=t('Requests per day (4k input, 2k output)','每天请求数（4k 输入、2k 输出）'),
       ylabel=t('Scenario daily cost (USD)','情景日成本（USD）'),xlim=(100,1e5),ylim=(.15,300))
ax.legend(loc='upper left',fontsize=9)
save(fig,21)

# Matplotlib emits spaces before SVG path newlines; keep generated assets clean.
for _svg in (ROOT / f"src/figures/{LANG}").glob("fig-07-*.svg"):
    _svg.write_text("\n".join(line.rstrip() for line in _svg.read_text(encoding="utf8").splitlines()).rstrip() + "\n", encoding="utf8")
