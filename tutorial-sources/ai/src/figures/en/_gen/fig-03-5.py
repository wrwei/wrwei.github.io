import sys; sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from _g03 import *
l = lang()
T = {"en": dict(fw="convolution: y = Mx", bw="backward: ∂𝓛/∂x = Mᵀg", tc="transposed convolution", bands="kernel w = (1, 2, 3)"),
     "zh": dict(fw="卷积：y = Mx", bw="反向：∂𝓛/∂x = Mᵀg", tc="转置卷积", bands="卷积核 w = (1, 2, 3)")}[l]
w = [1, 2, 3]
M = [[0]*5 for _ in range(3)]
for i in range(3):
    for u in range(3): M[i][i+u] = w[u]
MT = [[M[r][c] for r in range(3)] for c in range(5)]
x = [1, 0, 2, 1, 3]; g = [1, -1, 2]
y = [sum(M[i][j]*x[j] for j in range(5)) for i in range(3)]
dx = [sum(MT[i][j]*g[j] for j in range(3)) for i in range(5)]
assert y == [7, 7, 13] and dx == [1, 1, 3, 1, 6]
m = lambda v: str(v).replace("-", "−")
cols = {1: (BLUE, BLUEF), 2: (ORANGE, ORANGEF), 3: (GREEN, GREENF)}
s = S(700, 306)
c = 34
def matrix(x0, y0, A, shade=True):
    for r, row in enumerate(A):
        for q, v in enumerate(row):
            if v and shade:
                f = cols[v][1]; t = cols[v][0]; wt = "700"
            else:
                f = "#fff"; t = FAINT; wt = None
            s.rect(x0 + q*c, y0 + r*c, c, c, f, "#94A3B8", 0.8)
            s.text(x0 + q*c + c/2, y0 + r*c + 22, str(v), 14, "middle", t, wt)
    s.path(f"M {x0+5} {y0-3} H {x0-3} V {y0+len(A)*c+3} H {x0+5}", NAVY, 1.5)
    s.path(f"M {x0+len(A[0])*c-5} {y0-3} H {x0+len(A[0])*c+3} V {y0+len(A)*c+3} H {x0+len(A[0])*c-5}", NAVY, 1.5)
def vec(x0, y0, v, col, label):
    for r, a in enumerate(v):
        s.rect(x0, y0 + r*c, c + 4, c, "#fff", "#94A3B8", 0.8)
        s.text(x0 + (c+4)/2, y0 + r*c + 22, m(a), 14, "middle", col, "700")
    s.text(x0 + (c+4)/2, y0 - 10, label, 13, "middle", col, "700")
    s.path(f"M {x0+5} {y0-3} H {x0-3} V {y0+len(v)*c+3} H {x0+5}", NAVY, 1.5)
    s.path(f"M {x0+c+4-5} {y0-3} H {x0+c+4+3} V {y0+len(v)*c+3} H {x0+c+4-5}", NAVY, 1.5)
top = 62
s.text(172, 24, T["fw"], 14, "middle", NAVY, "700")
s.text(520, 24, T["bw"], 14, "middle", NAVY, "700")
# forward
mx, my = 14, top + 34
matrix(mx, my, M)
s.text(mx + 85, my + 3*c + 26, f'{it("M")}: 3 × 5'.replace(it("M"), '<tspan font-weight="700">M</tspan>'), 12, "middle", SLATE)
s.text(mx + 5*c + 16, my + 51 + 5, "×", 17, "middle", SLATE)
vec(mx + 5*c + 32, top, x, NAVY, "x")
s.text(mx + 5*c + 32 + c + 4 + 14, my + 51 + 5, "=", 17, "middle", SLATE)
vec(mx + 5*c + 32 + c + 4 + 28, my, y, BLUE, "y")
s.line(350, 40, 350, 270, GRID, 1.5)
# backward
bx, by = 372, top
matrix(bx, by, MT)
s.text(bx + 51, by + 5*c + 22, '<tspan font-weight="700">M</tspan>ᵀ: 5 × 3', 12, "middle", SLATE)
s.text(bx + 3*c + 16, by + 85 + 5, "×", 17, "middle", SLATE)
vec(bx + 3*c + 32, my, g, NAVY, "g")
s.text(bx + 3*c + 32 + c + 4 + 14, by + 85 + 5, "=", 17, "middle", SLATE)
vec(bx + 3*c + 32 + c + 4 + 28, top, dx, GREEN, "∂𝓛/∂x")
s.text(bx + 3*c + 32 + c + 4 + 28 + 20, by + 5*c + 40, T["tc"], 13, "middle", GREEN, "700")
s.text(172, 292, T["bands"], 12, "middle", SLATE)
s.save("fig-03-5", l)
