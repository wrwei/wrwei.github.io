# Figure 5.1: map of the module. Top: three generators. Bottom: GNN, PINN, contrastive, MoE.
#   python fig-05-1.py en|zh
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
L = lang()
x, z, xh, mu, sg, eps = B("x"), B("z"), B("x̂"), B("μ"), B("σ"), B("ε")
x0_, xT = B("x") + SUB("0"), B("x") + SUB(I("T"))
NI = "𝒩(" + B("0") + ", " + B("I") + ")"
T = {"en": dict(
        t=["Variational autoencoder", "GAN", "Diffusion model", "Graph neural network", "PINN",
           "Contrastive learning", "Mixture of experts"],
        obj=["maximise ELBO", "minimax: min" + SUB("G") + " max" + SUB("D") + " " + I("V") + "(" + I("G") + ", " + I("D") + ")",
             "squared error on the added noise", "supervised loss on labels",
             "residual + data + boundary", "InfoNCE over " + I("N") + " candidates",
             "any loss; " + I("k") + " of " + I("E") + " experts"],
        enc="encoder", dec="decoder", fake="fake " + x, real="real " + x, add="add noise",
        den="learned denoiser " + eps + SUB("θ") + ",", den2="tens to hundreds of steps",
        mp="message passing", res="residual loss", views="two views", encs="encoder",
        pull="two views pulled together", push="others pushed apart", router="router", topk="top-" + I("k") + ": 2 of 8 experts",
        exp="experts", real_q="real?"),
     "zh": dict(
        t=["变分自编码器", "生成对抗网络", "扩散模型", "图神经网络", "PINN", "对比学习", "混合专家"],
        obj=["最大化 ELBO", "极小极大：min" + SUB("G") + " max" + SUB("D") + " " + I("V") + "(" + I("G") + ", " + I("D") + ")",
             "预测噪声的平方误差", "节点或图标签上的监督损失", "残差 + 数据 + 边界项", "InfoNCE：在 " + I("N") + " 个中挑出正例",
             "任意损失；每个输入用 " + I("E") + " 个专家中的 " + I("k") + " 个"],
        enc="编码器", dec="解码器", fake="假 " + x, real="真 " + x, add="加噪声",
        den="学到的去噪器 " + eps + SUB("θ") + "，", den2="几十到几百步",
        mp="消息传递", res="残差损失", views="两个视图", encs="编码器",
        pull="拉近", push="其余推开", router="路由器", topk="top-" + I("k") + "：8 个专家选 2 个",
        exp="专家", real_q="真？")}[L]

W, H = 760, 462
o = open_svg(W, H, L)
COL = [BLUE, ORANGE, PURPLE, GREEN, AMBER, SKY, BLUE]

def panel(x0, y0, w, h, k):
    o.append(rect(x0, y0, w, h, "#FFFFFF", BORDER, 1.5, 8))
    o.append(text(x0 + 12, y0 + 22, T["t"][k], 13, "start", COL[k], "700"))
    o.append(line(x0 + 10, y0 + h - 28, x0 + w - 10, y0 + h - 28, BORDER, 1))
    o.append(text(x0 + w / 2, y0 + h - 10, T["obj"][k], 12 if k < 3 else 11.5, "middle", NAVY, "600"))

def node(cx, cy, w, h, lab, fill="#FFFFFF", stroke=NAVY, size=13, sw=1.4, color=NAVY, weight=None):
    o.append(rect(cx - w / 2, cy - h / 2, w, h, fill, stroke, sw, 6))
    o.append(text(cx, cy + size * 0.36, lab, size, "middle", color, weight))

def ar(x1, y1, x2, y2, c=SLATE, m="ah", dash=None, sw=1.5):
    o.append(line(x1, y1, x2, y2, c, sw, marker=m, dash=dash))

# ---------------- top row ----------------
tw, th, ty = 240, 206, 6
tx = [8, 260, 512]
for k in range(3):
    panel(tx[k], ty, tw, th, k)

