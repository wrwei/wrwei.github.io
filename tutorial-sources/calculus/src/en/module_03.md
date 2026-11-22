---
title: Continuity and infinity
part: 1
lead: Learn what it means for a function to be continuous, and what continuity guarantees: solutions of equations, which the bisection method finds to any accuracy you ask for, and largest and smallest values. Then follow functions out to infinity, through asymptotes and limits at infinity, to the orders of growth behind big-O notation.
minutes: 255
needs: Modules 1 and 2
goals:
  - Decide whether a function is continuous at a point, and classify its discontinuities
  - Explain why the standard functions are continuous on their domains, and use continuity to find limits
  - Use the Intermediate Value Theorem to show that an equation has a solution, and find it by bisection to a guaranteed accuracy
  - State the Extreme Value Theorem, and show with examples why each of its hypotheses is needed
  - Find infinite limits and limits at infinity, and the vertical, horizontal and oblique asymptotes of a graph
  - Compare the growth of logarithms, powers, exponentials and factorials, and use big-O notation
---

## Continuity at a point {#continuity}

A cup of tea cooling from 80 °C to 60 °C passes through every temperature in between, because temperature changes gradually. A car park's charge does not. Suppose (hypothetically) that a car park charges £3 for each hour or part of an hour: 59 minutes cost £3, 61 minutes cost £6, and no stay costs £4.50. The charge jumps.

Module 2 met three ways for a limit to fail to exist: a jump, a blow-up and an oscillation. This module asks the opposite question: when is the limit at each point simply the value there? Such a function is **continuous**, and on an interval its graph can be drawn without lifting the pencil. Continuity guarantees that equations have solutions (Section 3.3), which can be found to any accuracy (Section 3.4), and that largest and smallest values exist (Section 3.5). Sections 3.6 to 3.8 then follow functions to infinity.

Here are two functions that agree to the left of 2 and differ from 2 on:

$$h(x) = \begin{cases} x^2 & \text{if } x < 2, \\ 6 - x & \text{if } x \ge 2, \end{cases}$$

$$k(x) = \begin{cases} x^2 & \text{if } x < 2, \\ 5 - x & \text{if } x \ge 2. \end{cases}$$

```valuetable
x = 1.9, 1.99, 1.999, 2, 2.001, 2.01, 2.1
$h(x)$ = Piecewise((x**2, x < 2), (6 - x, True))
$k(x)$ = Piecewise((x**2, x < 2), (5 - x, True))
digits = 7
---
x | h(x) | k(x)
1.9 | 3.61 | 3.61
1.99 | 3.9601 | 3.9601
1.999 | 3.996001 | 3.996001
2 | 4 | 3
2.001 | 3.999 | 2.999
2.01 | 3.99 | 2.99
2.1 | 3.9 | 2.9
```

Near 2, the values of $h$ crowd around 4 from both sides, and $h(2) = 4$: the value fits its neighbours. The values of $k$ crowd around 4 from the left and around 3 from the right: they disagree, and no single value at 2 could fit both.

For a polynomial $p$, Module 2 found that $\lim_{x\to a} p(x) = p(a)$: the limit is the value. Functions with this property at a point are called continuous there.

::: definition Continuity at a point
Let $f$ be defined on an open interval that contains $a$. Then $f$ is **continuous at $a$** if

$$\lim_{x\to a} f(x) = f(a).$$

This asks for three things:

1. $f(a)$ is defined;
2. $\lim_{x\to a} f(x)$ exists;
3. the limit equals the value.

If $f$ is defined on an open interval containing $a$, except perhaps at $a$ itself, and $f$ is not continuous at $a$, then $f$ is **discontinuous** at $a$, and $a$ is a **discontinuity** of $f$.
:::

In words: inputs close to $a$ give outputs close to $f(a)$, and the graph does not break at $(a, f(a))$. In the ε–δ language of Module 2: for every $\varepsilon > 0$ there is a $\delta > 0$ such that

$$\abs{f(x) - f(a)} < \varepsilon \quad\text{whenever}\quad \abs{x - a} < \delta.$$

(The limit only looks at $x \ne a$, but $x = a$ does no harm here, since $\abs{f(a) - f(a)} = 0$.)

::: example Testing the three conditions
Decide whether each function is continuous at 2. If it is not, say which condition fails.

- (a) $f(x) = \dfrac{x^2 - 4}{x - 2}$
- (b) $g(x) = \dfrac{x^2 - 4}{x - 2}$ for $x \ne 2$, and $g(2) = 1$
- (c) the function $h$ above
- (d) the function $k$ above

**(a)** Condition 1 fails: $f(2) = 0/0$ is not defined. So $f$ is discontinuous at 2, although its limit there exists: for $x \ne 2$, $f(x) = \dfrac{(x - 2)(x + 2)}{x - 2} = x + 2$, so $\lim_{x\to 2} f(x) = 4$.

**(b)** Now $g(2) = 1$ is defined, and the limit exists and is 4, as in (a): conditions 1 and 2 hold. Condition 3 fails, since $4 \ne 1$. So $g$ is discontinuous at 2.

**(c)** $h(2) = 6 - 2 = 4$. The formula changes at 2, so use one-sided limits (Module 2): from the left $\lim_{x\to 2^-} x^2 = 4$, and from the right $\lim_{x\to2^+} (6 - x) = 4$. They agree, so $\lim_{x\to2} h(x) = 4 = h(2)$: all three conditions hold, and $h$ is continuous at 2, although it is given by two formulas.

**(d)** From the left the limit is 4 again; from the right it is $\lim_{x\to2^+}(5 - x) = 3$. The one-sided limits differ, so condition 2 fails: $k$ is discontinuous at 2, although $k(2) = 3$ is defined.

```check
fa = (x**2 - 4)/(x - 2)
holds(fa.subs(x, 2) is S.NaN)                      # f(2) = 0/0 is not defined
same(factor(x**2 - 4), (x - 2)*(x + 2)); same(cancel(fa), x + 2); limit_is(fa, x, 2, 4)
holds(Ne(4, 1))                                    # (b): the limit 4 is not g(2) = 1
hc = Piecewise((x**2, x < 2), (6 - x, True)); kd = Piecewise((x**2, x < 2), (5 - x, True))
same(hc.subs(x, 2), 4); limit_is(x**2, x, 2, 4, '-'); limit_is(6 - x, x, 2, 4, '+')
same(kd.subs(x, 2), 3); limit_is(5 - x, x, 2, 3, '+')
same([hc.subs(x, v) for v in (Rational(19, 10), Rational(21, 10))], [Rational(361, 100), Rational(39, 10)])
same([kd.subs(x, v) for v in (Rational(1999, 1000), Rational(2001, 1000))], [Rational(3996001, 1000000), Rational(2999, 1000)])
```
:::

::: pitfall
Two opposite mistakes. Being defined at $a$ and having a limit at $a$ is not enough: the limit must equal the value, as (b) shows. And a formula in several pieces is no sign of a discontinuity: $h$ in (c) is continuous at 2 because its pieces meet there. Check the three conditions; do not judge by the look of the formula.
:::

### One-sided continuity {#one-sided}

Some functions jump, yet keep their value on one side of the jump, like the floor function. The **floor** of $x$, written $\lfloor x\rfloor$ and read "floor $x$", is the largest whole number less than or equal to $x$: $\lfloor 2.7\rfloor = 2$, $\lfloor 3\rfloor = 3$ and $\lfloor -2.7\rfloor = -3$. In Python it is `math.floor`, and integer division `7 // 2` gives $\lfloor 7/2\rfloor = 3$. Its graph is a staircase. At $x = 3$: for $x$ slightly less than 3, $\lfloor x\rfloor = 2$, and for $3 \le x < 4$, $\lfloor x\rfloor = 3$. So

$$\lim_{x\to3^-}\lfloor x\rfloor = 2, \qquad \lim_{x\to3^+}\lfloor x\rfloor = 3 = \lfloor 3\rfloor.$$

The limit at 3 does not exist, so the floor function is discontinuous at 3; but its value agrees with the limit from the right.

```check
same(floor(Rational(27, 10)), 2); same(floor(3), 3); same(floor(-Rational(27, 10)), -3); same(floor(Rational(7, 2)), 3)
limit_is(floor(x), x, 3, 2, '-'); limit_is(floor(x), x, 3, 3, '+')
```

::: definition One-sided continuity and continuity on an interval
A function $f$ is **continuous from the right** at $a$ if $\lim_{x\to a^+} f(x) = f(a)$, and **continuous from the left** at $a$ if $\lim_{x\to a^-} f(x) = f(a)$.

$f$ is **continuous on an interval** $I$ if it is continuous at every number of $I$, except that at an endpoint that belongs to $I$ it need only be continuous from the side of $I$: from the right at a left endpoint, from the left at a right endpoint.
:::

So $\lfloor x\rfloor$ is continuous from the right at every whole number, and continuous on each interval $[n, n + 1)$, but not on $[n, n + 1]$: at $n + 1$ it is not continuous from the left. The square root is defined only for $x \ge 0$, so at 0 only one side counts: $\lim_{x\to0^+}\sqrt x = 0 = \sqrt0$, and $\sqrt x$ is continuous on $[0, \infty)$ (Section 3.2). Since a limit exists exactly when both one-sided limits exist and are equal (Module 2), $f$ is continuous at $a$ exactly when it is continuous from both sides there.

Staircases are everywhere in computing: a digital thermometer that shows whole degrees, rounding down, displays $\lfloor T\rfloor$ for a true temperature $T$, and its reading jumps at every whole degree.

::: pitfall
Read one-sided continuity off the graph. Each step of $y = \lfloor x\rfloor$ has its filled dot at its left end, $(n, n)$, and runs to the right from there: so $\lfloor x\rfloor$ is continuous from the right. Calling it "continuous from the left" because the dot is on the left is the usual slip.
:::

### Kinds of discontinuity {#kinds}

Discontinuities come in a few kinds (Figure 3.1), named after what the graph does near the point.

::: figure id=fig-03-1
Four kinds of discontinuity at $x = 2$. Removable: the graph of $g$ (Example 3.1) heads for $(2, 4)$, but $g(2) = 1$; moving one point fills the hole. Jump: $k$ arrives at different heights from the two sides. Infinite: $1/(x - 2)^2$ grows without bound near the dashed line. Oscillating: $\sin\big(1/(x - 2)\big)$ swings between $-1$ and 1 infinitely often near 2.
:::

::: definition Kinds of discontinuity
Let $a$ be a discontinuity of $f$. The discontinuity is

- **removable** if $\lim_{x\to a} f(x)$ exists;
- a **jump** if both one-sided limits exist but are different;
- **infinite** if, as $x$ approaches $a$ from at least one side, the values $f(x)$ become, and stay, as large as you like, positive or negative (Section 3.6 writes this $\lim_{x\to a^+} f(x) = \infty$, and so on);
- **oscillating** in every other case: then at least one one-sided limit fails to exist without becoming infinite, as when $f$ keeps swinging between values.
:::

A removable discontinuity is removed by redefining $f$ at the single point $a$: set $f(a) = \lim_{x\to a} f(x)$. That repairs $g$ of Example 3.1: give it the value 4 at 2. No single value repairs a jump or an infinite discontinuity.

::: example Classifying discontinuities
Find and classify the discontinuities of

