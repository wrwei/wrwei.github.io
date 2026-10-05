"""Rebuild Module 10's original schematics and computed plots: python ... en|zh."""
from pathlib import Path
import sys,re,html
import numpy as np
ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/'src/figures'))
import figstyle as f
lang=sys.argv[1] if len(sys.argv)>1 else 'en'
def t(en,zh):return zh if lang=='zh' else en
OUT=ROOT/'src/figures'/lang
OUT.mkdir(exist_ok=True)
def clean(path):
    text=Path(path).read_text(encoding='utf8')
    text=re.sub(r'(<svg\b)',r'\1 font-family="DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif"',text,count=1)
    Path(path).write_text('\n'.join(x.rstrip() for x in text.splitlines())+'\n',encoding='utf8')
def save(fig,n):clean(f.save(fig,f'fig-10-{n}',lang))
class Diagram:
    def __init__(self,h):
        self.h=h;self.body=['<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="#475569"/></marker></defs>']
    def text(self,x,y,s,size=14,colour=f.NAVY,anchor='start'):
        self.body.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{colour}" text-anchor="{anchor}">{html.escape(str(s))}</text>')
    def box(self,x,y,w,h,label='',fill='#DBEAFE',colour=f.BLUE):
        self.body.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{colour}" stroke-width="1.5"/>')
        if label:self.text(x+w/2,y+h/2+5,label,13,anchor='middle')
    def line(self,x,y,xx,yy,arrow=False,colour=f.SLATE):
        self.body.append(f'<line x1="{x}" y1="{y}" x2="{xx}" y2="{yy}" stroke="{colour}" stroke-width="1.5"'+(' marker-end="url(#arrow)"' if arrow else '')+'/>')
    def write(self,n):
        path=OUT/f'fig-10-{n}.svg'
        path.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 {self.h}" width="720" height="{self.h}">\n'+ '\n'.join(self.body)+'\n</svg>\n',encoding='utf8');clean(path)

# 1: schematic timing, deliberately labelled as a split-scale representation.
s=Diagram(270)
s.box(35,50,230,65,t('Prefill: 2,000 positions','预填充：2,000 个位置'))
s.text(45,140,t('0.45 s · compute-bound','0.45 s · 计算受限'))
for i in range(12):s.box(300+i*30,50,20,65,'',fill='#F0FDF4',colour=f.GREEN)
s.text(300,140,t('Decode: ≈ 5.8 ms per step','解码：每步约 5.8 ms'))
s.line(265,82,298,82,True)
s.text(35,30,t('TTFT','首 token 时延 TTFT'));s.text(35,180,t('500 output tokens → about 3.36 s in all','500 个输出 token → 总计约 3.36 s'))
s.text(35,210,t('Prefill ≈ 3.69 × 10¹³ FLOPs; one decode ≈ 1.9 × 10¹⁰','预填充约 3.69 × 10¹³ FLOPs；一次解码约 1.9 × 10¹⁰'))
s.text(35,240,t('Schematic uses separate phase scales; assumptions in text.','示意图的两个阶段采用不同时间比例；假设见正文。'),12);s.write(1)

# 2: true rooflines and computed intensities.
fig,ax=f.figure(height=3.8,lang=lang)
i=np.logspace(-1,4,400)
for peak,bw,label in [(989,3.35,'H100 SXM'),(165,1.,t('24 GB reference','24 GB 参考配置'))]:
    ax.loglog(i,np.minimum(peak,bw*i),label=label)
for b,offset in [(1,(8,9)),(16,(5,-18)),(256,(-35,-26)),(2048,(8,-25))]:
    intensity=4096*b/(4096+2*b)
    ax.scatter(intensity,min(989,3.35*intensity),color=f.BLUE)
    ax.annotate(f'B = {b}',(intensity,min(989,3.35*intensity)),xytext=offset,textcoords='offset points',fontsize=10)
ax.axvline(4,color=f.GREEN,linestyle=':',label=t('Decode attention: I ≈ 4','解码注意力：I ≈ 4'))
ax.set(xlabel=t('Arithmetic intensity (FLOP/byte)','算术强度（FLOP/byte）'),ylabel='TFLOP/s',xlim=(.1,1e4),ylim=(.1,2000));ax.legend(loc='lower right');save(fig,2)

