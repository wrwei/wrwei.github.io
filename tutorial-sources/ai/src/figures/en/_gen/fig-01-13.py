# Polynomial fits of degree 1, 3, 15 to 20 noisy samples of sin(2πx) (Lab 3, seed 0) and RMSE against degree.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
import matplotlib.pyplot as plt
from numpy.polynomial import legendre as L
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(true="true sin(2πx)", pts="20 training points", deg="degree", under="underfitting", over="overfitting",
                tr="training", va="validation (1,000 points)", noise="noise level σ = 0.3", x="degree of the polynomial", yl="RMSE",
                best="minimum at degree 3–4", names=["underfits", "follows the sine", "swings at the ends"]),
     "zh": dict(true="真实函数 sin(2πx)", pts="20 个训练点", deg="次数", under="欠拟合", over="过拟合",
                tr="训练误差", va="验证误差（1,000 点）", noise="噪声水平 σ = 0.3", x="多项式次数", yl="RMSE",
                best="最小值在 3–4 次", names=["欠拟合", "贴合正弦曲线", "两端剧烈摆动"])}[lang]
SIGMA = 0.3; f = lambda x: np.sin(2 * np.pi * x); phi = lambda x, d: L.legvander(2 * x - 1, d)
gen = np.random.default_rng(0)
x_tr = np.linspace(0, 1, 20); y_tr = f(x_tr) + SIGMA * gen.normal(size=20)
x_va = gen.uniform(0, 1, 1000); y_va = f(x_va) + SIGMA * gen.normal(size=1000)
fit = lambda d: np.linalg.lstsq(phi(x_tr, d), y_tr, rcond=None)[0]
degs = np.arange(16)
tr = [np.sqrt(np.mean((phi(x_tr, d) @ fit(d) - y_tr) ** 2)) for d in degs]
va = [np.sqrt(np.mean((phi(x_va, d) @ fit(d) - y_va) ** 2)) for d in degs]
print([round(v, 3) for v in tr]); print([round(v, 3) for v in va])
assert round(tr[15], 3) == 0.112 and round(va[15], 3) == 0.720 and round(va[3], 3) == 0.354
figstyle.apply(lang)
fig = plt.figure(figsize=(7.4, 4.4), constrained_layout=True)
gs = fig.add_gridspec(3, 2, width_ratios=[0.8, 1.2])
grid = np.linspace(0, 1, 301)
cols = {1: figstyle.BLUE, 3: figstyle.GREEN, 15: figstyle.RED}
for i, d in enumerate([1, 3, 15]):
    a = fig.add_subplot(gs[i, 0])
    a.plot(grid, f(grid), "--", color=figstyle.NAVY, lw=1.2, label=T["true"] if i == 0 else None)
    a.plot(x_tr, y_tr, "o", color=figstyle.MUTED, ms=3.5, label=T["pts"] if i == 0 else None)
    a.plot(grid, phi(grid, d) @ fit(d), color=cols[d], lw=2)
    a.set_ylim(-2.3, 2.3); a.set_xlim(0, 1)
    a.text(0.5, 2.1, f"{T['deg']} {d}: {T['names'][i]}", color=cols[d], fontsize=9.5, fontweight="bold", va="top", ha="center", bbox=dict(fc="white", ec="none", pad=1.5, alpha=.85))
    a.set_yticks([-1, 0, 1])
    if i < 2: a.set_xticklabels([])
    else: a.set_xlabel("x")
    if i == 0: a.legend(loc="lower left", fontsize=8, bbox_to_anchor=(0.0, -0.05), handlelength=1.6, labelspacing=0.2)
r = fig.add_subplot(gs[:, 1])
r.axvspan(-0.5, 2.5, color=figstyle.FILLS["blue"], alpha=.6, zorder=0)
r.axvspan(9.5, 15.5, color=figstyle.FILLS["red"], alpha=.9, zorder=0)
r.plot(degs, tr, "o-", color=figstyle.BLUE, ms=4.5, label=T["tr"])
r.plot(degs, va, "s-", color=figstyle.ORANGE, ms=4.5, label=T["va"])
r.axhline(SIGMA, color=figstyle.NAVY, ls="--", lw=1.1, label=T["noise"])
r.set_yscale("log"); r.set_ylim(0.07, 1.6); r.set_xlim(-0.5, 15.5)
r.set_yticks([0.1, 0.2, 0.3, 0.5, 1.0]); r.set_yticklabels(["0.1", "0.2", "0.3", "0.5", "1.0"]); r.minorticks_off()
r.set_xticks(range(0, 16, 3)); r.set_xlabel(T["x"]); r.set_ylabel(T["yl"])
r.text(1.0, 1.45, T["under"], ha="center", va="top", color=figstyle.SLATE, fontsize=10, fontweight="bold")
r.text(12.5, 1.45, T["over"], ha="center", va="top", color=figstyle.RED, fontsize=10, fontweight="bold")
r.annotate(T["best"], (3.5, va[3]), xytext=(6.2, 0.105), fontsize=9, color=figstyle.ORANGE, ha="left", arrowprops=dict(arrowstyle="-", color=figstyle.ORANGE, lw=1))
r.legend(loc="upper center", bbox_to_anchor=(0.5, 0.80), fontsize=9)
figstyle.save(fig, "fig-01-13", lang)
