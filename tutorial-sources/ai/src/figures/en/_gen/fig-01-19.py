# Ridge and lasso coefficient paths on standardised load_diabetes; lambda in the module's convention.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, warnings, figstyle
warnings.filterwarnings("ignore")
from sklearn.datasets import load_diabetes
from sklearn.linear_model import Ridge, Lasso, RidgeCV, LassoCV
from sklearn.model_selection import KFold
from sklearn.preprocessing import StandardScaler
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": dict(lt="Ridge", rt="Lasso", x="log₁₀ λ", y="coefficient", cv="five-fold CV choice"),
     "zh": dict(lt="岭回归", rt="Lasso 回归", x="log₁₀ λ", y="系数", cv="五折交叉验证的选择")}[lang]
d = load_diabetes()
X = StandardScaler().fit_transform(d.data); y = d.target - d.target.mean()
N = len(y); print(X.shape)
lg = np.linspace(-3, 2.6, 120); lams = 10 ** lg
R = np.array([Ridge(alpha=N * l, fit_intercept=False).fit(X, y).coef_ for l in lams])
L = np.array([Lasso(alpha=l / 2, fit_intercept=False, max_iter=100000, tol=1e-10).fit(X, y).coef_ for l in lams])
cv = KFold(5, shuffle=True, random_state=0)
lam_r = RidgeCV(alphas=N * 10 ** np.linspace(-3, 2.6, 200), cv=cv, fit_intercept=False).fit(X, y).alpha_ / N
lam_l = 2 * LassoCV(alphas=10 ** np.linspace(-3, 2.6, 200) / 2, cv=cv, fit_intercept=False, max_iter=100000).fit(X, y).alpha_
print("cv lambda ridge", lam_r, np.log10(lam_r), "lasso", lam_l, np.log10(lam_l))
print("lasso nonzero counts", [(round(a, 1), int((np.abs(L[i]) > 1e-9).sum())) for i, a in enumerate(lg) if i % 12 == 0])
fig, (a, b) = figstyle.figure(7.2, 3.6, ncols=2, lang=lang, sharey=True)
cols = [figstyle.SERIES[i % 8] for i in range(10)]
for j in range(10):
    ls = "-" if j < 8 else "--"
    a.plot(lg, R[:, j], color=cols[j], lw=1.5, ls=ls); b.plot(lg, L[:, j], color=cols[j], lw=1.5, ls=ls)
for ax, v, t in ((a, lam_r, T["lt"]), (b, lam_l, T["rt"])):
    ax.axvline(np.log10(v), color=figstyle.NAVY, ls=":", lw=1.5)
    ax.axhline(0, color=figstyle.MUTED, lw=0.8)
    ax.set_title(t); ax.set_xlabel(T["x"])
a.set_ylabel(T["y"])
a.text(np.log10(lam_r) + 0.1, a.get_ylim()[1] * 0.92, T["cv"], fontsize=10, color=figstyle.NAVY, ha="left", va="top")
b.text(np.log10(lam_l) + 0.1, b.get_ylim()[1] * 0.92, T["cv"], fontsize=10, color=figstyle.NAVY, ha="left", va="top")
figstyle.save(fig, "fig-01-19", lang=lang)
