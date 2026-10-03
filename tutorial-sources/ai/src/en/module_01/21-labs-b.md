## Lab 4 — The leakage clinic {#lab4}

**Goal.** Build three evaluation pipelines that report excellent scores for the wrong reason, find
each leak by asking what information crossed the split, and repair it. You then put bootstrap
confidence intervals on honest results and compare two classifiers with a paired bootstrap and
McNemar's exact test. The scores of the leaky pipelines are high on purpose. Nothing in the code of
a leaky pipeline looks wrong, so the habit to build is a question rather than a tool: for every
number you report, which rows and which fitted statistics were allowed to see the rows it was
scored on? The theory is in [Section 10](#s10) and the metrics in [Section 7](#s7). Everything runs
on a laptop CPU in well under a minute and needs no download.

### Step 1: set up

The lab uses scikit-learn only. `StratifiedKFold`, `KFold`, `GroupKFold` and `TimeSeriesSplit` are
the splitting schemes of the lab; each answers a different question about what a "new" case means.

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

### Step 2: leak 1, selecting features before cross-validation

The data are pure noise: 100 cases, 5,000 features, labels drawn by a coin. No model can do better
than 50% on new data, because there is nothing to learn.

The leaky pipeline first picks the 20 features that correlate best with the label, using all 100
rows, and only then cross-validates a classifier on those 20 columns. Among 5,000 candidates the 20
best-looking columns look good by selection alone: the maximum of 5,000 noise correlations is far
from zero. Cross-validation then splits the rows, but the selection has already seen every row,
including each fold's test rows, so the test labels have leaked into the choice of features.

The honest pipeline puts the selection inside a `Pipeline`, so that it is refitted on the training
part of each fold and never sees that fold's test rows. Both use the same folds.

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

The honest figure scatters around 0.5, as it must. The leaky figure is far above it for every seed:
a "result" manufactured from noise. The spread across folds of the leaky score is small, which
makes the number look reliable as well as good.

### Step 3: the mild case, standardising before cross-validation

The same mistake with a harmless statistic. Here the whole breast-cancer data set is standardised
first, using the mean and standard deviation of all 569 rows, and then cross-validated; the honest
version fits the scaler inside the pipeline. The leak is real, since each test row has influenced
the mean and variance used to scale it, but a mean and a variance are two numbers per feature
estimated from hundreds of rows, and each row's influence on them is of order $1/N$.

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

The two agree. Unsupervised preprocessing that estimates a handful of numbers from many rows leaks
little. Do not conclude that it is safe: a statistic estimated from few rows, or one that uses the
label (as the feature selection above does), is not harmless. The rule is to put every fitted step
in the pipeline, because it costs nothing and removes the need to judge each case.

### Step 4: leak 2, the same specimen on both sides of the split

Forty specimens, each measured ten times. Every specimen has a fingerprint (a ten-dimensional
vector that identifies it, such as its geometry or the way it was machined) and a binary label,
say defective or sound. The ten rows of a specimen are its fingerprint plus small measurement
noise. The label has a weak real effect: it shifts column 0 by $\pm 0.3$. So there is a signal, but
it is small compared with the spread of the fingerprints between specimens.

A row-wise split puts some rows of a specimen in training and its other rows in the test fold. A
flexible model then recognises the specimen from its fingerprint and reads the label off from
memory. That is not the property you wanted to predict, and it will not transfer to a new specimen.
`GroupKFold` keeps all rows of a specimen on one side.

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

The row-wise scores are close to perfect for both models. Split by specimen they are near chance
with a wide spread across folds: with 40 specimens, eight per fold, and a weak signal, that is what
the data can support. The row-wise figure was not the same estimate with a little more optimism. It
answered a different question, "can the model recognise a specimen it has seen?".

### Step 5: leak 3, shuffling a time series

A pump's bearing temperature is logged hourly for 120 days. The target is a derived quantity (say
the temperature of the casing), made of a daily cycle, a part that follows the bearing temperature,
and a slow random drift, plus noise of standard deviation 2. The features are the time index `t`,
the hour of day and the bearing temperature. Because the noise has standard deviation 2.0, no model
can reach an RMSE below 2.0 on new data: that is the noise floor.

