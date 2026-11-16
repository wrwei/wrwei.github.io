"""Figures of Module 8."""
from figlib import *  # noqa: F401,F403


def fig_08_1(L):
    T = {'en': dict(title='The type of a curried function',
                    s1='a function of two numbers', s1b='takes the first number …',
                    s2='… and returns a function', s2b='that waits for the second',
                    s3='a number',
                    app3='apply to 3', app4='apply to 4',
                    k1=('nat ⇒ nat ⇒ nat', 'nat ⇒ (nat ⇒ nat)'), means='means',
                    k1n='⇒ groups to the right',
                    k2=('(+) 3 4', '((+) 3) 4'),
                    k2n='application groups to the left'),
         'zh': dict(title='柯里化函数的类型',
                    s1='一个有两个数参数的函数', s1b='先接受第一个数……',
                    s2='……返回一个函数', s2b='它等待第二个数',
                    s3='一个数',
                    app3='应用于 3', app4='应用于 4',
                    k1=('nat ⇒ nat ⇒ nat', 'nat ⇒ (nat ⇒ nat)'), means='即',
                    k1n='⇒ 向右结合',
                    k2=('(+) 3 4', '((+) 3) 4'),
                    k2n='函数应用向左结合')}[L]
    s = SVG(760, 300, T['title'])
    boxes = [(20, '(+)', 'nat ⇒ (nat ⇒ nat)', T['s1'], T['s1b'], C['blue'], C['skyp']),
             (290, '(+) 3', 'nat ⇒ nat', T['s2'], T['s2b'], C['purple'], C['purplep']),
             (560, '(+) 3 4', 'nat', T['s3'], '= 7', C['green'], C['greenp'])]
    for x, term, typ, d1, d2, col, bg in boxes:
        s.rect(x, 24, 180, 140, fill=bg, stroke=col, r=12, sw=1.8)
        s.text(x + 90, 60, term, size=16, weight=700, fill=col, anchor='middle', mono=True)
        s.text(x + 90, 88, ':: ' + typ, size=13, fill=C['navy'], anchor='middle', mono=True)
        s.text(x + 90, 120, d1, size=12, fill=C['slate'], anchor='middle')
        s.text(x + 90, 140, d2, size=12, fill=C['slate'], anchor='middle', mono=(d2 == '= 7'))
    for x1, lab in ((204, T['app3']), (474, T['app4'])):
        s.line(x1, 94, x1 + 78, 94, stroke=C['slate'], sw=2, arrow=True)
        s.text(x1 + 40, 84, lab, size=12, fill=C['slate'], weight=600, anchor='middle')
    # the two grouping rules
    s.rect(20, 190, 720, 92, fill=C['bg'], stroke=C['border'], r=10, sw=1.2)
    for y, (a, b), note in ((224, T['k1'], T['k1n']), (260, T['k2'], T['k2n'])):
        s.text(44, y, a, size=14, fill=C['navy'], mono=True)
        s.text(206, y, T['means'], size=13, fill=C['slate'], anchor='middle', italic=True)
        s.text(250, y, b, size=14, fill=C['navy'], mono=True)
        s.text(716, y, note, size=12, fill=C['slate'], anchor='end', italic=True)
    return s


def _tree(s, x, y, labels, leaf, dx=62, dy=50, col=C['blue'], bg=C['skyp']):
    """A right-leaning chain: each node has its element on the left and the rest on the right."""
    for i, (node, elem) in enumerate(labels):
        nx, ny = x + i * dx, y + i * dy
        s.rect(nx - 30, ny - 16, 60, 28, fill=bg, stroke=col, r=8, sw=1.6)
        s.text(nx, ny + 3, node, size=13, weight=700, fill=col, anchor='middle', mono=True)
        # element child (down-left)
        ex, ey = nx - 34, ny + dy
        s.line(nx - 10, ny + 12, ex + 4, ey - 15, stroke=C['slate'], sw=1.6)
        s.circle(ex, ey - 4, 13, fill=C['white'], stroke=C['slate'], sw=1.4)
        s.text(ex, ey + 1, elem, size=13, fill=C['navy'], anchor='middle', mono=True)
        # rest child (down-right)
        s.line(nx + 10, ny + 12, nx + dx - 8, ny + dy - 16, stroke=C['slate'], sw=1.6)
    lx, ly = x + len(labels) * dx, y + len(labels) * dy
    w = max(60, len(leaf) * 9 + 20)
    s.rect(lx - w / 2, ly - 16, w, 28, fill=C['bg'], stroke=C['slate'], r=8, sw=1.4)
    s.text(lx, ly + 3, leaf, size=13, weight=700, fill=C['slate'], anchor='middle', mono=True)


