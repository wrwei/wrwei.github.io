## 1. Real arithmetic and a finite representation {#s1}

An equation specifies an operation over an ideal number system. A numerical program stores a finite approximation, performs a sequence of rounded operations, and returns an approximation to that equation's result. Distinguish input representation, algorithmic arithmetic, and the approximation inherent in the model. Increasing precision can reduce rounding while leaving an incorrect derivative, an ill-conditioned inverse problem, or a biased statistical estimate unchanged. Before debugging decimals, identify the mathematical quantity, its scale, and the error that matters to its use.

A normal binary floating-point number has a sign, a significand with a fixed number p of significant binary digits, and an exponent from a finite range. Within one binade, the interval from 2^e inclusive to 2^(e+1) exclusive, consecutive normal numbers are spaced by 2^(e−p+1). Spacing grows with magnitude; the same absolute increment can change a small number and disappear when added to a large one. The exponent controls range while the significand controls local relative precision. They solve different storage problems.

The familiar IEEE binary16, binary32, and binary64 formats have p equal to 11, 24, and 53 respectively, including the implicit leading digit for normal numbers. Their spacing immediately above one, called eps by NumPy, is 2^(1−p). Under rounding to nearest with ties to even, the unit roundoff u is eps/2. Do not substitute eps for a universal minimum resolvable change: spacing depends on magnitude, and the spacing below a power of two differs from the spacing above it. Inspect the actual dtype after conversions and reductions.

For an elementary operation on normal results, absent overflow and underflow, the standard model is fl(a op b)=(a op b)(1+δ), with |δ|≤u. This is a model of the rounded exact operation on stored inputs. It does not say that the stored a equals the original real measurement, nor that a long algorithm has relative error at most u. When the exact operation gives zero, absolute reasoning is more useful. Near the underflow range, subnormal numbers provide gradually decreasing absolute spacing but can lose relative precision.

$$\operatorname{fl}(a\mathbin{\circ}b)=(a\mathbin{\circ}b)(1+\delta),\qquad |\delta|\le u.$$

Overflow occurs when a result exceeds the finite range and may produce infinity; later infinity minus infinity or infinity divided by infinity produces NaN. Underflow may produce a subnormal value or zero. Some sufficiently tiny probabilities are thus stored as zero even when the model assigns positive mass. NaN is not an ordinary missing number that can safely participate in comparisons: many comparisons with it return false. Check finiteness at defined boundaries, and decide whether an infinite mathematical result is legitimate, as for unsupported predictions in Module 27, or an implementation failure.

::: worked title="Why 0.1 + 0.2 is visibly different"
Neither decimal 0.1 nor 0.2 has a terminating binary expansion. Binary64 rounds each input, then rounds their sum. In the tested Python environment the printed sum is 0.30000000000000004, differing from the stored float 0.3 by about 5.55×10^(−17). The mathematical decimal identity remains valid. Decimal arithmetic or exact rational arithmetic changes the representation contract; rounding the display merely changes presentation.
:::

Converting an already rounded binary32 array to binary64 preserves its rounded values; it does not restore the lost original bits. Conversely, computing a sensitive reduction in binary64 before storing its final output in binary32 may preserve information that a binary32 reduction discards. State input, accumulation, and output precision separately. Mixed precision is a design choice requiring an error argument for each sensitive stage, rather than a promise that a large dtype name anywhere makes the whole pipeline accurate.

::: check
At 2^53 in binary64, is adding one necessarily distinguishable, and does conversion to a higher precision afterwards recover that one?
:::
::: answer
Spacing above 2^53 is two; a tie rounded to even can leave the value unchanged. Later conversion preserves the rounded result and cannot reconstruct a discarded increment.
:::

::: figure #fig-29-1
Spacing increases across binades; range and significant-digit precision are different limits.
:::

## 2. Error, cancellation, summation, and comparisons {#s2}

Given an ideal reference q and approximation q_hat, absolute error is |q_hat−q|. Relative error divides this by |q| when q is nonzero. An absolute error of 10^(−8) is tiny relative to a million and large relative to 10^(−12). At a zero target, relative error is undefined; use an absolute scale derived from the application. For vectors choose a norm and report it. A componentwise error can reveal a badly computed small component hidden inside a small overall relative norm error.

Subtraction is not automatically inaccurate. The difference between two nearby stored floating-point values can even be exactly representable. The dangerous issue is that previously introduced errors in their operands can become large relative to a small desired difference. If a and b each carry perturbations, their difference carries the difference of those perturbations. When |a−b| is tiny compared with |a|+|b|, many accurate digits in the inputs may be needed to determine accurate digits of the result. This sensitivity is called cancellation.

