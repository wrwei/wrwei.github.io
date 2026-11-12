## Project contract and required artefacts {#contract}

Implement and defend a small binary classifier from a fixed generative model through an honest final evaluation. Use CPU NumPy; no GPU, paid API or downloaded dataset is needed. The sixteen-hour core has four four-hour stages. The reference scripts below run independently in the pinned NumPy environment, generate their own inputs, and expose actual results. Write your derivations and predict the faults before inspecting the reference solution.

Submit a data/split manifest, training-only transformation specification, mathematical appendix, runnable model, derivative-check evidence, validation selection table, four-fault diagnosis, frozen test report, three generated diagnostic plots, and one complete prediction/update trace. Separate the reference's results from a learner submission. If you change data, draw order, optimiser, penalty or budget, execute your variant and report its actual output rather than copying these numbers.

The fixed protocol evaluates mean log-loss as the selection metric and accuracy at threshold .5 as a predeclared decision metric. It also reports Brier score, confusion counts and five fixed probability calibration bins. The final model is selected across a predeclared grid on validation only; a PCA comparison and constant-probability baseline are frozen before final testing. The test scores are estimates for the stated sampling/mixture interpretation, not a guarantee of future deployment performance.

::: figure #fig-32-1
Data generation and stratified splitting precede all fitted transformations; validation controls the choices and final test remains frozen.
:::

## Stage 1 · define and inspect · 4 hours {#st1}

Generate 1,000 independent examples using NumPy default_rng with data seed 7. For exact reproducibility, draw one shape-(1000,5) standard-normal matrix in row-major order, with columns z1,z2,z3,e1,e2, then draw 1,000 uniform values for Bernoulli labels. The random generator is PCG64 in the pinned NumPy 1.26.4 environment. Recording the integer seed without the generator and draw order is insufficient to reproduce this dataset.

Set X=(z1,100z2,z1+.02e1,z3,e2), and conditional success probability p_star=σ(1.5z1−2z2+.5z3). Label y equals one when the subsequent uniform draw is below p_star. Latents and examples are independent in the generative model, while the first and third observed features are nearly dependent by construction. The fifth feature is irrelevant to this conditional label probability. The near duplicate remains a genuine nonzero noise direction; it is not an exactly redundant column.

$$X_i=(z_{1i},100z_{2i},z_{1i}+0.02e_{1i},z_{3i},e_{2i}),\qquad Y_i\mid Z_i\sim\operatorname{Bernoulli}\!\left(\sigma(1.5z_{1i}-2z_{2i}+0.5z_{3i})\right).$$

Use an independent split generator with seed 11 and exact sizes 600/200/200. Allocate positive labels proportionally with largest remainders: floor the three positive quotas, give leftover positive counts to the largest fractional parts with train/validation/test tie order, and fill remaining slots with negatives. Shuffle indices separately within each class, allocate them, then shuffle each resulting split. This preserves proportions as closely as integer counts allow without duplicating rows. The reference has 503 positives, allocated 302/101/100.

Stratification uses labels to construct the split, as explicitly required; it does not permit using held-out feature values or labels to fit transformations or choose parameters. Fixed class counts also affect the interpretation of test uncertainty. Ordinary IID binomial formulas for an unrestricted random mixture should not be silently substituted for this stratified design. State which population or fixed class mixture a reported estimate and interval describe.

Fit feature means μ_j and population-convention standard deviations s_j with ddof=0 using training rows only. Transform every split by (x_j−μ_j)/s_j. Reject a zero training scale or specify a predeclared constant-feature policy; the generated reference has positive scales. Add an intercept column after scaling. Fit PCA only to the standardised training matrix, using its right singular vectors; validation selects retained component count. Do not whiten in this reference, and do not refit either scaler or PCA on test data.

### Dataset, split, and curvature reference {#lab1}

{{LAB:lab1}}

The centred raw design has a singular value around 2439 for the large z2 feature and a small mode around .35. Standardisation reduces the largest to about 34.81, but the small near-duplicate contrast remains about .362. Numerical rank is five. Distinguish rank from conditioning: full rank still permits strongly correlated coefficient directions. PCA's smallest explained-variance ratio is roughly 4.37×10^(−5), reflecting the nearly duplicate contrast rather than an arithmetic zero.

**Stage gate:** reproduce the data hash and split counts in the tested environment, prove the index sets are disjoint and complete, list transformation-fit rows, and explain each singular mode. The SHA256 hash is a reproducibility identifier for these generated bytes; it is separate from Module 31's educational modular checksum.

## Stage 2 · derive and implement · 4 hours {#st2}

### Mathematical appendix: likelihood, shapes, and gradient {#appendix}

