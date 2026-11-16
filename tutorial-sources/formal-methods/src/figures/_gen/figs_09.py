"""Figures of Module 9."""
from html import escape

from figlib import *  # noqa: F401,F403


def term_with_redex(s, x, y, pre, red, post, size=14, col=C['navy'], red_col=C['blue']):
    """A term in Isabelle's font with its redex in bold colour (tspans keep the spacing exact)."""
    s.add(f'<text x="{x}" y="{y}" font-family="{MONO}" font-size="{size}" fill="{col}">'
          f'{escape(pre)}<tspan fill="{red_col}" font-weight="700">{escape(red)}</tspan>{escape(post)}</text>')


def fig_09_1(L):
    T = {'en': dict(title='Rewriting a goal step by step',
                    rule='rule', done='proved',
                    n1=['The bold blue part is', 'rewritten in the next step.'],
                    n2=['Inner parts first:', 'grant u Read es is rewritten', 'before the term around it.'],
                    n3=['Each step replaces an instance', 'of a rule’s left side by the', 'same instance of its right side.']),
         'zh': dict(title='逐步重写一个目标',
                    rule='规则', done='得证',
                    n1=['蓝色粗体部分是', '下一步要重写的部分。'],
                    n2=['先内后外：先重写', 'grant u Read es，', '再重写包含它的项。'],
                    n3=['每一步把规则左边的一个实例', '替换为右边的相同实例。'])}[L]
    steps = [
        ('allows (', 'grant u Read es', ') u Read'),
        ('', 'allows ((u, Read) # es) u Read', ''),
        ('', '(u, Read) = (u, Read)', ' ∨ allows es u Read'),
        ('', 'True ∨ allows es u Read', ''),
        ('', 'True', ''),
    ]
    rules = ['(1)  grant u p es = (u, p) # es',
             '(2)  allows (e # es) u p = (e = (u, p) ∨ allows es u p)',
             '(3)  (x = x) = True',
             '(4)  (True ∨ P) = True']
    s = SVG(760, 432, T['title'])
    box_h, gap, x0, w = 40, 46, 20, 400
    for i, (pre, red, post) in enumerate(steps):
        y = 16 + i * (box_h + gap)
        last = i == len(steps) - 1
        s.rect(x0, y, w if not last else 120, box_h, fill=C['greenp'] if last else C['bg'],
               stroke=C['green'] if last else C['border'], r=8, sw=1.5)
        term_with_redex(s, x0 + 14, y + 26, pre, red, post, red_col=C['green'] if last else C['blue'])
        if last:
            s.pill(x0 + 200, y + 25, '⊢ ' + T['done'], kind='branch', size=12)
        else:
            ay = y + box_h
            s.line(x0 + 40, ay + 4, x0 + 40, ay + gap - 6, stroke=C['slate'], sw=2, arrow=True)
            s.text(x0 + 58, ay + 28, rules[i], size=12, fill=C['slate'], mono=True)
    # notes on the right
    for k, (rows, col) in enumerate(((T['n1'], C['blue']), (T['n2'], C['navy']), (T['n3'], C['navy']))):
        y = 40 + k * 100
        s.circle(532, y - 5, 11, fill=col, stroke=col, sw=1)
        s.text(532, y, str(k + 1), size=12, weight=700, fill=C['white'], anchor='middle')
        s.lines(552, y, rows, size=12.5, fill=col)
    return s


