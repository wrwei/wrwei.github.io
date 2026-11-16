"""Figures of Module 4."""
from math import sqrt

from figlib import *  # noqa: F401,F403


def _lens(ax, bx, cy, r):
    """Intersection points of two circles of radius r centred at (ax, cy) and (bx, cy)."""
    xm = (ax + bx) / 2
    h = sqrt(r * r - ((bx - ax) / 2) ** 2)
    return xm, cy - h, cy + h


def fig_04_1(L):
    T = {'en': dict(title='Union, intersection, difference and complement as Venn diagrams',
                    names=['union', 'intersection', 'difference', 'complement']),
         'zh': dict(title='用维恩图表示并集、交集、差集和补集',
                    names=['并集', '交集', '差集', '补集'])}[L]
    s = SVG(760, 250, T['title'])
    ops = ['A ∪ B', 'A ∩ B', 'A - B', '- A']
    conds = ['x ∈ A ∨ x ∈ B', 'x ∈ A ∧ x ∈ B', 'x ∈ A ∧ x ∉ B', 'x ∉ A']
    fill, edge = C['skyl'], C['blue']
    r, cy = 38, 122
    for i in range(4):
        x0 = 12 + i * 186
        s.text(x0 + 84, 24, T['names'][i], size=13, weight=600, fill=C['slate'], anchor='middle')
        s.text(x0 + 84, 46, ops[i], size=16, weight=700, fill=C['navy'], anchor='middle', mono=True)
        rx, ry, rw, rh = x0 + 2, 62, 164, 120
        ax, bx = x0 + 61, x0 + 107
        if i == 3:
            s.rect(rx, ry, rw, rh, fill=fill, stroke=C['slate'], r=6, sw=1.4)
            s.circle(x0 + 84, cy, r, fill=C['white'], stroke=C['navy'], sw=1.8)
            s.text(x0 + 84, cy + 5, 'A', size=14, weight=700, fill=C['navy'], anchor='middle', mono=True)
        else:
            s.rect(rx, ry, rw, rh, fill=C['white'], stroke=C['slate'], r=6, sw=1.4)
            xm, top, bot = _lens(ax, bx, cy, r)
            if i == 0:
                s.circle(ax, cy, r, fill=fill, stroke='none', sw=0)
                s.circle(bx, cy, r, fill=fill, stroke='none', sw=0)
            elif i == 1:
                s.path(f'M{xm:.1f} {top:.1f} A{r} {r} 0 0 1 {xm:.1f} {bot:.1f} A{r} {r} 0 0 1 {xm:.1f} {top:.1f} Z',
                       stroke='none', sw=0, fill=fill)
            else:
                s.path(f'M{xm:.1f} {top:.1f} A{r} {r} 0 1 0 {xm:.1f} {bot:.1f} A{r} {r} 0 0 1 {xm:.1f} {top:.1f} Z',
                       stroke='none', sw=0, fill=fill)
            s.circle(ax, cy, r, fill='none', stroke=C['navy'], sw=1.8)
            s.circle(bx, cy, r, fill='none', stroke=C['navy'], sw=1.8)
            s.text(ax - 18, cy + 5, 'A', size=14, weight=700, fill=C['navy'], anchor='middle', mono=True)
            s.text(bx + 18, cy + 5, 'B', size=14, weight=700, fill=C['navy'], anchor='middle', mono=True)
        s.text(rx + 6, ry + 15, 'UNIV', size=11, fill=C['slate'], mono=True)
        s.text(x0 + 84, 214, conds[i], size=13.5, fill=edge, weight=600, anchor='middle', mono=True)
    return s