Let A=[1,Z] be the design after training-only scaling, with n rows and q=d+1 columns, and θ=(b,w) have q entries. Logits t=Aθ and labels y each have n entries. Sigmoid p=σ(t) also has n entries. Bernoulli likelihood for the fixed observed labels is the product of p_i^(y_i)(1−p_i)^(1−y_i); conditional independence motivates the product. Work with negative log-likelihood to avoid underflow of that product.

The mean objective is F(θ)=mean_i[softplus(t_i)−y_i t_i]+λ||w||²/2. The intercept b is not penalised. λ refers to the mean-loss convention, so changing to a sum changes its comparable scale. For finite logits use max(t,0)−yt+log1p(exp(−|t|)); evaluate sigmoid in positive/negative branches so exponentials do not overflow. Do not clip probabilities and call that the unchanged objective. Stable evaluation can still produce probability endpoints in finite precision, while logit loss remains usable.

$$F(\theta)=\frac1n\sum_i\left[\log(1+e^{t_i})-y_it_i\right]+\frac\lambda2\|w\|_2^2,\quad t=A\theta,\quad \nabla_\theta F=\frac{A^\top(p-y)}n+\lambda(0,w).$$

Derive the gradient: derivative of softplus is sigmoid, derivative of the linear label term is −y, and the chain rule for t=Aθ gives Aᵀ(p−y)/n. The penalty contributes zero intercept entry and λw slopes. Shapes are (n,q)ᵀ times (n,), producing (q,). Broadcasting a label column (n,1) against probability vector (n,) can create an unintended (n,n) error matrix; assert your intended one-dimensional label and parameter shapes rather than rely on silent broadcasting.

The Hessian is AᵀDA/n+λdiag(0,1,…,1), where D_ii=p_i(1−p_i)∈[0,1/4]. It is PSD, so the objective is convex. Its spectral norm is bounded by ||A||2²/(4n)+λ. This bound explains why raw feature scale can force very small safe gradient steps. It is a sufficient curvature estimate, not a necessary failure threshold for every trajectory. With λ>0 the slope directions are penalised; the free intercept and data still determine the full Hessian structure. With λ=0, separation can prevent a finite MLE as in Module 26.

$$\nabla^2 F=\frac{A^\top D A}{n}+\lambda\operatorname{diag}(0,1,\ldots,1),\qquad 0\preceq D\preceq\tfrac14 I.$$

For this fixture, the unpenalised raw Hessian upper bound is about 2478.62, versus .504813 after scaling. Rate .2 on raw coordinates lies far outside the conservative reciprocal-curvature scale; the actual training NLL rises from log2≈.693 to about 76.18 after one step and 104.50 after ten. The same stable arithmetic computes these bad updates accurately. The repair changes coordinates and chooses rates appropriate to the transformed objective, rather than masking the large losses with probability clipping.

### Proof and derivative obligations {#proofs}

Write the likelihood-to-loss and chain-rule derivation with all dimensions. Independently compare central differences of the same smooth scalar penalised objective on eight controlled training rows, at θ=linspace(−.2,.3,6), λ=.03 and h=10^(−5). The reference norm error is about 1.55×10^(−11). Explain why this check is local evidence, why a sweep around that h is useful, and why a missing n factor is an algebraic convention fault. Include the intercept penalty explicitly in both checks.

For PCA, decompose the training-scaled matrix Z_train=UΣVᵀ. A retained V_k has shape (d,k), projected rows have k entries, and the logistic design has k+1 columns. Component variance proportions are σ_j²/Σσ²; the common sample-covariance denominator cancels. PCA maximises retained input variance, not predictive label information. Validation may prefer many components, and a tiny variance direction is not automatically irrelevant in another problem. With all five components retained and no whitening, this is an orthogonal rotation, not compression.

::: figure #fig-32-2
Follow the n×d feature matrix into n×(d+1) design, n logits, and a (d+1)-entry gradient; PCA changes d to k.
:::

**Stage gate:** show a finite-logit loss calculation, gradient dimensions and numerical evidence. Predict the raw-step failure from curvature, then distinguish near dependence, exact rank deficiency and PCA truncation.

## Stage 3 · select and diagnose · 4 hours {#st3}

### Complete reference pipeline {#lab2}

Train each candidate for exactly 800 full-batch updates from zero. The full-feature grid uses rates .05,.2,1 and λ=0,.01,.1. The PCA comparison uses k=2,3,4,5, rate .2 and λ=.01. Fit the shared scaler and PCA basis once on training only; select across the thirteen fixed configurations by validation mean NLL, with first-grid-entry tie order. A constant model predicts the training positive fraction, about .503333. Freeze these rules, accuracy threshold .5 and five equal-width probability bins before any final test metric.

