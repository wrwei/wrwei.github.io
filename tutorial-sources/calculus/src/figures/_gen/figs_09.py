"""Figures of Module 9: Area and the definite integral."""
import matplotlib
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def fig_09_1(L):
    """An area and a distance trapped between a lower and an upper sum of rectangles."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.5)

    # The area under y = x^2 from 0 to 1, with 4 strips.
    f = lambda x: x**2
    math_axes(a1, (-0.12, 1.25), (-0.14, 1.2), xticks=[0.25, 0.5, 0.75, 1], yticks=[0.5, 1])
    riemann(a1, f, 0, 1, 4, 'right', color=C['orange'], alpha=0.10, edge=C['orange'])
    riemann(a1, f, 0, 1, 4, 'left', color=C['sky'], alpha=0.45, edge=C['sky'])
    plot_fn(a1, f, -0.1, 1.09)
    label(a1, 0.07, 1.12, 'upper sum 0.46875', color=C['orange'], size=11)
    label(a1, 0.07, 0.98, 'lower sum 0.21875', color=C['sky'], size=11)
    label(a1, 1.03, 0.72, r'$y = x^2$', color=C['blue'], size=11)
    title(a1, 'The area problem')

    # The distance from speed readings every 2 seconds (a car speeding up).
    V = [0, 6, 11, 15, 18, 20]
    g = lambda t: V[int(round(t / 2))]
    math_axes(a2, (-0.7, 11.6), (-2.0, 25.5), xlabel=r'$t$ (s)', ylabel=r'$v$ (m/s)', xticks=[2, 4, 6, 8, 10],
              yticks=[5, 10, 15, 20])
    riemann(a2, g, 0, 10, 5, 'right', color=C['orange'], alpha=0.10, edge=C['orange'])
    riemann(a2, g, 0, 10, 5, 'left', color=C['sky'], alpha=0.45, edge=C['sky'])
    for k, v in enumerate(V):
        dot(a2, 2 * k, v, color=C['navy'], size=5.5)
    label(a2, 0.3, 23.6, 'upper sum 140 m', color=C['orange'], size=11)
    label(a2, 0.3, 20.8, 'lower sum 100 m', color=C['sky'], size=11)
    title(a2, 'The distance problem', pad=30)
    fig.tight_layout(w_pad=2.2)
    return fig


def fig_09_2(L):
    """Left, right and midpoint sums with 4 rectangles for f(x) = 1/x on [1, 2]."""
    fig, axs = figure_grid(1, 3, w=7.6, h=3.0)
    f = lambda x: 1 / x
    names = (('left', r'left: $L_4 \approx 0.7595$'), ('right', r'right: $R_4 \approx 0.6345$'),
             ('mid', r'midpoint: $M_4 \approx 0.6912$'))
    for ax, (rule, head) in zip(axs, names):
        math_axes(ax, (-0.12, 2.35), (-0.12, 1.42), xticks=[1, 1.5, 2], yticks=[0.5, 1], ylabel='')
        riemann(ax, f, 1, 2, 4, rule, color=C['sky'], alpha=0.45, edge=C['sky'])
        plot_fn(ax, f, 0.72, 2.3)
        dx = 0.25
        for i in range(4):
            xs = {'left': 1 + i * dx, 'right': 1 + (i + 1) * dx, 'mid': 1 + (i + 0.5) * dx}[rule]
            dot(ax, xs, f(xs), color=C['navy'], size=5)
        label(ax, 0.1, 1.3, r'$y = \dfrac{1}{x}$', color=C['blue'], size=11)
        panel_title(ax, head, size=11)
    fig.tight_layout(w_pad=0.8)
    return fig


def fig_09_3(L):
    """A Riemann sum over an uneven partition with arbitrary sample points, and the signed area of x^2 - 2x on [0, 3]."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.5)

    # A general Riemann sum: an uneven partition, sample points anywhere in the subintervals.
    f = lambda x: 1.25 + 0.55 * np.sin(1.35 * x - 0.5) + 0.12 * x
    xs = [0.4, 1.15, 1.6, 2.65, 3.1, 4.0]
    star = [0.62, 1.48, 2.35, 2.78, 3.7]
    ticks = [(p, f'$x_{k}$') for k, p in enumerate(xs)]
    math_axes(a1, (-0.15, 4.55), (-0.15, 2.5), xticks=ticks, yticks=[], ticklabels=True)
    shade(a1, f, xs[0], xs[-1], color=C['blue'], alpha=0.08)
    for i in range(5):
        h = f(star[i])
        a1.add_patch(matplotlib.patches.Rectangle((xs[i], 0), xs[i + 1] - xs[i], h, facecolor=C['sky'], alpha=0.40, lw=0, zorder=2))
        a1.add_patch(matplotlib.patches.Rectangle((xs[i], 0), xs[i + 1] - xs[i], h, facecolor='none', edgecolor=C['sky'], lw=1.2, zorder=3))
        a1.plot([star[i], star[i]], [0, h], color=C['navy'], lw=1.0, ls=(0, (3, 2.5)), zorder=4)
        dot(a1, star[i], h, color=C['navy'], size=5)
    plot_fn(a1, f, 0.05, 4.4)
    label(a1, star[2] + 0.07, 0.22, r'$x_3^*$', color=C['navy'], size=12)
    a1.annotate('', xy=(xs[3], 2.16), xytext=(xs[2], 2.16),
                arrowprops=dict(arrowstyle='<->', color=C['slate'], lw=1.1, shrinkA=0, shrinkB=0))
    label(a1, (xs[2] + xs[3]) / 2, 2.34, r'$\Delta x_3$', color=C['slate'], size=12, ha='center')
    label(a1, 4.05, 2.12, r'$y = f(x)$', color=C['blue'], size=11)
    title(a1, 'A Riemann sum')

    # Signed area: x^2 - 2x is below the axis on (0, 2) and above it on (2, 3).
    g = lambda x: x**2 - 2 * x
    math_axes(a2, (-0.45, 3.45), (-1.55, 3.6), xticks=[1, 2, 3], yticks=[-1, 1, 2, 3])
    xs2 = np.linspace(0, 3, 400)
    a2.fill_between(xs2, 0, g(xs2), where=g(xs2) <= 0, color=C['orange'], alpha=0.30, lw=0, zorder=2)
    a2.fill_between(xs2, 0, g(xs2), where=g(xs2) >= 0, color=C['blue'], alpha=0.25, lw=0, zorder=2)
    plot_fn(a2, g, -0.32, 3.3)
    label(a2, 0.6, -0.45, r'$-\frac{4}{3}$', color=C['orange'], size=14, ha='center')
    label(a2, 2.8, 0.75, r'$+\frac{4}{3}$', color=C['blue'], size=14, ha='center')
    label(a2, 0.1, 2.85, r'$y = x^2 - 2x$', color=C['blue'], size=11)
    title(a2, r'$\int_0^3 (x^2 - 2x)\,dx = 0$')
    fig.tight_layout(w_pad=2.2)
    return fig


