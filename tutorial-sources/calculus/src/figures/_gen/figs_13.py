"""Figures of Module 13: Differential equations."""
import numpy as np
from matplotlib.collections import LineCollection
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def field(ax, F, cell=21, length=0.66, color=None, lw=1.1):
    """The direction field of y' = F(t, y): short segments of equal length on the page, centred on a grid of
    roughly square cells of `cell` pixels, each with the slope F(t, y) at its centre. Call it after the
    layout is final (the segments are sized from the axes' size on the page)."""
    fig = ax.figure
    fig.canvas.draw()
    bb = ax.get_window_extent()
    (t0, t1), (y0, y1) = ax.get_xlim(), ax.get_ylim()
    sx, sy = bb.width / (t1 - t0), bb.height / (y1 - y0)          # pixels per unit
    nt, ny = max(2, round(bb.width / cell)), max(2, round(bb.height / cell))
    half = length * min(bb.width / nt, bb.height / ny) / 2
    segs = []
    for i in range(nt):
        t = t0 + (i + 0.5) * (t1 - t0) / nt
        for j in range(ny):
            y = y0 + (j + 0.5) * (y1 - y0) / ny
            m = F(t, y)
            if not np.isfinite(m):
                continue
            dx, dy = sx, sy * m                                     # the direction on the page
            n = np.hypot(dx, dy)
            dt, dyy = dx / n * half / sx, dy / n * half / sy
            segs.append([(t - dt, y - dyy), (t + dt, y + dyy)])
    ax.add_collection(LineCollection(segs, colors=color or C['muted'], linewidths=lw, zorder=2, capstyle='round'))


