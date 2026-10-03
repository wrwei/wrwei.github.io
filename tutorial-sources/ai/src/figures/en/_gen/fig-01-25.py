# Neo-Hookean fit to strains up to 20%, extrapolated, against the Gent fit to all 16 points (Lab 5).
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", ".."))); sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import numpy as np, figstyle
from _lab5 import *
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="stretch λ", y="nominal stress (kPa)", d="measured, ±σ", nh="neo-Hookean fitted to strains up to 20%", ext="extrapolated beyond 20%",
                band="95% band (noise only)", gent="Gent fitted to all 16 points", rng="fitted range\n(strain ≤ 20%)",
                gap="13% gap at 40% strain:\n−43.96 kPa (fit)\n−50.57 kPa (true)"),
     "zh": dict(x="拉伸比 λ", y="名义应力（kPa）", d="测量值，±σ", nh="新胡克模型，拟合应变不超过 20%", ext="超出 20% 的外推",
                band="95% 带（仅含噪声）", gent="Gent 模型，拟合全部 16 个点", rng="拟合范围\n（应变 ≤ 20%）",
                gap="40% 应变处相差 13%：\n拟合 −43.96 kPa\n真值 −50.57 kPa")}[lang]
fig, ax = figstyle.figure(7.2, 4.6, lang=lang)
fine = np.linspace(0.6, 0.99, 200)
c1, se = fit20["c1"], fit20["se"]
curve = p_neo(fine, c1); band = 1.96 * 2 * np.abs(g(fine)) * se
ax.axvspan(0.8, 1.0, color=figstyle.FILLS["blue"], alpha=.7, lw=0)
ax.text(0.9, 4.5, T["rng"], ha="center", va="bottom", fontsize=10.5, color=figstyle.BLUE)
ax.fill_between(fine, curve - band, curve + band, color=figstyle.ORANGE, alpha=.3, lw=0, label=T["band"])
ins = fine >= 0.8
ax.plot(fine[ins], curve[ins], color=figstyle.ORANGE, lw=2, label=T["nh"])
ax.plot(fine[~ins | (fine <= 0.8)], curve[~ins | (fine <= 0.8)], color=figstyle.ORANGE, lw=2, ls="--", label=T["ext"])
ax.plot(fine, p_gent(fine, *gent_all["theta"]), color=figstyle.GREEN, lw=2, label=T["gent"])
ax.errorbar(lam, p_meas, yerr=sigma, fmt="o", ms=4.5, capsize=2, color=figstyle.NAVY, label=T["d"], zorder=5)
ax.annotate("", xy=(0.6, p_neo(0.6, c1)), xytext=(0.6, p_gent(0.6, 10, 0.2)), arrowprops=dict(arrowstyle="<->", color=figstyle.RED, lw=1.6, shrinkA=0, shrinkB=0))
ax.annotate(T["gap"], xy=(0.605, -47.3), xytext=(0.645, -52), ha="right", va="center", fontsize=10.5, color=figstyle.RED, arrowprops=dict(arrowstyle="-", color=figstyle.RED, lw=1, shrinkA=2, shrinkB=0))
ax.set_xlim(1.02, 0.585); ax.set_ylim(-62, 12)
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"])
ax.legend(loc="upper right", fontsize=9.5, bbox_to_anchor=(1.0, 0.93))
figstyle.save(fig, "fig-01-25", lang=lang)
