"""Hand-laid-out SVG mechanisms for Module 06. Usage: python ... en|zh."""
import html
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
assert LANG in ("en", "zh")
NAVY, BLUE, ORANGE, GREEN = "#1A2E4A", "#2563EB", "#C2410C", "#15803D"
SLATE, BORDER = "#475569", "#E2E8F0"


def t(en, zh):
    return zh if LANG == "zh" else en


class SVG:
    def __init__(self, height):
        self.height = height
        self.parts = [f'<svg xmlns="http://www.w3.org/2000/svg" '
                      f'viewBox="0 0 720 {height}" width="720" height="{height}" '
                      'font-family="DM Sans, system-ui, Segoe UI, sans-serif" '
                      f'fill="{NAVY}">',
                      '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" '
                      'refY="5" markerWidth="6" markerHeight="6" orient="auto">'
                      f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{SLATE}"/>'
                      '</marker></defs>']

    def text(self, x, y, text, size=14, colour=NAVY, anchor="middle"):
        self.parts.append(f'<text x="{x}" y="{y}" font-size="{size}" '
                          f'fill="{colour}" text-anchor="{anchor}">'
                          f'{html.escape(text)}</text>')

    def rect(self, x, y, w, height, fill="none", stroke=BORDER, rx=0):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{height}" '
                          f'rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')

    def box(self, x, y, w, height, lines, fill="#F0F9FF", stroke=BLUE):
        self.rect(x, y, w, height, fill, stroke, 8)
        for i, line in enumerate(lines):
            self.text(x + w / 2, y + height / 2 - 8 * (len(lines) - 1) + 5 + 16 * i,
                      line, 13)

    def path(self, points, colour=SLATE, arrow=True, width=1.8):
        d = "M " + " L ".join(f"{x} {y}" for x, y in points)
        marker = ' marker-end="url(#arrow)"' if arrow else ""
        self.parts.append(f'<path d="{d}" fill="none" stroke="{colour}" '
                          f'stroke-width="{width}"{marker}/>')

    def plus(self, x, y):
        self.parts.append(f'<circle cx="{x}" cy="{y}" r="11" fill="white" '
                          f'stroke="{NAVY}" stroke-width="1.5"/>')
        self.text(x, y + 5, "+", 17)

    def mask(self, x, y, rows, cols, allowed, cell=15):
        for r in range(rows):
            for c in range(cols):
                self.rect(x + c * cell, y + r * cell, cell, cell,
                          "#DBEAFE" if allowed(r, c) else "#F1F5F9", "white")

    def save(self, number):
        self.parts.append("</svg>")
        folder = ROOT / "src/figures" / LANG
        folder.mkdir(exist_ok=True)
        (folder / f"fig-06-{number}.svg").write_text("\n".join(self.parts), encoding="utf-8")


# 2: hard retrieval versus a probability-weighted blend.
s = SVG(330)
s.text(25, 25, t("Hard lookup", "硬查找"), anchor="start")
s.box(20, 52, 140, 45, [t("Query: tank", "查询：tank")])
for i, word in enumerate(("pump", "valve", "tank")):
    x = 230 + i * 155
    s.box(x, 52, 130, 45, [word], fill="#F0FDF4" if i == 2 else "white",
          stroke=GREEN if i == 2 else BORDER)
s.path([(160, 75), (200, 75), (200, 110), (605, 110), (605, 97)], GREEN)
s.text(605, 137, t("One selected value", "选中一个值"), 12, GREEN)
s.text(25, 175, t("Soft lookup: q = (1, 1), scale 1/√2", "软查找：q = (1, 1)，缩放 1/√2"), anchor="start")
for i, (key, weight, value) in enumerate((
        ("(1, 0)", .248255, "(1, 0)"), ("(0, 1)", .248255, "(0, 2)"),
        ("(1, 1)", .50349, "(3, 3)"))):
    x = 25 + i * 145
    s.text(x + 55, 205, "k = " + key, 13)
    s.rect(x, 215, 110, 18, "#F1F5F9")
    s.rect(x, 215, 110 * weight, 18, "#DBEAFE", BLUE)
    s.text(x + 55, 252, f"p = {weight:.3f}", 13)
    s.text(x + 55, 275, "v = " + value, 13)
s.path([(445, 230), (480, 230)])
s.box(490, 206, 205, 68, [t("Weighted output", "加权输出"), "(1.759, 2.007)"])
s.text(360, 312, t("Equal scores → average; a dominant score → hard lookup",
                   "分数相等 → 平均；一个分数占优 → 硬查找"), 13, SLATE)
s.save(2)

# 3: scores and normalised weights are separate intermediate tensors.
s = SVG(390)
s.box(20, 132, 120, 62, ["X", "T × d; T = 5"])
for y, label, shape in ((20, "Q = XW_Q", "T × dₖ"),
                         (132, "K = XW_K", "T × dₖ"), (275, "V = XW_V", "T × dᵥ")):
    s.box(180, y, 130, 62, [label, shape])
    s.path([(140, 163), (158, 163), (158, y + 31), (180, y + 31)])
