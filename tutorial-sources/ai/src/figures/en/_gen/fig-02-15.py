# Batch norm vs layer norm / RMSNorm: which axis of the B x d activation matrix the statistics run over.
import sys; sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from _common import *
l = lang()
Tx = {"en": dict(ex="examples", ft="features", bn="batch norm", ln="layer norm / RMSNorm",
                 bn1="over the ", bn2=" examples of feature ", bn3="running averages at evaluation",
                 ln1="statistics over the ", ln2=" features of one example", ln3="the same at training and evaluation",
                 nomean="RMSNorm: no mean subtraction", Bn="B", dn="d"),
      "zh": dict(ex="样本", ft="特征", bn="批归一化", ln="层归一化 / RMSNorm",
                 bn1="在 ", bn2=" 个样本上对特征 ", bn3="评估时使用滑动平均",
                 ln1="在 ", ln2=" 个特征上对单个样本", ln3="训练与评估时完全相同",
                 nomean="RMSNorm：不减均值", Bn="B", dn="d")}[l]
W, H = 720, 330
o = open_svg(W, H, l)
R, C, S = 6, 8, 30
def grid(x0, y0, hl_col=None, hl_row=None, color=BLUE, fill=F_BLUE):
    for r in range(R):
        for c in range(C):
            on = (hl_col is not None and c == hl_col) or (hl_row is not None and r == hl_row)
            o.append(rect(x0 + c * S, y0 + r * S, S, S, fill=fill if on else "#FFFFFF", stroke=color if on else MUTED, sw=1.6 if on else 1, rx=2))
    if hl_col is not None:
        o.append(f'<rect x="{x0 + hl_col * S}" y="{y0}" width="{S}" height="{R * S}" fill="none" stroke="{color}" stroke-width="2.5" rx="3"/>')
    if hl_row is not None:
        o.append(f'<rect x="{x0}" y="{y0 + hl_row * S}" width="{C * S}" height="{S}" fill="none" stroke="{color}" stroke-width="2.5" rx="3"/>')
    # axis labels
    o.append(text(x0 + C * S / 2, y0 - 10, f'{Tx["ft"]}  ({I(Tx["dn"])} {"columns" if l == "en" else "列"})' if False else f'{Tx["ft"]}  (' + I(Tx["dn"]) + ')', 13, "middle", SLATE))
    o.append(text(x0 - 12, y0 + R * S / 2, f'{Tx["ex"]}  (' + I(Tx["Bn"]) + ')', 13, "middle", SLATE, extra=f' transform="rotate(-90 {x0 - 12} {y0 + R * S / 2})"'))
    o.append(f'<text x="{x0 + C*S/2}" y="{y0 - 10}" font-size="1" fill="none"></text>')
gy = 52
gx1, gx2 = 48, 428
grid(gx1, gy, hl_col=3, color=BLUE, fill=F_BLUE)
grid(gx2, gy, hl_row=2, color=ORANGE, fill=F_ORANGE)
# panel titles
o.append(text(gx1 + C * S / 2, 18, Tx["bn"], 14, "middle", BLUE, "700"))
o.append(text(gx2 + C * S / 2, 18, Tx["ln"], 14, "middle", ORANGE, "700"))
# captions
cy = gy + R * S + 28
mu, sg = "μ" + "ⱼ", "σ" + "ⱼ"
o.append(text(gx1 + C * S / 2, cy, f'{mu}, {sg} ' + Tx["bn1"] + I(Tx["Bn"]) + Tx["bn2"] + I("j"), 13, "middle"))
o.append(text(gx1 + C * S / 2, cy + 20, Tx["bn3"], 13, "middle", SLATE))
o.append(text(gx2 + C * S / 2, cy, Tx["ln1"] + I(Tx["dn"]) + Tx["ln2"], 13, "middle"))
o.append(text(gx2 + C * S / 2, cy + 20, Tx["ln3"], 13, "middle", SLATE))
o.append(text(gx2 + C * S / 2, cy + 46, Tx["nomean"], 13, "middle", ORANGE, "700"))
write(o, "fig-02-15", l)
