# Figure 5.21: PINN schematic for the damped oscillator.  python fig-05-21.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
l = lang()
T = {"en": dict(pde="(and x for a PDE)", mlp="MLP", mlp2="tanh, weights θ", ad="autodiff",
                ic="initial conditions at t = 0", res="residual r(t), squared and averaged", res2="over the collocation points ",
                data="data misfit", data2="at the measurement times ",
                sum="sum"),
     "zh": dict(pde="（PDE 还需 x）", mlp="MLP", mlp2="tanh，权重 θ", ad="自动微分",
                ic="t = 0 处的初始条件", res="残差 r(t)，平方后取平均", res2="（在各配点 ",
                data="数据误差", data2="在测量时刻 ",
                sum="求和")}[l]
P = open_svg(740, 350, l)
th = SUB("θ")
def box(x, y, w, h, lines, fill="#FFFFFF", stroke=NAVY):
    """box with centred lines: list of (text, size, colour, weight)"""
    out = [rect(x, y, w, h, fill, stroke, 1.6, 8)]
    n = len(lines); lh = 18
    y0 = y + h / 2 - (n - 1) * lh / 2 + 5
    for i, (s, size, c, wt) in enumerate(lines):
        out.append(text(x + w / 2, y0 + i * lh, s, size, "middle", c, wt))
    return "\n".join(out)
CY = 163; BH = 46; BY = CY - BH / 2
# chain: t -> MLP -> u -> u' -> u''
P.append(box(10, BY - 6, 104, BH + 12, [(I("t"), 15, NAVY, "600"), (T["pde"], 11, SLATE, None)]))
P.append(line(114, CY, 128, CY, SLATE, 1.6, "ah"))
P.append(box(130, BY - 6, 106, BH + 12, [(T["mlp"], 14, NAVY, "700"), (T["mlp2"], 12, SLATE, None)], F_SKY, BLUE))
P.append(line(236, CY, 263, CY, SLATE, 1.6, "ah"))
U = I("u") + th
P.append(box(265, BY, 80, BH, [(U + "(" + I("t") + ")", 14, NAVY, "600")], F_BLUE, BLUE))
P.append(box(425, BY, 80, BH, [(I("u") + th + "′(" + I("t") + ")", 14, NAVY, "600")], F_BLUE, BLUE))
P.append(box(585, BY, 80, BH, [(I("u") + th + "″(" + I("t") + ")", 14, NAVY, "600")], F_BLUE, BLUE))
for x0 in (345, 505):
    P.append(line(x0, CY, x0 + 78, CY, BLUE, 1.6, "ahb"))
    P.append(text(x0 + 40, CY - 8, T["ad"], 12, "middle", BLUE))
    P.append(text(x0 + 40, CY + 18, "∂/∂" + I("t"), 12, "middle", BLUE))
# initial conditions (top)
P.append(box(265, 22, 260, 62, [(T["ic"], 12, SLATE, None),
                                ("(" + U + "(0) − 1)² + " + U + "′(0)²", 14, NAVY, "600")], F_ORANGE, ORANGE))
P.append(line(300, BY, 300, 86, SLATE, 1.6, "ah"))
P.append(line(450, BY, 450, 86, SLATE, 1.6, "ah"))
# residual box (bottom)
RY = 228
P.append(box(330, RY, 300, 72, [("𝒩[" + I("u") + "] = " + I("u") + "″ + 2ζω₀" + I("u") + "′ + ω₀²" + I("u"), 14, NAVY, "600"),
                                (T["res"], 12, SLATE, None), (T["res2"] + I("t") + SUB("j") + ("" if l == "en" else " 上）"), 12, SLATE, None)], F_PURPLE, PURPLE))
P.append(line(335, BY + BH, 335, RY - 2, SLATE, 1.6, "ah"))
P.append(line(465, BY + BH, 465, RY - 2, SLATE, 1.6, "ah"))
P.append(line(605, BY + BH, 605, RY - 2, SLATE, 1.6, "ah"))
# data box (bottom left)
P.append(box(10, RY, 236, 72, [(T["data"], 12, SLATE, None),
                               ("(" + U + "(" + I("t") + SUB("i") + ") − " + I("u") + SUB("i") + ")²", 14, NAVY, "600"),
                               (T["data2"] + I("t") + SUB("i"), 12, SLATE, None)], F_GREEN, GREEN))
P.append(f'<polyline points="285,{BY+BH} 285,264 248,264" fill="none" stroke="{SLATE}" stroke-width="1.6" marker-end="url(#ah)"/>')
# total loss
LX, LW, LY, LH = 676, 54, 22, 278
P.append(rect(LX, LY, LW, LH, F_BLUE, NAVY, 1.8, 8))
P.append(text(LX + LW / 2, LY + LH / 2 - 6, "ℒ(θ)", 15, "middle", NAVY, "700"))
P.append(text(LX + LW / 2, LY + LH / 2 + 14, T["sum"], 12, "middle", SLATE))
P.append(line(525, 53, LX - 2, 53, SLATE, 1.6, "ah"))
P.append(text(600, 46, "× λ" + SUB("ic"), 13, "middle", ORANGE, "600"))
P.append(line(630, 264, LX - 2, 264, SLATE, 1.6, "ah"))
P.append(text(653, 288, "× λ" + SUB("r"), 13, "middle", PURPLE, "600"))
P.append(f'<polyline points="128,300 128,334 703,334 703,{LY+LH+2}" fill="none" stroke="{SLATE}" stroke-width="1.6" marker-end="url(#ah)"/>')
P.append(text(420, 328, "× λ" + SUB("d"), 13, "middle", GREEN, "600"))
write(P, "fig-05-21", l)
