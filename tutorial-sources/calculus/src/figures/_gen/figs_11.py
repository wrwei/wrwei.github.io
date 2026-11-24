"""Figures of Module 11: Techniques of integration."""
import math

import matplotlib
import mpmath
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)

E = np.e


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def fig_11_1(L):
    """Integration by parts as areas: the regions with areas int v du and int u dv fill a rectangle minus a smaller one."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.6)

    # Left: a general increasing curve from (u1, v1) to (u2, v2).
    g = lambda u: 0.55 + 0.22 * u**2          # v as a function of u, increasing for u > 0
    ginv = lambda v: np.sqrt((v - 0.55) / 0.22)
    u1, u2 = 1.0, 3.0
    v1, v2 = g(u1), g(u2)
    math_axes(a1, (-0.25, 3.75), (-0.3, 3.25), xlabel='$u$', ylabel='$v$',
              xticks=[(u1, r'$u_1$'), (u2, r'$u_2$')], yticks=[(v1, r'$v_1$'), (v2, r'$v_2$')])
    us = np.linspace(u1, u2, 400)
    a1.fill_between(us, 0, g(us), color=C['blue'], alpha=0.22, lw=0, zorder=2)
    vs = np.linspace(v1, v2, 400)
    a1.fill_betweenx(vs, 0, ginv(vs), color=C['orange'], alpha=0.25, lw=0, zorder=2)
    a1.add_patch(matplotlib.patches.Rectangle((0, 0), u1, v1, facecolor='none', edgecolor=C['slate'], lw=1.2,
                                              ls=(0, (3, 2.5)), zorder=3))
    a1.plot([0, u2, u2], [v2, v2, 0], color=C['slate'], lw=1.2, ls=(0, (4, 3)), zorder=3)
    plot_fn(a1, g, 0.6, 3.25, color=C['navy'], lw=2.2)
    dot(a1, u1, v1, color=C['navy'], size=6)
    dot(a1, u2, v2, color=C['navy'], size=6)
    label(a1, 2.05, 0.55, r'$\int v\,du$', color=C['blue'], size=13, ha='center')
    label(a1, 0.95, 2.05, r'$\int u\,dv$', color=C['orange'], size=13, ha='center')
    label(a1, u1 / 2, v1 / 2, r'$u_1v_1$', color=C['slate'], size=11, ha='center')
    title(a1, 'Any increasing curve')

    # Right: u = x, v = ln x for 1 <= x <= e.
    math_axes(a2, (-0.3, 3.55), (-0.25, 1.42), xlabel='$u$', ylabel='$v$',
              xticks=[(1, '$1$'), (E, '$e$')], yticks=[(1, '$1$')])
    us = np.linspace(1, E, 400)
    a2.fill_between(us, 0, np.log(us), color=C['blue'], alpha=0.22, lw=0, zorder=2)
    vs = np.linspace(0, 1, 400)
    a2.fill_betweenx(vs, 0, np.exp(vs), color=C['orange'], alpha=0.25, lw=0, zorder=2)
    a2.plot([0, E, E], [1, 1, 0], color=C['slate'], lw=1.2, ls=(0, (4, 3)), zorder=3)
    plot_fn(a2, np.log, 1.0, 3.4, color=C['navy'], lw=2.2)  # from u = 1: below the axis it would cross the tick label 1
    label(a2, 2.2, 0.28, r'$1$', color=C['blue'], size=13, ha='center')
    label(a2, 0.85, 0.55, r'$e - 1$', color=C['orange'], size=13, ha='center')
    label(a2, 2.95, 0.72, r'$v = \ln u$', color=C['navy'], size=12, ha='left')
    title(a2, 'The case $v = \\ln u$')
    fig.tight_layout(w_pad=2.0)
    return fig


def triangle(ax, adj, opp, sides, head):
    """A right triangle with the angle theta at the origin, the right angle at (adj, 0), and side labels
    sides = (hypotenuse, opposite, adjacent)."""
    hyp, op, ad = sides
    ax.fill([0, adj, adj], [0, 0, opp], color=C['skyp'], zorder=1)
    ax.plot([0, adj, adj, 0], [0, 0, opp, 0], color=C['navy'], lw=2.0, zorder=3, solid_joinstyle='round')
    s = 0.22                                                    # the right-angle mark
    ax.plot([adj - s, adj - s, adj], [0, s, s], color=C['navy'], lw=1.2, zorder=3)
    th = math.atan2(opp, adj)                                   # the angle theta, marked with an arc
    ts = np.linspace(0, th, 40)
    ax.plot(0.75 * np.cos(ts), 0.75 * np.sin(ts), color=C['orange'], lw=1.6, zorder=3)
    label(ax, 0.95 * math.cos(th / 2), 0.95 * math.sin(th / 2), r'$\theta$', color=C['orange'], size=13, ha='left')
    nx, ny = -math.sin(th), math.cos(th)                        # outward normal of the hypotenuse
    label(ax, adj / 2 + 0.32 * nx, opp / 2 + 0.32 * ny, hyp, size=13, ha='right', va='bottom')
    label(ax, adj + 0.12, opp / 2, op, size=13, ha='left')
    label(ax, adj / 2, -0.12, ad, size=13, ha='center', va='top')
    ax.set_xlim(-0.35, adj + 1.75)
    ax.set_ylim(-0.75, opp + 0.45)
    ax.set_aspect('equal')
    ax.axis('off')
    ax.set_title(head, fontsize=13, color=C['navy'], pad=6)


def fig_11_2(L):
    """The reference triangles of the substitutions x = a sin(theta), x = a tan(theta) and x = a sec(theta)."""
    fig, axs = figure_grid(1, 3, w=7.6, h=2.9)
    adj, opp = 2.6, 1.75
    triangle(axs[0], adj, opp, ('$a$', '$x$', r'$\sqrt{a^2 - x^2}$'), r'$x = a\,\sin\theta$')
    triangle(axs[1], adj, opp, (r'$\sqrt{a^2 + x^2}$', '$x$', '$a$'), r'$x = a\,\tan\theta$')
    triangle(axs[2], adj, opp, ('$x$', r'$\sqrt{x^2 - a^2}$', '$a$'), r'$x = a\,\sec\theta$')
    fig.tight_layout(w_pad=0.6)
    return fig


def fig_11_3(L):
    """Three integrands with no elementary antiderivative and their antiderivatives defined by integrals: erf, Si, Li."""
    fig, axs = figure_grid(1, 3, w=7.6, h=3.3)

    a = axs[0]
    math_axes(a, (-3.2, 3.2), (-1.15, 1.35), xticks=[-2, 2], yticks=[])
    a.plot([-3.2, 3.2], [math.sqrt(math.pi) / 2] * 2, color=C['muted'], lw=1.0, ls=(0, (3, 3)), zorder=1)
    label(a, 3.15, 1.1, r'$\frac{\sqrt{\pi}}{2}$', color=C['slate'], size=12, ha='right')
    plot_fn(a, lambda x: math.exp(-x * x), -3.2, 3.2, color=C['blue'])
    plot_fn(a, lambda x: math.sqrt(math.pi) / 2 * float(mpmath.erf(x)), -3.2, 3.2, n=400, color=C['orange'])
    label(a, -3.0, 0.32, r'$e^{-x^2}$', color=C['blue'], size=12)
    label(a, 0.35, -0.75, r'$\int_0^x e^{-t^2}dt$', color=C['orange'], size=11)
    title(a, r'$e^{-x^2}$ and $\frac{\sqrt{\pi}}{2}\,\mathrm{erf}\,x$', size=11)

    a = axs[1]
    math_axes(a, (-0.6, 16.5), (-0.62, 2.05), xticks=[5, 10, 15], yticks=[1])
    a.tick_params(axis='x', pad=19)
    a.plot([0, 16.5], [math.pi / 2] * 2, color=C['muted'], lw=1.0, ls=(0, (3, 3)), zorder=1)
    plot_fn(a, lambda x: math.sin(x) / x if x != 0 else 1.0, 0, 16.5, color=C['blue'])
    plot_fn(a, lambda x: float(mpmath.si(x)), 0, 16.5, n=500, color=C['orange'])
    label(a, 1.6, 0.92, r'$\frac{\sin x}{x}$', color=C['blue'], size=13)
    label(a, 8.0, 1.85, r'$\mathrm{Si}\,x$', color=C['orange'], size=12, ha='center')
    label(a, 16.3, 1.38, r'$\frac{\pi}{2}$', color=C['slate'], size=12, ha='right')
    title(a, r'$\frac{\sin x}{x}$ and $\mathrm{Si}\,x$', size=11)

    a = axs[2]
    math_axes(a, (1.4, 12.6), (-0.3, 6.7), xticks=[2, 4, 6, 8, 10, 12], yticks=[1, 2, 3, 4, 5, 6])
    plot_fn(a, lambda x: 1 / math.log(x), 2, 12.6, color=C['blue'])
    plot_fn(a, lambda x: float(mpmath.li(x, offset=True)), 2, 12.6, n=400, color=C['orange'])
    label(a, 6.5, 1.0, r'$\frac{1}{\ln x}$', color=C['blue'], size=13)
    label(a, 8.3, 4.6, r'$\mathrm{Li}\,x$', color=C['orange'], size=12, ha='right')
    title(a, r'$\frac{1}{\ln x}$ and $\mathrm{Li}\,x$', size=11)
    fig.tight_layout(w_pad=0.9)
    return fig


def fig_11_4(L):
    """One strip of the trapezoidal and midpoint rules for 1/x on [1, 2]: the trapezoid is too big, the rectangle too small."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.5)
    f = lambda x: 1 / x
    xs = np.linspace(1, 2, 400)

    # Left: the trapezoid under the chord, and the sliver between the chord and the curve.
    math_axes(a1, (0.72, 2.3), (-0.08, 1.22), xticks=[1, 1.5, 2], yticks=[0.5, 1])
    chord = lambda x: 1 - 0.5 * (x - 1)
    a1.fill_between(xs, 0, f(xs), color=C['sky'], alpha=0.30, lw=0, zorder=2)
    a1.fill_between(xs, f(xs), chord(xs), color=C['orange'], alpha=0.55, lw=0, zorder=2)
    a1.plot([1, 1, 2, 2], [0, 1, 0.5, 0], color=C['sky'], lw=1.6, zorder=3)
    plot_fn(a1, f, 0.8, 2.25)
    dot(a1, 1, 1, color=C['navy'], size=5)
    dot(a1, 2, 0.5, color=C['navy'], size=5)
    label(a1, 1.5, 0.3, r'$T_1 = 0.75$', size=12, ha='center')
    label(a1, 1.55, 0.86, 'too big', color=C['orange'], size=11, ha='left')
    a1.annotate('', xy=(1.47, 0.72), xytext=(1.6, 0.84),
                arrowprops=dict(arrowstyle='-|>', color=C['orange'], lw=1.2, mutation_scale=10))
    label(a1, 2.02, 1.05, r'$y = \dfrac{1}{x}$', color=C['blue'], size=12, ha='left')
    title(a1, 'Trapezoidal rule')

    # Right: the midpoint rectangle and the trapezoid under the tangent at the midpoint have equal areas.
    math_axes(a2, (0.72, 2.3), (-0.08, 1.22), xticks=[1, 1.5, 2], yticks=[0.5, 1])
    m, fm, dfm = 1.5, f(1.5), -1 / 1.5**2
    tan_ = lambda x: fm + dfm * (x - m)
    a2.fill_between(xs, 0, tan_(xs), color=C['sky'], alpha=0.30, lw=0, zorder=2)
    a2.fill_between(xs, tan_(xs), f(xs), color=C['green'], alpha=0.45, lw=0, zorder=2)
    a2.plot([1, 1, 2, 2], [0, fm, fm, 0], color=C['navy'], lw=1.4, ls=(0, (4, 3)), zorder=4)
    a2.plot([0.92, 2.08], [tan_(0.92), tan_(2.08)], color=C['purple'], lw=1.8, zorder=4)
    plot_fn(a2, f, 0.8, 2.25)
    dot(a2, m, fm, color=C['navy'], size=5)
    label(a2, 1.5, 0.3, r'$M_1 = \frac{2}{3}$', size=12, ha='center')
    label(a2, 1.12, 1.1, 'too small', color=C['green'], size=11, ha='left')
    a2.annotate('', xy=(1.1, 0.875), xytext=(1.2, 1.05),
                arrowprops=dict(arrowstyle='-|>', color=C['green'], lw=1.2, mutation_scale=10))
    label(a2, 1.55, 0.5, 'tangent', color=C['purple'], size=11, ha='left', va='top')
    title(a2, 'Midpoint rule')
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_11_5(L):
    """Simpson's rule: parabolas through three points of a graph, and the errors of the three rules against n."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.6, gridspec_kw={'width_ratios': [1, 1.05]})

    # Left: two parabolic arcs replace the graph on [0, 4] (n = 4).
    f = lambda x: 1 + 0.5 * np.sin(2 * x) + x / 4
    math_axes(a1, (-0.25, 4.5), (-0.15, 2.7), xticks=[1, 2, 3, 4], yticks=[2])
    for p0 in (0, 2):
        q = np.polyfit([p0, p0 + 1, p0 + 2], [f(p0), f(p0 + 1), f(p0 + 2)], 2)
        xs = np.linspace(p0, p0 + 2, 200)
        a1.fill_between(xs, 0, np.polyval(q, xs), color=C['sky'], alpha=0.30, lw=0, zorder=2)
        a1.plot(xs, np.polyval(q, xs), color=C['purple'], lw=2.0, ls=(0, (5, 3)), zorder=5)
        a1.plot([p0 + 2, p0 + 2], [0, f(p0 + 2)], color=C['sky'], lw=1.0, zorder=3)
    a1.plot([0, 0], [0, f(0)], color=C['sky'], lw=1.0, zorder=3)
    plot_fn(a1, f, -0.1, 4.4, color=C['blue'], lw=2.2)
    for k in range(5):
        dot(a1, k, f(k), color=C['navy'], size=5)
    label(a1, 0.1, 2.45, r'$y = f(x)$', color=C['blue'], size=12)
    label(a1, 1.95, 2.45, 'parabolas', color=C['purple'], size=11)
    title(a1, r'$S_4$: two parabolas')

    # Right: |error| against n for the integral of exp(-x^2) over [0, 1], on log-log scales.
    exact = math.sqrt(math.pi) / 2 * math.erf(1)
    g = lambda x: math.exp(-x * x)

    def mid(n):
        d = 1 / n
        return d * sum(g((i + 0.5) * d) for i in range(n))

    def trap(n):
        d = 1 / n
        return d * (g(0) / 2 + sum(g(i * d) for i in range(1, n)) + g(1) / 2)

    def simp(n):
        d = 1 / n
        return d / 3 * (g(0) + sum((4 if i % 2 else 2) * g(i * d) for i in range(1, n)) + g(1))

    ns = [2 ** k for k in range(1, 9)]
    a2.set_xscale('log', base=2)
    a2.set_yscale('log')
    rows = (('trapezoidal', trap, CURVES[1]), ('midpoint', mid, CURVES[0]), ('Simpson', simp, CURVES[2]))
    for name, rule, col in rows:
        errs = [abs(exact - rule(n)) for n in ns]
        a2.plot(ns, errs, '-o', color=col, lw=2.0, markersize=4.5, zorder=4)
    for side in ('top', 'right'):
        a2.spines[side].set_visible(False)
    for side in ('left', 'bottom'):
        a2.spines[side].set_color(C['navy'])
    a2.set_xticks(ns)
    a2.set_xticklabels([str(n) for n in ns])
    a2.set_ylim(1e-13, 3e-2)
    a2.set_yticks([1e-12, 1e-9, 1e-6, 1e-3])
    a2.minorticks_off()
    a2.grid(True, color=C['grid'], lw=0.8, zorder=0)
    a2.set_axisbelow(True)
    a2.set_xlabel('$n$', fontsize=13)
    a2.set_ylabel('size of the error', fontsize=11)
    label(a2, 30, 2.2e-3, 'trapezoidal', color=CURVES[1], size=11)
    label(a2, 40, 1.5e-6, 'midpoint', color=CURVES[0], size=11, ha='center')
    label(a2, 8, 4e-9, 'Simpson', color=CURVES[2], size=11, ha='center')
    label(a2, 150, 4e-5, 'slope $-2$', color=C['slate'], size=11, ha='center')
    label(a2, 90, 2e-12, 'slope $-4$', color=C['slate'], size=11, ha='center')
    title(a2, r'Errors for $\int_0^1 e^{-x^2}dx$', pad=10)
    fig.tight_layout(w_pad=1.6)
    return fig


FIGURES = {'fig-11-1': fig_11_1, 'fig-11-2': fig_11_2, 'fig-11-3': fig_11_3, 'fig-11-4': fig_11_4, 'fig-11-5': fig_11_5}
