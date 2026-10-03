## Self-check quiz {#quiz}

Twelve questions, about 90 seconds each; answer before opening the explanation, and re-read the section named in any explanation you got wrong.

```quiz
? The normal equations $\mathbf{X}^\top(\mathbf{y} - \mathbf{X}\mathbf{w}) = \mathbf{0}$ say that, at the least-squares solution,
- [ ] the residuals are all zero
- [ ] the weight vector is orthogonal to $\mathbf{y}$
- [x] the residual vector is orthogonal to every column of $\mathbf{X}$
- [ ] $\mathbf{X}^\top\mathbf{X}$ is the identity matrix
> $\mathbf{X}^\top\mathbf{r} = \mathbf{0}$ means each column of $\mathbf{X}$ has zero inner product with the residual $\mathbf{r}$, so $\hat{\mathbf{y}}$ is the orthogonal projection of $\mathbf{y}$ onto the column space. The residuals vanish only if $\mathbf{y}$ already lies in that space, which noisy data never does. Nothing makes $\mathbf{w}$ orthogonal to $\mathbf{y}$. $\mathbf{X}^\top\mathbf{X}$ is the identity only when the columns are orthonormal.

? Gradient descent runs on $\mathcal{L}(\mathbf{w}) = \tfrac12\mathbf{w}^\top\mathbf{H}\mathbf{w}$, where $\mathbf{H}$ has eigenvalues 0.5 and 8. Which learning rate diverges?
- [ ] 0.10
- [ ] 0.20
- [ ] 0.24
- [x] 0.26
> Stability needs $\eta < 2/\lambda_{\max} = 2/8 = 0.25$. At 0.26 the steep mode is multiplied by $1 - 0.26\times8 = -1.08$ each step, so it grows while flipping sign. At 0.24 the factor is $-0.92$: the iterate oscillates but shrinks. At 0.10 and 0.20 the steep-mode factors are 0.2 and $-0.6$, and the flat mode's factors (0.95 and 0.90) show why the flat direction is the slow one.

? Two centred, uncorrelated features have standard deviations 1 and 100. The condition number of $\mathbf{X}^\top\mathbf{X}/N$ is about
- [ ] 10
- [ ] 100
- [x] 10,000
- [ ] 1,000,000
> $\mathbf{X}^\top\mathbf{X}/N = \operatorname{diag}(1^2, 100^2)$, so $\kappa = 100^2/1^2 = 10^4$: the condition number is the square of the ratio of standard deviations. 100 is the ratio itself, forgetting the square. 10 is its square root. $10^6$ would be the ratio cubed and has no basis.

? Constant-step SGD has reached its noise floor near a minimum. Halving the learning rate will, approximately,
- [ ] leave the floor unchanged
- [x] halve the stationary excess loss, and slow the approach to it
- [ ] double the floor
- [ ] make the iterate converge exactly to the minimum
> The stationary variance is $\eta s^2/\big(B\lambda(2 - \eta\lambda)\big) \approx \eta s^2/(2B\lambda)$, proportional to $\eta$, so the floor halves; the contraction per step, $1 - \eta\lambda$, weakens, so the approach slows. The floor does not stay put and does not double. It never reaches zero at a constant step: exact convergence needs a step that decays (the Robbins–Monro conditions) or a growing batch.

? If the noise in $y$ follows a Laplace distribution, maximum likelihood fits the model with which loss, and what is the best constant prediction?
- [ ] Squared error; the mean
- [ ] Cross-entropy; the mode
- [x] Absolute error; the median
- [ ] Absolute error; the mean
> The Laplace negative log-likelihood is $|y - f(\mathbf{x})|/b$ plus a constant, so the loss is absolute error, and the constant that minimises the sum of absolute deviations is the median. Squared error with the mean is the Gaussian case. Cross-entropy belongs to Bernoulli or categorical outcomes, not to a real-valued target. "Absolute error; the mean" pairs the right loss with the wrong summary: the mean minimises squared, not absolute, deviations.

? For binary cross-entropy with $\hat p = \sigma(z)$, the derivative of the loss with respect to the logit $z$ is
- [ ] $(\hat p - y)\,\hat p(1 - \hat p)$
- [x] $\hat p - y$
- [ ] $y - \hat p$
- [ ] $-\log\hat p$
> The sigmoid's derivative $\hat p(1 - \hat p)$ cancels against the derivative of the logarithm, leaving $\hat p - y$, which is large exactly when the model is confidently wrong. $(\hat p - y)\hat p(1 - \hat p)$ is the gradient of $\tfrac12(\hat p - y)^2$ through the sigmoid; it vanishes when $\hat p$ saturates at the wrong end, which is why that loss trains badly. $y - \hat p$ has the wrong sign (it is the negative gradient). $-\log\hat p$ is the loss itself for $y = 1$, not its derivative.

? A test has recall 0.8 and false-positive rate 0.01. The condition it detects has prevalence 0.2%. The fraction of positive results that are true is about
- [ ] 80%
- [ ] 50%
- [x] 14%
- [ ] 1%
> Precision $= 0.8\times0.002\,/\,(0.8\times0.002 + 0.01\times0.998) = 0.0016/0.0116 = 0.14$. False alarms outnumber true detections about six to one, because negatives are 499 times more common than positives. 80% reads the recall as if it were precision, ignoring the base rate. 1% is the false-positive rate, a different quantity. 50% would need a prevalence of about 1.2%, six times higher than here.

? A degree-15 polynomial fitted to 20 noisy points has training RMSE 0.11 and validation RMSE 0.72, against a noise level of 0.3. Which term of the bias–variance decomposition dominates its expected error?
- [ ] Bias squared
- [x] Variance
- [ ] The noise $\sigma^2$
- [ ] None: the decomposition only holds for linear models
> The flexible model follows the noise of its particular training set, so its predictions change a great deal from sample to sample: variance is 0.87 of the expected test MSE of 0.96 in [Section 8](#s8). Its bias squared is near zero, because degree 15 can represent the target. The noise contributes 0.09 whatever the model. The decomposition is an identity for squared error and holds for any model.

? Ridge regression is the MAP estimate under which prior on the weights?
- [ ] A zero-mean Laplace distribution
- [ ] A uniform distribution
- [ ] No prior: ridge is a maximum-likelihood estimate
- [x] A zero-mean Gaussian
> A Gaussian prior adds $\lVert\mathbf{w}\rVert^2/(2\tau^2)$ to the negative log-posterior, which gives ridge with $\lambda = \sigma^2/(N\tau^2)$. A Laplace prior adds an L1 term and gives the lasso. A uniform prior adds a constant and returns plain maximum likelihood. Ridge is not maximum likelihood: the penalty is the prior.

? Which of these is NOT leakage?
- [ ] Selecting the 20 features most correlated with the label on all the data, then cross-validating
- [ ] Splitting repeated measurements of the same specimens by row
- [ ] Shuffling a time series before cross-validation
- [x] Fitting a `StandardScaler` on the training folds only, inside a `Pipeline`
> Preprocessing fitted only on the training folds never sees the validation data, which is the correct way to do it. The other three let validation information into training: selection on all the data (0.87 accuracy on pure noise in [Lab 4](#lab4)), group leakage between rows of one specimen, and temporal leakage, in which the model trains on the future of the points it is scored on.

? For which model would rescaling one feature from millimetres to metres leave the fitted predictions unchanged?
- [x] A gradient-boosted tree ensemble
- [ ] $k$-nearest neighbours
- [ ] An RBF-kernel SVM
- [ ] Ridge regression
> Trees split on one feature at a time by thresholds, which move with the rescaling, so the partitions and predictions are unchanged. $k$-NN and RBF kernels use distances that mix the features, so a feature in metres all but vanishes beside one in millimetres. Ridge penalises coefficients, whose size depends on the units, so the penalty weighs the features differently after rescaling.

? A neo-Hookean fit over 0–20% strain has a 95% interval of about $\pm2\%$ on $c_1$, yet its prediction at 40% strain is 13% low. The best explanation is
- [ ] The interval was computed wrongly
- [x] The interval quantifies noise assuming the model is right; it does not include model error outside the fitted range
- [ ] More data inside 0–20% would fix the extrapolation
- [ ] The noise is larger at 40% strain
> The interval in [Lab 5](#lab5) agrees with a Monte Carlo check, so it is not wrong; it is conditional on the model. The material stiffens beyond 20% (it is a Gent solid), and no amount of small-strain data can reveal that. More data inside the range would only narrow the interval further. Larger noise at 40% would widen the band, not shift the prediction by 13%.
```

