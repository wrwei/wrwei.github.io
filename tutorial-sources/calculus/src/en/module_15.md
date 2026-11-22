---
title: Power series and Taylor series
part: 4
lead: Turn functions into polynomials that never end. You will find where a power series converges, build the series of the standard functions, bound the error of every approximation with Taylor's theorem, and use series to compute e, π and ln 2, evaluate limits, simplify formulas of physics and see how a computer evaluates a sine. At the end, the series of the exponential, the sine and the cosine combine into Euler's formula.
minutes: 270
needs: Modules 1 to 14, especially the rules of differentiation (Modules 4 to 7), the Mean Value Theorem (Module 8) and series with the ratio test (Module 14)
goals:
  - Find the radius and the interval of convergence of a power series with the ratio test, checking the endpoints separately
  - Build power series from the geometric series, and differentiate and integrate them term by term
  - Find Taylor and Maclaurin series from derivatives, and know the standard series and where they converge
  - Bound the error of a Taylor polynomial with Taylor's theorem, and prove that $e^x$, $\sin x$ and $\cos x$ equal their series
  - Use series to compute constants and limits, and to make the approximations of physics and of mathematics libraries
  - Derive Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$ from the series, and use it to explain oscillating solutions of differential equations
---

## Power series {#power-series}

Module 14 summed the geometric series: for every $x$ with $\abs{x} < 1$,

$$1 + x + x^2 + x^3 + \cdots = \frac{1}{1 - x}.$$

Read as a function of $x$, the left side is a polynomial that never ends. Its partial sums

$$S_n(x) = 1 + x + x^2 + \cdots + x^n = \frac{1 - x^{n+1}}{1 - x} \qquad (x \ne 1)$$

are ordinary polynomials, and for each $x$ between $-1$ and 1 they approach $1/(1 - x)$ as $n$ grows. Figure 15.1 (left) shows them: inside the interval $(-1, 1)$ the polynomials hug the curve more and more closely; outside it they peel away. The table follows three values of $x$:

```valuetable
n = 1, 2, 5, 10, 20, 50
$S_n(0.5)$ = (1 - (1/2)**(n + 1))/(1 - 1/2)
$S_n(-0.9)$ = (1 - (-9/10)**(n + 1))/(1 + 9/10)
$S_n(1.1)$ = (1 - (11/10)**(n + 1))/(1 - 11/10)
digits = 6
---
n | S_n(0.5) | S_n(-0.9) | S_n(1.1)
1 | 1.5 | 0.1 | 2.1
2 | 1.75 | 0.91 | 3.31
5 | 1.96875 | 0.24661 | 7.71561
10 | 1.99902 | 0.691479 | 18.5312
20 | 2.00000 | 0.583905 | 64.0025
50 | 2.00000 | 0.528757 | 1281.30
```

At $x = 0.5$ the partial sums close in on $1/(1 - 0.5) = 2$ quickly. At $x = -0.9$ they swing above and below $1/1.9 \approx 0.526316$ and close in slowly. At $x = 1.1$ they grow without bound, although $1/(1 - 1.1) = -10$ is a perfectly good number: there the series and the function part company.

```check
S_geo = lambda X, N: sum(X**j for j in range(N + 1))
for N_ in range(8):
    same(S_geo(x, N_), (1 - x**(N_ + 1))/(1 - x))
same(1/(1 - Rational(1, 2)), 2); rounds(1/Rational(19, 10), '0.526316'); same(1/(1 - Rational(11, 10)), -10)
holds(S_geo(Rational(-9, 10), 20) > Rational(10, 19)); holds(S_geo(Rational(-9, 10), 21) < Rational(10, 19))   # above, then below
holds(S_geo(Rational(11, 10), 50) > 1000)
```

::: figure id=fig-15-1
Left: the partial sums $S_n(x) = 1 + x + \cdots + x^n$ for $n = 1$, 2, 5 and 10, with $y = 1/(1 - x)$ (blue). In the green band, $-1 < x < 1$, they close in on the curve; outside it they do not. Right: the partial sums $1 - x^2 + x^4 - \cdots \pm x^{2m}$ for $m = 1$, 2, 5 and 20 close in on $y = 1/(1 + x^2)$ only for $-1 < x < 1$, although this function is smooth on the whole line (Section 15.2).
:::

::: definition Power series
A **power series centred at $a$** (or **about $a$**) is a series of the form

$$\sum_{n=0}^{\infty} c_n (x - a)^n = c_0 + c_1(x - a) + c_2(x - a)^2 + \cdots,$$

where $x$ is a variable and the **coefficients** $c_0, c_1, c_2, \dots$ are constants. For each number $x$ it is a series of numbers, which converges or diverges; where it converges, its sum is a function of $x$.
:::

The sum reads "the sum from $n = 0$ to infinity of $c_n$ times $x$ minus $a$, to the $n$". Its first term is $c_0(x - a)^0$, where $(x - a)^0$ means 1 even when $x = a$. So every power series converges at its centre, to $c_0$, because all its other terms are 0 there. The geometric series is the power series with centre 0 and every $c_n = 1$; a polynomial is a power series whose coefficients are 0 from some point on.

### Where a power series converges {#convergence}

The geometric series converges on an interval around its centre and diverges outside it. Every power series behaves in this way.

::: theorem Where a power series converges
For a power series $\sum c_n(x - a)^n$, exactly one of the following holds:

1. it converges only at $x = a$;
2. it converges absolutely for every real number $x$;
3. there is a number $R > 0$ such that the series converges absolutely when $\abs{x - a} < R$ and diverges when $\abs{x - a} > R$.
:::

::: proof
The heart of the proof is a comparison with a geometric series. Suppose the series converges at some $x_1 \ne a$, and let $x$ be closer to $a$: $\abs{x - a} < \abs{x_1 - a}$. The terms $c_n(x_1 - a)^n$ tend to 0, by the divergence test of Module 14, so they are bounded: from some $n$ on they lie between $-1$ and 1, and the finitely many before are no larger in size than the largest of them. So there is a number $M$ with $\abs{c_n (x_1 - a)^n} \le M$ for every $n$. With $q = \abs{x - a}/\abs{x_1 - a}$, which is less than 1,

$$\abs{c_n (x - a)^n} = \abs{c_n (x_1 - a)^n}\, q^n \le M q^n.$$

The geometric series $\sum Mq^n$ converges, so by the comparison test $\sum \abs{c_n (x - a)^n}$ converges: the series converges absolutely at $x$. Turned round, if the series diverges at some $x_2$, it diverges at every $x$ farther from $a$ than $x_2$, since convergence there would force convergence at $x_2$.

Now consider the distances $\abs{x_1 - a}$ of all the points $x_1$ at which the series converges. If 0 is the only one, case 1 holds. If they include numbers as large as you please, then every $x$ is closer to $a$ than some point of convergence, and case 2 holds. Otherwise these distances are bounded, and they have a **least upper bound** $R$: the smallest number that is at least as large as each of them. That such a number exists is the completeness of the real numbers, the property behind the monotone convergence theorem of Module 14. $R > 0$, because the series converges at some $x_1 \ne a$. If $\abs{x - a} < R$, then $\abs{x - a}$ is not an upper bound, so there is a point of convergence $x_1$ with $\abs{x - a} < \abs{x_1 - a}$, and the series converges absolutely at $x$. If $\abs{x - a} > R$, the series diverges at $x$, because $\abs{x - a}$ is larger than every distance at which it converges.
:::

```check
cA, dA, d1A = symbols('C d d_1', positive=True)        # |c_n|, |x - a| and |x_1 - a|
same(cA*d1A**n*(dA/d1A)**n, cA*dA**n)                  # |c_n (x1 - a)^n| q^n = |c_n (x - a)^n|
qA = symbols('q', positive=True)
same(summation(qA**n, (n, 0, oo)).args[0][0], 1/(1 - qA))   # the geometric series sum M q^n converges for q < 1
```

::: definition Radius and interval of convergence
The number $R$ of Theorem 15.1 is the **radius of convergence** of the series. In case 1 the radius is $R = 0$, and in case 2 it is $R = \infty$. The set of all $x$ at which the series converges is its **interval of convergence**.
:::

When $0 < R < \infty$, the interval of convergence runs from $a - R$ to $a + R$. Theorem 15.1 says nothing about the two **endpoints** $x = a - R$ and $x = a + R$: at each of them the series may converge or diverge. So the interval of convergence is one of $(a - R, a + R)$, $[a - R, a + R)$, $(a - R, a + R]$ and $[a - R, a + R]$, and the examples below meet all four.

### Finding the radius {#radius}

The ratio test of Module 14 usually finds $R$. For the terms $c_n(x - a)^n$, with every $c_n \ne 0$ and $x \ne a$, the ratio of consecutive terms is

$$\abs{\frac{c_{n+1}(x - a)^{n+1}}{c_n (x - a)^n}} = \abs{\frac{c_{n+1}}{c_n}}\,\abs{x - a}.$$

If $\abs{c_{n+1}/c_n}$ approaches a limit $L$, this ratio approaches $L\abs{x - a}$, and the ratio test gives absolute convergence where $L\abs{x - a} < 1$ and divergence where $L\abs{x - a} > 1$. So $R = 1/L$, with $R = \infty$ if $L = 0$, and $R = 0$ if $\abs{c_{n+1}/c_n} \to \infty$. At the endpoints the limit of the ratio is exactly 1, where the ratio test says nothing: test them separately, with the other tests of Module 14.

::: example Three intervals of convergence
Find the radius and the interval of convergence of (a) $\displaystyle\sum_{n=1}^{\infty} \frac{x^n}{n}$ and (b) $\displaystyle\sum_{n=1}^{\infty} \frac{x^n}{n^2}$, and compare them with the geometric series $\sum x^n$.

**(a)** Here $c_n = 1/n$, so

$$\abs{\frac{c_{n+1}}{c_n}} = \frac{n}{n + 1} \to 1,$$

and $R = 1$: the series converges absolutely for $\abs{x} < 1$ and diverges for $\abs{x} > 1$. At $x = 1$ it is the harmonic series $\sum 1/n$, which diverges. At $x = -1$ it is $\sum (-1)^n/n$, which converges by the alternating series test, since the sizes $1/n$ decrease to 0. The interval of convergence is $[-1, 1)$.

**(b)** Now $\abs{c_{n+1}/c_n} = n^2/(n + 1)^2 \to 1$, so again $R = 1$. At $x = \pm 1$ the series of absolute values is $\sum 1/n^2$, a convergent $p$-series, so the series converges absolutely at both endpoints. The interval is $[-1, 1]$.

The geometric series also has radius 1, and at $x = \pm 1$ its terms, 1 or $(-1)^n$, do not tend to 0, so its interval is $(-1, 1)$. Three series with the same radius have three different intervals: the endpoints must always be checked.

```check
limit_is((1/(n + 1))/(1/n), n, oo, 1); same((1/(n + 1))/(1/n), n/(n + 1))
holds(Sum(1/n, (n, 1, oo)).is_convergent() == False); holds(Sum((-1)**n/n, (n, 1, oo)).is_convergent())
same((1/(n + 1)**2)/(1/n**2), n**2/(n + 1)**2); limit_is(n**2/(n + 1)**2, n, oo, 1)
holds(Sum(1/n**2, (n, 1, oo)).is_convergent())
nI = symbols('n', integer=True, nonnegative=True)
same(Abs((-1)**nI), 1); holds(Sum((-1)**n, (n, 0, oo)).is_convergent() == False)
```
:::

::: example Radius $\infty$ and radius 0
Find the radius of convergence of $\displaystyle\sum_{n=0}^{\infty} \frac{x^n}{n!}$ and of $\displaystyle\sum_{n=0}^{\infty} n!\,x^n$, where $0! = 1$.

For the first, $c_n = 1/n!$, and since $(n + 1)! = (n + 1)\,n!$,

$$\abs{\frac{c_{n+1}}{c_n}} = \frac{n!}{(n + 1)!} = \frac{1}{n + 1} \to 0.$$

The ratio of the terms tends to $0 \cdot \abs{x} = 0 < 1$ for every $x$: the series converges absolutely for every $x$, and $R = \infty$. For the second, $\abs{c_{n+1}/c_n} = (n + 1)!/n! = n + 1 \to \infty$. For every $x \ne 0$ the ratio of the terms, $(n + 1)\abs{x}$, grows without bound, so the series diverges, and $R = 0$: it converges only at its centre. The first series returns in Section 15.4 as the series of $e^x$.

```check
nP = symbols('n', integer=True, nonnegative=True)
same(factorial(nP + 1), (nP + 1)*factorial(nP)); same(factorial(0), 1)
same(factorial(nP)/factorial(nP + 1), 1/(nP + 1)); limit_is(1/(n + 1), n, oo, 0)
same(factorial(nP + 1)/factorial(nP), nP + 1); limit_is((n + 1)*Rational(1, 1000), n, oo, oo)   # even at x = 0.001
holds(Sum(x**n/factorial(n), (n, 0, oo)).subs(x, 7).is_convergent())
```
:::

::: example A series centred at 3
Find the interval of convergence of $\displaystyle\sum_{n=1}^{\infty} \frac{(-1)^n (x - 3)^n}{n\,2^n}$.

Here $c_n = \dfrac{(-1)^n}{n\,2^n}$, and

$$\abs{\frac{c_{n+1}}{c_n}} = \frac{n\,2^n}{(n + 1)\,2^{n+1}} = \frac{n}{2(n + 1)} \to \frac12.$$

So $R = 2$: the series converges absolutely when $\abs{x - 3} < 2$, that is, $1 < x < 5$, and diverges when $\abs{x - 3} > 2$. At $x = 5$, $(x - 3)^n = 2^n$, and the series is $\sum (-1)^n/n$, which converges by the alternating series test. At $x = 1$, $(x - 3)^n = (-2)^n = (-1)^n 2^n$, and the terms are $\dfrac{(-1)^n(-1)^n 2^n}{n\,2^n} = \dfrac1n$: the harmonic series, which diverges. The interval of convergence is $(1, 5]$, centred at 3 with radius 2.

```check
nQ = symbols('n', integer=True, positive=True)
cq = lambda N: (-1)**N/(N*2**N)
same(Abs(cq(nQ + 1)/cq(nQ)), nQ/(2*(nQ + 1))); limit_is(n/(2*(n + 1)), n, oo, Rational(1, 2))
same(solve_univariate_inequality(Abs(x - 3) < 2, x, relational=False), Interval.open(1, 5))
same(cq(nQ)*2**nQ, (-1)**nQ/nQ); holds(Sum((-1)**n/n, (n, 1, oo)).is_convergent())        # x = 5
same(cq(nQ)*(-2)**nQ, 1/nQ); holds(Sum(1/n, (n, 1, oo)).is_convergent() == False)          # x = 1
```
:::

::: pitfall
Two slips with the ratio test. It works with absolute values: the condition in Example 15.3 is $\abs{x - 3} < 2$, an interval centred at 3, not $x - 3 < 2$, which would let in every $x < 5$. And at the endpoints the ratio tends to exactly 1, where the ratio test is silent. Declaring the endpoints in or out without testing them is the most common error with intervals of convergence.
:::

## Functions as power series {#functions-as-series}

Section 15.1 started from a series and found its sum. Now turn the question round: given a function, find a power series whose sum it is. The geometric series is the source of many. For every number $u$ with $\abs{u} < 1$,

$$\frac{1}{1 - u} = \sum_{n=0}^{\infty} u^n = 1 + u + u^2 + \cdots,$$

and $u$ may be replaced by any expression in $x$, provided the condition $\abs{u} < 1$ is translated too. With $u = -x$, for $\abs{x} < 1$,

$$\frac{1}{1 + x} = 1 - x + x^2 - x^3 + \cdots = \sum_{n=0}^\infty (-1)^n x^n.$$

With $u = -x^2$, which satisfies $\abs{u} < 1$ exactly when $\abs{x} < 1$,

$$\frac{1}{1 + x^2} = 1 - x^2 + x^4 - x^6 + \cdots = \sum_{n=0}^\infty (-1)^n x^{2n}.$$

At $x = \pm 1$ the terms of both series have size 1 and do not tend to 0, so both intervals of convergence are $(-1, 1)$. The second is a surprise. The function $1/(1 + x^2)$ is defined and smooth on the whole real line, with nothing special at $\pm 1$, yet its series stops converging there (Figure 15.1, right). The reason lies off the real line, and Section 15.7 reveals it.

```check
same(series(1/(1 + x), x, 0, 9).removeO(), sum((-1)**j*x**j for j in range(9)))
same(series(1/(1 + x**2), x, 0, 18).removeO(), sum((-1)**j*x**(2*j) for j in range(9)))
g_u = Sum(u**n, (n, 0, oo)).doit()
same(g_u.args[0][0], 1/(1 - u)); same(g_u.args[0][0].subs(u, -x), 1/(1 + x)); same(g_u.args[0][0].subs(u, -x**2), 1/(1 + x**2))
same(solve_univariate_inequality(Abs(-x**2) < 1, x, relational=False), Interval.open(-1, 1))
```

::: example Series from the geometric series
Find a power series for each function, centred where stated, with its interval of convergence:

- (a) $\dfrac{1}{2 - x}$, centred at 0;
- (b) $\dfrac{x}{1 - x^2}$, centred at 0;
- (c) $\dfrac1x$, centred at 1.

**(a)** Make the 1 of $1/(1 - u)$ appear by taking out the factor 2:

$$\begin{aligned} \frac{1}{2 - x} &= \frac12\cdot\frac{1}{1 - x/2} = \frac12\sum_{n=0}^\infty \Big(\frac{x}{2}\Big)^n \\ &= \sum_{n=0}^\infty \frac{x^n}{2^{n+1}} = \frac12 + \frac{x}{4} + \frac{x^2}{8} + \cdots. \end{aligned}$$

This needs $\abs{x/2} < 1$, that is, $\abs{x} < 2$. At $x = \pm 2$ the terms have size $\tfrac12$ and do not tend to 0, so the interval is $(-2, 2)$.

**(b)** With $u = x^2$, $\dfrac{1}{1 - x^2} = \sum x^{2n}$ for $\abs{x} < 1$. Multiplying every term by $x$ multiplies the sum by $x$:

$$\frac{x}{1 - x^2} = \sum_{n=0}^\infty x^{2n+1} = x + x^3 + x^5 + \cdots, \qquad \abs{x} < 1.$$

At $x = \pm 1$ every term is $\pm 1$, so the interval is $(-1, 1)$.

**(c)** A series centred at 1 is a series in powers of $x - 1$. Write $x = 1 + (x - 1)$ and use $u = -(x - 1)$:

$$\frac1x = \frac{1}{1 + (x - 1)} = \sum_{n=0}^\infty (-1)^n (x - 1)^n,$$

for $\abs{x - 1} < 1$, that is, $0 < x < 2$. At $x = 0$ and $x = 2$ the terms have size 1, so the interval is $(0, 2)$: centred at 1, with radius 1.

```check
steps(1/(2 - x), Rational(1, 2)*1/(1 - x/2))
same(series(1/(2 - x), x, 0, 9).removeO(), sum(x**j/2**(j + 1) for j in range(9)))
same([x**j/2**(j + 1) for j in range(3)], [Rational(1, 2), x/4, x**2/8])
nR = symbols('n', integer=True, nonnegative=True)
same(Abs((2)**nR/2**(nR + 1)), Rational(1, 2)); same(Abs((-2)**nR/2**(nR + 1)), Rational(1, 2))
same(series(x/(1 - x**2), x, 0, 14).removeO(), sum(x**(2*j + 1) for j in range(7)))
same(series(1/x, x, 1, 9).removeO(), sum((-1)**j*(x - 1)**j for j in range(9)))
same(1/(1 + (x - 1)), 1/x); same(solve_univariate_inequality(Abs(x - 1) < 1, x, relational=False), Interval.open(0, 2))
```
:::

One function can have different series about different centres. About 0, $\dfrac{1}{2 - x} = \sum x^n/2^{n+1}$; about 1, $\dfrac{1}{2 - x} = \dfrac{1}{1 - (x - 1)} = \sum (x - 1)^n$, for $\abs{x - 1} < 1$. Each series describes the function on its own interval.

```check
same(series(1/(2 - x), x, 1, 9).removeO(), sum((x - 1)**j for j in range(9))); same(1/(1 - (x - 1)), 1/(2 - x))
```

::: pitfall
Two slips with substitution. Losing the factor in front: $\dfrac{1}{2 - x}$ is $\dfrac12\sum (x/2)^n$, and without the $\tfrac12$ the series is that of $\dfrac{2}{2 - x}$. And forgetting to translate the condition: $\sum (x/2)^n$ converges for $\abs{x} < 2$, not $\abs{x} < 1$. A quick test at one point catches both: at $x = 1$ the series of Example 15.4(a) is $\tfrac12 + \tfrac14 + \tfrac18 + \cdots = 1$, and indeed $\dfrac{1}{2 - 1} = 1$.

```check
same(summation(Rational(1, 2)**(n + 1), (n, 0, oo)), 1); same(1/(2 - 1), 1)
same(summation(Rational(1, 2)**n, (n, 0, oo)), 2/(2 - 1))
```
:::

## Differentiating and integrating series {#term-by-term}

Inside its interval of convergence a power series can be treated like a polynomial: differentiated and integrated term by term.

::: theorem Term-by-term differentiation and integration
Let $\sum c_n(x - a)^n$ have radius of convergence $R > 0$ (possibly $R = \infty$), and let

$$f(x) = \sum_{n=0}^\infty c_n (x - a)^n \qquad \text{for } \abs{x - a} < R.$$

Then, for every $x$ with $\abs{x - a} < R$:

1. $f$ is differentiable at $x$, and $\displaystyle f'(x) = \sum_{n=1}^\infty n\,c_n (x - a)^{n-1}$;
2. $\displaystyle \int_a^x f(t)\,dt = \sum_{n=0}^\infty \frac{c_n}{n + 1}(x - a)^{n+1}$.

Both new series have radius of convergence $R$.
:::

Applying part 1 again and again shows that a power series has derivatives of every order inside its interval of convergence, each found term by term. The radius never changes, but the endpoints can. The series $\sum x^n/n^2$ of Example 15.1 converges at both $x = 1$ and $x = -1$; its derivative $\sum x^{n-1}/n$ converges at $-1$ only; and the next derivative, $\sum (n - 1)x^{n-2}/n$, at neither, because its terms do not tend to 0 there.

```check
same(diff(x**n/n**2, x), x**(n - 1)/n); same(diff(x**(n - 1)/n, x), (n - 1)*x**(n - 2)/n)
holds(Sum(1/n**2, (n, 1, oo)).is_convergent()); holds(Sum((-1)**n/n**2, (n, 1, oo)).is_convergent())
holds(Sum(1/n, (n, 1, oo)).is_convergent() == False); holds(Sum((-1)**(n - 1)/n, (n, 1, oo)).is_convergent())
limit_is((n - 1)/n, n, oo, 1)
```

The proof is in the Going deeper box below; its key step is the Mean Value Theorem of Module 8. A first reading may take the theorem on trust.

::: pitfall
Term-by-term differentiation is a theorem about power series inside their interval of convergence, not about every series of functions. The series $\displaystyle\sum_{n=1}^\infty \frac{\sin(n^2x)}{n^2}$ converges for every $x$, by comparison with $\sum 1/n^2$; but differentiating it term by term gives $\sum \cos(n^2x)$, which at $x = 0$ is $1 + 1 + 1 + \cdots$ and diverges.

