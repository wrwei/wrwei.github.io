# Figure 5.16: the five-node fault tree, its normalised adjacency A-hat and A-hat X (Section 7).  python fig-05-16.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
import numpy as np
l = lang()
T = {"en": dict(OR="OR", AND="AND", basic="basic", ahat="Â", ahx="Â" + B("X"),
                e3="E3 (0.4082, 0, 0.5): its gate is an OR, so it is a single point of failure",
                e1="E1 (0, 0.3536, 0.5): its gate is an AND, so it is not"),
     "zh": dict(OR="或", AND="与", basic="基本", ahat="Â", ahx="Â" + B("X"),
                e3="E3 (0.4082, 0, 0.5)：所在门为或门，是单点故障",
                e1="E1 (0, 0.3536, 0.5)：所在门为与门，不是单点故障")}[l]
names = ["T", "G1", "E1", "E2", "E3"]
edges = [(0, 1), (0, 4), (1, 2), (1, 3)]
A = np.zeros((5, 5))
for a, b in edges:
    A[a, b] = A[b, a] = 1
At = A + np.eye(5)
d = At.sum(1)
Ah = At / np.sqrt(np.outer(d, d))
X = np.array([[1, 0, 0], [0, 1, 0], [0, 0, 1], [0, 0, 1], [0, 0, 1]], float)
AX = Ah @ X
print("degrees", d); print(np.round(Ah, 4)); print(np.round(AX, 4))
assert list(d) == [3, 4, 2, 2, 2]
assert np.allclose(np.round(AX[4], 4), [0.4082, 0, 0.5]) and np.allclose(np.round(AX[2], 4), [0, 0.3536, 0.5])
assert np.allclose(np.round(AX[0], 4), [0.3333, 0.2887, 0.4082]) and np.allclose(np.round(AX[1], 4), [0.2887, 0.25, 0.7071])
fmt = lambda v: "0" if abs(v) < 1e-12 else f"{v:.4f}".rstrip("0").rstrip(".") if abs(v - 0.25) < 1e-12 or abs(v - 0.5) < 1e-12 else f"{v:.4f}"

W, H = 760, 280
o = open_svg(W, H, l)
# ---- tree (left) ----
def or_gate(cx, y0, w=46, h=42):
    return (f'<path d="M {cx - w/2} {y0 + h} Q {cx} {y0 + h - 12} {cx + w/2} {y0 + h} Q {cx + w/2} {y0 + h*0.3} {cx} {y0} '
            f'Q {cx - w/2} {y0 + h*0.3} {cx - w/2} {y0 + h} Z" fill="{F_ORANGE}" stroke="{ORANGE}" stroke-width="1.6" stroke-linejoin="round"/>')
def and_gate(cx, y0, w=46, h=42):
    return (f'<path d="M {cx - w/2} {y0 + h} L {cx + w/2} {y0 + h} L {cx + w/2} {y0 + h/2} A {w/2} {h/2} 0 0 0 {cx - w/2} {y0 + h/2} Z" '
            f'fill="{F_BLUE}" stroke="{BLUE}" stroke-width="1.6" stroke-linejoin="round"/>')
gh = 42
pos = {"T": (142, 40), "G1": (84, 128), "E3": (204, 150), "E1": (48, 232), "E2": (120, 232)}
R = 19
def bottom(n):   # where input edges attach
    x, y = pos[n]
    return (x, y + gh - (6 if n == "T" else 0)) if n in ("T", "G1") else (x, y + R)
def top(n):
    x, y = pos[n]
    return (x, y) if n in ("T", "G1") else (x, y - R)
for p, c in (("T", "G1"), ("T", "E3"), ("G1", "E1"), ("G1", "E2")):
    (x1, y1), (x2, y2) = bottom(p), top(c)
    ym = y1 + 14
    o.append(f'<polyline points="{x1},{y1} {x1},{ym} {x2},{ym} {x2},{y2}" fill="none" stroke="{SLATE}" stroke-width="1.6" stroke-linejoin="round"/>')
o.append(or_gate(*pos["T"])); o.append(and_gate(*pos["G1"]))
o.append(text(pos["T"][0], pos["T"][1] + 29, T["OR"], 11, "middle", ORANGE, "700"))
o.append(text(pos["G1"][0], pos["G1"][1] + 31, T["AND"], 11, "middle", BLUE, "700"))
o.append(text(pos["T"][0] + 30, pos["T"][1] + 18, "T", 14, "start", NAVY, "700"))
o.append(text(pos["G1"][0] - 30, pos["G1"][1] + 18, "G1", 14, "end", NAVY, "700"))
for n in ("E1", "E2", "E3"):
    x, y = pos[n]
    o.append(circle(x, y, R, F_GREEN, GREEN, 1.6))
    o.append(text(x, y + 5, n, 13, "middle", NAVY, "600"))
dl = {"T": (pos["T"][0] + 30, pos["T"][1] + 34, "start"), "G1": (pos["G1"][0] - 30, pos["G1"][1] + 34, "end"),
      "E3": (pos["E3"][0], pos["E3"][1] + 36, "middle"), "E1": (pos["E1"][0], pos["E1"][1] + 36, "middle"),
      "E2": (pos["E2"][0], pos["E2"][1] + 36, "middle")}
for k, n in enumerate(names):
    x, y, a = dl[n]
    o.append(text(x, y, "d̃ = " + str(int(d[k])), 11, a, SLATE))
# ---- matrices (right) ----
CW, CH = 53, 28
def matrix(x0, y0, M, cols, title, hl=None):
    out = [text(x0 + CW * M.shape[1] / 2, y0 - 30, title, 14, "middle", NAVY, "700")]
    for j, c in enumerate(cols):
        out.append(text(x0 + CW * j + CW / 2, y0 - 8, c, 12, "middle", SLATE))
    for i, n in enumerate(names):
        out.append(text(x0 - 8, y0 + CH * i + 19, n, 12, "end", SLATE))
        if hl and n in hl:
            out.append(rect(x0, y0 + CH * i, CW * M.shape[1], CH, hl[n][0], hl[n][1], 1.8, 4))
            continue
        for j in range(M.shape[1]):
            v = M[i, j]
            out.append(text(x0 + CW * j + CW / 2, y0 + CH * i + 19, fmt(v), 12, "middle", NAVY if abs(v) > 1e-12 else MUTED))
    out.append(f'<rect x="{x0}" y="{y0}" width="{CW * M.shape[1]}" height="{CH * 5}" fill="none" stroke="{MUTED}" stroke-width="1" rx="3"/>')
    return out
MY = 72
o += matrix(270, MY, Ah, names, T["ahat"])
o += matrix(586, MY, AX, [T["OR"], T["AND"], T["basic"]], T["ahx"], hl={"E3": (F_ORANGE, ORANGE), "E1": (F_BLUE, BLUE)})
# keep highlighted rows' text above their fill: redraw
for n, c in (("E3", ORANGE), ("E1", BLUE)):
    i = names.index(n)
    for j in range(3):
        v = AX[i, j]
        o.append(text(586 + CW * j + CW / 2, MY + CH * i + 19, fmt(v), 12, "middle", c if abs(v) > 1e-12 else MUTED, "700" if abs(v) > 1e-12 else None))
o.append(text(270, MY + CH * 5 + 30, T["e3"], 12, "start", ORANGE))
o.append(text(270, MY + CH * 5 + 50, T["e1"], 12, "start", BLUE))
write(o, "fig-05-16", l)
