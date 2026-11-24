"""Figures of Module 3: Continuity and infinity."""
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def vline(ax, x, y0, y1, color=None):
    """A dashed vertical line from (x, y0) to (x, y1): an asymptote or a guide."""
    ax.plot([x, x], [y0, y1], ls=(0, (4, 3)), color=color or C['slate'], lw=1.2, zorder=3)


def fig_03_1(L):
    """Four kinds of discontinuity at x = 2: removable, jump, infinite and oscillating."""
    fig, ax = figure_grid(2, 2, w=7.6, h=4.5)
    ticks = dict(xticks=[1, 2, 3], xlabel='$x$', ylabel='$y$')

    # Removable: (x^2 - 4)/(x - 2) is x + 2 except at 2, where g(2) = 1 (Example 3.1(b)).
    a = ax[0]
    math_axes(a, (-0.5, 4.2), (-0.8, 6.8), yticks=[4, 6], **ticks)
    plot_fn(a, lambda x: x + 2, -0.4, 4.1, breaks=[2])
    dot(a, 2, 4, hollow=True)
    dot(a, 2, 1)
    vline(a, 2, 0, 4)
    label(a, 2.25, 4.0, 'limit 4', size=10.5, color=C['slate'], va='top')
    label(a, 2.25, 1.0, r'$g(2) = 1$', size=10.5)
    title(a, 'removable', size=11.5, pad=16)

    # Jump: x^2 for x < 2, 5 - x for x >= 2 (Example 3.1(d)).
    a = ax[1]
    math_axes(a, (-0.5, 4.2), (-0.8, 6.8), yticks=[2, 4, 6], **ticks)
    plot_fn(a, lambda x: x**2, -0.4, 2)
    plot_fn(a, lambda x: 5 - x, 2, 4.1)
    dot(a, 2, 4, hollow=True)
    dot(a, 2, 3)
    vline(a, 2, 0, 3)
    label(a, 1.85, 4.45, 'from the left: 4', size=10.5, color=C['slate'], ha='right')
    label(a, 2.3, 3.75, 'from the right: 3', size=10.5, color=C['slate'])
    title(a, 'jump', size=11.5, pad=16)

    # Infinite: 1/(x - 2)^2, with the vertical asymptote x = 2.
    a = ax[2]
    math_axes(a, (-0.5, 4.2), (-0.8, 6.8), yticks=[2, 4, 6], **ticks)
    vline(a, 2, 0, 6.8)
    plot_fn(a, lambda x: 1 / (x - 2)**2, -0.4, 4.1, breaks=[2])
    label(a, 2.75, 4.6, r'$y = \frac{1}{(x - 2)^2}$', size=11.5, color=C['blue'])
    title(a, 'infinite', size=11.5, pad=16)

    # Oscillating: sin(1/(x - 2)), drawn along x = 2 +- 1/u so that every swing is resolved.
    a = ax[3]
    math_axes(a, (-0.5, 4.2), (-1.7, 1.9), yticks=[-1, 1], xticks=[(1, '1'), (2, ''), (3, '3')], xlabel='$x$', ylabel='$y$')
    for side in (1, -1):
        plot_param(a, lambda u, s=side: 2 + s / u, lambda u, s=side: np.sin(s * u), 0.4, 320, n=9000,
                   color=C['blue'], lw=1.3)
    label(a, 2, -1.38, '2', size=10, color=C['slate'], ha='center')   # below the swings, which hide the usual place
    label(a, 2.75, 1.42, r'$y = \sin\frac{1}{x - 2}$', size=11.5, color=C['blue'])
    title(a, 'oscillating', size=11.5, pad=16)

    fig.tight_layout(h_pad=1.4, w_pad=2.0)
    return fig