```check
same(diff(sin(n**2*x)/n**2, x), cos(n**2*x)); same(cos(n**2*0), 1)
xR = symbols('x', real=True); holds(Abs(sin(n**2*xR)/n**2).subs({xR: 3, n: 5}) <= Rational(1, 25))
holds(Sum(1/n**2, (n, 1, oo)).is_convergent()); holds(Sum(1, (n, 1, oo)).is_convergent() == False)
```
:::

::: deeper Why term-by-term differentiation works
Take $a = 0$; for another centre, write $x - a$ for $x$ throughout.

**The derived series has the same radius.** Let $\abs{x} < R$, and choose $r$ with $\abs{x} < r < R$. The series converges at $r$, so its terms are bounded, as in the proof of Theorem 15.1: $\abs{c_n} r^n \le M$ for every $n$. Then, with $q = \abs{x}/r < 1$,

$$\abs{n c_n x^{n-1}} = \frac{n\,\abs{c_n} r^n\, q^{n-1}}{r} \le \frac{M}{r}\, n q^{n-1},$$

and $\sum n q^{n-1}$ converges by the ratio test: $(n + 1)q^n/(n q^{n-1}) \to q < 1$. So the derived series converges absolutely for $\abs{x} < R$. It diverges for $\abs{x} > R$: otherwise, by Theorem 15.1, it would converge absolutely at some $y$ with $R < \abs{y} < \abs{x}$, and since $\abs{c_n y^n} \le \abs{y}\,\abs{n c_n y^{n-1}}$ for $n \ge 1$, so would the original series, which is impossible beyond its radius. The same argument, applied to the derived series, shows that the twice-derived series $\sum n(n - 1)c_n x^{n-2}$ has radius $R$ too.

**The derivative.** Let $g(x) = \sum n c_n x^{n-1}$, fix $x$ with $\abs{x} < r < R$, and let $h \ne 0$ be so small that $\abs{x + h} < r$. For $n \ge 2$, the Mean Value Theorem gives $(x + h)^n - x^n = n\xi^{n-1}h$ for some $\xi$ between $x$ and $x + h$, and, applied again, $n\xi^{n-1} - nx^{n-1} = n(n - 1)\eta^{n-2}(\xi - x)$ for some $\eta$ between $x$ and $\xi$. Since $\abs{\xi}$ and $\abs{\eta}$ are less than $r$ and $\abs{\xi - x} \le \abs{h}$,

$$\abs{\frac{(x + h)^n - x^n}{h} - n x^{n-1}} \le n(n - 1)\, r^{n-2}\,\abs{h},$$

and for $n = 0$ and $n = 1$ the left side is 0. The three series for $f(x + h)$, $f(x)$ and $g(x)$ converge, so they may be combined term by term:

$$\abs{\frac{f(x + h) - f(x)}{h} - g(x)} \le \abs{h} \sum_{n=2}^\infty n(n - 1)\abs{c_n} r^{n-2}.$$

The last series converges, because the twice-derived series converges absolutely at $r < R$. So the left side tends to 0 as $h \to 0$: $f'(x) = g(x)$.

**The integral.** The series $F(x) = \sum c_n x^{n+1}/(n + 1)$ has the original series as its derived series, so by the first step it has radius $R$, and by the second, $F' = f$ on $(-R, R)$. Since $F(0) = 0$, the Fundamental Theorem of Calculus (Module 10) gives $\displaystyle\int_0^x f(t)\,dt = F(x) - F(0) = F(x)$.
:::

```check
qB = symbols('q', positive=True)
limit_is((n + 1)*qB**n/(n*qB**(n - 1)), n, oo, qB)
cB, rB, xB = symbols('C r x', positive=True)                       # |c_n|, r and |x|
same(n*cB*xB**(n - 1), n*cB*rB**n*(xB/rB)**(n - 1)/rB)            # |n c_n x^(n-1)| = n |c_n| r^n q^(n-1)/r
for N_ in (2, 3, 4, 6):    # |((x + h)^n - x^n)/h - n x^(n-1)| <= n(n - 1) r^(n-2) |h| when |x|, |x + h| <= r
    for (xv, hv, rv) in ((Rational(1, 2), Rational(1, 5), Rational(7, 10)), (Rational(-3, 4), Rational(1, 10), Rational(9, 10)), (Rational(9, 10), Rational(-1, 2), 1)):
        holds(Abs(((xv + hv)**N_ - xv**N_)/hv - N_*xv**(N_ - 1)) <= N_*(N_ - 1)*rv**(N_ - 2)*Abs(hv))
same(diff(x**(n + 1)/(n + 1), x), x**n)
```

### The logarithm and the arctangent {#log-arctan}

Integrating geometric series gives series for two functions that have nothing geometric about them.

::: example Series for $\ln(1 + x)$ and $\arctan x$
Find power series about 0 for $\ln(1 + x)$ and $\arctan x$, and use four terms of the first to estimate $\ln 1.1$.

For $\abs{t} < 1$, $\dfrac{1}{1 + t} = \sum (-1)^n t^n$. Let $\abs{x} < 1$. The function $\ln(1 + t)$ is an antiderivative of $\dfrac{1}{1 + t}$, and $\ln 1 = 0$, so by the Fundamental Theorem of Calculus and Theorem 15.2,

$$\begin{aligned} \ln(1 + x) &= \int_0^x \frac{dt}{1 + t} = \sum_{n=0}^\infty (-1)^n\frac{x^{n+1}}{n + 1} \\ &= x - \frac{x^2}{2} + \frac{x^3}{3} - \frac{x^4}{4} + \cdots \end{aligned}$$

In the same way, $\arctan x$ is an antiderivative of $\dfrac{1}{1 + x^2}$ (Module 6), with $\arctan 0 = 0$, so for $\abs{x} < 1$

$$\arctan x = \int_0^x \frac{dt}{1 + t^2} = \sum_{n=0}^\infty (-1)^n\frac{x^{2n+1}}{2n + 1} = x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots$$

Both series have radius 1, like the series that were integrated. At $x = 0.1$, four terms give

$$\ln 1.1 \approx 0.1 - 0.005 + 0.000333 - 0.000025 = 0.095308,$$

while a calculator gives $\ln 1.1 \approx 0.0953102$: both round to 0.09531. The terms alternate in sign and decrease in size, so by the alternating series bound of Module 14 the error is less than the first term left out, $0.1^5/5 = 0.000002$.

```check
tt = symbols('t')
antideriv(log(1 + tt), 1/(1 + tt), tt); same(log(1), 0)
same(integrate(sum((-1)**j*tt**j for j in range(7)), (tt, 0, x)), sum((-1)**j*x**(j + 1)/(j + 1) for j in range(7)))
same(series(log(1 + x), x, 0, 10).removeO(), sum((-1)**j*x**(j + 1)/(j + 1) for j in range(9)))
same(diff(atan(x), x), 1/(1 + x**2)); same(atan(0), 0)
same(series(atan(x), x, 0, 14).removeO(), sum((-1)**j*x**(2*j + 1)/(2*j + 1) for j in range(7)))
xv_ = Rational(1, 10); terms = [(-1)**(j - 1)*xv_**j/j for j in range(1, 5)]
same(terms, [Rational(1, 10), -Rational(5, 1000), Rational(1, 3000), -Rational(25, 1000000)]); rounds(Rational(1, 3000), '0.000333')
rounds(sum(terms), '0.095308'); rounds(log(Rational(11, 10)), '0.0953102')
rounds(sum(terms), '0.09531'); rounds(log(Rational(11, 10)), '0.09531')
same(xv_**5/5, Rational(2, 1000000)); holds(Abs(log(Rational(11, 10)) - sum(terms)) < xv_**5/5)
```
:::

Differentiating a series is as useful as integrating it, for instance to find sums.

::: example A sum found by differentiating
Find the sum of $\displaystyle\sum_{n=1}^{\infty} n x^n$ for $\abs{x} < 1$, and the value of $\displaystyle\sum_{n=1}^{\infty} \frac{n}{2^n}$.

Differentiate the geometric series term by term (Theorem 15.2): for $\abs{x} < 1$,

$$\frac{1}{(1 - x)^2} = \frac{d}{dx}\Big(\frac{1}{1 - x}\Big) = \sum_{n=1}^{\infty} n x^{n-1} = 1 + 2x + 3x^2 + \cdots.$$

Multiplying by $x$ gives $\displaystyle\sum_{n=1}^{\infty} n x^n = \frac{x}{(1 - x)^2}$. At $x = \tfrac12$,

$$\sum_{n=1}^{\infty} \frac{n}{2^n} = \frac{1/2}{(1/2)^2} = 2.$$

The sum has a meaning in probability. Toss a fair coin until it lands heads: the first head comes on toss $n$ with probability $1/2^n$, so the expected number of tosses, the sum of each possible number $n$ times its probability, is $\sum n/2^n = 2$.

```check
same(diff(1/(1 - x), x), 1/(1 - x)**2)
same(series(1/(1 - x)**2, x, 0, 9).removeO(), sum((j + 1)*x**j for j in range(9)))
same(series(x/(1 - x)**2, x, 0, 9).removeO(), sum(j*x**j for j in range(1, 9)))
same((x/(1 - x)**2).subs(x, Rational(1, 2)), 2); same(summation(n/2**n, (n, 1, oo)), 2)
same(summation(1/2**n, (n, 1, oo)), 1)                       # the probabilities add up to 1
```
:::

### The ends of the interval {#endpoints}

At $x = 1$ the series for $\ln(1 + x)$ becomes the alternating harmonic series $1 - \tfrac12 + \tfrac13 - \cdots$, which converges by the alternating series test; Module 14 stated that its sum is $\ln 2$. Example 15.5 does not prove it, because Theorem 15.2 integrates term by term only for $\abs{x} < 1$. Integrating a finite sum instead, which is always allowed, proves it, with an error bound.

::: theorem Two sums at the ends of the interval
For every whole number $n \ge 1$,

$$\abs{\ln 2 - \Big(1 - \frac12 + \frac13 - \cdots + \frac{(-1)^{n-1}}{n}\Big)} \le \frac{1}{n + 1}$$

and

$$\abs{\frac{\pi}{4} - \Big(1 - \frac13 + \frac15 - \cdots + \frac{(-1)^{n-1}}{2n - 1}\Big)} \le \frac{1}{2n + 1}.$$

Consequently $\ln 2 = 1 - \dfrac12 + \dfrac13 - \dfrac14 + \cdots$ and $\dfrac{\pi}{4} = 1 - \dfrac13 + \dfrac15 - \dfrac17 + \cdots$.
:::

::: proof
The finite geometric sum of Module 14 gives, for $t \ne -1$, $1 - t + t^2 - \cdots + (-t)^{n-1} = \dfrac{1 - (-t)^n}{1 + t}$, that is,

$$\frac{1}{1 + t} = \sum_{k=0}^{n-1} (-1)^k t^k + (-1)^n\frac{t^n}{1 + t}.$$

Integrate from 0 to 1. The integral of a finite sum is the sum of the integrals, $\int_0^1 t^k\,dt = \dfrac{1}{k + 1}$, and $\int_0^1 \dfrac{dt}{1 + t} = \ln 2$, so

$$\ln 2 = \sum_{k=0}^{n-1} \frac{(-1)^k}{k + 1} + (-1)^n \int_0^1 \frac{t^n}{1 + t}\,dt.$$

The sum is $1 - \tfrac12 + \cdots + \tfrac{(-1)^{n-1}}{n}$. For $0 \le t \le 1$, $0 \le \dfrac{t^n}{1 + t} \le t^n$, so the last integral lies between 0 and $\int_0^1 t^n\,dt = \dfrac{1}{n + 1}$ (the bounds of Module 9). This is the first inequality, and since $\dfrac{1}{n + 1} \to 0$, the partial sums approach $\ln 2$. For $\dfrac{\pi}{4}$, put $t^2$ for $t$ in the identity:

$$\frac{1}{1 + t^2} = \sum_{k=0}^{n-1} (-1)^k t^{2k} + (-1)^n\frac{t^{2n}}{1 + t^2}.$$

Integrating from 0 to 1 gives $\arctan 1 = \dfrac{\pi}{4}$ on the left, and on the right the partial sum plus $\pm$ an integral that lies between 0 and $\int_0^1 t^{2n}\,dt = \dfrac{1}{2n + 1}$.
:::

```check
for N_ in range(1, 7):
    same(sum((-1)**k*tt**k for k in range(N_)) + (-1)**N_*tt**N_/(1 + tt), 1/(1 + tt))
    same(sum((-1)**k*tt**(2*k) for k in range(N_)) + (-1)**N_*tt**(2*N_)/(1 + tt**2), 1/(1 + tt**2))
same(integrate(1/(1 + tt), (tt, 0, 1)), log(2)); same(integrate(1/(1 + tt**2), (tt, 0, 1)), pi/4); same(atan(1), pi/4)
nS = symbols('n', positive=True); same(integrate(tt**nS, (tt, 0, 1)), 1/(nS + 1)); same(integrate(tt**(2*nS), (tt, 0, 1)), 1/(2*nS + 1))
for N_ in (1, 2, 5, 10, 20):
    holds(Abs(log(2) - sum(Rational((-1)**(k - 1), k) for k in range(1, N_ + 1))) <= Rational(1, N_ + 1))
    holds(Abs(pi/4 - sum(Rational((-1)**k, 2*k + 1) for k in range(N_))) <= Rational(1, 2*N_ + 1))
    holds(0 <= integrate(tt**N_/(1 + tt), (tt, 0, 1))); holds(integrate(tt**N_/(1 + tt), (tt, 0, 1)) <= Rational(1, N_ + 1))
```

The bound also shows how slowly the alternating harmonic series converges. After 10, 100 and 1000 terms its partial sums are about 0.6456, 0.6882 and 0.6926, while $\ln 2 \approx 0.693147$: the errors are close to $1/(2n)$, so each extra correct decimal costs ten times as many terms. Section 15.6 finds much faster series for $\ln 2$ and $\pi$.

```check
alt = lambda N: harmonic(N) - harmonic(N // 2)               # 1 - 1/2 + ... - 1/N, for even N
same(alt(10), sum(Rational((-1)**(k - 1), k) for k in range(1, 11)))
rounds(alt(10), '0.6456'); rounds(alt(100), '0.6882'); rounds(alt(1000), '0.6926'); rounds(log(2), '0.693147')
for N_ in (10, 100, 1000):
    holds(Abs((log(2) - alt(N_))*2*N_ - 1) < Rational(1, 10))   # the error is within 10% of 1/(2n)
```

The proof used special features of $\ln(1 + x)$ and $\arctan x$. A general theorem covers every power series at an endpoint where it converges.

::: theorem Abel's theorem
Suppose that $\sum c_n (x - a)^n$ has radius of convergence $R$, with $0 < R < \infty$, and that it converges at the endpoint $x = a + R$. Then its sum there is the limit of its sums inside the interval:

$$\sum_{n=0}^\infty c_n R^n = \lim_{x\to (a + R)^-}\, \sum_{n=0}^\infty c_n (x - a)^n.$$

The same holds at $x = a - R$, with the limit from the right.
:::

This series does not prove Abel's theorem; books on real analysis do. Its use is this. Suppose $f(x)$ equals the sum of its series inside the interval, $f$ is continuous at an endpoint, and the series converges there. Then the series equals $f$ at that endpoint too, because both are the limit of $f(x)$ as $x$ approaches the endpoint from inside. So, with no new work, $\ln(1 + x) = x - \tfrac{x^2}{2} + \cdots$ on $(-1, 1]$, and $\arctan x = x - \tfrac{x^3}{3} + \cdots$ on $[-1, 1]$; at $x = -1$ the series of $\arctan$ is $-\big(1 - \tfrac13 + \tfrac15 - \cdots\big)$, which converges by the alternating series test.

```check
holds(Sum((-1)**n/(2*n + 1), (n, 0, oo)).is_convergent()); same(atan(-1), -pi/4)
same(summation((-1)**n*(-1)**(2*n + 1)/(2*n + 1), (n, 0, oo)), -pi/4)
limit_is(log(1 + x), x, 1, log(2), '-'); limit_is(atan(x), x, -1, -pi/4, '+')
```

::: pitfall
The interval of convergence of a series for $f$ is not the domain of $f$. $\ln(1 + x)$ is defined for every $x > -1$, but its series converges only on $(-1, 1]$: at $x = 2$ its terms $\pm 2^n/n$ grow without bound, although $\ln 3$ exists. Outside its interval of convergence a series tells you nothing about the function.

```check
limit_is(2**n/n, n, oo, oo); same(log(1 + 2), log(3))
```
:::

## Taylor series {#taylor-series}

So far every series has come from the geometric series. Most functions have nothing to do with it: $e^x$, for instance. Does $e^x$ have a power series, and how would you find it? If a function has a power series, its derivatives fix the coefficients. Take $f(x) = \sum c_n(x - a)^n$, with radius $R > 0$, and differentiate term by term, again and again (Theorem 15.2):

$$\begin{aligned} f(x) &= c_0 + c_1(x - a) + c_2(x - a)^2 + c_3(x - a)^3 + \cdots \\ f'(x) &= c_1 + 2c_2(x - a) + 3c_3(x - a)^2 + \cdots \\ f''(x) &= 2c_2 + 3\cdot2\,c_3(x - a) + \cdots \\ f'''(x) &= 3\cdot2\cdot1\,c_3 + \cdots \end{aligned}$$

At $x = a$ every term that contains $x - a$ is 0, so $f(a) = c_0$, $f'(a) = c_1$, $f''(a) = 2c_2$ and $f'''(a) = 3!\,c_3$.

```check
cs = symbols('c0:7')
pa = sum(cs[j]*(x - a)**j for j in range(7))
same(diff(pa, x), cs[1] + 2*cs[2]*(x - a) + 3*cs[3]*(x - a)**2 + 4*cs[4]*(x - a)**3 + 5*cs[5]*(x - a)**4 + 6*cs[6]*(x - a)**5)
same(diff(pa, x, 2).subs(x, a), 2*cs[2]); same(diff(pa, x, 3), 6*cs[3] + 24*cs[4]*(x - a) + 60*cs[5]*(x - a)**2 + 120*cs[6]*(x - a)**3)
same([diff(pa, x, j).subs(x, a) for j in range(4)], [cs[0], cs[1], 2*cs[2], factorial(3)*cs[3]])
```

::: theorem The coefficients of a power series
If $f(x) = \sum c_n(x - a)^n$ for $\abs{x - a} < R$, with $R > 0$, then for every $n \ge 0$

$$c_n = \frac{f^{(n)}(a)}{n!}.$$

In particular, $f$ has only one power series centred at $a$.
:::

::: proof
By Theorem 15.2, applied $n$ times, for $\abs{x - a} < R$

$$f^{(n)}(x) = \sum_{k=n}^\infty k(k - 1)\cdots(k - n + 1)\,c_k (x - a)^{k-n}.$$

At $x = a$ every term with $k > n$ is 0, and the term with $k = n$ is $n(n - 1)\cdots1\cdot c_n = n!\,c_n$. Since the coefficients are fixed by $f$, two power series for $f$ about $a$ have the same coefficients: they are the same series.
:::

```check
for K_ in range(1, 7):
    for N_ in range(0, K_ + 1):
        same(diff((x - a)**K_, x, N_), ff(K_, N_)*(x - a)**(K_ - N_))
same([diff(pa, x, j).subs(x, a) for j in range(7)], [factorial(j)*cs[j] for j in range(7)])
```

Here $f^{(0)}$ means $f$ itself and $0! = 1$, so the formula gives $c_0 = f(a)$ too. Uniqueness is useful in practice: however you find a power series for $f$ about $a$ (by substitution, by integration, from derivatives), you get the same series.

::: definition Taylor series and Taylor polynomials
Let $f$ have derivatives of every order at $a$. The **Taylor series** of $f$ about $a$ (or centred at $a$) is

$$\sum_{n=0}^\infty \frac{f^{(n)}(a)}{n!}(x - a)^n = f(a) + f'(a)(x - a) + \frac{f''(a)}{2!}(x - a)^2 + \cdots.$$

Its partial sum

$$T_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x - a)^k$$

is the **Taylor polynomial** of degree $n$ of $f$ about $a$. When $a = 0$ they are called the **Maclaurin series** and the **Maclaurin polynomials** of $f$.
:::

$T_n(x)$ reads "T n of x". $T_1(x) = f(a) + f'(a)(x - a)$ is the linearisation of [Section 7.2](module_07_EN.html#linear-approximation), and $T_n$ is said to have degree $n$ even when its last coefficient happens to be 0. Theorem 15.5 says that if $f$ has a power series about $a$, it is the Taylor series. It does not say that the Taylor series converges, or that its sum is $f$: Section 15.5 settles both questions.

### The standard series {#standard}

::: example The series of $e^x$
Find the Maclaurin series of $e^x$ and its radius of convergence.

Every derivative of $e^x$ is $e^x$ (Module 6), so $f^{(n)}(0) = e^0 = 1$ for every $n$, and the Maclaurin series is

$$\sum_{n=0}^\infty \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots.$$

