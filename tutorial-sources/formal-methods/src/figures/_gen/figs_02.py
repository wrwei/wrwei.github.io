"""Figures of Module 2."""
from figlib import *  # noqa: F401,F403


def _badge(s, x, y, val):
    """A small T/F mark: green T, red F."""
    col, bg = (C['green'], C['greenl']) if val else (C['red'], C['redl'])
    s.circle(x, y, 10, fill=bg, stroke=col, sw=1.6)
    s.text(x, y + 4, 'T' if val else 'F', size=11.5, weight=700, fill=col, anchor='middle')


def fig_02_1(L):
    T = {'en': dict(title='Parse tree of a requirement', main='main connective', sit='One situation',
                    res='Value of the formula', broken='requirement broken',
                    how=['Work from the leaves up:', 'each connective combines', 'the values of its children.'],
                    conn='connective', atom='atom'),
         'zh': dict(title='一条需求的语法树', main='主联结词', sit='某一种情形',
                    res='公式的值', broken='需求被违反',
                    how=['从叶子往上计算：', '每个联结词合并', '其子结点的值。'],
                    conn='联结词', atom='原子')}[L]
    s = SVG(760, 340, T['title'])
    # nodes: name -> (x, y, label, is_connective, value)
    N = {'imp': (262, 62, '⟶', True, False), 'opens': (112, 150, 'opens', False, True),
         'or': (372, 150, '∨', True, False), 'and': (282, 235, '∧', True, False),
         'fire': (462, 235, 'fire', False, False), 'badge': (207, 315, 'badge', False, True),
         'pin': (357, 315, 'pin', False, False)}
    for a, b in (('imp', 'opens'), ('imp', 'or'), ('or', 'and'), ('or', 'fire'), ('and', 'badge'), ('and', 'pin')):
        s.line(N[a][0], N[a][1], N[b][0], N[b][1], stroke=C['muted'], sw=2)
    for key, (x, y, lab, conn, val) in N.items():
        if conn:
            s.circle(x, y, 19, fill=C['skyp'], stroke=C['blue'], sw=2)
            s.text(x, y + 6, lab, size=17, weight=700, fill=C['navy'], anchor='middle', mono=True)
            _badge(s, x + 20, y - 17, val)
        else:
            w = round(len(lab) * 8.2 + 22)
            s.rect(x - w / 2, y - 15, w, 30, fill=C['white'], stroke=C['navy'], r=8, sw=1.6)
            s.text(x, y + 5, lab, size=13.5, fill=C['navy'], anchor='middle', mono=True)
            _badge(s, x + w / 2 + 2, y - 15, val)
    # sub-formula labels
    s.text(262, 28, 'opens ⟶ badge ∧ pin ∨ fire', size=13, fill=C['slate'], anchor='middle', mono=True)
    s.text(404, 160, 'badge ∧ pin ∨ fire', size=12.5, fill=C['slate'], mono=True)
    s.text(252, 240, 'badge ∧ pin', size=12.5, fill=C['slate'], anchor='end', mono=True)
    s.text(224, 70, T['main'], size=11.5, fill=C['blue'], anchor='end', italic=True)
    # the situation
    s.rect(556, 20, 190, 300, fill=C['bg'], stroke=C['border'], r=12, sw=1.4)
    s.text(578, 46, T['sit'], size=13.5, weight=700, fill=C['navy'])
    for i, (a, v) in enumerate((('opens', True), ('badge', True), ('pin', False), ('fire', False))):
        y = 76 + i * 27
        s.text(580, y, a + ' =', size=13, fill=C['navy'], mono=True)
        _badge(s, 668, y - 4, v)
    s.line(578, 184, 728, 184, stroke=C['border'], sw=1.2)
    s.text(578, 208, T['res'], size=12.5, weight=600, fill=C['navy'])
    _badge(s, 590, 232, False)
    s.text(608, 236, T['broken'], size=12, fill=C['red'], italic=True)
    s.lines(578, 268, T['how'], size=11.5, fill=C['slate'], gap=16)
    return s


