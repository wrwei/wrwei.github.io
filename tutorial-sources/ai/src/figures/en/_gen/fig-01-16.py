# Schematic double-descent curve: test error against the number of parameters p (illustrative shape, no data).
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="number of parameters p", y="test error", classical="classical regime", interp="interpolating regime",
                thr="interpolation threshold  p = N", note="right-hand side assumes a minimum-norm fit", sch="schematic",
                first="first descent", second="second descent"),
     "zh": dict(x="参数个数 p", y="测试误差", classical="经典区间", interp="插值区间", thr="插值阈值  p = N",
                note="右侧假定取最小范数解", sch="示意图", first="第一次下降", second="第二次下降")}[lang]
r = np.unique(np.r_[np.linspace(0.02, 4.0, 800), 1.0])
base_left = 1.5 * np.exp(-3.2 * r) + 0.22 + 0.10 * r ** 2
base_right = 0.30 + 0.35 * np.exp(-(r - 1) / 0.9)
w = np.where(r < 1, 0.16, 0.30)
bump = 1.9 * np.exp(-np.abs(r - 1) / w)
e = np.where(r < 1, base_left, base_right) + bump
fig, ax = figstyle.figure(7.2, 3.8, lang=lang)
ax.axvspan(0, 1, color=figstyle.FILLS["sky"], zorder=0); ax.axvspan(1, 4.0, color=figstyle.FILLS["purple"], zorder=0)
ax.plot(r[r <= 1], e[r <= 1], color=figstyle.BLUE); ax.plot(r[r >= 1], e[r >= 1], color=figstyle.PURPLE)
ax.axvline(1, color=figstyle.NAVY, ls="--", lw=1.2)
ymax = 3.5; ax.set_ylim(0, ymax); ax.set_xlim(0, 4.0)
ax.text(0.5, ymax * 0.97, T["classical"], ha="center", va="top", color=figstyle.BLUE, fontweight="bold", fontsize=10.5)
ax.text(2.5, ymax * 0.97, T["interp"], ha="center", va="top", color=figstyle.PURPLE, fontweight="bold", fontsize=10.5)
ax.text(2.5, ymax * 0.89, T["note"], ha="center", va="top", color=figstyle.SLATE, fontsize=9.5)
ax.text(1.1, 2.5, T["thr"], ha="left", va="center", color=figstyle.NAVY, fontsize=10)
ax.text(2.2, 0.95, T["second"], color=figstyle.PURPLE, fontsize=9.5, ha="left")
ax.text(0.05, 1.6, T["first"], color=figstyle.BLUE, fontsize=9.5, ha="left") if False else None
ax.set_xticks([1]); ax.set_xticklabels(["N"]); ax.set_yticks([]); ax.grid(False)
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"]); ax.set_title(T["sch"], fontsize=10, color=figstyle.SLATE)
figstyle.save(fig, "fig-01-16", lang)
