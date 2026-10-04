"""Self-contained SVG mechanisms for Module 08. Usage: python ... en|zh."""
import html
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
assert LANG in ("en", "zh")
NAVY, BLUE, GREEN, ORANGE = "#1A2E4A", "#2563EB", "#15803D", "#C2410C"
BORDER, SLATE = "#E2E8F0", "#475569"

def t(en, zh):
    return zh if LANG == "zh" else en

class SVG:
    def __init__(self, height):
        self.parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="720" '
                      f'height="{height}" viewBox="0 0 720 {height}" '
                      'font-family="DM Sans, Microsoft YaHei, system-ui, sans-serif">',
                      '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" '
                      'refY="5" markerWidth="6" markerHeight="6" orient="auto">'
                      f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{SLATE}"/>'
                      '</marker></defs>']
    def text(self, x, y, value, size=14, colour=NAVY, anchor="middle"):
        self.parts.append(f'<text x="{x}" y="{y}" font-size="{size}" '
                          f'fill="{colour}" text-anchor="{anchor}">{html.escape(str(value))}</text>')
    def rect(self, x, y, w, height, fill="white", stroke=BORDER, rx=0):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{height}" '
                          f'fill="{fill}" stroke="{stroke}" rx="{rx}"/>')
    def box(self, x, y, w, height, lines, fill="#F0F9FF", stroke=BLUE):
        self.rect(x, y, w, height, fill, stroke, 7)
        for i, line in enumerate(lines):
            self.text(x+w/2, y+height/2-8*(len(lines)-1)+5+16*i, line, 13)
    def path(self, points, colour=SLATE, arrow=True):
        path = "M " + " L ".join(f"{x} {y}" for x, y in points)
        marker = ' marker-end="url(#arrow)"' if arrow else ''
        self.parts.append(f'<path d="{path}" fill="none" stroke="{colour}" '
                          f'stroke-width="1.8"{marker}/>')
    def save(self, number):
        self.parts.append('</svg>')
        (ROOT / f'src/figures/{LANG}/fig-08-{number}.svg').write_text(
            '\n'.join(self.parts), encoding='utf8')


s=SVG(450)
s.text(360,28,t('Pretraining: decisions before the long run','预训练：长程训练前的决策'),18)
stages=[('Sources','原始来源','§2'),('Extract','提取','§2'),('Language','语言','§2'),
        ('Filter','过滤','§2'),('Deduplicate','去重','§3'),('Decontaminate','去污染','§3'),
        ('Mixture','混合','§4'),('Tokenizer','分词器','§4'),('Packed shards','打包分片','§4'),
        ('Training loop','训练循环','§5–10'),('Checkpoint','检查点','§11'),
        ('Evaluate','评估','§12')]
for i,(en,zh,section) in enumerate(stages):
    row,col=divmod(i,4)
    if row%2:col=3-col
    x,y=22+176*col,60+103*row
    s.box(x,y,148,63,[t(en,zh),section])
    if i<11:
        nextrow,nextcol=divmod(i+1,4)
        if nextrow%2:nextcol=3-nextcol
        nx,ny=22+176*nextcol,60+103*nextrow
        if row==nextrow:
            start=x+148 if nx>x else x
            end=nx if nx>x else nx+148
            s.path([(start,y+31),(end,ny+31)])
        else:s.path([(x+74,y+63),(nx+74,ny)])
s.box(280,374,160,45,[t('Base model','基座模型')],stroke=GREEN)
s.path([(624,329),(624,397),(440,397)],GREEN)
s.text(360,352,t('Short-run evaluation informs the data and recipe before launch.',
                  '启动长程训练前，先用短程评估调整数据与方案。'),13,SLATE)
s.save(1)

s=SVG(402)
s.text(360,27,t('Filtering funnel: schematic, no measured retention counts',
                '过滤漏斗：示意图，不表示实测保留数量'),17)
stages=[('URL policy','网址策略','Disallowed source','不允许的来源'),
        ('Text extraction','文本提取','Cookie banner','Cookie 横幅'),
        ('Language ID','语言识别','Non-target language','非目标语言'),
        ('Heuristics','启发式规则','Keyword spam','关键词垃圾'),
        ('Deduplication','去重','Repeated article','重复文章'),
        ('Quality classifier','质量分类器','Low-quality prose','低质量散文')]
