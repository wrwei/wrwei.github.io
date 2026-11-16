"""Figures of Module 11."""
from figlib import *  # noqa: F401,F403


def fig_11_1(L):
    T = {'en': dict(title='Why the claim must hold for every accumulator',
                    calls='The calls of sumacc [3, 1, 4] 0', inv='acc + sum_list of the rest',
                    narrow=['sumacc xs 0 = sum_list xs', 'speaks about the first call only'],
                    wide=['sumacc xs acc = acc + sum_list xs', 'holds at every call: an invariant'],
                    result='result'),
         'zh': dict(title='为什么命题必须对每个累加器值成立',
                    calls='sumacc [3, 1, 4] 0 的各次调用', inv='acc + 剩余部分的 sum_list',
                    narrow=['sumacc xs 0 = sum_list xs', '只涉及第一次调用'],
                    wide=['sumacc xs acc = acc + sum_list xs', '在每次调用时都成立：一个不变式'],
                    result='结果')}[L]
    s = SVG(760, 300, T['title'])
    s.text(20, 26, T['calls'], size=13, weight=700, fill=C['slate'])
    calls = [('sumacc [3, 1, 4] 0', '0 + 8 = 8'), ('sumacc [1, 4] 3', '3 + 5 = 8'),
             ('sumacc [4] 4', '4 + 4 = 8'), ('sumacc [] 8', '8 + 0 = 8')]
    xs = [20, 194, 368, 542]
    w = 146
    for i, (call, inv) in enumerate(calls):
        x = xs[i]
        first = i == 0
        s.rect(x, 40, w, 46, fill=C['redp'] if first else C['skyp'], stroke=C['red'] if first else C['blue'], r=10, sw=1.6)
        s.text(x + w / 2, 68, call, size=12.5, anchor='middle', mono=True, fill=C['navy'])
        s.text(x + w / 2, 128, inv, size=13, anchor='middle', mono=True, fill=C['green'], weight=600)
        if i < 3:
            s.line(x + w + 3, 63, xs[i + 1] - 5, 63, stroke=C['slate'], sw=1.8, arrow=True)
    for i, d in enumerate(['+3', '+1', '+4']):
        s.text(xs[i] + w + 14, 52, d, size=11, anchor='middle', fill=C['slate'], weight=600, mono=True)
    s.line(695, 63, 712, 63, stroke=C['slate'], sw=1.8, arrow=True)
    s.text(726, 68, '8', size=15, anchor='middle', weight=700, fill=C['navy'], mono=True)
    s.text(726, 90, T['result'], size=11, anchor='middle', fill=C['slate'], italic=True)
    s.text(20, 106, T['inv'], size=11.5, fill=C['green'], italic=True)
    # brackets
    s.path(f'M{xs[0]} 150 V160 H{xs[0] + w} V150', stroke=C['red'], sw=2)
    s.text(xs[0], 184, T['narrow'][0], size=12.5, fill=C['red'], mono=True, weight=600)
    s.text(xs[0], 203, T['narrow'][1], size=12.5, fill=C['red'])
    s.path(f'M{xs[0]} 222 V232 H{xs[3] + w} V222', stroke=C['green'], sw=2)
    s.text(xs[0], 256, T['wide'][0], size=12.5, fill=C['green'], mono=True, weight=600)
    s.text(xs[0], 276, T['wide'][1], size=12.5, fill=C['green'])
    return s


