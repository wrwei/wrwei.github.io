"""Draw the Formal Methods series' figures in English and Chinese.

    python3 -I src/figures/_gen/figs.py            all figures, both languages
    python3 -I src/figures/_gen/figs.py fig-05-2   one figure

Each module's figures are in figs_NN.py, which defines functions fig_NN_k(lang) -> SVG and a dict
FIGURES {id: function}; figlib.py has the shared style and primitives. Writes src/figures/<lang>/<id>.svg.
"""
import glob
import importlib
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FIGS = os.path.dirname(HERE)
sys.path.insert(0, HERE)


def all_figures():
    figures = {}
    for f in sorted(glob.glob(os.path.join(HERE, 'figs_[0-9][0-9].py'))):
        mod = importlib.import_module(os.path.basename(f)[:-3])
        for fid, fn in mod.FIGURES.items():
            if fid in figures:
                raise SystemExit(f'{fid} is defined twice')
            figures[fid] = fn
    return figures


if __name__ == '__main__':
    FIGURES = all_figures()
    want = sys.argv[1:] or list(FIGURES)
    for fid in want:
        if fid not in FIGURES:
            raise SystemExit(f'no figure {fid}')
    for lang in ('en', 'zh'):
        os.makedirs(os.path.join(FIGS, lang), exist_ok=True)
        for fid in want:
            svg = FIGURES[fid](lang).svg()
            with open(os.path.join(FIGS, lang, fid + '.svg'), 'w', encoding='utf-8') as f:
                f.write(svg)
    print(f'wrote {len(want)} figure(s) in en and zh')
