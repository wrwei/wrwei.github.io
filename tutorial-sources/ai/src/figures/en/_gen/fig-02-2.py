import sys, os
sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np
import figstyle
from figstyle import *
L = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(top="sin 3x and its 6-segment interpolant", f="sin 3x", p="interpolant p(x)", knots="knots xₖ (7)",
                err="max error 0.122", bot="hinges cₖ ReLU(x − xₖ)", x="x", y="value"),
     "zh": dict(top="sin 3x 及其 6 段分段线性插值", f="sin 3x", p="插值 p(x)", knots="节点 xₖ（7 个）",
                err="最大误差 0.122", bot="铰链函数 cₖ ReLU(x − xₖ)", x="x", y="取值")}[L]
K = 6
xk = np.linspace(-1, 1, K + 1)
f = lambda x: np.sin(3 * x)
s = np.diff(f(xk)) / np.diff(xk)
c = np.concatenate([[s[0]], np.diff(s)])
c[3] = 0.0
xs = np.linspace(-1, 1, 20001)
p = f(xk[0]) + sum(c[k] * np.maximum(xs - xk[k], 0) for k in range(K))
err = np.abs(f(xs) - p)
imax = err.argmax()
print("max err", err.max(), "c", np.round(c, 3), "at", xs[imax])
assert abs(err.max() - 0.122) < 5e-4
fig, (a1, a2) = figstyle.figure(7.2, 6.0, nrows=2, lang=L)
a1.plot(xs, f(xs), color=BLUE, label=T["f"])
a1.plot(xs, p, color=ORANGE, ls="--", lw=1.8, label=T["p"])
a1.plot(xk, f(xk), "o", color=NAVY, ms=5, zorder=5, label=T["knots"])
xm = xs[imax]
ym = (p[imax] + f(xs)[imax]) / 2
a1.plot([xm, xm], [p[imax], f(xs)[imax]], color=RED, lw=3, zorder=6, solid_capstyle="butt")
a1.annotate(T["err"], xy=(xm, ym), xytext=(xm + 0.22, -1.32), color=RED, fontsize=11, ha="left", va="center",
            arrowprops=dict(arrowstyle="-", color=RED, lw=0.9))
a1.set_ylabel("y"); a1.set_xlim(-1.05, 1.05); a1.set_ylim(-1.5, 1.3)
a1.legend(loc="upper left", ncol=1, fontsize=10)
cols = [BLUE, ORANGE, GREEN, PURPLE, RED, SKY]
for k in range(K):
    ck = c[k]
    cs = f"{ck:.3f}".replace("-", "−") if k != 3 else "0"
    a2.plot(xs, ck * np.maximum(xs - xk[k], 0), color=cols[k], label=f"k = {k}:  c{chr(0x2080+k)} = {cs}")
a2.plot(xk[:K], np.zeros(K), "o", color=NAVY, ms=4, zorder=5)
a2.set_xlabel(T["x"]); a2.set_ylabel(T["y"])
a2.set_xlim(-1.05, 1.05)
a2.legend(loc="upper center", bbox_to_anchor=(0.5, -0.28), ncol=3, fontsize=10)
a1.set_title(T["top"], loc="left", fontsize=11)
a2.set_title(T["bot"], loc="left", fontsize=11)
print(figstyle.save(fig, "fig-02-2", lang=L))
