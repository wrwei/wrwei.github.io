import sys; sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from _g03 import *
l = lang()
T = {"en": dict(t=["Dense", "Locally connected", "Convolutional"],
                c=["4.83 × 10¹¹ weights", "86.7 million weights", "1,792 parameters"],
                inp="input 6 × 6", note="224 × 224 × 3 input, 224 × 224 × 64 output, 3 × 3 windows",
                unit="unit", sub=["every pixel, own weight", "own 3 × 3 window, own weights", "own 3 × 3 window, shared weights"]),
     "zh": dict(t=["全连接", "局部连接", "卷积"],
                c=["4.83 × 10¹¹ 个权重", "8670 万个权重", "1,792 个参数"],
                inp="输入 6 × 6", note="224 × 224 × 3 输入，224 × 224 × 64 输出，3 × 3 窗口",
                unit="单元", sub=["每个像素各有权重", "各自的 3 × 3 窗口与权重", "各自的 3 × 3 窗口，权重共享"])}[l]
s = S(720, 262)
cell = 16
for p in range(3):
    x0 = 14 + p * 240
    y0 = 46
    s.text(x0 + 110, 22, T["t"][p], 14, "middle", NAVY, "700")
    fills = {}
    if p == 0:
        fills = {(r, c): SKYF for r in range(6) for c in range(6)}
    else:
        for r in range(3):
            for c in range(3):
                fills[(r, c)] = BLUEF
                fills[(r + 3, c + 3)] = BLUEF if p == 2 else ORANGEF
    s.grid(x0, y0, 6, 6, cell, fills, "#94A3B8", 0.8)
    pts = lambda r, c: (x0 + c * cell + cell / 2, y0 + r * cell + cell / 2)
    ux = x0 + 156
    if p == 0:
        uy = y0 + 48
        for r in range(6):
            for c in range(6):
                px, py = pts(r, c)
                s.line(px, py, ux, uy, FAINT, 0.7, op=0.8)
        s.circle(ux, uy, 8, BLUEF, BLUE, 1.8)
    else:
        ua, ub = y0 + 20, y0 + 76
        col2 = BLUE if p == 2 else ORANGE
        for r in range(3):
            for c in range(3):
                px, py = pts(r, c); s.line(px, py, ux, ua, BLUE, 0.9, op=0.7)
                px, py = pts(r + 3, c + 3); s.line(px, py, ux, ub, col2, 0.9, op=0.7)
        s.rect(x0, y0, 3 * cell, 3 * cell, "none", BLUE, 2)
        s.rect(x0 + 3 * cell, y0 + 3 * cell, 3 * cell, 3 * cell, "none", col2, 2)
        s.circle(ux, ua, 8, BLUEF, BLUE, 1.8)
        s.circle(ux, ub, 8, BLUEF if p == 2 else ORANGEF, col2, 1.8)
        s.text(ux + 14, ua + 5, f'{it("w")}₁…{it("w")}₉', 13, "start", BLUE, "600")
        s.text(ux + 14, ub + 5, (f'{it("w")}₁…{it("w")}₉' if p == 2 else f'{it("v")}₁…{it("v")}₉'), 13, "start", col2, "600")
    s.text(x0 + 48, y0 + 96 + 17, T["inp"], 12, "middle", SLATE)
    s.text(x0 + 110, 192, T["sub"][p], 12, "middle", SLATE)
    s.text(x0 + 110, 216, T["c"][p], 15, "middle", [RED, ORANGE, GREEN][p], "700")
s.text(360, 250, T["note"], 12, "middle", SLATE)
s.save("fig-03-1", l)
