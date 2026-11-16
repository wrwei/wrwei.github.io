"""Figures of Module 13."""
from figlib import *  # noqa: F401,F403

LAMP = {'Green': C['green'], 'Amber': C['amber'], 'Red': C['red']}


def lamp(s, x, y, lit, h=46):
    """A small car traffic light, housing at (x, y), with the lamp `lit` on."""
    s.rect(x, y, 18, h, fill=C['navy'], stroke=C['navy'], r=5, sw=1)
    gap = (h - 6) / 3
    for i, name in enumerate(('Red', 'Amber', 'Green')):
        cy = y + 3 + gap * i + gap / 2
        on = name == lit
        s.circle(x + 9, cy, 5, fill=LAMP[name] if on else '#334155', stroke=LAMP[name] if on else '#334155', sw=1)


def fig_13_1(L):
    T = {'en': dict(title='The pedestrian crossing as a state machine', start='start',
                    note=['In a state where req is already True,', 'Press changes nothing.']),
         'zh': dict(title='把人行横道看作状态机', start='初始',
                    note=['在 req 已经为 True 的状态中，', 'Press 不改变任何东西。'])}[L]
    s = SVG(760, 372, T['title'])
    W, H = 176, 80
    pos = {1: (40, 60), 2: (292, 60), 3: (544, 60), 6: (40, 228), 5: (292, 228), 4: (544, 228)}
    states = {1: ('Green', 'DontWalk', 'False'), 2: ('Green', 'DontWalk', 'True'), 3: ('Amber', 'DontWalk', 'True'),
              4: ('Red', 'DontWalk', 'True'), 5: ('Red', 'Walk', 'True'), 6: ('Red', 'DontWalk', 'False')}
    for k, (x, y) in pos.items():
        cars, peds, req = states[k]
        first = k == 1
        walk = peds == 'Walk'
        s.rect(x, y, W, H, fill=C['greenp'] if walk else C['skyp'], stroke=C['navy'] if first else (C['green'] if walk else C['blue']),
               r=10, sw=2.6 if first else 1.6)
        lamp(s, x + 12, y + 17, cars)
        s.text(x + 42, y + 26, 'cars = ' + cars, size=12, mono=True, fill=LAMP[cars], weight=600)
        s.text(x + 42, y + 45, 'peds = ' + peds, size=12, mono=True, fill=C['green'] if walk else C['navy'], weight=600 if walk else 400)
        s.text(x + 42, y + 64, 'req  = ' + req, size=12, mono=True, fill=C['navy'])
    # start marker
    s.line(128, 18, 128, 56, stroke=C['navy'], sw=2, arrow=True)
    s.text(138, 32, T['start'], size=12, fill=C['navy'], weight=700)

    def label(x, y, t, anchor='middle'):
        s.text(x, y, t, size=12, mono=True, fill=C['purple'], weight=600, anchor=anchor)

    # top row, left to right
    s.line(218, 100, 288, 100, stroke=C['slate'], sw=2, arrow=True)
    label(253, 92, 'Press')
    s.line(470, 100, 540, 100, stroke=C['slate'], sw=2, arrow=True)
    label(505, 92, 'ToAmber')
    # right column, down
    s.line(632, 142, 632, 224, stroke=C['slate'], sw=2, arrow=True)
    label(640, 187, 'ToRed', anchor='start')
    # bottom row, right to left
    s.line(542, 268, 472, 268, stroke=C['slate'], sw=2, arrow=True)
    label(507, 260, 'StartWalk')
    s.line(290, 268, 220, 268, stroke=C['slate'], sw=2, arrow=True)
    label(255, 260, 'EndWalk')
    # left column, up
    s.line(128, 226, 128, 144, stroke=C['slate'], sw=2, arrow=True)
    label(120, 187, 'ToGreen', anchor='end')
    # Press from state 6 to state 4, below the bottom row
    s.path('M 128 310 C 128 352, 632 352, 632 314', stroke=C['slate'], sw=2, arrow=True)
    label(380, 362, 'Press')
    # note in the middle
    s.lines(380, 178, T['note'], size=12, anchor='middle', fill=C['slate'], gap=17, italic=True)
    return s


