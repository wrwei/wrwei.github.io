## 1. Learning targets, hypothesis classes, and splits {#s1}

A learning algorithm receives observations and produces a predictor. To evaluate the predictor mathematically, specify an input space, an output space, a loss, and a distribution P over examples Z=(X,Y). A hypothesis class H is a set of allowed prediction rules. Population risk R_P(h)=E_P ℓ(h;Z) measures expected loss on a new draw from P. Empirical risk R_hat_S(h) averages loss on the observed sample S of size n. These are different quantities even when the same loss formula appears in both.

The sample model matters as much as the algorithm. In this chapter's finite-class concentration argument, the n observations are independent draws from the same P, the candidate rules are fixed before those observations, and each loss lies in [0,1]. Zero-one classification error satisfies that range. Squared error and negative log-likelihood do not generally satisfy it. One cannot substitute an unbounded loss into the same Hoeffding formula without additional assumptions or a declared transformation of the evaluated quantity.

A predictor can be random because training data and optimiser randomness are random. Once it is fixed independently of a fresh test sample, condition on its training history and analyse test loss using the fixed-predictor law. The test estimate then describes its risk under the test-generating distribution. It does not automatically assess a future distribution with different labels, prevalence, inputs, or collection processes. Independence refers to the sampling units; copied images, shared patients, or repeated records can invalidate a row-count argument.

Training fits parameters and transformations. Validation selects such choices as penalties, widths, component counts and stopping times. Final test data estimate the risk of the frozen result. Calling a repeatedly inspected dataset "test" does not preserve its independence from model choice. Choosing a threshold, feature transformation or reporting rule using test outcomes is also selection. Establish a complete evaluation protocol, including the metric and threshold, before inspecting the final labels. A new test claim requires a fresh evaluation or a justified procedure accounting for adaptation.

Empirical risk minimisation chooses an element whose sample risk is smallest in H. It does not say that training risk equals population risk or that the class contains the best possible predictor. A finite class can impose useful inductive structure, while an excessively flexible class can match accidental training patterns. Distinguish approximation limitations of the class, sample variation of its estimates, and optimisation error when the algorithm does not find the empirical minimum. These limitations require different mathematical and experimental evidence.

::: worked title="A selected validation winner at chance"
Let X have M independent fair-bit coordinates and Y be an independent fair bit. Define fixed h_j(X)=X_j. Every candidate has population accuracy .5. Validation accuracies fluctuate, so their maximum rises as M grows. Lab 1 samples the exact count law: for M=200, the mean selected validation accuracy is about .637, while an independent test average stays near .5. Selection discovers favourable noise here, rather than a predictive relation.
:::

The candidate rules in this example are predeclared, and their random validation scores are not new independently trained models with unspecified populations. If a collection of trained candidates was produced using separate training data, condition on that training data and apply validation bounds to its fixed candidate set. If candidates were constructed after seeing the very sample being bounded, merely counting the final shortlist is not enough. One must control the larger search or its data dependence; a printed M does not resolve that obligation.

Conditioning on a training history is useful because it makes a precise independence claim. The pool can depend arbitrarily on training labels while the fresh validation rows retain their IID distribution. The conditional failure probability is then bounded for every eligible training history; averaging over those histories preserves the bound. Conversely, if a candidate uses validation labels in preprocessing or target encoding, the pool is no longer fixed under this conditioning. A technical split name cannot override the information actually used by the algorithm. Trace dependencies in the full fitting procedure, including transformations and human selection decisions.

::: check
Can the finite-class [0,1] bound below be applied unchanged to log-loss selected on its own evaluation sample?
:::
::: answer
No. Log-loss is unbounded without further restrictions, and data-dependent candidate construction needs justification. State a suitable loss range/model and an independent selection or uniform-control argument.
:::

::: figure #fig-30-1
Selection and estimation have different roles; the final frozen predictor needs independent evaluation.
:::

## 2. From a fixed-model bound to uniform convergence {#s2}

For a fixed h and IID bounded losses, the two-sided Hoeffding bound gives P(|R_hat(h)−R(h)|≥ε)≤2 exp(−2nε²). This named concentration result was introduced with its assumptions in Module 24. It controls one predeclared predictor, not an arbitrarily chosen winner after examining the sample. A union bound can turn it into a simultaneous statement over a finite predeclared class without assuming different models' loss estimates are independent of one another.

Let H contain M rules. For each rule define the bad event that its empirical risk differs from population risk by at least ε. If any rule is bad, the union of these M events occurs. Subadditivity bounds its probability by the sum of their probabilities, at most 2M exp(−2nε²). Set this expression to δ and solve for ε. With probability at least 1−δ, every rule satisfies |R_hat(h)−R(h)|≤sqrt(log(2M/δ)/(2n)). Natural logarithms appear because the exponential bound uses e.

