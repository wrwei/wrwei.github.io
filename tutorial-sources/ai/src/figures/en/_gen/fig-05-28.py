# Figure 5.28: an MoE layer with 8 experts and top-2 routing. The router probabilities are a softmax
# of illustrative logits, computed here; the top two (experts 3 and 6) are renormalised.
#   python fig-05-28.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from _common import *
l = lang()
T = {"en": dict(tok="token", router="router", sm="softmax(", top="the two tallest bars select the experts (top-2)", resid="residual stream",
                note1="parameters: 8 FFNs", note2="compute: 2 FFNs", out="to the next block", unused="grey: not run",
                ex="expert"),
     "zh": dict(tok="词元", router="路由器", sm="softmax(", top="最高的两根柱选出专家（top-2）", resid="残差流",
                note1="参数：8 个 FFN", note2="计算：2 个 FFN", out="送往下一个块", unused="灰色：不运行",
                ex="专家")}[l]
logits = np.array([0.2, -0.5, 1.5, 0.1, -0.7, 1.0, 0.4, -0.2])
p = np.exp(logits) / np.exp(logits).sum()
top = list(np.argsort(-p)[:2]); top.sort()
assert top == [2, 5]
gt = p[top] / p[top].sum()
print("p", p.round(3), "top", [t + 1 for t in top], "renorm", gt.round(3))
P = open_svg(740, 372, l)
X = B("x")
MY = 200
# token
P.append(rect(14, MY - 24, 52, 48, F_BLUE, BLUE, 1.6, 8)); P.append(text(40, MY + 5, X, 16, "middle", NAVY))
P.append(text(40, MY + 40, T["tok"], 12, "middle", SLATE))
P.append(line(66, MY, 92, MY, SLATE, 1.6, "ah"))
# router with its bar chart
RX, RY, RW, RH = 94, 92, 206, 210
P.append(rect(RX, RY, RW, RH, "#FFFFFF", NAVY, 1.6, 8))
P.append(text(RX + RW / 2, RY + 22, T["router"] + "   " + T["sm"] + B("W") + SUB("r") + " " + X + ")", 13, "middle", NAVY, "700"))
base = RY + RH - 26; hmax = 120 / p.max() * 1.0
bx0, step, bw = RX + 18, 22.5, 15
bar_top = {}
for e in range(8):
    h = p[e] * hmax * 0.92 / 1.0
    x = bx0 + e * step
    sel = e in top
    P.append(f'<rect x="{x:.1f}" y="{base-h:.1f}" width="{bw}" height="{h:.1f}" fill="{BLUE if sel else "#CBD5E1"}"/>')
    P.append(text(x + bw / 2, base + 15, str(e + 1), 12, "middle", NAVY if sel else SLATE, "700" if sel else None))
    P.append(text(x + bw / 2, base - h - 5, f"{p[e]:.2f}".lstrip("0"), 11, "middle", BLUE if sel else SLATE, "600" if sel else None))
    bar_top[e] = (x + bw / 2, base - h)
P.append(line(RX + 10, base, RX + RW - 10, base, SLATE, 1))
# experts
EX, EW, EH, EG, EY0 = 372, 92, 30, 7, 52
ecy = [EY0 + EH / 2 + e * (EH + EG) for e in range(8)]
for e in range(8):
    sel = e in top
    P.append(rect(EX, ecy[e] - EH / 2, EW, EH, F_BLUE if sel else "#F8FAFC", BLUE if sel else "#CBD5E1", 1.8 if sel else 1.2, 6))
    P.append(text(EX + EW / 2, ecy[e] + 5, "FFN" + SUB(str(e + 1)), 13, "middle", NAVY if sel else MUTED, "700" if sel else None))
# dispatch from the two tallest bars to their experts
P.append(line(bar_top[2][0] + 10, bar_top[2][1] - 4, EX - 2, ecy[2], BLUE, 1.8, "ahb"))
P.append(line(bar_top[5][0] + 10, bar_top[5][1] - 4, EX - 2, ecy[5], BLUE, 1.8, "ahb"))
P.append(text(335, 136, X, 13, "middle", BLUE)); P.append(text(335, 228, X, 13, "middle", BLUE))
P.append(text(RX + RW / 2, RY + RH + 20, T["top"], 12, "middle", BLUE, "600"))
# weighted sum
SX, SY = 560, MY
for k, e in enumerate(top):
    P.append(line(EX + EW, ecy[e], SX - 12, SY + (-6 if k == 0 else 6), BLUE, 1.6, "ahb"))
    lab = "× " + "g̃" + SUB(str(e + 1)) + " = " + f"{gt[k]:.2f}"
    P.append(text(476, 132 if k == 0 else 280, lab, 12, "start", BLUE, "600"))
P.append(circle(SX, SY, 13, "#FFFFFF", NAVY, 1.6)); P.append(text(SX, SY + 6, "Σ", 15, "middle", NAVY, "700"))
P.append(text(EX + EW + 8, ecy[7] + 5, T["unused"], 11, "start", MUTED))
# residual add
AX = 628
P.append(line(SX + 13, SY, AX - 13, SY, SLATE, 1.6, "ah"))
P.append(text((SX + AX) / 2, SY - 8, B("y"), 14, "middle", NAVY))
P.append(f'<polyline points="40,{MY-24} 40,24 {AX},24 {AX},{MY-15}" fill="none" stroke="{SLATE}" stroke-width="1.6" marker-end="url(#ah)"/>')
P.append(text(200, 18, T["resid"], 12, "middle", SLATE))
P.append(circle(AX, SY, 13, "#FFFFFF", NAVY, 1.6)); P.append(text(AX, SY + 6, "+", 18, "middle", NAVY, "600"))
P.append(line(AX + 13, SY, 672, SY, SLATE, 1.6, "ah"))
P.append(text(676, SY + 5, X + " + " + B("y"), 13, "start", NAVY))
P.append(text(AX + 4, SY + 34, T["out"], 11, "middle", SLATE))
# side note
P.append(rect(558, 300, 170, 52, F_AMBER, AMBER, 1.4, 8))
P.append(text(643, 321, T["note1"], 13, "middle", NAVY, "600"))
P.append(text(643, 340, T["note2"], 13, "middle", NAVY, "600"))
write(P, "fig-05-28", l)
