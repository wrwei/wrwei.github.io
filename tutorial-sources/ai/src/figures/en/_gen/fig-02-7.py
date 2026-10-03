import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(l1="black: forward values", l2="red: adjoints (derivative of f with respect to the node)"),
     "zh": dict(l1="黑色：前向传播的值", l2="红色：伴随量（f 对该节点的导数）")}[L]
W, H = 720, 450
o = open_svg(W, H, L)
R = 29
P = {"x1": (80, 150), "x2": (80, 290), "ln": (270, 70), "mul": (270, 220), "sin": (270, 350),
     "add": (460, 140), "sub": (610, 250)}
def unit(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]; d = math.hypot(dx, dy); return dx / d, dy / d
edges = [("x1", "ln"), ("x1", "mul"), ("x2", "mul"), ("x2", "sin"), ("ln", "add"), ("mul", "add"), ("add", "sub"), ("sin", "sub")]
OFF = 7
for a, b in edges:
    ux, uy = unit(P[a], P[b])
    nx, ny = -uy, ux
    s = (P[a][0] + ux * (R + 1) + nx * OFF * 0 , P[a][1] + uy * (R + 1))
    # forward (black) arrow slightly on one side, adjoint (red) arrow the other side
    for sign, col, mk, rev in ((-1, SLATE, "ah", False), (+1, RED, "ahr", True)):
        ox, oy = nx * OFF * sign * 0.8, ny * OFF * sign * 0.8
        p1 = (P[a][0] + ux * (R + 2) + ox, P[a][1] + uy * (R + 2) + oy)
        p2 = (P[b][0] - ux * (R + 4) + ox, P[b][1] - uy * (R + 4) + oy)
        if rev: p1, p2 = p2, p1
        o.append(line(p1[0], p1[1], p2[0], p2[1], stroke=col, sw=1.5 if not rev else 1.4, marker=mk))
# output edge
o.append(line(P["sub"][0] + R + 2, P["sub"][1], P["sub"][0] + R + 50, P["sub"][1], stroke=SLATE, sw=1.5, marker="ah"))
o.append(text(P["sub"][0] + R + 56, P["sub"][1] + 5, I("f"), 15, "start"))
vals = {"x1": ("x" + "₁", "2"), "x2": ("x₂", "5"), "ln": ("ln", "0.693"), "mul": ("×", "10"), "sin": ("sin", "−0.959"),
        "add": ("+", "10.693"), "sub": ("−", "11.652")}
for k, (px, py) in P.items():
    inp = k.startswith("x")
    o.append(circle(px, py, R, F_SKY if inp else "#FFFFFF", SKY if inp else NAVY, 1.8))
    nm, v = vals[k]
    o.append(text(px, py - 3, I(nm) if inp else nm, 18 if nm in "+×−" else 14, "middle", NAVY, 600))
    o.append(text(px, py + 13, v, 12, "middle", NAVY))
# adjoints (red)
def adj(x, y, s, anchor="middle"):
    o.append(text(x, y, s, 13, anchor, RED, 600, halo=True))
adj(P["sub"][0], P["sub"][1] - R - 10, "1")
adj(P["add"][0], P["add"][1] - R - 10, "1")
adj(P["sin"][0], P["sin"][1] + R + 18, "−1")
adj(P["ln"][0], P["ln"][1] - R - 10, "1")
adj(P["mul"][0] + 2, P["mul"][1] + R + 18, "1")
adj(P["x1"][0], P["x1"][1] - R - 10, "5.5 = 0.5 + 5")
adj(P["x2"][0], P["x2"][1] + R + 18, "1.716 = 2 − 0.284")
# +=
o.append(text(P["x1"][0] + R + 12, P["x1"][1] + 4 - 2, "+=", 13, "start", RED, 700, halo=True)) if False else None
for k, dy in (("x1", -1), ("x2", 1)):
    o.append(text(P["x1"][0] - R - 6 if False else P[k][0] - R - 4, P[k][1] + 4, "+=", 13, "end", RED, 700))
o.append(text(8, H - 30, T["l1"], 12, "start", NAVY))
o.append(text(8, H - 12, T["l2"], 12, "start", RED, 600))
write(o, "fig-02-7", L)