$$\Pr\!\left(\sup_{h\in H}|\hat R_S(h)-R_P(h)|\ge\epsilon\right)\le 2M e^{-2n\epsilon^2},\qquad \epsilon_\delta=\sqrt{\frac{\log(2M/\delta)}{2n}}.$$

Now let h_hat minimise empirical risk and h_star minimise population risk in the finite class. On the simultaneous good event, R(h_hat)≤R_hat(h_hat)+ε≤R_hat(h_star)+ε≤R(h_star)+2ε. The middle step is exactly the ERM property. If optimisation is within τ of the empirical minimum, add τ to this upper bound. The guarantee compares with the best member of H, rather than with an arbitrary population-optimal rule outside it. A bound on estimation error does not remove approximation error.

The simultaneity is what permits the selected h_hat to depend on S: all members were controlled before the algorithm chose among them. It does not permit changing H after observing S without another argument. The sample size n must count independent examples from the declared population, and M must count the controlled class or independently constructed candidate pool. Correlation between model scores causes no difficulty for the union step; correlation between sample rows violates the fixed-model Hoeffding premise.

::: worked title="A sufficient radius and sample count"
For M=20, n=1000 and δ=.05, log(2M/δ)=log800, giving radius approximately .057813. To make this radius at most .05, n must be at least ceil(log800/(2×.05²))=1337. This is a sufficient worst-case bound. It does not claim that exactly 1337 rows are necessary or that actual error equals .05. ERM's excess-risk conclusion uses twice the radius, so an excess target requires a different calculation.
:::

A radius exceeding one can be truncated to one for the difference of [0,1] risks, but this supplies no useful discrimination between models. A large loose bound is neither proof that learning fails nor evidence of a precise required practical dataset size. Report the theorem's target event, loss range and confidence alongside its number. Confidence refers to repeated sample probability; it is not posterior probability assigned to a realised fixed unknown risk unless a Bayesian model is separately specified.

For bounded loss in [a,b], divide by its range to apply the unit-range theorem, then multiply the radius by b−a. A constant loss with b=a has no sampling error. If a probability model is restricted so every realised true-label probability is at least q_min>0, its NLL lies between zero and −log q_min, giving a different range factor. Enforcing that restriction or clipping scores changes the evaluated model or loss and must be disclosed. Without it, a confident wrong prediction can produce arbitrarily large NLL, so a classification-error guarantee cannot be reused as a log-loss guarantee.

For a countable class, one can assign predeclared positive weights π_h summing to one and give each rule failure budget δπ_h. Union bounding yields rule-specific radii involving log(2/(δπ_h)). This illustrates how a declared complexity preference affects a simultaneous guarantee. We do not derive general infinite-class results here. Simply replacing M by an informal number of parameters is unjustified, and discretising a continuous class requires an approximation argument connecting grid rules to off-grid risks.

::: check
Why does the union bound not need independence between the M model scores, and why does it still need IID examples?
:::
::: answer
Event subadditivity is valid for dependent model events. IID examples enter each model's Hoeffding bound; the union step cannot repair a false premise for those individual bounds.
:::

## 3. Squared-loss bias, variance, and irreducible noise {#s3}

Bias–variance decomposition is a different statement from a concentration bound. Fix an input x and let the fitted prediction f_hat_D(x) vary over random training data D, including optimiser randomness if specified. Let a fresh label satisfy Y=f_star(x)+ε, with conditional mean-zero noise and variance σ²(x), independent of the fitting history at this x. Define m(x)=E_D f_hat_D(x), bias m(x)−f_star(x), and variance E_D(f_hat_D(x)−m(x))². These expectations must exist.

Expand f_hat_D−Y=(f_hat_D−m)+(m−f_star)−ε. Taking the expectation of its square leaves the three squared terms. The cross term between f_hat_D−m and the fixed bias vanishes by centring. Noise cross terms vanish through conditional mean zero and independence from D. Therefore expected fresh squared error equals prediction variance plus squared bias plus σ²(x). Integrating over a specified input distribution gives a population decomposition if the required moments are integrable.

$$\mathbb E_{D,Y|x}(\hat f_D(x)-Y)^2=\operatorname{Var}_D(\hat f_D(x))+(\mathbb E_D\hat f_D(x)-f_*(x))^2+\sigma^2(x).$$

This is an exact identity under the stated model, not a theorem that model size monotonically increases variance or that a particular regulariser always improves total risk. A penalty changes the fitted prediction's distribution and can reduce variance while increasing bias. Different sample sizes, noise levels, algorithms and classes can change both. A flexible interpolating model can behave well or badly depending on structure. Training error alone does not identify these population components, and one split cannot directly measure a training-distribution expectation.