Every candidate has the same update count, but step sizes change optimisation progress over that budget. A validation preference for a slower rate may reflect its finite-time regularisation; it is not a universal best rate for a fully converged problem. The reference's selected full model uses rate .05 and λ=0. The separately selected PCA comparison retains five components. Thus this result does not demonstrate beneficial dimensional reduction, even though reduced variants were evaluated properly on validation.

The script prints its frozen choices before evaluating test rows. It keeps those trained weights rather than silently refitting on train plus validation, which would produce a different final fitting procedure. If you want such a refit, define it before testing and explain how the scaler, PCA, update count and penalty are refit; do not quietly substitute it for this reference contract.

{{LAB:lab2}}

### Four mandatory fault diagnoses {#lab3}

The fault script isolates each failure and repair. It is separate from the final-model comparison, so deliberate corruptions do not become hidden candidate choices. Provide a prediction, measured failure and mathematical repair for all four:

| Fault | Required evidence | Repair and reason |
|---|---|---|
| Preprocessing leakage | A large held-out sentinel changes the all-data mean but leaves the training-only mean unchanged. | Fit transformations using training rows only; the future feature value must not influence past fitting. |
| Overflowing logits | Naive extreme-logit probability losses become infinite; stable finite-logit NLL is 1000. | Use branched sigmoid and logit loss, preserving the original objective. |
| Missing mean-gradient factor | Correct central difference agrees; unnormalised sum gradient has a persistent mismatch. | Divide by n for the mean objective and retain the same penalty convention. |
| Misleading prevalence metric | Always-zero accuracy changes .95→.05 while positive recall remains zero. | Declare prevalence, confusion counts, threshold/cost and probability evidence; accuracy alone omits the intended behaviour. |

{{LAB:lab3}}

The leakage sentinel is a dependence test, not a claim that leakage always improves an observed score. The overflow example does not imply the generated dataset itself contains logits of magnitude 1000; it tests a controlled numerical boundary. The prevalence example changes the label mixture, not the original final test dataset. State these distinctions so the fault demonstrations remain interpretable.

::: figure #fig-32-3
Mean reduction and unpenalised intercept define the objective; stable evaluation and the derivative check must implement those same conventions.
:::

**Stage gate:** submit the complete validation table and all four diagnosed faults. Freeze your final configuration in a written record before proceeding to test. Missing leakage or derivative diagnosis prevents passing regardless of total score.

## Stage 4 · evaluate and explain · 4 hours {#st4}

The executed primary test mean NLL is about .401414, accuracy .825 at .5, and Brier score .129401. The frozen constant baseline has NLL .693169 and accuracy .5. Confusion counts are TP=79,FP=14,FN=21,TN=86; they sum to 200 and imply 165 correct. The separately frozen PCA comparison has NLL about .406029. These are results of the declared reference experiment; test differences do not trigger reselection or justify claims about every random dataset.

Calibration compares average predicted probability with observed positive fraction in five predeclared bins. Include each count: a close pair of numbers in a small bin is weaker evidence than a large independent evaluation, and empty bins have no empirical fraction. The actual plot and output show 57,30,32,36,45 observations across bins. This finite diagnostic does not prove conditional calibration at every input or under changed prevalence. Predefining bins avoids using the held-out labels to design an attractive summary.

### Uncertainty, seed interpretation, and mathematical trace {#assessment}

The reference uses 1,000 stratified bootstrap replicates with PCG64 seed 32032. It samples test indices with replacement separately within the observed label classes, preserving their counts and pairing model/baseline losses on each sampled example. The percentile 95% intervals are approximate: NLL about [.339206,.467994], accuracy [.77,.875], and primary-minus-baseline mean NLL difference about [−.353963,−.225175]. The negative difference favours the primary model for this frozen comparison and conditional mixture estimate.

This procedure assumes the within-class evaluation examples represent independent conditional draws from their declared class populations and freezes the fitted models. The intervals are conditional on observed class counts, omit uncertainty in population prevalence and omit variation from refitting/scaling/selection. They are not exact finite-sample guarantees or unconditional IID-binomial intervals. If the goal is performance of the whole learning algorithm over new datasets, repeat the full independent generation/fitting procedure or use a justified procedure for that target. Multiple dependent splits or seeds are not independent test people.

Zero initialisation and full-batch updates make this reference deterministic for fixed data and arithmetic. Changing an optimiser seed has no effect because that algorithm uses none. Changing data seed changes observations; changing split seed changes allocation; introducing minibatches or random starts adds algorithmic variation. Record generator and draw order and distinguish these sources as in Modules 28–30. Small platform-specific numeric differences should be assessed with meaningful tolerances rather than impossible promises about all devices.

