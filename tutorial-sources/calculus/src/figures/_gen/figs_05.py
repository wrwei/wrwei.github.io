"""Figures of Module 5: Rules of differentiation."""
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, math_axes, plot_fn, plot_param, dot, label, shade,
                        #  riemann, tangent, guide, arrow, panel_title, C, CURVES)
from matplotlib.patches import Rectangle

PI = np.pi


def title(ax, text, size=12, pad=10):
    """A panel title."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def dimension(ax, x0, y0, x1, y1, text, side, color=None, size=12):
    """A double-headed dimension arrow from (x0, y0) to (x1, y1), with its label beside it."""
    col = color or C['slate']
    ax.annotate('', xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle='<|-|>', color=col, lw=1.2, mutation_scale=9, shrinkA=0, shrinkB=0))
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    if side == 'below':
        label(ax, mx, my - 0.2, text, color=col, ha='center', va='top', size=size)
    elif side == 'left':
        label(ax, mx - 0.14, my, text, color=col, ha='right', va='center', size=size)


def rectangle_panel(ax, u, v, du, dv, show_names):
    """The rectangle u by v grown to (u + du) by (v + dv), in four coloured pieces."""
    pieces = [((0, 0), u, v, C['skyl'], C['blue']),
              ((0, v), u, dv, C['greenl'], C['green']),
              ((u, 0), du, v, C['orangel'], C['orange']),
              ((u, v), du, dv, C['purplel'], C['purple'])]
    for (x0, y0), w, h, fc, ec in pieces:
        ax.add_patch(Rectangle((x0, y0), w, h, facecolor=fc, edgecolor=ec, lw=1.6, zorder=2))
    label(ax, u / 2, v / 2, r'$uv$', ha='center', size=15, halo=False)
    label(ax, u / 2, v + dv / 2, r'$u\,\Delta v$', color=C['green'], ha='center', size=13, halo=False)
    label(ax, u + du / 2, v / 2, r'$v\,\Delta u$', color=C['orange'], ha='center', size=13, halo=False, rotation=90)
    ax.annotate('', xy=(u + du * 0.6, v + dv * 0.6), xytext=(u + du + 0.4, v + dv + 0.4),
                arrowprops=dict(arrowstyle='-', color=C['purple'], lw=1.1))
    label(ax, u + du + 0.45, v + dv + 0.45, r'$\Delta u\,\Delta v$', color=C['purple'], size=13)
    if show_names:
        dimension(ax, 0, -0.35, u, -0.35, r'$u = f(x)$', 'below')
        dimension(ax, -0.3, 0, -0.3, v, r'$v = g(x)$', 'left')
    else:
        dimension(ax, 0, -0.35, u, -0.35, r'$u$', 'below')
        dimension(ax, -0.3, 0, -0.3, v, r'$v$', 'left')
    dimension(ax, u, -0.35, u + du, -0.35, r'$\Delta u$', 'below', color=C['orange'])
    dimension(ax, -0.3, v, -0.3, v + dv, r'$\Delta v$', 'left', color=C['green'])
    ax.set_xlim(-2.0, 6.0)
    ax.set_ylim(-1.15, 3.85)
    ax.set_aspect('equal')
    ax.axis('off')


def fig_05_1(L):
    """The product rule as a growing rectangle: the area uv grows by two strips and a small corner."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)
    u, v = 3.0, 2.0
    # The sides are u = f(x), v = g(x); a change h in x changes them by about f'(x)h and g'(x)h.
    rectangle_panel(a1, u, v, 1.0, 0.8, True)
    title(a1, r'a change $h$ in $x$')
    rectangle_panel(a2, u, v, 0.5, 0.4, False)
    title(a2, r'half the change: $h/2$')
    fig.tight_layout(w_pad=1.0)
    return fig


