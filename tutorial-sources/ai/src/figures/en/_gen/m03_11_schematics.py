"""Schematics for fig-03-14, 15, 18, 20, 24 (Module 03, 11-concepts-b).
Usage: python m03_11_schematics.py [en|zh]   (writes src/figures/<lang>/fig-03-NN.svg)"""
import sys, os, textwrap
NAVY="#1A2E4A"; SLATE="#475569"; FAINT="#94A3B8"; GRID="#E2E8F0"
BLUE="#2563EB"; BF="#DBEAFE"; GREEN="#15803D"; GF="#F0FDF4"
ORANGE="#C2410C"; OF="#FFF7ED"; RED="#DC2626"; RF="#FEF2F2"; PUR="#7E22CE"; PF="#FAF5FF"

def head(w,h,zh):
    ff = "DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif" if zh else "DM Sans, system-ui, -apple-system, Segoe UI, sans-serif"
    m = "".join(f'<marker id="{i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>' for i,c in
        [("ah",SLATE),("ahr",RED),("ahb",BLUE),("ahg",GREEN)])
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" font-family="{ff}" font-size="13" fill="{NAVY}">\n<defs>{m}</defs>\n'

def T(x,y,s,size=13,anchor="middle",fill=NAVY,weight=None):
    w = f' font-weight="{weight}"' if weight else ""
    return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{fill}"{w}>{s}</text>\n'
def I(s): return f'<tspan font-style="italic">{s}</tspan>'
def sub(s): return f'<tspan dy="4" font-size="10">{s}</tspan><tspan dy="-4"> </tspan>'
def sup(s): return f'<tspan dy="-5" font-size="10">{s}</tspan><tspan dy="5"> </tspan>'
def box(x,y,w,h,fill,stroke,lines,size=13,tc=NAVY,sw=1.5):
    o=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>\n'
    n=len(lines); lh=size+3; y0=y+h/2-(n-1)*lh/2+size*0.35
    for i,l in enumerate(lines): o+=T(x+w/2,round(y0+i*lh,1),l,size,fill=tc)
    return o
def line(x1,y1,x2,y2,c=SLATE,sw=1.5,arrow=None,dash=None):
    m = f' marker-end="url(#{arrow})"' if arrow else ""
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{sw}"{m}{d}/>\n'
def path(d,c=SLATE,sw=1.5,arrow=None,dash=None):
    m = f' marker-end="url(#{arrow})"' if arrow else ""
    dd = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{sw}"{m}{dd}/>\n'
def cub(x,y,w,h,d,fill,stroke,sw=1.4):
    dx=d; dy=-d*0.6
    o=f'<polygon points="{x},{y} {x+dx},{y+dy} {x+w+dx},{y+dy} {x+w},{y}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>\n'
    o+=f'<polygon points="{x+w},{y} {x+w+dx},{y+dy} {x+w+dx},{y+h+dy} {x+w},{y+h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>\n'
    o+=f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>\n'
    return o
def lock(x,y,c=NAVY):
    return (f'<path d="M{x+2},{y+4} v-3 a4,4 0 0 1 8,0 v3" fill="none" stroke="{c}" stroke-width="1.6"/>'
            f'<rect x="{x}" y="{y+4}" width="12" height="9" rx="2" fill="{c}"/>\n')

