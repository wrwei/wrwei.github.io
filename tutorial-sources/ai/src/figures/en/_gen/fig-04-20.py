# Figure 4.20: recurrence-convolution duality. Usage: fig-04-20.py en|zh
import math
from _common import *
l = lang()
T = {
 "en": dict(rec="Recurrence", conv="Convolution", imp="input impulse", real="real λ = 0.9: monotone decay", cx=f"complex λ = 0.95·e{SUP(I('iπ/8'))}: damped oscillation, period 16",
            env="envelope ±0.95", norm="(taking c·b = 1)", ker="kernel"),
 "zh": dict(rec="递推", conv="卷积", imp="输入脉冲", real="实数 λ = 0.9：单调衰减", cx=f"复数 λ = 0.95·e{SUP(I('iπ/8'))}：阻尼振荡，周期 16",
            env="包络 ±0.95", norm="（取 c·b = 1）", ker="卷积核"),
}[l]
W, H = 720, 392
p = open_svg(W, H, l)
# ---- left: the loop
p.append(text(110, 24, T["rec"], 15, "middle", NAVY, "700"))
cy = 170
p.append(rect(78, cy-22, 64, 44, F_BLUE, BLUE, 2, 10))
p.append(text(110, cy+6, f'<tspan font-style="italic">h</tspan>{SUB(I("t"))}', 16, "middle", NAVY))
p.append(f'<path d="M 92 {cy-22} C 62 {cy-86}, 158 {cy-86}, 128 {cy-28}" fill="none" stroke="{ORANGE}" stroke-width="2.2" marker-end="url(#ah)"/>')
p.append(text(110, cy-78, f'<tspan font-style="italic">λ</tspan>', 16, "middle", ORANGE, "700"))
p.append(text(8, cy+5, f'<tspan font-style="italic">x</tspan>{SUB(I("t"))}', 15, "start", NAVY))
p.append(line(30, cy, 76, cy, SLATE, 1.8, "ah")); p.append(text(52, cy-8, f'<tspan font-style="italic">b</tspan>', 14, "middle", SLATE))
p.append(line(144, cy, 190, cy, SLATE, 1.8, "ah")); p.append(text(167, cy-8, f'<tspan font-style="italic">c</tspan>', 14, "middle", SLATE))
p.append(text(194, cy+5, f'<tspan font-style="italic">y</tspan>{SUB(I("t"))}', 15, "start", NAVY))
p.append(text(110, 262, f'<tspan font-style="italic">h</tspan>{SUB(I("t"))} = <tspan font-style="italic">λ h</tspan>{SUB(I("t")+"−1")} + <tspan font-style="italic">b x</tspan>{SUB(I("t"))}', 14, "middle", NAVY))
p.append(text(110, 286, f'<tspan font-style="italic">y</tspan>{SUB(I("t"))} = <tspan font-style="italic">c h</tspan>{SUB(I("t"))}', 14, "middle", NAVY))
# ---- equals sign
p.append(text(246, cy+12, "=", 40, "middle", SLATE))
# ---- right: kernel as stems
RX0, RX1 = 300, 700
p.append(text((RX0+RX1)/2, 24, T["conv"], 15, "middle", NAVY, "700"))
K = 49
def stems(y0, hgt, vals, color, lim, tick_lab=True, xlab=None, env=False):
    """axis at y0 (zero line), half-height hgt; vals for k = 0..K-1"""
    dx = (RX1-RX0)/(K+1)
    xs = lambda k: RX0 + 12 + k*dx
    p.append(line(RX0, y0, RX1, y0, MUTED, 1.2))
    p.append(line(RX0+12, y0-hgt-4, RX0+12, y0+hgt+4 if lim[0] < 0 else y0+4, MUTED, 1.2))
    for k, v in enumerate(vals):
        if v == 0: continue
        p.append(line(xs(k), y0, xs(k), y0 - v/lim[1]*hgt, color, 1.6))
        p.append(f'<circle cx="{xs(k):.1f}" cy="{y0 - v/lim[1]*hgt:.1f}" r="2.2" fill="{color}"/>')
    return xs
# impulse
y_imp = 82
xs = stems(y_imp, 30, [1.0] + [0.0]*(K-1), NAVY, (0, 1.0))
p.append(text(RX1, y_imp-24, T["imp"], 13, "end", SLATE))
p.append(text(xs(0)+8, y_imp-24, f'<tspan font-style="italic">x</tspan>{SUB(I("t"))}', 13, "start", SLATE))
p.append(text(xs(0), y_imp+16, "0", 12, "middle", SLATE)); p.append(text(RX1+2, y_imp+16, f'<tspan font-style="italic">t</tspan>', 13, "end", SLATE))
# kernel header
p.append(text(RX0, 128, f'<tspan font-style="italic">K</tspan>{SUB(I("k"))} = <tspan font-style="italic">c λ</tspan>{SUP(I("k"))}<tspan font-style="italic"> b</tspan>   {T["norm"]}', 13, "start", NAVY))
# real
y_r = 188
vr = [0.9**k for k in range(K)]
xs = stems(y_r, 36, vr, BLUE, (0, 1.0))
p.append(text(RX1, y_r-30, T["real"], 13, "end", BLUE))
p.append(text(xs(0)-8, y_r-32, "1", 12, "end", SLATE))
# complex
y_c = 300
vc = [0.95**k*math.cos(k*math.pi/8) for k in range(K)]
xs = stems(y_c, 46, vc, PURPLE, (-1, 1.0))
env_u = " ".join(f"{xs(k):.1f},{y_c - 0.95**k*46:.1f}" for k in range(K))
env_l = " ".join(f"{xs(k):.1f},{y_c + 0.95**k*46:.1f}" for k in range(K))
p.append(f'<polyline points="{env_u}" fill="none" stroke="{SLATE}" stroke-width="1.3" stroke-dasharray="5 4"/>')
p.append(f'<polyline points="{env_l}" fill="none" stroke="{SLATE}" stroke-width="1.3" stroke-dasharray="5 4"/>')
p.append(text(RX1, y_c-62, T["cx"], 13, "end", PURPLE))
p.append(text(xs(14)+40, y_c+66, T["env"] + SUP(I("k")), 12, "start", SLATE))
p.append(text(xs(0)-8, y_c-42, "1", 12, "end", SLATE)); p.append(text(xs(0)-8, y_c+50, "−1", 12, "end", SLATE))
# period marker
p.append(line(xs(0), y_c+52, xs(16), y_c+52, SLATE, 1.2)); 
for k in (0, 16): p.append(line(xs(k), y_c+48, xs(k), y_c+56, SLATE, 1.2))
p.append(text((xs(0)+xs(16))/2, y_c+72, "16", 12, "middle", SLATE))
p.append(text(RX1+2, y_c+16, f'<tspan font-style="italic">k</tspan>', 13, "end", SLATE))
write(p, "fig-04-20", l)
