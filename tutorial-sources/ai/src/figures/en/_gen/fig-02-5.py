import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(fwd="forward pass", bwd="backward pass", kept="kept for backward", gate="gated by", gs="", affine="affine", loss="loss"),
     "zh": dict(fwd="前向传播", bwd="反向传播", kept="为反向传播保留", gate="由", gs=" 门控", affine="仿射", loss="损失")}[L]
W, H = 750, 352
o = open_svg(W, H, L)
xs = [90, 190, 290, 390, 490, 590, 690]
yf = 70
hv = lambda n: B("h") + SUP(f"({n})")
zv = lambda n: B("z") + SUP(f"({n})")
dv = lambda n: B("δ") + SUP(f"({n})")
nodes = [(hv(0) + " = " + B("x"), 66), (zv(1), 46), (hv(1), 46), (zv(2), 46), (hv(2), 46), (zv(3), 46), ("𝓛", 40)]
o.append(text(8, 20, T["fwd"], 12, "start", SLATE, 700))
for i, (lab, w) in enumerate(nodes):
    o.append(rect(xs[i] - w / 2, yf - 18, w, 36, F_SKY if i in (0,) else (F_GREEN if i == 6 else "#FFFFFF"), SKY if i == 0 else (GREEN if i == 6 else NAVY), 1.5, 8))
    o.append(text(xs[i], yf + 5, lab, 14, "middle", NAVY))
lab_ar = [T["affine"], "φ", T["affine"], "φ", T["affine"], T["loss"]]
for i in range(6):
    a, b = xs[i] + nodes[i][1] / 2 + 2, xs[i + 1] - nodes[i + 1][1] / 2 - 2
    o.append(line(a, yf, b, yf, stroke=SLATE, sw=1.6, marker="ah"))
    o.append(text((a + b) / 2, yf - 8, lab_ar[i], 11, "middle", SLATE))
# stored tensors under nodes 0..5
ysb = 112
for i in range(6):
    o.append(line(xs[i], yf + 18, xs[i], ysb, stroke=MUTED, sw=1))
    o.append(rect(xs[i] - 17, ysb, 34, 15, F_BLUE, BLUE, 1.3, 3))
o.append(rect(xs[6] - 17, ysb, 34, 15, F_BLUE, BLUE, 1.3, 3))
o.append(text(xs[6], ysb + 32, T["kept"], 12, "middle", BLUE, 600))
# gradient boxes at x of h(l-1): l=1 -> xs[0], l=2 -> xs[2], l=3 -> xs[4]
yg = 196
gx = {1: xs[0], 2: xs[2], 3: xs[4]}
zx = {1: xs[1], 2: xs[3], 3: xs[5]}
yd = 300
for l in (1, 2, 3):
    w = 160
    o.append(rect(gx[l] - w / 2, yg - 18, w, 36, F_ORANGE, ORANGE, 1.5, 8))
    o.append(text(gx[l], yg + 5, "∂𝓛/∂" + B("W") + SUP(f"({l})") + " = " + hv(l - 1) + dv(l) + SUP("ᵀ"), 13, "middle", NAVY))
    # dotted line to the stored h(l-1)
    o.append(line(gx[l], yg - 18, gx[l], ysb + 15, stroke=BLUE, sw=1.4, dash="2 3"))
    # delta -> gradient branch
    o.append(line(zx[l] - 6, yd - 20, gx[l] + 40, yg + 20, stroke=ORANGE, sw=1.6, marker="ah"))
o.append(text(8, yd - 54, T["bwd"], 12, "start", SLATE, 700))
# delta nodes
dw = {1: 56, 2: 56, 3: 112}
for l in (1, 2, 3):
    o.append(rect(zx[l] - dw[l] / 2, yd - 18, dw[l], 36, F_RED, RED, 1.5, 8))
    o.append(text(zx[l], yd + 5, dv(l) + (" = " + B("p̂") + " − " + B("y") if l == 3 else ""), 14, "middle", NAVY))
for l in (3, 2):
    a = zx[l] - dw[l] / 2 - 2; b = zx[l - 1] + dw[l - 1] / 2 + 2
    o.append(line(a, yd, b, yd, stroke=RED, sw=1.8, marker="ahr"))
    o.append(text((a + b) / 2, yd + 18, B("W") + SUP(f"({l})") + dv(l), 12, "middle", NAVY))
    o.append(text((a + b) / 2, yd + 34, T["gate"] + " φ′(" + zv(l - 1) + ")" + T["gs"], 12, "middle", SLATE))
write(o, "fig-02-5", L)
