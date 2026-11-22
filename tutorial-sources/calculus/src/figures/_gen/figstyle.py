"""House style and helpers for the Calculus series' figures (see figs.py and notes/AUTHORING.md section 7).

Every figure is a matplotlib figure drawn from the mathematics it shows. One style for all of them:
the site's colours, DejaVu Sans for words, Computer Modern for mathematics (as KaTeX on the pages),
axes through the origin with arrowheads for graphs of functions, a light grid.

    fig, ax = figure(7.6, 4.0)                       # width and height in inches (100 px per inch)
    math_axes(ax, (-3, 3), (-1, 9))                  # axes through the origin, arrows, grid, ticks
    plot_fn(ax, lambda x: x**2, -3, 3)               # a curve, broken at jumps and asymptotes
    dot(ax, 1, 1); dot(ax, 2, 4, hollow=True)        # a point, and a hole
    label(ax, 2.1, 4.4, r'$y = x^2$', color=C['blue'])
    shade(ax, lambda x: x**2, 0, 2)                  # area under a curve
    riemann(ax, lambda x: x**2, 0, 2, 8, 'left')     # Riemann rectangles
    tangent(ax, lambda x: x**2, 1, (-0.5, 2.5))      # tangent line at x = 1
    return fig
"""
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402

C = dict(navy='#1A2E4A', blue='#2563EB', sky='#0EA5E9', skyl='#DBEAFE', skyp='#F0F9FF', slate='#475569',
         muted='#94A3B8', border='#E2E8F0', grid='#E8EDF3', white='#FFFFFF', green='#15803D', greenl='#DCFCE7',
         orange='#C2410C', orangel='#FFEDD5', red='#DC2626', redl='#FEE2E2', purple='#7E22CE', purplel='#F3E8FF',
         amber='#B45309', amberl='#FEF3C7', teal='#0F766E', teall='#CCFBF1')
# Colours for several curves in one figure, in this order.
CURVES = [C['blue'], C['orange'], C['green'], C['purple'], C['red'], C['teal']]

plt.rcParams.update({
    'font.family': 'DejaVu Sans', 'font.size': 11, 'mathtext.fontset': 'cm', 'axes.unicode_minus': True,
    'axes.edgecolor': C['navy'], 'axes.labelcolor': C['navy'], 'text.color': C['navy'],
    'xtick.color': C['slate'], 'ytick.color': C['slate'], 'xtick.labelsize': 10, 'ytick.labelsize': 10,
    'axes.titlesize': 12, 'axes.titleweight': 'normal', 'axes.titlecolor': C['navy'], 'axes.titlepad': 8,
    'legend.fontsize': 10, 'legend.frameon': False, 'lines.linewidth': 2.2, 'lines.solid_capstyle': 'round',
    'figure.facecolor': 'white', 'axes.facecolor': 'white', 'savefig.facecolor': 'white',
    'svg.fonttype': 'path', 'svg.hashsalt': 'calculus-series', 'path.simplify': True,
})


def figure(w=7.6, h=4.0, **kw):
    """A figure with one axes; w and h in inches (the page shows 100 px per inch)."""
    fig, ax = plt.subplots(figsize=(w, h), **kw)
    return fig, ax


def figure_grid(nrows, ncols, w=7.6, h=3.4, **kw):
    """A figure with a grid of axes (returned as a flat list)."""
    fig, axes = plt.subplots(nrows, ncols, figsize=(w, h), squeeze=False, **kw)
    return fig, [a for row in axes for a in row]


def figure3d(w=7.6, h=5.0):
    """A figure with one 3D axes."""
    fig = plt.figure(figsize=(w, h))
    ax = fig.add_subplot(projection='3d')
    ax.xaxis.pane.set_facecolor('#F8FAFC')
    ax.yaxis.pane.set_facecolor('#F8FAFC')
    ax.zaxis.pane.set_facecolor('#F8FAFC')
    for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
        axis.pane.set_edgecolor(C['border'])
        axis._axinfo['grid']['color'] = C['grid']
    return fig, ax


