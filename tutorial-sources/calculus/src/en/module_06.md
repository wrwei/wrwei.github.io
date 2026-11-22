---
title: Exponentials, logarithms and implicit differentiation
part: 2
lead: Find out where the number e comes from and why e to the x is its own derivative. Then differentiate logarithms, inverse functions, the inverse trigonometric and hyperbolic functions and curves given by equations, and check the formulas of exponential growth and decay.
minutes: 270
needs: Modules 1 to 5, especially the chain rule
goals:
  - Explain how compound interest and the slope of $a^x$ at 0 both lead to the number $e$, and what is proved and what is assumed
  - Differentiate exponential and logarithmic functions with any base
  - Find derivatives of inverse functions, including $\ln x$ and the inverse trigonometric functions
  - Use implicit and logarithmic differentiation to find slopes and tangent lines
  - Work with the hyperbolic functions and their derivatives
  - Verify that $Ce^{kt}$ solves $y' = ky$, and compute doubling times and half-lives
---

## The number e {#number-e}

Module 1 introduced Euler's number $e \approx 2.71828$, and the natural logarithm $\ln$ as the inverse of $e^x$, and promised to show where $e$ comes from. It comes from two places at once. One is money: interest that is added to an account more and more often. The other is slopes: among all the exponential functions $a^x$, exactly one has slope 1 where it crosses the $y$-axis. This section follows both routes, and Section 6.3 shows that they arrive at the same number.

### Compound interest {#compound-interest}

Suppose a bank pays interest at 100% a year (an absurd rate, chosen to keep the numbers simple), and you deposit £1. If the interest is added once, at the end of the year, you then have £2. If instead the bank adds half the yearly rate, 50%, every six months, the interest earned in the first half-year earns interest itself in the second, and after a year you have $(1 + \tfrac12)^2 = 2.25$ pounds. With interest added $n$ times a year, at the rate $\tfrac1n$ each time, every addition multiplies the balance by $1 + \tfrac1n$, so after a year you have

$$\Big(1 + \frac1n\Big)^n \text{ pounds.}$$

Here it is with interest added yearly, every six months, every quarter, monthly, weekly, daily ($n = 365$), hourly ($n = 8760$) and every minute ($n = 525{,}600$):

```valuetable
n = 1, 2, 4, 12, 52, 365, 8760, 525600
$\Big(1 + \dfrac1n\Big)^n$ = (1 + 1/n)**n
digits = 7
---
n | \Big(1 + \dfrac1n\Big)^n
1 | 2
2 | 2.25
4 | 2.441406
12 | 2.613035
52 | 2.692597
365 | 2.714567
8760 | 2.718127
525600 | 2.718279
```

More frequent compounding helps, but less and less: going from daily to every minute gains less than half a penny. The amounts settle down to a limit, about 2.71828, which is what you would have if interest were added continually, at every instant: **continuous compounding**. Section 6.3 proves that this limit is $e$.

```check
same((1 + Rational(1, 2))**2, Rational(9, 4))
from sympy.calculus.util import function_range
cmp = lambda N_: (1 + 1/Float(N_, 40))**N_            # 40-digit arithmetic: the exact fractions are huge
same(365*24, 8760); same(365*24*60, 525600)
holds(all(cmp(p) < cmp(q) for p, q in [(1, 2), (2, 4), (4, 12), (12, 52), (52, 365), (365, 8760), (8760, 525600)]))
holds(cmp(525600) - cmp(365) < Rational(1, 200))      # less than half a penny
rounds(E, '2.71828')
```

### The slope of $a^x$ at 0 {#slope-at-zero}

Every exponential function $a^x$ passes through $(0, 1)$, since $a^0 = 1$. How steep is its graph there? By Module 4, the slope of the tangent line at $x = 0$ is the limit, as $h \to 0$, of the difference quotients

$$\frac{a^{0+h} - a^0}{h} = \frac{a^h - 1}{h}.$$

For $a = 2$ and $a = 3$:

```valuetable
h = 0.1, 0.01, 0.001, 0.0001, -0.0001, -0.001, -0.01, -0.1
$\dfrac{2^h - 1}{h}$ = (2**h - 1)/h
$\dfrac{3^h - 1}{h}$ = (3**h - 1)/h
digits = 6
---
h | \dfrac{2^h - 1}{h} | \dfrac{3^h - 1}{h}
0.1 | 0.717735 | 1.16123
0.01 | 0.695555 | 1.10467
0.001 | 0.693387 | 1.09922
0.0001 | 0.693171 | 1.09867
-0.0001 | 0.693123 | 1.09855
-0.001 | 0.692907 | 1.09801
-0.01 | 0.690750 | 1.09260
-0.1 | 0.669670 | 1.04042
```

From both sides the quotients settle down: the slope of $2^x$ at 0 is about 0.6931, and that of $3^x$ about 1.0986. Write

$$m(a) = \lim_{h\to0}\frac{a^h - 1}{h},$$

read "m of a", for the slope of $a^x$ at $x = 0$ ($m$ for slope, as in Module 1). The table suggests that $m(2) \approx 0.6931$ and $m(3) \approx 1.0986$. The slope at 0 decides the slope everywhere:

```check
rounds(log(2), '0.6931'); rounds(log(3), '1.0986')
limit_is((2**h - 1)/h, h, 0, log(2)); limit_is((3**h - 1)/h, h, 0, log(3))
```

::: theorem The derivative of an exponential
Let $a > 0$, and suppose that the limit $m(a)$ exists, that is, that $a^x$ is differentiable at $x = 0$. Then $a^x$ is differentiable at every $x$, and

$$\frac{d}{dx}\big(a^x\big) = m(a)\,a^x.$$
:::

::: proof
Fix $x$. By the law of exponents $a^{x+h} = a^x a^h$,

$$\frac{a^{x+h} - a^x}{h} = \frac{a^x a^h - a^x}{h} = a^x\cdot\frac{a^h - 1}{h}.$$

As $h \to 0$, the factor $a^x$ does not change and the second factor approaches $m(a)$, so by the limit law for products the difference quotient approaches $a^x\,m(a)$.
:::

```check
ap = symbols('a', positive=True); xr = symbols('x', real=True)
steps((ap**(xr + h) - ap**xr)/h, (ap**xr*ap**h - ap**xr)/h, ap**xr*(ap**h - 1)/h)
limit_is(ap**xr*(ap**h - 1)/h, h, 0, ap**xr*limit((ap**h - 1)/h, h, 0, '+-'))
```

::: keyidea
The slope of an exponential at any point is its height there times its slope at 0. An exponential grows at a rate proportional to its own size; Section 6.8 shows what that means for populations, money and radioactive decay.
:::

### The base with slope 1 {#base-e}

Since $m(2) < 1 < m(3)$, somewhere between 2 and 3 there should be a base whose exponential has slope exactly 1 at 0. To find it, see what raising the base to a power does to the slope at 0.

::: theorem Changing the base
Let $a > 0$, and suppose that $m(a)$ exists. Then for every real number $c$, $m(a^c)$ exists and

$$m\big(a^c\big) = c\,m(a).$$
:::

::: proof
For $c = 0$, $a^0 = 1$ and $1^h = 1$, so every quotient is 0, and $m(1) = 0 = 0 \cdot m(a)$. For $c \ne 0$, $(a^c)^h = a^{ch}$ by the laws of exponents, so for $h \ne 0$

$$\frac{(a^c)^h - 1}{h} = c\cdot\frac{a^{ch} - 1}{ch}.$$

Write $k = ch$. As $h \to 0$, $k \to 0$, and $k \ne 0$ when $h \ne 0$; so the fraction $\dfrac{a^k - 1}{k}$ approaches $m(a)$, and the whole expression approaches $c\,m(a)$.
:::

```check
cr = symbols('c', real=True, nonzero=True)
same(((ap**cr)**h - 1)/h, cr*(ap**(cr*h) - 1)/(cr*h))
limit_is(((ap**cr)**h - 1)/h, h, 0, cr*limit((ap**h - 1)/h, h, 0, '+-'))
limit_is((1**h - 1)/h, h, 0, 0)
```

Now choose $c = 1/m(2)$, which is allowed because $m(2)$ is not 0. By Theorem 6.2, the base $2^{1/m(2)}$ has slope $\dfrac{1}{m(2)}\cdot m(2) = 1$ at 0. To find it, estimate $m(2)$ more closely. The average of the two quotients of the table nearest to $h = 0$, 0.693171 and 0.693123, is the central difference of Module 4, which is much more accurate than either: $m(2) \approx 0.693147$. Then $1/m(2) \approx 1.442695$, and the base is about $2^{1.442695} \approx 2.718282$: the digits of Module 1's $e$.

```check
qp_, qm_ = (2**Rational(1, 10000) - 1)*10000, (1 - 2**Rational(-1, 10000))*10000     # the table at h = 0.0001 and -0.0001
rounds(qp_, '0.693171'); rounds(qm_, '0.693123'); same((Rational('0.693171') + Rational('0.693123'))/2, Rational('0.693147'))
same((qp_ + qm_)/2, (2**Rational(1, 10000) - 2**Rational(-1, 10000))/(2*Rational(1, 10000))); rounds((qp_ + qm_)/2, '0.693147')
rounds(log(2), '0.693147'); rounds(1/log(2), '1.442695')
rounds(2**Rational(1442695, 1000000), '2.718282'); rounds(2**(1/log(2)), '2.718282')
same(2**(1/log(2)), E)
```

::: definition The number e
**Euler's number** $e$ is the base whose exponential has slope 1 at $x = 0$:

$$\lim_{h\to0}\frac{e^h - 1}{h} = 1.$$

The **natural logarithm** is, as in Module 1, the inverse of $e^x$: for $x > 0$, $\ln x = y$ means $e^y = x$.
:::

```check
limit_is((exp(h) - 1)/h, h, 0, 1)
```

::: note
**What is proved and what is taken on trust.** This section takes two things on trust. The first is Module 1's powers $a^x$ for every real $x$, with the properties that Module 1 listed: the laws of exponents (for an irrational $x$, $a^x$ is the number that the powers with rational exponents close to $x$ approach), and, for a base $a > 1$, that $a^x$ increases and takes every positive value exactly once, so that logarithms exist. The second is that the limit $m(2)$ exists and is positive: the table leaves little doubt that it is about 0.6931, and the Going deeper box later in this section sketches how both facts can be proved. Everything else in this section is proved from these two. Theorem 6.2 shows that the base $2^{1/m(2)}$ has slope 1 at 0, so $e$ exists, and the next theorem shows that no other base does.
:::

::: theorem Derivatives of $e^x$ and $a^x$
For every real $x$,

$$\frac{d}{dx}\big(e^x\big) = e^x.$$

For every base $a > 0$: $a^x = e^{x\ln a}$, the slope of $a^x$ at 0 is $m(a) = \ln a$, and

$$\frac{d}{dx}\big(a^x\big) = a^x\ln a.$$
:::

::: proof
By Definition 6.1, $m(e) = 1$, so Theorem 6.1 gives $(e^x)' = 1 \cdot e^x = e^x$. Let $a > 0$. Then $a = e^{\ln a}$ (Module 1), so by the law $(a^u)^v = a^{uv}$, $a^x = \big(e^{\ln a}\big)^x = e^{x\ln a}$. Theorem 6.2, with base $e$ and $c = \ln a$, gives $m(a) = m\big(e^{\ln a}\big) = \ln a \cdot m(e) = \ln a$, and Theorem 6.1 finishes the proof.
:::

```check
same(diff(exp(x), x), exp(x))
same(exp(log(ap)), ap); same(exp(xr*log(ap)), ap**xr)
limit_is((ap**h - 1)/h, h, 0, log(ap))
same(diff(ap**x, x), ap**x*log(ap)); same(diff(exp(xr*log(ap)), xr), ap**xr*log(ap))
same(solve(log(ap) - 1, ap), [E])        # m(a) = ln a = 1 only for a = e
```

So $m(2) = \ln 2$ and $m(3) = \ln 3$, the limits in the table, and $e$ is the only base with slope 1 at 0: $m(a) = 1$ means $\ln a = 1$, that is, $a = e$. You can also reach $(a^x)' = a^x\ln a$ with the chain rule of Module 5: the derivative of $e^{x\ln a}$ is $e^{x\ln a}\cdot\ln a = a^x\ln a$.

::: figure id=fig-06-1
Left: $2^x$, $e^x$ and $3^x$ all pass through $(0, 1)$, where their tangent lines (dashed) have slopes $\ln 2 \approx 0.69$, exactly 1, and $\ln 3 \approx 1.10$. Right: the tangent lines to $y = e^x$ at $x = -1$, 0 and 1. Each meets the $x$-axis 1 unit to the left of its point of contact, so its slope, rise over run, equals the height $e^x$ there: the function is its own derivative.
:::

```check
rounds(log(2), '0.69'); rounds(log(3), '1.10')
al = symbols('alpha', real=True)
same(solve(exp(al) + exp(al)*(x - al), x), [al - 1])     # the tangent at x = alpha meets the axis at alpha - 1
```

::: widget name=exp-slope
Move the slider, or type a base, until the orange tangent line at $x = 0$ lies along the dashed line of slope 1. The readout estimates the slope at 0 with a difference quotient and tells you when it is within 0.001 of 1: how many digits of $e$ can you find? Then press **Show ln a** and compare the slope with $\ln a$ for a few bases, and press **Show e**. The green line is the tangent at $x = 1$; check that its slope is $a$ times the slope at 0, as Theorem 6.1 says.
:::

::: example Derivatives with $e^x$ and $a^x$
Differentiate (a) $e^{3x}$, (b) $x^2e^{-x}$ and (c) $10^x$, and (d) find the tangent line to $y = e^x$ at $x = 1$.

**(a)** By the chain rule with the inner function $3x$, $\dfrac{d}{dx}e^{3x} = e^{3x}\cdot 3 = 3e^{3x}$. In the same way, $\dfrac{d}{dx}e^{kx} = ke^{kx}$ for every constant $k$.

**(b)** By the product rule, and (a) with $k = -1$:

$$\begin{aligned} \frac{d}{dx}\big(x^2e^{-x}\big) &= 2x\,e^{-x} + x^2\big(-e^{-x}\big) \\ &= \big(2x - x^2\big)e^{-x}. \end{aligned}$$

**(c)** By Theorem 6.3 with $a = 10$, $\dfrac{d}{dx}10^x = 10^x\ln 10 \approx 2.303 \cdot 10^x$.

**(d)** At $x = 1$ the height is $e$ and the slope is $e^1 = e$, so the tangent line is $y - e = e(x - 1)$, that is, $y = ex$. It passes through the origin, as the right panel of Figure 6.1 shows.

```check
same(diff(exp(3*x), x), 3*exp(3*x)); same(diff(exp(k*x), x), k*exp(k*x))
steps(diff(x**2*exp(-x), x), 2*x*exp(-x) + x**2*(-exp(-x)), (2*x - x**2)*exp(-x))
same(diff(10**x, x), 10**x*log(10)); rounds(log(10), '2.303')
same(diff(exp(x), x).subs(x, 1), E)
steps(solve(Eq(y - E, E*(x - 1)), y)[0], E*x); same((E*x).subs(x, 0), 0)
```
:::

::: pitfall
The power rule is for powers $x^n$, with the variable in the base. It does not apply to $e^x$ or $2^x$, where the variable is in the exponent: $\dfrac{d}{dx}e^x$ is not $xe^{x-1}$, and $\dfrac{d}{dx}2^x$ is neither $x\,2^{x-1}$ nor $2^x$. And $e^2 \approx 7.39$ is a constant, so its derivative is 0.

```check
holds(Ne(diff(exp(x), x).subs(x, 0), (x*exp(x - 1)).subs(x, 0)))
holds(Ne(diff(2**x, x).subs(x, 0), (x*2**(x - 1)).subs(x, 0))); holds(Ne(diff(2**x, x).subs(x, 0), (2**x).subs(x, 0)))
rounds(exp(2), '7.39'); same(diff(exp(2), x), 0)
```
:::

::: deeper Why the limit exists, and another road to e
**The limit $m(2)$.** For $h \ne 0$ let $q(h) = \dfrac{2^h - 1}{h}$, the slope of the chord of the graph of $2^x$ from $(0, 1)$ to $(h, 2^h)$. The graph of $2^x$ bends upwards (it is **convex**), so this slope grows as $h$ moves to the right: $q$ increases on each side of 0, and every value with $h < 0$ is below every value with $h > 0$. So as $h$ decreases to 0, $q(h)$ decreases but stays above $q(-1) = \tfrac12$, and a quantity that decreases but stays above a fixed number approaches a limit: this is a basic property of the real numbers, made precise for sequences in Module 14. In the same way $q(h)$ increases to a limit as $h$ increases to 0, staying below $q(1) = 1$. The two one-sided limits are equal, because $q(-h) = 2^{-h}q(h)$ and $2^{-h} \to 1$. So $m(2)$ exists, and it lies between $\tfrac12$ and 1; in particular it is positive. The step left out here is the proof that $2^x$ is convex, which takes more work with real exponents.