Optimiser seed variation conditional on a fixed training dataset measures only the variability due to that algorithmic randomness. Across new training datasets, additional sampling variation appears. The law of total variance separates E_D Var_seed(f_hat|D) from Var_D E_seed(f_hat|D). Repeating seeds on one dataset cannot establish the second term, and repeating dependent splits does not create independent future observations. Distinguish uncertainty about the evaluation sample from variability of the fitting procedure.

::: worked title="A scalar shrinkage trade-off"
Suppose an unbiased training estimate T has mean θ and variance v. Use prediction aT with fixed a. Its bias is (a−1)θ and variance a²v. A fresh label has noise variance σ², so risk is (a−1)²θ²+a²v+σ². For θ=1,v=.25, shrinkage a=.8 gives .04+.16=.20 before fresh noise, versus .25 at a=1. At θ=4 the same shrinkage contributes .64+.16=.80 and is worse. The penalty's benefit depends on the problem.
:::

The identity is specific to squared error and a squared-distance target. Classification error and log-loss have different geometry; do not relabel their observed errors as the same bias and variance components. For Bernoulli log-loss, Module 27 instead relates expected NLL to entropy plus a KL mismatch, where support and the conditional prediction distribution matter. Distinguish an identity of risk from a confidence statement about estimating it and from an optimisation statement about reducing training loss.

A polynomial interpolation example is a useful diagnostic. Nine equally spaced observations can determine a degree-eight polynomial with essentially zero training residual, while between those points the fit oscillates. Lab 3 compares it with degree two against a known smooth function on a dense deterministic grid. The higher degree has lower training error but larger grid error in this example. The grid calculation is approximation evidence for that function and domain, rather than an IID confidence estimate or a universal verdict on high-degree models.

The target conditional mean f_star minimises expected squared error pointwise: for any fixed prediction a, E[(a−Y)²|x]=(a−f_star(x))²+σ²(x). This follows by the same centred-noise expansion without training randomness. A hypothesis class may be unable to represent that mean, creating approximation error even with infinite data and perfect optimisation. Choosing a model is therefore not solely a contest between empirical fit and an estimation radius. State which target the class approximates and whether the loss expresses the application's cost before interpreting a capacity trade-off.

::: check
Does running ten optimiser seeds on one dataset measure the full training-data variance in the decomposition?
:::
::: answer
No. It probes conditional algorithmic variation. Random training datasets contribute another variance term, and fresh-label noise is separate again.
:::

## 4. Capacity, VC intuition, and distribution shift {#s4}

Cardinality is a convenient capacity measure for finite H, but many useful classes have infinitely many parameter values. For binary predictions, a class shatters a finite input set if it can realise every possible binary labelling of those points. Its VC dimension is the largest size of a shattered set, or infinite if no finite maximum exists. This definition concerns representable patterns, not successful optimisation, observed training accuracy, or the raw number of numerical parameters.

Consider thresholds h_t(x)=1 if x≥t and zero otherwise, with fixed orientation. Any single real point can receive either label by placing t below or above it, so one point is shattered. For any two ordered points x1<x2, the labels (1,0) are impossible: assigning one to x1 requires t≤x1, which also assigns one to x2. Thus no two-point set is shattered and this class has VC dimension one, despite its infinitely many possible thresholds. This complete example explains why infinite cardinality need not prevent learnability.

VC-based uniform convergence results require more machinery and are named here rather than proved. Their statements include a sample model, a loss setting, and confidence/complexity terms. For modern large networks, a crude parameter-count bound can be extremely loose; useful analysis may involve norm constraints, margins, stability, compression or data-dependent complexity. This introductory module does not establish a universal explanation for neural-network generalisation. Do not convert a suggestive capacity narrative into a theorem outside the conditions actually proved.

Distribution shift changes the population being evaluated. Under source P and target Q, risks are R_P(h) and R_Q(h), which can differ even for a perfectly measured fixed predictor. Covariate shift refers to a changed input distribution with the label-given-input law preserved; label or concept changes alter other parts of the joint law. Such distinctions are modelling assumptions to investigate, not something a successful source test automatically confirms. Source confidence intervals quantify sampling variability under P, rather than bound every future Q.

If Q is absolutely continuous relative to P, importance weighting can express target risk as E_P[w(Z)ℓ(h;Z)] with density ratio w=dQ/dP. Missing source support prevents this direct representation. Even where it is possible, weights may be large, unknown or estimated; their range and variance change the concentration problem. Under covariate shift with a preserved conditional law, an input-density ratio suffices, but an incorrect shift assumption invalidates the correction. A formula is not evidence that weights can be estimated accurately from limited data.