def fig_09_4(L):
    """Integrals from geometry and symmetry: a semicircle, an odd function, an even function."""
    fig, axs = figure_grid(1, 3, w=7.6, h=3.1)

    # A semicircle of radius 2 centred at (2, 0): y = sqrt(4x - x^2).
    a = axs[0]
    sc = lambda x: np.sqrt(np.maximum(4 * x - x**2, 0))
    math_axes(a, (-0.5, 4.6), (-0.7, 3.3), xticks=[2, 4], yticks=[1, 2], ylabel='')
    a.set_aspect('equal', adjustable='datalim')
    shade(a, sc, 0, 4, color=C['blue'], alpha=0.25, n=800)
    plot_fn(a, sc, 0, 4, n=3000)
    label(a, 2, 0.75, r'$2\pi$', color=C['navy'], size=14, ha='center')
    label(a, 2.0, 2.6, r'$y = \sqrt{4x - x^2}$', color=C['blue'], size=10.5, ha='center')
    title(a, 'geometry', size=11, pad=14)

    # An odd function: each region has a mirror image of the opposite sign.
    a = axs[1]
    o = lambda x: x**3 - 3 * x
    # The curve crosses the axis at -sqrt(3), right next to the place of the tick label -2 below the axis; that
    # label goes above the axis instead, where the graph is not, mirroring the label 2 below it on the right.
    math_axes(a, (-2.45, 2.45), (-2.6, 2.6), xticks=[(-2, ''), (2, '2')], yticks=[-2, 2], ylabel='')
    label(a, -2, 0.2, '−2', color=C['slate'], size=10, ha='center', va='bottom', halo=True)
    xs = np.linspace(-2, 2, 800)
    a.fill_between(xs, 0, o(xs), where=o(xs) >= 0, color=C['blue'], alpha=0.25, lw=0, zorder=2)
    a.fill_between(xs, 0, o(xs), where=o(xs) <= 0, color=C['orange'], alpha=0.30, lw=0, zorder=2)
    plot_fn(a, o, -2.1, 2.1)
    for xc, yc, txt, col in ((-1.0, 0.75, '+', C['blue']), (1.0, -0.75, r'$-$', C['orange'])):
        label(a, xc, yc, txt, color=col, size=14, ha='center')
    title(a, r'odd: $\int_{-a}^{a} f = 0$', size=11, pad=14)

    # An even function: the two halves have equal areas.
    a = axs[2]
    e = lambda x: 2.4 - 0.6 * x**2
    math_axes(a, (-2.45, 2.45), (-0.6, 3.0), xticks=[(-1.5, r'$-a$'), (1.5, r'$a$')], yticks=[1, 2], ylabel='')
    shade(a, e, -1.5, 0, color=C['blue'], alpha=0.25)
    shade(a, e, 0, 1.5, color=C['green'], alpha=0.25)
    plot_fn(a, e, -2.0, 2.0)
    label(a, -0.72, 0.8, r'$A$', color=C['navy'], size=13, ha='center')
    label(a, 0.72, 0.8, r'$A$', color=C['navy'], size=13, ha='center')
    title(a, r'even: $\int_{-a}^{a} f = 2\int_0^{a} f$', size=11, pad=14)
    fig.tight_layout(w_pad=0.8)
    return fig


