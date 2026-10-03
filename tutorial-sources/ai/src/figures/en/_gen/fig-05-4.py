# Figure 5.4: VAE computation graph with the reparameterisation trick.  python fig-05-4.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
mu, sg, eps, x, z, xh = B("μ"), B("σ"), B("ε"), B("x"), B("z"), B("x̂")
T = {"en": dict(enc="encoder", dec="decoder", ext="external input,", ext2="no parameters",
                rec="reconstruction", kl="KL term", neg="−ELBO", grad="gradient (backward)",
                nog="no gradient into " + eps, sum="sum", exp="exp(½ ·)"),
     "zh": dict(enc="编码器", dec="解码器", ext="外部输入，", ext2="没有参数",
                rec="重建项", kl="KL 项", neg="−ELBO", grad="梯度（反向）",
                nog="梯度不进入 " + eps, sum="相加", exp="exp(½ ·)")}[L]
W, H = 760, 364
o = open_svg(W, H, L)
cy = 180

def box(cx, cy_, w, h, lab, fill, stroke, size=14, lab2=None, weight=None):
    o.append(rect(cx - w / 2, cy_ - h / 2, w, h, fill, stroke, 1.6, 8))
    if lab2 is None:
        o.append(text(cx, cy_ + size * 0.35, lab, size, "middle", NAVY, weight))
    else:
        o.append(text(cx, cy_ - 3, lab, size, "middle", NAVY, weight))
        o.append(text(cx, cy_ + 15, lab2, 13, "middle", NAVY))

def arrow(x1, y1, x2, y2, c=SLATE, m="ah", sw=1.6, dash=None):
    o.append(line(x1, y1, x2, y2, c, sw, marker=m, dash=dash))

# nodes
o.append(circle(34, cy, 17, F_SKY, SKY, 1.6)); o.append(text(34, cy + 5, x, 15, "middle", NAVY))
box(110, cy, 84, 44, T["enc"], F_BLUE, BLUE, 13, I("q") + SUB("φ"), "600")
box(215, 120, 58, 34, mu, "#FFFFFF", BLUE, 15)
box(215, 240, 78, 34, "log " + sg + "²", "#FFFFFF", BLUE, 14)
box(318, 240, 46, 34, sg, "#FFFFFF", BLUE, 15)
box(425, cy, 132, 40, z + " = " + mu + " + " + sg + " ⊙ " + eps, F_GREEN, GREEN, 14)
o.append(f'<circle cx="425" cy="306" r="19" fill="#F1F5F9" stroke="{MUTED}" stroke-width="1.6" stroke-dasharray="4 3"/>')
o.append(text(425, 311, eps, 15, "middle", NAVY))
o.append(text(452, 302, eps + " ~ 𝒩(" + B("0") + ", " + B("I") + ")", 13, "start", NAVY))
o.append(text(452, 318, T["ext"] + " " + T["ext2"], 12, "start", SLATE))
box(545, cy, 78, 44, T["dec"], F_ORANGE, ORANGE, 13, I("p") + SUB("θ"), "600")
o.append(circle(616, cy, 17, F_SKY, SKY, 1.6)); o.append(text(616, cy + 5, xh, 15, "middle", NAVY))
box(700, cy, 104, 50, T["rec"], "#FFFFFF", NAVY, 12, "−log " + I("p") + SUB("θ") + "(" + x + " | " + z + ")")
box(318, 52, 160, 50, T["kl"], "#FFFFFF", NAVY, 12, "KL(" + I("q") + SUB("φ") + " ‖ 𝒩(" + B("0") + ", " + B("I") + "))")
box(700, 52, 92, 40, T["neg"], F_RED, RED, 15, weight="700")

# forward arrows
arrow(51, cy, 66, cy)
arrow(152, cy - 12, 184, 128)
arrow(152, cy + 12, 174, 232)
arrow(254, 240, 293, 240); o.append(text(268, 266, T["exp"], 11, "middle", SLATE))
arrow(244, 126, 365, 162)                      # mu -> z
arrow(341, 232, 368, 202)                      # sigma -> z
arrow(425, 287, 425, 202)                      # eps -> z
arrow(491, cy, 504, cy)
arrow(584, cy, 597, cy)
arrow(633, cy, 646, cy)
arrow(700, 155, 700, 74)                       # recon -> -ELBO
arrow(398, 52, 652, 52)                        # KL -> -ELBO
o.append(text(525, 44, T["sum"], 12, "middle", SLATE))
# mu -> KL, sigma -> KL (sigma's line hops over mu -> z)
arrow(215, 103, 262, 79)
o.append(line(318, 223, 318, 79, "#FFFFFF", 6))
arrow(318, 223, 318, 79)

# backward: dashed red, offset below the forward arrows on the z path
def garc(x1, y1, x2, y2, bend):
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    dx, dy = x2 - x1, y2 - y1
    n = (dx * dx + dy * dy) ** 0.5
    cx, cy2 = mx - dy / n * bend, my + dx / n * bend
    o.append(f'<path d="M{x1},{y1} Q{cx:.1f},{cy2:.1f} {x2},{y2}" fill="none" stroke="{RED}" stroke-width="1.8" stroke-dasharray="5 4" marker-end="url(#ahr)"/>')
garc(690, 205, 622, 199, -12)                  # recon -> x-hat
garc(606, 197, 560, 203, -12)                  # x-hat -> decoder
garc(526, 203, 470, 202, -14)                  # decoder -> z
garc(370, 168, 248, 136, 14)                   # z -> mu
garc(392, 202, 344, 250, -8)                   # z -> sigma
# visibly not into eps: a crossed stub
o.append(line(418, 238, 432, 252, RED, 2.2)); o.append(line(432, 238, 418, 252, RED, 2.2))
o.append(text(440, 250, T["nog"], 12, "start", RED, "600"))
# legend
o.append(line(24, 350, 60, 350, RED, 1.8, marker="ahr", dash="5 4"))
o.append(text(68, 354, T["grad"], 12, "start", SLATE))
write(o, "fig-05-4", L)
