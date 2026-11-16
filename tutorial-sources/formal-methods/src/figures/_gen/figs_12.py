"""Figures of Module 12."""
from figlib import *  # noqa: F401,F403


def fig_12_1(L):
    T = {'en': dict(title='Specification, implementation and the correctness theorem',
                    spec='Specification', specq='what the result must be',
                    specs='ys is sorted and a permutation of xs:',
                    specn='short, close to the requirement: for people',
                    imp='Implementation', impq='how to compute it',
                    impn='may be clever and fast: for the computer',
                    thm='Correctness theorem', thmq='proved once, for every list xs',
                    prop='the property', prog='the program'),
         'zh': dict(title='规约、实现与正确性定理',
                    spec='规约', specq='结果必须是什么',
                    specs='ys 有序，并且是 xs 的一个排列：',
                    specn='简短，贴近需求：写给人看',
                    imp='实现', impq='怎样计算结果',
                    impn='可以巧妙而高效：交给计算机运行',
                    thm='正确性定理', thmq='只证明一次，对每个列表 xs 都成立',
                    prop='性质', prog='程序')}[L]
    s = SVG(760, 330, T['title'])
    # specification
    s.rect(20, 20, 340, 168, fill=C['skyp'], stroke=C['blue'], r=12, sw=1.8)
    s.text(40, 48, T['spec'], size=15, weight=700, fill=C['blue'])
    s.text(40, 67, T['specq'], size=12, fill=C['slate'], italic=True)
    s.text(40, 96, T['specs'], size=12.5, fill=C['navy'])
    s.lines(56, 122, ['sorted ys', 'mset ys = mset xs'], size=13, mono=True, gap=22, fill=C['navy'])
    s.text(40, 176, T['specn'], size=11.5, fill=C['slate'], italic=True)
    # implementation
    s.rect(400, 20, 340, 168, fill=C['greenp'], stroke=C['green'], r=12, sw=1.8)
    s.text(420, 48, T['imp'], size=15, weight=700, fill=C['green'])
    s.text(420, 67, T['impq'], size=12, fill=C['slate'], italic=True)
    s.lines(420, 94, ['ins x [] = [x]', 'ins x (y # ys) = …', 'isort [] = []',
                      'isort (x # xs) = ins x (isort xs)'], size=12.5, mono=True, gap=19, fill=C['navy'])
    s.text(420, 176, T['impn'], size=11.5, fill=C['slate'], italic=True)
    # theorem
    s.rect(110, 232, 540, 80, fill=C['purplep'], stroke=C['purple'], r=12, sw=2.2)
    s.text(130, 258, T['thm'], size=14.5, weight=700, fill=C['purple'])
    s.text(630, 258, T['thmq'], size=11.5, fill=C['purple'], italic=True, anchor='end')
    s.text(380, 292, 'sorted (isort xs) ∧ mset (isort xs) = mset xs', size=13.5, mono=True,
           anchor='middle', fill=C['navy'], weight=600)
    # arrows into the theorem
    s.line(190, 190, 250, 228, stroke=C['blue'], sw=2, arrow=True)
    s.text(206, 222, T['prop'], size=11.5, fill=C['blue'], weight=600, anchor='end')
    s.line(570, 190, 510, 228, stroke=C['green'], sw=2, arrow=True)
    s.text(554, 222, T['prog'], size=11.5, fill=C['green'], weight=600)
    return s


def _tree(s, nodes, edges, hl_nodes=(), hl_edges=(), new=()):
    for a, b in edges:
        (x1, y1), (x2, y2) = nodes[a], nodes[b]
        hot = (a, b) in hl_edges
        s.line(x1, y1, x2, y2, stroke=C['orange'] if hot else C['slate'], sw=3 if hot else 1.8)
    for k, (x, y) in nodes.items():
        if k in new:
            s.circle(x, y, 18, fill=C['greenl'], stroke=C['green'], sw=2.6)
            s.text(x, y + 5, str(k), size=14, weight=700, fill=C['green'], anchor='middle', mono=True)
        else:
            hot = k in hl_nodes
            s.circle(x, y, 18, fill=C['orangep'] if hot else C['white'], stroke=C['orange'] if hot else C['navy'],
                     sw=2.4)
            s.text(x, y + 5, str(k), size=14, weight=700, fill=C['navy'], anchor='middle', mono=True)