def math_axes(ax, xlim, ylim, xlabel='$x$', ylabel='$y$', xticks=None, yticks=None, grid=True,
              ticklabels=True, aspect=None):
    """Axes through the origin (or along the edges when 0 is out of range), with arrowheads,
    labels at the arrow tips, and a light grid. xticks/yticks: a list of positions, or a list of
    (position, label) pairs, or None for matplotlib's choice."""
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    if aspect:
        ax.set_aspect(aspect)
    x0 = 0 if xlim[0] <= 0 <= xlim[1] else xlim[0]
    y0 = 0 if ylim[0] <= 0 <= ylim[1] else ylim[0]
    for side in ('top', 'right'):
        ax.spines[side].set_visible(False)
    ax.spines['left'].set_position(('data', x0))
    ax.spines['bottom'].set_position(('data', y0))
    for side in ('left', 'bottom'):
        ax.spines[side].set_color(C['navy'])
        ax.spines[side].set_linewidth(1.1)
        ax.spines[side].set_zorder(1.5)
    ax.plot(1, y0, '>', color=C['navy'], transform=ax.get_yaxis_transform(), clip_on=False, markersize=6, zorder=3)
    ax.plot(x0, 1, '^', color=C['navy'], transform=ax.get_xaxis_transform(), clip_on=False, markersize=6, zorder=3)
    if xlabel:
        ax.annotate(xlabel, xy=(1, y0), xycoords=('axes fraction', 'data'), xytext=(6, -2), textcoords='offset points',
                    ha='left', va='center', fontsize=13, color=C['navy'], annotation_clip=False)
    if ylabel:
        ax.annotate(ylabel, xy=(x0, 1), xycoords=('data', 'axes fraction'), xytext=(0, 9), textcoords='offset points',
                    ha='center', va='bottom', fontsize=13, color=C['navy'], annotation_clip=False)
    from matplotlib.ticker import FuncFormatter

    def number(v, pos=None):
        if abs(v) < 1e-12 and x0 == 0 and y0 == 0:
            return ''          # the origin's label would collide with the axes
        if abs(v - round(v)) < 1e-9:
            s = str(int(round(v)))
        else:
            s = f'{v:.3f}'.rstrip('0').rstrip('.')
        return s.replace('-', '\u2212')

    for which, ticks in (('x', xticks), ('y', yticks)):
        axis = ax.xaxis if which == 'x' else ax.yaxis
        if ticks is not None and len(ticks) and isinstance(ticks[0], (tuple, list)):
            axis.set_ticks([p for p, _ in ticks])
            axis.set_ticklabels([lab for _, lab in ticks])
        else:
            if ticks is not None:
                axis.set_ticks(list(ticks))
            axis.set_major_formatter(FuncFormatter(number))
    ax.tick_params(length=4, width=1, direction='inout', pad=3)
    if not ticklabels:
        ax.set_xticklabels([])
        ax.set_yticklabels([])
    # Tick labels stay readable where a curve passes behind them.
    import matplotlib.patheffects as pe
    ax.figure.canvas.draw()
    for axis in (ax.xaxis, ax.yaxis):
        axis.set_zorder(5)
        for t in axis.get_major_ticks():
            t.label1.set_path_effects([pe.withStroke(linewidth=3, foreground='white')])
    if grid:
        ax.grid(True, color=C['grid'], linewidth=0.8, zorder=0)
        ax.set_axisbelow(True)
    return ax


def plot_fn(ax, f, a, b, n=1200, color=None, lw=2.2, label=None, breaks=(), jump=None, ls='-', zorder=4, **kw):
    """Plot y = f(x) for a <= x <= b. The line is broken at each x in `breaks` (asymptotes, jumps)
    and wherever f is not finite; with jump=J also wherever consecutive values differ by more than J."""
    xs = np.linspace(a, b, n)
    for p in breaks:
        xs = xs[np.abs(xs - p) > (b - a) * 1e-6]
    with np.errstate(all='ignore'):
        ys = np.array([float(f(x)) if np.isfinite(x) else np.nan for x in xs], dtype=float)
    ys[~np.isfinite(ys)] = np.nan
    cut = np.zeros(len(xs), dtype=bool)
    for p in breaks:
        cut[1:] |= (xs[:-1] < p) & (xs[1:] > p)
    if jump is not None:
        cut[1:] |= np.abs(np.diff(ys)) > jump
    segs, start = [], 0
    for i in np.nonzero(cut)[0]:
        segs.append((start, i))
        start = i
    segs.append((start, len(xs)))
    lines = []
    for k, (s, e) in enumerate(segs):
        ln, = ax.plot(xs[s:e], ys[s:e], color=color or C['blue'], lw=lw, ls=ls, zorder=zorder,
                      label=label if k == 0 else None, **kw)
        lines.append(ln)
    return lines


def plot_param(ax, x, y, t0, t1, n=1200, color=None, lw=2.2, **kw):
    """Plot a parametric curve (x(t), y(t)) for t0 <= t <= t1."""
    ts = np.linspace(t0, t1, n)
    return ax.plot([x(t) for t in ts], [y(t) for t in ts], color=color or C['blue'], lw=lw, **kw)