# 3: compact per-layer tensors.
s=Diagram(285)
s.text(35,30,t('Repeat for every layer, L = 36','每层重复，L = 36'))
for x,label in [(50,'K'),(370,'V')]:
    s.box(x,65,230,100,label+'  (B, 8, T, 128)')
    s.box(x+230,65,35,100,'+1',fill='#F0FDF4',colour=f.GREEN)
    s.text(x,200,t('New slice along token axis','沿 token 轴追加切片'))
s.text(35,245,t('2 × 36 × 8 × 128 × 2 B = 147,456 B per token','每个 token：2 × 36 × 8 × 128 × 2 B = 147,456 B'));s.write(3)

# 4: exact memory slots and unused remainder.
s=Diagram(255)
for y,heads,count,slot in [(65,8,18,.884736),(160,32,4,3.538944)]:
    s.text(35,y-18,f'{heads} KV '+t('heads','头'))
    x=35
    for size,label,fill,col in [(5.5,t('Weights','权重'),'#DBEAFE',f.BLUE),(2.5,t('Runtime','运行时'),'#FFF7ED',f.ORANGE)]:
        width=size/24*650;s.box(x,y,width,42,label,fill,col);x+=width
    for k in range(count):
        width=slot/24*650;s.box(x,y,width,42,'',fill='#F0FDF4',colour=f.GREEN);x+=width
    s.box(x,y,685-x,42,'',fill='#F1F5F9',colour=f.MUTED)
    s.text(255,y+62,t(f'{count} requests × {slot:.3f} GB cache',f'{count} 个请求 × {slot:.3f} GB KV cache'),12)
s.write(4)

# 5: computed bandwidth limits, not measured device benchmarks.
fig,ax=f.figure(height=3.8,lang=lang)
names=['H100','A100',t('24 GB reference','24 GB 参考'),'L40S','M2 Ultra','L4',t('DDR5 example','DDR5 示例')]
bws=np.array([3.35,2.039,1.,.864,.8,.3,.0896]);values=bws*1000/6.23728
ax.barh(names,values,color=[f.BLUE,f.BLUE,f.ORANGE,f.BLUE,f.GREEN,f.ORANGE,f.SLATE]);ax.invert_yaxis()
for j,v in enumerate(values):ax.text(v+6,j,f'{v:.0f}',va='center',fontsize=11)
ax.set(xlabel=t('Bandwidth-only decode bound (tokens/s)','仅按带宽估算的解码上限（token/s）'),xlim=(0,600));save(fig,5)

# 6: schedule with fixed 20 ms steps.
s=Diagram(380)
lengths=[2,4,8,16]
for panel,base in [(0,55),(1,230)]:
    s.text(35,base-20,t('Static · useful slots 46.9%' if panel==0 else 'Continuous · refilled slots',
                         '静态批处理 · 有效槽位 46.9%' if panel==0 else '连续批处理 · 及时补位'))
    for row,duration in enumerate(lengths):
        y=base+row*28;s.text(35,y+17,str(row+1));s.box(75,y,600,22,'',fill='#F1F5F9',colour=f.MUTED)
        at=0;index=0
        while at<16:
            end=min(16,at+duration);s.box(75+at/16*600,y,(end-at)/16*600,22,'',fill=['#DBEAFE','#F0FDF4','#FFF7ED','#FAF5FF'][index%4],colour=f.SERIES[index%4])
            if panel==0:break
            at=end;index+=1
    s.text(75,base+135,'0');s.text(675,base+135,t('16 s','16 s'),anchor='end')
s.write(6)

# 7: analytic batch curves including cache.
fig,ax=f.figure(height=3.8,lang=lang)
b=np.geomspace(1,64,250);time=(5.5e9+b*147456*5000)/1e12
ax.loglog(b,1/time,label=t('Per sequence','每序列'));ax.loglog(b,b/time,label=t('Aggregate','总吞吐量'))
ax.loglog(b,np.minimum(b/0.0055,165e12/(2*8927875072)),':',label=t('Weights only','仅权重流量'))
ax.axvline(18,color=f.RED,linestyle='--',label=t('18: full-length cache limit','18：完整长度 KV cache 上限'))
ax.set(xlabel=t('Concurrent sequences B','并发序列 B'),ylabel=t('Output tokens/s','输出 token/s'));ax.legend();save(fig,7)