s.box(355, 73, 130, 62, ["QKᵀ / √dₖ", "T × T"])
s.path([(310, 51), (335, 51), (335, 95), (355, 95)])
s.path([(310, 163), (335, 163), (335, 115), (355, 115)])
s.path([(485, 104), (535, 104)])
s.text(605, 25, t("Causal mask", "因果掩码"))
s.mask(555, 40, 5, 5, lambda r, c: c <= r, cell=20)
s.text(605, 160, t("Grey cells: −∞", "灰色单元：−∞"), 12)
s.path([(605, 140), (605, 198)])
s.box(535, 205, 140, 62, [t("Row softmax", "逐行 softmax"), "P: T × T; Σrow = 1"])
s.path([(605, 267), (605, 306), (485, 306)])
s.box(355, 275, 130, 62, ["PV", "T × dᵥ"])
s.path([(310, 306), (355, 306)])
s.path([(420, 337), (420, 360), (550, 360)])
s.text(560, 365, t("Output: T × dᵥ", "输出：T × dᵥ"), 13, anchor="start")
s.save(3)

# 6: the head axis stays separate until the output concatenation.
s = SVG(370)
s.box(15, 150, 130, 65, [t("Input X", "输入 X"), "(2, 16, 256)"])
s.path([(145, 182), (165, 182)])
s.box(170, 140, 150, 85, [t("Q/K/V projections", "Q/K/V 投影"),
                        t("Split + transpose", "拆分 + 转置"), "(2, 8, 16, 32)"])
for i in range(8):
    y = 15 + i * 42
    s.box(370, y, 140, 32, [f"h{i + 1}: (2, 16, 32)"], fill="white")
    s.path([(320, 182), (345, 182), (345, y + 16), (370, y + 16)])
    s.path([(510, y + 16), (535, y + 16), (535, 182)], arrow=False)
s.path([(535, 182), (560, 182)])
s.box(565, 135, 140, 95, [t("Merge heads", "合并注意力头"), "(2, 16, 256)",
                        "× W_O", "(2, 16, 256)"])
s.text(360, 355, t("Each head: scores (2, 16, 16) → softmax → weighted values",
                   "每个头：分数 (2, 16, 16) → softmax → 加权值"), 13, SLATE)
s.save(6)

# 7: two blocks writing onto an uninterrupted residual stream.
s = SVG(450)
s.path([(130, 397), (130, 55)], NAVY, width=4)
s.text(130, 424, t("Token embedding", " token 嵌入"))
s.box(60, 10, 140, 42, [t("Final norm → logits", "最终归一化 → logits")])
for y, label in ((355, "Attention 1"), (280, "FFN 1"),
                 (205, "Attention 2"), (130, "FFN 2")):
    s.path([(130, y + 25), (260, y + 25)])
    s.box(260, y + 7, 75, 36, [t("Norm", "归一化")], fill="white")
    s.path([(335, y + 25), (360, y + 25)])
    if "Attention" in label:
        s.box(360, y - 14, 255, 77, [])
        s.text(487, y + 54, t(label, "注意力 " + label[-1]), 13)
        for i in range(4):
            s.box(374 + 59 * i, y + 5, 52, 28, [f"h{i + 1}"], fill="white")
            s.path([(400 + 59 * i, y + 5), (400 + 59 * i, y - 25),
                    (142, y - 25)])
        s.path([(615, y + 14), (660, y + 14), (660, y - 25), (142, y - 25)])
    else:
        s.box(360, y + 7, 145, 36, [label])
        s.path([(505, y + 25), (660, y + 25), (660, y - 25), (142, y - 25)])
    s.plus(130, y - 25)
s.text(25, 215, t("Residual", "残差流"), 12, anchor="start")
s.text(470, 440, t("Head writes: W_O⁽ⁱ⁾", "注意力头写入：W_O⁽ⁱ⁾"), 12)
s.save(7)

# 9: a norm on the main path versus on each update branch.
s = SVG(425)
for centre, pre in ((190, False), (540, True)):
    s.text(centre, 25, t("Pre-norm" if pre else "Post-norm",
                       "前置归一化" if pre else "后置归一化"))
    s.text(centre, 407, "x")
    s.path([(centre, 388), (centre, 48)], NAVY, width=3)
    for bottom in (355, 205):
        label = "Attention" if bottom == 355 else "FFN"
        if pre:
            s.path([(centre, bottom), (centre + 70, bottom)])
            s.box(centre + 70, bottom - 19, 92, 38, [t("Norm", "归一化")], fill="white")
            s.path([(centre + 116, bottom - 19), (centre + 116, bottom - 60)])
            s.box(centre + 70, bottom - 98, 92, 38,
                  [t(label, "注意力" if label == "Attention" else "前馈网络")])
            s.path([(centre + 70, bottom - 79), (centre + 12, bottom - 79)])
            s.plus(centre, bottom - 79)
        else:
            s.box(centre - 55, bottom - 43, 110, 38,
                  [t(label, "注意力" if label == "Attention" else "前馈网络")])
            s.path([(centre, bottom), (centre - 100, bottom),
                    (centre - 100, bottom - 67), (centre - 12, bottom - 67)])
            s.plus(centre, bottom - 67)
            s.box(centre - 55, bottom - 126, 110, 38, [t("Norm", "归一化")], fill="white")
    if pre:
        s.text(455, 87, t("Identity path", "恒等路径"), 12)
