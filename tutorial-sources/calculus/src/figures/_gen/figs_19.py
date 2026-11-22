"""Figures of Module 19: Multiple integrals."""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
from matplotlib.patches import Polygon, Wedge, Circle, Rectangle
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, figure3d, math_axes, plot_fn, plot_param, dot, label,
                        #  shade, riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi


def title(ax, text, size=12, pad=10):
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def text3d(ax, x, y, z, s, color=None, dx=0, dy=0, ha='left', va='center', size=11):
    """Text at the point (x, y, z) of a 3D axes, shifted on the page by (dx, dy) points, with a white halo."""
    from matplotlib.transforms import offset_copy
    tr = offset_copy(ax.transData, fig=ax.figure, x=dx, y=dy, units='points')
    t = ax.text(x, y, z, s, color=color or C['navy'], ha=ha, va=va, fontsize=size, zorder=20, transform=tr)
    t.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])
    return t


def plain3d(ax):
    """A 3D axes with light panes, light ticks and grid."""
    ax.tick_params(axis='both', which='major', labelsize=9, pad=-2, colors=C['slate'])
    for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
        axis.pane.set_facecolor('#F8FAFC')
        axis.pane.set_edgecolor(C['border'])
        axis._axinfo['grid']['color'] = C['grid']


# ----------------------------------------------------------------------------------------------- 19.1
def dome(x, y):
    """The surface of Examples 19.1 and 19.2: z = 8 - x^2 - y^2."""
    return 8 - x**2 - y**2


def fig_19_1(L):
    """Boxes under the surface z = 8 - x^2 - y^2 over the square [0, 2] x [0, 2]: a double Riemann sum with 16 boxes."""
    fig = plt.figure(figsize=(7.6, 4.3))
    ax = fig.add_axes([0.0, -0.06, 0.78, 1.12], projection='3d')
    ax.set_proj_type('ortho')
    ax.computed_zorder = False
    n = 4
    d = 2.0 / n
    # The boxes: on each small square, the height is the value of f at the corner farthest from the origin,
    # the least value of f on that square, so every box lies under the surface.
    azim, elev = 38, 24
    boxes = []
    for i in range(n):
        for j in range(n):
            boxes.append((i * d, j * d, dome((i + 1) * d, (j + 1) * d)))
    # Draw the boxes from the back to the front (the viewer looks from the side of large x and y), so that
    # nearer boxes cover farther ones. Only the three faces the viewer sees are drawn: the top and the
    # faces at the larger x and the larger y.
    ca, sa = np.cos(np.radians(azim)), np.sin(np.radians(azim))
    boxes.sort(key=lambda b: (b[0] + d / 2) * ca + (b[1] + d / 2) * sa)
    for k, (x0, y0, hb) in enumerate(boxes):
        x1, y1 = x0 + d, y0 + d
        top = [(x0, y0, hb), (x1, y0, hb), (x1, y1, hb), (x0, y1, hb)]
        fx = [(x1, y0, 0), (x1, y1, 0), (x1, y1, hb), (x1, y0, hb)]
        fy = [(x0, y1, 0), (x1, y1, 0), (x1, y1, hb), (x0, y1, hb)]
        ax.add_collection3d(Poly3DCollection([fx, fy, top], facecolor=['#BFDBFE', '#93C5FD', C['skyl']],
                                             edgecolor=C['blue'], linewidth=0.6, zorder=1 + 0.01 * k))
    # The surface over the square: its grid lines, which pass through the far top corners of the boxes.
    g = np.linspace(0, 2, 41)
    for c in np.linspace(0, 2, 5):
        ax.plot(g, np.full_like(g, c), dome(g, c), color=C['orange'], lw=1.1, zorder=4)
        ax.plot(np.full_like(g, c), g, dome(c, g), color=C['orange'], lw=1.1, zorder=4)
    # One sample point: the far corner of a square, on the surface, at the corner of the top of its box.
    sx, sy = 1.5, 1.0
    ax.plot([sx], [sy], [dome(sx, sy)], 'o', color=C['navy'], markersize=6, zorder=6)
    ax.set_xlim(0, 2.0)
    ax.set_ylim(0, 2.0)
    ax.set_zlim(0, 8.2)
    ax.set_box_aspect((1, 1, 0.8), zoom=0.95)
    ax.view_init(elev=elev, azim=azim)
    ax.set_xticks([0, 0.5, 1, 1.5, 2])
    ax.set_yticks([0, 0.5, 1, 1.5])
    ax.set_zticks([0, 2, 4, 6, 8])
    ax.set_xlabel(r'$x$', fontsize=12, labelpad=-6)
    ax.set_ylabel(r'$y$', fontsize=12, labelpad=-6)
    ax.set_zlabel(r'$z$', fontsize=12, labelpad=-8)
    plain3d(ax)
    text3d(ax, 0.0, 0.0, 8.0, r'$z = 8 - x^2 - y^2$', color=C['orange'], dx=8, dy=10, size=12)
    # Explanations beside the picture.
    fig.text(0.74, 0.70, '16 boxes, one on each\nsmall square of area\n$\\Delta A = 0.25$', fontsize=11, color=C['navy'],
             ha='left', va='center', linespacing=1.5)
    fig.text(0.74, 0.42, 'height of a box: the\nvalue of $f$ at a point\nof its square (dot)', fontsize=11,
             color=C['navy'], ha='left', va='center', linespacing=1.5)
    fig.text(0.74, 0.17, 'total volume of the\nboxes: 17', fontsize=11, color=C['blue'], ha='left', va='center',
             linespacing=1.5)
    return fig


