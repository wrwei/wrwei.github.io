# Figure 5.17: one GCN message-passing update (node G1 of the five-node fault tree) and the two-hop
# receptive field of a basic event after two layers.  python fig-05-17.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
import numpy as np
l = lang()
T = {"en": dict(left="one layer, for node i = G1", over="sum over the neighbours j of i, and i itself", right="two layers, from E1", self="own vector", sum="sum",
                hop0="E1 itself", hop1="1 hop", hop2="2 hops", hop3="3 hops", out="E3 is 3 hops away: not seen", OR="OR", AND="AND"),
     "zh": dict(left="一层，节点 i = G1", over="对 i 的邻居 j 以及 i 自身求和", right="两层，从 E1 出发", self="自身向量", sum="求和",
                hop0="E1 本身", hop1="1 跳", hop2="2 跳", hop3="3 跳", out="E3 相距 3 跳：看不到", OR="或", AND="与")}[l]
# the tree and its degrees with self-loops
names = ["T", "G1", "E1", "E2", "E3"]
edges = [(0, 1), (0, 4), (1, 2), (1, 3)]
A = np.zeros((5, 5))
for a, b in edges:
    A[a, b] = A[b, a] = 1
dt = (A + np.eye(5)).sum(1)
hops = np.full(5, 99); hops[2] = 0
for k in range(1, 4):
    for i in range(5):
        if hops[i] == 99 and any(A[i, j] and hops[j] == k - 1 for j in range(5)):
            hops[i] = k
print("d~", dt, "hops from E1", hops)
assert list(hops) == [2, 1, 0, 2, 3]
w = lambda i, j: 1 / np.sqrt(dt[i] * dt[j])
g = 1
W, H = 760, 300
o = open_svg(W, H, l)
def or_gate(cx, y0, w=40, h=36):
    return (f'<path d="M {cx - w/2} {y0 + h} Q {cx} {y0 + h - 10} {cx + w/2} {y0 + h} Q {cx + w/2} {y0 + h*0.3} {cx} {y0} '
            f'Q {cx - w/2} {y0 + h*0.3} {cx - w/2} {y0 + h} Z" fill="{F_ORANGE}" stroke="{ORANGE}" stroke-width="1.6" stroke-linejoin="round"/>')
def and_gate(cx, y0, w=40, h=36):
    return (f'<path d="M {cx - w/2} {y0 + h} L {cx + w/2} {y0 + h} L {cx + w/2} {y0 + h/2} A {w/2} {h/2} 0 0 0 {cx - w/2} {y0 + h/2} Z" '
            f'fill="{F_BLUE}" stroke="{BLUE}" stroke-width="1.6" stroke-linejoin="round"/>')
def hsub(n): return B("h") + SUB(n)
# ---------- left: the update of G1 ----------
o.append(text(14, 22, T["left"], 13, "start", NAVY, "700"))
o.append(text(14, 46, B("h") + "′ᵢ = φ( Σⱼ " + B("W") + B("h") + "ⱼ / √(d̃ᵢ d̃ⱼ) )", 14, "start", NAVY))
o.append(text(196, 46, T["over"], 12, "start", SLATE))
rows = [("T", 0, 80, F_ORANGE, ORANGE), ("E1", 2, 132, F_GREEN, GREEN), ("E2", 3, 184, F_GREEN, GREEN), ("G1", 1, 250, F_BLUE, BLUE)]
NXc, WX, WW, JX = 34, 104, 34, 330
SX, SY, SR = 368, 166, 18
for n, j, y, f, c in rows:
    o.append(circle(NXc, y, 17, f, c, 1.6))
    o.append(text(NXc, y + 4.5, n, 12, "middle", NAVY, "600"))
    o.append(line(NXc + 17, y, WX - 1, y, SLATE, 1.5, "ah"))
    o.append(text((NXc + 17 + WX) / 2, y - 7, hsub(n), 12, "middle", NAVY))
    o.append(rect(WX, y - 14, WW, 28, "#FFFFFF", NAVY, 1.5, 6))
    o.append(text(WX + WW / 2, y + 5, B("W"), 14, "middle", NAVY))
    # horizontal run, then into the sum
    ang = np.arctan2(SY - y, SX - JX)
    ex, ey = SX - SR * np.cos(ang), SY - SR * np.sin(ang)
    col = BLUE if n == "G1" else SLATE
    o.append(f'<polyline points="{WX + WW},{y} {JX},{y} {ex:.1f},{ey:.1f}" fill="none" stroke="{col}" stroke-width="1.6" '
             f'stroke-linejoin="round" marker-end="url(#{"ahb" if n == "G1" else "ah"})"/>')
    wt = w(g, j)
    if n == "G1":
        lab = "× 1/d̃" + SUB("G1") + " = 1/4 = " + f"{wt:.2f}"
    else:
        lab = "× 1/√(" + f"{int(dt[g])} · {int(dt[j])}" + ") = " + f"{wt:.4f}"
    o.append(text(WX + WW + 10, y - 7, lab, 12, "start", BLUE if n == "G1" else NAVY))
