"""Figures of Module 14: Sequences and series."""
import math

import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def fig_14_1(L):
    """The limit of a sequence: the terms of a_n = 1 + (-1)^n/n enter the band from 1 - 0.25 to 1 + 0.25 after the fourth."""
    fig, ax = figure(7.6, 3.8)
    a = lambda n: 1 + (-1) ** n / n
    eps, Nn, top = 0.25, 4, 20
    math_axes(ax, (0, 21.2), (-0.2, 1.8), xlabel='$n$', ylabel='$a_n$', xticks=[1, 4, 10, 15, 20],
              yticks=[(0.75, '0.75'), (1, '1'), (1.25, '1.25'), (1.5, '1.5')])
    ax.axhspan(1 - eps, 1 + eps, color=C['orangel'], alpha=0.75, zorder=1, lw=0)
    for y in (1 - eps, 1 + eps):
        ax.plot([0, 21.2], [y, y], color=C['orange'], lw=1.0, zorder=2)
    ax.plot([0, 21.2], [1, 1], color=C['slate'], lw=1.2, ls=(0, (5, 3)), zorder=2)
    ax.plot([Nn, Nn], [-0.2, 1.8], color=C['green'], lw=1.3, ls=(0, (4, 3)), zorder=2)
    label(ax, Nn + 0.25, 1.68, r'$N = 4$', color=C['green'], size=12)
    for n in range(1, top + 1):
        inside = n > Nn
        dot(ax, n, a(n), color=C['green'] if inside else C['navy'], size=7 if inside else 7.5)
    label(ax, 12.0, 1.38, r'$1 + \varepsilon = 1.25$', color=C['orange'], size=11)
    label(ax, 12.0, 0.62, r'$1 - \varepsilon = 0.75$', color=C['orange'], size=11)
    label(ax, 0.35, 1.07, r'limit $L = 1$', color=C['slate'], size=11)
    label(ax, 1.4, 0.13, r'$a_1 = 0$', color=C['navy'], size=11)
    label(ax, 2.0, 1.64, r'$a_2 = 1.5$', color=C['navy'], size=11, ha='center')
    return fig


