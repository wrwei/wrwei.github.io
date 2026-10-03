import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
T = {"en": dict(inp="input", out="class map", sizes="map size (pixels per side)", chs="channels",
                pool="2 × 2 max pooling", up="2 × 2 up-convolution", skip="copy and crop", conv1="1 × 1 convolution",
                conv3="each block: two 3 × 3 convolutions + ReLU", img="image", enc="encoder", dec="decoder", bott="bottleneck"),
     "zh": dict(inp="输入", out="类别图", sizes="特征图尺寸（每边像素数）", chs="通道数",
                pool="2 × 2 最大池化", up="2 × 2 上卷积", skip="复制并裁剪", conv1="1 × 1 卷积",
                conv3="每个块：两次 3 × 3 卷积 + ReLU", img="图像", enc="编码器", dec="解码器", bott="瓶颈")}[L]
W, H = 720, 470
o = open_svg(W, H, L, extra_defs=f'<marker id="ahgr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{GREEN}"/></marker>')
GREY = "#94A3B8"
def fmt(n): return f"{n:,}"
def bw(ch): return 9 + 10 * math.log2(ch / 64)
def bh(sz): return 10 + sz * 0.34
cy = [152, 230, 300, 360, 410]
cx = lambda k: 52 + 66 * k
enc = [(568, 64), (280, 128), (136, 256), (64, 512), (28, 1024)]
dec = {3: (52, 512), 2: (100, 256), 1: (196, 128), 0: (388, 64)}
geom = {}
def block(k, lvl, sz, ch, fill, stroke, strip=False):
    w, h = bw(ch), bh(sz)
    x = cx(k) - w / 2
    y = cy[lvl] - h / 2
    sx = x
    if strip:
        sw = w * 0.5
        o.append(f'<rect x="{x-sw:.1f}" y="{y:.1f}" width="{sw:.1f}" height="{h:.1f}" fill="#F1F5F9" stroke="{GREY}" stroke-width="1.4"/>')
        sx = x - sw
    o.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="1.6"/>')
    o.append(text(cx(k) - (w * 0.25 if strip else 0), y + h + 14, f"{sz}²", 11.5, "middle", SLATE))
    o.append(text(cx(k) - (w * 0.25 if strip else 0), y + h + 28, fmt(ch), 12, "middle", NAVY, 700))
    geom[(k, lvl)] = (sx, x + w, y, y + h)
for k, (sz, ch) in enumerate(enc):
    block(k, k, sz, ch, F_BLUE, BLUE)
for k in range(5, 9):
    lvl = 8 - k
    sz, ch = dec[lvl]
    block(k, lvl, sz, ch, F_GREEN, GREEN, strip=True)
# arrows
for k in range(4):
    a, b = geom[(k, k)], geom[(k + 1, k + 1)]
    o.append(line(a[1] + 2, a[3] - 10 if k == 0 else (a[2] + a[3]) / 2, b[0] - 2, cy[k + 1] - 4 if False else (b[2] + b[3]) / 2 - 6, RED, 2, "ahr"))
for k in range(4, 8):
    a, b = geom[(k, 8 - k)], geom[(k + 1, 7 - k)]
    o.append(line(a[1] + 2, (a[2] + a[3]) / 2 + 6, b[0] - 2, (b[2] + b[3]) / 2 + 2 if False else (b[2] + b[3]) / 2 - 8 + 8, GREEN, 2, "ahgr"))
for lvl in range(4):
    a, b = geom[(lvl, lvl)], geom[(8 - lvl, lvl)]
    y = cy[lvl] - 10 if lvl == 0 else cy[lvl]
    # start at the encoder block right edge, end at the decoder strip left edge
    o.append(line(a[1] + 2, y, b[0] - 2, y, GREY, 2, "ahg", "6 4"))
o.append(text((geom[(0, 0)][1] + geom[(8, 0)][0]) / 2, cy[0] - 16, T["skip"], 12, "middle", SLATE, 600))
# final 1x1
a = geom[(8, 0)]
ox = cx(8) + 62
o.append(line(a[1] + 2, cy[0], ox - 8, cy[0], BLUE, 2, "ahb"))
o.append(f'<rect x="{ox-7}" y="{cy[0]-bh(388)/2:.1f}" width="14" height="{bh(388):.1f}" fill="{F_AMBER}" stroke="{AMBER}" stroke-width="1.6"/>')
o.append(text(ox, cy[0] + bh(388) / 2 + 14, T["out"], 12, "middle", NAVY, 600))
o.append(text((a[1] + ox) / 2, cy[0] - 8, "1×1", 12, "middle", BLUE, 600))
# input
b = geom[(0, 0)]
o.append(text(b[0] - 6, cy[0] - bh(568) / 2 - 8, "572²", 11.5, "start", SLATE))
o.append(text(b[0] - 6, cy[0] - bh(568) / 2 - 22, T["inp"], 12, "start", SLATE, 600))
# legend
lx, ly = 430, 392
o.append(text(lx, ly, T["conv3"], 12, "start", SLATE)); ly += 20
for col, mk, lab, d in ((RED, "ahr", T["pool"], None), (GREEN, "ahgr", T["up"], None), (GREY, "ahg", T["skip"], "6 4"), (BLUE, "ahb", T["conv1"], None)):
    o.append(line(lx, ly - 4, lx + 30, ly - 4, col, 2, mk, d)); o.append(text(lx + 40, ly, lab, 12, "start", NAVY)); ly += 18
o.append(text(W - 14, 22, T["sizes"] + "; " + T["chs"] + (" (bold)" if L == "en" else "（粗体）"), 12, "end", SLATE))
write(o, "fig-03-30", L)
