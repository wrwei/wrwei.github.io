"""Tiny SVG builder shared by the Module 03 figure generators."""
import os, sys
NAVY, SLATE, FAINT, GRID = "#1A2E4A", "#475569", "#94A3B8", "#E2E8F0"
BLUE, BLUEF, SKY = "#2563EB", "#DBEAFE", "#0EA5E9"
GREEN, GREENF = "#15803D", "#F0FDF4"
ORANGE, ORANGEF = "#C2410C", "#FFF7ED"
RED, REDF = "#DC2626", "#FEF2F2"
PURPLE, PURPLEF = "#7E22CE", "#FAF5FF"
SKYF = "#F0F9FF"
ROOT = __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", ".."))

def lang():
    l = sys.argv[1] if len(sys.argv) > 1 else "en"
    assert l in ("en", "zh")
    return l

def sub(s, size=10):
    return f'<tspan dy="4" font-size="{size}">{s}</tspan><tspan dy="-4"> </tspan>'

def it(s):
    return f'<tspan font-style="italic">{s}</tspan>'

class S:
    def __init__(self, w, h):
        self.w, self.h, self.e = w, h, []
    def add(self, s): self.e.append(s)
    def rect(self, x, y, w, h, fill="#fff", stroke=NAVY, sw=1.5, rx=0, dash=None, extra=""):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}{extra}/>')
    def circle(self, x, y, r, fill="#fff", stroke=NAVY, sw=1.2):
        self.add(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')
    def line(self, x1, y1, x2, y2, stroke=SLATE, sw=1.5, dash=None, marker=None, op=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        m = f' marker-end="url(#{marker})"' if marker else ""
        o = f' stroke-opacity="{op}"' if op else ""
        self.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke}" stroke-width="{sw}"{d}{m}{o}/>')
    def path(self, d, stroke=SLATE, sw=1.5, fill="none", marker=None, dash=None):
        m = f' marker-end="url(#{marker})"' if marker else ""
        da = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{m}{da}/>')
    def poly(self, pts, fill, stroke, sw=1.5):
        p = " ".join(f"{x:.1f},{y:.1f}" for x, y in pts)
        self.add(f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>')
    def text(self, x, y, s, size=13, anchor="middle", fill=NAVY, weight=None):
        w = f' font-weight="{weight}"' if weight else ""
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-size="{size}" text-anchor="{anchor}" fill="{fill}"{w}>{s}</text>')
    def sheets(self, x, y, w, h, n, dx, dy, fill, stroke, sw=1.4):
        for i in range(n - 1, -1, -1):
            self.rect(x + i * dx, y - i * dy, w, h, fill, stroke, sw)
    def grid(self, x, y, rows, cols, cell, fills=None, stroke=GRID, sw=1):
        for r in range(rows):
            for c in range(cols):
                f = (fills or {}).get((r, c), "#fff")
                self.rect(x + c * cell, y + r * cell, cell, cell, f, stroke, sw)
    def save(self, name, l):
        defs = ""
        for mid, col in (("ah", SLATE), ("ahb", BLUE), ("aho", ORANGE), ("ahg", GREEN)):
            defs += (f'<marker id="{mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
                     f'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{col}"/></marker>')
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" width="{self.w}" height="{self.h}" '
               f'font-family="DM Sans, system-ui, -apple-system, Segoe UI, sans-serif">\n<defs>{defs}</defs>\n'
               + "\n".join(self.e) + "\n</svg>\n")
        assert "$" not in svg
        p = os.path.join(ROOT, l, name + ".svg")
        os.makedirs(os.path.dirname(p), exist_ok=True)
        open(p, "w", encoding="utf-8").write(svg)
        print("wrote", p)