# ----------------------------------------------------------------------------------------------- 19.2
def fig_19_2(L):
    """Type I and type II regions: a vertical slice runs from y = g1(x) to y = g2(x); a horizontal slice from x = h1(y) to x = h2(y)."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.5)

    g1 = lambda x: 0.55 + 0.22 * (x - 2.1)**2
    g2 = lambda x: 2.55 + 0.45 * np.sin(1.4 * (x - 0.9))
    a, b, x0 = 0.8, 3.6, 2.45
    math_axes(a1, (-0.15, 4.3), (-0.35, 3.6), xticks=[(a, r'$a$'), (x0, r'$x$'), (b, r'$b$')], yticks=[], grid=False)
    shade(a1, g2, a, b, g=g1, color=C['blue'], alpha=0.18)
    plot_fn(a1, g1, a, b, color=C['blue'], lw=2.0)
    plot_fn(a1, g2, a, b, color=C['green'], lw=2.0)
    a1.plot([a, a], [g1(a), g2(a)], color=C['slate'], lw=1.4)
    a1.plot([b, b], [g1(b), g2(b)], color=C['slate'], lw=1.4)
    guide(a1, x=a, upto=g1(a))
    guide(a1, x=b, upto=g1(b))
    a1.plot([x0, x0], [g1(x0), g2(x0)], color=C['orange'], lw=4, solid_capstyle='butt', zorder=5)
    a1.plot([x0, x0], [0, g1(x0)], color=C['orange'], lw=1.1, ls=(0, (3, 3)), zorder=4)
    dot(a1, x0, g1(x0), color=C['orange'], size=5)
    dot(a1, x0, g2(x0), color=C['orange'], size=5)
    label(a1, 3.05, 3.2, r'$y = g_2(x)$', color=C['green'], size=11)
    label(a1, 2.75, 0.32, r'$y = g_1(x)$', color=C['blue'], size=11)
    label(a1, 1.2, 1.75, r'$D$', size=13)
    title(a1, 'Type I: vertical slices')

    h1 = lambda y: 0.75 + 0.3 * (y - 1.7)**2
    h2 = lambda y: 3.1 + 0.4 * np.sin(1.5 * y)
    c, d, y0 = 0.5, 3.0, 1.95
    math_axes(a2, (-0.15, 4.3), (-0.35, 3.6), xticks=[], yticks=[(c, r'$c$'), (y0, r'$y$'), (d, r'$d$')], grid=False)
    ys = np.linspace(c, d, 400)
    a2.fill_betweenx(ys, h1(ys), h2(ys), color=C['blue'], alpha=0.18, linewidth=0, zorder=2)
    a2.plot(h1(ys), ys, color=C['blue'], lw=2.0, zorder=4)
    a2.plot(h2(ys), ys, color=C['green'], lw=2.0, zorder=4)
    a2.plot([h1(c), h2(c)], [c, c], color=C['slate'], lw=1.4)
    a2.plot([h1(d), h2(d)], [d, d], color=C['slate'], lw=1.4)
    a2.plot([0, h1(c)], [c, c], ls=(0, (4, 3)), color=C['slate'], lw=1.1, zorder=3)
    a2.plot([0, h1(d)], [d, d], ls=(0, (4, 3)), color=C['slate'], lw=1.1, zorder=3)
    a2.plot([h1(y0), h2(y0)], [y0, y0], color=C['orange'], lw=4, solid_capstyle='butt', zorder=5)
    a2.plot([0, h1(y0)], [y0, y0], color=C['orange'], lw=1.1, ls=(0, (3, 3)), zorder=4)
    dot(a2, h1(y0), y0, color=C['orange'], size=5)
    dot(a2, h2(y0), y0, color=C['orange'], size=5)
    label(a2, 0.55, 3.35, r'$x = h_1(y)$', color=C['blue'], size=11)
    label(a2, 3.05, 3.35, r'$x = h_2(y)$', color=C['green'], size=11)
    label(a2, 2.0, 1.0, r'$D$', size=13)
    title(a2, 'Type II: horizontal slices')
    fig.tight_layout(w_pad=2.0)
    return fig


# ----------------------------------------------------------------------------------------------- 19.3
def fig_19_3(L):
    """A polar rectangle and its area r dr dtheta; the disc, square and larger disc that squeeze the Gaussian integral."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7)

    # A polar rectangle r0 <= r <= r1, t0 <= theta <= t1.
    r0, r1, t0, t1 = 1.7, 2.5, 0.42, 0.86
    a1.set_xlim(-0.25, 3.0)
    a1.set_ylim(-0.25, 2.75)
    a1.set_aspect('equal')
    a1.axis('off')
    a1.annotate('', xy=(3.0, 0), xytext=(-0.2, 0), arrowprops=dict(arrowstyle='-|>', color=C['navy'], lw=1.1, mutation_scale=11))
    a1.annotate('', xy=(0, 2.75), xytext=(0, -0.2), arrowprops=dict(arrowstyle='-|>', color=C['navy'], lw=1.1, mutation_scale=11))
    a1.text(3.0, -0.1, r'$x$', fontsize=13, color=C['navy'], ha='right', va='top')
    a1.text(-0.08, 2.75, r'$y$', fontsize=13, color=C['navy'], ha='right', va='top')
    # A light polar grid.
    for rr in (0.85, 1.7, 2.5):
        th = np.linspace(0, PI / 2, 100)
        a1.plot(rr * np.cos(th), rr * np.sin(th), color=C['grid'], lw=1.0, zorder=1)
    for tt in (t0, t1, PI / 4 - 0.6, 1.25):
        a1.plot([0, 2.75 * np.cos(tt)], [0, 2.75 * np.sin(tt)], color=C['grid'], lw=1.0, zorder=1)
    a1.add_patch(Wedge((0, 0), r1, np.degrees(t0), np.degrees(t1), width=r1 - r0, facecolor=C['skyl'],
                       edgecolor=C['blue'], lw=1.8, zorder=3))
    # The rays and arcs that bound it.
    for tt in (t0, t1):
        a1.plot([0, r0 * np.cos(tt)], [0, r0 * np.sin(tt)], color=C['slate'], lw=1.0, ls=(0, (4, 3)), zorder=2)
    th = np.linspace(0, t0, 50)
    a1.plot(0.55 * np.cos(th), 0.55 * np.sin(th), color=C['slate'], lw=1.0, zorder=2)
    label(a1, 0.6, 0.12, r'$\theta$', size=11, color=C['slate'])
    th = np.linspace(t0, t1, 50)
    a1.plot(0.95 * np.cos(th), 0.95 * np.sin(th), color=C['orange'], lw=1.4, zorder=2)
    label(a1, 0.98 * np.cos(0.64), 0.98 * np.sin(0.64) + 0.04, r'$\Delta\theta$', size=11, color=C['orange'])
    # Its sides: dr along a ray, r dtheta along an arc.
    rm = (r0 + r1) / 2
    xa, ya = r0 * np.cos(t0), r0 * np.sin(t0)
    xb, yb = r1 * np.cos(t0), r1 * np.sin(t0)
    a1.plot([xa, xb], [ya, yb], color=C['green'], lw=3.2, solid_capstyle='butt', zorder=4)
    label(a1, (xa + xb) / 2 + 0.06, (ya + yb) / 2 - 0.2, r'$\Delta r$', color=C['green'], size=12)
    th = np.linspace(t0, t1, 50)
    a1.plot(r1 * np.cos(th), r1 * np.sin(th), color=C['purple'], lw=3.2, zorder=4)
    label(a1, r1 * np.cos(0.66) + 0.08, r1 * np.sin(0.66) + 0.08, r'$r\,\Delta\theta$', color=C['purple'], size=12)
    title(a1, 'A polar rectangle', size=12)

    # The squeeze of the Gaussian integral: disc of radius a, square [-a, a]^2, disc of radius a*sqrt(2).
    A = 1.0
    lim = 1.62
    a2.set_xlim(-lim, lim)
    a2.set_ylim(-lim, lim)
    a2.set_aspect('equal')
    a2.axis('off')
    a2.add_patch(Circle((0, 0), A * np.sqrt(2), facecolor=C['amberl'], edgecolor=C['amber'], lw=1.6, zorder=1))
    a2.add_patch(Rectangle((-A, -A), 2 * A, 2 * A, facecolor=C['orangel'], edgecolor=C['orange'], lw=1.8, zorder=2))
    a2.add_patch(Circle((0, 0), A, facecolor=C['skyl'], edgecolor=C['blue'], lw=1.8, zorder=3))
    a2.annotate('', xy=(1.62, 0), xytext=(-1.62, 0), arrowprops=dict(arrowstyle='-|>', color=C['navy'], lw=1.0, mutation_scale=10), zorder=4)
    a2.annotate('', xy=(0, 1.62), xytext=(0, -1.62), arrowprops=dict(arrowstyle='-|>', color=C['navy'], lw=1.0, mutation_scale=10), zorder=4)
    a2.plot([0, A * np.cos(PI / 4)], [0, A * np.sin(PI / 4)], color=C['blue'], lw=1.4, zorder=5)
    label(a2, 0.2, 0.42, r'$a$', color=C['blue'], size=11)
    a2.plot([0, A], [0, -A], color=C['amber'], lw=1.4, zorder=5)
    label(a2, 0.62, -0.28, r'$a\sqrt{2}$', color=C['amber'], size=11)
    label(a2, -0.55, 0.3, r'$D_a$', color=C['blue'], size=12, ha='center')
    label(a2, -0.8, -0.82, r'$S_a$', color=C['orange'], size=12, ha='center')
    label(a2, -1.12, 1.12, r'$D_{a\sqrt{2}}$', color=C['amber'], size=12, ha='center')
    a2.text(A + 0.03, -0.04, r'$a$', fontsize=11, color=C['navy'], ha='left', va='top', zorder=6)
    a2.text(-A - 0.03, -0.04, r'$-a$', fontsize=11, color=C['navy'], ha='right', va='top', zorder=6)
    title(a2, r'$D_a \subset S_a \subset D_{a\sqrt{2}}$', size=12)
    fig.tight_layout(w_pad=1.5)
    return fig