A shuffled split puts hour 100 in training and hours 99 and 101 in the test fold. The drift is
almost constant across three hours, so a forest that has learned "time index near 100 means about
this level" interpolates it. That is possible only because the future leaked into the past.
`TimeSeriesSplit` trains on an initial stretch and tests on the stretch that follows, and `gap=24`
leaves a day between them, so that the last training hour is not adjacent to the first test hour.

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

The shuffled score sits just above the noise floor of 2.0: the model appears to explain almost
everything that can be explained. Forward chaining gives an RMSE about twice as large and an $R^2$
near zero, because the model cannot extrapolate a random walk that has wandered away from where it
was in the training period. Both are honest answers to different questions; only the second is the
question "how will this model do on next month's data?". The $R^2$ of a forward-chaining fold uses
that fold's own variance as its baseline and can be negative, so prefer RMSE when you compare
splitting schemes.

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

### Step 6: intervals on an honest result

Now a result that is honest, and the question of how precise it is. Split the breast-cancer data as
Lab 2 does (25% test, stratified, `random_state=0`, giving 143 test cases) and fit two classifiers:
logistic regression and 15-nearest neighbours, both after standardisation.

The **percentile bootstrap** resamples the 143 test cases with replacement $R = 2{,}000$ times,
recomputes the accuracy on each resample, and reports the 2.5th and 97.5th percentiles. The same
resampled indices are used for both models, which is what makes the comparison paired in the next
block.

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

The two intervals overlap, which is often read as "no significant difference". That reading is
wrong in general: the two accuracies are computed on the same cases, the cases that are easy for
one model are mostly easy for the other, so the errors are positively correlated and the
difference is determined more precisely than either accuracy. The paired bootstrap resamples the
*difference* case by case; its histogram is the lab's version of the right
panel of Figure 1.22.

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

The paired interval excludes zero. The replicates show why: the difference can be zero or negative
only if a resample draws none of the five cases on which the models disagree, and the probability
of that is $(138/143)^{143}$.

### Step 7: McNemar's exact test, and why the bootstrap and the test disagree

Only the discordant cases carry information about the difference: where both models are right, or
both are wrong, they say nothing about which is better. Under the null hypothesis that the two
models are equally accurate, each discordant case is equally likely to go either way, so the number
of cases in which A alone is right is binomial with $n_{10} + n_{01}$ trials and success
probability 0.5. **McNemar's exact test** is the binomial test on that count. Here $n_{10}$ counts
the cases A gets right and B wrong, and $n_{01}$ the reverse.

The familiar $\chi^2$ form, $(n_{10} - n_{01})^2/(n_{10} + n_{01})$, approximates the exact test
for large counts. With few discordant cases it overstates the evidence. Here are all three.

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

The methods give different answers to "is the difference of 0.035 real?". The paired bootstrap says
yes, and so does the plain $\chi^2$ (p = 0.025). The exact test, which is the correct one for
these counts, does not reject at 5% ($p = 0.0625$); the continuity-corrected $\chi^2$ agrees with
it in verdict. They disagree because there is so little to decide on. The bootstrap resamples the
observed cases, and with five discordant cases and none the other way, every resample that
contains at least one of them has a positive difference, so the interval cannot straddle zero. It
treats the sample's five-to-zero split as if it were the truth, which understates the uncertainty
when the count is that small. A five-to-zero split is also not improbable under a fair coin: it
happens with probability $2 \times (1/2)^5 = 0.0625$.

The honest report is the difference (0.035, five cases in 143), the discordant counts (5 and 0) and
the exact p-value (0.0625), with the statement that the data suggest logistic regression is better
but 143 cases are too few to be sure. Reporting only "the paired bootstrap interval excludes zero"
would be a correct statement of a misleading result. Decide on the exact test before looking at the
counts, not after.

### Step 8: the summary table

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

### What you should see

- Selecting features on all the data manufactures about 0.87 accuracy from pure noise; inside the
  pipeline the score returns to chance, about 0.50, for every seed.
- Standardising on all the data changes nothing measurable for the breast-cancer data: the leak
  exists and is negligible. The fix is free, so make it anyway.
- Split by row, both models recognise specimens rather than learn the property. Split by
  specimen, both are near chance with a wide spread, which is the honest picture of 40 specimens
  and a weak signal.
- The shuffled time-series score is at the noise floor because the forest interpolates the drift
  from neighbouring hours. Forward chaining shows that it cannot forecast the drift.