Consider sqrt(1+x)−1 for small positive x. Forming 1+x can erase x, and subtracting one then gives zero. Multiplying numerator and denominator by sqrt(1+x)+1 yields x/(sqrt(1+x)+1), the same real function where defined. Its denominator is near two and does not subtract nearby values. This transformation preserves a tiny stored x without first adding it to one. Algebraic equivalence over reals therefore does not imply equal numerical behaviour. Rewriting can remove avoidable algorithmic error without changing the target.

For a sum S of n stored inputs, cancellation sensitivity is measured by Σ|x_i|/|S| when S≠0. A large value means small individual perturbations can greatly change the final relative answer. Under the usual rounding model, sequential summation has an absolute error bounded by γ_(n−1)Σ|x_i|, where γ_k=ku/(1−ku) and ku<1. This is a named standard bound, not a universal claim under overflow or arbitrary execution rules. Its division by |S| exposes why relative error can explode for a cancelling sum.

Pairwise reduction reduces the depth of arithmetic dependencies from n to roughly log2 n, giving an improved bound under corresponding assumptions. Compensated schemes retain low-order parts otherwise discarded by additions. Python math.fsum is useful for a high-quality sum of binary floating inputs; it does not infer their original decimal intention. Different reduction orders, including threaded library implementations, can change final low-order bits. Rearranging terms by magnitude is not a universal cure for cancellation, and a different reduction does not repair a badly conditioned data problem.

::: worked title="One unit lost and recovered"
For the exactly representable stored inputs 10^16, 1, −10^16, left-to-right binary64 addition returns zero: adding one at the large scale loses it. A high-quality sum returns one. Use Decimal.from_float with sufficient precision as a reference for these stored binary values. Decimal constructed from the text "0.1" would instead reference a decimal input contract, so the two experiments answer different questions.
:::

Numerical comparisons need an explicit reference and scale. A common rule is |a−b|≤atol+rtol|b|, treating b as reference; NumPy allclose uses this asymmetry. Near zero, atol controls acceptance. For quantities with different units, choose tolerances per quantity rather than one dimensionless magic constant. A small rtol with a large atol may accept a completely wrong tiny probability. Equality of integer counts, task IDs, shapes, and exact Boolean contracts should remain exact when their mathematical contract is exact.

Bounds and branch decisions require particular care. An eigenvalue slightly below zero may reflect rounding of a PSD matrix or a genuinely indefinite input. Compare its magnitude with a scale-aware numerical tolerance, report that tolerance, and retain a clear distinction between a mathematical proof and a numerical check. An input outside a model's domain is not made valid by silently clipping it. Likewise, clipping probabilities before taking logs changes an infinite or very large loss into a different quantity; it should not be passed off as a stable evaluation of the original objective.

::: check
Why can subtraction be exact in the machine yet the answer be inaccurate relative to the original real inputs?
:::
::: answer
The stored operands already contain representation or upstream errors. Exact subtraction of those stored values preserves their error difference, which can dominate a very small true difference.
:::

## 3. Conditioning and forward/backward error {#s3}

Conditioning belongs to a mathematical problem with a declared input/output metric. For a differentiable scalar map f at nonzero x with nonzero f(x), a local relative condition number is |x f'(x)/f(x)|: a small relative input change is amplified by about this factor to first order. For f(x)=x² away from zero it equals two. For f(x)=x−1 near one it becomes |x/(x−1)| and can be enormous. At zeros or nondifferentiable points, another absolute or local definition is needed.

The declared metric matters in practice. A parameter vector mixing metres, seconds and dimensionless coefficients does not have an intrinsically meaningful unweighted Euclidean error. Changing units can change a matrix condition estimate without changing the physical experiment. Choose nondimensional coordinates or an application-motivated weighting before interpreting the number. If predictions are the scientific target, inspect their sensitivity separately from coefficient sensitivity: nearly collinear predictors can allow unstable coefficient trade-offs while their combined fitted predictions remain similar on the observed design. New inputs outside that design can expose the unstable direction again. This is a reason to report the target quantity, rather than one condition number as a verdict on the whole model.

Algorithmic stability concerns how a particular computation responds to arithmetic errors. Forward error compares its output to the exact answer for the intended stored input. Backward error asks whether its output exactly solves a nearby problem and how nearby that input is. A backward-stable algorithm can deliver large forward error for an ill-conditioned problem: it faithfully solves a slightly changed input whose mathematical solution is very different. Accurate arithmetic and insensitive mathematics are separate properties, and reporting one does not establish the other.

