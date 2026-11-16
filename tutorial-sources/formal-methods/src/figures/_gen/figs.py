"""Draw the Formal Methods series' figures in English and Chinese.

    python3 -I src/figures/_gen/figs.py            all figures, both languages
    python3 -I src/figures/_gen/figs.py fig-05-2   one figure

Writes src/figures/<lang>/<id>.svg. One style for all figures: the series' colours, DM Sans
(with CJK fallbacks) for text, and Isabelle's own font for formulas and Isabelle text, so that
figures, pages and Isabelle/jEdit show the same symbols.
"""
import os
import re
import sys
from html import escape

HERE = os.path.dirname(os.path.abspath(__file__))
FIGS = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(FIGS))

C = dict(navy='#1A2E4A', blue='#2563EB', sky='#0EA5E9', skyl='#DBEAFE', skyp='#F0F9FF', slate='#475569',
         muted='#94A3B8', border='#CBD5E1', bg='#F8FAFC', white='#FFFFFF', green='#15803D', greenl='#DCFCE7',
         greenp='#F0FDF4', orange='#C2410C', orangep='#FFF7ED', red='#DC2626', redl='#FEE2E2', redp='#FEF2F2',
         amber='#B45309', amberp='#FFFBEB', purple='#6D28D9', purplep='#F5F3FF', indigo='#4338CA', indigop='#EEF2FF',
         term='#111827', termtext='#E5E7EB')
SANS = "'DM Sans', system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif"
MONO = "'Isabelle DejaVu Sans Mono', 'DejaVu Sans Mono', Consolas, Menlo, 'PingFang SC', 'Microsoft YaHei', monospace"


# ---------------------------------------------------------------- primitives

class SVG:
    def __init__(self, w, h, title):
        self.w, self.h, self.title = w, h, title
        self.items = []

    def add(self, s):
        self.items.append(s)

    def rect(self, x, y, w, h, fill=C['white'], stroke=C['border'], r=10, sw=1.5, dash=None, extra=''):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}{extra}/>')

    def text(self, x, y, s, size=13, fill=C['navy'], weight=400, anchor='start', mono=False, italic=False, extra=''):
        fam = MONO if mono else SANS
        it = ' font-style="italic"' if italic else ''
        self.add(f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{it}{extra}>{escape(s)}</text>')

    def lines(self, x, y, rows, size=13, gap=None, **kw):
        gap = gap or round(size * 1.45)
        for i, r in enumerate(rows):
            self.text(x, y + i * gap, r, size=size, **kw)

    def line(self, x1, y1, x2, y2, stroke=C['slate'], sw=2, dash=None, arrow=False, color=None):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        m = f' marker-end="url(#ah-{(color or stroke).lstrip("#")})"' if arrow else ''
        self.add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"{d}{m}/>')

    def path(self, d, stroke=C['slate'], sw=2, fill='none', dash=None, arrow=False):
        da = f' stroke-dasharray="{dash}"' if dash else ''
        m = f' marker-end="url(#ah-{stroke.lstrip("#")})"' if arrow else ''
        self.add(f'<path d="{d}" stroke="{stroke}" stroke-width="{sw}" fill="{fill}"{da}{m}/>')

    def circle(self, x, y, r=11, fill=C['white'], stroke=C['navy'], sw=2.5):
        self.add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def pill(self, x, y, s, kind='branch', size=12, anchor='middle'):
        """A label like Git's: branch (green), head (blue), remote (red), plain (grey)."""
        fill, stroke, col = {'branch': (C['greenl'], C['green'], C['green']), 'head': (C['skyl'], C['blue'], C['blue']),
                             'remote': (C['redp'], C['red'], C['red']), 'plain': (C['bg'], C['border'], C['slate']),
                             'cmd': (C['term'], C['term'], C['termtext'])}[kind]
        w = max(34, round(len(s) * size * 0.62 + 16))
        x0 = x - w / 2 if anchor == 'middle' else x
        self.rect(x0, y - size - 4, w, size + 10, fill=fill, stroke=stroke, r=(size + 10) / 2, sw=1.4)
        self.text(x0 + w / 2, y + 1, s, size=size, fill=col, weight=600, anchor='middle', mono=True)
        return w

    def svg(self):
        colours = sorted({re.search(r'url\(#ah-([0-9A-Fa-f]+)\)', i).group(1) for i in self.items if 'url(#ah-' in i})
        marks = ''.join(f'<marker id="ah-{c}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#{c}"/></marker>' for c in colours)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" width="{self.w}" height="{self.h}" role="img">'
                f'<title>{escape(self.title)}</title><defs>{marks}</defs>' + ''.join(self.items) + '</svg>\n')


def arrow_label(s, x, y, rows, size=12, fill=C['slate'], weight=600):
    for i, r in enumerate(rows):
        s.text(x, y + i * round(size * 1.35), r, size=size, fill=fill, weight=weight, anchor='middle')


# ---------------------------------------------------------------- Module 1

def fig_01_1(L):
    T = {'en': dict(title='Validation and verification', req='Requirement', reqk='informal, in words',
                    reqt=['“Sort the list of', 'scores before', 'printing it.”'],
                    spec='Specification', speck='formal, in logic', imp='Implementation', impk='a program',
                    formalise='formalise', implement='implement', val='Validation', valq=['Does the specification say', 'what we really want?'],
                    valm='review, examples, testing', ver='Verification', verq=['Does the program do what', 'the specification says?'],
                    verm='proof, for every input'),
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
                    n3=['A bug in a tool can make', 'a proof fail. It cannot', 'make a false statement', 'a theorem.'], thm='theorem'),
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


FIGURES = {
    'fig-01-1': fig_01_1, 'fig-01-2': fig_01_2,
}

if __name__ == '__main__':
    want = sys.argv[1:] or list(FIGURES)
    for lang in ('en', 'zh'):
        os.makedirs(os.path.join(FIGS, lang), exist_ok=True)
        for fid in want:
            svg = FIGURES[fid](lang).svg()
            with open(os.path.join(FIGS, lang, fid + '.svg'), 'w', encoding='utf-8') as f:
                f.write(svg)
    print(f'wrote {len(want)} figure(s) in en and zh')
