"""Figures of Module 5."""
from figlib import *  # noqa: F401,F403


def _tree(s, nodes, edges, tips, col):
    for (x1, y1), (x2, y2) in edges:
        s.line(x1, y1, x2, y2, stroke=C['muted'], sw=1.8)
    for x, y in tips:
        s.rect(x - 6, y - 6, 12, 12, fill=C['bg'], stroke=C['slate'], r=2, sw=1.4)
    for x, y, v, c in nodes:
        s.circle(x, y, 17, fill=C['white'], stroke=col[c], sw=2.4)
        s.text(x, y + 5, v, size=15, weight=700, fill=col[c], anchor='middle', mono=True)


def fig_05_1(L):
    """A tree and its mirror image."""
    T = {'en': dict(title='A tree and its mirror image', t='t', m='mirror t', tip='Tip',
                    swap=['left and right', 'swap at', 'every node']),
         'zh': dict(title='一棵树和它的镜像', t='t', m='mirror t', tip='Tip',
                    swap=['每个结点的', '左右子树', '互换'])}[L]
    s = SVG(760, 372, T['title'])
    col = {'a': C['green'], 'b': C['blue'], 'r': C['navy']}
    # t = Node (Node Tip 1 Tip) 2 (Node (Node Tip 3 Tip) 4 Tip)
    r, a, b, c = (190, 52), (110, 122), (270, 122), (226, 192)
    nodes = [(r[0], r[1], '2', 'r'), (a[0], a[1], '1', 'a'), (b[0], b[1], '4', 'b'), (c[0], c[1], '3', 'b')]
    tips = [(74, 186), (146, 186), (314, 186), (194, 254), (258, 254)]
    edges = [(r, a), (r, b), (b, c), (a, tips[0]), (a, tips[1]), (b, tips[2]), (c, tips[3]), (c, tips[4])]
    _tree(s, nodes, edges, tips, col)
    # mirror t = Node (Node Tip 4 (Node Tip 3 Tip)) 2 (Node Tip 1 Tip)
    r2, b2, a2, c2 = (570, 52), (490, 122), (650, 122), (534, 192)
    nodes2 = [(r2[0], r2[1], '2', 'r'), (b2[0], b2[1], '4', 'b'), (a2[0], a2[1], '1', 'a'), (c2[0], c2[1], '3', 'b')]
    tips2 = [(446, 186), (614, 186), (686, 186), (502, 254), (566, 254)]
    edges2 = [(r2, b2), (r2, a2), (b2, c2), (b2, tips2[0]), (a2, tips2[1]), (a2, tips2[2]), (c2, tips2[3]), (c2, tips2[4])]
    _tree(s, nodes2, edges2, tips2, col)
    s.text(110, 46, T['t'], size=16, weight=700, mono=True, fill=C['navy'], anchor='middle')
    s.text(670, 46, T['m'], size=16, weight=700, mono=True, fill=C['navy'], anchor='middle')
    # the mirror line, with a gap for its label
    s.line(380, 24, 380, 92, stroke=C['slate'], sw=1.6, dash='6 5')
    s.lines(380, 114, T['swap'], size=12, fill=C['slate'], anchor='middle', gap=17)
    s.line(352, 172, 408, 172, stroke=C['slate'], sw=1.8, arrow=True)
    s.line(408, 172, 352, 172, stroke=C['slate'], sw=1.8, arrow=True)
    s.line(380, 190, 380, 270, stroke=C['slate'], sw=1.6, dash='6 5')
    s.rect(20, 284, 720, 76, fill=C['bg'], stroke=C['border'], r=10, sw=1.2)
    pre = ' style="white-space:pre"'
    s.text(36, 312, 't        = Node (Node Tip 1 Tip) 2 (Node (Node Tip 3 Tip) 4 Tip)', size=13, mono=True, fill=C['navy'], extra=pre)
    s.text(36, 342, 'mirror t = Node (Node Tip 4 (Node Tip 3 Tip)) 2 (Node Tip 1 Tip)', size=13, mono=True, fill=C['navy'], extra=pre)
    s.rect(632, 300, 12, 12, fill=C['bg'], stroke=C['slate'], r=2, sw=1.4)
    s.text(652, 311, '= ' + T['tip'], size=12.5, mono=True, fill=C['slate'])
    return s