def fig_13_2(L):
    T = {'en': dict(title='Reachable states, an inductive invariant and the safety property',
                    all='all 12 states', safe='safe: 8 states', inv='inv: 7 states, inductive',
                    reach='reachable: 6 states', unsafe='not safe'),
         'zh': dict(title='可达状态、归纳不变式与安全性质',
                    all='全部 12 个状态', safe='safe：8 个状态', inv='inv：7 个状态，归纳的',
                    reach='可达：6 个状态', unsafe='不安全')}[L]
    s = SVG(760, 312, T['title'])
    # nested regions (outermost first)
    s.rect(8, 22, 744, 282, fill=C['bg'], stroke=C['border'], r=14, sw=1.5)
    s.rect(16, 40, 512, 210, fill=C['skyp'], stroke=C['blue'], r=12, sw=1.6)
    s.rect(24, 58, 398, 184, fill=C['greenp'], stroke=C['green'], r=11, sw=1.8, dash='7 4')
    s.rect(32, 76, 284, 158, fill=C['greenl'], stroke=C['navy'], r=10, sw=1.8)
    s.text(20, 36, T['all'], size=12, weight=700, fill=C['slate'])
    s.text(28, 54, T['safe'], size=12, weight=700, fill=C['blue'])
    s.text(36, 72, T['inv'], size=12, weight=700, fill=C['green'])
    s.text(44, 90, T['reach'], size=12, weight=700, fill=C['navy'])
    s.text(610, 52, T['unsafe'], size=12, weight=700, fill=C['red'], anchor='middle')
    W, H = 80, 54
    xs = [44, 134, 224, 334, 440, 556, 650]
    ys = [100, 168]

    def state(col, row, cars, peds, req, kind='plain', first=False):
        x, y = xs[col], ys[row]
        fill, stroke = {'plain': (C['white'], C['slate']), 'bad': (C['redp'], C['red'])}[kind]
        s.rect(x, y, W, H, fill=fill, stroke=C['navy'] if first else stroke, r=8, sw=2.4 if first else 1.3)
        s.text(x + W / 2, y + 17, cars, size=11.5, mono=True, anchor='middle', fill=LAMP[cars], weight=700)
        s.text(x + W / 2, y + 32, peds, size=11.5, mono=True, anchor='middle',
               fill=C['red'] if kind == 'bad' else (C['green'] if peds == 'Walk' else C['navy']))
        s.text(x + W / 2, y + 47, 'req' if req else '¬ req', size=11.5, mono=True, anchor='middle', fill=C['navy'])

    # reachable
    state(0, 0, 'Green', 'DontWalk', False, first=True)
    state(1, 0, 'Green', 'DontWalk', True)
    state(2, 0, 'Amber', 'DontWalk', True)
    state(0, 1, 'Red', 'DontWalk', False)
    state(1, 1, 'Red', 'Walk', True)
    state(2, 1, 'Red', 'DontWalk', True)
    # in inv, not reachable
    state(3, 0, 'Amber', 'DontWalk', False)
    # safe, not in inv
    state(4, 1, 'Red', 'Walk', False)
    # not safe
    state(5, 0, 'Green', 'Walk', True, kind='bad')
    state(6, 0, 'Amber', 'Walk', True, kind='bad')
    state(5, 1, 'Green', 'Walk', False, kind='bad')
    state(6, 1, 'Amber', 'Walk', False, kind='bad')
    # the step that leaves safe
    s.path('M 480 222 C 480 280, 596 280, 596 226', stroke=C['red'], sw=2.2, arrow=True)
    s.text(538, 290, 'ToGreen', size=12, mono=True, anchor='middle', fill=C['red'], weight=700)
    return s