def fig_12_2(L):
    T = {'en': dict(title='A binary search tree before and after inserting 6',
                    before='t0', after='tinsert 6 t0', lt='keys < 5', gt='keys > 5',
                    right='6 > 5: go right', left='6 < 8: go left', leaf='new node, where the leaf was',
                    inv='Invariant bst: at every node, every key in the left subtree is smaller and every key',
                    inv2='in the right subtree is larger. Search and insertion rely on it; insertion preserves it.'),
         'zh': dict(title='插入 6 之前和之后的二叉搜索树',
                    before='t0', after='tinsert 6 t0', lt='键 < 5', gt='键 > 5',
                    right='6 > 5：向右', left='6 < 8：向左', leaf='新结点，取代原来的叶子',
                    inv='不变式 bst：在每个结点处，左子树中的每个键都更小，',
                    inv2='右子树中的每个键都更大。查找和插入依赖它，插入保持它。')}[L]
    s = SVG(760, 340, T['title'])
    # regions for the invariant at the root of the left tree
    s.rect(30, 106, 140, 122, fill=C['skyp'], stroke=C['blue'], r=10, sw=1.3, dash='5 4')
    s.text(100, 246, T['lt'], size=12, fill=C['blue'], weight=600, anchor='middle')
    s.rect(206, 106, 148, 122, fill=C['purplep'], stroke=C['purple'], r=10, sw=1.3, dash='5 4')
    s.text(280, 246, T['gt'], size=12, fill=C['purple'], weight=600, anchor='middle')
    left = {5: (190, 64), 2: (100, 134), 8: (280, 134), 1: (55, 200), 4: (145, 200), 9: (325, 200)}
    _tree(s, left, [(5, 2), (5, 8), (2, 1), (2, 4), (8, 9)])
    # where the search for 6 ends in t0
    s.line(280, 134, 238, 196, stroke=C['slate'], sw=1.4, dash='4 4')
    s.rect(226, 190, 24, 18, fill=C['bg'], stroke=C['muted'], r=4, sw=1.2)
    s.text(238, 203, 'Lf', size=10.5, fill=C['slate'], anchor='middle', mono=True)
    s.text(190, 30, T['before'], size=14, weight=700, fill=C['navy'], anchor='middle', mono=True)
    # the right tree
    right = {5: (570, 64), 2: (480, 134), 8: (660, 134), 1: (435, 200), 4: (525, 200), 6: (615, 200),
             9: (705, 200)}
    _tree(s, right, [(5, 2), (5, 8), (2, 1), (2, 4), (8, 6), (8, 9)], hl_nodes=(5, 8),
          hl_edges=((5, 8), (8, 6)), new=(6,))
    s.text(570, 30, T['after'], size=14, weight=700, fill=C['navy'], anchor='middle', mono=True)
    s.text(622, 92, T['right'], size=11.5, fill=C['orange'], weight=600)
    s.text(604, 176, T['left'], size=11.5, fill=C['orange'], weight=600, anchor='end')
    s.text(615, 238, T['leaf'], size=11, fill=C['green'], weight=600, anchor='middle', italic=True)
    # arrow between the trees
    s.line(380, 64, 520, 64, stroke=C['slate'], sw=2, arrow=True)
    s.text(450, 54, 'tinsert 6', size=12.5, fill=C['slate'], weight=600, anchor='middle', mono=True)
    # the invariant
    s.rect(20, 270, 720, 58, fill=C['bg'], stroke=C['border'], r=10, sw=1.2)
    s.text(36, 293, T['inv'], size=12.5, fill=C['navy'])
    s.text(36, 314, T['inv2'], size=12.5, fill=C['navy'])
    return s