# ----------------------------------------------------------------------------------------------- 19.4
def arc3d(ax, pts, color, lw=1.4, **kw):
    pts = np.asarray(pts)
    ax.plot(pts[:, 0], pts[:, 1], pts[:, 2], color=color, lw=lw, **kw)


def fig_19_4(L):
    """Spherical coordinates: the point P at distance rho from the origin, at angle phi from the positive z-axis, and with the angle theta of cylindrical coordinates."""
    fig = plt.figure(figsize=(7.6, 4.2))
    rho, phi, theta = 1.0, 0.8, 0.95
    r = rho * np.sin(phi)
    P = np.array([r * np.cos(theta), r * np.sin(theta), rho * np.cos(phi)])
    Q = np.array([P[0], P[1], 0.0])

    ax = fig.add_axes([-0.06, -0.06, 0.62, 1.14], projection='3d')
    ax.set_proj_type('ortho')
    ax.computed_zorder = False
    # Axes.
    L0 = 1.35
    for v, name in ((np.array([L0, 0, 0]), r'$x$'), (np.array([0, L0, 0]), r'$y$'), (np.array([0, 0, L0]), r'$z$')):
        ax.plot([0, v[0]], [0, v[1]], [0, v[2]], color=C['navy'], lw=1.2, zorder=2)
        text3d(ax, *(v * 1.06), name, size=13, ha='center')
    # A faint sphere of radius rho: a few parallels and meridians.
    tt = np.linspace(0, 2 * PI, 120)
    for pp in (PI / 6, PI / 3, PI / 2, 2 * PI / 3):
        ax.plot(rho * np.sin(pp) * np.cos(tt), rho * np.sin(pp) * np.sin(tt), np.full_like(tt, rho * np.cos(pp)),
                color=C['border'], lw=0.8, zorder=1)
    pp = np.linspace(0, PI, 80)
    for t_ in (0, PI / 2, theta):
        ax.plot(rho * np.sin(pp) * np.cos(t_), rho * np.sin(pp) * np.sin(t_), rho * np.cos(pp),
                color=C['border'] if t_ != theta else C['muted'], lw=0.8, zorder=1)
    # rho, its projection, and the height.
    ax.plot([0, P[0]], [0, P[1]], [0, P[2]], color=C['blue'], lw=2.4, zorder=5)
    ax.plot([0, Q[0]], [0, Q[1]], [0, 0], color=C['green'], lw=2.0, ls=(0, (4, 2)), zorder=4)
    ax.plot([Q[0], P[0]], [Q[1], P[1]], [0, P[2]], color=C['slate'], lw=1.2, ls=(0, (4, 3)), zorder=4)
    ax.plot([0, 0], [0, 0], [0, P[2]], color=C['slate'], lw=1.0, ls=(0, (2, 2)), zorder=3)
    ax.plot([0, P[0]], [0, P[1]], [P[2], P[2]], color=C['slate'], lw=1.0, ls=(0, (2, 2)), zorder=3)
    ax.plot([P[0]], [P[1]], [P[2]], 'o', color=C['navy'], markersize=6, zorder=8)
    # The angles.
    s = np.linspace(0, phi, 40)
    arc3d(ax, np.column_stack([0.42 * np.sin(s) * np.cos(theta), 0.42 * np.sin(s) * np.sin(theta), 0.42 * np.cos(s)]), C['orange'], lw=1.8, zorder=6)
    s = np.linspace(0, theta, 40)
    arc3d(ax, np.column_stack([0.36 * np.cos(s), 0.36 * np.sin(s), 0 * s]), C['purple'], lw=1.8, zorder=6)
    text3d(ax, *P, r'$P(\rho, \theta, \varphi)$', dx=6, dy=8, size=12)
    text3d(ax, *(P * 0.55), r'$\rho$', color=C['blue'], dx=-4, dy=8, ha='right', size=13)
    text3d(ax, 0.55 * np.sin(phi / 2) * np.cos(theta), 0.55 * np.sin(phi / 2) * np.sin(theta), 0.55 * np.cos(phi / 2),
           r'$\varphi$', color=C['orange'], dx=2, dy=4, size=13)
    text3d(ax, 0.5 * np.cos(theta / 2), 0.5 * np.sin(theta / 2), 0, r'$\theta$', color=C['purple'], dx=0, dy=-6, size=13, ha='center')
    text3d(ax, *(Q * 0.55), r'$r = \rho\sin\varphi$', color=C['green'], dx=6, dy=-10, size=11)
    text3d(ax, 0, 0, P[2] * 0.6, r'$z = \rho\cos\varphi$', color=C['slate'], dx=-6, dy=0, ha='right', size=11)
    ax.set_xlim(-0.2, 1.2)
    ax.set_ylim(-0.2, 1.2)
    ax.set_zlim(-0.1, 1.3)
    ax.set_box_aspect((1, 1, 1), zoom=1.15)
    ax.view_init(elev=20, azim=28)
    ax.set_axis_off()

    # The text beside: the formulas.
    lines = [r'$x = \rho\sin\varphi\cos\theta$', r'$y = \rho\sin\varphi\sin\theta$', r'$z = \rho\cos\varphi$',
             r'$\rho \geq 0,\quad 0 \leq \varphi \leq \pi$', r'$\rho^2 = x^2 + y^2 + z^2$']
    for k, s_ in enumerate(lines):
        fig.text(0.6, 0.78 - 0.12 * k, s_, fontsize=13, color=C['navy'], ha='left', va='center')
    fig.text(0.6, 0.15, r'$\varphi$: the angle from the positive $z$-axis' + '\n' + r'$\theta$: the angle of cylindrical coordinates',
             fontsize=10.5, color=C['slate'], ha='left', va='center', linespacing=1.5)
    return fig


