"""Self-contained SVG mechanisms for Module 07. Usage: python ... en|zh."""
import html
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
assert LANG in ("en", "zh")
NAVY, BLUE, GREEN, ORANGE = "#1A2E4A", "#2563EB", "#15803D", "#C2410C"
BORDER, SLATE = "#E2E8F0", "#475569"

def t(en, zh):
    return zh if LANG == "zh" else en

class SVG:
    def __init__(self, height):
        self.parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="720" '
                      f'height="{height}" viewBox="0 0 720 {height}" '
                      'font-family="DM Sans, Microsoft YaHei, system-ui, sans-serif">',
                      '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" '
                      'refY="5" markerWidth="6" markerHeight="6" orient="auto">'
                      f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{SLATE}"/>'
                      '</marker></defs>']
    def text(self, x, y, value, size=14, colour=NAVY, anchor="middle"):
        self.parts.append(f'<text x="{x}" y="{y}" font-size="{size}" '
                          f'fill="{colour}" text-anchor="{anchor}">{html.escape(str(value))}</text>')
    def rect(self, x, y, w, height, fill="white", stroke=BORDER, rx=0):
        self.parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{height}" '
                          f'fill="{fill}" stroke="{stroke}" rx="{rx}"/>')
    def box(self, x, y, w, height, lines, fill="#F0F9FF", stroke=BLUE):
        self.rect(x, y, w, height, fill, stroke, 7)
        for i, line in enumerate(lines):
            self.text(x+w/2, y+height/2-8*(len(lines)-1)+5+16*i, line, 13)
    def path(self, points, colour=SLATE, arrow=True):
        path = "M " + " L ".join(f"{x} {y}" for x, y in points)
        marker = ' marker-end="url(#arrow)"' if arrow else ''
        self.parts.append(f'<path d="{path}" fill="none" stroke="{colour}" '
                          f'stroke-width="1.8"{marker}/>')
    def save(self, number):
        self.parts.append('</svg>')
        (ROOT / f'src/figures/{LANG}/fig-07-{number}.svg').write_text(
            '\n'.join(self.parts), encoding='utf8')

# Four illustrative predictions, not fabricated model logits.
s = SVG(370)
s.text(360, 26, t("Four next-token predictions", "四次下一个 token预测"), 18)
for i, (token, probability) in enumerate(zip(
        [" relief", " valve", " opens", " at"], [.5, .25, .125, .8])):
    x = 25 + 170*i
    s.box(x, 52, 150, 42, [repr(token)])
    s.rect(x, 105, 150, 14, '#F1F5F9')
    s.rect(x, 105, 150*probability, 14, '#DBEAFE', BLUE)
    s.text(x+75, 140, f'p = {probability:g}; −ln p = {-math.log(probability):.3f}', 12)
    s.path([(x+75, 202), (x+75, 153)])
s.box(25, 204, 660, 53, [t("Shared decoder with causal mask", "带因果掩码的共享解码器"),
                         t("Each position predicts its successor", "每个位置预测后继 token ")])
for i, token in enumerate(["The", " relief", " valve", " opens", " at"]):
    x = 25 + 135*i
    s.box(x, 294, 120, 35, [repr(token)])
    s.path([(x+60, 294), (x+60, 257)])
s.text(360, 357, t("Mean target loss: 1.096 nats; perplexity: 2.99",
                   "平均目标损失：1.096 nat；困惑度：2.99"), 14)
s.save(1)

# Compact initial corpus plus measured ledger; the widget supplies intermediate states.
s = SVG(410)
s.text(180, 28, t("Initial corpus: 257 symbols", "初始语料：257 个符号"), 16)
s.text(530, 28, t("Learned merge ledger", "已学习的合并记录"), 16)
words = [("weld", 10), ("welded", 9), ("welds", 7),
         ("cooled", 7), ("melt", 5), ("heated", 4)]
for row, (word, count) in enumerate(words):
    y = 72 + 44*row
    s.text(40, y+16, f'{count}×', anchor='start')
    for i, char in enumerate(word+'_'):
        s.box(84+29*i, y, 25, 25, [char], 'white', BORDER)
