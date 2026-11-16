"""Figures of Module 10."""
from figlib import *  # noqa: F401,F403   (SVG, C colours, SANS, MONO, arrow_label)

ADV = 0.602   # advance width of Isabelle's monospaced font, in em


def width(t, size):
    """Rough width of a sans-serif label: CJK characters are about 1 em wide, others about 0.56 em."""
    return sum(size * (1.0 if ord(c) >= 0x2E80 else 0.56) for c in t)


def code(s, x, y, line, size=13, **kw):
    """One line of Isabelle text; SVG drops leading spaces, so indent by position."""
    n = len(line) - len(line.lstrip(' '))
    s.text(x + n * size * ADV, y, line.lstrip(' '), size=size, mono=True, **kw)


def fig_10_1(L):
    T = {'en': dict(title='The block structure of an Isar proof',
                    outer='block 1', inner='block 2',
                    g1='goal of block 1:', g1f='A ∧ B ⟹ B ∧ A',
                    fact='adds the fact ab to block 1',
                    show='claims B ∧ A; its proof is block 2',
                    g2='goals of block 2:', g2a='1. B', g2b='2. A',
                    s1='solves goal 1 of block 2',
                    nx='starts a fresh part of block 2',
                    s2='solves goal 2 of block 2',
                    q2=['block 2 is finished, so', 'show "B ∧ A" solves the goal of block 1'],
                    flow='the fact ab flows into the nested block'),
         'zh': dict(title='Isar 证明的块结构',
                    outer='块 1', inner='块 2',
                    g1='块 1 的目标：', g1f='A ∧ B ⟹ B ∧ A',
                    fact='在块 1 中加入事实 ab',
                    show='断言 B ∧ A，它的证明是块 2',
                    g2='块 2 的目标：', g2a='1. B', g2b='2. A',
                    s1='解决块 2 的目标 1',
                    nx='在块 2 中开始新的一部分',
                    s2='解决块 2 的目标 2',
                    q2=['块 2 结束，于是', 'show "B ∧ A" 解决块 1 的目标'],
                    flow='事实 ab 流入嵌套的块')}[L]
    s = SVG(760, 350, T['title'])
    lines = ['lemma "A ∧ B ⟶ B ∧ A"',
             'proof (rule impI)',
             '  assume ab: "A ∧ B"',
             '  show "B ∧ A"',
             '  proof (rule conjI)',
             '    show "B" using ab by blast',
             '  next',
             '    show "A" using ab by blast',
             '  qed',
             'qed']
    x0, y0, gap, size = 60, 40, 28, 13
    cw = size * ADV
    ys = [y0 + i * gap for i in range(len(lines))]
    # block 1 (outer) and block 2 (nested)
    s.rect(44, ys[1] - 19, 330, ys[9] - ys[1] + 28, fill=C['skyp'], stroke=C['blue'], r=10, sw=1.6)
    s.text(364, ys[1] - 3, T['outer'], size=11.5, fill=C['blue'], weight=700, anchor='end')
    s.rect(x0 + 2 * cw - 8, ys[4] - 19, 300, ys[8] - ys[4] + 28, fill=C['greenp'], stroke=C['green'], r=8, sw=1.6)
    s.text(x0 + 2 * cw - 8 + 292, ys[4] - 3, T['inner'], size=11.5, fill=C['green'], weight=700, anchor='end')
    s.line(x0 + 7 * cw, ys[6] - 5, x0 + 2 * cw + 284, ys[6] - 5, stroke=C['green'], sw=1.2, dash='5 4')
    for y, ln in zip(ys, lines):
        kw = ln.strip().split(' ')[0]
        code(s, x0, y, ln, size=size, fill=C['navy'], weight=700 if kw in ('lemma', 'proof', 'qed', 'next') else 400)
    # the fact ab flows from its assumption into both uses
    gx, end = 30, x0 + 4 * cw - 6
    s.circle(gx, ys[2] - 4, 4, fill=C['purple'], stroke=C['purple'], sw=1)
    s.line(gx, ys[2] - 4, x0 + 2 * cw - 4, ys[2] - 4, stroke=C['purple'], sw=1.8)
    s.path(f'M{gx} {ys[2] - 4} V{ys[5] - 4} H{end}', stroke=C['purple'], sw=1.8, arrow=True)
    s.path(f'M{gx} {ys[5] - 4} V{ys[7] - 4} H{end}', stroke=C['purple'], sw=1.8, arrow=True)
    # notes on the right, each level with its line
    ax = 404

    def note(i, text, col, weight=400):
        s.line(380, ys[i] - 5, ax - 8, ys[i] - 5, stroke=col, sw=1.1, dash='3 3')
        s.text(ax, ys[i], text, size=12.5, fill=col, weight=weight)

    note(1, T['g1'], C['blue'], 600)
    s.text(ax + 10 + width(T['g1'], 12.5), ys[1], T['g1f'], size=12.5, mono=True, fill=C['blue'])
    note(2, T['fact'], C['purple'])
    note(3, T['show'], C['blue'])
    note(4, T['g2'], C['green'], 600)
    gx2 = ax + 10 + width(T['g2'], 12.5)
    s.text(gx2, ys[4], T['g2a'], size=12.5, mono=True, fill=C['green'])
    s.text(gx2 + 48, ys[4], T['g2b'], size=12.5, mono=True, fill=C['green'])
    note(5, T['s1'], C['green'])
    note(6, T['nx'], C['slate'])
    note(7, T['s2'], C['green'])
    note(8, T['q2'][0], C['blue'])
    s.text(ax, ys[8] + 18, T['q2'][1], size=12.5, fill=C['blue'])
    s.text(gx - 4, 336, T['flow'], size=11.5, fill=C['purple'], italic=True)
    return s


