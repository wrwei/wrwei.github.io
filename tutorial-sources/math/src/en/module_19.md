## An optimisation claim needs an objective and assumptions {#start}

A gradient supplies local sensitivity; an optimiser uses that information to seek a smaller objective. Whether a method descends, converges, preserves its domain or reaches a global minimiser depends on additional assumptions. This lesson proves convexity and descent statements, analyses quadratic eigenmodes exactly, and contrasts them with stopping and Newton failures that can appear in a numerical training loop.

**Retrieval check:** use [Module13](module_13_EN.html#s1) symmetric eigenmodes and positive-definite quadratic forms, and [Module18](module_18_EN.html#s2) column gradients, Hessians and loss reductions. The descent proof uses the mean value theorem from Module16, so an extra integration prerequisite is unnecessary. Labs use NumPy on the tested course baseline.

## Objectives domains infima and attained minimisers {#s1}

An optimisation problem specifies an objective f and a feasible domain D, and asks to minimise f(x) over x∈D. In an unconstrained problem D is often all of Rⁿ, or an open natural domain such as positive inputs for a logarithm. “Unconstrained” does not permit evaluating outside the function's domain. A global minimiser x* belongs to D and has f(x*)≤f(x) for every feasible x. The infimum is the greatest lower bound of objective values and need not be attained by any feasible point. An algorithm approaching that bound does not by itself produce an attained minimiser.

For f(x)=x on(0,1), the infimum is zero but no minimiser exists. For exp(x) on R, the infimum is also zero and is approached only as x→−∞. Neither example is repaired by a small derivative or a long finite trace. For f(x)=−x² on R, there is no finite lower bound, so the optimisation problem is unbounded below. Conversely, on a nonempty compact feasible set a continuous real objective attains its minimum by the extreme value theorem. Domain, boundedness and attainment are mathematical properties of the problem before a solver is chosen.

A local minimiser compares feasible points within some neighbourhood; it can have larger objective than another feasible region. Strict local minimality uses strict inequality for nearby distinct feasible points. A stationary point is an interior differentiable point with zero gradient and is only a candidate. A boundary minimiser may instead have a nonzero gradient, and a kink minimiser may lack a classical gradient. Section3 separates these cases, while the next module develops constraints and their boundary conditions systematically.

::: worked title="A well-defined quadratic problem with a unique answer"
Let f(x)=(1/2)xᵀAx−bᵀx on R², with A=[[3,1],[1,3]] and b=(2,−1). Eigenvalues are two and four, so A is positive definite. Solving Ax*=b gives x*=(7/8,−5/8). Expanding about this point cancels the linear term: f(x)−f(x*)=(1/2)(x−x*)ᵀA(x−x*)>0 for any other input. Thus x* is the unique global minimiser and f(x*)=−19/16=−1.1875. This certificate belongs to the objective, independently of whether an iteration reaches it.
:::

Objective scale matters. Multiplying f by a positive constant preserves its minimisers but scales its gradient and Hessian, so a fixed step size or gradient tolerance changes meaning. Adding a constant preserves every derivative and minimiser while altering reported objective values. Two training logs cannot be compared without their reductions and scales; a low numerical objective does not alone imply accurate parameters or good predictions. Mathematical optimisation error is also different from model generalisation, which later statistical modules address.

Coordinate changes have related but distinct effects. If z=Sx for invertible S and the objective is re-expressed as g(z)=f(S⁻¹z), feasible points and minimisers correspond exactly. Euclidean gradient steps in z generally map back to a matrix-scaled update in x, not the original scalar-step gradient method. If only some terms are transformed, such as features without adjusting a penalty, the objective itself may change. Specify whether a scaling is a reparameterisation of one problem or a new modelling choice.

An implementation should state its initial point, step selection, accepted objective and termination quantity. A maximum iteration count terminates an attempt; a small update, gradient norm or objective change certifies only what a theorem and tolerance contract connect to it. The labs provide counterexamples before any broad claim about practical neural-network training. Numerical success on a handful of starts does not establish an unconditional global guarantee for arbitrary nonconvex objectives.

::: check
Does a finite infimum guarantee an attained minimiser? Does positive objective scaling preserve a fixed gradient-tolerance interpretation? Why state the natural domain in an unconstrained problem?
:::
::: answer
x on(0,1) and exp on R disprove attainment. Scaling preserves minimisers but rescales derivative thresholds and suitable step sizes. A proposed update can leave a logarithm's domain even without explicit constraint equations.
:::

## Convexity Jensen and smooth characterisations {#s2}

A set D is convex when every segment(1−t)x+ty with x,y∈D,t∈[0,1] stays in D. A function f on a convex domain is convex when f((1−t)x+ty)≤(1−t)f(x)+tf(y). The graph lies below its endpoint chords. Strict convexity makes the inequality strict for distinct points and0<t<1. Convexity is a global segment property and does not require smoothness: |x| is convex despite its kink. Smoothness alone does not imply convexity, as −x² shows.

::: worked title="Squared norms are convex by an exact identity"
For vectors x,y and0≤t≤1, ‖(1−t)x+ty‖²=(1−t)‖x‖²+t‖y‖²−t(1−t)‖x−y‖². The last term is nonnegative before subtraction, giving convexity and strictness for distinct x,y and interior t. Thus a squared Euclidean norm is strictly convex. For f(w)=‖Xw−y‖² the same identity uses residual differences X(w₁−w₂); it proves convexity, but strictness requires X to have no nonzero null direction.
:::

Finite Jensen extends the two-point definition: for nonnegative weights α_i summing to one, f(Σα_i x_i)≤Σα_i f(x_i). Prove by induction: remove zero weights, combine the first k−1 points with their total weight, apply the two-point inequality with the last point, then use the induction hypothesis for the normalised earlier weights. If the earlier total is zero, only the last point contributes and equality is immediate. This is an algebraic weighted-average result here; expectations and infinite mixtures later require their own model and integrability assumptions.

For differentiable f on an open convex domain, convexity is equivalent to the first-order supporting inequality f(y)≥f(x)+∇f(x)ᵀ(y−x). From convexity, apply the segment inequality at x+t(y−x), rearrange to bound its forward difference quotient by f(y)−f(x), and let t↓0. Conversely, assume the supporting inequality for all pairs. At z=(1−t)x+ty, write it for x and y relative to z, weight the two inequalities, and the gradient terms cancel. This recovers convexity. The criterion is about every pair on the domain, not one tangent sample.

For C² f on an open convex domain, positive-semidefinite Hessian everywhere is equivalent to convexity. Along any segment, the scalar second derivative is dᵀH(x+td)d≥0, so its first derivative is nondecreasing by the mean value theorem. This supplies the supporting inequality along each segment. Conversely, convexity makes symmetric second differences f(x+td)−2f(x)+f(x−td) nonnegative; division by t² and the second-order limit yield dᵀH(x)d≥0 for every direction. A positive-semidefinite Hessian at one point alone is only local curvature information.

A function is μ-strongly convex, μ>0, when f−(μ/2)‖x‖² is convex on its convex domain. For differentiable f the supporting inequality becomes f(y)≥f(x)+∇f(x)ᵀ(y−x)+(μ/2)‖y−x‖². C² Hessians satisfying H(x)≽μI everywhere give this property. Strong convexity supplies a uniform quadratic margin, while strict convexity only requires strict chords without a shared μ. For example x⁴ is strictly convex on R but has zero second derivative at zero and is not uniformly strongly convex there with any positive μ.

Nonnegative sums of convex functions and affine composition preserve convexity by applying the defining inequalities. A negative multiple can reverse the inequality, so weights need their sign condition. The maximum of finitely many convex functions is convex: each function's segment value is bounded by a weighted endpoint value, and then by the weighted maxima. This explains why useful convex objectives can have nonsmooth boundaries; first-order smooth methods need the additional differentiability conditions stated in their own guarantees.

::: figure #fig-19-1
Convex chord inequalities, supporting tangents and a uniform strong-convexity margin are distinct assertions with different hypotheses.
:::

::: check
Is every convex function smooth? Is a positive Hessian at one point a global convexity proof? What extra condition makes residual squared loss strictly convex?
:::
::: answer
Absolute value is a nonsmooth convex counterexample. A global C² convexity certificate needs a positive-semidefinite Hessian throughout the convex domain. Residual differences must distinguish every nonzero parameter displacement, equivalently X has full column rank.
:::

## Stationarity local classification and global certificates {#s3}

At an interior differentiable local minimiser, every directional first-order rate is zero, so the gradient vanishes. For C² objectives, a positive-definite Hessian at a stationary point gives a strict local minimum; a negative-definite Hessian gives a maximum; an indefinite Hessian gives a saddle. These follow from the second-order model and its uniform remainder control. A semidefinite Hessian with zero directions is inconclusive: higher-order terms may decide either way. These tests classify neighbourhood behaviour, not arbitrary distant points.

::: worked title="Zero gradient can certify a saddle or an entire flat family"
For f(x,y)=x²−y² at zero, gradient is zero and Hessian diag(2,−2) is indefinite. Values along the x axis increase and along the y axis decrease, so zero is a saddle. For g(x,y)=x²−2x, the Hessian diag(2,0) is singular and every(1,y) minimises globally with value−1. The zero direction is flat here, while x⁴−y⁴ has zero Hessian at its saddle. A zero-gradient report alone does not distinguish these outcomes.
:::

Convexity changes the certificate. If a differentiable convex objective on an open convex domain has ∇f(x*)=0, its supporting inequality gives f(y)≥f(x*) for every feasible y, so the point is globally optimal. Every local minimiser of a convex function is also global even without differentiability: a lower distant value would force lower values on arbitrarily short segments leaving the alleged local minimum. Strict convexity makes an attained minimiser unique, since two distinct equal minima would have a strictly lower midpoint. None of these properties by itself guarantees that a minimiser exists on an open or unbounded domain.

Strong convexity adds quantitative control when an unconstrained minimiser x* exists. Apply its supporting inequalities in both directions and add them to obtain (∇f(x)−∇f(x*))ᵀ(x−x*)≥μ‖x−x*‖². Since the minimiser gradient is zero, Cauchy–Schwarz gives ‖x−x*‖≤‖∇f(x)‖/μ. The strong-convexity lower model also gives f(x*)≥f(x)−‖∇f(x)‖²/(2μ), by minimising the quadratic in displacement, hence objective gap≤‖∇f(x)‖²/(2μ). These are error bounds under uniform μ and attainment, not interpretations of any tiny gradient in any model.

For f(x)=10⁻¹²(x−100)², μ=2·10⁻¹². At x=0 the gradient is−2·10⁻¹⁰, easily below tolerance10⁻⁶, while solution distance is100. The proved distance bound is exactly100. To certify distance≤.01 through this criterion, gradient norm must be≤μ(.01)=2·10⁻¹⁴. The objective gap at zero is numerically small, so a solver may satisfy a stated objective-gap tolerance while failing a parameter-distance tolerance. Decide which quantity the user actually needs rather than declare every small number “converged.”

For merely convex functions, small gradients need additional scale information to bound objective gap. The supporting inequality gives f(x)−f(x*)≤∇f(x)ᵀ(x−x*)≤‖∇f(x)‖‖x−x*‖. A known distance bound R supplies gap≤R‖∇f(x)‖; without R or stronger structure, the gradient norm alone does not determine a useful uniform gap certificate. Nonconvex stationary points need classification or separate global evidence instead of this convex supporting argument.

Constraints further change necessary conditions. On[0,∞), f(x)=x is minimised at zero with gradient one; feasible directions cannot point left, so the unconstrained zero-gradient condition is irrelevant. This lesson's global stationary certificate presumes an interior unconstrained minimiser and a convex domain where its supporting inequality applies. Next module will replace those assumptions with explicit constraint and multiplier conditions, rather than force a boundary optimum to have zero ordinary gradient.

::: check
When does zero gradient certify a global minimiser? Does strong convexity eliminate the need to check attainment? What converts a gradient tolerance into a distance certificate?
:::
::: answer
For a differentiable convex objective with a feasible interior zero-gradient point. Strong convexity gives uniqueness of an attained minimiser but domain and existence still need attention. A proved uniform μ>0 and an unconstrained attained minimiser give distance≤gradient norm/μ, with numerical allowances when gradients are computed approximately.
:::

## Gradient steps descent bounds and backtracking {#s4}

Gradient descent uses x_new=x−η∇f(x) with η>0. The negative gradient is a Euclidean steepest first-order direction when nonzero, but a finite step can overshoot or leave the domain. A step rule must control that finite change rather than infer descent from the infinitesimal direction alone. Suppose the gradient is L-Lipschitz, L>0, over a convex region containing the entire segment from x to y: ‖∇f(y)−∇f(x)‖≤L‖y−x‖. Then f(y)≤f(x)+∇f(x)ᵀ(y−x)+(L/2)‖y−x‖², the descent lemma.

Here is a proof requiring only the mean value theorem. Let d=y−x and φ(t)=f(x+td)−f(x)−t∇f(x)ᵀd−(L/2)t²‖d‖² on[0,1]. Its derivative is[∇f(x+td)−∇f(x)]ᵀd−Lt‖d‖²≤0 by Cauchy–Schwarz and the Lipschitz bound. Hence φ is nonincreasing and φ(1)≤φ(0)=0. This produces the finite-change inequality without an unstated integration prerequisite. The segment must stay in the region where the gradient bound is known.

::: worked title="A sufficient step interval from a finite-change bound"
Put y=x−ηg, g=∇f(x). The lemma gives f(y)≤f(x)−η(1−Lη/2)‖g‖². Thus0<η<2/L certifies strict descent when g≠0 and the whole step segment is valid. For L=4, η=.2 has coefficient.2(1−.4)=.12; the objective decreases by at least.12‖g‖². At η=.5 the coefficient is zero, so this argument gives no strict-decrease certificate. Beyond that value the bound does not certify descent; a quadratic can actually diverge, as the lab shows.
:::

For constant admissible η and an objective bounded below, summing the decrease inequality yields Σ‖g_k‖²≤[f(x₀)−f_inf]/[η(1−Lη/2)]. Therefore gradient norms tend to zero if all assumptions continue to hold. The smallest squared gradient among the first K iterates is at most the same numerator divided by K times the coefficient. This is a stationary-residual guarantee, not proof of a global minimum, convergence of the actual input sequence, or suitability for an arbitrary nonconvex network without the hypotheses.

Convexity and an attained minimiser add an objective rate. With η=1/L, write e_k=x_k−x*. The squared-distance recurrence and supporting inequality give ‖e_{k+1}‖²≤‖e_k‖²−(2/L)(f_k−f*)+‖g_k‖²/L². Descent bounds the last term by(2/L)(f_k−f_{k+1}), so f_{k+1}−f*≤(L/2)(‖e_k‖²−‖e_{k+1}‖²). Sum over steps; because objectives decrease, the last gap is no larger than their average. Thus f_k−f*≤L‖e₀‖²/(2k), k≥1. This proof states both existence and smooth convexity rather than attaching an O(1/k) label to every experiment.

If the objective is also μ-strongly convex, Section3 gives ‖g‖²≥2μ(f−f*). Combined with η=1/L descent, the gap shrinks by at most the factor1−μ/L per step. The bound is a theorem under global or invariant-domain hypotheses; an estimated local curvature at one iterate does not automatically establish a uniform μ or L. On a positive-definite quadratic the exact eigenmode analysis below provides a more detailed parameter-error rate.

Backtracking can choose a step without a known global L. Start with a direction p satisfying gᵀp<0, an initial α>0, shrink factor β∈(0,1) and Armijo constant c∈(0,1). Accept only when the trial is in the domain and f(x+αp)≤f(x)+cαgᵀp. Differentiability makes the directional quotient tend to gᵀp, which is strictly below c gᵀp, so sufficiently small positive α succeeds in an open neighbourhood. This proves finite termination in exact arithmetic under a genuine descent direction; it does not make a non-descent Newton direction acceptable or prove global convergence by itself.

::: figure #fig-19-2
A tangent direction and a finite-step upper model distinguish local descent from overshooting. Backtracking tests actual sufficient decrease.
:::

Practical line searches use a finite attempt limit and numerical tolerances. If no trial succeeds, report failure rather than mark the last rejected point accepted. A tiny accepted step may reflect steep curvature, domain restrictions or inaccurate direction information; movement alone does not certify a small gradient or solution error. State the accepted inequality and termination reason, especially when objective evaluations have rounding or simulation noise.

::: check
What hypotheses justify the descent lemma? Does vanishing gradient under a nonconvex descent theorem imply global optimality? Why must backtracking begin with a descent direction?
:::
::: answer
A Lipschitz gradient on the whole valid step segment supplies the bound. Vanishing gradients can approach stationary saddles or other non-global points. The strict negative directional rate is what makes sufficiently small Armijo trials succeed; an arbitrary direction lacks that argument.
:::

## Quadratic eigenmodes conditioning and coordinate scaling {#s5}

For f(x)=(1/2)xᵀAx−bᵀx with symmetric positive-definite A, its unique minimiser solves Ax*=b and gradient is A(x−x*). Error e_k=x_k−x* obeys e_{k+1}=(I−ηA)e_k. In an orthonormal eigenbasis, each scalar mode evolves as c_{i,k+1}=(1−ηλ_i)c_{i,k}. Convergence for every initial error requires every multiplier's magnitude below one. Since all λ_i>0, the exact constant-step interval is0<η<2/λ_max. This is a necessary and sufficient guarantee for this full quadratic family, stronger than interpreting a general sufficient bound as necessary everywhere.

At η=2/λ_max, an excited top mode alternates with unchanged magnitude. Above it that mode grows. An initial error with zero component in an unstable mode may still converge along other modes, so one lucky trace cannot prove global stability. At η=0 no error changes. These boundary cases parallel the scalar Euler factors in Module17 and the matrix dynamics in Module13. The mathematical guarantee quantifies over all starting errors, rather than just the one used in a plot.

::: worked title="The entire step interval and its best worst-case choice"
For A=[[3,1],[1,3]], eigenvalues are μ=2,L=4. The guaranteed interval is0<η<.5. At η=.2 the mode factors are.6,.2; at η=1/3 they are1/3,−1/3; at η=.5 they are0,−1; at η=.55 they are−.1,−1.2. Lab1's start excites the top mode, so boundary and oversized steps visibly fail convergence. Choosing1/3 balances the endpoint magnitudes and minimises the worst contraction factor.
:::

Let ρ=max_i|1−ηλ_i|. Orthogonality gives ‖e_k‖≤ρ^k‖e₀‖. Since objective gap is(1/2)Σλ_i c_{i,k}², it is at mostρ^{2k} times the initial gap. With spectral interval[μ,L], the optimal constant worst-case step is2/(μ+L), balancing1−ημ and−(1−ηL). The worst factor becomes(L−μ)/(L+μ)=(κ−1)/(κ+1), where κ=L/μ. Absolute value of an affine multiplier is largest at an interval endpoint, so intermediate eigenvalues do not worsen that bound. If μ=L, step1/L gives zero factor and solves the quadratic in one step.

Poor conditioning makes scalar steps slow. For A=diag(1,100), using η=1/L=.01 kills the stiff mode immediately but leaves the slow factor.99. After200 steps an initial slow component one is about.13398. The balanced step2/101 instead gives both magnitudes99/101, reducing the full error faster while allowing sign alternation in the stiff mode. A step.1 has stiff factor−9 and diverges even though the low-curvature direction behaves reasonably. One coordinate's improvement cannot certify the full update.

::: figure #fig-19-3
Separate eigenmodes reveal slow, oscillating and growing components. Conditioning determines how well one scalar step serves every direction.
:::

For z=Sx and g(z)=f(S⁻¹z), the transformed Hessian is S⁻ᵀA S⁻¹. Taking S=diag(1,10) for diag(1,100) makes it identity. A unit gradient step in z solves this quadratic immediately; mapped back, it is x_new=x−S⁻¹S⁻ᵀ∇f(x), a preconditioned update. The transformation preserves the objective's meaning when every term and parameter interpretation are transformed consistently. It changes the coordinate metric and the algorithm; it is not a claim that every feature normalisation automatically improves every statistical model.

A positive-semidefinite singular quadratic has different conditions. If b lies in the column space of A, minimisers form x*+N(A); positive eigenmodes can converge with suitable steps while null components of the starting point remain unchanged. If b has a nonzero component along a null vector n, the objective along tn contains the unbounded linear term−t bᵀn, so there is no finite minimiser. Simply inverting nonzero curvature or adding a small diagonal must not conceal that problem-level distinction.

::: widget name=descent
Choose a quadratic curvature preset and step size, then inspect its contour path, spectral multipliers and error after a fixed number of updates. Boundary or unstable factors remain visible.
:::

::: check
Why is the strict interval necessary for every-start quadratic convergence? Can an unstable eigenmode be hidden in one trace? Does rescaling coordinates preserve the original scalar-step gradient method?
:::
::: answer
An eigenvector initial error isolates each multiplier, so magnitude≥1 defeats a universal guarantee. A zero initial component can hide an unstable mode. Coordinate rescaling preserves a consistently transformed objective but maps the update to a generally different preconditioned method.
:::

## Newton coordinate methods and qualified termination {#s6}

Newton's method uses a quadratic local model and solves H(x)p=−∇f(x), then proposes x+p. Solve the linear system rather than explicitly forming H⁻¹; this preserves the mathematical action while allowing appropriate numerical solvers. For a symmetric positive-definite H and nonzero gradient, gᵀp=−pᵀHp<0, so the Newton direction descends locally. A full unit step still needs domain and finite-decrease checks away from a regime where a convergence theorem applies.

::: worked title="One exact quadratic Newton step and an indefinite failure"
For the positive-definite quadratic, H=A and g=A(x−x*). Solving Ap=−g gives p=x*−x, so one full step reaches x* in exact arithmetic. By contrast f(t)=t⁴−3t² at t=.1 has g=−.596 and H=−5.88. Newton p≈−.101360544 has gp>0 and moves toward the local maximum at zero, increasing the objective. The lab replaces this non-descent direction by−g and then tests Armijo decrease. “Newton” alone is not a minimum certificate.
:::

A singular Hessian can give no unique direction or an inconsistent Newton system. In the flat convex example H=diag(2,0),g=(−2,0), a minimum-norm solution p=(1,0) exists; starting at(0,5) reaches the minimiser(1,5), preserving the flat coordinate. Minimum-norm direction is not the same as minimum-norm minimiser. If the gradient has a component outside the Hessian's image, no exact solution exists. A least-squares direction then solves a different local approximation and requires a descent check before use.

Damping can replace H by H+δI, chosen to be positive definite, to obtain a descent direction. This modifies the local step model; it does not automatically mean the original objective has been replaced by a ridge-regularised objective. If regularisation is actually added to f, its gradient changes too and must be differentiated consistently. For nonconvex functions, safeguards can prevent an uphill proposal while still offering no unconditional global solution theorem.

Coordinate descent updates one parameter while holding others fixed. For the positive-definite quadratic, minimising along coordinate i gives x_i_new=x_i−g_i/A_{ii}, since the one-dimensional curvature is A_{ii}>0. Each exact coordinate update decreases f by g_i²/(2A_{ii}), unless that coordinate gradient is zero. A cyclic sweep uses newly updated values in later coordinates, so it is not identical to a simultaneous diagonal-preconditioned gradient step using the old vector everywhere. Convergence conclusions require an appropriate update schedule and problem assumptions, not just coordinatewise progress in a finite run.

For A=[[3,1],[1,3]],b=(2,−1), starting at zero, coordinate-one minimisation gives x₁=2/3. The next coordinate uses this fresh value and solves x₁+3x₂=−1, yielding x₂=−5/9. The sweep decreases the objective but does not reach(7/8,−5/8) immediately; future sweeps continue. Newton solves the coupled system at once, while gradient descent uses one scalar step across all directions. These methods spend different computational effort per update, so iteration counts alone are not a fair cost comparison.

::: figure #fig-19-4
Gradient, coordinate and Newton methods act on the same objective with different local models and costs; curvature safeguards remain part of their contracts.
:::

Near a nondegenerate minimiser, Newton can have quadratic local convergence when the Hessian is sufficiently regular, invertible nearby, and the start lies in the valid neighbourhood. This lesson states that qualified result rather than asserting it for singular minima, distant starts or arbitrary networks. The exact quadratic example is stronger and fully proved here because the local quadratic model equals the entire objective. Backtracking may help reach a suitable regime, but a theorem about the local regime is not itself a theorem about reaching it from every start.

Termination should name the accepted accuracy quantity. Objective change can be tiny because of rounding, flat directions or step damping. A small gradient can reflect objective scaling, as Lab3 demonstrates. A small update can be manufactured by a tiny step. If strong convexity, a curvature interval or another error bound is proved, translate the computed residual into the requested distance or gap and include numerical error allowances. Otherwise report the actual residual, step and reason for stopping as evidence with its stated scope.

Optimising a training objective also does not settle predictive usefulness. The objective may be misspecified, data may differ at evaluation, and a mathematically global training minimiser can generalise poorly. Those are later modelling and statistical questions. Here the complete outcome is the ability to derive a method's update, check its domain and curvature assumptions, and distinguish a proved convergence statement from a finite numerical trace or useful heuristic.

::: check
Why check a nonconvex Newton direction's gᵀp? Does a minimum-norm step select a minimum-norm minimiser? Why are equal iteration counts insufficient to compare Newton and gradient methods?
:::
::: answer
Indefinite curvature can make gᵀp positive, so even the local direction increases the objective. A flat coordinate can remain at its starting value despite a minimum-norm step. Newton system solves, gradient evaluations and coordinate updates have different per-iteration costs and information requirements.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| Finite infimum means an attained solution. | Open and unbounded domains can approach a bound without attaining it. |
| Convex means smooth. | Absolute value is convex with a kink. |
| Zero gradient is always a global certificate. | Convexity or other global evidence is required. |
| A descent direction permits every finite step. | Control the whole step and domain. |
| The quadratic boundary2/L converges for every start. | The top mode can oscillate without decay. |
| One successful start proves stability. | Unexcited unstable modes can be hidden. |
| Newton always moves toward a minimum. | Indefinite curvature can produce an uphill direction. |
| Small movement or gradient always means accurate parameters. | Scaling, damping and flatness can defeat that interpretation. |

## Three reproducible labs {#labs}

### Lab1 · Exact quadratic modes and a Newton solve {#lab1}

{{LAB:lab1}}

Derive the optimum, eigenvalues and each multiplier before running. Explain the boundary's persistent top mode, the oversized step's growth and the exact quadratic Newton result. The finite trace illustrates the already derived all-start interval; it does not substitute for that proof.

### Lab2 · Curvature conditioning and coordinates {#lab2}

{{LAB:lab2}}

Predict the slow factor for step.01, the balanced factors for2/101, and the unstable factor for.1. Verify the transformed objective's identity Hessian and map the update back. Explain why one transformed step is a preconditioned update in the original coordinates.

### Lab3 · Singular non-descent and stopping faults {#lab3}

{{LAB:lab3}}

Distinguish a minimum-norm direction from the resulting flat-family minimiser. Check the nonconvex Newton directional sign, the safeguarded Armijo acceptance, and the scaled objective's distance certificate. Explain which error criterion a small objective gap could satisfy even while parameters remain far from their target.

## Fourteen exercises with full solutions {#exercises}

Exercises1–12 are required. Optional Exercises13–14 add35 minutes beyond the twelve-hour core schedule.

::: exercise #e1 level=1 kind=calculation minutes=7
For f(x)=x² on(0,∞), identify its infimum, attainment and strong-convexity constant. Explain why these are compatible.
:::
::: solution
Infimum zero is approached as x↓0 but is not attained in the domain. The Hessian is two, so μ=2 gives strong convexity there. Strong convexity provides uniqueness if a minimiser is attained; it does not close an open domain or supply a missing endpoint. There is no feasible zero-gradient point here.
:::

::: exercise #e2 level=1 kind=calculation minutes=7
For f(x)=x², x=0,y=2,t=1/4, compute the chord bound and the squared-norm identity's gap.
:::
::: solution
The mixture is1/2,with value1/4. Weighted endpoint value is(3/4)0+(1/4)4=1. Gap3/4 equals t(1−t)(x−y)²=(1/4)(3/4)4. The nonnegative gap proves the convex inequality and is strict for these distinct points and interior weight.
:::

::: exercise #e3 level=1 kind=calculation minutes=7
For a quadratic with eigenvalues2,4, give the full every-start constant-step convergence interval, the balanced step and the worst norm factor.
:::
::: solution
0<η<2/4=.5. Balanced step2/(2+4)=1/3 gives factors1/3,−1/3 and worst magnitude1/3. At the upper boundary the top factor is−1 and need not decay; beyond it an excited top component grows.
:::

::: exercise #e4 level=1 kind=calculation minutes=7
With proved μ=.2 and exact gradient norm.006 at an unconstrained point, what distance and gap bounds follow if a minimiser exists?
:::
::: solution
Distance≤.006/.2=.03. Gap≤.006²/(2·.2)=.00009. These follow from uniform strong convexity and an attained unconstrained minimiser. Approximate computed gradients require a bound on their error before using the same certificate.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Prove a local minimiser of a convex function on a convex domain is global, without requiring differentiability.
:::
::: solution
If a feasible y had f(y)<f(x*), convexity would give f((1−t)x*+ty)≤(1−t)f(x*)+tf(y)<f(x*) for every0<t<1. Such feasible segment points lie arbitrarily near x*, contradicting local minimality. This establishes globality of an existing local minimiser, not existence on every domain.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Derive the descent lemma using the scalar comparison function, then give the gradient-step coefficient.
:::
::: solution
For d=y−x defineφ(t)=f(x+td)−f(x)−t∇f(x)ᵀd−Lt²‖d‖²/2. Lipschitz gradient over the valid segment and Cauchy–Schwarz giveφ′≤0, soφ(1)≤0. Setd=−ηg to obtain f_new≤f−η(1−Lη/2)‖g‖². Positive coefficient requires0<η<2/L. Domain and bound validity over the whole step cannot be omitted.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Prove the SPD quadratic error recurrence and its necessary and sufficient every-start step interval.
:::
::: solution
Ax*=b,so g=Ae and e_new=(I−ηA)e. In an orthonormal eigenbasis each coefficient is multiplied by1−ηλ_i. All starts converge exactly when every magnitude is<1; an eigenvector start disproves the guarantee if any multiplier has magnitude≥1. With positive eigenvalues, simultaneous inequalities give0<η<2/λ_max. Orthogonality also yields norm≤ρ^k times initial norm, withρ the largest magnitude.
:::

::: exercise #e8 level=2 kind=application minutes=12
For A=[[3,1],[1,3]],b=(2,−1), start atzero and perform one cyclic exact coordinate sweep. Compare with a full Newton step.
:::
::: solution
First coordinate solves3x₁+x₂=2 withx₂=0, giving2/3. Second uses freshx₁ and solvesx₁+3x₂=−1, giving−5/9. This sweep decreases the objective but is not the optimum(7/8,−5/8). A Newton solve fromzero gives that optimum in one coupled step. Costs differ, so one sweep and one linear-system solve are not interchangeable units of effort.
:::

::: exercise #e9 level=2 kind=application minutes=12
For A=diag(1,100), choose S so z=Sx makes the consistently transformed Hessian identity. Derive the corresponding original-coordinate unit update.
:::
::: solution
S=diag(1,10),S⁻¹=diag(1,.1),so S⁻ᵀA S⁻¹=I. Unit descent in z maps to x_new=x−S⁻¹S⁻ᵀAx=x−diag(1,.01)Ax=0 for the zero-linear-term quadratic. It is a matrix-preconditioned update, preserving the re-expressed objective while changing its Euclidean coordinate geometry.
:::

::: exercise #e10 level=2 kind=application minutes=12
For f(t)=t⁴−3t² at.1, calculate the Newton direction's sign and propose a valid safeguarded descent-direction test.
:::
::: solution
g=−.596,H=−5.88,p=−g/H≈−.101360544,gp≈.060410884>0. The direction is locally uphill. Replace it by−g=.596,then accept a positive step only when it stays in the domain and satisfies Armijo f(t+αp)≤f(t)+cαgp for0<c<1. A genuine negative gp supports sufficiently small acceptance; this does not establish a global nonconvex minimiser theorem.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=12
A quadratic with eigenvalues1,100 succeeds from a start containing only the first mode atη=.1. The report claims every-start convergence. Repair it.
:::
::: solution
The first factor is.9, so that particular mode decays. The second factor is−9 and was unexcited by the chosen start. Any nonzero second component grows, disproving every-start convergence. The universal interval is0<η<.02. Report the restricted trace separately from the spectral guarantee and test nontrivial components when illustrating stability.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=12
For10⁻¹²(x−100)² atzero, a gradient threshold10⁻⁶ passes. The solver promises parameter error≤.01. Repair the certificate and explain a singular flat Newton case.
:::
::: solution
Gradient norm2·10⁻¹⁰ andμ=2·10⁻¹² give distance bound100,so the promise is unsupported. The sufficient exact-gradient threshold isμ(.01)=2·10⁻¹⁴. For a flat Hessian, a least-squares minimum-norm step can preserve an arbitrary null coordinate, so a selected minimiser may be nonunique and not minimum-norm. Report the requested error quantity, numerical allowances, and which solution representative the method actually selects.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Derive the best constant worst-case quadratic step from curvature interval[μ,L] and express its factor usingκ=L/μ.
:::
::: solution
The maximum of|1−ηλ| over the interval occurs at an endpoint. At the optimum the increasing magnitude from the high endpoint balances the low endpoint:1−ημ=ηL−1. Henceη=2/(μ+L),ρ=(L−μ)/(L+μ)=(κ−1)/(κ+1). Whenμ=L,η=1/L andρ=0,so the quadratic is solved in one step. This is a constant-step worst-mode result, not an unconditional optimal schedule for every nonquadratic objective.
:::

::: exercise #e14 level=3 kind=extension minutes=20
For symmetric PSD A, prove the quadratic has minimisers exactly when b lies in C(A), then explain null-mode iteration behaviour.
:::
::: solution
Symmetry gives C(A)=N(A) perpendicular complement. Ifb has a nonzero null component, choose n∈N(A) withbᵀn≠0; alongtn the quadratic is−t bᵀn and is unbounded below in one direction. Ifb∈C(A),solveAx*=b. Thenf(x)−f(x*)=(1/2)(x−x*)ᵀA(x−x*)≥0,with equality exactly onx*+N(A). Gradient updates do not alter null components because bothAx andb have no null projection. Suitable steps decay positive modes, leaving the starting null component as the selected representative.
:::

## Ten-question self-check {#quiz}

```quiz
? A function has a finite infimum on an open domain. What follows?
- [x] The lower bound need not be attained
- [ ] A minimiser necessarily exists
- [ ] Every stationary point is global
> Domain and attainment are separate. x² on positive inputs approaches zero without a feasible minimiser.

? Does convexity imply smoothness?
- [ ] Always
- [x] No; absolute value is convex with a kink
- [ ] Only if the function is plotted
> Convexity is a segment inequality, while differentiability is a local regularity property.

? When does an interior zero gradient certify global optimality here?
- [ ] For every differentiable function
- [ ] Whenever one finite difference is zero
- [x] For a differentiable convex objective on its convex domain
> The supporting inequality supplies the global comparison. Nonconvex zero gradients can be saddles or maxima.

? A gradient is L-Lipschitz on the valid step region. Which constant interval certifies strict descent away from stationarity?
- [x] 0<η<2/L
- [ ] Every positive step
- [ ] Onlyη=2/L with equality
> The descent coefficientη(1−Lη/2) must be positive. Actual all-start quadratic convergence also has this strict interval.

? An unstable mode is absent from one initial error. What can happen?
- [ ] That absence proves all-start stability
- [x] The trace can converge while the universal guarantee fails
- [ ] The eigenvalue disappears from the objective
> Initial excitation and method stability are different properties.

? Positive objective scaling changes what?
- [ ] The set of minimisers necessarily changes
- [ ] Every suitable step and derivative tolerance stays the same
- [x] Gradient/Hessian scales and associated step/tolerance interpretations
> Positive scaling preserves minimisers but rescales derivative information used by an algorithm.

? A nonconvex Newton direction hasgᵀp>0. What follows locally?
- [x] It is an uphill direction and needs a safeguard
- [ ] Every full step is globally optimal
- [ ] An indefinite Hessian is automatically convex
> Newton solves a local stationary quadratic model; it need not point toward a minimum when curvature is indefinite.

? A minimum-norm Newton direction on a flat quadratic implies what?
- [ ] The resulting minimiser must have minimum norm
- [x] Only the selected step has that norm property; flat starting coordinates may remain
- [ ] The Hessian is invertible
> Lab3 reaches(1,5) through step(1,0),while many minimisers exist.

? A very small gradient establishes parameter accuracy when what is supplied?
- [ ] No other information
- [ ] A very small applied update alone
- [x] A valid error bound with its scale and problem assumptions
> Strong convexity givesdistance≤gradient norm/μ. A tinyμ can leave a large error despite a tiny gradient.
```

<div class="free-response" data-free-response data-key="math-series:m19:q10">
<label for="q10-response">10. Derive the SPD quadratic error recurrence, its every-start step interval and one norm bound. Then explain why a nonconvex zero-gradient report or a small scaled gradient does not supply the same global accuracy certificate.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State curvature, eigenmodes, strict bounds, excitation and the requested error quantity."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I separated objective assumptions, finite traces and termination certificates.</label>
</div>

::: answer
For symmetric SPD A andAx*=b,e_new=(I−ηA)e,with mode factors1−ηλ_i. Every-start convergence requires0<η<2/λ_max;ρ=max|1−ηλ_i| gives‖e_k‖≤ρ^k‖e₀‖. At the boundary a top mode can persist, and an unexcited unstable mode can hide in one trace. Nonconvex zero gradients can be saddles. A scaled gradient becomes a distance certificate only through a proved bound such as‖g‖/μ with uniform strong convexity and an attained unconstrained minimiser; a small number alone has no such interpretation.
:::

## Reading with a purpose {#reading}

Use convex-function and unconstrained-minimisation selections in the authors' [Convex Optimization companion](https://web.stanford.edu/~boyd/cvxbook/). The proofs above derive the particular supporting, descent and spectral bounds used by this lesson, and its labs make each numerical convention explicit.

| When | Selection and question |
|---|---|
| Session1 · 20 minutes | Convexity and supporting inequalities: what is global, what is local, and which regularity is required? |
| Session4 · 20 minutes | Unconstrained methods and line search: what makes a direction descend, a step acceptable and a stopping quantity interpretable? |

## Retrieval exit task and next step {#summary}

Prove a convex example and a local-to-global certificate, derive the Lipschitz-gradient decrease bound, and analyse each quadratic eigenmode. Contrast gradient, cyclic coordinate and Newton updates with their costs and safeguards.

**Exit task:** For curvaturediag(1,100),state the universal interval0<η<.02,balanced step2/101 and its norm factor99/101. Explain whyη=.1 can appear successful from a first-mode-only start while failing generally, and why coordinate scaling changes the update metric.

**Ready to move on:** you can connect optimisation behaviour to stated objective, domain and curvature assumptions. Constrained optimisation next adds feasible directions, multipliers, KKT conditions and dual bounds. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| Infimum / minimiser | Greatest lower bound / feasible attaining point | 下确界、极小点 |
| Convex / strict / strong | Chord inequality / strict chords / uniform quadratic margin | 凸、严格凸、强凸 |
| L / μ | Gradient smoothness bound / strong-convexity margin | 光滑常数、强凸常数 |
| η / Armijo | Step scale / sufficient-decrease acceptance | 步长、充分下降 |
| ρ / κ | Worst mode magnitude / curvature ratio | 收缩因子、条件数 |
| Preconditioning | Matrix-scaled update under a chosen coordinate metric | 预条件 |
| Newton / coordinate step | Coupled curvature solve / one-coordinate minimisation | 牛顿、坐标下降 |
| gᵀp / termination | Directional rate / stated finite stopping decision | 方向变化率、终止 |