::: worked title="Perfect source performance, failed target performance"
Take X equally likely −1 and 1. In source data Y=1 exactly when X=1, so h(X)=1[X>0] has accuracy one. In target data retain the same X law but reverse the labels, giving accuracy zero. No number of source IID examples bounds that new mechanism using the source Hoeffding statement. The failure is a changed mathematical target, rather than a contradiction of concentration.
:::

Class prevalence can change the meaning of accuracy even without a dramatic feature example. An always-zero predictor has accuracy .95 when class-one prevalence is .05 and .05 when it is .95. Conditional sensitivity and specificity, probability calibration, log-loss, and the chosen decision cost answer different questions. Report the population and metric needed by the application. A metric can be calculated exactly on a finite dataset while still being a misleading summary of the intended deployment task.

::: check
Why is an infinite threshold class compatible with a finite capacity example, and why does this not guarantee success after label shift?
:::
::: answer
Its representable binary patterns have VC dimension one despite continuous thresholds. Capacity statements under a source law do not preserve the source label mechanism in a changed target law.
:::

## 5. Feature maps, PSD kernels, and kernel ridge {#s5}

A feature map φ sends an input to a vector in an inner-product space. Define k(x,z)=φ(x)ᵀφ(z). For any finite inputs x_i, their Gram matrix K_ij=k(x_i,x_j) is symmetric. For any coefficient vector c, cᵀKc=||Σ c_iφ(x_i)||²≥0, so it is positive semidefinite. A valid real kernel must have this property for every finite input set. A numerically PSD matrix on one dataset checks that set, not all possible inputs of an arbitrary proposed similarity function.

Take the two-dimensional map φ(t)=(1,t). Its kernel is 1+st. At inputs 0,1,−1 the Gram matrix has rows (1,1,1), (1,2,0), (1,0,2), with eigenvalues 0,2,3. A zero mode is allowed: PSD does not require positive definiteness. Symmetry and positive diagonal entries alone are insufficient. The matrix with diagonal one and off-diagonal two has eigenvalues three and minus one; c=(1,−1) gives cᵀKc=−2, an exact certificate of failure.

The one-dimensional RBF kernel exp(−(s−t)²/(2ℓ²)), ℓ>0, is also PSD. Factor it into exp(−s²/(2ℓ²))exp(−t²/(2ℓ²))exp(st/ℓ²), and expand the last exponential. Each term is a positive coefficient times a product of an s-only and a t-only feature. For finitely many inputs, the quadratic form is a convergent sum of squares, hence nonnegative. This proves the scalar kernel used in Lab 2; vector versions use analogous feature arguments. The length parameter declares an input scale and must be selected without test leakage.

For a finite-dimensional feature ridge problem, minimise mean half-squared error plus λ||w||²/2 with λ>0. Decompose w into the span of training feature vectors and its orthogonal complement. The complement cannot change training predictions and only adds squared penalty, so an optimum lies in the span: w=Σα_iφ(x_i). Substitution gives the coefficient objective ||Kα−y||²/(2n)+λαᵀKα/2. This span argument motivates kernel computation; general infinite-space representer results require an appropriate Hilbert-space setting.

Differentiate to obtain K(Kα−y)/n+λKα=0. A sufficient solution is (K+nλI)α=y. Since K is PSD and λ>0, this shifted matrix is positive definite and invertible, even when K is singular. Coefficients minimising the original coefficient objective can differ in K's nullspace, but their represented feature vector and predictions coincide. Use a solve rather than explicit inverse. New prediction is k_xᵀα, where k_x contains similarities to the training inputs; all preprocessing and scale choices belong to the fitted model.

$$\alpha=(K+n\lambda I)^{-1}y,\qquad \hat f(x)=k_x^\top\alpha,\qquad K\succeq0,\ \lambda>0.$$

::: worked title="Two kernel-ridge observations"
Use φ(t)=(1,t) at t=−1,1, giving K=2I, n=2, and y=(−1,1). With λ=.5, K+nλI=3I, so α=(−1/3,1/3). At x=2, k_x=(−1,3) and prediction is 4/3. The unregularised linear fit predicts two; the penalised feature norm shrinks this solution. Here the constant feature is penalised too, an explicit model convention.
:::

The displayed inverse is a mathematical formula, not an instruction to form it in code. Dense kernel methods store n² entries and a generic dense solve costs order n³; an explicit small feature map can be cheaper. Kernel centring and an unpenalised intercept require their own training-fitted transformation. Lab 2 instead declares a fixed training-mean offset and fits centred residual targets, without claiming this is joint optimisation of a free intercept. A kernel's validity, numerical conditioning and population performance are three separate questions.