# ---------------------------------------------------------------- fig-03-15
def fig15(zh):
    L = dict(inp=["输入","28 × 28 × 192"], conv="卷积", red="1×1 降维", pool="3×3 最大池化", proj="1×1 投影",
             cat=["通道拼接","28 × 28 × 256","64 + 128 + 32 + 32"], note1="无降维：", note2="有降维：", macs="百万次乘加", hl="高亮：1×1 降维卷积") if zh else \
        dict(inp=["input","28 × 28 × 192"], conv="conv", red="1×1 reduce", pool="3×3 max pool", proj="1×1 project",
             cat=["concatenate","28 × 28 × 256","64 + 128 + 32 + 32"], note1="without reduction:", note2="with reduction:", macs="M multiply-adds", hl="highlighted: 1×1 reductions")
    W,H=740,420
    o=head(W,H,zh)
    ys=[50,146,242,338]; bh=46
    xi,wi=14,104; x1,w1=170,120; x2,w2=334,120; xc=520; xo,wo=584,142
    cy=(ys[0]+ys[3])/2
    o+=box(xi,cy-34,wi,68,"#F0F9FF",BLUE,L["inp"])
    o+=line(xi+wi,cy,150,cy)
    o+=line(150,ys[0],150,ys[3])
    for y in ys: o+=line(150,y,x1,y,SLATE,1.5,"ah")
    o+=box(x1,ys[0]-bh/2,w1,bh,BF,BLUE,[L["conv"]+" 1×1","→ 64"])
    o+=line(x1+w1,ys[0],xc,ys[0],SLATE,1.5,"ah")
    o+=box(x1,ys[1]-bh/2,w1,bh,OF,ORANGE,[L["red"],"→ 96"]); o+=line(x1+w1,ys[1],x2,ys[1],SLATE,1.5,"ah")
    o+=box(x2,ys[1]-bh/2,w2,bh,BF,BLUE,[L["conv"]+" 3×3","→ 128"]); o+=line(x2+w2,ys[1],xc,ys[1],SLATE,1.5,"ah")
    o+=box(x1,ys[2]-bh/2,w1,bh,OF,ORANGE,[L["red"],"→ 16"]); o+=line(x1+w1,ys[2],x2,ys[2],SLATE,1.5,"ah")
    o+=box(x2,ys[2]-bh/2,w2,bh,BF,BLUE,[L["conv"]+" 5×5","→ 32"]); o+=line(x2+w2,ys[2],xc,ys[2],SLATE,1.5,"ah")
    o+=box(x1,ys[3]-bh/2,w1,bh,"#F8FAFC",SLATE,[L["pool"]]); o+=line(x1+w1,ys[3],x2,ys[3],SLATE,1.5,"ah")
    o+=box(x2,ys[3]-bh/2,w2,bh,OF,ORANGE,[L["proj"],"→ 32"]); o+=line(x2+w2,ys[3],xc,ys[3],SLATE,1.5,"ah")
    for y,c in zip(ys,["64","128","32","32"]): o+=T(xc-8,y-6,c,12,"end",SLATE)
    o+=f'<rect x="{xc}" y="{ys[0]-22}" width="18" height="{ys[3]-ys[0]+44}" rx="6" fill="{GF}" stroke="{GREEN}" stroke-width="1.5"/>\n'
    o+=line(xc+18,cy,xo,cy,SLATE,1.5,"ah")
    o+=box(xo,cy-40,wo,80,GF,GREEN,L["cat"],13)
    o+=T(x1,ys[2]+40,f'{L["note1"]} <tspan font-weight="700" fill="{RED}">120.4</tspan> {L["macs"]}',12,"start",SLATE)
    o+=T(x1,ys[2]+57,f'{L["note2"]} <tspan font-weight="700" fill="{GREEN}">12.4</tspan> {L["macs"]}',12,"start",SLATE)
    o+=f'<rect x="{x1}" y="{H-26}" width="14" height="12" rx="3" fill="{OF}" stroke="{ORANGE}" stroke-width="1.5"/>\n'
    o+=T(x1+22,H-16,L["hl"],12,"start",SLATE)
    return o+'</svg>\n'

