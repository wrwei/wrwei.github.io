"""Figures of Module 17: Partial derivatives and the gradient."""
import numpy as np
from matplotlib.colors import LinearSegmentedColormap
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, figure3d, math_axes, plot_fn, plot_param, dot, label,
                        #  shade, riemann, tangent, guide, arrow, panel_title, C, CURVES)
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe

# A light sequential ramp (low = lightest) for filled contour maps, and a darker one for surfaces.
FILL = LinearSegmentedColormap.from_list('m17fill', ['#F8FBFF', C['skyl'], '#93C5FD'])
SURF = LinearSegmentedColormap.from_list('m17surf', [C['skyl'], '#93C5FD', '#3B82F6', C['blue']])
LIGHT = LinearSegmentedColormap.from_list('m17light', ['#F1F7FF', '#C7DEFC', '#94BEF6'])


def landscape(x, y):
    """The two-peak landscape of Figure 17.1 (and of the widget): (x^2 + 3y^2) e^(1 - x^2 - y^2)."""
    return (x**2 + 3 * y**2) * np.exp(1 - x**2 - y**2)


def landscape_grad(x, y):
    e = np.exp(1 - x**2 - y**2)
    return 2 * x * e * (1 - x**2 - 3 * y**2), 2 * y * e * (3 - x**2 - 3 * y**2)


def flat_axes(ax, lim, ticks, xlabel=r'$x$', ylabel=r'$y$'):
    """A plain square map: equal scales, the frame as axes, light ticks."""
    ax.set_xlim(*lim[0])
    ax.set_ylim(*lim[1])
    ax.set_aspect('equal')
    ax.set_xticks(ticks[0])
    ax.set_yticks(ticks[1])
    fmt = lambda v: (str(int(v)) if abs(v - round(v)) < 1e-9 else f'{v:g}').replace('-', '−')
    ax.set_xticklabels([fmt(v) for v in ticks[0]])
    ax.set_yticklabels([fmt(v) for v in ticks[1]])
    for side in ax.spines.values():
        side.set_color(C['muted'])
        side.set_linewidth(0.9)
    ax.tick_params(length=3, width=0.8, colors=C['slate'], labelsize=10)
    ax.set_xlabel(xlabel, fontsize=12, labelpad=2)
    ax.set_ylabel(ylabel, fontsize=12, labelpad=2, rotation=0)


def clean3d(ax, xlabel=r'$x$', ylabel=r'$y$', zlabel=r'$z$', zpad=-8):
    ax.set_xlabel(xlabel, fontsize=12, labelpad=-7)
    ax.set_ylabel(ylabel, fontsize=12, labelpad=-7)
    ax.set_zlabel(zlabel, fontsize=12, labelpad=zpad)
    ax.tick_params(axis='both', which='major', labelsize=9, pad=-2, colors=C['slate'])
    for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
        axis.pane.set_facecolor('#F8FAFC')
        axis.pane.set_edgecolor(C['border'])
        axis._axinfo['grid']['color'] = C['grid']


def eye_direction(ax):
    """The direction towards the viewer, in data units, for an axes with an orthographic projection."""
    e, a = np.deg2rad(ax.elev), np.deg2rad(ax.azim)
    box = np.array(ax._box_aspect, dtype=float)
    span = np.array([np.diff(ax.get_xlim())[0], np.diff(ax.get_ylim())[0], np.diff(ax.get_zlim())[0]])
    return np.array([np.cos(e) * np.cos(a), np.cos(e) * np.sin(a), np.sin(e)]) * span / box