Kernel scaling also interacts with the penalty convention. If K is replaced by cK with c>0 and λ by cλ, the shifted system gives new coefficients α/c and predictions remain unchanged, since the new similarity vector is ck_x. Changing kernel amplitude without changing λ generally changes the fit. Likewise, changing input units without the corresponding RBF length changes similarities. Record amplitude, length, preprocessing and mean-versus-sum reduction as parts of the model. Comparing only a printed penalty number across different kernel scales does not compare equal regularisation strength.

::: figure #fig-30-2
A feature-map Gram matrix is PSD by a sum-of-squares identity; symmetry alone is weaker.
:::

::: widget name=learning
Compare a finite-class risk radius with a small valid or indefinite Gram matrix. Change independent sample count, candidate count and confidence, then inspect exact quadratic witnesses. The sample theorem and kernel validity are separate checks; passing either does not certify deployment performance.
:::

::: check
Why is K+nλI invertible when a valid Gram matrix K has a zero eigenvalue?
:::
::: answer
Its eigenvalues are those of K plus nλ, which are strictly positive for λ>0. This repairs invertibility while implementing a declared regularised objective.
:::

## 6. Margins and a qualified SVM introduction {#s6}

For labels y_i∈{−1,1}, a linear score f(x)=wᵀφ(x)+b predicts by its sign with a declared tie convention. The signed geometric distance to its hyperplane is y_i f(x_i)/||w|| when w≠0. Multiplying w and b by a positive constant leaves the decision rule unchanged, so functional score scale alone is not a geometric margin. A hard-margin formulation chooses the scale y_i f(x_i)≥1 and minimises ||w||²/2; it requires separability in the chosen feature space.

To justify the distance, move a feature vector by a displacement d until its score becomes zero. Then wᵀd=−f(x). Cauchy–Schwarz requires ||d||≥|f(x)|/||w||, and equality is achieved by displacement −f(x)w/||w||². The margin is this perpendicular feature-space distance with the label sign. It is not necessarily a distance in the raw input domain after a nonlinear feature map. At w=0 the formula is undefined; feasibility and slack can still be discussed through scores without inventing a geometric distance.

Nonseparable observations, including opposite labels at the same feature vector, make hard-margin constraints infeasible. Soft margin introduces ξ_i≥0 and requires y_i f(x_i)≥1−ξ_i, minimising ||w||²/2+CΣξ_i for C>0. Fix w,b and minimise over ξ: each equals max(0,1−y_i f(x_i)), the hinge loss. This gives an unconstrained convex objective with a norm penalty and a loss convention. Multiplying by 1/(nC) connects it to mean hinge loss plus λ||w||²/2 with λ=1/(nC).

This constrained introduction is self-contained for the AI route without Module 20. The full duality extension uses Lagrange multipliers α_i≥0 for margin constraints and μ_i≥0 for ξ_i≥0. Stationarity gives w=Σα_i y_iφ(x_i), Σα_i y_i=0 from the free intercept, and C−α_i−μ_i=0, hence 0≤α_i≤C. Substitution yields the dual maximisation Σα_i−(1/2)Σ_i,j α_iα_j y_i y_j K_ij with that box constraint and intercept equality.

Convexity and a strictly feasible soft-margin point, such as w=0,b=0,ξ_i=2, support strong duality under the standard Slater result from Module 20. The PSD kernel makes the dual quadratic concave. Complementary slackness explains support vectors and margin activity, but this paragraph is not a derivation of an implemented SVM solver. Lab 2 implements kernel ridge. Kernelising the SVM dual changes the feature representation, while its training margin still does not by itself prove a finite-class guarantee for an unrestricted infinite model class.

A useful final report connects the predictor's mathematical class, objective, optimisation, numerical implementation and evaluation. State whether a theorem is proved here, a named result used under assumptions, an exact finite calculation, or a diagnostic experiment. When a bound is loose, explain its sufficient nature. When a model overfits, identify the selection or approximation mechanism rather than infer a universal rule from one plot. The capstones next ask you to defend these distinctions in complete executable projects.

Comparative evaluation should preserve paired observations: two frozen predictors scored on the same independent test examples produce a per-example loss difference, whose variance depends on their covariance. Reporting two separate standard errors and assuming independence can misdescribe their difference. For bounded differences, rescale the actual difference range before concentration; for a bootstrap, resample independent example pairs together. This uses Module 26's experimental-unit discipline. The same principle applies when comparing a kernel model with a baseline: the shared test inputs support a paired comparison, while repeated tuning on those outcomes would turn the comparison into another selection stage.

