import sys, os, random; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _m04b import *
l = lang()
T = {"en": dict(t1="Walk-forward folds", fold="fold ", time="time →", tr="train", gap="gap", va="validate", origin="origin",
                t2="Shuffled split (leaks)", adj="two adjacent windows, stride 1", shared="63 shared samples (of 64)", w1="window i", w2="window i + 1"),
     "zh": dict(t1="前向滚动折", fold="第 ", time="时间 →", tr="训练", gap="间隔", va="验证", origin="起点",
                t2="随机打乱的划分（泄漏）", adj="两个相邻窗口，步幅为 1", shared="63 个共享样本（共 64 个）", w1="窗口 i", w2="窗口 i + 1")}[l]
P = open_svg(740, 470, l)
X0 = 70
P.append(text(X0, 24, T["t1"], 14, "start", NAVY, "700"))
orig = [220, 310, 400, 490]
for k, o in enumerate(orig):
    y = 38 + k * 36
    P.append(text(X0 - 8, y + 17, T["fold"] + str(k + 1) + ("" if l == "en" else " 折"), 13, "end", SLATE))
    P.append(rect(X0, y, o - X0, 24, F_BLUE, BLUE, 1.4, 3))
    P.append(rect(o + 14, y, 90, 24, F_ORANGE, ORANGE, 1.4, 3))
    P.append(rect(o, y, 14, 24, "#E2E8F0", MUTED, 1, 0))
    P.append(line(o, y - 4, o, y + 28, NAVY, 2))
P.append(text(orig[0], 36, "", 12))
P.append(text(orig[0] + 6, 33, T["origin"], 12, "start", NAVY, "600"))
P.append(line(X0, 170, 700, 170, SLATE, 1.6, "ah")); P.append(text(700, 190, T["time"], 12, "end", SLATE))
for xx, fill, st, s in ((460, F_BLUE, BLUE, T["tr"]), (540, "#E2E8F0", MUTED, T["gap"]), (610, F_ORANGE, ORANGE, T["va"])):
    pass
lx = 70
for fill, st, s in ((F_BLUE, BLUE, T["tr"]), ("#E2E8F0", MUTED, T["gap"]), (F_ORANGE, ORANGE, T["va"])):
    P.append(rect(lx, 206, 16, 12, fill, st, 1.2, 2)); P.append(text(lx + 22, 216, s, 12, "start", SLATE)); lx += 100
# bottom panel
FY = 236
P.append(rect(40, FY, 680, 226, F_RED, RED, 1.4, 10))
P.append(line(44, FY + 4, 716, FY + 222, RED, 3, extra=' opacity="0.28"'))
P.append(line(44, FY + 222, 716, FY + 4, RED, 3, extra=' opacity="0.28"'))
P.append(text(56, FY + 24, T["t2"], 14, "start", RED, "700"))
random.seed(7)
n = 26; ws = 18; st = 24; x0 = 70; wy = FY + 40
kinds = []
for i in range(n):
    kinds.append("o" if random.random() < 0.22 else "b")
kinds[11] = "b"; kinds[12] = "o"
for i, kd in enumerate(kinds):
    x = x0 + i * st
    P.append(rect(x, wy, ws, 24, F_BLUE if kd == "b" else F_ORANGE, BLUE if kd == "b" else ORANGE, 1.3, 3))
# magnified windows
s = 5; ax = 200; ay = FY + 118; by_ = ay + 28
wx = [x0 + 11 * st, x0 + 12 * st]
P.append(poly([(wx[0], wy + 24), (ax, ay)], MUTED, 1.2, None, "4 3"))
P.append(poly([(wx[1] + ws, wy + 24), (ax + 64 * s + s, by_ + 20 - 20 + 0)], MUTED, 1.2, None, "4 3"))
P.append(f'<rect x="{ax}" y="{ay}" width="{64*s}" height="20" fill="{F_BLUE}" stroke="{BLUE}" stroke-width="1.5"/>')
P.append(f'<rect x="{ax+s}" y="{by_}" width="{64*s}" height="20" fill="{F_ORANGE}" stroke="{ORANGE}" stroke-width="1.5"/>')
P.append(f'<rect x="{ax+s}" y="{ay}" width="{63*s}" height="{by_+20-ay}" fill="none" stroke="{NAVY}" stroke-width="1.4" stroke-dasharray="5 3"/>')
P.append(text(ax - 8, ay + 15, T["w1"], 12, "end", BLUE, "600")); P.append(text(ax - 8, by_ + 15, T["w2"], 12, "end", ORANGE, "600"))
P.append(text(ax + 64 * s + 20, ay + 15, T["adj"], 12, "start", SLATE))
P.append(poly([(ax + s, by_ + 34), (ax + s, by_ + 40), (ax + 64 * s, by_ + 40), (ax + 64 * s, by_ + 34)], NAVY, 1.4))
P.append(text(ax + s + 63 * s / 2, by_ + 58, T["shared"], 13, "middle", NAVY, "600"))
write(P, "fig-04-12", l)