def visible_runs(pts, f, ax, eps=0.004):
    """Split a curve (points on or above the surface z = f(x, y)) into the runs that the surface does not hide:
    a point is hidden when the ray from it towards the viewer passes below the surface."""
    d = eye_direction(ax)
    d = d / np.hypot(d[0], d[1])                      # one unit of horizontal distance per unit of s
    (x0, x1), (y0, y1) = ax.get_xlim(), ax.get_ylim()
    pts = np.asarray(pts, dtype=float)
    hidden = np.zeros(len(pts), dtype=bool)
    zscale = np.diff(ax.get_zlim())[0]
    for s in np.arange(0.015, (x1 - x0) + (y1 - y0), 0.015):
        q = pts + s * d
        inside = (q[:, 0] >= x0) & (q[:, 0] <= x1) & (q[:, 1] >= y0) & (q[:, 1] <= y1)
        with np.errstate(all='ignore'):
            hidden |= inside & (f(q[:, 0], q[:, 1]) > q[:, 2] + eps * zscale)
    runs, cur = [], []
    for p, hdn in zip(pts, hidden):
        if hdn:
            if len(cur) > 1:
                runs.append(np.array(cur))
            cur = []
        else:
            cur.append(p)
    if len(cur) > 1:
        runs.append(np.array(cur))
    return runs


def level_curves(f, lim, levels, n=160):
    """The level curves f = k as lists of (N, 2) arrays, one list per level."""
    xs = np.linspace(lim[0][0], lim[0][1], n)
    ys = np.linspace(lim[1][0], lim[1][1], n)
    X, Y = np.meshgrid(xs, ys)
    fig = plt.figure()
    cs = fig.add_subplot().contour(X, Y, f(X, Y), levels=levels)
    segs = [list(s) for s in cs.allsegs]
    plt.close(fig)
    return segs


def surface3d(ax, f, lim, n=36, cmap=None, vmin=None, vmax=None, alpha=1.0, zorder=1):
    xs = np.linspace(lim[0][0], lim[0][1], n)
    ys = np.linspace(lim[1][0], lim[1][1], n)
    X, Y = np.meshgrid(xs, ys)
    Z = f(X, Y)
    return ax.plot_surface(X, Y, Z, cmap=cmap or SURF, vmin=vmin, vmax=vmax, linewidth=0.3, edgecolor='white',
                           alpha=alpha, antialiased=True, rstride=1, cstride=1, shade=False, zorder=zorder)


def fig_17_1(L):
    """A landscape with two peaks, z = (x^2 + 3y^2)e^(1 - x^2 - y^2): its graph, a surface, and its contour map."""
    fig = plt.figure(figsize=(7.6, 3.9))
    ax = fig.add_axes([-0.08, -0.04, 0.64, 1.1], projection='3d')
    ax.set_proj_type('ortho')
    lim = ((-2.2, 2.2), (-2.2, 2.2))
    levels = [0.5, 1.0, 1.5, 2.0, 2.5]
    ax.computed_zorder = False
    surface3d(ax, landscape, lim, n=36, vmin=-0.6, vmax=3.3)
    ax.set_xlim(*lim[0])
    ax.set_ylim(*lim[1])
    ax.set_zlim(0, 3.2)
    ax.set_box_aspect((1, 1, 0.62))
    ax.view_init(elev=34, azim=-24)
    # The level curves on the surface, at their heights (the parts the surface hides are left out).
    for k, segs in zip(levels, level_curves(landscape, lim, levels)):
        for sg in segs:
            pts = np.column_stack([sg, np.full(len(sg), k)])
            for run in visible_runs(pts, landscape, ax):
                ax.plot(run[:, 0], run[:, 1], run[:, 2], color=C['navy'], lw=1.1, zorder=4)
    ax.set_xticks([-2, -1, 0, 1, 2])
    ax.set_yticks([-2, -1, 0, 1, 2])
    ax.set_zticks([0, 1, 2, 3])
    clean3d(ax, zpad=-9)
    ax.set_title('The graph: a surface', fontsize=12, color=C['navy'], y=0.95)

    a2 = fig.add_axes([0.635, 0.12, 0.36, 0.76])
    flat_axes(a2, lim, ([-2, -1, 0, 1, 2], [-2, -1, 0, 1, 2]))
    xs = np.linspace(-2.2, 2.2, 120)
    FX, FY = np.meshgrid(xs, xs)
    FZ = landscape(FX, FY)
    a2.contourf(FX, FY, FZ, levels=[0] + levels + [3.2], cmap=FILL)
    lines = a2.contour(FX, FY, FZ, levels=levels, colors=C['navy'], linewidths=1.0)
    lab = a2.clabel(lines, levels=[0.5, 1.5, 2.5], fmt=lambda v: f'{v:g}', fontsize=9.5, inline_spacing=2,
                    manual=[(-1.75, 0.2), (0.45, 1.55), (0.0, -0.72)])
    for tx in lab:
        tx.set_color(C['navy'])
    for py in (1, -1):
        a2.plot([0], [py], 'o', color=C['orange'], markersize=5, zorder=6)
    for px in (-1, 1):
        a2.plot([px], [0], 's', color=C['purple'], markersize=4.5, zorder=6)
    a2.plot([0], [0], 'o', color=C['blue'], markersize=4.5, zorder=6)
    for (tx, ty, txt, col, va) in ((0.17, 1.0, 'peak', C['orange'], 'center'), (1.1, 0.12, 'pass', C['purple'], 'bottom'),
                                   (0.1, 0.13, 'pit', C['blue'], 'bottom')):
        t = a2.text(tx, ty, txt, color=col, fontsize=10, va=va, zorder=7)
        t.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])
    a2.set_title('The contour map', fontsize=12, color=C['navy'])
    return fig


