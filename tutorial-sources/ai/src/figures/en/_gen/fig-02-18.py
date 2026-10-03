# Four representative training curves (synthetic, seeded) with the global gradient norm on a twin axis.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(a="(a) Healthy: no action needed", b="(b) Learning rate too high:\nlower η, add warmup, clip", c="(c) Overfitting:\nearly stopping, regularise",
                d="(d) No learning:\ncheck gradient flow, then η",
                tl="train loss", vl="validation loss", gn="gradient norm (right axis)", ep="epoch", loss="loss", gl="‖g‖",
                nan="NaN", turn="validation turns up (epoch 22)", ln="ln 10 = 2.30", spike="gradient spikes first"),
     "zh": dict(a="(a) 健康：无需处理", b="(b) 学习率过大：\n降低 η、加预热、裁剪", c="(c) 过拟合：\n早停、加正则化",
                d="(d) 没有在学习：\n先查梯度是否到达，再查 η",
                tl="训练损失", vl="验证损失", gn="梯度范数（右轴）", ep="轮次", loss="损失", gl="‖g‖",
                nan="NaN", turn="验证损失转而上升（第 22 轮）", ln="ln 10 = 2.30", spike="梯度先飙升")}[lang]
rng = np.random.default_rng(3)
nz = lambda n, s: np.exp(rng.normal(0, s, n))
BL, OR, GR = figstyle.BLUE, figstyle.ORANGE, figstyle.PURPLE
fig, axs = figstyle.figure(7.2, 5.2, ncols=2, nrows=2, lang=lang)
fig.get_layout_engine().set(rect=(0, 0.07, 1, 0.93), h_pad=0.08, w_pad=0.05)
def panel(ax, e, tr, va, g, title, glim, gticks):
    ax.plot(e, tr, color=BL, lw=1.8); ax.plot(e, va, color=OR, lw=1.8)
    ax.set_yscale("log"); ax.set_title(title, fontsize=11, loc="left"); ax.set_xlabel(T["ep"]); ax.minorticks_off()
    a2 = ax.twinx(); a2.plot(e, g, color=GR, lw=1.0, alpha=.85); a2.set_yscale("log"); a2.set_ylim(*glim)
    a2.set_yticks(gticks); a2.grid(False); a2.minorticks_off(); a2.spines["right"].set_visible(True); a2.spines["right"].set_color(figstyle.MUTED)
    a2.tick_params(axis="y", colors=GR, labelsize=11); a2.set_zorder(0); ax.set_zorder(1); ax.patch.set_visible(False)
    return a2
fmt = lambda a, ts: (a.set_yticks(ts), a.set_yticklabels([f"{t:g}" for t in ts]))
# (a) healthy
e = np.arange(1, 61)
tr = (2.3 * np.exp(-e / 7) + 0.004) * nz(60, .03); va = (0.115 + 1.6 * np.exp(-e / 5)) * nz(60, .008)
g = (1.2 * np.exp(-e / 14) + 0.02) * nz(60, .12)
ax = axs[0, 0]; a2 = panel(ax, e, tr, va, g, T["a"], (5e-3, 3), [0.01, 0.1, 1]); a2.set_yticklabels(["1e-2", "1e-1", "1"]); ax.set_ylim(2e-3, 4); fmt(ax, [0.01, 0.1, 1]); ax.set_ylabel(T["loss"])
# (b) too high
tr = np.array([2.3, 1.3, .8, .55, .42, .36, .33, .38, 3.2, 1.1, .9, 6., 60., 500., 5000.])
va = tr * 1.12; e1 = np.arange(1, len(tr) + 1)
g = np.array([1.0, .8, .65, .55, .5, .6, 1.5, 30., 250., 60., 20., 400., 3000., 5e4, 1e6])
ax = axs[0, 1]; a2 = panel(ax, e1, tr, va, g, T["b"], (0.3, 3e6), [1, 1e3, 1e6]); ax.set_ylim(0.2, 5e4); ax.set_xlim(0, 18); ax.set_yticks([1, 100, 1e4]); ax.set_yticklabels(["1", "100", "1e4"])
a2.set_yticklabels(["1", "1e3", "1e6"])
ax.plot([16], [2e4], marker="X", color=figstyle.RED, ms=11, zorder=6, ls="none")
ax.annotate(T["nan"], (16, 2e4), textcoords="offset points", xytext=(-9, -4), ha="right", fontsize=11, color=figstyle.RED, fontweight="bold")
# (c) overfitting
e = np.arange(1, 61)
tr = (2.2 * np.exp(-e / 5.5) + 0.0015) * nz(60, .03)
va = (0.27 + 0.0 * e + 1.9 * np.exp(-e / 4) + np.clip(e - 22, 0, None) * 0.012) * nz(60, .01)
g = (1.0 * np.exp(-e / 10) + 0.01) * nz(60, .12)
ax = axs[1, 0]; a2 = panel(ax, e, tr, va, g, T["c"], (3e-3, 20), [0.01, 0.1, 1]); a2.set_yticklabels(["1e-2", "1e-1", "1"]); ax.set_ylim(1e-3, 5); fmt(ax, [0.001, 0.01, 0.1, 1]); ax.set_ylabel(T["loss"])
ax.axvline(22, color=figstyle.GREEN, lw=1.2, ls=(0, (4, 3))); ax.plot([22], [va[21]], "o", color=figstyle.GREEN, ms=6, zorder=6)
ax.text(25, 2.0, T["turn"].replace(" (", "\n(").replace("（", "\n（"), fontsize=11, color=figstyle.GREEN, va="center")
# (d) no learning
e = np.arange(1, 61)
tr = 2.3026 * (1 + rng.normal(0, .002, 60)); va = 2.3026 * (1 + rng.normal(0, .002, 60)) + .004
g = 3e-5 * nz(60, .25)
ax = axs[1, 1]; a2 = panel(ax, e, tr, va, g, T["d"], (1e-7, 1e-1), [1e-6, 1e-4, 1e-2]); ax.set_ylim(0.1, 10); fmt(ax, [0.1, 1, 10])
ax.axhline(np.log(10), color=figstyle.MUTED, lw=1, ls=(0, (3, 3)), zorder=0)
ax.text(2, 4.2, T["ln"], fontsize=11, color=figstyle.SLATE, va="center")
a2.set_yticklabels(["1e-6", "1e-4", "1e-2"])
from matplotlib.lines import Line2D
leg = [Line2D([], [], color=BL, lw=2), Line2D([], [], color=OR, lw=2), Line2D([], [], color=GR, lw=1)]
fig.legend(leg, [T["tl"], T["vl"], T["gn"]], loc="lower center", ncol=3, fontsize=11, bbox_to_anchor=(0.5, 0.0), columnspacing=2, handlelength=1.8)
figstyle.save(fig, "fig-02-18", lang)
