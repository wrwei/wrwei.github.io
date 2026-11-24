"""Figures of Module 4: The derivative."""
import numpy as np
from matplotlib.patches import Rectangle
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def fig_04_1(L):
    """Zooming in on y = x^3 at the point (1, 1): the curve becomes indistinguishable from its tangent line y = 3x - 2."""
    fig, axs = figure_grid(1, 3, w=7.6, h=3.2)
    f = lambda x: x**3
    T = lambda x: 3 * x - 2
    # Each window is ten times smaller than the one before, in both directions, so the tangent
    # line keeps the same steepness on the page while the bending of the curve fades away.
    wins = [(1.5, 4.5), (0.15, 0.45), (0.015, 0.045)]
    ticks = [([0, 1, 2], [-2, 2, 4]), ([0.9, 1, 1.1], [0.7, 1, 1.3]), ([0.99, 1, 1.01], [0.97, 1, 1.03])]
    names = ['width 3', 'width 0.3', 'width 0.03']
    for k, (ax, (wx, wy), (xt, yt)) in enumerate(zip(axs, wins, ticks)):
        x0, x1, y0, y1 = 1 - wx, 1 + wx, 1 - wy, 1 + wy
        math_axes(ax, (x0, x1), (y0, y1), xticks=xt, yticks=yt, xlabel='', ylabel='')
        plot_fn(ax, f, x0, x1, lw=2.6)
        ax.plot([x0, x1], [T(x0), T(x1)], color=C['orange'], lw=1.8, ls=(0, (5, 3)), zorder=5)
        dot(ax, 1, 1, color=C['navy'], size=6)
        if k < 2:   # the next window, drawn as a box
            nx, ny = wins[k + 1]
            ax.add_patch(Rectangle((1 - nx, 1 - ny), 2 * nx, 2 * ny, fill=False, edgecolor=C['slate'], lw=1.2, zorder=6))
        panel_title(ax, names[k], size=11)
    label(axs[0], 0.12, 4.75, r'$y = x^3$', color=C['blue'], size=11)
    label(axs[0], 2.45, 1.9, 'tangent', color=C['orange'], size=11, ha='right')
    label(axs[0], 1.22, 0.45, r'$(1, 1)$', size=10.5)
    label(axs[2], 0.9875, 1.036, 'curve and tangent\nlook the same', color=C['slate'], size=10, va='top')
    fig.tight_layout(w_pad=1.6)
    return fig


