# Plan: From Machine Learning to Large Language Models

A ten-module AI tutorial series for Ran Wei's home page (`docs/tutorials/ai/`), alongside the SysML v2, MBSE, DevOps and AI Agents series. Each module expands one of ten concise tutorials kept in the author's private repository into a self-study unit of about ten hours, in English and Simplified Chinese.

This document is generated from the ten module outlines (`plan/module_NN.json`), the detailed contracts the writers follow. It summarises them; the outlines are about ten times longer.

## 1. The series

**Audience.** Engineers and postgraduates who know calculus, linear algebra and basic probability but have not worked in machine learning. The aim: read a modern model paper, understand what a training run does to a model, and make engineering decisions about models with judgement.

**Shape of a module: about 600 minutes, in five study sessions of about two hours.**

| Activity | Minutes | Volume |
|---|---|---|
| Concept reading: derivations, worked examples, figures, inline checks, interactive widgets | 210–250 | 12–14 sections, about 15,000 words |
| Labs: Python/PyTorch on a laptop CPU; every printed output produced by running the code | 170–210 | 5–6 labs |
| Exercises with full worked solutions, graded one to three stars | 100–130 | 15 exercises |
| Self-check quiz with explanations | 15–20 | 12 questions |
| Guided reading of key papers | 40–60 | 2–3 papers |

**Rules kept throughout.** Every number comes from somewhere: the text says how it was obtained. Every method can fail, and each module has a section on what goes wrong. British spelling and the source tutorials' direct voice. No references to the private platform: its examples become generic engineering ones (fitting a hyperelastic material model, segmenting microscopy volumes, sensor time series, fault-tree graphs). Modules 07–10 follow one hypothetical case study, a ~9.5B open model adapted to draft and check engineering safety-assurance arguments, with one canonical configuration (L = 36, d = 4,096, 32 query and 8 KV heads, d_ff = 15,360, V = 152,064).

| # | Module | Planned minutes | Sections | Labs | Exercises | Quiz | Papers | Widgets | Figures planned |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Machine learning foundations | 628 | 12 | 5 | 15 | 12 | 3 | 2 | 27 |
| 02 | Neural networks and backpropagation | 618 | 14 | 5 | 15 | 12 | 3 | 2 | 21 |
| 03 | Convolutional networks | 616 | 14 | 6 | 15 | 12 | 2 | 2 | 38 |
| 04 | Recurrent networks and sequences | 620 | 13 | 5 | 15 | 12 | 3 | 2 | 21 |
| 05 | Other networks worth knowing | 612 | 13 | 5 | 15 | 12 | 3 | 2 | 29 |
| 06 | The transformer | 622 | 12 | 6 | 15 | 12 | 3 | 2 | 18 |
| 07 | Large language models | 609 | 14 | 6 | 15 | 12 | 2 | 2 | 13 |
| 08 | LLM pretraining | 627 | 14 | 5 | 15 | 12 | 3 | 2 | 14 |
| 09 | LLM post-training | 621 | 14 | 6 | 15 | 12 | 3 | 2 | 21 |
| 10 | Inference and serving | 615 | 13 | 6 | 15 | 12 | 3 | 2 | 18 |

## 2. Production status (4 October 2026)

| # | EN parts | edited | figures | widgets | labs run | tech review | EN QA | 中文 parts | 中文 QA | English prose words |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | 7/7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39,162 |
| 02 | 7/7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 37,334 |
| 03 | 7/7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39,478 |
| 04 | 7/7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 39,370 |
| 05 | 7/7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 38,930 |
| 06 | 7/7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24,351 |
| 07 | 7/7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 24,506 |
| 08 | 7/7 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 21,799 |
| 09 | 0/7 | – | – | – | – | – | – | – | – | 0 |
| 10 | 0/7 | – | – | – | – | – | – | – | – | 0 |

Figures drawn so far: 134, each also in Chinese. Widget files: 16 of 20. English prose words exclude code and maths and include labs, exercises and solutions. A module published on the site in both languages is marked done at every stage.

## 3. The modules

### Module 01: Machine learning foundations

What learning from data is, written out as mathematics you can compute: a model, a loss derived from a noise model, an optimiser whose behaviour an eigenvalue predicts, and the habit that separates a model that works from one that only looks as if it does, which is evaluating it honestly.

**Before you start:** No earlier module: this is the first module of the series; Calculus: partial derivatives, the chain rule and the gradient of a function of several variables; Linear algebra: matrix products and transposes, inverse and rank, eigenvalues and eigenvectors of a symmetric matrix, and orthogonality (the SVD is introduced where it is used); Probability: random variables, expectation, variance and independence (Section 5 opens with a refresher on the Gaussian, Laplace, Bernoulli and categorical distributions); Python: functions, loops and NumPy arrays; no experience of a machine-learning library is assumed.

**You will be able to:**

- State any learning method as its five ingredients (data, model, loss, optimiser, evaluation) and name the assumption each one carries.
- Derive the gradient and the normal equations of least squares, and explain the solution as an orthogonal projection onto the column space of $\mathbf{X}$.
- Predict from the Hessian's eigenvalues whether gradient descent converges at a given learning rate ($\eta < 2/\lambda_{\max}$) and roughly how many steps it needs (in proportion to $\kappa$), and repair a stalled run by centring and standardising the features.
- Derive squared error, absolute error and cross-entropy as negative log-likelihoods, and ridge and lasso as MAP estimates under Gaussian and Laplace priors, with $\lambda = \sigma^2/(N\tau^2)$ for ridge.
- Derive the gradients of logistic and softmax regression, implement logistic regression in NumPy and check it against scikit-learn.
- Derive the bias–variance decomposition and use validation curves, learning curves and $k$-fold cross-validation to choose model capacity and regularisation strength.
- Design an evaluation free of the common leaks (preprocessing fitted inside the folds, group- and time-aware splits, nested selection, a test set opened once), attach a standard error or bootstrap interval to every reported number, and compare two models on one test set with a paired bootstrap and McNemar's exact test.
- Choose and compute the metric a decision needs (precision, recall, F1, ROC AUC, average precision, expected calibration error, Brier score), including the effect of the base rate and a cost-based threshold.
- Fit a physical model by weighted and nonlinear least squares, read its normalised residuals and $\chi^2_\nu$, quantify the uncertainty of its parameters and state the range outside which its predictions are unsupported.
- Say what $k$-NN, decision trees, random forests, gradient boosting, kernel methods and SVMs, Gaussian processes, $k$-means and PCA do, and which to try first as a baseline.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. Least squares and gradient descent | Read Sections 1–2: the learning problem, and least squares with its geometry. (35); Exercise 1: the five ingredients of two methods. (5); Read Sections 3–4 with the gradient-descent widget: gradient descent on a quadratic, then stochastic and mini-batch gradient descent. (37); Lab 1: linear regression by the closed form, gradient descent and SGD, with the learning-rate cliff and feature scaling. (35); Exercise 3: step sizes and step counts from eigenvalues. (10) |
| 2. Likelihood, classification and metrics | Read Sections 5–6: maximum likelihood, then logistic and softmax regression. (39); Exercise 4: why cross-entropy and not squared error. (10); Read Section 7: metrics, thresholds and calibration. (21); Lab 2: logistic regression from scratch against scikit-learn on the breast-cancer data, with the metrics a decision needs. (40); Exercises 5–6: the base rate in odds form, and the AUC by counting pairs. (20) |
| 3. Generalisation and regularisation | Read Section 8 with the polynomial-capacity widget: capacity, bias–variance and cross-validation. (22); Exercise 7: a shrunk estimator that beats the unbiased one. (10); Read Section 9: ridge, lasso and MAP estimation. (19); Lab 3: polynomials, with the capacity curve, bias–variance by Monte Carlo, the ridge path and cross-validation for $\lambda$. (40); Exercises 2 and 8: one-hot collinearity, then the normal equations and ridge. (15); Guided reading: Belkin et al. (2019) on double descent. (15) |
| 4. Honest evaluation and the wider toolbox | Read Section 10: leakage, selection bias, confidence intervals and McNemar's test. (21); Lab 4: the leakage clinic, with three pipelines that look excellent, their honest versions, bootstrap intervals and McNemar's test. (35); Exercises 9–11: spot the leak, question a 98% accuracy, and see why the best of many configurations flatters itself. (15); Read Section 11: the methods beyond linear models. (24); Exercises 12–13: too many features for $k$-NN, and the baseline ladder on tabular data (★★★). (30) |
| 5. An engineering fit, and review | Read Section 12: fitting a hyperelastic material model. (18); Lab 5: neo-Hookean and Gent fits to a synthetic compression test, with uncertainty, residuals and extrapolation. (35); Exercises 14–15: an outlier and its recorded uncertainty, then the loading direction. (15); Read What goes wrong: fifteen failures, each with its symptom, cause and fix. (7); Guided reading: Kapoor and Narayanan (2023) on leakage, then Domingos (2012) as a synthesis. (30); Self-check quiz: twelve questions. (15); Summary and review: redo the five-ingredient table for the hyperelastic fit and list the three numbers you would report with it. (10) |

**Concept sections.**

