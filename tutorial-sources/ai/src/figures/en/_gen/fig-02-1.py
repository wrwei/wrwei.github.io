import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(inp="input", h1="hidden layer 1", h2="hidden layer 2", out="output",
                width="width: 4 units", depth="depth L = 3 weight layers", noact="no φ: a logit or a prediction"),
     "zh": dict(inp="输入", h1="隐藏层 1", h2="隐藏层 2", out="输出",
                width="宽度：4 个单元", depth="深度 L = 3 个权重层", noact="无 φ：logit 或预测值")}[L]
W, H = 720, 452
o = open_svg(W, H, L)
cx = [90, 250, 410, 570]
ys = [[165, 275], [105, 185, 265, 345], [105, 185, 265, 345], [225]]
R = 17
for c in range(3):
    for ya in ys[c]:
        for yb in ys[c + 1]:
            o.append(line(cx[c] + R, ya, cx[c + 1] - R, yb, stroke=MUTED, sw=1.1))
P = [(B("W") + SUP("(1)") + " ∈ ℝ" + SUP("2×4"), B("b") + SUP("(1)") + " ∈ ℝ" + SUP("4")),
     (B("W") + SUP("(2)") + " ∈ ℝ" + SUP("4×4"), B("b") + SUP("(2)") + " ∈ ℝ" + SUP("4")),
     (B("W") + SUP("(3)") + " ∈ ℝ" + SUP("4×1"), I("b") + SUP("(3)") + " ∈ ℝ")]
for c, (w, b) in enumerate(P):
    mx = (cx[c] + cx[c + 1]) / 2
    o.append(text(mx, 32, w, 13, "middle", BLUE, 600))
    o.append(text(mx, 51, b, 13, "middle", BLUE, 600))
    o.append(f'<path d="M{cx[c]+R+6},63 L{cx[c+1]-R-6},63" stroke="{BLUE}" stroke-width="1.5" marker-end="url(#ahb)" fill="none"/>')
for c in range(4):
    fill, st = [(F_SKY, SKY), (F_BLUE, BLUE), (F_BLUE, BLUE), (F_GREEN, GREEN)][c]
    for y in ys[c]:
        o.append(circle(cx[c], y, R, fill, st, 1.8))
o.append(text(cx[0] - R - 8, ys[0][0] + 5, I("x") + SUB("1"), 14, "end"))
o.append(text(cx[0] - R - 8, ys[0][1] + 5, I("x") + SUB("2"), 14, "end"))
o.append(text(cx[3] + R + 8, ys[3][0] + 5, I("ŷ"), 14, "start"))
cap = [(T["inp"], B("x") + " (" + I("d") + SUB("0") + " = 2)", None),
       (T["h1"], B("h") + SUP("(1)") + " (" + I("d") + SUB("1") + " = 4)", "z = Wᵀh + b,  h = φ(z)"),
       (T["h2"], B("h") + SUP("(2)") + " (" + I("d") + SUB("2") + " = 4)", "z = Wᵀh + b,  h = φ(z)"),
       (T["out"], I("d") + SUB("3") + " = 1", T["noact"])]
for c, (a, b, f) in enumerate(cap):
    o.append(text(cx[c], 385, a, 13, "middle", NAVY, 600))
    o.append(text(cx[c], 402, b, 12, "middle", SLATE))
    if f:
        o.append(text(cx[c], 419, f, 12, "middle", SLATE))
# width bracket (right of hidden layer 2)
bx = 446
o.append(f'<path d="M{bx-6},{ys[2][0]-14} L{bx},{ys[2][0]-14} L{bx},{ys[2][-1]+14} L{bx-6},{ys[2][-1]+14}" fill="none" stroke="#FFFFFF" stroke-width="6"/>')
o.append(f'<path d="M{bx-6},{ys[2][0]-14} L{bx},{ys[2][0]-14} L{bx},{ys[2][-1]+14} L{bx-6},{ys[2][-1]+14}" fill="none" stroke="{ORANGE}" stroke-width="2"/>')
o.append(text(bx + 6, ys[2][0] - 8, T["width"], 12, "start", ORANGE, 600, halo=True))
# depth bracket
by = 432
o.append(f'<path d="M{cx[0]},{by-6} L{cx[0]},{by} L{cx[3]},{by} L{cx[3]},{by-6}" fill="none" stroke="{ORANGE}" stroke-width="2"/>')
o.append(text((cx[0] + cx[3]) / 2, by + 15, T["depth"], 12, "middle", ORANGE, 600))
write(o, "fig-02-1", L)
