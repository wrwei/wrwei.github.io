# Figure 4.1: four task shapes.  python fig-04-1.py en|zh
from _common import *
l = lang()
T = {
 "en": dict(titles=["Many-to-one", "Aligned many-to-many", "Sequence to sequence", "One-to-many"],
            task=["fault class", "next value  or  normal/fault", "note \u2192 fault codes", "generate a trace"],
            causal="causal", offline="offline", enc="encoder", dec="decoder", cell="RNN", state="state"),
 "zh": dict(titles=["多对一", "对齐的多对多", "序列到序列", "一对多"],
            task=["故障类别", "下一个值 或 正常/故障", "维修记录 \u2192 故障代码", "生成一条轨迹"],
            causal="因果", offline="离线", enc="编码器", dec="解码器", cell="RNN", state="状态"),
}[l]
W, H = 720, 472
PW, PH = 350, 218
P = open_svg(W, H, l)
SM = ('<marker id="ahs" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto">'
      f'<path d="M0,0 L10,5 L0,10 z" fill="{SLATE}"/></marker>'
      '<marker id="aho" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" markerUnits="userSpaceOnUse" orient="auto">'
      f'<path d="M0,0 L10,5 L0,10 z" fill="{ORANGE}"/></marker>')
P[1] = P[1].replace("</defs>", SM + "</defs>")

def lab(sym, sub): return B(sym) + SUB(sub)
def xl(s): return lab("x", s)
def yl(s): return lab("y", s)

BW, BH = 44, 24
def box(cx, top, kind, label, w=BW, h=BH):
    f, s = {"in": (F_SKY, SKY), "cell": (F_BLUE, BLUE), "out": (F_GREEN, GREEN), "fb": (F_ORANGE, ORANGE),
            "enc": (F_BLUE, BLUE), "dec": (F_ORANGE, ORANGE)}[kind]
    extra = ' stroke-dasharray="4 3"' if kind == "fb" else ""
    out = [rect(cx - w / 2, top, w, h, f, s, 1.6, 6, extra)]
    out.append(text(cx, top + h / 2 + 4.5, label, 13, "middle"))
    return out

def arrow(x1, y1, x2, y2, m="ahs", col=SLATE):
    return line(x1, y1, x2, y2, col, 1.6, m)

def panel(i, ox, oy):
    o = [rect(ox, oy, PW, PH, "#FFFFFF", BORDER, 1.2, 10)]
    o.append(text(ox + 14, oy + 21, T["titles"][i], 14, "start", NAVY, 700))
    return o

YO, YC, YI = 56, 100, 150   # box tops: outputs, cells, inputs (offsets)
def tag(ox, oy, causal):
    s = T["causal"] if causal else T["offline"]
    col, fill = (GREEN, F_GREEN) if causal else (ORANGE, F_ORANGE)
    w = 66
    return [rect(ox + PW - 14 - w, oy + 186, w, 22, fill, col, 1.4, 11),
            text(ox + PW - 14 - w / 2, oy + 201, s, 12.5, "middle", col, 600)]

cols4 = [58, 128, 198, 268]     # x offsets; col 3 (index 2) is the dots column

def chain(ox, oy, idx_cells, dots_idx=None, cols=cols4):
    """cells row with arrows between consecutive columns"""
    o = []
    y = oy + YC + BH / 2
    for k in range(len(cols) - 1):
        a, b = cols[k], cols[k + 1]
        x1 = ox + a + (BW / 2 if k not in (dots_idx,) else 8)
        x2 = ox + b - (BW / 2 if (k + 1) != dots_idx else 8)
        o.append(arrow(x1, y, x2 + 1, y))
    return o

# ---- panel 0: many-to-one
ox, oy = 10, 10
o = panel(0, ox, oy)
labels_in = [xl("1"), xl("2"), None, xl("T")]
for k, c in enumerate(cols4):
    cx = ox + c
    if labels_in[k] is None:
        for yy in (YO, YC, YI):
            if yy != YO: o.append(text(cx, oy + yy + 17, "\u22ef", 16, "middle", SLATE))
        continue
    o += box(cx, oy + YC, "cell", T["cell"])
    o += box(cx, oy + YI, "in", labels_in[k])
    o.append(arrow(cx, oy + YI, cx, oy + YC + BH + 1))
o += chain(ox, oy, None, dots_idx=2)
cx = ox + cols4[3]
o += box(cx, oy + YO, "out", yl("T"))
o.append(arrow(cx, oy + YC, cx, oy + YO + BH + 1))
o.append(text(cx, oy + YO - 8, T["task"][0], 12.5, "middle", SLATE))
o += tag(ox, oy, False)
P += o

