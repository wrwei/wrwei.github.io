# Bootstrap distributions (Lab 4, block 7-8): 2,000 replicates, logistic regression vs 15-NN on 143 test cases.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, figstyle
from scipy.stats import binomtest
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(lt="Replicate accuracies", rt="Paired difference (logistic − 15-NN)", xa="accuracy on a resample", xd="accuracy difference on a resample",
                y="replicates", lr="logistic regression", kn="15-NN", ci="95% interval", zero="0",
                note="discordant cases: 5 and 0\nMcNemar exact p = 0.0625"),
     "zh": dict(lt="重复抽样的准确率", rt="配对差值（逻辑回归 − 15-NN）", xa="重抽样的准确率", xd="重抽样的准确率之差",
                y="重复次数", lr="逻辑回归", kn="15-NN", ci="95% 区间", zero="0",
                note="不一致的样本：5 和 0\nMcNemar 精确检验 p = 0.0625")}[lang]
data = load_breast_cancer(); y_all = 1 - data.target
Xtr, Xte, ytr, yte = train_test_split(data.data, y_all, test_size=0.25, random_state=0, stratify=y_all)
A = make_pipeline(StandardScaler(), LogisticRegression(C=1)).fit(Xtr, ytr)
B = make_pipeline(StandardScaler(), KNeighborsClassifier(15)).fit(Xtr, ytr)
oa = (A.predict(Xte) == yte).astype(float); ob = (B.predict(Xte) == yte).astype(float)
n = len(yte); R = 2000
idx = np.random.default_rng(0).integers(0, n, size=(R, n))
aa, ab = oa[idx].mean(1), ob[idx].mean(1); d = aa - ab
lo, hi = np.percentile(d, [2.5, 97.5])
print(n, int(n - oa.sum()), int(n - ob.sum()), round(lo, 3), round(hi, 3), d.min(), (d <= 0).mean(),
      int(((oa == 1) & (ob == 0)).sum()), int(((oa == 0) & (ob == 1)).sum()))
fig, (a, b) = figstyle.figure(7.2, 3.5, ncols=2, lang=lang)
bins = (np.arange(round(0.88 * n), n + 1) + 0.5 - 1) / n
a.hist(aa, bins=bins, color=figstyle.BLUE, alpha=.65, edgecolor="white", label=T["lr"])
a.hist(ab, bins=bins, color=figstyle.ORANGE, alpha=.65, edgecolor="white", label=T["kn"])
a.set_xlabel(T["xa"]); a.set_ylabel(T["y"]); a.set_title(T["lt"]); a.legend(loc="upper left")
b.hist(d, bins=(np.arange(0, round(d.max() * n) + 2) - 0.5) / n, color=figstyle.GREEN, alpha=.7, edgecolor="white")
b.axvline(0, color=figstyle.NAVY, ls="--", lw=1.5)
for v in (lo, hi):
    b.axvline(v, color=figstyle.RED, lw=1.5)
b.set_ylim(0, b.get_ylim()[1] * 1.5); yl = b.get_ylim()[1]
b.text(lo + 0.0015, yl * 0.97, f"2.5%: {lo:.3f}", color=figstyle.RED, ha="left", va="top", fontsize=10)
b.text(hi + 0.0015, yl * 0.97, f"97.5%: {hi:.3f}", color=figstyle.RED, ha="left", va="top", fontsize=10)
b.text(0.97, 0.86, T["note"], transform=b.transAxes, ha="right", va="top", fontsize=10.5, color=figstyle.NAVY,
       bbox=dict(boxstyle="round,pad=0.4", fc="white", ec=figstyle.BORDER))
b.set_xlabel(T["xd"]); b.set_ylabel(T["y"]); b.set_title(T["rt"])
b.set_xlim(-0.012, d.max() + 0.012)
figstyle.save(fig, "fig-01-22", lang=lang)