For nonsingular A in a linear solve Ax=b, the induced two-norm condition number is κ2(A)=||A||2||A^(−1)||2=σ_max/σ_min. Multiplying the entire matrix and right-hand side by the same nonzero scalar leaves this condition number unchanged. Unequal row or column scalings can change the coordinate metric and conditioning; they must preserve the original model when transformed back. A singular matrix has no ordinary inverse, and this condition number is infinite. Numerical rank uses a declared threshold and is a precision-dependent decision.

Hold A fixed and perturb b by δb. Then δx=A^(−1)δb, so ||δx||≤||A^(−1)||||δb||. Since ||b||≤||A||||x||, division gives relative solution error at most κ(A) times relative right-hand-side perturbation. This is a worst-direction bound, not an equality for every perturbation. Direction matters: an input change aligned with a small singular mode is amplified most. A high condition number predicts a possible sensitivity; it does not prove every observed solve is inaccurate.

If A changes as well, write (A+ΔA)(x+δx)=b+δb. Rearranging gives δx=A^(−1)(δb−ΔA x−ΔA δx). Apply norms and move the last term left. If κ(A) ε_A<1, with ε_A=||ΔA||/||A|| and ε_b=||δb||/||b||, this yields a relative bound κ(A)(ε_A+ε_b)/(1−κ(A)ε_A). The denominator states when the perturbative argument is useful. Near singularity, even tiny changes can invalidate a reassuring-looking bound.

The residual r=b−A x_hat is available without knowing the true x. With fixed A, x_hat exactly solves the perturbed right-hand side b−r, so ||r||/||b|| is a right-hand-side backward-error measure when b≠0. Forward error obeys ||x_hat−x||/||x||≤κ(A)||r||/||b||. A small relative residual therefore needs a condition estimate before it implies a small solution error. Evaluate the residual with sufficient precision; computing it in the same low precision as the solve can hide discrepancies.

$$\frac{\|\hat x-x\|_2}{\|x\|_2}\le\kappa_2(A)\frac{\|b-A\hat x\|_2}{\|b\|_2},\qquad \kappa_2(A)=\frac{\sigma_{\max}}{\sigma_{\min}}.$$

::: worked title="A tiny residual with a large error"
Let A have rows (1,1) and (1,1+ε), with ε=10^(−8). The true x=(1,1) gives b=(2,2+ε). The candidate (0,2) differs from x by relative two-norm one, but its residual norm is only ε, about 3.54×10^(−9) relative to b. A has condition number approximately 4/ε. Changing only b's second component by ε can therefore change the solution by order one.
:::

::: figure #fig-29-2
Small residuals certify a nearby right-hand side; conditioning controls how far its solution can move.
:::

::: widget name=numerical
Vary the small diagonal mode, right-hand-side perturbation, and arithmetic precision. The explorer solves a diagonal example and separates residual, forward sensitivity, and rounded input loss. Its condition number is exact for the displayed ideal diagonal matrix; decimal input storage is still approximate.
:::

::: check
Does a backward-stable solve of a nearly singular matrix guarantee accurate coefficients?
:::
::: answer
No. It solves a nearby input accurately, but a high condition number can amplify that small backward error. Examine singular values, perturbation scale, residuals and the intended interpretation of coefficients.
:::

## 4. Solvers, decompositions, and iterative methods {#s4}

For a square nonsingular system, solve using a suitable factorisation rather than explicitly forming an inverse and multiplying it by b. The inverse requires extra work and storage and adds another stage of rounding. A dense general solve typically uses pivoted elimination; a symmetric positive-definite system admits Cholesky. Structure must be established, not inferred from a variable name. A reported factorisation failure can mean an invalid mathematical assumption, a near-singular rounded input, or a threshold decision that should be examined.

Least squares minimises ||Xw−y||² with n rows and d columns. For full column rank, its normal equations are XᵀXw=Xᵀy. If X=UΣVᵀ, the nonzero singular values of X are σ_i and the eigenvalues of XᵀX are σ_i². Therefore κ2(XᵀX)=κ2(X)² exactly for the real full-rank matrix. Forming the Gram matrix can lose a small mode before the subsequent solve begins. Its computed condition number need not equal the exact square once rounding has changed that matrix.

With a reduced QR decomposition X=QR and orthonormal columns of Q, split y into its projection QQᵀy and its orthogonal remainder. Pythagoras shows that minimising the residual is equivalent to minimising ||Rw−Qᵀy||². For nonsingular R, solve Rw=Qᵀy by triangular substitution. This avoids explicitly squaring the singular values through a Gram matrix. Backward stability is a property of suitable implementations and assumptions, rather than of every hand-written routine that merely calls itself QR.

