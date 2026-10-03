import sys; sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from _g03 import *
l = lang()
T = {"en": dict(t=["Stacking: stride 1", "Striding: layer 2 at stride 2", "Dilating: d = 1, 2, 4"], inp="input", lay="layer"),
     "zh": dict(t=["堆叠：步长 1", "步长：第 2 层步长为 2", "空洞：d = 1, 2, 4"], inp="输入", lay="层")}[l]
N, SP = 15, 11.6
ys = {0: 214, 1: 156, 2: 98, 3: 40}
# per panel: layer grids (positions), and taps (layer -> {unit: [taps in layer-1]})
panels = [
 dict(grid={1: range(15), 2: range(15), 3: range(15)},
      cone={3: [7], 2: [6, 7, 8], 1: [5, 6, 7, 8, 9], 0: [4, 5, 6, 7, 8, 9, 10]},
      taps={3: {7: [6, 7, 8]}, 2: {6: [5, 6, 7], 7: [6, 7, 8], 8: [7, 8, 9]}, 1: {u: [u-1, u, u+1] for u in range(5, 10)}},
      lab={1: ["r = 3"], 2: ["r = 5"], 3: ["r = 7"]}, dil=False),
 dict(grid={1: range(15), 2: range(1, 15, 2), 3: range(1, 15, 2)},
      cone={3: [7], 2: [5, 7, 9], 1: [4, 5, 6, 7, 8, 9, 10], 0: list(range(3, 12))},
      taps={3: {7: [5, 7, 9]}, 2: {5: [4, 5, 6], 7: [6, 7, 8], 9: [8, 9, 10]}, 1: {u: [u-1, u, u+1] for u in range(4, 11)}},
      lab={1: ["r = 3"], 2: ["r = 5", "Δ = 2"], 3: ["r = 9", "Δ = 2"]}, dil=False),
 dict(grid={1: range(15), 2: range(15), 3: range(15)},
      cone={3: [7], 2: [3, 7, 11], 1: [1, 3, 5, 7, 9, 11, 13], 0: list(range(15))},
      taps={3: {7: [3, 7, 11]}, 2: {3: [1, 3, 5], 7: [5, 7, 9], 11: [9, 11, 13]}, 1: {u: [u-1, u, u+1] for u in [1, 3, 5, 7, 9, 11, 13]}},
      lab={1: ["r = 3"], 2: ["r = 7"], 3: ["r = 15"]}, dil=True),
]
s = S(720, 262)
for p, P in enumerate(panels):
    x0 = 8 + p * 240
    X = lambda i: x0 + 4 + i * SP
    s.text(x0 + 88, 18, T["t"][p], 13, "middle", NAVY, "700")
    s.text(x0 + 4, 244, "", 12)
    # lines first
    for L in (3, 2, 1):
        for u, ts in P["taps"][L].items():
            for t in ts:
                dil = P["dil"] and L > 1
                col = ORANGE if dil else BLUE
                s.line(X(u), ys[L], X(t), ys[L-1], col, 1.3, op=0.85)
    for L in range(4):
        for i in (range(15) if L == 0 else P["grid"][L]):
            inc = i in P["cone"][L]
            s.circle(X(i), ys[L], 4.3 if inc else 3, BLUE if inc and L < 3 else (NAVY if inc else "#fff"), BLUE if inc else "#94A3B8", 1.2)
    for L in (1, 2, 3):
        for k, t in enumerate(P["lab"][L]):
            s.text(x0 + 4 + 14 * SP + 12, ys[L] + 4 + (k * 14 - (7 if len(P["lab"][L]) > 1 else 0)), t, 12, "start", SLATE if k else NAVY, "600" if k == 0 else None)
    s.text(x0 + 4 + 14 * SP + 12, ys[0] + 4, T["inp"], 12, "start", SLATE)
    # input cone bracket
    lo, hi = min(P["cone"][0]), max(P["cone"][0])
    s.path(f"M {X(lo)-3} {ys[0]+14} V {ys[0]+20} H {X(hi)+3} V {ys[0]+14}", BLUE, 1.5)
    s.text((X(lo) + X(hi)) / 2, ys[0] + 36, f"{hi-lo+1} " + ("inputs" if l == "en" else "个输入"), 12, "middle", BLUE, "600")
s.save("fig-03-7", l)