# ---------------------------------------------------------------- fig-03-14
def fig14(zh):
    L = dict(std="标准卷积", sep="深度可分离卷积", inp=["输入","C_in 个通道"], out=["输出","C_out 个通道"],
             sf=["C_out 个滤波器","每个 k×k×C_in"], dw=["C_in 个滤波器","每个 k×k×1"], maps=["C_in 张","特征图"],
             pw=["C_out 个滤波器","每个 1×1×C_in"], note="每个输出位置的乘加：",
             n1="每个滤波器用全部输入通道产生一张输出图", n2a="逐通道：每个滤波器只看自己的通道", n2b="逐点：1×1 滤波器混合各通道") if zh else \
        dict(std="Standard convolution", sep="Depthwise-separable convolution", inp=["input","C_in channels"], out=["output","C_out channels"],
             sf=["C_out filters","each k×k×C_in"], dw=["C_in filters","k×k×1 each"], maps=["C_in","maps"],
             pw=["C_out filters","1×1×C_in each"], note="multiply-accumulates per output position:",
             n1="each filter makes one map from all input channels", n2a="depthwise: each filter sees only its own channel", n2b="pointwise: 1×1 filters mix the maps")
    if not zh:
        for k in ("inp","out","sf","dw","maps","pw"):
            L[k]=[s.replace("C_in",f'{I("C")}{sub("in")}').replace("C_out",f'{I("C")}{sub("out")}').replace("k×k",f'{I("k")}×{I("k")}') for s in L[k]]
    else:
        for k in ("inp","out","sf","dw","maps","pw"):
            L[k]=[s.replace("C_in",f'{I("C")}{sub("in")}').replace("C_out",f'{I("C")}{sub("out")}').replace("k×k",f'{I("k")}×{I("k")}') for s in L[k]]
    W,H=760,380
    o=head(W,H,zh)
    o+=T(185,24,L["std"],14,weight="700")
    o+=T(572,24,L["sep"],14,weight="700")
    o+=line(380,10,380,320,GRID,1.5)
    base=150
    def label(cx,lines,y=base+52,size=12):
        return "".join(T(cx,y+i*15,l,size,fill=SLATE) for i,l in enumerate(lines))
    cx=[56,185,314]
    o+=cub(cx[0]-22,base-22,44,44,30,"#F0F9FF",NAVY); o+=label(cx[0],L["inp"])
    for k in range(3): o+=cub(cx[1]-19+k*10,base-9+(1-k)*14,18,18,30,BF,BLUE)
    o+=label(cx[1],L["sf"])
    o+=cub(cx[2]-22,base-22,44,44,36,GF,GREEN); o+=label(cx[2],L["out"])
    o+=line(cx[0]+58,base-6,cx[1]-40,base-6,SLATE,1.5,"ah"); o+=line(cx[1]+56,base-6,cx[2]-30,base-6,SLATE,1.5,"ah")
    o+=T(185,base+100,L["n1"],12,fill=SLATE)
    cr=[410,480,548,620,708]
    o+=cub(cr[0]-18,base-22,36,44,26,"#F0F9FF",NAVY); o+=label(cr[0],L["inp"],base+52,11)
    for k in range(4): o+=cub(cr[1]-14+k*8,base-9+(1.5-k)*10,16,16,4,OF,ORANGE,1.2)
    o+=label(cr[1],L["dw"],base+52,11)
    o+=cub(cr[2]-18,base-22,36,44,26,PF,PUR); o+=label(cr[2],L["maps"],base+52,11)
    for k in range(3): o+=cub(cr[3]-10+k*8,base-4+(1-k)*14,6,6,26,BF,BLUE,1.2)
    o+=label(cr[3],L["pw"],base+52,11)
    o+=cub(cr[4]-16,base-22,32,44,22,GF,GREEN); o+=label(cr[4],L["out"],base+52,11)
    o+=line(cr[0]+46,base-6,cr[1]-20,base-6,SLATE,1.5,"ah")
    o+=line(cr[1]+36,base-6,cr[2]-22,base-6,SLATE,1.5,"ah")
    o+=line(cr[2]+46,base-6,cr[3]-14,base-6,SLATE,1.5,"ah")
    o+=line(cr[3]+36,base-6,cr[4]-20,base-6,SLATE,1.5,"ah")
    o+=T(396,base+100,L["n2a"],12,"start",SLATE)
    o+=T(396,base+116,L["n2b"],12,"start",SLATE)
    k2=f'{I("k")}{sup("2")}'
    Ci=f'{I("C")}{sub("in")}'; Co=f'{I("C")}{sub("out")}'
    o+=T(185,H-62,L["note"],12,fill=SLATE)
    o+=T(185,H-36,f'{k2}·{Ci}·{Co}',17,fill=BLUE,weight="700")
    o+=T(572,H-62,L["note"],12,fill=SLATE)
    o+=T(572,H-36,f'{k2}·{Ci} + {Ci}·{Co}',17,fill=ORANGE,weight="700")
    return o+'</svg>\n'