def fig_10_2(L):
    T = {'en': dict(title='A natural-deduction tree and its Isar proof', tree='The tree (Module 6)',
                    isar='The Isar proof', foot='Each rule of the tree is one step of the Isar text.'),
         'zh': dict(title='自然演绎证明树与对应的 Isar 证明', tree='证明树（模块 6）',
                    isar='Isar 证明', foot='证明树中的每条规则对应 Isar 证明中的一步。')}[L]
    s = SVG(760, 300, T['title'])
    col = {'imp': C['blue'], 'e2': C['green'], 'e1': C['amber'], 'ci': C['purple']}
    pale = {'imp': C['skyp'], 'e2': C['greenp'], 'e1': C['amberp'], 'ci': C['purplep']}
    # ---- left: the tree, read from the leaves down
    s.text(20, 30, T['tree'], size=13, weight=700, fill=C['slate'])
    mono = dict(size=15, mono=True, fill=C['navy'], anchor='middle')
    lx, rx, cx = 82, 218, 150
    s.text(lx, 88, '[A ∧ B]¹', **mono)
    s.text(rx, 88, '[A ∧ B]¹', **mono)
    s.line(lx - 44, 100, lx + 44, 100, stroke=col['e2'], sw=2.4)
    s.text(lx + 48, 105, '∧E₂', size=13, fill=col['e2'], weight=700)
    s.line(rx - 44, 100, rx + 44, 100, stroke=col['e1'], sw=2.4)
    s.text(rx + 48, 105, '∧E₁', size=13, fill=col['e1'], weight=700)
    s.text(lx, 126, 'B', **mono)
    s.text(rx, 126, 'A', **mono)
    s.line(lx - 24, 140, rx + 24, 140, stroke=col['ci'], sw=2.4)
    s.text(rx + 30, 145, '∧I', size=13, fill=col['ci'], weight=700)
    s.text(cx, 166, 'B ∧ A', **mono)
    s.line(cx - 82, 180, cx + 82, 180, stroke=col['imp'], sw=2.4)
    s.text(cx + 88, 185, '⟶I¹', size=13, fill=col['imp'], weight=700)
    s.text(cx, 206, 'A ∧ B ⟶ B ∧ A', **mono)
    # ---- right: the Isar text, each line in the colour of its rule
    s.text(318, 30, T['isar'], size=13, weight=700, fill=C['slate'])
    lines = [('lemma "A ∧ B ⟶ B ∧ A"', None, ''),
             ('proof (rule impI)', 'imp', '⟶I'),
             ('  assume ab: "A ∧ B"', 'imp', '[A ∧ B]¹'),
             ('  from ab have b: "B" by (rule conjunct2)', 'e2', '∧E₂'),
             ('  from ab have a: "A" by (rule conjunct1)', 'e1', '∧E₁'),
             ('  from b a show "B ∧ A" by (rule conjI)', 'ci', '∧I'),
             ('qed', None, '')]
    y = 62
    for text, k, tag in lines:
        if k:
            s.rect(312, y - 16, 440, 23, fill=pale[k], stroke=col[k], r=5, sw=1.2)
            s.text(744, y, tag, size=12.5, fill=col[k], weight=700, anchor='end')
        code(s, 320, y, text, size=12, fill=C['navy'])
        y += 31
    s.text(380, 288, T['foot'], size=12.5, fill=C['slate'], italic=True, anchor='middle')
    return s


FIGURES = {'fig-10-1': fig_10_1, 'fig-10-2': fig_10_2}