def fig_05_2(L):
    """The slopes of the sine curve are the values of the cosine: tangent lines to y = sin x, and y = cos x below."""
    fig, (a1, a2) = figure_grid(2, 1, w=7.6, h=4.6, sharex=True)
    xs = [0, PI / 2, PI, 3 * PI / 2, 2 * PI]
    names = ['0', r'\pi/2', r'\pi', r'3\pi/2', r'2\pi']
    ticks = [(p, f'${n}$') for p, n in zip(xs, names)]
    for ax in (a1, a2):
        math_axes(ax, (-0.5, 7.1), (-1.6, 1.75), xticks=ticks[1:], yticks=[(-1, r'$-1$'), (1, r'$1$')])
    plot_fn(a1, np.sin, -0.5, 7.1)
    for p in xs:
        tangent(a1, np.sin, p, (p - 0.62, p + 0.62), df=np.cos, color=C['orange'], lw=2.2)
        dot(a1, p, np.sin(p), color=C['navy'], size=6)
        slope = np.cos(p)
        txt = f'slope ${int(round(slope))}$'.replace('-', '−')
        if abs(slope) < 0.5:                       # flat: above a trough, below a crest
            label(a1, p, np.sin(p) + (0.42 if np.sin(p) < 0 else -0.42), txt, color=C['orange'], size=10.5, ha='center')
        else:                                      # below the rising tangents, above the falling one
            label(a1, p + 0.3, -0.5 if slope > 0 else 0.5, txt, color=C['orange'], size=10.5, ha='left')
    label(a1, 7.0, 0.95, r'$y = \sin x$', color=C['blue'], ha='right', size=12)
    plot_fn(a2, np.cos, 0, 7.1, color=C['green'])     # from 0: left of the axis it would run through the label 1
    for p in xs:
        dot(a2, p, np.cos(p), color=C['orange'], size=6)
        a1.plot([p, p], [-1.6, np.sin(p)], ls=(0, (3, 3)), color=C['muted'], lw=1.0, zorder=1)
        # Down to the cosine's value, leaving a gap at the tick label on the x-axis.
        a2.plot([p, p], [max(np.cos(p), 0.04), 1.75], ls=(0, (3, 3)), color=C['muted'], lw=1.0, zorder=1)
        if np.cos(p) < -0.4:
            a2.plot([p, p], [np.cos(p), -0.42], ls=(0, (3, 3)), color=C['muted'], lw=1.0, zorder=1)
    a2.tick_params(axis='y', pad=10)              # the labels clear of the dot at (0, 1)
    label(a2, 7.0, -1.15, r"$y = \cos x$", color=C['green'], ha='right', size=12)
    label(a2, 2.35, 1.3, 'the slopes of sin, plotted', color=C['orange'], size=10.5, ha='center')
    fig.tight_layout(h_pad=0.6)
    return fig


def gear(ax, cx, cy, R, n, phase, fc, ec, depth=0.13):
    """A gear with n teeth on a pitch circle of radius R, centred at (cx, cy); a tooth points at angle phase."""
    th = np.linspace(0, 2 * PI, 2400)
    k = 3.0
    r = R + depth * np.tanh(k * np.cos(n * (th - phase))) / np.tanh(k)
    ax.fill(cx + r * np.cos(th), cy + r * np.sin(th), facecolor=fc, edgecolor=ec, lw=1.4, zorder=2)
    ax.add_patch(plt_circle(cx, cy, 0.12 + 0.06 * R, C['white'], ec))


def plt_circle(cx, cy, r, fc, ec):
    from matplotlib.patches import Circle
    return Circle((cx, cy), r, facecolor=fc, edgecolor=ec, lw=1.4, zorder=3)


def turn_arrow(ax, cx, cy, r, a0, a1, color):
    """A curved arrow on the circle of radius r about (cx, cy), from angle a0 to angle a1 (radians)."""
    th = np.linspace(a0, a1, 80)
    ax.plot(cx + r * np.cos(th), cy + r * np.sin(th), color=color, lw=1.8, zorder=4, solid_capstyle='butt')
    e0, e1 = th[-6], th[-1]
    ax.annotate('', xy=(cx + r * np.cos(e1), cy + r * np.sin(e1)), xytext=(cx + r * np.cos(e0), cy + r * np.sin(e0)),
                arrowprops=dict(arrowstyle='-|>', color=color, lw=1.8, mutation_scale=13, shrinkA=0, shrinkB=0), zorder=4)


