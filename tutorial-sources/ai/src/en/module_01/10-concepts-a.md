## The learning problem {#s1}

An engineer has a function in mind and cannot write it down. The sag of a scaffold as a function
of its material and geometry can be computed by a solver, but the solver took a person-year to
build. The probability that a hazard is controllable, as a function of the situation, cannot be
computed at all; it is estimated by people. **Machine learning** is the practice of obtaining
such a function from examples of its inputs and outputs, when the examples are cheaper than the
theory.

Formally, there is an unknown function $f^\ast$ and a data distribution $P$ over pairs
$(\mathbf{x}, y)$ of inputs $\mathbf{x} \in \R^d$ and outputs $y$. The function $f^\ast$ is the
best possible prediction of $y$ from $\mathbf{x}$; the outputs scatter around it because the
inputs do not determine them completely. We see a sample
$\mathcal{D} = \{(\mathbf{x}_i, y_i)\}_{i=1}^{N}$ drawn from $P$, and we want a function $f$ that
predicts $y$ from $\mathbf{x}$ well **on inputs we have not seen**. The last clause is the whole
subject. Predicting the examples we already have is a lookup table.

### Expected risk and empirical risk

A **loss** $\ell(f(\mathbf{x}), y) \ge 0$ says how wrong one prediction is, for example the
squared error $(f(\mathbf{x}) - y)^2$. What we want small is the **expected risk**, the average
loss over the distribution the inputs will come from:

$$
R(f) = \E_{(\mathbf{x},y)\sim P}\big[\ell(f(\mathbf{x}), y)\big].
$$

It cannot be computed, because $P$ is unknown. What can be computed, for a model $f_\theta$ with
parameters $\theta$, is the **empirical risk**, the average loss over the sample:

$$
\mathcal{L}(\theta) = \frac{1}{N}\sum_{i=1}^{N} \ell\big(f_\theta(\mathbf{x}_i), y_i\big).
$$

For parameters fixed before the sample is drawn, $\mathcal{L}(\theta)$ is an unbiased estimate of
$R(f_\theta)$: each term has expectation $R(f_\theta)$. Fitting destroys that property. The
optimiser chooses $\hat\theta$ to make $\mathcal{L}$ small on these $N$ examples, noise included,
so the training loss at $\hat\theta$ is **biased low**. For an optimiser that finds the minimum
the argument takes three steps. Write $R(\theta)$ for $R(f_\theta)$ and let $\theta^\circ$
minimise it over the model family. Then $\mathcal{L}(\hat\theta) \le \mathcal{L}(\theta^\circ)$
for every sample, because $\hat\theta$ minimises $\mathcal{L}$;
$\E[\mathcal{L}(\theta^\circ)] = R(\theta^\circ)$, because $\theta^\circ$ does not depend on the
sample; and $R(\theta^\circ) \le R(\hat\theta)$, because $\theta^\circ$ is the best. Chained:

$$
\E\big[\mathcal{L}(\hat\theta)\big] \;\le\; R(\theta^\circ) \;\le\; \E\big[R(\hat\theta)\big].
$$