def dot(ax, x, y, color=None, hollow=False, size=7, zorder=6):
    """A point on a graph; hollow=True draws a hole (a point the graph does not include)."""
    col = color or C['blue']
    ax.plot([x], [y], 'o', markersize=size, markerfacecolor='white' if hollow else col,
            markeredgecolor=col, markeredgewidth=1.8, zorder=zorder)


def label(ax, x, y, text, color=None, ha='left', va='center', size=12, halo=True, **kw):
    """Text at data coordinates, with a white halo so it stays readable over lines."""
    import matplotlib.patheffects as pe
    t = ax.text(x, y, text, color=color or C['navy'], ha=ha, va=va, fontsize=size, zorder=8, **kw)
    if halo:
        t.set_path_effects([pe.withStroke(linewidth=3.5, foreground='white')])
    return t


def shade(ax, f, a, b, g=None, color=None, alpha=0.22, n=600, **kw):
    """Shade between y = f(x) and y = g(x) (default the x-axis) for a <= x <= b."""
    xs = np.linspace(a, b, n)
    ys = np.array([f(x) for x in xs], dtype=float)
    gs = np.zeros_like(ys) if g is None else np.array([g(x) for x in xs], dtype=float)
    return ax.fill_between(xs, gs, ys, color=color or C['blue'], alpha=alpha, linewidth=0, zorder=2, **kw)


def riemann(ax, f, a, b, n, rule='left', color=None, alpha=0.28, edge=None):
    """Rectangles of a Riemann sum (rule: left, right, mid) or the trapezoids (rule: trap).
    Returns the value of the sum."""
    col = color or C['sky']
    dx = (b - a) / n
    total = 0.0
    for i in range(n):
        x0, x1 = a + i * dx, a + (i + 1) * dx
        if rule == 'trap':
            y0, y1 = f(x0), f(x1)
            ax.fill([x0, x0, x1, x1], [0, y0, y1, 0], color=col, alpha=alpha, zorder=2, lw=0)
            ax.plot([x0, x0, x1, x1], [0, y0, y1, 0], color=edge or col, lw=1.2, zorder=3)
            total += (y0 + y1) / 2 * dx
            continue
        xs = {'left': x0, 'right': x1, 'mid': (x0 + x1) / 2}[rule]
        h = f(xs)
        ax.add_patch(matplotlib.patches.Rectangle((x0, min(0, h)), dx, abs(h), facecolor=col, alpha=alpha, zorder=2, lw=0))
        ax.add_patch(matplotlib.patches.Rectangle((x0, min(0, h)), dx, abs(h), facecolor='none', edgecolor=edge or col, lw=1.2, zorder=3))
        total += h * dx
    return total


def tangent(ax, f, x0, xr, df=None, color=None, lw=1.8, ls='-', **kw):
    """The tangent line to y = f(x) at x0, drawn for x in xr = (left, right).
    df: the derivative (a function); if omitted, a central difference is used."""
    h = 1e-6
    m = df(x0) if df else (f(x0 + h) - f(x0 - h)) / (2 * h)
    xs = np.array(xr, dtype=float)
    return ax.plot(xs, f(x0) + m * (xs - x0), color=color or C['orange'], lw=lw, ls=ls, zorder=5, **kw)


def guide(ax, x=None, y=None, upto=None, color=None, **kw):
    """A dashed guide line: vertical at x (from the x-axis up to y=upto), or horizontal at y."""
    col = color or C['slate']
    if x is not None:
        ymin = 0 if upto is not None else None
        if upto is not None:
            return ax.plot([x, x], [ymin, upto], ls=(0, (4, 3)), color=col, lw=1.1, zorder=3, **kw)
        return ax.axvline(x, ls=(0, (4, 3)), color=col, lw=1.1, zorder=3, **kw)
    if upto is not None:
        return ax.plot([0, upto], [y, y], ls=(0, (4, 3)), color=col, lw=1.1, zorder=3, **kw)
    return ax.axhline(y, ls=(0, (4, 3)), color=col, lw=1.1, zorder=3, **kw)


def arrow(ax, x0, y0, x1, y1, color=None, lw=1.8, head=12, **kw):
    """An arrow from (x0, y0) to (x1, y1) in data coordinates."""
    return ax.annotate('', xy=(x1, y1), xytext=(x0, y0),
                       arrowprops=dict(arrowstyle='-|>', color=color or C['navy'], lw=lw, mutation_scale=head,
                                       shrinkA=0, shrinkB=0), zorder=6, **kw)


def panel_title(ax, text, size=12):
    """A small title above an axes (for figures with several panels)."""
    ax.set_title(text, fontsize=size, color=C['navy'])
