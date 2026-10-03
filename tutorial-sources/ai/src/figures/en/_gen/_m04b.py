from _common import *
def poly(pts, stroke=SLATE, sw=1.6, marker=None, dash=None):
    m = f' marker-end="url(#{marker})"' if marker else ""
    d = f' stroke-dasharray="{dash}"' if dash else ""
    p = " ".join(f"{x},{y}" for x, y in pts)
    return f'<polyline points="{p}" fill="none" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"{d}{m}/>'
def hop(x, y1, y2, stroke=SLATE, sw=1.6, marker=None):
    """vertical line with a white halo so it appears to hop over a horizontal line"""
    return line(x, y1, x, y2, "#FFFFFF", sw + 5) + "\n" + line(x, y1, x, y2, stroke, sw, marker=marker)
def node(x, y, s, r=13, fill="#FFFFFF", stroke=NAVY, size=16):
    return circle(x, y, r, fill, stroke, 1.6) + "\n" + text(x, y + size * 0.34, s, size, "middle", NAVY)
def gate(cx, y, w, h, s, fill, stroke, size=14):
    return rect(cx - w / 2, y, w, h, fill, stroke, 1.6, 8) + "\n" + text(cx, y + h / 2 + 5, s, size, "middle", stroke, "600")
THICK = ('<marker id="ahT" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="12" markerHeight="12" '
         'markerUnits="userSpaceOnUse" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#2563EB"/></marker>')
C = lambda s: "c" + "̃" + s     # placeholder (unused)
