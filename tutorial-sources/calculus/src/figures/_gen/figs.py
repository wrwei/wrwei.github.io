"""Draw the Calculus series' figures: src/figures/en/<id>.svg (and, with --png, out/figs/<id>.png).

    $CALC_PYTHON -I src/figures/_gen/figs.py                 every figure
    $CALC_PYTHON -I src/figures/_gen/figs.py 05              the figures of Module 5 (figs_05.py)
    $CALC_PYTHON -I src/figures/_gen/figs.py fig-05-2 --png  one figure, and a PNG preview to look at
    $CALC_PYTHON -I src/figures/_gen/figs.py --lang zh       draw figures with Chinese labels

Each figs_NN.py defines FIGURES = {'fig-NN-k': function}; a function takes the language and
returns a matplotlib figure drawn with the helpers of figstyle.py. Its docstring's first line is the
figure's accessible title. The SVG is cleaned (no metadata, coordinates rounded, size in px).
"""
import argparse
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
from matplotlib import font_manager  # noqa: E402
from matplotlib.text import Text  # noqa: E402


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
        v = round(float(m.group(0)), 1)
        s = f'{v:.1f}'.rstrip('0').rstrip('.')
        return '0' if s in ('-0', '') else s

    def compact(d):
        # 0.1 pt (0.14 px on the page) is far below what anyone can see; drop the spaces around commands.
        d = re.sub(r'-?\d+\.\d+', rnd, d)
        return re.sub(r'\s*([MLQCZz])\s*', r'\1', re.sub(r'\s+', ' ', d)).strip()
    # Round coordinates in path data only: other numbers (glyph scales such as scale(0.015625)) must stay exact.
    body = re.sub(r'(\sd=")([^"]*)(")', lambda m: m.group(1) + compact(m.group(2)) + m.group(3), body)
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


def chinese_labels():
    # SVGs embed glyph outlines, so readers can see the Chinese labels without installing a font.
    names = {font.name for font in font_manager.fontManager.ttflist}
    for family in ('Noto Sans CJK SC', 'Hiragino Sans GB', 'Heiti SC', 'Microsoft YaHei', 'Arial Unicode MS'):
        if family in names:
            with open(os.path.join(HERE, 'labels_zh.tsv'), encoding='utf-8') as source:
                labels = dict(line.rstrip('\n').split('\t', 1) for line in source if line.strip())
            return labels, family
    sys.exit('To draw Chinese figures, install a supported font such as Noto Sans CJK SC.')


def translate_labels(figure, labels, font):
    changed = False
    for text in figure.findobj(Text):
        original = text.get_text()
        translated = '\n'.join(labels.get(line, line) for line in original.split('\n'))
        if translated != original:
            text.set_text(translated)
            text.set_fontfamily([font, *text.get_fontfamily()])
            changed = True
    return changed


def main():
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument('targets', nargs='*')
    parser.add_argument('--png', action='store_true')
    parser.add_argument('--lang', choices=('en', 'zh'), default='en')
    args = parser.parse_args()
    mods, ids = targets(args.targets)
    svg_dir = OUT_SVG if args.lang == 'en' else os.path.join(ROOT, 'src', 'figures', 'zh')
    png_dir = OUT_PNG if args.lang == 'en' else os.path.join(OUT_PNG, 'zh')
    os.makedirs(svg_dir, exist_ok=True)
    if args.lang == 'zh':
        labels, font = chinese_labels()
    count = 0
    for m in mods:
        mod = importlib.import_module(f'figs_{m}')
        for fid, fn in mod.FIGURES.items():
            if ids and fid not in ids:
                continue
            fig = fn(args.lang)
            title = (fn.__doc__ or fid).strip().split('\n')[0]
            if args.lang == 'zh':
                if not translate_labels(fig, labels, font):
                    plt.close(fig)
                    continue
                _, mod_no, figure_no = fid.split('-')
                title = f'微积分图 {int(mod_no)}.{figure_no}'
            path = os.path.join(svg_dir, f'{fid}.svg')
            fig.savefig(path, format='svg', bbox_inches='tight', pad_inches=0.06, metadata={'Date': None})
            with open(path, encoding='utf-8') as f:
                svg = clean(f.read(), title)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(svg)
            msg = f'wrote {os.path.relpath(path, ROOT)} ({len(svg) // 1024} KB)'
            if args.png:
                os.makedirs(png_dir, exist_ok=True)
                preview = os.path.join(png_dir, f'{fid}.png')
                fig.savefig(preview, format='png', dpi=200, bbox_inches='tight', pad_inches=0.06)
                msg += f' and {os.path.relpath(preview, ROOT)}'
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
