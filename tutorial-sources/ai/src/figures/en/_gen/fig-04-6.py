# Figure 4.6: a cliff in the loss of a recurrent network, clipped vs unclipped step.  python fig-04-6.py en|zh
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np
import figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
L = {"en": dict(x="one recurrent parameter  \u03b8", y="loss", valley="gently sloping valley", cliff="cliff",
                start="start", un="unclipped step: lands at \u03b8 \u2248 {t:.1f}, off the plot",
                cl="clipped step, same direction,\nlength bounded: stays in the valley"),
     "zh": dict(x="某个循环参数  \u03b8", y="损失", valley="缓坡山谷", cliff="悬崖",
                start="起点", un="未裁剪的步：落在 \u03b8 \u2248 {t:.1f}，已出图", cl="裁剪后的步：方向不变，\n长度有界，仍在谷中")}[lang]
def loss(t): return 0.15 + 0.05 * (t + 1.2) ** 2 + 2.5 / (1 + np.exp(-30 * (t - 0.8)))
def grad(t):
    s = 1 / (1 + np.exp(-30 * (t - 0.8)))
    return 0.1 * (t + 1.2) + 2.5 * 30 * s * (1 - s)
t0, lr, c = 0.76, 0.5, 1.2          # start at the foot of the wall; clip the gradient norm to c
g = grad(t0)
t_un = t0 - lr * g
t_cl = t0 - lr * np.sign(g) * min(abs(g), c)
print("g", g, "unclipped", t_un, "clipped", t_cl)
fig, ax = figstyle.figure(7.2, 3.7, lang=lang)
x = np.linspace(-2.6, 1.4, 600)
ax.plot(x, loss(x), color=figstyle.NAVY, lw=2.2)
ax.set_xlim(-2.6, 1.4); ax.set_ylim(0, 3.2)
ax.set_xlabel(L["x"]); ax.set_ylabel(L["y"])
ax.plot([t0], [loss(t0)], "o", color=figstyle.BLUE, ms=8, zorder=5)
ax.annotate(L["start"], (t0, loss(t0)), xytext=(t0 + 0.12, loss(t0) - 0.5), color=figstyle.BLUE, fontsize=11, ha="left",
            arrowprops=dict(arrowstyle="-", color=figstyle.BLUE, lw=1))
# unclipped: leaves the plot on the left
ax.annotate("", xy=(-2.55, 1.9), xytext=(t0, loss(t0)),
            arrowprops=dict(arrowstyle="-|>", color=figstyle.RED, lw=2, connectionstyle="arc3,rad=0.25", shrinkA=6, shrinkB=0))
ax.text(-2.5, 2.2, L["un"].format(t=t_un), color=figstyle.RED, fontsize=10.5, ha="left", va="bottom")
# clipped: stays in the valley
ax.annotate("", xy=(t_cl, loss(t_cl)), xytext=(t0, loss(t0)),
            arrowprops=dict(arrowstyle="-|>", color=figstyle.GREEN, lw=2.2, connectionstyle="arc3,rad=-0.35", shrinkA=6, shrinkB=3))
ax.plot([t_cl], [loss(t_cl)], "o", color=figstyle.GREEN, ms=8, zorder=5)
ax.text(-0.45, 0.78, L["cl"], color=figstyle.GREEN, fontsize=10.5, ha="center", va="bottom")
ax.text(-1.75, 0.42, L["valley"], color=figstyle.SLATE, fontsize=10.5, ha="center")
ax.text(1.05, 1.5, L["cliff"], color=figstyle.SLATE, fontsize=10.5, ha="left")
figstyle.save(fig, "fig-04-6", lang)
