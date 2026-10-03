import sys; sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from _g03 import *
l = lang()
T = {"en": dict(k="kernel", x=["input, window at (0, 0)", "input, window at (1, 2)"], p="products", y="output", sum="sum"),
     "zh": dict(k="卷积核", x=["输入，窗口在 (0, 0)", "输入，窗口在 (1, 2)"], p="逐项乘积", y="输出", sum="求和")}[l]
X = [[1,2,0,1,3],[0,1,3,2,1],[2,0,1,4,0],[1,3,2,0,1],[0,1,1,2,2]]
K = [[1,0,-1]]*3
Y = [[-1,-4,0],[-3,-2,4],[-1,-2,1]]
m = lambda v: str(v).replace("-", "−")
s = S(760, 372)
# kernel
kx, ky, kc = 14, 150, 24
s.text(kx + 36, ky - 10, T["k"], 13, "middle", NAVY, "700")
for r in range(3):
    for c in range(3):
        s.rect(kx + c*kc, ky + r*kc, kc, kc, GREENF, GREEN, 1)
        s.text(kx + c*kc + kc/2, ky + r*kc + 16, m(K[r][c]), 13, "middle", GREEN, "600")
wins = [(0, 0, BLUE, BLUEF, "ahb"), (1, 2, ORANGE, ORANGEF, "aho")]
oy, ox, oc = 134, 600, 40
sums = []
for n, (wr, wc, col, colf, mk) in enumerate(wins):
    top = 44 + n * 170
    ic = 28
    ix = 112
    s.text(ix + 70, top - 8, T["x"][n], 12, "middle", SLATE)
    fills = {(wr + r, wc + c): colf for r in range(3) for c in range(3)}
    s.grid(ix, top, 5, 5, ic, fills, "#94A3B8", 0.8)
    for r in range(5):
        for c in range(5):
            s.text(ix + c*ic + ic/2, top + r*ic + 19, str(X[r][c]), 13, "middle", NAVY)
    s.rect(ix + wc*ic, top + wr*ic, 3*ic, 3*ic, "none", col, 2.2)
    # products grid
    pc = 46
    px = 296; py = top + (5*ic - 3*pc) / 2
    s.text(px + 69, py - 8, T["p"], 12, "middle", SLATE)
    tot = 0
    for r in range(3):
        for c in range(3):
            a, b = X[wr + r][wc + c], K[r][c]
            tot += a * b
            s.rect(px + c*pc, py + r*pc, pc, pc, colf, col, 1.2)
            s.text(px + c*pc + pc/2, py + r*pc + 18, f"{a}×{m(b)}", 11, "middle", SLATE)
            s.text(px + c*pc + pc/2, py + r*pc + 37, m(a*b), 14, "middle", col, "700")
    assert tot == Y[wr][wc]
    s.line(ix + 3*ic + 0 + (wc*ic if False else 0) + 2 + (5-3-wc)*ic + 0, top + 5*ic/2, px - 8, top + 5*ic/2, SLATE, 1.5, marker="ah") if False else None
    s.line(ix + 5*ic + 6, top + 5*ic/2, px - 8, top + 5*ic/2, SLATE, 1.5, marker="ah")
    s.text(ix + 5*ic + 6 + 21, top + 5*ic/2 - 6, "× K", 12, "middle", SLATE)
    sx = px + 3*pc + 14
    sy = top + 5*ic/2
    s.text(sx, sy + 5, f"{T['sum']} = {m(tot)}", 14, "start", col, "700")
    sums.append((sx + 78 if l == "en" else sx + 70, sy, col, mk))
# output grid
s.text(ox + 60, oy - 12, T["y"], 13, "middle", NAVY, "700")
fills = {(0, 0): BLUEF, (1, 2): ORANGEF}
s.grid(ox, oy, 3, 3, oc, fills, "#94A3B8", 0.8)
for r in range(3):
    for c in range(3):
        col = BLUE if (r, c) == (0, 0) else ORANGE if (r, c) == (1, 2) else NAVY
        s.text(ox + c*oc + oc/2, oy + r*oc + 25, m(Y[r][c]), 14, "middle", col, "700" if col != NAVY else None)
s.rect(ox, oy, oc, oc, "none", BLUE, 2.2)
s.rect(ox + 2*oc, oy + oc, oc, oc, "none", ORANGE, 2.2)
# arrows
x1, y1, c1, m1 = sums[0]
s.line(x1, y1, ox - 3, oy + oc/2, c1, 1.6, marker=m1)
x2, y2, c2, m2 = sums[1]
s.path(f"M {x2} {y2} H {ox + 3*oc + 26} V {oy + oc*1.5} H {ox + 3*oc + 3}", c2, 1.6, marker=m2)
s.save("fig-03-3", l)
