"""Equation-based Module 08 figures. Usage: python ... en|zh."""
import re
import sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/'src/figures'))
import figstyle as fs
LANG = sys.argv[1] if len(sys.argv)>1 else 'en'
assert LANG in ('en','zh')

def t(en,zh):
    return zh if LANG=='zh' else en

def figure(height=4.6,**kwargs):
    return fs.figure(width=10,height=height,lang=LANG,**kwargs)

def save(fig,number):
    path = Path(fs.save(fig,f'fig-08-{number}',lang=LANG))
    svg = path.read_text(encoding='utf8').replace('width="720pt"','width="720"')
    svg = re.sub(r'height="([\d.]+)pt"',r'height="\1"',svg,count=1)
    path.write_text(svg,encoding='utf8')

def loss(N,D):
    return 1.69+406.4/N**.34+410.7/D**.28

def optimum(C):
    return (.34*406.4/(.28*410.7))**(1/(.34+.28))*(C/6)**(.28/(.34+.28))

fig,ax = figure(5)
N=np.logspace(8,11,601)
for C,colour in zip([1e20,1e21,1e22,1e23],fs.SERIES):
    D=C/(6*N)
    inside=(N>=70e6)&(N<=16e9)&(D>=5e9)&(D<=500e9)
    ax.plot(N,loss(N,D),color=colour,alpha=.25)
    ax.plot(N,np.where(inside,loss(N,D),np.nan),color=colour,label=f'C₆ = {C:.0e}')
    n=optimum(C)
    ax.scatter(n,loss(n,C/(6*n)),color=colour,s=38,zorder=3)
    n=np.sqrt(C/120)
    ax.scatter(n,loss(n,20*n),marker='x',color=colour,s=45,zorder=3)
for D,label,offset in [(190e9,'190B',(-55,12)),(2e12,'2T',(15,5)),
                       (15e12,'15T',(15,-18))]:
    n=9550729216
    ax.scatter(n,loss(n,D),marker='D',color=fs.NAVY,s=35)
    ax.annotate(label,(n,loss(n,D)),xytext=offset,textcoords='offset points',fontsize=10)
ax.set(xscale='log',xlabel=t('Parameters N','参数 N'),
       ylabel=t('Fitted loss (nats/token)','拟合损失（nat/token ）'),ylim=(1.85,3.2))
ax.set_title(t('● fitted minimum   × twenty tokens/parameter   ◆ case study',
               '● 拟合最小值   × 每参数二十 token ◆ 案例模型'))
ax.text(.02,.02,t('Pale segments: extrapolated beyond original fitting range',
                  '浅色曲线：超出原始拟合范围的外推'),transform=ax.transAxes,fontsize=10)
ax.legend(loc='upper right')
save(fig,2)

steps=np.arange(10000)
warm=np.minimum(1,(steps+1)/500)
fraction=np.clip((steps-500)/9499,0,1)
cosine=np.where(steps<500,warm,.1+.9*(1+np.cos(np.pi*fraction))/2)
wsd=np.where(steps<500,warm,np.where(steps<8000,1,(9999-steps)/1999))
fig,ax=figure(4.3)
for values,label,colour in [(cosine,t('Warmup-cosine','预热-余弦'),fs.BLUE),
                            (wsd,'WSD',fs.GREEN),
                            (np.ones(10000),t('Constant, no warmup','恒定，无预热'),fs.ORANGE)]:
    ax.plot(steps,values,label=label,color=colour)
ax.axvline(500,color=fs.SLATE,linestyle=':',linewidth=1)
ax.axvline(8000,color=fs.SLATE,linestyle=':',linewidth=1)
ax.set(xlabel=t('Training step','训练步'),ylabel=t('Learning rate / peak','学习率 / 峰值'),
       ylim=(-.05,1.15))
ax.legend(loc='lower left')
save(fig,9)

batches=np.array([.25,.5,1,2,4,8,16])
B=np.logspace(-1.5,2,500)
fig,ax=figure(4.5)
ax.loglog(1+B/2,1+2/B,color=fs.BLUE)
for batch_value in batches:
    x,y=1+batch_value/2,1+2/batch_value
    ax.scatter(x,y,color=fs.ORANGE,s=35,zorder=4)
    ax.annotate(f'{batch_value:g}M',(x,y),xytext=(6,6),textcoords='offset points',fontsize=10)
ax.scatter(2,2,marker='s',s=70,color=fs.GREEN,zorder=5)
ax.set(xlabel=t('Tokens D / Dmin',' token D / Dmin'),
       ylabel=t('Steps S / Smin','步数 S / Smin'),xlim=(1,12),ylim=(1,12))
ax.text(1.15,10.5,t('Data-efficient','数据效率高'),fontsize=11)
ax.text(3,1.12,t('Time-efficient','时间效率高'),fontsize=11)
ax.set_title(t('Noise-scale model: Bnoise = 2M tokens','噪声尺度模型：Bnoise = 2M token '))
save(fig,10)

