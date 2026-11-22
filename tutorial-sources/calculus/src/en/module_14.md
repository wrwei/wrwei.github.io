---
title: Sequences and series
part: 4
lead: Learn when an infinite list of numbers settles down to a limit, and what it means to add up infinitely many numbers. You will sum geometric and telescoping series, see why the harmonic series diverges although its terms shrink to 0, decide convergence with a toolkit of tests, and estimate sums with a guaranteed error.
minutes: 270
needs: Modules 1 to 13, especially limits (Modules 2 and 3), L'Hôpital's rule (Module 7) and improper integrals (Module 12)
goals:
  - Find limits of sequences with the limit laws, the squeeze theorem and limits of functions, and prove simple limits with ε and N
  - Show that a monotone bounded sequence converges, and find the limit of a recursive sequence
  - Sum geometric and telescoping series, and explain why the harmonic series diverges although its terms tend to 0
  - Decide whether a series converges with the divergence, integral, comparison, alternating series, ratio and root tests, choosing the test by strategy
  - Estimate the sum of a series with a guaranteed error bound, from the integral test or the alternating series test
  - Tell absolute from conditional convergence, and explain what rearranging a series can do to its sum
---

## Sequences {#sequences}

Calculus keeps producing lists of numbers that are meant to close in on something. Newton's method for $\sqrt2$ gave $1, \tfrac32, \tfrac{17}{12}, \tfrac{577}{408}, \dots$ ([Module 7](module_07_EN.html#newton)); interest added $n$ times a year turned £1 into $(1 + \tfrac1n)^n$ pounds, for $n = 1, 2, 3, \dots$ ([Module 6](module_06_EN.html#compound-interest)); the bisection method gave intervals half as long at every step ([Module 3](module_03_EN.html#bisection)). Each is a sequence, and the question about each is the same: does it settle down to a limit? This module, which opens Part IV of the series, answers that question first. Then it turns to the one that gives Part IV its name: what does it mean to add up infinitely many numbers?

::: definition Sequence
A **sequence** is an infinite list of numbers in a definite order,

$$a_1, a_2, a_3, \dots, a_n, \dots$$

The number $a_n$, read "a sub n", is the $n$th **term** of the sequence, and $n$ is its **index**. The whole sequence is written $(a_n)$. Precisely, a sequence is a function whose domain is the set of whole numbers from some first index on, usually $n \ge 1$ and sometimes $n \ge 0$; $a_n$ is its value at $n$.
:::

A sequence can be given in three ways:

- by a formula for the $n$th term: $a_n = \dfrac1n$ gives $1, \tfrac12, \tfrac13, \tfrac14, \dots$;
- by a rule that computes each term from the one before, as Newton's method does (Section 14.2);
- by a description: "$\sqrt2$ rounded down to $n$ decimal places" gives $1.4, 1.41, 1.414, 1.4142, \dots$

The graph of a sequence is not a curve but a row of dots, one above each whole number $n$, at height $a_n$. Figure 14.1 shows the sequence

$$a_n = 1 + \frac{(-1)^n}{n}: \qquad 0, \ \frac32, \ \frac23, \ \frac54, \ \frac45, \ \frac76, \ \dots$$

Its terms hop from one side of 1 to the other, and each lands closer to 1 than the one before.

```check
afig = lambda j: 1 + Rational((-1)**j, j)
same([afig(j) for j in range(1, 7)], [0, Rational(3, 2), Rational(2, 3), Rational(5, 4), Rational(4, 5), Rational(7, 6)])
holds(all(Abs(afig(j + 1) - 1) < Abs(afig(j) - 1) for j in range(1, 300)))
holds(all((afig(j) - 1)*(afig(j + 1) - 1) < 0 for j in range(1, 300)))      # the terms alternate sides of 1
```

### The limit of a sequence {#limit}

