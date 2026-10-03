import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _m04b import *
l = lang()
T = {"en": dict(add="the additive path", inp="concatenated input", grad="red: gradient path along the cell state"),
     "zh": dict(add="加性路径", inp="拼接输入", grad="")}[l]
ct = lambda: I("c") + "̃" + SUB("t")        # c-tilde_t
f_ = lambda: I("f") + SUB("t"); i_ = lambda: I("i") + SUB("t"); o_ = lambda: I("o") + SUB("t")
c_ = lambda k: I("c") + SUB(k); h_ = lambda k: I("h") + SUB(k)
P = open_svg(740, 425, l, THICK)
TOP = 110
# highlighted additive path
P.append(rect(52, TOP - 20, 650, 40, F_BLUE, F_BLUE, 0, 20))
P.append(line(62, TOP, 702, TOP, BLUE, 4.5, marker="ahT"))
P.append(text(10, TOP + 5, c_("t−1"), 15, "start", NAVY, "600"))
P.append(text(712, TOP + 5, c_("t"), 15, "start", NAVY, "600"))
P.append(text(205, TOP + 38, T["add"], 13, "middle", BLUE, "700"))
# red gradient arrow
P.append(line(660, 52, 110, 52, RED, 2, dash="7 4", marker="ahr"))
P.append(text(385, 38, "∂" + c_("t") + "/∂" + c_("t−1") + " = diag(" + f_() + ")", 14, "middle", RED, "600"))
# nodes on the line
P.append(node(130, TOP, "×")); P.append(text(130, TOP - 24, "× " + f_(), 13, "middle"))
P.append(node(280, TOP, "+")); P.append(text(280, TOP - 24, "+ " + i_() + " ⊙ " + ct(), 13, "middle"))
# gate boxes
GY, GH = 300, 40
for cx, s, fill, st in ((130, "σ", F_SKY, SKY), (220, "σ", F_SKY, SKY), (340, "tanh", F_PURPLE, PURPLE), (520, "σ", F_SKY, SKY)):
    P.append(gate(cx, GY, 56, GH, s, fill, st))
P.append(line(130, GY, 130, TOP + 13, SLATE, 1.6, "ah"))
P.append(text(137, 262, f_(), 13, "start", SLATE))
P.append(node(280, 220, "⊙", 13))
P.append(poly([(220, GY), (220, 220), (267, 220)], SLATE, 1.6, "ah")); P.append(text(227, 262, i_(), 13, "start", SLATE))
P.append(poly([(340, GY), (340, 220), (293, 220)], SLATE, 1.6, "ah")); P.append(text(347, 262, ct(), 13, "start", SLATE))
P.append(line(280, 207, 280, TOP + 13, SLATE, 1.6, "ah"))
# output
P.append(circle(440, TOP, 4, BLUE, BLUE))
P.append(line(440, TOP, 440, 160, SLATE, 1.6, "ah"))
P.append(gate(440, 160, 56, 30, "tanh", F_PURPLE, PURPLE))
P.append(node(520, 220, "⊙", 13))
P.append(poly([(440, 190), (440, 220), (507, 220)], SLATE, 1.6, "ah"))
P.append(line(520, GY, 520, 233, SLATE, 1.6, "ah")); P.append(text(527, 270, o_(), 13, "start", SLATE))
P.append(line(533, 220, 690, 220, SLATE, 1.6, "ah")); P.append(text(700, 225, h_("t"), 15, "start", NAVY, "600"))
# input bus
P.append(line(40, 382, 130, 382, SLATE, 1.6)); 
P.append(poly([(40, 382), (520, 382)], SLATE, 1.6))
for cx in (130, 220, 340, 520):
    P.append(line(cx, 382, cx, GY + GH, SLATE, 1.6, "ah"))
    if cx not in (130, 520): P.append(circle(cx, 382, 3, SLATE, SLATE))
P.append(circle(130, 382, 3, SLATE, SLATE)); P.append(circle(520, 382, 3, SLATE, SLATE))
P.append(text(280, 408, "[" + h_("t−1") + "; " + I("x") + SUB("t") + "]  " + T["inp"], 13, "middle", SLATE))
write(P, "fig-04-7", l)