def fig_04_2(L):
    """The graph of f(x) = x^3 - 3x with five tangent lines (top) and the graph of its derivative f'(x) = 3x^2 - 3 (bottom)."""
    fig, (a1, a2) = figure_grid(2, 1, w=7.6, h=4.9, gridspec_kw={'hspace': 0.35})
    f = lambda x: x**3 - 3 * x
    df = lambda x: 3 * x**2 - 3
    xs0 = [-2, -1, 0, 1, 2]

    math_axes(a1, (-2.6, 2.6), (-3.2, 3.2), xticks=[-2, -1, 1, 2], yticks=[-2, 2])
    plot_fn(a1, f, -2.45, 2.45, lw=2.6)
    for x0 in xs0:
        m = df(x0)
        dx = 0.42 / np.sqrt(1 + (0.23 * m)**2)     # segments of about the same length on the page
        a1.plot([x0 - dx, x0 + dx], [f(x0) - m * dx, f(x0) + m * dx], color=C['orange'], lw=2.0, zorder=5)
        dot(a1, x0, f(x0), color=C['navy'], size=5)
    label(a1, 1.42, -2.55, r'$y = f(x) = x^3 - 3x$', color=C['blue'], size=11.5)
    label(a1, -2.2, 0.55, 'rises', color=C['slate'], size=10.5, ha='center')
    label(a1, 0.38, 1.45, 'falls', color=C['slate'], size=10.5, ha='center')
    label(a1, 2.2, 0.55, 'rises', color=C['slate'], size=10.5, ha='center')

    math_axes(a2, (-2.6, 2.6), (-4.6, 11), xticks=[-2, -1, 1, 2], yticks=[3, 6, 9])
    plot_fn(a2, df, -2.45, 2.45, color=C['purple'], lw=2.6)
    for x0 in xs0:
        dot(a2, x0, df(x0), color=C['orange'], size=6)
    # Two lines, so that the label fits between the y-axis and the dashed line at x = 1.
    label(a2, 0.14, 8.4, r"$y = f'(x)$" + '\n' + r"$\quad = 3x^2 - 3$", color=C['purple'], size=11.5, linespacing=1.5)
    label(a2, -2.0, 2.0, r"$f' > 0$", color=C['slate'], size=10.5, ha='center')
    label(a2, 0.45, -0.9, r"$f' < 0$", color=C['slate'], size=10.5, ha='center')
    label(a2, 2.0, 2.0, r"$f' > 0$", color=C['slate'], size=10.5, ha='center')
    label(a2, -1.86, 9.7, 'slope 9', color=C['orange'], size=10)
    label(a2, 0.16, -3.85, 'slope $-3$', color=C['orange'], size=10)

    # Horizontal tangents of f line up with the zeros of f'.
    for x0 in (-1, 1):
        for ax, (lo, hi) in ((a1, (-3.2, 3.2)), (a2, (-4.6, 11))):
            ax.plot([x0, x0], [lo, hi], ls=(0, (4, 3)), color=C['muted'], lw=1.1, zorder=2)
    return fig


def fig_04_3(L):
    """Four ways to fail to have a derivative at 0: a corner, a cusp, a vertical tangent and a jump."""
    fig, ax = figure_grid(1, 4, w=7.6, h=3.0)
    lab = dict(size=10.5)

    a = ax[0]
    math_axes(a, (-1.6, 1.6), (-0.7, 1.9), xticks=[-1, 1], yticks=[1], xlabel='', ylabel='')
    for s in (-1, 1):
        a.plot([-1.6, 1.6], [s * -1.6, s * 1.6], color=C['orange'], lw=1.3, ls=(0, (4, 3)), zorder=3)
    plot_fn(a, np.abs, -1.6, 1.6, lw=2.4)
    dot(a, 0, 0, color=C['navy'], size=5)
    label(a, 0.55, 1.6, r'$y = |x|$', color=C['blue'], **lab)
    panel_title(a, 'corner', size=11)

    a = ax[1]
    math_axes(a, (-1.6, 1.6), (-0.7, 1.9), xticks=[-1, 1], yticks=[1], xlabel='', ylabel='')
    plot_fn(a, lambda x: np.cbrt(x**2), -1.6, 1.6, lw=2.4, n=4001)
    dot(a, 0, 0, color=C['navy'], size=5)
    label(a, 0.1, 1.6, r'$y = x^{2/3}$', color=C['blue'], **lab)
    panel_title(a, 'cusp', size=11)

    a = ax[2]
    math_axes(a, (-1.6, 1.6), (-1.45, 1.45), xticks=[-1, 1], yticks=[-1, 1], xlabel='', ylabel='')
    a.plot([0, 0], [-1.45, 1.45], color=C['orange'], lw=1.8, ls=(0, (4, 3)), zorder=5)
    plot_fn(a, np.cbrt, -1.6, 1.6, lw=2.4, n=4001)
    dot(a, 0, 0, color=C['navy'], size=5)
    label(a, 0.35, -0.75, r'$y = x^{1/3}$', color=C['blue'], **lab)
    panel_title(a, 'vertical tangent', size=11)

    a = ax[3]
    math_axes(a, (-1.6, 1.6), (-0.7, 1.9), xticks=[-1, 1], yticks=[1], xlabel='', ylabel='')
    plot_fn(a, lambda x: 0 * x, -1.6, 0, lw=2.4)
    plot_fn(a, lambda x: 0 * x + 1, 0, 1.6, lw=2.4)
    dot(a, 0, 0, hollow=True, size=6)
    dot(a, 0, 1, size=6)
    label(a, 0.2, 1.45, r'$y = H(x)$', color=C['blue'], **lab)
    panel_title(a, 'jump', size=11)

    fig.tight_layout(w_pad=0.9)
    return fig


