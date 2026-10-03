import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(inp="input", lay="layer", d="dilation", fut="future", rf="receptive field = 8 inputs", out="output at time ", none="no connection reaches the future"),
     "zh": dict(inp="输入", lay="第", d="空洞率", fut="未来", rf="感受野 = 8 个输入", out="时刻 t 的输出", none="没有连接指向未来")}[L]
W, H = 720, 350
o = open_svg(W, H, L)
x0, sp = 168, 50
cols = list(range(-8, 3))          # offsets relative to t
X = lambda c: x0 + (c + 8) * sp
Y = {3: 56, 2: 126, 1: 196, 0: 266}
dil = {1: 1, 2: 2, 3: 4}
# future band
o.append(f'<rect x="{X(0)+sp/2}" y="26" width="{2*sp}" height="{266-26+22}" rx="8" fill="{F_RED}" stroke="none"/>')
o.append(text(X(1.5), 44, T["fut"], 12, "middle", RED, 600))
# the fan of the output at t
active = {3: {0}}
edges = []
for l in (3, 2, 1):
    d = dil[l]
    nxt = set()
    for c in active[l]:
        for c2 in (c, c - d):
            edges.append((l, c, c2)); nxt.add(c2)
    active[l - 1] = nxt
for l, c, c2 in edges:
    o.append(line(X(c), Y[l] + 6, X(c2), Y[l - 1] - 6, BLUE, 2 if c2 == c else 2))
for l in (0, 1, 2, 3):
    for c in cols:
        on = c in active.get(l, set())
        fut = c > 0
        if on:
            o.append(circle(X(c), Y[l], 7, BLUE, BLUE, 1.5))
        else:
            o.append(circle(X(c), Y[l], 6, "#FFFFFF", "#FCA5A5" if fut else MUTED, 1.4))
# labels
o.append(text(X(-8) - 28, Y[0] + 5, T["inp"], 13, "end", NAVY, 600))
for l in (1, 2, 3):
    lab = (f"{T['lay']} {l}" if L == "en" else f"{T['lay']} {l} 层")
    o.append(text(X(-8) - 28, Y[l] - 2, lab, 13, "end", NAVY, 600))
    o.append(text(X(-8) - 28, Y[l] + 14, f"{T['d']} d = {dil[l]}" if L == "en" else f"{T['d']} d = {dil[l]}", 12, "end", SLATE))
# time ticks
names = {c: ("t" if c == 0 else f"t − {-c}" if c < 0 else f"t + {c}") for c in cols}
for c in cols:
    o.append(text(X(c), Y[0] + 24, names[c], 12, "middle", BLUE if -7 <= c <= 0 else SLATE, 600 if -7 <= c <= 0 else None))
# receptive-field bracket t-7 .. t
by = Y[0] + 40
o.append(f'<path d="M{X(-7)-6},{by-6} L{X(-7)-6},{by} L{X(0)+6},{by} L{X(0)+6},{by-6}" fill="none" stroke="{BLUE}" stroke-width="2"/>')
o.append(text((X(-7) + X(0)) / 2, by + 18, T["rf"], 13, "middle", BLUE, 700))
o.append(text(X(0) + 12, Y[3] + 4, "", 12))
o.append(text(X(0) + 8, Y[3] - 18, (T["out"] + "t") if L == "en" else T["out"], 12, "end", BLUE, 600))
write(o, "fig-03-33", L)
