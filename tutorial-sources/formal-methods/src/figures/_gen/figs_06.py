"""Figures of Module 6."""
from figlib import *  # noqa: F401,F403


def fig_06_1(L):
    """⊢ and ⊨, with soundness and completeness between them."""
    T = {'en': dict(title='Derivability and consequence: soundness and completeness',
                    der='A is derivable from Γ', derk='rules and derivations: syntax',
                    dern=['a finite tree of rule steps,', 'each step checked mechanically'], ders='Show it: give a derivation.',
                    con='A is true wherever Γ is', conk='valuations and structures: semantics',
                    conn=['B is true in every row', 'in which A ∧ B is true'], cons='Refute it: give a counterexample.',
                    sound='soundness', soundk='⊢ implies ⊨', comp='completeness', compk='⊨ implies ⊢',
                    foot=['Natural deduction has both properties, for propositional and first-order logic:',
                          'Γ ⊢ A exactly when Γ ⊨ A. So a counterexample shows that no derivation exists.']),
         'zh': dict(title='可推导性与逻辑后承：可靠性与完备性',
                    der='A 可由 Γ 推导出', derk='规则与推导：语法',
                    dern=['由规则步骤组成的有限树，', '每一步都可以机械地检查'], ders='要确立它：给出一个推导。',
                    con='只要 Γ 为真，A 就为真', conk='赋值与结构：语义',
                    conn=['在 A ∧ B 为真的每一行，', 'B 都为真'], cons='要反驳它：给出一个反例。',
                    sound='可靠性', soundk='⊢ 蕴涵 ⊨', comp='完备性', compk='⊨ 蕴涵 ⊢',
                    foot=['自然演绎同时具有这两个性质（对命题逻辑和一阶逻辑都成立）：',
                          'Γ ⊢ A 当且仅当 Γ ⊨ A。因此，一个反例就说明推导不存在。'])}[L]
    s = SVG(760, 330, T['title'])
    # left: derivability
    s.rect(16, 16, 290, 236, fill=C['skyp'], stroke=C['blue'], r=12, sw=1.8)
    s.text(161, 44, 'Γ ⊢ A', size=16, weight=700, fill=C['blue'], anchor='middle', mono=True)
    s.text(161, 66, T['der'], size=13, fill=C['navy'], anchor='middle', weight=600)
    s.text(161, 84, T['derk'], size=11.5, fill=C['slate'], anchor='middle', italic=True)
    # a small derivation: A ∧ B ⊢ B ∧ A
    for cx, f, rule in ((100, 'B', '(∧E₂)'), (205, 'A', '(∧E₁)')):
        s.text(cx, 116, 'A ∧ B', size=13.5, anchor='middle', mono=True)
        s.line(cx - 24, 124, cx + 24, 124, stroke=C['navy'], sw=1.4)
        s.text(cx + 27, 128, rule, size=11, fill=C['slate'], mono=True)
        s.text(cx, 142, f, size=13.5, anchor='middle', mono=True)
    s.line(76, 150, 229, 150, stroke=C['navy'], sw=1.4)
    s.text(233, 154, '(∧I)', size=11, fill=C['slate'], mono=True)
    s.text(152, 168, 'B ∧ A', size=13.5, anchor='middle', mono=True)
    s.lines(161, 196, T['dern'], size=12, fill=C['slate'], anchor='middle', gap=16)
    s.text(161, 242, T['ders'], size=12, fill=C['blue'], anchor='middle', weight=700)
    # right: consequence
    s.rect(454, 16, 290, 236, fill=C['greenp'], stroke=C['green'], r=12, sw=1.8)
    s.text(599, 44, 'Γ ⊨ A', size=16, weight=700, fill=C['green'], anchor='middle', mono=True)
    s.text(599, 66, T['con'], size=13, fill=C['navy'], anchor='middle', weight=600)
    s.text(599, 84, T['conk'], size=11.5, fill=C['slate'], anchor='middle', italic=True)
    cols = (530, 562, 612, 666)
    s.rect(512, 121, 172, 17, fill=C['greenl'], stroke=C['greenl'], r=4, sw=1)
    for x, hd in zip(cols, ('A', 'B', 'A ∧ B', 'B')):
        s.text(x, 110, hd, size=12, weight=700, anchor='middle', mono=True)
    s.line(512, 116, 684, 116, stroke=C['border'], sw=1.2)
    s.line(638, 98, 638, 186, stroke=C['border'], sw=1.2)
    rows = (('T', 'T', 'T', 'T'), ('T', 'F', 'F', 'F'), ('F', 'T', 'F', 'T'), ('F', 'F', 'F', 'F'))
    for i, row in enumerate(rows):
        for x, v in zip(cols, row):
            s.text(x, 134 + i * 16, v, size=12, anchor='middle', mono=True, fill=C['green'] if v == 'T' else C['red'])
    s.lines(599, 204, T['conn'], size=12, fill=C['slate'], anchor='middle', gap=16)
    s.text(599, 242, T['cons'], size=12, fill=C['green'], anchor='middle', weight=700)
    # the two arrows
    s.text(380, 90, T['sound'], size=14, weight=700, fill=C['navy'], anchor='middle')
    s.line(312, 100, 448, 100, stroke=C['navy'], sw=2.2, arrow=True)
    s.text(380, 118, T['soundk'], size=12.5, fill=C['navy'], anchor='middle', mono=True)
    s.text(380, 164, T['comp'], size=14, weight=700, fill=C['purple'], anchor='middle')
    s.line(448, 174, 312, 174, stroke=C['purple'], sw=2.2, arrow=True)
    s.text(380, 192, T['compk'], size=12.5, fill=C['purple'], anchor='middle', mono=True)
    s.lines(380, 288, T['foot'], size=13, fill=C['navy'], anchor='middle', gap=20)
    return s