- **s1 The learning problem** (15 min). State what learning from data is as five explicit choices, fix the notation for the series, and introduce the running examples of this module. _2 worked example(s), 1 figure(s)._
  - The two motivating engineering functions from the source, kept: the sag of a scaffold as a function of material and geometry (a solver exists but took a person-year to …
  - Formal set-up: unknown f*, data distribution P over (x, y), sample D = {(x_i, y_i)}, i = 1..N, drawn from P.
  - Expected risk R(f) = E_(x,y)~P [ℓ(f(x), y)] against empirical risk L(θ) = (1/N) Σ_i ℓ(f_θ(x_i), y_i).
  - Three settings: supervised (regression when y is continuous, classification when y is one of K labels), unsupervised (structure without y: k-means and PCA in Section 11, …
  - The five ingredients, each with the reason it matters: data (and the distribution P it came from — the one people forget);
  - Inputs as numbers: the feature vector x ∈ R^d.
  - … and 1 more points
- **s2 Least squares and its geometry** (20 min). Fit linear regression in closed form, read the solution as an orthogonal projection, and know when the problem is ill-posed and how to compute it stably. _3 worked example(s), 2 figure(s)._
  - Set-up: f(x) = w·x + b;
  - Gradient derived, not asserted: expand ‖Xw − y‖² = wᵀXᵀXw − 2yᵀXw + yᵀy;
  - Normal equations XᵀXw = Xᵀy and w* = (XᵀX)⁻¹Xᵀy when X has full column rank (needs at least d + 1 linearly independent rows).
  - Geometry: ŷ = Xw* is the orthogonal projection of y onto the column space of X;
  - Rank deficiency: duplicated or affinely dependent columns (temperature in °C next to °F with an intercept;
  - Computation: never form the inverse.
  - … and 1 more points
- **s3 Gradient descent on a quadratic** (21 min). Derive exactly when and how fast gradient descent converges on the least-squares loss, so that learning rate, conditioning and feature scaling become numbers rather than folklore. _2 worked example(s), 2 figure(s), widget: gd-quadratic._
  - Why iterate when a closed form exists, and when not to: the solve costs about Nd² + d³ and needs all the data in memory;
  - Exact quadratic form and the error recursion: using the normal equations, L(w) = L(w*) + ½(w − w*)ᵀH(w − w*) with H = (2/N)XᵀX (show the expansion).
  - Stability derived: convergence needs \|1 − ηλ_i\| < 1 for every i, i.e.
  - Rate: the flattest mode limits speed at factor 1 − ηλ_min.
  - Conditioning comes from the features: for centred, uncorrelated features with standard deviations s_j, (1/N)XᵀX = diag(s_j²) and κ = (s_max/s_min)².
  - Standardisation x′ = (x − μ)/s with μ and s from the training set only, applied unchanged to validation and test data (leakage in miniature otherwise;
  - … and 1 more points
- **s4 Stochastic and mini-batch gradient descent** (16 min). Explain batch, stochastic and mini-batch gradient descent, derive the noise floor that a constant step leaves, and give a practical procedure for choosing the learning rate. _3 worked example(s), 1 figure(s)._
  - The mini-batch update θ ← θ − η(1/B)Σ_(i∈B)∇ℓ_i.
  - An epoch is ⌈N/B⌉ updates rather than one, which is why SGD wins on large data;
  - The noise floor, derived on a 1-D quadratic with curvature λ and gradient-noise variance s²: θ_(t+1) − θ* = (1 − ηλ)(θ_t − θ*) − ηξ_t with Var ξ = s²/B.
  - Consequences: decay the step (Robbins–Monro conditions Σ_t η_t = ∞ and Σ_t η_t² < ∞, for example η_t = η₀/(1 + t/τ)) or enlarge the batch.
  - Choosing η in practice: when the curvature is known, start from 2/λ_max;
  - Noise as a regulariser: small batches tend to find flatter minima that generalise better — an empirical observation with a partial theory (Keskar et al.
  - … and 1 more points
- **s5 Where losses come from: maximum likelihood** (19 min). Show, starting from a short probability refresher, that a loss is a negative log-likelihood under a noise model, so that choosing a loss becomes choosing an assumption about the noise. _3 worked example(s), 1 figure(s)._
  - Probability refresher, where it is first needed (about 350 words, not an appendix): random variable;
  - Independence and the i.i.d.
  - Likelihood L(θ) = p(D;
  - Gaussian noise gives squared error, derived in full: y = f_θ(x) + ε, ε ~ N(0, σ²);
  - Laplace noise gives absolute error, and the best constant under absolute error is the median (the derivative of \|r\| is sign(r): equal numbers of residuals above and …
  - Different noise per point (heteroscedastic Gaussian, σ_i known) gives weighted least squares with weights w_i = 1/σ_i², derived in two lines.
  - … and 3 more points
- **s6 Logistic and softmax regression** (20 min). Build the linear classifier from the Bernoulli and categorical likelihoods, derive its gradients and convexity, and read its decision boundary — including how it fails on separable data. _4 worked example(s), 2 figure(s)._
  - Model p(y = 1 \| x) = σ(wᵀx) with σ(z) = 1/(1 + e^(−z));
  - Binary cross-entropy as the Bernoulli negative log-likelihood, ℓ = −[y ln p̂ + (1 − y) ln(1 − p̂)];
  - Hessian (1/N)XᵀSX with S = diag(p̂_i(1 − p̂_i)), positive semidefinite, so the loss is convex;
  - Why not squared error: with ½(p̂ − y)² the gradient with respect to z is (p̂ − y)p̂(1 − p̂), which vanishes exactly when the model is confidently wrong;
  - Stable computation: ℓ = softplus(z) − yz with softplus(z) = max(z, 0) + ln(1 + e^(−\|z\|)) (np.logaddexp(0, z));
  - Decision boundary: predict 1 when p̂ ≥ t;
  - … and 3 more points
- **s7 Measuring a model: metrics, thresholds and calibration** (21 min). Choose the metric the decision depends on, read the confusion matrix, ROC and precision–recall curves and calibration, and set a threshold from costs rather than by default. _7 worked example(s), 3 figure(s)._
  - The metric should be the quantity the decision depends on, not the loss (source).
  - Regression metrics with formulas: RMSE (units of y), MAE (robust to outliers), R² = 1 − SS_res/SS_tot (from Section 2's Pythagoras;
  - The confusion matrix and the rates read from it: accuracy, precision TP/(TP + FP), recall (sensitivity, TPR) TP/(TP + FN), specificity TN/(TN + FP), FPR = 1 − …
  - Accuracy under imbalance: 99% accuracy at a 1% positive rate is the trivial classifier (source).
  - The base rate, derived from Bayes' rule: precision = TPR·π/(TPR·π + FPR·(1 − π)) for prevalence π.
  - ROC curve (TPR against FPR as the threshold sweeps) and AUC;
  - … and 2 more points
- **s8 Generalisation: capacity, bias–variance and cross-validation** (22 min). Make overfitting measurable: the three-way split, the capacity curve, the bias–variance decomposition derived, learning curves, k-fold cross-validation and an honest account of double descent. _4 worked example(s), 5 figure(s), widget: polynomial-capacity._
  - Split before doing anything else (source): training set (what the optimiser sees), validation set (to choose between models and settings), test set (touched once at the …
  - The capacity experiment, set up exactly as in Lab 3: y = sin(2πx) + ε, ε ~ N(0, 0.3²), N = 20 training points on an evenly spaced grid x_i = i/19, polynomials of degree …
  - The bias–variance decomposition derived step by step at a fixed input x: y = f*(x) + ε with E[ε] = 0, Var ε = σ², ε independent of the training set D;
  - Reading it: bias is what the family cannot represent, variance is how much the fit changes with the sample, noise is irreducible.
  - Learning curves: training and validation error against N for a fixed model.
  - k-fold cross-validation (source): split into k folds, train on k − 1, validate on the remaining one, rotate, average.
  - … and 1 more points
- **s9 Regularisation as prior knowledge: ridge, lasso and MAP** (19 min). Trade variance for bias on purpose, and show that ridge and lasso are maximum a posteriori estimates under Gaussian and Laplace priors, with their shrinkage written out. _4 worked example(s), 2 figure(s)._
  - Bayes' rule p(θ \| D) ∝ p(D \| θ)p(θ);
  - Ridge as MAP, constants kept: Gaussian noise σ² and prior w ~ N(0, τ²I) give the negative log-posterior (1/(2σ²))‖Xw − y‖² + (1/(2τ²))‖w‖² + const;
  - Ridge closed form: (2/N)Xᵀ(Xw − y) + 2λw = 0 gives (XᵀX + λNI)w = Xᵀy (source).
  - SVD view: with X = UΣVᵀ and singular values s_i, the ridge fit is ŷ = Σ_i u_i [s_i²/(s_i² + λN)] u_iᵀy.
  - Weight decay: the gradient step on the ridge loss is w ← (1 − 2ηλ)w − η∇L, which is why the penalty is called weight decay (source);
  - Lasso as MAP under a Laplace prior p(w_j) ∝ exp(−\|w_j\|/b): penalty λ‖w‖₁;
  - … and 3 more points
- **s10 Evaluating honestly: leakage, selection and intervals** (21 min). Estimate how a model will do on new data without fooling yourself: the forms leakage takes, the optimism of selection and its remedy, distribution shift, an uncertainty on every reported number, and paired methods when … _5 worked example(s), 3 figure(s)._
  - How noisy a test number is: the standard error of an accuracy (any proportion) is √(p(1 − p)/n), and the 95% interval is about ±1.96 standard errors, a normal …
  - Test-set reuse (source): looking at the test number and changing the model, repeatedly.
  - Selection bias: choosing the best of many configurations on a validation set makes the winner's score optimistic, because the maximum of noisy estimates is biased upward.
  - Leakage, with an example and a fix for each: (1) preprocessing fitted on all data — scaling, imputation, feature selection, target encoding;
  - Distribution shift (source): the test set is drawn from the same P as training and deployment is not.
  - Bootstrap confidence intervals: resample the test set with replacement R = 2,000 times, recompute the metric, take the 2.5th and 97.5th percentiles.
  - … and 2 more points
- **s11 Beyond linear: the methods you will meet** (24 min). Give a working acquaintance with the classical nonlinear methods and two unsupervised workhorses, with enough mechanism to know when each is the right baseline. _5 worked example(s), 2 figure(s)._
  - k-nearest neighbours (source): predict by averaging or voting over the k closest training points;
  - Decision trees: recursive axis-aligned threshold splits chosen to reduce impurity (variance for regression;
  - Random forests (source): trees grown on bootstrap samples with a random subset of features considered at each split, then averaged.
  - Gradient boosting (source): an additive model F_m = F_(m−1) + νh_m in which each small tree h_m is fitted to the negative gradient of the loss at F_(m−1) — for squared …
  - Kernels and SVMs, about 400 words with the derivation written out: replace x by a feature map φ(x) and stack the mapped inputs as the rows of Φ.
  - Gaussian processes (source): a distribution over functions giving an uncertainty with every prediction;
  - … and 5 more points
- **s12 Engineering case: fitting a hyperelastic material model** (18 min). Apply every ingredient of the module to a realistic engineering fit — a soft hydrogel in uniaxial compression — including weighted and nonlinear least squares, residual analysis, the parameters' uncertainty and the … _4 worked example(s), 3 figure(s)._
  - The physics in about 150 words: an incompressible neo-Hookean solid has strain energy W = c₁(I₁ − 3);
  - Weighted least squares and the coefficient's uncertainty: the model is linear in c₁ once g is computed (source).
  - Goodness of fit: normalised residuals r_i = (P_i − P̂_i)/σ_i and the reduced chi-square χ²_ν = Σr_i²/(N − p), about 1 when the model and the σ_i are right;
  - Extrapolation: a fit over 0–20% says nothing about 40% (source).
  - Nonlinear least squares, with a richer model: the Gent model P = 2c₁g(λ)/(1 − β(I₁ − 3)), β = 1/J_m ≥ 0 (finite chain extensibility), contains neo-Hookean as β = 0 and …
  - The loading direction, and refusing inputs (source, generalised): g is not symmetric about λ = 1, so the direction must be declared;
- **What goes wrong.** 15 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: Linear regression three ways: closed form, gradient descent and SGD | 35 | ~1 min | none | Fit the same linear model by the normal equations, gradient descent and SGD; |
| lab2: Logistic regression from scratch, and the metrics a decision needs | 40 | ~1 min | none | Implement regularised logistic regression with a numerically stable loss, match scikit-learn, then measure the classifier the way a decision needs: confusion matrix, thresholds … |
| lab3: Polynomials: capacity, bias–variance and the ridge path | 40 | ~1 min | none | Reproduce the capacity curve, estimate bias² and variance by Monte Carlo and check them against exact formulas, trace the ridge path at degree 15, and choose λ by five-fold … |
| lab4: The leakage clinic | 35 | ~1 min | none | Build three pipelines that report excellent scores for the wrong reason, repair each, and put bootstrap confidence intervals on honest results, paired where models are compared, … |
| lab5: Fitting a hyperelastic material model | 35 | ~1 min | none | Fit a neo-Hookean coefficient to a synthetic compression test by weighted least squares, verify its uncertainty, see a clean fit fail by extrapolation, detect the misfit with … |

**Exercises** (15: 7 ★, 7 ★★, 1 ★★★; 130 minutes).

- e1 ★ conceptual, 5 min: Write down the five ingredients (data, model, loss, optimiser, evaluation) for (a) a linear trendline fitted in a spreadsheet to a strain-gauge …
- e2 ★ conceptual, 5 min: A linear model predicts tensile strength from material grade, one of {steel, aluminium, titanium}.
- e3 ★★ calculation, 10 min: The least-squares Hessian of a two-feature problem has eigenvalues 1 and 25.
- e4 ★★ derivation, 10 min: (a) Show that the gradient of binary cross-entropy with respect to the logit z is p̂ − y, where p̂ = σ(z).
- e5 ★★ calculation, 10 min: A crack detector has recall 0.90 and false-positive rate 0.03, and cracks are present in 2% of inspected parts.
- e6 ★★ calculation, 10 min: Six test parts receive scores.
- e7 ★★ derivation, 10 min: You estimate a mean μ from n independent readings of variance σ², using the shrunk estimator μ̂_c = c·ȳ with 0 ≤ c ≤ 1.
- e8 ★★ derivation, 10 min: (a) Derive the normal equations from the gradient of L(w) = (1/N)‖Xw − y‖².
- e9 ★ conceptual, 5 min: For each set-up say whether there is leakage, of which kind, and how to fix it.
- e10 ★ conceptual, 5 min: A colleague reports 98% accuracy for a model that classifies hazards as controllable or not controllable.
- e11 ★ conceptual, 5 min: You run a random search over 120 configurations of a gradient-boosting model, score each by 5-fold cross-validation and report the best score.
- e12 ★ conceptual, 5 min: A k-nearest-neighbour classifier (k = 5, standardised features) detects bearing faults well from 3 vibration features computed on about 3,000 …
- e13 ★★★ coding, 25 min: Test the claim that gradient boosting is the baseline to beat on tabular data.
- e14 ★★ calculation, 10 min: In Lab 5's neo-Hookean fit over strains up to 20%, change the point at λ = 0.90 from −6.98 kPa to −8.00 kPa.
- e15 ★ conceptual, 5 min: A colleague exports a compression test with the stretches written as 1 + strain and the stresses as positive numbers, and fits the neo-Hookean model …

**Quiz** (12 questions): The normal equations Xᵀ(y − Xw) = 0 say that, at the least-squares solution,; Gradient descent runs on L(w) = ½wᵀHw where H has eigenvalues 0.5 and 8.; Two centred, uncorrelated features have standard deviations 1 and 100.; Constant-step SGD has reached its noise floor near a minimum.; If the noise in y follows a Laplace distribution, maximum likelihood fits the …; For binary cross-entropy with p̂ = σ(z), the derivative of the loss with …; A test has recall 0.8 and false-positive rate 0.01.; A degree-15 polynomial fitted to 20 noisy points has training RMSE 0.11 and …; Ridge regression is the MAP estimate under which prior on the weights?; Which of these is NOT leakage?; For which model would rescaling one feature from millimetres to metres leave …; A neo-Hookean fit over 0–20% strain has a 95% interval of ±1% on c₁, yet its …

**Guided reading.**

- Belkin, M., Hsu, D., Ma, S., Mandal, S. “Reconciling modern machine-learning practice and the classical bias–variance trade-off.” Proceedings of the National Academy of Sciences (PNAS), 2019. (15 min). The paper that named double descent.
- Kapoor, S., Narayanan, A. “Leakage and the reproducibility crisis in machine-learning-based science.” Patterns, 2023. (15 min). A survey of leakage in published machine-learning-based science, with a taxonomy that turns Lab 4's three cases into a checklist, and a case study in which a celebrated …
- Domingos, P. “A few useful things to know about machine learning.” Communications of the ACM, 2012. (15 min). A practitioner's summary of lessons this module derives formally;

**Interactive widgets.**

- `gd-quadratic` (in s3): The learning rate is capped by the steepest direction (η < 2/λ_max) while the speed is set by the flattest (factor 1 − ηλ_min per step), so the number of steps grows with the condition number;
- `polynomial-capacity` (in s8): Training error falls with every degree added, while validation error is U-shaped because bias² falls and variance rises;

**Key terms:** 30 English–Chinese pairs. **References:** 40.

### Module 02: Neural networks and backpropagation

How a stack of linear maps and nonlinearities learns its own features, how reverse-mode differentiation delivers the whole gradient for at most two more forward passes, and why training is mostly a matter of keeping numbers in range: initialisation, optimisers, normalisation, regularisation and numerical stability, each with the check that shows when it has failed.

**Before you start:** Module 01: the supervised-learning set-up, losses as negative log-likelihoods (squared error, binary and softmax cross-entropy), gradient descent and mini-batch SGD, the condition number and why features are standardised, train/validation/test splits, ridge regression as weight decay, and early stopping; Calculus: partial derivatives, the multivariable chain rule as a sum over paths, and the second-order Taylor expansion; Linear algebra: matrix products and their shapes, the transpose, outer products, and the eigenvalues and eigenvectors of a symmetric matrix; Probability: expectation and variance, the variance of a sum of independent variables, and the Bernoulli distribution; Python with NumPy (array shapes, broadcasting, the `@` operator); no PyTorch is assumed, because it is introduced as it is used, from Lab 1's cross-check onwards.

**You will be able to:**

- Write the forward pass of an $L$-layer MLP for a batch with every shape stated, and count its parameters, its forward FLOPs (two per weight per example) and the activations it must store.
- Derive the four backpropagation equations from the chain rule, including $\boldsymbol{\delta} = \hat{\mathbf{p}} - \mathbf{y}$ for softmax cross-entropy, and implement them in NumPy so that every gradient entry agrees with central finite differences to a relative error below $10^{-6}$.
- Explain backpropagation as reverse-mode automatic differentiation on a computational graph, compute a gradient by hand in both forward and reverse mode, and say why reverse mode costs a small multiple of the forward pass for a scalar loss while forward mode needs one pass per input.
- Derive Xavier (Glorot) and He initialisation from variance preservation, and predict layer by layer what zero, too-small and too-large initial scales do to activations and gradients.
- Implement SGD, heavy-ball and Nesterov momentum, AdaGrad, RMSProp, Adam with its derived bias correction, and AdamW, give the stability limits of gradient descent and momentum on a quadratic, and explain why decoupled weight decay differs from $L_2$ regularisation under Adam.
- Choose a peak learning rate with a range test, configure warmup and cosine decay, and apply global-norm gradient clipping, knowing what each protects against.
- Compute batch norm, layer norm and RMSNorm by hand, and state how batch norm behaves differently in training and evaluation mode.
- Derive the $1/(1 - p)$ scaling of inverted dropout, and use weight decay, early stopping, augmentation, label smoothing and temperature scaling for what each actually does.
- Compute cross-entropy from logits without overflow by log-sum-exp, explain why $\ln(\operatorname{softmax}(\mathbf{z}))$ and a softmax placed before the loss fail, and state the ranges of fp32, bf16 and fp16.
- Diagnose a failing run from its initial loss, loss curves, gradient norms and activation statistics, using the overfit-one-batch test, gradient checks and a written checklist.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. Networks and their gradients | Read Sections 1–2 with the MLP playground: learned features, then the forward pass with its shapes and costs. (31); Exercises 1 and 3: the affine collapse, and what the depth argument shows. (10); Read Section 3: the four backpropagation equations. (21); Lab 1: backpropagation by hand in NumPy, checked by finite differences and by PyTorch. (40); Exercise 2: the four equations for a three-layer tanh network, with FLOP counts. (15) |
| 2. Automatic differentiation, activations and initialisation | Read Section 4: computational graphs, reverse mode and forward mode. (18); Lab 2: a scalar autodiff engine in about 100 lines. (40); Exercise 4: forward and reverse mode by hand. (10); Read Sections 5–6: activation functions, then initialisation. (30); Exercises 5 and 6: a dead ReLU unit, and initial scales through depth. (15); Guided reading: Rumelhart, Hinton and Williams (1986) on backpropagation. (15) |
| 3. Optimisers | Read Section 7 with the optimiser-paths widget: gradient descent and momentum on a quadratic. (18); Exercise 7: stability limits and rates on a quadratic. (10); Read Section 8: AdaGrad, RMSProp, Adam and AdamW. (18); Exercises 8 and 9: Adam by hand, and L2 regularisation against decoupled weight decay. (15); Read Section 9: schedules, the range test and gradient clipping. (13); Lab 3: optimisers, schedules and the range test on the digits network. (35); Guided reading: Loshchilov and Hutter (2019) on AdamW. (15) |
| 4. Normalisation, regularisation and numerics | Read Sections 10–11: normalisation layers, then regularisation and calibration for networks. (30); Exercise 10: inverted dropout. (5); Read Section 12: losses and numerical stability. (14); Exercises 11 and 12: log-sum-exp, and the floor a softmax before the loss imposes. (15); Read Section 13: a complete training loop, line by line. (9); Lab 4: digits, honestly, a complete PyTorch training run with early stopping and five seeds. (35); Guided reading: Glorot and Bengio (2010) on initialisation. (20) |
| 5. Debugging, and review | Read Section 14: training dynamics and debugging. (16); Exercises 13 and 14: reading gradient checks, and reading loss curves. (10); Lab 5: a debugging clinic of four broken training scripts. (35); Read What goes wrong: fourteen failures, each with its symptom, cause and fix. (7); Exercise 15: Adam against SGD in Lab 1's network, with inputs recorded in millimetres. (25); Self-check quiz: twelve questions. (18); Review: the summary, the checks you missed, and the Section 14 checklist rewritten from memory. (10) |

**Concept sections.**

- **s1 From fixed features to learned ones** (20 min). Show why a network that learns its own features can fit what a linear model on fixed features cannot, state exactly what the universal approximation theorem promises, and show with a counting argument why depth buys … _4 worked example(s), 3 figure(s), widget: mlp-playground._
  - Open from Module 01: a linear model on hand-made features, f(x) = w⊤φ(x), works when someone knows φ.
  - Define the MLP in this module's convention, used everywhere afterwards: h⁽⁰⁾ = x;
  - Why the nonlinearity is necessary, written out: without φ, z⁽²⁾ = W⁽²⁾⊤(W⁽¹⁾⊤x + b⁽¹⁾) + b⁽²⁾ = (W⁽¹⁾W⁽²⁾)⊤x + (W⁽²⁾⊤b⁽¹⁾ + b⁽²⁾), an affine map;
  - The universal approximation theorem stated precisely: for any continuous f on a compact set K ⊂ ℝ^d and any ε > 0 there is a finite width N and weights such that a …
  - Three things it does not say: how large N must be (constructions grid the input and can need a number of units exponential in d);
  - The theorem made constructive in one dimension: on [a, b] with knots x₀ < … < x_K, the piecewise-linear interpolant of f is exactly a one-hidden-layer ReLU network g(x) …
  - … and 3 more points
- **s2 The forward pass, with shapes** (11 min). Make the forward computation for a batch concrete — shapes, parameter counts, FLOPs and stored activations — because most bugs are shape bugs and every cost estimate later in the series starts here. _4 worked example(s), 1 figure(s)._
  - The batch convention: B inputs stacked as rows, H⁽⁰⁾ = X ∈ ℝ^(B × d₀);
  - The output Z⁽ᴸ⁾ ∈ ℝ^(B × K) holds logits for K classes;
  - Parameter count Σ_l (d_{l−1}d_l + d_l).
  - FLOPs: a (B × m)(m × n) product costs 2Bmn FLOPs (Bmn multiplies and about as many adds).
  - Memory: the backward pass (s3) needs each layer's input H⁽ˡ⁻¹⁾ and its Z⁽ˡ⁾ (or enough to evaluate φ'), so a training forward pass stores O(B·Σ d_l) numbers.
  - PyTorch's nn.Linear(d_in, d_out) stores its weight as (d_out, d_in) and computes x W⊤ + b.
  - … and 1 more points
- **s3 Backpropagation: the four equations** (21 min). Derive backpropagation from the chain rule, so that every line of a backward pass can be written, checked and costed by hand. _4 worked example(s), 2 figure(s)._
  - A matrix-calculus refresher, where it is first needed: the gradient of a scalar with respect to a vector or matrix has the shape of that vector or matrix;
  - Define the error signal δ⁽ˡ⁾ = ∂𝓛/∂z⁽ˡ⁾ for one example (a column vector of length d_l).
  - Equation 1, at the output.
  - Equation 2, between layers: z⁽ˡ⁺¹⁾ = W⁽ˡ⁺¹⁾⊤φ(z⁽ˡ⁾) + b⁽ˡ⁺¹⁾, so δ⁽ˡ⁾_i = Σ_j δ⁽ˡ⁺¹⁾_j W⁽ˡ⁺¹⁾_ij φ'(z⁽ˡ⁾_i), i.e.
  - Equations 3 and 4, the parameter gradients: ∂𝓛/∂W⁽ˡ⁾ = h⁽ˡ⁻¹⁾δ⁽ˡ⁾⊤ (shape d_{l−1} × d_l, the shape of W⁽ˡ⁾) and ∂𝓛/∂b⁽ˡ⁾ = δ⁽ˡ⁾.
  - The batch form: with Δ⁽ˡ⁾ ∈ ℝ^(B × d_l) stacking the δ⊤ of the batch, Δ⁽ˡ⁾ = (Δ⁽ˡ⁺¹⁾W⁽ˡ⁺¹⁾⊤) ⊙ φ'(Z⁽ˡ⁾);
  - … and 4 more points
- **s4 Automatic differentiation: graphs, reverse mode and forward mode** (18 min). Show that backpropagation is one instance of reverse-mode automatic differentiation on a computational graph, why reverse mode is the right mode for a scalar loss, and what PyTorch is doing when you call loss.backward(). _3 worked example(s), 2 figure(s)._
  - A computational graph: nodes are primitive operations (add, multiply, matrix product, exp, log, sin, tanh, ReLU);
  - Forward mode: carry a tangent v̇_i alongside each value, v̇_i = Σ over parents j of (∂v_i/∂v_j)·v̇_j.
  - Reverse mode: after the forward pass, carry adjoints v̄_i = ∂𝓛/∂v_i backwards, v̄_j += v̄_i·∂v_i/∂v_j for every child i of j.
  - The cost argument: for f: ℝⁿ → ℝᵐ the full Jacobian costs n forward-mode passes (a column each) or m reverse-mode passes (a row each), each a small constant multiple of …
  - The price of reverse mode is memory: the backward sweep needs the forward values, so they are stored (the 'tape').
  - Layers as VJP rules: for z = W⊤h + b, given z̄: h̄ = Wz̄, W̄ = hz̄⊤, b̄ = z̄ (exactly s3's equations);
  - … and 2 more points
- **s5 Activation functions** (13 min). Choose activations knowing their derivatives, because the derivative is what backpropagation multiplies by at every layer. _4 worked example(s), 1 figure(s)._
  - The source's table, extended, with formula, derivative, range, zero-centred or not, where it saturates, and typical use: sigmoid σ(z) = 1/(1 + e^(−z)), σ' = σ(1 − σ) ≤ …
  - Derive σ' = σ(1 − σ), and show tanh z = 2σ(2z) − 1: tanh is a rescaled sigmoid whose derivative at 0 is 1 instead of 1/4.
  - Saturation: where φ' ≈ 0 a unit passes almost no gradient (σ'(5) = 0.0066, tanh'(3) = 0.0099).
  - Why ReLU won (source): a derivative of exactly 1 on the active side passes errors through many layers undiminished, where sigmoids multiply them by at most 1/4 per layer;
  - GELU and SiLU are not monotonic: GELU has its minimum −0.170 at z = −0.752 and SiLU −0.278 at z = −1.278, with slightly negative derivatives below those points.
  - Zero-centring: a sigmoid layer's outputs are all positive, so for one example every gradient ∂𝓛/∂W_ij = h_iδ_j into unit j has the sign of δ_j;
  - … and 2 more points
- **s6 Initialisation** (17 min). Derive the initial weight scale from variance preservation, and show what zero, too-small and too-large scales do to a deep network. _3 worked example(s), 1 figure(s)._
  - Symmetry: with all weights equal (zero or any constant), every unit in a layer computes the same function and receives the same gradient, so the units stay identical for …
  - The forward derivation: z_j = Σ_{i=1}^{n} w_ij h_i with the w_ij independent, zero mean, variance σ_w², and independent of h.
  - For tanh near the origin h ≈ z, so E[h²] ≈ Var(z_previous) and preservation needs σ_w² = 1/n_in (LeCun).
  - The backward derivation: δ⁽ˡ⁾ = (W⁽ˡ⁺¹⁾δ⁽ˡ⁺¹⁾) ⊙ φ' gives Var(δ⁽ˡ⁾) = n_out σ_w² E[φ'²] Var(δ⁽ˡ⁺¹⁾), so preservation needs σ_w² = 1/n_out for tanh and 2/n_out for ReLU …
  - Too large: tanh units saturate (φ' ≈ 0, gradients vanish);
  - Framework defaults are not He: PyTorch's nn.Linear draws weights and biases from U(−1/√n_in, 1/√n_in), a weight variance of 1/(3n_in).
  - … and 2 more points
- **s7 Gradient descent and momentum** (18 min). Explain with the quadratic model why plain gradient descent is slow on ill-conditioned losses, how heavy-ball and Nesterov momentum help, and what limits the learning rate. _3 worked example(s), 2 figure(s), widget: optimiser-paths._
  - Recall Module 01 and extend it: on 𝓛 = ½θ⊤Aθ with eigenvalues λ₁ ≤ … ≤ λ_d, gradient descent acts on each eigen-coordinate separately, θ_i ← (1 − ηλ_i)θ_i.
  - Near a minimum a network's loss is approximately quadratic with the Hessian H in place of A (second-order Taylor expansion), so the same limit η < 2/λ_max(H) applies …
  - Stochastic gradients: a mini-batch gradient is the full gradient plus noise whose covariance falls as 1/B (Module 01).
  - Heavy-ball momentum (Polyak 1964;
  - The low-pass-filter view: v is the output of the filter v_t = μv_{t−1} + g_t, whose transfer function is H(ω) = 1/(1 − μe^(−iω)).
  - On the quadratic: heavy ball is stable iff 0 < ηλ < 2(1 + μ) for every eigenvalue (from the characteristic equation r² − (1 + μ − ηλ)r + μ = 0);
  - … and 3 more points
- **s8 Adaptive methods: AdaGrad, RMSProp, Adam and AdamW** (18 min). Derive the adaptive optimisers as per-parameter step-size normalisation, including Adam's bias correction, and show exactly why AdamW's decoupled weight decay is not L2 regularisation under Adam. _4 worked example(s), 2 figure(s)._
  - Motivation: gradient scales differ by orders of magnitude across parameters (at step 1 in Lab 3's digits network, from 1.1×10⁻⁸ to 4.4×10⁻²), so a single η is too large …
  - AdaGrad (Duchi et al.
  - RMSProp (Tieleman and Hinton 2012, from a lecture slide rather than a paper): replace the sum by an exponential moving average, v ← ρv + (1 − ρ)g², θ ← θ − ηg/(√v + ε), …
  - Adam (Kingma and Ba 2015): m ← β₁m + (1 − β₁)g;
  - Derive the bias correction: with m₀ = 0, m_t = (1 − β₁)Σ_{s=1}^{t} β₁^{t−s}g_s, so for gradients with a constant mean E[m_t] = (1 − β₁^t)E[g];
  - What Adam's step is: \|Δθ_i\| ≈ η\|m̂_i\|/√v̂_i, about η when gradients are consistent and less when they are noisy;
  - … and 6 more points
- **s9 Learning-rate schedules, the range test and gradient clipping** (13 min). Set the learning rate over time and find its scale, and guard against gradient spikes, knowing what each device protects against. _4 worked example(s), 2 figure(s)._
  - Why decay, recalled from Module 01 (which derives it;
  - Schedules: step decay (×0.1 at fixed fractions of training, e.g.
  - Why warmup: at the start Adam's v̂ is estimated from a handful of gradients and is noisy even after bias correction, so early steps are erratic (Liu et al.
  - The peak learning rate is the most important hyperparameter after the architecture (source).
  - PyTorch: torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max) counts scheduler.step() calls — epochs in the source's loop, batches if stepped per batch;
  - Gradient clipping by global norm: if ‖g‖ > c over all parameters concatenated, replace g by c·g/‖g‖;
  - … and 2 more points
- **s10 Normalisation layers** (15 min). Explain what batch norm, layer norm and RMSNorm compute, how batch norm behaves differently at training and evaluation time, and why normalisation makes training easier. _3 worked example(s), 1 figure(s)._
  - Batch normalisation (Ioffe and Szegedy 2015), per feature j over the mini-batch: μ_B = (1/B)Σ_i z_ij, σ²_B = (1/B)Σ_i (z_ij − μ_B)², ẑ = (z − μ_B)/√(σ²_B + ε), y = γẑ + …
  - Training against evaluation: in training mode it uses the batch's statistics and updates running averages, μ_run ← (1 − m)μ_run + mμ_B and likewise for the variance …
  - Consequences (source): an example's output depends on the other examples in its batch;
  - The bias of the layer in front of a batch norm is redundant (the mean subtraction removes it and β replaces it), hence bias=False in Module 03's code.
  - Why it helps: the original argument (reducing 'internal covariate shift') has been challenged;
  - Layer normalisation (Ba et al.
  - … and 2 more points
- **s11 Regularisation for networks** (15 min). Cover the regularisers specific to training networks — weight decay, dropout, early stopping, augmentation, label smoothing — with what each does to the gradient and when each fails. _4 worked example(s), 1 figure(s)._
  - Recall Module 01: regularisation trades variance for bias and is tuned on the validation set.
  - Weight decay via AdamW (s8): typical λ from 10⁻⁴ to 10⁻¹ depending on the optimiser and its convention;
  - Dropout (Srivastava et al.
  - Why it works: the network cannot rely on any single unit, and training samples from 2^n thinned networks that share weights.
  - Typical p: up to 0.5 in older MLPs and AlexNet's fully connected layers;
  - Early stopping: evaluate the validation loss every epoch, keep the best checkpoint, stop after a patience of several epochs without improvement.
  - … and 4 more points
- **s12 Losses and numerical stability** (14 min). Compute losses so that nothing overflows or underflows, and know the floating-point formats well enough to predict where training will break. _5 worked example(s), 1 figure(s)._
  - Floating-point formats with their sign/exponent/mantissa bits: fp32 (1/8/23): largest 3.40×10³⁸, smallest normal 1.18×10⁻³⁸, smallest subnormal 1.4×10⁻⁴⁵, machine …
  - Derive the log-sum-exp identity: Σ_j e^(z_j) = e^m Σ_j e^(z_j − m) for any m, so log Σ_j e^(z_j) = m + log Σ_j e^(z_j − m) — Module 01's observation that adding a …
  - Cross-entropy from logits: ℓ = logsumexp(z) − z_y, and log_softmax(z) = z − logsumexp(z).
  - Why never log(softmax(z)) in two steps: softmax can underflow to exactly 0 for a very negative logit, and log 0 = −∞ gives an infinite loss and NaN gradients, while …
  - The binary case: BCEWithLogitsLoss computes ℓ = max(z, 0) − zy + log(1 + e^(−\|z\|)) from the logit.
  - Regression (source): squared error punishes outliers quadratically (Module 01: it is the Gaussian negative log-likelihood);
  - … and 3 more points
- **s13 A complete training loop** (9 min). Put every piece of the module into one short PyTorch training loop and say which section justifies each line, so that the loop can be read rather than copied. _1 worked example(s), 1 figure(s)._
  - Reproduce the source's §10 loop unchanged: torch.manual_seed(0);
  - Annotate every line with its justification: the seed (reproducibility;
  - Two reading notes: the printed loss is the last mini-batch's loss, which is noisy (0.0069, 0.0205, 0.0056, 0.0107 at epochs 100–400) — log the epoch mean instead;
  - The same model written as an nn.Module subclass — __init__ creates the layers as attributes, forward composes them — in six lines.
  - The baseline that gives the number its meaning: logistic regression on the same standardised inputs reaches 59.2% validation accuracy, exactly the majority-class rate, …
- **s14 Training dynamics and debugging** (16 min). Turn a misbehaving run into a diagnosis: what to test before training, what to watch during it, how to read the curves, and a checklist to work through. _5 worked example(s), 1 figure(s)._
  - Before training, four cheap tests.
  - Gradient checking done properly: the central difference (𝓛(θ + ε) − 𝓛(θ − ε))/(2ε) has truncation error ≈ 𝓛'''ε²/6 and rounding error ≈ u\|𝓛\|/ε, minimised near ε = …
  - During training, log and plot on shared x-axes: the training loss (epoch mean, log scale), the validation loss and metric every epoch, the learning rate, and the global …
  - Reading the curves (the source's list, extended): loss flat from the start → learning rate far too small, or no gradient (a bug, a detached tensor, dead units, labels …
  - Noise in the measurement: a test accuracy p on n examples has standard error √(p(1 − p)/n);
  - The checklist, in order: 1 look at the data;
- **What goes wrong.** 14 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: Backpropagation by hand in NumPy | 40 | ~1 min | none | Implement the forward and backward pass of a two-layer MLP in NumPy, verify every gradient entry against finite differences, cross-check against PyTorch, train it on y = sin 3x, … |
| lab2: A scalar autodiff engine in about 100 lines | 40 | ~2 min | none | Build reverse-mode automatic differentiation from scratch — a Value class that records the graph and back-propagates adjoints — verify it by hand, against finite differences and … |
| lab3: Optimisers, schedules and the range test | 35 | ~1 min | none | Find learning rates with a range test, compare SGD, momentum, Nesterov, Adam and AdamW on the same network and data, measure what a schedule does to the noise floor, and verify … |
| lab4: Digits, honestly: a complete PyTorch training run | 35 | ~1 min | none | Train an MLP classifier on handwritten digits under a proper train/validation/test protocol: sanity checks before training, early stopping on the validation loss, per-layer … |
| lab5: Debugging clinic: four broken training scripts | 35 | ~2 min | none | Diagnose and fix four training scripts that run without errors but are wrong, using their symptoms and the checklist of s14. |

**Exercises** (15: 8 ★, 6 ★★, 1 ★★★; 130 minutes).

- e1 ★ conceptual, 5 min: A colleague trains a network with three hidden layers of 64 units but forgot the activation functions.
- e2 ★★ derivation, 15 min: A network has three layers: z⁽¹⁾ = W⁽¹⁾⊤x + b⁽¹⁾, h⁽¹⁾ = tanh z⁽¹⁾;
- e3 ★ conceptual, 5 min: s1 compares the sawtooth t^k, the tent map t(x) = 2ReLU(x) − 4ReLU(x − ½) composed with itself k times, with a one-hidden-layer ReLU network that …
- e4 ★★ calculation, 10 min: For f(x₁, x₂) = x₁²x₂ + exp(x₁x₂) at (x₁, x₂) = (1, 2): (a) write the computational graph with named intermediate variables;
- e5 ★★ derivation, 10 min: (a) Using δ⁽ˡ⁾ = (W⁽ˡ⁺¹⁾δ⁽ˡ⁺¹⁾) ⊙ φ'(z⁽ˡ⁾), show that a ReLU unit whose pre-activation is negative for every training example receives zero gradient …
- e6 ★ conceptual, 5 min: A deep stack of square ReLU layers (n_in = n_out = n, no normalisation) is initialised in three ways: He normal (σ_w² = 2/n_in), Glorot normal (σ_w² …
- e7 ★★ calculation, 10 min: For 𝓛(θ) = ½(θ₁² + 64θ₂²): (a) the largest stable learning rate for gradient descent;
- e8 ★★ calculation, 10 min: Run Adam by hand for two steps on one parameter with gradients g₁ = 1 and g₂ = 3, β₁ = 0.9, β₂ = 0.999, ε negligible, learning rate η.
- e9 ★ conceptual, 5 min: In three or four sentences: why is L2 regularisation added to the gradient (torch.optim.Adam(weight_decay=λ)) not the same as AdamW's decoupled …
- e10 ★ conceptual, 5 min: Inverted dropout with drop probability p = 0.4: (a) by what factor are surviving activations scaled during training? (b) Show that the expected value …
- e11 ★★ calculation, 10 min: (a) Derive log Σ_j e^(z_j) = m + log Σ_j e^(z_j − m) for any m, and explain why m = max_j z_j makes the right-hand side safe from both overflow and …
- e12 ★ conceptual, 5 min: A 10-class network ends in a softmax layer, and its outputs are passed to F.cross_entropy, which applies log-softmax again.
- e13 ★ conceptual, 5 min: Three gradient checks of hand-written backward passes, each using central differences and the per-entry relative error \|a − n\|/max(10⁻⁸, \|a\| + \|n\|).
- e14 ★ conceptual, 5 min: Name the most likely cause and the first thing to try for each run of a 10-class classifier: (a) the loss starts at 2.30 and stays there;
- e15 ★★★ coding, 25 min: In Lab 1's NumPy network, implement Adam with bias correction as a drop-in replacement for the update line.

**Quiz** (12 questions): What does the universal approximation theorem guarantee for a network with one …; In a batch of B = 32, layer l has input H⁽ˡ⁻¹⁾ ∈ ℝ^(32×100), weights W⁽ˡ⁾ ∈ …; A scalar loss depends on n = 10⁶ parameters.; Which property made ReLU the default hidden activation over the sigmoid in deep …; Why does He initialisation use Var(w) = 2/n_in for ReLU layers, twice the …; Heavy-ball momentum with μ = 0.9 receives one gradient component that is …; Adam with β₁ = 0.9 and β₂ = 0.999 takes its first step without bias correction.; Why is L2 regularisation added to the gradient not the same as AdamW's …; A network with batch normalisation is evaluated after model.eval().; Inverted dropout with p = 0.25 is applied to a hidden activation h.; Why is bf16 usually preferred to fp16 for training without loss scaling?; A new 10-class classifier starts training at a loss of 47 instead of about 2.3.

**Guided reading.**

- Rumelhart, D. E., Hinton, G. E., Williams, R. J. "Learning representations by back-propagating errors." Nature 323, 533–536, 1986. (15 min). The four-page letter that made backpropagation the way networks are trained.
- Glorot, X., Bengio, Y. "Understanding the difficulty of training deep feedforward neural networks." AISTATS, 2010. (20 min). The experimental paper behind Xavier initialisation.
- Loshchilov, I., Hutter, F. "Decoupled weight decay regularization." ICLR, 2019. (15 min). The paper behind AdamW, which is what 'Adam' means in modern practice.

**Interactive widgets.**

- `mlp-playground` (in s1): A hidden layer learns its own features: each ReLU unit is a half-plane ramp, the output adds them, and the decision boundary becomes whatever polygon those features allow;
- `optimiser-paths` (in s7): On an ill-conditioned valley, gradient descent must take steps small enough for the steep direction and so crawls along the shallow one;

**Key terms:** 30 English–Chinese pairs. **References:** 44.

### Module 03: Convolutional networks

The convolutional network built from the operation up: a convolution computed by hand and in code, the cost of every layer counted, the residual connection that made depth trainable, and the same machinery used to detect objects, to segment images and volumes into measured surfaces, and to check what a classifier is actually looking at.

**Before you start:** Module 01: the supervised learning set-up, cross-entropy from maximum likelihood, train, validation and test splits with leakage, and the bias–variance decomposition; Module 02: MLPs, backpropagation in matrix form, He initialisation, Adam and AdamW with learning-rate schedules, batch and layer normalisation, and the overfit-one-batch debugging habit; Linear algebra: matrix–vector products, transposes, and sparse and banded matrices; Calculus: partial derivatives and the chain rule over indexed sums; Python: NumPy slicing and broadcasting, a PyTorch `nn.Module`, and the training loop of Module 02, Section 13.

**You will be able to:**

- Compute a 2D convolution (in deep learning, a cross-correlation) by hand on a small image, implement it in NumPy with explicit loops and with im2col, and match `torch.nn.functional.conv2d` to floating-point round-off.
- Derive the output size $\lfloor (H + 2p - d(k-1) - 1)/s \rfloor + 1$ for any padding, stride and dilation, compute a network's receptive field layer by layer, and explain why the effective receptive field is smaller.
- Count the parameters, multiply-accumulates, FLOPs and activation memory of a standard, $1 \times 1$, grouped or depthwise-separable convolution, and say which convention a paper's "FLOPs" follow.
- Derive why identity shortcuts keep the gradient alive in a deep network, and reproduce the degradation of a 55-layer plain network and its residual fix.
- Name the one idea that each of LeNet, AlexNet, VGG, Inception, ResNet, DenseNet, MobileNet, EfficientNet and ConvNeXt contributed, check their headline parameter counts, and place the vision transformer relative to them.
- Choose label-preserving augmentations, a normalisation suited to the batch size and a transfer strategy (which layers to keep, linear probe or fine-tuning) for a small dataset, and justify each choice with measurements.
- Compute IoU, non-maximum suppression and average precision by hand, and explain anchors, the focal loss and the difference between one-stage and two-stage detectors.
- Train a U-Net, evaluate it with Dice and IoU ($D = 2J/(1 + J)$), and turn a predicted mask into area, perimeter, volume and surface-area measurements whose biases you can state.
- Compute Grad-CAM from its definition, use it to expose a classifier that relies on a spurious cue, and state what such maps cannot show.
- Estimate the parameter, compute and memory cost of 1D and 3D convolutional networks, including why 3D models train on patches with group normalisation.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. Convolution, by hand | Read Sections 1–2 with the convolution explorer: why images need their own architecture, and the convolution operation. (33); Lab 1, steps 1–4: a convolution by explicit loops, checked by hand, against SciPy and for translation equivariance. (12); Read Section 3 with the receptive-field builder: output size, padding, stride, dilation and the receptive field. (18); Exercise 1: output sizes, and the rows a window never reads. (10); Read Section 4: channels, parameters, MACs and FLOPs. (17); Lab 1, steps 5–8: every padding, stride and dilation against PyTorch, im2col, and what the loop costs. (18); Exercises 2–3: three ways to a $9 \times 9$ receptive field, and the receptive field of ResNet-18. (20) |
| 2. Pooling, cheaper convolutions and the classic networks | Read Sections 5–6: pooling and invariance, then $1 \times 1$, grouped and depthwise-separable convolutions. (27); Exercise 5: the cost ratio of a depthwise-separable layer, and why larger depthwise kernels are cheap. (10); Lab 2: a CNN against an MLP at equal parameter count, with permuted, shifted and translated digits. (30); Exercise 4: why global average pooling beat a flatten head in Lab 2. (5); Read Sections 7–8: the classic architectures from LeNet to Inception, then residual networks. (33); Exercise 6: the gradient through the original residual block. (10) |
| 3. Depth in practice, modern designs and training | Lab 3: inside a ResNet, counting its cost, measuring its receptive fields and reproducing the depth experiment. (35); Guided reading: He et al. (2016), "Deep residual learning for image recognition". (25); Read Sections 9–10: efficient and modern CNNs, then augmentation, normalisation and transfer learning. (31); Lab 4: transfer learning layer by layer, from digits 0–4 to digits 5–9. (25); Exercises 7–8: augmentations that keep the label, and which layers transfer. (10) |
| 4. Detection and segmentation | Read Section 11: detection with boxes, anchors, IoU, non-maximum suppression and average precision. (17); Exercises 9–10: why the focal loss, and IoU, NMS and average precision by hand. (15); Read Section 12: segmentation with the FCN, the transposed convolution, U-Net and Dice. (17); Lab 5: a U-Net on synthetic images with and without skips, and from mask to measurement. (45); Guided reading: Ronneberger et al. (2015), "U-Net". (20); Exercise 11: leakage between the slices of one volume. (5) |
| 5. Volumes, looking inside, and review | Read Section 13: 1D and 3D convolution, and from masks to measured surfaces. (18); Exercises 12–14: normalisation for small batches, 3D activation memory at batch 4, and a second ellipsoid's error budget. (40); Read Section 14: filters, saliency maps and Grad-CAM. (15); Lab 6: Grad-CAM catches a classifier that learned a shortcut. (25); Exercise 15: what a Grad-CAM map does and does not prove. (5); Self-check quiz. (15); Review the summary, the what-goes-wrong list and the key terms. (10) |

**Concept sections.**

- **s1 Images are not vectors** (14 min). Show why a dense network is the wrong architecture for images and derive the convolution layer from two assumptions, locality and stationarity, with the parameter counts that make the case. _3 worked example(s), 2 figure(s)._
  - The count from the source: a 224x224 colour image is 224*224*3 = 150,528 numbers;
  - Locality: a pixel's meaning depends far more on its neighbours than on distant pixels;
  - Stationarity: the statistics of small patches are the same everywhere in the image, so a detector useful at one position is useful at every position;
  - The progression at a fixed output of 224x224x64 from a 224x224x3 input with 3x3 windows: dense layer 150,528 x 3,211,264 = 4.83e11 weights;
  - Statistical strength: every shared weight receives a gradient contribution from all 50,176 positions of every training image, so one image informs a filter as much as …
  - Definitions written out: a translation T_tau shifts an image by tau = (tau1, tau2);
  - … and 2 more points
- **s2 The convolution operation** (19 min). Define the operation exactly, compute it by hand, prove its translation equivariance, and write it as a matrix so that its backward pass and the transposed convolution follow. _3 worked example(s), 3 figure(s), widget: convolution-explorer._
  - The single-channel definition with bias, indices from 0 and the output index at the window's top-left corner: Y_{i,j} = b + sum_{u=0}^{k-1} sum_{v=0}^{k-1} K_{u,v} …
  - Cross-correlation versus convolution: the mathematical convolution (K * X)_{i,j} = sum K_{u,v} X_{i-u, j-v} flips the kernel;
  - Hand-designed kernels and the sum-of-weights rule: box blur (all 1/9, sum 1, preserves flat regions), Gaussian blur (1/16)[[1,2,1],[2,4,2],[1,2,1]] (sum 1), sharpen …
  - Equivariance proved in two lines: with (T_tau X)_{i,j} = X_{i-tau1, j-tau2}, (K star T_tau X)_{i,j} = sum K_{u,v} X_{i+u-tau1, j+v-tau2} = (K star X)_{i-tau1, j-tau2} = …
  - The convolution as a matrix: in 1D a length-5 input and the kernel (1, 2, 3) give the 3x5 banded (Toeplitz) matrix with rows (1,2,3,0,0), (0,1,2,3,0), (0,0,1,2,3);
  - The backward pass follows from the matrix form: if y = Mx then dL/dx = M^T dL/dy, and applying M^T is a 'full' convolution with the kernel, the transposed convolution …
  - … and 1 more points
- **s3 Output size, padding, stride, dilation and the receptive field** (18 min). Derive the shape arithmetic every architecture diagram relies on, and compute how far each output unit can see. _4 worked example(s), 3 figure(s), widget: receptive-field-builder._
  - Derive the output size by counting window positions along one axis: after padding there are H + 2p positions;
  - 'Same' padding: s = 1 and p = d(k-1)/2 keep H_out = H;
  - Stride 2 with k = 3 and p = 1 maps an even H to H/2 (floor((H-1)/2) + 1 = H/2) and an odd H to (H+1)/2: 'stride 2 halves it' (source), with the odd case stated.
  - The floor discards input silently: H = 11, k = 3, p = 0, s = 3 gives 3 outputs that read columns 0-8;
  - Padding modes: zero (the default), reflect, replicate, circular.
  - Dilation: the kernel samples every d-th input;
  - … and 5 more points
- **s4 Channels, parameters and FLOPs** (17 min). Generalise to many channels, write the layer as one matrix multiply, and count parameters, multiply-accumulates, FLOPs and memory so that any architecture table can be checked. _5 worked example(s), 3 figure(s)._
  - The multi-channel equation (source): Y_{c,i,j} = b_c + sum_{c'=1}^{C_in} sum_{u,v} K_{c,c',u,v} X_{c', i+u, j+v};
  - Each output channel is one filter spanning all input channels;
  - im2col: unfold every k x k x C_in window into a column of length C_in k^2, giving a (C_in k^2) x (H_out W_out) matrix;
  - Counting: parameters k^2 C_in C_out + C_out;
  - Conventions, stated once for the module: counts are MACs, and FLOPs = 2 x MACs, with bias additions and activations left out unless stated;
  - Where parameters and compute live (source: parameters are cheap in convolutions;
  - … and 3 more points
- **s5 Pooling, downsampling and invariance** (13 min). Explain how networks reduce resolution, why that buys only approximate translation invariance, and how global average pooling lets a network take any input size. _3 worked example(s), 2 figure(s)._
  - Max pooling, 2x2 with stride 2 (source): halves H and W, keeps the strongest response, has no parameters;
  - Average pooling; global average pooling (GAP) collapses each channel's map to one number, C x H x W -> C, replacing the giant dense layers of early networks and letting …
  - Strided convolution as learned downsampling (source: modern networks often downsample with a strided convolution, letting the layer learn what to keep): ResNet's stage …
  - Invariance is approximate: a stride-2 operation is equivariant only to shifts by multiples of 2, and a one-pixel shift can change every pooled value (worked example).
  - Measured in Lab 2: on 8x8 digits a CNN with two 2x2 max pools and a flatten-dense head drops from about 98.4% to 67% accuracy when test images move one pixel to the …
  - Why downsample: each 2x reduction cuts the FLOPs of later layers by 4;
- **s6 Cheaper convolutions: 1x1, grouped and depthwise-separable** (14 min). Show how to mix channels cheaply and how to factorise a convolution, with the cost saving derived, because every efficient architecture in s7-s9 is built from these pieces. _3 worked example(s), 2 figure(s)._
  - 1x1 convolution (source): Y_{c,i,j} = b_c + sum_{c'} W_{c,c'} X_{c',i,j}, a dense layer applied independently at every pixel;
  - Bottlenecks (source: Inception and later designs): reduce channels with a 1x1 before an expensive k x k and expand after;
  - Grouped convolution (AlexNet's two-GPU split;
  - Depthwise convolution: g = C_in = C_out, one k x k filter per channel, k^2 C parameters.
  - Depthwise-separable convolution (source): depthwise k x k followed by pointwise 1x1.
  - What is given up: each output channel's spatial filter becomes a combination of C_in fixed per-channel spatial filters, a restricted family.
  - … and 1 more points
- **s7 The classic architectures: LeNet, AlexNet, VGG and Inception** (16 min). Read the first four landmark networks as a sequence of single ideas, each checkable with the counting tools of s3-s6. _3 worked example(s), 2 figure(s)._
  - How to read an architecture table: per layer, output shape, kernel and stride, parameters and MACs, each confirmed with the formulas of s3-s4.
  - LeNet-5 (LeCun et al.
  - AlexNet (Krizhevsky et al.
  - VGG (Simonyan and Zisserman 2015): only 3x3 convolutions (stride 1, padding 1) and 2x2 max pools, channels 64 -> 512, 16-19 weight layers;
  - Inception / GoogLeNet (Szegedy et al.
  - How the headline numbers are defined (Russakovsky et al.
  - … and 1 more points
- **s8 Residual networks** (17 min). Explain the degradation problem, the residual block and the gradient argument for why depth stopped being an obstacle, using the block every later architecture, the transformer included, reuses. _3 worked example(s), 3 figure(s)._
  - The degradation problem (He et al.
  - The residual block (source): h_{l+1} = h_l + F(h_l), with F two 3x3 convolution-BN(-ReLU) layers (basic block) or 1x1-3x3-1x1 (bottleneck);
  - Identity is easy (source): initialise the last layer of F near zero - in practice set the last batch norm's gamma to 0 (Goyal et al.
  - The gradient argument written out (He et al.
  - Scalar illustration: per-layer gain 0.9 over 50 layers gives 0.9^50 = 0.0052;
  - Measured in Lab 3 on 8x8 digits (16-channel 3x3 layers): at initialisation without normalisation, the gradient reaching the stem of a plain network is 1.4e-5 at 9 …
  - … and 5 more points
- **s9 Efficient and modern CNNs, and where vision transformers fit** (14 min). Show how the post-ResNet designs trade accuracy against cost, how training recipes confound architecture comparisons, and where the vision transformer sits relative to CNNs. _3 worked example(s), 2 figure(s)._
  - MobileNet (Howard et al.
  - MobileNetV2 (Sandler et al.
  - EfficientNet (Tan and Le 2019), compound scaling (source: scale depth, width and resolution together by a fixed ratio): depth d = alpha^phi, width w = beta^phi, …
  - ConvNeXt (Liu et al. 2022;
  - The lesson for reading papers: compare architectures only under the same training recipe;
  - The vision transformer, as a pointer only: two sentences and a link to Module 06, Section 8, which owns it, including the patch-embedding parameter count.
  - … and 1 more points
- **s10 Training a CNN: augmentation, normalisation and transfer learning** (17 min). Give the practical recipe for training a CNN on a small engineering dataset, with measurements that show when each ingredient helps and when it does not. _3 worked example(s), 3 figure(s)._
  - Augmentation as the most effective regulariser for images (source), with the rule that every transform must leave the label true (source: a vertical flip of a digit is a …
  - Mixing methods (source): mixup x~ = lambda x_i + (1 - lambda) x_j, y~ = lambda y_i + (1 - lambda) y_j with lambda ~ Beta(a, a), a around 0.2;
  - Augmentation must describe variation the deployment data contain.
  - Input normalisation (source): subtract the training set's per-channel mean and divide by its standard deviation;
  - Batch normalisation in CNNs (source;
  - Transfer learning (source): a backbone pretrained on a large generic dataset has learned edge, texture and shape detectors that transfer;
  - … and 3 more points
- **s11 Detection: boxes, anchors, IoU and NMS** (17 min). Show how a CNN becomes an object detector, with the geometry, the losses and the post-processing written out, so that a detection paper's design choices can be read. _5 worked example(s), 4 figure(s)._
  - The task (source: detection places boxes around objects): output a set of (box, class, score);
  - Intersection over union: IoU = \|A intersect B\| / \|A union B\|, the intersection's corners being the larger of the two minima and the smaller of the two maxima.
  - Anchors: at each feature-map position, k reference boxes of several scales and aspect ratios (Faster R-CNN: 3 scales x 3 ratios = 9).
  - The loss (source: classification plus box regression): a classification term over all anchors (cross-entropy or focal) plus a box term (smooth L1 on t, or an IoU-based …
  - Two-stage detectors (source: propose regions and classify them;
  - One-stage detectors (source: predict boxes on a grid in one pass;
  - … and 3 more points
- **s12 Segmentation: FCN, transposed convolution, U-Net and Dice** (17 min). Show how a CNN labels every pixel, why U-Net's skip connections preserve boundaries, and how segmentation is trained and scored. _5 worked example(s), 3 figure(s)._
  - Semantic segmentation labels every pixel (source);
  - The fully convolutional network (Long et al.
  - Upsampling (source): interpolation followed by a convolution, or a transposed convolution, which scatters each input value through the kernel - the gradient of a strided …
  - U-Net (Ronneberger et al.
  - Measured in Lab 5 (synthetic images;
  - Losses and metrics: Dice D = 2\|P intersect G\|/(\|P\| + \|G\|) = 2TP/(2TP + FP + FN);
  - … and 2 more points
- **s13 Signals and volumes: 1D and 3D convolution, and from masks to surfaces** (18 min). Carry convolution to signals and volumes, count what 3D costs, and follow an engineering pipeline from a microscopy or CT volume to a measured surface with its error budget. _6 worked example(s), 3 figure(s)._
  - 1D convolution slides a kernel along a signal (source): sensor streams, the observation series of a digital twin, spectra.
  - Dilated causal stacks (source: WaveNet's design covers thousands of samples with few layers): kernel 2 with dilations 1, 2, 4, ..., 512 gives a receptive field of 1,024 …
  - 3D convolution (source): a k x k x k kernel through a volume;
  - Present the source's Down3D block (Conv3d - GroupNorm(8) - ReLU twice, then max_pool3d, returning the pre-pool map for the skip) and count it for 1 -> 32 channels: 896 + …
  - Memory is the binding constraint in 3D (worked example): volumes are processed in patches (source) with batch 1-2, which is why group norm replaces batch norm.
  - Patch-based (sliding-window) inference: tile the volume with overlapping patches, predict, and blend the overlaps (average or Gaussian-weighted) to avoid seams;
  - … and 4 more points
- **s14 Looking inside: filters, saliency and Grad-CAM** (15 min). Give the cheap tools for checking what a CNN uses, derive Grad-CAM, and state what such maps can and cannot show. _3 worked example(s), 3 figure(s)._
  - Early filters learn edges and colour blobs;
  - The saliency map (source;
  - Grad-CAM derived (Selvaraju et al.
  - Relation to CAM (Zhou et al.
  - Resolution: the map is as coarse as the last convolutional layer (7x7 for ResNet-50 at 224x224;
  - The use that matters (source): the sanity check that a classifier is looking at the object and not at a background it happened to co-occur with, the most common way an …
  - … and 2 more points
- **What goes wrong.** 14 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: Convolution from scratch | 30 | ~1 min | none | Implement a 2D convolution layer twice in NumPy - with explicit loops and with im2col and one matrix multiply - and show that both match torch.nn.functional.conv2d for every … |
| lab2: A CNN against an MLP: what the inductive bias buys | 30 | ~2 min | none | Measure, at equal parameter count, what convolution's assumptions are worth on digits, by breaking them (a fixed pixel permutation, one-pixel shifts) and by making them matter … |
| lab3: Inside a ResNet: counting, receptive fields and depth | 35 | ~3 min | none | Check the module's counting formulas on SmallResNet with forward hooks, compute its receptive field in code and empirically, and reproduce the degradation problem and its residual … |
| lab4: Transfer learning, layer by layer | 25 | ~2 min | none | Pretrain a small CNN on digits 0-4, adapt it to digits 5-9 from 5 or 20 labelled images per class, and measure which layers transfer - early blocks kept, a frozen backbone (linear … |
| lab5: U-Net segmentation on synthetic images, and from mask to measurement | 45 | ~3 min | none | Train a small U-Net to segment circles but not rectangles in synthetic microscopy-like images, measure what its skip connections contribute at boundaries, evaluate with Dice and … |
| lab6: Grad-CAM catches a shortcut | 25 | ~2 min | none | Train two small CNNs to tell circles from squares - one on data where a corner marker gives the answer away, one on clean data - and use a saliency map and Grad-CAM, implemented … |

**Exercises** (15: 7 ★, 7 ★★, 1 ★★★; 130 minutes).

- e1 ★★ calculation, 10 min: A 7x7 single-channel input is convolved with a 3x3 kernel.
- e2 ★★ derivation, 10 min: Show that n stacked k x k convolutions with stride 1 have the receptive field of one convolution of size n(k - 1) + 1.
- e3 ★★ calculation, 10 min: ResNet-18 at 224x224 begins with the stem of s3's worked example (a 7x7 stride-2 convolution with padding 3, then a 3x3 stride-2 max pool with …
- e4 ★ conceptual, 5 min: In Lab 2, on digits placed at random on a 16x16 canvas, a CNN ending in global average pooling reached about 0.93 while the same convolutions with a …
- e5 ★★ derivation, 10 min: Derive the ratio of multiply-accumulates of a depthwise-separable k x k convolution (depthwise, then pointwise) to a standard k x k convolution with …
- e6 ★★ derivation, 10 min: (a) The original residual block applies a ReLU after the addition: h_{l+1} = ReLU(h_l + F_l(h_l)).
- e7 ★ conceptual, 5 min: For each dataset, which of these augmentations preserve the label: horizontal flip, vertical flip, 90-degree rotation, rotation within +/-10 degrees, …
- e8 ★ conceptual, 5 min: In Lab 4 a network pretrained on digits 0-4 transferred well when only its first block was kept, and badly as a frozen feature extractor.
- e9 ★ conceptual, 5 min: A one-stage detector scores about 20,000 anchors per image, of which perhaps 10 overlap an object.
- e10 ★★ calculation, 10 min: Boxes are (x1, y1, x2, y2), all of one class: A = (0,0,8,8) with score 0.9, B = (2,0,10,8) with 0.85, C = (20,20,28,28) with 0.7, D = (3,3,11,11) …
- e11 ★ conceptual, 5 min: A team segments liver tumours on CT: 40 patients with 100 annotated slices each and a 2D U-Net.
- e12 ★ conceptual, 5 min: A 3D U-Net trains on 64^3 patches with a batch of 2;
- e13 ★★ calculation, 10 min: A 3D U-Net encoder has four levels with 32, 64, 128 and 256 channels, each level halving every spatial dimension;
- e14 ★★★ project, 25 min: Volumes from masks, with an error budget, on a second object (s13 worked through a first one).
- e15 ★ conceptual, 5 min: A colleague shows Grad-CAM maps from a crack classifier on concrete images;

**Quiz** (12 questions): A 3x3 convolution maps 32 input channels to 64 output channels, with bias.; Input width 64, kernel 3, dilation 2, padding 1, stride 1.; With circular padding, which of these is exactly equivariant to a one-pixel …; Four 3x3 convolutions are stacked;; A standard 3x3 convolution with 256 input and 256 output channels is replaced …; In a network of residual blocks h_{l+1} = h_l + F(h_l), why does the gradient …; You freeze a pretrained backbone with requires_grad=False, train a new head …; Two 10x10 boxes overlap, one offset from the other by 5 pixels in x and 5 in y.; What does non-maximum suppression do?; Why does U-Net concatenate encoder feature maps into its decoder?; In a dataset where 0.6% of pixels are foreground, a model predicts background …; In Grad-CAM, the weight alpha_k^c of feature map k for class c is:

**Guided reading.**

- He, K., Zhang, X., Ren, S., Sun, J. "Deep residual learning for image recognition." CVPR, 2016. (25 min). The paper that made depth trainable.
- Ronneberger, O., Fischer, P., Brox, T. "U-Net: Convolutional networks for biomedical image segmentation." MICCAI, 2015. (20 min). Eight pages that set the standard architecture for biomedical segmentation;

**Interactive widgets.**

- `convolution-explorer` (in s2): One output value is one multiply-accumulate of the kernel with one window;
- `receptive-field-builder` (in s3): Each layer adds (k - 1) d times the product of earlier strides to the receptive field, so stride-1 stacks grow it slowly, downsampling and dilation grow it fast, and most of the influence still sits …

**Key terms:** 31 English–Chinese pairs. **References:** 55.

### Module 04: Recurrent networks and sequences

Recurrent networks built from the equations up: the state, backpropagation through time and why its gradients vanish, the LSTM and GRU that fixed it, honest forecasting and monitoring of engineering sensor streams, the encoder–decoder whose bottleneck produced attention, and why the transformer replaced recurrence before linear recurrences and state-space models brought it back.

**Before you start:** Module 01: the supervised set-up, squared-error and cross-entropy losses, linear regression by least squares, honest evaluation with leakage, and the rule that every number carries its baseline; Module 02: backpropagation with error signals, initialisation, Adam and AdamW, gradient clipping, dropout, layer normalisation and debugging a training run; Module 03: 1D and dilated convolution, receptive-field arithmetic and residual connections; Linear algebra: eigenvalues and eigenvectors, diagonalisation, singular values and the spectral norm; Calculus: the multivariate chain rule and Jacobian matrices; Complex numbers: modulus, argument and $e^{i\theta}$, for Section 13 only; Probability: the softmax, categorical distributions and the log-likelihood; Python with NumPy, and basic PyTorch: tensors, autograd, `nn.Module` and a training loop.

**You will be able to:**

- Write the vanilla RNN with its shapes, unroll it, and count its parameters for given sizes, including PyTorch's double-bias convention.
- Derive backpropagation through time for a vanilla RNN and compute a three-step gradient by hand that agrees with finite differences.
- Predict from a recurrent matrix's eigenvalues and singular values, and from the nonlinearity, whether gradients vanish or explode over a given lag, and say what clipping and orthogonal initialisation do and do not fix.
- Write the LSTM and GRU equations, show why the cell state's additive update preserves the gradient, and set the forget-gate bias $b_f$ in PyTorch for a target memory half-life $\ln 0.5/\ln\sigma(b_f)$.
- Implement and gradient-check a character-level RNN in NumPy, and diagnose from its samples which structure it has and has not learned.
- Evaluate a forecaster with walk-forward validation against naive, seasonal-naive and linear baselines, find and fix time leakage and level drift, and choose between recursive and direct multi-step forecasting.
- Build a residual-based monitor for a sensor stream, set its thresholds on held-out normal data, and match a detector to each fault type.
- Build an encoder–decoder with Bahdanau attention, train it with teacher forcing, decode it greedily and with beam search, and read its alignment plot.
- Explain with numbers why the transformer replaced recurrent networks (parallelism and path length) and what recurrence keeps (a constant per-token state).
- Show that a linear time-invariant recurrence is a convolution with kernel $\mathbf{C}\mathbf{A}^k\mathbf{B}$, compute its zero-order-hold discretisation, and explain how Mamba's input-dependent step $\Delta_t$ turns it back into a gated recurrence.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. State and its gradient | Read Sections 1–2: sequences and their tasks, and the recurrent network. (32); Exercise 1: task shapes and causality. (5); Read Section 3: backpropagation through time. (20); Exercise 2: backpropagation through time by hand. (10); Lab 1: a character-level RNN from scratch in NumPy. (40); Read Section 4 with the gradient-flow explorer: vanishing and exploding gradients. (21) |
| 2. Gates and memory | Guided reading: Pascanu, Mikolov and Bengio (2013) on the difficulty of training recurrent networks. (20); Exercise 3: what clipping does and does not fix. (5); Read Sections 5–6: the LSTM, and the GRU, stacking and bidirectional networks. (36); Lab 2: watching gradients vanish, and the LSTM that does not. (40); Exercises 4–5: the LSTM cell path and forget bias, and parameter counts. (20) |
| 3. Forecasting and monitoring | Read Section 7: training recurrent networks in practice. (14); Exercise 6: padding and state. (5); Read Section 8: forecasting time series honestly. (21); Exercise 7: a leakage audit. (5); Read Section 9: monitoring sensor streams with forecast residuals. (14); Lab 3: forecasting and monitoring a sensor stream. (50); Exercise 8: false-alarm arithmetic. (10) |
| 4. Encoder, decoder and attention | Read Sections 10–11: sequence to sequence, and attention. (34); Lab 4: sequence to sequence with attention. (35); Guided reading: Bahdanau, Cho and Bengio (2015), the paper that introduced attention. (15); Read Section 12: why the transformer replaced recurrence. (12); Exercises 9–12: exposure bias, beam search by hand, attention by hand, and parallelism against state growth. (30) |
| 5. What came back, and review | Read Section 13 with the SSM kernel explorer: linear recurrences and state-space models. (21); Lab 5: a diagonal linear recurrence against an RNN and an LSTM. (25); Guided reading: Gu and Dao (2023), Mamba. (15); Exercises 13–15: an SSM kernel and its discretisation, choosing a model, and a TCN against the LSTM. (40); Self-check quiz of 12 questions. (15); Review the what-goes-wrong list, the summary and the key terms, and return to any check you missed. (10) |

**Concept sections.**

- **s1 Sequences and the tasks on them** (15 min). Define sequence data and the four task shapes, separate online (causal) from offline tasks, and show why a fixed-window MLP is the wrong default. _1 worked example(s), 2 figure(s)._
  - What makes data sequential: order carries meaning, lengths vary, and dependencies sit at different lags (a vibration sample depends on the excitation a few samples …
  - Notation: x_{1:T} = (x_1, ..., x_T) with x_t in R^{d_in};
  - Four task shapes, each with an engineering example: many-to-one (classify a whole 10-minute pump recording;
  - Online (causal) versus offline: may y_t depend on x_{>t}? Forecasting and monitoring must be causal;
  - The autoregressive factorisation p(x_{1:T}) = prod_t p(x_t \| x_{<t}): a model that predicts the next element is a generative model of sequences;
  - Why a fixed-window MLP is not enough (the source's argument, made quantitative): the window length w is a guess and anything older is invisible;
  - … and 3 more points
- **s2 The recurrent network** (17 min). Define the vanilla (Elman) recurrent network precisely, with shapes, unrolling, a forward pass computed by hand, parameter counts, and the character-level language model used in Lab 1. _2 worked example(s), 1 figure(s)._
  - Equations (from the source): h_t = φ(W_h h_{t-1} + W_x x_t + b), y_t = W_y h_t + c, φ = tanh by default, h_0 = 0 (or a learned vector).
  - Batched form in the (B, T, d) layout with row vectors: H_t = φ(H_{t-1} W_h^T + X_t W_x^T + b);
  - The same weights at every step;
  - Parameter count H(H + d_in + 1) + d_out(H + 1);
  - Loss: L = sum_t L_t(y_t, target_t) for aligned tasks (often averaged over steps and batch);
  - The character-level language model: x_t is a one-hot vector over V characters (implemented as a column lookup of W_x, or an embedding), y_t are logits over the next …
  - … and 3 more points
- **s3 Backpropagation through time** (20 min). Derive BPTT for the vanilla RNN, show the parameter gradient as a sum over time of products of Jacobians, and introduce truncated BPTT with its memory arithmetic. _2 worked example(s), 1 figure(s)._
  - Set-up: L = sum_t L_t;
  - Define δ_t = ∂L/∂h_t, the total derivative through y_t and through h_{t+1}.
  - Parameter gradients are sums over time because the weights are shared: ∂L/∂W_h = sum_t g_t h_{t-1}^T;
  - Unroll the recursion: with Jacobian J_k = ∂h_k/∂h_{k-1} = diag(φ'(z_k)) W_h, the contribution of L_T to the state at step t is ∂L_T/∂h_t = J_{t+1}^T J_{t+2}^T ...
  - Hence ∂L/∂W_h is a double sum over loss steps T and earlier steps t ≤ T of terms each containing a product of T - t Jacobians: short-range terms (few factors) and …
  - Cost: forward and backward each take about B·T·H^2 multiply-adds per layer for the recurrent part;
  - … and 4 more points
- **s4 Vanishing and exploding gradients** (21 min). Explain quantitatively why the product of Jacobians vanishes or explodes, what the spectrum and the nonlinearity each contribute, and what clipping and initialisation do and do not fix. _5 worked example(s), 2 figure(s), widget: gradient-flow-explorer._
  - Scalar linear case: ∂h_T/∂h_t = w^{T-t};
  - Linear vector case: for diagonalisable W_h = QΛQ^{-1}, repeated multiplication by W_h^T scales each eigen-component by λ_i^n: components with \|λ_i\| < 1 vanish, those …
  - Singular values give the bound: \|\|J_{t+1}^T ...
  - Non-normal matrices (a short box): ρ < 1 with σ_max > 1 gives transient growth before decay.
  - The nonlinearity: J_k = diag(φ'(z_k)) W_h with tanh' ≤ 1, equal to 1 only at z = 0.
  - Why vanishing is worse than it looks: the gradient on W_h sums short- and long-range terms;
  - … and 3 more points
- **s5 The LSTM: an additive memory path** (21 min). Present the LSTM equations, derive why the cell state's additive update preserves gradient, and give the practical facts that decide whether an LSTM trains: the forget-gate bias, PyTorch's conventions and the parameter … _3 worked example(s), 2 figure(s)._
  - Motivation: give the gradient a path whose per-step factor the network chooses and can hold near 1, instead of a fixed matrix power times φ'.
  - Equations (from the source) with [h_{t-1};
  - Derivation: ∂c_t/∂c_{t-1} = diag(f_t) + terms through h_{t-1}, since f_t, i_t and c̃_t depend on h_{t-1} = o_{t-1} ⊙ tanh(c_{t-1}).
  - History, corrected: the 1997 LSTM (Hochreiter and Schmidhuber) had input and output gates and a self-connection of fixed weight 1 (the carousel);
  - Forget-gate bias: σ(b_f) at initialisation is the default memory per step.
  - PyTorch conventions (writers must get these exactly right): weight_ih_l0 stacks the gates in the order i, f, g, o (g is the candidate c̃);
  - … and 3 more points
- **s6 The GRU, stacking and bidirectional networks** (15 min). Present the GRU and compare it honestly with the LSTM, then the two ways recurrent layers are composed, stacking and bidirectionality, and when each is allowed. _3 worked example(s), 2 figure(s)._
  - GRU equations (from the source): update gate z_t, reset gate r_t, candidate h̃_t = tanh(W[r_t ⊙ h_{t-1};
  - Convention warning: Cho et al.
  - Engineering reading: a first-order low-pass filter (exponential moving average) whose time constant is set per unit and per step by the input;
  - Parameter count: 3H(H + d_in + 1) with one bias;
  - Evidence: comparable on most tasks (Chung et al.
  - Stacking: layer l reads layer l-1's sequence of h_t;
  - … and 2 more points
- **s7 Training recurrent networks in practice** (14 min). Collect the engineering practice that decides whether a recurrent network trains: variable lengths, state handling, initialisation, regularisation, normalisation, clipping and debugging. _1 worked example(s), 1 figure(s)._
  - Variable lengths: pad to the batch maximum and mask the loss (and, later, attention scores);
  - A masked loss in one line: loss = (per_step_loss * mask).sum() / mask.sum().
  - State handling: stateless training resets h to 0 for every sequence (the default);
  - Initialisation: orthogonal W_h (Section 4);
  - Regularisation: dropout on inputs and between layers, not on the recurrent connection unless the same mask is used at every step (variational dropout, Gal and Ghahramani …
  - Normalisation: inputs per channel with training statistics (Module 01);
  - … and 4 more points
- **s8 Forecasting time series honestly** (21 min). Set up forecasting as supervised learning on windows and teach the evaluation discipline that makes its numbers trustworthy: time-ordered splits, walk-forward validation, baselines, per-window normalisation and the … _3 worked example(s), 2 figure(s)._
  - Framing: from a series x_1..x_N build windows x_{t-W+1..t} with targets x_{t+1} (one step) or x_{t+1..t+h} (h steps);
  - Four leaks in time: (1) shuffling overlapping windows before a random split, so near-copies of test windows sit in training (adjacent windows share W - 1 values) and the …
  - Walk-forward (rolling-origin) validation: an expanding or sliding training window, a validation block after it, refit, move the origin forward, repeat;
  - Baselines: naive or persistence (x̂_{t+h} = x_t, 'tomorrow equals today');
  - Normalising per series and per window: z-scoring with training statistics is not enough when the level drifts, because a network cannot extrapolate to a level it never …
  - Multi-step strategies: recursive (iterate a one-step model, feeding predictions back: errors compound, the forecasting form of exposure bias in Section 10);
  - … and 3 more points
- **s9 Monitoring sensor streams: anomalies from forecast residuals** (14 min). Turn a forecaster into a monitor for an asset or its digital twin: residuals, thresholds set on normal data, detectors matched to fault types, and how to measure a detector. _2 worked example(s), 1 figure(s)._
  - The idea (from the source): train a forecaster on normal operation;
  - Thresholds from held-out normal data (the source), never from training residuals, which are optimistically small.
  - Match detectors to fault types (Lab 3): a point test \|r_t\| > kσ catches spikes and onsets;
  - Evaluating a monitor: detection delay;
  - Multivariate monitoring: forecast every channel from all channels, form the residual vector and score it with the Mahalanobis distance under the residual covariance …
  - A published example of the pattern: LSTM forecasting of spacecraft telemetry channels with thresholds on smoothed prediction errors (Hundman et al.
  - … and 1 more points
- **s10 Sequence to sequence: encoder, decoder, teacher forcing and search** (17 min). Build the encoder-decoder for sequence tasks whose lengths differ, explain teacher forcing and exposure bias, and work through greedy and beam search. _1 worked example(s), 2 figure(s)._
  - The encoder-decoder (Sutskever, Vinyals and Le 2014;
  - Training maximises the log-likelihood of the target, L = -sum_t log p(y_t \| y_{<t}, x).
  - Exposure bias (the source;
  - Decoding: greedy (argmax at each step) does not find the most probable sequence;
  - Length bias: summed log-probabilities favour short outputs, and larger beams can produce shorter, worse outputs;
  - Sutskever et al. reversed the source sentence, which shortened the first dependencies the decoder needed: a symptom of the bottleneck.
  - … and 1 more points
- **s11 Attention: from a bottleneck to a soft alignment** (17 min). Derive additive (Bahdanau) and multiplicative (Luong) attention as the fix for the encoder-decoder bottleneck and show that it is the bridge to Module 06. _3 worked example(s), 2 figure(s)._
  - The fix (from the source): at each decoder step t, score the decoder state against every encoder annotation, normalise with a softmax, take the weighted sum as a context …
  - Shapes and cost: S encoder states of width 2H, decoder state of width H, attention width d_a;
  - Masking: padded encoder positions get score -∞ (in practice -1e9) before the softmax (Lab 4).
  - Alignment: α_{t,j} is a soft alignment, which source positions the decoder looks at while producing each output;
  - Luong, Pham and Manning (2015): score variants dot s^T h_j, general s^T W h_j and concat (the additive form);
  - Why it works: every output has a one-step path to every input, for information and for gradients, the same argument as the LSTM's additive path and the residual …
  - … and 3 more points
- **s12 Why the transformer replaced recurrence** (12 min). State precisely the two costs built into recurrence, the convolutional alternative that came first, the trade the transformer made, and what recurrence keeps, with numbers. _2 worked example(s), 1 figure(s)._
  - Cost 1, no parallelism over time (the source): h_t needs h_{t-1}, so a sequence of 10,000 tokens is 10,000 dependent steps per layer however many processors there are.
  - Cost 2, long paths (the source): information from position j reaches t through t - j applications of the recurrence, each lossy;
  - The convolutional alternative came first: WaveNet (van den Oord et al.
  - The transformer's trade (the source;
  - What recurrence keeps (the source): constant compute and constant memory per generated token at inference, where a transformer's key-value cache grows with the context …
  - Comparison table (acknowledge the similar table in Vaswani et al.
  - … and 1 more points
- **s13 What came back: linear recurrences and state-space models** (21 min). Explain how dropping the nonlinearity from the recurrence makes it trainable in parallel and stable over long ranges, how S4 and Mamba build on that, where these models stand, and how to choose a sequence model. _5 worked example(s), 2 figure(s), widget: ssm-kernel-explorer._
  - The key move: make the recurrence linear in the state, h_t = A h_{t-1} + B x_t, y_t = C h_t + D x_t, with the nonlinearities placed between layers (per-step MLPs and …
  - Three ways to compute the same map: recurrent mode (constant cost per step;
  - Diagonalisation: A = VΛV^{-1} with complex eigenvalues λ_n turns the system into N independent scalar recurrences h_{t,n} = λ_n h_{t-1,n} + (B̃ x_t)_n.
  - Continuous time and discretisation: dh/dt = A h + B x(t);
  - S4 (Gu, Goel and Ré 2022): a structured A initialised from HiPPO (Gu et al.
  - Mamba (Gu and Dao 2023): selectivity.
  - … and 3 more points
- **What goes wrong.** 14 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: A character-level RNN from scratch in NumPy | 40 | ~1 min | none | Implement the forward pass and backpropagation through time of Sections 2-3 in NumPy, verify the gradients numerically, train with truncated BPTT on a structured maintenance log, … |
| lab2: Watching gradients vanish, and the LSTM that does not | 40 | ~2 min | none | Check an LSTM cell written from Section 5's equations against PyTorch, measure gradient norm against time lag for vanilla RNNs and LSTMs, reproduce the source's c_0-gradient … |
| lab3: Forecasting and monitoring a sensor stream | 50 | ~2 min | none | Forecast a simulated sensor on a mounted machine honestly: walk-forward evaluation against naive, seasonal-naive and linear baselines; |
| lab4: Sequence to sequence with attention | 35 | ~4 min | none | Build a GRU encoder-decoder that reverses digit strings, with and without Bahdanau attention; |
| lab5: A diagonal linear recurrence versus an LSTM | 25 | ~2 min | none | Implement a diagonal complex linear recurrence in the style of the Linear Recurrent Unit, confirm that its recurrent and convolutional forms compute the same map, time both, and … |

**Exercises** (15: 7 ★, 7 ★★, 1 ★★★; 130 minutes).

- e1 ★ conceptual, 5 min: For each task, name the task shape (many-to-one, aligned many-to-many, sequence-to-sequence, one-to-many) and say whether the output at step t may …
- e2 ★★ derivation, 10 min: For the scalar RNN h_t = tanh(w h_{t-1} + u x_t) with h_0 = 0 and loss L = ½(h_3 - y)^2: (a) write ∂L/∂w for T = 3 as a sum of three terms and show …
- e3 ★ conceptual, 5 min: In three or four sentences, explain why global-norm gradient clipping cures exploding gradients but not vanishing ones, and why clipping each …
- e4 ★★ derivation, 10 min: (a) From the LSTM equations, derive ∂c_t/∂c_{t-1} and identify the term that does not pass through h_{t-1}.
- e5 ★★ calculation, 10 min: Count the parameters of a recurrent layer with d_in = 8 and H = 64 for a vanilla RNN, an LSTM and a GRU, first with one bias vector per gate and then …
- e6 ★ conceptual, 5 min: A batch holds three sensor sequences of lengths 30, 90 and 240, zero-padded to 240 and fed to a unidirectional LSTM classifier that uses the output …
- e7 ★ conceptual, 5 min: A colleague's pipeline for a vibration forecaster: (i) z-score the whole two-year series;
- e8 ★★ calculation, 10 min: One-step residuals of a forecaster on held-out normal data have standard deviation σ = 0.2 and are roughly Gaussian;
- e9 ★ conceptual, 5 min: Explain why teacher forcing lets an RNN decoder be trained without sampling, and what exposure bias is.
- e10 ★★ calculation, 10 min: A decoder over {A, B, ⟨e⟩} has p(y_1) = (A 0.45, B 0.35, ⟨e⟩ 0.20);
- e11 ★★ calculation, 10 min: Encoder states h_1 = (1, 1), h_2 = (2, 0), h_3 = (0, -1).
- e12 ★ conceptual, 5 min: In two sentences each: why can a recurrent network not be trained in parallel over time, and why can a transformer? Then, without computing sizes: …
- e13 ★★ calculation, 10 min: (a) For h_t = 0.8 h_{t-1} + x_t, y_t = 2 h_t, h_0 = 0 and x = (2, -1, 0, 1), compute y by the recurrence and then by convolution with the kernel K_k …
- e14 ★ conceptual, 5 min: Choose a sequence model for each case and justify it in one or two sentences.
- e15 ★★★ coding, 25 min: In Lab 3's forecaster, replace the LSTM with a temporal convolutional network: causal 1D convolutions (Module 03) with kernel size 2 and dilations 1, …

**Quiz** (12 questions): Unrolled over T steps, a recurrent network is equivalent to:; A linear RNN's recurrent matrix has eigenvalues 0.95 and 1.05.; Global-norm gradient clipping with threshold c:; In an LSTM, the derivative of c_t with respect to c_{t-1} along the direct …; How many parameters does PyTorch's nn.LSTM(10, 20) have?; For which task is a bidirectional LSTM appropriate?; A sequence-to-sequence model trained only with teacher forcing produces fluent …; Beam search with beam width k = 1 is:; In Bahdanau attention, the weights α_{t,j} at decoder step t:; Which of these is not leakage when evaluating a forecaster?; A one-step LSTM forecaster that subtracts each window's last value monitors a …; Why can an S4-style state-space layer be trained in parallel over time while an …

**Guided reading.**

- Pascanu, R., Mikolov, T., Bengio, Y. "On the difficulty of training recurrent neural networks." ICML, 2013. (20 min). The clearest analysis of why recurrent gradients vanish and explode (the product of Jacobians, the dynamical-systems view, the geometry of the cliff) and the origin of …
- Bahdanau, D., Cho, K., Bengio, Y. "Neural machine translation by jointly learning to align and translate." ICLR, 2015. (15 min). The paper that introduced attention as the fix for the encoder-decoder bottleneck: the idea that, with the recurrence removed, became the transformer.
- Gu, A., Dao, T. "Mamba: Linear-time sequence modeling with selective state spaces." 2023 (arXiv:2312.00752). (15 min). The paper that made recurrence competitive again for language-scale sequence modelling, by making a state-space model's parameters depend on the input: the clearest …

**Interactive widgets.**

- `gradient-flow-explorer` (in s4): Whether a gradient survives n steps back is decided by the per-step Jacobian, the recurrent matrix's spectrum times the nonlinearity's derivative: a spectral radius of exactly 1 is not enough once …
- `ssm-kernel-explorer` (in s13): A linear time-invariant recurrence and a convolution with its impulse response are the same map: the eigenvalue's modulus sets the memory length and its angle the oscillation;

**Key terms:** 30 English–Chinese pairs. **References:** 53.

### Module 05: Other networks worth knowing

Autoencoders and VAEs, GANs, diffusion models, graph networks, physics-informed networks and neural operators, contrastive learning and mixture of experts: what each one optimises, its equations derived, a worked example in numbers, a lab that runs on a laptop, and how each one fails.

**Before you start:** Module 01: maximum likelihood and cross-entropy, train/test splits, baselines and leakage, PCA; Module 02: MLPs, backpropagation and reverse-mode autodiff, Adam, writing a PyTorch training loop; Module 03: convolution and weight sharing (the GCN analogy); the U-Net by name; Module 04: attention as a softmax-weighted average (Bahdanau); anomaly detection from forecasting residuals; Probability: Gaussian densities, expectations, conditional distributions, Jensen's inequality; Calculus and linear algebra: the chain rule, eigenvalues and eigenvectors of symmetric matrices, second-order linear ODEs (the damped oscillator).

**You will be able to:**

- Derive the ELBO in two ways, compute the closed-form Gaussian KL, and detect posterior collapse from KL per dimension and active units.
- Build an autoencoder anomaly detector, set its threshold from held-out normal data, and report its false-alarm and detection rates against a PCA baseline.
- Derive the optimal GAN discriminator and the Jensen-Shannon objective, explain the non-saturating loss and mode collapse, and state why diffusion displaced GANs for most image work.
- Derive the closed-form forward process of a diffusion model, explain the noise-prediction loss through the ELBO and through the score, and train and sample a 2D diffusion model with classifier-free guidance.
- Compute a GCN layer by hand from the normalised adjacency, implement message passing from an edge list, and explain over-smoothing from the eigenvalues of the propagation matrix.
- Write the loss of a physics-informed network for an ODE or PDE, diagnose the trivial-solution failure, fix it by non-dimensionalising, weighting or hard constraints, and solve an inverse problem.
- Describe DeepONet and the Fourier neural operator and state the checks a surrogate needs before it is used on a new design.
- Derive InfoNCE as a classification loss with its log N bound, and measure with a linear probe what contrastive pretraining buys when labels are few and how the augmentations decide what is learned.
- Count the total and active parameters of a mixture-of-experts model and explain routing collapse and the load-balancing loss.
- Choose among these families for an engineering problem and name the baseline each choice must beat.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. Autoencoders and variational autoencoders | Read Sections 1–2: the map of the families with their shared toolkit, then autoencoders and anomaly detection. (27); Exercise 1: what an unconstrained autoencoder learns. (5); Read Section 3: variational autoencoders, the ELBO and the reparameterisation trick. (27); Exercise 2: the ELBO two ways and the Gaussian KL. (12); Lab 1: autoencoders, a VAE and an anomaly detector on 8×8 digits. (40); Exercise 3: diagnosing partial posterior collapse. (5) |
| 2. Adversarial and diffusion models | Read Section 4: generative adversarial networks. (15); Exercises 4–5: the optimal discriminator and the Jensen–Shannon divergence, and how to detect mode collapse. (15); Read Section 5 with the diffusion explorer: the forward process and the training objective. (26); Exercise 6: derive the closed-form forward process. (10); Read Section 6: sampling, guidance, latent diffusion and cost. (17); Lab 2: a diffusion model on two moons, with classifier-free guidance. (45) |
| 3. Diffusion in the original; graph networks | Exercise 7: a schedule that stops short of pure noise. (10); Guided reading: Ho, Jain and Abbeel (2020), "Denoising diffusion probabilistic models". (20); Read Sections 7–8 with the message-passing explorer: message passing and the GCN, then attention, depth limits and engineering graphs. (38); Lab 3: a GCN from scratch for single points of failure in fault trees. (35); Guided reading: Kipf and Welling (2017), "Semi-supervised classification with graph convolutional networks". (12) |
| 4. Physics-informed networks and operators | Exercises 8–10: over-smoothing on a star graph, the baseline for finding basic events, and two graphs message passing cannot tell apart. (20); Read Sections 9–10: physics-informed networks, then neural operators and surrogate models. (35); Lab 4: a physics-informed network for a damped oscillator, its failure, two fixes and an inverse problem. (40); Exercises 11–12: the residual of a trial solution, and Lab 4's code extended to the heat equation. (35) |
| 5. Representations, routing and choosing | Guided reading: Raissi, Perdikaris and Karniadakis (2019), "Physics-informed neural networks". (13); Read Section 11: contrastive and self-supervised learning. (14); Lab 5: contrastive pretraining on unlabelled vibration signals. (30); Read Sections 12–13 and What goes wrong: mixture of experts, choosing a family, and the failure modes. (26); Exercises 13–15: choosing a family and its baseline, safe augmentations, and the load-balancing term. (15); Self-check quiz of 12 questions. (15); Review the summary, the what-goes-wrong list and the key terms, and return to any check you missed. (10) |

**Concept sections.**

- **s1 A map of the families, and the tools they share** (12 min). Orient the reader with a map of what each family solves and optimises, and collect the four mathematical tools the rest of the module uses: KL divergence, Jensen's inequality, Gaussian algebra and Monte Carlo gradients. _2 worked example(s), 1 figure(s)._
  - A map table, one row per family, columns 'problem it solves', 'what it optimises', 'what it outputs': autoencoder (reconstruct x through a bottleneck;
  - Three ways to build a generator and how they compare: an explicit latent-variable model trained on a likelihood bound (VAE), an implicit model trained adversarially …
  - KL divergence D_KL(q\|\|p) = E_q[log q/p].
  - Closed-form KL between univariate Gaussians: D_KL(N(mu1, s1^2) \|\| N(mu2, s2^2)) = log(s2/s1) + (s1^2 + (mu1 - mu2)^2)/(2 s2^2) - 1/2, derived in three lines (expectation …
  - Gaussian algebra used in Section 5: if a ~ N(0, sa^2) and b ~ N(0, sb^2) are independent then a + b ~ N(0, sa^2 + sb^2);
  - Monte Carlo: E_p[f(x)] is estimated by an average over samples;
  - … and 1 more points
- **s2 Autoencoders: bottlenecks, denoising and anomaly detection** (15 min). Show what an autoencoder learns, prove that the linear one recovers the PCA subspace, and use reconstruction error as an anomaly score with an honestly chosen threshold. _2 worked example(s), 2 figure(s)._
  - Definition: encoder z = f_phi(x) in R^{d_z}, decoder x-hat = g_theta(z), loss L = (1/N) sum_i \|\|x_i - g_theta(f_phi(x_i))\|\|^2.
  - Linear autoencoder = PCA subspace: with centred data, linear f and g and squared error, the optimal product g(f(x)) is the orthogonal projection onto the top d_z …
  - Nonlinear autoencoders find curved manifolds.
  - Denoising autoencoder: train on a corrupted input (x + noise, or x with pixels masked), target the clean x;
  - Anomaly detection: train on normal operation only;
  - How it fails: anomalies that resemble normal data reconstruct well;
- **s3 Variational autoencoders: the ELBO and the reparameterisation trick** (27 min). Derive the VAE objective from the latent-variable model, show exactly what the bound gives up, make its gradient computable, and explain and diagnose posterior collapse. _3 worked example(s), 3 figure(s)._
  - Latent-variable model p_theta(x) = integral of p_theta(x\|z) p(z) dz with prior p(z) = N(0, I).
  - ELBO by Jensen, written line by line: log p_theta(x) = log E_{q_phi(z\|x)}[p_theta(x\|z) p(z) / q_phi(z\|x)] >= E_q[log p_theta(x\|z)] - D_KL(q_phi(z\|x) \|\| p(z)).
  - ELBO as an identity: log p_theta(x) = ELBO + D_KL(q_phi(z\|x) \|\| p_theta(z\|x)), derived from p(x) = p(x\|z)p(z)/p(z\|x) by taking the expectation under q.
  - Amortised inference: one encoder network outputs (mu_phi(x), log sigma^2_phi(x)) for every x, instead of a separate optimisation of q for each data point.
  - Closed-form KL for a diagonal Gaussian against N(0, I): (1/2) sum_j (mu_j^2 + sigma_j^2 - log sigma_j^2 - 1), from Section 1's formula;
  - The gradient problem and its two answers: the score-function (REINFORCE) estimator E_q[f(z) grad_phi log q_phi(z)] is unbiased but high-variance;
  - … and 5 more points
- **s4 Generative adversarial networks** (15 min). Derive what the GAN game optimises, why its original loss stalls, why it collapses onto a few modes, and why diffusion displaced it for most new work. _3 worked example(s), 3 figure(s)._
  - The game: min_G max_D V(G, D) = E_{x ~ p_data}[log D(x)] + E_{z ~ p(z)}[log(1 - D(G(z)))];
  - Optimal discriminator derived pointwise: for fixed G, a log y + b log(1 - y) is maximised at y = a/(a + b), so D*(x) = p_data(x) / (p_data(x) + p_g(x)): the …
  - Substituting D*: V(G, D*) = -log 4 + 2 JSD(p_data \|\| p_g), minimised (value -log 4) exactly when p_g = p_data.
  - Saturation: early in training D(G(z)) is near 0 and the gradient of log(1 - sigma(a)) with respect to the logit is -sigma(a), near 0;
  - Mode collapse: nothing in the loss rewards covering all of p_data;
  - Disjoint supports: when p_data and p_g sit on non-overlapping low-dimensional sets, the JSD is log 2 whatever their distance, so it carries no information about which …
  - … and 2 more points
- **s5 Diffusion I: the forward process and the training objective** (26 min). Build the forward noising process and its closed form, show how the schedule controls it, and derive the noise-prediction loss from the ELBO and from denoising score matching. _3 worked example(s), 3 figure(s), widget: diffusion-explorer._
  - Forward process: q(x_t \| x_{t-1}) = N(sqrt(1 - beta_t) x_{t-1}, beta_t I) for t = 1..T;
  - Closed form q(x_t \| x_0) = N(sqrt(alpha-bar_t) x_0, (1 - alpha-bar_t) I), derived by composing two steps (independent Gaussian noises add: alpha_t (1 - alpha-bar_{t-1}) …
  - Schedules: Ho et al.'s linear beta from 1e-4 to 0.02 with T = 1000 (alpha-bar_T = 4.0e-5);
  - The reverse conditional q(x_{t-1} \| x_t, x_0) = N(mu-tilde_t, beta-tilde_t I) with mu-tilde_t = (sqrt(alpha-bar_{t-1}) beta_t / (1 - alpha-bar_t)) x_0 + (sqrt(alpha_t)(1 …
  - The diffusion ELBO as a sum of per-step KLs between Gaussians (L_T + sum of L_{t-1} + L_0);
  - The dropped weight with sigma_t^2 = beta_t is beta_t / (2 alpha_t (1 - alpha-bar_t)): 0.50 at t = 1, 0.010 at t = 100, 0.0055 at t = 500, 0.010 at t = 1000 for the …
  - … and 4 more points
- **s6 Diffusion II: sampling, guidance, latent diffusion and cost** (17 min). Turn the trained noise predictor into a sampler, steer it with a condition, make it affordable in a latent space, and count what it costs at inference. _3 worked example(s), 3 figure(s)._
  - Ancestral (DDPM) sampling: x_T ~ N(0, I);
  - The first step when beta_T is near 1: the factor 1/sqrt(alpha_T) is 31.6 for beta_T = 0.999 and multiplies any error in eps_theta.
  - DDIM (Song, Meng and Ermon 2021): a deterministic update x_{t'} = sqrt(alpha-bar_{t'}) x-hat_0 + sqrt(1 - alpha-bar_{t'}) eps_theta(x_t, t) on a strided subsequence of …
  - Conditioning: feed c (a class, a text embedding, a low-resolution image, a measured boundary condition) to eps_theta(x_t, t, c).
  - Classifier guidance (Dhariwal and Nichol 2021) in one sentence: add the gradient of a noisy-input classifier's log p(c \| x_t).
  - Classifier-free guidance (Ho and Salimans 2022): train one network with c replaced by a null token with probability p_uncond (0.1-0.2;
  - … and 4 more points
- **s7 Graph neural networks I: message passing and the GCN** (21 min). Show how a network reads data whose structure is a graph, derive the GCN layer from message passing with symmetric normalisation, and compute one layer by hand on a fault tree. _2 worked example(s), 2 figure(s)._
  - Graphs as data: G = (V, E) with n nodes, adjacency A in {0, 1}^{n x n}, degree matrix D, node features X in R^{n x d}, optional edge features.
  - The constraint: node numbering is arbitrary, so layers must be permutation-equivariant, f(P A P^T, P X) = P f(A, X), and graph-level outputs permutation-invariant (sum, …
  - Message passing (Gilmer et al.
  - Why normalise: with sum aggregation a node of degree 50 receives messages 50 times larger than a leaf's, and repeated layers multiply by A's large eigenvalues, so …
  - GCN derivation (Kipf and Welling 2017): set W_self = W_nbr = W, add self-loops A-tilde = A + I, normalise symmetrically A-hat = D-tilde^{-1/2} A-tilde D-tilde^{-1/2}, so …
  - The source's code gcn_layer(A_hat, H, W) = relu(A_hat @ H @ W), and the edge-list form used in Lab 3: out_i = sum over j of A-hat_ij H_j, computed with index_add_ over …
  - … and 2 more points
- **s8 Graph neural networks II: attention, depth limits and engineering graphs** (17 min). Weight neighbours by learned attention, explain why GNNs stay shallow and what they cannot distinguish, handle directed and typed edges, and map the family onto engineering graphs. _3 worked example(s), 3 figure(s), widget: message-passing-explorer._
  - Graph attention (Velickovic et al.
  - Over-smoothing derived: for a connected graph with self-loops, A-hat^k X -> u u^T X as k grows, with u = D-tilde^{1/2} 1 / \|\|D-tilde^{1/2} 1\|\|, because A-hat u = u …
  - Without self-loops a tree is bipartite, A-hat has eigenvalue -1, and features oscillate between the two colour classes instead of converging (an edge case in the …
  - Depth in practice: 2-4 layers is typical.
  - Over-squashing (Alon and Yahav 2021): an exponentially growing neighbourhood squeezed through bottleneck edges into a fixed-size vector, so long-range dependencies suffer.
  - Expressivity: with identical initial features, message passing cannot separate graphs that the 1-Weisfeiler-Lehman test cannot (Xu et al.
  - … and 3 more points
- **s9 Physics-informed neural networks** (24 min). Train a network to satisfy a known differential equation by penalising its residual, show the loss terms and how to balance them, and be honest about when this beats a classical solver and when it does not. _2 worked example(s), 3 figure(s)._
  - The problem shape: the equation is known and the data are sparse;
  - The composite loss, reproducing the source's equation: a data term (1/N_d) sum (u_theta(x_i, t_i) - u_i)^2, a residual term (1/N_c) sum (N[u_theta](x_j, t_j))^2 at …
  - Derivatives of the network with respect to its inputs by reverse-mode autodiff (Module 02): torch.autograd.grad(u, t, grad_outputs=torch.ones_like(u), …
  - The worked ODE: u'' + 2 zeta w0 u' + w0^2 u = 0 with u(0) = 1, u'(0) = 0;
  - The trivial solution: u = 0 has zero residual for a homogeneous equation, and only the initial or boundary terms exclude it.
  - Three fixes, measured in Lab 4: raise lambda_ic to 100 (error 0.004 after 10,000 steps);
  - … and 3 more points
- **s10 Neural operators and surrogate models** (11 min). Explain how a network learns the map from an input function to a solution field across a family of problems, and how to judge such a surrogate before using it. _2 worked example(s), 2 figure(s)._
  - Operator learning: G maps a to u, where a is a coefficient field, a forcing, a boundary condition or a geometry and u is the solution;
  - Surrogates in engineering terms: response surfaces, kriging and Gaussian-process surrogates, reduced-order models by proper orthogonal decomposition, u(y) approx sum_k …
  - DeepONet (Lu et al. 2021): a branch net b(a(y_1), ..., a(y_m)) in R^p reads the input function at m fixed sensors, a trunk net t(y) in R^p reads the query point, and …
  - Fourier neural operator (Li et al.
  - Validity: a surrogate is valid on the distribution of inputs it was trained on;
  - The practical route to a fast approximate finite-element solver for a family of designs: trained on a few thousand solver runs, it answers a new member of the family in …
  - … and 1 more points
- **s11 Contrastive and self-supervised learning** (14 min). Show how an encoder learns useful features from unlabelled data by telling a positive pair apart from negatives, derive InfoNCE as a classification loss, and show that the augmentations decide what is learned. _2 worked example(s), 2 figure(s)._
  - The problem: labels are expensive and structure is free.
  - InfoNCE derived as softmax cross-entropy (the source's equation): among N candidates, one positive and N - 1 negatives, with scores sim(z_i, z_j)/tau, L = …
  - The mutual-information view (van den Oord et al.
  - SimCLR (Chen et al. 2020): two augmentations of each of the B inputs in a batch give 2B views;
  - Alignment and uniformity (Wang and Isola 2020): the loss pulls positives together and spreads all embeddings over the sphere.
  - The augmentations are the supervision: they say which differences the encoder must ignore.
  - … and 4 more points
- **s12 Mixture of experts** (11 min). Show how routing each input to a few of many experts separates parameter count from compute, count both on a published configuration, and explain the routing failures. _2 worked example(s), 1 figure(s)._
  - The layer (the source's equation): y = sum over e in top-k(g(x)) of g_e(x) FFN_e(x), with router g(x) = softmax(W_r x), k = 1 or 2, and the selected weights renormalised …
  - Origins: Jacobs, Jordan, Nowlan and Hinton (1991), adaptive mixtures of local experts, a soft gate choosing among regressors, familiar to engineers who switch models …
  - Parameters against compute: parameters grow with E, compute per token with k.
  - Routing collapse: a feedback loop.
  - Capacity: each expert processes at most capacity factor x (tokens / E) tokens per batch;
  - Other difficulties (source): communication between GPUs when experts are spread across them;
  - … and 2 more points
- **s13 Choosing a family** (8 min). Turn the module into decisions: which family fits which engineering need, what baseline it must beat first, and what it costs. _1 worked example(s), 1 figure(s)._
  - The source's table, every row kept, extended with two columns, 'first baseline to beat' and 'main cost or risk': compress, denoise, detect anomalies in unlabelled data …
  - Three walk-throughs: (1) vibration monitoring of a pump fleet with no fault labels -> an autoencoder on normal data with a percentile threshold against the PCA …
  - The series rule: state the baseline first;
- **What goes wrong.** 14 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: Autoencoders, a VAE and an anomaly detector on 8x8 digits | 40 | ~2 min | none | Compare a nonlinear autoencoder with PCA, train the source's VAE and inspect its latent space, cause posterior collapse on purpose, and build a reconstruction-error anomaly … |
| lab2: A diffusion model on two moons, with classifier-free guidance | 45 | ~2 min | none | Implement the DDPM forward process, train a noise-prediction network on 2D data, sample with the reverse process and with DDIM, and measure what classifier-free guidance and the … |
| lab3: A graph convolutional network from scratch: single points of failure in fault trees | 35 | ~3 min | none | Build the normalised adjacency and message passing by hand, train GCNs of increasing depth to find single points of failure in synthetic fault trees, compare them with honest … |
| lab4: A physics-informed network for a damped oscillator: forward, failure, fixes and an inverse problem | 40 | ~3 min | none | Train a PINN on an ODE with a known exact solution, reproduce the trivial-solution failure, fix it three ways, and recover an unknown damping ratio from twelve noisy readings, … |
| lab5: Contrastive pretraining on unlabelled vibration signals | 30 | ~2 min | none | Pretrain an encoder with InfoNCE on unlabelled machine-vibration windows, measure with a linear probe how much it helps when only a few faults are labelled, compare it with raw … |

**Exercises** (15: 8 ★, 6 ★★, 1 ★★★; 127 minutes).

- e1 ★ conceptual, 5 min: An autoencoder maps 64-pixel images to a 128-dimensional code and back, with no other constraint, and its training reconstruction error reaches zero.
- e2 ★★ derivation, 12 min: (a) Starting from log p_theta(x) = log of the integral of p_theta(x\|z) p(z) dz, insert q_phi(z\|x)/q_phi(z\|x), apply Jensen's inequality and obtain …
- e3 ★ conceptual, 5 min: A VAE with d_z = 8 reports these per-dimension KL values on the test set, in nats: (2.1, 1.7, 0.003, 0.002, 1.2, 0.001, 0.004, 0.002).
- e4 ★★ derivation, 10 min: (a) For fixed G, the GAN value is V = integral of [p_data(x) log D(x) + p_g(x) log(1 - D(x))] dx.
- e5 ★ conceptual, 5 min: A GAN trained on cross-section images of turbine blades produces samples an engineer cannot tell from real ones, and its discriminator's accuracy …
- e6 ★★ derivation, 10 min: Show that the per-step forward process q(x_t \| x_{t-1}) = N(sqrt(1 - beta_t) x_{t-1}, beta_t I) gives q(x_t \| x_0) = N(sqrt(alpha-bar_t) x_0, (1 - …
- e7 ★★ calculation, 10 min: Ho et al.'s linear schedule runs beta_t evenly from 1e-4 to 0.02 over T = 1000 steps.
- e8 ★★ calculation, 10 min: A gate with three basic-event inputs forms a star graph: centre c joined to leaves a, b and d.
- e9 ★ conceptual, 5 min: A colleague trains a two-layer GCN to predict which nodes of fault trees are basic events, with node degree among the features, and reports 99% test …
- e10 ★ conceptual, 5 min: Graph P is the complete bipartite graph K_{3,3}: two rows of three nodes, each node joined to all three nodes of the other row.
- e11 ★★ derivation, 10 min: For u'' + 2 zeta w0 u' + w0^2 u = 0 with u(0) = 1, u'(0) = 0, a student proposes the trial solution u(t) = exp(-zeta w0 t) cos(w0 t): decaying, but …
- e12 ★★★ coding, 25 min: Adapt Lab 4's code to the heat equation u_t = u_xx on x in [0, 1], t in [0, 0.2], with u(x, 0) = sin(pi x) and u(0, t) = u(1, t) = 0.
- e13 ★ conceptual, 5 min: Choose a family for each need and name the first baseline it must beat: (a) a surrogate for the steady temperature field of a finned heat sink across …
- e14 ★ conceptual, 5 min: For each case, say whether the augmentation is safe for the downstream task, and why: (a) random 90-degree rotations when pretraining on top-down …
- e15 ★ conceptual, 5 min: A top-1 mixture-of-experts layer with 8 experts is trained without a load-balancing loss.

**Quiz** (12 questions): Which statement about the KL divergence D_KL(q\|\|p) is true?; In a VAE, log p_theta(x) - ELBO equals:; Why does a VAE need the reparameterisation trick?; Why is the non-saturating generator loss -log D(G(z)) used instead of log(1 - …; During DDPM training, how is the noisy input x_t obtained for a randomly drawn …; With classifier-free guidance eps-tilde = eps_theta(x_t, null) + w …; In a GCN with self-loops, what is A-hat_ij for an edge between a node with 3 …; Repeatedly applying A-hat = D-tilde^{-1/2}(A + I)D-tilde^{-1/2} to the node …; A PINN for u'' + w^2 u = 0 with u(0) = 1, u'(0) = 0 converges to u = 0.; A DeepONet trained on solver runs for one family of boundary conditions is …; With InfoNCE over N = 256 candidates, the largest value the lower bound log N - …; A layer has 8 experts and routes each token to its top 2.

**Guided reading.**

- Ho, J., Jain, A., Abbeel, P. "Denoising diffusion probabilistic models." NeurIPS, 2020. (20 min). The paper that made diffusion practical: it ties the variational bound to denoising score matching and shows that a simplified noise-prediction loss gives the best …
- Kipf, T. N., Welling, M. "Semi-supervised classification with graph convolutional networks." ICLR, 2017. (12 min). Short and clear: it derives the GCN layer from spectral graph convolution in two approximations and shows it working with very few labels;
- Raissi, M., Perdikaris, P., Karniadakis, G. E. "Physics-informed neural networks: a deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations." Journal of Computational Physics, 2019. (13 min). The paper that named the method and set its pattern: a residual computed by automatic differentiation, collocation points, and inverse problems with trainable …

**Interactive widgets.**

- `diffusion-explorer` (in s5): The forward process turns any data distribution into N(0, I) along a path set by the noise schedule, and the cosine schedule keeps structure longer than the linear one;
- `message-passing-explorer` (in s8): Each propagation step replaces a node's features by a degree-weighted average over its neighbourhood: after k steps a node carries information from k hops away, and after many steps every node of a …

**Key terms:** 30 English–Chinese pairs. **References:** 56.

### Module 06: The transformer

This module takes attention apart until you can compute it by hand, differentiate it, tile it the way FlashAttention does and rotate it with RoPE; then it assembles the modern decoder-only block, counts its parameters and FLOPs against published models, and trains a small GPT on a laptop CPU whose loss curve and attention heads you can read.

**Before you start:** Module 01: softmax regression, and cross-entropy as the negative log-likelihood of a categorical model; Module 02: backpropagation and the softmax Jacobian diag(p) - p p^T, the softmax/cross-entropy gradient, the activation functions (ReLU, GELU, SiLU), layer normalisation and RMSNorm, AdamW with warmup and cosine decay, gradient clipping, a PyTorch training loop; Module 04: sequence-to-sequence models, Bahdanau and Luong attention, why recurrence is sequential in time; Linear algebra: matrix products and transposes, rank, block-diagonal matrices, 2x2 rotation matrices and orthogonality; Complex numbers: Euler's formula exp(i*phi) = cos(phi) + i sin(phi), the conjugate, and Re(z * conj(w)) as the dot product of two 2D vectors; Probability: expectation and variance of a sum of independent random variables; Python: NumPy arrays and broadcasting; PyTorch tensors, nn.Module and autograd.

**You will be able to:**

- compute scaled dot-product attention by hand for a three-token example, with and without a causal mask and with and without the 1/sqrt(d_k) scale, and state every score, weight and output to three decimals.
- apply the softmax Jacobian diag(p) - p p^T (derived in Module 02) to an attention row, derive the variance argument for 1/sqrt(d_k), and use the two to explain why unscaled attention saturates and learns slowly.
- push a gradient back through one attention row by hand and check it against autograd.
- track the shape of every tensor through multi-head and grouped-query attention, from (B, T, d) to (B, h, T, d_k) and back, and explain the residual-stream view of a transformer.
- write the pre-norm block in equations and code, and explain why its identity path often reduces warmup requirements, while learning rate, depth and initialisation still affect stability.
- prove that RoPE makes the attention score depend on positions only through t - s, implement it, and verify the property numerically.
- derive the online softmax and implement tiled (FlashAttention-style) attention that matches naive attention to floating-point rounding without forming the T x T matrix.
- count the parameters of a decoder from its configuration (12Ld^2 plus embeddings, with GQA and SwiGLU corrections), reproducing published model sizes exactly, and its FLOPs under the convention the whole series uses: 2 N_matmul per token plus 4Ldt for attention at context t (2LdT averaged over a causal sequence of length T), three times that for training, and 6N only as a labelled estimate.
- compute the KV-cache size per token, in bytes and in KiB, for multi-head, grouped-query and multi-query configurations.
- train a character-level decoder-only transformer on a CPU, check that its initial loss is log V, sample from it, diagnose a missing causal mask from its loss curve, and find an induction head in a small trained model.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. Attention, by hand | Read sections 1-2: drop the recurrence; scaled dot-product attention (36); Exercises e1 and e3: the first row under a causal mask; why unscaled attention learns slowly (10); Read section 3 and work the attention calculator (20); Lab 1: attention by hand, checked against PyTorch (30); Exercises e2 and e4 (20) |
| 2. Heads, blocks and position | Read section 4: multi-head attention and the residual stream (22); Read section 5: the block (18); Exercise e5 (5); Read section 6 and explore the RoPE widget (26); Lab 2: RoPE, numerically (25); Guided reading: Su et al., RoFormer (13); Exercises e6-e7 (15) |
| 3. Shapes, the modern block and FlashAttention | Read sections 7-8: three shapes of model; the vision transformer (23); Exercise e8 (5); Read section 9: the modern decoder block (17); Exercise e9 (5); Read section 10: FlashAttention and the online softmax (20); Lab 3: online softmax and tiled attention (30); Exercise e11 (10); Guided reading: Dao et al., FlashAttention (17) |
| 4. Counting, then training | Read section 11: counting parameters and FLOPs (22); Lab 4: a parameter and FLOP counter checked against published models (25); Exercise e12 (10); Read section 12: training a tiny GPT (17); Lab 5: train a tiny GPT, sample from it, then remove the mask (50); Exercise e14: diagnosing a leak (5) |
| 5. Inside a trained model, and review | Lab 6: find an induction head (30); Guided reading: Vaswani et al., Attention is all you need (20); Read: what goes wrong (6); Exercises e10, e13, e15 (45); Self-check quiz (15); Summary and review: redo the worked example from memory; list the six choices of the modern block and the reason for each (10) |

**Concept sections.**

- **s1 Drop the recurrence** (14 min). State the two costs of recurrence that the transformer removes, recast attention as a soft dictionary lookup, and name the two things that must be added back. _1 worked example(s), 1 figure(s)._
  - One-paragraph recap of Module 04: Bahdanau attention computes e_{t,j} = v^T tanh(W_s s_{t-1} + W_h h_j), alpha_{t,j} = softmax_j(e_{t,j}), a_t = sum_j alpha_{t,j} h_j;
  - The two costs of recurrence, with numbers: (1) step t needs h_{t-1}, so a 10,000-token training sequence is 10,000 dependent steps whatever the hardware;
  - The trade, as a small table from Vaswani et al.
  - Attention as a soft dictionary lookup.
  - What must be added back: order, because a set of weighted sums has no notion of position (Section 6, exercise e4), and for generation a mask that stops a position from …
- **s2 Scaled dot-product attention** (22 min). Define attention exactly, apply the softmax Jacobian (derived in Module 02) to one attention row, derive the variance argument for 1/sqrt(d_k), and define the causal and padding masks. _3 worked example(s), 2 figure(s)._
  - Projections Q = X W_Q, K = X W_K, V = X W_V for X in R^{T x d} (tokens as rows), W_Q, W_K in R^{d x d_k}, W_V in R^{d x d_v};
  - Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V.
  - The softmax Jacobian, recalled in one paragraph with a link to Module 02, Section 3, where it is derived;
  - Gradient through one attention row: with g_j = dL/dp_j = (dL/do) .
  - Why sqrt(d_k), derived: if the entries of q and k are independent with mean 0 and variance 1, E[q.k] = sum_i E[q_i]E[k_i] = 0 and Var(q.k) = sum_i Var(q_i k_i) = sum_i …
  - Connect the two: unscaled scores at d_k = 128 put the softmax in its saturated regime, where J is nearly zero, so the gradients reaching W_Q and W_K are tiny at …
  - … and 4 more points
- **s3 The worked example, by hand** (20 min). Compute attention on three tokens with and without the mask and the scale, see the outputs as points in the convex hull of the values, and push one gradient back through it. _4 worked example(s), 1 figure(s), widget: attention-calculator._
  - The source's set-up kept exactly: three tokens, d_k = d_v = 2, projected vectors taken directly: Q = K = [[1,0],[0,1],[1,1]], V = [[1,0],[0,2],[3,3]].
  - Causal case, row by row as in the source, with exact three-decimal values: row 1 [1, 0, 0];
  - The source's interpretation kept: token 3's query (1,1) matched its own key best, and the output is pulled toward its own value.
  - Unmasked case: row 1 [0.401, 0.198, 0.401] -> (1.604, 1.599);
  - Unscaled causal case: row 2 [0.269, 0.731] -> (0.269, 1.462);
  - Geometry: each output is a convex combination of the value rows it may see, so token 1's output is v1, token 2's lies on the segment v1-v2, token 3's lies inside the …
  - … and 2 more points
- **s4 Multi-head attention and the residual stream** (22 min). Run h attentions in parallel with every tensor shape tracked, and read a transformer as a set of layers that read from and write to one shared residual stream. _3 worked example(s), 3 figure(s)._
  - The source formula: MHA(X) = [head_1;
  - Shape bookkeeping exactly as the source code does it: x (B, T, d) -> wq(x) (B, T, d) -> .view(B, T, h, d_k) -> .transpose(1, 2) (B, h, T, d_k);
  - Concatenate-then-project equals a sum of per-head writes: [h_1;
  - Two low-rank circuits per head: the score between positions i and j is x_i W_Q^(i) W_K^(i)T x_j^T / sqrt(d_k), a bilinear form with a d x d matrix of rank at most d_k …
  - Why several heads: one softmax gives each query one distribution;
  - Counting (source): the four projections are d x d, so 4d^2 parameters per layer;
  - … and 3 more points
- **s5 The block: residuals, normalisation and the feed-forward network** (18 min). Assemble attention and the feed-forward network into a block, explain why pre-norm trains stably, and say what the feed-forward network contributes. _2 worked example(s), 1 figure(s)._
  - The pre-norm block (source): X <- X + MHA(Norm(X));
  - Why pre-norm is stable, written out: unrolling pre-norm gives x_L = x_0 + sum_l F_l(Norm(x_l)), so dx_L/dx_l = I + sum_{m >= l} dF_m/dx_l: an identity path carries the …
  - Pre-norm's costs: each layer adds to the stream, so its norm grows with depth and later layers change it proportionally less;
  - Normalisation, recalled in one paragraph with a link to Module 02, Section 10, which owns the definitions, the worked examples and the PyTorch modules (do not repeat its …
  - The FFN (source): applied to each position independently, FFN(x) = W_2 phi(W_1 x), inner width d_ff = 4d in the original, 2 x d x 4d = 8d^2 parameters per layer, twice …
  - The FFN as a key-value memory (Geva et al.
  - … and 1 more points
- **s6 Position** (26 min). Inject order into a permutation-equivariant operation, derive RoPE with its complex-number proof, and explain at concept level how a trained context is extended. _6 worked example(s), 4 figure(s), widget: rope-explorer._
  - Permutation equivariance (source): shuffle the input rows and the outputs shuffle with them, because Q, K, V are computed row by row and the softmax is applied per row;
  - Sinusoidal encodings (source formula): PE(t, 2i) = sin(t omega_i), PE(t, 2i+1) = cos(t omega_i), omega_i = 10000^(-2i/d);
  - Learned absolute embeddings (source): one trained vector per position (GPT-2: 1,024 positions, a 1,024 x 768 table of 786,432 parameters;
  - RoPE (source formula): pair the dimensions (q_{2i}, q_{2i+1}) and rotate the pair by t theta_i with theta_i = 10000^(-2i/d_k);
  - The complex-number proof, written out: represent a pair as z = x_{2i} + i x_{2i+1}.
  - Properties: no parameters;
  - … and 3 more points
- **s7 Three shapes of model** (15 min). Distinguish encoder-only, decoder-only and encoder-decoder transformers by their masks and objectives, and explain why decoder-only became the default. _2 worked example(s), 1 figure(s)._
  - Encoder-decoder (source;
  - Encoder-only (source;
  - Decoder-only (source;
  - The prefix LM in one sentence: bidirectional attention over a prompt, causal over the continuation;
  - Why decoder-only won, with the source's reasons expanded and each supported: every position is a training target (T - 1 targets per sequence against about 15% for masked …
  - The honest counterpoint: in controlled comparisons the answer depends on the evaluation.
  - … and 1 more points
- **s8 The vision transformer** (8 min). Show that nothing in the transformer is specific to text: an image becomes a sequence of patch tokens. _1 worked example(s), 1 figure(s)._
  - Patches as tokens (Dosovitskiy et al.
  - ViT-Base/16 counted with Section 11's rules: 12 layers, d = 768, 12 heads, MLP 3,072;
  - Inductive bias: no locality or translation equivariance is built in (contrast Module 03's convolutions), so a ViT must learn them from data;
  - Cost: tokens grow with the square of the resolution and attention with the square of the tokens, so doubling the resolution multiplies the attention cost per layer by …
  - Where it is used: CLIP's image encoder (Module 05);
- **s9 The modern decoder block, part by part** (17 min). Walk through the choices in a current open decoder layer and the reason for each, introducing the KV cache that grouped-query attention exists to shrink. _3 worked example(s), 1 figure(s)._
  - The source's table kept verbatim (component / choice / reason): normalisation RMSNorm pre-norm (stable at depth, cheaper than layer norm);
  - The KV cache (key-value cache), introduced only (depth in Module 10): when a model generates, each new token's query must attend to the keys and values of every earlier …
  - Grouped-query attention (source;
  - How the code shares heads: k.repeat_interleave(h // n_kv, dim=1), so query heads 0-3 use KV head 0 and 4-7 use KV head 1 when h = 8 and n_kv = 2;
  - No biases, and tied embeddings: the source code ties the input embedding to the output projection, common in small models where the V x d matrix is a large share …
  - Sliding-window attention (source): each position attends only to the last w positions, cost O(Tw) instead of O(T^2);
  - … and 2 more points
- **s10 FlashAttention and the online softmax** (20 min). Derive the online softmax and show how it lets attention be computed exactly in tiles, without storing the T x T matrix. _3 worked example(s)._
  - Why standard attention is limited by memory traffic, not arithmetic, on a GPU (source): implemented as three steps it writes S (T x T) to the GPU's main memory (HBM), …
  - The size that hurts: for T = 8,192 and h = 32 in bf16, S for one layer is 32 x 8,192^2 x 2 B = 4 GiB, and a backward pass would need P for every layer.
  - Safe softmax: exp(s - m) / sum exp(s - m) with m = max(s) gives the same result and cannot overflow (the example: softmax of (1000, 1001, 1002) computed naively is NaN;
  - Online softmax (Milakov and Gimelshein 2018), derived: keep a running maximum m and a running sum l = sum exp(s_j - m) over the scores seen so far.
  - The same trick for the output: keep an unnormalised accumulator a = sum exp(s_j - m) v_j;
  - The tiled algorithm (Dao et al.
  - … and 3 more points
- **s11 Counting parameters and FLOPs** (22 min). Derive a decoder's parameter count and per-token compute from its configuration, check the formulas against published models, and fix the FLOP convention that the rest of the series links to. _4 worked example(s), 2 figure(s)._
  - Per layer (source): attention 4d^2 with full multi-head attention, 2d^2 + 2 d n_kv d_head with GQA;
  - Embeddings (source): V x d, twice if the output projection is not tied to the input;
  - The source's check on the Llama 7B layout, made exact: d = 4,096, L = 32, 32 heads (multi-head), d_ff = 11,008, V = 32,000, untied.
  - Small models are different (table from Lab 4): GPT-2 small 124,439,808, SmolLM2-135M 134,515,008, Qwen2.5-0.5B 494,032,768, Llama-2-7B 6,738,415,616, Llama-3-8B …
  - Two parameter counts, named here once for the whole series: N_total, every parameter, which sets memory (bytes = N_total x bytes per value) and is the N of the scaling …
  - FLOPs: a product of an (m x n) and an (n x p) matrix costs 2mnp FLOPs (one multiply and one add per term).
  - … and 4 more points
- **s12 Training a tiny GPT** (17 min). Walk through the eighty-line decoder, train it at character level on a CPU, sample from it, and read its loss curve, including the curve of a model with the mask removed. _2 worked example(s), 1 figure(s)._
  - The source code, kept (with one added line, below), toured against the sections: rope() (Section 6), Attention with GQA via repeat_interleave (Sections 4 and 9), …
  - The loss at initialisation should be log V: with small weights the logits are nearly equal, the softmax nearly uniform, and the cross-entropy -log(1/V) = log V;
  - The added line, told as a lesson: nn.Embedding initialises its weights N(0, 1), and the output projection shares them, so the final normalised state of position t, which …
  - Inputs and targets: tokens[:, :-1] predict tokens[:, 1:] (the shift);
  - The corpus of Lab 5: a generated plant-maintenance log, one record per line, e.g.
  - Training (the loop of Module 02): AdamW with beta = (0.9, 0.95) and weight decay 0.1, learning rate 3e-3 with 50 warmup steps and cosine decay, gradient clipping at 1.0, …
  - … and 3 more points
- **What goes wrong.** 13 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: Attention by hand, checked against PyTorch | 30 | ~1 min | none | Reproduce every number of the worked example in NumPy, confirm them with PyTorch's fused attention and autograd, and measure the effect of the 1/sqrt(d_k) scale. |
| lab2: RoPE, numerically | 25 | ~1 min | none | Implement rotary position embedding, verify numerically that scores depend only on relative position, see what breaks it, and look at wavelengths, long-term decay, interpolation … |
| lab3: Online softmax and tiled attention | 30 | ~1 min | none | Implement the online softmax and a FlashAttention-style tiled forward pass in NumPy, and show they equal the naive computation while never holding more than one tile of scores. |
| lab4: A parameter and FLOP counter for Llama-style models | 25 | ~1 min | none | Write a counter for decoder parameters, FLOPs under Section 11's convention and KV-cache size from a configuration, and check it against PyTorch, against the module's Decoder and … |
| lab5: Train a tiny GPT, sample from it, then remove the mask | 50 | ~3 min | none | Train the module's decoder at character level on a laptop CPU, confirm that the step-0 loss is log V, read the loss curve against reference entropies, sample and score the … |
| lab6: Find an induction head | 30 | ~3 min | none | Train a two-layer attention-only transformer on sequences that repeat, watch the copying ability appear abruptly, identify the previous-token and induction heads by their … |

**Exercises** (15: 8 ★, 6 ★★, 1 ★★★; 130 minutes).

- e1 ★ conceptual, 5 min: Under a causal mask the first position's attention output is exactly v_1, whatever Q and K are.
- e2 ★★ calculation, 10 min: Add a fourth token to the worked example of Section 3, with q_4 = k_4 = (1, -1), and remove the causal mask.
- e3 ★ conceptual, 5 min: In the soft lookup of Section 1 the scaled weights are (0.248, 0.248, 0.503);
- e4 ★★ derivation, 10 min: Let P be a T x T permutation matrix.
- e5 ★ conceptual, 5 min: Write the residual update of a pre-norm and of a post-norm block.
- e6 ★★ derivation, 10 min: Section 6 proved in complex form that one RoPE pair contributes a score depending only on t - s.
- e7 ★ conceptual, 5 min: A model trained with learned absolute position embeddings for 1,024 positions is given a 2,000-token input.
- e8 ★ conceptual, 5 min: BERT is trained to fill in masked tokens with bidirectional attention.
- e9 ★ conceptual, 5 min: Llama-3-8B has 32 query heads and 8 key-value heads with head dimension 128 at d = 4,096.
- e10 ★ conceptual, 5 min: FlashAttention and sliding-window attention both reduce the memory of attention.
- e11 ★★ calculation, 10 min: Online softmax by hand: process scores s = (2, 1, 3, 0) with scalar values v = (1, 2, 3, 4) in two blocks of two.
- e12 ★★ calculation, 10 min: Count the parameters of the module's Decoder (vocab = 4,096, d = 256, 4 layers, 8 heads, 2 KV heads, d_ff = int(8 x 256 / 3), tied embeddings, …
- e13 ★★ calculation, 15 min: Llama 2 7B (N_total = 6,738,415,616 parameters, of which the untied input embedding is V d = 131,072,000;
- e14 ★ conceptual, 5 min: A colleague's character-level causal transformer reaches a training loss of 0.02 nats per character after 150 steps, and the validation loss is just …
- e15 ★★★ coding, 25 min: Replace F.scaled_dot_product_attention in the module's Attention class by an explicit implementation that builds the (B, h, T, T) score matrix, masks …

**Quiz** (12 questions): For a batch of B sequences of length T with h heads of width d_k, what is the …; Why are the scores divided by sqrt(d_k)?; Under a causal mask, what is the attention weight of position 3 on position 5?; An unmasked transformer layer with no positional encoding receives a sentence, …; Which tensors does RoPE rotate?; A decoder has L = 32 layers of width d = 4,096 with multi-head attention and an …; For a dense decoder at short context, with N_matmul parameters in its matrix …; Compared with multi-head attention, grouped-query attention with 32 query heads …; How does FlashAttention reduce attention's memory from O(T^2) to O(T)?; A character-level model with V = 46 reports a loss of 3.88 at step 0.; Which statement about pre-norm transformers is correct?; Which is the best summary of why the decoder-only shape became the default for …

**Guided reading.**

- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., Polosukhin, I. "Attention is all you need." NeurIPS, 2017. (20 min). The original; with this module behind you, every equation in its model section is familiar, and the differences from the modern block (post-norm, sinusoids, ReLU, …
- Su, J., Lu, Y., Pan, S., Murtadha, A., Wen, B., Liu, Y. "RoFormer: Enhanced transformer with rotary position embedding." arXiv:2104.09864, 2021. (13 min). The derivation of RoPE by its authors, in the complex form Section 6 used, with the long-term decay property that Lab 2 plotted.
- Dao, T., Fu, D. Y., Ermon, S., Rudra, A., Ré, C. "FlashAttention: Fast and memory-efficient exact attention with IO-awareness." NeurIPS, 2022. (17 min). The paper that made attention's memory linear in sequence length without approximation;

**Interactive widgets.**

- `attention-calculator` (in s3): Each row of softmax(QK^T / sqrt(d_k)) is a probability distribution over the keys a query may see, and the output row is the matching mixture of value rows;
- `rope-explorer` (in s6): RoPE rotates each two-dimensional pair of q and k by an angle proportional to position, at frequencies that fall geometrically across the pairs, so the score depends only on t - s;

**Key terms:** 29 English–Chinese pairs. **References:** 35.

### Module 07: Large language models

What a large language model computes and how to reason about it with numbers: the next-token objective and its units, tokens, the scaling laws, prompting and decoding, the context window, the ways it fails, how to judge a claim about one, and what it costs to run. A hypothetical bilingual model of about 9.5B parameters, adapted to draft and check safety-case arguments, runs through the module and into Modules 08 to 10.

**Before you start:** Module 06 (the transformer): attention, the causal mask, the modern decoder block, parameter counting and the FLOP rule (2 FLOPs per matrix-multiply weight per token forward and 6 in training, plus attention), the KV cache as introduced there; Module 01: maximum likelihood and cross-entropy; calibration and the expected calibration error (Section 7); honest evaluation, leakage, standard errors, the paired bootstrap and McNemar's test (Section 10); Module 02: softmax and the numerically stable log-softmax; AdamW and learning-rate schedules (for the scaling-law runs); Probability: entropy, expectation and variance of a discrete distribution; the binomial standard error; Calculus: minimising a function of two variables under a constraint (by substitution); Python with NumPy and PyTorch tensors at the level of Module 06's code.

**You will be able to:**

- Convert a language-model loss between nats, bits, perplexity and bits per byte, and explain why per-token perplexities of models with different tokenizers cannot be compared.
- Train byte-pair encoding by hand on a six-word corpus, encode a new word with the learned merges, and predict how a tokenizer's training mixture changes the token count of English and Chinese text.
- Use the approximate scaling-law count C_6 = 6ND to derive the optimal N and D allocation, evaluate the published parametric constants, and distinguish that approximation from Module 06's architecture-aware training count.
- Compute when a smaller model trained on more tokens is cheaper over its life than a compute-optimal one, and explain why exact-match metrics can make a smooth improvement look emergent.
- Implement greedy, temperature, top-k, top-p and min-p decoding on a model's logits, derive dH/dτ = Var_p(z)/τ³, and choose settings for a structured artifact versus open-ended text.
- Measure few-shot accuracy honestly: its dependence on the number, order and labels of demonstrations, and the chat template the model expects.
- Size a request's context: its tokens, KV-cache memory and prefill FLOPs, and where its instructions should go.
- Explain hallucination, poor calibration, the knowledge cutoff, sycophancy and prompt injection by their mechanisms, and design deterministic checks and a trust boundary around a model.
- Put a confidence interval and a paired test on a benchmark comparison, and ask the five questions of any published claim.
- Bound single-stream decode speed by memory bandwidth, derive a price per million tokens, and decide between an API and a dedicated GPU for the case study.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. What a language model computes, and what it reads | Read Section 1: the next-token objective, its units, and the running case study (19); Lab 1: perplexity of SmolLM2-135M on seven kinds of text (30); Read Section 2 and step through the BPE merge widget (21); Lab 2: byte-pair encoding from scratch, and three tokenizers on English and Chinese (40); Exercises 1-2 (BPE by hand, digit policies) (10) |
| 2. Tokens in practice, and the scaling laws | Read Section 3: tokens in practice (15); Exercises 3-4 (the cost of a translation in bits; a bilingual context window) (20); Read Section 4: scaling laws from Kaplan to Chinchilla (22); Lab 3: fitting the Chinchilla law to synthetic runs (30); Read Section 5: over-training and emergence (13); Exercises 5-7 (emergence from a smooth curve; the compute-optimal allocation for the case study's budget; loss predictions and the smallest model that reaches a target) (25) |
| 3. Prompting and decoding | Read Section 6: in-context learning, prompting and the chat format (15); Lab 4: chat templates and in-context learning with Qwen2.5-0.5B-Instruct (35); Read Section 7 and use the sampling explorer (22); Read Section 8: determinism, structured output and the cost of each token (11); Lab 5: sampling from scratch on SmolLM2-135M (35); Exercise 8 (reading a few-shot result) (5) |
| 4. The context window, and what a model cannot do | Exercises 9-10 (entropy against temperature and truncation sets; temperature-0 drift) (15); Guided reading: Holtzman et al. (2020), the nucleus-sampling paper (20); Read Section 9: the context window (14); Exercise 11 (placing instructions in a long request, and its KV cache) (5); Read Section 10: hallucination, calibration and the knowledge cutoff (15); Exercise 12 (a scoring rule that penalises wrong answers) (5); Read Section 11: reasoning limits, sycophancy and prompt injection (15); Exercise 13: a prompt-injection mini-project and its trust boundary (25) |
| 5. Evaluating claims, the landscape, and the bill | Read Section 12: evaluating a claim (17); Exercises 14-15 (the five questions; intervals and a paired test) (15); Read Section 13: the landscape, dated (8); Read Section 14: cost from first principles, and the case study's bill (17); Lab 6: a cost calculator for the case study (20); Guided reading: Hoffmann et al. (2022), the Chinchilla paper, read as a claim to evaluate (25); Self-check quiz (15); Summary and review: the module's formulas and numbers on one page, and the what-goes-wrong list (10) |

**Concept sections.**

- **s1 What a language model is** (19 min). Define a large language model by its training objective and make the loss number interpretable in nats, bits, perplexity and bits per byte. _3 worked example(s), 2 figure(s)._
  - Definition (keep the source's 'That is the whole definition'): a decoder-only transformer (Module 06) trained to predict the next token on a very large corpus.
  - The chain rule: p(x_1, ..., x_T) = Π_t p(x_t \| x_<t).
  - The objective: L(θ) = −(1/T) Σ_t log p_θ(x_t \| x_<t), averaged over tokens and documents.
  - Derive in two lines: E_{x~p_data}[−log p_θ(x)] = H(p_data) + KL(p_data \|\| p_θ) ≥ H(p_data).
  - Units: natural logs give nats;
  - The untrained baseline: a uniform guess over V tokens has loss ln V (Module 06's 8.3 for V = 4,096;
  - … and 4 more points
- **s2 Tokens: byte-pair encoding, step by step** (21 min). Show exactly how a BPE vocabulary is learned and applied, by hand on a six-word corpus, and why byte-level BPE never meets an unknown symbol. _4 worked example(s), 1 figure(s), widget: bpe-merge-stepper._
  - The problem: a word vocabulary cannot represent unseen words and needs millions of entries;
  - BPE training (Sennrich, Haddow and Birch 2016): pre-tokenise into words with counts;
  - Encoding a new word: split into base symbols, then repeatedly apply the lowest-rank merge present until none applies.
  - Byte-level BPE (GPT-2): the base alphabet is the 256 byte values, so any UTF-8 string can be represented and no unknown token exists ('bytes are the floor', source).
  - Decoding concatenates the tokens' bytes and decodes UTF-8.
  - Vocabulary size is the stopping rule;
- **s3 Tokens in practice** (15 min). Connect tokenisation to model size, cost, context and odd behaviour: the other algorithms, vocabulary-size trade-offs, languages, and artefacts. _3 worked example(s), 2 figure(s)._
  - Unigram language-model tokenisation (Kudo 2018): start from a large candidate vocabulary;
  - SentencePiece (Kudo and Richardson 2018): a library that treats the input as a raw character stream with the space as an ordinary symbol '▁', implements both BPE and …
  - Vocabulary size, with formulas: embedding parameters V·d (2V·d if the input and output matrices are untied);
  - Languages: the same content costs different numbers of tokens.
  - Numbers, measured (Lab 2): '2026' → 20\|26 (GPT-2) and 2\|0\|2\|6 (SmolLM2, Qwen2.5);
  - Whitespace and case: 'safety', ' safety', ' Safety' and ' SAFETY' are different token sequences (' SAFETY' is ' SAF'\|'ET'\|'Y' in GPT-2 and SmolLM2).
  - … and 3 more points
- **s4 Scaling laws: from Kaplan to Chinchilla** (22 min). Recall the compute rule C ≈ 6ND from Module 06, derive the compute-optimal allocation from the Chinchilla law, and read the fitted constants critically. _5 worked example(s), 2 figure(s)._
  - The observation that defines the field since 2020 (source): pretraining loss falls predictably, as a power law, in parameters N, tokens D and compute C over many orders …
  - C ≈ 6ND, recalled in one paragraph from Module 06, Section 11, which derives it (do not re-derive it here): a forward pass costs 2 FLOPs per matrix-multiply weight per …
  - The Chinchilla study (Hoffmann et al.
  - Derive the compute-optimal allocation, written out: substitute D = C/(6N) to get L(N) = E + A N^−α + B (C/6)^−β N^β;
  - Evaluate it honestly.
  - Kaplan against Chinchilla: Kaplan's runs used a learning-rate schedule whose length was not matched to each run, counted non-embedding parameters and stopped at smaller …
  - … and 2 more points
- **s5 Beyond compute-optimal: over-training and emergence** (13 min). Explain why practice departs from compute-optimal training, and why the loss is predictable while capabilities are not. _3 worked example(s)._
  - Compute-optimal is not deployment-optimal (source): lifetime cost ≈ 6N·D for training plus 2N·D_inf for serving D_inf tokens, in Chinchilla's accounting (N the total …
  - Practice: Llama 3's 8B model was trained on about 15T tokens, roughly 1,900 per parameter (Grattafiori et al.
  - Diminishing returns: halving the data term B/D^β takes 2^(1/β) = 11.9 times more tokens with β = 0.28.
  - The data wall: good text is finite.
  - Emergent abilities (Wei et al.
  - Keep the source's conclusion: what is not argued is that the loss curve is the thing to plan around, and Module 08 does.
- **s6 In-context learning, prompting and the chat format** (15 min). Explain what conditioning on a prompt does, why few-shot learning works and fails, and how chat models are prompted through a template. _3 worked example(s)._
  - Zero-shot (a description of the task) and few-shot (k demonstrations) in-context learning: the output distribution changes with no gradient step (source).
  - Why it works, as accounts rather than settled facts: the pretraining corpus contains many documents with repeated patterns (lists, question-and-answer pages, tables), …
  - What demonstrations contribute: format and label space matter;
  - Fragility: order sensitivity (Lu et al.
  - Chain of thought (Wei et al.
  - Base versus chat (source): a raw base model continues text rather than answering and 'will as happily continue a question with another question'.
  - … and 3 more points
- **s7 Decoding: from logits to text** (22 min). Derive what each decoding rule does to the next-token distribution, and choose settings by task. _5 worked example(s), widget: sampling-explorer._
  - Setup: logits z ∈ R^V and p = softmax(z) at each step;
  - Greedy: take the argmax.
  - Beam search (basics in Module 04): keep the w best partial sequences (w is the beam width) by summed log-probability, with length normalisation.
  - Temperature τ: p_i(τ) = exp(z_i/τ) / Σ_j exp(z_j/τ).
  - Derive temperature's effect on entropy: with β = 1/τ, log p_i = βz_i − log Z(β), so H = log Z(β) − β E_p[z];
  - Top-k: keep the k most probable tokens and renormalise.
  - … and 5 more points
- **s8 Determinism, structured output and the cost of each token** (11 min). Explain why temperature 0 is not reproducible in practice, what constrained decoding does and does not guarantee, and why generation is sequential and costly. _1 worked example(s)._
  - Floating-point addition is not associative: in float32, (1e8 + 1) − 1e8 = 0 but (1e8 − 1e8) + 1 = 1;
  - Batch invariance: kernels choose reduction orders and tilings by tensor shape, so a request's logits can depend on what else is in the batch.
  - Engineering stance: design for non-determinism.
  - Structured output, generalised from the source: a pipeline that generates a structured artifact (a SysML model fragment, a JSON hazard record) typically sets the …
  - Constrained decoding, in one paragraph (source;
  - Stop conditions (source: stop sequences end generation): end-of-sequence or end-of-turn tokens (<\|im_end\|> for Qwen2.5's chat format), stop strings, and max_new_tokens.
  - … and 1 more points
- **s9 The context window** (14 min). Quantify what a long context costs, and how position and caching change what the model does with it. _2 worked example(s)._
  - What is in the context (source): the system prompt, the conversation, retrieved documents, tool results, and the model's own output so far.
  - Length is fixed at training (the maximum position) and extended afterwards with RoPE base scaling and long-document mid-training (Modules 06 and 08).
  - Memory (source: 'long is not free'): the KV cache holds keys and values for every past token in every layer: bytes per token = 2 · L · n_kv · d_head · bytes per value.
  - Compute: prefill FLOPs ≈ 2·N_matmul·T + 2·L·d·T² (the weights plus causal attention, by Section 4's convention).
  - Position (source: 'position matters'): 'lost in the middle' (Liu et al.
  - Advertised against effective context: retrieving a single 'needle' is easy;
  - … and 2 more points
- **s10 Hallucination, calibration and the knowledge cutoff** (15 min). Explain why a next-token predictor produces confident falsehoods, how to measure whether its confidence means anything, and what engineering contains it. _1 worked example(s), 1 figure(s)._
  - Hallucination (source): fluent, confident, false or unsupported output: a citation that does not exist, a standard clause that was never written, a hazard rating with no …
  - Why (source): the model was trained to produce plausible continuations, and a plausible continuation of 'The applicable clause is' is a clause number.
  - Derive the scoring rule: +1 for a correct answer, −λ for a wrong one, 0 for abstaining;
  - Calibration, recalled in one line from Module 01, Section 7, which defines it with the reliability diagram and the expected calibration error (ECE): among answers given …
  - Mitigations in order of reliability (source's order): verify the output with something that is not a language model;
  - The case-study version of the source's stance (its public form;
  - … and 2 more points
- **s11 Reasoning limits, sycophancy and prompt injection** (15 min). Give the mechanisms behind failures of arithmetic, faithful reasoning and independence, and treat prompt injection as a trust-boundary problem rather than a prompting problem. _2 worked example(s), 1 figure(s)._
  - Arithmetic and counting (source): the model computes with attention and MLPs over tokens;
  - Reasoning (source): whether and how much a model reasons is contested;
  - Sycophancy (source): post-trained models agree with the user more than the evidence warrants, because agreement was rewarded in preference data (Sharma et al.
  - Prompt injection (source): text in the context that instructs the model ('ignore your previous instructions' inside a document it was asked to summarise) is read as …
  - Defences as a trust boundary, generalised from the source's routing gate: decide the task, the tools and the permissions from trusted input (the user's own request) …
  - Pointer: guardrails in depth are in the AI Agents series, guardrails module.
- **s12 Evaluating a claim** (17 min). Give a procedure for judging any number reported about a model, and for building an evaluation of your own. _3 worked example(s), 1 figure(s)._
  - The five questions, made explicit (the source's exercise refers to five questions while its Section 8 lists three): (1) On what data, and could the model have seen it? …
  - The benchmarks named in the source: MMLU (knowledge;
  - Contamination (source): public test sets leak into web crawls, so contamination is the default assumption for any public benchmark.
  - Uncertainty, recalled in one line from Module 01, Section 10: the standard error of an accuracy is √(p(1 − p)/n) and the 95% interval about ±1.96 SE;
  - pass@k for code (Chen et al.
  - Prompt and seed variance: formatting choices alone moved few-shot accuracy by up to 76 points for one 13B model (Sclar et al.
  - … and 2 more points
- **s13 The landscape, dated (October 2026)** (8 min). Give a conservative, dated map of model families, licences and sizes, and the questions to ask of any of them. _1 worked example(s), 1 figure(s)._
  - Date stamp, from the source's habit: 'as of October 2026;
  - Closed, served models (source): the GPT (OpenAI), Claude (Anthropic) and Gemini (Google) families, reached through APIs, at the frontier of capability.
  - Open-weight models (source's list): Llama (Meta), Qwen (Alibaba), DeepSeek, Mistral, Gemma (Google), GLM (Zhipu AI), Yi and InternLM, plus Phi (Microsoft).
  - Sizes and where they run (source): under 1B (on-device;
  - Reasoning models (2024 onward;
  - Multimodal models (source): text plus images, sometimes audio and video, through separate encoders whose outputs are projected into the token stream.
  - … and 2 more points
- **s14 Cost from first principles, and the case study's bill** (17 min). Derive single-stream decode throughput and a price per million tokens from bytes, FLOPs and bandwidth, size the case-study model once for Modules 08-10, and decide how the case study should run its model. _5 worked example(s), 2 figure(s)._
  - Inference FLOPs by Section 4's convention (Module 06): 2·N_matmul per token, 1.79×10^10 for the case-study model, plus attention, 4·L·d·t per generated token at context …
  - The case-study model's bytes, derived once here so that Modules 08-10 can reproduce them (worked example): N = 9,550,729,216 from its configuration;
  - Two hardware numbers: peak matrix throughput (FLOP/s) and memory bandwidth (bytes/s).
  - Decode is memory-bound at small batch (source): generating a token reads every weight once, so one sequence decodes at most at bandwidth / weight bytes tokens per second;
  - Batching, in one paragraph (source: it amortises the weight reads): one read of the weights serves B sequences in a step, so throughput grows almost linearly with the …
  - Prefill is compute-bound and parallel;
  - … and 6 more points
- **What goes wrong.** 14 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: Perplexity: what the loss says about a text | 30 | ~1 min | 269 MB | Measure SmolLM2-135M's loss on seven kinds of text, convert between nats, bits, perplexity and bits per byte, and see memorisation and in-context copying in the per-token losses. |
| lab2: Byte-pair encoding from scratch, and three tokenizers on English and Chinese | 40 | ~1 min | 18 MB | Reproduce Section 2's hand-worked merges in code, build a byte-level BPE that round-trips any string, and measure what production tokenizers do to the same content in English and … |
| lab3: Fitting the Chinchilla law | 30 | ~3 min | none | Fit the parametric loss to synthetic training runs the way Hoffmann et al. |
| lab4: Prompting a small instruct model: chat templates and in-context learning | 35 | ~4 min | 988 MB | See the chat template the model was trained on, generate with and without it, and measure how few-shot accuracy depends on the number, order and labels of the demonstrations. |
| lab5: Sampling from scratch | 35 | ~3 min | none | Implement temperature, top-k, top-p and min-p on SmolLM2-135M's logits; |
| lab6: A cost calculator for the case study | 20 | ~1 min | none | Count the case-study model's parameters and bytes from its configuration, turn bandwidth into a single-stream decode bound and an hourly price into a price per million tokens, … |

**Exercises** (15: 8 ★, 6 ★★, 1 ★★★; 125 minutes).

- e1 ★ conceptual, 5 min: Using the seven merges learned from the weld corpus in Section 2 (e+l, d+_, w+el, e+d_, wel+d, wel+d_, weld+ed_, in that order), encode 'meld', …
- e2 ★ conceptual, 5 min: Lab 2 found that GPT-2 splits '1234567' as 123\|45\|67 and '2026' as 20\|26, while SmolLM2 and Qwen2.5 split every digit.
- e3 ★★ calculation, 10 min: In Lab 1, SmolLM2-135M scored 3.250 nats per token over the 89 tokens (463 bytes, 80 words) of the English paragraph and 2.129 nats per token over …
- e4 ★★ calculation, 10 min: For the same 80-word paragraph Lab 2 measured 89 English tokens with every tokenizer, and 256, 219 and 71 tokens for its 119-character Chinese …
- e5 ★ conceptual, 5 min: Across three sizes of a model family, per-token accuracy on 20-token answers rises 0.85 → 0.92 → 0.97.
- e6 ★★ derivation, 10 min: Starting from L(N, D) = E + A/N^α + B/D^β and C = 6ND, derive N_opt(C) and D_opt(C), and show that at the optimum the parameter term is β/α times the …
- e7 ★★ calculation, 10 min: (The source's exercise 2, extended.) Use the published fit (E = 1.69, A = 406.4, B = 410.7, α = 0.34, β = 0.28).
- e8 ★ conceptual, 5 min: In Lab 4, with abstract labels A and B, the model answered 'A' to every statement at k = 0;
- e9 ★★ derivation, 10 min: Let p_i(τ) = exp(z_i/τ) / Σ_j exp(z_j/τ).
- e10 ★ conceptual, 5 min: A colleague sends the same prompt 100 times at temperature 0 to a hosted model and receives 3 distinct outputs.
- e11 ★ conceptual, 5 min: A request contains, in order, the instructions (300 tokens), a 25,000-token standard and the question (100 tokens).
- e12 ★ conceptual, 5 min: An evaluation awards +1 for a correct answer, −2 for a wrong answer and 0 for 'I don't know'.
- e13 ★★★ project, 25 min: (The source's exercise 4, extended.) Using Qwen2.5-0.5B-Instruct from Lab 4, build a summariser: a system message asking for a one-sentence summary …
- e14 ★ conceptual, 5 min: (The source's exercise 5.) Take a published claim of the form 'Model X scores 85.2% on benchmark Y, beating model Z'.
- e15 ★★ calculation, 10 min: On HumanEval's 164 problems model A solves 102 and model B 97.

**Quiz** (12 questions): A model gives the four actual next tokens of a sentence probabilities 0.50, …; Why does byte-level BPE never need an unknown token?; SmolLM2-135M has a per-token perplexity of 25.8 on an English paragraph and 8.4 …; With the published Chinchilla exponents α = 0.34 and β = 0.28, by what factor …; Why might a team train an 8B model on 15T tokens, far beyond 20 tokens per …; Which statement about the temperature τ is true?; For preset B (safe 0.849, secure 0.036, robust 0.029, reliable 0.022, ...), …; A model returns different completions for identical requests with sampling …; For the case-study model (36 layers, 8 KV heads of dimension 128, bf16), how …; Which measure actually defends a document summariser against prompt injection?; On GSM8K's 1,319 problems model A solves 943 (71.5%) and model B 903 (68.5%).; An evaluation scores +1 for a correct answer, −1 for a wrong one and 0 for 'I …

**Guided reading.**

- Hoffmann, J., Borgeaud, S., Mensch, A., et al. "Training compute-optimal large language models." NeurIPS, 2022. (25 min). The paper behind '20 tokens per parameter', and a model of how to read a scaling paper: three estimation methods, one decision, and constants worth checking.
- Holtzman, A., Buys, J., Du, L., Forbes, M., Choi, Y. "The curious case of neural text degeneration." ICLR, 2020. (20 min). The paper that named the failure of maximisation-based decoding and introduced nucleus (top-p) sampling;

**Interactive widgets.**

- `sampling-explorer` (in s7): Temperature reshapes the whole next-token distribution without changing its ranking, while top-k, top-p and min-p cut its tail;
- `bpe-merge-stepper` (in s2): BPE is counting adjacent pairs and merging the most frequent one, again and again;

**Key terms:** 30 English–Chinese pairs. **References:** 50.

### Module 08: LLM pretraining

Everything between a pile of text and a base model: the compute budget, the data pipeline, the architecture and optimiser settings that hold at scale, the memory and parallelism arithmetic that decides what fits where, what breaks in a long run, and the two cheaper relatives an organisation actually runs, mid-training and continued pretraining. You work out on paper how a 9.5B-parameter base like the case study's is made and what continuing its pretraining would cost, then build a deduplication pass and pretrain, destabilise and adapt small GPTs on your own laptop.

**Before you start:** Module 02: backpropagation, AdamW and learning-rate schedules, normalisation, debugging a training run; Module 06: the modern decoder block (RMSNorm, SwiGLU, RoPE, GQA, FlashAttention), parameter and FLOP counting (the FLOP rule this module applies), the tiny-GPT training loop; Module 07: the language-modelling objective and perplexity, BPE tokenisation, the Chinchilla scaling law L(N, D) with its compute-optimal allocation and the over-training argument, and the running case study; Module 05 (Section on mixture of experts) for the MoE concept; this module covers MoE engineering at scale; Probability: expectation, variance, independence and the binomial distribution (for MinHash, LSH and benchmark noise); Comfort with orders of magnitude and units: FLOPs, FLOP/s, bytes, GB, GB/s.

**You will be able to:**

- Compute the training FLOPs, GPU-hours and calendar time of a run from its configuration, D, hardware peak and MFU with the series' FLOP rule (6ND without the input embedding, plus causal attention), and say how far the shortcut 6ND is off and why.
- Use the Chinchilla fit to compare a compute-optimal and an over-trained run, including the number of served tokens at which over-training pays for itself and who pays it back.
- Design a web-scale data pipeline (extraction, language ID, heuristic and model-based quality filters, PII handling, deduplication, decontamination, mixture, tokenizer, packing) and justify the order of its stages.
- Implement MinHash with LSH banding, derive the candidate probability 1 - (1 - s^r)^b, and choose b and r for a target similarity threshold.
- Size a decoder (layers, width, heads, FFN width, vocabulary) to a parameter budget, and state what changes in memory, compute and communication when its FFNs become a mixture of experts.
- Set AdamW, the learning-rate schedule, batch size, gradient clipping, z-loss, QK-norm and numerical precision for a run, naming the failure each one prevents.
- Compute per-GPU memory for weights, gradients, optimiser states, activations and logits under data parallelism and ZeRO stages 1-3, with and without activation checkpointing, and choose a parallel layout (FSDP/HSDP, tensor, pipeline, context) for a given cluster.
- Diagnose a loss spike, a divergence, a data-loader bug or a hardware fault from training logs, and set a checkpoint interval from a failure rate.
- Decide whether a team should continue pretraining an open base on its domain: measure the gap first, cost the run, and fix the go/no-go rule before spending.
- Pretrain a 5.8M-parameter GPT on a laptop with a complete pipeline and logging, and continue a small base's pretraining on a domain corpus, measuring forgetting with and without replay.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. The run, its budget and its data | Read s1: what pretraining is, the case study, the FLOP rule and MFU, the compute decision (with the compute-budget planner) (19); Exercises e1-e3: fixed decisions, Chinchilla at 10^21 FLOPs, tokens from a GPU budget (25); Read s2-s3: sources, extraction and quality filters; deduplication and decontamination (37); Lab 1: quality filters and MinHash-LSH from scratch (40); Exercise e5: the curly-bracket rule and code (5) |
| 2. Mixtures, model shape and the optimiser; a first run | Read s4: mixtures, multilingual balance, the tokenizer and packing (15); Guided reading: the FineWeb paper (20); Exercise e6: repeating a small source (5); Read s5-s6: architecture at scale, MoE and muP; AdamW, schedules and batch size (35); Lab 2: pretrain a small GPT on TinyStories (start the full run, read the logs as it goes) (50) |
| 3. Stability, precision and memory | Read s7: clipping, z-loss, QK-norm, bf16 and fp8 (17); Lab 3: provoke an instability, then find the fix that works (30); Exercises e7-e8: z-loss and shift invariance; the critical batch size (15); Read s8-s9: memory accounting; data parallelism, ZeRO and FSDP (with the memory planner) (30); Lab 4: a budget and memory calculator (35) |
| 4. Parallelism, failure and evaluation | Read s10: tensor, pipeline and context parallelism; choosing a layout (18); Exercises e9-e10: memory per GPU for another model; shrinking a pipeline bubble (15); Read s11: what breaks, and how a long run is operated (16); Exercises e11-e12: a periodic loss; how the checkpoint interval scales (10); Read s12: evaluation during the run and the base-model checkpoint (13); Exercises e4 and e13 (spaced revisits): designing LSH bands; a bf16 update (20); Guided reading: ZeRO, and small-scale proxies for training instabilities (30) |
| 5. Small runs, mid-training and continued pretraining | Read s13-s14: a small run you can do; mid-training and continued pretraining (31); Lab 5: continued pretraining with and without replay (35); Exercises e14-e15: tuning a forgetful CPT run; the scaling check and a duplicated shard (35); Self-check quiz (16); Summary and review: the decision checklist of s1 filled in for the case study, and the what-goes-wrong list (10) |

**Concept sections.**

- **s1 What pretraining is, and the budget first** (19 min). Define a pretraining run as one objective pursued under a compute budget fixed in advance, apply the series' FLOP rule to turn a budget into GPU-hours and calendar days, and make the compute decision for how a base like … _4 worked example(s), 2 figure(s), widget: compute-budget-planner._
  - The objective $\mathcal{L}(\theta) = -\frac{1}{\|\mathcal{D}\|}\sum_{\text{docs}}\sum_t \log p_\theta(x_t \mid x_{<t})$ over packed token sequences (perplexity and the …
  - Why the decisions come first: a run is a single objective pursued for weeks under a compute budget fixed in advance, and a restarted run has spent its budget.
  - The running case study, recalled from Module 07 and explicitly hypothetical: an engineering team adapts an open-weight bilingual English-Chinese model of about 9.5B …
  - The FLOP rule, recalled rather than derived (Module 06, Section 11 derives it and owns the convention;
  - The rule applied to the case study (worked example): forward $1.79 \times 10^{10}$ FLOPs per token;
  - From FLOPs to time: GPU-hours = C / (peak x MFU x 3,600).
  - … and 5 more points
- **s2 Data I: sources, extraction, language and quality filters** (18 min). Turn crawled and collected text into clean candidate documents, with each filter's rule, its threshold, and what it wrongly removes. _2 worked example(s), 1 figure(s)._
  - Data quality is the largest lever after scale, and the pipeline is most of the engineering (source's framing).
  - Sources: Common Crawl (monthly snapshots of billions of web pages;
  - Text extraction: navigation, cookie banners, footers and repeated headers removed with extractors built for the purpose (trafilatura and its kind) run on the WARC HTML …
  - Language identification: a linear classifier over character n-gram features (fastText's language-ID model is the common one) gives a score per language;
  - Heuristic quality filters with the Gopher thresholds (Rae et al.
  - C4's line-level rules (Raffel et al.
  - … and 5 more points
- **s3 Data II: deduplication and decontamination** (19 min). Explain why duplicates hurt, derive MinHash and the LSH banding S-curve, and keep evaluation data out of the training set before it can inflate results. _4 worked example(s), 2 figure(s)._
  - Why deduplicate: duplicates waste compute, raise memorisation and verbatim regurgitation, and tilt the mixture toward whatever was copied most.
  - Exact deduplication: normalise (lower-case, collapse whitespace), hash (SHA-1 or a 64-bit hash), keep the first occurrence;
  - Near-duplicates: shingle each document into word $n$-grams (5-grams here) and measure Jaccard similarity $J(A,B) = \|A \cap B\| / \|A \cup B\|$.
  - MinHash, derived: under a random permutation $\pi$ of the shingle universe, $P[\min \pi(A) = \min \pi(B)] = J(A,B)$, because the smallest element of $\pi(A \cup B)$ is …
  - LSH banding, derived: split the $k = br$ signature into $b$ bands of $r$ rows;
  - Cost: comparing all pairs is n(n - 1)/2 comparisons;
  - … and 3 more points
- **s4 Data III: mixtures, multilingual balance, the tokenizer and packing** (15 min). Choose the proportions of each source and language, fix the tokenizer before anything else, and turn documents into dense training sequences. _4 worked example(s), 1 figure(s)._
  - A mixture is a set of weights w_s summing to 1;
  - What sources buy (source's points, kept): proportions are chosen, not inherited;
  - Tuning the mixture: proxy runs at 100M-1B parameters with candidate mixtures, compared on per-domain held-out loss and a small benchmark battery;
  - Multilingual balance by temperature sampling: sample language $l$ with probability $p_l \propto q_l^{\alpha}$, where $q_l$ is its share of the available data;
  - The tokenizer as a pipeline decision (the BPE algorithm is Module 07's): trained on a sample of the final mixture before anything else, because everything downstream is …
  - Packing: documents joined with an end-of-document token and cut into length-T sequences, so no compute is spent on padding.
  - … and 1 more points
- **s5 Architecture at scale: sizes, mixture of experts, muP** (18 min). Size a decoder to a parameter budget, explain what changes when its FFNs become a mixture of experts at scale, and show how hyperparameters found on a small model are carried to a large one. _6 worked example(s), 2 figure(s)._
  - The parameter count of the modern block (Module 06) in general form: per layer $d\,(n_h d_h) + 2d\,(n_{kv} d_h) + (n_h d_h)\,d + 3 d\, d_{ff} + 2d$, plus embeddings $Vd$ …
  - The 8/3 rule derived: a GELU MLP with hidden width 4d has 2 x d x 4d = 8d^2 parameters;
  - The case study's configuration (Module 07's model, hypothetical;
  - The source's decision table, kept with one line of reason per row: layers 32-42;
  - Width versus depth: at fixed N the loss is nearly flat over a wide range of shapes (Kaplan et al.
  - Mixture of experts at LLM scale (the concept is Module 05's): each FFN replaced by E expert FFNs and a router (a d x E linear layer and a softmax);
  - … and 4 more points
- **s6 The optimiser recipe: AdamW, schedules, batch size** (17 min). Set the optimiser, the learning-rate schedule and the batch size for a long run, with the reason for every number. _4 worked example(s), 2 figure(s)._
  - AdamW reminder (Module 02 owns it): $m \leftarrow \beta_1 m + (1-\beta_1) g$, $v \leftarrow \beta_2 v + (1-\beta_2) g^2$, bias correction, $\theta \leftarrow \theta - …
  - Why beta2 = 0.95 rather than 0.999: the second-moment average remembers about 1/(1 - beta2) steps (20 versus 1,000);
  - epsilon: when gradient RMS falls toward epsilon (large or deep models late in training) the update is damped;
  - Weight decay as a timescale: decoupled decay multiplies weights by (1 - eta lambda) each step, a forgetting time of 1/(eta lambda) steps, to be compared with the length …
  - The learning rate is the most important number in the run: set from a sweep at small scale plus muP or a fitted scaling rule;
  - Warmup, linear over the first 1,000-2,000 steps, with the reasons: Adam's v starts from too few samples;
  - … and 5 more points
- **s7 Stability and precision: clipping, z-loss, QK-norm, bf16 and fp8** (17 min). Explain the number formats a run uses and the small additions that keep a long run from diverging. _5 worked example(s), 1 figure(s)._
  - The formats, as a table: fp32 (1 sign, 8 exponent, 23 mantissa bits;
  - Mixed precision as run (source's recipe, expanded): matmul inputs in bf16 with fp32 accumulation;
  - fp16 needs loss scaling (Micikevicius et al.
  - fp8: E4M3 for weights and activations in the forward pass, E5M2 (more range) for gradients in some recipes;
  - Gradient clipping by global norm: $g \leftarrow g \cdot \min(1, c/\lVert g\rVert_2)$ over all parameters together, $c = 1.0$.
  - z-loss: $\mathcal{L}_z = 10^{-4}(\log Z)^2$ with $Z = \sum_j e^{z_j}$;
  - … and 3 more points
- **s8 Memory accounting** (14 min). Count every byte a training step needs on a GPU, so that whether a configuration fits is a calculation rather than a trial. _4 worked example(s), 1 figure(s)._
  - The 16-bytes-per-parameter rule, derived two ways: (a) bf16 weights 2 + bf16 gradients 2 + fp32 master weights 4 + Adam first moment 4 + Adam second moment 4 = 16;
  - Activations: what the backward pass needs from each layer (Module 02), counted for the case study's block with FlashAttention and no dropout, in bf16: the two norm …
  - Without FlashAttention the softmax probabilities add 2 n_h T^2 bytes per layer (more with dropout masks): the T^2 term FlashAttention removes by recomputing them …
  - The logits: T x V x 4 bytes in fp32 for the loss, often the largest single tensor in the step;
  - Activation checkpointing (also called gradient checkpointing): store each layer's input (2d bytes per token per layer) and recompute the layer's forward pass during the …
  - Other consumers: communication buffers, temporary workspaces and allocator fragmentation (leave 5-10% headroom);
  - … and 2 more points
- **s9 Data parallelism, ZeRO and FSDP** (16 min). Spread one model's training over many GPUs by replicating or sharding its states, with the memory and the communication of each option derived. _3 worked example(s), 2 figure(s), widget: memory-planner._
  - Data parallelism: every GPU holds the whole model and a slice of the global batch;
  - Ring all-reduce, derived: a reduce-scatter followed by an all-gather around a ring of N_d GPUs, each in N_d - 1 steps of S/N_d bytes;
  - ZeRO (Rajbhandari et al.
  - FSDP: PyTorch's implementation of stage 3, gathering each wrapped unit's weights just before use and freeing them after;
  - Hybrid sharding (HSDP): shard within a node over fast links, replicate across nodes, and all-reduce only each shard's gradients across nodes once per optimiser step.
  - Bandwidths to reason with (typical as of 2026;
  - … and 1 more points
- **s10 Tensor, pipeline and context parallelism; choosing a layout** (18 min). Split single layers, stacks of layers and long sequences across GPUs, derive what each costs, and combine them into a layout for a given model and cluster. _4 worked example(s)._
  - Tensor parallelism (Megatron-LM, Shoeybi et al.
  - Sequence parallelism (Korthikanti et al.
  - Pipeline parallelism: layers split into p stages;
  - Context parallelism for long sequences: the sequence split into chunks across GPUs;
  - A summary table of communication per GPU at case-study scale: DP all-reduce, 2N elements per optimiser step;
  - Choosing a layout, as a procedure: (1) does the model, with ZeRO over the node and a micro-batch of one sequence, fit with its activations? (2) if FSDP across nodes is …
  - … and 1 more points
- **s11 What breaks, and how a long run is operated** (16 min). Recognise how a long run fails (numerically, in its data, in its hardware) and set up the checkpoints and monitoring that make each failure recoverable. _3 worked example(s)._
  - Loss spikes: the loss jumps and either recovers or diverges.
  - Divergence: the loss climbs steadily or becomes NaN;
  - NaN and inf: sources (log of zero, division by a zero norm, fp16 overflow, a corrupted input);
  - Data bugs that look like optimisation problems (source's examples, expanded with signatures): a shard duplicated many times (the training loss falls suspiciously while …
  - Hardware: GPU failures, nodes dropping out, network and filesystem stalls.
  - Silent data corruption: a device that computes wrong numbers without raising an error (Dixit et al.
  - … and 4 more points
- **s12 Evaluation during the run, and the base-model checkpoint** (13 min). Decide what to measure while the run is going so that a bad run is caught early, and describe what the finished base model is and is not. _2 worked example(s)._
  - Held-out perplexity per source, every few hundred steps, on data removed from the mixture before training;
  - Downstream tasks for a base model, scored by log-likelihood: for each multiple-choice item compute the sum of log p(option tokens \| context) for each option, optionally …
  - Noise: an accuracy on n items has standard error sqrt(p(1 - p)/n);
  - The scaling-law check: predict the final loss from small runs, or fit L(D) = L_inf + a D^-gamma to the run's own early curve (not Chinchilla's letters, so B stays the …
  - Choosing and averaging checkpoints: evaluate several late checkpoints;
  - The base-model checkpoint (source s9, kept): weights, tokenizer, configuration, training log, data manifest with the decontamination record, evaluation curves.
- **s13 A small run you can actually do** (11 min). Turn the source's 125M-parameter recipe into a costed plan for one GPU, and connect it to the laptop-scale run of Lab 2. _4 worked example(s)._
  - The source's recipe, kept as a block: data, a public cleaned web corpus (a FineWeb-Edu sample), 2-3B tokens, with a 32k BPE trained on it;
  - The corrected parameter count: with a 32,000-token vocabulary the model has 109.5M parameters (85.0M in the blocks, 24.6M in the tied embedding), not 125M;
  - The cost: 6ND = 1.64 x 10^18 FLOPs, 1.93 x 10^18 with attention at T = 2,048 (+17%);
  - The expected loss: the source's 'about 3.0 nats per token on English web text (perplexity near 20)' kept as an order of magnitude, with two caveats: per-token losses …
  - What Module 06's tiny-GPT Decoder lacks for this run: the data pipeline and a loader with state, the schedule, mixed precision, checkpointing, logging and evaluation, …
  - The laptop version, Lab 2: 5.8M parameters, 2.46M tokens of TinyStories, about 10 minutes on a CPU with QUICK mode in about 3;
- **s14 Mid-training and continued pretraining** (20 min). Explain the two cheaper relatives of pretraining (annealing on high-quality data with context extension, and continuing a released base model on a domain) and cost, in full, the case study's decision to continue … _4 worked example(s)._
  - Mid-training: a stage between pretraining and post-training on a smaller, higher-quality mixture (more code and mathematics, curated reference text, synthetic …
  - Context extension: pretrain at 4k-8k, then train on long documents at 32k-128k with the RoPE base raised or positions interpolated;
  - Continued pretraining (CPT): start from released base weights and continue next-token training on a domain corpus;
  - The source's three rules, expanded: (1) mix in general data (replay), 5-10% or more of a corpus like the base's, more for a larger shift (Ibrahim et al.
  - Forgetting measured: the change in general held-out loss and in a general benchmark battery before and after;
  - Tokenizer fit in CPT: a base tokenizer may fragment domain vocabulary (Lab 5 measures 2.34 tokens per word on its domain text against 1.30 on general text, and a …
  - … and 3 more points
- **What goes wrong.** 14 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: A mini data pipeline: quality filters and MinHash-LSH from scratch | 40 | ~1 min | 10 MB | Build the heuristic filters and the near-duplicate detector of s2-s3 on a corpus with known junk and known duplicates, and check MinHash and the LSH S-curve against the theory. |
| lab2: Pretrain a small GPT on TinyStories | 50 | ~10 min | none | Run the whole pipeline of s13 at laptop scale (tokenizer, packing, model, AdamW with warmup-cosine, clipping, logging with throughput and MFU, evaluation, checkpointing and … |
| lab3: Provoke an instability, then find the fix that works | 30 | ~5 min | none | Reproduce at laptop scale the high-learning-rate instability of s7, diagnose it from logged signals, measure what warmup, clipping, z-loss and QK-norm each contribute, and draw a … |
| lab4: A budget and memory calculator | 35 | ~1 min | none | Write the arithmetic of s1, s5, s8 and s9 as small Python functions (with a preview of s10 and s11), reproduce the module's tables from them, and use them to decide which … |
| lab5: Continued pretraining with and without replay | 35 | ~5 min | none | Train a small base inside the lab, continue its pretraining on a synthetic corpus of safety-case arguments, and measure adaptation and forgetting for different replay ratios and … |

**Exercises** (15: 8 ★, 6 ★★, 1 ★★★; 130 minutes).

- e1 ★ conceptual, 5 min: List four decisions that must be fixed before a pretraining run starts, because changing them later wastes the compute already spent, and one …
- e2 ★★ calculation, 10 min: For a compute budget C = 10^21 FLOPs, compute the compute-optimal N and D by the 20-tokens-per-parameter rule and the loss predicted by the …
- e3 ★★ calculation, 10 min: A team has 64 H100 GPUs (989 TFLOP/s dense bf16 each, the series' assumed peak) for 30 days and expects 38% MFU.
- e4 ★★ derivation, 10 min: Derive the probability that a pair with Jaccard similarity s becomes an LSH candidate with b bands of r rows.
- e5 ★ conceptual, 5 min: C4's cleaning removed every page containing a curly bracket.
- e6 ★ conceptual, 5 min: A 2T-token run gives a 15B-token mathematics source 3% of its tokens, so the run sees it four times.
- e7 ★ conceptual, 5 min: Show common-logit-shift invariance of cross-entropy, derive the z-loss gradient and explain why it can improve numerical stability;
- e8 ★★ derivation, 10 min: Starting from Delta L_opt(B) = Delta L_max / (1 + B_noise/B), derive the number of steps S and tokens D needed to reach a fixed loss as functions of …
- e9 ★★ calculation, 10 min: Llama 3 8B's shape (s5): L = 32, d = 4,096, 32 query and 8 KV heads of 128 (h_kv = 1,024), SwiGLU d_ff = 14,336, V = 128,256, untied, 8,030,261,248 …
- e10 ★ conceptual, 5 min: A pipeline-parallel run with GPipe scheduling spends a third of its time idle in the bubble.
- e11 ★ conceptual, 5 min: Your training loss shows a sawtooth with a period of exactly 1,000 steps that is not in the learning-rate schedule.
- e12 ★ conceptual, 5 min: A team checkpoints every 5,000 steps because writing a checkpoint takes 2 minutes.
- e13 ★★ calculation, 10 min: A weight equal to 0.5 is stored in bf16 and receives an update of 1 x 10^-3.
- e14 ★ conceptual, 5 min: A continued-pretraining run lowers domain perplexity by 20% but raises general held-out loss by 0.15 nats and costs 3 points on a general benchmark …
- e15 ★★★ project, 30 min: Scaling check and a duplicated shard, at laptop scale (source exercise 5).

**Quiz** (12 questions): A 2B-parameter dense model is trained on 100B tokens.; In bf16 mixed precision with Adam and fp32 master weights, how many bytes of …; Why do LLM pretraining recipes set Adam's beta2 to 0.95 rather than the default …; MinHash with k = 128 hash functions estimates a pair's Jaccard similarity of 0.8.; With LSH banding of b = 16 bands and r = 8 rows, about how likely is a pair …; Under ZeRO stage 2 with N parameters on N_d GPUs (16 bytes per parameter in …; A GPipe pipeline has p = 4 stages and m = 12 micro-batches.; Which statement about bf16 and fp16 is correct?; Full activation checkpointing (store each layer's input, recompute the layer in …; Why is tensor parallelism normally confined to the GPUs of one node?; A continued-pretraining run on domain text only raises the general held-out …; On a 500-item benchmark, checkpoint A scores 41% and checkpoint B 44%.

**Guided reading.**

- Penedo, G., Kydlíček, H., Ben Allal, L., Lozhkov, A., Mitchell, M., Raffel, C., von Werra, L., Wolf, T. "The FineWeb datasets: Decanting the web for the finest text data at scale." NeurIPS Datasets and Benchmarks Track, 2024. (20 min). The best-documented public web pipeline: every stage of s2-s4 with an ablation behind it, including the negative results (global deduplication) that recipes usually omit.
- Rajbhandari, S., Rasley, J., Ruwase, O., He, Y. "ZeRO: Memory optimizations toward training trillion parameter models." SC20: International Conference for High Performance Computing, Networking, Storage and Analysis, 2020. (15 min). The source of the 16-bytes-per-parameter accounting and of the three sharding stages that s8 and s9 derive and that FSDP implements.
- Wortsman, M. et al. "Small-scale proxies for large-scale Transformer training instabilities." ICLR, 2024 (arXiv 2023). (15 min). Shows that the instabilities of large runs can be reproduced and fixed in small models at high learning rates: the method Lab 3 copies, and the evidence behind QK-norm, …

**Interactive widgets.**

- `compute-budget-planner` (in s1): Training compute follows from the configuration and D (the series' rule: 6ND without the input embedding, plus attention), calendar time from GPUs x peak x MFU, and at a fixed budget the predicted …
- `memory-planner` (in s9): Model states (16 bytes per parameter) are what ZeRO shards;

**Key terms:** 30 English–Chinese pairs. **References:** 55.

### Module 09: LLM post-training

Turns a base model into an assistant: supervised fine-tuning and its mechanics, low-rank adapters, reward models and RLHF, DPO derived in full, and reinforcement learning with verifiable rewards, together with the evaluation that decides whether any of it worked.

**Before you start:** Module 01: expected calibration error; standard errors, the bootstrap and paired comparisons of two models; Module 02: backpropagation, AdamW, learning-rate schedules with warmup, mixed precision; Module 06: the decoder block, causal masking, tied embeddings, parameter counting and the FLOP convention; Module 07: tokenisation and special tokens, sampling and decoding, hallucination, calibration and the abstention scoring rule, the running case study and its workload; Module 08: memory accounting at 16 bytes per trained parameter, activation checkpointing, sequence packing, reserved chat tokens, the case study's continued pretraining; Probability: logistic function, Bernoulli and binomial variables, expectation, KL divergence in nats, standard error of a proportion; Calculus: Lagrange multipliers; the log-derivative identity d log f = df / f.

**You will be able to:**

- render a conversation with a chat template, write the masked SFT loss over assistant tokens, and diagnose template, end-of-turn and untrained special-token failures.
- implement LoRA from scratch, count its trainable parameters, merge it exactly into the base weights, and size LoRA and QLoRA training memory for the 9.5B case-study model.
- derive the Bradley-Terry model, train a reward model on comparisons, and evaluate it for accuracy against the label-noise ceiling, calibration and overoptimisation.
- derive the policy gradient with a baseline and explain PPO's clipped objective and why RLHF with PPO holds four models in memory.
- derive the closed-form optimum of the KL-regularised objective and the DPO loss from it, implement DPO, and recognise likelihood displacement from off-policy pairs.
- implement GRPO with group-relative advantages and a KL term, predict which groups carry no signal, and design a verifiable reward that a degenerate output cannot satisfy.
- build a behavioural evaluation suite with programmatic checkers and report pass rates with bootstrap confidence intervals, paired differences and an exact test.
- explain how refusals, abstention, honesty and tool use are trained, and how over-refusal, sycophancy and guessing arise from the training signal.
- plan a post-training recipe for a domain model with explicit data, compute arithmetic and promotion gates, and justify each choice.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. From base model to assistant: supervised fine-tuning | Read section 1: what post-training is for (11); Exercise e1: choosing a stage for a behaviour (5); Read sections 2-3: SFT data, SFT mechanics and limits (35); Lab 1: SFT of SmolLM2-135M with prompt-token loss masking (40); Exercise e2: loss masking and normalisation (5); Read section 4: LoRA and QLoRA (23) |
| 2. Adapters, reward models and the RLHF objective | Lab 2: LoRA from scratch, train, merge and verify (30); Exercises e3-e4: LoRA initialisation; LoRA and QLoRA sizing for the 9.5B model (15); Read section 5: preferences and reward models (18); Lab 3: a Bradley-Terry reward model with a known true reward (25); Exercise e5: Bradley-Terry from Gumbel noise, shift invariance, Elo (10); Read section 6: RLHF with PPO (20) |
| 3. Direct preference optimisation | Guided reading: InstructGPT (Ouyang et al. 2022) (12); Read section 7: DPO, with the KL-regularised policy explorer (25); Lab 4: DPO from scratch: the exact bandit check, then on-policy and off-policy pairs (30); Exercises e6-e8: derive pi* and the DPO loss; likelihood displacement without arithmetic; passes and memory of PPO, DPO and GRPO (30); Guided reading: DPO (Rafailov et al. 2023) (18); Read section 8: sample, verify, keep (12); Exercise e9: coverage, expert iteration and the reach of best-of-n (5) |
| 4. Reinforcement learning with verifiable rewards; safety and honesty | Read section 9: GRPO and RL with verifiable rewards, with the group explorer (24); Lab 5: expert iteration, GRPO, and a flawed verifier (35); Exercises e10-e11: GRPO advantages and signal; a verifiable fault-tree reward (35); Guided reading: DeepSeek-R1 (DeepSeek-AI 2025) (15); Read section 10: safety, refusal and honesty (14); Exercise e12: calibration and abstention after preference training (5) |
| 5. Tools, evaluation, merging and the case study | Read sections 11-12: tools and agents; evaluation (24); Lab 6: a behavioural suite with bootstrap confidence intervals and a simulated judge (25); Exercises e13-e14: a paired comparison with McNemar's test; reading a judge's biases (15); Read section 13: merging and averaging (8); Exercise e15: merging two adapters (5); Read section 14: the case study's post-training recipe (17); Read: what goes wrong (5); Self-check quiz (15); Summary and review: redraw the pipeline of Figure 9.1 from memory and annotate each stage with its loss, its data and its failure mode (10) |

**Concept sections.**

- **s1 What post-training is for** (11 min). Say what a base model lacks, what post-training installs, why it is cheap and fragile, and the order in which its three families are usually applied. _2 worked example(s), 1 figure(s)._
  - A base model (Module 08) is a model of text: it completes 'The three ISO 26262 ASIL parameters are' correctly and continues 'Q: What are they? A:' with something, but …
  - Post-training installs behaviour on top of knowledge, with thousands to millions of examples against trillions of pretraining tokens: that is why it is cheap, why one …
  - Evidence that behaviour is cheap relative to capability: labellers preferred the outputs of InstructGPT's 1.3B model to those of the 175B GPT-3, a model 100 times larger …
  - The three families in their usual order: SFT (demonstrations), preference optimisation (pairs), reinforcement learning (generate, score, push probability toward high …
  - A table with one row per stage: data unit, training signal, what it teaches, typical scale, what dominates cost (SFT: conversations, token log-likelihood, format and …
  - Four published pipelines as patterns, not recipes: InstructGPT (SFT, reward model, PPO);
  - … and 1 more points
- **s2 Supervised fine-tuning: the data** (14 min). Define an SFT example, list where good ones come from, and show why quality, coverage and distribution match beat volume. _1 worked example(s), 1 figure(s)._
  - An SFT example is a conversation: a system prompt, one or more user turns, and the assistant turns the model should have produced;
  - Human-written demonstrations: highest quality and most expensive.
  - Distillation: a stronger model answers the prompts, its answers are the targets, filtered by a checker or judge.
  - Self-generation with filtering: the model's own samples, kept when they pass a verifier (Section 8).
  - Synthetic edits: for behaviours such as 'change only what was asked', apply scripted modifications to real artifacts so that the target is exact.
  - Quality filters and coverage: exact and near-duplicate removal, length and language checks, verifier pass, judge-score thresholds;
  - … and 3 more points
- **s3 Supervised fine-tuning: templates, masking, packing and limits** (21 min). Show how a conversation becomes a training sequence and a loss, which hyperparameters matter, and what SFT can and cannot change in a model. _5 worked example(s), 2 figure(s)._
  - The chat template renders messages into tokens with special markers per role;
  - Untrained template tokens: a base tokenizer can reserve chat tokens that pretraining never used (Module 08).
  - The SFT objective written out: L(theta) = -(1 / sum_t m_t) sum_t m_t log p_theta(x_t \| x_<t), with m_t = 1 on assistant tokens including the end-of-turn token and 0 …
  - Why mask: the model is not being taught to predict users or system prompts;
  - Loss normalisation: the mean over all trained tokens in a batch weights long replies more than a per-sequence mean;
  - Packing: several short conversations concatenated into one training row, with a block-diagonal attention mask and position ids restarting per conversation so that they …
  - … and 5 more points
- **s4 Parameter-efficient fine-tuning: LoRA and QLoRA** (23 min). Derive LoRA, size it for the case-study model, and show how QLoRA puts fine-tuning of the 9.5B model on a 24 GB GPU. _7 worked example(s), 2 figure(s)._
  - The memory problem: full fine-tuning at 16 bytes per parameter (bf16 weights 2, bf16 gradients 2, fp32 master weights 4, Adam moments 4 + 4;
  - LoRA (Hu et al. 2022): freeze W in R^{d x k} and learn W' = W + (alpha / r) B A with B in R^{d x r}, A in R^{r x k}, r << min(d, k).
  - Initialisation derived: A random (Gaussian or Kaiming), B = 0, so W' = W at step 0 and training starts from the base exactly.
  - The alpha / r scaling keeps the size of the update roughly constant as r changes, so the learning rate need not be retuned for each rank;
  - Parameter count r (d + k) per matrix;
  - Embeddings and head usually stay frozen;
  - … and 5 more points
- **s5 Preferences and reward models** (18 min). Explain why comparisons are collected, derive the Bradley-Terry model that turns them into a scalar reward, and show how a reward model is trained, checked and over-optimised. _4 worked example(s), 2 figure(s)._
  - A demonstration says what is right;
  - Collecting preferences: sample two or more responses per prompt from the current model (on-policy), labellers or a judge choose;
  - Agreement sets a ceiling: InstructGPT reports that its labellers agreed with each other about 73% of the time;
  - Bradley-Terry derived as a random-utility model: perceived quality u = r(x, y) + epsilon with epsilon independent standard Gumbel;
  - Shift invariance: adding c(x) to every reward for prompt x changes no probability, so rewards are identified only up to a per-prompt constant;
  - The reward model: a copy of the language model (initialised from the SFT model) with the unembedding replaced by a scalar head read at the final token;
  - … and 4 more points
- **s6 RLHF with PPO** (20 min). State the KL-regularised RL objective, derive the policy gradient it needs, and explain how PPO optimises it with four models in memory. _4 worked example(s), 2 figure(s)._
  - RLHF as InstructGPT did it: SFT;
  - The KL term is not decoration: the reward model is accurate only near the distribution it was trained on;
  - The policy gradient derived: grad_theta E_{y ~ pi_theta}[R(y)] = sum_y R(y) grad pi_theta(y) = E[R(y) grad log pi_theta(y)] (log-derivative trick);
  - RLHF as a token-level problem: state = prompt plus tokens so far, action = next token, reward = -beta log(pi_theta / pi_ref) at every token plus r_phi(x, y) at the last.
  - PPO (Schulman et al. 2017): reuse each batch of samples for several gradient steps with the importance ratio rho_t = pi_theta(y_t \| .) / pi_old(y_t \| .), and maximise …
  - A learned value function V(s) as a per-token baseline;
  - … and 3 more points
- **s7 Direct preference optimisation** (25 min). Derive DPO in full from the KL-regularised objective, explain what beta does, and show how DPO fails and what its variants change. _4 worked example(s), 2 figure(s), widget: kl-policy-explorer._
  - Step 1, the closed-form optimum.
  - Step 2, invert: r(x, y) = beta log(pi*(y\|x) / pi_ref(y\|x)) + beta log Z(x).
  - Step 3, substitute into Bradley-Terry: the beta log Z(x) terms cancel in the difference for two responses to the same prompt, leaving p(y_w > y_l \| x) = sigma(beta …
  - Step 4, fit the policy to the preference data directly, with no reward model and no sampling (Rafailov et al.
  - The reparameterisation loses no generality (every reward equivalence class under shift contains a reward of this form;
  - The gradient written out: grad L = -beta E[ sigma(-u) (grad log pi_theta(y_w\|x) - grad log pi_theta(y_l\|x)) ], u the margin;
  - … and 7 more points
- **s8 The simplest reinforcement learning: sample, verify, keep** (12 min). Introduce verifiable rewards through best-of-n and rejection-sampling fine-tuning, the RL method that cannot go far wrong, and say where it stops. _4 worked example(s), 1 figure(s)._
  - Verifiable rewards: in domains where an output can be checked (a mathematics answer against the solution, code against tests, a fault tree or a safety-case argument …
  - Best-of-n at inference: with per-sample success probability p, P(at least one of n passes) = 1 - (1 - p)^n.
  - Best-of-n is itself a policy that has moved away from the base by a bounded amount: KL(pi_BoN \|\| pi_ref) <= log n - (n - 1)/n (Stiennon et al.
  - Rejection-sampling fine-tuning, also called expert iteration, RAFT, ReST, STaR or best-of-n distillation: sample N outputs per prompt from the current model, keep those …
  - It is an ordinary SFT loop with a data generator in front;
  - Its weaknesses: it learns only from successes (failures carry information that GRPO uses);
- **s9 Reinforcement learning with verifiable rewards: GRPO** (24 min). Derive GRPO from the policy gradient, show how its group baseline and KL term work, and show how to design rewards that survive optimisation. _5 worked example(s), 2 figure(s), widget: grpo-group-explorer._
  - Why verifiable rewards: preference data is expensive and a learned reward is hackable;
  - GRPO (Shao et al. 2024;
  - The objective, as in the source: J(theta) = E[ (1/G) sum_i (1/\|y_i\|) sum_t min(rho_{i,t} A_i, clip(rho_{i,t}, 1 - epsilon, 1 + epsilon) A_i) - beta D_KL(pi_theta \|\| …
  - The KL term is estimated per token with k3 = pi_ref/pi_theta - log(pi_ref/pi_theta) - 1.
  - The source's grpo_advantages code (a group with zero variance gets zero advantage) and the per-token loss written in a few lines.
  - Memory: the policy and a frozen reference (with LoRA, one base).
  - … and 5 more points
- **s10 Safety, refusal and honesty** (14 min). Treat refusal, abstention and honesty as trainable behaviours with their own failure modes, measurements and reward design. _2 worked example(s), 1 figure(s)._
  - Refusals are behaviours like any other: demonstrated in SFT, preferred in pairs, rewarded in RL.
  - Constitutional AI (Bai et al.
  - Over-refusal: declining benign requests that pattern-match harmful ones ('How do I kill a Python process?').
  - Red-teaming: manual, by domain experts, and automated, with a language model generating attacks (Perez et al.
  - Calibration after post-training, with expected calibration error recalled in one line from Module 01, Section 7 (as in Section 5), not re-defined: base models are often …
  - Abstention as a trained behaviour, with the threshold recalled in one line from Module 07, Section 10, not re-derived: with +1 for a correct answer, 0 for abstaining and …
  - … and 4 more points
- **s11 Tools and agents** (8 min). Say what training for tool use adds to SFT and RL, and hand over to the AI Agents series for building agents. _2 worked example(s), 1 figure(s)._
  - A model that calls tools has been trained on conversations containing tool calls in a fixed format (a JSON object naming the function and its arguments, inside …
  - Loss masking extends to tools: tool results are produced by the environment, like user turns, and are masked;
  - Data: demonstrations (human or distilled trajectories) filtered by execution (sample, verify, keep: keep trajectories whose calls execute and whose final answer checks);
  - The behaviours that matter in an agent loop and need the most examples, because they are rare in naturally occurring data: deciding not to call a tool, reading a tool's …
  - Robustness of arguments (types, required fields) is trained and also enforced at serving by constrained decoding (Module 10).
  - An agent loop runs the model in exactly this mode;
- **s12 Evaluation** (16 min). Say what replaces the loss after post-training, how each kind of evaluation fails, and how to tell a real difference from noise. _4 worked example(s), 2 figure(s)._
  - The pretraining loss no longer means much after post-training: preference optimisation and RL optimise behaviour, and DPO can lower the likelihood of good answers …
  - Instruction-following suites with verifiable constraints (IFEval: about 500 prompts with 25 kinds of checkable instruction, such as 'answer in exactly three bullet …
  - A general-capability battery run before and after, to price the forgetting.
  - Behavioural suites built from the failure modes you have seen, pass or fail per case with programmatic checkers;
  - Judged comparisons: a strong model compares two responses (MT-Bench: 80 multi-turn questions;
  - Contamination control: exact content hashes and n-gram overlap (the GPT-3 paper used 13-grams) between every training set, distillation prompts included, and every …
  - … and 2 more points
- **s13 Merging and averaging** (8 min). Explain when averaging weights works, the main merge methods, and how to merge adapters correctly. _2 worked example(s), 1 figure(s)._
  - Two fine-tuned copies of the same base can be averaged weight by weight, and the average is often better than either (model soups, Wortsman et al.
  - Uniform soup versus greedy soup (add a model to the average only if held-out accuracy improves);
  - Task arithmetic (Ilharco et al.
  - TIES-merging (Yadav et al.
  - Adapters: the update is the product B A, so merge the products (or concatenate the factors into a higher-rank adapter), never the averaged factors;
  - None of it is guaranteed, all of it is cheap to try, and every merged candidate is evaluated like any other (Section 12).
- **s14 The case study: a post-training recipe for a safety-case assistant** (17 min). Walk through a hypothetical post-training design for the running case study, with the reasoning and the arithmetic behind each choice. _4 worked example(s), 1 figure(s)._
  - Framing: a hypothetical worked case, not anyone's plan or product.
  - Step 0, baselines: the instruct release, prompted with the deployment's system prompt, on the golden set (parse rate, checker pass rate, judge coverage): the bar every …
  - Step 1, the starting point, with its rule: if Module 08's baselines showed that continued pretraining was needed, SFT starts from the CPT checkpoint, which is a base …
  - Step 2, SFT with LoRA from the CPT checkpoint: r = 64, alpha = 128, all linear layers, plus the template tokens' rows of the input embedding and the output head made …
  - Step 3, RL with verifiable rewards (GRPO) rather than DPO, because a deterministic checker gives exact rewards on the model's own samples, while DPO would need pairs, …
  - The reward function, generalised from the source: parse_argument(reply) is None -> 0.0 (nothing below is reachable for prose);
  - … and 3 more points
- **What goes wrong.** 14 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: SFT of SmolLM2-135M with prompt-token loss masking | 40 | ~10 min | 270 MB | Turn a base model into a minimal assistant with a hand-rendered ChatML template and a masked loss, and measure what changes (stopping, format, per-task accuracy) and what does not. |
| lab2: LoRA from scratch: wrap, count, train, merge, verify | 30 | ~4 min | none | Implement a LoRA layer in plain PyTorch, apply it to every linear projection of SmolLM2-135M, verify that training starts from the base exactly, train it, merge it, and confirm … |
| lab3: A Bradley-Terry reward model with a known true reward | 25 | ~1 min | none | Train a reward model on synthetic comparisons generated from a known reward, measure its accuracy against the label-noise ceiling and its calibration, and watch best-of-n … |
| lab4: DPO from scratch: an exact check, then on-policy and off-policy pairs | 30 | ~2 min | none | Confirm numerically that DPO lands on the closed-form optimum pi* and that beta sets how far it moves, then train a small autoregressive policy with DPO on a verifiable preference … |
| lab5: RL with verifiable rewards: expert iteration, GRPO and a flawed verifier | 35 | ~2 min | none | Run the simplest RL (sample, verify, keep) and GRPO on the same toy task with an exact verifier, see the KL term and zero-variance groups at work, then watch a slightly wrong … |
| lab6: An evaluation harness: a behavioural suite with confidence intervals | 25 | ~2 min | 270 MB | Build a small behavioural suite with programmatic checkers, run a base and an instruct model on it, and report per-category pass rates with bootstrap intervals, a paired … |

**Exercises** (15: 8 ★, 6 ★★, 1 ★★★; 130 minutes).

- e1 ★ conceptual, 5 min: For each behaviour, name the post-training stage you would reach for first and say why in one sentence: (a) every reply must be valid JSON in a fixed …
- e2 ★ conceptual, 5 min: A conversation renders as: system prompt;
- e3 ★ conceptual, 5 min: LoRA computes h = W x + (alpha / r) B A x with A random and B = 0 at initialisation.
- e4 ★★ calculation, 10 min: For the case-study model (9,550,729,216 parameters: 36 layers, d = 4,096, 32 query heads and 8 KV heads of dimension 128, SwiGLU width 15,360, …
- e5 ★★ derivation, 10 min: (a) Suppose each response's perceived quality is u = r + epsilon with epsilon independent standard Gumbel noise (CDF exp(-e^{-x})).
- e6 ★★ derivation, 15 min: (a) For one prompt and a finite set of responses, maximise J(pi) = sum_y pi(y) r(y) - beta sum_y pi(y) log(pi(y) / pi_ref(y)) subject to sum_y pi(y) …
- e7 ★ conceptual, 5 min: Without computing anything: (a) a DPO pair's loss can keep falling while the policy's log-probability of the chosen response drops below the …
- e8 ★★ calculation, 10 min: For the 9.55B case-study model (16 bytes per trained parameter, 2 per frozen bf16 parameter), count per prompt (or per pair) and per update the …
- e9 ★ conceptual, 5 min: (a) The coverage 1 - (1 - p)^n assumes that every prompt has the same pass rate p.
- e10 ★★ calculation, 10 min: (a) A GRPO group of G = 8 receives partial-credit rewards (0.6, 0.6, 0.2, 1.0, 0.0, 0.4, 0.6, 0.2).
- e11 ★★★ coding, 25 min: A model writes fault trees as JSON: {"top": id, "events": {id: {"type": "gate", "gate": "AND" or "OR", "children": [ids]} or {"type": "basic", "p": …
- e12 ★ conceptual, 5 min: After preference optimisation, a model that was well calibrated states higher confidence than before on a held-out question set, while its accuracy …
- e13 ★★ calculation, 10 min: Two checkpoints are evaluated on the same 200 items.
- e14 ★ conceptual, 5 min: A pairwise judge compares a new model's answers with the incumbent's, each pair shown in both orders.
- e15 ★ conceptual, 5 min: Two rank-r adapters (B1, A1) and (B2, A2) for the same matrix, each with its alpha / r folded into its B, are to be merged with equal weight.

**Quiz** (12 questions): A model fine-tuned with ChatML ignores its system prompt only in production.; In SFT with loss masking, which tokens carry loss?; LoRA initialises A randomly and B to zero.; A reward model's output for every response to prompt x is increased by 3.; In the KL-regularised objective E[r] - beta KL(pi \|\| pi_ref), what happens to …; In the DPO derivation, why does the partition function Z(x) disappear?; DPO on pairs taken from a very different model reaches 100% pair accuracy and …; GRPO with G = 8 runs on prompts the policy already solves 95% of the time.; Why does rejection-sampling fine-tuning (sample, verify, keep) often plateau …; A grader gives 1 for a correct answer and 0 both for a wrong answer and for 'I …; On 50 shared items, model A passes 8 items that B fails and B passes 3 that A …; Two LoRA adapters trained for different tasks on the same base are to be merged …

**Guided reading.**

- Ouyang, L. et al. "Training language models to follow instructions with human feedback." NeurIPS, 2022. (12 min). The paper that defined the SFT, reward model, PPO pipeline and showed that a 1.3B post-trained model can be preferred to a 175B base;
- Rafailov, R. et al. "Direct preference optimization: Your language model is secretly a reward model." NeurIPS, 2023. (18 min). The derivation at the centre of this module, in the authors' notation, with the theorem that justifies the reparameterisation and the experiment that compares DPO with …
- DeepSeek-AI. "DeepSeek-R1: Incentivizing reasoning capability in LLMs via reinforcement learning." arXiv, January 2025. (15 min). The clearest public evidence that RL with verifiable rewards can teach behaviour nobody demonstrated, and a complete multi-stage post-training pipeline including …

**Interactive widgets.**

- `kl-policy-explorer` (in s7): The KL-regularised optimum pi* = pi_ref exp(r / beta) / Z: beta trades expected reward against distance from the reference, and a small beta lets the policy exploit any error in the reward.
- `grpo-group-explorer` (in s9): GRPO's advantage is a reward standardised within the group: groups that are all right or all wrong teach nothing, and the share of informative groups depends on the pass rate and the group size.

**Key terms:** 30 English–Chinese pairs. **References:** 53.

### Module 10: Inference and serving

What happens when a model answers: why output tokens are slow and input tokens are not, how memory decides how many users a GPU can hold, what quantisation and speculative decoding buy, and how to size, measure and run the serving of a model you own at a latency and cost you can predict.

**Before you start:** Module 06: attention, multi-head and grouped-query attention, RoPE, the modern decoder block, counting parameters and FLOPs (2·N_matmul FLOPs per token plus attention, with memory counted from all N parameters), and the KV cache as introduced there; Module 07: the language-modelling objective and perplexity, tokenisation, decoding and sampling (greedy, temperature, top-p), the context window, cost from first principles, and the running case study's model, workload and assumed prices; Module 08: floating-point formats for training (fp32, bf16, fp16, fp8), memory accounting, and the idea of tensor and pipeline parallelism; Module 09: chat templates, LoRA and QLoRA, evaluation suites, and the running case study's post-training, which ends with the merged model this module quantises and serves; Mathematics: operation counts of matrix-vector and matrix-matrix products; discrete probability (sums over a distribution, expectations, the finite geometric series); Python and PyTorch at the level of the Module 02 and Module 06 labs.

**You will be able to:**

- Derive the arithmetic intensity of matrix-vector and matrix-matrix products and use the roofline model to say whether prefill or decode is compute-bound or bandwidth-bound on a given accelerator.
- Estimate time to first token and time per output token for any model on any accelerator from parameter count, bytes per weight, FLOP/s and memory bandwidth, and explain why batching raises decode throughput but not one user's speed.
- Derive the KV-cache size 2·L·n_kv·d_head·b·T·B, compute it from a model's configuration file, and turn it into the number of concurrent sequences a GPU can hold.
- Explain continuous batching, chunked prefill, paged attention and prefix caching, and predict from a workload or a prompt layout whether each will help.
- Quantise a weight matrix to int8 and int4 with absmax and zero-point schemes at per-tensor, per-channel and group-wise granularity, count the bits per weight including scales, measure the effect on perplexity, and explain what GPTQ, AWQ and SmoothQuant add.
- Derive the speculative-sampling acceptance rule, prove that it leaves the target model's output distribution unchanged, and compute the expected speed-up from the acceptance rate, the draft length and the draft's cost.
- Size the serving of the case-study 9.5B model at 4 bits on a 24 GB GPU: weights, cache budget, concurrency, latency at low and at full load, throughput, cost per million tokens, and what the real utilisation does to that cost.
- Define TTFT, TPOT, inter-token latency, throughput, goodput and percentiles; design an open-loop load test; set an SLO and find the request rate a server sustains under it.
- Specify the reliability measures of a self-hosted model (versioning by hash, provenance, health checks, timeouts, retries, exercised fallbacks, metering, privacy-preserving logging) and state the limits of determinism.
- Choose hardware and a serving engine for a workload with dated, conservative reasoning, reading a datasheet for the three numbers that matter.

**Study plan.**

| Session | Activities (minutes) |
|---|---|
| 1. Where the time goes | Read s1-s2: the two phases of answering a prompt, and the roofline model (35); Lab 1: a roofline and sizing calculator, and your own machine's roofline (25); Read s3: the KV cache in depth (19); Lab 2: a KV cache for a small decoder, two position bugs, and prefix caching by hand (35); Exercise e1 (decode speed from FLOPs, a common mistake) (5) |
| 2. Hardware, batching and memory | Exercises e3-e4 (KV cache from configuration files, grouped-query attention) (15); Read s4: hardware, the three numbers on a datasheet (13); Exercise e2 (arithmetic intensity, and the batch at which a product turns compute-bound on two of s4's accelerators) (10); Read s5-s6: batching; paged attention and prefix caching (34); Lab 3: a continuous-batching simulator (30); Exercises e5-e6 (cache waste and block size, prompt layout for prefix caching) (10); Guided reading: Kwon et al. 2023, PagedAttention (paper1) (15) |
| 3. Quantisation | Read s7-s8: number formats and the arithmetic of quantisation; quantising LLMs (40); Lab 4: quantisation from scratch on SmolLM2-135M, weights and activations (40); Exercises e7-e8 (choosing a group size, quantising a vector by hand) (15); Guided reading: Lin et al. 2024, AWQ (paper2) (15) |
| 4. Faster decoding and the serving engine | Read s9: speculative decoding and its relatives (20); Lab 5: speculative decoding from scratch, SmolLM2-135M drafting for SmolLM2-360M (35); Exercises e9-e10 (the acceptance proof; the speed-up and the best draft length) (20); Guided reading: Leviathan, Kalman and Matias 2023, speculative decoding (paper3) (15); Read s10: structured output and the serving engine (16); Lab 6: batched generation on a CPU, throughput against batch size, and determinism (20) |
| 5. Sizing, measuring and running | Read s11: sizing the running case study (19); Exercise e11 (redo the sizing table for two other models) (10); Read s12-s13: latency metrics, load tests and SLOs; reliability in production (29); Read 'What goes wrong' (5); Exercises e12-e14 (an SLO for multi-call agents, determinism, cost and utilisation) (20); Exercise e15 (project: a capacity plan under an SLO, built on Labs 1 and 3) (25); Self-check quiz (15); Summary and review: the module's key numbers, the case-study sizing redone from memory, the checks you missed (10) |

**Concept sections.**

- **s1 Two phases: prefill and decode** (15 min). Show that answering a prompt is one parallel pass over the prompt followed by one pass per output token, and estimate the time of each from FLOPs and bytes. _4 worked example(s), 1 figure(s)._
  - The generation loop: prompt tokens -> forward pass -> logits at the last position -> sample (Module 07) -> append -> repeat until an end-of-sequence token, a stop string …
  - Prefill: all T_p prompt positions in one forward pass, in parallel;
  - Decode: one new position per forward pass;
  - FLOPs, by Module 06's convention, recalled in one paragraph with a link (Module 06 derives it;
  - Bytes per decode step: the weights plus this sequence's cache (147,456·t bytes for the case-study model at context t, derived in s3).
  - The time model used throughout the module: TTFT ≈ queueing + prefill FLOPs / (MFU · peak FLOP/s);
  - … and 2 more points
- **s2 The roofline model: compute-bound and bandwidth-bound** (20 min). Give the reader one diagram and one ratio, arithmetic intensity against the ridge point, that decide whether an operation is limited by compute or by memory bandwidth, and use it to explain why batching helps decode. _4 worked example(s), 1 figure(s)._
  - Definitions: arithmetic intensity I = FLOPs performed / bytes moved between off-chip memory and the compute units;
  - Derive the matrix-vector case: y = Wx with W ∈ R^{m×n} at b bytes per element: FLOPs 2mn;
  - Derive the matrix-matrix case with B columns (B tokens processed together): Y = WX with X ∈ R^{n×B}: FLOPs 2mnB;
  - Ridge points from published dense figures: H100 SXM 989 TFLOP/s / 3.35 TB/s = 295 FLOP/byte;
  - Why batching helps decode: B sequences in one step share a single read of the weights, so the step time stays nearly flat until 2B/b reaches the ridge: bf16 on the H100: …
  - Decode attention does not batch: each sequence reads its own cache.
  - … and 2 more points
- **s3 The KV cache in depth** (19 min). Derive the size of the key-value cache, show that it is the number that decides concurrency, and list the ways to shrink it. _3 worked example(s), 2 figure(s)._
  - Why caching is exact: under the causal mask the key and value at position i depend only on tokens ≤ i, so they never change once computed.
  - Derive the size: per token per layer, one key vector and one value vector for each of n_kv heads, each of d_head values, so 2·n_kv·d_head values;
  - Grouped-query attention (Module 06): n_kv key/value heads shared by n_h > n_kv query heads divide the cache by n_h/n_kv;
  - The cache against the weights: for the case study one sequence's cache equals the 5.5 GB of weights at about 37,300 tokens;
  - Other ways to shrink the cache: sliding-window attention caps it at the window (Mistral 7B, 2023: 4,096 tokens);
  - Implementation: a cache that grows by concatenation copies itself at every step;
  - … and 1 more points
- **s4 Hardware: the three numbers on a datasheet** (13 min). Read an accelerator datasheet for the three numbers that matter, memory capacity, memory bandwidth and dense compute, and turn them into concurrency, decode speed and prefill speed. _3 worked example(s), 1 figure(s)._
  - Capacity decides the largest model and the number of concurrent sequences;
  - A dated table ('published datasheet figures, dense, no sparsity, as of 2026'): H100 SXM: 80 GB, 3.35 TB/s, 989 TFLOP/s bf16;
  - Same memory, different speed: the L4 and the RTX 4090 both have 24 GB, so both hold the case study's 18 sequences, but the L4 decodes about 3.3 times slower (1.0/0.30 = …
  - Datasheet traps: 'with sparsity' figures are twice the dense ones;
  - Consumer versus datacentre parts: memory size, ECC, multi-GPU interconnect, cooling and form factor, and driver licence terms that restrict datacentre use of consumer …
  - Several GPUs: tensor parallelism splits every layer across GPUs, so weights, bandwidth and compute add (two GPUs roughly halve the per-token time) at the cost of an …
  - … and 2 more points
- **s5 Batching: static, dynamic and continuous** (17 min). Show how a server keeps the GPU busy with many sequences at once, and what each batching policy does to throughput and to each user's latency. _3 worked example(s), 2 figure(s)._
  - Static batching: B requests padded to a common length and run together until the longest finishes;
  - Dynamic (request-level) batching: dispatch when B requests are queued or after a maximum wait τ;
  - Continuous (iteration-level) batching (Orca, Yu et al.
  - Prefill-decode interference: a joining request's prefill shares the iteration, so every running sequence sees one long gap (about 0.92 s for a 4,000-token prompt on the …
  - The throughput-latency trade-off in the bandwidth-bound regime: step time t(B) = (W + B·k·t̄)/BW, with W the weight bytes, k the cache bytes per token and t̄ the mean …
  - Scheduler controls: maximum running sequences, maximum tokens per iteration, the cache budget for admission;
- **s6 Paged attention and prefix caching** (17 min). Explain how serving engines allocate the cache in pages so that many sequences of unpredictable length fit, and how they reuse the cache of a shared prefix across requests. _4 worked example(s), 1 figure(s)._
  - Why contiguous allocation wastes memory: the output length is unknown, so a naive server reserves the maximum length per request;
  - PagedAttention: the cache is divided into fixed-size blocks (16 tokens by default in vLLM);
  - Sharing and copy-on-write: sequences that share a prefix (parallel samples of one prompt, beam search) point to the same physical blocks, with reference counts;
  - Preemption when blocks run out: swap a sequence's blocks to CPU memory, or drop them and recompute later.
  - Prefix caching: full blocks are identified by a hash of their tokens and of everything before them;
  - What breaks a hit: any change early in the prompt (a timestamp, a user name, a reordered tool list), a different rendering by the chat template, a prefix that ends …
  - … and 1 more points
- **s7 Number formats and the arithmetic of quantisation** (19 min). Give the formats and the exact arithmetic of mapping weights to a few bits, with the storage cost of the scales, so that every scheme in s8 is a variation on one formula. _4 worked example(s), 2 figure(s)._
  - Why fewer bits: decode time is bytes per step over bandwidth (s1-s2), so every bit saved per weight speeds decode and frees memory for the cache (s3).
  - Float formats as (sign/exponent/mantissa bits;
  - Block-scaled formats, dated and conservative: the OCP microscaling (MX) formats share one 8-bit power-of-two scale among 32 elements (MXFP4 elements are E2M1, giving 4 + …
  - Symmetric (absmax) quantisation: s = max\|w\| / q_max with q_max = 2^(b−1) − 1;
  - Asymmetric (zero-point, min-max) quantisation: s = (max w − min w)/(2^b − 1);
  - Granularity: per-tensor (one scale), per-channel (one scale per output row), group-wise (one scale per g consecutive weights along the input dimension, g = 32, 64 or 128).
  - … and 2 more points
- **s8 Quantising LLMs: outliers, GPTQ, AWQ, SmoothQuant and the cache** (21 min). Explain why quantising a language model is harder than quantising a random matrix, what the calibrated methods do about it, how to quantise the cache, and how to measure the damage. _3 worked example(s), 2 figure(s)._
  - What round-to-nearest does to a small model (Lab 4: SmolLM2-135M, perplexity on the first 4,096 tokens of the WikiText-2 test split;
  - Outliers: weights are well behaved (in SmolLM2-135M the worst per-input-channel max/median ratio is about 12) but activations are not (in Lab 4 one input channel of …
  - Weight-only (W4A16, W8A16) versus weight-and-activation (W8A8 in int8 or fp8), argued from the roofline: weight-only cuts the bytes of bandwidth-bound decode;
  - SmoothQuant (Xiao et al.
  - GPTQ (Frantar et al. 2023): per layer, minimise ‖WX − ŴX‖²_F over quantised Ŵ, each row independently;
  - AWQ (Lin et al. 2024): about 1% of weight channels are salient, and saliency follows activation magnitude, not weight magnitude;
  - … and 4 more points
- **s9 Speeding up decode: speculative decoding and its relatives** (20 min). Derive speculative decoding: why verifying several tokens costs about one step, why the output distribution is exactly the large model's, and how much faster it is. _4 worked example(s), 1 figure(s), widget: speculative-speedup._
  - The opportunity: a bandwidth-bound target model scores γ + 1 positions in about the time of one (s2), so a cheap draft model proposes γ tokens and the target checks them …
  - The algorithm (Leviathan, Kalman and Matias 2023;
  - Proof that the output is distributed as p (write it out): P(output = x) = q(x)·min(1, p(x)/q(x)) + (1 − β)·r(x), where β = Σ_x min(p(x), q(x)) is the probability of …
  - Greedy special case: accept x_i if and only if it equals the target's argmax;
  - Expected tokens per iteration: with acceptances independent with probability α, P(at least k drafts accepted) = α^k for k ≤ γ, so E[tokens] = 1 + Σ_{k=1}^{γ} α^k = (1 − …
  - Walltime: an iteration costs γ draft steps and one verification, (γc + v)·T_target, where c is the draft-to-target step-cost ratio and v ≈ 1 when verification is …
  - … and 3 more points
- **s10 Structured output and the serving engine** (16 min). Show how a server can guarantee that output follows a schema, and what a serving engine is made of, so that the reader can choose and configure one. _2 worked example(s), 2 figure(s)._
  - Constrained decoding (Module 07 introduced it as masking invalid tokens;
  - What it guarantees and what it does not: syntax, not content.
  - Engine anatomy: API server (OpenAI-compatible, streaming);
  - The stacks, as of 2026 (check current documentation): vLLM: the general-purpose GPU server with PagedAttention, continuous batching, prefix caching, many quantised …
  - The OpenAI-compatible chat-completions API: POST /v1/chat/completions with model, messages (role, content), max_tokens, temperature, top_p, stop, stream, and …
  - The chat template: the server renders messages into tokens with the template stored with the model's tokenizer;
  - … and 2 more points
- **s11 Sizing the running case study** (19 min). Put s1-s10 together to size the serving of the hypothetical 9.5B safety-case model on one 24 GB GPU and on larger cards, ending with cost per million tokens and what the real utilisation does to it. _2 worked example(s), 1 figure(s), widget: serving-calculator._
  - The case (hypothetical, as in Modules 07-09): the open-weight bilingual (English-Chinese) model of about 9.5B parameters chosen in Module 07 and adapted in Modules 08-09 …
  - Step 1, weights: recall the count, attention 41,943,040 + feed-forward 188,743,680 + norms 8,192 = 230,694,912 parameters per layer (230.7M), × 36 = 8.305×10⁹, plus 2 × …
  - Step 2, memory budget: 24 − 5.5 − 2.5 = 16 GB for the cache, where 2.5 GB for the runtime (context, activation workspace, graph buffers) is an assumption to measure on …
  - Step 3, concurrency: 6,000 × 147,456 B = 0.885 GB per finished request → 18 concurrent;
  - Step 4, latency at low load: TTFT = 7.61×10¹³ / (0.5 × 165×10¹²) = 0.92 s (0.24 s when the prefix is cached);
  - Step 5, throughput at full load: B = 18 gives an 18.8 ms step and 959 tokens/s while decoding;
  - … and 4 more points
- **s12 Measuring latency: metrics, load tests and SLOs** (15 min). Define the latency metrics of LLM serving, show how load turns into queueing, and explain how to run a load test whose numbers can be trusted. _3 worked example(s), 1 figure(s)._
  - Metrics: TTFT (request sent to first token received: queueing + prefill + network);
  - Percentiles: report p50, p90 and p99 computed from raw samples;
  - Tail amplification (Dean and Barroso 2013): an agent that makes 20 sequential calls, each slower than its p99 with probability 1%, has 1 − 0.99²⁰ = 18.2% of its tasks …
  - Queueing: utilisation ρ = arrival rate / service rate;
  - Little's law L = λW holds for any stable system: the mean number of requests in the system equals the arrival rate times the mean time in the system.
  - Load-test design: open-loop arrivals (Poisson at a set rate) expose overload;
  - … and 2 more points
- **s13 Reliability in production** (14 min). List what keeps a self-hosted model trustworthy in service: knowing exactly what is running, failing over cleanly, measuring cost, being honest about determinism, and protecting what users send. _2 worked example(s), 1 figure(s)._
  - Versioning and provenance: the served artifact is the exact quantised weights file plus the tokenizer, the chat template, the engine version, the sampling defaults and …
  - Rollout: shadow or canary a new hash with the evaluation suite (Module 09) and live metrics;
  - Health and capacity: liveness (the process answers) versus readiness (the model is loaded and has capacity);
  - Timeouts, retries and fallback: a time budget per request;
  - Metering: tokens in and out per request, per application and per customer or team, in a usage ledger, so cost is measured rather than assumed (s11).
  - Determinism: temperature 0 makes the sampling rule deterministic, not the arithmetic.
  - … and 1 more points
- **What goes wrong.** 14 failure modes, each as symptom, cause and fix.

**Labs.**

| Lab | Minutes | CPU run | Download | Goal |
|---|---|---|---|---|
| lab1: A roofline and sizing calculator | 25 | ~1 min | none | Turn the formulas of s1-s4 into a small calculator that sizes any model on any accelerator, reproduce the case study's sizing table, and measure the roofline of your own machine. |
| lab2: A KV cache for a small decoder, and prefix caching by hand | 35 | ~2 min | 269 MB | Add a KV cache to a small decoder, prove it exact, measure what it saves and how big it is, see how position bugs hide, and reuse a cached prefix on a real model. |
| lab3: A continuous-batching simulator | 30 | ~1 min | none | Simulate static and continuous batching, cache-admission policies and chunked prefill for the case study on the 24 GB card, and find the knee of the latency-throughput curve and … |
| lab4: Quantisation from scratch: weights, outliers and activations | 40 | ~3 min | 270 MB | Quantise SmolLM2-135M's linear layers with the schemes of s7, measure the damage as perplexity, find the activation outliers of s8, and repair simulated W8A8 with SmoothQuant. |
| lab5: Speculative decoding from scratch | 35 | ~3 min | 724 MB | Implement greedy speculative decoding with SmolLM2-135M drafting for SmolLM2-360M, check that it reproduces the target's output, measure the acceptance rate and speed-up against … |
| lab6: Batched generation on a CPU: throughput and determinism | 20 | ~1 min | 269 MB | Run batched greedy generation with SmolLM2-135M at B = 1, 2, 4, 8 and 16 in plain PyTorch, measure the prefill time, the decode step and the per-sequence and aggregate tokens/s, … |

**Exercises** (15: 7 ★, 7 ★★, 1 ★★★; 130 minutes).

- e1 ★ conceptual, 5 min: A colleague estimates the single-user decode speed of a 9B model in bf16 on a GPU with 989 TFLOP/s and 3.35 TB/s as 989×10¹² / (2 × 9×10⁹) ≈ 55,000 …
- e2 ★★ derivation, 10 min: Derive the arithmetic intensity of Y = WX for W ∈ R^{m×n} stored at b_w bytes per element and X ∈ R^{n×B}, Y ∈ R^{m×B} at b_a bytes per element, and …
- e3 ★★ calculation, 10 min: From their configuration files, SmolLM2-135M has num_hidden_layers 30, hidden_size 576, num_attention_heads 9 and num_key_value_heads 3;
- e4 ★ conceptual, 5 min: Grouped-query attention with 8 KV heads for 32 query heads cuts the case study's cache by a factor of 4.
- e5 ★ conceptual, 5 min: A server reserves the maximum length (8,192 tokens) of cache for every request.
- e6 ★ conceptual, 5 min: Each request to the safety-case assistant is assembled from (a) a line 'Request time: <timestamp>', (b) a 2,500-token system prompt, (c) a …
- e7 ★ conceptual, 5 min: Two int4 schemes for the case study's 8.305×10⁹ block weights: (a) groups of 128 with an fp16 scale and an fp16 zero-point, 4.25 bits per weight …
- e8 ★★ calculation, 10 min: Quantise w = (0.62, −0.11, 0.05, −0.90, 0.33, 0.07, −0.25, 0.48) to int4 (a) with symmetric absmax (q in [−7, 7]) and (b) with min-max zero-point (q …
- e9 ★★ derivation, 10 min: Prove that speculative sampling (draw x ~ q;
- e10 ★★ calculation, 10 min: With a per-token acceptance rate α, independent across positions, derive the expected number of tokens per speculative iteration with draft length γ.
- e11 ★★ calculation, 10 min: Redo the sizing table of s11 (24, 48 and 80 GB cards, 2.5 GB runtime overhead, 6,000-token requests, bf16 cache) for (a) a 14B-class model at 8 bits …
- e12 ★ conceptual, 5 min: An agent makes 20 sequential model calls per task.
- e13 ★ conceptual, 5 min: Two runs of the same request at temperature 0 give different answers on a busy server and identical answers on an idle one.
- e14 ★★ calculation, 10 min: Suppose the 24 GB card of Section 11 can be rented for an assumed USD 0.80 per hour (a lower quote than the section's USD 1.00;
- e15 ★★★ project, 25 min: A capacity plan under an SLO.

**Quiz** (12 questions): The case-study model's 5.5 GB 4-bit file runs on a GPU with 1.0 TB/s of …; A model has L = 32 layers, 8 KV heads and a head dimension of 128.; Which statement about batching decode is correct?; The main advantage of continuous batching over static batching is that:; Prefix caching never hits on your service.; Quantising SmolLM2-135M's linear weights to int4 with one absmax scale per …; Weight-only int4 quantisation mainly speeds up:; In speculative sampling the draft model is poor (acceptance rate 0.3).; With acceptance rate α = 0.8 and draft length γ = 4, the expected number of …; SmoothQuant makes int8 activation quantisation work by:; At moderate load your p50 TTFT is 0.4 s but p99 is 9 s, while TPOT is normal.; A server completes 0.33 requests/s, and each request spends 55 s in the system …

**Guided reading.**

- Kwon, W. et al., "Efficient memory management for large language model serving with PagedAttention." SOSP, 2023. (15 min). The paper behind vLLM: a clear account of why the KV cache, not compute, limits serving, and how operating-system paging fixes it.
- Lin, J. et al., "AWQ: Activation-aware weight quantization for LLM compression and acceleration." MLSys, 2024. (15 min). The clearest statement of why activation statistics, not weight magnitudes, decide which weights matter, with an error argument a reader can redo in a few lines;
- Leviathan, Y., Kalman, M., Matias, Y., "Fast inference from transformers via speculative decoding." ICML, 2023. (15 min). The original statement of speculative sampling with the correctness proof and the walltime analysis that s9 derives;

**Interactive widgets.**

- `serving-calculator` (in s11): Memory capacity sets how many sequences fit, bandwidth sets how long each decode step takes, and the batch trades each user's speed for total throughput;
- `speculative-speedup` (in s9): The speed-up of speculative decoding is set by the acceptance rate and the draft's relative cost, with an optimal draft length beyond which drafts waste work, while the output distribution stays …

**Key terms:** 30 English–Chinese pairs. **References:** 32.