# 8: block sharing schematic without crowded crossing arrows.
s=Diagram(360)
s.text(35,30,t('Logical tables','逻辑块表'));s.text(295,30,t('Physical blocks','物理块'))
for row,name,private in [(0,'A',2),(1,'B',3)]:
    y=65+row*135;s.box(35,y,190,80,name+': [0, 1, '+str(private)+']')
    s.line(225,y+20,290,97+row*8,True)
s.box(290,70,170,55,t('0 · prefix · refs 2','0 · 前缀 · 引用 2'))
s.box(490,70,170,55,t('1 · prefix · refs 2','1 · 前缀 · 引用 2'))
s.box(290,180,170,55,t('2 · A private tail','2 · A 私有尾块'),fill='#F0FDF4',colour=f.GREEN)
s.box(490,180,170,55,t('3 · B private tail','3 · B 私有尾块'),fill='#FFF7ED',colour=f.ORANGE)
s.text(290,157,t('Full prefix blocks are shared','完整前缀块共享'))
s.line(225,135,290,205,True)
s.line(225,265,490,220,True)
s.text(35,310,t('Writing a shared partial block → copy-on-write','写入共享的未满块 → 写时复制'))
s.text(35,342,t('Free blocks return to one pool; tables map logical positions.','空闲块回到统一池；块表映射逻辑位置。'),12);s.write(8)

# 9: exact bit counts.
s=Diagram(350)
for i,(name,bits) in enumerate([('fp32',(1,8,23)),('bf16',(1,8,7)),('fp16',(1,5,10)),('E4M3',(1,4,3)),('E5M2',(1,5,2)),('int8',(8,)),('int4',(4,))]):
    y=45+i*40;s.text(35,y+20,name);x=130
    for j,n in enumerate(bits):
        width=n*13;s.box(x,y,width,28,str(n),fill=['#FFF7ED','#DBEAFE','#F0FDF4'][j%3],colour=f.SERIES[j%3]);x+=width
    s.text(x+15,y+20,str(sum(bits))+t(' bits',' 位'),12)
s.text(35,335,t('Floating fields: sign | exponent | fraction','浮点字段：符号 | 指数 | 尾数'),13);s.write(9)

# 10: computed synthetic weights and actual int4 grids.
fig,ax=f.figure(height=3.7,lang=lang)
rng=np.random.default_rng(0);weights=np.r_[rng.normal(0,.3,4000),3.]
ax.hist(weights,bins=np.linspace(-1.2,3.2,90),color=f.BLUE,alpha=.5,label=t('Synthetic weights','合成权重'))
for level in np.arange(-7,8)*3/7:ax.axvline(level,color=f.ORANGE,alpha=.55,linewidth=1)
group=rng.normal(0,.3,64);scale=max(abs(group))/7
ax.scatter(np.arange(-7,8)*scale,np.full(15,20),marker='|',s=150,color=f.GREEN,label=t('Ordinary-group levels','普通组的量化级别'))
ax.annotate(t('One inserted outlier','一个插入的离群值'),(3,1),xytext=(1.4,140),arrowprops={'arrowstyle':'->'},fontsize=11)
ax.set(xlabel=t('Weight value','权重值'),ylabel=t('Count','数量'));ax.legend();save(fig,10)

# 11: actual recorded lab results, robustly parsed from its output fence.
source=(ROOT/'src/en/module_10/21-labs-b.md').read_text(encoding='utf8')
rows=[]
translations={'int8 tensor':'int8 整张量','int8 channel':'int8 逐通道','int4 tensor':'int4 整张量','int4 channel':'int4 逐通道','int4 group64':'int4 分组 64','int4 group64 zero':'int4 分组 64 + 零点'}
for line in source.splitlines():
    match=re.match(r'^(int[48] .+?)\s+(\d+\.\d+)\s+\d+\.\d+\s+\d+\.\d+\s+(\d+\.\d+)$',line)
    if match:rows.append((t(match[1],translations[match[1]]),float(match[3])))
