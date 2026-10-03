import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
import numpy as np
L = lang()
T = {"en": dict(pieces="pieces", deep="deep: k layers of 2 ReLU units", deepp="6k + 1 parameters",
                shallow="one hidden layer: 2ᵏ − 1 units", shallowp="3(2ᵏ − 1) + 1 parameters",
                hdr=("k", "deep", "one hidden layer"), left="the sawtooth tᵏ on [0, 1]", tab="parameter counts",
                layer="layer"),
     "zh": dict(pieces="段", deep="深层：k 层，每层 2 个 ReLU 单元", deepp="6k + 1 个参数",
                shallow="单隐藏层：2ᵏ − 1 个单元", shallowp="3(2ᵏ − 1) + 1 个参数",
                hdr=("k", "深层", "单隐藏层"), left="[0, 1] 上的锯齿函数 tᵏ", tab="参数个数",
                layer="层")}[L]
W, H = 720, 434
o = open_svg(W, H, L)
t = lambda x: np.where(x <= 0.5, 2 * x, 2 - 2 * x)
xs = np.linspace(0, 1, 4097)
ys = [t(xs)]
for _ in range(3):
    ys.append(t(ys[-1]))
names = ["t", "t∘t", "t³", "t⁴"]
pcs = [2, 4, 8, 16]
pw, ph = 140, 112
ox, oy = 28, 52
o.append(text(4, 20, T["left"], 13, "start", NAVY, 600))
for i in range(4):
    r, c = divmod(i, 2)
    x0 = ox + c * (pw + 36)
    y0 = oy + r * (ph + 70)
    o.append(f'<rect x="{x0}" y="{y0}" width="{pw}" height="{ph}" fill="none" stroke="{BORDER}" stroke-width="1"/>')
    o.append(line(x0, y0 + ph, x0 + pw, y0 + ph, stroke=MUTED, sw=1.2))
    o.append(line(x0, y0, x0, y0 + ph, stroke=MUTED, sw=1.2))
    pts = " ".join(f"{x0 + x * pw:.1f},{y0 + ph - y * ph:.1f}" for x, y in zip(xs[::8], ys[i][::8]))
    o.append(f'<polyline points="{pts}" fill="none" stroke="{BLUE}" stroke-width="1.8" stroke-linejoin="round"/>')
    o.append(text(x0 + pw / 2, y0 + ph + 17, f"{names[i]}: {pcs[i]} {T['pieces']}", 13, "middle", NAVY, 600))
    o.append(text(x0 - 4, y0 + 4, "1", 11, "end", SLATE)); o.append(text(x0 - 4, y0 + ph + 4, "0", 11, "end", SLATE))
    o.append(text(x0, y0 + ph + 32, "0", 11, "middle", SLATE)); o.append(text(x0 + pw, y0 + ph + 32, "1", 11, "middle", SLATE))
# right: deep and shallow networks
rx = 384
o.append(text(rx, 20, T["deep"], 13, "start", NAVY, 600))
def node(x, y, fill, st): return circle(x, y, 8, fill, st, 1.5)
dy = 58
xin = rx + 14
groups = [rx + 78, rx + 134, None, rx + 246]
o.append(node(xin, dy, F_SKY, SKY))
prev = [(xin, dy)]
for gi, gx in enumerate(groups):
    if gx is None:
        o.append(text((rx + 134 + rx + 246) / 2, dy + 5, "⋯", 18, "middle", SLATE))
        for yy in (dy - 14, dy + 14):
            o.append(line(rx + 134 + 8, yy, rx + 134 + 28, yy, stroke=MUTED, sw=1, dash="3 3"))
            o.append(line(rx + 246 - 28, yy, rx + 246 - 8, yy, stroke=MUTED, sw=1, dash="3 3"))
        continue
    cur = [(gx, dy - 14), (gx, dy + 14)]
    for a in prev:
        for b in cur:
            o.append(line(a[0] + 8, a[1], b[0] - 8, b[1], stroke=MUTED, sw=1))
    for b in cur:
        o.append(node(b[0], b[1], F_BLUE, BLUE))
    prev = cur
    lab = {0: "1", 1: "2", 3: "k"}[gi]
    o.append(text(gx, dy + 38, f"{T['layer']} {lab}", 11, "middle", SLATE))
# skip over the ellipsis: connect second group to the last with dashed lines
for a in [(rx + 134, dy - 14), (rx + 134, dy + 14)]:
    for b in [(rx + 246, dy - 14), (rx + 246, dy + 14)]:
        pass
xout = rx + 316
for a in prev:
    o.append(line(a[0] + 8, a[1], xout - 8, dy, stroke=MUTED, sw=1))
o.append(node(xout, dy, F_GREEN, GREEN))
o.append(text(rx, dy + 62, T["deepp"], 13, "start", BLUE, 600))
# shallow
sy0 = 164
o.append(text(rx, sy0, T["shallow"], 13, "start", NAVY, 600))
gx = rx + 170
ys_ = [sy0 + 20, sy0 + 44, sy0 + 68]
ysh = ys_ + [sy0 + 84]
o.append(node(xin, sy0 + 66, F_SKY, SKY))
for y in ys_ + [sy0 + 112]:
    o.append(line(xin + 8, sy0 + 66, gx - 8, y, stroke=MUTED, sw=1))
    o.append(line(gx + 8, y, xout - 8, sy0 + 66, stroke=MUTED, sw=1))
for y in ys_ + [sy0 + 112]:
    o.append(node(gx, y, F_ORANGE, ORANGE))
o.append(text(gx, ys_[-1] + 24, "⋮", 16, "middle", SLATE))
o.append(node(xout, sy0 + 66, F_GREEN, GREEN))
o.append(text(rx, sy0 + 138, T["shallowp"], 13, "start", ORANGE, 600))
# table
ty = 342
cols = [rx, rx + 40, rx + 160]
o.append(text(rx, ty - 8, T["tab"], 12, "start", SLATE, 600)) if False else None
hdr = T["hdr"]
o.append(line(rx, ty - 8, rx + 340, ty - 8, stroke=MUTED, sw=1))
for j, h in enumerate(hdr):
    o.append(text([rx + 4, rx + 130, rx + 280][j], ty + 8, h if j else I(h), 12, "middle" if j else "start", SLATE, 600))
o.append(line(rx, ty + 16, rx + 340, ty + 16, stroke=MUTED, sw=1))
rows = [("4", "25", "46"), ("10", "61", "3,070"), ("20", "121", "3,145,726")]
for i, (k, a, b) in enumerate(rows):
    yy = ty + 36 + i * 20
    o.append(text(rx + 4, yy, k, 13, "start", NAVY))
    o.append(text(rx + 130, yy, a, 13, "middle", BLUE, 600))
    o.append(text(rx + 280, yy, b, 13, "middle", ORANGE, 600))
write(o, "fig-02-3", L)
