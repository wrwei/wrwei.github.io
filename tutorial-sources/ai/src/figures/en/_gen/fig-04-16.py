# Figure 4.16: beam-search tree of the toy example (k = 2). Usage: fig-04-16.py en|zh
from _common import *
l = lang()
T = {
 "en": dict(steps=["step 1", "step 2", "step 3"], start="start", kept="kept (beam k = 2)", pruned="pruned",
            greedy="greedy path: A⟨e⟩ (0.20)", beam="beam answer BA⟨e⟩ (0.36)", fin="finished"),
 "zh": dict(steps=["第 1 步", "第 2 步", "第 3 步"], start="起点", kept="保留（束宽 k = 2）", pruned="剪掉",
            greedy="贪心路径：A⟨e⟩（0.20）", beam="束搜索的答案 BA⟨e⟩（0.36）", fin="已结束"),
}[l]
W, H = 720, 394
p = open_svg(W, H, l)
GREY, GREYT, GREYF = "#94A3B8", "#64748B", "#F8FAFC"
CX = [58, 232, 420, 618]
NW, NH = 104, 30
Y2 = {"AA": 62, "AB": 104, "Ae": 146, "BA": 208, "BB": 250, "Be": 292}
Y1 = {"A": 104, "B": 250, "e": 346}
Y0 = 176
nodes = {}
def node(key, x, y, label, prob, kind):
    nodes[key] = (x, y)
    if kind == "kept":
        fill, st, sw, tc = "#FFFFFF", NAVY, 3, NAVY
    elif kind == "pruned":
        fill, st, sw, tc = GREYF, GREY, 1.2, GREYT
    elif kind == "beam":
        fill, st, sw, tc = F_GREEN, GREEN, 3, GREEN
    else:
        fill, st, sw, tc = "#FFFFFF", NAVY, 1.5, NAVY
    p.append(f'<rect x="{x-NW/2}" y="{y-NH/2}" width="{NW}" height="{NH}" rx="8" fill="{fill}" stroke="{st}" stroke-width="{sw}"/>')
    p.append(text(x-4, y+5, label, 14, "end", tc, "700"))
    p.append(text(x+2, y+5, prob, 13, "start", tc))
def edge(a, b, stroke=MUTED, sw=1.5, dash=None, marker=None):
    (x1, y1), (x2, y2) = nodes[a], nodes[b]
    p.append(line(x1+NW/2, y1, x2-NW/2-(3 if marker else 0), y2, stroke, sw, marker, dash))
# edges first (underneath nodes is not needed: they end on box borders)
def build():
    node("root", CX[0], Y0, T["start"], "", "plain")
    for k, pr, kind in (("A", "0.5", "kept"), ("B", "0.4", "kept"), ("e", "0.1", "pruned")):
        node(k, CX[1], Y1[k], "A" if k == "A" else "B" if k == "B" else "⟨e⟩", pr, kind)
    spec = [("AA", "AA", "0.15", "pruned"), ("AB", "AB", "0.15", "pruned"), ("Ae", "A⟨e⟩", "0.20", "kept"),
            ("BA", "BA", "0.36", "kept"), ("BB", "BB", "0.02", "pruned"), ("Be", "B⟨e⟩", "0.02", "pruned")]
    for k, lab, pr, kind in spec:
        node(k, CX[2], Y2[k], lab, pr, kind)
    node("BAe", CX[3], Y2["BA"], "BA⟨e⟩", "0.36", "beam")
build()
# redraw edges: need nodes dict filled, so draw into a separate list inserted before nodes
edges = []
def E(a, b, stroke=MUTED, sw=1.5, dash=None):
    (x1, y1), (x2, y2) = nodes[a], nodes[b]
    edges.append(line(x1+NW/2, y1, x2-NW/2, y2, stroke, sw, None, dash))
for k in ("A", "B", "e"): E("root", k, GREY if k == "e" else SLATE, 1.5 if k == "e" else 2)
for k in ("AA", "AB", "Ae"): E("A", k, GREY if k != "Ae" else SLATE, 1.5 if k != "Ae" else 2)
for k in ("BA", "BB", "Be"): E("B", k, GREY if k != "BA" else SLATE, 1.5 if k != "BA" else 2)
# greedy: root-A-Ae dashed blue (drawn over the grey/slate edges)
E("root", "A", BLUE, 3.2, "7 5"); E("A", "Ae", BLUE, 3.2, "7 5")
# beam answer: root-B-BA-BAe green
E("root", "B", GREEN, 3.4); E("B", "BA", GREEN, 3.4); E("BA", "BAe", GREEN, 3.4)
# insert edges after the defs (index 1)
p[2:2] = edges
for i, x in enumerate(CX[1:]):
    p.append(text(x, 20, T["steps"][i], 13, "middle", SLATE))
# legend (stacked, lower right)
lx, ly = 488, 290
p.append(f'<rect x="{lx}" y="{ly-11}" width="30" height="14" rx="4" fill="#FFFFFF" stroke="{NAVY}" stroke-width="3"/>')
p.append(text(lx+38, ly, T["kept"], 12, "start", NAVY))
p.append(f'<rect x="{lx}" y="{ly+25}" width="30" height="14" rx="4" fill="{GREYF}" stroke="{GREY}" stroke-width="1.2"/>')
p.append(text(lx+38, ly+36, T["pruned"], 12, "start", GREYT))
p.append(line(lx, ly+64, lx+30, ly+64, BLUE, 3, dash="7 5")); p.append(text(lx+38, ly+68, T["greedy"], 12, "start", BLUE))
p.append(line(lx, ly+94, lx+30, ly+94, GREEN, 3.4)); p.append(text(lx+38, ly+98, T["beam"], 12, "start", GREEN))
write(p, "fig-04-16", l)
