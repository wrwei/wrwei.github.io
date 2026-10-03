# Sigmoid and its derivative; cross-entropy vs squared error through the sigmoid (y = 0).
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(sig="σ(z)", der="σ(z)(1 − σ(z))", peak="peak 0.25 at z = 0", ce="cross-entropy  softplus(z)",
                se="squared error  ½σ(z)²", slope="slope 1", level="levels off at 0.5", wrong="confidently wrong",
                lt="Sigmoid and its derivative", rt="Loss of one example with y = 0", yl="loss", xl="z (logit)"),
     "zh": dict(sig="σ(z)", der="σ(z)(1 − σ(z))", peak="z = 0 处峰值 0.25", ce="交叉熵  softplus(z)",
                se="平方误差  ½σ(z)²", slope="斜率为 1", level="趋于 0.5", wrong="自信地错",
                lt="sigmoid 及其导数", rt="y = 0 时单个样本的损失", yl="损失", xl="z（logit）")}[lang]
z = np.linspace(-6, 6, 601)
s = 1 / (1 + np.exp(-z))
fig, (a, b) = figstyle.figure(7.2, 3.5, ncols=2, lang=lang)
a.plot(z, s, color=figstyle.BLUE, label=T["sig"])
a.plot(z, s * (1 - s), color=figstyle.ORANGE, label=T["der"])
a.plot([0], [0.25], "o", color=figstyle.ORANGE, ms=5)
a.annotate(T["peak"], (0, 0.25), xytext=(0.6, 0.36), color=figstyle.ORANGE, fontsize=10,
           arrowprops=dict(arrowstyle="-", color=figstyle.ORANGE, lw=1))
a.set_xticks(range(-6,7,2)); a.set_xlabel(T["xl"]); a.set_ylim(-0.03, 1.05); a.set_title(T["lt"]); a.legend(loc="center left", bbox_to_anchor=(0.0, 0.62))
sp = np.logaddexp(0, z)
b.axvspan(4, 6, color=figstyle.FILLS["red"], zorder=0)
b.text(5.0, 0.9, T["wrong"], ha="center", va="bottom", color=figstyle.RED, fontsize=10, rotation=90)
b.plot(z, sp, color=figstyle.BLUE, label=T["ce"])
b.plot(z, 0.5 * s**2, color=figstyle.ORANGE, label=T["se"])
b.text(2.4, 1.3, T["slope"], color=figstyle.BLUE, fontsize=10, ha="left")
b.text(-5.8, 0.62, T["level"], color=figstyle.ORANGE, fontsize=10, va="bottom")
b.axhline(0.5, color=figstyle.ORANGE, lw=0.8, ls=":")
b.set_xticks(range(-6,7,2)); b.set_xlim(-6, 6); b.set_ylim(-0.1, 6.3); b.set_xlabel(T["xl"]); b.set_ylabel(T["yl"]); b.set_title(T["rt"])
b.legend(loc="upper left", bbox_to_anchor=(0.0, 1.0))
figstyle.save(fig, "fig-01-8", lang)
