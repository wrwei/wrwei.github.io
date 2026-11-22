"""Figures of Module 12: Applications of integration and improper integrals."""
import numpy as np
from matplotlib.patches import Ellipse, Polygon, Rectangle
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
from figstyle import *  # noqa: F401,F403   (figure, figure_grid, figure3d, math_axes, plot_fn, plot_param, dot, label,
                        #  shade, riemann, tangent, guide, arrow, panel_title, C, CURVES)

PI = np.pi


def title(ax, text, size=12, pad=22):
    """A panel title, raised above the y-axis label at the top of the axis."""
    ax.set_title(text, fontsize=size, color=C['navy'], pad=pad)


def diagram(ax, xlim, ylim):
    """An axes for a diagram: equal scales, no axes or ticks."""
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    ax.set_aspect('equal')
    ax.axis('off')


def dimension(ax, x0, y0, x1, y1, text, offset=(0, 0), color=None, size=11, ha='center', va='center'):
    """A dimension line with arrowheads at both ends and its label at the middle (shifted by offset)."""
    col = color or C['slate']
    ax.annotate('', xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle='<|-|>', color=col, lw=1.1, mutation_scale=9, shrinkA=0, shrinkB=0), zorder=6)
    label(ax, (x0 + x1) / 2 + offset[0], (y0 + y1) / 2 + offset[1], text, color=col, size=size, ha=ha, va=va)


def strip(ax, x0, x1, y0, y1, color=None, horizontal=False):
    """A thin rectangle: a slice of a region (x0..x1 by y0..y1)."""
    col = color or C['orange']
    ax.add_patch(Rectangle((x0, y0), x1 - x0, y1 - y0, facecolor=col, alpha=0.55, edgecolor=col, lw=1.2, zorder=4))


