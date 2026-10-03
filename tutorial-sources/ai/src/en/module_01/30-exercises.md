## Exercises {#exercises}

Fifteen exercises, graded by the effort they ask for. A one-star exercise (★) is conceptual and
takes about five minutes: answer it in words, in a few sentences. A two-star exercise (★★) is a
derivation or a calculation of ten to twenty minutes, to be done on paper with a calculator.
The one three-star exercise (★★★) is a coding project of about 25 minutes. The total is 130
minutes. The study plan places each exercise after the reading it tests, so that no reading block
runs on for long without something to do.

Attempt every exercise before you open its solution. The solutions are hidden until you open
them, and they are written to be read in full: they show every step, say why the step is taken,
and give the numbers, each of which was computed and checked. If your answer differs from the
solution's, find the first line where the two part company before you read on. A wrong number
with a correct method is usually a slip; a correct number reached by a different method is worth
comparing with the solution's, because the difference often shows an assumption.

::: exercise id=e1 level=1 kind=conceptual minutes=5
**The five ingredients.** Write down the five ingredients of [Section 1](#s1) (data, model,
loss, optimiser, evaluation) for

(a) a linear trendline fitted in a spreadsheet to a strain-gauge calibration, gauge voltage
against applied strain; and

(b) a $k$-nearest-neighbour classifier ($k = 5$) that labels weld radiographs as acceptable or
defective from 20 measured features.

For (b), which ingredient is degenerate, and what does that imply about where its errors come
from?
:::

::: solution
**(a) The trendline.**

- *Data.* Pairs (applied strain, gauge voltage) from one calibration run, drawn from a
  distribution $P$ that is the gauge in its calibration set-up. What the gauge will meet in
  service, in temperature, strain range and lead-wire length, is a different distribution, and
  the calibration says nothing about it.
- *Model.* A line, $\text{voltage} = a + b\cdot\text{strain}$, two parameters. The calibration is
  used in reverse, to turn a measured voltage into a strain, so the fitted line is inverted at
  the point of use. The applied strain is set by the rig and known far better than the voltage
  is, which is why voltage is the variable on the vertical axis: the loss treats the vertical
  variable as the noisy one.
