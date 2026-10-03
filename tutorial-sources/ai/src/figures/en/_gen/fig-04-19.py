# Figure 4.19: dependency graphs over eight positions (RNN chain, dilated TCN, self-attention). Usage: fig-04-19.py en|zh
from _common import *
l = lang()
T = {
 "en": dict(names=["RNN", "Dilated TCN", "Self-attention"], sub=["a chain", "dilations 1, 2, 4", "all-to-all"],
            path=["maximum path length 7", "maximum path length 3", "maximum path length 1"], oh=["O(T)", "O(log T)", "O(1)"],
            pos="position"),
 "zh": dict(names=["RNN", "空洞 TCN", "自注意力"], sub=["链", "空洞率 1、2、4", "全连接"],
            path=["最大路径长度 7", "最大路径长度 3", "最大路径长度 1"], oh=["O(T)", "O(log T)", "O(1)"],
            pos="位置"),
}[l]
W, H = 720, 420
p = open_svg(W, H, l)
X = [214 + i*68 for i in range(8)]      # 214 .. 690
R = 10
def node(x, y, hl=False, label=None):
    p.append(circle(x, y, R, F_ORANGE if hl else "#FFFFFF", ORANGE if hl else NAVY, 2.2 if hl else 1.5))
def label_block(y, k):
    p.append(text(10, y, T["names"][k], 15, "start", NAVY, "700"))
    p.append(text(10, y+18, T["sub"][k], 12, "start", SLATE))
    p.append(text(10, y+38, T["path"][k], 13, "start", ORANGE, "700"))
    p.append(text(10, y+56, T["oh"][k], 13, "start", ORANGE))
def numbers(y):
    for i, x in enumerate(X): p.append(text(x, y, str(i+1), 12, "middle", SLATE))
# 1 chain
y1 = 52
label_block(30, 0)
for i in range(7):
    p.append(line(X[i]+R, y1, X[i+1]-R-2, y1, ORANGE, 2.4, "ah" if False else None))
    p.append(f'<path d="M {X[i+1]-R-1} {y1} l -8 -4 l 0 8 z" fill="{ORANGE}"/>')
for x in X: node(x, y1, True)
numbers(y1+28)
p.append(line(8, 98, 712, 98, BORDER, 1))
# 2 TCN: layers 0..3 bottom to top
ys = {0: 264, 1: 224, 2: 184, 3: 144}
d = {1: 1, 2: 2, 3: 4}
label_block(138, 1)
for L in (1, 2, 3):
    for t in range(8):
        for src in (t, t - d[L]):
            if src < 0: continue
            on = (L == 1 and t == 1 and src == 0) or (L == 2 and t == 3 and src == 1) or (L == 3 and t == 7 and src == 3)
            if on: continue
            p.append(line(X[src], ys[L-1], X[t], ys[L], "#CBD5E1", 1.2))
for L, t, src in ((1, 1, 0), (2, 3, 1), (3, 7, 3)):
    p.append(line(X[src], ys[L-1], X[t], ys[L], ORANGE, 2.6))
hl = {(0, 0), (1, 1), (2, 3), (3, 7)}
for L in range(4):
    for t in range(8): node(X[t], ys[L], (L, t) in hl)
numbers(ys[0]+28)
p.append(line(8, 318-0, 712, 318, BORDER, 1)) if False else None
p.append(line(8, 304, 712, 304, BORDER, 1))
# 3 attention: all-to-all arcs above a row of nodes
y3 = 392
label_block(330, 2)
for i in range(8):
    for j in range(i+1, 8):
        if (i, j) == (0, 7): continue
        h = 14 + 7*(j-i)
        p.append(f'<path d="M {X[i]} {y3-R} Q {(X[i]+X[j])/2} {y3-R-2*h} {X[j]} {y3-R}" fill="none" stroke="#CBD5E1" stroke-width="1.1"/>')
h = 14 + 7*7
p.append(f'<path d="M {X[0]} {y3-R} Q {(X[0]+X[7])/2} {y3-R-2*h} {X[7]} {y3-R}" fill="none" stroke="{ORANGE}" stroke-width="2.6"/>')
for i, x in enumerate(X): node(x, y3, i in (0, 7))
H2 = y3 + 26
for i, x in enumerate(X): p.append(text(x, y3+26, str(i+1), 12, "middle", SLATE))
write(p, "fig-04-19", l)
