"""Figures of Module 20: Vector calculus."""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
from matplotlib.patches import FancyArrowPatch, Rectangle
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, figure3d, math_axes, plot_fn, plot_param, dot, label,
                        #  shade, riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi


def title(ax, text, size=12, pad=10):
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def quiver(ax, X, Y, U, V, scale, color=None, width=0.0075, zorder=4):
    """Arrows of a vector field drawn from the grid points (X, Y), all shortened by the same factor:
    an arrow of the field's length L is drawn L/scale long, in data units."""
    return ax.quiver(X, Y, U, V, angles='xy', scale_units='xy', scale=scale, color=color or C['blue'],
                     width=width, headwidth=4.2, headlength=4.6, headaxislength=4.2, zorder=zorder, pivot='tail')


def text3d(ax, x, y, z, s, color=None, dx=0, dy=0, ha='left', va='center', size=12):
    """Text at the point (x, y, z) of a 3D axes, shifted on the page by (dx, dy) points, with a white halo."""
    from matplotlib.transforms import offset_copy
    tr = offset_copy(ax.transData, fig=ax.figure, x=dx, y=dy, units='points')
    t = ax.text(x, y, z, s, color=color or C['navy'], ha=ha, va=va, fontsize=size, zorder=30, transform=tr)
    t.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])
    return t


class Arrow3D(FancyArrowPatch):
    """A 2D arrow drawn between the projections of two points of a 3D axes, so that its head always shows."""

    def __init__(self, p, q, **kw):
        super().__init__((0, 0), (0, 0), **kw)
        self._pq = (np.asarray(p, dtype=float), np.asarray(q, dtype=float))

    def do_3d_projection(self, renderer=None):
        from mpl_toolkits.mplot3d import proj3d
        p, q = self._pq
        xs, ys, zs = proj3d.proj_transform([p[0], q[0]], [p[1], q[1]], [p[2], q[2]], self.axes.M)
        self.set_positions((xs[0], ys[0]), (xs[1], ys[1]))
        return min(zs)


def arrow3d(ax, p, v, color, lw=2.0, head=13, zorder=20):
    """An arrow from the point p along the vector v, in a 3D axes."""
    p = np.asarray(p, dtype=float)
    a = Arrow3D(p, p + np.asarray(v, dtype=float), arrowstyle='-|>', mutation_scale=head, color=color, lw=lw,
                shrinkA=0, shrinkB=0, zorder=zorder)
    ax.add_artist(a)
    return a


def plain3d(ax):
    ax.set_proj_type('ortho')
    ax.computed_zorder = False
    ax.set_axis_off()


# ----------------------------------------------------------------------------------------------- 20.1
def fig_20_1(L):
    """Three vector fields: the rotation field <-y, x>, an inverse square field pointing to the origin, and the gradient field of f = x^2 + 2y^2 with level curves of f."""
    fig, axs = figure_grid(1, 3, w=7.6, h=2.95)
    g = np.linspace(-1.75, 1.75, 8)               # a grid that avoids the axes and the origin
    X, Y = np.meshgrid(g, g)
    lim = (-2.4, 2.4)
    ticks = [-2, 2]

    a = axs[0]
    math_axes(a, lim, lim, xticks=ticks, yticks=ticks, aspect='equal')
    plot_param(a, lambda s: 1.5 * np.cos(s), lambda s: 1.5 * np.sin(s), 0, 2 * PI, color=C['orange'], lw=1.6,
               ls=(0, (4, 3)), zorder=3)
    quiver(a, X, Y, -Y, X, scale=6.2)
    title(a, r'rotation $\langle -y, x\rangle$', size=11, pad=22)

    a = axs[1]
    math_axes(a, lim, lim, xticks=ticks, yticks=ticks, aspect='equal')
    R = np.hypot(X, Y)
    keep = R > 1e-9
    Rs = np.where(keep, R, 1.0)
    quiver(a, X[keep], Y[keep], (-X / Rs)[keep], (-Y / Rs)[keep], scale=1 / 0.34)
    dot(a, 0, 0, color=C['navy'], size=7)
    title(a, 'inverse square', size=11, pad=22)

    a = axs[2]
    math_axes(a, lim, lim, xticks=ticks, yticks=ticks, aspect='equal')
    for c in (1, 2.5, 5):
        plot_param(a, lambda s, c=c: np.sqrt(c) * np.cos(s), lambda s, c=c: np.sqrt(c / 2) * np.sin(s), 0, 2 * PI,
                   color=C['orange'], lw=1.4, zorder=3)
    quiver(a, X, Y, 2 * X, 4 * Y, scale=17.5)
    title(a, r'$\nabla f$,  $f = x^2 + 2y^2$', size=11, pad=22)
    fig.tight_layout(w_pad=1.2)
    return fig


