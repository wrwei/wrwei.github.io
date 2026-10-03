# Left: inverted dropout on a four-unit layer (the worked example's numbers); right: Lab 4's early-stopping run.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", ".."))); sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import numpy as np, figstyle, _m02c
import matplotlib.pyplot as plt
from matplotlib.patches import Circle, FancyBboxPatch
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(train="training, p = 0.5", ev="evaluation", x2="×2", noscale="all units present, no scaling", drop="dropped",
                tl="train loss", vl="validation loss", ep="epoch", loss="loss (log scale)", best="best epoch 34\nval loss 0.116",
                pat="patience\n(epochs 35–49)", tend="train loss 0.002", h="h = (2.0, 0.5, 1.0, 3.0)"),
     "zh": dict(train="训练，p = 0.5", ev="评估", x2="×2", noscale="全部单元保留，不缩放", drop="被丢弃",
                tl="训练损失", vl="验证损失", ep="轮次（epoch）", loss="损失（对数坐标）", best="最佳轮次 34\n验证损失 0.116",
                pat="耐心窗口\n（第 35–49 轮）", tend="训练损失 0.002", h="h = (2.0, 0.5, 1.0, 3.0)")}[lang]
hist, best = _m02c.lab4_history()
assert best[1] == 34 and len(hist) == 49 and abs(best[0] - 0.1159) < 5e-4 and round(hist[-1, 0], 3) in (0.002, 0.001, 0.0016)
fig = plt.figure(figsize=(7.2, 3.7)); figstyle.apply(lang)
fig = plt.figure(figsize=(7.2, 3.7), constrained_layout=False)
axL = fig.add_axes([0.01, 0.04, 0.40, 0.90]); axR = fig.add_axes([0.54, 0.17, 0.44, 0.72])
axL.set_xlim(0, 10); axL.set_ylim(0, 10); axL.axis("off"); axL.set_aspect("equal")
xs = [1.5, 3.8, 6.1, 8.4]; vals = [2.0, 0.5, 1.0, 3.0]; N = figstyle.NAVY
def row(y, label, mode):
    axL.text(0.1, y + 1.75, label, fontsize=11, color=N, fontweight="bold", va="center")
    for i, (x, v) in enumerate(zip(xs, vals)):
        dead = mode == "train" and i in (1, 3)
        fc = "#FEF2F2" if dead else figstyle.FILLS["blue"]; ec = figstyle.RED if dead else figstyle.BLUE
        axL.add_patch(Circle((x, y), 0.95, fc=fc, ec=ec, lw=1.6, ls="--" if dead else "-"))
        if dead:
            axL.plot([x - .6, x + .6], [y - .6, y + .6], color=figstyle.RED, lw=1.8); axL.plot([x - .6, x + .6], [y + .6, y - .6], color=figstyle.RED, lw=1.8)
        elif mode == "train":
            axL.text(x, y, f"{2*v:.1f}", fontsize=11, ha="center", va="center", color=N, fontweight="bold")
            axL.text(x, y - 1.55, T['x2'], fontsize=11, ha="center", va="center", color=figstyle.BLUE, fontweight="bold")
        else:
            axL.text(x, y, f"{v:.1f}", fontsize=11, ha="center", va="center", color=N, fontweight="bold")
row(7.3, T["train"], "train"); row(2.2, T["ev"], "eval")
axL.text(5, 0.1, T["noscale"], fontsize=11, ha="center", va="center", color=figstyle.SLATE)
axL.text(5, 9.9, T["h"], fontsize=11, ha="center", va="center", color=figstyle.SLATE)
# right
e = np.arange(1, len(hist) + 1)
axR.axvspan(35, 49, color=figstyle.FILLS["amber"], zorder=0); axR.axvspan(35, 49, fill=False, hatch="///", ec="#F5D9A8", lw=0, zorder=0)
axR.plot(e, hist[:, 0], color=figstyle.BLUE, label=T["tl"]); axR.plot(e, hist[:, 1], color=figstyle.ORANGE, label=T["vl"])
axR.axvline(34, color=figstyle.GREEN, lw=1.3, ls=(0, (4, 3)))
axR.plot([34], [best[0]], "o", color=figstyle.GREEN, ms=7, zorder=5)
axR.set_yscale("log"); axR.set_xlim(0, 51); axR.set_ylim(1e-3, 40); axR.set_xlabel(T["ep"]); axR.set_ylabel(T["loss"])
axR.set_yticks([1e-3, 1e-2, 1e-1, 1]); axR.set_yticklabels(["0.001", "0.01", "0.1", "1"]); axR.minorticks_off()
axR.text(32.5, 0.42, T["best"], ha="right", va="center", fontsize=11, color=figstyle.GREEN)
axR.text(42, 0.42, T["pat"], ha="center", va="center", fontsize=11, color=figstyle.AMBER, bbox=dict(fc="white", ec="none", alpha=.85, pad=1.5))
axR.legend(loc="upper center", ncol=1, fontsize=11, bbox_to_anchor=(0.36, 1.0), columnspacing=1.2, handlelength=1.5)
figstyle.save(fig, "fig-02-16", lang)