- *Loss.* Squared error, which is the right choice if the voltage noise is roughly Gaussian with
  the same spread at every strain ([Section 5](#s5)).
- *Optimiser.* The closed form, the normal equations ([Section 2](#s2)). The spreadsheet solves
  them for you.
- *Evaluation.* Residuals at check points that were not used in the fit, or a second
  calibration run. The $R^2$ that the spreadsheet prints is computed on the fitted points: it is
  a training score, and a two-parameter line cannot overfit much, but a trendline with six
  parameters would raise it for free.

**(b) The $k$-NN classifier.**

- *Data.* Labelled radiographs from past inspections. $P$ is welds of this type from this
  process, so the classifier is only as good as the stored examples are typical of tomorrow's
  welds.
- *Model.* The majority label among the five stored examples nearest to the new weld in the
  20-dimensional feature space. Its "parameters" are the stored data themselves, plus the
  hyperparameters $k$ and the distance (including how each feature is scaled).
- *Loss.* The 0–1 loss, used only to compare settings of $k$ and the scaling on validation
  data. Nothing is minimised by training.
- *Optimiser.* None. "Training" is storing the data, so this is the degenerate ingredient.
- *Evaluation.* Held-out welds, split by weld or by production batch, never by radiograph if
  one weld has several.

**What the degenerate optimiser implies.** There is no optimisation to go wrong, so none of the
errors come from a failure to converge, and there is no training curve to inspect. Everything
rides on the data and on the distance. The errors come from unrepresentative stored examples,
from features that are irrelevant to the defect but count equally in the distance, from features
on different scales, and from a space of 20 dimensions in which "near" carries little meaning
([Section 11](#s11)). A second consequence is that the training error is useless: with $k = 1$
every stored point is its own nearest neighbour, so the training error is zero by construction,
and with $k = 5$ it is nearly so. Only held-out data tell you anything.
:::

::: exercise id=e2 level=1 kind=conceptual minutes=5
**Coding a categorical input.** A linear model predicts tensile strength from material grade, one
of {steel, aluminium, titanium}.

(a) What does coding the grade as 1, 2, 3 assume?

(b) You one-hot encode the grade into three columns and keep the column of ones for the
intercept. Show that $\mathbf{X}^\top\mathbf{X}$ is singular, and say what happens to the fitted
weights and to the predictions.

(c) Give two fixes.
:::

::: solution
**(a)** A single column holding 1, 2, 3 gives the grade one weight $w$, so the model adds $w$ to
the prediction when the code goes up by one, whichever grade it starts from. That assumes an
order (steel $<$ aluminium $<$ titanium) and equal spacing: aluminium's effect must lie exactly
halfway between steel's and titanium's. Nothing about the three materials justifies either. Whatever the
data say, a line through the codes predicts the middle grade as the average of its predictions
for the other two. If the true strengths were, say, 400, 300 and 900 MPa, that prediction for the
middle grade would be badly wrong.

**(b)** Each row of the one-hot design has a 1 in the intercept column and a single 1 in one of
the three grade columns, so in every row the three grade columns sum to the intercept column.
Take $\mathbf{v} = (-1, 1, 1, 1)$ over (intercept, steel, aluminium, titanium). Then every row
of $\mathbf{X}\mathbf{v}$ is $-1 + 1 = 0$, so $\mathbf{X}\mathbf{v} = \mathbf{0}$, and therefore
$\mathbf{X}^\top\mathbf{X}\mathbf{v} = \mathbf{X}^\top\mathbf{0} = \mathbf{0}$. A non-zero vector
that the matrix maps to zero is an eigenvector with eigenvalue 0: $\mathbf{X}^\top\mathbf{X}$ is
singular, the normal equations have no unique solution, and $(\mathbf{X}^\top\mathbf{X})^{-1}$
does not exist. This is the dependent-columns case of [Section 2](#s2), and it has a name, the
**dummy-variable trap**.

What this does to the fit: if $\mathbf{w}$ solves the normal equations, so does
$\mathbf{w} + t\mathbf{v}$ for every $t$, because $\mathbf{X}(\mathbf{w} + t\mathbf{v}) =
\mathbf{X}\mathbf{w}$. Raising the intercept by $t$ and lowering all three grade weights by $t$
changes nothing. So the *weights* are not identified: any of them can take any value, provided the
others compensate, and a statement such as "titanium adds 493 MPa" has no meaning on its own.
The *predictions* are identified, because they are the orthogonal projection of $\mathbf{y}$ onto
the column space, which does not depend on which basis of that space you chose; here each
grade's prediction is the mean strength of that grade's specimens. Library solvers handle the
singularity in their own way: `np.linalg.lstsq` returns the solution of smallest norm.

A numerical check, with 12 synthetic specimens, four per grade:

```python
import numpy as np

rng = np.random.default_rng(0)
grade = np.repeat([0, 1, 2], 4)                      # 4 specimens per grade
strength = np.array([400.0, 300.0, 900.0])[grade] + rng.normal(0, 10, 12)  # MPa

X = np.column_stack([np.ones(12), np.eye(3)[grade]])   # intercept + one-hot grade
print("columns:", X.shape[1], " rank:", np.linalg.matrix_rank(X))
print("eigenvalues of X^T X:", np.round(np.linalg.eigvalsh(X.T @ X), 2))

v = np.array([-1.0, 1.0, 1.0, 1.0])
print("largest entry of X v:", np.abs(X @ v).max())

w_min = np.linalg.lstsq(X, strength, rcond=None)[0]    # minimum-norm solution
w_shift = w_min + 50 * v                               # another exact solution
print("same predictions:", np.allclose(X @ w_min, X @ w_shift))
print("weights, minimum norm:", np.round(w_min, 1))
print("weights, shifted     :", np.round(w_shift, 1))

X_ref = X[:, [0, 2, 3]]                                # drop the steel column
w_ref = np.linalg.lstsq(X_ref, strength, rcond=None)[0]
print("reference coding:", np.round(w_ref, 1), " same predictions:",
      np.allclose(X_ref @ w_ref, X @ w_min))
```

```output
columns: 4  rank: 3
eigenvalues of X^T X: [ 0.  4.  4. 16.]
largest entry of X v: 0.0
same predictions: True
weights, minimum norm: [400.2   1.7 -95.  493.5]
weights, shifted     : [350.2  51.7 -45.  543.5]
reference coding: [401.8 -96.7 491.8]  same predictions: True
```

Four columns but rank 3, and one eigenvalue of $\mathbf{X}^\top\mathbf{X}$ is exactly zero. The two
weight vectors differ by $50\,\mathbf{v}$ and make identical predictions. With steel as the
reference category, the weights become interpretable: 401.8 is the mean strength of steel, and
the other two are differences from steel (a difference of $-96.7$ for aluminium, $+491.8$ for
titanium).

**(c)** Two fixes, with different meanings:

1. **Remove the redundancy.** Drop one grade column and keep the intercept (a *reference
   category*: the intercept is that grade's mean and each remaining weight is a difference from
   it), or drop the intercept and keep all three columns (each weight is its grade's mean). The
   predictions are identical in both cases, and the matrix has full column rank.
2. **Regularise.** A ridge penalty replaces $\mathbf{X}^\top\mathbf{X}$ by $\mathbf{X}^\top\mathbf{X} +
   \lambda N\mathbf{I}$, whose eigenvalues are at least $\lambda N > 0$, so the system has a
   unique solution ([Exercise 8](#e8)). Among the weight vectors that fit equally well, the
   penalty picks the one of smallest norm, which settles how the shared constant is split between
   the intercept and the grade weights. That is a modelling choice, not a neutral one, and it
   also shrinks the fit slightly.
:::

::: exercise id=e3 level=2 kind=calculation minutes=10
**Step sizes and step counts from eigenvalues.** The least-squares Hessian of a two-feature
problem has eigenvalues 1 and 25.

(a) What is the largest stable learning rate?

(b) What is the best fixed learning rate, and the error contraction per step it gives?

(c) How many steps reduce the error by a factor of $10^6$ at the best rate, and at
$\eta = 1/\lambda_{\max}$?

(d) After standardisation the eigenvalues are 0.8 and 1.2. Repeat (b) and (c).
:::

::: solution
**Set-up.** On a quadratic with Hessian $\mathbf{H}$, the error $\mathbf{e}_t = \mathbf{w}_t -
\mathbf{w}^\ast$ obeys $\mathbf{e}_{t+1} = (\mathbf{I} - \eta\mathbf{H})\mathbf{e}_t$
([Section 3](#s3)). In the eigenbasis of $\mathbf{H}$ the components do not interact, and the
component along the eigenvector with eigenvalue $\lambda_i$ is multiplied by $1 - \eta\lambda_i$
at every step. The error as a whole shrinks as fast as its slowest component, so the contraction
per step is $\rho(\eta) = \max_i |1 - \eta\lambda_i|$.

**(a) Stability.** Every component must shrink, so $|1 - \eta\lambda_i| < 1$ for every $i$. For a
positive $\lambda_i$ this means $0 < \eta < 2/\lambda_i$, and all of them hold when
$\eta < 2/\lambda_{\max}$:

$$\eta < \frac{2}{25} = 0.08.$$

At exactly 0.08 the fast component is multiplied by $1 - 0.08 \cdot 25 = -1$: it flips sign and
neither grows nor shrinks, so the iteration never converges.

**(b) The best fixed rate.** Two terms compete: $|1 - \eta\lambda_{\min}|$ falls as $\eta$ grows
(the slow direction wants a large step) and $|1 - \eta\lambda_{\max}|$ is what the fast direction
suffers once $\eta$ passes $1/\lambda_{\max}$ (it overshoots, with a negative factor). The best
$\eta$ is where the two are equal in magnitude and opposite in sign:

$$1 - \eta\lambda_{\min} = -(1 - \eta\lambda_{\max}) \;\Longrightarrow\; \eta^\ast =
\frac{2}{\lambda_{\min} + \lambda_{\max}} = \frac{2}{1 + 25} = 0.0769.$$

Then $\rho = 1 - \eta^\ast\lambda_{\min} = 1 - 0.0769 = 0.9231$, and in general
$$\rho = \frac{\kappa - 1}{\kappa + 1} = \frac{24}{26} = 0.9231, \qquad \kappa =
\frac{\lambda_{\max}}{\lambda_{\min}} = 25.$$
Both components now contract by the same factor in magnitude: the slow one by $+0.9231$ and the
fast one by $1 - 0.0769\cdot 25 = -0.9231$.

**(c) Step counts.** To reduce the error by $10^6$ we need $\rho^t \le 10^{-6}$, that is,
$t \ge \ln 10^6/(-\ln\rho)$. With $\ln 10^6 = 13.816$:

- At the best rate, $-\ln 0.9231 = 0.0800$, so $t \ge 13.816/0.0800 = 172.6$: **173 steps**.
- At $\eta = 1/\lambda_{\max} = 0.04$, the factors are $1 - 0.04\cdot 1 = 0.96$ for the slow
  component and $1 - 0.04 \cdot 25 = 0$ for the fast one. The slow one decides:
  $-\ln 0.96 = 0.0408$, so $t \ge 13.816/0.0408 = 338.4$: **339 steps**.

The best rate roughly halves the count, by giving up the instant convergence of the fast
direction in return for a faster slow one. Neither escapes the fact that the count is of order
$\kappa$: for large $\kappa$, $-\ln\rho = \ln\frac{\kappa+1}{\kappa-1} \approx 2/\kappa$, so
$t \approx (\kappa/2)\ln 10^6$ (here $12.5 \times 13.8 = 173$). A direct simulation of the two
components confirms 173 and 339.

**(d) After standardisation.** Now $\kappa = 1.2/0.8 = 1.5$.

- $\eta^\ast = 2/(0.8 + 1.2) = 1.0$.
- The factors are $1 - 1.0\cdot 0.8 = +0.2$ and $1 - 1.0\cdot 1.2 = -0.2$, so $\rho = 0.2$, which
  agrees with $(\kappa - 1)/(\kappa + 1) = 0.5/2.5 = 0.2$.
- $t \ge 13.816/(-\ln 0.2) = 13.816/1.609 = 8.58$: **9 steps**.

Standardising took the count from 173 to 9, about twenty times fewer, with no change of method
and no change in what the model can represent. This is why centring and scaling the features is
the cheapest optimisation improvement there is.
:::

::: exercise id=e4 level=2 kind=derivation minutes=10
**Cross-entropy against squared error through a sigmoid.**

(a) Show that the gradient of binary cross-entropy with respect to the logit $z$ is
$\hat p - y$, where $\hat p = \sigma(z)$.

(b) Compute the gradient of $\tfrac12(\sigma(z) - y)^2$ with respect to $z$.

(c) Evaluate both for a confidently wrong prediction, $\hat p = 0.999$ with $y = 0$, and for a
confidently right one, $\hat p = 0.001$ with $y = 0$.

(d) What do the numbers mean for learning?
:::

::: solution
**(a)** The loss for one example is $\ell = -y\ln\sigma(z) - (1-y)\ln(1-\sigma(z))$. The sigmoid
has derivative $\sigma'(z) = \sigma(z)(1 - \sigma(z))$ (differentiate $1/(1 + e^{-z})$ and
simplify). By the chain rule,

$$\frac{\partial\ell}{\partial z} = \left(-\frac{y}{\sigma} + \frac{1-y}{1-\sigma}\right)
\sigma(1-\sigma) = -y(1-\sigma) + (1-y)\sigma = \sigma - y.$$

The factor $\sigma(1 - \sigma)$ from the sigmoid cancels the denominators from the logarithm.
That cancellation is the reason cross-entropy and the sigmoid are used together.

**(b)** Write $\ell_2 = \tfrac12(\sigma(z) - y)^2$. Then

$$\frac{\partial\ell_2}{\partial z} = (\sigma - y)\,\sigma'(z) = (\sigma - y)\,\sigma(1-\sigma).$$

Nothing cancels: the sigmoid's derivative stays as an extra factor.

**(c) The numbers.** With $y = 0$ the two gradients are $\hat p$ and $\hat p\cdot\hat p(1 -
\hat p) = \hat p^2(1-\hat p)$.

| | cross-entropy gradient | squared-error gradient |
|---|---|---|
| confidently wrong, $\hat p = 0.999$ | $0.999$ | $0.999^2 \times 0.001 = 0.000998$ |
| confidently right, $\hat p = 0.001$ | $0.001$ | $0.001^2 \times 0.999 = 9.99\times10^{-7}$ |

In both rows the ratio is $1/(\hat p(1 - \hat p))$ at $\hat p = 0.999$ or $0.001$, which is
$1/(0.999 \times 0.001) = 1001$: the cross-entropy gradient is about 1,001 times the
squared-error one.

**(d) What this means.** A gradient step moves the logit by an amount proportional to the
gradient. Cross-entropy's gradient $\hat p - y$ is the prediction error itself: it is near 1 when
the model is confidently wrong, shrinks smoothly as the model improves, and is near 0 when it is
right. The squared-error gradient carries the extra factor $\hat p(1 - \hat p)$, which is near
zero at *both* extremes because the sigmoid is flat there (it *saturates*). So the model that is
most wrong, with its logit at about $z = \ln(0.999/0.001) = +6.9$ for a negative example, receives
almost no signal: its gradient is 0.001, and it learns about a thousand times more slowly than
under cross-entropy. At its largest, the squared-error gradient, $\hat p^2(1-\hat p)$, reaches
only $4/27 = 0.148$ (at $\hat p = 2/3$), against a cross-entropy gradient that reaches 1.

Cross-entropy also gives the right *loss values*: $-\ln 0.001 = 6.9$ for the confidently wrong
prediction against $\tfrac12(0.999)^2 = 0.5$ for squared error, which can never exceed $\tfrac12$.
A loss that cannot tell a mildly wrong prediction from a catastrophic one, and a gradient that
vanishes exactly when the model most needs correction, is why classification is trained with
cross-entropy ([Section 6](#s6)). The same cancellation, $\hat{\mathbf{p}} - \mathbf{y}$, holds
for softmax, and so for the output layer of a language model.
:::

::: exercise id=e5 level=2 kind=calculation minutes=10
**What an alarm means.** A crack detector has recall 0.90 and false-positive rate 0.03, and cracks
are present in 2% of inspected parts.

(a) What fraction of flagged parts actually have a crack, and how many false alarms come with
each true one?

(b) Show that the odds of a crack given an alarm are the prior odds times TPR/FPR, and use this to
find the prevalence at which half the alarms are true.

(c) Every flagged part goes to a second inspection with the same recall and false-positive rate,
whose errors are independent of the first's given the true state. What fraction of twice-flagged
parts have a crack, what is the recall of the two stages together, and what fraction of all parts
does the second stage inspect?

(d) Which numbers in the vendor's brochure would have hidden the answer to (a)?
:::

::: solution
**(a)** Work with fractions of all parts. Let
$\pi = 0.02$ be the prevalence, TPR $= 0.90$ the recall and FPR $= 0.03$.

- Cracked parts that are flagged: $\text{TPR}\cdot\pi = 0.90 \times 0.02 = 0.0180$ of all parts.
- Good parts that are flagged: $\text{FPR}\cdot(1-\pi) = 0.03 \times 0.98 = 0.0294$ of all parts.
- All flagged: $0.0180 + 0.0294 = 0.0474$.

Precision is the cracked fraction of the flagged:

$$\text{precision} = \frac{0.0180}{0.0474} = 0.380.$$

Fewer than four alarms in ten are real. False alarms per true alarm: $0.0294/0.0180 = 1.63$.

**(b)** By Bayes' rule,

$$\frac{P(\text{crack}\mid\text{alarm})}{P(\text{good}\mid\text{alarm})} =
\frac{\text{TPR}\cdot\pi}{\text{FPR}\cdot(1-\pi)} = \frac{\pi}{1-\pi}\cdot\frac{\text{TPR}}{\text{FPR}}.$$

The two probabilities share the denominator $P(\text{alarm})$, which cancels in the ratio. So the
posterior odds are the prior odds multiplied by the **likelihood ratio** TPR/FPR, which here is
$0.90/0.03 = 30$. Check on (a): prior odds $0.02/0.98 = 0.0204$, times 30 gives $0.612$, and odds
$0.612$ correspond to the probability $0.612/1.612 = 0.380$. Matches.

Half the alarms are true when the posterior odds are 1, so
$\pi/(1-\pi) = \text{FPR}/\text{TPR}$, which gives

$$\pi = \frac{\text{FPR}}{\text{TPR} + \text{FPR}} = \frac{0.03}{0.93} = 3.2\%.$$

A detector whose alarms are mostly false at 2% prevalence is mostly right at 3.2% and above: the
same classifier, with the same recall and false-positive rate, is a different tool in a different
population ([Section 7](#s7), the base rate).

**(c)** The second stage sees only parts that the first flagged, so the prior odds it faces are
the posterior odds of the first stage, 0.612. Its alarm multiplies them by the likelihood ratio
again, because the two errors are independent given the true state:

$$0.612 \times 30 = 18.4 \;\Longrightarrow\; P(\text{crack}\mid\text{two alarms}) =
\frac{18.4}{19.4} = 0.948.$$

Equivalently, directly: cracked and flagged twice $0.90^2\times 0.02 = 0.0162$; good and flagged
twice $0.03^2\times 0.98 = 0.000882$; the ratio $0.0162/(0.0162 + 0.000882) = 0.948$.

- *Recall of the two stages together:* a crack must be caught by both, so $0.90 \times 0.90 =
  0.81$. The second stage costs 9 points of recall (0.90 to 0.81) in exchange for lifting
  precision from 0.38 to 0.95; false alarms per true alarm fall from 1.63 to $0.000882/0.0162 =
  0.054$.
- *Parts the second stage inspects:* those the first flags, **4.74%** of all parts.

The independence assumption is optimistic, in both directions. If the two inspections miss the
same subtle cracks, the cracks that the first stage flags are the easy ones, which the second
stage catches more often than 0.90, so the real combined recall is higher than 0.81. If they
raise false alarms on the same awkward but sound parts, the second stage removes fewer of them
than the factor of 30 suggests, and the real precision is lower than 0.948. Measure the
correlation on real data before relying on the products.

**(d)** Two numbers hide it. *Accuracy*: $0.0180 + 0.97\times0.98 = 0.9686$, which sounds
excellent, and is lower than the 0.98 achieved by a "detector" that never raises an alarm. The
accuracy is dominated by the 98% of good parts that are correctly passed. *ROC AUC*, and any
curve plotted against TPR and FPR, because neither depends on prevalence: a brochure that reports
them says nothing about how many alarms will be false in your population. A brochure
benchmarked on a balanced test set (half cracked) would also show precision $0.90/0.93 = 0.97$
for this same detector. What shows (a) is the precision at the *deployment* prevalence, or the
precision–recall curve computed on data with the real mix of cracked and good parts.
:::

::: exercise id=e6 level=2 kind=calculation minutes=10
**AUC by counting pairs.** Six test parts receive scores. Defective: 0.9, 0.7, 0.4. Good: 0.8, 0.3,
0.2.

(a) Compute the AUC by counting pairs.

(b) Sweep the threshold downward and list the (FPR, TPR) points of the ROC curve; check that the
area under the staircase equals (a).

(c) At threshold 0.5, give precision and recall.

(d) Which single score change would raise the AUC to 1?
:::

::: solution
**(a) Counting pairs.** The AUC is the probability that a randomly chosen defective part scores
higher than a randomly chosen good one (ties counting one half; there are none here). There are
$3 \times 3 = 9$ defective–good pairs. For each defective part, count the good parts it outscores:

- 0.9 beats 0.8, 0.3 and 0.2: 3 pairs.
- 0.7 beats 0.3 and 0.2 but not 0.8: 2 pairs.
- 0.4 beats 0.3 and 0.2 but not 0.8: 2 pairs.

$$\text{AUC} = \frac{3 + 2 + 2}{9} = \frac{7}{9} = 0.778.$$

**(b) The ROC curve.** Lower the threshold through the scores in decreasing order. A threshold
flags every part scoring at or above it. Each defective part passed raises TPR by $1/3$; each
good part raises FPR by $1/3$.

| threshold reaches | part | FPR | TPR |
|---|---|---|---|
| (above 0.9) | none flagged | 0 | 0 |
| 0.9 | defective | 0 | 1/3 |
| 0.8 | good | 1/3 | 1/3 |
| 0.7 | defective | 1/3 | 2/3 |
| 0.4 | defective | 1/3 | 1 |
| 0.3 | good | 2/3 | 1 |
| 0.2 | good | 1 | 1 |

The area under the staircase, taken in vertical strips: for FPR from 0 to $1/3$ the height is
$1/3$, an area $\tfrac13\cdot\tfrac13 = 1/9$; for FPR from $1/3$ to 1 the height is 1, an area
$\tfrac23\cdot 1 = 6/9$. Total $7/9$, which agrees with (a). (The two computations are the same
sum arranged differently: counting pairs by defective part, or by good part.) A machine check with
`sklearn.metrics.roc_auc_score` returns 0.7778.

**(c) Threshold 0.5.** The parts scoring at least 0.5 are 0.9 (defective), 0.8 (good) and 0.7
(defective). So TP $= 2$, FP $= 1$; the defective part scoring 0.4 is missed, FN $= 1$; TN $= 2$.

$$\text{precision} = \frac{\text{TP}}{\text{TP} + \text{FP}} = \frac23, \qquad
\text{recall} = \frac{\text{TP}}{\text{TP} + \text{FN}} = \frac23.$$

**(d) One change.** An AUC of 1 means every defective part outscores every good one, so the
three scores $0.9, 0.7, 0.4$ must all sit above the three good scores. The only obstacle is the
good part scored 0.8, which beats the defective 0.7 and 0.4. Lowering it below 0.4, for example to
0.35, gives AUC 1. Raising the defective 0.4 alone cannot work: to 0.95 it fixes one pair, but
the defective 0.7 still sits below the good 0.8, and the AUC becomes only $8/9$. (Raising both
0.7 and 0.4 above 0.8 would also work, but that is two changes.) The exercise shows what the AUC
measures: it is a statement about the *ordering* of scores, and a single badly scored good part
costs two of the nine pairs.
:::

::: exercise id=e7 level=2 kind=derivation minutes=10
**Shrinkage in one dimension.** You estimate a mean $\mu$ from $n$ independent readings of
variance $\sigma^2$, using the shrunk estimator $\hat\mu_c = c\,\bar y$ with $0 \le c \le 1$.

(a) Derive its bias$^2$, variance and mean squared error.

(b) Find the $c$ that minimises the MSE.

(c) Take $\sigma = 3$ and $n = 9$. Evaluate $c^\ast$ and its MSE for $\mu = 2$ and for
$\mu = 0.5$, and compare with the MSE of $\bar y$.

(d) Why can you not use $c^\ast$ directly in practice? Compute the MSE when the $c^\ast$ for
$\mu = 0.5$ is used but $\mu$ is really 2, and say what this has to do with choosing $\lambda$ by
cross-validation.
:::

::: solution
**(a)** The sample mean $\bar y$ has $\mathbb{E}[\bar y] = \mu$ and $\operatorname{Var}(\bar y) =
\sigma^2/n$ (the variance of an average of $n$ independent readings). Multiplying by the constant
$c$:

- $\mathbb{E}[\hat\mu_c] = c\mu$, so the bias is $c\mu - \mu = -(1-c)\mu$ and
  $\text{bias}^2 = (1-c)^2\mu^2$.
- $\operatorname{Var}(\hat\mu_c) = c^2\sigma^2/n$.

The mean squared error is the sum of the two (the cross term vanishes, as in [Section 8](#s8)):

$$\text{MSE}(c) = (1-c)^2\mu^2 + c^2\frac{\sigma^2}{n}.$$

**(b)** Write $v = \sigma^2/n$. Differentiate with respect to $c$ and set the derivative to zero:

$$\frac{d\,\text{MSE}}{dc} = -2(1-c)\mu^2 + 2cv = 0 \;\Longrightarrow\;
c^\ast = \frac{\mu^2}{\mu^2 + v}.$$

The second derivative $2\mu^2 + 2v$ is positive, so this is a minimum, and $c^\ast$ lies between 0
and 1, so the constraint is not active. Substituting $1 - c^\ast = v/(\mu^2 + v)$,

$$\text{MSE}(c^\ast) = \frac{v^2\mu^2 + \mu^4 v}{(\mu^2+v)^2} = \frac{v\mu^2(v + \mu^2)}
{(\mu^2+v)^2} = \frac{v\mu^2}{\mu^2+v} = c^\ast v.$$

Since $c^\ast < 1$ this is below $v = \text{MSE}(1)$, the MSE of the unbiased $\bar y$: *some*
bias always pays for itself, and the best $c$ trades it against variance exactly as in the
bias–variance decomposition. (The shrink factor has the form of the ridge factor
$s^2/(s^2 + \lambda N)$ of [Exercise 8](#e8). With a Gaussian prior of variance $\tau^2$ on
$\mu$, as in [Section 9](#s9), the posterior mean is $\tau^2/(\tau^2 + v)\,\bar y$, the same
form with $\tau^2$ in place of the unknown $\mu^2$.)

**(c) The numbers.** Here $v = \sigma^2/n = 9/9 = 1$, so $\bar y$ has MSE $1.0$ whatever $\mu$ is.

- $\mu = 2$: $c^\ast = 4/(4 + 1) = 0.8$. Bias$^2 = (0.2)^2\cdot 4 = 0.16$, variance $0.8^2\cdot 1 =
  0.64$, MSE $= 0.80 = c^\ast v$. A 20% reduction.
- $\mu = 0.5$: $c^\ast = 0.25/(0.25 + 1) = 0.2$. Bias$^2 = 0.8^2 \cdot 0.25 = 0.16$, variance
  $0.2^2\cdot 1 = 0.04$, MSE $= 0.20$. An 80% reduction.

Shrinking helps most when the signal is small against the noise, because then the unbiased
estimate is mostly noise and discarding some of it costs little. (A simulation of $10^6$
samples gives 0.800 and 0.200.)

**(d) The catch.** $c^\ast$ depends on $\mu$, the very quantity being estimated. Suppose you
believe $\mu = 0.5$ and shrink with $c = 0.2$, but $\mu$ is really 2:

$$\text{MSE} = (1 - 0.2)^2\cdot 2^2 + 0.2^2 \cdot 1 = 2.56 + 0.04 = 2.60,$$

two and a half times the MSE of the plain mean $\bar y$ (1.0). Shrinkage chosen without
evidence, or chosen from the wrong belief, can do real harm: the bias term grows with the square
of the distance from the true value, and nothing in the formula warns you.

The remedy is to choose the amount of shrinkage from the data, by estimating the error directly
on held-out data, which is what validation and cross-validation do. In ridge regression a larger
strength $\lambda$ means a smaller $c$: a $\lambda$ chosen by cross-validation is an estimate of
the unknowable $c^\ast$, and [Lab 3](#lab3) shows the ridge path and its minimum on noisy
data. The estimate is itself noisy, but unlike the guess above it is anchored to the data.
:::

::: exercise id=e8 level=2 kind=derivation minutes=10
**Normal equations and ridge.**

(a) Derive the normal equations from the gradient of $\mathcal{L}(\mathbf{w}) =
\tfrac1N\|\mathbf{X}\mathbf{w} - \mathbf{y}\|^2$.

(b) Add the ridge penalty $\lambda\|\mathbf{w}\|^2$ and show that the system becomes
$(\mathbf{X}^\top\mathbf{X} + \lambda N\mathbf{I})\mathbf{w} = \mathbf{X}^\top\mathbf{y}$.

(c) Using the eigenvalues of $\mathbf{X}^\top\mathbf{X}$, explain why this system is solvable
for every $\lambda > 0$, even when $\mathbf{X}$ has fewer rows than columns.

(d) If $\mathbf{X}^\top\mathbf{X}$ has eigenvalues 50 and 0.5 and $\lambda N = 5$, give the
shrinkage factor $s^2/(s^2 + \lambda N)$ of each direction and the condition numbers before and
after.
:::

::: solution
**(a)** Expand the squared norm: $\|\mathbf{X}\mathbf{w} - \mathbf{y}\|^2 =
\mathbf{w}^\top\mathbf{X}^\top\mathbf{X}\mathbf{w} - 2\mathbf{w}^\top\mathbf{X}^\top\mathbf{y} +
\mathbf{y}^\top\mathbf{y}$. The gradient of a quadratic form $\mathbf{w}^\top\mathbf{A}\mathbf{w}$
with symmetric $\mathbf{A}$ is $2\mathbf{A}\mathbf{w}$, the gradient of $\mathbf{w}^\top\mathbf{b}$
is $\mathbf{b}$, and the last term does not depend on $\mathbf{w}$, so

$$\nabla_{\mathbf{w}}\mathcal{L} = \frac1N\left(2\mathbf{X}^\top\mathbf{X}\mathbf{w} -
2\mathbf{X}^\top\mathbf{y}\right) = \frac2N\mathbf{X}^\top(\mathbf{X}\mathbf{w} - \mathbf{y}).$$

At a minimum the gradient is zero: $\mathbf{X}^\top\mathbf{X}\mathbf{w} = \mathbf{X}^\top\mathbf{y}$.
These are the normal equations. (The Hessian is $\tfrac2N\mathbf{X}^\top\mathbf{X}$, positive
semi-definite, so the loss is convex and a point with zero gradient is a global minimum.)

**(b)** The penalised loss is $\mathcal{L}(\mathbf{w}) + \lambda\|\mathbf{w}\|^2$, and
$\nabla_{\mathbf{w}}\lambda\|\mathbf{w}\|^2 = 2\lambda\mathbf{w}$. Setting the total gradient to
zero:

$$\frac2N\mathbf{X}^\top(\mathbf{X}\mathbf{w} - \mathbf{y}) + 2\lambda\mathbf{w} = \mathbf{0}.$$

Multiply by $N/2$: $\mathbf{X}^\top\mathbf{X}\mathbf{w} - \mathbf{X}^\top\mathbf{y} + \lambda
N\mathbf{w} = \mathbf{0}$, which rearranges to

$$(\mathbf{X}^\top\mathbf{X} + \lambda N\mathbf{I})\,\mathbf{w} = \mathbf{X}^\top\mathbf{y}.$$

The factor $N$ appears because $\mathcal{L}$ is the *mean* loss and the penalty is added to it
unscaled; a loss written as a sum would give $\lambda\mathbf{I}$ instead.

**(c)** $\mathbf{X}^\top\mathbf{X}$ is symmetric, so it has real eigenvalues $s_i^2$ with
orthogonal eigenvectors $\mathbf{v}_i$, and each is non-negative: $s_i^2 = \mathbf{v}_i^\top
\mathbf{X}^\top\mathbf{X}\mathbf{v}_i = \|\mathbf{X}\mathbf{v}_i\|^2 \ge 0$ (for a unit
eigenvector). Adding $\lambda N\mathbf{I}$ adds $\lambda N$ to *every* eigenvalue and leaves the
eigenvectors alone, so the eigenvalues of the ridge matrix are $s_i^2 + \lambda N \ge \lambda N >
0$. A symmetric matrix whose eigenvalues are all positive is invertible, so the system has
exactly one solution for every $\lambda > 0$.

This holds even when $\mathbf{X}$ has fewer rows than columns ($N < d + 1$) or dependent columns
([Exercise 2](#e2)). Then $\mathbf{X}^\top\mathbf{X}$ has rank at most $N$, so at least
$d + 1 - N$ eigenvalues are exactly zero and the unpenalised system has infinitely many
solutions. The penalty lifts those zeros to $\lambda N$ and picks, among all the weight vectors
that fit equally well, the one of smallest norm.

**(d) A worked case.** In the eigenbasis, ridge multiplies the least-squares component along each
direction by $s^2/(s^2 + \lambda N)$. (Derivation: in the basis of the $\mathbf{v}_i$ the system
decouples into $(s_i^2 + \lambda N)\,\tilde w_i = s_i^2\,\tilde w_i^{\text{LS}}$, because
$\mathbf{X}^\top\mathbf{y} = \mathbf{X}^\top\mathbf{X}\mathbf{w}^{\text{LS}}$ whenever the
least-squares solution exists.) With $\lambda N = 5$:

- direction with $s^2 = 50$: $50/55 = 0.909$;
- direction with $s^2 = 0.5$: $0.5/5.5 = 0.091$.

The well-determined direction, in which the data fix the weight tightly, keeps 91% of its
least-squares value. The poorly determined direction, which the data barely constrain, keeps 9%:
ridge removes most of what the data cannot support and little of what they can. The condition
number falls from $50/0.5 = 100$ to $(50 + 5)/(0.5 + 5) = 55/5.5 = 10$, so gradient descent on
the ridge loss also converges about ten times faster, in the sense of [Exercise 3](#e3).
:::

::: exercise id=e9 level=1 kind=conceptual minutes=5
**Spot the leak.** For each set-up say whether there is leakage, of which kind, and how to fix it.

(a) Missing values are imputed with the column mean of the full dataset, then 5-fold
cross-validation is run.

(b) Vibration spectra from 12 pumps, 500 per pump, are split 80/20 at random.

(c) Next-day failure is predicted from features that include "hours since last maintenance",
recorded at the end of the day of the failure.

(d) A model is tuned on the test set because the validation set was "too small".
:::

::: solution
**(a) Preprocessing leakage, usually mild.** The column means include the values in the rows that
each fold uses for validation, so a little information about the held-out rows reaches the model
through its inputs. For a mean over many rows the effect is small, which is why this leak often
survives unnoticed; for statistics that depend more on individual rows (target encoding, feature
selection by correlation with the label, PCA fitted on everything) it can be large. *Fix:* put
the imputer inside a `Pipeline` so that cross-validation fits it on each training fold only:
`make_pipeline(SimpleImputer(strategy="mean"), model)`. The rule is that anything with a `fit`
step is part of the model.

**(b) Group leakage.** A random split puts spectra from the same pump on both sides, and a pump's
spectra resemble each other far more than they resemble another pump's, so the model can score
well by recognising the *pump* instead of the fault. The score then says nothing about a pump
the model has never seen, which is the case in use. *Fix:* split by the unit that will be new
in use: `GroupKFold` with the pump as the group, or hold out two or three pumps entirely.

A simulation shows the size of the effect. Twelve pumps each have a signature in five
features and a "wear" value unrelated to the signature; a 5-nearest-neighbour regressor predicts
the wear:

```python
import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.model_selection import GroupKFold, KFold, cross_val_score
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
n_pumps, per_pump = 12, 500
pump = np.repeat(np.arange(n_pumps), per_pump)
signature = rng.normal(0, 3, size=(n_pumps, 5))        # each pump's own spectrum
wear = rng.normal(0, 1, n_pumps)                       # unrelated to its spectrum
X = signature[pump] + rng.normal(0, 1, size=(n_pumps * per_pump, 5))
y = wear[pump] + rng.normal(0, 0.2, n_pumps * per_pump)
X[rng.random(X.shape) < 0.05] = np.nan                 # 5% missing values

# (a) the imputer sits inside the pipeline, so each fold fits it on its training rows
model = make_pipeline(SimpleImputer(strategy="mean"), KNeighborsRegressor(5))
score = "neg_root_mean_squared_error"
rmse_random = -cross_val_score(model, X, y, cv=KFold(4, shuffle=True, random_state=0),
                               scoring=score).mean()
rmse_by_pump = -cross_val_score(model, X, y, cv=GroupKFold(4), groups=pump,
                                scoring=score).mean()
print(f"spread of y             : {y.std():.2f}")
print(f"random split, RMSE      : {rmse_random:.2f}")
print(f"split by pump, RMSE     : {rmse_by_pump:.2f}")
```

```output
spread of y             : 1.12
random split, RMSE      : 0.44
split by pump, RMSE     : 1.72
```

The random split reports an RMSE of 0.44 against a spread of 1.12 in $y$: an apparently good
model. Split by pump, the RMSE is 1.72, worse than predicting the mean, because the model has
nothing to offer for a pump it has not seen. By construction there was never anything to learn.
(RMSE is used here and not $R^2$ because the denominator of $R^2$ changes with the fold.)

**(c) Target leakage, with a temporal flavour.** Maintenance performed after the failure resets
"hours since last maintenance", so the value recorded at the end of the failure day encodes the
outcome. The feature is not available at the time the prediction would be made, and a model that
uses it is predicting the past. *Fix:* define for every feature the time at which it is known and
build the feature table as of the prediction time, with an explicit cut-off. A strong accuracy
that collapses when the model runs live is the usual symptom. Checking which feature the model
relies on most (and asking why) finds many such leaks.

**(d) Test-set reuse.** Once the test set has guided a choice (of model, of hyperparameters, of
threshold) it has become a validation set, and its score is optimistic by the amount of selection
([Section 10](#s10)). A small validation set is a reason to use cross-validation, not to borrow
the test set. *Fix:* tune by cross-validation on the training data (nested, if the cross-validation
score is itself reported), and keep, or collect, a test set that has not been touched, opened once
after all decisions are made.
:::

::: exercise id=e10 level=1 kind=conceptual minutes=5
**Before believing 98%.** A colleague reports 98% accuracy for a model that classifies hazards as
controllable or not controllable. List the five questions you ask before believing it, and for
each the answer that would make you trust the number.
:::

::: solution
Five questions, each aimed at one way a high accuracy can be empty:

1. **What is the class balance, and what does the majority-class rule score?** If 97% of the
   hazards are controllable, a model that always answers "controllable" scores 97%, and 98% adds
   little. *Trust if* 98% is clearly above the majority baseline, and the baseline is reported
   beside it.
2. **What are the confusion matrix and the per-class precision and recall?** Accuracy averages
   over classes weighted by their frequency, so it hides how the rare, costly class is treated. A
   hazard wrongly called controllable is the dangerous error. *Trust if* the recall on the
   "not controllable" class and the precision of the alarms are acceptable for the decision the
   model supports.
3. **How was the data split, and were duplicates removed?** The same hazard, or near-copies of it
   across analyses of the same system, on both sides of the split inflates the score
   ([Exercise 9](#e9)). *Trust if* the split is by the unit that will be new in use (system,
   project or hazard scenario, not row), and exact and near duplicates were removed before
   splitting.
4. **How many models and settings were tried, and was the test set opened once?** The best of many
   scores is optimistic ([Exercise 11](#e11)), and a test set consulted repeatedly is a validation
   set. *Trust if* all choices were made on training data or by cross-validation and the test set
   was scored once, with the number written down before the look.
5. **Do the test cases come from the conditions of use, and how many are there?** A test set from
   another industry, an older labelling practice or last year's systems measures a different
   problem, and a test set of 100 cases leaves an interval several points wide ([Section 10](#s10)).
   *Trust if* the cases resemble the future inputs in kind and in time, and the interval, from a
   bootstrap for example, is reported and narrow enough to matter.

A sixth question is worth asking when the labels were made by people: **how well do the labellers
agree with each other?** If two engineers agree on 95% of the hazards, a model cannot meaningfully
be judged at 98%, since the "ground truth" is itself wrong or contested on that fraction of the
cases.
:::

::: exercise id=e11 level=1 kind=conceptual minutes=5
**The best of 120.** You run a random search over 120 configurations of a gradient-boosting model,
score each by 5-fold cross-validation and report the best score.

(a) Why is that score optimistic even if every configuration is equally good?

(b) Does the optimism grow or shrink with (i) more configurations, (ii) more data, (iii)
configurations so alike that their scores are nearly identical? One sentence each.

(c) What is the remedy, and why does it work?
:::

::: solution
**(a)** A cross-validation score is the configuration's true performance plus noise that comes
from the particular folds and the particular data. Picking the best of 120 picks the
configuration whose noise happened to be the most favourable, so the maximum is biased upward
even when no configuration is better than another. The bias is a property of the selection and
of the noise, and it does not need any configuration to be overfitted ([Section 10](#s10)).

**(b)**

- (i) *More configurations:* the optimism grows, but slowly. The expected maximum of $n$
  independent standard normal draws rises roughly like $\sqrt{2\ln n}$; simulation gives 1.5 for
  10 draws, 2.6 for 120 and 3.3 for 1,200, in units of the noise's standard deviation. Searching
  ten times as much adds little, which is also why random search stops paying.
- (ii) *More data:* the optimism shrinks, because each score's noise falls like $1/\sqrt{N}$, and the
  selection bias is a multiple of that noise.
- (iii) *Nearly identical configurations:* the optimism shrinks, because scores that are strongly
  correlated behave like fewer independent draws, so there is less to pick the luckiest from.
  (The same folds are shared by all 120 configurations, which already makes their noise correlated,
  so the figures in (i) are an upper bound.)

**(c)** Score the chosen configuration on data that played no part in the selection: **nested
cross-validation** (an inner loop that selects, an outer loop that scores the whole procedure,
selection included), or a **test set opened once** after every choice has been made. The
selected model is then measured on noise it was not selected for, so its luck, which is
independent of that noise, averages out and the score is an honest estimate of the procedure's
performance. The cost of nested cross-validation is the extra fits; the cost of a single test set
is that it can be used only once. [Lab 4](#lab4)'s extension shows the size of the effect on
pure noise, where every configuration is exactly as good as chance.
:::

::: exercise id=e12 level=1 kind=conceptual minutes=5
**Forty-seven useless features.** A $k$-nearest-neighbour classifier ($k = 5$, standardised
features) detects bearing faults well from 3 vibration features computed on about 3,000 labelled
windows. A new data logger adds 47 further features, most of them unrelated to faults, and the
cross-validated accuracy falls although no information was removed.

(a) Give two reasons, both about distances.

(b) Name two remedies.

(c) Why would a gradient-boosted tree ensemble lose much less from the same 47 features?
:::

::: solution
**(a) Two reasons.**

1. *Irrelevant features dilute the distance.* After standardisation every feature contributes
   about the same spread to the squared distance. Each of the 47 irrelevant features adds as much
   squared distance between two random windows as an informative one does, so 47 noise terms
   swamp 3 signal terms, and the "nearest" neighbours are near in directions that mean nothing.
   The informative differences are still there; they are just a small part of the total.
2. *The curse of dimensionality.* In 50 dimensions a neighbourhood that holds a fixed fraction of
   the data has to span most of every feature's range. A cube holding 1% of uniformly spread data
   has an edge of $0.01^{1/d}$ of the range: 0.22 for $d = 3$, but 0.91 for $d = 50$
   ([Section 11](#s11)). With 3,000 windows, the five nearest are not local at all, and distances
   between a point and its nearest and its farthest neighbour become nearly equal.

**(b) Two remedies.**

- *Select or reduce features.* Choose them by validation, *inside* the cross-validation folds
  so that the selection does not leak the labels ([Lab 4](#lab4)); or use domain knowledge to
  keep the features that physics says matter; or reduce dimension with PCA, remembering that PCA
  keeps directions of large variance, which need not be the ones that carry the fault.
- *Learn the distance.* Weight the features (for example by validated relevance), or use a model
  that learns which inputs matter, and keep $k$-NN for problems with few, well-chosen features.

**(c) Why trees cope.** Each split of a tree uses one feature and one threshold, chosen from the
available features because it reduces the impurity most. An irrelevant feature seldom wins that
selection, so it is seldom used, and no step ever combines all 50 features into a single distance.
The ensemble therefore ignores most of the noise features instead of averaging over them. They
are not free: with 47 candidates per split a noise feature wins by chance now and then, and the
trees fit a little noise.

A simulation of the set-up (3,000 windows, three features whose mean shifts with the fault, 47
standard-normal features independent of it) shows the difference:

```python
import numpy as np
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

rng = np.random.default_rng(0)
n = 3000
fault = rng.integers(0, 2, n)
# three informative features: the mean shifts when a fault is present
signal = rng.normal(size=(n, 3)) + fault[:, None] * np.array([1.2, 0.8, 1.0])
noise = rng.normal(size=(n, 47))                       # 47 unrelated features
cv = StratifiedKFold(5, shuffle=True, random_state=0)

for name, X in [("3 features ", signal), ("50 features", np.hstack([signal, noise]))]:
    knn = make_pipeline(StandardScaler(), KNeighborsClassifier(5))
    boost = HistGradientBoostingClassifier(random_state=0)
    acc_knn = cross_val_score(knn, X, fault, cv=cv).mean()
    acc_boost = cross_val_score(boost, X, fault, cv=cv).mean()
    print(f"{name}: k-NN {acc_knn:.3f}   boosting {acc_boost:.3f}")
```

```output
3 features : k-NN 0.772   boosting 0.769
50 features: k-NN 0.659   boosting 0.789
```

The $k$-NN accuracy falls by 11 points, from 0.77 to 0.66; the boosted trees do not fall at all.
(The boosted trees are in fact about two points better with the noise features, in this
simulation and in each of the other seeds tried. The exercise does not explain that and it is not
a benefit of noise features; the point is only that the trees do not fall.)
:::

::: exercise id=e13 level=3 kind=coding minutes=25
**Is gradient boosting the baseline to beat?** Test the claim that gradient boosting is the
baseline to beat on tabular data. With 5-fold cross-validation using the same folds for every
model (`KFold(5, shuffle=True, random_state=0)`), compare the RMSE of

- predicting the mean (`DummyRegressor`);
- ridge (`StandardScaler` + `RidgeCV(alphas=np.logspace(-3, 3, 13))`);
- $k$-NN (`StandardScaler` + `KNeighborsRegressor(10)`);
- an RBF support-vector regressor (`StandardScaler` + `SVR(C=10)`);
- a random forest (300 trees, `random_state=0`);
- `HistGradientBoostingRegressor(random_state=0)`,

on (a) `make_friedman1(n_samples=2000, n_features=10, noise=1.0, random_state=0)` and (b)
`load_diabetes`. Report the mean $\pm$ standard deviation over folds and the fit time. Then
compute the fold-wise RMSE differences between the two best models on each dataset and say
whether the ranking is supported.
:::

::: solution
**Plan.** Build the six models as pipelines, so that scaling is fitted inside each fold (the
distance-based models and ridge need it; trees do not care). Use one `KFold` object for every
call, so that each model is scored on exactly the same test folds; that is what makes the
fold-wise differences meaningful. `cross_validate` with `neg_root_mean_squared_error` returns
one RMSE per fold. The "two best" are chosen by mean RMSE, and the question is then whether the
gap between them is large against the fold-to-fold variation *of the gap*.

```python
import time
import numpy as np
from sklearn.datasets import make_friedman1, load_diabetes
from sklearn.dummy import DummyRegressor
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import RidgeCV
from sklearn.model_selection import KFold, cross_validate
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVR

models = {
    "mean": DummyRegressor(),
    "ridge": make_pipeline(StandardScaler(), RidgeCV(alphas=np.logspace(-3, 3, 13))),
    "k-NN": make_pipeline(StandardScaler(), KNeighborsRegressor(10)),
    "SVR": make_pipeline(StandardScaler(), SVR(C=10)),
    "forest": RandomForestRegressor(300, random_state=0),
    "boosting": HistGradientBoostingRegressor(random_state=0),
}
X1, y1 = make_friedman1(n_samples=2000, n_features=10, noise=1.0, random_state=0)
X2, y2 = load_diabetes(return_X_y=True)
datasets = {"Friedman #1": (X1, y1), "diabetes": (X2, y2)}
cv = KFold(5, shuffle=True, random_state=0)  # one splitter object: same folds for all

for dname, (X, y) in datasets.items():
    print(f"{dname}: {X.shape[0]} rows, {X.shape[1]} features")
    rmse = {}
    for mname, model in models.items():
        t0 = time.perf_counter()
        res = cross_validate(model, X, y, cv=cv, scoring="neg_root_mean_squared_error")
        rmse[mname] = -res["test_score"]
        secs = time.perf_counter() - t0
        print(f"  {mname:9s} RMSE {rmse[mname].mean():6.2f} +- "
              f"{rmse[mname].std(ddof=1):5.2f}   time {secs:5.1f} s")
    # The two best by mean RMSE, compared fold by fold on identical test folds.
    best = sorted(rmse, key=lambda m: rmse[m].mean())[:2]
    diff = rmse[best[1]] - rmse[best[0]]
    print(f"  {best[1]} minus {best[0]}, per fold:", np.round(diff, 2))
    print(f"  mean {diff.mean():.2f}, SD {diff.std(ddof=1):.2f}, "
          f"{best[0]} better in {(diff > 0).sum()} of 5 folds")
```

```output
Friedman #1: 2000 rows, 10 features
  mean      RMSE   5.02 +-  0.09   time   0.0 s
  ridge     RMSE   2.59 +-  0.09   time   0.0 s
  k-NN      RMSE   2.52 +-  0.07   time   0.0 s
  SVR       RMSE   1.40 +-  0.05   time   0.6 s
  forest    RMSE   1.79 +-  0.07   time   5.6 s
  boosting  RMSE   1.34 +-  0.04   time   0.5 s
  SVR minus boosting, per fold: [0.09 0.09 0.03 0.01 0.07]
  mean 0.06, SD 0.04, boosting better in 5 of 5 folds
diabetes: 442 rows, 10 features
  mean      RMSE  76.93 +-  4.53   time   0.0 s
  ridge     RMSE  54.65 +-  2.19   time   0.0 s
  k-NN      RMSE  56.83 +-  2.99   time   0.0 s
  SVR       RMSE  55.63 +-  2.84   time   0.0 s
  forest    RMSE  57.78 +-  4.11   time   1.4 s
  boosting  RMSE  59.02 +-  5.50   time   0.2 s
  SVR minus ridge, per fold: [ 0.11  0.76 -1.92  4.79  1.18]
  mean 0.99, SD 2.44, ridge better in 4 of 5 folds
```

The times depend on the machine and are shown to give the order of magnitude; the whole script
runs in well under a minute. (If `HistGradientBoostingRegressor` is unexpectedly slow, the cause
is thread contention in its OpenMP back end on a busy machine: set the environment variable
`OMP_NUM_THREADS` to 1 or 2.)

**Reading the Friedman #1 table.** The data have a structure that the linear model cannot
express: the target is $10\sin(\pi x_1 x_2) + 20(x_3 - 0.5)^2 + 10x_4 + 5x_5$ plus noise, an
interaction, a quadratic and two linear terms, with five further features that do nothing. The
mean predictor, at 5.02, sets the scale. Ridge (2.59) and $k$-NN (2.52) reach about half that:
ridge because it captures little beyond the two linear terms, $k$-NN because the five irrelevant
features hurt its distance ([Exercise 12](#e12)). Then, in order, the forest (1.79), the SVR
(1.40) and boosting (1.34). The noise has standard deviation 1.0, so the floor, the irreducible
error, is an RMSE of about 1.0; boosting is within 0.34 of it.

*Is the ranking of the top two supported?* Boosting beats the SVR in all five folds, by 0.09,
0.09, 0.03, 0.01 and 0.07, a mean of 0.059 with a standard deviation of 0.038 over folds.
Treating the five differences as a sample, the mean is 3.5 standard errors from zero
($0.059/(0.038/\sqrt5)$), and the sign is the same in every fold. The ranking of boosting over
the SVR is supported, though the gap is small: 4% of the RMSE. The folds are not independent
(each pair of training sets overlaps by three quarters), so the formal significance is overstated;
the consistency of the sign is the more convincing evidence. The gap between boosting and the
linear and nearest-neighbour models is more than 1.1 RMSE and no such care is needed. The forest
is a distant third at about 0.45 above boosting, against fold-to-fold standard deviations of
0.07 (forest) and 0.04 (boosting).

**Reading the diabetes table.** The picture changes. The data are 442 rows with ten features, and
the signal is nearly additive and mostly linear. Ridge is best (54.65 $\pm$ 2.19), the SVR is
second (55.63), and boosting is *last* of the real models (59.02 $\pm$ 5.50, the largest
spread). The SVR minus ridge differences are $0.11, 0.76, -1.92, 4.79, 1.18$: a mean of 0.99 with
a standard deviation of 2.44, so the mean is 0.9 standard errors from zero and the sign
changes in one fold. **The ranking of ridge over the SVR is not supported**: the two are
indistinguishable on this data. Boosting minus ridge is $7.47, 0.34, -1.60, 9.01, 6.61$, a mean of
4.37 with ridge better in four folds of five. The mean gap is 2.1 standard errors of the five
differences (SD 4.69): suggestive, but five folds do not make it firm.

**Conclusion.** The claim is conditional. Gradient boosting wins when the target has
interactions and nonlinearity and there are enough rows to learn them from (Friedman #1, 2,000
rows), where it also wins against a well-tuned kernel method, though only narrowly. On a few
hundred rows with an additive signal a regularised linear model is as good or better, and cheaper
to fit, to interpret and to check. The sensible practice is not to assume a winner but to run the
ladder in the order of cost: a baseline, a linear model, then boosting or a forest, on the same
folds, and to judge the differences fold by fold and against their spread. The mean of the
folds alone does not tell you when the gap is too small to matter.

*Extension.* The claim that boosting needs more rows than ridge before its flexibility pays is a
prediction you can test with learning curves ([Section 8](#s8)): repeat the diabetes comparison
on 100, 200 and 400 rows and see whether the gap between boosting and ridge changes. The outcome
is not asserted here.
:::

::: exercise id=e14 level=2 kind=calculation minutes=10
**One bad point in a weighted fit.** In Lab 5's neo-Hookean fit over strains up to 20%, change the
point at $\lambda = 0.90$ from $-6.98$ kPa to $-8.00$ kPa.

(a) Refit with its recorded $\sigma = 0.185$ kPa: how far does $c_1$ move, what is that point's
normalised residual, and what happens to $\chi^2_\nu$?

(b) Refit with that point's $\sigma$ multiplied by ten.

(c) Which behaviour do you want, and what does this say about recording uncertainties?
:::

::: solution
**Set-up.** The data of Lab 5 are a synthetic soft-hydrogel compression test: stretches
$\lambda_k = 1 - 0.025k$ for $k = 1, \dots, 16$, true material the Gent model with $c_1 = 10$ kPa and
$\beta = 0.2$, recorded uncertainty $\sigma_k = 0.05 + 0.02|P_{\text{true},k}|$ kPa, and measured
stress $P_k = P_{\text{true},k} + \sigma_k\varepsilon_k$ with $\varepsilon_k$ from
`default_rng(1)`. The weighted fit of $c_1$ uses the closed form of [Section 12](#s12):
$c_1^\ast = \sum w_i P_i g_i / (2\sum w_i g_i^2)$ with $w_i = 1/\sigma_i^2$, $g(\lambda) =
\lambda - \lambda^{-2}$ and standard error $1/(2\sqrt{\sum w_i g_i^2})$. This code is self-contained:

```python
import numpy as np

def g(lam):
    return lam - lam**-2                     # neo-Hookean shape function

def p_gent(lam, c1=10.0, beta=0.2):          # the true material of the test
    i1m3 = lam**2 + 2/lam - 3
    return 2*c1*g(lam)/(1 - beta*i1m3)

lam = 1 - 0.025*np.arange(1, 17)
sigma = 0.05 + 0.02*np.abs(p_gent(lam))      # recorded uncertainty, kPa
P = p_gent(lam) + sigma*np.random.default_rng(1).normal(size=16)

def fit_neo_hookean(lam, P, sigma):
    """Weighted least squares for c1: closed form, standard error, residuals."""
    w = 1/sigma**2
    sum_wgg = np.sum(w*g(lam)**2)
    c1 = np.sum(w*P*g(lam))/(2*sum_wgg)
    se = 1/(2*np.sqrt(sum_wgg))
    r = (P - 2*c1*g(lam))/sigma              # normalised residuals
    chi2_nu = np.sum(r**2)/(len(P) - 1)      # one parameter fitted
    return c1, se, r, chi2_nu

n = 8                                        # strains up to 20%
lam8, P8, s8 = lam[:n], P[:n].copy(), sigma[:n].copy()
k = 3                                        # the point at lambda = 0.90
print(f"point {k}: lambda = {lam8[k]:.2f}, P = {P8[k]:.2f}, sigma = {s8[k]:.3f}")

def report(label, P, s):
    c1, se, r, chi = fit_neo_hookean(lam8, P, s)
    print(f"{label:22s} c1 = {c1:6.2f} +- {se:.2f} kPa   r[{k}] = {r[k]:5.2f}"
          f"   chi2_nu = {chi:.2f}")

report("original", P8, s8)
P8[k] = -8.00
report("point moved to -8.00", P8, s8)
s8[k] *= 10
report("... and its sigma x 10", P8, s8)
```

```output
point 3: lambda = 0.90, P = -6.98, sigma = 0.185
original               c1 =  10.09 +- 0.10 kPa   r[3] = -1.21   chi2_nu = 0.71
point moved to -8.00   c1 =  10.29 +- 0.10 kPa   r[3] = -6.03   chi2_nu = 6.44
... and its sigma x 10 c1 =  10.04 +- 0.11 kPa   r[3] = -0.69   chi2_nu = 0.54
```

**(a) The recorded uncertainty kept.** The fitted $c_1$ moves from 10.09 to 10.29 kPa, a change of
$+0.20$ kPa: 2.0% of the value, or two standard errors (0.20/0.0997). The point's normalised
residual is $-6.03$: the fitted curve at $\lambda = 0.90$ is about six of the point's own standard
deviations above the measurement. And $\chi^2_\nu$ rises from 0.71 to 6.44, nine times its
earlier value, with the extra contribution coming almost entirely from that one point (the
other seven residuals stay within about $\pm 1.6$).

The size of the pull can be checked by hand. $c_1^\ast$ is linear in the data, so changing one
$P_i$ by $\Delta P$ changes it by $\Delta c_1 = w_i g_i\,\Delta P/(2\sum w_j g_j^2)$. Here
$w_i = 1/0.1847^2 = 29.3$, $g(0.90) = 0.90 - 1/0.81 = -0.3346$, $\Delta P = -8.00 -
(-6.975) = -1.025$, and $2\sum w_j g_j^2 = 1/(2\,\text{SE}^2) = 50.3$. So $\Delta c_1 =
29.3\times(-0.3346)\times(-1.025)/50.3 = +0.20$, which matches the refit. The fit is dragged, by an
amount proportional to the point's *weight*, but the diagnostics flag it clearly.

**(b) The uncertainty inflated.** Multiplying that point's $\sigma$ by ten divides its weight by
a hundred. Now $c_1 = 10.04$ kPa, essentially the value without the point at all (10.04 when it
is dropped), the point's residual is $-0.69$ standard deviations, and $\chi^2_\nu = 0.54$. The
point is effectively ignored. The standard error of $c_1$ rises slightly, to 0.107, because the
fit now has less information.

**(c) What you want, and what the exercise shows.** It depends on what the reading *was*. If the
instrument was working and the reading was as precise as its recorded $\sigma$, then (a) is the
honest answer: a point six standard deviations off is real evidence that the specimen, the
model or the test set-up needs explaining, and the large $\chi^2_\nu$ is the alarm. Down-weighting
that point would hide the evidence. If a problem was known when the point was taken (slip at
the platen, a bubble under the load cell), the honest record of what the measurement is worth
is a large $\sigma$, as in (b), and then the fit rightly ignores it.

What must not happen is the third case: a wrong, small $\sigma$ on a bad reading, which gives (a)
without the diagnosis, and a result nobody examines. The $\sigma_i$ are part of the data, not a
setting: they say how much each point may move the answer, and the fit is only as honest as they
are. A routine that accepts points without an uncertainty cannot do this check at all, which is
why Lab 5's `check_inputs` refuses them. And the order of the diagnostics matters: look at the
normalised residuals *before* adjusting any $\sigma$, because inflating the uncertainty until
$\chi^2_\nu$ looks good is how a fit is made to pass instead of being understood.
:::

::: exercise id=e15 level=1 kind=conceptual minutes=5
**The mislabelled loading direction.** A colleague exports a compression test with the stretches
written as $1 + \text{strain}$ and the stresses as positive numbers, and fits the neo-Hookean
model with the loading direction declared as tension.

(a) Which of Lab 5's input checks fire, and why can no input check catch this mistake?

(b) Over the first 5% of strain the misread fit looks clean; over 20% it does not. Explain from
the way $g(\lambda) = \lambda - \lambda^{-2}$ bends on either side of $\lambda = 1$, without
computing.

(c) What must be stored with the fitted $c_1$ so that the next user cannot repeat the mistake?
:::

::: solution
**(a) No check fires.** The checks refuse inputs that contradict each other: a missing or
non-positive uncertainty, stretches on the wrong side of 1 for the declared direction, stresses
whose sign is wrong for that direction. Stretches above 1 with positive stresses and a
declared tension test are mutually consistent: they describe a perfectly valid tension test.
The mistake is not in the numbers' relation to each other but in their relation to what happened
in the laboratory, where the platens moved *together*. A check can only find a contradiction
among the declarations, and here there is none; only the test record can say which direction
was loaded. This is a general limit of validation by rules: a consistent mislabelling passes
every consistency check.

**(b) Why the error shows only at larger strains.** $g(\lambda) = \lambda - \lambda^{-2}$ has the
same slope on both sides of $\lambda = 1$: $g'(\lambda) = 1 + 2\lambda^{-3}$ equals 3 at $\lambda =
1$. But $g''(\lambda) = -6\lambda^{-4}$ is negative, so $g$ bends downward. Moving away from
$\lambda = 1$ with strain $\varepsilon$, the expansion about $\lambda = 1$ is

$$g(1 + \varepsilon) = 3\varepsilon - 3\varepsilon^2 + \dots, \qquad g(1 - \varepsilon) =
-(3\varepsilon + 3\varepsilon^2 + \dots).$$

In compression $|g|$ grows faster than linearly in the strain (the curve bends away from the tangent
line, towards more negative values); in tension it grows more slowly than linearly. To first order
in $\varepsilon$ the two branches agree, and the misread data look like a tension test of a slightly
stiffer material, which a one-parameter fit absorbs into a larger $c_1$ without leaving any
pattern. The two branches differ by about $6\varepsilon^2$, against a first-order term of $3\varepsilon$:
a relative difference of about $2\varepsilon$. Over the first 5% of strain the ratio of the two
branches runs from about 1.05 to 1.10; a single $c_1$ absorbs its average, and what is left, a
few per cent across the range, is below what the noise lets the residuals show. Over 20% the
ratio runs from 1.05 to 1.5, far more than one coefficient can absorb, the residuals form runs,
and $\chi^2_\nu$ is far above 1. In Lab 5's measurements, over the first 5%
the misread fit has $c_1$ 8.7% too high and $\chi^2_\nu = 0.38$ (a clean fit of the wrong
model); over 20% it is 28.5% too high with $\chi^2_\nu = 20.7$. A clean fit does not show that
the model is right: it shows that the data cannot tell the difference.

**(c) What to store.** With the coefficient, record the **loading direction** and the sign
convention of the stretch and stress (is compression negative?), the **strain range** it was fitted
over, the **uncertainties** and the **diagnostics** ($\chi^2_\nu$ and the normalised residuals),
and the model used (neo-Hookean, Gent). A fitted $c_1$ is meaningful only for the test it came
from, in the model it was fitted with. A bare number, "$c_1 = 12.97$ kPa", is an invitation to
reuse it in a setting where it is wrong, and the report that travels with the number is the only
protection the next user has.
:::