SVD reveals rank and directions of sensitivity directly. In full rank the least-squares coefficients are VΣ^(−1)Uᵀy; small σ_i multiply projected noise by large reciprocals. At deficient rank, a pseudoinverse returns a minimum-norm solution under a chosen rank threshold. Truncating a small singular value changes the target solution, which may be desirable as regularisation but must be stated. NumPy's pinned lstsq call uses rcond=None explicitly and returns rank and singular values; its residual array can be empty, so compute a residual directly for a consistent diagnostic.

For large systems, iterative methods can avoid a dense factorisation. Gradient iteration for a quadratic with SPD Hessian H has error update e_(t+1)=(I−ηH)e_t. Each eigenmode multiplies by 1−ηh_i; a fixed rate contracts all modes exactly when 0<η<2/h_max. If h_min is very small, the safe rate can still produce slow progress in that mode. Conjugate gradients exploits SPD structure and in exact arithmetic terminates within the dimension; finite arithmetic, stopping tolerances, and preconditioning qualify that statement.

::: worked title="Curvature and an unstable iteration"
For H=diag(1,100), rate .01 gives factors .99 and zero. The stiff mode disappears after one step while the other decays slowly. Rate .03 gives factors .97 and −2, so the second component doubles in magnitude with alternating sign. After twenty steps from (1,1), that component is 2^20. A tiny residual in another coordinate does not justify stopping this divergent run.
:::

Preconditioning transforms a system so iterative progress is better balanced, while preserving how the original solution is recovered. For SPD problems, symmetric transformations maintain the structure needed by the solver. Feature standardisation in learning similarly changes coordinates and can reduce curvature imbalance, but penalties expressed in the new coordinates represent a different geometry unless transformed consistently. Measure condition and convergence in the declared coordinates. Do not confuse a changed estimator, such as ridge, with a purely algebraic solver repair.

Costs also depend on structure. Dense QR for n≥d typically requires order nd² work and nd storage for the design; a triangular solve costs order d². A dense square factorisation costs order d³, while reusing its factors for another right-hand side is cheaper. Sparse matrix-vector products can cost proportional to stored nonzeros, but sparse factorisation can introduce fill. Report the operation model and memory shape before comparing a theoretical count with wall time. Hardware and library choices affect constants and parallelism.

::: check
Why can QR preserve an informative small least-squares mode that normal equations lose?
:::
::: answer
Normal equations form a matrix whose smallest mode is squared, increasing relative conditioning and exposing it to rounding during Gram construction. Suitable QR operates on X and avoids that explicit squaring; it still cannot remove the problem's inherent sensitivity.
:::

## 5. Stable probability objectives and derivative checks {#s5}

The sigmoid σ(z)=1/(1+exp(−z)) can overflow internally for a large negative z. Evaluate its positive branch directly, and for negative z use exp(z)/(1+exp(z)). Both branches have exponent arguments at most zero. Finite arithmetic can still round extremely small values to zero and extremely large probabilities to one. Returning a plausible endpoint does not mean its logarithm remains a faithful loss calculation. Compute log probabilities from logits when that is the quantity required by the objective.

For finite logits z_j, let m=max_j z_j. Softmax equals exp(z_j−m)/Σ exp(z_k−m), since the common exp(m) factor cancels. Each exponential is at most one and at least one equals one. Log-sum-exp is m+log Σ exp(z_k−m). The class-c negative log-probability can be evaluated more accurately as log Σ exp(z_k−m)−(z_c−m), avoiding subtraction of a large common offset after adding it back. This derivation assumes a nonempty set of finite logits; all −infinity or NaN requires an explicit separate contract.

For Bernoulli y∈{0,1}, negative log-likelihood is softplus(z)−yz. A stable form is max(z,0)−yz+log1p(exp(−|z|)). The function log1p accurately evaluates log(1+t) for small t without first erasing t in 1+t. Its derivative is σ(z)−y. For a mean loss with X of shape n by d and w of length d, the gradient is Xᵀ(σ(Xw)−y)/n, plus any declared penalty gradient. Stable arithmetic must preserve the same objective and mean normalisation used in the derivation.

$$\ell(z,y)=\max(z,0)-yz+\log(1+e^{-|z|}),\qquad \nabla_w F=\frac{X^\top(\sigma(Xw)-y)}{n}.$$

::: worked title="Large logits without overflow"
For (1000,1001,1002), subtract m=1002 to obtain (−2,−1,0). The normalised probabilities are approximately (.09003057,.24472847,.66524096). Class-zero NLL is log(1+exp(−1)+exp(−2))+2≈2.407605964. Raw exponentials overflow in binary64, but the shifted calculation evaluates the original finite-logit model, rather than clipping it into a new one.
:::

