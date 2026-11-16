"""Style and drawing primitives for the Formal Methods series' figures (see figs.py).

Writes src/figures/<lang>/<id>.svg. One style for all figures: the series' colours, DM Sans
(with CJK fallbacks) for text, and Isabelle's own font for formulas and Isabelle text, so that
figures, pages and Isabelle/jEdit show the same symbols.
"""
import os
import re
import sys
from html import escape


C = dict(navy='#1A2E4A', blue='#2563EB', sky='#0EA5E9', skyl='#DBEAFE', skyp='#F0F9FF', slate='#475569',
         muted='#94A3B8', border='#CBD5E1', bg='#F8FAFC', white='#FFFFFF', green='#15803D', greenl='#DCFCE7',
         greenp='#F0FDF4', orange='#C2410C', orangep='#FFF7ED', red='#DC2626', redl='#FEE2E2', redp='#FEF2F2',
         amber='#B45309', amberp='#FFFBEB', purple='#6D28D9', purplep='#F5F3FF', indigo='#4338CA', indigop='#EEF2FF',
         term='#111827', termtext='#E5E7EB')
SANS = "'DM Sans', system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif"
MONO = "'Isabelle DejaVu Sans Mono', 'DejaVu Sans Mono', Consolas, Menlo, 'PingFang SC', 'Microsoft YaHei', monospace"


# ---------------------------------------------------------------- primitives

class SVG:
    def __init__(self, w, h, title):
        self.w, self.h, self.title = w, h, title
        self.items = []

    def add(self, s):
        self.items.append(s)

    def rect(self, x, y, w, h, fill=C['white'], stroke=C['border'], r=10, sw=1.5, dash=None, extra=''):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}{extra}/>')

    def text(self, x, y, s, size=13, fill=C['navy'], weight=400, anchor='start', mono=False, italic=False, extra=''):
        fam = MONO if mono else SANS
        it = ' font-style="italic"' if italic else ''
        self.add(f'<text x="{x}" y="{y}" font-family="{fam}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{it}{extra}>{escape(s)}</text>')

    def lines(self, x, y, rows, size=13, gap=None, **kw):
        gap = gap or round(size * 1.45)
        for i, r in enumerate(rows):
            self.text(x, y + i * gap, r, size=size, **kw)

    def line(self, x1, y1, x2, y2, stroke=C['slate'], sw=2, dash=None, arrow=False, color=None):
        d = f' stroke-dasharray="{dash}"' if dash else ''
        m = f' marker-end="url(#ah-{(color or stroke).lstrip("#")})"' if arrow else ''
        self.add(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{stroke}" stroke-width="{sw}"{d}{m}/>')

    def path(self, d, stroke=C['slate'], sw=2, fill='none', dash=None, arrow=False):
        da = f' stroke-dasharray="{dash}"' if dash else ''
        m = f' marker-end="url(#ah-{stroke.lstrip("#")})"' if arrow else ''
        self.add(f'<path d="{d}" stroke="{stroke}" stroke-width="{sw}" fill="{fill}"{da}{m}/>')

    def circle(self, x, y, r=11, fill=C['white'], stroke=C['navy'], sw=2.5):
        self.add(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    def pill(self, x, y, s, kind='branch', size=12, anchor='middle'):
        """A label like Git's: branch (green), head (blue), remote (red), plain (grey)."""
        fill, stroke, col = {'branch': (C['greenl'], C['green'], C['green']), 'head': (C['skyl'], C['blue'], C['blue']),
                             'remote': (C['redp'], C['red'], C['red']), 'plain': (C['bg'], C['border'], C['slate']),
                             'cmd': (C['term'], C['term'], C['termtext'])}[kind]
        w = max(34, round(len(s) * size * 0.62 + 16))
        x0 = x - w / 2 if anchor == 'middle' else x
        self.rect(x0, y - size - 4, w, size + 10, fill=fill, stroke=stroke, r=(size + 10) / 2, sw=1.4)
        self.text(x0 + w / 2, y + 1, s, size=size, fill=col, weight=600, anchor='middle', mono=True)
        return w

    def svg(self):
        colours = sorted({re.search(r'url\(#ah-([0-9A-Fa-f]+)\)', i).group(1) for i in self.items if 'url(#ah-' in i})
        marks = ''.join(f'<marker id="ah-{c}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="#{c}"/></marker>' for c in colours)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" width="{self.w}" height="{self.h}" role="img">'
                f'<title>{escape(self.title)}</title><defs>{marks}</defs>' + ''.join(self.items) + '</svg>\n')


def arrow_label(s, x, y, rows, size=12, fill=C['slate'], weight=600):
    for i, r in enumerate(rows):
        s.text(x, y + i * round(size * 1.35), r, size=size, fill=fill, weight=weight, anchor='middle')
