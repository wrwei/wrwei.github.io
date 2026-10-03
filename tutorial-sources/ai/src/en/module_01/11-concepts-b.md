## Where losses come from: maximum likelihood {#s5}

Sections 2–4 minimised squared error without asking why the errors should be squared rather
than, say, taken in absolute value. This section answers the question, and the answer turns a
choice that looks arbitrary into an assumption you can check: a loss is the negative
log-likelihood of the data under a model of the noise. Every loss in this module, and the
cross-entropy that trains every language model in the series, comes from that one principle.
It needs a little probability first.

### A probability refresher

A **random variable** is a quantity whose value is uncertain until it is observed: the next
reading of a strain gauge, the label of the next weld inspected. A discrete random variable has
a **probability mass function** $p(y) = P(Y = y)$, whose values lie between 0 and 1 and sum to
1. A continuous one has a **probability density** $p(y)$, and probabilities are areas under it,
$P(a \le Y \le b) = \int_a^b p(y)\,dy$. A density is not a probability. It can exceed 1 wherever
the distribution is concentrated; only its integral must equal 1.

Four distributions do most of the work in this series:

- **Gaussian**: $\mathcal{N}(y;\mu,\sigma^2) = (2\pi\sigma^2)^{-1/2}\exp\big(-(y-\mu)^2/(2\sigma^2)\big)$,
  with mean $\mu$ and variance $\sigma^2$. Its peak density $1/(\sqrt{2\pi}\,\sigma)$ exceeds 1
  whenever $\sigma < 0.399$.
- **Laplace**: $(2b)^{-1}\exp(-\lvert y-\mu\rvert/b)$, with mean $\mu$ and variance $2b^2$. Against a
  Gaussian of the same variance it is more sharply peaked and has heavier tails: at
  $y = \mu$ its density is $1/\sqrt2 = 0.707$ against the Gaussian's 0.399 at unit variance.
- **Bernoulli**, for $y \in \{0, 1\}$: $p^y(1-p)^{1-y}$, which is $p$ when $y = 1$ and $1 - p$
  when $y = 0$.
- **Categorical**, for $y \in \{1, \dots, K\}$: $\prod_k p_k^{[y=k]}$, where $[y = k]$ is 1 when
  $y = k$ and 0 otherwise, so the product picks out $p_y$.

The **expectation** $\E[X]$ is the probability-weighted average of $X$ (a sum over a mass
function, an integral over a density), and the **variance** is
$\operatorname{Var}(X) = \E[(X - \E[X])^2]$. Three rules follow from the definitions. For
constants $a$ and $c$, $\E[aX + c] = a\E[X] + c$ and $\operatorname{Var}(aX + c) =
a^2\operatorname{Var}(X)$; for independent $X$ and $Y$, $\operatorname{Var}(X + Y) =
\operatorname{Var}(X) + \operatorname{Var}(Y)$. Section 8 uses them to compute the variance of a
fitted curve, and Section 12 the uncertainty of a fitted material constant.