def fig_09_2(L):
    T = {'en': dict(title='How Sledgehammer finds a proof',
                    goal='Your goal', filt='Relevance filter', filtk=['picks up to about', '1000 library facts'],
                    trans='Translation', transk=['into the language', 'of each prover'],
                    provers='External provers', atp='E, Vampire, SPASS,', atp2='Zipperposition', smt='cvc5, veriT, Z3 (SMT)',
                    found='A prover finds a proof', foundk='facts used:',
                    recon='Reconstruction in Isabelle', reconk='“Try this:” one-line proof',
                    kernel='Kernel', kernelk='checks every step', thm='theorem',
                    outside='outside Isabelle: not trusted', inside='inside Isabelle',
                    note=['If a prover or the translation is wrong, reconstruction fails.',
                          'A false statement never becomes a theorem.']),
         'zh': dict(title='Sledgehammer 如何找到证明',
                    goal='你的目标', filt='相关性过滤', filtk=['从库中挑选', '至多约 1000 条事实'],
                    trans='翻译', transk=['译成各个证明器', '的输入语言'],
                    provers='外部证明器', atp='E、Vampire、SPASS、', atp2='Zipperposition', smt='cvc5、veriT、Z3（SMT）',
                    found='某个证明器找到证明', foundk='用到的事实：',
                    recon='在 Isabelle 中重建', reconk='“Try this:” 单行证明',
                    kernel='内核', kernelk='检查每一步', thm='定理',
                    outside='Isabelle 之外：不被信任', inside='Isabelle 之内',
                    note=['如果证明器或翻译出错，重建就会失败。',
                          '错误的命题永远不会成为定理。'])}[L]
    s = SVG(760, 360, T['title'])
    # zones
    s.rect(560, 14, 190, 266, fill=C['orangep'], stroke=C['orange'], r=14, sw=1.6, dash='6 5')
    s.text(655, 272, T['outside'], size=11.5, fill=C['orange'], weight=600, anchor='middle')
    s.rect(10, 14, 530, 266, fill=C['white'], stroke=C['border'], r=14, sw=1.4, dash='6 5')
    s.text(275, 272, T['inside'], size=11.5, fill=C['slate'], weight=600, anchor='middle')
    # top row: goal -> filter -> translation -> provers
    s.rect(22, 30, 150, 86, fill=C['skyp'], stroke=C['blue'], r=10, sw=1.6)
    s.text(97, 54, T['goal'], size=14, weight=700, fill=C['blue'], anchor='middle')
    s.lines(97, 80, ['x ≤ y ⟹', 'x * x ≤ y * y'], size=12.5, anchor='middle', mono=True, gap=18)
    s.rect(200, 30, 150, 86, fill=C['bg'], stroke=C['slate'], r=10, sw=1.5)
    s.text(275, 54, T['filt'], size=14, weight=700, fill=C['navy'], anchor='middle')
    s.lines(275, 78, T['filtk'], size=12, anchor='middle', fill=C['slate'])
    s.rect(378, 30, 150, 86, fill=C['bg'], stroke=C['slate'], r=10, sw=1.5)
    s.text(453, 54, T['trans'], size=14, weight=700, fill=C['navy'], anchor='middle')
    s.lines(453, 78, T['transk'], size=12, anchor='middle', fill=C['slate'])
    s.rect(572, 30, 166, 86, fill=C['white'], stroke=C['orange'], r=10, sw=1.6)
    s.text(655, 52, T['provers'], size=14, weight=700, fill=C['orange'], anchor='middle')
    s.lines(655, 72, [T['atp'], T['atp2'], T['smt']], size=11.5, anchor='middle', fill=C['navy'], gap=15)
    for x1, x2 in ((172, 200), (350, 378), (528, 572)):
        s.line(x1 + 2, 73, x2 - 4, 73, stroke=C['slate'], sw=2, arrow=True)
    # bottom row: found -> reconstruction -> kernel
    s.line(655, 118, 655, 158, stroke=C['slate'], sw=2, arrow=True)
    s.rect(572, 162, 166, 82, fill=C['white'], stroke=C['orange'], r=10, sw=1.6)
    s.text(655, 186, T['found'], size=13, weight=700, fill=C['orange'], anchor='middle')
    s.text(655, 208, T['foundk'], size=12, fill=C['slate'], anchor='middle')
    s.text(655, 228, 'mult_le_mono', size=12.5, fill=C['navy'], anchor='middle', mono=True)
    s.rect(300, 162, 228, 82, fill=C['purplep'], stroke=C['purple'], r=10, sw=1.6)
    s.text(414, 186, T['recon'], size=13.5, weight=700, fill=C['purple'], anchor='middle')
    s.text(414, 208, T['reconk'], size=12, fill=C['slate'], anchor='middle')
    s.text(414, 229, 'by (metis mult_le_mono)', size=12.5, fill=C['navy'], anchor='middle', mono=True)
    s.rect(40, 162, 210, 82, fill=C['greenp'], stroke=C['green'], r=10, sw=2.4)
    s.text(145, 186, T['kernel'], size=14, weight=700, fill=C['green'], anchor='middle')
    s.text(145, 206, T['kernelk'], size=12, fill=C['green'], anchor='middle')
    s.pill(145, 232, '⊢ ' + T['thm'], kind='branch', size=12)
    s.line(572, 203, 532, 203, stroke=C['slate'], sw=2, arrow=True)
    s.line(300, 203, 254, 203, stroke=C['slate'], sw=2, arrow=True)
    s.lines(380, 312, T['note'], size=12.5, anchor='middle', fill=C['navy'])
    return s