::: worked title="Soft margin on two separable points"
Take raw one-dimensional features −1 and 1 with matching labels −1 and 1. Hard-margin constraints give w−b≥1 and w+b≥1, hence w≥1+|b|; minimum norm occurs at w=1,b=0. For the symmetric soft problem a minimiser has b=0: averaging symmetric feasible solutions cannot increase the convex objective. For w≥0, minimise .5w²+2C max(0,1−w), giving w=min(1,2C). At C=.1, w=.2 and both slacks are .8, with objective .18. The functional margin changes, while the geometric distances to the zero boundary remain one for w>0.
:::

::: figure #fig-30-3
Margin scale, slack and norm penalty are explicit parts of the soft-margin model.
:::
::: figure #fig-30-4
The risk report joins sample assumptions, class control, numerical validity and a frozen target evaluation.
:::

::: check
Is a positive-diagonal symmetric similarity sufficient for a kernel SVM, and does a large training margin alone supply the finite-class bound?
:::
::: answer
No to both. Kernel validity needs PSD quadratic forms on every finite set. The finite-class theorem also requires its bounded-loss, IID and controlled-class assumptions; an unrestricted margin model needs other justified capacity arguments.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| A fixed-model confidence bound covers any selected winner. | Control selection through a valid uniform or independent evaluation argument. |
| The union bound needs independent candidate scores. | It needs valid individual event bounds, not independent events. |
| Log-loss always lies in [0,1]. | It can be arbitrarily large; state a different guarantee. |
| The radius is the actual error or a necessary sample size. | It is a sufficient worst-case bound. |
| Bias–variance always has the same formula for every loss. | Specify squared loss, target and randomness. |
| Symmetric similarity with positive diagonal is a kernel. | Prove PSD quadratic forms. |
| Source performance guarantees a changed label mechanism. | Specify and evaluate the target law. |

## Labs: selection, kernels, and failed assumptions {#labs}

### Lab A · selected optimism with known population risk {#lab1}

Use the pinned NumPy environment. Predict how the validation maximum changes with the predeclared candidate count. The exact binomial count simulation corresponds to independent fair-bit features and labels, so every rule still has population accuracy .5. Report repeat averages separately from the one-sample uniform radius.

{{LAB:lab1}}

### Lab B · a kernel-ridge solve and frozen comparison {#lab2}

Use 40/25/25 disjoint independent synthetic observations. Declare raw x units and the training-only fixed offset. Select the RBF length and mean-objective penalty on validation, then evaluate the selected model and constant baseline on test once. PSD numerical tolerances are diagnostics supporting an analytically valid kernel.

{{LAB:lab2}}

### Lab C · similarity, shift, and interpolation {#lab3}

Provide an exact indefinite quadratic witness, inspect a feature Gram's tiny rounded eigenvalue, reverse a label mechanism, and compare polynomial interpolation on a dense deterministic grid. Explain why each result challenges a different assumption.

{{LAB:lab3}}

## Exercises with complete solutions {#exercises}

