## A noisy update needs an objective and sampling rule {#start}

Stochastic optimisation replaces an expensive full gradient with a sampled estimate. That replacement changes variation, cost and the meaning of progress; it does not change a training score into a population guarantee. This lesson derives conditional gradient unbiasedness and batch covariance, analyses a noisy quadratic, defines momentum and Adam updates precisely, and separates penalties, decay, early stopping and clipping. Each experiment records the finite objective, sampled units, update convention and evaluation budget.

**Retrieval check:** [Module 19](module_19_EN.html#s1) supplies smooth descent and quadratic curvature; [Module 23](module_23_EN.html#s1) supplies covariance; [Module 25](module_25_EN.html#s6) supplies MAP penalty scales. Module 26's split rules support evaluation. The optional spectral view revisits Module 13. All labs use the [pinned NumPy preparation](numpy_primer_EN.html#setup), with standard-library arithmetic for the fault examples and no GPU.

## Population risk empirical risk and sampled gradients {#s1}

For a probability law P of examples Z and a loss ℓ(w;Z), population risk is R(w)=E_P[ℓ(w;Z)] when this expectation is defined. For a fixed dataset z₁,…,z_N, empirical risk is F(w)=(1/N)Σℓ(w;z_i). The first averages over a population, the second over recorded data. Once the dataset is fixed, F is a deterministic function even when an algorithm samples indices to estimate its gradient. Distinguish data randomness, batch randomness conditional on data, and any other algorithmic randomness before making an unbiasedness statement.

For differentiable finite losses, G(w)=∇F(w)=(1/N)Σg_i(w), with g_i=∇ℓ_i. No interchange theorem is needed for this finite sum. For population risk, writing ∇Eℓ=E∇ℓ needs additional conditions, for example differentiability in a neighbourhood with an integrable envelope controlling the derivative components. A finite-data minibatch derivation cannot silently establish that exchange for every unbounded population model. The course's explicit quadratic examples keep gradient and moment existence transparent.

Let I be uniform on {1,…,N}, sampled freshly conditional on current w and the fixed data. Then E[g_I(w)|w,data]=(1/N)Σg_i(w)=G(w). A batch average of b independent uniform indices has the same conditional expectation. The current iterate can depend on previous batches; conditioning on it still leaves a fresh uniform draw valid. A deterministic batch selected because its gradient looks favourable is a different estimator and need not have that expectation. Uniform sampling is the essential finite-index calculation, not an informal slogan that every small batch is representative.

::: worked title="Exact enumeration proves a finite gradient mean"
Take losses ℓ_i(w)=.5||w−a_i||² with four records a=(-2,0),(0,2),(2,0),(0,-2). Their mean is zero, so G(w)=w and the empirical minimiser is (0,0). At w=(3,-2), the four gradients average exactly to (3,-2). Sampling one uniform record therefore gives a conditionally unbiased full-gradient estimate, although each individual update can point away from the minimiser in a coordinate.
:::

If indices are sampled nonuniformly with fixed positive probabilities p_i, unweighted g_I has expectation Σp_i g_i, the gradient of a differently weighted objective. Importance weighting g_I/(Np_I) restores the uniform-objective mean: summing p_i times that vector gives (1/N)Σg_i. Very small p_i can make the weighted gradients large and increase variance; unbiasedness alone says nothing about efficiency. State whether weights are fixed or data/history-dependent, and use the corresponding conditional probabilities if claiming the conditional identity.

For a regularised objective F(w)+λ||w||²/2, its exact penalty gradient is λw. A sampled data gradient plus this deterministic term is unbiased for that regularised objective conditional on w. Adding λw to each individual data gradient before averaging also gives the same term; multiplying it by the number of batch entries changes the objective. Sum versus mean data losses require the matching coefficients derived in Module 25. Every gradient should carry shape and normalisation checks before optimiser comparison.

Sampling an index from a fixed dataset does not create a new population example. A method can optimise F very accurately while R remains larger, especially after selection or distribution shift. Conversely a noisy estimate of G can still be useful computationally even though its current loss occasionally rises. The optimisation target, estimator expectation and generalisation target are different obligations. Module 30 will connect them through explicit statistical assumptions rather than claiming that lower training loss proves future accuracy.

::: figure #fig-28-1
Population examples generate a dataset; fixed-data index sampling estimates its empirical gradient. These two expectations concern different random mechanisms.
:::

::: check
What is random after the dataset is fixed? Which conditioning supports a fresh uniform gradient estimate? What weights restore a uniform objective under nonuniform index sampling?
:::
::: answer
The algorithm's batch draws can remain random while F is deterministic. Condition on data and current iterate, then sample fresh indices uniformly. Use g_I/(Np_I) with the actual positive index probabilities; this repairs the mean but can increase variance.
:::

## Batch covariance replacement and shared draws {#s2}

At fixed w and data, define centred gradients d_i=g_i−G and finite-population covariance C=(1/N)Σd_i d_iᵀ. This denominator N describes a complete finite list, not an unbiased sample covariance estimator of an unknown population. For one uniform index, Cov(g_I)=C. For b independent uniform indices with replacement, the average covariance is C/b by the sum-covariance identity. Its expected squared deviation norm is tr(C)/b. Identical marginal index distributions alone do not justify removing cross terms.

For a uniformly selected size-b subset without replacement, 1≤b≤N and N>1, the average covariance is (C/b)(N−b)/(N−1). To prove it, two different sampled positions have cross-covariance −C/(N−1): Σ_i d_i=0 implies Σ_{i≠j}d_i d_jᵀ=−Σ_i d_i d_iᵀ. Divide by N(N−1). In the batch sum, b diagonal terms contribute C each and b(b−1) ordered cross terms contribute −C/(N−1); division by b² gives the formula. At b=N it becomes zero, matching the exact full gradient.

$$\operatorname{Cov}(\widehat G_b)=\frac{C}{b}\quad\text{with replacement},\qquad
\operatorname{Cov}(\widehat G_b)=\frac{N-b}{N-1}\frac{C}{b}\quad\text{for a uniform subset}. $$

::: worked title="Two distinct records and two copied records have different variance"
The four-record example has C=2I. A two-index independent batch has coordinate variance 1. A uniform two-distinct-record subset has coordinate variance 2/3. Drawing one record and copying its gradient twice keeps coordinate variance 2, although the batch still has two rows and the same unbiased mean. Lab 1 enumerates all 16 ordered replacement pairs and all six subsets to verify the stated moments.
:::

A general batch average has covariance [ΣCov(g_j)+Σ_{j≠k}Cov(g_j,g_k)]/b². Positive correlation can limit the benefit of larger nominal batches; negative correlation can reduce variation. These terms depend on sampling design and current parameter, not merely on a dataset column called “batch ID.” Duplicating examples or sharing a random augmentation across rows can alter them. Avoid an automatic standard-deviation/√b claim without the cross-term contract, just as copied observations required care in Module 24.

Random reshuffling visits a random permutation without replacement during an epoch. The whole permutation is uniform, but conditional on batches already observed, the next batch is drawn from remaining records rather than the entire original list. Its conditional gradient mean need not equal G(w) at that current iterate. Shuffle-based methods can work well, but this fact means the fresh-IID conditional proof is not their complete convergence analysis. Likewise choosing a hard-example batch based on the current model changes its selection probabilities and potentially its target weighting.

Increasing b reduces replacement variance at a fixed w, but changes update count at a fixed number of per-example gradient evaluations. Hardware parallelism can also make a larger batch faster per evaluated example, while memory and data-loading costs can reverse another comparison. Report both updates and evaluations, and wall-clock conditions if measured. Lab 1 fixes 2400 gradient evaluations, uses fewer full-batch updates and explicitly states that its learning-rate schedule is indexed by update count. Its finite result is not a universal batch-size ranking.

Covariance C itself changes with w for many nonlinear models, so one measured variance at the start cannot describe every training step. For the quadratic records, each gradient is w−a_i, and its centred component is −a_i, making C constant; this special construction enables exact analysis. In a real model, monitor an appropriate estimator only if its extra sampling cost and conditional interpretation are stated. A variance diagnostic is evidence about the supplied batch mechanism, not a proof that population gradients or every future batch behave the same way.

::: check
Why is the covariance denominator N here? What gives the finite-population correction? Does a random shuffle prove each later conditional batch is uniform over the full dataset?
:::
::: answer
It averages the entire fixed gradient list. Negative cross-covariance from distinct draws yields the correction, reaching zero at a full subset. After observed batches, only remaining records are available, so the fresh full-list conditional identity does not automatically apply.
:::

## SGD noise schedules momentum and explicit Adam updates {#s3}

Stochastic gradient descent is w_(t+1)=w_t−η_t g_hat_t, with positive step η_t and a declared gradient estimator. If F has L-Lipschitz gradient and g_hat is conditionally unbiased with finite covariance C_t, the smooth descent inequality gives E[F(w−ηg_hat)|w]≤F(w)−η(1−Lη/2)||G(w)||²+(Lη²/2)tr(C_t). Derive it by substituting the update into Module 19's quadratic upper bound, averaging the linear term, and using E||g_hat||²=||G||²+tr(C_t). The noise term can offset expected descent near a minimiser.

For a scalar quadratic F(w)=aw²/2 and estimate aw+ξ_t, with fresh mean-zero independent noise variance v and a>0, the update is w_(t+1)=(1−ηa)w_t−ηξ_t. Mean contracts if |1−ηa|<1, equivalently 0<ηa<2. Variance obeys V_(t+1)=(1−ηa)²V_t+η²v. With constant η in that interval, its limiting variance is ηv/[a(2−ηa)]. A constant-rate iterate therefore need not converge to a noiseless point, even though its mean converges to zero.

::: worked title="A stable constant step retains a noise floor"
For a=1, η=.1 and gradient-noise variance v=2, the mean multiplier is .9 and limiting iterate variance is .2/1.9≈.105263. Expected excess loss at zero-mean stationarity is half that variance, about .052632. Replacing the gradient by its exact full mean removes ξ and this floor. A particular noisy path can still move upward or cross zero many times within the stable regime.
:::

Decaying steps can reduce later noise contributions, but no arbitrary decreasing schedule guarantees success for every objective. In the noiseless scalar recurrence, if Ση_t is finite and steps are sufficiently small, the product Π(1−aη_t) can stay positive, leaving a nonzero initial component. Schedules commonly examined in stochastic approximation balance continued motion with square-summable noise effects under additional conditions. Here the exact quadratic recurrence and conditional descent bound are proved; broad convergence claims require their own smoothness, curvature, noise, boundedness and sampling assumptions.

The finite-total-step caution has a direct proof. Suppose every positive step satisfies aη_t≤c<1 and their sum is finite. The mean-value theorem applied to −log(1−u) on [0,aη_t] gives −log(1−aη_t)≤aη_t/(1−c). Summing these bounds keeps the negative log of the contraction product finite, so the infinite product is bounded below by a positive number. A nonzero noiseless initial iterate therefore retains a nonzero limiting component. This example does not prove which schedules succeed with random noise; it establishes why merely shrinking steps, even while every individual step is stable, can stop motion before reaching the target. Rate conditions and noise conditions need to be analysed together.

Define one momentum convention explicitly: v_(t+1)=βv_t+g_hat_t, w_(t+1)=w_t−ηv_(t+1), with v₀=0 and 0≤β<1. This buffer uses an unnormalised weighted sum. Under a constant gradient g it approaches g/(1−β), so holding η fixed while changing β changes effective update scale. An exponential-average convention multiplies the new gradient by 1−β and is numerically different unless step scales are adjusted. Momentum can damp or amplify oscillations depending on curvature and step choice; its history-dependent update is not simply a fresh unbiased gradient multiplied by a fixed scalar.

The named Adam method uses m_t=β₁m_(t−1)+(1−β₁)g_t and v_t=β₂v_(t−1)+(1−β₂)g_t², componentwise, with zero initial moments. Define m_hat_t=m_t/(1−β₁^t), v_hat_t=v_t/(1−β₂^t), and w_t=w_(t−1)−η_t m_hat_t/(√v_hat_t+ε), ε>0. These are the update equations in the [original Adam paper](https://arxiv.org/abs/1412.6980), Algorithm 1. The v buffer estimates a raw second moment, not a centred variance; the square root and ε are componentwise and ε is outside the root in this convention.

For a stationary gradient distribution, expanding the exponential average shows E[m_t]=(1−β₁^t)E[g] and similarly for its squared-gradient raw moment, explaining zero-initialisation correction. During optimisation, gradient distributions change with iterates, so the corrected buffer is not automatically an unbiased current full gradient. Dividing by a random adaptive denominator also changes expectation. The algorithm definition does not establish unconditional convergence, a universal best optimiser or better generalisation. Preserve the precise formula and state what the finite experiment actually measures.

::: figure #fig-28-2
At a stable constant step, the noiseless quadratic path contracts to zero while sampled gradients retain repeated-run variation. Adaptive moment buffers additionally transform the update direction and scale.
:::

::: check
Where does the expected-descent noise term come from? What is the constant-rate scalar variance floor? Does Adam's second buffer equal a centred gradient variance or prove a current unbiased update?
:::
::: answer
It comes from E||g_hat||²=||G||²+trCov in the smooth upper bound. The floor is ηv/[a(2−ηa)] under the explicit fresh-noise model and stable step. Adam uses a raw second moment and a nonlinear denominator, so neither claim follows.
:::

## Ridge lasso and feature-coordinate geometry {#s4}

An explicit penalty changes the objective, while a different optimiser changes how the objective is traversed. Ridge adds λ||w||²/2, λ≥0, whose gradient is λw and Hessian λI. In a quadratic loss it can improve positive curvature and shift the minimiser toward the stated zero centre. It does not merely make numerical updates smaller while retaining the unpenalised target. Gaussian priors and noise scales in Module 25 supply one probabilistic interpretation, with sum/average conventions kept consistent.

For a scalar data loss .5(w−a)², ridge stationarity gives (w−a)+λw=0, so w=a/(1+λ). The coefficient generally stays nonzero. Lasso instead adds λ|w|. Away from zero its derivative is λsign(w), and at zero its convex subgradient set is [−λ,λ]. Optimality means zero belongs to w−a+λ∂|w|. If |a|≤λ, zero is optimal; otherwise w=a−λsign(a). This soft-threshold rule creates exact zeros through nonsmooth geometry, not by an arbitrary floating-point small-value cutoff.

::: worked title="Two penalties pull the same scalar target differently"
For a=.8 and λ=1, ridge gives .4. Lasso gives zero because .8 lies within the threshold. At a=2 with λ=1, ridge gives 1 and lasso also gives 1, but that single agreement does not make their objectives identical. At a=3 they give 1.5 and 2. The derivation must specify whether λ multiplies half a square or an absolute value.
:::

For a differentiable F, a proximal-gradient step for F+λ||w||₁ first forms z=w−η∇F(w), then applies componentwise soft-thresholding with threshold ηλ. Its scalar subproblem minimises .5(u−z)²+ηλ|u|, so the threshold formula above directly derives the operation. Choosing a subgradient sign convention at zero and taking ordinary gradient steps is a different algorithm and may chatter around the kink. No smooth-gradient theorem applies to the whole absolute-value objective without handling its nonsmooth term.

With mean half-SSE, ridge coefficients satisfy (XᵀX/N+λI)w=Xᵀy/N, if penalising those columns and treating any intercept separately. At λ>0 the coefficient matrix is positive definite for finite X, even when X is rank deficient, because vᵀ(XᵀX/N+λI)v=||Xv||²/N+λ||v||²>0 for v≠0. At λ=0, uniqueness requires the usual full-rank condition. A linear solve is the appropriate computation; regularisation can improve conditioning while simultaneously introducing statistical bias.

Feature units change penalty meaning. Rescaling one coordinate of X and inversely rescaling its coefficient preserves predictions, but an isotropic coefficient norm is not invariant under that transformation. A penalty on standardised coefficients corresponds to a differently weighted penalty in raw coordinates. Training-only standardisation can improve numerical curvature, but does not preserve every prior interpretation under an unchanged λ. State whether the intercept is penalised, which coordinate system defines the prior, and how mean versus sum residual conventions are handled.

Lab 2 uses raw features with scales 1 and 100, fits scaling on training only, and inspects the resulting Hessian condition change. It compares a declared ridge list on validation, freezes the choice, then evaluates the test once. In this trace λ=0 wins the validation list. That is a legitimate result, not a reason to edit data or add test-guided candidates until regularisation appears beneficial. A finite validation winner remains a selected rule whose future performance needs its held-out uncertainty interpretation.

::: figure #fig-28-3
Ridge shrinks smoothly; lasso soft-thresholds to zero. Feature scaling changes the coordinate geometry in which either penalty is defined.
:::

::: check
Derive ridge and lasso scalar optima. Why is positive ridge curvature invertible even with rank-deficient data? Does standardising features leave an isotropic raw-coordinate prior unchanged?
:::
::: answer
Solve the smooth score for ridge and the zero-containing subgradient condition for lasso. λ||v||² makes every nonzero direction positive. Standardising changes coefficient coordinates, so a new isotropic norm generally represents a different raw-coordinate prior.
:::

## Early stopping weight decay and distinct trajectories {#s5}

Early stopping selects an iterate before full optimisation. It can limit fit to noisy directions, but is a selection rule rather than automatically a fixed explicit penalty. A validation stopping protocol belongs to the training procedure; a final test used to choose the stop becomes selection data. Record how often validation is inspected, the candidate epochs, tie rule and whether the best observed iterate is restored. A random stopping time based on a noisy training gradient does not inherit a fixed-time statistical or optimisation guarantee without further analysis.

For a quadratic F(w)=.5wᵀHw−bᵀw with positive-definite H, full gradient descent from zero has eigenmode coefficient [1−(1−ηh_j)^t]b_j/h_j. This follows by solving the scalar affine recurrence in each eigenbasis direction. Under 0<η≤1/h_max, the filter grows monotonically between zero and one, so small-curvature directions develop more slowly. Ridge with coefficient λ instead has coefficient b_j/(h_j+λ), corresponding to filter h_j/(h_j+λ) relative to the unpenalised optimum. One stopping time generally does not match one λ across all eigenmodes.

This spectral comparison is a qualified mechanism explaining why early stopping can act like shrinkage in simple linear models. It is not an equivalence theorem for every neural network, stochastic path or learning-rate schedule. If ηh_j>1, modes may oscillate and the monotone-filter description no longer applies. If the data objective is singular, null directions and compatible b require separate treatment. State the finite quadratic assumptions before generalising from an attractive training curve.

Plain SGD on F+λ||w||²/2 updates w_new=w−η(g+λw)=(1−ηλ)w−ηg. Thus a multiplicative shrink factor and an L2 penalty gradient coincide under this specific plain-SGD convention. Some libraries parameterise a decay factor independently of learning rate; matching such a convention requires converting the coefficient, not assuming the same numerical hyperparameter. Momentum buffers or adaptive scaling can break this elementary algebra because the penalty gradient enters their history or preconditioner.

::: worked title="The same L2 label can produce different adaptive updates"
Let w=2, data gradient g=.1, λ=.5, η=.01 and ε=10⁻⁸. Plain SGD gives 1.989 whether adding λw to g or shrinking by 1−ηλ separately. At Adam's first zero-initialised, bias-corrected step, coupled L2 uses gradient 1.1 and gives about 1.99. A decoupled step uses the data gradient in moments and then shrinkage, giving about 1.98. The nonlinear denominator makes the two adaptive paths different.
:::

In the decoupled Adam-style convention here, compute m_hat and v_hat using the data gradient, then set w_new=(1−ηλ)w−η m_hat/(√v_hat+ε). Coupled L2 instead supplies g+λw to both moment buffers. These distinctions follow the [decoupled weight-decay paper](https://arxiv.org/abs/1711.05101); they are update definitions, not a claim that one has universally lower test risk. The decay coefficient and learning-rate schedule jointly determine shrinkage along the trajectory. Label an experiment with its exact recurrence rather than a loose optimiser name.

Loss regularisation, data augmentation, dropout and early stopping may all affect training or generalisation, but they are not interchangeable objectives. Augmentation changes the examples/loss distribution, dropout adds a declared masking mechanism, a penalty changes F directly, and stopping chooses a point on a path. Understanding their mathematics begins by locating where the rule enters the expectation or update. This lesson derives explicit penalty and stopping mechanisms; specialised dropout or augmentation generalisation results require further modelling assumptions.

::: check
When is decay exactly the plain-SGD L2 gradient? Why can Adam differ? Does one stopping time generally equal a ridge coefficient in every curvature direction?
:::
::: answer
With shrink factor 1−ηλ and an unchanged plain data gradient, the algebra matches. Adaptive moments and denominators treat a coupled penalty differently from external shrinkage. Early-stop and ridge eigenfilters differ, so a single correspondence need not hold across directions.
:::

## Conditioning clipping stopping and comparison budgets {#s6}

An ill-conditioned quadratic has curvature ratios that force a common stable step to be small for flat directions while avoiding explosive steep-direction updates. Module 19's full-gradient eigenmode condition still informs a stochastic experiment, although sampled gradients add noise and different per-example curvature. A step stable for one average Hessian is not an unconditional guarantee for arbitrary random component updates. Inspect feature scale, objective normalisation, gradient norms and the actual sampling mechanism before treating erratic traces as unavoidable optimiser randomness.

For F(w)=10w²/2, the deterministic multiplier is 1−10η. Step .1 sends any w directly to zero; step .25 has multiplier −1.5 and grows in magnitude while alternating sign. This is a mathematical instability independent of the seed. A noisy method can also oscillate in a stable interval, so both magnitude trend and the model's curvature must be assessed. Changing λ increases curvature and can change the stable step requirement, even while a penalty improves the condition ratio of a multi-dimensional problem.

Gradient clipping maps g to g min(1,c/||g||) for threshold c>0, with zero left zero. It bounds individual update inputs and preserves each nonzero vector's direction, but usually changes the expectation and can bias an originally unbiased gradient estimator. Componentwise clipping is another rule with different geometry. Clipping can help control numerical excursions, yet cannot be cited as proof that the transformed updates optimise the original expectation without additional analysis.

::: worked title="Clipping can destroy gradient unbiasedness"
A scalar estimator takes −2 and 1 with equal probabilities, so its mean is −.5. Norm clipping at c=1 gives −1 and 1 with mean zero. The expected update no longer follows the original nonzero gradient. Lab 3 computes both means; finite clipping arithmetic cannot be presented as preserving unbiasedness merely because every draw was bounded.
:::

A small noisy gradient is not a reliable certificate that the full gradient is small. In the four-record quadratic, one sampled gradient vanishes whenever w equals its selected a_i, although full G(w)=w can be far from zero. Likewise a small parameter step may result from a tiny learning rate, a large adaptive denominator or clipping, rather than near-optimality. Evaluate an appropriate full-gradient or statistically justified diagnostic when needed, and distinguish convergence of an algorithmic path from validation-based model selection.

Compare methods at a specified cost budget and fixed data protocol. Equal epochs, equal updates, equal example evaluations and equal wall time are different budgets. Record the schedule's indexing, batch replacement rule, regularisation convention and precision. Seed-to-seed variation estimates algorithmic randomness conditional on a fixed dataset; additional independent datasets or test units are needed for population claims. Paired seeds or minibatch streams can make comparisons less noisy if they preserve intended marginal algorithms, but cross-run copying does not add independent replications.

Report training objective separately from unpenalised data loss and held-out metrics. A stronger penalty can raise training data error while lowering total regularised objective at its own optimum; comparing those totals across different λ also compares different functions. Validation chooses the protocol, and a final independent test evaluates the frozen choice. Lab 3 uses explicitly illustrative score arrays to demonstrate correct versus test-guided stopping; those inputs are not measured model benchmark results. Lab 2 supplies actual fitted-model outputs under the declared split.

The explorer shows multiple seeded scalar SGD paths and the analytical expected path for its explicit additive-noise quadratic. It labels the local recurrence stability condition and regularisation curvature. A reproducible random trace illustrates variation, while the proved variance and descent formulas supply the mathematical statements. Neither a low final loss nor one smooth-looking curve establishes universal convergence or generalisation. Carry the objective, dependence, numerical scale and evaluation contract together into the numerical-computation lesson next.

::: figure #fig-28-4
Update size, training loss, regularised objective and held-out performance are different diagnostics. Clipping or a tiny step can hide a large full gradient, and test-based stopping changes the evaluation role.
:::

::: widget name=stochastic
:::

::: check
Does clipping preserve expected gradient? Is a tiny sampled step an optimum certificate? Which budget and uncertainty sources should a method comparison specify?
:::
::: answer
Generally not, as the two-value example proves. Step size can hide scale, clipping or random cancellation. Specify evaluations/updates/time, schedule, fixed split and sampling law, separating algorithm seeds from independent evaluation units.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| Every minibatch is unbiased for population risk. | Fresh finite-index sampling targets the fixed empirical objective. |
| Nominal batch size always divides variance. | Replacement and cross-covariance matter. |
| Shuffled later batches satisfy the fresh full-list conditional proof. | They use remaining indices conditional on earlier batches. |
| A constant stable step removes all noise. | The quadratic can have a positive variance floor. |
| Adam's v is centred variance. | It is a raw squared-gradient moment. |
| Ridge and lasso differ only by optimiser speed. | They change the objective and sparsity geometry. |
| L2 and decay are identical for every optimiser. | Adaptive buffers can make coupled and decoupled paths differ. |
| Clipping preserves unbiasedness. | Its nonlinear transformation can change expectation. |
| Tiny sampled updates certify full optimality. | Rate, scaling and sampled cancellation can hide gradients. |

## Three reproducible labs {#labs}

### Lab 1 · Exact batches and equal evaluation counts {#lab1}

{{LAB:lab1}}

Derive all three covariance cases before running. Compare the full/single/two-sample traces at equal evaluation count, explicitly retaining the differing update-indexed schedule.

### Lab 2 · Training-only scaling and regularisation {#lab2}

{{LAB:lab2}}

State the mean half-SSE convention and unpenalised intercept. Explain the validation-selected zero penalty and the difference between standardised and raw prior geometry.

### Lab 3 · Rate correlation decay and selection faults {#lab3}

{{LAB:lab3}}

Repair instability and copied-gradient variance, derive the first adaptive update, and diagnose clipping bias. The stopping arrays are labelled illustrative inputs rather than measured benchmark scores.

## Fourteen exercises with full solutions {#exercises}

Exercises 1–12 are required. Optional Exercises 13–14 add 35 minutes beyond the twelve-hour schedule.

::: exercise #e1 level=1 kind=calculation minutes=7
For the four-record quadratic at w=(3,-2), compute full gradient, covariance C and replacement batch-two covariance.
:::
::: solution
Record mean zero gives G=w. Centred gradients are −a_i, giving C=diag(2,2). Independent replacement average covariance is C/2=I, not the copied-record C.
:::

::: exercise #e2 level=1 kind=calculation minutes=7
N=4,b=2,C=2I: compute without-replacement and copied-index covariance.
:::
::: solution
Uniform subset covariance (C/2)(4−2)/(4−1)=(2/3)I. One draw copied twice has covariance C=2I. Both averages are unbiased, but their variation differs.
:::

::: exercise #e3 level=1 kind=calculation minutes=7
For .5(w−.8)² and λ=1, give ridge and lasso optima under this lesson's penalty convention.
:::
::: solution
Ridge λw²/2 gives .8/(1+1)=.4. Lasso λ|w| gives zero because |.8|≤1. Its zero subgradient interval contains the balancing derivative .8.
:::

::: exercise #e4 level=1 kind=calculation minutes=7
a=1,η=.1,v=2: compute the constant-rate noisy-quadratic multiplier, variance floor and expected stationary excess loss.
:::
::: solution
Multiplier .9, variance ηv/[a(2−ηa)]=.2/1.9=2/19, expected loss half that=1/19. This uses fresh independent mean-zero additive noise and a stable step.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Prove uniform gradient unbiasedness, importance correction and both batch covariance formulas.
:::
::: solution
Uniform finite expectation is Σg_i/N; nonuniform weighted expectation is Σp_i g_i/(Np_i)=G. Replacement cross-covariances vanish, giving C/b. Distinct draws have cross-covariance −C/(N−1) because centred sums are zero; the b diagonal and b(b−1) ordered cross terms give C(N−b)/[b(N−1)]. Conditions are fixed gradients and the stated draw mechanisms.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Derive the conditional expected smooth-descent inequality and scalar variance recurrence.
:::
::: solution
Substitute −ηg_hat into the L-smooth upper bound; unbiased linear term is −η||G||², squared term has mean ||G||²+trCov. Rearrange to the stated noise bound. For independent additive scalar noise, centred recurrence variance is (1−ηa)²V+η²v. Stable geometric summation gives ηv/[a(2−ηa)].
:::

::: exercise #e7 level=2 kind=proof minutes=15
Derive scalar soft-thresholding and prove plain-SGD decay equivalence for λ||w||²/2.
:::
::: solution
Away from zero solve w−a+λsignw=0; at zero optimality is −a∈[−λ,λ], giving zero for |a|≤λ and a−λsigna otherwise. Plain update w−η(g+λw) expands to (1−ηλ)w−ηg. Momentum/adaptive transformations are absent from this identity.
:::

::: exercise #e8 level=2 kind=application minutes=12
Compare three batch sizes using 2400 per-example gradient evaluations and an update-indexed schedule. What must be recorded before ranking efficiency?
:::
::: solution
Batch 1 has 2400 updates, batch 2 has 1200, full batch 4 has 600. Their schedules visit different update indices. Record evaluation and update budgets, replacement, rate convention, memory/time conditions and the final target metric; one trace does not establish universal efficiency or generalisation.
:::

::: exercise #e9 level=2 kind=application minutes=12
Derive ridge normal equations for mean half-SSE and show positive λ gives uniqueness even if X is rank deficient.
:::
::: solution
Gradient Xᵀ(Xw−y)/N+λw=0 gives (XᵀX/N+λI)w=Xᵀy/N. Nonzero v has quadratic form ||Xv||²/N+λ||v||²>0, so the matrix is invertible. Intercept treatment and feature coordinates must be stated separately.
:::

::: exercise #e10 level=2 kind=application minutes=12
Compute the stated w=2,g=.1,λ=.5,η=.01 first SGD and Adam-style coupled/decoupled steps.
:::
::: solution
Plain SGD both give 1.989. Adam zero-start bias correction makes first m_hat=g_used,v_hat=g_used². Coupled gradient 1.1 gives about 1.99. Decoupled data gradient .1 plus shrinkage gives about 1.98. ε=10⁻⁸ is outside the root, matching the defined recurrence.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=12
A two-row batch copies one gradient, clips it and treats its small update as proof of full convergence. Repair the reasoning.
:::
::: solution
Copies preserve covariance C rather than C/2. Clipping can change the mean and small steps can reflect rate/threshold/scaling. Inspect a justified full-gradient or uncertainty diagnostic; a sampled zero at one record need not make the full gradient zero.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=12
All features were standardised before splitting, the same λ was claimed to represent the same raw prior, and test loss selected stopping. Repair it.
:::
::: solution
Fit transforms on training only. State the coefficient coordinate system: standardised isotropic penalties generally imply different raw-coordinate prior geometry. Choose stopping on validation, freeze the rule, then evaluate an independent final test; selected test outcomes are not untouched.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Derive early-stop and ridge filters for a positive-definite quadratic and explain why one t is not generally one λ across modes.
:::
::: solution
From zero, mode recurrence u_(t+1)=(1−ηh)u_t+ηb gives u_t=[1−(1−ηh)^t]b/h. Ridge gives b/(h+λ), filter h/(h+λ). These functions of h generally differ; monotone early filtering additionally needs 0<η≤1/h_max. A single-mode agreement is not a whole-objective equivalence.
:::

::: exercise #e14 level=3 kind=extension minutes=20
Prove the exponential-average zero-initialisation correction under stationary gradient moments, and explain why it does not make an adaptive current update unbiased during training.
:::
::: solution
Expand m_t=(1−β)Σ_{j=1}^t β^(t−j)g_j. A common E[g_j]=μ gives E[m_t]=(1−β^t)μ; division removes initialisation bias for that stationary mean. Apply the same argument to squared gradients for a stationary raw second moment. Changing iterate-dependent laws and a random nonlinear denominator prevent an automatic current unbiased-gradient conclusion.
:::

## Ten-question self-check {#quiz}

```quiz
? Fresh uniform index sampling on fixed data targets which gradient?
- [x] The empirical mean-loss gradient
- [ ] Every possible population gradient without extra assumptions
- [ ] The final test loss automatically
> Finite-index expectation averages the recorded gradients, not new population examples.

? With replacement and independent indices, batch covariance is what?
- [ ] C regardless of b
- [x] C/b
- [ ] Always zero
> Cross-covariances vanish under the stated conditional sampling mechanism.

? One gradient copied twice has which covariance?
- [ ] C/2
- [ ] Zero
- [x] C
> The average equals the original draw, so no new independent information is added.

? Does a stable constant SGD step eliminate all gradient noise?
- [x] No; the explicit quadratic can retain a positive variance floor
- [ ] Yes in every model
- [ ] Only a seed determines the theorem
> Mean contraction and iterate variation are different properties.

? Adam's v buffer represents what?
- [ ] Centred covariance automatically
- [x] An exponential raw squared-gradient moment
- [ ] A posterior probability
> It is not the second moment minus the squared mean.

? Which scalar penalty can yield exact zero by a subgradient threshold?
- [ ] Positive ridge always
- [ ] Every smooth penalty automatically
- [x] Lasso absolute-value penalty
> The zero subgradient interval balances a range of data derivatives.

? When does L2-gradient equal the stated multiplicative decay?
- [x] Plain SGD with shrinkage factor 1−ηλ
- [ ] Every adaptive optimiser with any coefficient
- [ ] Only after test-based tuning
> Adaptive buffers can transform the penalty gradient differently from external shrinkage.

? Does norm clipping generally preserve an unbiased gradient's mean?
- [ ] Always
- [x] No, nonlinear clipping can change expectation
- [ ] If it is called stabilisation
> The −2/1 example changes mean −.5 to zero.

? Which final evaluation protocol supports the claimed test result?
- [ ] Choose stopping from test loss
- [ ] Rename validation results as test results
- [x] Freeze choices using validation, then evaluate untouched independent test data
> Sampling/selection contracts matter even with a reproducible seed.
```

<div class="free-response" data-free-response data-key="math-series:m28:q10">
<label for="q10-response">10. Specify a minibatch training comparison: derive its conditional gradient mean and covariance, state objective/penalty/rate conventions and evaluation budget, and explain copied draws, clipping bias, adaptive decay and validation stopping without claiming population guarantees from training loss.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="Identify randomness, fixed data, objective, sampling, updates and frozen evaluation."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I distinguished gradient estimation, optimiser dynamics, changed objectives and statistical evaluation.</label>
</div>

::: answer
For fixed differentiable mean loss, fresh uniform replacement indices give conditional G and covariance C/b; copies keep cross terms and subsets have a finite-population correction. State half-SSE/penalty scales, update-indexed schedule and evaluation count. Clipping can bias the gradient, and coupled versus decoupled Adam penalties differ through moment scaling. Use validation for selection and one frozen independent final test; reducing the empirical objective does not itself establish population risk or universal convergence.
:::

## Reading with a purpose {#reading}

Use [Mathematics for Machine Learning](https://mml-book.com/) for optimisation and model objectives. Check [Adam Algorithm 1](https://arxiv.org/abs/1412.6980) and the [decoupled weight-decay paper](https://arxiv.org/abs/1711.05101) for their exact update definitions. The finite-batch covariance, noisy quadratic and penalty derivations above are proved here without borrowing universal performance claims.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | Optimisation objectives: which expectation is over examples and which is over finite indices? |
| Session 4 · 20 minutes | Optimiser equations: where do moment correction, ε and penalty/decay enter the recurrence? |

## Retrieval exit task and next step {#summary}

Derive unbiased sampling, batch covariance, expected descent, a quadratic noise floor, ridge/lasso rules and decay differences. Explain budgets, coordinates, clipping and split-safe stopping in one coherent report.

**Exit task:** contrast an IID two-index batch, a distinct-index subset and a copied gradient. Repair a large-curvature step and an Adam L2/decay equivalence claim, then name the final evaluation protocol.

**Ready to move on:** you can audit a stochastic training update mathematically. Numerical computation next investigates rounding, conditioning and stable implementations. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| R / F | Population / empirical risk | 总体风险、经验风险 |
| G / g_hat / C | Full / sampled gradient / finite gradient covariance | 全梯度、抽样梯度、梯度协方差 |
| η / β / ε | Step / momentum decay / denominator stabiliser | 步长、动量衰减、稳定项 |
| Ridge / lasso | Squared / absolute coefficient penalty | 岭、套索 |
| Subgradient / proximal | Convex supporting slope / penalty subproblem step | 次梯度、近端 |
| Weight decay / clipping | Multiplicative shrinkage / norm threshold | 权重衰减、裁剪 |
| Early stopping / budget | Selected iterate / declared computational work | 提前停止、预算 |