def fig_13_1(L):
    """Direction fields: y' = t - y with solution curves approaching the line y = t - 1; y' = (y - 1)(y - 3) with a stable and an unstable equilibrium."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7)
    math_axes(a1, (-1.0, 4.0), (-1.5, 3.0), xlabel='$t$', xticks=[1, 2, 3], yticks=[-1, 1, 2])
    math_axes(a2, (-0.3, 4.0), (-0.6, 4.6), xlabel='$t$', xticks=[1, 2, 3], yticks=[1, 2, 3, 4])
    title(a1, r"$y' = t - y$")
    title(a2, r"$y' = (y - 1)(y - 3)$")
    fig.tight_layout(w_pad=2.2)

    # Left: y = t - 1 + C e^(-t); C = 2 passes through (0, 1), C = 0 is the line y = t - 1.
    field(a1, lambda t, y: t - y)
    for c in (-2, -1, 1, 3, 5):
        plot_fn(a1, lambda t, c=c: t - 1 + c * np.exp(-t), -1.0, 4.0, color=C['sky'], lw=1.5)
    plot_fn(a1, lambda t: t - 1, -1.0, 4.0, color=C['orange'], lw=2.0)
    plot_fn(a1, lambda t: t - 1 + 2 * np.exp(-t), -1.0, 4.0, color=C['blue'], lw=2.6)
    dot(a1, 0, 1, color=C['navy'], size=5)
    label(a1, 0.12, 1.32, r'$(0, 1)$', ha='left', size=11)
    label(a1, 2.35, 0.72, r'$y = t - 1$', color=C['orange'], size=11)

    # Right: equilibria y = 1 (stable) and y = 3 (unstable); y = (3 - A e^(2t))/(1 - A e^(2t)), A = (y0 - 3)/(y0 - 1).
    field(a2, lambda t, y: (y - 1) * (y - 3))
    a2.plot([0, 4.0], [1, 1], color=C['green'], lw=2.4, zorder=4)
    a2.plot([0, 4.0], [3, 3], color=C['red'], lw=2.0, ls=(0, (5, 3)), zorder=4)
    for y0 in (-0.4, 0.4, 1.6, 2.4, 2.85, 3.15, 3.5):
        A = (y0 - 3) / (y0 - 1)
        t_end = 4.0
        if 0 < A < 1:                                   # starts above 3: blows up at t = ln(1/A)/2
            t_end = min(4.0, np.log(1 / A) / 2 - 0.002)
        plot_fn(a2, lambda t, A=A: (3 - A * np.exp(2 * t)) / (1 - A * np.exp(2 * t)), 0, t_end, color=C['blue'], lw=1.7)
        dot(a2, 0, y0, color=C['blue'], size=4)
    label(a2, 2.75, 0.68, 'stable', color=C['green'], size=11)
    label(a2, 2.55, 3.32, 'unstable', color=C['red'], size=11)
    return fig


def fig_13_2(L):
    """Euler's method for y' = t - y, y(0) = 1, with steps h = 0.5 and h = 0.25, against the exact solution y = t - 1 + 2e^(-t)."""
    fig, ax = figure(7.6, 3.9)
    math_axes(ax, (-0.08, 2.75), (0.35, 1.45), xlabel='$t$', xticks=[0.5, 1, 1.5, 2], yticks=[0.5, 0.75, 1.25])
    fig.tight_layout()
    field(ax, lambda t, y: t - y, cell=24, color=C['border'], lw=1.2)
    exact = lambda t: t - 1 + 2 * np.exp(-t)
    plot_fn(ax, exact, 0, 2.25, color=C['blue'], lw=2.6)
    for h, col in ((0.5, C['orange']), (0.25, C['green'])):
        ts, ys = [0.0], [1.0]
        while ts[-1] < 2 - 1e-9:
            ys.append(ys[-1] + h * (ts[-1] - ys[-1]))
            ts.append(ts[-1] + h)
        ax.plot(ts, ys, color=col, lw=1.8, zorder=5)
        for tt, yy in zip(ts, ys):
            dot(ax, tt, yy, color=col, size=5.5, zorder=6)
        val = f'{ys[-1]:.4f}'.rstrip('0')
        label(ax, 2.08, ys[-1], f'$h = {h:g}$: ${val}$', color=col, size=11)
    label(ax, 2.08, exact(2) + 0.035, f'exact: ${exact(2):.4f}$', color=C['blue'], size=11)
    label(ax, 0.06, 1.07, r'$(0, 1)$', size=11)
    ax.plot([2, 2], [0.35, 1.45], color=C['slate'], lw=1.0, ls=(0, (4, 3)), zorder=3)
    label(ax, 0.03, 0.5, 'first step:\nslope $-1$', color=C['orange'], size=10.5, va='center')
    label(ax, 1.15, 1.12, r'$y = t - 1 + 2e^{-t}$', color=C['blue'], size=11.5)
    return fig


def fig_13_3(L):
    """Solutions of y' = 2ty^2: y = 1/(1 - t^2) exists only for -1 < t < 1; y = -1/(1 + t^2) for every t; y = 0 is the solution that dividing by y^2 loses."""
    fig, ax = figure(7.6, 3.9)
    math_axes(ax, (-2.6, 2.6), (-1.6, 4.3), xlabel='$t$', xticks=[-2, -1, 1, 2], yticks=[-1, 1, 2, 3, 4])
    fig.tight_layout()
    field(ax, lambda t, y: 2 * t * y * y, cell=22, color=C['border'], lw=1.2)
    for p in (-1, 1):
        ax.plot([p, p], [-1.6, 4.3], color=C['muted'], lw=1.0, ls=(0, (3, 3)), zorder=3)
    # The other branches of y = 1/(1 - t^2), outside (-1, 1): solutions of their own, on their own intervals.
    plot_fn(ax, lambda t: 1 / (1 - t * t), -2.6, -1.0, color=C['muted'], lw=1.6, ls=(0, (2, 2)), breaks=[-1])
    plot_fn(ax, lambda t: 1 / (1 - t * t), 1.0, 2.6, color=C['muted'], lw=1.6, ls=(0, (2, 2)), breaks=[1])
    plot_fn(ax, lambda t: 1 / (1 - t * t), -0.999, 0.999, color=C['blue'], lw=2.6)
    plot_fn(ax, lambda t: 1 / (4 - t * t), -1.999, 1.999, color=C['sky'], lw=1.8)
    plot_fn(ax, lambda t: -1 / (1 + t * t), -2.6, 2.6, color=C['orange'], lw=2.4)
    ax.plot([-2.6, 2.6], [0, 0], color=C['green'], lw=2.6, zorder=4)
    label(ax, 1.07, 3.45, r'$y = \dfrac{1}{1 - t^2}$', color=C['blue'], size=12)
    label(ax, 1.62, 0.62, r'$y = \dfrac{1}{4 - t^2}$', color=C['sky'], size=11)
    label(ax, 0.14, -1.33, r'$y = -\dfrac{1}{1 + t^2}$', color=C['orange'], size=12)
    label(ax, -2.5, 0.22, r'$y = 0$', color=C['green'], size=11)
    return fig