def fig_04_4(L):
    """Position, velocity and acceleration of a particle with s(t) = t^3 - 6t^2 + 9t, stacked on one time axis."""
    fig, (a1, a2, a3) = figure_grid(3, 1, w=7.6, h=5.4, gridspec_kw={'hspace': 0.3, 'height_ratios': [1, 1.2, 1]})
    s = lambda t: t**3 - 6 * t**2 + 9 * t
    v = lambda t: 3 * t**2 - 12 * t + 9
    acc = lambda t: 6 * t - 12
    T1 = 4.35
    panels = ((a1, s, (-1.5, 7.5), [2, 4, 6], C['blue'], r'position $s(t) = t^3 - 6t^2 + 9t$', (1.55, 5.9)),
              (a2, v, (-8, 13.5), [-3, 3, 6, 9], C['purple'], r"velocity $v(t) = s'(t) = 3t^2 - 12t + 9$", (1.3, 10.2)),
              (a3, acc, (-15, 16), [-12, -6, 6, 12], C['green'], r"acceleration $a(t) = v'(t) = 6t - 12$", (0.12, 11.5)))
    for ax, fn, ylim, yt, col, name, (lx, ly) in panels:
        math_axes(ax, (-0.15, T1), ylim, xticks=[1, 2, 3, 4], yticks=yt, xlabel='$t$', ylabel='')
        for t0 in (1, 2, 3):
            ax.plot([t0, t0], list(ylim), ls=(0, (4, 3)), color=C['muted'], lw=1.1, zorder=2)
        plot_fn(ax, fn, 0, 4.25, color=col, lw=2.5)
        label(ax, lx, ly, name, color=col, size=11)
    for ax in (a1, a2):            # one row of time labels, under the last panel
        ax.set_xticklabels([])
    dot(a1, 1, 4, color=C['navy'], size=5)
    dot(a1, 3, 0, color=C['navy'], size=5)
    for t0 in (1, 3):
        a1.plot([t0 - 0.3, t0 + 0.3], [s(t0)] * 2, color=C['orange'], lw=2.0, zorder=5)
        dot(a2, t0, 0, color=C['navy'], size=5)
    dot(a2, 2, -3, color=C['navy'], size=5)
    a2.plot([1.7, 2.3], [-3, -3], color=C['orange'], lw=2.0, zorder=5)
    dot(a3, 2, 0, color=C['navy'], size=5)
    label(a2, 0.36, 1.3, r'$v > 0$', color=C['slate'], size=10.5, ha='center')
    label(a2, 2.0, -5.6, r'$v < 0$', color=C['slate'], size=10.5, ha='center')
    label(a2, 3.78, 1.3, r'$v > 0$', color=C['slate'], size=10.5, ha='center')
    label(a3, 0.42, -5.0, r'$a < 0$', color=C['slate'], size=10.5, ha='center')
    label(a3, 3.45, 2.4, r'$a > 0$', color=C['slate'], size=10.5, ha='center')
    return fig


def along(ax, x0, x1, y0, y1, text, color, size=11, offset=7):
    """Text written along the segment from (x0, y0) to (x1, y1), centred on it and lifted by `offset` points."""
    import matplotlib.transforms as mtransforms
    ax.figure.canvas.draw()
    p0, p1 = ax.transData.transform((x0, y0)), ax.transData.transform((x1, y1))
    ang = np.degrees(np.arctan2(p1[1] - p0[1], p1[0] - p0[0]))
    xm, ym = np.sqrt(x0 * x1), np.sqrt(y0 * y1)        # the middle, on log axes
    nx, ny = -np.sin(np.radians(ang)), np.cos(np.radians(ang))
    tr = ax.transData + mtransforms.ScaledTranslation(nx * offset / 72, ny * offset / 72, ax.figure.dpi_scale_trans)
    return label(ax, xm, ym, text, color=color, size=size, ha='center', va='bottom', rotation=ang,
                 rotation_mode='anchor', transform=tr)