The gap between the training loss and the expected risk is the subject of [Section 8](#s8),
which measures how it grows with the flexibility of the model, and of [Section 10](#s10), which
estimates the expected risk without fooling yourself.

### Three settings

- **Supervised learning.** $y$ is given for every example: **regression** when $y$ is
  continuous, **classification** when it is one of $K$ labels. Most of this series.
- **Unsupervised learning.** No $y$. The task is to find structure: clusters, low-dimensional
  coordinates, densities. k-means and principal component analysis appear in
  [Section 11](#s11); the neural forms are in [Module 05](module_05_EN.html).
- **Reinforcement learning.** No $y$ either, but a reward that arrives after actions.
  [Module 09](module_09_EN.html) uses it to train language models.

### The five ingredients

Every learning method, from a straight line to a language model, is specified by five choices.
Write them down for any method you meet; a method you cannot state this way is one you do not
understand yet.

1. **Data.** $\mathcal{D}$, and the distribution $P$ it came from. The second is the one people
   forget. Everything learned is learned about $P$, so a model is only as good as the match
   between $P$ and the inputs it will meet in service.
2. **Model.** A family of functions $f_\theta$ indexed by parameters $\theta$, also called the
   **hypothesis class**. It fixes what can be learned at all: a line has two parameters and can
   only ever be a line; a language model has billions.
3. **Loss.** $\ell \ge 0$ and its average over the data, the empirical risk $\mathcal{L}(\theta)$.
   It decides which mistakes count and how much; [Section 5](#s5) shows that it also states an
   assumption about the noise.
4. **Optimiser.** A procedure that finds $\theta$ making $\mathcal{L}$ small, almost always a
   variant of gradient descent ([Sections 3](#s3) and [4](#s4)). It decides whether the $\theta$
   the loss asks for is actually found, and at what cost.
5. **Evaluation.** A measurement of how well $f_\theta$ does on data it was not fitted to: an
   estimate of $R$, not the loss on $\mathcal{D}$, which the optimiser has already minimised.

::: worked title="Five ingredients at both ends of the range"
| Ingredient | This module's linear regression | The language model of Modules 07–10 |
|---|---|---|
| Data | 200 rows, 3 features; Gaussian noise of standard deviation 0.1 | trillions of tokens of text |
| Model | $\mathbf{w}^\top\mathbf{x} + b$: 4 parameters | a transformer: about 9.5 billion parameters |
| Loss | squared error | cross-entropy over the vocabulary at every position |
| Optimiser | the normal equations, or gradient descent | AdamW |
| Evaluation | RMSE on held-out rows | held-out perplexity and task benchmarks |

The five slots are the same. The parameter counts differ by a factor of
$9.5\times10^{9}/4 \approx 2.4\times10^{9}$, more than nine orders of magnitude. The language model
is the hypothetical case study that Modules 07–10 follow; nothing about it is needed before then.
:::

::: worked title="The hydrogel fit of Section 12 in the same table"
| Ingredient | Neo-Hookean fit to one compression test |
|---|---|
| Data | 16 triples (stretch, stress, recorded uncertainty) from one test; the distribution is specimens of this gel tested this way |
| Model | nominal stress $P = 2c_1(\lambda - \lambda^{-2})$ at stretch $\lambda$: one parameter, $c_1$ |
| Loss | squared error weighted by $1/\sigma_i^2$, the inverse square of each point's uncertainty |
| Optimiser | a closed form |
| Evaluation | residuals on strain ranges held out of the fit |

The symbols $P$ and $\lambda$ carry these meanings only in this example and in Section 12. The
evaluation slot is where Section 12's main question lives: residuals inside the fitted strain
range can be checked, while a prediction outside it is an extrapolation that no residual inside
the range can vouch for.
:::

### Inputs are numbers

A model sees a **feature vector** $\mathbf{x} \in \R^d$. A measured quantity is already a number;
a category, such as a material grade, a supplier or a defect type, is not. Encode a $K$-way
category as **one-hot**: $K$ binary columns, with a 1 in the column of the observed category and
0 in the others. Never code it as the integers $1, \dots, K$: a linear model then treats the
category as a quantity, which imposes an order and equal spacing between consecutive codes. The
exception is a genuinely ordinal scale, such as a severity from minor to critical, whose order is
real; even then, integer codes assume equal steps between the levels, a modelling choice to check
rather than a fact.

One-hot codes also explain learned representations. A one-hot row vector $\mathbf{e}_k^\top$ times
a trainable $K \times m$ table picks out row $k$ of the table, so an **embedding** is such a table
learned with the rest of the model, and it works the same way for any categorical feature (a part
number, a supplier, a sensor ID) as for the tokens of a language model.
[Module 06, Section 4](module_06_EN.html#s4) shows the token embedding entering the transformer's
residual stream, and [Module 06, Section 11](module_06_EN.html#s11) counts its $V \times d$ table.

### The running examples

Four examples recur in this module, so that each new idea lands on something already familiar:

- a synthetic linear regression with $N = 200$ rows and $d = 3$ features ([Sections 2–4](#s2),
  [Lab 1](#lab1));
- noisy samples of $\sin(2\pi x)$ fitted by polynomials ([Sections 8–9](#s8), [Lab 3](#lab3));
- a classifier of breast tumours as malignant or benign, on the dataset that ships with
  scikit-learn ([Sections 6–7](#s6), [Labs 2](#lab2) and [4](#lab4));
- a hyperelastic material model fitted to a compression test of a soft hydrogel
  ([Sections 5](#s5) and [12](#s12), [Lab 5](#lab5)).

::: check
Why is the training loss not a measure of how good the model is?
:::

::: answer
The optimiser chose $\theta$ to make it small on those very examples, noise included, so it is
biased low. Only data that played no part in the fitting estimate the expected risk without that
bias.
:::

::: check
A defect severity {minor, major, critical} is coded 1, 2, 3 in a linear model. What does that
assume, and when is it acceptable?
:::

::: answer
It assumes an order, which is real here, and equal steps: the effect of "major" lies exactly
halfway between those of "minor" and "critical". Keep the integer code only if equal steps are
plausible or validation data support them; otherwise one-hot encode, which keeps no order and
assumes no spacing. ([Exercise 2](#e2) takes the unordered case.)
:::

## Least squares and its geometry {#s2}

Linear regression is the simplest model that exercises every ingredient, and the only one in this
module whose every property can be computed exactly. This section fits it in closed form, reads
the answer as a projection, and says when the problem is ill-posed and how to compute the answer
stably.

### Set-up

Let $f(\mathbf{x}) = \mathbf{w}^\top\mathbf{x} + b$. Absorb the intercept $b$ by appending a
constant 1 to every input, so that $f(\mathbf{x}) = \mathbf{w}^\top\mathbf{x}$ with
$\mathbf{w} \in \R^{d+1}$ and $b$ its last entry. Stack the inputs as the rows of
$\mathbf{X} \in \R^{N\times(d+1)}$, whose last column is all ones, and the outputs as
$\mathbf{y} \in \R^N$. The loss is the mean squared error:

$$
\mathcal{L}(\mathbf{w}) = \frac{1}{N}\sum_{i=1}^{N}\big(\mathbf{w}^\top\mathbf{x}_i - y_i\big)^2
= \frac{1}{N}\|\mathbf{X}\mathbf{w} - \mathbf{y}\|^2.
$$

[Section 5](#s5) shows why squared error is the right loss when the noise is Gaussian; here take
it as given.

### The gradient, derived

Expand the squared norm as an inner product:

$$
\|\mathbf{X}\mathbf{w} - \mathbf{y}\|^2 = (\mathbf{X}\mathbf{w} - \mathbf{y})^\top(\mathbf{X}\mathbf{w} - \mathbf{y})
= \mathbf{w}^\top\mathbf{X}^\top\mathbf{X}\mathbf{w} - 2\,\mathbf{y}^\top\mathbf{X}\mathbf{w} + \mathbf{y}^\top\mathbf{y}.
$$

The two cross terms $\mathbf{w}^\top\mathbf{X}^\top\mathbf{y}$ and $\mathbf{y}^\top\mathbf{X}\mathbf{w}$
are the same scalar, one the transpose of the other, which is where the 2 comes from. Two
identities differentiate the pieces. For a symmetric matrix $\mathbf{A}$,
$\nabla_{\mathbf{w}}(\mathbf{w}^\top\mathbf{A}\mathbf{w}) = 2\mathbf{A}\mathbf{w}$: writing the
sum out, $\partial_{w_k}\sum_{j,l}w_jA_{jl}w_l = \sum_l A_{kl}w_l + \sum_j w_jA_{jk} = 2(\mathbf{A}\mathbf{w})_k$,
the last step by symmetry. For a constant vector $\mathbf{c}$,
$\nabla_{\mathbf{w}}(\mathbf{c}^\top\mathbf{w}) = \mathbf{c}$. With
$\mathbf{A} = \mathbf{X}^\top\mathbf{X}$ and $\mathbf{c} = \mathbf{X}^\top\mathbf{y}$,

$$
\nabla_{\mathbf{w}}\mathcal{L} = \frac{1}{N}\big(2\mathbf{X}^\top\mathbf{X}\mathbf{w} - 2\mathbf{X}^\top\mathbf{y}\big)
= \frac{2}{N}\mathbf{X}^\top(\mathbf{X}\mathbf{w} - \mathbf{y}).
$$

The gradient is the residual vector $\mathbf{X}\mathbf{w} - \mathbf{y}$ mapped back to parameter
space by $\mathbf{X}^\top$. Differentiating once more gives the Hessian
$\frac{2}{N}\mathbf{X}^\top\mathbf{X}$, the same at every $\mathbf{w}$. It is positive
semidefinite, because $\mathbf{v}^\top\mathbf{X}^\top\mathbf{X}\mathbf{v} = \|\mathbf{X}\mathbf{v}\|^2 \ge 0$
for every $\mathbf{v}$. So $\mathcal{L}$ is a convex quadratic, and every point where its gradient
vanishes is a global minimum.

### The normal equations

Setting the gradient to zero gives the **normal equations**

$$
\mathbf{X}^\top\mathbf{X}\,\mathbf{w} = \mathbf{X}^\top\mathbf{y}.
$$

If $\mathbf{X}$ has full column rank, its $d + 1$ columns linearly independent, then
$\|\mathbf{X}\mathbf{v}\|^2 > 0$ for every $\mathbf{v} \ne \mathbf{0}$, so
$\mathbf{X}^\top\mathbf{X}$ is positive definite and invertible, and the minimiser is unique:

$$
\mathbf{w}^\ast = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}.
$$

Full column rank needs at least $d + 1$ linearly independent rows: no fewer examples than
parameters. The formula is for reading; how to compute $\mathbf{w}^\ast$ comes below.

### The geometry: an orthogonal projection

As $\mathbf{w}$ varies, $\mathbf{X}\mathbf{w}$, a linear combination of the columns of
$\mathbf{X}$, sweeps out the **column space** of $\mathbf{X}$, a subspace of dimension $d + 1$
inside $\R^N$. Least squares picks the point of that subspace closest to $\mathbf{y}$. With the
residual $\mathbf{r} = \mathbf{y} - \mathbf{X}\mathbf{w}^\ast$, the normal equations read

$$
\mathbf{X}^\top\mathbf{r} = \mathbf{0}:
$$

each column of $\mathbf{X}$ has zero inner product with the residual. The residual is
perpendicular, or *normal*, to the column space, which is where the equations get their name, and
$\hat{\mathbf{y}} = \mathbf{X}\mathbf{w}^\ast$ is the **orthogonal projection** of $\mathbf{y}$
onto it: the foot of the perpendicular from $\mathbf{y}$, which is the closest point
(Figure 1.2).

::: figure id=fig-01-2
Least squares as a projection, drawn in three dimensions. A plane through the origin, spanned by
two column vectors $\mathbf{x}_{(1)}$ and $\mathbf{x}_{(2)}$, is the column space of $\mathbf{X}$.
The data vector $\mathbf{y}$ rises above the plane; its foot in the plane is
$\hat{\mathbf{y}} = \mathbf{X}\mathbf{w}^\ast$; the residual $\mathbf{r} = \mathbf{y} - \hat{\mathbf{y}}$
is a dashed segment that meets the plane at a right angle. $\mathbf{X}^\top\mathbf{r} = \mathbf{0}$
are the normal equations.
:::

The projection is linear: $\hat{\mathbf{y}} = \mathbf{P}\mathbf{y}$ with

$$
\mathbf{P} = \mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top,
$$

the **hat matrix**, so called because it puts the hat on $\mathbf{y}$. (Statistics texts write it
$\mathbf{H}$; this module keeps $\mathbf{H}$ for the Hessian.) It is symmetric and
**idempotent**,
$\mathbf{P}^2 = \mathbf{X}(\mathbf{X}^\top\mathbf{X})^{-1}(\mathbf{X}^\top\mathbf{X})(\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top = \mathbf{P}$:
projecting twice changes nothing. Its trace counts the dimensions it projects onto. Using
$\operatorname{tr}(\mathbf{A}\mathbf{B}) = \operatorname{tr}(\mathbf{B}\mathbf{A})$,
$\operatorname{tr}\mathbf{P} = \operatorname{tr}\big((\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{X}\big) = \operatorname{tr}\mathbf{I}_{d+1} = d + 1$,
the number of fitted parameters. [Section 9](#s9) turns this count into the effective degrees of
freedom of ridge regression.

Two consequences follow when $\mathbf{X}$ contains the column of ones. That column's row of
$\mathbf{X}^\top\mathbf{r} = \mathbf{0}$ reads $\sum_i r_i = 0$: the residuals sum to zero, and
$\hat{\mathbf{y}}$ has the same mean $\bar y$ as $\mathbf{y}$. And because $\bar y\mathbf{1}$ also
lies in the column space, $\mathbf{y} - \bar y\mathbf{1} = (\hat{\mathbf{y}} - \bar y\mathbf{1}) + \mathbf{r}$
splits the centred data into a part inside the column space and a part perpendicular to it.
Pythagoras gives

$$
\underbrace{\|\mathbf{y} - \bar y\mathbf{1}\|^2}_{\text{TSS}}
= \underbrace{\|\hat{\mathbf{y}} - \bar y\mathbf{1}\|^2}_{\text{ESS}}
+ \underbrace{\|\mathbf{r}\|^2}_{\text{RSS}}:
$$

the total sum of squares is the explained plus the residual sum of squares. It defines the
**coefficient of determination**

$$
R^2 = 1 - \frac{\text{RSS}}{\text{TSS}} = \frac{\text{ESS}}{\text{TSS}},
$$

the fraction of the variance of $\mathbf{y}$ about its mean that the fit explains; on the training
data it lies between 0 and 1. Predicting the mean everywhere is the model with only an intercept,
so $R^2$ compares the fit with that baseline. [Section 7](#s7) uses $R^2$ on held-out data, where
the identity no longer holds and $R^2$ can be negative.

::: worked title="Four points by hand"
Fit $y = b + wx$ to $x = (0, 1, 2, 3)$ and $y = (1, 3, 2, 5)$. The rows of $\mathbf{X}$ are
$(1, x_i)$, so

$$
\mathbf{X}^\top\mathbf{X} = \begin{bmatrix} N & \sum x_i \\ \sum x_i & \sum x_i^2 \end{bmatrix}
= \begin{bmatrix} 4 & 6 \\ 6 & 14 \end{bmatrix}, \qquad
\mathbf{X}^\top\mathbf{y} = \begin{bmatrix} \sum y_i \\ \sum x_iy_i \end{bmatrix}
= \begin{bmatrix} 11 \\ 22 \end{bmatrix},
$$

with $\sum x_iy_i = 0 + 3 + 4 + 15 = 22$. The determinant is $4\cdot14 - 6\cdot6 = 20$, and
Cramer's rule gives

$$
b = \frac{14\cdot11 - 6\cdot22}{20} = \frac{22}{20} = 1.1, \qquad
w = \frac{4\cdot22 - 6\cdot11}{20} = \frac{22}{20} = 1.1.
$$

The fitted values are $\hat{\mathbf{y}} = (1.1, 2.2, 3.3, 4.4)$ and the residuals
$\mathbf{r} = (-0.1, 0.8, -1.3, 0.6)$. Check the normal equations:
$\sum r_i = -0.1 + 0.8 - 1.3 + 0.6 = 0$ and $\sum x_ir_i = 0 + 0.8 - 2.6 + 1.8 = 0$, both exactly.
The sums of squares are RSS $= 0.01 + 0.64 + 1.69 + 0.36 = 2.70$; with $\bar y = 2.75$,
TSS $= 1.75^2 + 0.25^2 + 0.75^2 + 2.25^2 = 8.75$; and ESS $= 1.65^2 + 0.55^2 + 0.55^2 + 1.65^2 = 6.05$,
so $6.05 + 2.70 = 8.75$ as Pythagoras requires. Hence $R^2 = 1 - 2.70/8.75 = 0.691$. The hat
matrix has diagonal $(0.7, 0.3, 0.3, 0.7)$ and trace 2, the number of parameters.
:::

### When the columns are dependent

If one column of $\mathbf{X}$ is a linear combination of the others, there is a
$\mathbf{v} \ne \mathbf{0}$ with $\mathbf{X}\mathbf{v} = \mathbf{0}$; then
$\mathbf{X}^\top\mathbf{X}\mathbf{v} = \mathbf{0}$, and $\mathbf{X}^\top\mathbf{X}$ is singular.
Two ways it happens in practice: a temperature in °C next to the same temperature in °F, with an
intercept, since $T_{\text{F}} = 1.8\,T_{\text{C}} + 32$ makes the °F column a combination of the
°C column and the column of ones; and all $K$ one-hot columns of a category next to an intercept,
since the $K$ columns sum to the column of ones. Every $\mathbf{w}^\ast + t\mathbf{v}$ then fits
equally well. The projection $\hat{\mathbf{y}}$ is still unique, and so are the predictions at
the training inputs and at any new input that obeys the same dependency; the weights are not.
The **pseudo-inverse** solution $\mathbf{X}^{+}\mathbf{y}$ picks, among all the minimisers, the
one of smallest norm, and it is what `np.linalg.lstsq` returns. The ridge penalty of
[Section 9](#s9) also removes the ambiguity. Neither makes the individual weights of dependent
columns meaningful.

::: worked title="A duplicated column"
Append a column $2x$ to the four points, so the rows of $\mathbf{X}$ are $(1, x_i, 2x_i)$ and

$$
\mathbf{X}^\top\mathbf{X} = \begin{bmatrix} 4 & 6 & 12 \\ 6 & 14 & 28 \\ 12 & 28 & 56 \end{bmatrix},
$$

whose third row is twice its second: the determinant is 0. Write $a$ and $c$ for the weights on
$x$ and $2x$. The fit is $b + (a + 2c)x$, so every choice with $b = 1.1$ and $a + 2c = 1.1$
reproduces the line of the previous example and the predictions $(1.1, 2.2, 3.3, 4.4)$. The
minimum-norm choice is the point of the line $a + 2c = 1.1$ closest to the origin, which lies
along the line's normal $(1, 2)$: $(a, c) = 1.1\cdot(1, 2)/(1^2 + 2^2) = (0.22, 0.44)$.
`np.linalg.lstsq` returns $(b, a, c) = (1.1, 0.22, 0.44)$ and reports rank 2.
:::

### Computing it

Never form $(\mathbf{X}^\top\mathbf{X})^{-1}$; solve. The **condition number** $\kappa(\mathbf{X})$,
the ratio of the largest to the smallest singular value of $\mathbf{X}$, bounds how much rounding
errors can be amplified: of the 16 significant digits of double precision, a solve can lose about
$\log_{10}\kappa$. Three methods, in increasing order of robustness:

- **Cholesky of $\mathbf{X}^\top\mathbf{X}$.** Factor $\mathbf{X}^\top\mathbf{X} = \mathbf{L}\mathbf{L}^\top$
  with $\mathbf{L}$ lower-triangular and solve two triangular systems. It is the fastest, but
  forming $\mathbf{X}^\top\mathbf{X}$ squares the condition number,
  $\kappa(\mathbf{X}^\top\mathbf{X}) = \kappa(\mathbf{X})^2$, because the eigenvalues of
  $\mathbf{X}^\top\mathbf{X}$ are the squared singular values of $\mathbf{X}$. At
  $\kappa(\mathbf{X}) = 10^6$ that is up to 12 lost digits instead of 6.
- **QR of $\mathbf{X}$.** Write $\mathbf{X} = \mathbf{Q}\mathbf{R}$, with orthonormal columns in
  $\mathbf{Q}$ and $\mathbf{R}$ upper-triangular. Since $\mathbf{Q}^\top\mathbf{Q} = \mathbf{I}$,
  the normal equations become $\mathbf{R}^\top\mathbf{R}\mathbf{w} = \mathbf{R}^\top\mathbf{Q}^\top\mathbf{y}$,
  that is $\mathbf{R}\mathbf{w} = \mathbf{Q}^\top\mathbf{y}$, solved by back-substitution. The
  method works with $\mathbf{X}$ itself and never squares $\kappa$.
- **SVD.** $\mathbf{X} = \mathbf{U}\boldsymbol{\Sigma}\mathbf{V}^\top$ gives
  $\mathbf{w} = \mathbf{V}\boldsymbol{\Sigma}^{-1}\mathbf{U}^\top\mathbf{y}$. The singular values on
  the diagonal of $\boldsymbol{\Sigma}$ display the conditioning, and inverting only the non-zero
  ones gives the minimum-norm solution of the rank-deficient case.

`np.linalg.lstsq` uses an SVD-based LAPACK driver and is the default to reach for. Each method
costs about $Nd^2$ operations to form $\mathbf{X}^\top\mathbf{X}$ or to factor $\mathbf{X}$, plus
about $d^3$ for the small solve that follows.

### The code, and the irreducible error

Here is all of it in NumPy, on the data of [Lab 1](#lab1): 200 inputs with three standard-normal
features, true weights $(1.5, -2.0, 0.5)$, intercept 0.7 and Gaussian noise of standard deviation
0.1. Gradient descent, the subject of the next section, is included for comparison.

```python
import numpy as np

rng = np.random.default_rng(0)
N, d = 200, 3
X = rng.normal(size=(N, d))
w_true = np.array([1.5, -2.0, 0.5]); b_true = 0.7
y = X @ w_true + b_true + 0.1 * rng.normal(size=N)   # noise: the part no model recovers

Xb = np.hstack([X, np.ones((N, 1))])                 # absorb the bias

# closed form
w_closed = np.linalg.solve(Xb.T @ Xb, Xb.T @ y)

# gradient descent
w = np.zeros(d + 1); eta = 0.1
for step in range(500):
    grad = (2 / N) * Xb.T @ (Xb @ w - y)
    w -= eta * grad
print(np.round(w_closed, 3), np.round(w, 3))         # both near [1.5, -2.0, 0.5, 0.7]

# the robust default: an SVD-based solver that never forms Xb.T @ Xb
w_lstsq = np.linalg.lstsq(Xb, y, rcond=None)[0]
rss = np.sum((y - Xb @ w_lstsq) ** 2)               # residual sum of squares
print(np.round(w_lstsq, 3))
print(f"residual RMS {np.sqrt(rss / N):.4f}")
print(f"sqrt(RSS / (N - 4)) {np.sqrt(rss / (N - 4)):.4f}")
```

```output
[ 1.491 -2.01   0.505  0.696] [ 1.491 -2.01   0.505  0.696]
[ 1.491 -2.01   0.505  0.696]
residual RMS 0.1000
sqrt(RSS / (N - 4)) 0.1010
```

::: worked title="What the code prints"
The normal equations, `lstsq` and 500 steps of gradient descent at $\eta = 0.1$ agree to three
decimals: $(1.491, -2.010, 0.505, 0.696)$ against the true $(1.5, -2.0, 0.5, 0.7)$. The
differences from the truth are not solver error. They are the noise of this particular sample:
with $\mathbf{X}^\top\mathbf{X} \approx 200\,\mathbf{I}$, each weight has a standard error of
about $0.1/\sqrt{200} = 0.007$, and the differences are of that size. The residual RMS is
$\sqrt{\text{RSS}/N} = 0.1000$. Dividing by $N - 4$ instead, for the four fitted parameters, gives
0.1010, and the noise actually drawn has an RMS of 0.1011: the noise level, recovered. The
residuals come out slightly smaller than the noise because the fit spends 4 of the 200 degrees of
freedom following it; [Section 5](#s5) derives the correction.
:::

The term $0.1\cdot\mathcal{N}(0, 1)$ in the data is the **irreducible error**: no function of
$\mathbf{x}$ predicts it, so no model can bring the expected squared error on new data below its
variance, 0.01. A residual RMS equal to the noise level says that nothing recoverable is left. A
model whose training residuals fall well below the noise level is fitting the noise, which new
data will not share. That is the first appearance of the central problem of
[Section 8](#s8).

::: check
Why are they called the normal equations?
:::

::: answer
They say $\mathbf{X}^\top(\mathbf{y} - \mathbf{X}\mathbf{w}) = \mathbf{0}$: the residual is normal,
that is perpendicular, to every column of $\mathbf{X}$.
:::

::: check
You add temperature in °F next to temperature in °C, with an intercept. What happens to
$\mathbf{X}^\top\mathbf{X}$ and to the predictions?
:::

::: answer
$\mathbf{X}^\top\mathbf{X}$ becomes singular, because the °F column equals 1.8 times the °C column
plus 32 times the intercept column. The weights are no longer unique, but the projection
$\hat{\mathbf{y}}$, and so the predictions, are unchanged.
:::

::: check
Why prefer QR or the SVD to solving $\mathbf{X}^\top\mathbf{X}\mathbf{w} = \mathbf{X}^\top\mathbf{y}$
by Cholesky?
:::

::: answer
Forming $\mathbf{X}^\top\mathbf{X}$ squares the condition number, roughly doubling the digits lost
to rounding; QR and the SVD work with $\mathbf{X}$ directly.
:::

## Gradient descent on a quadratic {#s3}

The normal equations solve least squares in one step. **Gradient descent** solves it by
iteration,

$$
\mathbf{w}_{t+1} = \mathbf{w}_t - \eta\,\nabla\mathcal{L}(\mathbf{w}_t),
$$

with a step size $\eta > 0$ called the **learning rate**. There are three reasons to iterate when
a closed form exists. Cost: the solve takes about $Nd^2 + d^3$ operations, a gradient step about
$Nd$, two matrix–vector products. Memory: the solve needs all the data at once, while the
stochastic steps of [Section 4](#s4) need only a few rows. Generality: no model from
[Module 02](module_02_EN.html) on has a closed form, and gradient descent is what trains them all.
Least squares is the one case in which its behaviour can be derived exactly, which is why it is
derived here. The rule of thumb: for small $d$, call `lstsq`; for large $N$ or $d$, or for data
that arrive as a stream, use the stochastic gradient descent of [Section 4](#s4); for an
ill-conditioned problem, rescale the features first (below).

### The quadratic, exactly

Write $\mathbf{H} = \frac{2}{N}\mathbf{X}^\top\mathbf{X}$ for the Hessian of [Section 2](#s2).
Put $\mathbf{w} = \mathbf{w}^\ast + \mathbf{e}$ in the loss and expand:

$$
\begin{aligned}
N\mathcal{L}(\mathbf{w}^\ast + \mathbf{e}) &= \|(\mathbf{X}\mathbf{w}^\ast - \mathbf{y}) + \mathbf{X}\mathbf{e}\|^2 \\
&= \|\mathbf{X}\mathbf{w}^\ast - \mathbf{y}\|^2 + 2\,\mathbf{e}^\top\mathbf{X}^\top(\mathbf{X}\mathbf{w}^\ast - \mathbf{y}) + \mathbf{e}^\top\mathbf{X}^\top\mathbf{X}\mathbf{e}.
\end{aligned}
$$

The middle term vanishes by the normal equations. Dividing by $N$,

$$
\mathcal{L}(\mathbf{w}) = \mathcal{L}(\mathbf{w}^\ast) + \tfrac{1}{2}(\mathbf{w} - \mathbf{w}^\ast)^\top\mathbf{H}\,(\mathbf{w} - \mathbf{w}^\ast), \tag{3.1}
$$

and its gradient is $\nabla\mathcal{L}(\mathbf{w}) = \mathbf{H}(\mathbf{w} - \mathbf{w}^\ast)$. The
loss is its minimum plus a bowl whose shape is $\mathbf{H}$. Follow the error
$\mathbf{e}_t = \mathbf{w}_t - \mathbf{w}^\ast$: subtracting $\mathbf{w}^\ast$ from both sides of
the update gives

$$
\mathbf{e}_{t+1} = \mathbf{e}_t - \eta\mathbf{H}\mathbf{e}_t = (\mathbf{I} - \eta\mathbf{H})\,\mathbf{e}_t,
\qquad\text{so}\qquad \mathbf{e}_t = (\mathbf{I} - \eta\mathbf{H})^t\,\mathbf{e}_0.
$$

Because $\mathbf{H}$ is symmetric it has an orthonormal basis of eigenvectors,
$\mathbf{H} = \mathbf{Q}\boldsymbol{\Lambda}\mathbf{Q}^\top$, with eigenvalues
$\lambda_{\min} = \lambda_1 \le \dots \le \lambda_{d+1} = \lambda_{\max}$, all non-negative. In the
rotated coordinates $\tilde{\mathbf{e}} = \mathbf{Q}^\top\mathbf{e}$ the matrix
$\mathbf{I} - \eta\mathbf{H}$ becomes the diagonal $\mathbf{I} - \eta\boldsymbol{\Lambda}$, and
each component evolves alone:

$$
\tilde e_{i,t} = (1 - \eta\lambda_i)^t\,\tilde e_{i,0}.
$$

That one line contains everything there is to know about the learning rate on a quadratic.

### Stability

Every component shrinks, from every start, only if $|1 - \eta\lambda_i| < 1$ for every $i$, that
is $0 < \eta\lambda_i < 2$. The steepest direction binds first:

$$
0 < \eta < \frac{2}{\lambda_{\max}}.
$$

Follow the factor $1 - \eta\lambda_{\max}$ of the steepest direction as $\eta$ grows (Figure 1.4
shows the first, third and fifth regimes on one problem):

- $\eta < 1/\lambda_{\max}$: every factor lies between 0 and 1, and every component shrinks
  monotonically, without changing sign.
- $\eta = 1/\lambda_{\max}$: the steepest factor is 0, and that component is solved in one step.
- $1/\lambda_{\max} < \eta < 2/\lambda_{\max}$: the steepest factor is negative, between −1 and 0.
  That component changes sign at every step, so the iterate zig-zags across the valley while it
  converges.
- $\eta = 2/\lambda_{\max}$: the factor is −1, and that component flips sign for ever, neither
  growing nor decaying.
- $\eta > 2/\lambda_{\max}$: the factor is below −1, and that component grows geometrically; the
  loss explodes.

The boundary is sharp. [Lab 1](#lab1) runs 200 steps at 0.99 and at 1.01 times $2/\lambda_{\max}$
and ends with a training MSE of 0.0104 in the first case and $3.8\times10^3$ in the second.

::: figure id=fig-01-4
Gradient descent on a two-dimensional quadratic with $\kappa = 10$, whose eigenvectors are rotated
30° from the axes: elliptical level sets around the minimum $\mathbf{w}^\ast$, axes $w_1$ and $w_2$
on equal scales. Three paths start from the same point. At $\eta = 0.5/\lambda_{\max}$ (factors
0.5 along the steep direction and 0.95 along the flat one) the path is smooth and creeps along
the valley; at $\eta = 1.8/\lambda_{\max}$ (factors −0.8 and 0.82) it zig-zags across the valley
while converging; at $\eta = 2.1/\lambda_{\max}$ (factors −1.1 and 0.79) it bounces outward and
diverges. The legend gives each $\eta$ with its two factors.
:::

### Speed

Stability is set by the steepest direction; speed is set by the flattest. The error norm shrinks
per step by at most $\rho(\eta) = \max_i|1 - \eta\lambda_i|$, the largest factor in absolute value
(the rotation $\mathbf{Q}$ preserves norms). Since $|1 - \eta\lambda|$ is a V in $\lambda$, its
largest value over the eigenvalues is at one of the two ends:
$\rho = \max(|1 - \eta\lambda_{\min}|, |1 - \eta\lambda_{\max}|)$. Raising $\eta$ shrinks the first
term and, beyond $1/\lambda_{\max}$, grows the second. The best fixed step makes them equal:

$$
1 - \eta\lambda_{\min} = \eta\lambda_{\max} - 1
\;\;\Rightarrow\;\; \eta^\ast = \frac{2}{\lambda_{\max} + \lambda_{\min}},
\qquad \rho^\ast = 1 - \frac{2\lambda_{\min}}{\lambda_{\max} + \lambda_{\min}} = \frac{\kappa - 1}{\kappa + 1},
$$

where $\kappa = \lambda_{\max}/\lambda_{\min}$ is the **condition number** of $\mathbf{H}$ (for
$\mathbf{H} \propto \mathbf{X}^\top\mathbf{X}$ it is $\kappa(\mathbf{X})^2$ in the notation of
Section 2). Reducing the error by a factor $\epsilon$ takes $\rho^t \le \epsilon$, that is

$$
t = \frac{\ln(1/\epsilon)}{-\ln\rho} \;\approx\; \frac{\kappa}{2}\,\ln\frac{1}{\epsilon}
\quad\text{for large } \kappa,
$$

using $-\ln\rho^\ast = \ln(1 + 1/\kappa) - \ln(1 - 1/\kappa) \approx 2/\kappa$. By (3.1) the excess
loss is quadratic in the error, so it shrinks as $\rho^{2t}$. Even at the best fixed step, the
number of steps grows in proportion to $\kappa$: that is the cost of ill-conditioning.
[Module 02, Section 7](module_02_EN.html#s7) shows how momentum reduces it to about
$\sqrt{\kappa}$.

::: worked title="Four step sizes on a diagonal Hessian"
Take $\mathbf{H} = \operatorname{diag}(1, 10)$: $\lambda_{\min} = 1$, $\lambda_{\max} = 10$,
$\kappa = 10$, and stability needs $\eta < 2/10 = 0.2$. Count the steps that reduce the error by
$10^6$, $t = \ln(10^6)/(-\ln\rho) = 13.82/(-\ln\rho)$, rounded up:

| $\eta$ | flat factor $1 - \eta$ | steep factor $1 - 10\eta$ | $\rho$ | steps |
|---|---|---|---|---|
| 0.1 | 0.9 | 0.0 | 0.9 | $13.82/0.1054 = 131.1$, so 132 |
| 0.18 | 0.82 | −0.80 | 0.82 | $13.82/0.1985 = 69.6$, so 70 |
| $2/11 = 0.182$ | 0.818 | −0.818 | 0.818 | $13.82/0.2007 = 68.8$, so 69 |
| 0.21 | 0.79 | −1.10 | 1.10 | diverges |

At $\eta = 0.1$ the steep component vanishes after one step and the flat one sets the pace.
Raising $\eta$ to 0.18 nearly halves the step count at the price of a zig-zag. The optimum,
$\eta^\ast = 2/11$, saves one more step, with $\rho^\ast = 9/11 = (\kappa - 1)/(\kappa + 1)$. Just
past the limit, at 0.21, the steep component is multiplied by −1.1 at every step and has grown
$1.1^{50} = 117$ times after 50 steps.
:::

### Where the conditioning comes from

The condition number is a property of the features, and it can be read off them.

**Units.** If the features are centred and uncorrelated, with standard deviations $s_j$, then
$\frac{1}{N}\mathbf{X}^\top\mathbf{X}$ is diagonal: $s_j^2$ for each feature and 1 for the
intercept, whose column of ones is orthogonal to every centred column. So
$\kappa = (s_{\max}/s_{\min})^2$ (provided the intercept's 1 lies between the extremes). Take a
span length in millimetres with a standard deviation of 1000 mm next to an elastic modulus in
gigapascals with a standard deviation of 0.001 GPa, which is 1 MPa of batch-to-batch scatter. The
standard deviations differ by a factor of $10^6$, so $\kappa = 10^{12}$, and even at the best fixed
step gradient descent needs about $(\kappa/2)\ln(10^6) \approx 6.9\times10^{12}$ iterations to
gain six digits. After standardisation $\kappa \approx 1$.

**Offsets.** A feature that is not centred couples to the intercept. One feature with mean 100 and
standard deviation 1, next to the column of ones, gives

$$
\frac{1}{N}\mathbf{X}^\top\mathbf{X} = \begin{bmatrix} 1 & 100 \\ 100 & 10001 \end{bmatrix},
$$

because the off-diagonal entry is the feature's mean and the corner is its mean square,
$100^2 + 1^2$. The trace is 10002 and the determinant $10001 - 10000 = 1$, so the eigenvalues are
about 10002 and $1/10002 = 1.0\times10^{-4}$, and $\kappa \approx 1.0\times10^{8}$, from a feature
of unremarkable scale. The loss hardly changes when the weight and the intercept move together,
one up and the other down by 100 times as much, which is a long, flat valley. Centring alone fixes
it: subtract the mean and the matrix becomes the identity.

**Correlation.** Two standardised features with correlation $r$ give the correlation matrix
$\begin{bmatrix} 1 & r \\ r & 1 \end{bmatrix}$, whose eigenvalues are $1 + r$ along $(1, 1)$ and
$1 - r$ along $(1, -1)$, so $\kappa = (1 + r)/(1 - r)$: 19 at $r = 0.9$ and 199 at $r = 0.99$.
Standardisation fixes units; it does not fix correlation.

The remedy for units and offsets is to **standardise** each feature, $x'_j = (x_j - \mu_j)/s_j$,
with the mean $\mu_j$ and standard deviation $s_j$ computed on the training set only and applied
unchanged to validation data, test data and inputs in service. Computing them on all the data lets
the held-out rows shape the fit: leakage in miniature, which [Section 10](#s10) treats in general.
The standardised model is the same model in new coordinates, so its weights map back exactly:

$$
\sum_j w'_j\,\frac{x_j - \mu_j}{s_j} + b' = \sum_j \frac{w'_j}{s_j}\,x_j + \Big(b' - \sum_j \frac{\mu_jw'_j}{s_j}\Big),
\quad\text{so}\quad w_j = \frac{w'_j}{s_j}, \quad b = b' - \sum_j \frac{\mu_jw'_j}{s_j}.
$$

::: worked title="Lab 1's regression, well and badly scaled"
For the data of Section 2, $\mathbf{H} = \frac{2}{200}\mathbf{X}^\top\mathbf{X}$ has eigenvalues
1.711, 1.922, 2.126 and 2.207. Standard-normal features are already close to standardised, so
$\kappa = 2.207/1.711 = 1.29$, $\eta_{\max} = 2/2.207 = 0.906$ and
$\eta^\ast = 2/(2.207 + 1.711) = 0.511$. Gradient descent from zero brings
$\|\mathbf{w} - \mathbf{w}^\ast\|$ below $10^{-6}$ in 76 steps at $\eta = 0.1$ and in 7 at
$\eta^\ast$.

Now damage the units: multiply the first feature by 1000, as if metres had become millimetres,
and add 100 to the second. The condition number becomes $1.0\times10^{10}$; the scaling alone
gives $1.1\times10^{6}$ and the offset alone $1.0\times10^{8}$. The largest stable step falls to
$\eta_{\max} = 9.7\times10^{-7}$. After 100,000 steps at $0.9\,\eta_{\max}$ the training MSE is
still 4.28, against 0.0100 from `lstsq` on the same data: gradient descent appears not to learn,
although nothing is wrong with the model. Standardised with the training statistics, the problem
has $\kappa = 1.22$, gradient descent at $\eta^\ast$ converges in 6 steps, and the weights mapped
back to the original units equal the `lstsq` solution of the badly scaled problem. The fix is a
change of variables, not a new algorithm.
:::

### Beyond quadratics

Near any smooth minimum a loss is approximately quadratic, with $\mathbf{H}$ its Hessian at the
minimum, so $\eta < 2/\lambda_{\max}(\mathbf{H})$ also governs local stability for the networks of
[Module 02](module_02_EN.html). For logistic regression ([Section 6](#s6)) the curvature changes
with $\mathbf{w}$, and a bound computed from its worst case is sufficient but not necessary: in
[Lab 2](#lab2) the loss still falls at more than eight times that bound.

::: widget name=gd-quadratic
The default, $\kappa = 20$ and $\eta = 1.8$ in units of $1/\lambda_{\max}$, zig-zags across the
valley while creeping along it, as in Figure 1.4. Push $\eta$ just past 2 and watch the steep
direction blow up; set it to 1 and the steep direction is solved in one step while the flat one
crawls. Then keep $\eta = 1.8$ and raise $\kappa$ from 20 to 1000: the step count grows from 66 to
2,386. The preset with correlated features shows a narrow valley in standardised units.
:::

::: check
With $\mathbf{H} = \operatorname{diag}(2, 200)$, what is the largest stable learning rate, and
which coordinate limits the speed?
:::

::: answer
$\eta < 2/200 = 0.01$. Even at that limit the $\lambda = 2$ coordinate keeps a fraction
$1 - 0.01\cdot2 = 0.98$ of its error per step, so it sets the pace: $\kappa = 100$.
:::

::: check
Why does standardising features not fix ill-conditioning caused by correlated features?
:::

::: answer
Standardising rescales each axis separately. Correlation tilts and stretches the elliptical level
sets along the diagonals $(1, 1)$ and $(1, -1)$, and the correlation matrix's eigenvalues
$1 \pm r$ stay apart however the axes are scaled.
:::

::: check
Gradient descent on raw features "does not learn". Name the first two things to check.
:::

::: answer
Centring and scaling: compute $\kappa$ of $\mathbf{X}^\top\mathbf{X}/N$. Then the learning rate
against $2/\lambda_{\max}$.
:::

## Stochastic and mini-batch gradient descent {#s4}

The gradient of the empirical risk is an average over all $N$ examples, so computing it exactly
costs a pass over the data per step. **Stochastic gradient descent** (SGD) replaces it with the
average over a random **mini-batch** $\mathcal{B}$ of $B$ examples:

$$
\theta \leftarrow \theta - \eta\,\mathbf{g}_{\mathcal{B}}, \qquad
\mathbf{g}_{\mathcal{B}} = \frac{1}{B}\sum_{i\in\mathcal{B}}\nabla_\theta\,\ell_i(\theta),
$$

where $\ell_i(\theta) = \ell(f_\theta(\mathbf{x}_i), y_i)$. $B = N$ is the full-batch gradient
descent of [Section 3](#s3); $B = 1$ is SGD in its original form.

### Unbiased, with variance falling as 1/B

Draw the $B$ indices independently and uniformly from $1, \dots, N$ (with replacement). Each
drawn gradient $\nabla\ell_{i_k}$ is then a random vector with mean
$\frac{1}{N}\sum_i\nabla\ell_i = \nabla\mathcal{L}$ and covariance

$$
\boldsymbol{\Sigma}_g = \frac{1}{N}\sum_{i=1}^{N}\big(\nabla\ell_i - \nabla\mathcal{L}\big)\big(\nabla\ell_i - \nabla\mathcal{L}\big)^\top,
$$

the spread of the per-example gradients. Linearity of expectation gives
$\E[\mathbf{g}_{\mathcal{B}}] = \nabla\mathcal{L}$: the mini-batch gradient is **unbiased**.
Independence makes the covariances of the $B$ terms add, while the factor $1/B$ enters squared:

$$
\operatorname{Cov}(\mathbf{g}_{\mathcal{B}}) = \frac{1}{B^2}\cdot B\,\boldsymbol{\Sigma}_g = \frac{\boldsymbol{\Sigma}_g}{B}.
$$

A batch four times larger halves the noise's standard deviation at four times the cost. Sampling
without replacement, as a shuffled pass through the data does, multiplies the covariance by
$(N - B)/(N - 1)$: slightly less, and exactly zero at $B = N$, where the batch is the whole
dataset.

One pass over the data, an **epoch**, is $\lceil N/B\rceil$ updates instead of one, each costing
about $Bd$ operations for a linear model instead of $Nd$. Far from the minimum the per-example
gradients largely agree, so a mini-batch step makes nearly the progress of a full step at a
fraction of the cost; that is why SGD wins on large data. In practice: reshuffle every epoch,
because data stored in order (by class, by time, by machine) would otherwise give batches that
are not samples of the whole; fix the random seeds so that runs can be repeated; and choose $B$
between 32 and a few thousand. Language models train on batches of millions of tokens, for
reasons given in [Module 08, Section 6](module_08_EN.html#s6).

::: worked title="Counting updates"
With N = 50,000 examples and $B = 64$, $N/B = 781.25$, so an epoch is $\lceil 781.25\rceil = 782$
updates, the last on a batch of $50{,}000 - 781\cdot64 = 16$ examples. Twenty epochs are 15,640
updates. Full-batch gradient descent makes 20 updates for the same twenty passes over the data.
:::

The loop that does it, continuing the code of [Section 2](#s2):

```python
rng = np.random.default_rng(1)
w = np.zeros(d + 1); eta, B = 0.1, 32
for epoch in range(50):
    order = rng.permutation(N)                       # reshuffle every epoch
    for k in range(0, N, B):
        idx = order[k:k + B]                         # the last batch holds 8 rows
        grad = (2 / len(idx)) * Xb[idx].T @ (Xb[idx] @ w - y[idx])
        w -= eta * grad
excess = np.mean((Xb @ w - y) ** 2) - np.mean((Xb @ w_lstsq - y) ** 2)
print(np.round(w, 3), f"excess loss {excess:.1e}")
```

```output
[ 1.489 -2.016  0.507  0.688] excess loss 1.3e-04
```

After 350 updates the weights are close to the least-squares solution but not on it, and more
epochs at the same step would not bring them closer. The reason is the subject of the rest of
this section.

### The noise floor

At the minimum the full gradient is zero, but the per-example gradients are not, so the
mini-batch gradient is not zero either and the iterate keeps moving. Take a one-dimensional
quadratic, $\mathcal{L}(\theta) = \mathcal{L}(\theta^\ast) + \frac{1}{2}\lambda(\theta - \theta^\ast)^2$,
and model the mini-batch gradient as the true gradient $\lambda(\theta - \theta^\ast)$ plus noise
$\xi_t$, drawn afresh at each step, with mean zero and variance $s^2/B$, where $s^2$ is the
variance of the per-example gradients. The update gives

$$
\theta_{t+1} - \theta^\ast = (1 - \eta\lambda)(\theta_t - \theta^\ast) - \eta\,\xi_t.
$$

Square and take expectations. The cross term vanishes because $\xi_t$ has mean zero and is
independent of $\theta_t$, which earlier batches decided. With
$V_t = \E[(\theta_t - \theta^\ast)^2]$,

$$
V_{t+1} = (1 - \eta\lambda)^2\,V_t + \eta^2\,\frac{s^2}{B}.
$$

For a stable step, $|1 - \eta\lambda| < 1$, the distance $V_t - V$ to the fixed point shrinks by
$(1 - \eta\lambda)^2$ per step, so $V_t$ converges to the $V$ that solves
$V = (1 - \eta\lambda)^2V + \eta^2s^2/B$. Using $1 - (1 - \eta\lambda)^2 = \eta\lambda(2 - \eta\lambda)$:

$$
V = \frac{\eta\,s^2}{B\lambda(2 - \eta\lambda)} \;\approx\; \frac{\eta\,s^2}{2B\lambda}
\quad\text{for } \eta\lambda \ll 1. \tag{4.1}
$$

A constant step does not converge. The iterate hovers around $\theta^\ast$ with variance $V$, and
the expected excess loss is $\frac{1}{2}\lambda V = \eta s^2/\big(2B(2 - \eta\lambda)\big)$: a
**noise floor** proportional to $\eta/B$.

::: worked title="The floor in numbers"
Take $\lambda = 1$ and $s^2 = 1$. With $B = 1$ and $\eta = 0.1$,
$V = 0.1/(1\cdot1\cdot1.9) = 0.0526$, and the excess loss is $\frac{1}{2}\cdot0.0526 = 0.0263$; a
400,000-step simulation of the recursion measures $V = 0.0526$. With $\eta = 0.01$,
$V = 0.01/1.99 = 0.00503$ and the excess is 0.00251. With $B = 10$ at $\eta = 0.1$,
$V = 0.1/(10\cdot1.9) = 0.00526$. A tenfold smaller step or a tenfold larger batch buys about a
tenfold lower floor: the smaller step pays with slower progress, the larger batch with ten times
the cost per update.
:::

### Getting below the floor

There are two ways down. Enlarge the batch, which divides the floor by $B$ at a proportional cost
per update; or let the step decay. Robbins and Monro (1951) gave the conditions on a schedule
$\eta_t$ under which the iterate converges:

$$
\sum_{t=0}^{\infty}\eta_t = \infty, \qquad \sum_{t=0}^{\infty}\eta_t^2 < \infty.
$$

The first lets the steps add up to any distance, so the iterate can reach the minimum from any
start. The second bounds the noise the steps inject, whose variance enters as $\eta_t^2s^2/B$ in
the recursion above. The schedule $\eta_t = \eta_0/(1 + t/\tau)$ meets both: it stays near
$\eta_0$ for the first $\tau$ or so updates and then behaves like $\eta_0\tau/t$, whose sum
diverges like $\ln t$ while the sum of its squares converges.

Return to the widget of [Section 3](#s3) and raise its gradient-noise slider $\sigma_g$: the loss
falls as before, then flattens at the dashed line of the predicted floor. With $\kappa = 20$ and
$\sigma_g = 0.3$ the floor is 0.0046 at $\eta = 0.1$, and halving $\eta$ to 0.05 halves it, to
0.0023. At large steps the factor $2 - \eta\lambda$ also matters: the floor is 0.0264 at
$\eta = 0.5$ and 0.0681 at $\eta = 1.0$.

::: worked title="Lab 1's floors, measured and predicted"
For least squares the per-example gradient at the optimum is
$2\mathbf{x}_i(\mathbf{x}_i^\top\mathbf{w}^\ast - y_i) = -2\mathbf{x}_ir_i$, with $r_i$ the
residual. If the residuals are independent of the inputs and have variance $\sigma^2$, its
covariance is $4\sigma^2\cdot\frac{1}{N}\mathbf{X}^\top\mathbf{X} = 2\sigma^2\mathbf{H}$: along the
eigenvector of $\mathbf{H}$ with eigenvalue $\lambda_i$ the gradient-noise variance is
$2\sigma^2\lambda_i$. Applying (4.1) along each eigenvector and summing the excess losses
$\frac{1}{2}\lambda_iV_i$,

$$
\text{floor} = \sum_i \frac{\eta\,\sigma^2\lambda_i}{B\,(2 - \eta\lambda_i)}.
$$

With Lab 1's $\sigma^2 = 0.0100$ and the eigenvalues of Section 3, and the measured excess
training loss averaged over the second half of 50 epochs:

| $B$ | $\eta$ | measured | predicted |
|---|---|---|---|
| 32 | 0.1 | $1.0\times10^{-4}$ | $1.4\times10^{-4}$ |
| 10 | 0.1 | $3.1\times10^{-4}$ | $4.4\times10^{-4}$ |
| 1 | 0.01 | $2.7\times10^{-4}$ | $4.0\times10^{-4}$ |
| 1 | 0.03 | $1.3\times10^{-3}$ | $1.2\times10^{-3}$ |
| 1 | 0.1 | $9.6\times10^{-3}$ | $4.4\times10^{-3}$ |

The prediction holds within a factor of about two and gets the scaling with $\eta/B$ right. Most
floors sit below it because each shuffled epoch uses every example exactly once, which cancels
part of the noise; with independently drawn batches the same runs land at or above the
prediction, by up to about half again (2.0 against $1.4\times10^{-4}$ at $B = 32$). At $B = 1$ and $\eta = 0.1$ the measurement is twice the prediction, because the
model ignores the part of the gradient noise that grows with the distance from the optimum, and
that distance is largest here. With the decaying step $\eta_t = 0.1/(1 + t/200)$ at $B = 1$, the
excess after the last of 10,000 updates is $3\times10^{-6}$, and about $2\times10^{-5}$ averaged
over the last epoch: below every constant-step floor in the table (Figure 1.6).
:::

::: figure id=fig-01-6
Excess training loss $\mathcal{L}(\mathbf{w}_t) - \mathcal{L}(\mathbf{w}^\ast)$ (log scale) against
the number of updates (log scale) for Lab 1's regression. Four curves: full-batch gradient descent
at $\eta = 0.1$ (one update per epoch, smooth); $B = 32$ at $\eta = 0.1$ (falls fast, then flat
near $10^{-4}$); $B = 1$ at $\eta = 0.1$ (noisy, flat near $10^{-2}$); and $B = 1$ with
$\eta_t = 0.1/(1 + t/200)$ (keeps falling, below the constant-step floors). Dashed horizontal
lines mark the predicted floors of the two constant-step runs with $B < N$. Generated by
[Lab 1](#lab1).
:::

### Choosing the learning rate

When the curvature is known, as for least squares, start from $2/\lambda_{\max}$ and stay a safe
factor below it. Otherwise measure: run a short sweep of learning rates spaced by a factor of
about 3 on a log scale, from $10^{-4}$ to 1 (0.0001, 0.0003, 0.001, ..., 0.3, 1), for a few hundred
updates each, take the largest $\eta$ whose loss falls smoothly, and decay it over the run. Then
read the loss curve on a log scale:

- rising, or NaN within a few steps: $\eta$ is beyond the stability limit; divide it by 3 to 10;
- a straight but shallow descent: $\eta$ is too small, or the problem is ill-conditioned; compute
  $\kappa$ before raising $\eta$;
- a fall that turns into a noisy plateau: the noise floor; decay the step or enlarge the batch,
  and do not read the plateau as convergence.

Momentum and Adam are in [Module 02, Sections 7](module_02_EN.html#s7) and
[8](module_02_EN.html#s8), and the learning-rate range test and schedules in
[Section 9](module_02_EN.html#s9) of that module.

### Noise, flat minima and non-convex losses

The noise has a second effect, which may be beneficial: small batches tend to find flatter minima,
and flatter minima tend to generalise better. Keskar et al. (2017) observed that large-batch
training of networks converges to sharper minima that generalise worse. This is an empirical
observation with a partial theory, not a law, and the link between flatness and generalisation is
still debated.

For non-convex models, which means every model from [Module 02](module_02_EN.html) on, gradient
descent finds a local minimum or a saddle point, with no guarantee that it is the best one. In
practice, for large networks, the minima found are usually good enough, and the difficulty lies
elsewhere: in conditioning, initialisation and the learning rate, which Module 02 takes up.

::: check
Doubling the batch at a fixed step: what happens to the gradient-noise variance and to the floor?
:::

::: answer
Both halve, at twice the cost per update.
:::

::: check
Why must the step decay for SGD to converge, when full-batch gradient descent converges with a
fixed step?
:::

::: answer
The per-example gradients do not vanish at the minimum, so the mini-batch gradient is noisy there,
and with a fixed $\eta$ the iterate keeps a stationary variance proportional to $\eta/B$. The
full-batch gradient is exactly zero at the minimum, so a fixed step can settle there.
:::
