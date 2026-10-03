# Approximate 95% confidence ellipses for the Gent parameters (c1, beta), Lab 5.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", ".."))); sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import numpy as np, figstyle
from scipy.stats import chi2
from _lab5 import *
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="c₁ (kPa)", y="β", a="strains to 20% (8 points)", b="strains to 40% (16 points)", nh="β = 0: neo-Hookean", tv="true value"),
     "zh": dict(x="c₁（kPa）", y="β", a="应变至 20%（8 个点）", b="应变至 40%（16 个点）", nh="β = 0：新胡克模型", tv="真值")}[lang]
def ellipse(th, cov, level=0.95, n=300):
    vals, vecs = np.linalg.eigh(cov); a = np.linspace(0, 2 * np.pi, n)
    return th[:, None] + np.sqrt(chi2.ppf(level, 2)) * vecs @ (np.sqrt(vals)[:, None] * np.stack([np.cos(a), np.sin(a)]))
print(gent_20["theta"], np.sqrt(np.diag(gent_20["cov"])), gent_all["theta"], np.sqrt(np.diag(gent_all["cov"])))
fig, ax = figstyle.figure(7.2, 4.4, lang=lang)
ax.axhline(0, color=figstyle.NAVY, lw=1.5, ls="--")
for f, c, lab, m in ((gent_20, figstyle.ORANGE, T["a"], "o"), (gent_all, figstyle.BLUE, T["b"], "s")):
    xy = ellipse(f["theta"], f["cov"])
    ax.fill(xy[0], xy[1], color=c, alpha=.15, lw=0)
    ax.plot(xy[0], xy[1], color=c, lw=2, label=lab)
    ax.plot(*f["theta"], m, color=c, ms=5)
ax.plot(10.0, 0.2, "*", color=figstyle.NAVY, ms=12, label=T["tv"], zorder=5)
ax.text(ax.get_xlim()[0] + 0.1, 0.012, T["nh"], color=figstyle.NAVY, va="bottom", fontsize=10.5)
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"])
ax.legend(loc="upper right")
figstyle.save(fig, "fig-01-27", lang=lang)
