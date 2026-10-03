import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _m04b import *
l = lang()
T = {"en": dict(add="the additive path", inp="concatenated input"),
     "zh": dict(add="加性路径", inp="拼接输入")}[l]
h_ = lambda k: I("h") + SUB(k); z_ = I("z") + SUB("t"); r_ = I("r") + SUB("t")
ht = I("h") + "\u0303" + SUB("t")
P = open_svg(740, 425, l, THICK)
TOP = 110
P.append(rect(52, TOP - 20, 650, 40, F_BLUE, F_BLUE, 0, 20))
P.append(line(62, TOP, 702, TOP, BLUE, 4.5, marker="ahT"))
P.append(text(10, TOP + 5, h_("t−1"), 15, "start", NAVY, "600"))
P.append(text(712, TOP + 5, h_("t"), 15, "start", NAVY, "600"))
P.append(text(250, TOP + 38, T["add"], 13, "middle", BLUE, "700"))
P.append(node(400, TOP, "×")); P.append(text(400, TOP - 24, "× (1 − " + z_ + ")", 13, "middle"))
P.append(node(580, TOP, "+")); P.append(text(580, TOP - 24, "+", 13, "middle"))
# split of h_{t-1}
P.append(circle(100, TOP, 4, BLUE, BLUE))
YC = 220
P.append(line(100, TOP, 100, YC - 13, SLATE, 1.6, "ah"))
P.append(node(100, YC, "⊙")); P.append(text(108, 170, h_("t−1"), 12, "start", SLATE))
# candidate
P.append(line(113, YC, 200, YC, SLATE, 1.6, "ah")); P.append(text(156, YC - 8, r_ + " ⊙ " + h_("t−1"), 12, "middle", SLATE))
P.append(gate(230, YC - 15, 60, 30, "tanh", F_PURPLE, PURPLE))
P.append(line(260, YC, 567, YC, SLATE, 1.6, "ah")); P.append(text(500, YC - 8, ht, 13, "middle", SLATE))
P.append(node(580, YC, "⊙"))
P.append(line(580, YC - 13, 580, TOP + 13, SLATE, 1.6, "ah"))
# gates
GY = 300
P.append(gate(100, GY, 56, 40, "σ", F_SKY, SKY)); P.append(gate(400, GY, 56, 40, "σ", F_SKY, SKY))
P.append(line(100, GY, 100, YC + 13, SLATE, 1.6, "ah")); P.append(text(107, 268, r_, 13, "start", SLATE))
# z: up to (1-z) node, branch to the z node
P.append(line(400, GY, 400, 252, SLATE, 1.6))
P.append(poly([(400, 252), (580, 252), (580, YC + 13)], SLATE, 1.6, "ah"))
P.append(hop(400, 252, TOP + 13, SLATE, 1.6, "ah"))
P.append(circle(400, 252, 3, SLATE, SLATE))
P.append(text(392, 285, z_, 13, "end", SLATE))
P.append(text(408, 168, "1 − " + z_, 12, "start", SLATE))
# x_t into the candidate
P.append(line(230, 346, 230, YC + 15, SLATE, 1.6, "ah")); P.append(text(230, 360, I("x") + SUB("t"), 13, "middle", SLATE))
# bus
P.append(poly([(40, 382), (400, 382)], SLATE, 1.6))
for cx in (100, 400):
    P.append(line(cx, 382, cx, GY + 40, SLATE, 1.6, "ah")); P.append(circle(cx, 382, 3, SLATE, SLATE))
P.append(text(250, 408, "[" + h_("t−1") + "; " + I("x") + SUB("t") + "]  " + T["inp"], 13, "middle", SLATE))
write(P, "fig-04-9", l)