# ----------------------------------------------------------------------------------------------- 20.2
def fig_20_2(L):
    """The force field <-y, x> and three paths from (0, 0) to (1, 1): the line y = x, the parabola y = x^2 and a corner path; the work along them is 0, 1/3 and 1."""
    fig, ax = figure(7.6, 3.9)
    math_axes(ax, (-0.22, 2.7), (-0.2, 1.42), xticks=[0.5, 1], yticks=[0.5, 1], aspect='equal')
    g = np.linspace(0.125, 1.125, 5)              # a grid that avoids the axes
    X, Y = np.meshgrid(g, g)
    quiver(ax, X, Y, -Y, X, scale=7.0, color=C['muted'], width=0.004, zorder=2)
    s = np.linspace(0, 1, 200)
    ax.plot(s, s, color=C['green'], lw=2.6, zorder=5)
    ax.plot(s, s**2, color=C['blue'], lw=2.6, zorder=5)
    ax.plot([0, 1, 1], [0, 0, 1], color=C['orange'], lw=2.6, zorder=5, solid_joinstyle='miter')
    # direction of travel along each path
    for (x0, y0, x1, y1, col) in ((0.47, 0.47, 0.53, 0.53, C['green']), (0.67, 0.67**2, 0.73, 0.73**2, C['blue']),
                                  (0.47, 0, 0.53, 0, C['orange']), (1, 0.47, 1, 0.53, C['orange'])):
        arrow(ax, x0, y0, x1, y1, color=col, lw=2.0, head=15)
    dot(ax, 0, 0, color=C['navy'], size=6)
    dot(ax, 1, 1, color=C['navy'], size=6)
    label(ax, 1.04, 1.1, r'$(1, 1)$', size=11)
    label(ax, 1.4, 1.12, r'line $y = x$:  $W = 0$', color=C['green'], size=12)
    label(ax, 1.4, 0.78, r'parabola $y = x^2$:  $W = \frac{1}{3}$', color=C['blue'], size=12)
    label(ax, 1.4, 0.44, r'corner path:  $W = 0 + 1$', color=C['orange'], size=12)
    label(ax, 1.4, 0.13, r'field $\langle -y, x\rangle$ (grey)', color=C['slate'], size=11)
    return fig


