## A sample mean needs an uncertainty contract {#start}

A large sample does not automatically justify a small error bar. The relevant quantity is variation of the estimator under a stated sampling mechanism, with dependence, tails and selection included. This lesson proves elementary probability bounds and a finite-variance weak law, states the qualified central limit and Hoeffding theorems, and uses them to report Monte Carlo estimates without converting one reproducible trace into an unconditional accuracy claim.

**Retrieval check:** [Module 04](module_04_EN.html#s1) supplies proof structure; [Module 23](module_23_EN.html#s1) supplies expectation, finite moments and covariance. Optional continuous integrals require [Module 17](module_17_EN.html#s1); the CS route uses finite-event alternatives throughout. Labs use only the Python standard library and local generators.

## Sampling assumptions and variation of an average {#s1}

For observations X₁,…,X_N, define the sample mean M_N=(1/N)ΣX_i. It is a random variable before the sample is realised, and a numerical statistic afterwards. Independent identically distributed sampling, abbreviated IID, means every observation has the same distribution and every finite subcollection factors jointly. Independence alone does not give a common mean, while identical marginals alone do not give independence. A claim about M_N should specify the population quantity it targets and the actual sampling unit.

If each variable has meanμ, linearity gives E[M_N]=μ without independence. For finite variances, Var(M_N)=[ΣVar(X_i)+2Σ_{i<j}Cov(X_i,X_j)]/N². Under IID with varianceσ², all cross terms vanish and Var(M_N)=σ²/N. The standard deviation of this estimator is its standard error, σ/√N. It has the same units as the observed quantity and measures repeated-sample variation, rather than spread of the original observations. Calling the original standard deviation an error bar for the mean omits the averaging calculation.

::: worked title="A copied observation does not acquire a smaller variance"
Let Z be Bernoulli(.3) and set every X_i=Z. Each marginal has mean.3 and variance.21, but M_N=Z and Var(M_N)=.21 for every N. The independence shortcut would give.21/N and is wrong. Every covariance is.21, so the full formula restores the exact answer. Repeating the same record N times creates N rows but only one random draw.
:::

Clustered copies give an intermediate case. If m independent Bernoulli draws are each copied b times, N=mb rows, and their row mean equals the average of the m original draws. Its variance isσ²/m=bσ²/N. In this explicit equal-size-copy model m is the independent count; a general clustered dataset need not admit the same simple effective-size formula. Shared subjects, prompts, time blocks or devices can introduce covariance requiring a design-specific analysis instead of assuming every row is a new unit.

Non-identically distributed independent variables still obey variance addition: Var(M_N)=Σσ_i²/N², and meanE[M_N]=Σμ_i/N. That mean may target a deliberate mixture, but not automatically one fixed populationμ. If selection changes the μ_i or if an unrepresentative group mixture is sampled, increasing N can concentrate around the wrong target. Sampling variation and bias from a changed target are different quantities; a small standard error does not eliminate selection error.

With negative covariances averaging can vary less than the independent reference, while positive covariances can increase its variance. Independence is therefore a sufficient simplification rather than the definition of “good randomness.” Paired comparisons intentionally introduce dependence within each pair to reduce variation of a difference, as Section6 derives. The pairs themselves must have an appropriate cross-pair sampling contract. A dependence warning should name the actual shared source rather than simply reject every dependent construction.

In a numerical experiment, record whether draws share a generator stream, whether it is reset, and which observations are reused. A fixed local seed makes one run repeatable. Resetting it to the same value for every purported replicate repeats the same stream, while using several different integer seeds does not by itself constitute a proof of statistical independence. Mathematical theorems idealise a stated random mechanism; reproducibility documents the implementation and does not add random information to a copied dataset.

::: figure #fig-24-1
IID observations average down variance as1/N. Copies and equal-size clusters preserve shared covariance, so nominal row count can overstate independent information.
:::

::: check
Does mean linearity require independence? Which quantity needs the covariance terms? Does copying records increase the independent sample count?
:::
::: answer
Common-mean linearity is valid without independence. Variance of the mean includes all pair covariances. Copies preserve the shared random draw, so their nominal row count cannot justify an IID standard error.
:::

## Markov and Chebyshev bounds with complete elementary proofs {#s2}

For nonnegative W with finite expectation and t>0, Markov's inequality is P(W≥t)≤E[W]/t. Prove pointwise that W≥t1{W≥t}; expectation and nonnegativity give E[W]≥tP(W≥t), then divide by positive t. No independence is required. A bound greater than one can be clipped to one for reporting. The threshold must be positive: dividing by zero is unavailable, and a negative-variable mean cannot replace the nonnegative variable required by the proof.

Apply Markov to W=(X−μ)² for finite-variance X and positiveε. The event W≥ε² is exactly |X−μ|≥ε, so P(|X−μ|≥ε)≤Var(X)/ε². This is Chebyshev's inequality. Its proof uses a second moment but no Gaussian shape or sampling independence. Independence matters only when a preceding calculation replaces the variance of a sum by the independent formula. If variance is infinite, the bound supplies no finite accuracy information; a tiny empirical variance does not justify substituting a finite population variance.

$$P(|X-E[X]|\geq\varepsilon)\leq\frac{\operatorname{Var}(X)}{\varepsilon^2},\qquad \varepsilon>0.$$

::: worked title="Chebyshev controls an IID Bernoulli mean with a known variance"
For IID Bernoulli(.5), σ²=.25. With N=1000 and ε=.05, Var(M_N)=.00025, so deviation probability is at most.00025/.0025=.1. If p is unknown, Bernoulli variance p(1−p)≤1/4 gives the same worst-case bound. This is a finite-sample probability guarantee under independence and common p, not a statement that each realised error is at most.05.
:::

To make the bound at mostδ, with0<δ<1, choose N≥σ²/(δε²). For Bernoulli without known p use N≥1/(4δε²). At ε=.05,δ=.05 the sufficient size is2000. This is a conservative sufficient requirement derived from only a variance bound; it is not a lower bound on what every estimator or every particular distribution needs. A sharper model-specific calculation may obtain a smaller valid requirement, while violating the sampling assumptions can invalidate the requirement entirely.

Chebyshev can also be sharp for a specified moment-only statement. Let X be0 with probability1−q and ±a each with probabilityq/2, where0<q≤1. Mean is0 and varianceqa². At thresholda, the deviation probabilityq exactly equals variance/a². Thus a universally sharper coefficient cannot be obtained solely by pretending every finite-variance variable is close to Gaussian. Additional tail, support or distribution information can improve a bound, but must be stated as an additional assumption.

A probability guarantee differs from a deterministic error bound. Chebyshev allows exceptional samples with probability at mostδ when a selected threshold meets its bound. A numerical quadrature theorem can instead bound truncation error deterministically for every function satisfying its derivative assumptions. Both need valid assumptions and correct units, but their quantifiers differ. A Monte Carlo report should not write “error guaranteed≤ε” when its theorem gives only P(error≥ε)≤δ.

Union bounds combine several deviation guarantees without assuming their events are independent. If m specified estimates each fail their accuracy condition with probability at mostδ/m, the chance any fails is at mostδ. The estimates may use overlapping records, provided each individual guarantee remains valid. Choosing which estimates to report after inspecting outcomes introduces another selection issue: a fixed list theorem cannot silently cover an unbounded adaptive search. Section5 develops a finite specified family, while later learning theory handles broader model selection.

Bounds can be valid and uninformative at small sample sizes. For N=20,ε=.2 and Bernoulli worst variance.25, Chebyshev gives.3125. For smallerε the raw bound can exceed one, correctly indicating that these assumptions do not establish a useful small failure probability. Report that limitation directly rather than label the bound “wrong” or replace it with a visually attractive error band lacking a theorem. A loose valid upper bound and an actual tail probability answer different questions.

::: check
Which pointwise inequality proves Markov? Does Chebyshev require Gaussian observations? What does a sufficient sample-size bound fail to establish?
:::
::: answer
W≥t1{W≥t} for nonnegative W and positive t. Chebyshev only needs the relevant finite variance. A sufficient size is neither a necessary minimum nor a deterministic guarantee for every realised sample.
:::

## A finite-variance weak law and its convergence meaning {#s3}

For IID X_i with finite meanμ and varianceσ², Chebyshev applied to their mean gives P(|M_N−μ|≥ε)≤σ²/(Nε²)→0 for every fixedε>0. This proves the finite-variance weak law of large numbers: M_N converges toμ in probability. The quantifiedε is fixed while N grows; its associated tail probability tends to zero. The proof is complete here and does not infer a theorem from the shape of one simulated trace.

Convergence in probability says that increasingly large experiments have a decreasing probability of a fixed-size deviation in the limiting sense. It does not say every finite error decreases, that no bad sample occurs, or that a realised trace eventually follows an exact deterministic tolerance rule. Almost-sure convergence concerns the probability that an entire infinite sample path has a limiting value and is a different statement. Strong-law results exist under appropriate assumptions, but this elementary Chebyshev proof establishes only the stated weak law.

::: worked title="A sample-size ratio describes variation, not a monotone trace"
For an IID estimate with finite variance, N=100 gives standard errorσ/10 and N=400 givesσ/20. Quadrupling N halves the standard error. A particular400-observation estimate can still be farther fromμ than the corresponding100-observation estimate. The standard error describes a distribution across repeated samples, while the realised error is one outcome from that distribution.
:::

The weak-law variance argument needs less than full IID if a replacement variance bound is available. Suppose common-mean finite-variance variables have all pair covariances zero and variances bounded byC. Then Var(M_N)≤C/N, so the same Chebyshev proof gives convergence in probability. Pairwise uncorrelatedness does not imply mutual independence or establish the IID CLT stated next. More generally any unbiased mean estimator whose variance tends to zero obeys this probability convergence proof; whether that variance actually vanishes is the essential obligation.

The all-copy example violates that obligation: Var(M_N)=σ² does not tend to zero. For Bernoulli(.3) copies andε=.1, every possible mean is0 or1 and differs from.3 by at least.3, so the deviation probability is1 for every N. Identical marginals and an infinite row count therefore do not supply the weak law. A nonzero common bias also prevents convergence to the intended target even if variance around the biased mean shrinks.

When the model has an infinite variance, this proof is unavailable. Some finite-mean distributions still satisfy other law-of-large-numbers theorems, but one cannot applyσ²/(Nε²) with an invented finiteσ². A variable with undefined mean has no such targetμ to substitute. Module23's moment examples distinguish these cases. State the theorem version actually used rather than summarise every large-sample statement as “averages always work.”

For a fixedε,δ specification the Chebyshev formula provides a concrete finite size before any limit is invoked. The asymptotic weak law instead says some sufficiently large size exists for each target, without claiming the conservative bound is tight. In practice a stopping rule based on the observed estimate changes the experiment. A fixed-N guarantee cannot automatically be applied at a random data-dependent stopping time; valid sequential procedures need their own analysis. The course labs use fixed checkpoints for illustration and do not turn a lucky checkpoint into a theorem.

Replication can help inspect an implementation. If separate simulated datasets follow the same IID mechanism, their sample means should show variation consistent with the model in aggregate. Repeatedly resetting an identical generator stream instead creates the same dataset and reports zero between-run variation. That observation diagnoses the replication protocol, not a miraculous elimination of population uncertainty. Store seeds and their role, and distinguish one long cumulative trace from many independent replicate experiments.

::: check
Which convergence does the variance proof establish? Must realised error decrease at every N? Can pairwise uncorrelated bounded variances support this weak-law proof without supporting the IID CLT?
:::
::: answer
Convergence in probability for every fixed positive tolerance. Realised errors can fluctuate. A variance≤C/N is sufficient for this Chebyshev weak law, while the IID CLT has additional distributional assumptions.
:::

## The central limit theorem standardises means not observations {#s4}

::: figure #fig-24-2
The finite-variance weak law sends each fixed-tolerance tail probability to zero. The CLT rescales fluctuations by the changing standard error; these two limits answer different questions.
:::

The standard IID finite-variance central limit theorem assumes a common meanμ and0<σ²<∞. It states that Z_N=√N(M_N−μ)/σ converges in distribution to a standard Gaussian: for every realz, P(Z_N≤z)→Φ(z). This is a named theorem, not proved by the variance identity alone. The [MIT CLT materials](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iv/lecture-20/) give its qualified statement. It applies to the standardised mean or sum, while the individual X_i retain their original distributions.

$$Z_N=\frac{\sqrt N(M_N-\mu)}{\sigma},\qquad P(Z_N\leq z)\longrightarrow\Phi(z).$$

For suitable large-N approximation, M_N is approximately Gaussian with meanμ and varianceσ²/N, so a band of about1.96σ/√N aroundμ contains about95% of its sampling distribution. The word “about” matters: the theorem as stated supplies no universal finite-N error bound or exact95% coverage. Discreteness, skewness and rare events can make convergence slow or a particular approximation poor. Replacing knownσ by an estimated standard deviation introduces further reasoning, explored in later estimation and inference modules.

::: worked title="A rare Bernoulli mean can be mostly zero despite finite variance"
For p=.01 and N=20, the success count is Binomial(20,.01) and P(no success)=.99²⁰≈.817907. Most means are exactly0, with occasional jumps of.05. A smooth Gaussian approximation cannot accurately represent that large atom. The original observations remain binary even as N grows. In Lab1 the finite fraction inside a1.96-known-SE band is not automatically.95; the exact discrete law explains why a visually convenient Gaussian claim needs qualification.
:::

The normalised standard deviation is1 for Z_N, not for M_N; forgetting√N or usingσ² in place ofσ changes the approximation's units and scale. Ifσ²=0, observations equalμ almost surely and no nondegenerate standardisation is defined. If variance is infinite, this finite-variance CLT is unavailable. Other limit laws can arise under different assumptions. A long sample or a bell-shaped histogram does not substitute for checking which mean, variance and dependence model justify the theorem.

When X_i themselves are Gaussian and independent, their mean is exactly Gaussian for every N, a special stronger result of that family. For general finite-variance observations the CLT is asymptotic. Finite-sample normal-approximation error theorems need additional moment or distribution information; we do not claim a single threshold such as “N≥30” certifies accuracy for every population. Rare Bernoulli counts depend on both Np and N(1−p), and even common rules based on those counts are heuristics unless coupled to an appropriate error analysis.

Discrete event boundaries need attention when using a continuous approximation. For an integer count K, a continuity correction can replace a boundary between adjacent counts by a half-integer in the Gaussian approximation. It is an approximation technique, not an exact event identity or a universal coverage repair. Exact binomial calculations are available for the small examples and can reveal the residual discrepancy. Keep exact support and strict/non-strict threshold conventions visible before translating to an approximate continuous curve.

An asymptotic95% statement is also not a posterior probability that the population mean lies in a particular realised interval. Its interpretation concerns repeated sampling of an estimator under a specified population. Module26 develops confidence coverage carefully, while Module25 introduces Bayesian posterior uncertainty. This lesson distinguishes a theorem about a sampling distribution from a claim about an unknown fixed parameter after data are seen, so later inferential statements have the correct foundation.

CLT reasoning should be tested with independent replicates of the mean, not by plotting all raw observations and expecting them to become Gaussian. Lab1 compares fair and rare Bernoulli sample means at two sizes. The experiment can illustrate the predicted standard errors and shape differences, but cannot prove a theorem or establish a universal approximation error. The finite-count explorer next offers a complete model calculation alongside genuine upper bounds, avoiding reliance on a smooth visual alone.

::: check
Which variable becomes approximately Gaussian in the theorem? Does finite variance give a universal finite-N error rate here? What prevents standardisation for a degenerate variable?
:::
::: answer
The standardised sample mean, not each raw observation. The stated theorem gives asymptotic distributional convergence without a universal finite-size accuracy guarantee. Zero variance makes division byσ unavailable and corresponds to a constant mean almost surely.
:::

## Hoeffding bounds sample sizes and finite simultaneous claims {#s5}

A bounded-independent-variable theorem gives a stronger finite-size bound than moment information alone in many regimes. For independent X_i with deterministic a_i≤X_i≤b_i and positiveΣ(b_i−a_i)², Hoeffding bounds P(|Σ(X_i−E[X_i])|≥t) by2exp(−2t²/Σ(b_i−a_i)²), t>0. This qualified named theorem is documented in [MIT's probability notes](https://ocw.mit.edu/courses/9-520-statistical-learning-theory-and-applications-spring-2006/f195bbc782726fc4580586a67d4fe69c_mathcamp02.pdf). If every range is zero, the sum is deterministic and positive-threshold deviations have probability zero.

For IID observations in[0,1], substitute t=Nε and total squared rangesN to obtain P(|M_N−μ|≥ε)≤2exp(−2Nε²). Clamp the displayed upper bound at one. Boundedness provides finite moments, but independence remains an essential assumption. Identical distributions are unnecessary for the general sum bound; without them the centred mean targets the average of individual means. Rescaling a common range[a,b] multiplies the required squared tolerance scale by(b−a)².

$$P(|M_N-\mu|\geq\varepsilon)\leq2e^{-2N\varepsilon^2}\quad\text{for IID values in }[0,1].$$

::: worked title="A sufficient bounded-data size beats a variance-only size here"
For ε=.05 andδ=.05, solve2exp(−2Nε²)≤δ to get N≥log(2/δ)/(2ε²)=log40/.005≈737.776, so N=738 suffices. The worst-variance Chebyshev requirement was2000. Neither number is a necessary minimum for every Bernoulli p, and neither applies to arbitrary dependent copies. Natural logarithms match the exponential base in the formula.
:::

For m specified[0,1]-valued estimates each based on N appropriate independent observations, apply the individual bound and then a union bound: probability any mean deviates byε is at most2mexp(−2Nε²). The estimates may be dependent on each other; the union step needs no cross-estimate independence. To guarantee at mostδ, choose N≥log(2m/δ)/(2ε²). With m=20,ε=.05,δ=.05, N=1337 is a sufficient integer size. The list must be specified or otherwise covered by the theorem before claiming simultaneous validity.

Checking one fixed model and then selecting among many based on the same outcomes changes the claim. The finite-family union argument can protect an entire specified list, but the original single-model guarantee cannot automatically follow a chosen winner. Later Module30 applies this distinction to learning and generalisation. Likewise inspecting infinitely many checkpoints is not covered by one fixed-Nδ statement; a valid union allocation or sequential method must cover the events actually inspected.

A Hoeffding radius at confidence level1−δ is ε_N=√[log(2/δ)/(2N)] for[0,1] observations. It does not use an estimated variance, so it remains positive when a Bernoulli sample has zero successes. At N=100,δ=.05 the radius is about.135810. A plug-in standard error√[p_hat(1−p_hat)/N] instead becomes zero at p_hat=0; that alone does not certify p=0 or eliminate uncertainty. Under a synthetic p=.001 model,100 zero observations occur with probability.999¹⁰⁰≈.904792.

::: widget name=sampling
:::

::: figure #fig-24-3
Chebyshev uses a variance bound, while Hoeffding uses independent bounded observations. Both upper bounds can exceed the actual finite-model tail and should be clipped at one for reporting.
:::

The explorer compares IID Bernoulli means with rows copied from one common Bernoulli draw. It evaluates the finite-model deviation probability numerically and displays Chebyshev using the actual variance. Hoeffding's N-observation expression is shown only for the independent mode. The shaded tail includes equality at the tolerance boundary; integer-percent inputs let the event be checked through an exact integer inequality before its masses are summed in floating-point arithmetic.

Different bounds can be tighter in different regimes. At small N or large known-variance advantages, Chebyshev can outperform a generic bounded Hoeffding bound; at larger N a bounded exponential guarantee often improves on the1/N variance bound. Compare valid numerical bounds for the same event and assumptions, rather than assert that one named inequality is always numerically best. An exact finite model can additionally compute the actual tail, while the general theorem offers a guarantee without knowing all those masses.

::: check
Which assumptions support Hoeffding's finite bound? Does a union over estimates require those estimates to be independent? Does zero plug-in SE establish zero population uncertainty?
:::
::: answer
Independent draws and stated deterministic bounds, with the appropriate target mean. The union step needs no independence between failure events. An all-zero sample can be very probable under a nonzero rare rate, so its zero plug-in SE supplies no exact certainty.
:::

## Monte Carlo reports seeds and variance reduction by pairing {#s6}

Monte Carlo estimates an expectation by sample averaging under a specified sampling mechanism. For a finite event A, average its indicator to estimate p=P(A); under IID sampling it is unbiased and has variance p(1−p)/N. A plug-in SE estimates its variation but needs its own interpretation at boundaries and small counts. If p is known in a synthetic experiment, the model SE is available for comparison; if p is unknown in an application, it cannot be inserted as though known.

**Optional continuous branch requiring Module17:** for I=∫_a^b h(x)dx and U uniform(a,b), I=(b−a)E[h(U)]. With IID U_i and finite Var(h(U)), estimator I_hat=(b−a)Σh(U_i)/N has variance(b−a)²Var(h(U))/N. For h(x)=x² on[0,1], I=1/3 and Var(U²)=1/5−1/9=4/45. The CS alternative uses the finite-event estimator and the same mean-variance logic without an integral prerequisite.

::: worked title="Common random numbers reduce variation of this difference"
Let A=1{U<.6}, B=1{U<.55} using the same ideal uniform U. Their means are.6,.55, so E[A−B]=.05. The difference is1 only when.55≤U<.6, giving variance.05(.95)=.0475. With independent uniforms for A and B, variance is.6(.4)+.55(.45)=.4875. For10000 independent pairs, SEs are about.002179 and.006982 respectively. Both estimate the same difference; positive within-pair covariance reduces its variance.
:::

The general paired identity is Var(A−B)=Var(A)+Var(B)−2Cov(A,B). Pairing helps relative to independent marginals when covariance is positive, harms when negative, and gives no change when zero. It is not a universal improvement from reusing randomness. Preserve each method's intended marginal distribution and make pairs independent across replications before applying the usual pair-mean SE. In empirical comparisons, pairing by the same input can similarly reduce nuisance variation when the design and analysis treat the pair as the unit.

Report the estimator, target, sample count of actual independent units, seed protocol, variance assumptions, uncertainty quantity and any theorem or approximation used. An estimated standard error is different from a distribution-free radius and from an actual realised absolute error known only in a synthetic test. If deterministic numerical approximation is also used inside each simulation, its bias or truncation error contributes separately; increasing random sample count cannot remove a persistent inner-solver bias.

Absolute and relative tolerances also demand different sample sizes. For an IID Bernoulli event, dividing the known standard error by a nonzero rate gives relative SE equal to the square root of (1−p)/(Np). A fixed absolute tolerance can be quite large relative to a rare target: an absolute error of .005 is half a rate of .01, although it is only one hundredth of a rate of .5. When p is zero, this relative expression is undefined rather than an invitation to divide a zero estimate by zero. State the desired error scale before choosing N, and do not switch from an absolute probability theorem to a relative guarantee without a separate derivation.

The cost comparison for a variance reduction method should include computational work. If one paired replication needs two simulator evaluations, compare its variance at a fixed evaluation budget with the independent alternative using the same budget. A method with smaller per-replication variance may have expensive coupling, storage or evaluation costs. In the threshold example both alternatives require two indicator evaluations per pair, making the derived variance comparison directly meaningful at equal pair counts. For another simulator, record the budget and preserved target explicitly before claiming improved efficiency. Reproducibility includes these design choices as well as the seed: the same random integers cannot rescue an estimator aimed at a changed quantity.

::: figure #fig-24-4
Pairing subtracts twice the within-pair covariance from difference variance. Repeated copies of an entire stream add no independent replications.
:::

Lab1 examines repeated means, Lab2 reports finite-event and optional integral estimates, and Lab3 exposes repeated seeds, copied clusters and zero plug-in error bars. Its common-random-number example is a valid deliberate coupling with explicitly preserved marginals. A reproducible script can therefore support a precise experimental claim, while the associated theorem still depends on the mathematical sampling assumptions. Keep numerical evidence, a named limit theorem and a finite probability guarantee separate.

::: check
What distinguishes Monte Carlo error from quadrature truncation? When does pairing reduce a difference variance? What sample count belongs in a copied-cluster error formula?
:::
::: answer
Monte Carlo error varies with random draws; deterministic truncation needs an approximation bound. Positive within-pair covariance reduces the difference variance with unchanged marginals. The explicit equal-copy model averages independent clusters, so it uses the number of original draws rather than copied rows.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| Every row is a new independent observation. | Copies and clusters retain covariance. |
| Chebyshev requires Gaussian data. | Finite variance and a positive threshold suffice. |
| The weak law makes every error shrink monotonically. | It states convergence in probability. |
| The CLT changes raw observations into Gaussians. | It concerns standardised means or sums. |
| A universal N≥30 certifies the CLT approximation. | Distribution shape and extra error assumptions matter. |
| Hoeffding applies to arbitrary dependent copies. | Its independent-draw assumption must be checked. |
| Zero estimated SE proves zero uncertainty. | Boundary samples can occur under a nonzero rate. |
| Pairing always reduces variance. | The covariance sign determines its effect. |

## Three reproducible labs {#labs}

### Lab1 · Repeated means and finite-sample shapes {#lab1}

{{LAB:lab1}}

Predict each model SE, rare no-success probability and support spacing. The within1.96-SE fraction is a finite diagnostic, not an exact95% theorem. The raw draws remain Bernoulli.

### Lab2 · Monte Carlo estimate and uncertainty quantities {#lab2}

{{LAB:lab2}}

CS readers use the finite event; AI readers also derive the continuous integral and variance. Distinguish model SE, plug-in SE, Hoeffding radius and realised error. Explain why quadrupling samples halves a standard error without ordering all realised errors.

### Lab3 · Copied seeds clusters and common randomness {#lab3}

{{LAB:lab3}}

Identify the actual independent units before accepting an error bar. Repair the zero-SE certainty claim and derive the positive-covariance benefit in the specified paired model.

## Fourteen exercises with full solutions {#exercises}

Exercises1–12 are required. Optional Exercises13–14 add35 minutes beyond the ten-hour schedule; continuous alternatives require Module17 and occupy the same time.

::: exercise #e1 level=1 kind=calculation minutes=6
For IID Bernoulli(.3), N=1000, give mean variance and SE. What if all rows copy one draw?
:::
::: solution
IID variance.21/1000=.00021, SE≈.014491. Copies have variance.21 and SE≈.458258 for every row count because their mean is the original draw.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
Use Chebyshev for IID Bernoulli(.5), N=1000, ε=.05. Give a size sufficient for failure bound.05.
:::
::: solution
Variance.25/1000 and threshold square.0025 give bound.1. Sufficient N≥.25/(.05·.0025)=2000. This is a probability bound under IID, not an exact necessary minimum.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
For IID[0,1] observations, ε=.05,δ=.05, calculate a Hoeffding sufficient integer size.
:::
::: solution
N≥log40/.005≈737.776, so738. Natural log matches the exponential formula; bounds and independence are required.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
What happens to IID SE when N quadruples? For Bernoulli(.01), N=20, give the exact no-success probability.
:::
::: solution
SE halves. P(no success)=.99²⁰≈.817907, showing a large zero atom and a poor small-sample smooth approximation. One realised error need not halve.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove Markov and Chebyshev with all sign, moment and threshold assumptions.
:::
::: solution
For W≥0 and t>0, W≥t1{W≥t}; average and divide to obtain P≤EW/t. For finite-variance X apply it to W=(X−EX)²,t=ε²,ε>0. This gives the deviation bound without Gaussian shape or independence. The latter may be needed to compute the variance of a mean.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Derive the IID mean variance and the finite-variance weak law.
:::
::: solution
Linearity gives meanμ; variance expansion with zero independent covariances givesσ²/N. Chebyshev yields P(|M_N−μ|≥ε)≤σ²/(Nε²)→0 for every fixed positiveε. This is convergence in probability, not a monotone-path or strong-law proof.
:::

::: exercise #e7 level=2 kind=proof minutes=14
Derive the finite-family Hoeffding guarantee from its individual theorem and a union bound.
:::
::: solution
For m specified valid estimates, union failure≤Σ2exp(−2Nε²)=2mexp(−2Nε²). Solving≤δ gives N≥log(2m/δ)/(2ε²). Failure events need not be independent, but each individual draw contract and the specified family must be valid.
:::

::: exercise #e8 level=2 kind=application minutes=10
For m=20,ε=.05,δ=.05, give a simultaneous sufficient size and explain what an adaptive unlisted search changes.
:::
::: solution
N≥log800/.005≈1336.923, so1337. The bound covers the specified twenty estimates jointly. An unlisted adaptive search is a different collection of events and requires a justified covering or selection analysis.
:::

::: exercise #e9 level=2 kind=application minutes=10
CS: estimate finite-event p=.3 with10000 IID indicators and give known SE. AI alternative: estimate ∫_0^1 x²dx and give model variance/SE.
:::
::: solution
CS SE√(.21/10000)≈.004583. AI target1/3, per-draw variance4/45, estimator variance4/(45·10000), SE≈.002981. Both are model-known repeated-sample quantities; estimated SE and actual realised error are different.
:::

::: exercise #e10 level=2 kind=application minutes=10
Derive the paired and independent variances for thresholds.6 and.55, and state when common randomness helps.
:::
::: solution
Shared U gives difference indicator on[.55,.6), variance.05(.95)=.0475. Separate draws give.24+.2475=.4875. The positive covariance.55−.6(.55)=.22 subtracts.44. Pairing helps here; a negative covariance would increase variance. Independent pairs remain required across replications.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
Thirty datasets reset the same seed and their identical means have zero between-run SD. A report treats all30000 rows as independent. Repair it.
:::
::: solution
Each1000-row block is a copy of the same draw sequence, so the aggregate mean has the original1000-sample variation. Under Bernoulli(.3), correct model SE√(.21/1000)≈.014491, rather than√(.21/30000)≈.002646. Zero replicate variation diagnoses copied streams, not certainty.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
All100 observed indicators are zero, so a zero plug-in SE is reported as proof p=0 and exact CLT coverage. Repair both.
:::
::: solution
At p=.001 the data occur with probability.999¹⁰⁰≈.904792. The zero estimate does not prove a zero rate. A distribution-free bounded independent radius atδ=.05 is√(log40/200)≈.135810. The stated CLT has no universal finite-N exact95% coverage guarantee, particularly at rare-event boundaries.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Show that common-mean pairwise uncorrelated variables with variance at mostC satisfy this weak-law proof. Explain why that is not the IID CLT theorem.
:::
::: solution
Variance of their average is at mostNC/N²=C/N; Chebyshev gives tail≤C/(Nε²)→0. Pairwise uncorrelatedness need not imply joint independence or identical laws, so the stated IID CLT assumptions do not follow from this argument.
:::

::: exercise #e14 level=3 kind=extension minutes=20
CS: derive variance of a mean from m independent draws copied b times each. AI alternative: compare independent and antithetic estimators of ∫_0^1 x dx.
:::
::: solution
CS: row mean equals the m-draw mean, varianceσ²/m=bσ²/N forN=mb. AI: independent U averages have variance1/(12N). An antithetic pair average(U+(1−U))/2=.5 exactly for every U, eliminating sampling variance for this linear integrand. This special negative-covariance sum construction does not guarantee the same gain for every integrand or simulation cost.
:::

## Ten-question self-check {#quiz}

```quiz
? Which assumption removes the covariance terms from the IID mean variance?
- [x] Independent finite-variance observations
- [ ] Matching row labels alone
- [ ] Repeated copies of one record
> Linearity of the mean is separate; variance needs the cross-term justification.

? What does Chebyshev require?
- [ ] Gaussian shape
- [x] A finite relevant variance and a positive deviation threshold
- [ ] A particular fixed seed
> Applying Markov to the squared centred variable proves the bound.

? What convergence does the elementary weak-law proof establish?
- [ ] Every finite realised error decreases
- [ ] An exact deterministic error bound
- [x] Convergence in probability for each fixed positive tolerance
> The tail bound tends to zero; this proof is not an almost-sure path argument.

? What is standardised in the IID CLT?
- [x] The sample mean or sum
- [ ] Each original observation becomes Gaussian
- [ ] The probability model's seed
> Bernoulli observations remain Bernoulli even as means become approximately Gaussian.

? Does the stated CLT provide exact95% finite coverage for every N≥30?
- [ ] Yes
- [x] No, it is asymptotic and requires its assumptions
- [ ] Only the histogram colour matters
> Rare or skewed populations can give poor small-sample approximations; a universal cutoff is unsupported.

? Does the union step over several valid estimates need cross-estimate independence?
- [ ] Always
- [ ] Only when they share records
- [x] No, union bounds do not require it
> Each individual guarantee must still be valid and the family must be covered by the claim.

? What does quadrupling IID sample size do to standard error?
- [x] Halves it under a fixed finite-variance model
- [ ] Divides it by four
- [ ] Forces each realised error to halve
> Standard error scales as1/√N and describes repeated-sample variation.

? A zero-success sample has zero plug-in SE. What follows?
- [ ] The true rate must be zero
- [x] The plug-in estimate is at a boundary; uncertainty still needs a valid analysis
- [ ] Hoeffding becomes zero automatically
> Rare nonzero rates can produce all-zero samples with high probability.

? When does pairing reduce a difference variance with unchanged marginals?
- [ ] For every possible covariance
- [ ] Only for negative covariance
- [x] When within-pair covariance is positive
> Var(A−B)=VarA+VarB−2Cov; cross-pair dependence still needs its own treatment.
```

<div class="free-response" data-free-response data-key="math-series:m24:q10">
<label for="q10-response">10. Write an uncertainty contract for a finite-event Monte Carlo estimate: derive mean variance and a Chebyshev or Hoeffding size, state the independent unit and seed protocol, and explain why copied streams, rare zero samples or a CLT approximation do not supply an unconditional error guarantee.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State target, estimator, assumptions, N, tolerance, failure probability and theorem scope."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I separated sampling variation, probability bounds, approximation and actual independent information.</label>
</div>

::: answer
For IID indicators with common ratep, estimate is their mean, variancep(1−p)/N and SE√[p(1−p)/N]. Chebyshev worst-case size is1/(4δε²), or bounded Hoeffding size log(2/δ)/(2ε²). N counts independent draws, not duplicated rows; a local seed documents a trace while copied streams add no replications. A zero-success estimate can occur at nonzero p, and the stated CLT is asymptotic rather than an exact finite error certificate. Report the failure probability and all model assumptions with the tolerance.
:::

## Reading with a purpose {#reading}

Use [MIT's weak-law lesson](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iv/lecture-19/) and [CLT lesson](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/pages/unit-iv/lecture-20/). The qualified Hoeffding statement is in [MIT's probability notes](https://ocw.mit.edu/courses/9-520-statistical-learning-theory-and-applications-spring-2006/f195bbc782726fc4580586a67d4fe69c_mathcamp02.pdf). The elementary bounds and mean/covariance applications above are derived in full here.

| When | Selection and question |
|---|---|
| Session1 · 15 minutes | Mean variation and weak law: what variance calculation makes the probability bound vanish? |
| Session4 · 15 minutes | CLT and bounded concentration: which statements are asymptotic and which are finite-size guarantees? |

## Retrieval exit task and next step {#summary}

Prove Markov, Chebyshev and the finite-variance weak law; state CLT and Hoeffding with assumptions; calculate sample sizes and a Monte Carlo uncertainty report. Derive how deliberate pairing or accidental copying changes variation.

**Exit task:** at ε=.05,δ=.05 compare sufficient Bernoulli sizes2000 and738, then explain why neither IID formula applies to N copies of one draw. Distinguish standard error from actual realised error and a deterministic numerical bound.

**Ready to move on:** you can assess sampling statements and report a justified estimator. Estimation next derives likelihood, bias, variance and Bayesian parameter updating rather than treating all model rates as known. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| IID / sampling unit | Independent identical laws / actual independent draw | 独立同分布、抽样单位 |
| M_N / SE | Sample mean / estimator standard deviation | 样本均值、标准误 |
| ε / δ | Error tolerance / failure-probability bound | 容差、失败概率 |
| Weak law / CLT | Probability convergence / distributional standardisation limit | 弱大数法则、中心极限定理 |
| Chebyshev / Hoeffding | Variance bound / bounded independent concentration | 切比雪夫、Hoeffding界 |
| Monte Carlo / quadrature | Random expectation estimate / numerical integral approximation | 蒙特卡洛、数值求积 |
| Pairing / copied stream | Deliberate within-pair coupling / repeated random sequence | 配对、复制流 |
