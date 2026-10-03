# Learning curves of Lab 3's problem, exact expectations on the fixed design x = linspace(0, 1, N), degrees 3 and 9.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
from numpy.polynomial import legendre as L
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="number of training points N (log scale)", y="expected MSE", t3="degree 3 training", v3="degree 3 validation",
                t9="degree 9 training", v9="degree 9 validation", lim3="0.0946", lim9="0.0900", cross="crossing near N = 115",
                gap="gap at N = 20", title="Learning curves, degree 3 and degree 9"),
     "zh": dict(x="训练点数 N（对数坐标）", y="期望 MSE", t3="3 次，训练", v3="3 次，验证", t9="9 次，训练", v9="9 次，验证",
                lim3="0.0946", lim9="0.0900", cross="约在 N = 115 处交叉", gap="N = 20 时的间隔", title="学习曲线：3 次与 9 次")}[lang]
f = lambda x: np.sin(2 * np.pi * x); S2 = 0.09
phi = lambda x, d: L.legvander(2 * x - 1, d)
grid = np.linspace(0, 1, 2001)
def curve(d, N):
    x = np.linspace(0, 1, N); Q, R = np.linalg.qr(phi(x, d))
    tr = np.mean((Q @ (Q.T @ f(x)) - f(x)) ** 2) + S2 * (1 - (d + 1) / N)
    Sg = phi(grid, d) @ np.linalg.solve(R, Q.T)
    va = np.mean((Sg @ f(x) - f(grid)) ** 2) + S2 * np.mean((Sg ** 2).sum(1)) + S2
    return tr, va
Ns = np.unique(np.round(np.logspace(1, 3, 60)).astype(int))
C = {d: np.array([curve(d, N) for N in Ns]) for d in (3, 9)}
cross = next(N for N in range(30, 400) if curve(9, N)[1] < curve(3, N)[1])
print("crossing", cross, "N=20:", curve(3, 20), curve(9, 20), "N=1000:", curve(3, 1000)[1], curve(9, 1000)[1])
assert 112 <= cross <= 116
fig, ax = figstyle.figure(7.2, 4.0, lang=lang)
ax.plot([10, 1050], [0.0946] * 2, color=figstyle.BLUE, lw=0.9, ls=":"); ax.plot([10, 1050], [0.0900] * 2, color=figstyle.ORANGE, lw=0.9, ls=":")
ax.plot(Ns, C[3][:, 0], color=figstyle.BLUE, ls="--", label=T["t3"]); ax.plot(Ns, C[3][:, 1], color=figstyle.BLUE, label=T["v3"])
ax.plot(Ns, C[9][:, 0], color=figstyle.ORANGE, ls="--", label=T["t9"]); ax.plot(Ns, C[9][:, 1], color=figstyle.ORANGE, label=T["v9"])
ax.plot([cross], [curve(3, cross)[1]], "o", color=figstyle.NAVY, ms=5, zorder=5)
ax.annotate(T["cross"], (cross, curve(3, cross)[1]), xytext=(160, 0.145), fontsize=9.5, color=figstyle.NAVY,
            arrowprops=dict(arrowstyle="-", color=figstyle.NAVY, lw=1))
ax.text(1080, 0.0946, T["lim3"], color=figstyle.BLUE, fontsize=9.5, ha="left", va="bottom")
ax.text(1080, 0.0900, T["lim9"], color=figstyle.ORANGE, fontsize=9.5, ha="left", va="top")
ax.set_xscale("log"); ax.set_xlim(10, 1800); ax.set_ylim(0, 0.2)
ax.set_xticks([10, 20, 50, 100, 200, 500, 1000]); ax.set_xticklabels(["10", "20", "50", "100", "200", "500", "1,000"]); ax.minorticks_off()
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"]); ax.set_title(T["title"], fontsize=11)
ax.legend(loc="upper right", fontsize=9.5, ncol=2, bbox_to_anchor=(1.0, 1.0))
figstyle.save(fig, "fig-01-15", lang)