def label3d(ax, x, y, z, text, color=None, dx=0, dy=0, ha='left', va='center', size=10.5):
    """Text at the point (x, y, z), shifted on the page by (dx, dy) points, with a white halo."""
    from matplotlib.transforms import offset_copy
    tr = offset_copy(ax.transData, fig=ax.figure, x=dx, y=dy, units='points')
    t = ax.text(x, y, z, text, color=color or C['navy'], ha=ha, va=va, fontsize=size, zorder=10, transform=tr)
    t.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])
    return t


def dome(x, y):
    """The surface of Figure 17.2 and Example 17.7: z = 6 - x^2 - 2y^2."""
    return 6 - x**2 - 2 * y**2


def fig_17_2(L):
    """Partial derivatives as the slopes of two slices of the surface z = 6 - x^2 - 2y^2 at P(1, 1, 3), and the tangent plane there."""
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection
    fig = plt.figure(figsize=(7.6, 3.7))
    lim = ((-1.5, 2.0), (-1.4, 1.7))
    zlim = (-2.5, 6.2)
    axes = [fig.add_axes([-0.04, -0.02, 0.54, 1.02], projection='3d'), fig.add_axes([0.47, -0.02, 0.54, 1.02], projection='3d')]
    for k, ax in enumerate(axes):
        ax.set_proj_type('ortho')
        ax.computed_zorder = False
        surface3d(ax, dome, lim, n=28, cmap=LIGHT, vmin=-3, vmax=6.2, alpha=0.95)
        ax.set_xlim(*lim[0])
        ax.set_ylim(*lim[1])
        ax.set_zlim(*zlim)
        ax.set_box_aspect((1, 0.95, 0.85))
        ax.view_init(elev=24, azim=28)
        ax.set_xticks([-1, 0, 1, 2])
        ax.set_yticks([-1, 0, 1])
        ax.set_zticks([0, 2, 4, 6])
        clean3d(ax, zpad=-3)
    xs = np.linspace(lim[0][0], lim[0][1], 300)
    ys = np.linspace(lim[1][0], lim[1][1], 300)
    slice_x = np.column_stack([xs, np.ones_like(xs), dome(xs, 1.0)])       # the slice y = 1: z = 4 - x^2
    slice_y = np.column_stack([np.ones_like(ys), ys, dome(1.0, ys)])       # the slice x = 1: z = 5 - 2y^2
    tx = np.linspace(0.2, 1.8, 50)
    ty = np.linspace(0.55, 1.45, 50)
    tan_x = np.column_stack([tx, np.ones_like(tx), 3 - 2 * (tx - 1)])      # slope f_x(1, 1) = -2
    tan_y = np.column_stack([np.ones_like(ty), ty, 3 - 4 * (ty - 1)])      # slope f_y(1, 1) = -4

    ax = axes[0]
    for pts, col, lw in ((slice_x, C['blue'], 2.4), (slice_y, C['orange'], 2.4)):
        for run in visible_runs(pts, dome, ax):
            ax.plot(run[:, 0], run[:, 1], run[:, 2], color=col, lw=lw, zorder=5)
    for pts, col in ((tan_x, C['navy']), (tan_y, C['red'])):
        for run in visible_runs(pts, dome, ax):
            ax.plot(run[:, 0], run[:, 1], run[:, 2], color=col, lw=1.8, zorder=6)
    ax.plot([1], [1], [3], 'o', color=C['navy'], markersize=6, zorder=8, markeredgecolor='white', markeredgewidth=1)
    label3d(ax, 1, 1, 3, r'$P$', dx=-7, dy=8, ha='right', size=12)
    label3d(ax, -1.45, 1, dome(-1.45, 1), r'$y = 1$', color=C['blue'], dx=5, dy=2)
    label3d(ax, 1, -1.4, dome(1, -1.4), r'$x = 1$', color=C['orange'], dx=0, dy=13, ha='center')
    label3d(ax, 1.8, 1, 3 - 2 * 0.8, r'slope $-2$', color=C['navy'], dx=-6, dy=0, ha='right', size=10)
    label3d(ax, 1, 1.45, 3 - 4 * 0.45, r'slope $-4$', color=C['red'], dx=6, dy=0, size=10)
    ax.set_title('Two slices through $P$', fontsize=12, color=C['navy'], y=0.97)

    ax = axes[1]
    px = np.array([0.35, 1.65, 1.65, 0.35])
    py = np.array([0.55, 0.55, 1.45, 1.45])
    plane = [list(zip(px, py, 9 - 2 * px - 4 * py))]
    ax.add_collection3d(Poly3DCollection(plane, facecolor='#FDE3CC', alpha=0.8, edgecolor=C['orange'], linewidth=1.3, zorder=4))
    for pts, col in ((tan_x, C['navy']), (tan_y, C['red'])):
        for run in visible_runs(pts, dome, ax):
            ax.plot(run[:, 0], run[:, 1], run[:, 2], color=col, lw=1.8, zorder=6)
    ax.plot([1], [1], [3], 'o', color=C['navy'], markersize=6, zorder=8, markeredgecolor='white', markeredgewidth=1)
    label3d(ax, 1, 1, 3, r'$P$', dx=-7, dy=8, ha='right', size=12)
    label3d(ax, 0.35, 0.55, 9 - 2 * 0.35 - 4 * 0.55, r'$z = 9 - 2x - 4y$', color=C['orange'], dx=9, dy=4)
    ax.set_title('The tangent plane at $P$', fontsize=12, color=C['navy'], y=0.97)
    return fig


