"""Figures of Module 14."""
from figlib import *  # noqa: F401,F403


def fig_14_1(L):
    T = {'en': dict(title='Two ways from an expression to its value',
                    src='Source language', tgt='Target machine',
                    expr='expression e', code='code compile e', val='value', stack='stack',
                    compile='compile', eval='eval e s', exec1='exec (compile e)', exec2='s stk', push='push onto stk',
                    thm='compile_correct:', thm2='both ways give the same stack',
                    state='in the state x = 5, y = 7'),
         'zh': dict(title='从表达式到它的值的两条路',
                    src='源语言', tgt='目标机器',
                    expr='表达式 e', code='代码 compile e', val='值', stack='栈',
                    compile='compile', eval='eval e s', exec1='exec (compile e)', exec2='s stk', push='压入栈 stk',
                    thm='compile_correct：', thm2='两条路得到同一个栈',
                    state='状态为 x = 5，y = 7')}[L]
    s = SVG(760, 360, T['title'])
    # column labels
    s.text(130, 24, T['src'], size=13, weight=700, fill=C['blue'], anchor='middle')
    s.text(588, 24, T['tgt'], size=13, weight=700, fill=C['green'], anchor='middle')
    # top left: expression
    s.rect(20, 38, 220, 82, fill=C['skyp'], stroke=C['blue'], r=12, sw=1.8)
    s.text(130, 60, T['expr'], size=12, fill=C['slate'], anchor='middle', italic=True)
    s.text(130, 84, 'x + (2 + y)', size=15, fill=C['navy'], anchor='middle', mono=True, weight=600)
    s.text(130, 106, "Add (Var ''x'') (Add …)", size=11.5, fill=C['slate'], anchor='middle', mono=True)
    # top right: code
    s.rect(436, 38, 304, 82, fill=C['greenp'], stroke=C['green'], r=12, sw=1.8)
    s.text(588, 60, T['code'], size=12, fill=C['slate'], anchor='middle', italic=True)
    s.text(588, 84, "LOAD ''x'', PUSH 2,", size=13.5, fill=C['navy'], anchor='middle', mono=True, weight=600)
    s.text(588, 106, "LOAD ''y'', ADD, ADD", size=13.5, fill=C['navy'], anchor='middle', mono=True, weight=600)
    # bottom left: value
    s.rect(20, 236, 220, 72, fill=C['skyp'], stroke=C['blue'], r=12, sw=1.8)
    s.text(130, 258, T['val'], size=12, fill=C['slate'], anchor='middle', italic=True)
    s.text(130, 290, '14', size=20, fill=C['navy'], anchor='middle', mono=True, weight=700)
    # bottom right: stack
    s.rect(436, 236, 304, 72, fill=C['greenp'], stroke=C['green'], r=12, sw=1.8)
    s.text(588, 258, T['stack'], size=12, fill=C['slate'], anchor='middle', italic=True)
    s.text(588, 290, '14 # stk', size=20, fill=C['navy'], anchor='middle', mono=True, weight=700)
    # arrows
    s.line(246, 79, 428, 79, stroke=C['purple'], sw=2.4, arrow=True)
    s.text(337, 70, T['compile'], size=13, fill=C['purple'], anchor='middle', mono=True, weight=700)
    s.line(130, 126, 130, 228, stroke=C['blue'], sw=2.2, arrow=True)
    s.text(140, 182, T['eval'], size=12.5, fill=C['blue'], mono=True, weight=600)
    s.line(588, 126, 588, 228, stroke=C['green'], sw=2.2, arrow=True)
    s.text(598, 176, T['exec1'], size=12.5, fill=C['green'], mono=True, weight=600)
    s.text(598, 194, T['exec2'], size=12.5, fill=C['green'], mono=True, weight=600)
    s.line(246, 272, 428, 272, stroke=C['slate'], sw=2.2, arrow=True)
    s.text(337, 263, T['push'], size=12, fill=C['slate'], anchor='middle', weight=600)
    # the claim in the middle
    s.rect(244, 148, 188, 58, fill=C['white'], stroke=C['orange'], r=10, sw=1.6, dash='5 4')
    s.text(338, 171, T['thm'], size=12, fill=C['orange'], anchor='middle', mono=True, weight=700)
    s.text(338, 192, T['thm2'], size=11.5, fill=C['orange'], anchor='middle', weight=600)
    s.text(380, 340, T['state'], size=12, fill=C['slate'], anchor='middle', italic=True)
    return s