def fig_12_1(L):
    """The region between x = y^2 and y = x - 2, sliced by vertical strips (two formulas) and by horizontal strips (one)."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.7)
    top = lambda x: np.sqrt(np.maximum(x, 0))
    bottom = lambda x: -np.sqrt(np.maximum(x, 0)) if x <= 1 else x - 2

    for ax in (a1, a2):
        math_axes(ax, (-0.7, 5.0), (-2.1, 2.8), xticks=[1, 2, 3, 4], yticks=[-1, 1, 2])
        shade(ax, top, 0, 4, g=bottom, color=C['blue'], alpha=0.16, n=900)
        plot_param(ax, lambda s: s**2, lambda s: s, -1.25, 2.22)
        plot_fn(ax, lambda x: x - 2, 0.2, 4.75, color=C['green'])
        dot(ax, 1, -1, color=C['navy'], size=5)
        dot(ax, 4, 2, color=C['navy'], size=5)

    # Vertical strips: below x = 1 the strip runs from -sqrt(x) to sqrt(x); beyond, from x - 2 to sqrt(x).
    dx = 0.2
    strip(a1, 0.45, 0.45 + dx, -np.sqrt(0.55), np.sqrt(0.55))
    strip(a1, 2.5, 2.5 + dx, 2.6 - 2, np.sqrt(2.6))
    a1.plot([1, 1], [-1, -0.3], color=C['slate'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    a1.plot([1, 1], [0.02, 1], color=C['slate'], lw=1.1, ls=(0, (4, 3)), zorder=3)
    label(a1, 2.05, 2.25, r'$y = \sqrt{x}$', color=C['blue'], size=11, ha='right')
    label(a1, 1.62, -1.5, r'$y = -\sqrt{x}$', color=C['blue'], size=11)
    label(a1, 3.15, 0.55, r'$y = x - 2$', color=C['green'], size=11)
    title(a1, 'Vertical strips: two formulas', size=11.5)

    # Horizontal strips: every strip runs from x = y^2 to x = y + 2.
    yy, dy = 0.8, 0.2
    strip(a2, yy**2, yy + 2, yy, yy + dy)
    label(a2, 0.55, 2.25, r'$x = y^2$', color=C['blue'], size=11)
    label(a2, 3.15, 0.55, r'$x = y + 2$', color=C['green'], size=11)
    label(a2, 4.12, 1.72, r'$(4, 2)$', size=10.5)
    label(a2, 1.12, -1.32, r'$(1, -1)$', size=10.5, va='top')
    title(a2, 'Horizontal strips: one formula', size=11.5)
    fig.tight_layout(w_pad=2.0)
    return fig


def fig_12_2(L):
    """A solid of revolution: the region between y = sqrt(x) and y = x^2 turns about the x-axis; a slice is a washer."""
    fig, ax = figure3d(7.6, 3.9)
    ax.set_position([-0.02, -0.04, 0.62, 1.08])
    ax.computed_zorder = False          # draw in the order given: the inner surface, the outer veil, then the rest
    ax.set_proj_type('ortho')
    x0 = 0.55
    R0, r0 = np.sqrt(x0), x0**2
    kw = dict(linewidth=0, antialiased=True, shade=False)
    xs = np.linspace(0, 1, 30)
    ts = np.linspace(0, 2 * PI, 40)
    X, T = np.meshgrid(xs, ts)
    ax.plot_surface(X, X**2 * np.cos(T), X**2 * np.sin(T), color=C['purplel'], alpha=0.55, zorder=1, **kw)
    ax.plot_surface(X, np.sqrt(X) * np.cos(T), np.sqrt(X) * np.sin(T), color=C['sky'], alpha=0.16, zorder=2, **kw)
    # Mesh lines of the outer surface (circles and four meridians), and circles of the inner one.
    th = np.linspace(0, 2 * PI, 100)
    for xr in (0.25, 0.75, 1.0):
        ax.plot(np.full_like(th, xr), np.sqrt(xr) * np.cos(th), np.sqrt(xr) * np.sin(th), color=C['sky'],
                lw=0.9 if xr < 1 else 1.4, zorder=3)
        if xr < 1:
            ax.plot(np.full_like(th, xr), xr**2 * np.cos(th), xr**2 * np.sin(th), color=C['purple'], lw=0.7, alpha=0.7, zorder=3)
    for a in (0, PI / 2, PI, 3 * PI / 2):
        ax.plot(xs, np.sqrt(xs) * np.cos(a), np.sqrt(xs) * np.sin(a), color=C['sky'], lw=0.9, zorder=3)
    # The region that turns, in the plane of the page above the axis.
    verts = [list(zip(xs, 0 * xs, np.sqrt(xs))) + list(zip(xs[::-1], 0 * xs, xs[::-1]**2))]
    ax.add_collection3d(Poly3DCollection(verts, facecolor=C['blue'], alpha=0.45, edgecolor='none', zorder=4))
    ax.plot(xs, 0 * xs, np.sqrt(xs), color=C['blue'], lw=2.0, zorder=5)
    ax.plot(xs, 0 * xs, xs**2, color=C['purple'], lw=2.0, zorder=5)
    # The washer: the slice of the solid at x0.
    tt = np.linspace(0, 2 * PI, 61)
    quads = [[(x0, r0 * np.cos(a), r0 * np.sin(a)), (x0, R0 * np.cos(a), R0 * np.sin(a)),
              (x0, R0 * np.cos(b), R0 * np.sin(b)), (x0, r0 * np.cos(b), r0 * np.sin(b))] for a, b in zip(tt[:-1], tt[1:])]
    ax.add_collection3d(Poly3DCollection(quads, facecolor=C['orange'], alpha=0.75, edgecolor='none', zorder=6))
    for rad in (R0, r0):
        ax.plot(np.full_like(tt, x0), rad * np.cos(tt), rad * np.sin(tt), color=C['orange'], lw=1.5, zorder=7)
    ax.plot([-0.15, 1.3], [0, 0], [0, 0], color=C['navy'], lw=1.3, zorder=8)
    ax.text(1.36, 0, -0.03, r'$x$', color=C['navy'], fontsize=13, zorder=9)
    ax.text(0.08, 0, 0.5, r'$y = \sqrt{x}$', color=C['blue'], fontsize=11, zorder=9, ha='right')
    ax.set_xlim(0, 1.15)
    ax.set_ylim(-1.0, 1.0)
    ax.set_zlim(-1.0, 1.0)
    ax.set_box_aspect((1.15, 2.0, 2.0), zoom=1.3)
    ax.view_init(elev=20, azim=-60)
    ax.set_axis_off()
    # Label the lower boundary from free space, with a leader line to a point of the curve.
    from mpl_toolkits.mplot3d import proj3d
    fig.canvas.draw()
    px, py, _ = proj3d.proj_transform(0.86, 0.0, 0.86**2, ax.get_proj())
    ax.annotate(r'$y = x^2$', xy=(px, py), xytext=(70, 30), textcoords='offset points', color=C['purple'],
                fontsize=11, ha='left', va='center', zorder=10,
                arrowprops=dict(arrowstyle='-', color=C['purple'], lw=1.0, shrinkA=2, shrinkB=1))

    # The washer face, seen along the x-axis.
    a2 = fig.add_axes([0.63, 0.1, 0.35, 0.78])
    diagram(a2, (-1.05, 1.05), (-1.25, 1.0))
    a2.add_patch(Ellipse((0, 0), 2 * R0, 2 * R0, facecolor=C['orangel'], edgecolor=C['orange'], lw=1.8, zorder=2))
    a2.add_patch(Ellipse((0, 0), 2 * r0, 2 * r0, facecolor='white', edgecolor=C['orange'], lw=1.8, zorder=3))
    dot(a2, 0, 0, color=C['navy'], size=4)
    ang = np.radians(35)
    a2.plot([0, R0 * np.cos(ang)], [0, R0 * np.sin(ang)], color=C['blue'], lw=1.6, zorder=4)
    angr = np.radians(215)
    a2.plot([0, r0 * np.cos(angr)], [0, r0 * np.sin(angr)], color=C['purple'], lw=1.6, zorder=4)
    label(a2, 0.47 * R0 * np.cos(ang) - 0.04, 0.47 * R0 * np.sin(ang) + 0.1, r'$R$', color=C['blue'], size=12, ha='right')
    label(a2, 0.5 * r0 * np.cos(angr) - 0.02, 0.5 * r0 * np.sin(angr) + 0.11, r'$r$', color=C['purple'], size=12, ha='center')
    label(a2, 0, -0.93, r'$R = \sqrt{x}, \ r = x^2$', size=11, ha='center')
    label(a2, 0, -1.17, r'area $\pi R^2 - \pi r^2$', size=11, ha='center')
    a2.set_title('The washer at $x$', fontsize=11.5, color=C['navy'])
    return fig


def cylinder_sketch(ax, rad, h, flat=0.28, color=None, fill=None, lw=1.6, zorder=3):
    """A cylinder of radius rad and height h about the vertical axis, in a flat 2D sketch: ellipses for the
    top and bottom (the hidden back of the bottom dashed) and the two sides."""
    col = color or C['orange']
    if fill:
        ax.add_patch(Rectangle((-rad, 0), 2 * rad, h, facecolor=fill, edgecolor='none', zorder=zorder - 1))
        ax.add_patch(Ellipse((0, 0), 2 * rad, 2 * rad * flat, facecolor=fill, edgecolor='none', zorder=zorder - 1))
    t = np.linspace(0, PI, 80)
    ax.plot(rad * np.cos(t), -rad * flat * np.sin(t), color=col, lw=lw, zorder=zorder)
    ax.plot(rad * np.cos(t), rad * flat * np.sin(t), color=col, lw=lw * 0.7, ls=(0, (3, 2)), zorder=zorder)
    ax.add_patch(Ellipse((0, h), 2 * rad, 2 * rad * flat, facecolor='white' if fill else 'none', edgecolor=col, lw=lw,
                         zorder=zorder + 0.5))
    ax.plot([-rad, -rad], [0, h], color=col, lw=lw, zorder=zorder)
    ax.plot([rad, rad], [0, h], color=col, lw=lw, zorder=zorder)


def fig_12_3(L):
    """Cylindrical shells: a thin strip at x, turning about the y-axis, sweeps out a shell of radius x and height f(x)."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.8, gridspec_kw={'width_ratios': [1, 1.15]})
    f = lambda x: 4 * x - x**3
    x0, dx = 1.2, 0.14

    # Left: the region under y = f(x) and one strip.
    math_axes(a1, (-0.35, 2.45), (-0.85, 3.75), xticks=[1, 2], yticks=[1, 2, 3])
    shade(a1, f, 0, 2, color=C['blue'], alpha=0.16)
    plot_fn(a1, f, 0, 2.0)
    strip(a1, x0, x0 + dx, 0, f(x0 + dx / 2))
    dimension(a1, 0, -0.42, x0, -0.42, '', color=C['slate'])
    label(a1, x0 / 2, -0.52, r'$x$', color=C['slate'], size=11, ha='center', va='top')
    label(a1, x0 + dx + 0.07, 1.45, r'$f(x)$', color=C['orange'], size=11)
    label(a1, 1.02, 3.42, r'$y = 4x - x^3$', color=C['blue'], size=11, ha='right')
    title(a1, r'A strip of width $\Delta x$', size=11.5)

    # Right: the shell that the strip sweeps out, with the silhouette of the solid.
    diagram(a2, (-2.4, 3.3), (-1.15, 4.1))
    u = np.linspace(0, 2, 200)
    for sgn in (1, -1):
        a2.plot(sgn * u, f(u), color=C['blue'], lw=1.3, zorder=2)
    a2.plot([-2, 2], [0, 0], color=C['blue'], lw=1.0, zorder=2)
    h0 = f(x0 + dx / 2)
    cylinder_sketch(a2, x0 + dx, h0, fill=C['orangel'], color=C['orange'], zorder=4)
    cylinder_sketch(a2, x0, h0, color=C['orange'], lw=1.1, zorder=5)
    a2.add_patch(Rectangle((x0, 0), dx, h0, facecolor=C['orange'], alpha=0.6, edgecolor=C['orange'], zorder=6))
    a2.plot([0, 0], [-0.9, 3.95], color=C['navy'], lw=1.2, ls=(0, (5, 3)), zorder=7)
    label(a2, 0.1, 3.95, r'$y$', size=12)
    dimension(a2, 0, -0.62, x0, -0.62, 'radius $x$', offset=(0, -0.3), size=10.5)
    dimension(a2, 2.2, 0, 2.2, h0, '', color=C['orange'])
    a2.plot([x0 + dx, 2.2], [h0, h0], color=C['muted'], lw=0.9, ls=(0, (3, 2)), zorder=2)
    label(a2, 2.32, h0 / 2, 'height\n$f(x)$', color=C['orange'], size=10.5)
    title(a2, 'The shell it sweeps out', size=11.5)
    fig.tight_layout(w_pad=1.0)
    return fig


