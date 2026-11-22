---
title: Area and the definite integral
part: 3
lead: Find areas and distances by adding up thin rectangles, and make the idea exact. You will compute Riemann sums by hand and by computer, find areas exactly as limits of sums, define the definite integral, and evaluate and estimate integrals with their properties, with geometry and with symmetry.
minutes: 270
needs: Modules 1 to 8, in particular limits (Module 2), continuity and the Extreme Value Theorem (Module 3) and velocity (Module 4)
goals:
  - Write sums in sigma notation, and prove and use the formulas for $1 + 2 + \dots + n$ and for the sums of the squares and of the cubes of $1, 2, \dots, n$
  - Compute left, right and midpoint Riemann sums, and estimate a distance from speed readings
  - Define the definite integral, and find integrals exactly as limits of Riemann sums
  - Interpret an integral as a signed area, and evaluate integrals with geometry and symmetry
  - Use the properties of the integral to combine, compare and bound integrals
  - Find the average value of a function, and use the Mean Value Theorem for integrals
---

## Areas and distances {#area-distance}

Module 1 posed two problems ([Section 1.1](module_01_EN.html#two-problems)). The tangent problem asked for the slope of a curve at a point, and Part II solved it with the derivative. The area problem asked for the area under a curve, and Figure 1.1 suggested a way in: fill the region with thin rectangles, add up their areas, and see what number the totals approach as the rectangles get thinner. This module carries out that plan. Its answer is the **definite integral**, the second great idea of calculus.

### The area problem {#area-problem}

You know the area of a rectangle (width times height) and of a triangle (half the base times the height), and every polygon can be cut into triangles. A region with a curved side is different: no cutting turns it into triangles. Take the simplest example, the region under the parabola $y = x^2$ from $x = 0$ to $x = 1$, enclosed by the curve, the $x$-axis and the line $x = 1$. Call its area $A$.

You cannot compute $A$ yet, but you can trap it. The idea is old: Archimedes, in the 3rd century BC, found areas with the method of exhaustion, filling a region more and more completely with simpler shapes, an ancestor of the sums in this module. Cut $[0, 1]$ into four strips of width $\tfrac14$. The curve rises across each strip, so a rectangle as tall as the curve at the strip's left end fits under the curve, and a rectangle as tall as the curve at its right end covers the strip's part of the region (Figure 9.1, left).

::: example Trapping an area between two sums
Find a lower and an upper estimate of the area $A$ under $y = x^2$ from 0 to 1, with four strips.

The strips are $\big[0, \tfrac14\big]$, $\big[\tfrac14, \tfrac12\big]$, $\big[\tfrac12, \tfrac34\big]$ and $\big[\tfrac34, 1\big]$, each of width $\tfrac14$. At their left ends the curve has the heights $0^2$, $\big(\tfrac14\big)^2$, $\big(\tfrac12\big)^2$ and $\big(\tfrac34\big)^2$, that is, $0$, $\tfrac{1}{16}$, $\tfrac{4}{16}$ and $\tfrac{9}{16}$. So the rectangles under the curve have the total area

$$\begin{aligned} &\frac14\Big(0 + \frac{1}{16} + \frac{4}{16} + \frac{9}{16}\Big) \\ &\quad= \frac{14}{64} = 0.21875. \end{aligned}$$

At the right ends the heights are $\tfrac{1}{16}$, $\tfrac{4}{16}$, $\tfrac{9}{16}$ and $1$, so the covering rectangles have the total area

$$\begin{aligned} &\frac14\Big(\frac{1}{16} + \frac{4}{16} + \frac{9}{16} + \frac{16}{16}\Big) \\ &\quad= \frac{30}{64} = 0.46875. \end{aligned}$$

The region contains the first four rectangles and lies inside the second four, so

$$0.21875 < A < 0.46875.$$

The two totals differ by $0.25$. Each height except the first and the last appears in both totals, so the difference is $\tfrac14\big(1 - 0\big)$: the strip width times the difference between the heights at the two ends of $[0, 1]$.

```check
f91 = lambda X: sympify(X)**2
lo = Rational(1, 4)*sum(f91(Rational(k, 4)) for k in range(4))
hi = Rational(1, 4)*sum(f91(Rational(k, 4)) for k in range(1, 5))
same([f91(Rational(k, 4)) for k in range(4)], [0, Rational(1, 16), Rational(4, 16), Rational(9, 16)])
steps(lo, Rational(14, 64), Rational(21875, 100000)); steps(hi, Rational(30, 64), Rational(46875, 100000))
same(hi - lo, Rational(1, 4)); same(Rational(1, 4)*(f91(1) - f91(0)), Rational(1, 4))
holds(lo < Rational(1, 3)); holds(Rational(1, 3) < hi)
```
:::

Four strips leave a wide gap, but thinner strips close it. With 100 strips the two totals are 0.32835 and 0.33835 (Section 9.3 computes them), and the gap is only $\tfrac{1}{100}$. They close in on $\tfrac13$, and Section 9.3 proves that $A = \tfrac13$.

```check
L100 = Rational(1, 100)*sum(Rational(k, 100)**2 for k in range(100))
R100 = Rational(1, 100)*sum(Rational(k, 100)**2 for k in range(1, 101))
same(L100, Rational(32835, 10**5)); same(R100, Rational(33835, 10**5)); same(R100 - L100, Rational(1, 100))
```

### The distance problem {#distance-problem}

A car that drives at a constant 20 m/s for 10 seconds covers $20 \times 10 = 200$ metres. On a graph of speed against time, the speed is a horizontal line at height 20, and the distance is the area of the rectangle under it: width 10 seconds, height 20 metres per second. The units multiply as well, seconds times metres per second giving metres.

When the speed changes, the area under the speed graph is still the distance. The falling ball of Module 1 has the speed $v(t) = 9.8t$ m/s after $t$ seconds ([Section 4.1](module_04_EN.html#tangents)). Its speed graph is a straight line through the origin, so the region under it from time 0 to time $t$ is a triangle with base $t$ and height $9.8t$, of area

$$\frac12 \cdot t \cdot 9.8t = 4.9t^2.$$

That is exactly the distance $s(t) = 4.9t^2$ that the ball has fallen ([Section 1.3](module_01_EN.html#functions)). This is no coincidence: Section 9.4 explains why, and Module 10 proves it.

```check
same(Rational(1, 2)*t*Rational(98, 10)*t, Rational(49, 10)*t**2)
same(diff(Rational(49, 10)*t**2, t), Rational(98, 10)*t)
```

Usually there is no formula for the speed, only readings.

::: example Distance from a speedometer
Suppose a passenger reads a car's speedometer every 2 seconds as the car speeds up from rest, and converts the readings to metres per second. The numbers are made up:

| Time $t$ (s) | Speed $v$ (m/s) |
|---|---|
| 0 | 0 |
| 2 | 6 |
| 4 | 11 |
| 6 | 15 |
| 8 | 18 |
| 10 | 20 |

Estimate the distance the car covers in these 10 seconds.

The car speeds up throughout, so during each 2-second interval its speed lies between the reading at the start of the interval and the reading at the end. At speeds between $m$ and $M$ for $\Delta t$ seconds, a car covers between $m\,\Delta t$ and $M\,\Delta t$ metres. (The [Mean Value Theorem](module_08_EN.html#mvt) of Module 8 makes this precise: the distance covered from $t_1$ to $t_2$ is $v(c)(t_2 - t_1)$ for some time $c$ in between.) Adding up over the five intervals, the distance is at least

$$\begin{aligned} &2(0 + 6 + 11 + 15 + 18) \\ &\quad= 2 \times 50 = 100 \text{ m} \end{aligned}$$

and at most

$$\begin{aligned} &2(6 + 11 + 15 + 18 + 20) \\ &\quad= 2 \times 70 = 140 \text{ m}. \end{aligned}$$

So the car covers between 100 and 140 metres. The average of the two, 120 m, is a reasonable single estimate; Module 11 studies it under the name of the trapezoidal rule.

The two estimates differ by 40 m. The readings at 2, 4, 6 and 8 seconds appear in both sums, so the difference is $2 \times (20 - 0)$: the time step times the change in speed from the first reading to the last. Reading the speedometer every second would halve the gap, to 20 m.

```check
V92 = [0, 6, 11, 15, 18, 20]
lo92 = 2*sum(V92[:5]); hi92 = 2*sum(V92[1:])
same(sum(V92[:5]), 50); same(lo92, 100); same(sum(V92[1:]), 70); same(hi92, 140)
same((lo92 + hi92)/2, 120); same(hi92 - lo92, 40); same(2*(V92[-1] - V92[0]), 40); same(1*(V92[-1] - V92[0]), 20)
```
:::

::: figure id=fig-09-1
The two problems are one. Left: the area under $y = x^2$ from 0 to 1 lies between the total of the blue rectangles, 0.21875, and the total of the orange ones, 0.46875 (Example 9.1). Right: the speed readings of Example 9.2 (dots); the distance covered lies between the blue total, 100 m, and the orange total, 140 m.
:::

::: keyidea
The area problem and the distance problem are the same problem. Cut the interval into short pieces; on each piece, replace the changing height (or speed) by a constant one; add up the areas of the rectangles, height times width (or speed times time); then let the pieces shrink. The totals approach the exact answer. The rest of this module turns these steps into a definition, the definite integral, and into ways to compute it.
:::

::: pitfall
The readings at the left ends give the lower estimate only because the speed increases. For a car that slows down, they give the upper estimate (Exercise 9.3). For a speed that rises and then falls, neither sum need be a lower or an upper estimate (Exercise 9.9).
:::

## Sigma notation {#sigma}

The sums of Section 9.1 had four or five terms. Thinner strips give longer sums, of a thousand terms, or of $n$ terms for an unknown $n$. They need a compact notation.

::: definition Sigma notation
For whole numbers $m \le n$ and numbers $a_m, a_{m+1}, \dots, a_n$,

$$\sum_{i=m}^{n} a_i = a_m + a_{m+1} + \dots + a_n.$$

The symbol $\sum$ is the Greek capital sigma, for "sum", and the left side reads "the sum of $a_i$ for $i$ from $m$ to $n$". The letter $i$ is the **index of summation**, and $m$ and $n$ are the **lower and upper limits** of the sum.
:::

The index runs through the whole numbers $m, m + 1, \dots, n$, and each value gives one term, so there are $n - m + 1$ terms. (The word "limit" here means an end of the range, not a limit in the sense of Module 2.) For example,

$$\begin{aligned} \sum_{i=1}^{5} i^2 &= 1 + 4 + 9 + 16 + 25 = 55, \\[5pt] \sum_{k=0}^{3} 2^k &= 1 + 2 + 4 + 8 = 15, \\[5pt] \sum_{i=1}^{4} \frac{1}{i} &= 1 + \frac12 + \frac13 + \frac14 = \frac{25}{12}. \end{aligned}$$

The index is a **dummy variable**: its name does not matter, so $\sum_{i=1}^{5} i^2$ and $\sum_{k=1}^{5} k^2$ are the same number, 55, and neither depends on $i$ or $k$. To go the other way, from a sum to sigma notation, find a formula for the term with index $i$. The odd numbers $1, 3, 5, \dots$ are $2i - 1$ for $i = 1, 2, 3, \dots$, and $2i - 1 = 99$ at $i = 50$, so

$$1 + 3 + 5 + \dots + 99 = \sum_{i=1}^{50} (2i - 1).$$

If $v_i$ is the speed reading of Example 9.2 at time $t = 2i$, the two estimates there are $\sum_{i=0}^{4} 2v_i = 100$ and $\sum_{i=1}^{5} 2v_i = 140$.

```check
i = symbols('i', integer=True)
same(summation(i**2, (i, 1, 5)), 55); same(1 + 4 + 9 + 16 + 25, 55)
same(summation(2**k, (k, 0, 3)), 15); same(summation(1/i, (i, 1, 4)), Rational(25, 12))
same(summation(k**2, (k, 1, 5)), summation(i**2, (i, 1, 5)))
same(solve(2*x - 1 - 99, x), [50]); same(summation(2*i - 1, (i, 1, 50)), sum(range(1, 100, 2)))
same(sum(2*V92[j] for j in range(0, 5)), 100); same(sum(2*V92[j] for j in range(1, 6)), 140)
```

::: theorem Rules for sums
For numbers $a_i$ and $b_i$, a constant $c$ and whole numbers $m \le n$ (with $n \ge 1$ in the third rule),

$$\begin{aligned} \sum_{i=m}^{n} c\,a_i &= c\sum_{i=m}^{n} a_i, \\[5pt] \sum_{i=m}^{n} \big(a_i + b_i\big) &= \sum_{i=m}^{n} a_i + \sum_{i=m}^{n} b_i, \\[5pt] \sum_{i=1}^{n} c &= nc. \end{aligned}$$

The second rule also holds with $-$ in place of $+$.
:::

::: proof
Write the sums out. The first rule is the distributive law: $ca_m + \dots + ca_n = c(a_m + \dots + a_n)$. The second regroups the terms, which addition allows: $(a_m + b_m) + \dots + (a_n + b_n) = (a_m + \dots + a_n) + (b_m + \dots + b_n)$. In the third, the term $c$ does not depend on $i$, so the sum is $c + c + \dots + c$ with $n$ terms, which is $nc$. The rule with $-$ follows from the first two, with $c = -1$.
:::

```check
Aseq, Bseq = IndexedBase('A'), IndexedBase('B')
for N_ in range(1, 6):
    same(Sum(c*Aseq[i], (i, 1, N_)).doit(), c*Sum(Aseq[i], (i, 1, N_)).doit())
    same(Sum(Aseq[i] + Bseq[i], (i, 1, N_)).doit(), Sum(Aseq[i], (i, 1, N_)).doit() + Sum(Bseq[i], (i, 1, N_)).doit())
    same(Sum(Aseq[i] - Bseq[i], (i, 1, N_)).doit(), Sum(Aseq[i], (i, 1, N_)).doit() - Sum(Bseq[i], (i, 1, N_)).doit())
same(summation(c, (i, 1, n)), n*c)
```

::: pitfall
Sums do not multiply term by term: $\sum a_i b_i$ is not $\big(\sum a_i\big)\big(\sum b_i\big)$. With $a_i = b_i = i$ and $n = 2$, $\sum_{i=1}^{2} i \cdot i = 1 + 4 = 5$, while $(1 + 2)(1 + 2) = 9$. Nor do sums divide term by term, or go under square roots. And a constant summed $n$ times is $nc$, not $c$: $\sum_{i=1}^{10} 3 = 30$.

```check
same(summation(i*i, (i, 1, 2)), 5); same(summation(i, (i, 1, 2))**2, 9); same(summation(3, (i, 1, 10)), 30)
```
:::

### Sums of powers {#power-sums}

The Riemann sums of $x$, $x^2$ and $x^3$ (Sections 9.3 and 9.4, and Exercise 9.5) lead to the sum of the whole numbers from 1 to $n$, and to the sums of their squares and of their cubes. Each has a closed form.

::: theorem Sums of powers
For every whole number $n \ge 1$, the sums of the whole numbers from 1 to $n$, of their squares and of their cubes are

$$\begin{aligned} \sum_{i=1}^{n} i &= \frac{n(n + 1)}{2}, \\[5pt] \sum_{i=1}^{n} i^2 &= \frac{n(n + 1)(2n + 1)}{6}, \\[5pt] \sum_{i=1}^{n} i^3 &= \left(\frac{n(n + 1)}{2}\right)^2. \end{aligned}$$
:::

The three proofs below use three different ideas, each worth knowing.

::: proof of the sum of the whole numbers from 1 to $n$
This is the pairing argument usually named after Gauss. Write the sum $S = 1 + 2 + \dots + n$ forwards and backwards, and add the two lines column by column:

$$\begin{aligned} S &= 1 + 2 + \dots + n, \\ S &= n + (n - 1) + \dots + 1, \\ 2S &= (n + 1) + \dots + (n + 1). \end{aligned}$$

In each column the two numbers add up to $n + 1$, because as one goes up by 1 the other goes down by 1; and there are $n$ columns. So $2S = n(n + 1)$, and $S = \dfrac{n(n + 1)}{2}$.
:::

::: proof of the sum of the squares
Expanding $(i + 1)^3 = i^3 + 3i^2 + 3i + 1$ gives, for every $i$,

$$(i + 1)^3 - i^3 = 3i^2 + 3i + 1.$$

Add these equations for $i = 1, 2, \dots, n$. On the left almost everything cancels:

$$\begin{aligned} &\sum_{i=1}^{n}\big[(i + 1)^3 - i^3\big] \\[5pt] &\quad= (2^3 - 1^3) + (3^3 - 2^3) + \dots \\[5pt] &\qquad + \big((n + 1)^3 - n^3\big) \\[5pt] &\quad= (n + 1)^3 - 1, \end{aligned}$$

because every cube except $(n + 1)^3$ and $1^3$ appears once with a plus sign and once with a minus sign. A sum that collapses like this, like a folding telescope, is called **telescoping**. On the right, with $S = \sum_{i=1}^{n} i^2$, the rules for sums and the first formula give

$$\begin{aligned} &\sum_{i=1}^{n}\big(3i^2 + 3i + 1\big) \\[5pt] &\quad= 3S + \frac{3n(n + 1)}{2} + n. \end{aligned}$$

So $3S = (n + 1)^3 - 1 - n - \tfrac{3n(n + 1)}{2}$. Since $-1 - n = -(n + 1)$, every term on the right contains the factor $n + 1$; take it out and simplify:

$$\begin{aligned} 3S &= (n + 1)\Big[(n + 1)^2 - 1 - \frac{3n}{2}\Big] \\ &= (n + 1)\Big(n^2 + \frac{n}{2}\Big) \\ &= \frac{n(n + 1)(2n + 1)}{2}. \end{aligned}$$

Dividing by 3 gives the second formula.
:::

The third proof uses **mathematical induction**, the method that [Exercise 5.10](module_05_EN.html#ex-5-10) used to prove the power rule. It proves a statement $P(n)$ for every whole number $n \ge 1$ in two steps:

- the **base case**: $P(1)$ is true;
- the **inductive step**: for every $k \ge 1$, if $P(k)$ is true, then $P(k + 1)$ is true.

Then $P(1)$ is true; so is $P(2)$, by the inductive step with $k = 1$; so is $P(3)$, with $k = 2$; and so on, like a row of dominoes in which each one knocks over the next.

::: proof of the sum of the cubes
Let $P(n)$ be the statement $\sum_{i=1}^{n} i^3 = \dfrac{n^2(n + 1)^2}{4}$. For the base case, both sides are 1 when $n = 1$. For the inductive step, suppose that $P(k)$ is true for some $k \ge 1$. The sum up to $k + 1$ is the sum up to $k$ plus one more term, so, taking out the common factor $(k + 1)^2$,

$$\begin{aligned} \sum_{i=1}^{k+1} i^3 &= \frac{k^2(k + 1)^2}{4} + (k + 1)^3 \\[5pt] &= \frac{(k + 1)^2\big(k^2 + 4k + 4\big)}{4} \\[5pt] &= \frac{(k + 1)^2(k + 2)^2}{4}. \end{aligned}$$

That is $P(k + 1)$: the formula with $k + 1$ in place of $n$. By induction, $P(n)$ is true for every ${n \ge 1}$.
:::

```check
S1 = n*(n + 1)/2; S2 = n*(n + 1)*(2*n + 1)/6; S3 = (n*(n + 1)/2)**2
same(summation(i, (i, 1, n)), S1); same(summation(i**2, (i, 1, n)), S2); same(summation(i**3, (i, 1, n)), S3)
same(2*S1, n*(n + 1))                                                   # the pairing: n columns of n + 1
same(expand((i + 1)**3 - i**3), 3*i**2 + 3*i + 1)
same(summation((i + 1)**3 - i**3, (i, 1, n)), (n + 1)**3 - 1)
same(summation(3*i**2 + 3*i + 1, (i, 1, n)), 3*S2 + 3*n*(n + 1)/2 + n)
steps((n + 1)**3 - 1 - n - 3*n*(n + 1)/2, (n + 1)*((n + 1)**2 - 1 - 3*n/2), (n + 1)*(n**2 + n/2), n*(n + 1)*(2*n + 1)/2)
same(S3.subs(n, 1), 1)
steps(k**2*(k + 1)**2/4 + (k + 1)**3, (k + 1)**2*(k**2 + 4*k + 4)/4, (k + 1)**2*(k + 2)**2/4, S3.subs(n, k + 1))
```

The third formula says that $1^3 + 2^3 + \dots + n^3 = (1 + 2 + \dots + n)^2$: the sum of the cubes is the square of the sum.

::: example Sums by formula
Find:

- (a) $\sum_{i=1}^{100} i$
- (b) $\sum_{i=1}^{n} (2i - 1)$, the sum of the first $n$ odd numbers
- (c) $\sum_{i=1}^{10} \big(3i^2 - 4i\big)$
- (d) $\sum_{i=1}^{20} i^3$

**(a)** With $n = 100$: $\dfrac{100 \cdot 101}{2} = 5050$.

**(b)** By the rules for sums and the first formula,

$$\begin{aligned} \sum_{i=1}^{n} (2i - 1) &= 2\sum_{i=1}^{n} i - \sum_{i=1}^{n} 1 \\[5pt] &= n(n + 1) - n = n^2. \end{aligned}$$

The sum of the first $n$ odd numbers is $n^2$: $1 + 3 = 4$, $1 + 3 + 5 = 9$, and so on. With $n = 50$, $1 + 3 + \dots + 99 = 2500$.

**(c)** By the formulas with $n = 10$, $\sum_{i=1}^{10} i^2 = \dfrac{10 \cdot 11 \cdot 21}{6} = 385$ and $\sum_{i=1}^{10} i = 55$. So the sum is $3 \cdot 385 - 4 \cdot 55 = 935$.

**(d)** $\Big(\dfrac{20 \cdot 21}{2}\Big)^2 = 210^2 = 44{,}100$.

```check
same(summation(i, (i, 1, 100)), 5050); same(Rational(100*101, 2), 5050)
steps(Sum(2*i - 1, (i, 1, n)), 2*Sum(i, (i, 1, n)) - Sum(1, (i, 1, n)), n*(n + 1) - n, n**2)
same(1 + 3, 4); same(1 + 3 + 5, 9); same(summation(2*i - 1, (i, 1, 50)), 2500)
same(Rational(10*11*21, 6), 385); same(summation(i**2, (i, 1, 10)), 385); same(summation(i, (i, 1, 10)), 55)
steps(summation(3*i**2 - 4*i, (i, 1, 10)), 3*385 - 4*55, 1155 - 220, 935)
steps(summation(i**3, (i, 1, 20)), Rational(20*21, 2)**2, 210**2, 44100)
```
:::

::: compute Sums with Python and SymPy
Python's built-in `sum` adds up the numbers it is given, and `range(1, n + 1)` gives the whole numbers from 1 to $n$:

```python
print(sum(range(1, 101)))                # 1 + 2 + ... + 100
print(sum(i**2 for i in range(1, 11)))   # 1 + 4 + ... + 100
print(sum(range(1, 100)))                # stops at 99
```

```output
5050
385
4950
```

`range(a, b)` stops before `b`, so the third line leaves out 100: a classic off-by-one slip. SymPy's `summation` finds sums whose upper limit is a symbol. Declaring the symbols as positive integers tells it what kind of numbers $i$ and $n$ are:

```python
import sympy as sp
i, n = sp.symbols('i n', integer=True, positive=True)
S2 = sp.summation(i**2, (i, 1, n))
print(S2)
print(sp.factor(S2))
print(sp.factor(sp.summation(i**3, (i, 1, n))))
print(sp.summation(2*i - 1, (i, 1, n)))
```

```output
n**3/3 + n**2/2 + n/6
n*(n + 1)*(2*n + 1)/6
n**2*(n + 1)**2/4
n**2
```

SymPy returns the sum of the squares expanded; `factor` turns it into the form of Theorem 9.2.
:::

## Riemann sums {#riemann-sums}

Here are the sums of Section 9.1 in general. Let $f$ be defined on $[a, b]$, and cut $[a, b]$ into $n$ subintervals of equal width

$$\Delta x = \frac{b - a}{n},$$

read "delta x". The cut points are $x_i = a + i\,\Delta x$ for $i = 0, 1, \dots, n$, so that $x_0 = a$ and $x_n = b$, and the $i$th subinterval is $[x_{i-1}, x_i]$. On each subinterval, take a height: the value of $f$ at its left end $x_{i-1}$, at its right end $x_i$, or at its midpoint

$$m_i = \frac{x_{i-1} + x_i}{2} = a + \Big(i - \frac12\Big)\Delta x.$$

::: definition Left, right and midpoint sums
With this notation, the **left sum**, the **right sum** and the **midpoint sum** of $f$ on $[a, b]$ with $n$ subintervals are

$$\begin{aligned} L_n &= \sum_{i=1}^{n} f(x_{i-1})\,\Delta x, \\[5pt] R_n &= \sum_{i=1}^{n} f(x_i)\,\Delta x, \\[5pt] M_n &= \sum_{i=1}^{n} f(m_i)\,\Delta x. \end{aligned}$$

They are examples of **Riemann sums**, named after Riemann, who defined the integral of Section 9.4 in 1854 (it was published in 1868).
:::

Where $f$ is positive, each term is the area of a rectangle of width $\Delta x$; where $f$ is negative, the term is negative, and Section 9.4 explains what such terms count. In Example 9.1 the two totals were $L_4 = 0.21875$ and $R_4 = 0.46875$ for $f(x) = x^2$ on $[0, 1]$. For a positive increasing function, $L_n$ is always a lower estimate of the area and $R_n$ an upper one; for a positive decreasing function it is the other way round.

```check
x9 = symbols('x9')
def Lsum(f_, a_, b_, N_):
    d_ = (sympify(b_) - a_)/N_
    return sum(f_.subs(x9, a_ + j*d_) for j in range(N_))*d_
def Rsum(f_, a_, b_, N_):
    d_ = (sympify(b_) - a_)/N_
    return sum(f_.subs(x9, a_ + j*d_) for j in range(1, N_ + 1))*d_
def Msum(f_, a_, b_, N_):
    d_ = (sympify(b_) - a_)/N_
    return sum(f_.subs(x9, a_ + (j + Rational(1, 2))*d_) for j in range(N_))*d_
same(Lsum(x9**2, 0, 1, 4), Rational(21875, 100000)); same(Rsum(x9**2, 0, 1, 4), Rational(46875, 100000))
```

::: example Three sums for $1/x$
Find $L_4$, $R_4$ and $M_4$ for $f(x) = 1/x$ on $[1, 2]$, to four decimal places, and say what they tell you about the area under the graph.

Here $\Delta x = \tfrac{2 - 1}{4} = \tfrac14$. The cut points are $1$, $\tfrac54$, $\tfrac32$, $\tfrac74$ and $2$, where $f$ takes the values $1$, $\tfrac45$, $\tfrac23$, $\tfrac47$ and $\tfrac12$. So

$$\begin{aligned} L_4 &= \frac14\Big(1 + \frac45 + \frac23 + \frac47\Big) \\ &= \frac{319}{420} \approx 0.7595, \\ R_4 &= \frac14\Big(\frac45 + \frac23 + \frac47 + \frac12\Big) \\ &= \frac{533}{840} \approx 0.6345. \end{aligned}$$

The midpoints are $\tfrac98$, $\tfrac{11}{8}$, $\tfrac{13}{8}$ and $\tfrac{15}{8}$, where $f$ takes the values $\tfrac89$, $\tfrac{8}{11}$, $\tfrac{8}{13}$ and $\tfrac{8}{15}$:

$$\begin{aligned} M_4 &= \frac14\Big(\frac89 + \frac{8}{11} + \frac{8}{13} + \frac{8}{15}\Big) \\ &\approx 0.6912. \end{aligned}$$

Since $1/x$ decreases on $[1, 2]$, on each subinterval its value at the left end is its largest and its value at the right end its smallest. So the left rectangles cover the region and the right rectangles fit inside it (Figure 9.2): the area $A$ lies between $R_4 \approx 0.6345$ and $L_4 \approx 0.7595$. The midpoint sum lies between the two, since each midpoint height lies between the heights at the ends of its subinterval. It is also much closer to $A$: each midpoint rectangle falls short of the graph over the left half of its subinterval and sticks out above it over the right half, and the two errors nearly cancel. Module 10 shows that $A = \ln 2 \approx 0.693147$, so $M_4$ is already within 0.002 of it.

```check
fx94 = 1/x9
same([fx94.subs(x9, v_) for v_ in (1, Rational(5, 4), Rational(3, 2), Rational(7, 4), 2)], [1, Rational(4, 5), Rational(2, 3), Rational(4, 7), Rational(1, 2)])
L94, R94, M94 = Lsum(fx94, 1, 2, 4), Rsum(fx94, 1, 2, 4), Msum(fx94, 1, 2, 4)
steps(L94, Rational(1, 4)*(1 + Rational(4, 5) + Rational(2, 3) + Rational(4, 7)), Rational(319, 420)); rounds(L94, '0.7595')
steps(R94, Rational(1, 4)*(Rational(4, 5) + Rational(2, 3) + Rational(4, 7) + Rational(1, 2)), Rational(533, 840)); rounds(R94, '0.6345')
same([fx94.subs(x9, v_) for v_ in (Rational(9, 8), Rational(11, 8), Rational(13, 8), Rational(15, 8))], [Rational(8, 9), Rational(8, 11), Rational(8, 13), Rational(8, 15)])
same(M94, Rational(1, 4)*(Rational(8, 9) + Rational(8, 11) + Rational(8, 13) + Rational(8, 15))); rounds(M94, '0.6912')
holds(R94 < M94); holds(M94 < L94)
for j in range(4):                                  # each midpoint height lies between the heights at the two ends
    holds(fx94.subs(x9, 1 + Rational(j + 1, 4)) < fx94.subs(x9, 1 + Rational(2*j + 1, 8))); holds(fx94.subs(x9, 1 + Rational(2*j + 1, 8)) < fx94.subs(x9, 1 + Rational(j, 4)))
same(integrate(1/x, (x, 1, 2)), log(2)); rounds(log(2), '0.693147'); holds(Abs(M94 - log(2)) < Rational(2, 1000))
holds(R94 < log(2)); holds(log(2) < L94)
```
:::

::: figure id=fig-09-2
Left, right and midpoint sums for $f(x) = 1/x$ on $[1, 2]$ with $n = 4$ (Example 9.4); the dots mark the points where the heights are taken. Since $1/x$ decreases, the left rectangles stick out above the graph and the right ones stay below it; the midpoint rectangles fall short of the graph over the left half of each subinterval and stick out above it over the right half.
:::

How do the sums approach the area as $n$ grows? Here are the three sums for $f(x) = x^2$ on $[0, 1]$:

```valuetable
n = 4, 10, 100
$L_n$ = Sum((i/n)**2, (i, 0, n - 1))/n
$R_n$ = Sum((i/n)**2, (i, 1, n))/n
$M_n$ = Sum(((i - 1/2)/n)**2, (i, 1, n))/n
digits = 8
---
n | L_n | R_n | M_n
4 | 0.21875 | 0.46875 | 0.328125
10 | 0.285 | 0.385 | 0.3325
100 | 0.32835 | 0.33835 | 0.333325
```

All three close in on $\tfrac13 = 0.3333\ldots$: the left sums from below and the right sums from above, as for any increasing function, and the midpoint sums much faster than either. The **error** of an approximation is the exact value minus the approximation: positive when the approximation is too small, negative when it is too large. The errors show how fast:

```valuetable
n = 10, 20, 40, 80
$\tfrac13 - R_n$ = 1/3 - Sum((i/n)**2, (i, 1, n))/n
$\tfrac13 - M_n$ = 1/3 - Sum(((i - 1/2)/n)**2, (i, 1, n))/n
decimals = 8
---
n | \tfrac13 - R_n | \tfrac13 - M_n
10 | -0.05166667 | 0.00083333
20 | -0.02541667 | 0.00020833
40 | -0.01260417 | 0.00005208
80 | -0.00627604 | 0.00001302
```

Each time $n$ doubles, the error of $R_n$ is roughly halved, and so is that of $L_n$, which is almost the same size with the opposite sign; the error of $M_n$ is divided by exactly 4. The exact formulas found below explain this: the error of $R_n$ is about $-\tfrac{1}{2n}$, and that of $M_n$ is exactly $\tfrac{1}{12n^2}$. So a thousand times more rectangles make the left and right sums about a thousand times more accurate, but the midpoint sum a million times. Module 11 explains why, and builds the midpoint sum, the trapezoidal rule and Simpson's rule into practical methods of numerical integration.

```check
LL = lambda N_: Lsum(x9**2, 0, 1, N_); RR = lambda N_: Rsum(x9**2, 0, 1, N_); MM = lambda N_: Msum(x9**2, 0, 1, N_)
for N_ in (10, 20, 40):
    holds(1.8 < (LL(N_) - Rational(1, 3))/(LL(2*N_) - Rational(1, 3)) < 2)
    holds(2 < (RR(N_) - Rational(1, 3))/(RR(2*N_) - Rational(1, 3)) < 2.1)
    same((MM(N_) - Rational(1, 3))/(MM(2*N_) - Rational(1, 3)), 4)
for N_ in (4, 10, 100):
    same(Rational(1, 3) - RR(N_), -Rational(1, 2*N_) - Rational(1, 6*N_**2)); same(Rational(1, 3) - MM(N_), Rational(1, 12*N_**2))
    same(Rational(1, 3) - LL(N_), Rational(1, 2*N_) - Rational(1, 6*N_**2))   # the same size as the error of R_n, opposite sign
eR_ = lambda N_: -Rational(1, 2*N_) - Rational(1, 6*N_**2); eM_ = lambda N_: Rational(1, 12*N_**2)
for N_ in (10, 100):                                # 1000 times as many rectangles: errors / 1000 and / 1000000
    holds(1000 < eR_(N_)/eR_(1000*N_) < 1040); same(eM_(N_)/eM_(1000*N_), 10**6)
holds(LL(10) < LL(100)); holds(LL(100) < Rational(1, 3)); holds(Rational(1, 3) < RR(100)); holds(RR(100) < RR(10))
```

::: compute Riemann sums in Python
A short function computes all three sums. It takes the heights at $a + (i + \text{shift})\,\Delta x$ for $i = 0, 1, \dots, n - 1$, with the shift 0 for the left ends, 1 for the right ends and $\tfrac12$ for the midpoints:

```python
def riemann(f, a, b, n, rule):
    dx = (b - a)/n
    shift = {'left': 0, 'right': 1, 'mid': 0.5}[rule]
    return sum(f(a + (i + shift)*dx) for i in range(n))*dx

def f(x):
    return 1/x

for rule in ['left', 'right', 'mid']:
    print(rule, riemann(f, 1, 2, 4, rule))
```

```output
left 0.7595238095238095
right 0.6345238095238095
mid 0.6912198912198912
```

These are the three sums of Example 9.4. Now the errors of the midpoint sums, measured against $\ln 2$, the area that Module 10 will find:

```python
import math
prev = None
for n in [10, 20, 40, 80]:
    err = math.log(2) - riemann(f, 1, 2, n, 'mid')
    note = '' if prev is None else f'   previous/this = {prev/err:.3f}'
    print(f'n = {n:2d}   error = {err:.3e}{note}')
    prev = err
```

```output
n = 10   error = 3.118e-04
n = 20   error = 7.808e-05   previous/this = 3.993
n = 40   error = 1.953e-05   previous/this = 3.998
n = 80   error = 4.883e-06   previous/this = 4.000
```

The errors are positive: the midpoint sums of $1/x$ are a little too small. Each doubling of $n$ divides the error by almost exactly 4, as for $x^2$.
:::

::: widget name=riemann-sums
Start with $f(x) = x^2$ on $[0, 1]$, the left rule and $n = 4$: you see the rectangles of Example 9.1 and $L_4 = 0.21875$. Switch to the right rule and to the midpoint rule, and compare with the first table above. Press **Double n** a few times and watch the table of errors: for the left and right rules each doubling roughly halves the error, for the midpoint rule it divides the error by about 4. Then choose $1/x$, for Example 9.4, and $\sin x$ on $[0, \pi]$, where the area is 2 (Module 10 proves it). There the left and right sums are equal, because $\sin 0 = \sin \pi$, and each doubling divides their error by about 4: Module 11 shows why. Type `pi` and `2pi` as the ends of the interval for $\sin x$, and the rectangles hang below the axis: Section 9.4 explains what they count. The trapezoid and Simpson rules belong to Module 11.
:::

```check
for N_ in (4, 8):                                   # the caption: for sin x on [0, pi] the left and right sums are equal
    same(Lsum(sin(x9), 0, pi, N_), Rsum(sin(x9), 0, pi, N_))
eS_ = [N(2 - Lsum(sin(x9), 0, pi, N_), 30) for N_ in (4, 8, 16)]
holds(3.9 < eS_[0]/eS_[1] < 4.1); holds(3.9 < eS_[1]/eS_[2] < 4.1)      # each doubling divides the error by about 4
holds(1.9 < (Rational(1, 3) - LL(4))/(Rational(1, 3) - LL(8)) < 2.1)   # x^2: the left error roughly halves
```

::: pitfall
Three slips with Riemann sums. First, $\Delta x$ is $\tfrac{b - a}{n}$, not $\tfrac1n$: on $[1, 3]$ with $n = 4$, $\Delta x = 0.5$. Second, $n$ subintervals have $n + 1$ cut points $x_0, \dots, x_n$; the left sum uses the first $n$ of them and the right sum the last $n$, so each sum has $n$ terms, not $n + 1$. Third, the midpoints are the middles of the subintervals, not of $[a, b]$: $M_4$ on $[1, 2]$ takes its heights at $\tfrac98$, $\tfrac{11}{8}$, $\tfrac{13}{8}$ and $\tfrac{15}{8}$.
:::

### Exact areas as limits {#exact-limits}

The table suggests that the area under $y = x^2$ from 0 to 1 is $\tfrac13$. The formula for the sum of the squares turns the suggestion into a proof.

::: example The area under $y = x^2$
Show that the area $A$ under $y = x^2$ from 0 to 1 is exactly $\tfrac13$.

Here $\Delta x = \tfrac1n$ and $x_i = \tfrac{i}{n}$, so $f(x_i) = \tfrac{i^2}{n^2}$. The factor $\tfrac{1}{n^3}$ does not depend on $i$, so it comes out of the sum (the first rule for sums), and Theorem 9.2 adds up the rest:

$$\begin{aligned} R_n &= \sum_{i=1}^{n} \frac{i^2}{n^2}\cdot\frac1n = \frac{1}{n^3}\sum_{i=1}^{n} i^2 \\[5pt] &= \frac{1}{n^3}\cdot\frac{n(n + 1)(2n + 1)}{6} \\[5pt] &= \frac{(n + 1)(2n + 1)}{6n^2}. \end{aligned}$$

Expanding the top, $(n + 1)(2n + 1) = 2n^2 + 3n + 1$, and dividing each term by $6n^2$,

$$R_n = \frac13 + \frac{1}{2n} + \frac{1}{6n^2}.$$

The left sum has the same heights except that $f(x_0) = 0$ replaces $f(x_n) = 1$, so $L_n = R_n - \tfrac1n$:

$$L_n = \frac13 - \frac{1}{2n} + \frac{1}{6n^2}.$$

As $n \to \infty$, $\tfrac1n$ and $\tfrac{1}{n^2}$ approach 0 (limits at infinity, Module 3, with $n$ running through the whole numbers), so

$$\lim_{n\to\infty} L_n = \lim_{n\to\infty} R_n = \frac13.$$

Since $x^2$ increases on $[0, 1]$, $L_n \le A \le R_n$ for every $n$, as in Example 9.1. So $A$ is a fixed number squeezed between two quantities that both approach $\tfrac13$, and by the squeeze theorem of Module 2, which holds for limits at infinity too (Module 3), $A = \tfrac13$.

```check
xi = i/n
steps(Sum(xi**2/n, (i, 1, n)), Sum(i**2, (i, 1, n))/n**3, (n*(n + 1)*(2*n + 1)/6)/n**3, (n + 1)*(2*n + 1)/(6*n**2))
same(expand((n + 1)*(2*n + 1)), 2*n**2 + 3*n + 1)
Rx2 = (n + 1)*(2*n + 1)/(6*n**2)
same(Rx2, Rational(1, 3) + 1/(2*n) + 1/(6*n**2))
same(summation((i/n)**2/n, (i, 0, n - 1)), Rx2 - 1/n); same(Rx2 - 1/n, Rational(1, 3) - 1/(2*n) + 1/(6*n**2))
same(limit(Rx2, n, oo), Rational(1, 3)); same(limit(Rx2 - 1/n, n, oo), Rational(1, 3))
for N_ in (1, 4, 10, 100):
    same(Rx2.subs(n, N_), RR(N_)); same((Rx2 - 1/n).subs(n, N_), LL(N_))
```
:::

The midpoint sum yields to the same method. The midpoints are $m_i = \big(i - \tfrac12\big)\tfrac1n$, so $f(m_i)\,\Delta x = \tfrac{1}{n^3}\big(i - \tfrac12\big)^2$. Expand $\big(i - \tfrac12\big)^2 = i^2 - i + \tfrac14$, use all three rules for sums and the first two formulas of Theorem 9.2, then expand the bracket and collect terms:

$$\begin{aligned} M_n &= \frac{1}{n^3}\sum_{i=1}^{n}\Big(i^2 - i + \frac14\Big) \\[5pt] &= \frac{1}{n^3}\Big(\frac{n(n + 1)(2n + 1)}{6} \\[5pt] &\qquad - \frac{n(n + 1)}{2} + \frac{n}{4}\Big) \\[5pt] &= \frac{1}{n^3}\Big(\frac{n^3}{3} - \frac{n}{12}\Big) \\[5pt] &= \frac13 - \frac{1}{12n^2}. \end{aligned}$$

That is why the midpoint errors in the table are divided by exactly 4 when $n$ doubles.

The same steps work on $[0, b]$ for any $b > 0$. Now $\Delta x = \tfrac{b}{n}$ and $x_i = \tfrac{ib}{n}$, so

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\frac{i^2b^2}{n^2}\cdot\frac{b}{n} = \frac{b^3}{n^3}\sum_{i=1}^{n} i^2 \\[5pt] &= b^3\cdot\frac{(n + 1)(2n + 1)}{6n^2}, \end{aligned}$$

which approaches $\tfrac{b^3}{3}$, while $L_n = R_n - \tfrac{b^3}{n}$ approaches the same number. The area under $y = x^2$ from 0 to $b$ is $\tfrac{b^3}{3}$: $\tfrac83$ for $b = 2$ and $9$ for $b = 3$.

```check
same(((i - 1)/n + i/n)/2, (i - Rational(1, 2))/n); same(((i - Rational(1, 2))/n)**2*(1/n), (i - Rational(1, 2))**2/n**3)   # m_i and f(m_i) dx
steps(Sum(((i - Rational(1, 2))/n)**2/n, (i, 1, n)), Sum(i**2 - i + Rational(1, 4), (i, 1, n))/n**3, (n*(n + 1)*(2*n + 1)/6 - n*(n + 1)/2 + n/4)/n**3,
      (n**3/3 - n/12)/n**3, Rational(1, 3) - 1/(12*n**2))
same(expand(n*(n + 1)*(2*n + 1)/6 - n*(n + 1)/2 + n/4), n**3/3 - n/12)
same(expand((i - Rational(1, 2))**2), i**2 - i + Rational(1, 4))
bp = symbols('b', positive=True)
steps(Sum((i*bp/n)**2*bp/n, (i, 1, n)), bp**3/n**3*Sum(i**2, (i, 1, n)), bp**3*(n + 1)*(2*n + 1)/(6*n**2))
same(summation((i*bp/n)**2*bp/n, (i, 0, n - 1)), bp**3*(n + 1)*(2*n + 1)/(6*n**2) - bp**3/n)
same(limit(bp**3*(n + 1)*(2*n + 1)/(6*n**2), n, oo), bp**3/3); same(limit(bp**3*(n + 1)*(2*n + 1)/(6*n**2) - bp**3/n, n, oo), bp**3/3)
same((bp**3/3).subs(bp, 2), Rational(8, 3)); same((bp**3/3).subs(bp, 3), 9)
```

## The definite integral {#definite-integral}

Left, right and midpoint sums take their heights in three particular ways, over subintervals of equal width. Nothing forces these choices. Any point of a subinterval gives a reasonable height, and the subintervals may have different widths: narrow where the graph changes fast, for example. The definite integral is defined so that these choices do not matter.

::: definition Partitions and Riemann sums
Let $a < b$. A **partition** $P$ of $[a, b]$ is a list of points $a = x_0 < x_1 < \dots < x_n = b$. It cuts $[a, b]$ into $n$ subintervals $[x_{i-1}, x_i]$ of widths $\Delta x_i = x_i - x_{i-1}$; the largest width is the **norm** of $P$, written $\norm{P}$. Choose a **sample point** $x_i^*$, read "x i star", in each subinterval $[x_{i-1}, x_i]$. The **Riemann sum** of $f$ for $P$ and these sample points is

$$\sum_{i=1}^{n} f(x_i^*)\,\Delta x_i.$$
:::

Figure 9.3 (left) shows one. The left, right and midpoint sums are the Riemann sums for the partition into $n$ equal parts, whose norm is $\tfrac{b - a}{n}$, with the sample points at the left ends, the right ends or the midpoints.

::: definition The definite integral
A function $f$ defined on $[a, b]$ is **integrable** on $[a, b]$ if there is a number $I$ that its Riemann sums approach as the partitions get finer: for every $\varepsilon > 0$ there is a $\delta > 0$ such that

$$\Big|\sum_{i=1}^{n} f(x_i^*)\,\Delta x_i - I\Big| < \varepsilon$$

for every partition $P$ of $[a, b]$ with $\norm{P} < \delta$ and every choice of the sample points $x_i^*$. Then $I$ is the **definite integral** of $f$ from $a$ to $b$, written

$$\int_a^b f(x)\,dx = \lim_{\norm{P}\to0}\sum_{i=1}^{n} f(x_i^*)\,\Delta x_i.$$
:::

The condition has the shape of the ε–δ definition of a limit in Module 2, with the Riemann sums in the role of the values $f(x)$, and the norm $\norm{P}$ in the role of the distance between $x$ and the point it approaches: however small a tolerance $\varepsilon$ you set, every Riemann sum is within $\varepsilon$ of $I$ once the partition is fine enough, wherever the sample points are. It asks more than a limit of a function of one variable, because a Riemann sum is not determined by $\norm{P}$: many partitions have the same norm, and each allows many choices of sample points, and every one of these sums must be close to $I$. The symbol $\lim_{\norm{P}\to0}$, read "the limit as the norm of $P$ approaches 0", is shorthand for exactly this condition. There can be only one such number $I$: two different numbers cannot both be within $\varepsilon$ of the same Riemann sums when $\varepsilon$ is less than half the distance between them.

**Reading the notation.** $\int_a^b f(x)\,dx$ reads "the integral from $a$ to $b$ of $f$ of $x$, $dx$". The sign $\int$, Leibniz's notation (Module 1), is an elongated S, a reminder that an integral is a limit of sums. The function $f(x)$ is the **integrand**, and $a$ and $b$ are the **lower and upper limits of integration** (ends of the interval again, not limits in the sense of Module 2). The $dx$ recalls the widths $\Delta x_i$, so that $f(x)\,dx$ echoes $f(x_i^*)\,\Delta x_i$, and it names the variable. The integral is a number, not a function of $x$: like the index of a sum, $x$ is a dummy variable, and

$$\int_a^b f(x)\,dx = \int_a^b f(t)\,dt = \int_a^b f(u)\,du.$$

When $f$ is integrable and $f(x) \ge 0$ on $[a, b]$, the integral is the area under the graph of $f$ from $a$ to $b$. In fact the integral is now the definition of that area, and it gives the areas you already knew, as you will see below.

Which functions are integrable? Almost every function that you will meet.

::: theorem Integrable functions
If $f$ is continuous on $[a, b]$, then $f$ is integrable on $[a, b]$. More generally, $f$ is integrable on $[a, b]$ if it is bounded there (there is a number $K$ with $\abs{f(x)} \le K$ for every $x$ in $[a, b]$) and has only finitely many discontinuities in $[a, b]$, such as jumps.
:::

The proof, like that of the Extreme Value Theorem, needs the completeness of the real numbers, and belongs to a course in real analysis; this series uses the theorem without proof. It covers polynomials, $\sin x$, $\cos x$ and $e^x$ on every interval $[a, b]$, $1/x$ on every interval $[a, b]$ that does not contain 0, and piecewise functions with finitely many jumps. Once you know that $f$ is integrable, you may compute its integral with whichever Riemann sums are convenient:

::: theorem Integrals from equal subintervals
If $f$ is integrable on $[a, b]$, then

$$\begin{aligned} \int_a^b f(x)\,dx &= \lim_{n\to\infty} L_n = \lim_{n\to\infty} R_n \\[5pt] &= \lim_{n\to\infty} M_n, \end{aligned}$$

and the same holds for every other choice of sample points in the $n$ equal subintervals.
:::

::: proof
Let $I = \int_a^b f(x)\,dx$ and $\varepsilon > 0$, and take a $\delta$ as in Definition 9.4. The partition into $n$ equal parts has norm $\tfrac{b - a}{n}$, which is less than $\delta$ as soon as $n > \tfrac{b - a}{\delta}$. For all such $n$, every Riemann sum of that partition, $L_n$, $R_n$ and $M_n$ among them, is within $\varepsilon$ of $I$. That is what $\lim_{n\to\infty} L_n = I$ means, and the same for $R_n$ and $M_n$.
:::

So the area of Example 9.5 is an integral: $x^2$ is continuous, so it is integrable (Theorem 9.3), and by Theorem 9.4 its integral is the limit of the right sums. With the computation for $[0, b]$,

$$\int_0^1 x^2\,dx = \frac13, \qquad \int_0^b x^2\,dx = \frac{b^3}{3} \quad (b > 0).$$

The integral also gives the areas you already knew. The function $x$ is continuous, and its right sums on $[0, b]$ are

$$\sum_{i=1}^{n} \frac{ib}{n}\cdot\frac{b}{n} = \frac{b^2}{n^2}\cdot\frac{n(n + 1)}{2} = \frac{b^2}{2}\Big(1 + \frac1n\Big),$$

which approach $\tfrac{b^2}{2}$: the integral of $x$ from 0 to $b$ is the area of the triangle under its graph, with base $b$ and height $b$. Every Riemann sum of a constant function $c \ge 0$ is $c(b - a)$, because the widths add up to $b - a$: the area of a rectangle. And Module 11 shows that the integral gives the area $\pi r^2$ of a disc.

The hypothesis "$f$ is integrable" in Theorem 9.4 cannot be dropped: the Going deeper box below shows a function whose right sums have a limit although it is not integrable.

```check
same(integrate(x**2, (x, 0, 1)), Rational(1, 3)); same(integrate(x**2, (x, 0, bp)), bp**3/3)
steps(Sum(i*bp/n*bp/n, (i, 1, n)), bp**2/n**2*(n*(n + 1)/2), bp**2/2*(1 + 1/n))
same(limit(bp**2/2*(1 + 1/n), n, oo), bp**2/2); same(integrate(x, (x, 0, bp)), Rational(1, 2)*bp*bp)
```

::: example An integral as a limit of sums
Find $\displaystyle\int_1^3 x^2\,dx$ as the limit of right sums.

The integrand is continuous, so Theorem 9.4 lets you use $R_n$. Here $\Delta x = \tfrac2n$ and $x_i = 1 + \tfrac{2i}{n}$, so

$$f(x_i) = \Big(1 + \frac{2i}{n}\Big)^2 = 1 + \frac{4i}{n} + \frac{4i^2}{n^2}.$$

By the rules for sums, with the factors that do not depend on $i$ taken outside each sum,

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\Big(1 + \frac{4i}{n} + \frac{4i^2}{n^2}\Big)\frac2n \\[5pt] &= \frac2n\sum_{i=1}^{n} 1 + \frac{8}{n^2}\sum_{i=1}^{n} i \\[5pt] &\qquad + \frac{8}{n^3}\sum_{i=1}^{n} i^2 \\[5pt] &= 2 + \frac{8}{n^2}\cdot\frac{n(n + 1)}{2} \\[5pt] &\qquad + \frac{8}{n^3}\cdot\frac{n(n + 1)(2n + 1)}{6} \\[5pt] &= 2 + \frac{4(n + 1)}{n} \\[5pt] &\qquad + \frac{4(n + 1)(2n + 1)}{3n^2}. \end{aligned}$$

As $n \to \infty$, $\tfrac{n + 1}{n} = 1 + \tfrac1n$ approaches 1 and $\tfrac{(n + 1)(2n + 1)}{n^2} = 2 + \tfrac3n + \tfrac{1}{n^2}$ approaches 2, so

$$\int_1^3 x^2\,dx = 2 + 4 + \frac83 = \frac{26}{3} \approx 8.667.$$

Compare with the areas from 0: $\int_0^3 x^2\,dx = 9$ and $\int_0^1 x^2\,dx = \tfrac13$, and $9 - \tfrac13 = \tfrac{26}{3}$, as it should be, since the region from 1 to 3 is the region from 0 to 3 without the region from 0 to 1. Section 9.5 turns this subtraction into a rule.

```check
xi6 = 1 + 2*i/n
same(expand(xi6**2), 1 + 4*i/n + 4*i**2/n**2)
R96 = 2 + 4*(n + 1)/n + 4*(n + 1)*(2*n + 1)/(3*n**2)
steps(Sum(xi6**2*2/n, (i, 1, n)), 2/n*Sum(1, (i, 1, n)) + 8/n**2*Sum(i, (i, 1, n)) + 8/n**3*Sum(i**2, (i, 1, n)),
      2 + 8/n**2*(n*(n + 1)/2) + 8/n**3*(n*(n + 1)*(2*n + 1)/6), R96)
same((n + 1)/n, 1 + 1/n); same(expand((n + 1)*(2*n + 1)/n**2), 2 + 3/n + 1/n**2)
same(limit(R96, n, oo), 2 + 4 + Rational(8, 3)); same(2 + 4 + Rational(8, 3), Rational(26, 3)); rounds(Rational(26, 3), '8.667')
same(integrate(x**2, (x, 1, 3)), Rational(26, 3)); same(9 - Rational(1, 3), Rational(26, 3))
same(R96.subs(n, 4), Rsum(x9**2, 1, 3, 4))
```
:::

::: compute Limits of Riemann sums with SymPy
SymPy can do the whole computation of Example 9.6: build the right sum with a symbolic $n$, add it up with `summation`, and let $n \to \infty$ with `limit`:

```python
import sympy as sp
i, n = sp.symbols('i n', integer=True, positive=True)
a, b = 1, 3
dx = sp.Integer(b - a)/n
xi = a + i*dx                         # the right ends
Rn = sp.summation(xi**2*dx, (i, 1, n))
print(sp.factor(Rn))
print(sp.limit(Rn, n, sp.oo))
```

```output
2*(13*n**2 + 12*n + 2)/(3*n**2)
26/3
```

The factored right sum is the formula of Example 9.6 over a common denominator. Change the function or the interval and run it again: for $x^3$ on $[0, 2]$, the limit is 4 (Exercise 9.5).
:::

```check
same(2*(13*n**2 + 12*n + 2)/(3*n**2), R96)
```

::: deeper Functions that are not integrable
A first reading may skip this box. Theorem 9.3 asks for boundedness and for only finitely many discontinuities, and Theorem 9.4 asks for integrability. Two examples show why.

**Too many discontinuities.** On $[0, 1]$, let $D(x) = 1$ when $x$ is rational and $D(x) = 0$ when $x$ is irrational. Every subinterval of every partition, however narrow, contains both rational and irrational numbers. Choose all the sample points rational, and every term is $1 \cdot \Delta x_i$, so the Riemann sum is the total width of the subintervals, 1; choose them all irrational, and it is 0. However small $\norm{P}$ is, some Riemann sums are 1 and others are 0, so no number $I$ is within $\varepsilon = \tfrac12$ of all of them: $D$ is not integrable on $[0, 1]$. Yet its right sums are all 1, because the right ends $\tfrac{i}{n}$ are rational, so $\lim_{n\to\infty} R_n = 1$ exists. A limit of equal-width sums alone does not make a function integrable. ($D$ is discontinuous at every point of $[0, 1]$.)

**Unbounded.** Let $f(x) = 1/\sqrt{x}$ for $0 < x \le 1$ and $f(0) = 0$. In every partition of $[0, 1]$, the first subinterval $[0, x_1]$ contains points as close to 0 as you like, where $1/\sqrt{x}$ is as large as you like. Choosing $x_1^*$ close enough to 0 makes the single term $f(x_1^*)\,\Delta x_1$, and with it the whole Riemann sum (the other terms are positive), larger than any number you name. The Riemann sums approach no number, and $f$ is not integrable on $[0, 1]$. The same argument shows that every integrable function is bounded. Module 12 gives some integrals of unbounded functions a meaning, as improper integrals; this one will turn out to be 2.

```check
for N_ in (3, 7, 10):                           # the right ends i/n are rational, so every R_n of D is 1
    holds(all(Rational(j, N_).is_rational for j in range(1, N_ + 1))); same(sum(1*Rational(1, N_) for j in range(N_)), 1)
x1_, x2_ = symbols('x1 x2', positive=True)
same((x1_ - 0) + (x2_ - x1_) + (1 - x2_), 1)       # widths of a partition of [0, 1] add up to 1
hp = symbols('h', positive=True); Mbig = symbols('M', positive=True)
same((1/sqrt((hp/Mbig)**2))*hp, Mbig)            # x1* = (dx1/M)^2 makes the term f(x1*) dx1 equal to M
same(integrate(1/sqrt(x), (x, 0, 1)), 2)
```
:::

### Signed area {#signed-area}

Where $f$ is negative, the terms $f(x_i^*)\,\Delta x_i$ of a Riemann sum are negative: they are areas of rectangles with a minus sign. So the integral counts area above the $x$-axis as positive and area below it as negative:

$$\begin{aligned} \int_a^b f(x)\,dx &= (\text{area above the axis}) \\[5pt] &\quad - (\text{area below the axis}). \end{aligned}$$

This is the **net area**, or **signed area**, between the graph of $f$ and the $x$-axis. The **total area** between the graph and the axis counts every part as positive: it is the area above the axis plus the area below it. Since the graph of $\abs{f}$ turns the parts below the axis over, the total area is $\int_a^b \abs{f(x)}\,dx$. In Figure 9.3 (right) the two parts cancel exactly: the net area is 0, but the total area is not.

::: figure id=fig-09-3
Left: a Riemann sum for a partition $x_0 < x_1 < \dots < x_5$ with unequal widths $\Delta x_i$ and a sample point $x_i^*$ (dot) anywhere in each subinterval. Right: the signed area of Example 9.7. The graph of $x^2 - 2x$ encloses an area of $\tfrac43$ below the axis, on $[0, 2]$, and an area of $\tfrac43$ above it, on $[2, 3]$, so the integral from 0 to 3 is 0.
:::

::: example A signed area
Find $\displaystyle\int_0^3 \big(x^2 - 2x\big)\,dx$ as the limit of right sums.

The integrand is continuous, so Theorem 9.4 applies. Here $\Delta x = \tfrac3n$ and $x_i = \tfrac{3i}{n}$, so $f(x_i) = \tfrac{9i^2}{n^2} - \tfrac{6i}{n}$ and

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\Big(\frac{9i^2}{n^2} - \frac{6i}{n}\Big)\frac3n \\[5pt] &= \frac{27}{n^3}\sum_{i=1}^{n} i^2 - \frac{18}{n^2}\sum_{i=1}^{n} i \\[5pt] &= \frac{9(n + 1)(2n + 1)}{2n^2} - \frac{9(n + 1)}{n}. \end{aligned}$$

Over the common denominator $2n^2$, the top is $9(n + 1)\big[(2n + 1) - 2n\big] = 9(n + 1)$, so

$$R_n = \frac{9(n + 1)}{2n^2} = \frac{9}{2n} + \frac{9}{2n^2},$$

which approaches 0. So $\int_0^3 (x^2 - 2x)\,dx = 0$.

The integral is 0, but the graph is not the $x$-axis. Since $x^2 - 2x = x(x - 2)$, the integrand is negative on $(0, 2)$ and positive on $(2, 3)$: the area below the axis equals the area above it. Example 9.8 finds them, $\tfrac43$ each.

```check
f97 = x9**2 - 2*x9
same(f97.subs(x9, 3*i/n), 9*i**2/n**2 - 6*i/n)
R97a = 9*(n + 1)*(2*n + 1)/(2*n**2) - 9*(n + 1)/n
steps(Sum((9*i**2/n**2 - 6*i/n)*3/n, (i, 1, n)), 27/n**3*Sum(i**2, (i, 1, n)) - 18/n**2*Sum(i, (i, 1, n)), R97a)
same(expand(9*(n + 1)*((2*n + 1) - 2*n)), 9*(n + 1)); steps(R97a, 9*(n + 1)/(2*n**2), 9/(2*n) + 9/(2*n**2))
same(limit(R97a, n, oo), 0); same(R97a.subs(n, 5), Rsum(f97, 0, 3, 5))
same(factor(x**2 - 2*x), x*(x - 2)); same(integrate(x**2 - 2*x, (x, 0, 3)), 0)
```
:::

**Displacement and distance.** For an object moving along a line, the velocity $v(t)$ is negative while the object moves backwards. Over a short time $\Delta t$ its position changes by about $v(t_i^*)\,\Delta t$: forwards when $v > 0$, backwards when $v < 0$. These changes add up to a Riemann sum of $v$, so $\int_a^b v(t)\,dt$ is the **displacement**, the net change in position $s(b) - s(a)$, while the **distance travelled**, which counts every movement as positive, is $\int_a^b \abs{v(t)}\,dt$. Module 10 proves the first statement, as the net change theorem. For example, an object with velocity $v(t) = 2 - t$ m/s, for $0 \le t \le 4$, moves forwards for 2 seconds and then backwards for 2 seconds. The graph of $v$ forms a triangle of area 2 above the axis, on $[0, 2]$, and one of area 2 below it, on $[2, 4]$. So the displacement is $\int_0^4 (2 - t)\,dt = 2 - 2 = 0$ m, since the object ends where it started, but the distance travelled is $2 + 2 = 4$ m.

```check
same(Rational(1, 2)*2*2, 2); same(integrate(2 - t, (t, 0, 4)), 0); same(integrate(Abs(2 - t), (t, 0, 4)), 4)
same(integrate(2 - t, (t, 0, 2)), 2); same(integrate(2 - t, (t, 2, 4)), -2)
```

::: pitfall
$\int_a^b f(x)\,dx$ is the area between the graph and the axis when $f \ge 0$ on $[a, b]$. Where $f$ is negative, the integral subtracts area: it is a net area, which can be 0, or negative, even when the region is large. To find the total area, split $[a, b]$ where $f$ changes sign and add up the sizes of the pieces: for $x^2 - 2x$ on $[0, 3]$ the total area is $\tfrac43 + \tfrac43 = \tfrac83$, not 0.
:::

## Properties of the integral {#properties}

Riemann sums obey the rules for sums of Section 9.2. Letting the partitions shrink turns those rules into rules for integrals. First, two conventions make the rules work for every order of the limits of integration.

::: definition Reversed and equal limits
For $a < b$ and $f$ integrable on $[a, b]$,

$$\int_b^a f(x)\,dx = -\int_a^b f(x)\,dx.$$

For every number $c$ at which $f$ is defined, $\displaystyle\int_c^c f(x)\,dx = 0$.
:::

Going from $b$ back to $a$, the widths $\Delta x = \tfrac{a - b}{n}$ are negative, so every Riemann sum changes sign: that makes the first convention the natural one. The second says that a single point has no area.

::: theorem Linearity
If $f$ and $g$ are integrable on $[a, b]$ and $c$ is a constant, then $f + g$, $f - g$ and $cf$ are integrable on $[a, b]$, and

$$\begin{aligned} \int_a^b \big(f(x) + g(x)\big)\,dx &= \int_a^b f(x)\,dx \\[5pt] &\quad + \int_a^b g(x)\,dx, \\[5pt] \int_a^b c\,f(x)\,dx &= c\int_a^b f(x)\,dx, \end{aligned}$$

and the same holds with $f - g$ in place of $f + g$. For a constant function, $\displaystyle\int_a^b c\,dx = c(b - a)$.
:::

::: proof
For every partition and every choice of sample points, the Riemann sum of $f + g$ is the Riemann sum of $f$ plus that of $g$, by the second rule for sums. Given $\varepsilon > 0$, take $\delta_1$ for $f$ and $\delta_2$ for $g$, each for the tolerance $\tfrac{\varepsilon}{2}$, as in Definition 9.4. If $\norm{P}$ is less than both, the two Riemann sums are within $\tfrac{\varepsilon}{2}$ of $\int_a^b f$ and of $\int_a^b g$, so their sum is within $\varepsilon$ of $\int_a^b f + \int_a^b g$. That proves the first formula. For the second, the Riemann sum of $cf$ is $c$ times that of $f$; when the sum of $f$ is within $\tfrac{\varepsilon}{\abs{c} + 1}$ of $\int_a^b f$, the sum of $cf$ is within $\tfrac{\abs{c}\,\varepsilon}{\abs{c} + 1} < \varepsilon$ of $c\int_a^b f$. For $f - g$, combine the two formulas with $c = -1$. Finally, every Riemann sum of the constant function $c$ is $\sum c\,\Delta x_i = c(b - a)$, because the widths add up to $b - a$.
:::

These are the arguments that proved the limit laws in Module 2. Additivity over intervals needs a little more care.

::: theorem Additivity over intervals
Let $f$ be continuous, or bounded with finitely many discontinuities, on an interval that contains $a$, $b$ and $c$. Then

$$\begin{aligned} &\int_a^b f(x)\,dx + \int_b^c f(x)\,dx \\[5pt] &\quad= \int_a^c f(x)\,dx. \end{aligned}$$
:::

::: proof
By Theorem 9.3, $f$ is integrable on every closed interval with ends among $a$, $b$ and $c$. Suppose first that $a < b < c$, and let $\varepsilon > 0$. Definition 9.4 gives a $\delta$ for each of the intervals $[a, b]$, $[b, c]$ and $[a, c]$; let $\delta$ be the smallest of the three. Then, for partitions of norm less than $\delta$, the Riemann sums for each of the three intervals are within $\varepsilon$ of its integral. Take a partition of $[a, b]$ and one of $[b, c]$, both of norm less than $\delta$, with any sample points, and let $S_1$ and $S_2$ be their Riemann sums. Together the two partitions form a partition of $[a, c]$, also of norm less than $\delta$, and its Riemann sum is $S_1 + S_2$. So

$$\begin{aligned} &\Big|\int_a^c f - \int_a^b f - \int_b^c f\Big| \\[5pt] &\quad\le \Big|\int_a^c f - (S_1 + S_2)\Big| \\[5pt] &\qquad + \Big|S_1 - \int_a^b f\Big| + \Big|S_2 - \int_b^c f\Big| \\[5pt] &\quad< 3\varepsilon. \end{aligned}$$

The left side is a fixed number, less than $3\varepsilon$ for every $\varepsilon > 0$, so it is 0. Every other order of $a$, $b$ and $c$ follows from this case with Definition 9.5. For instance, if $a < c < b$, the case already proved gives $\int_a^c f + \int_c^b f = \int_a^b f$, so $\int_a^c f = \int_a^b f - \int_c^b f = \int_a^b f + \int_b^c f$. If two of the three numbers are equal, the formula follows at once from Definition 9.5.
:::

(Additivity holds for every function integrable on the largest interval, but the proof that such a function is integrable on the smaller intervals belongs to real analysis.)

::: example Splitting an integral
Find $\displaystyle\int_0^2 \big(x^2 - 2x\big)\,dx$ and $\displaystyle\int_2^3 \big(x^2 - 2x\big)\,dx$, and the total area between the graph of $y = x^2 - 2x$ and the $x$-axis from 0 to 3.

By linearity,

$$\begin{aligned} \int_0^2 \big(x^2 - 2x\big)\,dx &= \int_0^2 x^2\,dx \\[5pt] &\quad - 2\int_0^2 x\,dx. \end{aligned}$$

The first integral is $\tfrac{2^3}{3} = \tfrac83$ (Section 9.4). The second is the area of a triangle: the graph of $y = x$ from 0 to 2 runs from $(0, 0)$ to $(2, 2)$, so $\int_0^2 x\,dx = \tfrac12 \cdot 2 \cdot 2 = 2$. So

$$\int_0^2 \big(x^2 - 2x\big)\,dx = \frac83 - 4 = -\frac43.$$

By additivity, the integrals over $[0, 2]$ and $[2, 3]$ add up to the integral over $[0, 3]$, which is 0 by Example 9.7, so

$$\int_2^3 \big(x^2 - 2x\big)\,dx = 0 - \Big(-\frac43\Big) = \frac43.$$

The region below the axis has area $\tfrac43$ and the region above has area $\tfrac43$: the total area is $\tfrac83$, while the integral from 0 to 3 is 0 (Figure 9.3).

```check
steps(Integral(x**2 - 2*x, (x, 0, 2)), Integral(x**2, (x, 0, 2)) - 2*Integral(x, (x, 0, 2)), Rational(8, 3) - 2*2, -Rational(4, 3))
same(Rational(1, 2)*2*2, 2); same(integrate(x, (x, 0, 2)), 2)
same(0 - (-Rational(4, 3)), Rational(4, 3)); same(integrate(x**2 - 2*x, (x, 2, 3)), Rational(4, 3))
same(Rational(4, 3) + Rational(4, 3), Rational(8, 3)); same(integrate(-(x**2 - 2*x), (x, 0, 2)) + integrate(x**2 - 2*x, (x, 2, 3)), Rational(8, 3))
near(Integral(Abs(x**2 - 2*x), (x, 0, 3)).evalf(30), Rational(8, 3), 1e-20)          # the total area is the integral of |f|
```
:::

::: theorem Comparison
Let $f$ and $g$ be integrable on $[a, b]$, where $a < b$.

- (a) If $f(x) \ge 0$ for every $x$ in $[a, b]$, then $\displaystyle\int_a^b f(x)\,dx \ge 0$.
- (b) If $f(x) \le g(x)$ for every $x$ in $[a, b]$, then $\displaystyle\int_a^b f(x)\,dx \le \int_a^b g(x)\,dx$.
- (c) If $m \le f(x) \le M$ for every $x$ in $[a, b]$, then
  $$\begin{aligned} m(b - a) &\le \int_a^b f(x)\,dx \\[5pt] &\le M(b - a). \end{aligned}$$
:::

::: proof
**(a)** Every Riemann sum $\sum f(x_i^*)\,\Delta x_i$ adds up products of numbers that are at least 0, so it is at least 0. Suppose the integral $I$ were negative. By Definition 9.4 with $\varepsilon = \tfrac{\abs{I}}{2}$, the Riemann sums of every fine enough partition would lie within $\tfrac{\abs{I}}{2}$ of $I$, and so would be negative, which is impossible. So $I \ge 0$.

**(b)** By linearity, $g - f$ is integrable and $\int_a^b g - \int_a^b f = \int_a^b (g - f)$, which is at least 0 by (a), since $g(x) - f(x) \ge 0$.

**(c)** Apply (b) to the constant function $m$ and $f$, and to $f$ and the constant function $M$, and use $\int_a^b m\,dx = m(b - a)$ (Theorem 9.5).
:::

When $f \ge 0$ is continuous, take for $m$ and $M$ its smallest and largest values on $[a, b]$, which exist by the Extreme Value Theorem (Module 3). Then part (c) says that the area under the graph lies between the areas of two rectangles on $[a, b]$, one as high as the lowest point of the graph and one as high as the highest.

Part (b) also compares the net area with the total area of Section 9.4. Let $f$ be continuous, or bounded with finitely many discontinuities, so that $\abs{f}$ is too, and both are integrable. Since $-\abs{f(x)} \le f(x) \le \abs{f(x)}$, part (b) and linearity give $-\int_a^b \abs{f(x)}\,dx \le \int_a^b f(x)\,dx \le \int_a^b \abs{f(x)}\,dx$, that is,

$$\Big|\int_a^b f(x)\,dx\Big| \le \int_a^b \abs{f(x)}\,dx.$$

In size, the net area is never more than the total area: for $x^2 - 2x$ on $[0, 3]$, 0 against $\tfrac83$.

```check
same(Abs(integrate(x**2 - 2*x, (x, 0, 3))), 0); holds(0 <= Rational(8, 3))
for F_, A_, B_ in ((x**2 - 2*x, 0, 3), (sin(x), 0, 5), (x**3 - x, -2, 1)):
    holds(Abs(Integral(F_, (x, A_, B_)).evalf(30)) <= Integral(Abs(F_), (x, A_, B_)).evalf(30))
```

::: example Bounding an integral with no formula
Show that $\displaystyle\int_0^1 e^{-x^2}\,dx$ lies between 0.36 and 1, and then that it lies between 0.57 and 0.89.

The integrand is continuous, so the integral exists (Theorem 9.3). The shortcut of Module 10 cannot evaluate it, because no formula built from the familiar functions has the derivative $e^{-x^2}$ (Module 11), but the comparison theorem bounds it. On $[0, 1]$, $x^2$ increases from 0 to 1, so $-x^2$ decreases from 0 to $-1$, and $e^{-x^2}$ decreases from $e^0 = 1$ to $e^{-1}$. So $e^{-1} \le e^{-x^2} \le 1$ on $[0, 1]$, and Theorem 9.7(c), with $b - a = 1$, gives

$$e^{-1} \le \int_0^1 e^{-x^2}\,dx \le 1.$$

Since $e^{-1} \approx 0.3679$, the integral lies between 0.36 and 1.

To do better, split $[0, 1]$ at $\tfrac12$ (additivity) and bound each half. On $\big[0, \tfrac12\big]$, $e^{-1/4} \le e^{-x^2} \le 1$; on $\big[\tfrac12, 1\big]$, $e^{-1} \le e^{-x^2} \le e^{-1/4}$. Each half has width $\tfrac12$, so

$$\frac{e^{-1/4} + e^{-1}}{2} \le \int_0^1 e^{-x^2}\,dx \le \frac{1 + e^{-1/4}}{2},$$

where the bounds are about $0.5733$ and $0.8894$: the integral lies between 0.57 and 0.89. These two bounds are $R_2$ and $L_2$. The same argument works for any continuous decreasing $f$ and any $n$: on each subinterval, $f$ lies between its values at the right end and at the left end, so Theorem 9.7(c) bounds the integral over each subinterval, and adding the $n$ results (additivity) gives $R_n \le \int_a^b f(x)\,dx \le L_n$. For a continuous increasing $f$, $L_n \le \int_a^b f(x)\,dx \le R_n$. The gap between the bounds, $\abs{L_n - R_n} = \Delta x\,\abs{f(a) - f(b)}$, shrinks as $n$ grows.

(All these bounds are in fact strict, because the integrand equals each bound only at single points; Exercise 9.12 shows how to prove such strict inequalities.)

```check
g99 = exp(-x9**2)
same(g99.subs(x9, 0), 1); same(g99.subs(x9, 1), exp(-1)); same(g99.subs(x9, Rational(1, 2)), exp(-Rational(1, 4)))
same(solve_univariate_inequality(diff(exp(-x**2), x) < 0, x, relational=False).intersect(Interval(0, 1)), Interval.Lopen(0, 1))
rounds(exp(-1), '0.3679'); holds(exp(-1) > Rational(36, 100))
lo99 = (exp(-Rational(1, 4)) + exp(-1))/2; hi99 = (1 + exp(-Rational(1, 4)))/2
rounds(lo99, '0.5733'); rounds(hi99, '0.8894'); holds(lo99 > Rational(57, 100)); holds(hi99 < Rational(89, 100))
same(lo99, Rsum(g99, 0, 1, 2)); same(hi99, Lsum(g99, 0, 1, 2))
for N_ in (2, 5):                                   # the gap L_n - R_n = dx (f(a) - f(b)), and R_n < integral < L_n
    same(Lsum(g99, 0, 1, N_) - Rsum(g99, 0, 1, N_), Rational(1, N_)*(g99.subs(x9, 0) - g99.subs(x9, 1)))
    holds(Rsum(g99, 0, 1, N_) < Integral(exp(-x**2), (x, 0, 1)).evalf(30)); holds(Integral(exp(-x**2), (x, 0, 1)).evalf(30) < Lsum(g99, 0, 1, N_))
I99 = Integral(exp(-x**2), (x, 0, 1)).evalf(30); holds(lo99 < I99); holds(I99 < hi99)
```
:::

::: compute A number with no formula yet
Midpoint sums pin the value down:

```python
import math

def midpoint(f, a, b, n):
    dx = (b - a)/n
    return sum(f(a + (i + 0.5)*dx) for i in range(n))*dx

def g(x):
    return math.exp(-x**2)

for n in [2, 10, 100, 1000]:
    print(n, midpoint(g, 0, 1, n))
```

```output
2 0.7545979437721995
10 0.7471308777479975
100 0.7468271984923199
1000 0.746824163469049
```

The digits settle down: to six decimal places, $\int_0^1 e^{-x^2}\,dx \approx 0.746824$, inside the bounds of Example 9.9. Integrals of $e^{-x^2}$ are at the heart of probability: Module 12 meets them again with the normal distribution.
:::

```check
rounds(Integral(exp(-x**2), (x, 0, 1)).evalf(30), '0.746824')
```

::: pitfall
Integrals do not multiply: $\int_a^b f(x)g(x)\,dx$ is not $\int_a^b f(x)\,dx \cdot \int_a^b g(x)\,dx$. For example, $\int_0^1 x \cdot x\,dx = \int_0^1 x^2\,dx = \tfrac13$, while $\big(\int_0^1 x\,dx\big)^2 = \big(\tfrac12\big)^2 = \tfrac14$. Nor do they divide. And the comparison theorem needs $a < b$: with the limits reversed, the inequalities turn round, since $\int_1^0 1\,dx = -1$ although $1 > 0$.

```check
same(integrate(x*x, (x, 0, 1)), Rational(1, 3)); same(integrate(x, (x, 0, 1))**2, Rational(1, 4)); same(integrate(1, (x, 1, 0)), -1)
```
:::

## Integrals from geometry and symmetry {#geometry-symmetry}

Limits of Riemann sums take work. When the region under a graph is made of familiar shapes, or has a symmetry, the integral comes faster.

### Geometry {#geometry}

When a graph is made of straight segments and arcs of circles, its integral is a sum of the areas of rectangles, triangles, trapezoids and parts of discs, with a minus sign for each piece below the axis. Recall that a trapezoid whose parallel sides have lengths $p$ and $q$, a distance $w$ apart, has area $\tfrac{(p + q)w}{2}$, and a disc of radius $r$ has area $\pi r^2$.

::: example Integrals as familiar areas
Evaluate:

- (a) $\displaystyle\int_0^3 (2x + 1)\,dx$
- (b) $\displaystyle\int_{-1}^{2} \abs{x}\,dx$
- (c) $\displaystyle\int_0^4 \sqrt{4x - x^2}\,dx$
- (d) $\displaystyle\int_0^3 (x - 1)\,dx$

**(a)** The graph is a line, above the axis on $[0, 3]$, and the region under it is a trapezoid with parallel sides $f(0) = 1$ and $f(3) = 7$, a distance 3 apart. The integral is $\tfrac{(1 + 7) \cdot 3}{2} = 12$.

**(b)** The graph of $\abs{x}$ is a V. The region consists of two triangles: one over $[-1, 0]$ with base 1 and height 1, of area $\tfrac12$, and one over $[0, 2]$ with base 2 and height 2, of area 2. The integral is $\tfrac12 + 2 = \tfrac52$.

**(c)** Complete the square: $4x - x^2 = 4 - (x - 2)^2$. So $y = \sqrt{4x - x^2}$ means that $y \ge 0$ and ${(x - 2)^2 + y^2 = 4}$: the graph is the upper half of the circle of radius 2 centred at $(2, 0)$, which runs from $x = 0$ to $x = 4$. The region is a half disc, of area $\tfrac12\pi \cdot 2^2 = 2\pi$ (Figure 9.4, left).

**(d)** The line $y = x - 1$ is below the axis on $[0, 1]$, forming a triangle of area $\tfrac12$, and above it on $[1, 3]$, forming a triangle with base 2 and height 2, of area 2. The integral is the signed area $2 - \tfrac12 = \tfrac32$.

```check
same((1 + 7)*3/Integer(2), 12); same((2*x + 1).subs(x, 0), 1); same((2*x + 1).subs(x, 3), 7); same(integrate(2*x + 1, (x, 0, 3)), 12)
same(Rational(1, 2) + 2, Rational(5, 2)); same(integrate(Abs(x), (x, -1, 2)), Rational(5, 2))
same(expand(4 - (x - 2)**2), 4*x - x**2); same(Rational(1, 2)*pi*2**2, 2*pi); same(integrate(sqrt(4*x - x**2), (x, 0, 4)), 2*pi)
same(solve(4*x - x**2, x), [0, 4])
same(2 - Rational(1, 2), Rational(3, 2)); same(integrate(x - 1, (x, 0, 3)), Rational(3, 2))
```
:::

### Symmetry {#symmetry}

Recall from [Section 1.4](module_01_EN.html#polynomials) that $f$ is **even** if $f(-x) = f(x)$, and **odd** if $f(-x) = -f(x)$, for every $x$ in its domain. For example, $x^2$, $\cos x$ and $\abs{x}$ are even, and $x^3$, $\sin x$ and $\tfrac1x$ are odd. Over an interval $[-a, a]$, symmetric about 0, the graph of an even function has two halves that are mirror images, and the graph of an odd function has two halves that are mirror images turned upside down (Figure 9.4).

::: theorem Integrals of even and odd functions
Let $a > 0$, and let $f$ be continuous, or bounded with finitely many discontinuities, on $[-a, a]$.

- (a) If $f$ is even, then $\displaystyle\int_{-a}^{a} f(x)\,dx = 2\int_0^a f(x)\,dx$.
- (b) If $f$ is odd, then $\displaystyle\int_{-a}^{a} f(x)\,dx = 0$.
:::

::: proof
By additivity, $\int_{-a}^{a} f = \int_{-a}^{0} f + \int_0^a f$, and both integrals exist by Theorem 9.3. Compare the two pieces through their Riemann sums. Take a partition $0 = x_0 < x_1 < \dots < x_n = a$ of $[0, a]$ with sample points $x_i^*$. Its mirror image, $-a = -x_n < \dots < -x_1 < -x_0 = 0$, is a partition of $[-a, 0]$ with the same widths, and so the same norm; take the points $-x_i^*$ as its sample points. Its Riemann sum is

$$\sum_{i=1}^{n} f(-x_i^*)\,\Delta x_i.$$

If $f$ is even, this equals $\sum f(x_i^*)\,\Delta x_i$, the Riemann sum of the partition of $[0, a]$; if $f$ is odd, it equals $-\sum f(x_i^*)\,\Delta x_i$. As the norm shrinks to 0, the sum for $[-a, 0]$ approaches $\int_{-a}^{0} f$ and the sum for $[0, a]$ approaches $\int_0^a f$ (Definition 9.4). So $\int_{-a}^{0} f = \int_0^a f$ if $f$ is even, and $\int_{-a}^{0} f = -\int_0^a f$ if $f$ is odd. Adding $\int_0^a f$ gives (a) and (b).
:::

::: figure id=fig-09-4
Left: $\int_0^4 \sqrt{4x - x^2}\,dx$ is the area of a half disc of radius 2, that is, $2\pi$ (Example 9.10). Centre: the odd function $x^3 - 3x$ on $[-2, 2]$; each region has a mirror image on the other side of the origin with the opposite sign, so the integral is 0. Right: an even function; its two halves have the same area $A$, so its integral over $[-a, a]$ is twice its integral over $[0, a]$.
:::

::: example Using symmetry
Evaluate:

- (a) $\displaystyle\int_{-2}^{2} \big(x^3 - 4x + \sin x\big)\,dx$
- (b) $\displaystyle\int_{-1}^{1} \big(3x^2 + 5x^3 - 2\big)\,dx$
- (c) $\displaystyle\int_{-\pi}^{\pi} x^2\sin x\,dx$
- (d) $\displaystyle\int_{-3}^{3} \abs{x}\,dx$

**(a)** Every term changes sign with $x$: $(-x)^3 - 4(-x) + \sin(-x) = -\big(x^3 - 4x + \sin x\big)$. The integrand is odd, so the integral is 0. You do not even need to know how to integrate $\sin x$.

**(b)** Split the integrand into an even part and an odd part, by linearity:

$$\begin{aligned} &\int_{-1}^{1} \big(3x^2 + 5x^3 - 2\big)\,dx \\[5pt] &\quad= \int_{-1}^{1} \big(3x^2 - 2\big)\,dx + 5\int_{-1}^{1} x^3\,dx. \end{aligned}$$

The second integral is 0, since $x^3$ is odd. The first integrand is even, so the first integral is $2\int_0^1 \big(3x^2 - 2\big)\,dx = 2\big(3 \cdot \tfrac13 - 2 \cdot 1\big) = 2(1 - 2) = -2$. The integral is $-2$.

**(c)** $(-x)^2\sin(-x) = -x^2\sin x$, so the integrand is odd and the integral is 0. In general, a product of an even function and an odd function is odd.

**(d)** $\abs{x}$ is even, so the integral is $2\int_0^3 x\,dx = 2 \cdot \tfrac92 = 9$, the area of a triangle with base 3 and height 3 doubled.

```check
fa = x**3 - 4*x + sin(x); same(fa.subs(x, -x), -fa); same(integrate(fa, (x, -2, 2)), 0)
same(integrate(3*x**2 + 5*x**3 - 2, (x, -1, 1)), integrate(3*x**2 - 2, (x, -1, 1)) + 5*integrate(x**3, (x, -1, 1)))
same((3*x**2 - 2).subs(x, -x), 3*x**2 - 2); same(integrate(x**3, (x, -1, 1)), 0)
steps(2*Integral(3*x**2 - 2, (x, 0, 1)), 2*(3*Rational(1, 3) - 2*1), 2*(1 - 2), -2); same(integrate(3*x**2 + 5*x**3 - 2, (x, -1, 1)), -2)
same((x**2*sin(x)).subs(x, -x), -x**2*sin(x)); same(integrate(x**2*sin(x), (x, -pi, pi)), 0)
same(2*integrate(x, (x, 0, 3)), 9); same(2*Rational(9, 2), 9); same(integrate(Abs(x), (x, -3, 3)), 9)
```
:::

::: pitfall
Symmetry needs an interval symmetric about 0: $\int_0^1 x^3\,dx$ is not 0 but $\tfrac14$ (Exercise 9.5), because on $[0, 1]$ the odd function $x^3$ is positive. And an integral of 0 over $[-a, a]$ does not make a function odd: $\int_{-1}^{1} \big(x^2 - \tfrac13\big)\,dx = \tfrac23 - \tfrac23 = 0$, but $x^2 - \tfrac13$ is even.

```check
same(integrate(x**3, (x, 0, 1)), Rational(1, 4)); same(integrate(x**2, (x, -1, 1)), Rational(2, 3)); same(integrate(Rational(1, 3), (x, -1, 1)), Rational(2, 3))
same(integrate(x**2 - Rational(1, 3), (x, -1, 1)), 0)
```
:::

## The average value of a function {#average}

The average of $n$ numbers $y_1, \dots, y_n$ is $\tfrac{y_1 + \dots + y_n}{n}$. But what is the average temperature over a day, when the temperature takes infinitely many values? Sample it. Take the right ends $x_1, \dots, x_n$ of the $n$ equal subintervals of $[a, b]$ and average the values of $f$ there. Multiplying and dividing by $b - a$, and using $\Delta x = \tfrac{b - a}{n}$,

$$\begin{aligned} &\frac{f(x_1) + \dots + f(x_n)}{n} \\[5pt] &\quad= \frac{1}{b - a}\sum_{i=1}^{n} f(x_i)\,\frac{b - a}{n} = \frac{R_n}{b - a}. \end{aligned}$$

As $n$ grows, these sample averages approach $\tfrac{1}{b - a}\int_a^b f(x)\,dx$, by Theorem 9.4.

::: definition Average value
The **average value** of a function $f$ integrable on $[a, b]$, where $a < b$, is

$$f_{\text{avg}} = \frac{1}{b - a}\int_a^b f(x)\,dx,$$

read "f average".
:::

Rearranged, $f_{\text{avg}}(b - a) = \int_a^b f(x)\,dx$: when $f \ge 0$, the rectangle of height $f_{\text{avg}}$ on $[a, b]$ has the same area as the region under the graph (Figure 9.5). For example, the average value of $x^2$ on $[0, 1]$ is $\tfrac13$, and on $[0, 2]$ it is $\tfrac12 \cdot \tfrac83 = \tfrac43$.

```check
same(Rational(1, 2)*Rational(8, 3), Rational(4, 3)); same(integrate(x**2, (x, 0, 2))/2, Rational(4, 3))
```

::: example The average velocity of a falling ball
Find the average value of the velocity $v(t) = 9.8t$ of the falling ball over $[0, 3]$ and over $[1, 3]$, and compare with Module 1.

On $[0, 3]$ the region under the graph of $v$ is a triangle with base 3 and height $v(3) = 29.4$, of area $\tfrac12 \cdot 3 \cdot 29.4 = 44.1$, so

$$v_{\text{avg}} = \frac13 \cdot 44.1 = 14.7 \text{ m/s}.$$

On $[1, 3]$ the region is a trapezoid with parallel sides $v(1) = 9.8$ and $v(3) = 29.4$, a distance 2 apart, of area $\tfrac{(9.8 + 29.4) \cdot 2}{2} = 39.2$, so $v_{\text{avg}} = \tfrac{39.2}{2} = 19.6$ m/s.

[Section 1.6](module_01_EN.html#rates) found that the ball falls $s(3) - s(1) = 39.2$ m between $t = 1$ and $t = 3$, an average speed of 19.6 m/s: the same number. The average value of the velocity over an interval is the average velocity, displacement divided by time, as it should be.

```check
v912 = Rational(98, 10)*t
same(v912.subs(t, 3), Rational(294, 10)); same(Rational(1, 2)*3*Rational(294, 10), Rational(441, 10)); same(Rational(441, 10)/3, Rational(147, 10))
same((Rational(98, 10) + Rational(294, 10))*2/2, Rational(392, 10)); same(Rational(392, 10)/2, Rational(196, 10))
same(integrate(v912, (t, 0, 3))/3, Rational(147, 10)); same(integrate(v912, (t, 1, 3))/2, Rational(196, 10))
s912 = Rational(49, 10)*t**2; same(s912.subs(t, 3) - s912.subs(t, 1), Rational(392, 10))
```
:::

The ball's velocity takes the value 19.6 m/s at $t = 2$, in the middle of $[1, 3]$: the velocity reaches its average value. A continuous function always does.

::: theorem The Mean Value Theorem for integrals
If $f$ is continuous on $[a, b]$, where $a < b$, then there is a number $c$ in $[a, b]$ such that

$$f(c) = \frac{1}{b - a}\int_a^b f(x)\,dx,$$

that is, $\int_a^b f(x)\,dx = f(c)(b - a)$.
:::

::: proof
Since $f$ is continuous, it is integrable (Theorem 9.3), and by the Extreme Value Theorem (Module 3) it has a minimum value $m = f(d)$ and a maximum value $M = f(e)$ on $[a, b]$, for some numbers $d$ and $e$ in $[a, b]$. Since $m \le f(x) \le M$ on $[a, b]$, the comparison theorem gives $m(b - a) \le \int_a^b f(x)\,dx \le M(b - a)$, and dividing by $b - a > 0$,

$$m \le f_{\text{avg}} \le M.$$

If $f_{\text{avg}} = m$, take $c = d$; if $f_{\text{avg}} = M$, take $c = e$. Otherwise $f_{\text{avg}}$ lies strictly between $f(d)$ and $f(e)$, and $f$ is continuous on the closed interval with ends $d$ and $e$, so the Intermediate Value Theorem (Module 3) gives a number $c$ strictly between $d$ and $e$, and so in $[a, b]$, with $f(c) = f_{\text{avg}}$.
:::

Continuity is needed, for both theorems of Module 3 that the proof uses. Without it the conclusion can fail: the function equal to 0 on $[0, 1)$ and to 1 on $[1, 2]$ is integrable, with one jump, and its integral over $[0, 2]$ is the area of a square of side 1. So its average value on $[0, 2]$ is $\tfrac12$, a value it never takes.

```check
fj = Piecewise((0, x < 1), (1, True)); same(integrate(fj, (x, 0, 2)), 1); same(integrate(fj, (x, 0, 2))/2, Rational(1, 2))
```

::: figure id=fig-09-5
The average value of $f(x) = x^2$ on $[-2, 2]$ is $\tfrac43$ (Example 9.13). The dashed rectangle of height $\tfrac43$ on $[-2, 2]$ has the same area, $\tfrac{16}{3}$, as the shaded region under the graph: the parts of the region that rise above the rectangle have the same area as the parts of the rectangle that the region leaves empty. The graph reaches the height $\tfrac43$ at two points, $c = \pm\tfrac{2}{\sqrt3}$.
:::

::: example Where the average is reached
Find the average value of $f(x) = x^2$ on $[-2, 2]$, and every number $c$ in $[-2, 2]$ with $f(c) = f_{\text{avg}}$. Then do the same on $[0, 1]$.

The function $x^2$ is even, so by Theorem 9.8 and Section 9.4, $\int_{-2}^{2} x^2\,dx = 2\int_0^2 x^2\,dx = 2 \cdot \tfrac83 = \tfrac{16}{3}$. The interval has length 4, so $f_{\text{avg}} = \tfrac14 \cdot \tfrac{16}{3} = \tfrac43$. Solving $c^2 = \tfrac43$ gives $c = \pm\tfrac{2}{\sqrt3} \approx \pm1.155$, and both are in $[-2, 2]$. The theorem promises at least one $c$; here there are two.

On $[0, 1]$, $f_{\text{avg}} = \int_0^1 x^2\,dx = \tfrac13$, and $c^2 = \tfrac13$ with $c$ in $[0, 1]$ gives $c = \tfrac{1}{\sqrt3} \approx 0.577$. Notice that $c$ is not the midpoint $\tfrac12$ of the interval: the average value of $x^2$ on $[0, 1]$ is not its value at the midpoint, which is $\tfrac14$.

```check
same(2*integrate(x**2, (x, 0, 2)), Rational(16, 3)); same(integrate(x**2, (x, -2, 2)), Rational(16, 3)); same(Rational(1, 4)*Rational(16, 3), Rational(4, 3))
same_set(solve(x**2 - Rational(4, 3), x), [2/sqrt(3), -2/sqrt(3)]); rounds(2/sqrt(3), '1.155'); holds(2/sqrt(3) < 2)
same_set([r_ for r_ in solve(x**2 - Rational(1, 3), x) if r_ >= 0], [1/sqrt(3)]); rounds(1/sqrt(3), '0.577')
same((x**2).subs(x, Rational(1, 2)), Rational(1, 4))
```
:::

::: pitfall
The average value of $f$ is not the average of its values at the ends of the interval. For $x^2$ on $[0, 1]$, $\tfrac{f(0) + f(1)}{2} = \tfrac12$, while $f_{\text{avg}} = \tfrac13$. The two agree for linear functions, such as the velocity $9.8t$ of Example 9.12, but not in general: the average value takes every value of $f$ into account.
:::

## A faster way is coming {#faster-way}

Here are the exact integrals of this module, from 0 to $b$, for $b > 0$:

| $f(x)$ | $\displaystyle\int_0^b f(x)\,dx$ | Found in |
|---|---|---|
| $x$ | $\dfrac{b^2}{2}$ | a triangle |
| $x^2$ | $\dfrac{b^3}{3}$ | Section 9.3 |
| $x^3$ | $\dfrac{b^4}{4}$ | Exercise 9.5 |
| $9.8x$ | $4.9b^2$ | a triangle, Section 9.1 |

Treat each answer as a function of the upper limit $b$, and differentiate it with the [power rule](module_04_EN.html#power-rule) of Module 4: $\big(\tfrac{b^2}{2}\big)' = b$, $\big(\tfrac{b^3}{3}\big)' = b^2$, $\big(\tfrac{b^4}{4}\big)' = b^3$ and $\big(4.9b^2\big)' = 9.8b$. Each time the integrand comes back, with $b$ in place of $x$. For the falling ball this is no surprise: the area under the velocity graph up to time $b$ is the distance fallen, $s(b) = 4.9b^2$, and the derivative of the distance is the velocity.

```check
for F_, f_ in ((bp**2/2, x), (bp**3/3, x**2), (bp**4/4, x**3), (Rational(49, 10)*bp**2, Rational(98, 10)*x)):
    same(integrate(f_, (x, 0, bp)), F_); same(diff(F_, bp), f_.subs(x, bp))
```

The pattern is the **Fundamental Theorem of Calculus**, the subject of Module 10: integration and differentiation undo each other, as the speedometer and odometer of [Section 1.1](module_01_EN.html#about) suggested. In its most used form it says that if $f$ is continuous on $[a, b]$ and $F$ is a function with $F' = f$ there, then

$$\int_a^b f(x)\,dx = F(b) - F(a).$$

With it, $\int_0^1 x^2\,dx = \tfrac{1^3}{3} - \tfrac{0^3}{3} = \tfrac13$ takes one line, with no sums and no limits. It also reaches integrals that this module could only estimate. Since $(\ln x)' = \tfrac1x$ for $x > 0$ (Module 6), $\int_1^2 \tfrac{dx}{x} = \ln 2 - \ln 1 = \ln 2 \approx 0.693147$, the number that the sums of Example 9.4 approached; and since $(-\cos x)' = \sin x$ ([Module 5](module_05_EN.html#trig)), $\int_0^\pi \sin x\,dx = -\cos\pi + \cos 0 = 2$.

```check
same(diff(log(x), x), 1/x); same(log(2) - log(1), log(2)); same(diff(-cos(x), x), sin(x)); same(-cos(pi) + cos(0), 2)
rounds(log(2), '0.693147'); same(integrate(1/x, (x, 1, 2)), log(2))
same(integrate(sin(x), (x, 0, pi)), 2); same(Rational(1, 3) - 0, integrate(x**2, (x, 0, 1)))
```

Riemann sums remain essential all the same. They define the integral; they turn real problems (areas, distances, energy, averages, and in Module 12 volumes, work and probabilities) into integrals; and where $F$ has no formula built from the familiar functions, as for $e^{-x^2}$, they compute integrals numerically (Module 11).

## What you learned {#summary}

- The area under a curve and the distance travelled at a changing speed are the same problem: cut the interval into short pieces, approximate each piece by a rectangle, add up, and let the pieces shrink.
- Sigma notation writes $a_m + \dots + a_n$ as $\sum_{i=m}^{n} a_i$; sums split over $+$ and $-$, and constants come out. $\sum i = \tfrac{n(n+1)}{2}$, $\sum i^2 = \tfrac{n(n+1)(2n+1)}{6}$ and $\sum i^3 = \big(\tfrac{n(n+1)}{2}\big)^2$, proved by pairing, by a telescoping sum and by induction.
- The left, right and midpoint sums $L_n$, $R_n$ and $M_n$ take heights at the left ends, right ends or midpoints of $n$ equal subintervals of width $\Delta x = \tfrac{b - a}{n}$. For a continuous increasing $f$, $L_n \le \int_a^b f \le R_n$; for a continuous decreasing $f$, the other way round. For $x^2$ on $[0, 1]$, the errors of $L_n$ and $R_n$ shrink like $\tfrac1n$ and that of $M_n$ like $\tfrac{1}{n^2}$.
- The definite integral $\int_a^b f(x)\,dx$ is the limit of Riemann sums $\sum f(x_i^*)\,\Delta x_i$ as the norm of the partition shrinks to 0, for every choice of sample points. Continuous functions, and bounded functions with finitely many discontinuities, are integrable, and then $\int_a^b f = \lim L_n = \lim R_n = \lim M_n$. Exact limits gave $\int_0^b x^2\,dx = \tfrac{b^3}{3}$.
- The integral is a signed area: area above the axis counts as positive, area below as negative. The total area is $\int_a^b \abs{f}$. The integral of a velocity is a displacement; the distance travelled is the integral of the speed $\abs{v}$.
- The integral is linear, additive over intervals ($\int_a^b f + \int_b^c f = \int_a^c f$, with $\int_b^a f = -\int_a^b f$), and respects inequalities: $m(b - a) \le \int_a^b f \le M(b - a)$ when $m \le f \le M$ on $[a, b]$, $a < b$.
- Areas of triangles, trapezoids and discs give integrals directly; over $[-a, a]$, odd functions integrate to 0 and even functions to twice their integral over $[0, a]$.
- The average value of $f$ on $[a, b]$ is $\tfrac{1}{b - a}\int_a^b f(x)\,dx$, and a continuous function takes its average value somewhere in $[a, b]$ (the Mean Value Theorem for integrals).
- Differentiating $\int_0^b x^2\,dx = \tfrac{b^3}{3}$ with respect to $b$ gives back $b^2$: a first sight of the Fundamental Theorem of Calculus, Module 10.

## Exercises {#exercises}

:::: exercise Sigma notation {#ex-9-1} ★
- (a) Write out and evaluate $\sum_{i=1}^{5} (2i + 1)$ and $\sum_{k=0}^{4} 3^k$.
- (b) Write $2 + 4 + 6 + \dots + 100$ in sigma notation, and evaluate it with Theorem 9.2.
- (c) Use the rules for sums and Theorem 9.2 to evaluate $\sum_{i=1}^{10} \big(i^2 - 3i + 2\big)$.

::: solution
**(a)** $\sum_{i=1}^{5} (2i + 1) = 3 + 5 + 7 + 9 + 11 = 35$, and $\sum_{k=0}^{4} 3^k = 1 + 3 + 9 + 27 + 81 = 121$. The second sum has five terms, since $k$ starts at 0.

**(b)** The even number with index $i$ is $2i$, and $2i = 100$ at $i = 50$, so the sum is $\sum_{i=1}^{50} 2i$. By the first rule for sums and Theorem 9.2,

$$\begin{aligned} \sum_{i=1}^{50} 2i &= 2\sum_{i=1}^{50} i \\[5pt] &= 2 \cdot \frac{50 \cdot 51}{2} = 2550. \end{aligned}$$

**(c)** Split the sum and use Theorem 9.2 with $n = 10$:

$$\begin{aligned} &\sum_{i=1}^{10} \big(i^2 - 3i + 2\big) \\[5pt] &\quad= \sum_{i=1}^{10} i^2 - 3\sum_{i=1}^{10} i + \sum_{i=1}^{10} 2 \\[5pt] &\quad= 385 - 3 \cdot 55 + 2 \cdot 10 = 240. \end{aligned}$$

A common slip is to write $\sum_{i=1}^{10} 2 = 2$; it is $2 + 2 + \dots + 2 = 20$. Check by another route: $i^2 - 3i + 2 = (i - 1)(i - 2)$, whose values for $i = 1, \dots, 10$ are $0, 0, 2, 6, 12, 20, 30, 42, 56, 72$, with sum 240.

```check
same(summation(2*i + 1, (i, 1, 5)), 35); same(3 + 5 + 7 + 9 + 11, 35)
same(summation(3**k, (k, 0, 4)), 121); same(1 + 3 + 9 + 27 + 81, 121)
same(solve(2*x - 100, x), [50]); steps(summation(2*i, (i, 1, 50)), 2*Rational(50*51, 2), 2550); same(sum(range(2, 101, 2)), 2550)
steps(summation(i**2 - 3*i + 2, (i, 1, 10)), 385 - 3*55 + 2*10, 240)
same(factor(i**2 - 3*i + 2), (i - 1)*(i - 2)); same([(j - 1)*(j - 2) for j in range(1, 11)], [0, 0, 2, 6, 12, 20, 30, 42, 56, 72])
same(sum([0, 0, 2, 6, 12, 20, 30, 42, 56, 72]), 240); same(summation(2, (i, 1, 10)), 20)
```
:::
::::

:::: exercise Riemann sums by hand {#ex-9-2} ★
Let $f(x) = 4 - x^2$ on $[0, 2]$.

- (a) Compute $L_4$, $R_4$ and $M_4$.
- (b) Which of them is certainly larger than the area under the graph, and which certainly smaller? Why?
- (c) Use linearity and $\int_0^b x^2\,dx = \tfrac{b^3}{3}$ to find the area exactly. Which of the three sums is closest?

::: solution
**(a)** $\Delta x = \tfrac{2 - 0}{4} = 0.5$. The cut points $0, 0.5, 1, 1.5, 2$ give the values $4, 3.75, 3, 1.75, 0$, so

$$\begin{aligned} L_4 &= 0.5(4 + 3.75 + 3 + 1.75) \\ &= 0.5 \cdot 12.5 = 6.25, \\ R_4 &= 0.5(3.75 + 3 + 1.75 + 0) \\ &= 0.5 \cdot 8.5 = 4.25. \end{aligned}$$

The midpoints $0.25, 0.75, 1.25, 1.75$ give the values $3.9375, 3.4375, 2.4375, 0.9375$, with sum $10.75$, so $M_4 = 0.5 \cdot 10.75 = 5.375$.

**(b)** On $[0, 2]$, $x^2$ increases, so $4 - x^2$ decreases. On each subinterval its value at the left end is its largest, so $L_4 = 6.25$ is larger than the area, and its value at the right end is its smallest, so $R_4 = 4.25$ is smaller. This argument says nothing about $M_4$.

**(c)** By linearity,

$$\begin{aligned} &\int_0^2 \big(4 - x^2\big)\,dx \\[5pt] &\quad= \int_0^2 4\,dx - \int_0^2 x^2\,dx \\[5pt] &\quad= 8 - \frac83 = \frac{16}{3} \approx 5.333. \end{aligned}$$

$M_4 = 5.375$ is the closest, too large by $\tfrac{43}{8} - \tfrac{16}{3} = \tfrac{1}{24} \approx 0.042$; $L_4$ is too large by $\tfrac{11}{12} \approx 0.917$, and $R_4$ too small by $\tfrac{13}{12} \approx 1.083$. The midpoint sum overestimates here because the graph bends downwards; Module 11 explains the connection.

```check
f2 = 4 - x9**2
same([f2.subs(x9, v_) for v_ in (0, Rational(1, 2), 1, Rational(3, 2), 2)], [4, Rational(375, 100), 3, Rational(175, 100), 0])
steps(Lsum(f2, 0, 2, 4), Rational(1, 2)*Rational(125, 10), Rational(625, 100)); steps(Rsum(f2, 0, 2, 4), Rational(1, 2)*Rational(85, 10), Rational(425, 100))
same([f2.subs(x9, v_) for v_ in (Rational(1, 4), Rational(3, 4), Rational(5, 4), Rational(7, 4))], [Rational(39375, 10000), Rational(34375, 10000), Rational(24375, 10000), Rational(9375, 10000)])
steps(Msum(f2, 0, 2, 4), Rational(1, 2)*Rational(1075, 100), Rational(5375, 1000))
steps(Integral(4 - x**2, (x, 0, 2)), Integral(4, (x, 0, 2)) - Integral(x**2, (x, 0, 2)), 8 - Rational(8, 3), Rational(16, 3)); rounds(Rational(16, 3), '5.333')
same(Rational(5375, 1000), Rational(43, 8)); steps(Rational(43, 8) - Rational(16, 3), Rational(1, 24)); rounds(Rational(1, 24), '0.042')
same(Rational(625, 100) - Rational(16, 3), Rational(11, 12)); rounds(Rational(11, 12), '0.917')
same(Rational(16, 3) - Rational(425, 100), Rational(13, 12)); rounds(Rational(13, 12), '1.083')
```
:::
::::

:::: exercise A car slowing down {#ex-9-3} ★
A driver brakes, and a passenger reads the speedometer every 5 seconds until the car stops. The readings, converted to metres per second, are made up:

| Time $t$ (s) | Speed $v$ (m/s) |
|---|---|
| 0 | 20 |
| 5 | 18 |
| 10 | 15 |
| 15 | 11 |
| 20 | 6 |
| 25 | 0 |

- (a) Find the left and right sums. Which of them is an upper estimate of the braking distance, and why?
- (b) How often would the speedometer have to be read for the two estimates to differ by at most 20 m?

::: solution
**(a)** With $\Delta t = 5$ s,

$$\begin{aligned} L &= 5(20 + 18 + 15 + 11 + 6) \\ &= 5 \cdot 70 = 350 \text{ m}, \\ R &= 5(18 + 15 + 11 + 6 + 0) \\ &= 5 \cdot 50 = 250 \text{ m}. \end{aligned}$$

The car slows down throughout, so during each interval its speed is at most the reading at the start of the interval and at least the reading at the end. So the left sum, 350 m, is the upper estimate, and the right sum, 250 m, the lower one: the braking distance is between 250 m and 350 m. This is the opposite of Example 9.2, where the car sped up.

**(b)** As in Example 9.2, every reading except the first and the last appears in both sums, so with readings every $\Delta t$ seconds

$$\begin{aligned} L - R &= \Delta t\,\big(v(0) - v(25)\big) \\ &= 20\,\Delta t. \end{aligned}$$

This is at most 20 m when $\Delta t \le 1$: the speedometer must be read at least every second.

```check
V3 = [20, 18, 15, 11, 6, 0]
same(sum(V3[:5]), 70); same(5*sum(V3[:5]), 350); same(sum(V3[1:]), 50); same(5*sum(V3[1:]), 250)
same(5*sum(V3[:5]) - 5*sum(V3[1:]), 5*(V3[0] - V3[-1])); same(solve(Eq(20*t, 20), t), [1])
```
:::
::::

:::: exercise Integrals from areas {#ex-9-4} ★
Evaluate each integral by interpreting it as a signed area, or with symmetry.

- (a) $\displaystyle\int_1^4 (3 - x)\,dx$
- (b) $\displaystyle\int_{-2}^{4} \abs{x}\,dx$
- (c) $\displaystyle\int_0^3 \sqrt{9 - x^2}\,dx$
- (d) $\displaystyle\int_{-2}^{2} \big(x\cos x + 3\big)\,dx$

::: solution
**(a)** The line $y = 3 - x$ is above the axis on $[1, 3)$ and below it on $(3, 4]$. Above: a triangle with base 2 and height $f(1) = 2$, of area 2. Below: a triangle with base 1 and height $\abs{f(4)} = 1$, of area $\tfrac12$. The integral is $2 - \tfrac12 = \tfrac32$.

**(b)** Two triangles: over $[-2, 0]$, base 2 and height 2, area 2; over $[0, 4]$, base 4 and height 4, area 8. The integral is $2 + 8 = 10$.

**(c)** $y = \sqrt{9 - x^2}$ is the upper half of the circle $x^2 + y^2 = 9$, of radius 3. From $x = 0$ to $x = 3$ it bounds a quarter disc, of area $\tfrac14\pi \cdot 3^2 = \tfrac{9\pi}{4} \approx 7.069$.

**(d)** By linearity the integral is $\int_{-2}^{2} x\cos x\,dx + \int_{-2}^{2} 3\,dx$. The function $x\cos x$ is odd, since $(-x)\cos(-x) = -x\cos x$ (cosine is even), so its integral over $[-2, 2]$ is 0. The second integral is $3 \cdot 4 = 12$. The answer is 12.

```check
same(Rational(1, 2)*2*2 - Rational(1, 2)*1*1, Rational(3, 2)); same(integrate(3 - x, (x, 1, 4)), Rational(3, 2))
same(integrate(Abs(x), (x, -2, 4)), 10)
same(Rational(1, 4)*pi*3**2, 9*pi/4); same(integrate(sqrt(9 - x**2), (x, 0, 3)), 9*pi/4); rounds(9*pi/4, '7.069')
same((x*cos(x)).subs(x, -x), -x*cos(x)); same(integrate(x*cos(x), (x, -2, 2)), 0); same(integrate(x*cos(x) + 3, (x, -2, 2)), 12)
```
:::
::::

:::: exercise The integral of $x^3$ {#ex-9-5} ★★
- (a) Show that the right sum of $f(x) = x^3$ on $[0, 2]$ with $n$ subintervals is $R_n = 4\big(1 + \tfrac1n\big)^2$.
- (b) Deduce that $\displaystyle\int_0^2 x^3\,dx = 4$.
- (c) Show in the same way that $\displaystyle\int_0^b x^3\,dx = \frac{b^4}{4}$ for every $b > 0$, and find $\displaystyle\int_0^1 x^3\,dx$ and $\displaystyle\int_1^2 x^3\,dx$.

::: solution
**(a)** $\Delta x = \tfrac2n$ and $x_i = \tfrac{2i}{n}$, so $f(x_i) = \tfrac{8i^3}{n^3}$. By the first rule for sums and the formula for $\sum i^3$,

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\frac{8i^3}{n^3}\cdot\frac2n = \frac{16}{n^4}\sum_{i=1}^{n} i^3 \\[5pt] &= \frac{16}{n^4}\cdot\frac{n^2(n + 1)^2}{4} \\[5pt] &= \frac{4(n + 1)^2}{n^2} = 4\Big(1 + \frac1n\Big)^2. \end{aligned}$$

**(b)** $x^3$ is continuous, so it is integrable on $[0, 2]$ (Theorem 9.3), and by Theorem 9.4 its integral is $\lim_{n\to\infty} R_n = 4 \cdot (1 + 0)^2 = 4$.

**(c)** Now $\Delta x = \tfrac{b}{n}$ and $x_i = \tfrac{ib}{n}$, so

$$\begin{aligned} R_n &= \frac{b^4}{n^4}\sum_{i=1}^{n} i^3 \\[5pt] &= \frac{b^4}{n^4}\cdot\frac{n^2(n + 1)^2}{4} \\[5pt] &= \frac{b^4}{4}\Big(1 + \frac1n\Big)^2, \end{aligned}$$

which approaches $\tfrac{b^4}{4}$. With $b = 1$, $\int_0^1 x^3\,dx = \tfrac14$. By additivity, $\int_1^2 x^3\,dx = \int_0^2 x^3\,dx - \int_0^1 x^3\,dx = 4 - \tfrac14 = \tfrac{15}{4}$.

```check
same((2*i/n)**3, 8*i**3/n**3)
steps(Sum(8*i**3/n**3*2/n, (i, 1, n)), 16/n**4*Sum(i**3, (i, 1, n)), 16/n**4*(n**2*(n + 1)**2/4), 4*(n + 1)**2/n**2, 4*(1 + 1/n)**2)
same(limit(4*(1 + 1/n)**2, n, oo), 4); same(integrate(x**3, (x, 0, 2)), 4)
steps(Sum((i*bp/n)**3*bp/n, (i, 1, n)), bp**4/n**4*Sum(i**3, (i, 1, n)), bp**4/n**4*(n**2*(n + 1)**2/4), bp**4/4*(1 + 1/n)**2)
same(limit(bp**4/4*(1 + 1/n)**2, n, oo), bp**4/4); same(integrate(x**3, (x, 0, bp)), bp**4/4)
same(integrate(x**3, (x, 0, 1)), Rational(1, 4)); same(4 - Rational(1, 4), Rational(15, 4)); same(integrate(x**3, (x, 1, 2)), Rational(15, 4))
```
:::
::::

:::: exercise A signed area two ways {#ex-9-6} ★★
- (a) Find $\displaystyle\int_1^4 (2x - 3)\,dx$ as the limit of right sums.
- (b) Check your answer with geometry: sketch the graph and find the areas of the triangles that it forms with the $x$-axis. What is the total area between the graph and the axis?

::: solution
**(a)** $\Delta x = \tfrac3n$ and $x_i = 1 + \tfrac{3i}{n}$, so $f(x_i) = 2 + \tfrac{6i}{n} - 3 = \tfrac{6i}{n} - 1$, and

$$\begin{aligned} R_n &= \sum_{i=1}^{n}\Big(\frac{6i}{n} - 1\Big)\frac3n \\[5pt] &= \frac{18}{n^2}\sum_{i=1}^{n} i - \frac3n\sum_{i=1}^{n} 1 \\[5pt] &= \frac{18}{n^2}\cdot\frac{n(n + 1)}{2} - 3 \\[5pt] &= \frac{9(n + 1)}{n} - 3. \end{aligned}$$

As $n \to \infty$, $\tfrac{n + 1}{n} \to 1$, so $\int_1^4 (2x - 3)\,dx = 9 - 3 = 6$.

**(b)** The line $y = 2x - 3$ crosses the axis at $x = \tfrac32$. On $\big[1, \tfrac32\big]$ it is below the axis, forming a triangle with base $\tfrac12$ and height $\abs{f(1)} = 1$, of area $\tfrac14$. On $\big[\tfrac32, 4\big]$ it is above, forming a triangle with base $\tfrac52$ and height $f(4) = 5$, of area $\tfrac{25}{4}$. The signed area is $\tfrac{25}{4} - \tfrac14 = 6$, as in (a). The total area is $\tfrac{25}{4} + \tfrac14 = \tfrac{13}{2}$.

```check
same(expand(2*(1 + 3*i/n) - 3), 6*i/n - 1)
steps(Sum((6*i/n - 1)*3/n, (i, 1, n)), 18/n**2*Sum(i, (i, 1, n)) - 3/n*Sum(1, (i, 1, n)), 18/n**2*(n*(n + 1)/2) - 3, 9*(n + 1)/n - 3)
same(limit(9*(n + 1)/n - 3, n, oo), 6); same(integrate(2*x - 3, (x, 1, 4)), 6)
same(solve(2*x - 3, x), [Rational(3, 2)]); same(Rational(1, 2)*Rational(1, 2)*1, Rational(1, 4)); same(Rational(1, 2)*Rational(5, 2)*5, Rational(25, 4))
same(Rational(25, 4) - Rational(1, 4), 6); same(Rational(25, 4) + Rational(1, 4), Rational(13, 2)); same(integrate(Abs(2*x - 3), (x, 1, 4)), Rational(13, 2))
```
:::
::::

:::: exercise There and back again {#ex-9-7} ★★
The particle of [Example 4.10](module_04_EN.html#motion) has position $s(t) = t^3 - 6t^2 + 9t$ metres and velocity $v(t) = 3t^2 - 12t + 9$ m/s; it is at rest at $t = 1$ and $t = 3$, and moves backwards in between.

- (a) Use linearity with $\int_0^b t^2\,dt = \tfrac{b^3}{3}$ and $\int_0^b t\,dt = \tfrac{b^2}{2}$ to find $\int_0^b v(t)\,dt$ for $b > 0$. Compare it with $s(b) - s(0)$.
- (b) Use additivity to find $\int_0^1 v(t)\,dt$, $\int_1^3 v(t)\,dt$ and $\int_3^4 v(t)\,dt$. Find the displacement and the distance travelled in the first 4 seconds, and compare with Module 4.

::: solution
**(a)** By linearity, with $\int_0^b 9\,dt = 9b$,

$$\begin{aligned} &\int_0^b v(t)\,dt \\[5pt] &\quad= 3\int_0^b t^2\,dt - 12\int_0^b t\,dt \\[5pt] &\qquad + \int_0^b 9\,dt \\[5pt] &\quad= 3\cdot\frac{b^3}{3} - 12\cdot\frac{b^2}{2} + 9b \\[5pt] &\quad= b^3 - 6b^2 + 9b. \end{aligned}$$

That is $s(b)$, and $s(0) = 0$: the integral of the velocity from 0 to $b$ is the displacement $s(b) - s(0)$, as Section 9.4 said.

**(b)** Write $F(b) = \int_0^b v(t)\,dt = b^3 - 6b^2 + 9b$, so that $F(1) = 4$, $F(3) = 0$ and $F(4) = 4$. By additivity, $\int_p^q v = F(q) - F(p)$ for $0 \le p < q$, so

$$\begin{aligned} \int_0^1 v\,dt &= 4, \\[5pt] \int_1^3 v\,dt &= 0 - 4 = -4, \\[5pt] \int_3^4 v\,dt &= 4 - 0 = 4. \end{aligned}$$

The displacement over $[0, 4]$ is $4 - 4 + 4 = 4$ m. The velocity is negative only on $(1, 3)$, so the distance travelled is $\int_0^4 \abs{v}\,dt = 4 + 4 + 4 = 12$ m. These are the numbers of Example 4.10: the particle goes forwards 4 m, back 4 m and forwards 4 m again, covering 12 m of ground and ending 4 m from where it started.

```check
v7 = 3*t**2 - 12*t + 9; s7 = t**3 - 6*t**2 + 9*t
steps(Integral(v7, (t, 0, bp)), 3*Integral(t**2, (t, 0, bp)) - 12*Integral(t, (t, 0, bp)) + Integral(9, (t, 0, bp)), 3*bp**3/3 - 12*bp**2/2 + 9*bp, bp**3 - 6*bp**2 + 9*bp)
same(s7.subs(t, bp) - s7.subs(t, 0), bp**3 - 6*bp**2 + 9*bp)
F7 = lambda T: T**3 - 6*T**2 + 9*T
same([F7(1), F7(3), F7(4)], [4, 0, 4])
same(integrate(v7, (t, 0, 1)), 4); same(integrate(v7, (t, 1, 3)), -4); same(integrate(v7, (t, 3, 4)), 4)
same(integrate(v7, (t, 0, 4)), 4); same(integrate(Abs(v7), (t, 0, 4)), 12)
same(solve_univariate_inequality(v7 < 0, t, relational=False), Interval.open(1, 3))
```
:::
::::

:::: exercise Bounds and average values {#ex-9-8} ★★
- (a) Show that $1 \le \displaystyle\int_0^1 \sqrt{1 + x^2}\,dx \le \sqrt2$.
- (b) Find the average value of $f(x) = 3x^2$ on $[0, 2]$, and the number $c$ in $[0, 2]$ with $f(c) = f_{\text{avg}}$.
- (c) Find the average value of $g(x) = \sqrt{4 - x^2}$ on $[-2, 2]$, and every $c$ in $[-2, 2]$ with $g(c) = g_{\text{avg}}$.

::: solution
**(a)** For $x$ in $[0, 1]$, $0 \le x^2 \le 1$, so $1 \le 1 + x^2 \le 2$, and since the square root is increasing, $1 \le \sqrt{1 + x^2} \le \sqrt2$. Theorem 9.7(c) with $b - a = 1$ gives $1 \le \int_0^1 \sqrt{1 + x^2}\,dx \le \sqrt2 \approx 1.414$.

**(b)** $\int_0^2 3x^2\,dx = 3 \cdot \tfrac83 = 8$, so $f_{\text{avg}} = \tfrac82 = 4$. Then $3c^2 = 4$ gives $c^2 = \tfrac43$; the root in $[0, 2]$ is $c = \tfrac{2}{\sqrt3} \approx 1.155$.

**(c)** $\int_{-2}^{2} \sqrt{4 - x^2}\,dx$ is the area of a half disc of radius 2, which is $2\pi$. The interval has length 4, so $g_{\text{avg}} = \tfrac{2\pi}{4} = \tfrac{\pi}{2} \approx 1.571$. Solve $\sqrt{4 - c^2} = \tfrac{\pi}{2}$: squaring, $4 - c^2 = \tfrac{\pi^2}{4}$, so $c = \pm\sqrt{4 - \tfrac{\pi^2}{4}} \approx \pm1.238$. Both are in $[-2, 2]$, and both satisfy the equation, since the square root of $\tfrac{\pi^2}{4}$ is $\tfrac{\pi}{2}$.

```check
holds(sqrt(2) > 1); rounds(sqrt(2), '1.414')
I8 = Integral(sqrt(1 + x**2), (x, 0, 1)).evalf(20); holds(1 <= I8); holds(I8 <= sqrt(2))
same(integrate(3*x**2, (x, 0, 2)), 8); same(Rational(8, 2), 4)
same_set([r_ for r_ in solve(3*x**2 - 4, x) if r_ >= 0], [2/sqrt(3)]); rounds(2/sqrt(3), '1.155')
same(integrate(sqrt(4 - x**2), (x, -2, 2)), 2*pi); same(2*pi/4, pi/2); rounds(pi/2, '1.571')
same_set(solve(Eq(sqrt(4 - x**2), pi/2), x), [sqrt(4 - pi**2/4), -sqrt(4 - pi**2/4)]); rounds(sqrt(4 - pi**2/4), '1.238')
holds(sqrt(4 - pi**2/4) < 2)
```
:::
::::

:::: exercise Energy from a power log {#ex-9-9} ★★
A program logs a GPU's power draw every 10 seconds during a one-minute job. The readings are made up:

| Time $t$ (s) | Power $P$ (W) |
|---|---|
| 0 | 120 |
| 10 | 180 |
| 20 | 250 |
| 30 | 260 |
| 40 | 240 |
| 50 | 200 |
| 60 | 150 |

Energy is power accumulated over time: one watt for one second is one joule (J), so the job uses $E = \int_0^{60} P(t)\,dt$ joules.

- (a) Estimate $E$ with the left sum and with the right sum.
- (b) Can you conclude that $E$ lies between the two? Explain.
- (c) Estimate the average power during the job, and the energy in watt-hours, from the average of the two sums ($1$ Wh $= 3600$ J).

::: solution
**(a)** With $\Delta t = 10$ s,

$$\begin{aligned} L &= 10(120 + 180 + 250 \\ &\qquad + 260 + 240 + 200) \\ &= 10 \cdot 1250 = 12{,}500 \text{ J}, \\ R &= 10(180 + 250 + 260 \\ &\qquad + 240 + 200 + 150) \\ &= 10 \cdot 1280 = 12{,}800 \text{ J}. \end{aligned}$$

**(b)** No. The power rises during the first 30 seconds and falls afterwards. Where it rises, the left reading of an interval is the lower one; where it falls, the left reading is the higher one. So the left sum mixes underestimates with overestimates, and so does the right sum, and neither is guaranteed to be below or above $E$. Worse, ten-second readings say nothing about short spikes between them. Without knowing more about $P$ between the readings (for example, that it rises or falls steadily within each interval), the readings do not bound the energy.

**(c)** The average of the two sums is $12{,}650$ J. The average power is $\tfrac{1}{60}\int_0^{60} P(t)\,dt \approx \tfrac{12{,}650}{60} \approx 210.8$ W, and the energy is about $\tfrac{12{,}650}{3600} \approx 3.51$ Wh.

```check
P9 = [120, 180, 250, 260, 240, 200, 150]
same(sum(P9[:6]), 1250); same(10*sum(P9[:6]), 12500); same(sum(P9[1:]), 1280); same(10*sum(P9[1:]), 12800)
same((12500 + 12800)/Integer(2), 12650); rounds(Rational(12650, 60), '210.8'); rounds(Rational(12650, 3600), '3.51')
holds(P9[3] == max(P9))
```
:::
::::

:::: exercise Sums by induction and by telescoping {#ex-9-10} ★★★
- (a) Prove the formula $\sum_{i=1}^{n} i^2 = \dfrac{n(n + 1)(2n + 1)}{6}$ by induction.
- (b) Show that $i(i + 1)(i + 2) - (i - 1)i(i + 1) = 3i(i + 1)$, and use it to prove that
  $$\sum_{i=1}^{n} i(i + 1) = \frac{n(n + 1)(n + 2)}{3}.$$
- (c) Use (b) and the formula for $\sum i$ to give a third proof of the formula for $\sum i^2$.

::: solution
**(a)** *Base case.* For $n = 1$ both sides are 1: $\tfrac{1 \cdot 2 \cdot 3}{6} = 1$.

*Inductive step.* Suppose the formula holds for some $k \ge 1$. Adding the next term and taking out the common factor $k + 1$,

$$\begin{aligned} &\sum_{i=1}^{k+1} i^2 \\[5pt] &= \frac{k(k + 1)(2k + 1)}{6} + (k + 1)^2 \\[5pt] &= \frac{k + 1}{6}\big[k(2k + 1) + 6(k + 1)\big] \\[5pt] &= \frac{k + 1}{6}\big(2k^2 + 7k + 6\big) \\[5pt] &= \frac{(k + 1)(k + 2)(2k + 3)}{6}. \end{aligned}$$

This is the formula with $n = k + 1$, since $2(k + 1) + 1 = 2k + 3$. By induction it holds for every $n \ge 1$.

**(b)** Both products on the left contain the factor $i(i + 1)$:

$$\begin{aligned} &i(i + 1)(i + 2) - (i - 1)i(i + 1) \\ &\quad= i(i + 1)\big[(i + 2) - (i - 1)\big] \\ &\quad= 3i(i + 1). \end{aligned}$$

Add this for $i = 1, \dots, n$. The left side telescopes: the term $i(i + 1)(i + 2)$ of each $i$ cancels the term $-(i' - 1)i'(i' + 1)$ of $i' = i + 1$, which is the same product, so only the last positive term and the first negative term remain:

$$\begin{aligned} &\sum_{i=1}^{n}\big[i(i + 1)(i + 2) \\[5pt] &\qquad - (i - 1)i(i + 1)\big] \\[5pt] &\quad= n(n + 1)(n + 2) - 0 \cdot 1 \cdot 2. \end{aligned}$$

So $3\sum_{i=1}^{n} i(i + 1) = n(n + 1)(n + 2)$, which is the formula.

**(c)** Since $i^2 = i(i + 1) - i$, the rules for sums make the sum of the squares equal to the sum in (b) minus $\sum_{i=1}^{n} i$. So, by (b) and Theorem 9.2,

$$\begin{aligned} &\sum_{i=1}^{n} i^2 \\[5pt] &\quad= \frac{n(n + 1)(n + 2)}{3} \\[5pt] &\qquad - \frac{n(n + 1)}{2} \\[5pt] &\quad= \frac{n(n + 1)\big[2(n + 2) - 3\big]}{6} \\[5pt] &\quad= \frac{n(n + 1)(2n + 1)}{6}. \end{aligned}$$

```check
same(S2.subs(n, 1), 1)
steps(k*(k + 1)*(2*k + 1)/6 + (k + 1)**2, (k + 1)/6*(k*(2*k + 1) + 6*(k + 1)), (k + 1)/6*(2*k**2 + 7*k + 6), (k + 1)*(k + 2)*(2*k + 3)/6, S2.subs(n, k + 1))
same(expand(k*(2*k + 1) + 6*(k + 1)), 2*k**2 + 7*k + 6); same(factor(2*k**2 + 7*k + 6), (k + 2)*(2*k + 3))
steps(i*(i + 1)*(i + 2) - (i - 1)*i*(i + 1), i*(i + 1)*((i + 2) - (i - 1)), 3*i*(i + 1))
same(summation(i*(i + 1)*(i + 2) - (i - 1)*i*(i + 1), (i, 1, n)), n*(n + 1)*(n + 2))
same(summation(i*(i + 1), (i, 1, n)), n*(n + 1)*(n + 2)/3)
same(i*(i + 1) - i, i**2); same(summation(i**2, (i, 1, n)), summation(i*(i + 1), (i, 1, n)) - summation(i, (i, 1, n)))
steps(n*(n + 1)*(n + 2)/3 - n*(n + 1)/2, n*(n + 1)*(2*(n + 2) - 3)/6, S2)
```
:::
::::

:::: exercise The integral of $e^x$ {#ex-9-11} ★★★
- (a) Show that, for every number $r \ne 1$ and whole number $n \ge 1$,
  $$\sum_{i=0}^{n-1} r^i = \frac{r^n - 1}{r - 1}.$$
  (Multiply the sum by $r - 1$.)
- (b) Show that the left sum of $e^x$ on $[0, 1]$ with $n$ subintervals is
  $$L_n = (e - 1)\,\frac{1/n}{e^{1/n} - 1}.$$
- (c) Use $\lim_{h\to0} \dfrac{e^h - 1}{h} = 1$ to show that $\displaystyle\int_0^1 e^x\,dx = e - 1 \approx 1.718$. Why is that limit 1?

::: solution
**(a)** Multiply out: $(r - 1)\big(1 + r + \dots + r^{n-1}\big) = \big(r + r^2 + \dots + r^n\big) - \big(1 + r + \dots + r^{n-1}\big)$. Every power from $r$ to $r^{n-1}$ appears once with each sign and cancels: the difference telescopes to $r^n - 1$. Since $r \ne 1$, divide by $r - 1$.

**(b)** Here $\Delta x = \tfrac1n$, and the left ends are $x_i = \tfrac{i}{n}$ for $i = 0, \dots, n - 1$, so

$$\begin{aligned} L_n &= \sum_{i=0}^{n-1} e^{i/n}\cdot\frac1n \\[5pt] &= \frac1n\sum_{i=0}^{n-1}\big(e^{1/n}\big)^i. \end{aligned}$$

This is the sum of (a) with $r = e^{1/n}$, which is not 1 because $\tfrac1n \ne 0$, and $r^n = e$. So $L_n = \tfrac1n \cdot \tfrac{e - 1}{e^{1/n} - 1}$, which is the formula.

**(c)** Put $h = \tfrac1n$. Then

$$\begin{aligned} \frac{1/n}{e^{1/n} - 1} &= \frac{h}{e^h - 1} \\[5pt] &= \frac{1}{(e^h - 1)/h}. \end{aligned}$$

As $n \to \infty$, $h \to 0^+$, and $\tfrac{e^h - 1}{h} = \tfrac{e^{0+h} - e^0}{h}$ is the difference quotient of $e^x$ at 0. Its limit is the derivative of $e^x$ at 0, which is $e^0 = 1$ (Module 6). So $L_n \to (e - 1) \cdot \tfrac11 = e - 1$. Since $e^x$ is continuous, it is integrable, and by Theorem 9.4

$$\begin{aligned} \int_0^1 e^x\,dx &= \lim_{n\to\infty} L_n \\[5pt] &= e - 1 \approx 1.718. \end{aligned}$$

```check
rr9 = symbols('r')
for N_ in range(1, 7):
    same(expand((rr9 - 1)*sum(rr9**j for j in range(N_))), rr9**N_ - 1)
same(summation(rr9**i, (i, 0, n - 1)), Piecewise((n, Eq(rr9, 1)), ((rr9**n - 1)/(rr9 - 1), True)))
Ln11 = (E - 1)*(1/n)/(exp(1/n) - 1)
for N_ in (1, 3, 10):
    same(sum(exp(Rational(j, N_)) for j in range(N_))/N_, Ln11.subs(n, N_))
limit_is((exp(h) - 1)/h, h, 0, 1); same(diff(exp(x), x).subs(x, 0), 1)
same(limit(Ln11, n, oo), E - 1); same(integrate(exp(x), (x, 0, 1)), E - 1); rounds(E - 1, '1.718')
```
:::
::::

:::: exercise A zero integral {#ex-9-12} ★★★
Let $f$ be continuous on $[a, b]$, where $a < b$, with $f(x) \ge 0$ for every $x$ in $[a, b]$.

- (a) Prove that if $f(c) > 0$ for some $c$ in $[a, b]$, then $\int_a^b f(x)\,dx > 0$. (Hint: by continuity, $f(x) > \tfrac{f(c)}{2}$ for every $x$ in $[a, b]$ close enough to $c$.)
- (b) Deduce that if $\int_a^b f(x)\,dx = 0$, then $f(x) = 0$ for every $x$ in $[a, b]$.
- (c) Show that (b) fails without continuity: find a function $g \ge 0$ on $[0, 1]$, integrable, with $\int_0^1 g(x)\,dx = 0$, that is not 0 everywhere.

::: solution
**(a)** Let $\varepsilon = \tfrac{f(c)}{2} > 0$. Since $f$ is continuous at $c$, there is a $\delta > 0$ such that $\abs{f(x) - f(c)} < \tfrac{f(c)}{2}$, and so $f(x) > \tfrac{f(c)}{2}$, for every $x$ in $[a, b]$ with $\abs{x - c} < \delta$. Let $p = \max\big(a, c - \tfrac{\delta}{2}\big)$ and $q = \min\big(b, c + \tfrac{\delta}{2}\big)$. Then $p < q$ (because $a < b$ and $\delta > 0$), $[p, q]$ lies in $[a, b]$, and $f(x) > \tfrac{f(c)}{2}$ on $[p, q]$. By additivity,

$$\int_a^b f = \int_a^p f + \int_p^q f + \int_q^b f.$$

The first and last integrals are at least 0 by Theorem 9.7(a), since $f \ge 0$ (or are 0, if $p = a$ or $q = b$). The middle one is at least $\tfrac{f(c)}{2}(q - p) > 0$ by Theorem 9.7(c). So $\int_a^b f > 0$.

**(b)** Suppose $\int_a^b f = 0$. If $f$ were not 0 everywhere on $[a, b]$, there would be a $c$ with $f(c) > 0$, since $f \ge 0$, and (a) would give $\int_a^b f > 0$, not 0. So $f(x) = 0$ for every $x$ in $[a, b]$.

**(c)** Let $g(\tfrac12) = 1$ and $g(x) = 0$ for every other $x$ in $[0, 1]$. It is bounded and has one discontinuity, so it is integrable (Theorem 9.3). In a Riemann sum, only the subintervals that contain $\tfrac12$ (at most two of them) can have a sample point where $g$ is not 0, and each has width at most $\norm{P}$. So every Riemann sum lies between 0 and $2\norm{P}$, and the sums approach 0: $\int_0^1 g(x)\,dx = 0$, although $g(\tfrac12) = 1$.

```check
fc_ = symbols('fc', positive=True)                 # fc stands for f(c) > 0
same(fc_ - fc_/2, fc_/2)                           # |f(x) - f(c)| < f(c)/2 gives f(x) > f(c)/2
dl = symbols('delta', positive=True)
for (a_, b_, c_) in ((0, 3, 0), (0, 3, 3), (0, 3, Rational(5, 2))):   # p < q whether c is an end or not
    holds(Min(b_, c_ + dl/2).subs(dl, Rational(1, 10)) > Max(a_, c_ - dl/2).subs(dl, Rational(1, 10)))
gj = Piecewise((1, Eq(x, Rational(1, 2))), (0, True)); same(integrate(gj, (x, 0, 1)), 0)
for N_ in (2, 4, 10):                              # 1/2 is a cut point; sample points at 1/2 on both sides give the largest sum
    same(2*gj.subs(x, Rational(1, 2))*Rational(1, N_), 2*Rational(1, N_))
same(limit(2/n, n, oo), 0)
```
:::
::::

## Check yourself {#quiz}

```quiz
? $\displaystyle\sum_{i=1}^{4} i^2$ equals
- [ ] $100$
- [x] $30$
- [ ] $16$
- [ ] $10$
> $1 + 4 + 9 + 16 = 30$. 100 is $(1 + 2 + 3 + 4)^2$, the square of the sum rather than the sum of the squares; 16 is the last term alone; 10 is $\sum i$, without the squares.

? The right sum $R_3$ of $f(x) = x$ on $[0, 3]$ is
- [x] $6$
- [ ] $4.5$
- [ ] $3$
- [ ] $9$
> $\Delta x = 1$, and the right ends are 1, 2 and 3, so $R_3 = 1 + 2 + 3 = 6$. 4.5 is the exact integral, the area of a triangle with base 3 and height 3: $R_3$ overestimates it because $x$ increases. 3 is the left sum $0 + 1 + 2$. 9 is the area of one rectangle of height $f(3)$ over the whole interval.

? If $f$ is continuous and decreasing on $[a, b]$, then for every $n$
- [ ] $L_n \le \int_a^b f(x)\,dx \le R_n$
- [ ] $L_n = R_n$
- [ ] $M_n \le L_n \le R_n$
- [x] $R_n \le \int_a^b f(x)\,dx \le L_n$
> On each subinterval a decreasing function is largest at the left end and smallest at the right end, so the left rectangles stick out above the graph and the right ones stay below it. $L_n \le \int \le R_n$ holds for increasing functions. $L_n = R_n$ only when $f(a) = f(b)$, since $L_n - R_n = \big(f(a) - f(b)\big)\Delta x$, which is positive here. For the same reason $L_n > R_n$, so $M_n \le L_n \le R_n$ is false.

? $\displaystyle\int_{-2}^{2} x^3\,dx$ equals
- [ ] $8$
- [ ] $4$
- [x] $0$
- [ ] $16$
> $x^3$ is odd and $[-2, 2]$ is symmetric about 0, so the area below the axis on $[-2, 0]$ cancels the area above it on $[0, 2]$. 8 is $2\int_0^2 x^3\,dx$, the rule for even functions; 4 is $\int_0^2 x^3\,dx$, only the right half; 16 is $2^4$.

? $\displaystyle\int_0^3 (x - 1)\,dx$ equals
- [x] $\dfrac32$
- [ ] $\dfrac52$
- [ ] $2$
- [ ] $-\dfrac12$
> The line is below the axis on $[0, 1]$, a triangle of area $\tfrac12$, and above it on $[1, 3]$, a triangle of area 2; the integral is the signed area $2 - \tfrac12 = \tfrac32$. $\tfrac52$ adds the two areas, which gives the total area, not the integral; 2 counts only the part above the axis, and $-\tfrac12$ only the part below.

? If $\int_0^4 f(x)\,dx = 7$ and $\int_0^1 f(x)\,dx = 2$, then $\int_1^4 f(x)\,dx$ equals
- [ ] $9$
- [ ] $-5$
- [ ] $\dfrac{21}{4}$
- [x] $5$
> By additivity, $\int_0^1 f + \int_1^4 f = \int_0^4 f$, so $\int_1^4 f = 7 - 2 = 5$. 9 adds instead of subtracting; $-5$ is $\int_4^1 f$, with the limits reversed; $\tfrac{21}{4}$ assumes that the integral is proportional to the length of the interval, which is true for a constant $f$ but not in general.

? The average value of $f(x) = 2x$ on $[0, 3]$ is
- [ ] $9$
- [x] $3$
- [ ] $6$
- [ ] $\dfrac32$
> $\int_0^3 2x\,dx$ is the area of a triangle with base 3 and height 6, which is 9, and $f_{\text{avg}} = \tfrac93 = 3$. 9 is the integral, not yet divided by the length of the interval; 6 is the largest value, $f(3)$; $\tfrac32$ is the middle of the interval, the point where $f$ takes its average value, not the value itself.

? Which of these functions is integrable on $[0, 2]$?
- [ ] $f(x) = \dfrac{1}{x}$ for $0 < x \le 2$, with $f(0) = 0$
- [ ] $f(x) = 1$ for rational $x$ and $f(x) = 0$ for irrational $x$
- [x] $f(x) = 1$ for $x < 1$ and $f(x) = 3$ for $x \ge 1$
- [ ] $f(x) = \dfrac{1}{x - 1}$ for $x \ne 1$, with $f(1) = 0$
> The third function is bounded and has one jump, at 1, so it is integrable (Theorem 9.3); its integral is $1 + 3 = 4$. The first and the last are unbounded near 0 and near 1, and an integrable function must be bounded. The second is discontinuous everywhere: its Riemann sums can be 2 or 0 however fine the partition (Going deeper, Section 9.4).
```

```check
same(summation(i**2, (i, 1, 4)), 30); same(summation(i, (i, 1, 4))**2, 100); same(summation(i, (i, 1, 4)), 10)
same(Rsum(x9, 0, 3, 3), 6); same(Lsum(x9, 0, 3, 3), 3); same(integrate(x, (x, 0, 3)), Rational(9, 2)); same(3*3, 9)
same(integrate(x**3, (x, -2, 2)), 0); same(2*integrate(x**3, (x, 0, 2)), 8); same(integrate(x**3, (x, 0, 2)), 4)
same(integrate(x - 1, (x, 0, 3)), Rational(3, 2)); same(integrate(Abs(x - 1), (x, 0, 3)), Rational(5, 2))
same(7 - 2, 5); same(7*Rational(3, 4), Rational(21, 4))
same(integrate(2*x, (x, 0, 3))/3, 3); same(integrate(2*x, (x, 0, 3)), 9)
same(integrate(Piecewise((1, x < 1), (3, True)), (x, 0, 2)), 4)
same(Lsum(x9**2 + 1, 0, 2, 4) - Rsum(x9**2 + 1, 0, 2, 4), ((x9**2 + 1).subs(x9, 0) - (x9**2 + 1).subs(x9, 2))*Rational(1, 2))
```
