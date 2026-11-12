## A solver must respect the problem's feasible set {#start}

A training loss, resource budget or scheduling objective becomes a different problem when constraints are added. A boundary optimum can have a nonzero ordinary gradient. A multiplier is useful only with the correct sign convention, feasibility conditions and theorem assumptions. This lesson develops explicit certificates, derives projections and dual bounds, and shows why a stationary report or finite penalty does not automatically solve a constrained problem.

**Retrieval check:** [Module 19](module_19_EN.html#s2) supplies convex supporting inequalities, curvature bounds and gradient descent. [Module 18](module_18_EN.html#s2) supplies gradients and Jacobian dimensions. Labs use NumPy and run entirely on the CPU. All multipliers below use inequalities written as g_i(x)≤0 and the Lagrangian sign convention +λ_i g_i(x).

## Feasible sets active constraints and nearest-point projection {#s1}

Write a constrained problem as minimise f(x) subject to x∈D, g_i(x)≤0 and h_j(x)=0. The set C of points satisfying every restriction is the feasible set. D is the common domain on which objective and constraints are defined. An infeasible point has no standing as a proposed primal solution, however attractive its objective value. A feasible set may be empty, disconnected, unbounded or a lower-dimensional surface; these properties affect both existence and methods. A continuous objective on a nonempty compact C attains a minimum, while closedness alone does not suffice on an unbounded set.

An inequality is active at x when g_i(x)=0; it is inactive when g_i(x)<0. Equality constraints are always imposed, rather than being switched on by a solver. For the box 0≤x_i≤1, write the lower restriction as −x_i≤0 and the upper as x_i−1≤0. Their gradients are −e_i and +e_i. Reversing one restriction without reversing its multiplier convention changes the stationarity equation. Redundant descriptions can give the same C with different, even nonunique, multiplier representations.

Feasible directions express the local geometry. At a smooth boundary g_i(x)=0, a differentiable feasible curve with velocity d must satisfy ∇g_i(x)ᵀd≤0; equality curves require ∇h_j(x)ᵀd=0. These are necessary linearised tests, not automatically sufficient to construct a curve. Curvature or singular constraints can rule out a direction that passes them. The degenerate equation x²=0 at zero has zero linearisation, yet its feasible set contains only zero. Section 2 explains the missing regularity.

For a nonempty closed convex C⊂Rⁿ, the Euclidean projection P_C(v) is the unique point p∈C minimising (1/2)‖p−v‖². Existence follows by restricting to a sufficiently large closed ball around v containing one feasible point: farther points cannot improve that point's distance, and the restricted set is compact. Strict convexity of squared distance gives uniqueness, since two distinct minimisers would have a closer midpoint. On nonconvex C nearest points can be nonunique, so the same notation needs an explicit selection rule and does not inherit the convex properties used here.

Projection has a variational characterisation: p=P_C(v) exactly when (v−p)ᵀ(z−p)≤0 for all z∈C. Necessity follows by differentiating squared distance along the feasible segment p+t(z−p) at t=0 from the right. For sufficiency expand ‖z−v‖²=‖p−v‖²+‖z−p‖²−2(v−p)ᵀ(z−p); the last two terms are nonnegative. This supplies a global nearest-point proof, not merely a sampled comparison. Adding the two projection inequalities for v,w yields ‖P_C(v)−P_C(w)‖²≤(v−w)ᵀ(P_C(v)−P_C(w)), hence nonexpansiveness by Cauchy–Schwarz.

::: worked title="Box projection and simplex projection are different operations"
For v=(1.2,.4,−.2), box projection onto [0,1]³ clips coordinates to (1,.4,0). Projection onto the probability simplex C={x≥0:Σx_i=1} is instead (.9,.1,0). Its threshold θ=.3 satisfies x_i=max(v_i−θ,0) and Σx_i=1. Clipping then normalising gives (5/7,2/7,0), which is feasible but farther from v: feasibility alone is not Euclidean optimality. The projection's squared distance is .22, so its half-squared objective is .11.
:::

For a box the objective separates by coordinate, so scalar clipping gives its exact projection. For the simplex, the common threshold couples coordinates. Sort v into u₁≥…≥u_n and define θ_j=(Σ_{i≤j}u_i−1)/j. Let ρ be the largest index with u_ρ>θ_ρ; then θ=θ_ρ and x_i=max(v_i−θ,0). The selected positive coordinates sum to one, the others lie below the threshold, and the KKT certificate in Section 3 proves nearest-point optimality. There is always an eligible index because u₁>u₁−1. Sorting costs O(n log n), so projection itself has a computational cost.

::: figure #fig-20-1
The feasible set determines the nearest point: a box permits independent clipping, whereas a simplex couples coordinates through a shared threshold.
:::

::: check
Does a small objective repair infeasibility? Is an active inequality the same as a positive multiplier? Can passing a linearised direction test establish feasibility at a singular constraint?
:::
::: answer
No: primal feasibility is a separate requirement. An active constraint can have zero multiplier, as later examples show. The equation x²=0 has zero linearisation at its only feasible point, so linearisation alone admits spurious directions.
:::

## Equality multipliers and the regularity they require {#s2}

For equality constraints h:Rⁿ→Rᵐ, the Jacobian J_h(x) has m rows, one gradient transpose per constraint. At a regular feasible point with independent equality gradients, J_h has full row rank m. The tangent space is N(J_h). A constrained differentiable local minimum has zero first-order objective rate along every tangent direction, so ∇f lies in N(J_h)⊥=C(J_hᵀ). Consequently some ν∈Rᵐ satisfies ∇f(x)+J_h(x)ᵀν=0. Define the equality Lagrangian L(x,ν)=f(x)+νᵀh(x). Its x-gradient is precisely this stationarity equation.

The step from tangent vectors to actual nearby feasible curves uses the regular level-set theorem, a consequence of the implicit function theorem. We state that regularity result here; linear algebra alone cannot prove that arbitrary null vectors describe the actual surface at a singular point. This is why full row rank is part of the necessity theorem. Equality multipliers have unrestricted signs because an equality has neither a one-sided interior nor an inequality orientation. Multipliers are attached to the stated equations, so rescaling an equation rescales its multiplier inversely.

::: worked title="Minimum distance to a line with an equality multiplier"
Minimise f(x,y)=(x²+y²)/2 subject to x+y=b. Take L=f+ν(x+y−b). Stationarity gives x+ν=0 and y+ν=0; feasibility then gives x=y=b/2, ν=−b/2 and value V(b)=b²/4. For b=2, the answer is (1,1), ν=−1 and value 1. The residual along the line is a nonnegative squared displacement, so this is the unique global optimum, not merely a stationary candidate.
:::

In general, for f(x)=(1/2)xᵀQx+cᵀx and Ax=b, with symmetric Q, stationarity and feasibility form the block system Qx+Aᵀν=−c, Ax=b. The matrix is [[Q,Aᵀ],[A,0]], often called the saddle-point system. If Q is positive definite and A has independent rows, it is invertible: a homogeneous solution obeys Qd+Aᵀw=0 and Ad=0; multiplication by dᵀ gives dᵀQd=0, hence d=0 and then Aᵀw=0 implies w=0. Solve this system rather than form an explicit inverse.

Positive definiteness on all of Rⁿ is sufficient but stronger than necessary. Only directions preserving Ax=b are relevant to primal uniqueness: if dᵀQd>0 for every nonzero d∈N(A), the objective is strictly convex along that affine feasible space. With independent rows this also makes the block system invertible by the same argument restricted to N(A). Curvature normal to the feasible space can be negative without harming this particular constrained minimum. General nonlinear constraints add curvature through the Hessian of the Lagrangian, so checking ∇²f alone along a curved surface may be inadequate.

Stationarity is a necessary candidate condition under regularity, not an unconditional minimum certificate. Minimise x²+y² on the unit circle x²+y²=1: every feasible point has the same value, and a suitable multiplier satisfies stationarity everywhere. For minimising x on that circle, stationarity produces both (−1,0) and (1,0); one is the minimum and one the maximum. Compare values, use suitable second-order conditions, or use a convex global certificate when its assumptions hold. The circle equality is nonlinear and its feasible set is not convex.

::: worked title="A genuine optimum can have no equality multiplier"
Minimise f(x)=x subject to h(x)=x²=0. The only feasible point is zero, so zero is the global minimiser. But h′(0)=0 and f′(0)=1, making stationarity 1+ν·0=0 impossible for every finite ν. The constraint Jacobian is singular. This does not disprove the qualified multiplier theorem; it disproves applying it without its rank assumption. Replacing the equation by x=0 preserves the feasible set and restores an ordinary multiplier.
:::

Multipliers can measure optimal-value sensitivity when a suitable differentiable solution branch and value function exist. With h(x)−b=0 written inside L, the derivative of V with respect to b is −ν*, not +ν*. In the line example V′(b)=b/2=−ν*. This follows by differentiating f(x*(b)), using stationarity and the derivative J_h x*′=1. At switches, degeneracies or nondifferentiable value functions, a unique ordinary sensitivity derivative may not exist. A multiplier cannot be interpreted as a universal finite-change price without checking these conditions and the perturbation convention.

::: check
Why are equality multipliers unrestricted? What breaks in the x²=0 example? With a constraint written h(x)−b=0, which sign gives value sensitivity?
:::
::: answer
An equality has no one-sided inequality orientation. Its zero gradient at the feasible point invalidates the full-row-rank necessity assumption. For a differentiable optimal branch the sensitivity is −ν*, so the equation's sign and scale must accompany the reported price.
:::

## Inequality multipliers and all four KKT conditions {#s3}

For differentiable f,g_i,h_j use L(x,λ,ν)=f(x)+Σλ_i g_i(x)+Σν_j h_j(x). The Karush–Kuhn–Tucker conditions are primal feasibility g_i≤0,h_j=0; dual feasibility λ_i≥0; complementarity λ_i g_i=0 for each inequality; and stationarity ∇f+Σλ_i∇g_i+Σν_j∇h_j=0. Each line has a separate purpose. Complementarity permits positive multipliers only on active inequalities, but permits zero multipliers on active ones too. Inequality signs belong to the chosen g≤0 convention; equality ν remains unrestricted.

$$
\begin{aligned}
g_i(x)&\leq0, & h_j(x)&=0,\\
\lambda_i&\geq0, & \lambda_i g_i(x)&=0,\\
\nabla_x L(x,\lambda,\nu)&=0.
\end{aligned}
$$

For smooth problems, a local optimum has KKT multipliers under a suitable constraint qualification. One sufficient qualification is linear independence of the equality gradients and gradients of all active inequalities at the point, abbreviated LICQ. It excludes redundant active gradients and singular descriptions. We state the qualified necessity theorem rather than derive it from an unproved direction argument. Other qualifications can be weaker, so failure of LICQ does not establish that no multipliers exist. Conversely an unqualified optimum need not possess them, as the singular equality example demonstrated.

::: worked title="A scalar lower bound requires the correct multiplier sign"
Minimise (x−a)²/2 subject to x≥0, represented as g(x)=−x≤0. Stationarity is x−a−λ=0. If a>0 the optimum x=a is interior and λ=0. If a<0 the optimum x=0 has λ=−a>0. If a=0 the bound is active but λ=0. For a=−2, gradient at the optimum is 2, and the positive lower-bound multiplier cancels it: 2−2=0. A zero ordinary gradient would incorrectly reject this optimum.
:::

Convex KKT conditions provide a global sufficient certificate: assume f and all g_i are differentiable convex on a common convex domain and h=Ax−b is affine. At a feasible KKT point x*, the Lagrangian for its λ*,ν* is convex because λ*≥0. Stationarity and the convex supporting inequality imply L(x,λ*,ν*)≥L(x*,λ*,ν*)=f(x*) for all domain points. For a feasible x, L(x,λ*,ν*)≤f(x). Combining gives f(x)≥f(x*). This proof needs no constraint qualification for sufficiency; the qualification enters when asserting that an optimum must have such a certificate.

For the simplex projection in Section 1 take g_i(x)=−x_i and h(x)=Σx_i−1. Stationarity is x_i−v_i+θ−λ_i=0. With x_i=max(v_i−θ,0), choose λ_i=max(θ−v_i,0). Both signs and complementarity hold. For v=(1.2,.4,−.2), x*=(.9,.1,0), θ=.3 and λ=(0,0,.5). Squared distance is strongly convex and the simplex is convex, so this certificate proves the unique global projection. It also explains why the shared threshold is not an arbitrary normalisation recipe.

Resource allocation often uses a budget inequality Σx_i≤B along with nonnegativity. Minimise (1/2)Σ(x_i−a_i)² with a=(3,1), B=2. The budget is active at x=(2,0), its multiplier is 1, and both lower-bound multipliers are zero. Stationarity is x−a+λ_B(1,1)−λ_lower=0; the second coordinate's zero is active despite its zero lower price. Increasing B slightly below 2 has value derivative −λ_B=−1 at B=2 in this example, reflecting decreased loss from a relaxed upper budget. The active set can change as B crosses this value.

::: figure #fig-20-2
Primal feasibility, dual feasibility, stationarity and complementary slackness are separate checks. An active bound can still have a zero price.
:::

Outside convexity, KKT points can be maxima or saddles. For f(x)=−x² on −1≤x≤1, x=0 with both multipliers zero satisfies KKT, but the global minimum value −1 occurs at the endpoints. All active-gradient qualification concerns at zero are harmless because there are no active inequalities, yet sufficiency still fails: necessity regularity cannot supply missing objective convexity. A numerical residual table should therefore identify the theorem under which the residuals are being used, rather than label every small stationarity number “global optimum.”

::: check
What are all four KKT lines? Does an active inequality force a positive multiplier? Does the convex sufficiency proof require LICQ?
:::
::: answer
Check primal feasibility, dual feasibility, complementarity and stationarity. Active bounds may have zero multiplier. The convex proof uses a supplied feasible KKT certificate; it needs convex objective/inequalities and affine equalities, but no rank qualification for sufficiency. Qualification is a separate necessity issue.
:::

## Dual functions and weak duality as a proved lower bound {#s4}

Fix λ≥0 and any ν. The dual function q(λ,ν)=inf_{x∈D}L(x,λ,ν) minimises the Lagrangian over the whole domain D, without imposing the primal constraints again. Keeping those restrictions inside the infimum generally computes a different object. The dual value may be −∞; evaluating L at one convenient x gives an upper bound on this infimum, not a certified lower bound on the primal optimum. When computing q analytically, verify the minimisation or bound it in the required direction.

Weak duality follows directly. For every primal-feasible x, λ_i g_i(x)≤0 and νᵀh(x)=0, hence q(λ,ν)≤L(x,λ,ν)≤f(x). Therefore q(λ,ν)≤p*, the primal infimum. This holds for nonconvex objectives and constraints as well; its essential ingredients are the multiplier signs, feasibility and a genuine domain infimum. The dual problem maximises q over λ≥0,ν unrestricted, with optimal supremum d*≤p*. Equality of these two optimal values is strong duality, which requires more than this elementary bound.

The dual function is concave in the multipliers even when the primal problem is nonconvex. For two multiplier vectors and t∈[0,1], each Lagrangian at fixed x is affine in those vectors. Its mixed value is at least t times the first infimum plus (1−t) times the second infimum; taking an infimum over x preserves that lower bound. Thus q at the mixture is at least the mixture of q values, the concave inequality. Extended values of −∞ require care, but do not make an arbitrary nonconvex primal easy to solve or eliminate a duality gap.

::: worked title="An equality-constrained quadratic has an explicit dual"
For f=(x²+y²)/2 and x+y=b, L=(x²+y²)/2+ν(x+y−b). Completing squares gives q(ν)=−ν²−νb, attained in x,y at (−ν,−ν). This concave quadratic is maximised at ν=−b/2 with q=b²/4, matching the primal value. At b=2, ν=0 gives the valid but loose lower bound 0; ν=−1 gives the tight bound 1. A valid dual bound need not be an optimal one.
:::

For the simplex squared-distance problem, take equality θ and lower-bound vector λ≥0. Minimising L over Rⁿ gives x=a−θ1+λ and q(θ,λ)=θ(Σa_i−1)−λᵀa−(1/2)‖θ1−λ‖². At θ=.3 and λ=(0,0,.5) this is .11, matching f(.9,.1,0). The minimiser of L happens to be primal feasible at this optimal certificate, but primal feasibility was not imposed while deriving q. At other multipliers the Lagrangian minimiser can violate the simplex; that is allowed in the dual infimum.

$$q(\theta,\lambda)=\theta(\mathbf1^Ta-1)-\lambda^Ta-\frac12\|\theta\mathbf1-\lambda\|^2.$$

A feasible candidate x and valid dual bound q give 0≤f(x)−p*≤f(x)−q. The computable primal-dual gap is therefore an objective-accuracy certificate even if the primal optimiser is not known, provided q truly is a lower bound and x is feasible. An infeasible candidate can have f(x)<q without violating weak duality, because the theorem never compared infeasible objective values. A negative inequality multiplier likewise invalidates the bound's sign argument. Report feasibility residuals and dual-bound validity alongside a candidate difference.

If a computed q is approximate, an upper-biased approximation is unsafe as a lower certificate. Suppose a Lagrangian minimiser solve returns value L(x_trial,λ,ν); this is ≥q, so it cannot simply replace q in a certified gap. A proven lower error allowance can repair it: if L_trial−q≤ε, then L_trial−ε is a valid lower bound. In small quadratics complete the square and solve accurately with suitable error analysis. In larger systems a useful approximate numerical trace is still distinct from a rigorous bound unless its error direction is controlled.

::: check
Over which set is q's infimum taken? Does one trial Lagrangian value certify a lower bound? Can an infeasible primal candidate have an objective below a valid dual bound?
:::
::: answer
Over the common domain, without reimposing the primal restrictions. A trial value is an upper bound on the infimum, so it is insufficient without a downward error allowance. An infeasible candidate is outside the weak-duality comparison and can indeed fall below the dual bound.
:::

## Strong duality Slater's condition and sensitivity limits {#s5}

For the standard finite-dimensional convex problem with convex finite-valued f,g_i on Rⁿ and affine equalities Ax=b, a useful sufficient Slater condition is existence of a point x̄ satisfying Ax̄=b and every g_i(x̄)<0. With a finite primal optimal value, this condition gives strong duality and an attained dual optimum. This is the qualified Slater theorem, stated here rather than proved from projection or gradient descent. Its full treatment uses a separating-hyperplane argument. The original reading provides that theorem; our lower-bound and KKT sufficiency proofs stand independently of it.

For functions with restricted convex domains, a corresponding condition uses a feasible point in the relative interior of the common domain, rather than demanding interior in the whole ambient space. Relative interior means interior within its affine hull. The domain and theorem version must be stated: a simplex has empty ambient interior yet nonempty relative interior within its sum-one hyperplane. Some affine inequalities admit weaker refined Slater versions, but the stricter finite-valued version above is sufficient for this lesson's examples. Do not transform a sufficient condition into an unconditional equivalence.

Strong duality compares infimum and supremum values. It does not, by itself, say a primal minimiser is attained, nor that each multiplier is unique. For example minimise exp(x) on R with no constraints: the primal infimum and unconstrained dual value are zero, but no finite x attains that value. If the convex problem has an attained primal optimum and attained dual optimum with equal values, the chain q≤L≤f forces complementarity and global Lagrangian minimisation. In differentiable problems with the stated domain assumptions, stationarity then produces KKT. Primal attainment remains a separate fact to establish.

::: worked title="Slater holds for the simplex QP and supplies a necessity route"
For the three-coordinate simplex, x̄=(1/3,1/3,1/3) satisfies the affine sum equality and all −x_i<0. The squared-distance objective and inequalities are convex and finite on R³. Compactness supplies primal attainment, Slater supplies zero optimal gap and dual attainment, and strict convexity supplies a unique primal minimiser. None of these statements forces every active multiplier to be strictly positive or ensures every numerical iterate is already feasible.
:::

Failure of Slater is inconclusive, rather than a proof of a positive gap. Minimise x² subject to x=0 and x≤0. No strict inequality point can satisfy the equality, yet p*=0 and the zero multipliers yield q=0. Thus strong duality holds despite this version of Slater failing. The equation and inequality are partly redundant. This example also distinguishes the geometry of the feasible set from a particular algebraic description and explains why other constraint qualifications or refined theorems may work when a simple condition does not.

Consider instead minimise x subject to x²≤0. The only feasible point is zero with p*=0, and there is no strict feasible point. For λ>0, q(λ)=inf_x(x+λx²)=−1/(4λ); at λ=0 it is −∞. Its supremum is zero as λ→∞, so strong duality holds as equality of values, but no finite dual multiplier attains it. KKT would require 1+2λx=0 at x=0 and is impossible. This example separates zero gap, dual attainment and multiplier necessity; those three statements must not be collapsed into one label.

Conversely strict feasibility alone cannot replace convexity. For minimise −x² on −1≤x≤1, x=0 is strictly feasible for the two affine inequalities. Nevertheless every Lagrangian over R retains its negative quadratic leading term, so q=−∞ for every λ≥0 and d*=−∞ while p*=−1. The convex Slater theorem does not apply because the objective is concave. A feasible interior point and a KKT stationary point cannot make this problem globally convex. Lab 3 exposes exactly this invalid inference.

Dual multipliers have a qualified perturbation interpretation. Write inequalities g_i(x)≤u_i and equalities h(x)=v. An optimal original dual pair gives V(u,v)≥V(0,0)−λ*ᵀu−ν*ᵀv when the original primal-dual values match: evaluate that pair's shifted dual lower bound. This is a supporting bound on the value function. If V is differentiable, its derivatives equal the corresponding negative multipliers; otherwise several dual optima can supply different supporting slopes. A positive upper-budget multiplier describes the local value of relaxing that budget in the stated units, not a fixed price valid for every finite perturbation.

::: figure #fig-20-3
Weak duality is always a sign-based lower bound. Zero gap, attainment and convex multiplier theorems require separately stated facts.
:::

::: check
Does Slater failure imply a positive gap? Does zero optimal gap imply a finite optimal multiplier? Can strict feasibility compensate for a nonconvex objective?
:::
::: answer
No: redundant constraints can violate strict feasibility while retaining zero gap. The x²≤0 example has zero gap with no attained finite dual optimum. The downward quadratic on a box is strictly feasible but has dual value −∞; the convex theorem's objective assumption is essential.
:::

## Projected gradients penalties and a complete quadratic programme {#s6}

For a nonempty closed convex C and differentiable f, projected gradient uses x⁺=P_C(x−α∇f(x)), starting from a feasible x and choosing α>0. Exact projection makes every iterate feasible. The projection variational inequality with z=x gives ∇f(x)ᵀd≤−‖d‖²/α, where d=x⁺−x. Combine with the L-Lipschitz-gradient descent lemma to obtain f(x⁺)≤f(x)−(1/α−L/2)‖d‖². Thus 0<α<2/L gives strict decrease whenever the projected update moves, assuming the smoothness bound covers feasible segments. This is a statement about the feasible update, not the unprojected proposal.

Define the projected-gradient mapping G_α(x)=(x−P_C(x−α∇f(x)))/α. Its zero condition is equivalent to ∇f(x)ᵀ(z−x)≥0 for all z∈C by the projection characterisation. If f is convex, its supporting inequality makes this a global minimiser certificate. Ordinary ∇f can remain nonzero at a boundary. The mapping depends on α and the projection metric, and a small computed mapping needs an appropriate error bound before it becomes a distance promise. A zero result caused by rounding or inaccurate projection is not the exact mathematical fixed-point statement.

For convex f and α≤1/L, compare the projection inequality with a minimiser x*. Convex support at x and smooth upper control at x⁺ give f(x⁺)−f(x*)≤∇f(x)ᵀ(x⁺−x*)+(L/2)‖d‖². The projection inequality bounds the first term by (x−x⁺)ᵀ(x⁺−x*)/α. Expanding this dot product gives the telescoping bound f(x⁺)−f(x*)≤(‖x−x*‖²−‖x⁺−x*‖²)/(2α), after dropping the nonpositive term −(1/α−L)‖d‖²/2. Summation and objective monotonicity yield f(x_k)−f(x*)≤‖x₀−x*‖²/(2αk). State existence of x*, convexity, exact projection and fixed α together with the rate.

::: worked title="Projected descent solves the simplex problem without forcing zero raw gradient"
Minimise f(x)=‖x−a‖²/2, a=(1.2,.4,−.2), on the simplex. Here L=1 and x*=(.9,.1,0), f*=.11. With α=.5 and x₀=(1/3,1/3,1/3), every projected iterate is feasible and descends. At the optimum raw gradient is (−.3,−.3,.2), but projection of x*−.5∇f(x*) returns x* exactly. The valid θ=.3, lower multipliers (0,0,.5) and dual value .11 provide an independent global certificate for the final result.
:::

Penalty methods instead change the objective. For an equality h=0, squared penalty f+(ρ/2)‖h‖² discourages violations but generally leaves nonzero violations at finite ρ. Minimise (x−2)²/2 subject to x=0: the true answer is zero, whereas the penalised minimiser is 2/(1+ρ)>0 for every finite positive ρ. Its constraint gradient contribution approaches the required equality multiplier as ρ grows, but the iterate is still infeasible. Large ρ can also introduce severe curvature conditioning. Exact projection and a finite smooth penalty therefore solve different intermediate problems.

Some nonsmooth penalties can be exact under appropriate assumptions and a sufficiently large weight related to multipliers. In that same scalar example, (x−2)²/2+ρ|x| has minimiser zero for ρ≥2, as the left derivative −2−ρ≤0 and right derivative −2+ρ≥0 bracket zero there and the objective is convex. This illustrative exactness does not make every finite squared penalty exact or remove the need for nonsmooth optimality treatment. Domain violations that make f undefined must still be prevented; a penalty cannot evaluate a logarithm at an invalid point.

::: figure #fig-20-4
Projection enforces feasibility at each accepted iterate. A squared penalty generally trades objective decrease against a remaining violation at finite weight.
:::

The full QP workflow is to specify Q,c,C, check convexity and feasibility, derive an analytic candidate where possible, run a method with its step and projection contract, then check the resulting primal and dual quantities. Lab 3 deliberately supplies an infeasible point that passes stationarity and a negative multiplier that invalidates a dual bound. Tolerances should be stated in the units of each equation; rescaling constraints alters raw residuals and multipliers. Solver termination, mathematical feasibility and certified objective accuracy remain separate conclusions.

::: widget name=projection
:::

The explorer uses the two-coordinate simplex x+y=1, x,y≥0 and half-squared distance to a=(a₁,a₂). Its exact projection has x=clip((a₁−a₂+1)/2,0,1), y=1−x. Move a through an active-set switch, then choose an infeasible candidate or negative-multiplier fault. The displayed stationarity and dual expressions are recomputed for that candidate; a small stationarity residual or candidate difference cannot bypass the feasibility and sign checks.

The same foundations support allocation, constrained learning and support-vector formulations later. Applications can add nonsmooth losses, very large sparse systems or noisy gradients, which require their own method contracts. This lesson's outcome is a complete small convex certificate and a justified feasible algorithm, together with precise reasons why a nonconvex KKT point, failed qualification or finite penalty cannot inherit those conclusions automatically.

::: check
Which gradient quantity can vanish at a boundary optimum? What assumptions give the projected O(1/k) gap bound? Is a finite squared penalty an exact feasibility method?
:::
::: answer
The projected-gradient mapping can vanish while the ordinary gradient is nonzero. The rate requires convex smooth f, an attained minimiser, exact projection onto closed convex C and fixed 0<α≤1/L. The scalar penalty example has positive violation at every finite ρ, so it does not enforce exact equality.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| Small objective repairs infeasibility. | A primal candidate must satisfy all restrictions. |
| Normalised clipping is a simplex projection. | A shared threshold solves the nearest-point problem. |
| Every optimum has multipliers. | Necessity needs a qualification or another applicable theorem. |
| Every active constraint has positive price. | Active constraints may have zero multiplier. |
| KKT always certifies a global minimum. | Convex sufficiency requires convex objective/inequalities and affine equalities. |
| A trial Lagrangian value is a dual lower bound. | It is an upper bound on the domain infimum. |
| Failed Slater means positive gap. | The condition is sufficient, not necessary. |
| Finite squared penalties enforce equalities exactly. | They generally leave a violation. |

## Three reproducible labs {#labs}

### Lab 1 · Box and simplex projections {#lab1}

{{LAB:lab1}}

Derive both nearest points and predict the threshold before running. Compare squared distances with the normalisation shortcut. Testing every simplex vertex proves the variational inequality for all its convex combinations in this particular finite simplex.

### Lab 2 · Feasible projected-gradient descent {#lab2}

{{LAB:lab2}}

Check every iterate's sum, nonnegativity and objective decrease. Explain the distinction between the raw gradient and the projected mapping at x*. A residual measured before an update belongs to that starting iterate, rather than the newly accepted point.

### Lab 3 · KKT duality and penalty faults {#lab3}

{{LAB:lab3}}

Report all five displayed residual quantities, including separate equality and inequality feasibility. Explain the infeasible candidate's negative difference from a valid dual bound, the invalid negative multiplier, and the qualified theorem failures. Keep the two imported projection scripts together when downloading Lab 2.

## Fourteen exercises with full solutions {#exercises}

Exercises 1–12 are required. Optional Exercises 13–14 add 35 minutes beyond the twelve-hour core schedule.

::: exercise #e1 level=1 kind=calculation minutes=7
Project (−.5,.3,1.4) onto [0,1]³ and state the squared distance.
:::
::: solution
Coordinate clipping gives (0,.3,1). Squared displacement is .25+0+.16=.41. The separable nearest-point objective justifies clipping for this box; a sum constraint would couple the coordinates.
:::

::: exercise #e2 level=1 kind=calculation minutes=7
Project (1.2,.4,−.2) onto the simplex and give its equality and lower-bound multipliers for half-squared distance.
:::
::: solution
Threshold θ=.3 gives (.9,.1,0); λ=(0,0,.5). Stationarity x−v+θ1−λ=0 holds componentwise, all coordinates are nonnegative and sum to one, λ≥0 and λ_i x_i=0. Convex KKT sufficiency proves the unique nearest point.
:::

::: exercise #e3 level=1 kind=calculation minutes=7
Solve min (x²+y²)/2 subject to x+y=4 and interpret its equality multiplier.
:::
::: solution
Stationarity x+ν=y+ν=0 yields x=y=2 and ν=−2. Value V(4)=4. Since V(b)=b²/4, sensitivity at b=4 is V′=2=−ν. The sign corresponds to writing x+y−b=0.
:::

::: exercise #e4 level=1 kind=calculation minutes=7
Solve min (x+3)²/2 subject to x≥0 with g=−x. List every KKT line.
:::
::: solution
x*=0, λ=3. Primal −x≤0 holds; dual λ≥0 holds; complementarity λ(−x)=0; stationarity x+3−λ=0. Convexity gives global sufficiency and strict convexity gives uniqueness. The raw objective gradient is 3.
:::

::: exercise #e5 level=2 kind=proof minutes=15
Prove the projection variational characterisation on a closed convex feasible set.
:::
::: solution
At a nearest point p, differentiate ‖p+t(z−p)−v‖²/2 along its feasible segment to obtain (p−v)ᵀ(z−p)≥0. Conversely expand squared distance as in Section 1: the variational sign makes every z at least as far as p. Strict convexity supplies uniqueness. Existence follows separately from closedness, nonemptiness and a bounded sublevel set.
:::

::: exercise #e6 level=2 kind=proof minutes=15
Prove weak duality and say exactly where multiplier signs and primal feasibility enter.
:::
::: solution
For λ≥0 and feasible x, each λ_i g_i(x)≤0 and equality terms vanish. Thus q=inf_D L≤L(x)≤f(x); taking a primal infimum gives q≤p*, and maximising valid multipliers gives d*≤p*. Negative λ or infeasible x breaks the second inequality. Convexity is unnecessary for this bound.
:::

::: exercise #e7 level=2 kind=proof minutes=15
Prove global sufficiency of convex KKT conditions without claiming unconditional necessity.
:::
::: solution
For convex f,g, affine h and λ*≥0, L at fixed optimal multipliers is convex. Stationarity implies its global minimum at x*. Complementarity and primal feasibility give L(x*)=f(x*). For any feasible z, f(z)≥L(z)≥L(x*)=f(x*). Necessity of existence of multipliers requires a qualification such as applicable Slater or LICQ, which this sufficiency proof did not assume.
:::

::: exercise #e8 level=2 kind=application minutes=12
Allocate nonnegative (x₁,x₂) under x₁+x₂≤2 to minimise half-squared distance to (3,1). Give the optimum and multipliers.
:::
::: solution
x=(2,0), budget multiplier 1 and lower-bound multipliers (0,0). Gradient (−1,−1) is cancelled by budget gradient times 1. The budget is active; the second lower bound is also active but has zero price. All KKT lines hold and convexity gives global optimality. Objective is 1 and the minimiser is unique.
:::

::: exercise #e9 level=2 kind=application minutes=12
Derive the dual q for min (x²+y²)/2 subject to x+y=2. Compare ν=0 and ν=−1.
:::
::: solution
Completing squares gives q(ν)=−ν²−2ν. At zero it gives the lower bound 0; at −1 it gives 1, equal to the feasible value at (1,1). The Lagrangian infimum was taken over R², and its minimiser (−ν,−ν) need not be feasible at a nonoptimal multiplier.
:::

::: exercise #e10 level=2 kind=application minutes=12
For the simplex QP with a=(1.2,.4,−.2), verify a dual value at θ=.3, λ=(0,0,.5) and certify a feasible candidate's objective accuracy.
:::
::: solution
Σa−1=.4, −λᵀa=.1, ‖θ1−λ‖²=.22, so q=.12+.1−.11=.11. If a feasible candidate has objective .1102, its optimality gap is at most .0002. This certificate concerns objective accuracy; parameter accuracy needs extra curvature bounds. An infeasible candidate does not inherit the gap guarantee.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=12
A solver finds x=0 with zero KKT residuals for min −x² subject to −1≤x≤1 and claims global optimality from strict feasibility. Repair the claim.
:::
::: solution
At zero λ=(0,0) satisfies KKT, but f(±1)=−1<f(0)=0. Objective convexity fails, so convex sufficiency and convex Slater do not apply despite strict feasibility. The domain Lagrangian is always a downward quadratic with infimum −∞, so it cannot provide a finite tight lower bound here.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=12
For min x subject to x²≤0, a report says failed Slater implies positive gap and that every optimum has finite KKT multipliers. Repair both claims.
:::
::: solution
p*=0 at the only feasible point. For λ>0, q=−1/(4λ), while q(0)=−∞. Its supremum is 0, so the gap is zero but the dual optimum is not attained. At x=0 stationarity 1+2λx=0 is impossible. Qualification failure permits lack of multipliers and does not force a positive gap.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Derive the projected-gradient decrease coefficient and the fixed-point optimality certificate.
:::
::: solution
With d=x⁺−x, projection using z=x yields gᵀd≤−‖d‖²/α. Smooth descent gives f(x⁺)≤f(x)−(1/α−L/2)‖d‖². At a fixed point the projection inequality for every z∈C gives gᵀ(z−x)≥0; convex support then gives f(z)≥f(x). Feasibility, convex C, exact projection and a valid smoothness interval belong to the method's contract.
:::

::: exercise #e14 level=3 kind=extension minutes=20
For min (x−2)²/2 subject to x=0, compare squared penalty ρx²/2 with absolute penalty ρ|x|.
:::
::: solution
Squared-penalty stationarity (x−2)+ρx=0 gives x=2/(1+ρ), infeasible at every finite ρ. For the absolute penalty, convexity and the left/right derivatives −2−ρ and −2+ρ at zero show that zero is optimal for ρ≥2. This example demonstrates qualified exactness of a nonsmooth penalty without implying exactness of smooth squared penalties in general.
:::

## Ten-question self-check {#quiz}

```quiz
? A low-objective candidate violates an equality. What follows?
- [x] It is not a feasible primal solution
- [ ] Its objective repairs the violation
- [ ] It automatically satisfies weak duality as a feasible point
> Feasibility is independent of objective size; the weak-duality comparison requires a feasible point.

? What projects onto a simplex?
- [ ] Always clip then normalise
- [x] Subtract the shared threshold and clip at zero
- [ ] Project each coordinate independently onto [0,1] and stop
> The threshold must make the positive coordinates sum to one; box clipping solves a different set.

? At an active inequality, the multiplier must be what?
- [ ] Strictly positive
- [ ] Negative for every lower bound written g≤0
- [x] Nonnegative, possibly zero
> Complementarity only forces zero on inactive constraints. A lower bound written −x≤0 still uses nonnegative λ.

? What supplies global KKT sufficiency in this lesson?
- [x] Convex objective and inequalities, affine equalities, and all KKT lines
- [ ] Stationarity alone for any smooth objective
- [ ] Strict feasibility without convexity
> The convex Lagrangian supports the global proof. A downward quadratic supplies a nonconvex counterexample.

? Where is the dual infimum taken?
- [ ] Only on the primal feasible set
- [x] On the common domain without reimposing primal constraints
- [ ] At one chosen trial point
> A trial value is an upper bound on the Lagrangian infimum, not automatically a lower certificate for the primal.

? Does weak duality require convexity?
- [ ] Yes, always
- [ ] Only for equality constraints
- [x] No; the signs and feasibility prove the bound
> Strong duality needs additional assumptions; the elementary lower-bound chain does not.

? What does failure of Slater prove?
- [x] This sufficient theorem cannot be used without other justification
- [ ] The duality gap must be positive
- [ ] No KKT multipliers can ever exist
> Other qualifications or direct certificates may work; some zero-gap problems have no attained dual optimum.

? A boundary optimum may have which property?
- [ ] Nonzero projected mapping but necessarily zero raw gradient
- [x] Zero projected mapping and nonzero raw gradient
- [ ] Every unprojected step remains feasible
> Projection encodes the one-sided feasible geometry; ordinary zero-gradient stationarity is unsuitable at a boundary.

? A finite squared equality penalty guarantees what?
- [ ] Exact feasibility for every positive weight
- [ ] The original objective and problem stay identical
- [x] A modified objective that can retain constraint violations
> The scalar penalised minimiser 2/(1+ρ) remains nonzero at every finite ρ.
```

<div class="free-response" data-free-response data-key="math-series:m20:q10">
<label for="q10-response">10. Certify the simplex projection of (1.2,.4,−.2) by listing primal feasibility, dual signs, stationarity and complementarity. Compute its dual value, state the convex and Slater assumptions, and distinguish zero gap from primal and dual attainment.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="Give the point, threshold, lower multipliers, objective and every assumption."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I checked feasibility and signs and separated necessity, sufficiency, gap and attainment.</label>
</div>

::: answer
x*=(.9,.1,0), θ=.3 and λ=(0,0,.5). The point sums to one and is nonnegative; λ≥0; x*−a+θ1−λ=0; λ_i x_i*=0. Both primal and dual values are .11. Convex finite objective/inequalities and an affine equality justify sufficiency, while the strictly positive sum-one point supplies Slater for dual attainment. Compactness separately gives primal attainment. Zero gap alone would not guarantee either an attained primal point or a finite optimal multiplier.
:::

## Reading with a purpose {#reading}

Use the duality and constrained-minimisation chapters in the authors' [Convex Optimization companion](https://web.stanford.edu/~boyd/cvxbook/). Read the qualified Slater theorem as a theorem with hypotheses, then compare it with the direct weak-duality and convex KKT proofs above.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | Equality constraints and Lagrangians: what rank and dimension assumptions justify necessity? |
| Session 4 · 20 minutes | Duality and Slater: which hypotheses guarantee zero gap, and which additional facts establish attainment? |

## Retrieval exit task and next step {#summary}

Specify a feasible set, derive projections, solve one line-constrained quadratic, and write all KKT conditions with the g≤0 sign convention. Prove weak duality and convex KKT sufficiency, and recognise exactly when Slater supplies a further theorem.

**Exit task:** complete the simplex QP certificate, derive one projected step and its decrease coefficient, and diagnose the singular qualification and nonconvex stationary examples without conflating gap, attainment and feasibility.

**Ready to move on:** you can connect constrained algorithms to feasible geometry and certificates. Probability next develops explicit models, conditioning and uncertainty, rather than treating numerical frequencies as unspecified mathematical facts. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| C / active constraint | Feasible set / inequality at equality | 可行集、活跃约束 |
| P_C / θ | Euclidean projection / simplex threshold | 欧氏投影、单纯形阈值 |
| λ / ν | Nonnegative inequality / unrestricted equality multiplier | 不等式、等式乘子 |
| KKT / LICQ | Four conditions / independent active gradients | KKT条件、线性独立约束资格 |
| q / p* / d* | Dual function / primal infimum / dual supremum | 对偶函数、原始下确界、对偶上确界 |
| Slater / relative interior | Qualified strict feasibility / interior in affine hull | Slater条件、相对内部 |
| G_α / penalty | Projected mapping / modified objective discouraging violation | 投影梯度映射、罚函数 |
