"""Figures of Module 7: Rates, approximation and L'Hopital's rule."""
import numpy as np
from matplotlib.patches import Ellipse, Polygon, Arc
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def diagram(ax, xlim, ylim):
    """An axes for a diagram: equal scales, no axes or ticks."""
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    ax.set_aspect('equal')
    ax.axis('off')


def hatch_line(ax, x0, y0, x1, y1, side=(0.0, -1.0), n=14, length=0.22, color=None):
    """A solid surface (ground, wall) from (x0, y0) to (x1, y1), hatched on one side."""
    col = color or C['slate']
    ax.plot([x0, x1], [y0, y1], color=col, lw=1.6, zorder=3, solid_capstyle='butt')
    for k in range(n + 1):
        px, py = x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n
        ax.plot([px, px + length * (side[0] - side[1]) * 0.7], [py, py + length * (side[1] + side[0]) * 0.7],
                color=C['muted'], lw=1.0, zorder=2)


def dimension(ax, x0, y0, x1, y1, text, offset=(0, 0), color=None, size=11, ha='center', va='center'):
    """A dimension line with arrowheads at both ends and its label at the middle (shifted by offset)."""
    col = color or C['slate']
    ax.annotate('', xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle='<|-|>', color=col, lw=1.1, mutation_scale=9, shrinkA=0, shrinkB=0), zorder=6)
    label(ax, (x0 + x1) / 2 + offset[0], (y0 + y1) / 2 + offset[1], text, color=col, size=size, ha=ha, va=va)


