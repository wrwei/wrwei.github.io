# Figure 5.12: one training step of a diffusion model (L_simple, eq. 5.6).  python fig-05-12.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
l = lang()
T = {"en": dict(data=" from the data", unif="uniform on {1, …, " + I("T") + "}", noise="noise", noisy="noisy input, equation (5.4)",
                net="network", loss="squared error", target="target: the same " + B("ε"), xt="input", pred="prediction"),
     "zh": dict(data=" 取自数据", unif="在 {1, …, " + I("T") + "} 上均匀", noise="噪声", noisy="加噪输入，式 (5.4)",
                net="网络", loss="平方误差", target="目标：同一个 " + B("ε"), xt="输入", pred="预测")}[l]
W, H = 760, 226
o = open_svg(W, H, l)
x0v = B("x") + "₀"
xtv = B("x") + "ₜ"
epsv = B("ε")
eth = epsv + SUB("θ")
# sources
SX, SW, SH = 10, 182, 40
src = [(46, I("t") + " ~ " + T["unif"], F_PURPLE, PURPLE),
       (120, x0v + T["data"], F_GREEN, GREEN),
       (194, epsv + " ~ 𝒩(" + B("0") + ", " + B("I") + ")", F_ORANGE, ORANGE)]
for cy, s, f, c in src:
    o.append(rect(SX, cy - SH / 2, SW, SH, f, c, 1.5))
    o.append(text(SX + SW / 2, cy + 5, s, 13, "middle", NAVY))
# noising box
NX, NW, NY, NH = 222, 214, 96, 48
o.append(rect(NX, NY, NW, NH, F_BLUE, BLUE, 1.6))
o.append(text(NX + NW / 2, NY + 29, xtv + " = √ᾱₜ " + x0v + " + √(1 − ᾱₜ) " + epsv, 14, "middle", NAVY))
o.append(text(NX + NW / 2 + 22, NY + NH + 17, T["noisy"], 12, "middle", SLATE))
# network
MX, MW = 494, 92
o.append(rect(MX, NY, MW, NH, "#FFFFFF", NAVY, 1.8))
o.append(text(MX + MW / 2, NY + 22, eth, 16, "middle", NAVY))
o.append(text(MX + MW / 2, NY + 39, T["net"], 12, "middle", SLATE))
# loss
LX, LW = 648, 104
o.append(rect(LX, NY, LW, NH, F_RED, RED, 1.6))
o.append(text(LX + LW / 2, NY + 20, T["loss"], 12, "middle", SLATE))
o.append(text(LX + LW / 2, NY + 38, "‖" + epsv + " − " + eth + "‖²", 14, "middle", NAVY))
cy = NY + NH / 2
# x0 -> noising
o.append(line(SX + SW, cy, NX - 1, cy, SLATE, 1.6, "ah"))
# t over the top: to the noising box (for ᾱ_t) and to the network
bx = NX + 26
tx = MX + MW / 2
o.append(f'<polyline points="{SX + SW},46 {tx},46 {tx},{NY - 1}" fill="none" stroke="{PURPLE}" stroke-width="1.6"/>')
o.append(line(tx, NY - 10, tx, NY - 1, PURPLE, 1.6, "ah"))
o.append(line(bx, 46, bx, NY - 1, PURPLE, 1.6, "ah"))
o.append(circle(bx, 46, 3, PURPLE, PURPLE, 1))
o.append(text(tx + 8, 70, I("t"), 13, "start", PURPLE))
# eps along the bottom: into the noising box and on to the loss as the target
lx = LX + LW / 2
o.append(f'<polyline points="{SX + SW},194 {lx},194 {lx},{NY + NH + 1}" fill="none" stroke="{ORANGE}" stroke-width="1.6"/>')
o.append(line(lx, NY + NH + 10, lx, NY + NH + 1, ORANGE, 1.6, "ah"))
o.append(line(bx, 194, bx, NY + NH + 25, ORANGE, 1.6))
o.append(line(bx, NY + NH + 25, bx, NY + NH + 1, ORANGE, 1.6, "ah"))
o.append(circle(bx, 194, 3, ORANGE, ORANGE, 1))
o.append(text(lx - 8, 214, T["target"], 12, "end", ORANGE))
# noising -> network -> loss
o.append(line(NX + NW, cy, MX - 1, cy, SLATE, 1.6, "ah"))
o.append(text((NX + NW + MX) / 2, cy - 8, "(" + xtv + ", " + I("t") + ")", 12, "middle", NAVY))
o.append(line(MX + MW, cy, LX - 1, cy, SLATE, 1.6, "ah"))
o.append(text((MX + MW + LX) / 2, cy + 20, T["pred"], 11, "middle", SLATE))
write(o, "fig-05-12", l)
