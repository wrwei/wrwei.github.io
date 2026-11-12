## Rates become accumulated quantities through a limit {#start}

A derivative describes a local rate. An integral accumulates a rate across an interval, with units, signs and limiting hypotheses that a finite sum alone does not provide. A differential equation then specifies how a state changes through time. Its numerical simulation is a separate approximation, and a stable mathematical solution can be simulated badly by an unsuitable step.

**Retrieval check:** recall [Module16](module_16_EN.html#s3) product/chain rules, mean-value control and Taylor error, plus Module15 completeness and continuity. The labs need only standard-library Python. Density examples introduce the integral normalisation contract; probability models and expectations are developed systematically in Modules21–23.

## Definite integrals from finite partitions {#s1}

Partition a closed interval[a,b], a<b, into a=x₀<x₁<…<x_n=b. Each subinterval width is Δx_i=x_i−x_{i−1}>0, and choose a tag ξ_i inside it. A Riemann sum is Σf(ξ_i)Δx_i. The mesh is the largest width, not merely the number of sample points. The definite integral is a common finite limit approached by all such tagged sums as the mesh tends to zero. A specific uniform grid can illustrate this process, but agreement along one chosen sampling pattern alone is weaker than the integrability definition.

For a bounded function, let lower and upper sums use each subinterval's infimum and supremum instead of a tag. Every tagged sum lies between them. Refining a partition increases its lower sum and decreases its upper sum. Lower sums from one partition do not exceed upper sums from another, because a common refinement allows comparison. Completeness therefore supplies the supremum of all lower sums and infimum of all upper sums. If they agree, the function is Riemann integrable and that shared value is its integral. This is a useful equivalent construction of the limit rather than a numerical integration recipe by itself.

A continuous function on a closed bounded interval is uniformly continuous: one input tolerance controls output differences for every pair throughout the interval. To see why pointwise continuity suffices here, suppose uniform continuity failed. Then pairs at distances tending to zero could have output distances at least some fixed ε. Compactness supplies a convergent subsequence of the first inputs; the second inputs share its limit, and continuity makes their output difference vanish, a contradiction. The finite interval hypotheses are doing the work. Pointwise continuity on an open or unbounded domain need not provide the same uniform guarantee.

Uniform continuity proves integrability. Choose a mesh small enough that all values within any subinterval differ by less than ε. Its upper-minus-lower sum is then at most εΣΔx_i=ε(b−a). Such gaps can be made arbitrarily small, so the two completeness bounds agree. It also shows arbitrary sufficiently fine tagged sums approach the same number. An integral exists for other functions too, including bounded piecewise-continuous functions with finitely many jumps, but not every bounded function is Riemann integrable. A function equal to one on rational points and zero on irrational points has every lower sum zero and every upper sum b−a.

::: worked title="Left and right sums agree only in the limit"
For f(x)=x on[0,1] with n equal widths1/n, the left sum isΣ_{k=0}^{n−1}k/n²=(n−1)/(2n), and the right sum isΣ_{k=1}^{n}k/n²=(n+1)/(2n). Both tend to1/2 and their gap is1/n. The finite sums differ; monotonicity encloses every tagged sum between them. The integral1/2 is a limiting value, not an instruction to choose one endpoint rule forever.
:::

::: figure #fig-17-1
Left and right rectangles enclose the increasing function's integral; their widths and gap shrink together.
:::

The integral is signed accumulation. Positive portions add, negative portions subtract. Total geometric area uses ∫|f| instead. For f(x)=x on[−1,1], signed integral is zero while total area is one. Define ∫_a^a f=0 and reversed limits by ∫_b^a f=−∫_a^b f. Linearity, interval additivity and order preservation follow first for finite sums and then by limits. In particular, if m≤f≤M on[a,b], then m(b−a)≤∫f≤M(b−a), and |∫f|≤∫|f|. Output units multiply input units: metres per second integrated over seconds gives metres.

::: check
Does signed integral zero prove f is zero everywhere? Does n→∞ guarantee a general partition's mesh→0? Why does continuity on a closed interval ensure integrability?
:::
::: answer
Positive and negative contributions can cancel. More subintervals can leave one large width unchanged, so inspect the mesh. Compactness gives uniform continuity, which bounds upper-minus-lower sums by arbitrarily small ε(b−a).
:::

## Fundamental theorem and antiderivative families {#s2}

For continuous f on[a,b], define accumulation A(x)=∫_a^x f(t)dt. At an interior x, A(x+h)−A(x)=∫_x^{x+h}f(t)dt. Subtract h f(x), divide by h and use continuity: all nearby f(t) differ from f(x) by at most any requested ε, so the absolute quotient error is at most ε. The argument works for either sign of h using reversed orientation. Therefore A′(x)=f(x). This is the first fundamental-theorem connection: a continuous rate is the derivative of its accumulated quantity. The integration variable t is a bound dummy variable; it is different from the moving endpoint x.

An antiderivative F satisfies F′=f on an interval. Since A is another such function, (F−A)′=0; the mean value theorem makes the difference constant. Evaluating at endpoints gives the second connection, ∫_a^b f=F(b)−F(a). This proves the familiar evaluation rule under the stated continuity and derivative conditions. A definite integral is one number for fixed endpoints. An indefinite integral is notation for a family F+C, where C is arbitrary; it is not a fixed accumulated number until a boundary or initial condition selects the constant.

::: worked title="Accumulating a changing rate"
Suppose r(t)=3t² metres per second, t in seconds, on[0,2]. An antiderivative is t³, so accumulated distance is2³−0³=8 metres. Accumulation from zero to a variable x is A(x)=x³; differentiating recovers the rate3x². If position initially equals five metres, position is5+x³ rather than x³. The initial position is an integration constant, while the travelled increment is the definite integral.
:::

Basic antiderivatives follow by reversing verified derivative formulas. On appropriate intervals, x^p integrates to x^{p+1}/(p+1) when p≠−1; use positive x for general real powers, and broader domains for polynomial integer cases. The excluded p=−1 gives ln|x| on each interval not crossing zero. exp integrates to exp, cosine to sine, and sine to minus cosine. Linear combinations follow by linearity. A table does not eliminate domain checks, especially when an antiderivative expression exists only on one connected component.

Constants can differ across disconnected domains. If f(x)=1/x on R excluding zero, every antiderivative has form ln|x|+C₋ on the negative component and ln|x|+C₊ on the positive one. A derivative does not constrain the difference of those constants across the missing point. Similarly, writing F(b)−F(a) across a singularity is not automatically a proper integral; the fundamental theorem requires an appropriate whole interval. The improper limits in Section4 analyse those cases explicitly.

Moving endpoints add another dependency layer. If f is continuous and u,v are differentiable with their ranges inside the integration interval, then B(x)=∫_{u(x)}^{v(x)}f(t)dt=A(v(x))−A(u(x)), so B′(x)=f(v(x))v′(x)−f(u(x))u′(x). Both endpoints contribute, with opposite signs. For ∫_0^{x²}exp(t)dt, the derivative is2x exp(x²), not just exp(x²). This is the fundamental theorem plus the chain rule, not cancellation of formal symbols without hypotheses.

The first theorem above assumes continuous f. For discontinuous but integrable f, accumulation can still be continuous, while its derivative at a jump may fail or need separate analysis. At a point of continuity the local average argument remains valid. Do not assert A′ equals an arbitrarily assigned point value at every discontinuity. Changing a bounded integrand at finitely many points leaves its integral unchanged, because those points can be enclosed in intervals of arbitrarily small total width. The accumulation process therefore need not encode those isolated assignments in a derivative everywhere.

::: check
What is the difference between ∫_0^2 3t²dt and a family of antiderivatives? Why do both moving endpoints contribute? Can an antiderivative shortcut cross an unexamined singularity?
:::
::: answer
The former is the number eight; the latter is t³+C on an interval. Endpoint composition produces a chain contribution for each bound. A singularity requires separate improper limits rather than a direct proper-integral endpoint subtraction.
:::

## Substitution and integration by parts {#s3}

Substitution follows from the chain rule and fundamental theorem. If g is continuously differentiable on[a,b] and f is continuous on an interval containing its range, choose F′=f. Then [F(g(x))]′=f(g(x))g′(x), so ∫_a^b f(g(x))g′(x)dx=F(g(b))−F(g(a))=∫_{g(a)}^{g(b)}f(u)du. For this form, g need not be monotone; the endpoint expression automatically records orientation and any cancellation along the path. An interpretation that inverts g or removes its derivative factor may need additional injectivity or branch assumptions.

::: worked title="A substitution changes the bounds too"
For ∫_0^1 2x exp(x²)dx, set u=x², with derivative factor2x. The endpoints become zero and one, giving ∫_0^1 exp(u)du=e−1. Keeping x endpoints after substituting a different transformed range would be wrong in general. For ∫_1^2 2x exp(x²)dx, transformed endpoints are one and four and the result e⁴−e. In an indefinite form the antiderivative is exp(x²)+C, with x restored.
:::

Not every resemblance permits a substitution. The expression exp(x²) alone lacks the factor2x, so the preceding elementary cancellation does not evaluate its integral. A substitution can still change variables, but it may introduce a new factor or non-elementary integral rather than simplify it. Likewise, taking u=x² on a domain crossing zero and trying to write dx=du/(2sqrt(u)) without separating branches loses the negative-x branch. The chain-rule identity remains sound, while an inverse-variable derivation has a different set of domain requirements.

Integration by parts follows from (uv)′=u′v+uv′. Integrate this identity over[a,b] and rearrange: ∫_a^b u(x)v′(x)dx=[u(x)v(x)]_a^b−∫_a^b u′(x)v(x)dx, for continuously differentiable u,v. One factor is differentiated and the other must be integrated, so choices matter. The boundary term is part of the formula; omitting it changes the definite result even when the remaining integrand looks simpler. Indefinite notation packages the same identity plus an arbitrary constant.

For ∫_0^1 x exp(x)dx, choose u=x and v′=exp(x), hence u′=1,v=exp(x). The boundary term is e, and the remaining integral is e−1, giving result one. Reversing the choice would require an antiderivative of x and leave a different residual integral. The useful choice is usually the one reducing complexity, but success is mathematical rather than guaranteed by a mnemonic. Repeated integration by parts can handle polynomial times exponential terms by lowering polynomial degree.

For ∫_1^e ln x dx, choose u=ln x,v′=1, so v=x. The boundary term[x ln x]_1^e=e and ∫_1^e x(1/x)dx=e−1, again giving one. The logarithm domain is positive throughout. For an improper integral, apply integration by parts on truncated proper intervals first and then check each boundary and residual limit. A formal identity with a divergent boundary expression is not a finite evaluation.

These transformations can be checked by differentiation for indefinite claims and by explicit boundaries for definite ones. Differentiating a proposed antiderivative is often simpler than finding it, but the check must happen on its claimed domain. Multiple antiderivative forms may differ by a constant on a connected interval. If their difference is not constant or a domain piece has been lost, the formulas do not describe the same family there. In applications, units also provide a useful check: substitution changes the input coordinate, while the derivative factor accounts for its rate of scaling.

::: check
Why does ∫exp(x²)dx not use the same simple substitution as ∫2x exp(x²)dx? What must be retained in a definite integration-by-parts computation? Does substitution automatically permit crossing inverse branches?
:::
::: answer
The required derivative factor is missing. Retain the endpoint product and the remaining integral with their signs. An inverse-variable change may need separate branches even though the direct chain-rule identity does not require monotonicity.
:::

## Improper limits and density normalisation {#s4}

A proper integral of a continuous function uses a finite closed interval without an unbounded integrand. Improper integrals extend that definition through limits. At a singular left endpoint, ∫_a^b f means lim_{ε↓0}∫_{a+ε}^b f, if the finite limit exists. At infinity, ∫_a^∞ f means lim_{R→∞}∫_a^R f. A singularity inside an interval requires splitting into left and right improper integrals; each must converge separately. Two divergent sides cannot be cancelled and called an ordinary convergent improper integral.

For example ∫_ε^1 1/x dx=−ln ε grows without bound as ε↓0, so ∫_0^1 1/x diverges. Every finite cutoff yields a finite number, but the limiting claim fails. In contrast, ∫_ε^1 x^{−1/2}dx=2(1−sqrt(ε))→2, so an unbounded integrand can have a finite improper integral. Bounded height is not necessary for this extension, and a finite cutoff calculation is not sufficient for convergence. The nature of the singularity matters.

More generally, for p≠1, ∫_ε^1 x^{−p}dx=(1−ε^{1−p})/(1−p). This has a finite limit exactly when p<1; p=1 is the divergent logarithm case. On[1,∞), ∫_1^R x^{−p}dx=(R^{1−p}−1)/(1−p), which converges exactly when p>1. The same exponent family has opposite endpoint and infinity criteria. Both statements require the corresponding limiting calculation, rather than an informal assertion that a small function or an unbounded function must behave one way.

The signed example1/x on[−1,1] has separately divergent left and right integrals. Symmetric truncation ∫_{−1}^{−ε}1/x+∫_ε^1 1/x=0 for every ε gives a Cauchy principal value of zero, a separately defined symmetric-limit quantity. It does not make either side converge or turn the ordinary improper integral into zero. Keeping different notions of limit distinct avoids an apparent cancellation proof of a nonexistent normalisation constant.

::: worked title="Normalising a linear nonnegative candidate"
Let p(x)=cx on[0,1], zero outside. Nonnegativity requires c≥0, and total mass is c∫_0^1 x dx=c/2. Unit mass therefore requires c=2. Mass on[1/4,3/4] is[x²]_{1/4}^{3/4}=1/2. The height p(1)=2 is allowed: a density height is not itself a probability. The weighted first moment ∫_0^1 x p(x)dx=2/3 gives the mean once this density is adopted as a continuous probability model later.
:::

::: figure #fig-17-2
Density height, interval mass and total normalisation are different quantities. The linear candidate has a height above one and total mass one.
:::

A probability-density candidate must be nonnegative and have total integral one over its whole support. For an unnormalised nonnegative q with finite positive integral Z, define p=q/Z. If Z=0 or infinite, that division does not produce a valid unit-mass density. Sign-changing q can have integral one while still failing nonnegativity. A grid's sampled nonnegative values do not certify that condition everywhere without structural evidence. In the linear lab, c≥0 proves it for all x∈[0,1]; the proof is not replaced by the grid.

For λ>0, q(x)=exp(−λx) on x≥0 has integral1/λ, so p(x)=λexp(−λx). Its mass on[0,t] is1−exp(−λt). Integration by parts on[0,R] gives the first moment before taking R→∞; the boundary R exp(−λR) vanishes, yielding mean1/λ. The vanishing boundary can be justified using exp(λR)≥(λR)²/2 from its positive series, so R exp(−λR)≤2/(λ²R)→0. This is a complete limit check, not just writing a zero at infinity.

Probability models will clarify event definitions and expectations later. Here the mathematical distinction already matters: probability assigned to an interval is an integral, while a single point has zero mass for these continuous density models. Changing a density at one isolated point does not change its integrals. Density units are reciprocal input units, so its numerical height can change under a unit conversion without changing event probabilities. Keep the support, scale and integration measure explicit.

::: check
Can a density exceed one? Does every finite improper cutoff imply a finite integral? Can symmetric cancellation of1/x supply a normalisation constant?
:::
::: answer
Yes, height is not mass. A cutoff sequence can diverge, as−ln ε does. The symmetric principal value is a different limit; the separately divergent1/x sides do not define an ordinary convergent improper integral.
:::

## Numerical quadrature with mesh and error conditions {#s5}

Quadrature approximates a definite integral with a weighted finite sum. For n equal subintervals, h=(b−a)/n and x_i=a+ih. The composite trapezoidal rule uses h[f(a)/2+Σ_{i=1}^{n−1}f(x_i)+f(b)/2]. It integrates the piecewise linear interpolant through sampled values, giving endpoint half-weights because adjacent trapezoids share interior values. It is exact for linear functions in real arithmetic, but curves introduce interpolation error and function evaluations introduce arithmetic error.

For f with continuous second derivative and |f″|≤M₂ on[a,b], the trapezoidal truncation bound is (b−a)M₂h²/12. One derivation bounds linear interpolation error on each width-h interval by M₂(t−left)(right−t)/2. The interpolation formula follows from repeated Rolle applied to f minus its endpoint line and a multiple of the endpoint-vanishing quadratic. Integrating the bound gives M₂h³/12 per interval, and summing n intervals gives the result. Convex f lies below each chord, so trapezoids overestimate its integral; the sign claim uses convexity, while the magnitude bound uses the derivative control.

Simpson's composite rule requires positive even n and uses h/3 times endpoint values plus4 times odd interior values and2 times even interior values. Each two-subinterval panel integrates its quadratic interpolant. It is also exact for cubics, since a midpoint-centred cubic's odd part integrates and samples symmetrically to zero while the even constant/quadratic parts are exact. For continuous fourth derivative bounded by M₄, the standard remainder theorem gives truncation bound (b−a)M₄h⁴/180. The sharp constant is a quadrature remainder result, stated here under its smoothness hypothesis; it is documented in [NIST's quadrature reference](https://dlmf.nist.gov/3.5#ii).

::: worked title="A smooth polynomial makes both errors visible"
For f(x)=x⁴ on[0,1], the exact integral is1/5. Bounds are M₂=12 and M₄=24, so trapezoidal error≤h² and Simpson error≤24h⁴/180. With n=10, actual errors are.00333 and.000013333333. Halving h decreases the leading trapezoidal error by about four and Simpson's polynomial error by sixteen. These rates reflect this smooth problem and the respective truncation orders, not a promise for every integrand or arbitrarily tiny mesh.
:::

The fourth-order result cannot be attached to an integrand with an unexamined kink or singularity. Splitting a known kink into separate smooth intervals can restore suitable bounds on each piece; a singular improper endpoint may require a substitution, explicit tail bound or specialised method. Applying an endpoint rule directly to1/sqrt(x) at zero would attempt to evaluate an infinite value, even though its improper integral converges. Mathematical integrability and suitability for a particular sampling formula are different questions.

::: figure #fig-17-3
Trapezoids use linear interpolation; Simpson panels use quadratic interpolation and require an even number of equal subintervals.
:::

An error estimate from comparing n and2n values is empirical unless further assumptions link their difference to the true error. A narrow feature can be missed by both grids, just as in Module15. A derivative bound and maximum mesh size can certify unsampled variation, while two matching sums alone cannot. Adaptive methods subdivide where a local estimate indicates difficulty, but they still require an error model and can miss a feature that every inspected sample avoids. Record what information underlies a claimed tolerance.

Arithmetic error adds to truncation. If every sampled value has absolute error at most E, the trapezoidal weights are nonnegative and sum to b−a, so value-error contribution is at most(b−a)E. Simpson weights also sum to b−a for positive even n, giving the same value-error bound. Summation and weight computation can add more error. Refining indefinitely eventually offers diminishing benefit if function evaluation or accumulation dominates, so a convergence table should inspect both trend and plateau.

For a signed integral near zero, relative error can be misleading or undefined because large positive and negative contributions cancel. Use a stated absolute tolerance and, where appropriate, a scale based on ∫|f| or other problem information. Numerical quadrature evaluates an approximation to the mathematical integral; it does not establish an event model, density nonnegativity or differential-equation stability by itself. Those contracts need their own checks.

::: check
Why must Simpson n be even? Does convergence of two grids certify a missed narrow feature is absent? Is an integrable singularity necessarily usable by an endpoint sampling rule?
:::
::: answer
Panels consume two equal subintervals. Two grids can miss the same feature without a regularity bound. An unbounded endpoint value can make the sampling formula undefined even when the improper integral has a finite limit.
:::

## Differential equations and Euler decay stability {#s6}

A first-order ordinary differential equation specifies x′(t)=F(t,x(t)). A solution is a differentiable function on a stated time interval satisfying the equation there; an initial condition x(t₀)=x₀ selects a candidate trajectory. An ODE is not simply a recurrence or a list of samples. Existence and uniqueness depend on conditions on F. This lesson solves selected examples explicitly rather than claiming every right-hand side and initial value has a unique global solution.

For x′=−ax with constant a, direct differentiation verifies x(t)=C exp(−at). The initial condition at zero gives C=x₀. Uniqueness follows without dividing by x: the product exp(at)x(t) has derivative exp(at)[ax+x′]=0, so it is constant on the interval. This includes the equilibrium solution x≡0. For a>0, magnitudes decay and a nonnegative initial state stays nonnegative; a=0 preserves the state, while a<0 causes growth for nonzero initial state. The sign assumption on a determines the dynamical interpretation.

Separation is another route when division is legitimate: x′/x=−a integrates to ln|x|=−at+C on intervals where x≠0. But dividing by x excludes the zero solution, so recover it separately from the original equation. For a general separable x′=g(x)r(t), division by g(x) similarly excludes equilibria at roots of g. Check those roots directly and specify branches and domains before inverting an implicit antiderivative. Transformations can remove valid solutions or introduce implicit expressions outside the original interval.

::: worked title="Exact decay and its finite-step approximation"
For x′=−2x,x(0)=1, the exact solution is exp(−2t). Forward Euler uses x_{k+1}=x_k+h(−2x_k)=(1−2h)x_k at t_k=kh. With h=.1 the factor is.8 and x_{20}=.8²⁰≈.0115292, while the exact value at t=2 isexp(−4)≈.0183156. Both decay, but long-time stability does not imply a small error at this finite time.
:::

Euler uses the derivative at the start of each step to make a tangent prediction. With sufficiently smooth exact solution, Taylor gives one-step local discrepancy of order h². Repeated propagation over a fixed final interval can produce global error of order h under appropriate Lipschitz and stability assumptions. For this scalar linear example the formula proves the limiting behaviour directly: with T=nh and h=T/n, the endpoint is x₀(1−aT/n)^n→x₀exp(−aT). The convergence statement holds for fixed T as n→∞, and differs from letting k→∞ at a fixed potentially unsuitable h.

For a>0 and h>0, Euler's homogeneous factor q=1−ah tends to zero over repeated steps exactly when |q|<1, equivalently0<ah<2. At ah=2 it alternates without shrinking for nonzero initial state. Above two it grows in magnitude with alternating sign. At ah=0 it stays constant. The positive continuous decay is therefore numerically unstable for a sufficiently large step, even though the differential equation itself is stable. The stability region belongs to the method and step, not to the exact model alone.

Nonnegativity is a separate requirement. For a nonnegative initial value, all Euler iterates stay nonnegative when0≤ah≤1; for1<ah<2 they alternate signs while their magnitude decays. Thus a simulation can be asymptotically stable yet violate a physical concentration constraint. At ah=1 the first step goes directly to zero, also a poor finite-time approximation unless that error is acceptable. Check stability, admissible states and accuracy independently instead of using one property as a substitute for the others.

::: figure #fig-17-4
The Euler factor partitions steps into nonnegative decay, alternating decay, neutral oscillation and unstable growth, despite stable exact decay.
:::

::: widget name=accumulation
Explore area partitions and Euler's decay factor. Vary the number of rectangles, the decay step and the display mode; compare finite approximations with analytic quantities.
:::

A simulation should report the equation, parameters, initial state, time interval and step rule. If different steps imply different final times, compare each sample with the exact trajectory at its own time. To assess refinement, keep the final time fixed and increase step count. Lab3 does both and explicitly separates long-time stability from finite-time endpoint error. A stable factor cannot make those different experimental questions identical.

These scalar dynamics also prepare for optimisation and AI models. A gradient flow is a continuous equation, while a gradient update is a discrete method with a step-size-dependent stability region. The eigenmode analysis in Module19 extends the scalar factor to quadratic objectives; its assumptions will be stated there. Here the exact solution and explicit recurrence already demonstrate why numerical behaviour must be assessed against the underlying mathematical model.

::: check
Why must separation restore x≡0? For a=2, which positive steps give stable Euler decay and which preserve nonnegativity? Does stable imply accurate?
:::
::: answer
Division by x removed a valid equilibrium. Stability requires0<h<1; nonnegativity requires0<h≤.5 for nonnegative starts. A stable but coarse method can have substantial finite-time error, and an alternating stable method can violate nonnegative-state requirements.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| An integral is an antiderivative. | A definite integral is a number; an antiderivative is a function family. |
| Signed integral equals total area. | Opposite signs cancel; integrate absolute value for area. |
| Substitution changes only the expression. | Retain derivative factors, domains and transformed bounds. |
| Finite cutoffs prove improper convergence. | Their limit can diverge. |
| Density height must stay below one. | Interval integrals are probabilities; height has reciprocal units. |
| Matching quadrature grids prove accuracy. | Both can miss an unsampled feature. |
| Stable continuous decay guarantees a stable simulation. | Euler stability depends on ah. |
| Stable Euler means nonnegative and accurate. | Check those properties separately. |

## Three reproducible labs {#labs}

### Lab1 · Quadrature rates and analytic bounds {#lab1}

{{LAB:lab1}}

Derive both derivative bounds for x⁴ before running. Compare refinement ratios, note the final rounding allowance, and explain why odd Simpson subinterval counts are rejected. Use the sine example as a second smooth integrand rather than assume the polynomial evidence proves all functions.

### Lab2 · Normalisation heights and improper limits {#lab2}

{{LAB:lab2}}

Explain the all-domain nonnegativity proof for the linear family, calculate its exact total and interval masses, and compare the weighted integral with2/3. The improper examples use exact antiderivative formulas at finite cutoffs; prove their limiting claims separately.

### Lab3 · Decay stability and fixed-time refinement {#lab3}

{{LAB:lab3}}

Classify each factor before running, compare the exact value at each trace's own final time, and identify the stable sign-violating step. In the second table the final time stays one while the mesh shrinks. Explain what each experiment establishes and what it does not.

## Fourteen exercises with full solutions {#exercises}

Exercises1–12 are required. Optional Exercises13–14 add35 minutes beyond the ten-hour core schedule.

::: exercise #e1 level=1 kind=calculation minutes=6
For f(x)=x on[0,1], compute four-subinterval left and right sums, their gap and the limiting integral.
:::
::: solution
Width1/4. Left values0,1/4,1/2,3/4 sum to3/2, giving3/8. Right values1/4,1/2,3/4,1 sum to5/2, giving5/8. Gap1/4; the general sums(n−1)/(2n),(n+1)/(2n) converge to1/2. Finite upper and lower estimates are distinct from their common limit.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
Accumulate rate3t² from zero to two, then recover position at two if its initial value is five.
:::
::: solution
The definite integral[t³]_0^2=8 is the increment. Position is5+t³, so the final position is13. The constant encodes initial state, not additional rate. With rate in metres per second and t in seconds, the integral has metre units.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
Evaluate ∫_1^2 2x exp(x²)dx with explicit transformed bounds.
:::
::: solution
u=x² gives du=2x dx and endpoints1,4. The result∫_1^4 exp(u)du=e⁴−e. Alternatively differentiate exp(x²) to verify the antiderivative and apply the original x endpoints. Mixing transformed and original bounds is invalid.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
Decide convergence of x^{−3/2} on(0,1] and on[1,∞), computing the limits.
:::
::: solution
Near zero,∫_ε^1 x^{−3/2}dx=2(ε^{−1/2}−1)→∞, so diverges. At infinity,∫_1^R x^{−3/2}dx=2(1−R^{−1/2})→2, so converges. The same function has different endpoint and tail behaviour.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove A′(x)=f(x) for A(x)=∫_a^x f(t)dt when f is continuous, using an error inequality.
:::
::: solution
Subtract f(x) from the accumulation quotient: [A(x+h)−A(x)]/h−f(x)=(1/h)∫_x^{x+h}[f(t)−f(x)]dt. Continuity makes the integrand magnitude<ε throughout a sufficiently short segment. Its integral magnitude is≤ε|h|, so the quotient error≤ε for either sign of h, with orientation handled by reversed limits. Hence the derivative is f(x) at interior points. Endpoints need one-sided qualification.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Derive definite integration by parts from the product rule and justify ∫_0^1 x exp(x)dx.
:::
::: solution
For C¹ functions, integrate(uv)′=u′v+uv′ and apply the fundamental theorem, giving∫uv′=[uv]_a^b−∫u′v. With u=x,v=exp(x), the boundary is e and the remaining integral e−1, giving one. Both are defined smoothly on the whole interval and the boundary term has been retained.
:::

::: exercise #e7 level=2 kind=proof minutes=14
For a>0,h>0, prove Euler stability for x′=−ax and identify the separate nonnegative-state condition.
:::
::: solution
Euler gives x_k=(1−ah)^k x₀. For every initial value to tend to zero, the factor must have magnitude<1, equivalent to0<ah<2. Magnitude one does not decay and magnitude above one grows for nonzero starts. For all nonnegative initial values to remain nonnegative, the factor must be≥0, hence0<ah≤1 under the given positive-step assumptions. Factors between−1 and zero are stable but alternate signs.
:::

::: exercise #e8 level=2 kind=application minutes=10
Normalise q(x)=x on[0,1], then compute mass on[1/4,3/4], density height at one and first moment.
:::
::: solution
Z=∫x=1/2, so p=2x. Interval mass[x²]_{1/4}^{3/4}=1/2. Height p(1)=2 is permissible and is not a point probability. First moment∫2x²=2/3. Nonnegativity follows from the whole support's x≥0, not solely from sampled values.
:::

::: exercise #e9 level=2 kind=application minutes=10
Normalise exp(−3x) for x≥0, compute mass on[0,1] and first moment, checking the infinite boundary.
:::
::: solution
Z=1/3, so p=3exp(−3x). Interval mass1−exp(−3). Integration by parts on[0,R] gives first moment1/3−(R+1/3)exp(−3R). The exponential boundary vanishes, justified for example by its power-series lower bound against R², so the moment tends to1/3. Nonnegative support and finite positive Z satisfy the density contract.
:::

::: exercise #e10 level=2 kind=application minutes=10
For x⁴ on[0,1] with n=20, compute h and the trapezoidal/Simpson theorem bounds. What does each bound include?
:::
::: solution
h=.05. M₂=12 gives boundh²=.0025; M₄=24 gives24(.05)⁴/180≈8.333333333×10⁻⁷. These bound exact-real quadrature truncation under the stated smoothness, not all floating-point or function-evaluation error. Actual trapezoidal error is about.000833125 and Simpson error matches the polynomial bound up to arithmetic rounding. The even n requirement holds.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
A program cancels symmetric cutoffs of1/x on[−1,1] and declares the ordinary improper integral zero. Repair the claim and explain its density use.
:::
::: solution
Each side separately diverges, so the ordinary improper integral does not exist. Symmetric cutoffs define a distinct principal value of zero. The function also changes sign. Neither that principal value nor division by it yields a nonnegative unit-mass density. Check separate limits, nonnegativity and a finite positive normalising integral.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
A derivation divides x′=−2x by x and excludes the zero solution. A simulation uses h=.8 and claims stable decay guarantees nonnegative accuracy. Repair both claims.
:::
::: solution
Direct substitution verifies x≡0; division removed it and it must be restored. Euler factor1−2(.8)=−.6 has magnitude<1, so its magnitude decays, but signs alternate for positive nonzero starts. The exact solution remains positive. Stability therefore does not certify nonnegativity or finite-time accuracy; compare with exp(−2t) at the matching time and refine with fixed final T.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Prove Euler endpoints(1−aT/n)^n converge to exp(−aT) for fixed a,T>0, distinguishing this from fixed-step long-time stability.
:::
::: solution
For sufficiently large n, aT/n<1/2 and the factor is positive. Taylor for ln(1−z) near zero gives−z+O(z²) with a bounded second derivative on[0,1/2]. Thus n ln(1−aT/n)=−aT+O(1/n)→−aT. Exponentiating by continuity yields the limit. This lets h=T/n shrink while keeping final time T; holding h fixed and letting step count grow studies a different sequence with factor1−ah and its stability region.
:::

::: exercise #e14 level=3 kind=extension minutes=20
For q(x)=x^{−p} on(0,1), determine when it can be normalised, then derive its first moment.
:::
::: solution
The improper integral is finite positive exactly when p<1, with Z=1/(1−p). The density is(1−p)x^{−p}, and its first moment is(1−p)∫_0^1 x^{1−p}dx=(1−p)/(2−p), since p<1 also ensures p<2. For p≥1 no finite positive constant scaling makes its divergent integral one. The isolated endpoint assignment does not change the improper integral or its event masses.
:::

## Ten-question self-check {#quiz}

```quiz
? What is a definite integral with fixed endpoints?
- [x] A limiting accumulated number
- [ ] Always a function family with arbitrary constant
- [ ] Always the maximum integrand height
> Antiderivatives are functions; a definite integral is a signed accumulated quantity for stated bounds.

? Signed integral zero implies what?
- [ ] The function is zero everywhere
- [x] Net contributions cancel or vanish, with no such pointwise conclusion
- [ ] Total geometric area must be zero
> f(x)=x on[−1,1] has zero signed integral and positive absolute area.

? Under continuous f, what is d/dx ∫_0^{x²} f(t)dt?
- [ ] f(x²)
- [ ] f(x)
- [x] 2x f(x²)
> The fundamental theorem supplies the endpoint value and the chain rule supplies the endpoint derivative.

? In a definite substitution, what must change consistently?
- [x] Integrand, derivative factor and bounds
- [ ] Only the name of the variable
- [ ] The answer's sign can be discarded
> Transformed bounds and orientation are part of the chain-rule identity.

? Every finite cutoff of an improper integral is finite. What follows?
- [ ] Its improper limit necessarily converges
- [x] Only those cutoff integrals are finite; examine the limit
- [ ] Its total mass is automatically one
> The logarithmic cutoff values for1/x diverge despite each being finite.

? A normalised density has height two at a point. Is that invalid?
- [ ] Yes, all densities must be≤1
- [ ] Yes, the point has probability two
- [x] No; interval probabilities are integrals, while height has reciprocal units
> The density2x on[0,1] has unit total mass and height two at one.

? What does composite Simpson require here?
- [x] Positive even subinterval count; fourth-derivative control for the stated bound
- [ ] Any odd mesh with an unchanged weighting pattern
- [ ] Only bounded sampled heights for the fourth-order certificate
> Two-subinterval panels and smoothness support the stated method and error result.

? Euler for positive-rate decay is stable when what holds?
- [ ] Every positive h
- [x] 0<ah<2
- [ ] Only when the exact model is unstable
> The recurrence factor1−ah must have magnitude below one.

? For1<ah<2 and a positive initial state, what happens?
- [ ] Positive monotone decay at every step
- [ ] Guaranteed exact continuous values
- [x] Alternating signs with shrinking magnitude
> Stability and nonnegative-state preservation are distinct; finite-time accuracy needs a further comparison.
```

<div class="free-response" data-free-response data-key="math-series:m17:q10">
<label for="q10-response">10. State a density normalisation and interval-mass calculation for q(x)=x on[0,1]. Then derive Euler's decay factor, stability region and nonnegativity region, and distinguish fixed-time refinement from fixed-step long-time decay.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="Include support, positivity, integral, recurrence and separate numerical checks."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I distinguished height from mass and stability from state constraints and accuracy.</label>
</div>

::: answer
q≥0 on its support,Z=1/2,so p=2x; mass[a,b] inside[0,1] is b²−a², while p(1)=2 is a height. For x′=−ax with a>0, Euler factor1−ah is stable for0<ah<2 and preserves nonnegative starts for0<ah≤1. Fixed T with h=T/n→0 gives endpoint convergence to x₀exp(−aT); fixed h and growing k instead studies long-time recurrence stability. Neither stability alone nor a density's height supplies the other required claims.
:::

## Reading with a purpose {#reading}

Read integration, improper limits and differential-equation selections in the primary [MIT OpenCourseWare calculus course](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/). Consult [NIST's quadrature formulas](https://dlmf.nist.gov/3.5) for the stated trapezoidal and Simpson remainder conventions. The accumulation, substitution, normalisation and decay derivations above are original lesson arguments.

| When | Selection and question |
|---|---|
| Session1 · 20 minutes | Definite integral and fundamental theorem: which limit and continuity hypotheses connect accumulation to a rate? |
| Session4 · 20 minutes | Improper integrals and decay: which limit is taken, and which numerical step changes stability? |

## Retrieval exit task and next step {#summary}

Construct a partition sum, explain why continuity gives integrability, and derive both fundamental-theorem connections. Evaluate a substitution and integration-by-parts example with boundaries. Analyse a convergent and divergent improper limit, normalise a density, and state the quadrature smoothness contracts.

**Exit task:** x′=−3x,x(0)=2 has exact solution2exp(−3t). Euler is stable for0<h<2/3 and preserves nonnegative states for0<h≤1/3. Compare a stable sign-alternating step with fixed-final-time refinement, and explain why those checks answer different questions.

**Ready to move on:** you can distinguish continuous mathematical models, accumulated quantities and finite numerical approximations. Multivariable derivatives next extend local sensitivity and chain dependencies to vectors, matrices and automatic differentiation. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| Partition / mesh / tag | Subintervals / maximum width / sampled point | 分割、网格尺度、标记点 |
| ∫_a^b f / F+C | Signed definite accumulation / antiderivative family | 定积分、原函数族 |
| Fundamental theorem | Derivative–accumulation connection under hypotheses | 微积分基本定理 |
| Substitution / parts | Chain-rule / product-rule integration transformations | 换元、分部积分 |
| Improper / principal value | Separate endpoint limits / specified symmetric limit | 反常积分、主值 |
| Z / p=q/Z | Finite positive normalising integral / unit-mass density | 归一化常数、密度 |
| Quadrature / trapezoid / Simpson | Weighted finite approximation and mesh rules | 求积、梯形、辛普森 |
| ODE / equilibrium | Continuous state equation / constant solution | 常微分方程、平衡解 |
| Euler / stability / positivity | Tangent-step simulation / decay of modes / admissible signs | 欧拉、稳定性、非负性 |