def fig_12_3(L):
    T = {'en': dict(title='The two-list queue and its abstraction function',
                    conc='Concrete', conc2=['front list and', 'reversed back list'],
                    abs_='Abstract', abs2=['the queue as', 'one list'],
                    front='front', back='back', cop='concrete operation', aop='abstract operation',
                    agree='Both paths give the same list (lemma list_of_enq):'),
         'zh': dict(title='两个表实现的队列及其抽象函数',
                    conc='具体', conc2=['前表与逆序', '存放的后表'],
                    abs_='抽象', abs2=['把队列看成', '一个表'],
                    front='前表', back='后表', cop='具体操作', aop='抽象操作',
                    agree='两条路径得到同一个表（引理 list_of_enq）：')}[L]
    s = SVG(760, 330, T['title'])
    s.text(20, 66, T['conc'], size=13.5, weight=700, fill=C['green'])
    s.lines(20, 86, T['conc2'], size=11.5, fill=C['slate'], gap=16)
    s.text(20, 230, T['abs_'], size=13.5, weight=700, fill=C['blue'])
    s.lines(20, 250, T['abs2'], size=11.5, fill=C['slate'], gap=16)
    # concrete boxes
    for x, q, f, b in ((130, 'Queue [1, 2] [4, 3]', '[1, 2]', '[4, 3]'),
                       (510, 'Queue [1, 2] [5, 4, 3]', '[1, 2]', '[5, 4, 3]')):
        s.rect(x, 30, 230, 82, fill=C['greenp'], stroke=C['green'], r=10, sw=1.7)
        s.text(x + 115, 58, q, size=13.5, mono=True, anchor='middle', fill=C['navy'], weight=600)
        s.text(x + 14, 90, T['front'] + ':', size=11.5, fill=C['slate'])
        s.text(x + 56, 90, f, size=12, mono=True, fill=C['navy'])
        s.text(x + 116, 90, T['back'] + ':', size=11.5, fill=C['slate'])
        s.text(x + 156, 90, b, size=12, mono=True, fill=C['navy'])
    # abstract boxes
    for x, l in ((130, '[1, 2, 3, 4]'), (510, '[1, 2, 3, 4, 5]')):
        s.rect(x, 206, 230, 52, fill=C['skyp'], stroke=C['blue'], r=10, sw=1.7)
        s.text(x + 115, 238, l, size=14, mono=True, anchor='middle', fill=C['navy'], weight=600)
    # horizontal arrows
    s.line(366, 71, 503, 71, stroke=C['green'], sw=2.2, arrow=True)
    s.text(435, 62, 'enq 5', size=13, mono=True, anchor='middle', fill=C['green'], weight=700)
    s.text(435, 90, T['cop'], size=11.5, anchor='middle', fill=C['slate'], italic=True)
    s.line(366, 232, 503, 232, stroke=C['blue'], sw=2.2, arrow=True)
    s.text(435, 223, '@ [5]', size=13, mono=True, anchor='middle', fill=C['blue'], weight=700)
    s.text(435, 251, T['aop'], size=11.5, anchor='middle', fill=C['slate'], italic=True)
    # vertical arrows
    for x in (245, 625):
        s.line(x, 116, x, 200, stroke=C['purple'], sw=2.2, arrow=True)
        s.text(x + 10, 162, 'list_of', size=12.5, mono=True, fill=C['purple'], weight=700)
    # the lemma
    s.text(435, 292, T['agree'], size=12.5, anchor='middle', fill=C['navy'])
    s.text(435, 316, 'list_of (enq x q) = list_of q @ [x]', size=13.5, mono=True, anchor='middle',
           fill=C['navy'], weight=600)
    return s


FIGURES = {'fig-12-1': fig_12_1, 'fig-12-2': fig_12_2, 'fig-12-3': fig_12_3}