def fig_07_1(L):
    """Four related-rates problems: a sliding ladder, a cone-shaped tank, a walker's shadow and a rising balloon."""
    fig, (a1, a2, a3, a4) = figure_grid(2, 2, w=7.6, h=4.5)

    # The sliding ladder: x^2 + y^2 = 25 (metres), the foot 3 m from the wall.
    diagram(a1, (-1.0, 5.6), (-0.75, 4.75))
    hatch_line(a1, 0, 0, 5.4, 0, side=(0, -1))
    hatch_line(a1, 0, 0, 0, 4.6, side=(-1, 0), n=12)
    a1.plot([3, 0], [0, 4], color=C['amber'], lw=4.0, zorder=4, solid_capstyle='round')
    dimension(a1, 0, -0.45, 3, -0.45, r'$x$', offset=(0, -0.22))
    dimension(a1, -0.5, 0, -0.5, 4, r'$y$', offset=(-0.25, 0))
    label(a1, 1.72, 2.25, r'$5$ m', color=C['amber'], size=11)
    arrow(a1, 3.25, 0.32, 4.35, 0.32, color=C['blue'])
    label(a1, 3.8, 0.75, r'$0.5$ m/s', color=C['blue'], size=10.5, ha='center')
    arrow(a1, 0.55, 4.3, 0.55, 3.3, color=C['red'])
    label(a1, 0.72, 3.8, r'?', color=C['red'], size=12)
    title(a1, 'The sliding ladder', size=11, pad=6)

    # The cone-shaped tank: height 4, top radius 2, water depth h = 3 with surface radius r = 1.5.
    diagram(a2, (-3.4, 3.4), (-0.35, 5.3))
    water = Polygon([(0, 0), (-1.5, 3), (1.5, 3)], closed=True, facecolor=C['skyl'], edgecolor='none', zorder=1)
    a2.add_patch(water)
    a2.add_patch(Ellipse((0, 3), 3.0, 0.42, facecolor=C['skyl'], edgecolor=C['sky'], lw=1.4, zorder=2))
    a2.plot([-2, 0, 2], [4, 0, 4], color=C['navy'], lw=1.8, zorder=3)
    a2.add_patch(Ellipse((0, 4), 4.0, 0.55, facecolor='none', edgecolor=C['navy'], lw=1.8, zorder=3))
    a2.plot([0, 1.5], [3, 3], color=C['blue'], lw=1.4, zorder=4)
    label(a2, 0.75, 2.62, r'$r$', color=C['blue'], size=11, ha='center', va='top')
    a2.plot([0, 2], [4, 4], color=C['slate'], lw=1.1, ls=(0, (3, 2)), zorder=4)
    label(a2, 1.45, 4.62, r'$2$ m', color=C['slate'], size=10.5, ha='center')
    dimension(a2, 2.55, 0, 2.55, 4, r'$4$ m', offset=(0.22, 0), ha='left')
    dimension(a2, -2.2, 0, -2.2, 3, r'$h$', offset=(-0.22, 0), color=C['blue'], ha='right')
    arrow(a2, -0.55, 5.25, -0.15, 4.25, color=C['blue'])
    label(a2, -0.7, 5.0, r'$2$ m$^3$/min', color=C['blue'], size=10.5, ha='right')
    title(a2, 'A cone-shaped tank', size=11, pad=6)

    # The shadow: a 6 m lamp post, a person 1.8 m tall at distance x, shadow length s = 3x/7.
    xp = 5.0
    s = 3 * xp / 7
    diagram(a3, (-1.2, 8.3), (-1.25, 6.6))
    hatch_line(a3, -0.6, 0, 8.0, 0, side=(0, -1), n=22)
    a3.plot([0, 0], [0, 6], color=C['navy'], lw=3.0, zorder=4, solid_capstyle='butt')
    dot(a3, 0, 6, color=C['amber'], size=9)
    a3.plot([0, xp + s], [6, 0], color=C['amber'], lw=1.3, ls=(0, (5, 3)), zorder=3)
    a3.plot([xp, xp], [0, 1.8], color=C['blue'], lw=4.0, zorder=5, solid_capstyle='butt')
    a3.plot([xp, xp + s], [0, 0], color=C['navy'], lw=4.5, zorder=4, solid_capstyle='butt')
    label(a3, 0.25, 3.0, r'$6$ m', size=10.5)
    label(a3, xp - 0.2, 1.0, r'$1.8$ m', color=C['blue'], size=10.5, ha='right')
    dimension(a3, 0, -0.6, xp, -0.6, r'$x$', offset=(0, -0.32))
    dimension(a3, xp, -0.6, xp + s, -0.6, r'$s$', offset=(0, -0.32))
    arrow(a3, xp + 0.2, 2.45, xp + 1.5, 2.45, color=C['blue'])
    label(a3, xp + 0.85, 3.0, r'$1.5$ m/s', color=C['blue'], size=10.5, ha='center')
    title(a3, "A walker's shadow", size=11, pad=6)

    # The balloon: observer 400 m from the launch point, balloon at height h, angle of elevation theta.
    diagram(a4, (-0.9, 5.4), (-1.45, 4.1))
    hatch_line(a4, -0.5, 0, 5.1, 0, side=(0, -1), n=18)
    dot(a4, 0, 0, color=C['navy'], size=6)
    label(a4, 0, -0.22, 'observer', size=10, ha='center', va='top')
    a4.plot([4, 4], [0, 3], color=C['muted'], lw=1.1, ls=(0, (3, 3)), zorder=2)
    a4.plot([0, 4], [0, 3], color=C['navy'], lw=1.3, zorder=3)
    a4.add_patch(Ellipse((4, 3.22), 0.42, 0.5, facecolor=C['orangel'], edgecolor=C['orange'], lw=1.6, zorder=5))
    a4.plot([4, 4], [2.97, 2.82], color=C['orange'], lw=1.2, zorder=5)
    a4.add_patch(Arc((0, 0), 1.6, 1.6, angle=0, theta1=0, theta2=np.degrees(np.arctan2(3, 4)), color=C['navy'], lw=1.2))
    label(a4, 0.95, 0.27, r'$\theta$', size=12)
    dimension(a4, 0, -0.9, 4, -0.9, r'$400$ m', offset=(0, -0.3), size=10.5)
    dimension(a4, 4.55, 0, 4.55, 3, r'$h$', offset=(0.22, 0), ha='left')
    arrow(a4, 3.45, 2.8, 3.45, 3.8, color=C['blue'])
    label(a4, 3.3, 3.45, r'$2$ m/s', color=C['blue'], size=10.5, ha='right')
    title(a4, 'A rising balloon', size=11, pad=6)
    fig.tight_layout(h_pad=0.4, w_pad=0.6)
    return fig