By Example 15.2 it converges for every $x$: $R = \infty$. Its Taylor polynomials $T_1(x) = 1 + x$ and $T_2(x) = 1 + x + \tfrac12 x^2$ are the approximations of Example 7.13 ([Section 7.5](module_07_EN.html#the-rule)), where L'Hôpital's rule showed that $e^x - 1 - x \approx \tfrac12 x^2$ near 0. Section 15.5 proves that the series equals $e^x$ for every $x$; at $x = 1$ it gives $e = 1 + 1 + \tfrac{1}{2!} + \tfrac{1}{3!} + \cdots$.

```check
same([diff(exp(x), x, j).subs(x, 0) for j in range(8)], [1]*8)
same(series(exp(x), x, 0, 10).removeO(), sum(x**j/factorial(j) for j in range(10)))
same(sum(x**j/factorial(j) for j in range(3)), 1 + x + x**2/2); limit_is((exp(x) - 1 - x)/x**2, x, 0, Rational(1, 2))
```
:::

::: example The series of $\sin x$ and $\cos x$
Find the Maclaurin series of $\sin x$ and of $\cos x$, and their radii of convergence.

The derivatives of $\sin x$ are $\cos x$, $-\sin x$, $-\cos x$, $\sin x$, and then the cycle of four repeats. At 0 the values of $\sin x$ and its derivatives are $0, 1, 0, -1, 0, 1, 0, -1, \dots$. So only odd powers appear, with alternating signs:

$$\sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots = \sum_{n=0}^\infty (-1)^n \frac{x^{2n+1}}{(2n + 1)!}.$$

For $\cos x$ the values at 0 are $1, 0, -1, 0, 1, \dots$, and only even powers appear:

$$\cos x = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots = \sum_{n=0}^\infty (-1)^n \frac{x^{2n}}{(2n)!}.$$

(The equals signs anticipate Section 15.5, which proves them; so far these are the Maclaurin series.) For the sine series, the ratio of two consecutive nonzero terms is

$$\abs{\frac{x^{2n+3}/(2n + 3)!}{x^{2n+1}/(2n + 1)!}} = \frac{x^2}{(2n + 2)(2n + 3)} \to 0,$$

so it converges for every $x$, and the cosine series likewise: $R = \infty$ for both. Each series is the term-by-term derivative of the other, up to a sign, as $(\sin x)' = \cos x$ and $(\cos x)' = -\sin x$ require. And the odd function $\sin$ has only odd powers, the even function $\cos$ only even ones.

```check
same([diff(sin(x), x, j).subs(x, 0) for j in range(8)], [0, 1, 0, -1, 0, 1, 0, -1])
same([diff(cos(x), x, j).subs(x, 0) for j in range(8)], [1, 0, -1, 0, 1, 0, -1, 0])
same(series(sin(x), x, 0, 16).removeO(), sum((-1)**j*x**(2*j + 1)/factorial(2*j + 1) for j in range(8)))
same(series(cos(x), x, 0, 16).removeO(), sum((-1)**j*x**(2*j)/factorial(2*j) for j in range(8)))
nT = symbols('n', integer=True, nonnegative=True)
same((x**(2*nT + 3)/factorial(2*nT + 3))/(x**(2*nT + 1)/factorial(2*nT + 1)), x**2/((2*nT + 2)*(2*nT + 3)))
limit_is(x**2/((2*n + 2)*(2*n + 3)), n, oo, 0)
sinser = sum((-1)**j*x**(2*j + 1)/factorial(2*j + 1) for j in range(8)); cosser = sum((-1)**j*x**(2*j)/factorial(2*j) for j in range(8))
same(diff(sinser, x), cosser); same(expand(diff(cosser, x) + sinser), (-1)**7*x**15/factorial(15))   # up to the last term kept
```
:::

::: example A Taylor polynomial about 4
Find the Taylor polynomial $T_3$ of $\sqrt x$ about 4, and use $T_1$, $T_2$ and $T_3$ to estimate $\sqrt{4.1}$.

The derivatives of $f(x) = x^{1/2}$ come from the power rule:

$$\begin{aligned} f'(x) &= \tfrac12 x^{-1/2}, & f''(x) &= -\tfrac14 x^{-3/2}, \\ f'''(x) &= \tfrac38 x^{-5/2}. & & \end{aligned}$$

At 4, since $4^{1/2} = 2$, $4^{3/2} = 8$ and $4^{5/2} = 32$, the values are $f(4) = 2$, $f'(4) = \tfrac14$, $f''(4) = -\tfrac{1}{32}$ and $f'''(4) = \tfrac{3}{256}$. Divide by $0!$, $1!$, $2!$ and $3!$:

$$T_3(x) = 2 + \frac{x - 4}{4} - \frac{(x - 4)^2}{64} + \frac{(x - 4)^3}{512},$$

and $T_1$ and $T_2$ are its first two and three terms. At $x = 4.1$, where $x - 4 = 0.1$,

$$\begin{aligned} T_1(4.1) &= 2.025, \\ T_2(4.1) &= 2.025 - 0.00015625 = 2.02484375, \\ T_3(4.1) &= 2.02484375 + 0.000001953125 \approx 2.0248457. \end{aligned}$$

A calculator gives $\sqrt{4.1} \approx 2.02484567$: the errors are about $-1.5 \times 10^{-4}$, $1.9 \times 10^{-6}$ and $-3.0 \times 10^{-8}$. Each new term gains about two correct digits here. $T_1$ is the linearisation of Example 7.5.

```check
fs_ = sqrt(x)
same(diff(fs_, x), x**Rational(-1, 2)/2); same(diff(fs_, x, 2), -x**Rational(-3, 2)/4); same(diff(fs_, x, 3), Rational(3, 8)*x**Rational(-5, 2))
same([diff(fs_, x, j).subs(x, 4) for j in range(4)], [2, Rational(1, 4), -Rational(1, 32), Rational(3, 256)])
same(4**Rational(3, 2), 8); same(4**Rational(5, 2), 32)
T3s = 2 + (x - 4)/4 - (x - 4)**2/64 + (x - 4)**3/512
same(series(fs_, x, 4, 4).removeO(), T3s)
same(sum(diff(fs_, x, j).subs(x, 4)/factorial(j)*(x - 4)**j for j in range(4)), T3s)
v41 = Rational(41, 10)
T1s, T2s = 2 + (x - 4)/4, 2 + (x - 4)/4 - (x - 4)**2/64
same(T1s.subs(x, v41), Rational(2025, 1000)); same(Rational(1, 100)/64, Rational(15625, 10**8)); same(T2s.subs(x, v41), Rational(202484375, 10**8))
same(Rational(1, 1000)/512, Rational(1953125, 10**12)); rounds(T3s.subs(x, v41), '2.0248457'); rounds(sqrt(v41), '2.02484567')
rounds(sqrt(v41) - T1s.subs(x, v41), '-1.5e-4'); rounds(sqrt(v41) - T2s.subs(x, v41), '1.9e-6'); rounds(sqrt(v41) - T3s.subs(x, v41), '-3.0e-8')
```
:::

**The binomial series.** For any real number $k$ and $x > -1$, the derivatives of $f(x) = (1 + x)^k$ follow from the power rule of Module 6:

$$\begin{aligned} f'(x) &= k(1 + x)^{k-1}, \\ f''(x) &= k(k - 1)(1 + x)^{k-2}, \end{aligned}$$

and in general $f^{(n)}(x) = k(k - 1)\cdots(k - n + 1)(1 + x)^{k-n}$. At 0, $f^{(n)}(0) = k(k - 1)\cdots(k - n + 1)$, so the Maclaurin coefficients are the **binomial coefficients**

$$\binom{k}{n} = \frac{k(k - 1)\cdots(k - n + 1)}{n!}, \qquad \binom{k}{0} = 1,$$

read "k choose n". The Maclaurin series of $(1 + x)^k$ is the **binomial series**

$$\sum_{n=0}^\infty \binom{k}{n}x^n = 1 + kx + \frac{k(k - 1)}{2!}x^2 + \frac{k(k - 1)(k - 2)}{3!}x^3 + \cdots.$$

When $k$ is a whole number, $k \ge 0$, every coefficient with $n > k$ contains the factor $k - k = 0$, so the series stops: it is the binomial theorem of algebra, as in $(1 + x)^3 = 1 + 3x + 3x^2 + x^3$. For every other $k$ no coefficient is 0, and the ratio test gives

$$\abs{\frac{\binom{k}{n+1}x^{n+1}}{\binom{k}{n}x^n}} = \frac{\abs{k - n}}{n + 1}\,\abs{x} \to \abs{x},$$

so the radius of convergence is 1.

```check
same(diff((1 + x)**k, x, 3), k*(k - 1)*(k - 2)*(1 + x)**(k - 3))
same([expand_func(binomial(k, j)) for j in range(4)], [1, k, k*(k - 1)/2, k*(k - 1)*(k - 2)/6])
same(series((1 + x)**k, x, 0, 6).removeO(), sum(binomial(k, j)*x**j for j in range(6)))
same(expand((1 + x)**3), 1 + 3*x + 3*x**2 + x**3); same([binomial(3, j) for j in range(4, 8)], [0, 0, 0, 0])
nB = symbols('n', integer=True, nonnegative=True)
same(expand_func(binomial(k, nB + 1)/binomial(k, nB)), (k - nB)/(nB + 1))
limit_is((k - n)/(n + 1), n, oo, -1)                        # the ratio's size tends to 1
```

::: theorem The binomial series
For every real number $k$ and every $x$ with $\abs{x} < 1$,

$$(1 + x)^k = \sum_{n=0}^\infty \binom{k}{n}x^n.$$
:::

::: proof
Let $g(x)$ be the sum of the series for $\abs{x} < 1$. By Theorem 15.2, renaming $n - 1$ as $n$,

$$g'(x) = \sum_{n=1}^\infty n\binom{k}{n}x^{n-1} = \sum_{n=0}^\infty (n + 1)\binom{k}{n+1}x^n.$$

From the definition, $\binom{k}{n+1} = \binom{k}{n}\dfrac{k - n}{n + 1}$, so $(n + 1)\binom{k}{n+1} = (k - n)\binom{k}{n}$. Also $x\,g'(x) = \sum n\binom{k}{n}x^n$ (the term with $n = 0$ is 0). Adding,

$$(1 + x)\,g'(x) = \sum_{n=0}^\infty \big[(k - n) + n\big]\binom{k}{n}x^n = k\,g(x).$$

Now let $h(x) = g(x)(1 + x)^{-k}$. By the product rule,

$$\begin{aligned} h'(x) &= g'(x)(1 + x)^{-k} - k\,g(x)(1 + x)^{-k-1} \\ &= (1 + x)^{-k-1}\big[(1 + x)g'(x) - k\,g(x)\big] = 0 \end{aligned}$$

for $\abs{x} < 1$. A function whose derivative is 0 on an interval is constant (Module 8), so $h(x) = h(0) = g(0) = 1$, that is, $g(x) = (1 + x)^k$.
:::

```check
same(expand_func(binomial(k, nB)*(k - nB)/(nB + 1)), expand_func(binomial(k, nB + 1)))
wP = symbols('w', positive=True); gf = Function('g')          # w stands for 1 + x, positive for |x| < 1
same(diff(gf(wP)*wP**(-k), wP), wP**(-k - 1)*(wP*diff(gf(wP), wP) - k*gf(wP)))
Ncoef = 7    # the coefficients of (1 + x) g' and of k g agree, power by power
gp = sum(binomial(k, j)*x**j for j in range(Ncoef + 2))
lhs = expand((1 + x)*diff(gp, x)); rhs = expand(k*gp)
same([expand_func(lhs.coeff(x, j)) for j in range(Ncoef)], [expand_func(rhs.coeff(x, j)) for j in range(Ncoef)])
```

Whether the binomial series converges at $x = \pm1$ depends on $k$: for $k = \tfrac12$ it converges at both ends, and for $k = -1$, where it is the geometric series of $1/(1 + x)$, at neither.

```check
same(series((1 + x)**-1, x, 0, 8).removeO(), sum((-1)**j*x**j for j in range(8)))
same([binomial(-1, j) for j in range(6)], [1, -1, 1, -1, 1, -1])            # k = -1: terms of size 1 at x = 1 and x = -1
for N_ in (1, 2, 5, 10, 20):                                                    # k = 1/2:
    same(binomial(Rational(1, 2), N_), (-1)**(N_ - 1)*binomial(2*N_, N_)/(4**N_*(2*N_ - 1)))   # so |C(1/2, n)| <= 1/(2n - 1) -> 0
    same(sum(binomial(Rational(1, 2), j)*(-1)**j for j in range(N_ + 1)), binomial(2*N_, N_)/4**N_)   # x = -1: partial sums positive
holds(all(binomial(Rational(1, 2), j)*(-1)**j < 0 for j in range(1, 30)))     # ... and decreasing: they converge (monotone convergence)
holds(all(Abs(binomial(Rational(1, 2), j + 1)) < Abs(binomial(Rational(1, 2), j)) for j in range(1, 30)))   # x = 1: alternating, decreasing
```

::: example Two binomial series
Find the first four terms of the binomial series of (a) $\sqrt{1 + x}$ and (b) $\dfrac{1}{\sqrt{1 - x}}$.

**(a)** Here $k = \tfrac12$:

$$\binom{1/2}{1} = \frac12, \quad \binom{1/2}{2} = \frac{\tfrac12\cdot\big(-\tfrac12\big)}{2} = -\frac18, \quad \binom{1/2}{3} = \frac{\tfrac12\cdot\big(-\tfrac12\big)\cdot\big(-\tfrac32\big)}{6} = \frac{1}{16},$$

so for $\abs{x} < 1$

$$\sqrt{1 + x} = 1 + \frac{x}{2} - \frac{x^2}{8} + \frac{x^3}{16} - \cdots.$$

**(b)** Now $k = -\tfrac12$, with $-x$ in place of $x$. The coefficients are $\binom{-1/2}{1} = -\tfrac12$, $\binom{-1/2}{2} = \tfrac{(-1/2)(-3/2)}{2} = \tfrac38$ and $\binom{-1/2}{3} = \tfrac{(-1/2)(-3/2)(-5/2)}{6} = -\tfrac{5}{16}$, and multiplying by $(-x)^n$ makes every sign positive:

$$\frac{1}{\sqrt{1 - x}} = 1 + \frac{x}{2} + \frac{3x^2}{8} + \frac{5x^3}{16} + \cdots, \qquad \abs{x} < 1.$$

The first two terms of (a) are the linearisation $\sqrt{1 + x} \approx 1 + \tfrac12 x$; the third term shows that it is slightly too large, by about $\tfrac18 x^2$. Series (b) returns in Section 15.6, in Einstein's formula for kinetic energy.

```check
same([binomial(Rational(1, 2), j) for j in range(4)], [1, Rational(1, 2), -Rational(1, 8), Rational(1, 16)])
same(series(sqrt(1 + x), x, 0, 4).removeO(), 1 + x/2 - x**2/8 + x**3/16)
same([binomial(-Rational(1, 2), j) for j in range(4)], [1, -Rational(1, 2), Rational(3, 8), -Rational(5, 16)])
same([binomial(-Rational(1, 2), j)*(-1)**j for j in range(4)], [1, Rational(1, 2), Rational(3, 8), Rational(5, 16)])
same(series(1/sqrt(1 - x), x, 0, 4).removeO(), 1 + x/2 + 3*x**2/8 + 5*x**3/16)
holds(series(sqrt(1 + x) - (1 + x/2), x, 0, 3).removeO() == -x**2/8)
```
:::

The series of this section and the last make a short list worth knowing by heart:

| Function | Maclaurin series | Equals the function for |
|---|---|---|
| $\dfrac{1}{1 - x}$ | $\displaystyle\sum_{n=0}^\infty x^n = 1 + x + x^2 + \cdots$ | $-1 < x < 1$ |
| $\ln(1 + x)$ | $\displaystyle\sum_{n=1}^\infty (-1)^{n-1}\frac{x^n}{n} = x - \frac{x^2}{2} + \frac{x^3}{3} - \cdots$ | $-1 < x \le 1$ |
| $\arctan x$ | $\displaystyle\sum_{n=0}^\infty (-1)^n\frac{x^{2n+1}}{2n + 1} = x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots$ | $-1 \le x \le 1$ |
| $e^x$ | $\displaystyle\sum_{n=0}^\infty \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \cdots$ | every $x$ |
| $\sin x$ | $\displaystyle\sum_{n=0}^\infty (-1)^n\frac{x^{2n+1}}{(2n + 1)!} = x - \frac{x^3}{3!} + \cdots$ | every $x$ |
| $\cos x$ | $\displaystyle\sum_{n=0}^\infty (-1)^n\frac{x^{2n}}{(2n)!} = 1 - \frac{x^2}{2!} + \cdots$ | every $x$ |
| $(1 + x)^k$ | $\displaystyle\sum_{n=0}^\infty \binom{k}{n}x^n = 1 + kx + \cdots$ | $-1 < x < 1$, and for some $k$ also at $\pm1$ |

The last column for $e^x$, $\sin x$ and $\cos x$ is proved in Section 15.5 (Theorem 15.9).

```check
for f_, ser_ in ((1/(1 - x), sum(x**j for j in range(12))), (log(1 + x), sum((-1)**(j - 1)*x**j/j for j in range(1, 12))),
                 (atan(x), sum((-1)**j*x**(2*j + 1)/(2*j + 1) for j in range(6))), (exp(x), sum(x**j/factorial(j) for j in range(12))),
                 (sin(x), sum((-1)**j*x**(2*j + 1)/factorial(2*j + 1) for j in range(6))), (cos(x), sum((-1)**j*x**(2*j)/factorial(2*j) for j in range(6)))):
    same(series(f_, x, 0, 12).removeO(), ser_)
inside = lambda cond, pts: [bool(cond.subs(x, p_)) for p_ in pts]
pts_ = (-2, -1, 0, 1, 2)
g1_ = summation(x**n, (n, 0, oo)); same(g1_.args[0][0], 1/(1 - x)); same(inside(g1_.args[0][1], pts_), [False, False, True, False, False])
g3_ = summation((-1)**n*x**(2*n + 1)/(2*n + 1), (n, 0, oo)); same(g3_.args[0][0], atan(x)); same(inside(g3_.args[0][1], pts_), [False, True, True, True, False])
```

::: keyidea
A handful of series generate almost all the others: the geometric series, the series of $e^x$, $\sin x$ and $\cos x$, and the binomial series. New series come from these by substituting, multiplying by a power of $x$, differentiating and integrating, which is usually far quicker than computing derivatives, and by uniqueness (Theorem 15.5) the result is the Taylor series.
:::

::: pitfall
A Taylor series needs every derivative at its centre. $\sqrt x$ has no Maclaurin series, because $\sqrt x$ has no derivative at 0, and $\ln x$ has none either, because it is not defined at 0. Use another centre ($\sqrt x$ about 4, $\ln x$ about 1), or shift the function ($\sqrt{1 + x}$, $\ln(1 + x)$).
:::

Series give values of integrals that no antiderivative can: Module 11 met functions such as $e^{-x^2}$, whose antiderivatives are not elementary.

::: example An integral with no elementary antiderivative
Find $\displaystyle\int_0^1 e^{-x^2}\,dx$ to three decimal places.

Substitute $u = -x^2$ in the series of $e^u$, which converges for every $u$:

$$e^{-x^2} = \sum_{n=0}^\infty \frac{(-x^2)^n}{n!} = 1 - x^2 + \frac{x^4}{2!} - \frac{x^6}{3!} + \cdots.$$

Integrate term by term from 0 to 1 (Theorem 15.2, with $R = \infty$):

$$\int_0^1 e^{-x^2}\,dx = \sum_{n=0}^\infty \frac{(-1)^n}{(2n + 1)\,n!} = 1 - \frac13 + \frac{1}{10} - \frac{1}{42} + \frac{1}{216} - \frac{1}{1320} + \frac{1}{9360} - \cdots.$$

The terms alternate in sign and decrease in size to 0, so the alternating series bound applies: the sum of the first six terms, $0.746729$ to six places, differs from the integral by less than the seventh term, $1/9360 < 0.00011$. So the integral lies between 0.74672 and 0.74684, and to three decimal places it is 0.747. This integral is the area under the bell curve of the normal distribution (Module 12) between its centre and one unit to the right, apart from the scaling factors of the distribution.

```check
same(series(exp(-x**2), x, 0, 12).removeO(), sum((-x**2)**j/factorial(j) for j in range(6)))
same(integrate(sum((-x**2)**j/factorial(j) for j in range(8)), (x, 0, 1)), sum(Rational((-1)**j, (2*j + 1)*factorial(j)) for j in range(8)))
same([Rational(1, (2*j + 1)*factorial(j)) for j in range(7)], [1, Rational(1, 3), Rational(1, 10), Rational(1, 42), Rational(1, 216), Rational(1, 1320), Rational(1, 9360)])
s6 = sum(Rational((-1)**j, (2*j + 1)*factorial(j)) for j in range(6)); rounds(s6, '0.746729')
I01 = integrate(exp(-x**2), (x, 0, 1)); holds(Abs(I01 - s6) < Rational(1, 9360)); holds(Rational(1, 9360) < Rational(11, 100000))
holds(Rational(74672, 100000) < s6); holds(s6 + Rational(1, 9360) < Rational(74684, 100000)); rounds(I01, '0.747')
holds(all(Rational(1, (2*j + 3)*factorial(j + 1)) < Rational(1, (2*j + 1)*factorial(j)) for j in range(20)))
```
:::

::: compute Taylor series with SymPy
SymPy's `series` computes Taylor series. Its arguments are the expression, the variable, the centre and the order of the first term left out:

```python
import sympy as sp
x = sp.symbols('x')
print(sp.series(sp.exp(x), x, 0, 6))
print(sp.series(sp.sin(x), x, 0, 8).removeO())
print(sp.series(sp.sqrt(x), x, 4, 3))
```

```output
1 + x + x**2/2 + x**3/6 + x**4/24 + x**5/120 + O(x**6)
-x**7/5040 + x**5/120 - x**3/6 + x
1 - (x - 4)**2/64 + x/4 + O((x - 4)**3, (x, 4))
```

`O(x**6)`, read "big O of x to the 6", stands for the terms of degree 6 and higher that were left out, as in the big-O notation of Module 4. `.removeO()` drops it and leaves a Taylor polynomial, here $T_7$ of $\sin x$, which SymPy prints with the highest power first. The third line is $T_2$ of $\sqrt x$ about 4, from Example 15.9, with the polynomial rearranged: $2 + \tfrac{x - 4}{4}$ is $1 + \tfrac{x}{4}$. SymPy also handles a symbolic exponent, and functions whose coefficients you would not want to compute by hand:

```python
k = sp.symbols('k')
print(sp.series((1 + x)**k, x, 0, 4))
print(sp.series(sp.tan(x), x, 0, 10))
```

```output
1 + k*x + k*x**2*(k - 1)/2 + k*x**3*(k - 2)*(k - 1)/6 + O(x**4)
x + x**3/3 + 2*x**5/15 + 17*x**7/315 + 62*x**9/2835 + O(x**10)
```

The first line is the binomial series. The coefficients of $\tan x$ follow no simple pattern, and its series converges only for $\abs{x} < \pi/2$. Mind the order of the arguments: the third is the centre, not the number of terms.

```python
print(sp.series(sp.exp(x), x, 4))
```

```output
exp(4) + (x - 4)*exp(4) + (x - 4)**2*exp(4)/2 + (x - 4)**3*exp(4)/6 + (x - 4)**4*exp(4)/24 + (x - 4)**5*exp(4)/120 + O((x - 4)**6, (x, 4))
```

With no fourth argument, SymPy expands about the centre 4 with its default order 6, that is, up to $(x - 4)^5$. This is the Taylor series of $e^x$ about 4: every coefficient is $e^4/n!$, since every derivative of $e^x$ at 4 is $e^4$.
:::

```check
same(series(tan(x), x, 0, 10).removeO(), x + x**3/3 + 2*x**5/15 + 17*x**7/315 + 62*x**9/2835)
same(series(exp(x), x, 4, 6).removeO(), sum(E**4*(x - 4)**j/factorial(j) for j in range(6)))
same(1 + x/4, 2 + (x - 4)/4); same(series(sqrt(x), x, 4, 3).removeO(), 2 + (x - 4)/4 - (x - 4)**2/64)
```

### Taylor polynomials {#taylor-polynomials}

In practice nobody sums a whole series: you stop at some $T_n$. Figure 15.2 shows how the Maclaurin polynomials of $\sin x$,

$$T_1(x) = x, \qquad T_3(x) = x - \frac{x^3}{6}, \qquad T_5(x) = x - \frac{x^3}{6} + \frac{x^5}{120},$$

approximate it. (Since every even coefficient is 0, $T_2 = T_1$ and $T_4 = T_3$.) Each hugs the curve around 0, and the higher the degree, the wider the stretch on which it does.

::: figure id=fig-15-2
Left: $\sin x$ (blue) and its Maclaurin polynomials $T_1$, $T_3$ and $T_5$. Each hugs the curve near 0, over a wider stretch as the degree grows, and then turns away. Right: the errors $\abs{\sin x - T_n(x)}$ for $0.01 \le x \le 2$, on logarithmic scales. They lie close to straight lines of slopes 3, 5 and 7: halving $x$ divides the error of $T_n$ by about $2^{n+2}$.
:::

```valuetable
x = 0.1, 0.5, 1, 2, 3
$\sin x$ = sin(x)
$T_1(x)$ = x
$T_3(x)$ = x - x**3/6
$T_5(x)$ = x - x**3/6 + x**5/120
digits = 6
---
x | \sin x | T_1(x) | T_3(x) | T_5(x)
0.1 | 0.0998334 | 0.1 | 0.0998333 | 0.0998334
0.5 | 0.479426 | 0.5 | 0.479167 | 0.479427
1 | 0.841471 | 1 | 0.833333 | 0.841667
2 | 0.909297 | 2 | 0.666667 | 0.933333
3 | 0.141120 | 3 | -1.5 | 0.525
```

At $x = 0.1$, $T_5$ agrees with $\sin x$ in all six digits shown, and $T_3$ in five. Farther from 0 more terms are needed: at $x = 2$, $T_5$ is off by 0.024, and at $x = 3$ by 0.38, while $T_1$ is off by almost 3.

```check
same(series(sin(x), x, 0, 6).removeO(), x - x**3/6 + x**5/120)
rounds(Rational(1, 10) - Rational(1, 10)**3/6 + Rational(1, 10)**5/120 - sin(Rational(1, 10)), '0.0000000')
rounds(sin(Rational(1, 10)), '0.0998334'); rounds(Rational(1, 10) - Rational(1, 10)**3/6, '0.0998333')
T5_ = lambda v: v - v**3/6 + v**5/120
rounds(T5_(2) - sin(2), '0.024'); rounds(T5_(3) - sin(3), '0.38'); holds(Rational(28, 10) < 3 - sin(3)); holds(3 - sin(3) < 3)
for n_, slope_ in ((1, 3), (3, 5), (5, 7)):                   # the error of T_n near 0 is about x^(n+2)/(n+2)!
    Tn_ = series(sin(x), x, 0, n_ + 1).removeO()
    limit_is((sin(x) - Tn_)/x**slope_, x, 0, (-1)**((n_ + 1)//2)/factorial(slope_))
    same(Rational(2)**slope_, 2**(n_ + 2))
```

Why do Taylor polynomials fit so well? Because $T_n$ has the same value and the same first $n$ derivatives at $a$ as $f$: differentiating $T_n$ $k$ times and putting $x = a$ leaves $k!$ times its $k$th coefficient, which is $f^{(k)}(a)$, for every $k \le n$. $T_1$ matches the value and the slope, so it is the tangent line; $T_2$ matches the second derivative too, which decides how the graph bends (Module 8); and so on. No other polynomial of degree at most $n$ does this, because the derivatives of a polynomial at $a$ fix its coefficients (Theorem 15.5 holds for polynomials, whose series stop).

```check
for n_ in (1, 3, 5):
    Tn_ = series(sin(x), x, 0, n_ + 1).removeO()
    same([diff(Tn_, x, j).subs(x, 0) for j in range(n_ + 1)], [diff(sin(x), x, j).subs(x, 0) for j in range(n_ + 1)])
same([diff(T3s, x, j).subs(x, 4) for j in range(4)], [diff(sqrt(x), x, j).subs(x, 4) for j in range(4)])
```

::: widget name=taylor-explorer
Choose a function, then raise the degree $n$ from 0 and watch $T_n$ (orange) close in on $f$ (blue) over a wider and wider stretch around the centre $a$. The readout compares $T_n(x_0)$ with $f(x_0)$ at the probe point $x_0$. For $e^x$, $\sin x$ and $\cos x$ the error at any $x_0$ shrinks to 0 as $n$ grows; move the centre too. For the other four functions, the green band is the interval of convergence: put $x_0$ outside it (try $\ln(1 + x)$ with $x_0 = 1.5$) and raise $n$, and the error grows instead of shrinking. Move the centre of $\arctan x$ away from 0 and note the radius $\sqrt{1 + a^2}$; Section 15.7 explains it.
:::

## Taylor's theorem {#taylor-theorem}

A Taylor polynomial is useful only when you know how far it is from the function. The difference

$$R_n(x) = f(x) - T_n(x)$$

is the **remainder** of degree $n$ ($R_n(x)$ reads "R n of x"). Since $T_n(x)$ is a partial sum of the Taylor series, $f(x)$ equals the sum of its Taylor series exactly when $R_n(x) \to 0$ as $n \to \infty$. Taylor's theorem gives a formula for the remainder.

::: theorem Taylor's theorem
Let $n \ge 0$ be a whole number, and let $f$ have derivatives up to order $n + 1$ on an open interval $I$ that contains $a$. Then for every $x$ in $I$,

$$f(x) = T_n(x) + R_n(x), \qquad R_n(x) = \frac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n+1},$$

for some number $c$ between $a$ and $x$ (with $c = a$ if $x = a$).
:::

This form of $R_n$ is the **Lagrange form** of the remainder. For $n = 0$ the theorem says $f(x) = f(a) + f'(c)(x - a)$, the Mean Value Theorem: Taylor's theorem is the Mean Value Theorem with more terms. The remainder looks like the next term of the Taylor series, $\dfrac{f^{(n+1)}(a)}{(n + 1)!}(x - a)^{n+1}$, except that the derivative is taken at an unknown point $c$ instead of at $a$.

::: proof
If $x = a$, both sides equal $f(a)$. So let $x \ne a$, and let $K$ be the number for which

$$f(x) = T_n(x) + \frac{K}{(n + 1)!}(x - a)^{n+1};$$

it exists because $(x - a)^{n+1} \ne 0$. The task is to show that $K = f^{(n+1)}(c)$ for some $c$ between $a$ and $x$. Keep $x$ fixed, and define, for $t$ in the closed interval between $a$ and $x$,

$$g(t) = f(x) - \sum_{k=0}^{n} \frac{f^{(k)}(t)}{k!}(x - t)^k - \frac{K}{(n + 1)!}(x - t)^{n+1}.$$

At $t = x$ every term of the sum with $k \ge 1$ is 0, and the term with $k = 0$ is $f(x)$, so $g(x) = 0$; and $g(a) = 0$ by the choice of $K$. Now differentiate with respect to $t$. The term with $k = 0$, $f(t)$, has derivative $f'(t)$, and by the product rule the term with $k \ge 1$ has derivative

$$\frac{f^{(k+1)}(t)}{k!}(x - t)^k - \frac{f^{(k)}(t)}{(k - 1)!}(x - t)^{k-1}.$$

Added up, the second part of each of these cancels the first part of the one before: the sum **telescopes**, and only $\dfrac{f^{(n+1)}(t)}{n!}(x - t)^n$ survives. So

$$g'(t) = -\frac{f^{(n+1)}(t)}{n!}(x - t)^n + \frac{K}{n!}(x - t)^n = \frac{(x - t)^n}{n!}\big(K - f^{(n+1)}(t)\big).$$

The function $g$ is differentiable, and $g(a) = g(x) = 0$, so by Rolle's theorem (Module 8) $g'(c) = 0$ for some $c$ strictly between $a$ and $x$. There $(x - c)^n \ne 0$, so $K = f^{(n+1)}(c)$.
:::

```check
Kc = symbols('K'); fT = Function('f')
for N_ in range(5):
    gT = fT(x) - sum(diff(fT(t), t, j)/factorial(j)*(x - t)**j for j in range(N_ + 1)) - Kc/factorial(N_ + 1)*(x - t)**(N_ + 1)
    same(diff(gT, t), (x - t)**N_/factorial(N_)*(Kc - diff(fT(t), t, N_ + 1)))
    same(gT.subs(t, x).doit(), 0)
for J_ in range(1, 5):                     # the derivative of the k-th term, k >= 1
    same(diff(diff(fT(t), t, J_)/factorial(J_)*(x - t)**J_, t), diff(fT(t), t, J_ + 1)/factorial(J_)*(x - t)**J_ - diff(fT(t), t, J_)/factorial(J_ - 1)*(x - t)**(J_ - 1))
cE = log(24*(E - Rational(8, 3)))          # the point c for e^x, n = 3, x = 1
same(exp(cE)/factorial(4), E - Rational(8, 3)); holds(0 < cE); holds(cE < 1); rounds(cE, '0.214'); rounds(E - Rational(8, 3), '0.0516')
```

For example, for $e^x$ with $a = 0$, $n = 3$ and $x = 1$, $R_3(1) = e - \tfrac83 \approx 0.0516$, and the theorem promises a $c$ between 0 and 1 with $e^c/4! = R_3(1)$: it is $c = \ln\big(24(e - \tfrac83)\big) \approx 0.214$. In practice $c$ is unknown, and a bound is all you need.

::: keyidea
**Taylor's inequality.** If $\abs{f^{(n+1)}(t)} \le M$ for every $t$ between $a$ and $x$, then

$$\abs{f(x) - T_n(x)} \le \frac{M}{(n + 1)!}\,\abs{x - a}^{n+1}.$$
:::

Taylor's theorem also says how good $T_n$ is near $a$. Suppose $f^{(n+1)}$ is continuous on $I$. On a closed interval around $a$ inside $I$ it is bounded, say by $M$ (the Extreme Value Theorem of Module 3), and for $x \ne a$ in that interval

$$\abs{\frac{f(x) - T_n(x)}{(x - a)^n}} \le \frac{M}{(n + 1)!}\,\abs{x - a} \to 0 \quad\text{as } x \to a.$$

So the error of $T_n$ is small even compared with $(x - a)^n$; for $n = 1$ this is Theorem 7.1. In this sense $T_n$ is the best polynomial approximation of degree $n$ near $a$. No other polynomial $p$ of degree at most $n$ does as well: if $\big(f(x) - p(x)\big)/(x - a)^n$ also tended to 0, then so would $q(x)/(x - a)^n$, where $q = T_n - p$. Write $q(x) = d_0 + d_1(x - a) + \cdots + d_n(x - a)^n$. Then $q(x)$, $q(x)/(x - a)$, …, $q(x)/(x - a)^{n-1}$ tend to 0 as well, being $q(x)/(x - a)^n$ times a power of $x - a$. The first limit is $d_0$, so $d_0 = 0$; then the second is $d_1$, so $d_1 = 0$; and so on up to $d_n = 0$. So $p = T_n$.

```check
dq = symbols('d0:4')
qq_ = sum(dq[j]*(x - a)**j for j in range(4))
same(limit(qq_, x, a), dq[0]); same(limit((qq_.subs(dq[0], 0))/(x - a), x, a), dq[1]); same(limit((qq_.subs({dq[0]: 0, dq[1]: 0}))/(x - a)**2, x, a), dq[2])
same(cancel((qq_.subs({dq[0]: 0, dq[1]: 0, dq[2]: 0}))/(x - a)**3), dq[3])
```

### Error bounds {#error-bounds}

::: example Two error bounds
(a) Bound the error of $T_5(0.5)$ as an estimate of $\sin 0.5$. (b) Bound the error of $T_2(4.1)$ as an estimate of $\sqrt{4.1}$ (Example 15.9), and decide whether $T_2(4.1)$ is too large or too small.

**(a)** Every derivative of $\sin$ is $\pm\sin$ or $\pm\cos$, so $M = 1$ will do for every $n$. With $n = 5$, Taylor's inequality gives $\abs{R_5(0.5)} \le 0.5^6/6! \approx 2.2 \times 10^{-5}$. You can do better. The coefficient of $x^6$ in the series of $\sin x$ is 0, so $T_5 = T_6$, and with $n = 6$

$$\abs{\sin 0.5 - T_5(0.5)} = \abs{R_6(0.5)} \le \frac{0.5^7}{7!} = \frac{0.0078125}{5040} \approx 1.55 \times 10^{-6}.$$

Indeed $T_5(0.5) = 0.5 - 0.0208333 + 0.0002604 = 0.4794271$, while $\sin 0.5 \approx 0.4794255$: the error is about $-1.54 \times 10^{-6}$, very close to the bound.

**(b)** Here $n = 2$ and $f'''(t) = \tfrac38 t^{-5/2}$, which decreases as $t$ grows, so on $[4, 4.1]$ it is largest at $t = 4$: $M = \tfrac38\cdot 4^{-5/2} = \tfrac{3}{256}$. So

$$\abs{\sqrt{4.1} - T_2(4.1)} \le \frac{3/256}{3!}\,(0.1)^3 = \frac{1}{512\,000} \approx 1.95 \times 10^{-6}.$$

The actual error is about $1.92 \times 10^{-6}$. The Lagrange form also gives the sign: $R_2(4.1) = \dfrac{f'''(c)}{3!}(0.1)^3$ with $f'''(c) > 0$, so the remainder is positive, and $T_2(4.1) = 2.02484375$ is slightly too small.

```check
rounds(Rational(1, 2)**6/factorial(6), '2.2e-5')
same(series(sin(x), x, 0, 7).removeO(), x - x**3/6 + x**5/120)        # T_6 = T_5
same(Rational(1, 2)**7, Rational(78125, 10**7)); same(factorial(7), 5040); rounds(Rational(1, 2)**7/factorial(7), '1.55e-6')
rounds(Rational(1, 2)**3/6, '0.0208333'); rounds(Rational(1, 2)**5/120, '0.0002604'); rounds(T5_(Rational(1, 2)), '0.4794271')
rounds(sin(Rational(1, 2)), '0.4794255'); rounds(sin(Rational(1, 2)) - T5_(Rational(1, 2)), '-1.54e-6')
holds(Abs(sin(Rational(1, 2)) - T5_(Rational(1, 2))) <= Rational(1, 2)**7/factorial(7))
f3 = diff(sqrt(x), x, 3); same(f3, Rational(3, 8)*x**Rational(-5, 2)); holds(diff(f3, x).subs(x, 4) < 0)
same(f3.subs(x, 4), Rational(3, 256))
same(Rational(3, 256)/factorial(3)*Rational(1, 10)**3, Rational(1, 512000)); rounds(Rational(1, 512000), '1.95e-6')
rounds(sqrt(v41) - T2s.subs(x, v41), '1.92e-6'); holds(sqrt(v41) - T2s.subs(x, v41) > 0)
holds(sqrt(v41) - T2s.subs(x, v41) <= Rational(1, 512000))
```
:::

::: example A polynomial for $e^x$ on $[-1, 1]$
Find a degree $n$ for which the Maclaurin polynomial $T_n$ of $e^x$ satisfies $\abs{e^x - T_n(x)} < 10^{-6}$ for every $x$ in $[-1, 1]$.

Every derivative of $e^x$ is $e^x$, and for $t$ between 0 and $x$, with $\abs{x} \le 1$, $e^t \le e^1 < 3$. So $M = 3$ will do, and

$$\abs{e^x - T_n(x)} \le \frac{3}{(n + 1)!}\abs{x}^{n+1} \le \frac{3}{(n + 1)!}.$$

This is less than $10^{-6}$ when $(n + 1)! > 3\,000\,000$. Since $9! = 362\,880$ and $10! = 3\,628\,800$, $n + 1 = 10$ is enough: $T_9$ is within $10^{-6}$ of $e^x$ on the whole interval. The bound is not wasteful here. At $x = 1$ the error of $T_8$ is about $3.1 \times 10^{-6}$, too large, while that of $T_9$ is about $3.0 \times 10^{-7}$.

```check
holds(E < 3); same(factorial(9), 362880); same(factorial(10), 3628800)
holds(Rational(3, factorial(10)) < Rational(1, 10**6)); holds(Rational(3, factorial(9)) > Rational(1, 10**6))
sE = lambda N: sum(Rational(1, factorial(j)) for j in range(N + 1))
rounds(E - sE(8), '3.1e-6'); rounds(E - sE(9), '3.0e-7'); holds(E - sE(8) > Rational(1, 10**6))
for xv in (-1, Rational(-1, 2), Rational(1, 2), 1):
    holds(Abs(exp(xv) - sum(Rational(xv)**j/factorial(j) for j in range(10))) < Rational(1, 10**6))
```
:::

::: pitfall
Taylor's inequality needs $M$ to bound $\abs{f^{(n+1)}}$ on the whole interval between $a$ and $x$, not only at $a$. For $e^x$ on $[0, 1]$, the bound $M = f^{(n+1)}(0) = 1$ is too small: at $x = 1$ it would promise $\abs{e - T_9(1)} \le 1/10! \approx 2.8 \times 10^{-7}$, but the error is $3.0 \times 10^{-7}$. Take the largest value of $\abs{f^{(n+1)}}$ on the interval, or any number above it.

```check
rounds(Rational(1, factorial(10)), '2.8e-7'); holds(E - sE(9) > Rational(1, factorial(10)))
```
:::

### Errors of earlier approximations {#earlier-errors}

Modules 4 and 7 stated how large the errors of three approximations are, and left the proofs to this module.

::: theorem Errors of the linearisation and of difference quotients
1. If $f''$ exists on an open interval containing $a$ and $x$, and $L$ is the linearisation of $f$ at $a$, then $f(x) - L(x) = \dfrac{f''(c)}{2}(x - a)^2$ for some $c$ between $a$ and $x$. If also $\abs{f''} \le M$ between $a$ and $x$, then $\abs{f(x) - L(x)} \le \dfrac{M}{2}(x - a)^2$.
2. Let $h > 0$. If $f''$ exists on an open interval containing $a$ and $a + h$, the error of the forward difference is
   $$\frac{f(a + h) - f(a)}{h} - f'(a) = \frac{h}{2}f''(c)$$
   for some $c$ between $a$ and $a + h$.
3. If $f'''$ exists and is continuous on an open interval containing $a - h$ and $a + h$, the error of the central difference is
   $$\frac{f(a + h) - f(a - h)}{2h} - f'(a) = \frac{h^2}{6}f'''(c)$$
   for some $c$ between $a - h$ and $a + h$.
:::

::: proof
Part 1 is Taylor's theorem with $n = 1$, since $T_1 = L$. For part 2, apply part 1 with $x = a + h$: $f(a + h) = f(a) + f'(a)h + \tfrac12 f''(c)h^2$; subtract $f(a)$, divide by $h$ and subtract $f'(a)$. For part 3, Taylor's theorem with $n = 2$ at $x = a + h$ and at $x = a - h$ gives

$$f(a \pm h) = f(a) \pm f'(a)h + \frac{f''(a)}{2}h^2 \pm \frac{f'''(c_\pm)}{6}h^3,$$

