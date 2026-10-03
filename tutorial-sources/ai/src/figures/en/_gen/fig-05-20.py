# Figure 5.20: a hexagon and two triangles that message passing cannot tell apart.  python fig-05-20.py en|zh
# Two GCN layers H <- ReLU(A-hat H W) with one fixed W, from identical features, on both graphs.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
import numpy as np
l = lang()
T = {"en": dict(P="P: one 6-cycle (connected)", Q="Q: two triangles (not connected)", r0="start", r1="after round 1", r2="after round 2",
                foot1="Every node has d̃ = 3, so every non-zero entry of Â is 1/3 and each row of Â" + B("H") + " is the node's own vector.",
                foot2="Layer: " + B("H") + " ← ReLU(Â" + B("H") + B("W") + "), " + B("W") + " = [[0.6, 0.4], [0.2, 0.9]] on both graphs; all twelve nodes stay identical."),
     "zh": dict(P="P：一个 6-环（连通）", Q="Q：两个三角形（不连通）", r0="初始", r1="第 1 轮后", r2="第 2 轮后",
                foot1="每个节点 d̃ = 3，Â 的非零元均为 1/3，Â" + B("H") + " 的每一行就是节点自身的向量。",
                foot2="层：" + B("H") + " ← ReLU(Â" + B("H") + B("W") + ")，两图用同一个 " + B("W") + " = [[0.6, 0.4], [0.2, 0.9]]；十二个节点始终相同。")}[l]
def ahat(edges, n=6):
    A = np.zeros((n, n))
    for a, b in edges:
        A[a, b] = A[b, a] = 1
    At = A + np.eye(n); d = At.sum(1)
    return At / np.sqrt(np.outer(d, d))
EP = [(i, (i + 1) % 6) for i in range(6)]
EQ = [(0, 1), (1, 2), (2, 0), (3, 4), (4, 5), (5, 3)]
Wm = np.array([[0.6, 0.4], [0.2, 0.9]])
h0 = np.array([1.0, 1.0])
out = {}
for name, E in (("P", EP), ("Q", EQ)):
    M = ahat(E)
    assert np.allclose(M[M > 0], 1 / 3)
    H = np.tile(h0, (6, 1)); hs = [H]
    for k in range(2):
        H = np.maximum(M @ H @ Wm, 0); hs.append(H)
    out[name] = hs
for k in range(3):
    allrows = np.vstack([out["P"][k], out["Q"][k]])
    assert np.allclose(allrows, allrows[0])
    print("round", k, allrows[0])
vec = lambda v: "(" + ", ".join(f"{x:.2f}".rstrip("0").rstrip(".") if abs(x - round(x)) < 1e-9 else f"{x:.2f}" for x in v) + ")"
W, H = 730, 360
o = open_svg(W, H, l)
R = 11
def node(x, y):
    return circle(x, y, R, F_BLUE, BLUE, 1.6)
def graph(kind, cx, cy):
    s = []
    if kind == "P":
        pts = [(cx + 54 * np.cos(np.pi / 2 + k * np.pi / 3), cy - 54 * np.sin(np.pi / 2 + k * np.pi / 3)) for k in range(6)]
        E = EP
    else:
        pts = []
        for ox in (-50, 50):
            pts += [(cx + ox + 34 * np.cos(np.pi / 2 + k * 2 * np.pi / 3), cy + 6 - 34 * np.sin(np.pi / 2 + k * 2 * np.pi / 3)) for k in range(3)]
        E = EQ
    for a, b in E:
        s.append(line(*pts[a], *pts[b], NAVY, 1.6))
    for x, y in pts:
        s.append(node(x, y))
    return s
CW, CHh = 84, 22
COLS = [(222, "r0"), (336, "r1"), (538, "r2")]
for row, (name, cy) in enumerate((("P", 100), ("Q", 246))):
    o += graph(name, 110, cy)
    o.append(text(116, cy + (84 if name == "P" else 50), T[name], 12, "middle", NAVY, "600"))
    for ci, (x0, key) in enumerate(COLS):
        if ci == 0:
            # the single starting vector shared by all nodes
            o.append(rect(x0, cy - CHh / 2, 86, CHh, "#FFFFFF", MUTED, 1.2, 5))
            o.append(text(x0 + 43, cy + 5, vec(out[name][0][0]), 12, "middle", SLATE))
            o.append(text(x0 + 43, cy - 20, "× 6", 11, "middle", SLATE))
            continue
        hs = out[name][ci]
        for k in range(6):
            cx_, cy_ = x0 + (k % 2) * (CW + 6), cy - 40 + (k // 2) * (CHh + 7)
            o.append(rect(cx_, cy_, CW, CHh, F_GREEN, GREEN, 1.2, 5))
            o.append(text(cx_ + CW / 2, cy_ + 15.5, vec(hs[k]), 12, "middle", NAVY))
    # arrows between columns
    o.append(line(222 + 86 + 4, cy, 336 - 4, cy, SLATE, 1.5, "ah"))
    o.append(line(336 + 2 * CW + 6 + 4, cy, 538 - 4, cy, SLATE, 1.5, "ah"))
for x0, key in COLS:
    wdt = 86 if key == "r0" else 2 * CW + 6
    o.append(text(x0 + wdt / 2, 26, T[key], 12, "middle", SLATE, "600"))
o.append(text(16, H - 34, T["foot1"], 12, "start", SLATE))
o.append(text(16, H - 14, T["foot2"], 12, "start", SLATE))
write(o, "fig-05-20", l)
