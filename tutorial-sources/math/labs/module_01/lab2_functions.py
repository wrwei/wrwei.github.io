"""Compare four functions and write an SVG plot using only the standard library.

Run: python lab2_functions.py
Optional: python lab2_functions.py --output functions.svg
"""
import argparse
from html import escape
import math
from pathlib import Path


def logarithm(x):
    if x <= 0:
        raise ValueError("ln(x) requires x > 0")
    return math.log(x)


FUNCTIONS = [("2*x+1", lambda x: 2 * x + 1, "#2563eb"),
             ("x*x", lambda x: x * x, "#7e22ce"),
             ("2**x", lambda x: 2 ** x, "#15803d"),
             ("ln(x)", logarithm, "#c2410c")]


def make_plot(destination):
    width, height = 760, 420
    left, right, top, bottom = 60, 720, 45, 335
    x_min, x_max, y_min, y_max = -2, 4, -4, 18
    def px(x):
        return left + (x - x_min) / (x_max - x_min) * (right - left)
    def py(y):
        return bottom - (y - y_min) / (y_max - y_min) * (bottom - top)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
             '<title id="title">Four functions over stated domains</title>',
             '<desc id="desc">Linear, square, exponential and natural logarithm. The logarithm has no curve at nonpositive inputs. All curves share the same axes.</desc>',
             '<rect width="760" height="420" fill="white"/>',
             '<g font-family="sans-serif" font-size="13" fill="#475569">']
    for x in range(-2, 5):
        parts.append(f'<path d="M{px(x):.2f},{top} V{bottom}" stroke="#e2e8f0"/>')
        parts.append(f'<text x="{px(x):.2f}" y="355" text-anchor="middle">{x}</text>')
    for y in range(-4, 19, 2):
        parts.append(f'<path d="M{left},{py(y):.2f} H{right}" stroke="#e2e8f0"/>')
        parts.append(f'<text x="48" y="{py(y)+4:.2f}" text-anchor="end">{y}</text>')
    parts.extend([f'<path d="M{left},{py(0):.2f} H{right} M{px(0):.2f},{top} V{bottom}" stroke="#475569"/>',
                  '<text x="735" y="355">x</text><text x="35" y="30">y</text></g>'])
    for index, (label, function, colour) in enumerate(FUNCTIONS):
        commands = []
        connected = False
        for step in range(601):
            x = x_min + step * (x_max - x_min) / 600
            try:
                y = function(x)
            except ValueError:
                connected = False
                continue
            if not y_min <= y <= y_max:
                connected = False
                continue
            commands.append(f'{"L" if connected else "M"}{px(x):.2f},{py(y):.2f}')
            connected = True
        parts.append(f'<path d="{" ".join(commands)}" fill="none" stroke="{colour}" stroke-width="2.5"/>')
        legend_x = 70 + index * 170
        parts.append(f'<path d="M{legend_x},387 h20" stroke="{colour}" stroke-width="3"/>')
        parts.append(f'<text x="{legend_x+27}" y="391" font-family="monospace" font-size="14">{escape(label)}</text>')
    parts.append('</svg>')
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text('\n'.join(parts), encoding='utf-8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, default=Path('functions.svg'))
    args = parser.parse_args()
    print('x      2*x+1      x*x      2**x      ln(x)')
    for x in (-2, -1, 0, 1, 2, 4):
        values = []
        for _, function, _ in FUNCTIONS:
            try:
                values.append(f'{function(x):9.4f}')
            except ValueError:
                values.append('undefined')
        print(f'{x:2d} ' + ' '.join(values))
    f = lambda x: 2 * x + 1
    g = lambda x: x * x
    assert f(g(3)) == 19 and g(f(3)) == 49
    print(f'f(g(3))={f(g(3))}; g(f(3))={g(f(3))}')
    assert math.isclose(logarithm(4) / logarithm(2), 2.0)
    try:
        logarithm(0)
    except ValueError as error:
        print(f'domain check: {error}')
    else:
        raise AssertionError('zero must be rejected')
    make_plot(args.output)
    print(f'Plot written: {args.output.name}')
