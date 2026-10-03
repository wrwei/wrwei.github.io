import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _m04b import *
l = lang()
T = {"en": dict(l1="layer 1", l2="layer 2", fw="forward", bw="backward", fc="forecast ", n1="the backward row has", n2="read ", step="step"),
     "zh": dict(l1="第 1 层", l2="第 2 层", fw="前向", bw="后向", fc="预测 ", n1="后向行已经读到了", n2=" ", step="步")}[l]
xs = lambda k: I("x") + SUB(k)
AHO = '<marker id="aho" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#C2410C"/></marker>'
P = open_svg(760, 440, l, AHO)
cxs = [120, 215, 310, 405, 500]
W, H = 44, 32
def layer(yf, yb):
    for cx in cxs:
        P.append(rect(cx - 44, yf - H / 2, W, H, F_BLUE, BLUE, 1.6, 6))
        P.append(rect(cx, yb - H / 2, W, H, F_ORANGE, ORANGE, 1.6, 6))
    for cx in cxs[:-1]:
        P.append(line(cx, yf, cx + 51, yf, BLUE, 1.6, "ahb"))
        P.append(line(cx + 95, yb, cx + 44, yb, ORANGE, 1.6, "aho"))
    P.append(text(558, yf + 5, T["fw"] + " →", 12, "start", BLUE, "600"))
    P.append(text(558, yb + 5, "← " + T["bw"], 12, "start", ORANGE, "600"))
def pill(cx, y):
    P.append(rect(cx - 27, y - 10, 54, 20, "#FFFFFF", NAVY, 1.4, 10))
    P.append(text(cx, y + 4, "[ ; ]", 12, "middle", NAVY, "600"))
Y = dict(f2=130, b2=182, f1=288, b1=340, p1=240, p2=70)
layer(Y["f1"], Y["b1"]); layer(Y["f2"], Y["b2"])
P.append(text(12, Y["f1"] + 22, T["l1"], 13, "start", NAVY, "700"))
P.append(text(12, Y["f2"] + 22, T["l2"], 13, "start", NAVY, "700"))
for cx in cxs:
    # input split
    P.append(text(cx, 418, xs(str(cxs.index(cx) + 1)), 14, "middle", NAVY, "600"))
    P.append(line(cx, 400, cx, 372, SLATE, 1.6))
    P.append(line(cx - 22, 372, cx + 22, 372, SLATE, 1.6))
    P.append(hop(cx - 22, 372, Y["f1"] + 16, SLATE, 1.6, "ah"))
    P.append(line(cx + 22, 372, cx + 22, Y["b1"] + 16, SLATE, 1.6, "ah"))
    # layer 1 -> join 1
    pill(cx, Y["p1"])
    P.append(line(cx - 22, Y["f1"] - 16, cx - 22, Y["p1"] + 10, SLATE, 1.6, "ah"))
    P.append(hop(cx + 22, Y["b1"] - 16, Y["p1"] + 10, SLATE, 1.6, "ah"))
    # join 1 -> layer 2
    P.append(line(cx + 22, Y["p1"] - 10, cx + 22, Y["b2"] + 16, SLATE, 1.6, "ah"))
    P.append(hop(cx - 22, Y["p1"] - 10, Y["f2"] + 16, SLATE, 1.6, "ah"))
    # layer 2 -> join 2
    pill(cx, Y["p2"])
    P.append(line(cx - 22, Y["f2"] - 16, cx - 22, Y["p2"] + 10, SLATE, 1.6, "ah"))
    P.append(hop(cx + 22, Y["b2"] - 16, Y["p2"] + 10, SLATE, 1.6, "ah"))
P.append(text(558, 74, "", 12))
# forecast box with red cross
bx, by, bw, bh = 612, 46, 136, 48
P.append(line(527, Y["p2"], bx, Y["p2"], SLATE, 1.6, "ah"))
P.append(rect(bx, by, bw, bh, F_RED, RED, 1.6, 8))
P.append(line(bx + 8, by + 6, bx + bw - 8, by + bh - 6, RED, 3.5))
P.append(line(bx + 8, by + bh - 6, bx + bw - 8, by + 6, RED, 3.5))
P.append(text(bx + bw / 2, by + 29, T["fc"] + xs("t+1"), 14, "middle", NAVY, "600", halo=True))
P.append(text(bx + bw / 2, by + bh + 22, T["n1"], 13, "middle", RED, "600"))
P.append(text(bx + bw / 2, by + bh + 40, (T["n2"] + xs("t+1")).strip(), 13, "middle", RED, "600"))
write(P, "fig-04-10", l)
