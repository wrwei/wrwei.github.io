"""Figures of Module 15: Power series and Taylor series."""
import math

import mpmath
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi


def title(ax, text, size=12, pad=30):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def band(ax, lo, hi, ylim):
    """The interval of convergence, lo < x < hi, as a light green band behind everything."""
    ax.axvspan(lo, hi, color=C['greenl'], alpha=0.75, lw=0, zorder=0.5)
    for p in (lo, hi):
        ax.plot([p, p], list(ylim), color=C['green'], lw=1.0, ls=(0, (4, 3)), zorder=1)


def fig_15_1(L):
    """Partial sums of the geometric series 1 + x + x^2 + ... and of 1 - x^2 + x^4 - ...: close to 1/(1 - x) and 1/(1 + x^2) only for -1 < x < 1."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7)
    cols = CURVES[1:5]

    # Left: 1/(1 - x) and S_n(x) = 1 + x + ... + x^n for n = 1, 2, 4, 8.
    yl = (-1.7, 6.2)
    math_axes(a1, (-2.25, 1.9), yl, xticks=[-2, -1, 1], yticks=[2, 4, 6])
    band(a1, -1, 1, yl)
    plot_fn(a1, lambda x: 1 / (1 - x), -2.25, 1.9, breaks=[1], color=CURVES[0], lw=2.6)
    for n, col in zip((1, 2, 5, 10), cols):
        plot_fn(a1, lambda x, n=n: sum(x**k for k in range(n + 1)), -2.25, 1.9, color=col, lw=1.6, zorder=4.5)
    label(a1, -2.2, -1.45, r'$n = 1$', color=cols[0], size=10.5)
    label(a1, -2.18, 4.15, r'$n = 2$', color=cols[1], size=10.5)
    label(a1, -1.24, -1.45, r'$n = 5$', color=cols[2], size=10.5)
    label(a1, -1.33, 5.75, r'$n = 10$', color=cols[3], size=10.5, ha='right')
    label(a1, 0.62, 3.6, r'$\frac{1}{1-x}$', color=CURVES[0], size=14, ha='right')
    label(a1, -0.5, 4.6, 'converges', color=C['green'], size=10.5, ha='center')
    title(a1, r'$S_n(x) = 1 + x + \cdots + x^n$')

    # Right: 1/(1 + x^2) and 1 - x^2 + ... + (-1)^m x^(2m) for m = 1, 2, 4, 8.
    yl = (-1.5, 2.25)
    math_axes(a2, (-2.25, 2.25), yl, xticks=[-2, -1, 1, 2], yticks=[-1, 1, 2])
    band(a2, -1, 1, yl)
    plot_fn(a2, lambda x: 1 / (1 + x**2), -2.25, 2.25, color=CURVES[0], lw=2.6)
    for m, col in zip((1, 2, 5, 20), cols):
        plot_fn(a2, lambda x, m=m: sum((-1)**j * x**(2 * j) for j in range(m + 1)), -2.25, 2.25, color=col, lw=1.6, zorder=4.5)
    label(a2, -1.62, -1.25, r'$m = 1$', color=cols[0], size=10.5, ha='right')
    label(a2, 1.36, 2.02, r'$m = 2$', color=cols[1], size=10.5)
    label(a2, 1.2, -1.25, r'$m = 5$', color=cols[2], size=10.5)
    label(a2, -1.15, 2.02, r'$m = 20$', color=cols[3], size=10.5, ha='right')
    label(a2, 1.3, 0.62, r'$\frac{1}{1+x^2}$', color=CURVES[0], size=14)
    label(a2, 0, -1.3, 'converges', color=C['green'], size=10.5, ha='center')
    title(a2, r'$1 - x^2 + x^4 - \cdots \pm x^{2m}$')
    fig.tight_layout(w_pad=2.0)
    return fig


def sin_err(x, n):
    """|sin x - T_n(x)| for the Maclaurin polynomial T_n of sin, computed with 40 digits."""
    mpmath.mp.dps = 40
    xv = mpmath.mpf(x)
    t = mpmath.mpf(0)
    for k in range(0, n + 1):
        if k % 2:
            t += (-1)**((k - 1) // 2) * xv**k / mpmath.factorial(k)
    return float(abs(mpmath.sin(xv) - t))


def fig_15_2(L):
    """The Maclaurin polynomials T1, T3, T5 of sin x hug the curve near 0; their errors are close to lines of slopes 3, 5, 7 on log scales."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.8, gridspec_kw={'width_ratios': [1.35, 1]})
    T = {1: lambda x: x, 3: lambda x: x - x**3 / 6, 5: lambda x: x - x**3 / 6 + x**5 / 120}
    cols = {1: CURVES[1], 3: CURVES[2], 5: CURVES[3]}

    ticks = [(-2 * PI, r'$-2\pi$'), (-PI, r'$-\pi$'), (PI, r'$\pi$'), (2 * PI, r'$2\pi$')]
    math_axes(a1, (-6.9, 6.9), (-2.6, 2.6), xticks=ticks, yticks=[-2, -1, 1, 2])
    a1.tick_params(axis='x', pad=30)
    plot_fn(a1, np.sin, -6.9, 6.9, color=CURVES[0], lw=2.6)
    for n in (1, 3, 5):
        plot_fn(a1, T[n], -6.9, 6.9, color=cols[n], lw=1.7, zorder=4.5)
    label(a1, 2.28, 2.3, r'$T_1$', color=cols[1], size=12, ha='right')
    label(a1, 3.62, -2.3, r'$T_3$', color=cols[3], size=12)
    label(a1, 4.55, 2.32, r'$T_5$', color=cols[5], size=12, ha='center')
    label(a1, 4.71, -1.4, r'$\sin x$', color=CURVES[0], size=12, ha='center')
    title(a1, r'$\sin x$ and its Maclaurin polynomials', pad=36)

    xs = np.logspace(-2, np.log10(2), 160)
    a2.set_xscale('log')
    a2.set_yscale('log')
    a2.set_xlim(0.01, 2)
    a2.set_ylim(1e-19, 10)
    for side in ('top', 'right'):
        a2.spines[side].set_visible(False)
    for side in ('left', 'bottom'):
        a2.spines[side].set_color(C['navy'])
        a2.spines[side].set_linewidth(1.1)
    a2.grid(True, which='major', color=C['grid'], linewidth=0.8, zorder=0)
    a2.set_axisbelow(True)
    a2.set_xticks([0.01, 0.1, 1])
    a2.set_xticklabels(['$0.01$', '$0.1$', '$1$'])
    a2.set_yticks([10.0**k for k in range(-18, 1, 3)])
    a2.set_yticklabels([f'$10^{{{k}}}$' if k else '$1$' for k in range(-18, 1, 3)])
    a2.minorticks_off()
    a2.tick_params(labelsize=10.5)
    a2.set_xlabel('$x$', fontsize=12, color=C['navy'])
    for n in (1, 3, 5):
        a2.plot(xs, [sin_err(x, n) for x in xs], color=cols[n], lw=1.9, zorder=4)
    for n, x0, dy in ((1, 0.03, 4.0), (3, 0.03, 4.0), (5, 0.03, 4.0)):
        y0 = sin_err(x0, n) * dy
        lab = label(a2, x0, y0, rf'$T_{n}$: slope ${n + 2}$', color=cols[n], size=10.5, ha='left', va='bottom')
        ang = math.degrees(math.atan2((n + 2) * (a2.transData.transform((1, 1))[1] - a2.transData.transform((1, 0.1))[1]),
                                      a2.transData.transform((1, 1))[0] - a2.transData.transform((0.1, 1))[0]))
        lab.set_rotation(ang)
        lab.set_rotation_mode('anchor')
    title(a2, r'error $|\sin x - T_n(x)|$')
    fig.tight_layout(w_pad=1.6)
    return fig