# ----------------------------------------------------------------------------------------------- 19.5
def fig_19_5(L):
    """A change of variables: a grid of small rectangles in the uv-plane becomes a grid of small curved quadrilaterals; each is nearly a parallelogram."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7, gridspec_kw={'width_ratios': [1, 1.35]})
    T = lambda u, v: (u**2 - v**2, 2 * u * v)
    u0, v0, du, dv = 1.4, 0.45, 0.2, 0.2
    us = np.linspace(1.0, 2.0, 6)
    vs = np.linspace(0.05, 1.05, 6)

    a1.set_xlim(0.75, 2.25)
    a1.set_ylim(-0.15, 1.3)
    a1.set_aspect('equal')
    for side in ('top', 'right'):
        a1.spines[side].set_visible(False)
    a1.set_xticks([1, 1.5, 2])
    a1.set_yticks([0, 0.5, 1])
    a1.tick_params(labelsize=10, colors=C['slate'])
    for u in us:
        a1.plot([u, u], [vs[0], vs[-1]], color=C['muted'], lw=0.9)
    for v in vs:
        a1.plot([us[0], us[-1]], [v, v], color=C['muted'], lw=0.9)
    a1.add_patch(Rectangle((u0, v0), du, dv, facecolor=C['orangel'], edgecolor=C['orange'], lw=1.8, zorder=3))
    label(a1, u0 + du / 2, v0 - 0.08, r'$\Delta u$', color=C['orange'], size=11, ha='center')
    label(a1, u0 + du + 0.03, v0 + dv / 2, r'$\Delta v$', color=C['orange'], size=11)
    a1.plot([u0], [v0], 'o', color=C['navy'], markersize=5, zorder=5)
    a1.set_xlabel(r'$u$', fontsize=13)
    a1.set_ylabel(r'$v$', fontsize=13, rotation=0, labelpad=10)
    title(a1, r'the $uv$-plane', size=12)

    a2.set_aspect('equal')
    for side in ('top', 'right'):
        a2.spines[side].set_visible(False)
    a2.tick_params(labelsize=10, colors=C['slate'])
    tt = np.linspace(0, 1, 100)
    for u in us:
        X, Y = T(u, vs[0] + (vs[-1] - vs[0]) * tt)
        a2.plot(X, Y, color=C['muted'], lw=0.9)
    for v in vs:
        X, Y = T(us[0] + (us[-1] - us[0]) * tt, v)
        a2.plot(X, Y, color=C['muted'], lw=0.9)
    # The image of the small rectangle: a curved quadrilateral.
    s = np.linspace(0, 1, 40)
    edge = [T(u0 + du * s, v0 + 0 * s), T(u0 + du + 0 * s, v0 + dv * s), T(u0 + du * (1 - s), v0 + dv + 0 * s), T(u0 + 0 * s, v0 + dv * (1 - s))]
    px = np.concatenate([e[0] for e in edge])
    py = np.concatenate([e[1] for e in edge])
    a2.add_patch(Polygon(np.column_stack([px, py]), closed=True, facecolor=C['orangel'], edgecolor=C['orange'], lw=1.8, zorder=3))
    # The parallelogram spanned by du * r_u and dv * r_v at T(u0, v0).
    x0, y0 = T(u0, v0)
    ru = np.array([2 * u0, 2 * v0]) * du          # (x_u, y_u) du
    rv = np.array([-2 * v0, 2 * u0]) * dv         # (x_v, y_v) dv
    par = np.array([[x0, y0], [x0 + ru[0], y0 + ru[1]], [x0 + ru[0] + rv[0], y0 + ru[1] + rv[1]], [x0 + rv[0], y0 + rv[1]]])
    a2.add_patch(Polygon(par, closed=True, facecolor='none', edgecolor=C['navy'], lw=1.3, ls=(0, (4, 3)), zorder=4))
    arrow(a2, x0, y0, x0 + ru[0], y0 + ru[1], color=C['blue'], lw=1.6, head=11)
    arrow(a2, x0, y0, x0 + rv[0], y0 + rv[1], color=C['green'], lw=1.6, head=11)
    a2.plot([x0], [y0], 'o', color=C['navy'], markersize=5, zorder=7)
    label(a2, x0 + ru[0] * 0.55 + 0.05, y0 + ru[1] * 0.55 - 0.22, r'$\Delta u\,\mathbf{r}_u$', color=C['blue'], size=11)
    label(a2, x0 + rv[0] - 0.15, y0 + rv[1] * 0.7, r'$\Delta v\,\mathbf{r}_v$', color=C['green'], size=11, ha='right')
    a2.set_xlabel(r'$x$', fontsize=13)
    a2.set_ylabel(r'$y$', fontsize=13, rotation=0, labelpad=10)
    title(a2, r'the $xy$-plane: $x = u^2 - v^2$, $y = 2uv$', size=12)
    fig.tight_layout(w_pad=2.0)
    return fig


FIGURES = {'fig-19-1': fig_19_1, 'fig-19-2': fig_19_2, 'fig-19-3': fig_19_3, 'fig-19-4': fig_19_4, 'fig-19-5': fig_19_5}