# ---------------------------------------------------------------- fig-03-18
def fig18(zh):
    L = dict(orig="原始设计", pre="预激活变体", relu="ReLU", conv="卷积 3×3", bn="BN",
             idn=["恒等路径","（形状不同时用","步长 1×1 卷积","+ BN）"], none="加法之后没有任何运算") if zh else \
        dict(orig="Original design", pre="Pre-activation variant", relu="ReLU", conv="conv 3×3", bn="BN",
             idn=["identity path","(strided 1×1 conv","+ BN if shapes","differ)"], none="nothing follows the addition")
    W,H=740,470
    o=head(W,H,zh)
    hl=f'{I("h")}{sub(I("l"))}'; hn=f'{I("h")}{sub(I("l")+"+1")}'
    def panel(x0,title,seq,relu_after):
        s=T(x0+215,22,title,14,weight="700")
        bx=x0+215; bw=110; bh=30; gap=14
        s+=T(bx,52,hl,14,weight="700")
        y=62; ix=x0+40
        ytop=y+24
        ys=[ytop+i*(bh+gap) for i in range(len(seq))]
        s+=line(bx,58,bx,y,SLATE,1.5)
        s+=line(bx,y,bx,ytop,SLATE,1.5,"ah")
        for yy,kind in zip(ys,seq):
            if kind=="conv": s+=box(bx-bw/2,yy,bw,bh,BF,BLUE,[L["conv"]])
            elif kind=="bn": s+=box(bx-bw/2,yy,bw,bh,PF,PUR,[L["bn"]])
            else: s+=box(bx-bw/2,yy,bw,bh,GF,GREEN,[L["relu"]])
        for i in range(len(ys)-1): s+=line(bx,ys[i]+bh,bx,ys[i+1],SLATE,1.5,"ah")
        yadd=ys[-1]+bh+36
        s+=line(bx,ys[-1]+bh,bx,yadd-13,SLATE,1.5,"ah")
        s+=path(f"M{bx},{y} H{ix} V{yadd} H{bx-13}",SLATE,1.5,"ah")
        s+=f'<circle cx="{bx}" cy="{yadd}" r="13" fill="#fff" stroke="{NAVY}" stroke-width="1.8"/>'+line(bx-7,yadd,bx+7,yadd,NAVY,1.8)+line(bx,yadd-7,bx,yadd+7,NAVY,1.8)
        ye=yadd+13
        if relu_after:
            s+=line(bx,ye,bx,ye+20,SLATE,1.5,"ah"); s+=box(bx-bw/2,ye+20,bw,bh,GF,GREEN,[L["relu"]])
            ye=ye+20+bh
        s+=line(bx,ye,bx,ye+24,SLATE,1.5,"ah"); s+=T(bx,ye+42,hn,14,weight="700")
        return s,ix
    left,ixl=panel(0,L["orig"],["conv","bn","relu","conv","bn"],True)
    right,ixr=panel(370,L["pre"],["bn","relu","conv","bn","relu","conv"],False)
    o+=left+right
    o+=line(370-1,36,370-1,H-20,GRID,1.5)
    for i,l in enumerate(L["idn"]): o+=T(ixl+8,190+i*15,l,12,"start",SLATE)
    o+=T(ixr+8,190,L["idn"][0],12,"start",SLATE)
    o+=T(370+215,H-6,L["none"],12,fill=SLATE)
    return o+'</svg>\n'

# ---------------------------------------------------------------- fig-03-20
def fig20(zh):
    L = dict(branch="经过残差支路：每过一个支路，乘以该支路的雅可比矩阵", hw="沿恒等高速通道：从网络顶部到底部，原样不变") if zh else \
        dict(branch="through the residual branches: times each branch's Jacobian", hw="along the identity highway: unchanged from top to bottom")
    W,H=740,400
    o=head(W,H,zh)
    n=6; x0=70; dxn=120; ym=170
    xs=[x0+i*dxn for i in range(n)]
    names=[f'{I("h")}{sub(I("l"))}']+[f'{I("h")}{sub(I("l")+"+"+str(i))}' for i in range(1,5)]+[f'{I("h")}{sub(I("L"))}']
    by=ym-82
    o+=T(30,26,L["branch"],13,"start",RED,weight="700")
    for i in range(n-1): o+=line(xs[i]+10,ym,xs[i+1]-10,ym,FAINT,1.5)
    for i in range(5):
        xa,xb=xs[i],xs[i+1]; bxm=(xa+xb)/2
        o+=path(f"M{xb},{ym-12} V{by+12} H{bxm+24}",RED,2)
        o+=path(f"M{bxm-24},{by+12} H{xa} V{ym-14}",RED,2,"ahr")
        o+=box(bxm-24,by,48,24,OF,ORANGE,[f'{I("F")}{sub(str(i+1))}'],13)
        o+=T(bxm,by-8,f'× {I("∂F")}{sub(str(i+1))}/{I("∂h")}',11,fill=RED)
    for i,x in enumerate(xs):
        o+=f'<circle cx="{x}" cy="{ym}" r="10" fill="#fff" stroke="{NAVY}" stroke-width="1.8"/>\n'
        o+=T(x,ym+32,names[i],13,weight="700")
    yh=ym+88
    o+=T(W/2,yh+28,L["hw"],13,fill=GREEN,weight="700")
    o+=path(f"M{xs[-1]+12},{ym} H{xs[-1]+28} V{yh} H{xs[0]-28} V{ym} H{xs[0]-16}",GREEN,3,"ahg")
    eq=(f'{I("∂ℒ")}/{I("∂h")}{sub(I("l"))} = {I("∂ℒ")}/{I("∂h")}{sub(I("L"))} ( {I("I")} + {I("∂")}/{I("∂h")}{sub(I("l"))} Σ{sub(I("i"))} {I("F")}{sub(I("i"))} )')
    o+=T(W/2,H-50,eq,16,weight="700")
    return o+'</svg>\n'

