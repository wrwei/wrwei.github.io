import sys; sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from _g03 import *
l = lang()
T = {"en": dict(fm="final feature map", flat="flatten", vals=["{C} · {H} · {W} = 25,088 values", "{C} = 512 values"], dense=["dense", "4,096 units"], dense2=["dense", "1,000 classes"],
                gap="average each channel", p1="25,088 × 4,096 + 4,096", p1b="= 102.8 million parameters", n1="each weight tied to one position",
                p2="512 × 1,000 + 1,000", p2b="= 0.5 million parameters", n2="no weight tied to a position", h1="Flatten + dense", h2="Global average pooling + dense"),
     "zh": dict(fm="最后的特征图", flat="展平", vals=["{C} · {H} · {W} = 25,088 个值", "{C} = 512 个值"], dense=["全连接", "4,096 个单元"], dense2=["全连接", "1,000 个类别"],
                gap="对每个通道取平均", p1="25,088 × 4,096 + 4,096", p1b="= 1.028 亿个参数", n1="每个权重对应一个位置",
                p2="512 × 1,000 + 1,000", p2b="= 51.3 万个参数", n2="没有权重对应具体位置", h1="展平 + 全连接", h2="全局平均池化 + 全连接")}[l]
C, H, W = it("C"), it("H"), it("W")
s = S(760, 350)
fx, fy, fw = 26, 150, 62
s.sheets(fx, fy, fw, fw, 5, 10, 8, SKYF, SKY)
s.text(fx + fw / 2 + 20, fy + fw + 24, T["fm"], 13, "middle", NAVY, "700")
s.text(fx + fw / 2 + 20, fy + fw + 42, f'{H} × {W} × {C} = 7 × 7 × 512', 13, "middle", NAVY)
rows = [dict(cy=84, col=ORANGE, colf=ORANGEF, h=T["h1"], strip=92, lab=T["flat"], vals=T["vals"][0], dense=T["dense"], p=(T["p1"], T["p1b"]), n=T["n1"], mk="aho"),
        dict(cy=286, col=GREEN, colf=GREENF, h=T["h2"], strip=18, lab=T["gap"], vals=T["vals"][1], dense=T["dense2"], p=(T["p2"], T["p2b"]), n=T["n2"], mk="ahg")]
for r in rows:
    cy, col = r["cy"], r["col"]
    s.text(240, cy - 66 if cy < fy else cy - 56, r["h"], 14, "start", col, "700")
    sx, sw = 240, 26
    s.rect(sx, cy - r["strip"] / 2, sw, r["strip"], r["colf"], col, 1.6)
    n = max(2, int(r["strip"] // 18))
    if r["strip"] > 40:
        for k in range(1, 5): s.line(sx, cy - r["strip"] / 2 + k * r["strip"] / 5, sx + sw, cy - r["strip"] / 2 + k * r["strip"] / 5, col, 0.8, op=0.6)
    s.text(sx + sw / 2, cy + r["strip"] / 2 + 18, r["vals"].format(C=C, H=H, W=W), 12, "middle", SLATE)
    # arrow feature map -> strip
    if cy < fy:
        s.line(fx + fw + 50, fy + 6, sx - 10, cy + 6, col, 1.6, marker=r["mk"])
        s.text(190, 108 + 14 + 0, "", 12)
    else:
        s.line(fx + fw + 50, fy + fw * 0.6, sx - 10, cy - 6, col, 1.6, marker=r["mk"])
    s.text(176 if cy < fy else 176, (cy - 8) if cy < fy else (cy - 8), "", 12)
    bx, bw, bh = 336, 140, 58
    s.rect(bx, cy - bh / 2, bw, bh, "#fff", col, 1.8, 8)
    s.text(bx + bw / 2, cy - 4, r["dense"][0], 13, "middle", NAVY, "700")
    s.text(bx + bw / 2, cy + 14, r["dense"][1], 13, "middle", NAVY)
    s.line(sx + sw + 4, cy, bx - 6, cy, col, 1.6, marker=r["mk"])
    s.text(496, cy - 6, r["p"][0], 13, "start", NAVY)
    s.text(496, cy + 12, r["p"][1], 14, "start", col, "700")
    s.text(496, cy + 32, r["n"], 12, "start", SLATE)
# labels on feature-map arrows
s.text(150, 104, T["flat"], 12, "middle", ORANGE, "600")
s.text(190, 284, T["gap"], 12, "end", GREEN, "600")
s.save("fig-03-13", l)
