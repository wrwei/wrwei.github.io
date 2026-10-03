import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(leg1="black: forward values and weights", leg2="red: gradients of the loss", t="target t = 1", inactive="inactive unit"),
     "zh": dict(leg1="黑色：前向传播的值和权重", leg2="红色：损失的梯度", t="目标 t = 1", inactive="未激活单元")}[L]
W, H = 740, 440
o = open_svg(W, H, L)
GR = "#94A3B8"
xin, xh, xo, xl = 62, 330, 560, 690
yin = [170, 270]; yh = [110, 330]; yo = 220
hw, hh = 112, 50
# edges (drawn first)
def edge(x1, y1, x2, y2, col=SLATE, sw=1.6):
    o.append(line(x1, y1, x2, y2, stroke=col, sw=sw, marker="ah" if col == SLATE else "ahg"))
def lab(x, y, s, col, size=12, weight=None):
    o.append(text(x, y, s, size, "middle", col, weight, halo=True))
def at(p, q, t): return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)
rin = 22
W1 = {(0, 0): ("0.5", "0.896"), (0, 1): ("−1.0", "0"), (1, 0): ("0.25", "0.448"), (1, 1): ("0.5", "0")}
# input -> hidden
for (i, j), (w, g) in W1.items():
    p = (xin + rin, yin[i]); q = (xh - hw / 2, yh[j])
    col = SLATE if j == 0 else GR
    edge(p[0], p[1], q[0] - 2, q[1], col)
TT = {(0, 0): 0.3, (1, 1): 0.3, (0, 1): 0.75, (1, 0): 0.62}
for (i, j), (w, g) in W1.items():
    p = (xin + rin, yin[i]); q = (xh - hw / 2, yh[j])
    x, y = at(p, q, TT[(i, j)])
    lab(x, y - 3, w, SLATE if j == 0 else GR, 12)
    lab(x, y + 12, g, RED if j == 0 else GR, 12, 600)
# hidden -> output
W2 = [("0.8", "0.756"), ("−0.6", "0")]
for j in range(2):
    p = (xh + hw / 2, yh[j]); q = (xo - hw / 2, yo)
    edge(p[0] + 2, p[1], q[0] - 2, q[1], SLATE if j == 0 else GR)
    x, y = at(p, q, 0.45)
    dy = -14 if j == 0 else 14
    lab(x, y + dy - 4, W2[j][0], SLATE if j == 0 else GR, 12)
    lab(x, y + dy + 11, W2[j][1], RED if j == 0 else GR, 12, 600)
# output -> loss
o.append(line(xo + hw / 2 + 2, yo, xl - 44, yo, stroke=SLATE, sw=1.6, marker="ah"))
# nodes
for i in range(2):
    o.append(circle(xin, yin[i], rin, F_SKY, SKY, 1.8))
    o.append(text(xin, yin[i] + 5, ["2", "1"][i], 15, "middle", NAVY, 600))
    o.append(text(xin - rin - 8, yin[i] + 5, I("x") + SUB(str(i + 1)), 14, "end"))
vals = [("1.35", "1.35"), ("−1.5", "0")]
for j in range(2):
    act = j == 0
    o.append(rect(xh - hw / 2, yh[j] - hh / 2, hw, hh, F_BLUE if act else "#F1F5F9", BLUE if act else GR, 1.8, 8))
    o.append(text(xh, yh[j] - 4, I("z") + SUB(str(j + 1)) + " = " + vals[j][0], 13, "middle", NAVY if act else GR))
    o.append(text(xh, yh[j] + 14, I("h") + SUB(str(j + 1)) + " = " + vals[j][1], 13, "middle", NAVY if act else GR))
o.append(rect(xo - hw / 2, yo - hh / 2, hw, hh, F_GREEN, GREEN, 1.8, 8))
o.append(text(xo, yo + 5, I("ŷ") + " = 1.28", 14, "middle", NAVY, 600))
o.append(rect(xl - 44, yo - hh / 2, 88, hh, F_ORANGE, ORANGE, 1.8, 8))
o.append(text(xl, yo - 3, I("𝓛") + " = 0.0784", 13, "middle", NAVY, 600))
o.append(text(xl, yo + 14, T["t"], 11, "middle", SLATE))
# gradient annotations in red
o.append(text(xh, yh[0] - hh / 2 - 10, B("δ") + SUP("(1)") + SUB("1", 10) + " = 0.448", 13, "middle", RED, 600))
o.append(text(xh, yh[1] + hh / 2 + 18, B("δ") + SUP("(1)") + SUB("2", 10) + " = 0", 13, "middle", GR, 600))
o.append(text(xh, yh[1] + hh / 2 + 36, "φ′(" + I("z") + SUB("2") + ") = 0   (" + T["inactive"] + ")", 12, "middle", SLATE))
o.append(text(xh, yh[0] - hh / 2 - 26, "φ′(" + I("z") + SUB("1") + ") = 1", 12, "middle", SLATE))
o.append(text(xo, yo - hh / 2 - 12, B("δ") + SUP("(2)") + " = 0.56", 13, "middle", RED, 600))
# legend
o.append(text(8, H - 34, T["leg1"], 12, "start", NAVY))
o.append(text(8, H - 16, T["leg2"], 12, "start", RED, 600))
write(o, "fig-02-6", L)
