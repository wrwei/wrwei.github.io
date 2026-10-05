## An estimate is a decision under a statistical model {#start}

Fitting a parameter requires more than finding a large number on a curve. We must say which data mechanism the curve represents, which quantities are unknown, and what loss or uncertainty interpretation accompanies the reported result. This module derives Bernoulli and Gaussian maximum likelihood, separates bias from variance, performs a fully normalised beta–Bernoulli update, and traces regularisation coefficients back to noise and prior assumptions. A likelihood, a sampling distribution and a posterior are three different mathematical objects.

**Retrieval check:** use [Module 16](module_16_EN.html#s1) for derivatives, [Module 17](module_17_EN.html#s1) for densities and integrals, [Module 23](module_23_EN.html#s1) for moments, and [Module 24](module_24_EN.html#s1) for sampling limits. All labs use only the Python standard library. The continuous parameter and Gaussian examples make calculus prerequisites explicit even when the observed data are discrete.

## Models parameters estimators and identifiability {#s1}

A statistical model is a collection of possible probability laws P_θ indexed by a parameter θ in a stated parameter space Θ. The data are generated under one of these laws if the model is correctly specified. For Bernoulli observations, Θ=[0,1] and θ=p is a success rate. For a Gaussian location model with known positive variance, Θ is the real line and θ=μ. If the variance is also unknown, the parameter is a pair (μ,σ²) with σ²>0, and factors that were constant in μ may now depend on the parameter.

In a frequentist sampling analysis θ is fixed but unknown, while the sample and any statistic computed from it are random. An estimator T(X₁,…,X_n) is a specified rule before data are observed. Its realised numerical output t is an estimate. The estimator has a sampling distribution indexed by θ; the estimate is one outcome. Confusing these levels turns a calculation such as E_θ[T]=θ into a claim that every observed estimate equals the truth, which unbiasedness never says.

In Bayesian analysis a prior distribution is assigned to the unknown parameter and updated by observed data through a joint model. Conditional on the parameter, the observations may be independent; after integrating over a common uncertain parameter, they can become dependent. State which conditioning level an independence assertion concerns. A Bayesian posterior mean is still a data-dependent estimator and can be assessed by frequentist sampling risk at each fixed θ, without equating that risk with a posterior probability statement.

Identifiability means different parameter values imply different observable laws. If P_θ=P_θ′ while θ≠θ′, no number of observations from that law can identify which label was used without extra restrictions. Consider X distributed as Gaussian with known variance and mean θ² for θ in the real line. Values θ and −θ give identical laws, so the signed θ is unidentifiable. Restricting Θ to nonnegative values makes the mean-to-parameter map injective, though uncertainty near zero still requires care.

::: worked title="The model can identify a magnitude without a sign"
In X∼N(θ²,1), data that favour a mean near 4 give equal likelihood at θ=2 and θ=−2. A numerical optimiser selecting one root does not create evidence for its sign. On Θ=[0,∞), only the nonnegative root remains admissible. Model identifiability and optimiser uniqueness are related questions but neither follows merely from a program returning one number.
:::

The sampling scheme is part of the model. IID Bernoulli likelihood assumes a common rate and conditional independence of the recorded trials. Duplicated rows or changing rates do not obey that product likelihood merely because each row contains zero or one. Selection depending on unobserved outcomes can also alter the likelihood of the observed sample. If a model is an approximation to reality, its fitted parameter may describe the best fit within that approximation rather than a literal population mechanism. Later regression lessons assess residual and calibration evidence for such mismatches.

A useful estimation report specifies the observable variables, sample unit, parameter space, dependence assumptions, estimator rule and target. These statements decide whether a boundary is admissible, whether a derivative equation suffices, and which expectation defines bias. A parameter value outside its space is invalid even if an unconstrained optimisation formula returns it. Conversely a legal boundary optimum must not be discarded just because no interior derivative is zero there.

::: figure #fig-25-1
Parameter, data, estimator rule and realised estimate occupy different places in the model. A sampling distribution repeats data at fixed parameter; a posterior conditions on the observed data under a prior.
:::

::: check
What is the difference between an estimator and an estimate? Can an optimiser determine the sign of θ from a θ²-only model? At what level are observations independent in a Bayesian IID model?
:::
::: answer
An estimator is a rule applied to random data; an estimate is its realised output. Equal laws for ±θ prevent sign identification. Bayesian IID observations are independent conditional on the common parameter, while marginal independence need not hold after averaging over it.
:::

## Likelihood changes the argument held fixed {#s2}

For observed data x, likelihood is L(θ;x)=p_θ(x), using a mass function for discrete observations or a density with respect to a common reference measure for continuous observations. The numerical expression may be the same as a probability-model expression, but likelihood fixes x and varies θ. A probability law instead fixes θ and sums or integrates over possible x. A likelihood does not automatically integrate to one over Θ, and normalising it over a parameter coordinate is itself an extra modelling choice.

For conditionally independent observations, L(θ;x)=∏p_θ(x_i). The log-likelihood ℓ=Σlog p_θ(x_i) has the same maximisers whenever the likelihood is positive because log is strictly increasing. Impossible observations at a parameter value give L=0 and ℓ=−∞. Logarithms transform products to sums and prevent many underflow failures, but do not repair a wrong independence assumption. Use the extended-value boundary convention explicitly rather than evaluate expressions such as zero times log zero as an accidental floating-point NaN.

For an ordered Bernoulli sample with k successes and n−k failures, L(p)=p^k(1−p)^(n−k). Observing only the count K=k gives the binomial likelihood binom(n,k)p^k(1−p)^(n−k). The combinatorial factor is constant in p for fixed n,k, so both have the same p maximiser and posterior shape under the same prior. Their data probabilities differ because the two observations describe different events. A factor can cancel in one parameter-fitting task and still matter when computing probabilities or comparing other models.

Dropping constants is legitimate only after naming the argument being optimised or normalised. In a Gaussian mean fit with known σ, the prefactor is constant in μ. If σ is unknown, the term σ^(−n) is parameter-dependent and cannot be discarded. In a posterior update, a factor independent of θ cancels between numerator and evidence, but the posterior must still have a valid normalising integral. In model comparison, factors depending on the competing model can change the result even if each was irrelevant to its own within-model optimiser.

::: worked title="A common numerical scale preserves relative likelihood"
For n=10000, k=8000, the raw ordered likelihoods at p=.79 and p=.8 both underflow to zero in ordinary floating-point arithmetic. Their log-likelihoods are about −5007.074 and −5004.024. Subtract the larger log value before exponentiating: L(.79)/L(.8)≈exp(−3.04993)=.047362. Two stored zeros do not establish equal fits; the relative-log calculation retains meaningful comparison.
:::

For a finite candidate list, relative weights can be computed with log-sum-exp: log Σ exp a_j = m+log Σ exp(a_j−m), where m=max a_j is finite. This stabilises arithmetic. Turning those weights into a posterior over candidates still requires prior masses and a specified candidate model; the numerical normalisation alone does not supply a prior interpretation. Continuous evidence is an integral, so a sum over an arbitrary grid additionally needs quadrature weights and a justified approximation.

Likelihood values for continuous data are densities, not probabilities of observing an exact real-valued point. Densities can exceed one and change numerical units under transformations of observations. An invertible data transformation contributes its appropriate Jacobian; if that Jacobian is independent of θ, relative fitting is preserved. Transforming a parameter is a different operation: a likelihood is composed with the coordinate map, whereas a prior or posterior density transforms with a Jacobian. Section 6 uses this distinction to explain why continuous MAP modes depend on coordinates.

::: check
What is held fixed in a likelihood? When may the binomial count factor be omitted? Why does log-domain computation not validate copied observations as IID?
:::
::: answer
Observed data are fixed and the parameter varies. The count factor can be omitted for p fitting or its posterior shape with fixed n,k, but not for the count probability itself. A numerical transformation preserves the supplied model; it does not remove dependence in the data.
:::

## Deriving maximum likelihood including boundary cases {#s3}

$$\ell(p)=k\log p+(n-k)\log(1-p),\qquad \widehat p_{\mathrm{MLE}}=\frac{k}{n}\quad(n>0,\ p\in[0,1]).$$

For Bernoulli data with 0<k<n, ℓ(p)=k log p+(n−k)log(1−p) on 0<p<1. Its derivative is k/p−(n−k)/(1−p). Setting this to zero gives k(1−p)=(n−k)p and p_hat=k/n. The second derivative is −k/p²−(n−k)/(1−p)²<0, establishing strict concavity and the unique interior maximum. Both boundaries give zero likelihood when both outcomes occur. A complete maximisation argument therefore checks curvature and admissible boundaries, rather than treating any derivative root as sufficient.

When k=0 and n>0, L(p)=(1−p)^n is maximised at p=0 on [0,1]; when k=n it is maximised at p=1. On an open parameter space (0,1), these data instead have a supremum approached at a missing endpoint and no maximiser. With no data, n=0, every parameter has likelihood one and the data supply no unique estimate. The parameter-space choice changes whether a maximum exists, even though the algebraic likelihood expression is unchanged.

::: worked title="A legal boundary optimum need not solve an interior score equation"
Ten failures give Bernoulli MLE p_hat=0 on [0,1]. Under a Beta(2,2) prior the posterior is Beta(2,12), its mean is 1/7 and its density mode is 1/12. These are different summaries with different objectives. None proves that future success is impossible merely because no success was observed.
:::

For IID Gaussian observations with known variance σ²>0, the full log-likelihood is −n log(√(2π)σ)−Σ(x_i−μ)²/(2σ²). Maximising over μ minimises the residual sum of squares. Expand around x_bar: Σ(x_i−μ)²=Σ(x_i−x_bar)²+n(μ−x_bar)², because the centred residuals sum to zero. The second term is nonnegative and vanishes only at μ=x_bar for n>0. This identity proves the mean MLE globally, with derivative n(x_bar−μ)/σ² giving the same result.

If variance v=σ² is also unknown and the centred residual sum R is positive, substitute μ=x_bar and maximise −(n/2)log v−R/(2v) plus constants. The derivative is −n/(2v)+R/(2v²), hence v_hat=R/n. The log-likelihood increases below R/n and decreases above it, and tends to −∞ at both variance extremes, so this is the global maximum. The MLE denominator is n; an unbiased variance estimator uses n−1 for a different purpose, derived next.

::: figure #fig-25-2
An interior Bernoulli optimum, an all-failure boundary optimum, and Gaussian mean fitting show why parameter spaces, curvature and normalising factors belong in an MLE derivation.
:::

If all Gaussian observations are identical, R=0. Setting μ equal to that value and letting v tend to zero makes the likelihood unbounded above on v>0. There is no finite positive-variance MLE, and substituting v_hat=0 would leave the stated parameter space. A numerical variance floor changes the optimisation problem; it can be a practical model restriction but must be disclosed. Likewise a unique MLE in these elementary models does not justify claiming uniqueness or existence for every mixture, nonlinear or high-dimensional model.

Least squares emerges here from a Gaussian observation model. Other noise models give other objectives. IID Laplace location noise with known scale b>0 has likelihood proportional to exp(−Σ|x_i−μ|/b), so a sample median minimises absolute deviations. With an even number of observations an entire interval of medians may minimise that loss. Model choice, target and optimisation geometry therefore interact; selecting a loss is a statistical assumption as well as a computational choice.

::: check
Why is k/n the interior Bernoulli maximum? What changes at k=0? When does the joint Gaussian mean/variance MLE fail to exist?
:::
::: answer
The score vanishes there and strict log-concavity plus boundaries establish the maximum. At k=0 the maximum is the admissible endpoint zero, or only a supremum if endpoints are excluded. Identical Gaussian observations give R=0 and unbounded likelihood as positive variance tends to zero.
:::

## Bias variance mean squared error and consistency {#s4}

$$E_\theta[(T-\theta)^2]=\operatorname{Var}_\theta(T)+(E_\theta[T]-\theta)^2.$$

For an estimator T of a fixed scalar θ with finite second moment, bias is E_θ[T]−θ, variance is E_θ[(T−E_θT)²], and mean squared error is E_θ[(T−θ)²]. Write T−θ=(T−E_θT)+(E_θT−θ), square and take expectations. The cross term is zero, giving MSE_θ(T)=Var_θ(T)+Bias_θ(T)². These are repeated-sample properties at a stated parameter, not quantities determined by one realised absolute error. The subscript reminds us that a comparison can change with the true θ.

For IID Bernoulli data, T=K/n is unbiased and has variance p(1−p)/n. Its MSE equals that variance. For a fixed Beta(a,b) posterior mean T_B=(K+a)/(n+a+b), frequentist expectation is (np+a)/(n+a+b), so bias is [a−(a+b)p]/(n+a+b), while variance is np(1−p)/(n+a+b)². Shrinkage reduces this variance but introduces parameter-dependent bias. Whether total MSE improves follows from the full sum, not from the variance alone or the word “Bayesian.”

::: worked title="Shrinkage improves risk at one rate and worsens it at another"
At n=10, p=.3, Beta(2,2) mean bias is .8/14≈.057143, variance 2.1/196≈.010714 and MSE≈.013980, below the unbiased proportion's .021. At p=.95 the same rule has bias −1.8/14≈−.128571 and MSE≈.018954, above the proportion's .004750. Lab 2 checks both with repeated datasets and the exact formulas; one observed good fit would not establish a uniform risk improvement.
:::

For IID finite-variance X_i, let R=Σ(X_i−x_bar)². The identity R=Σ(X_i−μ)²−n(x_bar−μ)² follows by expanding squares. Expectations give E[R]=nσ²−n(σ²/n)=(n−1)σ². Thus S²=R/(n−1) is unbiased for n>1. The derivation uses a common mean, variance and zero independent covariances; treating correlated rows as independent can invalidate the denominator correction. Gaussianity is unnecessary for this expectation identity, although particular exact sampling distributions require it.

For x=(1,2,4), x_bar=7/3 and R=14/3, giving Gaussian variance MLE 14/9 and unbiased sample variance 7/3. The latter is larger by n/(n−1). “Unbiased” refers to estimating variance, not to its square root: taking a nonlinear square root generally changes bias. An n−1 correction also does not guarantee smaller MSE than every biased alternative. The criterion being optimised must be named before calling an estimator better.

Consistency means T_n converges in probability to θ as sample size grows. The Bernoulli proportion is consistent by Module 24's weak law. With fixed positive a,b, T_B−K/n=[a−(a+b)K/n]/(n+a+b) tends uniformly to zero because K/n stays in [0,1], so its posterior-mean rule is also consistent. Finite-sample bias and consistency can coexist. A fixed prior loses relative weight here; a prior strength increasing proportionally with n can preserve nonzero limiting shrinkage and need not give the same consistency result.

::: figure #fig-25-3
MSE splits into estimator variance and squared bias at a fixed target. A lower variance alone does not order total risk; shrinking toward a wrong centre can increase MSE.
:::

Unbiasedness alone also does not imply consistency: an estimator that always returns the first Bernoulli observation is unbiased for p but keeps variance p(1−p) as n grows. Conversely a small vanishing bias with vanishing variance gives consistency by a suitable squared-error bound. Do not transfer consistency or unbiasedness from a sample mean to arbitrary maximum-likelihood algorithms without a proof and model conditions. General MLE asymptotics involve identifiability, regularity and possible boundary complications beyond the elementary examples established here.

::: check
Derive the MSE decomposition. Is unbiasedness enough for consistency? Why do Gaussian variance MLE and unbiased variance have different denominators?
:::
::: answer
Centre T at its expectation; the cross term averages to zero. Returning the first observation stays unbiased but does not concentrate. MLE maximises a likelihood and gives R/n, while expectation correction gives R/(n−1); they optimise different criteria.
:::

Risk comparisons should also hold the data budget and estimator rule fixed. Selecting a rule after inspecting the same outcomes creates a new data-dependent estimator whose expectation is not automatically the formula for either original rule. Lab 2 specifies both rules and both synthetic rates before generating datasets; model selection protocols in the next lesson make that distinction operational.

## A normalised beta–Bernoulli posterior and predictive law {#s5}

$$\pi(p\mid x)=\frac{p^{a+k-1}(1-p)^{b+n-k-1}}{B(a+k,b+n-k)},\qquad 0<p<1.$$

A Beta(a,b) prior for 0<p<1 has density π(p)=p^(a−1)(1−p)^(b−1)/B(a,b), with a,b>0 and B(a,b)=∫_0^1 p^(a−1)(1−p)^(b−1)dp. The positive parameters make the endpoint singularities integrable if present. For positive integer a,b, repeated integration by parts yields B(a,b)=(a−1)!(b−1)!/(a+b−1)!. The prior is a distribution over the rate, not extra observed trials; its shape expresses a modelling choice made before the claimed evidence update.

Multiply the Bernoulli likelihood by the prior density. Powers add, giving p^(a+k−1)(1−p)^(b+n−k−1), whose integral is B(a+k,b+n−k). Bayes therefore yields the properly normalised Beta(a+k,b+n−k) posterior. For the ordered sample, evidence is B(a+k,b+n−k)/B(a,b); for the count it also includes binom(n,k). That data-constant factor cancels from the posterior, but remains in the probability of the observed count. Evidence must be positive and finite for this conditioning step.

Using the ratio B(A+1,B)/B(A,B) gives posterior mean A/(A+B). The second-moment ratio gives A(A+1)/[(A+B)(A+B+1)], so posterior variance is AB/[(A+B)²(A+B+1)], where A=a+k and B=b+n−k. This is conditional uncertainty over p after these data under the specified prior and model. It is different from the frequentist sampling variance of the rule (K+a)/(n+a+b), which averages over new datasets at fixed p.

::: worked title="Eight successes and two failures update a stated prior"
Beta(2,2) becomes Beta(10,4). Posterior mean is 10/14=5/7≈.714286; variance is 40/(196·15)=2/147≈.013605. The interior density mode is 9/12=.75, while Bernoulli MLE is .8. A numerical equal-tail 95% credible interval is about [.461868,.909080]. The three point summaries and the interval answer different questions, and all use the assumed IID common-rate model.
:::

For a future Bernoulli trial conditionally independent of the recorded trials given p, posterior predictive success probability is ∫p π(p|x)dp=E[p|x]=A/(A+B). This prediction integrates parameter uncertainty rather than plugging in a density mode. Future trials are conditionally independent given p but generally dependent under the posterior predictive mixture: their shared uncertain rate gives covariance Var(p|x)>0. Thus the multiple-future-trial count is not automatically binomial at the posterior mean; a beta-binomial mixture captures that additional variation.

An equal-tail 95% credible interval uses posterior CDF quantiles .025 and .975. It contains posterior probability .95 under the chosen prior and likelihood; endpoints in Lab 1 come from numerical inversion checked by CDF mass. This does not automatically guarantee 95% frequentist coverage at every fixed p. Module 26 distinguishes repeated-sampling confidence intervals. A uniform prior is uniform in a specific coordinate, and credible conclusions can be sensitive to prior or likelihood misspecification, especially with limited data.

The predictive distinction can be quantified for r future trials. Let S be their success count and m=A/(A+B). Conditional on p, its mean is rp and variance rp(1−p). Total variance therefore gives Var(S|x)=rE[p(1−p)|x]+r²Var(p|x). Since E[p(1−p)|x]=m(1−m)−Var(p|x), this becomes r m(1−m)+r(r−1)Var(p|x). The first term is the plug-in binomial variance; the second is nonnegative additional uncertainty from sharing an unknown rate. It vanishes for one future trial, explaining why the single predictive probability is simple even though the joint future law differs. Under Beta(10,4), ten future trials have mean 50/7 and variance 10(5/7)(2/7)+90(2/147), about 3.265306 rather than the plug-in 2.040816. This is a conditional prediction calculation, not variation of the posterior mean across newly sampled training datasets.

::: widget name=estimation
:::

The explorer uses integer prior parameters so its beta density and CDF can be computed transparently without an external statistical library. It plots relative likelihood in one panel and a normalised posterior density in the other, with separate labelled vertical scales. A relative-likelihood height of one is not a posterior probability. MLE, posterior mean, density mode and credible interval are labelled separately, including all-success, all-failure and uniform-posterior cases.

Sequential updating with genuinely new conditional-independent batches gives the same posterior as one combined update because their counts add. Updating with the same batch twice is different: it squares the likelihood and invents repeated evidence. For the eight/two data, reusing them after Beta(10,4) falsely produces Beta(18,6), not a justified refinement from new data. A prior estimated from the same data also requires a disclosure and analysis appropriate to that construction; it cannot silently be presented as fixed independent prior information.

::: check
What normalises the beta posterior? Which variance is conditional parameter uncertainty? Can the predictive rate be substituted into an independent binomial law for all future trials?
:::
::: answer
The updated beta integral B(A,B). Posterior variance is AB/[(A+B)²(A+B+1)], distinct from repeated-sample estimator variance. Future trials share uncertain p, so their posterior predictive joint law generally has dependence and extra count variation.
:::

## MAP loss models and the scale of regularisation {#s6}

Maximum a posteriori estimation chooses a mode of a posterior mass function or of a density in a stated continuous coordinate. For a density, maximising L(θ)π(θ) is equivalent to minimising negative log-likelihood plus negative log-prior, up to constants independent of θ. A density mode is not the point with positive posterior probability in a continuous model: individual points have probability zero. With multimodal or flat densities, a MAP summary can be nonunique and need not resemble a posterior mean or a useful predictive summary.

For Beta(A,B) with A,B>1, differentiate (A−1)log p+(B−1)log(1−p) to obtain mode (A−1)/(A+B−2). If A=1 and B>1, the maximum-density endpoint is zero in the continuous extension to [0,1]; if B=1 and A>1 it is one. For A=B=1 the density is uniform, so every point ties. With positive parameters below one, endpoint densities can diverge and require a careful mode convention. Our widget restricts integer shapes at least one to avoid hiding these singular cases.

Consider IID observations y_i∼N(μ,σ²) with known σ²>0 and prior μ∼N(0,τ²), τ²>0. Negative log posterior is Σ(y_i−μ)²/(2σ²)+μ²/(2τ²) plus a μ-constant. Multiplying by 2σ² gives Σ(y_i−μ)²+λμ² with λ=σ²/τ². Differentiation gives μ_MAP=n y_bar/(n+λ). If the data term is average squared error instead, the matching coefficient is λ/n. Changing sum to average while retaining the same penalty coefficient changes the prior-equivalent objective.

::: worked title="The penalty coefficient follows from both noise and prior scales"
Known noise variance 1, prior variance 4, n=4 and observed mean 3 give λ=.25 and μ_MAP=12/4.25≈2.823529. The sum-SSE coefficient is .25; the average-SSE coefficient is .0625. A factor-of-n mismatch produces a different amount of shrinkage. Nonzero prior mean m₀ replaces the penalty by λ(μ−m₀)² and pulls the estimate toward that centre.
:::

For a vector coefficient with independent zero-mean Gaussian prior components, the negative log prior is proportional to its squared Euclidean norm. Independent Laplace prior components instead produce an absolute-value penalty. This connection needs both the stated coefficient prior and observation model; a Gaussian noise likelihood supplies squared residuals, while Laplace noise supplies absolute residuals. Penalising an intercept, changing feature units or changing a noise scale also changes the probabilistic interpretation. Later regression and optimisation modules treat design matrices and constrained algorithms, but the scalar derivation already fixes the coefficient convention.

::: figure #fig-25-4
Gaussian observation noise supplies squared residuals; a Gaussian coefficient prior supplies a squared penalty. Their variances determine the coefficient, and changing a sum objective to an average changes its scale.
:::

Continuous MAP depends on parameter coordinates. If p has Beta(A,B) posterior and η=log[p/(1−p)], the η-density includes the Jacobian dp/dη=p(1−p). Its shape as a function of p is therefore proportional to p^A(1−p)^B, with η-mode corresponding to p=A/(A+B), whereas the p-density mode is (A−1)/(A+B−2) when interior. The posterior distribution and properly transformed event probabilities remain consistent; density heights and their mode are coordinate-dependent. A prior should not be called neutral solely because it is flat in one convenient coordinate.

MAP regularisation is a modelling interpretation, not a guarantee of calibrated uncertainty or generalisation. A point optimiser discards much of the posterior, and a penalty tuned from validation outcomes must be described with that selection protocol. If σ is fitted too, its normalising term must return to the objective. If the prior depends on θ through an unknown hyperparameter, its normalisation can matter for fitting that hyperparameter. Keeping only familiar squared or absolute terms without checking which arguments vary can silently change the intended model.

::: check
Why does a Gaussian prior produce a squared penalty? What changes when residual SSE is averaged? Is a continuous MAP mode invariant under a nonlinear coordinate transformation?
:::
::: answer
Its negative log density is a constant plus μ²/(2τ²); combine it with the noise likelihood. Averaging the data term divides the matching coefficient by n. A transformed density has a Jacobian, so its mode can move even though event probabilities transform consistently.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| A likelihood is already a probability distribution over parameters. | Its argument varies differently; a posterior needs a prior and normalisation. |
| Every MLE solves an interior derivative equation. | Boundaries, missing endpoints and unbounded likelihoods need checking. |
| A density value is an exact-point probability. | Continuous point probabilities are zero. |
| Unbiased means every realised estimate is correct. | It is a repeated-sample expectation property. |
| Lower variance always means lower MSE. | Squared bias contributes too. |
| A prior is an extra observed dataset. | It is a stated parameter model, and reused data are not new evidence. |
| A credible interval automatically has its nominal fixed-parameter coverage. | Posterior probability and repeated-sampling coverage differ. |
| Penalty scale survives changing sums to averages. | The matching coefficient changes by n. |

## Three reproducible labs {#labs}

### Lab 1 · Likelihood and a normalised beta update {#lab1}

{{LAB:lab1}}

Derive the three Bernoulli summaries before running. Check the interval's posterior mass, then explain the two Gaussian variance denominators and the all-failure boundary.

### Lab 2 · Repeated-sample bias variance and MSE {#lab2}

{{LAB:lab2}}

Compute both exact risks at both rates. The finite simulation estimates those risks; it cannot establish a universal ordering. Explain why the posterior mean is also a frequentist estimator rule.

### Lab 3 · Numerical and modelling repairs {#lab3}

{{LAB:lab3}}

Repair raw-product underflow, the omitted scale normalisation, reused evidence and the sum/average penalty coefficient. Name which parameter-dependent factors each optimisation needs.

## Fourteen exercises with full solutions {#exercises}

Exercises 1–12 are required. Optional Exercises 13–14 add 35 minutes beyond the twelve-hour schedule.

::: exercise #e1 level=1 kind=calculation minutes=7
For eight successes in ten trials, give Bernoulli MLE and the Beta(2,2) posterior mean, mode and variance.
:::
::: solution
MLE .8; posterior Beta(10,4), mean 5/7, mode 3/4, variance 40/(14²·15)=2/147. All three point values optimise or summarise different quantities.
:::

::: exercise #e2 level=1 kind=calculation minutes=7
For data (1,2,4), compute Gaussian mean MLE, variance MLE and unbiased variance.
:::
::: solution
Mean 7/3, residuals −4/3,−1/3,5/3, so R=42/9=14/3. Variance MLE R/3=14/9; unbiased variance R/2=7/3. Positive R ensures the positive-variance joint MLE exists.
:::

::: exercise #e3 level=1 kind=calculation minutes=7
Update Beta(2,2) after ten failures. Give MLE, posterior mean, mode and next-trial predictive success.
:::
::: solution
MLE zero on [0,1]; posterior Beta(2,12), mean and predictive 1/7, mode 1/12. No success does not prove a zero true rate.
:::

::: exercise #e4 level=1 kind=calculation minutes=7
Known noise variance 1, prior N(0,4), n=4 and y_bar=3: compute scalar MAP and matching sum/average coefficients.
:::
::: solution
λ=1/4; MAP=12/(4+1/4)=48/17≈2.823529. Sum-SSE coefficient .25; average-SSE coefficient .25/4=.0625.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Derive the Bernoulli MLE, including k=0, k=n and open versus closed parameter spaces.
:::
::: solution
For 0<k<n, score k/p−(n−k)/(1−p)=0 gives k/n. Negative second derivative establishes unique interior maximum, and boundaries have likelihood zero. For all failures or successes, the likelihood is monotone and maximised at 0 or 1 on [0,1]. Those endpoints are absent on (0,1), so only a supremum exists there. At n=0 all values tie.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Prove MSE=variance+bias² and the n−1 sample-variance expectation identity.
:::
::: solution
Expand T−θ around ET; the centred term has expectation zero, eliminating the cross term. For IID finite-variance data, R=Σ(X_i−μ)²−n(x_bar−μ)², so ER=nσ²−nσ²/n=(n−1)σ². Hence R/(n−1) is unbiased when n>1. Independence justifies the mean variance; Gaussianity is unnecessary for this identity.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Derive the normalised beta posterior and one future-trial predictive probability.
:::
::: solution
Multiplying likelihood and prior gives p^(a+k−1)(1−p)^(b+n−k−1). Its integral B(a+k,b+n−k) normalises Beta(A,B). Integrating future success p gives B(A+1,B)/B(A,B)=A/(A+B). Count-only evidence includes the combinatorial factor, which cancels from the posterior but not the count probability.
:::

::: exercise #e8 level=2 kind=application minutes=12
At n=10,p=.3 compare exact MSEs of K/n and (K+2)/14; repeat at p=.95.
:::
::: solution
MLE risks .021 and .00475. Shrinkage bias [2−4p]/14 and variance 10p(1−p)/196 give risks .013979592 and .018954082 respectively. Shrinkage wins at .3 and loses at .95; variance alone cannot establish risk ordering.
:::

::: exercise #e9 level=2 kind=application minutes=12
For Beta(10,4), calculate covariance between two future predictive indicators and explain why a fixed-rate binomial shortcut misses it.
:::
::: solution
Given p the indicators are independent, so E[Y₁Y₂|data]=E[p²|data]. Subtracting the squared predictive mean gives Var(p|data)=2/147>0. Their shared uncertain rate creates dependence; a binomial law at rate 5/7 would set this covariance to zero.
:::

::: exercise #e10 level=2 kind=application minutes=12
In X∼N(θ²,1), explain signed nonidentifiability and give a valid parameter restriction. Does a selected optimiser root resolve the original model?
:::
::: solution
θ and −θ imply identical observable laws. Restricting Θ to [0,∞) makes the mean map injective. Choosing one numerical root does not supply evidence for its sign in the original unrestricted model.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=12
Two very long Bernoulli products are both stored as zero, and an unknown Gaussian scale's prefactor was omitted. Repair both comparisons.
:::
::: solution
Use log-likelihood and subtract a finite common maximum before exponentiating relative values. Stored underflow zeros need not imply equal likelihoods. Gaussian scale fitting must retain −n log σ in addition to the residual/σ² term; it is constant only when σ is held fixed.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=12
The same eight/two dataset is used twice to update Beta(2,2), and its posterior interval is described as an automatic 95% confidence interval. Repair the evidence and interpretation.
:::
::: solution
One dataset yields Beta(10,4); multiplying its likelihood twice fabricates Beta(18,6). A 95% credible interval has conditional posterior mass .95 under the stated model/prior. Fixed-parameter repeated-sampling coverage is a different property and is not automatically established.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Prove consistency of the fixed Beta(a,b) posterior-mean rule from Bernoulli proportion consistency. Contrast returning only the first trial.
:::
::: solution
The difference from K/n is [a−(a+b)K/n]/(n+a+b), bounded by a constant divided by n+a+b, hence tends to zero. Combined with the proportion's probability convergence it gives consistency. The first-trial estimator stays unbiased but at interior p has nonvanishing Bernoulli variance and fixed positive deviation probability, so it is inconsistent.
:::

::: exercise #e14 level=3 kind=extension minutes=20
Transform a Beta(A,B) posterior, A,B>1, to η=log[p/(1−p)]. Derive why its mode corresponds to a different p from the original density mode.
:::
::: solution
dp/dη=p(1−p), so η-density as a function of p is proportional to p^A(1−p)^B. Its derivative maximum corresponds to p=A/(A+B), while p-density mode is (A−1)/(A+B−2). Correctly transformed probabilities agree, but density heights and continuous MAP summaries depend on coordinates.
:::

## Ten-question self-check {#quiz}

```quiz
? What is a realised numerical estimator output called?
- [x] An estimate
- [ ] The entire sampling distribution
- [ ] A parameter-space proof
> The estimator is the pre-data rule; its realised output is the estimate.

? Which argument varies in L(θ;x) after observing x?
- [ ] All possible samples with fixed θ
- [x] The parameter θ
- [ ] Only the random seed
> A likelihood fixes data; a probability law fixes the parameter and ranges over data.

? Ten failures have which Bernoulli MLE on [0,1]?
- [ ] .5 automatically
- [ ] No boundary may be used
- [x] 0
> A monotone likelihood reaches its maximum at the permitted endpoint.

? What is the Gaussian variance MLE denominator with positive residual sum?
- [x] n
- [ ] n−1 by the likelihood derivation
- [ ] n+1 always
> n−1 belongs to the unbiased expectation correction, a different criterion.

? What does a lower estimator variance alone establish about MSE?
- [ ] It always establishes lower MSE
- [x] Nothing conclusive without squared bias
- [ ] That every realised estimate is exact
> MSE equals variance plus squared bias at the specified true parameter.

? Beta(2,2) after eight successes and two failures becomes what?
- [ ] Beta(8,2)
- [ ] Beta(18,6) from one dataset
- [x] Beta(10,4)
> Add each observed count once to its corresponding shape.

? What is the next-trial predictive rate under Beta(A,B)?
- [x] A/(A+B)
- [ ] The density height at its mode
- [ ] Always the MLE
> Integrate the conditional success rate over the posterior.

? When may −n log σ be discarded from a Gaussian likelihood objective?
- [ ] Whenever residuals are small
- [x] When σ is fixed for the optimisation in question
- [ ] While fitting σ
> Its parameter dependence matters when scale varies.

? Which statement about continuous MAP is correct?
- [ ] It is invariant under every parameter transformation
- [ ] Its point has positive posterior probability automatically
- [x] Density modes can move because a transformed density has a Jacobian
> Event probabilities transform consistently; density heights depend on coordinates.
```

<div class="free-response" data-free-response data-key="math-series:m25:q10">
<label for="q10-response">10. Derive the Bernoulli MLE and Beta(2,2) update for eight successes and two failures. Report mean, mode, predictive probability and interval interpretation; explain the all-failure boundary, reused-evidence error and the difference between sampling risk and posterior variance.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State the parameter space, likelihood, prior, normalisation and each summary's meaning."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I separated likelihood optimisation, repeated-sample properties and conditional posterior summaries.</label>
</div>

::: answer
On [0,1], log-concavity gives MLE .8 and all-failure MLE 0. Prior times likelihood normalises to Beta(10,4), mean/predictive 5/7, mode 3/4 and variance 2/147. Its 95% credible interval has posterior mass .95 under the stated model, not automatic fixed-p coverage. Counts enter once; reusing evidence is not a new independent batch. Sampling bias/variance average the estimator across new datasets at fixed p, whereas posterior variance conditions on this dataset and the prior.
:::

## Reading with a purpose {#reading}

Use [MIT's classical estimation lesson](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iv/lecture-23/) and [Bayesian inference lesson](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iv/lecture-21/). [Mathematics for Machine Learning](https://mml-book.com/), Chapter 8, supplies the model-to-objective connection. The elementary estimators and beta update above are derived here.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | Classical estimation: which argument defines a likelihood, and which parameter space admits the maximum? |
| Session 4 · 20 minutes | Bayesian models and objectives: what is conditioned on, and which factors depend on the optimised parameter? |

## Retrieval exit task and next step {#summary}

Derive both MLEs, the variance denominator identity, MSE decomposition, beta normalisation/prediction and Gaussian-prior penalty scale. Explain identifiability, boundary existence and the three uncertainty objects without relying on a plot.

**Exit task:** compare MLE .8, posterior mean 5/7 and mode .75 for the ten-trial dataset. Explain their different objectives, then repair a duplicated update and a penalty whose coefficient was unchanged after averaging the residual loss.

**Ready to move on:** you can derive and interpret a point estimate under an explicit model. Inference next adds confidence coverage, hypothesis tests and experimental protocols. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| θ / Θ | Parameter / parameter space | 参数、参数空间 |
| T / t | Estimator rule / realised estimate | 估计量、估计值 |
| L / ℓ | Likelihood / log-likelihood | 似然、对数似然 |
| Bias / MSE | Sampling bias / mean squared error | 偏差、均方误差 |
| π / posterior | Prior / conditional parameter law | 先验、后验 |
| Credible / confidence | Posterior mass / repeated-sampling coverage | 可信、置信 |
| MAP / MLE | Posterior density mode / likelihood maximiser | 最大后验、最大似然 |
| λ / σ² / τ² | Penalty coefficient / noise / prior variance | 惩罚系数、噪声方差、先验方差 |
