"""Figures of Module 18: Optimisation in several variables."""
import matplotlib.pyplot as plt
import numpy as np
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, figure3d, math_axes, plot_fn, plot_param, dot,
                        #  label, shade, riemann, tangent, guide, arrow, panel_title, C, CURVES)


def title(ax, text, size=12, pad=28):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def style3d(ax):
    """The panes and grid of figstyle.figure3d, for a 3D axes made with add_subplot."""
    for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
        axis.pane.set_facecolor('#F8FAFC')
        axis.pane.set_edgecolor(C['border'])
        axis._axinfo['grid']['color'] = C['grid']
    ax.tick_params(labelsize=10, colors=C['slate'], pad=0)


def levels(ax, X, Y, Z, values, color, lw=1.3, at=None, zorder=3):
    """Level curves Z = value (solid lines), with inline labels at the points of the curves nearest to `at`."""
    cs = ax.contour(X, Y, Z, levels=values, colors=color, linewidths=lw, linestyles='solid', zorder=zorder)
    if at:
        spots = []
        for segs, (px, py) in zip(cs.allsegs, at):
            if px is None:
                continue
            pts = np.vstack([s for s in segs if len(s)])
            k = np.argmin((pts[:, 0] - px)**2 + (pts[:, 1] - py)**2)
            spots.append((pts[k, 0], pts[k, 1]))
        labs = ax.clabel(cs, fmt=lambda v: f'{v:g}'.replace('-', '−'), fontsize=10, inline=True, manual=spots)
        for lab in labs:
            lab.set_zorder(6)
    return cs


def fig_18_1(L):
    """The saddle z = x^2 - y^2: along the x-axis the origin is a minimum, along the y-axis a maximum; and its level curves."""
    fig = plt.figure(figsize=(7.6, 3.9))
    ax = fig.add_subplot(1, 2, 1, projection='3d', computed_zorder=False)
    style3d(ax)
    s = np.linspace(-1.5, 1.5, 31)
    X, Y = np.meshgrid(s, s)
    ax.plot_surface(X, Y, X**2 - Y**2, color=C['skyl'], edgecolor=C['sky'], linewidth=0.35, alpha=0.9,
                    shade=False, zorder=1)
    t = np.linspace(-1.5, 1.5, 200)
    ax.plot(t, 0 * t, t**2, color=C['green'], lw=2.6, zorder=5)
    ax.plot(0 * t, t, -t**2, color=C['orange'], lw=2.6, zorder=5)
    ax.scatter([0], [0], [0], color=C['navy'], s=36, zorder=6, depthshade=False)
    ax.text(1.55, 0, 2.45, r'$z = x^2$', color=C['green'], fontsize=12, zorder=7)
    ax.text(0, 1.45, -2.75, r'$z = -y^2$', color=C['orange'], fontsize=12, zorder=7)
    ax.set_xlabel(r'$x$', fontsize=12, labelpad=2)
    ax.set_ylabel(r'$y$', fontsize=12, labelpad=0)
    ax.set_zlabel(r'$z$', fontsize=12, labelpad=-6)
    ax.set_xticks([-1, 0, 1])
    ax.set_yticks([-1, 0, 1])
    ax.set_zticks([-2, 0, 2])
    ax.view_init(elev=22, azim=-56)
    ax.set_box_aspect((1, 1, 0.85), zoom=0.92)
    ax.set_title(r'$z = x^2 - y^2$', fontsize=12, color=C['navy'], pad=0)

    a2 = fig.add_subplot(1, 2, 2)
    math_axes(a2, (-2, 2), (-2, 2), xticks=[-1, 1], yticks=[-1, 1], aspect='equal')
    g = np.linspace(-2, 2, 301)
    GX, GY = np.meshgrid(g, g)
    GZ = GX**2 - GY**2
    levels(a2, GX, GY, GZ, [1, 2, 3], C['green'], lw=1.5, at=[(np.sqrt(1.36), 0.6), (np.sqrt(2.36), 0.6), (np.sqrt(3.36), 0.6)])
    levels(a2, GX, GY, GZ, [-3, -2, -1], C['orange'], lw=1.5, at=[(0.6, np.sqrt(3.36)), (0.6, np.sqrt(2.36)), (0.6, np.sqrt(1.36))])
    a2.plot([-2, 2], [-2, 2], color=C['slate'], lw=1.3, ls=(0, (4, 3)), zorder=3)
    a2.plot([-2, 2], [2, -2], color=C['slate'], lw=1.3, ls=(0, (4, 3)), zorder=3)
    dot(a2, 0, 0, color=C['navy'], size=6)
    label(a2, 0.3, -0.12, 'saddle point', size=10.5, ha='left', va='top')
    label(a2, -1.55, 1.9, r'$0$', color=C['slate'], size=10.5)
    title(a2, 'Level curves')
    fig.tight_layout(w_pad=1.0)
    return fig