def fig_05_3(L):
    """Rates multiply: gear B turns twice as fast as gear A, and gear C three times as fast as B, so C turns six times as fast as A."""
    fig, ax = figure(7.6, 3.7)
    teeth = {'A': 36, 'B': 18, 'C': 6}
    pitch = 2 * PI * 3.0 / 36                    # the same tooth size on every gear
    R = {g: n * pitch / (2 * PI) for g, n in teeth.items()}
    xA = 0.0
    xB = xA + R['A'] + R['B']
    xC = xB + R['B'] + R['C']
    # Teeth mesh: A has a tooth pointing at B, so B has a gap pointing at A, and so on along the row.
    gear(ax, xA, 0, R['A'], teeth['A'], 0.0, C['skyl'], C['blue'])
    gear(ax, xB, 0, R['B'], teeth['B'], PI - PI / teeth['B'], C['greenl'], C['green'])
    gear(ax, xC, 0, R['C'], teeth['C'], PI, C['orangel'], C['orange'])
    turn_arrow(ax, xA, 0, R['A'] * 0.62, 2.2, 3.4, C['blue'])          # A turns anticlockwise,
    turn_arrow(ax, xB, 0, R['B'] * 0.6, 1.25, 0.05, C['green'])        # B clockwise,
    turn_arrow(ax, xC, 0, R['C'] + 0.4, 0.35, 1.5, C['orange'])        # C anticlockwise.
    label(ax, xA, 0.75, 'A', size=15, ha='center', halo=False)
    label(ax, xA, -0.7, '36 teeth', size=11, ha='center', halo=False, color=C['slate'])
    label(ax, xB - 0.55, 0.45, 'B', size=15, ha='center', halo=False)
    label(ax, xB, -R['B'] - 0.45, '18 teeth', size=11, ha='center', color=C['slate'])
    label(ax, xC + 0.25, -R['C'] - 0.6, '6 teeth', size=11, ha='center', color=C['slate'])
    label(ax, xC + 0.75, R['C'] + 0.85, 'C', size=15, ha='center')
    x0 = xC + 1.25
    label(ax, x0, 2.15, 'A turns once:', size=11.5)
    label(ax, x0, 1.55, 'B turns 2 times,', size=11.5, color=C['green'])
    label(ax, x0, 0.95, 'C turns 6 times.', size=11.5, color=C['orange'])
    label(ax, x0, -0.35, r'$\dfrac{d\theta_B}{d\theta_A} = 2$,  $\dfrac{d\theta_C}{d\theta_B} = 3$', size=13)
    label(ax, x0, -1.55, r'$\dfrac{d\theta_C}{d\theta_A} = 3 \cdot 2 = 6$', size=13)
    ax.set_xlim(-R['A'] - 0.3, x0 + 4.6)
    ax.set_ylim(-R['A'] - 0.3, R['A'] + 0.3)
    ax.set_aspect('equal')
    ax.axis('off')
    return fig


def fig_05_4(L):
    """Correct digits of the derivative of x^3 - 2x + 1 at 1.5 from forward and central differences, against the step h; dual numbers give every digit."""
    fig, ax = figure(7.6, 3.9)
    f = lambda x: x * x * x - 2 * x + 1
    exact = 4.75
    hs = 10.0 ** -np.arange(0.5, 15.51, 0.25)
    def digits(approx):
        err = abs(approx - exact) / exact
        return min(16.0, -np.log10(err)) if err > 0 else 16.0
    fwd = [digits((f(1.5 + h) - f(1.5)) / h) for h in hs]
    cen = [digits((f(1.5 + h) - f(1.5 - h)) / (2 * h)) for h in hs]
    ax.set_xscale('log')
    ax.set_xlim(10 ** -15.8, 10 ** -0.3)
    ax.set_ylim(0, 17.3)
    ax.invert_xaxis()
    ax.plot(hs, fwd, color=C['blue'], lw=2.0, marker='o', markersize=2.8, zorder=4)
    ax.plot(hs, cen, color=C['green'], lw=2.0, marker='o', markersize=2.8, zorder=4)
    ax.plot([10 ** -15.8, 10 ** -0.3], [16, 16], color=C['orange'], lw=2.6, zorder=4)
    label(ax, 10 ** -0.5, 15.0, 'dual numbers: 4.75 exactly, every digit right', color=C['orange'], size=11, ha='left')
    label(ax, 10 ** -5.6, 2.2, 'forward difference', color=C['blue'], size=11, ha='center')
    label(ax, 10 ** -3.0, 11.6, 'central difference', color=C['green'], size=11, ha='center')
    ax.set_xlabel(r'step $h$ (smaller to the right)', fontsize=11)
    ax.set_ylabel('correct significant digits', fontsize=11)
    ax.set_xticks([1e-1, 1e-4, 1e-7, 1e-10, 1e-13])
    ax.set_xticklabels([r'$10^{-1}$', r'$10^{-4}$', r'$10^{-7}$', r'$10^{-10}$', r'$10^{-13}$'])
    ax.set_yticks([0, 4, 8, 12, 16])
    for side in ('top', 'right'):
        ax.spines[side].set_visible(False)
    ax.grid(True, color=C['grid'], linewidth=0.8, zorder=0)
    ax.set_axisbelow(True)
    return fig


FIGURES = {'fig-05-1': fig_05_1, 'fig-05-2': fig_05_2, 'fig-05-3': fig_05_3, 'fig-05-4': fig_05_4}