o.append(text(12, 250 + 34, T["self"], 11, "start", BLUE))
o.append(circle(SX, SY, SR, "#FFFFFF", NAVY, 1.8))
o.append(text(SX, SY + 6, "Σ", 17, "middle", NAVY))
o.append(line(SX + SR, SY, 418, SY, SLATE, 1.6, "ah"))
o.append(rect(419, SY - 16, 34, 32, F_PURPLE, PURPLE, 1.5, 6))
o.append(text(436, SY + 6, "φ", 16, "middle", NAVY))
o.append(line(453, SY, 474, SY, SLATE, 1.6, "ah"))
o.append(text(478, SY + 5, B("h") + "′" + SUB("G1"), 14, "start", NAVY))
# ---------- right: two-hop receptive field of E1 ----------
PX = 548
o.append(line(PX - 14, 14, PX - 14, H - 14, BORDER, 1.2))
o.append(text(PX, 22, T["right"], 13, "start", NAVY, "700"))
pos = {"T": (662, 66), "G1": (606, 140), "E3": (718, 140), "E1": (576, 222), "E2": (640, 222)}
gh, R = 36, 17
# shaded field: buffered hull of the nodes within two hops
field = [pos["T"], pos["G1"], pos["E1"], pos["E2"]]
hull = [(pos["T"][0], pos["T"][1] + 8), (pos["E2"][0] + 4, pos["E2"][1]), (pos["E1"][0], pos["E1"][1]), (pos["G1"][0] - 4, pos["G1"][1] + 4)]
p = " ".join(f"{x},{y}" for x, y in hull)
o.append(f'<polygon points="{p}" fill="{F_BLUE}" stroke="{F_BLUE}" stroke-width="56" stroke-linejoin="round" opacity="0.8"/>')
def bottom(n):
    x, y = pos[n]
    return (x, y + gh - (5 if n == "T" else 0)) if n in ("T", "G1") else (x, y + R)
def top(n):
    x, y = pos[n]
    return (x, y) if n in ("T", "G1") else (x, y - R)
for a, b in (("T", "G1"), ("T", "E3"), ("G1", "E1"), ("G1", "E2")):
    (x1, y1), (x2, y2) = bottom(a), top(b)
    ym = y1 + 12
    o.append(f'<polyline points="{x1},{y1} {x1},{ym} {x2},{ym} {x2},{y2}" fill="none" stroke="{SLATE}" stroke-width="1.6" stroke-linejoin="round"/>')
o.append(or_gate(*pos["T"])); o.append(and_gate(*pos["G1"]))
o.append(text(pos["T"][0], pos["T"][1] + 25, T["OR"], 11, "middle", ORANGE, "700"))
o.append(text(pos["G1"][0], pos["G1"][1] + 27, T["AND"], 11, "middle", BLUE, "700"))
o.append(text(pos["T"][0] + 26, pos["T"][1] + 16, "T", 13, "start", NAVY, "700"))
o.append(text(pos["G1"][0] - 26, pos["G1"][1] + 22, "G1", 13, "end", NAVY, "700"))
for n in ("E1", "E2", "E3"):
    x, y = pos[n]
    hot = n == "E1"
    o.append(circle(x, y, R, BLUE if hot else (F_GREEN), BLUE if hot else GREEN, 1.8))
    o.append(text(x, y + 4.5, n, 12, "middle", "#FFFFFF" if hot else NAVY, "600"))
# hop counts
hl = {"T": (pos["T"][0] + 26, pos["T"][1] + 31, "start"), "G1": (pos["G1"][0] - 26, pos["G1"][1] + 37, "end"),
      "E1": (pos["E1"][0], pos["E1"][1] + 34, "middle"), "E2": (pos["E2"][0], pos["E2"][1] + 34, "middle")}
for n, key in (("T", "hop2"), ("G1", "hop1"), ("E1", "hop0"), ("E2", "hop2")):
    x, y, a = hl[n]
    o.append(text(x, y, T[key], 11, a, BLUE))
o.append(text(pos["E3"][0], pos["E3"][1] + 34, T["hop3"], 11, "middle", SLATE))
o.append(text(PX, H - 16, T["out"], 12, "start", SLATE))
write(o, "fig-05-17", l)
