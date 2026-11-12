"""Bilingual Module 09 figures; recorded curves read lab metric artifacts.
Run from tutorial-sources/ai: .venv/Scripts/python.exe src/figures/en/_gen/module-09.py
"""
import json, sys, re
from pathlib import Path
from xml.sax.saxutils import escape
import numpy as np
sys.path.insert(0, 'src/figures')
import figstyle as fs
import matplotlib.pyplot as plt

ROOT = Path('src/figures')
def data(lab):
    return json.loads(Path(f'labs/module_09/lab{lab}-metrics.json').read_text())

for lang in ['en', 'zh']:
    def tr(en, zh):
        return zh if lang == 'zh' else en
    def svg_save(number, content, height=350):
        font = 'DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif'
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="720" height="{height}" '
               f'viewBox="0 0 720 {height}" font-family="{font}" fill="{fs.NAVY}">'
               '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" '
               'markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
               f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{fs.SLATE}"/></marker></defs>'
               + ''.join(content) + '</svg>')
        (ROOT/lang/f'fig-09-{number}.svg').write_text(svg, encoding='utf8')
    def text(out, x, y, label, size=14, anchor='middle', color=fs.NAVY):
        for i, line in enumerate(label.split('\n')):
            out.append(f'<text x="{x}" y="{y+i*20}" text-anchor="{anchor}" '
                       f'font-size="{size}" fill="{color}">{escape(line)}</text>')
    def box(out, x, y, w, height, label, color=fs.BLUE, fill='#F0F9FF'):
        out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{height}" rx="8" '
                   f'fill="{fill}" stroke="{color}" stroke-width="1.5"/>')
        lines=len(label.split('\n'))
        text(out,x+w/2,y+height/2-10*(lines-1)+5,label)
    def arrow(out, x1, y1, x2, y2):
        out.append(f'<path d="M{x1} {y1} L{x2} {y2}" fill="none" '
                   f'stroke="{fs.SLATE}" stroke-width="1.5" marker-end="url(#arrow)"/>')

    # 1: optional training paths and an explicit feedback path.
    out=[]
    labels=[tr('Base checkpoint','基座检查点'),tr('SFT\nDemonstrations','SFT\n示范数据'),
            tr('Preferences\nRM + PPO or DPO','偏好数据\nRM + PPO 或 DPO'),
            tr('Verifiable RL\nPrompts + checker','可验证奖励 RL\n提示 + 检查器')]
    for i,label in enumerate(labels):
        box(out,15+180*i,45,150,80,label)
        if i<3:arrow(out,165+180*i,85,195+180*i,85)
    box(out,240,195,240,65,tr('Evaluation gates → release','评估门槛 → 发布'),fs.GREEN,'#F0FDF4')
    arrow(out,630,125,630,227);arrow(out,630,227,480,227)
    out.append(f'<path d="M630 45 V15 H270 V45" fill="none" stroke="{fs.GREEN}" '
               'stroke-dasharray="5 4" marker-end="url(#arrow)"/>')
    text(out,360,155,tr('Verified samples can return to SFT','通过验证的样本可返回 SFT'))
    text(out,360,300,tr('Full weights or adapters at any training stage','任一训练阶段均可更新完整权重或适配器'))
    svg_save(1,out,325)

    # 2: no invented quantitative quality coordinates.
    out=[]
    roles=[tr('System','系统'),tr('User','用户'),tr('Assistant target','助手目标'),
           tr('User','用户'),tr('Assistant target','助手目标')]
    for i,label in enumerate(roles):
        assistant=i in [2,4]
        box(out,15,15+60*i,230,45,label,fs.ORANGE if assistant else fs.MUTED,
            '#FFF7ED' if assistant else '#FAFBFD')
    source=[tr('Human writing\nReviewed; high annotation cost','人工示范\n经过审核；标注成本高'),
            tr('Distillation\nTeacher + filter determine quality','蒸馏\n质量取决于教师与过滤器'),
            tr('Verified self-generation\nLimited by solvable prompts','验证后的自生成数据\n受可解提示范围限制'),
            tr('Scripted edits\nExact targets; narrow coverage','脚本编辑\n目标精确；覆盖范围较窄')]
    for i,label in enumerate(source):box(out,300,15+75*i,400,60,label)
    svg_save(2,out,320)

    # 3: compact symbolic tokenisation, not asserted real token IDs.
    out=[]
    tokens=['user','question','assistant','2500',' kPa','EOS','PAD']
    targets=['−100','−100','2500',' kPa','EOS','−100','−100']
    text(out,360,25,tr('Compact tokenisation: target is one position ahead','简化分词：目标比输入位置提前一位'))
    for row,label in enumerate([tr('Input token','输入 token'),tr('Next target','下一目标'),tr('Loss mask','损失掩码')]):
        text(out,16,85+80*row,label,12,'start')
        for i in range(7):
            active=2<=i<=4 and row>0
            value=tokens[i] if row==0 else targets[i] if row==1 else str(int(2<=i<=4))
            box(out,125+82*i,55+80*row,76,50,value,
                fs.ORANGE if active else fs.MUTED,'#FFF7ED' if active else '#FAFBFD')
    text(out,360,310,tr('Prompt is context; answer and EOS are predicted targets','提示提供上下文；回答和 EOS 是预测目标'))
    svg_save(3,out,335)

    # 5: square-projection rank arithmetic and zero-update initialisation.
    out=[]
    box(out,15,125,70,60,'x');box(out,145,25,385,70,
        tr('Frozen W: 4096 × 4096\n16,777,216 parameters','冻结 W：4096 × 4096\n16,777,216 个参数'),fs.MUTED,'#FAFBFD')
    box(out,145,165,170,80,'A: 64 × 4096\n'+tr('Random init','随机初始化'))
    box(out,355,165,175,80,'B: 4096 × 64\n'+tr('Zero init','零初始化'))
    box(out,595,125,105,60,'h = Wx\n+ sBAx')
    arrow(out,85,145,110,145);arrow(out,110,145,110,60);arrow(out,110,60,145,60)
    arrow(out,110,145,110,205);arrow(out,110,205,145,205);arrow(out,315,205,355,205)
    arrow(out,530,60,565,60);arrow(out,565,60,565,145);arrow(out,565,145,595,145)
    arrow(out,530,205,565,205);arrow(out,565,205,565,165);arrow(out,565,165,595,165)
    text(out,360,285,tr('524,288 adapter parameters; s = α/r; step 0: BA = 0',
                        '适配器共 524,288 个参数；s = α/r；第 0 步：BA = 0'))
    text(out,360,315,tr('Merge into floating-point W′ = W + sBA; test rounding again',
                        '合并到浮点权重 W′ = W + sBA；重新检查舍入误差'))
    svg_save(5,out,345)

    # 9: four models with stated full-state subtotals.
    out=[]
    box(out,15,15,210,80,tr('Policy: trained\n152.8 GB states','策略：训练\n152.8 GB 状态'))
    box(out,270,15,190,80,tr('Generated responses','生成的回答'))
    box(out,505,15,200,80,tr('Value: trained\n142.9 GB states','价值：训练\n142.9 GB 状态'))
    box(out,15,150,210,80,tr('Reference: frozen\n19.1 GB weights','参考：冻结\n19.1 GB 权重'),fs.MUTED,'#FAFBFD')
    box(out,270,150,190,80,tr('Scores → advantages\nClipped updates','评分 → 优势\n裁剪更新'))
    box(out,505,150,200,80,tr('Reward: frozen\n17.9 GB weights','奖励：冻结\n17.9 GB 权重'),fs.MUTED,'#FAFBFD')
    arrow(out,225,55,270,55);arrow(out,365,95,365,150);arrow(out,505,55,460,55)
    arrow(out,225,190,270,190);arrow(out,505,190,460,190)
    out.append(f'<path d="M365 230 V250 H245 V115 H120 V95" fill="none" '
               f'stroke="{fs.SLATE}" stroke-width="1.5" marker-end="url(#arrow)"/>')
    text(out,360,280,tr('Full: 332.6 GB; stated shared-base LoRA: 43.2 GB',
                        '完整微调：332.6 GB；所述共享基座模型 LoRA：43.2 GB'))
    text(out,360,307,tr('Activations and rollout KV caches are additional','激活与采样 KV cache 另计'),12)
    svg_save(9,out,330)

    out=[]
    chain=[tr('KL-regularised objective','KL 正则化目标'),
           'π* = πref exp(r/β) / Z',
           'r = β log(π*/πref) + β log Z',
           tr('Same-prompt pair: log Z cancels','同一提示的比较：log Z 抵消'),
           tr('LDPO = −log σ(β[log-ratio difference])','LDPO = −log σ(β[对数比之差])')]
    for i,label in enumerate(chain):
        box(out,100,12+i*73,520,52,label)
        if i<4:arrow(out,360,64+i*73,360,85+i*73)
    svg_save(11,out,375)

    out=[]
    segments=[(300,tr('System','系统'),False),(450,tr('Schemas','工具模式'),False),
              (40,tr('User','用户'),False),(35,tr('Call','调用'),True),
              (600,tr('Tool result','工具结果'),False),(120,tr('Answer','回答'),True)]
    # Equal visual cells make labels legible; explicit numbers carry the accounting.
    for i,(count,label,target) in enumerate(segments):
        box(out,15+116*i,30,105,85,f'{label}\n{count}',
            fs.ORANGE if target else fs.MUTED,'#FFF7ED' if target else '#FAFBFD')
        box(out,15+116*i,135,105,40,str(int(target)),
            fs.ORANGE if target else fs.MUTED,'#FFF7ED' if target else '#FAFBFD')
    text(out,360,205,tr('Loss mask: 155 targets / 1,545 context tokens ≈ 10%',
                        '损失掩码：155 个目标 / 1,545 个上下文 token ≈ 10%'))
    box(out,160,245,400,55,tr('Alternative: no tool needed → answer directly',
                             '另一条路径：无需工具 → 直接回答'),fs.GREEN,'#F0FDF4')
    svg_save(17,out,325)

    out=[]
    steps=[tr('Baselines + CPT decision','基线 + CPT 决策'),
           tr('SFT + chat rows\n~3 assumed GPU-hours','SFT + 聊天 token 行\n假设约 3 GPU 小时'),
           tr('Gate: domain + general behaviour','门槛：领域 + 通用行为'),
           tr('GRPO; reference = SFT\n~23 assumed GPU-hours','GRPO；参考 = SFT\n假设约 23 GPU 小时'),
           tr('Gate: quality, length, human audit','门槛：质量、长度、人工审查'),
           tr('Merge → quantise → evaluate → hash','合并 → 量化 → 评估 → 哈希')]
    for i,label in enumerate(steps):
        box(out,100,10+64*i,520,48,label,fs.GREEN if i in [2,4] else fs.BLUE,
            '#F0FDF4' if i in [2,4] else '#F0F9FF')
        if i<5:arrow(out,360,58+64*i,360,74+64*i)
    text(out,360,423,tr('Hypothetical recipe; structural validity does not establish truth',
                        '假设方案；结构有效不等于内容真实'),12)
    svg_save(21,out,445)

    # Computed plots; all text remains real SVG text.
    def save(fig,n):
        path=Path(fs.save(fig,f'fig-09-{n}',lang))
        svg=path.read_text(encoding='utf8')
        svg=svg.replace('<svg ', '<svg font-family="DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif" ',1)
        path.write_text('\n'.join(line.rstrip() for line in svg.splitlines())+'\n',encoding='utf8')

    fig,ax=fs.figure(height=4.7,lang=lang)
    components=np.array([[19.101,19.101,38.203,76.406,3.607],
                         [19.101,0,3.133,0,3.607], [6.776,0,3.133,0,3.607]])
    bottom=np.zeros(3)
    labels=[tr('Weights','权重'),tr('Gradients','梯度'),tr('Master / adapter state','主权重 / 适配器状态'),
            tr('Adam moments','Adam 矩'),tr('Activations','激活')]
    for k,label in enumerate(labels):
        ax.barh(range(3),components[:,k],left=bottom,label=label);bottom+=components[:,k]
    ax.set_yticks(range(3),[tr('Full','完整微调'),'LoRA r=64','QLoRA r=64'])
    for i,value in enumerate(bottom):ax.text(value+1,i,f'{value:.1f}',va='center',fontsize=11)
    ax.set_xlim(0,180);ax.set_xlabel(tr('Subtotal (decimal GB), runtime buffers excluded','小计（十进制 GB），不含运行时缓冲'))
    for capacity in [24,48,80]:ax.axvline(capacity,color=fs.MUTED,linestyle='--',linewidth=1)
    ax.set_title(tr('Reference budgets: 24, 48, 80 decimal GB','参考预算：24、48、80 十进制 GB'),fontsize=11)
    ax.legend(loc='lower center',bbox_to_anchor=(.5,1.13),ncol=2,fontsize=11)
    ax.invert_yaxis();save(fig,6)

    fig,axes=fs.figure(height=3.5,ncols=2,lang=lang)
    delta=np.linspace(-4,4,401);prob=1/(1+np.exp(-delta));loss=np.logaddexp(0,-delta)
    for ax,y,label in zip(axes,[prob,loss],[tr('Win probability','胜出概率'),tr('Observed-winner loss','观测胜者损失')]):
        ax.plot(delta,y);ax.set_xlabel('Δ '+tr('(reward difference)','（奖励差）'));ax.set_ylabel(label)
        points=np.array([-0.9,0.9]);values=1/(1+np.exp(-points)) if ax is axes[0] else np.logaddexp(0,-points)
        ax.scatter(points,values,color=fs.ORANGE);ax.grid(True)
    save(fig,7)

    metrics=data(3)['selection'];fig,ax=fs.figure(height=3.6,lang=lang)
    keys=['linear_proxy','linear_true','mlp_true','oracle_true']
    names=[tr('Linear proxy','线性代理奖励'),tr('Linear pick: true','线性选择：真实奖励'),
           tr('MLP pick: true','MLP 选择：真实奖励'),tr('Oracle pick: true','真值选择：真实奖励')]
    for key,label in zip(keys,names):ax.plot([m['kl_bound'] for m in metrics],[m[key] for m in metrics],marker='o',label=label)
    ax.set_xlabel(tr('Best-of-n KL bound (nats)','n 选优的 KL 上界（纳特）'));ax.set_ylabel(tr('Reward','奖励'));ax.legend(fontsize=11);save(fig,8)

    metrics=data(4);fig,axes=fs.figure(height=3.7,ncols=3,lang=lang)
    for group,style,label in [('on_policy','-',tr('On-policy','同策略')),('off_policy','--',tr('Off-policy','异策略'))]:
        rows=metrics[group];steps=[m['step'] for m in rows]
        for ax,key in zip(axes,['loss','chosen_ratio','accuracy']):
            ax.plot(steps,[m[key] for m in rows],style,label=label)
    for ax,title in zip(axes,[tr('DPO loss','DPO 损失'),tr('Chosen log-ratio','胜者对数比'),tr('Task accuracy','任务准确率')]):
        ax.set_title(title);ax.set_xlabel(tr('Step','步数'));ax.legend(fontsize=11)
    save(fig,12)

    fig,axes=fs.figure(height=3.4,ncols=2,lang=lang)
    axes[0].axis('off')
    flow=[tr('Sample n / prompt','每个提示采样 n 次'),tr('Verify → cap kept samples','验证 → 限制保留数'),
          tr('SFT → updated policy → repeat','SFT → 更新策略 → 重复')]
    for i,label in enumerate(flow):axes[0].text(.5,.85-.3*i,label,ha='center',va='center',
        bbox={'boxstyle':'round,pad=.6','facecolor':'#F0F9FF','edgecolor':fs.BLUE},fontsize=11)
    for i in range(2):axes[0].annotate('',xy=(.5,.62-.3*i),xytext=(.5,.78-.3*i),
        arrowprops={'arrowstyle':'->','color':fs.SLATE})
    axes[0].text(.5,.03,tr('No success → no target','无成功样本 → 无训练目标'),ha='center',fontsize=11)
    n=np.arange(1,65)
    for prob in [.05,.2,.5]:axes[1].plot(n,1-(1-prob)**n,label=f'p={prob}')
    axes[1].set_xscale('log',base=2);axes[1].set_xticks([1,2,4,8,16,32,64],[1,2,4,8,16,32,64])
    axes[1].set_xlabel(tr('Samples n','采样数 n'));axes[1].set_ylabel(tr('Coverage','覆盖率'));axes[1].legend(fontsize=11);save(fig,13)

    fig,axes=fs.figure(height=4,nrows=2,lang=lang)
    rewards=np.array([1]+[0]*7,dtype=float);advantages=(rewards-rewards.mean())/rewards.std(ddof=1)
    axes[0].bar(range(1,9),advantages,color=[fs.BLUE]+[fs.ORANGE]*7)
    axes[0].set_title(tr('One success: mean 0.125; sample std 0.354','一次成功：均值 0.125；样本标准差 0.354'))
    axes[1].bar(range(1,9),np.zeros(8));axes[1].axhline(0,color=fs.MUTED)
    axes[1].set_title(tr('All succeed: zero task advantages; KL can still act','全部成功：任务优势为零；KL 仍可起作用'))
    for ax in axes:ax.set_xticks(range(1,9));ax.set_ylabel(tr('Advantage','优势'))
    axes[1].set_xlabel(tr('Response in group','组内回答'));save(fig,14)

    metrics=data(5);fig,axes=fs.figure(height=5.4,ncols=2,nrows=2,lang=lang)
    for group,label in [('exact_beta_004','β=0.04'),('exact_beta_05','β=0.5')]:
        rows=metrics[group];steps=[m['iteration'] for m in rows]
        axes[0,0].plot(steps,[m['sampled_reward'] for m in rows],label=label)
        axes[1,0].plot(steps,[m['kl'] for m in rows],label=label)
    rows=metrics['exact_beta_004'][1:]
    axes[0,1].plot([m['iteration'] for m in rows],[m['zero_variance'] for m in rows])
    rows=metrics['flawed'];steps=[m['iteration'] for m in rows]
    acceptance=[m.get('verifier_reward',m['sampled_reward']) for m in rows]
    exact=[m['accuracy'] for m in rows]
    axes[1,1].plot(steps,acceptance,label=tr('Verifier accepts','检查器接受'))
    axes[1,1].plot(steps,exact,label=tr('Exact answer','精确答案'))
    axes[1,1].fill_between(steps,exact,acceptance,color=fs.ORANGE,alpha=.15)
    titles=[tr('Batch reward','批量奖励'),tr('Zero-variance groups','零方差组比例'),tr('Sequence KL (nats)','序列 KL（纳特）'),tr('Substring checker','子串检查器')]
    for ax,title in zip(axes.flat,titles):ax.set_title(title);ax.set_xlabel(tr('Iteration','迭代'))
    for ax in [axes[0,0],axes[1,0],axes[1,1]]:ax.legend(fontsize=11)
    save(fig,15)

    fig,axes=fs.figure(height=3.6,ncols=2,lang=lang);axes[0].axis('off')
    cells=[tr('Harmful + refuse\nDesired boundary','有害 + 拒绝\n期望边界'),tr('Harmful + comply\nUnsafe compliance','有害 + 服从\n不安全服从'),
           tr('Benign + refuse\nOver-refusal','无害 + 拒绝\n过度拒绝'),tr('Benign + comply\nDesired help','无害 + 服从\n期望帮助')]
    for i,label in enumerate(cells):axes[0].text(.25+.5*(i%2),.75-.5*(i//2),label,ha='center',va='center',fontsize=11,
        bbox={'boxstyle':'round,pad=.5','facecolor':'#FFF7ED' if i in [1,2] else '#F0FDF4','edgecolor':fs.MUTED})
    axes[1].plot([18,36],[97,99],'o-');axes[1].set_xlim(0,45);axes[1].set_ylim(90,100)
    axes[1].set_xlabel(tr('Benign refusal (%)','无害请求拒绝率（%）'));axes[1].set_ylabel(tr('Harmful refusal (%)','有害请求拒绝率（%）'))
    axes[1].set_title(tr('Hypothetical before → after','假设的更新前 → 更新后'));save(fig,16)

    metrics=data(6);fig,axes=fs.figure(height=4.8,nrows=2,lang=lang,gridspec_kw={'height_ratios':[4,1]})
    categories=['format','task','benign','refuse','abstain','overall']
    category_names=[tr('Format','格式'),tr('Task','任务'),tr('Benign','无害'),tr('Refuse','拒绝'),tr('Abstain','弃权'),tr('Overall','总体')]
    for i,category in enumerate(categories):
        for model,offset,color in [('base',-.13,fs.SLATE),('instruct',.13,fs.ORANGE)]:
            row=next(m for m in metrics['categories'] if m['category']==category and m['model']==model)
            value=row['pass_rate'];lo,hi=row['wilson'];blo,bhi=row['bootstrap']
            axes[0].plot([lo,hi],[i+offset]*2,color=color,linewidth=1)
            axes[0].plot([blo,bhi],[i+offset]*2,color=color,linewidth=4,alpha=.4)
            axes[0].scatter([value],[i+offset],color=color,s=20)
    axes[0].set_yticks(range(6),category_names);axes[0].set_xlim(-.05,1.05);axes[0].invert_yaxis()
    axes[0].set_title(tr('Grey: base; orange: instruct; thin: Wilson; thick: bootstrap',
                         '灰：基座模型；橙：指令模型；细：Wilson；粗：bootstrap'),fontsize=11)
    lo,hi=metrics['paired_bootstrap'];axes[1].plot([lo,hi],[0,0],color=fs.BLUE)
    axes[1].scatter([metrics['difference']],[0],color=fs.BLUE);axes[1].axvline(0,color=fs.MUTED)
    axes[1].set_yticks([0],[tr('Paired difference','配对差值')]);axes[1].set_xlim(-.1,.3)
    axes[1].set_xlabel(tr('Rate / difference (fraction)','通过率 / 差值（比例）'));save(fig,18)

    fig,axes=fs.figure(height=3.4,ncols=2,lang=lang)
    x=np.linspace(-2,2,100);X,Y=np.meshgrid(x,x)
    landscapes=[X**2+.25*Y**2,(X**2-1)**2+.25*Y**2]
    for ax,Z,title in zip(axes,landscapes,[tr('Compatible basin (schematic)','兼容的低损失区域（示意）'),tr('Possible barrier (schematic)','可能的损失屏障（示意）')]):
        ax.contour(X,Y,Z,levels=[.1,.3,.6,1,2,4],colors=fs.MUTED)
        ax.plot([-.8,.8],[0,0],'o-',color=fs.BLUE);ax.scatter([0],[0],color=fs.ORANGE)
        ax.set_title(title,fontsize=11);ax.set_xlabel(tr('Parameter coordinate 1','参数坐标 1'));ax.set_ylabel(tr('Coordinate 2','坐标 2'))
    save(fig,20)
    print(lang, '18 figures generated')