def node(ax, x, y, text, color=None, r=0.055, size=14, face='white'):
    """A variable of a tree diagram or computational graph: a circle with the name inside."""
    from matplotlib.patches import Circle
    col = color or C['navy']
    ax.add_patch(Circle((x, y), r, facecolor=face, edgecolor=col, linewidth=1.6, zorder=4))
    ax.text(x, y, text, ha='center', va='center', fontsize=size, color=col, zorder=5)


def edge(ax, p, q, color=None, r=0.055, lw=1.5):
    """A line between two nodes, shortened by the node radius at both ends."""
    p, q = np.array(p, float), np.array(q, float)
    d = (q - p) / np.hypot(*(q - p))
    a, b = p + d * r, q - d * r
    ax.plot([a[0], b[0]], [a[1], b[1]], color=color or C['slate'], lw=lw, zorder=2, solid_capstyle='round')


def tag(ax, x, y, text, color=None, size=15, ha='center'):
    """A label (a local derivative) with a white halo."""
    t = ax.text(x, y, text, ha=ha, va='center', fontsize=size, color=color or C['navy'], zorder=6)
    t.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])


def fig_17_3(L):
    """Tree diagrams for the chain rule: z depends on x and y, which depend on t (left) or on s and t (right)."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.5, gridspec_kw={'width_ratios': [1, 1.3]})
    for ax, w in ((a1, 1.0), (a2, 1.3)):
        ax.set_xlim(0, w)
        ax.set_ylim(-0.3, 1.0)
        ax.set_aspect('equal')
        ax.axis('off')
    hi, lo = C['orange'], C['blue']

    # One parameter: z -> x, y -> t.
    Z, X, Y, T1, T2 = (0.5, 0.9), (0.2, 0.55), (0.8, 0.55), (0.2, 0.18), (0.8, 0.18)
    for (p, q, col) in ((Z, X, hi), (Z, Y, lo), (X, T1, hi), (Y, T2, lo)):
        edge(a1, p, q, col)
    tag(a1, 0.25, 0.77, r'$\frac{\partial z}{\partial x}$', hi)
    tag(a1, 0.75, 0.77, r'$\frac{\partial z}{\partial y}$', lo)
    tag(a1, 0.3, 0.365, r'$\frac{dx}{dt}$', hi, ha='left')
    tag(a1, 0.7, 0.365, r'$\frac{dy}{dt}$', lo, ha='right')
    for (pnt, txt) in ((Z, '$z$'), (X, '$x$'), (Y, '$y$'), (T1, '$t$'), (T2, '$t$')):
        node(a1, *pnt, txt)
    a1.text(0.5, -0.05, r'$\frac{dz}{dt} = \frac{\partial z}{\partial x}\,\frac{dx}{dt} + \frac{\partial z}{\partial y}\,\frac{dy}{dt}$',
            ha='center', va='center', fontsize=16, color=C['navy'])
    a1.text(0.5, -0.24, 'one product for each path from $z$ to $t$', ha='center', va='center', fontsize=10.5, color=C['slate'])

    # Two parameters: z -> x, y -> s, t. The two paths from z to s are coloured.
    Z, X, Y = (0.65, 0.9), (0.33, 0.55), (0.97, 0.55)
    S1, T1, S2, T2 = (0.13, 0.18), (0.53, 0.18), (0.77, 0.18), (1.17, 0.18)
    for (p, q, col) in ((Z, X, hi), (Z, Y, lo), (X, S1, hi), (X, T1, None), (Y, S2, lo), (Y, T2, None)):
        edge(a2, p, q, col)
    tag(a2, 0.4, 0.77, r'$\frac{\partial z}{\partial x}$', hi)
    tag(a2, 0.9, 0.77, r'$\frac{\partial z}{\partial y}$', lo)
    tag(a2, 0.16, 0.38, r'$\frac{\partial x}{\partial s}$', hi, ha='right')
    tag(a2, 0.5, 0.38, r'$\frac{\partial x}{\partial t}$', C['slate'], ha='left')
    tag(a2, 0.8, 0.38, r'$\frac{\partial y}{\partial s}$', lo, ha='right')
    tag(a2, 1.14, 0.38, r'$\frac{\partial y}{\partial t}$', C['slate'], ha='left')
    for (pnt, txt) in ((Z, '$z$'), (X, '$x$'), (Y, '$y$'), (S1, '$s$'), (T1, '$t$'), (S2, '$s$'), (T2, '$t$')):
        node(a2, *pnt, txt)
    a2.text(0.65, -0.05, r'$\frac{\partial z}{\partial s} = \frac{\partial z}{\partial x}\,\frac{\partial x}{\partial s} + \frac{\partial z}{\partial y}\,\frac{\partial y}{\partial s}$',
            ha='center', va='center', fontsize=16, color=C['navy'])
    a2.text(0.65, -0.24, 'the two paths from $z$ to $s$ (coloured)', ha='center', va='center', fontsize=10.5, color=C['slate'])
    fig.tight_layout(w_pad=1.5)
    return fig


def bowl(x, y):
    """The quadratic bowl of Section 17.7: x^2 + 3y^2."""
    return x**2 + 3 * y**2


def descent(eta, n, start=(3.0, 1.0)):
    """n steps of gradient descent on the bowl: (x, y) -> (x - 2 eta x, y - 6 eta y)."""
    pts = [start]
    for _ in range(n):
        x, y = pts[-1]
        pts.append((x - eta * 2 * x, y - eta * 6 * y))
    return np.array(pts)


def fig_17_4(L):
    """Left: gradient arrows on the contour map of the landscape, perpendicular to the level curves. Right: gradient descent on the bowl x^2 + 3y^2 with two step sizes."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7, gridspec_kw={'width_ratios': [1, 1.25]})
    lim = ((-2.2, 2.2), (-2.2, 2.2))
    levels = [0.5, 1.0, 1.5, 2.0, 2.5]
    flat_axes(a1, lim, ([-2, -1, 0, 1, 2], [-2, -1, 0, 1, 2]))
    xs = np.linspace(-2.2, 2.2, 120)
    FX, FY = np.meshgrid(xs, xs)
    FZ = landscape(FX, FY)
    a1.contourf(FX, FY, FZ, levels=[0] + levels + [3.2], cmap=FILL)
    a1.contour(FX, FY, FZ, levels=levels, colors=C['slate'], linewidths=0.9)
    # Arrows at points of the level curves f = 0.5 (round the pit), 1.5 and 2.5, drawn at 0.13 of their true length.
    scale = 0.13
    for k, segs in zip([0.5, 1.5, 2.5], level_curves(landscape, lim, [0.5, 1.5, 2.5], n=200)):
        for sg in segs:
            if k == 0.5 and np.abs(sg[:, 0]).max() > 1.2:
                continue                       # the outer curve f = 0.5, where the slope is gentle, is left bare
            arc = np.concatenate([[0], np.cumsum(np.hypot(*np.diff(sg, axis=0).T))])
            step = {0.5: 0.62, 1.5: 0.82, 2.5: 0.82}[k]
            for d0 in np.arange(step / 2, arc[-1], step):
                j = np.searchsorted(arc, d0)
                px, py = sg[j]
                gx, gy = landscape_grad(px, py)
                a1.annotate('', xy=(px + scale * gx, py + scale * gy), xytext=(px, py), zorder=6,
                            arrowprops=dict(arrowstyle='-|>', color=C['red'], lw=1.5, mutation_scale=9, shrinkA=0, shrinkB=0))
                a1.plot([px], [py], 'o', color=C['red'], markersize=2.6, zorder=6)
    a1.set_title(r'$\nabla f$ is perpendicular to the contours', fontsize=11.5, color=C['navy'])

    # Gradient descent on the bowl from (3, 1).
    lim2 = ((-1.4, 3.4), (-1.25, 1.35))
    flat_axes(a2, lim2, ([-1, 0, 1, 2, 3], [-1, 0, 1]))
    xs = np.linspace(-1.4, 3.4, 160)
    ys = np.linspace(-1.25, 1.35, 100)
    BX, BY = np.meshgrid(xs, ys)
    BZ = bowl(BX, BY)
    blv = [0.5, 1, 2, 4, 6, 8, 10, 12]
    a2.contourf(BX, BY, BZ, levels=[0] + blv + [40], colors=[FILL(0.8 * i / len(blv)) for i in range(len(blv) + 1)])
    cl = a2.contour(BX, BY, BZ, levels=blv, colors=C['slate'], linewidths=0.9)
    lab = a2.clabel(cl, levels=[1, 4], fmt=lambda v: f'{v:g}', fontsize=9, inline_spacing=2,
                    manual=[(0.0, -0.58), (0.0, -1.155)])
    for tx in lab:
        tx.set_color(C['slate'])
    for eta, col, n in ((0.1, C['blue'], 12), (0.3, C['orange'], 12)):
        pts = descent(eta, n)
        a2.plot(pts[:, 0], pts[:, 1], '-', color=col, lw=1.6, zorder=4)
        a2.plot(pts[:, 0], pts[:, 1], 'o', color=col, markersize=4.2, zorder=5, markeredgecolor='white', markeredgewidth=0.6)
    a2.plot([3], [1], 'o', color=C['navy'], markersize=6, zorder=6)
    a2.plot([0], [0], '+', color=C['navy'], markersize=9, mew=1.6, zorder=6)
    for (tx, ty, txt, col, ha) in ((2.92, 1.2, r'start $(3, 1)$', C['navy'], 'right'), (1.4, 0.3, r'$\eta = 0.1$', C['blue'], 'left'),
                                   (1.32, -0.97, r'$\eta = 0.3$', C['orange'], 'left')):
        t = a2.text(tx, ty, txt, color=col, fontsize=11, ha=ha, va='center', zorder=7)
        t.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])
    a2.set_title(r'Gradient descent on $x^2 + 3y^2$', fontsize=11.5, color=C['navy'])
    fig.tight_layout(w_pad=1.2)
    return fig


