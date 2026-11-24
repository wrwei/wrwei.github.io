"""Figures of Module 3."""
from figlib import *  # noqa: F401,F403


def fig_03_1(L):
    """Scopes and binding in ∀x. P x ⟶ (∃y. R x y) ∧ Q y."""
    T = {'en': dict(title='Scope and binding in a formula', sx='scope of ∀x', sy='scope of ∃y',
                    free=['free: outside', 'the scope of ∃y'], lx='bound by ∀x', ly='bound by ∃y', lf='free'),
         'zh': dict(title='公式中的辖域与约束', sx='∀x 的辖域', sy='∃y 的辖域',
                    free=['自由出现：', '在 ∃y 的辖域之外'], lx='由 ∀x 约束', ly='由 ∃y 约束', lf='自由')}[L]
    s = SVG(760, 250, T['title'])
    f = '∀x. P x ⟶ (∃y. R x y) ∧ Q y'
    cw, x0, base = 16, 143, 128

    def cx(i):          # the long arrow ⟶ (cell 8) is wider than one cell: give it room
        return x0 + cw * i + (7 if i == 8 else 14 if i > 8 else 0)

    blue, green, red = C['blue'], C['green'], C['red']
    # scopes as shaded boxes behind the text
    s.rect(cx(4) - 11, 99, cx(26) - cx(4) + 30, 40, fill=C['skyp'], stroke=blue, r=8, sw=1.4)
    s.rect(cx(15) - 9, 103, cx(19) - cx(15) + 18, 32, fill=C['greenp'], stroke=green, r=6, sw=1.4)
    s.text(cx(26) + 19, 90, T['sx'], size=12.5, fill=blue, weight=600, anchor='end')
    # the formula, one character per cell
    colour = {0: blue, 1: blue, 6: blue, 17: blue, 11: green, 12: green, 19: green, 26: red}
    for i, ch in enumerate(f):
        if ch != ' ':
            s.text(cx(i), base, ch, size=26, mono=True, anchor='middle', fill=colour.get(i, C['navy']),
                   weight=700 if i in colour else 400)
    # bound occurrences point to their quantifier: x above the text, y below it
    for i, h in ((6, 22), (17, 50)):
        a, b = cx(i), cx(1)
        s.path(f'M{a} 96 Q{(a + b) / 2} {96 - 2 * h} {b + 2} 99', stroke=blue, sw=1.8, arrow=True)
    a, b = cx(19), cx(12)
    s.path(f'M{a} 142 Q{(a + b) / 2} {142 + 2 * 20} {b + 1} 141', stroke=green, sw=1.8, arrow=True)
    s.text((cx(15) + cx(19)) / 2, 186, T['sy'], size=12.5, fill=green, weight=600, anchor='middle')
    # the free occurrence
    s.circle(cx(26), base - 8, 15, fill='none', stroke=red, sw=2)
    s.lines(cx(26) + 30, 116, T['free'], size=12.5, fill=red, weight=600, gap=17)
    # legend
    y = 228
    s.line(150, y - 4, 182, y - 4, stroke=blue, sw=2, arrow=True)
    s.text(190, y, T['lx'], size=12.5, fill=C['slate'])
    s.line(330, y - 4, 362, y - 4, stroke=green, sw=2, arrow=True)
    s.text(370, y, T['ly'], size=12.5, fill=C['slate'])
    s.circle(522, y - 5, 9, fill='none', stroke=red, sw=2)
    s.text(538, y, T['lf'], size=12.5, fill=C['slate'])
    return s


def fig_03_2(L):
    """The structure M1: three elements, P, Q and the relation R as arrows."""
    T = {'en': dict(title='The structure M₁', lp='P holds', lq='Q holds', lr='R x y holds', dom='domain D'),
         'zh': dict(title='结构 M₁', lp='P 成立', lq='Q 成立', lr='R x y 成立', dom='论域 D')}[L]
    s = SVG(760, 290, T['title'])
    r = 27
    pos = {'a': (95, 190), 'b': (225, 95), 'c': (345, 190)}
    s.rect(20, 20, 420, 250, fill=C['bg'], stroke=C['border'], r=16, sw=1.4)
    s.text(38, 46, T['dom'], size=13, fill=C['slate'], weight=600)

    def edge(p, q):
        (x1, y1), (x2, y2) = pos[p], pos[q]
        d = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
        ux, uy = (x2 - x1) / d, (y2 - y1) / d
        s.line(x1 + ux * (r + 3), y1 + uy * (r + 3), x2 - ux * (r + 7), y2 - uy * (r + 7), stroke=C['navy'], sw=2.2, arrow=True)

    edge('a', 'b')
    edge('b', 'c')
    cx_, cy_ = pos['c']
    s.path(f'M{cx_ + 20} {cy_ - 19} C{cx_ + 90} {cy_ - 65} {cx_ + 90} {cy_ + 65} {cx_ + 24} {cy_ + 17}',
           stroke=C['navy'], sw=2.2, arrow=True)
    for n, (x, y) in pos.items():
        s.circle(x, y, r, fill=C['white'], stroke=C['navy'], sw=2.4)
        s.text(x, y + 7, n, size=20, mono=True, anchor='middle', weight=700)
    # P and Q as labels next to the elements
    s.pill(95, 247, 'P', kind='head', size=13)
    s.pill(204, 49, 'P', kind='head', size=13)
    s.pill(246, 49, 'Q', kind='branch', size=13)
    # the structure written out, and the legend
    rows = ['D = {a, b, c}', 'P = {a, b}', 'Q = {b}', 'R = {(a, b), (b, c), (c, c)}']
    s.lines(468, 66, rows, size=14.5, mono=True, gap=30)
    y = 206
    s.pill(484, y, 'P', kind='head', size=13)
    s.text(512, y, T['lp'], size=12.5, fill=C['slate'])
    s.pill(484, y + 30, 'Q', kind='branch', size=13)
    s.text(512, y + 30, T['lq'], size=12.5, fill=C['slate'])
    s.text(472, y + 60, 'x', size=13, mono=True, fill=C['slate'], anchor='middle')
    s.line(481, y + 56, 512, y + 56, stroke=C['navy'], sw=2.2, arrow=True)
    s.text(522, y + 60, 'y', size=13, mono=True, fill=C['slate'], anchor='middle')
    s.text(538, y + 60, T['lr'], size=12.5, fill=C['slate'])
    return s