- Separate intervals overlap while the paired interval excludes zero, so comparisons need paired
  methods. McNemar's exact test (p = 0.0625) does not reject at 5%: with five discordant cases the
  bootstrap interval is too narrow. The honest summary is the difference, the counts, and the exact
  p-value.

### Try this

1. **Selection bias in model choice.** On pure noise with `X` of shape `(100, 50)`, score 200 random
   subsets of 5 features by 5-fold cross-validation and keep the best: it reaches about 0.67. Then
   wrap the search in an outer 5-fold loop (nested cross-validation: choose the subset inside each
   outer training part, score it on the outer test part) and see the score fall to about 0.56.
   (Those are the values for data drawn with `default_rng(0)`; seeds 1 and 2 give 0.70 and 0.60,
   0.64 and 0.54, so the gap of about 0.1 is the stable part.) The
   best of many noisy scores is an optimistic estimate of its own quality. This takes about 20
   seconds.
2. **Cluster bootstrap.** For leak 2, resample specimens rather than rows and compare the width of
   the interval with the row bootstrap's. The rows of a specimen are not independent, so the row
   bootstrap is too narrow.
3. **Target leakage.** Add a column equal to the label plus small noise (a "result code" recorded
   after the outcome) and watch every model become brilliant under every splitting scheme.
   Splitting cannot repair a feature that is not available at prediction time; only knowing what
   the feature means can.
4. **The seed lottery.** Repeat Step 6 with `random_state` 1 to 5 in the split. How often is
   logistic regression better? What happens to the discordant counts and the exact p-value?

## Lab 5 — Fitting a hyperelastic material model {#lab5}

