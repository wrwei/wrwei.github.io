## Infinite claims need more than a finite trace {#start}

A table of decreasing values can suggest a limit, but it cannot specify every future term. A plot can miss a narrow feature. An iteration can stop changing because its step is deliberately tiny or because floating-point arithmetic cannot represent the intended change. Mathematical convergence is a quantified statement about an entire tail of a process, and numerical stopping is a finite decision under a stated error criterion.

This lesson introduces both claims carefully. You will prove basic sequence and function limits, construct epsilon–delta witnesses, use continuity theorems with their domain hypotheses, and analyse selected infinite series. The final section connects exact iteration arguments with residual-based stopping and the limits of finite evidence.

**Retrieval check:** use absolute-value inequalities, finite sums and real function domains from [Module 01](module_01_EN.html#s2). Explain quantifier order and a counterexample from [Module 04](module_04_EN.html#s1). No earlier calculus is assumed. The numerical labs use the Python standard library, including exact Fractions where that distinction matters.

## Sequences convergence and completeness of the real line {#s1}

A real **sequence** is a function from positive integer indices to real numbers, written a₁,a₂,…. It converges to L when for every ε>0 there exists an integer N such that every n≥N satisfies |a_n−L|<ε. The order matters: first an arbitrary requested accuracy, then a tail threshold that may depend on it, then every later index. We write a_n→L. The definition does not require monotonicity, reaching L exactly, or one common N working for all accuracies.

::: worked title="An inequality proves the reciprocal sequence limit"
For a_n=1/n, given ε>0 choose N=⌊1/ε⌋+1. Then N>1/ε, so every n≥N gives 0<1/n≤1/N<ε. Thus a_n→0. The sequence never equals its limit, and seeing a small value at one index is not the proof; the inequality covers every later term.
:::

Limits are unique. If L and M differed by D=|L−M|>0 and both were limits, use ε=D/3 and go beyond both thresholds. The triangle inequality would give D≤|L−a_n|+|a_n−M|<2D/3, impossible. A convergent sequence is also bounded: its tail lies within one of its limit, while its finitely many earlier terms have a finite maximum absolute value. Combine those bounds. The converse fails: (−1)^n is bounded between minus one and one but cannot approach a single L, because its even subsequence is constantly one and its odd subsequence constantly minus one.

Boundedness means some finite B bounds |a_n| for every n. Being unbounded is not the same as tending to positive infinity. The latter means every real threshold M is eventually exceeded by all later terms. A sequence equal to n at even indices and zero at odd indices is unbounded but does not tend to positive infinity or any finite limit. Negative infinity has the analogous reversed inequality. Finite-limit divergence includes oscillation and unboundedness; “diverges” does not automatically mean grows monotonically without bound.

A nondecreasing real sequence that is bounded above converges. The underlying **completeness** property of the real line says every nonempty bounded-above set has a least upper bound, its supremum. Let L be the supremum of the sequence's values. For any ε>0, L−ε is not an upper bound, so some a_N>L−ε. Monotonicity gives L−ε<a_N≤a_n≤L for every n≥N, proving convergence. Decreasing bounded-below sequences follow by negating them. Without boundedness a monotone sequence can grow forever; without monotonicity boundedness can leave oscillation.

Completeness distinguishes real-number limits from limitations of a chosen exact representation. A rational sequence can converge to an irrational real number, so staying within rational entries does not require its real limit to be rational. Finite-precision machine numbers form a different set again. Rounding a process to one of those numbers is a computational convention; it does not change the definition of a real limit.

A **Cauchy sequence** eventually has all its own tail pairs close: for every ε>0 there is N such that |a_i−a_j|<ε whenever i,j≥N. Convergence implies this by bounding each distance to L by ε/2. Every real Cauchy sequence also converges. One proof first notes that it is bounded, using a tail pair bound of one plus the finite prefix. Define l_n as the infimum of its tail and u_n as the supremum. These exist by real completeness; l_n increases and u_n decreases, both bounded, so each converges by the monotone argument. The Cauchy condition makes u_n−l_n at most any requested ε eventually, so their limits agree. Since l_n≤a_n≤u_n, inequalities then force a_n to the same limit. This supplies the existence fact used in the iteration proof later.

::: figure #fig-15-1
An epsilon band eventually contains every reciprocal-sequence term. A bounded alternating sequence keeps returning to two separated values instead.
:::

::: check
Does a_n→0 require a_n ever equal zero? Does a finite prefix of one hundred terms determine whether the sequence converges? What extra hypotheses make monotonicity useful?
:::
::: answer
No exact equality is required. One finite prefix can be followed by a zero-limit tail, a constant-two tail, or an alternating tail, giving different infinite claims. A nondecreasing sequence needs an upper bound, or a nonincreasing one a lower bound, to use the monotone convergence theorem.
:::

## Function limits one-sided behaviour and conditional algebra {#s2}

A function limit f(x)→L as x→a concerns values near a in its domain with x≠a. The domain must contain such points arbitrarily close to a; otherwise the intended limit statement could become vacuous. Formally, for every ε>0 there is δ>0 such that every domain point satisfying 0<|x−a|<δ has |f(x)−L|<ε. The puncture means f(a) can be undefined or have another value. Continuity will add the requirement that the actual value agrees with the limit.

Left and right limits restrict x<a and x>a respectively, using available domain points on those sides. For a domain containing both sides near a, a finite two-sided limit exists exactly when both one-sided limits exist and agree. A boundary point can have a meaningful domain-relative limit from its available side without inventing values outside the domain. The language should identify whether a two-sided real-line claim or a relative-domain claim is intended.

::: worked title="Removing a singularity changes the domain"
The quotient f(x)=(x²−1)/(x−1) is defined for x≠1. Factoring gives f(x)=x+1 on that punctured domain, so its limit at one is two. The original f(1) remains undefined. Defining a new function g with g(1)=2 makes the extension continuous; assigning g(1)=7 instead preserves the punctured limit but fails continuity. Algebraic cancellation did not retroactively add a point to the original domain.
:::

The threshold H(x)=0 for x<0 and one for x≥0 has left limit zero and right limit one at zero, so no two-sided limit. Its chosen value at zero cannot fix that jump. For 1/x at zero, left values tend to negative infinity and right values to positive infinity; there is no common finite or signed-infinite two-sided limit. An infinite limit means every magnitude threshold is eventually crossed in the stated direction, rather than that infinity is an ordinary real value returned at the point.

Limits at infinity describe large inputs instead of small distances to a finite point: f(x)→L as x→+∞ means for every ε>0 there is M such that all domain x>M have |f(x)−L|<ε. For 1/x, choosing M>1/ε proves the zero limit. This resembles the sequence argument but covers all sufficiently large domain inputs, not only positive integers. A sampled integer trend need not determine the behaviour between those inputs.

Algebraic limit laws require that the constituent limits exist in a shared nearby domain. If f→L,g→M, then f+g→L+M, and products tend to LM. The sum follows by assigning each error ε/2. For the product, write fg−LM=f(g−M)+M(f−L). First restrict |f−L|<1 so |f|≤|L|+1, then make both remaining errors small enough to bound the two terms. This local bound is why the argument works even though f varies with x. Differences and fixed scalar multiples follow similarly.

Quotients require M≠0 and a sufficiently small neighbourhood where g stays nonzero. From |g−M|<|M|/2, we obtain |g|>|M|/2. The reciprocal error |1/g−1/M|=|g−M|/(|g||M|) can then be bounded, establishing the quotient law through multiplication. A zero denominator limit is not permission to divide limits; a 0/0 form requires further analysis and can produce different results for different functions.

The squeeze principle follows from inequalities: if lower and upper functions both approach L and eventually enclose f, their epsilon bounds enclose f too. The same argument applies to sequences. It supplies a useful proof when exact values oscillate but their amplitude shrinks, such as |sin x|/n≤1/n for any selected bounded sine factors. The shrinking bound, not the oscillation's detailed phase, establishes the limit.

Function limits can be disproved by two domain sequences tending to a but giving different value limits. A valid function limit would force every such sequence's values into the same epsilon bands. The converse criterion also holds: if the epsilon–delta definition failed, one could choose a violating domain point within 1/n for each n and obtain a counterexample sequence. This gives a precise bridge between sequence reasoning and function limits; a few selected approach paths are still insufficient to prove the universal claim.

::: check
If f(a)=L, has the limit been proved? Can one cancel a factor and declare the original quotient defined at its removed point? Why does the quotient law exclude denominator limit zero?
:::
::: answer
A value at one point says nothing about all nearby values. Cancellation is valid where the divisor is nonzero; extending the domain is a separate definition. A nonzero denominator limit supplies a uniform nearby lower bound, while a zero limit does not and permits many incompatible behaviours.
:::

## Epsilon–delta witnesses and the order of a proof {#s3}

Epsilon is the requested output accuracy, and delta is a sufficient input neighbourhood. To prove a limit, accept an arbitrary positive ε, choose δ possibly depending on it and fixed problem constants, then show the implication for every eligible x. Delta cannot depend on a favourable x chosen afterwards. One delta for one requested accuracy establishes only that particular implication; a limit requires a rule or argument for every positive accuracy.

::: worked title="A linear epsilon–delta proof"
For f(x)=3x+1 at a=2, the proposed limit is seven. Given ε>0, choose δ=ε/3. Any x with 0<|x−2|<δ gives |f(x)−7|=3|x−2|<3δ=ε. This is the complete quantified proof. Smaller positive deltas work too; the task is to provide a sufficient neighbourhood, not necessarily the largest one.
:::

For a nonlinear example x²→4 at x→2, factoring gives |x²−4|=|x−2||x+2|. Control the second factor first by requiring |x−2|<1, which puts x between one and three and gives |x+2|<5. Then choose δ=min(1,ε/5). Every eligible x has output error below5δ≤ε. Using the minimum keeps both requirements true. Guessing δ=ε without bounding the extra factor would leave the proof incomplete, even if a few samples happened to fit the band.

Quantifier order explains why a discontinuity cannot be repaired by shrinking a window on just one side. For the threshold at zero, ε=1/3 defeats every proposed limit L and neighbourhood when both sides are available. The outputs zero and one cannot both lie within1/3 of the same L, since that would imply their distance one is less than2/3. Every δ contains a negative and a positive point, so some eligible input violates the requested band. This is a direct negation argument: one output accuracy, then a bad input for every neighbourhood.

The puncture also makes an isolated bad value compatible with a limit. Altering only f(a) leaves all conditions with x≠a unchanged. Changing values on arbitrarily close neighbouring inputs can instead change or destroy the limit. A proof should identify which points the universal implication covers, especially for domains such as positive reals or a discrete subset approaching a boundary.

For a reciprocal near a nonzero a, use a local input restriction to keep |x| away from zero: |x−a|<|a|/2 implies |x|>|a|/2. Then |1/x−1/a|<2|x−a|/|a|². Choosing δ=min(|a|/2,ε|a|²/2) proves the reciprocal limit. This pattern—bound an awkward factor, then allocate an error budget—reappears in continuity, derivative and numerical-error arguments.

::: widget name=limits
Choose a linear or quadratic example, set an output epsilon and a proposed input delta, and compare it with an inequality-based sufficient bound. See the threshold jump fail every two-sided band used here.
:::

The explorer can visualise a band and inspect selected points, but its finite samples are not themselves the proof. The linear and quadratic cases display the algebraic bound governing the entire window. A sufficient bound can be conservative; exceeding it does not automatically disprove a limit or even the current window. A failure needs an actual witness or a separate exact maximum calculation. Distinguish a theorem's sufficient condition from a necessary condition before interpreting a red or green numerical indicator.

::: check
Why is δ=min(1,ε/5) legitimate for x² at two? Can a failed sufficient bound alone prove the actual epsilon implication false?
:::
::: answer
Both local-factor and accuracy constraints hold for every point in the chosen window. The proposed delta depends only on ε and constants. A conservative bound failing to certify a larger window does not establish a counterexample; it means that particular argument has not certified it.
:::

## 4. Continuity and theorems that require it {#s4}

A function is continuous at a domain point a when arbitrarily small output errors can be guaranteed by sufficiently small input errors, including the point itself. In symbols, for every ε>0 there exists δ>0 such that every domain x with |x−a|<δ satisfies |f(x)−f(a)|<ε. At an accumulation point this is equivalent to the punctured limit existing and equalling f(a). At an isolated domain point continuity holds automatically by choosing a neighbourhood containing no other domain points. That does not create a meaningful punctured limit there. At an interval endpoint continuity is relative to the available one-sided domain.

Continuity of a composition needs compatible domains. Suppose f is continuous at a, f(a)=b, and g is continuous at b, with f mapping the relevant neighbourhood into g's domain. Given an output ε, continuity of g supplies an intermediate tolerance η>0 around b. Continuity of f then supplies δ so |x−a|<δ implies |f(x)−b|<η. Applying g's condition yields |g(f(x))−g(b)|<ε. Notice that f(x)=b is permitted. An argument using only a punctured limit for g could fail when inner values hit b and g(b) is assigned a different value. Domain and point-value conditions are doing real work here.

The algebraic limit rules establish continuity of sums and products of continuous functions, and of quotients wherever their denominators are nonzero. Polynomials are therefore continuous everywhere on the real line; rational functions are continuous on their domains. Piecewise definitions need a separate joining check. Equal-looking formulas on each open piece do not establish agreement at a boundary. A jump, a removable mismatch, an unbounded singularity and bounded oscillation are different failure mechanisms, even though all can defeat continuity at the joining point.

::: worked title="A removable hole and an actual jump"
For x≠1, define g(x)=(x²−1)/(x−1). Assigning g(1)=2 makes the function continuous, since the limit is two. Assigning g(1)=7 leaves the same punctured limit but breaks continuity. In contrast, h(x)=0 for x<0 and h(x)=1 for x≥0 has one-sided limits zero and one. No choice of h(0) can make those sides agree. Repairing one isolated value repairs the first case; it cannot repair the second.
:::

::: figure #fig-15-2
A hole and a jump illustrate why a function value and two-sided neighbouring behaviour must be checked separately.
:::

The intermediate value theorem states: if f is continuous on the closed real interval [a,b], every value between f(a) and f(b) is attained at some point in that interval. For a root, opposite signs suffice together with continuity. A concise existence proof uses bisection. If an endpoint or midpoint is a root, stop. Otherwise retain the half whose endpoints still have opposite signs. The nested closed intervals have lengths (b−a)/2ⁿ tending to zero. Their left endpoints increase and right endpoints decrease, so completeness gives a common limit c in every interval. Continuity sends the endpoint function values to f(c). Since those values remain on opposite sides of zero, the shared limit must be zero. This proves existence, not uniqueness; several crossings can occur.

Continuity cannot be omitted from that root certificate. The jump h(x)−1/2 changes sign across zero while taking only −1/2 and 1/2. It has no root. Closed endpoints also matter for attainment questions: f(x)=x on (0,1) approaches both bounds but attains neither. The extreme value theorem states that a continuous real function on a nonempty closed bounded interval attains a maximum and minimum. This is stronger than merely being bounded. For example 1/x on (0,1] is continuous on its domain but unbounded because the excluded endpoint can be approached.

Here is the mechanism behind the extreme value theorem. Every sequence in a closed bounded interval has a convergent subsequence whose limit remains in the interval: repeatedly bisect and retain a half containing infinitely many sequence terms, then select increasing indices from the nested halves. If continuous f were unbounded, choose x_n with |f(x_n)|>n; a convergent subsequence and continuity would force these outputs to converge to the finite value at its limit, a contradiction. Once f is bounded, let M be its output supremum and choose inputs with f(x_n)>M−1/n. A convergent subsequence with limit c then gives f(c)=M. Apply the same argument to −f for the minimum. The selection step can allow finitely many early exceptions; the increasing selected indices still force the errors to vanish.

This compactness reasoning extends to closed bounded sets in finite-dimensional real space by selecting subsequences successively for each coordinate. Thus the continuous quadratic energy on the unit sphere used in Module13 does attain its maximum. Closure ensures the limiting point remains on the sphere, boundedness permits subsequences, and continuity transfers output values. Infinite-dimensional spaces need additional care; this argument depends on finitely many coordinates.

A derivative, introduced fully next module, is a finite limit of difference quotients. If that quotient tends to D at a, it is bounded near a, and f(a+h)−f(a)=h times the quotient tends to zero. Hence differentiability implies continuity. The converse fails: |x| is continuous at zero but its left and right difference quotients are −1 and one. This boundary matters for AI objectives using absolute errors, maxima or threshold decisions. First establish which regularity property the proposed argument actually needs.

::: check
Does a sign change prove a root without continuity? Does continuity on an open bounded interval guarantee an attained maximum? Why does the composition proof include inner values equal to b?
:::
::: answer
The jump minus one-half disproves the first claim; f(x)=x on (0,1) disproves the second. Continuity controls g at b itself, so it remains applicable when f(x)=b. A punctured outer-limit condition alone excludes precisely that case.
:::

## 5. Infinite series are limits of partial sums {#s5}

A series Σa_k is defined through its finite partial sums, not through an instruction to add infinitely many terms in a computer loop. For indexing from k=0, set S_N=Σ_{k=0}^{N−1}a_k, so N counts terms. The series converges to S when S_N→S. Terms and partial sums are different sequences. If partial sums converge, their differences a_N=S_{N+1}−S_N tend to zero. Thus terms tending to zero are necessary. They are not sufficient, as the harmonic series shows. A convergence test must certify partial sums, rather than observe small recent terms.

For a_k=Cq^k with q≠1, multiplying the finite sum by q and subtracting gives S_N=C(1−q^N)/(1−q). If |q|<1, q^N→0 and the sum is C/(1−q). The omitted tail is Cq^N/(1−q), and its magnitude is at most |C||q|^N/(1−|q|). For negative q the exact denominator |1−q| can give a tighter bound; the displayed bound handles both signs uniformly. If C≠0 and |q|≥1, the terms fail to approach zero, so the series diverges. C=0 is an exception: every term and partial sum is zero regardless of q. Always keep a boundary case rather than turning a sufficient pattern into a false universal claim.

::: worked title="Counting terms before bounding a geometric tail"
For 1+1/2+1/4+…, N=10 terms means exponents zero through nine. The partial sum is 2(1−2⁻¹⁰)=1023/512 and the exact tail is 2⁻⁹=1/512. To make the tail strictly below1/1000 requires 2^{1−N}<1/1000, so N=11 suffices and N=10 does not. Writing “up to term ten” without stating whether indexing starts at zero can change the claimed tolerance.
:::

::: figure #fig-15-3
Finite geometric sums approach two from below; the missing tail follows an exact formula rather than a visual estimate.
:::

The harmonic terms 1/n tend to zero, but grouping terms from n=2^{j−1}+1 through2^j gives 2^{j−1} terms, each at least1/2^j. Each block therefore contributes at least1/2. After any number of complete blocks the partial sum has increased by at least half that number, so the sums are unbounded. The infinite process cannot converge to a finite number. The proof gives a lower bound on arbitrarily distant sums; no finite screenshot can replace that quantifier.

For nonnegative terms, partial sums are increasing. The monotone convergence theorem from Section1 says they converge precisely when bounded above. This yields the comparison test: if 0≤a_n≤b_n eventually and Σb_n converges, Σa_n converges; finitely many initial terms only change its value by a finite amount. Conversely, a nonnegative lower comparison to a divergent series proves divergence. For n≥2, 1/n²≤1/[n(n−1)]=1/(n−1)−1/n. The comparison's finite sum telescopes to1−1/N and is bounded by one. Including the first term bounds Σ1/n² by two, proving convergence without calculating its exact value.

Absolute convergence means Σ|a_n| converges. It implies convergence of Σa_n: write a_n=p_n−m_n with p_n=max(a_n,0), m_n=max(−a_n,0). Both nonnegative partial-sum sequences are bounded by the absolute-sum bound and therefore converge. Subtract their limits. This establishes the implication using completeness already taught. The converse can fail; the alternating harmonic series is a later optional proof. Rearranging finitely many terms is harmless, while rearranging an infinite conditionally convergent series needs a separate theorem. Do not transfer finite commutativity into an unjustified interchange of infinite limits.

The ratio test is another comparison argument. Suppose terms are eventually nonzero and |a_{n+1}/a_n|→L. If L<1, select q with L<q<1; beyond some N the ratios are at most q. Then |a_{N+j}|≤|a_N|q^j by induction, so a geometric comparison gives absolute convergence. If L>1, select a factor above one but below L; eventually magnitudes increase and cannot tend to zero. When L=1 the test gives no conclusion: both1/n and1/n² have ratios tending to one, yet their series behave differently. If infinitely many terms are zero, division-based ratios may be undefined; use another bound or analyse the nonzero pattern rather than ignore the domain issue.

For computation, a proven tail bound provides an error certificate for a finite approximation to a mathematically defined sum. Floating-point accumulation adds another source of error. The total discrepancy is bounded by truncation error plus arithmetic error, when both are bounded under an appropriate model. A tiny next term is a valid stopping certificate only when a theorem relates it to the remaining tail. For positive geometric q it does through1/(1−q); for harmonic terms it cannot, because the remaining sum is unbounded. Algorithms must attach stopping rules to the structure of the actual series.

::: check
Why does 1/n→0 fail to prove harmonic convergence? What does a ratio limit of one establish? If ten terms start at exponent zero, what is the geometric tail for q=1/2,C=1?
:::
::: answer
Convergence concerns partial sums, and the harmonic block lower bounds make those sums unbounded. Ratio one is inconclusive. Ten terms omit exponent ten onward, giving tail2⁻⁹=1/512.
:::

## 6. Iteration, residuals and misleading stopping rules {#s6}

An iterative method generates x_{k+1}=F(x_k). Convergence of this sequence is one question; correctness of its limit for the intended problem is another. If F is continuous and x_k→x*, passing to the limit in the recurrence gives x*=F(x*). Without continuity this passage needs justification, and without convergence the recurrence alone supplies no solution. A fixed point can also exist while a chosen starting point fails to approach it. The identity map has every point fixed, whereas F(x)=2x has fixed point zero but drives any nonzero initial value away from it.

::: worked title="A contraction with a quantitative error certificate"
Let F(x)=x/2+1. Its fixed point is two, and x_{k+1}−2=(x_k−2)/2 gives x_k−2=2⁻ᵏ(x_0−2). From x_0=10, the error is8·2⁻ᵏ. Strict error below.01 requires k=10, since k=9 gives.015625 and k=10 gives.0078125. At any current x, residual |F(x)−x|=|x−2|/2, so twice the residual is exactly the error in this example. A stopping certificate names both its inequality and the quantity it bounds.
:::

A map is a contraction with factor q∈[0,1) on a set when |F(x)−F(y)|≤q|x−y| for every pair there. Suppose F maps a nonempty closed interval into itself and is such a contraction. Successive differences satisfy |x_{k+1}−x_k|≤q^k|x_1−x_0|. For m>n, the triangle inequality and finite geometric sum bound give |x_m−x_n|≤q^n|x_1−x_0|/(1−q). The iterates are Cauchy, hence converge in the reals; closure keeps their limit in the interval. A contraction is continuous by its inequality, so the limit is a fixed point. If two fixed points existed, their distance would be at most q times itself, forcing distance zero. This proves existence, convergence and uniqueness under the stated hypotheses. An unbounded closed interval also works, since the Cauchy bound supplies the needed boundedness.

Once a fixed point x* and a valid contraction factor are known, the current residual r=|F(x)−x| bounds error without knowing x*. Triangle inequality gives |x−x*|≤|x−F(x)|+|F(x)−F(x*)|≤r+q|x−x*|, hence |x−x*|≤r/(1−q). A computed rounded residual needs an arithmetic-error allowance before this becomes a rigorous numerical certificate. A contraction factor estimated from a few samples is also not a uniform theorem. State where the bound holds, whether all iterates stay there, and how the numerical residual was obtained.

::: figure #fig-15-4
Artificially shrinking an update can satisfy an update tolerance while leaving the original fixed-point residual and solution error large.
:::

Consider F(x)=x+.1(100−x), a contraction with q=.9 and fixed point100. Replace the update by x_new=x+α(F(x)−x), with α=10⁻¹⁰. At x=0 the applied step is10⁻⁹, below a tolerance10⁻⁶, while the error is almost100. The original residual is almost ten; its certified error bound is residual/(1−.9), almost100. Relaxation scales the step, so a tolerance on the applied update has a different meaning. Even when the relaxed map is a contraction, its factor is1−.1α, making its residual-to-error multiplier enormous. The same mathematics explains the failure rather than contradicting it.

Absolute and relative tolerances can be useful engineering choices: compare a discrepancy with atol+rtol·scale for a specified finite nonnegative scale. They encode an accepted approximation, not exact equality. Near zero the absolute term dominates; changing units changes the necessary absolute scale. Check residuals of the original equation, iterate movement, feasibility and any available error bounds according to the problem. A maximum iteration count can terminate an attempt but cannot certify convergence. Report which condition triggered termination so a downstream user can interpret the result.

Finite samples also cannot establish an infinite tail property. Lab1 constructs three sequences with the same first100 entries and different limiting behaviour. Lab3 samples a continuous narrow bump at10,001 regular grid points; every sampled height is zero, yet the height at its centre is one. This defeats a claim about that sampling grid, not continuity itself. Without a regularity bound controlling unsampled regions, a plot cannot certify a uniform error. A Lipschitz bound together with a maximum mesh spacing could supply such control, but obtaining the bound is additional mathematical evidence.

Finally, arithmetic can cause apparent stagnation: near10¹⁶ a binary64 computation may satisfy x+1==x because the intended increment rounds away. The real-number recurrence x_{k+1}=x_k+1 diverges, despite the stored value becoming unchanged. Inspect actual representable inputs as well as printed digits. Near a removable singularity, a nominal increment can round to zero and invoke a different domain case. Exact transformations, error bounds and finite observations play complementary roles; none should silently replace another in an AI training or numerical algorithm claim.

::: check
For a contraction with q=.9 and residual.02, what error is certified in exact arithmetic? Why is a tiny relaxed update insufficient by itself? What does a repeated floating-point value show?
:::
::: answer
Error is at most.02/(1−.9)=.2. Relaxation can shrink movement without shrinking the original residual or solution error. A repeated stored value shows stagnation in that arithmetic; it does not prove the intended real sequence converges or solves the original equation.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| Bounded means convergent. | Alternating ±1 is bounded and fails to converge. |
| A punctured limit is the function value. | An isolated assignment can differ or be absent. |
| Every small delta certifies every epsilon. | Give a delta depending on the requested epsilon and prove the implication. |
| Sign change always proves a root. | Continuity across the whole interval is required. |
| Terms tending to zero prove a series converges. | Harmonic partial sums are unbounded. |
| A ratio limit of one proves divergence. | It is inconclusive; compare1/n with1/n². |
| No change in stored digits proves mathematical convergence. | Rounding or relaxation can hide a large residual. |

## Three reproducible labs {#labs}

### Lab 1 · Samples, exact sums and different tails {#lab1}

{{LAB:lab1}}

Run with standard-library Python. Explain why the exact geometric fractions support a finite computation while the formula proves the infinite limit. Locate the first differing entries of the three prefix-matched sequences. Predict their limiting behaviour from their definitions, then run the script; do not infer it from the shared prefix.

### Lab 2 · Both sides and actual floating inputs {#lab2}

{{LAB:lab2}}

Record the nominal offset and the actual stored offset. Explain why factorisation agrees on the punctured domain but evaluating the extension at one changes the domain contract. Compare left/right samples of the threshold and reciprocal, and relate each pattern to a one-sided proof. Sampling is an illustration, not the universal argument.

### Lab 3 · A missed bump and a false stop {#lab3}

{{LAB:lab3}}

Find the unsampled peak directly from its formula. Compare the relaxed step, original residual, known error and contraction-based certificate. Repeat with a less extreme relaxation parameter and explain what changes. Interpret the final stagnation equality using the distinction between real and represented numbers.

## Fourteen exercises with full solutions {#exercises}

The first twelve exercises are required; Exercises13–14 are optional extensions. Their35 minutes supplement the eight-hour core schedule.

::: exercise #e1 level=1 kind=calculation minutes=5
For a_n=3/n, give an explicit integer N making |a_n|<.02 for every n≥N. Give a formula valid for any ε>0.
:::
::: solution
Require n>150, so N=151. In general N=⌊3/ε⌋+1 is an integer strictly above3/ε; for every n≥N,3/n≤3/N<ε. Strictness is preserved when3/ε is an integer.
:::

::: exercise #e2 level=1 kind=calculation minutes=5
Define f(x)=(x²−4)/(x−2) for x≠2 and f(2)=9. Find both one-sided limits at two and decide continuity.
:::
::: solution
On its punctured domain f(x)=x+2, so both sides tend to four and the two-sided limit is four. Since f(2)=9 differs, continuity fails. Assigning four instead would make a continuous extension; cancelling alone does not change the original assignment.
:::

::: exercise #e3 level=1 kind=calculation minutes=5
Compute the sum and exact tail after N terms of Σ_{k=0}∞3(1/4)^k. Find the smallest positive N with tail<.01.
:::
::: solution
Sum3/(1−1/4)=4; tail4·4⁻ᴺ. N=4 leaves1/64=.015625; N=5 leaves1/256=.00390625. Thus five is smallest, with exponents zero through four retained.
:::

::: exercise #e4 level=1 kind=calculation minutes=5
A map has a proved contraction factor.8 and current exact residual.006. Compute the certified error bound; distinguish it from the residual itself.
:::
::: solution
Error≤.006/(1−.8)=.03. The residual measures the difference from one map application; the distance to the unknown fixed point can be larger. This is an upper bound under the contraction hypotheses, not an assertion of exact error. Rounded residuals require additional arithmetic allowance.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove a convergent real sequence is bounded and has a unique limit.
:::
::: solution
For ε=1 the tail lies within one of its limit L, hence |a_n|≤|L|+1 there. The finite earlier terms have a maximum magnitude; taking the larger gives a global bound. If distinct limits L,M existed, let D=|L−M|>0 and choose a common tail where both errors are<D/3. Triangle inequality would give D<2D/3, impossible. Boundedness alone does not imply convergence.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Give an epsilon–delta proof of x²→9 as x→3 using a local factor bound. State the quantifier order.
:::
::: solution
Given any ε>0, choose δ=min(1,ε/7). If0<|x−3|<δ, then2<x<4 and |x+3|<7. Thus |x²−9|=|x−3||x+3|<7δ≤ε. The order is every ε, a chosen positive δ, then every eligible x. The delta may depend on ε and the fixed centre, not on the later input x.
:::

::: exercise #e7 level=2 kind=proof minutes=14
Prove absolute convergence implies convergence using positive and negative parts. Explain why this does not establish every rearrangement theorem.
:::
::: solution
Set p_n=max(a_n,0),m_n=max(−a_n,0); a_n=p_n−m_n and |a_n|=p_n+m_n. Each nonnegative partial sum is increasing and bounded by the convergent absolute partial sums, so each has a finite limit by monotone convergence. Their difference converges. This proves the original indexed series converges; claims about arbitrary reordering or exchanging multiple infinite limits require their own justification.
:::

::: exercise #e8 level=2 kind=application minutes=10
Certify existence of a root of f(x)=x²−2 on[1,2]. Can the intermediate value theorem alone certify uniqueness? Supply an additional argument here.
:::
::: solution
The polynomial is continuous on[1,2], f(1)=−1 and f(2)=2, so the intermediate value theorem gives a root. It does not alone give uniqueness. For1≤x<y≤2, y²−x²=(y−x)(y+x)>0; f is strictly increasing on that interval, so two distinct roots are impossible.
:::

::: exercise #e9 level=2 kind=application minutes=10
For F(x)=.75x+2 and x_0=0, find its fixed point, exact kth error and first k with error<.1. Give a residual certificate.
:::
::: solution
The fixed point solves.25x=2, giving eight. Error is8(.75)^k. Since k=15 gives about.106908 and k=16 about.080181, the first is16. The contraction factor is.75 everywhere, so |x−8|≤4|F(x)−x|; for this affine map the bound is equality. A geometric formula supplies a tail proof beyond any plotted iterates.
:::

::: exercise #e10 level=2 kind=application minutes=10
Suppose |a_{N+j}|≤.03(.6)^j for j≥0. Bound the omitted absolute tail from index N, then decide whether a desired.05 error is certified.
:::
::: solution
The entire omitted absolute sum is at most.03/(1−.6)=.075, so.05 is not certified by this bound. Omitting instead from N+1 gives at most.018/.4=.045, which certifies a tail strictly below.05. Arithmetic error must also be included if the partial sum is rounded. A failed upper-bound certificate alone does not prove the actual error exceeds.05.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
A program observes100 bounded sequence entries and declares convergence. Give two definitions agreeing on those entries with different outcomes, and repair the claim.
:::
::: solution
Choose a_n=1/n for n≤100 in both. Continue one by1/n for all n, so its limit is zero; continue the other by(−1)^n for n>100, so it has no limit. A third constant-two tail would converge to two. The finite observation certifies only those stored entries and their sampled range. A convergence claim needs a definition and a quantified tail argument or theorem whose hypotheses are checked.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
A solver uses relaxation10⁻¹⁰, sees step10⁻⁹ and stops at tolerance10⁻⁶ for F(x)=x+.1(100−x), starting at zero. Diagnose its error and repair the termination report.
:::
::: solution
The new iterate is10⁻⁹, so its solution error is99.999999999. The original residual is approximately ten; dividing by1−.9 gives the same large error certificate. The applied step was made tiny by relaxation, not closeness to100. Report that the update threshold triggered, include the original residual and any proved error bound, and continue or return an uncertified approximation according to the requested accuracy.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Prove Σ_{n=1}∞(−1)^{n+1}/n converges but not absolutely, using odd and even partial sums and their shrinking gap.
:::
::: solution
Even sums S_{2m} increase since S_{2m+2}−S_{2m}=1/(2m+1)−1/(2m+2)>0. Odd sums S_{2m+1} decrease since their two-term increment is−1/(2m+2)+1/(2m+3)<0. Every even sum is at most every subsequent odd sum, and the gap S_{2m+1}−S_{2m}=1/(2m+1)→0. Both monotone bounded subsequences converge to the same limit, hence the whole sequence converges. The absolute series is harmonic and diverges by the block proof. No value for the conditional sum is needed to establish these properties.
:::

::: exercise #e14 level=3 kind=extension minutes=20
On[a,b], f has proved Lipschitz constant K. Samples including endpoints have adjacent spacing at most h and sampled |f|≤M. Prove a uniform bound and explain what fails without K.
:::
::: solution
Every x is within h/2 of a nearest sample because both endpoints are present and adjacent gaps are≤h. Thus |f(x)|≤|f(sample)|+K|x−sample|≤M+Kh/2. The constant and mesh hypotheses convert samples into a whole-domain certificate. Without a known regularity bound, a narrow continuous peak between samples can be arbitrarily high while all sampled heights remain small; continuity alone supplies no specified global K or computed mesh error.
:::

## Ten-question self-check {#quiz}

```quiz
? Which order defines a_n→L?
- [x] For every positive epsilon, some N works for every n≥N
- [ ] Some epsilon works for one late entry
- [ ] Every n chooses its own epsilon after seeing the error
> The convergence claim controls an entire tail for each requested accuracy; an isolated sample or reversed choice order does not.

? A real sequence is bounded. What follows?
- [ ] It necessarily converges
- [x] Its values stay within a finite range, but it may alternate
- [ ] It necessarily tends to positive infinity
> Alternating ±1 is bounded with no limit. Boundedness and convergence are distinct properties.

? A punctured limit exists at a, but f(a) differs. What follows?
- [ ] The limit disappears automatically
- [ ] Continuity still holds
- [x] The limit exists and continuity at a fails
> Limit inputs exclude a; continuity requires the value at a to match the limit at an accumulation point.

? A conservative sufficient delta bound does not cover your proposed window. What follows?
- [x] That bound has not certified the window; a failure needs more evidence
- [ ] Every limit is disproved
- [ ] A counterexample has automatically been found
> A sufficient condition need not be necessary. Distinguish an uncertified claim from a witnessed violation.

? What certifies a root between opposite-sign endpoints?
- [ ] Merely printing both signs
- [x] Continuity on the closed interval together with the sign change
- [ ] A jump of any size
> The intermediate value theorem requires continuity. A threshold jump can skip zero entirely.

? Terms1/n tend to zero. Does their series converge?
- [ ] Yes, by the term limit alone
- [ ] Yes, because every term is bounded
- [x] No; harmonic block sums are unbounded
> Vanishing terms are necessary but insufficient. Partial sums define series convergence.

? A ratio test gives limit one. What is the verdict?
- [x] Inconclusive
- [ ] Absolute convergence
- [ ] Divergence
> Both1/n and1/n² have ratio limit one, with different series outcomes.

? With proved contraction factor.9 and exact residual.01, what error is certified?
- [ ] At most.01 regardless of factor
- [x] At most.1
- [ ] Exactly zero
> Divide the residual by1−q. This bounds distance to the fixed point under the stated hypotheses.

? A relaxed floating-point iterate stops changing. What does that establish alone?
- [ ] Convergence of the intended real recurrence
- [ ] Exact satisfaction of the original equation
- [x] Stagnation of the stored iteration
> Rounding or a tiny relaxation can suppress movement. Check the original residual and mathematical hypotheses separately.
```

<div class="free-response" data-free-response data-key="math-series:m15:q10">
<label for="q10-response">10. Give an epsilon–delta proof of x²→4 at two, then specify an iteration stopping certificate that distinguishes residual, solution error and a small relaxed update.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State quantifier order, a sufficient delta, contraction hypotheses and the error inequality."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I proved a whole-neighbourhood statement and kept numerical termination distinct from a mathematical limit.</label>
</div>

::: answer
For each ε>0 choose δ=min(1,ε/5); every0<|x−2|<δ has |x+2|<5 and |x²−4|<5δ≤ε. For an iteration with a proved invariant domain, fixed point and contraction factor q<1, exact original residual r=|F(x)−x| gives error≤r/(1−q). Include arithmetic allowances for a numerical certificate. A relaxed step αr can be tiny because α is tiny, so it does not alone certify small original residual or error. Report which termination condition and bound were satisfied.
:::

## Reading with a purpose {#reading}

Use limits, continuity and infinite-process materials in the primary [MIT OpenCourseWare single-variable calculus course](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/). The official [Python3.11 floating-point tutorial](https://docs.python.org/3.11/tutorial/floatingpoint.html) explains representation and rounding observations used in the labs. The quantified proofs, counterexamples and stopping-rule analyses above are the lesson's own derivations.

| When | Selection and question |
|---|---|
| Session1 · 20 minutes | Limits and continuity: which inputs are quantified, and is the point itself included? |
| Session4 · 20 minutes | Infinite processes and numerical representation: which claim has a theorem, and which merely has a finite trace? |

## Retrieval exit task and next step {#summary}

Without notes, state sequence and function convergence with quantifier order, prove one nonlinear limit, and give bounded-divergent and vanishing-term-divergent examples. State intermediate and extreme value hypotheses. Derive a geometric tail and the contraction residual bound.

**Exit task:** For F(x)=.8x+1, the fixed point is five. Starting at zero gives error5(.8)^k; original residual at x equals.2|x−5|. State a strict error tolerance and choose enough iterations, then explain why multiplying the update by10⁻¹⁰ invalidates an unchanged update-only accuracy interpretation.

**Ready to move on:** you can distinguish existence, quantified convergence, approximation tolerance and stored stagnation. The next module builds derivatives from limits and uses continuity boundaries when differentiating objectives. Check the [course overview](index.html) for availability.

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| a_n→L / ε,N | Every requested accuracy controls a whole tail | 数列极限、尾项阈值 |
| ε,δ | Output accuracy and input-neighbourhood guarantee | 输出精度、输入邻域 |
| One-sided / punctured | Domain approaches from one side / excludes the point | 单侧、去心 |
| Continuity | Nearby outputs approach the assigned value | 连续性 |
| Completeness / Cauchy | Real limits exist for internally close tails | 完备性、柯西 |
| Partial sum / tail | Finite approximation / omitted remainder | 部分和、尾项 |
| Absolute convergence | Sum of magnitudes converges | 绝对收敛 |
| Contraction / residual | Uniform shrink factor / fixed-point equation discrepancy | 压缩映射、残差 |
| Stagnation / tolerance | Stored movement disappears / accepted error policy | 停滞、容差 |
