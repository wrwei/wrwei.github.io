# Figure 4.4: BPTT backward pass and truncated BPTT.  python fig-04-4.py en|zh
from _common import *
l = lang()
T = {"en": dict(left="Backward through time", right="Truncated BPTT", fwd="forward", bwd="backward",
                k="k steps", detach="detach", strip="gradient: a sum of per-step outer products",
                state="state carried forward", grad="gradient stops"),
     "zh": dict(left="沿时间反向传播", right="截断 BPTT", fwd="前向", bwd="反向",
                k="k 步", detach="分离（detach）", strip="梯度：各步外积之和",
                state="状态继续向前传递", grad="梯度在此中断")}[l]
W, H = 720, 362
P = open_svg(W, H, l)
SM = ('<marker id="ahs" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto">'
      f'<path d="M0,0 L10,5 L0,10 z" fill="{MUTED}"/></marker>'
      '<marker id="ahsr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto">'
      f'<path d="M0,0 L10,5 L0,10 z" fill="{RED}"/></marker>')
P[1] = P[1].replace("</defs>", SM + "</defs>")
def v(s, sub=""): return B(s) + (SUB(sub) if sub else "")
def Lab(sub): return I("L") + SUB(sub)
GREY = MUTED

# ------------- left panel
P.append(text(10, 20, T["left"], 14, "start", NAVY, 700))
cxs = [70, 200, 330]
steps = ["t\u22121", "t", "t+1"]
CY, CHh, CWw = 124, 38, 64
LY = 36
XY = 200
for k, cx in enumerate(cxs):
    s = steps[k]
    P.append(rect(cx - 21, LY, 42, 24, F_RED, RED, 1.5, 6))
    P.append(text(cx, LY + 17, Lab(s), 13, "middle"))
    P.append(rect(cx - CWw / 2, CY, CWw, CHh, F_BLUE, BLUE, 1.8, 8))
    P.append(text(cx, CY + 25, v("h", s), 14, "middle"))
    P.append(rect(cx - 21, XY, 42, 24, F_SKY, SKY, 1.5, 6))
    P.append(text(cx, XY + 17, v("x", s), 13, "middle"))
    # forward: x -> cell, cell -> L
    P.append(line(cx, XY - 1, cx, CY + CHh + 1, GREY, 1.8, "ahg"))
    P.append(line(cx + 11, CY - 1, cx + 11, LY + 25, GREY, 1.8, "ahg"))
    # backward: L -> cell (delta_t)
    P.append(line(cx - 11, LY + 25, cx - 11, CY - 1, RED, 1.8, "ahr"))
    P.append(text(cx - 15, 96, v("\u03b4", s).replace("<tspan font-weight=\"700\">\u03b4", "<tspan font-weight=\"700\">\u03b4"), 14, "end", RED, 600))
# forward horizontal (grey) and backward horizontal (red)
for k in range(3):
    cx = cxs[k]
    if k < 2:
        x1, x2 = cx + CWw / 2, cxs[k + 1] - CWw / 2
        P.append(line(x1, CY + 11, x2 - 1, CY + 11, GREY, 1.8, "ahg"))
        P.append(line(x2, CY + 28, x1 + 1, CY + 28, RED, 1.8, "ahr"))
        P.append(text((x1 + x2) / 2, CY + 48, "\u03c6\u2032, " + B("W") + SUB("h") + "\u1d40", 12, "middle", RED))
P.append(line(8, CY + 11, cxs[0] - CWw / 2 - 1, CY + 11, GREY, 1.8, "ahg"))
P.append(line(cxs[2] + 55, CY + 28, cxs[2] + CWw / 2 + 1, CY + 28, RED, 1.8, "ahr"))
# strip: the parameter gradient
P.append(line(10, 252, 380, 252, BORDER, 1.2))
P.append(text(10, 272, "\u2202" + I("L") + "/\u2202" + B("W") + SUB("h") + " = \u03a3" + SUB("t") + " " + v("g", "t") + v("h", "t\u22121") + "\u1d40", 14, "start", NAVY, 600))
P.append(text(380, 272, T["strip"], 12, "end", SLATE))
terms = [v("g", "t\u22121") + v("h", "t\u22122") + "\u1d40", v("g", "t") + v("h", "t\u22121") + "\u1d40", v("g", "t+1") + v("h", "t") + "\u1d40"]
for k, cx in enumerate(cxs):
    P.append(rect(cx - 52, 288, 104, 28, F_PURPLE, PURPLE, 1.5, 6))
    P.append(text(cx, 307, terms[k], 13, "middle", NAVY))
    if k:
        P.append(text((cxs[k - 1] + cx) / 2, 307, "+", 16, "middle", SLATE))