s.text(400, 63, t("Pair", "符号对"), 13)
s.text(570, 63, t("Count", "计数"), 13)
s.text(660, 63, t("Length", "长度"), 13)
rows = [('e + l', 31, 226), ('d + _', 30, 196), ('w + el', 26, 170),
        ('e + d_', 20, 150), ('wel + d', 16, 134),
        ('wel + d_', 10, 124), ('weld + ed_', 9, 115)]
for i, (pair, count, length) in enumerate(rows):
    y = 94+36*i
    s.text(345, y, str(i+1), 13)
    s.text(445, y, pair, 13, BLUE)
    s.text(570, y, str(count), 13)
    s.text(660, y, str(length), 13)
s.text(360, 378, t("Weighted occurrences determine the next pair; ties use tuple order.",
                   "加权出现次数决定下一次合并；并列时按元组顺序选择。"), 13, SLATE)
s.save(3)

s = SVG(325)
s.text(360, 26, t("Pre-tokenisation and learned merges change boundaries",
                   "预分词与学习到的合并改变边界"), 17)
for column, text in enumerate(['1234567', ' SAFETY']):
    x = 155+285*column
    s.text(x+120, 67, repr(text), 16)
    rows = ([['123', '45', '67'], list('1234567'), list('1234567')]
            if column == 0 else [[' SAF', 'ET', 'Y'], [' SAF', 'ET', 'Y'], [' SAF', 'ETY']])
    for row, pieces in enumerate(rows):
        if column == 0:
            s.text(25, 115+65*row, ['GPT-2', 'SmolLM2', 'Qwen2.5'][row], 14, anchor='start')
        cursor = x
        for piece in pieces:
            width = max(26, 10*len(piece)+16)
            s.box(cursor, 95+65*row, width, 32, [piece], '#F0F9FF')
            cursor += width+4
s.text(360, 298, t("Spaces are part of the token strings; these are measured Lab 2 splits.",
                   "空格属于 token 字符串；图中边界来自实验 2 的实测。"), 13, SLATE)
s.save(5)

s = SVG(475)
s.text(165, 27, t("Trusted task selection", "可信任务选择"), 17, GREEN)
s.text(540, 27, t("Untrusted document content", "不可信文档内容"), 17, ORANGE)
s.rect(15, 43, 300, 190, '#F0FDF4', '#BBF7D0', 8)
s.rect(355, 43, 350, 190, '#FFF7ED', '#FED7AA', 8)
s.box(40, 68, 250, 45, [t("Engineer's request", "工程师的请求")])
s.path([(165, 113), (165, 137)])
s.box(40, 139, 250, 60, [t("Router selects task + permissions", "路由器选择任务与权限"),
                         t("Before reading the documents", "在读取文档之前")], '#F0FDF4', GREEN)
s.box(390, 75, 280, 50, [t("Hazard entries / retrieved records", "危害条目 / 检索记录")], '#FFF7ED', ORANGE)
s.path([(530, 125), (530, 145)])
s.box(390, 146, 280, 53, [t("Delimited data section", "有明确边界的数据部分"),
                          t("Private or public material", "私有或公开材料")], '#FFF7ED', ORANGE)
s.path([(165, 199), (165, 262), (270, 262)])
s.path([(530, 199), (530, 262), (450, 262)])
s.box(270, 240, 180, 45, [t("Model call", "模型调用")])
s.path([(360, 285), (360, 311)])
s.box(257, 315, 206, 45, [t("Validate output", "验证输出")])
s.path([(257, 337), (140, 337), (140, 387)])
s.box(35, 391, 210, 49, [t("Display untrusted summary", "显示不可信摘要")], '#F0FDF4', GREEN)
s.path([(463, 337), (565, 337), (565, 387)])
s.box(450, 391, 230, 49, [t("Separate structured write path", "独立的结构化写入路径"),
                         t("Validation + engineer approval", "验证 + 工程师批准")], '#FFF7ED', ORANGE)
s.text(360, 465, t("Summariser credential: no write permission and no outbound channel",
                   "摘要器凭证：无写入权限，也无对外通信通道"), 13, SLATE)
s.save(17)
