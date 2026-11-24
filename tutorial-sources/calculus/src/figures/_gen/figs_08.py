"""Figures of Module 8: The shape of a graph and optimisation."""
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def flat(ax, x0, y0, half, color=None):
    """A short horizontal tangent segment at (x0, y0)."""
    ax.plot([x0 - half, x0 + half], [y0, y0], color=color or C['orange'], lw=2.0, ls=(0, (4, 2.5)), zorder=5)


def fig_08_1(L):
    """Absolute and local extreme values of f(x) = x^4/4 - 7x^3/3 + 5x^2 on the interval [-1, 5.5]."""
    fig, ax = figure(7.6, 3.9)
    f = lambda x: x**4 / 4 - 7 * x**3 / 3 + 5 * x**2
    a, b = -1.0, 5.5
    math_axes(ax, (-1.7, 6.4), (-13.2, 10.6), xticks=[-1, 1, 2, 3, 4, 5], yticks=[-10, -5, 5])
    plot_fn(ax, f, a, b, lw=2.6)
    for x0 in (0, 2, 5):
        flat(ax, x0, f(x0), 0.45)
        dot(ax, x0, f(x0), color=C['navy'], size=6)
    dot(ax, a, f(a), color=C['navy'], size=6)
    dot(ax, b, f(b), color=C['navy'], size=6)
    label(ax, a, f(a) + 0.55, 'absolute\nmaximum', size=11, ha='center', va='bottom')
    label(ax, 2, f(2) + 1.1, 'local maximum', size=11, ha='center', va='bottom')
    label(ax, 0.05, -2.4, 'local minimum', size=11, ha='center', va='top')
    label(ax, 4.75, f(5) - 0.55, 'absolute minimum\n(also local)', size=11, ha='right', va='top')
    label(ax, b + 0.15, f(b) + 0.5, 'endpoint:\nneither', size=10.5, color=C['slate'], va='bottom')
    label(ax, 3.05, 4.6, r'$y = f(x)$', color=C['blue'], size=12)
    return fig


