# Momentum as a filter: |H(w)| = 1/|1 - mu e^{-iw}| for mu = 0, 0.5, 0.9.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="frequency ω of the gradient component (rad per step)", y="gain |H(ω)|", c="consistent direction", f="sign flips every step"),
     "zh": dict(x="梯度分量的频率 ω（弧度/步）", y="增益 |H(ω)|", c="方向一致", f="每步符号翻转")}[lang]
w = np.linspace(0, np.pi, 600)
fig, ax = figstyle.figure(7.0, 3.6, lang=lang)
for mu, col in [(0.0, figstyle.SLATE), (0.5, figstyle.ORANGE), (0.9, figstyle.BLUE)]:
    H = 1 / abs(1 - mu * np.exp(-1j * w))
    ax.plot(w, H, color=col, label=f"μ = {mu:g}")
assert abs(1 / (1 - .9) - 10) < 1e-9 and round(1 / 1.9, 2) == 0.53
ax.plot([0, np.pi], [10, 1 / 1.9], "o", color=figstyle.BLUE, ms=6, zorder=5)
ax.annotate("10", (0, 10), xytext=(10, 2), textcoords="offset points", fontsize=11, color=figstyle.BLUE, fontweight="bold", va="center")
ax.annotate(T["c"], (0, 10), xytext=(34, 2), textcoords="offset points", fontsize=10, color=figstyle.SLATE, va="center")
ax.annotate("0.53", (np.pi, 1 / 1.9), xytext=(-8, -16), textcoords="offset points", fontsize=11, color=figstyle.BLUE, fontweight="bold", ha="right", va="center")
ax.annotate(T["f"], (np.pi, 1 / 1.9), xytext=(-46, -16), textcoords="offset points", fontsize=10, color=figstyle.SLATE, ha="right", va="center")
ax.set_yscale("log"); ax.set_ylim(0.3, 14); ax.set_xlim(-0.05, np.pi + 0.08)
ax.set_yticks([0.5, 1, 2, 5, 10]); ax.set_yticklabels(["0.5", "1", "2", "5", "10"]); ax.minorticks_off()
ax.set_xticks([0, np.pi / 4, np.pi / 2, 3 * np.pi / 4, np.pi]); ax.set_xticklabels(["0", "π/4", "π/2", "3π/4", "π"])
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"]); ax.legend(loc="upper right", fontsize=10.5)
figstyle.save(fig, "fig-02-12", lang)
