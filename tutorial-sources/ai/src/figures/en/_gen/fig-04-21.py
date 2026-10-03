# Figure 4.21: selective recurrence: input-dependent step, retention, state, parallel scan. Usage: fig-04-21.py en|zh
import math
from _common import *
l = lang()
T = {
 "en": dict(inp=["input", "x"], delta=["step", "Δ"], ret=["retention", "a = exp(−Δ)"], st=["state", "h"], scan=["parallel scan", "(a, b) pairs"],
            imp="important token", lv=["level 1", "level 2", "level 3"],
            sn="resets, stores the important token, then holds it"),
 "zh": dict(inp=["输入", "x"], delta=["步长", "Δ"], ret=["保留系数", "a = exp(−Δ)"], st=["状态", "h"], scan=["并行扫描", "(a, b) 对"],
            imp="重要 token", lv=["第 1 层", "第 2 层", "第 3 层"],
            sn="重置、存入重要 token，之后保持"),
}[l]
W, H = 720, 502
p = open_svg(W, H, l)
CX = [176 + i*68 for i in range(8)]
BW = 56
IMP = 3                       # index of the important token (x_4)
delta = [0.01]*8; delta[IMP] = 5.0
a = [math.exp(-d) for d in delta]
b = [1 - v for v in a]
xin = [0.4, -0.6, 0.5, 2.0, -0.3, 0.6, -0.5, 0.2]
h = []; hp = 0.4
for i in range(8):
    hp = a[i]*hp + b[i]*xin[i]; h.append(hp)
def lab(y, name, sub, y2=None):
    p.append(text(10, y, name, 13, "start", NAVY, "700"))
    p.append(text(10, y+17, sub, 12, "start", SLATE))
def var(sym, sub): return f'<tspan font-style="italic">{sym}</tspan>{SUB(I(sub))}'
# --- band 1: input and Delta
p.append(text(CX[IMP], 18, T["imp"], 12, "middle", ORANGE, "700"))
p.append(line(CX[IMP], 21, CX[IMP], 28, ORANGE, 1.6, "ah") if False else "")
for i in range(8):
    hl = i == IMP
    p.append(rect(CX[i]-BW/2, 30, BW, 28, F_ORANGE if hl else "#FFFFFF", ORANGE if hl else NAVY, 2.4 if hl else 1.5, 6))
    p.append(text(CX[i], 49, var("x", str(i+1)), 14, "middle", NAVY))
lab(38, T["inp"][0], "")
# bars Delta
base1 = 140; hmax1 = 56
for i in range(8):
    v = delta[i]; hh = max(2.0, v/5.0*hmax1)
    p.append(f'<rect x="{CX[i]-14}" y="{base1-hh:.1f}" width="28" height="{hh:.1f}" fill="{ORANGE if i == IMP else BLUE}" opacity="0.9"/>')
    p.append(text(CX[i], base1+15, f"{v:g}", 12, "middle", ORANGE if i == IMP else SLATE))
p.append(line(CX[0]-34, base1, CX[7]+34, base1, MUTED, 1.2))
p.append(text(10, 96, T["delta"][0], 13, "start", NAVY, "700")); p.append(text(10, 114, f'{var("Δ","t")}', 13, "start", SLATE))
p.append(line(8, 166, 712, 166, BORDER, 1))
# --- band 2: retention a_t
base2 = 222; hmax2 = 34
p.append(text(10, 196, T["ret"][0], 13, "start", NAVY, "700")); p.append(text(10, 214, f'{var("a","t")} = exp(−{var("Δ","t")})', 12, "start", SLATE))
for i in range(8):
    hh = max(1.5, a[i]*hmax2)
    p.append(f'<rect x="{CX[i]-14}" y="{base2-hh:.1f}" width="28" height="{hh:.1f}" fill="{ORANGE if i == IMP else GREEN}" opacity="0.9"/>')
    p.append(text(CX[i], base2-hh-5 if i != IMP else base2-hh-5, f"{a[i]:.3f}" if i != IMP else "0.0067", 12, "middle", ORANGE if i == IMP else SLATE))
p.append(line(CX[0]-34, base2, CX[7]+34, base2, MUTED, 1.2))
p.append(line(8, 238, 712, 238, BORDER, 1))
# --- band 3: state trace
p.append(text(10, 264, T["st"][0], 13, "start", NAVY, "700")); p.append(text(10, 282, var("h","t"), 13, "start", SLATE))
sb, sh = 336, 40       # zero line, scale
sy = lambda v: sb - v*sh/2.2
p.append(line(CX[0]-34, sb, CX[7]+34, sb, MUTED, 1.2))
pts = " ".join(f"{CX[i]:.1f},{sy(h[i]):.1f}" for i in range(8))
# a step-like trace: horizontal holds with a jump at the important token
p.append(f'<polyline points="{pts}" fill="none" stroke="{PURPLE}" stroke-width="2.4"/>')
for i in range(8): p.append(circle(CX[i], sy(h[i]), 4, PURPLE if i != IMP else ORANGE, PURPLE if i != IMP else ORANGE, 1))
p.append(text(CX[IMP]+14, sy(h[IMP])-10, T["sn"], 12, "start", PURPLE))
p.append(line(8, 354, 712, 354, BORDER, 1))
# --- band 4: parallel scan tree
p.append(text(10, 364, T["scan"][0], 13, "start", NAVY, "700")); p.append(text(10, 382, T["scan"][1], 12, "start", SLATE))
Y = [480, 436, 392, 372]
LY = {0: 484, 1: 442, 2: 400, 3: 358}
levels = {0: [(CX[i], f"(a{'₁₂₃₄₅₆₇₈'[i]}, b{'₁₂₃₄₅₆₇₈'[i]})") for i in range(8)]}
sub = "₀₁₂₃₄₅₆₇₈"
def rng(i, j): return f"(a, b){sub[i]}:{sub[j]}"
levels[1] = [((CX[2*k]+CX[2*k+1])/2, rng(2*k+1, 2*k+2)) for k in range(4)]
levels[2] = [((levels[1][2*k][0]+levels[1][2*k+1][0])/2, rng(4*k+1, 4*k+4)) for k in range(2)]
levels[3] = [((levels[2][0][0]+levels[2][1][0])/2, rng(1, 8))]
ypos = {0: 478, 1: 436, 2: 394, 3: 364}
ypos = {0: 486, 1: 442, 2: 398, 3: 354+24}
ypos = {0: 480, 1: 438, 2: 396, 3: 372}
# recompute tidy spacing: 4 levels between y=372 and 480 -> step 36
ypos = {0: 480, 1: 444, 2: 408, 3: 372}
NW2, NH2 = 64, 26
for L in (1, 2, 3):
    for k, (x, s) in enumerate(levels[L]):
        for c in (2*k, 2*k+1):
            xc = levels[L-1][c][0]
            p.append(line(xc, ypos[L-1]-NH2/2, x, ypos[L]+NH2/2, SLATE, 1.4))
for L in (0, 1, 2, 3):
    for x, s in levels[L]:
        fill = F_GREEN if L else "#FFFFFF"; st = GREEN if L else NAVY
        p.append(rect(x-NW2/2, ypos[L]-NH2/2, NW2, NH2, fill, st, 1.5, 6))
        p.append(text(x, ypos[L]+4.5, s, 12, "middle", NAVY))
for L in (1, 2, 3): p.append(text(CX[0]-44, ypos[L]+4.5, T["lv"][L-1], 12, "end", SLATE))
write(p, "fig-04-21", l)