def fig_13_4(L):
    """Logistic growth y' = 0.5y(1 - y/10000): S-shaped curves from small starting values, a decreasing curve from above the carrying capacity, and the inflection point at half the capacity."""
    fig, ax = figure(7.6, 3.9)
    K, r = 10.0, 0.5                                         # thousands of fish, per year
    math_axes(ax, (-0.3, 17.0), (-0.8, 16.5), xlabel=r'$t$ (years)', ylabel=r'$y$ (thousands)',
              xticks=[2, 4, 6, 8, 10, 12, 14, 16], yticks=[5, 10, 15])
    sol = lambda t, y0: K / (1 + (K - y0) / y0 * np.exp(-r * t))
    ax.plot([-0.3, 17.0], [K, K], color=C['green'], lw=1.6, ls=(0, (5, 3)), zorder=3)
    for y0, col in ((0.1, C['sky']), (6.0, C['sky']), (15.0, C['orange'])):
        plot_fn(ax, lambda t, y0=y0: sol(t, y0), 0, 17.0, color=col, lw=1.9)
        dot(ax, 0, y0, color=col, size=5)
    plot_fn(ax, lambda t: sol(t, 1.0), 0, 17.0, color=C['blue'], lw=2.6)
    dot(ax, 0, 1.0, color=C['blue'], size=6)
    ti = 2 * np.log(9)
    dot(ax, ti, K / 2, color=C['navy'], size=6.5)
    ax.plot([ti, ti], [0, K / 2], color=C['slate'], lw=1.0, ls=(0, (4, 3)), zorder=3)
    label(ax, ti + 0.5, K / 2 - 0.75, 'inflection:\n$y = K/2$', size=11)
    label(ax, 13.2, K + 0.75, r'carrying capacity $K$', color=C['green'], size=11)
    label(ax, 1.0, 14.3, 'starts above $K$', color=C['orange'], size=11)
    label(ax, 0.3, 3.4, '$y(0) = 1000$', color=C['blue'], size=11)
    return fig


def fig_13_5(L):
    """A mass on a spring (m = 1, k = 4) released from x = 1 at rest: underdamped motion (c = 1) oscillates inside a decaying envelope; critically damped (c = 4) and overdamped (c = 10) motion do not oscillate."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)
    for a in (a1, a2):
        math_axes(a, (-0.2, 8.4), (-0.75, 1.2), xlabel='$t$', ylabel='$x$', xticks=[2, 4, 6, 8], yticks=[-0.5, 0.5, 1])
    title(a1, r'Underdamped: $c = 1$')
    title(a2, r'No oscillation: $c = 4$ and $c = 10$')
    fig.tight_layout(w_pad=2.2)
    w = np.sqrt(15) / 2
    under = lambda t: np.exp(-t / 2) * (np.cos(w * t) + np.sin(w * t) / np.sqrt(15))
    crit = lambda t: (1 + 2 * t) * np.exp(-2 * t)
    r1, r2 = -5 + np.sqrt(21), -5 - np.sqrt(21)
    over = lambda t: (-r2 * np.exp(r1 * t) + r1 * np.exp(r2 * t)) / (r1 - r2)
    amp = np.sqrt(16 / 15)
    for s_ in (1, -1):
        plot_fn(a1, lambda t, s_=s_: s_ * amp * np.exp(-t / 2), 0, 8.4, color=C['muted'], lw=1.2, ls=(0, (4, 3)))
    plot_fn(a1, under, 0, 8.4, color=C['blue'], lw=2.4)
    dot(a1, 0, 1, color=C['navy'], size=5)
    label(a1, 2.3, 0.62, r'$\pm 1.03\,e^{-t/2}$', color=C['slate'], size=11)
    plot_fn(a2, over, 0, 8.4, color=C['orange'], lw=2.4)
    plot_fn(a2, crit, 0, 8.4, color=C['green'], lw=2.4)
    dot(a2, 0, 1, color=C['navy'], size=5)
    label(a2, 2.0, 0.66, r'overdamped, $c = 10$', color=C['orange'], size=11)
    label(a2, 1.25, -0.25, r'critically damped, $c = 4$', color=C['green'], size=11)
    return fig


FIGURES = {'fig-13-1': fig_13_1, 'fig-13-2': fig_13_2, 'fig-13-3': fig_13_3, 'fig-13-4': fig_13_4, 'fig-13-5': fig_13_5}