**Goal.** Fit the neo-Hookean coefficient $c_1$ of a soft hydrogel to a synthetic compression test
by weighted least squares, check the formula for its uncertainty against a Monte Carlo experiment,
and then watch a fit that is clean inside its range fail outside it. You detect the misfit from the
residuals, fit the Gent model (which has a parameter inside a denominator and so needs nonlinear
least squares), look at how its two parameters trade off against each other, and write the input
checks that make a fitting routine refuse what it cannot honour. The background is
[Section 12](#s12); the least-squares and uncertainty formulas are from [Section 2](#s2) and
[Section 5](#s5). The data are synthetic so that every number can be reproduced. Everything runs on
a laptop CPU in a few seconds and needs no download.

### Step 1: the model and the synthetic test

Under uniaxial stretch $\lambda$ (the deformed length over the original, so compression has
$\lambda < 1$), an incompressible neo-Hookean solid has nominal stress

$$P = 2c_1\,g(\lambda), \qquad g(\lambda) = \lambda - \lambda^{-2}.$$

The Gent model stiffens as the polymer chains approach their limit of extensibility:

$$P = \frac{2c_1\,g(\lambda)}{1 - \beta\,(I_1 - 3)}, \qquad I_1 - 3 = \lambda^2 + \frac{2}{\lambda} - 3,$$

where $\beta = 1/J_m$, and $\beta = 0$ recovers neo-Hookean. The "true" material in this lab is Gent
with $c_1 = 10$ kPa and $\beta = 0.2$. The test has 16 stretches $\lambda = 1 - 0.025k$ for
$k = 1, \dots, 16$ (strains of 2.5% to 40%). Each point has a recorded standard uncertainty
$\sigma_i = 0.05\ \text{kPa} + 0.02\,|P_{\text{true},i}|$, a small floor plus 2% of the reading, and
the measurement is the true stress plus Gaussian noise of that size. Compression stresses are
negative in this convention.

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

The stress runs from $-1.51$ kPa at 2.5% strain to $-49.93$ kPa at 40%, and the recorded
uncertainty grows with it. That is why the fit must be weighted: an unweighted fit would let the
large-stress points, which have the largest absolute noise, dominate.

### Step 2: refuse what cannot be honoured

A fitting routine that always returns a number is dangerous, because a number looks like a result.
Before fitting, `check_inputs` rejects a missing or non-positive uncertainty (weighted least
squares has no meaning without one), stretches on the wrong side of 1 for the declared loading
direction, and stresses whose sign contradicts that direction. After fitting, the routine also
refuses a non-positive stiffness, since that is not a material. Each refusal says why.

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

### Step 3: weighted least squares in closed form

The likelihood is Gaussian with a different variance for each point, so maximum likelihood is
weighted least squares: minimise $\sum_i w_i\,(P_i - 2c_1 g_i)^2$ with $w_i = 1/\sigma_i^2$. Setting
the derivative to zero gives

$$\hat c_1 = \frac{\sum_i w_i P_i g_i}{2\sum_i w_i g_i^2}, \qquad
\operatorname{Var}(\hat c_1) = \frac{1}{4\sum_i w_i g_i^2},$$

the variance following because $\hat c_1$ is linear in the noisy $P_i$. Two diagnostics follow: the
**normalised residuals** $(P_i - \hat P_i)/\sigma_i$, which should look like standard normal draws,
and $\chi^2_\nu$, the sum of their squares divided by the $n - 1$ degrees of freedom, which should
be near 1.

We fit the first 8 points only, strains up to 20%, where a neo-Hookean model is a reasonable
description. The routine also reports the RMS residual divided by the largest measured stress in
the fitted range, a convention that makes fits to different specimens comparable (quote it with the
strain range fitted over). A call to `scipy.optimize.least_squares` on the weighted residuals should
give the same $c_1$.

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

The fit recovers $c_1 \approx 10.09$ kPa against the true 10, with a standard error of 0.10: the
estimate is within one standard error of the truth. The normalised residuals scatter within about
$\pm 1.2$ with no pattern, and $\chi^2_\nu = 0.71$ is consistent with 1 (with 7 degrees of freedom
the 95% range of $\chi^2_\nu$ is roughly 0.24 to 2.3). The model is adequate for these data, even
though it is not the true model.

### Step 4: check the quoted uncertainty by simulation

The formula $\operatorname{Var}(\hat c_1) = 1/(4\sum_i w_i g_i^2)$ assumes the noise is exactly as
recorded. Check it by simulation: generate 1,000 new data sets from the fitted curve plus fresh
noise with the same $\sigma_i$, refit each, and compare the spread of the 1,000 coefficients with
the formula.

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

The two standard deviations agree to within a percent or so. For a model that is linear in its
parameter the formula is exact, so the only disagreement is the simulation's own sampling error
(about $1/\sqrt{2 \times 1000} = 2\%$ of the SD). The check earns its keep for the nonlinear fit
below, where the formula is only a linearisation.

### Step 5: extrapolating with a confidence band

The variance of $c_1$ gives a band on the prediction at any stretch: $P(\lambda) = 2c_1 g(\lambda)$
is linear in $c_1$, so its standard error is $2|g(\lambda)|\,\mathrm{SE}(c_1)$, and the 95% band is
$\pm 1.96$ times that. Predict the stress at $\lambda = 0.7$ (30% strain) and $\lambda = 0.6$ (40%),
beyond the fitted range, and compare with the true material.

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

The prediction at 40% strain is 13% low, which is 6.6 kPa against a band half-width of 0.85 kPa:
about eight times the band. The band is correct for what it claims: it says how much the
measurement noise moves $c_1$. It says nothing about whether the model is right where you are
extrapolating, and here it is not, because the true material stiffens (the $\beta$ term) and the
neo-Hookean curve cannot. Statistical uncertainty is not model error, and extrapolation is where
model error lives.

### Step 6: the misfit shows in the residuals

Now fit all 16 points with the same model and look at the residual signs. A correct model leaves
residuals of random sign. A wrong model leaves long runs.

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

The coefficient has moved to about 10.55 and its standard error has fallen to 0.06, so the
estimate looks *more* precise, while $\chi^2_\nu = 4.5$ is far from 1 and the signs come in two
runs, ten of one sign and six of the other. With 15 degrees of freedom the 95% upper limit of
$\chi^2_\nu$ is about 1.7, so the fit is rejected. The smaller standard error is not reassuring:
more data of the same kind shrinks the statistical error of a wrong model without bringing it
closer to the truth.

### Step 7: the Gent model by nonlinear least squares

$P_\text{Gent}$ is linear in $c_1$ but not in $\beta$, so there is no closed form. Use
`least_squares` on the weighted residuals, starting from $(5, 0)$, with bounds $c_1 \ge 0$ and
$0 \le \beta < 1/\max(I_1 - 3)$ (beyond that bound the denominator reaches zero inside the data)
and `x_scale="jac"`, so that parameters of different magnitude are treated evenly.

The uncertainty is the linearisation of the problem at the solution: with $\mathbf{J}$ the Jacobian
of the weighted residuals with respect to the parameters, $\operatorname{Cov}(\hat\theta) \approx
(\mathbf{J}^\top\mathbf{J})^{-1}$. That is the same formula as in the closed form, with $\mathbf{J}$
in place of the design matrix. We fit the full range and the 20% range, and check the standard
errors by Monte Carlo.

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

On all 16 points the Gent fit recovers both parameters ($c_1 \approx 9.95$, $\beta \approx 0.21$;
true 10 and 0.2) with $\chi^2_\nu = 0.40$, which is a good fit, indeed slightly better than
the noise allows: with 14 degrees of freedom a $\chi^2_\nu$ this low has a probability of about 2.5% under a correct
model. Read it as a chance draw from one seed, not as a property of
the method. The linearised standard errors agree with the Monte Carlo ones.

The two parameters are strongly negatively correlated, about $-0.78$: a larger $\beta$ stiffens the
curve at large strain, and a smaller $c_1$ compensates at small strain. Fitted to only the first
8 points, $\beta$ is $0.21 \pm 0.21$: consistent with the truth, and also with zero. Data that
never reach the strains where $\beta$ matters cannot determine it, and the correlation is higher
(about $-0.83$).

### Step 8: the loading direction is part of the model

A subtler error than a wrong model form is reading the experiment wrongly. Suppose the compression
test is entered as a tension test: $\lambda = 1 + \text{strain}$ and stress $|P|$. The checks pass
for a declared tension, and the model fits a coefficient.

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

Over 20% strain the misread fit gives $c_1 = 12.97$ kPa, 28.5% too high, and $\chi^2_\nu = 20.7$
announces the problem. Over the first 5% only (two points) the misread fit is clean
($\chi^2_\nu = 0.38$) and still 8.7% high. At small strain
$g(1-\epsilon) \approx -3\epsilon - 3\epsilon^2$ and $g(1+\epsilon) \approx 3\epsilon - 3\epsilon^2$
have the same magnitude at first order and differ only at second order, which the noise hides. A
wrong model can fit well when the data cannot tell the difference, and a good $\chi^2_\nu$ is not
evidence that the model is correct.

### Step 9: the plots

Three figures, the lab's versions of Figures 1.25 to 1.27 in [Section 12](#s12). First, the data with error bars, the 20% neo-Hookean fit and its extrapolation with
the 95% band, and the Gent fit.

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

Second, the normalised residuals of the models on all points. Dashed lines mark $\pm 2$.

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

Third, the joint 95% confidence ellipses of $(c_1, \beta)$ for the two strain ranges. The ellipse is
$\{\theta : (\theta - \hat\theta)^\top \mathrm{Cov}^{-1} (\theta - \hat\theta) \le
\chi^2_{2,\,0.95}\}$, drawn by mapping the unit circle through the eigen-decomposition of the
covariance.

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

### What you should see

- Inside its range the neo-Hookean fit is clean and precise to 1%. Outside it the prediction at 40%
  strain is 13% low, about eight times its own band: the interval measures noise, not model error.
- Long runs of same-signed residuals and $\chi^2_\nu$ well above 1 reveal the wrong model once the
  data reach the strains where the models differ. The standard error of the wrong model shrinks as
  data are added.
- Linearised uncertainties agree with Monte Carlo for this well-conditioned fit. Jointly fitted
  parameters are correlated, and $\beta$ is undetermined by data that never exercise it: the
  ellipse for the 20% range is far larger than the full-range one and extends to $\beta = 0$.
- The loading direction is part of the model. Misreading it gives 28.5% error over 20% strain, and
  over a small range the residuals do not betray it.

### Try this

1. **Another model.** Fit Mooney–Rivlin, $P = 2(\lambda - \lambda^{-2})(c_1 + c_2/\lambda)$, which is
   linear in $(c_1, c_2)$ (a two-column weighted least squares), and compare its extrapolation to
   40% strain with Gent's. What does $\chi^2_\nu$ say, and what does the extrapolation band say?
2. **Experimental design.** With only 8 points, choose the stretches that minimise the standard
   error of $\beta$ (try all eight in $[0.6, 0.8]$ against the evenly spaced design) and recompute.
   Then argue from the result where the next test should put its points.
3. **Unknown noise.** Replace the recorded $\sigma_i$ by a single unknown $\sigma$ estimated from
   the residuals, $\hat\sigma^2 = \sum_i r_i^2/(n - p)$, and compare the parameter intervals. When
   would this be the only option, and what does it cost you?