def fig_08_2(L):
    """Rolle's theorem and the Mean Value Theorem for f(x) = x^3 - 3x, on [-2, 1] and on [-2, 2]."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.6)
    f = lambda x: x**3 - 3 * x
    df = lambda x: 3 * x**2 - 3

    # Rolle: f(-2) = f(1) = -2, and the tangent at c = -1 is horizontal.
    math_axes(a1, (-2.6, 1.9), (-3.4, 3.4), xticks=[(-2, r'$a$'), (-1, r'$c$'), (1, r'$b$')], yticks=[])
    plot_fn(a1, f, -2.25, 1.5, color=C['muted'], lw=1.6)
    plot_fn(a1, f, -2, 1, lw=2.6)
    a1.plot([-2, 1], [-2, -2], color=C['green'], lw=2.0, zorder=4)
    flat(a1, -1, 2, 0.75)
    guide(a1, x=-1, upto=2)
    for x0 in (-2, 1):
        dot(a1, x0, f(x0), color=C['navy'], size=6)
    dot(a1, -1, 2, color=C['orange'], size=6)
    label(a1, -1.75, -2.45, r'$f(a) = f(b)$', color=C['green'], size=11, va='top')
    label(a1, -1, 2.45, r"$f'(c) = 0$", color=C['orange'], size=11, ha='center', va='bottom')
    title(a1, "Rolle's theorem")

    # Mean Value Theorem: the secant from (-2, -2) to (2, 2) has slope 1, and so have the tangents at +-2/sqrt(3).
    c1, c2 = -2 / np.sqrt(3), 2 / np.sqrt(3)
    math_axes(a2, (-2.6, 2.6), (-3.4, 3.4), xticks=[(-2, r'$a$'), (2, r'$b$')], yticks=[])
    plot_fn(a2, f, -2.25, 2.25, color=C['muted'], lw=1.6)
    plot_fn(a2, f, -2, 2, lw=2.6)
    a2.plot([-2.45, 2.45], [-2.45, 2.45], color=C['green'], lw=2.0, zorder=4)
    for c in (c1, c2):
        xs = np.array([c - 0.95, c + 0.95])
        a2.plot(xs, f(c) + df(c) * (xs - c), color=C['orange'], lw=2.0, ls=(0, (4, 2.5)), zorder=5)
        dot(a2, c, f(c), color=C['orange'], size=6)
        a2.plot([c, c], [0, f(c)], ls=(0, (4, 3)), color=C['slate'], lw=1.1, zorder=3)
    label(a2, c1, -0.3, r'$c_1$', size=12, ha='center', va='top', color=C['slate'])
    label(a2, c2, 0.3, r'$c_2$', size=12, ha='center', va='bottom', color=C['slate'])
    for x0 in (-2, 2):
        dot(a2, x0, f(x0), color=C['navy'], size=6)
    label(a2, -2.5, 3.05, 'secant, slope 1', color=C['green'], size=11, ha='left')
    label(a2, 2.55, -3.0, 'tangents, slope 1', color=C['orange'], size=11, ha='right')
    title(a2, 'The Mean Value Theorem')
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_08_3(L):
    """Concavity of the sigmoid: tangent lines below the graph where it is concave up, above it where it is concave down, and the derivative."""
    fig, (a1, a2) = figure_grid(2, 1, w=7.6, h=4.8, gridspec_kw={'hspace': 0.45, 'height_ratios': [1.35, 1]})
    s = lambda x: 1 / (1 + np.exp(-x))
    ds = lambda x: s(x) * (1 - s(x))
    pts = (-3.4, -1.4, 1.4, 3.4)

    math_axes(a1, (-6.4, 6.4), (-0.12, 1.22), xticks=[-4, -2, 2, 4], yticks=[1])
    a1.axvspan(-6.4, 0, color=C['green'], alpha=0.07, lw=0, zorder=0)
    a1.axvspan(0, 6.4, color=C['purple'], alpha=0.07, lw=0, zorder=0)
    plot_fn(a1, s, -6.4, 6.4, lw=2.6)
    for x0 in pts:
        m = ds(x0)
        xs = np.array([x0 - 0.9, x0 + 0.9])
        a1.plot(xs, s(x0) + m * (xs - x0), color=C['orange'], lw=1.8, zorder=5)
        dot(a1, x0, s(x0), color=C['orange'], size=5)
    dot(a1, 0, 0.5, color=C['navy'], size=6)
    label(a1, 0.3, 0.44, r'inflection point $(0, \frac{1}{2})$', size=10.5, va='top')
    label(a1, -6.1, 0.86, 'concave up:\ntangents below', color=C['green'], size=10.5)
    label(a1, 6.1, 0.2, 'concave down:\ntangents above', color=C['purple'], size=10.5, ha='right')
    label(a1, 4.4, 1.1, r'$y = \sigma(x)$', color=C['blue'], size=12, ha='center')

    math_axes(a2, (-6.4, 6.4), (-0.03, 0.33), xticks=[-4, -2, 2, 4], yticks=[])
    a2.axvspan(-6.4, 0, color=C['green'], alpha=0.07, lw=0, zorder=0)
    a2.axvspan(0, 6.4, color=C['purple'], alpha=0.07, lw=0, zorder=0)
    plot_fn(a2, ds, -6.4, 6.4, color=C['purple'], lw=2.4)
    for x0 in pts:
        dot(a2, x0, ds(x0), color=C['orange'], size=5)
    dot(a2, 0, 0.25, color=C['navy'], size=6)
    label(a2, -4.0, 0.2, r"$\sigma'$ increases", color=C['green'], size=10.5, ha='center')
    label(a2, 4.0, 0.2, r"$\sigma'$ decreases", color=C['purple'], size=10.5, ha='center')
    label(a2, 0.35, 0.29, r"$y = \sigma'(x)$", color=C['purple'], size=11.5)
    label(a2, -0.3, 0.262, r'largest value $\frac{1}{4}$', size=10.5, ha='right', va='bottom')
    return fig


def fig_08_4(L):
    """Two finished sketches: y = x^2/(x^2 - 4) with its asymptotes, and y = x e^(-x) with its maximum and inflection point."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7)

    f = lambda x: x**2 / (x**2 - 4)
    math_axes(a1, (-5.2, 5.2), (-3.6, 4.6), xticks=[-4, 4], yticks=[-2, 2, 4])
    for x0 in (-2, 2):
        a1.plot([x0, x0], [-3.6, 4.6], color=C['muted'], lw=1.2, ls=(0, (4, 3)), zorder=3)
    a1.plot([-5.2, 5.2], [1, 1], color=C['muted'], lw=1.2, ls=(0, (4, 3)), zorder=3)
    plot_fn(a1, f, -5.2, 5.2, breaks=[-2, 2], lw=2.4, n=4000)
    dot(a1, 0, 0, color=C['navy'], size=6)
    for x0 in (-3, 3):
        dot(a1, x0, f(x0), color=C['slate'], size=5)
    label(a1, 0.2, 0.22, 'local max', size=10.5, ha='left', va='bottom')
    label(a1, 3.05, 2.05, r'$(3, \frac{9}{5})$', size=10.5, color=C['slate'])
    label(a1, -5.05, 0.72, r'$y = 1$', size=10.5, color=C['slate'])
    label(a1, 2.15, -3.05, r'$x = 2$', size=10.5, color=C['slate'])
    label(a1, -2.15, -3.05, r'$x = -2$', size=10.5, color=C['slate'], ha='right')
    title(a1, r'$y = x^2/(x^2 - 4)$', pad=30)

    g = lambda x: x * np.exp(-x)
    math_axes(a2, (-0.7, 7.2), (-0.95, 0.62), xticks=[1, 2, 4, 6], yticks=[(np.exp(-1), r'$1/e$')])
    plot_fn(a2, g, -0.6, 7.2, lw=2.4)
    dot(a2, 1, np.exp(-1), color=C['navy'], size=6)
    dot(a2, 2, 2 * np.exp(-2), color=C['purple'], size=6)
    label(a2, 1, np.exp(-1) + 0.05, 'maximum', size=10.5, ha='center', va='bottom')
    label(a2, 2.2, 2 * np.exp(-2) + 0.06, 'inflection point', size=10.5, color=C['purple'], va='bottom')
    label(a2, 1.25, -0.42, 'concave\ndown', size=10.5, color=C['slate'], ha='center')     # under x < 2, where f'' < 0
    label(a2, 4.5, 0.18, 'concave up', size=10.5, color=C['slate'])
    title(a2, r'$y = x e^{-x}$', pad=30)
    fig.tight_layout(w_pad=2.2)
    return fig