def fig_09_5(L):
    """The average value of x^2 on [-2, 2]: a rectangle of height 4/3 has the same area as the region under the graph."""
    fig, ax = figure(7.0, 3.7)
    f = lambda x: x**2
    avg = 4 / 3
    c = 2 / np.sqrt(3)
    math_axes(ax, (-2.9, 2.9), (-0.45, 4.6), xticks=[-2, 2], yticks=[1, 2, 3, 4])
    shade(ax, f, -2, 2, color=C['blue'], alpha=0.22)
    ax.plot([-2, -2, 2, 2], [0, avg, avg, 0], color=C['orange'], lw=2.0, ls=(0, (5, 3)), zorder=5)
    plot_fn(ax, f, -2.2, 2.2)
    for xc in (-c, c):
        ax.plot([xc, xc], [0, avg], color=C['navy'], lw=1.0, ls=(0, (3, 2.5)), zorder=5)
        dot(ax, xc, avg, color=C['navy'], size=6)
    label(ax, -c, -0.22, r'$-\frac{2}{\sqrt{3}}$', color=C['navy'], size=12, ha='center', va='top')
    label(ax, c, -0.22, r'$\frac{2}{\sqrt{3}}$', color=C['navy'], size=12, ha='center', va='top')
    label(ax, 2.1, avg, r'$f_{\mathrm{avg}} = \frac{4}{3}$', color=C['orange'], size=12)
    label(ax, -2.75, 3.4, r'$y = x^2$', color=C['blue'], size=12)
    return fig


FIGURES = {'fig-09-1': fig_09_1, 'fig-09-2': fig_09_2, 'fig-09-3': fig_09_3, 'fig-09-4': fig_09_4, 'fig-09-5': fig_09_5}
