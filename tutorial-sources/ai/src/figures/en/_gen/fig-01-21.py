# Four splitting schemes as timelines of rows (specimens A-H, interleaved in time).
import sys, os, random
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {
    "en": dict(
        leg=["training", "validation", "gap (dropped)", "unused"],
        a="(a) Random row split: every specimen falls on both sides, which leaks",
        b="(b) Group split: each specimen is wholly training or wholly validation",
        c="(c) Forward-chaining time split: each validation block follows its training rows after a gap",
        d="(d) Both: validation specimens held out entirely, and later than the training period",
        time="time", row="one row per measurement; the letter is the specimen"),
    "zh": dict(
        leg=["训练", "验证", "间隔（舍弃）", "未使用"],
        a="(a) 随机按行划分：每个试件的行都落在两侧，造成泄漏",
        b="(b) 按组划分：每个试件要么全在训练集，要么全在验证集",
        c="(c) 前向滚动时间划分：每个验证块在间隔之后跟随其训练行",
        d="(d) 两者结合：验证试件整体留出，并且晚于训练时段",
        time="时间", row="每个测量一行；字母是试件")}[LANG]
FONT = "DM Sans, system-ui, -apple-system, Segoe UI, sans-serif" if LANG == "en" else \
    "DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif"
NAVY, SLATE = "#1A2E4A", "#475569"
STY = {"t": ("#DBEAFE", "#2563EB", "#1A2E4A"), "v": ("#FFF7ED", "#C2410C", "#1A2E4A"),
       "g": ("#E2E8F0", "#94A3B8", "#64748B"), "u": ("#FFFFFF", "#CBD5E1", "#94A3B8")}
N, CW, X0 = 32, 20, 28
spec = [chr(65 + i % 8) for i in range(N)]            # A B C ... H repeated four times
W = X0 * 2 + N * CW + 12
rnd = random.Random(7)
# (a) random rows: about a quarter validation, every specimen on both sides
while True:
    a = ["v" if rnd.random() < 0.28 else "t" for _ in range(N)]
    if all({a[i] for i in range(N) if spec[i] == s} == {"t", "v"} for s in "ABCDEFGH"):
        break
VAL = {"C", "G"}
b = ["v" if s in VAL else "t" for s in spec]
c = []
for tr, gap_end in ((12, 14), (18, 20), (24, 26)):
    c.append(["t"] * tr + ["g"] * (gap_end - tr) + ["v"] * 6 + ["u"] * (N - gap_end - 6))
d = []
for i, s in enumerate(spec):
    if i < 18: d.append("v" if False else ("u" if s in VAL else "t"))
    elif i < 20: d.append("g")
    else: d.append("v" if s in VAL else "u")
o = []
def strip(y, kinds, letters=True):
    for i, k in enumerate(kinds):
        f, s, tc = STY[k]
        x = X0 + i * CW
        o.append(f'<rect x="{x + 0.75}" y="{y}" width="{CW - 1.5}" height="22" rx="3" fill="{f}" stroke="{s}" stroke-width="1.25"/>')
        if letters:
            o.append(f'<text x="{x + CW / 2}" y="{y + 15.5}" font-size="11" fill="{tc}" text-anchor="middle">{spec[i]}</text>')
y = 8
for x, k, lab in zip((X0, X0 + 130, X0 + 260, X0 + 420), "tvgu", T["leg"]):
    f, s, _ = STY[k]
    o.append(f'<rect x="{x}" y="{y}" width="14" height="14" rx="3" fill="{f}" stroke="{s}" stroke-width="1.25"/>')
    o.append(f'<text x="{x + 20}" y="{y + 12}" font-size="12" fill="{SLATE}">{lab}</text>')
y = 46
panels = [(T["a"], [a]), (T["b"], [b]), (T["c"], c), (T["d"], [d])]
for title, strips in panels:
    o.append(f'<text x="{X0}" y="{y}" font-size="13" font-weight="600" fill="{NAVY}">{title}</text>')
    y += 8
    for j, k in enumerate(strips):
        strip(y, k, letters=(j == 0))
        y += 28
    y += 22
# time arrow
y -= 8
o.append(f'<line x1="{X0}" y1="{y}" x2="{X0 + N * CW}" y2="{y}" stroke="{SLATE}" stroke-width="1.5" marker-end="url(#ah)"/>')
o.append(f'<text x="{X0 + N * CW}" y="{y + 16}" font-size="12" fill="{SLATE}" text-anchor="end">{T["time"]}</text>')
o.append(f'<text x="{X0}" y="{y + 16}" font-size="12" fill="{SLATE}">{T["row"]}</text>')
H = y + 26
head = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{FONT}">'
        f'<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="{SLATE}"/></marker></defs>')
p = os.path.join(__import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")), LANG, "fig-01-21.svg")
open(p, "w", encoding="utf-8", newline="\n").write(head + "\n" + "\n".join(o) + "\n</svg>\n")
print(W, H)