with $c_+$ between $a$ and $a + h$ and $c_-$ between $a - h$ and $a$. Subtract: the terms $f(a)$ and $\tfrac12 f''(a)h^2$ cancel, and

$$f(a + h) - f(a - h) = 2f'(a)h + \frac{f'''(c_+) + f'''(c_-)}{6}h^3.$$

Divide by $2h$ and subtract $f'(a)$: the error is $\dfrac{h^2}{6}$ times $\tfrac12\big(f'''(c_+) + f'''(c_-)\big)$, the average of two values of $f'''$. The average lies between the two values, so, $f'''$ being continuous, the Intermediate Value Theorem (Module 3) gives a $c$ between $c_-$ and $c_+$ at which $f'''(c)$ equals it.
:::

```check
fd = Function('f'); f2a, f3p, f3m, cc_ = symbols('f2a f3p f3m c')
Tp = fd(a) + diff(fd(a), a)*h + f2a/2*h**2 + f3p/6*h**3          # f(a + h), Lagrange form, f''(a) = f2a, f'''(c+) = f3p
Tm = fd(a) - diff(fd(a), a)*h + f2a/2*h**2 - f3m/6*h**3          # f(a - h)
same(expand(Tp - Tm), expand(2*diff(fd(a), a)*h + (f3p + f3m)/6*h**3))
same(expand((Tp - Tm)/(2*h) - diff(fd(a), a)), expand(h**2/6*(f3p + f3m)/2))
same(expand(((fd(a) + diff(fd(a), a)*h + cc_/2*h**2) - fd(a))/h - diff(fd(a), a)), h/2*cc_)
a0 = Rational(1, 2)
for fn_ in (exp(x), sin(x), x**4):                                 # instances at a = 1/2: the errors are about (h/2) f''(a) and (h^2/6) f'''(a)
    limit_is(((fn_.subs(x, a0 + h) - fn_.subs(x, a0))/h - diff(fn_, x).subs(x, a0))/h, h, 0, diff(fn_, x, 2).subs(x, a0)/2)
    limit_is(((fn_.subs(x, a0 + h) - fn_.subs(x, a0 - h))/(2*h) - diff(fn_, x).subs(x, a0))/h**2, h, 0, diff(fn_, x, 3).subs(x, a0)/6)
```

