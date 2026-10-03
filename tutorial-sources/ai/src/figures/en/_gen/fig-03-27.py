import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(t1="One cell, 9 anchors", t2="Before NMS", t3="After NMS at 0.5",
                cell="one cell", leg1="3 scales (colour) × 3 aspect ratios", leg2="1 : 2,  1 : 1,  2 : 1  →  9 anchors",
                img="image", supp="suppressed", iou="IoU 0.681 with A", keep="kept"),
     "zh": dict(t1="一个单元格，9 个锚框", t2="NMS 之前", t3="阈值 0.5 的 NMS 之后",
                cell="一个单元格", leg1="3 种尺度（颜色）× 3 种长宽比", leg2="1 : 2，1 : 1，2 : 1  →  9 个锚框",
                img="图像", supp="被抑制", iou="与 A 的 IoU 为 0.681", keep="保留")}[L]
W, H = 720, 300
o = open_svg(W, H, L)
# ---- left: anchors
x0, y0, w0, h0 = 16, 44, 262, 200
o.append(text(x0 + w0 / 2, 24, T["t1"], 14, "middle", NAVY, 600))
o.append(f'<rect x="{x0}" y="{y0}" width="{w0}" height="{h0}" rx="6" fill="#F8FAFC" stroke="{MUTED}" stroke-width="1.2"/>')
g = 20
for i in range(1, int(w0 // g) + 1):
    o.append(line(x0 + i * g, y0, x0 + i * g, y0 + h0, BORDER, 0.8))
for j in range(1, int(h0 // g) + 1):
    o.append(line(x0, y0 + j * g, x0 + w0, y0 + j * g, BORDER, 0.8))
cx, cy = x0 + 130, y0 + 100
o.append(f'<rect x="{cx-g/2}" y="{cy-g/2}" width="{g}" height="{g}" fill="{F_AMBER}" stroke="{AMBER}" stroke-width="2"/>')
cols = [BLUE, GREEN, ORANGE]
for s, c in zip((34, 68, 102), cols):
    for r in (0.5, 1, 2):
        w, h = s * math.sqrt(r), s / math.sqrt(r)
        o.append(f'<rect x="{cx-w/2:.1f}" y="{cy-h/2:.1f}" width="{w:.1f}" height="{h:.1f}" fill="none" stroke="{c}" stroke-width="1.6"/>')
o.append(circle(cx, cy, 2.5, AMBER, AMBER, 1))
o.append(text(x0 + 6, y0 + h0 - 7, T["img"], 12, "start", SLATE))
o.append(f'<rect x="{x0+8}" y="{y0+8}" width="10" height="10" fill="{F_AMBER}" stroke="{AMBER}" stroke-width="1.6"/>')
o.append(text(x0 + 23, y0 + 18, T["cell"], 12, "start", AMBER, 600))
o.append(text(x0 + w0 / 2, y0 + h0 + 26, T["leg1"], 12, "middle", SLATE))
o.append(text(x0 + w0 / 2, y0 + h0 + 44, T["leg2"], 12, "middle", SLATE))
# ---- right: A-D
k = 5.2
boxes = {"A": ((0, 0, 10, 10), 0.9, BLUE), "B": ((1, 1, 11, 11), 0.8, ORANGE),
         "C": ((20, 20, 30, 30), 0.7, GREEN), "D": ((5, 5, 15, 15), 0.6, PURPLE)}
def panel(px, py, title, after):
    o.append(text(px + 95, 24, title, 14, "middle", NAVY, 600))
    o.append(f'<rect x="{px}" y="{y0}" width="190" height="{h0}" rx="6" fill="#F8FAFC" stroke="{MUTED}" stroke-width="1.2"/>')
    for n in "ABCD":
        (a, b, c, d), sc, col = boxes[n]
        X, Y, Ww, Hh = px + 16 + a * k, py + b * k, (c - a) * k, (d - b) * k
        sup = after and n == "B"
        st, fl, dash = (MUTED, "none", ' stroke-dasharray="5 4"') if sup else (col, "none", "")
        o.append(f'<rect x="{X}" y="{Y}" width="{Ww}" height="{Hh}" fill="{fl}" stroke="{st}" stroke-width="2"{dash}/>')
        lab = f"{n} {sc}"
        tc = MUTED if sup else col
        if n == "A": o.append(text(X, Y - 5, lab, 12, "start", tc, 600, halo=True))
        if n == "B": o.append(text(X + Ww + 5, Y + 11, lab, 12, "start", tc, 600, halo=True))
        if n == "C": o.append(text(X, Y - 5, lab, 12, "start", tc, 600, halo=True))
        if n == "D": o.append(text(X + Ww + 4, Y + Hh + 14, lab, 12, "end", tc, 600, halo=True))
px1, px2, py = 300, 510, y0 + 28
panel(px1, py, T["t2"], False)
panel(px2, py, T["t3"], True)
o.append(text(px2 + 95, y0 + h0 + 26, "B: " + T["supp"] + " (" + T["iou"] + ")", 12, "middle", SLATE))
o.append(text(px2 + 95, y0 + h0 + 44, "A, C, D: " + T["keep"], 12, "middle", SLATE))
write(o, "fig-03-27", L)