names=['fp32','fp16','bf16','E4M3FN','E5M2']
exponents=[8,5,8,4,5]
fractions=[23,10,7,3,2]
maxima=[(2-2**-23)*2**127,65504,(2-2**-7)*2**127,448,57344]
minima=[2**-149,2**-24,2**-133,2**-9,2**-16]
fig,axes=figure(6.2,nrows=2,gridspec_kw={'height_ratios':[1,1]})
ax=axes[0]
for i,(name,exponent,fraction,maximum) in enumerate(zip(names,exponents,fractions,maxima)):
    left=0
    for count,colour in [(1,fs.ORANGE),(exponent,fs.BLUE),(fraction,fs.GREEN)]:
        ax.barh(i,count,left=left,color=colour,height=.6)
        if count>1:ax.text(left+count/2,i,str(count),ha='center',va='center',color='white')
        left+=count
    ax.text(33,i,f'max {maximum:.3g}; Δ≈2⁻{fraction}',va='center',fontsize=10)
ax.set(yticks=range(5),yticklabels=names,xlim=(0,51),xticks=[],
       title=t('Sign (orange), exponent (blue), fraction (green)',
               '符号（橙）、指数（蓝）、尾数（绿）'))
ax.invert_yaxis()
ax.grid(False)
ax=axes[1]
for i,(name,minimum,maximum) in enumerate(zip(names,minima,maxima)):
    ax.plot([max(1e-10,minimum),maximum],[i,i],linewidth=7,color=fs.SERIES[i])
    if minimum<1e-10:ax.plot(1e-10,i,marker='<',color=fs.SERIES[i],markersize=8)
ax.scatter([2e-8,2e-8*65536],[1,1],marker='x',color=fs.NAVY,s=55,zorder=5)
ax.annotate(t('gradient','梯度'),(2e-8,1),xytext=(-5,-25),textcoords='offset points',fontsize=10)
ax.annotate('×65536',(2e-8*65536,1),xytext=(5,12),textcoords='offset points',fontsize=10)
ax.set(xscale='log',xlim=(1e-10,1e40),yticks=range(5),yticklabels=names,
       xlabel=t('Positive representable range, including subnormals',
                '包含次正规数的正数可表示范围'))
ax.invert_yaxis()
save(fig,11)

N=9550729216
d,T,L,V,hkv,ff=4096,8192,36,152064,1024,15360
act=(12*d+4*hkv+6*ff)*T*L
check=2*d*T*L+act/L
logits=4*T*V
states=[2*N,2*N,4*N,4*N,4*N]
labels=[t('Weights','权重'),t('Gradients','梯度'),t('Master weights','主权重'),
        t('Adam m','Adam 一阶矩'),t('Adam v','Adam 二阶矩'),
        t('Activations','激活值'),t('Logits','输出值')]
fig,ax=figure(4.6)
left=np.zeros(2)
for i,(value,label) in enumerate(zip(states+[[act,check],logits],labels)):
    values=np.broadcast_to(value,(2,))/1e9
    ax.barh([0,1],values,left=left,color=fs.SERIES[i],label=label)
    left+=values
for i,value in enumerate(left):ax.text(value+2,i,f'{value:.1f} GB',va='center')
ax.axvline(80,color=fs.RED,linestyle='--',label='80 GB')
ax.set(yticks=[0,1],yticklabels=[t('Saved activations','保存激活值'),
                               t('Full checkpointing','完全重计算')],
       xlabel=t('Single-GPU training estimate (GB)','单 GPU 训练内存估算（GB）'),xlim=(0,225))
ax.invert_yaxis()
ax.legend(loc='upper center',bbox_to_anchor=(.5,-.19),ncol=4,fontsize=10)
save(fig,12)

state=np.array([16*N,4*N+12*N/8,2*N+14*N/8,16*N/8])/1e9
fig,ax=figure(4.5)
for offset,activation,label,colour in [(-.18,act,t('Without checkpointing','无重计算'),fs.BLUE),
                                       (.18,check,t('Full checkpointing','完全重计算'),fs.GREEN)]:
    values=state+(activation+logits)/1e9
    ax.bar(np.arange(4)+offset,values,width=.34,color=colour,label=label)
    for i,value in enumerate(values):ax.text(i+offset,value+2,f'{value:.1f}',ha='center',fontsize=10)
ax.axhline(80,color=fs.RED,linestyle='--',label='80 GB')
ax.set(xticks=range(4),xticklabels=['DP','ZeRO-1','ZeRO-2','ZeRO-3'],ylim=(0,230),
       ylabel=t('Per-GPU total estimate (GB)','每 GPU 总内存估算（GB）'))
ax.set_title(t('8 GPUs: states + one sequence + fp32 logits','8 GPU：模型状态 + 一个序列 + fp32 输出'))
ax.legend(loc='upper right')
save(fig,13)

# Matplotlib emits spaces before SVG path newlines; keep generated assets clean.
for _svg in (ROOT / f"src/figures/{LANG}").glob("fig-08-*.svg"):
    _svg.write_text("\n".join(line.rstrip() for line in _svg.read_text(encoding="utf8").splitlines()).rstrip() + "\n", encoding="utf8")