def fig_17_5(L):
    """The computational graph of the loss L(w, b) = (1 - w - b)^2 + (3 - 2w - b)^2 at w = b = 0, with the values of the forward pass and the adjoints of the backward pass."""
    from matplotlib.patches import FancyBboxPatch
    fig, ax = figure(7.6, 3.7)
    ax.set_xlim(0, 10)
    ax.set_ylim(-0.75, 4.75)
    ax.axis('off')
    boxes = {
        'w': ((1.0, 3.85), r'$w$', 0.9),
        'b': ((1.0, 1.15), r'$b$', 0.9),
        'e1': ((4.9, 3.85), r'$e_1 = 1 - w - b$', 2.9),
        'e2': ((4.9, 1.15), r'$e_2 = 3 - 2w - b$', 2.9),
        'L': ((8.6, 2.5), r'$L = e_1^2 + e_2^2$', 2.3),
    }
    hgt = 0.62
    for key, ((x, y), txt, wd) in boxes.items():
        ax.add_patch(FancyBboxPatch((x - wd / 2, y - hgt / 2), wd, hgt, boxstyle='round,pad=0.02,rounding_size=0.15',
                                    facecolor='white', edgecolor=C['navy'], linewidth=1.5, zorder=3))
        ax.text(x, y, txt, ha='center', va='center', fontsize=12.5, color=C['navy'], zorder=4)

    def side(key, sgn):
        (x, y), _, wd = boxes[key]
        return np.array([x + sgn * wd / 2, y])

    def link(a, b, text, t=0.5, dy=0.0, ha='center'):
        p, q = side(a, 1), side(b, -1)
        ax.annotate('', xy=q, xytext=p, zorder=2,
                    arrowprops=dict(arrowstyle='-|>', color=C['slate'], lw=1.4, mutation_scale=12, shrinkA=1, shrinkB=1))
        m = p + (q - p) * t
        tt = ax.text(m[0], m[1] + dy, text, ha=ha, va='center', fontsize=11, color=C['slate'], zorder=5)
        tt.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])

    link('w', 'e1', r'$-1$', dy=0.22)
    link('b', 'e2', r'$-1$', dy=-0.22)
    link('w', 'e2', r'$-2$', t=0.24, dy=-0.08, ha='right')
    link('b', 'e1', r'$-1$', t=0.24, dy=0.08, ha='right')
    link('e1', 'L', r'$2e_1$', t=0.45, dy=0.28)
    link('e2', 'L', r'$2e_2$', t=0.45, dy=-0.28)

    fwd, bwd = C['blue'], C['orange']
    vals = {'w': ('0', r'$\bar w = -14$'), 'b': ('0', r'$\bar b = -8$'), 'e1': ('1', r'$\bar e_1 = 2$'),
            'e2': ('3', r'$\bar e_2 = 6$'), 'L': ('10', r'$\bar L = 1$')}
    for key, (fv, bv) in vals.items():
        (x, y), _, wd = boxes[key]
        up = 1
        tt = ax.text(x, y + up * 0.58, fv.replace('-', '−'), ha='center', va='center', fontsize=12, color=fwd,
                     fontweight='bold', zorder=5)
        tt.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])
        tt = ax.text(x, y - up * 0.6, bv, ha='center', va='center', fontsize=12, color=bwd, zorder=5)
        tt.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])
    ax.text(0.0, -0.2, 'Blue, above each node: its value, from the forward pass.', ha='left', va='center', fontsize=10.5, color=fwd)
    ax.text(0.0, -0.62, r'Orange, below each node: its adjoint $\bar v = \partial L/\partial v$, from the backward pass.', ha='left',
            va='center', fontsize=10.5, color=bwd)
    return fig


FIGURES = {'fig-17-1': fig_17_1, 'fig-17-2': fig_17_2, 'fig-17-3': fig_17_3, 'fig-17-4': fig_17_4, 'fig-17-5': fig_17_5}
