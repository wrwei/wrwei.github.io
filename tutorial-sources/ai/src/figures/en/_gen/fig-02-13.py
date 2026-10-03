# Uncorrected-to-corrected Adam step ratio (1-b1^t)/sqrt(1-b2^t), b1 = 0.9, for b2 = 0.999 and 0.95.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="step t", y="uncorrected step ÷ corrected step", one="1 (no error)", pk="peak {v:.2f} at t = {t}", st="{v:.2f} at t = 1"),
     "zh": dict(x="步数 t", y="未校正步长 ÷ 已校正步长", one="1（无偏差）", pk="峰值 {v:.2f}，t = {t}", st="t = 1 时为 {v:.2f}")}[lang]
t = np.arange(1, 10001)
fig, ax = figstyle.figure(7.0, 3.7, lang=lang)
ax.axhline(1, color=figstyle.NAVY, lw=1.1, ls="--")
ax.text(1.15e4, 0.88, T["one"], fontsize=9.5, color=figstyle.NAVY, va="top", ha="right")
for b2, col, off_pk, off_st in [(0.999, figstyle.BLUE, (14, 6), (10, 4)), (0.95, figstyle.ORANGE, (10, 8), (10, -4))]:
    f = (1 - 0.9 ** t) / np.sqrt(1 - b2 ** t); i = int(f.argmax())
    print(b2, f[0].round(3), f[i].round(3), t[i], f[999].round(3))
    ax.plot(t, f, color=col, label=f"β₂ = {b2:g}")
    ax.plot([1, t[i]], [f[0], f[i]], "o", color=col, ms=5, zorder=5)
    ax.annotate(T["pk"].format(v=f[i], t=t[i]), (t[i], f[i]), xytext=off_pk, textcoords="offset points", fontsize=10, color=col)
    ax.annotate(T["st"].format(v=f[0]), (1, f[0]), xytext=off_st, textcoords="offset points", fontsize=10, color=col, va="center")
ax.set_xscale("log"); ax.set_xlim(0.45, 1.2e4); ax.set_ylim(0, 7.5)
ax.set_xticks([1, 10, 100, 1000, 10000]); ax.set_xticklabels(["1", "10", "10²", "10³", "10⁴"]); ax.minorticks_off()
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"]); ax.legend(loc="upper right", fontsize=10.5, bbox_to_anchor=(1, 0.8))
figstyle.save(fig, "fig-02-13", lang)
