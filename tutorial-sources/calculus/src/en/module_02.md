---
title: Limits
part: 1
lead: Learn what it means for a function to approach a value, and how to find limits from tables, graphs and algebra. You will prove the limit on which the calculus of sine and cosine rests, use the precise ε–δ definition in proofs, and see when a computer gets a limit wrong.
minutes: 240
needs: Module 1
goals:
  - Estimate a limit from a table of values or a graph, and recognise the three ways in which a limit can fail to exist
  - Find one-sided limits, and use them to decide whether a limit exists
  - Evaluate limits with the limit laws, direct substitution, factoring, rationalising and combining fractions
  - Use the squeeze theorem, and prove that sin θ/θ approaches 1 as θ approaches 0
  - State the ε–δ definition of a limit, and use it to prove limits of linear and quadratic functions
  - Explain cancellation error in floating-point arithmetic, and compute limits with SymPy
---

## The idea of a limit {#idea}

Module 1 ended with a falling ball. After $t$ seconds it has fallen $s(t) = 4.9t^2$ metres, and its average speed between the times $t = 1$ and $t = 1 + h$ is the difference quotient

$$\frac{s(1 + h) - s(1)}{h} = 9.8 + 4.9h \qquad (h \ne 0).$$

As $h$ shrinks towards 0, from either side, these average speeds settle down to 9.8 m/s, the speed of the ball at the instant $t = 1$ ([Section 1.6](module_01_EN.html#shrinking)). Two things are worth noticing. You cannot put $h = 0$: the quotient would be $0/0$, which means nothing. And 9.8 is not one of the average speeds, since $9.8 + 4.9h = 9.8$ only when $h = 0$. It is the number that the average speeds approach. Such a number is a **limit**, and the whole of calculus rests on the idea.

```check
s49 = Rational(49, 10)*t**2
dq = (s49.subs(t, 1 + h) - s49.subs(t, 1))/h
same(cancel(dq), Rational(98, 10) + Rational(49, 10)*h)
same(solve(Eq(Rational(98, 10) + Rational(49, 10)*h, Rational(98, 10)), h), [0])
holds(dq.subs(h, 0) is S.NaN)
limit_is(dq, h, 0, Rational(98, 10))
```

Here is the same situation without the physics. The function

$$f(x) = \frac{x^2 - 1}{x - 1}$$

is not defined at $x = 1$, where it gives $0/0$. Near 1 it is defined, and a table of its values shows what it does there:

```valuetable
x = 0.9, 0.99, 0.999, 0.9999, 1.0001, 1.001, 1.01, 1.1
$\dfrac{x^2-1}{x-1}$ = (x**2 - 1)/(x - 1)
---
x | \dfrac{x^2-1}{x-1}
0.9 | 1.9
0.99 | 1.99
0.999 | 1.999
0.9999 | 1.9999
1.0001 | 2.0001
1.001 | 2.001
1.01 | 2.01
1.1 | 2.1
```

The closer $x$ is to 1, from either side, the closer $f(x)$ is to 2. Algebra explains why. Factor the numerator, $x^2 - 1 = (x - 1)(x + 1)$, and cancel the factor $x - 1$, which is not 0 when $x \ne 1$:

$$f(x) = \frac{(x - 1)(x + 1)}{x - 1} = x + 1 \qquad (x \ne 1).$$

So the graph of $f$ is the line $y = x + 1$ with one point missing, a hole at $(1, 2)$, like the rational function of [Example 1.5](module_01_EN.html#rational) (Figure 2.1, left). As $x$ approaches 1, $f(x) = x + 1$ approaches 2.

```check
f21 = (x**2 - 1)/(x - 1)
same(factor(x**2 - 1), (x - 1)*(x + 1)); same(cancel(f21), x + 1)
holds(f21.subs(x, 1) is S.NaN)
limit_is(f21, x, 1, 2)
```

::: definition Limit
Let $f$ be a function defined at every $x$ in an open interval containing the number $a$, except possibly at $a$ itself. If $f(x)$ can be made as close to a number $L$ as you like by taking $x$ close enough to $a$, but not equal to $a$, then $L$ is the **limit** of $f(x)$ as $x$ approaches $a$, and you write

$$\lim_{x\to a} f(x) = L.$$
:::

Read $\lim_{x\to a} f(x) = L$ as "the limit of f of x as x approaches a is L". Another way to write it is $f(x) \to L$ as $x \to a$, read "f of x tends to L as x tends to a". If there is no such number $L$, the limit **does not exist**. So far:

$$\begin{aligned} \lim_{x\to 1}\frac{x^2 - 1}{x - 1} &= 2, \\ \lim_{h\to 0}\frac{s(1 + h) - s(1)}{h} &= 9.8. \end{aligned}$$

The name of the variable does not matter: in the second limit $h$ plays the part of $x$, and 0 that of $a$.

Definition 2.1 is informal: "as close as you like" and "close enough" are not yet precise. Section 2.7 turns them into numbers, and with them into proofs. Until then, tables, graphs and algebra will do.

::: keyidea
A limit describes what $f(x)$ does as $x$ approaches $a$, never what happens at $a$. The value $f(a)$ may be undefined, equal to the limit or different from it, and the limit is the same in all three cases (Figure 2.1).
:::

::: figure id=fig-02-1
Three functions with the same limit at $x = 1$. Left: $f(x) = \dfrac{x^2 - 1}{x - 1}$ is not defined at 1; as $x$ approaches 1 from either side (orange arrows on the $x$-axis), $f(x)$ approaches 2 (orange arrows beside the $y$-axis). Middle: $g(x) = x + 1$, with $g(1) = 2$. Right: $h(x) = x + 1$ for $x \ne 1$, and $h(1) = 1$. Away from $x = 1$ the three graphs are the same line, so all three limits at 1 are 2.
:::

::: example A limit from a table
Estimate the limit of $\dfrac{\sin x}{x}$ as $x \to 0$, with $x$ in radians.

The function is not defined at $x = 0$, so compute its values near 0:

```valuetable
x = 1, 0.5, 0.1, 0.01, 0.001
$\dfrac{\sin x}{x}$ = sin(x)/x
digits = 8
---
x | \dfrac{\sin x}{x}
1 | 0.84147098
0.5 | 0.95885108
0.1 | 0.99833417
0.01 | 0.99998333
0.001 | 0.99999983
```

Negative values of $x$ give the same numbers: sine is odd ([Section 1.4](module_01_EN.html#trig)), so

$$\frac{\sin(-x)}{-x} = \frac{-\sin x}{-x} = \frac{\sin x}{x}.$$

The values approach 1, and it is natural to guess that

$$\lim_{x\to 0}\frac{\sin x}{x} = 1.$$

A table suggests a limit but does not prove it. Section 2.6 proves this one, which is among the most important limits in calculus.

```check
steps(sin(-x)/(-x), -sin(x)/(-x), sin(x)/x)
limit_is(sin(x)/x, x, 0, 1)
```
:::

::: pitfall
A table shows finitely many values, and they can mislead. Try $f(x) = \sin(\pi/x)$ at $x = 0.1$, 0.01 and 0.001: the values are $\sin(10\pi)$, $\sin(100\pi)$ and $\sin(1000\pi)$, all exactly 0, so the table suggests the limit 0 as $x \to 0$. But at $x = \tfrac{2}{21} \approx 0.095$ the value is $\sin\tfrac{21\pi}{2} = 1$, and at $x = \tfrac{2}{201} \approx 0.00995$ it is $\sin\tfrac{201\pi}{2} = 1$ again. As close to 0 as you like there are points where $f(x) = 0$ and points where $f(x) = 1$, and the limit does not exist, for the reason that Example 2.3 gives for $\sin(1/x)$. Use tables to guess; use algebra or a proof to be sure.

```check
fpi = sin(pi/x)
same([fpi.subs(x, Rational(1, 10**j)) for j in (1, 2, 3)], [0, 0, 0])
same(pi/Rational(1, 10), 10*pi); same(sin(10*pi), 0); same(sin(100*pi), 0); same(sin(1000*pi), 0)
same(fpi.subs(x, Rational(2, 21)), 1); same(sin(21*pi/2), 1); rounds(Rational(2, 21), '0.095')
same(fpi.subs(x, Rational(2, 201)), 1); same(sin(201*pi/2), 1); rounds(Rational(2, 201), '0.00995')
```
:::

## One-sided limits {#one-sided}

Module 1 drew the piecewise function

$$f(x) = \begin{cases} x^2 & \text{if } x < 1, \\ 3 - x & \text{if } x \ge 1, \end{cases}$$

whose graph jumps at $x = 1$ ([Example 1.3](module_01_EN.html#piecewise)). Near 1 its values are

```valuetable
x = 0.9, 0.99, 0.999, 1.001, 1.01, 1.1
$f(x)$ = Piecewise((x**2, x < 1), (3 - x, True))
---
x | f(x)
0.9 | 0.81
0.99 | 0.9801
0.999 | 0.998001
1.001 | 1.999
1.01 | 1.99
1.1 | 1.9
```

To the left of 1, $f(x) = x^2$ approaches 1; to the right, $f(x) = 3 - x$ approaches 2. No single number is approached from both sides, so $\lim_{x\to1} f(x)$ does not exist. But each side, taken alone, has a limit.

::: definition One-sided limits
Let $f$ be defined on an open interval $(c, a)$ that ends at $a$. If $f(x)$ can be made as close to a number $L$ as you like by taking $x$ close enough to $a$ with $x < a$, then $L$ is the **limit from the left** (or **left-hand limit**) of $f$ at $a$, written

$$\lim_{x\to a^-} f(x) = L.$$

The **limit from the right** (or **right-hand limit**), $\lim_{x\to a^+} f(x) = L$, is defined in the same way, with $f$ defined on an interval $(a, d)$ and $x > a$.
:::

Read $x \to a^-$ as "x approaches a from the left", through values below $a$, and $x \to a^+$ as "x approaches a from the right". For the piecewise function above,

$$\lim_{x\to 1^-} f(x) = 1, \quad \lim_{x\to 1^+} f(x) = 2, \quad f(1) = 2.$$

```check
fpw = Piecewise((x**2, x < 1), (3 - x, True))
hp = symbols('h', positive=True)                  # x = 1 - h is left of 1, and x = 1 + h right of it
same(fpw.subs(x, 1 - hp), (1 - hp)**2); same(fpw.subs(x, 1 + hp), 2 - hp)
limit_is((1 - hp)**2, hp, 0, 1, '+'); limit_is(2 - hp, hp, 0, 2, '+')
same(fpw.subs(x, 1), 2)
```

The two-sided limit of Definition 2.1 asks for closeness on both sides at once, so it exists exactly when the one-sided limits exist and agree:

::: keyidea
$\lim_{x\to a} f(x) = L$ exactly when $\lim_{x\to a^-} f(x) = L$ and $\lim_{x\to a^+} f(x) = L$. If the one-sided limits differ, or if one of them does not exist, then $\lim_{x\to a} f(x)$ does not exist. (Theorem 2.7 proves this from the precise definition.)
:::

::: example A jump at 0
Find the one-sided limits of $f(x) = \dfrac{\abs{x}}{x}$ at 0. Does $\lim_{x\to0} f(x)$ exist?

$f$ is defined for every $x \ne 0$. For $x > 0$, $\abs{x} = x$, so $f(x) = x/x = 1$; for $x < 0$, $\abs{x} = -x$, so $f(x) = -x/x = -1$. Each piece is constant, so

$$\lim_{x\to0^-}\frac{\abs{x}}{x} = -1 \qquad\text{and}\qquad \lim_{x\to0^+}\frac{\abs{x}}{x} = 1.$$

The one-sided limits differ, so $\lim_{x\to0} \abs{x}/x$ does not exist. The graph (Figure 2.2, left) consists of two horizontal half-lines, with a jump of 2 at $x = 0$.

```check
xpos = symbols('x', positive=True); xneg = symbols('x', negative=True)
same(Abs(xpos)/xpos, 1); same(Abs(xneg)/xneg, -1)
limit_is(Abs(x)/x, x, 0, -1, '-'); limit_is(Abs(x)/x, x, 0, 1, '+')
same(1 - (-1), 2)
```
:::

Jumps are common in engineering. A circuit whose switch closes at time $t = 0$ is described with the **unit step** $u(t)$, which is 0 for $t < 0$ and 1 for $t > 0$ (books differ about its value at 0 itself). Its limit from the left at 0 is 0 and its limit from the right is 1, whatever $u(0)$ is. Signal processing builds switched signals from it.

```check
ustep = Piecewise((0, t < 0), (1, t > 0))
same(ustep.subs(t, -hp), 0); same(ustep.subs(t, hp), 1)
```

::: pitfall
Two misreadings of the notation. $x \to 1^-$ means that $x$ approaches 1 from below, through values such as 0.9, 0.99 and 0.999. It does not mean $x \to -1$, and the values of $x$ need not be negative. And one-sided limits do not depend on the value at the point: for the piecewise function above, $f(1) = 2$ comes from the right-hand formula, but the limit from the right would still be 2 if $f(1)$ were changed to 7.
:::

## Limits that do not exist {#no-limit}

A limit can fail to exist in three ways. Figure 2.2 shows one of each.

::: figure id=fig-02-2
Three ways for a limit not to exist, all at $x = 0$. Left, a jump: $\abs{x}/x$ is $-1$ to the left of 0 and 1 to the right. Middle, a blow-up: $1/x^2$ grows beyond every bound. Right, an oscillation: $\sin(1/x)$ swings between $-1$ and 1, faster and faster as $x$ approaches 0; near 0 the swings are too close together to draw, and the graph looks like a solid band.
:::

**A jump.** The one-sided limits exist but differ, as for $\abs{x}/x$ at 0 (Example 2.2).

**A blow-up.** As $x$ approaches 0, the values of $1/x^2$ grow beyond every bound:

```valuetable
x = 1, 0.1, 0.01, 0.001
$\dfrac{1}{x^2}$ = 1/x**2
---
x | \dfrac{1}{x^2}
1 | 1
0.1 | 100
0.01 | 10000
0.001 | 1\times10^{6}
```

and $-x$ gives the same values as $x$. Whatever number $L$ you name, $1/x^2 > \abs{L} + 1$ for every $x \ne 0$ with $x^2 < 1/(\abs{L} + 1)$, so close to 0 the values of $1/x^2$ are more than 1 away from $L$. No number is the limit. Module 3 describes this behaviour by writing $\lim_{x\to0} 1/x^2 = \infty$, an **infinite limit**; but $\infty$ is not a number, and in the sense of Definition 2.1 the limit does not exist.

```check
same((1/x**2).subs(x, -x), 1/x**2)
for Lv_ in (-3, 0, Rational(5, 2), 100):
    X_ = Rational(1, 2*(abs(Lv_) + 1))            # a value of x^2 below 1/(|L| + 1)
    holds(X_ < Rational(1, abs(Lv_) + 1)); holds(1/X_ > abs(Lv_) + 1); holds(1/X_ - Lv_ > 1)
```

**An oscillation.** As $x$ approaches 0, $\sin(1/x)$ swings between $-1$ and 1 infinitely often.

::: example An oscillation
Show that $\lim_{x\to0}\sin(1/x)$ does not exist.

$\sin u = 1$ when $u = \tfrac{\pi}{2}, \tfrac{5\pi}{2}, \tfrac{9\pi}{2}, \dots$, and $\sin u = -1$ when $u = \tfrac{3\pi}{2}, \tfrac{7\pi}{2}, \tfrac{11\pi}{2}, \dots$. Taking $u = 1/x$, that is, $x = 1/u$, gives points closer and closer to 0 where $\sin(1/x)$ is 1 and $-1$ in turn:

```valuetable
x = 2/pi, 2/(3*pi), 2/(5*pi), 2/(7*pi), 2/(9*pi), 2/(11*pi)
$x\ (\text{decimal})$ = x
$\sin(1/x)$ = sin(1/x)
digits = 4
---
x | x\ (\text{decimal}) | \sin(1/x)
\frac{2}{\pi} | 0.6366 | 1
\frac{2}{3 \pi} | 0.2122 | -1
\frac{2}{5 \pi} | 0.1273 | 1
\frac{2}{7 \pi} | 0.09095 | -1
\frac{2}{9 \pi} | 0.07074 | 1
\frac{2}{11 \pi} | 0.05787 | -1
```

In general $x = \dfrac{2}{(4k + 1)\pi}$ gives $\sin(1/x) = 1$ and $x = \dfrac{2}{(4k + 3)\pi}$ gives $\sin(1/x) = -1$, for $k = 0, 1, 2, \dots$, and as $k$ grows these points come as close to 0 as you like. So every open interval around 0, however small, contains points where $\sin(1/x) = 1$ and points where $\sin(1/x) = -1$. If the values near 0 stayed within $\tfrac12$ of one number $L$, then 1 and $-1$ would both be within $\tfrac12$ of $L$, and so within 1 of each other; but they are 2 apart. No number $L$ is the limit.

```check
kk = symbols('k', integer=True, nonnegative=True)
same(sin(1/(2/((4*kk + 1)*pi))), 1); same(sin(1/(2/((4*kk + 3)*pi))), -1)
limit_is(2/((4*k + 1)*pi), k, oo, 0); limit_is(2/((4*k + 3)*pi), k, oo, 0)
same(1 - (-1), 2); holds(Rational(1, 2) + Rational(1, 2) < 2)
same(limit(sin(1/x), x, 0, '+-'), AccumBounds(-1, 1))
```
:::

::: pitfall
"The limit does not exist" and "the function is not defined at $a$" are different statements, and neither follows from the other. $\dfrac{x^2 - 1}{x - 1}$ is not defined at 1 but has the limit 2 there. The function that is $-1$ for $x < 0$ and 1 for $x \ge 0$ is defined at 0, with the value 1, but has no limit there.
:::

## The limit laws {#laws}

Tables and graphs suggest limits; the limit laws compute them, by building complicated limits from simple ones. The two simplest are

$$\lim_{x\to a} c = c \qquad\text{and}\qquad \lim_{x\to a} x = a$$

for every constant $c$ and every number $a$. The first says that a constant function stays at its constant; the second, that as $x$ approaches $a$, the values of the function $x$ approach $a$. Section 2.7 proves both from the precise definition.

::: theorem Limit laws
Suppose that $\lim_{x\to a} f(x) = L$ and $\lim_{x\to a} g(x) = M$, and let $c$ be a constant. Then:

| Law | Statement |
|---|---|
| Sum | $\lim\limits_{x\to a}\big(f(x) + g(x)\big) = L + M$ |
| Difference | $\lim\limits_{x\to a}\big(f(x) - g(x)\big) = L - M$ |
| Constant multiple | $\lim\limits_{x\to a} c\,f(x) = cL$ |
| Product | $\lim\limits_{x\to a} f(x)\,g(x) = LM$ |
| Quotient | $\lim\limits_{x\to a} \dfrac{f(x)}{g(x)} = \dfrac{L}{M}$, if $M \ne 0$ |
| Power | $\lim\limits_{x\to a} \big(f(x)\big)^n = L^n$, for $n = 1, 2, 3, \dots$ |
| Root | $\lim\limits_{x\to a} \sqrt[n]{f(x)} = \sqrt[n]{L}$, for $n = 2, 3, \dots$, if $L > 0$ when $n$ is even |

The same laws hold for one-sided limits.
:::

In words: the limit of a sum is the sum of the limits, the limit of a product is the product of the limits, and so on, provided that the limits of the pieces exist and, for a quotient, that the limit of the denominator is not 0. The laws say what you would expect: if $f(x)$ is close to $L$ and $g(x)$ is close to $M$, then $f(x) + g(x)$ is close to $L + M$ and $f(x)g(x)$ is close to $LM$. Turning "close" into a proof needs the precise definition, so the proofs come in Section 2.7, where a Going deeper box proves the sum, product and quotient laws. The other laws follow from those three: $f - g$ is $f + (-1)g$; the constant multiple $c\,f$ is the product of $f$ with the constant function $c$; and the power law is the product law used $n - 1$ times. The root law for square roots is Exercise 2.9; other roots are handled in the same way, with the difference of $n$th powers in place of the difference of squares.

```check
fF, gF = Function('f')(x), Function('g')(x)
same(fF - gF, fF + (-1)*gF); same(fF**3, fF*fF*fF)
```

::: example Using the limit laws
Find

$$\lim_{x\to2}\frac{2x^2 - 3x + 1}{x + 3},$$

naming the law used at each step.

Start with the numerator. By the sum and difference laws, then the constant multiple law,

$$\begin{aligned} &\lim_{x\to2}\big(2x^2 - 3x + 1\big) \\ &\quad= 2\lim_{x\to2} x^2 - 3\lim_{x\to2} x + \lim_{x\to2} 1. \end{aligned}$$

By the power law and the two basic limits, $\lim_{x\to2} x^2 = 2^2 = 4$, $\lim_{x\to2} x = 2$ and $\lim_{x\to2} 1 = 1$, so the numerator approaches $2 \cdot 4 - 3 \cdot 2 + 1 = 3$. In the same way the denominator approaches $2 + 3 = 5$. That is not 0, so the quotient law applies:

$$\lim_{x\to2}\frac{2x^2 - 3x + 1}{x + 3} = \frac{3}{5}.$$

```check
num4 = 2*x**2 - 3*x + 1
steps(Limit(num4, x, 2), 2*Limit(x**2, x, 2) - 3*Limit(x, x, 2) + Limit(1, x, 2), 2*4 - 3*2 + 1, 3)
same(Limit(x**2, x, 2).doit(), 4); same(Limit(x + 3, x, 2).doit(), 5)
limit_is(num4/(x + 3), x, 2, Rational(3, 5))
```
:::

### Direct substitution {#substitution}

The answer of Example 2.4, $\tfrac35$, is the value of the function at 2: $\dfrac{2 \cdot 2^2 - 3 \cdot 2 + 1}{2 + 3} = \dfrac35$. That is no accident.

::: theorem Direct substitution
If $p$ is a polynomial, then $\lim_{x\to a} p(x) = p(a)$ for every number $a$. If $r = p/q$ is a rational function and $q(a) \ne 0$, then $\lim_{x\to a} r(x) = r(a)$.
:::

::: proof
Write $p(x) = c_n x^n + \dots + c_1 x + c_0$. By the power law and the basic limit $\lim_{x\to a} x = a$, $\lim_{x\to a} x^k = a^k$ for each $k \ge 1$; by the constant multiple law, $\lim_{x\to a} c_k x^k = c_k a^k$; and by the sum law, used once for each plus sign, together with $\lim_{x\to a} c_0 = c_0$,

$$\lim_{x\to a} p(x) = c_n a^n + \dots + c_1 a + c_0 = p(a).$$

If $r = p/q$, then $\lim_{x\to a} p(x) = p(a)$ and $\lim_{x\to a} q(x) = q(a)$, which is not 0, so the quotient law gives $\lim_{x\to a} r(x) = p(a)/q(a) = r(a)$.
:::

```check
cs = symbols('c0:4')
pg = sum(cs[j]*x**j for j in range(4))
same(limit(pg, x, a), pg.subs(x, a))
same(Rational(2*2**2 - 3*2 + 1, 2 + 3), Rational(3, 5))
```

Direct substitution also works for roots, by the root law: for example, $\lim_{x\to4}\sqrt{x} = \sqrt4 = 2$. Module 3 shows that it works for every function in Module 1's catalogue, at every point inside its domain; such functions are called **continuous**. Until then this module uses direct substitution only for polynomials, rational functions and roots, and Section 2.6 proves by hand that $\sin\theta \to 0$ and $\cos\theta \to 1$ as $\theta \to 0$.

```check
limit_is(sqrt(x), x, 4, 2)
```

::: pitfall
Two misuses of the laws. First, the quotient law needs $M \ne 0$. For $\lim_{x\to1}\dfrac{x^2 - 1}{x - 1}$ it would give $\dfrac00$, which is not a number: the law does not apply, and the limit, 2, has to be found another way, as in Section 2.1. Second, the laws work in one direction only. If the pieces have limits, so does the combination; but a combination can have a limit when its pieces do not. Neither $\sin(1/x)$ nor $-\sin(1/x)$ has a limit at 0, yet their sum is 0 for every $x \ne 0$, with limit 0.

```check
same((x**2 - 1).subs(x, 1), 0); same((x - 1).subs(x, 1), 0)
same(sin(1/x) + (-sin(1/x)), 0)
```
:::

## Algebraic techniques {#algebra}

### The form 0/0 {#zero-over-zero}

When direct substitution in a quotient gives $0/0$, the limit may still exist, and it can be any number. Each of these four quotients gives $0/0$ at $x = 1$:

| $f(x)$ | $f(x)$ for $x \ne 1$ | $\lim\limits_{x\to1} f(x)$ |
|---|---|---|
| $\dfrac{x^2 - 1}{x - 1}$ | $x + 1$ | 2 |
| $\dfrac{3x - 3}{x - 1}$ | $3$ | 3 |
| $\dfrac{x^2 - 2x + 1}{x - 1}$ | $x - 1$ | 0 |
| $\dfrac{x - 1}{x^2 - 2x + 1}$ | $\dfrac{1}{x - 1}$ | does not exist |

The last one blows up at 1, with huge positive values to the right of 1 and huge negative values to the left. So $0/0$ is called an **indeterminate form**: the form alone does not determine the limit. It is a signal to do more work, not an answer. The work is algebra that rewrites the quotient, for $x \ne a$, as a function to which direct substitution applies, and this theorem is what makes that legitimate:

```check
for num_, den_, simp_ in ((x**2 - 1, x - 1, x + 1), (3*x - 3, x - 1, 3), (x**2 - 2*x + 1, x - 1, x - 1), (x - 1, x**2 - 2*x + 1, 1/(x - 1))):
    same(num_.subs(x, 1), 0); same(den_.subs(x, 1), 0); same(cancel(num_/den_), simp_)
limit_is((x**2 - 1)/(x - 1), x, 1, 2); limit_is((3*x - 3)/(x - 1), x, 1, 3); limit_is((x**2 - 2*x + 1)/(x - 1), x, 1, 0)
limit_is((x - 1)/(x**2 - 2*x + 1), x, 1, oo, '+'); limit_is((x - 1)/(x**2 - 2*x + 1), x, 1, -oo, '-')
```

::: theorem Functions that agree near a point
If $f(x) = g(x)$ for every $x \ne a$ in an open interval containing $a$, and $\lim_{x\to a} g(x) = L$, then $\lim_{x\to a} f(x) = L$. The same holds for a one-sided limit when $f(x) = g(x)$ on an open interval that ends at $a$ on that side.
:::

::: proof
The limit of $f$ at $a$ depends only on the values $f(x)$ for $x$ close to $a$ with $x \ne a$. Close enough to $a$, every such $x$ lies in the interval, where $f(x) = g(x)$. So $f(x)$ can be made as close to $L$ as you like exactly when $g(x)$ can. (In the language of Section 2.7: a $\delta$ that works for $g$, made smaller if necessary so that $(a - \delta, a + \delta)$ lies inside the interval, works for $f$.) For a one-sided limit, the same argument looks at one side of $a$ only.
:::

### Factor and cancel {#factor}

If substitution gives $0/0$ in a quotient of polynomials, then $x - a$ is a factor of both the numerator and the denominator. The reason: if $p(a) = 0$, then $p(x) = p(x) - p(a) = c_n(x^n - a^n) + \dots + c_1(x - a)$, and each $x^k - a^k$ has the factor $x - a$:

$$\begin{aligned} &x^k - a^k \\ &\quad= (x - a)\big(x^{k-1} + x^{k-2}a + \dots + a^{k-1}\big). \end{aligned}$$

So factor the numerator and the denominator, cancel $x - a$ (allowed, since $x \ne a$), and substitute; if $0/0$ appears again, repeat.

```check
for N_ in range(1, 7):
    same((x - a)*sum(x**(N_ - 1 - j)*a**j for j in range(N_)), x**N_ - a**N_)
same(expand(pg - pg.subs(x, a)), expand(sum(cs[j]*(x**j - a**j) for j in range(1, 4))))
```

::: example The speed of the falling ball
Find the speed of the falling ball, $s(t) = 4.9t^2$, at the time $t = a$:

$$\lim_{h\to0}\frac{s(a + h) - s(a)}{h}.$$

Substituting $h = 0$ gives $0/0$. Expand $s(a + h)$ and subtract $s(a)$:

$$\begin{aligned} &s(a + h) - s(a) \\ &\quad= 4.9(a^2 + 2ah + h^2) - 4.9a^2 \\ &\quad= 9.8ah + 4.9h^2 = h(9.8a + 4.9h). \end{aligned}$$

For $h \ne 0$ the factor $h$ cancels:

$$\frac{s(a + h) - s(a)}{h} = 9.8a + 4.9h \qquad (h \ne 0).$$

By Theorem 2.3 and direct substitution (in the variable $h$),

$$\lim_{h\to0}\frac{s(a + h) - s(a)}{h} = 9.8a.$$

At time $a$ the ball falls at $9.8a$ m/s: 9.8 m/s after one second, as in Module 1, and 19.6 m/s after two. Its speed grows by 9.8 m/s every second, the acceleration due to gravity of Module 1. Limits of this kind are the derivatives of Module 4.

```check
sa = Rational(49, 10)*t**2
steps(sa.subs(t, a + h) - sa.subs(t, a), Rational(49, 10)*(a**2 + 2*a*h + h**2) - Rational(49, 10)*a**2,
      Rational(98, 10)*a*h + Rational(49, 10)*h**2, h*(Rational(98, 10)*a + Rational(49, 10)*h))
same(cancel((sa.subs(t, a + h) - sa.subs(t, a))/h), Rational(98, 10)*a + Rational(49, 10)*h)
limit_is((sa.subs(t, a + h) - sa.subs(t, a))/h, h, 0, Rational(98, 10)*a)
same(Rational(98, 10)*2, Rational(196, 10)); same(Rational(98, 10)*(a + 1) - Rational(98, 10)*a, Rational(98, 10))
```
:::

::: example Factor and cancel
Find

$$\lim_{x\to3}\frac{x^2 - x - 6}{x^2 - 9}.$$

At $x = 3$ the numerator is $9 - 3 - 6 = 0$ and the denominator is $9 - 9 = 0$, so both have the factor $x - 3$: $x^2 - x - 6 = (x - 3)(x + 2)$ and $x^2 - 9 = (x - 3)(x + 3)$. For $x \ne 3$ (and $x \ne -3$),

$$\frac{x^2 - x - 6}{x^2 - 9} = \frac{(x - 3)(x + 2)}{(x - 3)(x + 3)} = \frac{x + 2}{x + 3}.$$

The new denominator is 6 at $x = 3$, not 0, so by Theorem 2.3 and direct substitution

$$\lim_{x\to3}\frac{x^2 - x - 6}{x^2 - 9} = \frac{3 + 2}{3 + 3} = \frac56.$$

```check
n6, d6 = x**2 - x - 6, x**2 - 9
same(n6.subs(x, 3), 0); same(d6.subs(x, 3), 0); same(9 - 3 - 6, 0)
same(factor(n6), (x - 3)*(x + 2)); same(factor(d6), (x - 3)*(x + 3))
same(cancel(n6/d6), (x + 2)/(x + 3)); same((x + 3).subs(x, 3), 6)
limit_is(n6/d6, x, 3, Rational(5, 6))
```
:::

### Rationalise {#rationalise}

When the $0/0$ comes from a difference that contains a square root, multiply the numerator and the denominator by the **conjugate**, the same two terms with the opposite sign between them. The conjugate of $\sqrt{A} - B$ is $\sqrt{A} + B$, and their product,

$$\big(\sqrt{A} - B\big)\big(\sqrt{A} + B\big) = A - B^2 \qquad (A \ge 0),$$

has no square root left.

```check
Ann = symbols('A', nonnegative=True)
same(expand((sqrt(Ann) - b)*(sqrt(Ann) + b)), Ann - b**2)
```

::: example Rationalise
Find

$$\lim_{x\to0}\frac{\sqrt{x + 9} - 3}{x}.$$

Substitution gives $(\sqrt9 - 3)/0 = 0/0$. Multiply the numerator and the denominator by the conjugate $\sqrt{x + 9} + 3$, which is positive. For $x \ne 0$ (and $x \ge -9$),

$$\begin{aligned} \frac{\sqrt{x + 9} - 3}{x} &= \frac{\big(\sqrt{x + 9} - 3\big)\big(\sqrt{x + 9} + 3\big)}{x\big(\sqrt{x + 9} + 3\big)} \\ &= \frac{(x + 9) - 9}{x\big(\sqrt{x + 9} + 3\big)} \\ &= \frac{1}{\sqrt{x + 9} + 3}. \end{aligned}$$

By the root law, $\sqrt{x + 9} \to \sqrt9 = 3$ as $x \to 0$; then the sum and quotient laws give

$$\lim_{x\to0}\frac{\sqrt{x + 9} - 3}{x} = \frac{1}{3 + 3} = \frac16.$$

```check
q7 = (sqrt(x + 9) - 3)/x
same(sqrt(9) - 3, 0)
steps(q7, (sqrt(x + 9) - 3)*(sqrt(x + 9) + 3)/(x*(sqrt(x + 9) + 3)), ((x + 9) - 9)/(x*(sqrt(x + 9) + 3)), 1/(sqrt(x + 9) + 3))
limit_is(sqrt(x + 9), x, 0, 3); limit_is(q7, x, 0, Rational(1, 6))
```
:::

### Combine fractions {#combine}

When the quotient contains fractions of its own, put them over a common denominator first.

::: example Combine fractions
Find

$$\lim_{x\to3}\frac{\dfrac1x - \dfrac13}{x - 3}.$$

Substitution gives $\big(\tfrac13 - \tfrac13\big)/0 = 0/0$. Over the common denominator $3x$, the numerator is

$$\frac1x - \frac13 = \frac{3 - x}{3x} = -\frac{x - 3}{3x}.$$

So, for $x \ne 3$ (and $x \ne 0$),

$$\frac{\dfrac1x - \dfrac13}{x - 3} = -\frac{x - 3}{3x(x - 3)} = -\frac{1}{3x},$$

and by Theorem 2.3 and direct substitution the limit is $-\dfrac{1}{3 \cdot 3} = -\dfrac19$. This is the rate of change of $1/x$ at $x = 3$. [Exercise 1.9](module_01_EN.html#ex-1-9) found that the difference quotients of $1/x$ at $a$ approach $-1/a^2$, and $-1/3^2 = -\tfrac19$.

```check
same(1/x - Rational(1, 3), (3 - x)/(3*x)); same((3 - x)/(3*x), -(x - 3)/(3*x))
same(cancel((1/x - Rational(1, 3))/(x - 3)), -1/(3*x))
limit_is((1/x - Rational(1, 3))/(x - 3), x, 3, -Rational(1, 9))
same(-1/Integer(3)**2, -Rational(1, 9))
```
:::

::: pitfall
Two slips with $0/0$. "Substitution gives $0/0$, so the limit is 0" (or 1, or "does not exist") is wrong: $0/0$ is a form, not a value, and the table at the start of this section shows four $0/0$ forms with four different outcomes. And cancel factors, never terms: in $\dfrac{x^2 - x - 6}{x^2 - 9}$ you may cancel the factor $x - 3$ once both are factored, but you may not cross out $x^2$ above and below to get $\dfrac{-x - 6}{-9}$, a different function (at $x = 1$ it gives $\tfrac79$, while the original gives $\tfrac34$).

```check
same(((x**2 - x - 6)/(x**2 - 9)).subs(x, 1), Rational(3, 4)); same(((-x - 6)/(-9)).subs(x, 1), Rational(7, 9))
```
:::

## The squeeze theorem {#squeeze}

Some limits are found by trapping. Multiply the oscillating $\sin(1/x)$ of Example 2.3 by $x$. Since $\abs{\sin(1/x)} \le 1$,

$$\abs{x\sin\frac1x} = \abs{x}\,\abs{\sin\frac1x} \le \abs{x}, \quad\text{that is,}$$

$$-\abs{x} \le x\sin\frac1x \le \abs{x} \qquad (x \ne 0).$$

The graph still oscillates infinitely often near 0, but between the lines $y = \abs{x}$ and $y = -\abs{x}$, which pinch together at the origin (Figure 2.3, left). The values have nowhere to go but 0.

::: figure id=fig-02-3
Two squeezes. Left: $x\sin(1/x)$ oscillates infinitely often near 0 but stays between $y = -\abs{x}$ and $y = \abs{x}$ (dashed), which meet at the origin, so its limit at 0 is 0 (Example 2.9). Right: for $0 < \abs{\theta} < \pi/2$, $\dfrac{\sin\theta}{\theta}$ lies between $\cos\theta$ and 1, and both of these approach 1 as $\theta \to 0$ (Theorem 2.5).
:::

::: theorem The squeeze theorem
Suppose that $g(x) \le f(x) \le h(x)$ for every $x \ne a$ in an open interval containing $a$, and that

$$\lim_{x\to a} g(x) = \lim_{x\to a} h(x) = L.$$

Then $\lim_{x\to a} f(x) = L$. The same holds for one-sided limits, with the inequalities on that side of $a$.
:::

The reason: close to $a$, the values $g(x)$ and $h(x)$ are both as close to $L$ as you like, and so is every number between them, $f(x)$ included. The Going deeper box of Section 2.7 writes this out with the precise definition. The theorem is also called the sandwich theorem.

::: example A squeezed oscillation
Show that $\lim_{x\to0} x\sin(1/x) = 0$.

The function is defined for every $x \ne 0$, and for those $x$, as shown above, $-\abs{x} \le x\sin(1/x) \le \abs{x}$. Both bounds approach 0. Indeed $\abs{x} = -x$ for $x < 0$ and $\abs{x} = x$ for $x > 0$, so both one-sided limits of $\abs{x}$ at 0 are 0, and $\lim_{x\to0}\abs{x} = 0$; then $\lim_{x\to0}\big(-\abs{x}\big) = 0$ by the constant multiple law. By the squeeze theorem, $\lim_{x\to0} x\sin(1/x) = 0$. The factor $x$ tames the oscillation of Example 2.3.

```check
for v in [Rational(1, j) for j in range(1, 40)] + [-Rational(1, j) for j in range(1, 40)] + [Rational(3, 1000), -Rational(2, 7)]:
    holds(-Abs(v) <= v*sin(1/v)); holds(v*sin(1/v) <= Abs(v))
limit_is(Abs(x), x, 0, 0, '-'); limit_is(Abs(x), x, 0, 0, '+'); limit_is(-Abs(x), x, 0, 0)
limit_is(x*sin(1/x), x, 0, 0)
```
:::

### Two trigonometric limits {#trig-limits}

The most important use of the squeeze theorem is the limit guessed in Example 2.1. It needs one inequality from the geometry of the unit circle. Let $0 < \theta < \pi/2$. In Figure 2.4, $O$ is the origin, $A = (1, 0)$, $P = (\cos\theta, \sin\theta)$ is the point of the unit circle at angle $\theta$, and $Q = (1, \tan\theta)$ is where the line $OP$ meets the vertical line $x = 1$. Three regions sit one inside the next: the triangle $OAP$, the sector $OAP$ (the slice of the disc between the radii $OA$ and $OP$) and the triangle $OAQ$. So their areas increase in that order. The triangle $OAP$ has base $OA = 1$ and height $\sin\theta$. The sector is the fraction $\theta/(2\pi)$ of the whole disc, whose area is $\pi$, so its area is $\theta/2$. The triangle $OAQ$ has base 1 and height $\tan\theta$. Therefore

$$\begin{aligned} \frac12\sin\theta &< \frac12\theta < \frac12\tan\theta, \quad\text{so} \\ \sin\theta &< \theta < \tan\theta \qquad \Big(0 < \theta < \frac{\pi}{2}\Big). \end{aligned}$$

::: figure id=fig-02-4
The areas behind Theorem 2.5, for an angle $\theta$ between 0 and $\pi/2$. The triangle $OAP$ (left) lies inside the sector $OAP$ (middle), which lies inside the triangle $OAQ$ (right), so $\tfrac12\sin\theta < \tfrac12\theta < \tfrac12\tan\theta$.
:::

```check
thp = symbols('theta', positive=True)
same(Rational(1, 2)*1*sin(thp), sin(thp)/2); same(thp/(2*pi)*pi*1**2, thp/2); same(Rational(1, 2)*1*tan(thp), tan(thp)/2)
same((sin(thp)/cos(thp)*x).subs(x, 1), tan(thp))          # the line OP, y = x tan(theta), meets x = 1 at height tan(theta)
for v in [Rational(j, 20) for j in range(1, 32)]:
    holds(sin(v) < v); holds(v < tan(v))
holds(Rational(31, 20) < pi/2)
```

::: example Sine and cosine near 0
Show that $\lim_{\theta\to0}\sin\theta = 0$ and $\lim_{\theta\to0}\cos\theta = 1$.

For $0 < \theta < \pi/2$ the inequality above gives $0 < \sin\theta < \theta$. Sine is odd, so for $-\pi/2 < \theta < 0$ this becomes $\theta < \sin\theta < 0$. In both cases

$$-\abs{\theta} \le \sin\theta \le \abs{\theta} \qquad \Big(0 < \abs{\theta} < \frac{\pi}{2}\Big),$$

and both bounds approach 0 (Example 2.9), so $\lim_{\theta\to0}\sin\theta = 0$ by the squeeze theorem.

For the cosine, use $\sin^2\theta + \cos^2\theta = 1$. For $0 < \abs{\theta} < \pi/2$ the point $P$ lies to the right of the $y$-axis, so $\cos\theta > 0$ and $1 + \cos\theta > 1$. Multiply and divide by $1 + \cos\theta$:

$$\begin{aligned} 1 - \cos\theta &= \frac{(1 - \cos\theta)(1 + \cos\theta)}{1 + \cos\theta} \\ &= \frac{\sin^2\theta}{1 + \cos\theta}. \end{aligned}$$

This lies between 0 and $\sin^2\theta$, because the denominator is greater than 1, and $\sin^2\theta \le \theta^2$ by the first part. So $0 \le 1 - \cos\theta \le \theta^2$. Since $\theta^2 \to 0$, the squeeze theorem gives $1 - \cos\theta \to 0$, and the difference law gives $\cos\theta = 1 - (1 - \cos\theta) \to 1 - 0 = 1$.

```check
thr = symbols('theta', real=True)
same(sin(-thr), -sin(thr))
steps(1 - cos(thr), (1 - cos(thr))*(1 + cos(thr))/(1 + cos(thr)), sin(thr)**2/(1 + cos(thr)))
for v in [Rational(j, 20) for j in range(-31, 32) if j != 0]:
    holds(-Abs(v) <= sin(v)); holds(sin(v) <= Abs(v)); holds(cos(v) > 0)
    holds(0 <= 1 - cos(v)); holds(1 - cos(v) <= sin(v)**2); holds(sin(v)**2 <= v**2)
limit_is(sin(theta), theta, 0, 0); limit_is(1 - cos(theta), theta, 0, 0); limit_is(cos(theta), theta, 0, 1)
```
:::

::: theorem The limit of sin θ/θ
With $\theta$ in radians,

$$\lim_{\theta\to0}\frac{\sin\theta}{\theta} = 1.$$
:::

::: proof
Let $0 < \theta < \pi/2$. Dividing $\sin\theta < \theta$ by $\theta > 0$ gives $\dfrac{\sin\theta}{\theta} < 1$. Multiplying $\theta < \tan\theta = \dfrac{\sin\theta}{\cos\theta}$ by $\dfrac{\cos\theta}{\theta} > 0$ gives $\cos\theta < \dfrac{\sin\theta}{\theta}$. So

$$\cos\theta < \frac{\sin\theta}{\theta} < 1.$$

Cosine is even ([Section 1.4](module_01_EN.html#trig)), and so is $\dfrac{\sin\theta}{\theta}$ (Example 2.1), so the same inequality holds for $-\pi/2 < \theta < 0$ (Figure 2.3, right). As $\theta \to 0$, $\cos\theta \to 1$ (Example 2.10), and the constant 1 stays at 1. By the squeeze theorem, $\dfrac{\sin\theta}{\theta} \to 1$.
:::

```check
same(cos(-theta), cos(theta)); same(sin(-theta)/(-theta), sin(theta)/theta)
same(thp/thp, 1); same(tan(thp)*cos(thp)/thp, sin(thp)/thp)
for v in [Rational(j, 20) for j in range(-31, 32) if j != 0]:
    holds(cos(v) < sin(v)/v); holds(sin(v)/v < 1)
limit_is(sin(theta)/theta, theta, 0, 1)
```

::: theorem The limit of (1 − cos θ)/θ
With $\theta$ in radians,

$$\lim_{\theta\to0}\frac{1 - \cos\theta}{\theta} = 0.$$
:::

::: proof
For $0 < \abs{\theta} < \pi/2$, $1 + \cos\theta > 0$. Multiply the numerator and the denominator by $1 + \cos\theta$, and use $1 - \cos^2\theta = \sin^2\theta$:

$$\begin{aligned} \frac{1 - \cos\theta}{\theta} &= \frac{1 - \cos^2\theta}{\theta(1 + \cos\theta)} \\ &= \frac{\sin\theta}{\theta}\cdot\frac{\sin\theta}{1 + \cos\theta}. \end{aligned}$$

As $\theta \to 0$, $\dfrac{\sin\theta}{\theta} \to 1$ (Theorem 2.5), $\sin\theta \to 0$ and $1 + \cos\theta \to 2$ (Example 2.10). By the product and quotient laws, the limit is $1 \cdot \dfrac02 = 0$.
:::

```check
steps((1 - cos(theta))/theta, (1 - cos(theta)**2)/(theta*(1 + cos(theta))), (sin(theta)/theta)*(sin(theta)/(1 + cos(theta))))
limit_is(1 + cos(theta), theta, 0, 2); limit_is(sin(theta)/(1 + cos(theta)), theta, 0, 0)
limit_is((1 - cos(theta))/theta, theta, 0, 0)
```

Theorem 2.5 says that $\sin\theta \approx \theta$ for small $\theta$, with an error that is small even compared with $\theta$ itself: at $\theta = 0.1$ the ratio $\sin\theta/\theta$ is about 0.99833. Physicists use this **small-angle approximation**, for instance for a pendulum that swings through small angles, and Module 5 uses Theorems 2.5 and 2.6 to find the rate of change of $\sin x$.

```check
rounds(sin(Rational(1, 10))/Rational(1, 10), '0.99833')
```

::: example Using the two limits
Find the limits as $x \to 0$ of (a) $\dfrac{\sin 3x}{x}$ and (b) $\dfrac{\tan x}{x}$.

**(a)** Theorem 2.5 needs the same angle above and below, so write $\dfrac{\sin 3x}{x} = 3\cdot\dfrac{\sin 3x}{3x}$ and put $\theta = 3x$. As $x \to 0$ with $x \ne 0$, $\theta \to 0$ with $\theta \ne 0$, so $\dfrac{\sin 3x}{3x} = \dfrac{\sin\theta}{\theta} \to 1$. (Precisely: a $\delta$ that wins for $\dfrac{\sin\theta}{\theta}$ gives the winning response $\delta/3$ for $\dfrac{\sin 3x}{3x}$.) By the constant multiple law,

$$\lim_{x\to0}\frac{\sin 3x}{x} = 3 \cdot 1 = 3.$$

**(b)** Write $\dfrac{\tan x}{x} = \dfrac{\sin x}{x}\cdot\dfrac{1}{\cos x}$. The first factor approaches 1 (Theorem 2.5) and $\cos x \to 1$ (Example 2.10), so by the product and quotient laws

$$\lim_{x\to0}\frac{\tan x}{x} = 1 \cdot \frac11 = 1.$$

```check
same(sin(3*x)/x, 3*sin(3*x)/(3*x)); limit_is(sin(3*x)/(3*x), x, 0, 1); limit_is(sin(3*x)/x, x, 0, 3)
same(tan(x)/x, (sin(x)/x)*(1/cos(x))); limit_is(tan(x)/x, x, 0, 1)
```
:::

::: pitfall
Theorem 2.5 needs radians. An angle of $x$ degrees is $\pi x/180$ radians, so in degrees the argument of Example 2.11 gives

$$\begin{aligned} \lim_{x\to0}\frac{\sin(x^\circ)}{x} &= \lim_{x\to0}\frac{\pi}{180}\cdot\frac{\sin(\pi x/180)}{\pi x/180} \\ &= \frac{\pi}{180} \approx 0.01745, \end{aligned}$$

not 1: one reason why calculus works in radians. And only $\sin\theta/\theta$, with the same $\theta$ above and below, approaches 1: $\dfrac{\sin 3x}{x}$ approaches 3.

```check
same(sin(pi*x/180)/x, pi/180*sin(pi*x/180)/(pi*x/180))
limit_is(sin(pi*x/180)/x, x, 0, pi/180); rounds(pi/180, '0.01745')
```
:::

## The precise definition {#precise}

Definition 2.1 rests on two phrases, "as close as you like" and "close enough". To prove that a limit is $L$, or that a function has no limit, you must say exactly what they mean. The answer is the foundation that Cauchy, in the 1820s, and Weierstrass, in the 1860s and 1870s, gave to calculus. It measures closeness by distances: $\abs{f(x) - L}$ is the distance between $f(x)$ and $L$, and $\abs{x - a}$ is the distance between $x$ and $a$ ([Section 1.3](module_01_EN.html#piecewise)). For a positive number $\delta$,

$$\abs{x - a} < \delta \quad\text{means}\quad a - \delta < x < a + \delta,$$

and $0 < \abs{x - a} < \delta$ says, in addition, that $x \ne a$. In the same way, $\abs{f(x) - L} < \varepsilon$ means $L - \varepsilon < f(x) < L + \varepsilon$. The Greek letters $\varepsilon$ ("epsilon") and $\delta$ ("delta") are the traditional names of these two distances.

```check
xr2, ar2 = symbols('x_r a_r', real=True); dl = symbols('delta', positive=True)
same(solveset(Abs(xr2 - ar2) < dl, xr2, S.Reals), Interval.open(ar2 - dl, ar2 + dl))
```

::: definition Limit, precisely
Let $f$ be defined on an open interval containing $a$, except possibly at $a$ itself. Then $\lim_{x\to a} f(x) = L$ means: for every number $\varepsilon > 0$ there is a number $\delta > 0$ such that, for every $x$ with $0 < \abs{x - a} < \delta$,

$$\abs{f(x) - L} < \varepsilon.$$
:::

Each phrase of Definition 2.1 has its precise counterpart:

| Definition 2.1 | Definition 2.3 |
|---|---|
| $f(x)$ as close to $L$ as you like | for every $\varepsilon > 0$, $\abs{f(x) - L} < \varepsilon$ |
| by taking $x$ close enough to $a$ | there is a $\delta > 0$ with $\abs{x - a} < \delta$ |
| but not equal to $a$ | $0 < \abs{x - a}$ |

One-sided limits are made precise in the same way: for $\lim_{x\to a^-} f(x) = L$, replace $0 < \abs{x - a} < \delta$ by $a - \delta < x < a$, and for $\lim_{x\to a^+} f(x) = L$ by $a < x < a + \delta$.

### Challenge and response {#game}

Read Definition 2.3 as a game for two players. The challenger names a tolerance $\varepsilon > 0$, as small as they like. You respond with a $\delta > 0$. You win the round if every $x$ with $0 < \abs{x - a} < \delta$ gives $\abs{f(x) - L} < \varepsilon$. On the graph (Figure 2.5): over the strip $a - \delta < x < a + \delta$, apart from $x = a$ itself, the graph must stay inside the band $L - \varepsilon < y < L + \varepsilon$.

- $\lim_{x\to a} f(x) = L$ means that you can win every round: whatever $\varepsilon$ the challenger names, you have a winning $\delta$.
- Your $\delta$ is chosen after $\varepsilon$, and may depend on it; usually a smaller $\varepsilon$ needs a smaller $\delta$.
- Once a $\delta$ wins, every smaller positive $\delta$ wins too, since it lets in fewer $x$.
- To show that $L$ is not the limit, the challenger needs one $\varepsilon$ that no $\delta$ can answer.

::: figure id=fig-02-5
The game for $y = x^2$ near $a = 3$, with $L = 9$ and the challenge $\varepsilon = 3$. The orange band is $L - \varepsilon < y < L + \varepsilon$; the green strip is $a - \delta < x < a + \delta$. Left: with $\delta = 0.4$ the graph over the strip stays in the band, so $\delta = 0.4$ wins. Right: with $\delta = 0.8$ the graph leaves the band near both edges of the strip (red), so $\delta = 0.8$ loses.
:::

```check
for v in [3 - Rational(2, 5) + Rational(j, 100)*Rational(4, 5) for j in range(1, 100)]:
    holds(Abs(v**2 - 9) < 3)                         # delta = 0.4: every x of the strip lands in the band
same(Rational(26, 10)**2, Rational(676, 100)); same(Rational(34, 10)**2, Rational(1156, 100))
holds(Rational(676, 100) > 6); holds(Rational(1156, 100) < 12)
holds(Abs(Rational(37, 10)**2 - 9) >= 3); holds(Abs(Rational(23, 10)**2 - 9) >= 3)   # delta = 0.8 lets in 2.3 and 3.7
```

::: analogy
A machine cuts square tiles that should have an area of 400 cm², and so a side of 20 cm. The customer's tolerance on the area is the challenge $\varepsilon$; the accuracy to which the side must be cut is the response $\delta$. A tighter tolerance needs a more accurate cut, but every tolerance can be met by a cut that is accurate enough: that is what $\lim_{s\to20} s^2 = 400$ means. Exercise 2.8 works out the accuracy needed for a tolerance of 1 cm².
:::

::: widget name=limit-explorer
Play the game. With $\dfrac{x^2 - 1}{x - 1}$ at $a = 1$, set $\varepsilon = 0.5$ and find the largest $\delta$ on the slider that wins; then make $\varepsilon$ smaller and find $\delta$ again. What is the pattern? Do the same for $\dfrac{\sin x}{x}$, where $\delta$ can be much larger than $\varepsilon$, and for $x\sin(1/x)$, where $\delta = \varepsilon$ always wins (Example 2.9 shows why). Zoom in to see the graph close to the point. Then choose $\abs{x}/x$ or $\sin(1/x)$, which have no limit at 0: try each candidate $L$, and check that once $\varepsilon \le 1$ no $\delta$ wins.
:::

### Proofs with ε and δ {#proofs}

A proof that $\lim_{x\to a} f(x) = L$ is a strategy for the game: a rule that turns any $\varepsilon$ into a winning $\delta$. You find it in two stages. In the **scratch work** you start from $\abs{f(x) - L} < \varepsilon$ and work backwards to a condition on $\abs{x - a}$. In the **proof** you run the argument forwards, from $0 < \abs{x - a} < \delta$ to $\abs{f(x) - L} < \varepsilon$.

::: example An ε–δ proof for a line
Prove that $\lim_{x\to2}(3x - 1) = 5$.

*Scratch work.* $\abs{(3x - 1) - 5} = \abs{3x - 6} = 3\abs{x - 2}$, and this is less than $\varepsilon$ exactly when $\abs{x - 2} < \varepsilon/3$. So try $\delta = \varepsilon/3$.

*Proof.* Let $\varepsilon > 0$, and choose $\delta = \varepsilon/3$. If $0 < \abs{x - 2} < \delta$, then

$$\abs{(3x - 1) - 5} = 3\abs{x - 2} < 3\delta = \varepsilon.$$

So every challenge is met, and $\lim_{x\to2}(3x - 1) = 5$. For example, the challenge $\varepsilon = 0.3$ is met by $\delta = 0.1$: if $x$ is within 0.1 of 2, then $3x - 1$ is within 0.3 of 5.

```check
xr = symbols('x', real=True); ep = symbols('epsilon', positive=True)
steps(Abs((3*xr - 1) - 5), Abs(3*xr - 6), 3*Abs(xr - 2))
same(solveset(3*Abs(xr - 2) < ep, xr, S.Reals), Interval.open(2 - ep/3, 2 + ep/3))
same(3*(ep/3), ep); same(Rational(3, 10)/3, Rational(1, 10))
```
:::

The same argument proves that $\lim_{x\to a}(mx + b) = ma + b$ for every line with slope $m \ne 0$: since $\abs{(mx + b) - (ma + b)} = \abs{m}\,\abs{x - a}$, the response $\delta = \varepsilon/\abs{m}$ wins. If $m = 0$, the function is the constant $b$, $\abs{f(x) - b} = 0 < \varepsilon$ for every $x$, and every $\delta$ wins. With $m = 0$ and $b = c$, and with $m = 1$ and $b = 0$, this proves the two basic limits of Section 2.4, $\lim_{x\to a} c = c$ and $\lim_{x\to a} x = a$.

```check
mr, br, ar = symbols('m b a', real=True); mnz = symbols('m', real=True, nonzero=True)
same(Abs((mr*xr + br) - (mr*ar + br)), Abs(mr)*Abs(xr - ar))
same(Abs(mnz)*(ep/Abs(mnz)), ep)
```

::: example An ε–δ proof for a parabola
Prove that $\lim_{x\to3} x^2 = 9$.

*Scratch work.* $\abs{x^2 - 9} = \abs{x - 3}\,\abs{x + 3}$. The factor $\abs{x - 3}$ can be made as small as you like; the factor $\abs{x + 3}$ is not constant, but it is not large when $x$ is near 3. So agree in advance to take $\delta \le 1$. Then $\abs{x - 3} < 1$ means $2 < x < 4$, so $5 < x + 3 < 7$ and $\abs{x + 3} < 7$. With that, $\abs{x^2 - 9} < 7\abs{x - 3}$, which is less than $\varepsilon$ when $\abs{x - 3} < \varepsilon/7$. Both requirements hold if $\delta$ is the smaller of 1 and $\varepsilon/7$, written $\delta = \min(1, \varepsilon/7)$.

*Proof.* Let $\varepsilon > 0$ and $\delta = \min(1, \varepsilon/7)$. Suppose that $0 < \abs{x - 3} < \delta$. Since $\delta \le 1$, $2 < x < 4$, and so $\abs{x + 3} < 7$. Since $\delta \le \varepsilon/7$, $\abs{x - 3} < \varepsilon/7$. Therefore

$$\abs{x^2 - 9} = \abs{x + 3}\,\abs{x - 3} < 7 \cdot \frac{\varepsilon}{7} = \varepsilon.$$

For the challenge $\varepsilon = 0.5$ the proof gives $\delta = \min(1, \tfrac{0.5}{7}) = \tfrac{1}{14} \approx 0.0714$. That is not the largest $\delta$ that wins: $x^2 < 9.5$ when $x < \sqrt{9.5} \approx 3.0822$, and $x^2 > 8.5$ when $x > \sqrt{8.5} \approx 2.9155$, so every $\delta$ up to $\sqrt{9.5} - 3 \approx 0.0822$ wins. A proof does not need the best $\delta$, only one that wins.

```check
same(expand((x - 3)*(x + 3)), x**2 - 9)
same(solveset(Abs(xr - 3) < 1, xr, S.Reals), Interval.open(2, 4))
same(Min(1, Rational(1, 2)/7), Rational(1, 14)); rounds(Rational(1, 14), '0.0714')
rounds(sqrt(Rational(19, 2)), '3.0822'); rounds(sqrt(Rational(17, 2)), '2.9155'); rounds(sqrt(Rational(19, 2)) - 3, '0.0822')
holds(sqrt(Rational(19, 2)) - 3 < 3 - sqrt(Rational(17, 2)))      # the right-hand side is the tighter one
holds(Rational(1, 14) < sqrt(Rational(19, 2)) - 3)
dd = symbols('d', positive=True)
same(expand((3 + dd)**2 - 9), 6*dd + dd**2); holds(6*Rational(1, 14) + Rational(1, 14)**2 < Rational(1, 2))
```
:::

### Proving that a limit does not exist {#no-limit-proof}

$\lim_{x\to a} f(x) = L$ is false when the challenger has a winning move: some $\varepsilon > 0$ such that, for every $\delta > 0$, some $x$ with $0 < \abs{x - a} < \delta$ has $\abs{f(x) - L} \ge \varepsilon$. To show that a limit does not exist, show this for every number $L$. The main tool is the **triangle inequality**:

$$\abs{p + q} \le \abs{p} + \abs{q},$$

for all real numbers $p$ and $q$. It holds because $-\abs{p} \le p \le \abs{p}$ and $-\abs{q} \le q \le \abs{q}$; adding gives $-\big(\abs{p} + \abs{q}\big) \le p + q \le \abs{p} + \abs{q}$, which says that $\abs{p + q} \le \abs{p} + \abs{q}$.

```check
pr_, qr_ = symbols('p q', real=True)
same((Abs(pr_) + Abs(qr_))**2 - (pr_ + qr_)**2, 2*(Abs(pr_*qr_) - pr_*qr_))
for p_, q_ in ((3, -5), (-2, -7), (4, 6), (0, -1), (Rational(1, 2), -Rational(3, 4))):
    holds(Abs(p_ + q_) <= Abs(p_) + Abs(q_)); holds(Abs(p_*q_) >= p_*q_)
```

::: example Proving that a limit does not exist
Prove that $\dfrac{\abs{x}}{x}$ has no limit at 0.

Let $L$ be any number. The challenger names $\varepsilon = 1$; let $\delta > 0$ be any response. The points $x = \delta/2$ and $x = -\delta/2$ both satisfy $0 < \abs{x} < \delta$, and $f(\delta/2) = 1$ while $f(-\delta/2) = -1$ (Example 2.2). If both values were within 1 of $L$, the triangle inequality would give

$$\begin{aligned} 2 &= \abs{1 - (-1)} = \abs{(1 - L) + (L + 1)} \\ &\le \abs{1 - L} + \abs{L + 1} < 1 + 1 = 2, \end{aligned}$$

which is impossible. So at least one of the two points lies outside the band $L - 1 < y < L + 1$, and $\delta$ loses. Since $\delta$ was any response and $L$ any number, no number is the limit of $\abs{x}/x$ at 0.

```check
Lsym = symbols('L', real=True)
same((1 - Lsym) + (Lsym + 1), 2); same(Abs(1 - (-1)), 2)
dp = symbols('delta', positive=True)
same(Abs(dp/2)/(dp/2), 1); same(Abs(-dp/2)/(-dp/2), -1); holds(dp/2 < dp)
```
:::

The same strategy, with the points of Example 2.3, proves that $\sin(1/x)$ has no limit at 0 (Exercise 2.10). The precise definitions also prove the key idea of Section 2.2:

::: theorem One-sided and two-sided limits
$\lim_{x\to a} f(x) = L$ exactly when $\lim_{x\to a^-} f(x) = L$ and $\lim_{x\to a^+} f(x) = L$.
:::

::: proof
Suppose that $\lim_{x\to a} f(x) = L$, and let $\varepsilon > 0$. A $\delta$ that wins for the two-sided limit wins for each one-sided limit, since $a - \delta < x < a$ and $a < x < a + \delta$ both imply $0 < \abs{x - a} < \delta$. Conversely, suppose that both one-sided limits are $L$, and let $\varepsilon > 0$. There is a $\delta_1 > 0$ that wins for the $x$ with $a - \delta_1 < x < a$, and a $\delta_2 > 0$ that wins for the $x$ with $a < x < a + \delta_2$. Let $\delta = \min(\delta_1, \delta_2)$. Every $x$ with $0 < \abs{x - a} < \delta$ satisfies $a - \delta_1 < x < a$ or $a < x < a + \delta_2$, so $\abs{f(x) - L} < \varepsilon$.
:::

::: pitfall
The order of the words matters. "For every $\varepsilon$ there is a $\delta$" lets $\delta$ depend on $\varepsilon$. "There is a $\delta$ that wins for every $\varepsilon$" says much more: then $\abs{f(x) - L}$ is less than every positive number, so $f(x) = L$ for every $x$ with $0 < \abs{x - a} < \delta$. And winning one round proves nothing: $\delta = 0.1$ answers $\varepsilon = 0.3$ for $3x - 1$ at 2, but a proof must answer every $\varepsilon$, as $\delta = \varepsilon/3$ does.
:::

::: deeper Proofs of the squeeze theorem and the limit laws
A first reading may skip this box. In each proof, $\varepsilon > 0$ is a challenge, and the task is to find a winning $\delta$.

**Squeeze theorem.** Suppose that $g(x) \le f(x) \le h(x)$ for $x \ne a$ in an open interval containing $a$, and that $g(x) \to L$ and $h(x) \to L$. Choose $\delta > 0$ so small that $(a - \delta, a + \delta)$ lies in that interval and that $\abs{g(x) - L} < \varepsilon$ and $\abs{h(x) - L} < \varepsilon$ for $0 < \abs{x - a} < \delta$ (the smallest of three $\delta$s will do). For such $x$,

$$L - \varepsilon < g(x) \le f(x) \le h(x) < L + \varepsilon,$$

so $\abs{f(x) - L} < \varepsilon$.

From here on, $\lim_{x\to a} f(x) = L$ and $\lim_{x\to a} g(x) = M$.

**Sum law.** Challenge $f$ with $\varepsilon/2$: there is a $\delta_1 > 0$ such that $\abs{f(x) - L} < \varepsilon/2$ whenever $0 < \abs{x - a} < \delta_1$. In the same way there is a $\delta_2 > 0$ for $g$. Let $\delta = \min(\delta_1, \delta_2)$. If $0 < \abs{x - a} < \delta$, both inequalities hold, and by the triangle inequality

$$\begin{aligned} &\abs{\big(f(x) + g(x)\big) - (L + M)} \\ &\quad\le \abs{f(x) - L} + \abs{g(x) - M} < \frac{\varepsilon}{2} + \frac{\varepsilon}{2} = \varepsilon. \end{aligned}$$

**Product law.** First, $g$ stays bounded near $a$: the challenge 1 gives a $\delta_0 > 0$ with $\abs{g(x) - M} < 1$, and so $\abs{g(x)} < \abs{M} + 1$, for $0 < \abs{x - a} < \delta_0$. Next,

$$\begin{aligned} &f(x)g(x) - LM \\ &\quad= \big(f(x) - L\big)g(x) + L\big(g(x) - M\big), \end{aligned}$$

so, by the triangle inequality, for those $x$

$$\begin{aligned} &\abs{f(x)g(x) - LM} \\ &\quad\le \abs{f(x) - L}\big(\abs{M} + 1\big) + \abs{L}\,\abs{g(x) - M}. \end{aligned}$$

Now choose $\delta \le \delta_0$ so small that $\abs{f(x) - L} < \dfrac{\varepsilon}{2(\abs{M} + 1)}$ and $\abs{g(x) - M} < \dfrac{\varepsilon}{2(\abs{L} + 1)}$ for $0 < \abs{x - a} < \delta$. Then

$$\begin{aligned} \abs{f(x)g(x) - LM} &< \frac{\varepsilon}{2} + \frac{\abs{L}}{\abs{L} + 1}\cdot\frac{\varepsilon}{2} \\ &< \frac{\varepsilon}{2} + \frac{\varepsilon}{2} = \varepsilon. \end{aligned}$$

**Quotient law.** Since $f/g = f \cdot (1/g)$, the product law reduces this to $\lim_{x\to a} 1/g(x) = 1/M$, for $M \ne 0$. The challenge $\abs{M}/2$ gives a $\delta_0 > 0$ with $\abs{g(x) - M} < \abs{M}/2$ for $0 < \abs{x - a} < \delta_0$. For those $x$, the triangle inequality $\abs{M} \le \abs{M - g(x)} + \abs{g(x)}$ gives $\abs{g(x)} > \abs{M}/2$; in particular $g(x) \ne 0$, so $1/g(x)$ is defined, and

$$\begin{aligned} \abs{\frac{1}{g(x)} - \frac1M} &= \frac{\abs{M - g(x)}}{\abs{g(x)}\,\abs{M}} \\ &< \frac{2}{\abs{M}^2}\,\abs{g(x) - M}. \end{aligned}$$

Choose $\delta \le \delta_0$ so small that $\abs{g(x) - M} < \tfrac12\varepsilon\abs{M}^2$ for $0 < \abs{x - a} < \delta$; then $\abs{1/g(x) - 1/M} < \varepsilon$.

```check
fS, gS, LS, MS = symbols('f g L M')
same(fS*gS - LS*MS, (fS - LS)*gS + LS*(gS - MS))
same(1/gS - 1/MS, (MS - gS)/(gS*MS))
same(ep/(2*(Abs(MS) + 1))*(Abs(MS) + 1), ep/2)
LN = symbols('L', nonnegative=True)
holds(ep/2 - LN/(LN + 1)*ep/2 > 0)
MP = symbols('M', positive=True)
same(2/MP**2*(ep*MP**2/2), ep); same(MP - MP/2, MP/2)
```
:::

## Limits on a computer {#computer}

### Cancellation {#cancellation}

At the end of Module 1, Python computed the falling ball's average speed over $[1, 1.001]$ as 9.804899999998895, where the exact value is 9.8049, and the series promised an explanation. A computer stores a real number in **floating point**: in binary, rounded to about 16 significant decimal digits. So almost every stored number is slightly wrong, typically in its 16th digit. That is harmless until two nearly equal numbers are subtracted. Here $s(1.001) = 4.9098049$ and $s(1) = 4.9$ agree in their first three digits; in the difference, 0.0098049, those digits cancel, and the rounding errors, which were in the 16th digit of $s(1.001)$, are now in the 13th digit of the result. Dividing by $h = 0.001$ does not repair them. This loss of accuracy when nearly equal numbers are subtracted is called **cancellation error**. The closer the two numbers, the more digits cancel: subtracting numbers that agree in their first $k$ digits loses about $k$ of the 16.

```check
same(Rational(49, 10)*Rational(1001, 1000)**2, Rational(49098049, 10**7))
same(Rational(49098049, 10**7) - Rational(49, 10), Rational(98049, 10**7)); same(Rational(98049, 10**7)/Rational(1, 1000), Rational(98049, 10**4))
s_ = lambda T: 4.9*T**2
holds((s_(1 + 1e-3) - s_(1))/1e-3 == 9.804899999998895)
holds(abs((s_(1 + 1e-3) - s_(1))/1e-3 - 9.8049) < 1e-11); holds(abs((s_(1 + 1e-3) - s_(1))/1e-3 - 9.8049) > 1e-13)
```

::: compute Cancellation in floating point
First the falling ball, with $h$ shrinking further than in Module 1:

```python
def s(t):
    return 4.9*t**2

for h in [1e-3, 1e-6, 1e-9, 1e-12, 1e-15]:
    print(h, (s(1 + h) - s(1))/h)
```

```output
0.001 9.804899999998895
1e-06 9.80000490002908
1e-09 9.800000810855636
1e-12 9.801048861390882
1e-15 10.658141036401503
```

The exact values are $9.8 + 4.9h$: 9.8049, 9.8000049, 9.8000000049, and so on. As $h$ shrinks, $s(1 + h)$ and $s(1)$ share more digits, more of them cancel, and the error grows, from about $10^{-12}$ at $h = 10^{-3}$ to about $10^{-3}$ at $h = 10^{-12}$; at $h = 10^{-15}$ the answer is 10.66 instead of 9.8. A smaller $h$ helps the formula but hurts the arithmetic, and Module 4 finds the best compromise.

Now $\dfrac{1 - \cos x}{x^2}$, whose limit at 0 is $\tfrac12$, as you will see below. The second column computes the same function from a rearranged formula:

```python
import math
for k in range(1, 10):
    x = 10.0**(-k)
    direct = (1 - math.cos(x))/x**2
    rearranged = (math.sin(x)/x)**2/(1 + math.cos(x))
    print(f"x = {x:.0e}:  {direct:.12f}  {rearranged:.12f}")
```

```output
x = 1e-01:  0.499583472197  0.499583472197
x = 1e-02:  0.499995833347  0.499995833347
x = 1e-03:  0.499999958326  0.499999958333
x = 1e-04:  0.499999996961  0.499999999583
x = 1e-05:  0.500000041370  0.499999999996
x = 1e-06:  0.500044450291  0.500000000000
x = 1e-07:  0.499600361081  0.500000000000
x = 1e-08:  0.000000000000  0.500000000000
x = 1e-09:  0.000000000000  0.500000000000
```

The two columns agree at $x = 0.1$ and $x = 0.01$. Then the direct formula drifts: at $x = 10^{-6}$ it is off by about $4 \times 10^{-5}$, and from $x = 10^{-8}$ on it gives 0, a completely wrong answer. The reason:

```python
print(math.cos(1e-8), math.cos(1e-8) == 1)
```

```output
1.0 True
```

$\cos(10^{-8}) = 1 - 5 \times 10^{-17} + \dots$ is closer to 1 than to any other floating-point number, so the computer stores exactly 1, and $1 - \cos x$ comes out as 0: every digit has cancelled. The rearranged formula comes from the proof of Theorem 2.6. Multiply the numerator and the denominator by $1 + \cos x$:

$$\begin{aligned} \frac{1 - \cos x}{x^2} &= \frac{1 - \cos^2 x}{x^2(1 + \cos x)} \\ &= \Big(\frac{\sin x}{x}\Big)^2\cdot\frac{1}{1 + \cos x} \qquad (x \ne 0). \end{aligned}$$

This formula subtracts nothing, and every digit that it prints above is correct. It also gives the limit: by Theorem 2.5 and Example 2.10, it approaches $1^2 \cdot \tfrac12 = \tfrac12$.
:::

```check
import math
err_ = lambda h_: abs((s_(1 + h_) - s_(1))/h_ - (9.8 + 4.9*h_))       # error of the computed average speed
holds(5e-13 < err_(1e-3) < 5e-12); holds(5e-4 < err_(1e-12) < 5e-3)     # "about 1e-12" and "about 1e-3"
rounds((s_(1 + 1e-15) - s_(1))/1e-15, '10.66')
steps((1 - cos(x))/x**2, (1 - cos(x)**2)/(x**2*(1 + cos(x))), (sin(x)/x)**2*(1/(1 + cos(x))))
limit_is((1 - cos(x))/x**2, x, 0, Rational(1, 2))
for j in range(1, 10):
    xf = 10.0**(-j); xq = Rational(1, 10**j)
    exact_ = (1 - cos(xq))/xq**2
    rounds(exact_, f"{(math.sin(xf)/xf)**2/(1 + math.cos(xf)):.12f}")        # every printed digit is right
    if j <= 2:
        holds(f"{(1 - math.cos(xf))/xf**2:.12f}" == f"{(math.sin(xf)/xf)**2/(1 + math.cos(xf)):.12f}")
rounds(((1 - math.cos(1e-6))/1e-6**2 - Rational(1, 2))*10**5, '4')
holds((1 - math.cos(1e-8))/1e-8**2 == 0.0); holds((1 - math.cos(1e-9))/1e-9**2 == 0.0)
same(series(cos(x), x, 0, 4).removeO(), 1 - x**2/2); same((x**2/2).subs(x, Rational(1, 10**8)), Rational(5, 10**17))
holds(Rational(5, 10**17) < Rational(1, 2**54))                  # less than half the gap 2^-53 below 1
```

Exercise 2.11 gives another formula that fools the computer, and its cure.

### Limits with SymPy {#sympy}

::: compute Limits with SymPy
SymPy computes limits exactly with `sp.limit(f, x, a)`:

```python
import sympy as sp
x = sp.symbols('x')
print(sp.limit((x**2 - 1)/(x - 1), x, 1))
print(sp.limit((sp.sqrt(x + 9) - 3)/x, x, 0))
print(sp.limit(sp.sin(x)/x, x, 0))
print(sp.limit((1 - sp.cos(x))/x**2, x, 0))
```

```output
2
1/6
1
1/2
```

These are the limits of Section 2.1, Example 2.7, Theorem 2.5 and the box above, and they are exact: `1/6`, not 0.1666…. A fourth argument chooses a side: `'-'` for the limit from the left and `'+'` for the limit from the right.

```python
f = sp.Abs(x)/x
print(sp.limit(f, x, 0, '-'), sp.limit(f, x, 0, '+'))
print(sp.limit(f, x, 0))
```

```output
-1 1
1
```

Look at the second line: without a fourth argument SymPy computes the limit from the right, and says nothing about the left. For the two-sided limit of Definition 2.1, write `'+-'`:

```python fails
print(sp.limit(f, x, 0, '+-'))
```

```output
ValueError: The limit does not exist since left hand limit = -1 and right hand limit = 1
```

SymPy explains why the limit does not exist. For the other two ways of failing, it describes what the values do:

```python
print(sp.limit(1/x**2, x, 0, '+-'))
print(sp.limit(sp.sin(1/x), x, 0, '+-'))
```

```output
oo
AccumBounds(-1, 1)
```

`oo`, two letters o, is SymPy's $\infty$ (`sp.oo` in a program): the values of $1/x^2$ grow beyond every bound, the blow-up that Module 3 writes as $\lim_{x\to0} 1/x^2 = \infty$. `AccumBounds(-1, 1)`, short for "accumulation bounds", says that the values of $\sin(1/x)$ keep returning to every number between $-1$ and 1, the oscillation of Example 2.3. Neither is a limit in the sense of Definition 2.1.
:::

```check
same(limit(Abs(x)/x, x, 0), 1); same(limit(Abs(x)/x, x, 0, '-'), -1)       # without a direction, SymPy goes from the right
same(limit(1/x**2, x, 0, '+-'), oo)
```

::: pitfall
`sp.limit(f, x, a)` on its own is a one-sided limit: without a fourth argument, SymPy goes from the right. So `sp.limit(sp.Abs(x)/x, x, 0)` gives 1, and `sp.limit(1/x, x, 0)` gives `oo`, although $1/x$ is hugely negative to the left of 0 and neither limit exists. Write `'+-'` whenever you mean the limit of Definition 2.1; for $1/x$, SymPy then answers `zoo`, its symbol for an infinite value without a definite sign.

```check
same(limit(Abs(x)/x, x, 0), 1); same(limit(1/x, x, 0), oo); same(limit(1/x, x, 0, '-'), -oo)
same(limit(1/x, x, 0, '+-'), zoo)
```
:::

## What you learned {#summary}

- $\lim_{x\to a} f(x) = L$ means that $f(x)$ can be made as close to $L$ as you like by taking $x$ close enough to $a$, but not equal to $a$. The value $f(a)$, if there is one, plays no part.
- Tables and graphs suggest limits but can mislead; algebra and proofs confirm them.
- One-sided limits, $x \to a^-$ and $x \to a^+$, look at one side only. The limit exists exactly when both one-sided limits exist and are equal.
- A limit can fail to exist through a jump, a blow-up or an oscillation.
- The limit laws give the limits of sums, differences, constant multiples, products, quotients (when the limit of the denominator is not 0), powers and roots. For polynomials, and for rational functions whose denominator is not 0 at $a$, the limit is the value: direct substitution.
- $0/0$ is an indeterminate form, a signal to do more work: factor and cancel, rationalise with the conjugate, or combine fractions, then substitute.
- The squeeze theorem traps a function between two functions with the same limit. With areas in the unit circle it proves $\lim_{\theta\to0}\dfrac{\sin\theta}{\theta} = 1$ and $\lim_{\theta\to0}\dfrac{1 - \cos\theta}{\theta} = 0$, with $\theta$ in radians.
- Precisely, $\lim_{x\to a} f(x) = L$ means that for every $\varepsilon > 0$ there is a $\delta > 0$ such that $0 < \abs{x - a} < \delta$ implies $\abs{f(x) - L} < \varepsilon$. A proof is a rule that turns any $\varepsilon$ into a winning $\delta$; to disprove a limit, find one $\varepsilon$ that no $\delta$ answers.
- Floating-point numbers keep about 16 significant digits, and subtracting nearly equal numbers loses them: cancellation error. Rearranging the formula can avoid it. SymPy's `sp.limit` computes limits exactly; it goes from the right unless you give `'+-'`.

## Exercises {#exercises}

:::: exercise Reading a piecewise function {#ex-2-1} ★
Let

$$f(x) = \begin{cases} 2x + 1 & \text{if } x < 1, \\ 5 & \text{if } x = 1, \\ 4 - x^2 & \text{if } x > 1. \end{cases}$$

- (a) Find $\lim_{x\to1^-} f(x)$ and $\lim_{x\to1^+} f(x)$. Does $\lim_{x\to1} f(x)$ exist?
- (b) Is the limit at 1 equal to $f(1)$? Describe the graph near $x = 1$.
- (c) Find $\lim_{x\to-2} f(x)$ and $\lim_{x\to2} f(x)$.

::: solution
**(a)** To the left of 1, $f(x) = 2x + 1$, which approaches $2 \cdot 1 + 1 = 3$ (Theorem 2.3 for one side, and direct substitution in the linear formula). To the right, $f(x) = 4 - x^2$, which approaches $4 - 1 = 3$. Both one-sided limits are 3, so $\lim_{x\to1} f(x) = 3$.

**(b)** No: $f(1) = 5$, while the limit is 3. The graph is the line $y = 2x + 1$ on the left and the parabola $y = 4 - x^2$ on the right. They meet at $(1, 3)$, which is not on the graph (a hollow dot), and the graph has a single filled dot at $(1, 5)$, above the hole. The limit ignores that dot.

**(c)** On the open interval $(-\infty, 1)$, which contains $-2$, $f(x) = 2x + 1$; so by Theorem 2.3 and direct substitution, $\lim_{x\to-2} f(x) = 2(-2) + 1 = -3$. On $(1, \infty)$, which contains 2, $f(x) = 4 - x^2$, so $\lim_{x\to2} f(x) = 4 - 4 = 0$.

```check
f1e = Piecewise((2*x + 1, x < 1), (5, Eq(x, 1)), (4 - x**2, True))
same(f1e.subs(x, 1 - hp), 2*(1 - hp) + 1); same(f1e.subs(x, 1 + hp), 4 - (1 + hp)**2)
limit_is(2*(1 - hp) + 1, hp, 0, 3, '+'); limit_is(4 - (1 + hp)**2, hp, 0, 3, '+')
same(f1e.subs(x, 1), 5)
same(f1e.subs(x, -2), -3); limit_is(2*x + 1, x, -2, -3)
same(f1e.subs(x, 2), 0); limit_is(4 - x**2, x, 2, 0)
```
:::
::::

:::: exercise The limit laws in action {#ex-2-2} ★
Suppose that $\lim_{x\to a} f(x) = 4$ and $\lim_{x\to a} g(x) = -2$. Find each limit, naming the laws you use, or explain why the laws do not give it.

- (a) $\lim_{x\to a}\big(3f(x) - g(x)\big)$
- (b) $\lim_{x\to a} f(x)\big(g(x)\big)^2$
- (c) $\lim_{x\to a}\dfrac{\sqrt{f(x)}}{g(x)}$
- (d) $\lim_{x\to a}\dfrac{f(x)}{f(x) + 2g(x)}$

::: solution
**(a)** By the difference and constant multiple laws, the limit is $3 \cdot 4 - (-2) = 14$.

**(b)** By the power law, $\big(g(x)\big)^2 \to (-2)^2 = 4$; then by the product law the limit is $4 \cdot 4 = 16$.

**(c)** By the root law (the limit of $f$ is $4 > 0$), $\sqrt{f(x)} \to \sqrt4 = 2$. The limit of the denominator is $-2$, not 0, so by the quotient law the limit is $2/(-2) = -1$.

**(d)** The denominator approaches $4 + 2(-2) = 0$, so the quotient law does not apply. In fact this limit does not exist. Call the quotient $q(x)$. If $q(x)$ had a limit $K$, the product law would give $f(x) = q(x)\big(f(x) + 2g(x)\big) \to K \cdot 0 = 0$; but $f(x) \to 4$. For example, $f(x) = 4 + x$ and $g(x) = -2 + x$ at $a = 0$ give $q(x) = \dfrac{4 + x}{3x}$, which blows up at 0.

```check
same(3*4 - (-2), 14); same(4*(-2)**2, 16); same(sqrt(4)/(-2), -1); same(4 + 2*(-2), 0)
fx2, gx2 = 4 + x, -2 + x
limit_is(fx2, x, 0, 4); limit_is(gx2, x, 0, -2)
limit_is(3*fx2 - gx2, x, 0, 14); limit_is(fx2*gx2**2, x, 0, 16); limit_is(sqrt(fx2)/gx2, x, 0, -1)
same(fx2 + 2*gx2, 3*x); same(fx2/(fx2 + 2*gx2), (4 + x)/(3*x))
limit_is(fx2/(fx2 + 2*gx2), x, 0, -oo, '-'); limit_is(fx2/(fx2 + 2*gx2), x, 0, oo, '+')
```
:::
::::

:::: exercise Does the limit exist? {#ex-2-3} ★
Find each limit, or explain why it does not exist.

- (a) $\lim_{x\to2}\dfrac{x^2 + x - 6}{x - 2}$
- (b) $\lim_{x\to0}\dfrac1x$
- (c) $\lim_{x\to0}\cos\dfrac1x$
- (d) $\lim_{x\to0} x^2\cos\dfrac1x$

::: solution
**(a)** Substitution gives $0/0$. Factor: $x^2 + x - 6 = (x - 2)(x + 3)$, so for $x \ne 2$ the quotient is $x + 3$, and the limit is $2 + 3 = 5$.

**(b)** It does not exist: a blow-up. Near 0, $1/x$ is huge, positive to the right of 0 ($1/0.001 = 1000$) and negative to the left ($1/(-0.001) = -1000$), so its values stay close to no number.

**(c)** It does not exist: an oscillation. $\cos(1/x) = 1$ at $x = 1/(2k\pi)$ and $\cos(1/x) = -1$ at $x = 1/\big((2k + 1)\pi\big)$, for $k = 1, 2, 3, \dots$, and these points come as close to 0 as you like. As in Example 2.3, the values 1 and $-1$, which are 2 apart, cannot both stay within $\tfrac12$ of one number.

**(d)** It is 0, by the squeeze theorem: $\abs{\cos(1/x)} \le 1$, so $-x^2 \le x^2\cos(1/x) \le x^2$ for $x \ne 0$, and both bounds approach 0.

```check
same(factor(x**2 + x - 6), (x - 2)*(x + 3)); same(cancel((x**2 + x - 6)/(x - 2)), x + 3)
limit_is((x**2 + x - 6)/(x - 2), x, 2, 5)
same(1/Rational(1, 1000), 1000); same(1/Rational(-1, 1000), -1000)
limit_is(1/x, x, 0, oo, '+'); limit_is(1/x, x, 0, -oo, '-')
kp = symbols('k', integer=True, positive=True)
same(cos(1/(1/(2*kp*pi))), 1); same(cos(1/(1/((2*kp + 1)*pi))), -1)
same(limit(cos(1/x), x, 0, '+-'), AccumBounds(-1, 1))
limit_is(x**2, x, 0, 0); limit_is(-x**2, x, 0, 0); limit_is(x**2*cos(1/x), x, 0, 0)
```
:::
::::

:::: exercise Three algebraic techniques {#ex-2-4} ★★
Find each limit, showing the algebra.

- (a) $\lim_{x\to-2}\dfrac{x^2 + 5x + 6}{x^2 - 4}$
- (b) $\lim_{x\to9}\dfrac{x - 9}{\sqrt x - 3}$
- (c) $\lim_{h\to0}\dfrac{1}{h}\Big(\dfrac{1}{(1 + h)^2} - 1\Big)$

::: solution
**(a)** At $x = -2$ the numerator is $4 - 10 + 6 = 0$ and the denominator is $4 - 4 = 0$. Factor: $x^2 + 5x + 6 = (x + 2)(x + 3)$ and $x^2 - 4 = (x + 2)(x - 2)$. For $x \ne -2$ (and $x \ne 2$),

$$\frac{x^2 + 5x + 6}{x^2 - 4} = \frac{x + 3}{x - 2} \to \frac{-2 + 3}{-2 - 2} = -\frac14.$$

**(b)** Substitution gives $0/0$. Multiply the numerator and the denominator by the conjugate $\sqrt x + 3$, or notice that for $x \ge 0$, $x - 9 = \big(\sqrt x - 3\big)\big(\sqrt x + 3\big)$. Either way, for $x \ge 0$ with $x \ne 9$,

$$\frac{x - 9}{\sqrt x - 3} = \sqrt x + 3 \to \sqrt9 + 3 = 6$$

by the root and sum laws.

**(c)** Substitution gives $0/0$. Put the bracket over the common denominator $(1 + h)^2$ and expand:

$$\begin{aligned} \frac{1}{(1 + h)^2} - 1 &= \frac{1 - (1 + h)^2}{(1 + h)^2} \\ &= \frac{-2h - h^2}{(1 + h)^2} = \frac{-h(2 + h)}{(1 + h)^2}. \end{aligned}$$

So, for $h \ne 0$ (and $h \ne -1$),

$$\begin{aligned} \frac{1}{h}\Big(\frac{1}{(1 + h)^2} - 1\Big) &= -\frac{2 + h}{(1 + h)^2} \\ &\to -\frac{2}{1} = -2. \end{aligned}$$

This is the rate of change of $1/x^2$ at $x = 1$.

```check
same((x**2 + 5*x + 6).subs(x, -2), 0); same((x**2 - 4).subs(x, -2), 0)
same(factor(x**2 + 5*x + 6), (x + 2)*(x + 3)); same(factor(x**2 - 4), (x + 2)*(x - 2))
same(cancel((x**2 + 5*x + 6)/(x**2 - 4)), (x + 3)/(x - 2)); limit_is((x**2 + 5*x + 6)/(x**2 - 4), x, -2, -Rational(1, 4))
xnn = symbols('x', nonnegative=True)
same(expand((sqrt(xnn) - 3)*(sqrt(xnn) + 3)), xnn - 9); same(sqrt(9) + 3, 6)
limit_is((x - 9)/(sqrt(x) - 3), x, 9, 6)
steps(1/(1 + h)**2 - 1, (1 - (1 + h)**2)/(1 + h)**2, (-2*h - h**2)/(1 + h)**2, -h*(2 + h)/(1 + h)**2)
same(cancel((1/(1 + h)**2 - 1)/h), -(2 + h)/(1 + h)**2)
limit_is((1/(1 + h)**2 - 1)/h, h, 0, -2)
```
:::
::::

:::: exercise Trigonometric limits {#ex-2-5} ★★
With $x$ in radians, find

- (a) $\lim_{x\to0}\dfrac{\sin 5x}{2x}$
- (b) $\lim_{x\to0}\dfrac{\sin 3x}{\sin 2x}$
- (c) $\lim_{x\to0}\dfrac{1 - \cos x}{x\sin x}$

::: solution
**(a)** Make the angle appear below: $\dfrac{\sin 5x}{2x} = \dfrac52\cdot\dfrac{\sin 5x}{5x}$. As in Example 2.11, $\dfrac{\sin 5x}{5x} \to 1$, so the limit is $\dfrac52$.

**(b)** Divide the numerator and the denominator by $x$, and arrange both as in (a):

$$\begin{aligned} \frac{\sin 3x}{\sin 2x} &= \frac{\dfrac{\sin 3x}{x}}{\dfrac{\sin 2x}{x}} = \frac{3\cdot\dfrac{\sin 3x}{3x}}{2\cdot\dfrac{\sin 2x}{2x}} \\ &\to \frac{3 \cdot 1}{2 \cdot 1} = \frac32, \end{aligned}$$

by the quotient law, since the limit of the denominator, 2, is not 0. A common wrong answer is 1, from the idea that a quotient of two quantities that both approach 0 approaches 1: that is the $0/0$ slip of Section 2.5.

**(c)** Multiply the numerator and the denominator by $1 + \cos x$, as in the proof of Theorem 2.6. For $0 < \abs{x} < \pi/2$, where $\sin x \ne 0$ and $1 + \cos x > 0$,

$$\begin{aligned} \frac{1 - \cos x}{x\sin x} &= \frac{\sin^2 x}{x\sin x\,(1 + \cos x)} \\ &= \frac{\sin x}{x}\cdot\frac{1}{1 + \cos x} \to 1 \cdot \frac12 = \frac12. \end{aligned}$$

```check
same(sin(5*x)/(2*x), Rational(5, 2)*sin(5*x)/(5*x)); limit_is(sin(5*x)/(2*x), x, 0, Rational(5, 2))
same((sin(3*x)/x)/(sin(2*x)/x), sin(3*x)/sin(2*x))
same((3*sin(3*x)/(3*x))/(2*sin(2*x)/(2*x)), sin(3*x)/sin(2*x)); limit_is(sin(3*x)/sin(2*x), x, 0, Rational(3, 2))
steps((1 - cos(x))/(x*sin(x)), sin(x)**2/(x*sin(x)*(1 + cos(x))), (sin(x)/x)*(1/(1 + cos(x))))
limit_is((1 - cos(x))/(x*sin(x)), x, 0, Rational(1, 2))
```
:::
::::

:::: exercise Choosing a constant {#ex-2-6} ★★
Let

$$f(x) = \begin{cases} x^2 + c & \text{if } x < 2, \\ 3x - 1 & \text{if } x \ge 2, \end{cases}$$

where $c$ is a constant.

- (a) Find the one-sided limits of $f$ at 2, in terms of $c$.
- (b) For which value of $c$ does $\lim_{x\to2} f(x)$ exist? What is the limit then?
- (c) Describe the graph near $x = 2$ when $c = 3$.

::: solution
**(a)** From the left, $f(x) = x^2 + c \to 4 + c$; from the right, $f(x) = 3x - 1 \to 5$ (direct substitution in each formula).

**(b)** The limit exists exactly when the one-sided limits are equal: $4 + c = 5$, so $c = 1$. Then $\lim_{x\to2} f(x) = 5$, which is also $f(2)$: the two pieces join without a gap.

**(c)** With $c = 3$ the limit from the left is 7 and the limit from the right is 5. The graph jumps down by 2 at $x = 2$: the parabola ends at a hollow dot at $(2, 7)$, and the line starts at the filled dot $(2, 5)$.

```check
f6x = Piecewise((x**2 + c, x < 2), (3*x - 1, True))
same(f6x.subs(x, 2 - hp), (2 - hp)**2 + c); same(f6x.subs(x, 2 + hp), 3*(2 + hp) - 1)
limit_is((2 - hp)**2 + c, hp, 0, 4 + c, '+'); limit_is(3*(2 + hp) - 1, hp, 0, 5, '+')
same(solve(Eq(4 + c, 5), c), [1]); same(f6x.subs(x, 2), 5)
same((4 + c).subs(c, 3), 7); same(7 - 5, 2)
```
:::
::::

:::: exercise An ε–δ proof for a line {#ex-2-7} ★★
- (a) Prove from Definition 2.3 that $\lim_{x\to-1}(5 - 2x) = 7$.
- (b) Which $\delta$ does your proof give for $\varepsilon = 0.01$? Does any larger $\delta$ also win?

::: solution
**(a)** *Scratch work.* $\abs{(5 - 2x) - 7} = \abs{-2x - 2} = 2\abs{x + 1}$, which is less than $\varepsilon$ exactly when $\abs{x + 1} < \varepsilon/2$.

*Proof.* Let $\varepsilon > 0$ and $\delta = \varepsilon/2$. If $0 < \abs{x - (-1)} < \delta$, that is, $0 < \abs{x + 1} < \delta$, then

$$\abs{(5 - 2x) - 7} = 2\abs{x + 1} < 2\delta = \varepsilon.$$

**(b)** $\delta = 0.01/2 = 0.005$. No larger $\delta$ wins: if $\delta > 0.005$, the point $x = -1.005$ satisfies $0 < \abs{x + 1} = 0.005 < \delta$, but $\abs{(5 - 2x) - 7} = \abs{7.01 - 7} = 0.01$, which is not less than $\varepsilon$. For a line, the "exactly when" of the scratch work makes the proof's $\delta$ the best possible; for the parabola of Example 2.13 it was not.

```check
steps(Abs((5 - 2*xr) - 7), Abs(-2*xr - 2), 2*Abs(xr + 1))
same(solveset(2*Abs(xr + 1) < ep, xr, S.Reals), Interval.open(-1 - ep/2, -1 + ep/2))
same(Rational(1, 100)/2, Rational(5, 1000))
x7 = -Rational(1005, 1000)
same(Abs(x7 + 1), Rational(5, 1000)); same(5 - 2*x7, Rational(701, 100)); same(Abs((5 - 2*x7) - 7), Rational(1, 100))
holds(Abs((5 - 2*x7) - 7) >= Rational(1, 100))
```
:::
::::

:::: exercise How accurately must a tile be cut? {#ex-2-8} ★★
A square tile should have an area of 400 cm², and the customer accepts any area between 399 and 401 cm². In the language of Section 2.7, this is the challenge $\varepsilon = 1$ for $\lim_{s\to20} s^2 = 400$, where $s$ is the side in centimetres.

- (a) Use the method of Example 2.13, agreeing first on $\delta \le 1$, to find a $\delta$ such that $\abs{s - 20} < \delta$ guarantees the tolerance.
- (b) Find the largest such $\delta$, to three significant figures, and say what it means in millimetres.

::: solution
**(a)** $\abs{s^2 - 400} = \abs{s - 20}\,\abs{s + 20}$. If $\abs{s - 20} < 1$, then $19 < s < 21$, so $39 < s + 20 < 41$ and $\abs{s + 20} < 41$. Then $\abs{s^2 - 400} < 41\abs{s - 20}$, which is less than 1 when $\abs{s - 20} < \tfrac{1}{41}$. So $\delta = \min\big(1, \tfrac{1}{41}\big) = \tfrac{1}{41} \approx 0.0244$ cm works.

**(b)** For $s > 0$, the tolerance $399 < s^2 < 401$ holds exactly when $\sqrt{399} < s < \sqrt{401}$, that is, approximately $19.97498 < s < 20.02498$. The interval around 20 must fit on both sides, and the two sides are not equal: $20 - \sqrt{399} \approx 0.025016$ and $\sqrt{401} - 20 \approx 0.024984$. The largest $\delta$ is the smaller, $\sqrt{401} - 20 \approx 0.0250$ cm: the side must be cut to within about a quarter of a millimetre. The proof's $\delta$ in (a) is a little smaller, as Example 2.13 led you to expect.

```check
sp_ = symbols('s', positive=True)
same(expand((sp_ - 20)*(sp_ + 20)), sp_**2 - 400)
same(solveset(Abs(xr - 20) < 1, xr, S.Reals), Interval.open(19, 21))
same(Min(1, Rational(1, 41)), Rational(1, 41)); rounds(Rational(1, 41), '0.0244')
same(Intersection(solveset(sp_**2 > 399, sp_, Interval.open(0, oo)), solveset(sp_**2 < 401, sp_, Interval.open(0, oo))), Interval.open(sqrt(399), sqrt(401)))
rounds(sqrt(399), '19.97498'); rounds(sqrt(401), '20.02498')
rounds(20 - sqrt(399), '0.025016'); rounds(sqrt(401) - 20, '0.024984'); rounds(sqrt(401) - 20, '0.0250')
holds(sqrt(401) - 20 < 20 - sqrt(399)); holds(Rational(1, 41) < sqrt(401) - 20)
rounds((sqrt(401) - 20)*10, '0.25')                       # in millimetres
```
:::
::::

:::: exercise The root law for square roots {#ex-2-9} ★★★
Suppose that $\lim_{x\to a} f(x) = L$, with $L > 0$.

- (a) Show that there is a $\delta_0 > 0$ such that $f(x) > L/2$ whenever $0 < \abs{x - a} < \delta_0$. (So $\sqrt{f(x)}$ is defined for those $x$.)
- (b) Show that, for those $x$, $\big\lvert\sqrt{f(x)} - \sqrt{L}\big\rvert \le \dfrac{\abs{f(x) - L}}{\sqrt L}$. (Rationalise.)
- (c) Prove that $\lim_{x\to a}\sqrt{f(x)} = \sqrt L$. Deduce that $\lim_{x\to a}\sqrt x = \sqrt a$ for every $a > 0$.

::: solution
**(a)** Use the challenge $\varepsilon = L/2$ in Definition 2.3: there is a $\delta_0 > 0$ such that $\abs{f(x) - L} < L/2$ whenever $0 < \abs{x - a} < \delta_0$. Then $f(x) > L - L/2 = L/2 > 0$.

**(b)** For such $x$, both $\sqrt{f(x)}$ and $\sqrt L$ are defined, and their sum is at least $\sqrt L > 0$. Multiply and divide by the conjugate $\sqrt{f(x)} + \sqrt L$; since $\big(\sqrt{f(x)} - \sqrt L\big)\big(\sqrt{f(x)} + \sqrt L\big) = f(x) - L$,

$$\sqrt{f(x)} - \sqrt L = \frac{f(x) - L}{\sqrt{f(x)} + \sqrt L}.$$

Take absolute values, and use $\sqrt{f(x)} + \sqrt L \ge \sqrt L$:

$$\begin{aligned} \big\lvert\sqrt{f(x)} - \sqrt L\big\rvert &= \frac{\abs{f(x) - L}}{\sqrt{f(x)} + \sqrt L} \\ &\le \frac{\abs{f(x) - L}}{\sqrt L}. \end{aligned}$$

**(c)** Let $\varepsilon > 0$. Challenge $f$ with $\varepsilon\sqrt L$: there is a $\delta_1 > 0$ with $\abs{f(x) - L} < \varepsilon\sqrt L$ whenever $0 < \abs{x - a} < \delta_1$. Let $\delta = \min(\delta_0, \delta_1)$. If $0 < \abs{x - a} < \delta$, then by (b)

$$\big\lvert\sqrt{f(x)} - \sqrt L\big\rvert \le \frac{\abs{f(x) - L}}{\sqrt L} < \frac{\varepsilon\sqrt L}{\sqrt L} = \varepsilon.$$

So $\lim_{x\to a}\sqrt{f(x)} = \sqrt L$. For $f(x) = x$, whose limit at $a$ is $a$ (Section 2.7), this gives $\lim_{x\to a}\sqrt x = \sqrt a$ for every $a > 0$.

```check
Fp, Lp = symbols('F L', positive=True)
same(Lp - Lp/2, Lp/2)
steps(sqrt(Fp) - sqrt(Lp), (sqrt(Fp) - sqrt(Lp))*(sqrt(Fp) + sqrt(Lp))/(sqrt(Fp) + sqrt(Lp)), (Fp - Lp)/(sqrt(Fp) + sqrt(Lp)))
holds(sqrt(Fp) + sqrt(Lp) >= sqrt(Lp))
same(ep*sqrt(Lp)/sqrt(Lp), ep)
ap_ = symbols('a', positive=True)
limit_is(sqrt(x), x, ap_, sqrt(ap_))
```
:::
::::

:::: exercise No limit for sin(1/x) {#ex-2-10} ★★★
Prove from Definition 2.3 that $\lim_{x\to0}\sin(1/x)$ does not exist. (Use the points of Example 2.3 and the strategy of Example 2.14.)

::: solution
Let $L$ be any number; the challenge $\varepsilon = 1$ will defeat it. Let $\delta > 0$ be any response, and choose a whole number $k \ge 1$ with $k \ge 1/\delta$. The points

$$x_1 = \frac{2}{(4k + 1)\pi} \quad\text{and}\quad x_2 = \frac{2}{(4k + 3)\pi}$$

are positive, and

$$x_2 < x_1 < \frac{2}{4k\pi} = \frac{1}{2k\pi} \le \frac{\delta}{2\pi} < \delta,$$

so both satisfy $0 < \abs{x} < \delta$. At these points $\sin(1/x_1) = \sin\dfrac{(4k + 1)\pi}{2} = 1$ and $\sin(1/x_2) = \sin\dfrac{(4k + 3)\pi}{2} = -1$. If both values were within 1 of $L$, the triangle inequality would give

$$\begin{aligned} 2 &= \abs{(1 - L) + (L + 1)} \\ &\le \abs{1 - L} + \abs{L + 1} < 1 + 1 = 2, \end{aligned}$$

which is impossible. So at least one of $x_1$ and $x_2$ gives $\abs{\sin(1/x) - L} \ge 1$, and $\delta$ loses. Since $\delta$ and $L$ were arbitrary, $\sin(1/x)$ has no limit at 0.

```check
kq = symbols('k', integer=True, positive=True)
same(sin(1/(2/((4*kq + 1)*pi))), 1); same(sin(1/(2/((4*kq + 3)*pi))), -1)
same(2/(4*kq*pi), 1/(2*kq*pi)); holds(1/(2*pi) < 1)
for kv in range(1, 30):
    holds(2/((4*kv + 3)*pi) < 2/((4*kv + 1)*pi)); holds(2/((4*kv + 1)*pi) < 2/(4*kv*pi))
same((1 - Lsym) + (Lsym + 1), 2)
```
:::
::::

:::: exercise A formula that fools the computer {#ex-2-11} ★★★
Let $f(x) = \dfrac{\sqrt{x^2 + 1} - 1}{x^2}$ for $x \ne 0$.

- (a) Find $\lim_{x\to0} f(x)$ by rationalising.
- (b) In Python, `(math.sqrt(x**2 + 1) - 1)/x**2` gives `0.0` for `x = 1e-8`. Explain why.
- (c) Find a formula for $f(x)$ that a computer evaluates accurately for small $x$, and compare the two formulas in Python.

::: solution
**(a)** Multiply the numerator and the denominator by the conjugate $\sqrt{x^2 + 1} + 1$:

$$\begin{aligned} f(x) &= \frac{(x^2 + 1) - 1}{x^2\big(\sqrt{x^2 + 1} + 1\big)} \\ &= \frac{1}{\sqrt{x^2 + 1} + 1} \qquad (x \ne 0). \end{aligned}$$

By the root law, $\sqrt{x^2 + 1} \to 1$, so $f(x) \to \dfrac{1}{1 + 1} = \dfrac12$.

**(b)** For $x = 10^{-8}$, $x^2 + 1 = 1 + 10^{-16}$. The next floating-point number after 1 is about $1 + 2.2 \times 10^{-16}$, so $1 + 10^{-16}$, which is nearer to 1, is stored as exactly 1. Then $\sqrt1 - 1 = 0$: every digit has cancelled, and the quotient is $0/10^{-16} = 0$.

**(c)** The rationalised formula of (a), $\dfrac{1}{\sqrt{x^2 + 1} + 1}$, adds instead of subtracting, so nothing cancels:

```python
import math
for x in [1e-2, 1e-4, 1e-6, 1e-7, 1e-8]:
    direct = (math.sqrt(x**2 + 1) - 1)/x**2
    rationalised = 1/(math.sqrt(x**2 + 1) + 1)
    print(f"x = {x:.0e}:  {direct:.12f}  {rationalised:.12f}")
```

```output
x = 1e-02:  0.499987500624  0.499987500625
x = 1e-04:  0.499999996961  0.499999998750
x = 1e-06:  0.500044450291  0.500000000000
x = 1e-07:  0.488498130835  0.500000000000
x = 1e-08:  0.000000000000  0.500000000000
```

The direct formula loses digits as $x$ shrinks and gives 0 at $x = 10^{-8}$; the rationalised one stays accurate and approaches $\tfrac12$, as (a) says.

```check
steps((sqrt(x**2 + 1) - 1)/x**2, ((x**2 + 1) - 1)/(x**2*(sqrt(x**2 + 1) + 1)), 1/(sqrt(x**2 + 1) + 1))
limit_is(sqrt(x**2 + 1), x, 0, 1); limit_is((sqrt(x**2 + 1) - 1)/x**2, x, 0, Rational(1, 2))
import math
holds(1e-8**2 + 1 == 1.0); holds(math.sqrt(1e-8**2 + 1) - 1 == 0.0)
rounds(Rational(1, 2**52), '2.2e-16'); holds(1e-16 < 2.0**-53)          # 1 + 1e-16 is nearer to 1 than to 1 + 2^-52
for xv in (1e-2, 1e-4, 1e-6, 1e-7, 1e-8):
    xq = nsimplify(xv)
    rounds(1/(sqrt(xq**2 + 1) + 1), f"{1/(math.sqrt(xv**2 + 1) + 1):.12f}")   # the rationalised column is right
```
:::
::::

## Check yourself {#quiz}

```quiz
? If $f(x) = x + 1$ for every $x \ne 1$, and $f(1) = 5$, then $\lim_{x\to1} f(x)$ is
- [ ] 5
- [x] 2
- [ ] 1
- [ ] does not exist, because the graph has a gap at $x = 1$
> Near 1, $f(x) = x + 1$, which approaches 2 from both sides; the limit ignores the value at 1 itself. 5 is $f(1)$, not the limit. The separate dot at $(1, 5)$ does not stop the two one-sided limits from being equal, so the limit exists. And 1 is the value of $x$, not of $f(x)$.

? $\lim_{x\to2^-}\dfrac{\abs{x - 2}}{x - 2}$ equals
- [ ] 1
- [ ] 0
- [x] $-1$
- [ ] does not exist
> For $x < 2$, $x - 2$ is negative, so $\abs{x - 2} = -(x - 2)$ and the quotient is $-1$ for every such $x$. The limit from the right is 1, which is why the two-sided limit does not exist; but the question asks for the limit from the left, and that one exists. 0 comes from substituting $x = 2$ in the numerator alone.

? Direct substitution in $\lim_{x\to2}\dfrac{x^2 - 4}{x - 2}$ gives $\dfrac00$. So the limit
- [ ] is 0
- [ ] is 1
- [ ] does not exist
- [x] is 4
> $0/0$ is an indeterminate form, a signal to do more work: for $x \ne 2$, $\dfrac{x^2 - 4}{x - 2} = x + 2$, which approaches 4. The other three answers treat $0/0$ as if it were a value.

? $\lim_{x\to0}\dfrac{\sqrt{1 + x} - 1}{x}$ equals
- [x] $\dfrac12$
- [ ] 0
- [ ] 2
- [ ] 1
> Rationalise: $\dfrac{\sqrt{1 + x} - 1}{x} = \dfrac{1}{\sqrt{1 + x} + 1} \to \dfrac{1}{1 + 1} = \dfrac12$. 0 comes from substituting in the numerator only; 2 is the limit of $\sqrt{1 + x} + 1$, with the reciprocal forgotten; 1 comes from dropping the square root.

? With $x$ in radians, $\lim_{x\to0}\dfrac{\sin 4x}{x}$ is
- [ ] 1
- [x] 4
- [ ] $\dfrac14$
- [ ] 0
> $\dfrac{\sin 4x}{x} = 4\cdot\dfrac{\sin 4x}{4x} \to 4 \cdot 1 = 4$. Theorem 2.5 gives 1 only when the angle above is the same as the denominator below. $\tfrac14$ turns the factor upside down, and 0 comes from $\sin 0 = 0$ in the numerator alone.

? If $1 - x^2 \le f(x) \le 1 + x^2$ for every $x$, then $\lim_{x\to0} f(x)$
- [ ] cannot be found without a formula for $f$
- [ ] is 0
- [ ] exists only if $f(0) = 1$
- [x] is 1
> Both bounds approach 1 as $x \to 0$, so by the squeeze theorem $f(x) \to 1$, whatever the formula. The value $f(0)$ plays no part in the limit (here the inequalities happen to force $f(0) = 1$ anyway). 0 is the limit of $x^2$, not of the bounds.

? For $\lim_{x\to1}(4x + 3) = 7$, which response $\delta$ wins against every challenge $\varepsilon > 0$?
- [x] $\delta = \varepsilon/4$
- [ ] $\delta = \varepsilon$
- [ ] $\delta = 4\varepsilon$
- [ ] $\delta = 0.1$, whatever $\varepsilon$ is
> $\abs{(4x + 3) - 7} = 4\abs{x - 1} < 4\delta$, and with $\delta = \varepsilon/4$ that is $\varepsilon$. $\delta = \varepsilon$ is too large: $x = 1 + \varepsilon/2$ is within $\delta$ of 1 but gives $4 \cdot \varepsilon/2 = 2\varepsilon$; $4\varepsilon$ is worse still. A fixed $\delta$ such as 0.1 loses against small challenges: $\delta$ must depend on $\varepsilon$.

? In floating-point arithmetic, `(1 - math.cos(x))/x**2` gives `0.0` at `x = 1e-8`, although the limit at 0 is $\tfrac12$. Why?
- [ ] The limit is 0 after all.
- [ ] $x^2 = 10^{-16}$ is too small for the computer, so it becomes 0.
- [x] $\cos(10^{-8})$ is so close to 1 that it is stored as exactly 1, so the numerator is 0.
- [ ] Python's `math.cos` works in degrees.
> $\cos(10^{-8}) = 1 - 5 \times 10^{-17} + \dots$ is closer to 1 than to any other floating-point number, so $1 - \cos x$ comes out as 0: cancellation. Python handles numbers far smaller than $10^{-16}$ (down to about $10^{-308}$), and $0/10^{-16}$ is 0, not an error; `math.cos` works in radians; and the limit really is $\tfrac12$, as the rearranged formula of Section 2.8 and SymPy confirm.
```

```check
limit_is(x + 1, x, 1, 2)
same((Abs(x - 2)/(x - 2)).subs(x, 2 - hp), -1); limit_is(Abs(x - 2)/(x - 2), x, 2, -1, '-'); limit_is(Abs(x - 2)/(x - 2), x, 2, 1, '+')
same(cancel((x**2 - 4)/(x - 2)), x + 2); limit_is((x**2 - 4)/(x - 2), x, 2, 4)
same((sqrt(1 + x) - 1)/x, 1/(sqrt(1 + x) + 1)); limit_is((sqrt(1 + x) - 1)/x, x, 0, Rational(1, 2)); same(((1 + x) - 1)/x, 1)
limit_is(sin(4*x)/x, x, 0, 4); same(sin(4*x)/x, 4*sin(4*x)/(4*x))
limit_is(1 - x**2, x, 0, 1); limit_is(1 + x**2, x, 0, 1)
steps(Abs((4*xr + 3) - 7), 4*Abs(xr - 1)); same(4*(ep/4), ep); same(4*(ep/2), 2*ep)
import math, sys
holds(math.cos(1e-8) == 1.0); holds((1 - math.cos(1e-8))/1e-8**2 == 0.0)
holds(1e-309 < sys.float_info.min < 1e-307)
```