def fig_03_3(L):
    """What proof search and countermodel search can settle."""
    T = {'en': dict(title='What proof search and countermodel search can settle',
                    ps=['systematic proof search', '(enumerating all proofs)'], cs=['finite-model search', '(enumerating structures)'],
                    ns=['neither exhaustive', 'search settles it'],
                    t1=['Valid'], b1=['A proof exists', '(Gödel, 1929/30).', 'Exhaustive proof search', 'eventually finds one.'],
                    t2=['Not valid,', 'finite countermodel'], b2=['Searching finite structures', 'finds a countermodel', 'in the end.'],
                    t3=['Not valid, only', 'infinite countermodels'], b3=['No first-order proof,', 'and no finite countermodel.'],
                    e3=['R irreflexive, transitive', '⟶ ¬ (∀x. ∃y. R x y)'],
                    eg='for example', foot='No algorithm decides, for every formula, which box it belongs to (Church, Turing, 1936).'),
         'zh': dict(title='证明搜索与反模型搜索能解决什么',
                    ps=['系统的证明搜索', '（枚举所有证明）'], cs=['有限模型搜索', '（枚举有限结构）'],
                    ns=['两种穷尽式搜索', '都无法判定这一类'],
                    t1=['有效'], b1=['存在证明（哥德尔，1929/30）。', '穷尽式证明搜索', '终会找到一个证明。'],
                    t2=['无效，', '存在有限反模型'], b2=['搜索有限结构', '终将找到反模型。'],
                    t3=['无效，', '只有无限反模型'], b3=['没有一阶逻辑证明，', '也没有有限反模型。'],
                    e3=['R 反自反且传递', '⟶ ¬ (∀x. ∃y. R x y)'],
                    eg='例如', foot='没有算法能对每个公式都判定它属于哪一栏（丘奇、图灵，1936）。')}[L]
    s = SVG(760, 336, T['title'])
    cols = [(20, C['green'], C['greenp'], T['ps'], T['t1'], T['b1'], ['(∃y. ∀x. R x y) ⟶', '(∀x. ∃y. R x y)']),
            (265, C['amber'], C['amberp'], T['cs'], T['t2'], T['b2'], ['(∀x. ∃y. R x y) ⟶', '(∃y. ∀x. R x y)']),
            (510, C['red'], C['redp'], T['ns'], T['t3'], T['b3'], T['e3'])]
    w = 230
    for x, col, bg, top, title, body, ex in cols:
        s.text(x + w / 2, 30, top[0], size=13.5, fill=col, weight=700, anchor='middle')
        s.text(x + w / 2, 49, top[1], size=12, fill=col, anchor='middle')
        s.line(x + w / 2, 58, x + w / 2, 88, stroke=col, sw=2, arrow=True, dash='5 4' if col == C['red'] else None)
        s.rect(x, 96, w, 196, fill=bg, stroke=col, r=12, sw=1.8)
        s.lines(x + 16, 124, title, size=14.5, fill=col, weight=700, gap=20)
        y = 124 + 20 * len(title) + 8
        s.lines(x + 16, y, body, size=12.5, fill=C['navy'], gap=18)
        s.text(x + 16, 236, T['eg'], size=11.5, fill=C['slate'], italic=True)
        s.lines(x + 16, 256, ex, size=12, mono=True, fill=C['slate'], gap=18)
    s.text(380, 320, T['foot'], size=12.5, fill=C['slate'], anchor='middle', italic=True)
    return s


FIGURES = {'fig-03-1': fig_03_1, 'fig-03-2': fig_03_2, 'fig-03-3': fig_03_3}
