"""Figures of Module 1: Functions and change."""
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def fig_01_1(L):
    """The two problems of calculus: the slope of a curve at a point, and the area under a curve."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)
    f = lambda x: x**2 / 2 + 0.5
    df = lambda x: x

    # The tangent problem: secants through P and points Q that slide towards P.
    math_axes(a1, (-0.4, 3.9), (-0.6, 5.4), xticks=[], yticks=[])
    plot_fn(a1, f, -0.3, 3.15)
    p = 1.0
    for q, col in ((2.6, C['muted']), (1.8, C['muted'])):
        m = (f(q) - f(p)) / (q - p)
        xs = np.array([0.15, 3.05])
        a1.plot(xs, f(p) + m * (xs - p), color=col, lw=1.4, ls=(0, (5, 3)), zorder=3)
        dot(a1, q, f(q), color=C['slate'], size=6)
    label(a1, 2.6 - 0.1, f(2.6) + 0.14, r'$Q$', color=C['slate'], ha='right', va='bottom')
    label(a1, 1.8 - 0.1, f(1.8) + 0.26, r'$Q$', color=C['slate'], ha='right', va='bottom')
    tangent(a1, f, p, (-0.2, 3.05), df=df, color=C['orange'], lw=2)
    dot(a1, p, f(p), color=C['navy'])
    label(a1, p - 0.1, f(p) + 0.32, r'$P$', ha='right')
    label(a1, 3.12, 4.28, 'secants', color=C['slate'], size=11)
    label(a1, 3.12, 3.05, 'tangent', color=C['orange'], size=11)
    title(a1, 'The tangent problem')

    # The area problem: thin rectangles fill the region under the curve.
    math_axes(a2, (-0.4, 3.4), (-0.6, 5.4), xticks=[0.5, 2.5], yticks=[], ticklabels=False)
    label(a2, 0.5, -0.38, r'$a$', ha='center', size=13)
    label(a2, 2.5, -0.38, r'$b$', ha='center', size=13)
    shade(a2, f, 0.5, 2.5, color=C['blue'], alpha=0.12)
    riemann(a2, f, 0.5, 2.5, 8, 'left', color=C['sky'], alpha=0.35, edge=C['sky'])
    plot_fn(a2, f, -0.3, 3.15)
    label(a2, 1.5, 0.7, 'area = ?', ha='center', size=12)
    title(a2, 'The area problem')
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_01_2(L):
    """Reading a graph: the domain and range of y = sqrt(4 - x^2), and a piecewise function with a jump."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)

    # Domain and range as the shadows of the graph on the axes.
    math_axes(a1, (-2.9, 2.9), (-1.0, 2.9), xticks=[-2, -1, 1, 2], yticks=[(1, '1'), (2, '')], aspect='equal')
    plot_fn(a1, lambda x: np.sqrt(np.maximum(4 - x**2, 0)), -2, 2, n=2000)
    dot(a1, -2, 0, size=6)
    dot(a1, 2, 0, size=6)
    a1.plot([-2, 2], [0, 0], color=C['orange'], lw=5, solid_capstyle='butt', zorder=4)
    a1.plot([0, 0], [0, 2], color=C['green'], lw=5, solid_capstyle='butt', zorder=4)
    label(a1, -2.8, -0.68, r'domain $[-2, 2]$', color=C['orange'], size=11)
    label(a1, 0.14, 1.0, r'range $[0, 2]$', color=C['green'], size=11)
    label(a1, 1.05, 2.2, r'$y = \sqrt{4 - x^2}$', color=C['blue'], size=11)
    title(a1, 'Domain and range')

    # A piecewise function: x^2 for x < 1, 3 - x for x >= 1.
    math_axes(a2, (-1.9, 3.7), (-1.2, 3.6), xticks=[-1, 1, 2, 3], yticks=[1, 2, 3])
    plot_fn(a2, lambda x: x**2, -1.85, 1)
    plot_fn(a2, lambda x: 3 - x, 1, 3.6)
    dot(a2, 1, 1, hollow=True)
    dot(a2, 1, 2)
    label(a2, -1.05, 2.5, r'$y = x^2$', color=C['blue'], size=11)
    label(a2, 2.35, 1.25, r'$y = 3 - x$', color=C['blue'], size=11)
    label(a2, 1.15, 2.25, r'$f(1) = 2$', size=11)
    label(a2, 1.2, 0.45, 'not on\nthe graph', color=C['slate'], size=10)
    title(a2, 'A piecewise function')
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_01_3(L):
    """A catalogue of functions: linear, powers, a polynomial, a rational function, roots, exponentials, the logarithm, tan."""
    fig, ax = figure_grid(2, 4, w=7.6, h=4.5)
    lab = dict(size=11)

    a = ax[0]
    math_axes(a, (-2.2, 2.2), (-2.2, 3.4), xticks=[(-1, ''), (1, '1')], yticks=[(1, ''), (2, '2')], xlabel='', ylabel='')
    plot_fn(a, lambda x: 2 * x + 1, -2.2, 2.2, color=CURVES[0])
    plot_fn(a, lambda x: 1 - x / 2, -2.2, 2.2, color=CURVES[1])
    label(a, 1.05, 2.6, r'$2x + 1$', color=CURVES[0], **lab)
    label(a, -2.1, 2.45, r'$1 - x/2$', color=CURVES[1], **lab)
    panel_title(a, 'linear', size=11)

    a = ax[1]
    math_axes(a, (-2.0, 2.0), (-2.6, 3.4), xticks=[(-1, ''), (1, '1')], yticks=[1, 2], xlabel='', ylabel='')
    plot_fn(a, lambda x: x**2, -2, 2, color=CURVES[0])
    plot_fn(a, lambda x: x**3, -2, 2, color=CURVES[1])
    label(a, -1.25, 2.75, r'$x^2$', color=CURVES[0], **lab)
    label(a, 1.0, -1.6, r'$x^3$', color=CURVES[1], **lab)
    panel_title(a, 'powers', size=11)

    a = ax[2]
    p = lambda x: x**3 - x**2 - 6 * x
    math_axes(a, (-2.8, 3.8), (-10.5, 6.5), xticks=[], yticks=[-5, 5], xlabel='', ylabel='')
    plot_fn(a, p, -2.6, 3.6)
    for r in (-2, 0, 3):
        dot(a, r, 0, size=5)
    label(a, -2.35, 1.3, r'$-2$', color=C['slate'], size=10, ha='center')
    label(a, 2.6, 1.3, r'$3$', color=C['slate'], size=10, ha='center')
    label(a, 3.75, -9.6, r'$x^3 - x^2 - 6x$', color=C['blue'], size=10, ha='right')
    panel_title(a, 'polynomial', size=11)

    a = ax[3]
    math_axes(a, (-3.0, 3.0), (-3.2, 3.2), xticks=[1, 2], yticks=[1, 2], xlabel='', ylabel='')
    plot_fn(a, lambda x: 1 / x, -3, 3, breaks=[0])
    label(a, 0.55, 2.6, r'$\frac{1}{x}$', color=C['blue'], size=13)
    panel_title(a, 'rational', size=11)

    a = ax[4]
    math_axes(a, (-3.2, 4.5), (-1.9, 2.6), xticks=[-2, 2, 4], yticks=[1, 2], xlabel='', ylabel='')
    plot_fn(a, np.sqrt, 0, 4.5, color=CURVES[0])
    plot_fn(a, np.cbrt, -3.2, 4.5, color=CURVES[1])
    dot(a, 0, 0, color=CURVES[0], size=5)
    label(a, 2.4, 2.25, r'$\sqrt{x}$', color=CURVES[0], **lab)
    label(a, 2.7, 1.05, r'$\sqrt[3]{x}$', color=CURVES[1], **lab)
    panel_title(a, 'roots', size=11)

    a = ax[5]
    math_axes(a, (-2.6, 2.6), (-0.8, 6.2), xticks=[-2, 2], yticks=[2, 4], xlabel='', ylabel='')
    plot_fn(a, lambda x: 2.0**x, -2.6, 2.6, color=CURVES[0])
    plot_fn(a, np.exp, -2.6, 2.6, color=CURVES[2])
    plot_fn(a, lambda x: 0.5**x, -2.6, 2.6, color=CURVES[1])
    label(a, 1.95, 3.45, r'$2^x$', color=CURVES[0], **lab)
    label(a, 0.42, 5.4, r'$e^x$', color=CURVES[2], **lab)
    label(a, -2.5, 1.9, r'$(\frac{1}{2})^x$', color=CURVES[1], **lab)
    panel_title(a, 'exponential', size=11)

    a = ax[6]
    math_axes(a, (-2.6, 4.6), (-2.6, 4.6), xticks=[2, 4], yticks=[2, 4], xlabel='', ylabel='')
    a.plot([-2.6, 4.6], [-2.6, 4.6], color=C['muted'], lw=1.2, ls=(0, (4, 3)), zorder=3)
    plot_fn(a, np.exp, -2.6, 1.6, color=CURVES[2])
    plot_fn(a, np.log, 0.01, 4.6, color=CURVES[0])
    label(a, -2.3, 1.4, r'$e^x$', color=CURVES[2], **lab)
    label(a, 3.0, 0.55, r'$\ln x$', color=CURVES[0], **lab)
    label(a, 3.3, 4.05, r'$y = x$', color=C['slate'], size=10, ha='right')
    panel_title(a, 'logarithm', size=11)

    a = ax[7]
    math_axes(a, (-3.5, 3.5), (-3.6, 3.6), xticks=[(-PI / 2, r'$-\pi/2$'), (PI / 2, r'$\pi/2$')],
              yticks=[(-2, ''), (2, '2')], xlabel='', ylabel='')
    for k in (-1, 1):   # the asymptotes, with a gap for the tick label below the axis
        for y0, y1 in ((-3.6, -1.0), (-0.2, 3.6)):
            a.plot([k * PI / 2] * 2, [y0, y1], color=C['muted'], lw=1.0, ls=(0, (3, 3)), zorder=3)
    plot_fn(a, np.tan, -3.3, 3.3, breaks=[-PI / 2, PI / 2])
    label(a, 1.68, 3.0, r'$\tan x$', color=C['blue'], size=10.5)
    panel_title(a, 'trigonometric', size=11)

    fig.tight_layout(h_pad=1.2, w_pad=0.8)
    return fig