**Another road: start from the logarithm.** Module 10 makes possible a route that takes nothing about powers on trust; it rests instead on a theorem that Module 9 uses without proof, that a continuous function has an integral. Define, for $x > 0$,

$$\ln x = \int_1^x \frac{dt}{t},$$

the area under the curve $y = 1/t$ from 1 to $x$ (counted as negative when $x < 1$). The Fundamental Theorem of Calculus gives $(\ln x)' = 1/x$ at once; the laws of logarithms follow from it, with a theorem of Module 8; $\ln$ increases and takes every real value, so it has an inverse function, ${\exp}$; $e$ is $\exp(1)$, the number for which the area from 1 to $e$ is exactly 1; and for $a > 0$ and every real $x$ one *defines* $a^x = \exp(x\ln a)$, which also settles what irrational powers mean. Theorem 6.4 below then gives $\exp' = {\exp}$. The functions are the same as in this section; only the order of the proofs changes.

```check
qd = lambda H: (2**H - 1)/H
same(qd(-1), Rational(1, 2)); same(qd(1), 1)
same((2**(-h) - 1)/(-h), 2**(-h)*(2**h - 1)/h)
holds(Rational(1, 2) < log(2)); holds(log(2) < 1)
same(diff(Integral(1/t, (t, 1, x)), x), 1/x); same(integrate(1/t, (t, 1, E)), 1)
```
:::

::: compute Hunting for e
Python can estimate the slope of $a^x$ at 0 with a difference quotient. The symmetric quotient $\dfrac{a^h - a^{-h}}{2h}$, the central difference of Module 4, is much more accurate than $\dfrac{a^h - 1}{h}$ for the same $h$:

```python
import math
def slope_at_0(a, h=1e-6):
    return (a**h - a**(-h))/(2*h)      # central difference at x = 0
for a in [2, 2.5, 2.7, 2.72, 2.8, 3]:
    print(f"a = {a}: slope at 0 ≈ {slope_at_0(a):.6f}")
```

```output
a = 2: slope at 0 ≈ 0.693147
a = 2.5: slope at 0 ≈ 0.916291
a = 2.7: slope at 0 ≈ 0.993252
a = 2.72: slope at 0 ≈ 1.000632
a = 2.8: slope at 0 ≈ 1.029619
a = 3: slope at 0 ≈ 1.098612
```

The slope passes 1 between 2.7 and 2.72. The bisection method of Module 3 closes in on the crossing, keeping at each step the half of the interval where the slope passes 1:

```python
lo, hi = 2.0, 3.0
for step in range(30):
    mid = (lo + hi)/2
    if slope_at_0(mid) < 1:
        lo = mid
    else:
        hi = mid
print(f"e lies between {lo:.10f} and {hi:.10f}")
print(f"math.e is      {math.e:.10f}")
```

```output
e lies between 2.7182818279 and 2.7182818288
math.e is      2.7182818285
```

Thirty halvings shrink the interval to a width of $2^{-30}$, less than $10^{-9}$, and pin $e$ down to eight decimal places, 2.71828182. Compound interest is a poor way to compute $e$ on a computer:

```python
for k in [4, 8, 12, 15, 16]:
    n = 10**k
    print(f"n = 10^{k}: {(1 + 1/n)**n}")
```

```output
n = 10^4: 2.7181459268249255
n = 10^8: 2.7182817983473577
n = 10^12: 2.7185234960372378
n = 10^15: 3.035035206549262
n = 10^16: 1.0
```

Up to $n = 10^8$ the values approach $e$, but then they go wrong, and for $n = 10^{16}$ the answer is 1. The computer stores $1 + 1/n$ rounded to about 16 significant digits: for $n = 10^{16}$ it stores exactly 1, and $1^n = 1$; for $n = 10^{15}$ it stores $1 + 1.11 \times 10^{-15}$, 11% too far from 1, and the power turns that error into $e^{1.11} \approx 3.035$. The cause is the one behind the cancellation error of Module 2: a floating-point number keeps only about 16 significant digits.
:::

```check
holds(log(Rational(27, 10)) < 1); holds(log(Rational(272, 100)) > 1)
holds(Rational(1, 2**30) < Rational(1, 10**9)); holds(Rational(27182818279, 10**10) < E); holds(E < Rational(27182818288, 10**10))
holds(Rational(2**52, 10**15) > Rational(9, 2))             # 10^-15 is nearer 5 * 2^-52 than 4 * 2^-52
stored = 5*Rational(10**15, 2**52)                          # 10^15 * (5 * 2^-52)
rounds(stored, '1.11'); rounds(exp(stored), '3.035')
```

## Derivatives of inverse functions {#inverse-functions}

By Module 1, the graph of an inverse function $f^{-1}$ is the mirror image of the graph of $f$ in the line $y = x$. Reflection carries tangent lines to tangent lines, so it should also tell you the slopes of $f^{-1}$. Reflection in $y = x$ swaps the two coordinates, so it swaps rise and run: a line with slope $\dfrac{\text{rise}}{\text{run}} = m$ becomes a line with slope $\dfrac{\text{run}}{\text{rise}} = \dfrac1m$ (Figure 6.2). So if the graph of $f$ has slope $m$ at $(a, b)$, the graph of $f^{-1}$ should have slope $1/m$ at the mirror point $(b, a)$.

::: figure id=fig-06-2
$y = e^x$ and its inverse $y = \ln x$ are mirror images in the line $y = x$ (dashed). The tangent line to $e^x$ at $\big(\tfrac12, e^{1/2}\big)$ has slope $e^{1/2} \approx 1.65$: run 1, rise 1.65. Its mirror image is the tangent line to $\ln x$ at $\big(e^{1/2}, \tfrac12\big)$, with run 1.65 and rise 1: slope $1/e^{1/2} \approx 0.61$.
:::

```check
rounds(exp(Rational(1, 2)), '1.65'); rounds(exp(-Rational(1, 2)), '0.61')
same(diff(log(x), x).subs(x, exp(Rational(1, 2))), 1/diff(exp(x), x).subs(x, Rational(1, 2)))
```

To turn the picture into a theorem you need one fact about continuity, which this series uses without proof.

::: note
**A fact about inverse functions.** If $f$ is continuous and one-to-one on an open interval $I$, then $f$ is strictly increasing on $I$ or strictly decreasing on $I$, its values form an open interval $J$, and $f^{-1}$ is continuous on $J$. The idea: if $f$ went up and then down, the Intermediate Value Theorem of Module 3 would make it take some value twice; and, as Module 3 noted, the mirror image of an unbroken graph that only rises (or only falls) is again unbroken.
:::

::: theorem The derivative of an inverse function
Let $f$ be continuous and one-to-one on an open interval $I$, and let $a$ be a point of $I$ where $f$ is differentiable with $f'(a) \ne 0$. Then $f^{-1}$ is differentiable at $b = f(a)$, and

$$(f^{-1})'(b) = \frac{1}{f'(a)} = \frac{1}{f'\big(f^{-1}(b)\big)}.$$
:::

::: proof
Let $J$ be the interval of values of $f$, as in the fact above. For $y \ne b$ in $J$, let $x = f^{-1}(y)$. Then $f(x) = y$, and $x \ne a$, because $f^{-1}$ is one-to-one. So

$$\begin{aligned} \frac{f^{-1}(y) - f^{-1}(b)}{y - b} &= \frac{x - a}{f(x) - f(a)} \\ &= \frac{1}{\dfrac{f(x) - f(a)}{x - a}}. \end{aligned}$$

As $y \to b$, $x = f^{-1}(y)$ approaches $f^{-1}(b) = a$, because $f^{-1}$ is continuous, and $x \ne a$. So the difference quotient in the denominator approaches $f'(a)$, which is not 0, and by the limit law for quotients the whole expression approaches $1/f'(a)$.
:::

```check
fF = Function('f')
same((x - a)/(fF(x) - fF(a)), 1/((fF(x) - fF(a))/(x - a)))
gG = Function('g')      # if g is the inverse of f, the chain rule on f(g(x)) = x gives g'(x) = 1/f'(g(x))
same(solve(diff(fF(gG(x)), x) - 1, Derivative(gG(x), x))[0], 1/diff(fF(u), u).subs(u, gG(x)))
yp = symbols('y', positive=True)
same(diff(x**3, x).subs(x, 0), 0); same(real_root(yp, 3)/yp, yp**Rational(-2, 3)); limit_is(yp**Rational(-2, 3), yp, 0, oo, '+')
```

The hypothesis $f'(a) \ne 0$ is needed. $f(x) = x^3$ is one-to-one with $f'(0) = 0$, and its inverse $\sqrt[3]{x}$ has a vertical tangent at 0: for $y > 0$ its difference quotient $\dfrac{\sqrt[3]{y} - 0}{y - 0} = y^{-2/3}$ grows without bound as $y \to 0$. The other hypotheses make sure that $f^{-1}$ exists and is continuous.

::: tip
To remember the formula, suppose that $f^{-1}$ is differentiable, and differentiate both sides of $f\big(f^{-1}(x)\big) = x$ with the chain rule: $f'\big(f^{-1}(x)\big)\cdot(f^{-1})'(x) = 1$, then divide. This derivation assumes what the theorem proves, that $f^{-1}$ is differentiable, so it is a memory aid, not a proof.
:::

::: example An inverse without a formula
In Module 1's [Exercise 1.10](module_01_EN.html#ex-1-10) you showed that $f(x) = x^3 + x$ is strictly increasing on $\R$, so it has an inverse, although solving $x^3 + x = y$ for $x$ is hard. Find $(f^{-1})'(2)$ and $(f^{-1})'(10)$, and the tangent line to the graph of $f^{-1}$ at $(2, 1)$.

$f$ is a polynomial, so it is differentiable, hence continuous, on $\R$, with $f'(x) = 3x^2 + 1 \ge 1$: never 0. To use Theorem 6.4 at $b = 2$, you need $a = f^{-1}(2)$, the solution of $x^3 + x = 2$. Try small whole numbers: $x = 1$ works. So

$$(f^{-1})'(2) = \frac{1}{f'(1)} = \frac{1}{3 + 1} = \frac14.$$

In the same way $f(2) = 8 + 2 = 10$, so $(f^{-1})'(10) = \dfrac{1}{f'(2)} = \dfrac{1}{13}$. The tangent line to the graph of $f^{-1}$ at $(2, 1)$ has slope $\tfrac14$: it is $y = 1 + \tfrac14(x - 2)$, that is, $y = \tfrac14 x + \tfrac12$.

```check
f3 = x**3 + x
same(diff(f3, x), 3*x**2 + 1); same(function_range(3*x**2 + 1, x, S.Reals), Interval(1, oo))
same([s_ for s_ in solve(f3 - 2, x) if s_.is_real], [1]); same(f3.subs(x, 2), 10)
same(1/diff(f3, x).subs(x, 1), Rational(1, 4)); same(1/diff(f3, x).subs(x, 2), Rational(1, 13))
yv = symbols('y_v')
same(idiff(yv**3 + yv - x, yv, x).subs(yv, 1), Rational(1, 4))     # x = y^3 + y, differentiated for y = f^{-1}(x)
same(expand(1 + Rational(1, 4)*(x - 2)), x/4 + Rational(1, 2))
```
:::

::: pitfall
The slope of $f^{-1}$ at $b$ is the reciprocal of the slope of $f$ at the *mirror point* $a = f^{-1}(b)$, not at $b$. In Example 6.2, $(f^{-1})'(2) = \tfrac14$, not $\dfrac{1}{f'(2)} = \dfrac{1}{13}$. First find $a$, then compute $1/f'(a)$.
:::

## Logarithms {#logarithms}

### The derivative of ln x {#derivative-ln}

::: theorem The derivative of the logarithm
For every $x > 0$,
$$\frac{d}{dx}\ln x = \frac1x,$$
and for every $x \ne 0$,
$$\frac{d}{dx}\ln\abs{x} = \frac1x.$$
:::

::: proof
Apply Theorem 6.4 to $f(x) = e^x$ on the open interval $I = \R$. It is differentiable, hence continuous, and one-to-one (Module 1); its derivative $e^x$ is never 0; its values form $J = (0, \infty)$; and its inverse is ${\ln}$. For $b > 0$ let $a = \ln b$. Then

$$(\ln)'(b) = \frac{1}{f'(a)} = \frac{1}{e^{\ln b}} = \frac1b.$$

For $x > 0$, $\ln\abs{x} = \ln x$, with derivative $\tfrac1x$. For $x < 0$, $\ln\abs{x} = \ln(-x)$, and by the chain rule its derivative is $\dfrac{1}{-x}\cdot(-1) = \dfrac1x$.
:::

```check
xp = symbols('x', positive=True); xn = symbols('x', negative=True)
same(diff(log(xp), xp), 1/xp); same(1/exp(log(xp)), 1/xp)
same(diff(log(-xn), xn), 1/xn); same(diff(log(Abs(xn)), xn), 1/xn); same(diff(log(Abs(xp)), xp), 1/xp)
same(diff(log(x), x).subs(x, 1), 1)
```

The graph of $\ln x$ (Figure 6.2) climbs steeply near 0, where $1/x$ is large, and flattens out as $x$ grows; but its slope $1/x$ stays positive, so $\ln x$ keeps increasing, more and more slowly. At $x = 1$ its slope is 1, the mirror image of the slope 1 of $e^x$ at 0. With the chain rule, for a differentiable function $u$ of $x$,

$$\begin{aligned} \frac{d}{dx}\ln u &= \frac{u'}{u} \quad \text{where } u > 0, \\ \frac{d}{dx}\ln\abs{u} &= \frac{u'}{u} \quad \text{where } u \ne 0. \end{aligned}$$

```check
uF = Function('u')
same(diff(log(uF(x)), x), diff(uF(x), x)/uF(x)); same(diff(log(-uF(x)), x), diff(uF(x), x)/uF(x))
```

::: example Derivatives with logarithms
Differentiate (a) $\ln(x^2 + 1)$, (b) $\ln{\abs{\cos x}}$, where $\cos x \ne 0$, and (c) $\ln\dfrac{x^3}{\sqrt{x^2 + 1}}$, for $x > 0$.

**(a)** Here $u = x^2 + 1 > 0$, so $\dfrac{d}{dx}\ln(x^2 + 1) = \dfrac{2x}{x^2 + 1}$.

**(b)** Here $u = \cos x$, so $\dfrac{d}{dx}\ln\abs{\cos x} = \dfrac{-\sin x}{\cos x} = -\tan x$.

**(c)** Use the laws of logarithms first: they turn the quotient and the powers into a sum. For $x > 0$,

$$\ln\frac{x^3}{\sqrt{x^2 + 1}} = 3\ln x - \tfrac12\ln(x^2 + 1),$$

so the derivative is

$$\frac3x - \frac12\cdot\frac{2x}{x^2 + 1} = \frac3x - \frac{x}{x^2 + 1}.$$

```check
same(diff(log(x**2 + 1), x), 2*x/(x**2 + 1))
same(diff(log(cos(x)), x), -sin(x)/cos(x)); same(diff(log(-cos(x)), x), -tan(x))
same(expand_log(log(xp**3/sqrt(xp**2 + 1))), 3*log(xp) - log(xp**2 + 1)/2)
steps(diff(log(xp**3/sqrt(xp**2 + 1)), xp), 3/xp - Rational(1, 2)*2*xp/(xp**2 + 1), 3/xp - xp/(xp**2 + 1))
```
:::

