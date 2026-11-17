"""Figures of Module 1."""
from figlib import *  # noqa: F401,F403


def fig_01_1(L):
    T = {'en': dict(title='Validation and verification', req='Requirement', reqk='informal, in words',
                    reqt=['“Sort the list of', 'scores before', 'printing it.”'],
                    spec='Specification', speck='formal, in logic', imp='Implementation', impk='a program',
                    formalise='formalise', implement='implement', val='Validation', valq=['Does the specification say', 'what we really want?'],
                    valm='review, examples, testing', ver='Verification', verq=['Does the program do what', 'the specification says?'],
                    verm='proof, under stated assumptions'),
         'zh': dict(title='确认与验证', req='需求', reqk='非形式化，用自然语言',
                    reqt=['“打印成绩之前', '先把成绩列表', '排好序。”'],
                    spec='规约', speck='形式化，用逻辑', imp='实现', impk='一段程序',
                    formalise='形式化', implement='实现', val='确认（validation）', valq=['规约说的是否正是', '我们真正想要的？'],
                    valm='评审、举例、测试', ver='验证（verification）', verq=['程序做的是否正是', '规约所说的？'],
                    verm='证明，覆盖所有输入')}[L]
    s = SVG(760, 330, T['title'])
    boxes = [(20, T['req'], T['reqk'], C['amber'], C['amberp']), (280, T['spec'], T['speck'], C['blue'], C['skyp']),
             (540, T['imp'], T['impk'], C['green'], C['greenp'])]
    for x, t, k, col, bg in boxes:
        s.rect(x, 20, 200, 150, fill=bg, stroke=col, r=12, sw=1.8)
        s.text(x + 100, 48, t, size=15, weight=700, fill=col, anchor='middle')
        s.text(x + 100, 67, k, size=11.5, fill=C['slate'], anchor='middle', italic=True)
    s.lines(120, 98, T['reqt'], size=13, anchor='middle', fill=C['navy'])
    s.lines(380, 104, ['sorted ys', '∧ mset ys = mset xs'], size=13, anchor='middle', mono=True, gap=24)
    s.lines(640, 104, ['fun insort …', 'fun isort …'], size=13, anchor='middle', mono=True, gap=24)
    s.line(224, 112, 274, 112, stroke=C['slate'], sw=2, arrow=True)
    s.text(250, 102, T['formalise'], size=11, fill=C['slate'], anchor='middle', weight=600)
    s.line(484, 112, 534, 112, stroke=C['slate'], sw=2, arrow=True)
    s.text(510, 102, T['implement'], size=11, fill=C['slate'], anchor='middle', weight=600)
    # brackets
    for x1, x2, y, col, t, q, m in ((120, 380, 196, C['amber'], T['val'], T['valq'], T['valm']),
                                     (380, 640, 196, C['green'], T['ver'], T['verq'], T['verm'])):
        s.path(f'M{x1} {y - 12} V{y} H{x2} V{y - 12}', stroke=col, sw=2)
        mid = (x1 + x2) / 2
        s.text(mid, y + 26, t, size=14, weight=700, fill=col, anchor='middle')
        s.lines(mid, y + 48, q, size=12.5, anchor='middle', fill=C['navy'])
        s.text(mid, y + 96, m, size=11.5, anchor='middle', fill=C['slate'], italic=True)
    return s


def fig_01_2(L):
    T = {'en': dict(title='The LCF architecture of Isabelle', th='Your theories', thk='definitions, lemmas, proofs',
                    tools='Proof tools', toolk='simp, auto, blast, Sledgehammer, …', toolk2='large; may contain bugs',
                    kernel='Kernel', kernelk='the rules of the logic', kernelk2='small; checked with care',
                    n1=['Only the kernel can', 'make a theorem.'], n2=['Tools propose proof steps;', 'the kernel checks', 'every one.'],
                    n3=['With sound assumptions,', 'proof-search bugs cannot', 'turn a false claim into', 'a proved theorem.'], thm='theorem'),
         'zh': dict(title='Isabelle 的 LCF 架构', th='你的理论', thk='定义、引理、证明',
                    tools='证明工具', toolk='simp、auto、blast、Sledgehammer……', toolk2='规模大，可能有错误',
                    kernel='内核', kernelk='逻辑的推理规则', kernelk2='规模小，经过仔细检查',
                    n1=['只有内核能够', '产生定理。'], n2=['工具提出证明步骤，', '内核逐一检查。'],
                    n3=['工具中的错误可能让', '证明失败，但不能把', '错误的命题变成定理。'], thm='定理')}[L]
    s = SVG(760, 360, T['title'])
    s.rect(20, 20, 470, 320, fill=C['bg'], stroke=C['border'], r=16, sw=1.6)
    s.text(42, 50, T['th'], size=15, weight=700, fill=C['slate'])
    s.text(42, 70, T['thk'], size=12, fill=C['slate'], italic=True)
    s.rect(50, 90, 410, 230, fill=C['purplep'], stroke=C['purple'], r=14, sw=1.6, dash='6 5')
    s.text(72, 118, T['tools'], size=15, weight=700, fill=C['purple'])
    s.text(72, 138, T['toolk'], size=12, fill=C['purple'])
    s.text(72, 156, T['toolk2'], size=12, fill=C['purple'], italic=True)
    s.rect(150, 180, 210, 116, fill=C['greenp'], stroke=C['green'], r=12, sw=2.6)
    s.text(255, 212, T['kernel'], size=16, weight=700, fill=C['green'], anchor='middle')
    s.text(255, 234, T['kernelk'], size=12, fill=C['green'], anchor='middle')
    s.text(255, 252, T['kernelk2'], size=12, fill=C['green'], anchor='middle', italic=True)
    s.pill(255, 282, '⊢ ' + T['thm'], kind='branch', size=12)
    # notes on the right
    for i, (rows, col) in enumerate(((T['n1'], C['green']), (T['n2'], C['purple']), (T['n3'], C['navy']))):
        y = 60 + i * 96
        s.circle(528, y - 5, 12, fill=col, stroke=col, sw=1)
        s.text(528, y, str(i + 1), size=12, weight=700, fill=C['white'], anchor='middle')
        s.lines(550, y, rows, size=13, fill=col, weight=600 if i == 0 else 400)
    return s


FIGURES = {'fig-01-1': fig_01_1, 'fig-01-2': fig_01_2}
