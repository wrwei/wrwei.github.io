"""Draw the Calculus series' figures: src/figures/en/<id>.svg (and, with --png, out/figs/<id>.png).

    $CALC_PYTHON -I src/figures/_gen/figs.py                 every figure
    $CALC_PYTHON -I src/figures/_gen/figs.py 05              the figures of Module 5 (figs_05.py)
    $CALC_PYTHON -I src/figures/_gen/figs.py fig-05-2 --png  one figure, and a PNG preview to look at

Each figs_NN.py defines FIGURES = {'fig-NN-k': function}; a function takes the language ('en') and
returns a matplotlib figure drawn with the helpers of figstyle.py. Its docstring's first line is the
figure's accessible title. The SVG is cleaned (no metadata, coordinates rounded, size in px).
"""
import glob
import importlib
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
OUT_SVG = os.path.join(ROOT, 'src', 'figures', 'en')
OUT_PNG = os.path.join(ROOT, 'out', 'figs')

import figstyle  # noqa: E402,F401  (sets the house style before any figure module is imported)
import matplotlib.pyplot as plt  # noqa: E402


def clean(svg, title):
    svg = re.sub(r'<metadata>.*?</metadata>\s*', '', svg, flags=re.S)
    svg = re.sub(r'<\?xml[^>]*\?>\s*', '', svg)
    svg = re.sub(r'<!DOCTYPE[^>]*>\s*', '', svg)

    def px(m):
        return f'{m.group(1)}="{round(float(m.group(2)) * 100 / 72)}"'
    head_end = svg.index('>', svg.index('<svg')) + 1
    head = re.sub(r'\b(width|height)="([\d.]+)pt"', px, svg[:head_end])
    head = head.replace('<svg ', '<svg role="img" ', 1)
    body = svg[head_end:]

    def rnd(m):
        v = round(float(m.group(0)), 2)
        s = f'{v:.2f}'.rstrip('0').rstrip('.')
        return '0' if s in ('-0', '') else s
    body = re.sub(r'-?\d+\.\d{3,}', rnd, body)
    from html import escape
    return head + f'<title>{escape(title)}</title>' + body


def targets(args):
    mods = sorted(os.path.basename(p)[5:7] for p in glob.glob(os.path.join(HERE, 'figs_[0-9][0-9].py')))
    if not args:
        return mods, None
    want_mods, want_ids = set(), set()
    for a in args:
        if re.fullmatch(r'\d{1,2}', a):
            want_mods.add(a.zfill(2))
        elif re.fullmatch(r'fig-\d\d-\d+', a):
            want_mods.add(a[4:6])
            want_ids.add(a)
        else:
            sys.exit(f'not a module number or figure id: {a}')
    return sorted(want_mods), want_ids or None


def main():
    argv = [a for a in sys.argv[1:] if a != '--png']
    png = '--png' in sys.argv
    mods, ids = targets(argv)
    os.makedirs(OUT_SVG, exist_ok=True)
    count = 0
    for m in mods:
        mod = importlib.import_module(f'figs_{m}')
        for fid, fn in mod.FIGURES.items():
            if ids and fid not in ids:
                continue
            fig = fn('en')
            title = (fn.__doc__ or fid).strip().split('\n')[0]
            path = os.path.join(OUT_SVG, f'{fid}.svg')
            fig.savefig(path, format='svg', bbox_inches='tight', pad_inches=0.06, metadata={'Date': None})
            with open(path, encoding='utf-8') as f:
                svg = clean(f.read(), title)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(svg)
            msg = f'wrote src/figures/en/{fid}.svg ({len(svg) // 1024} KB)'
            if png:
                os.makedirs(OUT_PNG, exist_ok=True)
                fig.savefig(os.path.join(OUT_PNG, f'{fid}.png'), format='png', dpi=200, bbox_inches='tight', pad_inches=0.06)
                msg += f' and out/figs/{fid}.png'
            plt.close(fig)
            print(msg)
            count += 1
    if ids:
        missing = ids - {f for m in mods for f in importlib.import_module(f'figs_{m}').FIGURES}
        for f in sorted(missing):
            print(f'no such figure: {f}')
    print(f'{count} figure(s) drawn')


if __name__ == '__main__':
    main()