def fig_03_2(L):
    """The Intermediate Value Theorem: a continuous graph must cross the level N; a graph with a jump can skip it."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.6)
    A, B, N = 0.6, 4.2, 4.0

    f = lambda x: (x - 1.2) * (x - 2.5) * (x - 3.6) + 4
    ylab = [(f(A), r'$f(a)$'), (N, r'$N$'), (f(B), r'$f(b)$')]
    math_axes(a1, (-0.3, 4.9), (-0.8, 7.9), xticks=[(A, r'$a$'), (B, r'$b$')], yticks=ylab)
    a1.plot([0, 4.9], [N, N], color=C['orange'], lw=1.5, ls=(0, (5, 3)), zorder=3)
    plot_fn(a1, f, A, B)
    dot(a1, A, f(A), size=6)
    dot(a1, B, f(B), size=6)
    for k, c in enumerate((1.2, 2.5, 3.6), start=1):
        guide(a1, x=c, upto=N)
        dot(a1, c, N, color=C['orange'], size=6)
        label(a1, c + (0.12 if k != 2 else -0.12), N + (0.45 if k != 2 else -0.5), f'$c_{k}$', size=11,
              color=C['orange'], ha='left' if k != 2 else 'right')
    label(a1, 4.5, N + 0.45, r'$y = N$', size=11, color=C['orange'], ha='center')
    title(a1, r'continuous on $[a, b]$')

    g1 = lambda x: 2.5 + 0.4 * x
    g2 = lambda x: 5.0 + 0.5 * (x - 2.4)
    ylab = [(g1(A), r'$f(a)$'), (N, r'$N$'), (g2(B), r'$f(b)$')]
    math_axes(a2, (-0.3, 4.9), (-0.8, 7.9), xticks=[(A, r'$a$'), (B, r'$b$')], yticks=ylab)
    a2.plot([0, 4.9], [N, N], color=C['orange'], lw=1.5, ls=(0, (5, 3)), zorder=3)
    plot_fn(a2, g1, A, 2.4)
    plot_fn(a2, g2, 2.4, B)
    dot(a2, A, g1(A), size=6)
    dot(a2, B, g2(B), size=6)
    dot(a2, 2.4, g1(2.4), hollow=True)
    dot(a2, 2.4, g2(2.4))
    label(a2, 2.4, 1.5, 'no $c$ with $f(c) = N$', size=11, color=C['slate'], ha='center', va='center')
    label(a2, 4.5, N + 0.45, r'$y = N$', size=11, color=C['orange'], ha='center')
    title(a2, r'a jump inside $[a, b]$')
    fig.tight_layout(w_pad=2.5)
    return fig


def fig_03_3(L):
    """The bisection method for x^2 - 2 on [1, 2]: each bracket is half of the one before and still contains the root."""
    import matplotlib.pyplot as plt
    fig, (a1, a2) = plt.subplots(2, 1, figsize=(7.6, 4.4), gridspec_kw={'height_ratios': [1.25, 1]})
    f = lambda x: x**2 - 2
    r = np.sqrt(2)

    math_axes(a1, (0.72, 2.2), (-1.4, 2.6), xticks=[1, 1.25, 1.5, 1.75, 2], yticks=[-1, 1, 2])
    plot_fn(a1, f, 0.75, 2.12)
    dot(a1, 1, f(1), size=6)
    dot(a1, 2, f(2), size=6)
    dot(a1, r, 0, color=C['orange'], size=6)
    label(a1, r - 0.03, 0.5, r'$\sqrt{2}$', color=C['orange'], ha='right', size=12)
    label(a1, 0.96, -0.62, r'$f(1) = -1$', size=11, ha='right')
    label(a1, 1.96, 2.0, r'$f(2) = 2$', size=11, ha='right')
    label(a1, 1.7, 1.45, r'$y = x^2 - 2$', color=C['blue'], size=12, ha='right')

    # The brackets [a_n, b_n], n = 0..6, one row each, with the root's position dashed through them.
    a, b = 1.0, 2.0
    a2.set_xlim(0.72, 2.2)
    a2.set_ylim(-6.7, 0.7)
    a2.axis('off')
    a2.plot([r, r], [-6.5, 0.5], ls=(0, (4, 3)), color=C['orange'], lw=1.2, zorder=1)
    for n in range(7):
        y = -n
        a2.plot([a, b], [y, y], color=C['blue'], lw=5, solid_capstyle='butt', alpha=0.85, zorder=3)
        a2.plot([a, a], [y - 0.28, y + 0.28], color=C['navy'], lw=1.6, zorder=4)
        a2.plot([b, b], [y - 0.28, y + 0.28], color=C['navy'], lw=1.6, zorder=4)
        label(a2, 0.97, y, f'$n = {n}$', size=11, ha='right')
        m = (a + b) / 2
        if f(m) * f(a) > 0:
            a = m
        else:
            b = m
    label(a2, 2.03, 0, r'$[1, 2]$', size=11)
    label(a2, 1.45, -6, r'$[1.40625, 1.421875]$', size=11)
    fig.tight_layout(h_pad=0.6)
    return fig


def fig_03_4(L):
    """The Extreme Value Theorem and two ways it fails: an open interval, and a discontinuity."""
    fig, ax = figure_grid(1, 3, w=7.6, h=3.1)

    a = ax[0]
    f = lambda x: x**2 - 4 * x + 1
    math_axes(a, (-0.6, 3.6), (-3.9, 2.3), xticks=[1, 2, 3], yticks=[-3, -2, -1, 1])
    plot_fn(a, f, 0, 3)
    dot(a, 0, f(0), color=C['green'])
    dot(a, 3, f(3), size=6)
    dot(a, 2, f(2), color=C['orange'])
    label(a, 0.22, f(0) + 0.12, 'max 1', color=C['green'], size=11)
    label(a, 2, f(2) - 0.42, 'min $-3$', color=C['orange'], size=11, ha='center')
    title(a, 'continuous, closed', size=11.5)

    a = ax[1]
    math_axes(a, (-0.35, 1.45), (-0.35, 1.45), xticks=[1], yticks=[1])
    plot_fn(a, lambda x: x, 0, 1)
    dot(a, 0, 0, hollow=True)
    dot(a, 1, 1, hollow=True)
    label(a, 0.5, 1.05, 'no max,\nno min', color=C['slate'], size=11, ha='center')
    title(a, 'open interval', size=11.5)

    a = ax[2]
    math_axes(a, (-0.35, 1.45), (-0.35, 1.45), xticks=[1], yticks=[1])
    plot_fn(a, lambda x: x, 0, 1)
    dot(a, 0, 0)
    dot(a, 1, 1, hollow=True)
    dot(a, 1, 0)
    label(a, 0.5, 1.05, 'no max', color=C['slate'], size=11, ha='center')
    a.tick_params(axis='x', pad=9)
    title(a, 'not continuous', size=11.5)
    fig.tight_layout(w_pad=1.6)
    return fig


def fig_03_5(L):
    """Asymptotes: a vertical and a horizontal asymptote with a hole, and an oblique asymptote."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7)

    r = lambda x: (x + 2) / (x + 1)
    math_axes(a1, (-5.2, 5.2), (-4.5, 6.2), xticks=[-4, 2, 4], yticks=[-4, -2, 4, 6])
    vline(a1, -1, -4.5, 6.2)
    a1.plot([-5.2, 5.2], [1, 1], ls=(0, (4, 3)), color=C['slate'], lw=1.2, zorder=3)
    plot_fn(a1, r, -5.2, 5.2, breaks=[-1, 2])
    dot(a1, 2, 4 / 3, hollow=True)
    label(a1, 2.1, 2.15, r'hole $(2, \frac{4}{3})$', size=11)
    label(a1, -1.15, 5.4, r'$x = -1$', size=11, color=C['slate'], ha='right')
    label(a1, 5.1, 0.55, r'$y = 1$', size=11, color=C['slate'], ha='right')
    title(a1, r'$y = \frac{x^2 - 4}{x^2 - x - 2}$', pad=34)

    f = lambda x: (x**2 + 1) / (x - 1)
    math_axes(a2, (-5.2, 6.2), (-9, 13), xticks=[-4, 2, 4], yticks=[-8, -4, 4, 8, 12])
    vline(a2, 1, -9, 13)
    a2.plot([-5.2, 6.2], [-4.2, 7.2], ls=(0, (4, 3)), color=C['orange'], lw=1.3, zorder=3)
    plot_fn(a2, f, -5.2, 6.2, breaks=[1])
    label(a2, 1.25, -7.5, r'$x = 1$', size=11, color=C['slate'])
    label(a2, 3.9, 3.3, r'$y = x + 1$', size=11, color=C['orange'])
    title(a2, r'$y = \frac{x^2 + 1}{x - 1}$', pad=34)
    fig.tight_layout(w_pad=2.5)
    return fig


FIGURES = {'fig-03-1': fig_03_1, 'fig-03-2': fig_03_2, 'fig-03-3': fig_03_3, 'fig-03-4': fig_03_4, 'fig-03-5': fig_03_5}
