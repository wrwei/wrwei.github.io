# Learning path of the series: three bands, ten modules, prerequisite arrows.
import sys
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
W, H, BW, BH = 736, 372, 112, 56
COL = {1: 8, 2: 158, 3: 312, 4: 466, 5: 616}
NODES = {  # n: (column, y-centre, english lines, chinese lines)
    1: (1, 110, ["ML foundations"], ["机器学习基础"]),
    2: (1, 230, ["Neural networks"], ["神经网络"]),
    3: (2, 70, ["Convolutional", "networks"], ["卷积网络"]),
    5: (2, 150, ["Other networks"], ["其他网络"]),
    4: (2, 230, ["Recurrent", "networks"], ["循环网络"]),
    6: (3, 230, ["The transformer"], ["Transformer"]),
    7: (4, 230, ["Large language", "models"], ["大语言模型"]),
    8: (5, 150, ["Pretraining"], ["预训练"]),
    9: (5, 230, ["Post-training"], ["后训练"]),
    10: (5, 310, ["Inference and", "serving"], ["推理与服务"]),
}
BANDS = [(0, 139, "#F1F5F9", "Foundations", "基础"), (139, 445, "#F0F9FF", "Architectures", "网络结构"),
         (445, W, "#FAF5FF", "Large language models", "大语言模型")]
FONT = "DM Sans, system-ui, -apple-system, Segoe UI, sans-serif" if LANG == "en" else \
    "DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif"
out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{FONT}">',
       '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
       '<path d="M0,0 L10,5 L0,10 z" fill="#475569"/></marker></defs>']
for x0, x1, fill, en, zh in BANDS:
    out.append(f'<rect x="{x0 + 2}" y="2" width="{x1 - x0 - 4}" height="{H - 34}" rx="12" fill="{fill}"/>')
    out.append(f'<text x="{x0 + 14}" y="24" font-size="12" font-weight="700" letter-spacing="0.06em" fill="#475569">{(en if LANG == "en" else zh).upper()}</text>')
def box(n):
    c, y, en, zh = NODES[n]
    x = COL[c]
    lines = en if LANG == "en" else zh
    hi = n in (6, 7)
    s = [f'<rect x="{x}" y="{y - BH // 2}" width="{BW}" height="{BH}" rx="8" fill="{"#DBEAFE" if hi else "#FFFFFF"}" stroke="{"#2563EB" if hi else "#1A2E4A"}" stroke-width="1.5"/>',
         f'<text x="{x + 10}" y="{y - 10}" font-size="11" font-family="DM Mono, Consolas, monospace" fill="#2563EB">{"Module" if LANG == "en" else "模块"} {n:02d}</text>']
    if len(lines) == 1:
        s.append(f'<text x="{x + 10}" y="{y + 11}" font-size="13" font-weight="600" fill="#1A2E4A">{lines[0]}</text>')
    else:
        s.append(f'<text x="{x + 10}" y="{y + 6}" font-size="13" font-weight="600" fill="#1A2E4A">{lines[0]}</text>')
        s.append(f'<text x="{x + 10}" y="{y + 21}" font-size="13" font-weight="600" fill="#1A2E4A">{lines[1]}</text>')
    return s
def right(n, dy=0):
    c, y, *_ = NODES[n]
    return COL[c] + BW, y + dy
def left(n, dy=0):
    c, y, *_ = NODES[n]
    return COL[c], y + dy
def arrow(a, b, dashed=False):
    (x1, y1), (x2, y2) = a, b
    dash = ' stroke-dasharray="5 4"' if dashed else ""
    if y1 == y2:
        d = f"M{x1},{y1} L{x2 - 2},{y2}"
    else:
        mx = (x1 + x2) / 2
        d = f"M{x1},{y1} C{mx},{y1} {mx},{y2} {x2 - 2},{y2}"
    return f'<path d="{d}" fill="none" stroke="#475569" stroke-width="1.6"{dash} marker-end="url(#ah)"/>'
c1x = COL[1] + BW // 2
out.append(f'<path d="M{c1x},{NODES[1][1] + BH // 2} L{c1x},{NODES[2][1] - BH // 2 - 2}" fill="none" stroke="#475569" stroke-width="1.6" marker-end="url(#ah)"/>')
out += [arrow(right(2, -18), left(3)), arrow(right(2, -8), left(5)), arrow(right(2, 2), left(4)),
        arrow(right(4), left(6)), arrow(right(6), left(7)),
        arrow(right(7, -8), left(8)), arrow(right(7), left(9)), arrow(right(7, 8), left(10), dashed=True)]
for n in NODES:
    out += box(n)
legend_y = H - 12
if LANG == "en":
    out.append(f'<text x="8" y="{legend_y}" font-size="12" fill="#475569">Arrows point from a module to the modules that build on it. Dashed: readable any time after Module 07.</text>')
else:
    out.append(f'<text x="8" y="{legend_y}" font-size="12" fill="#475569">箭头从一个模块指向以它为基础的模块。虚线：学完模块 07 后可随时阅读。</text>')
out.append("</svg>")
print("\n".join(out))