def fig_04_2(L):
    T = {'en': dict(title='Hasse diagrams of two partial orders', left='subsets of {1, 2, 3}, ordered by ⊆',
                    right='divisors of 12, ordered by divisibility'),
         'zh': dict(title='两个偏序的哈斯图', left='{1, 2, 3} 的子集，按 ⊆ 排序',
                    right='12 的约数，按整除关系排序')}[L]
    s = SVG(760, 350, T['title'])
    s.text(190, 24, T['left'], size=13.5, weight=600, fill=C['slate'], anchor='middle')
    s.text(570, 24, T['right'], size=13.5, weight=600, fill=C['slate'], anchor='middle')
    s.line(380, 40, 380, 330, stroke=C['border'], sw=1.4, dash='5 5')
    ys = [310, 230, 150, 70]
    left = {'∅': (190, ys[0]), '{1}': (90, ys[1]), '{2}': (190, ys[1]), '{3}': (290, ys[1]),
            '{1, 2}': (90, ys[2]), '{1, 3}': (190, ys[2]), '{2, 3}': (290, ys[2]), '{1, 2, 3}': (190, ys[3])}
    ledges = [('∅', '{1}'), ('∅', '{2}'), ('∅', '{3}'), ('{1}', '{1, 2}'), ('{1}', '{1, 3}'),
              ('{2}', '{1, 2}'), ('{2}', '{2, 3}'), ('{3}', '{1, 3}'), ('{3}', '{2, 3}'),
              ('{1, 2}', '{1, 2, 3}'), ('{1, 3}', '{1, 2, 3}'), ('{2, 3}', '{1, 2, 3}')]
    right = {'1': (570, ys[0]), '2': (510, ys[1]), '3': (630, ys[1]), '4': (450, ys[2]), '6': (570, ys[2]),
             '12': (510, ys[3])}
    redges = [('1', '2'), ('1', '3'), ('2', '4'), ('2', '6'), ('3', '6'), ('4', '12'), ('6', '12')]
    for nodes, edges in ((left, ledges), (right, redges)):
        for a, b in edges:
            (x1, y1), (x2, y2) = nodes[a], nodes[b]
            s.line(x1, y1, x2, y2, stroke=C['blue'], sw=2)
        for name, (x, y) in nodes.items():
            w = max(36, len(name) * 9 + 16)
            s.rect(x - w / 2, y - 15, w, 30, fill=C['white'], stroke=C['navy'], r=8, sw=1.6)
            s.text(x, y + 5, name, size=14, weight=600, fill=C['navy'], anchor='middle', mono=True)
    return s


def fig_04_3(L):
    T = {'en': dict(title='A transitive closure, and the reachable states of a door with a lock',
                    left='R and the pairs R⁺ adds', solid='in R', dashed='added by R⁺',
                    right='the door: reachable states in green', start='start',
                    unlock='unlock', lock='lock', open='open', close='close', bug='lock (added)',
                    desc={'CL': 'closed, locked', 'CU': 'closed, unlocked', 'OU': 'open, unlocked',
                          'OL': 'open, locked: bad'}),
         'zh': dict(title='传递闭包，以及带锁门的可达状态',
                    left='R 以及 R⁺ 添加的有序对', solid='R 中的有序对', dashed='R⁺ 添加的',
                    right='门：可达状态为绿色', start='初始',
                    unlock='开锁', lock='上锁', open='开门', close='关门', bug='上锁（新增）',
                    desc={'CL': '关闭，已锁', 'CU': '关闭，未锁', 'OU': '打开，未锁', 'OL': '打开，已锁：危险'})}[L]
    s = SVG(760, 330, T['title'])
    # ---- left: R = {(1,2), (2,3), (3,4)} and the arcs of R+
    s.text(185, 24, T['left'], size=13.5, weight=600, fill=C['slate'], anchor='middle')
    xs, y, r = [50, 140, 230, 320], 220, 17
    for (a, b, hgt, d1, d2) in ((0, 2, 70, 8, -7), (1, 3, 70, 8, -9), (0, 3, 125, -2, 3)):
        x1, x2 = xs[a], xs[b]
        mid = (x1 + x2) / 2
        s.path(f'M{x1 + d1} {y - r + 1} Q{mid} {y - hgt - 40} {x2 + d2} {y - r - 1}', stroke=C['blue'], sw=2,
               dash='6 5', arrow=True)
    for a in range(3):
        s.line(xs[a] + r + 2, y, xs[a + 1] - r - 3, y, stroke=C['navy'], sw=2.2, arrow=True)
    for i, x in enumerate(xs):
        s.circle(x, y, r, fill=C['white'], stroke=C['navy'], sw=2)
        s.text(x, y + 5, str(i + 1), size=15, weight=700, fill=C['navy'], anchor='middle', mono=True)
    s.line(40, 285, 80, 285, stroke=C['navy'], sw=2.2, arrow=True)
    s.text(90, 290, T['solid'], size=12.5, fill=C['slate'])
    s.line(190, 285, 230, 285, stroke=C['blue'], sw=2, dash='6 5', arrow=True)
    s.text(240, 290, T['dashed'], size=12.5, fill=C['slate'])
    s.line(380, 40, 380, 320, stroke=C['border'], sw=1.4, dash='5 5')
    # ---- right: the door
    s.text(575, 24, T['right'], size=13.5, weight=600, fill=C['slate'], anchor='middle')
    pos = {'CL': (490, 105), 'CU': (680, 105), 'OU': (680, 245), 'OL': (490, 245)}
    for name, (x, yy) in pos.items():
        bad = name == 'OL'
        s.rect(x - 34, yy - 21, 68, 42, fill=C['redp'] if bad else C['greenl'], stroke=C['red'] if bad else C['green'],
               r=10, sw=2)
        s.text(x, yy + 6, name, size=16, weight=700, fill=C['red'] if bad else C['green'], anchor='middle', mono=True)
        dy = -30 if yy < 200 else 39
        s.text(x, yy + dy, T['desc'][name], size=12, fill=C['red'] if bad else C['slate'], anchor='middle')
    s.line(410, 105, 452, 105, stroke=C['slate'], sw=2, arrow=True)
    s.text(428, 96, T['start'], size=12, fill=C['slate'], anchor='middle')
    s.line(526, 97, 643, 97, stroke=C['navy'], sw=2, arrow=True)
    s.text(585, 89, T['unlock'], size=12, fill=C['navy'], anchor='middle', weight=600)
    s.line(643, 113, 526, 113, stroke=C['navy'], sw=2, arrow=True)
    s.text(585, 130, T['lock'], size=12, fill=C['navy'], anchor='middle', weight=600)
    s.line(672, 128, 672, 221, stroke=C['navy'], sw=2, arrow=True)
    s.text(664, 180, T['open'], size=12, fill=C['navy'], anchor='end', weight=600)
    s.line(688, 221, 688, 128, stroke=C['navy'], sw=2, arrow=True)
    s.text(696, 180, T['close'], size=12, fill=C['navy'], anchor='start', weight=600)
    s.line(643, 245, 526, 245, stroke=C['red'], sw=2, dash='6 5', arrow=True)
    s.text(585, 237, T['bug'], size=12, fill=C['red'], anchor='middle', weight=600)
    return s


