"""Figures of Module 7."""
from html import escape

from figlib import *  # noqa: F401,F403


def mtext(s, x, y, parts, size=18, anchor='start', weight=400):
    """One line of Isabelle text in several colours: parts = [(text, colour), ...]."""
    spans = ''.join(f'<tspan fill="{c}">{escape(t)}</tspan>' for t, c in parts)
    s.add(f'<text x="{x}" y="{y}" font-family="{MONO}" font-size="{size}" font-weight="{weight}" '
          f'text-anchor="{anchor}" xml:space="preserve">{spans}</text>')


def under(s, x1, x2, y, label, col, size=12):
    """A bracket under the characters between x1 and x2, with a label below it."""
    s.path(f'M{x1} {y} V{y + 7} H{x2} V{y}', stroke=col, sw=1.6)
    s.text((x1 + x2) / 2, y + 24, label, size=size, fill=col, weight=600, anchor='middle')


def fig_07_1(L):
    T = {'en': dict(title='Pure and HOL', hol='HOL: the object logic', holk='formulas, of type bool',
                    pure='Pure: the meta-logic', purek='rules and goals, of type prop',
                    rows=['from … infer', 'for an arbitrary …', 'is defined as'],
                    right='A rule, written in both', prem='premises', concl='conclusion', infer='from … infer',
                    goal='A subgoal, written the same way', assm='assumption',
                    note=['Pure (purple) gives the structure: what is assumed',
                          'and what follows. HOL (blue) gives the formulas.']),
         'zh': dict(title='Pure 与 HOL', hol='HOL：对象逻辑', holk='公式，类型为 bool',
                    pure='Pure：元逻辑', purek='规则与目标，类型为 prop',
                    rows=['由……推出', '对任意的……', '定义为'],
                    right='一条规则，两层合写', prem='前提', concl='结论', infer='由……推出',
                    goal='一个子目标，写法相同', assm='假设',
                    note=['Pure（紫色）提供结构：哪些是假设，推出什么。', 'HOL（蓝色）提供公式。'])}[L]
    s = SVG(760, 340, T['title'])
    blue, purple = C['blue'], C['purple']
    # left: the two layers
    s.rect(20, 20, 340, 130, fill=C['skyp'], stroke=blue, r=12, sw=1.8)
    s.text(40, 50, T['hol'], size=15, weight=700, fill=blue)
    s.text(40, 70, T['holk'], size=12, fill=C['slate'], italic=True)
    s.text(40, 108, '¬  ∧  ∨  ⟶  ⟷  ∀  ∃  =', size=18, fill=blue, mono=True)
    s.text(40, 136, 'True  False', size=14, fill=blue, mono=True)
    s.rect(20, 170, 340, 150, fill=C['purplep'], stroke=purple, r=12, sw=1.8)
    s.text(40, 200, T['pure'], size=15, weight=700, fill=purple)
    s.text(40, 220, T['purek'], size=12, fill=C['slate'], italic=True)
    for i, (sym, row) in enumerate(zip(['⟹', '⋀', '≡'], T['rows'])):
        y = 252 + i * 26
        s.text(52, y, sym, size=18, fill=purple, mono=True, anchor='middle')
        s.text(80, y, row, size=13.5, fill=C['navy'])
    # right: one rule and one subgoal, coloured by layer (18 px monospace: 10.8 px per character)
    cw, x0 = 10.8, 400
    s.text(x0, 46, T['right'], size=14, weight=700, fill=C['navy'])
    mtext(s, x0, 112, [('⟦', purple), ('?P', blue), ('; ', purple), ('?Q', blue), ('⟧ ⟹ ', purple),
                       ('?P ∧ ?Q', blue)])
    s.text(x0 + 9.5 * cw, 80, T['infer'], size=12, fill=purple, weight=600, anchor='middle')
    s.line(x0 + 9.5 * cw, 85, x0 + 9.5 * cw, 95, stroke=purple, sw=1.5, arrow=True)
    under(s, x0, x0 + 8 * cw, 120, T['prem'], purple)
    under(s, x0 + 11 * cw, x0 + 18 * cw, 120, T['concl'], blue)
    s.text(x0, 192, T['goal'], size=14, weight=700, fill=C['navy'])
    mtext(s, x0, 236, [('A ∧ B', blue), (' ⟹ ', purple), ('B ∧ A', blue)])
    under(s, x0, x0 + 5 * cw, 244, T['assm'], blue)
    under(s, x0 + 8 * cw, x0 + 13 * cw, 244, T['concl'], blue)
    s.lines(x0, 304, T['note'], size=12.5, fill=C['slate'], gap=19)
    return s


