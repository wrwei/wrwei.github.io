"""Figures of Module 2: Limits."""
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi


def title(ax, text, size=12, pad=26):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def fig_02_1(L):
    """Three functions with the same limit 2 at x = 1, whatever happens at x = 1 itself."""
    fig, axs = figure_grid(1, 3, w=7.6, h=3.1)
    pieces = [
        (lambda x: (x**2 - 1) / (x - 1), [1], None, r'$f(1)$ undefined', r'$y = \dfrac{x^2 - 1}{x - 1}$'),
        (lambda x: x + 1, [], 2, r'$g(1) = 2$', r'$y = x + 1$'),
        (lambda x: x + 1, [1], 1, r'$h(1) = 1$', r'$y = h(x)$'),
    ]
    for ax, (fn, breaks, value, head, name) in zip(axs, pieces):
        math_axes(ax, (-0.75, 2.75), (-0.6, 3.9), xticks=[1, 2], yticks=[1, 2, 3])
        ax.plot([1, 1], [0, 2], ls=(0, (4, 3)), color=C['muted'], lw=1.1, zorder=3)
        ax.plot([0, 1], [2, 2], ls=(0, (4, 3)), color=C['muted'], lw=1.1, zorder=3)
        plot_fn(ax, fn, -0.65, 2.65, breaks=breaks)
        if value is None or value != 2:
            dot(ax, 1, 2, hollow=True)
        if value is not None:
            dot(ax, 1, value)
        label(ax, 1.25, 3.55, name, color=C['blue'], size=11, ha='center')
        title(ax, head)
    # In the first panel: x approaches 1 from both sides, and f(x) approaches 2.
    a1 = axs[0]
    for x0, x1 in ((0.2, 0.8), (1.8, 1.2)):
        arrow(a1, x0, 0.22, x1, 0.22, color=C['orange'], lw=1.6, head=10)
    for y0, y1 in ((1.15, 1.75), (2.85, 2.25)):
        arrow(a1, -0.42, y0, -0.42, y1, color=C['orange'], lw=1.6, head=10)
    fig.tight_layout(w_pad=1.2)
    return fig


def fig_02_2(L):
    """Three ways for a limit not to exist at 0: a jump, a blow-up and an oscillation."""
    fig, (a1, a2, a3) = figure_grid(1, 3, w=7.6, h=3.0)

    math_axes(a1, (-2.3, 2.3), (-1.8, 1.8), xticks=[-2, -1, 1, 2], yticks=[])
    plot_fn(a1, lambda x: abs(x) / x, -2.2, 2.2, breaks=[0])
    dot(a1, 0, 1, hollow=True)
    dot(a1, 0, -1, hollow=True)
    label(a1, 1.15, 1.38, r'$y = 1$', color=C['blue'], size=11, ha='center')
    label(a1, -1.15, -1.38, r'$y = -1$', color=C['blue'], size=11, ha='center')
    label(a1, -1.15, 1.2, r'$y = \dfrac{|x|}{x}$', color=C['blue'], size=11, ha='center')
    title(a1, 'a jump')

    math_axes(a2, (-2.3, 2.3), (-0.9, 9.0), xticks=[-2, -1, 1, 2], yticks=[2, 4, 6, 8])
    plot_fn(a2, lambda x: 1 / x**2, -2.2, 2.2, breaks=[0])
    label(a2, 1.3, 4.6, r'$y = \dfrac{1}{x^2}$', color=C['blue'], size=11, ha='center')
    title(a2, 'a blow-up')

    math_axes(a3, (-0.66, 0.66), (-1.8, 1.8), xticks=[-0.5, 0.5], yticks=[])
    for yb in (1, -1):
        a3.plot([-0.66, 0.66], [yb, yb], ls=(0, (4, 3)), color=C['muted'], lw=1.0, zorder=3)
    label(a3, -0.63, 1.22, r'$1$', color=C['slate'], size=11)
    label(a3, -0.63, -1.22, r'$-1$', color=C['slate'], size=11)
    # The points (x, sin(1/x)) with x = 1/t and x = -1/t: sampled evenly in t, so that every swing gets enough points.
    for sgn in (1, -1):
        X = lambda t, s=sgn: s / t
        plot_param(a3, X, lambda t, X=X: np.sin(1 / X(t)), 1 / 0.64, 600, n=24000, lw=1.0)
    label(a3, 0.33, 1.47, r'$y = \sin\dfrac{1}{x}$', color=C['blue'], size=11, ha='center')
    title(a3, 'an oscillation')
    fig.tight_layout(w_pad=1.2)
    return fig


