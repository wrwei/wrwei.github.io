"""Figures of Module 6: Exponentials, logarithms and implicit differentiation."""
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi
E = np.e


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def fig_06_1(L):
    """Slopes of exponentials at x = 0, and tangent lines to e^x whose slope equals the height."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7)

    # Left: 2^x, e^x and 3^x through (0, 1), with their tangent lines there.
    math_axes(a1, (-1.75, 1.75), (-0.65, 4.4), xticks=[-1, 1], yticks=[2, 3, 4])
    bases = ((2.0, CURVES[0], r'$2^x$'), (E, CURVES[2], r'$e^x$'), (3.0, CURVES[1], r'$3^x$'))
    for base, col, _ in bases:
        m = np.log(base)
        a1.plot([-1.25, 1.25], [1 - 1.25 * m, 1 + 1.25 * m], color=col, lw=1.4, ls=(0, (5, 3)), zorder=3)
        plot_fn(a1, lambda x, base=base: base**x, -1.75, 1.75, color=col, lw=2.2)
    dot(a1, 0, 1, color=C['navy'], size=6)
    label(a1, -0.12, 1.32, r'$(0, 1)$', ha='right', size=11)
    label(a1, 0.98, 4.05, r'$3^x$', color=CURVES[1], ha='right', size=12)
    label(a1, 1.47, 3.7, r'$e^x$', color=CURVES[2], size=12)
    label(a1, 1.5, 2.3, r'$2^x$', color=CURVES[0], size=12)
    label(a1, 0.28, 0.83, r'slope $\ln 2 \approx 0.69$', color=CURVES[0], size=10.5)
    label(a1, 0.28, 0.55, r'slope $1$', color=CURVES[2], size=10.5)
    label(a1, 0.28, 0.27, r'slope $\ln 3 \approx 1.10$', color=CURVES[1], size=10.5)
    title(a1, 'Slopes at $x = 0$')

    # Right: tangent lines to e^x; each meets the x-axis 1 unit to the left, so slope = height.
    math_axes(a2, (-2.75, 1.75), (-0.65, 4.4), xticks=[-2, -1, 1], yticks=[2, 3, 4])
    plot_fn(a2, np.exp, -2.75, 1.5, color=CURVES[2], lw=2.4)
    for al, col, hl in ((-1.0, CURVES[3], r'$e^{-1}$'), (0.0, CURVES[1], r'$1$'), (1.0, CURVES[5], r'$e$')):
        ht = np.exp(al)
        a2.fill([al - 1, al, al], [0, 0, ht], color=col, alpha=0.16, lw=0, zorder=2)
        xs = np.array([al - 1, al + 0.42])
        a2.plot(xs, ht * (1 + xs - al), color=col, lw=1.7, zorder=4)
        a2.plot([al, al], [0, ht], color=col, lw=1.3, ls=(0, (4, 3)), zorder=3)
        dot(a2, al, ht, color=col, size=6)
        label(a2, al - 0.5, -0.33, '1', color=col, ha='center', size=11)
        if al < 0:
            label(a2, al - 0.12, ht + 0.3, hl, color=col, size=11, ha='right')
        elif al == 0:
            label(a2, -0.08, 0.5, hl, color=col, size=11, ha='right')
        else:
            label(a2, al + 0.07, 1.35, hl, color=col, size=11)
    label(a2, -2.6, 3.9, 'slope = height', color=C['slate'], size=11)
    label(a2, 1.15, 3.9, r'$y = e^x$', color=CURVES[2], ha='right', size=12)
    title(a2, 'Tangent lines to $y = e^x$')
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_06_2(L):
    """e^x and ln x are mirror images in y = x, and so are their tangent lines: slope m becomes slope 1/m."""
    fig, ax = figure(7.2, 4.3)
    math_axes(ax, (-2.3, 5.4), (-1.35, 3.75), xticks=[1, 2, 3, 4, 5], yticks=[2, 3], aspect='equal')
    ax.plot([-1.35, 3.75], [-1.35, 3.75], color=C['muted'], lw=1.3, ls=(0, (5, 3)), zorder=3)
    plot_fn(ax, np.exp, -2.3, np.log(3.75), color=CURVES[0], lw=2.4)
    plot_fn(ax, np.log, np.exp(-1.35), 5.4, color=CURVES[2], lw=2.4)
    a0 = 0.5
    p = (a0, np.exp(a0))                        # point of y = e^x
    q = (np.exp(a0), a0)                        # its mirror image, on y = ln x
    m = np.exp(a0)
    # Tangent to e^x at p, and its mirror image, the tangent to ln x at q.
    xs = np.array([-0.55, 1.62])
    ax.plot(xs, p[1] + m * (xs - p[0]), color=C['orange'], lw=1.8, zorder=4)
    ys = xs                                     # the mirror segment: swap the coordinates
    ax.plot(p[1] + m * (ys - p[0]), ys, color=C['orange'], lw=1.8, zorder=4)
    # Slope triangle at p (run 1, rise m) and its mirror image at q (rise 1, run m).
    ax.fill([p[0], p[0] + 1, p[0] + 1], [p[1], p[1], p[1] + m], color=C['orangel'], alpha=0.9, lw=0, zorder=2)
    ax.plot([p[0], p[0] + 1, p[0] + 1], [p[1], p[1], p[1] + m], color=C['orange'], lw=1.1, zorder=3)
    ax.fill([q[0], q[0], q[0] + m], [q[1], q[1] + 1, q[1] + 1], color=C['orangel'], alpha=0.9, lw=0, zorder=2)
    ax.plot([q[0], q[0], q[0] + m], [q[1], q[1] + 1, q[1] + 1], color=C['orange'], lw=1.1, zorder=3)
    label(ax, p[0] + 0.5, p[1] - 0.2, '1', ha='center', size=11, color=C['orange'])
    label(ax, p[0] + 1.07, p[1] + m / 2, '1.65', size=11, color=C['orange'])
    label(ax, q[0] - 0.08, q[1] + 0.5, '1', ha='right', size=11, color=C['orange'])
    label(ax, q[0] + m / 2, q[1] + 1.2, '1.65', ha='center', size=11, color=C['orange'])
    dot(ax, *p, color=C['navy'], size=6)
    dot(ax, *q, color=C['navy'], size=6)
    label(ax, -0.15, p[1] - 0.02, r'slope $e^{1/2} \approx 1.65$', ha='right', size=11)   # left of the y-axis
    label(ax, q[0] + 0.25, q[1] - 0.32, r'slope $e^{-1/2} \approx 0.61$', size=11)
    label(ax, -2.15, 0.55, r'$y = e^x$', color=CURVES[0], size=12)
    label(ax, 4.15, 1.1, r'$y = \ln x$', color=CURVES[2], size=12)
    label(ax, 3.05, 3.45, r'$y = x$', color=C['slate'], size=11, ha='right')
    return fig


def fig_06_3(L):
    """A circle and the folium of Descartes, with tangent lines found by implicit differentiation."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.9)

    # The circle x^2 + y^2 = 25 and its tangent at (3, 4), perpendicular to the radius.
    math_axes(a1, (-6.6, 7.4), (-6.2, 6.8), xticks=[3], yticks=[4], aspect='equal')
    plot_param(a1, lambda t: 5 * np.cos(t), lambda t: 5 * np.sin(t), 0, 2 * PI, color=CURVES[0], lw=2.3)
    a1.plot([0, 3], [0, 4], color=C['navy'], lw=1.4, zorder=4)
    xs = np.array([0.4, 7.2])
    a1.plot(xs, 4 - 0.75 * (xs - 3), color=C['orange'], lw=2.0, zorder=5)
    # A right-angle mark at (3, 4), along the radius (back towards O) and the tangent.
    ur, ut = np.array([-0.6, -0.8]), np.array([0.8, -0.6])
    s = 0.6
    pts = np.array([[3, 4] + s * ur, [3, 4] + s * ur + s * ut, [3, 4] + s * ut])
    a1.plot(pts[:, 0], pts[:, 1], color=C['navy'], lw=1.1, zorder=5)
    dot(a1, 3, 4, color=C['navy'], size=6)
    label(a1, 3.25, 4.65, r'$(3, 4)$', size=11)
    label(a1, 4.15, 3.85, r'slope $-\frac{3}{4}$', color=C['orange'], size=11)
    label(a1, 1.55, 1.0, r'slope $\frac{4}{3}$', color=C['navy'], size=11)
    label(a1, -4.7, 5.6, r'$x^2 + y^2 = 25$', color=CURVES[0], size=11)
    title(a1, 'A circle')

    # The folium of Descartes x^3 + y^3 = 6xy, from its parametrisation x = 6t/(1+t^3), y = 6t^2/(1+t^3).
    math_axes(a2, (-4.3, 4.8), (-4.3, 4.8), xticks=[-2, 2, 4], yticks=[-2, 2, 4], aspect='equal')
    fx = lambda t: 6 * t / (1 + t**3)
    fy = lambda t: 6 * t**2 / (1 + t**3)
    for t0, t1 in ((0.0, 1.0), (-0.82, 0.0)):   # each piece and its mirror image in y = x (t -> 1/t)
        ts = np.linspace(t0, t1, 800)
        a2.plot(fx(ts), fy(ts), color=CURVES[0], lw=2.3, zorder=4)
        a2.plot(fy(ts), fx(ts), color=CURVES[0], lw=2.3, zorder=4)
    xa = np.array([-4.3, 2.3])
    a2.plot(xa, -2 - xa, color=C['muted'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    xs = np.array([1.5, 4.6])
    a2.plot(xs, 6 - xs, color=C['orange'], lw=2.0, zorder=5)
    xt, yt = 2 ** (4 / 3), 2 ** (5 / 3)
    a2.plot([xt - 0.95, xt + 0.95], [yt, yt], color=C['green'], lw=2.0, zorder=5)
    dot(a2, 3, 3, color=C['navy'], size=6)
    dot(a2, xt, yt, color=C['green'], size=6)
    dot(a2, 0, 0, color=C['slate'], size=5)
    label(a2, 3.25, 3.25, r'$(3, 3)$', size=11)
    label(a2, 2.0, 4.45, r'slope $-1$', color=C['orange'], size=11)
    label(a2, xt, yt + 0.55, 'horizontal', color=C['green'], size=11, ha='center')
    label(a2, -4.1, 3.6, r'$x^3 + y^3 = 6xy$', color=CURVES[0], size=11)
    label(a2, -4.15, -0.95, r'$x + y = -2$', color=C['slate'], size=10)
    title(a2, 'The folium of Descartes')
    fig.tight_layout(w_pad=1.6)
    return fig


def fig_06_4(L):
    """The inverse trigonometric functions arcsin, arccos and arctan, mirror images of restricted sin, cos and tan."""
    fig, ax = figure_grid(1, 3, w=7.6, h=3.3)
    h = r'$\pi/2$'
    mh = r'$-\pi/2$'

    a = ax[0]
    math_axes(a, (-2.0, 2.0), (-2.0, 2.0), xticks=[(-1, r'$-1$'), (1, r'$1$')], yticks=[(-PI / 2, mh), (PI / 2, h)],
              aspect='equal', xlabel='', ylabel='')
    a.plot([-2, 2], [-2, 2], color=C['muted'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    plot_fn(a, np.sin, -PI / 2, PI / 2, color=C['orange'], lw=1.8)
    plot_fn(a, np.arcsin, -1, 1, n=3000, color=C['blue'], lw=2.6)
    for s in (-1, 1):
        dot(a, s, s * PI / 2, color=C['blue'], size=5)
        dot(a, s * PI / 2, s, color=C['orange'], size=5)
    label(a, -1.9, 1.75, r'$\arcsin x$', color=C['blue'], size=11)
    label(a, 0.35, -1.65, r'$\sin x$', color=C['orange'], size=11)
    panel_title(a, r'$\arcsin$: values in $[-\pi/2, \pi/2]$', size=11)

    a = ax[1]
    math_axes(a, (-1.6, 3.6), (-1.6, 3.6), xticks=[(-1, r'$-1$'), (1, r'$1$'), (PI, r'$\pi$')],
              yticks=[(PI / 2, h), (PI, r'$\pi$')], aspect='equal', xlabel='', ylabel='')
    a.plot([-1.6, 3.6], [-1.6, 3.6], color=C['muted'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    plot_fn(a, np.cos, 0, PI, color=C['orange'], lw=1.8)
    plot_fn(a, np.arccos, -1, 1, n=3000, color=C['blue'], lw=2.6)
    dot(a, -1, PI, color=C['blue'], size=5)
    dot(a, 1, 0, color=C['blue'], size=5)
    dot(a, 0, 1, color=C['orange'], size=5)
    dot(a, PI, -1, color=C['orange'], size=5)
    label(a, -1.45, 3.45, r'$\arccos x$', color=C['blue'], size=11)
    label(a, 1.9, -1.05, r'$\cos x$', color=C['orange'], size=11)
    panel_title(a, r'$\arccos$: values in $[0, \pi]$', size=11)

    a = ax[2]
    math_axes(a, (-4.3, 4.3), (-4.3, 4.3), xticks=[(-3, r'$-3$'), (3, r'$3$')], yticks=[],
              aspect='equal', xlabel='', ylabel='')
    a.plot([-4.3, 4.3], [-4.3, 4.3], color=C['muted'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    for s in (-1, 1):
        a.plot([-4.3, 4.3], [s * PI / 2] * 2, color=C['slate'], lw=1.0, ls=(0, (2, 3)), zorder=3)
    plot_fn(a, np.tan, -1.34, 1.34, color=C['orange'], lw=1.8)
    plot_fn(a, np.arctan, -4.3, 4.3, color=C['blue'], lw=2.6)
    label(a, 1.2, 2.25, r'$\arctan x$', color=C['blue'], size=11)
    label(a, -4.15, PI / 2 + 0.42, r'$y = \pi/2$', color=C['slate'], size=10.5)
    label(a, 4.15, -PI / 2 - 0.45, r'$y = -\pi/2$', color=C['slate'], size=10.5, ha='right')
    label(a, 1.45, 3.6, r'$\tan x$', color=C['orange'], size=11)
    panel_title(a, r'$\arctan$: values in $(-\pi/2, \pi/2)$', size=11)
    fig.tight_layout(w_pad=1.0)
    return fig


def fig_06_5(L):
    """The hyperbolic functions cosh, sinh and tanh, and a hanging chain (catenary) compared with a parabola."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7)

    math_axes(a1, (-2.7, 2.7), (-3.8, 4.4), xticks=[-2, -1, 1, 2], yticks=[-3, -2, -1, 1, 2, 3, 4])
    for s in (-1, 1):
        a1.plot([-2.7, 2.7], [s, s], color=C['muted'], lw=1.0, ls=(0, (2, 3)), zorder=3)
    plot_fn(a1, lambda x: np.exp(x) / 2, 0.6, 2.7, color=C['slate'], lw=1.3, ls=(0, (1, 2.5)))
    plot_fn(a1, np.cosh, -2.7, 2.7, color=CURVES[0], lw=2.3)
    plot_fn(a1, np.sinh, -2.7, 2.7, color=CURVES[1], lw=2.3)
    plot_fn(a1, np.tanh, -2.7, 2.7, color=CURVES[2], lw=2.3)
    label(a1, -2.6, 2.7, r'$\cosh x$', color=CURVES[0], size=11)
    label(a1, -0.25, -2.6, r'$\sinh x$', color=CURVES[1], size=11, ha='right')
    label(a1, 1.25, 0.55, r'$\tanh x$', color=CURVES[2], size=11)
    label(a1, 1.95, 2.05, r'$\frac{1}{2}e^x$', color=C['slate'], size=12)
    title(a1, 'Hyperbolic functions')

    c2 = np.cosh(2)
    par = lambda x: 1 + (c2 - 1) * x**2 / 4
    math_axes(a2, (-2.7, 2.7), (-0.35, 4.4), xticks=[-2, -1, 1, 2], yticks=[2, 3, 4])
    for s in (-1, 1):
        a2.plot([s * 2, s * 2], [0, c2 + 0.35], color=C['slate'], lw=4.0, solid_capstyle='butt', zorder=3)
    plot_fn(a2, par, -2, 2, color=C['orange'], lw=1.9, ls=(0, (5, 3)))
    plot_fn(a2, np.cosh, -2, 2, color=C['blue'], lw=2.4)
    for s in (-1, 1):
        dot(a2, s * 2, c2, color=C['navy'], size=6)
    dot(a2, 0, 1, color=C['navy'], size=5)
    label(a2, 0, 0.55, 'lowest point', size=10, ha='center', color=C['slate'])
    label(a2, 0.2, 3.5, 'catenary', color=C['blue'], size=11)
    label(a2, 0.2, 3.12, r'$y = \cosh x$', color=C['blue'], size=11)
    label(a2, 0.2, 2.6, 'parabola', color=C['orange'], size=11)
    title(a2, 'A hanging chain')
    fig.tight_layout(w_pad=2.0)
    return fig


FIGURES = {'fig-06-1': fig_06_1, 'fig-06-2': fig_06_2, 'fig-06-3': fig_06_3, 'fig-06-4': fig_06_4, 'fig-06-5': fig_06_5}