def fig_07_2(L):
    """The tangent line as an approximation: dy and Delta y for y = sqrt(x) at 4, and sin(theta) close to theta near 0."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)

    f = np.sqrt
    lin = lambda x: 2 + (x - 4) / 4
    math_axes(a1, (-0.4, 8.9), (-0.35, 3.45), xticks=[(4, r'$a$'), (7, r'$a + dx$')], yticks=[1, 2, 3])
    plot_fn(a1, f, 0, 8.7)
    plot_fn(a1, lin, 0, 8.7, color=C['orange'], lw=1.8, zorder=3)
    xa, xb = 4.0, 7.0
    guide(a1, x=xa, upto=2)
    guide(a1, x=xb, upto=f(xb))
    a1.plot([xa, xb], [2, 2], color=C['slate'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    label(a1, (xa + xb) / 2, 1.8, r'$dx$', color=C['slate'], size=11, ha='center')
    a1.annotate('', xy=(xb + 0.22, lin(xb)), xytext=(xb + 0.22, 2),
                arrowprops=dict(arrowstyle='<|-|>', color=C['orange'], lw=1.3, mutation_scale=9, shrinkA=0, shrinkB=0), zorder=6)
    label(a1, xb + 0.35, (2 + lin(xb)) / 2, r'$dy$', color=C['orange'], size=12)
    a1.annotate('', xy=(xb - 0.22, f(xb)), xytext=(xb - 0.22, 2),
                arrowprops=dict(arrowstyle='<|-|>', color=C['blue'], lw=1.3, mutation_scale=9, shrinkA=0, shrinkB=0), zorder=6)
    label(a1, xb - 0.35, (2 + f(xb)) / 2, r'$\Delta y$', color=C['blue'], size=12, ha='right')
    dot(a1, xa, 2, color=C['navy'], size=6)
    dot(a1, xb, f(xb), color=C['blue'], size=5)
    dot(a1, xb, lin(xb), color=C['orange'], size=5)
    label(a1, 2.3, 1.12, r'$y = \sqrt{x}$', color=C['blue'], size=11)
    label(a1, 8.1, 3.4, r'$y = L(x)$', color=C['orange'], size=11, ha='center')
    title(a1, r'$\Delta y$ and $dy$', size=12)

    math_axes(a2, (-2.2, 2.2), (-1.6, 1.6), xlabel=r'$\theta$', xticks=[-2, -1, 1, 2], yticks=[-1, 1])
    a2.axvspan(-0.5, 0.5, color=C['greenl'], alpha=0.7, zorder=0, lw=0)
    plot_fn(a2, lambda x: x, -2.2, 2.2, color=C['orange'], lw=1.8, zorder=3)
    plot_fn(a2, np.sin, -2.2, 2.2)
    label(a2, 1.25, 1.42, r'$y = \theta$', color=C['orange'], size=11, ha='right')
    label(a2, 1.55, 0.72, r'$y = \sin\theta$', color=C['blue'], size=11)
    label(a2, 0.0, -1.35, r'$|\theta| \leq 0.5$', color=C['green'], size=10.5, ha='center')
    title(a2, r'$\sin\theta \approx \theta$ near $0$', size=12)
    fig.tight_layout(w_pad=2.0)
    return fig


def newton_steps(ax, f, df, x0, n, colour=None, show_vertical=True):
    """Draw n Newton steps from x0: each tangent from (x_k, f(x_k)) down to (x_{k+1}, 0), and the
    dashed guide back up to the curve. Returns the iterates."""
    xs = [x0]
    for _ in range(n):
        xk = xs[-1]
        xn = xk - f(xk) / df(xk)
        ax.plot([xk, xn], [f(xk), 0], color=colour or C['orange'], lw=1.8, zorder=5)
        if show_vertical:
            ax.plot([xn, xn], [0, f(xn)], color=C['slate'], lw=1.1, ls=(0, (4, 3)), zorder=3)
        dot(ax, xk, f(xk), color=C['navy'], size=5.5)
        dot(ax, xn, 0, color=colour or C['orange'], size=5)
        xs.append(xn)
    return xs


def fig_07_3(L):
    """Newton's method for x^2 - 2 from x0 = 3: each tangent line meets the x-axis at the next point."""
    fig, ax = figure(7.6, 3.6)
    f = lambda x: x**2 - 2
    df = lambda x: 2 * x
    math_axes(ax, (-0.25, 3.45), (-1.9, 7.6), xticks=[], yticks=[2, 4, 6])
    plot_fn(ax, f, -0.2, 3.25, lw=2.4)
    xs = newton_steps(ax, f, df, 3.0, 3)
    dot(ax, 3.0, 0, color=C['orange'], size=5)
    ax.plot([3.0, 3.0], [0, f(3.0)], color=C['slate'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    for k, xk in enumerate(xs[:3]):
        label(ax, xk, -0.62, f'$x_{k}$', ha='center', va='top', size=12)
    label(ax, np.sqrt(2) - 0.03, 0.55, r'$\sqrt{2}$', color=C['green'], ha='right', size=12)
    label(ax, 2.55, 6.4, r'$y = x^2 - 2$', color=C['blue'], size=12, ha='right')
    label(ax, 2.2, 1.5, 'tangent at $x_0$', color=C['orange'], size=11)
    return fig


def fig_07_4(L):
    """Two failures of Newton's method: a cycle for x^3 - 2x + 2 from x0 = 0, and iterates that run away for the cube root."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)

    f = lambda x: x**3 - 2 * x + 2
    df = lambda x: 3 * x**2 - 2
    math_axes(a1, (-2.4, 2.1), (-2.6, 5.4), xticks=[-2, -1, 1], yticks=[2, 4])
    plot_fn(a1, f, -2.25, 1.95)
    newton_steps(a1, f, df, 0.0, 2)
    r = -1.7692923542386314
    dot(a1, r, 0, color=C['green'], size=7, hollow=True)
    label(a1, r - 0.05, 0.62, 'root', color=C['green'], size=10.5, ha='center')
    label(a1, 0.08, 2.45, r'$x_0 = x_2 = \cdots$', size=10.5)
    label(a1, 1.05, -0.62, r'$x_1 = x_3$', size=10.5, ha='center', va='top')
    label(a1, -2.3, 4.85, r'$y = x^3 - 2x + 2$', color=C['blue'], size=11)
    title(a1, r'A cycle: $0, 1, 0, 1, \ldots$', size=11)

    g = np.cbrt
    dg = lambda x: 1 / (3 * np.cbrt(x)**2)
    math_axes(a2, (-9.4, 5.4), (-2.5, 2.5), xticks=[-8, -4, 4], yticks=[-2, 2])
    plot_fn(a2, g, -9.3, 5.3, n=4001)
    xs = newton_steps(a2, g, dg, 1.0, 3)
    for k, xk in enumerate(xs):
        if k == 0:
            label(a2, xk + 0.15, 0.12, f'$x_{k}$', ha='left', va='bottom', size=11)
        else:
            label(a2, xk, 0.42 if xk < 0 else -0.42, f'$x_{k}$', ha='center', va='bottom' if xk < 0 else 'top', size=11)
    dot(a2, 0, 0, color=C['green'], size=7, hollow=True)
    label(a2, -8.9, 1.85, r'$y = \sqrt[3]{x}$', color=C['blue'], size=11)
    title(a2, r'Running away: $x_{n+1} = -2x_n$', size=11)
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_07_5(L):
    """L'Hopital's rule: near 0, e^(2x) - 1 and sin 3x are close to their tangent lines 2x and 3x, so their ratio tends to 2/3."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)
    f = lambda x: np.exp(2 * x) - 1
    g = lambda x: np.sin(3 * x)

    math_axes(a1, (-0.65, 0.65), (-1.35, 2.5), xticks=[-0.5, 0.5], yticks=[-1, 1, 2])
    plot_fn(a1, f, -0.65, 0.65, color=C['blue'], label=r'$e^{2x} - 1$')
    plot_fn(a1, lambda x: 2 * x, -0.65, 0.65, color=C['blue'], lw=1.3, ls=(0, (5, 3)), zorder=3, label=r'$2x$')
    plot_fn(a1, g, -0.65, 0.65, color=C['orange'], label=r'$\sin 3x$')
    plot_fn(a1, lambda x: 3 * x, -0.45, 0.65, color=C['orange'], lw=1.3, ls=(0, (5, 3)), zorder=3, label=r'$3x$')
    leg = a1.legend(loc='upper left', bbox_to_anchor=(0.0, 1.0), handlelength=2.2, fontsize=11, labelspacing=0.3,
                    frameon=True, framealpha=1.0, edgecolor='white', facecolor='white', borderpad=0.2)
    leg.set_zorder(9)
    title(a1, 'Numerator and denominator', size=11)

    ratio = lambda x: f(x) / g(x)
    math_axes(a2, (-0.65, 0.65), (-0.3, 2.5), xticks=[-0.5, 0.5], yticks=[1, 2])
    a2.plot([-0.65, 0.65], [2 / 3, 2 / 3], color=C['green'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    plot_fn(a2, ratio, -0.65, 0.65, breaks=[0])
    dot(a2, 0, 2 / 3, hollow=True, size=7)
    label(a2, 0.6, 0.5, r'$y = 2/3$', color=C['green'], size=11, ha='right')
    label(a2, -0.6, 1.55, r'$\dfrac{e^{2x} - 1}{\sin 3x}$', color=C['blue'], size=12)
    title(a2, 'Their ratio', size=11)
    fig.tight_layout(w_pad=2.0)
    return fig


FIGURES = {'fig-07-1': fig_07_1, 'fig-07-2': fig_07_2, 'fig-07-3': fig_07_3, 'fig-07-4': fig_07_4, 'fig-07-5': fig_07_5}