Gradient checking compares an analytic derivative with an independent numerical approximation of the same smooth scalar objective. A central difference in coordinate j is [F(w+he_j)−F(w−he_j)]/(2h). Taylor expansion with a bounded third derivative gives truncation error order h². Rounding in the two function evaluations is divided by h and typically contributes order u/h times a relevant function scale. Decreasing h indefinitely therefore makes the check worse. A rough balance suggests h of order u^(1/3) in suitably scaled coordinates, not a universal fixed value.

Use a sweep of h, both absolute and scale-aware relative errors, and several coordinates or random directions. A directional check compares gᵀv with a central difference along v and can be cheap for high-dimensional models. Scale v and h explicitly. Verify input shapes, objective reduction, regularisation, and intercept treatment before blaming rounding. A missing factor n produces a systematic discrepancy across a sensible h range; increasing precision will not fix it. Two implementations sharing the same wrong formula can agree, so independence of the check matters.

Coordinate steps also carry units. Adding the same h to a coefficient near a million and another near a billionth probes very different relative changes, and one perturbation may not alter its stored value at all. A practical check can start with h_j=h_base max(1,|w_j|) in declared nondimensional coordinates, then sweep h_base and inspect each result. The maximum is a heuristic scale choice, not a theorem ensuring accuracy for every objective. Report the actual perturbations and a useful error plateau. A single pass/fail threshold hides whether a disagreement tracks truncation, rounding, or a persistent algebraic mistake.

At a kink, such as absolute value at zero, the symmetric finite difference can be zero while no ordinary derivative exists. At piecewise branches, check away from boundaries unless a subgradient contract is specifically intended. Freeze stochastic sampling, dropout masks, and data order during a smooth derivative test; otherwise different function evaluations represent different random objectives. A check on a small controlled example establishes local implementation evidence, rather than a proof of every branch, every input, or optimiser convergence.

::: figure #fig-29-3
Stable loss evaluation retains the logits' model; a derivative check balances truncation and rounding errors.
:::

::: check
If a finite-difference check at h=10^(−16) returns zero, has a nonzero analytic derivative necessarily failed?
:::
::: answer
No. The perturbed input or function values may round to the same stored values. Sweep h on a smooth, scaled example and inspect the objective and mean factor before drawing a conclusion.
:::

## 6. Precision, budgets, and a reproducible numerical report {#s6}

A numerical report should identify the equation, stored inputs, dtype at each sensitive stage, solver or update rule, and diagnostic tolerances. Include conditioning or singular values when interpreting coefficients and distinguish exact identities from measured floating outputs. A rounded display with six digits is insufficient evidence for a claimed twelve-digit error bound. Retain a machine-readable result or reproducible script, and label values that are specific to the tested platform. The mathematical explanation should account for a failure before the repaired result is presented.

Lower precision can reduce memory and increase throughput, but its value depends on an operation's arithmetic intensity, bandwidth, supported hardware instructions, and accumulation precision. Array storage uses n×d×bytes_per_element before accounting for intermediates and factorisation workspaces. A conversion can temporarily keep two arrays alive. Computing a dense d by d Gram matrix may be a memory bottleneck even when storing the original data is feasible. Numerical quality and runtime should be compared under the same problem, stopping criteria, and budget.

Approximation error has several sources with different remedies. Discretisation or finite iteration error can decrease with refinement or more steps; rounding may increase as that extra work accumulates. Monte Carlo error decreases according to the sampling law from Module 24, whereas deterministic floating error depends on arithmetic and conditioning. Statistical estimation uncertainty comes from the observed data. Reporting all of these as a single "precision" number hides their meanings. State which error estimate is measured, bounded, or merely diagnosed, and which assumptions justify it.

Seeds identify a pseudorandom experiment only together with the generator, draw order, packages, and input generation. A fixed seed does not control every threaded numerical reduction or make samples independent. Different library builds can choose different algorithms and produce small final-bit changes; different generator interfaces can produce different datasets from the same integer seed. Use tolerance-based regression checks for floating quantities, exact checks for contracts, and structural mathematical checks such as probability sums, rank assumptions, and residuals. Record why each tolerance is reasonable.

::: worked title="An auditable solver comparison"
For the fixed nearly dependent design in Lab 2, compare QR and lstsq coefficient error against a known generating vector, then compute each residual and singular values. The normal-equations coefficient error is larger in the tested environment even though its residual is small. On real data the true coefficient vector is unavailable: report sensitivity and diagnostics instead of pretending a residual measures unknown forward error. An algebraic repair improves arithmetic without promising a scientifically identifiable coefficient.
:::