def fig_18_2(L):
    """Level curves of f(x, y) = x^3 + y^3 - 3xy: a local minimum at (1, 1), a saddle at the origin, and the candidates for the extreme values on the square [-1, 2] x [-1, 2]."""
    fig, ax = figure(7.6, 4.5)
    f = lambda x, y: x**3 + y**3 - 3 * x * y
    math_axes(ax, (-1.75, 2.75), (-1.75, 2.75), xticks=[-1, 1, 2], yticks=[-1, 1, 2], aspect='equal')
    g = np.linspace(-1.75, 2.75, 361)
    GX, GY = np.meshgrid(g, g)
    GZ = f(GX, GY)
    levels(ax, GX, GY, GZ, [-0.8, -0.4], C['blue'], lw=1.3)
    levels(ax, GX, GY, GZ, [0], C['purple'], lw=2.0)
    levels(ax, GX, GY, GZ, [-6, -3, 1, 3, 6, 10], C['muted'], lw=1.2,
           at=[(-1.5, -0.42), (-1.5, 0.2), (-1.5, 0.92), (-1.5, 1.2), (-1.5, 1.47), (-1.5, 1.78)])
    ax.plot([-1, 2, 2, -1, -1], [-1, -1, 2, 2, -1], color=C['navy'], lw=1.6, ls=(0, (5, 3)), zorder=4)
    sq = dict(markersize=8, zorder=7, markeredgecolor='white', markeredgewidth=1.2)
    ax.plot([0], [0], 's', color=C['purple'], **sq)
    ax.plot([1], [1], 's', color=C['blue'], **sq)
    label(ax, 0.12, -0.2, 'saddle', size=10.5, ha='left', va='top', color=C['purple'])
    label(ax, 1.0, 0.9, 'min', size=10.5, ha='center', va='top', color=C['blue'])
    label(ax, 1.3, 1.66, r'$f = 0$', size=10.5, ha='center', va='bottom', color=C['purple'])
    r2 = np.sqrt(2)
    for (px, py) in ((2, r2), (r2, 2)):
        dot(ax, px, py, color=C['slate'], size=6)
    label(ax, 2.08, r2, r'$8 - 4\sqrt{2}$', size=10.5, ha='left', color=C['slate'])
    dot(ax, -1, -1, color=C['orange'], size=7)
    dot(ax, 2, -1, color=C['green'], size=7)
    dot(ax, -1, 2, color=C['green'], size=7)
    dot(ax, 2, 2, color=C['slate'], size=6)
    label(ax, -1.08, -1.12, r'min $-5$', size=10.5, ha='right', va='top', color=C['orange'])
    label(ax, 2.08, -1.12, 'max 13', size=10.5, ha='left', va='top', color=C['green'])
    label(ax, -1.08, 2.12, 'max 13', size=10.5, ha='right', va='bottom', color=C['green'])
    label(ax, 2.08, 2.12, '4', size=10.5, ha='left', va='bottom', color=C['slate'])
    from matplotlib.lines import Line2D
    keys = [Line2D([], [], marker='s', ls='none', color=C['slate'], markersize=7, label='critical point'),
            Line2D([], [], marker='o', ls='none', color=C['slate'], markersize=6, label='critical point\nof a side'),
            Line2D([], [], color=C['navy'], lw=1.6, ls=(0, (5, 3)), label='the square'),
            Line2D([], [], color=C['purple'], lw=2.0, label=r'level curve $f = 0$'),
            Line2D([], [], color=C['blue'], lw=1.3, label=r'$f = -0.8$, $-0.4$')]
    ax.legend(handles=keys, loc='center left', bbox_to_anchor=(1.04, 0.5), fontsize=10.5, handlelength=1.8,
              labelspacing=0.9, frameon=False)
    return fig