for label in ['W8A8','SmoothQuant 0.5','SmoothQuant 0.8']:
    match=re.search(r'^'+re.escape(label)+r' perplexity (\d+\.\d+)$',source,re.M)
    rows.append((label,float(match[1])))
fig,ax=f.figure(height=4.5,lang=lang)
ax.barh([r[0] for r in rows],[r[1] for r in rows],color=[f.BLUE]*6+[f.ORANGE]*3);ax.invert_yaxis()
ax.axvline(20.8462,linestyle='--',color=f.GREEN,label=t('Float32 baseline','float32 基线'))
ax.set(xscale='log',xlabel=t('Perplexity · Lab 4 measured','困惑度 · 实验 4 实测'),xlim=(10,1e7));ax.legend(loc='lower right');save(fig,11)

# 12: data follow the exact scale identity.
fig,axes=f.figure(height=4.3,ncols=2,nrows=2,lang=lang)
a=np.array([1.,40.,2.,1.]);w=np.array([.5,.5,.25,.8]);scale=np.sqrt(a/w)
for ax,values,label in zip(axes.flat,[a,a/scale,w,w*scale],
    [t('Activation before','变换前激活'),t('Activation after','变换后激活'),t('Weight before','变换前权重'),t('Weight after','变换后权重')]):
    ax.bar(range(4),values,color=f.BLUE);ax.set_title(label);ax.set_xticks(range(4));ax.set_ylabel(t('Channel maximum','通道最大值'))
save(fig,12)

# 13: corrected speculative timeline.
s=Diagram(280)
s.text(35,30,t('Plain: four target steps → four tokens','普通解码：四次目标模型步 → 四个 token'))
for i in range(4):s.box(35+i*155,50,140,45,t('Target','目标模型'))
s.text(35,140,t('Speculative: four drafts + one verification','投机解码：四次草稿步 + 一次验证'))
for i,label in enumerate([t('the ✓','the ✓'),t('hazard ✓','hazard ✓'),t('is ✓','is ✓'),t('thermal ✗','thermal ✗')]):s.box(35+i*105,160,95,35,label,fill='#F0FDF4',colour=f.GREEN)
s.box(475,155,205,50,t('Target verification','目标模型验证'))
s.text(35,240,t('Commit 3 accepted + 1 correction; discard later states','提交 3 个接受 token + 1 个修正 token；丢弃后续状态'))
s.text(35,268,t('Illustration: c = 0.05, v = 1 → 1.2 target-step times','示例：c = 0.05，v = 1 → 耗时为目标步的 1.2 倍'),12);s.write(13)

# 14: probabilities are computed, not copied from rounded outline numbers.
fig,axes=f.figure(height=3.6,ncols=2,lang=lang)
labels=['S','S1','S3','High','"','}'];logits=np.array([1.,2.,.5,3.,.2,-1.])
p=np.exp(logits-logits.max());p/=p.sum();allowed=np.array([1,1,1,0,0,0],bool)
masked=p*allowed;masked/=masked.sum()
for ax,values,title in zip(axes,[p,masked],[t('Unconstrained','无约束'),t('Valid-prefix mask','合法前缀掩码')]):
    ax.bar(labels,values,color=[f.BLUE if a else f.MUTED for a in allowed]);ax.set_title(title);ax.set_ylim(0,.7);ax.set_ylabel(t('Probability','概率'))
save(fig,14)

# 15: engine anatomy.
s=Diagram(340)
boxes=[(35,45,'API'),(255,45,t('Tokenizer + template','分词器 + 模板')),(475,45,t('Scheduler','调度器')),
       (475,170,t('KV block manager','KV 块管理器')),(255,170,t('Model runner','模型执行器')),(35,170,t('Sampler','采样器'))]
for x,y,label in boxes:s.box(x,y,190,55,label)
s.line(225,72,255,72,True);s.line(445,72,475,72,True);s.line(570,100,570,170,True)
s.line(475,198,445,198,True);s.line(255,198,225,198,True)
s.box(35,280,190,40,t('Detokenise + stream','反分词 + 流式输出'),fill='#F0FDF4',colour=f.GREEN)
s.line(130,225,130,280,True)
s.text(270,285,t('Metrics: queue, cache, latency, errors','指标：队列、KV cache、延迟、错误'))
s.text(270,315,t('Grammar / sampling / verification follow logits','语法、采样、验证基于 logits'),12);s.write(15)