def fig_01_4(L):
    """The unit circle: the point at angle theta has coordinates (cos theta, sin theta); the graphs of sine and cosine."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4, gridspec_kw={'width_ratios': [1, 1.55]})
    th = 1.1
    cx, sy = np.cos(th), np.sin(th)

    math_axes(a1, (-1.45, 1.45), (-1.35, 1.45), xticks=[-1, 1], yticks=[-1, 1], aspect='equal', grid=False,
              ticklabels=False)
    for (lx, ly, txt) in ((1.12, -0.16, '1'), (-1.16, -0.16, r'$-1$'), (-0.13, 1.14, '1'), (-0.2, -1.14, r'$-1$')):
        label(a1, lx, ly, txt if txt.startswith('$') else f'${txt}$', ha='center', size=11, color=C['slate'])
    plot_param(a1, np.cos, np.sin, 0, 2 * PI, color=C['slate'], lw=1.4)
    plot_param(a1, np.cos, np.sin, 0, th, color=C['orange'], lw=4.0, zorder=5)
    a1.plot([0, cx], [0, sy], color=C['navy'], lw=1.4, zorder=4)
    a1.plot([cx, cx], [0, sy], color=C['blue'], lw=2.0, zorder=4)
    a1.plot([0, cx], [0, 0], color=C['green'], lw=3.0, zorder=4, solid_capstyle='butt')
    dot(a1, cx, sy, color=C['navy'])
    dot(a1, 1, 0, color=C['slate'], size=5)
    label(a1, cx + 0.08, sy + 0.16, r'$P = (\cos\theta, \sin\theta)$', size=11)
    label(a1, 1.0, 0.5, r'arc $\theta$', color=C['orange'], size=11, ha='left')
    label(a1, cx + 0.05, 0.2, r'$\sin\theta$', color=C['blue'], size=11)
    label(a1, cx / 2, -0.17, r'$\cos\theta$', color=C['green'], size=11, ha='center')
    a1.annotate('', xy=(0.28 * np.cos(th), 0.28 * np.sin(th)), xytext=(0.28, 0),
                arrowprops=dict(arrowstyle='-|>', color=C['navy'], lw=1.1, connectionstyle='arc3,rad=0.35',
                                shrinkA=0, shrinkB=0))
    label(a1, 0.3, 0.14, r'$\theta$', size=11)
    title(a1, 'The unit circle')

    ticks = [(PI / 2, r'$\pi/2$'), (PI, r'$\pi$'), (3 * PI / 2, r'$3\pi/2$'), (2 * PI, r'$2\pi$')]
    math_axes(a2, (-0.4, 7.0), (-1.45, 1.6), xticks=ticks, yticks=[(-1, r'$-1$'), (1, r'$1$')])
    a2.tick_params(axis='x', pad=24)
    plot_fn(a2, np.sin, 0, 7.0, color=CURVES[0])
    plot_fn(a2, np.cos, 0, 7.0, color=CURVES[1])
    a2.plot([th, th], [0, sy], color=C['blue'], lw=2.0, zorder=5)
    dot(a2, th, sy, color=C['navy'], size=6)
    label(a2, th + 0.08, sy + 0.22, r'$(\theta, \sin\theta)$', size=11)
    label(a2, 4.75, -1.22, r'$\sin x$', color=CURVES[0], size=11)
    label(a2, 2.35, -1.22, r'$\cos x$', color=CURVES[1], size=11)
    title(a2, 'The graphs of sine and cosine')
    fig.tight_layout(w_pad=1.5)
    return fig


def fig_01_5(L):
    """A falling ball, s(t) = 4.9t^2: secant lines from t = 1 over shorter and shorter intervals approach the tangent."""
    fig, ax = figure(7.6, 4.0)
    s = lambda t: 4.9 * t**2
    math_axes(ax, (-0.15, 4.55), (-3, 54), xlabel=r'$t$ (s)', ylabel=r'$s$ (m)', xticks=[1, 1.5, 2, 3],
              yticks=[10, 20, 30, 40, 50])
    plot_fn(ax, s, 0, 3.27, lw=2.6)
    t0, t1 = 1.0, 3.3
    xs = np.array([0.35, t1])
    for h, col in zip((2.0, 1.0, 0.5), (CURVES[2], CURVES[3], CURVES[5])):
        m = (s(t0 + h) - s(t0)) / h
        ax.plot(xs, s(t0) + m * (xs - t0), color=col, lw=1.6, zorder=3)
        dot(ax, t0 + h, s(t0 + h), color=col, size=6)
        label(ax, t1 + 0.05, s(t0) + m * (t1 - t0), f'$h = {h:g}$: slope ${m:.4g}$', color=col, size=11)
    tangent(ax, s, t0, (0.35, t1), df=lambda t: 9.8 * t, color=C['orange'], lw=2.0, ls=(0, (5, 3)))
    label(ax, t1 + 0.05, s(t0) + 9.8 * (t1 - t0), 'tangent: slope 9.8', color=C['orange'], size=11)
    dot(ax, t0, s(t0), color=C['navy'])
    label(ax, 0.93, 7.2, r'$(1, 4.9)$', ha='right', size=11)
    label(ax, 2.45, 40, r'$s = 4.9t^2$', color=C['blue'], size=12, ha='right')
    return fig


FIGURES = {'fig-01-1': fig_01_1, 'fig-01-2': fig_01_2, 'fig-01-3': fig_01_3, 'fig-01-4': fig_01_4, 'fig-01-5': fig_01_5}
