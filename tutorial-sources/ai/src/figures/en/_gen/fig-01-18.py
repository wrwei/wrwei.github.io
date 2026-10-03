# Geometry of ridge (disc) and lasso (diamond): least-squares contours touch the constraint region.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
from matplotlib.patches import Circle, Polygon
from scipy.optimize import minimize
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(lt="Ridge: L2 ball", rt="Lasso: L1 ball", ols="unconstrained solution", sol="solution", sol0="solution, w₂ = 0", note="w₁, w₂ both non-zero"),
     "zh": dict(lt="岭回归：L2 球", rt="Lasso 回归：L1 球", ols="无约束解", sol="解", sol0="解，w₂ = 0", note="w₁、w₂ 均非零")}[lang]
what = np.array([2.0, 1.2])
th = np.deg2rad(35)
Q = np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
A = Q @ np.diag([1.0, 0.18]) @ Q.T          # long axis at 35 degrees
def loss(w): d = np.asarray(w) - what; return d @ A @ d
t = 1.0
r2 = minimize(loss, [0.5, 0.5], constraints=[{"type": "ineq", "fun": lambda w: t**2 - w @ w}], method="SLSQP", tol=1e-12).x
# L1 ball: the minimum over the diamond is at the best of its four edges
best = None
for s1 in (1, -1):
    for s2 in (1, -1):
        r = minimize(loss, [0.3 * s1, 0.3 * s2], constraints=[{"type": "ineq", "fun": lambda w, s1=s1, s2=s2: t - s1 * w[0] - s2 * w[1]},
                     {"type": "ineq", "fun": lambda w, s1=s1: s1 * w[0]}, {"type": "ineq", "fun": lambda w, s2=s2: s2 * w[1]}], method="SLSQP", tol=1e-12)
        if best is None or r.fun < best.fun: best = r
r1 = best.x
print("L2 solution", r2, loss(r2), "L1 solution", r1, loss(r1))
g = np.linspace(-2.2, 3.4, 500); X, Y = np.meshgrid(g, g)
Z = np.vectorize(lambda a, b: loss([a, b]))(X[::5, ::5], Y[::5, ::5])
Zf = (np.stack([X, Y], -1) - what) @ A * (np.stack([X, Y], -1) - what)
Zf = Zf.sum(-1)
fig, axes = figstyle.figure(7.2, 3.7, ncols=2, lang=lang)
for ax, sol, kind in ((axes[0], r2, "disc"), (axes[1], r1, "diamond")):
    lv = sorted(set([loss(sol) * f for f in (0.25, 0.5, 1.0, 2.0, 3.6)] + [loss(sol)]))
    ax.contour(X, Y, Zf, levels=lv, colors=[figstyle.MUTED], linewidths=1.0)
    ax.contour(X, Y, Zf, levels=[loss(sol)], colors=[figstyle.ORANGE], linewidths=2.2)
    if kind == "disc":
        ax.add_patch(Circle((0, 0), t, fc=figstyle.FILLS["blue"], ec=figstyle.BLUE, lw=2, alpha=.85, zorder=2))
    else:
        ax.add_patch(Polygon([(t, 0), (0, t), (-t, 0), (0, -t)], fc=figstyle.FILLS["blue"], ec=figstyle.BLUE, lw=2, alpha=.85, zorder=2))
    ax.axhline(0, color=figstyle.SLATE, lw=0.9, zorder=1); ax.axvline(0, color=figstyle.SLATE, lw=0.9, zorder=1)
    ax.plot(*what, "o", color=figstyle.ORANGE, ms=5, zorder=5)
    ax.plot(*sol, "o", color=figstyle.NAVY, ms=7, zorder=6)
    ax.set_xlim(-1.6, 3.2); ax.set_ylim(-1.7, 2.8); ax.set_aspect("equal"); ax.grid(False)
    ax.set_xlabel("w₁"); ax.set_ylabel("w₂")
    ax.set_xticks([]); ax.set_yticks([])
axes[0].set_title(T["lt"]); axes[1].set_title(T["rt"])
axes[0].annotate(T["ols"], what, xytext=(-6, 10), textcoords="offset points", fontsize=10, color=figstyle.ORANGE, ha="center", bbox=dict(fc="white", ec="none", pad=1))
axes[1].annotate(T["ols"], what, xytext=(-6, 10), textcoords="offset points", fontsize=10, color=figstyle.ORANGE, ha="center", bbox=dict(fc="white", ec="none", pad=1))
axes[0].annotate(T["note"], r2, xytext=(0.2, -1.35), textcoords="data", fontsize=10, color=figstyle.NAVY, ha="left", va="center", bbox=dict(fc="white", ec="none", pad=1.5), arrowprops=dict(arrowstyle="->", color=figstyle.NAVY, lw=1), zorder=8)
axes[1].annotate(T["sol0"], r1, xytext=(0.2, -1.35), textcoords="data", fontsize=10, color=figstyle.NAVY, ha="left", va="center", bbox=dict(fc="white", ec="none", pad=1.5), arrowprops=dict(arrowstyle="->", color=figstyle.NAVY, lw=1), zorder=8)
figstyle.save(fig, "fig-01-18", lang=lang)
