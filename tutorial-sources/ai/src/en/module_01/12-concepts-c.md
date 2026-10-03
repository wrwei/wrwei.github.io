## Regularisation as prior knowledge: ridge, lasso and MAP {#s9}

[Section 8](#s8) traced the failure of flexible models to their variance. **Regularisation**
trades some of that variance for bias on purpose, usually by adding a penalty to the loss:
$\mathcal{L}_\lambda(\theta) = \mathcal{L}(\theta) + \lambda\,\Omega(\theta)$, with
$\Omega = \lVert\mathbf{w}\rVert_2^2$ for **ridge regression** and $\lVert\mathbf{w}\rVert_1$ for
the **lasso**. The penalty is not an arbitrary add-on: it states what you believed about the
parameters before seeing the data. In this section $\lambda$ is the regularisation strength, and
the eigenvalues of $\mathbf{X}^\top\mathbf{X}$ are written $s_i^2$.

### The prior is the regulariser

Bayes' rule applied to the parameters reads

$$
p(\theta \mid \mathcal{D}) = \frac{p(\mathcal{D} \mid \theta)\,p(\theta)}{p(\mathcal{D})}
\;\propto\; p(\mathcal{D} \mid \theta)\,p(\theta).
$$

The **prior** $p(\theta)$ says which parameters are plausible before the data, the likelihood of
[Section 5](#s5) how well each explains the data. The **maximum a posteriori** (MAP) estimate
maximises the posterior's logarithm:

$$
\hat\theta_\text{MAP} = \argmax_\theta \big[\ln p(\mathcal{D} \mid \theta) + \ln p(\theta)\big].
$$

Maximum likelihood is MAP with a flat prior. Any other prior adds $-\ln p(\theta)$ to the
negative log-likelihood: the prior is the regulariser.

### Ridge as MAP, constants kept

Take Gaussian noise, $y_i = \mathbf{w}^\top\mathbf{x}_i + \varepsilon_i$ with
$\varepsilon_i \sim \mathcal{N}(0, \sigma^2)$, and the prior
$\mathbf{w} \sim \mathcal{N}(\mathbf{0}, \tau^2\mathbf{I})$: each weight is believed to be of
size about $\tau$. The negative log-posterior is

$$
-\ln p(\mathbf{w} \mid \mathcal{D})
= \frac{1}{2\sigma^2}\lVert\mathbf{X}\mathbf{w} - \mathbf{y}\rVert^2
+ \frac{1}{2\tau^2}\lVert\mathbf{w}\rVert^2 + \text{const}.
$$

Multiplying by the positive constant $2\sigma^2/N$ leaves the minimum where it is and gives this
module's mean loss plus a penalty:

$$
\frac{1}{N}\lVert\mathbf{X}\mathbf{w} - \mathbf{y}\rVert^2 + \lambda\lVert\mathbf{w}\rVert^2,
\qquad \lambda = \frac{\sigma^2}{N\tau^2}. \tag{9.1}
$$

A tighter prior (smaller $\tau$) or noisier data enlarge the penalty. More data shrink it: the
evidence outweighs the prior, and with enough data MAP and maximum likelihood agree.

::: worked title="The MAP strength for Lab 3's noise"
With $\sigma = 0.3$ and $\tau = 1$: for $N = 20$, $\lambda = 0.09/(20\times1) = 0.0045$; for
$N = 200$, $\lambda = 0.09/200 = 0.00045$. Ten times the data, a tenth of the penalty.
:::

### The closed form always exists

Set the gradient of (9.1) to zero, as in [Section 2](#s2), and multiply by $N/2$:

$$
\frac{2}{N}\mathbf{X}^\top(\mathbf{X}\mathbf{w} - \mathbf{y}) + 2\lambda\mathbf{w} = \mathbf{0}
\quad\Longrightarrow\quad
(\mathbf{X}^\top\mathbf{X} + \lambda N\mathbf{I})\,\mathbf{w} = \mathbf{X}^\top\mathbf{y}.
$$

$\mathbf{X}^\top\mathbf{X}$ has eigenvalues $s_i^2 \ge 0$, the squared singular values of
$\mathbf{X}$. Adding $\lambda N\mathbf{I}$ adds $\lambda N$ to each, so every eigenvalue is at
least $\lambda N > 0$ and the system is solvable with a duplicated column, with more columns
than rows, with any data.

### Each direction shrunk by its own factor

With the thin singular value decomposition $\mathbf{X} = \mathbf{U}\boldsymbol{\Sigma}\mathbf{V}^\top$
(orthonormal columns $\mathbf{u}_i$ and $\mathbf{v}_i$, singular values $s_i$),
$\mathbf{X}^\top\mathbf{X} = \mathbf{V}\boldsymbol{\Sigma}^2\mathbf{V}^\top$, the solution is
$\mathbf{w}_\lambda = \mathbf{V}(\boldsymbol{\Sigma}^2 + \lambda N\mathbf{I})^{-1}\boldsymbol{\Sigma}\mathbf{U}^\top\mathbf{y}$,
and the fitted values are

$$
\hat{\mathbf{y}} = \mathbf{X}\mathbf{w}_\lambda
= \sum_i \mathbf{u}_i\,\frac{s_i^2}{s_i^2 + \lambda N}\,\mathbf{u}_i^\top\mathbf{y}.
$$

Least squares keeps every component $\mathbf{u}_i^\top\mathbf{y}$ whole: Section 2's projection.
Ridge multiplies each by its own **shrinkage factor** $s_i^2/(s_i^2 + \lambda N)$, near 1 where
the data vary strongly and near 0 where they barely vary.

The variance says why. Along $\mathbf{v}_i$ the least-squares coefficient is
$\mathbf{u}_i^\top\mathbf{y}/s_i$; its noise part has variance $\sigma^2/s_i^2$, so a direction
the data barely constrain is set by noise divided by a small number. The ridge coefficient,
$s_i\,\mathbf{u}_i^\top\mathbf{y}/(s_i^2 + \lambda N)$, has variance
$\sigma^2 s_i^2/(s_i^2 + \lambda N)^2$, which peaks at $s_i^2 = \lambda N$ and never exceeds
$\sigma^2/(4\lambda N)$. Ridge caps the variance in every direction and pays with bias only
where the data had little to say.

The sum of the factors, $\operatorname{df}(\lambda) = \sum_i s_i^2/(s_i^2 + \lambda N)$, is the
**effective degrees of freedom**. It equals the number of columns at $\lambda = 0$ when they are
independent (the trace of the hat matrix, [Section 2](#s2)) and falls smoothly to 0 as $\lambda$
grows: a continuous capacity knob.

::: worked title="Shrinkage factors"
$\mathbf{X}^\top\mathbf{X}$ has eigenvalues 100 and 0.01, and $\lambda N = 1$. The factors are
$100/101 = 0.990$ and $0.01/1.01 = 0.0099$: the well-determined direction is untouched, the
poorly determined one nearly removed. The condition number falls from $100/0.01 = 10^4$ to
$101/1.01 = 100$.
:::

### Weight decay

A gradient step on the ridge loss is

$$
\mathbf{w} \leftarrow \mathbf{w} - \eta\big(\nabla\mathcal{L} + 2\lambda\mathbf{w}\big)
= (1 - 2\eta\lambda)\,\mathbf{w} - \eta\,\nabla\mathcal{L}.
$$

Every weight is first multiplied by $1 - 2\eta\lambda$, slightly below 1, which is why the L2
penalty is called **weight decay**. AdamW's decoupled version is in [Module 02, Section 8](module_02_EN.html#s8).

### Lasso: a Laplace prior, and exact zeros

A Laplace prior, $p(w_j) = \frac{1}{2b}\exp(-\lvert w_j\rvert/b)$, peaked at zero with heavier
tails, has negative logarithm $\lVert\mathbf{w}\rVert_1/b$ plus a constant. The scaling of (9.1)
gives the lasso, $\frac{1}{N}\lVert\mathbf{X}\mathbf{w} - \mathbf{y}\rVert^2 + \lambda\lVert\mathbf{w}\rVert_1$
with $\lambda = 2\sigma^2/(Nb)$. It drives coefficients **exactly** to zero, so it selects
features. Geometrically (Figure 1.18), penalising is equivalent to minimising the loss inside a
ball $\Omega(\mathbf{w}) \le t$: grow the elliptical loss contours until they touch the ball. The
L2 ball is round and is touched where every coordinate is non-zero. The L1 ball is a diamond with
corners on the axes, and an ellipse coming from a general direction tends to meet a corner first.

::: figure id=fig-01-18
Two panels in the $(w_1, w_2)$ plane, each with the elliptical contours of the least-squares loss
centred at the unconstrained solution, off both axes. Left: a disc (the L2 ball) touched by a
contour at a point where both $w_1$ and $w_2$ are non-zero. Right: a diamond (the L1 ball)
touched by a contour at its corner on the $w_1$ axis, so the lasso solution has $w_2 = 0$.
:::

The algebra is exact for an orthonormal design, $\mathbf{X}^\top\mathbf{X} = N\mathbf{I}$. The
least-squares solution is then $\hat{\mathbf{w}} = \mathbf{X}^\top\mathbf{y}/N$, and expanding the
square gives

$$
\frac{1}{N}\lVert\mathbf{X}\mathbf{w} - \mathbf{y}\rVert^2
= \mathbf{w}^\top\mathbf{w} - 2\mathbf{w}^\top\hat{\mathbf{w}} + \tfrac{1}{N}\mathbf{y}^\top\mathbf{y}
= \lVert\mathbf{w} - \hat{\mathbf{w}}\rVert^2 + \text{const},
$$

which separates into one problem per coordinate.

- **Ridge:** minimise $(w_j - \hat w_j)^2 + \lambda w_j^2$; setting
  $2(w_j - \hat w_j) + 2\lambda w_j = 0$ gives $w_j = \hat w_j/(1 + \lambda)$.
- **Lasso:** minimise $h(w_j) = (w_j - \hat w_j)^2 + \lambda\lvert w_j\rvert$. For $w_j > 0$,
  $2(w_j - \hat w_j) + \lambda = 0$ gives $w_j = \hat w_j - \lambda/2$, consistent only if
  $\hat w_j > \lambda/2$; symmetrically $w_j = \hat w_j + \lambda/2$ if $\hat w_j < -\lambda/2$.
  Otherwise the minimum is at the kink: at $w_j = 0$ the slope is $-2\hat w_j + \lambda \ge 0$
  to the right and $-2\hat w_j - \lambda \le 0$ to the left. Together, **soft-thresholding**:

$$
w_j = \operatorname{sign}(\hat w_j)\,\max\big(\lvert\hat w_j\rvert - \lambda/2,\; 0\big).
$$

Ridge scales; the lasso subtracts and clips (Figure 1.19 shows both on real data). In general the lasso has no closed form, and
**coordinate descent**, soft-thresholding one coordinate at a time, solves it. Among strongly
correlated features the lasso keeps one more or less arbitrarily; the **elastic net**, which
adds both penalties, keeps the group.

::: worked title="Ridge against lasso on an orthonormal design"
$\hat{\mathbf{w}} = (3.0, 0.4, -1.2)$ and $\lambda = 1$.

- Ridge divides by $1 + \lambda = 2$: $(1.5, 0.2, -0.6)$.
- Lasso subtracts $\lambda/2 = 0.5$ from each magnitude and clips: $3.0 - 0.5 = 2.5$;
  $0.4 - 0.5 < 0$, so 0; $-(1.2 - 0.5) = -0.7$. Result $(2.5, 0.0, -0.7)$.

The small coefficient is removed; the large ones are shifted by 0.5.
:::

### In practice

- **Standardise first.** The penalty treats all coefficients alike, but a coefficient's size
  depends on its feature's units: a length in millimetres needs a coefficient a thousand times
  smaller than in metres, and ridge would penalise it a million times less.
- **Do not penalise the intercept.** Centre $\mathbf{y}$ and the features, or exclude $b$, as
  Lab 3 does by replacing $\mathbf{I}$ with $\mathbf{I}'$, whose first diagonal entry is zero.
- **Choose $\lambda$ on a logarithmic grid** by validation or cross-validation. The
  **one-standard-error rule** (Hastie et al., 2009) takes the largest $\lambda$ whose
  cross-validated error is within one standard error of the best.
- **Map $\lambda$ to the library**, by dividing each library objective by a constant until it
  matches (9.1):

| Call | Objective it minimises | In this module's $\lambda$ |
|---|---|---|
| `Ridge(alpha)` | $\lVert\mathbf{y} - \mathbf{X}\mathbf{w}\rVert^2 + \alpha\lVert\mathbf{w}\rVert^2$ | $\alpha = \lambda N$ |
| `Lasso(alpha)` | $\frac{1}{2N}\lVert\mathbf{y} - \mathbf{X}\mathbf{w}\rVert^2 + \alpha\lVert\mathbf{w}\rVert_1$ | $\alpha = \lambda/2$ |
| `LogisticRegression(C)` | $\frac12\lVert\mathbf{w}\rVert^2 + C\sum_i \ell_i$ | $C = 1/(2N\lambda)$ |

::: worked title="Lab 3's ridge path at degree 15"
[Lab 3](#lab3) fits the degree-15 Legendre polynomial to its 20 points, constant term
unpenalised, for 23 values of $\lambda$ from $10^{-10}$ to 10.

| $\lambda$ | $\to 0$ | 0.032 | 10 |
|---|---|---|---|
| training RMSE | 0.112 | 0.182 | 0.832 |
| validation RMSE | 0.720 | 0.335 | 0.751 |

Five-fold cross-validation on the 20 points picks $\lambda = 0.032$, as does the
one-standard-error rule; its effective degrees of freedom are 10.4 of 16. On the test set the
refitted model scores RMSE 0.324, against 0.348 for the best unregularised degree (3) and 0.684
for unregularised degree 15: shrinking a flexible model beat choosing a small one. Read as a
prior through (9.1), $\tau = \sigma/\sqrt{N\lambda} = 0.3/\sqrt{20\times0.032} = 0.3/0.80 \approx 0.38$
on each Legendre coefficient.
:::

::: figure id=fig-01-19
Coefficient paths on the standardised `load_diabetes` data (442 patients, 10 features), against
$\log_{10}\lambda$ in this module's convention. Left: ridge; all ten coefficients shrink smoothly
towards zero and none reaches it. Right: lasso; the coefficients reach zero one at a time until
none is left. A vertical line in each panel marks the $\lambda$ chosen by five-fold
cross-validation. In scikit-learn's terms the ridge panel's `alpha` is $442\lambda$ and the
lasso panel's is $\lambda/2$.
:::

### Other regularisers

**Early stopping** regularises through the optimiser. Gradient descent from
$\mathbf{w}_0 = \mathbf{0}$ shrinks the error along each eigenvector of $\mathbf{H}$, eigenvalue
$h_i$ here, by $1 - \eta h_i$ per step ([Section 3](#s3)), so after $t$ steps that component of
$\mathbf{w}_t$ is the least-squares value times $1 - (1 - \eta h_i)^t$. Ridge's factor in the same
basis is $h_i/(h_i + 2\lambda)$, since $h_i = 2s_i^2/N$. Both are near 1 for large $h_i$; for
small $h_i$ they are about $\eta t\,h_i$ and $h_i/(2\lambda)$, which match when
$\lambda \approx 1/(2\eta t)$. Stopping early behaves roughly like ridge with a penalty that
weakens as training continues. **Data augmentation** ([Module 03, Section 10](module_03_EN.html#s10)), and
**dropout** and **noise injection** ([Module 02, Section 11](module_02_EN.html#s11)), regularise
networks.

::: check
The noise and the prior stay fixed and the number of training points doubles. What happens to the
MAP $\lambda$?
:::

::: answer
It halves, because $\lambda = \sigma^2/(N\tau^2)$: the data outweigh the prior.
:::

::: check
Why standardise features before ridge or lasso?
:::

::: answer
The penalty treats all coefficients alike, but a coefficient's size depends on its feature's
units, so without scaling the penalty falls arbitrarily hard on some features.
:::

::: check
The lasso sets a coefficient exactly to zero; ridge never does. Why, in one sentence?
:::

::: answer
The L1 penalty's slope does not vanish at zero, so small coefficients are clipped; the L2
penalty's derivative $2\lambda w$ does, so coefficients are only scaled.
:::

## Evaluating honestly: leakage, selection and intervals {#s10}

A test score is a fair estimate of the expected risk of [Section 1](#s1) only if the test cases
played no part in building the model, resemble the cases met in service, and the number is read
with its sampling noise. This section is the series' reference for standard errors, the
bootstrap and McNemar's test; Modules [07](module_07_EN.html) and [09](module_09_EN.html) apply
them to language-model benchmarks.

### How noisy a test number is

Score $n$ independent cases with a model of true accuracy $p$. The number correct is binomial,
so the observed accuracy $\hat p$ has variance $p(1 - p)/n$ and **standard error**

$$
\operatorname{SE}(\hat p) = \sqrt{\frac{p(1 - p)}{n}},
$$

and a 95% interval is about $\hat p \pm 1.96\,\operatorname{SE}$ by the central limit theorem.
The formula holds for any proportion, with $n$ the cases it is computed over: for recall, the
positives. The normal approximation fails with fewer than about ten errors or ten successes; use
the bootstrap or an exact binomial interval there. To **size a test set** for a half-width $h$,
invert the formula:

$$
n \approx \frac{1.96^2\,p(1 - p)}{h^2}.
$$

::: worked title="Standard errors and test-set size"
$p = 0.90$, $n = 200$: $\operatorname{SE} = \sqrt{0.9\times0.1/200} = \sqrt{0.00045} = 0.021$,
an interval of $\pm1.96\times0.021 = \pm0.042$; models at 0.88 and 0.92 cannot be told apart.
With $n = 2{,}000$: $\sqrt{0.09/2000} = 0.0067$, $\pm0.013$. For $\pm0.02$:
$n = 3.8416\times0.09/0.02^2 = 864.4$, about 865 cases.

Lab 2's recall, $51/53 = 0.962$, rests on the 53 malignant cases:
$\sqrt{0.962\times0.038/53} = 0.026$. With two misses, the normal approximation does not apply.
:::

### Test-set reuse and selection

**Test-set reuse** is looking at the test number, changing the model and looking again; each
change fits the model a little to the test set. The remedy is procedural: open the test set once
and report the number with the date it was opened.

**Selection** does the same to a validation set in one step. Each configuration's score is its
true performance plus noise, and the largest of many scores belongs to the configuration whose
noise was most favourable, so the winner is biased upwards even when no configuration is better.

::: worked title="The best of 200 equals"
Two hundred configurations all have true accuracy 0.80, each scored with standard error 0.01,
independently. The winner shows $0.80 + 0.01\,Z_{\max}$, with $Z_{\max}$ the largest of 200
standard normals. Integrating $z$ against the density of the maximum,
$200\,\phi(z)\,\Phi(z)^{199}$, gives $\E[Z_{\max}] = 2.746$, so the winner shows about 0.827
although none is better than 0.80. In [Lab 4](#lab4)'s extension, on pure noise, the best of
200 random five-feature subsets scores 0.67 by five-fold cross-validation; scored by nested
cross-validation, the same search gives 0.56.
:::

The remedy is **nested cross-validation** (Figure 1.20): an inner loop inside each outer training
portion does the selection, and the outer fold scores the model it chose, so the outer score
measures the whole procedure. It costs $k_\text{outer}\times k_\text{inner}\times$ the number of
configurations fits, $5\times3\times20 = 300$ for twenty values of $\lambda$. The deployed model
comes from running the inner selection once on all the data.

::: figure id=fig-01-20
Nested cross-validation: an outer ring of five folds, one held out for scoring in each round.
Inside each round's outer training portion, a smaller inner three-fold loop tries every
candidate $\lambda$ and picks one. Arrows show that the held-out outer fold only scores the model
chosen by the inner loop and never influences that choice.
:::

### Leakage

**Leakage** is any path by which information about the held-out labels reaches the model during
training. Its forms, each with a fix:

1. **Preprocessing fitted on all the data**: scaling, imputation, feature selection, target
   encoding. Fit them inside each fold with a scikit-learn `Pipeline`. Scaling usually leaks
   little; selection and target encoding can leak a great deal.
2. **Duplicates and near-duplicates** across the split, such as a weld image saved twice.
   Deduplicate before splitting.
3. **Groups**: repeated measurements of one part, specimen, patient or machine, split by row.
   The model learns to recognise units. Split by group (`GroupKFold`).
4. **Time**: a shuffled time series lets the model train on the future. Use forward-chaining
   splits with a gap before each validation block (`TimeSeriesSplit` with `gap`).
5. **Target leakage**: a feature recorded after the label was known, such as the repair cost in
   a failure predictor. Check when each feature is available in service.
6. **Test-set reuse**, above.

The rule behind all six: **split by the unit that will be new at deployment** (a new part, a new
patient, a new day), never by row (Figure 1.21).

::: worked title="Lab 4's leaks in numbers"
- **Selection on all the data.** 100 rows of pure noise, 5,000 features. Selecting 20 features
  on all rows, then cross-validating: accuracy $0.87 \pm 0.05$. Selection inside the pipeline:
  $0.50 \pm 0.09$, chance. (The $\pm$ is the spread over the five folds.)
- **Groups.** 40 specimens with 10 measurements each and a weak signal. Split by row: random
  forest 0.95, 5-NN 1.00. Split by specimen: 0.63 and 0.64.
- **Time.** A pump's casing temperature, which follows its bearing temperature and drifts
  slowly, logged hourly for 120 days and predicted by a random forest. Shuffled folds:
  RMSE 2.33, at the noise floor of 2.0. Forward chaining: 4.09. The forest interpolated the drift
  between neighbouring hours and cannot forecast it.
- **Scaling on all the data**, on `load_breast_cancer`: the accuracy changes by less than 0.001.
:::

::: figure id=fig-01-21
Four splitting schemes as timelines of rows, blue for training and orange for validation, for
data grouped by specimen and ordered in time. (a) Random row split: each specimen's rows fall on
both sides, which leaks. (b) Group split: each specimen's rows share one colour. (c)
Forward-chaining time split: each validation block follows its training rows after a grey gap.
(d) Both: validation specimens are held out entirely and come after the training period.
:::

### Distribution shift

The test set is drawn from the same $P$ as training; deployment is not. Under **covariate
shift** the inputs change and the input–output relation does not: a new sensor supplier with a
different offset. Under **label shift** the class proportions change: a process improvement
halves the defect rate, and precision falls with the prevalence ([Section 7](#s7)). Under
**concept drift** the relation itself changes: wear alters how vibration relates to remaining
life. Evaluate on data from the conditions the model will meet, even if there is less of it, and
in production monitor the inputs and outputs, not only the accuracy.

### Bootstrap intervals

The **bootstrap** estimates sampling noise by resampling: draw $n$ test cases with replacement,
recompute the metric, repeat $R = 2{,}000$ times, and take the 2.5th and 97.5th percentiles as a
95% interval. It needs no formula, so it serves the AUC, F1 or ECE as well as accuracy.

To compare two models on one test set, use the **paired bootstrap**: draw the indices once per
replicate, score both models on them and take the interval of the difference. Since
$\operatorname{Var}(\hat a - \hat b) = \operatorname{Var}\hat a + \operatorname{Var}\hat b - 2\operatorname{Cov}(\hat a, \hat b)$
and models find the same cases easy and the same ones hard, the paired interval is much narrower
than two separate intervals suggest. With grouped data, resample groups (the **cluster
bootstrap**).

Two caveats. The bootstrap over a test set measures test-sampling noise, not the variability
from retraining. And it cannot invent evidence: when a difference rests on a handful of cases
where the models disagree, every replicate is built from those few cases and the percentile
interval is too narrow. Use the exact test below.

### McNemar's test

Score classifiers A and B on the same $n$ cases. Cases both get right, or both get wrong, say
nothing about which is better; only the **discordant** ones do: $n_{10}$ that A alone gets right,
$n_{01}$ that B alone gets right. If the models are equally good, each discordant case is a fair
coin, so $n_{10} \sim \operatorname{Binomial}(n_{10} + n_{01}, \tfrac12)$, and the exact
two-sided p-value is $\min\big(1,\; 2\,P(X \le \min(n_{10}, n_{01}))\big)$
(`scipy.stats.binomtest`). This is **McNemar's test** (McNemar, 1947), recommended for comparing
classifiers by Dietterich (1998). The textbook statistic

$$
\chi^2 = \frac{(n_{10} - n_{01})^2}{n_{10} + n_{01}},
$$

compared with 3.84 (5% for $\chi^2$ with one degree of freedom), is a large-count approximation
that rejects too easily at moderate counts; its continuity-corrected form
$(\lvert n_{10} - n_{01}\rvert - 1)^2/(n_{10} + n_{01})$ tracks the exact test. The exact test
costs nothing, so use it, and report $n_{10}$ and $n_{01}$ with it.

::: worked title="Paired against separate intervals, and McNemar"
Lab 4 scores logistic regression and 15-NN on Lab 2's 143 test cases: 0.986 (2 errors) and
0.951 (7 errors). With $R = 2{,}000$ replicates the separate intervals, $[0.965, 1.000]$ and
$[0.909, 0.986]$, overlap, yet the paired difference, 0.035, has interval $[0.007, 0.070]$, which
excludes zero.

Five cases are discordant, all favouring logistic regression ($n_{10} = 5$, $n_{01} = 0$).
Exact test: $p = 2\times0.5^5 = 0.0625$, suggestive, not significant at 5%. ($\chi^2 = 25/5 = 5.0$
gives $p = 0.025$; corrected, $16/5 = 3.2$ gives 0.074.) The methods disagree because the
evidence is five cases: a replicate shows a difference of zero only by drawing none of them,
with probability $(138/143)^{143} = 0.006$, and none can show 15-NN ahead. Report the difference,
the counts 5 and 0 and the exact p-value; a larger test set would settle it (Figure 1.22).
:::

::: figure id=fig-01-22
Bootstrap distributions from Lab 4, 2,000 replicates. Left: overlapping histograms of the
replicate accuracies of logistic regression and 15-NN. Right: the histogram of the paired
difference, its 2.5% and 97.5% percentiles (0.007 and 0.070) marked clear of zero, and no bar
below zero. An annotation gives the discordant counts 5 and 0 and McNemar's exact $p = 0.0625$.
:::

::: worked title="The chi-square shortcut at moderate counts"
$n_{10} = 24$, $n_{01} = 12$: $(24 - 12)^2/36 = 4.0 > 3.84$, $p = 0.046$, "significant". The
exact test gives $p = 0.065$, and the corrected statistic $11^2/36 = 3.36$ gives $p = 0.067$.
:::

Applications built on language models raise evaluation problems of their own; the
[AI Agents series](../agent/index.html) has a module on them.

::: check
You standardise with the mean and variance of the whole dataset before cross-validation. Is it
leakage, and does it matter?
:::

::: answer
Yes, in principle. For scaling the effect is usually negligible (under 0.001 in Lab 4), but the
same habit with feature selection or target encoding can be large. Fit preprocessing inside each
fold.
:::

::: check
Twenty measurements were taken on each of 30 specimens. How do you split?
:::

::: answer
By specimen (`GroupKFold`), so that no specimen contributes rows to both training and
validation.
:::

::: check
Why compare two models with a paired bootstrap rather than two separate intervals?
:::

::: answer
They are scored on the same cases, so their errors are correlated; the paired difference cancels
the shared difficulty and has a much narrower interval.
:::

::: check
Two classifiers disagree on six test cases, all six in A's favour. Is A better at the 5% level?
:::

::: answer
McNemar's exact two-sided $p = 2\times0.5^6 = 0.031$, so yes, narrowly; five such cases would
give 0.0625. With five or fewer discordant cases no split can reach 5%.
:::

## Beyond linear: the methods you will meet {#s11}

Linear models are where every idea of this module is easiest to see, and often a good baseline.
When the boundary bends or the features interact, other methods do better. This section is a
tour with enough mechanism to know when each is the right baseline; the evaluation of Sections
[7](#s7) to [10](#s10) is how you find out.

### k-nearest neighbours and the curse of dimensionality

**$k$-nearest neighbours** (k-NN) predicts by averaging the targets, or taking a vote of the
labels, of the $k$ training points closest to the query. There is no training; a prediction
costs about $Nd$ operations to find the neighbours. $k$ is the capacity knob: $k = 1$
interpolates the training data, and a large $k$ averages so widely that it underfits. Distances
mix features, so scaling is essential: unscaled, the feature with the largest units decides who
is a neighbour. In a few dimensions k-NN is a strong baseline.

In many dimensions it fails, because neighbourhoods stop being local. For data spread uniformly
in the unit cube, a sub-cube holding a fraction $r$ of the data has edge $r^{1/d}$.

::: worked title="The curse of dimensionality"
For $r = 0.01$: $d = 1$ gives an edge of 0.01; $d = 2$, $0.01^{1/2} = 0.10$; $d = 10$,
$0.01^{1/10} = 0.63$; $d = 100$, $0.01^{1/100} = 0.955$. To collect the nearest 1% of the data
in 100 dimensions you must span 95.5% of every feature's range: the neighbours are not near.
:::

### Trees, forests and boosting

A **decision tree** splits the input space recursively by axis-aligned thresholds,
$x_j \le t$, choosing at each node the feature and threshold that most reduce the **impurity** of
the two children: the variance of the targets for regression; for classification the **Gini
impurity** $1 - \sum_k p_k^2$ or the entropy, with $p_k$ the class fractions in the node. Depth
is capacity. An increasing rescaling of a feature moves a threshold on it without changing which
points fall on each side, so trees need no scaling. They have high variance: a small change in the data can change the first split and
everything below it.

::: worked title="One Gini split"
A node holds 40 defective and 60 good parts: $1 - (0.4^2 + 0.6^2) = 0.48$. A split gives
children (30 defective, 10 good) and (10 defective, 50 good), with impurities
$1 - (0.75^2 + 0.25^2) = 0.375$ and $1 - ((1/6)^2 + (5/6)^2) = 0.278$. Weighted by size,
$0.4\times0.375 + 0.6\times0.278 = 0.317$: a decrease of 0.163.
:::

A **random forest** grows $M$ deep trees, each on a bootstrap sample of the rows and considering
a random subset of the features at each split, and averages them. If each tree's prediction has
variance $\sigma^2$ and any two have correlation $\rho$, the average has variance

$$
\operatorname{Var}\Big(\frac{1}{M}\sum_{m=1}^{M} T_m\Big)
= \frac{1}{M^2}\big[M\sigma^2 + M(M - 1)\rho\sigma^2\big]
= \rho\sigma^2 + \frac{(1 - \rho)\,\sigma^2}{M},
$$

the $M$ variances plus the $M(M - 1)$ covariances. More trees remove only the second term; the
first falls only if the trees are decorrelated, which is what the random feature subsets are
for. Each bootstrap sample leaves out about a third of the rows, so scoring every row with the
trees that did not see it gives the **out-of-bag** error, a validation estimate for free.

::: worked title="Forest variance"
$\sigma^2 = 1$, $\rho = 0.3$. $M = 10$: $0.3 + 0.7/10 = 0.37$. $M = 100$: $0.3 + 0.007 = 0.307$.
No number of trees goes below 0.3.
:::

**Gradient boosting** builds an additive model $F_m(\mathbf{x}) = F_{m-1}(\mathbf{x}) + \nu\,h_m(\mathbf{x})$
from small trees $h_m$, each fitted to the negative gradient of the loss with respect to the
prediction, evaluated at $F_{m-1}$. For squared error $\tfrac12(y - F)^2$ that is $y - F$, so
each tree is fitted to the current **residuals** $y_i - F_{m-1}(\mathbf{x}_i)$. It is gradient
descent in function space: the learning rate $\nu$ is traded against the number of trees $M$,
which early stopping on validation data chooses. XGBoost, LightGBM and scikit-learn's
`HistGradientBoosting` estimators are the common implementations (as of 2026). Boosting needs no
scaling and handles missing values natively. On tabular data of up to a few hundred thousand rows
it is very often the best method and the first thing to try; Grinsztajn et al. (2022) give
benchmark evidence that tree ensembles still beat deep networks on typical tabular data. "Very
often" is not "always": [Exercise 13](#e13) tests the claim on two datasets, and on one of them
ridge regression wins.

### Kernels and support vector machines

Replace $\mathbf{x}$ by a feature map $\phi(\mathbf{x})$, possibly of very high dimension, and
stack the mapped inputs as the rows of $\boldsymbol{\Phi}$. Ridge regression gives
$\mathbf{w} = (\boldsymbol{\Phi}^\top\boldsymbol{\Phi} + \lambda N\mathbf{I})^{-1}\boldsymbol{\Phi}^\top\mathbf{y}$.
Multiplying out shows the **push-through identity**,

$$
(\boldsymbol{\Phi}^\top\boldsymbol{\Phi} + \lambda N\mathbf{I})\,\boldsymbol{\Phi}^\top
= \boldsymbol{\Phi}^\top\boldsymbol{\Phi}\boldsymbol{\Phi}^\top + \lambda N\boldsymbol{\Phi}^\top
= \boldsymbol{\Phi}^\top(\boldsymbol{\Phi}\boldsymbol{\Phi}^\top + \lambda N\mathbf{I}),
$$

and multiplying on the left by $(\boldsymbol{\Phi}^\top\boldsymbol{\Phi} + \lambda N\mathbf{I})^{-1}$
and on the right by $(\boldsymbol{\Phi}\boldsymbol{\Phi}^\top + \lambda N\mathbf{I})^{-1}$ turns it
into $(\boldsymbol{\Phi}^\top\boldsymbol{\Phi} + \lambda N\mathbf{I})^{-1}\boldsymbol{\Phi}^\top = \boldsymbol{\Phi}^\top(\boldsymbol{\Phi}\boldsymbol{\Phi}^\top + \lambda N\mathbf{I})^{-1}$.
Hence

$$
\mathbf{w} = \boldsymbol{\Phi}^\top\boldsymbol{\alpha}, \qquad
\boldsymbol{\alpha} = (\mathbf{K} + \lambda N\mathbf{I})^{-1}\mathbf{y}, \qquad
K_{ij} = \phi(\mathbf{x}_i)^\top\phi(\mathbf{x}_j),
$$

and a prediction is

$$
f(\mathbf{x}) = \phi(\mathbf{x})^\top\mathbf{w} = \sum_{i=1}^{N}\alpha_i\,k(\mathbf{x}_i, \mathbf{x}),
\qquad k(\mathbf{x}, \mathbf{x}') = \phi(\mathbf{x})^\top\phi(\mathbf{x}').
$$

Only inner products appear, so $\phi$ never has to be formed: a **kernel** $k$ computes them
directly. This is the **kernel trick**, and the method is **kernel ridge regression**. The RBF
kernel $k(\mathbf{x}, \mathbf{x}') = \exp(-\gamma\lVert\mathbf{x} - \mathbf{x}'\rVert^2)$
corresponds to an infinite-dimensional $\phi$: in one dimension, expanding $\exp(2\gamma xx')$ as
a power series gives one feature $e^{-\gamma x^2}\sqrt{(2\gamma)^j/j!}\,x^j$ for every
$j \ge 0$. The price is the $N\times N$ matrix $\mathbf{K}$: $O(N^3)$ to fit, and $N$
kernel evaluations per prediction.

The **support vector machine** (SVM), for labels $y_i \in \{-1, +1\}$, keeps the L2 penalty and
replaces squared error by the **hinge loss** $\max(0, 1 - y_i f(\mathbf{x}_i))$. A point
classified with margin $y_i f(\mathbf{x}_i) \ge 1$ contributes no loss and no gradient, so the
solution depends only on the **support vectors**, the points on or inside the margin; all others
have $\alpha_i = 0$, and prediction needs only the support vectors. The boundary is the one with
the largest margin the penalty allows. With an RBF kernel, SVMs were the state of the art on
medium-sized data before deep learning.

### Gaussian processes and neural networks

A **Gaussian process** puts a prior distribution over functions, specified by a kernel, and
returns a posterior mean and variance with every prediction. The posterior mean is kernel ridge
regression with $\lambda N$ equal to the noise variance. The cost is cubic in $N$, and the
uncertainty is the point: Gaussian processes are the standard surrogate models for expensive
engineering simulations and the engine of Bayesian optimisation.

**Neural networks** learn the features as well as the final linear map. Their advantage is on
images, text and signals, where good features are not known and data are plentiful; they are the
rest of this series.

### Unsupervised workhorses: k-means and PCA

**k-means** partitions data into $k$ clusters by minimising
$J = \sum_i\lVert\mathbf{x}_i - \boldsymbol{\mu}_{c(i)}\rVert^2$. Lloyd's algorithm alternates
assigning each point to its nearest centre, which minimises $J$ over the assignments, and moving
each centre to its cluster's mean, which minimises $J$ over the centres (Section 5's best
constant under squared error). Neither step increases $J$, so it converges, but to a local
minimum that depends on the start: use k-means++ initialisation and several restarts. Choose $k$
by the downstream use, the elbow of $J$ against $k$, or the silhouette score; scale first.

**Principal component analysis** (PCA) finds the directions of largest variance. The projection
$\mathbf{u}^\top\mathbf{x}$ with $\lVert\mathbf{u}\rVert = 1$ has variance
$\mathbf{u}^\top\mathbf{C}\mathbf{u}$, for the sample covariance $\mathbf{C}$; maximising it with a
Lagrange multiplier gives $\mathbf{C}\mathbf{u} = \lambda\mathbf{u}$, with variance $\lambda$
(here $\lambda$ is an eigenvalue again, as in [Section 3](#s3), not the ridge strength of the
kernel subsection above). The principal directions are the eigenvectors of $\mathbf{C}$ in order of eigenvalue, equivalently the
right singular vectors of the centred data. Component $i$ explains the fraction
$\lambda_i/\sum_j\lambda_j$ of the variance, and the projection onto the first $k$ is
$\mathbf{z} = \mathbf{V}_k^\top(\mathbf{x} - \boldsymbol{\mu})$. Uses: visualisation,
compression, denoising, and decorrelating features, which improves the conditioning of
[Section 3](#s3). PCA is linear and sensitive to scaling; its neural relative, the autoencoder,
is in [Module 05, Section 2](module_05_EN.html#s2).

::: worked title="Explained variance"
Covariance eigenvalues $(4.0, 1.0, 0.5, 0.3, 0.2)$ sum to 6.0. The first two components explain
$(4.0 + 1.0)/6.0 = 83.3\%$: five features compress to two at the cost of a sixth of the variance.
:::

### No free lunch, and a comparison

Averaged over all possible problems, no learning method beats any other (Wolpert, 1996). A
method wins on a problem because its assumptions match that problem, which is why the
evaluation of Sections 7 to 10 matters more than the choice of method.

::: worked title="Four classifiers on two moons"
`make_moons` with 300 points and noise 0.25 (`random_state=0`), five-fold stratified
cross-validation (shuffled, `random_state=0`), every model at scikit-learn's defaults apart from
the settings named and `random_state=0` where it takes one: logistic regression 0.827, depth-4 tree 0.887, gradient boosting
(`HistGradientBoostingClassifier`) 0.947, 15-NN (scaled) 0.957, random forest 0.960. The curved boundary punishes the linear model, and in two dimensions k-NN is as
good as anything (Figure 1.23).
:::

::: figure id=fig-01-23
Decision boundaries of four classifiers on `make_moons` (300 points, noise 0.25), one panel
each, the two classes as coloured dots: logistic regression, a straight line; 15-NN, a smooth
curve; a depth-4 decision tree, an axis-aligned staircase; gradient boosting, a finer staircase.
Each panel is titled with its five-fold cross-validated accuracy: 0.827, 0.957, 0.887 and 0.947.
:::

| Method | Capacity knob | Needs scaling? | Fit cost | Prediction cost | Interactions? | Typical first use |
|---|---|---|---|---|---|---|
| Linear or logistic, with ridge | features, $\lambda$ | yes, for penalties and GD | $O(Nd^2)$ | $O(d)$ | only if added | baseline; interpretable |
| k-NN | $k$ | yes | none | $O(Nd)$ | yes | low-dimensional baseline |
| Decision tree | depth | no | $O(dN\log N)$ | $O(\text{depth})$ | yes | readable rules |
| Random forest | features per split, depth | no | $M$ trees | $O(M\cdot\text{depth})$ | yes | robust tabular default |
| Gradient boosting | $M$, $\nu$, depth | no | $M$ trees | $O(M\cdot\text{depth})$ | yes | tabular data, first to try |
| Kernel ridge, SVM | $\gamma$, $\lambda$ | yes | $O(N^3)$ | $O(N)$ kernels | yes | medium $N$, smooth boundaries |
| Gaussian process | kernel, noise | yes | $O(N^3)$ | $O(N)$ for the mean | yes | surrogates with uncertainty |
| Neural network | width, depth, training time | yes | epochs × $N$ × parameters | $O(\text{parameters})$ | yes | images, text, signals |

Read the table as an order of work for a new tabular problem. Score the trivial baseline first
(the mean, or the majority class), then a regularised linear model, then a gradient-boosted
ensemble, all on the same folds; reach for a kernel method or a Gaussian process when $N$ is in
the thousands and a smooth function or an uncertainty is wanted, and for a neural network when
the inputs are images, text or signals. Each step must beat the previous one by more than the
standard error of [Section 10](#s10) to earn its extra cost. The scaling column is also a
checklist for leakage: every method marked "yes" needs its scaler fitted inside the folds.

::: check
Why do trees need no feature scaling while k-NN does?
:::

::: answer
A tree splits on one feature at a time by thresholds, and a monotone rescaling moves the
threshold without changing which points fall on each side; k-NN measures distances that add the
features up in their own units.
:::

::: check
In gradient boosting with squared error, what is each new tree fitted to?
:::

::: answer
The residuals $y_i - F_{m-1}(\mathbf{x}_i)$, the negative gradient of $\tfrac12(y - F)^2$ with
respect to $F$.
:::

## Engineering case: fitting a hyperelastic material model {#s12}

An engineer characterising a soft hydrogel fits the neo-Hookean coefficient $c_1$ to a uniaxial
compression test. Once a known function of the stretch is computed, it is linear regression with
everything from this module in it: a likelihood with a different noise level per point, a closed
form, an uncertainty, residual checks, a model that is wrong outside its range, and a nonlinear
alternative. We use a synthetic test so that every number below can be reproduced in
[Lab 5](#lab5). In this section only, $\lambda$ is a stretch, not a regularisation strength or an
eigenvalue, and $P$ is a stress.

### The model

An incompressible neo-Hookean solid has strain energy $W = c_1(I_1 - 3)$, where $I_1$ is the sum
of the squared principal stretches. Stretched uniaxially by $\lambda$ ($\lambda < 1$ in
compression), incompressibility makes the lateral stretches $\lambda^{-1/2}$, so the product of
the three is 1 and

$$
I_1 = \lambda^2 + \frac{2}{\lambda}, \qquad
P = \frac{dW}{d\lambda} = c_1\Big(2\lambda - \frac{2}{\lambda^2}\Big) = 2c_1\,g(\lambda),
\qquad g(\lambda) = \lambda - \lambda^{-2},
$$

with $P$ the nominal stress, force per undeformed area. For a small strain $\varepsilon$,
$\lambda = 1 + \varepsilon$ gives $g \approx 3\varepsilon$ and $P \approx 6c_1\varepsilon$: the
Young's modulus is $E = 6c_1$ and the shear modulus $\mu = 2c_1$.

### Weighted least squares, and the uncertainty of $c_1$

Each measured stress $P_i$ comes with a recorded uncertainty $\sigma_i$, so the likelihood is
Gaussian with a different variance per point and maximising it is the weighted least squares of
[Section 5](#s5): minimise $\sum_i w_i(P_i - 2c_1 g_i)^2$ with $w_i = 1/\sigma_i^2$ and
$g_i = g(\lambda_i)$. The derivative with respect to $c_1$ is
$-4\sum_i w_i g_i(P_i - 2c_1 g_i)$; setting it to zero,

$$
c_1^\ast = \frac{\sum_i w_i P_i g_i}{2\sum_i w_i g_i^2}.
$$

The estimate is linear in the noisy $P_i$: $c_1^\ast = \sum_i a_iP_i$ with
$a_i = w_i g_i/(2\sum_j w_j g_j^2)$. Independent errors propagate as
$\operatorname{Var}(\sum_i a_iP_i) = \sum_i a_i^2\sigma_i^2$, and since $w_i\sigma_i^2 = 1$,

$$
\operatorname{Var}(c_1^\ast)
= \frac{\sum_i w_i^2 g_i^2\sigma_i^2}{4\big(\sum_j w_j g_j^2\big)^2}
= \frac{\sum_i w_i g_i^2}{4\big(\sum_j w_j g_j^2\big)^2}
= \frac{1}{4\sum_i w_i g_i^2}.
$$

The coefficient comes with a standard deviation that is a function of the measurements', not an
opinion.

::: worked title="Three points by hand"
$\lambda = (0.9, 0.8, 0.7)$, $P = (-6.8, -15.1, -27.2)$ kPa, $\sigma = (0.2, 0.4, 0.6)$ kPa.

1. $g = 0.9 - 1/0.81 = -0.3346$; $0.8 - 1/0.64 = -0.7625$; $0.7 - 1/0.49 = -1.3408$.
2. $w = 1/\sigma^2 = (25, 6.25, 2.778)$.
3. $\sum w P g = 25(2.2753) + 6.25(11.5138) + 2.778(36.4702) = 230.14$;
   $\sum w g^2 = 25(0.11194) + 6.25(0.58141) + 2.778(1.79779) = 11.426$.
4. $c_1^\ast = 230.14/(2\times11.426) = 230.14/22.852 = 10.07$ kPa;
   $\operatorname{SD} = 1/(2\sqrt{11.426}) = 0.148$ kPa.
5. Fitted stresses $2c_1^\ast g = (-6.74, -15.36, -27.01)$; normalised residuals
   $(P - \hat P)/\sigma = (-0.31, 0.65, -0.32)$; $\chi^2_\nu = (0.093 + 0.417 + 0.104)/2 = 0.31$.
:::

### Checking the fit: residuals and $\chi^2_\nu$

The **normalised residuals** $r_i = (P_i - \hat P_i)/\sigma_i$ should look like independent
standard normals if the model and the $\sigma_i$ are right. Their summary is the **reduced
chi-square**

$$
\chi^2_\nu = \frac{1}{N - p}\sum_i r_i^2,
$$

with $p$ fitted parameters; by Section 5's $\E[\text{RSS}] = (N - p)\sigma^2$ it is about 1 for a
right model. Much larger means a wrong model or understated $\sigma_i$; much smaller, overstated
$\sigma_i$. Look at the signs as well: a long run of residuals of one sign is a systematic misfit
that $\chi^2_\nu$ can dilute. Report the RMS residual normalised by the largest measured stress,
which makes fits to different specimens comparable, together with the strain range fitted over.

Lab 5's synthetic test: the true material is a Gent solid (below) with $c_1 = 10$ kPa and
$\beta = 0.2$, tested at 16 stretches from 0.975 to 0.600 (strains 2.5% to 40%), with
$\sigma_i = 0.05$ kPa plus 2% of the stress. The neo-Hookean fit to strains up to 20% (8 points)
gives $c_1 = 10.09 \pm 0.10$ kPa, $\chi^2_\nu = 0.71$, normalised residuals within $\pm1.3$, and
an RMS residual of 1.1% of the largest stress. A Monte Carlo check, refitting 1,000 noisy copies
of the fitted curve, gives a standard deviation of 0.0999 against the formula's 0.0997. A clean,
precise fit.

### Extrapolation

A fit over 0–20% says nothing about 40%. The interval on $c_1$ quantifies the noise given the
model; it contains no term for the model being wrong.

::: worked title="The clean fit, extrapolated"
The 95% band of a prediction is $\pm1.96\times2\,\operatorname{SD}(c_1)\,\lvert g(\lambda)\rvert$.

- At 30% strain ($\lambda = 0.7$): $-27.06 \pm 0.52$ kPa against the true $-28.82$, 6.1% low.
- At 40% ($\lambda = 0.6$): $-43.96 \pm 0.85$ kPa against $-50.57$, 13.1% low. The error, 6.6
  kPa, is about eight times the half-width of the band (Figure 1.25).
:::

::: figure id=fig-01-25
Nominal stress (kPa, negative in compression) against stretch from 1.0 down to 0.6. The 16 data
points with $\pm\sigma$ error bars; the neo-Hookean fit to strains up to 20%, solid inside that
range and dashed beyond it, with its narrow 95% band; the Gent fit to all 16 points, through the
data; the fitted range shaded; an annotation marking the 13% gap between the dashed curve and
the data at 40% strain.
:::

The fitted range must travel with the model, and the model is used only where it was evaluated:
[Section 8](#s8) in one sentence.

### The residuals reveal the wrong model

Fit the neo-Hookean model to all 16 points: $c_1 = 10.55 \pm 0.06$ kPa, $\chi^2_\nu = 4.5$, and
the residual signs, from small strain to large, are `++++++++++------`, a run of ten then six.
The single coefficient is a compromise, too stiff at small strains and too soft at large ones
(Figure 1.26). The tighter
interval, $\pm0.06$, is no comfort: it is the noise given a model that the residuals reject.

::: figure id=fig-01-26
Normalised residuals $(P_i - \hat P_i)/\sigma_i$ against stretch for two fits to all 16 points,
with horizontal lines at 0 and $\pm2$. Neo-Hookean: a systematic pattern, ten positive residuals
then six negative, several beyond $\pm2$. Gent: scattered without pattern within $\pm2$.
:::

### Nonlinear least squares: the Gent model

The **Gent** model adds finite chain extensibility:

$$
P = \frac{2c_1\,g(\lambda)}{1 - \beta(I_1 - 3)}, \qquad \beta = 1/J_m \ge 0,
$$

which is neo-Hookean at $\beta = 0$ and nonlinear in $\beta$. With residuals
$\mathbf{r}(\theta) = \hat{\mathbf{P}}(\theta) - \mathbf{P}$, weights
$\mathbf{W} = \operatorname{diag}(1/\sigma_i^2)$ and Jacobian $\mathbf{J} = \partial\mathbf{r}/\partial\theta$,
**Gauss–Newton** linearises $\mathbf{r}(\theta + \boldsymbol{\delta}) \approx \mathbf{r} + \mathbf{J}\boldsymbol{\delta}$
and solves the weighted least-squares problem in $\boldsymbol{\delta}$, which gives

$$
\theta \leftarrow \theta - (\mathbf{J}^\top\mathbf{W}\mathbf{J})^{-1}\mathbf{J}^\top\mathbf{W}\mathbf{r}.
$$

Levenberg–Marquardt and trust-region methods add damping so that a poor linearisation cannot
throw the step far away; `scipy.optimize.least_squares` on the weighted residuals does this and
returns $\mathbf{J}$ at the solution. Then $\operatorname{Cov}(\hat\theta) \approx (\mathbf{J}^\top\mathbf{W}\mathbf{J})^{-1}$,
scaled by $\chi^2_\nu$ if the $\sigma_i$ are known only up to a factor. For the linear
neo-Hookean model $J_i = 2g_i$ and this is exactly $1/(4\sum_i w_ig_i^2)$, the formula above.

::: worked title="Gent on all 16 points, and on the first 8"
All 16 points: $c_1 = 9.95 \pm 0.10$ kPa, $\beta = 0.208 \pm 0.024$, correlation $-0.78$,
$\chi^2_\nu = 0.40$; Monte Carlo standard deviations 0.099 and 0.025 agree with the linearised
ones. The two parameters trade off: a larger $\beta$ stiffens the curve, so a smaller $c_1$
compensates.

Strains up to 20% only: $\beta = 0.21 \pm 0.21$, correlation $-0.83$. The neo-Hookean
$\beta = 0$ cannot be excluded (Figure 1.27). The reason is in $I_1$: with $\lambda = 1 - \varepsilon$,
$I_1 - 3 = 3\varepsilon^2 + O(\varepsilon^3)$, so at 10% strain $I_1 - 3 = 0.032$ and $\beta = 0.2$
raises the stress by $1/(1 - 0.0064) - 1 = 0.65\%$, below the 2% noise. Data that never exercise a
parameter cannot determine it.
:::

::: figure id=fig-01-27
Approximate 95% confidence ellipses for $(c_1, \beta)$ from the Gent fits, with the line
$\beta = 0$ (neo-Hookean) drawn. For the 0–20% data, a long, thin ellipse tilted downwards (the
negative correlation) that crosses $\beta = 0$; for the 0–40% data, a small ellipse well above
it.
:::

### The loading direction, and refusing inputs

$g$ is not symmetric about $\lambda = 1$: $g(0.8) = -0.7625$ but $g(1.25) = 1.25 - 0.64 = 0.61$.
The direction of loading is therefore part of the model, and must be declared. Read as tension
($\lambda = 1 + \varepsilon$, stresses positive), Lab 5's 0–20% data give $c_1 = 12.97$ kPa,
28.5% above the 10.09 kPa of the correct reading, with $\chi^2_\nu = 20.7$, which betrays the
mistake. Over the first 5% of strain the misread fit gives 10.60 kPa against the correct
reading's 9.75, 8.7% high, with a clean $\chi^2_\nu = 0.38$: a wrong model can fit well when the
data cannot tell the difference.

No residual check catches that case, so the defence comes before the fit. A fitting routine
should refuse inputs it cannot honour, a point without an uncertainty, stresses whose sign
contradicts the declared loading direction, a fitted non-positive stiffness, and say why,
instead of returning a number. Lab 5's `check_inputs` implements these refusals. It is what a
learning method should do whenever its assumptions are violated.

::: check
The standard error of $c_1$ is 1% (a 95% interval of about $\pm2\%$), yet at 40% strain the
neo-Hookean prediction is 13% off. Is that a contradiction?
:::

::: answer
No. The interval quantifies the noise given the model; it is silent about the model being wrong
outside the fitted range.
:::

::: check
Why can $\beta$ not be determined from data below 10% strain?
:::

::: answer
$I_1 - 3 \approx 3\varepsilon^2$, so $\beta$ changes the stress by less than 1% there, below the
noise; the data carry almost no information about $\beta$.
:::

## What goes wrong {#wrong}

Each failure is listed by its symptom, as you will meet it, then its cause and its fix.

### The loss is minimised but the decisions are poor

**Cause.** The loss is not the objective. Cross-entropy was minimised, while the decision needs
recall at a fixed false-positive rate, or a missed defect costs twenty false alarms. Nothing in
the loss knows that. **Fix.** Choose the metric and the operating threshold from the decision's
costs or constraints ([Section 7](#s7)), set the threshold on validation data, and report
performance at that operating point, not at 0.5.

### Gradient descent stalls; "the model does not learn"

**Cause.** Features unscaled or uncentred, so $\kappa(\mathbf{X}^\top\mathbf{X})$ is huge:
$10^{10}$ in Lab 1's damaged version, where 100,000 steps left the training MSE at 4.28 against
0.0100. **Fix.** Centre and standardise with training statistics, and compute $\kappa$ before
blaming the model ([Section 3](#s3)). The weights map back to the original units exactly.

### The loss rises or becomes NaN within a few steps

**Cause.** The learning rate is above the stability limit $2/\lambda_{\max}$, so the steepest
direction is multiplied by a factor larger than 1 in magnitude at every step. **Fix.** Divide
$\eta$ by 3 to 10, or sweep a logarithmic grid on a short run and take the largest $\eta$ whose
loss falls smoothly.

### SGD's loss stops improving at a noisy plateau

**Cause.** The constant-step noise floor, proportional to $\eta/B$ ([Section 4](#s4)): at the
minimum the mini-batch gradient is still not zero. **Fix.** Decay the step under the
Robbins–Monro conditions, or enlarge the batch. Do not read the plateau as convergence; a lower
step or a larger batch would go lower.

### Logistic regression's weights grow without limit and its probabilities are all 0 or 1

**Cause.** Linearly separable training data with no penalty: every scaling-up of a separating
$\mathbf{w}$ lowers the loss, so the maximum-likelihood estimate does not exist
([Section 6](#s6)). **Fix.** Keep an L2 penalty (scikit-learn's default $C = 1$) or stop early,
then check calibration on held-out data.

### Excellent cross-validation scores, poor results in service

**Cause.** Rows of the same part, specimen or machine on both sides of the split, so the model
learns to recognise units: 0.95 by row against 0.63 by specimen in Lab 4. **Fix.** Split by the
unit that will be new at deployment (`GroupKFold`), and resample groups when bootstrapping.

### A time-series model looks prophetic

**Cause.** A shuffled split lets it train on the future and interpolate between neighbouring
times; Lab 4's pump model reached the noise floor that way. **Fix.** Forward-chaining splits with
a gap (`TimeSeriesSplit`); never shuffle across time.

### High accuracy on data that should be unpredictable

**Cause.** Feature selection, or another fitted preprocessing step, saw all the data before
cross-validation: 0.87 on pure noise in Lab 4. **Fix.** Put every fitted step in a `Pipeline`
evaluated inside the folds. A score far above what the problem allows is a reason to look for a
leak before celebrating.

### The chosen configuration's validation score does not hold up

**Cause.** The validation set chose among two hundred configurations, and the maximum of noisy
scores is optimistic by an amount you cannot see. **Fix.** Nested cross-validation, or a test set
opened once, with the date of opening recorded ([Section 10](#s10)). Report how many
configurations were tried; the optimism grows with their number.

### Accuracy is high and the model is useless

**Cause.** Class imbalance: the model predicts the majority class, which at 1% prevalence scores
99%. **Fix.** Report the confusion matrix, precision and recall and the precision–recall curve,
each against the majority-class baseline. A metric that the trivial rule scores well on is the
wrong headline number; recall on the rare class usually says more.

### "Model A beats model B by half a point"

**Cause.** The difference is inside the test set's sampling noise; on 2,000 cases at 90%
accuracy one model's standard error alone is 0.7 points. **Fix.** Compare on the same cases: the
discordant counts, McNemar's exact test and a paired bootstrap interval of the difference. Say so
when the interval includes zero, and trust the exact test when only a handful of cases disagree.

### Predicted probabilities do not match observed frequencies

**Cause.** Long training with cross-entropy rewards ever larger logits, or the population has
shifted since training. **Fix.** Draw a reliability diagram and compute the ECE; recalibrate on
held-out data (Platt scaling or isotonic regression), never on the data the model was fitted to,
and check the direction of the error rather than assuming overconfidence.

### A model with an excellent ECE is useless

**Cause.** Calibration is not discrimination: predicting the base rate for every case is
calibrated (ECE 0.003 on Lab 2's test set, against the fitted model's 0.023) and ranks nothing.
**Fix.** Report the ECE together with the Brier score and the AUC, and state the binning.

### The model is asked to extrapolate, and the fit looked clean

**Cause.** Nothing constrains $f$ outside the data's support, and the parameter interval excludes
model error: 13% at 40% strain in Lab 5, about eight times the band. **Fix.** Store the fitted
range with the model; refuse or flag predictions outside it; collect data where candidate models
disagree, which is where the next test is most informative.

### Performance decays months after deployment

**Cause.** Non-stationarity: the process, the sensors or the population changed after the data
were collected. **Fix.** Monitor the distributions of inputs and outputs, not only the accuracy,
which often arrives late; retrain or recalibrate on recent data, and evaluate on data from the
new conditions.