def fig_13_3(L):
    T = {'en': dict(title='The timed controller refines the crossing', abs='crossing: reach',
                    con='timed controller: treach', alpha='lights', stutter='three ticks: stutter steps'),
         'zh': dict(title='带计时器的控制器精化了人行横道模型', abs='人行横道：reach',
                    con='带计时器的控制器：treach', alpha='lights', stutter='三次 tick：停顿步')}[L]
    s = SVG(760, 300, T['title'])
    W, gap = 74, 32
    xs = [24 + i * (W + gap) for i in range(7)]
    cy, ch = 168, 62
    ay, ah = 54, 46
    con = [('Green', 'False', 0), ('Green', 'True', 0), ('Amber', 'True', 3), ('Amber', 'True', 2),
           ('Amber', 'True', 1), ('Amber', 'True', 0), ('Red', 'True', 2)]
    steps = ['Press', 'ToAmber', 'tick', 'tick', 'tick', 'ToRed']
    s.text(xs[0], 24, T['abs'], size=12.5, weight=700, fill=C['blue'], mono=False)
    s.text(xs[0], 260, T['con'], size=12.5, weight=700, fill=C['purple'])
    # concrete states
    for i, (cars, req, t) in enumerate(con):
        x = xs[i]
        s.rect(x, cy, W, ch, fill=C['purplep'], stroke=C['purple'], r=8, sw=1.4)
        s.text(x + W / 2, cy + 18, cars, size=11.5, mono=True, anchor='middle', fill=LAMP[cars], weight=700)
        s.text(x + W / 2, cy + 35, 'req' if req == 'True' else '¬ req', size=11.5, mono=True, anchor='middle', fill=C['navy'])
        s.text(x + W / 2, cy + 53, 'timer ' + str(t), size=11.5, mono=True, anchor='middle', fill=C['purple'], weight=600)
    for i, st in enumerate(steps):
        x1 = xs[i] + W + 2
        x2 = xs[i + 1] - 4
        tick = st == 'tick'
        s.line(x1, cy + ch / 2, x2, cy + ch / 2, stroke=C['muted'] if tick else C['slate'], sw=1.8, arrow=True)
        s.text((x1 + x2) / 2, cy - 8, st, size=11, mono=True, anchor='middle',
               fill=C['muted'] if tick else C['purple'], weight=600)
    # abstract states: s0 over c0, s1 over c1, s2 over c2..c5, s3 over c6
    spans = [(0, 0, 'Green', 'False'), (1, 1, 'Green', 'True'), (2, 5, 'Amber', 'True'), (6, 6, 'Red', 'True')]
    for a, b, cars, req in spans:
        x = xs[a]
        w = xs[b] + W - x
        s.rect(x, ay, w, ah, fill=C['skyp'], stroke=C['blue'], r=8, sw=1.6)
        s.text(x + w / 2, ay + 19, cars, size=11.5, mono=True, anchor='middle', fill=LAMP[cars], weight=700)
        s.text(x + w / 2, ay + 37, 'req' if req == 'True' else '¬ req', size=11.5, mono=True, anchor='middle', fill=C['navy'])
    for (a, b, *_), (a2, *_), st in zip(spans, spans[1:], ['Press', 'ToAmber', 'ToRed']):
        x1 = xs[b] + W + 2
        x2 = xs[a2] - 4
        s.line(x1, ay + ah / 2, x2, ay + ah / 2, stroke=C['slate'], sw=1.8, arrow=True)
        s.text((x1 + x2) / 2, ay - 8, st, size=11, mono=True, anchor='middle', fill=C['purple'], weight=600)
    # the abstraction function, from each concrete state up to its abstract state
    for i in range(7):
        x = xs[i] + W / 2
        s.line(x, cy - 16, x, ay + ah + 4, stroke=C['blue'], sw=1.4, dash='4 4', arrow=True)
    s.text(xs[0] + W / 2 + 6, 132, T['alpha'], size=11.5, mono=True, fill=C['blue'], weight=600)
    # bracket under the ticks
    x1, x2 = xs[2] + W / 2, xs[5] + W / 2
    s.path(f'M{x1} {cy + ch + 8} V{cy + ch + 16} H{x2} V{cy + ch + 8}', stroke=C['muted'], sw=1.6)
    s.text((x1 + x2) / 2, cy + ch + 32, T['stutter'], size=12, anchor='middle', fill=C['slate'], italic=True)
    return s


FIGURES = {'fig-13-1': fig_13_1, 'fig-13-2': fig_13_2, 'fig-13-3': fig_13_3}