def fig_14_2(L):
    """The recursion a(n+1) = sqrt(2 + a(n)) from a(1) = 1: a cobweb diagram, and the terms increasing towards 2."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7, gridspec_kw={'width_ratios': [1, 1.15]})
    g = lambda x: math.sqrt(2 + x)
    terms = [1.0]
    for _ in range(9):
        terms.append(g(terms[-1]))

    math_axes(a1, (0, 2.75), (0, 2.75), xlabel='$x$', ylabel='$y$', xticks=[1, 2], yticks=[1, 2], aspect='equal')
    a1.plot([0, 2.75], [0, 2.75], color=C['slate'], lw=1.4, zorder=3)
    plot_fn(a1, g, 0, 2.75)
    # The cobweb: up from (a1, 0) to the curve, then across to the line, up to the curve, ...
    xs, ys = [terms[0], terms[0]], [0, terms[1]]
    for k in range(1, 7):
        xs += [terms[k], terms[k]]
        ys += [terms[k], terms[k + 1]]
    a1.plot(xs, ys, color=C['orange'], lw=1.5, zorder=4)
    for k, name, ha, dx in ((0, '$a_1$', 'left', 0.06), (1, '$a_2$', 'right', -0.04), (2, '$a_3$', 'left', 0.04)):
        a1.plot([terms[k], terms[k]], [0, 0.07], color=C['orange'], lw=1.5, zorder=4)
        label(a1, terms[k] + dx, 0.17, name, color=C['orange'], ha=ha, size=11)
    dot(a1, 2, 2, color=C['green'], size=7)
    label(a1, 1.96, 2.33, r'$(2, 2)$', color=C['green'], ha='right', size=11)
    label(a1, 0.1, 1.2, r'$y = \sqrt{2 + x}$', color=C['blue'], size=11)
    label(a1, 2.05, 2.62, r'$y = x$', color=C['slate'], size=11, ha='left')
    title(a1, 'Cobweb diagram')

    math_axes(a2, (0, 9.6), (0.8, 2.25), xlabel='$n$', ylabel='$a_n$', xticks=[1, 2, 3, 4, 5, 6, 7, 8],
              yticks=[1, 1.5, 2])
    a2.plot([0, 9.6], [2, 2], color=C['green'], lw=1.3, ls=(0, (5, 3)), zorder=2)
    for n in range(1, 9):
        dot(a2, n, terms[n - 1], color=C['orange'], size=7)
    label(a2, 5.6, 2.1, 'limit 2', color=C['green'], size=11)
    label(a2, 1.25, 0.95, r'$a_1 = 1$', color=C['orange'], size=11)
    title(a2, 'The terms')
    fig.tight_layout(w_pad=2.2)
    return fig


def fig_14_3(L):
    """Halving a square: pieces of area 1/2, 1/4, 1/8, ... fill a square of area 1; the partial sums approach 1."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.6, gridspec_kw={'width_ratios': [1, 1.25]})
    import matplotlib.patches as mp

    a1.set_xlim(-0.04, 1.04)
    a1.set_ylim(-0.04, 1.04)
    a1.set_aspect('equal')
    a1.axis('off')
    # Cut the remaining rectangle in half, alternately with a vertical and a horizontal cut; keep one half.
    x0, y0, w, h = 0.0, 0.0, 1.0, 1.0
    fills = [C['skyl'], C['amberl'], C['greenl'], C['purplel'], C['orangel'], C['teall']]
    names = [r'$\frac{1}{2}$', r'$\frac{1}{4}$', r'$\frac{1}{8}$', r'$\frac{1}{16}$', r'$\frac{1}{32}$']
    for k in range(12):
        if k % 2 == 0:            # vertical cut: keep the left half
            piece = (x0, y0, w / 2, h)
            x0, w = x0 + w / 2, w / 2
        else:                     # horizontal cut: keep the top half
            piece = (x0, y0 + h / 2, w, h / 2)
            h = h / 2
        a1.add_patch(mp.Rectangle(piece[:2], piece[2], piece[3], facecolor=fills[k % len(fills)],
                                  edgecolor=C['navy'], lw=1.0, zorder=2))
        if k < len(names):
            size = [20, 17, 15, 12, 10][k]
            label(a1, piece[0] + piece[2] / 2, piece[1] + piece[3] / 2, names[k], ha='center', size=size, halo=False)
    a1.add_patch(mp.Rectangle((0, 0), 1, 1, facecolor='none', edgecolor=C['navy'], lw=1.6, zorder=3))
    title(a1, 'Area 1, cut in halves', pad=10)

    math_axes(a2, (0, 10.8), (0, 1.22), xlabel='$N$', ylabel='$S_N$', xticks=[1, 2, 3, 4, 5, 10],
              yticks=[(0.5, '0.5'), (0.75, '0.75'), (1, '1')])
    a2.plot([0, 10.8], [1, 1], color=C['green'], lw=1.3, ls=(0, (5, 3)), zorder=2)
    for N in range(1, 11):
        dot(a2, N, 1 - 2.0 ** (-N), color=C['blue'], size=7)
    label(a2, 5.2, 1.1, 'sum = 1', color=C['green'], size=11)
    label(a2, 1.4, 0.45, r'$S_1 = \frac{1}{2}$', color=C['blue'], size=11)
    label(a2, 2.4, 0.68, r'$S_2 = \frac{3}{4}$', color=C['blue'], size=11)
    title(a2, r'Partial sums $S_N = 1 - 1/2^N$', pad=10)
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_14_4(L):
    """The integral test: rectangles under y = 1/x^2 (heights 1/2^2, ..., 1/6^2) and above y = 1/x (heights 1, ..., 1/5)."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.6)
    f = lambda x: 1 / x**2
    g = lambda x: 1 / x

    math_axes(a1, (0, 6.7), (0, 1.25), xticks=[1, 2, 3, 4, 5, 6], yticks=[0.5, 1])
    shade(a1, f, 1, 6, color=C['blue'], alpha=0.10)
    riemann(a1, f, 1, 6, 5, 'right', color=C['orange'], alpha=0.35, edge=C['orange'])
    plot_fn(a1, f, 0.88, 6.7)
    label(a1, 1.45, 0.9, r'$y = \dfrac{1}{x^2}$', color=C['blue'], size=12)
    label(a1, 2.7, 0.42, r'$\frac{1}{2^2} + \cdots + \frac{1}{6^2} < \int_1^6 \frac{dx}{x^2}$', color=C['navy'], size=11)
    title(a1, 'Rectangles under the curve')

    math_axes(a2, (0, 6.7), (0, 1.25), xticks=[1, 2, 3, 4, 5, 6], yticks=[0.5, 1])
    riemann(a2, g, 1, 6, 5, 'left', color=C['orange'], alpha=0.30, edge=C['orange'])
    shade(a2, g, 1, 6, color=C['blue'], alpha=0.14)
    plot_fn(a2, g, 0.82, 6.7)
    label(a2, 2.15, 0.98, r'$y = \dfrac{1}{x}$', color=C['blue'], size=12)
    label(a2, 2.35, 0.72, r'$1 + \frac{1}{2} + \cdots + \frac{1}{5} > \int_1^6 \frac{dx}{x}$', color=C['navy'], size=11)
    title(a2, 'Rectangles above the curve')
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_14_5(L):
    """The partial sums of the alternating harmonic series zigzag around ln 2: the odd ones decrease, the even ones increase."""
    fig, ax = figure(7.6, 3.7)
    top = 20
    S, s = [], 0.0
    for n in range(1, top + 1):
        s += (-1) ** (n - 1) / n
        S.append(s)
    math_axes(ax, (0, 21.2), (0.4, 1.06), xlabel='$N$', ylabel='$S_N$', xticks=[1, 2, 5, 10, 15, 20],
              yticks=[(0.5, '0.5'), (math.log(2), r'$\ln 2$'), (0.8, '0.8'), (1, '1')])
    ax.plot([0, 21.2], [math.log(2), math.log(2)], color=C['green'], lw=1.3, ls=(0, (5, 3)), zorder=2)
    ax.plot(range(1, top + 1), S, color=C['muted'], lw=1.0, zorder=3)
    for n in range(1, top + 1):
        dot(ax, n, S[n - 1], color=C['blue'] if n % 2 else C['orange'], size=7)
    label(ax, 3.4, 0.95, r'odd $N$: $S_1 > S_3 > S_5 > \cdots$', color=C['blue'], size=11)
    label(ax, 3.4, 0.47, r'even $N$: $S_2 < S_4 < S_6 < \cdots$', color=C['orange'], size=11)
    label(ax, 12.0, 0.93, r'dashed: the sum, $\ln 2$', color=C['green'], size=11)
    return fig


FIGURES = {'fig-14-1': fig_14_1, 'fig-14-2': fig_14_2, 'fig-14-3': fig_14_3, 'fig-14-4': fig_14_4, 'fig-14-5': fig_14_5}