As $h \to 0$ in part 2, $c$ is squeezed towards $a$, so if $f''$ is continuous at $a$ the error is about $\tfrac{h}{2}f''(a)$; and if $\abs{f''} \le M$ near $a$, it is at most $\tfrac{M}{2}h$, so it is $O(h)$. In the same way the error in part 3 is about $\tfrac{h^2}{6}f'''(a)$, and it is $O(h^2)$. These are the claims of [Section 4.7](module_04_EN.html#truncation). Part 1 gives both claims of [Section 7.2](module_07_EN.html#how-good): the bound $\tfrac{M}{2}(x - a)^2$, and, when $f''$ is continuous at $a$, $f(x) - L(x) \approx \tfrac{f''(a)}{2}(x - a)^2$, because $\dfrac{f(x) - L(x)}{(x - a)^2} = \dfrac{f''(c)}{2} \to \dfrac{f''(a)}{2}$ as $x \to a$.

Newton's method of Module 7 is a third beneficiary. Let $f(r) = 0$, and let $e_n = x_n - r$ be the error of the $n$th iterate. Taylor's theorem of degree 1 about $x_n$, evaluated at $r$, gives

$$0 = f(r) = f(x_n) + f'(x_n)(r - x_n) + \frac{f''(c_n)}{2}(r - x_n)^2$$

for some $c_n$ between $x_n$ and $r$. Divide by $f'(x_n)$, and use $x_{n+1} = x_n - f(x_n)/f'(x_n)$, so that $f(x_n)/f'(x_n) = x_n - x_{n+1}$:

$$e_{n+1} = \frac{f''(c_n)}{2f'(x_n)}\,e_n^2.$$

Module 7 found this relation approximately, with $x_n$ in place of $c_n$; here it is exact. Exercise 15.12 completes the proof of Theorem 7.3 from it.

```check
fN, f1N, f2N, xN, rN = symbols('f_n f1_n f2_n x_n r')            # f(x_n), f'(x_n), f''(c_n)
eqn = Eq(0, fN + f1N*(rN - xN) + f2N/2*(rN - xN)**2)
fsol = solve(eqn, fN)[0]
same((xN - fsol/f1N) - rN, f2N/(2*f1N)*(xN - rN)**2)
```

### When the series equals the function {#series-equals-function}

::: theorem $e^x$, $\sin x$ and $\cos x$ equal their series
For every real number $x$,

$$e^x = \sum_{n=0}^\infty \frac{x^n}{n!}, \qquad \sin x = \sum_{n=0}^\infty (-1)^n \frac{x^{2n+1}}{(2n + 1)!}, \qquad \cos x = \sum_{n=0}^\infty (-1)^n \frac{x^{2n}}{(2n)!}.$$
:::

::: proof
Fix $x$; it is enough to show that $R_n(x) \to 0$ as $n \to \infty$. For $e^x$, every derivative is $e^t$, and for $t$ between 0 and $x$, $e^t \le e^{\abs{x}}$. So Taylor's inequality gives

$$\abs{R_n(x)} \le e^{\abs{x}}\,\frac{\abs{x}^{n+1}}{(n + 1)!}.$$

For $\sin x$ and $\cos x$ every derivative lies between $-1$ and 1, so $\abs{R_n(x)} \le \abs{x}^{n+1}/(n + 1)!$. Finally, $\abs{x}^{m}/m! \to 0$ as $m \to \infty$, for every $x$: these are the terms of the series $\sum \abs{x}^m/m!$, which converges (Example 15.2), and the terms of a convergent series tend to 0. So $R_n(x) \to 0$ in all three cases.
:::

```check
xa = symbols('x', positive=True)
limit_is(exp(xa)*xa**(n + 1)/factorial(n + 1), n, oo, 0); limit_is(xa**(n + 1)/factorial(n + 1), n, oo, 0)
same(summation(x**n/factorial(n), (n, 0, oo)), exp(x)); same(summation((-1)**n*x**(2*n + 1)/factorial(2*n + 1), (n, 0, oo)), sin(x))
same(summation((-1)**n*x**(2*n)/factorial(2*n), (n, 0, oo)), cos(x))
```

The same argument works about any centre $a$, so $e^x$, $\sin x$ and $\cos x$ equal their Taylor series about every point, for every $x$. A function that equals the sum of its Taylor series on an interval around each point of an open interval is called **analytic** there; $e^x$, $\sin x$ and $\cos x$ are analytic on the whole line.

::: deeper A Taylor series that converges to the wrong function
Is the condition $R_n(x) \to 0$ really needed? If a Taylor series converges, must its sum be $f$? No. Let

$$f(x) = \begin{cases} e^{-1/x^2} & \text{if } x \ne 0, \\ 0 & \text{if } x = 0. \end{cases}$$

Figure 15.3 shows how flat its graph is near 0. In fact every derivative of $f$ at 0 is 0, so its Maclaurin series is $0 + 0x + 0x^2 + \cdots$, which converges for every $x$, to 0. But $f(x) > 0$ for every $x \ne 0$: the series equals $f$ only at 0, and the remainder $R_n(x) = f(x)$ never tends to 0.

Why is every derivative at 0 equal to 0? First, for $x \ne 0$, $f^{(n)}(x) = p_n(1/x)\,e^{-1/x^2}$ for some polynomial $p_n$. This holds for $n = 0$ with $p_0 = 1$, and if it holds for $n$, the chain and product rules give

$$f^{(n+1)}(x) = \Big[\frac{2}{x^3}\,p_n\Big(\frac1x\Big) - \frac{1}{x^2}\,p_n'\Big(\frac1x\Big)\Big]e^{-1/x^2},$$

which has the same form, with $p_{n+1}(u) = 2u^3p_n(u) - u^2p_n'(u)$. Second, for every whole number $m \ge 0$, $u^me^{-u^2} \to 0$ as $u \to \infty$ and as $u \to -\infty$, because exponentials grow faster than powers ([Section 7.7](module_07_EN.html#growth)): for $\abs{u} \ge 1$, $u^2 \ge \abs{u}$, so $\abs{u}^me^{-u^2} \le \abs{u}^me^{-\abs{u}}$. Now suppose $f^{(n)}(0) = 0$, as is true for $n = 0$. By the definition of the derivative, with $u = 1/x$,

$$\begin{aligned} f^{(n+1)}(0) &= \lim_{x\to0}\frac{f^{(n)}(x) - 0}{x} = \lim_{x\to0}\frac1x\,p_n\Big(\frac1x\Big)e^{-1/x^2} \\ &= \lim_{u\to\pm\infty} u\,p_n(u)\,e^{-u^2} = 0, \end{aligned}$$

because $u\,p_n(u)$ is a sum of constant multiples of powers of $u$. By induction, $f^{(n)}(0) = 0$ for every $n$. So this $f$ has derivatives of every order everywhere, yet it is not analytic at 0: no power series centred at 0 equals it on any interval around 0, since by Theorem 15.5 that series would have to be its Maclaurin series, 0.
:::

::: figure id=fig-15-3
Left: the graph of $f(x) = e^{-1/x^2}$, with $f(0) = 0$, rises from the origin towards the line $y = 1$ (dashed). Its Maclaurin series is 0 (orange): it converges everywhere, but equals $f$ only at $x = 0$. Right: zoomed in on 0, five times horizontally and about fifteen times vertically, the graph is still flat: $f(0.25) = e^{-16} \approx 1.1 \times 10^{-7}$.
:::

```check
fE = exp(-1/x**2); uu = symbols('u')
pE = [Integer(1)]
for N_ in range(1, 5):
    pE.append(expand(2*uu**3*pE[-1] - uu**2*diff(pE[-1], uu)))
for N_ in range(5):
    same(diff(fE, x, N_), pE[N_].subs(uu, 1/x)*fE)
for N_ in range(4):
    limit_is(diff(fE, x, N_)/x, x, 0, 0)
for m_ in range(6):
    limit_is(uu**m_*exp(-uu**2), uu, oo, 0); limit_is(uu**m_*exp(-uu**2), uu, -oo, 0)
same(series(fE, x, 0, 10), O(x**10)); holds(fE.subs(x, Rational(1, 10)) > 0)
rounds(exp(-16), '1.1e-7'); same(fE.subs(x, Rational(1, 4)), exp(-16))
```

## Computing with series {#applications}

### e, π and ln 2 {#constants}

By Theorem 15.9 at $x = 1$,

$$e = \sum_{n=0}^\infty \frac{1}{n!} = 1 + 1 + \frac{1}{2!} + \frac{1}{3!} + \cdots.$$

Its partial sums $s_n = \sum_{k=0}^{n} 1/k!$ close in fast:

```valuetable
n = 0, 1, 2, 3, 5, 8, 10, 12
$s_n$ = E*uppergamma(n + 1, 1)/factorial(n)
$e - s_n$ = E - E*uppergamma(n + 1, 1)/factorial(n)
digits = 10
---
n | s_n | e - s_n
0 | 1 | 1.718281828
1 | 2 | 0.7182818285
2 | 2.5 | 0.2182818285
3 | 2.666666667 | 0.05161516179
5 | 2.716666667 | 0.001615161792
8 | 2.718278770 | 3.058617775\times10^{-6}
10 | 2.718281801 | 2.731266076\times10^{-8}
12 | 2.718281828 | 1.728766714\times10^{-10}
```

Taylor's theorem says how fast. With $a = 0$ and $x = 1$, $e - s_n = R_n(1) = e^c/(n + 1)!$ for some $c$ between 0 and 1, and $1 < e^c < e < 3$, so

$$0 < e - s_n < \frac{3}{(n + 1)!}.$$

For $n = 10$ the bound is $3/11! \approx 7.5 \times 10^{-8}$; the table shows an error of $2.7 \times 10^{-8}$. Thirteen terms ($s_{12}$) give $e$ to ten significant digits. Compare the compound-interest limit of [Section 6.1](module_06_EN.html#compound-interest), $(1 + 1/n)^n$, which with $n = 525\,600$ still gives only 2.718279.

```check
for N_ in range(13):                                   # the formula of the table is the partial sum
    holds(expand(E*uppergamma(N_ + 1, 1)/factorial(N_)) == sum(Rational(1, factorial(j)) for j in range(N_ + 1)))
cR = symbols('c', positive=True); holds(E < 3); holds(exp(1) > exp(Rational(1, 2)))
rounds(Rational(3, factorial(11)), '7.5e-8'); rounds(E - sE(10), '2.7e-8'); holds(E - sE(10) < Rational(3, factorial(11)))
rounds(sE(12), '2.718281828'); rounds(E, '2.718281828'); rounds((1 + 1/Float(525600, 40))**525600, '2.718279')
```

The series of Theorem 15.3 for $\pi$, $\tfrac{\pi}{4} = 1 - \tfrac13 + \tfrac15 - \cdots$, is hopeless for computing: its error bound $1/(2n + 1)$ drops below $10^{-6}$ only after half a million terms. The cure is to use $\arctan$ at small numbers, where its series converges fast. **Machin's formula**,

$$\frac{\pi}{4} = 4\arctan\frac15 - \arctan\frac{1}{239},$$

which Exercise 15.11 proves, needs $\arctan$ only at $\tfrac15$ and $\tfrac{1}{239}$. Each term of the series of $\arctan\tfrac15$ is about 25 times smaller than the one before. The series alternate, with terms that decrease in size, so the error of each partial sum is less than the first term left out. Five terms of the first series and two of the second give

$$\begin{aligned} \arctan\tfrac15 &\approx \tfrac15 - \tfrac{1}{3\cdot5^3} + \tfrac{1}{5\cdot5^5} - \tfrac{1}{7\cdot5^7} + \tfrac{1}{9\cdot5^9}, \\ \arctan\tfrac{1}{239} &\approx \tfrac{1}{239} - \tfrac{1}{3\cdot239^3}, \end{aligned}$$

with errors less than $\tfrac{1}{11\cdot5^{11}} \approx 1.9 \times 10^{-9}$ and $\tfrac{1}{5\cdot239^5} \approx 2.6 \times 10^{-13}$, and so $\pi \approx 3.14159268$, with an error of at most $16 \times 1.9 \times 10^{-9} + 4 \times 2.6 \times 10^{-13}$, less than $3 \times 10^{-8}$. Formulas of this kind computed $\pi$ to hundreds of digits by hand, and to millions by computer.

```check
holds(Rational(1, 2*500000 + 1) < Rational(1, 10**6)); holds(Rational(1, 2*499999 + 1) > Rational(1, 10**6))
atn = lambda X, N: sum(Rational((-1)**j, 2*j + 1)*X**(2*j + 1) for j in range(N))
holds(all(Rational(1, 5)**(2*j + 3)/(2*j + 3) < Rational(1, 25)*Rational(1, 5)**(2*j + 1)/(2*j + 1)*Rational(3, 1) for j in range(10)))
rounds(Rational(1, 11*5**11), '1.9e-9'); rounds(Rational(1, 5*239**5), '2.6e-13')
holds(Abs(atan(Rational(1, 5)) - atn(Rational(1, 5), 5)) < Rational(1, 11*5**11)); holds(Abs(atan(Rational(1, 239)) - atn(Rational(1, 239), 2)) < Rational(1, 5*239**5))
pM = 4*(4*atn(Rational(1, 5), 5) - atn(Rational(1, 239), 2)); rounds(pM, '3.14159268')
bound = 16*Rational(1, 11*5**11) + 4*Rational(1, 5*239**5); holds(bound < Rational(3, 10**8)); holds(Abs(pM - pi) < bound)
near(4*(4*atan(Rational(1, 5)) - atan(Rational(1, 239))), pi, 1e-25)      # Machin's formula (proved in Exercise 15.11)
```

::: compute Fifty digits of π
Python's `fractions` module computes with exact fractions, so the partial sums of Machin's formula can be compared with $\pi$ to any number of digits (SymPy supplies $\pi$ for the comparison):

```python
from fractions import Fraction
import sympy as sp

def arctan_sum(x, terms):
    """The first terms of x - x**3/3 + x**5/5 - ..., as an exact fraction."""
    return sum(Fraction((-1)**k, 2*k + 1)*x**(2*k + 1) for k in range(terms))

for terms in (2, 5, 10, 20, 36):
    p = 4*(4*arctan_sum(Fraction(1, 5), terms) - arctan_sum(Fraction(1, 239), terms))
    error = sp.Rational(p.numerator, p.denominator) - sp.pi
    print(f"{terms:2d} terms of each series: error {sp.N(error, 2)}")
print(sp.N(sp.Rational(p.numerator, p.denominator), 52))
```

```output
 2 terms of each series: error -0.0010
 5 terms of each series: error 2.9E-8
10 terms of each series: error -1.5E-15
20 terms of each series: error -8.3E-30
36 terms of each series: error -2.0E-52
3.141592653589793238462643383279502884197169399375106
```

Each extra term gains about 1.4 digits, because $\log_{10} 25 \approx 1.4$; 36 terms of each series give an error of about $2 \times 10^{-52}$, so the 52 digits printed are those of $\pi$. SymPy writes the powers of ten with a capital `E`.
:::

```check
rounds(log(25, 10), '1.4')
pF = 4*(4*atn(Rational(1, 5), 36) - atn(Rational(1, 239), 36)); holds(Abs(pF - pi) < Rational(3, 10**52)); holds(Abs(pF - pi) > Rational(1, 10**52))
```

For $\ln 2$ the alternating harmonic series is just as slow. A faster series comes from subtracting two logarithms. Replacing $x$ by $-x$ in the series of $\ln(1 + x)$ gives $\ln(1 - x) = -x - \tfrac{x^2}{2} - \tfrac{x^3}{3} - \cdots$ for $\abs{x} < 1$.

::: example A fast series for $\ln 2$
Show that for $\abs{x} < 1$

$$\ln\frac{1 + x}{1 - x} = 2\Big(x + \frac{x^3}{3} + \frac{x^5}{5} + \cdots\Big),$$

and use it to find $\ln 2$ to six decimal places.

Subtract the two series, term by term (both converge for $\abs{x} < 1$). The even powers have the same coefficient in both and cancel; the odd powers have opposite coefficients and double:

$$\ln(1 + x) - \ln(1 - x) = 2x + \frac{2x^3}{3} + \frac{2x^5}{5} + \cdots,$$

and the left side is $\ln\dfrac{1 + x}{1 - x}$, by the laws of logarithms. Now $\dfrac{1 + x}{1 - x} = 2$ when $1 + x = 2 - 2x$, that is, $x = \tfrac13$. So

$$\ln 2 = 2\Big(\frac13 + \frac{1}{3\cdot3^3} + \frac{1}{5\cdot3^5} + \frac{1}{7\cdot3^7} + \cdots\Big).$$

Each term is less than a ninth of the one before. If you stop after $n$ terms, the terms left out, $\dfrac{2x^{2k+1}}{2k + 1}$ for $k \ge n$, are at most $\dfrac{2x^{2n+1}}{2n + 1}$ times $1, x^2, x^4, \dots$, a geometric series, so the error is at most

$$\frac{2x^{2n+1}}{2n + 1}\cdot\frac{1}{1 - x^2} = \frac{2}{(2n + 1)\,3^{2n+1}}\cdot\frac98.$$

For $n = 5$ this is about $1.2 \times 10^{-6}$, not quite enough; for $n = 6$ it is about $1.1 \times 10^{-7}$. Six terms give $0.69314707$, and since the error is positive and less than $1.1 \times 10^{-7}$, $\ln 2$ lies between $0.69314707$ and $0.69314718$: to six decimal places, $\ln 2 = 0.693147$. The alternating harmonic series would need about a million terms for the same accuracy.

```check
same(series(log(1 - x), x, 0, 8).removeO(), -sum(x**j/j for j in range(1, 8)))
same(expand(series(log(1 + x) - log(1 - x), x, 0, 12).removeO()), 2*sum(x**(2*j + 1)/(2*j + 1) for j in range(6)))
same(expand_log(log((1 + x)/(1 - x)), force=True), log(1 + x) - log(1 - x))
same(solve(Eq((1 + x)/(1 - x), 2), x), [Rational(1, 3)])
l2 = lambda N: 2*sum(Rational(1, (2*j + 1)*3**(2*j + 1)) for j in range(N))
holds(all(Rational(1, (2*j + 3)*3**(2*j + 3)) < Rational(1, 9)*Rational(1, (2*j + 1)*3**(2*j + 1)) for j in range(10)))
bd = lambda N: Rational(2, (2*N + 1)*3**(2*N + 1))*Rational(9, 8)
same(bd(5), 2*Rational(1, 3)**11/11/(1 - Rational(1, 9))); rounds(bd(5), '1.2e-6'); rounds(bd(6), '1.1e-7')
rounds(l2(6), '0.69314707'); holds(log(2) - l2(6) > 0); holds(log(2) - l2(6) < bd(6))
holds(l2(6) + Rational(11, 10**8) < Rational(69314719, 10**8)); rounds(log(2), '0.693147')
holds(Abs(log(2) - l2(5)) > Rational(5, 10**7))                  # five terms are not enough for six decimals
holds(Rational(1, 10**6 + 1) < Rational(5, 10**7)*Rational(21, 10)) # the alternating harmonic bound 1/(n + 1) needs n near a million
```
:::

### Limits by series {#limits}

Series turn many limits into algebra. Write $O(x^m)$, as in Module 4, for a quantity whose size is at most a constant times $\abs{x}^m$ for $x$ near 0. Taylor's inequality gives such statements for every function in this module: for instance $\sin x = x - \tfrac{x^3}{6} + O(x^5)$, since $T_3 = T_4$ for $\sin$ and $\abs{R_4(x)} \le \abs{x}^5/5!$. The rules for $x$ near 0 are those of big-O in Module 3: $x^k\,O(x^m) = O(x^{k+m})$, a sum of terms $O(x^m)$ is $O(x^m)$, and $O(x^m)$ is also $O(x^k)$ when $k \le m$.

::: example Two limits
Find (a) $\displaystyle\lim_{x\to0}\frac{\sin x - x}{x^3}$ and (b) $\displaystyle\lim_{x\to0}\frac{e^x\sin x - x - x^2}{x^3}$.

**(a)** Since $\sin x - x = -\tfrac{x^3}{6} + O(x^5)$,

$$\frac{\sin x - x}{x^3} = -\frac16 + O(x^2) \to -\frac16.$$

L'Hôpital's rule reaches the same answer only after three applications.

**(b)** Multiply the series of $e^x$ and $\sin x$, keeping the terms up to $x^3$; every product of higher degree goes into $O(x^4)$:

$$\begin{aligned} e^x\sin x &= \Big(1 + x + \frac{x^2}{2} + O(x^3)\Big)\Big(x - \frac{x^3}{6} + O(x^5)\Big) \\ &= x + x^2 + \Big(\frac12 - \frac16\Big)x^3 + O(x^4) = x + x^2 + \frac{x^3}{3} + O(x^4). \end{aligned}$$

So $\dfrac{e^x\sin x - x - x^2}{x^3} = \dfrac13 + O(x) \to \dfrac13$.

```check
same(series(sin(x) - x, x, 0, 5).removeO(), -x**3/6); limit_is((sin(x) - x)/x**3, x, 0, -Rational(1, 6))
same(series((sin(x) - x)/x**3 + Rational(1, 6), x, 0, 3).removeO(), x**2/120)
same(series(exp(x)*sin(x), x, 0, 4).removeO(), x + x**2 + x**3/3)
prod_ = expand((1 + x + x**2/2)*(x - x**3/6)); same(sum(prod_.coeff(x, j)*x**j for j in range(4)), x + x**2 + x**3/3)
same(Rational(1, 2) - Rational(1, 6), Rational(1, 3)); limit_is((exp(x)*sin(x) - x - x**2)/x**3, x, 0, Rational(1, 3))
F_ = sin(x) - x; G_ = x**3                                   # three rounds of L'Hopital: the forms stay 0/0 until the third
same([diff(F_, x, j).subs(x, 0) for j in range(3)], [0, 0, 0]); same([diff(G_, x, j).subs(x, 0) for j in range(3)], [0, 0, 0])
same(diff(F_, x, 3).subs(x, 0)/diff(G_, x, 3).subs(x, 0), -Rational(1, 6))
```
:::

::: pitfall
Keep enough terms. With $\sin x \approx x$ alone, the numerator of (a) becomes $x - x = 0$ and the limit seems to be 0. The first term that survives the cancellation decides the limit, so expand each function until a nonzero term of the order of the denominator appears, and carry the $O(\cdot)$ term to see what you have dropped.
:::

### Approximations in physics {#physics}

Physicists replace functions by their first few Taylor terms all the time, and Taylor's theorem tells them what they lose.

::: example Kinetic energy at low speed
In special relativity, a body of mass $m$ moving at speed $v$ has kinetic energy

$$E_k = mc^2\Big(\frac{1}{\sqrt{1 - v^2/c^2}} - 1\Big),$$

where $c = 299\,792\,458$ m/s is the speed of light. Show that for small $v/c$ this is close to Newton's $\tfrac12 mv^2$, and estimate the relative error of Newton's formula.

Put $x = v^2/c^2$ in Example 15.10(b), $\dfrac{1}{\sqrt{1 - x}} = 1 + \dfrac{x}{2} + \dfrac{3x^2}{8} + \cdots$:

$$E_k = mc^2\Big(\frac{v^2}{2c^2} + \frac{3v^4}{8c^4} + \cdots\Big) = \frac12 mv^2 + \frac{3mv^4}{8c^2} + \cdots.$$

Newton's formula is the first term. The second, divided by the first, is $\tfrac34\,v^2/c^2$: that is roughly the relative error of $\tfrac12mv^2$. At $v = 0.1c$ it is 0.75%; the exact values are $E_k \approx 0.0050378\,mc^2$ against $\tfrac12mv^2 = 0.005\,mc^2$, a relative error of 0.75% indeed. For any speed up to 300 m/s, $v^2/c^2 < 1.1 \times 10^{-12}$, and Newton's formula is right to about one part in a million million.

```check
same(series(1/sqrt(1 - x) - 1, x, 0, 3).removeO(), x/2 + 3*x**2/8)
mm, vv, cc2 = symbols('m v c', positive=True)
Ek = mm*cc2**2*(1/sqrt(1 - vv**2/cc2**2) - 1)
same(series(Ek, vv, 0, 6).removeO(), mm*vv**2/2 + 3*mm*vv**4/(8*cc2**2))
same((3*mm*vv**4/(8*cc2**2))/(mm*vv**2/2), Rational(3, 4)*vv**2/cc2**2)
b_ = Rational(1, 10); g1 = 1/sqrt(1 - b_**2) - 1
rounds(g1, '0.0050378'); same(b_**2/2, Rational(5, 1000)); rounds(100*(g1 - b_**2/2)/g1, '0.75'); same(100*Rational(3, 4)*b_**2, Rational(75, 100))
holds((Rational(300, 299792458))**2 < Rational(11, 10**13))
holds(Rational(3, 4)*(Rational(300, 299792458))**2 < Rational(1, 10**12))
```
:::

The small-angle approximation $\sin\theta \approx \theta$ of Example 7.6 is the Taylor polynomial $T_1$ of the sine. Module 7 measured its relative error with a table; series explain the table. Since $\theta - \sin\theta = \tfrac{\theta^3}{6} + O(\theta^5)$ and $\sin\theta = \theta\big(1 + O(\theta^2)\big)$,

$$\frac{\theta - \sin\theta}{\sin\theta} = \frac{\theta^2}{6} + O(\theta^4).$$

At $\theta = 0.1$ this gives $0.001667$, against $0.001669$ in Module 7's table, and it explains why the error grew about a hundredfold for each tenfold increase in $\theta$. For a pendulum of length $L$, the small-angle approximation gives the familiar period $2\pi\sqrt{L/g}$, the same for every small swing. Physics texts show, by a longer calculation in which the binomial series appears inside an integral, that a swing of amplitude $\theta_0$ (in radians) takes

$$T = 2\pi\sqrt{\frac{L}{g}}\,\Big(1 + \frac{\theta_0^2}{16} + \cdots\Big).$$

So a swing of 0.1 radian (about $6^\circ$) takes about 0.06% longer than the small-angle formula says, and a swing of 0.5 radian about 1.6% longer.

```check
same(series((theta - sin(theta))/sin(theta), theta, 0, 4).removeO(), theta**2/6)
rounds(Rational(1, 100)/6, '0.001667'); rounds((Rational(1, 10) - sin(Rational(1, 10)))/sin(Rational(1, 10)), '0.001669')
mk = symbols('m', positive=True)
same(series(2/pi*elliptic_k(sin(theta/2)**2), theta, 0, 4).removeO(), 1 + theta**2/16)   # the exact period, divided by 2 pi sqrt(L/g)
rounds(Rational(1, 10)*180/pi, '6'); rounds(100*Rational(1, 100)/16, '0.06'); rounds(100*Rational(1, 4)/16, '1.6')
rounds(100*(2/pi*elliptic_k(sin(Rational(1, 4))**2) - 1), '1.6')
```

### How computers evaluate functions {#libraries}

A processor adds, subtracts, multiplies and divides; it has no circuit for $\sin x$ or $e^x$. Mathematics libraries, the code behind Python's `math.sin` and the sine of every programming language and spreadsheet, evaluate such functions with polynomials, in two steps.

**Range reduction.** The Maclaurin series of $\sin$ converges for every $x$, but for large $x$ it is useless: at $x = 100$ its terms grow to about $10^{42}$ before they shrink, and in floating point their sum, a number between $-1$ and 1, is lost in the rounding. So the library first uses the symmetries of $\sin$ to make $x$ small. Write $x = k\cdot\tfrac{\pi}{2} + r$, with $k$ the whole number nearest to $x/(\pi/2)$, so that $\abs{r} \le \pi/4$. By the addition formulas of Module 1, $\sin x$ is $\sin r$, $\cos r$, $-\sin r$ or $-\cos r$, according as $k$ leaves the remainder 0, 1, 2 or 3 when divided by 4.

**A polynomial.** For $\abs{r} \le \pi/4$ Taylor polynomials converge fast. Since $T_{15} = T_{16}$ for $\sin$, Taylor's inequality gives

$$\abs{\sin r - T_{15}(r)} \le \frac{(\pi/4)^{17}}{17!} \approx 4.6 \times 10^{-17},$$

below the precision of the computer's numbers, and $T_{16}$ does even better for $\cos r$. A polynomial is evaluated from the inside out, as $c_0 + u\big(c_1 + u(c_2 + \cdots)\big)$ with $u = r^2$, which takes one multiplication and one addition per coefficient: this is **Horner's rule**.

```check
mx = max(range(1, 300), key=lambda j: Rational(100)**j/factorial(j)); same(mx, 99)
rounds(Rational(100)**100/factorial(100), '1e42'); same(Rational(100)**99/factorial(99), Rational(100)**100/factorial(100))
for K_, val in ((0, sin(theta)), (1, cos(theta)), (2, -sin(theta)), (3, -cos(theta))):
    same(expand_trig(sin(K_*pi/2 + theta)), val)
same(series(sin(x), x, 0, 17).removeO(), series(sin(x), x, 0, 16).removeO())
rounds((pi/4)**17/factorial(17), '4.6e-17'); holds((pi/4)**18/factorial(18) < (pi/4)**17/factorial(17))
```

Real libraries refine both steps. Their polynomials are not Taylor polynomials but **minimax polynomials**, whose coefficients are tuned to spread the error evenly over the interval, so that a lower degree reaches full precision. And they carry out the range reduction with extra digits of $\pi$, because for large $x$ the subtraction $x - k\pi/2$ cancels leading digits, as in Module 2. The exponential is handled the same way: write $x = k\ln 2 + r$ with $\abs{r} \le \tfrac12\ln 2$; then $e^x = 2^ke^r$, where $e^r$ comes from a polynomial and multiplying by $2^k$ only changes the exponent of a floating-point number.

::: compute A sine function of your own
Range reduction and a Taylor polynomial of degree 15 already make a good sine:

```python
import math

S = [(-1)**j/math.factorial(2*j + 1) for j in range(8)]    # sin: r, r^3, ..., r^15
C = [(-1)**j/math.factorial(2*j) for j in range(9)]        # cos: 1, r^2, ..., r^16

def poly(coeffs, u):
    """c0 + c1*u + c2*u**2 + ..., by Horner's rule."""
    total = 0.0
    for c in reversed(coeffs):
        total = total*u + c
    return total

def my_sin(x):
    k = round(x/(math.pi/2))           # x = k*(pi/2) + r with |r| <= pi/4
    r = x - k*(math.pi/2)
    s, c = r*poly(S, r*r), poly(C, r*r)
    return [s, c, -s, -c][k % 4]

for x in [0.5, 2.0, 10.0, 1000.0, 1e6]:
    print(f"x = {x:>9}: my_sin = {my_sin(x):+.16f}, math.sin = {math.sin(x):+.16f}")
```

```output
x =       0.5: my_sin = +0.4794255386042030, math.sin = +0.4794255386042030
x =       2.0: my_sin = +0.9092974268256817, math.sin = +0.9092974268256817
x =      10.0: my_sin = -0.5440211108893701, math.sin = -0.5440211108893698
x =    1000.0: my_sin = +0.8268795405320475, math.sin = +0.8268795405320025
x = 1000000.0: my_sin = -0.3499935020939287, math.sin = -0.3499935021712929
```

For $x = 0.5$ and 2 the two agree in every digit printed, and for $x = 10$ in all but the last. For larger $x$ they part company: the error of `my_sin` grows with $x$. The polynomial is not to blame; the reduction is. `math.pi/2` is $\pi/2$ rounded to about 16 digits, and $k$ times its error, with $k$ about $x/1.57$, ends up in $r$: for $x = 10^6$ that is an error near $10^{-10}$. Python's `math.sin` reduces with many more digits of $\pi$.
:::

```check
holds(Abs(N(pi/2, 30) - Float(1.5707963267948966, 30)) < 10**-16); holds(Abs(N(pi/2, 30) - Float(1.5707963267948966, 30)) > 5*10**-17)
rounds(1e6/1.5707963267948966*6.1e-17, '4e-11'); holds(Abs(-0.3499935020939287 - sin(Integer(10**6))) > 10**-11)
holds(Abs(-0.3499935020939287 - sin(Integer(10**6))) < 10**-9)
```

## Euler's formula {#euler}

Three of the standard series look alike. The series of $e^x$ has every power of $x$, with plus signs; $\sin x$ has the odd powers and $\cos x$ the even powers, with alternating signs, and the same factorials. Complex numbers show that this is no coincidence: the three are one function.

### Complex numbers {#complex}

The equation $x^2 + 1 = 0$ has no real solution, because $x^2 \ge 0$ for every real $x$. Mathematicians add a new number $i$ with $i^2 = -1$ and calculate with it as with a letter in algebra, replacing $i^2$ by $-1$ wherever it appears. Module 13 met such numbers as the complex roots of a characteristic equation; this section needs only the little about them that follows.

::: definition Complex numbers
A **complex number** is a number $z = p + qi$, where $p$ and $q$ are real numbers and $i$, the **imaginary unit**, satisfies $i^2 = -1$. The real number $p$ is the **real part** of $z$, and $q$ its **imaginary part**. Complex numbers are added and multiplied like expressions in a letter $i$, with $i^2$ replaced by $-1$:

$$\begin{aligned} (p + qi) + (r + si) &= (p + r) + (q + s)i, \\ (p + qi)(r + si) &= (pr - qs) + (ps + qr)i. \end{aligned}$$

Two complex numbers are equal when their real parts are equal and their imaginary parts are equal. The **modulus** of $z = p + qi$ is $\abs{z} = \sqrt{p^2 + q^2}$.
:::

The real numbers are the complex numbers with imaginary part 0. Picture $z = p + qi$ as the point $(p, q)$ of a plane, the **complex plane**, with real parts along the horizontal axis and imaginary parts up the vertical one; then $\abs{z}$ is the distance from $z$ to 0, and multiplying out shows that $\abs{zw} = \abs{z}\,\abs{w}$. The powers of $i$ repeat in a cycle of four:

$$i^0 = 1, \quad i^1 = i, \quad i^2 = -1, \quad i^3 = -i, \quad i^4 = 1, \quad i^5 = i, \ \dots$$

Multiplying by $i$ turns the plane a quarter turn anticlockwise about 0: $i(p + qi) = -q + pi$, so the point $(p, q)$ moves to $(-q, p)$.

```check
same(I**2, -1); same([I**j for j in range(6)], [1, I, -1, -I, 1, I])
pc, qc, rc, sc = symbols('p q r s', real=True)
same(expand((pc + qc*I) + (rc + sc*I)), (pc + rc) + (qc + sc)*I); same(expand((pc + qc*I)*(rc + sc*I)), (pc*rc - qc*sc) + (pc*sc + qc*rc)*I)
same(Abs(pc + qc*I), sqrt(pc**2 + qc**2)); same(expand((pc*rc - qc*sc)**2 + (pc*sc + qc*rc)**2), expand((pc**2 + qc**2)*(rc**2 + sc**2)))
same(expand(I*(pc + qc*I)), -qc + pc*I)
```

A series of complex numbers converges when the series of their real parts and the series of their imaginary parts both converge; its sum is then the sum of the real parts plus $i$ times the sum of the imaginary parts. If $\sum \abs{z_n}$ converges, so does $\sum z_n$: the real and imaginary parts of $z_n$ are at most $\abs{z_n}$ in size, so both real series converge absolutely, by comparison.

::: definition The exponential of a complex number
For every complex number $z$,

$$e^z = \sum_{n=0}^\infty \frac{z^n}{n!} = 1 + z + \frac{z^2}{2!} + \frac{z^3}{3!} + \cdots.$$
:::

The series converges for every $z$, because $\abs{z^n/n!} = \abs{z}^n/n!$ and $\sum \abs{z}^n/n!$ converges (Example 15.2). For a real $z$ it is the familiar $e^x$, by Theorem 15.9. The law of exponents $e^{z+w} = e^z e^w$ holds for complex $z$ and $w$ too. Its proof multiplies the two series term by term and collects the terms with the binomial theorem; it rests on a theorem about multiplying absolutely convergent series, which this series does not prove.

```check
same(summation(rc**n/factorial(n), (n, 0, oo)), exp(rc)); same(Abs((pc + qc*I)**3), Abs(pc + qc*I)**3)
zA, wA = symbols('z w')
same(expand(sum(zA**j/factorial(j) for j in range(5))*sum(wA**j/factorial(j) for j in range(5))).as_poly(zA, wA).as_expr().subs({zA: 0}), sum(wA**j/factorial(j) for j in range(5)))
for N_ in range(1, 6):                          # the terms of degree N in e^z e^w add up to (z + w)^N/N!, by the binomial theorem
    same(sum(zA**j/factorial(j)*wA**(N_ - j)/factorial(N_ - j) for j in range(N_ + 1)), (zA + wA)**N_/factorial(N_))
```

### e to an imaginary power {#euler-formula}

::: theorem Euler's formula
For every real number $\theta$,

$$e^{i\theta} = \cos\theta + i\sin\theta.$$
:::

::: proof
Put $z = i\theta$ in the series. Since $(i\theta)^n = i^n\theta^n$ and the powers of $i$ cycle through $1, i, -1, -i$,

$$e^{i\theta} = 1 + i\theta - \frac{\theta^2}{2!} - i\,\frac{\theta^3}{3!} + \frac{\theta^4}{4!} + i\,\frac{\theta^5}{5!} - \cdots.$$

The real parts of the terms are $1, 0, -\tfrac{\theta^2}{2!}, 0, \tfrac{\theta^4}{4!}, \dots$: the terms of the series of $\cos\theta$, with zeros in between, which change neither whether it converges nor its sum. The imaginary parts are $0, \theta, 0, -\tfrac{\theta^3}{3!}, 0, \tfrac{\theta^5}{5!}, \dots$: the series of $\sin\theta$, with zeros in between. By Theorem 15.9 these converge to $\cos\theta$ and $\sin\theta$, so $e^{i\theta} = \cos\theta + i\sin\theta$.
:::

```check
thr = symbols('theta', real=True)
ser_ = expand(sum((I*thr)**j/factorial(j) for j in range(12))); re_, im_ = ser_.as_real_imag()
same(re_, sum((-1)**j*thr**(2*j)/factorial(2*j) for j in range(6))); same(im_, sum((-1)**j*thr**(2*j + 1)/factorial(2*j + 1) for j in range(6)))
same(expand(exp(I*thr), complex=True), cos(thr) + I*sin(thr))
```

At $\theta = \pi$, $\cos\pi = -1$ and $\sin\pi = 0$, so

$$e^{i\pi} = -1, \qquad\text{that is,}\qquad e^{i\pi} + 1 = 0:$$

one equation that links five of the most important numbers in mathematics, 0, 1, $e$, $i$ and $\pi$. Figure 15.4 shows what Euler's formula means. The complex number $e^{i\theta}$ is the point $(\cos\theta, \sin\theta)$, the point at angle $\theta$ on the unit circle of [Section 1.4](module_01_EN.html#trig), and its modulus is 1. As $\theta$ increases, $e^{i\theta}$ moves anticlockwise round the circle, once every $2\pi$.

::: figure id=fig-15-4
Left: by Euler's formula, $e^{i\theta} = \cos\theta + i\sin\theta$ is the point at angle $\theta$ on the unit circle of the complex plane, with real part $\cos\theta$ (green) and imaginary part $\sin\theta$ (blue). Right: the partial sums $S_N$ of the series $\sum (i\pi)^n/n!$ of $e^{i\pi}$. Each term is the one before multiplied by $i\pi/n$, so the path turns left by a right angle at every step, and it spirals in to $-1$.
:::

```check
same(exp(I*pi), -1); same(exp(I*pi) + 1, 0); same(Abs(exp(I*thr)), 1); same(exp(I*thr).as_real_imag(), (cos(thr), sin(thr)))
nQ2 = symbols('n', integer=True, positive=True)
same(((I*pi)**nQ2/factorial(nQ2))/((I*pi)**(nQ2 - 1)/factorial(nQ2 - 1)), I*pi/nQ2)
Sp = [sum((I*pi)**j/factorial(j) for j in range(N_ + 1)) for N_ in range(26)]
same(Sp[1], 1 + I*pi); same(Sp[2], 1 + I*pi - pi**2/2); holds(Abs(N(Sp[25]) + 1) < 10**-12)
```

Euler's formula with $-\theta$ in place of $\theta$ gives $e^{-i\theta} = \cos\theta - i\sin\theta$, because $\cos$ is even and $\sin$ is odd. Adding and subtracting the two formulas,

$$\cos\theta = \frac{e^{i\theta} + e^{-i\theta}}{2}, \qquad \sin\theta = \frac{e^{i\theta} - e^{-i\theta}}{2i},$$

close relatives of $\cosh x = \tfrac12(e^x + e^{-x})$ and $\sinh x = \tfrac12(e^x - e^{-x})$ of Module 6. The law of exponents turns into the addition formulas of Module 1. From $e^{i(x + y)} = e^{ix}e^{iy}$,

$$\begin{aligned} \cos(x + y) + i\sin(x + y) &= (\cos x + i\sin x)(\cos y + i\sin y) \\ &= (\cos x\cos y - \sin x\sin y) + i(\sin x\cos y + \cos x\sin y), \end{aligned}$$

and comparing the real parts, and then the imaginary parts, gives both formulas at once.

```check
same(expand(exp(-I*thr), complex=True), cos(thr) - I*sin(thr))
same(expand_complex((exp(I*thr) + exp(-I*thr))/2), cos(thr)); same(expand_complex((exp(I*thr) - exp(-I*thr))/(2*I)), sin(thr))
same(cosh(x).rewrite(exp), (exp(x) + exp(-x))/2); same(sinh(x).rewrite(exp), (exp(x) - exp(-x))/2)
xr2, yr2 = symbols('x y', real=True)
same(expand((cos(xr2) + I*sin(xr2))*(cos(yr2) + I*sin(yr2))), (cos(xr2)*cos(yr2) - sin(xr2)*sin(yr2)) + I*(sin(xr2)*cos(yr2) + cos(xr2)*sin(yr2)))
same(expand_trig(cos(xr2 + yr2)), cos(xr2)*cos(yr2) - sin(xr2)*sin(yr2)); same(expand_trig(sin(xr2 + yr2)), sin(xr2)*cos(yr2) + cos(xr2)*sin(yr2))
```

Complex numbers also answer the question of Section 15.2: why does the series of $1/(1 + x^2)$ stop converging at $x = \pm1$, where nothing happens to the function? Allow complex $z$ in $1/(1 + z^2)$: the denominator is 0 at $z = \pm i$, at distance 1 from 0 in the complex plane. A theorem of complex analysis, beyond this series, says that the Taylor series of a rational function in lowest terms, about a real $a$, has as its radius of convergence the distance from $a$ to the nearest complex number at which the denominator is 0. The function blows up at $\pm i$, out of sight of the real line, and the series cannot converge beyond that distance. About $a = 1$ the radius is $\abs{1 - i} = \sqrt2$. And since $\arctan x$ is an integral of $1/(1 + x^2)$, and integration keeps the radius (Theorem 15.2), the series of $\arctan x$ about $a$ has radius $\abs{a - i} = \sqrt{1 + a^2}$: the widget of Section 15.4 shows it.

```check
zc = symbols('z'); same_set(solve(1 + zc**2, zc), [I, -I]); same(Abs(I), 1); same(Abs(1 - I), sqrt(2))
arl = symbols('a', real=True); same(Abs(arl - I), sqrt(1 + arl**2))
cser = series(1/(1 + (1 + u)**2), u, 0, 16).removeO()          # about a = 1: |c_n| is at most 2^(-(n+1)/2), and equal to it for even n
for j in range(16):
    same(cser.coeff(u, j), (-1)**j*sin((j + 1)*pi/4)/2**(Rational(j + 1, 2)))
limit_is((2**(-(2*n + 1)/Rational(2)))**(1/(2*n)), n, oo, 1/sqrt(2))   # so the root test gives the radius sqrt(2)
```

::: pitfall
Not every rule of real exponentials survives. For real numbers, $e^x = e^y$ forces $x = y$; for complex numbers it does not, because $e^{2\pi i} = \cos 2\pi + i\sin 2\pi = 1 = e^0$, although $2\pi i \ne 0$. The complex exponential repeats itself with period $2\pi i$, so you cannot cancel it, or take logarithms, as you would for real numbers.

```check
same(exp(2*pi*I), 1); same(exp(0), 1); same(exp(zA + 2*pi*I), exp(zA))
```
:::

### Oscillations {#oscillations}

Module 13 solved the equation $y'' + py' + qy = 0$, with real constants $p$ and $q$, by trying $y = e^{rt}$, which leads to the characteristic equation $r^2 + pr + q = 0$. When $p^2 < 4q$ this equation has no real roots, and Module 13 gave the solutions $e^{at}\cos bt$ and $e^{at}\sin bt$, with $a = -\tfrac{p}{2}$ and $b = \tfrac12\sqrt{4q - p^2}$, checked by substitution. Euler's formula shows where they come from.

By the quadratic formula the roots are $r = -\tfrac{p}{2} \pm \tfrac12\sqrt{p^2 - 4q}$. When $p^2 < 4q$, the number $p^2 - 4q$ is negative, and $\big(i\sqrt{4q - p^2}\big)^2 = -(4q - p^2) = p^2 - 4q$; so the roots are the complex numbers $r = a \pm bi$.

**Complex roots give complex solutions.** A function of a real variable $t$ with complex values, $u(t) + i\,v(t)$, is differentiated by differentiating its real and imaginary parts. For $r = a + bi$, Euler's formula and the law of exponents give $e^{rt} = e^{at}e^{ibt} = e^{at}\cos bt + i\,e^{at}\sin bt$, and by the product rule

$$\begin{aligned} \frac{d}{dt}e^{rt} &= e^{at}(a\cos bt - b\sin bt) + i\,e^{at}(a\sin bt + b\cos bt) \\ &= (a + bi)\,e^{at}(\cos bt + i\sin bt) = r\,e^{rt}, \end{aligned}$$

as multiplying out $(a + bi)(\cos bt + i\sin bt)$ confirms. So $(e^{rt})'' = r^2e^{rt}$, and $y = e^{rt}$ gives $y'' + py' + qy = (r^2 + pr + q)\,e^{rt} = 0$, exactly as for a real root.

**Their real and imaginary parts are real solutions.** If $y = u + iv$ solves the equation, with $u$ and $v$ real functions, then, since $p$ and $q$ are real,

$$0 = y'' + py' + qy = (u'' + pu' + qu) + i\,(v'' + pv' + qv),$$

and a complex number is 0 only when its real and imaginary parts are both 0. So $u$ and $v$ are solutions. The real and imaginary parts of $e^{(a+bi)t}$ are $e^{at}\cos bt$ and $e^{at}\sin bt$: Module 13's solutions. The imaginary part $b$ of the root makes them oscillate, because $e^{ibt}$ goes round the unit circle; the real part $a$ decides whether the oscillation dies away ($a < 0$), grows ($a > 0$) or keeps its size ($a = 0$).

```check
pq_, qq3 = symbols('p q', real=True)
same_set(solve(r**2 + pq_*r + qq3, r), [-pq_/2 - sqrt(pq_**2 - 4*qq3)/2, -pq_/2 + sqrt(pq_**2 - 4*qq3)/2])
dpos = symbols('d', positive=True); same((I*sqrt(dpos))**2, -dpos)
ar2, br2 = symbols('a b', real=True); tr = symbols('t', real=True)
Yc = exp(ar2*tr)*cos(br2*tr) + I*exp(ar2*tr)*sin(br2*tr)
same(expand(exp((ar2 + I*br2)*tr), complex=True), expand(Yc))
same(expand(diff(Yc, tr)), expand((ar2 + I*br2)*Yc))
same(expand(diff(exp(ar2*tr)*cos(br2*tr), tr)), expand(exp(ar2*tr)*(ar2*cos(br2*tr) - br2*sin(br2*tr))))
same(expand((ar2 + I*br2)*(cos(br2*tr) + I*sin(br2*tr))), expand((ar2*cos(br2*tr) - br2*sin(br2*tr)) + I*(ar2*sin(br2*tr) + br2*cos(br2*tr))))
same(expand((r**2 + pq_*r + qq3).subs({r: ar2 + I*br2, pq_: -2*ar2, qq3: ar2**2 + br2**2})), 0)   # a + bi is a root when p = -2a, q = a^2 + b^2
for part in (exp(ar2*tr)*cos(br2*tr), exp(ar2*tr)*sin(br2*tr)):
    same(simplify(diff(part, tr, 2) - 2*ar2*diff(part, tr) + (ar2**2 + br2**2)*part), 0)
```

::: example A damped spring
A mass on a spring with damping moves according to $y'' + 2y' + 10y = 0$, where $y$ is its displacement and $t$ the time (in seconds, say). Find real solutions with Euler's formula, and describe the motion.

The characteristic equation $r^2 + 2r + 10 = 0$ has roots

$$r = \frac{-2 \pm \sqrt{4 - 40}}{2} = \frac{-2 \pm 6i}{2} = -1 \pm 3i,$$

since $\sqrt{-36} = 6i$ in the sense above: $(6i)^2 = -36$. So $e^{(-1+3i)t} = e^{-t}(\cos 3t + i\sin 3t)$ is a complex solution, and its real and imaginary parts give the real solutions $e^{-t}\cos 3t$ and $e^{-t}\sin 3t$; Module 13's general solution is $y = e^{-t}(C_1\cos 3t + C_2\sin 3t)$. The motion is an oscillation with period $2\pi/3 \approx 2.09$ seconds, whose size is multiplied by $e^{-t}$: it halves every $\ln 2 \approx 0.69$ seconds.

```check
same_set(solve(r**2 + 2*r + 10, r), [-1 + 3*I, -1 - 3*I]); same((6*I)**2, -36); same((-2 + 6*I)/2, -1 + 3*I)
same(expand(exp((-1 + 3*I)*tr), complex=True), expand(exp(-tr)*cos(3*tr) + I*exp(-tr)*sin(3*tr)))
for part in (exp(-tr)*cos(3*tr), exp(-tr)*sin(3*tr)):
    same(simplify(diff(part, tr, 2) + 2*diff(part, tr) + 10*part), 0)
yf = Function('y'); C1, C2 = symbols('C1 C2')
same(dsolve(yf(tr).diff(tr, 2) + 2*yf(tr).diff(tr) + 10*yf(tr)).rhs, (C1*sin(3*tr) + C2*cos(3*tr))*exp(-tr))
rounds(2*pi/3, '2.09'); rounds(log(2), '0.69'); same(exp(-(tr + log(2)))/exp(-tr), Rational(1, 2))
```
:::

::: compute Euler's formula in Python
Python has complex numbers built in. It writes the imaginary unit as `j`, as engineers do, so $i$ is `1j`, and the module `cmath` has the complex exponential:

```python
import cmath
import math
print(1j**2)
print(cmath.exp(1j*math.pi))
theta = 1.0
print(cmath.exp(1j*theta))
print(math.cos(theta), math.sin(theta))
```

```output
(-1+0j)
(-1+1.2246467991473532e-16j)
(0.5403023058681398+0.8414709848078965j)
0.5403023058681398 0.8414709848078965
```

$e^{i\pi}$ comes out as $-1$ plus a tiny imaginary part. That part is $\sin$ of `math.pi`, which is $\pi$ rounded to about 16 digits: $\sin(\pi - \delta) \approx \delta$ for a small $\delta$, and here $\delta = \pi - $ `math.pi` $\approx 1.22 \times 10^{-16}$. SymPy, which keeps $\pi$ exact, gets $-1$ exactly; with a real symbol it expands $e^{it}$ by Euler's formula, and its differential equation solver produces the oscillations of Example 15.18:

```python
import sympy as sp
t = sp.symbols('t', real=True)
y = sp.Function('y')
print(sp.exp(sp.I*sp.pi))
print(sp.expand(sp.exp(sp.I*t), complex=True))
print(sp.dsolve(y(t).diff(t, 2) + 2*y(t).diff(t) + 10*y(t)))
```

```output
-1
I*sin(t) + cos(t)
Eq(y(t), (C1*sin(3*t) + C2*cos(3*t))*exp(-t))
```
:::

```check
rounds(pi - Float(3.141592653589793, 40), '1.22e-16'); rounds(sin(Float(3.141592653589793, 40)), '1.22e-16')
```

## What you learned {#summary}

- A power series $\sum c_n(x - a)^n$ converges absolutely for $\abs{x - a} < R$ and diverges for $\abs{x - a} > R$; the radius $R$, possibly 0 or $\infty$, usually comes from the ratio test, as $1/\lim\abs{c_{n+1}/c_n}$. The two endpoints $a \pm R$ must be tested separately.
- Substituting into the geometric series $1/(1 - u) = \sum u^n$, for $\abs{u} < 1$, gives series for $1/(1 + x)$, $1/(1 + x^2)$, $1/(2 - x)$ and many more; the condition $\abs{u} < 1$ must be translated too.
- Inside the interval of convergence a power series can be differentiated and integrated term by term, with the same radius. Integrating gives $\ln(1 + x) = x - \tfrac{x^2}{2} + \cdots$ and $\arctan x = x - \tfrac{x^3}{3} + \cdots$; at the endpoints, $1 - \tfrac12 + \tfrac13 - \cdots = \ln 2$ and $1 - \tfrac13 + \tfrac15 - \cdots = \tfrac{\pi}{4}$, and Abel's theorem covers every series that converges at an endpoint.
- If $f$ has a power series about $a$, its coefficients are $f^{(n)}(a)/n!$: it is the Taylor series of $f$ (the Maclaurin series when $a = 0$). The standard series are those of $1/(1 - x)$, $\ln(1 + x)$, $\arctan x$, $e^x$, $\sin x$, $\cos x$ and the binomial series of $(1 + x)^k$, with their intervals.
- The Taylor polynomial $T_n$ matches $f$ and its first $n$ derivatives at $a$. Taylor's theorem: $f(x) = T_n(x) + \dfrac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n+1}$ for some $c$ between $a$ and $x$; so $\abs{f(x) - T_n(x)} \le \dfrac{M}{(n + 1)!}\abs{x - a}^{n+1}$ when $\abs{f^{(n+1)}} \le M$. It proves the error estimates of Modules 4 and 7.
- A Taylor series equals $f$ exactly where the remainder tends to 0: for $e^x$, $\sin x$ and $\cos x$, at every $x$. A convergent Taylor series can have the wrong sum, as $e^{-1/x^2}$ shows.
- Series compute $e$, $\pi$ (Machin's formula) and $\ln 2$, evaluate limits such as $\lim (\sin x - x)/x^3 = -\tfrac16$, give the approximations of physics, and, after range reduction, the polynomials of mathematics libraries.
- With complex numbers, $e^{i\theta} = \cos\theta + i\sin\theta$ and $e^{i\pi} + 1 = 0$. Complex roots $a \pm bi$ of a characteristic equation give the oscillating solutions $e^{at}\cos bt$ and $e^{at}\sin bt$, and complex numbers explain radii of convergence such as that of $1/(1 + x^2)$.
- SymPy: `sp.series(f, x, a, n)` gives the terms up to $(x - a)^{n-1}$, and `.removeO()` drops the $O$ term.

## Exercises {#exercises}

:::: exercise Intervals of convergence {#ex-15-1} ★
Find the radius and the interval of convergence of each series.

- (a) $\displaystyle\sum_{n=1}^\infty \frac{n\,x^n}{4^n}$
- (b) $\displaystyle\sum_{n=1}^\infty \frac{(x + 1)^n}{\sqrt n}$
- (c) $\displaystyle\sum_{n=0}^\infty \frac{(2x)^n}{n!}$

::: solution
**(a)** Here $c_n = n/4^n$, and $\abs{\dfrac{c_{n+1}}{c_n}} = \dfrac{n + 1}{4n} \to \dfrac14$, so $R = 4$. At $x = 4$ the terms are $n$, and at $x = -4$ they are $(-1)^n n$: in both cases they do not tend to 0, so the series diverges. The interval is $(-4, 4)$.

**(b)** The centre is $-1$. Here $c_n = 1/\sqrt n$ and $\abs{c_{n+1}/c_n} = \sqrt{n/(n + 1)} \to 1$, so $R = 1$: the series converges absolutely for $\abs{x + 1} < 1$, that is, $-2 < x < 0$. At $x = 0$ it is $\sum 1/\sqrt n$, a $p$-series with $p = \tfrac12 \le 1$, which diverges. At $x = -2$ it is $\sum (-1)^n/\sqrt n$, which converges by the alternating series test, since $1/\sqrt n$ decreases to 0. The interval is $[-2, 0)$.

**(c)** Here $c_n = 2^n/n!$ and $\abs{c_{n+1}/c_n} = \dfrac{2}{n + 1} \to 0$, so $R = \infty$: the series converges for every $x$. It is the series of $e^{2x}$.

```check
nE = symbols('n', integer=True, positive=True)
ca = lambda N: N/4**N
same(ca(nE + 1)/ca(nE), (nE + 1)/(4*nE)); limit_is((n + 1)/(4*n), n, oo, Rational(1, 4))
same(ca(nE)*4**nE, nE); same(Abs(ca(nE)*(-4)**nE), nE)
same(sqrt(nE)/sqrt(nE + 1), (1/sqrt(nE + 1))/(1/sqrt(nE))); limit_is(sqrt(n/(n + 1)), n, oo, 1)
same(solve_univariate_inequality(Abs(x + 1) < 1, x, relational=False), Interval.open(-2, 0))
holds(Sum(1/sqrt(n), (n, 1, oo)).is_convergent() == False); holds(Sum((-1)**n/sqrt(n), (n, 1, oo)).is_convergent())
cc3 = lambda N: 2**N/factorial(N)
same(cc3(nE + 1)/cc3(nE), 2/(nE + 1)); limit_is(2/(n + 1), n, oo, 0)
same(summation((2*x)**n/factorial(n), (n, 0, oo)), exp(2*x))
```
:::
::::

:::: exercise Series from the geometric series {#ex-15-2} ★
Find a power series about 0 for each function, and its interval of convergence.

- (a) $\dfrac{1}{1 - 3x}$
- (b) $\dfrac{x^2}{1 + x}$
- (c) $\dfrac{1}{4 + x^2}$

::: solution
**(a)** With $u = 3x$: $\dfrac{1}{1 - 3x} = \sum 3^n x^n = 1 + 3x + 9x^2 + \cdots$, for $\abs{3x} < 1$, that is, $\abs{x} < \tfrac13$. At $x = \pm\tfrac13$ the terms are $(\pm1)^n$, which do not tend to 0. The interval is $\big(-\tfrac13, \tfrac13\big)$.

**(b)** Multiply the series of $\dfrac{1}{1 + x}$ by $x^2$: $\dfrac{x^2}{1 + x} = \sum (-1)^n x^{n+2} = x^2 - x^3 + x^4 - \cdots$, for $\abs{x} < 1$. At $x = \pm1$ the terms have size 1, so the interval is $(-1, 1)$.

**(c)** Take out the factor 4, to make the 1 appear:

$$\frac{1}{4 + x^2} = \frac14\cdot\frac{1}{1 + x^2/4} = \frac14\sum_{n=0}^\infty (-1)^n\Big(\frac{x^2}{4}\Big)^n = \sum_{n=0}^\infty \frac{(-1)^n x^{2n}}{4^{n+1}},$$

for $x^2/4 < 1$, that is, $\abs{x} < 2$. At $x = \pm2$ the terms are $(-1)^n/4$, which do not tend to 0, so the interval is $(-2, 2)$. A test at $x = 1$: the series is $\tfrac14 - \tfrac{1}{16} + \tfrac{1}{64} - \cdots = \dfrac{1/4}{1 + 1/4} = \tfrac15$, and $\dfrac{1}{4 + 1} = \tfrac15$.

```check
same(series(1/(1 - 3*x), x, 0, 8).removeO(), sum(3**j*x**j for j in range(8)))
same(solve_univariate_inequality(Abs(3*x) < 1, x, relational=False), Interval.open(-Rational(1, 3), Rational(1, 3)))
same(series(x**2/(1 + x), x, 0, 10).removeO(), sum((-1)**j*x**(j + 2) for j in range(8)))
steps(1/(4 + x**2), Rational(1, 4)/(1 + x**2/4))
same(series(1/(4 + x**2), x, 0, 14).removeO(), sum((-1)**j*x**(2*j)/4**(j + 1) for j in range(7)))
same(solve_univariate_inequality(x**2/4 < 1, x, relational=False), Interval.open(-2, 2))
same(summation((-1)**n/4**(n + 1), (n, 0, oo)), Rational(1, 5)); same(Rational(1, 4)/(1 + Rational(1, 4)), Rational(1, 5))
```
:::
::::

:::: exercise Estimating cos 0.2 {#ex-15-3} ★
- (a) Write down the Maclaurin polynomial $T_4$ of $\cos x$.
- (b) Use it to estimate $\cos 0.2$.
- (c) Bound the error with Taylor's inequality, and compare the bound with the actual error.

::: solution
**(a)** $T_4(x) = 1 - \dfrac{x^2}{2} + \dfrac{x^4}{24}$.

**(b)** $T_4(0.2) = 1 - 0.02 + \dfrac{0.0016}{24} = 0.98 + 0.0000666\ldots \approx 0.98006667$.

**(c)** Every derivative of $\cos$ is $\pm\sin$ or $\pm\cos$, so $M = 1$ will do. The coefficient of $x^5$ is 0, so $T_4 = T_5$, and Taylor's inequality with $n = 5$ gives

$$\abs{\cos 0.2 - T_4(0.2)} \le \frac{0.2^6}{6!} = \frac{0.000064}{720} \approx 8.9 \times 10^{-8}.$$

A calculator gives $\cos 0.2 \approx 0.98006658$, so the error is about $-8.9 \times 10^{-8}$: the bound is almost exact, because the next term of the series, $-x^6/720$, makes up nearly all of the error. With $n = 4$ the inequality gives only $0.2^5/5! \approx 2.7 \times 10^{-6}$, true but thirty times larger.

```check
T4c = 1 - x**2/2 + x**4/24; v2 = Rational(1, 5)
same(series(cos(x), x, 0, 6).removeO(), T4c)
same(T4c.subs(x, v2), 1 - Rational(2, 100) + Rational(16, 10000)/24); rounds(T4c.subs(x, v2), '0.98006667')
same(v2**6, Rational(64, 10**6)); same(factorial(6), 720); rounds(v2**6/factorial(6), '8.9e-8')
rounds(cos(v2), '0.98006658'); rounds(cos(v2) - T4c.subs(x, v2), '-8.9e-8'); holds(Abs(cos(v2) - T4c.subs(x, v2)) <= v2**6/factorial(6))
rounds(v2**5/factorial(5), '2.7e-6'); rounds((v2**5/factorial(5))/(v2**6/factorial(6)), '30')
```
:::
::::

:::: exercise New series from old {#ex-15-4} ★
Use the standard series to find the Maclaurin series of each function, with its first three nonzero terms, and say for which $x$ it equals the function.

- (a) $x^2e^{-x}$
- (b) $\sin(x^2)$
- (c) $\cosh x = \tfrac12(e^x + e^{-x})$

::: solution
**(a)** Put $-x$ for $x$ in the series of $e^x$, then multiply by $x^2$:

$$x^2e^{-x} = x^2\sum_{n=0}^\infty \frac{(-x)^n}{n!} = \sum_{n=0}^\infty (-1)^n\frac{x^{n+2}}{n!} = x^2 - x^3 + \frac{x^4}{2} - \cdots,$$

for every $x$, since the series of $e^x$ equals $e^x$ for every $x$.

**(b)** Put $x^2$ for $x$ in the series of $\sin x$:

$$\sin(x^2) = \sum_{n=0}^\infty (-1)^n\frac{x^{4n+2}}{(2n + 1)!} = x^2 - \frac{x^6}{6} + \frac{x^{10}}{120} - \cdots,$$

for every $x$.

**(c)** Add the series of $e^x$ and $e^{-x}$: the term in $x^n$ is $\big(1 + (-1)^n\big)\dfrac{x^n}{n!}$, which is 0 for odd $n$ and $\dfrac{2x^n}{n!}$ for even $n$. Halving,

$$\cosh x = \sum_{n=0}^\infty \frac{x^{2n}}{(2n)!} = 1 + \frac{x^2}{2} + \frac{x^4}{24} + \cdots,$$

for every $x$: the series of $\cos x$ without its minus signs.

```check
same(series(x**2*exp(-x), x, 0, 8).removeO(), sum((-1)**j*x**(j + 2)/factorial(j) for j in range(6)))
same([(-1)**j/factorial(j) for j in range(3)], [1, -1, Rational(1, 2)])
same(series(sin(x**2), x, 0, 16).removeO(), sum((-1)**j*x**(4*j + 2)/factorial(2*j + 1) for j in range(4)))
same([factorial(2*j + 1) for j in range(3)], [1, 6, 120])
same(cosh(x).rewrite(exp), (exp(x) + exp(-x))/2); same([1 + (-1)**j for j in range(6)], [2, 0, 2, 0, 2, 0])
same(series(cosh(x), x, 0, 12).removeO(), sum(x**(2*j)/factorial(2*j) for j in range(6)))
same(summation(x**(2*n)/factorial(2*n), (n, 0, oo)), cosh(x))
```
:::
::::

:::: exercise Sums by differentiating {#ex-15-5} ★★
Example 15.6 showed that $\displaystyle\sum_{n=1}^\infty n x^n = \frac{x}{(1 - x)^2}$ for $\abs{x} < 1$.

- (a) Find $\displaystyle\sum_{n=1}^\infty \frac{n}{3^n}$.
- (b) Show that $\displaystyle\sum_{n=1}^\infty n^2x^n = \frac{x(1 + x)}{(1 - x)^3}$ for $\abs{x} < 1$.
- (c) Find $\displaystyle\sum_{n=1}^\infty \frac{n^2}{2^n}$.

::: solution
**(a)** Put $x = \tfrac13$: $\dfrac{1/3}{(2/3)^2} = \dfrac{1/3}{4/9} = \dfrac34$.

**(b)** Differentiate $\sum n x^n = \dfrac{x}{(1 - x)^2}$ term by term (Theorem 15.2, inside the radius 1). On the right, by the quotient rule, and then cancelling a factor $1 - x$:

$$\frac{d}{dx}\,\frac{x}{(1 - x)^2} = \frac{(1 - x)^2 + 2x(1 - x)}{(1 - x)^4} = \frac{(1 - x) + 2x}{(1 - x)^3} = \frac{1 + x}{(1 - x)^3}.$$

On the left the derivative is $\sum n^2 x^{n-1}$. Multiplying by $x$ gives $\sum n^2 x^n = \dfrac{x(1 + x)}{(1 - x)^3}$.

**(c)** At $x = \tfrac12$: $\dfrac{\tfrac12\cdot\tfrac32}{(1/2)^3} = \dfrac34\cdot8 = 6$.

```check
same((x/(1 - x)**2).subs(x, Rational(1, 3)), Rational(3, 4)); same(summation(n/3**n, (n, 1, oo)), Rational(3, 4))
steps(diff(x/(1 - x)**2, x), ((1 - x)**2 + 2*x*(1 - x))/(1 - x)**4, ((1 - x) + 2*x)/(1 - x)**3, (1 + x)/(1 - x)**3)
same(diff(n*x**n, x)*x, n**2*x**n)
same(series(x*(1 + x)/(1 - x)**3, x, 0, 10).removeO(), sum(j**2*x**j for j in range(1, 10)))
same((x*(1 + x)/(1 - x)**3).subs(x, Rational(1, 2)), 6); same(summation(n**2/2**n, (n, 1, oo)), 6)
```
:::
::::

:::: exercise Square roots by the binomial series {#ex-15-6} ★★
- (a) Use the first four terms of the series of $\sqrt{1 + x}$ (Example 15.10) to estimate $\sqrt{1.1}$.
- (b) Show that, for $0 < x < 1$, the terms of this series after the first alternate in sign and decrease in size, and use this to bound the error of (a).
- (c) Estimate $\sqrt{110}$, with an error bound.

::: solution
**(a)** $\sqrt{1.1} \approx 1 + \dfrac{0.1}{2} - \dfrac{0.01}{8} + \dfrac{0.001}{16} = 1 + 0.05 - 0.00125 + 0.0000625 = 1.0488125$.

**(b)** The ratio of consecutive coefficients is

$$\binom{1/2}{n+1}\Big/\binom{1/2}{n} = \frac{\tfrac12 - n}{n + 1},$$

which for $n \ge 1$ is negative and has size $\dfrac{n - \tfrac12}{n + 1} < 1$. So for $0 < x < 1$, from the term in $x$ on, each term has the opposite sign to the one before and is smaller in size (its size is multiplied by $\tfrac{n - 1/2}{n + 1}\,x < 1$), and the terms tend to 0. By the alternating series bound of Module 14, applied to the series from its second term on, the error is less than the first term left out:

$$\abs{\binom{1/2}{4}x^4} = \frac{5}{128}(0.1)^4 \approx 3.9 \times 10^{-6}.$$

Indeed $\sqrt{1.1} \approx 1.0488088$, and the error of 1.0488125 is about $-3.7 \times 10^{-6}$.

**(c)** $\sqrt{110} = \sqrt{100 \times 1.1} = 10\sqrt{1.1} \approx 10.488125$, with error less than $10 \times 3.9 \times 10^{-6} = 3.9 \times 10^{-5}$. So $\sqrt{110}$ lies between 10.488086 and 10.488125, and to four decimal places it is 10.4881 (a calculator gives 10.488088).

```check
v3 = Rational(1, 10); est = 1 + v3/2 - v3**2/8 + v3**3/16
same([v3/2, v3**2/8, v3**3/16], [Rational(5, 100), Rational(125, 100000), Rational(625, 10**7)]); same(est, Rational(10488125, 10**7))
same(expand_func(binomial(Rational(1, 2), nB + 1)/binomial(Rational(1, 2), nB)), (Rational(1, 2) - nB)/(nB + 1))
holds(all((Rational(1, 2) - j)/(j + 1) < 0 and Abs((Rational(1, 2) - j)/(j + 1)) < 1 for j in range(1, 60)))
same(binomial(Rational(1, 2), 4), -Rational(5, 128)); rounds(Rational(5, 128)*v3**4, '3.9e-6')
rounds(sqrt(Rational(11, 10)), '1.0488088'); rounds(sqrt(Rational(11, 10)) - est, '-3.7e-6'); holds(Abs(sqrt(Rational(11, 10)) - est) < Rational(5, 128)*v3**4)
same(sqrt(110), 10*sqrt(Rational(11, 10))); rounds(10*Rational(5, 128)*v3**4, '3.9e-5')
holds(10*est - 10*Rational(5, 128)*v3**4 > Rational(10488086, 10**6)); rounds(10*est - Rational(39, 10**6), '10.4881'); rounds(10*est, '10.4881')
rounds(sqrt(110), '10.488088')
```
:::
::::

:::: exercise Estimating ln 0.8 {#ex-15-7} ★★
- (a) Use the Maclaurin polynomial $T_3$ of $\ln(1 + x)$ to estimate $\ln 0.8$.
- (b) Bound the error with Taylor's inequality.
- (c) Why can you not use the alternating series bound here? Compare the bound of (b) with the actual error.

::: solution
**(a)** $T_3(x) = x - \dfrac{x^2}{2} + \dfrac{x^3}{3}$ and $0.8 = 1 + x$ with $x = -0.2$, so

$$\ln 0.8 \approx -0.2 - \frac{0.04}{2} + \frac{-0.008}{3} = -0.2 - 0.02 - 0.0026667 = -0.2226667.$$

**(b)** The derivatives of $f(x) = \ln(1 + x)$ are $\dfrac{1}{1 + x}$, $-\dfrac{1}{(1 + x)^2}$, $\dfrac{2}{(1 + x)^3}$ and $f^{(4)}(x) = -\dfrac{6}{(1 + x)^4}$. For $t$ between $-0.2$ and 0, $1 + t \ge 0.8$, so $\abs{f^{(4)}(t)} \le \dfrac{6}{0.8^4} = 14.6484375$, and

$$\abs{\ln 0.8 - T_3(-0.2)} \le \frac{14.6484375}{4!}\,(0.2)^4 \approx 0.00098.$$

**(c)** At $x = -0.2$ every term of the series, $-0.2 - 0.02 - 0.0026667 - 0.0004 - \cdots$, is negative: the series does not alternate, so the alternating series bound does not apply. It would have claimed an error less than the next term, 0.0004, which is false: $\ln 0.8 \approx -0.2231436$, and the error is about $-0.00048$. Taylor's inequality, which needs no alternating signs, gives the safe bound 0.00098. The Lagrange form even gives the sign: $f^{(4)} < 0$, so $R_3 < 0$ and $T_3$ overestimates.

```check
fl = log(1 + x)
same([diff(fl, x, j) for j in range(1, 5)], [1/(1 + x), -1/(1 + x)**2, 2/(1 + x)**3, -6/(1 + x)**4])
T3l = x - x**2/2 + x**3/3; vm = -Rational(1, 5)
same(T3l.subs(x, vm), -Rational(2, 10) - Rational(2, 100) - Rational(8, 3000)); rounds(T3l.subs(x, vm), '-0.2226667')
same(6/Rational(4, 5)**4, Rational(146484375, 10**7)); rounds(Rational(146484375, 10**7)/24*vm**4, '0.00098')
rounds(log(Rational(4, 5)), '-0.2231436'); rounds(log(Rational(4, 5)) - T3l.subs(x, vm), '-0.00048')
holds(Abs(log(Rational(4, 5)) - T3l.subs(x, vm)) <= Rational(146484375, 10**7)/24*vm**4)
holds(all((-1)**(j - 1)*vm**j/j < 0 for j in range(1, 12))); same(Abs(vm**4/4), Rational(4, 10000))
holds(Abs(log(Rational(4, 5)) - T3l.subs(x, vm)) > Rational(4, 10000)); holds(log(Rational(4, 5)) - T3l.subs(x, vm) < 0)
```
:::
::::

:::: exercise Limits by series {#ex-15-8} ★★
Use series to find each limit.

- (a) $\displaystyle\lim_{x\to0}\frac{e^x - 1 - x - x^2/2}{x^3}$
- (b) $\displaystyle\lim_{x\to0}\frac{x - \arctan x}{x^3}$
- (c) $\displaystyle\lim_{x\to0}\frac{e^{x^2} - \cos x}{x^2}$

::: solution
**(a)** $e^x = 1 + x + \dfrac{x^2}{2} + \dfrac{x^3}{6} + O(x^4)$, so the numerator is $\dfrac{x^3}{6} + O(x^4)$, and the quotient is $\dfrac16 + O(x) \to \dfrac16$.

**(b)** $\arctan x = x - \dfrac{x^3}{3} + O(x^5)$ (for $\abs{x} \le \tfrac12$, say, the alternating series bound makes the error at most $\abs{x}^5/5$). So $x - \arctan x = \dfrac{x^3}{3} + O(x^5)$, and the limit is $\dfrac13$.

**(c)** Substitute $x^2$ in $e^u = 1 + u + O(u^2)$: $e^{x^2} = 1 + x^2 + O(x^4)$. And $\cos x = 1 - \dfrac{x^2}{2} + O(x^4)$. So $e^{x^2} - \cos x = \dfrac32x^2 + O(x^4)$, and the limit is $\dfrac32$. Stopping at the first terms, $e^{x^2} \approx 1$ and $\cos x \approx 1$, would leave $0/x^2$ and the wrong answer 0: keep terms up to the order of the denominator.

```check
same(series(exp(x) - 1 - x - x**2/2, x, 0, 4).removeO(), x**3/6); limit_is((exp(x) - 1 - x - x**2/2)/x**3, x, 0, Rational(1, 6))
same(series(x - atan(x), x, 0, 5).removeO(), x**3/3); limit_is((x - atan(x))/x**3, x, 0, Rational(1, 3))
holds(all(Abs(atan(Rational(k_, 10)) - (Rational(k_, 10) - Rational(k_, 10)**3/3)) <= Rational(k_, 10)**5/5 for k_ in range(1, 6)))
same(series(exp(x**2), x, 0, 4).removeO(), 1 + x**2); same(series(exp(x**2) - cos(x), x, 0, 4).removeO(), Rational(3, 2)*x**2)
limit_is((exp(x**2) - cos(x))/x**2, x, 0, Rational(3, 2))
```
:::
::::

:::: exercise Trigonometry from Euler's formula {#ex-15-9} ★★
- (a) Use $\big(e^{i\theta}\big)^2 = e^{2i\theta}$ to find formulas for $\cos 2\theta$ and $\sin 2\theta$.
- (b) Use $\big(e^{i\theta}\big)^3 = e^{3i\theta}$ to show that $\cos 3\theta = 4\cos^3\theta - 3\cos\theta$ and $\sin 3\theta = 3\sin\theta - 4\sin^3\theta$.
- (c) Use $\cos\theta = \tfrac12\big(e^{i\theta} + e^{-i\theta}\big)$ to show that $\cos^2\theta = \tfrac12(1 + \cos 2\theta)$, the identity behind $\int\cos^2\theta\,d\theta$ in Module 11.

::: solution
Write $c = \cos\theta$ and $s = \sin\theta$, so that $e^{i\theta} = c + is$.

**(a)** $(c + is)^2 = c^2 + 2ics + i^2s^2 = (c^2 - s^2) + i\,2sc$. And $e^{2i\theta} = \cos 2\theta + i\sin 2\theta$. Equal complex numbers have equal real parts and equal imaginary parts, so $\cos 2\theta = \cos^2\theta - \sin^2\theta$ and $\sin 2\theta = 2\sin\theta\cos\theta$.

**(b)** Expand the cube, with $i^2 = -1$ and $i^3 = -i$:

$$(c + is)^3 = c^3 + 3c^2(is) + 3c(is)^2 + (is)^3 = (c^3 - 3cs^2) + i(3c^2s - s^3).$$

With $s^2 = 1 - c^2$, the real part is $c^3 - 3c(1 - c^2) = 4c^3 - 3c$; with $c^2 = 1 - s^2$, the imaginary part is $3(1 - s^2)s - s^3 = 3s - 4s^3$. Comparing with $e^{3i\theta} = \cos 3\theta + i\sin 3\theta$ gives both formulas.

**(c)** Square, using $e^{i\theta}e^{-i\theta} = e^0 = 1$:

$$\cos^2\theta = \frac{e^{2i\theta} + 2 + e^{-2i\theta}}{4} = \frac12 + \frac12\cdot\frac{e^{2i\theta} + e^{-2i\theta}}{2} = \frac12(1 + \cos 2\theta).$$

```check
cs_, sn_ = symbols('c s', real=True)
same(expand((cs_ + I*sn_)**2), cs_**2 - sn_**2 + 2*I*sn_*cs_); same(expand_trig(cos(2*theta)), cos(theta)**2 - sin(theta)**2)
same(expand_trig(sin(2*theta)), 2*sin(theta)*cos(theta))
same(expand((cs_ + I*sn_)**3), cs_**3 - 3*cs_*sn_**2 + I*(3*cs_**2*sn_ - sn_**3))
same(expand(cs_**3 - 3*cs_*(1 - cs_**2)), 4*cs_**3 - 3*cs_); same(expand(3*(1 - sn_**2)*sn_ - sn_**3), 3*sn_ - 4*sn_**3)
same(expand_trig(cos(3*theta)), 4*cos(theta)**3 - 3*cos(theta)); same(expand_trig(sin(3*theta)), 3*sin(theta) - 4*sin(theta)**3)
same(expand(((exp(I*thr) + exp(-I*thr))/2)**2), exp(2*I*thr)/4 + Rational(1, 2) + exp(-2*I*thr)/4)
same(expand_complex(exp(2*I*thr)/4 + Rational(1, 2) + exp(-2*I*thr)/4), (1 + cos(2*thr))/2); same((1 + cos(2*theta))/2, cos(theta)**2)
```
:::
::::

:::: exercise The number e is irrational {#ex-15-10} ★★★
Suppose, to the contrary, that $e = p/q$ for whole numbers $p$ and $q \ge 1$. Since also $e = 2p/(2q)$, you may assume that $q \ge 2$. Let $s_q = \sum_{k=0}^{q} 1/k!$.

- (a) Show that $q!\,(e - s_q)$ is a whole number.
- (b) Use the bound $0 < e - s_n < \dfrac{3}{(n + 1)!}$ of Section 15.6 to show that $0 < q!\,(e - s_q) < 1$.
- (c) Conclude that $e$ is irrational.

::: solution
**(a)** $q!\,e = q!\,\dfrac{p}{q} = p\,(q - 1)!$, a whole number. And $q!\,s_q = \sum_{k=0}^{q} \dfrac{q!}{k!}$, where each $\dfrac{q!}{k!} = (k + 1)(k + 2)\cdots q$ (or 1, when $k = q$) is a whole number. So $q!\,(e - s_q)$ is the difference of two whole numbers: a whole number.

**(b)** Multiply $0 < e - s_q < \dfrac{3}{(q + 1)!}$ by $q!$:

$$0 < q!\,(e - s_q) < \frac{3\,q!}{(q + 1)!} = \frac{3}{q + 1} \le 1,$$

since $q \ge 2$.

**(c)** By (a) and (b), $q!\,(e - s_q)$ is a whole number strictly between 0 and 1. There is no such number, so the assumption $e = p/q$ is false: $e$ is irrational. The proof works because the series of $e$ converges so fast that the error after the term $1/q!$ is too small to be a multiple of $1/q!$.

```check
qI = symbols('q', integer=True, positive=True); pI = symbols('p', integer=True, positive=True)
same(factorial(qI)*(pI/qI), pI*factorial(qI - 1))
for Q_ in range(2, 9):
    holds(all((factorial(Q_)/factorial(j)).is_integer for j in range(Q_ + 1)))
    holds(0 < factorial(Q_)*(E - sE(Q_))); holds(factorial(Q_)*(E - sE(Q_)) < Rational(3, Q_ + 1)); holds(Rational(3, Q_ + 1) <= 1)
same(factorial(qI)*3/factorial(qI + 1), 3/(qI + 1))
```
:::
::::

:::: exercise Machin's formula {#ex-15-11} ★★★
Let $\alpha = \arctan\tfrac15$. Use the formula $\tan(u + v) = \dfrac{\tan u + \tan v}{1 - \tan u\tan v}$, which follows from the addition formulas of Module 1.

- (a) Show that $\tan 2\alpha = \tfrac{5}{12}$ and $\tan 4\alpha = \tfrac{120}{119}$.
- (b) Show that $\tan\big(4\alpha - \tfrac{\pi}{4}\big) = \tfrac{1}{239}$, and conclude that $\dfrac{\pi}{4} = 4\arctan\dfrac15 - \arctan\dfrac{1}{239}$.
- (c) In Section 15.6, an error of less than $\tfrac{1}{11\cdot5^{11}}$ in $\arctan\tfrac15$ became an error 16 times as large in $\pi$. How many terms of the series of $\arctan\tfrac15$ guarantee an error below $10^{-12}$ in $\pi$ from that series?

::: solution
**(a)** With $u = v$, the formula gives $\tan 2u = \dfrac{2\tan u}{1 - \tan^2u}$. So

$$\tan 2\alpha = \frac{2/5}{1 - 1/25} = \frac25\cdot\frac{25}{24} = \frac{5}{12}, \qquad \tan 4\alpha = \frac{10/12}{1 - 25/144} = \frac56\cdot\frac{144}{119} = \frac{120}{119}.$$

**(b)** With $-v$ in place of $v$, and $\tan(-v) = -\tan v$, the formula gives $\tan(u - v) = \dfrac{\tan u - \tan v}{1 + \tan u\tan v}$. With $u = 4\alpha$ and $v = \tfrac{\pi}{4}$, where $\tan\tfrac{\pi}{4} = 1$:

$$\tan\Big(4\alpha - \frac{\pi}{4}\Big) = \frac{120/119 - 1}{1 + 120/119} = \frac{1/119}{239/119} = \frac{1}{239}.$$

To conclude that $4\alpha - \tfrac{\pi}{4} = \arctan\tfrac{1}{239}$, the angle must lie in $\big(-\tfrac{\pi}{2}, \tfrac{\pi}{2}\big)$, the range of $\arctan$ (Module 6). For $x > 0$, $\arctan x = \int_0^x \dfrac{dt}{1 + t^2} < \int_0^x dt = x$, so $0 < \alpha < \tfrac15$, and $-\tfrac{\pi}{4} < 4\alpha - \tfrac{\pi}{4} < \tfrac45 - \tfrac{\pi}{4} < \tfrac{\pi}{2}$. So $4\alpha - \tfrac{\pi}{4} = \arctan\tfrac{1}{239}$, which rearranges to Machin's formula.

**(c)** With $n$ terms the error in $\arctan\tfrac15$ is less than the first term left out, $\dfrac{(1/5)^{2n+1}}{2n + 1}$, and the error in $\pi$ is less than 16 times that. For $n = 8$, $16\cdot\dfrac{5^{-17}}{17} \approx 1.2 \times 10^{-12}$, not enough; for $n = 9$, $16\cdot\dfrac{5^{-19}}{19} \approx 4.4 \times 10^{-14}$. So 9 terms suffice.

```check
same(expand_trig(tan(2*theta)), 2*tan(theta)/(1 - tan(theta)**2)); same(tan(2*atan(Rational(1, 5))), Rational(5, 12)); same(tan(4*atan(Rational(1, 5))), Rational(120, 119))
same(2*Rational(1, 5)/(1 - Rational(1, 25)), Rational(5, 12)); same(2*Rational(5, 12)/(1 - Rational(25, 144)), Rational(120, 119))
same(expand_trig(tan(theta - pi/4)), (tan(theta) - 1)/(1 + tan(theta))); same((Rational(120, 119) - 1)/(1 + Rational(120, 119)), Rational(1, 239))
al_ = atan(Rational(1, 5)); same(integrate(1/(1 + tt**2), (tt, 0, x)), atan(x))
holds(al_ < Rational(1, 5)); holds(Rational(4, 5) - pi/4 < pi/2); holds(4*al_ - pi/4 > -pi/4)
near(4*al_ - pi/4, atan(Rational(1, 239)), 1e-25)
rounds(16*Rational(1, 5)**17/17, '1.2e-12'); rounds(16*Rational(1, 5)**19/19, '4.4e-14')
holds(16*Rational(1, 5)**17/17 > Rational(1, 10**12)); holds(16*Rational(1, 5)**19/19 < Rational(1, 10**12))
```
:::
::::

:::: exercise Newton's method converges quadratically {#ex-15-12} ★★★
Prove Theorem 7.3. Let $f(r) = 0$, let $f'$ and $f''$ be continuous on an open interval containing $r$, and let $f'(r) \ne 0$.

- (a) Show that there are numbers $\delta > 0$ and $K \ge 0$ with $K\delta \le \tfrac12$ such that $f'(x) \ne 0$ and $\abs{\dfrac{f''(c)}{2f'(x)}} \le K$ for all $x$ and $c$ in $[r - \delta, r + \delta]$.
- (b) Using the identity $e_{n+1} = \dfrac{f''(c_n)}{2f'(x_n)}\,e_n^2$ of Section 15.5, show that if $\abs{x_0 - r} \le \delta$, then $\abs{e_{n+1}} \le \tfrac12\abs{e_n}$ for every $n$, so that $x_n \to r$.
- (c) Deduce that $e_{n+1}/e_n^2 \to f''(r)/\big(2f'(r)\big)$, if no $x_n$ equals $r$.

::: solution
**(a)** Since $f'$ is continuous at $r$ and $f'(r) \ne 0$, there is a $\delta_1 > 0$ such that $\abs{f'(x) - f'(r)} < \tfrac12\abs{f'(r)}$, and so $\abs{f'(x)} > \tfrac12\abs{f'(r)} > 0$, for $\abs{x - r} \le \delta_1$ (taking $\delta_1$ so small that this closed interval lies in the open interval of the hypothesis). On the closed interval $[r - \delta_1, r + \delta_1]$ the continuous function $\abs{f''}$ has a largest value $B$, by the Extreme Value Theorem (Module 3). So for $x$ and $c$ in that interval

$$\abs{\frac{f''(c)}{2f'(x)}} \le \frac{B}{2\cdot\tfrac12\abs{f'(r)}} = \frac{B}{\abs{f'(r)}} = K.$$

If $K = 0$, take $\delta = \delta_1$; otherwise take $\delta$ the smaller of $\delta_1$ and $\dfrac{1}{2K}$. A smaller interval keeps both properties, and $K\delta \le \tfrac12$.

**(b)** By induction on $n$, show that $\abs{e_n} \le \delta$ and that $x_{n+1}$ is defined, with $\abs{e_{n+1}} \le \tfrac12\abs{e_n}$. Suppose $\abs{e_n} \le \delta$, as is true for $n = 0$. Then $x_n$ lies in $[r - \delta, r + \delta]$, so $f'(x_n) \ne 0$ and Newton's step gives $x_{n+1}$. The identity holds with $c_n$ between $x_n$ and $r$, hence also in the interval, so

$$\abs{e_{n+1}} \le K e_n^2 = (K\abs{e_n})\,\abs{e_n} \le K\delta\,\abs{e_n} \le \tfrac12\abs{e_n} \le \delta.$$

So $\abs{e_n} \le \delta/2^n$ for every $n$, which tends to 0: $x_n \to r$.

**(c)** $\dfrac{e_{n+1}}{e_n^2} = \dfrac{f''(c_n)}{2f'(x_n)}$. As $n \to \infty$, $x_n \to r$, and $c_n$, which lies between $x_n$ and $r$, tends to $r$ too, by the squeeze theorem. Since $f''$ and $f'$ are continuous at $r$ and $f'(r) \ne 0$, the quotient tends to $\dfrac{f''(r)}{2f'(r)}$. For $f(x) = x^2 - 2$ this is $\dfrac{2}{4\sqrt2} = \dfrac{1}{2\sqrt2} \approx 0.354$, the constant of Example 7.9.

```check
fq_ = x**2 - 2; r_ = sqrt(2)
xs_ = [Rational(3, 2)]
for _ in range(5):
    xs_.append(xs_[-1] - fq_.subs(x, xs_[-1])/diff(fq_, x).subs(x, xs_[-1]))
es_ = [v_ - r_ for v_ in xs_]
for j in range(5):
    holds(Abs(es_[j + 1]) <= Abs(es_[j])/2)
rounds(es_[4]/es_[3]**2, '0.354'); same((diff(fq_, x, 2)/(2*diff(fq_, x))).subs(x, r_), 1/(2*sqrt(2))); rounds(1/(2*sqrt(2)), '0.354')
same(2/(4*sqrt(2)), 1/(2*sqrt(2)))
Bs, Fs = symbols('B F', positive=True); same(Bs/(2*Fs/2), Bs/Fs)
```
:::
::::

## Check yourself {#quiz}

```quiz
? The radius of convergence of $\displaystyle\sum_{n=1}^\infty \frac{x^n}{n\,3^n}$ is
- [ ] $\tfrac13$
- [ ] $1$
- [x] $3$
- [ ] $\infty$
> $\abs{c_{n+1}/c_n} = \dfrac{n}{3(n + 1)} \to \dfrac13$, so $R = 3$. $\tfrac13$ is the limit $L$ itself, not $1/L$; 1 ignores the factor $3^n$; $R = \infty$ would need $L = 0$.

? The interval of convergence of $\displaystyle\sum_{n=1}^\infty \frac{(x - 2)^n}{n}$ is
- [ ] $(1, 3)$
- [x] $[1, 3)$
- [ ] $(1, 3]$
- [ ] $[1, 3]$
> The centre is 2 and $R = 1$. At $x = 3$ the series is the harmonic series $\sum 1/n$, which diverges; at $x = 1$ it is $\sum (-1)^n/n$, which converges by the alternating series test. $(1, 3)$ leaves out $x = 1$, and $(1, 3]$ and $[1, 3]$ wrongly include $x = 3$.

? The coefficient of $x^4$ in the Maclaurin series of $e^{2x}$ is
- [ ] $\tfrac{1}{24}$
- [ ] $\tfrac{1}{12}$
- [ ] $16$
- [x] $\tfrac23$
> $e^{2x} = \sum (2x)^n/n!$, so the coefficient of $x^4$ is $2^4/4! = 16/24 = \tfrac23$; equivalently $f^{(4)}(0)/4!$ with $f^{(4)}(x) = 16e^{2x}$. $\tfrac{1}{24}$ forgets the factor $2^4$, $\tfrac{1}{12}$ uses $2$ instead of $2^4$, and 16 forgets to divide by $4!$.

? The Maclaurin series of $\dfrac{1}{1 + x^2}$, and where it converges, are
- [x] $1 - x^2 + x^4 - x^6 + \cdots$, for $-1 < x < 1$
- [ ] $1 - x^2 + x^4 - x^6 + \cdots$, for every $x$
- [ ] $1 + x^2 + x^4 + x^6 + \cdots$, for $-1 < x < 1$
- [ ] $x - \tfrac{x^3}{3} + \tfrac{x^5}{5} - \cdots$, for $-1 \le x \le 1$
> Put $u = -x^2$ in $\dfrac{1}{1 - u} = \sum u^n$, valid for $\abs{u} < 1$, that is, $\abs{x} < 1$. The function is defined for every $x$, but its series diverges for $\abs{x} \ge 1$; the signs alternate because $u = -x^2$; and the last series is that of $\arctan x$, an antiderivative.

? If $f(1) = 2$, $f'(1) = 3$ and $f''(1) = 4$, the Taylor polynomial $T_2$ of $f$ about 1 is
- [ ] $2 + 3x + 2x^2$
- [ ] $2 + 3(x - 1) + 4(x - 1)^2$
- [x] $2 + 3(x - 1) + 2(x - 1)^2$
- [ ] $2 + 3(x - 1) + 8(x - 1)^2$
> $T_2(x) = f(1) + f'(1)(x - 1) + \dfrac{f''(1)}{2!}(x - 1)^2$, and $4/2! = 2$. Forgetting to divide by $2!$ gives $4(x - 1)^2$, multiplying instead gives $8(x - 1)^2$, and powers of $x$ instead of $x - 1$ give a polynomial about 0.

? With $M = 1$, and using $T_3 = T_4$ for $\sin x$, Taylor's inequality guarantees that $\abs{\sin 0.1 - \big(0.1 - \tfrac{0.1^3}{6}\big)}$ is at most
- [ ] $\tfrac{0.1^4}{4!} \approx 4.2 \times 10^{-6}$
- [x] $\tfrac{0.1^5}{5!} \approx 8.3 \times 10^{-8}$
- [ ] $\tfrac{0.1^3}{3!} \approx 1.7 \times 10^{-4}$
- [ ] $0.1^5 = 10^{-5}$
> The coefficient of $x^4$ is 0, so $T_3 = T_4$, and $R_4$ is bounded by $M\abs{x}^5/5! = 10^{-5}/120 \approx 8.3 \times 10^{-8}$. $0.1^4/4!$ is the bound for $R_3$, true but weaker; $0.1^3/3!$ is the size of the last term kept, not the error; $10^{-5}$ forgets to divide by $5!$.

? $\displaystyle\lim_{x\to0}\frac{x - \sin x}{x^3}$ equals
- [x] $\tfrac16$
- [ ] $-\tfrac16$
- [ ] $0$
- [ ] $\tfrac13$
> $\sin x = x - \tfrac{x^3}{6} + O(x^5)$, so $x - \sin x = \tfrac{x^3}{6} + O(x^5)$ and the quotient tends to $\tfrac16$. $-\tfrac16$ is the limit of $(\sin x - x)/x^3$; 0 comes from replacing $\sin x$ by $x$ alone; $\tfrac13$ is the limit with $\arctan x$ in place of $\sin x$.

? By Euler's formula, $e^{i\pi/2}$ equals
- [ ] $-1$
- [ ] $1$
- [x] $i$
- [ ] $-i$
> $e^{i\pi/2} = \cos\tfrac{\pi}{2} + i\sin\tfrac{\pi}{2} = 0 + i = i$: a quarter turn round the unit circle. $-1$ is $e^{i\pi}$, a half turn; 1 is $e^0$; $-i$ is $e^{-i\pi/2}$.
```

```check
same((1/((n + 1)*3**(n + 1)))/(1/(n*3**n)), n/(3*(n + 1))); limit_is(n/(3*(n + 1)), n, oo, Rational(1, 3))
holds(Sum(1/n, (n, 1, oo)).is_convergent() == False); holds(Sum((-1)**n/n, (n, 1, oo)).is_convergent())
same(series(exp(2*x), x, 0, 5).removeO().coeff(x, 4), Rational(2, 3)); same(diff(exp(2*x), x, 4).subs(x, 0)/factorial(4), Rational(2, 3))
same(series(1/(1 + x**2), x, 0, 8).removeO(), 1 - x**2 + x**4 - x**6)
fQ = 2 + 3*(x - 1) + 2*(x - 1)**2; same([diff(fQ, x, j).subs(x, 1) for j in range(3)], [2, 3, 4])
rounds(Rational(1, 10)**5/120, '8.3e-8'); rounds(Rational(1, 10)**4/24, '4.2e-6'); rounds(Rational(1, 10)**3/6, '1.7e-4')
holds(Abs(sin(Rational(1, 10)) - (Rational(1, 10) - Rational(1, 6000))) <= Rational(1, 10)**5/120)
limit_is((x - sin(x))/x**3, x, 0, Rational(1, 6)); limit_is((sin(x) - x)/x**3, x, 0, -Rational(1, 6)); limit_is((x - atan(x))/x**3, x, 0, Rational(1, 3))
same(exp(I*pi/2), I); same(exp(-I*pi/2), -I); same(exp(I*pi), -1); same(exp(0), 1)
```
