# Gradient descent on a 2-D quadratic, kappa = 10, eigenvectors rotated 30 degrees.
import sys
sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np
import figstyle
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(leg="step size, (factor steep, factor flat)", fl="factors", conv="smooth, creeps along the valley",
                zig="zig-zags while converging", div="bounces outward, diverges", start="start", opt="minimum"),
     "zh": dict(leg="学习率，（陡方向因子，平缓方向因子）", fl="因子", conv="平滑，沿山谷缓行",
                zig="来回震荡但收敛", div="向外弹开，发散", start="起点", opt="最小值")}[LANG]
lmax, lmin = 1.0, 0.1
th = np.deg2rad(30)
flat = np.array([np.cos(th), np.sin(th)])      # eigenvector of lmin
steep = np.array([-np.sin(th), np.cos(th)])    # eigenvector of lmax
Q = np.stack([flat, steep], axis=1)
H = Q @ np.diag([lmin, lmax]) @ Q.T
e0 = Q @ np.array([2.0, 0.5])
def path(eta, n):
    p = [e0]
    for _ in range(n):
        p.append(p[-1] - eta * H @ p[-1])
    return np.array(p)
fig, ax = figstyle.figure(width=7.2, height=6.0, lang=LANG)
L = 3.0
g = np.linspace(-L, L, 400)
X, Y = np.meshgrid(g, g)
Z = 0.5 * (H[0, 0] * X**2 + 2 * H[0, 1] * X * Y + H[1, 1] * Y**2)
ax.contour(X, Y, Z, levels=[0.1, 0.3, 0.6, 1.0, 1.5, 2.1], colors=figstyle.MUTED, linewidths=1.0)
ax.grid(False)
runs = [(0.5, 14, figstyle.BLUE, "o"), (1.8, 14, figstyle.GREEN, "s"), (2.1, 18, figstyle.RED, "^")]
for f, n, c, m in runs:
    p = path(f / lmax, 40 if f < 2 else n)
    lab = f"η = {f}/λmax   ({1 - f * lmax:.1f}, {1 - f * lmin:.2f})".replace("(-", "(−")
    ax.plot(p[:, 0], p[:, 1], "-", color=c, marker=m, ms=4, lw=1.6, label=lab, clip_on=True)
ax.plot(*e0, "o", color=figstyle.NAVY, ms=7, zorder=5)
ax.annotate(T["start"], e0, xytext=(8, 6), textcoords="offset points", color=figstyle.NAVY, fontsize=11)
ax.plot(0, 0, "*", color=figstyle.NAVY, ms=13, zorder=5)
ax.annotate("w*", (0, 0), xytext=(-22, 8), textcoords="offset points", color=figstyle.NAVY, fontsize=12, fontstyle="italic")
ax.set_xlim(-L, L); ax.set_ylim(-L, L); ax.set_aspect("equal")
ax.set_xlabel("w₁"); ax.set_ylabel("w₂")
leg = fig.legend(title=T["leg"], loc="outside lower center", fontsize=10, title_fontsize=10, frameon=True, facecolor="white", edgecolor=figstyle.BORDER)
figstyle.save(fig, "fig-01-4", lang=LANG)
