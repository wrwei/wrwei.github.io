# Logistic regression (two blobs, decision line, p = 0.1/0.5/0.9 contours, weight vector) and softmax regression (three blobs).
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
from sklearn.linear_model import LogisticRegression
from matplotlib.colors import ListedColormap
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(c0="class 0", c1="class 1", db="w·x + b = 0", w="w", lt="Logistic regression: two classes", rt="Softmax regression: three classes",
                p="p̂ contours", cl=["class 0", "class 1", "class 2"]),
     "zh": dict(c0="类别 0", c1="类别 1", db="w·x + b = 0", w="w", lt="逻辑回归：两个类别", rt="softmax 回归：三个类别",
                p="p̂ 等值线", cl=["类别 0", "类别 1", "类别 2"])}[lang]
rng = np.random.default_rng(3)
n = 60
X2 = np.vstack([rng.normal([-1.2, -0.6], 0.9, (n, 2)), rng.normal([1.2, 0.8], 0.9, (n, 2))])
y2 = np.r_[np.zeros(n), np.ones(n)].astype(int)
m2 = LogisticRegression(C=1).fit(X2, y2)
w, b = m2.coef_[0], m2.intercept_[0]
cent = np.array([[-2.0, -1.2], [2.0, -0.8], [0.0, 2.0]])
X3 = np.vstack([rng.normal(c, 0.8, (n, 2)) for c in cent]); y3 = np.repeat([0, 1, 2], n)
m3 = LogisticRegression(C=100).fit(X3, y3)
cols = [figstyle.BLUE, figstyle.ORANGE, figstyle.GREEN]
fills = [figstyle.FILLS["blue"], figstyle.FILLS["orange"], figstyle.FILLS["green"]]
fig, (a, c) = figstyle.figure(7.2, 3.5, ncols=2, lang=lang)
lim = (-4.2, 4.2)
gx, gy = np.meshgrid(np.linspace(*lim, 300), np.linspace(*lim, 300))
G = np.c_[gx.ravel(), gy.ravel()]
zz = (G @ w + b).reshape(gx.shape)
a.contour(gx, gy, 1 / (1 + np.exp(-zz)), levels=[0.1, 0.9], colors=[figstyle.MUTED], linestyles="--", linewidths=1.2)
a.contour(gx, gy, zz, levels=[0], colors=[figstyle.NAVY], linewidths=2)
a.scatter(*X2[y2 == 0].T, s=16, color=cols[0], alpha=.75, label=T["c0"], zorder=3)
a.scatter(*X2[y2 == 1].T, s=16, color=cols[1], alpha=.75, label=T["c1"], zorder=3)
# weight vector from a point on the line, perpendicular to it
nrm = w / np.linalg.norm(w); p0 = -b * w / (w @ w)
a.annotate("", xy=p0 + 2.0 * nrm, xytext=p0, arrowprops=dict(arrowstyle="-|>", color=figstyle.PURPLE, lw=2), zorder=4)
a.text(*(p0 + 2.0 * nrm + [0.15, -0.45]), T["w"], color=figstyle.PURPLE, fontsize=12, fontweight="bold", style="italic", zorder=5)
# contour labels, horizontal, where each contour meets the top of the panel
tang = np.array([-nrm[1], nrm[0]])
if tang[1] < 0: tang = -tang
for lvl, name in [(0.1, "0.1"), (0.5, "0.5"), (0.9, "0.9")]:
    off = np.log(lvl / (1 - lvl)) / np.linalg.norm(w)
    q0 = p0 + off * nrm
    t = (3.75 - q0[1]) / tang[1]
    q = q0 + t * tang
    a.text(q[0], q[1], name, fontsize=9, color=figstyle.SLATE, ha="center", va="center", bbox=dict(fc="white", ec="none", pad=1), zorder=6)
q = p0 + (-3.0 - p0[1]) / tang[1] * tang
a.text(q[0] - 0.25, q[1], T["db"], fontsize=9, color=figstyle.NAVY, ha="right", va="center", bbox=dict(fc="white", ec="none", pad=1), zorder=6)
a.set_xlim(lim); a.set_ylim(lim); a.set_aspect("equal"); a.set_title(T["lt"]); a.set_xlabel("x₁"); a.set_ylabel("x₂")
a.text(4.1, 3.75, T["p"], ha="right", va="center", fontsize=9, color=figstyle.SLATE)
a.legend(loc="lower left", fontsize=9, frameon=True, facecolor="white", edgecolor="none", framealpha=0.9, markerscale=1.4, handletextpad=0.2)
pr = m3.predict(G).reshape(gx.shape)
c.contourf(gx, gy, pr, levels=[-0.5, 0.5, 1.5, 2.5], colors=fills)
c.contour(gx, gy, pr, levels=[0.5, 1.5], colors=[figstyle.NAVY], linewidths=1.8)
for k in range(3):
    c.scatter(*X3[y3 == k].T, s=16, color=cols[k], alpha=.8, label=T["cl"][k], zorder=3)
c.set_xlim(lim); c.set_ylim(lim); c.set_aspect("equal"); c.set_title(T["rt"]); c.set_xlabel("x₁"); c.grid(False)
c.legend(loc="lower right", fontsize=9, frameon=True, facecolor="white", edgecolor="none", framealpha=0.9)
figstyle.save(fig, "fig-01-9", lang)