::: exercise #e1 level=1 kind=calculation minutes=7
Calculate the finite-class radius for M=20,n=1000,δ=.05 and the sufficient n for radius .05.
:::
::: solution
Radius sqrt(log800/2000)≈.057813. Required n≥log800/(2×.05²), hence ceil=1337. It controls simultaneous deviations, not equality of realised error or the necessity of this many examples.
:::
::: exercise #e2 level=1 kind=calculation minutes=7
For T with mean one and variance .25, compare a=1 and .8 in the scalar squared-loss decomposition before fresh noise.
:::
::: solution
a=1 gives variance .25 and zero bias. a=.8 gives squared bias .04 and variance .64×.25=.16, total .20. Add the same fresh noise variance to both. At a different θ the bias changes.
:::
::: exercise #e3 level=1 kind=calculation minutes=7
Compute the φ(t)=(1,t) kernel at t=−1,1, then ridge prediction at x=2 for y=(−1,1),λ=.5.
:::
::: solution
K=2I, nλ=1, α=(−1/3,1/3). k_x=(−1,3), so prediction=4/3. The feature norm penalty includes the constant coordinate in this example.
:::
::: exercise #e4 level=1 kind=calculation minutes=7
For K with rows (1,2),(2,1), compute cᵀKc for c=(1,−1).
:::
::: solution
Kc=(−1,1); dotting with c gives −2. K is symmetric with positive diagonal but indefinite, so it cannot be a Gram matrix of real inner-product features.
:::
::: exercise #e5 level=2 kind=proof minutes=15
Derive the uniform finite-class risk bound and the ERM excess bound, including an empirical optimisation error τ.
:::
::: solution
Each fixed rule has failure probability≤2exp(−2nε²) for IID [0,1] loss. Union bound gives≤2Mexp(−2nε²). Solving for δ yields the stated radius. On the good event R(h_hat)≤R_hat(h_hat)+ε≤R_hat(h_star)+τ+ε≤R(h_star)+τ+2ε. Class and sampling premises must hold before using simultaneity.
:::
::: exercise #e6 level=2 kind=proof minutes=15
Prove the feature-map PSD identity and invertibility of K+nλI for λ>0.
:::
::: solution
cᵀKc=Σ_i,j c_i c_j φ_iᵀφ_j=||Σ_i c_i φ_i||²≥0. For nonzero c, cᵀ(K+nλI)c≥nλ||c||²>0, so the shifted matrix is positive definite and invertible.
:::
::: exercise #e7 level=2 kind=proof minutes=15
Prove fixed-orientation thresholds on the real line have VC dimension one.
:::
::: solution
One point can be labelled zero or one by moving t above or below it. For every x1<x2, the labelling (1,0) is impossible, because t≤x1 implies t≤x2. Thus some one-point set is shattered and no two-point set is; dimension is one.
:::
::: exercise #e8 level=2 kind=application minutes=12
Twenty models are trained on training data and compared on an independent validation sample. Explain which class the validation bound controls and what final testing must preserve.
:::
::: solution
Condition on the training history; the twenty fitted predictors form a fixed validation-independent pool. For bounded losses and IID validation rows, the finite union bound controls that pool. It does not control later models adapted to validation without accounting for them. Freeze transformations, threshold, hyperparameters and reporting rules before independent final labels.
:::
::: exercise #e9 level=2 kind=application minutes=12
State a squared-loss bias–variance decomposition with both dataset and optimiser randomness and explain a seed-only study.
:::
::: solution
Treat f_hat_(D,seed) as the random predictor and take its mean/variance over the specified joint law. Conditional independent fresh Y with mean f_star(x) gives squared bias+prediction variance+noise variance. Total prediction variance=E_D Var_seed(f_hat|D)+Var_D E_seed(f_hat|D). Seed repetition on one D examines the first conditional component, not the second.
:::
::: exercise #e10 level=2 kind=application minutes=12
Explain kernel-ridge normalisation, storage and prediction for n training rows.
:::
::: solution
For mean half-SSE plus λ feature norm squared/2, solve (K+nλI)α=y and predict k_xᵀα. K stores n² entries, dense generic factorisation costs order n³, and new kernel evaluation uses all training inputs. An explicit small feature representation can be cheaper; transformations and offset conventions are training-fitted.
:::
::: exercise #e11 level=2 kind=diagnosis minutes=12
A report uses M=5 after trying 500 candidates on the same sample, applies Hoeffding to unbounded NLL, and calls its radius exact error. Repair it.
:::
::: solution
The final shortlist does not represent the controlled search; account for all predeclared candidates or use independent evaluation/another valid adaptive argument. NLL lacks the [0,1] range, so this bound is unavailable without different assumptions or a declared changed metric. The radius is a sufficient probabilistic upper bound, not the realised error.
:::
::: exercise #e12 level=2 kind=diagnosis minutes=12
A source classifier is perfect, but target labels reverse and the report retains its source guarantee. Its similarity matrix is symmetric with a negative quadratic witness. Identify both faults.
:::
::: solution
The source risk statement concerns P, not the changed target Q; evaluate the new mechanism or justify a shift model. The negative witness proves the similarity is indefinite and cannot be a real feature Gram. A source test score does not repair an invalid kernel, and a valid kernel would not repair the shifted labels.
:::
::: exercise #e13 level=3 kind=extension minutes=15
Show why nullspace differences between coefficient minimisers in kernel ridge do not change represented predictions.
:::
::: solution
If Kv=0, vᵀKv=||Σv_iφ_i||²=0, so Σv_iφ_i=0. Its inner product with every φ(x) is zero, hence k_xᵀv=0. Therefore α and α+v represent the same function although coefficient vectors differ. This uses an actual valid feature representation, not merely symmetry.
:::
::: exercise #e14 level=3 kind=extension minutes=20
After Module 20, derive the soft-margin SVM dual with an unpenalised intercept and state a strong-duality condition.
:::
::: solution
L=||w||²/2+CΣξ+Σα_i(1−ξ_i−y_i(wᵀφ_i+b))−Σμ_iξ_i. Stationarity gives w=Σα_i y_iφ_i, Σα_i y_i=0 and C−α_i−μ_i=0; nonnegative μ means 0≤α_i≤C. Eliminating w,b,ξ gives maximise Σα−(α⊙y)ᵀK(α⊙y)/2 with these constraints. Convex primal and strict feasible w=b=0,ξ_i=2 satisfy Slater. The free intercept is what creates the equality constraint.
:::

## Ten-question self-check {#quiz}

