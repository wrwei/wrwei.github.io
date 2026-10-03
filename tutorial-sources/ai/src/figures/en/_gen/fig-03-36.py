import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(inp="input", cnn="CNN", maps="last convolutional maps", head=("global average pooling", "+ linear head"), score="class score",
                back="backward: ", avg=("global average of", "the gradients"), relu="ReLU", coarse="coarse map", ov=("upsample,", "overlay")),
     "zh": dict(inp="输入", cnn="CNN", maps="最后一层卷积特征图", head=("全局平均池化", "+ 线性头"), score="类别得分",
                back="反向传播：", avg=("梯度的", "全局平均"), relu="ReLU", coarse="粗略热图", ov=("上采样并", "叠加到输入"))}[L]
W, H = 720, 350
o = open_svg(W, H, L, extra_defs=f'<marker id="ahrd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{RED}"/></marker>')
A = lambda k: I("A") + SUP(k)
def sbox(x, y, w, h, fill, stroke, lines, sz=12.5, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{stroke}" stroke-width="1.8"{d}/>')
    n = len(lines)
    for i, s in enumerate(lines):
        o.append(text(x + w / 2, y + h / 2 + 4.5 + (i - (n - 1) / 2) * 16, s, sz, "middle"))
cy1 = 70
# ---- input image with a picture and the overlay blob
o.append(text(51, 28, T["inp"], 12.5, "middle", SLATE, 600))
o.append(f'<rect x="16" y="35" width="70" height="70" rx="4" fill="#F8FAFC" stroke="{NAVY}" stroke-width="1.6"/>')
o.append(f'<path d="M16,92 L38,70 L52,84 L66,62 L86,86 L86,105 L16,105 z" fill="#CBD5E1" stroke="none"/>')
o.append(circle(66, 52, 7, "#FDE68A", "none", 0))
o.append(f'<ellipse cx="60" cy="74" rx="15" ry="12" fill="{RED}" fill-opacity="0.35"/>')
o.append(f'<ellipse cx="60" cy="74" rx="7" ry="6" fill="{RED}" fill-opacity="0.45"/>')
o.append(f'<rect x="16" y="35" width="70" height="70" rx="4" fill="none" stroke="{NAVY}" stroke-width="1.6"/>')
o.append(line(88, cy1, 114, cy1, SLATE, 1.8, "ah"))
# ---- CNN
sbox(116, 48, 80, 44, F_BLUE, BLUE, [T["cnn"]], 13)
o.append(line(198, cy1, 232, cy1, SLATE, 1.8, "ah"))
# ---- stack of maps
for k, d in enumerate((18, 12, 6, 0)):
    fill = F_GREEN if k == 3 else "#FFFFFF"
    o.append(f'<rect x="{236+d}" y="{62-d}" width="50" height="50" fill="{fill}" stroke="{GREEN}" stroke-width="1.6"/>')
o.append(text(261, 92, A("1"), 13, "middle", GREEN, 600))
o.append(text(310, 52, A("K"), 13, "start", GREEN, 600))
o.append(text(272, 28, T["maps"], 12.5, "middle", SLATE, 600))
o.append(line(307, cy1, 342, cy1, SLATE, 1.8, "ah"))
# ---- head
sbox(344, 48, 134, 44, F_SKY, SKY, list(T["head"]), 12.5)
o.append(line(480, cy1, 514, cy1, SLATE, 1.8, "ah"))
sbox(516, 50, 62, 40, F_ORANGE, ORANGE, [I("y") + SUP("c")], 15)
o.append(text(547, 108, T["score"], 12, "middle", SLATE))
# ---- backward path
yb = 150
o.append(f'<path d="M547,114 L547,{yb} L270,{yb} L270,114" fill="none" stroke="{RED}" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#ahrd)"/>')
o.append(text(420, yb - 7, T["back"] + "∂" + I("y") + SUP("c") + " / ∂" + A("k") + SUB("ij"), 12.5, "middle", RED, 600))
# ---- alpha box
sbox(340, 178, 150, 44, F_RED, RED, [T["avg"][0], T["avg"][1] + " → " + I("α") + SUB("k") + SUP("c")], 12.5, "6 4")
o.append(line(415, yb + 2, 415, 176, RED, 1.8, "ahr", "5 4"))
# ---- sum
sbox(170, 178, 130, 44, F_BLUE, BLUE, ["Σ" + SUB("k") + " " + I("α") + SUB("k") + SUP("c") + " " + A("k")], 14)
o.append(line(340, 200, 302, 200, RED, 1.8, "ahr", "5 4"))
o.append(f'<path d="M248,114 L248,176" fill="none" stroke="{SLATE}" stroke-width="1.8" marker-end="url(#ah)"/>')
# ---- ReLU
sbox(190, 256, 80, 38, F_AMBER, AMBER, [T["relu"]], 13)
o.append(line(235, 224, 235, 254, SLATE, 1.8, "ah"))
# ---- coarse 16x16 map
gx, gy, gc = 92, 248, 5
import math
for r in range(16):
    for c in range(16):
        v = math.exp(-(((c - 8.4) ** 2 + (r - 7.2) ** 2) / 12.0))
        a = round(0.08 + 0.85 * v, 2)
        o.append(f'<rect x="{gx+c*gc}" y="{gy+r*gc}" width="{gc}" height="{gc}" fill="{RED}" fill-opacity="{a}" stroke="#FFFFFF" stroke-width="0.6"/>')
o.append(f'<rect x="{gx}" y="{gy}" width="{16*gc}" height="{16*gc}" fill="none" stroke="{NAVY}" stroke-width="1.5"/>')
o.append(text(gx + 8 * gc, gy + 16 * gc + 17, "16 × 16 " + T["coarse"] if L == "en" else "16 × 16 " + T["coarse"], 12, "middle", SLATE))
o.append(line(188, 275, gx + 16 * gc + 4, 275, SLATE, 1.8, "ah"))
# ---- upsample + overlay arrow to the input
o.append(line(50, gy - 4, 50, 109, SLATE, 1.8, "ah"))
o.append(text(58, 170, T["ov"][0], 12.5, "start", SLATE, 600))
o.append(text(58, 186, T["ov"][1], 12.5, "start", SLATE, 600))
write(o, "fig-03-36", L)
