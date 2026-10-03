# Figure 4.15: teacher forcing (training) against free-running decoding (inference). Usage: fig-04-15.py en|zh
from _common import *
l = lang()
T = {
 "en": dict(train="Training: teacher forcing", inf="Inference: free-running", enc="encoder", dec="decoder", state="state",
            tgt="target", loss="compare", inp="decoder input", true="true previous tokens", own="the model's own previous outputs",
            wrong="wrong token", comp="errors compound", out="output"),
 "zh": dict(train="训练：教师强制", inf="推理：自由运行", enc="编码器", dec="解码器", state="状态",
            tgt="目标", loss="比较", inp="解码器输入", true="真实的前一个 token", own="模型自己的前一个输出",
            wrong="错误 token", comp="错误累积", out="输出"),
}[l]
W, H = 720, 516
p = open_svg(W, H, l)
SRC = ["3", "9", "1", "4"]
TGT = ["4", "1", "9", "3"]
def tok(x, y, s, fill, stroke, w=44, h=28, sw=1.5, tc=NAVY, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    p.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')
    p.append(text(x+w/2, y+h/2+5, s, 14, "middle", tc, "700"))
def cell(x, y, w=44, h=34):
    p.append(rect(x, y, w, h, F_SKY, SKY, 1.5, 8))
ENX = [32 + i*54 for i in range(4)]
DEX = [336 + i*92 for i in range(4)]
def panel(y0, inputs, outputs, mode):
    inc = (F_GREEN, GREEN) if mode == "train" else (F_ORANGE, ORANGE)
    p.append(text(8, y0+14, T["train"] if mode == "train" else T["inf"], 14, "start", NAVY, "700"))
    cy = y0 + 118
    # encoder
    p.append(text(ENX[0]+98, cy+106, T["enc"], 13, "middle", SLATE))
    for i, x in enumerate(ENX):
        cell(x, cy)
        if i: p.append(line(ENX[i-1]+44, cy+17, x, cy+17, SLATE, 1.5, "ah"))
        tok(x, cy+60, SRC[i], "#FFFFFF", NAVY)
        p.append(line(x+22, cy+60, x+22, cy+34, SLATE, 1.5, "ah"))
    # state arrow
    p.append(line(ENX[3]+44, cy+17, DEX[0], cy+17, BLUE, 2, "ahb"))
    p.append(text((ENX[3]+44+DEX[0])/2, cy+7, T["state"], 12, "middle", BLUE))
    # decoder
    p.append(text(DEX[0]+138, cy+106, T["dec"], 13, "middle", SLATE))
    for i, x in enumerate(DEX):
        cell(x, cy)
        if i: p.append(line(DEX[i-1]+44, cy+17, x, cy+17, SLATE, 1.5, "ah"))
        # input
        wrong_in = False
        tok(x, cy+60, inputs[i], inc[0], inc[1], tc=NAVY if inputs[i] != "BOS" else SLATE)
        p.append(line(x+22, cy+60, x+22, cy+34, SLATE, 1.5, "ah"))
        # output
        o = outputs[i]
        if mode == "train":
            tok(x, cy-52, o, "#FFFFFF", NAVY)
        else:
            if o[1] == "wrong": tok(x, cy-52, o[0], F_RED, RED, sw=2.5, tc=RED)
            elif o[1] == "after": tok(x, cy-52, o[0], "#FEE2E2", "#FCA5A5", tc="#7F1D1D", dash="4 3")
            else: tok(x, cy-52, o[0], "#FFFFFF", NAVY)
        p.append(line(x+22, cy, x+22, cy-24, SLATE, 1.5, "ah"))
    p.append(text(DEX[0]-8, cy+79, T["inp"], 12, "end", SLATE))
    p.append(text(DEX[0]-8, cy-33, T["out"], 12, "end", SLATE))
    return cy
cy = panel(10, ["BOS", "4", "1", "9"], ["4", "1", "9", "3"], "train")
# targets and compare marks
for i, x in enumerate(DEX):
    tok(x, cy-102, TGT[i], F_GREEN, GREEN, tc=GREEN)
    p.append(line(x+22, cy-74, x+22, cy-84, MUTED, 1.4, dash="3 2"))
    p.append(text(x+30, cy-86, "=", 13, "start", SLATE)) if False else None
p.append(text(DEX[0]-8, cy-83, T["tgt"], 12, "end", GREEN))
p.append(text(DEX[0]-8, cy-67, "(" + T["loss"] + ")", 12, "end", SLATE))
p.append(text(DEX[0]+138, cy+124, T["true"], 12, "middle", GREEN))
cy2 = panel(262, ["BOS", "4", "7", "2"], [("4", "ok"), ("7", "wrong"), ("2", "after"), ("3", "after")], "inf")
p.append(text(DEX[0]+138, cy2+124, T["own"], 12, "middle", ORANGE))
# wrong token callout and compounding bracket
wx = DEX[1]
p.append(text(wx+22, cy2-70, T["wrong"], 13, "middle", RED, "700"))
p.append(line(wx+22, cy2-64, wx+22, cy2-56, RED, 1.6, "ahr"))
bx0, bx1 = DEX[2], DEX[3]+44
p.append(f'<path d="M {bx0} {cy2-62} L {bx0} {cy2-68} L {bx1} {cy2-68} L {bx1} {cy2-62}" fill="none" stroke="#B91C1C" stroke-width="1.5"/>')
p.append(text((bx0+bx1)/2, cy2-74, T["comp"], 13, "middle", "#B91C1C", "700"))
write(p, "fig-04-15", l)
