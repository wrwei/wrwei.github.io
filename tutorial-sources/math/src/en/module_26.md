## Inference requires a repeatable experimental question {#start}

A fitted coefficient or benchmark score does not by itself establish uncertainty, significance or cause. Inference asks what conclusions an experimental procedure supports under its sampling and assignment assumptions. This lesson constructs confidence coverage, valid null-tail probabilities, paired comparisons, resampling procedures and regression objectives, then protects the final evaluation from model selection. Write the target and protocol before inspecting the result; later interpretation depends on those choices.

**Retrieval check:** [Module 12](module_12_EN.html#s1) supplies least-squares geometry, [Module 19](module_19_EN.html#s1) supplies optimisation, and [Module 25](module_25_EN.html#s1) supplies likelihood and estimation. Module 24's sampling guarantees are used throughout. Labs 1 and 3 use the standard library; Lab 2 uses the [pinned NumPy environment](numpy_primer_EN.html#setup). All experiments run on a CPU with fixed local seeds.

## Confidence intervals describe procedure coverage {#s1}

$$P_\theta\{\theta\in C(X)\}\geq1-\alpha.$$

A confidence interval is a data-dependent set C(X) for a fixed parameter θ. A level 1−α guarantee means P_θ(θ∈C(X))≥1−α for every θ covered by the claimed model, or an explicitly qualified asymptotic version. The interval is random before sampling. After data are observed its endpoints are fixed, and the statement does not assign posterior probability to θ without a prior. A realised interval either contains the fixed truth or does not; the probability guarantee belongs to repeated use of the construction.

For IID Gaussian observations with known variance σ²>0, x_bar has exactly Gaussian distribution with mean μ and variance σ²/n. Let z be a standard-Gaussian quantile satisfying P(|Z|≤z)=1−α. Then P_μ(|x_bar−μ|≤zσ/√n)=1−α, so C=[x_bar−zσ/√n,x_bar+zσ/√n] has exact coverage. Algebraically invert the sampling event into a parameter set; this is a proof of the construction. At α=.05, z≈1.959964. Using this constant with an estimated variance for arbitrary observations is a different, generally approximate, procedure.

::: worked title="An exact known-noise interval is a sampling construction"
For n=100, known σ=2 and observed mean 5, the Gaussian 95% interval is approximately [4.608007,5.391993]. Its half-width is 1.959964·2/10. The model guarantees repeated-sampling coverage .95, not probability .95 for an unknown fixed μ after this particular interval has been realised. A Bayesian credible interval uses a different conditioning statement from Module 25.
:::

For IID [0,1] observations with common mean μ, Hoeffding from Module 24 gives P(|x_bar−μ|≥r)≤α for r=√[log(2/α)/(2n)]. Thus the closed interval [x_bar−r,x_bar+r], intersected with [0,1], has coverage at least 1−α. The strict/non-strict distinction only strengthens this conservative guarantee for the closed interval. Clipping to the known parameter space does not remove the true μ. The radius is distribution-free within the bounded-independent model, not a claim about dependent rows or unbounded regression residuals.

The usual Bernoulli Wald interval instead uses p_hat±z√[p_hat(1−p_hat)/n]. It can have poor finite coverage, especially near zero or one; clipping cannot repair missed coverage caused by a zero radius. If no success is observed, this interval collapses to zero although a positive rare rate can produce that sample with high probability. Alternative binomial constructions exist, but this module compares the transparent approximate Wald formula with a valid conservative bounded construction rather than silently calling every displayed interval exact.

::: widget name=inference
:::

The coverage explorer enumerates every possible success count for a synthetic Bernoulli model, constructs the chosen interval for each count, and adds the probabilities of intervals containing the specified true p. This probability-weighted coverage is different from counting equally spaced counts as equally likely. A vertical line marks the synthetic truth; coloured horizontal intervals indicate inclusion. The true rate is known only because this is a model experiment. An application with unknown p cannot compute its actual coverage from the realised data alone.

When Gaussian σ is unknown, an exact interval can use the Student t pivot under IID Gaussian assumptions and n−1 degrees of freedom. This is a named distributional result requiring the mean/sample-variance relationship, not an automatic consequence of replacing σ by any empirical spread. Under general finite-variance sampling, CLT-based intervals are asymptotic and may fail at small n. Report which version is used, the independent unit, the standard-error calculation and the width in meaningful units. Wider or conservative intervals reflect a procedure's guarantee, not an assurance that every realised interval is useful.

::: figure #fig-26-1
Repeated intervals may or may not cover one fixed truth. Coverage weights each possible dataset by its sampling probability; it is not a posterior distribution over the truth.
:::

::: check
What is random in a confidence construction? Why does clipping a zero-width Wald interval fail to fix rare-event coverage? What assumptions support the Hoeffding interval here?
:::
::: answer
The data and resulting endpoints are random before observation. Clipping preserves the point zero and cannot include a positive truth it already missed. The Hoeffding interval needs independent bounded observations and the appropriate target mean.
:::

## Null hypotheses tail probabilities effect size and power {#s2}

A null hypothesis H₀ specifies a set of data laws or parameter values. A test statistic T summarises evidence according to a direction chosen in advance. A rejection rule has size at most α if its probability of rejection under every null law is at most α. Type I error is rejection when the null is true; Type II error is failure to reject under a specified alternative. Power is rejection probability under that alternative. These probabilities describe a procedure, not an observed outcome's probability of being an error.

Under a fully specified simple null, a p-value is a null-tail probability for results at least as extreme as the observed statistic, with the extremeness rule stated. A valid p-value satisfies P₀(p_value≤u)≤u for 0≤u≤1. In a continuous null with the right CDF transformation it is uniform; discrete tests are often conservative because atoms cannot be divided without randomisation. A composite null needs a construction that is valid over its whole set, such as an appropriate worst-case tail, not an arbitrary convenient parameter value.

For IID Bernoulli trials testing p₀=.5 with fixed n, choose T=|K−n/2|. The exact two-sided p-value sums binomial masses for all counts whose T is at least its observed value, including ties. This definition avoids ambiguity about two-sided conventions: other conventions can produce different discrete values and should be named. If the alternative direction is prespecified, a one-sided tail may be appropriate. Choosing one-sided direction only after seeing which way the effect points changes the rejection procedure and its error control.

::: worked title="Small statistical significance can accompany a small practical effect"
In an IID Gaussian mean test with known σ=1, n=1000000 and observed difference from the null .01, z=.01√n=10. The two-sided null tail is erfc(10/√2)≈1.524×10⁻²³. The effect is still .01 in its original units. A tiny p-value does not make that effect practically large, assign a probability to H₀, or establish a causal mechanism.
:::

The p-value is not P(H₀|data), not the probability that results were “due to chance,” and not the probability of an exact observed dataset. Computing posterior odds needs a prior and alternative likelihood as in Module 25. Rejecting an oversimplified null also does not identify which modelling assumption failed. Dependence, confounding, selection or a wrong variance model can invalidate the quoted tail even when the arithmetic is correct. State the tested null and the scientific target separately.

Failure to reject is not proof of equality. A noisy or small experiment may have low power to detect a material effect. Equivalence questions require a prespecified meaningful tolerance and a procedure designed to establish that effects fall inside it. Report an estimate, uncertainty interval and practical scale alongside the test result. Do not replace an effect-size comparison with whether one p-value falls just below .05 and another just above it; the difference between those labels is not itself a tested difference.

Power planning illustrates why sample size belongs in the protocol. For a one-sided known-σ Gaussian test rejecting x_bar>μ₀+z_(1−α)σ/√n, an alternative μ=μ₀+Δ gives power 1−Φ(z_(1−α)−Δ√n/σ). At Δ=0 the size is α; positive Δ increases power, and multiplying n by four doubles the signal-to-SE ratio. This derivation assumes the stated Gaussian sampling model. An effect selected after looking at results is not a prospective power specification, and estimated retrospective power adds little to the observed test itself.

::: check
What tail defines the stated binomial p-value? Is a p-value a posterior probability of H₀? Does nonrejection establish no practically relevant effect?
:::
::: answer
Sum null count masses with absolute deviation at least as large as observed, including ties. It is a sampling tail, not posterior null probability. Nonrejection may reflect low power; equivalence needs its own tolerance and analysis.
:::

The finite simple-null p-value validity can be proved without a simulation. Order the distinct possible statistic values from most extreme to least extreme, and accumulate their null masses in that order. Each statistic's p-value is its accumulated mass, including all ties at its value. For any u, the event that this p-value is at most u consists of an initial collection of these ordered values, whose total null mass is at most u by construction. If no accumulated mass is small enough the event is empty. This proves P₀(p_value≤u)≤u and explains conservative discrete sizes: a tied mass can jump across the chosen threshold. Selecting the extremeness order after observing the data would change this construction and needs a new validity argument.

The outcome's measurement scale belongs in the question too. A difference of .01 seconds, .01 probability units or .01 standard deviations has different practical meaning. Prespecify a material effect or tolerance using the application's scale, then plan uncertainty and power around it. A statistical test can detect a tiny departure from an idealised null while leaving the application decision almost unchanged.

## Assignment pairing confounding and independent units {#s3}

$$\operatorname{Var}(\overline D)=\frac{\operatorname{Var}(A)+\operatorname{Var}(B)-2\operatorname{Cov}(A,B)}{n}\quad\text{for IID pairs}. $$

Specify the unit that is sampled or assigned. A person with ten copied records is one independent subject in the copy model, not ten independent subjects. A model evaluated on several variants of the same prompt may share difficulty effects across variants. Splitting or bootstrapping such rows individually can put nearly identical information in multiple groups and underestimate uncertainty. Groups, time blocks or subjects must remain intact when that structure defines the inference target and independence model.

Random assignment supports a comparison by making treatment labels independent of preassignment characteristics according to a known design. It differs from random sampling, which supports representation of a population. A randomised experiment can be internally informative yet poorly representative; a representative observational sample can still have confounding. Randomisation does not automatically fix attrition, interference between units, noncompliance or measurement errors. The estimand might be an assignment effect, a treatment effect under further assumptions, or a prediction difference; say which one is intended.

For causal language, a simple potential-outcome notation uses Y_i(1),Y_i(0) for a unit's outcomes under two assignments. Only the assigned outcome is observed, so the individual difference is unavailable directly. Randomisation can justify average comparisons when assignment probabilities and the no-interference/stable-treatment interpretation are appropriate. An observational regression coefficient does not acquire that interpretation solely because its p-value is small. Adjustment for measured variables needs its own causal assumptions and cannot guarantee removal of unmeasured confounding.

Pairing compares two results on the same sampled unit. Let D_i=A_i−B_i for independent units i. The paired estimate is D_bar and its variance is Var(D_i)/n under IID pairs. Since Var(D)=Var(A)+Var(B)−2Cov(A,B), positive shared difficulty covariance can substantially improve precision. An unpaired formula discards that covariance. Pairing by arbitrary row order is not a valid design; the pair must represent a meaningful matched unit, and independence concerns different pairs.

::: worked title="Shared difficulty cancels in a paired model comparison"
Suppose A_i=μ_A+S_i+ε_Ai and B_i=μ_B+S_i+ε_Bi, where all subjects are independent and S, ε_A, ε_B are mutually independent within each subject. Let Var(S)=9 and each noise variance be 1. Each marginal variance is 10, covariance is 9, so paired difference variance is 2 rather than the unpaired reference 20. At n=100 the paired SE is √.02≈.141421, versus √.2≈.447214. This gain follows from the specified common-effect model, not from the word pairing alone.
:::

Report experimental assignment, exclusions, missing-data handling, primary outcomes, effect direction, sample count and planned analysis before viewing outcomes. Multiple random seeds can describe optimiser variation conditional on a fixed dataset; they do not replace independently sampled subjects for population evaluation. Conversely many held-out examples under one training seed do not measure training variability across seeds. A benchmark may need both levels, with claims and units separated rather than treating every seed–example pair as jointly independent.

::: figure #fig-26-2
Rows can share a subject or input, while pairing intentionally shares one unit across methods. Keep groups intact and analyse differences at the independent-unit level.
:::

::: check
How do random assignment and random sampling differ? What variance belongs to a paired comparison? Do many copied rows or many training seeds automatically supply new population subjects?
:::
::: answer
Assignment governs comparison validity within the design; sampling governs population representation. Paired inference uses the distribution of within-unit differences and cross-unit independence. Copied rows add no subjects, and seeds measure a different variation source from population sampling.
:::

## Bootstrap and permutation have different contracts {#s4}

The nonparametric bootstrap approximates an estimator's sampling variation by resampling observations with replacement from their empirical distribution and recomputing the entire estimator. For an IID mean, a resample has the original size n and samples row indices independently. Bootstrap replications are conditionally generated numerical experiments, not new population data. Increasing their count reduces simulation noise in the approximation but cannot supply missing rare events, repair a biased original sample or make an invalid independent-unit assumption correct.

A percentile interval takes empirical bootstrap quantiles, for example .025 and .975. It can be useful under suitable regularity and adequate data, but is not an automatic exact confidence interval. Bias, boundaries, discreteness and nonsmooth estimators can give poor coverage. A one-observation empirical distribution generates identical bootstrap means, even though the population may be variable. For independent paired data resample whole pairs or differences; for clusters resample appropriate independent clusters, with careful treatment of unequal sizes and the intended estimand. Time series need dependence-aware methods beyond an IID row bootstrap.

Permutation testing instead builds a null reference distribution by transformations that leave the data law invariant under the null or by assignments allowed by a randomised design. In the two-group IID setting, equal full distributions give label exchangeability conditional on pooled observations. Equal means alone do not guarantee this when the groups have different variances or shapes. In a randomised experiment, a sharp null of no unit-level effect permits testing using the known assignment design. Preserve group sizes, pairing and any assignment restrictions during transformations.

::: worked title="Exact small-group enumeration needs exchangeability"
Group A=(2,3,4,5), B=(0,1,2,3) has observed mean difference 2. There are binom(8,4)=70 labelled-index allocations of four observations to A. Ten have absolute difference at least 2, so the exact inclusive two-sided permutation p-value is 10/70=1/7. Repeated equal numerical values remain distinct sampled indices. The result needs label exchangeability or an appropriate sharp-null randomisation design; a mere equal-means assertion is insufficient.
:::

Lab 1 also bootstraps these groups independently and reports a finite percentile interval. It uses the same observed data for a different purpose: approximate estimator variation rather than the exchangeable null tail. A bootstrap distribution centred near the observed effect is not interchangeable with the permutation null distribution. Explain which distribution answers the intended question before reading a histogram, and do not decide which method to quote solely because it yields a preferred significance label.

With Monte Carlo permutations, a common valid construction includes the original statistic and uses (b+1)/(B+1), where b is the number of sampled null transformations at least as extreme and B is the number sampled, under a justified exchangeable randomisation scheme. The plus-one construction avoids an unsupported zero p-value from finite sampling. Its exact validity depends on how transformations are sampled and whether the observed assignment joins the exchangeable set. Full enumeration, as here, instead uses exact extreme count divided by total allowed transformations.

All preprocessing that forms the estimator should be rerun within each bootstrap replicate when it is part of the resampled procedure. If a fitted transformation is held fixed instead, the interval targets a conditional procedure and omits its fitting variation. For a final trained model evaluated on independent subjects, resampling evaluation subjects can quantify evaluation sampling uncertainty conditional on that model; it does not automatically include variability from retraining or hyperparameter selection. State what is held fixed, mirroring the estimator/posterior distinctions in Module 25.

::: check
Does more bootstrap replication create population information? When is unrestricted two-group permutation valid? Why are paired data resampled as pairs rather than separately?
:::
::: answer
Replication improves numerical approximation only. Labels need a null-invariant exchangeable distribution or the permitted sharp-null assignment design. Resampling whole pairs preserves their within-unit relationship and the intended difference estimator.
:::

## Regression likelihoods residuals and prediction {#s5}

$$\mathcal L(\beta)=\sum_{i=1}^n\left[\log(1+e^{x_i^\top\beta})-y_i x_i^\top\beta\right],\qquad \nabla\mathcal L=X^\top\left(s(X\beta)-y\right).$$

For fixed design matrix X with n rows and d columns, linear regression writes y=Xβ+ε. Under independent homoscedastic Gaussian errors of known variance σ², negative log-likelihood is a constant plus ||y−Xβ||²/(2σ²). Thus least squares is an MLE. If X has full column rank, the normal equation is XᵀX β_hat=Xᵀy and the coefficient is unique; practical computation should use a suitable solve or QR/SVD method, rather than explicitly invert the Gram matrix. Module 12 supplies the projection interpretation.

Conditional on fixed X, independent zero-mean errors with covariance σ²I give E[β_hat|X]=β and Cov(β_hat|X)=σ²(XᵀX)⁻¹. Derive it by substituting y=Xβ+ε into the coefficient rule and applying the linear covariance transformation. If n>d and rank is full, residual variance estimate ||y−Xβ_hat||²/(n−d) is unbiased under this model; the projection leaves n−d independent residual directions in expectation. Gaussianity additionally supports exact t-based coefficient intervals. Different error covariance requires an adjusted variance analysis, even when a least-squares coefficient still fits numerically.

An intercept column ensures residuals sum to zero in an exact unconstrained least-squares fit, while Xᵀr=0 checks its normal equations. Residuals themselves are generally correlated after fitting, so the observation-error independence assumption should not be incorrectly imposed on every fitted residual. Inspect residuals against fitted value, features, groups and time for mean-pattern, scale or dependence mismatches. Small training residuals alone do not establish correct noise assumptions, calibrated intervals or future prediction accuracy.

For a new fixed feature vector x₀, uncertainty of the fitted conditional mean is σ²x₀ᵀ(XᵀX)⁻¹x₀. Predicting a new independent noisy outcome adds σ², giving σ²[1+x₀ᵀ(XᵀX)⁻¹x₀]. A mean-response interval and an outcome-prediction interval therefore differ even at the same input. Extrapolation outside the observed feature range can magnify uncertainty and model misspecification; a linear formula is not evidence that the true response stays linear there. An association coefficient remains a prediction-model quantity unless causal assumptions separately justify intervention language.

For binary responses, logistic regression specifies P(Y_i=1|x_i)=s(z_i), z_i=x_iᵀβ, with s(z)=1/(1+exp(−z)). Conditional-independent Bernoulli likelihood gives negative log-likelihood Σ[log(1+exp z_i)−y_i z_i]. Differentiating yields Xᵀ(s(Xβ)−y), and Hessian XᵀWX with W_ii=s_i(1−s_i)≥0, so the objective is convex. Perfect separation can prevent a finite unpenalised maximum; convexity alone does not guarantee attainment. Stable softplus/log-domain arithmetic avoids overflowing large logits.

::: worked title="A probability fit uses Bernoulli log loss rather than squared residual assumptions"
For one positive label with logit z=log 3, s(z)=3/4. Its negative log-likelihood is −log(3/4)=log(4/3), and derivative with respect to z is −1/4. A negative label at the same logit has loss log 4 and derivative 3/4. Summing these independent contributions yields the logistic objective; changing labels, conditioning or independence changes the model.
:::

Lab 2 fits fixed synthetic linear and logistic models on training data and reports held-out squared error, log loss, Brier score and coarse calibration bins. Calibration asks whether observed frequencies match predictions across an appropriate population, not merely whether classification accuracy is high. Small bins are noisy; a finite reliability table cannot prove exact calibration. No coefficient uncertainty formula should be transferred from homoscedastic linear Gaussian regression to logistic regression without its own derivation and conditions.

::: figure #fig-26-3
Gaussian response likelihood yields squared residuals; Bernoulli response likelihood yields logistic log loss. Fitted mean uncertainty and future-outcome uncertainty are different targets.
:::

::: check
What model gives least squares as MLE? Why is a prediction interval wider than a mean interval under independent noise? Does convex logistic loss ensure a finite unpenalised optimum?
:::
::: answer
Independent common-variance Gaussian errors conditional on the design. A new outcome adds its own noise variance. Separation can send coefficients toward infinity, so a convex objective need not attain its infimum at finite coefficients.
:::

## Splits selection and simultaneous inference {#s6}

Training data fit parameters. Validation data guide model, penalty and stopping choices. A final test estimates performance of the selected procedure on an independent target sample, with all choices frozen before inspection. Reusing test outcomes to tune converts that sample into selection data. Renaming a file or computing a standard error afterwards does not undo dependence between selected choices and its outcomes. A clean final evaluation requires an untouched sample or a justified selection-aware procedure.

Preprocessing belongs inside this separation. Estimate standardisation, imputation, feature selection and learned transformations from the training portion of each split, then apply them to validation/test. Using test outcomes in feature selection leaks the answer directly; using its features in fitted preprocessing can also change the claimed inductive protocol. Some transductive settings intentionally use unlabelled target inputs, but that is a different specified task. Cross-validation must keep group or temporal structure intact and refit preprocessing in each training fold.

Cross-validation averages held-out fold results to support a model-selection estimate, but folds share training data, so fold scores are generally dependent. Their empirical standard deviation divided by √number_of_folds is not automatically a valid independent-replicate standard error. Nested cross-validation separates inner tuning from outer evaluation when that whole selected pipeline is the target. Its interpretation still depends on the population, unit and split mechanism; more folds do not remove distribution shift or leaked subject identity.

::: worked title="Choosing the best noisy validation score creates optimism"
Fifty synthetic candidates each have true accuracy .5. With 100 independent validation outcomes per candidate, Lab 3 chooses one whose observed validation accuracy is .63; a fresh 2000-outcome test gives .4935. The selected high value partly reflects selection noise. This particular trace is illustrative, while the mathematical issue is that maximising noisy estimates changes the sampling distribution of the reported score.
:::

For m prespecified valid level-α/m tests, a union bound controls the probability of at least one false rejection at α. This Bonferroni guarantee does not require independent test outcomes. It does require each p-value or test to be valid for its own null, and an appropriately covered family. With m=20 and overall α=.05, each threshold is .0025. Unrecorded adaptive searches, outcome switching or repeated optional stopping are not automatically covered by a fixed-family statement. Other multiplicity goals such as false discovery rate are different quantities and require different procedures.

A confidence analogue builds each of m valid intervals with failure at most α/m, so all cover simultaneously with probability at least 1−α. For bounded means the corresponding radius uses log(2m/α), as derived in Module 24. A wide conservative bound is a valid sufficient statement rather than an exact practical requirement. Preserve the distinction between a fixed model's held-out accuracy, a selected model's validation result and a simultaneous statement over a declared family. Module 30 develops the finite-class learning bound from this same logic.

::: figure #fig-26-4
Training, validation and final test serve different decisions. Fit transformations within training folds, freeze the selected pipeline, and report the final effect and uncertainty on an untouched target sample.
:::

An experimental report should include the question, estimand, independent units, sampling/assignment design, fixed primary analysis, exclusions, multiplicity plan, effect estimate, interval/test interpretation and limitations. Include numerical reproducibility without implying a seed guarantees population validity. Observational association, statistical significance, calibrated prediction and causal effect are distinct conclusions. A clear report states exactly which was established and which assumptions its evidence actually supports.

::: check
Why does test-based tuning invalidate an untouched-test claim? Is fold independence guaranteed? What does Bonferroni need beyond its arithmetic threshold?
:::
::: answer
The selected pipeline becomes dependent on the test outcomes. Shared training data generally make fold scores dependent. Bonferroni needs individually valid tests and a covered family; it cannot fix wrong sampling units or an unlisted adaptive search.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| A 95% confidence interval assigns .95 probability to this fixed parameter. | Coverage describes repeated interval construction. |
| Every nominal Wald interval has exact coverage. | Rare-event plug-in intervals can fail badly. |
| A p-value is the chance H₀ is true. | It is a qualified null sampling tail. |
| Nonrejection proves equality. | Power and equivalence targets require separate reasoning. |
| More bootstrap samples create more subjects. | They reduce simulation noise only. |
| Equal means justify all label permutations. | Full exchangeability or an assignment null is needed. |
| A regression coefficient automatically shows a cause. | Causal interpretation requires design and assumptions. |
| Cross-validation fold scores are independent observations. | Their training sets overlap. |
| A final test can guide stopping and remain untouched. | Using outcomes for selection changes its role. |

## Three reproducible labs {#labs}

### Lab 1 · Bootstrap and exact permutation {#lab1}

{{LAB:lab1}}

Enumerate the 70 assignments, including repeated-valued but distinct indices. Compare the null distribution with the bootstrap estimator distribution and state each method's assumptions.

### Lab 2 · Regression residuals and probability calibration {#lab2}

{{LAB:lab2}}

Derive both objectives and gradients first. Inspect the normal equation residual, specify the coefficient-SE assumptions and interpret noisy held-out calibration bins without claiming exact calibration.

### Lab 3 · Coverage selection and independent units {#lab3}

{{LAB:lab3}}

Explain the rare-rate coverage collapse, optimistic selection and copied-row SE. A printed coverage rounded to 1.000000 is a numerical display, not a claim that the procedure never misses.

## Fourteen exercises with full solutions {#exercises}

Exercises 1–12 are required; optional Exercises 13–14 add 35 minutes beyond the twelve-hour schedule.

::: exercise #e1 level=1 kind=calculation minutes=7
Known σ=2, n=100, observed mean 5: construct the exact Gaussian 95% interval and interpret it.
:::
::: solution
Half-width 1.959964·2/10≈.391993, interval [4.608007,5.391993]. Under IID Gaussian known variance the procedure has .95 coverage, not posterior probability .95 for a fixed μ.
:::

::: exercise #e2 level=1 kind=calculation minutes=7
Give a Hoeffding 95% interval for 100 IID Bernoulli trials with no success. Contrast the plug-in Wald interval.
:::
::: solution
Radius √(log40/200)≈.135810; intersect [−r,r] with [0,1] to get [0,.135810]. Wald has zero radius and interval {0}, which can miss a positive rare rate with high probability.
:::

::: exercise #e3 level=1 kind=calculation minutes=7
Twenty prespecified tests need familywise error≤.05. Give the Bonferroni threshold and its independence requirement.
:::
::: solution
Each valid test uses .05/20=.0025. A union bound gives family error≤.05 without requiring cross-test independence, but individual validity and the covered family are necessary.
:::

::: exercise #e4 level=1 kind=calculation minutes=7
For positive and negative labels at z=log3, calculate logistic losses and derivatives.
:::
::: solution
s=3/4. Positive loss log(4/3), derivative s−1=−1/4; negative loss log4, derivative s=3/4. These follow from softplus(z)−yz.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Prove confidence coverage by inverting the known-σ Gaussian mean event; derive the bounded Hoeffding alternative.
:::
::: solution
The pivot √n(x_bar−μ)/σ is standard Gaussian, so its absolute quantile event has probability 1−α. Rearrangement puts μ in the stated interval. Hoeffding gives failure outside radius √[log(2/α)/(2n)] at most α. Intersecting with [0,1] preserves any admissible true mean. Conditions differ: exact Gaussian known σ versus independent bounded observations.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Derive paired difference variance and the shared-difficulty example with variances 9,1,1.
:::
::: solution
Expand Var(A−B)=VarA+VarB−2Cov(A,B). Each marginal variance is 10, Cov=9, giving difference variance 2. Independent subjects give mean variance 2/n and SE √(2/n). Ignoring pairing gives the independent reference 20/n, a different design.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Derive logistic negative log-likelihood, gradient and PSD Hessian under conditional-independent labels.
:::
::: solution
Bernoulli logL=Σ[y log s+(1−y)log(1−s)]; sigmoid identities give loss Σ[log(1+exp z)−yz]. Chain rule gives Xᵀ(s−y). Second derivative is XᵀWX with nonnegative weights, so vᵀHv=Σw_i(x_iᵀv)²≥0. Convexity does not guarantee a finite optimum under separation.
:::

::: exercise #e8 level=2 kind=application minutes=12
Enumerate the two-group four/four example's permutation p-value, stating the null and tie rule.
:::
::: solution
There are 70 allowed labelled-index splits. Ten have |meanA−meanB|≥2, including ties, giving 1/7. It needs equal full group distributions with exchangeability, or the appropriate random-assignment sharp null. Equal means with arbitrary unequal variances do not justify this enumeration.
:::

::: exercise #e9 level=2 kind=application minutes=12
Write a paired model-evaluation protocol for 100 independently sampled subjects, each with ten correlated variants.
:::
::: solution
Fix the two models and primary subject-level aggregate before evaluation, keep each subject's variants together, compare model aggregates within subjects, and analyse the 100 independent differences. Resample subjects/pairs rather than individual variants. State the target population and whether uncertainty is conditional on fixed trained models; separate retraining-seed variation if claimed.
:::

::: exercise #e10 level=2 kind=application minutes=12
Derive fitted-mean versus new-outcome variance at fixed x₀ under the full-rank homoscedastic linear model.
:::
::: solution
Cov β_hat=σ²(XᵀX)⁻¹ gives mean variance σ²x₀ᵀ(XᵀX)⁻¹x₀. An independent new error adds σ², yielding σ²[1+x₀ᵀ(XᵀX)⁻¹x₀]. A mean interval cannot be relabelled as an outcome prediction interval.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=12
A pipeline standardises all data before cross-validation and chooses stopping from the final test score. Repair it.
:::
::: solution
Fit standardisation within each training fold and apply it unchanged to its held-out portion. Select stopping and other choices using validation or inner folds. Freeze the pipeline before an independent final test; outcomes already used for selection cannot be called untouched evaluation.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=12
A bootstrap resamples each copied row, a p-value is called P(H₀|data), and nonrejection is called proof of equality. Repair all three.
:::
::: solution
Resample the actual independent subjects or clusters and define their estimator. A p-value is an appropriately qualified null-tail probability; posterior null probability needs prior/alternative modelling. Nonrejection can mean low power; equality or equivalence needs a meaningful margin and a designed procedure.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Derive the stated known-σ one-sided Gaussian power function and explain how quadrupling n changes its signal term.
:::
::: solution
Reject above μ₀+z_(1−α)σ/√n. Under μ=μ₀+Δ, standardise relative to this alternative mean to obtain power 1−Φ(z_(1−α)−Δ√n/σ). The signal term doubles when n quadruples. Prospective Δ and the sampling model must be specified; post-hoc observed effects do not replace planning.
:::

::: exercise #e14 level=3 kind=extension minutes=20
Construct simultaneous confidence intervals for m bounded means using a union allocation, and explain why unrecorded adaptive model searches need more analysis.
:::
::: solution
Give each interval failure≤α/m. Hoeffding radius √[log(2m/α)/(2n)] and the union bound yield simultaneous coverage≥1−α. Cross-interval independence is unnecessary. The family must be specified or otherwise validly covered; unlimited data-dependent searches introduce additional events outside this fixed-list guarantee.
:::

## Ten-question self-check {#quiz}

```quiz
? What does confidence coverage refer to?
- [x] Repeated use of the data-dependent interval procedure at fixed parameter
- [ ] Posterior probability without a prior
- [ ] The colour of one interval
> The random endpoints are the sampling object; the parameter is fixed in this interpretation.

? A zero-success Wald interval collapses. What follows?
- [ ] The true rate must be zero
- [x] The approximation can have poor rare-event coverage
- [ ] Clipping automatically gives exact coverage
> Positive rare rates can produce zero successes with high probability.

? A p-value is which quantity?
- [ ] P(H₀|data) automatically
- [ ] The probability of the exact observed dataset
- [x] A specified null-tail probability with validity assumptions
> The statistic, extremeness, null and sampling design must be stated.

? What does nonrejection establish about equality?
- [x] It does not establish equality; power and equivalence questions differ
- [ ] Exact equality always
- [ ] That every effect is practically irrelevant
> A low-powered experiment can fail to detect a meaningful difference.

? What is resampled in an IID paired comparison?
- [ ] Separate rows from each method with pairing discarded
- [x] Whole independent pairs or their differences
- [ ] A new population is created
> Preserve the within-unit dependence while representing cross-unit sampling.

? Equal means with unequal group distributions justify unrestricted label permutation?
- [ ] Always
- [ ] If the histogram is smooth
- [x] No, the stated test needs exchangeability or a valid assignment null
> Equal means alone do not imply null-invariant relabelling.

? Which regression quantity adds new observation noise?
- [x] New-outcome prediction variance
- [ ] Fitted-mean variance alone
- [ ] The optimiser's iteration count
> Predicting an independent outcome includes its own σ² in addition to mean-fit uncertainty.

? Can final test outcomes tune stopping while remaining untouched evaluation?
- [ ] Yes if the seed is fixed
- [x] No, that makes them selection data
- [ ] Yes if enough decimals are reported
> Selection creates dependence between the pipeline and those outcomes.

? Bonferroni familywise control needs what?
- [ ] Independent test outcomes in every case
- [ ] Only arithmetic division by m
- [x] Individually valid tests and a covered family
> The union bound needs no cross-test independence, but cannot repair invalid individual models.
```

<div class="free-response" data-free-response data-key="math-series:m26:q10">
<label for="q10-response">10. Write a protocol comparing two fixed models on independent subjects with repeated variants. Specify the estimand, pairing, split/resampling units, effect and uncertainty analysis, null-tail interpretation and multiplicity plan. Explain why a small p-value, nonrejection or observational regression alone does not establish a causal or practical conclusion.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State the target, design, independent units, primary analysis and interpretation before results."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I separated coverage, null tails, effect size, selection and causal assumptions.</label>
</div>

::: answer
Freeze model choices using training/validation, sample target subjects independently, aggregate variants per subject and compare paired differences. Use subject-level uncertainty/resampling and keep groups intact. Predefine the primary estimand, test direction and any covered multiplicity family; report the effect in meaningful units and the interval's sampling interpretation. A p-value is a valid null tail, nonrejection may reflect low power, and causal claims require an assignment/design argument beyond observational regression.
:::

## Reading with a purpose {#reading}

Use [MIT's classical inference lesson](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iv/lecture-24/) and the authors' [Introduction to Statistical Learning](https://www.statlearning.com/), chapters on regression, resampling and multiple testing. The exact elementary coverage, paired variance and logistic derivatives are derived in this lesson.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | Inference: which repeated experiment defines coverage or a null tail? |
| Session 4 · 20 minutes | Resampling and model selection: what units and fitting decisions must remain inside each split? |

## Retrieval exit task and next step {#summary}

Invert a sampling event into a confidence interval, define a valid null tail, derive paired variance and regression objectives, and write a split-safe comparison protocol. Explain each resampling contract and which causal conclusions it cannot supply.

**Exit task:** repair a rare-event Wald certainty claim, a copied-row benchmark and a test-tuned stopping rule. Report an effect, a qualified uncertainty procedure and the actual independent count before interpreting significance.

**Ready to move on:** you can defend a statistical evaluation procedure and its limits. Information theory next connects probability models, coding and log-loss objectives. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| C(X) / coverage | Random confidence set / sampling inclusion probability | 置信集、覆盖率 |
| H₀ / α / power | Null / Type I bound / alternative rejection probability | 原假设、显著性水平、功效 |
| Estimand / effect | Target quantity / difference in meaningful units | 目标量、效应 |
| Pair / cluster | Matched unit / dependent group | 配对、簇 |
| Bootstrap / permutation | Empirical resampling / null-invariant transformation | 自助法、置换 |
| β / residual | Regression coefficient / fitted error | 回归系数、残差 |
| Calibration / prediction | Frequency agreement / future outcome modelling | 校准、预测 |
| Validation / final test | Selection sample / frozen-pipeline evaluation | 验证、最终测试 |