def fig_15_3(L):
    """The function e^(-1/x^2), with f(0) = 0, is so flat at 0 that every derivative there is 0: its Maclaurin series is 0."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)
    f = lambda x: np.exp(-1 / x**2) if x != 0 else 0.0

    math_axes(a1, (-3.3, 3.3), (-0.22, 1.25), xticks=[-3, -2, -1, 1, 2, 3], yticks=[0.5])
    a1.plot([-3.3, 3.3], [1, 1], color=C['muted'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    a1.plot([-3.3, 3.3], [0, 0], color=C['orange'], lw=2.4, zorder=3.5)
    plot_fn(a1, f, -3.3, 3.3, n=2001, color=CURVES[0], lw=2.6)
    dot(a1, 0, 0, color=C['navy'], size=6)
    label(a1, 2.0, 1.1, r'$y = 1$', color=C['slate'], size=10.5)
    label(a1, -3.2, 0.56, r'$y = e^{-1/x^2}$', color=CURVES[0], size=11.5)
    label(a1, 3.25, 0.2, 'Maclaurin\nseries: 0', color=C['orange'], size=10.5, ha='right')
    title(a1, 'The graph', pad=36)

    math_axes(a2, (-0.66, 0.66), (-0.012, 0.085), xticks=[-0.5, -0.25, 0.25, 0.5], yticks=[0.02, 0.04, 0.06, 0.08])
    a2.plot([-0.66, 0.66], [0, 0], color=C['orange'], lw=2.4, zorder=3.5)
    plot_fn(a2, f, -0.66, 0.66, n=2001, color=CURVES[0], lw=2.6)
    dot(a2, 0, 0, color=C['navy'], size=6)
    label(a2, 0.05, 0.079, 'flatter than\nany power\nof $x$ near 0', color=C['slate'], size=10.5, va='top')
    title(a2, 'Near 0, vertical scale stretched', pad=36)
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_15_4(L):
    """Euler's formula: e^(i theta) is the point at angle theta on the unit circle; the partial sums of the series of e^(i pi) spiral in to -1."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.9, gridspec_kw={'width_ratios': [1, 1.35]})
    th = 0.9
    cx, sy = np.cos(th), np.sin(th)
    math_axes(a1, (-1.5, 1.6), (-1.45, 1.55), xticks=[-1, 1], yticks=[-1, 1], aspect='equal', grid=False,
              ticklabels=False, xlabel='', ylabel='')
    for (lx, ly, txt) in ((1.13, -0.17, r'$1$'), (-1.2, -0.17, r'$-1$'), (-0.14, 1.12, r'$i$'), (-0.2, -1.12, r'$-i$')):
        label(a1, lx, ly, txt, ha='center', size=11, color=C['slate'])
    plot_param(a1, np.cos, np.sin, 0, 2 * PI, color=C['slate'], lw=1.4)
    a1.plot([0, cx], [0, sy], color=C['navy'], lw=1.4, zorder=4)
    a1.plot([cx, cx], [0, sy], color=C['blue'], lw=2.0, zorder=4)
    a1.plot([0, cx], [0, 0], color=C['green'], lw=3.0, zorder=4, solid_capstyle='butt')
    dot(a1, cx, sy, color=C['navy'])
    label(a1, cx + 0.07, sy + 0.2, r'$e^{i\theta}$', size=13)
    label(a1, cx + 0.06, sy / 2, r'$\sin\theta$', color=C['blue'], size=11)
    label(a1, cx / 2, -0.18, r'$\cos\theta$', color=C['green'], size=11, ha='center')
    a1.annotate('', xy=(0.3 * np.cos(th), 0.3 * np.sin(th)), xytext=(0.3, 0),
                arrowprops=dict(arrowstyle='-|>', color=C['navy'], lw=1.1, connectionstyle='arc3,rad=0.35'))
    label(a1, 0.33, 0.13, r'$\theta$', size=11)
    label(a1, 1.55, 0.0, 'real', color=C['navy'], size=10.5, ha='right', va='bottom')
    label(a1, 0.06, 1.5, 'imaginary', color=C['navy'], size=10.5, va='top')
    title(a1, r'$e^{i\theta} = \cos\theta + i\sin\theta$')

    # The partial sums S_N of the series of e^(i pi): each new term turns a right angle to the left.
    z = 1j * PI
    pts, term, total = [], 1 + 0j, 0j
    for n in range(26):
        total += term
        pts.append(total)
        term *= z / (n + 1)
    math_axes(a2, (-4.75, 1.95), (-2.6, 3.75), xticks=[-3, -2], yticks=[1, 2, 3], aspect='equal',
              xlabel='', ylabel='')
    plot_param(a2, np.cos, np.sin, 0, 2 * PI, color=C['muted'], lw=1.1, ls=(0, (4, 3)))
    a2.plot([p.real for p in pts], [p.imag for p in pts], color=CURVES[1], lw=1.8, zorder=4)
    for p in pts[:8]:
        dot(a2, p.real, p.imag, color=CURVES[1], size=5)
    dot(a2, -1, 0, color=C['navy'], size=7)
    for k, (dx, dy, ha) in {0: (0.12, -0.3, 'left'), 1: (0.12, 0.05, 'left'), 2: (-0.1, 0.25, 'center'), 3: (-0.1, -0.32, 'center'),
                            4: (0.12, -0.32, 'left'), 5: (0.14, 0.12, 'left')}.items():
        label(a2, pts[k].real + dx, pts[k].imag + dy, rf'$S_{k}$', color=CURVES[1], size=11, ha=ha)
    label(a2, -1.12, -0.62, r'$e^{i\pi} = -1$', size=11.5, ha='right')
    title(a2, r'partial sums of $\sum (i\pi)^n/n!$')
    fig.tight_layout(w_pad=1.2)
    return fig


FIGURES = {'fig-15-1': fig_15_1, 'fig-15-2': fig_15_2, 'fig-15-3': fig_15_3, 'fig-15-4': fig_15_4}