def fig_06_2(L):
    """Scopes of discharged assumptions nest like blocks; a use outside the scope is wrong."""
    T = {'en': dict(title='The scope of a discharged assumption',
                    left='Scopes in a correct derivation', right='Wrong: [A]¹ used outside its scope',
                    s1='scope of [A ⟶ B]¹', s2='scope of [B ⟶ C]²', s3='scope of [A]³', sw='scope of (⟶I¹)',
                    note=['Each assumption may be used only inside its scope:',
                          'the part of the derivation above the rule that discharges it.'],
                    bad=['This [A]¹ is not above (⟶I¹).', 'Here A is an open assumption, so the',
                         'tree shows only A ⊢ (A ⟶ A) ∧ A.']),
         'zh': dict(title='被解除假设的作用域',
                    left='正确推导中的作用域', right='错误：[A]¹ 在作用域之外被使用',
                    s1='[A ⟶ B]¹ 的作用域', s2='[B ⟶ C]² 的作用域', s3='[A]³ 的作用域', sw='(⟶I¹) 的作用域',
                    note=['每个假设只能在它的作用域内使用：',
                          '即解除它的那条规则之上的那部分推导。'],
                    bad=['这个 [A]¹ 不在 (⟶I¹) 之上。', '在这里 A 是未解除的假设，所以',
                         '这棵树只说明 A ⊢ (A ⟶ A) ∧ A。'])}[L]
    s = SVG(760, 316, T['title'])
    s.text(20, 28, T['left'], size=14, weight=700, fill=C['navy'])
    x0 = 30         # the tree is drawn around x = 257 + x0
    # nested scopes, outermost first; each ends just above the rule that discharges its assumption, and
    # that rule's label sits a little below its line, so that it stays clear of the scope's border
    s.rect(84, 50, 410, 158, fill=C['skyp'], stroke=C['blue'], r=10, sw=1.4, dash='5 4')
    s.rect(92, 55, 394, 123, fill=C['purplep'], stroke=C['purple'], r=9, sw=1.4, dash='5 4')
    s.rect(100, 60, 378, 88, fill=C['amberp'], stroke=C['amber'], r=8, sw=1.4, dash='5 4')
    s.text(108, 144, T['s3'], size=11, fill=C['amber'], weight=600)
    s.text(100, 174, T['s2'], size=11, fill=C['purple'], weight=600)
    s.text(92, 204, T['s1'], size=11, fill=C['blue'], weight=600)
    # the derivation of (A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C)
    def bar(x1, x2, y, label, col=C['slate'], dy=4):
        s.line(x1 + x0, y, x2 + x0, y, stroke=C['navy'], sw=1.4)
        s.text(x2 + x0 + 5, y + dy, label, size=11, fill=col, mono=True)

    def f(x, y, txt, col=C['navy'], weight=400):
        s.text(x + x0, y, txt, size=13, anchor='middle', mono=True, fill=col, weight=weight)
    f(290, 84, '[A ⟶ B]¹', C['blue'], 700)
    f(380, 84, '[A]³', C['amber'], 700)
    bar(252, 402, 93, '(⟶E)')
    f(150, 114, '[B ⟶ C]²', C['purple'], 700)
    f(327, 114, 'B')
    bar(112, 402, 123, '(⟶E)')
    f(257, 144, 'C')
    bar(212, 302, 153, '(⟶I³)', C['amber'], dy=7)
    f(257, 174, 'A ⟶ C')
    bar(178, 336, 183, '(⟶I²)', C['purple'], dy=7)
    f(257, 204, '(B ⟶ C) ⟶ (A ⟶ C)')
    bar(150, 364, 213, '(⟶I¹)', C['blue'], dy=7)
    f(257, 234, '(A ⟶ B) ⟶ (B ⟶ C) ⟶ (A ⟶ C)')
    s.lines(257 + x0, 272, T['note'], size=12.5, fill=C['navy'], anchor='middle', gap=18)
    # right: the wrong derivation of (A ⟶ A) ∧ A
    rx = 18
    s.text(492 + rx, 28, T['right'], size=14, weight=700, fill=C['red'])
    s.text(552 + rx, 82, T['sw'], size=11, fill=C['amber'], weight=600, anchor='middle')
    s.rect(526 + rx, 89, 52, 25, fill=C['amberp'], stroke=C['amber'], r=6, sw=1.4, dash='5 4')
    s.text(552 + rx, 106, '[A]¹', size=13, anchor='middle', mono=True, fill=C['amber'], weight=700)
    s.line(528 + rx, 120, 576 + rx, 120, stroke=C['navy'], sw=1.4)
    s.text(581 + rx, 124, '(⟶I¹)', size=11, fill=C['amber'], mono=True)
    s.text(552 + rx, 138, 'A ⟶ A', size=13, anchor='middle', mono=True)
    s.rect(650 + rx, 124, 48, 22, fill=C['redp'], stroke=C['red'], r=6, sw=1.6)
    s.text(674 + rx, 140, '[A]¹', size=13, anchor='middle', mono=True, fill=C['red'], weight=700)
    s.text(704 + rx, 140, '✗', size=14, fill=C['red'], weight=700)
    s.line(522 + rx, 148, 700 + rx, 148, stroke=C['navy'], sw=1.4)
    s.text(705 + rx, 152, '(∧I)', size=11, fill=C['slate'], mono=True)
    s.text(611 + rx, 166, '(A ⟶ A) ∧ A', size=13, anchor='middle', mono=True)
    s.lines(492 + rx, 204, T['bad'], size=12, fill=C['red'], gap=18)
    return s