def fig_02_2(L):
    T = {'en': dict(title='Tautologies, contingent formulas and contradictions', all='All formulas',
                    sat='Satisfiable', satk='true in at least one row', taut='Tautologies', tautk='true in every row',
                    cont='Contingent', contk=['true in some rows,', 'false in others'],
                    contra='Contradictions', contrak='true in no row (unsatisfiable)',
                    neg='¬ swaps these two classes', negc='¬ keeps a contingent formula contingent'),
         'zh': dict(title='重言式、可满足但非有效的公式与矛盾式', all='所有公式',
                    sat='可满足的公式', satk='至少在一行中为真', taut='重言式', tautk='每一行都为真',
                    cont='可满足但非有效', contk=['有的行为真，', '有的行为假'],
                    contra='矛盾式', contrak='没有一行为真（不可满足）',
                    neg='¬ 使这两类互换', negc='¬ 作用于这类公式，结果仍属这一类')}[L]
    s = SVG(760, 352, T['title'])
    s.rect(14, 14, 732, 324, fill=C['bg'], stroke=C['border'], r=16, sw=1.5)
    s.text(32, 40, T['all'], size=14, weight=700, fill=C['slate'])
    # satisfiable region with tautologies inside
    s.rect(34, 56, 468, 216, fill=C['skyp'], stroke=C['blue'], r=14, sw=1.8)
    s.text(52, 80, T['sat'], size=14, weight=700, fill=C['blue'])
    s.text(52 + len(T['sat']) * (8.6 if L == 'en' else 15) + 10, 80, T['satk'], size=12, fill=C['blue'], italic=True)
    s.rect(52, 96, 200, 160, fill=C['greenp'], stroke=C['green'], r=12, sw=1.8)
    s.text(68, 120, T['taut'], size=14, weight=700, fill=C['green'])
    s.text(68, 138, T['tautk'], size=12, fill=C['green'], italic=True)
    s.lines(68, 170, ['A ∨ ¬A', 'A ⟶ A', '((A ⟶ B) ⟶ A) ⟶ A'], size=12.5, mono=True, gap=24)
    s.text(272, 120, T['cont'], size=14, weight=700, fill=C['navy'])
    s.lines(272, 138, T['contk'], size=12, fill=C['slate'], italic=True, gap=16)
    s.lines(272, 186, ['A ⟶ B', 'A ∧ B', 'opens ⟶ badge ∧ pin ∨ fire'], size=12.5, mono=True, gap=23)
    # contradictions
    s.rect(522, 56, 206, 216, fill=C['redp'], stroke=C['red'], r=14, sw=1.8)
    s.text(538, 80, T['contra'], size=14, weight=700, fill=C['red'])
    rows = [T['contrak']] if L == 'zh' else ['true in no row', '(unsatisfiable)']
    s.lines(538, 98, rows, size=12, fill=C['red'], italic=True, gap=16)
    s.lines(538, 170, ['A ∧ ¬A', 'False', '(A ⟶ B) ∧ A ∧ ¬B'], size=12.5, mono=True, gap=24)
    # negation arrows
    s.path('M 400 306 H 152 V 260', stroke=C['purple'], sw=2, arrow=True)
    s.path('M 400 306 H 625 V 276', stroke=C['purple'], sw=2, arrow=True)
    s.circle(400, 306, 15, fill=C['purplep'], stroke=C['purple'], sw=1.8)
    s.text(400, 312, '¬', size=16, weight=700, fill=C['purple'], anchor='middle', mono=True)
    s.text(424, 326, T['neg'], size=12, fill=C['purple'], weight=600)
    s.text(272, 261, T['negc'], size=11.5, fill=C['purple'], italic=True)
    return s


def fig_02_3(L):
    T = {'en': dict(title='From a formula to CNF and DNF', start='Any formula', s1='1. Remove ⟷ and ⟶',
                    s2='2. Push ¬ inwards', s3a='3a. Distribute ∨ over ∧', s3b='3b. Distribute ∧ over ∨',
                    r2='De Morgan;  ¬¬A ≡ A', already='already a DNF',
                    note=['Each step replaces a sub-formula', 'by an equivalent one, so every box', 'holds a formula equivalent to', 'the one you started with.']),
         'zh': dict(title='从公式到合取范式与析取范式', start='任意公式', s1='1. 消去 ⟷ 和 ⟶',
                    s2='2. 把 ¬ 向内推', s3a='3a. 用 ∨ 对 ∧ 的分配律', s3b='3b. 用 ∧ 对 ∨ 的分配律',
                    r2='德摩根律；¬¬A ≡ A', already='已经是析取范式',
                    note=['每一步都把一个子公式', '换成与之等价的公式，', '所以每个框中的公式', '都与最初的公式等价。'])}[L]
    s = SVG(760, 312, T['title'])

    def box(x, y, title, rule, formula, col, bg, tag=None, extra=None):
        s.rect(x, y, 234, 112, fill=bg, stroke=col, r=12, sw=1.8)
        s.text(x + 14, y + 26, title, size=13.5, weight=700, fill=col)
        if rule:
            s.text(x + 14, y + 50, rule, size=10.5, fill=C['slate'], mono=True)
        s.text(x + 117, y + 84, formula, size=14, fill=C['navy'], anchor='middle', mono=True)
        if extra:
            s.text(x + 117, y + 103, extra, size=11, fill=C['slate'], anchor='middle', italic=True)
        if tag:
            s.pill(x + 234 - 30, y + 26, tag, kind='plain', size=11)

    box(8, 16, T['start'], None, '(A ⟶ B) ⟶ C', C['slate'], C['white'])
    box(263, 16, T['s1'], 'A ⟶ B  ≡  ¬A ∨ B', '¬(¬A ∨ B) ∨ C', C['blue'], C['skyp'])
    box(518, 16, T['s2'], T['r2'], '(A ∧ ¬B) ∨ C', C['purple'], C['purplep'], tag='NNF')
    box(263, 184, T['s3a'], '(A ∧ B) ∨ C ≡ (A ∨ C) ∧ (B ∨ C)', '(A ∨ C) ∧ (¬B ∨ C)', C['green'], C['greenp'], tag='CNF')
    box(518, 184, T['s3b'], 'A ∧ (B ∨ C) ≡ (A ∧ B) ∨ (A ∧ C)', '(A ∧ ¬B) ∨ C', C['amber'], C['amberp'], tag='DNF',
        extra=T['already'])
    s.line(244, 72, 259, 72, stroke=C['slate'], sw=2, arrow=True)
    s.line(499, 72, 514, 72, stroke=C['slate'], sw=2, arrow=True)
    s.line(635, 130, 635, 180, stroke=C['slate'], sw=2, arrow=True)
    s.line(560, 130, 420, 180, stroke=C['slate'], sw=2, arrow=True)
    s.lines(22, 214, T['note'], size=12.5, fill=C['slate'], gap=19)
    return s


FIGURES = {'fig-02-1': fig_02_1, 'fig-02-2': fig_02_2, 'fig-02-3': fig_02_3}