# VAE: x -> encoder -> (mu, sigma) ; down to z -> decoder -> x-hat (snake)
X = tx[0]; ya, yb = ty + 68, ty + 132
node(X + 24, ya, 30, 28, x, F_SKY, SKY)
node(X + 94, ya, 76, 30, T["enc"], F_BLUE, BLUE, 12)
node(X + 190, ya, 62, 30, "(" + mu + ", " + sg + ")", "#FFFFFF", BLUE, 13)
node(X + 190, yb, 30, 28, z, F_GREEN, GREEN)
node(X + 94, yb, 76, 30, T["dec"], F_ORANGE, ORANGE, 12)
node(X + 24, yb, 30, 28, xh, F_SKY, SKY)
ar(X + 39, ya, X + 55, ya); ar(X + 132, ya, X + 158, ya)
ar(X + 190, ya + 15, X + 190, yb - 15)
ar(X + 175, yb, X + 133, yb); ar(X + 56, yb, X + 40, yb)

# GAN: z -> G -> fake x -> D <- real x
X = tx[1]; ya, yb, ym = ty + 62, ty + 142, ty + 102
node(X + 22, ya, 28, 28, z, "#FFFFFF", SLATE)
node(X + 70, ya, 38, 30, I("G"), F_ORANGE, ORANGE, 15, color=ORANGE, weight="700")
node(X + 140, ya, 66, 30, T["fake"], F_ORANGE, ORANGE, 12)
node(X + 140, yb, 66, 30, T["real"], F_GREEN, GREEN, 12)
node(X + 208, ym, 36, 30, I("D"), F_PURPLE, PURPLE, 15, color=PURPLE, weight="700")
ar(X + 36, ya, X + 50, ya); ar(X + 89, ya, X + 106, ya)
ar(X + 174, ya + 8, X + 196, ym - 16); ar(X + 174, yb - 8, X + 196, ym + 16)
o.append(text(X + 208, ym + 32, T["real_q"], 11, "middle", PURPLE))

# Diffusion: x0 -> x1 -> ... -> xT ~ N(0, I), dashed back arrows (denoiser)
X = tx[2]; yd = ty + 78
xs = [X + 30, X + 88, X + 140, X + 192]
labs = [x0_, B("x") + SUB("1"), "⋯", xT]
fills = [F_BLUE, "#EEF2F7", None, "#E2E8F0"]
for i, (cx, lab, f) in enumerate(zip(xs, labs, fills)):
    if f is None:
        o.append(text(cx, yd + 5, lab, 16, "middle", SLATE))
    else:
        node(cx, yd, 36, 30, lab, f, NAVY if i == 0 else SLATE, 13)
for a, b in zip(xs[:-1], xs[1:]):
    ar(a + (18 if a != xs[2] else 12), yd, b - (18 if b != xs[2] else 12), yd)
o.append(text((xs[0] + xs[1]) / 2, yd - 24, T["add"], 11, "middle", SLATE))
o.append(text(xs[3], yd + 32, "~ " + NI, 12, "middle", NAVY))
yr = yd + 54
o.append(f'<path d="M{xs[3]},{yd + 40} L{xs[3]},{yr} L{xs[0]},{yr} L{xs[0]},{yd + 17}" fill="none" stroke="{RED}" '
         f'stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#ahr)"/>')
for cx in xs[1:3]:
    ar(cx, yr, cx, yd + 17 if cx != xs[2] else yd + 10, RED, "ahr", "5 4")
o.append(text((xs[0] + xs[3]) / 2, yr + 18, T["den"], 12, "middle", RED, "600"))
o.append(text((xs[0] + xs[3]) / 2, yr + 34, T["den2"], 12, "middle", RED))

# ---------------- bottom row ----------------
bw, bh, by = 177, 236, 222
bx = [8, 197, 386, 575]
for k in range(4):
    panel(bx[k], by, bw, bh, 3 + k)

# GNN: arrows converging on one node
X = bx[0]; cx, cy = X + 88, by + 104
nb = [(cx + 52 * math.cos(a), cy + 46 * math.sin(a)) for a in (math.radians(d) for d in (200, 265, 330, 30, 130))]
for (p, q) in [(0, 1), (2, 3), (3, 4), (1, 2)]:
    o.append(line(nb[p][0], nb[p][1], nb[q][0], nb[q][1], MUTED, 1.3))
for (px, py) in nb:
    d = math.hypot(cx - px, cy - py)
    ux, uy = (cx - px) / d, (cy - py) / d
    ar(px + ux * 10, py + uy * 10, cx - ux * 15, cy - uy * 15, GREEN, "ah", sw=1.6)
for (px, py) in nb:
    o.append(circle(px, py, 8, "#FFFFFF", NAVY, 1.4))
