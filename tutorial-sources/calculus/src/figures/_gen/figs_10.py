"""Figures of Module 10: The Fundamental Theorem of Calculus."""
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def signed_shade(ax, f, a, b, n=800, alpha=0.3):
    """Shade between y = f(x) and the x-axis for a <= x <= b: blue where f > 0, orange where f < 0."""
    xs = np.linspace(a, b, n)
    ys = np.array([f(x) for x in xs], dtype=float)
    ax.fill_between(xs, 0, ys, where=ys >= 0, interpolate=True, color=C['blue'], alpha=alpha, linewidth=0, zorder=2)
    ax.fill_between(xs, 0, ys, where=ys <= 0, interpolate=True, color=C['orange'], alpha=alpha, linewidth=0, zorder=2)


def fig_10_1(L):
    """The antiderivatives x^3/3 - x + C of f(x) = x^2 - 1: vertical shifts of one curve, with parallel tangents."""
    fig, ax = figure(7.6, 4.0)
    F = lambda x, c: x**3 / 3 - x + c
    f = lambda x: x**2 - 1
    math_axes(ax, (-2.7, 2.7), (-3.7, 3.9), xticks=[-2, -1, 1, 2], yticks=[-3, -2, -1, 1, 2, 3])
    x0 = 1.5
    # The grey curves go below the axis layer, so that the tick labels (with their white halo) stay readable.
    for c in (-2, -1, 0, 2):
        plot_fn(ax, lambda x, c=c: F(x, c), -2.7, 2.7, color=C['muted'], lw=1.8, zorder=0.4)
    plot_fn(ax, lambda x: F(x, 1), -2.7, 2.7, color=C['blue'], lw=2.6, zorder=5)
    for c in (-2, -1, 0, 1, 2):
        tangent(ax, lambda x, c=c: F(x, c), x0, (x0 - 0.42, x0 + 0.42), df=f, color=C['orange'], lw=2.0)
        dot(ax, x0, F(x0, c), color=C['orange'], size=5)
    dot(ax, 0, 1, color=C['navy'])
    label(ax, 0.13, 1.42, r'$(0, 1)$', ha='left', size=11)
    label(ax, -2.62, 3.35, r'$y = x^3/3 - x + 1$', color=C['blue'], size=12)
    label(ax, 1.95, -2.75, 'slope 1.25 at $x = 1.5$', color=C['orange'], size=11, ha='left')
    return fig


# The function of Example 10.5 and its area function from 0, both built from straight pieces.
def f_pw(t):
    if t <= 2:
        return 2.0
    if t <= 4:
        return 6 - 2 * t
    return t - 6


def A_pw(x):
    if x <= 2:
        return 2 * x
    if x <= 4:
        return 6 * x - x**2 - 4
    return x**2 / 2 - 6 * x + 20


def fig_10_2(L):
    """The area function A(x) of a function made of straight pieces: A rises where f > 0 and falls where f < 0."""
    fig, (a1, a2) = figure_grid(2, 1, w=7.6, h=4.5, gridspec_kw={'height_ratios': [1, 1.15]})
    # Top: f with the signed area from 0 to 5.
    # The top panel has no labels on its t-axis: the shading would cover them, and the panel below,
    # with the same scale, is labelled.
    math_axes(a1, (-0.3, 6.9), (-2.7, 3.0), xlabel='$t$', ylabel='$y$', xticks=[1, 2, 3, 4, 5, 6], yticks=[-2, -1, 1, 2])
    a1.set_xticklabels([])
    signed_shade(a1, f_pw, 0, 5)
    plot_fn(a1, f_pw, 0, 6, color=C['navy'], lw=2.2)
    a1.plot([5, 5], [0, f_pw(5)], color=C['slate'], lw=1.2, ls=(0, (4, 3)), zorder=3)
    label(a1, 1.4, 1.0, 'area 5', color=C['blue'], size=11, ha='center')
    label(a1, 4.05, -0.95, r'area $-2.5$', color=C['orange'], size=11, ha='center')
    label(a1, 5.6, 1.55, r'$y = f(t)$', color=C['navy'], size=12, ha='center')
    label(a1, 6.15, -1.25, 'not yet\nincluded', color=C['slate'], size=10, ha='left')
    # Bottom: the area function, with its tangent at x = 5 (slope f(5) = -1).
    math_axes(a2, (-0.3, 6.9), (-0.9, 6.1), xlabel='$x$', ylabel='$A(x)$', xticks=[1, 2, 3, 4, 5, 6], yticks=[1, 2, 3, 4, 5])
    plot_fn(a2, A_pw, 0, 6, color=C['green'], lw=2.4)
    tangent(a2, A_pw, 5, (4.1, 5.85), df=f_pw, color=C['purple'], lw=1.8, ls=(0, (5, 3)))
    for k in range(7):
        dot(a2, k, A_pw(k), color=C['green'], size=5)
    dot(a2, 5, A_pw(5), color=C['navy'], size=7)
    label(a2, 5.12, 3.0, r'$A(5) = 2.5$', size=11, ha='left')
    label(a2, 4.1, 1.35, r'slope $f(5) = -1$', color=C['purple'], size=11, ha='left')
    label(a2, 3.0, 5.55, r'largest: $A(3) = 5$', size=11, ha='center')
    label(a2, 0.72, 2.3, r'slope $2$', color=C['slate'], size=11, ha='right')
    fig.tight_layout(h_pad=0.6)
    return fig