def fig_07_2(L):
    T = {'en': dict(title='From proof tree to proof script', tree='The tree of Module 6', script='The script and the goal after each step',
                    rule='rule: one inference', asm='assumption: closes a leaf',
                    note=['Steps 1, 2, 3 and 5 add the inferences', 'from the root upwards; steps 4 and 6',
                          'close the leaves [A ∧ B]¹.']),
         'zh': dict(title='从证明树到证明脚本', tree='模块 6 中的证明树', script='证明脚本，以及每一步之后的目标',
                    rule='rule：一步推理', asm='assumption：封闭一个叶子',
                    note=['第 1、2、3、5 步从根部向上', '添加推理；第 4、6 步封闭', '叶子 [A ∧ B]¹。'])}[L]
    s = SVG(760, 430, T['title'])
    blue, green, navy, slate = C['blue'], C['green'], C['navy'], C['slate']

    def badge(x, y, n, col):
        s.circle(x, y, 9, fill=col, stroke=col, sw=1)
        s.text(x, y + 4, str(n), size=11, weight=700, fill=C['white'], anchor='middle')

    # left: the tree (root at the bottom)
    s.text(20, 36, T['tree'], size=14, weight=700, fill=navy)
    f = dict(size=15, mono=True, anchor='middle', fill=navy)
    s.text(100, 150, '[A ∧ B]¹', **f)
    s.text(250, 150, '[A ∧ B]¹', **f)
    badge(100, 124, 4, green)
    badge(250, 124, 6, green)
    s.line(60, 162, 140, 162, stroke=navy, sw=1.6)
    s.line(210, 162, 290, 162, stroke=navy, sw=1.6)
    s.text(145, 167, '∧E₂', size=12, fill=blue, weight=600)
    s.text(295, 167, '∧E₁', size=12, fill=blue, weight=600)
    badge(46, 162, 3, blue)
    badge(196, 162, 5, blue)
    s.text(100, 184, 'B', **f)
    s.text(250, 184, 'A', **f)
    s.line(70, 198, 280, 198, stroke=navy, sw=1.6)
    s.text(285, 203, '∧I', size=12, fill=blue, weight=600)
    badge(56, 198, 2, blue)
    s.text(175, 220, 'B ∧ A', **f)
    s.line(50, 234, 300, 234, stroke=navy, sw=1.6)
    s.text(305, 239, '⟶I¹', size=12, fill=blue, weight=600)
    badge(36, 234, 1, blue)
    s.text(175, 256, 'A ∧ B ⟶ B ∧ A', **f)
    badge(34, 300, '', blue)
    s.text(50, 304, T['rule'], size=12, fill=slate)
    badge(34, 324, '', green)
    s.text(50, 328, T['asm'], size=12, fill=slate)
    s.lines(26, 364, T['note'], size=12, fill=slate, gap=18)

    # right: the script, one row per command, with the goal after it
    s.text(360, 36, T['script'], size=14, weight=700, fill=navy)
    rows = [(None, 'lemma swap_and: "A ∧ B ⟶ B ∧ A"', '1. A ∧ B ⟶ B ∧ A'),
            ((1, blue), 'apply (rule impI)', '1. A ∧ B ⟹ B ∧ A'),
            ((2, blue), 'apply (rule conjI)', '1. A ∧ B ⟹ B    2. A ∧ B ⟹ A'),
            ((3, blue), 'apply (rule conjunct2)', '1. A ∧ B ⟹ ?P5 ∧ B    2. A ∧ B ⟹ A'),
            ((4, green), 'apply assumption', '1. A ∧ B ⟹ A'),
            ((5, blue), 'apply (rule conjunct1)', '1. A ∧ B ⟹ A ∧ ?Q7'),
            ((6, green), 'apply assumption', 'No subgoals!'),
            (None, 'done', None)]
    for i, (b, cmd, goal) in enumerate(rows):
        y = 70 + i * 45
        if b:
            badge(372, y - 5, b[0], b[1])
        s.text(390, y, cmd, size=13, fill=navy, mono=True, weight=600 if i == 0 else 400)
        if goal:
            mtext(s, 390, y + 19, [(goal, slate)], size=11.5)
    return s


FIGURES = {'fig-07-1': fig_07_1, 'fig-07-2': fig_07_2}
