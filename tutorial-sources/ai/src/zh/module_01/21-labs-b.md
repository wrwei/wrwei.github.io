## 实验 4 — 数据泄漏诊所 {#lab4}

**目标。** 搭建三条评估流水线，它们都因为错误的原因报出了漂亮的分数；通过追问“哪些信息越过了数据划分”找出每一处泄漏，并加以修复。随后，你要为可信的结果加上自助法（bootstrap）置信区间，并用配对自助法和 McNemar 精确检验比较两个分类器。有泄漏的流水线分数故意很高。它们的代码里没有任何一行看起来有问题，所以要养成的习惯不是一个工具，而是一个问题：你报告的每个数字，用来得到它的那些行和已拟合的统计量，是否被允许看到它所评分的那些行？理论见[第 10 节](#s10)，指标见[第 7 节](#s7)。全部代码在笔记本电脑的 CPU 上一分钟内即可跑完，无需下载任何东西。

### 步骤 1：准备环境

本实验只用 scikit-learn。`StratifiedKFold`、`KFold`、`GroupKFold` 和 `TimeSeriesSplit` 是本实验用到的划分方案；每一种回答的都是“新”样本究竟指什么这一不同的问题。

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import binomtest, chi2
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import (
    GroupKFold, KFold, StratifiedKFold, TimeSeriesSplit,
    cross_val_score, train_test_split,
)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

np.random.seed(0)
print("ready")
```

```output
ready
```

### 步骤 2：泄漏 1，在交叉验证之前选择特征

数据是纯噪声：100 个样本，5000 个特征，标签由抛硬币决定。没有任何模型能在新数据上做到超过 50%，因为根本没有可学的东西。

有泄漏的流水线先用全部 100 行挑出与标签相关性最高的 20 个特征，然后才在这 20 列上对分类器做交叉验证。在 5000 个候选中，仅靠挑选，这 20 个看起来最好的列就会显得很好：5000 个噪声相关系数中的最大值远不为零。交叉验证随后划分了行，但特征选择已经看过每一行，包括每一折的测试行，于是测试标签已经泄漏进了特征的选择。

可信的流水线把特征选择放进 `Pipeline`，这样它在每一折的训练部分上重新拟合，永远看不到该折的测试行。两者使用相同的折。

```python
def noise_problem(seed):
    rng = np.random.default_rng(seed)
    return rng.normal(size=(100, 5000)), rng.integers(0, 2, 100)

def leak1_scores(seed):
    X, y = noise_problem(seed)
    cv = StratifiedKFold(5, shuffle=True, random_state=0)
    clf = LogisticRegression(max_iter=1000)
    X_leaky = SelectKBest(f_classif, k=20).fit_transform(X, y)      # sees every row
    leaky = cross_val_score(clf, X_leaky, y, cv=cv)
    honest_model = make_pipeline(SelectKBest(f_classif, k=20),
                                 LogisticRegression(max_iter=1000))
    honest = cross_val_score(honest_model, X, y, cv=cv)             # selection per fold
    return leaky, honest

leaky, honest = leak1_scores(0)
print(f"leaky : {leaky.mean():.2f} +/- {leaky.std():.2f}")
print(f"honest: {honest.mean():.2f} +/- {honest.std():.2f}")

for seed in (1, 2, 3):
    leaky, honest = leak1_scores(seed)
    print(f"seed {seed}: leaky {leaky.mean():.2f}   honest {honest.mean():.2f}")
```

```output
leaky : 0.87 +/- 0.05
honest: 0.50 +/- 0.09
seed 1: leaky 0.92   honest 0.58
seed 2: leaky 0.84   honest 0.55
seed 3: leaky 0.83   honest 0.45
```

可信的分数在 0.5 附近波动，理应如此。有泄漏的分数在每个种子下都远高于它：这是一个用噪声“制造”出来的结果。有泄漏的分数在各折之间的离散程度很小，这让这个数字不仅看起来好，还看起来可靠。

### 步骤 3：温和的情形，在交叉验证之前标准化

同样的错误，换成一个无害的统计量。这里先用全部 569 行的均值和标准差对整个乳腺癌数据集做标准化，再做交叉验证；可信的版本则把标准化器放进流水线里拟合。这一泄漏是真实存在的，因为每个测试行都影响了用来缩放它的均值和方差；但均值和方差每个特征只有两个数，由几百行估计得到，每一行对它们的影响量级为 $1/N$。

```python
data = load_breast_cancer()
X_bc, y_bc = data.data, 1 - data.target     # flip: malignant becomes the positive class
cv5 = StratifiedKFold(5, shuffle=True, random_state=0)
clf = LogisticRegression(max_iter=1000)

X_scaled_all = StandardScaler().fit_transform(X_bc)                 # sees every row
leaky = cross_val_score(clf, X_scaled_all, y_bc, cv=cv5)
honest = cross_val_score(make_pipeline(StandardScaler(), clf), X_bc, y_bc, cv=cv5)
print(f"scaler fitted on all rows : {leaky.mean():.4f}")
print(f"scaler inside the pipeline: {honest.mean():.4f}")
```

```output
scaler fitted on all rows : 0.9789
scaler inside the pipeline: 0.9789
```

两者一致。只用许多行估计少数几个数的无监督预处理，泄漏很小。但不要由此断定它是安全的：由很少几行估计的统计量，或用到标签的统计量（如上面的特征选择），就不是无害的。规则是把每一个需要拟合的步骤都放进流水线，因为这样做没有代价，还省去了逐个情形判断的麻烦。

### 步骤 4：泄漏 2，同一个试件同时出现在划分的两侧

四十个试件，每个测量十次。每个试件有一个指纹（一个能标识它的十维向量，比如它的几何形状或加工方式）和一个二元标签，比如有缺陷或完好。一个试件的十行就是它的指纹加上微小的测量噪声。标签有一个微弱的真实效应：它把第 0 列平移 $\pm 0.3$。所以信号是存在的，但与试件之间指纹的离散程度相比很小。

按行划分会把一个试件的一些行放进训练集，另一些行放进测试折。灵活的模型随后就能凭指纹认出这个试件，并凭记忆读出标签。这不是你想预测的性质，也不会迁移到新试件上。`GroupKFold` 让同一个试件的所有行都在同一侧。

```python
rng = np.random.default_rng(0)
n_spec, n_rep = 40, 10
spec_label = rng.integers(0, 2, n_spec)
fingerprint = rng.normal(0, 1, (n_spec, 10))
rows, labels, groups = [], [], []
for s in range(n_spec):
    block = fingerprint[s] + 0.3 * rng.normal(size=(n_rep, 10))
    block[:, 0] += 0.3 * (2 * spec_label[s] - 1)                    # the weak real signal
    rows.append(block)
    labels += [spec_label[s]] * n_rep
    groups += [s] * n_rep
X_sp, y_sp, g_sp = np.vstack(rows), np.array(labels), np.array(groups)
print("rows:", X_sp.shape, " specimens:", len(set(g_sp)),
      " positive fraction:", f"{y_sp.mean():.2f}")

forest = RandomForestClassifier(n_estimators=300, random_state=0, n_jobs=1)
knn = make_pipeline(StandardScaler(), KNeighborsClassifier(5))
row_cv = KFold(5, shuffle=True, random_state=0)
group_cv = GroupKFold(5)
for name, model in (("random forest", forest), ("5-NN", knn)):
    by_row = cross_val_score(model, X_sp, y_sp, cv=row_cv)
    by_group = cross_val_score(model, X_sp, y_sp, cv=group_cv, groups=g_sp)
    print(f"{name:14s} by row {by_row.mean():.2f}   "
          f"by specimen {by_group.mean():.2f} +/- {by_group.std():.2f}")
```

```output
rows: (400, 10)  specimens: 40  positive fraction: 0.57
random forest  by row 0.95   by specimen 0.63 +/- 0.14
5-NN           by row 1.00   by specimen 0.64 +/- 0.14
```

两个模型按行划分的分数都接近完美。按试件划分后，分数接近随机水平，各折之间的离散程度很大：只有 40 个试件、每折八个，又只有微弱的信号，数据能支撑的就是这样的结果。按行划分的数字并不是同一个估计稍微乐观了一点。它回答的是另一个问题：“模型能不能认出它见过的试件？”

### 步骤 5：泄漏 3，打乱时间序列

一台泵的轴承温度每小时记录一次，共 120 天。目标是一个导出量（比如泵壳温度），由日周期、一部分随轴承温度变化的成分、一个缓慢的随机漂移，再加上标准差为 2 的噪声构成。特征是时间索引 `t`、一天中的小时和轴承温度。由于噪声的标准差为 2.0，没有任何模型能在新数据上把 RMSE 做到低于 2.0：这就是噪声下限。

打乱后的划分会把第 100 小时放进训练集，而把第 99 和 101 小时放进测试折。漂移在三个小时内几乎不变，所以只要森林学到了“时间索引接近 100 意味着大致是这个水平”，就能把它插值出来。这之所以可能，只是因为未来泄漏进了过去。`TimeSeriesSplit` 在起始的一段上训练，在紧随其后的一段上测试，而 `gap=24` 在两者之间留出一天，使最后一个训练小时不与第一个测试小时相邻。

```python
rng = np.random.default_rng(0)
t = np.arange(2880)
hour = t % 24
drift = np.cumsum(rng.normal(0, 0.2, 2880))
temp = 10 + 8 * np.sin(2 * np.pi * (hour - 9) / 24) + rng.normal(0, 1, 2880)
y_ts = (50 + 0.8 * temp + 5 * np.sin(2 * np.pi * hour / 24) + drift
        + rng.normal(0, 2, 2880))
X_ts = np.column_stack([t, hour, temp])

def make_forest():
    return RandomForestRegressor(100, min_samples_leaf=2, random_state=0, n_jobs=1)

def forecast_scores(cv):
    rmse, r2 = [], []
    for train, test in cv.split(X_ts):
        model = make_forest().fit(X_ts[train], y_ts[train])
        resid = y_ts[test] - model.predict(X_ts[test])
        rmse.append(np.sqrt(np.mean(resid ** 2)))
        r2.append(1 - np.sum(resid ** 2) / np.sum((y_ts[test] - y_ts[test].mean()) ** 2))
    return np.mean(rmse), np.mean(r2)

shuffled = forecast_scores(KFold(5, shuffle=True, random_state=0))
forward = forecast_scores(TimeSeriesSplit(5, gap=24))
print(f"shuffled KFold          RMSE {shuffled[0]:.2f}   R^2 {shuffled[1]:.2f}")
print(f"TimeSeriesSplit(gap=24) RMSE {forward[0]:.2f}   R^2 {forward[1]:.2f}")
print("noise floor             RMSE 2.00")
```

```output
shuffled KFold          RMSE 2.33   R^2 0.88
TimeSeriesSplit(gap=24) RMSE 4.09   R^2 -0.01
noise floor             RMSE 2.00
```

打乱后的分数刚好略高于 2.0 的噪声下限：模型似乎解释了几乎所有可以解释的东西。前向链式划分给出的 RMSE 大约是前者的两倍，$R^2$ 接近零，因为模型无法外推一个已经游走到训练期间所在位置之外的随机游走。两者都是对不同问题的诚实回答；只有第二个回答的是“这个模型在下个月的数据上表现如何？”。前向链式划分某一折的 $R^2$ 以该折自身的方差为基线，可能为负，所以比较不同划分方案时，应优先看 RMSE。

```python
train, test = list(TimeSeriesSplit(5, gap=24).split(X_ts))[-1]
model = make_forest().fit(X_ts[train], y_ts[train])
fig, ax = plt.subplots(figsize=(8, 3.5))
ax.plot(t[test][:240], y_ts[test][:240], label="measured", lw=1.2)
ax.plot(t[test][:240], model.predict(X_ts[test])[:240], label="forecast", lw=1.2)
ax.set_xlabel("hour index")
ax.set_ylabel("casing temperature")
ax.set_title("Last forward-chaining fold: the forecast misses the drift")
ax.legend()
plt.show()
```

### 步骤 6：为可信的结果加上区间

现在是一个可信的结果，以及它有多精确的问题。按实验 2 的方式划分乳腺癌数据（25% 作测试集，分层，`random_state=0`，得到 143 个测试样本），并拟合两个分类器：逻辑回归和 15 近邻，二者都在标准化之后进行。

**百分位自助法**对这 143 个测试样本做 $R = 2{,}000$ 次有放回重抽样，在每次重抽样上重新计算准确率，并报告第 2.5 和第 97.5 百分位数。两个模型使用相同的重抽样索引，这正是下一段代码块中的比较成为配对比较的原因。

```python
Xtr, Xte, ytr, yte = train_test_split(
    X_bc, y_bc, test_size=0.25, random_state=0, stratify=y_bc)
logreg = make_pipeline(StandardScaler(), LogisticRegression(C=1)).fit(Xtr, ytr)
knn15 = make_pipeline(StandardScaler(), KNeighborsClassifier(15)).fit(Xtr, ytr)
ok_a = (logreg.predict(Xte) == yte).astype(float)       # 1 where model A is right
ok_b = (knn15.predict(Xte) == yte).astype(float)
n = len(yte)
print(f"test cases {n}; errors: logistic {int(n - ok_a.sum())}, "
      f"15-NN {int(n - ok_b.sum())}")
print(f"accuracy: logistic {ok_a.mean():.3f}, 15-NN {ok_b.mean():.3f}")

R = 2000
rng = np.random.default_rng(0)
idx = rng.integers(0, n, size=(R, n))                   # shared by both models
acc_a, acc_b = ok_a[idx].mean(axis=1), ok_b[idx].mean(axis=1)
for name, acc in (("logistic", acc_a), ("15-NN", acc_b)):
    lo, hi = np.percentile(acc, [2.5, 97.5])
    print(f"{name:9s} 95% interval [{lo:.3f}, {hi:.3f}]")
```

```output
test cases 143; errors: logistic 2, 15-NN 7
accuracy: logistic 0.986, 15-NN 0.951
logistic  95% interval [0.965, 1.000]
15-NN     95% interval [0.909, 0.986]
```

两个区间有重叠，这常被解读为“没有显著差异”。这种解读一般来说是错的：两个准确率是在同样的样本上算出来的，对一个模型容易的样本，大多对另一个也容易，所以两者的错误是正相关的，差值的确定程度比任何一个准确率都高。配对自助法逐个样本地对*差值*重抽样；它的直方图就是本实验中对图 1.22 右图的复现。

```python
diff = acc_a - acc_b
lo, hi = np.percentile(diff, [2.5, 97.5])
print(f"observed difference {ok_a.mean() - ok_b.mean():.3f}")
print(f"paired 95% interval [{lo:.3f}, {hi:.3f}]")
print(f"fraction of replicates with difference <= 0: {np.mean(diff <= 0):.4f}")

n_a_only = int(np.sum((ok_a == 1) & (ok_b == 0)))       # A right, B wrong
n_b_only = int(np.sum((ok_a == 0) & (ok_b == 1)))       # A wrong, B right
print(f"discordant cases: A right/B wrong {n_a_only}, A wrong/B right {n_b_only}")
print(f"chance a resample contains none of the {n_a_only} cases: "
      f"{((n - n_a_only) / n) ** n:.4f}")

fig, ax = plt.subplots(figsize=(6, 3.5))
ax.hist(diff, bins=30, color="tab:blue", edgecolor="white")
ax.axvline(0, color="k", ls="--", label="no difference")
ax.set_xlabel("accuracy(logistic) - accuracy(15-NN) on a bootstrap resample")
ax.set_ylabel("number of replicates")
ax.set_title("Paired bootstrap of the accuracy difference (R = 2000)")
ax.legend()
plt.show()
```

```output
observed difference 0.035
paired 95% interval [0.007, 0.070]
fraction of replicates with difference <= 0: 0.0065
discordant cases: A right/B wrong 5, A wrong/B right 0
chance a resample contains none of the 5 cases: 0.0062
```

配对区间不包含零。重复实验说明了原因：只有当某次重抽样没有抽到两个模型意见不一致的那五个样本时，差值才可能为零或为负，而这种情况的概率是 $(138/143)^{143}$。

### 步骤 7：McNemar 精确检验，以及自助法与检验为何不一致

只有不一致的样本才携带关于差异的信息：两个模型都对或都错的地方，无法说明哪个更好。在两个模型准确率相同的零假设下，每个不一致样本倒向哪一边的可能性相等，所以只有 A 正确的样本数服从二项分布，试验次数为 $n_{10} + n_{01}$，成功概率为 0.5。**McNemar 精确检验**就是对这个计数做二项检验。这里 $n_{10}$ 是 A 对 B 错的样本数，$n_{01}$ 是反过来的样本数。

常见的 $\chi^2$ 形式 $(n_{10} - n_{01})^2/(n_{10} + n_{01})$ 在计数较大时近似精确检验。不一致样本很少时，它会夸大证据。下面把三者都算出来。

```python
n10, n01 = n_a_only, n_b_only
exact = binomtest(n10, n10 + n01, 0.5).pvalue
chi_plain = (n10 - n01) ** 2 / (n10 + n01)
chi_corrected = (abs(n10 - n01) - 1) ** 2 / (n10 + n01)
print(f"discordant counts n10 = {n10}, n01 = {n01}")
print(f"exact binomial test        p = {exact:.4f}")
print(f"chi-square {chi_plain:.1f}              p = {chi2.sf(chi_plain, 1):.3f}")
print(f"corrected chi-square {chi_corrected:.1f}    p = {chi2.sf(chi_corrected, 1):.3f}")
```

```output
discordant counts n10 = 5, n01 = 0
exact binomial test        p = 0.0625
chi-square 5.0              p = 0.025
corrected chi-square 3.2    p = 0.074
```

对于“0.035 的差异是真实的吗？”，这几种方法给出了不同的回答。配对自助法说是，未校正的 $\chi^2$ 也说是（p = 0.025）。对这样的计数而言正确的精确检验，在 5% 水平上并不拒绝（$p = 0.0625$）；经连续性校正的 $\chi^2$ 在结论上与它一致。它们不一致，是因为可供判断的信息太少。自助法对观测到的样本重抽样，而这里有五个不一致样本，反方向的一个也没有，所以每个至少含其中一个的重抽样，差值都为正，区间因此不可能跨过零。它把样本中五比零的分布当作了真相，在计数这么小的时候，这会低估不确定性。而在公平硬币下，五比零也并非不可能：它出现的概率是 $2 \times (1/2)^5 = 0.0625$。

诚实的报告应包含差值（0.035，143 个样本中的五个）、不一致样本的计数（5 和 0）以及精确 p 值（0.0625），并说明数据提示逻辑回归更好，但 143 个样本太少，无法确定。只报告“配对自助法区间不包含零”，会是对一个具有误导性的结果的正确陈述。要在看到计数之前就决定用精确检验，而不是看到之后。

### 步骤 8：汇总表

```python
# values copied from Steps 2 to 5 above
table = [
    ("feature selection before CV", "0.87", "0.50", "selection inside the pipeline"),
    ("scaler before CV", "0.9789", "0.9789", "scaler inside the pipeline (free)"),
    ("rows of one specimen split", "0.95 / 1.00", "0.63 / 0.64", "GroupKFold by specimen"),
    ("shuffled time series (RMSE)", "2.33", "4.09", "TimeSeriesSplit with a gap"),
]
print(f"{'case':30s} {'leaky':>12s} {'honest':>12s}   the fix")
for case, leaky_score, honest_score, fix in table:
    print(f"{case:30s} {leaky_score:>12s} {honest_score:>12s}   {fix}")
```

```output
case                                  leaky       honest   the fix
feature selection before CV            0.87         0.50   selection inside the pipeline
scaler before CV                     0.9789       0.9789   scaler inside the pipeline (free)
rows of one specimen split      0.95 / 1.00  0.63 / 0.64   GroupKFold by specimen
shuffled time series (RMSE)            2.33         4.09   TimeSeriesSplit with a gap
```

### 你应该看到什么

- 在全部数据上选择特征，会从纯噪声中制造出约 0.87 的准确率；放进流水线后，分数在每个种子下都回到随机水平，约 0.50。
- 在全部数据上标准化，对乳腺癌数据没有可测量的影响：泄漏存在，但可以忽略。修复没有代价，所以仍要做。
- 按行划分时，两个模型都是在认试件，而不是在学那个性质。按试件划分时，两者都接近随机水平，且离散程度很大，这才是 40 个试件加微弱信号的真实面貌。
- 打乱后的时间序列分数处于噪声下限，因为森林从相邻小时插值出了漂移。前向链式划分表明它并不能预测漂移。
- 分开看的区间有重叠，而配对区间不包含零，所以比较需要用配对方法。McNemar 精确检验（p = 0.0625）在 5% 水平上不拒绝：只有五个不一致样本时，自助法区间过窄。诚实的总结是差值、计数和精确 p 值。

### 动手试试

1. **模型选择中的选择偏差。** 在 `X` 形状为 `(100, 50)` 的纯噪声上，对 200 个随机的 5 特征子集做 5 折交叉验证打分，保留最好的一个：它能达到约 0.67。然后把这一搜索包进外层的 5 折循环（嵌套交叉验证：在每个外层训练部分内选子集，在外层测试部分上打分），看分数降到约 0.56。（这是用 `default_rng(0)` 生成数据时的值；种子 1 和 2 分别给出 0.70 与 0.60、0.64 与 0.54，所以约 0.1 的差距才是稳定的部分。）许多带噪声的分数中的最好者，是对自身质量的乐观估计。这大约需要 20 秒。
2. **聚类自助法。** 对泄漏 2，对试件而不是对行做重抽样，并把区间宽度与按行自助法的相比较。同一试件的各行并不独立，所以按行自助法的区间过窄。
3. **目标泄漏。** 加一列等于标签加小噪声的特征（一个在结果出来之后才记录的“结果代码”），观察每个模型在每一种划分方案下都变得表现出色。划分无法修复一个在预测时拿不到的特征；只有弄清该特征的含义才行。
4. **种子彩票。** 在步骤 6 中让划分的 `random_state` 取 1 到 5 重复一遍。逻辑回归有多少次更好？不一致样本的计数和精确 p 值会怎样变化？

## 实验 5 — 拟合超弹性材料模型 {#lab5}

**目标。** 用加权最小二乘法，把一种软水凝胶的 neo-Hookean 系数 $c_1$ 拟合到一组合成的压缩试验数据上，用蒙特卡洛实验检验其不确定性公式，然后观察一个在其适用范围内表现干净的拟合如何在范围之外失效。你要从残差中发现失配，拟合 Gent 模型（它有一个参数位于分母中，因此需要非线性最小二乘法），观察它的两个参数如何相互权衡，并编写输入检查，让拟合例程拒绝它无法遵守的输入。背景见[第 12 节](#s12)；最小二乘和不确定性的公式来自[第 2 节](#s2)和[第 5 节](#s5)。数据是合成的，这样每个数字都能复现。全部代码在笔记本电脑的 CPU 上几秒内即可跑完，无需下载任何东西。

### 步骤 1：模型与合成试验

在单轴拉伸比 $\lambda$（变形后长度与原长之比，所以压缩时 $\lambda < 1$）下，不可压缩的 neo-Hookean 固体的名义应力为

$$P = 2c_1\,g(\lambda), \qquad g(\lambda) = \lambda - \lambda^{-2}.$$

Gent 模型描述聚合物链接近其可延伸极限时的变硬：

$$P = \frac{2c_1\,g(\lambda)}{1 - \beta\,(I_1 - 3)}, \qquad I_1 - 3 = \lambda^2 + \frac{2}{\lambda} - 3,$$

其中 $\beta = 1/J_m$，而 $\beta = 0$ 退化为 neo-Hookean。本实验中的“真实”材料是 $c_1 = 10$ kPa、$\beta = 0.2$ 的 Gent 材料。试验有 16 个拉伸比 $\lambda = 1 - 0.025k$，$k = 1, \dots, 16$（应变从 2.5% 到 40%）。每个点都记录了标准不确定度 $\sigma_i = 0.05\ \text{kPa} + 0.02\,|P_{\text{true},i}|$，即一个小的下限加上读数的 2%；测量值是真实应力加上这一大小的高斯噪声。按这一约定，压缩应力为负。

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import least_squares
from scipy.stats import chi2

np.random.seed(0)

def g(lam):
    return lam - lam ** -2.0

def i1_minus_3(lam):
    return lam ** 2 + 2.0 / lam - 3.0

def p_neo_hookean(lam, c1):
    return 2.0 * c1 * g(lam)

def p_gent(lam, c1, beta):
    return 2.0 * c1 * g(lam) / (1.0 - beta * i1_minus_3(lam))

k = np.arange(1, 17)
lam = 1.0 - 0.025 * k                                   # compression: 0.975 ... 0.600
p_true = p_gent(lam, 10.0, 0.2)
sigma = 0.05 + 0.02 * np.abs(p_true)                    # kPa, recorded with each point
p_meas = p_true + sigma * np.random.default_rng(1).normal(size=16)

print(" k  stretch  stress (kPa)  sigma (kPa)")
for ki, li, pi, si in zip(k, lam, p_meas, sigma):
    print(f"{ki:2d}   {li:.3f}   {pi:9.2f}    {si:8.3f}")
```

```output
 k  stretch  stress (kPa)  sigma (kPa)
 1   0.975       -1.51       0.081
 2   0.950       -3.07       0.113
 3   0.925       -4.84       0.148
 4   0.900       -6.98       0.185
 5   0.875       -8.51       0.224
 6   0.850      -10.73       0.267
 7   0.825      -13.33       0.313
 8   0.800      -15.48       0.364
 9   0.775      -18.32       0.419
10   0.750      -21.40       0.481
11   0.725      -24.95       0.549
12   0.700      -28.47       0.626
13   0.675      -33.70       0.713
14   0.650      -38.28       0.813
15   0.625      -44.33       0.928
16   0.600      -49.93       1.061
```

应力从 2.5% 应变时的 $-1.51$ kPa 变化到 40% 应变时的 $-49.93$ kPa，记录的不确定度随之增大。这就是拟合必须加权的原因：不加权的拟合会让应力大、绝对噪声也最大的点占据主导。

### 步骤 2：拒绝无法遵守的输入

总是返回一个数的拟合例程是危险的，因为一个数看起来就像一个结果。拟合之前，`check_inputs` 会拒绝缺失或非正的不确定度（没有不确定度，加权最小二乘就没有意义）、位于声明的加载方向错误一侧的拉伸比，以及符号与该方向矛盾的应力。拟合之后，例程还会拒绝非正的刚度，因为那不是一种材料。每次拒绝都会说明理由。

```python
def check_inputs(lam, p, sigma, direction):
    lam, p = np.asarray(lam, float), np.asarray(p, float)
    if direction not in ("compression", "tension"):
        raise ValueError(f"direction must be compression or tension, got {direction!r}")
    if sigma is None:
        raise ValueError("no uncertainty supplied: weighted least squares needs one per point")
    sigma = np.asarray(sigma, float)
    if sigma.shape != p.shape or not np.all(np.isfinite(sigma)) or np.any(sigma <= 0):
        raise ValueError("every point needs a finite, positive uncertainty")
    sign = 1.0 if direction == "compression" else -1.0
    if np.any(sign * (1.0 - lam) <= 0):
        raise ValueError(f"declared {direction}, but some stretches are on the wrong side of 1")
    if np.any(-sign * p <= 0):
        raise ValueError(f"declared {direction}, but some stresses have the wrong sign")

cases = {
    "no uncertainty": (lam, p_meas, None, "compression"),
    "tension stretches, compression declared": (1 + 0.025 * k, p_meas, sigma, "compression"),
    "stress sign flipped": (lam, -p_meas, sigma, "compression"),
}
for name, args in cases.items():
    try:
        check_inputs(*args)
        print(f"{name}: accepted")
    except ValueError as err:
        print(f"{name}: refused -> {err}")
check_inputs(lam, p_meas, sigma, "compression")
print("the real data: accepted")
```

```output
no uncertainty: refused -> no uncertainty supplied: weighted least squares needs one per point
tension stretches, compression declared: refused -> declared compression, but some stretches are on the wrong side of 1
stress sign flipped: refused -> declared compression, but some stresses have the wrong sign
the real data: accepted
```

### 步骤 3：加权最小二乘的闭式解

似然是高斯的，每个点的方差各不相同，所以极大似然就是加权最小二乘：在 $w_i = 1/\sigma_i^2$ 下最小化 $\sum_i w_i\,(P_i - 2c_1 g_i)^2$。令导数为零，得到

$$\hat c_1 = \frac{\sum_i w_i P_i g_i}{2\sum_i w_i g_i^2}, \qquad
\operatorname{Var}(\hat c_1) = \frac{1}{4\sum_i w_i g_i^2},$$

方差之所以如此，是因为 $\hat c_1$ 是带噪声的 $P_i$ 的线性函数。由此得到两个诊断量：**归一化残差** $(P_i - \hat P_i)/\sigma_i$，它们应当看起来像标准正态抽样；以及 $\chi^2_\nu$，即归一化残差的平方和除以 $n - 1$ 个自由度，它应当接近 1。

我们只拟合前 8 个点，即应变至 20% 的部分，在这一范围内 neo-Hookean 模型是合理的描述。例程还会报告 RMS 残差除以拟合范围内最大测量应力的结果，这一约定让不同试件的拟合可以相互比较（引用它时要同时说明所拟合的应变范围）。对加权残差调用 `scipy.optimize.least_squares` 应当得到同样的 $c_1$。

```python
def fit_neo_hookean(lam, p, sigma, direction="compression"):
    check_inputs(lam, p, sigma, direction)
    w, gg = 1.0 / sigma ** 2, g(lam)
    s_gg = np.sum(w * gg ** 2)
    c1 = np.sum(w * p * gg) / (2.0 * s_gg)
    if c1 <= 0:
        raise ValueError(f"fitted stiffness c1 = {c1:.3f} is not positive: not a material")
    resid = p - p_neo_hookean(lam, c1)
    return {
        "c1": c1,
        "se": 1.0 / (2.0 * np.sqrt(s_gg)),
        "norm_resid": resid / sigma,
        "chi2_nu": np.sum((resid / sigma) ** 2) / (len(p) - 1),
        "rms_pct": 100 * np.sqrt(np.mean(resid ** 2)) / np.max(np.abs(p)),
    }

n_fit = 8
fit20 = fit_neo_hookean(lam[:n_fit], p_meas[:n_fit], sigma[:n_fit])
print(f"c1 = {fit20['c1']:.2f} +/- {fit20['se']:.2f} kPa   "
      f"chi2_nu = {fit20['chi2_nu']:.2f}")
print("normalised residuals:", np.round(fit20["norm_resid"], 2))
print(f"RMS residual = {fit20['rms_pct']:.1f}% of the largest stress in range")

def weighted_resid(theta):
    return (p_meas[:n_fit] - p_neo_hookean(lam[:n_fit], theta[0])) / sigma[:n_fit]

check = least_squares(weighted_resid, x0=[5.0])
print(f"least_squares check: c1 = {check.x[0]:.2f}")
```

```output
c1 = 10.09 +/- 0.10 kPa   chi2_nu = 0.71
normalised residuals: [ 0.51  1.03  0.52 -1.21  0.86  0.2  -1.04 -0.24]
RMS residual = 1.1% of the largest stress in range
least_squares check: c1 = 10.09
```

拟合恢复出 $c_1 \approx 10.09$ kPa，而真值为 10，标准误差为 0.10：估计值与真值相差不到一个标准误差。归一化残差在约 $\pm 1.2$ 之内散布，没有规律，$\chi^2_\nu = 0.71$ 与 1 相符（在 7 个自由度下，$\chi^2_\nu$ 的 95% 范围大约是 0.24 到 2.3）。对这些数据而言，这个模型是够用的，尽管它并不是真实的模型。

### 步骤 4：用模拟检验所引用的不确定度

公式 $\operatorname{Var}(\hat c_1) = 1/(4\sum_i w_i g_i^2)$ 假定噪声恰如记录所示。用模拟来检验：由拟合曲线加上具有相同 $\sigma_i$ 的新噪声，生成 1000 个新数据集，对每个重新拟合，并把这 1000 个系数的离散程度与公式比较。

```python
rng = np.random.default_rng(2)
lam8, sig8 = lam[:n_fit], sigma[:n_fit]
curve = p_neo_hookean(lam8, fit20["c1"])
w8, g8 = 1.0 / sig8 ** 2, g(lam8)
refits = []
for _ in range(1000):
    p_new = curve + sig8 * rng.normal(size=n_fit)
    refits.append(np.sum(w8 * p_new * g8) / (2.0 * np.sum(w8 * g8 ** 2)))
refits = np.array(refits)
print(f"Monte Carlo mean {refits.mean():.3f}, SD {refits.std(ddof=1):.4f}")
print(f"formula SD       {fit20['se']:.4f}")
```

```output
Monte Carlo mean 10.087, SD 0.0999
formula SD       0.0997
```

两个标准差的吻合程度在百分之一左右。对于参数线性的模型，公式是精确的，所以唯一的差异来自模拟自身的抽样误差（约为标准差的 $1/\sqrt{2 \times 1000} = 2\%$）。这一检验的价值体现在下面的非线性拟合上，那里公式只是一个线性化近似。

### 步骤 5：带置信带的外推

$c_1$ 的方差给出了任意拉伸比处预测的置信带：$P(\lambda) = 2c_1 g(\lambda)$ 是 $c_1$ 的线性函数，所以它的标准误差是 $2|g(\lambda)|\,\mathrm{SE}(c_1)$，95% 置信带是它的 $\pm 1.96$ 倍。预测 $\lambda = 0.7$（30% 应变）和 $\lambda = 0.6$（40%）处的应力，这两点都在拟合范围之外，并与真实材料相比较。

```python
for target in (0.7, 0.6):
    pred = p_neo_hookean(target, fit20["c1"])
    half = 1.96 * 2.0 * abs(g(target)) * fit20["se"]
    truth = p_gent(target, 10.0, 0.2)
    print(f"lambda = {target}: predicted {pred:.2f} +/- {half:.2f} kPa, "
          f"true {truth:.2f}, error {100 * (pred / truth - 1):+.1f}%")
```

```output
lambda = 0.7: predicted -27.06 +/- 0.52 kPa, true -28.82, error -6.1%
lambda = 0.6: predicted -43.96 +/- 0.85 kPa, true -50.57, error -13.1%
```

40% 应变处的预测偏低 13%，即 6.6 kPa，而置信带的半宽为 0.85 kPa：约为置信带的八倍。置信带对它所声称的内容是正确的：它说明了测量噪声会让 $c_1$ 移动多少。但它完全没有说明模型在你外推的位置是否正确，而这里模型是不正确的，因为真实材料会变硬（$\beta$ 项），neo-Hookean 曲线做不到。统计不确定度不是模型误差，而外推正是模型误差所在之处。

### 步骤 6：失配在残差中显现

现在用同一个模型拟合全部 16 个点，并观察残差的符号。正确的模型留下符号随机的残差。错误的模型留下长长的同号游程。

```python
fit_all = fit_neo_hookean(lam, p_meas, sigma)
signs = "".join("+" if r > 0 else "-" for r in fit_all["norm_resid"])
print(f"c1 = {fit_all['c1']:.2f} +/- {fit_all['se']:.2f} kPa   "
      f"chi2_nu = {fit_all['chi2_nu']:.1f}")
print("residual signs (k = 1..16):", signs)
print("largest |normalised residual|:", f"{np.max(np.abs(fit_all['norm_resid'])):.1f}")
```

```output
c1 = 10.55 +/- 0.06 kPa   chi2_nu = 4.5
residual signs (k = 1..16): ++++++++++------
largest |normalised residual|: 3.8
```

系数移到了约 10.55，标准误差降到 0.06，所以估计看起来*更*精确了；而 $\chi^2_\nu = 4.5$ 离 1 很远，符号分成两个游程，十个为一种符号，六个为另一种。在 15 个自由度下，$\chi^2_\nu$ 的 95% 上限约为 1.7，所以这个拟合被拒绝。变小的标准误差并不令人放心：同类数据越多，错误模型的统计误差就越小，却并不会更接近真值。

### 步骤 7：用非线性最小二乘拟合 Gent 模型

$P_\text{Gent}$ 对 $c_1$ 是线性的，对 $\beta$ 则不是，所以没有闭式解。对加权残差使用 `least_squares`，从 $(5, 0)$ 出发，边界为 $c_1 \ge 0$ 和 $0 \le \beta < 1/\max(I_1 - 3)$（超过这个边界，分母会在数据范围内变为零），并设置 `x_scale="jac"`，使量级不同的参数得到均衡的对待。

不确定度是问题在解处的线性化：设 $\mathbf{J}$ 为加权残差对参数的雅可比矩阵，则 $\operatorname{Cov}(\hat\theta) \approx
(\mathbf{J}^\top\mathbf{J})^{-1}$。这与闭式解中的公式相同，只是用 $\mathbf{J}$ 代替了设计矩阵。我们拟合全范围和 20% 范围，并用蒙特卡洛检验标准误差。

```python
def fit_gent(lam, p, sigma):
    check_inputs(lam, p, sigma, "compression")
    beta_max = (1.0 - 1e-6) / np.max(i1_minus_3(lam))

    def weighted_resid(theta):
        return (p - p_gent(lam, theta[0], theta[1])) / sigma

    sol = least_squares(weighted_resid, x0=[5.0, 0.0],
                        bounds=([0.0, 0.0], [np.inf, beta_max]), x_scale="jac")
    cov = np.linalg.inv(sol.jac.T @ sol.jac)
    se = np.sqrt(np.diag(cov))
    return {"theta": sol.x, "se": se, "cov": cov,
            "corr": cov[0, 1] / (se[0] * se[1]),
            "chi2_nu": 2.0 * sol.cost / (len(p) - 2)}

gent_all = fit_gent(lam, p_meas, sigma)
gent_20 = fit_gent(lam[:n_fit], p_meas[:n_fit], sigma[:n_fit])
for name, f in (("all 16 points ", gent_all), ("first 8 points", gent_20)):
    print(f"{name}: c1 = {f['theta'][0]:.2f} +/- {f['se'][0]:.2f}   "
          f"beta = {f['theta'][1]:.3f} +/- {f['se'][1]:.3f}   "
          f"corr = {f['corr']:.2f}   chi2_nu = {f['chi2_nu']:.2f}")

# Monte Carlo check of the linearised standard errors, full range
rng = np.random.default_rng(3)
curve = p_gent(lam, *gent_all["theta"])
draws = np.array([fit_gent(lam, curve + sigma * rng.normal(size=16), sigma)["theta"]
                  for _ in range(300)])
print(f"Monte Carlo SDs (300 refits): c1 {draws[:, 0].std(ddof=1):.3f}, "
      f"beta {draws[:, 1].std(ddof=1):.3f}")
```

```output
all 16 points : c1 = 9.95 +/- 0.10   beta = 0.208 +/- 0.024   corr = -0.78   chi2_nu = 0.40
first 8 points: c1 = 9.95 +/- 0.18   beta = 0.208 +/- 0.210   corr = -0.83   chi2_nu = 0.67
Monte Carlo SDs (300 refits): c1 0.099, beta 0.025
```

在全部 16 个点上，Gent 拟合恢复出了两个参数（$c_1 \approx 9.95$，$\beta \approx 0.21$；真值为 10 和 0.2），$\chi^2_\nu = 0.40$，这是一个好的拟合，甚至比噪声所允许的还略好一些：在 14 个自由度下，正确模型出现这样低的 $\chi^2_\nu$ 的概率约为 2.5%。应把它看作一个种子带来的偶然抽样，而不是方法的性质。线性化的标准误差与蒙特卡洛的结果一致。

两个参数强烈负相关，约为 $-0.78$：较大的 $\beta$ 会使曲线在大应变处变硬，而较小的 $c_1$ 在小应变处进行补偿。只拟合前 8 个点时，$\beta$ 为 $0.21 \pm 0.21$：与真值相符，也与零相符。始终没有达到 $\beta$ 起作用的应变的数据，无法确定它，而且相关性更高（约 $-0.83$）。

### 步骤 8：加载方向是模型的一部分

比模型形式错误更隐蔽的错误，是对实验的误读。假设压缩试验被当作拉伸试验录入：$\lambda = 1 + \text{strain}$，应力取 $|P|$。对于声明为拉伸的情形，检查可以通过，模型也会拟合出一个系数。

```python
strain = 1.0 - lam
tension_20 = fit_neo_hookean(1.0 + strain[:8], np.abs(p_meas[:8]), sigma[:8],
                             direction="tension")
tension_5 = fit_neo_hookean(1.0 + strain[:2], np.abs(p_meas[:2]), sigma[:2],
                            direction="tension")
correct_5 = fit_neo_hookean(lam[:2], p_meas[:2], sigma[:2])
print(f"20% strain: tension reading c1 = {tension_20['c1']:.2f} kPa "
      f"({100 * (tension_20['c1'] / fit20['c1'] - 1):+.1f}%), "
      f"chi2_nu = {tension_20['chi2_nu']:.1f}")
print(f" 5% strain: tension reading c1 = {tension_5['c1']:.2f} kPa "
      f"({100 * (tension_5['c1'] / correct_5['c1'] - 1):+.1f}%), "
      f"chi2_nu = {tension_5['chi2_nu']:.2f}")
```

```output
20% strain: tension reading c1 = 12.97 kPa (+28.5%), chi2_nu = 20.7
 5% strain: tension reading c1 = 10.60 kPa (+8.7%), chi2_nu = 0.38
```

在 20% 应变范围内，误读后的拟合给出 $c_1 = 12.97$ kPa，偏高 28.5%，而 $\chi^2_\nu = 20.7$ 发出了问题的警报。只看前 5%（两个点）时，误读后的拟合很干净（$\chi^2_\nu = 0.38$），却仍然偏高 8.7%。在小应变下，$g(1-\epsilon) \approx -3\epsilon - 3\epsilon^2$ 与 $g(1+\epsilon) \approx 3\epsilon - 3\epsilon^2$ 在一阶上大小相同，只在二阶上有差别，而噪声把这一差别掩盖了。当数据无法区分差别时，错误的模型也可以拟合得很好，好的 $\chi^2_\nu$ 并不能证明模型是正确的。

### 步骤 9：绘图

三幅图，是本实验对[第 12 节](#s12)中图 1.25 至 1.27 的复现。第一幅：带误差棒的数据、20% 范围的 neo-Hookean 拟合及其带 95% 置信带的外推，以及 Gent 拟合。

```python
fine = np.linspace(0.6, 0.99, 200)
c1_hat, se_c1 = fit20["c1"], fit20["se"]
band = 1.96 * 2.0 * np.abs(g(fine)) * se_c1
fig, ax = plt.subplots(figsize=(7, 4.5))
ax.errorbar(1 - lam, p_meas, yerr=sigma, fmt="o", ms=4, capsize=2, color="k",
            label="measured, $\\pm\\sigma_i$")
ax.plot(1 - fine, p_neo_hookean(fine, c1_hat), color="tab:red",
        label="neo-Hookean fitted to strains up to 20%")
ax.fill_between(1 - fine, p_neo_hookean(fine, c1_hat) - band,
                p_neo_hookean(fine, c1_hat) + band, color="tab:red", alpha=0.25,
                label="95% band (noise only)")
ax.plot(1 - fine, p_gent(fine, *gent_all["theta"]), color="tab:blue",
        label="Gent fitted to all 16 points")
ax.axvline(0.2, color="grey", ls=":")
ax.set_xlabel("compressive strain $1 - \\lambda$")
ax.set_ylabel("nominal stress (kPa)")
ax.set_title("Neo-Hookean fit: clean to 20% strain, wrong beyond it")
ax.legend(fontsize=8)
plt.show()
```

第二幅：各个模型在全部点上的归一化残差。虚线标出 $\pm 2$。

```python
resid_nh20 = (p_meas - p_neo_hookean(lam, fit20["c1"])) / sigma
resid_nh_all = fit_all["norm_resid"]
resid_gent = (p_meas - p_gent(lam, *gent_all["theta"])) / sigma
fig, ax = plt.subplots(figsize=(7, 3.8))
ax.plot(1 - lam, resid_nh20, "o-", color="tab:red", label="neo-Hookean, fitted to 20%")
ax.plot(1 - lam, resid_nh_all, "s-", color="tab:orange",
        label="neo-Hookean, all 16 points")
ax.plot(1 - lam, resid_gent, "^-", color="tab:blue", label="Gent, all 16 points")
for level in (-2, 0, 2):
    ax.axhline(level, color="grey", ls="--" if level else "-", lw=0.8)
ax.set_xlabel("compressive strain $1 - \\lambda$")
ax.set_ylabel("normalised residual $(P_i - \\hat P_i)/\\sigma_i$")
ax.set_title("Residuals: runs of one sign reveal the wrong model")
ax.legend(fontsize=8)
plt.show()
```

第三幅：两个应变范围下 $(c_1, \beta)$ 的联合 95% 置信椭圆。椭圆为 $\{\theta : (\theta - \hat\theta)^\top \mathrm{Cov}^{-1} (\theta - \hat\theta) \le
\chi^2_{2,\,0.95}\}$，通过协方差的特征分解映射单位圆来绘制。

```python
def ellipse(theta_hat, cov, level=0.95, points=200):
    vals, vecs = np.linalg.eigh(cov)
    angle = np.linspace(0, 2 * np.pi, points)
    circle = np.stack([np.cos(angle), np.sin(angle)])
    radius = np.sqrt(chi2.ppf(level, 2))
    return theta_hat[:, None] + radius * vecs @ (np.sqrt(vals)[:, None] * circle)

fig, ax = plt.subplots(figsize=(6, 4.5))
for f, label, colour in ((gent_all, "all 16 points (to 40% strain)", "tab:blue"),
                         (gent_20, "first 8 points (to 20% strain)", "tab:red")):
    xy = ellipse(f["theta"], f["cov"])
    ax.plot(xy[0], xy[1], color=colour, label=label)
    ax.plot(*f["theta"], "o", color=colour)
ax.plot(10.0, 0.2, "k*", ms=10, label="true value")
ax.set_xlabel("$c_1$ (kPa)")
ax.set_ylabel("$\\beta$")
ax.set_title("95% confidence ellipses of the Gent parameters")
ax.legend(fontsize=8)
plt.show()
```

### 你应该看到什么

- 在适用范围之内，neo-Hookean 拟合干净，精确到 1%。在范围之外，40% 应变处的预测偏低 13%，约为其自身置信带的八倍：区间度量的是噪声，而不是模型误差。
- 一旦数据到达两个模型出现差别的应变，长长的同号残差游程以及远大于 1 的 $\chi^2_\nu$ 就会暴露错误的模型。错误模型的标准误差会随着数据增多而缩小。
- 对这个条件良好的拟合，线性化的不确定度与蒙特卡洛一致。联合拟合的参数是相关的，而没有任何数据触及的 $\beta$ 是无法确定的：20% 范围的椭圆比全范围的大得多，并一直延伸到 $\beta = 0$。
- 加载方向是模型的一部分。误读它，在 20% 应变范围内会产生 28.5% 的误差，而在小范围内残差并不会暴露它。

### 动手试试

1. **另一个模型。** 拟合 Mooney–Rivlin 模型 $P = 2(\lambda - \lambda^{-2})(c_1 + c_2/\lambda)$，它对 $(c_1, c_2)$ 是线性的（两列的加权最小二乘），并把它向 40% 应变的外推与 Gent 的比较。$\chi^2_\nu$ 说明了什么，外推的置信带又说明了什么？
2. **实验设计。** 只有 8 个点时，选择使 $\beta$ 的标准误差最小的拉伸比（试试把八个点全部取在 $[0.6, 0.8]$ 内，与均匀间隔的设计比较），然后重新计算。再根据结果论证下一次试验应把点放在哪里。
3. **未知噪声。** 把记录的 $\sigma_i$ 换成由残差估计的单个未知 $\sigma$，即 $\hat\sigma^2 = \sum_i r_i^2/(n - p)$，并比较参数区间。什么时候这会是唯一的选择，它又让你付出什么代价？
