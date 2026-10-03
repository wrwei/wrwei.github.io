import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(fw=("forward mode: ", " passes, each ", " (JVP)"), rv=("reverse mode: ", " passes, each ", " (VJP)"),
                col="one column per pass", row="one row per pass", pass_="pass",
                bot="m = 1, a scalar loss: J is a single row, the whole gradient in one reverse pass"),
     "zh": dict(fw=("前向模式：", " 次传播，每次计算 ", "（JVP）"), rv=("反向模式：", " 次传播，每次计算 ", "（VJP）"),
                col="每次传播填一列", row="每次传播填一行", pass_="第",
                bot="m = 1，标量损失：J 只有一行，一次反向传播得到整个梯度")}[L]
W, H = 740, 352
o = open_svg(W, H, L)
m, n = 4, 6
cs = 38
def Jtxt(): return B("J")
def grid(x0, y0, r, c, fills):
    for i in range(r):
        for j in range(c):
            o.append(f'<rect x="{x0 + j * cs}" y="{y0 + i * cs}" width="{cs}" height="{cs}" fill="{fills(i, j)}" stroke="#FFFFFF" stroke-width="2"/>')
    o.append(f'<rect x="{x0}" y="{y0}" width="{c * cs}" height="{r * cs}" fill="none" stroke="{NAVY}" stroke-width="1.8" rx="3"/>')
blues = ["#BFDBFE", "#93C5FD", "#BFDBFE", "#93C5FD", "#BFDBFE", "#93C5FD"]
oranges = ["#FED7AA", "#FDBA74", "#FED7AA", "#FDBA74"]
def dims(x0, y0, r, c):
    o.append(text(x0 + c * cs / 2, y0 - 8, I("n") + " " + ("columns" if L == "en" else "列"), 12, "middle", SLATE))
    o.append(text(x0 - 10, y0 + r * cs / 2 + 4, I("m") + " " + ("rows" if L == "en" else "行"), 12, "end", SLATE))
# left grid
lx, ly = 70, 66
o.append(text(lx - 40, 22, T["fw"][0] + I("n") + T["fw"][1] + B("J") + B("u") + T["fw"][2], 14, "start", BLUE, 700))
grid(lx, ly, m, n, lambda i, j: blues[j])
dims(lx, ly, m, n)
for j in range(n):
    lab = f"{j + 1}" if L == "en" else f"{j + 1}"
    o.append(text(lx + j * cs + cs / 2, ly + m * cs + 16, lab if j < n - 1 else "n", 12, "middle", BLUE, 600))
o.append(text(lx + n * cs / 2, ly + m * cs + 34, T["col"], 12, "middle", SLATE))
# right grid
rx = 420
o.append(text(rx - 40, 22, T["rv"][0] + I("m") + T["rv"][1] + B("u") + "ᵀ" + B("J") + T["rv"][2], 14, "start", ORANGE, 700))
grid(rx, ly, m, n, lambda i, j: oranges[i])
dims(rx, ly, m, n)
for i in range(m):
    o.append(text(rx + n * cs + 10, ly + i * cs + cs / 2 + 4, f"{i + 1}" if i < m - 1 else "m", 12, "start", ORANGE, 600))
o.append(text(rx + n * cs / 2, ly + m * cs + 34, T["row"], 12, "middle", SLATE))
# bottom: m = 1
by = 296
o.append(line(40, by - 30, W - 40, by - 30, stroke=BORDER, sw=1.2))
bx = 70
grid(bx, by, 1, n, lambda i, j: "#FDBA74")
o.append(text(bx - 10, by + cs / 2 + 4, I("m") + " = 1", 12, "end", SLATE))
o.append(text(bx + n * cs / 2, by - 8, B("J") + " = ∇" + I("𝓛") + "ᵀ", 12, "middle", SLATE))
o.append(line(bx + n * cs + 14, by + cs / 2, bx + n * cs + 46, by + cs / 2, stroke=ORANGE, sw=1.6, marker="ah"))
l1, l2 = (("a scalar loss: the whole gradient", "in one reverse pass") if L == "en" else ("标量损失：一次反向传播", "即得整个梯度"))
o.append(text(bx + n * cs + 56, by + cs / 2 - 2, l1, 13, "start", NAVY, 600))
o.append(text(bx + n * cs + 56, by + cs / 2 + 15, l2, 13, "start", NAVY, 600))
write(o, "fig-02-8", L)
