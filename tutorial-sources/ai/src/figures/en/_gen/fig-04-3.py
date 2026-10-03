# Figure 4.3: folded and unrolled RNN cell.  python fig-04-3.py en|zh
from _common import *
l = lang()
T = {"en": dict(folded="folded", unrolled="unrolled in time"),
     "zh": dict(folded="折叠", unrolled="按时间展开")}[l]
W, H = 720, 346
P = open_svg(W, H, l)
def v(s, sub=""): return B(s) + (SUB(sub) if sub else "")
def Wm(k): return B("W") + SUB(k)
def Lt(sub): return "\U0001D4DB" if False else "L"  # placeholder (see below)
def Lab(sub): return I("L") + SUB(sub)

Y_L, Y_C, Y_O, Y_I = 66, 200, 126, 316          # tops / positions
CH = 44
def cell(x, w, label="tanh", state=None):
    o = [rect(x, Y_C, w, CH, F_BLUE, BLUE, 1.8, 8)]
    if state is None:
        o.append(text(x + w / 2, Y_C + 27, label, 14, "middle", NAVY, 600))
    else:
        o.append(text(x + w / 2, Y_C + 18, label, 12, "middle", SLATE))
        o.append(text(x + w / 2, Y_C + 36, state, 14, "middle", NAVY))
    return o

# ---------- folded (left)
P.append(text(10, 22, T["folded"], 13, "start", SLATE, 600))
bx, bw = 45, 110
P += cell(bx, bw)
cx = 80
P.append(text(cx, Y_I + 16, v("x", "t"), 14, "middle"))
P.append(line(cx, Y_I - 2, cx, Y_C + CH + 1, SLATE, 1.6, "ah"))
P.append(text(cx + 7, 276, Wm("x"), 13, "start", BLUE, 600))
P.append(text(cx, Y_O + 4, v("y", "t"), 14, "middle"))
P.append(line(cx, Y_C - 1, cx, Y_O + 10, SLATE, 1.6, "ah"))
P.append(text(cx + 7, 160, Wm("y"), 13, "start", BLUE, 600))
# self-loop
P.append(f'<path d="M{bx+bw},{Y_C+14} L192,{Y_C+14} L192,290 L135,290 L135,{Y_C+CH+1}" fill="none" stroke="{SLATE}" stroke-width="1.6" marker-end="url(#ah)"/>')
P.append(text(199, 252, Wm("h"), 13, "start", BLUE, 600))
P.append(text(163, 308, v("h", "t\u22121"), 13, "middle"))

P.append(line(235, 30, 235, 335, MUTED, 1, None, "3 4"))

# ---------- unrolled (right)
P.append(text(255, 22, T["unrolled"], 13, "start", SLATE, 600))
cxs = [345, 450, 555, 660]
cw = 66
# total loss
Lw = 150
P.append(rect(cxs[1] + 52 - Lw / 2 - 0, 4, Lw, 28, F_RED, RED, 1.6, 8))
P.append(text(cxs[1] + 52, 23, I("L") + " = " + "\u03a3" + SUB("t") + " " + I("L") + SUB("t"), 14, "middle", NAVY, 600))
bus_y = 46
P.append(line(cxs[0], bus_y, cxs[-1], bus_y, RED, 1.5))
P.append(line(cxs[1] + 52, bus_y, cxs[1] + 52, 34, RED, 1.5, "ahr"))
# h0
P.append(text(272, Y_C + 27, v("h", "0"), 14, "middle"))
P.append(line(284, Y_C + CH / 2, cxs[0] - cw / 2 - 1, Y_C + CH / 2, SLATE, 1.6, "ah"))
for k, cx in enumerate(cxs):
    t = k + 1
    P += cell(cx - cw / 2, cw, "tanh", v("h", str(t)))
    # input
    P.append(text(cx, Y_I + 16, v("x", str(t)), 14, "middle"))
    P.append(line(cx, Y_I - 2, cx, Y_C + CH + 1, SLATE, 1.6, "ah"))
    P.append(text(cx + 7, 276, Wm("x"), 13, "start", BLUE, 600))
    # output
    P.append(text(cx, Y_O + 4, v("y", str(t)), 14, "middle"))
    P.append(line(cx, Y_C - 1, cx, Y_O + 10, SLATE, 1.6, "ah"))
    P.append(text(cx + 7, 160, Wm("y"), 13, "start", BLUE, 600))
    # loss
    P.append(rect(cx - 21, 58, 42, 24, F_RED, RED, 1.5, 6))
    P.append(text(cx, 75, Lab(str(t)), 13, "middle", NAVY))
    P.append(line(cx, Y_O - 9, cx, 84, SLATE, 1.6, "ah"))
    P.append(line(cx, 58, cx, bus_y, RED, 1.5))
    # horizontal state arrow to the next cell
    if k < 3:
        x1, x2 = cx + cw / 2, cxs[k + 1] - cw / 2
        P.append(line(x1, Y_C + CH / 2, x2 - 1, Y_C + CH / 2, SLATE, 1.6, "ah"))
        P.append(text((x1 + x2) / 2, Y_C + CH / 2 + 18, Wm("h"), 13, "middle", BLUE, 600))
write(P, "fig-04-3", l)