## Guided reading {#reading}

A research paper is not read from the first line to the last. Read it in two passes, and decide after the first whether the second is worth the time.

**First pass, 5 to 10 minutes.** Read the title, abstract, introduction and conclusion, and look at every figure and table with its caption, without the surrounding text. Then write down, in your own words, three things: the question the paper asks, the claim it makes, and the evidence it offers. If you cannot state the claim as a sentence containing a number or a comparison ("method A beats method B on dataset C by this much"), the first pass is not finished. At the end of it you know whether the paper is relevant to you.

**Second pass, the remaining time.** Read the sections the guide below names and skip the rest. Read the method until you could reproduce the central figure from its description. For each result, ask the questions of this module: what is the baseline, how was the number measured, on which split, with what interval, and what would change it? Read the experimental setup before the results, because it tells you which comparisons are fair. Skip the proofs on a first reading unless a question asks about one; check instead that you can say what each theorem assumes.

Keep a page of notes with the reading questions below as headings, and write each answer in a sentence or two. A paper you have read is one whose claims you can restate and criticise, not one you have seen. The times are budgets for a first reading; the questions repay a second.

::: paper minutes=15
Belkin, M., Hsu, D., Ma, S., Mandal, S. "Reconciling modern machine-learning practice and the classical bias–variance trade-off." *Proceedings of the National Academy of Sciences (PNAS)*, 2019.