def fig_04_4(L):
    T = {'en': dict(title="Cantor's diagonal argument", header='Is n in the set?',
                    rows=['even numbers', 'the empty set', 'all of ℕ', 'the primes', '{1, 3}'],
                    drow='D = {n. n ∉ f n}', dnote='flip the diagonal',
                    note=['D differs from', 'every row: from', 'row i in column i.', 'So D is not f i,', 'for any i.']),
         'zh': dict(title='康托尔的对角线论证', header='n 是否属于该集合？',
                    rows=['偶数', '空集', '全体自然数', '素数', '{1, 3}'],
                    drow='D = {n. n ∉ f n}', dnote='把对角线取反',
                    note=['D 与每一行都不同：', '它与第 i 行', '在第 i 列不同。', '因此对任何 i，', 'D 都不等于 f i。'])}[L]
    s = SVG(760, 330, T['title'])
    members = [lambda n: n % 2 == 0, lambda n: False, lambda n: True, lambda n: n in (2, 3, 5, 7),
               lambda n: n in (1, 3)]
    cx = lambda j: 290 + j * 52  # noqa: E731
    s.text(cx(2), 22, T['header'], size=13, weight=600, fill=C['slate'], anchor='middle')
    for j in range(5):
        s.text(cx(j), 48, str(j), size=14, weight=700, fill=C['navy'], anchor='middle', mono=True)
    s.text(cx(5), 48, '…', size=14, weight=700, fill=C['navy'], anchor='middle', mono=True)
    s.text(258, 48, 'n', size=14, weight=700, fill=C['slate'], anchor='middle', mono=True)
    for i in range(5):
        y = 82 + i * 34
        s.text(30, y + 5, f'f {i}', size=14, weight=700, fill=C['navy'], mono=True)
        s.text(78, y + 5, T['rows'][i], size=13, fill=C['slate'])
        for j in range(5):
            diag = i == j
            s.rect(cx(j) - 21, y - 13, 42, 26, fill=C['amberp'] if diag else C['white'],
                   stroke=C['amber'] if diag else C['border'], r=5, sw=2 if diag else 1.2)
            s.text(cx(j), y + 5, '1' if members[i](j) else '0', size=14, weight=700 if diag else 400,
                   fill=C['amber'] if diag else C['navy'], anchor='middle', mono=True)
        s.text(cx(5), y + 5, '…', size=14, fill=C['slate'], anchor='middle', mono=True)
    s.text(cx(2), 258, '⋮', size=16, fill=C['slate'], anchor='middle', mono=True)
    y = 294
    s.text(30, y + 5, 'D', size=15, weight=700, fill=C['green'], mono=True)
    s.text(78, y - 2, T['drow'], size=12.5, fill=C['green'], mono=True)
    s.text(78, y + 14, T['dnote'], size=12, fill=C['slate'], italic=True)
    for j in range(5):
        s.rect(cx(j) - 21, y - 13, 42, 26, fill=C['greenl'], stroke=C['green'], r=5, sw=2)
        s.text(cx(j), y + 5, '0' if members[j](j) else '1', size=14, weight=700, fill=C['green'], anchor='middle',
               mono=True)
    s.text(cx(5), y + 5, '…', size=14, fill=C['slate'], anchor='middle', mono=True)
    s.lines(608, 110, T['note'], size=13, fill=C['navy'], gap=22)
    return s


FIGURES = {'fig-04-1': fig_04_1, 'fig-04-2': fig_04_2, 'fig-04-3': fig_04_3, 'fig-04-4': fig_04_4}
