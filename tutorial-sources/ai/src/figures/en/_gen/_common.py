# Shared helpers for hand-built SVG schematics (text built from tspans, markers, boxes).
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
FIG = os.path.dirname(HERE)            # src/figures/en
ROOT = os.path.dirname(FIG)            # src/figures
NAVY, SLATE, MUTED, BORDER = "#1A2E4A", "#475569", "#94A3B8", "#E2E8F0"
BLUE, SKY, GREEN, ORANGE, RED, PURPLE, AMBER = "#2563EB", "#0EA5E9", "#15803D", "#C2410C", "#DC2626", "#7E22CE", "#B45309"
F_BLUE, F_SKY, F_GREEN, F_ORANGE, F_RED, F_PURPLE, F_AMBER = "#DBEAFE", "#F0F9FF", "#F0FDF4", "#FFF7ED", "#FEF2F2", "#FAF5FF", "#FFFBEB"

def lang():
    return sys.argv[1] if len(sys.argv) > 1 else "en"

def font(l):
    return ("DM Sans, system-ui, -apple-system, Segoe UI, sans-serif" if l == "en"
            else "DM Sans, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui, sans-serif")

def I(s): return f'<tspan font-style="italic">{s}</tspan>'
def B(s): return f'<tspan font-weight="700">{s}</tspan>'
def SUP(s, size=10): return f'<tspan dy="-5" font-size="{size}">{s}</tspan><tspan dy="5">​</tspan>'
def SUB(s, size=10): return f'<tspan dy="4" font-size="{size}">{s}</tspan><tspan dy="-4">​</tspan>'

def open_svg(W, H, l, extra_defs=""):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{font(l)}">',
            '<defs>' + "".join(
                f'<marker id="{i}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
                f'<path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>'
                for i, c in (("ah", SLATE), ("ahr", RED), ("ahb", BLUE), ("ahg", MUTED))) + extra_defs + '</defs>']

def text(x, y, s, size=13, anchor="start", fill=NAVY, weight=None, halo=False, extra=""):
    w = f' font-weight="{weight}"' if weight else ""
    h = ' stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round" paint-order="stroke"' if halo else ""
    return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="{anchor}" fill="{fill}"{w}{h}{extra}>{s}</text>'

def rect(x, y, w, h, fill="#FFFFFF", stroke=NAVY, sw=1.5, rx=8, extra=""):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{extra}/>'

def line(x1, y1, x2, y2, stroke=SLATE, sw=1.6, marker=None, dash=None, extra=""):
    m = f' marker-end="url(#{marker})"' if marker else ""
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}"{d}{m}{extra}/>'

def circle(x, y, r, fill="#FFFFFF", stroke=NAVY, sw=1.5):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'

def write(parts, name, l):
    parts = parts + ["</svg>"]
    s = "\n".join(parts)
    assert "$" not in s
    d = os.path.join(ROOT, l)
    os.makedirs(d, exist_ok=True)
    p = os.path.join(d, name + ".svg")
    open(p, "w", encoding="utf-8").write(s + "\n")
    print(p)
