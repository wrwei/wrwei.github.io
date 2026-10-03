# Decision boundaries of the Section 13 circle network and of logistic regression on the same standardised inputs.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", ".."))); sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import numpy as np, torch, figstyle, _m02c
from sklearn.linear_model import LogisticRegression
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(t1="trained network", t2="logistic regression", inside="inside the circle (positive)", outside="outside (negative)",
                nn="contour p̂ = 0.5", true="true circle, radius √0.5", note="59.2% = majority class",
                acc="validation accuracy 99.6%", noline="no boundary inside\nthe square: predicts\n“outside” everywhere", x="x₁", y="x₂"),
     "zh": dict(t1="训练后的网络", t2="逻辑回归", inside="圆内（正类）", outside="圆外（负类）",
                nn="p̂ = 0.5 的等值线", true="真实圆，半径 √0.5", note="59.2% = 多数类的占比",
                acc="验证准确率 99.6%", noline="方形内没有决策边界：\n处处预测“圆外”", x="x₁", y="x₂")}[lang]
model, norm, Xva, Tva, Xtr, Ttr, acc = _m02c.circle()
assert abs(acc - 0.996) < 0.001
lr = LogisticRegression().fit(norm(Xtr).numpy(), Ttr.numpy())
lacc = lr.score(norm(Xva).numpy(), Tva.numpy()); print("logreg acc", lacc, "majority", 1 - Tva.float().mean().item(), "coef", lr.coef_, lr.intercept_)
assert abs(lacc - 0.592) < 0.001
g = np.linspace(-1, 1, 401); GX, GY = np.meshgrid(g, g); G = torch.tensor(np.c_[GX.ravel(), GY.ravel()], dtype=torch.float32)
with torch.no_grad(): P = torch.softmax(model(norm(G)), 1)[:, 1].numpy().reshape(GX.shape)
PL = lr.predict_proba(norm(G).numpy())[:, 1].reshape(GX.shape); print("logreg p range", PL.min(), PL.max())
fig, axs = figstyle.figure(7.2, 4.1, ncols=2, lang=lang)
X = Xva.numpy(); t = Tva.numpy().astype(bool)
th = np.linspace(0, 2 * np.pi, 400)
for ax in axs:
    ax.scatter(X[~t, 0], X[~t, 1], s=9, color=figstyle.ORANGE, alpha=.75, lw=0, label=T["outside"])
    ax.scatter(X[t, 0], X[t, 1], s=9, color=figstyle.BLUE, alpha=.75, lw=0, label=T["inside"])
    ax.set_xlim(-1, 1); ax.set_ylim(-1, 1); ax.set_aspect("equal"); ax.set_xticks([-1, -.5, 0, .5, 1]); ax.set_yticks([-1, -.5, 0, .5, 1])
    ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"])
    ax.spines["top"].set_visible(True); ax.spines["right"].set_visible(True)
axs[0].contour(GX, GY, P, levels=[.5], colors=[figstyle.GREEN], linewidths=3.4, zorder=3)
axs[0].plot([], [], color=figstyle.GREEN, lw=3.4, label=T["nn"])
axs[0].plot(np.sqrt(.5) * np.cos(th), np.sqrt(.5) * np.sin(th), color=figstyle.NAVY, ls=(0, (5, 3)), lw=1.3, label=T["true"], zorder=4)

axs[0].set_title(f'{T["t1"]}: {T["acc"]}', fontsize=11)
if PL.min() < .5 < PL.max(): axs[1].contour(GX, GY, PL, levels=[.5], colors=[figstyle.RED], linewidths=2.2)
else: axs[1].text(0, 0, T["noline"], ha="center", va="center", fontsize=11, color=figstyle.RED, linespacing=1.3,
                  bbox=dict(fc="white", ec=figstyle.RED, boxstyle="round,pad=0.4", alpha=.92))
axs[1].set_title(T["t2"], fontsize=11)
axs[1].text(0, -0.8, T["note"], ha="center", va="center", fontsize=11, color=figstyle.RED, fontweight="bold", bbox=dict(fc="white", ec=figstyle.RED, boxstyle="round,pad=0.3", alpha=.95))
h, l = axs[0].get_legend_handles_labels()
fig.get_layout_engine().set(rect=(0, 0.13, 1, 0.87))
fig.legend(h, l, loc="lower center", ncol=2, fontsize=11, bbox_to_anchor=(0.5, 0.0), handletextpad=.4, columnspacing=2)
figstyle.save(fig, "fig-02-17", lang)
