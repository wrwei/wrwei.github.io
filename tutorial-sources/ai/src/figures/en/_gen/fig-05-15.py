# Figure 5.15: latent diffusion pipeline with the tensor shape on every arrow.  python fig-05-15.py en|zh
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
l = lang()
T = {"en": dict(img="image", lat="latent", enc="encoder", dec="decoder", den="denoiser", loop="diffusion loop",
                rep="applied repeatedly, t = T, …, 1", cond="condition", cross="cross-attention",
                ctext="(e.g. text token embeddings)",
                n1="786,432 values", n2="16,384 values", fewer="786,432 / 16,384 = 48: the denoiser handles 48 times fewer values at every step",
                once="runs once per image"),
     "zh": dict(img="图像", lat="潜在表示", enc="编码器", dec="解码器", den="去噪器", loop="扩散循环",
                rep="反复应用，t = T, …, 1", cond="条件", cross="交叉注意力",
                ctext="（如文本 token 嵌入）",
                n1="786,432 个值", n2="16,384 个值", fewer="786,432 / 16,384 = 48：去噪器每一步处理的值只有原来的 1/48",
                once="每张图像只运行一次")}[l]
W, H = 760, 300
o = open_svg(W, H, l)
cy = 168
def image(x, y, s=48):
    out = []
    for k, (f, c) in enumerate(((F_RED, RED), (F_GREEN, GREEN), (F_BLUE, BLUE))):
        d = (2 - k) * 6
        out.append(rect(x + d, y - d, s, s, f, c, 1.3, 3))
    return out
def trap(x0, x1, h0, h1, fill, stroke):
    p = f"{x0},{cy - h0 / 2} {x1},{cy - h1 / 2} {x1},{cy + h1 / 2} {x0},{cy + h0 / 2}"
    return f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="1.6" stroke-linejoin="round"/>'
def arrow(xa, xb, shape, name, count):
    r = [line(xa, cy, xb - 1, cy, SLATE, 1.6, "ah"), text((xa + xb) / 2, cy - 9, shape, 13, "middle", NAVY)]
    y = cy + 20
    if name:
        r.append(text((xa + xb) / 2, y, name, 12, "middle", SLATE)); y += 15
    r.append(text((xa + xb) / 2, y, count, 11, "middle", SLATE))
    return r
big = "512 × 512 × 3"
small = "64 × 64 × 4"
# input image
o += image(6, cy - 14, 38)
o.append(text(31, cy + 50, T["img"], 12, "middle", SLATE))
o += arrow(56, 170, big, "", T["n1"])
# encoder: wide in, narrow out
o.append(trap(170, 228, 84, 40, F_SKY, SKY))
o.append(text(199, cy + 5, T["enc"], 12, "middle", NAVY))
o += arrow(228, 324, small, T["lat"], T["n2"])
# diffusion loop
LX, LW, LY, LH = 324, 124, cy - 34, 68
o.append(rect(LX, LY, LW, LH, F_BLUE, BLUE, 1.8))
o.append(text(LX + LW / 2, LY + 26, T["den"] + " " + B("ε") + SUB("θ"), 14, "middle", NAVY))
o.append(text(LX + LW / 2, LY + 46, T["loop"], 12, "middle", BLUE, "600"))
# loop-back arrow under the box
ly = LY + LH
o.append(f'<path d="M {LX + LW - 30} {ly + 1} C {LX + LW - 30} {ly + 34}, {LX + 30} {ly + 34}, {LX + 30} {ly + 8}" '
         f'fill="none" stroke="{BLUE}" stroke-width="1.6" marker-end="url(#ahb)"/>')
o.append(text(LX + LW / 2, ly + 46, T["rep"].replace("t = T", I("t") + " = " + I("T")), 12, "middle", BLUE))
# condition from above, by cross-attention
o.append(rect(LX + 6, 30, LW - 12, 40, F_PURPLE, PURPLE, 1.5))
o.append(text(LX + LW / 2, 55, T["cond"] + " " + B("c"), 13, "middle", NAVY))
o.append(text(LX + LW / 2, 88, T["ctext"], 11, "middle", SLATE))
o.append(line(LX + LW / 2, 96, LX + LW / 2, LY - 1, PURPLE, 1.6))
o.append(f'<path d="M {LX + LW / 2 - 4.5} {LY - 9} L {LX + LW / 2 + 4.5} {LY - 9} L {LX + LW / 2} {LY - 1} z" fill="{PURPLE}"/>')
o.append(text(LX + LW / 2 + 8, LY - 12, T["cross"], 12, "start", PURPLE))
o += arrow(448, 544, small, T["lat"], T["n2"])
# decoder: narrow in, wide out
o.append(trap(544, 602, 40, 84, F_GREEN, GREEN))
o.append(text(573, cy + 5, T["dec"], 12, "middle", NAVY))
o.append(text(573, cy - 52, T["once"], 11, "middle", SLATE))
o += arrow(602, 706, big, "", T["n1"])
o += image(706, cy - 14, 38)
o.append(text(731, cy + 50, T["img"], 12, "middle", SLATE))
# value counts
o.append(text(W / 2, H - 12, T["fewer"], 12, "middle", NAVY))
write(o, "fig-05-15", l)
