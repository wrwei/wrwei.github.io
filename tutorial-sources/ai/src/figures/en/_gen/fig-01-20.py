# Nested cross-validation: outer five folds, inner three-fold loop on the training folds of one round.
import sys, re, os
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {
    "en": dict(
        leg=["outer training", "outer held out", "inner training", "inner validation"],
        t_out="Outer loop: 5 folds, 5 rounds", t_in="Inside round 1: folds 2–5 split into 3",
        fold="fold", rnd="round",
        in_note=["mean inner score for each candidate λ", "(the three bars repeat for every λ)"],
        a=["Inner loop picks λ*", "(best mean inner score)"],
        b=["Refit on folds 2–5", "with that λ*"],
        c=["Score on held-out fold 1", "= round 1's outer score"],
        no="no path back: the held-out fold never influences the choice of λ*",
        cost="Cost: 5 outer × 3 inner × 20 candidates = 300 fits for twenty values of λ",
        avg="The five outer scores, averaged, measure the whole procedure"),
    "zh": dict(
        leg=["外层训练", "外层留出", "内层训练", "内层验证"],
        t_out="外层循环：5 折，5 轮", t_in="第 1 轮内部：第 2–5 折再分成 3 份",
        fold="折", rnd="第",
        in_note=["每个候选 λ 的内层平均得分", "（对每个 λ 重复这三行）"],
        a=["内层循环选出 λ*", "（内层平均得分最好）"],
        b=["在第 2–5 折上", "用该 λ* 重新拟合"],
        c=["在留出的第 1 折上评分", "= 第 1 轮的外层得分"],
        no="没有回路：留出的折从不影响 λ* 的选择",
        cost="代价：5 外层 × 3 内层 × 20 个候选 = 300 次拟合（二十个 λ 值）",
        avg="五个外层得分取平均，衡量的是整个流程")}[LANG]
FONT = "DM Sans, system-ui, -apple-system, Segoe UI, sans-serif" if LANG == "en" else \
    "DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif"
W, H = 720, 446
NAVY, SLATE, BLUE, BFILL, SKY, SFILL, OR, OFILL, PU, PFILL, RED = "#1A2E4A", "#475569", "#2563EB", "#DBEAFE", "#0EA5E9", "#F0F9FF", "#C2410C", "#FFF7ED", "#7E22CE", "#FAF5FF", "#DC2626"
def lam(s):
    s = s.replace("&", "&amp;")
    return s.replace("λ*", '<tspan font-style="italic">λ</tspan>*').replace("λ", '<tspan font-style="italic">λ</tspan>') if "<tspan" not in s else s
def lam(s):  # italicise every lambda once
    s = s.replace("&", "&amp;")
    return re.sub(r"λ", '<tspan font-style="italic">λ</tspan>', s)
o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{FONT}">',
     '<defs>'
     f'<marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{SLATE}"/></marker>'
     f'<marker id="ahr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{RED}"/></marker>'
     '</defs>']
def rect(x, y, w, h, fill, stroke, sw=1.5, rx=4, extra=""):
    o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>')
def text(x, y, s, size=13, fill=NAVY, anchor="start", weight="400", extra=""):
    o.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}" {extra}>{lam(s)}</text>')
# legend
lx = [20, 170, 330, 470]
for x, (f, s), lab in zip(lx, ((BFILL, BLUE), (OFILL, OR), (SFILL, SKY), (PFILL, PU)), T["leg"]):
    rect(x, 8, 14, 14, f, s, 1.5, 3)
    text(x + 20, 20, lab, 12, SLATE)
# section titles
text(20, 52, T["t_out"], 13, NAVY, weight="700")
text(486, 52, T["t_in"], 13, NAVY, weight="700")
# outer rows
X0, CW, RY0, RH, RS = 110, 64, 82, 24, 30
for k in range(5):
    text(X0 + CW * k + CW / 2, 71, f"{T['fold']} {k + 1}" if LANG == "en" else f"{k + 1} {T['fold']}", 12, SLATE, "middle")
for i in range(5):
    y = RY0 + i * RS
    text(X0 - 10, y + 17, f"round {i + 1}" if LANG == "en" else f"{T['rnd']} {i + 1} 轮", 12, SLATE, "end")
    for k in range(5):
        held = (k == i)
        rect(X0 + CW * k + 1, y, CW - 2, RH, OFILL if held else BFILL, OR if held else BLUE, 1.5, 4)
# highlight round 1
rect(X0 - 4, RY0 - 4, CW * 5 + 8, RH + 8, "none", NAVY, 1.5, 6, 'stroke-dasharray="4 3"')
# arrow to inner panel
o.append(f'<path d="M{X0 + CW * 5 + 6},{RY0 + RH / 2} H476" fill="none" stroke="{SLATE}" stroke-width="1.5" marker-end="url(#ah)"/>')
# inner panel
rect(484, 58, 226, 168, "none", "#94A3B8", 1.5, 8, 'stroke-dasharray="4 3"')
IX, IW = 496, 66
for s in range(3):
    y = 80 + s * 32
    for j in range(3):
        v = (j == 2 - s)
        rect(IX + IW * j + 1, y, IW - 2, 24, PFILL if v else SFILL, PU if v else SKY, 1.5, 4)
text(597, 188, T["in_note"][0], 12, SLATE, "middle")
text(597, 204, T["in_note"][1], 12, SLATE, "middle")
# bottom flow
BY, BH = 270, 56
boxes = [(20, T["a"], BFILL, BLUE), (255, T["b"], BFILL, BLUE), (490, T["c"], OFILL, OR)]
for x, lines, f, s in boxes:
    rect(x, BY, 210, BH, f, s, 1.5, 8)
    text(x + 105, BY + 24, lines[0], 13, NAVY, "middle", "600")
    text(x + 105, BY + 43, lines[1], 12, SLATE, "middle")
for x in (230, 465):
    o.append(f'<line x1="{x + 2}" y1="{BY + BH / 2}" x2="{x + 23}" y2="{BY + BH / 2}" stroke="{SLATE}" stroke-width="1.5" marker-end="url(#ah)"/>')
# inner panel -> choose lambda
o.append(f'<path d="M597,226 V248 H125 V{BY - 2}" fill="none" stroke="{SLATE}" stroke-width="1.5" marker-end="url(#ah)"/>')
# no path back (red dashed) with a cross
o.append(f'<path d="M595,{BY + BH + 2} V350 H125 V{BY + BH + 4}" fill="none" stroke="{RED}" stroke-width="1.5" stroke-dasharray="5 4" marker-end="url(#ahr)"/>')
cx, cy = 360, 350
o.append(f'<circle cx="{cx}" cy="{cy}" r="10" fill="#FFFFFF" stroke="{RED}" stroke-width="1.5"/>')
o.append(f'<path d="M{cx - 5},{cy - 5} L{cx + 5},{cy + 5} M{cx + 5},{cy - 5} L{cx - 5},{cy + 5}" stroke="{RED}" stroke-width="2" stroke-linecap="round"/>')
text(360, 376, T["no"], 13, RED, "middle")
text(360, 408, T["cost"], 12, SLATE, "middle")
text(360, 428, T["avg"], 12, SLATE, "middle")
o.append("</svg>")
p = os.path.join(__import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")), LANG, "fig-01-20.svg")
open(p, "w", encoding="utf-8", newline="\n").write("\n".join(o) + "\n")