for i,(en,zh,reason,reasonzh) in enumerate(stages):
    width=350-35*i
    s.box(20+(350-width)/2,52+46*i,width,34,[t(en,zh)],stroke=BLUE)
    s.text(440,74+46*i,t(reason,reasonzh),13,anchor='start')
s.text(360,356,t('Published dataset sizes: FineWeb ≈15T; FineWeb-Edu ≈1.3T tokens',
                  '已发表数据集规模：FineWeb 约 15T；FineWeb-Edu 约 1.3T token '),13)
s.text(360,382,t('Bar widths illustrate the mechanism; they are not ablation results.',
                  '条宽仅示意机制，并非消融实验结果。'),13,SLATE)
s.save(3)

s=SVG(354)
s.text(360,27,t('MinHash: signatures propose, exact overlap verifies',
                'MinHash：签名提出候选，精确重叠验证'),17)
s.box(20,55,190,52,[t('Document A → shingle set A','文档 A → 片段集合 A')])
s.box(20,123,190,52,[t('Document B → shingle set B','文档 B → 片段集合 B')])
s.text(114,204,'J = |A ∩ B| / |A ∪ B|',14)
for row in range(2):
    y=72+68*row
    for band in range(16):
        for cell in range(8):
            fill='#DCFCE7' if band in (3,11) else ('#DBEAFE' if row==0 else '#FFEDD5')
            s.rect(262+band*24,y+cell*5,18,4,fill,'white')
    s.path([(210,81+68*row),(252,81+68*row)])
s.text(455,204,t('128 rows → 16 bands × 8 rows','128 行 → 16 带 × 8 行'),14)
s.box(260,228,395,46,[t('At least one whole band agrees → candidate pair',
                      '至少一个完整带一致 → 候选文档对')],stroke=GREEN)
s.path([(655,176),(676,176),(676,251),(655,251)],GREEN)
s.box(260,295,395,38,[t('Verify using the actual word-tuple Jaccard',
                      '用实际 shingle 集合的 Jaccard 相似度验证')],stroke=ORANGE)
s.path([(455,274),(455,295)])
s.text(118,288,t('Schematic agreement','一致性示意'),13,SLATE)
s.text(118,307,t('not measured signatures','并非实测签名'),13,SLATE)
s.save(4)

s=SVG(395)
s.text(360,26,t('Pack documents; choose the attention boundary policy',
                '打包文档；选择注意力边界策略'),17)
colours=['#DBEAFE','#DCFCE7','#FFEDD5','#EDE9FE','#FCE7F3']
docs=[5,3,7,2,7]
stream=[document for document,length in enumerate(docs) for _ in range(length)]
for i,document in enumerate(stream):
    row,col=divmod(i,12)
    x,y=37+26*col,56+36*row
    s.rect(x,y,25,26,colours[document])
    if i==len(stream)-1 or stream[i+1]!=document:s.text(x+12,y+18,'E',12)
s.text(194,148,t('Fixed rows of 12 tokens; E = EOS','固定 12 token 一行；E = EOS'),13)
groups=[0]*5+[1]*3+[2]*4
for which,label in enumerate([t('Causal, cross-document','因果，跨文档'),
                              t('Causal, within document','因果，文档内')]):
    xbase=28+which*350
    s.text(xbase+160,192,label,14)
    for query in range(12):
        for key in range(12):
            allowed=key<=query and (which==0 or groups[query]==groups[key])
            s.rect(xbase+58+17*key,210+12*query,16,11,
                   '#DBEAFE' if allowed else '#F1F5F9','white')
s.text(360,380,t('EOS marks a boundary; only the mask prevents cross-document attention.',
                  'EOS 标记边界；只有掩码能阻止跨文档注意力。'),13,SLATE)
s.save(6)

s=SVG(575)
s.text(360,26,t('Case-study decoder: shapes and matrix weights','案例解码器：张量形状与矩阵权重'),17)
s.box(220,48,280,40,['V = 152,064; d = 4,096',t('Embedding: 622.9M','嵌入：622.9M')])
s.path([(360,88),(360,115)])
s.box(75,115,570,95,[t('RMSNorm → attention','RMSNorm → 注意力'),
                    'Q: (1, 32, 8192, 128)',
                    'K,V: (1, 8, 8192, 128)',
                    t('Q / O: 16.8M each; K / V: 4.2M each',
                      'Q / O：各 16.8M；K / V：各 4.2M')])
