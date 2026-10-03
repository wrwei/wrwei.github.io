# Reliability diagram of Lab 2's logistic regression (breast cancer, 143 test cases, 5 bins), inset: bin counts.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(x="mean predicted probability in the bin", y="fraction of malignant cases in the bin", diag="perfect calibration",
                model="logistic regression", title="Reliability diagram, 5 bins, 143 test cases, ECE 0.023",
                inset="cases per bin", below="too high", above="too low"),
     "zh": dict(x="分箱内的平均预测概率", y="分箱内恶性病例的比例", diag="完美校准", model="逻辑回归",
                title="可靠性图，5 个分箱，143 个测试病例，ECE 0.023", inset="每箱病例数", below="概率偏高", above="概率偏低")}[lang]
data = load_breast_cancer(); y_all = 1 - data.target
X_tr, X_te, y_tr, y_te = train_test_split(data.data, y_all, test_size=0.25, stratify=y_all, random_state=0)
mu, sd = X_tr.mean(0), X_tr.std(0)
m = LogisticRegression(C=1.0, tol=1e-8, max_iter=10000).fit((X_tr - mu) / sd, y_tr)
p = m.predict_proba((X_te - mu) / sd)[:, 1]
edges = np.linspace(0, 1, 6); idx = np.clip(np.digitize(p, edges[1:-1]), 0, 4)
rows = np.array([(p[idx == b].mean(), y_te[idx == b].mean(), (idx == b).sum()) for b in range(5)])
ece = sum(r[2] / len(p) * abs(r[1] - r[0]) for r in rows)
print(rows.round(3).tolist(), round(ece, 3))
assert [int(r[2]) for r in rows] == [82, 7, 4, 3, 47] and round(ece, 3) == 0.023
fig, ax = figstyle.figure(5.2, 4.8, lang=lang)
ax.plot([0, 1], [0, 1], "--", color=figstyle.NAVY, lw=1.2, label=T["diag"])
ax.plot(rows[:, 0], rows[:, 1], "o-", color=figstyle.BLUE, ms=7, label=T["model"])
for mp, fr, n in rows:
    off = {82: (8, -4), 7: (8, -4), 4: (8, -4), 3: (10, -15), 47: (9, -4)}[int(n)]
    ax.annotate(f"n = {int(n)}", (mp, fr), textcoords="offset points", xytext=off, fontsize=9.5, color=figstyle.SLATE, ha="left")
ax.set_xlim(-0.03, 1.13); ax.set_xticks([0, 0.2, 0.4, 0.6, 0.8, 1.0]); ax.set_ylim(-0.05, 1.08)
ax.set_xlabel(T["x"]); ax.set_ylabel(T["y"]); ax.set_title(T["title"], fontsize=11)
ax.legend(loc="upper left", fontsize=10)
ins = ax.inset_axes([0.58, 0.12, 0.38, 0.22])
ins.bar(range(5), rows[:, 2], color=figstyle.FILLS["blue"], edgecolor=figstyle.BLUE, width=0.8)
for i, n in enumerate(rows[:, 2]):
    ins.text(i, n + 3, str(int(n)), ha="center", va="bottom", fontsize=9, color=figstyle.NAVY)
ins.set_ylim(0, 112); ins.set_xticks(range(5)); ins.set_xticklabels(["0.1", "0.3", "0.5", "0.7", "0.9"], fontsize=8.5)
ins.set_yticks([]); ins.grid(False); ins.spines["left"].set_visible(False)
ins.set_title(T["inset"], fontsize=9, color=figstyle.SLATE, pad=2)
ins.patch.set_alpha(0.9)
figstyle.save(fig, "fig-01-12", lang)