def fig_12_4(L):
    """Work: a hanging rope, pulled up piece by piece, and a cone-shaped tank of water, pumped out layer by layer."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=4.2, gridspec_kw={'width_ratios': [0.75, 1.25]})

    # The rope: 20 m hanging from the top of a building; a piece at depth y is lifted y metres.
    # (A schematic: the two directions are drawn to different scales.)
    a1.set_xlim(-3.2, 4.6)
    a1.set_ylim(-23.0, 2.6)
    a1.axis('off')
    a1.add_patch(Rectangle((-2.6, -21.5), 2.6, 21.5, facecolor=C['border'], edgecolor=C['slate'], lw=1.2, zorder=1))
    for yk in np.arange(-19.6, -1.5, 2.8):
        for xk in (-2.1, -1.0):
            a1.add_patch(Rectangle((xk, yk), 0.55, 1.3, facecolor='white', edgecolor=C['muted'], lw=0.8, zorder=2))
    a1.plot([-3.2, 4.4], [-21.5, -21.5], color=C['slate'], lw=1.4, zorder=2)
    a1.plot([0.3, 0.3], [0, -20], color=C['amber'], lw=3.0, zorder=4, solid_capstyle='butt')
    yp = -12.0
    a1.plot([0.3, 0.3], [yp, yp - 1.2], color=C['red'], lw=6.5, zorder=5, solid_capstyle='butt')
    a1.plot([0.3, 1.6], [0, 0], color=C['muted'], lw=0.9, ls=(0, (3, 2)), zorder=2)
    a1.plot([0.6, 1.6], [yp, yp], color=C['muted'], lw=0.9, ls=(0, (3, 2)), zorder=2)
    dimension(a1, 1.6, 0, 1.6, yp, r'$y$', offset=(0.35, 0), color=C['red'], ha='left')
    label(a1, 0.75, yp - 1.9, r'$\Delta y$', color=C['red'], size=11)
    label(a1, 0.65, -20.2, r'$20$ m', color=C['amber'], size=10.5)
    a1.set_title('Lifting a rope', fontsize=11.5, color=C['navy'])

    # The tank: a cone, vertex down, 4 m deep, top radius 2 m, full of water; a layer at height y.
    diagram(a2, (-3.3, 4.2), (-0.6, 5.6))
    a2.add_patch(Polygon([(0, 0), (-2, 4), (2, 4)], closed=True, facecolor=C['skyl'], edgecolor='none', zorder=1))
    a2.add_patch(Ellipse((0, 4), 4.0, 0.55, facecolor=C['skyl'], edgecolor=C['sky'], lw=1.2, zorder=2))
    a2.plot([-2, 0, 2], [4, 0, 4], color=C['navy'], lw=1.8, zorder=3)
    a2.add_patch(Ellipse((0, 4), 4.0, 0.55, facecolor='none', edgecolor=C['navy'], lw=1.8, zorder=3))
    yl, th = 2.4, 0.16
    rl = yl / 2
    band = Polygon([(-rl, yl), (rl, yl), (rl + th / 2, yl + th), (-rl - th / 2, yl + th)], closed=True,
                   facecolor=C['orange'], edgecolor=C['orange'], alpha=0.75, zorder=4)
    a2.add_patch(band)
    a2.add_patch(Ellipse((0, yl + th), 2 * rl + th, 0.34, facecolor=C['orangel'], edgecolor=C['orange'], lw=1.3, zorder=5))
    a2.plot([0, rl], [yl + th, yl + th], color=C['navy'], lw=1.2, zorder=6)
    label(a2, rl / 2, yl + th + 0.32, r'$y/2$', size=10.5, ha='center')
    dimension(a2, -2.45, 0, -2.45, yl, r'$y$', offset=(-0.25, 0), ha='right')
    dimension(a2, 2.6, yl + th, 2.6, 4, r'$4 - y$', offset=(0.2, 0), ha='left', color=C['red'])
    a2.plot([rl + th, 2.6], [yl + th, yl + th], color=C['muted'], lw=0.9, ls=(0, (3, 2)), zorder=2)
    a2.plot([2.0, 2.6], [4, 4], color=C['muted'], lw=0.9, ls=(0, (3, 2)), zorder=2)
    arrow(a2, 0.0, yl + 0.6, 0.0, 5.3, color=C['red'], lw=1.4, head=10)
    label(a2, 0.15, 5.25, 'pumped out', color=C['red'], size=10.5)
    label(a2, -1.55, 4.75, r'$2$ m', size=10.5, ha='center')
    a2.plot([-2, 0], [4.42, 4.42], color=C['slate'], lw=0.9)
    label(a2, 1.0, 0.6, r'$4$ m deep', size=10.5)
    a2.set_title('Emptying a tank', fontsize=11.5, color=C['navy'])
    fig.tight_layout(w_pad=1.0)
    return fig


def fig_12_5(L):
    """Probabilities as areas: an exponential density with P(0.5 <= X <= 1) shaded, and the standard normal density with P(-1 <= Z <= 1) shaded."""
    fig, (a1, a2) = figure_grid(1, 2, w=7.6, h=3.4)
    lam = 2.0
    f = lambda x: lam * np.exp(-lam * x) if x >= 0 else 0.0
    math_axes(a1, (-0.35, 3.1), (-0.25, 2.35), xticks=[0.5, 1, 2, 3], yticks=[1, 2])
    shade(a1, f, 0.5, 1.0, color=C['orange'], alpha=0.45)
    plot_fn(a1, f, 0, 3.0)
    a1.plot([-0.35, 0], [0, 0], color=C['blue'], lw=2.2, zorder=4)
    dot(a1, 0, 2, color=C['blue'], size=5)
    dot(a1, 0, 0, color=C['blue'], size=5, hollow=True)
    p = np.exp(-1) - np.exp(-2)
    label(a1, 1.05, 0.95, r'$P(0.5 \leq X \leq 1)$', color=C['orange'], size=11)
    label(a1, 1.05, 0.68, rf'$\approx {p:.3f}$', color=C['orange'], size=11)
    arrow(a1, 1.02, 0.6, 0.8, 0.22, color=C['orange'], lw=1.2, head=9)
    label(a1, 0.18, 1.95, r'$f(x) = 2e^{-2x}$', color=C['blue'], size=11)
    title(a1, 'An exponential density')

    phi = lambda z: np.exp(-z**2 / 2) / np.sqrt(2 * PI)
    math_axes(a2, (-3.6, 3.6), (-0.06, 0.5), xlabel='$z$', xticks=[-3, -2, -1, 1, 2, 3], yticks=[0.1, 0.2, 0.3])
    shade(a2, phi, -1, 1, color=C['orange'], alpha=0.45)
    plot_fn(a2, phi, -3.6, 3.6)
    label(a2, 1.75, 0.3, r'$P(-1 \leq Z \leq 1)$', color=C['orange'], size=11)
    label(a2, 1.75, 0.245, r'$\approx 0.683$', color=C['orange'], size=11)
    arrow(a2, 1.72, 0.235, 0.62, 0.16, color=C['orange'], lw=1.2, head=9)
    label(a2, -2.6, 0.2, r'$\varphi(z)$', color=C['blue'], size=11)
    title(a2, 'The standard normal density')
    fig.tight_layout(w_pad=2.0)
    return fig


FIGURES = {'fig-12-1': fig_12_1, 'fig-12-2': fig_12_2, 'fig-12-3': fig_12_3, 'fig-12-4': fig_12_4, 'fig-12-5': fig_12_5}
