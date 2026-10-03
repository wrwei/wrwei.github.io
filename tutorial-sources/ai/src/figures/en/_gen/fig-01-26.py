# Normalised residuals of two fits to all 16 points (Lab 5): neo-Hookean (systematic) and Gent (scattered).
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", ".."))); sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import numpy as np, figstyle
from _lab5 import *
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="stretch λ", y="normalised residual (Pᵢ − P̂ᵢ)/σᵢ", nh="neo-Hookean, all 16 points", gt="Gent, all 16 points",
                pos="ten positive", neg="six negative"),
     "zh": dict(x="拉伸比 λ", y="归一化残差 (Pᵢ − P̂ᵢ)/σᵢ", nh="新胡克模型，全部 16 个点", gt="Gent 模型，全部 16 个点",
                pos="十个正残差", neg="六个负残差")}[lang]
r_nh = fit_all["resid"]; r_g = (p_meas - p_gent(lam, *gent_all["theta"])) / sigma
print("".join("+" if r > 0 else "-" for r in r_nh), np.round(r_nh, 1), "max gent", np.abs(r_g).max().round(2))
fig, ax = figstyle.figure(7.2, 4.0, lang=lang)
for v in (-2, 2): ax.axhline(v, color=figstyle.MUTED, ls="--", lw=1.1)
ax.axhline(0, color=figstyle.NAVY, lw=1.1)
ax.plot(lam, r_nh, "s-", color=figstyle.ORANGE, ms=5, lw=1.6, label=T["nh"])
ax.plot(lam, r_g, "^-", color=figstyle.GREEN, ms=5, lw=1.6, label=T["gt"])
ax.axvline(lam[9] - 0.0125, color=figstyle.MUTED, ls=":", lw=1)   # between the 10th and 11th point
ax.set_xlim(1.0, 0.58)
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"])
ax.set_ylim(-4.8, 3.6)
ax.set_yticks([-4, -2, 0, 2])
ax.text(0.89, 3.25, T["pos"], color=figstyle.ORANGE, ha="center", va="center", fontsize=10.5)
ax.text(0.64, 1.2, T["neg"], color=figstyle.ORANGE, ha="center", va="center", fontsize=10.5)
ax.legend(loc="lower left", bbox_to_anchor=(0.0, 0.0), fontsize=10)
figstyle.save(fig, "fig-01-26", lang=lang)
