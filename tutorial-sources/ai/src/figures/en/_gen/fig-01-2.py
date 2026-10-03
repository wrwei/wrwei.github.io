# Least squares as an orthogonal projection (schematic). Writes en/ or zh/ fig-01-2.svg
import sys, os
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(cs="column space of X", yv="data vector", yh="projection (foot)", res="residual", ne="normal equations", perp="meets the plane at 90°"),
     "zh": dict(cs="X 的列空间", yv="数据向量", yh="投影（垂足）", res="残差", ne="正规方程", perp="与平面成直角")}[LANG]
FONT = "DM Sans, system-ui, -apple-system, Segoe UI, sans-serif" if LANG == "en" else "DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif"
def V(c="x", sub=None):
    s = f'<tspan font-weight="700">{c}</tspan>'
    if sub: s += f'<tspan dy="4" font-size="10">{sub}</tspan><tspan dy="-4"> </tspan>'
    return s
def mk(id_, col): return (f'<marker id="{id_}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">'
                          f'<path d="M0,0 L10,5 L0,10 z" fill="{col}"/></marker>')
O, A, B, F, Y = (300, 280), (455, 300), (405, 232), (372, 276), (372, 96)
o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 356" width="640" height="356" font-family="{FONT}" font-size="14" fill="#1A2E4A">',
     '<defs>' + mk("a1", "#2563EB") + mk("a2", "#1A2E4A") + mk("a3", "#15803D") + mk("a4", "#DC2626") + '</defs>',
     '<polygon points="90,322 470,344 620,238 250,214" fill="#DBEAFE" fill-opacity="0.7" stroke="#2563EB" stroke-width="1.5"/>',
     f'<text x="132" y="312" font-size="13" fill="#2563EB">{T["cs"].replace("X", "")}{"" if False else ""}<tspan font-weight="700">{"X" if LANG=="zh" else ""}</tspan></text>' if False else
     (f'<text x="132" y="311" font-size="13" fill="#2563EB">column space of {V("X")}</text>' if LANG == "en" else f'<text x="132" y="311" font-size="13" fill="#2563EB">{V("X")} 的列空间</text>'),
     # in-plane column vectors
     f'<line x1="{O[0]}" y1="{O[1]}" x2="{A[0]}" y2="{A[1]}" stroke="#2563EB" stroke-width="2" marker-end="url(#a1)"/>',
     f'<line x1="{O[0]}" y1="{O[1]}" x2="{B[0]}" y2="{B[1]}" stroke="#2563EB" stroke-width="2" marker-end="url(#a1)"/>',
     f'<text x="{A[0]+8}" y="{A[1]+5}" fill="#2563EB">{V("x", "(1)")}</text>',
     f'<text x="{B[0]+8}" y="{B[1]-4}" fill="#2563EB">{V("x", "(2)")}</text>',
     f'<circle cx="{O[0]}" cy="{O[1]}" r="3.5" fill="#1A2E4A"/>',
     f'<text x="{O[0]-18}" y="{O[1]+20}" font-size="13" fill="#475569">0</text>',
     # data vector y and its projection
     f'<line x1="{O[0]}" y1="{O[1]}" x2="{Y[0]}" y2="{Y[1]+3}" stroke="#1A2E4A" stroke-width="2" marker-end="url(#a2)"/>',
     f'<line x1="{O[0]}" y1="{O[1]}" x2="{F[0]-2}" y2="{F[1]}" stroke="#15803D" stroke-width="3" marker-end="url(#a3)"/>',
     f'<line x1="{F[0]}" y1="{F[1]-2}" x2="{Y[0]}" y2="{Y[1]+8}" stroke="#DC2626" stroke-width="2" stroke-dasharray="6 4"/>',
     # right-angle mark at the foot
     f'<path d="M{F[0]+16},{F[1]+1.6} L{F[0]+16},{F[1]-11} L{F[0]},{F[1]-12}" fill="none" stroke="#DC2626" stroke-width="1.4"/>',
     f'<circle cx="{F[0]}" cy="{F[1]}" r="4" fill="#15803D"/>',
     f'<text x="{Y[0]+12}" y="{Y[1]+4}" fill="#1A2E4A">{V("y")}</text>',
     f'<text x="{Y[0]+12}" y="{Y[1]+22}" font-size="12" fill="#475569">{T["yv"]}</text>',
     f'<text x="{F[0]+26}" y="{F[1]-14}" fill="#15803D"><tspan font-weight="700">ŷ</tspan> = {V("X")}{V("w")}<tspan dy="-5" font-size="14">*</tspan><tspan dy="5"> </tspan></text>',
     f'<text x="{Y[0]+12}" y="{(Y[1]+F[1])//2-36}" fill="#DC2626">{V("r")} = {V("y")} − <tspan font-weight="700">ŷ</tspan></text>',
     f'<text x="{Y[0]+12}" y="{(Y[1]+F[1])//2-18}" font-size="12" fill="#475569">{T["res"]}</text>',
     f'<text x="{Y[0]+12}" y="{(Y[1]+F[1])//2-2}" font-size="12" fill="#475569">{T["perp"]}</text>',
     # normal equations box
     '<rect x="470" y="60" width="150" height="62" rx="8" fill="#FEF2F2" stroke="#DC2626" stroke-width="1.5"/>',
     f'<text x="545" y="84" text-anchor="middle" font-size="12" fill="#475569">{T["ne"]}</text>',
     f'<text x="545" y="108" text-anchor="middle" font-size="15" fill="#1A2E4A">{V("X")}ᵀ{V("r")} = {V("0")}</text>',
     '</svg>']
svg = "\n".join(o)
assert "$" not in svg
d = os.path.join(__import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")), LANG)
open(os.path.join(d, "fig-01-2.svg"), "w", encoding="utf-8").write(svg)