s.save(9)

# 16: allowed query-key pairs determine each architecture's information access.
s = SVG(400)
titles = [("Encoder (BERT)", "编码器（BERT）"), ("Decoder (GPT)", "解码器（GPT）"),
          ("Encoder–decoder (T5)", "编码器–解码器（T5）")]
for i, title in enumerate(titles):
    x = 20 + i * 235
    s.text(x + 100, 25, t(*title), 14)
    s.box(x + 20, 45, 160, 45, [t("Transformer stack", "Transformer 堆叠")])
    s.mask(x + 55, 110, 6, 6, lambda r, c, i=i: i != 1 or c <= r)
    if i == 2:
        s.mask(x + 8, 222, 6, 6, lambda r, c: c <= r)
        s.mask(x + 115, 237, 5, 6, lambda r, c: True)
        s.text(x + 53, 333, t("Decoder", "解码器"), 12)
        s.text(x + 160, 333, t("Cross-attention", "交叉注意力"), 12)
    else:
        s.text(x + 100, 224, t("Fill masked tokens" if i == 0 else "Predict next token",
                             "填充掩蔽 token " if i == 0 else "预测下一个 token"), 13)
s.text(590, 378, t("Map input to output text", "将输入文本映射到输出文本"), 13)
s.text(53, 270, t("Prefix LM", "前缀语言模型"), 12)
s.mask(122, 248, 6, 6, lambda r, c: (r < 3 and c < 3) or (r >= 3 and c <= r))
s.save(16)

# 17: ViT patchification is a shared projection, followed by token processing.
s = SVG(355)
s.text(105, 22, t("224 × 224 image", "224 × 224 图像"))
s.rect(20, 40, 168, 168, "#F0F9FF")
# Schematic pump housing under the patch grid.
s.parts.append(f'<circle cx="101" cy="119" r="46" fill="#DBEAFE" stroke="{SLATE}"/>'
               f'<rect x="130" y="89" width="42" height="25" fill="#DBEAFE" stroke="{SLATE}"/>'
               f'<path d="M 70 153 L 58 186 L 147 186 L 132 153" fill="#DBEAFE" stroke="{SLATE}"/>')
for i in range(15):
    s.path([(20 + i * 12, 40), (20 + i * 12, 208)], BORDER, False, 1)
    s.path([(20, 40 + i * 12), (188, 40 + i * 12)], BORDER, False, 1)
for i in range(3):
    s.rect(56 + i * 24, 88, 12, 12, "none", BLUE)
    s.path([(62 + i * 24, 100), (220, 100), (220, 65 + i * 65),
            (250, 65 + i * 65)])
    s.box(250, 46 + i * 65, 150, 38, ["16 × 16 × 3 → 768"])
s.text(105, 237, t("14 × 14 = 196 patches", "14 × 14 = 196 个图像块"), 13)
s.path([(400, 130), (425, 130)])
s.box(430, 96, 170, 66, [t("Shared linear map", "共享线性映射"), "768 → d"])
s.path([(515, 162), (515, 218)])
s.box(425, 222, 180, 42, [t("[CLS] + 196 + position", "[CLS] + 196 + 位置")])
s.path([(425, 243), (395, 243), (395, 304), (430, 304)])
s.box(430, 281, 180, 46, [t("Encoder × 12", "编码器 × 12"), t("[CLS] → class", "[CLS] → 类别")])
s.text(260, 319, t("197 tokens", "197 个 token "), 13)
s.save(17)

# 19: eight drawn query heads; cache example uses 32 query heads and 32 layers.
s = SVG(305)
for x, title, groups, bytes_kib in ((20, "MHA", 8, 512),
                                   (260, "GQA", 2, 128), (500, "MQA", 1, 16)):
    s.text(x + 100, 25, title)
    for i in range(8):
        qx = x + 12 + i * 24
        s.box(qx, 52, 20, 33, [str(i + 1)], fill="white")
        group = i // (8 // groups)
        kvx = x + 12 + (group + 0.5) * 192 / groups
        s.path([(qx + 10, 85), (kvx, 130)], arrow=False, colour=BLUE)
    for j in range(groups):
        w = 192 / groups - 4
        s.box(x + 12 + j * 192 / groups, 132, w, 38,
              ["K/V" if groups < 8 else str(j + 1)], fill="#F0FDF4", stroke=GREEN)
    s.text(x + 108, 205, t("KV heads drawn: ", "图中 KV 头数：") + str(groups), 13)
    s.text(x + 108, 245, str(bytes_kib) + t(" KiB /token", " KiB /token "), 13)
s.text(360, 280, t("Cache example: L = 32, h = 32, dₕ = 128, bf16; GQA nₖᵥ = 8",
                   "缓存示例：L = 32，h = 32，dₕ = 128，bf16；GQA nₖᵥ = 8"), 13, SLATE)
s.save(19)
