import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(kept="shaded: kept for the backward pass", bcast="copied down the rows (broadcast)", flops="FLOPs", logits="logits"),
     "zh": dict(kept="阴影：为反向传播保留的张量", bcast="沿行复制（广播）", flops="FLOPs", logits="logits")}[L]
W, H = 740, 476
o = open_svg(W, H, L)
S = 0.68
def dim(n, mn=14): return max(n * S, mn)
def mat(x, cy, r, c, name, shape, kept=False, ghost=False):
    w, h = dim(c), dim(r)
    if r == 1: h = 5
    y = cy - h / 2
    o.append(rect(x, y, w, h, F_BLUE if kept else "#FFFFFF", BLUE if kept else NAVY, 1.5, 3))
    o.append(text(x + w / 2, y - 19, name, 13, "middle", NAVY, 600))
    o.append(text(x + w / 2, y - 6, shape, 11, "middle", SLATE))
    return w
def op(x, cy, s): o.append(text(x, cy + 6, s, 18, "middle", SLATE))
def phi(x1, x2, cy):
    o.append(line(x1, cy, x2, cy, stroke=SLATE, sw=1.5, marker="ah"))
    o.append(text((x1 + x2) / 2, cy - 7, "φ", 14, "middle", SLATE))
def cost(xc, y, s): o.append(text(xc, y, s + " " + T["flops"], 12, "middle", ORANGE, 600))
G = 26
X0 = 40
# row 1
cy = 96; h64 = dim(64)
x = X0
w = mat(x, cy, 64, 64, B("X"), "64×64 = B×" + I("d") + SUB("0"), True); x += w + G; op(x - G / 2, cy, "×")
xW = x; w = mat(x, cy, 64, 128, B("W") + SUP("(1)"), "64×128"); x += w + G; op(x - G / 2, cy, "+")
w = mat(x, cy - h64 / 2 + 2.5, 1, 128, B("b") + SUP("(1)ᵀ"), "1×128")
o.append(rect(x, cy - h64 / 2 + 5, w, h64 - 5, "none", MUTED, 1.2, 3, ' stroke-dasharray="4 3"'))
o.append(text(x + w / 2, cy + 8, "↓  ↓  ↓", 14, "middle", MUTED))
o.append(text(x + w / 2, cy + h64 / 2 + 15, T["bcast"], 11, "middle", SLATE))
xb = x; x += w + G; op(x - G / 2, cy, "=")
w = mat(x, cy, 64, 128, B("Z") + SUP("(1)"), "64×128", True); x += w + 8
phi(x, x + 40, cy); x += 48
mat(x, cy, 64, 128, B("H") + SUP("(1)"), "64×128", True)
cost(xW + dim(128) / 2, cy + h64 / 2 + 36, "2·64·64·128 = 1,048,576")
# row 2
cy = 250
x = X0
w = mat(x, cy, 64, 128, B("H") + SUP("(1)"), "64×128", True); x += w + G; op(x - G / 2, cy, "×")
xW = x; w = mat(x, cy, 128, 128, B("W") + SUP("(2)"), "128×128"); x += w + G; op(x - G / 2, cy, "=")
w = mat(x, cy, 64, 128, B("Z") + SUP("(2)"), "64×128", True); x += w + 8
phi(x, x + 40, cy); x += 48
mat(x, cy, 64, 128, B("H") + SUP("(2)"), "64×128", True)
cost(xW + dim(128) / 2, cy + dim(128) / 2 + 20, "2·64·128·128 = 2,097,152")
# row 3
cy = 396
x = X0
w = mat(x, cy, 64, 128, B("H") + SUP("(2)"), "64×128", True); x += w + 40; op(x - 20, cy, "×")
xW = x; w = mat(x, cy, 128, 10, B("W") + SUP("(3)"), "128×10"); x += w + 48; op(x - 24, cy, "=")
mat(x, cy, 64, 10, T["logits"], "64×10", True)
cost(xW + 6, cy + dim(128) / 2 + 20, "2·64·128·10 = 163,840")
# legend
o.append(rect(470, 420, 22, 14, F_BLUE, BLUE, 1.5, 3))
o.append(text(500, 432, T["kept"], 12, "start", SLATE))
write(o, "fig-02-4", L)