def fig_10_3(L):
    """The proof of Part 1: the thin strip from x to x + h has the same area as a rectangle of height f(c)."""
    fig, ax = figure(7.6, 3.9)
    f = lambda t: 1.0 + 0.2 * t + 0.5 * np.sin(t - 1.0)
    a, x, h = 0.4, 1.8, 0.8
    # c in [x, x + h] with f(c) = the average of f over [x, x + h] (f is increasing there): bisection.
    ts = np.linspace(x, x + h, 4001)
    avg = np.trapezoid([f(s) for s in ts], ts) / h
    lo, hi = x, x + h
    for _ in range(60):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if f(mid) < avg else (lo, mid)
    c = (lo + hi) / 2
    math_axes(ax, (-0.25, 3.9), (-0.45, 2.45), xlabel='$t$', ylabel='$y$',
              xticks=[(a, r'$a$'), (x, r'$x$'), (c, r'$c$'), (x + h, r'$x + h$')], yticks=[])
    shade(ax, f, a, x, color=C['sky'], alpha=0.22)
    shade(ax, f, x, x + h, color=C['blue'], alpha=0.35)
    ax.plot([x, x, x + h, x + h], [0, f(c), f(c), 0], color=C['orange'], lw=1.8, ls=(0, (5, 3)), zorder=5)
    plot_fn(ax, f, -0.1, 3.8, color=C['navy'], lw=2.4)
    a_line = ax.plot([c, c], [0, f(c)], color=C['orange'], lw=1.2, ls=(0, (2, 2)), zorder=5)
    dot(ax, c, f(c), color=C['orange'], size=6)
    label(ax, (a + x) / 2, 0.55, r'$A(x)$', color=C['sky'], size=13, ha='center')
    label(ax, x + h + 0.12, 0.62, r'$A(x + h) - A(x)$', color=C['blue'], size=12, ha='left')
    arrow(ax, x + h + 0.1, 0.62, x + h - 0.18, 0.62, color=C['blue'], lw=1.4, head=10)
    label(ax, x + h + 0.12, f(c) - 0.02, r'height $f(c)$', color=C['orange'], size=12, ha='left')
    label(ax, 3.3, f(3.3) + 0.27, r'$y = f(t)$', color=C['navy'], size=12, ha='center')
    ax.tick_params(axis='x', labelsize=13)
    del a_line
    return fig


def fig_10_4(L):
    """Displacement and distance for the velocity v(t) = 3t^2 - 12t + 9: signed area against total area."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.5)
    v = lambda t: 3 * t**2 - 12 * t + 9
    for ax, g, ttl in ((a1, v, 'velocity $v(t)$: displacement 4 m'), (a2, lambda t: abs(v(t)), r'speed $|v(t)|$: distance 12 m')):
        math_axes(ax, (-0.3, 4.6), (-4.2, 10.2), xlabel='$t$', ylabel='', xticks=[1, 2, 3, 4], yticks=[-3, 3, 6, 9])
        signed_shade(ax, g, 0, 4)
        plot_fn(ax, g, 0, 4, color=C['navy'], lw=2.2)
        title(ax, ttl, size=11.5, pad=10)
    label(a1, 0.37, 2.0, '4', color=C['blue'], size=13, ha='center')
    label(a1, 2.0, -1.75, r'$-4$', color=C['orange'], size=13, ha='center')
    label(a1, 3.63, 2.0, '4', color=C['blue'], size=13, ha='center')
    for xp in (0.37, 2.0, 3.63):
        label(a2, xp, 1.1, '4', color=C['blue'], size=13, ha='center')
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_10_5(L):
    """Substitution changes the region, not its area: u = x^2 turns the area under 2x sin(x^2) into the area under sin u."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)
    g = lambda x: 2 * x * np.sin(x**2)
    r = np.sqrt(PI)
    # The same scales in both panels, so that the two areas can be compared by eye.
    xlim, ylim = (-0.25, 3.75), (-0.45, 2.9)
    math_axes(a1, xlim, ylim, xlabel='$x$', ylabel='$y$', xticks=[(1, r'$1$'), (r, r'$\sqrt{\pi}$'), (3, r'$3$')], yticks=[1, 2])
    shade(a1, g, 0, r, color=C['blue'], alpha=0.3)
    plot_fn(a1, g, 0, r, color=C['navy'], lw=2.2)
    label(a1, 1.12, 0.75, 'area 2', color=C['blue'], size=12, ha='center')
    title(a1, r'$y = 2x\sin(x^2)$, from $x = 0$ to $\sqrt{\pi}$', size=11.5, pad=14)
    math_axes(a2, xlim, ylim, xlabel='$u$', ylabel='$y$', xticks=[(1, r'$1$'), (PI / 2, r'$\pi/2$'), (PI, r'$\pi$')], yticks=[1, 2])
    shade(a2, np.sin, 0, PI, color=C['blue'], alpha=0.3)
    plot_fn(a2, np.sin, 0, PI, color=C['navy'], lw=2.2)
    label(a2, PI / 2, 0.45, 'area 2', color=C['blue'], size=12, ha='center')
    title(a2, r'$y = \sin u$, from $u = 0$ to $\pi$', size=11.5, pad=14)
    for ax in (a1, a2):
        ax.tick_params(axis='x', labelsize=12)
    fig.tight_layout(w_pad=2.0)
    return fig


FIGURES = {'fig-10-1': fig_10_1, 'fig-10-2': fig_10_2, 'fig-10-3': fig_10_3, 'fig-10-4': fig_10_4, 'fig-10-5': fig_10_5}
