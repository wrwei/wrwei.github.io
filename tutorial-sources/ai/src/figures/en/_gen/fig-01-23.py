# Decision boundaries of four classifiers on make_moons (300 points, noise 0.25); titles carry 5-fold stratified CV accuracy.
import sys; sys.path.insert(0, __import__("os").path.normpath(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "..", "..")))
import numpy as np, warnings, figstyle
warnings.filterwarnings("ignore")
from matplotlib.colors import ListedColormap
from sklearn.datasets import make_moons
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier
lang = sys.argv[1] if len(sys.argv) > 1 else "en"
T = {"en": ["Logistic regression", "15-NN", "Decision tree, depth 4", "Gradient boosting"],
     "zh": ["逻辑回归", "15-NN", "决策树，深度 4", "梯度提升"]}[lang]
X, y = make_moons(300, noise=0.25, random_state=0)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
models = [LogisticRegression(C=1), make_pipeline(StandardScaler(), KNeighborsClassifier(15)),
          DecisionTreeClassifier(max_depth=4, random_state=0), GradientBoostingClassifier(n_estimators=200, random_state=0)]
fig, axes = figstyle.figure(7.2, 5.0, ncols=2, nrows=2, lang=lang)
gx, gy = np.meshgrid(np.linspace(-1.8, 2.9, 240), np.linspace(-1.5, 2.0, 180))
G = np.c_[gx.ravel(), gy.ravel()]
cmap = ListedColormap([figstyle.FILLS["blue"], figstyle.FILLS["orange"]])
for ax, name, m in zip(axes.ravel(), T, models):
    acc = cross_val_score(m, X, y, cv=cv).mean()
    m.fit(X, y)
    ax.contourf(gx, gy, m.predict(G).reshape(gx.shape), levels=[-0.5, 0.5, 1.5], cmap=cmap)
    ax.contour(gx, gy, m.predict(G).reshape(gx.shape), levels=[0.5], colors=[figstyle.NAVY], linewidths=1.6)
    ax.scatter(*X[y == 0].T, s=14, color=figstyle.BLUE, edgecolor="white", linewidth=.4, zorder=3)
    ax.scatter(*X[y == 1].T, s=14, color=figstyle.ORANGE, edgecolor="white", linewidth=.4, zorder=3)
    ax.set_title(f"{name}: {acc:.3f}")
    ax.grid(False); ax.set_xticks([]); ax.set_yticks([])
    for s in ax.spines.values(): s.set_visible(True); s.set_color(figstyle.BORDER)
    print(name, round(acc, 3))
figstyle.save(fig, "fig-01-23", lang=lang)