Two random variables are **independent** when their joint probability factorises,
$p(y_1, y_2) = p(y_1)\,p(y_2)$. The standard assumption about a dataset is that its examples
are **independent and identically distributed** (i.i.d.): each is drawn separately from the
same $P$. The probability of the whole dataset is then a product over its examples. Engineering
data break the assumption often. Ten measurements of one specimen share that specimen's quirks;
consecutive readings of one sensor share its drift. Treating them as independent overstates how
much evidence they hold, and splitting them at random between training and test leaks
information across the split (group and time leakage, [Section 10](#s10)).

### Likelihood, and why we take its logarithm

Let a model assign a probability, or a density, $p(y \mid \mathbf{x};\theta)$ to every possible
output. For i.i.d. data the **likelihood** is

$$
p(\mathcal{D};\theta) = \prod_{i=1}^{N} p(y_i \mid \mathbf{x}_i;\theta),
$$

read as a function of $\theta$ with the data held fixed. It is not a probability distribution
over $\theta$: it need not integrate to 1 over $\theta$, and it says how well each $\theta$
explains the data, not how probable $\theta$ is. **Maximum likelihood estimation** chooses the
$\theta$ under which the observed data are most probable.

In practice one maximises the **log-likelihood** $\sum_i \ln p(y_i \mid \mathbf{x}_i;\theta)$
instead, for two reasons. The logarithm is increasing, so it has the same maximiser. And
products of many probabilities underflow: a thousand probabilities of 0.1 multiply to
$10^{-1000}$, far below the smallest normal double-precision number (about $2.2\times10^{-308}$),
so the product is stored as 0.0 and every $\theta$ looks equally bad. The sum of the logarithms,
$1000\ln 0.1 = -2302.6$, is an ordinary number.

```python
import numpy as np

probs = np.full(1000, 0.1)                 # a thousand events, each of probability 0.1
print(np.prod(probs))                      # the likelihood itself underflows
print(f"{np.log(probs).sum():.1f}")        # the log-likelihood is an ordinary number
```

```output
0.0
-2302.6
```

### Gaussian noise gives squared error

Suppose the data were generated as $y = f_\theta(\mathbf{x}) + \varepsilon$, with
$\varepsilon \sim \mathcal{N}(0, \sigma^2)$ independent across examples. Then $y$ given
$\mathbf{x}$ is Gaussian with mean $f_\theta(\mathbf{x})$, and the log-likelihood is

$$
\begin{aligned}
\ln p(\mathcal{D};\theta)
&= \sum_{i=1}^{N} \ln\left[\frac{1}{\sqrt{2\pi}\,\sigma}
   \exp\left(-\frac{(y_i - f_\theta(\mathbf{x}_i))^2}{2\sigma^2}\right)\right] \\
&= -N\ln\big(\sqrt{2\pi}\,\sigma\big)
   - \frac{1}{2\sigma^2}\sum_{i=1}^{N}\big(y_i - f_\theta(\mathbf{x}_i)\big)^2 .
\end{aligned}
$$

The first term does not depend on $\theta$. The second is the sum of squared errors times the
negative constant $-1/(2\sigma^2)$. Maximising the log-likelihood over $\theta$ is therefore
minimising $\sum_i (y_i - f_\theta(\mathbf{x}_i))^2$, which is $N$ times the mean squared error of
[Section 2](#s2). The value of $\sigma$ scales and shifts the objective but does not move its
maximiser: least squares is the maximum-likelihood fit under Gaussian noise of any width.

The noise level itself can be estimated by maximum likelihood. Write $v = \sigma^2$ and
$r_i = y_i - f_{\hat\theta}(\mathbf{x}_i)$ for the residuals of the fitted model, and set the
derivative with respect to $v$ to zero:

$$
\frac{\partial}{\partial v}\left[-\frac{N}{2}\ln(2\pi v) - \frac{1}{2v}\sum_{i} r_i^2\right]
= -\frac{N}{2v} + \frac{1}{2v^2}\sum_{i} r_i^2 = 0
\quad\Longrightarrow\quad
\hat\sigma^2 = \frac{1}{N}\sum_{i=1}^{N} r_i^2 .
$$

This estimate is biased low, for the same reason as the training loss of [Section 1](#s1): the
residuals were made small by the fit. For a linear model with $p$ parameters,
$\E[\sum_i r_i^2] = (N - p)\sigma^2$, a standard result (Hastie et al. 2009, Section 3.2) with a
one-line proof from Section 2's hat matrix $\mathbf{P}$. The residual is
$\mathbf{r} = (\mathbf{I} - \mathbf{P})\mathbf{y} = (\mathbf{I} - \mathbf{P})\boldsymbol{\varepsilon}$,
because $(\mathbf{I} - \mathbf{P})\mathbf{X} = \mathbf{0}$, so

$$
\E\lVert\mathbf{r}\rVert^2
= \E\big[\boldsymbol{\varepsilon}^\top(\mathbf{I} - \mathbf{P})\boldsymbol{\varepsilon}\big]
= \sigma^2\operatorname{tr}(\mathbf{I} - \mathbf{P}) = \sigma^2(N - p).
$$

(The middle step uses that $\mathbf{I} - \mathbf{P}$ is symmetric and idempotent, so
$\lVert(\mathbf{I} - \mathbf{P})\boldsymbol{\varepsilon}\rVert^2 = \boldsymbol{\varepsilon}^\top(\mathbf{I} - \mathbf{P})\boldsymbol{\varepsilon}$,
and that $\E[\boldsymbol{\varepsilon}^\top\mathbf{A}\boldsymbol{\varepsilon}] = \sigma^2\operatorname{tr}\mathbf{A}$
for independent noise of variance $\sigma^2$.)

The residual lives in the $N - p$ dimensions the model cannot reach, and only noise in those
dimensions shows in it. The unbiased estimate therefore divides by $N - p$. That is the
difference between Section 2's residual RMS of 0.1000, which is the maximum-likelihood
$\hat\sigma$, and its $\sqrt{\text{RSS}/(N-4)} = 0.1010$.

::: worked title="Three residuals under a Gaussian"
A model leaves residuals $\mathbf{r} = (0.1, -0.2, 0.3)$ on three points, and the noise is
assumed to have $\sigma = 0.2$.

- Constant term: $-3\ln(\sqrt{2\pi}\times 0.2) = -3\ln 0.5013 = -3\times(-0.6905) = 2.0715$.
- Data term: $0.01 + 0.04 + 0.09 = 0.14$, and $0.14/(2\times 0.04) = 1.75$.
- Log-likelihood: $2.0715 - 1.75 = 0.3215$.

It is positive because the three densities, 1.760, 1.210 and 0.648, are mostly above 1; the
peak is $1/(\sqrt{2\pi}\times 0.2) = 1.995$. A positive log-likelihood is not a bug.

The maximum-likelihood noise level is $\hat\sigma^2 = 0.14/3 = 0.0467$, so $\hat\sigma = 0.216$.
Substituting, and using $\sum_i r_i^2 = N\hat\sigma^2$, the log-likelihood becomes
$-\tfrac{3}{2}\ln(2\pi\times 0.0467) - \tfrac{3}{2} = 1.8403 - 1.5 = 0.3403$: higher than at
$\sigma = 0.2$, as a maximum must be.
:::

### Laplace noise gives absolute error

If instead $\varepsilon$ has the Laplace density, the negative log-likelihood of one example is
$\ln(2b) + \lvert y - f_\theta(\mathbf{x})\rvert/b$, and maximum likelihood minimises
$\sum_i \lvert y_i - f_\theta(\mathbf{x}_i)\rvert$, the absolute error. The two losses differ
most clearly for the simplest model, a constant prediction $c$. Under squared error the
derivative of $\sum_i (y_i - c)^2$ is $-2\sum_i (y_i - c)$, which is zero at the mean. Under
absolute error the derivative of $\sum_i \lvert y_i - c\rvert$ is
$-\sum_i \operatorname{sign}(y_i - c)$, which is zero when as many points lie above $c$ as
below it: at the median. The mean responds to every point in proportion to its distance; the
median only counts how many points lie on each side. That is why an absolute-error fit is
robust to outliers and a squared-error fit is not.

::: worked title="A sensor glitch, and what an outlier costs"
Five readings $y = (1.0, 1.2, 0.9, 1.1, 5.0)$, the last a glitch.

- Squared error picks the mean: $(1.0 + 1.2 + 0.9 + 1.1 + 5.0)/5 = 9.2/5 = 1.84$, above four of
  the five readings.
- Absolute error picks the median, the middle of the sorted values $(0.9, 1.0, 1.1, 1.2, 5.0)$:
  $1.1$.

Without the glitch both would be 1.05. The glitch moved the mean by 0.79 and the median by 0.05.

What one outlier costs each model, for a residual $r = 5$ when the noise has unit variance: the
Gaussian negative log-likelihood, with its constant dropped, is $r^2/(2\sigma^2) = 25/2 = 12.5$.
A Laplace with the same variance has $2b^2 = 1$, so $b = 1/\sqrt2$, and charges
$\lvert r\rvert/b = 5\sqrt2 = 7.07$. The quadratic charge grows faster with the residual, which
is why one bad point can move a least-squares fit.
:::

Huber's loss, quadratic for small residuals and linear beyond a threshold, is the usual
compromise between the two; [Module 02, Section 12](module_02_EN.html#s12) uses it.

### Different noise per point: weighted least squares

Measurements often come with their own uncertainties: a load cell is less precise at the bottom
of its range, a reading taken during a disturbance is flagged as poor. If point $i$ has known
noise standard deviation $\sigma_i$, the Gaussian negative log-likelihood is

$$
-\ln p(\mathcal{D};\theta)
= \sum_{i=1}^{N} \ln\big(\sqrt{2\pi}\,\sigma_i\big)
+ \sum_{i=1}^{N} \frac{\big(y_i - f_\theta(\mathbf{x}_i)\big)^2}{2\sigma_i^2}.
$$

The first sum does not involve $\theta$, so maximum likelihood minimises
$\sum_i w_i (y_i - f_\theta(\mathbf{x}_i))^2$ with weights $w_i = 1/\sigma_i^2$. This is
**weighted least squares**: a precise point pulls hard on the fit, an uncertain one gently. It is
the likelihood of the hydrogel fit in [Section 12](#s12), where every stress reading carries its
own uncertainty.

### The recipe

| Noise model | Loss (negative log-likelihood) | Best constant prediction |
|---|---|---|
| Gaussian | squared error | the mean |
| Laplace | absolute error | the median |
| Bernoulli | binary cross-entropy | the frequency of class 1 |
| Categorical | cross-entropy | the class frequencies |

Read a row across: assuming Gaussian noise, fitting by squared error and summarising a sample by
its mean are one decision, not three. The last two rows are the classifiers of
[Section 6](#s6); their best constant is found the same way, by setting a derivative to zero.

::: keyidea
A loss is a negative log-likelihood under a noise model. Choosing a loss is choosing what you
believe about the noise.
:::

The average negative log-likelihood has a name that recurs throughout the series. For a data
distribution $p_\text{data}$ and a model distribution $p_\theta$, adding and subtracting
$\ln p_\text{data}$ inside the expectation gives

$$
\E_{y\sim p_\text{data}}\big[-\ln p_\theta(y)\big]
= \underbrace{\E\big[-\ln p_\text{data}(y)\big]}_{H(p_\text{data})}
+ \underbrace{\E\left[\ln\frac{p_\text{data}(y)}{p_\theta(y)}\right]}_{\KL(p_\text{data}\,\|\,p_\theta)} .
$$

The left side is the **cross-entropy** $H(p_\text{data}, p_\theta)$. It splits into the entropy
of the data, which no choice of $\theta$ can change, and the **Kullback–Leibler divergence**,
which is never negative and is zero only when $p_\theta = p_\text{data}$. Maximising likelihood
therefore moves the model's distribution towards the data's. [Module 07, Section 1](module_07_EN.html#s1)
reports a language model's quality as its perplexity, which is $\exp$ of exactly this
cross-entropy, per token, on held-out text.

Adding a prior distribution over $\theta$ turns maximum likelihood into maximum a posteriori
(MAP) estimation, and the logarithm of the prior becomes a penalty on the parameters:
[Section 9](#s9) derives ridge and lasso regression this way.

::: check
A density value of 2.0 comes out of your code. Is something wrong?
:::

::: answer
Not necessarily. A density is not a probability: it exceeds 1 wherever the distribution is
concentrated (a Gaussian with $\sigma = 0.1$ peaks at 3.99). Only its integral must equal 1.
:::

::: check
Why does the maximum-likelihood $\theta$ under Gaussian noise not depend on $\sigma$?
:::

::: answer
$\sigma$ enters the log-likelihood as a positive factor $1/(2\sigma^2)$ on the sum of squares
and as a term $-N\ln(\sqrt{2\pi}\,\sigma)$ that does not involve $\theta$. Neither changes which
$\theta$ minimises the sum of squares.
:::

::: check
Which loss would you choose if a few readings in every test are glitches of unknown size?
:::

::: answer
An absolute-error or Huber loss, which corresponds to a heavy-tailed noise model, or explicit
outlier handling. Squared error charges a glitch the square of its size, so one glitch can move
the whole fit.
:::

## Logistic and softmax regression {#s6}

Regression predicts a number; classification predicts one of $K$ labels: defective or
acceptable, benign or malignant, the next token of a text. The Bernoulli and categorical rows of
Section 5's table already give the loss. What is missing is a model whose output is a
probability. This section builds the linear one, derives its gradient and curvature, and shows
how it fails.

### Probabilities from a linear score

For $y \in \{0, 1\}$, logistic regression models

$$
p(y = 1 \mid \mathbf{x}) = \sigma(\mathbf{w}^\top\mathbf{x}),
\qquad \sigma(z) = \frac{1}{1 + e^{-z}},
$$

with the intercept absorbed into $\mathbf{w}$ as in [Section 2](#s2). Here $\sigma$ is the
**logistic** (sigmoid) function, not a standard deviation. It maps any real score $z$, the
**logit**, into $(0, 1)$. Two properties are used below. First, $\sigma(-z) = 1 - \sigma(z)$.
Second, its derivative is

$$
\sigma'(z) = \frac{e^{-z}}{(1 + e^{-z})^2}
= \frac{1}{1 + e^{-z}}\cdot\frac{e^{-z}}{1 + e^{-z}}
= \sigma(z)\big(1 - \sigma(z)\big).
$$

Solving $p = \sigma(z)$ for $z$ gives $z = \ln\big(p/(1-p)\big)$, the logarithm of the odds. So
logistic regression is linear in the **log-odds**: $\ln(p/(1-p)) = \mathbf{w}^\top\mathbf{x}$.
Raising feature $j$ by one unit adds $w_j$ to the log-odds, which multiplies the odds by
$e^{w_j}$. A coefficient of 0.7 doubles the odds per unit ($e^{0.7} = 2.01$). That is how a
fitted coefficient is read.

### The loss and its gradient

The Bernoulli negative log-likelihood of one example, with $\hat p = \sigma(z)$, is the
**binary cross-entropy**

$$
\ell = -\big[y\ln\hat p + (1 - y)\ln(1 - \hat p)\big].
$$

Its derivative with respect to the logit follows from the chain rule in two factors:

$$
\frac{d\ell}{d\hat p} = -\frac{y}{\hat p} + \frac{1-y}{1-\hat p},
\qquad
\frac{d\hat p}{dz} = \hat p(1-\hat p),
\qquad
\frac{d\ell}{dz} = -y(1-\hat p) + (1-y)\hat p = \hat p - y .
$$

The sigmoid's derivative cancels both denominators, and what is left is predicted minus
observed. Since $z_i = \mathbf{w}^\top\mathbf{x}_i$ gives $\partial z_i/\partial\mathbf{w} =
\mathbf{x}_i$, the gradient of the mean loss is

$$
\nabla_{\mathbf{w}}\mathcal{L}
= \frac{1}{N}\sum_{i=1}^{N}(\hat p_i - y_i)\,\mathbf{x}_i
= \frac{1}{N}\mathbf{X}^\top(\hat{\mathbf{p}} - \mathbf{y}),
$$

the same shape as the least-squares gradient $\frac{2}{N}\mathbf{X}^\top(\mathbf{X}\mathbf{w} -
\mathbf{y})$, with $\hat{\mathbf{p}}$ in place of $\hat{\mathbf{y}}$ (the factor 2 belonged to the
square).

### Curvature, convexity and the step size

Differentiating once more, $\partial\hat p_i/\partial\mathbf{w} = \hat p_i(1-\hat p_i)\mathbf{x}_i$,
so the Hessian is

$$
\mathbf{H} = \frac{1}{N}\sum_{i=1}^{N}\hat p_i(1-\hat p_i)\,\mathbf{x}_i\mathbf{x}_i^\top
= \frac{1}{N}\mathbf{X}^\top\mathbf{S}\mathbf{X},
\qquad \mathbf{S} = \operatorname{diag}\big(\hat p_i(1-\hat p_i)\big).
$$

For any $\mathbf{v}$, $\mathbf{v}^\top\mathbf{H}\mathbf{v} = \frac{1}{N}\sum_i
\hat p_i(1-\hat p_i)(\mathbf{x}_i^\top\mathbf{v})^2 \ge 0$, so $\mathbf{H}$ is positive
semidefinite and the loss is convex: every minimum is global. But the gradient is nonlinear in
$\mathbf{w}$, so setting it to zero has no closed-form solution. The options are gradient
descent; Newton's method, which here is called iteratively reweighted least squares because each
Newton step solves a least-squares problem weighted by $\mathbf{S}$; or a quasi-Newton method.
scikit-learn's default solver is L-BFGS, a quasi-Newton method.

Section 3's stability analysis carries over with one change. Since $\hat p(1-\hat p) \le \tfrac14$,
with equality at $\hat p = \tfrac12$, the largest curvature satisfies $\lambda_{\max}(\mathbf{H})
\le \lambda_{\max}(\mathbf{X}^\top\mathbf{X}/N)/4$, and gradient descent is guaranteed stable for

$$
\eta < \frac{2}{\lambda_{\max}(\mathbf{H})}, \quad\text{which holds whenever}\quad
\eta < \frac{8}{\lambda_{\max}(\mathbf{X}^\top\mathbf{X}/N)} .
$$

This bound is sufficient, not necessary. The curvature reaches its worst case only where every
$\hat p_i$ is near $\tfrac12$; as the fit improves most $\hat p_i$ move towards 0 or 1 and the
curvature falls far below the bound. [Lab 2](#lab2) computes the bound for its data as
$\eta < 0.59$, and in its extension the loss still falls at $\eta = 5$.

### Why not squared error

Squared error through a sigmoid, $\tfrac12(\hat p - y)^2$, has gradient

$$
\frac{d}{dz}\,\tfrac12(\hat p - y)^2 = (\hat p - y)\,\hat p(1 - \hat p)
$$

with respect to the logit. The extra factor $\hat p(1-\hat p)$ vanishes as $\hat p$ approaches 0
or 1, and that includes the case where the model is confidently wrong, $\hat p$ near 1 for
$y = 0$. There, cross-entropy's gradient $\hat p - y$ is close to its largest value, while the
squared-error gradient is close to zero: the model learns slowest exactly where it is most wrong
(Figure 1.8, right). Squared error through a sigmoid is also not convex in $\mathbf{w}$: for
$y = 0$ it rises and then flattens at 0.5, and gradient descent can stall on the plateau. A
confidently wrong model must be able to learn fast. [Exercise 4](#e4) puts numbers on the
difference.

::: figure id=fig-01-8
Left: the sigmoid $\sigma(z)$ for $z$ from −6 to 6, with its derivative $\sigma(z)(1 - \sigma(z))$,
which peaks at 0.25 at $z = 0$. Right: the loss of one example with $y = 0$ against $z$: binary
cross-entropy, $\operatorname{softplus}(z) = \ln(1 + e^z)$, which becomes a straight line of
slope 1, and squared error $\tfrac12\sigma(z)^2$, which levels off at 0.5 with its slope tending
to zero. The region $z > 4$ is shaded and labelled "confidently wrong".
:::

### Computing the loss stably

The loss is better written in terms of the logit. Using $\ln\sigma(z) = -\ln(1 + e^{-z})$,
$\ln(1 - \sigma(z)) = \ln\sigma(-z) = -\ln(1 + e^{z})$ and $\ln(1 + e^{-z}) = \ln(1 + e^{z}) - z$,

$$
\ell = y\ln(1 + e^{-z}) + (1 - y)\ln(1 + e^{z})
= \ln(1 + e^{z}) - yz
= \operatorname{softplus}(z) - yz .
$$

Evaluated naively, by computing $\hat p = \sigma(z)$ first and then its logarithms, the loss fails
at large $\lvert z\rvert$. The stable route computes
$\operatorname{softplus}(z) = \max(z, 0) + \ln(1 + e^{-\lvert z\rvert})$, whose exponential never
overflows; NumPy provides it as `np.logaddexp(0, z)`. [Module 02, Section 12](module_02_EN.html#s12) generalises
this to the log-sum-exp of many logits.

::: worked title="The loss at extreme logits"
- $z = 40$, $y = 1$: $\operatorname{softplus}(40) - 40 = 40 + \ln(1 + e^{-40}) - 40 =
  \ln(1 + 4.2\times10^{-18}) \approx 4.2\times10^{-18}$, which is 0.0 to machine precision.
- $z = -40$, $y = 1$: $\operatorname{softplus}(-40) + 40 = 0 + \ln(1 + e^{-40}) + 40 = 40.0$.
- $z = 40$, $y = 0$: $\operatorname{softplus}(40) = 40.0$.

Naively, $\sigma(40) = 1/(1 + 4.2\times10^{-18})$ rounds to exactly 1.0 in double precision.
For $y = 0$ the loss becomes $-\ln(1 - 1) = -\ln 0 = \infty$ instead of 40. For $y = 1$ the
unused term becomes $0 \times \ln 0 = 0 \times (-\infty)$, which floating point defines as
`nan`, so a correct prediction poisons the average loss.
:::

```python
import numpy as np

def sigmoid(z):
    return 1.0 / (1.0 + np.exp(-z))

def bce_naive(z, y):
    p = sigmoid(z)
    return -(y * np.log(p) + (1 - y) * np.log(1 - p))

def bce_stable(z, y):
    # softplus(z) - y*z, with softplus(z) = ln(1 + e^z) computed by logaddexp
    return np.logaddexp(0.0, z) - y * z

with np.errstate(divide="ignore", invalid="ignore"):
    for z, y in [(40.0, 1), (-40.0, 1), (40.0, 0)]:
        print(f"z = {z:5.1f}, y = {y}:  naive {bce_naive(z, y):5.1f}"
              f"  stable {bce_stable(z, y):5.1f}")
```

```output
z =  40.0, y = 1:  naive   nan  stable   0.0
z = -40.0, y = 1:  naive  40.0  stable  40.0
z =  40.0, y = 0:  naive   inf  stable  40.0
```

### The decision boundary

Write the intercept separately again, $z = \mathbf{w}^\top\mathbf{x} + b$. A probability becomes a
decision through a threshold $t$: predict 1 when $\hat p \ge t$. Because $\sigma$ is increasing,
$\hat p \ge t$ is the same as $z \ge \ln\big(t/(1-t)\big)$. At $t = 0.5$ the condition is
$\mathbf{w}^\top\mathbf{x} + b \ge 0$, and the **decision boundary** $\mathbf{w}^\top\mathbf{x} +
b = 0$ is a hyperplane with normal vector $\mathbf{w}$. The signed distance of a point from it is
$(\mathbf{w}^\top\mathbf{x} + b)/\lVert\mathbf{w}\rVert$, so the logit is $\lVert\mathbf{w}\rVert$
times that distance: $\lVert\mathbf{w}\rVert$ sets how fast the probability changes as a point
moves away from the boundary. Another threshold moves the boundary parallel to itself, to
$\mathbf{w}^\top\mathbf{x} + b = \ln\big(t/(1-t)\big)$.

The boundary is flat in whatever features the model is given. A curved boundary needs curved
features: adding $x_1^2$, $x_2^2$ and $x_1x_2$ lets it be any conic, an ellipse among them. The
concentric circles of [Module 02, Section 1](module_02_EN.html#s1) need such features, or a network that
learns them.

::: worked title="One example, one gradient step"
Take $\mathbf{w} = (2, -1)$, $b = 0.5$ and one example $\mathbf{x} = (1, 1)$ with label $y = 0$.

- Logit: $z = 2\times1 + (-1)\times1 + 0.5 = 1.5$.
- Probability: $\hat p = 1/(1 + e^{-1.5}) = 1/1.2231 = 0.8176$.
- Loss: $-\ln(1 - 0.8176) = -\ln 0.1824 = 1.7014$.
- Gradient: $d\ell/dz = \hat p - y = 0.8176$, so $\nabla_{\mathbf{w}} = 0.8176\,\mathbf{x} =
  (0.8176, 0.8176)$ and $\partial\ell/\partial b = 0.8176$.
- Step with $\eta = 0.5$: $\mathbf{w} = (2 - 0.4088, -1 - 0.4088) = (1.5912, -1.4088)$ and
  $b = 0.5 - 0.4088 = 0.0912$.
- New logit $1.5912 - 1.4088 + 0.0912 = 0.2736$, $\hat p = 0.5680$, loss
  $-\ln 0.4320 = 0.8393$.

Before the step the point sat at distance $1.5/\sqrt5 = 0.671$ on the wrong side of the
boundary; after it, at $0.2736/2.1252 = 0.129$. One step halved the loss and moved the boundary
most of the way to the point.
:::

::: worked title="Moving the threshold"
Requiring $\hat p \ge 0.9$ before predicting 1 means $z \ge \ln(0.9/0.1) = \ln 9 = 2.197$. For
the starting model above ($\lVert\mathbf{w}\rVert = \sqrt5 = 2.236$) the boundary moves from
$\mathbf{w}^\top\mathbf{x} + b = 0$ to $\mathbf{w}^\top\mathbf{x} + b = 2.197$: parallel to the
old one and $2.197/2.236 = 0.983$ further into the positive side. Fewer points are flagged, and
those that are are flagged with more confidence.
:::

::: figure id=fig-01-9
Left: logistic regression on two Gaussian blobs in two dimensions, with the decision line
$\mathbf{w}^\top\mathbf{x} + b = 0$, the parallel contours where $\hat p = 0.1$, 0.5 and 0.9,
and the weight vector $\mathbf{w}$ drawn perpendicular to the line. Right: softmax regression on
three blobs: three coloured decision regions whose straight boundaries meet at one point.
:::

### Separable data

Suppose some hyperplane separates the classes perfectly: $z_i > 0$ for every positive example
and $z_i < 0$ for every negative one. Multiply $\mathbf{w}$ and $b$ by any $c > 1$. Every logit
grows in size with its sign unchanged, every $\hat p_i$ moves towards its label, and every
example's loss falls. The loss can always be lowered further, its infimum of 0 is approached
only as $\lVert\mathbf{w}\rVert \to \infty$, and the maximum-likelihood estimate does not exist.
Gradient descent obeys: $\lVert\mathbf{w}\rVert$ grows without limit and the probabilities
saturate at 0 and 1, claiming a certainty the data cannot support. A penalty on
$\lVert\mathbf{w}\rVert$ ([Section 9](#s9)) or early stopping is required. scikit-learn's
`LogisticRegression` includes an L2 penalty by default (`C=1.0`), which is why it never shows
the problem; [Lab 2](#lab2) removes the penalty and watches $\lVert\mathbf{w}\rVert$ climb from
3.2 after 100 steps to 51.2 after 100,000.

### Softmax regression

For $K$ classes the model computes $K$ logits $\mathbf{z} = \mathbf{W}\mathbf{x}$, one row
$\mathbf{w}_k$ of $\mathbf{W}$ per class, and turns them into probabilities with the **softmax**

$$
\hat p_k = \frac{e^{z_k}}{\sum_{j=1}^{K} e^{z_j}},
\qquad
\ell = -\ln\hat p_y = -z_y + \ln\sum_{j=1}^{K} e^{z_j}.
$$

Differentiate the loss with respect to one logit $z_k$. The second term gives
$e^{z_k}/\sum_j e^{z_j} = \hat p_k$. The first gives $-1$ if $k$ is the true class $y$ and 0
otherwise. So

$$
\frac{\partial\ell}{\partial z_k} = \hat p_k - [k = y]
= \begin{cases} \hat p_y - 1 & k = y \text{ (negative: raise the true logit)}, \\
\hat p_k & k \ne y \text{ (positive: lower the others)}. \end{cases}
$$

It is the binary pattern again, predicted minus observed, with the observed label one-hot
encoded. Stacking the predicted probabilities as the rows of $\hat{\mathbf{P}}$ ($N\times K$) and
the one-hot labels as the rows of $\mathbf{Y}$ gives the gradient for the whole weight matrix,

$$
\nabla_{\mathbf{W}}\mathcal{L} = \frac{1}{N}(\hat{\mathbf{P}} - \mathbf{Y})^\top\mathbf{X},
$$

a $K\times(d+1)$ matrix, the shape of $\mathbf{W}$.

Adding the same constant to every logit changes nothing, because
$e^{z_k + c}/\sum_j e^{z_j + c} = e^{z_k}/\sum_j e^{z_j}$. One class's weights can therefore be
fixed at zero without loss. With $K = 2$,

$$
\hat p_1 = \frac{e^{z_1}}{e^{z_0} + e^{z_1}} = \frac{1}{1 + e^{-(z_1 - z_0)}} = \sigma(z_1 - z_0),
$$

which is logistic regression with weights $\mathbf{w}_1 - \mathbf{w}_0$. The predicted class is
the one with the largest logit, and classes $j$ and $k$ tie where
$(\mathbf{w}_j - \mathbf{w}_k)^\top\mathbf{x} + (b_j - b_k) = 0$, a hyperplane. Each decision
region is an intersection of half-spaces, so the boundaries are piecewise linear (Figure 1.9,
right).

::: worked title="Softmax by hand"
Logits $\mathbf{z} = (2.0, 1.0, 0.1)$, true class 0.

- Exponentials: $e^{2.0} = 7.389$, $e^{1.0} = 2.718$, $e^{0.1} = 1.105$; their sum is 11.213.
- Probabilities: $\hat{\mathbf{p}} = (7.389, 2.718, 1.105)/11.213 = (0.6590, 0.2424, 0.0986)$.
- Loss: $-\ln 0.6590 = 0.4170$; equivalently $-2.0 + \ln 11.213 = -2.0 + 2.4170 = 0.4170$.
- Gradient: $\hat{\mathbf{p}} - (1, 0, 0) = (-0.3410, 0.2424, 0.0986)$.

The gradient sums to zero, as shift invariance requires: moving all three logits together
cannot change the loss, so the gradient has no component along $(1, 1, 1)$.
:::

### One output layer for the whole series

Logits, a softmax and a cross-entropy loss form the output layer of every classifier in this
series. A language model is such a classifier, whose classes are the entries of its vocabulary
(tens to hundreds of thousands of them), applied at every position of a text to predict the next
token ([Module 07](module_07_EN.html)). The gradient $\hat p - y$, the overconfidence it
produces on separable data and the need to compute logarithms stably all carry over unchanged.

::: check
Show that softmax with two classes is the sigmoid of $z_1 - z_0$.
:::

::: answer
Divide the numerator and denominator of $\hat p_1 = e^{z_1}/(e^{z_0} + e^{z_1})$ by $e^{z_1}$:
$\hat p_1 = 1/(1 + e^{z_0 - z_1}) = 1/(1 + e^{-(z_1 - z_0)}) = \sigma(z_1 - z_0)$.
:::

::: check
On linearly separable data the weights of unregularised logistic regression keep growing. Why?
:::

::: answer
Every positive scaling of a separating $\mathbf{w}$ (with its intercept) lowers every example's
loss, so the loss is minimised only in the limit $\lVert\mathbf{w}\rVert \to \infty$: the
maximum-likelihood estimate does not exist, and gradient descent keeps following the scaling
direction.
:::

## Measuring a model: metrics, thresholds and calibration {#s7}

The loss is what the optimiser can minimise: smooth, differentiable, averaged over examples. The
**metric** is what the decision depends on: how many defective welds are missed, how many good
ones are scrapped, how far a predicted sag is from the real one in millimetres. They are rarely
the same quantity. A classifier can minimise cross-entropy well and serve its decision badly,
when the decision needs high recall at a fixed false-positive rate. Choose the metric from the
decision first; then choose the threshold, and if necessary the model, to serve it.

**Every reported number carries its baseline.** An RMSE of 0.3 mm on a sag prediction means
nothing until you know that predicting the mean sag gives 1.1 mm and the closed-form solver
gives 0.05 mm: the model is far better than knowing nothing and six times worse than the
physics.

### Regression metrics

For predictions $\hat y_i$ of targets $y_i$ on $n$ held-out cases, with $\bar y$ their mean:

$$
\text{RMSE} = \sqrt{\frac{1}{n}\sum_{i}(y_i - \hat y_i)^2},
\qquad
\text{MAE} = \frac{1}{n}\sum_{i}\lvert y_i - \hat y_i\rvert,
\qquad
R^2 = 1 - \frac{\text{SS}_\text{res}}{\text{SS}_\text{tot}}
= 1 - \frac{\sum_i (y_i - \hat y_i)^2}{\sum_i (y_i - \bar y)^2}.
$$

RMSE is in the units of $y$ and dominated by the largest errors. MAE is in the same units and,
like the median of Section 5, robust to a few outliers. $R^2$ comes from Section 2's Pythagoras:
the fraction of the variance of $y$ that the model explains, measured against the baseline of
predicting the mean. On training data with an intercept it lies between 0 and 1. On held-out
data nothing bounds it below: a model worse than predicting the mean has
$\text{SS}_\text{res} > \text{SS}_\text{tot}$ and a negative $R^2$. The sag model above has
$R^2 = 1 - (0.3/1.1)^2 = 0.93$, which sounds excellent and hides the factor of six. Percentage
errors such as $\lvert y - \hat y\rvert/\lvert y\rvert$ are popular and break when $y$ can be
near zero, where a tiny error becomes an enormous percentage.

### The confusion matrix

A binary classifier with a fixed threshold produces four kinds of outcome: true positives (TP),
false positives (FP), false negatives (FN) and true negatives (TN). Every rate is a ratio of
these counts:

- **accuracy** $= (\text{TP} + \text{TN})/n$;
- **precision** $= \text{TP}/(\text{TP} + \text{FP})$: of the cases flagged, the fraction that
  are positive;
- **recall** $= \text{TP}/(\text{TP} + \text{FN})$, also called sensitivity or the true-positive
  rate (TPR): of the positives, the fraction flagged;
- **specificity** $= \text{TN}/(\text{TN} + \text{FP})$, and the **false-positive rate**
  $\text{FPR} = \text{FP}/(\text{FP} + \text{TN}) = 1 - \text{specificity}$;
- **F1** $= 2\cdot\text{precision}\cdot\text{recall}/(\text{precision} + \text{recall})$, the
  harmonic mean of precision and recall.

A single rate hides which mistakes are being made, so state the confusion matrix whenever you
state a rate. F1 is a harmonic rather than an arithmetic mean because the harmonic mean is
dominated by the smaller value: a classifier cannot score well by buying one of precision or
recall with the other.

Accuracy misleads when the classes are imbalanced. If 1% of cases are positive, the rule "always
negative" scores 99% accuracy and finds nothing.

::: worked title="Weld inspection"
Of 1,000 welds, 50 are defective. The model flags 60, of which 40 are defective. So
$\text{TP} = 40$, $\text{FP} = 60 - 40 = 20$, $\text{FN} = 50 - 40 = 10$ and
$\text{TN} = 950 - 20 = 930$.

- Accuracy $(40 + 930)/1000 = 0.970$; precision $40/60 = 0.667$; recall $40/50 = 0.800$.
- F1 $= 2\times0.667\times0.800/(0.667 + 0.800) = 1.067/1.467 = 0.727$.
- Specificity $930/950 = 0.979$; FPR $20/950 = 0.021$.

The trivial rule "never defective" scores accuracy 0.950 with recall 0. Flagging every weld
gives recall 1 and precision 0.05: their arithmetic mean, 0.525, would reward it, while F1 is
$2\times0.05\times1/1.05 = 0.095$.
:::

### The base rate

Precision depends on how common positives are, and Bayes' rule says exactly how. Let $\pi$ be
the prevalence, the fraction of cases that are positive. Then

$$
\text{precision} = P(\text{positive} \mid \text{flagged})
= \frac{P(\text{flagged} \mid \text{positive})\,P(\text{positive})}{P(\text{flagged})}
= \frac{\text{TPR}\cdot\pi}{\text{TPR}\cdot\pi + \text{FPR}\cdot(1 - \pi)} .
$$

The denominator is the probability of a flag, from a positive case or from a negative one. When
$\pi$ is small, the false flags $\text{FPR}\cdot(1-\pi)$ dominate it even for a small FPR. A good
detector of a rare event floods its users with false alarms.

::: worked title="A good detector on a rare event"
TPR 0.95, FPR 0.05, prevalence 1%. True flags per case: $0.95\times0.01 = 0.0095$. False flags:
$0.05\times0.99 = 0.0495$. Precision $= 0.0095/(0.0095 + 0.0495) = 0.161$: five of every six
alarms are false.

Prevalence 0.1%, TPR 0.90, FPR 0.01: $0.0009/(0.0009 + 0.00999) = 0.083$, and false alarms
outnumber true ones by $0.00999/0.0009 = 11$ to one.
:::

### Ranking: ROC and precision–recall curves

A classifier that outputs a score can be used at any threshold. Sweeping the threshold from high
to low traces the **ROC curve**, TPR against FPR, from $(0, 0)$, where nothing is flagged, to
$(1, 1)$, where everything is. The area under it, the **AUC**, has a direct meaning: it is the
probability that a randomly chosen positive is scored above a randomly chosen negative (the
Mann–Whitney statistic, with ties counted as one half). So it can be computed by counting
pairs. TPR is computed among the positives and FPR among the negatives, so neither changes when
the class proportions change, and neither does the AUC. That makes the AUC a good measure of how
well a model ranks, and a misleading one when positives are rare: a 1% false-positive rate looks
small on an ROC plot and can be most of the alarms.

When positives are rare, look at the **precision–recall curve**, precision against recall as the
threshold sweeps. It shows what the person reading the alarms will experience. Its summary, the
**average precision**, averages the precision over the recall levels at which positives are
found. Its baseline is not one half: a classifier that scores at random has precision equal to
the prevalence at every recall.

::: worked title="AUC by counting pairs"
Two positives scored 0.8 and 0.6; two negatives scored 0.7 and 0.2. The four positive–negative
pairs are (0.8, 0.7), (0.8, 0.2), (0.6, 0.7) and (0.6, 0.2). Three are ordered correctly; the
pair (0.6, 0.7) is the miss. AUC $= 3/4 = 0.75$.
:::

### Choosing the threshold

The threshold is a decision, not a property of the model. Suppose the predicted probabilities
are calibrated (defined below), a false positive costs $C_\text{FP}$ and a false negative
$C_\text{FN}$. For a case with probability $p$ of being positive, flagging it costs
$(1 - p)\,C_\text{FP}$ in expectation, the cost incurred if it is negative, and passing it costs
$p\,C_\text{FN}$. Flag it when $p\,C_\text{FN} > (1 - p)\,C_\text{FP}$, which rearranges to

$$
p > t^\ast = \frac{C_\text{FP}}{C_\text{FP} + C_\text{FN}} .
$$

The default 0.5 is right only when the two errors cost the same. The alternative is a
constraint, such as recall at least 0.99 at the lowest false-positive rate that achieves it,
read off the ROC curve on validation data. A model trained by minimising cross-entropy still
needs one of these steps before it serves a decision that needs recall at a fixed false-positive
rate.

::: worked title="A missed defect costs twenty false alarms"
With $C_\text{FN} = 20\,C_\text{FP}$, $t^\ast = C_\text{FP}/(C_\text{FP} + 20\,C_\text{FP}) =
1/21 = 0.048$. Every weld with a defect probability above 4.8% goes for re-inspection.
:::

::: worked title="Lab 2's classifier on its test set"
[Lab 2](#lab2) fits logistic regression to the breast-cancer data and tests it on 143 cases, 53
of them malignant (the positive class).

- At threshold 0.5: TN 90, FP 0, FN 2, TP 51. Accuracy $141/143 = 0.986$, precision
  $51/51 = 1.000$, recall $51/53 = 0.962$.
- Baseline: always predicting benign scores $90/143 = 0.629$.
- Ranking: AUC 0.996, average precision 0.994.
- Recall 1.0 needs the threshold lowered to 0.116, which flags 11 benign cases as well: precision
  $53/64 = 0.828$.
:::

### Calibration

This section defines calibration for the whole series. A model is **calibrated** when its
probabilities mean what they say: among the cases given $\hat p = 0.8$, 80% are positive.
Formally, $P(y = 1 \mid \hat p = p) = p$ for every $p$. Calibration matters whenever a
probability is used as a probability: in the cost threshold above, in a risk estimate, or to
decide when a model should abstain.

A **reliability diagram** groups the predictions into bins by $\hat p$ and plots, for each bin,
the observed fraction of positives against the mean predicted probability; a calibrated model
lies on the diagonal (Figure 1.12 draws Lab 2's). The **expected calibration error** summarises the diagram. With equal-width
bins, bin $b$ holding $n_b$ of the $N$ predictions, mean predicted probability $\text{conf}_b$
and fraction of positives $\text{freq}_b$,

$$
\text{ECE} = \sum_{b} \frac{n_b}{N}\,\big\lvert \text{freq}_b - \text{conf}_b \big\rvert .
$$

For $K$ classes, or for a model's answers to questions, the usual form bins the confidence of
the predicted class, its largest probability, and compares it with the accuracy in the bin:

$$
\text{ECE} = \sum_{b} \frac{n_b}{N}\,\big\lvert \text{acc}_b - \text{conf}_b \big\rvert .
$$

This is the top-label form of Guo et al. (2017); Modules 02, 07 and 09 use it and refer back
here.

Three cautions. First, state the binning, 10 or 15 equal-width bins as usual or 5 for a test set
of about a hundred, because ECE changes with it: Lab 2's predictions give 0.023 with 5 bins and
0.039 with 10. Second, ECE is biased upward on small samples. Even a perfectly calibrated model's
bin frequencies scatter around their confidences, and the absolute value turns that scatter into
a positive error. Third, ECE measures calibration, not discrimination: a model that predicts the
base rate for every case is calibrated and useless. Report ECE together with the AUC and the
**Brier score** $\frac1N\sum_i(\hat p_i - y_i)^2$, the mean squared error of the probabilities.
The Brier score is a proper scoring rule: its expectation is smallest when the predicted
probabilities are the true ones, so it rewards calibration and discrimination together.

```python
import numpy as np

def ece_binary(p, y, n_bins=10):
    """Binary ECE of probabilities p against labels y in {0, 1}, equal-width bins."""
    edges = np.linspace(0.0, 1.0, n_bins + 1)
    bins = np.clip(np.digitize(p, edges[1:-1]), 0, n_bins - 1)
    ece = 0.0
    for b in range(n_bins):
        in_bin = bins == b
        if in_bin.any():                       # empty bins contribute nothing
            gap = abs(y[in_bin].mean() - p[in_bin].mean())
            ece += in_bin.mean() * gap         # weight n_b / N
    return ece

# the three-bin example below: 50 cases at 0.2 (5 positive), 30 at 0.5 (15), 20 at 0.9 (14)
p = np.repeat([0.2, 0.5, 0.9], [50, 30, 20])
y = np.concatenate([np.r_[np.ones(5), np.zeros(45)],
                    np.r_[np.ones(15), np.zeros(15)],
                    np.r_[np.ones(14), np.zeros(6)]])
print(f"ECE   {ece_binary(p, y):.4f}")
print(f"Brier {np.mean((p - y) ** 2):.4f}")
```

```output
ECE   0.0900
Brier 0.1750
```

::: worked title="ECE with three bins"
A hundred predictions fall into three bins:

| Bin | Predictions | Mean confidence | Observed frequency | Gap |
|---|---|---|---|---|
| low | 50 | 0.20 | 0.10 | 0.10 |
| middle | 30 | 0.50 | 0.50 | 0.00 |
| high | 20 | 0.90 | 0.70 | 0.20 |

$\text{ECE} = (50\times0.10 + 30\times0 + 20\times0.20)/100 = (5 + 0 + 4)/100 = 0.09$. In the
high bin the model said 0.9 and was right 70% of the time: overconfident.
:::

::: worked title="Calibrated and useless"
On Lab 2's test set, predict the training prevalence $159/426 = 0.373$ for every one of the 143
cases. All of them fall in one bin, whose observed frequency is $53/143 = 0.371$, so
ECE $= \lvert 0.371 - 0.373\rvert = 0.003$, lower than the fitted model's 0.023. Yet every score
is tied, so the AUC is 0.500, and the Brier score is
$(53\times0.627^2 + 90\times0.373^2)/143 = 0.233$ against the model's 0.023.
:::

Models trained for long with cross-entropy tend to be overconfident, because the loss keeps
rewarding larger logits on training examples that are already classified correctly. The remedy
is to recalibrate on held-out data. **Platt scaling** fits a one-feature logistic regression from
the model's score to the label; **isotonic regression** fits a non-decreasing step function,
which is more flexible and needs more data. For networks the standard method is temperature
scaling, which divides all logits by one fitted constant ([Module 02, Section 11](module_02_EN.html#s11),
[Module 07, Section 10](module_07_EN.html#s10)). The direction of a miscalibration should be measured, not
assumed: Lab 2's L2-regularised model, with a mean confidence in its predicted class of 0.956
against an accuracy of 0.986, errs slightly the other way.

::: figure id=fig-01-12
Reliability diagram of Lab 2's logistic regression on its 143 test cases, with five equal-width
bins: observed fraction of malignant cases (y) against mean predicted probability (x) in each
bin, and the diagonal of perfect calibration. A bin below the diagonal means the model's
probabilities were too high there, above it too low. An inset histogram shows the bin counts,
82, 7, 4, 3 and 47: the two end bins sit on the diagonal, while the three middle bins, with 14
cases between them, scatter widely, which is what a small test set does. ECE 0.023 in the title.
:::

::: check
A model has AUC 0.95 and positives are 0.1% of the data. Will its precision be high at 90%
recall?
:::

::: answer
Not necessarily. AUC does not depend on prevalence, and at a false-positive rate of even 1% the
false alarms outnumber the true ones about eleven to one. Look at the precision–recall curve at
the real prevalence.
:::

::: check
Why is F1 a harmonic rather than an arithmetic mean?
:::

::: answer
The harmonic mean is dominated by the smaller of the two values, so a classifier cannot score
well by maximising one of precision or recall at the expense of the other; flagging everything
gets an arithmetic mean above one half and an F1 near zero.
:::

## Generalisation: capacity, bias–variance and cross-validation {#s8}

The training loss is biased low ([Section 1](#s1)), so it cannot say how a model will do on new
inputs. This section makes the gap measurable: it sets up the data so that the gap can be seen,
derives where it comes from, and gives the two tools that manage it in practice, validation
curves and cross-validation.

### Three sets

Split the data before doing anything else:

- the **training set** is what the optimiser sees;
- the **validation set** is used to choose between models and settings (a degree, a $\lambda$,
  a $k$);
- the **test set** is touched once, at the end, to report a number.

Every look at the test set that changes something, whether a feature, a setting or the choice of
model, turns it into a validation set, and its number stops meaning what you will claim it
means. [Section 10](#s10) develops this discipline.

### The capacity curve

The experiment of [Lab 3](#lab3): $y = \sin(2\pi x) + \varepsilon$ with
$\varepsilon \sim \mathcal{N}(0, 0.3^2)$, $N = 20$ training points on the evenly spaced grid
$x_i = i/19$, and polynomials of degree 0 to 15 fitted by least squares. The polynomials are
written in the Legendre basis $P_k(2x - 1)$ rather than as powers $x^k$. The fitted functions
are the same, but the Legendre design matrix at degree 15 has condition number 47 against
$6.7\times10^{5}$ for powers of $2x - 1$, so the solve is accurate ([Section 2](#s2)). A
validation set of 1,000 points at random $x$ measures the error on new inputs.

Training RMSE never increases with the degree: each family of polynomials contains the previous
one, so least squares can always do at least as well. Validation RMSE falls, then rises
(Figure 1.13). On the
left the model **underfits**: it cannot represent the signal, and both errors are high. On the
right it **overfits**: it fits noise that the validation set does not share, and the gap between
the two errors widens. The degree is one **capacity** knob. Others are the number of parameters,
the depth of a tree, $1/k$ in $k$-nearest neighbours and $1/\lambda$ in ridge regression.

::: worked title="One training set"
Lab 3's training set (seed 0), RMSE by degree:

| Degree | 0 | 1 | 3 | 4 | 5 | 9 | 12 | 15 |
|---|---|---|---|---|---|---|---|---|
| Training | 0.850 | 0.655 | 0.217 | 0.217 | 0.183 | 0.173 | 0.141 | 0.112 |
| Validation | 0.769 | 0.536 | 0.354 | 0.354 | 0.360 | 0.365 | 0.393 | 0.720 |

The best validation degree is 3 or 4; they tie. The tie has a reason. With $t = 2x - 1$,
$\sin(2\pi x) = -\sin(\pi t)$ is an odd function of $t$, and the design points are symmetric about
$t = 0$. The even Legendre polynomials are even functions, so on this design they are orthogonal
to the odd target and to the odd polynomials: adding an even-degree term can only fit noise.
Bias falls only when an odd degree is added, so it falls in pairs, degrees 1 and 2 together,
then 3 and 4. At degree 15 the training error, 0.112, is far below the noise level 0.3: the fit
has absorbed noise, and the validation error, 0.720, shows the price.
:::

::: figure id=fig-01-13
Left: polynomial fits of degree 1, 3 and 15 to the same 20 noisy samples of $\sin(2\pi x)$, one
panel each, with the true function dashed: the line underfits, the cubic follows the sine, and
the degree-15 curve passes near every point and swings at the ends. Right: training and
validation RMSE against degree 0 to 15 on a logarithmic axis; training falls monotonically,
validation is U-shaped with its minimum at degree 3–4; a dashed horizontal line marks
$\sigma = 0.3$, and the underfitting and overfitting regions are shaded.
:::

### The bias–variance decomposition

Why validation error is U-shaped follows from an identity. Fix an input $\mathbf{x}$. A new
observation there is $y = f^\ast(\mathbf{x}) + \varepsilon$, with $\E[\varepsilon] = 0$,
$\operatorname{Var}(\varepsilon) = \sigma^2$, and $\varepsilon$ independent of the training set
$\mathcal{D}$. The fitted model depends on $\mathcal{D}$, which is random. Write
$\hat f = \hat f_{\mathcal{D}}(\mathbf{x})$ for its prediction at $\mathbf{x}$ and
$\bar f = \E_{\mathcal{D}}[\hat f]$ for the average prediction over training sets. Add and
subtract $\bar f$ and $f^\ast$:

$$
\hat f - y = (\hat f - \bar f) + (\bar f - f^\ast) - \varepsilon .
$$

Square it:

$$
(\hat f - y)^2 = (\hat f - \bar f)^2 + (\bar f - f^\ast)^2 + \varepsilon^2
+ 2(\hat f - \bar f)(\bar f - f^\ast) - 2(\hat f - \bar f)\varepsilon - 2(\bar f - f^\ast)\varepsilon .
$$

Take the expectation over $\mathcal{D}$ and $\varepsilon$, term by term. $\bar f - f^\ast$ is a
constant, so
$\E[(\hat f - \bar f)(\bar f - f^\ast)] = (\bar f - f^\ast)\,\E_{\mathcal{D}}[\hat f - \bar f] = 0$,
because $\E_{\mathcal{D}}[\hat f] = \bar f$. Since $\varepsilon$ is independent of
$\mathcal{D}$, $\E[(\hat f - \bar f)\varepsilon] = \E_{\mathcal{D}}[\hat f - \bar f]\,\E[\varepsilon]
= 0$. And $\E[(\bar f - f^\ast)\varepsilon] = (\bar f - f^\ast)\E[\varepsilon] = 0$. What remains is

$$
\E\big[(\hat f - y)^2\big]
= \underbrace{(\bar f - f^\ast)^2}_{\text{bias}^2}
+ \underbrace{\E_{\mathcal{D}}\big[(\hat f - \bar f)^2\big]}_{\text{variance}}
+ \underbrace{\sigma^2}_{\text{noise}} .
$$

Averaging over $\mathbf{x}$ drawn from $P$ gives the expected test error.

**Bias** is what the model family cannot represent, even on average over training sets.
**Variance** is how much the fit changes from one training sample to another. **Noise** is
irreducible: no model predicts $\varepsilon$. Simple models have high bias and low variance;
flexible ones the reverse, and the validation curve is their sum. The decomposition is an exact
identity for squared error. For the 0–1 loss of classification there is no clean additive
version, only the same picture used loosely.

::: worked title="The decomposition for Lab 3's design"
For least squares on a fixed design, each fitted value is a linear combination of the training
targets: $\hat f(x_g) = \sum_j S_{gj}\,y_j$, where row $g$ of the smoother matrix
$\mathbf{S} = \boldsymbol{\Phi}_g(\boldsymbol{\Phi}^\top\boldsymbol{\Phi})^{-1}\boldsymbol{\Phi}^\top$
maps the 20 targets to the prediction at the point $x_g$ ($\boldsymbol{\Phi}$ is the training
design matrix, $\boldsymbol{\Phi}_g$ the same features at the points $x_g$). With
$y_j = f^\ast(x_j) + \varepsilon_j$, Section 5's rules give $\bar f(x_g) = \sum_j S_{gj}f^\ast(x_j)$
and $\operatorname{Var}\hat f(x_g) = \sigma^2\sum_j S_{gj}^2$, with no simulation. Averaged over
201 evenly spaced points $x_g$, with $\sigma^2 = 0.09$:

| Degree | 0 | 1 | 3 | 5 | 9 | 12 | 15 |
|---|---|---|---|---|---|---|---|
| bias² | 0.4975 | 0.2051 | 0.0052 | 0.0000 | 0.0000 | 0.0000 | 0.0000 |
| variance | 0.0045 | 0.0086 | 0.0161 | 0.0236 | 0.0422 | 0.0754 | 0.8737 |
| total | 0.5920 | 0.3037 | 0.1113 | 0.1136 | 0.1322 | 0.1654 | 0.9637 |

At degree 3, $0.0052 + 0.0161 + 0.09 = 0.1113$, the minimum. Lab 3 checks these values with 200
simulated training sets. The square root of the total, 0.334 at degree 3 and 0.982 at degree 15,
is the RMSE that the single training set above scattered around (0.354 and 0.720).

Degree 15's variance deserves a second look. Averaged over the 20 training inputs, the variance
of a least-squares fit is exactly $\sigma^2\operatorname{tr}(\mathbf{P})/N = \sigma^2(d+1)/N =
0.09\times16/20 = 0.072$, because the hat matrix of Section 2 has trace $d + 1$. Averaged over
the whole interval it is 0.874, twelve times more: between the points near the ends, the
degree-15 polynomial swings far from the data.
:::

::: worked title="A biased estimator can win"
Estimate a mean $\mu = 1$ from $n = 4$ readings with noise $\sigma = 2$. The sample mean
$\bar y$ is unbiased with variance $\sigma^2/n = 4/4 = 1$, so its mean squared error is 1.0.
Half the sample mean, $\bar y/2$, has expectation 0.5 and bias $-0.5$, so bias² 0.25, and
variance $\tfrac14\times1 = 0.25$ (Section 5's $\operatorname{Var}(aX) = a^2\operatorname{Var}(X)$).
Its mean squared error is 0.5, half that of the unbiased estimator. Accepting some bias for less
variance is the trade that regularisation makes on purpose ([Section 9](#s9));
[Exercise 7](#e7) finds the best amount of shrinkage.
:::

### Learning curves

A **learning curve** plots training and validation error against the number of training points
$N$ for a fixed model. For least squares with $p$ parameters, Section 5's
$\E[\text{RSS}] = (N - p)\sigma^2$ says the expected training MSE is bias² on the training points
plus $\sigma^2(1 - p/N)$, below the noise level, while the expected validation MSE is bias² +
variance + $\sigma^2$, above it. As $N$ grows the variance shrinks, roughly as $\sigma^2 p/N$, and
both curves approach bias² + $\sigma^2$ from opposite sides.

The shape is a diagnosis. A large gap that persists means variance: more data will help. Both
curves high and close together means bias: more data will not help, and more capacity or better
features will. In Lab 3's setting (Figure 1.15), at $N = 20$ degree 9 has expected training and
validation MSE 0.045 and 0.132, a gap of 0.087, against 0.078 and 0.111 for degree 3. By
$N = 1{,}000$ both pairs are within 0.001 of their limits, $\sigma^2$ + bias² $= 0.0946$ for
degree 3 and 0.0900 for degree 9, and from about $N = 115$ on degree 9 is the better model. The
best degree moves to the right as data accumulate.

::: worked title="Ten times more data"
Repeat the decomposition with $N = 200$ points on the same interval. Degree 3: bias² 0.0046,
variance 0.0018, total $0.0046 + 0.0018 + 0.09 = 0.0964$. Degree 5: total 0.0927, the new
minimum. Degree 15: total 0.0972. At degree 3 the variance fell from 0.0161 to 0.0018, close to
the tenfold drop that $\sigma^2(d+1)/N$ predicts. At degree 15 it fell from 0.874 to 0.0072,
more than a hundredfold, because with 20 points degree 15 was close to interpolating. Flexible
models stop being punished, and the right-hand side of the curve flattens.
:::

::: figure id=fig-01-15
Learning curves for Lab 3's problem: expected training and validation MSE against the number of
training points $N$ from 10 to 1,000 (logarithmic axis), for degree 3 and degree 9. Each pair
converges towards its limit $\sigma^2$ + bias², training from below and validation from above;
degree 9 has the larger gap at small $N$ and the lower limit (0.0900 against 0.0946), and its
validation curve crosses below degree 3's near $N = 115$.
:::

::: widget name=polynomial-capacity
Start at degree 3 with $N = 20$, then drag the degree to 15: the training RMSE falls to about
0.17 while the validation RMSE climbs to about 0.57 (the exact figures depend on the noise draw), and
the variance curve shoots up. Press "new noise draw" a few times at degree 15 and watch the fit
change completely. On a single draw the best degree on validation data can differ from the best
degree by expected error (degree 3): a noise-draw effect. Then switch to
$N = 200$: the right-hand side of the curves flattens and the best degree moves to about 5.
:::

### k-fold cross-validation

A single validation set wastes data when data are scarce, and its verdict depends on which
points it happened to get. **$k$-fold cross-validation** splits the data into $k$ folds of
nearly equal size, trains on $k - 1$ of them, validates on the remaining one, rotates through all
$k$ choices and averages the $k$ validation errors. Every point is used for
validation once and for training $k - 1$ times. The usual choices: $k = 5$ or 10, so each fit
sees 80–90% of the data at the cost of $k$ fits; stratified folds for classification, so each
fold keeps the class proportions; and leave-one-out ($k = N$) for very small datasets.

The $k$ fold errors also give a spread. Their mean comes with a standard error
$\text{sd}/\sqrt{k}$, where sd is the standard deviation of the fold errors. It is approximate
and optimistic: the training sets of any two folds overlap (with $k = 5$ they share three
quarters of their points), so the fold errors are positively correlated and their mean varies
more than $\text{sd}/\sqrt{k}$ suggests. It is still the only honest way to say that one setting
beats another by less than the noise.

::: worked title="Five folds on twenty points"
Lab 3's 20 training points, split into Lab 3's five folds of four points, fitted at degrees 3
and 5. Fold mean squared errors:

- degree 3: 0.094, 0.057, 0.173, 0.066, 0.032; mean 0.084, sd 0.054, standard error
  $0.054/\sqrt5 = 0.024$;
- degree 5: 0.060, 0.102, 0.094, 0.028, 0.030; mean 0.063, sd 0.035, standard error 0.016.

Cross-validation prefers degree 5 by 0.021, which is about one standard error of the fold-wise
difference (the five differences have a standard error of 0.021), while the 1,000-point
validation set prefers degree 3. Twenty points cannot separate the two, and the standard error
says so. The exact expected errors, 0.1113 and 0.1136, confirm that the choice hardly matters.
:::

### Double descent

The U-shaped curve is the classical expectation, and for the models of this module it is the
right one. It is not a law. When models are fitted all the way to interpolation, and the fitting
rule picks the minimum-norm solution among the many that fit, test error can peak where the
number of parameters $p$ reaches the number of training points $N$, the **interpolation
threshold**, and fall again beyond it (Figure 1.16). Belkin et al. (2019) named this **double descent**;
Nakkiran et al. (2020) found it in deep networks, along the axes of model size and training time.

It does not contradict the decomposition, which is an identity. It changes how the variance
behaves with size. At $p = N$ exactly one function fits the data, and it must chase every noise
value. Past the threshold infinitely many functions fit, and a rule that prefers small norms
picks a smooth one, whose variance falls as $p$ grows. Lab 3's design shows it. The exact
formulas, with `np.linalg.lstsq` supplying the minimum-norm fit beyond degree 19, give an
expected test MSE of 0.96 at degree 15, about 16,000 at degree 19 ($p = N = 20$), 0.19 at degree
25 and 0.14 at degree 100: a second descent, but not below the classical minimum of 0.111 at
degree 3. The practical lesson is to measure: do not assume a single U, and do not assume the
second descent beats it. The [guided reading](#reading) for this session is the Belkin paper.

::: figure id=fig-01-16
Schematic double-descent curve: test error against the number of parameters $p$. On the left,
the classical U; a peak at the interpolation threshold $p = N$; to the right, a second descent.
The regions are labelled "classical regime" and "interpolating regime", with a note that the
right-hand side assumes a minimum-norm fit.
:::

::: check
A degree-15 polynomial fitted to 16 points has zero training error. What will its validation
error be like, and why?
:::

::: answer
Large. With 16 parameters and 16 points the polynomial interpolates, noise included, so the fit
changes completely from one sample to the next: variance dominates.
:::

::: check
Your learning curves sit together at a validation MSE of 0.20 with $\sigma^2 = 0.05$, and stay
flat as $N$ grows. What do you do?
:::

::: answer
The curves have converged to bias² + $\sigma^2$ with bias² about 0.15: high bias. More data will
not help; add capacity or better features.
:::

::: check
Why is the cross-validation standard error $\text{sd}/\sqrt{k}$ optimistic?
:::

::: answer
The $k$ fold estimates are positively correlated because their training sets overlap, so their
mean varies more than $\text{sd}/\sqrt{k}$, which assumes independent estimates, suggests.
:::
