## A derivative is a justified local model {#start}

A training objective changes when a parameter changes. A derivative describes that change to first order at a specified point; it is neither a finite difference at one chosen step nor a guarantee about a large parameter move. This module connects the difference-quotient definition to local linear approximation, derives differentiation rules, and states the hypotheses behind stationary-point and Taylor arguments. Its final section checks when numerical derivative evidence is misleading.

**Retrieval check:** state the limit and continuity definitions from [Module15](module_15_EN.html#s3), explain the extreme value theorem, and derive a geometric tail. Recall function composition, absolute-value inequalities and radians from Module01. The three labs use only standard-library Python.

## Difference quotients local linearity and sensitivity {#s1}

For a real function defined on an open neighbourhood of a, its derivative at a is the finite limit

$$f'(a)=\lim_{h\to0}\frac{f(a+h)-f(a)}{h}.$$

The inputs h exclude zero and approach from both sides. A derivative on a domain endpoint can be explicitly defined one-sided, but that is a different qualification. An infinite difference-quotient limit is not a finite derivative. We write f′(a), Df(a) or df/dx evaluated at a; the symbols denote the same scalar quantity here. A derivative function f′ can be defined at all points where these limits exist, with its own domain.

Differentiability is equivalent to a first-order local model: f(a+h)=f(a)+Dh+r(h), where r(h)/h→0. The notation r(h)=o(h) means precisely that quotient vanishes, or equivalently |r(h)|/|h|→0. If the derivative exists, subtract its linear term to obtain this remainder; conversely, dividing this model by h gives the derivative D. This is a relative statement about the remainder compared with step size. It does not require the approximation to equal the function, and it supplies no universal radius where any particular numerical error is acceptable without another bound.

::: worked title="Deriving the tangent of a cubic"
At a=2, (2+h)³−8=12h+6h²+h³. The quotient is12+6h+h², so its limit is12. The tangent model is8+12h, with exact remainder6h²+h³. For |h|≤.1, the absolute remainder is at most6.1h². At h=.1 the true increment is1.261 while the tangent predicts1.2; the.061 error matches the exact remainder. A local slope is not an exact finite increment.
:::

The derivative has units of output per input unit. If time is measured in seconds and distance in metres, the derivative is metres per second. Rescaling an input coordinate z=cx for nonzero c gives the derivative with respect to z divided by c. Thus numerical gradient magnitudes cannot be compared without the chosen parameter units and objective scaling. A small derivative may reflect units, saturation or genuine local insensitivity. It is not automatically a good stopping certificate for a global optimisation problem.

For a small absolute perturbation Δx, the first-order output perturbation is f′(a)Δx. When a≠0 and f(a)≠0, the local relative sensitivity factor is |a f′(a)/f(a)|: relative output change is approximately this factor times relative input change. This expression is undefined if its denominator or relative input scale vanishes. Use an absolute statement at those boundaries instead of treating division by zero as zero sensitivity. A vanishing first derivative can also leave a second-order response, as x² at zero illustrates.

Differentiability implies continuity. The difference quotient is bounded near zero if it has a finite limit, and multiplying it by h shows f(a+h)−f(a)→0. Continuity alone does not imply differentiability. For |x| at zero the right quotient is one and the left quotient minus one. A symmetric quotient is zero for every h≠0, but the two-sided derivative does not exist. Symmetric cancellation can conceal incompatible one-sided rates; this becomes an explicit lab failure case.

An absolute linear model is often more useful than a relative factor near a zero output. For f(x)=x²−1 at a=1, the output is zero and relative output error is undefined. Nevertheless, f(1+h)=2h+h² gives a perfectly meaningful absolute prediction and an exact remainder. On |h|≤.1, the remainder magnitude is at most.01 and can be tightened to h² for a specified step. Conversely, for exp(x) the local relative sensitivity at nonzero a is |a| even though its absolute derivative exp(a) can be enormous. The two measures answer different scale questions, so record which quantity a sensitivity report uses.

::: figure #fig-16-1
A secant slope depends on a nonzero step; a tangent is the limiting local line. The cubic's remainder explains their difference.
:::

::: check
Does f′(a)=0 mean all nearby outputs are equal? Does one accurate central difference prove differentiability? What does o(h) actually require?
:::
::: answer
x² at zero disproves the first claim. A central estimate can average unequal one-sided slopes, so it does not prove differentiability. The remainder divided by the step must tend to zero; merely tending to zero without that scaling is weaker.
:::

## Elementary derivatives with domains and foundational limits {#s2}

For a positive integer n, the binomial identity gives (a+h)^n−a^n=na^{n−1}h plus terms with at least h². Dividing by h and taking the limit yields d(x^n)/dx=nx^{n−1}, including a=0. Constants have derivative zero directly from their quotient. Treat n=0 separately at zero rather than write an ambiguous zero times x⁻¹. Negative integer powers require x≠0 and follow from the reciprocal rule proved next. Real powers on positive x are defined as x^p=exp(p ln x), so their formula px^{p−1} follows from exponential, logarithmic and chain rules. A real power's domain at nonpositive x needs a separate definition; do not silently extend the positive-domain formula to every real input.

One rigorous foundation for exp is its convergent series Σ_{k=0}∞x^k/k!. The ratio test gives absolute convergence for every fixed x. Multiplying two such series and grouping by total degree yields exp(x+y)=exp(x)exp(y) through the binomial identity. Here the infinite regrouping is justified: the absolute double tail with j+k>N is contained in the union j>N/2 or k>N/2, and its magnitude is bounded by one vanishing absolute tail times the other full absolute sum, plus the reversed product. Thus diagonal finite sums and rectangular finite products approach the same limit. This supplies the missing infinite-interchange justification rather than assuming finite distributivity is automatically enough.

For |h|<1, the series tail after1+h has magnitude≤Σ_{k=2}∞|h|^k=h²/(1−|h|). Hence (exp(h)−1)/h→1. The addition identity then gives [exp(a+h)−exp(a)]/h=exp(a)[exp(h)−1]/h, so exp′(a)=exp(a). No term-by-term differentiation was needed. The identity exp(x)exp(−x)=1 rules out zeros; writing exp(x)=exp(x/2)² proves positivity. With positive derivative and the mean value theorem below, exp is strictly increasing. Its growth and reciprocal identity give the positive range, permitting its inverse ln on(0,∞).

For trigonometric derivatives, angles must be in radians. Unit-circle geometry for0<h<π/2 gives sin h<h<tan h and therefore cos h<sin h/h<1. Continuity of cosine and the squeeze principle establish sin h/h→1, including negative h by symmetry. The identity1−cos h=2sin²(h/2) implies (cos h−1)/h→0. Using the addition formulas in the difference quotients gives sin′x=cos x and cos′x=−sin x. If an input is measured in degrees, convert radians as πx/180; the chain rule contributes π/180. The ordinary formulas presume the radian coordinate.

The inverse rule below gives ln′x=1/x for x>0. For log_b x=ln x/ln b, require b>0 and b≠1, and obtain derivative1/(x ln b). For b^x=exp(x ln b), b>0 gives derivative b^x ln b. A logarithm derivative on positive inputs does not define ln of a negative number; ln|x| is a separately defined function on x≠0 and also has derivative1/x. Its two disconnected domain components need care in any mean-value argument crossing zero.

::: worked title="Read the domain before using a formula"
For f(x)=ln(1+x), the real domain is x>−1 and f′(x)=1/(1+x). At zero the slope is one; at−.9 it is ten, indicating greater absolute local sensitivity near the excluded boundary. For g(x)=sqrt(x), the interior derivative is1/(2sqrt(x)) for x>0. At zero, the right quotient is1/sqrt(h) and has no finite limit. The interior formula cannot be evaluated there to manufacture a derivative.
:::

These formulas can now be assembled, but each computation retains the domain intersection of its pieces. A quotient may exclude zeros of its denominator, a log excludes nonpositive inner values, and an inverse may lose differentiability where the original derivative vanishes. The computational expression and the function contract must travel together. A simplified formula may possess values beyond the original domain, just as cancellation did in the previous module.

::: check
Why does sin measured in degrees require a factor? Is ln′x=1/x permission to evaluate ln at negative x? Can an interior square-root derivative settle its boundary case?
:::
::: answer
The coordinate change from degrees to radians contributes π/180. ln has positive real domain; ln|x| is a different function. At zero, square root needs its own one-sided quotient analysis and has no finite derivative.
:::

## Product quotient chain and inverse rules {#s3}

If f and g are differentiable at a, the derivative of their sum is the sum of their derivatives by the limit sum rule. Fixed scalar multiplication follows in the same way. For a product, add and subtract f(a+h)g(a): the quotient becomes f(a+h)[g(a+h)−g(a)]/h+g(a)[f(a+h)−f(a)]/h. Differentiability supplies continuity of f, so taking limits yields (fg)′=fg′+gf′. Both terms matter because both factors change. Squaring a changing factor gives2ff′, rather than only one copy of ff′.

For g(a)≠0, continuity keeps g nonzero nearby. The reciprocal quotient is −[g(a+h)−g(a)]/[h g(a+h)g(a)], giving (1/g)′=−g′/g². Combine with the product rule to obtain (f/g)′=(f′g−fg′)/g². The nonzero denominator hypothesis applies at the evaluation point and in the local domain. It excludes claiming a quotient derivative at a point removed from the original function, even when a simplified expression extends continuously there.

The chain rule is (f∘g)′(a)=f′(g(a))g′(a), provided g is differentiable at a, f at g(a), and the nearby composition is defined. A proof avoiding illegal division by g(a+h)−g(a) uses local models. Write Δg=g(a+h)−g(a)=g′(a)h+o(h), and f(g(a)+u)−f(g(a))=f′(g(a))u+uη(u), where η(u)→0 and set η(0)=0. Since Δg→0 and Δg/h stays bounded, the remainder (Δg/h)η(Δg)→0. This covers Δg=0 as well; a proof that divides by that increment without qualification can miss constant inner functions.

::: worked title="A nested exponential with both dependency paths"
For f(x)=exp(x²), outer derivative is exp(u), inner derivative2x, so f′(x)=2x exp(x²). Differentiate again using product and chain rules: f″(x)=2exp(x²)+4x²exp(x²)=(2+4x²)exp(x²). At x=.7 the first derivative is approximately2.285242707938. Omitting the inner factor would give exp(.49), while omitting a product term in the second derivative loses curvature even at zero.
:::

For an inverse rule, assume f is one-to-one near a, its inverse is continuous near b=f(a), and f′(a)≠0. As y→b, x=f⁻¹(y)→a; for y≠b, injectivity ensures x≠a. The inverse secant is (x−a)/(f(x)−f(a)), reciprocal to the original secant, so its limit is1/f′(a). Thus (f⁻¹)′(b)=1/f′(a). Nonzero derivative is essential: f(x)=x³ is invertible, but its inverse cube root has no finite derivative at zero. Local monotonicity and continuity establish the inverse hypotheses for exp, yielding the logarithm derivative above.

General real powers on x>0 now follow without ambiguity: differentiate exp(p ln x) to get exp(p ln x)p/x=px^{p−1}. For p=0 this is zero on the stated positive domain; elsewhere use the separate constant definition. Integer powers already have a broader direct proof, so the positive-domain construction need not artificially remove their negative inputs. Choosing a representation for a proof and specifying the actual function domain are separate tasks.

Rules express dependencies, not just symbolic pattern matching. A parameter appearing in two factors contributes through both paths; a nested parameter requires every chain factor. In later matrix calculus these become sums of contributions and correctly shaped products. Here the scalar derivations provide the simpler setting in which missing paths can be identified explicitly before automatic differentiation is introduced.

::: check
Why does the chain proof use a remainder rather than always divide by the inner increment? What breaks an inverse derivative when f′(a)=0? Which two contributions appear in d[x exp(x)]/dx?
:::
::: answer
The inner increment can be zero even when h≠0. A reciprocal secant with limit zero cannot yield a finite reciprocal limit, as cube root at zero shows. The product derivative is exp(x)+x exp(x), one term for each changing factor.
:::

## Mean values stationary points and extrema {#s4}

A local minimum at an interior point a means f(a)≤f(x) throughout some neighbourhood; a global minimum compares every domain input. Strict versions require strict inequality for distinct points. A stationary point is an interior differentiable point with f′(a)=0. These properties differ. A global minimiser may be an endpoint or a kink and therefore need not be a stationary point; a stationary point can be a maximum or neither kind of extremum.

Fermat's necessary condition says a differentiable interior local extremum has derivative zero. At a minimum, positive h gives a nonnegative quotient and negative h a nonpositive quotient. If their common limit exists, it must be both nonnegative and nonpositive, hence zero. Reverse signs for a maximum. This proof states why interiority and differentiability matter. On[0,1], f(x)=x minimises at zero with right derivative one; |x| minimises at its nondifferentiable zero.

Rolle's theorem assumes continuity on[a,b], differentiability on(a,b), a<b, and f(a)=f(b). The extreme value theorem provides an attained maximum and minimum. If the function is constant, every interior derivative is zero. Otherwise some value differs from the endpoint value, so an appropriate attained extremum lies in the interior and Fermat gives a point c with f′(c)=0. This is an existence theorem; it does not specify c or imply all slopes vanish.

For the mean value theorem, subtract the secant line from f so the adjusted function has equal endpoint values. Rolle then gives some c∈(a,b) with f′(c)=[f(b)−f(a)]/(b−a). The same continuity and differentiability hypotheses apply. Consequently, a derivative bounded in magnitude by M throughout an interval gives |f(b)−f(a)|≤M|b−a|. This is a whole-interval sensitivity bound, stronger than a derivative value at one endpoint. A positive derivative throughout an interval gives strict increase; an everywhere-zero derivative gives constancy on that interval.

The interval condition cannot be discarded. ln|x| has derivative1/x on each side of zero, but the mean value theorem cannot cross its excluded point. Likewise a jump may have zero derivative on each open side while not being globally constant. The theorem's closed-interval continuity prevents that hidden gap. When a derivative bound is used to justify a numerical tolerance, check the entire path between the compared inputs.

::: worked title="Three stationary points with different outcomes"
At zero, x² has a strict minimum, −x² a strict maximum, and x³ neither, although each first derivative vanishes there. The second derivatives at zero are2,−2,0. The positive/negative second-derivative test classifies the first two; the zero result is inconclusive. For x⁴ the second derivative is also zero at its strict minimum, so “inconclusive” cannot be replaced by “neither.”
:::

If f′(a)=0 and f has continuous second derivative near a, the second-order Taylor formula below gives f(a+h)−f(a)=f″(a)h²/2+o(h²). Positive f″(a) makes sufficiently small nonzero increments positive, giving a strict local minimum; negative gives a maximum. Zero leaves higher-order or other analysis. For a differentiable function on a closed interval with finitely identifiable stationary candidates, find global extrema by comparing all interior stationary candidates and endpoints; include nondifferentiable points if continuity holds but differentiability fails there. Do not compare only one root of f′ or ignore the domain.

The same tangent model motivates Newton's scalar root update. At an iterate a with f′(a)≠0, solve the approximate equation f(a)+f′(a)h=0, giving h=−f(a)/f′(a) and the next input a+h. This derives the formula; it does not prove convergence or keep the new input inside the domain. For f(x)=x²−2 at a=1, the update is1.5 and the residual becomes.25 instead of−1. A tiny derivative can instead produce a huge step, and a tangent can point outside a logarithm's domain. Safeguards and convergence hypotheses must be supplied separately when implementing the method.

Mean-value control can also bound root error if a root c is known to exist in an interval and |f′|≥m>0 throughout it. Applying the theorem between x and c gives |f(x)|=|f′(ξ)||x−c|≥m|x−c|, hence error≤|f(x)|/m. The lower bound over the whole segment is essential; a nonzero derivative only at x does not provide this certificate. This links sensitivity to a residual-based accuracy statement, while keeping the necessary existence and domain assumptions explicit.

::: check
Is derivative zero sufficient for a minimum? Why can an endpoint minimum have nonzero right derivative? What extra information turns a local derivative into a finite-change bound?
:::
::: answer
x³ and −x² disprove sufficiency. The interior two-sided quotient argument does not apply at an endpoint. A valid derivative magnitude bound over the whole intervening interval, together with mean-value hypotheses, bounds finite changes.
:::

## Taylor polynomials and certified approximation error {#s5}

The order-n Taylor polynomial about a is T_n(x)=Σ_{k=0}^n f^{(k)}(a)(x−a)^k/k!, with f^{(0)}=f and0!=1. Order zero is constant, order one tangent, and higher orders add curvature and subsequent local information. It is a finite polynomial whose coefficients use derivatives at one centre. A Taylor polynomial is always different as a claim from an infinite Taylor series equalling f. Smoothness of every order alone does not establish that equality; error control as order increases is additional evidence.

For a finite remainder, a convenient sufficient hypothesis is that f has continuous derivatives through order n+1 on an open interval containing the closed segment from a to x. Taylor's theorem gives f(x)−T_n(x)=f^{(n+1)}(ξ)(x−a)^{n+1}/(n+1)! for some ξ strictly between distinct a and x. At x=a the remainder is zero directly. Thus a bound |f^{(n+1)}(t)|≤M on the whole segment gives |f(x)−T_n(x)|≤M|x−a|^{n+1}/(n+1)!. The unknown ξ is an existence point, not a licence to replace the derivative by its value at the centre.

A proof uses repeated Rolle. For x≠a choose C=[f(x)−T_n(x)]/(x−a)^{n+1} and define r(t)=f(t)−T_n(t)−C(t−a)^{n+1}. Then r(a)=r(x)=0 and r′(a),…,r^{(n)}(a) all vanish. Rolle first supplies an interior zero of r′; together with r′(a)=0 it supplies a zero of r″ in the smaller segment. Repeat until r^{(n+1)}(ξ)=0. Since T_n's derivative of that order vanishes, C=f^{(n+1)}(ξ)/(n+1)!, giving the formula. The smoothness assumptions guarantee every intermediate use of Rolle, in either orientation of the segment.

::: worked title="A logarithm approximation with a stated interval bound"
For f(x)=ln(1+x), expand about zero: T₂(x)=x−x²/2. On[0,.2], f‴(t)=2/(1+t)³ has magnitude at most two. At x=.2 the Lagrange bound is2(.2)³/6=.002666667. The approximation is.18, while ln(1.2)≈.182321557, error≈.002321557 within the bound. On[−.2,0], the derivative bound increases to2/.8³; reusing the positive-side bound there would be unjustified.
:::

The derivative pattern is f^{(k)}(a)=(−1)^{k−1}(k−1)!/(1+a)^k for k≥1 and a>−1. Therefore T_n(x)=ln(1+a)+Σ_{k=1}^n(−1)^{k−1}(x−a)^k/[k(1+a)^k]. A whole-segment bound uses its smallest1+t value, giving remainder≤|x−a|^{n+1}/[(n+1)(1+min(a,x))^{n+1}]. This bound can be very conservative when the segment nears−1, but it remains valid. A different centre changes both coefficients and distance to evaluation; increasing order is not by itself a domain repair.

::: figure #fig-16-2
Constant, tangent and quadratic logarithm models share a centre but differ away from it. The domain boundary remains present for every order.
:::

::: widget name=taylor
Choose a logarithm expansion centre, order and evaluation point. Compare the true value, polynomial, actual numerical error and a segment-based Lagrange bound, including a domain failure.
:::

For exp(x), derivatives are all exp(x), so on a bounded segment Taylor's remainder is at most exp(max(a,x))|x−a|^{n+1}/(n+1)!. For any fixed finite displacement that bound tends to zero as n→∞, since successive factorial-denominator terms eventually shrink by a ratio below one. This justifies equality with its Taylor series at any real x. Logarithm expansions have a restricted convergence neighbourhood; the finite bound above can justify equality when |x−a|/(1+min(a,x))<1, a sufficient region that need not be maximal. This lesson uses finite polynomials and valid bounds rather than claiming an unproved full radius result.

Taylor error and arithmetic error are separate. A theorem bounds the real polynomial's truncation error; a computed polynomial may have rounded coefficients and operations. For high order, cancellation or large powers may harm evaluation. Horner evaluation can reduce operations, but it does not prove that a chosen order is useful over an arbitrarily large interval. Name the centre, order, domain, remainder hypothesis and arithmetic convention when reporting an approximation.

::: check
Can the remainder derivative always be evaluated at a instead of ξ? Is a valid but large upper bound proof of a large actual error? Does an arbitrary smooth function equal its infinite Taylor series?
:::
::: answer
No: bound the derivative throughout the segment. A conservative bound can exceed a tolerance while actual error is small. Smoothness alone does not ensure infinite-series equality; the remainder must be shown to vanish.
:::

## Finite differences kinks and numerical evidence {#s6}

The forward difference [f(a+h)−f(a)]/h and central difference [f(a+h)−f(a−h)]/(2h) use nonzero finite h. They are estimators, with no automatic identity to a derivative. If |f″|≤M₂ over the forward segment, order-one Taylor gives forward truncation error≤M₂|h|/2. If |f‴|≤M₃ over the symmetric segment, expand each side to second order; the second-order terms cancel and the two cubic remainders give central error≤M₃h²/6. Thus the familiar first-order versus second-order rates have explicit smoothness and interval requirements.

Suppose each returned function value has absolute arithmetic error at most E. The central numerator then has error at most2E, giving derivative-estimate error at most E/|h|; forward differences similarly contribute2E/|h| when both values are rounded independently. An illustrative central total bound is M₃h²/6+E/|h|, plus any errors in input construction and division. Smaller h reduces truncation but amplifies the effect of output error. Balancing these two terms suggests a cube-root step scale, whereas the analogous forward balance suggests a square-root scale. These are model-dependent choices, not universal constants for every function and implementation.

::: worked title="A tiny step can erase the intended perturbation"
In binary64 arithmetic at a=1, the positive increment h=10⁻¹⁶ can round so a+h equals a. For f(x)=x² the computed forward numerator is then zero and the estimate zero, while the analytic derivative is two. The actual stored positive step is zero. This is input resolution failure, not proof that the real quotient limit changed. Lab3 prints both nominal and stored steps and uses a moderate central step for comparison.
:::

::: figure #fig-16-3
Truncation falls with step size while arithmetic amplification grows; the useful region lies between overly large and unresolved steps.
:::

Adding a huge constant can also make numerically evaluated output changes unresolved. Real f and f+C have the same derivative, but binary64 subtraction of nearby large outputs can lose the informative change. Lab1 adds10¹⁶ to exp(x²) and obtains zero for an otherwise useful central step. Do not interpret finite-difference disagreement as an automatic proof the analytic derivative is wrong. Inspect scaling, actual inputs, smoothness, value evaluation and several step sizes. Conversely, agreement at one point and step does not prove a formula for all inputs.

At nondifferentiable points the smooth central-error argument is unavailable. For |x| at zero, left/right slopes−1 and one average to a stable central zero. For ReLU(x)=max(0,x), left/right slopes zero and one average to.5. Neither average is a two-sided derivative. A programming library may adopt a chosen value for backward propagation at the kink. That is a documented convention, sometimes related to a later subgradient concept; it does not make the classical derivative exist. Compare one-sided quotients and the function definition before attaching a derivative interpretation to an automatic result.

::: figure #fig-16-4
The central estimates for absolute value and ReLU average different one-sided slopes at zero. A stable estimate does not remove a kink.
:::

Scalar sensitivity, Taylor error and numerical derivative error answer different questions. Sensitivity asks how the mathematical output responds to an input perturbation. Taylor error asks how well a finite local polynomial approximates that mathematical output. Numerical derivative error asks how a computational estimator approximates a derivative that must first exist. A steep but smooth function can have high sensitivity and a reliable derivative estimate after appropriate scaling; a flat displayed trace can instead hide rounding or a missing branch.

When checking a scalar objective for later optimisation, first state its domain and locate kinks or excluded boundaries. Derive the analytic local model where valid. Choose a range of finite-difference steps scaled to representable inputs, inspect forward and central behaviour, and compare with a bound when available. Treat a stationary value as a candidate and use curvature or other argument to classify it. These checks provide concrete evidence while preserving the difference between a finite experiment and a universally valid mathematical proof.

::: check
What hypotheses justify central O(h²) error? Why can adding a constant change the computed estimate? Does a ReLU central estimate of.5 at zero establish a derivative?
:::
::: answer
A third-derivative bound on the whole symmetric segment justifies the stated truncation bound. Large offsets can erase output differences in finite precision. ReLU's unequal one-sided slopes defeat differentiability; the central value is their average.
:::

## Common misconceptions {#misconceptions}

| Claim | Repair |
|---|---|
| A derivative is one finite quotient. | It is a finite limit, equivalently a first-order local model. |
| Continuous functions are always differentiable. | Absolute value has a continuous kink. |
| Chain factors can be skipped for small changes. | Every dependency contributes even in a first-order model. |
| Zero derivative means minimum. | Maxima and stationary inflections also occur. |
| Taylor error uses only the derivative at the centre. | Lagrange bounds control the entire intervening segment. |
| More digits or smaller h always improve differences. | Rounding and unresolved inputs can dominate. |
| A stable kink estimate creates a derivative. | Check one-sided limits; a symmetric average is different. |

## Three reproducible labs {#labs}

### Lab1 · Analytic forward and central rates {#lab1}

{{LAB:lab1}}

Derive exp(x²)' before running. Compare errors across steps, identify where the central rate improves and where rounding takes over, then explain the offset experiment. The assertion checks one useful regime rather than claiming every smaller step improves accuracy.

### Lab2 · Moving a Taylor centre {#lab2}

{{LAB:lab2}}

Reconstruct the logarithm derivative bound using the smallest1+t on each centre-to-input segment. Compare actual errors and conservative bounds for both signs and two centres. State why the excluded x=−1 case cannot be repaired by raising polynomial order.

### Lab3 · Kinks and erased increments {#lab3}

{{LAB:lab3}}

Predict both one-sided slopes at zero for each function, then explain the stable averages. Inspect actual input change in the square example, and classify the final stationary examples with mathematical reasoning rather than a printed zero derivative alone.

## Fourteen exercises with full solutions {#exercises}

Exercises1–12 are required. Optional Exercises13–14 add35 minutes beyond the ten-hour core schedule.

::: exercise #e1 level=1 kind=calculation minutes=6
Derive the derivative of x² at a=3 from a quotient and give its exact linear-model remainder.
:::
::: solution
[(3+h)²−9]/h=6+h for h≠0, so derivative six. The local model is9+6h with remainder h²; r(h)/h=h→0. At h=.1 the remainder is.01, not zero.
:::

::: exercise #e2 level=1 kind=calculation minutes=6
Differentiate x² exp(3x) and ln(1+x²), giving real domains.
:::
::: solution
The product gives exp(3x)(2x+3x²); the chain gives2x/(1+x²). Both are defined and differentiable for all real x because the exponential has real domain and1+x² is strictly positive. The first includes both product paths and the factor three.
:::

::: exercise #e3 level=1 kind=calculation minutes=6
Find T₂ for exp(x) about zero, and bound its error at.1 using a derivative bound on[0,.1].
:::
::: solution
T₂=1+x+x²/2, value1.105 at.1. Third derivative exp(t)≤exp(.1), so error≤exp(.1)(.1)³/6≈.000184195. The true error is about.000170186 and lies below that bound. Using only exp(0)=1 would not be the stated whole-segment certificate.
:::

::: exercise #e4 level=1 kind=calculation minutes=6
Classify zero for x², −x², x³ and x⁴; state what their second derivatives establish.
:::
::: solution
Respectively strict minimum, strict maximum, neither, strict minimum. Second derivatives at zero are2,−2,0,0. The first two signs classify; the zeros are inconclusive. Direct signs of the function increments settle the last two.
:::

::: exercise #e5 level=2 kind=proof minutes=14
Prove the product rule from the quotient and identify where continuity is used.
:::
::: solution
Add and subtract f(a+h)g(a). The quotient becomes f(a+h)[g(a+h)−g(a)]/h+g(a)[f(a+h)−f(a)]/h. Differentiability implies f(a+h)→f(a); the other quotients tend to g′(a),f′(a). Product/sum limit laws therefore give f(a)g′(a)+g(a)f′(a). Without that continuity step the varying first factor has not been controlled.
:::

::: exercise #e6 level=2 kind=proof minutes=14
Use local models to prove the chain rule even when the inner increment vanishes for some nonzero h.
:::
::: solution
Write Δg=g′(a)h+o(h) and outer increment f′(g(a))Δg+Δgη(Δg), with η(u)→0 andη(0)=0. Dividing by h leaves main term f′(g(a))Δg/h and remainder(Δg/h)η(Δg). The inner quotient is bounded and tends to g′(a), while η(Δg) tends to zero. Thus derivative is f′(g(a))g′(a). No division by Δg is required, so zero increments are covered.
:::

::: exercise #e7 level=2 kind=proof minutes=14
Derive the central difference error bound M₃h²/6 from two Taylor remainders, stating conditions.
:::
::: solution
Assume f is C³ on an open interval containing[a−|h|,a+|h|], with |f‴|≤M₃ there. Each order-two expansion has remainder magnitude≤M₃|h|³/6. Subtracting expansions cancels the constant and quadratic terms, leaving2hf′(a) plus a remainder of magnitude≤M₃|h|³/3. Divide by2|h| for the bound. This is exact-real truncation; arithmetic errors add separately.
:::

::: exercise #e8 level=2 kind=application minutes=10
For f(x)=ln(1+x), bound the order-two approximation error at−.2 about zero. Calculate the approximation and compare with the actual value.
:::
::: solution
T₂(−.2)=−.2−.04/2=−.22. On[−.2,0], |f‴|≤2/.8³=3.90625; bound3.90625(.2)³/6=.005208333. Actual ln(.8)≈−.223143551 gives error.003143551. The positive-side derivative bound two is unavailable on this negative segment.
:::

::: exercise #e9 level=2 kind=application minutes=10
On[−2,2], find all global extrema of f(x)=x³−3x and distinguish stationary candidates from endpoints.
:::
::: solution
f′=3x²−3 vanishes at−1,1. Values at−2,−1,1,2 are−2,2,−2,2. Thus global minima−2 occur at−2 and1; maxima2 at−1 and2. Curvature f″=6x classifies−1 as local maximum and1 as local minimum. Endpoints are also global candidates despite not being interior stationary points.
:::

::: exercise #e10 level=2 kind=application minutes=10
For f(x)=sqrt(x) at a=4, calculate absolute first-order sensitivity and the relative sensitivity factor. Explain the boundary at zero.
:::
::: solution
f′(4)=1/4, so a small Δx produces approximately Δx/4 output change. Relative factor |4(.25)/2|=.5. At zero the relative expression is undefined and the right quotient1/sqrt(h) is unbounded, so there is no finite boundary derivative. Use a separately qualified absolute/domain analysis there.
:::

::: exercise #e11 level=2 kind=diagnosis minutes=10
A central difference gives zero for |x| and.5 for ReLU at zero at every tested step. A program declares both differentiable. Repair its reasoning.
:::
::: solution
The one-sided slopes are−1 and1 for absolute value, zero and1 for ReLU. They disagree, so neither classical two-sided derivative exists. Central estimates average these slopes and can stay constant without representing a derivative. A chosen backward value at a kink must be reported as a convention; smooth Taylor difference bounds cannot be applied there.
:::

::: exercise #e12 level=2 kind=diagnosis minutes=10
A square derivative estimate at one uses h=10⁻¹⁶, obtains zero, and concludes the analytic derivative two is wrong. Explain a diagnostic and repair.
:::
::: solution
Inspect the actual stored input increment: binary64 can round1+h to one, giving zero numerator. This is unresolved perturbation, not a changed real derivative. Use several representable steps and appropriate scaling; a moderate central step recovers about two for this quadratic. Separate truncation from input/output arithmetic error, and do not infer a universal identity from one numerical sample.
:::

::: exercise #e13 level=3 kind=extension minutes=15
Minimise the illustrative bound B(h)=Ah²+E/h for positive h,A,E. Explain its assumptions and derive the recommended scale.
:::
::: solution
B′(h)=2Ah−E/h²=0 gives h=(E/(2A))^{1/3}. B″=2A+2E/h³>0, and B tends to infinity at both ends, so this is the unique global minimiser. The model assumes a valid smooth central truncation coefficient and uniform absolute value-error allowance, and neglects other errors; it is not a universal step for kinks or unresolved inputs. With A=M₃/6 the scale is(3E/M₃)^{1/3} when M₃>0.
:::

::: exercise #e14 level=3 kind=extension minutes=20
Prove a differentiable function with zero derivative on an interval is constant. Give a disconnected-domain counterexample to dropping “interval.”
:::
::: solution
For any two inputs a<b in the interval, differentiability implies continuity on their closed segment and the mean value theorem gives f(b)−f(a)=f′(c)(b−a)=0. Thus all values agree. On R excluding zero, set f(x)=0 for x<0 and1 for x>0. It has zero derivative at every domain point but is not constant across components; the missing point blocks the theorem on crossing segments.
:::

## Ten-question self-check {#quiz}

```quiz
? What does differentiability at a require?
- [x] A finite two-sided quotient limit on an open neighbourhood
- [ ] One small finite-difference value
- [ ] Only continuity
> Endpoint derivatives need explicit one-sided qualification. A finite sample and continuity alone are insufficient.

? Which remainder expresses a first-order local model?
- [ ] Any remainder tending to zero
- [x] A remainder whose ratio to h tends to zero
- [ ] A remainder exactly equal to the function
> o(h) is relative to input step. An unscaled small error can still be too large for a first-order model.

? What is d exp(x²)/dx?
- [ ] exp(x²)
- [ ] 2x
- [x] 2x exp(x²)
> The chain rule multiplies the outer rate by the inner rate.

? What does a nonzero derivative hypothesis permit for a local inverse?
- [x] A finite reciprocal secant limit under inverse/domain assumptions
- [ ] Arbitrary inversion without injectivity
- [ ] Ignoring the inverse domain
> The inverse must be locally defined and continuous. Cube root at zero shows why the nonzero slope matters.

? Which condition alone identifies a minimum?
- [ ] f′(a)=0
- [x] None of the listed stationary conditions alone
- [ ] f″(a)=0
> Stationarity can give a maximum or neither; zero second derivative is inconclusive. Positive second derivative with the stated smoothness and stationarity gives a sufficient local test.

? The mean value theorem requires what?
- [ ] Only derivative existence at one endpoint
- [ ] Merely two displayed function values
- [x] Closed-interval continuity and open-interval differentiability
> Gaps, jumps and kinks can invalidate the required argument.

? A Taylor remainder bound needs which derivative control?
- [x] The relevant derivative bounded over the centre-to-input segment
- [ ] Its value at the centre alone in every case
- [ ] No domain qualification
> The Lagrange derivative is evaluated at an unknown intermediate point, so a segment bound certifies the error.

? Does making a finite-difference step smaller always improve accuracy?
- [ ] Yes, without exception
- [x] No; rounding amplification and unresolved inputs can dominate
- [ ] Only if a printed estimate is zero
> Truncation decreases in a smooth regime, but arithmetic error can increase as the divisor shrinks.

? ReLU has central estimate.5 at zero. What is this?
- [ ] A proof of a classical derivative
- [ ] A proof of a local maximum
- [x] A symmetric average of unequal one-sided slopes
> The classical derivative does not exist there; any backward value is a separately stated convention.
```

<div class="free-response" data-free-response data-key="math-series:m16:q10">
<label for="q10-response">10. Derive both derivatives of exp(x²), then specify an order-two Taylor approximation to ln(1+x) at−.2 with a justified error bound. State one reason a numerical derivative check can mislead.</label>
<textarea id="q10-response" aria-describedby="q10-review" rows="6" placeholder="Include chain/product paths, the log domain, the segment derivative bound and a numerical failure."></textarea>
<label class="self-check" id="q10-review"><input type="checkbox"> I included all derivative paths, a whole-segment remainder hypothesis and an evidence limitation.</label>
</div>

::: answer
First derivative2x exp(x²), second(2+4x²)exp(x²). On x>−1, T₂ about zero is x−x²/2; at−.2 it is−.22. The segment[−.2,0] has |f‴|≤2/.8³, giving error≤.005208333. Kink averages, tiny unresolved steps or cancellation after a huge output offset can mislead finite differences. A numerical check illustrates a formula at tested inputs; it does not replace domain hypotheses or a derivative proof.
:::

## Reading with a purpose {#reading}

Read differentiation, mean value and Taylor materials in the primary [MIT OpenCourseWare calculus course](https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/). Review representation examples in the official [Python3.11 floating-point tutorial](https://docs.python.org/3.11/tutorial/floatingpoint.html). The rule, theorem and remainder arguments above are original lesson derivations.

| When | Selection and question |
|---|---|
| Session1 · 20 minutes | Derivative definitions: which quotient limit and domain qualification are required? |
| Session4 · 20 minutes | Taylor and floating point: what controls truncation, and what can erase a computed change? |

## Retrieval exit task and next step {#summary}

Derive the quotient/local-model equivalence, a product and chain rule, the mean value theorem from Rolle, and a finite Taylor remainder bound. Classify stationary and boundary examples, then explain the finite-difference error trade-off and a kink failure.

**Exit task:** For ln(1+x) at zero, slope one and curvature minus one give T₂=x−x²/2. Bound its error on a specified interval inside x>−1, explain how the bound changes on the negative side, and distinguish the resulting finite approximation from an unproved global Taylor-series claim.

**Ready to move on:** you can derive scalar local models and state their validity. Integration next connects rates to accumulated quantities; later multivariable calculus extends these dependency rules to gradients and computation graphs. See the [course overview](index.html).

## Notation and bilingual terminology {#terms}

| Term or notation | Meaning | 中文 |
|---|---|---|
| f′ / difference quotient | Finite limiting slope / finite-step rate | 导数、差商 |
| o(h) | Remainder divided by h tends to zero | 小 o 余项 |
| Tangent / sensitivity | First-order local line / response to perturbation | 切线、敏感性 |
| Product / chain / inverse rule | Dependency rules with domain hypotheses | 积、链式、反函数法则 |
| Stationary / local / global | Zero interior derivative / nearby / whole-domain comparison | 驻点、局部、全局 |
| Rolle / mean value | Existence of an intermediate slope | 罗尔、中值定理 |
| T_n / Lagrange remainder | Finite derivative polynomial / certified intermediate-derivative error | 泰勒多项式、拉格朗日余项 |
| Forward / central difference | One-sided / symmetric finite-step estimator | 前向、中心差分 |
| Kink / rounding | Nondifferentiable joining point / finite representation error | 折点、舍入 |