# 16: computed utilisation curve with separately labelled simulation point.
fig,axes=f.figure(height=3.8,ncols=2,lang=lang)
axes[0].barh([t('Quiet','低负载'),t('Full load','满负载')],[13.4,54.2],color=[f.GREEN,f.ORANGE]);axes[0].set(xlabel=t('Approximate E2E seconds','估算端到端秒数'),xlim=(0,60))
u=np.geomspace(.05,1,250);cost=1/(2.4*u)
axes[1].semilogx(u*100,cost)
axes[1].axhline(.93,linestyle=':',color=f.GREEN,label=t('Assumed cached API, inputs included','假设缓存 API，含输入费'))
axes[1].scatter([100,6.9444,466.3/(2.4e6/3600)*100],[1/2.4,6.,1e6/(466.3*3600)],color=f.ORANGE)
axes[1].set(xlabel=t('Paid-hour utilisation (%)','付费时段利用率（%）'),ylabel=t('USD / million output tokens','USD / 百万输出 token'));axes[1].legend(fontsize=9);save(fig,16)

# 17: parse the deterministic simulator output.
source=(ROOT/'src/en/module_10/20-labs-a.md').read_text(encoding='utf8')
data={p:[] for p in ['static','reserve','paged','chunked']}
for line in source.splitlines():
    match=re.match(r'^(static|reserve|paged|chunked)\s+(\d+\.\d+)\s+[\d.]+\s+([\d.]+)/\s*([\d.]+)\s+([\d.]+)/\s*([\d.]+)/\s*([\d.]+)',line)
    if match:data[match[1]].append(list(map(float,match.groups()[1:])))
fig,axes=f.figure(height=5.3,nrows=2,lang=lang)
for index,(policy,rows) in enumerate(data.items()):
    a=np.array(rows);label=t(policy,{'static':'静态','reserve':'预留最大长度','paged':'按需分配','chunked':'分块预填充'}[policy])
    axes[0].semilogy(a[:,0],a[:,2],label=label,color=f.SERIES[index]);axes[0].semilogy(a[:,0],a[:,1],':',color=f.SERIES[index])
    axes[1].semilogy(a[:,0],a[:,4],color=f.SERIES[index]);axes[1].semilogy(a[:,0],a[:,5],':',color=f.SERIES[index])
axes[0].axhline(3,color=f.RED,linestyle='--');axes[1].axhline(100,color=f.RED,linestyle='--')
axes[0].set(ylabel=t('TTFT (seconds)','TTFT（秒）'),title=t('Solid: p99 · dotted: p50','实线：p99 · 虚线：p50'));axes[0].legend(fontsize=9)
axes[1].set(xlabel=t('Nominal arrivals / second','名义到达率 / 秒'),ylabel='ITL (ms)',title=t('Solid: p99 · dotted: maximum','实线：p99 · 虚线：最大值'));save(fig,17)

# 18: operational path.
s=Diagram(330)
for x,label in [(35,t('Gateway','网关')),(270,t('Router + breaker','路由器 + 熔断器')),(505,t('Primary server','主服务器'))]:s.box(x,60,180,65,label)
s.line(215,92,270,92,True);s.line(450,92,505,92,True)
s.box(505,210,180,55,t('Tested fallback','已验证的备用服务'),fill='#FFF7ED',colour=f.ORANGE)
s.line(360,125,505,237,True)
s.box(35,210,350,55,t('Metrics + provenance + usage ledger','指标 + 来源记录 + 用量台账'),fill='#F0FDF4',colour=f.GREEN)
s.text(35,35,t('Request → capacity-aware routing → identified producer','请求 → 根据容量路由 → 标识实际生成者'))
s.text(35,305,t('Readiness: loaded hash, queue depth and cache pressure','就绪状态：已加载的哈希、队列深度和 KV cache 压力'));s.write(18)
print(lang,'18 figures written')