def fig_09_3(L):
    T = {'en': dict(title='Which method to try first',
                    kind='The goal is about …', try_='Try first',
                    rows=[('equations, definitions, functions on lists and numbers', ['simp', 'auto']),
                          ('all lists or numbers, with a recursive function', ['induction', 'then simp, auto']),
                          ('∀ ∃ ∧ ∨ ⟶, sets and relations, no arithmetic', ['blast']),
                          ('logic mixed with equations', ['fastforce', 'force', 'auto']),
                          ('+ − < ≤, numbers times variables', ['linarith', 'arith']),
                          ('even, odd, div and mod by numbers, ∃ over numbers', ['presburger']),
                          ('products of variables; a lemma you cannot name', ['find_theorems', 'sledgehammer']),
                          ('a claim you are not sure of', ['quickcheck', 'nitpick'])]),
         'zh': dict(title='先试哪种方法',
                    kind='目标的内容是……', try_='先试',
                    rows=[('等式、定义、列表与数上的函数', ['simp', 'auto']),
                          ('关于所有列表或所有数、含递归函数', ['induction', '然后 simp、auto']),
                          ('∀ ∃ ∧ ∨ ⟶、集合与关系，无算术', ['blast']),
                          ('逻辑与等式交织', ['fastforce', 'force', 'auto']),
                          ('+ − < ≤，数与变量相乘', ['linarith', 'arith']),
                          ('奇偶、按常数取 div 和 mod、对数的 ∃', ['presburger']),
                          ('变量相乘；需要一条叫不出名字的引理', ['find_theorems', 'sledgehammer']),
                          ('没有把握是否成立的命题', ['quickcheck', 'nitpick'])])}[L]
    rows = T['rows']
    row_h = 38
    s = SVG(760, 56 + len(rows) * row_h, T['title'])
    s.text(24, 26, T['kind'], size=14, weight=700, fill=C['slate'])
    s.text(500, 26, T['try_'], size=14, weight=700, fill=C['slate'])
    for i, (kind, methods) in enumerate(rows):
        y = 40 + i * row_h
        s.rect(14, y, 436, row_h - 8, fill=C['bg'] if i % 2 == 0 else C['white'], stroke=C['border'], r=8, sw=1.2)
        s.text(28, y + 20, kind, size=13, fill=C['navy'])
        s.line(452, y + 15, 488, y + 15, stroke=C['slate'], sw=1.8, arrow=True)
        x = 496
        for m in methods:
            plain = not m.isascii() or ' ' in m
            if plain:
                s.text(x, y + 20, m, size=12.5, fill=C['slate'], italic=True)
                x += len(m) * 7 + 12
            else:
                w = s.pill(x, y + 20, m, kind='head', size=12, anchor='start')
                x += w + 8
    return s


FIGURES = {'fig-09-1': fig_09_1, 'fig-09-2': fig_09_2, 'fig-09-3': fig_09_3}