# ------------- right panel
RX = 410
P.append(line(394, 8, 394, 330, BORDER, 1.2, None, "3 4"))
P.append(text(RX, 20, T["right"], 14, "start", NAVY, 700))
cw, ch, ig, cg = 20, 22, 10, 26
chunk_w = 3 * cw + 2 * ig
x0 = RX + 2
RYo = 36                      # vertical shift of this panel
cell_y = 150 + RYo - 36 + 10
yc = cell_y + ch / 2
chunks = []
for c in range(3):
    xl = x0 + c * (chunk_w + cg)
    chunks.append((xl, xl + chunk_w))
    for j in range(3):
        P.append(rect(xl + j * (cw + ig), cell_y, cw, ch, F_BLUE, BLUE, 1.5, 5))
# forward state arrows, continuous across the cuts
fx0 = x0 - 4
P.append(line(fx0, yc, chunks[0][0] - 0.5, yc, GREY, 1.8, "ahs"))
for c in range(3):
    xl, xr = chunks[c]
    for j in range(2):
        P.append(line(xl + j * (cw + ig) + cw, yc, xl + (j + 1) * (cw + ig) - 0.5, yc, GREY, 1.8, "ahs"))
    if c < 2:
        P.append(line(xr, yc, chunks[c + 1][0] - 0.5, yc, GREY, 1.8, "ahs"))
P.append(line(chunks[2][1], yc, chunks[2][1] + 14, yc, GREY, 1.8, "ahs"))
# k brackets
by = cell_y - 14
for (xl, xr) in chunks:
    P.append(f'<path d="M{xl},{by+5} L{xl},{by} L{xr},{by} L{xr},{by+5}" fill="none" stroke="{SLATE}" stroke-width="1.3"/>')
    P.append(text((xl + xr) / 2, by - 6, I("k") + (" steps" if l == "en" else " 步") if False else (I("k") + (" steps" if l == "en" else " 步")), 12, "middle", SLATE))
# cuts: dashed line, scissors
gy = cell_y + ch + 44            # red gradient arrow row
for c in range(2):
    cx = chunks[c][1] + cg / 2
    P.append(line(cx, cell_y - 10 + 6, cx, gy + 14, SLATE, 1.2, None, "4 3"))
    # scissors (two crossed blades with rings), above the bracket row
    sy = by - 4
    P.append(f'<g stroke="{NAVY}" stroke-width="1.5" fill="none" stroke-linecap="round">'
             f'<line x1="{cx-5}" y1="{sy-14}" x2="{cx+4}" y2="{sy+2}"/><line x1="{cx+5}" y1="{sy-14}" x2="{cx-4}" y2="{sy+2}"/>'
             f'<circle cx="{cx-5}" cy="{sy-17}" r="2.8" fill="#FFFFFF"/><circle cx="{cx+5}" cy="{sy-17}" r="2.8" fill="#FFFFFF"/></g>')
    P.append(text(cx, gy + 30, T["detach"], 12, "middle", RED, 600))
# gradient arrows: backward within each chunk, ending at the left edge of the chunk
for (xl, xr) in chunks:
    P.append(f'<path d="M{xr-8},{cell_y+ch} L{xr-8},{gy} L{xl+3},{gy}" fill="none" stroke="{RED}" stroke-width="1.8" marker-end="url(#ahsr)"/>')
    # stop bar at the cut
    P.append(line(xl - 5, gy - 7, xl - 5, gy + 7, RED, 2.4))
P.append(text(RX, cell_y + ch + 76 + 14, "", 12))
# legend (bottom)
ly = 350
P.append(line(10, ly - 4, 40, ly - 4, GREY, 1.8, "ahg")); P.append(text(46, ly, T["fwd"], 12, "start", SLATE))
lx = 46 + (50 if l == "en" else 36)
P.append(line(lx + 20, ly - 4, lx + 50, ly - 4, RED, 1.8, "ahr")); P.append(text(lx + 56, ly, T["bwd"], 12, "start", SLATE))
P.append(text(RX, 328, T["state"] + " \u2192  grey", 12, "start", SLATE) if False else "")
write(P, "fig-04-4", l)