- (a) $r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$, the rational function of [Example 1.5](module_01_EN.html#rational);
- (b) $s(x) = \dfrac{\abs{x}}{x}$;
- (c) $q(x) = \dfrac{\sin x}{x}$.

**(a)** Module 1 factored top and bottom: $r(x) = \dfrac{(x - 2)(x + 2)}{(x - 2)(x + 1)}$. So $r$ is not defined at 2 and at $-1$, and $r(x) = \dfrac{x + 2}{x + 1}$ for every other $x$; Section 3.2 shows that $r$ is continuous everywhere except at these two numbers. At 2, by direct substitution in the cancelled form,

$$\lim_{x\to2} r(x) = \lim_{x\to2}\frac{x + 2}{x + 1} = \frac43,$$

so the discontinuity is removable: it is the hole at $\big(2, \tfrac43\big)$ that Module 1 found. At $-1$, the numerator $x + 2$ approaches 1 and the denominator $x + 1$ approaches 0, so the values of $r$ grow without bound: an infinite discontinuity (Section 3.6 finds the one-sided limits).

**(b)** $s$ is not defined at 0. It is $-1$ for $x < 0$ and $1$ for $x > 0$, so, as Module 2 found, $\lim_{x\to0^-} s(x) = -1$ and $\lim_{x\to0^+} s(x) = 1$: 0 is a jump discontinuity.

**(c)** $q$ is not defined at 0, and Module 2 proved that $\lim_{x\to0}\dfrac{\sin x}{x} = 1$. So 0 is a removable discontinuity: $\dfrac{\sin x}{x}$, given the value 1 at 0, is continuous at 0. This repaired function is the **sinc** function of signal processing (some books put $\pi x$ in place of $x$).

```check
rr = (x**2 - 4)/(x**2 - x - 2)
same(factor(x**2 - x - 2), (x - 2)*(x + 1)); same(cancel(rr), (x + 2)/(x + 1))
same_set(solve(x**2 - x - 2, x), [2, -1])
limit_is(rr, x, 2, Rational(4, 3)); same(((x + 2)/(x + 1)).subs(x, 2), Rational(4, 3))
limit_is(x + 2, x, -1, 1); limit_is(x + 1, x, -1, 0)
limit_is(rr, x, -1, oo, '+'); limit_is(rr, x, -1, -oo, '-')
xr = symbols('x', real=True)
sx = Abs(xr)/xr
limit_is(sx, xr, 0, -1, '-'); limit_is(sx, xr, 0, 1, '+')
same(sx.subs(xr, 5), 1); same(sx.subs(xr, -5), -1)
limit_is(sin(x)/x, x, 0, 1)
```
:::

::: pitfall
A zero in the denominator does not always mean an infinite discontinuity. The denominator of $r$ is 0 at 2, yet the discontinuity there is removable, because the numerator is 0 there too and the factor $x - 2$ cancels. Factor and cancel first, then decide. And the kind of discontinuity depends on the limits near $a$, not on whether $f(a)$ is defined: $s$ and $q$ are both undefined at 0, but differ in kind.
:::

## Which functions are continuous {#continuous-functions}

Checking three conditions at every point would never end. A few theorems settle continuity at once for every function built from the catalogue of Module 1.

### Sums, products and quotients {#laws}

::: theorem Continuity laws
If $f$ and $g$ are continuous at $a$ and $c$ is a constant, then the functions

$$f + g, \qquad f - g, \qquad cf, \qquad fg$$

are continuous at $a$, and so is $f/g$ if $g(a) \ne 0$. The same holds for continuity from one side, and so for continuity on an interval.
:::

::: proof
Each statement is a limit law of Module 2 in disguise. For the product: since $\lim_{x\to a} f(x) = f(a)$ and $\lim_{x\to a} g(x) = g(a)$, the product law gives

$$\lim_{x\to a} f(x)\,g(x) = \lim_{x\to a} f(x) \cdot \lim_{x\to a} g(x) = f(a)\,g(a),$$

which says that $fg$ is continuous at $a$. Sums, differences and constant multiples work the same way. The quotient law needs the limit of the denominator to be non-zero, and it is: $\lim_{x\to a} g(x) = g(a) \ne 0$. (So $g(x) \ne 0$ for $x$ close to $a$, and $f/g$ is defined on an open interval around $a$.) One-sided limits obey the same laws, which gives the one-sided statements.
:::

::: theorem Polynomials and rational functions
Every polynomial is continuous on $\R$. Every rational function is continuous at every number of its domain.
:::

::: proof
This is the direct substitution theorem of Module 2 in new words. For a polynomial $p$ and every number $a$, $\lim_{x\to a} p(x) = p(a)$. For a rational function $p/q$ and a number $a$ of its domain, $q(a) \ne 0$, and $\lim_{x\to a} p(x)/q(x) = p(a)/q(a)$. Each statement says that the limit is the value: continuity at $a$.
:::

This completes Example 3.2: $r$ is continuous at every number except 2 and $-1$.

### The catalogue is continuous {#catalogue}

::: theorem Continuity of the standard functions
Each of these functions is continuous at every number of its domain (at 0, the endpoint of the domain of an even root, from the right):

- roots $\sqrt[n]{x}$, for whole numbers $n \ge 2$;
- the trigonometric functions $\sin x$, $\cos x$, $\tan x$, $\cot x$, $\sec x$ and $\csc x$;
- exponential functions $a^x$, for $a > 0$;
- logarithms $\log_a x$, for $a > 0$ with $a \ne 1$; in particular $\ln x$.
:::

Here is why, family by family: proofs for sine, cosine and roots, and the idea of the proof for exponentials and logarithms. On a first reading you may take the theorem on trust.

**Sine and cosine.** Module 2 proved that $\sin h \to 0 = \sin 0$ and $\cos h \to 1 = \cos 0$ as $h \to 0$: sine and cosine are continuous at 0. For any other number $a$, write $x = a + h$, so that $h \to 0$ as $x \to a$. The addition formula of [Section 1.4](module_01_EN.html#trig) and those two limits give

$$\begin{aligned} \sin(a + h) &= \sin a\cos h + \cos a\sin h \\ &\to \sin a \cdot 1 + \cos a \cdot 0 = \sin a. \end{aligned}$$

In the same way $\cos(a + h) = \cos a\cos h - \sin a\sin h \to \cos a$. So sine and cosine are continuous on $\R$, and the other four, quotients of these two, are continuous wherever their denominators are not 0 (Theorem 3.1): on their domains.

```check
limit_is(sin(h), h, 0, 0); limit_is(cos(h), h, 0, 1); same(sin(0), 0); same(cos(0), 1)
same(expand_trig(sin(a + h)), sin(a)*cos(h) + cos(a)*sin(h)); same(expand_trig(cos(a + h)), cos(a)*cos(h) - sin(a)*sin(h))
same((sin(a)*cos(h) + cos(a)*sin(h)).subs(h, 0), sin(a)); same((cos(a)*cos(h) - sin(a)*sin(h)).subs(h, 0), cos(a))
```

**Roots.** By the root law of Module 2, $\lim_{x\to a}\sqrt[n]{x} = \sqrt[n]{a}$ for every $a > 0$, and for every $a$ when $n$ is odd. At 0 an even root is continuous from the right: $\sqrt[n]{x} < \varepsilon$ whenever $0 \le x < \varepsilon^n$, which is the ε–δ condition with $\delta = \varepsilon^n$.

```check
ap = symbols('a', positive=True); nr = symbols('n', positive=True, integer=True); ep = symbols('epsilon', positive=True)
limit_is(sqrt(x), x, ap, sqrt(ap)); limit_is(real_root(x, 3), x, -8, -2); limit_is(sqrt(x), x, 0, 0, '+')
same((ep**nr)**(1/nr), ep)                      # x < epsilon^n gives x^(1/n) < epsilon
```

**Exponentials and logarithms.** For an irrational $x$ such as $\sqrt2$, Module 1 defined $a^x$ as the number that $a^{1.4}, a^{1.41}, a^{1.414}, \dots$ approach. Making that precise is what shows $a^x$ to be continuous; it belongs to a course in analysis, and this series takes it as known. The logarithm $\log_a$ is the inverse of $a^x$, so its graph is the mirror image of the graph of $a^x$ in the line $y = x$ ([Theorem 1.2](module_01_EN.html#inverse)), and the mirror image of an unbroken curve is unbroken. That is the idea behind a fact proved in analysis courses: the inverse of a continuous function that is strictly increasing or strictly decreasing on an interval ([Exercise 1.10](module_01_EN.html#ex-1-10)) is continuous.

::: keyidea
Every function built from the catalogue of Module 1 with $+$, $-$, $\times$, $\div$ and composition (below) is continuous on every interval that lies in its domain. A discontinuity can only occur where a formula breaks down (a zero denominator, the logarithm of 0) or where a piecewise definition changes formula.
:::

::: pitfall
"Continuous on its domain" is not "continuous everywhere". The functions $1/x$ and $\tan x$ are continuous at every number of their domains, and books call them continuous functions; yet $1/x$ has an infinite discontinuity at 0, and $\tan x$ at $\pi/2$, numbers outside their domains where the graphs break. When you are asked where a function is continuous, give the intervals: $1/x$ is continuous on $(-\infty, 0)$ and on $(0, \infty)$, but not on $[-1, 1]$.
:::

### Composition {#composition}

Most formulas nest one function inside another: $\sqrt{9 - x^2}$, $\ln(1 + \cos x)$, $e^{(\sin x)/x}$. Limits can be moved inside such a nest, as long as the outer function is continuous.

::: theorem Limits of compositions
If $\lim_{x\to a} g(x) = b$ and $f$ is continuous at $b$, then

$$\lim_{x\to a} f\big(g(x)\big) = f(b) = f\Big(\lim_{x\to a} g(x)\Big).$$

The same holds for one-sided limits, and for limits as $x \to \infty$ or $x \to -\infty$ (Section 3.7).
:::

In words: if the inner function heads for $b$ and the outer function is continuous at $b$, the composition heads for $f(b)$. The proof is in the Going deeper box below. With $b = g(a)$, the theorem gives the composition rule:

::: theorem Continuity of compositions
If $g$ is continuous at $a$ and $f$ is continuous at $g(a)$, then $f \circ g$ is continuous at $a$.
:::

::: proof
Since $g$ is continuous at $a$, $\lim_{x\to a} g(x) = g(a)$. Since $f$ is continuous at $g(a)$, Theorem 3.4 with $b = g(a)$ gives

$$\lim_{x\to a} f\big(g(x)\big) = f\big(g(a)\big),$$

which says that $f \circ g$ is continuous at $a$.
:::

For example, $\abs{x} = \sqrt{x^2}$ is continuous on $\R$, as the composition of $x^2$ with the square root.

```check
xr2 = symbols('x', real=True); same(sqrt(xr2**2), Abs(xr2)); limit_is(Abs(x), x, 0, 0)
```

::: deeper Why limits pass inside continuous functions
Here is the proof of Theorem 3.4, with the ε–δ definition of Module 2. Let $\varepsilon > 0$. Because $f$ is continuous at $b$, there is a number $\eta > 0$ ($\eta$ is the Greek letter eta) such that

$$\abs{u - b} < \eta \quad\text{implies}\quad \abs{f(u) - f(b)} < \varepsilon.$$

Because $g(x) \to b$ as $x \to a$, the definition of that limit, applied with $\eta$ in the role of $\varepsilon$, gives a $\delta > 0$ such that

$$0 < \abs{x - a} < \delta \quad\text{implies}\quad \abs{g(x) - b} < \eta.$$

Chain the two: if $0 < \abs{x - a} < \delta$, then $u = g(x)$ satisfies $\abs{u - b} < \eta$, so $\abs{f(g(x)) - f(b)} < \varepsilon$. That is the definition of $\lim_{x\to a} f(g(x)) = f(b)$.

Continuity of $f$ at $b$, not merely a limit of $f$ at $b$, is needed. Let $f(u) = 0$ for $u \ne 0$ and $f(0) = 1$, and let $g(x) = 0$ for every $x$. Then $\lim_{u\to0} f(u) = 0$, but $f(g(x)) = f(0) = 1$ for every $x$, so $\lim_{x\to0} f(g(x)) = 1$. The proof breaks because $u = g(x)$ can equal $b$, and the limit of $f$ at $b$ says nothing about $f(b)$ itself; continuity does.
:::

::: example Where is it continuous?
Find the intervals on which each function is continuous.

- (a) $f(x) = \dfrac{\sin x}{x^2 + 1}$
- (b) $g(x) = \sqrt{9 - x^2}$
- (c) $h(x) = \ln(1 + \cos x)$

**(a)** $\sin x$ and $x^2 + 1$ are continuous on $\R$, and $x^2 + 1 \ge 1$ is never 0, so by the quotient law $f$ is continuous on $\R$.

**(b)** $g$ is the square root $\sqrt u$ composed with $u = 9 - x^2$, and its domain is where $9 - x^2 \ge 0$: $-3 \le x \le 3$. For $-3 < x < 3$, $u$ is positive, and $\sqrt u$ is continuous at every positive $u$, so $g$ is continuous at $x$ by Theorem 3.5. At the endpoint 3: as $x \to 3^-$, $u = 9 - x^2$ approaches 0 through positive values, and $\sqrt u \to 0$ as $u \to 0^+$, so $g(x) \to 0 = g(3)$. So $g$ is continuous from the left at 3, in the same way from the right at $-3$, and therefore continuous on $[-3, 3]$. Its graph is the upper half of the circle $x^2 + y^2 = 9$ (compare [Example 1.2](module_01_EN.html#domains)).

**(c)** $\ln u$ is continuous for $u > 0$ and $1 + \cos x$ is continuous everywhere, so $h$ is continuous wherever $1 + \cos x > 0$. Since $\cos x \ge -1$, $1 + \cos x \ge 0$, with equality exactly where $\cos x = -1$: at the odd multiples of $\pi$, $x = \pm\pi, \pm3\pi, \dots$. So $h$ is continuous on every interval between consecutive odd multiples of $\pi$: on $(-\pi, \pi)$, on $(\pi, 3\pi)$, and so on. At the odd multiples of $\pi$, $h$ is not defined, and its values plunge without bound (Section 3.6).

```check
from sympy.calculus.util import continuous_domain, function_range
same([s_ for s_ in solve(x**2 + 1, x) if s_.is_real], []); same(function_range(x**2 + 1, x, S.Reals), Interval(1, oo))
same(solve_univariate_inequality(9 - x**2 >= 0, x, relational=False), Interval(-3, 3))
same(continuous_domain(sqrt(9 - x**2), x, S.Reals), Interval(-3, 3))
limit_is(9 - x**2, x, 3, 0, '-'); holds((9 - x**2).subs(x, Rational(29, 10)) > 0)
limit_is(sqrt(9 - x**2), x, 3, 0, '-'); limit_is(sqrt(9 - x**2), x, -3, 0, '+'); same(sqrt(9 - x**2).subs(x, 3), 0)
same(function_range(1 + cos(x), x, S.Reals), Interval(0, 2))
same(solveset(1 + cos(x), x, Interval(-6*pi, 6*pi)), FiniteSet(-5*pi, -3*pi, -pi, pi, 3*pi, 5*pi))
limit_is(log(1 + cos(x)), x, pi, -oo)
```
:::

::: example Limits by continuity
Find (a) $\displaystyle\lim_{x\to 1} \ln\frac{x^2 - 1}{x - 1}$ and (b) $\displaystyle\lim_{x\to0} e^{(\sin x)/x}$.

**(a)** The inner function $g(x) = \dfrac{x^2 - 1}{x - 1}$ is not defined at 1, but for $x \ne 1$ it equals $\dfrac{(x - 1)(x + 1)}{x - 1} = x + 1$, so $\lim_{x\to1} g(x) = 2$. The logarithm is continuous at 2, so by Theorem 3.4

$$\lim_{x\to 1} \ln\frac{x^2 - 1}{x - 1} = \ln\Big(\lim_{x\to1}\frac{x^2 - 1}{x - 1}\Big) = \ln 2 \approx 0.6931.$$

The theorem needs the inner limit to exist, not the inner function to be continuous: here it has a removable discontinuity at 1.

**(b)** As $x \to 0$, the exponent $\dfrac{\sin x}{x}$ tends to 1 (Module 2), and $e^u$ is continuous at 1, so

$$\lim_{x\to0} e^{(\sin x)/x} = e^1 = e \approx 2.718.$$

```check
same(factor(x**2 - 1), (x - 1)*(x + 1)); same(cancel((x**2 - 1)/(x - 1)), x + 1); limit_is((x**2 - 1)/(x - 1), x, 1, 2)
limit_is(log((x**2 - 1)/(x - 1)), x, 1, log(2)); rounds(log(2), '0.6931')
limit_is(sin(x)/x, x, 0, 1); limit_is(exp(sin(x)/x), x, 0, E); rounds(E, '2.718')
```
:::

::: pitfall
A limit moves inside a function only if the function is continuous at the inner limit. The floor function is not continuous at 1: as $x \to 0$, $\cos x \to 1$, but for $0 < \abs{x} < \pi/2$, $0 < \cos x < 1$, so $\lfloor\cos x\rfloor = 0$. Hence $\lim_{x\to0}\lfloor\cos x\rfloor = 0$, not $\lfloor 1\rfloor = 1$.

```check
limit_is(cos(x), x, 0, 1); limit_is(floor(cos(x)), x, 0, 0); same(floor(cos(0)), 1)
same(floor(cos(Rational(1, 10))), 0); same(floor(cos(-Rational(3, 2))), 0); holds(Rational(3, 2) < pi/2)
```
:::

## The Intermediate Value Theorem {#ivt}

Walk up a mountain path from a hut at 1200 m to a summit at 2100 m. However the path twists and dips, at some moment you are at exactly 1500 m: your height changes continuously, so it cannot skip from below 1500 m to above it. In the same way, a horizontal line at any height $N$ between $f(a)$ and $f(b)$ must meet the graph of a continuous function somewhere between $a$ and $b$ (Figure 3.2).

::: figure id=fig-03-2
The Intermediate Value Theorem. Left: $f$ is continuous on $[a, b]$ and $N$ lies between $f(a)$ and $f(b)$, so the line $y = N$ meets the graph, here at three points $c_1$, $c_2$ and $c_3$. Right: a graph with a jump can skip over the height $N$, and then no $c$ has $f(c) = N$.
:::

::: theorem The Intermediate Value Theorem
Suppose that $f$ is continuous on the closed interval $[a, b]$, and let $N$ be any number strictly between $f(a)$ and $f(b)$. Then there is at least one number $c$ in $(a, b)$ with $f(c) = N$.
:::

The form you will use most is about roots. If $f$ is continuous on $[a, b]$ and $f(a)$ and $f(b)$ have opposite signs, then 0 lies strictly between them, so the equation $f(x) = 0$ has a solution in $(a, b)$.

The hypothesis is continuity on the whole closed interval, endpoints included, and every part of it is needed:

- *Without continuity.* Let $f(x) = -1$ for $x < 0$ and $f(x) = 1$ for $x \ge 0$. On $[-1, 1]$, $f(-1) = -1 < 0 < 1 = f(1)$, but $f$ is never 0: the jump at 0 skips every value strictly between $-1$ and 1.
- *Without continuity at an endpoint.* Let $g(0) = -1$ and $g(x) = x$ for $0 < x \le 1$. Then $g$ is continuous on $(0, 1]$, and $g(0) = -1 < 0 < 1 = g(1)$, but $g(x) = x$ is positive for every $x$ in $(0, 1]$: $g$ has no root. The culprit is the endpoint 0, where $g$ is not continuous from the right, since $\lim_{x\to0^+} g(x) = 0 \ne g(0)$.

Notice also what the theorem does not say. It promises at least one $c$, not exactly one: in Figure 3.2 there are three. And it does not say where $c$ is: it is an existence theorem. Section 3.4 turns it into a method for finding $c$.

::: example A root of a cubic
Show that the equation $x^3 - 2x - 5 = 0$ has a solution between 2 and 3.

Let $f(x) = x^3 - 2x - 5$. It is a polynomial, so it is continuous on $[2, 3]$ (Theorem 3.2). At the ends of the interval,

$$f(2) = 8 - 4 - 5 = -1, \qquad f(3) = 27 - 6 - 5 = 16.$$

Since $f(2) < 0 < f(3)$, the Intermediate Value Theorem with $N = 0$ gives a number $c$ in $(2, 3)$ with $f(c) = 0$. The theorem does not say where in $(2, 3)$; since $f(2) = -1$ is much closer to 0 than $f(3) = 16$, you may guess that $c$ is nearer 2. Section 3.4 finds $c \approx 2.0946$.

```check
fcub = x**3 - 2*x - 5
same(fcub.subs(x, 2), -1); same(8 - 4 - 5, -1); same(fcub.subs(x, 3), 16); same(27 - 6 - 5, 16)
root_cub = nsolve(fcub, x, 2.1)
holds(2 < root_cub < 3); rounds(root_cub, '2.0946')
```
:::

::: example Solving $\cos x = x$
Show that the equation $\cos x = x$ has a solution, and find an interval of length 1 that contains it.

No algebra solves $\cos x = x$. Rewrite it as $f(x) = 0$ with $f(x) = \cos x - x$, which is continuous on $\R$ as a difference of continuous functions (Theorems 3.1 and 3.3). Try a few values, in radians as always:

$$f(0) = \cos 0 - 0 = 1 > 0, \qquad f(1) = \cos 1 - 1 \approx 0.5403 - 1 = -0.4597 < 0.$$

By the Intermediate Value Theorem, $\cos x - x = 0$ has a solution in $(0, 1)$. Equations of this kind, mixing a trigonometric function with a polynomial, are common in physics and engineering, and no formula solves them; Section 3.4 finds this solution, about 0.739.

```check
fcx = cos(x) - x
same(fcx.subs(x, 0), 1); rounds(cos(1), '0.5403'); rounds(cos(1) - 1, '-0.4597'); holds(cos(1) - 1 < 0)
root_cx = nsolve(fcx, x, 0.7); holds(0 < root_cx < 1); rounds(root_cx, '0.739')
```
:::

::: pitfall
Check continuity on the whole interval before you use the theorem. $\tan x$ changes sign on $[\pi/4, 3\pi/4]$, from $\tan(\pi/4) = 1$ to $\tan(3\pi/4) = -1$, but it has no zero there (its zeros are the multiples of $\pi$). Its graph does not cross the axis; it jumps from $+\infty$ to $-\infty$ at the asymptote $x = \pi/2$, where $\tan x$ is not continuous.

```check
same(tan(pi/4), 1); same(tan(3*pi/4), -1); same(solveset(tan(x), x, Interval(pi/4, 3*pi/4)), S.EmptySet)
limit_is(tan(x), x, pi/2, oo, '-'); limit_is(tan(x), x, pi/2, -oo, '+')
```
:::

::: deeper Why the Intermediate Value Theorem is true
Here is the idea of the proof. Suppose $f$ is continuous on $[a, b]$ and $f(a) < N < f(b)$ (otherwise apply the argument to $-f$ and $-N$). Halve $[a, b]$. If $f$ takes the value $N$ at the midpoint, that is $c$; otherwise keep the half at whose left end $f$ is below $N$ and at whose right end it is above. Repeating gives intervals $[a_n, b_n]$, each half the one before, with $f(a_n) < N < f(b_n)$: the bisection method of the next section.

The left ends $a_0 \le a_1 \le a_2 \le \cdots$ never decrease, the right ends $b_0 \ge b_1 \ge b_2 \ge \cdots$ never increase, and the gap $b_n - a_n = (b - a)/2^n$ shrinks to 0. Here the proof needs a property of the real numbers themselves, their **completeness**: the number line has no gaps, so the $a_n$ and the $b_n$ close in on one and the same number $c$. (Module 14 states this property as the monotone convergence theorem: a sequence that never decreases and stays below a fixed bound has a limit.) Since $f$ is continuous at $c$, $f(a_n) \to f(c)$ and $f(b_n) \to f(c)$. Every $f(a_n)$ is below $N$ and every $f(b_n)$ above, so $f(c) \le N$ and $f(c) \ge N$: $f(c) = N$. Finally $c$ is neither $a$ nor $b$, because $f(a) \ne N \ne f(b)$.

Completeness is essential. Within the rational numbers alone the theorem is false: $x^2 - 2$ is negative at 1 and positive at 2, but no rational number $c$ has $c^2 = 2$, because $\sqrt2$ is irrational; the intervals $[a_n, b_n]$ close in on the gap where $\sqrt2$ would be. That the real numbers have no gaps is one of their axioms, studied in courses on real analysis.
:::

## The bisection method {#bisection}

The Intermediate Value Theorem says that $x^3 - 2x - 5$ has a root in $(2, 3)$, but not where. The **bisection method** finds it by applying the theorem again and again: halve the interval, and keep the half where the sign changes.

::: definition The bisection method
Let $f$ be continuous on $[a, b]$, with $f(a)$ and $f(b)$ of opposite signs. Start with the **bracket** $[a_0, b_0] = [a, b]$. For $n = 0, 1, 2, \dots$:

1. Compute the midpoint $m_n = \dfrac{a_n + b_n}{2}$ and the value $f(m_n)$.
2. If $f(m_n) = 0$, stop: $m_n$ is a root.
3. If $f(m_n)$ has the same sign as $f(a_n)$, the new bracket is $[a_{n+1}, b_{n+1}] = [m_n, b_n]$; otherwise it is $[a_{n+1}, b_{n+1}] = [a_n, m_n]$.

Stop when the bracket is as narrow as you need.
:::

Read $a_n$ as "a sub n". Step 3 always keeps a half at whose ends $f$ has opposite signs, so, by the Intermediate Value Theorem, every bracket contains a root (Figure 3.3).

::: figure id=fig-03-3
The bisection method for $f(x) = x^2 - 2$, starting from $[1, 2]$, where $f(1) = -1 < 0 < 2 = f(2)$. Each bracket $[a_n, b_n]$ is one half of the bracket above it: the half where $f$ changes sign. Every bracket contains the root $\sqrt2$ (dashed), and after six steps the bracket $[1.40625, 1.421875]$ has width $1/64$.
:::

::: example $\sqrt2$ by bisection
Use the bisection method on $f(x) = x^2 - 2$, starting from $[1, 2]$, to locate $\sqrt2$, the positive root of $f$. Carry out six steps.

$f$ is continuous and $f(1) = -1 < 0 < 2 = f(2)$, so the method can start. For $n = 0$, $m_0 = 1.5$ and $f(1.5) = 2.25 - 2 = 0.25$, positive like $f(b_0)$: the root is in the left half, $[a_1, b_1] = [1, 1.5]$. For $n = 1$, $m_1 = 1.25$ and $f(1.25) = 1.5625 - 2 = -0.4375$, negative like $f(a_1)$: the root is in the right half, $[a_2, b_2] = [1.25, 1.5]$. Continuing in the same way, with $f(m_n)$ rounded to 4 significant digits:

| $n$ | $a_n$ | $b_n$ | $m_n$ | $f(m_n)$ |
|---|---|---|---|---|
| 0 | 1 | 2 | 1.5 | 0.25 |
| 1 | 1 | 1.5 | 1.25 | −0.4375 |
| 2 | 1.25 | 1.5 | 1.375 | −0.1094 |
| 3 | 1.375 | 1.5 | 1.4375 | 0.06641 |
| 4 | 1.375 | 1.4375 | 1.40625 | −0.02246 |
| 5 | 1.40625 | 1.4375 | 1.421875 | 0.02173 |
| 6 | 1.40625 | 1.421875 | 1.4140625 | −0.0004272 |

After six steps the root lies in $[a_6, b_6] = [1.40625, 1.421875]$, a bracket of width $\tfrac{1}{64} = 0.015625$. So $\sqrt2 = 1.41\ldots$: the first two decimals are certain. The midpoint $m_6 = 1.4140625$ is within half the width, $\tfrac{1}{128} = 0.0078125$, of $\sqrt2$. In fact $\sqrt2 = 1.41421356\ldots$, so $m_6$ is off by only about 0.00015: the guarantee is a worst case.

```check
f_bis = lambda t: t**2 - 2
A_, B_ = Rational(1), Rational(2)
rows = []
for k_ in range(7):
    M_ = (A_ + B_)/2
    rows.append((k_, A_, B_, M_, f_bis(M_)))
    if sign(f_bis(M_)) == sign(f_bis(A_)):
        A_ = M_
    else:
        B_ = M_
shown = [(1, 2, '1.5', '0.25'), (1, '1.5', '1.25', '-0.4375'), ('1.25', '1.5', '1.375', '-0.1094'), ('1.375', '1.5', '1.4375', '0.06641'),
         ('1.375', '1.4375', '1.40625', '-0.02246'), ('1.40625', '1.4375', '1.421875', '0.02173'), ('1.40625', '1.421875', '1.4140625', '-0.0004272')]
for (k_, a_k, b_k, m_k, fm_k), (sa, sb, sm, sf) in zip(rows, shown):
    same(a_k, Rational(str(sa))); same(b_k, Rational(str(sb))); same(m_k, Rational(sm))
    rounds(fm_k, sf); holds(sign(fm_k) == sign(Rational(sf)))
same(rows[0][4], Rational(1, 4)); same(rows[1][4], -Rational(7, 16))           # exactly 0.25 and -0.4375
same(Rational(15, 10)**2 - 2, Rational(1, 4)); same(Rational(125, 100)**2, Rational(15625, 10000))
A6, B6 = rows[6][1], rows[6][2]                                                  # the bracket after six steps
same((A6, B6), (Rational(140625, 100000), Rational(1421875, 1000000))); same(B6 - A6, Rational(1, 64)); same(Rational(1, 64), Rational(15625, 1000000))
same((B6 - A6)/2, Rational(1, 128)); same(Rational(1, 128), Rational(78125, 10000000))
holds(A6 < sqrt(2) < B6); rounds(sqrt(2), '1.41421356'); rounds(abs(rows[6][3] - sqrt(2)), '0.00015')
```
:::

The values $f(m_n)$ in the table are rounded, but the signs, which are all that the method uses, are exact.

::: theorem The error of the bisection method
Let $f$ be continuous on $[a, b]$, with $f(a)$ and $f(b)$ of opposite signs. If the bisection method has not stopped at an exact root, then after $n$ steps the bracket $[a_n, b_n]$ contains a root $r$ of $f$, and

$$b_n - a_n = \frac{b - a}{2^n}, \qquad \abs{m_n - r} \le \frac{b - a}{2^{n+1}}.$$
:::

::: proof
Step 3 of the method keeps a half of the bracket at whose ends $f$ has opposite signs: if $f(m_n)$ has the sign of $f(a_n)$, it has the sign opposite to $f(b_n)$, and the new bracket is $[m_n, b_n]$; otherwise $f(m_n)$, which is not 0, has the sign opposite to $f(a_n)$, and the new bracket is $[a_n, m_n]$. So $f(a_n)$ and $f(b_n)$ have opposite signs for every $n$. Since $f$ is continuous on $[a_n, b_n]$, a part of $[a, b]$, the Intermediate Value Theorem gives a root $r$ in $(a_n, b_n)$. Each step halves the width of the bracket, so after $n$ steps the width is $(b - a)/2^n$. Finally, the midpoint of an interval is within half the interval's width of every point of the interval, in particular of $r$:

$$\abs{m_n - r} \le \frac12\cdot\frac{b - a}{2^n} = \frac{b - a}{2^{n+1}}.$$
:::

So the bisection method comes with a guarantee that most numerical methods lack: you know in advance how many steps give the accuracy you need. To make $\abs{m_n - r} \le \varepsilon$, it is enough that $(b - a)/2^{n+1} \le \varepsilon$, that is,

$$2^{n+1} \ge \frac{b - a}{\varepsilon}.$$

::: example How many steps?
How many steps of bisection, starting from $[1, 2]$, guarantee that the midpoint $m_n$ is within $10^{-6}$ of $\sqrt2$?

Here $b - a = 1$, so the condition is $2^{n+1} \ge 10^6$. Since $2^{19} = 524{,}288$ is too small and $2^{20} = 1{,}048{,}576$ is large enough, $n + 1 = 20$: after $n = 19$ steps, $m_{19}$ is within $2^{-20} \approx 9.5 \times 10^{-7}$ of $\sqrt2$. In terms of logarithms, $n + 1 \ge \log_2 10^6 \approx 19.93$.

Each step gains one binary digit. Since $2^{10} = 1024 \approx 10^3$, ten steps gain about three decimal digits, so each decimal digit costs about $3.3$ steps. Bisection is binary search on the number line, and the count is the one of [Section 1.4](module_01_EN.html#logarithms): binary search in a sorted list of a million items takes about 20 steps for the same reason.

```check
same(2**19, 524288); same(2**20, 1048576); holds(2**19 < 10**6); holds(2**20 >= 10**6)
rounds(Rational(1, 2**20), '9.5e-7'); rounds(log(10**6, 2), '19.93')
same(2**10, 1024); rounds(1/log(2, 10), '3.3')
```
:::

**Strengths and weaknesses.** Bisection always works when its hypotheses hold, with a guaranteed error. But it is slow, one binary digit per step whatever the function; Newton's method (Module 7) usually doubles the number of correct digits at every step, though it can fail. Bisection needs a sign change, so it cannot find a root where the graph touches the axis without crossing it, as $(x - 1)^2$ does at 1; and when a bracket contains several roots, it finds only one.

::: pitfall
The bisection method needs continuity, as the theorem behind it does. On $[1, 2]$, $f(x) = \tan x$ has $f(1) \approx 1.557 > 0$ and $f(2) \approx -2.185 < 0$, and bisection closes in on $1.5708\ldots = \pi/2$, the asymptote, where $\tan x$ has no root at all. The warning sign is in the table: the values $f(m_n)$ grow instead of shrinking. Try it in the widget below.

```check
rounds(tan(1), '1.557'); rounds(tan(2), '-2.185'); holds(tan(1) > 0); holds(tan(2) < 0)
rounds(pi/2, '1.5708'); holds(1 < pi/2 < 2); same(solveset(tan(x), x, Interval(1, 2)), S.EmptySet)
```
:::

::: widget name=bisection
Start with $x^2 - 2$ on $[1, 2]$. Press **Step** six times and compare the table with Example 3.7; the shaded band is the bracket. Press **Run 10 steps**: how many decimals of $\sqrt2$ are certain now? Choose $x^3 - 2x - 5$ on $[2, 3]$ (Example 3.5) and $\cos x - x$ on $[0, 1]$ (Example 3.6). For $x^2 - 2$, set $a = -2$: $f(-2)$ and $f(2)$ have the same sign, so the method cannot start, although $[-2, 2]$ contains two roots. Finally choose $\tan x$ on $[1, 2]$ and watch what happens without continuity.
:::

::: compute The bisection method in Python
The method takes a few lines of Python. This function runs `n` steps and returns the final bracket, or an exact root twice if it meets one:

```python
def bisection(f, a, b, n):
    """n steps of the bisection method on [a, b]; returns the last bracket."""
    if f(a) * f(b) >= 0:
        raise ValueError("f(a) and f(b) must have opposite signs")
    for _ in range(n):
        m = (a + b) / 2
        if f(m) == 0:
            return m, m                    # an exact root
        if (f(m) > 0) == (f(a) > 0):       # same sign as f(a): keep [m, b]
            a = m
        else:                              # otherwise keep [a, m]
            b = m
    return a, b

print(bisection(lambda x: x**2 - 2, 1, 2, 6))
```

```output
(1.40625, 1.421875)
```

That is the bracket $[a_6, b_6]$ of Example 3.7. By Example 3.8, 19 steps give $\sqrt2$ to within $10^{-6}$; compare the midpoint's real error with the guarantee $2^{-20}$:

```python
import math
a, b = bisection(lambda x: x**2 - 2, 1, 2, 19)
m = (a + b) / 2
print(m, abs(m - math.sqrt(2)), 2**-20)
```

```output
1.4142141342163086 5.718432134482754e-07 9.5367431640625e-07
```

The real error is smaller than the guarantee, as it often is. The same function solves $\cos x = x$ of Example 3.6:

```python
a, b = bisection(lambda x: math.cos(x) - x, 0, 1, 30)
print((a + b) / 2)
```

```output
0.7390851336531341
```

Without a sign change the method refuses to start. $(x - 1)^2$ has a root at 1, but it is positive on both sides:

```python fails
bisection(lambda x: (x - 1)**2, 0, 3, 10)
```

```output
ValueError: f(a) and f(b) must have opposite signs
```

Finally, floating-point numbers (Module 1) set a limit. Between 1 and 2 they are $2^{-52} \approx 2.2 \times 10^{-16}$ apart, so after 52 steps from $[1, 2]$ the ends of the bracket are neighbouring floating-point numbers, and further steps change nothing:

```python
a, b = bisection(lambda x: x**2 - 2, 1, 2, 60)
print(a, b, b - a)
```

```output
1.414213562373095 1.4142135623730951 2.220446049250313e-16
```
:::

```check
rounds(Rational(1, 2**52), '2.2e-16')
```

## The Extreme Value Theorem {#evt}

Over a whole day, from midnight to midnight, the outside temperature has a highest value and a lowest value, each reached at some moment of the day. That is not a fact about the weather: it holds for every continuous function on a closed interval.

::: definition Maximum and minimum values
Let $f$ be defined on an interval $I$. The number $f(c)$, for a $c$ in $I$, is the **maximum value** of $f$ on $I$ if $f(x) \le f(c)$ for every $x$ in $I$. The number $f(d)$, for a $d$ in $I$, is the **minimum value** of $f$ on $I$ if $f(x) \ge f(d)$ for every $x$ in $I$. Together they are the **extreme values** of $f$ on $I$.
:::

A maximum value must be a value: a number $f(c)$ that $f$ actually takes, not merely a number that the values approach. Module 8 calls these the absolute maximum and minimum, and finds them with derivatives.

::: theorem The Extreme Value Theorem
If $f$ is continuous on a closed interval $[a, b]$, then $f$ has a maximum value and a minimum value on $[a, b]$: there are numbers $c$ and $d$ in $[a, b]$ such that

$$f(d) \le f(x) \le f(c) \quad\text{for every } x \text{ in } [a, b].$$
:::

The proof needs the completeness of the real numbers, in a stronger form than the Intermediate Value Theorem did, and it belongs to a course in real analysis; this series uses the theorem without proof. What you can see now is why each hypothesis is needed (Figure 3.4):

- *A closed interval.* $f(x) = x$ is continuous on the open interval $(0, 1)$ but has no maximum value there: for any $x$ in $(0, 1)$, the number $\tfrac{x + 1}{2}$ is in $(0, 1)$ too, and larger. The values approach 1, but the end where they would reach it is missing. Likewise there is no minimum value.
- *Continuity.* On $[0, 1]$, let $f(x) = x$ for $0 \le x < 1$ and $f(1) = 0$. Again the values approach 1 without reaching it: the jump at 1 drops the value to 0. This $f$ has the minimum value 0, but no maximum value.
- *A bounded interval.* $[0, \infty)$ contains its endpoint but has no right end, so it is not a closed interval $[a, b]$. On it, $f(x) = \dfrac{x}{x + 1}$ is continuous and creeps up towards 1 (Section 3.7), but never reaches 1, since $x < x + 1$: no maximum value.

::: figure id=fig-03-4
The Extreme Value Theorem. Left: $f(x) = x^2 - 4x + 1$ is continuous on the closed interval $[0, 3]$ and reaches a maximum value 1 (at 0) and a minimum value $-3$ (at 2), as Example 3.9 shows. Centre: $x$ on the open interval $(0, 1)$ has neither; the hollow dots are the missing ends. Right: with a jump at 1, the values approach 1 without reaching it.
:::

```check
half = lambda X: (X + 1)/2
xs_ = symbols('x', positive=True)
holds(half(Rational(9, 10)) > Rational(9, 10)); holds(half(Rational(9, 10)) < 1)
same(simplify(half(x) - x), (1 - x)/2)
same(simplify(1 - x/(x + 1)), 1/(x + 1)); holds(1/(xs_ + 1) > 0); limit_is(x/(x + 1), x, oo, 1)
```

The theorem says that extreme values exist, not where: at an end of the interval, like the maximum in Figure 3.4, or inside it, like the minimum. In optimisation it guarantees that a best choice exists: a cost that depends continuously on a setting has a cheapest setting in every closed interval of settings. Module 8 shows how to find it.

::: example Does the theorem apply?
Decide whether the Extreme Value Theorem guarantees a maximum and a minimum value, and find them where you can.

- (a) $f(x) = x^2 - 4x + 1$ on $[0, 3]$
- (b) $g(x) = \dfrac{1}{x - 1}$ on $[2, 4]$
- (c) the same $g$ on $[0, 2]$

**(a)** $f$ is a polynomial, continuous on the closed interval $[0, 3]$, so the theorem guarantees both. To find them, complete the square: $f(x) = (x - 2)^2 - 3$. Since $(x - 2)^2 \ge 0$, with equality only at $x = 2$, the minimum value is $f(2) = -3$. On $[0, 3]$, $(x - 2)^2$ is largest where $x$ is farthest from 2, at $x = 0$, so the maximum value is $f(0) = 1$. (At the other end, $f(3) = -2$.)

**(b)** $g$ is continuous wherever $x \ne 1$, in particular on the closed interval $[2, 4]$, so the theorem applies. As $x$ increases, $x - 1$ increases and $\dfrac{1}{x - 1}$ decreases, so the maximum value is $g(2) = 1$ and the minimum value is $g(4) = \tfrac13$.

**(c)** $g$ is not defined at 1, which lies in $[0, 2]$, so $g$ is not continuous on $[0, 2]$, and the theorem does not apply. Indeed $g$ has no extreme values there: as $x$ approaches 1 from the right, $\dfrac{1}{x - 1}$ grows beyond any number you might propose as a maximum, and from the left it falls below any proposed minimum.

```check
f39 = x**2 - 4*x + 1
same(expand((x - 2)**2 - 3), f39); same(f39.subs(x, 2), -3); same(f39.subs(x, 0), 1); same(f39.subs(x, 3), -2)
same(minimum(f39, x, Interval(0, 3)), -3); same(maximum(f39, x, Interval(0, 3)), 1)
g39 = 1/(x - 1)
same(maximum(g39, x, Interval(2, 4)), 1); same(minimum(g39, x, Interval(2, 4)), Rational(1, 3))
same(g39.subs(x, 2), 1); same(g39.subs(x, 4), Rational(1, 3))
limit_is(g39, x, 1, oo, '+'); limit_is(g39, x, 1, -oo, '-')
```
:::

::: pitfall
Two slips. The theorem needs a closed interval $[a, b]$: "$f$ is continuous on $(0, 1)$, so it has a maximum" is wrong, as $f(x) = x$ shows. And when the hypotheses fail, the theorem says nothing, either way: it does not forbid extreme values. On the open interval $(-1, 2)$, $x^2$ has the minimum value 0, at 0, though it has no maximum value (its values approach 4 near 2).

```check
same(minimum(x**2, x, Interval.open(-1, 2)), 0); limit_is(x**2, x, 2, 4, '-')
```
:::

## Infinite limits and vertical asymptotes {#infinite-limits}

Module 1 noted that the values of $1/x$ "become huge" near 0, "positive on the right and negative on the left", and promised that this module would study such behaviour. Here are the numbers, for $1/x$ and $1/x^2$:

```valuetable
x = -0.1, -0.01, -0.001, 0.001, 0.01, 0.1
$\dfrac{1}{x}$ = 1/x
$\dfrac{1}{x^2}$ = 1/x**2
---
x | \dfrac{1}{x} | \dfrac{1}{x^2}
-0.1 | -10 | 100
-0.01 | -100 | 10000
-0.001 | -1000 | 1\times10^{6}
0.001 | 1000 | 1\times10^{6}
0.01 | 100 | 10000
0.1 | 10 | 100
```

As $x$ approaches 0 from either side, $1/x^2$ passes 100, 10,000, a million, and any bound $M$ you choose, and stays above it. Module 2 showed that no number is its limit; but the limit fails to exist in such a definite way that it gets its own notation.

::: definition Infinite limits and vertical asymptotes
Let $f$ be defined on an open interval containing $a$, except perhaps at $a$ itself. Then

$$\lim_{x\to a} f(x) = \infty,$$

read "the limit of $f$ of $x$ as $x$ approaches $a$ is infinity", means that $f(x)$ is larger than any number $M$ you choose, for every $x \ne a$ close enough to $a$. Likewise $\lim_{x\to a} f(x) = -\infty$ means that $f(x)$ is less than any number you choose, for every $x \ne a$ close enough to $a$. One-sided infinite limits, such as $\lim_{x\to a^+} f(x) = \infty$, look only at $x$ on one side of $a$.

The line $x = a$ is a **vertical asymptote** of the graph of $f$ if at least one of the one-sided limits $\lim_{x\to a^-} f(x)$ and $\lim_{x\to a^+} f(x)$ is $\infty$ or $-\infty$.
:::

So $\lim_{x\to0} 1/x^2 = \infty$. For $1/x$ the two sides disagree,

$$\lim_{x\to0^+}\frac1x = \infty, \qquad \lim_{x\to0^-}\frac1x = -\infty,$$

and $1/x$ has no limit at 0, not even an infinite one. Both graphs have the vertical asymptote $x = 0$: near it the graph runs alongside the line, up or down without end. Writing $\lim f(x) = \infty$ does not make $\infty$ a number. The limit still does not exist; the notation records how it fails.

```check
limit_is(1/x**2, x, 0, oo); limit_is(1/x, x, 0, oo, '+'); limit_is(1/x, x, 0, -oo, '-')
same((1/x**2).subs(x, Rational(1, 1000)), 10**6); same((1/x**2).subs(x, Rational(1, 100)), 10**4)
```

Most vertical asymptotes come from a fraction whose denominator tends to 0 while its numerator does not. A non-zero number divided by a tiny one is huge, and the signs decide whether it is huge and positive or huge and negative:

::: theorem Non-zero over zero
Suppose that $\lim_{x\to a^+} f(x) = L$, a number with $L \ne 0$, and $\lim_{x\to a^+} g(x) = 0$. If $g(x) > 0$ for every $x$ in some interval $(a, a + \delta)$, then

$$\lim_{x\to a^+}\frac{f(x)}{g(x)} = \infty \text{ if } L > 0, \qquad \lim_{x\to a^+}\frac{f(x)}{g(x)} = -\infty \text{ if } L < 0.$$

If instead $g(x) < 0$ on such an interval, the two signs swap. The same holds for limits from the left and for two-sided limits.
:::

::: proof
Take $L > 0$ and $g(x) > 0$; the other cases are alike. Since $f(x) \to L$, for $x$ close enough to $a$ (and greater than $a$) $f(x)$ is within $\tfrac{L}{2}$ of $L$, so $f(x) > \tfrac{L}{2}$. Now let $M > 0$ be any number. Since $g(x) \to 0$ through positive values, for $x$ close enough to $a$ also $0 < g(x) < \tfrac{L}{2M}$. For such $x$, both hold, and

$$\frac{f(x)}{g(x)} > \frac{L/2}{L/(2M)} = M.$$

So $f(x)/g(x)$ exceeds every $M$ once $x$ is close enough to $a$: its limit is $\infty$.
:::

```check
Lp, Mp = symbols('L M', positive=True)
same((Lp/2)/(Lp/(2*Mp)), Mp)
```

::: example One-sided infinite limits
Find the one-sided limits and the vertical asymptotes of (a) $r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$ at $-1$; (b) $\ln x$ at 0; (c) $\tan x$ at $\pi/2$.

**(a)** For $x$ near $-1$ (and $x \ne -1$), $r(x) = \dfrac{x + 2}{x + 1}$ (Example 3.2). The numerator tends to 1, which is positive, and the denominator to 0. For $x$ slightly greater than $-1$, $x + 1 > 0$; for $x$ slightly less, $x + 1 < 0$. By Theorem 3.9,

$$\lim_{x\to-1^+} r(x) = \infty, \qquad \lim_{x\to-1^-} r(x) = -\infty,$$

and the line $x = -1$ is a vertical asymptote. The other zero of the denominator, 2, gives no asymptote: there the limit is $\tfrac43$ (Example 3.2), and the graph has a hole.

**(b)** $\ln x$ is defined only for $x > 0$, so only the limit from the right makes sense. Since $\ln$ is increasing and $\ln e^{-M} = -M$, $\ln x$ is less than $-M$ exactly when $0 < x < e^{-M}$. So $\ln x$ falls below any number $-M$ once $x$ is close enough to 0:

$$\lim_{x\to0^+}\ln x = -\infty,$$

and the $y$-axis is a vertical asymptote of $y = \ln x$, as in [Figure 1.3](module_01_EN.html#fig-01-3).

**(c)** As $x \to \pi/2$, $\sin x \to 1$ and $\cos x \to 0$. On the unit circle, $\cos x$ is positive for $x$ slightly less than $\pi/2$ and negative for $x$ slightly greater. By Theorem 3.9,

$$\lim_{x\to\pi/2^-}\tan x = \infty, \qquad \lim_{x\to\pi/2^+}\tan x = -\infty,$$

so $x = \pi/2$ is a vertical asymptote of $y = \tan x$, and so is every line $x = \pi/2 + k\pi$, since $\tan$ has period $\pi$.

```check
limit_is(rr, x, -1, oo, '+'); limit_is(rr, x, -1, -oo, '-'); same((x + 2).subs(x, -1), 1)
holds((x + 1).subs(x, -Rational(99, 100)) > 0); holds((x + 1).subs(x, -Rational(101, 100)) < 0)
limit_is(rr, x, 2, Rational(4, 3))
Mr = symbols('M', real=True); same(log(exp(-Mr)), -Mr); limit_is(log(x), x, 0, -oo, '+')
limit_is(sin(x), x, pi/2, 1); limit_is(cos(x), x, pi/2, 0)
holds(cos(pi/2 - Rational(1, 100)) > 0); holds(cos(pi/2 + Rational(1, 100)) < 0)
limit_is(tan(x), x, pi/2, oo, '-'); limit_is(tan(x), x, pi/2, -oo, '+'); same(tan(x + pi), tan(x))
```
:::

::: pitfall
$\infty$ is not a number, so do not calculate with it as if it were. If $f(x) \to \infty$ and $g(x) \to \infty$, the difference $f(x) - g(x)$ can do anything. With $f(x) = \dfrac{1}{x^2} + 1$ and $g(x) = \dfrac{1}{x^2}$, both tend to $\infty$ as $x \to 0$, and the difference is 1; with $f(x) = \dfrac{2}{x^2}$ and the same $g$, the difference is $\dfrac{1}{x^2} \to \infty$. So "$\infty - \infty = 0$" is wrong, and so is "$\infty/\infty = 1$": the quotient of $\dfrac{2}{x^2}$ and $\dfrac{1}{x^2}$ is 2. Such forms are **indeterminate**: their value depends on the functions, and Module 7 shows how to find it. And do not write $\lim_{x\to0} 1/x = \infty$: the two sides disagree.

```check
same((1/x**2 + 1) - 1/x**2, 1); same(2/x**2 - 1/x**2, 1/x**2); limit_is(2/x**2 - 1/x**2, x, 0, oo)
limit_is(1/x**2 + 1, x, 0, oo); limit_is((2/x**2)/(1/x**2), x, 0, 2)
```
:::

## Limits at infinity and asymptotes {#limits-at-infinity}

Now let $x$, rather than $f(x)$, grow without bound. Here is the function $r$ of Example 3.2 far from the origin:

```valuetable
x = -1000, -100, -10, 10, 100, 1000
$r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$ = (x**2 - 4)/(x**2 - x - 2)
---
x | r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}
-1000 | 0.998999
-100 | 0.989899
-10 | 0.888889
10 | 1.09091
100 | 1.00990
1000 | 1.00100
```

As $x$ grows, positive or negative, $r(x)$ settles down to 1: from above for large positive $x$, from below for large negative $x$. The cancelled form shows why: for $x \ne 2$ and $x \ne -1$,

$$r(x) = \frac{x + 2}{x + 1} = 1 + \frac{1}{x + 1},$$

and $\dfrac{1}{x + 1}$ shrinks towards 0 as $x$ grows in size. It is positive when $x > -1$ and negative when $x < -1$, which is why $r(x)$ approaches 1 from above on the right and from below on the left.

```check
same(cancel(rr), 1 + 1/(x + 1)); limit_is(1/(x + 1), x, oo, 0); limit_is(1/(x + 1), x, -oo, 0)
limit_is(rr, x, oo, 1); limit_is(rr, x, -oo, 1)
```

::: definition Limits at infinity and horizontal asymptotes
Let $f$ be defined on an interval $(c, \infty)$. Then

$$\lim_{x\to\infty} f(x) = L,$$

read "the limit of $f$ of $x$ as $x$ tends to infinity is $L$", means that $f(x)$ is as close to $L$ as you like for every large enough $x$. For $f$ defined on an interval $(-\infty, c)$, $\lim_{x\to-\infty} f(x) = L$ means the same, for every $x$ that is negative and large enough in size. The line $y = L$ is a **horizontal asymptote** of the graph of $f$ if $\lim_{x\to\infty} f(x) = L$ or $\lim_{x\to-\infty} f(x) = L$.

Similarly, $\lim_{x\to\infty} f(x) = \infty$ means that $f(x)$ is larger than any number $M$ you choose, for every large enough $x$; and so on for $-\infty$.
:::

So the line $y = 1$ is a horizontal asymptote of $r$, at both ends (Figure 3.5). The limit laws, the squeeze theorem and Theorem 3.4 all hold for limits at infinity, with the same proofs.

Everything rests on one basic limit: for every $p > 0$,

$$\lim_{x\to\infty}\frac{1}{x^p} = 0.$$

Indeed, for $x > 0$, $\dfrac{1}{x^p} < \varepsilon$ exactly when $x^p > \dfrac{1}{\varepsilon}$, that is, when $x > \varepsilon^{-1/p}$; so $1/x^p$ is within $\varepsilon$ of 0 for every large enough $x$. For whole numbers $k \ge 1$ also $1/x^k \to 0$ as $x \to -\infty$, since $\abs{1/x^k} = 1/\abs{x}^k$.

```check
pp = symbols('p', positive=True); ep = symbols('epsilon', positive=True)
same((ep**(-1/pp))**pp, 1/ep); limit_is(1/x**pp, x, oo, 0)
for k_ in (1, 2, 3):
    limit_is(1/x**k_, x, -oo, 0)
```

### Rational functions {#rational-at-infinity}

To find the limit of a rational function at infinity, divide the numerator and the denominator by the highest power of $x$ in the denominator: then every term but the leading ones tends to 0. The result is worth remembering.

::: theorem Rational functions at infinity
Let

$$f(x) = \frac{a_m x^m + \dots + a_1x + a_0}{b_n x^n + \dots + b_1x + b_0},$$

with $a_m \ne 0$ and $b_n \ne 0$, so that the numerator has degree $m$ and the denominator degree $n$. As $x \to \infty$, and also as $x \to -\infty$, $f(x)$ behaves like the ratio of the leading terms, $\dfrac{a_m x^m}{b_n x^n}$:

- if $m < n$, then $f(x) \to 0$, and the $x$-axis is a horizontal asymptote;
- if $m = n$, then $f(x) \to \dfrac{a_m}{b_n}$, and the line $y = \dfrac{a_m}{b_n}$ is a horizontal asymptote;
- if $m > n$, then $f(x) \to \infty$ or $-\infty$, with the sign of $\dfrac{a_m}{b_n}x^{m-n}$, and there is no horizontal asymptote.
:::

::: proof
For $x \ne 0$, take the leading term out of the numerator and out of the denominator:

$$f(x) = \frac{a_m x^m}{b_n x^n} \cdot \frac{1 + c_1/x + \dots + c_m/x^m}{1 + d_1/x + \dots + d_n/x^n},$$

where $c_k = a_{m-k}/a_m$ and $d_k = b_{n-k}/b_n$ are constants. As $x \to \pm\infty$, every term $c_k/x^k$ and $d_k/x^k$ tends to 0, so the second fraction tends to $\dfrac{1 + 0 + \dots + 0}{1 + 0 + \dots + 0} = 1$. The first fraction equals $\dfrac{a_m}{b_n}x^{m-n}$: it tends to 0 if $m < n$, it is the constant $\dfrac{a_m}{b_n}$ if $m = n$, and it tends to $\infty$ or $-\infty$ if $m > n$. In the last case the product of a factor that grows without bound and a factor that tends to 1 grows without bound, with the same sign.
:::

```check
pr = (3*x**2 + 2*x + 1)/(5*x**2 - x + 4)                      # m = n = 2: c1 = 2/3, c2 = 1/3, d1 = -1/5, d2 = 4/5
same(pr, (3*x**2/(5*x**2))*(1 + Rational(2, 3)/x + Rational(1, 3)/x**2)/(1 - Rational(1, 5)/x + Rational(4, 5)/x**2))
limit_is(pr, x, oo, Rational(3, 5)); limit_is(pr, x, -oo, Rational(3, 5))
```

::: example Rational functions at infinity
Find

- (a) $\displaystyle\lim_{x\to\infty}\frac{6x^3 - 5x + 1}{2x^3 + x^2}$
- (b) $\displaystyle\lim_{x\to-\infty}\frac{4x - 7}{x^2 + 1}$
- (c) $\displaystyle\lim_{x\to-\infty}\frac{x^3 - 2}{3x^2 + 5}$

**(a)** The degrees are equal, 3 and 3. Divide the numerator and the denominator by $x^3$:

$$\frac{6x^3 - 5x + 1}{2x^3 + x^2} = \frac{6 - 5/x^2 + 1/x^3}{2 + 1/x} \to \frac{6 - 0 + 0}{2 + 0} = 3.$$

The line $y = 3$ is a horizontal asymptote, as Theorem 3.10 predicts: $3 = 6/2$, the ratio of the leading coefficients.

**(b)** Degree 1 over degree 2: divide by $x^2$:

$$\frac{4x - 7}{x^2 + 1} = \frac{4/x - 7/x^2}{1 + 1/x^2} \to \frac{0 - 0}{1 + 0} = 0.$$

The $x$-axis is a horizontal asymptote (at both ends, since the same computation works as $x \to \infty$).

**(c)** Degree 3 over degree 2. The ratio of the leading terms is $\dfrac{x^3}{3x^2} = \dfrac{x}{3}$, which tends to $-\infty$ as $x \to -\infty$. So, by Theorem 3.10,

$$\lim_{x\to-\infty}\frac{x^3 - 2}{3x^2 + 5} = -\infty,$$

and there is no horizontal asymptote on the left (nor on the right, where the limit is $\infty$).

```check
fa11 = (6*x**3 - 5*x + 1)/(2*x**3 + x**2)
same(fa11, (6 - 5/x**2 + 1/x**3)/(2 + 1/x)); limit_is(fa11, x, oo, 3); same(Rational(6, 2), 3)
fb11 = (4*x - 7)/(x**2 + 1)
same(fb11, (4/x - 7/x**2)/(1 + 1/x**2)); limit_is(fb11, x, -oo, 0); limit_is(fb11, x, oo, 0)
fc11 = (x**3 - 2)/(3*x**2 + 5)
same(x**3/(3*x**2), x/3); limit_is(fc11, x, -oo, -oo); limit_is(fc11, x, oo, oo)
```
:::

Roots need one more idea: $\sqrt{x^2} = \abs{x}$, not $x$ (the pitfall of [Section 1.4](module_01_EN.html#roots)), and for $x < 0$, $\abs{x} = -x$.

::: example Two different horizontal asymptotes
Find the horizontal asymptotes of $f(x) = \dfrac{\sqrt{4x^2 + 1}}{x - 3}$.

The leading term under the root is $4x^2$, so take $x^2$ out of the root: for $x \ne 0$,

$$\sqrt{4x^2 + 1} = \sqrt{x^2\Big(4 + \frac{1}{x^2}\Big)} = \abs{x}\sqrt{4 + \frac{1}{x^2}}.$$

For $x > 3$, $\abs{x} = x$; divide the numerator and the denominator by $x$:

$$f(x) = \frac{\sqrt{4 + 1/x^2}}{1 - 3/x} \to \frac{\sqrt4}{1} = 2 \qquad (x \to \infty),$$

using the continuity of the square root at 4 (Theorem 3.4). For $x < 0$, $\abs{x} = -x$, and

$$f(x) = \frac{-x\sqrt{4 + 1/x^2}}{x - 3} = -\frac{\sqrt{4 + 1/x^2}}{1 - 3/x} \to -2 \qquad (x \to -\infty).$$

So the graph has two horizontal asymptotes: $y = 2$ on the right and $y = -2$ on the left. Forgetting the sign of $\abs{x}$ gives the wrong answer 2 on the left. (There is also the vertical asymptote $x = 3$, by Theorem 3.9: the numerator tends to $\sqrt{37} \ne 0$ there.)

```check
f12 = sqrt(4*x**2 + 1)/(x - 3)
xpos = symbols('x', positive=True); xneg = symbols('x', negative=True)
same(sqrt(xpos**2*(4 + 1/xpos**2)), xpos*sqrt(4 + 1/xpos**2)); same(sqrt(xneg**2*(4 + 1/xneg**2)), -xneg*sqrt(4 + 1/xneg**2))
same(xpos*sqrt(4 + 1/xpos**2)/(xpos - 3), sqrt(4 + 1/xpos**2)/(1 - 3/xpos))
same(-xneg*sqrt(4 + 1/xneg**2)/(xneg - 3), -sqrt(4 + 1/xneg**2)/(1 - 3/xneg))
limit_is(f12, x, oo, 2); limit_is(f12, x, -oo, -2)
same(sqrt(4*x**2 + 1).subs(x, 3), sqrt(37)); limit_is(f12, x, 3, oo, '+'); limit_is(f12, x, 3, -oo, '-')
```
:::

### Exponentials, logarithms and oscillations {#other-limits}

**Exponentials.** Let $a > 1$, and write $a = 1 + q$ with $q > 0$. Then $a^n = (1 + q)^n \ge 1 + nq$ for every whole number $n \ge 1$: it is an equality for $n = 1$, and each further factor $1 + q$ keeps it true, since

$$(1 + nq)(1 + q) = 1 + (n + 1)q + nq^2 \ge 1 + (n + 1)q.$$

So $a^n$ exceeds any number $M$ once $n > M/q$, and since $a^x$ increases with $x$,

$$\lim_{x\to\infty} a^x = \infty, \qquad \lim_{x\to-\infty} a^x = \lim_{x\to-\infty}\frac{1}{a^{-x}} = 0 \qquad (a > 1).$$

For $0 < a < 1$ the two limits are swapped. In particular $e^x \to \infty$ as $x \to \infty$ and $e^x \to 0$ as $x \to -\infty$: the $x$-axis is a horizontal asymptote of $y = e^x$ on the left, as [Figure 1.3](module_01_EN.html#fig-01-3) shows.

**Logarithms.** $\ln x$ grows without bound too, but slowly: $\ln x > M$ exactly when $x > e^M$, so $\ln x \to \infty$ as $x \to \infty$, yet to pass 100, $x$ must exceed $e^{100} \approx 2.7 \times 10^{43}$.

**Oscillations.** $\sin x$ has no limit as $x \to \infty$: it keeps swinging between $-1$ and 1. But $\dfrac{\sin x}{x} \to 0$, by the squeeze theorem: for $x > 0$,

$$-\frac1x \le \frac{\sin x}{x} \le \frac1x,$$

and both bounds tend to 0. In the same way $e^{-x}\sin x \to 0$, squeezed between $-e^{-x}$ and $e^{-x}$: a damped oscillation, like the vibration of a plucked string or the current in a circuit after a switch is opened, dies away to 0.

```check
qp = symbols('q', positive=True); np_ = symbols('n', positive=True, integer=True)
same(expand((1 + np_*qp)*(1 + qp)), 1 + (np_ + 1)*qp + np_*qp**2)
for nq in (1, 5, 20):
    holds((1 + qp)**nq >= 1 + nq*qp)                                  # Bernoulli's inequality, a few cases
# SymPy 1.14 gets limit(a**x, x, -oo) wrong, so limits at -oo are checked as limits at oo with x -> -x:
limit_is(2**x, x, oo, oo); limit_is(2**(-x), x, oo, 0); same(2**(-x), 1/2**x); limit_is(exp(x), x, oo, oo); limit_is(exp(-x), x, oo, 0)
limit_is((Rational(1, 2))**x, x, oo, 0); limit_is((Rational(1, 2))**(-x), x, oo, oo)
Mr2 = symbols('M', real=True); same(log(exp(Mr2)), Mr2); limit_is(log(x), x, oo, oo)
rounds(exp(100), '2.7e43')
limit_is(sin(x)/x, x, oo, 0); limit_is(1/x, x, oo, 0); limit_is(exp(-x)*sin(x), x, oo, 0); limit_is(exp(-x), x, oo, 0)
```

::: pitfall
A graph can cross its horizontal asymptote, even infinitely often: $\dfrac{\sin x}{x}$ is 0 at every multiple of $\pi$. An asymptote describes the graph far out; it is not a line that the graph never touches.

```check
same((sin(x)/x).subs(x, 5*pi), 0); same((sin(x)/x).subs(x, 100*pi), 0)
```
:::

### Oblique asymptotes {#oblique}

When the degree of the numerator is one more than that of the denominator, a rational function grows without bound, but in a definite direction: its graph approaches a slanted line.

::: definition Oblique asymptote
The line $y = mx + c$, with $m \ne 0$, is an **oblique asymptote** (or slant asymptote) of the graph of $f$ if

$$\lim_{x\to\infty}\big[f(x) - (mx + c)\big] = 0 \quad\text{or}\quad \lim_{x\to-\infty}\big[f(x) - (mx + c)\big] = 0.$$
:::

The bracket is the vertical distance between the graph and the line, and it shrinks to 0. For a rational function $p/q$ whose numerator has degree one more than its denominator, divide: $p(x) = q(x)(mx + c) + s(x)$, with a remainder $s$ of lower degree than $q$ (polynomial long division from school algebra, or the trick in the next example). Then

$$\frac{p(x)}{q(x)} = mx + c + \frac{s(x)}{q(x)},$$

and $\dfrac{s(x)}{q(x)} \to 0$ as $x \to \pm\infty$ by Theorem 3.10, so $y = mx + c$ is an oblique asymptote at both ends.

::: example An oblique asymptote
Find the asymptotes of $f(x) = \dfrac{x^2 + 1}{x - 1}$, and decide on which side of each the graph lies.

Divide $x^2 + 1$ by $x - 1$. Here a trick avoids long division: $x^2 + 1 = (x^2 - 1) + 2 = (x - 1)(x + 1) + 2$. So, for $x \ne 1$,

$$f(x) = x + 1 + \frac{2}{x - 1}.$$

As $x \to \pm\infty$, $\dfrac{2}{x - 1} \to 0$, so $y = x + 1$ is an oblique asymptote at both ends. For $x > 1$, $\dfrac{2}{x - 1} > 0$, so the graph lies above the asymptote; for $x < 1$, it lies below. At $x = 1$ the numerator is $2 \ne 0$ and the denominator tends to 0, positive on the right and negative on the left, so by Theorem 3.9

$$\lim_{x\to1^+} f(x) = \infty, \qquad \lim_{x\to1^-} f(x) = -\infty,$$

and $x = 1$ is a vertical asymptote. There is no horizontal asymptote: $f(x) \to \infty$ as $x \to \infty$ and $f(x) \to -\infty$ as $x \to -\infty$. Figure 3.5 shows the graph and its asymptotes.

```check
f13 = (x**2 + 1)/(x - 1)
steps(x**2 + 1, (x**2 - 1) + 2, (x - 1)*(x + 1) + 2); same(div(x**2 + 1, x - 1), (x + 1, 2))
same(f13, x + 1 + 2/(x - 1)); limit_is(f13 - (x + 1), x, oo, 0); limit_is(f13 - (x + 1), x, -oo, 0)
holds((2/(x - 1)).subs(x, 2) > 0); holds((2/(x - 1)).subs(x, 0) < 0); same((x**2 + 1).subs(x, 1), 2)
limit_is(f13, x, 1, oo, '+'); limit_is(f13, x, 1, -oo, '-'); limit_is(f13, x, oo, oo); limit_is(f13, x, -oo, -oo)
```
:::

::: figure id=fig-03-5
Asymptotes. Left: $r(x) = \dfrac{x^2 - 4}{x^2 - x - 2}$ of Examples 3.2 and 3.10, with the vertical asymptote $x = -1$, the horizontal asymptote $y = 1$ and the hole at $\big(2, \tfrac43\big)$. Right: $f(x) = \dfrac{x^2 + 1}{x - 1}$ of Example 3.13, with the vertical asymptote $x = 1$ and the oblique asymptote $y = x + 1$; the graph lies above the oblique asymptote for $x > 1$ and below it for $x < 1$.
:::

::: compute Asymptotes and continuity with SymPy
In SymPy, $\infty$ is `sp.oo`. Here are the limits of Example 3.12 at both ends, and on both sides of 3:

```python
import sympy as sp
x = sp.symbols('x')
f = sp.sqrt(4*x**2 + 1)/(x - 3)
print(sp.limit(f, x, sp.oo), sp.limit(f, x, -sp.oo))
print(sp.limit(f, x, 3, '+'), sp.limit(f, x, 3, '-'))
```

```output
2 -2
oo -oo
```

As Module 2 warned, a one-sided limit needs its direction: without one, `limit` approaches from the right. To see where a function is continuous, `continuous_domain` lists the intervals; here is the function $r$ of Example 3.2:

```python
from sympy.calculus.util import continuous_domain
r = (x**2 - 4)/(x**2 - x - 2)
print(continuous_domain(r, x, sp.S.Reals))
```

```output
Union(Interval.open(-oo, -1), Interval.open(-1, 2), Interval.open(2, oo))
```

`Interval.open(-oo, -1)` is the open interval $(-\infty, -1)$: $r$ is continuous everywhere except at $-1$ and 2. The answer does not say what kind of discontinuity each point is, and for complicated formulas `continuous_domain` can be wrong, so compare it with your own reasoning. For an oblique asymptote, `sp.div` divides one polynomial by another and returns the quotient and the remainder:

```python
q, s = sp.div(x**2 + 1, x - 1)                  # Example 3.13
print(q, s)
print(sp.limit((x**2 + 1)/(x - 1) - q, x, sp.oo))
```

```output
x + 1 2
0
```

The quotient $x + 1$ is the asymptote, and the last line confirms that the distance to it tends to 0.
:::

::: deeper The precise definitions
Module 2 made "$f(x)$ approaches $L$ as $x$ approaches $a$" precise with ε and δ. The new limits of this module are made precise in the same way.

- $\lim_{x\to a} f(x) = \infty$ means: for every number $M$ there is a $\delta > 0$ such that $f(x) > M$ whenever $0 < \abs{x - a} < \delta$.
- $\lim_{x\to\infty} f(x) = L$ means: for every $\varepsilon > 0$ there is a number $N$ such that $\abs{f(x) - L} < \varepsilon$ whenever $x > N$.
- $\lim_{x\to\infty} f(x) = \infty$ means: for every number $M$ there is a number $N$ such that $f(x) > M$ whenever $x > N$.

The other cases ($-\infty$, one-sided limits, $x \to -\infty$) change the inequalities in the obvious way. For example, $\lim_{x\to0} 1/x^2 = \infty$: given $M > 0$, take $\delta = 1/\sqrt M$; if $0 < \abs{x} < \delta$, then $x^2 < \delta^2 = 1/M$, so $1/x^2 > M$.
:::

```check
Mq = symbols('M', positive=True); same((1/sqrt(Mq))**2, 1/Mq); same(1/(1/Mq), Mq)
```

## Orders of growth {#growth}

The functions $\ln x$, $x^2$, $2^x$ and the factorial all tend to $\infty$, but at very different speeds, and the differences decide what a computer can do in practice. Compare them at a few whole numbers $n$. Here $n!$, read "$n$ factorial", is the product $1 \cdot 2 \cdot 3 \cdots n$, the number of ways to put $n$ objects in a row:

```valuetable
n = 10, 20, 50, 100
$\log_2 n$ = log(n, 2)
$n^2$ = n**2
$2^n$ = 2**n
$n!$ = factorial(n)
digits = 4
layout = columns
---
n | \log_2 n | n^2 | 2^n | n!
10 | 3.322 | 100 | 1024 | 3.629\times10^{6}
20 | 4.322 | 400 | 1.049\times10^{6} | 2.433\times10^{18}
50 | 5.644 | 2500 | 1.126\times10^{15} | 3.041\times10^{64}
100 | 6.644 | 10000 | 1.268\times10^{30} | 9.333\times10^{157}
```

The logarithm barely moves, $n^2$ grows steadily, and $2^n$ and $n!$ explode: $100!$ has 158 digits. To compare growth precisely, compare ratios.

```check
same(len(str(factorial(100))), 158); same(factorial(4), 1*2*3*4)
```

::: definition Orders of growth
Let $f$ and $g$ be positive for all large $x$. Then $f$ **grows more slowly than** $g$ as $x \to \infty$, written $f \ll g$, if

$$\lim_{x\to\infty}\frac{f(x)}{g(x)} = 0.$$

For functions defined at whole numbers $n$, such as $n!$, the limit as $n \to \infty$ means the same, with $n$ running through $1, 2, 3, \dots$; Module 14 studies such limits of sequences.
:::

So far out, $f$ is a negligible fraction of $g$: eventually below 1%, or 0.0001%, or any fraction you name. Among powers, the higher power wins: $x^p \ll x^q$ whenever $p < q$, since $\dfrac{x^p}{x^q} = \dfrac{1}{x^{q-p}} \to 0$.

```check
pq_, qq_ = symbols('p q', positive=True)
limit_is(x**pq_/x**(pq_ + qq_), x, oo, 0); same(x**pq_/x**(pq_ + qq_), 1/x**qq_)
```

::: theorem Orders of growth
For every $p > 0$ and every $a > 1$, as $x \to \infty$,

$$\ln x \ll x^p \ll a^x,$$

and, as $n \to \infty$ through the whole numbers,

$$a^n \ll n! \ll n^n.$$
:::

Every logarithm loses to every positive power, every power to every exponential with base greater than 1, and every exponential to the factorial. The two comparisons with $n!$ need only simple inequalities.

::: proof of the comparisons with the factorial
For $\dfrac{n!}{n^n}$, write the top and the bottom as products of $n$ factors:

$$\frac{n!}{n^n} = \frac{1}{n}\cdot\frac{2}{n}\cdots\frac{n}{n} \le \frac{1}{n},$$

because every factor after the first is at most 1. Since $0 < \dfrac{n!}{n^n} \le \dfrac1n$ and $\dfrac1n \to 0$, the squeeze theorem gives $\dfrac{n!}{n^n} \to 0$.

For $\dfrac{a^n}{n!}$, choose a whole number $N \ge 2a$. For $n > N$, split off the first $N$ factors of the top and of the bottom:

$$\frac{a^n}{n!} = \frac{a^N}{N!}\cdot\frac{a}{N + 1}\cdot\frac{a}{N + 2}\cdots\frac{a}{n} \le \frac{a^N}{N!}\Big(\frac12\Big)^{n - N},$$

because each of the last $n - N$ factors is at most $\dfrac{a}{N} \le \dfrac12$. The number $\dfrac{a^N}{N!}$ is fixed, and $\big(\tfrac12\big)^{n-N} \to 0$ (Section 3.7), so $\dfrac{a^n}{n!} \to 0$ by the squeeze theorem.
:::

```check
for nn in (5, 10, 20):
    holds(factorial(nn)/nn**nn <= Rational(1, nn))
    same(factorial(nn)/nn**nn, Mul(*[Rational(j, nn) for j in range(1, nn + 1)]))
aa, NN = 3, 6                                  # a = 3, N = 6 >= 2a
for nn in (8, 12, 20):
    same(Integer(aa)**nn/factorial(nn), Integer(aa)**NN/factorial(NN)*Mul(*[Rational(aa, j) for j in range(NN + 1, nn + 1)]))
    holds(Integer(aa)**nn/factorial(nn) <= Integer(aa)**NN/factorial(NN)*Rational(1, 2)**(nn - NN))
limit_is(factorial(n)/n**n, n, oo, 0); limit_is(3**n/factorial(n), n, oo, 0)
```

The comparisons $\ln x \ll x^p \ll a^x$ take a little more work. Module 7 proves them in a few lines with L'Hôpital's rule, and the Going deeper box below proves them with the tools of this module. Numbers make them believable now:

```valuetable
x = 10, 100, 10000, 1000000
$\ln x$ = log(x)
$\sqrt{x}$ = sqrt(x)
$\dfrac{\ln x}{\sqrt x}$ = log(x)/sqrt(x)
digits = 4
---
x | \ln x | \sqrt{x} | \dfrac{\ln x}{\sqrt x}
10 | 2.303 | 3.162 | 0.7281
100 | 4.605 | 10 | 0.4605
10000 | 9.210 | 100 | 0.09210
1000000 | 13.82 | 1000 | 0.01382
```

At $x = 10$ the logarithm is already smaller than $\sqrt x$, and the ratio keeps shrinking: by $x = 10^6$, $\ln x$ is less than 1.4% of $\sqrt x$.

```check
rounds(log(10**6)/sqrt(10**6), '0.0138'); holds(log(10**6)/sqrt(10**6) < Rational(14, 1000))
holds(log(10) < sqrt(10)); limit_is(log(x)/sqrt(x), x, oo, 0)
```

::: deeper Logarithms, powers and exponentials compared
To show that $\dfrac{x^p}{a^x} \to 0$ for $p > 0$ and $a > 1$, start with whole numbers $n$ and the terms $u_n = \dfrac{n^p}{a^n}$. The ratio of consecutive terms,

$$\frac{u_{n+1}}{u_n} = \frac{(n + 1)^p}{a^{n+1}}\cdot\frac{a^n}{n^p} = \frac1a\Big(1 + \frac1n\Big)^p,$$

tends to $\frac1a < 1$ as $n \to \infty$, because $t^p$ is continuous at $t = 1$. So for a number $\rho$ between $\frac1a$ and 1 (the Greek letter rho), say $\rho = \frac12\big(1 + \frac1a\big)$, the ratio is less than $\rho$ for every $n$ from some $N$ on, and

$$u_{N+k} \le u_N\,\rho^k \quad\text{for } k = 1, 2, 3, \dots$$

Since $\rho^k = 1/(1/\rho)^k$ and $1/\rho > 1$, $\rho^k \to 0$ (Section 3.7), so $u_n \to 0$. For a real number $x \ge 1$, let $n = \lfloor x\rfloor$, so that $n \le x < n + 1$; then $x^p < (n + 1)^p$ and $a^x \ge a^n$, so

$$0 < \frac{x^p}{a^x} < \frac{(n + 1)^p}{a^n} = a\,u_{n+1},$$

and the squeeze theorem gives $\dfrac{x^p}{a^x} \to 0$. For $\dfrac{\ln x}{x^p}$, substitute $x = e^t$: as $x \to \infty$, $t = \ln x \to \infty$, and $\dfrac{\ln x}{x^p} = \dfrac{t}{(e^p)^t}$, which tends to 0 by the first part, with the power 1 and the base $e^p > 1$. Comparing consecutive terms, as here and for $n!$, is the idea behind the ratio test for series in Module 14.
:::

```check
pp2 = symbols('p', positive=True); a2 = symbols('a', positive=True); n2 = symbols('n', positive=True)
same(((n2 + 1)**pp2/a2**(n2 + 1))*(a2**n2/n2**pp2), (1 + 1/n2)**pp2/a2)
limit_is((1 + 1/n2)**pp2/a2, n2, oo, 1/a2)
same((n2 + 1)**pp2/a2**n2, a2*((n2 + 1)**pp2/a2**(n2 + 1)))
tt = symbols('t', positive=True); same(log(exp(tt))/exp(tt)**pp2, tt/exp(pp2)**tt)
limit_is(x**3/2**x, x, oo, 0); limit_is(log(x)/x**Rational(1, 10), x, oo, 0)
```

::: pitfall
Small tables can mislead. Compare $n^{10}$ with $2^n$:

```valuetable
n = 10, 30, 58, 59, 100
$n^{10}$ = n**10
$2^n$ = 2**n
$\dfrac{n^{10}}{2^n}$ = n**10/2**n
digits = 4
---
n | n^{10} | 2^n | \dfrac{n^{10}}{2^n}
10 | 1\times10^{10} | 1024 | 9.766\times10^{6}
30 | 5.905\times10^{14} | 1.074\times10^{9} | 549900
58 | 4.308\times10^{17} | 2.882\times10^{17} | 1.495
59 | 5.111\times10^{17} | 5.765\times10^{17} | 0.8866
100 | 1\times10^{20} | 1.268\times10^{30} | 7.889\times10^{-11}
```

For every $n$ from 2 to 58, $n^{10}$ is the larger; only at $n = 59$ does $2^n$ overtake it, and from then on it stays ahead while the ratio plunges. "Eventually" can be far away: $n^{100}$ stays ahead of $1.01^n$ for every $n$ from 2 to 117,308. A comparison $f \ll g$ says who wins in the end, not when.
:::

```check
holds(all(k_**10 > 2**k_ for k_ in range(2, 59))); holds(all(k_**10 < 2**k_ for k_ in range(59, 400)))
holds(Rational(15, 14)**10 < 2)          # for n >= 14 each step multiplies n^10/2^n by ((n+1)/n)^10/2 < 1: it keeps falling
tg = symbols('t', positive=True); gfun = tg*log(Rational(101, 100)) - 100*log(tg)
same(diff(gfun, tg, 2), 100/tg**2)       # g = ln(1.01^t / t^100) is convex, so it is negative between its two zeros
nb = 117309
holds(gfun.subs(tg, nb) > 0); holds(gfun.subs(tg, nb - 1) < 0); holds(gfun.subs(tg, 2) < 0)
```

### Big-O notation and algorithms {#big-o}

Computer scientists compare algorithms by how their running time grows with the size $n$ of the input, such as the number of items to sort. Constant factors depend on the computer and the programmer, so the comparison ignores them.

::: definition Big-O notation
Let $f$ and $g$ be functions of a whole number $n$. Then $f(n) = O\big(g(n)\big)$ as $n \to \infty$, read "$f$ of $n$ is big-O of $g$ of $n$", if there are constants $C$ and $N$ such that

$$\abs{f(n)} \le C\,\abs{g(n)} \quad\text{for every } n \ge N.$$
:::

So $f = O(g)$ says that $f$ grows no faster than a constant multiple of $g$; constant factors, and small $n$, do not matter. It is only an upper bound: $n = O(n^2)$ is true, if not informative. (The notation is also used as $h \to 0$: Module 4 measures errors that way.) Limits give a quick test: if $f(n)/g(n)$ tends to a number $L$, then $f = O(g)$, since eventually $\abs{f(n)/g(n)} < \abs{L} + 1$. In particular $f \ll g$ implies $f = O(g)$, but then $g$ is not $O(f)$, because $g(n)/f(n)$ grows without bound.

::: example A big-O bound
Show that $3n^2 + 5n + 7 = O(n^2)$, and that $n^2$ is not $O(n)$.

For $n \ge 1$, $n \le n^2$ and $1 \le n^2$, so

$$3n^2 + 5n + 7 \le 3n^2 + 5n^2 + 7n^2 = 15n^2.$$

That is the definition, with $C = 15$ and $N = 1$. The limit test gives the same: $\dfrac{3n^2 + 5n + 7}{n^2} = 3 + \dfrac5n + \dfrac{7}{n^2} \to 3$. The lower-order terms $5n + 7$ and the factor 3 do not matter.

On the other hand, $\dfrac{n^2}{n} = n$ grows without bound, so no constant $C$ gives $n^2 \le Cn$ for all large $n$: $n^2$ is not $O(n)$.

```check
same(factor(15*n**2 - (3*n**2 + 5*n + 7)), (n - 1)*(12*n + 7))        # >= 0 for n >= 1
same(expand(3*n**2 + 5*n**2 + 7*n**2), 15*n**2)
same(expand((3*n**2 + 5*n + 7)/n**2), 3 + 5/n + 7/n**2); limit_is((3*n**2 + 5*n + 7)/n**2, n, oo, 3)
same(n**2/n, n); limit_is(n**2/n, n, oo, oo)
```
:::

The common orders of growth in algorithm analysis, from the slowest-growing to the fastest:

| Order | Name | Where it arises |
|---|---|---|
| $O(\log_2 n)$ | logarithmic | binary search: halve a sorted list at each step |
| $O(n)$ | linear | one look at each item, as in finding the largest |
| $O(n\log_2 n)$ | linearithmic | sorting by merge sort |
| $O(n^2)$ | quadratic | comparing every pair of items |
| $O(2^n)$ | exponential | trying every subset of the items |
| $O(n!)$ | factorial | trying every order of the items |

The base of a logarithm does not matter inside $O$: $\log_2 n = \dfrac{\ln n}{\ln 2}$ is a constant multiple of $\ln n$, so computer scientists often write $O(\log n)$ without a base. Theorem 3.11 puts the orders of the table in a chain,

$$\log_2 n \ll n \ll n\log_2 n \ll n^2 \ll 2^n \ll n!,$$

since $\dfrac{n}{n\log_2 n} = \dfrac{1}{\log_2 n} \to 0$ and $\dfrac{n\log_2 n}{n^2} = \dfrac{\log_2 n}{n} \to 0$.

```check
same(log(n, 2), log(n)/log(2))
limit_is(log(n, 2)/n, n, oo, 0); limit_is(n/(n*log(n, 2)), n, oo, 0); limit_is(n*log(n, 2)/n**2, n, oo, 0)
limit_is(n**2/2**n, n, oo, 0); limit_is(2**n/factorial(n), n, oo, 0)
```

What this means in practice: suppose, hypothetically, that a computer performs $10^9$ basic steps per second. For $n = 100$, an algorithm that takes $n^2$ steps finishes in 10 microseconds; one that takes $2^n$ steps, about $1.27 \times 10^{30}$, needs about $4.0 \times 10^{13}$ years, and one that takes $n!$ steps about $3 \times 10^{141}$ years. Faster hardware does not rescue an exponential algorithm: a computer twice as fast lets a $2^n$ algorithm handle only one more item in the same time, since $2^{n+1} = 2 \cdot 2^n$, while an $n^2$ algorithm handles $\sqrt2 \approx 1.41$ times as many, since $(\sqrt2\,n)^2 = 2n^2$.

```check
yr = Rational(36525, 100)*24*3600
same(Rational(100**2, 10**9), Rational(1, 10**5)); same(Rational(1, 10**5), Rational(10, 10**6))
rounds(2**100, '1.27e30'); rounds(2**100/10**9/yr, '4.0e13'); rounds(factorial(100)/10**9/yr, '3e141')
same(2**(n + 1), 2*2**n); same((sqrt(2)*n)**2, 2*n**2); rounds(sqrt(2), '1.41')
```

::: pitfall
Big-O hides constant factors, and for small $n$ they matter. An algorithm that takes $100\,n\log_2 n$ steps beats one that takes $n^2$ steps only when $n > 100\log_2 n$: for every $n$ from 2 to 996 the "worse" quadratic algorithm takes fewer steps, and only from $n = 997$ on does the other win. Big-O says who wins in the end, not at the sizes you have. Measure as well.

```check
holds(996 < 100*log(996, 2)); holds(997 > 100*log(997, 2)); holds(all(k_ < 100*log(k_, 2) for k_ in range(2, 997)))
```
:::

::: compute Growth rates with exact integers
Python's whole numbers are exact, however large, so they can settle questions about growth without rounding errors. Where does $2^n$ overtake $n^{10}$?

```python
n = 2
while n**10 >= 2**n:          # exact integer arithmetic: no rounding
    n += 1
print(n, n**10, 2**n)
```

```output
59 511116753300641401 576460752303423488
```

How long would the algorithms of the table take, at a hypothetical $10^9$ steps per second?

```python
import math
speed = 10**9                         # steps per second (hypothetical)
year = 365.25 * 24 * 3600             # seconds in a year
for n in (20, 50, 100):
    for name, steps in (("n^2", n**2), ("2^n", 2**n), ("n!", math.factorial(n))):
        seconds = steps / speed
        print(f"n = {n:3}  {name:>3}: {seconds:9.3g} s = {seconds / year:9.3g} years")
```

```output
n =  20  n^2:     4e-07 s =  1.27e-14 years
n =  20  2^n:   0.00105 s =  3.32e-11 years
n =  20   n!:  2.43e+09 s =      77.1 years
n =  50  n^2:   2.5e-06 s =  7.92e-14 years
n =  50  2^n:  1.13e+06 s =    0.0357 years
n =  50   n!:  3.04e+55 s =  9.64e+47 years
n = 100  n^2:     1e-05 s =  3.17e-13 years
n = 100  2^n:  1.27e+21 s =  4.02e+13 years
n = 100   n!: 9.33e+148 s = 2.96e+141 years
```

The $n^2$ column stays below a thousandth of a second. The $2^n$ column passes from a millisecond at $n = 20$ to about 13 days at $n = 50$ ($1.13 \times 10^6$ seconds), and the $n!$ column is already about 77 years at $n = 20$.
:::

## What you learned {#summary}

- $f$ is continuous at $a$ when $\lim_{x\to a} f(x) = f(a)$: $f(a)$ is defined, the limit exists, and the two are equal. One-sided continuity handles jumps and the ends of intervals.
- A discontinuity is removable (the limit exists), a jump (the one-sided limits differ), infinite (the values grow without bound) or oscillating. Only a removable one can be repaired by changing one value.
- Sums, products, quotients (where the denominator is not 0) and compositions of continuous functions are continuous, and limits pass inside continuous functions: $\lim f\big(g(x)\big) = f\big(\lim g(x)\big)$. Polynomials, rational functions, roots, exponentials, logarithms and the trigonometric functions are continuous on their domains.
- The Intermediate Value Theorem: a function continuous on $[a, b]$ takes every value between $f(a)$ and $f(b)$, so a change of sign brackets a root.
- The bisection method halves the bracket at every step: after $n$ steps its width is $(b - a)/2^n$, and its midpoint is within $(b - a)/2^{n+1}$ of a root.
- The Extreme Value Theorem: a function continuous on a closed interval $[a, b]$ has a maximum and a minimum value there; on an open or unbounded interval, or with a discontinuity, it may not.
- $\lim_{x\to a} f(x) = \pm\infty$ describes values that grow without bound; then $x = a$ is a vertical asymptote, typically where a non-zero numerator meets a zero denominator. $\infty$ is not a number: $\infty - \infty$ and $\infty/\infty$ have no fixed value.
- $\lim_{x\to\pm\infty} f(x) = L$ gives the horizontal asymptote $y = L$. Rational functions behave like the ratio of their leading terms; when the numerator's degree exceeds the denominator's by one, division gives an oblique asymptote.
- $\ln x \ll x^p \ll a^x$ for $p > 0$ and $a > 1$, and $a^n \ll n! \ll n^n$. Big-O notation, $f = O(g)$, bounds $f$ by a constant multiple of $g$ and ranks algorithms by how their cost grows.

## Exercises {#exercises}

:::: exercise The three conditions {#ex-3-1} ★
For each function, decide whether it is continuous at the given number. If it is not, say which of the three conditions of Definition 3.1 fails, and classify the discontinuity.

- (a) $f(x) = \dfrac{x^2 - 9}{x - 3}$, at 3
- (b) $g(x) = x + 1$ for $x < 1$, and $g(x) = 3 - x$ for $x \ge 1$, at 1
- (c) $h(x) = x^2$ for $x \le 0$, and $h(x) = \dfrac{1}{x}$ for $x > 0$, at 0
- (d) $u(x) = \dfrac{\abs{x - 1}}{x - 1}$, at 1

::: solution
**(a)** $f(3) = 0/0$ is not defined: condition 1 fails. For $x \ne 3$, $f(x) = \dfrac{(x - 3)(x + 3)}{x - 3} = x + 3$, so $\lim_{x\to3} f(x) = 6$. The limit exists, so the discontinuity is removable: giving $f$ the value 6 at 3 makes it continuous.

**(b)** $g(1) = 3 - 1 = 2$. From the left, $\lim_{x\to1^-}(x + 1) = 2$; from the right, $\lim_{x\to1^+}(3 - x) = 2$. The one-sided limits agree, so $\lim_{x\to1} g(x) = 2 = g(1)$: $g$ is continuous at 1. The two pieces meet at the point $(1, 2)$.

**(c)** $h(0) = 0^2 = 0$, and from the left $\lim_{x\to0^-} x^2 = 0 = h(0)$, so $h$ is continuous from the left at 0. From the right, $h(x) = 1/x$ grows without bound: $\lim_{x\to0^+} h(x) = \infty$. So $\lim_{x\to0} h(x)$ does not exist (condition 2 fails), and 0 is an infinite discontinuity.

**(d)** $u(1) = 0/0$ is not defined: condition 1 fails. For $x > 1$, $\abs{x - 1} = x - 1$ and $u(x) = 1$; for $x < 1$, $\abs{x - 1} = -(x - 1)$ and $u(x) = -1$. The one-sided limits, 1 and $-1$, differ, so the limit does not exist either: a jump discontinuity.

```check
fe1 = (x**2 - 9)/(x - 3)
holds(fe1.subs(x, 3) is S.NaN); same(factor(x**2 - 9), (x - 3)*(x + 3)); same(cancel(fe1), x + 3); limit_is(fe1, x, 3, 6)
limit_is(x + 1, x, 1, 2, '-'); limit_is(3 - x, x, 1, 2, '+'); same((3 - x).subs(x, 1), 2)
limit_is(x**2, x, 0, 0, '-'); same((x**2).subs(x, 0), 0); limit_is(1/x, x, 0, oo, '+')
xr1 = symbols('x', real=True); ue = Abs(xr1 - 1)/(xr1 - 1)
holds(ue.subs(xr1, 1) is S.NaN); limit_is(ue, xr1, 1, 1, '+'); limit_is(ue, xr1, 1, -1, '-')
```
:::
::::

:::: exercise Repairing discontinuities {#ex-3-2} ★
Each function is undefined at one or two numbers. At each of them, decide whether the discontinuity is removable, and if it is, give the value that repairs it.

- (a) $f(x) = \dfrac{x^3 - 8}{x - 2}$
- (b) $g(x) = \dfrac{\sqrt{x + 4} - 2}{x}$
- (c) $h(x) = \dfrac{x + 1}{x^2 - 1}$

::: solution
**(a)** $f$ is undefined at 2. Factor the difference of cubes: $x^3 - 8 = (x - 2)(x^2 + 2x + 4)$, so for $x \ne 2$, $f(x) = x^2 + 2x + 4$, which tends to $4 + 4 + 4 = 12$. The limit exists: the discontinuity is removable, and the value $f(2) = 12$ repairs it.

**(b)** $g$ is defined for $x \ge -4$, except at 0. Rationalise, as in Module 2: since $\big(\sqrt{x + 4} - 2\big)\big(\sqrt{x + 4} + 2\big) = (x + 4) - 4 = x$,

$$g(x) = \frac{x}{x\big(\sqrt{x + 4} + 2\big)} = \frac{1}{\sqrt{x + 4} + 2} \qquad (x \ne 0).$$

The square root is continuous at 4, so the limit at 0 is $\dfrac{1}{2 + 2} = \dfrac14$: removable, repaired by $g(0) = \tfrac14$.

**(c)** $h$ is undefined where $x^2 - 1 = (x - 1)(x + 1) = 0$, at $-1$ and 1. For other $x$, $h(x) = \dfrac{1}{x - 1}$. At $-1$ the limit is $-\tfrac12$: removable, repaired by $h(-1) = -\tfrac12$. At 1 the numerator of $\dfrac{1}{x - 1}$ is 1 and the denominator tends to 0, so the values grow without bound: an infinite discontinuity, which no value repairs.

```check
fe2 = (x**3 - 8)/(x - 2); same(factor(x**3 - 8), (x - 2)*(x**2 + 2*x + 4)); same(cancel(fe2), x**2 + 2*x + 4); limit_is(fe2, x, 2, 12)
ge2 = (sqrt(x + 4) - 2)/x; same(expand((sqrt(x + 4) - 2)*(sqrt(x + 4) + 2)), x)
xg2 = symbols('x', positive=True); same(((sqrt(xg2 + 4) - 2)/xg2) - 1/(sqrt(xg2 + 4) + 2), 0); limit_is(ge2, x, 0, Rational(1, 4))
he2 = (x + 1)/(x**2 - 1); same(factor(x**2 - 1), (x - 1)*(x + 1)); same(cancel(he2), 1/(x - 1))
limit_is(he2, x, -1, -Rational(1, 2)); limit_is(he2, x, 1, oo, '+'); limit_is(he2, x, 1, -oo, '-')
same(ge2.subs(x, -3), Rational(1, 3)); same((1/(sqrt(x + 4) + 2)).subs(x, -3), Rational(1, 3))
```
:::
::::

:::: exercise Roots by the Intermediate Value Theorem {#ex-3-3} ★
- (a) Show that $x^5 + x - 1 = 0$ has a solution in $(0, 1)$.
- (b) Show that $e^{-x} = x$ has a solution in $(0, 1)$.
- (c) $f(x) = \dfrac1x$ has $f(-1) = -1 < 0 < 1 = f(1)$. Why does the Intermediate Value Theorem not give a root in $(-1, 1)$? Does $f$ have one?

::: solution
**(a)** $p(x) = x^5 + x - 1$ is a polynomial, continuous on $[0, 1]$, with $p(0) = -1 < 0$ and $p(1) = 1 > 0$. By the Intermediate Value Theorem, $p(c) = 0$ for some $c$ in $(0, 1)$. (Bisection or a computer gives $c \approx 0.7549$.)

**(b)** Rewrite the equation as $g(x) = 0$ with $g(x) = e^{-x} - x$, continuous on $\R$ ($e^{-x}$ is the composition of $e^u$ with $u = -x$). Then $g(0) = 1 > 0$ and $g(1) = e^{-1} - 1 \approx 0.3679 - 1 = -0.6321 < 0$, so $g$ has a root in $(0, 1)$: $e^{-x} = x$ there. (It is $c \approx 0.5671$.)

**(c)** The theorem needs $f$ to be continuous on the whole of $[-1, 1]$, and $1/x$ is not even defined at 0: it has an infinite discontinuity there. So the theorem says nothing. And $f$ has no root: $\dfrac1x = 0$ would need $1 = 0 \cdot x = 0$. The sign changes because the graph jumps from $-\infty$ to $\infty$ at the asymptote $x = 0$, not because it crosses the axis.

```check
p4 = x**5 + x - 1; same(p4.subs(x, 0), -1); same(p4.subs(x, 1), 1); r4 = nsolve(p4, x, 0.75); holds(0 < r4 < 1); rounds(r4, '0.7549')
g4 = exp(-x) - x; same(g4.subs(x, 0), 1); rounds(exp(-1), '0.3679'); rounds(exp(-1) - 1, '-0.6321'); holds(exp(-1) - 1 < 0)
r4b = nsolve(g4, x, 0.5); holds(0 < r4b < 1); rounds(r4b, '0.5671')
same(solve(1/x, x), []); limit_is(1/x, x, 0, oo, '+')
```
:::
::::

:::: exercise Bisection by hand {#ex-3-4} ★★
Use the bisection method on $f(x) = x^3 - 2x - 5$, starting from $[2, 3]$ (Example 3.5).

- (a) Carry out four steps, and give the bracket $[a_4, b_4]$.
- (b) What does Theorem 3.7 guarantee about the midpoint $m_4$? Compare with the root $c \approx 2.0946$.
- (c) How many steps from $[2, 3]$ guarantee that the midpoint $m_n$ is within $10^{-4}$ of the root?

::: solution
**(a)** $f(2) = -1 < 0$ and $f(3) = 16 > 0$. At each step, compare the sign of $f(m_n)$ with the sign of $f(a_n)$, which stays negative because $a_n$ only moves to midpoints where $f$ is negative (values of $f$ rounded to 4 significant digits):

| $n$ | $a_n$ | $b_n$ | $m_n$ | $f(m_n)$ |
|---|---|---|---|---|
| 0 | 2 | 3 | 2.5 | 5.625 |
| 1 | 2 | 2.5 | 2.25 | 1.891 |
| 2 | 2 | 2.25 | 2.125 | 0.3457 |
| 3 | 2 | 2.125 | 2.0625 | −0.3513 |

The first three midpoints give positive values, so each replaces $b$; the fourth gives a negative value and replaces $a$. So $[a_4, b_4] = [2.0625, 2.125]$, of width $\tfrac{1}{16} = 0.0625$.

**(b)** The midpoint $m_4 = 2.09375$ is within $\dfrac{3 - 2}{2^5} = \dfrac{1}{32} = 0.03125$ of the root. In fact the root is about 2.0946, so the error is only about 0.0008.

**(c)** Theorem 3.7 needs $\dfrac{1}{2^{n+1}} \le 10^{-4}$, that is, $2^{n+1} \ge 10{,}000$. Since $2^{13} = 8192$ is too small and $2^{14} = 16{,}384$ is large enough, $n + 1 = 14$: 13 steps.

```check
fb5 = lambda T: T**3 - 2*T - 5
same(fb5(Integer(2)), -1); same(fb5(Integer(3)), 16)
A5, B5 = Rational(2), Rational(3); rows5 = []
for k_ in range(4):
    M5 = (A5 + B5)/2; rows5.append((A5, B5, M5, fb5(M5)))
    if sign(fb5(M5)) == sign(fb5(A5)): A5 = M5
    else: B5 = M5
shown5 = [('2', '3', '2.5', '5.625'), ('2', '2.5', '2.25', '1.891'), ('2', '2.25', '2.125', '0.3457'), ('2', '2.125', '2.0625', '-0.3513')]
for (a_k, b_k, m_k, fm_k), (sa, sb, sm, sf) in zip(rows5, shown5):
    same(a_k, Rational(sa)); same(b_k, Rational(sb)); same(m_k, Rational(sm)); rounds(fm_k, sf)
same((A5, B5), (Rational(20625, 10000), Rational(2125, 1000))); same(B5 - A5, Rational(1, 16)); same(Rational(1, 16), Rational(625, 10000))
same((A5 + B5)/2, Rational(209375, 100000)); same(Rational(1, 2**5), Rational(3125, 100000))
r5 = nsolve(fb5(x), x, 2.1); holds(A5 < r5 < B5); rounds(r5, '2.0946'); rounds(abs((A5 + B5)/2 - r5), '0.0008')
same(2**13, 8192); same(2**14, 16384); holds(2**13 < 10**4 <= 2**14)
```
:::
::::

:::: exercise Extreme values or not {#ex-3-5} ★★
For each function and interval, decide whether the Extreme Value Theorem applies. Then find the maximum and minimum values, or explain why there is none.

- (a) $f(x) = 4x - x^2$ on $[0, 3]$
- (b) $g(x) = \dfrac{1}{x^2}$ on $[-1, 1]$, where $g$ is not defined at 0
- (c) $h(x) = x^2$ on $(-1, 2)$
- (d) $\lfloor x\rfloor$ on $[0, 2]$

::: solution
**(a)** $f$ is a polynomial, continuous on the closed interval $[0, 3]$: the theorem applies. Complete the square: $f(x) = 4 - (x - 2)^2$. The maximum value is $f(2) = 4$, where the square is 0. The square is largest where $x$ is farthest from 2, at $x = 0$, so the minimum value is $f(0) = 0$ (at the other end, $f(3) = 3$).

**(b)** $g$ is not defined at 0, which lies in $[-1, 1]$, so it is not continuous there: the theorem does not apply. There is no maximum value, since $g(x) \to \infty$ as $x \to 0$. But there is a minimum value: for $0 < \abs{x} \le 1$, $x^2 \le 1$, so $\dfrac{1}{x^2} \ge 1$, with equality at $x = \pm1$. The minimum value is 1.

**(c)** $h$ is continuous, but $(-1, 2)$ is open: the theorem does not apply. The minimum value is $h(0) = 0$, since $x^2 \ge 0$. There is no maximum value: $x^2 < 4$ for every $x$ in $(-1, 2)$, and as $x \to 2^-$ the values approach 4, so any value $h(x_0)$ is beaten by $h$ at points closer to 2.

**(d)** $\lfloor x\rfloor$ jumps at 1, and at 2 it is not continuous from the left ($\lim_{x\to2^-}\lfloor x\rfloor = 1 \ne 2$), so it is not continuous on $[0, 2]$: the theorem does not apply. Yet extreme values exist: the values are 0 (on $[0, 1)$), 1 (on $[1, 2)$) and 2 (at $x = 2$), so the maximum value is 2 and the minimum value is 0.

Parts (b), (c) and (d) show that the hypotheses are sufficient, not necessary: when they fail, extreme values may or may not exist.

```check
f6 = 4*x - x**2; same(expand(4 - (x - 2)**2), f6)
same(maximum(f6, x, Interval(0, 3)), 4); same(minimum(f6, x, Interval(0, 3)), 0); same(f6.subs(x, 2), 4); same(f6.subs(x, 0), 0); same(f6.subs(x, 3), 3)
limit_is(1/x**2, x, 0, oo); same(minimum(1/x**2, x, Union(Interval.Ropen(-1, 0), Interval.Lopen(0, 1))), 1); same((1/x**2).subs(x, -1), 1)
same(minimum(x**2, x, Interval.open(-1, 2)), 0); limit_is(x**2, x, 2, 4, '-')
same([floor(v) for v in (0, Rational(1, 2), 1, Rational(3, 2), 2)], [0, 0, 1, 1, 2]); limit_is(floor(x), x, 2, 1, '-'); limit_is(floor(x), x, 1, 0, '-')
```
:::
::::

:::: exercise Vertical asymptotes {#ex-3-6} ★★
- (a) Find the vertical asymptotes of $f(x) = \dfrac{x + 2}{x^2 + x - 2}$, with the one-sided limits at each, and any holes in the graph.
- (b) Find $\displaystyle\lim_{x\to0^+} e^{1/x}$ and $\displaystyle\lim_{x\to0^-} e^{1/x}$. What kind of discontinuity does $e^{1/x}$ have at 0? Does its graph have a horizontal asymptote?

::: solution
**(a)** Factor the denominator: $x^2 + x - 2 = (x + 2)(x - 1)$. So $f$ is not defined at $-2$ and at 1, and for every other $x$

$$f(x) = \frac{x + 2}{(x + 2)(x - 1)} = \frac{1}{x - 1}.$$

At $-2$ the factor cancels, and $\lim_{x\to-2} f(x) = \dfrac{1}{-3} = -\dfrac13$: a hole at $\big(-2, -\tfrac13\big)$, not an asymptote. At 1 the numerator is 1 and the denominator $x - 1$ tends to 0, positive on the right and negative on the left, so by Theorem 3.9

$$\lim_{x\to1^+} f(x) = \infty, \qquad \lim_{x\to1^-} f(x) = -\infty,$$

and $x = 1$ is the only vertical asymptote.

**(b)** As $x \to 0^+$, $u = \dfrac1x$ grows without bound, and so does $e^u$ (Section 3.7): $\lim_{x\to0^+} e^{1/x} = \infty$. As $x \to 0^-$, $u = \dfrac1x$ tends to $-\infty$, and $e^u \to 0$: $\lim_{x\to0^-} e^{1/x} = 0$. Since one one-sided limit is infinite, 0 is an infinite discontinuity, and $x = 0$ is a vertical asymptote, on the right side only. As $x \to \pm\infty$, $\dfrac1x \to 0$ and $e^u$ is continuous at 0, so $e^{1/x} \to e^0 = 1$ (Theorem 3.4): the line $y = 1$ is a horizontal asymptote at both ends.

```check
fe7 = (x + 2)/(x**2 + x - 2)
same(factor(x**2 + x - 2), (x + 2)*(x - 1)); same(cancel(fe7), 1/(x - 1)); limit_is(fe7, x, -2, -Rational(1, 3))
limit_is(fe7, x, 1, oo, '+'); limit_is(fe7, x, 1, -oo, '-')
limit_is(exp(1/x), x, 0, oo, '+'); limit_is(exp(1/x), x, 0, 0, '-'); limit_is(exp(1/x), x, oo, 1); limit_is(exp(1/x), x, -oo, 1)
```
:::
::::

:::: exercise Limits at infinity {#ex-3-7} ★★
Find

- (a) $\displaystyle\lim_{x\to\infty}\frac{2x^3 - x}{4x^3 + 5x^2 + 1}$
- (b) $\displaystyle\lim_{x\to-\infty}\frac{3x + 1}{\sqrt{x^2 + 4}}$
- (c) $\displaystyle\lim_{x\to\infty}\Big(\sqrt{x^2 + x} - x\Big)$. (Hint: multiply and divide by $\sqrt{x^2 + x} + x$.)

::: solution
**(a)** The degrees are equal, so divide the numerator and the denominator by $x^3$:

$$\frac{2x^3 - x}{4x^3 + 5x^2 + 1} = \frac{2 - 1/x^2}{4 + 5/x + 1/x^3} \to \frac{2}{4} = \frac12.$$

**(b)** For $x < 0$, $\sqrt{x^2 + 4} = \abs{x}\sqrt{1 + 4/x^2} = -x\sqrt{1 + 4/x^2}$. Dividing the numerator and the denominator by $-x$, which is positive,

$$\frac{3x + 1}{\sqrt{x^2 + 4}} = \frac{3x + 1}{-x\sqrt{1 + 4/x^2}} = -\frac{3 + 1/x}{\sqrt{1 + 4/x^2}} \to -\frac{3}{1} = -3.$$

The common wrong answer 3 forgets that $\sqrt{x^2} = \abs{x} = -x$ for negative $x$. (As $x \to \infty$ the limit is 3.)

**(c)** Both $\sqrt{x^2 + x}$ and $x$ tend to $\infty$, and "$\infty - \infty$" decides nothing, so rationalise, as in Module 2. For $x > 0$,

$$\begin{aligned} \sqrt{x^2 + x} - x &= \frac{\big(\sqrt{x^2 + x} - x\big)\big(\sqrt{x^2 + x} + x\big)}{\sqrt{x^2 + x} + x} \\ &= \frac{(x^2 + x) - x^2}{\sqrt{x^2 + x} + x} = \frac{x}{\sqrt{x^2 + x} + x}. \end{aligned}$$

Divide the numerator and the denominator by $x$, using $\sqrt{x^2 + x} = x\sqrt{1 + 1/x}$ for $x > 0$:

$$\frac{x}{\sqrt{x^2 + x} + x} = \frac{1}{\sqrt{1 + 1/x} + 1} \to \frac{1}{1 + 1} = \frac12.$$

The answer is $\tfrac12$, not 0: the two terms grow together, and their difference settles at $\tfrac12$. On a computer the original form is also numerically dangerous. For large $x$ it subtracts two nearly equal numbers, and the cancellation of Module 2 destroys the digits; the rewritten form keeps them:

```python
import math
for x in (1e4, 1e8, 1e16):
    print(x, math.sqrt(x*x + x) - x, 1/(math.sqrt(1 + 1/x) + 1))
```

```output
10000.0 0.49998750062513864 0.49998750062496095
100000000.0 0.5 0.49999999875
1e+16 2.0 0.5
```

At $x = 10^{16}$ the original form gives 2.0, while the rewritten form gives the correct 0.5.

```check
fa8 = (2*x**3 - x)/(4*x**3 + 5*x**2 + 1); same(fa8, (2 - 1/x**2)/(4 + 5/x + 1/x**3)); limit_is(fa8, x, oo, Rational(1, 2))
xn8 = symbols('x', negative=True)
same(sqrt(xn8**2 + 4), -xn8*sqrt(1 + 4/xn8**2)); same((3*xn8 + 1)/(-xn8*sqrt(1 + 4/xn8**2)), -(3 + 1/xn8)/sqrt(1 + 4/xn8**2))
limit_is((3*x + 1)/sqrt(x**2 + 4), x, -oo, -3); limit_is((3*x + 1)/sqrt(x**2 + 4), x, oo, 3)
xp8 = symbols('x', positive=True)
steps(sqrt(xp8**2 + xp8) - xp8, ((sqrt(xp8**2 + xp8) - xp8)*(sqrt(xp8**2 + xp8) + xp8))/(sqrt(xp8**2 + xp8) + xp8), xp8/(sqrt(xp8**2 + xp8) + xp8), 1/(sqrt(1 + 1/xp8) + 1))
same(sqrt(xp8**2 + xp8), xp8*sqrt(1 + 1/xp8)); limit_is(sqrt(x**2 + x) - x, x, oo, Rational(1, 2))
same((1/(sqrt(1 + 1/x) + 1)).subs(x, 10**16), 1/(sqrt(1 + Rational(1, 10**16)) + 1)); rounds(1/(sqrt(1 + Rational(1, 10**16)) + 1), '0.5')
```
:::
::::

:::: exercise An oblique asymptote {#ex-3-8} ★★
Let $f(x) = \dfrac{2x^2 - 3x + 1}{x + 1}$.

- (a) Write $f(x)$ in the form $mx + c + \dfrac{d}{x + 1}$.
- (b) Find all the asymptotes of the graph, and say on which side of the oblique asymptote the graph lies.
- (c) Find where the graph crosses the axes, and describe its shape.

::: solution
**(a)** Divide $2x^2 - 3x + 1$ by $x + 1$ by long division. First $2x^2 \div x = 2x$, and $2x(x + 1) = 2x^2 + 2x$; subtracting leaves $-5x + 1$. Then $-5x \div x = -5$, and $-5(x + 1) = -5x - 5$; subtracting leaves the remainder 6. So $2x^2 - 3x + 1 = (x + 1)(2x - 5) + 6$, and for $x \ne -1$

$$f(x) = 2x - 5 + \frac{6}{x + 1}.$$

Check by expanding: $(x + 1)(2x - 5) + 6 = 2x^2 - 3x - 5 + 6 = 2x^2 - 3x + 1$.

**(b)** As $x \to \pm\infty$, $\dfrac{6}{x + 1} \to 0$, so $y = 2x - 5$ is an oblique asymptote at both ends. For $x > -1$, $\dfrac{6}{x + 1} > 0$ and the graph lies above it; for $x < -1$, below. At $x = -1$ the numerator is $2 + 3 + 1 = 6 \ne 0$, so by Theorem 3.9 $\lim_{x\to-1^+} f(x) = \infty$ and $\lim_{x\to-1^-} f(x) = -\infty$: $x = -1$ is a vertical asymptote. There is no horizontal asymptote, since $f(x) \to \pm\infty$ as $x \to \pm\infty$.

**(c)** $f(x) = 0$ where $2x^2 - 3x + 1 = (2x - 1)(x - 1) = 0$, at $x = \tfrac12$ and $x = 1$, and $f(0) = 1$. So the right-hand branch comes down from $\infty$ beside the line $x = -1$, crosses the $y$-axis at 1, dips below the $x$-axis between $\tfrac12$ and 1, and rises again along the oblique asymptote, above it. The left-hand branch stays below the oblique asymptote and plunges to $-\infty$ as $x \to -1^-$.

```check
f9 = (2*x**2 - 3*x + 1)/(x + 1)
same(expand(2*x*(x + 1)), 2*x**2 + 2*x); same(expand((2*x**2 - 3*x + 1) - (2*x**2 + 2*x)), -5*x + 1); same(expand((-5*x + 1) - (-5*(x + 1))), 6)
same(div(2*x**2 - 3*x + 1, x + 1), (2*x - 5, 6)); steps((x + 1)*(2*x - 5) + 6, 2*x**2 - 3*x - 5 + 6, 2*x**2 - 3*x + 1)
same(f9, 2*x - 5 + 6/(x + 1)); limit_is(f9 - (2*x - 5), x, oo, 0); limit_is(f9 - (2*x - 5), x, -oo, 0)
holds((6/(x + 1)).subs(x, 0) > 0); holds((6/(x + 1)).subs(x, -2) < 0)
same((2*x**2 - 3*x + 1).subs(x, -1), 6); limit_is(f9, x, -1, oo, '+'); limit_is(f9, x, -1, -oo, '-'); limit_is(f9, x, oo, oo); limit_is(f9, x, -oo, -oo)
same(factor(2*x**2 - 3*x + 1), (2*x - 1)*(x - 1)); same_set(solve(f9, x), [Rational(1, 2), 1]); same(f9.subs(x, 0), 1)
holds(f9.subs(x, Rational(3, 4)) < 0)
```
:::
::::

:::: exercise Orders of growth and big-O {#ex-3-9} ★★★
- (a) Arrange these functions in order of growth as $n \to \infty$, from the slowest-growing to the fastest, and justify each comparison:
  $$n^{100}, \quad 2^n, \quad (\ln n)^3, \quad n\log_2 n, \quad \sqrt n, \quad 1.01^n, \quad n!.$$
- (b) A program takes $T(n) = 5n\log_2 n + 100n$ microseconds on an input of size $n$. Show that $T(n) = O(n\log_2 n)$.

::: solution
**(a)** The order is

$$(\ln n)^3 \ll \sqrt n \ll n\log_2 n \ll n^{100} \ll 1.01^n \ll 2^n \ll n!.$$

Each comparison is a ratio that tends to 0:

- $\dfrac{(\ln n)^3}{\sqrt n} = \Big(\dfrac{\ln n}{n^{1/6}}\Big)^3 \to 0^3 = 0$, because $\ln n \ll n^{1/6}$ (Theorem 3.11 with $p = \tfrac16$) and $t^3$ is continuous at 0 (Theorem 3.4).
- $\dfrac{\sqrt n}{n\log_2 n} = \dfrac{1}{\sqrt n\,\log_2 n} \to 0$, since both factors of the denominator grow without bound.
- $\dfrac{n\log_2 n}{n^{100}} = \dfrac{1}{\ln 2}\cdot\dfrac{\ln n}{n^{99}} \to 0$, since $\ln n \ll n^{99}$.
- $\dfrac{n^{100}}{1.01^n} \to 0$, since every power grows more slowly than every exponential with base greater than 1 (Theorem 3.11 with $p = 100$, $a = 1.01$).
- $\dfrac{1.01^n}{2^n} = 0.505^n \to 0$, an exponential with base less than 1 (Section 3.7).
- $\dfrac{2^n}{n!} \to 0$, by Theorem 3.11 with $a = 2$.

The fourth comparison holds only in the long run: $n^{100}$ stays ahead of $1.01^n$ for every $n$ from 2 to 117,308 (Section 3.8).

**(b)** For $n \ge 2$, $\log_2 n \ge 1$, so $100n \le 100\,n\log_2 n$, and

$$T(n) \le 5n\log_2 n + 100\,n\log_2 n = 105\,n\log_2 n.$$

That is the definition of $T(n) = O(n\log_2 n)$, with $C = 105$ and $N = 2$. With limits instead: $\dfrac{T(n)}{n\log_2 n} = 5 + \dfrac{100}{\log_2 n} \to 5$.

```check
npos = symbols('n', positive=True)
same((log(npos)/npos**Rational(1, 6))**3, log(npos)**3/sqrt(npos)); limit_is(log(n)/n**Rational(1, 6), n, oo, 0); limit_is(log(n)**3/sqrt(n), n, oo, 0)
same(sqrt(npos)/(npos*log(npos, 2)), 1/(sqrt(npos)*log(npos, 2))); limit_is(sqrt(n)/(n*log(n, 2)), n, oo, 0)
same(npos*log(npos, 2)/npos**100, (1/log(2))*log(npos)/npos**99); limit_is(n*log(n, 2)/n**100, n, oo, 0)
limit_is(n**100/Rational(101, 100)**n, n, oo, 0)
same(Rational(101, 100)**npos/2**npos, Rational(101, 200)**npos); same(Rational(101, 200), Rational(505, 1000)); limit_is(Rational(101, 200)**n, n, oo, 0)
limit_is(2**n/factorial(n), n, oo, 0)
same(log(2, 2), 1); holds(log(3, 2) > 1); same(5*npos*log(npos, 2) + 100*npos*log(npos, 2), 105*npos*log(npos, 2))
same((5*npos*log(npos, 2) + 100*npos)/(npos*log(npos, 2)), 5 + 100/log(npos, 2)); limit_is((5*n*log(n, 2) + 100*n)/(n*log(n, 2)), n, oo, 5)
```
:::
::::

:::: exercise Polynomials of odd degree {#ex-3-10} ★★★
- (a) Prove that every polynomial of odd degree has at least one real root.
- (b) Give a polynomial of even degree that has no real root.
- (c) Show that $p(x) = x^3 - 3x + 1$ has exactly three real roots, and find three intervals of length 1 that contain them.

::: solution
**(a)** Let $p(x) = a_nx^n + \dots + a_1x + a_0$ with $n$ odd and $a_n \ne 0$. Dividing by $a_n$ does not change the roots, so take $a_n = 1$. A polynomial is a rational function with denominator 1, so by Theorem 3.10 $p(x)$ behaves like its leading term $x^n$ as $x \to \pm\infty$. Since $n$ is odd, $x^n \to \infty$ as $x \to \infty$ and $x^n \to -\infty$ as $x \to -\infty$; hence

$$\lim_{x\to\infty} p(x) = \infty, \qquad \lim_{x\to-\infty} p(x) = -\infty.$$

The first limit means that $p(x) > 0$ for every large enough $x$: pick such a number $B$, so $p(B) > 0$. The second gives a number $A < B$ with $p(A) < 0$. The polynomial $p$ is continuous on $[A, B]$, so by the Intermediate Value Theorem it has a root in $(A, B)$.

**(b)** $x^2 + 1 \ge 1 > 0$ for every real $x$, so it has no real root. For even $n$, $x^n \to \infty$ at both ends, and the argument of (a) breaks down.

**(c)** Evaluate $p$ at a few whole numbers:

| $x$ | $-2$ | $-1$ | $0$ | $1$ | $2$ |
|---|---|---|---|---|---|
| $p(x)$ | $-1$ | $3$ | $1$ | $-1$ | $3$ |

$p$ changes sign on $[-2, -1]$, on $[0, 1]$ and on $[1, 2]$, so by the Intermediate Value Theorem it has a root in each of $(-2, -1)$, $(0, 1)$ and $(1, 2)$: at least three roots. A polynomial of degree 3 has at most three roots (each root $r$ gives a factor $x - r$, and three factors already make degree 3), so $p$ has exactly three real roots.

```check
x1_ = symbols('x', positive=True)
limit_is(x**3 - 3*x + 1, x, oo, oo); limit_is(x**3 - 3*x + 1, x, -oo, -oo); limit_is(x**5 - 7*x**2 + 2, x, -oo, -oo)
same([r_ for r_ in solve(x**2 + 1, x) if r_.is_real], []); limit_is(x**2, x, -oo, oo)
pc = x**3 - 3*x + 1
same([pc.subs(x, v) for v in (-2, -1, 0, 1, 2)], [-1, 3, 1, -1, 3])
rts = Poly(pc, x).real_roots(); same(len(rts), 3)
holds(-2 < rts[0] < -1); holds(0 < rts[1] < 1); holds(1 < rts[2] < 2)
```
:::
::::

:::: exercise The hiker's theorem {#ex-3-11} ★★★
A hiker leaves the bottom of a mountain path at 7:00 on Saturday and reaches the top at 15:00. On Sunday she leaves the top at 7:00 and walks down the same path, reaching the bottom at 15:00. Her speed varies on both days, and she stops to rest now and then. Prove that there is a time of day at which she is at exactly the same point of the path on both days.

::: solution
Measure her position by the distance along the path from the bottom, and let $L$ be the length of the path. Let $u(t)$ be her position at time $t$ (in hours) on Saturday and $d(t)$ her position at the same time on Sunday, for $7 \le t \le 15$. Both are continuous functions of $t$: she cannot jump from one point of the path to another. So

$$g(t) = u(t) - d(t)$$

is continuous on $[7, 15]$ (Theorem 3.1). At the start of the day $g(7) = u(7) - d(7) = 0 - L = -L < 0$, and at the end $g(15) = L - 0 = L > 0$. By the Intermediate Value Theorem there is a time $c$ in $(7, 15)$ with $g(c) = 0$, that is, $u(c) = d(c)$: at time $c$ she is at the same point on both days.

The same argument as a picture: two hikers on one day, one walking up on Saturday's schedule and one walking down on Sunday's, must meet somewhere. The theorem promises at least one such time, but not when. For a hypothetical example, suppose that on Saturday she starts slowly, with $u(t) = Ls^2$ where $s = (t - 7)/8$ is the fraction of the day's walk that has passed, and that on Sunday she walks down at a steady pace, $d(t) = L(1 - s)$. Then $u = d$ when $s^2 = 1 - s$, that is, $s^2 + s - 1 = 0$, whose solution between 0 and 1 is

$$s = \frac{\sqrt5 - 1}{2} \approx 0.618, \qquad t = 7 + 8s \approx 11.94.$$

So at about 11:57 on both days she is at the same point, about 38% of the way up ($s^2 \approx 0.382$).

```check
Lh = symbols('L', positive=True)
same(0 - Lh, -Lh); same(Lh - 0, Lh); holds(-Lh < 0); holds(Lh > 0)
sh = symbols('s'); same_set(solve(sh**2 + sh - 1, sh), [(sqrt(5) - 1)/2, -(sqrt(5) + 1)/2])
sv = (sqrt(5) - 1)/2; same(sv**2, 1 - sv); holds(0 < sv < 1)
rounds(sv, '0.618'); rounds(7 + 8*sv, '11.94'); rounds((7 + 8*sv - 11)*60, '57'); rounds(sv**2, '0.382'); rounds(100*sv**2, '38')
```
:::
::::

## Check yourself {#quiz}

```quiz
? Let $f(x) = \dfrac{x^2 - 1}{x - 1}$ for $x \ne 1$, and $f(1) = 3$. At $x = 1$, $f$ is
- [ ] continuous, because $f(1)$ is defined
- [ ] discontinuous, because $\lim_{x\to1} f(x)$ does not exist
- [x] discontinuous, with a removable discontinuity
- [ ] discontinuous, with a jump
> For $x \ne 1$, $f(x) = x + 1$, so the limit at 1 exists and is 2. It is not $f(1) = 3$, so condition 3 fails, and giving $f$ the value 2 at 1 repairs it: a removable discontinuity. Being defined is not enough for continuity. The limit does exist, which rules out the second answer, and a jump needs one-sided limits that differ.

? The largest interval on which $f(x) = \sqrt{x - 1} + \ln(4 - x)$ is continuous is
- [ ] $(1, 4)$
- [x] $[1, 4)$
- [ ] $[1, 4]$
- [ ] $(-\infty, 4)$
> The square root needs $x \ge 1$, and is continuous from the right at 1; the logarithm needs $4 - x > 0$, that is, $x < 4$. Each piece is continuous where it is defined, so $f$ is continuous on its domain $[1, 4)$. $[1, 4]$ includes 4, where $\ln 0$ is not defined; $(1, 4)$ leaves out 1, where $f$ is continuous from the right; $(-\infty, 4)$ forgets the square root.

? A function $f$ is continuous on $[1, 4]$, with $f(1) = 5$ and $f(4) = -2$. Which statement must be true?
- [x] $f(c) = 0$ for at least one $c$ in $(1, 4)$
- [ ] $f(c) = 0$ for exactly one $c$ in $(1, 4)$
- [ ] $f$ is decreasing on $[1, 4]$
- [ ] $f(c) = 6$ for some $c$ in $(1, 4)$
> 0 lies between $f(1) = 5$ and $f(4) = -2$, so the Intermediate Value Theorem gives at least one $c$ with $f(c) = 0$. It does not say exactly one: the graph may cross the axis three times. Nothing forces $f$ to decrease all the way. And 6 is not between 5 and $-2$, so the theorem says nothing about it.

? The bisection method starts from the bracket $[0, 3]$. After 8 steps the width of the bracket is
- [ ] $3/8 = 0.375$
- [ ] $3/2^7 \approx 0.0234$
- [ ] $0.3/8 = 0.0375$
- [x] $3/2^8 \approx 0.0117$
> Each step halves the width, so after 8 steps it is $(3 - 0)/2^8 = 3/256 \approx 0.0117$. Dividing by 8 instead of $2^8$ treats the method as cutting the interval into 8 equal parts; $3/2^7$ is the width after 7 steps; and $0.3/8$ has no meaning here.

? For which function and interval does the Extreme Value Theorem guarantee a maximum value?
- [ ] $1/x$ on $(0, 1]$
- [ ] $\tan x$ on $[0, \pi]$
- [x] $x^3 - 5x$ on $[-3, 3]$
- [ ] $x$ on $(0, 1)$
> $x^3 - 5x$ is a polynomial, continuous on the closed interval $[-3, 3]$, so the theorem applies. $(0, 1]$ is not closed, and $1/x$ grows without bound near 0; $\tan x$ is not defined at $\pi/2$, which is inside $[0, \pi]$; and on the open interval $(0, 1)$, $x$ has no largest value.

? The vertical asymptotes of $y = \dfrac{x^2 - 4}{x^2 - 3x + 2}$ are
- [ ] $x = 1$ and $x = 2$
- [x] $x = 1$ only
- [ ] $x = 2$ only
- [ ] $x = -2$ and $x = 1$
> Factor: $\dfrac{(x - 2)(x + 2)}{(x - 2)(x - 1)} = \dfrac{x + 2}{x - 1}$ for $x \ne 2$. At 2 the factor cancels and the limit is 4: a hole, not an asymptote. At 1 the numerator tends to 3 while the denominator tends to 0, so the values blow up. $x = -2$ is where the function is 0, not an asymptote.

? The graph of $y = \dfrac{6x^2 + x}{2x^2 - 8}$ has
- [ ] the horizontal asymptote $y = 3$ and no vertical asymptote
- [ ] the vertical asymptotes $x = \pm 2$ and the horizontal asymptote $y = 0$
- [ ] the vertical asymptote $x = 4$ and the horizontal asymptote $y = 3$
- [x] the vertical asymptotes $x = \pm 2$ and the horizontal asymptote $y = 3$
> The degrees are equal, so $y \to 6/2 = 3$ at both ends. The denominator $2(x - 2)(x + 2)$ is 0 at $\pm2$, where the numerator (26 and 22) is not, so both lines are vertical asymptotes. The asymptote $y = 0$ would need a numerator of lower degree than the denominator, and $x = 4$ comes from solving $2x - 8 = 0$ instead of $2x^2 - 8 = 0$.

? Which statement is false?
- [x] $2^n = O(n^{10})$
- [ ] $5n^2 + 100n = O(n^2)$
- [ ] $n\log_2 n = O(n^2)$
- [ ] $\ln n \ll \sqrt n$
> $n^{10} \ll 2^n$ (Theorem 3.11), so $2^n/n^{10}$ grows without bound, and no constant $C$ gives $2^n \le Cn^{10}$ for all large $n$: $2^n$ is not $O(n^{10})$, although $n^{10}$ is the larger for every $n$ from 2 to 58. The other three are true: $5n^2 + 100n \le 105n^2$ for $n \ge 1$; $n\log_2 n \le n^2$ because $\log_2 n \le n$; and $\ln n/\sqrt n \to 0$.
```

```check
fq1 = (x**2 - 1)/(x - 1); same(cancel(fq1), x + 1); limit_is(fq1, x, 1, 2); holds(Ne(2, 3))
from sympy.calculus.util import continuous_domain
same(continuous_domain(sqrt(x - 1) + log(4 - x), x, S.Reals), Interval.Ropen(1, 4))
holds(-2 < 0 < 5); holds(not (-2 < 6 < 5))
same(Rational(3, 2**8), Rational(3, 256)); rounds(Rational(3, 2**8), '0.0117'); rounds(Rational(3, 2**7), '0.0234'); rounds(Rational(3, 8), '0.375'); rounds(Rational(3, 80), '0.0375')
limit_is(tan(x), x, pi/2, oo, '-'); limit_is(1/x, x, 0, oo, '+')
fq6 = (x**2 - 4)/(x**2 - 3*x + 2); same(cancel(fq6), (x + 2)/(x - 1)); limit_is(fq6, x, 2, 4); limit_is(fq6, x, 1, oo, '+'); limit_is(fq6, x, 1, -oo, '-')
fq7 = (6*x**2 + x)/(2*x**2 - 8); limit_is(fq7, x, oo, 3); limit_is(fq7, x, -oo, 3); same(factor(2*x**2 - 8), 2*(x - 2)*(x + 2))
same((6*x**2 + x).subs(x, 2), 26); same((6*x**2 + x).subs(x, -2), 22); limit_is(fq7, x, 2, oo, '+')
limit_is(2**n/n**10, n, oo, oo); same(factor(105*n**2 - (5*n**2 + 100*n)), 100*n*(n - 1)); limit_is(log(n)/sqrt(n), n, oo, 0)
holds(all(k_**10 > 2**k_ for k_ in range(2, 59)))
```