def fig_18_3(L):
    """The largest rectangle in the ellipse x^2/4 + y^2 = 1: the level curve 4xy = 4 touches the ellipse, and there the gradients of the area and of g are parallel."""
    fig, ax = figure(7.0, 4.3)
    math_axes(ax, (-3.3, 3.5), (-1.55, 2.25), xticks=[-1, 1], yticks=[], aspect='equal')
    r2 = np.sqrt(2)
    ax.fill([-r2, r2, r2, -r2], [-r2 / 2, -r2 / 2, r2 / 2, r2 / 2], color=C['amber'], alpha=0.12, lw=0, zorder=1)
    ax.plot([-r2, r2, r2, -r2, -r2], [-r2 / 2, -r2 / 2, r2 / 2, r2 / 2, -r2 / 2], color=C['amber'], lw=1.4, zorder=2)
    g = np.linspace(-3.3, 3.5, 681)
    GX, GY = np.meshgrid(g, np.linspace(-1.55, 2.25, 381))
    GA = 4 * GX * GY
    levels(ax, GX, GY, GA, [2, 6], C['muted'], lw=1.3, at=[(0.27, 1.85), (0.81, 1.85)])
    levels(ax, GX, GY, GA, [4], C['orange'], lw=2.0, at=[(0.54, 1.85)])
    plot_param(ax, lambda t: 2 * np.cos(t), np.sin, 0, 2 * np.pi, color=C['green'], lw=2.4, zorder=4)
    p = np.array([r2, r2 / 2])
    gA = np.array([4 * p[1], 4 * p[0]]) / 4          # grad A at p, drawn at a quarter of its length
    gg = np.array([p[0] / 2, 2 * p[1]]) / 4          # grad g at p, at the same scale
    arrow(ax, p[0], p[1], p[0] + gA[0], p[1] + gA[1], color=C['orange'], lw=2.0, head=13)
    arrow(ax, p[0], p[1], p[0] + gg[0], p[1] + gg[1], color=C['green'], lw=2.6, head=13)
    dot(ax, p[0], p[1], color=C['navy'], size=6)
    label(ax, p[0] + gA[0] + 0.08, p[1] + gA[1] - 0.02, r'$\nabla A$', color=C['orange'], size=12)
    label(ax, p[0] + 0.3, p[1] + 0.12, r'$\nabla g$', color=C['green'], size=12)
    q = np.array([2 * np.cos(np.radians(75)), np.sin(np.radians(75))])   # a point where 4xy = 2 crosses the ellipse
    qA = np.array([4 * q[1], 4 * q[0]]) / 4
    qg = np.array([q[0] / 2, 2 * q[1]]) / 4
    arrow(ax, q[0], q[1], q[0] + qA[0], q[1] + qA[1], color=C['orange'], lw=1.5, head=11)
    arrow(ax, q[0], q[1], q[0] + qg[0], q[1] + qg[1], color=C['green'], lw=1.8, head=11)
    dot(ax, q[0], q[1], color=C['slate'], size=5)
    label(ax, -1.55, -1.12, r'$\frac{x^2}{4} + y^2 = 1$', color=C['green'], size=12, ha='right')
    label(ax, -0.72, 0.28, 'largest\nrectangle', color=C['amber'], size=10.5, ha='center')
    label(ax, -3.2, 1.95, 'level curves of the\n' + r'area $A = 4xy$', color=C['slate'], size=10.5, ha='left', va='center')
    return fig