# ---------------------------------------------------------------- fig-03-24
def fig24(zh):
    L = dict(titles=["(a) 从头训练","(b) 保留并冻结第 1 块","(c) 线性探测","(d) 微调"], blk="第 ", head="分类头",
             sub=["全部新建","其余两块新建","三块全部冻结，只训练头","先训练头，再以十分之一学习率训练全部"],
             leg=["新建，参与训练","预训练，冻结","预训练，微调（学习率 ÷ 10）"], foot="每类 5 张图像，5 个随机种子的平均准确率（实验 4）", acc="准确率") if zh else \
        dict(titles=["(a) from scratch","(b) first block kept, frozen","(c) linear probe","(d) fine-tuning"], blk="Block ", head="Head",
             sub=["all blocks new","other two blocks new","all three frozen; only the head trains","head first, then all blocks at a tenth of the learning rate"],
             leg=["new, trained","pretrained, frozen","pretrained, fine-tuned (rate ÷ 10)"], foot="5 images per class, mean accuracy over 5 seeds (Lab 4)", acc="accuracy")
    W,H=760,430
    o=head(W,H,zh)
    accs=["0.91","0.91","0.66","0.81"]
    kinds=[["new"]*3+["newh"], ["frozen","new","new","newh"], ["frozen"]*3+["newh"], ["ft"]*3+["newh"]]
    pw=176; gapx=14; x0=(W-4*pw-3*gapx)/2
    bw=124; bh=34; gap=16
    for p in range(4):
        px=x0+p*(pw+gapx); cx=px+pw/2
        o+=f'<rect x="{px}" y="8" width="{pw}" height="{H-62}" rx="10" fill="none" stroke="{GRID}" stroke-width="1.5"/>\n'
        tl=L["titles"][p]
        if not zh and len(tl)>20:
            parts=textwrap.wrap(tl,20)
            for j,t in enumerate(parts): o+=T(cx,30+j*16,t,13,weight="700")
        else: o+=T(cx,30,tl,13,weight="700")
        y=56
        names=[(L["blk"]+"1"+(" 块" if zh else "")),(L["blk"]+"2"+(" 块" if zh else "")),(L["blk"]+"3"+(" 块" if zh else "")),L["head"]]
        for i,k in enumerate(kinds[p]):
            yy=y+i*(bh+gap)
            fill,stroke={"new":(BF,BLUE),"newh":(BF,BLUE),"frozen":("#F1F5F9",SLATE),"ft":(GF,GREEN)}[k]
            o+=box(cx-bw/2,yy,bw,bh,fill,stroke,[names[i]])
            if k=="frozen": o+=lock(cx+bw/2-22,yy+bh/2-7,SLATE)
            if i<3: o+=line(cx,yy+bh,cx,yy+bh+gap,SLATE,1.4,"ah")
        yb=y+4*(bh+gap)-gap
        words=L["sub"][p]
        lines=textwrap.wrap(words,24) if not zh else ([words] if len(words)<=12 else words.split("，") if False else ([words] if len(words)<=12 else [words[:11],words[11:]]))
        for j,l in enumerate(lines): o+=T(cx,yb+22+j*15,l,12,fill=SLATE)
        o+=T(cx,H-96,accs[p],22,weight="700")
        o+=T(cx,H-78,L["acc"],12,fill=SLATE)
    ly=H-34
    items=[(BF,BLUE,L["leg"][0]),("#F1F5F9",SLATE,L["leg"][1]),(GF,GREEN,L["leg"][2])]
    wd=[135,160,260] if not zh else [130,120,230]
    lx=(W-sum(wd))/2
    for (f,s,t),w in zip(items,wd):
        o+=f'<rect x="{lx}" y="{ly-11}" width="16" height="14" rx="3" fill="{f}" stroke="{s}" stroke-width="1.5"/>\n'
        o+=T(lx+22,ly,t,12,"start",SLATE)
        lx+=w
    o+=T(W/2,H-8,L["foot"],12,fill=SLATE)
    return o+'</svg>\n'

GEN={"fig-03-14":fig14,"fig-03-15":fig15,"fig-03-18":fig18,"fig-03-20":fig20,"fig-03-24":fig24}
if __name__=="__main__":
    lang=sys.argv[1] if len(sys.argv)>1 else "en"
    root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out=os.path.join(os.path.dirname(root),lang)
    os.makedirs(out,exist_ok=True)
    for k,f in GEN.items():
        open(os.path.join(out,k+".svg"),"w",encoding="utf-8").write(f(lang=="zh"))
        print("wrote",k,lang)
