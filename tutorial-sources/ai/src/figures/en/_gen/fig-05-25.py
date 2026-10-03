# Figure 5.25: one 1D Fourier layer. The spectrum bars are the rfft of a sample field on 64 points
# (33 modes), with the k_max = 16 lowest kept, as in the worked example.  python fig-05-25.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from _common import *
l = lang()
T = {"en": dict(fft="FFT", ifft="inverse FFT", keep="keep the lowest", keep2="modes (here 16)", zero="rest set to 0",
                mode="mode →", R="learned ", R2="complex matrix per mode", W="pointwise linear map, + bias",
                sig="σ", kmax="k"),
     "zh": dict(fft="FFT", ifft="逆 FFT", keep="保留最低的", keep2="个模态（此处 16）", zero="其余置 0",
                mode="模态 →", R="每个模态一个可学习的 ", R2="复矩阵", W="逐点线性映射，加偏置",
                sig="σ", kmax="k")}[l]
P = open_svg(740, 280, l)
V = B("v")
def vsub(s): return V + SUB(s)
UY, LY = 70, 228          # centre lines of the two paths
MY = (UY + LY) / 2        # input / output line
BH = 44
# input
P.append(rect(12, MY - 22, 56, 44, F_BLUE, BLUE, 1.6, 8)); P.append(text(40, MY + 5, vsub("l"), 15, "middle", NAVY, "600"))
P.append(f'<polyline points="68,{MY} 86,{MY} 86,{UY} 104,{UY}" fill="none" stroke="{SLATE}" stroke-width="1.6" marker-end="url(#ah)"/>')
P.append(f'<polyline points="86,{MY} 86,{LY} 300,{LY}" fill="none" stroke="{SLATE}" stroke-width="1.6" marker-end="url(#ah)"/>')
# upper path: FFT
P.append(rect(106, UY - BH / 2, 62, BH, F_SKY, SKY, 1.6, 8)); P.append(text(137, UY + 5, T["fft"], 14, "middle", NAVY, "700"))
P.append(text(137, UY + BH / 2 + 16, "ℱ", 13, "middle", SLATE))
P.append(line(168, UY, 186, UY, SLATE, 1.6, "ah"))
# spectrum panel (computed)
n = 64; x = np.arange(n) / n
rng = np.random.default_rng(3)
# a smooth field with a decaying spectrum: amplitude (1 + k)^-0.7, random phases
kk = np.arange(1, 33)
v = sum((1 + k) ** -0.7 * (0.6 + 0.8 * rng.random()) * np.cos(2 * np.pi * k * x + 2 * np.pi * rng.random()) for k in kk)
mag = np.abs(np.fft.rfft(v)); mag[0] = 0.0; mag = mag / mag.max()
K = 16; nm = len(mag); assert nm == 33
px0, px1, py0, py1 = 188, 368, UY - 42, UY + 30
P.append(rect(px0, py0, px1 - px0, py1 - py0, "#FFFFFF", NAVY, 1.6, 8))
step = (px1 - px0 - 16) / nm; bw = step * 0.72; base = py1 - 10; hmax = py1 - py0 - 22
for k in range(nm):
    hx = px0 + 8 + k * step
    h = max(1.5, mag[k] * hmax)
    if k < K:
        P.append(f'<rect x="{hx:.1f}" y="{base-h:.1f}" width="{bw:.1f}" height="{h:.1f}" fill="{BLUE}"/>')
    else:
        P.append(f'<rect x="{hx:.1f}" y="{base-h:.1f}" width="{bw:.1f}" height="{h:.1f}" fill="none" stroke="{MUTED}" stroke-width="0.8" stroke-dasharray="2 1.5"/>')
P.append(line(px0 + 6, base, px1 - 6, base, SLATE, 1))
cut = px0 + 8 + K * step - (step - bw) / 2
P.append(line(cut, py0 + 6, cut, base + 4, RED, 1.4, dash="4 3"))
P.append(text(px0 + 8 + K * step / 2, py0 - 8, T["keep"] + " " + I(T["kmax"]) + SUB("max") + " " + T["keep2"], 12, "middle", NAVY, "600"))
P.append(text(cut + 4 + (px1 - 6 - cut) / 2, py0 + 14, T["zero"], 11, "middle", RED))
P.append(text(px0 + 4, py1 + 14, T["mode"], 11, "start", SLATE))
P.append(line(368, UY, 392, UY, SLATE, 1.6, "ah"))
# R
P.append(rect(394, UY - BH / 2, 70, BH, F_PURPLE, PURPLE, 1.6, 8)); P.append(text(429, UY + 5, "× " + I("R") + SUB("l"), 15, "middle", NAVY, "700"))
P.append(text(429, UY + BH / 2 + 16, T["R"] + I("d") + SUB("v") + " × " + I("d") + SUB("v"), 11, "middle", SLATE))
P.append(text(429, UY + BH / 2 + 30, T["R2"], 11, "middle", SLATE))
P.append(line(464, UY, 486, UY, SLATE, 1.6, "ah"))
# inverse FFT
P.append(rect(488, UY - BH / 2, 96, BH, F_SKY, SKY, 1.6, 8)); P.append(text(536, UY + 5, T["ifft"], 14, "middle", NAVY, "700"))
P.append(text(536, UY + BH / 2 + 16, "ℱ⁻¹", 13, "middle", SLATE))
# lower path: W
P.append(rect(302, LY - BH / 2, 110, BH, F_ORANGE, ORANGE, 1.6, 8)); P.append(text(357, LY + 5, B("W") + " " + vsub("l"), 15, "middle", NAVY, "700"))
P.append(text(357, LY + BH / 2 + 16, T["W"], 11, "middle", SLATE))
# sum, sigma, output
SX = 612
P.append(f'<polyline points="584,{UY} {SX},{UY} {SX},{MY-15}" fill="none" stroke="{SLATE}" stroke-width="1.6" marker-end="url(#ah)"/>')
P.append(f'<polyline points="412,{LY} {SX},{LY} {SX},{MY+15}" fill="none" stroke="{SLATE}" stroke-width="1.6" marker-end="url(#ah)"/>')
P.append(circle(SX, MY, 13, "#FFFFFF", NAVY, 1.6)); P.append(text(SX, MY + 6, "+", 18, "middle", NAVY, "600"))
P.append(line(SX + 13, MY, 640, MY, SLATE, 1.6, "ah"))
P.append(rect(642, MY - 20, 40, 40, F_GREEN, GREEN, 1.6, 8)); P.append(text(662, MY + 6, I(T["sig"]), 16, "middle", NAVY, "700"))
P.append(line(682, MY, 698, MY, SLATE, 1.6, "ah"))
P.append(text(701, MY + 5, vsub("l+1"), 15, "start", NAVY, "600"))
write(P, "fig-05-25", l)