def fig_05_2(L):
    """The calls made by the naive Fibonacci function for fib 5."""
    T = {'en': dict(title='The calls made to compute fib 5', total='15 calls in all',
                    twice='fib 3: computed 2 times', thrice='fib 2: computed 3 times', leaves='fib 1: 5 times, fib 0: 3 times'),
         'zh': dict(title='计算 fib 5 时发生的调用', total='一共 15 次调用',
                    twice='fib 3：计算了 2 次', thrice='fib 2：计算了 3 次', leaves='fib 1：5 次，fib 0：3 次')}[L]
    s = SVG(760, 352, T['title'])
    ys = [36, 98, 160, 222, 284]
    leaf_x = [60, 151, 243, 334, 426, 517, 609, 700]
    # (label, depth, x) for every call; edges as (parent, child) indices
    f2a = (leaf_x[1] + leaf_x[2]) / 2
    f3a = (leaf_x[0] + f2a) / 2
    f2b = (leaf_x[3] + leaf_x[4]) / 2
    f2c = (leaf_x[6] + leaf_x[7]) / 2
    f3b = (leaf_x[5] + f2c) / 2
    f4 = (f2b + f3b) / 2
    f5 = (f3a + f4) / 2
    calls = [('fib 5', 0, f5), ('fib 3', 1, f3a), ('fib 4', 1, f4), ('fib 1', 2, leaf_x[0]), ('fib 2', 2, f2a),
             ('fib 0', 3, leaf_x[1]), ('fib 1', 3, leaf_x[2]), ('fib 2', 2, f2b), ('fib 3', 2, f3b),
             ('fib 0', 3, leaf_x[3]), ('fib 1', 3, leaf_x[4]), ('fib 1', 3, leaf_x[5]), ('fib 2', 3, f2c),
             ('fib 0', 4, leaf_x[6]), ('fib 1', 4, leaf_x[7])]
    edges = [(0, 1), (0, 2), (1, 3), (1, 4), (4, 5), (4, 6), (2, 7), (2, 8), (7, 9), (7, 10), (8, 11), (8, 12),
             (12, 13), (12, 14)]
    for p, c in edges:
        s.line(calls[p][2], ys[calls[p][1]] + 13, calls[c][2], ys[calls[c][1]] - 13, stroke=C['muted'], sw=1.6)
    style = {'fib 3': (C['amberp'], C['amber']), 'fib 2': (C['purplep'], C['purple']),
             'fib 1': (C['bg'], C['slate']), 'fib 0': (C['bg'], C['slate'])}
    for lab, d, x in calls:
        fill, stroke = style.get(lab, (C['white'], C['navy']))
        s.rect(x - 30, ys[d] - 13, 60, 26, fill=fill, stroke=stroke, r=13, sw=1.8)
        s.text(x, ys[d] + 5, lab, size=13, mono=True, weight=700, fill=stroke, anchor='middle')
    # legend
    s.rect(20, 306, 720, 38, fill=C['white'], stroke=C['border'], r=8, sw=1.2)
    s.rect(34, 316, 18, 18, fill=C['amberp'], stroke=C['amber'], r=9, sw=1.6)
    s.text(60, 330, T['twice'], size=12.5, fill=C['amber'], weight=600)
    s.rect(244, 316, 18, 18, fill=C['purplep'], stroke=C['purple'], r=9, sw=1.6)
    s.text(270, 330, T['thrice'], size=12.5, fill=C['purple'], weight=600)
    s.text(456, 330, T['leaves'], size=12.5, fill=C['slate'])
    s.text(726, 330, T['total'], size=12.5, fill=C['navy'], weight=700, anchor='end')
    return s