# ----------------------------------------------------------------------------------------------- 20.3
def fig_20_3(L):
    """Green's theorem. Left: a region D, its boundary C traced anticlockwise, and the unit tangent and outward normal at a point. Right: small squares, each traced anticlockwise; inner edges cancel and the outer boundary remains."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.5)

    # Left: the region and its oriented boundary.
    bx = lambda s: 1.45 * np.cos(s) + 0.22 * np.cos(2 * s) - 0.1
    by = lambda s: 1.0 * np.sin(s) + 0.16 * np.sin(2 * s)
    s = np.linspace(0, 2 * PI, 400)
    a1.fill(bx(s), by(s), color=C['skyl'], zorder=1, lw=0)
    a1.plot(bx(s), by(s), color=C['blue'], lw=2.4, zorder=3)
    for s0 in (0.35, 2.1, 3.9):                       # arrowheads: anticlockwise
        arrow(a1, bx(s0), by(s0), bx(s0 + 0.12), by(s0 + 0.12), color=C['blue'], lw=2.4, head=16)
    s0 = 5.75
    p = np.array([bx(s0), by(s0)])
    d = np.array([-1.45 * np.sin(s0) - 0.44 * np.sin(2 * s0), 1.0 * np.cos(s0) + 0.32 * np.cos(2 * s0)])
    T = d / np.hypot(*d)
    n = np.array([T[1], -T[0]])
    arrow(a1, p[0], p[1], p[0] + 0.62 * T[0], p[1] + 0.62 * T[1], color=C['orange'], lw=2.0, head=13)
    arrow(a1, p[0], p[1], p[0] + 0.62 * n[0], p[1] + 0.62 * n[1], color=C['green'], lw=2.0, head=13)
    dot(a1, p[0], p[1], color=C['navy'], size=5)
    label(a1, p[0] + 0.66 * T[0] + 0.05, p[1] + 0.66 * T[1] + 0.06, r'$\mathbf{T}$', color=C['orange'], size=13)
    label(a1, p[0] + 0.66 * n[0] + 0.06, p[1] + 0.66 * n[1] - 0.02, r'$\mathbf{n}$', color=C['green'], size=13)
    label(a1, -0.35, 0.05, r'$D$', size=15)
    label(a1, -1.62, 1.0, r'$C$', color=C['blue'], size=15)
    a1.set_xlim(-1.95, 2.3)
    a1.set_ylim(-1.45, 1.35)
    a1.set_aspect('equal')
    a1.set_axis_off()

    # Right: small squares, each traced anticlockwise; the arrows on shared edges cancel.
    cells = {(0, 0), (1, 0), (2, 0), (0, 1), (1, 1), (1, 2)}
    m, e = 0.15, 0.27                                 # inset of the arrows from the edges, and their margin
    for (i, j) in sorted(cells):
        a2.add_patch(Rectangle((i, j), 1, 1, facecolor=C['skyl'], edgecolor=C['border'], lw=1.0, zorder=1))
    for (i, j) in sorted(cells):
        # (start, end, neighbour across this edge)
        edges = [((i + e, j + m), (i + 1 - e, j + m), (i, j - 1)),
                 ((i + 1 - m, j + e), (i + 1 - m, j + 1 - e), (i + 1, j)),
                 ((i + 1 - e, j + 1 - m), (i + e, j + 1 - m), (i, j + 1)),
                 ((i + m, j + 1 - e), (i + m, j + e), (i - 1, j))]
        for (p0, p1, nb) in edges:
            inner = nb in cells
            arrow(a2, p0[0], p0[1], p1[0], p1[1], color=C['muted'] if inner else C['blue'], lw=1.8 if inner else 2.2,
                  head=11 if inner else 13)
    outline = [(0, 0), (3, 0), (3, 1), (2, 1), (2, 3), (1, 3), (1, 2), (0, 2), (0, 0)]
    a2.plot([q[0] for q in outline], [q[1] for q in outline], color=C['blue'], lw=2.4, zorder=3)
    label(a2, 2.2, 2.55, 'inner edge:\narrows cancel', color=C['slate'], size=11, va='center')
    a2.annotate('', xy=(1.76, 2.0), xytext=(2.25, 2.3),
                arrowprops=dict(arrowstyle='-|>', color=C['slate'], lw=1.1, mutation_scale=10))
    a2.set_xlim(-0.2, 3.9)
    a2.set_ylim(-0.25, 3.15)
    a2.set_aspect('equal')
    a2.set_axis_off()
    fig.tight_layout(w_pad=1.0, rect=(0, 0, 1, 0.92))
    fig.text(0.27, 0.95, '$D$ on the left of $C$', fontsize=12, color=C['navy'], ha='center')
    fig.text(0.74, 0.95, 'small squares, each anticlockwise', fontsize=12, color=C['navy'], ha='center')
    return fig


# ----------------------------------------------------------------------------------------------- 20.4
def sphere(ph, th, a=1.0):
    """The point of the sphere of radius a at the spherical angles (phi, theta); arrays broadcast."""
    ph, th = np.broadcast_arrays(np.asarray(ph, dtype=float), np.asarray(th, dtype=float))
    return np.array([a * np.sin(ph) * np.cos(th), a * np.sin(ph) * np.sin(th), a * np.cos(ph)])


def fig_20_4(L):
    """A parametric surface: a small rectangle in the phi-theta plane is carried by r onto a small patch of the unit sphere, close to the parallelogram spanned by r_phi and r_theta; N = r_phi x r_theta is normal to the sphere."""
    fig = plt.figure(figsize=(7.6, 3.4))
    p0, t0, dp, dt = 0.75, 0.55, 0.35, 0.5           # the corner of the small rectangle and its sides

    # Left: the parameter domain D = [0, pi] x [0, 2 pi].
    a1 = fig.add_axes([0.07, 0.14, 0.2, 0.78])
    a1.set_xlim(0, PI)
    a1.set_ylim(0, 2 * PI)
    for k in range(1, 6):
        a1.axvline(k * PI / 6, color=C['grid'], lw=0.8, zorder=0)
    for k in range(1, 12):
        a1.axhline(k * PI / 6, color=C['grid'], lw=0.8, zorder=0)
    a1.add_patch(Rectangle((p0, t0), dp, dt, facecolor=C['orangel'], edgecolor=C['orange'], lw=1.6, zorder=2))
    a1.set_xticks([0, PI])
    a1.set_xticklabels([r'$0$', r'$\pi$'])
    a1.set_yticks([0, PI, 2 * PI])
    a1.set_yticklabels([r'$0$', r'$\pi$', r'$2\pi$'])
    a1.tick_params(labelsize=11, colors=C['slate'])
    for side in ('top', 'right', 'left', 'bottom'):
        a1.spines[side].set_color(C['navy'])
    a1.set_xlabel(r'$\varphi$', fontsize=13, labelpad=-4)
    a1.set_ylabel(r'$\theta$', fontsize=13, rotation=0)
    a1.yaxis.set_label_coords(-0.16, 0.76)
    label(a1, p0 + dp / 2, t0 - 0.3, r'$\Delta\varphi$', ha='center', size=11, color=C['orange'])
    label(a1, p0 + dp + 0.08, t0 + dt / 2, r'$\Delta\theta$', size=11, color=C['orange'])
    label(a1, 1.6, 4.7, r'$D$', size=15, ha='center')

    # The map r, as an arrow between the panels.
    fig.patches.append(FancyArrowPatch((0.31, 0.55), (0.42, 0.55), transform=fig.transFigure, arrowstyle='-|>',
                                       mutation_scale=16, color=C['navy'], lw=1.6))
    fig.text(0.365, 0.6, r'$\mathbf{r}$', fontsize=15, color=C['navy'], ha='center')

    # Right: the sphere, its grid curves, the patch and the vectors at its corner.
    ax = fig.add_axes([0.42, 0.0, 0.56, 1.0], projection='3d')
    plain3d(ax)
    elev, azim = 18, 75
    phs = np.linspace(0, PI, 31)
    ths = np.linspace(0, 2 * PI, 41)
    PH, TH = np.meshgrid(phs, ths)
    S = sphere(PH, TH)
    ax.plot_surface(S[0], S[1], S[2], color='#EFF6FF', edgecolor='none', alpha=0.85, shade=False, zorder=1)
    view = np.array([np.cos(np.radians(elev)) * np.cos(np.radians(azim)),
                     np.cos(np.radians(elev)) * np.sin(np.radians(azim)), np.sin(np.radians(elev))])

    def visible_curve(pts, color, lw):
        """Draw the part of a curve on the sphere that faces the viewer."""
        front = pts.T @ view > 0
        seg = []
        for k in range(pts.shape[1]):
            if front[k]:
                seg.append(pts[:, k])
            elif seg:
                q = np.array(seg).T
                ax.plot(q[0], q[1], q[2], color=color, lw=lw, zorder=2)
                seg = []
        if seg:
            q = np.array(seg).T
            ax.plot(q[0], q[1], q[2], color=color, lw=lw, zorder=2)

    s = np.linspace(0, 2 * PI, 200)
    for k in range(1, 6):                              # parallels (phi constant)
        visible_curve(sphere(k * PI / 6, s), C['muted'], 0.8)
    for k in range(12):                                # meridians (theta constant)
        visible_curve(sphere(np.linspace(0, PI, 120), k * PI / 6), C['muted'], 0.8)
    # The patch: the image of the small rectangle.
    pp, tt = np.meshgrid(np.linspace(p0, p0 + dp, 8), np.linspace(t0, t0 + dt, 8))
    Q = sphere(pp, tt)
    ax.plot_surface(Q[0], Q[1], Q[2], color=C['orangel'], edgecolor='none', shade=False, alpha=1.0, zorder=3)
    for (a_, b_) in (((p0, p0 + dp), (t0, t0)), ((p0, p0 + dp), (t0 + dt, t0 + dt)), ((p0, p0), (t0, t0 + dt)),
                     ((p0 + dp, p0 + dp), (t0, t0 + dt))):
        u_ = np.linspace(0, 1, 30)
        c_ = sphere(a_[0] + (a_[1] - a_[0]) * u_, b_[0] + (b_[1] - b_[0]) * u_)
        ax.plot(c_[0], c_[1], c_[2], color=C['orange'], lw=1.6, zorder=4)
    P0 = sphere(p0, t0)
    r_ph = np.array([np.cos(p0) * np.cos(t0), np.cos(p0) * np.sin(t0), -np.sin(p0)])
    r_th = np.array([-np.sin(p0) * np.sin(t0), np.sin(p0) * np.cos(t0), 0.0])
    N = np.cross(r_ph, r_th)
    arrow3d(ax, P0, 0.62 * r_ph, C['blue'])
    arrow3d(ax, P0, 0.75 * r_th, C['green'])
    arrow3d(ax, P0, 0.75 * N / np.linalg.norm(N), C['red'])
    ax.plot([P0[0]], [P0[1]], [P0[2]], 'o', color=C['navy'], markersize=4.5, zorder=25)
    text3d(ax, *(P0 + 0.62 * r_ph), r'$\mathbf{r}_\varphi$', color=C['blue'], dx=-4, dy=-9, ha='right', size=13)
    text3d(ax, *(P0 + 0.75 * r_th), r'$\mathbf{r}_\theta$', color=C['green'], dx=3, dy=-8, size=13)
    text3d(ax, *(P0 + 0.75 * N / np.linalg.norm(N)), r'$\mathbf{N} = \mathbf{r}_\varphi\times\mathbf{r}_\theta$', color=C['red'],
           dx=5, dy=6, size=12)
    ax.set_xlim(-1, 1)
    ax.set_ylim(-1, 1)
    ax.set_zlim(-1, 1)
    ax.set_box_aspect((1, 1, 1), zoom=1.3)
    ax.view_init(elev=elev, azim=azim)
    return fig


# ----------------------------------------------------------------------------------------------- 20.5
def fig_20_5(L):
    """Left: Stokes' theorem on the dome z = 1 - x^2 - y^2 with upward normals and its boundary circle traced anticlockwise. Right: the divergence theorem on a solid cylinder, with outward normals on its top, bottom and side."""
    fig = plt.figure(figsize=(7.6, 3.5))
    elev, azim = 24, -60
    front = np.array([np.cos(np.radians(azim)), np.sin(np.radians(azim))])   # the side of the xy-plane facing the viewer
    s = np.linspace(0, 2 * PI, 241)

    def circle(ax, z0, color, lw, z_front, z_back):
        """A horizontal unit circle at height z0, its far half drawn behind the surfaces and its near half in front."""
        near = np.cos(s) * front[0] + np.sin(s) * front[1] >= 0
        for part, zo in ((near, z_front), (~near, z_back)):
            idx = np.nonzero(part)[0]
            for chunk in np.split(idx, np.nonzero(np.diff(idx) > 1)[0] + 1):
                if len(chunk) > 1:
                    ax.plot(np.cos(s[chunk]), np.sin(s[chunk]), z0 + 0 * s[chunk], color=color, lw=lw, zorder=zo)

    # Left: the dome, its normals, and its boundary circle.
    ax = fig.add_axes([0.0, 0.0, 0.5, 0.9], projection='3d')
    plain3d(ax)
    rr, tt = np.meshgrid(np.linspace(0, 1, 9), np.linspace(0, 2 * PI, 37))
    X, Y = rr * np.cos(tt), rr * np.sin(tt)
    ax.plot_surface(X, Y, 1 - rr**2, color=C['skyl'], edgecolor=C['sky'], linewidth=0.3, alpha=0.8, shade=False, zorder=2)
    circle(ax, 0.0, C['orange'], 2.6, 5, 1)
    for s0 in (-1.05, 0.3, 2.6):                       # anticlockwise, seen from above
        p = np.array([np.cos(s0), np.sin(s0), 0.0])
        v = np.array([-np.sin(s0), np.cos(s0), 0.0])
        near = p[:2] @ front >= 0
        arrow3d(ax, p - 0.12 * v, 0.24 * v, C['orange'], lw=2.6, head=17, zorder=6 if near else 1.5)
    for (r0, t0) in ((0.0, 0.0), (0.62, azim * PI / 180 + PI / 2), (0.62, azim * PI / 180 - PI / 2)):
        x0, y0 = r0 * np.cos(t0), r0 * np.sin(t0)
        p = np.array([x0, y0, 1 - r0**2])
        n = np.array([2 * x0, 2 * y0, 1.0])
        arrow3d(ax, p, 0.45 * n / np.linalg.norm(n), C['red'], lw=2.0)
    text3d(ax, 0, 0, 1.45, r'$\mathbf{n}$', color=C['red'], dx=6, dy=0, size=13)
    text3d(ax, np.cos(-1.6), np.sin(-1.6), 0, r'$C$', color=C['orange'], dx=-12, dy=-10, size=14)
    text3d(ax, 0.25, -0.55, 0.55, r'$S$', color=C['blue'], size=14)
    ax.set_xlim(-1.05, 1.05)
    ax.set_ylim(-1.05, 1.05)
    ax.set_zlim(0, 1.5)
    ax.set_box_aspect((1, 1, 0.72), zoom=1.25)
    ax.view_init(elev=elev, azim=azim)
    fig.text(0.25, 0.92, "Stokes' theorem", fontsize=12, color=C['navy'], ha='center')

    # Right: the cylinder and its outward normals.
    ax = fig.add_axes([0.5, 0.0, 0.5, 0.9], projection='3d')
    plain3d(ax)
    tt, zz = np.meshgrid(np.linspace(0, 2 * PI, 25), np.linspace(0, 2, 5))
    ax.plot_surface(np.cos(tt), np.sin(tt), zz, color=C['skyl'], edgecolor=C['sky'], linewidth=0.3, alpha=0.55, shade=False,
                    zorder=2)
    rr, tt = np.meshgrid(np.linspace(0, 1, 4), np.linspace(0, 2 * PI, 49))
    ax.plot_surface(rr * np.cos(tt), rr * np.sin(tt), 0 * rr, color=C['skyl'], edgecolor='none', alpha=0.5, shade=False, zorder=1)
    ax.plot_surface(rr * np.cos(tt), rr * np.sin(tt), 2 + 0 * rr, color=C['skyl'], edgecolor='none', alpha=0.7, shade=False,
                    zorder=3)
    circle(ax, 0.0, C['sky'], 1.4, 4, 1.2)
    ax.plot(np.cos(s), np.sin(s), 2 + 0 * s, color=C['sky'], lw=1.4, zorder=4)
    arrow3d(ax, np.array([0, 0, 2.0]), np.array([0, 0, 0.75]), C['red'], zorder=8)
    arrow3d(ax, np.array([0, 0, 0.0]), np.array([0, 0, -0.75]), C['red'], zorder=1.6)
    side = [azim * PI / 180 - 0.9, azim * PI / 180 + 0.9, azim * PI / 180 + 1.75]
    for t0 in side:
        p = np.array([np.cos(t0), np.sin(t0), 1.0])
        arrow3d(ax, p, 0.62 * np.array([np.cos(t0), np.sin(t0), 0]), C['red'], zorder=8)
    t1 = side[2]
    text3d(ax, 0, 0, 2.75, r'$\mathbf{n} = \mathbf{k}$', color=C['red'], dx=6, size=12)
    text3d(ax, 0, 0, -0.75, r'$\mathbf{n} = -\mathbf{k}$', color=C['red'], dx=6, dy=-4, size=12)
    text3d(ax, 1.62 * np.cos(t1), 1.62 * np.sin(t1), 1.0, r'$\mathbf{n}$', color=C['red'], dx=2, dy=8, size=13)
    text3d(ax, -0.2, 0.6, 1.25, r'$E$', color=C['blue'], size=14)
    ax.set_xlim(-1.1, 1.1)
    ax.set_ylim(-1.1, 1.1)
    ax.set_zlim(-0.8, 2.8)
    ax.set_box_aspect((1, 1, 1.45), zoom=1.15)
    ax.view_init(elev=elev, azim=azim)
    fig.text(0.75, 0.92, 'the divergence theorem', fontsize=12, color=C['navy'], ha='center')
    return fig


FIGURES = {'fig-20-1': fig_20_1, 'fig-20-2': fig_20_2, 'fig-20-3': fig_20_3, 'fig-20-4': fig_20_4, 'fig-20-5': fig_20_5}
