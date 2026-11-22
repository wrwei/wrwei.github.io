"""Figures of Module 16: Curves and vectors."""
import matplotlib.pyplot as plt
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, figure3d, math_axes, plot_fn, plot_param, dot, label,
                        #  shade, riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def head(ax, f, g, t, color, dt=1e-3, size=13):
    """An arrowhead on the parametric curve (f(t), g(t)) at t, pointing the way t increases."""
    ax.annotate('', xy=(f(t + dt), g(t + dt)), xytext=(f(t - dt), g(t - dt)),
                arrowprops=dict(arrowstyle='-|>', color=color, lw=0, mutation_scale=size, shrinkA=0, shrinkB=0), zorder=6)


def darrow(ax, x0, y0, x1, y1, color, lw=1.4, size=12):
    """A dashed arrow from (x0, y0) to (x1, y1): a dashed shaft and a solid head."""
    d = np.array([x1 - x0, y1 - y0], float)
    back = np.array([x1, y1]) - d / np.linalg.norm(d) * 0.12
    ax.plot([x0, back[0]], [y0, back[1]], color=color, lw=lw, ls=(0, (4, 2)), zorder=5)
    ax.annotate('', xy=(x1, y1), xytext=(back[0], back[1]),
                arrowprops=dict(arrowstyle='-|>', color=color, lw=lw, mutation_scale=size, shrinkA=0, shrinkB=0), zorder=6)


def plain_axes(ax, xlim, ylim, xlabel='$x$', ylabel='$y$'):
    """Axes through the origin with arrowheads and labels, equal scales, no ticks or grid."""
    math_axes(ax, xlim, ylim, xlabel=xlabel, ylabel=ylabel, xticks=[], yticks=[], grid=False, aspect='equal')


def polar_grid(ax, rmax, step=1.0, rays=12):
    """A light polar grid: circles r = step, 2 step, ... up to rmax, and rays every 2 pi / rays."""
    th = np.linspace(0, 2 * PI, 300)
    r = step
    while r <= rmax + 1e-9:
        ax.plot(r * np.cos(th), r * np.sin(th), color=C['border'], lw=0.8, zorder=0.4)
        r += step
    for k in range(rays):
        a = 2 * PI * k / rays
        ax.plot([0, rmax * np.cos(a)], [0, rmax * np.sin(a)], color=C['border'], lw=0.8, zorder=0.4)


def polar_curve(ax, f, a, b, n=1500, **kw):
    """Plot the polar curve r = f(theta) for a <= theta <= b."""
    th = np.linspace(a, b, n)
    r = f(th)
    return ax.plot(r * np.cos(th), r * np.sin(th), **kw)


def style3d(ax):
    """A 3D axes without panes or ticks: the figures draw their own coordinate axes."""
    ax.set_axis_off()
    ax.set_proj_type('ortho')


def arrow3(ax, p, q, color, lw=2.0, ratio=0.12):
    """A 3D arrow from p to q."""
    d = np.array(q, float) - np.array(p, float)
    ax.quiver(p[0], p[1], p[2], d[0], d[1], d[2], color=color, lw=lw, arrow_length_ratio=ratio / max(np.linalg.norm(d), 1e-9) * 1.0,
              normalize=False)


def text3(ax, x, y, z, s, color=None, size=12, **kw):
    """Text in a 3D axes, with a white halo."""
    import matplotlib.patheffects as pe
    t = ax.text(x, y, z, s, color=color or C['navy'], fontsize=size, zorder=20, **kw)
    t.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])
    return t


def axes3(ax, lengths, labels=('$x$', '$y$', '$z$'), lw=1.2):
    """Coordinate axes from the origin, as navy arrows of the given lengths, labelled at their tips."""
    for k, (L, lab) in enumerate(zip(lengths, labels)):
        q = [0, 0, 0]
        q[k] = L
        arrow3(ax, (0, 0, 0), q, C['navy'], lw=lw, ratio=0.25)
        tip = [0, 0, 0]
        tip[k] = L * 1.07
        text3(ax, *tip, lab, size=13, ha='center', va='center')