def fig_08_2(L):
    T = {'en': dict(title='A datatype value drawn as a tree',
                    left='A stack', right='A list',
                    lt='Push 1 (Push 2 (Push 3 Empty))', rt='1 # 2 # 3 # []   =   [1, 2, 3]',
                    note=['The same shape: a constructor with an element', 'and the rest, until the constructor without arguments.']),
         'zh': dict(title='把数据类型的值画成一棵树',
                    left='一个栈', right='一个列表',
                    lt='Push 1 (Push 2 (Push 3 Empty))', rt='1 # 2 # 3 # []   =   [1, 2, 3]',
                    note=['形状相同：每个构造子带一个元素和其余部分，', '直到遇到不带参数的构造子为止。'])}[L]
    s = SVG(760, 360, T['title'])
    for x0, head, sub, col, bg in ((20, T['left'], T['lt'], C['blue'], C['skyp']),
                                   (390, T['right'], T['rt'], C['green'], C['greenp'])):
        s.rect(x0, 16, 350, 280, fill=C['white'], stroke=C['border'], r=12, sw=1.2)
        s.text(x0 + 20, 42, head, size=15, weight=700, fill=col)
        s.text(x0 + 20, 64, sub, size=12.5, fill=C['navy'], mono=True)
    _tree(s, 120, 104, [('Push', '1'), ('Push', '2'), ('Push', '3')], 'Empty')
    _tree(s, 490, 104, [('#', '1'), ('#', '2'), ('#', '3')], '[]', col=C['green'], bg=C['greenp'])
    s.lines(380, 322, T['note'], size=12.5, anchor='middle', fill=C['slate'], gap=19)
    return s


def _light(s, x, y, name, r=11):
    """A small traffic-light symbol for one state."""
    on = {'Red': [C['red']], 'RedAmber': [C['red'], C['amber']], 'Green': [C['green']], 'Amber': [C['amber']]}[name]
    if len(on) == 1:
        s.circle(x, y, r, fill=on[0], stroke=on[0], sw=1)
    else:
        s.circle(x - r + 2, y, r - 2, fill=on[0], stroke=on[0], sw=1)
        s.circle(x + r - 2, y, r - 2, fill=on[1], stroke=on[1], sw=1)


def fig_08_3(L):
    T = {'en': dict(title='How map, filter and foldr transform a list',
                    map='map duration', filt='filter (λd. d < 10)', fold='foldr (+) … 0',
                    mapn='applies the function to every element', filtn='keeps the elements that pass the test',
                    foldn='combines the elements from the right',
                    names=['Red', 'RedAmber', 'Green', 'Amber']),
         'zh': dict(title='map、filter 与 foldr 如何变换列表',
                    map='map duration', filt='filter (λd. d < 10)', fold='foldr (+) … 0',
                    mapn='把函数作用到每个元素上', filtn='保留通过检验的元素',
                    foldn='从右向左合并各元素',
                    names=['Red', 'RedAmber', 'Green', 'Amber'])}[L]
    s = SVG(760, 420, T['title'])
    xs = [320, 430, 540, 650]
    durs = ['30', '2', '25', '3']
    # row 1: the lights
    s.text(268, 50, '[', size=30, fill=C['slate'], mono=True)
    for x, n in zip(xs, T['names']):
        _light(s, x, 40, n)
        s.text(x, 70, n, size=12.5, fill=C['navy'], anchor='middle', mono=True)
    s.text(730, 50, ']', size=30, fill=C['slate'], anchor='end', mono=True)
    # map
    for x in xs:
        s.line(x, 80, x, 112, stroke=C['blue'], sw=1.8, arrow=True)
    s.pill(20, 112, T['map'], kind='head', size=12, anchor='start')
    s.text(22, 138, T['mapn'], size=12, fill=C['slate'], italic=True)
    for x, d in zip(xs, durs):
        s.rect(x - 24, 120, 48, 30, fill=C['skyp'], stroke=C['blue'], r=8, sw=1.5)
        s.text(x, 141, d, size=15, weight=700, fill=C['navy'], anchor='middle', mono=True)
    # filter
    keep = [False, True, False, True]
    for x, k in zip(xs, keep):
        if k:
            s.line(x, 156, x, 196, stroke=C['green'], sw=1.8, arrow=True)
        else:
            s.line(x - 9, 168, x + 9, 186, stroke=C['red'], sw=2)
            s.line(x + 9, 168, x - 9, 186, stroke=C['red'], sw=2)
    s.pill(20, 196, T['filt'], kind='branch', size=12, anchor='start')
    s.text(22, 222, T['filtn'], size=12, fill=C['slate'], italic=True)
    for x, d, k in zip(xs, durs, keep):
        if k:
            s.rect(x - 24, 204, 48, 30, fill=C['greenp'], stroke=C['green'], r=8, sw=1.5)
            s.text(x, 225, d, size=15, weight=700, fill=C['navy'], anchor='middle', mono=True)
    s.text(485, 258, '[2, 3]', size=13, fill=C['green'], anchor='middle', mono=True, weight=600)
    # foldr: 30 + (2 + (25 + (3 + 0)))
    s.rect(20, 280, 720, 124, fill=C['bg'], stroke=C['border'], r=10, sw=1.2)
    s.pill(40, 312, T['fold'], kind='plain', size=12, anchor='start')
    s.text(716, 311, T['foldn'], size=12, fill=C['slate'], anchor='end', italic=True)
    s.text(380, 352, 'foldr (+) [30, 2, 25, 3] 0 = 30 + (2 + (25 + (3 + 0)))', size=14, fill=C['navy'],
           anchor='middle', mono=True)
    s.text(380, 384, '= 60', size=15, weight=700, fill=C['purple'], anchor='middle', mono=True)
    return s


FIGURES = {'fig-08-1': fig_08_1, 'fig-08-2': fig_08_2, 'fig-08-3': fig_08_3}