s.path([(360,210),(360,244)])
s.path([(360,105),(670,105),(670,227),(360,227)])
s.text(482,223,t('Add residual','加残差'),11,SLATE)
s.box(75,244,570,95,[t('RMSNorm → SwiGLU','RMSNorm → SwiGLU'),
                     '(1, 8192, 15360)',
                     t('gate / up / down','门 / 上投影 / 下投影'),
                     t('62.9M each','各 62.9M')])
s.path([(360,339),(360,370)])
s.path([(360,239),(695,239),(695,354),(360,354)])
s.text(482,351,t('Add residual','加残差'),11,SLATE)
s.box(130,370,460,57,[t('Residual stream: (1, 8192, 4096)','残差流：(1, 8192, 4096)'),
                     t('Pre-norm + residuals; block repeated ×36','前置归一化 + 残差；模块重复 ×36')])
s.box(220,464,280,49,[t('Final RMSNorm + untied head','最终 RMSNorm + 独立输出头'),
                     t('Head: 622.9M','输出头：622.9M')])
s.path([(360,427),(360,464)])
s.text(360,549,t('Total: 9,550,729,216 parameters; no biases','总计：9,550,729,216 个参数；无偏置'),14)
s.save(7)

s=SVG(425)
s.text(360,26,t('Expert parallelism: top-2 routing to 8 experts','专家并行：向 8 个专家进行 top-2 路由'),17)
for i in range(4):
    x=20+176*i
    s.box(x,54,152,48,[f'GPU {i}',t('Local tokens','本地 token ')])
    s.box(x,190,152,55,[f'GPU {i}',f'E{2*i} + E{2*i+1}'],stroke=GREEN)
    s.path([(x+76,102),(x+76,125)])
    s.path([(x+76,167),(x+76,190)])
    s.path([(x+76,245),(x+76,273)])
s.box(20,125,680,42,[t('Dispatch all-to-all: each token → two expert owners',
                      '分发 all-to-all：每个 token → 两个专家所在 GPU')])
s.box(20,273,680,42,[t('Combine all-to-all: weighted outputs → token owner',
                      '合并 all-to-all：加权输出 → token 原属 GPU')])
s.box(22,342,312,42,[t('One expert: capacity 2,560 assignments',
                      '单个专家：容量 2,560 次分配')],stroke=GREEN)
s.box(386,342,312,42,[t('Overflow assignment → omit this expert',
                       '溢出分配 → 省略此专家输出')],stroke=ORANGE)
s.path([(334,363),(386,363)],ORANGE)
s.text(360,410,t('Capacity example: 8,192 tokens in the whole routing group',
                  '容量示例：整个路由组中共有 8,192 个 token '),13,SLATE)
s.save(8)

s=SVG(448)
s.text(360,25,t('Ring all-reduce: four GPUs, four equal chunks','环形 all-reduce：四 GPU、四等长块'),17)
for rank in range(4):
    x=48+170*rank
    s.box(x,50,115,38,[f'GPU {rank}'])
    if rank<3:s.path([(x+115,69),(x+170,69)])
s.path([(673,69),(700,69),(700,104),(25,104),(25,69),(48,69)])
s.text(360,137,t('Reduce-scatter: received chunk and contributing ranks after each step',
                  'reduce-scatter：每步接收的块及其贡献 GPU'),13)
for rank in range(4):s.text(134+165*rank,161,f'GPU {rank}',13)
for step in range(3):
    s.text(20,194+30*step,str(step+1),13,anchor='start')
    for rank in range(4):
        chunk=(rank-step-1)%4
        sources=sorted({(rank-offset)%4 for offset in range(step+2)})
        s.text(134+165*rank,194+30*step,f'c{chunk}: '+','.join(map(str,sources)),12)
s.text(360,287,t('All-gather: known fully summed chunks after each step',
                  'all-gather：每步已知的完整求和块'),13)
for step in range(3):
    s.text(20,320+30*step,str(step+1),13,anchor='start')
    for rank in range(4):
        chunks=sorted({(rank+1-offset)%4 for offset in range(step+2)})
        s.text(134+165*rank,320+30*step,','.join(f'c{c}' for c in chunks),12)
s.text(360,421,t('Each GPU sends 6 × S/4 = 1.5S bytes; latency and topology are omitted.',
                  '每 GPU 发送 6 × S/4 = 1.5S 字节；省略延迟与拓扑影响。'),13,SLATE)
s.save(14)