def fig_02_3(L):
    """Two squeezes: x sin(1/x) between -|x| and |x|, and sin(theta)/theta between cos(theta) and 1."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)

    math_axes(a1, (-0.56, 0.56), (-0.6, 0.78), xticks=[-0.5, 0.5], yticks=[-0.5, 0.5])
    a1.plot([-0.55, 0, 0.55], [0.55, 0, 0.55], color=C['orange'], lw=1.6, ls=(0, (5, 3)), zorder=3)
    a1.plot([-0.55, 0, 0.55], [-0.55, 0, -0.55], color=C['orange'], lw=1.6, ls=(0, (5, 3)), zorder=3)
    for sgn in (1, -1):
        # the points (x, x sin(1/x)) with x = 1/t and x = -1/t
        X = lambda t, s=sgn: s / t
        plot_param(a1, X, lambda t, X=X: X(t) * np.sin(1 / X(t)), 1 / 0.55, 900, n=30000, lw=1.1)
    dot(a1, 0, 0, hollow=True, size=6)
    label(a1, 0.21, 0.42, r'$y = |x|$', color=C['orange'], size=11, ha='center')
    label(a1, 0.21, -0.42, r'$y = -|x|$', color=C['orange'], size=11, ha='center')
    label(a1, 0.3, 0.68, r'$y = x\sin\dfrac{1}{x}$', color=C['blue'], size=11, ha='center')
    title(a1, r'$-|x| \leq x\sin\frac{1}{x} \leq |x|$')

    ticks = [(-PI / 2, r'$-\pi/2$'), (PI / 2, r'$\pi/2$')]
    math_axes(a2, (-2.5, 2.5), (-0.12, 1.32), xlabel=r'$\theta$', xticks=ticks, yticks=[0.5])
    a2.plot([-PI / 2] * 2, [0, 1.25], color=C['muted'], lw=1.0, ls=(0, (3, 3)), zorder=3)
    a2.plot([PI / 2] * 2, [0, 1.25], color=C['muted'], lw=1.0, ls=(0, (3, 3)), zorder=3)
    plot_fn(a2, lambda th: 1.0 + 0 * th, -PI / 2, PI / 2, color=CURVES[2])
    plot_fn(a2, np.cos, -PI / 2, PI / 2, color=CURVES[1])
    plot_fn(a2, lambda th: np.sin(th) / th, -PI / 2, PI / 2, breaks=[0], color=CURVES[0])
    dot(a2, 0, 1, hollow=True, size=6)
    label(a2, 1.64, 1.0, r'$y = 1$', color=CURVES[2], size=11)
    label(a2, 1.64, 0.64, r'$y = \dfrac{\sin\theta}{\theta}$', color=CURVES[0], size=11)
    label(a2, -1.64, 0.12, r'$y = \cos\theta$', color=CURVES[1], size=11, ha='right')
    title(a2, r'$\cos\theta < \frac{\sin\theta}{\theta} < 1$')
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_02_4(L):
    """The areas behind sin(theta)/theta -> 1: a triangle inside a sector inside a larger triangle."""
    fig, axs = figure_grid(1, 3, w=7.6, h=3.1)
    th = 0.85
    cx, sy, tq = np.cos(th), np.sin(th), np.tan(th)
    arc = np.linspace(0, th, 200)
    regions = [
        ([0, 1, cx], [0, 0, sy], r'triangle $OAP$: area $\frac{1}{2}\sin\theta$'),
        (np.concatenate([[0], np.cos(arc)]), np.concatenate([[0], np.sin(arc)]), r'sector $OAP$: area $\frac{1}{2}\theta$'),
        ([0, 1, 1], [0, 0, tq], r'triangle $OAQ$: area $\frac{1}{2}\tan\theta$'),
    ]
    for ax, (xs, ys, head) in zip(axs, regions):
        math_axes(ax, (-0.16, 1.34), (-0.2, 1.3), xticks=[], yticks=[], grid=False, aspect='equal', xlabel='', ylabel='')
        ax.fill(xs, ys, color=C['skyl'], zorder=2, lw=0)
        ax.fill(xs, ys, facecolor='none', edgecolor=C['blue'], lw=1.6, zorder=4)
        plot_param(ax, np.cos, np.sin, 0, PI / 2, color=C['slate'], lw=1.3, zorder=3)
        ax.plot([1, 1], [-0.12, 1.27], color=C['muted'], lw=1.1, ls=(0, (4, 3)), zorder=3)
        ax.plot([0, 1], [0, tq], color=C['navy'], lw=1.2, zorder=3)
        ax.plot([cx, cx], [0, sy], color=C['muted'], lw=1.0, ls=(0, (2, 2)), zorder=3)
        for (px, py) in ((0, 0), (1, 0), (cx, sy), (1, tq)):
            dot(ax, px, py, color=C['navy'], size=4.5)
        label(ax, -0.04, -0.09, r'$O$', ha='right', size=12)
        label(ax, 1.04, -0.09, r'$A$', size=12)
        label(ax, cx + 0.07, sy + 0.01, r'$P$', size=12)
        label(ax, 1.05, tq, r'$Q$', size=12)
        ax.annotate('', xy=(0.25 * np.cos(th), 0.25 * np.sin(th)), xytext=(0.25, 0),
                    arrowprops=dict(arrowstyle='-', color=C['navy'], lw=1.0, connectionstyle='arc3,rad=0.3'))
        label(ax, 0.29, 0.11, r'$\theta$', size=12)
        title(ax, head, size=11, pad=6)
    fig.tight_layout(w_pad=0.6)
    return fig


def fig_02_5(L):
    """The epsilon-delta game for y = x^2 near a = 3: a delta that wins and a delta that is too large."""
    fig, axs = figure_grid(1, 2, w=7.6, h=3.6)
    f = lambda x: x**2
    a, Lv, eps = 3.0, 9.0, 3.0
    for ax, d, head in ((axs[0], 0.4, r'$\delta = 0.4$: the graph stays in the band'),
                        (axs[1], 0.8, r'$\delta = 0.8$: the graph escapes')):
        math_axes(ax, (1.75, 4.25), (2.5, 16.8), xlabel='$x$', ylabel='$y$',
                  xticks=[(a - d, r'$a-\delta$'), (a, r'$a$'), (a + d, r'$a+\delta$')],
                  yticks=[(Lv - eps, r'$L-\varepsilon$'), (Lv, r'$L$'), (Lv + eps, r'$L+\varepsilon$')], grid=False)
        ax.axhspan(Lv - eps, Lv + eps, color=C['orangel'], zorder=0.5, lw=0)
        ax.axvspan(a - d, a + d, color=C['greenl'], alpha=0.75, zorder=0.6, lw=0)
        for yb in (Lv - eps, Lv + eps):
            ax.plot([1.75, 4.25], [yb, yb], color=C['orange'], lw=1.0, zorder=1)
        for xb in (a - d, a + d):
            ax.plot([xb, xb], [2.5, 16.8], color=C['green'], lw=1.0, zorder=1)
        ax.plot([a, a], [2.5, Lv], ls=(0, (4, 3)), color=C['slate'], lw=1.0, zorder=1)
        ax.plot([1.75, a], [Lv, Lv], ls=(0, (4, 3)), color=C['slate'], lw=1.0, zorder=1)
        plot_fn(ax, f, 1.8, 4.08, color=C['muted'], lw=2.0)
        # Over the green band: green where |f(x) - L| < eps, red where the graph escapes.
        inside = lambda x: f(x) if abs(f(x) - Lv) < eps else np.nan
        outside = lambda x: f(x) if abs(f(x) - Lv) >= eps else np.nan
        plot_fn(ax, inside, a - d, a + d, color=C['green'], lw=3.0, zorder=5)
        plot_fn(ax, outside, a - d, a + d, color=C['red'], lw=3.0, zorder=5)
        dot(ax, a, Lv, color=C['navy'], size=5)
        title(ax, head, size=11, pad=22)
    label(axs[1], 3.72, 15.6, r'$y = x^2$', color=C['slate'], size=11, ha='right')
    fig.tight_layout(w_pad=2.5)
    return fig


FIGURES = {'fig-02-1': fig_02_1, 'fig-02-2': fig_02_2, 'fig-02-3': fig_02_3, 'fig-02-4': fig_02_4, 'fig-02-5': fig_02_5}