::: pitfall
The derivative of $\ln u$ is $\dfrac{u'}{u}$, not $\dfrac1u$: $\dfrac{d}{dx}\ln(x^2 + 1)$ is not $\dfrac{1}{x^2 + 1}$. And $\dfrac{d}{dx}\ln(5x) = \dfrac{5}{5x} = \dfrac1x$, the same as the derivative of $\ln x$. That is no accident: $\ln(5x) = \ln 5 + \ln x$, so the two functions differ by a constant.

```check
holds(Ne(diff(log(x**2 + 1), x).subs(x, 2), (1/(x**2 + 1)).subs(x, 2)))
steps(diff(log(5*xp), xp), 5/(5*xp), 1/xp); same(expand_log(log(5*xp)), log(5) + log(xp))
```
:::

### Other bases {#other-bases}

For a base $a > 0$ with $a \ne 1$, $\log_a x = \dfrac{\ln x}{\ln a}$ (Module 1), and $\ln a$ is a constant, so for $x > 0$

$$\frac{d}{dx}\log_a x = \frac{1}{x\ln a}.$$

For example $\dfrac{d}{dx}\log_{10} x = \dfrac{1}{x\ln 10} \approx \dfrac{0.4343}{x}$ and $\dfrac{d}{dx}\log_2 x = \dfrac{1}{x\ln 2} \approx \dfrac{1.4427}{x}$. Only the natural logarithm has the factor 1. That is why calculus uses ${\ln}$, as it uses $e^x$: the formulas $\dfrac{d}{dx}a^x = a^x\ln a$ and $\dfrac{d}{dx}\log_a x = \dfrac{1}{x\ln a}$ both lose their factor $\ln a$ exactly when $a = e$.

```check
same(diff(log(xp, ap), xp), 1/(xp*log(ap)))
rounds(1/log(10), '0.4343'); rounds(1/log(2), '1.4427')
same(diff(log(xp, E), xp), 1/xp)
```

### The two routes meet {#two-routes}

Now the compound interest table can be explained. The derivative of $\ln$ at 1 is $\tfrac11 = 1$, and $\ln 1 = 0$, so

$$\lim_{h\to0}\frac{\ln(1 + h)}{h} = \lim_{h\to0}\frac{\ln(1 + h) - \ln 1}{h} = 1.$$

```check
limit_is(log(1 + h)/h, h, 0, 1); same(log(1), 0)
```

::: theorem $e$ as a limit
For every real number $x$,

$$\lim_{n\to\infty}\Big(1 + \frac{x}{n}\Big)^n = e^x,$$

and in particular

$$\lim_{n\to\infty}\Big(1 + \frac1n\Big)^n = e.$$
:::

::: proof
For $x = 0$ both sides are 1. Let $x \ne 0$, and take $n > {\abs{x}}$, so that $1 + x/n > 0$. Every positive number $p$ is $e^{\ln p}$, so $p^n = e^{n\ln p}$, and

$$\Big(1 + \frac{x}{n}\Big)^n = e^{\,n\ln(1 + x/n)}.$$

Write $h = x/n$, so that $n = x/h$. Then

$$n\ln\Big(1 + \frac{x}{n}\Big) = x\cdot\frac{\ln(1 + h)}{h}.$$

As $n \to \infty$, $h \to 0$ with $h \ne 0$, so this approaches $x \cdot 1 = x$. Finally, $e^u$ is continuous (it is differentiable, and Module 4 showed that differentiable functions are continuous), so $e^{\,n\ln(1 + x/n)}$ approaches $e^x$.
:::

```check
limit_is((1 + x/n)**n, n, oo, exp(x)); limit_is((1 + 1/n)**n, n, oo, E)
np_ = symbols('n', positive=True)
same(exp(np_*log(1 + xp/np_)), (1 + xp/np_)**np_)
same((x*log(1 + h)/h).subs(h, x/n), n*log(1 + x/n))
limit_is(n*log(1 + x/n), n, oo, x)
```

So the two routes lead to the same number: the limit of compound interest is the base whose exponential has slope 1 at 0.

::: example Continuous compounding
Suppose you invest £1000 at an interest rate of 5% a year. Compare the balance after one year when interest is added yearly, quarterly, monthly, daily and continuously, and find how long the money takes to double with continuous compounding.

With interest added $n$ times a year, each addition multiplies the balance by $1 + \dfrac{0.05}{n}$, so after one year the balance is $1000\Big(1 + \dfrac{0.05}{n}\Big)^n$ pounds:

```valuetable
n = 1, 4, 12, 365
$1000\Big(1 + \dfrac{0.05}{n}\Big)^n$ = 1000*(1 + 1/(20*n))**n
decimals = 2
---
n | 1000\Big(1 + \dfrac{0.05}{n}\Big)^n
1 | 1050.00
4 | 1050.95
12 | 1051.16
365 | 1051.27
```

By Theorem 6.6 with $x = 0.05$, continuous compounding gives $1000e^{0.05} \approx 1051.27$ pounds after a year: the same as daily compounding, to the penny. After $t$ years with interest added $n$ times a year, the balance is

$$\begin{aligned} &1000\Big(1 + \frac{0.05}{n}\Big)^{nt} \\ &\quad= 1000\Big[\Big(1 + \frac{0.05}{n}\Big)^n\Big]^t, \end{aligned}$$

which approaches $1000\big(e^{0.05}\big)^t = 1000e^{0.05t}$ as $n \to \infty$. It doubles when $e^{0.05t} = 2$, that is, when $0.05t = \ln 2$:

$$t = \frac{\ln 2}{0.05} \approx 13.86 \text{ years}.$$

```check
rounds(1000*exp(Rational(5, 100)), '1051.27'); rounds(1000*(1 + Rational(5, 100)/365)**365, '1051.27')
tp = symbols('t', positive=True)
same(limit(1000*(1 + Rational(5, 100)/n)**(n*tp), n, oo), 1000*exp(Rational(5, 100)*tp))
same(solve(exp(Rational(5, 100)*tp) - 2, tp), [log(2)/Rational(5, 100)]); rounds(log(2)/Rational(5, 100), '13.86')
```
:::

## Implicit differentiation {#implicit}

The circle $x^2 + y^2 = 25$, of radius 5 centred at the origin, is not the graph of a function: it fails the vertical line test of Module 1. But near the point $(3, 4)$ it is one: the upper half of the circle is the graph of $y = \sqrt{25 - x^2}$, and the chain rule gives its slope,

$$\frac{dy}{dx} = \frac{-2x}{2\sqrt{25 - x^2}} = -\frac{x}{\sqrt{25 - x^2}},$$

which at $x = 3$ is $-\tfrac{3}{\sqrt{16}} = -\tfrac34$.

You can find this slope without solving for $y$. Near $(3, 4)$, think of $y$ as a function of $x$, $y = y(x)$, whose graph is that part of the circle. Then $x^2 + y(x)^2 = 25$ for every $x$ near 3: the two sides are the same function of $x$, so they have the same derivative. Differentiate both sides with respect to $x$, with the chain rule on $y^2$:

$$2x + 2y\,\frac{dy}{dx} = 0, \quad\text{so}\quad \frac{dy}{dx} = -\frac{x}{y} \quad (y \ne 0).$$

At $(3, 4)$ this gives $-\tfrac34$ again. The same formula works at every point of the circle with $y \ne 0$: at $(3, -4)$, on the lower half, the slope is $+\tfrac34$. This is **implicit differentiation**: the equation defines $y$ as a function of $x$ only *implicitly*, and you differentiate the equation as it stands. The answer has a geometric meaning (Figure 6.3, left): the radius from the origin to $(x, y)$ has slope $y/x$ (when $x \ne 0$), and the product of the two slopes is $(y/x)(-x/y) = -1$, so the tangent line is perpendicular to the radius, as school geometry says it must be.

```check
same(diff(sqrt(25 - x**2), x), -x/sqrt(25 - x**2)); same((-x/sqrt(25 - x**2)).subs(x, 3), -3/sqrt(16)); same(-3/sqrt(16), -Rational(3, 4))
Yf = Function('Y')
same(diff(x**2 + Yf(x)**2, x), 2*x + 2*Yf(x)*diff(Yf(x), x))
same(idiff(x**2 + y**2 - 25, y, x), -x/y)
same((-x/y).subs({x: 3, y: 4}), -Rational(3, 4)); same((-x/y).subs({x: 3, y: -4}), Rational(3, 4))
same((y/x)*(-x/y), -1); same(3**2 + 4**2, 25)
```

::: figure id=fig-06-3
Left: the circle $x^2 + y^2 = 25$ and its tangent line at $(3, 4)$, perpendicular to the radius. Right: the folium of Descartes, $x^3 + y^3 = 6xy$, with its tangent line at $(3, 3)$, of slope $-1$, and the horizontal tangent line at the top of the loop, $\big(2^{4/3}, 2^{5/3}\big) \approx (2.52, 3.17)$. At the origin the curve crosses itself, and has no single tangent line. Its two arms approach the dashed line $x + y = -2$.
:::

```check
tq = symbols('t_q')
fxq, fyq = 6*tq/(1 + tq**3), 6*tq**2/(1 + tq**3)           # a parametrisation of the folium
same(fxq**3 + fyq**3, 6*fxq*fyq); same((fxq + fyq).subs(tq, 1), 6); same((fxq).subs(tq, 1), 3)
limit_is(fxq + fyq, tq, -1, -2); limit_is(fxq, tq, -1, -oo, '+'); limit_is(fxq, tq, -1, oo, '-')
```

::: keyidea
**Implicit differentiation.** To find $\dfrac{dy}{dx}$ on a curve given by an equation in $x$ and $y$:

1. Differentiate both sides with respect to $x$, treating $y$ as a function of $x$. Every term with $y$ needs the chain rule, as in $\dfrac{d}{dx}y^n = ny^{n-1}\dfrac{dy}{dx}$, and products such as $xy$ need the product rule.
2. Collect the terms with $\dfrac{dy}{dx}$ on one side, and factor it out.
3. Divide by its coefficient, where that coefficient is not 0. The answer usually contains both $x$ and $y$: evaluate it at a point of the curve.
:::

The method assumes that near the point the equation does define $y$ as a differentiable function of $x$. A theorem of several-variable calculus, the implicit function theorem, guarantees this at a point of the curve where the coefficient of $dy/dx$ in step 3 is not 0, provided that the equation is built from functions with continuous derivatives near the point, as every equation in this module is. This series uses the theorem without proof; Module 17 states it precisely. Where the coefficient is 0, look more closely: the circle has vertical tangent lines at $(\pm5, 0)$, where $y = 0$.

::: example The folium of Descartes
The curve $x^3 + y^3 = 6xy$ (Figure 6.3, right) is called the folium (Latin for "leaf") of Descartes. Show that $(3, 3)$ lies on it, find the tangent line there, and find the points where the tangent line is horizontal.

At $(3, 3)$, $x^3 + y^3 = 27 + 27 = 54$ and $6xy = 6 \cdot 3 \cdot 3 = 54$, so the point is on the curve. Differentiate both sides, with the chain rule on $y^3$ and the product rule on $6xy$:

$$3x^2 + 3y^2\,y' = 6y + 6x\,y'.$$

Collect the terms with $y'$ on the left and factor, then divide by $3y^2 - 6x = 3\big(y^2 - 2x\big)$ where it is not 0:

$$\begin{aligned} \big(3y^2 - 6x\big)\,y' &= 6y - 3x^2, \\ y' &= \frac{2y - x^2}{y^2 - 2x} \quad \big(y^2 \ne 2x\big). \end{aligned}$$

At $(3, 3)$, $y' = \dfrac{6 - 9}{9 - 6} = -1$, and the tangent line is $y - 3 = -(x - 3)$, that is, $y = 6 - x$.

The tangent line is horizontal where $y' = 0$: where the numerator $2y - x^2$ is 0 and the denominator is not. Substitute $y = x^2/2$ into the equation of the curve, subtract $x^3$ from both sides, and multiply by 8:

$$\begin{aligned} x^3 + \frac{x^6}{8} &= 6x\cdot\frac{x^2}{2} = 3x^3, \\ x^6 &= 16x^3, \\ x^3\big(x^3 - 16\big) &= 0. \end{aligned}$$

The root $x = 0$ gives the origin, where the denominator $y^2 - 2x$ is 0 too, so the formula says nothing there: the curve crosses itself. The other root, $x^3 = 16$, gives $x = 16^{1/3} = 2^{4/3} \approx 2.520$ and $y = \tfrac12 x^2 = \tfrac12 \cdot 2^{8/3} = 2^{5/3} \approx 3.175$. There the denominator is $2^{10/3} - 2 \cdot 2^{4/3} = 2^{10/3} - 2^{7/3} = 2^{7/3}$, which is not 0. So the tangent line is horizontal at exactly one point, $\big(2^{4/3}, 2^{5/3}\big)$, the top of the loop. Swapping $x$ and $y$ leaves the equation unchanged, so the mirror point $\big(2^{5/3}, 2^{4/3}\big)$ has a vertical tangent line.

```check
fol = x**3 + y**3 - 6*x*y
same(fol.subs({x: 3, y: 3}), 0)
same(diff(x**3 + Yf(x)**3, x), 3*x**2 + 3*Yf(x)**2*diff(Yf(x), x)); same(diff(6*x*Yf(x), x), 6*Yf(x) + 6*x*diff(Yf(x), x))
yd = symbols('yd')
same(solve(Eq((3*y**2 - 6*x)*yd, 6*y - 3*x**2), yd)[0], (2*y - x**2)/(y**2 - 2*x))
same(idiff(fol, y, x), (2*y - x**2)/(y**2 - 2*x))
same(((2*y - x**2)/(y**2 - 2*x)).subs({x: 3, y: 3}), -1); same(expand(3 - (x - 3)), 6 - x)
same(3*y**2 - 6*x, 3*(y**2 - 2*x))
same(expand(x**3 + (x**2/2)**3 - 6*x*(x**2/2)), x**6/8 - 2*x**3); same(expand(8*(x**6/8 - 2*x**3)), x**6 - 16*x**3)
same(factor(x**6 - 16*x**3), x**3*(x**3 - 16))
x0 = Integer(2)**Rational(4, 3); y0 = Integer(2)**Rational(5, 3)
same(Integer(16)**Rational(1, 3), x0); same(x0**2/2, y0); rounds(x0, '2.520'); rounds(y0, '3.175'); rounds(x0, '2.52'); rounds(y0, '3.17')
steps(y0**2 - 2*x0, Integer(2)**Rational(10, 3) - Integer(2)**Rational(7, 3), Integer(2)**Rational(7, 3))
same(fol.subs({x: x0, y: y0}), 0); same(fol.subs({x: y0, y: x0}), 0)
same_set([s_ for s_ in solve(x**3*(x**3 - 16), x) if s_.is_real], [0, x0])
```
:::

::: pitfall
When you differentiate an equation implicitly, $y$ is a function of $x$: $\dfrac{d}{dx}y^2 = 2y\,y'$, not $2y$, and $\dfrac{d}{dx}(xy) = y + x\,y'$ by the product rule, not $y'$. Differentiate *both* sides: the derivative of the constant 25 is 0, not 25.

```check
same(diff(Yf(x)**2, x), 2*Yf(x)*diff(Yf(x), x)); same(diff(x*Yf(x), x), Yf(x) + x*diff(Yf(x), x)); same(diff(25, x), 0)
```
:::

## Inverse trigonometric functions {#inverse-trig}

To solve $\sin\theta = \tfrac12$ for an angle you need an inverse of the sine. But the sine is not one-to-one: $\sin\theta = \tfrac12$ for $\theta = \pi/6$, $5\pi/6$, $13\pi/6$ and infinitely many other angles. As with $x^2$ in Module 1, restrict the domain to an interval on which the function is one-to-one and takes each of its values once. For the sine the standard choice is $[-\pi/2, \pi/2]$, where it increases from $-1$ to 1; for the cosine, $[0, \pi]$, where it decreases from 1 to $-1$; and for the tangent, $(-\pi/2, \pi/2)$, where it increases through every real value (Figure 6.4).

```check
same([sin(pi/6), sin(5*pi/6), sin(13*pi/6)], [Rational(1, 2)]*3)
same(sin(-pi/2), -1); same(sin(pi/2), 1); same(cos(0), 1); same(cos(pi), -1)
same(function_range(tan(x), x, Interval.open(-pi/2, pi/2)), S.Reals)
```

::: definition Inverse trigonometric functions
- For $-1 \le x \le 1$, $\arcsin x$ is the number $y$ in $[-\pi/2, \pi/2]$ with $\sin y = x$.
- For $-1 \le x \le 1$, $\arccos x$ is the number $y$ in $[0, \pi]$ with $\cos y = x$.
- For every real $x$, $\arctan x$ is the number $y$ in $(-\pi/2, \pi/2)$ with $\tan y = x$.

They are read "arc sine of x", "arc cosine of x" and "arc tangent of x". Their domains are $[-1, 1]$, $[-1, 1]$ and $\R$, and their ranges $[-\pi/2, \pi/2]$, $[0, \pi]$ and $(-\pi/2, \pi/2)$.
:::

The name says what $\arcsin x$ is: the arc, that is, the angle in radians, whose sine is $x$. Since $\arcsin$ undoes the restricted sine, $\sin(\arcsin x) = x$ for every $x$ in $[-1, 1]$; but $\arcsin(\sin\theta) = \theta$ only for $\theta$ in $[-\pi/2, \pi/2]$ (Example 6.6). The same holds for the other two, with their own intervals.

```check
same(function_range(asin(x), x, Interval(-1, 1)), Interval(-pi/2, pi/2)); same(function_range(acos(x), x, Interval(-1, 1)), Interval(0, pi))
limit_is(atan(x), x, oo, pi/2); limit_is(atan(x), x, -oo, -pi/2)
for v_ in (Rational(-9, 10), Rational(-1, 2), 0, Rational(3, 10), 1):
    same(sin(asin(v_)), v_); same(cos(acos(v_)), v_); same(tan(atan(4*v_)), 4*v_)
```

::: figure id=fig-06-4
The inverse trigonometric functions. In each panel the part of the trigonometric function that is inverted (orange) and its inverse (blue) are mirror images in the line $y = x$ (dashed). Left: $\sin x$ on $[-\pi/2, \pi/2]$ and $\arcsin x$. Middle: $\cos x$ on $[0, \pi]$ and $\arccos x$. Right: $\tan x$ on $(-\pi/2, \pi/2)$ and $\arctan x$, whose graph has the horizontal asymptotes $y = \pm\pi/2$.
:::

::: pitfall
Many books and calculators write $\sin^{-1}x$ for $\arcsin x$ (and $\cos^{-1}x$, $\tan^{-1}x$). This $-1$ means "inverse function", as in $f^{-1}$; it is not an exponent, so $\sin^{-1}x$ is not $(\sin x)^{-1} = \dfrac{1}{\sin x}$. The notation clashes with $\sin^2 x$, which does mean $(\sin x)^2$. For $x = \tfrac12$: $\arcsin\tfrac12 = \tfrac{\pi}{6} \approx 0.524$, while $\dfrac{1}{\sin(1/2)} \approx 2.086$. This series writes ${\arcsin}$.

```check
same(asin(Rational(1, 2)), pi/6); rounds(pi/6, '0.524'); rounds(1/sin(Rational(1, 2)), '2.086')
```
:::

::: example Values of the inverse trigonometric functions
Find (a) $\arcsin\tfrac12$, (b) $\arccos\big(-\tfrac12\big)$, (c) $\arctan(-1)$ and (d) $\arcsin\big(\sin\tfrac{3\pi}{4}\big)$.

**(a)** The angle in $[-\pi/2, \pi/2]$ whose sine is $\tfrac12$ is $\pi/6$ (Module 1's table): $\arcsin\tfrac12 = \tfrac{\pi}{6}$.

**(b)** $\cos\tfrac{\pi}{3} = \tfrac12$ and $\cos(\pi - \theta) = -\cos\theta$, so $\cos\tfrac{2\pi}{3} = -\tfrac12$; and $\tfrac{2\pi}{3}$ is in $[0, \pi]$. So $\arccos\big(-\tfrac12\big) = \tfrac{2\pi}{3}$.

**(c)** $\tan\big(-\tfrac{\pi}{4}\big) = -\tan\tfrac{\pi}{4} = -1$, and $-\tfrac{\pi}{4}$ is in $(-\pi/2, \pi/2)$: $\arctan(-1) = -\tfrac{\pi}{4}$.

**(d)** $\sin\tfrac{3\pi}{4} = \tfrac{\sqrt2}{2}$, so $\arcsin\big(\sin\tfrac{3\pi}{4}\big) = \arcsin\tfrac{\sqrt2}{2} = \tfrac{\pi}{4}$, not $\tfrac{3\pi}{4}$: $\arcsin$ always returns an angle in $[-\pi/2, \pi/2]$, and $\tfrac{3\pi}{4}$ is not one.

```check
same(asin(Rational(1, 2)), pi/6); same(sin(pi/6), Rational(1, 2))
same(cos(pi/3), Rational(1, 2)); same(cos(2*pi/3), -Rational(1, 2)); same(acos(-Rational(1, 2)), 2*pi/3)
same(tan(-pi/4), -1); same(atan(-1), -pi/4)
same(sin(3*pi/4), sqrt(2)/2); same(asin(sin(3*pi/4)), pi/4); holds(3*pi/4 > pi/2)
```
:::

::: theorem Derivatives of the inverse trigonometric functions
$$\begin{aligned} \frac{d}{dx}\arcsin x &= \frac{1}{\sqrt{1 - x^2}}, \\ \frac{d}{dx}\arccos x &= -\frac{1}{\sqrt{1 - x^2}}, \\ \frac{d}{dx}\arctan x &= \frac{1}{1 + x^2}, \end{aligned}$$

the first two for $-1 < x < 1$, the third for every real $x$.
:::

::: proof
The sine is differentiable, hence continuous, and one-to-one on the open interval $(-\pi/2, \pi/2)$, with derivative $\cos y > 0$ there, and its values there form $(-1, 1)$. By Theorem 6.4, $\arcsin$ is differentiable at every $x$ in $(-1, 1)$, and with $y = \arcsin x$,

$$\frac{d}{dx}\arcsin x = \frac{1}{\cos y}.$$

To write this in terms of $x$: $\cos^2 y = 1 - \sin^2 y = 1 - x^2$, and $\cos y > 0$ because $y$ is in $(-\pi/2, \pi/2)$, so $\cos y$ is the positive square root, $\sqrt{1 - x^2}$.

For ${\arccos}$, use the cosine on $(0, \pi)$, with derivative $-\sin y < 0$; there $\sin y > 0$, so $\sin y = \sqrt{1 - \cos^2 y} = \sqrt{1 - x^2}$ and $(\arccos x)' = -1/\sqrt{1 - x^2}$. For ${\arctan}$, use the tangent on $(-\pi/2, \pi/2)$, with derivative $\sec^2 y$ (Module 5). Dividing $\cos^2 y + \sin^2 y = 1$ by $\cos^2 y$ gives $\sec^2 y = 1 + \tan^2 y = 1 + x^2$, so $(\arctan x)' = 1/(1 + x^2)$.
:::

```check
same(diff(asin(x), x), 1/sqrt(1 - x**2)); same(diff(acos(x), x), -1/sqrt(1 - x**2)); same(diff(atan(x), x), 1/(1 + x**2))
same(1/cos(asin(x)), 1/sqrt(1 - x**2)); same(-1/sin(acos(x)), -1/sqrt(1 - x**2))
same(1/sec(atan(x))**2, 1/(1 + x**2)); same(sec(y)**2, 1 + tan(y)**2); same(diff(tan(y), y), sec(y)**2)
```

At $x = \pm1$ the derivative of the sine, $\cos(\pm\pi/2)$, is 0, so Theorem 6.4 does not apply, and the graphs of $\arcsin$ and $\arccos$ have vertical tangent lines there (Figure 6.4). The derivatives of $\arcsin$ and $\arccos$ add up to 0 because $\arcsin x + \arccos x = \pi/2$ for every $x$ in $[-1, 1]$: if $y = \arcsin x$, then $\pi/2 - y$ lies in $[0, \pi]$ and $\cos(\pi/2 - y) = \sin y = x$ by the addition formula, so $\arccos x = \pi/2 - y$.

```check
same(cos(pi/2), 0); limit_is(diff(asin(x), x), x, 1, oo, '-'); limit_is(diff(asin(x), x), x, -1, oo, '+')
same(expand_trig(cos(pi/2 - y)), sin(y)); same(diff(asin(x) + acos(x), x), 0)
for v_ in (-1, Rational(-1, 2), 0, Rational(1, 2), sqrt(3)/2, 1):
    same(asin(v_) + acos(v_), pi/2)
```

::: example The angle of a rising balloon
A balloon rises vertically from a point on level ground 100 metres from you. When it is $h$ metres up, you see it at the angle of elevation $\theta = \arctan\dfrac{h}{100}$ radians. How fast does $\theta$ change with $h$, at $h = 0$ and at $h = 100$?

By the chain rule, with the inner function $h/100$,

$$\begin{aligned} \frac{d\theta}{dh} &= \frac{1}{1 + (h/100)^2}\cdot\frac{1}{100} \\ &= \frac{100}{100^2 + h^2}, \end{aligned}$$

after multiplying the top and the bottom by $100^2$. At $h = 0$ this is $\dfrac{100}{10{,}000} = 0.01$ radians per metre. At $h = 100$, where $\theta = \arctan 1 = \pi/4$, it is $\dfrac{100}{20{,}000} = 0.005$ radians per metre, about $0.29^\circ$ per metre. Each metre of height changes the angle less as the balloon climbs. Module 7 brings in time, and asks how fast the angle changes per second.

```check
Hh = symbols('H', nonnegative=True)
th_ = atan(Hh/100)
steps(diff(th_, Hh), 1/(1 + (Hh/100)**2)*Rational(1, 100), 100/(100**2 + Hh**2))
same((100/(100**2 + Hh**2)).subs(Hh, 0), Rational(1, 100)); same((100/(100**2 + Hh**2)).subs(Hh, 100), Rational(5, 1000))
same(th_.subs(Hh, 100), pi/4); rounds(Rational(5, 1000)*180/pi, '0.29')
```
:::

::: note
Three more inverse functions, ${\arccot}$, $\arcsec$ and ${\arccsc}$, are used less, and books disagree about their ranges. The values of the secant are the numbers $x$ with $\abs{x} \ge 1$. For such $x$, this series takes $\arcsec x$ to be the angle $y$ in $[0, \pi/2) \cup (\pi/2, \pi]$ with $\sec y = x$, that is, $\arcsec x = \arccos(1/x)$. For $\abs{x} > 1$ the chain rule then gives

$$\begin{aligned} &\frac{d}{dx}\arcsec x \\ &\quad= -\frac{1}{\sqrt{1 - 1/x^2}}\cdot\Big(-\frac{1}{x^2}\Big) \\ &\quad= \frac{1}{x^2\sqrt{1 - 1/x^2}} = \frac{1}{\abs{x}\sqrt{x^2 - 1}}, \end{aligned}$$

because $x^2 = \abs{x}\sqrt{x^2}$ (Module 1) and $\sqrt{x^2}\sqrt{1 - 1/x^2} = \sqrt{x^2 - 1}$. The absolute value matters: $\arcsec$ increases on both pieces of its domain, so its slope is positive for $x < -1$ too. Other books choose the range $[0, \pi/2) \cup [\pi, 3\pi/2)$, and then the derivative is $\dfrac{1}{x\sqrt{x^2 - 1}}$, negative for $x < -1$. When you meet one of these functions elsewhere, check which range the book uses.
:::

```check
xm = symbols('x', negative=True); xq_ = symbols('x', positive=True)
for v_ in (Integer(-3), Integer(-1), Integer(1), Rational(5, 2)):
    same(sec(acos(1/v_)), v_)                                    # arccos(1/x) is an angle whose secant is x
holds(acos(-Rational(1, 3)) > pi/2); same(acos(-1), pi); same(acos(1), 0)
for X_ in (xm, xq_):
    steps(diff(acos(1/X_), X_), -1/sqrt(1 - 1/X_**2)*(-1/X_**2), 1/(X_**2*sqrt(1 - 1/X_**2)), 1/(Abs(X_)*sqrt(X_**2 - 1)))
    same(X_**2, Abs(X_)*sqrt(X_**2)); same(sqrt(X_**2)*sqrt(1 - 1/X_**2), sqrt(X_**2 - 1))
holds((1/(Abs(xm)*sqrt(xm**2 - 1))).subs(xm, -2) > 0)            # for x < -1 the two choices give derivatives of opposite signs
same(diff(2*pi - acos(1/xm), xm), 1/(xm*sqrt(xm**2 - 1))); holds((1/(xm*sqrt(xm**2 - 1))).subs(xm, -2) < 0)
same((2*pi - acos(1/xm)).subs(xm, -1), pi); same(sec(2*pi - acos(-Rational(1, 3))), -3)
```

## Logarithmic differentiation {#log-differentiation}

### The power rule for real exponents {#real-powers}

Modules 4 and 5 proved that $\dfrac{d}{dx}x^n = nx^{n-1}$ for every integer $n$, positive, negative or zero. With $e^x$ and $\ln x$ the rule extends to every real exponent.

::: theorem The power rule for real exponents
For every real number $r$ and every $x > 0$,
$$\frac{d}{dx}x^r = r\,x^{r-1}.$$
:::

::: proof
For $x > 0$, $x = e^{\ln x}$, so by the law $(a^u)^v = a^{uv}$, $x^r = e^{r\ln x}$. By the chain rule and Theorem 6.5,

$$\frac{d}{dx}x^r = e^{r\ln x}\cdot\frac{r}{x} = x^r\cdot\frac{r}{x} = r\,x^{r-1}.$$
:::

```check
rr = symbols('r', real=True)
same(exp(rr*log(xp)), xp**rr)
steps(diff(exp(rr*log(xp)), xp), exp(rr*log(xp))*rr/xp, xp**rr*rr/xp, rr*xp**(rr - 1))
```

So $\dfrac{d}{dx}\sqrt{x} = \dfrac{d}{dx}x^{1/2} = \dfrac{1}{2}x^{-1/2} = \dfrac{1}{2\sqrt x}$, and $\dfrac{d}{dx}x^{\sqrt2} = \sqrt2\,x^{\sqrt2 - 1}$. Where $x^r$ is also defined for negative $x$, as $x^{1/3} = \sqrt[3]{x}$ is, the same formula holds there too: for $x < 0$ write $\sqrt[3]{x} = -\sqrt[3]{-x}$ and use the chain rule.

```check
same(diff(sqrt(xp), xp), 1/(2*sqrt(xp))); same(diff(xp**sqrt(2), xp), sqrt(2)*xp**(sqrt(2) - 1))
same(real_root(xn, 3), -(-xn)**Rational(1, 3))
same(diff(-(-xn)**Rational(1, 3), xn), Rational(1, 3)*real_root(xn, 3)**(-2))     # (1/3) x^(-2/3) for x < 0
```

Four functions look alike:

| Function | What it is | Derivative |
|---|---|---|
| $e^2$ | a constant | $0$ |
| $x^e$ | a power: variable base, constant exponent | $e\,x^{e-1}$ |
| $e^x$ | an exponential: constant base, variable exponent | $e^x$ |
| $x^x$ | variable base and variable exponent | Example 6.8 |

```check
same(diff(exp(2), x), 0); same(diff(xp**E, xp), E*xp**(E - 1)); same(diff(exp(x), x), exp(x))
```

For $x^x$ neither the power rule nor the rule for exponentials applies. Taking logarithms turns the exponent into a factor.

::: example The derivative of $x^x$
Differentiate $y = x^x$ for $x > 0$, and find where its tangent line is horizontal.

Since $y > 0$, you may take $\ln$ of both sides: $\ln y = \ln\big(x^x\big) = x\ln x$. The function $y$ is differentiable, because $x^x = e^{x\ln x}$, as in the proof of Theorem 6.8. So you may differentiate both sides with respect to $x$: on the left with the chain rule and Theorem 6.5, as in implicit differentiation, and on the right with the product rule:

$$\frac{y'}{y} = 1\cdot\ln x + x\cdot\frac1x = \ln x + 1.$$

Multiply by $y = x^x$:

$$\frac{d}{dx}x^x = x^x(\ln x + 1).$$

The factor $x^x$ is never 0, so the tangent line is horizontal exactly where $\ln x = -1$: at $x = e^{-1} = 1/e \approx 0.368$, where $y = (1/e)^{1/e} = e^{-1/e} \approx 0.692$.

```check
same(expand_log(log(xp**xp)), xp*log(xp)); same(exp(xp*log(xp)), xp**xp); same(diff(xp*log(xp), xp), log(xp) + 1)
same(diff(xp**xp, xp), xp**xp*(log(xp) + 1))
same(solve(log(xp) + 1, xp), [exp(-1)]); rounds(exp(-1), '0.368')
same((1/E)**(1/E), exp(-1/E)); rounds(exp(-1/E), '0.692')
```
:::

::: keyidea
**Logarithmic differentiation.** To differentiate a function $y$ built from products, quotients and powers, perhaps with the variable in an exponent: take $\ln{\abs{y}}$, expand it with the laws of logarithms, differentiate (the left side gives $y'/y$, by Theorem 6.5), and multiply by $y$. It works wherever $y \ne 0$ and the pieces that $y$ is built from are differentiable; where $y > 0$, $\ln y$ will do in place of $\ln{\abs{y}}$.
:::

::: example A product and a quotient
Find $y'(1)$ for

$$y = \frac{x^2(x + 1)^3}{\sqrt{x^2 + 3}}, \quad x > 0.$$

For $x > 0$ every factor is positive, so $y > 0$, and by the laws of logarithms

$$\begin{aligned} \ln y = {} & 2\ln x + 3\ln(x + 1) \\ & - \tfrac12\ln\big(x^2 + 3\big). \end{aligned}$$

Differentiate both sides:

$$\frac{y'}{y} = \frac2x + \frac{3}{x + 1} - \frac{x}{x^2 + 3}.$$

At $x = 1$, $y(1) = \dfrac{1 \cdot 8}{\sqrt4} = 4$ and $\dfrac{y'}{y} = 2 + \dfrac32 - \dfrac14 = \dfrac{13}{4}$, so $y'(1) = 4 \cdot \dfrac{13}{4} = 13$. The product and quotient rules give the same answer, with much more algebra.

```check
yq = xp**2*(xp + 1)**3/sqrt(xp**2 + 3)
same(expand_log(log(yq), force=True), 2*log(xp) + 3*log(xp + 1) - log(xp**2 + 3)/2)
same(diff(log(yq), xp), 2/xp + 3/(xp + 1) - xp/(xp**2 + 3))
same(yq.subs(xp, 1), 4); same((2/xp + 3/(xp + 1) - xp/(xp**2 + 3)).subs(xp, 1), Rational(13, 4))
same(diff(yq, xp).subs(xp, 1), 13)
```
:::

::: pitfall
$\dfrac{d}{dx}x^x$ is not $x \cdot x^{x-1}$ (the power rule, which needs a constant exponent), and not $x^x\ln x$ (the rule for exponentials, which needs a constant base). The right answer, $x^x\ln x + x^x$, is the sum of the two: each rule accounts for one of the places where $x$ appears. And take the logarithm only of a positive quantity: $\ln y$ needs $y > 0$; otherwise use $\ln{\abs{y}}$.

```check
same(xp*xp**(xp - 1), xp**xp); same(xp**xp*log(xp) + xp*xp**(xp - 1), diff(xp**xp, xp))
```
:::

::: compute Derivatives with SymPy
SymPy knows every derivative of this module. Declaring $x$ positive lets it use the rules that need $x > 0$:

```python
import sympy as sp
x = sp.symbols('x', positive=True)
for f in [2**x, sp.log(x, 10), x**sp.E, x**x, sp.asin(x), sp.tanh(x)]:
    print(f, '  ->  ', sp.diff(f, x))
```

```output
2**x   ->   2**x*log(2)
log(x)/log(10)   ->   1/(x*log(10))
x**E   ->   E*x**E/x
x**x   ->   x**x*(log(x) + 1)
asin(x)   ->   1/sqrt(1 - x**2)
tanh(x)   ->   1 - tanh(x)**2
```

SymPy writes `log` for ${\ln}$, `E` for $e$ and `asin` for ${\arcsin}$, and its forms can differ from the page's. It turns `log(x, 10)` into `log(x)/log(10)` before differentiating; `E*x**E/x` is $e\,x^{e-1}$; and `1 - tanh(x)**2` equals $1/\cosh^2 x$ (Section 6.7). `idiff` does implicit differentiation:

```python
X, Y = sp.symbols('x y')
slope = sp.idiff(X**3 + Y**3 - 6*X*Y, Y, X)     # dy/dx on the folium of Descartes
print(slope)
print(slope.subs({X: 3, Y: 3}))
```

```output
(x**2 - 2*y)/(2*x - y**2)
-1
```

The fraction $\dfrac{x^2 - 2y}{2x - y^2}$ is Example 6.5's $\dfrac{2y - x^2}{y^2 - 2x}$ with its top and bottom multiplied by $-1$.
:::

```check
same(E*xp**E/xp, E*xp**(E - 1)); same(1 - tanh(x)**2, 1/cosh(x)**2)
same((x**2 - 2*y)/(2*x - y**2), (2*y - x**2)/(y**2 - 2*x))
```

## Hyperbolic functions {#hyperbolic}

Two combinations of $e^x$ and $e^{-x}$ turn up so often in science and engineering that they have names.

::: definition Hyperbolic functions
For every real $x$,

$$\begin{aligned} \sinh x &= \frac{e^x - e^{-x}}{2}, \\ \cosh x &= \frac{e^x + e^{-x}}{2}, \\ \tanh x &= \frac{\sinh x}{\cosh x} = \frac{e^x - e^{-x}}{e^x + e^{-x}}. \end{aligned}$$

They are the **hyperbolic sine**, **hyperbolic cosine** and **hyperbolic tangent**, read "hyperbolic sine of x" and so on.
:::

```check
same(sinh(x), (exp(x) - exp(-x))/2); same(cosh(x), (exp(x) + exp(-x))/2)
same(tanh(x), sinh(x)/cosh(x)); same(tanh(x).rewrite(exp), (exp(x) - exp(-x))/(exp(x) + exp(-x)))
```

Their graphs are in Figure 6.5 (left). $\cosh x$ is even, with lowest value $\cosh 0 = 1$; $\sinh x$ is odd and increasing, with $\sinh 0 = 0$; $\tanh x$ is odd and increasing, and lies between $-1$ and 1, approaching 1 as $x \to \infty$ and $-1$ as $x \to -\infty$. For large $x$, $e^{-x}$ is tiny, so $\cosh x$ and $\sinh x$ are both close to $\tfrac12 e^x$. The S-shaped $\tanh$ is one of the standard activation functions of neural networks.

```check
same(cosh(-x), cosh(x)); same(sinh(-x), -sinh(x)); same(tanh(-x), -tanh(x)); same(cosh(0), 1); same(sinh(0), 0)
same(function_range(cosh(x), x, S.Reals), Interval(1, oo)); same(function_range(tanh(x), x, S.Reals), Interval.open(-1, 1))
limit_is(tanh(x), x, oo, 1); limit_is(tanh(x), x, -oo, -1)
limit_is(cosh(x) - exp(x)/2, x, oo, 0); limit_is(sinh(x) - exp(x)/2, x, oo, 0)
```

::: theorem Hyperbolic identity and derivatives
For every real $x$,

$$\cosh^2 x - \sinh^2 x = 1,$$

and

$$\begin{aligned} \frac{d}{dx}\sinh x &= \cosh x, \\ \frac{d}{dx}\cosh x &= \sinh x, \\ \frac{d}{dx}\tanh x &= \frac{1}{\cosh^2 x} = 1 - \tanh^2 x. \end{aligned}$$
:::

::: proof
Expand the squares, using $e^x e^{-x} = 1$:

$$\begin{aligned} \cosh^2 x &= \frac{e^{2x} + 2 + e^{-2x}}{4}, \\ \sinh^2 x &= \frac{e^{2x} - 2 + e^{-2x}}{4}. \end{aligned}$$

In the difference $\cosh^2 x - \sinh^2 x$ everything cancels except $\tfrac24 - \big(-\tfrac24\big) = 1$.

Since $\dfrac{d}{dx}e^{-x} = -e^{-x}$, the derivative of $\sinh x$ is $\dfrac{e^x + e^{-x}}{2} = \cosh x$, and that of $\cosh x$ is $\dfrac{e^x - e^{-x}}{2} = \sinh x$. By the quotient rule and the identity,

$$\begin{aligned} \frac{d}{dx}\tanh x &= \frac{\cosh^2 x - \sinh^2 x}{\cosh^2 x} \\ &= \frac{1}{\cosh^2 x}, \end{aligned}$$

and dividing the identity by $\cosh^2 x$ gives $1 - \tanh^2 x = \dfrac{1}{\cosh^2 x}$.
:::

```check
same(expand(((exp(x) + exp(-x))/2)**2), (exp(2*x) + 2 + exp(-2*x))/4); same(expand(((exp(x) - exp(-x))/2)**2), (exp(2*x) - 2 + exp(-2*x))/4)
steps(cosh(x)**2 - sinh(x)**2, (exp(2*x) + 2 + exp(-2*x))/4 - (exp(2*x) - 2 + exp(-2*x))/4, 1); same(Rational(2, 4) - (-Rational(2, 4)), 1)
same(diff((exp(x) - exp(-x))/2, x), (exp(x) + exp(-x))/2); same(diff((exp(x) + exp(-x))/2, x), (exp(x) - exp(-x))/2)
same(diff(sinh(x), x), cosh(x)); same(diff(cosh(x), x), sinh(x))
steps(diff(sinh(x)/cosh(x), x), (cosh(x)*cosh(x) - sinh(x)*sinh(x))/cosh(x)**2, (cosh(x)**2 - sinh(x)**2)/cosh(x)**2, 1/cosh(x)**2, 1 - tanh(x)**2)
```

The identity explains the name. The point $(\cos t, \sin t)$ lies on the circle $x^2 + y^2 = 1$; the point $(\cosh t, \sinh t)$ lies on the **hyperbola** $x^2 - y^2 = 1$, on its right-hand branch, since $\cosh t \ge 1$. The formulas mirror those of trigonometry with changes of sign: $\cos' = -\sin$ but $\cosh' = {\sinh}$, and $\cos^2 + \sin^2 = 1$ but $\cosh^2 - \sinh^2 = 1$. The other three hyperbolic functions, $\sech x = 1/\cosh x$, $\csch x = 1/\sinh x$ and $\coth x = \cosh x/\sinh x$ (the last two for $x \ne 0$), are used less. With them, $(\tanh x)' = \sech^2 x$, and the quotient rule gives, in the same way, $(\coth x)' = -\csch^2 x$, $(\sech x)' = -\sech x\tanh x$ and $(\csch x)' = -\csch x\coth x$.

```check
same((cosh(t))**2 - (sinh(t))**2, 1); same(diff(tanh(x), x), sech(x)**2)
same(sech(x), 1/cosh(x)); same(csch(x), 1/sinh(x)); same(coth(x), cosh(x)/sinh(x))
same(diff(coth(x), x), -csch(x)**2); same(diff(sech(x), x), -sech(x)*tanh(x)); same(diff(csch(x), x), -csch(x)*coth(x))
same(diff(cosh(x)/sinh(x), x), -1/sinh(x)**2); same(diff(1/cosh(x), x), -(1/cosh(x))*tanh(x)); same(diff(1/sinh(x), x), -(1/sinh(x))*(cosh(x)/sinh(x)))
```

### The hanging chain {#hanging-chain}

A chain or cable hanging freely between two supports, under its own weight, takes the shape of a **catenary** (from the Latin for "chain"): with its lowest point at $(0, a)$, its equation is

$$y = a\cosh\frac{x}{a},$$

where the constant $a > 0$ is the horizontal tension in the chain divided by its weight per unit length. Deriving this needs arc length (Module 12) and differential equations (Module 13). Figure 6.5 (right) compares a catenary with a parabola: they look alike, but they are different curves.

::: figure id=fig-06-5
Left: the graphs of $\cosh x$, $\sinh x$ and $\tanh x$. For large $x$, $\cosh x$ and $\sinh x$ both approach $\tfrac12 e^x$ (dotted), and $\tanh x$ approaches 1. Right: the catenary $y = \cosh x$ for $-2 \le x \le 2$ (blue), the shape of a chain hanging between two supports, and the parabola through its lowest point and its two ends (orange, dashed). The catenary is flatter at the bottom and steeper at the ends.
:::

```check
par = 1 + (cosh(2) - 1)*x**2/4
same(par.subs(x, 0), 1); same(par.subs(x, 2), cosh(2)); same(par.subs(x, -2), cosh(2))
holds(diff(cosh(x), x, 2).subs(x, 0) < diff(par, x, 2))          # flatter at the bottom
holds(diff(cosh(x), x).subs(x, 2) > diff(par, x).subs(x, 2))      # steeper at the ends
holds(cosh(1) < par.subs(x, 1))
```

What you can check now is the differential equation that the catenary satisfies.

::: example The hanging chain
Show that $y = a\cosh(x/a)$, with $a > 0$, satisfies

$$y'' = \frac1a\sqrt{1 + (y')^2},$$

the equation that a hanging chain obeys.

By the chain rule and Theorem 6.9, $y' = a\sinh\dfrac{x}{a}\cdot\dfrac1a = \sinh\dfrac{x}{a}$, and $y'' = \dfrac1a\cosh\dfrac{x}{a}$. On the other side, by the identity, $1 + (y')^2 = 1 + \sinh^2\dfrac{x}{a} = \cosh^2\dfrac{x}{a}$, and since $\cosh$ is positive, $\sqrt{1 + (y')^2} = \cosh\dfrac{x}{a}$. So both sides equal $\dfrac1a\cosh\dfrac{x}{a}$.

```check
yc = ap*cosh(xr/ap)
same(diff(yc, xr), sinh(xr/ap)); same(diff(yc, xr, 2), cosh(xr/ap)/ap)
same(1 + sinh(xr/ap)**2, cosh(xr/ap)**2); same(sqrt(1 + diff(yc, xr)**2), cosh(xr/ap))
same(diff(yc, xr, 2), sqrt(1 + diff(yc, xr)**2)/ap)
```
:::

::: pitfall
Two sign slips. $\dfrac{d}{dx}\cosh x = +\sinh x$, unlike $\dfrac{d}{dx}\cos x = -\sin x$; and the identity is $\cosh^2 x - \sinh^2 x = 1$, with a minus sign. To test a formula, try $x = \ln 2$, where $\cosh x = \tfrac54$ and $\sinh x = \tfrac34$: $\big(\tfrac54\big)^2 - \big(\tfrac34\big)^2 = 1$, while $\big(\tfrac54\big)^2 + \big(\tfrac34\big)^2 = \tfrac{17}{8}$.

```check
same(cosh(log(2)), Rational(5, 4)); same(sinh(log(2)), Rational(3, 4))
same(Rational(5, 4)**2 - Rational(3, 4)**2, 1); same(Rational(5, 4)**2 + Rational(3, 4)**2, Rational(17, 8))
```
:::

## Exponential growth and decay {#growth-decay}

By Theorem 6.1, an exponential changes at a rate proportional to its size. Many quantities behave like that: a population with plenty of food and space grows at a rate proportional to its size, money earning continuous interest grows at a rate proportional to the balance, and a radioactive substance decays at a rate proportional to the amount left. Each is described by the equation

$$\frac{dy}{dt} = ky,$$

where $k$ is a constant. This is a **differential equation**: an equation for an unknown function $y(t)$ that involves its derivative. A **solution** is a function that makes the equation true for every $t$.

::: theorem Exponential growth and decay
For any constants $C$ and $k$, the function $y(t) = Ce^{kt}$ satisfies

$$\begin{aligned} \frac{dy}{dt} &= ky \quad \text{for every } t, \\ y(0) &= C. \end{aligned}$$
:::

::: proof
By the chain rule, $\dfrac{d}{dt}\big(Ce^{kt}\big) = C\cdot ke^{kt} = k\cdot Ce^{kt} = ky$, and $y(0) = Ce^0 = C$.
:::

```check
C = symbols('C')
same(diff(C*exp(k*t), t), k*C*exp(k*t)); same((C*exp(k*t)).subs(t, 0), C)
```

This checks that a formula is a solution; it is not a method for finding solutions. Module 13 solves differential equations, and shows that these are the only solutions of $y' = ky$: a quantity whose rate of change is $k$ times its size is $y(0)e^{kt}$.

### Doubling time and half-life {#doubling}

If $k > 0$ and $C > 0$, $y = Ce^{kt}$ grows. It doubles in the time $T$ with $e^{kT} = 2$, that is,

$$T = \frac{\ln 2}{k},$$

the **doubling time**, whatever the starting value and whenever you start the clock: $y(t + T) = Ce^{kt}e^{kT} = 2y(t)$. If $k < 0$, $y$ decays, and it halves in the **half-life**

$$T_{1/2} = \frac{\ln 2}{\abs{k}}.$$

Since $\ln 2 \approx 0.693$, a quantity that grows continuously at $p$% per unit of time, so that $k = p/100$, doubles in about $69.3/p$ units of time. This is the "rule of 70" of finance: at 5% a year, money doubles in about $70/5 = 14$ years (Example 6.4 found 13.86).

```check
Tp = symbols('T', positive=True); kp = symbols('k', positive=True); kn = symbols('k', negative=True)
same(solve(exp(kp*Tp) - 2, Tp), [log(2)/kp]); same(C*exp(kp*t)*exp(kp*log(2)/kp), 2*C*exp(kp*t))
same(solve(exp(kn*Tp) - Rational(1, 2), Tp), [log(2)/Abs(kn)])
rounds(log(2), '0.693'); same(log(2)/(Rational(1, 100)*symbols('p', positive=True)), 100*log(2)/symbols('p', positive=True)); rounds(100*log(2), '69.3')
same(Rational(70, 5), 14); rounds(log(2)/Rational(5, 100), '13.86')
```

::: example The bacteria of Module 1
Module 1's [Example 1.6](module_01_EN.html#exponential) modelled a colony of bacteria by $N(t) = 1000 \cdot 2^{t/3}$ cells after $t$ hours. Write $N$ in the form $Ce^{kt}$, check its doubling time, and find how fast the colony grows at $t = 0$ and at $t = 6$.

Since $2 = e^{\ln 2}$, $2^{t/3} = e^{(\ln 2/3)t}$, and $N(t) = 1000e^{kt}$ with

$$k = \frac{\ln 2}{3} \approx 0.2310 \text{ per hour}.$$

The doubling time is $\dfrac{\ln 2}{k} = 3$ hours, as before. By Theorem 6.10, $N'(t) = kN(t)$. At $t = 0$ the colony grows at $1000k \approx 231.0$ cells per hour; at $t = 6$, when $N = 1000 \cdot 2^2 = 4000$, it grows at $4000k \approx 924.2$ cells per hour, four times as fast.

```check
same((1000*2**(t/3)).rewrite(exp), 1000*exp(log(2)/3*t)); rounds(log(2)/3, '0.2310'); same(log(2)/(log(2)/3), 3)
same(diff(1000*2**(t/3), t), log(2)/3*1000*2**(t/3))
rounds(1000*log(2)/3, '231.0'); same(1000*2**(Integer(6)/3), 4000); rounds(4000*log(2)/3, '924.2')
```
:::

::: example Half-life
Suppose a radioactive isotope has a half-life of 8 days. (a) Find the constant $k$ in its law of decay, $y = y_0e^{kt}$, with $t$ in days. (b) What fraction of a sample is left after 30 days? (c) When is only 1% left?

**(a)** $\dfrac{\ln 2}{\abs{k}} = 8$ and $k < 0$, so $k = -\dfrac{\ln 2}{8} \approx -0.08664$ per day.

**(b)** The amount after $t$ days is $y(t) = y_0e^{kt} = y_0e^{-(\ln 2/8)t} = y_0\,2^{-t/8}$, where $y_0$ is the amount at $t = 0$. After 30 days the fraction left is $2^{-30/8} = 2^{-3.75} \approx 0.0743$, about 7.4%.

**(c)** Solve $2^{-t/8} = 0.01$. Take $\ln$ of both sides: $-\dfrac{t}{8}\ln 2 = \ln 0.01 = -\ln 100$, so

$$t = \frac{8\ln 100}{\ln 2} \approx 53.15 \text{ days}.$$

```check
k8 = -log(2)/8
same(log(2)/Abs(k8), 8); rounds(k8, '-0.08664')
same(exp(k8*t), (2**(-t/8)).rewrite(exp)); same(Rational(30, 8), Rational(375, 100)); rounds(2**(-Rational(30, 8)), '0.0743'); rounds(100*2**(-Rational(30, 8)), '7.4')
same(log(Rational(1, 100)), -log(100))
same(solve(2**(-xr/8) - Rational(1, 100), xr), [8*log(100)/log(2)]); rounds(8*log(100)/log(2), '53.15')
```
:::

::: pitfall
Two slips with exponential models. The rate $k$ and the time $t$ must use the same unit: a rate per day needs $t$ in days. And a quantity that halves every 8 days does not vanish after 16 days: after 16 days a quarter is left, and after $8m$ days a fraction $\big(\tfrac12\big)^m$, never zero.

```check
same(2**(-Rational(16, 8)), Rational(1, 4)); same(2**(-(8*m)/8), (Rational(1, 2))**m)
```
:::

::: compute Growth and decay with SymPy
With symbols, SymPy checks that $Ce^{kt}$ solves $y' = ky$, and that $Cte^{kt}$ does not:

```python
import sympy as sp
t, k, C = sp.symbols('t k C')
y = C*sp.exp(k*t)
print(sp.diff(y, t) - k*y)                    # 0: y' = ky for every t
w = C*t*sp.exp(k*t)
print(sp.simplify(sp.diff(w, t) - k*w))       # not 0: w is not a solution
print(sp.solve(sp.Eq(sp.exp(k*t), 2), t))     # the doubling time
```

```output
0
C*exp(k*t)
[log(2)/k]
```

Then the numbers of Example 6.12:

```python
k8 = -sp.log(2)/8
print(sp.N(k8, 4), sp.N(sp.exp(30*k8), 3), sp.N(sp.log(sp.Rational(1, 100))/k8, 4))
```

```output
-0.08664 0.0743 53.15
```

They are $k \approx -0.08664$, the fraction 0.0743 left after 30 days, and 53.15 days until 1% is left.
:::

## What you learned {#summary}

- Compound interest, $\big(1 + \tfrac1n\big)^n$, and the slope of $a^x$ at 0 lead to the same number, $e \approx 2.71828$. The series defines $e$ by $\lim_{h\to0}(e^h - 1)/h = 1$, taking on trust Module 1's real powers and that $2^x$ has a slope at 0, and proves that $\big(1 + \tfrac{x}{n}\big)^n \to e^x$.
- The derivative of $a^x$ is its slope at 0 times $a^x$, and the slope at 0 is $\ln a$: $(e^x)' = e^x$ and $(a^x)' = a^x\ln a$.
- If $f$ is continuous and one-to-one on an open interval and $f'(a) \ne 0$, then $(f^{-1})'\big(f(a)\big) = 1/f'(a)$: reflection in $y = x$ turns slope $m$ into slope $1/m$.
- $(\ln x)' = 1/x$ for $x > 0$, $(\ln\abs{x})' = 1/x$ for $x \ne 0$, $(\ln\abs{u})' = u'/u$ where $u \ne 0$, and $(\log_a x)' = 1/(x\ln a)$.
- Implicit differentiation: differentiate the equation of a curve with $y = y(x)$, using the chain rule on every term with $y$, then solve for $y'$. Where the coefficient of $y'$ is not 0, the implicit function theorem guarantees that $y$ is a differentiable function of $x$.
- ${\arcsin}$, $\arccos$ and $\arctan$ invert $\sin$ on $[-\pi/2, \pi/2]$, $\cos$ on $[0, \pi]$ and $\tan$ on $(-\pi/2, \pi/2)$. Their derivatives are $1/\sqrt{1 - x^2}$, $-1/\sqrt{1 - x^2}$ and $1/(1 + x^2)$. $\sin^{-1}x$ means $\arcsin x$, not $1/\sin x$.
- Logarithmic differentiation handles products, quotients and variable exponents, as in $(x^x)' = x^x(\ln x + 1)$; the power rule $(x^r)' = rx^{r-1}$ holds for every real $r$ and $x > 0$.
- $\cosh^2 x - \sinh^2 x = 1$, $\sinh' = {\cosh}$, $\cosh' = {\sinh}$, $\tanh' = 1/\cosh^2$; a hanging chain is a catenary, $y = a\cosh(x/a)$.
- $y = Ce^{kt}$ solves $y' = ky$ with $y(0) = C$; the doubling time is $\ln 2/k$ and the half-life $\ln 2/{\abs{k}}$. Module 13 solves such equations.

## Exercises {#exercises}

:::: exercise Derivatives of exponentials and logarithms {#ex-6-1} ★
Differentiate:

- (a) $e^{-4x}$
- (b) $5^x$
- (c) $x^3e^{2x}$
- (d) $\ln\big(3x^2 + 1\big)$
- (e) $\log_2 x$, for $x > 0$
- (f) $\cosh\big(x^2\big)$

::: solution
**(a)** By the chain rule with the inner function $-4x$: $-4e^{-4x}$.

**(b)** By Theorem 6.3: $5^x\ln 5 \approx 1.609 \cdot 5^x$. The common wrong answer, $x\,5^{x-1}$, uses the power rule, which is for a variable base.

**(c)** By the product rule:
$$\begin{aligned} &3x^2e^{2x} + x^3\cdot 2e^{2x} \\ &\quad= x^2e^{2x}(3 + 2x). \end{aligned}$$

**(d)** With $u = 3x^2 + 1 > 0$: $\dfrac{u'}{u} = \dfrac{6x}{3x^2 + 1}$. The answer is not $\dfrac{1}{3x^2 + 1}$: that leaves out the factor $u' = 6x$.

**(e)** $\log_2 x = \dfrac{\ln x}{\ln 2}$, so its derivative is $\dfrac{1}{x\ln 2}$.

**(f)** By the chain rule with the inner function $x^2$, and $\cosh' = {\sinh}$:

$$\begin{aligned} \frac{d}{dx}\cosh\big(x^2\big) &= \sinh\big(x^2\big)\cdot 2x \\ &= 2x\sinh\big(x^2\big). \end{aligned}$$

```check
same(diff(exp(-4*x), x), -4*exp(-4*x))
same(diff(5**x, x), 5**x*log(5)); rounds(log(5), '1.609')
steps(diff(x**3*exp(2*x), x), 3*x**2*exp(2*x) + x**3*2*exp(2*x), x**2*exp(2*x)*(3 + 2*x))
same(diff(log(3*x**2 + 1), x), 6*x/(3*x**2 + 1))
same(diff(log(xp, 2), xp), 1/(xp*log(2)))
same(diff(cosh(x**2), x), 2*x*sinh(x**2))
```
:::
::::

:::: exercise Values of the inverse trigonometric functions {#ex-6-2} ★
- (a) Find $\arcsin\dfrac{\sqrt3}{2}$, $\arccos\Big(-\dfrac{\sqrt2}{2}\Big)$ and $\arctan\big(-\sqrt3\big)$.
- (b) Find $\arccos\Big(\cos\Big(-\dfrac{\pi}{4}\Big)\Big)$.
- (c) A calculator in radian mode shows $\sin^{-1}(0.5) = 0.5236$ (rounded). What is this number, and why is it different from $\dfrac{1}{\sin 0.5} \approx 2.0858$?

::: solution
**(a)** In each case, find an angle with the right sine, cosine or tangent, and check that it lies in the range of the inverse function.

- $\sin\tfrac{\pi}{3} = \tfrac{\sqrt3}{2}$, and $\tfrac{\pi}{3}$ lies in $[-\pi/2, \pi/2]$: $\arcsin\tfrac{\sqrt3}{2} = \tfrac{\pi}{3}$.
- $\cos\tfrac{3\pi}{4} = \cos\big(\pi - \tfrac{\pi}{4}\big) = -\cos\tfrac{\pi}{4} = -\tfrac{\sqrt2}{2}$, and $\tfrac{3\pi}{4}$ lies in $[0, \pi]$: $\arccos\big({-\tfrac{\sqrt2}{2}}\big) = \tfrac{3\pi}{4}$.
- The tangent is odd, so $\tan\big({-\tfrac{\pi}{3}}\big) = -\tan\tfrac{\pi}{3} = -\sqrt3$, and $-\tfrac{\pi}{3}$ lies in $(-\pi/2, \pi/2)$: $\arctan\big({-\sqrt3}\big) = -\tfrac{\pi}{3}$.

**(b)** $\cos\Big(-\dfrac{\pi}{4}\Big) = \cos\dfrac{\pi}{4} = \dfrac{\sqrt2}{2}$, and $\arccos\dfrac{\sqrt2}{2} = \dfrac{\pi}{4}$. The answer is $\dfrac{\pi}{4}$, not $-\dfrac{\pi}{4}$: $\arccos$ returns angles in $[0, \pi]$ only.

**(c)** $\sin^{-1}$ on the calculator is ${\arcsin}$: $\arcsin 0.5 = \dfrac{\pi}{6} \approx 0.5236$, the angle (in radians) whose sine is 0.5. The number $\dfrac{1}{\sin 0.5}$ is the reciprocal of the sine of the angle 0.5, that is, $\csc 0.5$: the $-1$ in $\sin^{-1}$ is not an exponent.

```check
same(asin(sqrt(3)/2), pi/3); same(3*pi/4, pi - pi/4); same(cos(3*pi/4), -cos(pi/4)); same(cos(pi - pi/4), -sqrt(2)/2); same(acos(-sqrt(2)/2), 3*pi/4)
same(tan(-pi/3), -sqrt(3)); same(atan(-sqrt(3)), -pi/3)
same(cos(-pi/4), sqrt(2)/2); same(acos(cos(-pi/4)), pi/4)
same(asin(Rational(1, 2)), pi/6); rounds(pi/6, '0.5236'); rounds(1/sin(Rational(1, 2)), '2.0858'); same(1/sin(Rational(1, 2)), csc(Rational(1, 2)))
```
:::
::::

:::: exercise A tangent line by implicit differentiation {#ex-6-3} ★
Show that $(1, 2)$ lies on the curve $x^2 + xy + y^2 = 7$. Find $\dfrac{dy}{dx}$ by implicit differentiation, and the equation of the tangent line at $(1, 2)$.

::: solution
At $(1, 2)$, $x^2 + xy + y^2 = 1 + 2 + 4 = 7$, so the point is on the curve. Differentiate both sides with respect to $x$, using the product rule on $xy$ and the chain rule on $y^2$:

$$2x + \big(y + x\,y'\big) + 2y\,y' = 0.$$

Collect the terms with $y'$: $(x + 2y)\,y' = -(2x + y)$, so

$$y' = -\frac{2x + y}{x + 2y} \quad (x + 2y \ne 0).$$

At $(1, 2)$: $y' = -\dfrac{2 + 2}{1 + 4} = -\dfrac45$. The tangent line is

$$y - 2 = -\frac45(x - 1),$$

that is, $y = -\tfrac45x + \tfrac{14}{5}$.

```check
cur = x**2 + x*y + y**2 - 7
same(cur.subs({x: 1, y: 2}), 0)
same(diff(x**2 + x*Yf(x) + Yf(x)**2, x), 2*x + (Yf(x) + x*diff(Yf(x), x)) + 2*Yf(x)*diff(Yf(x), x))
yd3 = symbols('yd3')
same(expand(2*x + (y + x*yd3) + 2*y*yd3), expand((x + 2*y)*yd3 + (2*x + y)))      # collected: (x + 2y) y' = -(2x + y)
same(idiff(cur, y, x), -(2*x + y)/(x + 2*y)); same((-(2*x + y)/(x + 2*y)).subs({x: 1, y: 2}), -Rational(4, 5))
same(expand(2 - Rational(4, 5)*(x - 1)), -Rational(4, 5)*x + Rational(14, 5))
```
:::
::::

:::: exercise Slopes of an inverse function {#ex-6-4} ★★
Let $f(x) = x + e^x$.

- (a) Show that $f$ is one-to-one on $\R$.
- (b) Find $(f^{-1})'(1)$ and $(f^{-1})'(1 + e)$.
- (c) Find the equation of the tangent line to the graph of $f^{-1}$ at the point $(1, 0)$.

::: solution
**(a)** Let $x_1 < x_2$. Then $e^{x_1} < e^{x_2}$, because $e^x$ increases ($e > 1$), so $x_1 + e^{x_1} < x_2 + e^{x_2}$: $f$ is strictly increasing, and so one-to-one ([Exercise 1.10](module_01_EN.html#ex-1-10)). It is also differentiable, hence continuous, on $\R$, with $f'(x) = 1 + e^x$, which is never 0, so Theorem 6.4 applies at every point.

**(b)** $f(0) = 0 + 1 = 1$ and $f(1) = 1 + e$, while $f'(0) = 1 + 1 = 2$ and $f'(1) = 1 + e$. So

$$\begin{aligned} (f^{-1})'(1) &= \frac{1}{f'(0)} = \frac12, \\ (f^{-1})'(1 + e) &= \frac{1}{f'(1)} = \frac{1}{1 + e}, \end{aligned}$$

and $1/(1 + e) \approx 0.2689$.

The common slip is to write $(f^{-1})'(1) = \dfrac{1}{f'(1)}$: the slope of $f$ must be taken at the mirror point $f^{-1}(1) = 0$.

**(c)** The point $(1, 0)$ is on the graph of $f^{-1}$ because $f(0) = 1$, and the slope there is $\tfrac12$ by (b). The tangent line is $y - 0 = \tfrac12(x - 1)$, that is, $y = \dfrac{x - 1}{2}$.

```check
f4 = x + exp(x)
same(diff(f4, x), 1 + exp(x)); holds(diff(f4, x).subs(x, xr) > 0)
same(f4.subs(x, 0), 1); same(f4.subs(x, 1), 1 + E); same(diff(f4, x).subs(x, 0), 2); same(diff(f4, x).subs(x, 1), 1 + E)
same(1/diff(f4, x).subs(x, 0), Rational(1, 2)); same(1/diff(f4, x).subs(x, 1), 1/(1 + E)); rounds(1/(1 + E), '0.2689')
yv = symbols('y_v')
same(idiff(yv + exp(yv) - x, yv, x).subs(yv, 0), Rational(1, 2))       # y = f^{-1}(x) satisfies y + e^y = x
same(Rational(1, 2)*(x - 1), (x - 1)/2)
```
:::
::::

:::: exercise Logarithmic differentiation {#ex-6-5} ★★
- (a) Differentiate $y = x^{\sin x}$, for $x > 0$.
- (b) Differentiate $y = x^{1/x}$, for $x > 0$, and find the point where its tangent line is horizontal.
- (c) Find $y'(0)$ for $y = (x + 1)^2(x + 2)^3(x + 3)^4$.

::: solution
**(a)** $y > 0$, and $\ln y = \sin x\,\ln x$. By the product rule,
$$\begin{aligned} \frac{y'}{y} &= \cos x\,\ln x + \frac{\sin x}{x}, \\ y' &= x^{\sin x}\Big(\cos x\,\ln x + \frac{\sin x}{x}\Big). \end{aligned}$$

**(b)** $\ln y = \dfrac{\ln x}{x}$. By the quotient rule,
$$\begin{aligned} \frac{y'}{y} &= \frac{\tfrac1x\cdot x - \ln x\cdot 1}{x^2} = \frac{1 - \ln x}{x^2}, \\ y' &= x^{1/x}\,\frac{1 - \ln x}{x^2}. \end{aligned}$$
Since $x^{1/x} > 0$ and $x^2 > 0$, $y' = 0$ exactly when $\ln x = 1$, that is, at $x = e$, where $y = e^{1/e} \approx 1.4447$. The horizontal tangent line is at $\big(e, e^{1/e}\big)$. (With the methods of Module 8 you can show that this is the highest point of the graph: no number $x^{1/x}$ exceeds $e^{1/e}$.)

**(c)** Near $x = 0$ every factor is positive, so
$$\begin{aligned} \ln y = {} & 2\ln(x + 1) + 3\ln(x + 2) \\ & + 4\ln(x + 3), \end{aligned}$$
$$\frac{y'}{y} = \frac{2}{x + 1} + \frac{3}{x + 2} + \frac{4}{x + 3}.$$
At $x = 0$: $y(0) = 1 \cdot 8 \cdot 81 = 648$ and $\dfrac{y'}{y} = 2 + \dfrac32 + \dfrac43 = \dfrac{29}{6}$, so $y'(0) = 648 \cdot \dfrac{29}{6} = 3132$.

Where a factor is negative, for example at $x = -2.5$, where $y < 0$, start from $\ln\abs{y} = 2\ln\abs{x + 1} + 3\ln\abs{x + 2} + 4\ln\abs{x + 3}$ instead. Since $(\ln\abs{u})' = u'/u$, the same formula for $y'/y$ comes out. So it holds wherever $y \ne 0$, that is, for every $x$ except $-1$, $-2$ and $-3$.

```check
same(diff(xp**sin(xp), xp), xp**sin(xp)*(cos(xp)*log(xp) + sin(xp)/xp))
steps(diff(log(xp)/xp, xp), (1/xp*xp - log(xp))/xp**2, (1 - log(xp))/xp**2)
same(diff(xp**(1/xp), xp), xp**(1/xp)*(1 - log(xp))/xp**2)
same(solve(1 - log(xp), xp), [E]); rounds(exp(exp(-1)), '1.4447'); same(E**(1/E), exp(exp(-1)))
y5 = (x + 1)**2*(x + 2)**3*(x + 3)**4
same(diff(2*log(x + 1) + 3*log(x + 2) + 4*log(x + 3), x), 2/(x + 1) + 3/(x + 2) + 4/(x + 3))
same(y5.subs(x, 0), 648); same((2/(x + 1) + 3/(x + 2) + 4/(x + 3)).subs(x, 0), Rational(29, 6))
same(648*Rational(29, 6), 3132); same(diff(y5, x).subs(x, 0), 3132)
holds(y5.subs(x, -Rational(5, 2)) < 0); same_set(solve(y5, x), [-1, -2, -3])
same(diff(2*log(-(x + 1)) + 3*log(-(x + 2)) + 4*log(x + 3), x), 2/(x + 1) + 3/(x + 2) + 4/(x + 3))   # ln|y| for -3 < x < -2
same(diff(y5, x), y5*(2/(x + 1) + 3/(x + 2) + 4/(x + 3)))                                          # so y' = y(...) wherever y is not 0
```
:::
::::

:::: exercise Derivatives of inverse trigonometric functions {#ex-6-6} ★★
- (a) Differentiate $\arcsin\dfrac{x}{3}$, for $-3 < x < 3$.
- (b) Differentiate $x\arctan x$.
- (c) Show that $\dfrac{d}{dx}\Big(\arctan x + \arctan\dfrac1x\Big) = 0$ for every $x \ne 0$. Evaluate $\arctan x + \arctan\dfrac1x$ at $x = 1$ and at $x = -1$. What do you conclude?

::: solution
**(a)** By the chain rule, for $-3 < x < 3$ (so that $-1 < x/3 < 1$),
$$\begin{aligned} \frac{d}{dx}\arcsin\frac{x}{3} &= \frac{1}{\sqrt{1 - x^2/9}}\cdot\frac13 \\ &= \frac{1}{\sqrt{9 - x^2}}, \end{aligned}$$
since $3\sqrt{1 - x^2/9} = \sqrt{9(1 - x^2/9)} = \sqrt{9 - x^2}$.

**(b)** By the product rule: $\arctan x + \dfrac{x}{1 + x^2}$.

**(c)** By the chain rule,
$$\begin{aligned} \frac{d}{dx}\arctan\frac1x &= \frac{1}{1 + 1/x^2}\cdot\frac{-1}{x^2} \\ &= -\frac{1}{x^2 + 1}, \end{aligned}$$
which cancels the derivative $\dfrac{1}{1 + x^2}$ of $\arctan x$: the sum has derivative 0. At $x = 1$ the sum is $\tfrac{\pi}{4} + \tfrac{\pi}{4} = \tfrac{\pi}{2}$; at $x = -1$ it is $-\tfrac{\pi}{4} - \tfrac{\pi}{4} = -\tfrac{\pi}{2}$. A function with derivative 0 on an interval is constant there (Module 8 proves this), so $\arctan x + \arctan(1/x)$ equals $\pi/2$ for every $x > 0$, and $-\pi/2$ for every $x < 0$. The two constants differ because the domain, $(-\infty, 0) \cup (0, \infty)$, is not one interval.

```check
steps(diff(asin(x/3), x), 1/sqrt(1 - x**2/9)*Rational(1, 3), 1/sqrt(9 - x**2))
same(diff(x*atan(x), x), atan(x) + x/(1 + x**2))
steps(diff(atan(1/x), x), 1/(1 + 1/x**2)*(-1/x**2), -1/(x**2 + 1)); same(diff(atan(x) + atan(1/x), x), 0)
same(atan(1) + atan(1), pi/2); same(atan(-1) + atan(-1), -pi/2)
for v_ in (Rational(1, 3), Integer(2), Integer(5)):                    # instances, to 25 decimals
    near(atan(v_) + atan(1/v_), pi/2, 1e-25); near(atan(-v_) + atan(-1/v_), -pi/2, 1e-25)
```
:::
::::

:::: exercise A growing culture {#ex-6-7} ★★
Suppose a culture of yeast cells grows exponentially, $N(t) = N_0e^{kt}$, from 2000 cells to 3000 cells in 5 hours.

- (a) Find $k$.
- (b) Find the doubling time.
- (c) How many cells are there after 12 hours?
- (d) How fast is the culture growing at $t = 5$?

::: solution
**(a)** $N_0 = N(0) = 2000$ and $N(5) = 2000e^{5k} = 3000$, so $e^{5k} = 1.5$, $5k = \ln 1.5$ and
$$k = \frac{\ln 1.5}{5} \approx 0.08109 \text{ per hour}.$$

**(b)** $T = \dfrac{\ln 2}{k} = \dfrac{5\ln 2}{\ln 1.5} \approx 8.548$ hours.

**(c)** $e^{k} = 1.5^{1/5}$, so $N(12) = 2000\,e^{12k} = 2000 \cdot 1.5^{12/5} = 2000 \cdot 1.5^{2.4} \approx 5292$ cells.

**(d)** By Theorem 6.10, $N'(5) = kN(5) = 3000k \approx 243.3$ cells per hour.

```check
kq = log(Rational(3, 2))/5
same(solve(2000*exp(5*xr) - 3000, xr), [kq]); rounds(kq, '0.08109')
same(log(2)/kq, 5*log(2)/log(Rational(3, 2))); rounds(log(2)/kq, '8.548')
same(2000*exp(12*kq), 2000*Rational(3, 2)**Rational(12, 5)); rounds(2000*Rational(3, 2)**Rational(12, 5), '5292')
same(diff(2000*exp(kq*t), t).subs(t, 5), 3000*kq); rounds(3000*kq, '243.3')
```
:::
::::

:::: exercise The second derivative on a circle {#ex-6-8} ★★
For the circle $x^2 + y^2 = 25$, Section 6.4 found $y' = -x/y$.

- (a) Differentiate again, implicitly, to show that $y'' = -\dfrac{25}{y^3}$ wherever $y \ne 0$.
- (b) Check the value at $(3, 4)$ by differentiating $y = \sqrt{25 - x^2}$ twice.
- (c) What does the sign of $y''$ say about the upper and lower halves of the circle?

::: solution
**(a)** Differentiate $y' = -\dfrac{x}{y}$ with the quotient rule, remembering that $y$ is a function of $x$:
$$\begin{aligned} y'' &= -\frac{1\cdot y - x\,y'}{y^2} \\ &= -\frac{y - x(-x/y)}{y^2} \\ &= -\frac{y^2 + x^2}{y^3} \\ &= -\frac{25}{y^3}, \end{aligned}$$
where the second step substitutes $y' = -x/y$, the third multiplies the top and the bottom by $y$, and the last uses $x^2 + y^2 = 25$ on the curve.

**(b)** On the upper half, $y = (25 - x^2)^{1/2}$, so $y' = -x(25 - x^2)^{-1/2}$ and, by the product and chain rules,
$$\begin{aligned} y'' &= -(25 - x^2)^{-1/2} \\ &\qquad - x^2(25 - x^2)^{-3/2} \\ &= -\frac{(25 - x^2) + x^2}{(25 - x^2)^{3/2}} \\ &= -\frac{25}{(25 - x^2)^{3/2}}. \end{aligned}$$
At $x = 3$, $(25 - 9)^{3/2} = 16^{3/2} = 64$, so $y'' = -\dfrac{25}{64}$; and (a) gives $-\dfrac{25}{4^3} = -\dfrac{25}{64}$ too.

**(c)** On the upper half $y > 0$, so $y'' < 0$: the slope decreases as $x$ increases, and the curve bends downwards. On the lower half $y < 0$, so $y'' > 0$, and the curve bends upwards. Module 8 calls this concavity.

```check
same(idiff(x**2 + y**2 - 25, y, x, 2), -(x**2 + y**2)/y**3)
steps(-(1*y - x*(-x/y))/y**2, -(y - x*(-x/y))/y**2, -(y**2 + x**2)/y**3)
same(-(y**2 + x**2)/y**3 - (-25/y**3), (25 - x**2 - y**2)/y**3)     # equal wherever x^2 + y^2 = 25
sc = sqrt(25 - x**2)
same(diff(sc, x), -x*(25 - x**2)**Rational(-1, 2))
steps(diff(sc, x, 2), -(25 - x**2)**Rational(-1, 2) - x**2*(25 - x**2)**Rational(-3, 2), -((25 - x**2) + x**2)/(25 - x**2)**Rational(3, 2), -25/(25 - x**2)**Rational(3, 2))
same(diff(sc, x, 2), -25/(25 - x**2)**Rational(3, 2)); same(diff(sc, x, 2).subs(x, 3), -Rational(25, 64))
same(Integer(16)**Rational(3, 2), 64); same(-25/Integer(4)**3, -Rational(25, 64))
```
:::
::::

:::: exercise A hanging cable {#ex-6-9} ★★★
A cable hangs between two poles 20 metres apart, with its ends at the same height. Take the lowest point of the cable as $(0, 10)$, in metres, and suppose that its shape is the catenary $y = 10\cosh\dfrac{x}{10}$ for $-10 \le x \le 10$.

- (a) How far below its ends does the cable sag?
- (b) What is the slope of the cable at the poles, and at what angle to the horizontal does it meet them?
- (c) The parabola through the lowest point and the two ends is $p(x) = 10 + s\Big(\dfrac{x}{10}\Big)^2$, where $s$ is the sag of (a). How far apart are the parabola and the catenary at $x = 5$?

::: solution
**(a)** The ends are at height $y(\pm10) = 10\cosh 1$ and the lowest point at height 10, so the sag is
$$\begin{aligned} s &= 10\cosh 1 - 10 \\ &= 10(\cosh 1 - 1) \approx 5.431 \text{ m}. \end{aligned}$$

**(b)** $y' = 10\sinh\dfrac{x}{10}\cdot\dfrac{1}{10} = \sinh\dfrac{x}{10}$, so at $x = 10$ the slope is $\sinh 1 \approx 1.175$ (and $-1.175$ at $x = -10$). A line of slope $m$ makes the angle $\arctan m$ with the horizontal, since $\tan$ of that angle is rise over run. So the cable meets the poles at $\arctan(\sinh 1) \approx 0.8658$ radians, about $49.6^\circ$, to the horizontal.

**(c)** $p(5) = 10 + s \cdot \dfrac14 \approx 10 + 1.358 = 11.358$, while the catenary has $y(5) = 10\cosh 0.5 \approx 11.276$. They differ by about 0.081 m, 8 cm, with the cable below the parabola. Over a sag of 5.4 m the difference is small, which is why a hanging cable looks like a parabola; but it is not one.

```check
yh = 10*cosh(x/10)
sg = 10*cosh(1) - 10
same(yh.subs(x, 10) - yh.subs(x, 0), sg); same(sg, 10*(cosh(1) - 1)); rounds(sg, '5.431')
same(diff(yh, x), sinh(x/10)); same(diff(yh, x).subs(x, 10), sinh(1)); rounds(sinh(1), '1.175'); same(diff(yh, x).subs(x, -10), -sinh(1))
rounds(atan(sinh(1)), '0.8658'); rounds(atan(sinh(1))*180/pi, '49.6')
pp_ = 10 + sg*(x/10)**2
same(pp_.subs(x, 0), 10); same(pp_.subs(x, 10), yh.subs(x, 10)); same(pp_.subs(x, -10), yh.subs(x, -10))
rounds(sg/4, '1.358'); rounds(pp_.subs(x, 5), '11.358'); rounds(yh.subs(x, 5), '11.276')
rounds(pp_.subs(x, 5) - yh.subs(x, 5), '0.081'); holds(yh.subs(x, 5) < pp_.subs(x, 5))
```
:::
::::

:::: exercise The inverse hyperbolic sine {#ex-6-10} ★★★
- (a) Show that $\sinh$ is strictly increasing on $\R$. Then solve $\sinh y = x$ for $y$, to show that $\sinh$ takes every real value exactly once and that its inverse, the **inverse hyperbolic sine**, is
$$\operatorname{arsinh} x = \ln\big(x + \sqrt{x^2 + 1}\big).$$
- (b) Use Theorem 6.4 to show that $\dfrac{d}{dx}\operatorname{arsinh} x = \dfrac{1}{\sqrt{1 + x^2}}$.
- (c) Differentiate $\ln\big(x + \sqrt{x^2 + 1}\big)$ directly, and check that you get the same answer.

::: solution
**(a)** Let $x_1 < x_2$. Then $e^{x_1} < e^{x_2}$ and $e^{-x_1} > e^{-x_2}$, so $e^{x_1} - e^{-x_1} < e^{x_2} - e^{-x_2}$, that is, $\sinh x_1 < \sinh x_2$. Now let $x$ be any real number, and solve $\sinh y = x$ for $y$: multiply $\dfrac{e^y - e^{-y}}{2} = x$ by $2e^y$ to get

$$e^{2y} - 1 = 2xe^y.$$

With $u = e^y$ this is the quadratic $u^2 - 2xu - 1 = 0$, whose roots are $u = x \pm \sqrt{x^2 + 1}$. Since $\sqrt{x^2 + 1} > \sqrt{x^2} = {\abs{x}}$, the root $x - \sqrt{x^2 + 1}$ is negative and cannot be $e^y$, while $x + \sqrt{x^2 + 1}$ is positive. So there is exactly one solution,

$$y = \ln\big(x + \sqrt{x^2 + 1}\big).$$

Every real $x$ is a value of ${\sinh}$, taken once, and this $y$ is $\operatorname{arsinh} x$.

**(b)** $\sinh$ is differentiable, hence continuous, and one-to-one on the open interval $\R$, and its derivative $\cosh y \ge 1$ is never 0. By Theorem 6.4, with $y = \operatorname{arsinh} x$,
$$\frac{d}{dx}\operatorname{arsinh} x = \frac{1}{\cosh y}.$$
By the identity, $\cosh^2 y = 1 + \sinh^2 y = 1 + x^2$, and $\cosh y > 0$, so $\cosh y = \sqrt{1 + x^2}$.

**(c)** By the chain rule, $\dfrac{d}{dx}\sqrt{x^2 + 1} = \dfrac{x}{\sqrt{x^2 + 1}}$, so
$$\begin{aligned} &\frac{d}{dx}\ln\big(x + \sqrt{x^2 + 1}\big) \\ &\quad= \frac{1 + x/\sqrt{x^2 + 1}}{x + \sqrt{x^2 + 1}} \\ &\quad= \frac{\sqrt{x^2 + 1} + x}{\sqrt{x^2 + 1}\,\big(x + \sqrt{x^2 + 1}\big)} \\ &\quad= \frac{1}{\sqrt{x^2 + 1}}, \end{aligned}$$
the same as (b). Python and SymPy call this function `asinh`; many books write $\sinh^{-1}x$.

```check
same(diff(sinh(x), x), cosh(x)); same(function_range(cosh(x), x, S.Reals), Interval(1, oo))
holds(all(exp(p_) < exp(q_) and exp(-p_) > exp(-q_) for p_, q_ in [(-3, -1), (-1, 0), (0, Rational(1, 2)), (2, 5)]))
same(expand(2*exp(y)*(exp(y) - exp(-y))/2), exp(2*y) - 1)
wq = symbols('w_q')
same_set(solve(wq**2 - 2*xr*wq - 1, wq), [xr + sqrt(xr**2 + 1), xr - sqrt(xr**2 + 1)])
same((xr**2 + 1) - xr**2, 1)                                   # so sqrt(x^2 + 1) > sqrt(x^2) = |x|
holds(all(v_ - sqrt(v_**2 + 1) < 0 and v_ + sqrt(v_**2 + 1) > 0 for v_ in (-7, -1, 0, Rational(1, 3), 4)))
same(sinh(log(xr + sqrt(xr**2 + 1))).rewrite(exp), xr); same(asinh(xr).rewrite(log), log(xr + sqrt(xr**2 + 1)))
same(1/cosh(asinh(x)), 1/sqrt(1 + x**2)); same(diff(asinh(x), x), 1/sqrt(1 + x**2))
same(diff(sqrt(x**2 + 1), x), x/sqrt(x**2 + 1))
steps(diff(log(x + sqrt(x**2 + 1)), x), (1 + x/sqrt(x**2 + 1))/(x + sqrt(x**2 + 1)), (sqrt(x**2 + 1) + x)/(sqrt(x**2 + 1)*(x + sqrt(x**2 + 1))), 1/sqrt(x**2 + 1))
```
:::
::::

:::: exercise The astroid and the sliding ladder {#ex-6-11} ★★★
The **astroid** is the curve $x^{2/3} + y^{2/3} = 1$. Consider the part of it with $x > 0$ and $y > 0$.

- (a) Find $\dfrac{dy}{dx}$ by implicit differentiation.
- (b) Show that the tangent line at a point $(x_0, y_0)$ of this part meets the axes at $\big(x_0^{1/3}, 0\big)$ and $\big(0, y_0^{1/3}\big)$.
- (c) Show that the piece of every such tangent line between the axes has length 1.

::: solution
**(a)** Differentiate both sides, with the power rule for real exponents (Theorem 6.8) and the chain rule on $y^{2/3}$:
$$\frac23x^{-1/3} + \frac23y^{-1/3}\,y' = 0,$$

so

$$y' = -\frac{x^{-1/3}}{y^{-1/3}} = -\frac{y^{1/3}}{x^{1/3}}.$$

**(b)** The tangent line at $(x_0, y_0)$ is

$$y - y_0 = -\frac{y_0^{1/3}}{x_0^{1/3}}(x - x_0).$$

Put $y = 0$, and multiply both sides by $-x_0^{1/3}/y_0^{1/3}$: $x - x_0 = y_0 \cdot x_0^{1/3}/y_0^{1/3} = x_0^{1/3}y_0^{2/3}$, so

$$\begin{aligned} x &= x_0 + x_0^{1/3}y_0^{2/3} \\ &= x_0^{1/3}\big(x_0^{2/3} + y_0^{2/3}\big) = x_0^{1/3}, \end{aligned}$$

because $x_0^{2/3} + y_0^{2/3} = 1$ on the curve. Put $x = 0$ instead:

$$\begin{aligned} y &= y_0 + \frac{y_0^{1/3}}{x_0^{1/3}}\,x_0 = y_0 + y_0^{1/3}x_0^{2/3} \\ &= y_0^{1/3}\big(y_0^{2/3} + x_0^{2/3}\big) = y_0^{1/3}. \end{aligned}$$

**(c)** By Pythagoras, the distance between $\big(x_0^{1/3}, 0\big)$ and $\big(0, y_0^{1/3}\big)$ is
$$\begin{aligned} &\sqrt{\big(x_0^{1/3}\big)^2 + \big(y_0^{1/3}\big)^2} \\ &\quad= \sqrt{x_0^{2/3} + y_0^{2/3}} = \sqrt1 = 1. \end{aligned}$$
Conversely, if $p > 0$, $q > 0$ and $p^2 + q^2 = 1$, the point $\big(p^3, q^3\big)$ is on the astroid, and by (b) its tangent line meets the axes at $(p, 0)$ and $(0, q)$. So a ladder of length 1 sliding down a wall, with its foot on the floor, touches the astroid in every position: the astroid is the edge of the region that the ladder sweeps across.

```check
x0p, y0p = symbols('x_0 y_0', positive=True)
xq_, yq_ = symbols('x_q y_q', positive=True)
same(idiff(xq_**Rational(2, 3) + yq_**Rational(2, 3) - 1, yq_, xq_), -yq_**Rational(1, 3)/xq_**Rational(1, 3))
same(diff(xq_**Rational(2, 3), xq_), Rational(2, 3)*xq_**Rational(-1, 3))
tan_ = y0p - y0p**Rational(1, 3)/x0p**Rational(1, 3)*(x - x0p)
xint = solve(tan_, x)[0]; yint = tan_.subs(x, 0)
same(y0p*x0p**Rational(1, 3)/y0p**Rational(1, 3), x0p**Rational(1, 3)*y0p**Rational(2, 3))
same(xint, x0p + x0p**Rational(1, 3)*y0p**Rational(2, 3)); same(expand(x0p**Rational(1, 3)*(x0p**Rational(2, 3) + y0p**Rational(2, 3))), xint)
same(yint, y0p + y0p**Rational(1, 3)/x0p**Rational(1, 3)*x0p); same(yint, y0p + y0p**Rational(1, 3)*x0p**Rational(2, 3))
same(expand(yint), expand(y0p**Rational(1, 3)*(y0p**Rational(2, 3) + x0p**Rational(2, 3))))
for p_, q_ in ((Rational(3, 5), Rational(4, 5)), (Rational(5, 13), Rational(12, 13)), (Rational(8, 17), Rational(15, 17))):
    pt = {x0p: p_**3, y0p: q_**3}                                          # points of the astroid: p^2 + q^2 = 1
    same((p_**3)**Rational(2, 3) + (q_**3)**Rational(2, 3), 1)
    same(xint.subs(pt), p_); same(yint.subs(pt), q_); same(sqrt(xint.subs(pt)**2 + yint.subs(pt)**2), 1)
```
:::
::::

:::: exercise Two routes, one number {#ex-6-12} ★★★
Section 6.1 wrote $m(a)$ for the slope of $a^x$ at $x = 0$, and Section 6.3 proved that $\big(1 + \tfrac{x}{n}\big)^n \to e^x$ as $n \to \infty$.

- (a) Let $a > 0$ and $b > 0$, and suppose that $m(a)$ and $m(b)$ exist. Show, without using logarithms, that $m(ab)$ exists and $m(ab) = m(a) + m(b)$. (Hint: $(ab)^h = a^hb^h$. Why does $a^h$ approach 1 as $h \to 0$?)
- (b) Use (a), Theorem 6.2 and the estimates $m(2) \approx 0.6931$ and $m(3) \approx 1.0986$ of Section 6.1 to estimate $m(6)$ and $m\big(\tfrac32\big)$ without a calculator. Which law of logarithms does (a) look like, and why is that no accident?
- (c) Bank A pays interest at 6% a year, added monthly; bank B pays 5.9% a year, added continuously. Which turns £1000 into more in one year, and by how much?

::: solution
**(a)** For $h \ne 0$, subtract and add $a^h$ in the numerator, and split the fraction:

$$\begin{aligned} &\frac{(ab)^h - 1}{h} \\ &\quad= \frac{a^hb^h - a^h + a^h - 1}{h} \\ &\quad= a^h\cdot\frac{b^h - 1}{h} + \frac{a^h - 1}{h}. \end{aligned}$$

As $h \to 0$, the two fractions on the right approach $m(b)$ and $m(a)$. The factor $a^h$ approaches $a^0 = 1$: since $m(a)$ exists, $a^x$ is differentiable at 0, and so continuous there (Module 4). By the limit laws for sums and products, the right side approaches $1\cdot m(b) + m(a)$. So $m(ab)$ exists, and $m(ab) = m(a) + m(b)$.

**(b)** By (a), $m(6) = m(2 \cdot 3) = m(2) + m(3) \approx 0.6931 + 1.0986 = 1.7917$. By Theorem 6.2 with $c = -1$, $m\big(\tfrac12\big) = -m(2)$, so by (a) again

$$\begin{aligned} m\big(\tfrac32\big) &= m(3) + m\big(\tfrac12\big) \\ &= m(3) - m(2) \approx 0.4055. \end{aligned}$$

A calculator gives $\ln 6 \approx 1.7918$ and $\ln 1.5 \approx 0.4055$: the same, apart from the last digit of $m(6)$, where the rounding errors of the two estimates add up. Part (a) has the form of the first law of logarithms, $\ln(xy) = \ln x + \ln y$, and Theorem 6.2 that of the third, $\ln\big(x^r\big) = r\ln x$. That is no accident: by Theorem 6.3, $m(a) = \ln a$ for every base $a$.

**(c)** Bank A multiplies the balance by $1 + \tfrac{0.06}{12} = 1.005$ each month, so in a year £1000 becomes $1000 \cdot 1.005^{12} \approx 1061.68$ pounds. For bank B, Theorem 6.6 with $x = 0.059$ gives $1000e^{0.059} \approx 1060.78$ pounds, as in Example 6.4. Bank A pays about £0.90 more. Adding interest continuously instead of monthly is worth less than the extra 0.1% a year: at 5.9%, it gains only about £0.15.

```check
aq_, bq_ = symbols('a b', positive=True)
same((aq_*bq_)**h, aq_**h*bq_**h)
steps(((aq_*bq_)**h - 1)/h, (aq_**h*bq_**h - aq_**h + aq_**h - 1)/h, aq_**h*(bq_**h - 1)/h + (aq_**h - 1)/h)
limit_is(aq_**h, h, 0, 1); limit_is(((aq_*bq_)**h - 1)/h, h, 0, log(aq_) + log(bq_))
same(Rational(6931, 10000) + Rational(10986, 10000), Rational(17917, 10000)); same(Rational(10986, 10000) - Rational(6931, 10000), Rational(4055, 10000))
limit_is((Rational(1, 2)**h - 1)/h, h, 0, -log(2))                         # m(1/2) = -m(2)
rounds(log(6), '1.7918'); rounds(log(Rational(3, 2)), '0.4055'); same(log(6), log(2) + log(3)); same(log(Rational(3, 2)), log(3) - log(2))
same(1 + Rational(6, 100)/12, Rational(1005, 1000))
bankA, bankB = 1000*Rational(1005, 1000)**12, 1000*exp(Rational(59, 1000)); monthly59 = 1000*(1 + Rational(59, 1000)/12)**12
rounds(bankA, '1061.68'); rounds(bankB, '1060.78'); rounds(bankA - bankB, '0.90')
same(limit(1000*(1 + Rational(59, 1000)/n)**n, n, oo), bankB)
rounds(bankB - monthly59, '0.15'); holds(bankB - monthly59 < bankA - monthly59)      # continuous vs monthly at 5.9%, against the extra 0.1%
```
:::
::::

## Check yourself {#quiz}

```quiz
? $\dfrac{d}{dx}\big(2^x\big)$ equals
- [x] $2^x\ln 2$
- [ ] $x\,2^{x-1}$
- [ ] $2^x$
- [ ] $\dfrac{2^x}{\ln 2}$
> By Theorem 6.3, $(a^x)' = a^x\ln a$. $x\,2^{x-1}$ applies the power rule, which needs the variable in the base, not in the exponent. $2^x$ leaves out the factor $\ln 2$, which is 1 only for the base $e$. $\dfrac{2^x}{\ln 2}$ is a function whose derivative is $2^x$ (Module 10), not the derivative of $2^x$.

? $\dfrac{d}{dx}\cosh x$ equals
- [ ] $-\sinh x$
- [x] $\sinh x$
- [ ] $\cosh x$
- [ ] $\dfrac{1}{\cosh^2 x}$
> $\cosh x = \tfrac12\big(e^x + e^{-x}\big)$, so its derivative is $\tfrac12\big(e^x - e^{-x}\big) = \sinh x$. The minus sign belongs to $(\cos x)' = -\sin x$, not to the hyperbolic functions; $\cosh x$ is the derivative of $\sinh x$; and $1/\cosh^2 x$ is the derivative of $\tanh x$.

? $\dfrac{d}{dx}\ln\big(x^2 + 1\big)$ equals
- [ ] $\dfrac{1}{x^2 + 1}$
- [ ] $\dfrac{1}{2x}$
- [ ] $2x\ln\big(x^2 + 1\big)$
- [x] $\dfrac{2x}{x^2 + 1}$
> By the chain rule, $(\ln u)' = u'/u$, with $u = x^2 + 1$ and $u' = 2x$. $\dfrac{1}{x^2 + 1}$ leaves out the factor $u'$; $\dfrac{1}{2x}$ is $1/u'$; and $2x\ln\big(x^2 + 1\big)$ treats $\ln$ as if it were its own derivative.

? $f$ is continuous and one-to-one on $\R$, with $f(1) = 3$ and $f'(1) = 4$. Then $(f^{-1})'(3)$ equals
- [ ] $4$
- [ ] $\dfrac13$
- [x] $\dfrac14$
- [ ] $-\dfrac49$
> The point $(1, 3)$ of the graph of $f$ mirrors to the point $(3, 1)$ of the graph of $f^{-1}$, and slopes become reciprocals: $(f^{-1})'(3) = 1/f'(1) = \tfrac14$. 4 is the slope of $f$, not of its inverse; $\tfrac13$ is $1/f(1)$; and $-\tfrac49 = -f'(1)/f(1)^2$ is the derivative of $1/f$ at 1, which confuses $f^{-1}$ with $1/f$.

? $\arcsin\Big(\sin\dfrac{5\pi}{6}\Big)$ equals
- [ ] $\dfrac{5\pi}{6}$
- [x] $\dfrac{\pi}{6}$
- [ ] $\dfrac12$
- [ ] $-\dfrac{\pi}{6}$
> $\sin\dfrac{5\pi}{6} = \sin\Big(\pi - \dfrac{\pi}{6}\Big) = \dfrac12$, and $\arcsin\dfrac12 = \dfrac{\pi}{6}$, the angle in $[-\pi/2, \pi/2]$ whose sine is $\tfrac12$. $\dfrac{5\pi}{6}$ is not in that interval, so $\arcsin$ never returns it; $\tfrac12$ is the sine, not the angle; and $-\dfrac{\pi}{6}$ has sine $-\tfrac12$.

? On the circle $x^2 + y^2 = 25$, the slope $\dfrac{dy}{dx}$ at $(-3, 4)$ is
- [x] $\dfrac34$
- [ ] $-\dfrac34$
- [ ] $\dfrac43$
- [ ] $-\dfrac43$
> Implicitly, $2x + 2y\,y' = 0$, so $y' = -x/y = -(-3)/4 = \tfrac34$: on the upper left of the circle the curve rises to the right. $-\tfrac34$ is the slope at $(3, 4)$; $-\tfrac43$ is the slope $y/x$ of the radius to $(-3, 4)$, which is perpendicular to the tangent line; and $\tfrac43$ is $-y/x$, the result of turning the fraction $-x/y$ upside down.

? For $x > 0$, $\dfrac{d}{dx}\big(x^x\big)$ equals
- [ ] $x\cdot x^{x-1}$
- [ ] $x^x\ln x$
- [ ] $x^x$
- [x] $x^x(\ln x + 1)$
> With $\ln y = x\ln x$, $\dfrac{y'}{y} = \ln x + 1$. $x\cdot x^{x-1}$ uses the power rule as if the exponent were constant, and $x^x\ln x$ the rule for exponentials as if the base were constant: the right answer is their sum. $x^x$ is what $x\cdot x^{x-1}$ simplifies to.

? A quantity is $y = 50e^{-0.2t}$ after $t$ years. Its half-life is
- [ ] 2.5 years
- [ ] 5 years
- [x] $\dfrac{\ln 2}{0.2} \approx 3.47$ years
- [ ] 25 years
> Solve $e^{-0.2T} = \tfrac12$: $0.2T = \ln 2$, so $T = \ln 2/0.2 \approx 3.47$, whatever the starting amount. 5 years is $1/0.2$, the time to fall to $1/e$ of the start, not to half of it; 2.5 years is $0.5/0.2$, the time it would take if the quantity kept falling at its starting rate; and 25 is half the starting amount, not a time.
```

```check
same(diff(2**x, x), 2**x*log(2)); same(diff(2**x/log(2), x), 2**x)
same(diff(cosh(x), x), sinh(x)); same(diff(sinh(x), x), cosh(x)); same(diff(tanh(x), x), 1/cosh(x)**2)
same(diff(log(x**2 + 1), x), 2*x/(x**2 + 1))
same(Rational(1, 4), 1/Integer(4)); same(-Rational(4, 9), -4/Integer(3)**2)
same(sin(5*pi/6), Rational(1, 2)); same(asin(sin(5*pi/6)), pi/6); same(sin(-pi/6), -Rational(1, 2))
same((-x/y).subs({x: -3, y: 4}), Rational(3, 4)); same((y/x).subs({x: -3, y: 4}), -Rational(4, 3)); same((-y/x).subs({x: -3, y: 4}), Rational(4, 3))
same(diff(xp**xp, xp), xp**xp*(log(xp) + 1)); same(xp*xp**(xp - 1), xp**xp)
same(solve(exp(-Rational(2, 10)*Tp) - Rational(1, 2), Tp), [log(2)/Rational(2, 10)]); rounds(log(2)/Rational(2, 10), '3.47')
same(exp(-Rational(2, 10)*5), exp(-1)); same(50*(1 - Rational(2, 10)*Rational(25, 10)), 25)
```