def fig_11_3(L):
    T = {'en': dict(title='Rule induction follows the derivation',
                    eps='ε', h1='A derivation of bal (())()', n1='Read from the top: each bar is one',
                    n1b='rule application, with the rule’s name.', n2='Rule induction shows that every rule',
                    n2b='passes P from its premises to its', n2c='conclusion, and that P holds for rules',
                    n2d='without premises.', n3='Then P holds at every node, down',
                    n3b='to the root: for every balanced word.', flow='P flows down'),
         'zh': dict(title='规则归纳沿着推导进行',
                    eps='ε', h1='bal (())() 的一个推导', n1='从上往下读：每条横线是一次',
                    n1b='规则应用，旁边写着规则名。', n2='规则归纳要证明：每条规则都把',
                    n2b='前提上的 P 传给结论，没有前提的', n2c='规则的结论也满足 P。',
                    n2d='', n3='于是 P 在每个结点上都成立，一直',
                    n3b='到根：对每个平衡的词都成立。', flow='P 向下传递')}[L]
    s = SVG(760, 330, T['title'])
    s.text(20, 26, T['h1'], size=13, weight=700, fill=C['slate'])

    def node(x, y, label):
        s.rect(x - 62, y - 18, 124, 28, fill=C['greenp'], stroke=C['green'], r=8, sw=1.5)
        s.text(x, y + 1, label, size=13, anchor='middle', mono=True, fill=C['navy'])

    def bar(x1, x2, y, rule):
        s.line(x1, y, x2, y, stroke=C['navy'], sw=1.6)
        s.text(x2 + 8, y + 4, rule, size=11.5, fill=C['purple'], mono=True, weight=600)

    lx, rx, cx = 110, 320, 215
    e = T['eps']
    # left branch: bal ε -> bal () -> bal (())
    bar(lx - 50, lx + 50, 58, 'bal_nil')
    node(lx, 84, 'bal ' + e)
    bar(lx - 62, lx + 62, 110, 'bal_wrap')
    node(lx, 136, 'bal ()')
    bar(lx - 62, lx + 62, 162, 'bal_wrap')
    node(lx, 188, 'bal (())')
    # right branch: bal ε -> bal ()
    bar(rx - 50, rx + 50, 110, 'bal_nil')
    node(rx, 136, 'bal ' + e)
    bar(rx - 62, rx + 62, 162, 'bal_wrap')
    node(rx, 188, 'bal ()')
    # root
    bar(lx - 62, rx + 62, 216, 'bal_cat')
    s.rect(cx - 70, 224, 140, 30, fill=C['green'], stroke=C['green'], r=8, sw=1.5)
    s.text(cx, 244, 'bal (())()', size=13.5, anchor='middle', mono=True, fill=C['white'], weight=700)
    # flow arrow
    s.line(466, 70, 466, 238, stroke=C['green'], sw=3, arrow=True)
    s.text(466, 262, T['flow'], size=12, anchor='middle', fill=C['green'], weight=700)
    # notes
    s.lines(494, 60, [T['n1'], T['n1b']], size=12.5, fill=C['navy'], gap=18)
    rows = [T['n2'], T['n2b'], T['n2c']] + ([T['n2d']] if T['n2d'] else [])
    s.lines(494, 118, rows, size=12.5, fill=C['green'], gap=18)
    s.lines(494, 206, [T['n3'], T['n3b']], size=12.5, fill=C['navy'], gap=18)
    for i, t in enumerate(['( = LP', ') = RP', e + ' = []']):
        s.text(20 + i * 90, 300, t, size=12, fill=C['slate'], mono=True)
    return s


