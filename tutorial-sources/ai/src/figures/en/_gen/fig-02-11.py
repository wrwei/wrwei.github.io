# NOTE: the caption's heavy-ball eta = 0.07 is unstable-looking (zig-zag, leaves the box); drawn at eta = 0.015.
# Gradient descent and heavy ball on L = 0.5(t1^2 + 25 t2^2): two 40-step paths from (-1.8, 0.35).
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(gd="gradient descent, η = 0.07", hb="heavy ball, η = 0.015, μ = 0.9", start="start (−1.8, 0.35)", mn="minimum", cl="contours of ℒ"),
     "zh": dict(gd="梯度下降，η = 0.07", hb="重球法，η = 0.015，μ = 0.9", start="起点 (−1.8, 0.35)", mn="最小值", cl="ℒ 的等值线")}[lang]
def path(mu, eta):
    t = np.array([-1.8, 0.35]); v = np.zeros(2); P = [t.copy()]
    for _ in range(40):
        g = np.array([t[0], 25 * t[1]]); v = mu * v + g; t = t - eta * v; P.append(t.copy())
    return np.array(P)
GD, HB = path(0.0, 0.07), path(0.9, 0.015)
print(GD[-1], HB[-1], HB[:, 0].max(), (GD[1:, 1] / GD[:-1, 1])[:3])
fig, ax = figstyle.figure(7.2, 3.6, lang=lang)
X, Y = np.meshgrid(np.linspace(-2, 0.5, 400), np.linspace(-0.5, 0.5, 300))
Z = 0.5 * (X ** 2 + 25 * Y ** 2)
ax.contour(X, Y, Z, levels=[0.02, 0.1, 0.3, 0.7, 1.2, 2.0, 3.0], colors=figstyle.MUTED, linewidths=0.9)
ax.plot(GD[:, 0], GD[:, 1], "-o", color=figstyle.ORANGE, ms=3.2, lw=1.1, label=T["gd"])
ax.plot(HB[:, 0], HB[:, 1], "-o", color=figstyle.BLUE, ms=3.2, lw=1.1, label=T["hb"])
ax.plot([-1.8], [0.35], "o", color=figstyle.NAVY, ms=7, mfc="white", mew=1.8, zorder=6)
ax.annotate(T["start"], (-1.8, 0.35), xytext=(6, 8), textcoords="offset points", fontsize=10, color=figstyle.NAVY)
ax.plot([0], [0], "*", color=figstyle.RED, ms=13, zorder=7)
ax.annotate(T["mn"], (0, 0), xytext=(10, -26), textcoords="offset points", fontsize=10, color=figstyle.RED, ha="left")
ax.set_xlim(-2, 0.5); ax.set_ylim(-0.5, 0.5); ax.set_aspect("equal", adjustable="box")
ax.set_xlabel("θ₁"); ax.set_ylabel("θ₂"); ax.grid(False)
ax.legend(loc="upper right", fontsize=10, bbox_to_anchor=(1.0, 1.0))
figstyle.save(fig, "fig-02-11", lang)