o.append(circle(cx, cy, 12, F_GREEN, GREEN, 2))
o.append(text(cx, by + 182, T["mp"], 12, "middle", SLATE))

# PINN: u_theta(x, t) -> N[u] = 0, residual loss
X = bx[1]; cx = X + 88
node(cx, by + 70, 120, 34, I("u") + SUB("θ") + "(" + x + ", " + I("t") + ")", F_AMBER, AMBER, 14)
o.append(text(cx, by + 44, "", 11))
ar(cx, by + 88, cx, by + 122)
o.append(text(cx + 8, by + 109, "", 11))
node(cx, by + 142, 110, 34, "𝒩[" + I("u") + "] = 0", "#FFFFFF", NAVY, 14)
o.append(text(cx, by + 182, T["res"] + ": ‖𝒩[" + I("u") + SUB("θ") + "]‖²", 12, "middle", SLATE))

# Contrastive: input -> two views -> encoder -> circle, positives pulled, others pushed
X = bx[2]; cy = by + 104
o.append(rect(X + 12, cy - 13, 26, 26, F_SKY, SKY, 1.4, 4))
vy = [cy - 34, cy + 34]
for i, v in enumerate(vy):
    o.append(rect(X + 52, v - 11, 22, 22, F_SKY if i == 0 else F_BLUE, SKY, 1.4, 4))
    ar(X + 38, cy + (-6 if i == 0 else 6), X + 52, v + (6 if i == 0 else -6))
    ar(X + 75, v, X + 87, v)
o.append(rect(X + 88, cy - 48, 18, 96, F_BLUE, BLUE, 1.4, 5))
o.append(text(X + 97, cy + 4, "", 11))
o.append(f'<text x="{X + 101}" y="{cy}" font-size="11" text-anchor="middle" fill="{BLUE}" transform="rotate(-90 {X + 101} {cy})">{T["encs"]}</text>')
ccx, ccy, r = X + 140, cy, 27
o.append(circle(ccx, ccy, r, "none", MUTED, 1.2))
ang_pos = [math.radians(-30), math.radians(-5)]
for i, a in enumerate(ang_pos):
    ar(X + 107, vy[i], ccx + r * math.cos(a) - 6, ccy + r * math.sin(a) + (-4 if i == 0 else 3), BLUE, "ahb", sw=1.2)
for a in ang_pos:
    o.append(circle(ccx + r * math.cos(a), ccy + r * math.sin(a), 4.5, GREEN, GREEN, 1))
for d in (110, 170, 230):
    a = math.radians(d)
    px, py = ccx + r * math.cos(a), ccy + r * math.sin(a)
    o.append(circle(px, py, 4, "#FFFFFF", MUTED, 1.4))
    ar(px + 6 * math.cos(a), py + 6 * math.sin(a), px + 15 * math.cos(a), py + 15 * math.sin(a), RED, "ahr", sw=1.2)
o.append(text(X + bw / 2, by + 170, T["pull"], 11, "middle", SLATE))
o.append(text(X + bw / 2, by + 185, T["push"], 11, "middle", SLATE))

# MoE: input -> router -> 8 experts, 2 highlighted (top-k)
X = bx[3]; cy = by + 106
o.append(circle(X + 17, cy, 8, F_SKY, SKY, 1.4))
node(X + 62, cy, 44, 28, T["router"], "#FFFFFF", NAVY, 11)
ar(X + 25, cy, X + 39, cy)
ey = [cy - 52.5 + i * 15 for i in range(8)]
hi = (1, 5)
for i, e in enumerate(ey):
    on = i in hi
    o.append(rect(X + 104, e - 6, 34, 12, F_BLUE if on else "#FFFFFF", BLUE if on else MUTED, 1.6 if on else 1.1, 3))
    if on:
        ar(X + 84, cy + (-4 if i < 4 else 4), X + 103, e, BLUE, "ahb", sw=1.5)
        ar(X + 139, e, X + 157, cy + (-6 if i < 4 else 6), BLUE, "ahb", sw=1.5)
o.append(circle(X + 164, cy, 8, "#FFFFFF", NAVY, 1.4))
o.append(text(X + 164, cy + 4, "Σ", 11, "middle", NAVY))
o.append(text(X + bw / 2, by + 182, T["topk"], 12, "middle", SLATE))
write(o, "fig-05-1", L)