def fig_11_2(L):
    T = {'en': dict(title='Computation induction follows the recursion of merge',
                    run='One run:', eqs='The equations of merge', cases='The cases of merge.induct',
                    c3='assuming', ih='one induction hypothesis per recursive call',
                    shrink1='first list shorter', shrink2='second list shorter'),
         'zh': dict(title='计算归纳沿着 merge 的递归进行',
                    run='一次运行：', eqs='merge 的定义方程', cases='merge.induct 的情形',
                    c3='假设', ih='每个递归调用对应一个归纳假设',
                    shrink1='第一个列表变短', shrink2='第二个列表变短')}[L]
    s = SVG(760, 372, T['title'])
    # a run
    s.text(20, 28, T['run'], size=12.5, weight=700, fill=C['slate'])
    run = ['merge [1,4] [2,3]', 'merge [4] [2,3]', 'merge [4] [3]', 'merge [4] []']
    xs = [92, 262, 432, 592]
    for i, t in enumerate(run):
        s.text(xs[i], 28, t, size=12, mono=True, fill=C['navy'])
    for i in range(3):
        x1 = xs[i] + (len(run[i]) * 7.3) + 4
        s.line(x1, 24, xs[i + 1] - 6, 24, stroke=C['slate'], sw=1.6, arrow=True)
    s.text(232, 48, T['shrink1'], size=11, fill=C['blue'], anchor='middle', italic=True)
    s.text(400, 48, T['shrink2'], size=11, fill=C['purple'], anchor='middle', italic=True)
    s.text(568, 48, T['shrink2'], size=11, fill=C['purple'], anchor='middle', italic=True)
    # columns
    s.rect(20, 66, 350, 290, fill=C['bg'], stroke=C['border'], r=12, sw=1.4)
    s.rect(390, 66, 350, 290, fill=C['greenp'], stroke=C['green'], r=12, sw=1.4)
    s.text(36, 92, T['eqs'], size=13, weight=700, fill=C['slate'])
    s.text(406, 92, T['cases'], size=13, weight=700, fill=C['green'])
    # equations
    s.text(36, 128, '1', size=12, weight=700, fill=C['slate'])
    s.text(56, 128, 'merge [] ys = ys', size=12.5, mono=True, fill=C['navy'])
    s.text(36, 164, '2', size=12, weight=700, fill=C['slate'])
    s.text(56, 164, 'merge (x#xs) [] = x#xs', size=12.5, mono=True, fill=C['navy'])
    s.text(36, 200, '3', size=12, weight=700, fill=C['slate'])
    s.text(56, 200, 'merge (x#xs) (y#ys) =', size=12.5, mono=True, fill=C['navy'])
    s.text(70, 222, 'if x ≤ y then', size=12.5, mono=True, fill=C['navy'])
    s.text(84, 244, 'x # merge xs (y#ys)', size=12.5, mono=True, fill=C['blue'], weight=600)
    s.text(70, 266, 'else', size=12.5, mono=True, fill=C['navy'])
    s.text(84, 288, 'y # merge (x#xs) ys', size=12.5, mono=True, fill=C['purple'], weight=600)
    # cases
    s.text(406, 128, '1', size=12, weight=700, fill=C['green'])
    s.text(426, 128, 'P [] ys', size=12.5, mono=True, fill=C['navy'])
    s.text(406, 164, '2', size=12, weight=700, fill=C['green'])
    s.text(426, 164, 'P (x#xs) []', size=12.5, mono=True, fill=C['navy'])
    s.text(406, 200, '3', size=12, weight=700, fill=C['green'])
    s.text(426, 200, 'P (x#xs) (y#ys),', size=12.5, mono=True, fill=C['navy'])
    s.text(426, 222, T['c3'], size=12, fill=C['slate'], italic=True)
    s.text(440, 244, 'x ≤ y ⟹ P xs (y#ys)', size=12.5, mono=True, fill=C['blue'], weight=600)
    s.text(440, 288, '¬ x ≤ y ⟹ P (x#xs) ys', size=12.5, mono=True, fill=C['purple'], weight=600)
    # arrows from calls to hypotheses
    s.line(316, 240, 432, 240, stroke=C['blue'], sw=1.8, arrow=True)
    s.line(316, 284, 432, 284, stroke=C['purple'], sw=1.8, arrow=True)
    s.line(188, 128, 396, 128, stroke=C['border'], sw=1.2, dash='4 4')
    s.line(232, 164, 396, 164, stroke=C['border'], sw=1.2, dash='4 4')
    s.line(232, 200, 396, 200, stroke=C['border'], sw=1.2, dash='4 4')
    s.text(565, 336, T['ih'], size=11.5, fill=C['green'], anchor='middle', italic=True)
    return s


FIGURES = {'fig-11-1': fig_11_1, 'fig-11-2': fig_11_2, 'fig-11-3': fig_11_3}