# ---- panel 1: aligned many-to-many
ox, oy = 10 + PW + 10, 10
o = panel(1, ox, oy)
labels_out = [yl("1"), yl("2"), None, yl("T")]
for k, c in enumerate(cols4):
    cx = ox + c
    if labels_in[k] is None:
        for yy in (YO, YC, YI):
            o.append(text(cx, oy + yy + 17, "\u22ef", 16, "middle", SLATE))
        continue
    o += box(cx, oy + YC, "cell", T["cell"])
    o += box(cx, oy + YI, "in", labels_in[k])
    o += box(cx, oy + YO, "out", labels_out[k])
    o.append(arrow(cx, oy + YI, cx, oy + YC + BH + 1))
    o.append(arrow(cx, oy + YC, cx, oy + YO + BH + 1))
o += chain(ox, oy, None, dots_idx=2)
o.append(text(ox + (cols4[0] + cols4[3]) / 2, oy + YO - 8, T["task"][1], 12.5, "middle", SLATE))
o += tag(ox, oy, True)
P += o

# ---- panel 2: sequence to sequence
ox, oy = 10, 10 + PH + 16
o = panel(2, ox, oy)
enc = [40, 96, 152]
dec = [236, 296]
enc_lab = [xl("1"), xl("2"), xl("T")]
dec_lab = [yl("1"), lab("y", "T\u2032")]
cy = oy + YC + BH / 2
for k, c in enumerate(enc):
    cx = ox + c
    o += box(cx, oy + YC, "enc", T["cell"], 40)
    o += box(cx, oy + YI, "in", enc_lab[k], 40)
    o.append(arrow(cx, oy + YI, cx, oy + YC + BH + 1))
    if k: o.append(arrow(ox + enc[k - 1] + 20, cy, ox + c - 20 + 1, cy))
for k, c in enumerate(dec):
    cx = ox + c
    o += box(cx, oy + YC, "dec", T["cell"], 40)
    o += box(cx, oy + YO, "out", dec_lab[k], 40)
    o.append(arrow(cx, oy + YC, cx, oy + YO + BH + 1))
    if k: o.append(arrow(ox + dec[k - 1] + 20, cy, ox + c - 20 + 1, cy))
o.append(arrow(ox + enc[-1] + 20, cy, ox + dec[0] - 20 + 1, cy))
o.append(text(ox + (enc[-1] + dec[0]) / 2, cy - 8, T["state"], 12, "middle", SLATE))
o.append(text(ox + enc[1], oy + 194, T["enc"], 12, "middle", BLUE, 600))
o.append(text(ox + (dec[0] + dec[1]) / 2, oy + 140, T["dec"], 12, "middle", ORANGE, 600))
o.append(text(ox + (dec[0] + dec[1]) / 2, oy + YO - 8, T["task"][2], 12.5, "middle", SLATE))
o += tag(ox, oy, False)
P += o

# ---- panel 3: one-to-many
ox, oy = 10 + PW + 10, 10 + PH + 16
o = panel(3, ox, oy)
ins = [("in", xl("1")), ("fb", "\u0177" + SUB("1")), None, ("fb", "\u0177" + SUB("T\u22121"))]
outs = [yl("1"), yl("2"), None, yl("T")]
for k, c in enumerate(cols4):
    cx = ox + c
    if ins[k] is None:
        for yy in (YO, YC, YI):
            o.append(text(cx, oy + yy + 17, "\u22ef", 16, "middle", SLATE))
        continue
    o += box(cx, oy + YC, "cell", T["cell"])
    o += box(cx, oy + YI, ins[k][0], ins[k][1])
    o += box(cx, oy + YO, "out", outs[k])
    o.append(arrow(cx, oy + YI, cx, oy + YC + BH + 1))
    o.append(arrow(cx, oy + YC, cx, oy + YO + BH + 1))
o += chain(ox, oy, None, dots_idx=2)
# feedback: output i -> input i+1 (dashed orange), through the gap between columns
yo, yi = oy + YO + BH / 2, oy + YI + BH / 2
for k0, k1 in ((0, 1), (2, 3)):
    xs = ox + cols4[k0] + (BW / 2 if k0 != 2 else 8)
    xm = ox + cols4[k0] + 38 if k0 != 2 else ox + cols4[k0] + 36
    xe = ox + cols4[k1] - BW / 2
    o.append(f'<path d="M{xs},{yo} L{xm},{yo} L{xm},{yi} L{xe+1},{yi}" fill="none" stroke="{ORANGE}" stroke-width="1.5" stroke-dasharray="4 3" marker-end="url(#aho)"/>')
o.append(text(ox + (cols4[0] + cols4[3]) / 2, oy + YO - 8, T["task"][3], 12.5, "middle", SLATE))
o += tag(ox, oy, True)
P += o

write(P, "fig-04-1", l)