def fig_05_3(L):
    """Induction as a row of dominoes: the base case, the step, the conclusion."""
    T = {'en': dict(title='Mathematical induction as falling dominoes', push='push',
                    step='P(n) ⟶ P(n+1)',
                    b1='Base case', b1a='Prove P(0):', b1b='the first domino falls.',
                    b2='Induction step', b2a='For every n, prove that P(n)', b2b='implies P(n+1): each domino', b2c='knocks over the next one.',
                    b3='Conclusion', b3a='P(n) holds for every n:', b3b='every domino falls,', b3c='however far along the row.'),
         'zh': dict(title='把数学归纳法看作倒下的多米诺骨牌', push='推',
                    step='P(n) ⟶ P(n+1)',
                    b1='基础情形', b1a='证明 P(0)：', b1b='第一块骨牌倒下。',
                    b2='归纳步骤', b2a='对每个 n，证明 P(n)', b2b='蕴涵 P(n+1)：每块骨牌', b2c='都会推倒下一块。',
                    b3='结论', b3a='对每个 n，P(n) 都成立：', b3b='每一块骨牌都会倒下，', b3c='无论它离起点多远。')}[L]
    s = SVG(760, 340, T['title'])
    base, w, hgt = 196, 24, 84
    s.line(20, base, 740, base, stroke=C['border'], sw=2)
    slots = [(64, 'P(0)'), (128, 'P(1)'), (192, 'P(2)'), (256, 'P(3)'), (320, 'P(4)'),
             (450, 'P(n)'), (514, 'P(n+1)'), (578, 'P(n+2)')]
    for i, (x, lab) in enumerate(slots):
        if i == 0:
            fill, stroke = C['greenl'], C['green']
        elif lab in ('P(n)', 'P(n+1)'):
            fill, stroke = C['skyl'], C['blue']
        else:
            fill, stroke = C['white'], C['navy']
        # the first domino is falling: rotated about its bottom right corner
        rot = f' transform="rotate(22 {x + w} {base})"' if i == 0 else ''
        s.rect(x, base - hgt, w, hgt, fill=fill, stroke=stroke, r=4, sw=2, extra=rot)
        s.add(f'<line x1="{x + 4}" y1="{base - hgt / 2}" x2="{x + w - 4}" y2="{base - hgt / 2}" '
              f'stroke="{stroke}" stroke-width="1.5"{rot}/>')
        for py in (base - hgt + 14, base - 22):
            s.add(f'<circle cx="{x + w / 2}" cy="{py}" r="3" fill="{stroke}"{rot}/>')
        s.text(x + w / 2, base + 22, lab, size=13, mono=True, anchor='middle',
               fill=C['green'] if i == 0 else C['blue'] if lab in ('P(n)', 'P(n+1)') else C['navy'],
               weight=700 if i == 0 or lab in ('P(n)', 'P(n+1)') else 400)
    # motion marks behind the falling domino, and the push
    s.path('M 52 112 q 10 -14 26 -16', stroke=C['green'], sw=2)
    s.path('M 46 128 q 10 -14 26 -16', stroke=C['green'], sw=2)
    s.line(18, 150, 54, 150, stroke=C['green'], sw=3, arrow=True)
    s.text(30, 140, T['push'], size=12, fill=C['green'], weight=700, anchor='middle')
    for x in (384, 406, 428):
        s.circle(x - 4, base - 30, 2.6, fill=C['slate'], stroke=C['slate'], sw=1)
    for x in (634, 656, 678):
        s.circle(x, base - 30, 2.6, fill=C['slate'], stroke=C['slate'], sw=1)
    # the step: P(n) knocks over P(n+1)
    s.path('M 466 104 Q 494 58 522 98', stroke=C['blue'], sw=2.4, arrow=True)
    s.text(494, 56, T['step'], size=13, mono=True, fill=C['blue'], weight=700, anchor='middle')
    # the three parts of the proof
    boxes = [(20, C['green'], C['greenp'], T['b1'], [T['b1a'], T['b1b']]),
             (266, C['blue'], C['skyp'], T['b2'], [T['b2a'], T['b2b'], T['b2c']]),
             (512, C['navy'], C['bg'], T['b3'], [T['b3a'], T['b3b'], T['b3c']])]
    for x, col, bg, head, rows in boxes:
        s.rect(x, 238, 228, 92, fill=bg, stroke=col, r=10, sw=1.6)
        s.text(x + 14, 260, head, size=14, weight=700, fill=col)
        s.lines(x + 14, 281, rows, size=12.5, fill=C['navy'], gap=17)
    return s


FIGURES = {'fig-05-1': fig_05_1, 'fig-05-2': fig_05_2, 'fig-05-3': fig_05_3}
