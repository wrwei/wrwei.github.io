import sys; sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from _g03 import *
l = lang()
T = {"en": dict(inp="input", f="one filter", om="one output map", out="output", sl=["slide, sum over", "all input channels"],
                co=["repeat with", "{Cout} different filters"], wt="weight tensor", fl="filter", filters="filters, each"),
     "zh": dict(inp="输入", f="一个滤波器", om="一张输出特征图", out="输出", sl=["滑动，并对", "所有输入通道求和"],
                co=["用 {Cout} 个不同的", "滤波器重复"], wt="权重张量", fl="滤波器", filters="个滤波器，每个为")}[l]
Cin = f'{it("C")}{sub("in")}'; Cout = f'{it("C")}{sub("out")}'
Hh, Ww, kk = it("H"), it("W"), it("k")
Ho = f'{it("H")}{sub("out")}'; Wo = f'{it("W")}{sub("out")}'
s = S(720, 410)
ix, iy, iw, ih, dx, dy = 24, 112, 92, 84, 13, 10
s.sheets(ix, iy, iw, ih, 3, dx, dy, SKYF, SKY)
s.text(ix + iw / 2 + 10, iy + ih + 24, T["inp"], 13, "middle", NAVY, "700")
s.text(ix + iw / 2 + 10, iy + ih + 42, f'{Cin} × {Hh} × {Ww}', 13, "middle", NAVY)
fx, fy, fw = ix + 34, iy + 30, 26
s.sheets(fx, fy, fw, fw, 3, dx, dy, BLUEF, BLUE, 1.6)
s.text(ix, iy - 44, T["f"], 12, "start", BLUE, "700")
s.text(ix, iy - 28, f'{Cin} × {kk} × {kk}', 13, "start", BLUE, "700")
s.line(ix + 40, iy - 24, fx + 2 * dx, fy - 2 * dy, BLUE, 1, dash="2 3")
mx, my, mw, mh = 290, 120, 74, 62
s.rect(mx, my, mw, mh, ORANGEF, ORANGE, 1.5)
s.rect(mx + 22, my + 18, 12, 12, ORANGE, ORANGE, 1)
s.text(mx + mw / 2, my + mh + 24, T["om"], 13, "middle", NAVY, "700")
s.text(mx + mw / 2, my + mh + 42, f'{Ho} × {Wo}', 13, "middle", NAVY)
ax, ay = fx + fw + 2 * dx + 6, fy - 2 * dy + fw / 2
s.line(ax, ay, mx - 12, my + 20, SLATE, 1.6, marker="ah")
s.text(204, 96, T["sl"][0], 12, "middle", SLATE); s.text(204, 110, T["sl"][1], 12, "middle", SLATE)
ox, oy = 560, 144
s.sheets(ox, oy, mw, mh, 5, 11, 9, ORANGEF, ORANGE)
s.text(ox + mw / 2 + 24, oy + mh + 24, T["out"], 13, "middle", NAVY, "700")
s.text(ox + mw / 2 + 24, oy + mh + 42, f'{Cout} × {Ho} × {Wo}', 13, "middle", NAVY)
s.line(mx + mw + 12, my + mh / 2, ox - 14, oy + mh / 2 - 8, SLATE, 1.6, marker="ah")
s.text(468, 118, T["co"][0].format(Cout=Cout), 12, "middle", SLATE); s.text(468, 132, T["co"][1].format(Cout=Cout), 12, "middle", SLATE)
wy = 300
s.text(24, wy - 30, T["wt"], 13, "start", NAVY, "700")
s.text(24 + (92 if l == "en" else 66), wy - 30, f'({Cout}, {Cin}, {kk}, {kk})', 13, "start", NAVY, "700")
sp = " " if l == "en" else " "
for j, x in enumerate([24, 154, 480]):
    s.sheets(x, wy, 34, 34, 3, 9, 7, BLUEF, BLUE, 1.4)
    lab = f'{T["fl"]} {j+1}' if j < 2 else f'{T["fl"]} {Cout}'
    s.text(x + 26, wy + 56, lab, 12, "middle", SLATE)
s.text(330, wy + 22, "⋯", 22, "middle", SLATE)
s.path(f"M 24 {wy + 70} V {wy + 78} H 520 V {wy + 70}", NAVY, 1.4)
s.text(272, wy + 96, f'{Cout} {T["filters"]} {Cin} × {kk} × {kk}', 12, "middle", SLATE)
s.save("fig-03-9", l)
