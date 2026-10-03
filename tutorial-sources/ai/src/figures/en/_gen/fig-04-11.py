import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _m04b import *
l = lang()
T = {"en": dict(t1="Padded batch: 3 × 8", t1b="Mask", steps=" steps", time="time step →", t2="Packed by time step", act="active sequences:",
                note1="only the 15 real cells are computed", note2="(the padded batch has 24 cells)",
                t3="Stateful training: one long stream cut into chunks", chunk="chunk ", det="detach", reset="reset", state="state carried", eos="end of stream"),
     "zh": dict(t1="填充后的批：3 × 8", t1b="掩码", steps=" 步", time="时间步 →", t2="按时间步打包", act="活跃序列数：",
                note1="只计算这 15 个真实单元格", note2="（填充后的批共 24 个单元格）",
                t3="有状态训练：一条长序列切成若干块", chunk="第 ", det="分离", reset="重置", state="状态传递", eos="序列末尾")}[l]
AHO = ""
hatch = ('<pattern id="hatch" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">'
         '<rect width="7" height="7" fill="#FFFFFF"/><line x1="0" y1="0" x2="0" y2="7" stroke="#94A3B8" stroke-width="2"/></pattern>')
P = open_svg(740, 462, l, hatch)
S = 30; X0 = 96
lens = [2, 5, 8]; steps = [50, 120, 200]
P.append(text(X0, 24, T["t1"], 14, "start", NAVY, "700"))
P.append(text(440, 24, T["t1b"], 14, "start", NAVY, "700"))
for r in range(3):
    y = 36 + r * S
    P.append(text(X0 - 8, y + 20, f"{steps[r]}{T['steps']}", 13, "end", SLATE))
    for c in range(8):
        real = c < lens[r]
        P.append(f'<rect x="{X0 + c*S}" y="{y}" width="{S}" height="{S}" fill="{F_BLUE if real else "url(#hatch)"}" stroke="{BLUE if real else MUTED}" stroke-width="1"/>')
        mx = 440 + c * S
        P.append(f'<rect x="{mx}" y="{y}" width="{S}" height="{S}" fill="{F_BLUE if real else "#FFFFFF"}" stroke="{MUTED}" stroke-width="1"/>')
        P.append(text(mx + S / 2, y + 20, "1" if real else "0", 14, "middle", BLUE if real else SLATE, "600" if real else None))
P.append(text(X0, 144, T["time"], 12, "start", SLATE))
P.append(line(20, 160, 720, 160, BORDER, 1))
# middle: packed
P.append(text(X0, 186, T["t2"], 14, "start", NAVY, "700"))
cnt = [3, 3, 2, 2, 2, 1, 1, 1]
for c in range(8):
    for r in range(cnt[c]):
        P.append(f'<rect x="{X0 + c*S}" y="{198 + r*S}" width="{S}" height="{S}" fill="{F_BLUE}" stroke="{BLUE}" stroke-width="1"/>')
    P.append(text(X0 + c * S + S / 2, 198 + 3 * S + 18, str(cnt[c]), 13, "middle", SLATE, "600"))
P.append(text(X0 + 8 * S + 12, 198 + 3 * S + 18, "← " + T["act"].rstrip(":：") , 12, "start", SLATE))
P.append(text(440, 226, T["note1"], 13, "start", NAVY, "600"))
P.append(text(440, 246, T["note2"], 12, "start", SLATE))
P.append(line(20, 322, 720, 322, BORDER, 1))
# bottom: stream
P.append(text(40, 346, T["t3"], 14, "start", NAVY, "700"))
CW, GAP, CY, CH = 120, 44, 384, 36
xs = [40 + k * (CW + GAP) for k in range(4)]
for k, x in enumerate(xs):
    P.append(rect(x, CY, CW, CH, F_BLUE, BLUE, 1.6, 6))
    P.append(text(x + CW / 2, CY + 23, T["chunk"] + str(k + 1) + ("" if l == "en" else " 块"), 13, "middle", NAVY, "600"))
for k in range(3):
    x1 = xs[k] + CW; x2 = xs[k + 1]; xm = (x1 + x2) / 2
    P.append(line(x1, CY + CH / 2, x2, CY + CH / 2, SLATE, 1.8, "ah"))
    P.append(line(xm, CY - 4, xm, CY + CH + 4, ORANGE, 3))
    P.append(text(xm, CY - 10, T["det"], 12, "middle", ORANGE, "700"))
xe = xs[3] + CW
P.append(line(xe + 14, CY - 4, xe + 14, CY + CH + 4, RED, 3))
P.append(text(xe + 14, CY - 10, T["reset"], 12, "middle", RED, "700"))
P.append(text(40, 448, T["state"] + ": " + I("h") + SUB("T") + " → " + I("h") + SUB("0") + ("  (" + "next chunk" + ")" if l == "en" else "（下一块）"), 12, "start", SLATE))
write(P, "fig-04-11", l)
