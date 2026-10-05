## A random variable is a function before it is an observation {#start}

Probability models assign masses to events; random variables map their outcomes to values. This lesson derives discrete distributions, separates density from probability, constructs distribution functions and quantiles, and transforms variables without losing preimages or Jacobian factors. Each model is attached to a generating story and explicit support, rather than selected because a curve looks familiar.

**Retrieval check:** [Module 21](module_21_EN.html#s1) supplies event models, conditioning and independence. **Continuous AI branch:** [Module 17](module_17_EN.html#s1) is required for densities, continuous sampling derivations and changes of variables. The CS route follows all discrete material, uses the discrete bridge in Section 3, and omits the labelled continuous portions of labs and exercises. Those minutes can be spent on discrete CDF and transformation practice within the same schedule.

## Outcome maps distributions and cumulative probabilities {#s1}

A real random variable X maps Ω to R. In a finite model any such map is valid; in general measurability requires {ω:X(ω)≤t} to be an event for every real t. The random variable is the whole function before the experiment occurs. A realised value x=X(ω) is an observation, and an outcome ω can contain more information than x. For two coin outcomes, mapping to the number of heads merges HT and TH into the same numerical value one. Outcomes, variables and observations are therefore distinct objects.

The distribution of X assigns probability to its value sets through preimages: P(X∈S)=P({ω:X(ω)∈S}). Distinct maps or experiments can have the same distribution. Conversely the same displayed values can have different masses in different models. For a discrete variable, its PMF p_X(x)=P(X=x) is nonnegative and sums to one over its countable support. The support in this discrete sense consists of positive-mass values; values outside it have mass zero. For a continuous distribution we will describe supported intervals or neighbourhoods, since individual point masses are zero.

The cumulative distribution function F_X(t)=P(X≤t) exists for discrete, continuous and mixed variables. It is nondecreasing because the events increase with t; limits at −∞ and +∞ are zero and one by probability continuity on nested events. It is right-continuous: if t_k↓t, then {X≤t_k} decreases to {X≤t}, and Module 21's continuity property gives F(t_k)→F(t). Its left limit F(t−)=P(X<t) follows from increasing thresholds approaching t from below. Therefore its jump at t is exactly P(X=t).

::: worked title="A many-to-one observation map creates a nonuniform count"
For two independent fair coin flips, the four ordered outcomes each have mass 1/4. Let X count heads. Then p_X(0)=1/4, p_X(1)=1/2 and p_X(2)=1/4. Its CDF is zero below0, 1/4 on[0,1), 3/4 on[1,2), and one on[2,∞). The three count values are not uniformly distributed. F(1)=3/4 includes the mass at one; F(1−)=1/4 excludes it.
:::

For any real a<b, P(a<X≤b)=F(b)−F(a). Both left strictness and right inclusion matter at atoms. P(a≤X≤b)=F(b)−F(a−), while P(X>b)=1−F(b) and P(X≥b)=1−F(b−). These identities follow by disjoint event decompositions, not by assuming a density. In a continuous distribution with no endpoint masses some distinctions coincide numerically; a discrete model cannot silently discard them. An empirical CDF is also a step function with jumps at observations, even when the generating distribution is continuous.

$$P(a<X\leq b)=F_X(b)-F_X(a),\qquad P(X=t)=F_X(t)-F_X(t^-).$$

For a finite table, calculate F by cumulative masses in sorted value order and retain the convention ≤. If a graph connects CDF jump endpoints by sloping lines, it falsely suggests intermediate probability changes where the discrete CDF is constant. PMF bars and CDF steps communicate different quantities: one is probability at a value, the other probability up to a threshold. Axes should label which object is being shown, and transformed values must be sorted again after their masses have been combined.

The distribution alone does not specify joint dependence with another variable. Two variables can both be fair Bernoulli while being equal, opposite or independent. Their marginal PMFs match in all three cases, yet joint events differ. The next module builds joint distributions and expectations. For now, avoid multiplying marginal masses without the independence assumptions from Module 21. A function of an existing variable also retains dependence on that variable, even if its resulting distribution has a familiar name.

A distribution is also different from its representation precision. Rounding a continuous measurement into bins creates a discrete reported variable whose mass in each bin is the original interval probability. If a sensor rounds to tenths, an observed label .3 can represent a whole interval of underlying inputs rather than the single real value .3. State the measurement and tie convention before comparing exact point observations with density models. This explains why repeated rounded labels do not, by themselves, prove the underlying physical quantity has atoms.

::: figure #fig-22-1
Four outcomes map to three head-count values; the middle value collects two preimages. PMF masses and right-continuous CDF steps encode the same distribution differently.
:::

::: check
Is a realised number the random variable itself? Why can three possible counts be nonuniform? What is the CDF jump at t?
:::
::: answer
The variable is a map; the number is its realised output. The count-one value collects two equiprobable outcomes while the others collect one. The jump F(t)−F(t−) equals P(X=t).
:::

## Discrete families and the experiments that derive them {#s2}

A Bernoulli variable takes values0,1 with probabilities1−p,p, where0≤p≤1. It often indicates whether an event occurred. The endpoint models p=0 and p=1 are valid degenerate distributions. A categorical variable takes one of k labels with masses p_i≥0 summing to one; coding labels as integers does not make their numerical distances meaningful. A sampled class index is categorical, whereas a vector of predicted class probabilities describes a distribution rather than a realised class.

A binomial variable counts successes in a fixed number n of independent Bernoulli trials with the same success probability p. For k=0,…,n, choose which k trials succeed in comb(n,k) ways; every such pattern has mass p^k(1−p)^{n−k}, so p_X(k)=comb(n,k)p^k(1−p)^{n−k}. The disjoint success-count events partition all trial patterns, or the binomial theorem normalises the sum. Handle p=0,1 directly rather than rely on an ambiguous numerical 0^0. Independence, equal p and fixed n are part of the model, not consequences of observing a count.

::: worked title="A binomial tail is a sum of event masses"
For n=5,p=2/5, P(X≥3)=Σ_{k=3}^5 comb(5,k)(2/5)^k(3/5)^{5−k}=992/3125=.31744. The ≥ includes the mass at3; using 1−F(3) would instead exclude it. The correct complement is1−F(2), since X is integer-valued. Lab 1 computes all masses and their cumulative sums exactly, so the finite tail is checked without simulation or a normal approximation.
:::

The geometric trial count T is the index of the first success in independent repeated Bernoulli trials with a fixed0<p≤1. Its support starts at1 and P(T=k)=(1−p)^{k−1}p. A failures-before-success convention uses G=T−1 with support starting at0 and P(G=k)=(1−p)^k p. Always state which one is used. For0<p<1, the first K trial masses sum to1−(1−p)^K and the remaining tail is(1−p)^K. When p=1, T=1; when p=0 there is no finite first success, so this finite-valued geometric PMF is not normalised.

The geometric tail P(T>m)=(1−p)^m for integers m≥0 gives memorylessness: P(T>m+n|T>m)=(1−p)^n when the conditioning mass is positive. Surviving m failures does not alter the waiting mechanism under independent identical trials. A system whose success rate changes after failures does not satisfy this geometric story. Repeated attempts can be dependent or have changing hazards, so an observed waiting count does not alone establish memorylessness or constant p.

The Poisson distribution models a nonnegative integer count with parameter λ≥0: p_X(k)=exp(−λ)λ^k/k!, k=0,1,…, with λ=0 interpreted as a point mass at0. Its normalisation uses the exponential-series identity Σλ^k/k!=exp(λ); the discrete route can use this stated identity without the calculus proof in Module16. A common generating story is a count in a fixed interval from a homogeneous process with independent increments and constant event rate, so λ is rate times interval length. This distribution is not automatically a model for every count, clustered process or varying-rate interval.

At λ=2, P(X=0)=exp(−2)≈.135335 and P(X=1)=2exp(−2)≈.270671. A truncated numerical table from0 through K has total less than one because it omits a positive tail, not because the model is invalid. Renormalising that truncated table changes the distribution to the conditional model X≤K. Lab 1 reports its missing mass explicitly. In very large-parameter computations direct powers and factorials can overflow; later stable log computations address arithmetic, while the support and generating assumptions remain unchanged.

Sampling without replacement from a fixed finite collection generally gives a hypergeometric count rather than a binomial one. The dependence from removing a token changes later success probabilities. A binomial approximation may be useful when the sampled fraction is small, but it must be identified as an approximation with an adequate error criterion. Named families are compact descriptions of mechanisms; matching a mean count or fitting a histogram shape is insufficient to establish their whole assumptions.

::: check
Which assumptions define a binomial count? Where does geometric trial support start? Does a finite Poisson table have to sum exactly to one?
:::
::: answer
Fixed n, independent trials and common p. Trials start at1, while failures start at0. A finite Poisson prefix omits an infinite tail; renormalising it changes the target to a conditional truncation.
:::

## Continuous densities and an explicit discrete-route bridge {#s3}

**CS bridge:** a PMF assigns probabilities directly to discrete values, while its CDF cumulates those masses with ≤. Practise endpoint identities and the categorical, binomial and geometric examples above. The rest of this section and all labelled continuous calculations require Module17; the CS route can omit them and continue with discrete quantiles and discrete transformations. A description of a continuous branch is not an extra hidden prerequisite for the discrete route.

**Continuous AI branch:** an absolutely continuous distribution has density f_X(x)≥0 with integral over R equal to one and probabilities P(a<X≤b)=∫_a^b f_X(x)dx. A PDF value is a height, not an event probability. It may exceed one, has units reciprocal to x, and its value at a single point can be changed without altering any probability. Continuous point probabilities are zero even at a positive density. Not every distribution has a PDF: a discrete atom or mixed model needs its point masses retained.

Uniform(a,b), a<b, has density1/(b−a) on(a,b), zero outside, and linear CDF inside. Whether density endpoint values are included does not alter its integrals. Exponential rate λ>0 has density λexp(−λx) for x≥0 and zero for x<0; its CDF on x≥0 is1−exp(−λx). Integrating the density gives one. Rate λ and scale1/λ are different conventions with different units: rate has inverse-time units, scale has time units. Memorylessness follows from the exponential tail product, with positive conditioning tail, and describes a constant-rate model rather than an inevitable property of all waiting times.

::: worked title="A density above one can coexist with a zero point probability"
For exponential rate2, f_X(0)=2 under the chosen version, P(X=0)=0, and P(0<X≤.1)=1−exp(−.2)≈.181269. The integral over a short interval gives probability; multiplying a height by a width only approximates it when the density is sufficiently stable on that interval. The number2 itself is neither a probability nor a violation of normalisation.
:::

Gaussian N(μ,σ²), σ>0, has density exp(−(x−μ)²/(2σ²))/(σ√(2π)) on all R. Normalisation uses the standard Gaussian integral ∫exp(−z²/2)dz=√(2π), stated as a classical fact here rather than proved by the elementary antiderivative rules. Standardising z=(x−μ)/σ then supplies the scale factor. Its CDF generally has no elementary closed form and is computed numerically or via a special function. σ=0 is a degenerate atom at μ, not the formula obtained by dividing by zero.

Laplace(μ,b), b>0, has density exp(−|x−μ|/b)/(2b). Split its integral at μ: each exponential half contributes1/2. Its CDF is(1/2)exp((x−μ)/b) below μ and1−(1/2)exp(−(x−μ)/b) above. The density has a peak with a kink and heavier exponential tails than a Gaussian; selecting it as a noise model is an assumption about the error mechanism. Neither symmetric shape nor a few central observations uniquely determines which family applies.

A mixed distribution can place mass .3 at zero and distribute .7 uniformly on(0,1). Its CDF is0 below0, jumps to.3 at0, then is.3+.7t for0<t<1, and reaches1 at1. A density .7 on(0,1) represents only the continuous component and integrates to.7, so it cannot represent the entire probability model by itself. A dataset with a real point mass and continuous measurements requires a mixed representation; forcing either a pure PMF over all real observations or an ordinary PDF to include the atom loses information.

For absolutely continuous X, F is an integral of its density and F′=f where the appropriate regularity holds; a derivative at every point is unnecessary for representing the probabilities. For arbitrary distributions the CDF remains valid even when no ordinary density exists. This is why interval calculations through F are often safer than inferring a density from a smooth-looking plot. Keep the mathematical type of the distribution explicit before asking a numerical library for PMF or PDF values.

::: figure #fig-22-2
A discrete CDF jumps at positive-mass values; a continuous density accumulates by area; a mixed CDF retains both a jump and continuous growth.
:::

::: check
Can a PDF exceed one? Does a positive density give positive point probability? Can a mixed model's continuous component alone integrate to one?
:::
::: answer
Yes, only its total integral must be one. Absolutely continuous points have probability zero. In the .3-atom/.7-uniform example the continuous component integrates to.7; the atom supplies the remaining mass.
:::

## Quantiles inverse sampling and empirical distribution functions {#s4}

For0<u<1 define the generalised quantile Q(u)=inf{x:F(x)≥u}. The limit properties ensure its threshold is finite for these interior u values; right-continuity ensures the infimum has F(Q(u))≥u. The key equivalence Q(u)≤t exactly when u≤F(t) follows by monotonicity and right-continuity. A continuous strictly increasing CDF has an ordinary inverse, but a discrete step CDF needs this generalised definition. A quantile level is a probability, while its output is in the variable's units.

The equivalence proves inverse-CDF sampling: if U is ideal uniform on(0,1), then P(Q(U)≤t)=P(U≤F(t))=F(t). On the discrete route, regard the construction as choosing a value by the lengths of its cumulative probability intervals; no density integration is required to implement the finite weighted sampler. Its correctness is the interval-mass identity. In a continuous branch the same argument uses the uniform interval model and yields the desired continuous distribution.

For a discrete table with sorted values x₁<…<x_m and cumulative masses c_j, choose the first j with c_j≥u and return x_j. The intervals(c_{j−1},c_j] have lengths p_j; zero masses contribute empty intervals and can be removed. With head-count masses1/4,1/2,1/4, Q(.2)=0, Q(.5)=1 and Q(.9)=2. Q(.25)=0 under this infimum convention. Quantile ties and endpoint conventions should be stated instead of relying on an implementation's undocumented interpolation choice.

::: worked title="A geometric quantile encodes a waiting experiment"
For trial-count p=1/4, F(k)=1−(3/4)^k. The first integer k≥1 with this at least u is the geometric quantile; for u=.5, F(2)=7/16<.5 and F(3)=37/64>.5, so Q(.5)=3. For0<p<1, a numerical formula is ceil(log(1−u)/log(1−p)), clipped to at least1. With p=1 return1 directly. Lab2 treats a practical generator's zero endpoint as the first trial; the mathematical definition above uses interior u.
:::

In the continuous branch, exponential inverse sampling solves u=1−exp(−λx), giving x=−log(1−u)/λ. Use log1p(−u) to compute log(1−u) accurately for small u, and exclude u=1 because the result is infinite. Affine uniform sampling uses a+(b−a)u. These formulas assume the input uniform model; a finite-precision pseudorandom generator actually samples from a finite representable grid. It approximates the ideal continuous mechanism, with repeatability and numerical details separate from the exact distribution theorem.

Given observations x₁,…,x_N, the empirical CDF is F_N(t)=(1/N)Σ_i 1{x_i≤t}. It is a discrete distribution assigning mass1/N per observation, with duplicate values collecting larger jumps. Counting sorted values using a right insertion index implements ≤; a left insertion index instead counts strictly smaller observations. An empirical CDF from continuous data is still stepwise, because a finite sample contains only finitely many observed values. Smoothing it produces another estimator, not the definition of the ECDF.

Compare empirical and theoretical CDFs at stated thresholds, rather than require finite samples to match exact masses. A seeded trace can illustrate sampling but not establish a universal discrepancy guarantee; Module24 adds relevant concentration and limit statements. Quantile interpolation in data software may differ from the distribution's generalised inverse, especially with small samples and ties. Report the convention when a median, percentile or tail threshold feeds an algorithm or benchmark. The distribution definition and a numerical summary must agree on inclusions.

::: widget name=distributions
:::

The explorer compares a binomial PMF with its step CDF, and, in the continuous branch, a uniform PDF with its CDF. It reports P(X=t), P(X≤t) and the appropriate mass or density separately. Switching modes changes the meaning of the plotted height. A PDF value of2 for uniform(0,.5) is compatible with total mass1 and zero point probability.

::: check
Why use a generalised inverse for discrete CDFs? What does an ECDF count at a tied threshold? Does finite-precision inverse sampling exactly reproduce an ideal continuum?
:::
::: answer
Step CDFs have jumps and flat intervals rather than an ordinary inverse. The ECDF uses ≤ and includes all tied observations. A finite generator approximates the ideal continuum using a finite grid; its numerical mechanism should be labelled.
:::

## Transformations sum preimages or use an absolute Jacobian {#s5}

For Y=g(X), the event identity P(Y∈S)=P(X∈g⁻¹(S)) is the starting point. For discrete X, p_Y(y)=Σ_{x:g(x)=y}p_X(x). An injective transformation simply relabels masses, while a many-to-one transformation adds every preimage. Output support is the image of the original positive-mass support, not every number at which a formula can be evaluated. A transformed variable can have fewer possible values and remains dependent on the original variable.

$$p_Y(y)=\sum_{x:g(x)=y}p_X(x).$$

::: worked title="Squaring discrete values combines both signs"
Let X take −2,−1,1,2, each with mass1/4. For Y=X², both ±1 map to1 and both ±2 map to4, giving p_Y(1)=p_Y(4)=1/2. Keeping just the positive preimages yields total mass1/2 and is wrong. The CDF is0 below1,1/2 on[1,4), and1 from4 onward. This discrete transformation is the CS alternative to the continuous Jacobian calculation.
:::

**Continuous AI branch:** if g is a differentiable strictly monotone transformation with differentiable inverse on the relevant interval, then f_Y(y)=f_X(g⁻¹(y)) |(g⁻¹)′(y)| on the transformed support. Derive it from the CDF: for increasing g, F_Y(y)=F_X(g⁻¹(y)), so chain differentiation gives the inverse derivative. For decreasing g, the event becomes X≥g⁻¹(y); with no point mass, the complementary CDF gives the negative derivative. The absolute value unifies both cases and ensures nonnegative density.

$$f_Y(y)=f_X\!\left(g^{-1}(y)\right)\left|\frac{d}{dy}g^{-1}(y)\right|.$$

For Y=cX+d with c≠0, f_Y(y)=f_X((y−d)/c)/|c|. The reciprocal factor balances the expansion or compression of interval lengths. X uniform(0,1) and Y=2X therefore has density1/2 on(0,2). Omitting1/2 yields total mass2. If c=0, Y is a point mass at d and this density formula does not apply; dividing by zero cannot represent a degenerate distribution. A Jacobian is about coordinate volume, not a change in total probability.

When g is not one-to-one, split its monotone branches and sum their inverse contributions, taking care with support and exceptional critical points. For X uniform(−1,1), Y=X² has F_Y(y)=P(−√y≤X≤√y)=√y for0≤y≤1. Differentiating on0<y<1 gives f_Y(y)=1/(2√y). The two branches ±√y each contribute1/(4√y); omitting one loses half the mass. The singular density near0 is integrable: ∫_0^1 1/(2√y)dy=1, and P(Y=0)=0.

This CDF-first derivation is often safer than memorising a single inverse formula. Outside the transformed support, probability and density are zero; at exceptional points one may need a separate atom or special treatment. A transformation that collapses a positive-probability interval to one value produces an atom, so not every transformation of an absolutely continuous variable stays absolutely continuous. For example max(X,0) for uniform(−1,1) has an atom of1/2 at0 and density1/2 on(0,1).

Check units as well as normalisation. If X measures seconds and Y=1000X milliseconds, the numeric density height shrinks by1000 because its units become inverse milliseconds; interval probabilities remain identical after unit conversion. Density values used as continuous likelihoods therefore depend on the observation unit. Likelihood ratios for two models transformed consistently share and cancel that coordinate factor, while comparing raw heights across inconsistent units is meaningless. Later estimation separates these density-based likelihoods from actual point probabilities.

::: figure #fig-22-3
An affine stretch needs a reciprocal density factor. A squared variable needs both inverse branches; a high integrable density near zero is not a point mass.
:::

::: check
What combines a discrete many-to-one transform? Why is the continuous inverse derivative absolute? Does a continuous input always produce a continuous output distribution?
:::
::: answer
Sum every original mass mapping to the same output. Decreasing transforms reverse derivative signs but densities must stay nonnegative. Collapsing an interval of positive probability produces an atom, so the output can be mixed.
:::

## Model choice support conventions and implementation contracts {#s6}

Choose a family from a plausible data-generating story and check its support. A Bernoulli represents one binary event, a categorical variable one label, a binomial count fixed independent trials, a geometric count first success under stable repeated trials, and a Poisson count a specified rate mechanism. Continuous waiting times can use an exponential model under its memorylessness assumption; Gaussian or Laplace errors need an appropriate location, scale and tail story. Matching a plotted curve or knowing that a quantity is “random” does not supply these assumptions.

Support errors are often easier to detect than fitting errors. A trials-to-success variable cannot be0 under the stated convention; a failures-to-success variable can. An exact Poisson count is nonnegative and integer-valued, whereas a Gaussian permits negative and noninteger values. A Gaussian can sometimes be a useful count approximation in an appropriate regime, but then approximation error and boundary handling need separate justification. A uniform interval requires its endpoints in increasing order; an exponential rate and Gaussian standard deviation must be positive.

::: worked title="The normalising factor can depend on an unknown parameter"
For Uniform(0,θ), θ>0, density at an observed x is (1/θ)1{0<x<θ}, ignoring irrelevant point-version choices at endpoints. Both support and height depend on θ. Dropping1/θ does not preserve the distribution or its likelihood as θ varies, and assigning positive density to x>θ contradicts the model. This example previews why a factor constant in x may still matter when a later calculation changes the parameter rather than the observation.
:::

A probability implementation should state parameter units and names: rate versus scale, variance versus standard deviation, and geometric trials versus failures. Validate nonnegative categorical weights and a positive total before normalising; reject empty tables and invalid parameters. Verify finite distribution sums exactly when possible, and report tails for infinite prefixes. A small numerical normalisation error is different from a large missing branch, negative mass or wrong support. Explain the intended mathematical quantity before applying a numerical repair.

When probability is reported through a numerical CDF difference, cancellation can reduce accuracy for extremely short intervals or far tails. A dedicated survival-function calculation can represent a tail more accurately than subtracting a rounded near-one CDF from one. This arithmetic issue changes how a formula is evaluated, while the event identity remains the same. Record the threshold, inclusion convention and numerical method so a reported zero tail is not mistaken for a mathematically impossible event.

Labs use standard-library exact fractions for finite masses and local seeds for samples. Their outputs clearly label CS and continuous AI sections. CS learners inspect the discrete portions only and replace continuous practice with their preimage/CDF alternatives; AI learners use Module17 to derive and verify the displayed integrals. The simulations compare empirical CDFs at a few thresholds and make no unproved all-threshold accuracy promise. Generated Gaussian and exponential samples are numerical draws, not an exact continuum representation.

::: figure #fig-22-4
Model selection follows mechanism, support and parameter convention. A familiar family name does not replace an independence or constant-rate assumption.
:::

For learning objectives, discrete observation likelihoods use PMF values, while absolutely continuous observation likelihoods use PDF values under a chosen coordinate reference. A continuous density at a specific x is not the event probability P(X=x). Products over records also need their sampling factorisation assumptions. Module25 derives estimators and losses from these distinctions. Before then, your complete result is a derived distribution, a correctly included event probability, and a transformation whose total mass and support survive scrutiny.

::: check
Does a count automatically imply Poisson? Which parameters must be positive in exponential and nondegenerate Gaussian models? Can a factor constant in x be ignored when θ varies?
:::
::: answer
No, a count still needs a generating assumption. Exponential rate and Gaussian standard deviation must be positive. The uniform1/θ factor is constant in x but changes with θ, so it matters for parameter-dependent likelihoods.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| A random variable is the number already observed. | It is a map; the number is a realisation. |
| Possible numerical values are automatically uniform. | Combine the masses of their preimages. |
| A PDF value is a point probability. | Integrate densities; continuous points have zero mass. |
| Every distribution has an ordinary PDF. | Discrete and mixed distributions retain atoms. |
| A CDF excludes its endpoint. | F(t)=P(X≤t) includes every atom at t. |
| Geometric support always starts at zero. | Specify failures versus trials. |
| One inverse branch is enough for squaring. | Both signs can contribute. |
| Familiar shape proves a distributional mechanism. | State support, independence, rates and parameter conventions. |

## Three reproducible labs {#labs}

### Lab 1 · Discrete PMFs CDFs and infinite tails {#lab1}

{{LAB:lab1}}

Predict the exact binomial tail, geometric omitted mass and Poisson prefix behaviour. Explain why finite binomial normalisation and an infinite Poisson prefix need different checks.

### Lab 2 · Samples and empirical CDFs {#lab2}

{{LAB:lab2}}

CS learners inspect the geometric section and its quantile; AI learners also derive exponential and Gaussian CDF references with Module17. Explain the ≤ convention, local seed and finite-trace limitation. Derive a discrete inverse sampler rather than spend CS study time on continuous formulas.

### Lab 3 · Transformation and support faults {#lab3}

{{LAB:lab3}}

The discrete branch sums square-map preimages and checks waiting/count supports. The continuous branch, requiring Module17, repairs the missing affine factor and omitted inverse branch, then distinguishes density2 from probability. Every output is captured from the displayed downloadable code.

## Fourteen exercises with full solutions {#exercises}

Exercises 1–12 are required; branch alternatives occupy the same time. Optional Exercises 13–14 add35 minutes beyond the ten-hour core schedule.

::: exercise #e1 level=1 kind=calculation minutes=6
For fair two-coin head count, give p(1), F(1), F(1−) and P(0<X≤1).
:::
::: solution
p(1)=1/2, F(1)=3/4, F(1−)=1/4 and interval mass F(1)−F(0)=1/2. The endpoint atom explains the different CDF limits.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
For binomial n=5,p=.4, give P(X≥3) and its CDF complement.
:::
::: solution
The tail is992/3125=.31744, equivalently1−F(2). Using1−F(3) would omit the mass at3. The formula assumes independent equal-rate trials.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
For geometric trial count p=1/4, give P(T=1), P(T>3) and P(T≤3). What changes for failures G?
:::
::: solution
Values are1/4,27/64 and37/64. Failures G=T−1 start at0, so P(G=0)=1/4 and thresholds shift by one. The convention must accompany every probability.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
CS: transform equally likely values−2,−1,1,2 by squaring. AI alternative: X uniform(0,.5); give density and probability at .25.
:::
::: solution
CS: Y has values1,4 each mass1/2 because both signs contribute. AI: density2 on the interval but P(X=.25)=0. Both answers separate representation from probability at an output.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove the CDF jump equals the point mass and derive P(a<X≤b).
:::
::: solution
Increasing events approaching{X<t} give F(t−)=P(X<t). Disjoint{X≤t}={X<t}∪{X=t} gives the jump. Disjoint{X≤b}={X≤a}∪{a<X≤b} gives the interval difference. These hold for mixed models too.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Derive binomial masses from trial patterns and justify their normalisation.
:::
::: solution
Independence and common p give each pattern with k successes mass p^k(1−p)^{n−k}. There are comb(n,k) disjoint patterns. Summing all count events covers every trial pattern, total1, equivalently the binomial theorem. Handle degenerate endpoints directly.
:::

::: exercise #e7 level=2 kind=proof minutes=14
CS: prove the discrete transformation preimage formula and its normalisation. AI alternative: derive the density factor for an increasing invertible transform.
:::
::: solution
CS: disjoint events{X=x} mapping to y sum to P(Y=y); grouping every input once preserves total1. AI: F_Y(y)=F_X(g⁻¹(y)), then chain differentiation gives f_X(g⁻¹(y))(g⁻¹)′(y). A decreasing transform requires the opposite sign, giving the absolute derivative.
:::

::: exercise #e8 level=2 kind=application minutes=10
For the head-count distribution, compute Q(.2), Q(.25), Q(.5), Q(.9) under the generalised inverse and give sampling intervals.
:::
::: solution
Values0,0,1,2 respectively. Uniform inputs in(0,.25] return0, (.25,.75] return1, (.75,1) return2. Their lengths match the PMF; mathematical quantiles here use0<u<1.
:::

::: exercise #e9 level=2 kind=application minutes=10
CS: for observations1,1,3,4, compute ECDF at1 and2. AI alternative: if X uniform(0,1), derive Y=2X's support, density and CDF.
:::
::: solution
CS: both ECDF values are2/4=.5; the tie at1 is included. AI: support(0,2), density1/2 there; CDF0 for y≤0, y/2 for0<y<2,1 for y≥2. Integrating gives1, while a density1 would give2.
:::

::: exercise #e10 level=2 kind=application minutes=10
Choose and justify a model for success count in ten independent fixed-p attempts, and for trials to first success with the same mechanism. State supports.
:::
::: solution
The fixed count is Binomial(10,p) on0,…,10. First-success trials are Geometric(p) on1,2,… for0<p≤1. A changing success rate or dependent attempts breaks these assumptions; the observation being a count does not choose the model by itself.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
An implementation renormalises a Poisson prefix and treats a trials-to-success zero as valid. Repair both.
:::
::: solution
The prefix omits tail probability; renormalising gives the conditional truncated distribution, not the original Poisson. Trials support starts at1, while failures can start at0. State the target, missing mass and waiting convention.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
CS: a square transform retains only positive preimages. AI alternative: Uniform(−1,1) squared uses only the positive inverse branch. Diagnose normalisation.
:::
::: solution
CS: the stated fault keeps only+1,+2, so total is1/2; add the negative preimages to obtain masses1/2 at1 and4. AI: each branch contributes1/(4√y) on(0,1); both give1/(2√y), integral1. Omitting a branch integrates to1/2. There is no atom at0.
:::

::: exercise #e13 level=3 kind=extension minutes=15
CS: derive geometric memorylessness from its tail. AI alternative: derive exponential memorylessness and identify the conditioning requirement.
:::
::: solution
CS: P(T>m+n|T>m)=(1−p)^{m+n}/(1−p)^m=(1−p)^n for positive denominator. AI: exp(−λ(s+t))/exp(−λs)=exp(−λt) for s,t≥0,λ>0. These are specific model identities, not universal waiting-time properties.
:::

::: exercise #e14 level=3 kind=extension minutes=20
CS: X has masses−1:1/4,0:1/4,1:1/2. Derive Y=max(X,0). AI alternative: derive the mixed law for max(X,0) with X uniform(−1,1).
:::
::: solution
CS: Y=0 collects two masses, total1/2; Y=1 has1/2. AI: negative half interval maps to an atom1/2 at0; positive interval retains density1/2 on(0,1). CDF0 below0,1/2 at0, then(1+y)/2 inside,1 above. The continuous density alone integrates to1/2, so retaining the atom is essential.
:::

## Ten-question self-check {#quiz}

```quiz
? What is a random variable before the experiment is realised?
- [x] A function from outcomes to values
- [ ] Only a number already observed
- [ ] Automatically a uniform numerical value
> The map defines events through preimages; a realised value is an observation.

? Which endpoint does a CDF include?
- [ ] It always excludes t
- [x] F(t)=P(X≤t)
- [ ] It includes only continuous values
> At an atom the distinction changes the probability; the CDF is right-continuous.

? What defines a binomial generating story?
- [ ] Every integer count
- [ ] Any sample without replacement
- [x] Fixed n independent equal-p Bernoulli trials
> Support and count labels alone do not supply independence or equal rates.

? Where does geometric trials-to-success support start?
- [x] One
- [ ] Zero under every convention
- [ ] A negative value
> Failures-to-success starts at zero; it is a shifted convention.

? How is a discrete many-to-one transformation computed?
- [ ] Keep one preimage
- [x] Sum masses from all preimages
- [ ] Give every output equal mass
> Grouping preserves total probability only when every original outcome mass is included.

? What describes a distribution even if it is mixed?
- [ ] Always one ordinary PDF
- [ ] Always a finite PMF
- [x] Its CDF
> The CDF retains both atom jumps and continuous growth; a partial density can omit mass.

? Which CDF complement gives binomial P(X≥3)?
- [x] 1−F(2)
- [ ] 1−F(3)
- [ ] F(3) always
> Integer support makes the strict-lower complement stop at2;1−F(3) excludes3.

? What does the empirical CDF at a tied observation count?
- [ ] Only observations strictly smaller
- [x] All observations less than or equal to the threshold
- [ ] A continuous smooth curve necessarily
> Finite ECDFs have steps and combine duplicate observations into larger jumps.

? What does a named distribution still require?
- [ ] Only a visually similar histogram
- [ ] No support or parameter convention
- [x] A defensible mechanism, support and parameter assumptions
> Exact models and approximations must state the assumptions connecting them to the experiment.
```

<div class="free-response" data-free-response data-key="math-series:m22:q10">
<label for="q10-response">10. CS: derive the square-transformed PMF for equally likely−2,−1,1,2 and its CDF, then specify inverse-sampling intervals. AI alternative: derive Uniform(−1,1) squared through its CDF and both inverse branches, checking support, normalisation and point mass at zero.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State the route, preimages or absolute inverse derivatives, endpoint convention and total mass."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I preserved all preimages, total probability and the correct mass or density interpretation.</label>
</div>

::: answer
CS: values1,4 each mass1/2, CDF0 below1,1/2 on[1,4),1 at4 and above; uniforms in(0,.5] map to1 and(.5,1) to4. AI: F_Y(y)=√y on[0,1], with0 below and1 above. Each branch contributes1/(4√y), sum1/(2√y) on(0,1), integral1. P(Y=0)=0 despite the singular density; endpoints and support are retained.
:::

## Reading with a purpose {#reading}

Use random-variable and distribution materials in [MIT 6.041SC](https://ocw.mit.edu/courses/6-041sc-probabilistic-systems-analysis-and-applied-probability-fall-2013/) and probability selections in the authors' [Mathematics for Machine Learning companion](https://mml-book.com/). The continuous branch uses Module17; CS readers select discrete PMFs, CDFs and transforms.

| When | Selection and question |
|---|---|
| Session1 · 15 minutes | Random variables and discrete families: which preimages and assumptions create each mass? |
| Session4 · 15 minutes | CDFs and transformations: what support, endpoint and coordinate factor must survive? |

## Retrieval exit task and next step {#summary}

Distinguish outcome, map and realisation; derive one PMF; compute events with CDF endpoint conventions; specify a quantile sampler and a many-to-one transformation. AI learners additionally check density integrals and absolute inverse factors.

**Exit task:** derive the binomial tail992/3125, geometric trial quantile at .5 equal3, and a square-map distribution with both signs included. Explain which mathematical type each reported height represents.

**Ready to move on:** you can choose and transform distributions with stated assumptions. Expectation and joint models next connect these probabilities to average costs, variation and dependence. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| X / x / preimage | Outcome map / realisation / inputs giving an output event | 随机变量、实现、原像 |
| PMF / PDF / CDF | Point mass / continuous density / cumulative probability | 质量、密度、分布函数 |
| Support / atom | Supported values / positive point mass | 支持、原子 |
| Rate / scale / σ² | Inverse-time parameter / reciprocal rate / variance parameter | 率、尺度、方差参数 |
| Q(u) / ECDF | Generalised quantile / empirical cumulative distribution | 广义分位数、经验分布函数 |
| Jacobian / branch | Coordinate volume factor / separate inverse piece | Jacobian、逆分支 |
| Mixed distribution | Point masses and a continuous component | 混合分布 |