Record package and Python versions, shapes, split rules, random generator, solver thresholds, and whether measured time includes data generation or factorisation. Separate compilation or warm-up from repeated timing when relevant, and report a distribution of measured times rather than an unsupported speed claim from a single run. For teaching labs, deterministic small CPU examples make the derivation inspectable. They are not benchmark evidence for all devices, all precisions, or the fastest deployment design.

::: figure #fig-29-4
A reliable experiment connects the model, precision, conditioning, algorithm, and declared error evidence.
:::

::: check
Which repairs address a nearly singular design, an overflowing softmax, and an omitted mean-gradient factor?
:::
::: answer
Diagnose design sensitivity with singular values and consider stated regularisation or better data; use shifted logits for softmax; restore division by n for the intended mean objective. More bits alone do not replace these distinct repairs.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| A float is the exact real input. | State representation and input uncertainty. |
| Every subtraction loses digits. | Analyse operand errors relative to the intended difference. |
| A tiny residual proves accurate coefficients. | Include conditioning and the available reference. |
| Normal equations preserve X's condition number. | They square its two-norm condition in full rank. |
| Smaller finite-difference h is always better. | Balance truncation, rounding and input scale. |
| Clipping is merely a stable logarithm. | It changes the probabilities and objective. |
| A seed guarantees identical results everywhere. | Record the generator, versions, arithmetic and tolerances. |

## Labs: execute, predict, and explain {#labs}

### Lab A · rounding, reduction, and rationalisation {#lab1}

Use the pinned NumPy preparation. Predict each format's loss of a unit at its large-spacing boundary. Compare sequential sum, fsum and a Decimal reference for the actual binary inputs. Explain the rationalised expression; do not call display rounding a mathematical repair.

{{LAB:lab1}}

### Lab B · sensitivity, residuals, and solvers {#lab2}

Calculate the small right-hand-side perturbation and its amplified solution change. Compare QR, lstsq and normal equations on exactly generated least-squares data. Numerical coefficient errors can vary by library; the full-rank conditioning identity and small-residual counterexample are the mathematical lessons.

{{LAB:lab2}}

### Lab C · stable loss and a derivative sweep {#lab3}

Repair raw exponential overflow and compare three central-difference steps on the identical mean objective. The smallest step fails through rounding. Diagnose the missing mean factor separately and explain the nondifferentiable absolute-value example.

{{LAB:lab3}}

## Exercises with complete solutions {#exercises}