```quiz
? Population risk is:
- [x] Expected loss under a declared new-example law.
- [ ] Necessarily the observed training mean.
- [ ] Independent of the evaluated population.
> Define distribution and loss before estimating risk.
? The finite-class uniform argument uses:
- [x] Valid fixed-model bounds and an event union bound.
- [ ] Independence between all candidate scores.
- [ ] A final shortlist count after arbitrary search.
> Simultaneity controls a predeclared or independently constructed pool.
? The [0,1] Hoeffding radius directly applies to:
- [x] IID bounded classification losses under its stated class assumptions.
- [ ] Arbitrarily large NLL without restrictions.
- [ ] Copied rows counted as independent.
> Loss range and sampling are essential.
? ERM excess risk on the good event is bounded by:
- [x] Twice the uniform radius plus empirical optimisation error.
- [ ] Always exactly the radius.
- [ ] Zero whenever training loss is zero.
> Compare with the best member of the controlled class.
? Squared-loss prediction bias–variance requires:
- [x] A specified target and predictor/noise randomness with finite moments.
- [ ] Only one observed training score.
- [ ] The same formula for every possible loss.
> Conditional centring and noise independence remove cross terms.
? Fixed-orientation real thresholds have:
- [x] Infinite cardinality but VC dimension one.
- [ ] Infinite VC dimension because t is real.
- [ ] Capacity equal to the sample row count.
> Shattering counts representable label patterns.
? A real feature Gram must satisfy:
- [x] cᵀKc≥0 for every c on every finite input set.
- [ ] Only symmetry and positive diagonal.
- [ ] Strictly positive eigenvalues in all datasets.
> Zero modes are allowed; negative witnesses disprove PSD.
? Mean-loss kernel ridge with λ>0 solves:
- [x] (K+nλI)α=y.
- [ ] (K+λI)α=y irrespective of normalisation.
- [ ] Kα=y with no penalty.
> The factor n follows the declared objective.
? A perfect source test guarantees:
- [x] Neither unchanged risk under arbitrary target shift nor valid kernel construction.
- [ ] Every future label mechanism is identical.
- [ ] All symmetric similarities are kernels.
> Numerical validity, sample uncertainty and target laws are separate.
```

<div class="free-response" data-free-response data-key="math-series:m30:q10">
<label for="q10-response">10. Derive a finite-class selection guarantee and a feature-kernel PSD proof. State the sample, loss, candidate and target assumptions, the ridge convention, and what your claims omit about modern neural networks and shifted populations.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="Write the union event, ERM comparison, quadratic identity and evaluation contract."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I stated assumptions and separated proved identities from diagnostic experiments.</label>
</div>
::: answer
IID [0,1] losses for a controlled finite class yield union failure≤2Mexp(−2nε²); ERM excess≤2ε+τ on the good event. Feature Gram quadratic forms are squared norms, and λ>0 makes K+nλI SPD under the mean-loss convention. Neither result controls an unbounded loss, arbitrary adapted search, an unrestricted network class, or changed target labels. Freeze selection before independent final evaluation and state the population.
:::

## Reading with a purpose {#reading}

Read the authors' [Understanding Machine Learning](https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/) catalogue for Chapters 4, 6, 15 and 16, then compare the official [Cornell ERM notes](https://www.cs.cornell.edu/courses/cs4780/2022sp/notes/LectureNotes14.html) and [SVM notes](https://www.cs.cornell.edu/courses/cs4780/2022sp/notes/LectureNotes13.html). The finite-class, threshold, feature-PSD and ridge arguments above are worked here; broader capacity results are identified as named extensions.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | Uniform convergence: which event covers a selected rule? |
| Session 4 · 20 minutes | Capacity and kernels: which class, PSD and duality assumptions enter? |

## Retrieval exit task and next step {#summary}

**Exit task:** derive the risk radius and ERM comparison, prove a PSD Gram and a threshold capacity claim, diagnose a selection and shift failure, and state a kernel-ridge/SVM objective convention.

**Ready to move on:** build Module 31's CS capstone or Module 32's AI capstone after its prerequisites. Return to the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term | Meaning | 中文 |
|---|---|---|
| R / R_hat | Population / empirical risk | 总体、经验风险 |
| H / M | Hypothesis class / finite size | 假设类、大小 |
| Uniform convergence | Simultaneous risk-error control | 一致收敛 |
| Bias / variance | Mean prediction offset / fitting variability | 偏差、方差 |
| VC dimension | Largest shattered finite-set size | VC 维 |
| Kernel / Gram | Feature inner product / sample matrix | 核、Gram 矩阵 |
| Margin / slack | Scaled separation / allowed constraint violation | 间隔、松弛 |
| Distribution shift | Changed evaluated law | 分布偏移 |