The complete trace uses first training row ID 623, whose standardised features are approximately (−.365375,.046370,−.372031,.046522,−.671813) and label zero. Initial θ=0 gives logit zero, probability .5 and loss log2. Its individual gradient contribution is .5 times the intercept-augmented row. The full mean gradient averages all 600 rows and is approximately (−.003333,−.172027,.230107,−.171787,−.083415,.006681). At selected rate .05 the first update is −.05 times this vector; the first row's updated probability is about .498428.

The final printed weights and intercept give that row logit approximately −.570055 and probability .361224. Follow raw input→training scaler→design→dot product→sigmoid→loss/decision, then distinguish one-example contribution from the full mean update. At zero the penalty gradient vanishes even for a nonzero penalty; later it applies only to slopes. The script prints both the exact executed arrays and summary values so a reader can reproduce each step without relying on an unexplained accuracy number.

::: figure #fig-32-4
The report distinguishes optimisation, numerical evidence, sampling uncertainty and the target population.
:::

## Cost, risk, and report obligations {#complexity}

For n training rows and d features, each dense full-batch gradient costs O(nd), with O(nd) design storage and O(d) weights. Thirteen 800-step candidate fits are a declared comparison budget, while full-feature and PCA candidate widths differ. A thin SVD for n≥d costs order nd² and stores a d×d right-vector basis; projecting each split costs order ndk. Kernel-style n² storage is unnecessary for this linear model. Wall-time constants depend on numerical libraries and hardware, so the small reference is not a deployment benchmark.

The empirical objective uses fixed training labels, and the final metrics estimate risk under a declared test design. Population Bayes uncertainty remains because Bernoulli labels are random even at a fixed input. Small training gradient, convexity, low training NLL or a successful derivative check alone does not establish generalisation. Distribution shift can alter all reported metrics. Feature scaling changes optimisation coordinates and the geometry of a slope penalty; the standardised λ is not silently the same raw-coordinate prior.

Write a report of roughly 1,500–2,500 words plus code, appendix and figures. Include the draw/split manifest and hash, dimensions, likelihood/objective/gradient, Hessian argument, rank/PCA interpretation, controlled derivative checks, raw-versus-scaled behaviour, validation choices, mandatory faults, frozen test/baseline/calibration results, conditional uncertainty limits and the full prediction/update trace. Cite actual outputs and identify any changed protocol. This is the final mathematical integration task, not a score-only model demo.

## Assessment rubric and saved defence {#rubric}

| Criterion | Weight | Evidence required for full credit |
|---|---:|---|
| Model and assumptions | 15% | Exact generator, split, label law, independent units and target interpretation. |
| Derivations and gradient verification | 25% | Likelihood, normalisation, shapes, unpenalised intercept, Hessian and independent check. |
| Numerical implementation | 20% | Stable logits, scaling repair, runnable CPU fits and PCA diagnostics. |
| Experimental design and evaluation | 25% | Training-only fitting, validation selection, all four faults and frozen conditional test evidence. |
| Reproducibility and explanation | 15% | Versions, seeds, commands, plots, trace and limitations. |

Recommended pass is at least 80/100, **with leakage and derivative faults correctly diagnosed**. Give each criterion a score and link its supporting artefact. A high accuracy does not compensate for those missing obligations.

<div class="free-response" data-free-response data-key="math-series:m32:report">
<label for="q10-response">Defence report: derive your mean objective and gradient, trace one update, explain training-only transformations and four faults, then interpret frozen test estimates and their uncertainty limits.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="8" placeholder="State data dependence, dimensions, numerical evidence, fixed choices and the target of each estimate."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I correctly diagnosed leakage and derivative faults and supported each evaluation claim.</label>
</div>

::: answer
The appendix derives Aᵀ(p−y)/n plus λ(0,w), validates it on the identical smooth objective, and traces a mean update separately from one row's contribution. Fit μ,s,V only on training, choose the predeclared grid on validation, then freeze models and metrics. Stable logits repair arithmetic, scaling repairs curvature, and prevalence requires an appropriate metric interpretation. Conditional stratified bootstrap evidence omits refitting/prevalence uncertainty; test risk is an estimate, not a general guarantee.
:::

## Optional extension, reading, and completion {#reading}

Outside the sixteen-hour core, implement a two-layer network or a three-token attention calculation, derive its backward pass, and test derivatives on a smooth controlled example. Compare its numerical dynamics and fitting capacity with this convex linear reference. Preserve training-only transformations, declared selection and frozen test discipline.

Revisit Modules [14](module_14_EN.html), [18](module_18_EN.html), [26](module_26_EN.html), [27](module_27_EN.html), [28](module_28_EN.html), [29](module_29_EN.html) and [30](module_30_EN.html). The project appendix derives its own likelihood, gradient and curvature rather than relying on library fitting. You have reached the final module; use the [course overview](index.html) to revisit gaps or follow the complementary CS route.
