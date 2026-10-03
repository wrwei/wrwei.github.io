# Figure 5.7: GAN training loop.  python fig-05-7.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
z, x = B("z"), B("x")
DGz = I("D") + "(" + I("G") + "(" + z + "))"
T = {"en": dict(noise="noise " + z, pz="~ " + I("p") + "(" + z + ")", fake="fake samples", real="real samples",
                pdata=x + " ~ " + I("p") + SUB("data"), prob="probability “real”",
                gl="G’s loss: fool " + I("D"), gl2="non-saturating: maximise log " + DGz,
                dl="D’s loss: classify real vs fake", dl2="cross-entropy, label 1 real, 0 fake",
                ug="update " + I("G") + " (gradient passes through " + I("D") + ")", ud="update " + I("D"),
                alt="alternate: one step on " + I("D") + ", one step on " + I("G")),
     "zh": dict(noise="噪声 " + z, pz="~ " + I("p") + "(" + z + ")", fake="假样本", real="真样本",
                pdata=x + " ~ " + I("p") + SUB("data"), prob="“为真”的概率",
                gl="G 的损失：骗过 " + I("D"), gl2="非饱和：最大化 log " + DGz,
                dl="D 的损失：区分真与假", dl2="交叉熵，真为 1、假为 0",
                ug="更新 " + I("G") + "（梯度穿过 " + I("D") + "）", ud="更新 " + I("D"),
                alt="交替：" + I("D") + " 走一步，" + I("G") + " 走一步")}[L]
W, H = 720, 350
o = open_svg(W, H, L, extra_defs=''.join(
    f'<marker id="{i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
    f'<path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>' for i, c in (("aho", ORANGE), ("ahp", PURPLE))))

def box(cx, cy, w, h, l1, fill, stroke, l2=None, size=14, weight=None, c1=NAVY):
    o.append(rect(cx - w / 2, cy - h / 2, w, h, fill, stroke, 1.6, 8))
    if l2 is None:
        o.append(text(cx, cy + size * 0.35, l1, size, "middle", c1, weight))
    else:
        o.append(text(cx, cy - 4, l1, size, "middle", c1, weight))
        o.append(text(cx, cy + 15, l2, 12.5, "middle", NAVY))

def arrow(x1, y1, x2, y2, c=SLATE, m="ah"):
    o.append(line(x1, y1, x2, y2, c, 1.6, marker=m))

def path(pts, c, m):
    d = " L".join(f"{a},{b}" for a, b in pts)
    o.append(f'<path d="M{d}" fill="none" stroke="{c}" stroke-width="1.7" stroke-dasharray="6 4" marker-end="url(#{m})"/>')

yt, ym, yb = 128, 186, 244
box(62, yt, 96, 46, T["noise"], "#FFFFFF", SLATE, T["pz"], 13)
box(170, yt, 56, 40, I("G"), F_ORANGE, ORANGE, size=17, weight="700", c1=ORANGE)
box(282, yt, 120, 46, T["fake"], F_ORANGE, ORANGE, I("G") + "(" + z + ")", 13)
box(282, yb, 120, 46, T["real"], F_GREEN, GREEN, T["pdata"], 13)
box(410, ym, 56, 40, I("D"), F_PURPLE, PURPLE, size=17, weight="700", c1=PURPLE)
box(560, ym, 150, 46, I("D") + "(·) ∈ (0, 1)", "#FFFFFF", PURPLE, T["prob"], 13)
arrow(110, yt, 140, yt)
arrow(198, yt, 220, yt)
arrow(342, yt + 10, 380, ym - 12)
arrow(342, yb - 10, 380, ym + 12)
arrow(438, ym, 483, ym)
# loss boxes
box(560, 48, 260, 50, T["gl"], F_ORANGE, ORANGE, T["gl2"], 13, "700", ORANGE)
box(560, 318 - 0, 260, 44, T["dl"], F_PURPLE, PURPLE, T["dl2"], 13, "700", PURPLE)
arrow(560, ym - 23, 560, 75)
arrow(560, ym + 23, 560, 294)
# update paths (dashed)
path([(430, 40), (170, 40), (170, 106)], ORANGE, "aho")
o.append(text(290, 32, T["ug"], 12, "middle", ORANGE, "600"))
path([(430, 318), (410, 318), (410, 208)], PURPLE, "ahp")
o.append(text(400, 300, T["ud"], 12, "end", PURPLE, "600"))
o.append(text(16, 318, T["alt"], 12, "start", SLATE))
write(o, "fig-05-7", L)
