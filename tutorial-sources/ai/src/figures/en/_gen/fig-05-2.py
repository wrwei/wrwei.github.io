# Figure 5.2: autoencoder 64 -> 128 -> 2 -> 128 -> 64 on an 8x8 digit.  python fig-05-2.py en|zh
# The two digits are real: a held-out 8x8 digit and its reconstruction by a small autoencoder
# with exactly this architecture, trained here on the other sklearn digits.
import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import *
import numpy as np
import torch
from sklearn.datasets import load_digits

L = lang()
T = {"en": dict(inp="input " + B("x"), inp2="8 × 8 = 64 pixels", out="reconstruction " + B("x̂"), out2="64 pixels",
                enc="encoder " + I("f") + SUB("φ"), dec="decoder " + I("g") + SUB("θ"), code="code " + B("z"),
                loss="loss  ‖" + B("x") + " − " + B("x̂") + "‖²"),
     "zh": dict(inp="输入 " + B("x"), inp2="8 × 8 = 64 像素", out="重建 " + B("x̂"), out2="64 像素",
                enc="编码器 " + I("f") + SUB("φ"), dec="解码器 " + I("g") + SUB("θ"), code="编码 " + B("z"),
                loss="损失  ‖" + B("x") + " − " + B("x̂") + "‖²")}[L]

# ---- train the autoencoder (deterministic) ----
torch.manual_seed(0)
X = load_digits().data.astype(np.float32) / 16.0
idx_show = 13                                   # a held-out "3"
mask = np.ones(len(X), bool); mask[idx_show] = False
Xt = torch.tensor(X[mask])
net = torch.nn.Sequential(torch.nn.Linear(64, 128), torch.nn.ReLU(), torch.nn.Linear(128, 2),
                          torch.nn.Linear(2, 128), torch.nn.ReLU(), torch.nn.Linear(128, 64), torch.nn.Sigmoid())
opt = torch.optim.Adam(net.parameters(), 3e-3)
torch.set_num_threads(1)
for step in range(3000):                        # full batch: the other 1,796 digits
    loss = ((net(Xt) - Xt) ** 2).sum(1).mean()
    opt.zero_grad(); loss.backward(); opt.step()
with torch.no_grad():
    x = torch.tensor(X[idx_show:idx_show + 1]); xh = net(x)
    print("digit", load_digits().target[idx_show], "train loss", float(loss), "loss on shown digit", float(((xh - x) ** 2).sum()))
x, xh = X[idx_show], xh.numpy()[0]

W, H = 720, 318
o = open_svg(W, H, L)
cy = 128
cell = 11

def digit(x0, y0, v):
    for r in range(8):
        for c in range(8):
            t = min(1.0, max(0.0, float(v[r * 8 + c])))      # 0 -> white, 1 -> navy
            shade = "#%02X%02X%02X" % tuple(round(255 + t * (n - 255)) for n in (0x1A, 0x2E, 0x4A))
            o.append(f'<rect x="{x0 + c * cell}" y="{y0 + r * cell}" width="{cell}" height="{cell}" fill="{shade}" stroke="{BORDER}" stroke-width="0.6"/>')
    o.append(rect(x0, y0, 8 * cell, 8 * cell, "none", MUTED, 1.2, 2))

dx_in, dx_out = 22, W - 22 - 8 * cell
digit(dx_in, cy - 4 * cell, x)
digit(dx_out, cy - 4 * cell, xh)
o.append(text(dx_in + 4 * cell, cy + 4 * cell + 20, T["inp"], 13, "middle", NAVY))
o.append(text(dx_in + 4 * cell, cy + 4 * cell + 36, T["inp2"], 12, "middle", SLATE))
o.append(text(dx_out + 4 * cell, cy + 4 * cell + 20, T["out"], 13, "middle", NAVY))
o.append(text(dx_out + 4 * cell, cy + 4 * cell + 36, T["out2"], 12, "middle", SLATE))

# layers: (x, shown neurons, size label, colour)
layers = [(170, 8, "64"), (255, 11, "128"), (360, 2, I("d") + SUB("z") + " = 2"), (465, 11, "128"), (550, 8, "64")]
sp = 14
pos = []
for lx, n, lab in layers:
    ys = [cy + (i - (n - 1) / 2) * (sp if n > 2 else 30) for i in range(n)]
    pos.append([(lx, y) for y in ys])
# encoder / decoder backdrops
o.append(f'<path d="M150,{cy-82} L380,{cy-30} L380,{cy+30} L150,{cy+82} Z" fill="{F_BLUE}" stroke="none" opacity="0.55"/>')
o.append(f'<path d="M340,{cy-30} L570,{cy-82} L570,{cy+82} L340,{cy+30} Z" fill="{F_ORANGE}" stroke="none" opacity="0.8"/>')
for a, b in zip(pos[:-1], pos[1:]):
    for (x1, y1) in a:
        for (x2, y2) in b:
            o.append(line(x1, y1, x2, y2, MUTED, 0.5, extra=' opacity="0.7"'))
for k, ((lx, n, lab), ps) in enumerate(zip(layers, pos)):
    for (px, py) in ps:
        if k == 2:
            o.append(circle(px, py, 10, F_GREEN, GREEN, 2))
        else:
            o.append(circle(px, py, 5, "#FFFFFF", BLUE if k < 2 else ORANGE, 1.4))
    o.append(text(lx, cy - 92, lab, 13, "middle", NAVY, "600"))
o.append(text(360, cy + 58, T["code"], 13, "middle", GREEN, "700"))
o.append(text(258, cy + 112, T["enc"], 13, "middle", BLUE, "600"))
o.append(text(462, cy + 112, T["dec"], 13, "middle", ORANGE, "600"))
# flatten arrows
o.append(line(dx_in + 8 * cell + 4, cy, 160, cy, SLATE, 1.6, marker="ah"))
o.append(line(560, cy, dx_out - 4, cy, SLATE, 1.6, marker="ah"))
# loss: compare input and output
ly = 290
o.append(rect(W / 2 - 80, ly - 18, 160, 30, F_RED, RED, 1.5, 8))
o.append(text(W / 2, ly + 2, T["loss"], 14, "middle", NAVY))
o.append(f'<path d="M{dx_in + 4*cell},{cy + 4*cell + 44} L{dx_in + 4*cell},{ly - 3} L{W/2 - 82},{ly - 3}" fill="none" stroke="{RED}" stroke-width="1.6" marker-end="url(#ahr)"/>')
o.append(f'<path d="M{dx_out + 4*cell},{cy + 4*cell + 44} L{dx_out + 4*cell},{ly - 3} L{W/2 + 82},{ly - 3}" fill="none" stroke="{RED}" stroke-width="1.6" marker-end="url(#ahr)"/>')
write(o, "fig-05-2", L)
