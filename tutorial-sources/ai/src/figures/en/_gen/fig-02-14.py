# Step decay, cosine, and warmup + cosine over 10,000 steps; the worked example's values are marked.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="step t", y="learning rate η (×10⁻³)", step="step decay (×0.1 at 5,000 and 7,500)", cos="cosine, no warmup", wc="500-step warmup + cosine"),
     "zh": dict(x="步数 t", y="学习率 η（×10⁻³）", step="阶梯衰减（在 5,000 和 7,500 步 ×0.1）", cos="余弦，无预热", wc="500 步预热 + 余弦")}[lang]
Tn, Tw, hi, lo = 10000, 500, 3e-3, 3e-5
t = np.arange(0, Tn + 1)
step = hi * np.where(t < 5000, 1, np.where(t < 7500, 0.1, 0.01))
cos = lo + 0.5 * (hi - lo) * (1 + np.cos(np.pi * t / Tn))
wc = np.where(t < Tw, hi * t / Tw, lo + 0.5 * (hi - lo) * (1 + np.cos(np.pi * np.clip(t - Tw, 0, None) / (Tn - Tw))))
for s, v in [(250, 1.5e-3), (5250, 1.515e-3), (10000, 3e-5)]: assert abs(wc[s] - v) < 1e-6, (s, wc[s])
k = 1e3
fig, ax = figstyle.figure(7.2, 3.8, lang=lang)
ax.plot(t, step * k, color=figstyle.ORANGE, label=T["step"], drawstyle="steps-post")
ax.plot(t, cos * k, color=figstyle.GREEN, label=T["cos"])
ax.plot(t, wc * k, color=figstyle.BLUE, label=T["wc"])
for s, off, ha in [(250, (10, -4), "left"), (5250, (10, 10), "left"), (10000, (-4, 24), "right")]:
    ax.plot([s], [wc[s] * k], "o", ms=7, mfc="white", mec=figstyle.BLUE, mew=2, zorder=6)
    lab = {250: "t = 250: 1.5", 5250: "t = 5,250: 1.515", 10000: "t = 10,000: 0.03"}[s]
    ax.annotate(lab, (s, wc[s] * k), xytext=off, textcoords="offset points", fontsize=10, color=figstyle.BLUE, ha=ha)
ax.set_xlim(-200, 10300); ax.set_ylim(0, 3.5)
ax.set_xticks([0, 2500, 5000, 7500, 10000]); ax.set_xticklabels(["0", "2,500", "5,000", "7,500", "10,000"])
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"]); ax.legend(loc="upper right", fontsize=10)
figstyle.save(fig, "fig-02-14", lang)