def fig_04_5(L):
    """The errors of the forward and central differences of f(x) = x^3 at a = 1, against the step h, on log-log axes."""
    fig, ax = figure(7.6, 4.3)
    f = lambda x: x**3
    a, exact = 1.0, 3.0
    hs = np.logspace(-16, 0, 481)
    with np.errstate(all='ignore'):     # the sizes of the errors, exact value minus estimate
        fwd = np.abs(exact - (f(a + hs) - f(a)) / hs)
        cen = np.abs(exact - (f(a + hs) - f(a - hs)) / (2 * hs))
    fwd[fwd == 0] = np.nan
    cen[cen == 0] = np.nan
    eps = np.finfo(float).eps
    ax.set_xscale('log')
    ax.set_yscale('log')
    ax.set_xlim(1e-16, 1)
    ax.set_ylim(1e-12, 1e2)
    for side in ('top', 'right'):
        ax.spines[side].set_visible(False)
    for side in ('left', 'bottom'):
        ax.spines[side].set_color(C['navy'])
        ax.spines[side].set_linewidth(1.1)
    ax.grid(True, which='major', color=C['grid'], linewidth=0.8, zorder=0)
    ax.set_axisbelow(True)
    ax.set_xticks([10.0**k for k in range(-16, 1, 2)])
    ax.set_xticklabels([f'$10^{{{k}}}$' if k else '$1$' for k in range(-16, 1, 2)])
    ax.set_yticks([10.0**k for k in range(-12, 3, 2)])
    ax.set_yticklabels([f'$10^{{{k}}}$' if k else '$1$' for k in range(-12, 3, 2)])
    ax.minorticks_off()
    ax.tick_params(labelsize=11)
    ax.set_xlabel(r'step $h$', fontsize=11.5, color=C['navy'])
    ax.set_ylabel('size of the error', fontsize=11.5, color=C['navy'])

    ref = np.logspace(-16, 0, 50)
    ax.plot(ref, 3 * ref, color=CURVES[0], lw=1.1, ls=(0, (4, 3)), zorder=3)
    ax.plot(ref, ref**2, color=CURVES[1], lw=1.1, ls=(0, (4, 3)), zorder=3)
    ax.plot(ref, eps / ref, color=C['slate'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    ax.plot(hs, fwd, color=CURVES[0], lw=1.7, zorder=4)
    ax.plot(hs, cen, color=CURVES[1], lw=1.7, zorder=4)

    along(ax, 1e-7, 1e-3, 3e-7, 3e-3, r'forward difference: size $\approx 3h$', CURVES[0])
    along(ax, 3e-4, 2e-1, 9e-8, 4e-2, r'central: size $\approx h^2$', CURVES[1], offset=-22)
    along(ax, 1e-15, 1e-11, eps / 1e-15, eps / 1e-11, r'rounding error: size $\approx \varepsilon/h$', C['slate'], offset=13)
    for hstar, col, txt in ((np.sqrt(eps / 3), CURVES[0], r'best $h$' + '\nforward'),
                            ((eps / 2)**(1 / 3), CURVES[1], r'best $h$' + '\ncentral')):
        ax.plot([hstar, hstar], [1e-12, 1e2], color=col, lw=1.0, ls=(0, (1, 2.5)), zorder=2)
        label(ax, hstar, 3e1, txt, color=col, size=10, ha='center', va='center')
    return fig


FIGURES = {'fig-04-1': fig_04_1, 'fig-04-2': fig_04_2, 'fig-04-3': fig_04_3, 'fig-04-4': fig_04_4, 'fig-04-5': fig_04_5}