::: exercise #e1 level=1 kind=calculation minutes=7
For p=24, compute spacing above one and above 2^24. Explain one lost addition.
:::
::: solution
Spacing above one is 2^(−23); above 2^24 it is 2. Adding one to 2^24 is a midpoint tie, which round-to-even can return to 2^24. Unit roundoff for normal nearest rounding is 2^(−24).
:::
::: exercise #e2 level=1 kind=calculation minutes=7
An approximation to 10^(−12) is 2×10^(−12). Compute absolute and relative errors; what happens at a zero reference?
:::
::: solution
Absolute error is 10^(−12), relative error is one. At zero the relative denominator vanishes; choose a meaningful absolute tolerance, not a silently substituted relative number.
:::
::: exercise #e3 level=1 kind=calculation minutes=7
Rationalise sqrt(1+x)−1 and evaluate its leading behaviour as x→0.
:::
::: solution
Multiply by the conjugate to obtain x/(sqrt(1+x)+1). The denominator tends to two, so the expression is asymptotic to x/2. Domain and a nonzero denominator are retained; small positive stored x need not be erased in 1+x first.
:::
::: exercise #e4 level=1 kind=calculation minutes=7
Compute shifted softmax and class-zero loss for logits 1000,1001,1002.
:::
::: solution
Shift by 1002. With S=exp(−2)+exp(−1)+1, probabilities are exp(−2)/S, exp(−1)/S, 1/S, approximately .090031,.244728,.665241. Loss is log S+2≈2.407606.
:::
::: exercise #e5 level=2 kind=proof minutes=15
Prove the fixed-A relative perturbation bound for a nonsingular linear system.
:::
::: solution
Subtract Ax=b from A(x+δx)=b+δb to get δx=A^(−1)δb. Norm submultiplicativity bounds δx by ||A^(−1)||||δb||. Since ||b||≤||A||||x||, divide by ||x|| and obtain relative error ≤κ(A)||δb||/||b||, for nonzero b. The bound is worst-case and depends on the norm.
:::
::: exercise #e6 level=2 kind=proof minutes=15
Prove κ2(XᵀX)=κ2(X)² for full-column-rank X and derive the QR least-squares equation.
:::
::: solution
The SVD gives XᵀX=VΣ²Vᵀ, whose positive eigenvalues are squared singular values, hence the condition ratio is squared. For X=QR, decompose y=QQᵀy+(I−QQᵀ)y. Orthogonality gives residual squared ||Rw−Qᵀy||²+||(I−QQᵀ)y||². Nonsingular R makes the first term zero at its triangular solve.
:::
::: exercise #e7 level=2 kind=proof minutes=15
Derive central-difference truncation error and explain why rounding prevents h→0 from being a general repair.
:::
::: solution
Taylor-expand F(w±he_j) through cubic order on a smooth neighbourhood. Subtract and divide by 2h: the second-order terms cancel and the derivative error is order h² with bounded third derivative. Rounded evaluation errors of scale u times a function scale are amplified by 1/h; sufficiently small h can also leave inputs unchanged. The two effects require a scale-aware sweep.
:::
::: exercise #e8 level=2 kind=application minutes=12
For the 2×2 example with ε=10^(−8), compute the relative error and relative residual of x_hat=(0,2).
:::
::: solution
True x=(1,1). Error norm √2 divided by ||x||=√2 is one. A x_hat−b=(0,ε), so the relative residual is ε/√(4+(2+ε)²)≈3.5355×10^(−9). Large κ≈4×10^8 explains their coexistence.
:::
::: exercise #e9 level=2 kind=application minutes=12
Design a smooth mean-logistic gradient check with a nonpenalised intercept and L2-penalised slopes.
:::
::: solution
Set a small fixed finite X,y,w; define F=mean(logaddexp(0,Xw)−yXw)+λ||w_slopes||²/2. Analytic g=Xᵀ(σ(Xw)−y)/n plus zero intercept penalty and λw_slopes. Sweep h on every coordinate, compare central differences with absolute and relative scales, and freeze data/randomness. An omitted division by n is a convention fault, not a tolerance problem.
:::
::: exercise #e10 level=2 kind=application minutes=12
Estimate storage for a million rows and 100 binary32 features, and explain an extra workspace risk.
:::
::: solution
The data occupy 10^8×4=4×10^8 bytes, about 400 MB in decimal units, before metadata/workspaces. A binary64 conversion adds 800 MB if both arrays coexist. A dense Gram has only 100² entries here, but large d can make d² storage dominant; state shapes before choosing a method.
:::
::: exercise #e11 level=2 kind=diagnosis minutes=12
A solver reports residual 10^(−12), an infinite condition estimate, and "twelve accurate digits." Repair the claim.
:::
::: solution
An absolute residual lacks a scale, and an infinite condition estimate suggests rank deficiency or numerical singularity. Establish rank threshold and solution contract, compute scaled residuals and singular values, and report coefficient sensitivity. A residual alone cannot establish forward digits; a deficient system may have many solutions.
:::
::: exercise #e12 level=2 kind=diagnosis minutes=12
A programmer clips probabilities to 10^(−6), then says its NLL exactly equals the finite-logit objective and a zero finite difference at abs(0) proves differentiability.
:::
::: solution
Clipping changes the probabilities and can change NLL substantially; use a stable logit loss for the original finite model. Absolute value at zero has left slope −1 and right slope 1, despite symmetric difference zero. Check smooth points or state a subgradient rule explicitly.
:::
::: exercise #e13 level=3 kind=extension minutes=15
For f(x)=x−1, derive the local relative condition number and explain the zero-output limit.
:::
::: solution
f'=1, so κ_rel=|x/(x−1)| when x and f(x) are nonzero. It diverges near one; at one relative output error is undefined. Absolute sensitivity is one, so a statement about large relative sensitivity does not mean large absolute amplification.
:::
::: exercise #e14 level=3 kind=extension minutes=20
Derive the simultaneous matrix/RHS perturbation bound and identify when it is informative.
:::
::: solution
From δx=A^(−1)(δb−ΔA x−ΔA δx), take norms, divide by ||x||, and bound ||δb||/||x|| by ε_b||A||. Obtain (1−κ ε_A)||δx||/||x||≤κ(ε_b+ε_A). Divide only if κ ε_A<1. If the denominator is nonpositive this argument gives no useful finite upper bound, rather than proving divergence.
:::

## Ten-question self-check {#quiz}

