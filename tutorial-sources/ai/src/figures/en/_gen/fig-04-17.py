# Figure 4.17: additive attention at one decoder step. Usage: fig-04-17.py en|zh
from _common import *
l = lang()
T = {
 "en": dict(ann="annotations", score="score", w="softmax → weights", cell="decoder cell", sum="weighted sum", ill="(illustrative values)", fwd="fwd", bwd="bwd"),
 "zh": dict(ann="标注向量", score="打分", w="softmax → 权重", cell="解码器单元", sum="加权求和", ill="（示意数值）", fwd="前向", bwd="后向"),
}[l]
W, H = 720, 430
p = open_svg(W, H, l)
rows = [("1", 0.05, 100), ("2", 0.70, 164), ("3", 0.20, 228), ("S", 0.05, 322)]
HX, HW = 14, 84        # annotation column
SX, SW = 160, 58       # score nodes
BUS = 262              # decoder-state bus
BX, BM = 308, 130      # bars: origin, max length
SIGX, SIGY = 596, 200
# headers
p.append(text(HX+HW/2, 62, T["ann"], 13, "middle", SLATE))
p.append(text(SX+SW/2, 62, T["score"], 13, "middle", SLATE))
p.append(text(BX-6, 62, T["w"] + " ", 13, "start", SLATE).replace("</text>", f'<tspan font-style="italic">α</tspan><tspan dy="4" font-size="10" font-style="italic">t,j</tspan><tspan dy="-4"> </tspan></text>'))
p.append(text(BX-6, 356, T["ill"], 12, "start", SLATE))
# decoder state s_{t-1}
p.append(rect(540, 8, 150, 34, F_PURPLE, PURPLE))
p.append(text(615, 30, f'{B("s")}{SUB(I("t")+"−1")}'.replace(B("s"), '<tspan font-weight="700">s</tspan>'), 14, "middle", PURPLE))
p.append(line(540, 25, BUS, 25, PURPLE, 1.6)); p.append(line(BUS, 25, BUS, rows[-1][2], PURPLE, 1.6))
# rows
for name, a, y in rows:
    # annotation as stacked pair
    p.append(rect(HX, y-22, HW, 20, F_BLUE, BLUE, 1.4, 5)); p.append(text(HX+HW/2, y-8, T["fwd"], 11, "middle", BLUE))
    p.append(rect(HX, y+2, HW, 20, F_PURPLE if False else F_AMBER, AMBER, 1.4, 5)); p.append(text(HX+HW/2, y+16, T["bwd"], 11, "middle", AMBER))
    p.append(text(HX+HW+8, y+5, f'<tspan font-weight="700">h</tspan>{SUB(I(name) if name != "S" else I("S"))}', 14, "start", NAVY))
    # h -> score
    p.append(line(HX+HW+30, y, SX, y, SLATE, 1.5, "ah"))
    # score node
    p.append(rect(SX, y-14, SW, 28, "#FFFFFF", NAVY, 1.5, 14)); p.append(text(SX+SW/2, y+4.5, T["score"], 12, "middle"))
    # decoder state into score
    p.append(line(BUS, y+6, SX+SW+2, y+6, PURPLE, 1.4, None)); 
    p.append(f'<path d="M {SX+SW+2} {y+6} l 7 -3.5 l 0 7 z" fill="{PURPLE}"/>')
    # score -> bar (softmax)
    p.append(line(SX+SW, y-6, BX-2, y-6, SLATE, 1.4, "ah", extra=""))
    # bar
    p.append(f'<rect x="{BX}" y="{y-14}" width="{BM*a:.1f}" height="24" rx="3" fill="{BLUE}" opacity="0.85"/>')
    p.append(line(BX, y-18, BX, y+14, MUTED, 1.2))
    # to sum
    p.append(line(BX+BM*a+3, y-2, SIGX-20, SIGY, "#94A3B8", 1.2))
# ellipsis between 3 and S
p.append(text(HX+HW/2, 284, "⋮", 22, "middle", SLATE)); p.append(text(BX+4, 284, "⋮", 22, "start", SLATE))
# sum node
p.append(circle(SIGX, SIGY, 20, F_GREEN, GREEN, 2)); p.append(text(SIGX, SIGY+7, "Σ", 20, "middle", GREEN, "700"))
p.append(text(SIGX, SIGY-28, T["sum"], 12, "middle", SLATE))
# decoder cell
CY0 = 292
p.append(rect(540, CY0, 150, 46, F_SKY, SKY, 1.8, 8)); p.append(text(615, CY0+28, T["cell"], 13, "middle"))
p.append(line(SIGX, SIGY+20, SIGX, CY0-1, GREEN, 2, "ah"))
p.append(text(SIGX+8, 258, f'<tspan font-weight="700">a</tspan>{SUB(I("t"))}', 14, "start", GREEN))
# s_{t-1} into the cell (right side)
p.append(line(690, 25, 706, 25, PURPLE, 1.6)); p.append(line(706, 25, 706, CY0+23, PURPLE, 1.6)); p.append(line(706, CY0+23, 691, CY0+23, PURPLE, 1.6, "ah"))
# y_{t-1}
p.append(rect(555, 376, 120, 32, "#FFFFFF", NAVY)); p.append(text(615, 397, f'<tspan font-style="italic">y</tspan>{SUB(I("t")+"−1")}', 14, "middle"))
p.append(line(615, 376, 615, CY0+47, SLATE, 1.6, "ah"))
write(p, "fig-04-17", l)
