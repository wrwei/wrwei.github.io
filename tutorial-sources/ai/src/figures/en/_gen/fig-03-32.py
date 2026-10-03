import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(t1="1D, k = 3, s = 2: 4 inputs, 9 outputs", t2="2D, all-ones input: contributions per cell",
                inp="input", cop=("copies of", "the kernel"), out="output", cnt=("contributions", "per cell"),
                note="uneven: a checkerboard"),
     "zh": dict(t1="一维，k = 3，s = 2：4 个输入，9 个输出", t2="二维，全 1 输入：每个格子的贡献数",
                inp="输入", cop=("卷积核的", "拷贝"), out="输出", cnt=("每格", "贡献数"),
                note="不均匀：棋盘格")}[L]
W, H = 720, 326
o = open_svg(W, H, L)
cs, x0 = 32, 100
cnt = [1, 1, 2, 1, 2, 1, 2, 1, 1]
cols = [(F_BLUE, BLUE), (F_ORANGE, ORANGE), (F_GREEN, GREEN), (F_PURPLE, PURPLE)]
o.append(text(x0 + 4.5 * cs, 22, T["t1"], 14, "middle", NAVY, 600))
yin, ycp, yout = 40, 98, 98 + 4 * 36 + 8
o.append(text(x0 - 10, yin + 21, T["inp"], 12.5, "end", SLATE))
o.append(text(x0 - 10, ycp + 16, T["cop"][0], 12.5, "end", SLATE))
o.append(text(x0 - 10, ycp + 31, T["cop"][1], 12.5, "end", SLATE))
o.append(text(x0 - 10, yout + 21, T["out"], 12.5, "end", SLATE))
o.append(text(x0 - 10, yout + 51, T["cnt"][0], 12, "end", SLATE))
o.append(text(x0 - 10, yout + 65, T["cnt"][1], 12, "end", SLATE))
for i in range(4):
    f, s = cols[i]
    c = 2 * i + 1
    cx = x0 + (c + 0.5) * cs
    o.append(f'<rect x="{x0+c*cs}" y="{yin}" width="{cs}" height="{cs}" rx="4" fill="{f}" stroke="{s}" stroke-width="1.8"/>')
    o.append(text(cx, yin + 21, I("x") + SUB(str(i), 10), 13, "middle"))
    yy = ycp + i * 36
    o.append(line(cx, yin + cs, cx, yy, s, 1.2, dash="3 3"))
    for u in range(3):
        o.append(f'<rect x="{x0+(2*i+u)*cs}" y="{yy}" width="{cs}" height="30" rx="4" fill="{f}" stroke="{s}" stroke-width="1.6"/>')
        o.append(text(x0 + (2 * i + u + 0.5) * cs, yy + 19, I("x") + SUB(str(i), 9) + I("w") + SUB(str(u), 9), 11, "middle"))
for p in range(9):
    fill = F_AMBER if cnt[p] == 2 else "#FFFFFF"
    st = AMBER if cnt[p] == 2 else NAVY
    o.append(f'<rect x="{x0+p*cs}" y="{yout}" width="{cs}" height="{cs}" rx="4" fill="{fill}" stroke="{st}" stroke-width="1.8"/>')
    o.append(text(x0 + (p + 0.5) * cs, yout + 21, I("y") + SUB(str(p), 10), 13, "middle"))
    o.append(text(x0 + (p + 0.5) * cs, yout + 54, str(cnt[p]), 14, "middle", AMBER if cnt[p] == 2 else SLATE, 700))
# 2D checkerboard
g, gx, gy = 25, 436, 50
o.append(text(gx + 4.5 * g, 22, T["t2"], 14, "middle", NAVY, 600))
shade = {1: "#FFFFFF", 2: F_BLUE, 4: "#93C5FD"}
for r in range(9):
    for c in range(9):
        v = cnt[r] * cnt[c]
        o.append(f'<rect x="{gx+c*g}" y="{gy+r*g}" width="{g}" height="{g}" fill="{shade[v]}" stroke="{BORDER}" stroke-width="1"/>')
        o.append(text(gx + (c + 0.5) * g, gy + (r + 0.5) * g + 4, str(v), 11, "middle", NAVY if v > 1 else SLATE))
o.append(f'<rect x="{gx}" y="{gy}" width="{9*g}" height="{9*g}" fill="none" stroke="{NAVY}" stroke-width="1.6"/>')
o.append(text(gx + 4.5 * g, gy + 9 * g + 20, T["note"], 12, "middle", SLATE))
write(o, "fig-03-32", L)