def fig_18_4(L):
    """Least squares: five data points, the line y = 1.2x + 1.6 that minimises the sum of the squared vertical errors, and the errors."""
    fig, ax = figure(7.0, 3.9)
    xs = np.array([0, 1, 2, 3, 4])
    ys = np.array([1, 4, 3, 6, 6])
    m, b = 1.2, 1.6
    math_axes(ax, (-0.6, 5.2), (-0.4, 7.6), xticks=[1, 2, 3, 4], yticks=[2, 4, 6])
    plot_fn(ax, lambda x: m * x + b, -0.5, 4.9, color=C['blue'], lw=2.3)
    for xi, yi in zip(xs, ys):
        fit = m * xi + b
        ax.plot([xi, xi], [fit, yi], color=C['orange'], lw=2.6, zorder=5, solid_capstyle='butt')
        r = yi - fit
        label(ax, xi + (-0.12 if r > 0 else 0.12), (yi + fit) / 2, (r'$+$' if r > 0 else r'$-$') + f'${abs(r):.1f}$',
              color=C['orange'], size=11, ha='right' if r > 0 else 'left')
        dot(ax, xi, yi, color=C['navy'], size=6.5)
    label(ax, 1.9, 6.6, r'$y = 1.2x + 1.6$', color=C['blue'], size=12, ha='center', va='bottom')
    return fig


def fig_18_5(L):
    """Gradient descent on f(x, y) = (x^2 + 10y^2)/2: with step 0.18 the path zigzags across the long valley; in the coordinates x and v = sqrt(10) y the level curves are circles and the steps head straight for the minimum."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7, gridspec_kw={'width_ratios': [1.75, 1]})
    f = lambda x, y: (x**2 + 10 * y**2) / 2
    x0, y0, eta = -6.0, 2.5, 0.18
    math_axes(a1, (-6.9, 1.4), (-2.75, 2.9), xticks=[-6, -4, -2], yticks=[-2, -1, 1, 2], aspect='equal')
    g1, g2 = np.linspace(-6.9, 1.4, 300), np.linspace(-2.75, 2.9, 240)
    GX, GY = np.meshgrid(g1, g2)
    a1.contour(GX, GY, f(GX, GY), levels=[1, 4, 9, 16, 25, 36, 49.25], colors=C['muted'], linewidths=1.1, zorder=2)
    pts = [(x0, y0)]
    for _ in range(14):
        x, y = pts[-1]
        pts.append((x - eta * x, y - eta * 10 * y))
    a1.plot([p[0] for p in pts], [p[1] for p in pts], color=C['orange'], lw=1.6, zorder=5)
    for p in pts[1:]:
        dot(a1, p[0], p[1], color=C['orange'], size=4.5)
    dot(a1, x0, y0, color=C['navy'], size=6)
    dot(a1, 0, 0, color=C['green'], size=6)
    label(a1, x0 + 0.15, y0 + 0.22, 'start', size=10.5, ha='left', va='bottom')
    label(a1, 0.12, -0.32, 'minimum', size=10.5, ha='left', va='top', color=C['green'])
    title(a1, r'$f(x, y) = \frac{1}{2}(x^2 + 10y^2)$, $\eta = 0.18$', size=11.5)

    v0 = np.sqrt(10) * y0
    math_axes(a2, (-6.9, 1.4), (-1.3, 8.6), xticks=[-6, -4, -2], yticks=[2, 4, 6, 8], ylabel=r'$v$', aspect='equal')
    h1, h2 = np.linspace(-6.9, 1.4, 240), np.linspace(-1.3, 8.6, 280)
    HX, HV = np.meshgrid(h1, h2)
    a2.contour(HX, HV, (HX**2 + HV**2) / 2, levels=[1, 4, 9, 16, 25, 36, 49.25], colors=C['muted'], linewidths=1.1, zorder=2)
    q = [(x0, v0)]
    for _ in range(5):
        u, v = q[-1]
        q.append((u - 0.5 * u, v - 0.5 * v))
    a2.plot([p[0] for p in q], [p[1] for p in q], color=C['orange'], lw=1.6, zorder=5)
    for p in q[1:]:
        dot(a2, p[0], p[1], color=C['orange'], size=4.5)
    dot(a2, x0, v0, color=C['navy'], size=6)
    dot(a2, 0, 0, color=C['green'], size=6)
    title(a2, r'$\frac{1}{2}(x^2 + v^2)$, $\eta = 0.5$', size=11.5)
    fig.tight_layout(w_pad=1.2)
    return fig


FIGURES = {'fig-18-1': fig_18_1, 'fig-18-2': fig_18_2, 'fig-18-3': fig_18_3, 'fig-18-4': fig_18_4, 'fig-18-5': fig_18_5}
