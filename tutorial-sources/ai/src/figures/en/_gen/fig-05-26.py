# Figure 5.26: SimCLR pipeline on a vibration window. The waveforms are computed: a window with a
# fundamental and one harmonic, and two views with a random time shift, gain and added noise.
#   python fig-05-26.py en|zh
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from _common import *
l = lang()
T = {"en": dict(win="one vibration", win2="window", aug1="random augmentations:", aug2="time shift, gain, noise",
                v1="view 1", v2="view 2", f="encoder", fs="shared", g="head", probe="linear probe",
                probe2="a few labels", circ="unit circle", pull="positive pair: pulled together",
                push="other batch members: pushed apart"),
     "zh": dict(win="振动信号的", win2="一个窗口", aug1="随机增强：", aug2="时移、增益、噪声",
                v1="视图 1", v2="视图 2", f="编码器", fs="共享", g="投影头", probe="线性探测",
                probe2="少量标签", circ="单位圆", pull="正样本对：拉近",
                push="batch 中的其他样本：推远")}[l]
P = open_svg(740, 360, l, extra_defs=
    '<marker id="ahgr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">'
    '<path d="M0,0 L10,5 L0,10 z" fill="#15803D"/></marker>')
rng = np.random.default_rng(5)
n = 160; tt = np.arange(n) / n
def wave(shift, gain, noise):
    s = gain * (np.sin(2 * np.pi * 4 * (tt + shift)) + 0.45 * np.sin(2 * np.pi * 12 * (tt + shift) + 0.7))
    return s + noise * rng.standard_normal(n)
def spark(x0, y0, w, h, sig, color):
    ys = y0 + h / 2 - sig / 3.2 * h / 2
    pts = " ".join(f"{x0 + i * w / (n - 1):.1f},{y:.1f}" for i, y in enumerate(ys))
    return f'<polyline points="{pts}" fill="none" stroke="{color}" stroke-width="1.3" stroke-linejoin="round"/>'
UY, LY, MY = 74, 250, 162
# the window
P.append(rect(12, MY - 30, 100, 60, "#FFFFFF", NAVY, 1.6, 8))
P.append(spark(18, MY - 26, 88, 52, wave(0, 1.0, 0.05), NAVY))
P.append(text(62, MY + 46, T["win"], 12, "middle", SLATE)); P.append(text(62, MY + 61, T["win2"], 12, "middle", SLATE))
# views
for y, lab, sh, gn, nz in ((UY, T["v1"], 0.11, 1.5, 0.25), (LY, T["v2"], -0.07, 0.65, 0.35)):
    P.append(rect(160, y - 26, 104, 52, "#FFFFFF", BLUE, 1.6, 8))
    P.append(spark(166, y - 22, 92, 44, wave(sh, gn, nz), BLUE))
    P.append(text(212, y + (-34 if y == UY else 44), lab, 12, "middle", BLUE, "600"))
    P.append(line(112, MY + (-10 if y == UY else 10), 158, y + (14 if y == UY else -14), SLATE, 1.6, "ah"))
P.append(text(212, MY - 4, T["aug1"], 12, "middle", SLATE))
P.append(text(212, MY + 12, T["aug2"], 12, "middle", NAVY, "600"))
# shared encoder f and head g as tall boxes both paths pass through
def tall(x, w, name, sym, fill, stroke):
    P.append(rect(x, UY - 30, w, LY - UY + 60, fill, stroke, 1.6, 8))
    P.append(text(x + w / 2, MY - 12, name, 12, "middle", SLATE))
    P.append(text(x + w / 2, MY + 8, I(sym), 17, "middle", NAVY, "700"))
    P.append(text(x + w / 2, MY + 26, T["fs"], 11, "middle", SLATE))
tall(296, 66, T["f"], "f", F_SKY, SKY)
tall(424, 52, T["g"], "g", F_PURPLE, PURPLE)
for y in (UY, LY):
    P.append(line(264, y, 294, y, SLATE, 1.6, "ah"))
    P.append(line(362, y, 422, y, SLATE, 1.6, "ah"))
    P.append(text(392, y - 8, B("h"), 15, "middle", NAVY))
# linear probe from h (lower path)
P.append(line(388, LY + 4, 388, 312, BLUE, 1.6, "ahb"))
P.append(rect(326, 314, 124, 40, F_BLUE, BLUE, 1.6, 8))
P.append(text(388, 332, T["probe"], 13, "middle", NAVY, "700"))
P.append(text(388, 347, T["probe2"], 11, "middle", SLATE))
# unit circle
CX, CY, R = 630, MY, 80
P.append(circle(CX, CY, R, "none", MUTED, 1.4))
P.append(circle(CX, CY, 2, NAVY, NAVY, 1))
def pt(a): return CX + R * math.cos(math.radians(a)), CY - R * math.sin(math.radians(a))
z1, z2 = pt(160), pt(200)
P.append(line(476, UY, z1[0] - 6, z1[1] - 2, SLATE, 1.6, "ah"))
P.append(line(476, LY, z2[0] - 6, z2[1] + 2, SLATE, 1.6, "ah"))
P.append(text(518, 94, B("z"), 15, "middle", NAVY)); P.append(text(518, 242, B("z"), 15, "middle", NAVY))
for (x, y) in (z1, z2):
    P.append(circle(x, y, 6, GREEN, "#FFFFFF", 1.5))
mx, my = (z1[0] + z2[0]) / 2, (z1[1] + z2[1]) / 2
for (x, y) in (z1, z2):
    dx, dy = mx - x, my - y; d = math.hypot(dx, dy)
    P.append(line(x + 16, y + dy / d * 4, x + 16, y + dy / d * 18, GREEN, 1.8, "ahgr"))
for a in (20, 70, 115, 250, 300, 335):
    x, y = pt(a)
    P.append(circle(x, y, 5, "#FFFFFF", RED, 1.6))
    s = 1 if (a % 360) < 180 else -1          # tangent direction away from the pair at 180 degrees
    tx, ty = -math.sin(math.radians(a)), -math.cos(math.radians(a))
    tx, ty = -s * tx, -s * ty
    P.append(line(x + tx * 8, y + ty * 8, x + tx * 24, y + ty * 24, RED, 1.5, "ahr"))
P.append(text(CX, CY + R + 22, T["circ"], 12, "middle", SLATE))
P.append(circle(494, 306, 5, GREEN, "#FFFFFF", 1.5)); P.append(text(506, 310, T["pull"], 12, "start", GREEN))
P.append(circle(494, 330, 5, "#FFFFFF", RED, 1.6)); P.append(text(506, 334, T["push"], 12, "start", RED))
write(P, "fig-05-26", l)
