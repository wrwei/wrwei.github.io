import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(img="image", r1="One-stage", r2="Two-stage (Faster R-CNN, Mask R-CNN)", r3="Set prediction (DETR)",
                bb="backbone", dh=("dense head:", "class + box per anchor"), nms="NMS",
                rpn=("region proposal", "network"), roi=("RoI pooling", "or RoI align"), cr=("classification +", "box refinement"),
                tr="transformer", npred=("N box predictions", "(most: no object)"), hung=("Hungarian matching", "one-to-one"),
                gt="ground truth", train="training only", nonms="no anchors, no NMS"),
     "zh": dict(img="图像", r1="单阶段", r2="两阶段（Faster R-CNN、Mask R-CNN）", r3="集合预测（DETR）",
                bb="主干网络", dh=("密集检测头：", "每个锚框的类别与框"), nms="NMS",
                rpn=("区域建议", "网络"), roi=("RoI 池化", "或 RoI 对齐"), cr=("分类 +", "框精修"),
                tr="Transformer", npred=("N 个框预测", "（多数为“无目标”）"), hung=("匈牙利匹配", "一对一"),
                gt="真实标注", train="仅用于训练", nonms="无锚框，无 NMS")}[L]
W, H = 720, 372
o = open_svg(W, H, L)
bh = 46
def box(x, y, w, lines, fill, stroke, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{bh}" rx="8" fill="{fill}" stroke="{stroke}" stroke-width="1.8"{d}/>')
    if isinstance(lines, str): lines = (lines,)
    n = len(lines)
    for i, s in enumerate(lines):
        yy = y + bh / 2 + 4.5 + (i - (n - 1) / 2) * 16
        o.append(text(x + w / 2, yy, s, 12.5, "middle", NAVY, 600 if i == 0 and n == 1 else None))
def arrow(x1, x2, y):
    o.append(line(x1, y, x2, y, SLATE, 1.8, "ah"))
def row(title, ty, y, specs):
    o.append(text(16, ty, title, 14, "start", NAVY, 700))
    x = 66
    o.append(text(8, y + bh / 2 + 4.5, T["img"], 12, "start", SLATE))
    arrow(40, x - 2, y + bh / 2) if False else None
    xs = []
    for i, (w, lines, fill, stroke) in enumerate(specs):
        if i == 0: arrow(x - 22 if False else 44, x, y + bh / 2)
        box(x, y, w, lines, fill, stroke)
        xs.append((x, w))
        if i < len(specs) - 1: arrow(x + w, x + w + 22, y + bh / 2)
        x += w + 22
    return xs
# image label placed left; shift text so arrow fits
y1, y2, y3 = 38, 134, 230
xs1 = row(T["r1"], 26, y1, [(120, T["bb"], F_BLUE, BLUE), (210, T["dh"], F_GREEN, GREEN), (96, T["nms"], F_ORANGE, ORANGE)])
xs2 = row(T["r2"], 122, y2, [(108, T["bb"], F_BLUE, BLUE), (108, T["rpn"], F_GREEN, GREEN), (108, T["roi"], F_GREEN, GREEN),
                              (122, T["cr"], F_GREEN, GREEN), (86, T["nms"], F_ORANGE, ORANGE)])
xs3 = row(T["r3"], 218, y3, [(108, T["bb"], F_BLUE, BLUE), (120, T["tr"], F_PURPLE, PURPLE), (150, T["npred"], F_GREEN, GREEN)])
# no NMS note
x3e = xs3[-1][0] + xs3[-1][1]
o.append(text(x3e + 14, y3 + bh / 2 + 4.5, T["nonms"], 12, "start", SLATE))
# Hungarian (training only) below the predictions
px, pw = xs3[-1]
hx, hy, hw = px - 30, 312, 190
o.append(f'<rect x="{hx}" y="{hy}" width="{hw}" height="{bh}" rx="8" fill="{F_RED}" stroke="{RED}" stroke-width="1.8" stroke-dasharray="6 4"/>')
o.append(text(hx + hw / 2, hy + 20, T["hung"][0], 12.5, "middle", NAVY, 600))
o.append(text(hx + hw / 2, hy + 36, T["hung"][1], 12.5, "middle", NAVY))
o.append(line(px + pw / 2, y3 + bh, px + pw / 2, hy, RED, 1.8, "ahr", "5 4"))
gx = hx - 20
o.append(line(gx - 60, hy + bh / 2, hx, hy + bh / 2, RED, 1.8, "ahr", "5 4"))
o.append(text(gx - 64, hy + bh / 2 + 4.5, T["gt"], 12.5, "end", SLATE))
o.append(text(hx + hw + 12, hy + bh / 2 + 4.5, T["train"], 12, "start", RED, 600))
write(o, "fig-03-28", L)