**Why read it.** The paper that named double descent. It shows where the classical U-shaped validation curve of [Section 8](#s8) stops being the whole story, and why the decomposition itself still holds.

**What to read and skip.** Read the abstract, the introduction up to and including Figure 1, and the part on random Fourier features in the section on neural networks, with its figure of test risk, coefficient norm and training risk against the number of features. Skip the theoretical analysis and the supplementary material.

**Questions to answer while reading**

1. What is the interpolation threshold, and where does it sit for random Fourier features?
2. Beyond the threshold many parameter vectors fit the training data exactly. Which one do the authors choose, and why does that choice matter for test error?
3. Does double descent contradict the bias–variance decomposition you derived in Section 8? Explain in two sentences.
4. What does the paper imply for choosing model size by validation in practice?

**After reading.** Compare the paper's curve with the numbers of [Section 8](#s8)'s double-descent paragraph, which apply the minimum-norm fit past degree 19 to [Lab 3](#lab3)'s design. There the second descent does not go below the classical minimum; check whether the paper claims otherwise for its experiments, and what the answer says about when to trust either shape.
:::

::: paper minutes=15
Kapoor, S., Narayanan, A. "Leakage and the reproducibility crisis in machine-learning-based science." *Patterns*, 2023.

**Why read it.** A survey of leakage in published machine-learning-based science, with a taxonomy that turns [Lab 4](#lab4)'s three cases into a checklist, and a case study in which a celebrated advantage of complex models disappears once leakage is fixed.

**What to read and skip.** Read the introduction, the taxonomy of eight leakage types (the definition of each type, and the survey table whose columns are the types) and the civil-war prediction case study. Skim the field-by-field survey and the model info sheet.

**Questions to answer while reading**

1. Place each of Lab 4's three leaky pipelines in the paper's taxonomy.
2. What happened to the reported advantage of complex models over logistic regression in the civil-war case once the errors were corrected?
3. Which items of the authors' proposed documentation (model info sheets) would have caught the group leak in Lab 4?
4. Name one type of leakage in the taxonomy that a test set opened only once does not protect against, and say why.

**After reading.** Take a model evaluation you have done or reviewed and fill in the taxonomy as a checklist, one line per leakage type: "excluded, because ..." or "possible, because ...". The answers you cannot give are where the evaluation is weakest.
:::

::: paper minutes=15
Domingos, P. "A few useful things to know about machine learning." *Communications of the ACM*, 2012.

**Why read it.** A practitioner's summary of lessons this module derives formally. Reading it last tests whether the formal versions stuck, and it is the article to hand a colleague who asks what this module was about.

**What to read and skip.** Read the sections on learning as representation plus evaluation plus optimisation, on generalisation, on overfitting (with the dartboard figure), on intuition failing in high dimensions, and on more data beating a cleverer algorithm. Skim the rest.

**Questions to answer while reading**

1. Domingos splits a learner into representation, evaluation and optimisation. Map these onto the five ingredients of [Section 1](#s1). Which ingredients does he leave implicit?
2. Which of his four dartboards corresponds to the unregularised degree-15 polynomial on 20 points in Lab 3, and which to the degree-1 fit?
3. He says more data beats a cleverer algorithm. Using the learning curves of Section 8, say when that is true and when it is false.
4. Which of his high-dimensional intuitions does [Section 11](#s11)'s sub-cube calculation quantify, and which does the $k$-NN scenario of [Exercise 12](#e12) illustrate?

**After reading.** List the lessons in the article that this module did not cover (feature engineering and ensembles, for instance) and note which later module takes each one up.
:::

## Summary {#summary}

- A learning method is five choices: the data, a model family, a loss, an optimiser and an evaluation. Each carries an assumption, and most failures trace back to one of them.
- Least squares is an orthogonal projection: the normal equations $\mathbf{X}^\top(\mathbf{y} - \mathbf{X}\mathbf{w}) = \mathbf{0}$ say the residual is orthogonal to every column of $\mathbf{X}$.
- On a quadratic, gradient descent converges if and only if $\eta < 2/\lambda_{\max}$ of the Hessian, and the number of steps it needs grows in proportion to the condition number $\kappa = \lambda_{\max}/\lambda_{\min}$; centring and standardising features is the cheapest way to reduce $\kappa$.
- With a constant step, SGD stops at a noise floor proportional to $\eta/B$ rather than at the minimum. Convergence needs a decaying step or a larger batch, and the two knobs trade speed against precision.
- Losses are negative log-likelihoods: Gaussian noise gives squared error (best constant: the mean), Laplace noise gives absolute error (the median), and Bernoulli or categorical outcomes give cross-entropy.
- For logistic and softmax regression the gradient with respect to the logits is $\hat p - y$ (or $\hat{\mathbf{p}} - \mathbf{y}$): the sigmoid or softmax derivative cancels against the logarithm, so confident mistakes produce large gradients.
- A metric is chosen by the decision it serves. Precision depends on the base rate (recall 0.8 and false-positive rate 0.01 at 0.2% prevalence give precision 0.14), and calibration, measured by expected calibration error and the Brier score, is a separate property from discrimination.
- Test error is bias squared plus variance plus noise. Validation curves, learning curves and $k$-fold cross-validation locate a model between underfitting and overfitting, and a choice between near-equal candidates should be judged against the standard error of the comparison.
- Ridge and lasso are MAP estimates under Gaussian and Laplace priors, with $\lambda = \sigma^2/(N\tau^2)$ for ridge: regularisation is prior knowledge, paying a little bias for a larger reduction in variance. Double descent is a real phenomenon under specific conditions, not a replacement for the U-shaped curve.
- Honest evaluation means every fitted step, scaling and selection included, sits inside the folds; splits respect groups and time; model selection is nested; the test set is opened once (selecting features on all the data gives 0.87 accuracy on pure noise in Lab 4), and every reported number carries an interval. Compare two models on one test set with a paired bootstrap and McNemar's exact test, and when the two disagree, say so rather than choose the one you prefer.
- Tabular baselines come first: regularised linear models, then gradient-boosted trees. Rescaling a feature changes the predictions of $k$-NN, kernels and ridge but not of trees.
- A parameter interval measures noise given the model, not model error. A neo-Hookean fit with a $\pm2\%$ 95% interval over 0–20% strain is 13% low at 40%, so a fitted model should travel with the range it was fitted over.

The next module, [Module 02](module_02_EN.html), turns the linear model of this one into a network: it stacks layers, replaces the hand-derived gradient with backpropagation, and replaces plain SGD with momentum and Adam. Everything here carries over: the loss is still a negative log-likelihood, the Hessian's eigenvalues still govern training speed, regularisation still encodes a prior, and a network's validation score is still worthless if it leaks.

## References {#refs}

- Bishop, C. M. "Pattern Recognition and Machine Learning." *Springer*, 2006. Chapters 1, 3 and 4: the probabilistic view of this module.
- Hastie, T., Tibshirani, R., Friedman, J. "The Elements of Statistical Learning," 2nd ed. *Springer*, 2009. Chapters 2, 3 and 7: least squares, ridge and lasso, model assessment and the one-standard-error rule.
- James, G., Witten, D., Hastie, T., Tibshirani, R. "An Introduction to Statistical Learning," 2nd ed. *Springer*, 2021. The gentler companion to the previous book.
- Goodfellow, I., Bengio, Y., Courville, A. "Deep Learning." *MIT Press*, 2016. Chapter 5: machine-learning basics.
- Murphy, K. P. "Probabilistic Machine Learning: An Introduction." *MIT Press*, 2022. Maximum likelihood, MAP and logistic regression in one notation.
- Trefethen, L. N., Bau, D. "Numerical Linear Algebra." *SIAM*, 1997. QR, the SVD and the conditioning of least squares.
- Nocedal, J., Wright, S. J. "Numerical Optimization," 2nd ed. *Springer*, 2006. Convergence rates of gradient descent; Gauss–Newton and Levenberg–Marquardt.
- Robbins, H., Monro, S. "A stochastic approximation method." *Annals of Mathematical Statistics*, 1951. The step-size conditions for SGD.
- Bottou, L., Curtis, F. E., Nocedal, J. "Optimization methods for large-scale machine learning." *SIAM Review*, 2018. SGD in theory and practice.
- Keskar, N. S. et al. "On large-batch training for deep learning: generalization gap and sharp minima." *ICLR*, 2017. The small-batch, flat-minimum observation of Section 4.
- Hoerl, A. E., Kennard, R. W. "Ridge regression: biased estimation for nonorthogonal problems." *Technometrics*, 1970. The original ridge paper.
- Tibshirani, R. "Regression shrinkage and selection via the lasso." *Journal of the Royal Statistical Society, Series B*, 1996. The original lasso paper.
- Belkin, M., Hsu, D., Ma, S., Mandal, S. "Reconciling modern machine-learning practice and the classical bias–variance trade-off." *PNAS*, 2019. Double descent; guided reading.
- Nakkiran, P. et al. "Deep double descent: where bigger models and more data hurt." *ICLR*, 2020. Double descent in deep networks.
- Wolpert, D. H. "The lack of a priori distinctions between learning algorithms." *Neural Computation*, 1996. The no-free-lunch theorem.
- Kaufman, S., Rosset, S., Perlich, C., Stitelman, O. "Leakage in data mining: formulation, detection, and avoidance." *ACM Transactions on Knowledge Discovery from Data*, 2012. An early formal treatment of leakage.
- Kapoor, S., Narayanan, A. "Leakage and the reproducibility crisis in machine-learning-based science." *Patterns*, 2023. Guided reading.
- Ambroise, C., McLachlan, G. J. "Selection bias in gene extraction on the basis of microarray gene-expression data." *PNAS*, 2002. The feature-selection leak of Lab 4.
- Varma, S., Simon, R. "Bias in error estimation when using cross-validation for model selection." *BMC Bioinformatics*, 2006. Why nested cross-validation.
- Cawley, G. C., Talbot, N. L. C. "On over-fitting in model selection and subsequent selection bias in performance evaluation." *Journal of Machine Learning Research*, 2010. The same point for hyperparameter search.
- Fawcett, T. "An introduction to ROC analysis." *Pattern Recognition Letters*, 2006. ROC curves and AUC.
- Saito, T., Rehmsmeier, M. "The precision-recall plot is more informative than the ROC plot when evaluating binary classifiers on imbalanced datasets." *PLoS ONE*, 2015. Why the base rate matters for the choice of curve.
- Niculescu-Mizil, A., Caruana, R. "Predicting good probabilities with supervised learning." *ICML*, 2005. Calibration of classical classifiers; Platt and isotonic recalibration.
- Guo, C., Pleiss, G., Sun, Y., Weinberger, K. Q. "On calibration of modern neural networks." *ICML*, 2017. Expected calibration error and temperature scaling.
- Efron, B., Tibshirani, R. J. "An Introduction to the Bootstrap." *Chapman & Hall*, 1993. The bootstrap of Section 10.
- McNemar, Q. "Note on the sampling error of the difference between correlated proportions or percentages." *Psychometrika*, 1947. The paired test of Section 10.
- Dietterich, T. G. "Approximate statistical tests for comparing supervised classification learning algorithms." *Neural Computation*, 1998. Why McNemar's test suits comparing two classifiers on one test set.
- Breiman, L. "Random forests." *Machine Learning*, 2001. Bagged trees with random feature subsets.
- Friedman, J. H. "Greedy function approximation: a gradient boosting machine." *Annals of Statistics*, 2001. Gradient boosting as functional gradient descent.
- Chen, T., Guestrin, C. "XGBoost: a scalable tree boosting system." *KDD*, 2016. A widely used boosting library.
- Ke, G. et al. "LightGBM: a highly efficient gradient boosting decision tree." *NeurIPS*, 2017. Histogram-based boosting.
- Grinsztajn, L., Oyallon, E., Varoquaux, G. "Why do tree-based models still outperform deep learning on typical tabular data?" *NeurIPS Datasets and Benchmarks Track*, 2022. The benchmark behind the tabular-baseline advice.
- Cortes, C., Vapnik, V. "Support-vector networks." *Machine Learning*, 1995. The soft-margin support vector machine.
- Rasmussen, C. E., Williams, C. K. I. "Gaussian Processes for Machine Learning." *MIT Press*, 2006. The standard reference for Gaussian processes.
- Arthur, D., Vassilvitskii, S. "k-means++: the advantages of careful seeding." *SODA*, 2007. The seeding rule used by default in scikit-learn's $k$-means.
- Domingos, P. "A few useful things to know about machine learning." *Communications of the ACM*, 2012. Guided reading.
- Holzapfel, G. A. "Nonlinear Solid Mechanics: A Continuum Approach for Engineering." *Wiley*, 2000. Neo-Hookean and related strain-energy functions.
- Gent, A. N. "A new constitutive relation for rubber." *Rubber Chemistry and Technology*, 1996. The Gent model of Section 12 and Lab 5.
- Bates, D. M., Watts, D. G. "Nonlinear Regression Analysis and Its Applications." *Wiley*, 1988. Parameter uncertainty in nonlinear least squares.
- Pedregosa, F. et al. "Scikit-learn: machine learning in Python." *Journal of Machine Learning Research*, 2011. The library used in the labs.