def fig_06_3(L):
    """Backward proof search for A ∨ B ⟶ B ∨ A, with a dead end."""
    T = {'en': dict(title='Backward search for A ∨ B ⟶ B ∨ A',
                    leg1='subgoals: all must be proved', leg2='alternative step: a dead end',
                    safe='safe', unsafe='not safe', both='safe: two goals', dead=['✗ dead end: false when', 'A = T and B = F'],
                    closed='✓ an assumption'),
         'zh': dict(title='A ∨ B ⟶ B ∨ A 的反向搜索',
                    leg1='子目标：都必须证明', leg2='另一种步骤：死路',
                    safe='安全', unsafe='不安全', both='安全：两个目标', dead=['✗ 死路：当 A = T、', 'B = F 时为假'],
                    closed='✓ 是假设之一')}[L]
    s = SVG(760, 380, T['title'])

    def box(cx, cy, w, txt, kind='goal'):
        fill, stroke = {'goal': (C['white'], C['navy']), 'done': (C['greenp'], C['green']),
                        'dead': (C['redp'], C['red'])}[kind]
        s.rect(cx - w / 2, cy - 17, w, 34, fill=fill, stroke=stroke, r=9, sw=1.8)
        s.text(cx, cy + 5, txt, size=13.5, anchor='middle', mono=True, fill=C['navy'])

    box(290, 40, 220, '⊢ A ∨ B ⟶ B ∨ A')
    box(290, 132, 200, 'A ∨ B ⊢ B ∨ A')
    box(160, 232, 150, 'A ⊢ B ∨ A')
    box(400, 232, 150, 'B ⊢ B ∨ A')
    box(630, 232, 160, 'A ∨ B ⊢ B', 'dead')
    box(160, 326, 110, 'A ⊢ A', 'done')
    box(400, 326, 110, 'B ⊢ B', 'done')
    # steps
    s.line(290, 57, 290, 112, stroke=C['navy'], sw=2, arrow=True)
    s.text(302, 82, '(⟶I¹)', size=12, mono=True, fill=C['navy'])
    s.text(302, 98, T['safe'], size=11, fill=C['green'], italic=True)
    s.line(262, 149, 182, 212, stroke=C['navy'], sw=2, arrow=True)
    s.line(318, 149, 380, 212, stroke=C['navy'], sw=2, arrow=True)
    s.text(290, 180, '(∨E²)', size=12, mono=True, fill=C['navy'], anchor='middle')
    s.text(290, 196, T['both'], size=11, fill=C['green'], italic=True, anchor='middle')
    s.line(392, 140, 588, 212, stroke=C['red'], sw=2, dash='6 5', arrow=True)
    s.text(500, 148, '(∨I₁)', size=12, mono=True, fill=C['red'])
    s.text(500, 164, T['unsafe'], size=11, fill=C['red'], italic=True)
    s.lines(630, 270, T['dead'], size=12, fill=C['red'], anchor='middle', gap=16, weight=600)
    s.line(160, 249, 160, 306, stroke=C['navy'], sw=2, arrow=True)
    s.text(170, 282, '(∨I₂)', size=12, mono=True, fill=C['navy'])
    s.line(400, 249, 400, 306, stroke=C['navy'], sw=2, arrow=True)
    s.text(410, 282, '(∨I₁)', size=12, mono=True, fill=C['navy'])
    s.text(160, 362, T['closed'], size=12, fill=C['green'], anchor='middle', weight=600)
    s.text(400, 362, T['closed'], size=12, fill=C['green'], anchor='middle', weight=600)
    # legend
    s.line(500, 34, 540, 34, stroke=C['navy'], sw=2, arrow=True)
    s.text(548, 38, T['leg1'], size=12, fill=C['slate'])
    s.line(500, 60, 540, 60, stroke=C['red'], sw=2, dash='6 5', arrow=True)
    s.text(548, 64, T['leg2'], size=12, fill=C['slate'])
    return s


FIGURES = {'fig-06-1': fig_06_1, 'fig-06-2': fig_06_2, 'fig-06-3': fig_06_3}