```quiz
? NumPy eps for binary64 means:
- [x] Spacing immediately above one, 2^(−52).
- [ ] The smallest positive binary64 number.
- [ ] A scale-independent minimum absolute error.
> Range, local spacing and unit roundoff are different quantities.
? Converting a rounded binary32 input to binary64:
- [x] Preserves the rounded value without restoring discarded bits.
- [ ] Reconstructs the original real value.
- [ ] Removes data uncertainty.
> Higher subsequent precision cannot infer missing information.
? Cancellation can harm relative accuracy because:
- [x] Operand errors can dominate the small intended difference.
- [ ] Every subtraction must itself be inexact.
- [ ] A small answer is mathematically invalid.
> Analyse upstream errors and scale.
? A small residual plus a large condition number implies:
- [x] Forward solution accuracy still needs analysis.
- [ ] Coefficients must have many accurate digits.
- [ ] The matrix is necessarily singular.
> Conditioning amplifies some small backward perturbations.
? In full column rank, normal equations have condition number:
- [x] κ2(X) squared in exact arithmetic.
- [ ] Always κ2(X).
- [ ] Always one.
> The Gram's positive eigenvalues square the singular values.
? A finite-logit softmax is stabilised by:
- [x] Subtracting the maximum before exponentiating.
- [ ] Clipping every logit to zero.
- [ ] Computing raw overflowing exponentials first.
> Common shifts preserve the mathematical probabilities.
? A mean logistic objective has gradient:
- [x] Xᵀ(σ(Xw)−y)/n plus the stated penalty.
- [ ] Xᵀ(σ(Xw)−y) irrespective of reduction.
- [ ] A vector with one entry per example.
> Check reduction, parameter dimensions and penalty convention.
? Central-difference h should:
- [x] Be swept to balance truncation and rounding on smooth inputs.
- [ ] Always be the smallest positive float.
- [ ] Prove a derivative exists at every kink.
> Input resolution and smoothness are part of the check.
? A fixed random seed alone:
- [x] Does not guarantee identical results across generators and numerical libraries.
- [ ] Guarantees independent data and identical hardware arithmetic.
- [ ] Replaces versions and tolerances.
> Reproducibility requires the full experimental contract.
```

<div class="free-response" data-free-response data-key="math-series:m29:q10">
<label for="q10-response">10. Diagnose a near-dependent least-squares fit and an overflowing probability loss. Distinguish representation, conditioning, stability, residual and derivative errors, then specify repairs and tolerances.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="State the target, stored inputs, singular values, algorithm and evidence."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I separated inherent sensitivity from avoidable arithmetic and model-convention faults.</label>
</div>
::: answer
Inspect dtype and singular values, then use suitable QR/SVD with a declared rank threshold and scaled residuals. Large conditioning can leave coefficients sensitive despite stable arithmetic. Evaluate original log probabilities with shifted logits/logaddexp and check mean-loss derivatives over sensible h. Set scale-aware tolerances, record versions and generator, and avoid claiming unknown coefficient forward accuracy from residuals alone.
:::

## Reading with a purpose {#reading}

Check the pinned official [NumPy 1.26 finfo](https://numpy.org/doc/1.26/reference/generated/numpy.finfo.html), [lstsq](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.lstsq.html), and [cond](https://numpy.org/doc/1.26/reference/generated/numpy.linalg.cond.html) references for precision, rank thresholds and norm selection. The [SciPy 1.14 logsumexp reference](https://docs.scipy.org/doc/scipy-1.14.0/reference/generated/scipy.special.logsumexp.html) is an optional library comparison; the labs need NumPy alone. The conditioning and derivative arguments above are derived here.

| When | Selection and question |
|---|---|
| Session 1 · 20 minutes | finfo: distinguish eps, normal minimum and subnormal minimum. |
| Session 4 · 20 minutes | lstsq/cond: inspect rank cutoff, residual shape and condition norm; compare stable logsumexp. |

## Retrieval exit task and next step {#summary}

**Exit task:** produce a numerical audit containing a spacing example, a cancellation repair, a residual/sensitivity counterexample, a solver justification, a stable probability calculation and a smooth derivative sweep.

**Ready to move on:** explain what the computation establishes and what uncertainty remains. Generalisation next connects mathematical risk statements to finite data and kernel models. Return to the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term | Meaning | 中文 |
|---|---|---|
| eps / u | Spacing above one / unit roundoff | 机器间距、单位舍入误差 |
| Cancellation | Sensitivity of a small difference to operand errors | 消去 |
| Condition number | Input-to-output perturbation sensitivity | 条件数 |
| Forward / backward error | Output error / nearby-input error | 前向、后向误差 |
| Residual | b−A x_hat | 残差 |
| Rank cutoff | Threshold defining retained singular modes | 秩截断阈值 |
| Log-sum-exp | Stable logarithm of summed exponentials | 对数指数和 |
| Central difference | Symmetric numerical derivative approximation | 中心差分 |