def fig_08_5(L):
    """Gradient descent on f(x) = x^2/2 + e^(-x) from x0 = 3 with step sizes 0.1 (too small), 0.6 (about right) and 1.4 (too large)."""
    fig, axs = figure_grid(1, 3, w=7.6, h=3.2)
    f = lambda x: x**2 / 2 + np.exp(-x)
    df = lambda x: x - np.exp(-x)
    xstar = 0.5671432904097838          # the solution of x = e^(-x), where f'(x) = 0
    cases = [(0.1, 12, r'$\eta = 0.1$: too small'), (0.6, 6, r'$\eta = 0.6$: about right'),
             (1.4, 3, r'$\eta = 1.4$: too large')]
    for ax, (eta, n, name) in zip(axs, cases):
        math_axes(ax, (-2.4, 5.3), (-0.6, 14.5), xticks=[-2, 2, 4], yticks=[5, 10], xlabel='', ylabel='')
        plot_fn(ax, f, -2.4, 5.3, lw=2.2)
        xs = [3.0]
        for _ in range(n):
            xs.append(xs[-1] - eta * df(xs[-1]))
        ax.plot(xs, [f(v) for v in xs], color=C['orange'], lw=1.3, zorder=5)
        for v in xs:
            dot(ax, v, f(v), color=C['orange'], size=4.5, zorder=6)
        dot(ax, xs[0], f(xs[0]), color=C['navy'], size=5.5, zorder=7)
        ax.plot([xstar, xstar], [0, f(xstar)], ls=(0, (3, 2)), color=C['slate'], lw=1.0, zorder=3)
        label(ax, 3.15, f(3.0) - 0.4, r'$x_0$', size=11, va='top')
        panel_title(ax, name, size=11)
    nxt = xs[-1] - 1.4 * df(xs[-1])
    arrow(axs[2], xs[-1], f(xs[-1]), 5.2, 13.2, color=C['orange'], lw=1.3, head=10)
    label(axs[2], 5.2, 13.9, r'$x_4 \approx %.2f$' % nxt, size=10.5, ha='right', color=C['orange'])
    fig.tight_layout(w_pad=0.9)
    return fig


FIGURES = {'fig-08-1': fig_08_1, 'fig-08-2': fig_08_2, 'fig-08-3': fig_08_3, 'fig-08-4': fig_08_4, 'fig-08-5': fig_08_5}