def fig_16_1(L):
    """The parametric curve x = t^2, y = t^3 - 3t, traced in the direction of increasing t, and the graphs of x(t) and y(t)."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.9, gridspec_kw={'width_ratios': [1.0, 1.05]})
    X = lambda t: t**2
    Y = lambda t: t**3 - 3 * t

    plain_axes(a1, (-0.7, 5.0), (-2.75, 2.75))
    for xv in (1, 2, 4):
        a1.plot([xv, xv], [-0.07, 0.07], color=C['navy'], lw=1)
        label(a1, xv, -0.32, f'${xv}$', size=10, ha='center', color=C['slate'])
    for yv in (-2, -1, 1, 2):
        a1.plot([-0.07, 0.07], [yv, yv], color=C['navy'], lw=1)
        label(a1, -0.14, yv, f'${yv}$'.replace('-', '−'), size=10, ha='right', color=C['slate'])
    s3 = np.sqrt(3)
    for sgn in (1, -1):
        xs = np.array([2.05, 3.95])
        a1.plot(xs, sgn * s3 * (xs - 3), color=C['orange'], lw=1.5, ls=(0, (5, 3)), zorder=3)
    plot_param(a1, X, Y, -2, 2, color=C['blue'], lw=2.4, zorder=4)
    for tt in (-1.55, -0.45, 0.55, 1.6):
        head(a1, X, Y, tt, C['blue'], size=16)
    offsets = {-2: (0.12, -0.05, 'left'), -1: (0.0, 0.3, 'center'), 0: (0.14, 0.3, 'left'), 1: (0.0, -0.32, 'center'),
               2: (0.12, 0.05, 'left')}
    for tv in (-2, -1, 0, 1, 2):
        dot(a1, X(tv), Y(tv), color=C['navy'], size=6)
        dx, dy, ha = offsets[tv]
        label(a1, X(tv) + dx, Y(tv) + dy, f'$t = {tv}$'.replace('-', '−'), size=10.5, ha=ha)
    dot(a1, 3, 0, color=C['orange'], size=6)
    label(a1, 3.27, 0.24, r'$(3, 0)$', size=10.5, ha='left', color=C['orange'])
    title(a1, r'the curve $x = t^2$, $y = t^3 - 3t$', size=11.5)

    math_axes(a2, (-2.35, 2.45), (-2.8, 4.8), xlabel='$t$', ylabel='', xticks=[-2, -1, 1, 2], yticks=[-2, 2, 4])
    plot_fn(a2, X, -2.2, 2.2, color=C['green'], lw=2.2)
    plot_fn(a2, Y, -2.2, 2.2, color=C['purple'], lw=2.2)
    label(a2, -2.25, 3.3, r'$x(t) = t^2$', color=C['green'], size=11)
    label(a2, 0.42, -2.45, r'$y(t) = t^3 - 3t$', color=C['purple'], size=11)
    title(a2, 'its two coordinates against $t$', size=11.5)
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_16_2(L):
    """The cycloid: a point P on a circle of radius r that rolls along the x-axis, after the circle has turned through the angle t."""
    fig, ax = figure(7.6, 3.4)
    r, t0 = 1.0, 1.2
    math_axes(ax, (-0.45, 7.0), (-0.6, 2.55), xlabel='$x$', ylabel='$y$',
              xticks=[(PI, r'$\pi r$'), (2 * PI, r'$2\pi r$')], yticks=[(1, r'$r$'), (2, r'$2r$')], aspect='equal')
    X = lambda t: r * (t - np.sin(t))
    Y = lambda t: r * (1 - np.cos(t))
    plot_param(ax, X, Y, t0, 2 * PI, color=C['blue'], lw=1.8, ls=(0, (5, 3)), zorder=3)
    plot_param(ax, X, Y, 0, t0, color=C['blue'], lw=2.8, zorder=4)
    cx, cy = r * t0, r
    th = np.linspace(0, 2 * PI, 300)
    ax.plot(cx + r * np.cos(th), cy + r * np.sin(th), color=C['slate'], lw=1.5, zorder=3)
    # The ground rolled over and the arc of the circle that touched it: both of length r t.
    ax.plot([0, cx], [0, 0], color=C['green'], lw=4.5, solid_capstyle='butt', zorder=3.5)
    arc = np.linspace(-PI / 2 - t0, -PI / 2, 80)
    ax.plot(cx + r * np.cos(arc), cy + r * np.sin(arc), color=C['green'], lw=4.5, solid_capstyle='butt', zorder=3.5)
    px, py = X(t0), Y(t0)
    ax.plot([cx, cx], [0, cy], color=C['navy'], lw=1.3, zorder=5)
    ax.plot([cx, px], [cy, py], color=C['navy'], lw=1.3, zorder=5)
    # The legs r sin t (from P across to the line CT) and r cos t (up the line CT to C).
    ax.plot([px, cx], [py, py], color=C['orange'], lw=1.6, ls=(0, (4, 2)), zorder=5)
    ax.plot([cx, cx], [py, cy], color=C['orange'], lw=2.6, zorder=5.5)
    a_ = np.linspace(-PI / 2 - t0, -PI / 2, 40)
    ax.plot(cx + 0.4 * np.cos(a_), cy + 0.4 * np.sin(a_), color=C['navy'], lw=1.1, zorder=5)
    mid = -PI / 2 - t0 / 2
    label(ax, cx + 0.25 * np.cos(mid), cy + 0.25 * np.sin(mid), r'$t$', size=12, ha='center')
    label(ax, (px + cx) / 2, py - 0.06, r'$r\sin t$', color=C['orange'], size=11, ha='center', va='top')
    label(ax, cx + 0.1, (py + cy) / 2, r'$r\cos t$', color=C['orange'], size=11, ha='left')
    dot(ax, cx, cy, color=C['navy'], size=6)
    dot(ax, px, py, color=C['blue'], size=7)
    dot(ax, cx, 0, color=C['navy'], size=5)
    label(ax, cx + 0.12, cy + 0.2, r'$C = (rt, r)$', size=11)
    label(ax, px - 0.02, py + 0.24, r'$P$', size=12, ha='center', color=C['blue'])
    label(ax, cx + 0.1, -0.27, r'$T$', size=11)
    label(ax, cx / 2, -0.27, r'$rt$', color=C['green'], size=12, ha='center')
    label(ax, 3.4, 2.27, 'one arch of the cycloid', color=C['blue'], size=11)
    ax.annotate('', xy=(cx + 1.33, cy - 0.15), xytext=(cx + 1.33, cy + 0.45),
                arrowprops=dict(arrowstyle='-|>', color=C['slate'], lw=1.2, connectionstyle='arc3,rad=-0.4'))
    label(ax, cx + 1.45, cy + 0.42, 'rolls', size=10.5, color=C['slate'])
    return fig


def fig_16_3(L):
    """Polar coordinates; the slices of a polar area; the circle r = 2 sin(theta), the cardioid r = 1 + cos(theta), the rose r = cos(3 theta), the spiral r = theta/2."""
    fig, ax = figure_grid(2, 3, w=7.6, h=5.0)

    # (r, theta) = (2, pi/3).
    a = ax[0]
    plain_axes(a, (-0.6, 2.6), (-0.45, 2.45))
    polar_grid(a, 2.4, 1.0)
    th0, r0 = PI / 3, 2.0
    x0, y0 = r0 * np.cos(th0), r0 * np.sin(th0)
    a.plot([0, x0], [0, y0], color=C['blue'], lw=2.2, zorder=4)
    a.plot([x0, x0], [0, y0], color=C['orange'], lw=1.4, ls=(0, (4, 2)), zorder=4)
    a.plot([0, x0], [0, 0], color=C['green'], lw=3.0, solid_capstyle='butt', zorder=4)
    aa = np.linspace(0, th0, 40)
    a.plot(0.55 * np.cos(aa), 0.55 * np.sin(aa), color=C['navy'], lw=1.1, zorder=4)
    dot(a, x0, y0, color=C['navy'], size=6)
    label(a, 0.6, 0.27, r'$\theta$', size=12)
    label(a, 0.25, 1.15, r'$r$', size=12, color=C['blue'])
    label(a, x0 + 0.08, y0 / 2, r'$y = r\sin\theta$', size=10.5, color=C['orange'])
    label(a, x0 / 2, -0.25, r'$x = r\cos\theta$', size=10.5, color=C['green'], ha='center')
    label(a, x0 + 0.08, y0 + 0.13, r'$(r, \theta)$', size=11)
    title(a, 'polar coordinates', size=11, pad=26)

    # Slices of the region r <= f(theta), alpha <= theta <= beta.
    a = ax[1]
    plain_axes(a, (-0.4, 2.6), (-0.3, 2.45), xlabel='', ylabel='')
    f = lambda th: 1.6 + 0.35 * np.sin(3 * th)
    al, be, n = 0.3, 1.3, 8
    th = np.linspace(al, be, 200)
    xs = np.concatenate([[0], f(th) * np.cos(th), [0]])
    ys = np.concatenate([[0], f(th) * np.sin(th), [0]])
    a.fill(xs, ys, color=C['skyl'], lw=0, zorder=1)
    dth = (be - al) / n
    for k in range(n + 1):
        tk = al + k * dth
        a.plot([0, f(tk) * np.cos(tk)], [0, f(tk) * np.sin(tk)], color=C['sky'], lw=0.9, zorder=2)
    k = 6
    t1, t2 = al + k * dth, al + (k + 1) * dth
    rk = f((t1 + t2) / 2)
    ts = np.linspace(t1, t2, 30)
    a.fill(np.concatenate([[0], rk * np.cos(ts)]), np.concatenate([[0], rk * np.sin(ts)]), color=C['orange'], alpha=0.5, lw=0, zorder=3)
    a.plot(f(th) * np.cos(th), f(th) * np.sin(th), color=C['blue'], lw=2.2, zorder=4)
    for tb, lab in ((al, r'$\alpha$'), (be, r'$\beta$')):
        a.plot([0, f(tb) * np.cos(tb)], [0, f(tb) * np.sin(tb)], color=C['navy'], lw=1.3, zorder=4)
        label(a, (f(tb) + 0.2) * np.cos(tb), (f(tb) + 0.2) * np.sin(tb), lab, size=12, ha='center')
    label(a, 1.45, 1.6, r'$r = f(\theta)$', size=10.5, color=C['blue'])
    tm = (t1 + t2) / 2
    label(a, (rk + 0.3) * np.cos(tm), (rk + 0.3) * np.sin(tm), r'$\Delta\theta$', size=11, color=C['orange'], ha='center')
    title(a, r'slices of area $\frac{1}{2}r^2\Delta\theta$', size=11, pad=8)

    # The circle r = 2 sin(theta).
    a = ax[2]
    plain_axes(a, (-1.45, 1.45), (-0.45, 2.45), xlabel='', ylabel='')
    polar_grid(a, 2.2, 1.0)
    polar_curve(a, lambda th: 2 * np.sin(th), 0, PI, color=C['blue'], lw=2.4, zorder=4)
    dot(a, 0, 1, color=C['navy'], size=4)
    label(a, 0.08, 1.0, r'$(0, 1)$', size=10)
    title(a, r'circle $r = 2\sin\theta$', size=11, pad=8)

    # The cardioid.
    a = ax[3]
    plain_axes(a, (-0.6, 2.35), (-1.5, 1.5), xlabel='', ylabel='')
    polar_grid(a, 2.1, 1.0)
    th = np.linspace(0, 2 * PI, 600)
    rr = 1 + np.cos(th)
    a.fill(rr * np.cos(th), rr * np.sin(th), color=C['skyl'], lw=0, zorder=1)
    polar_curve(a, lambda t: 1 + np.cos(t), 0, 2 * PI, color=C['blue'], lw=2.4, zorder=4)
    label(a, 0.95, 0.42, r'area $\frac{3\pi}{2}$', size=11, ha='center', color=C['navy'])
    title(a, r'cardioid $r = 1 + \cos\theta$', size=11, pad=8)

    # The rose.
    a = ax[4]
    plain_axes(a, (-1.2, 1.25), (-1.15, 1.15), xlabel='', ylabel='')
    polar_grid(a, 1.1, 0.5)
    th = np.linspace(-PI / 6, PI / 6, 200)
    rr = np.cos(3 * th)
    a.fill(rr * np.cos(th), rr * np.sin(th), color=C['orangel'], lw=0, zorder=1)
    polar_curve(a, lambda t: np.cos(3 * t), 0, PI, color=C['blue'], lw=2.4, zorder=4)
    label(a, 0.62, 0.0, r'$\frac{\pi}{12}$', size=12, ha='center', color=C['orange'])
    title(a, r'rose $r = \cos 3\theta$', size=11, pad=8)

    # The spiral.
    a = ax[5]
    plain_axes(a, (-5.4, 7.0), (-6.0, 4.4), xlabel='', ylabel='')
    polar_grid(a, 6.4, PI, rays=8)
    polar_curve(a, lambda t: t / 2, 0, 4 * PI, color=C['blue'], lw=2.2, zorder=4)
    title(a, r'spiral $r = \theta/2$', size=11, pad=8)
    fig.tight_layout(h_pad=1.2, w_pad=1.0)
    return fig


def fig_16_4(L):
    """A point in space and its position vector; adding two vectors; multiplying a vector by scalars."""
    fig = plt.figure(figsize=(7.6, 3.3))
    a1 = fig.add_axes([-0.03, -0.03, 0.38, 1.06], projection='3d', computed_zorder=False)
    style3d(a1)
    P = (2, 4, 3)
    axes3(a1, (3.2, 4.9, 4.0))
    box = [((2, 0, 0), (2, 4, 0)), ((0, 4, 0), (2, 4, 0)), ((2, 4, 0), (2, 4, 3)), ((2, 0, 0), (2, 0, 3)),
           ((0, 4, 0), (0, 4, 3)), ((0, 0, 3), (2, 0, 3)), ((0, 0, 3), (0, 4, 3)), ((2, 0, 3), (2, 4, 3)), ((0, 4, 3), (2, 4, 3))]
    for p, q in box:
        a1.plot(*zip(p, q), color=C['muted'], lw=1.0, ls=(0, (3, 2)))
    arrow3(a1, (0, 0, 0), P, C['blue'], lw=2.2, ratio=0.55)
    for d in ((1, 0, 0), (0, 1, 0), (0, 0, 1)):
        arrow3(a1, (0, 0, 0), d, C['orange'], lw=2.4, ratio=0.3)
    text3(a1, 1.0, -0.55, -0.15, r'$\mathbf{i}$', color=C['orange'], size=12)
    text3(a1, 0.15, 1.0, -0.55, r'$\mathbf{j}$', color=C['orange'], size=12)
    text3(a1, 0.25, -0.35, 1.0, r'$\mathbf{k}$', color=C['orange'], size=12)
    a1.scatter(*P, color=C['navy'], s=20, depthshade=False)
    text3(a1, 2.0, 4.0, 3.3, r'$P(2, 4, 3)$', size=11, ha='center')
    text3(a1, 1.0, 2.1, 1.95, r'$\langle 2, 4, 3\rangle$', color=C['blue'], size=11, ha='right')
    text3(a1, 2.0, -0.3, -0.25, '$2$', size=10.5, color=C['slate'])
    text3(a1, 0.0, 4.0, -0.45, '$4$', size=10.5, color=C['slate'])
    text3(a1, -0.2, -0.25, 3.0, '$3$', size=10.5, color=C['slate'])
    a1.set_xlim(0, 3.2)
    a1.set_ylim(0, 4.9)
    a1.set_zlim(0, 4.0)
    a1.set_box_aspect((3.2, 4.9, 4.0), zoom=1.05)
    a1.view_init(elev=20, azim=25)

    a2 = fig.add_axes([0.41, 0.08, 0.29, 0.84])
    plain_axes(a2, (-0.4, 4.6), (-0.4, 3.6))
    A, B = np.array([3, 1]), np.array([1, 2])
    S = A + B
    a2.fill([0, A[0], S[0], B[0]], [0, A[1], S[1], B[1]], color=C['skyp'], lw=0, zorder=0.5)
    arrow(a2, 0, 0, *A, color=C['blue'], lw=2.2)
    arrow(a2, *A, *S, color=C['orange'], lw=2.2)
    darrow(a2, 0, 0, *B, color=C['orange'])
    darrow(a2, *B, *S, color=C['blue'])
    arrow(a2, 0, 0, *S, color=C['green'], lw=2.4)
    label(a2, 1.6, 0.25, r'$\mathbf{a}$', color=C['blue'], size=13)
    label(a2, 3.65, 1.85, r'$\mathbf{b}$', color=C['orange'], size=13)
    label(a2, 2.05, 1.95, r'$\mathbf{a} + \mathbf{b}$', color=C['green'], size=12, ha='center')
    panel_title(a2, 'adding', size=11)

    a3 = fig.add_axes([0.71, 0.08, 0.28, 0.84])
    a3.set_xlim(-0.3, 4.8)
    a3.set_ylim(-2.2, 3.9)
    a3.set_aspect('equal')
    a3.set_axis_off()
    v = np.array([2.0, 1.0])
    nrm = np.array([-1.0, 2.0]) / np.sqrt(5)
    rows = ((np.array([0.2, 2.4]), 1, r'$\mathbf{v}$', C['blue']), (np.array([0.2, 0.9]), 2, r'$2\mathbf{v}$', C['green']),
            (np.array([2.6, -0.1]), -1, r'$-\mathbf{v}$', C['orange']), (np.array([2.6, -1.9]), 0.5, r'$\frac{1}{2}\mathbf{v}$', C['purple']))
    for base, c, lab, col in rows:
        tip = base + c * v
        arrow(a3, *base, *tip, color=col, lw=2.2)
        mid = (base + tip) / 2 + 0.38 * nrm
        label(a3, mid[0], mid[1], lab, color=col, size=12, ha='center')
    panel_title(a3, 'scaling', size=11)
    return fig


def fig_16_5(L):
    """The projection of b onto a; the cross product of a and b, perpendicular to both, with length the area of their parallelogram."""
    fig = plt.figure(figsize=(7.6, 3.6))
    a1 = fig.add_axes([0.03, 0.06, 0.44, 0.86])
    plain_axes(a1, (-0.5, 5.2), (-0.5, 4.4))
    A, B = np.array([2.0, 1.0]), np.array([3.0, 4.0])
    Pj = np.array([4.0, 2.0])
    a1.plot([-0.4, 5.0], [-0.2, 2.5], color=C['muted'], lw=1.0, ls=(0, (4, 3)), zorder=1)
    arrow(a1, 0, 0, *Pj, color=C['orange'], lw=4.0, head=14)
    arrow(a1, 0, 0, *A, color=C['blue'], lw=2.2)
    arrow(a1, 0, 0, *B, color=C['green'], lw=2.2)
    a1.plot([B[0], Pj[0]], [B[1], Pj[1]], color=C['slate'], lw=1.3, ls=(0, (4, 2)), zorder=3)
    u = A / np.linalg.norm(A)
    w = np.array([-u[1], u[0]])
    s = 0.22
    sq = [Pj - s * u, Pj - s * u + s * w, Pj + s * w]
    a1.plot([q[0] for q in sq], [q[1] for q in sq], color=C['slate'], lw=1.0, zorder=3)
    ang = np.linspace(np.arctan2(A[1], A[0]), np.arctan2(B[1], B[0]), 40)
    a1.plot(0.8 * np.cos(ang), 0.8 * np.sin(ang), color=C['navy'], lw=1.1, zorder=4)
    label(a1, 0.95, 0.85, r'$\theta$', size=12)
    label(a1, 1.15, 0.22, r'$\mathbf{a}$', color=C['blue'], size=13)
    label(a1, 1.2, 2.35, r'$\mathbf{b}$', color=C['green'], size=13, ha='right')
    label(a1, 4.1, 1.55, r'$\mathrm{proj}_{\mathbf{a}}\mathbf{b}$', color=C['orange'], size=12)
    label(a1, 3.62, 3.25, r'$\mathbf{b} - \mathrm{proj}_{\mathbf{a}}\mathbf{b}$', color=C['slate'], size=11)
    panel_title(a1, 'projection', size=11)

    a2 = fig.add_axes([0.5, -0.05, 0.5, 1.0], projection='3d', computed_zorder=False)
    style3d(a2)
    a2.patch.set_alpha(0)
    a = np.array([1.8, 0.3, 0.0])
    b = np.array([0.4, 1.6, 0.0])
    n = np.cross(a, b)
    axes3(a2, (2.4, 2.4, 3.2))
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection
    a2.add_collection3d(Poly3DCollection([[tuple(0 * a), tuple(a), tuple(a + b), tuple(b)]], facecolor=C['skyl'],
                                         edgecolor=C['sky'], alpha=0.9))
    arrow3(a2, (0, 0, 0), a, C['blue'], lw=2.4, ratio=0.35)
    arrow3(a2, (0, 0, 0), b, C['green'], lw=2.4, ratio=0.35)
    arrow3(a2, (0, 0, 0), n, C['orange'], lw=2.6, ratio=0.4)
    ang = np.linspace(np.arctan2(a[1], a[0]), np.arctan2(b[1], b[0]), 40)
    a2.plot(0.7 * np.cos(ang), 0.7 * np.sin(ang), 0 * ang, color=C['navy'], lw=1.2)
    tip = 0.7 * np.array([np.cos(ang[-1]), np.sin(ang[-1]), 0])
    prev = 0.7 * np.array([np.cos(ang[-6]), np.sin(ang[-6]), 0])
    arrow3(a2, prev, tip, C['navy'], lw=1.2, ratio=0.12)
    text3(a2, *(a * 1.1 + np.array([0, -0.25, 0])), r'$\mathbf{a}$', color=C['blue'], size=13)
    text3(a2, *(b * 1.08 + np.array([-0.2, 0.05, 0])), r'$\mathbf{b}$', color=C['green'], size=13)
    text3(a2, 0.0, 0.25, n[2] * 0.72, r'$\mathbf{a}\times\mathbf{b}$', color=C['orange'], size=13)
    text3(a2, *((a + b) / 2 + np.array([0.15, 0.1, 0])), 'area', color=C['sky'], size=10.5, ha='center')
    a2.set_xlim(0, 2.4)
    a2.set_ylim(0, 2.4)
    a2.set_zlim(0, 3.2)
    a2.set_box_aspect((2.4, 2.4, 3.2), zoom=0.92)
    a2.view_init(elev=22, azim=25)
    panel_title(a1, 'projection', size=11)
    fig.text(0.85, 0.93, 'cross product', fontsize=11, color=C['navy'], ha='center')
    return fig


FIGURES = {'fig-16-1': fig_16_1, 'fig-16-2': fig_16_2, 'fig-16-3': fig_16_3, 'fig-16-4': fig_16_4, 'fig-16-5': fig_16_5}