A sequence $(a_n)$ has the limit $L$ if $a_n$ is as close to $L$ as you like for every large enough $n$. This is the limit at infinity of [Definition 3.7](module_03_EN.html#limits-at-infinity), with $n$ running through the whole numbers only. Made precise in the way that Module 2 made limits of functions precise ([Section 2.7](module_02_EN.html#precise)), it reads:

::: definition Limit of a sequence
$\displaystyle\lim_{n\to\infty} a_n = L$, read "the limit of a sub n as n tends to infinity is L", means: for every number $\varepsilon > 0$ there is a number $N$ such that, for every index $n > N$,

$$\abs{a_n - L} < \varepsilon.$$

Then the sequence **converges** to $L$, also written $a_n \to L$. A sequence that does not converge **diverges**. If for every number $M$ there is an $N$ with $a_n > M$ for every $n > N$, the sequence **diverges to infinity**, written $a_n \to \infty$; $a_n \to -\infty$ is defined in the same way.
:::

It is the game of Module 2 again. The challenger names a tolerance $\varepsilon$; you respond with an $N$, a place in the sequence after which every term lies within $\varepsilon$ of $L$. Where $\delta$ said how close $x$ must be to $a$, $N$ says how far along the sequence you must go. On the graph, every dot from some index on must lie inside the band $L - \varepsilon < y < L + \varepsilon$.

For the sequence of Figure 14.1, $\abs{a_n - 1} = \dfrac1n$, which is less than $\varepsilon$ exactly when $n > \dfrac1\varepsilon$. So $N = \dfrac1\varepsilon$ wins every round, and $a_n \to 1$. For $\varepsilon = 0.25$ it gives $N = 4$: every term after the fourth is inside the band.

::: figure id=fig-14-1
The sequence $a_n = 1 + (-1)^n/n$, drawn as dots. Its terms hop from one side of the limit 1 to the other, ever closer. For the challenge $\varepsilon = 0.25$ (the orange band from 0.75 to 1.25), $N = 4$ is a winning response: every term after the fourth (green) lies inside the band. The fourth, $a_4 = 1.25$, is on its edge. A smaller $\varepsilon$ needs a larger $N$.
:::

```check
same(Abs(afig(7) - 1), Rational(1, 7))
holds(all(Abs(afig(j) - 1) == Rational(1, j) for j in range(1, 200)))
holds(all(Abs(afig(j) - 1) < Rational(1, 4) for j in range(5, 400)))
same(afig(4), Rational(5, 4)); holds(Abs(afig(4) - 1) >= Rational(1, 4))
same(1/Rational(1, 4), 4)
```

::: example An ε–N proof
Prove that $\displaystyle\lim_{n\to\infty}\frac{3n + 1}{n + 2} = 3$, and find an $N$ for the challenge $\varepsilon = 0.01$.

*Scratch work.* Put the difference over one denominator. Its numerator is $3n + 1 - 3(n + 2) = -5$, and $n + 2 > 0$, so

$$\abs{\frac{3n + 1}{n + 2} - 3} = \abs{\frac{-5}{n + 2}} = \frac{5}{n + 2}.$$

This is less than $\varepsilon$ when $n + 2 > 5/\varepsilon$, which certainly holds when $n > 5/\varepsilon$. So try $N = 5/\varepsilon$.

*Proof.* Let $\varepsilon > 0$, and choose $N = 5/\varepsilon$. If $n > N$, then $n + 2 > 5/\varepsilon$, so

$$\abs{\frac{3n + 1}{n + 2} - 3} = \frac{5}{n + 2} < \varepsilon.$$

Every challenge is met, so the limit is 3. For $\varepsilon = 0.01$ the proof gives $N = 500$: every term after the 500th is within 0.01 of 3, for instance $a_{501} = \tfrac{1504}{503} \approx 2.99006$. The smallest $N$ that wins is 498, since $\dfrac{5}{n + 2} < 0.01$ exactly when $n + 2 > 500$; as in Module 2, a proof needs a winning response, not the best one.

```check
nn = symbols('n', positive=True, integer=True); ep = symbols('epsilon', positive=True)
an1 = (3*nn + 1)/(nn + 2)
steps(an1 - 3, (3*nn + 1 - 3*(nn + 2))/(nn + 2), -5/(nn + 2))
same(Abs(an1 - 3), 5/(nn + 2))
same(solve(Eq(5/(x + 2), ep), x), [5/ep - 2])                 # 5/(n + 2) = eps where n = 5/eps - 2
holds((ep - 5/(5/ep + 2)).factor().is_positive)                # at n = N = 5/eps the distance is already below eps
same(5/Rational(1, 100), 500); same(an1.subs(nn, 501), Rational(1504, 503)); rounds(Rational(1504, 503), '2.99006')
holds(Rational(5, 501) < Rational(1, 100)); holds(not (Rational(5, 500) < Rational(1, 100)))   # n = 499 wins, n = 498 does not
limit_is((3*n + 1)/(n + 2), n, oo, 3)
```
:::

A sequence diverges when its terms never settle. The terms of $(-1)^n$ alternate between $-1$ and $1$ for ever; the argument of [Example 2.14](module_02_EN.html#no-limit-proof), with the triangle inequality, shows that no number $L$ is their limit (Exercise 14.1 has a similar sequence). The terms of $n^2$ grow without bound: $n^2 \to \infty$. A sequence that diverges to infinity has no limit in the sense of Definition 14.2; writing $a_n \to \infty$ says how it diverges. A convergent sequence has only one limit, by the argument at the end of [Section 2.7](module_02_EN.html#no-limit-proof). And the first terms never matter: changing, adding or removing finitely many terms changes neither whether a sequence converges nor its limit.

```check
same([(-1)**j for j in range(1, 7)], [-1, 1, -1, 1, -1, 1]); limit_is(n**2, n, oo, oo)
```

::: pitfall
A limit is about the tail of a sequence, not its first terms, and the first terms can mislead for a long time. The sequence $a_n = n^{10}/2^n$ rises for its first 14 terms, to about 17.7 million at $n = 14$, before it falls towards its limit, 0 (Theorem 7.7 of [Module 7](module_07_EN.html#growth)).

```check
holds(all(Integer(j + 1)**10/2**(j + 1) > Integer(j)**10/2**j for j in range(1, 14)))
holds(all(Integer(j + 1)**10/2**(j + 1) < Integer(j)**10/2**j for j in range(14, 200)))
rounds(Integer(14)**10/2**14/10**6, '17.7'); limit_is(n**10/2**n, n, oo, 0)
```
:::

### Limit laws and the squeeze theorem {#laws}

Limits of sequences obey the same laws as limits of functions, with the same proofs ([Section 2.4](module_02_EN.html#laws) and the Going deeper box of [Section 2.7](module_02_EN.html#no-limit-proof)): $N$ takes the place of $\delta$, and where a proof of Module 2 takes the smaller of two $\delta$s, the proof for sequences takes the larger of two $N$s.

::: theorem Limit laws for sequences
Suppose that $a_n \to L$ and $b_n \to M$, and let $c$ be a constant. Then

$$a_n + b_n \to L + M, \qquad a_n - b_n \to L - M, \qquad c\,a_n \to cL, \qquad a_n b_n \to LM,$$

and $\dfrac{a_n}{b_n} \to \dfrac{L}{M}$ if $M \ne 0$. If $a_n \to L$ and the function $f$ is continuous at $L$, then $f(a_n) \to f(L)$.
:::

The last law is the sequence version of [Theorem 3.4](module_03_EN.html#composition): limits pass inside continuous functions. For example, $\sqrt{4 + 1/n} \to \sqrt{4 + 0} = 2$, because $1/n \to 0$ and the square root is continuous at 4.

```check
limit_is(sqrt(4 + 1/n), n, oo, 2); limit_is(1/n, n, oo, 0)
```

::: theorem The squeeze theorem for sequences
If $b_n \le a_n \le c_n$ for every $n$ from some index on, and $b_n \to L$ and $c_n \to L$, then $a_n \to L$. In particular, if $\abs{a_n} \to 0$, then $a_n \to 0$.
:::

The second sentence follows from the first, since $-\abs{a_n} \le a_n \le \abs{a_n}$ and $-\abs{a_n} \to 0$ by the constant multiple law. The proof of the first is that of [Theorem 2.4](module_02_EN.html#squeeze), with $N$ in place of $\delta$.

The most important sequences of this module are the powers $r^n$ of a fixed number $r$.

::: theorem Geometric sequences
For a constant $r$, the sequence $r^n$, for $n = 0, 1, 2, \dots$:

- converges to 0 if $-1 < r < 1$;
- converges to 1 if $r = 1$;
- diverges to infinity if $r > 1$;
- diverges, with no limit at all, if $r \le -1$.
:::

::: proof
For $r > 1$, write $r = 1 + q$ with $q > 0$. [Section 3.7](module_03_EN.html#other-limits) showed that $(1 + q)^n \ge 1 + nq$ for every $n \ge 1$, so $r^n$ exceeds any number $M$ once $n > M/q$: $r^n \to \infty$.

For $0 < \abs{r} < 1$, the number $1/\abs{r}$ is greater than 1, so $(1/\abs{r})^n \to \infty$ by the first case. The reciprocal of a sequence that diverges to infinity tends to 0 (if $b_n > 1/\varepsilon$ for every $n > N$, then $0 < 1/b_n < \varepsilon$ for those $n$), so $\abs{r^n} = 1/(1/\abs{r})^n \to 0$, and $r^n \to 0$ by the squeeze theorem. For $r = 0$ every term after $r^0 = 1$ is 0, and for $r = 1$ every term is 1.

For $r = -1$ the terms are $1, -1, 1, -1, \dots$, which have no limit. For $r < -1$, $\abs{r^n} = \abs{r}^n \to \infty$, so the terms are not even bounded, and a convergent sequence is bounded: from some index on its terms are within 1 of its limit, and there are only finitely many terms before that.
:::

```check
qp = symbols('q', positive=True)
for j in (1, 2, 5, 12):
    holds(expand((1 + qp)**j - (1 + j*qp)).subs(qp, Rational(1, 3)) >= 0)
holds(all((1 + Rational(1, 10))**j >= 1 + j*Rational(1, 10) for j in range(1, 60)))
limit_is(Rational(3, 2)**n, n, oo, oo); limit_is(Rational(1, 2)**n, n, oo, 0); limit_is(Rational(-1, 2)**n, n, oo, 0)
same((Rational(1, 2)**n)*(2**n), 1)                       # |r^n| = 1/(1/|r|)^n
same([(-1)**j for j in range(0, 6)], [1, -1, 1, -1, 1, -1]); limit_is(2**n, n, oo, oo)
```

::: example Limits of sequences
Find the limits of

- (a) $\dfrac{2n^2 - 3n}{5n^2 + 4}$
- (b) $\dfrac{(-1)^n}{n}$
- (c) $\dfrac{\cos n}{\sqrt n}$
- (d) $\dfrac{3^n + 4^n}{5^n}$

**(a)** Divide the numerator and the denominator by $n^2$, the highest power in the denominator, as for rational functions at infinity ([Theorem 3.10](module_03_EN.html#rational-at-infinity)):

$$\frac{2n^2 - 3n}{5n^2 + 4} = \frac{2 - 3/n}{5 + 4/n^2} \to \frac{2 - 0}{5 + 0} = \frac25,$$

by the limit laws, since $1/n \to 0$ and $1/n^2 \to 0$.

**(b)** The terms alternate in sign, but their size $\abs{(-1)^n/n} = 1/n$ tends to 0. By the squeeze theorem, $(-1)^n/n \to 0$.

**(c)** Since $-1 \le \cos n \le 1$,

$$-\frac{1}{\sqrt n} \le \frac{\cos n}{\sqrt n} \le \frac{1}{\sqrt n},$$

and both bounds tend to 0, because $1/\sqrt n = 1/n^{1/2}$ ([Section 3.7](module_03_EN.html#limits-at-infinity)). By the squeeze theorem, $\cos n/\sqrt n \to 0$.

**(d)** Split the fraction: $\dfrac{3^n + 4^n}{5^n} = \Big(\dfrac35\Big)^n + \Big(\dfrac45\Big)^n$. Both ratios lie between $-1$ and 1, so by Theorem 14.3 and the sum law the limit is $0 + 0 = 0$.

```check
steps((2*n**2 - 3*n)/(5*n**2 + 4), (2 - 3/n)/(5 + 4/n**2)); limit_is((2*n**2 - 3*n)/(5*n**2 + 4), n, oo, Rational(2, 5))
holds(all(Abs(Rational((-1)**j, j)) == Rational(1, j) for j in range(1, 100))); limit_is(1/n, n, oo, 0)
for j in range(1, 60):
    holds(-1/sqrt(j) <= cos(j)/sqrt(j)); holds(cos(j)/sqrt(j) <= 1/sqrt(j))
limit_is(1/sqrt(n), n, oo, 0); limit_is(-1/sqrt(n), n, oo, 0); limit_is(cos(n)/sqrt(n), n, oo, 0)
holds(all((Integer(3)**j + Integer(4)**j)/Integer(5)**j == Rational(3, 5)**j + Rational(4, 5)**j for j in range(0, 30)))
limit_is(Rational(3, 5)**n, n, oo, 0); limit_is(Rational(4, 5)**n, n, oo, 0)
```
:::

::: pitfall
The power law is for a fixed power. In $\big(1 + \tfrac1n\big)^n$ the base tends to 1, but the exponent grows with $n$, and the limit is $e$ ([Theorem 6.6](module_06_EN.html#two-routes)), not $1^n = 1$. Expressions of the form $1^\infty$ are indeterminate ([Module 7](module_07_EN.html#powers)).

```check
limit_is((1 + 1/n)**n, n, oo, E); limit_is(1 + 1/n, n, oo, 1)
```
:::

### Sequences from functions {#from-functions}

Many sequences are the values of a function at the whole numbers: $a_n = (\ln n)/n$ is $f(n)$ for $f(x) = (\ln x)/x$. Then everything known about limits at infinity applies, L'Hôpital's rule included.

::: theorem Sequences from functions
If $\displaystyle\lim_{x\to\infty} f(x) = L$ and $a_n = f(n)$ for every whole number $n \ge 1$, then $\displaystyle\lim_{n\to\infty} a_n = L$. The same holds with $\infty$ or $-\infty$ in place of $L$.
:::

::: proof
Let $\varepsilon > 0$. Since $f(x) \to L$ as $x \to \infty$, there is a number $N$ such that $\abs{f(x) - L} < \varepsilon$ for every real number $x > N$: that is what "for every large enough $x$" in Definition 3.7 means. In particular this holds for every whole number $n > N$, so $\abs{a_n - L} < \varepsilon$ for those $n$. The proof for $\pm\infty$ is the same, with a bound $M$ in place of the band.
:::

You cannot differentiate $a_n$ with respect to $n$, because a sequence is defined only at whole numbers. Apply L'Hôpital's rule to the function $f(x)$, then Theorem 14.4.

::: example Limits from functions
Find the limits of (a) $\dfrac{\ln n}{n}$, (b) $n^{1/n}$ and (c) $\Big(1 + \dfrac2n\Big)^n$.

**(a)** As $x \to \infty$, $(\ln x)/x$ has the form $\infty/\infty$, and the quotient of the derivatives is $\dfrac{1/x}{1} = \dfrac1x \to 0$; so $(\ln x)/x \to 0$ by L'Hôpital's rule (this is [Theorem 7.6](module_07_EN.html#growth) with $p = 1$). By Theorem 14.4, $(\ln n)/n \to 0$.

**(b)** [Example 7.18](module_07_EN.html#powers) showed that $x^{1/x} \to 1$ as $x \to \infty$: its logarithm is $(\ln x)/x$, which tends to 0 by (a), and $e^0 = 1$. So $n^{1/n} \to 1$; for example, $1000^{1/1000} \approx 1.0069$.

**(c)** [Example 7.17](module_07_EN.html#powers), with $a = 2$, showed that $(1 + 2/x)^x \to e^2$ as $x \to \infty$. So $(1 + 2/n)^n \to e^2 \approx 7.389$.

```check
same(diff(log(x), x)/diff(x, x), 1/x); limit_is(1/x, x, oo, 0); limit_is(log(x)/x, x, oo, 0)
xq = symbols('x', positive=True)
same(expand_log(log(xq**(1/xq))), log(xq)/xq); limit_is(x**(1/x), x, oo, 1); rounds(Integer(1000)**Rational(1, 1000), '1.0069')
limit_is((1 + 2/x)**x, x, oo, exp(2)); rounds(exp(2), '7.389')
limit_is(log(n)/n, n, oo, 0); limit_is(n**(1/n), n, oo, 1); limit_is((1 + 2/n)**n, n, oo, exp(2))
```
:::

::: pitfall
The converse of Theorem 14.4 is false. The sequence $a_n = \sin(\pi n)$ is 0 for every whole number $n$, so it converges to 0; but $\sin(\pi x)$ has no limit as $x \to \infty$, because it keeps swinging between $-1$ and $1$. A sequence only samples $f$ at the whole numbers. When $f(x)$ has no limit, decide about the sequence from the sequence itself.

```check
ni = symbols('n', integer=True)
same(sin(pi*ni), 0); same(limit(sin(pi*x), x, oo), AccumBounds(-1, 1))
same(sin(pi*Rational(5, 2)), 1); same(sin(pi*Rational(7, 2)), -1)     # between the whole numbers it reaches 1 and -1
```
:::

## Monotone sequences {#monotone}

To prove that $a_n \to L$ from Definition 14.2 you need to know $L$. Often you do not: the limit is exactly what you want to find. For one important kind of sequence there is a way to know that the limit exists before you know what it is.

Look again at $\sqrt2$ rounded down to $n$ decimal places: $1, 1.4, 1.41, 1.414, 1.4142, \dots$ (starting with $n = 0$). Each term is at least as large as the one before, and every term is below 1.5. The terms creep upwards, but they can never pass 1.5, so they must pile up somewhere at or below it. They close in on $\sqrt2$.

```check
dec = [floor(sqrt(2)*10**j)/Integer(10)**j for j in range(0, 5)]
same(dec, [1, Rational(14, 10), Rational(141, 100), Rational(1414, 1000), Rational(14142, 10000)])
holds(all(dec[j] <= dec[j + 1] for j in range(4))); holds(all(d < Rational(3, 2) for d in dec))
holds(all(sqrt(2) - floor(sqrt(2)*10**j)/Integer(10)**j < Rational(1, 10**j) for j in range(0, 12)))
```

::: definition Monotone and bounded sequences
A sequence $(a_n)$ is **increasing** if $a_n \le a_{n+1}$ for every $n$, and **decreasing** if $a_n \ge a_{n+1}$ for every $n$; it is **monotone** if it is one or the other. It is **bounded above** if there is a number $M$, an **upper bound**, with $a_n \le M$ for every $n$; **bounded below** if there is a number $m$, a **lower bound**, with $a_n \ge m$ for every $n$; and **bounded** if it is both.
:::

Some books call these sequences "non-decreasing" and "non-increasing", and keep "increasing" for sequences with $a_n < a_{n+1}$; this series says **strictly increasing** for those.

### The Monotone Convergence Theorem {#mct}

::: theorem The Monotone Convergence Theorem
An increasing sequence that is bounded above converges, and its limit is at least every term and at most every upper bound. A decreasing sequence that is bounded below converges, and its limit is at most every term and at least every lower bound.
:::

This theorem is not proved from anything earlier in the series. It is a form of the **completeness** of the real numbers, the property that the number line has no gaps, which the proof of the Intermediate Value Theorem needed in [Module 3](module_03_EN.html#ivt). Courses in real analysis either construct the real numbers and prove completeness, or take it as an axiom, a basic property from which the rest is proved; this series takes the Monotone Convergence Theorem as its starting point. The decimal approximations of $\sqrt2$ show why it is a property of the real numbers and not of numbers in general. Every term is a fraction, and the sequence is increasing and bounded above, yet no fraction is its limit, because $\sqrt2$ is irrational. Among the fractions alone, the sequence closes in on a gap, and has no limit.

The second half of each statement can be proved. Limits keep non-strict inequalities: if $a_n \le M$ for every $n$ and $a_n \to L$, then $L \le M$. Indeed, if $L$ were greater than $M$, the challenge $\varepsilon = L - M$ would give terms with $a_n > L - \varepsilon = M$. Applied to an upper bound $M$, this says that the limit is at most $M$. Applied to the terms $a_m$, $a_{m+1}, \dots$, which are all at least $a_m$ when the sequence increases, it says that the limit is at least $a_m$.

```check
LL_, MM_ = symbols('L M', real=True)
same(LL_ - (LL_ - MM_), MM_)           # the challenge eps = L - M leaves terms above L - eps = M
```

::: keyidea
The Monotone Convergence Theorem proves that a limit exists without saying what it is. That is its role. Module 3 used it to prove the Intermediate Value Theorem, and Module 6 to show that the slope of $2^x$ at 0 exists ([Section 6.1](module_06_EN.html#base-e)). Above all, the partial sums of a series with positive terms increase, so such a series converges exactly when its partial sums are bounded: every convergence test for positive terms in Sections 14.5 and 14.6 rests on this.
:::

::: deeper Completeness and least upper bounds
A first reading may skip this box. Courses in analysis usually state completeness as the **least upper bound property**: every non-empty set of real numbers that is bounded above has a least upper bound, an upper bound that is smaller than every other upper bound. The Monotone Convergence Theorem follows in a few lines. Let $(a_n)$ be increasing and bounded above, and let $s$ be the least upper bound of its terms. Let $\varepsilon > 0$. The number $s - \varepsilon$ is smaller than $s$, so it is not an upper bound: some term $a_N$ is greater than $s - \varepsilon$. For every $n > N$, then,

$$s - \varepsilon < a_N \le a_n \le s,$$

so $\abs{a_n - s} < \varepsilon$: the sequence converges to $s$. Conversely, the least upper bound property can be proved from the Monotone Convergence Theorem, so either statement can serve as the axiom.
:::

### Recursive sequences {#recursive}

A sequence is defined **recursively** when its first term is given and each further term is computed from the one before by a fixed rule, $a_{n+1} = g(a_n)$. Programs compute such sequences with a loop, and numerical methods such as Newton's method are recursions. The Monotone Convergence Theorem gives a three-step method for them: show that the sequence is monotone, show that it is bounded, and only then find the limit from the rule.

::: example Newton's square root as a sequence
Newton's method for $\sqrt2$ is the recursion $x_0 = 1$, $x_{n+1} = \tfrac12\big(x_n + 2/x_n\big)$ ([Example 7.9](module_07_EN.html#newton)). Show that it converges, and find its limit, with the Monotone Convergence Theorem.

[Theorem 7.2](module_07_EN.html#quadratic) showed that $x_n \ge \sqrt2$ for every $n \ge 1$, and that the iterates decrease from $x_1$ on: $\tfrac32 \ge \tfrac{17}{12} \ge \tfrac{577}{408} \ge \cdots$. So from $x_1$ on, the sequence is decreasing and bounded below by $\sqrt2$, and by the Monotone Convergence Theorem it converges to a number $L \ge \sqrt2$.

To find $L$, take limits on both sides of the recursion. The left side, $x_{n+1}$, is the same sequence shifted by one place, so it also tends to $L$. On the right, $L \ne 0$, so the limit laws give $\tfrac12\big(x_n + 2/x_n\big) \to \tfrac12\big(L + 2/L\big)$. Therefore

$$L = \frac12\Big(L + \frac2L\Big), \quad\text{so}\quad 2L = L + \frac2L, \quad L = \frac2L, \quad L^2 = 2.$$

Since $L \ge \sqrt2 > 0$, $L = \sqrt2$. Module 7 proved more, with its formula for the error: how fast the iterates approach $\sqrt2$. This argument needs no formula for the error, and the same three steps work for many recursions that have none.

```check
itn = [Integer(1)]
for _ in range(8):
    itn.append((itn[-1] + 2/itn[-1])/2)
same(itn[1:4], [Rational(3, 2), Rational(17, 12), Rational(577, 408)])
holds(all(itn[j]**2 >= 2 for j in range(1, 9)))         # x_n >= sqrt(2), compared through squares; holds(all(itn[j + 1] <= itn[j] for j in range(1, 8)))
Lp = symbols('L', positive=True)
same(solve(Eq(Lp, (Lp + 2/Lp)/2), Lp), [sqrt(2)])
steps(2*Lp - (Lp + 2/Lp), Lp - 2/Lp); same(solve(Eq(Lp, 2/Lp), Lp), [sqrt(2)])
```
:::

To show that every term of a recursive sequence has some property, use **mathematical induction**: show that the first term has it, and that whenever a term $a_n$ has it, so does the next term $a_{n+1}$. Then $a_1$ has the property, so $a_2$ has it, so $a_3$ has it, and so on for every $n$. Module 3 proved $(1 + q)^n \ge 1 + nq$ in this way.

::: example A recursive sequence
Let $a_1 = 1$ and $a_{n+1} = \sqrt{2 + a_n}$ for $n \ge 1$. Show that the sequence converges, and find its limit.

The first terms, in exact form and in decimals:

```valuetable
a_n = 1, sqrt(3), sqrt(2 + sqrt(3)), sqrt(2 + sqrt(2 + sqrt(3))), sqrt(2 + sqrt(2 + sqrt(2 + sqrt(3))))
$a_n\text{ in decimals}$ = a_n
$2 - a_n$ = 2 - a_n
digits = 6
---
a_{n} | a_n\text{ in decimals} | 2 - a_n
1 | 1 | 1
\sqrt{3} | 1.73205 | 0.267949
\sqrt{\sqrt{3} + 2} | 1.93185 | 0.0681483
\sqrt{\sqrt{\sqrt{3} + 2} + 2} | 1.98289 | 0.0171103
\sqrt{\sqrt{\sqrt{\sqrt{3} + 2} + 2} + 2} | 1.99572 | 0.00428215
```

They seem to increase towards 2. Prove it in three steps.

*Bounded.* Every term is positive, since $a_1 = 1$ and square roots of positive numbers are positive. And every term is below 2: $a_1 = 1 < 2$, and if $a_n < 2$, then $2 + a_n < 4$, so $a_{n+1} = \sqrt{2 + a_n} < \sqrt4 = 2$. By induction, $0 < a_n < 2$ for every $n$.

*Increasing.* Compare the squares. For $0 < a_n < 2$,

$$a_{n+1}^2 - a_n^2 = 2 + a_n - a_n^2 = (2 - a_n)(1 + a_n) > 0,$$

because both factors are positive. So $a_{n+1}^2 > a_n^2$, and since both terms are positive, $a_{n+1} > a_n$.

*The limit.* By the Monotone Convergence Theorem the sequence converges to a number $L$ with $1 = a_1 \le L \le 2$. The square root is continuous, so $\sqrt{2 + a_n} \to \sqrt{2 + L}$, and taking limits on both sides of the recursion gives $L = \sqrt{2 + L}$. Squaring, $L^2 - L - 2 = 0$, that is, $(L - 2)(L + 1) = 0$, so $L = 2$ or $L = -1$. Since $L \ge 1$, the limit is 2.

The table shows how fast: from the third term on, each step divides the distance to 2 by almost exactly 4. The reason is the identity $2 - a_{n+1} = \dfrac{(2 - a_n)}{2 + a_{n+1}}$ (multiply $2 - \sqrt{2 + a_n}$ above and below by $2 + \sqrt{2 + a_n}$), and $2 + a_{n+1} \to 4$.

```check
sq = [Integer(1)]
for _ in range(7):
    sq.append(sqrt(2 + sq[-1]))
same(sq[1:5], [sqrt(3), sqrt(2 + sqrt(3)), sqrt(2 + sqrt(2 + sqrt(3))), sqrt(2 + sqrt(2 + sqrt(2 + sqrt(3))))])
holds(all(0 < q_ < 2 for q_ in sq)); holds(all(sq[j] < sq[j + 1] for j in range(7)))
ap = symbols('a', positive=True)
same(2 + ap - ap**2, (2 - ap)*(1 + ap))
Lr = symbols('L', real=True)
same_set(solve(Lr**2 - Lr - 2, Lr), [2, -1]); same(solve(Eq(Lr, sqrt(2 + Lr)), Lr), [2])
same((2 - sqrt(2 + ap))*(2 + sqrt(2 + ap)), 2 - ap)            # so 2 - a_(n+1) = (2 - a_n)/(2 + a_(n+1))
rat = [(2 - sq[j + 1])/(2 - sq[j]) for j in range(1, 6)]
holds(all(Rational(1, 4) < q_ < Rational(26, 100) for q_ in rat))     # the distance to 2 shrinks by almost exactly 4
```
:::

::: figure id=fig-14-2
The recursion $a_{n+1} = \sqrt{2 + a_n}$ from $a_1 = 1$. Left: the cobweb diagram. From the point $(a_n, a_n)$ on the line $y = x$, go up to the curve $y = \sqrt{2 + x}$, which is at height $a_{n+1}$; then across to the line, at $(a_{n+1}, a_{n+1})$, and repeat. The steps climb towards the crossing point $(2, 2)$, where $L = \sqrt{2 + L}$. Right: the terms themselves increase towards the limit 2 (dashed) and never reach it.
:::

::: pitfall
Solving $L = g(L)$ is the last step, not the first. The equation says what the limit must be if there is one; it does not say that there is one. With $a_1 = 1$ and $a_{n+1} = 2a_n$, it gives $L = 2L$, so $L = 0$, yet the terms $1, 2, 4, 8, \dots$ diverge to infinity. With $a_1 = 0$ and $a_{n+1} = 1 - a_n$, it gives $L = \tfrac12$, yet the terms $0, 1, 0, 1, \dots$ have no limit. First show that the sequence converges, for instance with the Monotone Convergence Theorem.

```check
seq2 = [1]
for _ in range(4):
    seq2.append(2*seq2[-1])
same(seq2, [1, 2, 4, 8, 16]); same(solve(Eq(Lr, 2*Lr), Lr), [0])
seq3 = [0]
for _ in range(4):
    seq3.append(1 - seq3[-1])
same(seq3, [0, 1, 0, 1, 0]); same(solve(Eq(Lr, 1 - Lr), Lr), [Rational(1, 2)])
```
:::

::: compute Sequences in Python and SymPy
A loop computes a recursive sequence. Here are the first terms of Example 14.5:

```python
import math
a = 1.0
for n in range(1, 9):
    print(f"a_{n} = {a:.10f}   2 - a_{n} = {2 - a:.3e}")
    a = math.sqrt(2 + a)        # the next term
```

```output
a_1 = 1.0000000000   2 - a_1 = 1.000e+00
a_2 = 1.7320508076   2 - a_2 = 2.679e-01
a_3 = 1.9318516526   2 - a_3 = 6.815e-02
a_4 = 1.9828897227   2 - a_4 = 1.711e-02
a_5 = 1.9957178465   2 - a_5 = 4.282e-03
a_6 = 1.9989291750   2 - a_6 = 1.071e-03
a_7 = 1.9997322758   2 - a_7 = 2.677e-04
a_8 = 1.9999330678   2 - a_8 = 6.693e-05
```

SymPy's `limit` finds limits of sequences given by a formula, with `sp.oo` for $\infty$:

```python
import sympy as sp
n = sp.symbols('n')
print(sp.limit((2*n**2 - 3*n)/(5*n**2 + 4), n, sp.oo))
print(sp.limit(n**(1/n), n, sp.oo), sp.limit((1 + 2/n)**n, n, sp.oo))
print(sp.limit(sp.sin(sp.pi*n), n, sp.oo))
```

```output
2/5
1 exp(2)
AccumBounds(-1, 1)
```

The first two lines agree with Examples 14.2 and 14.3. The last shows that `limit` treats `n` as a real variable: it computes the limit of the function $\sin(\pi x)$, which swings between $-1$ and 1 for ever (`AccumBounds(-1, 1)`, "accumulation bounds"), not of the sequence $\sin(\pi n)$, whose terms are all 0. Declare the symbol an integer, and SymPy simplifies the terms themselves:

```python
k = sp.symbols('k', integer=True)
print(sp.sin(sp.pi*k))
```

```output
0
```
:::

## Series {#series}

To walk to a door, you must first cover half the distance, then half of what is left, then half of that, and so on for ever. One of the paradoxes of motion posed by the ancient Greek philosopher Zeno asks how anyone can complete infinitely many stages. As fractions of the whole distance, the stages measure $\tfrac12, \tfrac14, \tfrac18, \dots$, and the paradox dissolves once you can say what their total is.

Figure 14.3 shows the same total as areas. Cut a square of area 1 in half; cut the remaining half in half; cut the remaining quarter in half, and so on. After $N$ cuts the pieces have total area

$$S_N = \frac12 + \frac14 + \cdots + \frac{1}{2^N} = 1 - \frac{1}{2^N},$$

since the part not yet covered is the last piece cut off, of area $1/2^N$. As $N$ grows, the uncovered part shrinks to 0 and $S_N \to 1$: infinitely many pieces fill the square exactly.

::: figure id=fig-14-3
Halving a square. Left: a square of area 1 cut into pieces of area $\tfrac12, \tfrac14, \tfrac18, \dots$; each piece is half of what remains, and the pieces fill the square. Right: the partial sums $S_N = \tfrac12 + \tfrac14 + \cdots + \tfrac{1}{2^N} = 1 - \tfrac{1}{2^N}$ climb towards 1 (dashed); the gap to 1 halves at every step.
:::

```check
same([sum(Rational(1, 2**j) for j in range(1, Nn + 1)) for Nn in range(1, 13)], [1 - Rational(1, 2**Nn) for Nn in range(1, 13)])
NNp = symbols('N', positive=True, integer=True)
same(summation(Rational(1, 2)**n, (n, 1, NNp)), 1 - Rational(1, 2)**NNp); limit_is(1 - Rational(1, 2)**n, n, oo, 1)
```

### Partial sums {#partial-sums}

::: definition Series and their sums
Let $(a_n)$ be a sequence. The **series**

$$\sum_{n=1}^{\infty} a_n = a_1 + a_2 + a_3 + \cdots,$$

read "the sum of a sub n from n equals 1 to infinity", has the **partial sums** $S_N = a_1 + a_2 + \cdots + a_N$, the sums of its first $N$ terms. If the sequence of partial sums converges to a number $S$, the series **converges**, and $S$ is its **sum**:

$$\sum_{n=1}^{\infty} a_n = S \quad\text{means}\quad \lim_{N\to\infty} S_N = S.$$

Otherwise the series **diverges**.
:::

An infinite sum is a limit: you cannot add infinitely many numbers one by one, but you can add the first $N$ and ask what happens as $N$ grows. The sigma notation is that of Module 9, with $\infty$ as the upper limit. A series may start at another index, often $n = 0$. In this series $S_N$ always means the sum of the first $N$ terms, so for $\sum_{n=0}^{\infty} a_n$ it is $a_0 + a_1 + \cdots + a_{N-1}$.

Every series involves two sequences: its terms $a_n$ and its partial sums $S_N$. Keep them apart. In Zeno's series the terms $1/2^n$ tend to 0, while the partial sums tend to 1, the sum.

Series can be added and multiplied by constants term by term, and their first terms do not decide whether they converge.

::: theorem Sum laws for series
If $\sum a_n = A$ and $\sum b_n = B$ converge and $c$ is a constant, then $\sum (a_n + b_n) = A + B$, $\sum (a_n - b_n) = A - B$ and $\sum c\,a_n = cA$. Changing, adding or removing finitely many terms of a series does not change whether it converges; if it converges, the sum changes by the total of the changes.
:::

::: proof
The partial sums of $\sum (a_n + b_n)$ are $A_N + B_N$, where $A_N$ and $B_N$ are those of the two series, so they tend to $A + B$ by the sum law for sequences; the other two laws follow in the same way. If two series differ only in their first $k$ terms, then for $N \ge k$ their partial sums differ by a fixed number $d$, the difference of the sums of the first $k$ terms; so one sequence of partial sums converges exactly when the other does, and their limits differ by $d$. Adding or removing terms at the start shifts the index as well, which changes nothing.
:::

::: pitfall
There is no such law for products: $\sum a_n b_n$ is not $\big(\sum a_n\big)\big(\sum b_n\big)$. For $a_n = b_n = 1/2^n$, $\sum a_n b_n = \sum 1/4^n = \tfrac13$, while $\big(\sum 1/2^n\big)^2 = 1$. And the sum laws need both series to converge: $\sum (1 - 1)$ is 0, while $\sum 1$ and $\sum 1$ diverge.

```check
same(summation(Rational(1, 4)**n, (n, 1, oo)), Rational(1, 3)); same(summation(Rational(1, 2)**n, (n, 1, oo))**2, 1)
```
:::

### Geometric series {#geometric}

Zeno's series is the most important kind of series: each term is a fixed multiple of the one before.

::: theorem Geometric series
Let $a \ne 0$. The **geometric series** with first term $a$ and **ratio** $r$,

$$\sum_{n=0}^{\infty} ar^n = a + ar + ar^2 + ar^3 + \cdots,$$

converges if $\abs{r} < 1$, with sum

$$\sum_{n=0}^{\infty} ar^n = \frac{a}{1 - r},$$

and diverges if $\abs{r} \ge 1$.
:::

::: proof
For $r \ne 1$, multiply the partial sum $S_N = a + ar + \cdots + ar^{N-1}$ by $r$:

$$rS_N = ar + ar^2 + \cdots + ar^N.$$

Subtract: every term but the first of $S_N$ and the last of $rS_N$ cancels, so $S_N - rS_N = a - ar^N$, and

$$S_N = \frac{a(1 - r^N)}{1 - r} \qquad (r \ne 1).$$

If $\abs{r} < 1$, then $r^N \to 0$ (Theorem 14.3), so $S_N \to \dfrac{a}{1 - r}$. If $r = 1$, then $S_N = Na$, which diverges to $\infty$ or $-\infty$. If $\abs{r} \ge 1$ and $r \ne 1$, the formula gives $r^N = 1 - (1 - r)S_N/a$; if $S_N$ converged, so would $r^N$, by the limit laws, and Theorem 14.3 says that it does not. So the series diverges.
:::

```check
rr_ = symbols('r'); aa_ = symbols('a', nonzero=True)
for Nn in range(1, 9):
    same(sum(aa_*rr_**j for j in range(Nn)), aa_*(1 - rr_**Nn)/(1 - rr_))
    same(sum(aa_*rr_**j for j in range(Nn)) - rr_*sum(aa_*rr_**j for j in range(Nn)), aa_ - aa_*rr_**Nn)
SNs = aa_*(1 - rr_**NNp)/(1 - rr_)
same(1 - (1 - rr_)*SNs/aa_, rr_**NNp)
gsum = summation(rr_**n, (n, 0, oo)); same(aa_*gsum.args[0][0], aa_/(1 - rr_)); holds(gsum.args[0][1] == (Abs(rr_) < 1))
same(Rational(1, 2)/(1 - Rational(1, 2)), 1)               # Zeno: a = r = 1/2
```

Zeno's series has first term $a = \tfrac12$ (at $n = 1$) and ratio $r = \tfrac12$, so its sum is $\dfrac{1/2}{1 - 1/2} = 1$, as the square showed. In the formula, $a$ is always the first term of the series, whatever its index.

::: example Geometric series
Find the sum of each series, or show that it diverges:

- (a) $\displaystyle\sum_{n=1}^{\infty} 3\Big(-\frac23\Big)^n$
- (b) $\displaystyle\sum_{n=0}^{\infty} \frac{4^n}{3^{n+1}}$

**(a)** The first term, at $n = 1$, is $3 \cdot \big(-\tfrac23\big) = -2$, and each term is $-\tfrac23$ times the one before. So the series is geometric with $a = -2$ and $r = -\tfrac23$, and $\abs{r} < 1$:

$$\sum_{n=1}^{\infty} 3\Big(-\frac23\Big)^n = \frac{-2}{1 - (-2/3)} = \frac{-2}{5/3} = -\frac65.$$

The common slip is to take $a = 3$, the coefficient, which gives $\tfrac95$: the formula needs the first term of the series, here the term with $n = 1$.

**(b)** $\dfrac{4^n}{3^{n+1}} = \dfrac13\Big(\dfrac43\Big)^n$, so the series is geometric with ratio $r = \tfrac43 > 1$. It diverges; indeed its terms grow without bound.

```check
same(3*Rational(-2, 3), -2); same(summation(3*Rational(-2, 3)**n, (n, 1, oo)), Rational(-6, 5))
steps(-2/(1 - Rational(-2, 3)), -2/Rational(5, 3), Rational(-6, 5)); same(3/(1 - Rational(-2, 3)), Rational(9, 5))
holds(all(Integer(4)**j/Integer(3)**(j + 1) == Rational(1, 3)*Rational(4, 3)**j for j in range(0, 20)))
limit_is(Rational(1, 3)*Rational(4, 3)**n, n, oo, oo)
```
:::

::: example Repeating decimals
Write $0.272727\ldots$ and $2.3454545\ldots$ as fractions.

A decimal is a sum: $0.272727\ldots = \dfrac{27}{100} + \dfrac{27}{100^2} + \dfrac{27}{100^3} + \cdots$, a geometric series with $a = \tfrac{27}{100}$ and $r = \tfrac{1}{100}$. Its sum is

$$\frac{27/100}{1 - 1/100} = \frac{27/100}{99/100} = \frac{27}{99} = \frac{3}{11}.$$

For the second number, only the digits 45 repeat, from the second decimal place on:

$$\begin{aligned} 2.3454545\ldots &= 2.3 + \Big(\frac{45}{1000} + \frac{45}{100\,000} + \cdots\Big) \\ &= \frac{23}{10} + \frac{45/1000}{1 - 1/100} = \frac{23}{10} + \frac{1}{22} = \frac{129}{55}. \end{aligned}$$

The same reasoning gives $0.999\ldots = \dfrac{9/10}{1 - 1/10} = 1$. An infinite decimal is the sum of a series, and the partial sums $0.9, 0.99, 0.999, \dots$ converge to 1: $0.999\ldots$ and 1 are the same number, written in two ways.

```check
steps(Rational(27, 100)/(1 - Rational(1, 100)), Rational(27, 100)/Rational(99, 100), Rational(27, 99), Rational(3, 11)); rounds(Rational(3, 11), '0.272727')
steps(Rational(23, 10) + Rational(45, 1000)/(1 - Rational(1, 100)), Rational(23, 10) + Rational(1, 22), Rational(129, 55)); rounds(Rational(129, 55), '2.3454545')
same(Rational(9, 10)/(1 - Rational(1, 10)), 1); same([1 - Rational(1, 10**j) for j in (1, 2, 3)], [Rational(9, 10), Rational(99, 100), Rational(999, 1000)])
```
:::

Geometric series appear wherever a quantity is multiplied by the same factor again and again. In reinforcement learning, for example, a program learns to act by collecting rewards, and a reward that arrives $n$ steps in the future is discounted by a factor $\gamma^n$, with $0 < \gamma < 1$ ($\gamma$ is the Greek letter gamma). A reward of 1 at every step is then worth $\sum_{n=0}^{\infty} \gamma^n = \dfrac{1}{1 - \gamma}$ in total, which is 100 for $\gamma = 0.99$.

```check
same(1/(1 - Rational(99, 100)), 100)
```

::: pitfall
The formula $\dfrac{a}{1 - r}$ holds only for $\abs{r} < 1$. Applied to $1 + 2 + 4 + 8 + \cdots$ it gives $\dfrac{1}{1 - 2} = -1$, absurd for a sum of positive numbers: the partial sums $2^N - 1$ grow without bound. Check that $\abs{r} < 1$ before you use the formula.

```check
same(1/(1 - 2), -1); same([sum(2**j for j in range(Nn)) for Nn in range(1, 10)], [2**Nn - 1 for Nn in range(1, 10)])
```
:::

### Telescoping series {#telescoping}

For most series there is no formula for $S_N$. Geometric series are one exception; telescoping series are another. Their terms are differences, $a_n = b_n - b_{n+1}$, and in the partial sums everything cancels except the two ends, like the sections of a collapsing telescope:

$$S_N = (b_1 - b_2) + (b_2 - b_3) + \cdots + (b_N - b_{N+1}) = b_1 - b_{N+1}.$$

So the series converges exactly when $b_n$ has a limit, and then its sum is $b_1 - \lim b_n$. The standard example is

$$\sum_{n=1}^{\infty}\frac{1}{n(n + 1)}, \qquad \frac{1}{n(n + 1)} = \frac1n - \frac{1}{n + 1}$$

(put the right side over the common denominator $n(n + 1)$ to check). Here $b_n = 1/n$, so $S_N = 1 - \dfrac{1}{N + 1} \to 1$.

```check
same(1/(n*(n + 1)), 1/n - 1/(n + 1)); same((n + 1 - n)/(n*(n + 1)), 1/(n*(n + 1)))
same(summation(1/(nn*(nn + 1)), (nn, 1, NNp)), 1 - 1/(NNp + 1)); limit_is(1 - 1/(n + 1), n, oo, 1)
bs = Function('b')
same(sum(bs(j) - bs(j + 1) for j in range(1, 7)), bs(1) - bs(7))
```

::: example Two telescoping series
(a) Find $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n(n + 2)}$. (b) Show that $\displaystyle\sum_{n=1}^{\infty}\ln\Big(1 + \frac1n\Big)$ diverges.

**(a)** By partial fractions (Module 11), $\dfrac{1}{n(n + 2)} = \dfrac12\Big(\dfrac1n - \dfrac{1}{n + 2}\Big)$; check by combining the right side, $\tfrac12\cdot\dfrac{(n + 2) - n}{n(n + 2)}$. Now each negative part cancels with a positive part two places later:

$$\begin{aligned} S_N &= \frac12\Big[\Big(1 - \frac13\Big) + \Big(\frac12 - \frac14\Big) + \Big(\frac13 - \frac15\Big) + \cdots + \Big(\frac1N - \frac{1}{N + 2}\Big)\Big] \\ &= \frac12\Big(1 + \frac12 - \frac{1}{N + 1} - \frac{1}{N + 2}\Big). \end{aligned}$$

Only the first two positive parts and the last two negative ones survive. As $N \to \infty$, $S_N \to \tfrac12 \cdot \tfrac32 = \tfrac34$.

**(b)** $\ln\big(1 + \tfrac1n\big) = \ln\dfrac{n + 1}{n} = \ln(n + 1) - \ln n$, by the laws of logarithms. So the series telescopes:

$$S_N = (\ln 2 - \ln 1) + (\ln 3 - \ln 2) + \cdots + \big(\ln(N + 1) - \ln N\big) = \ln(N + 1),$$

since $\ln 1 = 0$. As $N \to \infty$, $\ln(N + 1) \to \infty$: the series diverges, although its terms tend to $\ln 1 = 0$.

```check
same(1/(n*(n + 2)), (1/n - 1/(n + 2))/2); same(apart(1/(n*(n + 2)), n), 1/(2*n) - 1/(2*(n + 2)))
for Nn in range(1, 12):
    same(sum(Rational(1, j*(j + 2)) for j in range(1, Nn + 1)), (1 + Rational(1, 2) - Rational(1, Nn + 1) - Rational(1, Nn + 2))/2)
limit_is((1 + Rational(1, 2) - 1/(n + 1) - 1/(n + 2))/2, n, oo, Rational(3, 4)); same(summation(1/(n*(n + 2)), (n, 1, oo)), Rational(3, 4))
npos = symbols('n', positive=True)
same(expand_log(log((npos + 1)/npos)), log(npos + 1) - log(npos)); same(1 + 1/npos, (npos + 1)/npos)
for Nn in range(1, 10):
    same(expand_log(sum(log(1 + Rational(1, j)) for j in range(1, Nn + 1)), force=True), log(Nn + 1))
limit_is(log(n + 1), n, oo, oo); limit_is(log(1 + 1/n), n, oo, 0)
```
:::

Part (b) is a warning: terms that tend to 0 do not make a series converge. Section 14.4 meets the most famous example. Before that, experiment with partial sums.

::: widget name=series-explorer
Choose a series and watch its partial sums $S_1, \dots, S_N$ (the dots) and its terms (the bars below). The dashed line is the sum, where theory gives it; the verdict comes from the theorems of this module, never from the dots. Start with the geometric series: set $r = 0.5$, then $r = 0.9$ and $0.99$, and see the approach slow down as $r$ nears 1; then try $r = -0.9$ (the sums zigzag), $r = -1$ and $r = 1.1$. Choose the harmonic series and move $N$ to 200: the dots rise ever more slowly, yet the verdict is "diverges" (Section 14.4). Then compare the $p$-series for $p = 2$, $p = 1.1$ and $p = 0.9$ (Section 14.5), the alternating harmonic series (Section 14.7), $\sum 1/n!$ and $\sum (-1)^n$.
:::

::: compute Sums with SymPy
`sp.summation` adds a series, finite or infinite, exactly when it can. Declaring `n` and `N` positive integers helps it:

```python
import sympy as sp
n, N = sp.symbols('n N', integer=True, positive=True)
print(sp.summation(1/(n*(n + 1)), (n, 1, N)))       # the partial sum S_N
print(sp.summation(1/(n*(n + 1)), (n, 1, sp.oo)))   # the sum
print(sp.apart(1/(n*(n + 2)), n))                   # partial fractions
print(sp.summation(3*sp.Rational(-2, 3)**n, (n, 1, sp.oo)))
```

```output
1 - 1/(N + 1)
1
-1/(2*(n + 2)) + 1/(2*n)
-6/5
```

These are the telescoping sum of Section 14.3, the partial fractions of Example 14.8 and the sum of Example 14.6. For a geometric series with an unknown ratio, SymPy states the condition:

```python
r = sp.symbols('r')
print(sp.summation(r**n, (n, 0, sp.oo)))
```

```output
Piecewise((1/(1 - r), Abs(r) < 1), (Sum(r**n, (n, 0, oo)), True))
```

`Piecewise` reads: $\dfrac{1}{1 - r}$ if $\abs{r} < 1$, and otherwise the sum left unevaluated, because it diverges. SymPy is not infallible, though. The series $\sum 1/(2n^2 - n)$ converges (compare it with $\sum 1/n^2$, Section 14.6), but:

```python
print(sp.summation(1/(2*n**2 - n), (n, 1, sp.oo)))
s = sum(1/(2*k**2 - k) for k in range(1, 10**6 + 1))   # 10^6 terms
print(f"{s:.6f}  {float(2*sp.log(2)):.6f}")
```

```output
nan
1.386294  1.386294
```

`nan`, "not a number", means that SymPy has failed. The partial sum of a million terms agrees to six decimals with $2\ln 2$, which is the true sum: partial fractions give $\dfrac{1}{2n^2 - n} = 2\Big(\dfrac{1}{2n - 1} - \dfrac{1}{2n}\Big)$, twice the terms of the alternating harmonic series of Section 14.7, taken in pairs. When a computer algebra system gives an answer you cannot check, check it another way.
:::

```check
same(1/(2*n**2 - n), 2*(1/(2*n - 1) - 1/(2*n))); rounds(2*log(2), '1.386294')
for M_ in range(1, 12):     # the partial sums are 2(H_2M - H_M), twice partial sums of the alternating harmonic series
    same(sum(Rational(1, 2*k_**2 - k_) for k_ in range(1, M_ + 1)), 2*(harmonic(2*M_) - harmonic(M_)))
rounds(2*(harmonic(Float(2*10**6, 50)) - harmonic(Float(10**6, 50))), '1.386294')
```

## The harmonic series and the divergence test {#harmonic}

If a series converges, its terms must shrink to 0: otherwise each new term would keep moving the partial sums by a sizeable amount.

::: theorem The terms of a convergent series tend to 0
If $\sum a_n$ converges, then $\displaystyle\lim_{n\to\infty} a_n = 0$.
:::

::: proof
Each term is the difference of two consecutive partial sums: $a_n = S_n - S_{n-1}$. If $S_N \to S$, then also $S_{N-1} \to S$ (the same sequence, shifted by one place), so $a_n = S_n - S_{n-1} \to S - S = 0$.
:::

Read the other way round, the theorem is a test.

::: keyidea
**The divergence test.** If $a_n$ does not tend to 0, either because it has another limit or because it has none, then $\sum a_n$ diverges. If $a_n \to 0$, the test says nothing: the series may converge or diverge.
:::

::: example The divergence test
Show that these series diverge: (a) $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2n + 1}$, (b) $\displaystyle\sum_{n=0}^{\infty}(-1)^n$, (c) $\displaystyle\sum_{n=1}^{\infty}\cos\frac1n$.

**(a)** $\dfrac{n}{2n + 1} = \dfrac{1}{2 + 1/n} \to \dfrac12 \ne 0$.

**(b)** The terms are $1, -1, 1, -1, \dots$, which have no limit (Theorem 14.3 with $r = -1$). The partial sums are $1, 0, 1, 0, \dots$: they never settle.

**(c)** $1/n \to 0$ and the cosine is continuous at 0, so $\cos(1/n) \to \cos 0 = 1 \ne 0$.

In each case the terms do not tend to 0, so the series diverges.

```check
same(n/(2*n + 1), 1/(2 + 1/n)); limit_is(n/(2*n + 1), n, oo, Rational(1, 2))
same([sum((-1)**j for j in range(Nn)) for Nn in range(1, 9)], [1, 0, 1, 0, 1, 0, 1, 0])
limit_is(cos(1/n), n, oo, 1); same(cos(0), 1)
```
:::

### The harmonic series diverges {#harmonic-series}

Does the converse hold: if $a_n \to 0$, does $\sum a_n$ converge? The most famous series of all says no. The **harmonic series** is

$$\sum_{n=1}^{\infty}\frac1n = 1 + \frac12 + \frac13 + \frac14 + \cdots$$

Its terms tend to 0, and its partial sums grow very slowly:

```valuetable
N = 10, 100, 1000, 10000, 100000, 1000000
$S_N = 1 + \tfrac12 + \cdots + \tfrac1N$ = harmonic(N)
digits = 6
---
N | S_N = 1 + \tfrac12 + \cdots + \tfrac1N
10 | 2.92897
100 | 5.18738
1000 | 7.48547
10000 | 9.78761
100000 | 12.0901
1000000 | 14.3927
```

A million terms add up to less than 15, and each tenfold increase in $N$ adds only about 2.3. The numbers look as if they might level off. They do not.

```check
holds(harmonic(Float(10**6, 40)) < 15)
for j in range(1, 6):
    dH = harmonic(Float(10**(j + 1), 40)) - harmonic(Float(10**j, 40))
    holds(Rational(22, 10) < dH); holds(dH < Rational(24, 10))
```

::: theorem The harmonic series diverges
The partial sums of $\sum 1/n$ tend to infinity.
:::

::: proof
The terms are positive, so the partial sums increase. Group the terms after the first two into blocks that end at the powers of 2:

$$S_{2^k} = 1 + \frac12 + \Big(\frac13 + \frac14\Big) + \Big(\frac15 + \cdots + \frac18\Big) + \cdots + \Big(\frac{1}{2^{k-1} + 1} + \cdots + \frac{1}{2^k}\Big).$$

The block that ends at $2^j$ has $2^{j-1}$ terms, and each is at least the last one, $1/2^j$. So each block is at least $2^{j-1}/2^j = \tfrac12$: for instance $\tfrac13 + \tfrac14 \ge \tfrac14 + \tfrac14 = \tfrac12$, and $\tfrac15 + \tfrac16 + \tfrac17 + \tfrac18 \ge 4 \cdot \tfrac18 = \tfrac12$. There are $k - 1$ blocks, so

$$S_{2^k} \ge 1 + \frac12 + (k - 1)\cdot\frac12 = 1 + \frac{k}{2}.$$

Given any number $M$, choose $k$ with $1 + k/2 > M$. For every $N \ge 2^k$, $S_N \ge S_{2^k} > M$, because the partial sums increase. So $S_N \to \infty$.
:::

```check
for j in range(2, 14):
    blk = sum(Rational(1, i) for i in range(2**(j - 1) + 1, 2**j + 1))
    holds(blk >= Rational(1, 2)); holds(all(Rational(1, i) >= Rational(1, 2**j) for i in range(2**(j - 1) + 1, 2**j + 1)))
holds(Rational(1, 3) + Rational(1, 4) >= Rational(1, 2)); same(4*Rational(1, 8), Rational(1, 2))
for kk in range(1, 15):
    holds(harmonic(2**kk) >= 1 + Rational(kk, 2))
```

The proof shows how slowly the sums grow. It guarantees that $S_N$ passes 10 by $N = 2^{18} = 262{,}144$; in fact it first passes 10 at $N = 12{,}367$ (the compute box of Section 14.5 finds this). To pass 100, more than $10^{42}$ terms are needed (Section 14.5).

```check
same(2**18, 262144); holds(1 + Rational(18, 2) >= 10)
holds(harmonic(12366) < 10); holds(harmonic(12367) > 10)
```

::: pitfall
The most common mistake with series is "the terms tend to 0, so the series converges". The divergence test works in one direction only: $a_n \to 0$ is needed for convergence, but it is not enough. The terms $1/n$ tend to 0, yet $\sum 1/n$ diverges; so do $\ln(1 + 1/n)$ and its series (Example 14.8).
:::

::: note
The harmonic series holds up a famous stack of blocks. Stack $n$ identical blocks of length 1 at the edge of a table, each block sticking out beyond the one below it: the top one by $\tfrac12$, the next by $\tfrac14$, the next by $\tfrac16$, and the bottom one by $\tfrac{1}{2n}$ beyond the edge. A computation with centres of mass (Module 12) shows that the stack balances, and the top block then reaches

$$\frac12 + \frac14 + \cdots + \frac{1}{2n} = \frac12\Big(1 + \frac12 + \cdots + \frac1n\Big)$$

beyond the edge of the table. Because the harmonic series diverges, the overhang can be as large as you like. Four blocks already put the top one wholly beyond the edge, since $\tfrac12\big(1 + \tfrac12 + \tfrac13 + \tfrac14\big) = \tfrac{25}{24} > 1$; an overhang of 10 lengths needs 272,400,600 blocks.

```check
same(sum(Rational(1, 2*j) for j in range(1, 5)), Rational(25, 24)); holds(Rational(25, 24) > 1)
import mpmath
mpmath.mp.dps = 30
holds(mpmath.harmonic(272400600) > 20); holds(mpmath.harmonic(272400599) < 20)
```
:::

## The integral test {#integral-test}

The harmonic series diverges; what about $\sum 1/n^2$? Its partial sums increase too, so by the Monotone Convergence Theorem the question is whether they stay bounded. Comparing the sum with an integral answers it.

In Figure 14.4 (left), the rectangle on $[n - 1, n]$ has width 1 and height $1/n^2$, the value of $1/x^2$ at its right end. The curve decreases, so the rectangle lies under it. Adding the rectangles from $n = 2$ to $N$,

$$\frac{1}{2^2} + \frac{1}{3^2} + \cdots + \frac{1}{N^2} \le \int_1^N \frac{dx}{x^2} = 1 - \frac1N < 1.$$

So $S_N < 2$ for every $N$: the partial sums increase and are bounded above, and $\sum 1/n^2$ converges. On the right of Figure 14.4, the rectangle on $[n, n + 1]$ has height $1/n$, the value of $1/x$ at its left end, so it lies above the curve, and

$$S_N = 1 + \frac12 + \cdots + \frac1N \ge \int_1^{N+1}\frac{dx}{x} = \ln(N + 1) \to \infty:$$

a second proof that the harmonic series diverges.

::: figure id=fig-14-4
Series and integrals. Left: the rectangles under $y = 1/x^2$ have heights $\tfrac{1}{2^2}, \tfrac{1}{3^2}, \dots, \tfrac{1}{6^2}$, so $\tfrac{1}{2^2} + \cdots + \tfrac{1}{6^2}$ is less than the area under the curve from 1 to 6, which is less than 1. Right: the rectangles above $y = 1/x$ have heights $1, \tfrac12, \dots, \tfrac15$, so $1 + \tfrac12 + \cdots + \tfrac15$ is more than the area under the curve from 1 to 6, which is $\ln 6$.
:::

```check
Np = symbols('N', positive=True)
same(integrate(1/x**2, (x, 1, Np)), 1 - 1/Np); same(integrate(1/x, (x, 1, Np + 1)), log(Np + 1))
for Nn in range(2, 40):
    holds(sum(Rational(1, j**2) for j in range(2, Nn + 1)) <= 1 - Rational(1, Nn)); holds(harmonic(Nn) >= log(Nn + 1))
same(sum(Rational(1, j**2) for j in range(2, 7)) < integrate(1/x**2, (x, 1, 6)), True); same(integrate(1/x**2, (x, 1, 6)), Rational(5, 6))
holds(harmonic(5) > log(6)); same(integrate(1/x, (x, 1, 6)), log(6)); limit_is(log(n + 1), n, oo, oo)
```

::: theorem The integral test
Let $f$ be continuous, positive and decreasing on $[1, \infty)$, and let $a_n = f(n)$. Then $\sum_{n=1}^{\infty} a_n$ and $\displaystyle\int_1^{\infty} f(x)\,dx$ both converge or both diverge. More precisely, for every $N \ge 1$,

$$\int_1^{N+1} f(x)\,dx \le S_N \le f(1) + \int_1^N f(x)\,dx.$$

The same holds with $[k, \infty)$ in place of $[1, \infty)$ and the series started at $n = k$.
:::

::: proof
Let $n \ge 1$. Since $f$ decreases, $f(n + 1) \le f(x) \le f(n)$ for every $x$ in $[n, n + 1]$, so, by the bounds for integrals of Module 9,

$$f(n + 1) \le \int_n^{n+1} f(x)\,dx \le f(n).$$

Adding the right-hand inequalities for $n = 1, \dots, N$ gives $\int_1^{N+1} f(x)\,dx \le a_1 + \cdots + a_N = S_N$. Adding the left-hand ones for $n = 1, \dots, N - 1$ gives $a_2 + \cdots + a_N \le \int_1^N f(x)\,dx$, which is the right-hand inequality of the theorem.

The terms are positive, so $(S_N)$ increases. If $\int_1^{\infty} f(x)\,dx$ converges, to $I$ say, then $\int_1^N f(x)\,dx \le I$, because $f$ is positive; so $S_N \le f(1) + I$ for every $N$, and the series converges by the Monotone Convergence Theorem. If the integral diverges, then $\int_1^t f(x)\,dx$, which increases with $t$, grows without bound, so $S_N \ge \int_1^{N+1} f(x)\,dx \to \infty$ and the series diverges.
:::

Each hypothesis is needed. Continuity makes the integrals exist, and positivity makes the partial sums increase. Decreasing is what puts the rectangles on the right sides of the curve, and without it the test can give the wrong answer. For $f(x) = \sin^2(\pi x) + 1/x^2$, which is continuous and positive but not decreasing, $f(n) = 1/n^2$ for every whole number $n$, so the series converges; but each interval $[n, n + 1]$ contributes more than $\tfrac12$ to the integral, which diverges.

```check
ni = symbols('n', integer=True)
same(sin(pi*ni)**2 + 1/ni**2, 1/ni**2)
same(integrate(sin(pi*x)**2, (x, ni, ni + 1)), Rational(1, 2))
holds(Rational(1, 2) + integrate(1/x**2, (x, 3, 4)) > Rational(1, 2))
```

### p-series {#p-series}

::: theorem p-series
The **$p$-series** $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^p}$ converges if $p > 1$ and diverges if $p \le 1$.
:::

::: proof
If $p \le 0$, then $1/n^p = n^{-p} \ge 1$ for every $n \ge 1$, so the terms do not tend to 0, and the series diverges by the divergence test. If $p > 0$, the function $f(x) = 1/x^p$ is continuous, positive and decreasing on $[1, \infty)$. Module 12 showed that the $p$-integral $\int_1^{\infty} dx/x^p$ converges exactly when $p > 1$: for $p \ne 1$,

$$\int_1^t \frac{dx}{x^p} = \frac{t^{1-p} - 1}{1 - p},$$

which tends to $\dfrac{1}{p - 1}$ if $p > 1$ and to $\infty$ if $p < 1$, while for $p = 1$ the integral is $\ln t \to \infty$. The integral test does the rest.
:::

```check
pp = symbols('p', positive=True); tp = symbols('t', positive=True)
antideriv(x**(1 - pp)/(1 - pp), 1/x**pp, x); same(((x**(1 - pp) - 1)/(1 - pp)).subs(x, 1), 0)
same(integrate(1/x**2, (x, 1, oo)), 1); same(integrate(1/x**Rational(3, 2), (x, 1, oo)), 2); same(integrate(1/x**Rational(1, 2), (x, 1, oo)), oo)
limit_is((tp**(1 - 3) - 1)/(1 - 3), tp, oo, Rational(1, 2)); limit_is((tp**(1 - Rational(1, 2)) - 1)/(1 - Rational(1, 2)), tp, oo, oo)
holds(Sum(1/n**2, (n, 1, oo)).is_convergent()); holds(not Sum(1/n, (n, 1, oo)).is_convergent()); holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
```

The $p$-series are the yardsticks of the next section. For $p = 2$ the sum is known exactly,

$$\sum_{n=1}^{\infty}\frac{1}{n^2} = \frac{\pi^2}{6} \approx 1.644934,$$

but the proof needs methods beyond this course. There are such formulas for every even $p$, for instance $\sum 1/n^4 = \pi^4/90$, but for $p = 3$ no formula is known; the next subsection shows how to estimate the sum.

```check
same(summation(1/n**2, (n, 1, oo)), pi**2/6); rounds(pi**2/6, '1.644934'); same(summation(1/n**4, (n, 1, oo)), pi**4/90)
```

::: example The integral test on the edge
Decide whether (a) $\displaystyle\sum_{n=2}^{\infty}\frac{1}{n\ln n}$ and (b) $\displaystyle\sum_{n=2}^{\infty}\frac{1}{n(\ln n)^2}$ converge.

Both start at $n = 2$, since $\ln 1 = 0$. On $[2, \infty)$, $x\ln x$ and $x(\ln x)^2$ are positive and increasing (products of positive increasing functions), so $f(x) = \dfrac{1}{x\ln x}$ and $g(x) = \dfrac{1}{x(\ln x)^2}$ are continuous, positive and decreasing there: the integral test applies. Substitute $u = \ln x$, $du = dx/x$ (Module 10).

**(a)** For $t > 2$,

$$\int_2^t \frac{dx}{x\ln x} = \int_{\ln 2}^{\ln t}\frac{du}{u} = \ln(\ln t) - \ln(\ln 2) \to \infty \quad (t \to \infty).$$

The integral diverges, so the series diverges.

**(b)** For $t > 2$,

$$\int_2^t \frac{dx}{x(\ln x)^2} = \int_{\ln 2}^{\ln t}\frac{du}{u^2} = \frac{1}{\ln 2} - \frac{1}{\ln t} \to \frac{1}{\ln 2} \quad (t \to \infty).$$

The integral converges, so the series converges.

The series in (a) diverges even more slowly than the harmonic series: by the integral test, $S_N \le \dfrac{1}{2\ln 2} + \ln(\ln N) - \ln(\ln 2)$, so its partial sums stay below 10 for the first $10^{3000}$ terms and more.

```check
tq = symbols('t', positive=True); xg = symbols('x', positive=True)
holds(all(diff(f_, xg).subs(xg, v) > 0 for f_ in (xg*log(xg), xg*log(xg)**2) for v in [2, Rational(5, 2), 3, 10, 100]))
same(diff(xg*log(xg), xg), log(xg) + 1); same(diff(xg*log(xg)**2, xg), log(xg)**2 + 2*log(xg))
antideriv(log(log(x)), 1/(x*log(x)), x); antideriv(-1/log(x), 1/(x*log(x)**2), x)
same(integrate(1/u, (u, log(2), log(tq))), log(log(tq)) - log(log(2)))
same(integrate(1/u**2, (u, log(2), log(tq))), 1/log(2) - 1/log(tq))
limit_is(log(log(x)) - log(log(2)), x, oo, oo); limit_is(1/log(2) - 1/log(x), x, oo, 1/log(2))
holds(not Sum(1/(n*log(n)), (n, 2, oo)).is_convergent()); holds(Sum(1/(n*log(n)**2), (n, 2, oo)).is_convergent())
holds((10 - 1/(2*log(2)) + log(log(2)))/log(10) > log(3000, 10) + log(log(10), 10))   # ln ln N >= 8.91 needs N > 10^3000
```
:::

### Estimating the sum {#remainder}

The same rectangles do more than decide. They bound the error of a partial sum. When $\sum a_n$ converges to $S$, the **remainder** after $N$ terms is

$$R_N = S - S_N = a_{N+1} + a_{N+2} + \cdots,$$

the sum of the terms left out.

::: theorem Remainder estimate for the integral test
Under the hypotheses of the integral test, if $\sum a_n$ converges, then

$$\int_{N+1}^{\infty} f(x)\,dx \le R_N \le \int_N^{\infty} f(x)\,dx,$$

so the sum $S$ satisfies

$$S_N + \int_{N+1}^{\infty} f(x)\,dx \le S \le S_N + \int_N^{\infty} f(x)\,dx.$$
:::

::: proof
Use the inequalities $f(n + 1) \le \int_n^{n+1} f(x)\,dx \le f(n)$ of the last proof on the tail. Adding the right-hand ones for $n = N + 1, \dots, M$ gives $\int_{N+1}^{M+1} f(x)\,dx \le a_{N+1} + \cdots + a_M$; adding the left-hand ones for $n = N, \dots, M - 1$ gives $a_{N+1} + \cdots + a_M \le \int_N^M f(x)\,dx$. Now let $M \to \infty$. The middle is $S_M - S_N$, which tends to $R_N$, and limits keep non-strict inequalities (Section 14.2).
:::

::: example Estimating $\sum 1/n^2$
Estimate $\sum_{n=1}^{\infty} 1/n^2$ from its first 10 terms, with a guaranteed error.

The partial sum is $S_{10} = 1 + \tfrac14 + \cdots + \tfrac{1}{100} \approx 1.549768$. With $f(x) = 1/x^2$, $\int_N^{\infty} dx/x^2 = 1/N$, so the theorem gives

$$\frac{1}{11} \le R_{10} \le \frac{1}{10}, \qquad\text{so}\qquad 1.640677 \le S \le 1.649768.$$

The partial sum alone is wrong in the second decimal place, but the interval pins $S$ down to within 0.01. Its midpoint, $S \approx 1.645222$, has an error of at most half the width of the interval, about 0.0045; the true error is $0.000288$, since $S = \pi^2/6 \approx 1.644934$.

The difference is dramatic for high accuracy. For an error of at most $10^{-6}$, the partial sum alone needs about a million terms, because $R_N \ge 1/(N + 1)$. The midpoint estimate has an error of at most half the width of the interval, $\tfrac12\big(\tfrac1N - \tfrac{1}{N + 1}\big) = \dfrac{1}{2N(N + 1)}$, which is at most $10^{-6}$ once $N \ge 707$.

```check
S10 = harmonic(10, 2); same(S10, sum(Rational(1, j**2) for j in range(1, 11))); rounds(S10, '1.549768')
same(integrate(1/x**2, (x, Np, oo)), 1/Np)
rounds(S10 + Rational(1, 11), '1.640677'); rounds(S10 + Rational(1, 10), '1.649768')
holds(S10 + Rational(1, 11) <= pi**2/6); holds(pi**2/6 <= S10 + Rational(1, 10)); holds(Rational(1, 10) - Rational(1, 11) < Rational(1, 100))
mid = S10 + (Rational(1, 11) + Rational(1, 10))/2; rounds(mid, '1.645222'); rounds((Rational(1, 10) - Rational(1, 11))/2, '0.0045')
rounds(mid - pi**2/6, '0.000288'); rounds(pi**2/6, '1.644934')
steps((1/Np - 1/(Np + 1))/2, 1/(2*Np*(Np + 1)))
holds(Rational(1, 2*707*708) <= Rational(1, 10**6)); holds(Rational(1, 2*706*707) > Rational(1, 10**6))
holds(Rational(1, 10**6 + 1) < Rational(1, 10**6)); holds(Rational(1, 999998 + 1) > Rational(1, 10**6))   # R_N >= 1/(N+1) > 1e-6 for N < 999999
```
:::

### How slowly? {#slow}

For the harmonic series, $f(x) = 1/x$, the inequalities of the integral test say that

$$\ln(N + 1) \le H_N \le 1 + \ln N,$$

where $H_N = 1 + \tfrac12 + \cdots + \tfrac1N$ is the $N$th **harmonic number**. So $H_N$ grows like $\ln N$, and each tenfold increase of $N$ adds about $\ln 10 \approx 2.303$, as the table of Section 14.4 showed. To pass 100, $H_N$ needs $1 + \ln N \ge 100$, that is, $N \ge e^{99} \approx 9.9 \times 10^{42}$. More precisely, $H_N - \ln N$ decreases towards a number $\gamma \approx 0.5772$ called **Euler's constant**; Exercise 14.11 proves that the limit exists.

```check
for Nn in [1, 2, 5, 10, 100, 1000]:
    holds(log(Nn + 1) <= harmonic(Nn)); holds(harmonic(Nn) <= 1 + log(Nn))
rounds(log(10), '2.303'); rounds(exp(99), '9.9e42'); rounds(EulerGamma, '0.5772')
limit_is(harmonic(n) - log(n), n, oo, EulerGamma)
holds(all(harmonic(j) - log(j) > harmonic(j + 1) - log(j + 1) for j in range(1, 60)))
```

::: compute How slowly series converge
Add up the harmonic series and $\sum 1/n^2$ side by side, and compare with $\ln N + \gamma$ and with $\pi^2/6$:

```python
import math
gamma = 0.5772156649015329            # Euler's constant
H = S = 0.0
n = 0
for N in [10, 100, 1000, 10**4, 10**5, 10**6]:
    while n < N:
        n += 1
        H += 1/n                      # the harmonic series
        S += 1/n**2                   # the series of 1/n^2
    print(f"N = {N:>7}:  H_N = {H:9.6f}   ln N + gamma = {math.log(N) + gamma:9.6f}"
          f"   pi^2/6 - S_N = {math.pi**2/6 - S:.3e}")
```

```output
N =      10:  H_N =  2.928968   ln N + gamma =  2.879801   pi^2/6 - S_N = 9.517e-02
N =     100:  H_N =  5.187378   ln N + gamma =  5.182386   pi^2/6 - S_N = 9.950e-03
N =    1000:  H_N =  7.485471   ln N + gamma =  7.484971   pi^2/6 - S_N = 9.995e-04
N =   10000:  H_N =  9.787606   ln N + gamma =  9.787556   pi^2/6 - S_N = 1.000e-04
N =  100000:  H_N = 12.090146   ln N + gamma = 12.090141   pi^2/6 - S_N = 1.000e-05
N = 1000000:  H_N = 14.392727   ln N + gamma = 14.392726   pi^2/6 - S_N = 1.000e-06
```

The harmonic numbers stay close to $\ln N + \gamma$, ever closer. The second series converges, but its error after $N$ terms is about $1/N$, as the remainder estimate predicts: each extra correct digit costs ten times as many terms. Where does the harmonic series pass 10?

```python
H, n = 0.0, 0
while H <= 10:
    n += 1
    H += 1/n
print(n, H)
```

```output
12367 10.000043008275778
```

The first partial sum above 10 is the 12,367th.
:::

```check
for Nn in [10, 100, 1000, 10**4, 10**5, 10**6]:
    holds(Abs(harmonic(Float(Nn, 40)) - log(Nn) - EulerGamma) < Rational(6, 10*Nn))
    rem = pi**2/6 - harmonic(Float(Nn, 40), 2); holds(1/Rational(Nn + 1) < rem); holds(rem < Rational(1, Nn))
```

## Comparison tests {#comparison}

Many series are not geometric, telescoping or $p$-series, but look like one of them: $\dfrac{1}{n^2 + 1}$ is a little smaller than $\dfrac{1}{n^2}$, and $\dfrac{1}{2^n - 1}$ is close to $\dfrac{1}{2^n}$. Comparison turns the series you know into tests for the ones you do not.

::: theorem The comparison test
Suppose that $0 \le a_n \le b_n$ for every $n$ from some index on.

- (a) If $\sum b_n$ converges, then $\sum a_n$ converges.
- (b) If $\sum a_n$ diverges, then $\sum b_n$ diverges.
:::

::: proof
By Theorem 14.6 the first terms do not matter, so suppose that $0 \le a_n \le b_n$ for every $n$. Let $A_N$ and $B_N$ be the partial sums of the two series. Both increase, because the terms are not negative, and $A_N \le B_N$. (a) If $\sum b_n$ converges to $B$, then $A_N \le B_N \le B$ for every $N$, because an increasing sequence is at most its limit (Theorem 14.5). So $(A_N)$ is increasing and bounded above, and converges by the Monotone Convergence Theorem. (b) If $\sum b_n$ converged, then by (a) so would $\sum a_n$.
:::

::: example Comparison
Decide whether (a) $\displaystyle\sum_{n=1}^{\infty}\frac{5}{2n^2 + 4n + 3}$ and (b) $\displaystyle\sum_{n=1}^{\infty}\frac{\ln n}{n}$ converge.

**(a)** For $n \ge 1$, $2n^2 + 4n + 3 > 2n^2$, so

$$0 < \frac{5}{2n^2 + 4n + 3} < \frac{5}{2n^2} = \frac52\cdot\frac{1}{n^2}.$$

$\sum \tfrac52\cdot\tfrac{1}{n^2}$ converges ($p = 2$, and the sum law), so the series converges by the comparison test.

**(b)** For $n \ge 3$, $\ln n > 1$, because $3 > e$; so $\dfrac{\ln n}{n} > \dfrac1n \ge 0$. The harmonic series diverges, so this series diverges, by part (b) of the test with the roles of the two series swapped: the smaller series $\sum 1/n$ diverges, so the larger one does too.

```check
for j in range(1, 200):
    holds(0 < Rational(5, 2*j**2 + 4*j + 3)); holds(Rational(5, 2*j**2 + 4*j + 3) < Rational(5, 2*j**2))
same(Rational(5, 2)/n**2, 5/(2*n**2)); holds(Sum(5/(2*n**2 + 4*n + 3), (n, 1, oo)).is_convergent())
holds(Integer(3) > E); holds(log(3) > 1); holds(all(log(j)/j > Rational(1, j) for j in range(3, 300)))
holds(not Sum(log(n)/n, (n, 1, oo)).is_convergent())
```
:::

::: pitfall
A comparison in the wrong direction proves nothing. $\dfrac{1}{n^2} \le \dfrac1n$, and $\sum 1/n$ diverges, but that says nothing about $\sum 1/n^2$, which converges. $\dfrac{1}{2^n - 1} \ge \dfrac{1}{2^n}$, and $\sum 1/2^n$ converges, but that says nothing about $\sum 1/(2^n - 1)$. Bound a series above by a convergent one, or below by a divergent one.
:::

### Limit comparison {#limit-comparison}

The second series of the pitfall does converge. Its terms are a little larger than $1/2^n$, so the inequality points the wrong way, but their ratio to $1/2^n$ tends to 1, and that is enough.

::: theorem The limit comparison test
Suppose that $a_n > 0$ and $b_n > 0$ for every $n$, and that

$$\lim_{n\to\infty}\frac{a_n}{b_n} = L, \qquad\text{with } 0 < L < \infty.$$

Then $\sum a_n$ and $\sum b_n$ both converge or both diverge.
:::

::: proof
Challenge the limit with $\varepsilon = L/2$: there is an $N$ such that, for every $n > N$, $\abs{a_n/b_n - L} < L/2$, that is, $\tfrac{L}{2} < \tfrac{a_n}{b_n} < \tfrac{3L}{2}$, and so

$$\frac{L}{2}\,b_n < a_n < \frac{3L}{2}\,b_n.$$

If $\sum b_n$ converges, so does $\sum \tfrac{3L}{2}b_n$, and the right-hand inequality and the comparison test show that $\sum a_n$ converges. If $\sum b_n$ diverges, so does $\sum \tfrac{L}{2}b_n$, and the left-hand inequality shows that $\sum a_n$ diverges.
:::

To choose $b_n$, keep only the leading term of the top and of the bottom of $a_n$, as for rational functions at infinity.

::: example Limit comparison
Decide whether these converge: (a) $\displaystyle\sum_{n=1}^{\infty}\frac{1}{2^n - 1}$, (b) $\displaystyle\sum_{n=1}^{\infty}\frac{2n^2 + 3n}{\sqrt{n^5 + 1}}$, (c) $\displaystyle\sum_{n=1}^{\infty}\sin\frac1n$.

**(a)** Compare with $b_n = 1/2^n$:

$$\frac{a_n}{b_n} = \frac{2^n}{2^n - 1} = \frac{1}{1 - 2^{-n}} \to 1.$$

$\sum 1/2^n$ converges (geometric, $r = \tfrac12$), so the series converges.

**(b)** The leading terms give $\dfrac{2n^2}{\sqrt{n^5}} = \dfrac{2}{n^{1/2}}$, so compare with $b_n = 1/\sqrt n$. Divide the top and the bottom by $n^{5/2} = n^2\sqrt n$:

$$\frac{a_n}{b_n} = \frac{(2n^2 + 3n)\sqrt n}{\sqrt{n^5 + 1}} = \frac{2 + 3/n}{\sqrt{1 + 1/n^5}} \to 2.$$

$\sum 1/\sqrt n$ diverges ($p = \tfrac12$), so the series diverges.

**(c)** For $n \ge 1$, $0 < 1/n \le 1 < \pi$, so $\sin(1/n) > 0$. Compare with $b_n = 1/n$: $\dfrac{\sin(1/n)}{1/n} \to 1$, by Theorem 2.5 ($\sin\theta/\theta \to 1$ as $\theta \to 0$, here with $\theta = 1/n$, through Theorem 14.4). The harmonic series diverges, so $\sum \sin(1/n)$ diverges.

```check
same(2**n/(2**n - 1), 1/(1 - 2**(-n))); limit_is(2**n/(2**n - 1), n, oo, 1); holds(all(Integer(2)**j - 1 > 0 for j in range(1, 50)))
npp = symbols('n', positive=True)
same((2*npp**2 + 3*npp)*sqrt(npp)/sqrt(npp**5 + 1), (2 + 3/npp)/sqrt(1 + 1/npp**5)); same(2*npp**2/sqrt(npp**5), 2/sqrt(npp))
limit_is(((2*n**2 + 3*n)/sqrt(n**5 + 1))/(1/sqrt(n)), n, oo, 2)
holds(all(sin(Rational(1, j)) > 0 for j in range(1, 100))); limit_is(sin(1/n)/(1/n), n, oo, 1); limit_is(sin(x)/x, x, 0, 1)
holds(not Sum(sin(1/n), (n, 1, oo)).is_convergent())
```
:::

::: pitfall
The test needs $0 < L < \infty$. With $L = 0$ or $L = \infty$ it works in one direction only. If $a_n/b_n \to 0$, then $a_n < b_n$ from some index on, so $\sum a_n$ converges if $\sum b_n$ does, but nothing follows if $\sum b_n$ diverges; if $a_n/b_n \to \infty$, the reverse. For instance $\dfrac{\ln n}{n^2}$ compared with $\dfrac{1}{n^2}$ gives $L = \infty$ and no conclusion, but compared with $\dfrac{1}{n^{3/2}}$ it gives $\dfrac{\ln n}{\sqrt n} \to 0$ with $\sum 1/n^{3/2}$ convergent, so $\sum (\ln n)/n^2$ converges.

```check
limit_is((log(n)/n**2)/(1/n**2), n, oo, oo); same((log(npp)/npp**2)/(1/npp**Rational(3, 2)), log(npp)/sqrt(npp))
limit_is(log(n)/sqrt(n), n, oo, 0); holds(Sum(1/n**Rational(3, 2), (n, 1, oo)).is_convergent()); holds(Sum(log(n)/n**2, (n, 1, oo)).is_convergent())
```
:::

## Alternating series {#alternating}

A series whose terms alternate in sign can converge even when the sizes of its terms add up to infinity. The standard example is the **alternating harmonic series**

$$\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{n} = 1 - \frac12 + \frac13 - \frac14 + \frac15 - \cdots$$

Its partial sums go up and down: $S_1 = 1$, $S_2 = 0.5$, $S_3 \approx 0.833$, $S_4 \approx 0.583$, and so on. Each step goes the other way and is shorter than the one before, so the partial sums zigzag in an ever narrower band (Figure 14.5). The table compares them with the sum, which is $\ln 2 \approx 0.693147$:

```valuetable
N = 1, 2, 3, 4, 5, 6
$S_N$ = harmonic(N) - harmonic(floor(N/2))
$\abs{\ln 2 - S_N}$ = Abs(log(2) - harmonic(N) + harmonic(floor(N/2)))
$\dfrac{1}{N + 1}$ = 1/(N + 1)
digits = 6
---
N | S_N | \abs{\ln 2 - S_N} | \dfrac{1}{N + 1}
1 | 1 | 0.306853 | 0.5
2 | 0.5 | 0.193147 | 0.333333
3 | 0.833333 | 0.140186 | 0.25
4 | 0.583333 | 0.109814 | 0.2
5 | 0.783333 | 0.0901862 | 0.166667
6 | 0.616667 | 0.0764805 | 0.142857
```

The error is always smaller than the first term left out, $\tfrac{1}{N + 1}$ (in fact about half of it). The next theorem proves this for every series of this kind.

```check
altS = lambda Nn: sum(Rational((-1)**(j - 1), j) for j in range(1, Nn + 1))
for Nn in range(1, 40):
    same(altS(Nn), harmonic(Nn) - harmonic(floor(Rational(Nn, 2))))
    holds(Abs(log(2) - altS(Nn)) < Rational(1, Nn + 1))
same([altS(1), altS(2)], [1, Rational(1, 2)]); rounds(altS(3), '0.833'); rounds(altS(4), '0.583'); rounds(log(2), '0.693147')
holds(all(Rational(4, 10) < Abs(log(2) - altS(Nn))*(Nn + 1) < Rational(65, 100) for Nn in range(1, 200)))   # about half the bound
```

::: figure id=fig-14-5
The partial sums of the alternating harmonic series $1 - \tfrac12 + \tfrac13 - \cdots$. The odd ones ($S_1, S_3, S_5, \dots$, blue) decrease, the even ones ($S_2, S_4, S_6, \dots$, orange) increase, and every odd one lies above every even one. Both close in on the sum $\ln 2$ (dashed), which lies between any two consecutive partial sums.
:::

::: theorem The alternating series test
Let $b_n > 0$, with $b_{n+1} \le b_n$ for every $n$ and $b_n \to 0$. Then the **alternating series**

$$\sum_{n=1}^{\infty}(-1)^{n-1}b_n = b_1 - b_2 + b_3 - b_4 + \cdots$$

converges. Its sum $S$ lies between any two consecutive partial sums, so

$$\abs{S - S_N} \le b_{N+1}:$$

the error of $S_N$ is at most the first term left out, and the error $S - S_N$ has the sign of that term. The same holds with every sign reversed, or with the series starting at another index.
:::

::: proof
*The even partial sums increase and are bounded above.* $S_{2m+2} = S_{2m} + (b_{2m+1} - b_{2m+2}) \ge S_{2m}$, because $b_{2m+2} \le b_{2m+1}$. Grouping the terms differently,

$$S_{2m} = b_1 - (b_2 - b_3) - (b_4 - b_5) - \cdots - (b_{2m-2} - b_{2m-1}) - b_{2m} \le b_1,$$

because every bracket, and $b_{2m}$, is at least 0. By the Monotone Convergence Theorem, $S_{2m} \to S$ for some number $S$, with $S_{2m} \le S$ for every $m$.

*The odd partial sums decrease towards the same limit.* $S_{2m+1} = S_{2m-1} - (b_{2m} - b_{2m+1}) \le S_{2m-1}$, and $S_{2m+1} = S_{2m} + b_{2m+1} \to S + 0 = S$. A decreasing sequence is at least its limit, so $S \le S_{2m+1}$ for every $m$.

*So $S_N \to S$.* Given $\varepsilon > 0$, the even partial sums are within $\varepsilon$ of $S$ beyond some index, and the odd ones beyond another; beyond the larger of the two, all of them are. Finally $S_{2m} \le S \le S_{2m+1}$ and $S_{2m} \le S \le S_{2m-1}$: $S$ lies between $S_N$ and $S_{N+1}$ for every $N$. Therefore $\abs{S - S_N} \le \abs{S_{N+1} - S_N} = b_{N+1}$, and $S - S_N$ has the sign of $S_{N+1} - S_N = (-1)^N b_{N+1}$.
:::

```check
bsym = symbols('b1:8', positive=True)
Sp = lambda m: sum((-1)**(j)*bsym[j] for j in range(m))        # S_m = b_1 - b_2 + ... (m terms)
same(Sp(4) - Sp(2), bsym[2] - bsym[3]); same(Sp(5) - Sp(3), -(bsym[3] - bsym[4]))
same(Sp(6), bsym[0] - (bsym[1] - bsym[2]) - (bsym[3] - bsym[4]) - bsym[5]); same(Sp(5) - Sp(4), bsym[4])
```

The alternating harmonic series satisfies the hypotheses, since $b_n = 1/n$ is positive, decreasing and tends to 0: it converges. Its sum is $\ln 2$, a fact stated here and proved in Module 15 with the power series of $\ln(1 + x)$ (Exercise 14.11 gives another proof). The error bound shows how slowly it converges: to be sure of an error of at most 0.001 from the bound $\tfrac{1}{N + 1}$, you need $N = 999$ terms. It converges, but not because its terms are small: their sizes $1/n$ add up to infinity. The cancellation between positive and negative terms does the work. Section 14.8 names this kind of convergence.

```check
same(summation((-1)**(n - 1)/n, (n, 1, oo)), log(2)); holds(Rational(1, 999 + 1) <= Rational(1, 1000)); holds(Rational(1, 998 + 1) > Rational(1, 1000))
```

::: example An alternating series estimate
Estimate the sum of $\displaystyle\sum_{n=0}^{\infty}\frac{(-1)^n}{n!} = 1 - 1 + \frac{1}{2!} - \frac{1}{3!} + \cdots$ with an error of at most 0.001.

Here $b_n = 1/n!$ for $n \ge 0$. These numbers are positive; they decrease, since $b_{n+1} = \dfrac{b_n}{n + 1} \le b_n$; and they tend to 0, since $n! \ge n$, so that $0 < 1/n! \le 1/n$ for $n \ge 1$. The test applies, starting at $n = 0$.

The first term left out must be at most 0.001. Since $\tfrac{1}{6!} = \tfrac{1}{720} \approx 0.00139$ is too big and $\tfrac{1}{7!} = \tfrac{1}{5040} \approx 0.000198$ is small enough, add the terms up to $n = 6$:

$$S_7 = 1 - 1 + \frac12 - \frac16 + \frac{1}{24} - \frac{1}{120} + \frac{1}{720} = \frac{53}{144} \approx 0.368056.$$

The error is at most $\tfrac{1}{5040} \approx 0.000198$, and it has the sign of the first term left out, $-\tfrac{1}{5040}$, so the sum lies a little below $S_7$:

$$0.367857 \le S \le 0.368056.$$

Module 15 shows that the sum is $1/e \approx 0.367879$, inside the interval.

```check
bf = lambda j: 1/factorial(j)
holds(all(bf(j + 1) == bf(j)/(j + 1) for j in range(0, 30))); holds(all(bf(j) <= Rational(1, j) for j in range(1, 30)))
rounds(Rational(1, 720), '0.00139'); rounds(Rational(1, 5040), '0.000198'); holds(Rational(1, 720) > Rational(1, 1000)); holds(Rational(1, 5040) <= Rational(1, 1000))
S7e = sum(Integer(-1)**j/factorial(j) for j in range(0, 7)); same(S7e, Rational(53, 144)); rounds(S7e, '0.368056')
rounds(S7e - Rational(1, 5040), '0.367857'); holds(S7e - Rational(1, 5040) <= exp(-1)); holds(exp(-1) <= S7e)
same(summation((-1)**n/factorial(n), (n, 0, oo)), exp(-1)); rounds(exp(-1), '0.367879')
```
:::

::: pitfall
All three hypotheses matter, and "decreasing" is the one that gets forgotten. The series

$$1 - 1 + \frac12 - \frac14 + \frac13 - \frac19 + \frac14 - \frac{1}{16} + \cdots,$$

whose terms are $\tfrac1k$ and $-\tfrac{1}{k^2}$ in turn, alternates in sign, and its terms tend to 0, but their sizes do not decrease. Its partial sum after $2K$ terms is $\big(1 + \tfrac12 + \cdots + \tfrac1K\big) - \big(1 + \tfrac14 + \cdots + \tfrac{1}{K^2}\big)$, which is more than $H_K - 2$ and so tends to infinity: the series diverges.

```check
blk2 = lambda K: sum(Rational(1, kk) - Rational(1, kk**2) for kk in range(1, K + 1))
holds(all(blk2(K) > harmonic(K) - 2 for K in range(1, 200))); holds(all(harmonic(K, 2) < 2 for K in range(1, 300)))
holds(Rational(1, 4) < Rational(1, 3))                 # the sizes 1/4, 1/3 are not decreasing
limit_is(harmonic(n) - 2, n, oo, oo)
```
:::

## Absolute convergence and the ratio and root tests {#absolute}

Some series have terms of both signs that do not alternate, such as

$$\sum_{n=1}^{\infty}\frac{\sin n}{n^2} = \frac{\sin 1}{1} + \frac{\sin 2}{4} + \frac{\sin 3}{9} + \cdots,$$

whose terms start with three positive ones (since $1$, $2$ and $3$ lie between 0 and $\pi$) and then four negative ones. The alternating series test does not apply. But the sizes of the terms are at most $1/n^2$, and that settles it.

```check
same([sign(sin(j)) for j in range(1, 8)], [1, 1, 1, -1, -1, -1, 1]); holds(Integer(3) < pi)
```

::: definition Absolute and conditional convergence
A series $\sum a_n$ **converges absolutely** if $\sum \abs{a_n}$ converges. It **converges conditionally** if $\sum a_n$ converges but $\sum \abs{a_n}$ diverges.
:::

::: theorem Absolute convergence implies convergence
If $\sum \abs{a_n}$ converges, then $\sum a_n$ converges, and $\abs{\sum a_n} \le \sum \abs{a_n}$.
:::

::: proof
For every $n$, $0 \le a_n + \abs{a_n} \le 2\abs{a_n}$: the middle is 0 if $a_n < 0$ and $2a_n$ if $a_n \ge 0$. The series $\sum 2\abs{a_n}$ converges, so $\sum (a_n + \abs{a_n})$ converges by the comparison test, and then $\sum a_n = \sum (a_n + \abs{a_n}) - \sum \abs{a_n}$ converges by the sum laws. For the inequality, the triangle inequality of [Module 2](module_02_EN.html#no-limit-proof) gives $-\sum\abs{a_n} \le S_N \le \sum\abs{a_n}$ for every $N$, and limits keep these inequalities.
:::

```check
ar_ = symbols('a', real=True)
for v in (-3, Rational(-1, 2), 0, Rational(2, 7), 5):
    holds(0 <= v + Abs(v)); holds(v + Abs(v) <= 2*Abs(v))
same((ar_ + Abs(ar_)).subs(ar_, -2), 0); same((ar_ + Abs(ar_)).subs(ar_, 3), 6)
```

::: example Absolute or conditional?
Decide how these converge: (a) $\displaystyle\sum_{n=1}^{\infty}\frac{\sin n}{n^2}$, (b) $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{n^2}$, (c) $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{\sqrt n}$.

**(a)** $\abs{\dfrac{\sin n}{n^2}} \le \dfrac{1}{n^2}$, since $\abs{\sin n} \le 1$, and $\sum 1/n^2$ converges. By the comparison test $\sum \abs{\sin n}/n^2$ converges: the series converges absolutely.

**(b)** $\sum \abs{a_n} = \sum 1/n^2$ converges: absolutely.

**(c)** $\sum \abs{a_n} = \sum 1/\sqrt n$ diverges ($p = \tfrac12$). But $b_n = 1/\sqrt n$ is positive, decreasing and tends to 0, so the series converges by the alternating series test: it converges conditionally. The alternating harmonic series converges conditionally for the same reason.

```check
holds(all(Abs(sin(j))/j**2 <= Rational(1, j**2) for j in range(1, 300))); holds(Sum(1/n**2, (n, 1, oo)).is_convergent())
same(summation(1/n**2, (n, 1, oo)), pi**2/6); holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
holds(all(1/sqrt(j + 1) < 1/sqrt(j) for j in range(1, 300))); limit_is(1/sqrt(n), n, oo, 0)
holds(Sum((-1)**(n - 1)/sqrt(n), (n, 1, oo)).is_convergent())
```
:::

### Rearrangements {#rearrangements}

A finite sum gives the same total in any order. So does an absolutely convergent series: every **rearrangement**, the same terms taken in another order, converges to the same sum (a proof is in courses on analysis). A conditionally convergent series is different. Take the terms of the alternating harmonic series in this order: one positive term, then two negative ones,

$$1 - \frac12 - \frac14 + \frac13 - \frac16 - \frac18 + \frac15 - \frac{1}{10} - \frac{1}{12} + \cdots$$

Every term appears exactly once: the $k$th group is $\tfrac{1}{2k - 1} - \tfrac{1}{4k - 2} - \tfrac{1}{4k}$, and between them the groups use each odd denominator once and each even one once. In each group, the first two terms combine, $\tfrac{1}{2k - 1} - \tfrac{1}{4k - 2} = \tfrac{1}{4k - 2}$, so the sum of the first $3K$ terms is

$$\sum_{k=1}^{K}\Big(\frac{1}{4k - 2} - \frac{1}{4k}\Big) = \frac12\sum_{k=1}^{K}\Big(\frac{1}{2k - 1} - \frac{1}{2k}\Big) = \frac12 S_{2K},$$

half of a partial sum of the alternating harmonic series. It tends to $\tfrac12\ln 2$. The sums of $3K + 1$ and $3K + 2$ terms differ from it by at most $\tfrac{1}{2K + 1}$, which tends to 0, so the rearranged series converges to $\tfrac12 \ln 2$: the same terms, half the sum.

```check
kk_ = symbols('k', positive=True, integer=True)
same(1/(2*kk_ - 1) - 1/(4*kk_ - 2), 1/(4*kk_ - 2)); same(1/(4*kk_ - 2) - 1/(4*kk_), (1/(2*kk_ - 1) - 1/(2*kk_))/2)
rearr = lambda K: sum(Rational(1, 2*k_ - 1) - Rational(1, 4*k_ - 2) - Rational(1, 4*k_) for k_ in range(1, K + 1))
for K in range(1, 30):
    same(rearr(K), altS(2*K)/2)
    holds(Abs(Rational(1, 2*K + 1)) <= Rational(1, 2*K + 1)); same(Rational(1, 2*K + 1) - Rational(1, 4*K + 2), Rational(1, 4*K + 2))
dens = sorted([2*k_ - 1 for k_ in range(1, 51)] + [4*k_ - 2 for k_ in range(1, 51)] + [4*k_ for k_ in range(1, 51)])
same(dens[:100], list(range(1, 101)))                       # every denominator once (up to 100)
rounds(log(2)/2, '0.3466')
```

::: deeper Riemann's rearrangement theorem
A first reading may skip this box. The example is no accident. **Riemann's rearrangement theorem** says that if $\sum a_n$ converges conditionally, then for every number $T$ some rearrangement converges to $T$, and other rearrangements diverge to $\infty$ or to $-\infty$.

Here is the idea of the proof. Let $p_1, p_2, \dots$ be the positive terms, in their original order, and $q_1, q_2, \dots$ the sizes of the negative ones. Both $\sum p_k$ and $\sum q_k$ diverge. If both converged, $\sum \abs{a_n}$ would converge; if one converged and the other diverged, the partial sums of $\sum a_n$ would tend to $\infty$ or $-\infty$. And $p_k \to 0$ and $q_k \to 0$, because $a_n \to 0$. Now take positive terms until the total first exceeds $T$, then negative terms until it first drops below $T$, then positive terms until it exceeds $T$ again, and so on. Each stage ends after finitely many terms, because the unused $p$s, or $q$s, still add up to infinity, and every term is used sooner or later. Each time the total crosses $T$, it overshoots by at most the term added last, and these terms tend to 0, so the partial sums close in on $T$. For a sum of $\infty$, take positive terms until the total exceeds 1, then one negative term, then positive terms until it exceeds 2, one negative term, and so on.

Computers meet a cousin of this effect even in finite sums. Floating-point addition rounds every result, so adding the same numbers in another order can give another answer: in Python, `0.1 + 0.2 + 0.3` gives `0.6000000000000001`, while `0.3 + 0.2 + 0.1` gives `0.6`.
:::

```check
holds(0.1 + 0.2 + 0.3 == 0.6000000000000001); holds(0.3 + 0.2 + 0.1 == 0.6)
```

### The ratio test {#ratio}

Comparison needs a series to compare with. For terms built from factorials and powers, such as $n!/n^n$ or $n^3/3^n$, the right series to compare with is geometric, and the ratio of consecutive terms shows which one. The Going deeper box of [Section 3.8](module_03_EN.html#growth) used this idea to show that $n^p/a^n \to 0$.

::: theorem The ratio test
Suppose that $a_n \ne 0$ for every $n$, and that

$$\lim_{n\to\infty}\abs{\frac{a_{n+1}}{a_n}} = \rho,$$

where $\rho$, the Greek letter rho, is a number or $\infty$.

- If $\rho < 1$, the series $\sum a_n$ converges absolutely.
- If $\rho > 1$ or $\rho = \infty$, the series diverges.
- If $\rho = 1$, the test gives no conclusion.
:::

::: proof
Suppose that $\rho < 1$, and choose a number $r$ with $\rho < r < 1$, for instance $r = \tfrac12(\rho + 1)$. Since the ratios tend to $\rho$, there is an index $k$ with $\abs{a_{n+1}} \le r\abs{a_n}$ for every $n \ge k$. Then $\abs{a_{k+1}} \le r\abs{a_k}$, $\abs{a_{k+2}} \le r^2\abs{a_k}$, and in general $\abs{a_{k+j}} \le \abs{a_k}r^j$. The geometric series $\sum_j \abs{a_k}r^j$ converges, because $0 < r < 1$, so $\sum \abs{a_n}$ converges by the comparison test.

Suppose that $\rho > 1$ or $\rho = \infty$. Then there is an index $k$ with $\abs{a_{n+1}} > \abs{a_n}$ for every $n \ge k$, so from $a_k$ on the sizes of the terms increase, and they stay at least $\abs{a_k} > 0$. The terms do not tend to 0, and the series diverges by the divergence test.

For $\rho = 1$, here are two series, one convergent and one divergent, that both have $\rho = 1$. For $\sum 1/n$, the ratio is $\dfrac{n}{n + 1} \to 1$; for $\sum 1/n^2$, it is $\dfrac{n^2}{(n + 1)^2} \to 1$.
:::

```check
rho_ = symbols('rho', nonnegative=True)
holds(((rho_ + 1)/2 - rho_).subs(rho_, Rational(1, 3)) > 0); same((rho_ + 1)/2 - rho_, (1 - rho_)/2)
limit_is((1/(n + 1))/(1/n), n, oo, 1); limit_is((1/(n + 1)**2)/(1/n**2), n, oo, 1)
same((1/(n + 1))/(1/n), n/(n + 1)); same((1/(n + 1)**2)/(1/n**2), n**2/(n + 1)**2)
```

The ratio test suits factorials and exponentials. For $\sum 1/n!$, the ratio is $\dfrac{n!}{(n + 1)!} = \dfrac{1}{n + 1} \to 0$, so the series converges; Module 15 shows that $\sum_{n=0}^{\infty} 1/n! = e$. The test is useless for $p$-series and for terms built from powers of $n$, which always give $\rho = 1$: use comparison for those.

```check
same(factorial(n)/factorial(n + 1), 1/(n + 1)); limit_is(1/(n + 1), n, oo, 0); same(summation(1/factorial(n), (n, 0, oo)), E)
```

::: example The ratio test
Decide whether these converge: (a) $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2^n}$, (b) $\displaystyle\sum_{n=1}^{\infty}\frac{n!}{n^n}$, (c) $\displaystyle\sum_{n=1}^{\infty}\frac{3^n}{n^2}$.

**(a)** The ratio of consecutive terms is

$$\abs{\frac{a_{n+1}}{a_n}} = \frac{n + 1}{2^{n+1}}\cdot\frac{2^n}{n} = \frac{n + 1}{2n} = \frac12\Big(1 + \frac1n\Big) \to \frac12 < 1.$$

The series converges (SymPy finds that its sum is 2).

**(b)** Use $(n + 1)! = (n + 1)\,n!$:

$$\abs{\frac{a_{n+1}}{a_n}} = \frac{(n + 1)!}{(n + 1)^{n+1}}\cdot\frac{n^n}{n!} = \frac{(n + 1)\,n^n}{(n + 1)^{n+1}} = \Big(\frac{n}{n + 1}\Big)^n = \frac{1}{(1 + 1/n)^n} \to \frac1e.$$

Since $\tfrac1e < 1$, the series converges.

**(c)** The ratio of consecutive terms is

$$\abs{\frac{a_{n+1}}{a_n}} = \frac{3^{n+1}}{(n + 1)^2}\cdot\frac{n^2}{3^n} = \frac{3}{(1 + 1/n)^2} \to 3 > 1.$$

The series diverges; indeed its terms grow without bound.

```check
steps((n + 1)/2**(n + 1)*(2**n/n), (n + 1)/(2*n), (1 + 1/n)/2); limit_is((n + 1)/(2*n), n, oo, Rational(1, 2)); same(summation(n/2**n, (n, 1, oo)), 2)
same(factorial(n + 1), (n + 1)*factorial(n))
steps(factorial(npp + 1)/(npp + 1)**(npp + 1)*(npp**npp/factorial(npp)), (npp + 1)*npp**npp/(npp + 1)**(npp + 1), (npp/(npp + 1))**npp)
same((npp/(npp + 1))**npp, 1/(1 + 1/npp)**npp); limit_is((n/(n + 1))**n, n, oo, 1/E); holds(1/E < 1)
steps(3**(n + 1)/(n + 1)**2*(n**2/3**n), 3*n**2/(n + 1)**2, 3/(1 + 1/n)**2); limit_is(3/(1 + 1/n)**2, n, oo, 3); limit_is(3**n/n**2, n, oo, oo)
```
:::

::: pitfall
The ratio test needs the limit of the ratios; ratios below 1 are not enough. For the harmonic series, $\dfrac{a_{n+1}}{a_n} = \dfrac{n}{n + 1} < 1$ for every $n$, yet the series diverges: the ratios creep up towards 1, and no fixed $r < 1$ bounds them. And $\rho = 1$ means "no conclusion", not "diverges": $\sum 1/n^2$ has $\rho = 1$ and converges.

```check
holds(all(Rational(j, j + 1) < 1 for j in range(1, 500))); limit_is(n/(n + 1), n, oo, 1)
```
:::

### The root test {#root}

For terms that are $n$th powers, such as $\big(\tfrac{n}{2n + 1}\big)^n$, the $n$th root removes the power.

::: theorem The root test
Suppose that $\displaystyle\lim_{n\to\infty}\abs{a_n}^{1/n} = \rho$, a number or $\infty$. If $\rho < 1$, the series $\sum a_n$ converges absolutely; if $\rho > 1$ or $\rho = \infty$, it diverges; if $\rho = 1$, the test gives no conclusion.
:::

::: proof
If $\rho < 1$, choose $r$ with $\rho < r < 1$. From some index on, $\abs{a_n}^{1/n} < r$, that is, $\abs{a_n} < r^n$, and $\sum r^n$ converges: compare. If $\rho > 1$, then from some index on $\abs{a_n}^{1/n} > 1$, so $\abs{a_n} > 1$, and the terms do not tend to 0. For $\rho = 1$: both $\sum 1/n$ and $\sum 1/n^2$ have $\rho = 1$, since $n^{1/n} \to 1$ (Example 14.3), so that $(1/n)^{1/n} = 1/n^{1/n} \to 1$ and $(1/n^2)^{1/n} = 1/\big(n^{1/n}\big)^2 \to 1$.
:::

For example, for $\displaystyle\sum_{n=1}^{\infty}\Big(\frac{n}{2n + 1}\Big)^n$, $\abs{a_n}^{1/n} = \dfrac{n}{2n + 1} = \dfrac{1}{2 + 1/n} \to \dfrac12 < 1$: the series converges.

```check
same(((npp/(2*npp + 1))**npp)**(1/npp), npp/(2*npp + 1)); same(npp/(2*npp + 1), 1/(2 + 1/npp)); limit_is(n/(2*n + 1), n, oo, Rational(1, 2))
same((1/npp)**(1/npp), 1/npp**(1/npp)); same((1/npp**2)**(1/npp), 1/(npp**(1/npp))**2); limit_is((1/n)**(1/n), n, oo, 1); limit_is((1/n**2)**(1/n), n, oo, 1)
```

## A strategy for testing series {#strategy}

No single test decides every series, and a test whose hypotheses fail tells you nothing. Faced with a series $\sum a_n$, ask these questions in order:

1. **Do the terms tend to 0?** If not, the series diverges (the divergence test). If they do, carry on: this proves nothing yet.
2. **Is it a series you know?** A geometric series $\sum ar^n$ converges exactly when $\abs{r} < 1$, and a $p$-series $\sum 1/n^p$ exactly when $p > 1$. Is it telescoping?
3. **Positive terms built from powers of $n$**, such as rational functions and roots: compare, usually by limit comparison with the $p$-series given by the leading terms.
4. **Factorials, or exponentials such as $2^n$**: the ratio test. **A whole expression raised to the power $n$**: the root test.
5. **Terms $f(n)$ with an $f$ you can integrate**, such as $\dfrac{1}{n\ln n}$: the integral test, after checking that $f$ is positive and decreasing.
6. **Signs that alternate**: first test $\sum \abs{a_n}$ with steps 2 to 5. If it converges, the series converges absolutely; if not, try the alternating series test, which may show conditional convergence.
7. **Other mixed signs**: test $\sum \abs{a_n}$.

The hypotheses need to hold only from some index on, since the first terms never decide convergence (Theorem 14.6).

::: example Choosing a test
Decide whether each series converges, and say which test shows it.

- (a) $\displaystyle\sum_{n=1}^{\infty}\frac{n^2 + 1}{3n^2 - n}$
- (b) $\displaystyle\sum_{n=1}^{\infty}\frac{3n + 1}{n^3 + 2}$
- (c) $\displaystyle\sum_{n=1}^{\infty}\frac{n^3}{3^n}$
- (d) $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n\,n}{n^2 + 1}$
- (e) $\displaystyle\sum_{n=1}^{\infty}\Big(\frac{2n}{3n + 1}\Big)^n$
- (f) $\displaystyle\sum_{n=2}^{\infty}\frac{1}{n\sqrt{\ln n}}$

**(a)** Step 1: $\dfrac{n^2 + 1}{3n^2 - n} = \dfrac{1 + 1/n^2}{3 - 1/n} \to \dfrac13 \ne 0$. The series diverges by the divergence test.

**(b)** Step 3. The leading terms give $\dfrac{3n}{n^3} = \dfrac{3}{n^2}$, so compare with $\dfrac{1}{n^2}$: $\dfrac{a_n}{1/n^2} = \dfrac{3n^3 + n^2}{n^3 + 2} = \dfrac{3 + 1/n}{1 + 2/n^3} \to 3$. The series converges by limit comparison with the $p$-series for $p = 2$.

**(c)** Step 4, an exponential: $\abs{\dfrac{a_{n+1}}{a_n}} = \dfrac{(n + 1)^3}{3^{n+1}}\cdot\dfrac{3^n}{n^3} = \dfrac13\Big(1 + \dfrac1n\Big)^3 \to \dfrac13 < 1$. It converges by the ratio test.

**(d)** Step 6. $\abs{a_n} = \dfrac{n}{n^2 + 1}$, and $\dfrac{n/(n^2 + 1)}{1/n} = \dfrac{n^2}{n^2 + 1} \to 1$, so $\sum \abs{a_n}$ diverges by limit comparison with the harmonic series: no absolute convergence. Now the alternating series test, with $b_n = \dfrac{n}{n^2 + 1}$, which is positive and tends to 0. It decreases: $b_{n+1} \le b_n$ means $(n + 1)(n^2 + 1) \le n\big((n + 1)^2 + 1\big)$, that is, $n^3 + n^2 + n + 1 \le n^3 + 2n^2 + 2n$, that is, $1 \le n^2 + n$, which is true for $n \ge 1$. So the series converges conditionally. (Its signs start with a minus, $-b_1 + b_2 - \cdots$; Theorem 14.15 allows every sign reversed.)

**(e)** Step 4, an $n$th power: $\abs{a_n}^{1/n} = \dfrac{2n}{3n + 1} \to \dfrac23 < 1$. It converges by the root test.

**(f)** Step 5. $f(x) = \dfrac{1}{x\sqrt{\ln x}}$ is continuous, positive and decreasing on $[2, \infty)$, because $x\sqrt{\ln x}$ is positive and increasing there. With $u = \ln x$,

$$\int_2^t\frac{dx}{x\sqrt{\ln x}} = \int_{\ln 2}^{\ln t}\frac{du}{\sqrt u} = 2\sqrt{\ln t} - 2\sqrt{\ln 2} \to \infty,$$

so the series diverges by the integral test.

```check
same((n**2 + 1)/(3*n**2 - n), (1 + 1/n**2)/(3 - 1/n)); limit_is((n**2 + 1)/(3*n**2 - n), n, oo, Rational(1, 3))
same(((3*n + 1)/(n**3 + 2))/(1/n**2), (3*n**3 + n**2)/(n**3 + 2)); same((3*n**3 + n**2)/(n**3 + 2), (3 + 1/n)/(1 + 2/n**3)); limit_is((3*n**3 + n**2)/(n**3 + 2), n, oo, 3)
steps((n + 1)**3/3**(n + 1)*(3**n/n**3), (1 + 1/n)**3/3); limit_is((1 + 1/n)**3/3, n, oo, Rational(1, 3))
same((npp/(npp**2 + 1))/(1/npp), npp**2/(npp**2 + 1)); limit_is(n**2/(n**2 + 1), n, oo, 1)
same(expand(npp*((npp + 1)**2 + 1) - (npp + 1)*(npp**2 + 1)), npp**2 + npp - 1); limit_is(n/(n**2 + 1), n, oo, 0)
same(expand((npp + 1)*(npp**2 + 1)), npp**3 + npp**2 + npp + 1); same(expand(npp*((npp + 1)**2 + 1)), npp**3 + 2*npp**2 + 2*npp)
holds(all(Rational(j + 1, (j + 1)**2 + 1) <= Rational(j, j**2 + 1) for j in range(1, 300)))
holds(Sum((-1)**n*n/(n**2 + 1), (n, 1, oo)).is_convergent()); holds(not Sum(n/(n**2 + 1), (n, 1, oo)).is_convergent())
same(((2*npp/(3*npp + 1))**npp)**(1/npp), 2*npp/(3*npp + 1)); limit_is(2*n/(3*n + 1), n, oo, Rational(2, 3))
same(diff(xg*sqrt(log(xg)), xg), sqrt(log(xg)) + 1/(2*sqrt(log(xg)))); antideriv(2*sqrt(log(x)), 1/(x*sqrt(log(x))), x)
same(integrate(1/sqrt(u), (u, log(2), log(tq))), 2*sqrt(log(tq)) - 2*sqrt(log(2))); limit_is(2*sqrt(log(x)) - 2*sqrt(log(2)), x, oo, oo)
```
:::

Deciding whether a series converges is one question; finding its sum is another, and usually harder. Most convergent series, such as $\sum 1/n^3$, have no known formula for their sum. Then estimate the sum with a guaranteed error: the integral test for positive decreasing terms (Section 14.5), the alternating series bound (Section 14.7), or a comparison of the remainder with a geometric series (Exercise 14.10 shows how). Module 15 turns to series whose terms contain a variable $x$, the power series, which represent functions such as $e^x$ and $\sin x$, and proves the sums $\ln 2$ and $e$ that this module has quoted.

## What you learned {#summary}

- A sequence $(a_n)$ converges to $L$ if for every $\varepsilon > 0$ there is an $N$ with $\abs{a_n - L} < \varepsilon$ for every $n > N$. The limit laws, the squeeze theorem and limits of functions ($a_n = f(n)$, with L'Hôpital's rule applied to $f$) compute limits. The powers $r^n$ tend to 0 exactly when $\abs{r} < 1$.
- The **Monotone Convergence Theorem**, a form of the completeness of the real numbers: an increasing sequence that is bounded above converges, and so does a decreasing sequence that is bounded below. For a recursion $a_{n+1} = g(a_n)$: show that the sequence is monotone and bounded (often by induction), and only then solve $L = g(L)$.
- A **series** $\sum a_n$ converges when its partial sums $S_N$ converge, and its sum is their limit. The geometric series $\sum_{n=0}^{\infty} ar^n$ has sum $\dfrac{a}{1 - r}$ when $\abs{r} < 1$ and diverges otherwise; a telescoping series has $S_N = b_1 - b_{N+1}$.
- If $\sum a_n$ converges, then $a_n \to 0$, so terms that do not tend to 0 mean divergence. The converse is false: the **harmonic series** $\sum 1/n$ diverges, though its partial sums grow only like $\ln N$.
- **Integral test** ($f$ continuous, positive and decreasing): $\sum f(n)$ and $\int_1^{\infty} f(x)\,dx$ converge or diverge together, and $\int_{N+1}^{\infty} f(x)\,dx \le R_N \le \int_N^{\infty} f(x)\,dx$. The $p$-series $\sum 1/n^p$ converges exactly when $p > 1$; $\sum 1/n^2 = \pi^2/6$.
- **Comparison** ($0 \le a_n \le b_n$) and **limit comparison** ($a_n/b_n \to L$ with $0 < L < \infty$) measure a series against one you know.
- **Alternating series test** ($b_n$ positive, decreasing, tending to 0): $\sum (-1)^{n-1}b_n$ converges, and $\abs{S - S_N} \le b_{N+1}$. The alternating harmonic series converges to $\ln 2$, but only **conditionally**; rearranging it can change its sum.
- **Absolute convergence** implies convergence. The **ratio** and **root tests**: $\rho < 1$ means absolute convergence, $\rho > 1$ divergence, and $\rho = 1$ no conclusion.
- **Strategy**: the divergence test first; then known series; comparison for powers of $n$; the ratio test for factorials and exponentials, the root test for $n$th powers; the integral test for functions you can integrate; absolute convergence before the alternating series test.

```check
same(summation(Rational(1, 3)**n, (n, 0, oo)), 1/(1 - Rational(1, 3))); same(summation((-1)**(n - 1)/n, (n, 1, oo)), log(2))
```

## Exercises {#exercises}

:::: exercise Limits of sequences {#ex-14-1} ★
Find the limit of each sequence, or show that it diverges.

- (a) $a_n = \dfrac{4n^2 - n}{2n^2 + 5}$
- (b) $a_n = \dfrac{(-1)^n\,n}{n + 1}$
- (c) $a_n = \Big(1 + \dfrac3n\Big)^n$
- (d) $a_n = \sqrt{n + 1} - \sqrt n$

::: solution
**(a)** Divide the numerator and the denominator by $n^2$: $a_n = \dfrac{4 - 1/n}{2 + 5/n^2} \to \dfrac{4}{2} = 2$.

**(b)** The size of the terms, $\dfrac{n}{n + 1} = \dfrac{1}{1 + 1/n}$, tends to 1, while the sign alternates. For $n \ge 2$, $\dfrac{n}{n + 1} \ge \dfrac23$, so every term with an even index is at least $\tfrac23$, and every term with an odd index from $n = 3$ on is at most $-\tfrac23$. Suppose the sequence had a limit $L$, and challenge it with $\varepsilon = \tfrac23$. Beyond any $N$ there is an even index $p$ and an odd index $q$, and then, by the triangle inequality,

$$\frac43 \le \abs{a_p - a_q} \le \abs{a_p - L} + \abs{L - a_q},$$

so $a_p$ and $a_q$ cannot both lie within $\tfrac23$ of $L$. No $N$ answers the challenge, so no number is the limit: the sequence diverges.

**(c)** By [Theorem 6.6](module_06_EN.html#two-routes) with $x = 3$, $a_n \to e^3 \approx 20.09$. The answer 1, from "the base tends to 1", is the pitfall of Section 14.1: the exponent grows too.

**(d)** The form is $\infty - \infty$, which decides nothing; rationalise, as in Module 2. Multiply and divide by $\sqrt{n + 1} + \sqrt n$:

$$a_n = \frac{(n + 1) - n}{\sqrt{n + 1} + \sqrt n} = \frac{1}{\sqrt{n + 1} + \sqrt n}.$$

The denominator is more than $2\sqrt n$, so $0 < a_n < \dfrac{1}{2\sqrt n}$, and $\dfrac{1}{2\sqrt n} \to 0$. By the squeeze theorem, $a_n \to 0$.

```check
same((4*n**2 - n)/(2*n**2 + 5), (4 - 1/n)/(2 + 5/n**2)); limit_is((4*n**2 - n)/(2*n**2 + 5), n, oo, 2)
same(n/(n + 1), 1/(1 + 1/n)); limit_is(n/(n + 1), n, oo, 1); holds(all(Rational(j, j + 1) >= Rational(2, 3) for j in range(2, 300)))
holds(all(Integer(-1)**j*Rational(j, j + 1) >= Rational(2, 3) for j in range(2, 300, 2))); holds(all(Integer(-1)**j*Rational(j, j + 1) <= -Rational(2, 3) for j in range(3, 300, 2)))
same(Rational(2, 3) - (-Rational(2, 3)), Rational(4, 3)); same(2*Rational(2, 3), Rational(4, 3))
limit_is((1 + 3/n)**n, n, oo, exp(3)); rounds(exp(3), '20.09')
same((sqrt(npp + 1) - sqrt(npp))*(sqrt(npp + 1) + sqrt(npp)), 1)
holds(all(sqrt(j + 1) + sqrt(j) > 2*sqrt(j) for j in range(1, 100))); limit_is(1/(2*sqrt(n)), n, oo, 0); limit_is(sqrt(n + 1) - sqrt(n), n, oo, 0)
```
:::
::::

:::: exercise Geometric series {#ex-14-2} ★
- (a) Find $\displaystyle\sum_{n=2}^{\infty}\Big(\frac34\Big)^n$.
- (b) Find $\displaystyle\sum_{n=0}^{\infty}\frac{2^{n+1}}{5^n}$.
- (c) Write $0.181818\ldots$ and $0.4999\ldots$ as fractions.
- (d) A ball is dropped from a height of 2 metres, and after each bounce it rises to $\tfrac34$ of the height it fell from (the numbers are hypothetical). What total distance does it travel?

::: solution
**(a)** The first term, at $n = 2$, is $\tfrac{9}{16}$, and $r = \tfrac34$: the sum is $\dfrac{9/16}{1 - 3/4} = \dfrac{9/16}{1/4} = \dfrac94$.

**(b)** $\dfrac{2^{n+1}}{5^n} = 2\Big(\dfrac25\Big)^n$, a geometric series with $a = 2$ and $r = \tfrac25$: the sum is $\dfrac{2}{1 - 2/5} = \dfrac{2}{3/5} = \dfrac{10}{3}$.

**(c)** $0.181818\ldots = \dfrac{18}{100} + \dfrac{18}{100^2} + \cdots = \dfrac{18/100}{1 - 1/100} = \dfrac{18}{99} = \dfrac{2}{11}$. And

$$0.4999\ldots = \frac{4}{10} + \Big(\frac{9}{100} + \frac{9}{1000} + \cdots\Big) = \frac{4}{10} + \frac{9/100}{1 - 1/10} = \frac{4}{10} + \frac{1}{10} = \frac12.$$

**(d)** The ball falls 2 m. Then it rises 1.5 m and falls 1.5 m, rises 1.125 m and falls 1.125 m, and so on: each height after the first is travelled twice. The heights $1.5, 1.125, \dots$ form a geometric series with $a = 1.5$ and $r = \tfrac34$, so the total distance is

$$2 + 2\cdot\frac{1.5}{1 - 3/4} = 2 + 2 \cdot 6 = 14 \text{ metres}.$$

The tempting $\dfrac{2}{1 - 3/4} = 8$ m counts each height only once.

```check
same(summation(Rational(3, 4)**n, (n, 2, oo)), Rational(9, 4)); steps(Rational(9, 16)/(1 - Rational(3, 4)), Rational(9, 16)/Rational(1, 4), Rational(9, 4))
holds(all(Integer(2)**(j + 1)/Integer(5)**j == 2*Rational(2, 5)**j for j in range(0, 20))); same(summation(2**(n + 1)/5**n, (n, 0, oo)), Rational(10, 3))
steps(Rational(18, 100)/(1 - Rational(1, 100)), Rational(18, 99), Rational(2, 11)); rounds(Rational(2, 11), '0.181818')
steps(Rational(4, 10) + Rational(9, 100)/(1 - Rational(1, 10)), Rational(4, 10) + Rational(1, 10), Rational(1, 2))
same(2*Rational(3, 4), Rational(3, 2)); same(Rational(3, 2)*Rational(3, 4), Rational(9, 8))
steps(2 + 2*Rational(3, 2)/(1 - Rational(3, 4)), 2 + 2*6, 14); same(2/(1 - Rational(3, 4)), 8)
```
:::
::::

:::: exercise Quick decisions {#ex-14-3} ★
Decide whether each series converges or diverges, with a one-line reason.

- (a) $\displaystyle\sum_{n=1}^{\infty}\frac{n}{3n + 2}$
- (b) $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^{1.01}}$
- (c) $\displaystyle\sum_{n=1}^{\infty}\frac{1}{\sqrt n}$
- (d) $\displaystyle\sum_{n=0}^{\infty}\Big(\frac{e}{\pi}\Big)^n$
- (e) $\displaystyle\sum_{n=1}^{\infty}(-1)^n$

::: solution
**(a)** The terms tend to $\tfrac13 \ne 0$: the series diverges by the divergence test.

**(b)** A $p$-series with $p = 1.01 > 1$: it converges.

**(c)** A $p$-series with $p = \tfrac12 \le 1$: it diverges, although its terms tend to 0 (the divergence test says nothing here).

**(d)** A geometric series with ratio $r = e/\pi \approx 0.865$, and $\abs{r} < 1$: it converges, to $\dfrac{1}{1 - e/\pi} = \dfrac{\pi}{\pi - e} \approx 7.42$.

**(e)** The terms $-1, 1, -1, \dots$ do not tend to 0 (they have no limit): it diverges.

```check
limit_is(n/(3*n + 2), n, oo, Rational(1, 3)); holds(Sum(1/n**Rational(101, 100), (n, 1, oo)).is_convergent()); holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
rounds(E/pi, '0.865'); holds(E/pi < 1); same(1/(1 - E/pi), pi/(pi - E)); rounds(pi/(pi - E), '7.42')
same([(-1)**j for j in range(1, 5)], [-1, 1, -1, 1])
```
:::
::::

:::: exercise Telescoping series {#ex-14-4} ★
- (a) Show that $\dfrac{2}{n^2 - 1} = \dfrac{1}{n - 1} - \dfrac{1}{n + 1}$ for $n \ge 2$, and find $\displaystyle\sum_{n=2}^{\infty}\frac{2}{n^2 - 1}$.
- (b) Find $\displaystyle\sum_{n=1}^{\infty}\Big(\frac{1}{\sqrt n} - \frac{1}{\sqrt{n + 1}}\Big)$.

::: solution
**(a)** Over the common denominator $(n - 1)(n + 1) = n^2 - 1$, the right side is $\dfrac{(n + 1) - (n - 1)}{n^2 - 1} = \dfrac{2}{n^2 - 1}$. Each negative part cancels with a positive part two places later, so the sum of the terms from $n = 2$ to $n = N$ is

$$\Big(1 - \frac13\Big) + \Big(\frac12 - \frac14\Big) + \Big(\frac13 - \frac15\Big) + \cdots + \Big(\frac{1}{N - 1} - \frac{1}{N + 1}\Big) = 1 + \frac12 - \frac1N - \frac{1}{N + 1},$$

which tends to $\tfrac32$. The sum is $\tfrac32$. Do not split the series into $\sum \tfrac{1}{n - 1} - \sum \tfrac{1}{n + 1}$: both of those diverge, and the sum laws apply only to convergent series.

**(b)** It telescopes, with $b_n = 1/\sqrt n$: $S_N = 1 - \dfrac{1}{\sqrt{N + 1}} \to 1$. The sum is 1, although $\sum 1/\sqrt n$ itself diverges.

```check
same(1/(n - 1) - 1/(n + 1), 2/(n**2 - 1)); same((n - 1)*(n + 1), n**2 - 1)
for Nn in range(2, 15):
    same(sum(Rational(2, j**2 - 1) for j in range(2, Nn + 1)), 1 + Rational(1, 2) - Rational(1, Nn) - Rational(1, Nn + 1))
limit_is(1 + Rational(1, 2) - 1/n - 1/(n + 1), n, oo, Rational(3, 2)); same(summation(2/(n**2 - 1), (n, 2, oo)), Rational(3, 2))
for Nn in range(1, 12):
    same(sum(1/sqrt(j) - 1/sqrt(j + 1) for j in range(1, Nn + 1)), 1 - 1/sqrt(Nn + 1))
limit_is(1 - 1/sqrt(n + 1), n, oo, 1)
```
:::
::::

:::: exercise An ε–N proof {#ex-14-5} ★★
- (a) Prove from Definition 14.2 that $\displaystyle\lim_{n\to\infty}\frac{2n - 1}{n + 4} = 2$.
- (b) Find the smallest whole number $N$ such that every term after the $N$th is within 0.001 of 2.

::: solution
**(a)** *Scratch work.* $\abs{\dfrac{2n - 1}{n + 4} - 2} = \abs{\dfrac{2n - 1 - 2(n + 4)}{n + 4}} = \dfrac{9}{n + 4}$, since the numerator is $-9$ and $n + 4 > 0$. This is less than $\varepsilon$ when $n + 4 > 9/\varepsilon$, so $N = 9/\varepsilon$ will do.

*Proof.* Let $\varepsilon > 0$ and $N = 9/\varepsilon$. For every $n > N$, $n + 4 > 9/\varepsilon$, so $\abs{\dfrac{2n - 1}{n + 4} - 2} = \dfrac{9}{n + 4} < \varepsilon$. Every challenge is met, and the limit is 2.

**(b)** $\dfrac{9}{n + 4} < 0.001$ exactly when $n + 4 > 9000$, that is, when $n > 8996$. So $N = 8996$ works: every term from the 8997th on is within 0.001 of 2. No smaller $N$ does, because the 8996th term is exactly 0.001 from 2: $\dfrac{9}{9000} = 0.001$, which is not less than 0.001.

```check
an5 = (2*nn - 1)/(nn + 4)
steps(an5 - 2, (2*nn - 1 - 2*(nn + 4))/(nn + 4), -9/(nn + 4)); same(Abs(an5 - 2), 9/(nn + 4))
holds((ep - 9/(9/ep + 4)).factor().is_positive)
holds(Rational(9, 8997 + 4) < Rational(1, 1000)); same(Rational(9, 8996 + 4), Rational(1, 1000))
same(solve(Eq(9/(x + 4), Rational(1, 1000)), x), [8996]); limit_is((2*n - 1)/(n + 4), n, oo, 2)
```
:::
::::

:::: exercise A recursive sequence {#ex-14-6} ★★
Let $a_1 = 1.5$ and $a_{n+1} = \dfrac{a_n^2 + 2}{3}$.

- (a) Compute $a_2$ and $a_3$.
- (b) Show that $1 < a_n < 2$ for every $n$, and that the sequence is decreasing.
- (c) Find its limit.
- (d) What happens if instead $a_1 = 3$?

::: solution
**(a)** $a_2 = \dfrac{2.25 + 2}{3} = \dfrac{17}{12} \approx 1.4167$, and $a_3 = \dfrac{(17/12)^2 + 2}{3} = \dfrac{577}{432} \approx 1.3356$.

**(b)** By induction. $a_1 = 1.5$ lies between 1 and 2. If $1 < a_n < 2$, then $1 < a_n^2 < 4$, so $3 < a_n^2 + 2 < 6$ and $1 < a_{n+1} < 2$. So $1 < a_n < 2$ for every $n$. Next,

$$a_{n+1} - a_n = \frac{a_n^2 - 3a_n + 2}{3} = \frac{(a_n - 1)(a_n - 2)}{3} < 0,$$

because $a_n - 1 > 0$ and $a_n - 2 < 0$. So the sequence decreases.

**(c)** It is decreasing and bounded below by 1, so it converges by the Monotone Convergence Theorem, to a number $L$ with $1 \le L \le a_1 = 1.5$. Taking limits on both sides of the recursion, $L = \dfrac{L^2 + 2}{3}$, so $L^2 - 3L + 2 = 0$, that is, $(L - 1)(L - 2) = 0$. Since $L \le 1.5$, $L = 1$.

**(d)** Now $a_2 = \tfrac{11}{3} > a_1$. If $a_n > 2$, then $a_{n+1} - a_n = \tfrac13(a_n - 1)(a_n - 2) > 0$, so $a_{n+1} > a_n > 2$: by induction, the sequence increases and stays above 2. If it converged, its limit would be at least $a_1 = 3$ and would solve $L^2 - 3L + 2 = 0$, whose only solutions are 1 and 2: impossible. So it diverges; being increasing, it is not bounded above (otherwise the Monotone Convergence Theorem would make it converge), so it diverges to infinity. The equation $L = g(L)$ gives the candidates 1 and 2, but neither is the limit: this is the pitfall of Section 14.2.

```check
g6 = lambda v: (v**2 + 2)/3
s6 = [Rational(3, 2)]
for _ in range(12):
    s6.append(g6(s6[-1]))
same(s6[1], Rational(17, 12)); same(s6[2], Rational(577, 432)); rounds(s6[1], '1.4167'); rounds(s6[2], '1.3356')
holds(all(1 < v_ < 2 for v_ in s6)); holds(all(s6[j + 1] < s6[j] for j in range(12)))
same(expand(g6(ap) - ap), expand((ap - 1)*(ap - 2)/3)); same(factor(ap**2 - 3*ap + 2), (ap - 1)*(ap - 2))
same_set(solve(Eq(Lr, g6(Lr)), Lr), [1, 2])
t6 = [Integer(3)]
for _ in range(6):
    t6.append(g6(t6[-1]))
same(t6[1], Rational(11, 3)); holds(all(t6[j + 1] > t6[j] > 2 for j in range(6)))
```
:::
::::

:::: exercise Estimating $\sum 1/n^3$ {#ex-14-7} ★★
- (a) Show with the integral test that $\sum_{n=1}^{\infty} 1/n^3$ converges.
- (b) Use $S_5$ and the remainder estimate to find an interval that contains the sum.
- (c) How many terms $N$ make sure that $S_N$ alone is within 0.0005 of the sum?

::: solution
**(a)** $f(x) = 1/x^3$ is continuous, positive and decreasing on $[1, \infty)$, and $\displaystyle\int_1^{\infty}\frac{dx}{x^3} = \lim_{t\to\infty}\Big[-\frac{1}{2x^2}\Big]_1^t = \frac12$ converges (a $p$-integral with $p = 3$). So the series converges.

**(b)** $S_5 = 1 + \tfrac18 + \tfrac{1}{27} + \tfrac{1}{64} + \tfrac{1}{125} \approx 1.185662$. In general $\displaystyle\int_N^{\infty}\frac{dx}{x^3} = \frac{1}{2N^2}$, so $\int_6^{\infty} = \tfrac{1}{72} \approx 0.013889$ and $\int_5^{\infty} = \tfrac{1}{50} = 0.02$. The remainder estimate gives

$$1.199551 \le S \le 1.205662.$$

(The sum is about 1.202057, and no formula for it is known.)

**(c)** $R_N \le \displaystyle\int_N^{\infty}\frac{dx}{x^3} = \frac{1}{2N^2}$, and $\dfrac{1}{2N^2} \le 0.0005$ exactly when $N^2 \ge 1000$. Since $31^2 = 961$ and $32^2 = 1024$, $N = 32$ terms suffice.

```check
same(integrate(1/x**3, (x, 1, oo)), Rational(1, 2)); antideriv(-1/(2*x**2), 1/x**3, x)
S5c = sum(Rational(1, j**3) for j in range(1, 6)); rounds(S5c, '1.185662')
same(integrate(1/x**3, (x, Np, oo)), 1/(2*Np**2)); same(integrate(1/x**3, (x, 6, oo)), Rational(1, 72)); rounds(Rational(1, 72), '0.013889'); same(integrate(1/x**3, (x, 5, oo)), Rational(1, 50))
rounds(S5c + Rational(1, 72), '1.199551'); rounds(S5c + Rational(1, 50), '1.205662'); rounds(zeta(3), '1.202057')
holds(S5c + Rational(1, 72) <= zeta(3)); holds(zeta(3) <= S5c + Rational(1, 50))
same(31**2, 961); same(32**2, 1024); holds(Rational(1, 2*32**2) <= Rational(5, 10000)); holds(Rational(1, 2*31**2) > Rational(5, 10000))
```
:::
::::

:::: exercise Comparison tests {#ex-14-8} ★★
Decide whether each series converges, and name the test.

- (a) $\displaystyle\sum_{n=1}^{\infty}\frac{n + 4}{n^3 + 2n}$
- (b) $\displaystyle\sum_{n=1}^{\infty}\frac{2 + \sin n}{n^2}$
- (c) $\displaystyle\sum_{n=1}^{\infty}\frac{1}{3^n - 2^n}$
- (d) $\displaystyle\sum_{n=1}^{\infty}\frac{\sqrt n + 1}{n + 2}$

::: solution
**(a)** The leading terms give $\dfrac{n}{n^3} = \dfrac{1}{n^2}$. Limit comparison with $b_n = 1/n^2$: $\dfrac{a_n}{b_n} = \dfrac{n^3 + 4n^2}{n^3 + 2n} = \dfrac{1 + 4/n}{1 + 2/n^2} \to 1$. Since $\sum 1/n^2$ converges, so does the series.

**(b)** $-1 \le \sin n \le 1$, so $0 < \dfrac{2 + \sin n}{n^2} \le \dfrac{3}{n^2}$. Since $\sum 3/n^2$ converges, the series converges by the comparison test.

**(c)** Compare with $b_n = 1/3^n$ (note $3^n - 2^n > 0$): $\dfrac{a_n}{b_n} = \dfrac{3^n}{3^n - 2^n} = \dfrac{1}{1 - (2/3)^n} \to 1$. The geometric series $\sum 1/3^n$ converges, so the series converges by limit comparison. A direct comparison with $1/3^n$ would point the wrong way, since $\dfrac{1}{3^n - 2^n} > \dfrac{1}{3^n}$.

**(d)** The leading terms give $\dfrac{\sqrt n}{n} = \dfrac{1}{\sqrt n}$. Limit comparison with $b_n = 1/\sqrt n$: $\dfrac{a_n}{b_n} = \dfrac{(\sqrt n + 1)\sqrt n}{n + 2} = \dfrac{n + \sqrt n}{n + 2} \to 1$. Since $\sum 1/\sqrt n$ diverges, so does the series.

```check
same(((n + 4)/(n**3 + 2*n))/(1/n**2), (n**3 + 4*n**2)/(n**3 + 2*n)); same((n**3 + 4*n**2)/(n**3 + 2*n), (1 + 4/n)/(1 + 2/n**2)); limit_is((n**3 + 4*n**2)/(n**3 + 2*n), n, oo, 1)
holds(all(0 < (2 + sin(j))/j**2 for j in range(1, 100))); holds(all((2 + sin(j))/j**2 <= Rational(3, j**2) for j in range(1, 100)))
holds(all(Integer(3)**j - Integer(2)**j > 0 for j in range(1, 60))); same(3**n/(3**n - 2**n), 1/(1 - Rational(2, 3)**n)); limit_is(3**n/(3**n - 2**n), n, oo, 1)
same(((sqrt(npp) + 1)/(npp + 2))/(1/sqrt(npp)), (npp + sqrt(npp))/(npp + 2)); limit_is((n + sqrt(n))/(n + 2), n, oo, 1)
holds(Sum((n + 4)/(n**3 + 2*n), (n, 1, oo)).is_convergent()); holds(not Sum((sqrt(n) + 1)/(n + 2), (n, 1, oo)).is_convergent())
```
:::
::::

:::: exercise An alternating series {#ex-14-9} ★★
Let $S = \displaystyle\sum_{n=1}^{\infty}\frac{(-1)^{n-1}}{n\,2^n} = \frac12 - \frac18 + \frac{1}{24} - \cdots$

- (a) Show that the series converges.
- (b) How many terms guarantee an error of less than 0.001? Compute that partial sum, and give an interval that contains $S$.
- (c) Module 15 shows that $S = \ln\tfrac32$. Is it in your interval?

::: solution
**(a)** $b_n = \dfrac{1}{n\,2^n}$ is positive; it decreases, because $n\,2^n$ increases with $n$; and it tends to 0. By the alternating series test the series converges. (It even converges absolutely, since $b_n \le 1/2^n$.)

**(b)** The first term left out must be less than 0.001, that is, $(N + 1)2^{N+1} > 1000$. For $N + 1 = 7$, $7 \cdot 128 = 896$ is too small; for $N + 1 = 8$, $8 \cdot 256 = 2048$ is enough. So 7 terms:

$$S_7 = \frac12 - \frac18 + \frac{1}{24} - \frac{1}{64} + \frac{1}{160} - \frac{1}{384} + \frac{1}{896} = \frac{909}{2240} \approx 0.405804.$$

The error is at most $b_8 = \tfrac{1}{2048} \approx 0.000488$, and it has the sign of the first term left out, $-\tfrac{1}{2048}$. So

$$0.405315 \le S \le 0.405804.$$

**(c)** $\ln 1.5 \approx 0.405465$ lies in the interval; the error of $S_7$ is about 0.000338, less than the bound.

```check
holds(all((j + 1)*2**(j + 1) > j*2**j for j in range(1, 60))); limit_is(1/(n*2**n), n, oo, 0)
same(7*2**7, 896); same(8*2**8, 2048)
S7c = sum(Rational((-1)**(j - 1), j*2**j) for j in range(1, 8)); same(S7c, Rational(909, 2240)); rounds(S7c, '0.405804')
rounds(Rational(1, 2048), '0.000488'); rounds(S7c - Rational(1, 2048), '0.405315')
same(summation((-1)**(n - 1)/(n*2**n), (n, 1, oo)), log(Rational(3, 2))); rounds(log(Rational(3, 2)), '0.405465')
holds(S7c - Rational(1, 2048) <= log(Rational(3, 2))); holds(log(Rational(3, 2)) <= S7c); rounds(S7c - log(Rational(3, 2)), '0.000338')
```
:::
::::

:::: exercise The ratio and root tests, and a geometric bound {#ex-14-10} ★★
- (a) Decide whether $\displaystyle\sum_{n=1}^{\infty}\frac{n!}{10^n}$ converges.
- (b) Decide whether $\displaystyle\sum_{n=1}^{\infty}\Big(\frac{n}{n + 1}\Big)^{n^2}$ converges.
- (c) What does the ratio test say about $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n^2 + 1}$? Does the series converge?
- (d) For $\displaystyle\sum_{n=1}^{\infty}\frac{n}{2^n}$ (Example 14.16), show that $\dfrac{a_{n+1}}{a_n} \le \dfrac{6}{11}$ for every $n \ge 11$, and deduce that $R_{10} \le \dfrac{a_{11}}{1 - 6/11}$. Compare with the true remainder $R_{10} = 2 - S_{10} = \tfrac{3}{256}$.

::: solution
**(a)** Ratio test: $\dfrac{a_{n+1}}{a_n} = \dfrac{(n + 1)!}{10^{n+1}}\cdot\dfrac{10^n}{n!} = \dfrac{n + 1}{10} \to \infty$. The series diverges: from $n = 10$ on the terms grow.

**(b)** Root test: $\abs{a_n}^{1/n} = \Big(\dfrac{n}{n + 1}\Big)^n = \dfrac{1}{(1 + 1/n)^n} \to \dfrac1e < 1$. The series converges.

**(c)** $\dfrac{a_{n+1}}{a_n} = \dfrac{n^2 + 1}{(n + 1)^2 + 1} \to 1$: the ratio test gives no conclusion, as for every series whose terms are built from powers of $n$. Compare instead: $0 < \dfrac{1}{n^2 + 1} < \dfrac{1}{n^2}$, so the series converges.

**(d)** $\dfrac{a_{n+1}}{a_n} = \dfrac{n + 1}{2n} = \dfrac12 + \dfrac{1}{2n}$, which decreases as $n$ grows, so for $n \ge 11$ it is at most $\dfrac12 + \dfrac{1}{22} = \dfrac{6}{11}$. Then $a_{12} \le \tfrac{6}{11}a_{11}$, $a_{13} \le \big(\tfrac{6}{11}\big)^2 a_{11}$, and so on, so the remainder is at most a geometric series:

$$R_{10} = a_{11} + a_{12} + \cdots \le a_{11}\Big(1 + \frac{6}{11} + \Big(\frac{6}{11}\Big)^2 + \cdots\Big) = \frac{a_{11}}{1 - 6/11} = \frac{11}{2048}\cdot\frac{11}{5} = \frac{121}{10\,240} \approx 0.01182.$$

The true remainder is $\tfrac{3}{256} \approx 0.01172$: the bound is less than 1% too large.

```check
steps(factorial(n + 1)/10**(n + 1)*(10**n/factorial(n)), (n + 1)/10); limit_is((n + 1)/10, n, oo, oo)
holds(all(factorial(j + 1)/Integer(10)**(j + 1) > factorial(j)/Integer(10)**j for j in range(10, 60)))
same(((npp/(npp + 1))**(npp**2))**(1/npp), (npp/(npp + 1))**npp); limit_is((n/(n + 1))**n, n, oo, 1/E)
limit_is((n**2 + 1)/((n + 1)**2 + 1), n, oo, 1); holds(all(Rational(1, j**2 + 1) < Rational(1, j**2) for j in range(1, 100)))
same((n + 1)/(2*n), Rational(1, 2) + 1/(2*n)); same(Rational(1, 2) + Rational(1, 22), Rational(6, 11)); holds(all(Rational(j + 1, 2*j) <= Rational(6, 11) for j in range(11, 300)))
same(Rational(11, 2**11)/(1 - Rational(6, 11)), Rational(121, 10240)); rounds(Rational(121, 10240), '0.01182')
same(2 - sum(Rational(j, 2**j) for j in range(1, 11)), Rational(3, 256)); rounds(Rational(3, 256), '0.01172'); holds(Rational(121, 10240) < Rational(3, 256)*Rational(101, 100))
same(summation(n/2**n, (n, 1, oo)), 2)
```
:::
::::

:::: exercise Euler's constant and the sum ln 2 {#ex-14-11} ★★★
Let $H_N = 1 + \tfrac12 + \cdots + \tfrac1N$ and $d_N = H_N - \ln N$.

- (a) Show that $d_N - d_{N+1} = \displaystyle\int_N^{N+1}\Big(\frac1x - \frac{1}{N + 1}\Big)dx$, and deduce that $(d_N)$ decreases.
- (b) Show that $d_N > 0$ for every $N$, and deduce that $(d_N)$ converges. (Its limit is Euler's constant $\gamma \approx 0.5772$.)
- (c) Show that the $2N$th partial sum of the alternating harmonic series is $S_{2N} = H_{2N} - H_N$, and deduce that $\sum_{n=1}^{\infty} (-1)^{n-1}/n = \ln 2$.

::: solution
**(a)** $d_N - d_{N+1} = (H_N - H_{N+1}) + \big(\ln(N + 1) - \ln N\big) = \ln(N + 1) - \ln N - \dfrac{1}{N + 1}$. Now $\ln(N + 1) - \ln N = \displaystyle\int_N^{N+1}\frac{dx}{x}$, and $\dfrac{1}{N + 1} = \displaystyle\int_N^{N+1}\frac{dx}{N + 1}$, the integral of a constant over an interval of length 1. Subtracting gives the formula. For $N \le x \le N + 1$, $\dfrac1x \ge \dfrac{1}{N + 1}$, so the integrand is never negative and the integral is at least 0: $d_{N+1} \le d_N$.

**(b)** By the integral test inequality of Section 14.5, $H_N \ge \ln(N + 1) > \ln N$, so $d_N > 0$. The sequence $(d_N)$ is decreasing and bounded below by 0, so it converges by the Monotone Convergence Theorem. Since $d_1 = 1$, its limit $\gamma$ lies between 0 and 1.

**(c)** The odd terms of $H_{2N}$ are those of $S_{2N}$ with a plus sign, and the even terms those with a minus sign, so $S_{2N} = H_{2N} - 2\big(\tfrac12 + \tfrac14 + \cdots + \tfrac{1}{2N}\big)$. And $2\big(\tfrac12 + \tfrac14 + \cdots + \tfrac{1}{2N}\big) = 1 + \tfrac12 + \cdots + \tfrac1N = H_N$. So $S_{2N} = H_{2N} - H_N$. Now write each harmonic number as $d$ plus a logarithm:

$$S_{2N} = \big(d_{2N} + \ln(2N)\big) - \big(d_N + \ln N\big) = d_{2N} - d_N + \ln 2,$$

because $\ln(2N) - \ln N = \ln 2$. As $N \to \infty$, $d_N \to \gamma$ and $d_{2N} \to \gamma$ (every $d_n$ with $n$ beyond some index is within $\varepsilon$ of $\gamma$, and $2N$ passes that index too), so $S_{2N} \to \gamma - \gamma + \ln 2 = \ln 2$. Also $S_{2N+1} = S_{2N} + \tfrac{1}{2N + 1} \to \ln 2$. The even and the odd partial sums both tend to $\ln 2$, so the whole sequence of partial sums does: $\sum (-1)^{n-1}/n = \ln 2$. Module 15 reaches the same value with power series.

```check
Nq = symbols('N', positive=True, integer=True)
same(integrate(1/x - 1/(Nq + 1), (x, Nq, Nq + 1)), log(Nq + 1) - log(Nq) - 1/(Nq + 1))
same(expand_func(harmonic(Nq + 1)), harmonic(Nq) + 1/(Nq + 1))
same((harmonic(Nq) - log(Nq)) - (expand_func(harmonic(Nq + 1)) - log(Nq + 1)), log(Nq + 1) - log(Nq) - 1/(Nq + 1))
holds(all(harmonic(j) - log(j) > harmonic(j + 1) - log(j + 1) > 0 for j in range(1, 80))); same(harmonic(1) - log(1), 1)
limit_is(harmonic(n) - log(n), n, oo, EulerGamma); rounds(EulerGamma, '0.5772')
for Nn in range(1, 30):
    same(altS(2*Nn), harmonic(2*Nn) - harmonic(Nn)); same(2*sum(Rational(1, 2*j) for j in range(1, Nn + 1)), harmonic(Nn))
same(expand_log(log(2*Nq) - log(Nq), force=True), log(2)); limit_is(harmonic(2*n) - harmonic(n), n, oo, log(2))
```
:::
::::

:::: exercise Squares of terms {#ex-14-12} ★★★
- (a) Prove that if $\sum a_n$ converges absolutely, then $\sum a_n^2$ converges.
- (b) Show by an example that (a) can fail when $\sum a_n$ converges only conditionally.
- (c) Prove that if $\sum a_n^2$ and $\sum b_n^2$ both converge, then $\sum a_n b_n$ converges absolutely. (Hint: $\big(\abs{a} - \abs{b}\big)^2 \ge 0$.)

::: solution
**(a)** Since $\sum \abs{a_n}$ converges, its terms tend to 0 (Theorem 14.8). So there is an index $k$ with $\abs{a_n} < 1$ for every $n \ge k$, and for those $n$

$$0 \le a_n^2 = \abs{a_n}\cdot\abs{a_n} \le \abs{a_n}.$$

By the comparison test, $\sum a_n^2$ converges.

**(b)** Take $a_n = \dfrac{(-1)^{n-1}}{\sqrt n}$. The series $\sum a_n$ converges by the alternating series test ($1/\sqrt n$ is positive, decreasing and tends to 0), but only conditionally (Example 14.15). And $a_n^2 = \dfrac1n$: $\sum a_n^2$ is the harmonic series, which diverges.

**(c)** Expanding the hint, $a^2 - 2\abs{a}\,\abs{b} + b^2 \ge 0$, so $\abs{ab} \le \tfrac12\big(a^2 + b^2\big)$ for all numbers $a$ and $b$. The series $\sum \tfrac12\big(a_n^2 + b_n^2\big)$ converges by the sum laws, so $\sum \abs{a_n b_n}$ converges by the comparison test: $\sum a_n b_n$ converges absolutely.

```check
for v in (Rational(-9, 10), Rational(-1, 3), 0, Rational(1, 5), Rational(99, 100)):
    holds(v**2 <= Abs(v))
holds(not (Rational(3, 2)**2 <= Abs(Rational(3, 2))))                # the index k is needed: for |a| > 1, a^2 > |a|
holds(Sum((-1)**(n - 1)/sqrt(n), (n, 1, oo)).is_convergent()); same(((-1)**(nn - 1)/sqrt(nn))**2, 1/nn); holds(not Sum(1/n, (n, 1, oo)).is_convergent())
ar2, br2 = symbols('a b', real=True)
same(expand((Abs(ar2) - Abs(br2))**2), ar2**2 - 2*Abs(ar2)*Abs(br2) + br2**2)
for p_, q_ in ((3, -5), (-2, -7), (Rational(1, 2), 4), (0, 3)):
    holds(Abs(p_*q_) <= (p_**2 + q_**2)/2)
```
:::
::::

## Check yourself {#quiz}

```quiz
? The sequence $a_n = \dfrac{(-1)^n}{n}$
- [ ] diverges, because its terms alternate in sign
- [x] converges to 0
- [ ] converges to 1
- [ ] has no limit, because $(-1)^n$ has none
> $\abs{a_n} = \dfrac1n \to 0$, so $a_n \to 0$ by the squeeze theorem. Alternating signs do not stop a sequence from converging when the size of its terms tends to 0. The product law needs both factors to have limits, so the divergence of $(-1)^n$ says nothing about $(-1)^n/n$.

? $\displaystyle\sum_{n=1}^{\infty}\Big(\frac23\Big)^n$ equals
- [ ] 3
- [ ] $\dfrac23$
- [x] 2
- [ ] nothing: the series diverges
> It is geometric with first term $\tfrac23$ (the term with $n = 1$) and ratio $\tfrac23$, so its sum is $\dfrac{2/3}{1 - 2/3} = 2$. The answer 3 is $\dfrac{1}{1 - 2/3}$, the sum from $n = 0$, which includes the extra term 1. $\tfrac23$ is only the first term, and the series converges because $\abs{r} < 1$.

? If $a_n \to 0$, then the series $\sum a_n$
- [x] may converge or diverge
- [ ] converges
- [ ] diverges
- [ ] converges to 0
> Terms that tend to 0 are needed for convergence but are not enough: $\sum 1/n$ diverges and $\sum 1/n^2$ converges, and both have terms that tend to 0. "Converges to 0" mixes up the terms, which tend to 0, with the partial sums.

? Which of these series converges?
- [ ] $\displaystyle\sum \frac{1}{\sqrt n}$
- [ ] $\displaystyle\sum \frac1n$
- [ ] $\displaystyle\sum n^{-0.9}$
- [x] $\displaystyle\sum n^{-1.1}$
> All four are $p$-series, which converge exactly when $p > 1$. Only $n^{-1.1} = 1/n^{1.1}$ has $p > 1$; the others have $p = \tfrac12$, 1 and 0.9, and diverge although their terms tend to 0.

? For $\sum 1/n^2$, the ratio test
- [ ] gives $\rho = 1$, so the series diverges
- [x] gives $\rho = 1$ and no conclusion; the series converges, as a $p$-series with $p = 2$
- [ ] gives $\rho = 0$, so the series converges
- [ ] gives $\rho = \tfrac12$, so the series converges
> $\dfrac{a_{n+1}}{a_n} = \dfrac{n^2}{(n + 1)^2} \to 1$. With $\rho = 1$ the ratio test says nothing: the harmonic series also has $\rho = 1$ and diverges. The convergence comes from the $p$-series test (or the integral test).

? The partial sum $S_9 = 1 - \tfrac12 + \tfrac13 - \cdots + \tfrac19$ of the alternating harmonic series approximates its sum $\ln 2$ with an error of at most
- [ ] $\dfrac19$
- [ ] $\dfrac{1}{100}$
- [x] $\dfrac{1}{10}$
- [ ] $\dfrac{1}{81}$
> By the alternating series test, $\abs{S - S_N} \le b_{N+1}$, the first term left out: $\tfrac{1}{10}$. $\tfrac19$ is the last term included. The true error, about 0.052, is indeed below $\tfrac{1}{10}$, and $S_9$ lies above $\ln 2$ because the first term left out, $-\tfrac{1}{10}$, is negative.

? The series $\displaystyle\sum_{n=1}^{\infty}\frac{(-1)^n}{\sqrt n}$
- [ ] converges absolutely
- [ ] diverges, because $\sum 1/\sqrt n$ diverges
- [ ] diverges, because its terms alternate in sign
- [x] converges conditionally
> $1/\sqrt n$ is positive, decreasing and tends to 0, so the series converges by the alternating series test. $\sum \abs{a_n} = \sum 1/\sqrt n$ diverges ($p = \tfrac12$), so the convergence is conditional, not absolute. A divergent $\sum \abs{a_n}$ does not make $\sum a_n$ diverge.

? The sequence $a_1 = 0$, $a_{n+1} = \sqrt{6 + a_n}$ is increasing and bounded above by 3, so it converges. Its limit is
- [ ] $-2$
- [x] 3
- [ ] $\sqrt6$
- [ ] 6
> The limit satisfies $L = \sqrt{6 + L}$, so $L^2 - L - 6 = (L - 3)(L + 2) = 0$. A square root is never negative, and $L \ge a_1 = 0$, so $L = 3$. The value $-2$ solves the squared equation but not $L = \sqrt{6 + L}$; $\sqrt6$ is only $a_2$.
```

```check
limit_is(1/n, n, oo, 0)
same(summation(Rational(2, 3)**n, (n, 1, oo)), 2); same(1/(1 - Rational(2, 3)), 3)
holds(not Sum(1/n, (n, 1, oo)).is_convergent()); holds(Sum(1/n**2, (n, 1, oo)).is_convergent())
holds(Sum(n**Rational(-11, 10), (n, 1, oo)).is_convergent()); holds(not Sum(n**Rational(-9, 10), (n, 1, oo)).is_convergent())
limit_is((1/(n + 1)**2)/(1/n**2), n, oo, 1)
S9q = altS(9); holds(Abs(S9q - log(2)) <= Rational(1, 10)); rounds(S9q - log(2), '0.052'); holds(S9q > log(2))
holds(Sum((-1)**n/sqrt(n), (n, 1, oo)).is_convergent()); holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
q8 = [Integer(0)]
for _ in range(10):
    q8.append(sqrt(6 + q8[-1]))
holds(all(q8[j] < q8[j + 1] < 3 for j in range(10))); same(q8[1], sqrt(6))
same_set(solve(Lr**2 - Lr - 6, Lr), [3, -2]); same(solve(Eq(Lr, sqrt(6 + Lr)), Lr), [3])
```
