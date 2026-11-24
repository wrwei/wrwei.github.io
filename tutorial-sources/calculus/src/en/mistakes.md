---
title: Common mistakes
lead: Find the slip, see a counterexample, and follow the rule back to the module that explains it.
---

The entries follow the order of the series. Each one gives an example and the rule to use. For a definition, see the [glossary](glossary_EN.html). For a formula and its conditions, see the [formula sheet](formulas_EN.html).

[Functions, limits and continuity](#functions) · [Derivatives and their applications](#derivatives) · [Integration and differential equations](#integrals) · [Sequences and series](#series) · [Curves, vectors and functions of several variables](#several) · [Multiple integrals and vector calculus](#multiple)

## Functions, limits and continuity {#functions}

### Cancelling away a domain restriction {#cancelling-away-a-domain-restriction}

The formula $(x^2-1)/(x-1)$ simplifies to $x+1$ for $x\ne1$. At $x=1$ the original expression has denominator $0$, even though the simplified expression gives $2$.

Find the domain before cancelling and carry its restrictions into the simplified formula. [Section 1.3](module_01_EN.html#domains)

```check
same(cancel((x**2-1)/(x-1)),x+1); same((x-1).subs(x,1),0); same((x+1).subs(x,1),2)
```

### Taking a square root of a negative number {#taking-a-square-root-of-a-negative-number}

The formula $\sqrt{x-2}$ gives no real value at $x=1$ because $1-2=-1$. It does give a real value at $x=2$, namely $0$.

For a real square root, require the expression under the root to be non-negative. [Section 1.3](module_01_EN.html#domains)

```check
same(1-2,-1); holds(sqrt(1-2).is_real is False); same(sqrt(2-2),0)
```

### Feeding degrees into a radian formula {#feeding-degrees-into-a-radian-formula}

A right angle is $90^\circ$, or $\pi/2$ radians. The sine at a right angle is $1$, but a radian-mode calculator given $90$ returns about $0.894$.

Convert degrees to radians before using a calculus formula or a Python trigonometric function. [Section 1.4](module_01_EN.html#trig)

```check
same(90*pi/180,pi/2); same(sin(pi/2),1); rounds(sin(90),'0.894')
```

### Composing functions in the wrong order {#composing-functions-in-the-wrong-order}

For $f(x)=x+1$ and $g(x)=2x$, applying $g$ and then $f$ at $3$ gives $7$. Applying $f$ and then $g$ gives $8$.

In $(f\circ g)(x)$, apply $g$ first. Its output must lie in the domain of $f$. [Section 1.5](module_01_EN.html#new-from-old)

```check
same(2*3+1,7); same(2*(3+1),8)
```

### Taking the value at the point as the limit {#taking-the-value-at-the-point-as-the-limit}

Let $f(x)=x+1$ except that $f(2)=9$. As $x$ approaches $2$ through nearby inputs, the outputs approach $3$. The single value $9$ has no effect.

A limit concerns nearby inputs with $x\ne a$. Check the value at $a$ separately when testing continuity. [Section 2.1](module_02_EN.html#idea)

```check
same(Piecewise((9,Eq(x,2)),(x+1,True)).subs(x,2),9); limit_is(x+1,x,2,3)
```

### Using only one side of a limit {#using-only-one-side-of-a-limit}

The quotient $\abs{x}/x$ is $1$ for positive $x$ and $-1$ for negative $x$. Those two values disagree at the approach to $0$.

At an interior point the two-sided limit exists only when both one-sided limits exist and agree. [Section 2.2](module_02_EN.html#one-sided)

```check
limit_is(Abs(x)/x,x,0,1,dir='+'); limit_is(Abs(x)/x,x,0,-1,dir='-')
```

### Treating zero over zero as a limit value {#treating-zero-over-zero-as-a-limit-value}

At $x=0$, both $x^2/x$ and $x/x$ have the form $0/0$. For $x\ne0$ the first equals $x$ and the second equals $1$, so their limits differ.

The form $0/0$ calls for more work. Simplify on a punctured interval before using substitution. [Section 2.5](module_02_EN.html#zero-over-zero)

```check
limit_is(x**2/x,x,0,0); limit_is(x/x,x,0,1)
```

### Subtracting nearly equal floating-point numbers {#subtracting-nearly-equal-floating-point-numbers}

The expression $\sqrt{1+x}-1$ is positive at $x=10^{-18}$, yet ordinary Python floats give $0.0$ for it. Computing $x/(\sqrt{1+x}+1)$ gives about $5\times10^{-19}$.

Rationalise to avoid the subtraction, then check the rewritten expression at the scale you need. [Section 2.8](module_02_EN.html#cancellation)

```check
import math; same(math.sqrt(1+1e-18)-1,0); near(1e-18/(math.sqrt(1+1e-18)+1),5e-19,1e-32); same((sqrt(1+x)-1)*(sqrt(1+x)+1),x)
```

### Checking the limit but forgetting the value {#checking-the-limit-but-forgetting-the-value}

If $f(x)=x$ for $x\ne0$ and $f(0)=1$, the limit at $0$ is $0$ but the value there is $1$.

At an interior point, continuity requires a defined value, an existing limit and equality of the two. [Section 3.1](module_03_EN.html#continuity)

```check
limit_is(x,x,0,0); same(Piecewise((1,Eq(x,0)),(x,True)).subs(x,0),1)
```

### Using a sign change without continuity {#using-a-sign-change-without-continuity}

Let $f(x)=-1$ for $x<0$ and $f(x)=1$ for $x\ge0$. The signs at $-1$ and $1$ differ, but there is no zero.

Use the Intermediate Value Theorem only on an interval where the function is continuous. [Section 3.3](module_03_EN.html#ivt)

```check
step_m=Piecewise((-1,x<0),(1,True)); same([step_m.subs(x,p) for p in (-1,0,1)],[-1,1,1]); same(step_m**2,1)
```

### Assuming an open interval has a maximum {#assuming-an-open-interval-has-a-maximum}

The function $f(x)=x$ on $(0,1)$ has values below $1$. Given any $x$ there, $(x+1)/2$ lies in the interval and gives a larger value.

The Extreme Value Theorem guarantees a maximum and minimum for a continuous function on a closed bounded interval. [Section 3.5](module_03_EN.html#evt)

```check
lo_m=Rational(3,4); hi_m=(lo_m+1)/2; same(hi_m,Rational(7,8)); holds(0<lo_m<hi_m<1)
```

### Confusing the two signs of infinity {#confusing-the-two-signs-of-infinity}

In $1/x$, the denominator tends to $0$ from both sides, but the values tend to $-\infty$ on the left and $+\infty$ on the right.

When a quotient has nonzero numerator limit and vanishing denominator, track the signs on each side. [Section 3.6](module_03_EN.html#infinite-limits)

```check
limit_is(1/x,x,0,-oo,dir='-'); limit_is(1/x,x,0,oo,dir='+')
```

## Derivatives and their applications {#derivatives}

### Setting the step to zero before simplifying {#setting-the-step-to-zero-before-simplifying}

For $f(x)=x^2$ at $a=2$, the quotient has the form $0/0$ at $h=0$. For $h\ne0$ it equals $4+h$ and tends to $4$.

Compute the limit of the difference quotient through nonzero steps. [Section 4.2](module_04_EN.html#derivative)

```check
same(cancel(((2+h)**2-4)/h),4+h); limit_is(4+h,h,0,4)
```

### Assuming a continuous graph has a tangent slope {#assuming-a-continuous-graph-has-a-tangent-slope}

The function $\abs{x}$ is continuous at $0$. Its right and left difference quotients at $0$ are $1$ and $-1$.

Differentiability implies continuity. To decide differentiability at a corner, compare the two one-sided slopes. [Section 4.4](module_04_EN.html#differentiability)

```check
limit_is(Abs(h),h,0,0); limit_is(Abs(h)/h,h,0,1,dir='+'); limit_is(Abs(h)/h,h,0,-1,dir='-')
```

### Giving a constant a nonzero derivative {#giving-a-constant-a-nonzero-derivative}

The graph of $y=7$ is horizontal. Differentiating $3x+7$ therefore gives $3$.

A constant contributes zero to the derivative. A constant factor multiplying a function stays as a factor. [Section 4.5](module_04_EN.html#rules)

```check
same(diff(7,x),0); same(diff(3*x+7,x),3)
```

### Choosing the smallest possible finite difference {#choosing-the-smallest-possible-finite-difference}

With $a=1$ and $h=10^{-18}$, ordinary Python floats satisfy $1+h=1$. The forward difference for $x^2$ then gives $0$ even though the derivative is $2$.

Choose a step that balances truncation and rounding error, and compare estimates at several step sizes. [Section 4.7](module_04_EN.html#numerical)

```check
same(1.0+1e-18,1); same(((1.0+1e-18)**2-1)/1e-18,0); same(diff(x**2,x).subs(x,1),2)
```

### Multiplying derivatives in the product rule {#multiplying-derivatives-in-the-product-rule}

For $f(x)=g(x)=x$, the product of the derivatives is $1$. The derivative of the product at $x=2$ is $4$.

Differentiate each factor in turn, leaving the other factor alone, and add the two terms. [Section 5.2](module_05_EN.html#product)

```check
same(diff(x,x)*diff(x,x),1); same(diff(x*x,x).subs(x,2),4); same(diff(x*x,x),diff(x,x)*x+x*diff(x,x))
```

### Reversing the numerator of the quotient rule {#reversing-the-numerator-of-the-quotient-rule}

For $1/x$, the derivative at $x=2$ is $-1/4$. Reversing the subtraction gives $+1/4$.

For differentiable $f$ and $g$ with $g(x)\ne0$, use $(f'g-fg')/g^2$. [Section 5.3](module_05_EN.html#quotient)

```check
same(diff(1/x,x).subs(x,2),-Rational(1,4)); same((1/x**2).subs(x,2),Rational(1,4))
```

### Omitting the inner derivative {#omitting-the-inner-derivative}

For $\sin(3x)$, the derivative at $0$ is $3$. Differentiating only the outside gives $\cos0=1$.

Keep the inner expression inside the outer derivative, then multiply by the derivative of the inner expression. [Section 5.5](module_05_EN.html#chain)

```check
same(diff(sin(3*x),x),3*cos(3*x)); same(diff(sin(3*x),x).subs(x,0),3); same(cos(0),1)
```

### Following only one use of an input {#following-only-one-use-of-an-input}

Take $u=x^2$ and $y=u+x$. At $x=2$ the path through $u$ contributes $4$ and the direct path contributes $1$, giving a derivative of $5$.

When a computation depends on the same input along several paths, add all the path contributions. [Section 5.8](module_05_EN.html#autodiff)

```check
same(diff(x**2,x).subs(x,2),4); same(diff(x,x),1); same(diff(x**2+x,x).subs(x,2),5)
```

### Differentiating every exponential as itself {#differentiating-every-exponential-as-itself}

The derivative of $2^x$ at $0$ is $\ln2$, about $0.693$. The function value there is $1$.

For $a>0$, $\dfrac{d}{dx}a^x=(\ln a)a^x$. The factor is $1$ when $a=e$. [Section 6.1](module_06_EN.html#number-e)

```check
same(diff(2**x,x),log(2)*2**x); same((2**x).subs(x,0),1); rounds(log(2),'0.693'); same(log(E),1)
```

### Distributing the logarithm over a sum {#distributing-the-logarithm-over-a-sum}

At $x=y=1$, $\ln(x+y)=\ln2$, while $\ln x+\ln y=0$.

The addition law is $\ln(xy)=\ln x+\ln y$ for positive $x$ and $y$. It applies to a product. [Section 6.3](module_06_EN.html#logarithms)

```check
same(log(1+1),log(2)); same(log(1)+log(1),0); holds(log(2)>0)
```

### Forgetting the derivative of y {#forgetting-the-derivative-of-y}

On $x^2+y^2=25$, the slope at $(3,4)$ is $-3/4$. Differentiating $y^2$ as $2y$ treats $y$ as the independent variable.

When $y$ depends on $x$, differentiate $y^2$ as $2y\,dy/dx$, then solve for the slope where the coefficient permits division. [Section 6.4](module_06_EN.html#implicit)

```check
same(3**2+4**2,25); same(diff(sqrt(25-x**2),x).subs(x,3),-Rational(3,4))
```

### Reading inverse sine as a reciprocal {#reading-inverse-sine-as-a-reciprocal}

The value $\arcsin(1/2)$ is $\pi/6$. The reciprocal of $\sin(1/2)$ is about $2.086$.

Use inverse sine to find an angle in $[-\pi/2,\pi/2]$. Use $1/\sin x$ or $\csc x$ for a reciprocal where the sine is nonzero. [Section 6.5](module_06_EN.html#inverse-trig)

```check
same(asin(Rational(1,2)),pi/6); rounds(1/sin(Rational(1,2)),'2.086')
```

### Plugging in a changing length before differentiating {#plugging-in-a-changing-length-before-differentiating}

For a ladder of length $5$, $x^2+y^2=25$. At $(3,4)$ with $dx/dt=2$, the differentiated equation gives $dy/dt=-3/2$. Plugging in both lengths first gives an identity between constants and loses the rates.

Differentiate the relation in time while the changing quantities are still functions. Use the values at the instant afterwards. [Section 7.1](module_07_EN.html#related-rates)

```check
same(3**2+4**2,25); same(solve(2*3*2+2*4*v,v),[-Rational(3,2)])
```

### Reading a tangent-line estimate as exact {#reading-a-tangent-line-estimate-as-exact}

The linearisation of $x^2$ at $2$ predicts $8$ at $x=3$. The exact value is $9$.

Use $f(a)+f'(a)(x-a)$ for a differentiable function near $a$. Check an error bound when accuracy matters. [Section 7.2](module_07_EN.html#linear-approximation)

```check
same(2**2+diff(x**2,x).subs(x,2)*(3-2),8); same(3**2,9)
```

### Dividing by a zero Newton slope {#dividing-by-a-zero-newton-slope}

Starting at $x_0=0$ for $f(x)=x^2-2$ would require dividing $-2$ by $f'(0)=0$. That step is undefined.

Check that the slope is nonzero at each iterate. Even with a defined step, convergence needs separate justification. [Section 7.4](module_07_EN.html#newton)

```check
same((x**2-2).subs(x,0),-2); same(diff(x**2-2,x).subs(x,0),0)
```

### Applying L’Hôpital’s rule to a determinate quotient {#applying-lho-pitals-rule-to-a-determinate-quotient}

As $x$ tends to $2$, $(x^2+1)/x$ tends to $5/2$. The quotient of the derivatives is $2x$, which tends to $4$.

Use the derivative quotient only for an indeterminate form covered by the rule, with its hypotheses checked. A nonzero finite denominator limit allows direct substitution. [Section 7.5](module_07_EN.html#lhopital)

```check
limit_is((x**2+1)/x,x,2,Rational(5,2)); limit_is(diff(x**2+1,x)/diff(x,x),x,2,4)
```

### Calling all stationary points extrema {#calling-all-stationary-points-extrema}

For $f(x)=x^3$, $f'(0)=0$. The values at $-1$ and $1$ are on opposite sides of $f(0)=0$, and every neighbourhood of $0$ has the same pattern.

A stationary point is a candidate. Compare nearby values or test the sign of the derivative on both sides. [Section 8.1](module_08_EN.html#extrema)

```check
same(diff(x**3,x).subs(x,0),0); same([(-1)**3,0,1**3],[-1,0,1]); holds(Symbol('w',positive=True)**3>0)
```

### Using the Mean Value Theorem across a corner {#using-the-mean-value-theorem-across-a-corner}

On $[-1,1]$, $\abs{x}$ has equal endpoint values. Its derivative is $-1$ to the left of $0$ and $1$ to the right, so there is no interior point with derivative $0$.

The Mean Value Theorem requires continuity on the closed interval and differentiability at every interior point. [Section 8.2](module_08_EN.html#mvt)

```check
same(Abs(-1),Abs(1)); same([diff(Abs(Symbol('w',real=True)),Symbol('w',real=True)).subs(Symbol('w',real=True),p) for p in (-Rational(1,2),Rational(1,2))],[-1,1])
```

### Calling every zero of the second derivative an inflection {#calling-every-zero-of-the-second-derivative-an-inflection}

For $f(x)=x^4$, $f''(0)=0$. On both sides of $0$, $f''(x)=12x^2$ is positive, so the concavity does not change.

Use zeros of the second derivative as candidates and check for a change of concavity. [Section 8.4](module_08_EN.html#concavity)

```check
same(diff(x**4,x,2),12*x**2); same(diff(x**4,x,2).subs(x,0),0); holds(12*Symbol('w',nonzero=True)**2>0)
```

### Leaving endpoints out of an absolute-extrema search {#leaving-endpoints-out-of-an-absolute-extrema-search}

On $[0,3]$, $x^2$ has values $0$ and $9$ at the endpoints and no interior stationary points. Both extreme values occur at endpoints.

For a continuous function on a closed interval, compare endpoint values with values at all interior critical points. [Section 8.6](module_08_EN.html#optimisation)

```check
same([0**2,3**2],[0,9]); same(solve(diff(x**2,x),x),[0])
```

## Integration and differential equations {#integrals}

### Leaving out the rectangle width {#leaving-out-the-rectangle-width}

Two left rectangles for $f(x)=x$ on $[0,1]$ have heights $0$ and $1/2$. Their sum of areas is $1/4$, because both have width $1/2$.

Multiply every sampled height by its subinterval width before adding. [Section 9.3](module_09_EN.html#riemann-sums)

```check
same((0+Rational(1,2))*Rational(1,2),Rational(1,4)); same((1-0)/Integer(2),Rational(1,2))
```

### Reversing the sign of an approximation error {#reversing-the-sign-of-an-approximation-error}

For $x^2$ on $[0,1]$ with one left rectangle, the estimate is $0$ and the integral is $1/3$. The error is $+1/3$.

Use exact value minus approximation. Put absolute value signs around that difference if you want its magnitude. [Section 9.3](module_09_EN.html#riemann-sums)

```check
left_m=0**2*(1-0); exact_m=integrate(x**2,(x,0,1)); same([left_m,exact_m,exact_m-left_m],[0,Rational(1,3),Rational(1,3)])
```

### Reading a signed integral as total area {#reading-a-signed-integral-as-total-area}

On $[-1,1]$, the integral of $x$ is $0$. Each triangle has area $1/2$, so the total area is $1$.

Use $\int_a^b\abs{f(x)}\,dx$ for the total area between the graph and the axis. [Section 9.4](module_09_EN.html#signed-area)

```check
same(integrate(x,(x,-1,1)),0); same(integrate(x,(x,0,1)),Rational(1,2)); same(integrate(Abs(x),(x,-1,1)),1)
```

### Multiplying two integrals to integrate a product {#multiplying-two-integrals-to-integrate-a-product}

The integral $\int_0^1 x^2\,dx$ is $1/3$. Multiplying the two integrals of $x$ gives $(1/2)^2=1/4$.

Linearity applies to sums and constant multiples. Integrate the product as one function. [Section 9.5](module_09_EN.html#properties)

```check
same(integrate(x*x,(x,0,1)),Rational(1,3)); same(integrate(x,(x,0,1))**2,Rational(1,4))
```

### Dropping the constant of integration {#dropping-the-constant-of-integration}

Both $x^2$ and $x^2+3$ have derivative $2x$. If the antiderivative must have value $3$ at $0$, only the second does.

Write the family of antiderivatives as $F+C$ on an interval. An initial value can determine $C$. [Section 10.1](module_10_EN.html#antiderivatives)

```check
antideriv(x**2,2*x,x); antideriv(x**2+3,2*x,x); same([(x**2).subs(x,0),(x**2+3).subs(x,0)],[0,3])
```

### Forgetting the chain rule for a variable upper limit {#forgetting-the-chain-rule-for-a-variable-upper-limit}

For $A(x)=\int_0^{x^2}t\,dt$, the integral is $x^4/2$. Its derivative at $x=2$ is $16$, while substituting the upper limit into the integrand alone gives $4$.

With a fixed lower limit and continuous integrand, evaluate the integrand at the upper limit and multiply by the derivative of that limit. [Section 10.4](module_10_EN.html#ftc1)

```check
A_m=integrate(t,(t,0,x**2)); same(A_m,x**4/2); same(diff(A_m,x).subs(x,2),16); same((x**2).subs(x,2),4)
```

### Forgetting the lower endpoint in the Fundamental Theorem {#forgetting-the-lower-endpoint-in-the-fundamental-theorem}

For $\int_1^2 2x\,dx$, the antiderivative $x^2$ gives $4$ at the upper end. The integral is $4-1=3$.

Evaluate the same antiderivative at both endpoints and subtract lower from upper. [Section 10.5](module_10_EN.html#ftc2)

```check
same(integrate(2*x,(x,1,2)),3); same([2**2,1**2],[4,1])
```

### Keeping the old bounds after a substitution {#keeping-the-old-bounds-after-a-substitution}

In $\int_0^1 2x(x^2+1)\,dx$, let $u=x^2+1$. The new bounds $1$ and $2$ give $3/2$. The old bounds applied to $u$ give $1/2$.

Use bounds expressed in the integration variable. If you keep the original bounds, return to the original variable before evaluating. [Section 10.7](module_10_EN.html#substitution)

```check
same(integrate(2*x*(x**2+1),(x,0,1)),Rational(3,2)); same([(x**2+1).subs(x,p) for p in (0,1)],[1,2]); same(integrate(u,(u,0,1)),Rational(1,2))
```

### Losing the minus sign in integration by parts {#losing-the-minus-sign-in-integration-by-parts}

For $\int xe^x\,dx$, the antiderivative is $xe^x-e^x+C$. Using a plus gives derivative $(x+2)e^x$.

Use $\int u\,dv=uv-\int v\,du$, and check the resulting antiderivative by differentiating. [Section 11.1](module_11_EN.html#parts)

```check
antideriv(x*exp(x)-exp(x),x*exp(x),x); same(diff(x*exp(x)+exp(x),x),(x+2)*exp(x))
```

### Dropping an absolute value in trigonometric substitution {#dropping-an-absolute-value-in-trigonometric-substitution}

If $x=2\sec\theta$ at $\theta=3\pi/4$, the square root $\sqrt{x^2-4}$ is $2$, while $2\tan\theta=-2$.

Write $\sqrt{4\tan^2\theta}=2\abs{\tan\theta}$ and use the sign on the chosen angle interval. [Section 11.3](module_11_EN.html#trig-substitution)

```check
ph_m=3*pi/4; same(sqrt((2*sec(ph_m))**2-4),2); same(2*tan(ph_m),-2)
```

### Skipping division for an improper rational fraction {#skipping-division-for-an-improper-rational-fraction}

The quotient $(x^2+1)/x$ contains a polynomial part $x$. Using $1/x$ alone gives $1/2$ at $2$, whereas the full expression gives $5/2$.

If the numerator degree is at least the denominator degree, divide first. Decompose the proper remainder. [Section 11.4](module_11_EN.html#partial-fractions)

```check
same(div(x**2+1,x,x),(x,1)); same(((x**2+1)/x).subs(x,2),Rational(5,2)); same((1/x).subs(x,2),Rational(1,2))
```

### Using an odd number of Simpson subintervals {#using-an-odd-number-of-simpson-subintervals}

With five subintervals there are six sample points, enough for two complete pairs of subintervals with one subinterval left over.

Use an even number of equal-width subintervals for composite Simpson's rule. [Section 11.7](module_11_EN.html#simpson)

```check
same(divmod(5,2),(2,1)); same(5+1,6)
```

### Ignoring a crossing when finding area between curves {#ignoring-a-crossing-when-finding-area-between-curves}

On $[0,1]$, $y=2x-1$ crosses $y=0$ at $x=1/2$. The integral of $2x-1$ over the whole interval is $0$, but the triangles together have area $1/2$.

For continuous curves, split at the crossings and integrate the upper function minus the lower function on each piece. [Section 12.2](module_12_EN.html#area)

```check
same(solve(2*x-1,x),[S.Half]); same(integrate(2*x-1,(x,0,1)),0); same(integrate(1-2*x,(x,0,S.Half))+integrate(2*x-1,(x,S.Half,1)),S.Half)
```

### Squaring the difference of the washer radii {#squaring-the-difference-of-the-washer-radii}

With outer radius $3$ and inner radius $1$, the annulus has area $8\pi$. Squaring the difference of the radii gives $4\pi$.

Compute the outer disc area and subtract the inner disc area before integrating the cross-sectional area. [Section 12.3](module_12_EN.html#volumes)

```check
same(pi*(3**2-1**2),8*pi); same(pi*(3-1)**2,4*pi)
```

### Approximating arc length with staircase steps {#approximating-arc-length-with-staircase-steps}

A staircase made of horizontal and vertical steps from $(0,0)$ to $(1,1)$ has length $2$ however small its steps are. The straight segment has length $\sqrt2$.

Approximate the curve by chords, then take the limit. For a continuously differentiable graph use $ds=\sqrt{1+(f'(x))^2}\,dx$ with increasing $x$. [Section 12.5](module_12_EN.html#arc-length)

```check
same(1+1,2); same(sqrt(1**2+1**2),sqrt(2)); same(integrate(sqrt(1+diff(x,x)**2),(x,0,1)),sqrt(2))
```

### Dividing by zero area in a centroid formula {#dividing-by-zero-area-in-a-centroid-formula}

If the upper and lower curves are both $y=x$ on $[0,1]$, their area difference and both first moments vanish. The centroid quotients have zero denominators.

Use the plate centroid formulas for positive area. For a density-weighted centre of mass, require positive total mass. [Section 12.7](module_12_EN.html#centre-of-mass)

```check
same(integrate(x-x,(x,0,1)),0); same(integrate(x*(x-x),(x,0,1)),0); same(integrate((x**2-x**2)/2,(x,0,1)),0)
```

### Cancelling across an improper singularity {#cancelling-across-an-improper-singularity}

For $1/x$ on $[-1,1]$, the integrals with equal gaps on either side of $0$ cancel. The separate one-sided integrals diverge.

Split at an interior singularity and take the two limits independently. An ordinary improper integral exists only if both are finite. [Section 12.8](module_12_EN.html#improper)

```check
p_m=Symbol('p_m',positive=True); r_m=integrate(1/x,(x,p_m,1)); l_m=integrate(1/x,(x,-1,-p_m)); same(l_m+r_m,0); limit_is(r_m,p_m,0,oo,dir='+'); limit_is(l_m,p_m,0,-oo,dir='+')
```

### Reusing the initial slope at every Euler step {#reusing-the-initial-slope-at-every-euler-step}

For $y'=y$ with $y(0)=1$ and step $1/2$, the first Euler value is $3/2$. The next slope is $3/2$, so the next value is $9/4$. Reusing slope $1$ would give $2$.

Evaluate the direction field at the current point before every Euler update. [Section 13.4](module_13_EN.html#euler)

```check
h_m=Rational(1,2); y1_m=1+h_m; same([y1_m,y1_m+h_m*y1_m,y1_m+h_m],[Rational(3,2),Rational(9,4),2])
```

### Losing an equilibrium by division {#losing-an-equilibrium-by-division}

Separating $y'=y(1-y)$ by dividing by $y(1-y)$ excludes the constant solutions $y=0$ and $y=1$. Both solve the original equation.

Check the zeros of the factor you divide by and include any constant solutions that satisfy the original equation. [Section 13.5](module_13_EN.html#separable)

```check
same([diff(p,t)-p*(1-p) for p in (0,1)],[0,0])
```

### Multiplying only one term by the integrating factor {#multiplying-only-one-term-by-the-integrating-factor}

For $y'+2y=3$, the factor is $e^{2t}$. If the right side stays $3$, the transformed equation gives the wrong solutions. For example, the constant solution $y=3/2$ gives transformed derivative $3e^{2t}$.

Multiply the whole equation by the integrating factor and recognise the product derivative on the left. [Section 13.7](module_13_EN.html#linear)

```check
mu_m=exp(2*t); same(diff(Rational(3,2),t)+2*Rational(3,2),3); same(diff(mu_m*Rational(3,2),t),3*mu_m)
```

### Using one solution twice at a repeated root {#using-one-solution-twice-at-a-repeated-root}

For $y''-2y'+y=0$, the characteristic root $1$ is repeated. Two copies of $e^t$ give only one independent constant. The function $te^t$ gives a second solution.

For a repeated root $r$ in a constant-coefficient second-order equation, use $e^{rt}$ and $te^{rt}$. [Section 13.8](module_13_EN.html#second-order)

```check
same(factor(r**2-2*r+1),(r-1)**2); same([diff(F,t,2)-2*diff(F,t)+F for F in (exp(t),t*exp(t))],[0,0]); same(wronskian([exp(t),t*exp(t)],t).subs(t,0),1)
```

## Sequences and series {#series}

### Treating a bounded sequence as convergent {#treating-a-bounded-sequence-as-convergent}

The terms of $(-1)^n$ stay between $-1$ and $1$, but even and odd indices give different values.

Boundedness gives convergence when the sequence is also monotone. Otherwise, check the behaviour of its terms. [Section 14.1](module_14_EN.html#sequences)

```check
same([(-1)**i for i in (2,3,4,5)],[1,-1,1,-1])
```

### Confusing the term limit with the series sum {#confusing-the-term-limit-with-the-series-sum}

For $\sum_{n=1}^\infty 2^{-n}$, the terms tend to $0$ but the partial sums tend to $1$.

Take the limit of the partial sums to find a series sum. [Section 14.3](module_14_EN.html#series)

```check
limit_is(2**(-x),x,oo,0); same(summation(2**(-n),(n,1,oo)),1)
```

### Using a zero term limit to prove convergence {#using-a-zero-term-limit-to-prove-convergence}

The terms $1/n$ tend to $0$, yet the harmonic series diverges. For example, the four terms with indices $5$ through $8$ add to at least $4/8=1/2$, and each successive doubled block adds at least another $1/2$.

Use the term test to rule out convergence when terms fail to tend to zero. Use another test to establish convergence. [Section 14.4](module_14_EN.html#harmonic)

```check
limit_is(1/x,x,oo,0); same(Rational(4,8),Rational(1,2)); holds(sum(Rational(1,j) for j in range(5,9))>=Rational(1,2))
```

### Pointing a comparison the wrong way {#pointing-a-comparison-the-wrong-way}

The harmonic terms $1/n$ exceed $1/n^2$ for $n>1$. The smaller series converges, while the larger one diverges.

For non-negative terms, a convergent upper series proves convergence below it. A divergent lower series proves divergence above it. [Section 14.6](module_14_EN.html#comparison)

```check
N_m=Symbol('N_m',integer=True,positive=True); holds(factor(1/(N_m+1)-1/(N_m+1)**2).is_positive); same(summation(1/n**2,(n,1,oo)),pi**2/6); holds(summation(1/n,(n,1,oo))==oo)
```

### Using alternating signs alone {#using-alternating-signs-alone}

The terms $(-1)^n$ alternate but their magnitudes stay at $1$. The partial sums through $1,2,3,4$ are $-1,0,-1,0$.

For the alternating series test, check that the term magnitudes eventually decrease to zero. [Section 14.7](module_14_EN.html#alternating)

```check
same([sum((-1)**j for j in range(1,k_m+1)) for k_m in (1,2,3,4)],[-1,0,-1,0])
```

### Deciding from a ratio limit of one {#deciding-from-a-ratio-limit-of-one}

For both $1/n$ and $1/n^2$, the ratio of consecutive terms tends to $1$. Only the second of the two series converges.

A ratio limit of $1$ is inconclusive. Try a test that accounts for the form of the terms. [Section 14.8](module_14_EN.html#absolute)

```check
limit_is(x/(x+1),x,oo,1); limit_is((x/(x+1))**2,x,oo,1); holds(summation(1/n,(n,1,oo))==oo); same(summation(1/n**2,(n,1,oo)),pi**2/6)
```

### Including both endpoints from the radius alone {#including-both-endpoints-from-the-radius-alone}

For $\sum_{n=1}^\infty x^n/n$, the radius is $1$. At $x=1$ the series is harmonic. At $x=-1$ it converges by the alternating series test.

Use the radius for the open interval about the centre. Test each finite endpoint on its own. [Section 15.1](module_15_EN.html#power-series)

```check
limit_is(x/(x+1),x,oo,1); holds(summation(1/n,(n,1,oo))==oo); same(summation((-1)**n/n,(n,1,oo)),-log(2))
```

### Using a geometric expansion outside its interval {#using-a-geometric-expansion-outside-its-interval}

The formula $1/(1-x)$ gives $-1$ at $x=2$. The terms $2^n$ grow, so the geometric expansion there does not sum to $-1$.

For the geometric series $\sum_{n=0}^\infty x^n$, use the formula $1/(1-x)$ only for $\abs{x}<1$. [Section 15.2](module_15_EN.html#functions-as-series)

```check
same(1/(1-Integer(2)),-1); limit_is(2**x,x,oo,oo); same(summation((S.Half)**n,(n,0,oo)),2)
```

### Carrying endpoint convergence through differentiation {#carrying-endpoint-convergence-through-differentiation}

The power series $\sum_{n=1}^\infty x^n/n^2$ converges at $x=1$. After differentiation the endpoint terms become $1/n$ and their sum diverges.

Differentiate term by term inside the radius of convergence. Recheck endpoints for the new series. [Section 15.3](module_15_EN.html#term-by-term)

```check
same(diff(x**n/n**2,x),x**(n-1)/n); same(summation(1/n**2,(n,1,oo)),pi**2/6); holds(summation(1/n,(n,1,oo))==oo)
```

### Forgetting the factorial in a Taylor coefficient {#forgetting-the-factorial-in-a-taylor-coefficient}

The second derivative of $e^x$ at $0$ is $1$. Putting $x^2$ in the Taylor polynomial gives second derivative $2$ at $0$. Using $x^2/2$ gives $1$.

Use $f^{(n)}(a)/n!$ as the coefficient of $(x-a)^n$. [Section 15.4](module_15_EN.html#taylor-series)

```check
same(diff(exp(x),x,2).subs(x,0),1); same(diff(x**2,x,2).subs(x,0),2); same(diff(x**2/factorial(2),x,2).subs(x,0),1)
```

### Taking the first omitted term as a universal error bound {#taking-the-first-omitted-term-as-a-universal-error-bound}

For $e^x$ at $x=1$, the constant Taylor approximation is $1$. The next term is $1$, but the error $e-1$ exceeds it.

Bound the needed derivative on the interval and apply Taylor’s inequality. The next-term bound requires a separate result such as the alternating series estimate. [Section 15.5](module_15_EN.html#taylor-theorem)

```check
same(exp(0)+exp(0)*1,2); holds(E-1>1)
```

## Curves, vectors and functions of several variables {#several}

### Leaving out the parameter interval {#leaving-out-the-parameter-interval}

For $(x,y)=(\cos t,\sin t)$, the values from $t=0$ to $t=\pi$ trace the upper semicircle. Extending to $2\pi$ traces the full circle.

Specify the parameter interval and the direction in which it is traversed. [Section 16.1](module_16_EN.html#parametric)

```check
same([[cos(t).subs(t,p),sin(t).subs(t,p)] for p in (0,pi/2,pi,3*pi/2,2*pi)],[[1,0],[0,1],[-1,0],[0,-1],[1,0]])
```

### Treating a vertical tangent as a finite slope {#treating-a-vertical-tangent-as-a-finite-slope}

For $(x,y)=(t^2,t)$ at $t=0$, $dx/dt=0$ and $dy/dt=1$. The tangent vector points vertically.

Use $(dy/dt)/(dx/dt)$ only when $dx/dt\ne0$. A nonzero vertical tangent vector gives a vertical tangent line. [Section 16.2](module_16_EN.html#parametric-calculus)

```check
same([diff(t**2,t).subs(t,0),diff(t,t)],[0,1])
```

### Using arctangent without checking the quadrant {#using-arctangent-without-checking-the-quadrant}

At $(-1,1)$, $\arctan(y/x)=-\pi/4$. For radius $\sqrt2$, that angle gives $(1,-1)$. The correct angle is $3\pi/4$.

Choose the angle from both coordinates, for example with a two-argument arctangent, when taking a positive radius. [Section 16.3](module_16_EN.html#polar)

```check
same(atan(-1),-pi/4); same([sqrt(2)*cos(-pi/4),sqrt(2)*sin(-pi/4)],[1,-1]); same(atan2(1,-1),3*pi/4)
```

### Dividing a vector projection by length instead of length squared {#dividing-a-vector-projection-by-length-instead-of-length-squared}

Projecting $\langle2,3\rangle$ onto $\langle2,0\rangle$ gives $\langle2,0\rangle$. Dividing the dot product by the length and multiplying by $\langle2,0\rangle$ gives $\langle4,0\rangle$.

For a projection onto a nonzero vector $\vb a$, multiply $\vb a$ by $(\vb b\cdot\vb a)/(\vb a\cdot\vb a)$. [Section 16.5](module_16_EN.html#projections)

```check
a_m,b_m=Matrix([2,0]),Matrix([2,3]); same(b_m.dot(a_m)/a_m.dot(a_m)*a_m,Matrix([2,0])); same(b_m.dot(a_m)/a_m.norm()*a_m,Matrix([4,0]))
```

### Swapping cross-product factors {#swapping-cross-product-factors}

The cross product $\vb i\times\vb j$ is $\vb k$, while $\vb j\times\vb i$ is $-\vb k$.

Keep the order of the factors and use the right-hand rule for the direction. [Section 16.6](module_16_EN.html#cross)

```check
i_m,j_m,k_m=(Matrix(v_m) for v_m in ([1,0,0],[0,1,0],[0,0,1])); same(i_m.cross(j_m),k_m); same(j_m.cross(i_m),-k_m)
```

### Checking only straight paths to a multivariable limit {#checking-only-straight-paths-to-a-multivariable-limit}

For $f(x,y)=x^2y/(x^4+y^2)$, the limit along each line through the origin is $0$. Along $y=x^2$, the values are $1/2$ away from the origin.

Two paths with different limits disprove a limit. To prove a limit, find a bound that holds for all points sufficiently close. [Section 17.2](module_17_EN.html#paths)

```check
F_m=x**2*y/(x**4+y**2); q_m=Symbol('q_m',real=True,nonzero=True); limit_is(F_m.subs(y,q_m*x),x,0,0); same(F_m.subs(y,0),0); same(F_m.subs(x,0),0); same(F_m.subs(y,x**2),Rational(1,2))
```

### Differentiating all inputs at once {#differentiating-all-inputs-at-once}

If $f(x,y)=xy^2$, then $f_x=y^2$. At $(2,3)$ it is $9$, whereas $f_y=2xy$ gives $12$.

Hold the other inputs fixed when taking a partial derivative. [Section 17.3](module_17_EN.html#partial-derivatives)

```check
same(diff(x*y**2,x),y**2); same(diff(x*y**2,y),2*x*y); same([diff(x*y**2,v_m).subs({x:2,y:3}) for v_m in (x,y)],[9,12])
```

### Equating the differential with the actual change {#equating-the-differential-with-the-actual-change}

At $(1,1)$ for $z=x^2+y^2$, changing $x$ by $1$ gives $dz=2$ and actual change $\Delta z=3$.

For a differentiable function, use the differential as the linear approximation to a small change. [Section 17.4](module_17_EN.html#tangent-planes)

```check
F_m=x**2+y**2; same(diff(F_m,x).subs({x:1,y:1})*1,2); same(F_m.subs({x:2,y:1})-F_m.subs({x:1,y:1}),3)
```

### Using a non-unit direction vector {#using-a-non-unit-direction-vector}

For $f(x,y)=x$ in the direction of $\langle3,4\rangle$, the rate per unit distance is $3/5$. Dotting its gradient with the original vector gives $3$.

Normalise a nonzero direction vector before taking its dot product with the gradient. [Section 17.6](module_17_EN.html#gradient)

```check
v_m=Matrix([3,4]); g_m=Matrix([1,0]); same([v_m.norm(),g_m.dot(v_m/v_m.norm()),g_m.dot(v_m)],[5,Rational(3,5),3])
```

### Classifying by one second partial alone {#classifying-by-one-second-partial-alone}

At the origin for $x^2-y^2$, $f_{xx}=2$, but the Hessian determinant is $-4$. Along the coordinate axes the function takes opposite signs near the origin.

At a stationary point with continuous second partial derivatives, a negative determinant gives a saddle, regardless of the sign of $f_{xx}$. [Section 18.2](module_18_EN.html#second-derivative-test)

```check
F_m=x**2-y**2; same(hessian(F_m,(x,y)).det(),-4); same(diff(F_m,x,2),2); same([F_m.subs({x:1,y:0}),F_m.subs({x:0,y:1})],[1,-1])
```

### Taking a zero Hessian determinant as a classification {#taking-a-zero-hessian-determinant-as-a-classification}

Both $x^4+y^2$ and $x^4-y^2$ have determinant $0$ at the origin. The first has a minimum there. The second has signs of both kinds arbitrarily close by.

A zero determinant leaves the test inconclusive. Check the function on nearby points or use another argument. [Section 18.2](module_18_EN.html#second-derivative-test)

```check
F_m,G_m=x**4+y**2,x**4-y**2; same([hessian(X,(x,y)).det().subs({x:0,y:0}) for X in (F_m,G_m)],[0,0]); p_m=Symbol('p_m',positive=True); holds(F_m.subs({x:p_m,y:p_m})>0); holds(G_m.subs({x:p_m,y:0})>0); holds(G_m.subs({x:0,y:p_m})<0)
```

### Missing the corners of a region {#missing-the-corners-of-a-region}

On $[0,1]\times[0,1]$, $f(x,y)=x+y$ has no stationary point. Its smallest and largest values are $0$ and $2$, at corners.

For a continuous function on a closed bounded region, compare interior candidates with extrema on every boundary piece, including its endpoints. [Section 18.3](module_18_EN.html#absolute-extrema)

```check
same([diff(x+y,v_m) for v_m in (x,y)],[1,1]); same([a_m+b_m for a_m,b_m in ((0,0),(1,0),(0,1),(1,1))],[0,1,1,2])
```

### Dividing by a variable in a multiplier equation {#dividing-by-a-variable-in-a-multiplier-equation}

Maximising $y$ on $x^2+y^2=1$ gives a multiplier equation $0=2\lambda x$. The maximum is at $(0,1)$, where cancelling $x$ would lose it.

Keep both branches when a factor can vanish. Solve with the constraint and check any points where the constraint gradient vanishes separately. [Section 18.4](module_18_EN.html#lagrange)

```check
l=Symbol('l'); same(solve([2*x*l,2*y*l-1,x*x+y*y-1],(x,y,l)),[(0,-1,-Rational(1,2)),(0,1,Rational(1,2))])
```

### Treating vertical and horizontal residuals alike {#treating-vertical-and-horizontal-residuals-alike}

For the points $(0,0),(1,2),(2,2)$, fitting $y$ on $x$ gives slope $1$. Fitting $x$ on $y$ gives slope $3/4$, whose reciprocal is $4/3$.

Choose which variable you are predicting. Ordinary least squares minimises squared errors in that response variable. [Section 18.5](module_18_EN.html#least-squares)

```check
xs_m,ys_m=Matrix([0,1,2]),Matrix([0,2,2]); xc_m,yc_m=xs_m-ones(3,1),ys_m-ones(3,1)*Rational(4,3); same([xc_m.dot(yc_m)/xc_m.dot(xc_m),xc_m.dot(yc_m)/yc_m.dot(yc_m)],[1,Rational(3,4)]); same(1/Rational(3,4),Rational(4,3))
```

### Assuming a bigger gradient step is faster {#assuming-a-bigger-gradient-step-is-faster}

For $f(x)=x^2$, the update is $x\mapsto(1-2\eta)x$. Starting at $1$, step size $\eta=1/2$ reaches $0$ immediately, but $\eta=3/4$ reaches $-1/2$.

Check how the step size and curvature affect each update. A larger step can oscillate and an oversized one can diverge. [Section 18.6](module_18_EN.html#gradient-descent)

```check
same([1-h_m*diff(x**2,x).subs(x,1) for h_m in (Rational(1,2),Rational(3,4))],[0,-Rational(1,2)])
```

## Multiple integrals and vector calculus {#multiple}

### Keeping rectangular bounds with the wrong variables {#keeping-rectangular-bounds-with-the-wrong-variables}

For $f(x,y)=x$ on $0\le x\le2$, $0\le y\le1$, integrating gives $2$. Swapping the differentials while leaving the numeric bounds where they are gives $1$.

Keep the correct interval with each variable when changing the order of integration. [Section 19.2](module_19_EN.html#iterated)

```check
same(integrate(x,(y,0,1),(x,0,2)),2); same(integrate(x,(x,0,1),(y,0,2)),1)
```

### Using the enclosing rectangle for a triangular slice {#using-the-enclosing-rectangle-for-a-triangular-slice}

For $0\le y\le x\le1$, the vertical slice has length $x$. Using the upper limit $1$ for every slice gives area $1$, while the triangle has area $1/2$.

Describe the lower and upper edges of one slice as functions of the outer variable. [Section 19.3](module_19_EN.html#general-regions)

```check
same(integrate(1,(y,0,x),(x,0,1)),Rational(1,2)); same(integrate(1,(y,0,1),(x,0,1)),1)
```

### Dropping the factor r in polar area {#dropping-the-factor-r-in-polar-area}

For the unit disc, integrating $dr\,d\theta$ over $0\le r\le1$, $0\le\theta\le2\pi$ gives $2\pi$. Integrating $r\,dr\,d\theta$ gives $\pi$.

Replace $dA$ by $r\,dr\,d\theta$ for a once-covered planar region in polar coordinates. [Section 19.4](module_19_EN.html#polar)

```check
same(integrate(1,(r,0,1),(theta,0,2*pi)),2*pi); same(integrate(r,(r,0,1),(theta,0,2*pi)),pi)
```

### Reading the height of a density as a probability {#reading-the-height-of-a-density-as-a-probability}

The constant density $4$ on $[0,1/2]\times[0,1/2]$ has total integral $1$. A single point in that square has probability $0$.

Integrate the joint density over an area to get a probability. Its pointwise height can exceed $1$. [Section 19.5](module_19_EN.html#joint-densities)

```check
same(integrate(4,(y,0,S.Half),(x,0,S.Half)),1); same(integrate(4,(y,0,0),(x,0,0)),0); holds(4>1)
```

### Using the polar angle as a full turn in spherical coordinates {#using-the-polar-angle-as-a-full-turn-in-spherical-coordinates}

At spherical radius $1$ and polar angle $\varphi=\pi$, the height is $z=-1$. At $2\pi$ the height is back to $1$.

Measure $\varphi$ from the positive vertical axis, with $0\le\varphi\le\pi$. The azimuth $\theta$ makes the full turn. [Section 19.7](module_19_EN.html#spherical)

```check
same([cos(pi),cos(2*pi)],[-1,1]); same(integrate(sin(t),(t,0,pi)),2)
```

### Keeping the sign of a negative area Jacobian {#keeping-the-sign-of-a-negative-area-jacobian}

The map $(u,v)\mapsto(v,u)$ preserves the unit square but has determinant $-1$. Integrating that signed determinant would give area $-1$.

Use the absolute value of the Jacobian determinant in an area or volume calculation. [Section 19.8](module_19_EN.html#change-of-variables)

```check
J_m=Matrix([v,u]).jacobian([u,v]).det(); same(J_m,-1); same(integrate(Abs(J_m),(u,0,1),(v,0,1)),1)
```

### Omitting speed in a scalar line integral {#omitting-speed-in-a-scalar-line-integral}

For the line $\vb r(t)=\langle3t,4t\rangle$ on $0\le t\le1$, the integral of $1$ with respect to arc length is $5$. Integrating $1$ with respect to $t$ gives $1$.

In a scalar line integral, substitute $ds=\norm{\vb r'(t)}\,dt$. [Section 20.2](module_20_EN.html#line-integrals)

```check
r_m=Matrix([3*t,4*t]); same(integrate(r_m.diff(t).norm(),(t,0,1)),5); same(integrate(1,(t,0,1)),1)
```

### Ignoring orientation for the work integral {#ignoring-orientation-for-the-work-integral}

For field $\vb F=\langle1,0\rangle$, moving from $(0,0)$ to $(2,0)$ gives work $2$. Reversing the path gives $-2$.

Keep the path orientation when integrating $\vb F\cdot d\vb r$. Scalar arc-length integrals use positive length elements. [Section 20.2](module_20_EN.html#direction)

```check
F_m=Matrix([1,0]); same([integrate(F_m.dot(Matrix([X,0]).diff(t)),(t,0,1)) for X in (2*t,2-2*t)],[2,-2])
```

### Using a derivative test across a hole {#using-a-derivative-test-across-a-hole}

The field $\langle-y,x\rangle/(x^2+y^2)$ satisfies $P_y=Q_x$ away from the origin. Its anticlockwise circulation around the unit circle is $2\pi$, so it has no potential on the punctured plane.

For the planar derivative test check continuous first partial derivatives and simple connectivity. When the domain has a hole, test path independence or construct a potential directly. [Section 20.3](module_20_EN.html#test)

```check
P_m,Q_m=-y/(x*x+y*y),x/(x*x+y*y); same(diff(P_m,y),diff(Q_m,x)); circ_m=Matrix([P_m,Q_m]).subs({x:cos(t),y:sin(t)},simultaneous=True).dot(Matrix([cos(t),sin(t)]).diff(t)); same(integrate(simplify(circ_m),(t,0,2*pi)),2*pi)
```

### Treating a partial integration constant as a number {#treating-a-partial-integration-constant-as-a-number}

For $f_x=2x$ and $f_y=2y$, integrating in $x$ gives $x^2+g(y)$. A numeric constant would give $f_y=0$. Choosing $g(y)=y^2$ gives the required second partial.

After integrating a partial derivative, allow an arbitrary function of the held-fixed variables. Determine it from the other partial derivatives. [Section 20.3](module_20_EN.html#potential)

```check
same(diff(x**2+3,y),0); same([diff(x*x+y*y,v_m) for v_m in (x,y)],[2*x,2*y])
```

### Using the clockwise sign in Green’s circulation formula {#using-the-clockwise-sign-in-greens-circulation-formula}

For $\vb F=\langle-y/2,x/2\rangle$ on the unit circle, the anticlockwise circulation is $\pi$. Traversing clockwise gives $-\pi$.

For Green's circulation formula, orient the boundary with the region on your left. Reverse the sign for the opposite traversal. [Section 20.4](module_20_EN.html#green)

```check
C_m=Matrix([cos(t),sin(t)]); F_m=Matrix([-C_m[1]/2,C_m[0]/2]); same(integrate(simplify(F_m.dot(C_m.diff(t))),(t,0,2*pi)),pi); same(integrate(simplify(F_m.dot(C_m.diff(t))),(t,2*pi,0)),-pi)
```

### Using the parameter area as surface area {#using-the-parameter-area-as-surface-area}

For $\vb r(u,v)=\langle2u,3v,0\rangle$ on the unit parameter square, the actual patch is a rectangle with area $6$. Its parameter square has area $1$.

For a smooth once-covered patch, multiply the parameter area by $\norm{\vb r_u\times\vb r_v}$ in a scalar surface integral. [Section 20.6](module_20_EN.html#flux)

```check
R_m=Matrix([2*u,3*v,0]); same(R_m.diff(u).cross(R_m.diff(v)).norm(),6); same(integrate(1,(u,0,1),(v,0,1)),1)
```

### Applying the divergence theorem to an open surface alone {#applying-the-divergence-theorem-to-an-open-surface-alone}

For the constant field $\langle0,0,1\rangle$, the upward flux through the top of a unit cube is $1$. Its divergence is $0$. The bottom contributes $-1$, so the closed-surface flux is $0$.

Apply the divergence theorem to the whole piecewise smooth outward-oriented boundary of a bounded solid, with the field continuously differentiable on a neighbourhood of the solid. [Section 20.7](module_20_EN.html#stokes-divergence)

```check
F_m=Matrix([0,0,1]); same([F_m.dot(Matrix([0,0,p_m])) for p_m in (1,-1)],[1,-1]); same(sum(diff(q_m,p_m) for q_m,p_m in zip(F_m,(x,y,z))),0); same(1-1,0)
```