def fig_14_2(L):
    T = {'en': dict(title='Running the code of x + (2 + y)', start='start',
                    note='x = 5, y = 7. The top of the stack is the head of the list, drawn at the top.',
                    top='top'),
         'zh': dict(title='运行 x + (2 + y) 的代码', start='开始',
                    note='x = 5，y = 7。栈顶就是列表的头，画在最上面。',
                    top='栈顶')}[L]
    s = SVG(760, 262, T['title'])
    steps = [(T['start'], []), ("LOAD ''x''", [5]), ('PUSH 2', [2, 5]), ("LOAD ''y''", [7, 2, 5]),
             ('ADD', [9, 5]), ('ADD', [14])]
    colw = 124
    x0 = 18
    base = 176           # bottom of the stack piles
    cell = 30
    prev_right = None
    for i, (ins, stk) in enumerate(steps):
        cx = x0 + i * colw + 52
        if i == 0:
            s.text(cx, 34, ins, size=12.5, fill=C['slate'], anchor='middle', italic=True)
            half = 22
        else:
            half = s.pill(cx, 34, ins, kind='cmd', size=11.5) / 2
            s.line(prev_right + 6, 29, cx - half - 8, 29, stroke=C['muted'], sw=1.6, arrow=True)
        prev_right = cx + half
        s.line(cx - 34, base, cx + 34, base, stroke=C['slate'], sw=2)
        for k, v in enumerate(reversed(stk)):
            y = base - (k + 1) * cell
            topmost = k == len(stk) - 1
            s.rect(cx - 30, y + 2, 60, cell - 4, fill=C['skyl'] if topmost else C['skyp'],
                   stroke=C['blue'] if topmost else C['border'], r=6, sw=1.5 if topmost else 1.2)
            s.text(cx, y + cell / 2 + 6, str(v), size=15, fill=C['navy'], anchor='middle', mono=True, weight=600)
        txt = '[' + ', '.join(str(v) for v in stk) + ']'
        s.text(cx, base + 28, txt, size=13, fill=C['navy'], anchor='middle', mono=True)
    cx3 = x0 + 3 * colw + 52
    s.text(cx3 + 36, base - 3 * cell + 19, '← ' + T['top'], size=11.5, fill=C['blue'], weight=600)
    s.text(380, 246, T['note'], size=12, fill=C['slate'], anchor='middle', italic=True)
    return s


def fig_14_3(L):
    T = {'en': dict(title='The shape of the correctness proof for Add a b',
                    head='The stack while compile (Add a b) runs', why='Why the step is right',
                    iha='hypothesis for a, with the stack stk', ihb='hypothesis for b, with the stack',
                    ihb2='eval a s # stk, which is not stk', run='the equation of exec1 for ADD',
                    conc=['The hypothesis for b is needed for a stack other than stk. So the claim must',
                          'hold for every stack: the induction needs arbitrary: stk.']),
         'zh': dict(title='Add a b 情形下正确性证明的结构',
                    head='compile (Add a b) 运行时的栈', why='每一步为什么成立',
                    iha='a 的归纳假设，用于栈 stk', ihb='b 的归纳假设，用于栈',
                    ihb2='eval a s # stk，它不是 stk', run='exec1 关于 ADD 的方程',
                    conc=['b 的归纳假设要用在一个不是 stk 的栈上。所以命题必须',
                          '对每个栈都成立：归纳时需要写 arbitrary: stk。'])}[L]
    s = SVG(760, 380, T['title'])
    s.text(40, 26, T['head'], size=13, weight=700, fill=C['slate'])
    s.text(392, 26, T['why'], size=13, weight=700, fill=C['slate'])
    stacks = ['stk', 'eval a s # stk', 'eval b s # eval a s # stk', '(eval a s + eval b s) # stk']
    segs = [('compile a', C['blue'], C['skyp'], [T['iha']]),
            ('compile b', C['purple'], C['purplep'], [T['ihb'], T['ihb2']]),
            ('ADD', C['green'], C['greenp'], [T['run']])]
    top, step = 42, 76
    for i, st in enumerate(stacks):
        y = top + i * step
        s.rect(40, y, 250, 30, fill=C['bg'], stroke=C['slate'], r=8, sw=1.4)
        s.text(165, y + 20, st, size=12.5, fill=C['navy'], anchor='middle', mono=True, weight=600)
        if i < 3:
            label, col, bg, note = segs[i]
            s.line(165, y + 34, 165, y + step - 6, stroke=col, sw=2.2, arrow=True)
            s.pill(178, y + 58, label, kind='plain', size=12, anchor='start')
            s.line(300, y + 52, 380, y + 52, stroke=col, sw=1.4, dash='4 4')
            s.rect(386, y + 34, 354, 40 if len(note) == 1 else 50, fill=bg, stroke=col, r=8, sw=1.4)
            s.lines(398, y + 58 if len(note) == 1 else y + 54, note, size=12.5, fill=col, gap=18)
    s.rect(20, 314, 720, 56, fill=C['orangep'], stroke=C['orange'], r=10, sw=1.4)
    s.lines(36, 337, T['conc'], size=13, fill=C['navy'], gap=21)
    return s


FIGURES = {'fig-14-1': fig_14_1, 'fig-14-2': fig_14_2, 'fig-14-3': fig_14_3}
