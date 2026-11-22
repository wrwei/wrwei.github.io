---
title: Applications of integration and improper integrals
part: 3
lead: Use integrals to add up quantities that are spread out (areas between curves, volumes, lengths of curves, the work done by varying forces, centres of mass), all with one method: slice, approximate, add and take the limit. Then extend integrals to infinite intervals and to functions that blow up, and use them to compute probabilities.
minutes: 270
needs: Modules 1 to 11, in particular the definite integral (Module 9), the Fundamental Theorem and substitution (Module 10), and integration by parts and Simpson's rule (Module 11)
goals:
  - Set up an integral for a quantity by slicing it, approximating each slice, adding the slices and taking the limit
  - Find areas between curves with vertical or horizontal strips, and volumes by slicing, discs, washers and cylindrical shells
  - Compute arc lengths, exactly or numerically, the work done by variable forces, and the centres of mass of rods and plates
  - Decide whether an improper integral converges, with the definitions, the $p$-integrals and the comparison tests, and find its value when it does
  - Compute probabilities and expected values from a probability density, including the exponential and normal distributions
---

## Slice, approximate, add {#method}

Module 9 found the area under a curve by slicing the region into thin strips, approximating each strip by a rectangle, adding the rectangles and taking the limit of the sums; Module 10 evaluated such limits with antiderivatives. The same four steps compute much more than areas: volumes, lengths, work, masses, centres of mass and probabilities. This section shows the method on one example. The rest of the module uses it again and again.

Suppose a metal rod 2 metres long is thicker towards one end, so that its **density**, its mass per unit length, is

$$\rho(x) = 1 + x^2 \text{ kg/m}$$

at the point $x$ metres from the thin end. (The rod is hypothetical; $\rho$ is the Greek letter "rho".) What is its mass? If the density were constant, the mass would be density times length. It is not constant, but along a short piece of the rod it hardly changes. So slice the rod into $n$ pieces of length $\Delta x = 2/n$, with ends $x_0 = 0, x_1, \dots, x_n = 2$. The $i$th piece has a density close to $\rho(x_{i-1})$, its value at the piece's left end, so its mass is about $\rho(x_{i-1})\,\Delta x$. Adding the pieces gives an estimate $L_n$ of the mass of the rod; using the right ends instead gives another, $R_n$:

$$\begin{aligned} L_n &= \sum_{i=1}^{n} \rho(x_{i-1})\,\Delta x, \\ R_n &= \sum_{i=1}^{n} \rho(x_i)\,\Delta x. \end{aligned}$$

```valuetable
n = 4, 10, 100, 1000
$L_n$ = Sum((1 + (2*(i - 1)/n)**2)*2/n, (i, 1, n))
$R_n$ = Sum((1 + (2*i/n)**2)*2/n, (i, 1, n))
digits = 6
---
n | L_n | R_n
4 | 3.75 | 5.75
10 | 4.28 | 5.08
100 | 4.6268 | 4.7068
1000 | 4.66267 | 4.67067
```

The density increases along the rod, so each piece is heavier than its left-end estimate and lighter than its right-end estimate: the true mass $M$ satisfies $L_n \le M \le R_n$ for every $n$. Both sums are Riemann sums of $\rho$ on $[0, 2]$, so both approach $\int_0^2 \rho(x)\,dx$ as $n \to \infty$ (Module 9), and $M$, squeezed between them, must equal that integral:

$$\begin{aligned} M &= \int_0^2 (1 + x^2)\,dx = \Big[x + \frac{x^3}{3}\Big]_0^2 \\ &= 2 + \frac83 = \frac{14}{3} \approx 4.667 \text{ kg}. \end{aligned}$$

The table agrees: for $n = 1000$ the two sums pin the mass between 4.66267 and 4.67067 kg.

```check
rho12 = 1 + x**2
Ln12 = lambda N: sum(rho12.subs(x, 2*Rational(i_ - 1, N))*Rational(2, N) for i_ in range(1, N + 1))
Rn12 = lambda N: sum(rho12.subs(x, 2*Rational(i_, N))*Rational(2, N) for i_ in range(1, N + 1))
for N_ in (4, 10, 100, 1000):
    holds(Ln12(N_) < Rational(14, 3)); holds(Rational(14, 3) < Rn12(N_))
same(Ln12(4), Rational(375, 100)); same(Rn12(100), Rational(47068, 10000))
rounds(Ln12(1000), '4.66267'); rounds(Rn12(1000), '4.67067')
antideriv(x + x**3/3, rho12, x)
steps(Integral(rho12, (x, 0, 2)), 2 + Rational(8, 3), Rational(14, 3))
rounds(Rational(14, 3), '4.667')
nn12 = symbols('n', positive=True, integer=True)
limit_is(summation(rho12.subs(x, 2*(u - 1)/nn12)*2/nn12, (u, 1, nn12)), nn12, oo, Rational(14, 3))
limit_is(summation(rho12.subs(x, 2*u/nn12)*2/nn12, (u, 1, nn12)), nn12, oo, Rational(14, 3))
```

::: keyidea
**Slice, approximate, add, take the limit.** To compute a quantity $Q$ spread over an interval $[a, b]$:

1. **Slice** $[a, b]$ into $n$ thin pieces of width $\Delta x$.
2. **Approximate** the part of $Q$ in the piece near $x$ by $q(x)\,\Delta x$, for a continuous function $q$: density times length, height times width, force times distance.
3. **Add** the pieces: $Q \approx \sum_{i=1}^{n} q(x_i^*)\,\Delta x$, a Riemann sum.
4. **Take the limit** as $n \to \infty$: $Q = \int_a^b q(x)\,dx$.
:::

Why is the limit exactly $Q$, and not only close to it? The rod shows the reason. On each piece a continuous $q$ has a least and a greatest value (the Extreme Value Theorem, Module 3). If the true amount in every piece lies between $\Delta x$ times the least value and $\Delta x$ times the greatest, then $Q$ lies between two Riemann sums of $q$: the one that samples each piece where $q$ is least, and the one that samples it where $q$ is greatest. Both sums approach $\int_a^b q(x)\,dx$, so $Q$ is squeezed to that value, as in the squeeze theorem of [Section 2.6](module_02_EN.html#squeeze). When you set up a new application, this is the property to look for. An approximation without such a guarantee can give a wrong answer, as Section 12.5 shows.

Leibniz's notation keeps the method in view. Write the amount in a slice of width $dx$ as $dQ = q(x)\,dx$, here $dm = \rho(x)\,dx$, and the total as $Q = \int_a^b dQ$.

::: tip
Units check a set-up: the integrand times $dx$ must have the units of the answer, here $\text{kg/m} \times \text{m} = \text{kg}$; for a volume, an area times a length; for work, a force times a distance.
:::

::: pitfall
Each term of the sum is the amount in a slice, $q(x_i)\,\Delta x$, not the value $q(x_i)$ alone. The right-end densities of the rod add up to $1.25 + 2 + 3.25 + 5 = 11.5$ for $n = 4$ and to about 2335 for $n = 1000$: without the factor $\Delta x$, the sums grow without bound instead of settling down to the mass.

```check
same(sum(rho12.subs(x, Rational(i_, 2)) for i_ in range(1, 5)), Rational(115, 10))
same([rho12.subs(x, Rational(i_, 2)) for i_ in range(1, 5)], [Rational(125, 100), 2, Rational(325, 100), 5])
rounds(sum(rho12.subs(x, Rational(2*i_, 1000)) for i_ in range(1, 1001)), '2335')
```
:::

## Area between curves {#area}

When a region lies between two curves, $y = f(x)$ above and $y = g(x)$ below, for $a \le x \le b$, slice it by vertical lines. The strip at $x$, of width $\Delta x$, is nearly a rectangle of height $f(x) - g(x)$, top minus bottom. Adding the strips and taking the limit gives the area.

::: definition Area between curves
Let $f$ and $g$ be continuous on $[a, b]$, with $g(x) \le f(x)$ for $a \le x \le b$. The **area** of the region between their graphs, the set of points $(x, y)$ with $a \le x \le b$ and $g(x) \le y \le f(x)$, is

$$A = \int_a^b \big(f(x) - g(x)\big)\,dx.$$
:::

With $g = 0$ this is the area under a curve, as in Module 9. The curves may dip below the $x$-axis: only the height $f(x) - g(x)$ of each strip matters, and moving both curves up by the same amount does not change it. For "the region enclosed by" two curves, the limits $a$ and $b$ are where the curves meet: solve $f(x) = g(x)$.

::: example Two parabolas
Find the area of the region enclosed by the parabolas $y = 4 - x^2$ and $y = x^2 - 2x$.

The curves meet where $4 - x^2 = x^2 - 2x$, that is, $2x^2 - 2x - 4 = 0$, or $x^2 - x - 2 = 0$. This factors as $(x - 2)(x + 1) = 0$, so the curves meet at $x = -1$ and $x = 2$. Between two meeting points the same curve stays on top (otherwise the continuous function $f - g$ would be 0 somewhere in between, by the Intermediate Value Theorem of Module 3), so test one point: at $x = 0$, $4 - x^2 = 4$ and $x^2 - 2x = 0$, so $y = 4 - x^2$ is the top. Top minus bottom is $(4 - x^2) - (x^2 - 2x) = 4 + 2x - 2x^2$, and

$$\begin{aligned} A &= \int_{-1}^{2} \big(4 + 2x - 2x^2\big)\,dx \\ &= \Big[4x + x^2 - \frac{2x^3}{3}\Big]_{-1}^{2} \\ &= \frac{20}{3} - \Big(-\frac{7}{3}\Big) = 9. \end{aligned}$$

```check
same_set(solve(Eq(4 - x**2, x**2 - 2*x), x), [-1, 2]); same(factor(x**2 - x - 2), (x - 2)*(x + 1))
same(expand(4 - x**2 - (x**2 - 2*x)), 4 + 2*x - 2*x**2); holds((4 - x**2).subs(x, 0) > (x**2 - 2*x).subs(x, 0))
F121 = 4*x + x**2 - 2*x**3/3
antideriv(F121, 4 + 2*x - 2*x**2, x); same(F121.subs(x, 2), Rational(20, 3)); same(F121.subs(x, -1), -Rational(7, 3))
steps(Integral(4 + 2*x - 2*x**2, (x, -1, 2)), Rational(20, 3) + Rational(7, 3), 9)
```
:::

When the curves cross, the top and the bottom swap at each crossing. An area counts every strip as positive, so split the interval at the crossings; in one formula, the area is $\int_a^b \abs{f(x) - g(x)}\,dx$.

::: example Curves that cross
Find the area of the region between $y = \sin x$ and $y = \cos x$ for $0 \le x \le \pi$.

The curves cross where $\sin x = \cos x$, that is, $\tan x = 1$; in $[0, \pi]$ that happens only at $x = \pi/4$. At $x = 0$, $\cos x = 1$ and $\sin x = 0$, so $\cos x$ is on top on $[0, \pi/4]$; at $x = \pi/2$, $\sin x = 1$ and $\cos x = 0$, so $\sin x$ is on top on $[\pi/4, \pi]$. Hence

$$\begin{aligned} A &= \int_0^{\pi/4} (\cos x - \sin x)\,dx \\ &\qquad + \int_{\pi/4}^{\pi} (\sin x - \cos x)\,dx \\ &= \big[\sin x + \cos x\big]_0^{\pi/4} \\ &\qquad + \big[-\cos x - \sin x\big]_{\pi/4}^{\pi} \\ &= \big(\sqrt2 - 1\big) + \big(1 + \sqrt2\big) \\ &= 2\sqrt2 \approx 2.828. \end{aligned}$$

```check
same(solveset(tan(x) - 1, x, Interval(0, pi)), FiniteSet(pi/4))
antideriv(sin(x) + cos(x), cos(x) - sin(x), x); antideriv(-cos(x) - sin(x), sin(x) - cos(x), x)
same(integrate(cos(x) - sin(x), (x, 0, pi/4)), sqrt(2) - 1); same(integrate(sin(x) - cos(x), (x, pi/4, pi)), 1 + sqrt(2))
same(integrate(Abs(sin(x) - cos(x)), (x, 0, pi)), 2*sqrt(2)); rounds(2*sqrt(2), '2.828')
```
:::

::: pitfall
Without the split, the integral is not the area: $\int_0^\pi (\cos x - \sin x)\,dx = \big[\sin x + \cos x\big]_0^\pi = -1 - 1 = -2$. The strips where $\sin x$ is on top count as negative, and an area is never negative. Before integrating, find where the curves cross and which one is on top between the crossings.

```check
same(integrate(cos(x) - sin(x), (x, 0, pi)), -2); same((sin(x) + cos(x)).subs(x, pi), -1); same((sin(x) + cos(x)).subs(x, 0), 1)
```
:::

### Horizontal strips {#horizontal-strips}

Some regions are easier to slice the other way: choose the direction in which every strip runs between the same two curves. Figure 12.1 shows the region between the parabola $x = y^2$ and the line $y = x - 2$. A vertical strip runs from the lower half of the parabola, $y = -\sqrt x$, to its upper half when $0 \le x \le 1$, but from the line to the upper half when $1 \le x \le 4$: two formulas, so two integrals. Every horizontal strip runs from the parabola on the left to the line on the right. For a region between a left boundary $x = x_L(y)$ and a right boundary $x = x_R(y)$, for $c \le y \le d$, a horizontal strip of height $\Delta y$ has length $x_R(y) - x_L(y)$, right minus left, and

$$A = \int_c^d \big(x_R(y) - x_L(y)\big)\,dy.$$

::: figure id=fig-12-1
The region between the parabola $x = y^2$ and the line $y = x - 2$, which meet at $(1, -1)$ and $(4, 2)$. Left: a vertical strip runs from $y = -\sqrt x$ to $y = \sqrt x$ when $x < 1$, but from $y = x - 2$ to $y = \sqrt x$ when $x > 1$, so vertical strips need two integrals. Right: every horizontal strip runs from $x = y^2$ to $x = y + 2$, so one integral is enough (Example 12.3).
:::

::: example Horizontal strips
Find the area of the region between $x = y^2$ and $y = x - 2$, with horizontal strips and with vertical strips.

**Horizontal strips.** Write the line as $x = y + 2$. The curves meet where $y^2 = y + 2$, that is, $(y - 2)(y + 1) = 0$: at $y = -1$ and $y = 2$, the points $(1, -1)$ and $(4, 2)$. At $y = 0$ the line is at $x = 2$ and the parabola at $x = 0$, so the line is on the right:

$$\begin{aligned} A &= \int_{-1}^{2} \big((y + 2) - y^2\big)\,dy \\ &= \Big[\frac{y^2}{2} + 2y - \frac{y^3}{3}\Big]_{-1}^{2} \\ &= \frac{10}{3} - \Big(-\frac{7}{6}\Big) = \frac{9}{2}. \end{aligned}$$

**Vertical strips.** From $x = 0$ to $x = 1$ a strip runs from $-\sqrt x$ to $\sqrt x$; from $x = 1$ to $x = 4$, from $x - 2$ to $\sqrt x$. With the antiderivatives $\tfrac43 x^{3/2}$ and $\tfrac23 x^{3/2} - \tfrac12 x^2 + 2x$,

$$\begin{aligned} A &= \int_0^1 2\sqrt x\,dx \\ &\qquad + \int_1^4 \big(\sqrt x - x + 2\big)\,dx \\ &= \frac43 + \frac{19}{6} = \frac{9}{2}. \end{aligned}$$

The same area, as it must be, with more work.

```check
same_set(solve(Eq(y**2, y + 2), y), [-1, 2]); same(factor(y**2 - y - 2), (y - 2)*(y + 1))
G123 = y**2/2 + 2*y - y**3/3
antideriv(G123, y + 2 - y**2, y); same(G123.subs(y, 2), Rational(10, 3)); same(G123.subs(y, -1), -Rational(7, 6))
steps(Integral(y + 2 - y**2, (y, -1, 2)), Rational(10, 3) + Rational(7, 6), Rational(9, 2))
xp12 = symbols('x', positive=True)
antideriv(Rational(4, 3)*xp12**Rational(3, 2), 2*sqrt(xp12), xp12)
antideriv(Rational(2, 3)*xp12**Rational(3, 2) - xp12**2/2 + 2*xp12, sqrt(xp12) - xp12 + 2, xp12)
same(integrate(2*sqrt(x), (x, 0, 1)), Rational(4, 3)); same(integrate(sqrt(x) - x + 2, (x, 1, 4)), Rational(19, 6))
same(Rational(4, 3) + Rational(19, 6), Rational(9, 2))
```
:::

::: pitfall
In an integral with respect to $y$, everything is written in terms of $y$: the boundaries as $x = \dots$, the length of a strip as right minus left (not top minus bottom), and the limits as values of $y$. In Example 12.3 the limits are $-1$ and $2$, the $y$-coordinates of the meeting points, not their $x$-coordinates 1 and 4.
:::

## Volumes by slicing {#volumes}

### Cross-sections {#slicing}

Slice a loaf of bread: each slice is nearly a flat slab, whose volume is the area of its face times its thickness. The same idea gives the volume of any solid whose cross-sections you know. Put an $x$-axis through the solid, and let $A(x)$ be the area of its cross-section by the plane perpendicular to the axis at $x$. A slab of thickness $\Delta x$ at $x$ has volume about $A(x)\,\Delta x$. Adding and taking the limit:

::: definition Volume by slicing
Let a solid lie between the planes perpendicular to the $x$-axis at $x = a$ and $x = b$, and let its cross-section at $x$ have area $A(x)$, where $A$ is continuous on $[a, b]$. The **volume** of the solid is

$$V = \int_a^b A(x)\,dx.$$
:::

A check: a prism or cylinder of height $h$ whose cross-sections all have the same area $B$ has $V = \int_0^h B\,dx = Bh$, base times height, the familiar formula.

::: example A pyramid
A pyramid has a square base of side $s$ and height $h$. Find its volume.

Put the apex at the origin and the $x$-axis down through the centre of the base, so that $x$ is the depth below the apex and the base is at $x = h$. The cross-section at depth $x$ is a square. By similar triangles, its side grows in proportion to the depth, from 0 at the apex to $s$ at the base, so it is $sx/h$. So $A(x) = (sx/h)^2 = s^2x^2/h^2$, and

$$V = \int_0^h \frac{s^2}{h^2}x^2\,dx = \frac{s^2}{h^2}\cdot\frac{h^3}{3} = \frac{1}{3}s^2h.$$

A pyramid fills one third of the box with the same base and height. The argument works for a base of any shape: the cross-section at depth $x$ is the base scaled by the factor $x/h$, so its area is $B\,x^2/h^2$, where $B$ is the area of the base (areas scale by the square of the factor), and $V = \int_0^h Bx^2/h^2\,dx = \tfrac13 Bh$. A cone of radius $r$ is the case $B = \pi r^2$: $V = \tfrac13\pi r^2h$.

```check
sq, hq, Bq, rq = symbols('s h B r', positive=True)
same((sq*x/hq)**2, sq**2*x**2/hq**2); same((sq*x/hq).subs(x, 0), 0); same((sq*x/hq).subs(x, hq), sq)
steps(Integral(sq**2*x**2/hq**2, (x, 0, hq)), sq**2/hq**2*hq**3/3, sq**2*hq/3)
same(integrate(Bq*x**2/hq**2, (x, 0, hq)), Bq*hq/3); same((Bq*hq/3).subs(Bq, pi*rq**2), pi*rq**2*hq/3)
same(integrate(Bq, (x, 0, hq)), Bq*hq)
```
:::

### Discs and washers {#washers}

Rotate the region under the graph of a function $f \ge 0$, for $a \le x \le b$, about the $x$-axis. It sweeps out a **solid of revolution**. Each point of the region moves on a circle about the axis, so the cross-section at $x$ is a disc of radius $f(x)$ and area $\pi f(x)^2$, and

$$V = \pi\int_a^b f(x)^2\,dx \qquad\text{(discs)}.$$

::: example The volume of a ball
Find the volume of a ball of radius $a$.

The ball is swept out by the half disc under $y = \sqrt{a^2 - x^2}$, $-a \le x \le a$. Here $f(x)^2 = a^2 - x^2$, so the square root disappears:

$$\begin{aligned} V &= \pi\int_{-a}^{a} \big(a^2 - x^2\big)\,dx \\ &= \pi\Big[a^2x - \frac{x^3}{3}\Big]_{-a}^{a} \\ &= \pi\Big(\frac{2a^3}{3} + \frac{2a^3}{3}\Big) = \frac43\pi a^3. \end{aligned}$$

```check
aq = symbols('a', positive=True)
same(sqrt(aq**2 - x**2)**2, aq**2 - x**2)
antideriv(aq**2*x - x**3/3, aq**2 - x**2, x)
same((aq**2*x - x**3/3).subs(x, aq), 2*aq**3/3); same((aq**2*x - x**3/3).subs(x, -aq), -2*aq**3/3)
same(pi*integrate(aq**2 - x**2, (x, -aq, aq)), Rational(4, 3)*pi*aq**3)
```
:::

If the region does not reach the axis, the solid has a hole. Let the region lie between $y = R(x)$ and $y = r(x)$, with $0 \le r(x) \le R(x)$. The cross-section at $x$ is then a **washer**, a disc of radius $R(x)$ with a hole of radius $r(x)$ (Figure 12.2), of area $\pi R(x)^2 - \pi r(x)^2$, and

$$V = \pi\int_a^b \big(R(x)^2 - r(x)^2\big)\,dx \quad\text{(washers)}.$$

The **outer radius** $R(x)$ is the distance from the axis to the farther boundary, and the **inner radius** $r(x)$ the distance to the nearer one.

::: figure id=fig-12-2
Left: the region between $y = \sqrt x$ and $y = x^2$, $0 \le x \le 1$ (dark blue), rotates about the $x$-axis and sweeps out a solid shaped like a thick bowl (Example 12.6); its outer surface is drawn as a transparent shell, its inner surface in purple. The slice at $x$ (orange) is a washer. Right: the washer seen along the axis, with outer radius $R = \sqrt x$ and inner radius $r = x^2$.
:::

::: example A solid with a hole
Find the volume of the solid swept out when the region between $y = \sqrt x$ and $y = x^2$ rotates about the $x$-axis.

The curves meet where $\sqrt x = x^2$; squaring, $x = x^4$, that is, $x(x^3 - 1) = 0$, so at $x = 0$ and $x = 1$. For $0 < x < 1$, $\sqrt x > x^2$ (at $x = \tfrac14$, $\tfrac12 > \tfrac{1}{16}$), so $R(x) = \sqrt x$ and $r(x) = x^2$:

$$\begin{aligned} V &= \pi\int_0^1 \big(x - x^4\big)\,dx = \pi\Big(\frac12 - \frac15\Big) \\ &= \frac{3\pi}{10} \approx 0.942. \end{aligned}$$

```check
same(solveset(x - x**4, x, S.Reals), FiniteSet(0, 1)); same_set(solve(Eq(sqrt(x), x**2), x), [0, 1])
holds(sqrt(Rational(1, 4)) > Rational(1, 4)**2)
same(sqrt(x)**2 - (x**2)**2, x - x**4)
steps(pi*Integral(x - x**4, (x, 0, 1)), pi*(Rational(1, 2) - Rational(1, 5)), 3*pi/10)
rounds(3*pi/10, '0.942')
```
:::

::: pitfall
The area of a washer is $\pi R^2 - \pi r^2$, not $\pi(R - r)^2$. With $R = 2$ and $r = 1$ the washer has area $4\pi - \pi = 3\pi$, while $\pi(R - r)^2 = \pi$. Square each radius, then subtract.

```check
same(pi*2**2 - pi*1**2, 3*pi); same(pi*(2 - 1)**2, pi)
```
:::

### Other axes {#other-axes}

The same reasoning works for any axis: slice perpendicular to the axis, and measure each radius from the axis. For the $y$-axis the slices are horizontal, so the radii are functions of $y$, and $V = \pi\int_c^d \big(R(y)^2 - r(y)^2\big)\,dy$. For a horizontal line $y = k$, a point at height $y$ is at distance $\abs{y - k}$ from the axis.

::: example Rotating about other lines
(a) A bowl has the shape of the surface swept out when the parabola $y = x^2$ rotates about the $y$-axis. Find the volume of water in it when the water is $h$ deep.

(b) The region between $y = x$ and $y = x^2$, $0 \le x \le 1$, rotates about the line $y = -1$. Find the volume of the solid.

**(a)** The water is the solid swept out by the region between the $y$-axis and the parabola, for $0 \le y \le h$. Its slice at height $y$ is a disc whose radius is the $x \ge 0$ with $x^2 = y$, that is, $\sqrt y$. So

$$\begin{aligned} V &= \pi\int_0^h \big(\sqrt y\big)^2\,dy \\ &= \pi\int_0^h y\,dy = \frac{\pi h^2}{2}. \end{aligned}$$

The cylinder with the same height $h$ and the same top radius $\sqrt h$ holds $\pi\big(\sqrt h\big)^2 h = \pi h^2$: the bowl holds exactly half as much.

**(b)** The slices perpendicular to the axis $y = -1$ are vertical, so integrate in $x$. Both curves lie above the axis, and for $0 < x < 1$ the line $y = x$ is farther from it, since $x > x^2$. The radii are the distances from the axis: $R(x) = x - (-1) = x + 1$ and $r(x) = x^2 + 1$. So

$$\begin{aligned} V &= \pi\int_0^1 \big((x + 1)^2 - (x^2 + 1)^2\big)\,dx \\ &= \pi\int_0^1 \big(2x - x^2 - x^4\big)\,dx \\ &= \pi\Big(1 - \frac13 - \frac15\Big) = \frac{7\pi}{15} \approx 1.466. \end{aligned}$$

```check
hb = symbols('h', positive=True)
same(pi*integrate(y, (y, 0, hb)), pi*hb**2/2); same(pi*sqrt(hb)**2*hb, pi*hb**2); same((pi*hb**2/2)/(pi*hb**2), Rational(1, 2))
same(x - (-1), x + 1); same(expand((x + 1)**2 - (x**2 + 1)**2), 2*x - x**2 - x**4)
holds(Rational(1, 2) > Rational(1, 2)**2)
steps(pi*Integral((x + 1)**2 - (x**2 + 1)**2, (x, 0, 1)), pi*(1 - Rational(1, 3) - Rational(1, 5)), 7*pi/15)
rounds(7*pi/15, '1.466')
```
:::

::: pitfall
Radii are distances from the axis of rotation, not heights. Rotating about $y = -1$, the radius of the curve $y = x$ is $x + 1$, not $x$. Rotating the same region about $y = 2$, which lies above it, the outer radius belongs to the lower curve: $R(x) = 2 - x^2$ and $r(x) = 2 - x$.

```check
same(pi*integrate((2 - x**2)**2 - (2 - x)**2, (x, 0, 1)), 8*pi/15)
holds(all(2 - v**2 >= 2 - v for v in (0, Rational(1, 4), Rational(1, 2), 1)))
```
:::

## Cylindrical shells {#shells}

Rotate the region under $y = 4x - x^3$, $0 \le x \le 2$, about the $y$-axis. Washers would need horizontal slices, and the radii of the slice at height $y$ are the solutions $x$ of the cubic equation $4x - x^3 = y$: hard to find. Slice the region the other way, into vertical strips. A thin strip at distance $x$ from the axis, of width $\Delta x$ and height $f(x)$, sweeps out a thin **cylindrical shell**, a tube of radius $x$, height $f(x)$ and thickness $\Delta x$ (Figure 12.3). Cut the tube along its height and unroll it: it is nearly a flat slab of length $2\pi x$ (the circumference), height $f(x)$ and thickness $\Delta x$, with volume about $2\pi x\,f(x)\,\Delta x$.

That approximation is good enough. A tube of constant height $h$ between radii $x$ and $x + \Delta x$ has volume

$$\pi(x + \Delta x)^2h - \pi x^2h = 2\pi\Big(x + \frac{\Delta x}{2}\Big)h\,\Delta x,$$

the circumference at the middle of the tube times its height and thickness. Using $x$ for the radius changes this by $\pi h(\Delta x)^2$, at most $\pi H(\Delta x)^2$ if $H$ is the greatest height of the region; over all $n$ shells that adds up to at most $\pi H(b - a)\,\Delta x$, which approaches 0. The height varies a little across the strip, but, as in Section 12.1, the solid that the strip sweeps out lies between the tubes with the least and the greatest heights on the strip. Adding the shells and taking the limit gives the **shell method**: when the region under $y = f(x) \ge 0$, $0 \le a \le x \le b$, rotates about the $y$-axis,

$$V = 2\pi\int_a^b x\,f(x)\,dx.$$

For other regions and vertical axes, $V = 2\pi\int (\text{radius})(\text{height})\,dx$, with the radius measured from the axis and the height top minus bottom. Shells and washers always give the same volume when both apply; Exercise 12.11 proves it for the region under a decreasing curve.

```check
xs12, dxs, hs = symbols('x Delta_x h', positive=True)
same(pi*(xs12 + dxs)**2*hs - pi*xs12**2*hs, 2*pi*(xs12 + dxs/2)*hs*dxs)
same(2*pi*(xs12 + dxs/2)*hs*dxs - 2*pi*xs12*hs*dxs, pi*hs*dxs**2)
```

::: figure id=fig-12-3
Cylindrical shells. Left: the region under $y = 4x - x^3$, $0 \le x \le 2$, with a strip of width $\Delta x$ at distance $x$ from the $y$-axis. Right: rotating about the $y$-axis (dashed), the strip sweeps out a thin shell of radius $x$, height $f(x)$ and thickness $\Delta x$, inside the solid whose outline is drawn in blue. Unrolled, the shell is nearly a slab of volume $2\pi x \cdot f(x) \cdot \Delta x$.
:::

::: example When shells beat washers
Find the volume of the solid swept out when the region under $y = 4x - x^3$, $0 \le x \le 2$, rotates about the $y$-axis.

The region lies above the $x$-axis: $4x - x^3 = x(2 - x)(2 + x) \ge 0$ for $0 \le x \le 2$. By shells, with radius $x$ and height $4x - x^3$,

$$\begin{aligned} V &= 2\pi\int_0^2 x\big(4x - x^3\big)\,dx \\ &= 2\pi\int_0^2 \big(4x^2 - x^4\big)\,dx \\ &= 2\pi\Big(\frac{32}{3} - \frac{32}{5}\Big) = \frac{128\pi}{15} \approx 26.81. \end{aligned}$$

```check
same(factor(4*x - x**3), -x*(x - 2)*(x + 2)); holds(all((4*x - x**3).subs(x, v) >= 0 for v in (0, Rational(1, 2), 1, Rational(3, 2), 2)))
same(expand(x*(4*x - x**3)), 4*x**2 - x**4)
same(integrate(4*x**2, (x, 0, 2)), Rational(32, 3)); same(integrate(x**4, (x, 0, 2)), Rational(32, 5))
steps(2*pi*Integral(4*x**2 - x**4, (x, 0, 2)), 2*pi*(Rational(32, 3) - Rational(32, 5)), 128*pi/15)
rounds(128*pi/15, '26.81')
```
:::

::: keyidea
Washers slice perpendicular to the axis; shells slice parallel to it. About a horizontal axis, washers integrate in $x$ and shells in $y$; about a vertical axis, washers integrate in $y$ and shells in $x$. Choose the method whose slices need one formula and whose radii are easy to write down: shells when solving for $x$ would be hard, as in Example 12.8.
:::

::: pitfall
The radius of a shell is its distance from the axis. Rotating the region between $y = x$ and $y = x^2$, $0 \le x \le 1$, about the line $x = 2$, the strip at $x$ is $2 - x$ from the axis, so $V = 2\pi\int_0^1 (2 - x)(x - x^2)\,dx = \pi/2$. Using $x$ as the radius would give the volume for the $y$-axis instead, $\pi/6$.

```check
same(2*pi*integrate((2 - x)*(x - x**2), (x, 0, 1)), pi/2); same(2*pi*integrate(x*(x - x**2), (x, 0, 1)), pi/6)
```
:::

::: compute Areas and volumes with SymPy
SymPy finds where curves meet with `solve` and evaluates the integrals with `integrate`. For the region of Example 12.6:

```python
import sympy as sp
x, y = sp.symbols('x y')
print(sp.solve(sp.Eq(sp.sqrt(x), x**2), x))       # where the curves meet
print(sp.integrate(sp.sqrt(x) - x**2, (x, 0, 1)))  # the area between them
print(sp.pi*sp.integrate(x - x**4, (x, 0, 1)))     # the volume by washers
```

```output
[0, 1]
1/3
3*pi/10
```

Now compute one volume both ways: the region between $y = x$ and $y = x^2$, $0 \le x \le 1$, rotating about the $y$-axis. Shells have radius $x$ and height $x - x^2$. Horizontal slices at height $y$ run from $x = y$ to $x = \sqrt y$, so the washers have $R = \sqrt y$ and $r = y$:

```python
shells = 2*sp.pi*sp.integrate(x*(x - x**2), (x, 0, 1))
washers = sp.pi*sp.integrate(sp.sqrt(y)**2 - y**2, (y, 0, 1))
print(shells, washers)
```

```output
pi/6 pi/6
```

The two methods agree, as they must: they slice the same solid in different ways.
:::

```check
same(integrate(sqrt(x) - x**2, (x, 0, 1)), Rational(1, 3)); same(pi*integrate(y - y**2, (y, 0, 1)), pi/6)
holds(all(sqrt(v) >= v for v in (0, Rational(1, 4), Rational(1, 2), 1)))
```

## Arc length {#arc-length}

How long is one arch of the curve $y = \sin x$, from $x = 0$ to $x = \pi$? A ruler measures straight segments, so approximate the curve by a polygon. Choose $n + 1$ equally spaced points $x_0 = 0, x_1, \dots, x_n = \pi$, and join the neighbouring points of the curve by straight chords. By Pythagoras' theorem, the chord from $\big(x_{i-1}, f(x_{i-1})\big)$ to $\big(x_i, f(x_i)\big)$ has length $\sqrt{(\Delta x)^2 + (\Delta y_i)^2}$, where $\Delta y_i = f(x_i) - f(x_{i-1})$. As $n$ grows, the polygons hug the curve more closely:

| Chords $n$ | Length of the polygon |
|---|---|
| 1 | 3.14159 |
| 2 | 3.72419 |
| 4 | 3.79009 |
| 8 | 3.81253 |
| 16 | 3.81827 |
| 64 | 3.82008 |

The lengths increase: the corners of each polygon are among the corners of the next, and replacing a chord by two chords with the same ends cannot shorten the path, because a straight segment is the shortest path between its ends. And they settle near 3.820. That number is what the length of the curve means.

```check
import mpmath
mpmath.mp.dps = 30
def poly12(n_):
    return mpmath.fsum(mpmath.sqrt((mpmath.pi/n_)**2 + (mpmath.sin(i_*mpmath.pi/n_) - mpmath.sin((i_ - 1)*mpmath.pi/n_))**2) for i_ in range(1, n_ + 1))
for n_, txt in ((1, '3.14159'), (2, '3.72419'), (4, '3.79009'), (8, '3.81253'), (16, '3.81827'), (64, '3.82008')):
    rounds(poly12(n_), txt)
holds(all(poly12(n_) < poly12(2*n_) for n_ in (1, 2, 4, 8, 16, 32)))
rounds(poly12(64), '3.820')
```

::: definition Arc length
The **length** (or **arc length**) of the graph of $f$ from $x = a$ to $x = b$ is the limit, as $n \to \infty$, of the lengths of the polygons whose vertices are the points of the graph at $n + 1$ equally spaced values $a = x_0 < x_1 < \dots < x_n = b$, if the limit exists.
:::

::: theorem The arc length formula
If $f'$ is continuous on $[a, b]$, the length of the graph of $f$ from $x = a$ to $x = b$ is

$$L = \int_a^b \sqrt{1 + f'(x)^2}\,dx.$$
:::

::: proof
By the Mean Value Theorem (Module 8), applied to $f$ on $[x_{i-1}, x_i]$, there is a point $x_i^*$ in that interval with $\Delta y_i = f'(x_i^*)\,\Delta x$. So the $i$th chord has length

$$\begin{aligned} &\sqrt{(\Delta x)^2 + f'(x_i^*)^2(\Delta x)^2} \\ &\qquad= \sqrt{1 + f'(x_i^*)^2}\,\Delta x, \end{aligned}$$

and the polygon has length $\sum_{i=1}^{n} \sqrt{1 + f'(x_i^*)^2}\,\Delta x$. This is a Riemann sum of the function $\sqrt{1 + f'(x)^2}$, which is continuous on $[a, b]$ because $f'$ is. So, as $n \to \infty$, the polygon lengths approach $\int_a^b \sqrt{1 + f'(x)^2}\,dx$ (Module 9).
:::

```check
dxp, fp_ = symbols('Delta_x f_p', positive=True)
same(sqrt(dxp**2 + fp_**2*dxp**2), sqrt(1 + fp_**2)*dxp)
```

In Leibniz's notation, a tiny piece of the curve is the hypotenuse of a tiny right triangle with sides $dx$ and $dy$: $dL = \sqrt{(dx)^2 + (dy)^2} = \sqrt{1 + (dy/dx)^2}\,dx$. Module 16 extends the formula to curves given by parametric equations.

::: example A hanging cable
A cable or chain hanging under its own weight takes the shape of a **catenary**, the graph of $y = c\cosh(x/c)$ for a constant $c > 0$, where $\cosh$ is the hyperbolic cosine of Module 6. Find the length of the catenary $y = \cosh x$ from $x = -1$ to $x = 1$.

Here $f'(x) = \sinh x$, and the identity $\cosh^2 x - \sinh^2 x = 1$ (Module 6) gives $1 + \sinh^2 x = \cosh^2 x$. Since $\cosh x > 0$, $\sqrt{1 + f'(x)^2} = \cosh x$, and

$$\begin{aligned} L &= \int_{-1}^{1} \cosh x\,dx = \big[\sinh x\big]_{-1}^{1} \\ &= 2\sinh 1 = e - e^{-1} \approx 2.350. \end{aligned}$$

In metres: a cable 2.350 m long, hung from two hooks 2 m apart at a height of $\cosh 1 \approx 1.543$ m, sags to a lowest point 1 m above the ground.

```check
same(diff(cosh(x), x), sinh(x)); same(1 + sinh(x)**2, cosh(x)**2)
xr12 = symbols('x', real=True); same(sqrt(1 + sinh(xr12)**2), cosh(xr12))
same(integrate(cosh(x), (x, -1, 1)), 2*sinh(1)); same(2*sinh(1), E - exp(-1))
rounds(2*sinh(1), '2.350'); rounds(cosh(1), '1.543'); same(cosh(0), 1)
```
:::

The square root in the arc length formula usually has no elementary antiderivative, and then the length must be computed numerically.

::: example One arch of a sine wave
Find the length of $y = \sin x$, $0 \le x \le \pi$.

Here $f'(x) = \cos x$, so $L = \int_0^\pi \sqrt{1 + \cos^2 x}\,dx$. This integrand has no elementary antiderivative (the integral belongs to the family of elliptic integrals), so evaluate it with Simpson's rule (Module 11). With $n = 4$ and $\Delta x = \pi/4$ you need $g(x) = \sqrt{1 + \cos^2 x}$ at five points: $g(0) = g(\pi) = \sqrt2$, $g(\pi/4) = g(3\pi/4) = \sqrt{3/2}$ and $g(\pi/2) = 1$. So

$$\begin{aligned} S_4 &= \frac{\pi/4}{3}\Big[\sqrt2 + 4\sqrt{\tfrac32} + 2 \cdot 1 \\ &\qquad + 4\sqrt{\tfrac32} + \sqrt2\Big] \\ &= \frac{\pi}{12}\Big(2\sqrt2 + 8\sqrt{\tfrac32} + 2\Big) \\ &\approx 3.8292. \end{aligned}$$

With more points, Simpson's rule gives $S_8 \approx 3.82028$ and $S_{16} \approx 3.8201978$ (the Compute it box below), so the arch has length $L \approx 3.8202$, as the polygons suggested. That is about 21.6% longer than its base, $\pi$: a corrugated metal sheet whose profile is a sine wave needs that much more flat sheet than its width.

```check
g1210 = sqrt(1 + cos(x)**2)
same([g1210.subs(x, v) for v in (0, pi/4, pi/2, 3*pi/4, pi)], [sqrt(2), sqrt(Rational(3, 2)), 1, sqrt(Rational(3, 2)), sqrt(2)])
S4_12 = (pi/4)/3*(sqrt(2) + 4*sqrt(Rational(3, 2)) + 2 + 4*sqrt(Rational(3, 2)) + sqrt(2))
same(S4_12, pi/12*(2*sqrt(2) + 8*sqrt(Rational(3, 2)) + 2)); rounds(S4_12, '3.8292')
def simp12(n_):
    h_ = mpmath.pi/n_
    gg = lambda X: mpmath.sqrt(1 + mpmath.cos(X)**2)
    return h_/3*(gg(0) + gg(mpmath.pi) + mpmath.fsum((4 if i_ % 2 else 2)*gg(i_*h_) for i_ in range(1, n_)))
rounds(simp12(8), '3.82028'); rounds(simp12(16), '3.8201978')
L1210 = mpmath.quad(lambda X: mpmath.sqrt(1 + mpmath.cos(X)**2), [0, mpmath.pi])
rounds(L1210, '3.8202'); rounds(100*(L1210/mpmath.pi - 1), '21.6')
same(diff(sin(x), x), cos(x))
```
:::

::: pitfall
An approximation must follow the direction of the curve. A staircase of $n$ horizontal and $n$ vertical steps, each of length $1/n$, runs along the diagonal of a unit square from one corner to the other. Its length is $2n \cdot \tfrac1n = 2$ for every $n$, and it approaches the diagonal as closely as you like; yet the diagonal has length $\sqrt2 \approx 1.414$. Each step replaces a piece of the diagonal of length $\sqrt{(\Delta x)^2 + (\Delta y)^2}$ by $\Delta x + \Delta y$, which is not close to it, however small the pieces. Chords point along the curve; steps do not.

```check
nst = symbols('n', positive=True, integer=True)
same(2*nst*(1/nst), 2); rounds(sqrt(2), '1.414')
same((Rational(1, 7) + Rational(1, 7))/sqrt(Rational(1, 7)**2 + Rational(1, 7)**2), sqrt(2))
```
:::

::: compute Arc length by computer
The polygons and Simpson's rule are a few lines of Python each. `math.hypot(dx, dy)` is $\sqrt{dx^2 + dy^2}$, Pythagoras' theorem:

```python
import math

def polygon(f, a, b, n):
    """Polygon through n + 1 equally spaced points of y = f(x)."""
    xs = [a + (b - a)*i/n for i in range(n + 1)]
    return sum(math.hypot(xs[i + 1] - xs[i], f(xs[i + 1]) - f(xs[i]))
               for i in range(n))

def simpson(g, a, b, n):
    """Simpson's rule with n subintervals (n even)."""
    h = (b - a)/n
    inner = sum((4 if i % 2 else 2)*g(a + i*h) for i in range(1, n))
    return h/3*(g(a) + inner + g(b))

P = polygon(math.sin, 0, math.pi, 1000)
print(f"polygon, 1000 chords: {P:.10f}")
g = lambda x: math.sqrt(1 + math.cos(x)**2)
for n in [4, 8, 16, 32]:
    print(f"Simpson, n = {n:2d}:     {simpson(g, 0, math.pi, n):.10f}")
```

```output
polygon, 1000 chords: 3.8201972963
Simpson, n =  4:     3.8291789256
Simpson, n =  8:     3.8202824061
Simpson, n = 16:     3.8201978136
Simpson, n = 32:     3.8201977890
```

Even a thousand chords are off by about $5 \times 10^{-7}$, while Simpson's rule with $n = 32$ agrees with the true length to all ten decimals shown. SymPy evaluates the integral to as many digits as you ask. Asked for an antiderivative, it returns the integral unevaluated: it found no elementary antiderivative. (There is none, but SymPy's failure alone would not prove that.)

```python
import sympy as sp
x = sp.symbols('x')
print(sp.Integral(sp.sqrt(1 + sp.cos(x)**2), (x, 0, sp.pi)).evalf(20))
print(sp.integrate(sp.sqrt(1 + sp.cos(x)**2), x))
```

```output
3.8201977890277120179
Integral(sqrt(cos(x)**2 + 1), x)
```
:::

```check
Lp12 = mpmath.quad(lambda X: mpmath.sqrt(1 + mpmath.cos(X)**2), [0, mpmath.pi])
rounds((Lp12 - poly12(1000))*10**7, '5'); rounds(poly12(1000), '3.8201972963')
rounds(Lp12, '3.8201977890'); rounds(simp12(32), '3.8201977890'); rounds(simp12(4), '3.8291789256')
```

## Work {#work}

Lift a 2 kg bag of flour steadily by 1.5 m. You exert a force equal to its weight, $mg = 2 \times 9.8 = 19.6$ newtons (N), where $g \approx 9.8$ m/s² is the acceleration due to gravity (Module 1). A constant force $F$ acting through a distance $d$ does **work** $W = Fd$, here $19.6 \times 1.5 = 29.4$ joules (J): a force of 1 newton acting through 1 metre does 1 joule of work. When the force changes along the way, slice the path. On a short piece of length $\Delta x$ the force is nearly constant, so the work there is about $F(x)\,\Delta x$.

```check
same(2*Rational(98, 10), Rational(196, 10)); same(Rational(196, 10)*Rational(15, 10), Rational(294, 10))
```

::: definition Work
If a continuous force $F(x)$, acting along a line, moves an object from $x = a$ to $x = b$, the **work** done is

$$W = \int_a^b F(x)\,dx.$$
:::

**Springs.** Stretch a spring $x$ metres beyond its natural length, and it pulls back with a force proportional to $x$: $F(x) = kx$, where the **spring constant** $k$ is measured in N/m. This is **Hooke's law**. It holds for stretches that are not too large (within the spring's elastic limit), and for compressions too. To stretch the spring you must exert the force $kx$ yourself.

::: example Stretching a spring
A force of 30 N holds a spring stretched 0.15 m beyond its natural length. How much work does it take to stretch it (a) from its natural length to 0.15 m beyond it, and (b) from 0.15 m to 0.30 m beyond it?

By Hooke's law $30 = k \times 0.15$, so $k = 200$ N/m, and the force needed at stretch $x$ is $200x$ N. An antiderivative of $200x$ is $100x^2$.

**(a)** $W = \int_0^{0.15} 200x\,dx = \big[100x^2\big]_0^{0.15} = 100 \times 0.0225 = 2.25$ J.

**(b)** $W = \big[100x^2\big]_{0.15}^{0.30} = 9 - 2.25 = 6.75$ J: three times as much for the same extra 0.15 m, because the spring pulls harder the more it is stretched.

```check
k12 = Rational(30)/Rational(15, 100); same(k12, 200)
antideriv(100*x**2, 200*x, x)
steps(Integral(200*x, (x, 0, Rational(15, 100))), 100*Rational(225, 10000), Rational(225, 100))
steps(Integral(200*x, (x, Rational(15, 100), Rational(30, 100))), 9 - Rational(225, 100), Rational(675, 100))
same(Rational(675, 100)/Rational(225, 100), 3)
```
:::

::: pitfall
"Force times distance" holds only for a constant force. In (a), $30 \times 0.15 = 4.5$ J is twice the true work: the force grows from 0 to 30 N, and its average over the stretch is 15 N. And $x$ is the stretch beyond the natural length, not the length of the spring.

```check
same(30*Rational(15, 100), Rational(45, 10)); same(Rational(45, 10)/Rational(225, 100), 2)
same(integrate(200*x, (x, 0, Rational(15, 100)))/Rational(15, 100), 15)
```
:::

**Lifting a rope.** When different parts of an object move different distances, slice the object instead of the path.

::: example Lifting a rope
A rope 20 m long, with a mass of 0.4 kg per metre, hangs from the top of a building (Figure 12.4, left). How much work does it take to pull the whole rope up to the top?

Measure the depth $y$ downwards from the top. The piece of rope between depths $y$ and $y + \Delta y$ has mass $0.4\,\Delta y$ kg and weight $0.4 \times 9.8\,\Delta y = 3.92\,\Delta y$ N, and it is lifted about $y$ metres. So its work is about $3.92\,y\,\Delta y$ J, and

$$\begin{aligned} W &= \int_0^{20} 3.92\,y\,dy \\ &= 3.92 \times \frac{20^2}{2} = 784 \text{ J}. \end{aligned}$$

Slicing the motion instead gives the same answer: when $x$ metres have been pulled up, the hanging part weighs $3.92(20 - x)$ N, and $\int_0^{20} 3.92(20 - x)\,dx = 784$ J.

```check
same(Rational(4, 10)*Rational(98, 10), Rational(392, 100))
steps(Integral(Rational(392, 100)*y, (y, 0, 20)), Rational(392, 100)*20**2/2, 784)
same(integrate(Rational(392, 100)*(20 - x), (x, 0, 20)), 784)
```
:::

::: pitfall
The rope weighs $3.92 \times 20 = 78.4$ N, but the work is not $78.4 \times 20 = 1568$ J: only the bottom end rises 20 m, and the top end hardly moves. On average the rope rises 10 m, and $78.4 \times 10 = 784$ J. That average is the depth of the rope's centre of mass (Section 12.7).

```check
same(Rational(392, 100)*20, Rational(784, 10)); same(Rational(784, 10)*20, 1568); same(Rational(784, 10)*10, 784)
```
:::

**Pumping a liquid.** To empty a tank, slice the liquid into thin horizontal layers: each layer is lifted as a whole to the outlet.

::: figure id=fig-12-4
Left: a rope 20 m long hangs from the top of a building; the piece at depth $y$, of length $\Delta y$, is lifted $y$ metres (Example 12.12). Right: the cone-shaped tank of Example 12.13, 4 m deep with a top of radius 2 m; the layer of water at height $y$ above the vertex has radius $y/2$ and is pumped up $4 - y$ metres to the top.
:::

::: example Emptying a tank
The cone-shaped tank of [Example 7.2](module_07_EN.html#more-rates), 4 m deep with its vertex at the bottom and a top of radius 2 m, is full of water, whose density is 1000 kg/m³. How much work does it take to pump all the water out over the top?

Let $y$ be the height above the vertex (Figure 12.4, right). As in Example 7.2, similar triangles give the radius of the water's surface at height $y$ as $y/2$. The layer of water between heights $y$ and $y + \Delta y$ is nearly a disc of radius $y/2$ and thickness $\Delta y$, so it has

- volume about $\pi(y/2)^2\,\Delta y = \tfrac{\pi}{4}y^2\,\Delta y$ m³,
- mass about $1000 \cdot \tfrac{\pi}{4}y^2\,\Delta y = 250\pi y^2\,\Delta y$ kg,
- weight about $9.8 \times 250\pi y^2\,\Delta y = 2450\pi y^2\,\Delta y$ N,

and it is lifted $4 - y$ metres, to the top. So

$$\begin{aligned} W &= \int_0^4 2450\pi y^2(4 - y)\,dy \\ &= 2450\pi\Big[\frac{4y^3}{3} - \frac{y^4}{4}\Big]_0^4 \\ &= 2450\pi\Big(\frac{256}{3} - 64\Big) \\ &= \frac{156\,800\pi}{3} \approx 1.64 \times 10^5 \text{ J}, \end{aligned}$$

about 164 kJ. A pump of 500 watts, that is, 500 joules per second, would need about 5.5 minutes, if it wasted no energy.

```check
same(pi*(y/2)**2, pi*y**2/4); same(1000*pi*y**2/4, 250*pi*y**2); same(Rational(98, 10)*250*pi*y**2, 2450*pi*y**2)
antideriv(4*y**3/3 - y**4/4, y**2*(4 - y), y)
same((4*y**3/3 - y**4/4).subs(y, 4), Rational(256, 3) - 64)
W1213 = integrate(2450*pi*y**2*(4 - y), (y, 0, 4))
same(W1213, 156800*pi/3); rounds(W1213/10**5, '1.64'); rounds(W1213/1000, '164')
rounds(W1213/500/60, '5.5')
```
:::

::: pitfall
Use weight, not mass: a layer of mass $m$ kilograms needs a force of $mg$ newtons to lift it, so the factor $g = 9.8$ must appear, or the answer is not in joules. And measure the distance from the layer to where the liquid goes: to the top here, $4 - y$; to a spout 1 m above the top, $5 - y$.
:::

## Centre of mass {#centre-of-mass}

A seesaw balances when the law of the lever holds: mass times distance from the pivot is the same on both sides. Masses $m_1, \dots, m_n$ at positions $x_1, \dots, x_n$ on a line balance at their **centre of mass**

$$\bar x = \frac{m_1x_1 + \dots + m_nx_n}{m_1 + \dots + m_n} = \frac{\sum m_ix_i}{\sum m_i},$$

read "x bar". The sum $\sum m_ix_i$ is the **moment** of the masses about the origin. Measured from $\bar x$ instead, the moments cancel: $\sum m_i(x_i - \bar x) = \sum m_ix_i - \bar x\sum m_i = 0$. For example, children of 30 kg and 20 kg sitting at $x = 0$ and $x = 3$ m balance at $\bar x = (30 \cdot 0 + 20 \cdot 3)/50 = 1.2$ m, nearer the heavier child.

```check
same((30*0 + 20*3)/Rational(50), Rational(12, 10)); same(30*(0 - Rational(12, 10)) + 20*(3 - Rational(12, 10)), 0)
```

**A rod.** For a rod along $[a, b]$ with density $\rho(x)$, slice: the piece at $x$ has mass about $\rho(x)\,\Delta x$ and moment about $x\,\rho(x)\,\Delta x$. Adding and taking limits:

::: definition Centre of mass of a rod
A rod along $[a, b]$ with continuous density $\rho(x) > 0$ has mass $M = \int_a^b \rho(x)\,dx$ and **centre of mass**

$$\bar x = \frac{1}{M}\int_a^b x\,\rho(x)\,dx.$$
:::

::: example The rod of Section 12.1
Find the centre of mass of the rod of Section 12.1, whose density is $\rho(x) = 1 + x^2$ kg/m for $0 \le x \le 2$.

Its mass is $M = \tfrac{14}{3}$ kg. Its moment is

$$\begin{aligned} \int_0^2 x\big(1 + x^2\big)\,dx &= \Big[\frac{x^2}{2} + \frac{x^4}{4}\Big]_0^2 \\ &= 2 + 4 = 6 \text{ kg m}, \end{aligned}$$

so $\bar x = 6 \big/ \tfrac{14}{3} = \tfrac{9}{7} \approx 1.29$ m from the thin end: beyond the middle of the rod, towards its denser end, as it should be.

```check
antideriv(x**2/2 + x**4/4, x*(1 + x**2), x)
steps(Integral(x*(1 + x**2), (x, 0, 2)), 2 + 4, 6)
same(6/Rational(14, 3), Rational(9, 7)); rounds(Rational(9, 7), '1.29'); holds(Rational(9, 7) > 1)
```
:::

**A thin plate.** A thin flat plate of uniform density (mass per unit area) is called a **lamina**; its centre of mass is a point $(\bar x, \bar y)$ in its plane. Let the plate occupy the region between $y = g(x)$ and $y = f(x)$, $a \le x \le b$, and slice it into vertical strips. The strip at $x$ is nearly a rectangle of width $\Delta x$ and height $f(x) - g(x)$, which balances at its centre, $\big(x, \tfrac12(f(x) + g(x))\big)$, by symmetry; its mass is the density times its area. Weighting each strip's coordinates by its mass and taking limits gives the formulas below. The density cancels, so the centre of mass depends only on the shape. For $\bar y$, the height of a strip's centre times its area is $\tfrac12(f + g)(f - g)\,\Delta x = \tfrac12\big(f^2 - g^2\big)\,\Delta x$.

::: definition Centroid of a plate
Let $f$ and $g$ be continuous on $[a, b]$ with $g \le f$, and let $A$ be the area of the region between their graphs. The **centroid** of the region is the point $(\bar x, \bar y)$ with

$$\begin{aligned} \bar x &= \frac1A\int_a^b x\big(f(x) - g(x)\big)\,dx, \\ \bar y &= \frac1A\int_a^b \frac12\big(f(x)^2 - g(x)^2\big)\,dx. \end{aligned}$$

A plate of uniform density occupying the region balances at its centroid.
:::

**Symmetry.** If a region is symmetric about a line, its centroid lies on that line: the moments of mirror-image strips about the line cancel.

::: example A half disc
Find the centroid of the half disc $x^2 + y^2 \le a^2$, $y \ge 0$.

The half disc is symmetric about the $y$-axis, so $\bar x = 0$. Its area is $A = \tfrac12\pi a^2$, and with $f(x) = \sqrt{a^2 - x^2}$ and $g(x) = 0$,

$$\begin{aligned} \bar y &= \frac{2}{\pi a^2}\int_{-a}^{a} \frac12\big(a^2 - x^2\big)\,dx \\ &= \frac{2}{\pi a^2}\cdot\frac12\cdot\frac{4a^3}{3} = \frac{4a}{3\pi} \approx 0.424a. \end{aligned}$$

A half-disc plate balances on a point 42% of the way up its radius, below the halfway mark, because more of its area lies near the straight edge.

```check
same(integrate(x*sqrt(aq**2 - x**2), (x, -aq, aq)), 0)
same(integrate(aq**2 - x**2, (x, -aq, aq)), 4*aq**3/3)
same(1/(pi*aq**2/2)*integrate((aq**2 - x**2)/2, (x, -aq, aq)), 4*aq/(3*pi))
rounds(4/(3*pi), '0.424'); holds(4/(3*pi) < Rational(1, 2))
```
:::

::: pitfall
The formula for $\bar y$ has $\tfrac12\big(f^2 - g^2\big)$, not $\tfrac12(f - g)^2$; and both coordinates are divided by the area (for a rod, by the mass). A quick check catches most slips: the centroid of a region lies between its leftmost and rightmost points and between its lowest and highest points.
:::

## Improper integrals {#improper}

So far every integral has had a finite interval and a continuous integrand. Probabilities, and many questions in physics, need more: the area under $y = 1/x^2$ for all $x \ge 1$, or under $y = 1/\sqrt x$ for $0 < x \le 1$, where the curve shoots up near 0. Such integrals are **improper**. They are defined as limits of ordinary integrals.

### Infinite intervals {#infinite-intervals}

The area under $y = 1/x^2$ from 1 to $t$ is $\int_1^t x^{-2}\,dx = \big[-\tfrac1x\big]_1^t = 1 - \tfrac1t$, and the area under $y = 1/x$ is $\int_1^t x^{-1}\,dx = \ln t$:

```valuetable
t = 10, 100, Pow(10, 4, evaluate=False), Pow(10, 6, evaluate=False)
$\int_1^t dx/x^2$ = 1 - 1/t
$\int_1^t dx/x$ = log(t)
digits = 6
---
t | \int_1^t dx/x^2 | \int_1^t dx/x
10 | 0.9 | 2.30259
100 | 0.99 | 4.60517
10^{4} | 0.9999 | 9.21034
10^{6} | 0.999999 | 13.8155
```

As $t \to \infty$, the first approaches 1, while the second grows without bound, slowly. The region under $1/x^2$, infinitely long, has a finite area, 1; the region under $1/x$ does not. The two curves look alike, but $1/x^2$ falls to 0 much faster.

```check
antideriv(-1/x, x**-2, x); same(integrate(x**-2, (x, 1, t)), 1 - 1/t)
tp12 = symbols('t', positive=True); same(integrate(1/x, (x, 1, tp12)), log(tp12))
limit_is(1 - 1/t, t, oo, 1); limit_is(log(t), t, oo, oo)
```

::: definition Improper integral over an infinite interval
Let $f$ be continuous on $[a, \infty)$. Then

$$\int_a^\infty f(x)\,dx = \lim_{t\to\infty}\int_a^t f(x)\,dx.$$

The improper integral **converges** if this limit exists (as a finite number), and **diverges** otherwise. In the same way, for $f$ continuous on $(-\infty, b]$, $\int_{-\infty}^b f(x)\,dx = \lim_{t\to-\infty}\int_t^b f(x)\,dx$. For $f$ continuous on $\R$,

$$\begin{aligned} \int_{-\infty}^{\infty} f(x)\,dx &= \int_{-\infty}^{c} f(x)\,dx \\ &\qquad + \int_{c}^{\infty} f(x)\,dx, \end{aligned}$$

for any number $c$, provided both integrals on the right converge; if either diverges, so does the integral on the left.
:::

$\int_{-\infty}^{\infty}$ reads "the integral from minus infinity to infinity". The choice of $c$ does not matter: moving it moves an ordinary integral from one side to the other. The limits as $t \to \pm\infty$ are the limits at infinity of Module 3.

::: example Integrals over infinite intervals
Evaluate (a) $\displaystyle\int_0^\infty e^{-x}\,dx$, (b) $\displaystyle\int_0^\infty xe^{-x}\,dx$ and (c) $\displaystyle\int_{-\infty}^{\infty} \frac{dx}{1 + x^2}$.

**(a)** $\int_0^t e^{-x}\,dx = \big[-e^{-x}\big]_0^t = 1 - e^{-t} \to 1$ as $t \to \infty$. The integral converges, to 1.

**(b)** Integration by parts (Module 11), with $u = x$ and $dv = e^{-x}\,dx$, gives the antiderivative $-xe^{-x} - e^{-x}$, so $\int_0^t xe^{-x}\,dx = 1 - (t + 1)e^{-t}$. As $t \to \infty$, $te^{-t} = t/e^t \to 0$, because powers grow more slowly than exponentials ([Theorem 7.7](module_07_EN.html#growth)), and $e^{-t} \to 0$. The integral converges, to 1.

**(c)** Split at $c = 0$. As $t \to \infty$, $\int_0^t \frac{dx}{1 + x^2} = \arctan t \to \frac{\pi}{2}$ (Module 6); and as $t \to -\infty$, $\int_t^0 \frac{dx}{1 + x^2} = -\arctan t \to \frac{\pi}{2}$. Both halves converge, so the integral converges, to $\pi$.

```check
limit_is(integrate(exp(-x), (x, 0, t)), t, oo, 1); same(integrate(exp(-x), (x, 0, t)), 1 - exp(-t))
antideriv(-x*exp(-x) - exp(-x), x*exp(-x), x)
same(integrate(x*exp(-x), (x, 0, t)), 1 - (t + 1)*exp(-t)); limit_is(t*exp(-t), t, oo, 0); limit_is(1 - (t + 1)*exp(-t), t, oo, 1)
antideriv(atan(x), 1/(1 + x**2), x); limit_is(atan(t), t, oo, pi/2); limit_is(-atan(t), t, -oo, pi/2)
same(integrate(1/(1 + x**2), (x, -oo, oo)), pi)
```
:::

::: pitfall
$\int_{-\infty}^{\infty} x\,dx$ is not 0. It is true that $\int_{-t}^{t} x\,dx = 0$ for every $t$, but the definition takes the two halves separately, and $\int_0^\infty x\,dx = \lim_{t\to\infty} t^2/2$ does not exist: the integral diverges. A symmetric limit can be finite when the integral diverges, so it cannot be used to evaluate $\int_{-\infty}^{\infty}$.

```check
same(integrate(x, (x, -t, t)), 0); limit_is(integrate(x, (x, 0, t)), t, oo, oo)
```
:::

### Unbounded integrands {#unbounded}

::: definition Improper integral of an unbounded function
Let $f$ be continuous on $[a, b)$ and unbounded near $b$. Then

$$\int_a^b f(x)\,dx = \lim_{t\to b^-}\int_a^t f(x)\,dx,$$

and the integral **converges** if the limit exists and **diverges** otherwise. Similarly, if $f$ is continuous on $(a, b]$ and unbounded near $a$, $\int_a^b f(x)\,dx = \lim_{t\to a^+}\int_t^b f(x)\,dx$. If $f$ is continuous on $[a, b]$ except at a point $c$ inside it, near which it is unbounded, then $\int_a^b f(x)\,dx = \int_a^c f(x)\,dx + \int_c^b f(x)\,dx$, which converges only if both integrals on the right do.
:::

::: example Unbounded integrands
Evaluate (a) $\displaystyle\int_0^1 \frac{dx}{\sqrt x}$ and (b) $\displaystyle\int_0^1 \ln x\,dx$.

**(a)** The integrand is unbounded near 0. For $0 < t < 1$, $\int_t^1 x^{-1/2}\,dx = \big[2\sqrt x\big]_t^1 = 2 - 2\sqrt t$, which approaches 2 as $t \to 0^+$. The integral converges, to 2.

**(b)** $\ln x \to -\infty$ as $x \to 0^+$. An antiderivative of $\ln x$ is $x\ln x - x$ (by parts, Module 11), so

$$\begin{aligned} \int_t^1 \ln x\,dx &= (0 - 1) - (t\ln t - t) \\ &= -1 - t\ln t + t. \end{aligned}$$

As $t \to 0^+$, $t\ln t \to 0$ ([Example 7.15](module_07_EN.html#products-differences)), so the integral converges, to $-1$. The region between the graph and the $x$-axis is infinitely deep, yet its area is 1; the integral is negative because the region lies below the axis.

```check
same(integrate(x**Rational(-1, 2), (x, t, 1)), 2 - 2*sqrt(t)); limit_is(2 - 2*sqrt(t), t, 0, 2, '+')
antideriv(x*log(x) - x, log(x), x)
same((x*log(x) - x).subs(x, 1) - (x*log(x) - x).subs(x, t), -1 - t*log(t) + t)
limit_is(t*log(t), t, 0, 0, '+'); limit_is(-1 - t*log(t) + t, t, 0, -1, '+'); same(integrate(log(x), (x, 0, 1)), -1)
```
:::

::: pitfall
An unbounded integrand can hide inside the interval. Applying the Fundamental Theorem blindly,

$$\int_{-1}^{1}\frac{dx}{x^2} \overset{?}{=} \Big[-\frac1x\Big]_{-1}^{1} = -1 - 1 = -2,$$

which cannot be right: the integrand is positive. The Fundamental Theorem needs the integrand to be continuous on $[-1, 1]$, and $1/x^2$ is not even defined at 0. The integral is improper at 0, and its right half diverges: $\int_t^1 x^{-2}\,dx = \tfrac1t - 1 \to \infty$ as $t \to 0^+$. So the integral diverges. Before integrating, look for points where the integrand blows up.

```check
same((-1/x).subs(x, 1) - (-1/x).subs(x, -1), -2)
same(integrate(x**-2, (x, t, 1)), 1/t - 1); limit_is(1/t - 1, t, 0, oo, '+'); same(integrate(1/x**2, (x, -1, 1)), oo)
```
:::

### The $p$-integrals {#p-integrals}

The examples so far suggest one family of integrals to measure others against.

::: theorem The $p$-integrals
Let $p$ be a real number.

(a) $\displaystyle\int_1^\infty \frac{dx}{x^p}$ converges if $p > 1$, to $\dfrac{1}{p - 1}$, and diverges if $p \le 1$.

(b) $\displaystyle\int_0^1 \frac{dx}{x^p}$ converges if $p < 1$, to $\dfrac{1}{1 - p}$, and diverges if $p \ge 1$.
:::

::: proof
For $p \ne 1$, an antiderivative of $x^{-p}$ is $\dfrac{x^{1-p}}{1-p}$ (the power rule, Module 10).

(a) For $t > 1$, $\int_1^t x^{-p}\,dx = \dfrac{t^{1-p} - 1}{1 - p}$. If $p > 1$, then $1 - p < 0$ and $t^{1-p} = 1/t^{p-1} \to 0$ as $t \to \infty$, so the integral approaches $\dfrac{-1}{1 - p} = \dfrac{1}{p - 1}$. If $p < 1$, then $t^{1-p} \to \infty$, and the integral diverges. If $p = 1$, $\int_1^t dx/x = \ln t \to \infty$.

(b) For $0 < t < 1$, $\int_t^1 x^{-p}\,dx = \dfrac{1 - t^{1-p}}{1 - p}$. If $p < 1$, $t^{1-p} \to 0$ as $t \to 0^+$, and the integral approaches $\dfrac{1}{1 - p}$. If $p > 1$, $t^{1-p} = 1/t^{p-1} \to \infty$, and it diverges. If $p = 1$, $\int_t^1 dx/x = -\ln t \to \infty$.
:::

```check
pr = symbols('p', real=True)
antideriv(x**(1 - pr)/(1 - pr), x**(-pr), x)
q12 = symbols('q', positive=True)                         # p = 1 + q > 1, and p = 1 - q < 1
tq = symbols('t', positive=True)
same(integrate(x**(-(1 + q12)), (x, 1, tq)), (tq**(-q12) - 1)/(-q12)); limit_is((tq**(-q12) - 1)/(-q12), tq, oo, 1/q12)
same(1/q12, 1/((1 + q12) - 1)); limit_is((tq**q12 - 1)/q12, tq, oo, oo)
same(integrate(x**(-(1 - q12)), (x, tq, 1)), (1 - tq**q12)/q12); limit_is((1 - tq**q12)/q12, tq, 0, 1/q12, '+')
same(1/q12, 1/(1 - (1 - q12))); limit_is((1 - tq**(-q12))/(-q12), tq, 0, oo, '+')
limit_is(log(tq), tq, oo, oo); limit_is(-log(tq), tq, 0, oo, '+')
for pv in (Rational(1, 2), 2, 3):
    same(integrate(x**(-pv), (x, 1, oo)), 1/(pv - 1) if pv > 1 else oo)
for pv in (Rational(1, 2), Rational(-1, 2), 2):
    same(integrate(x**(-pv), (x, 0, 1)), 1/(1 - pv) if pv < 1 else oo)
```

For $p \le 0$ the integral in (b) is an ordinary integral, since $x^{-p}$ is continuous on $[0, 1]$, and the formula $1/(1 - p)$ still gives its value.

::: keyidea
Near infinity, $1/x^p$ must fall faster than $1/x$ for the area to be finite; near 0, it must grow more slowly than $1/x$. The borderline function $1/x$ fails at both ends, so $\int_0^\infty dx/x^p$ diverges for every $p$: one of its two halves always does.
:::

### Comparison {#comparison}

Most improper integrals cannot be evaluated exactly, but you can often decide whether they converge by comparing them with one you know.

::: theorem The comparison test
Let $f$ and $g$ be continuous on $[a, \infty)$, with $0 \le f(x) \le g(x)$ for all $x \ge a$.

(a) If $\int_a^\infty g(x)\,dx$ converges, so does $\int_a^\infty f(x)\,dx$, and $\int_a^\infty f(x)\,dx \le \int_a^\infty g(x)\,dx$.

(b) If $\int_a^\infty f(x)\,dx$ diverges, so does $\int_a^\infty g(x)\,dx$.

The same holds for integrals that are improper because the integrands are unbounded near an endpoint.
:::

The condition $f \ge 0$ matters: $f(x) = -1$ and $g(x) = 1/x^2$ satisfy $f \le g$ on $[1, \infty)$, and $\int_1^\infty g$ converges, but $\int_1^\infty f$ diverges.

::: proof
(a) Let $F(t) = \int_a^t f(x)\,dx$ for $t \ge a$, and let $G = \int_a^\infty g(x)\,dx$. Since $f \ge 0$, $F$ is increasing: making $t$ larger adds the integral of a non-negative function. In the same way $\int_a^t g(x)\,dx$ increases with $t$, towards its limit $G$, so it is at most $G$. Since $f \le g$, the comparison property of integrals (Module 9) gives

$$F(t) \le \int_a^t g(x)\,dx \le G$$

for every $t \ge a$. So $F(t)$ rises as $t$ grows but never passes $G$. A function that increases and is bounded above has a limit as $t \to \infty$, no larger than the bound. This is a basic property of the real numbers, their **completeness**, which this series takes for granted; Module 14 states it for sequences, as the monotone convergence theorem. So $\int_a^\infty f(x)\,dx = \lim_{t\to\infty} F(t)$ exists and is at most $G$.

(b) If $\int_a^\infty g$ converged, then by (a) so would $\int_a^\infty f$.
:::

::: example Two comparisons
Decide whether (a) $\displaystyle\int_1^\infty e^{-x^2}\,dx$ and (b) $\displaystyle\int_2^\infty \frac{dx}{\ln x}$ converge.

**(a)** For $x \ge 1$, $x^2 \ge x$, so $-x^2 \le -x$ and $0 < e^{-x^2} \le e^{-x}$. As in Example 12.16(a), $\int_1^\infty e^{-x}\,dx = \lim_{t\to\infty}\big(e^{-1} - e^{-t}\big) = e^{-1}$, which converges. By the comparison test, $\int_1^\infty e^{-x^2}\,dx$ converges, and its value is at most $1/e \approx 0.368$. (Its value, found numerically, is about 0.1394.)

**(b)** The function $x - \ln x$ has derivative $1 - 1/x > 0$ for $x > 1$ and value 1 at $x = 1$, so it is positive for $x \ge 1$: $\ln x < x$. For $x \ge 2$, then, $0 < \ln x < x$ and $\frac{1}{\ln x} > \frac1x > 0$. Since $\int_2^\infty dx/x = \lim_{t\to\infty}(\ln t - \ln 2)$ diverges, so does $\int_2^\infty dx/\ln x$, by the comparison test (b).

```check
holds(all(v**2 >= v for v in (1, Rational(3, 2), 2, 5, 10)))
same(integrate(exp(-x), (x, 1, oo)), exp(-1)); rounds(exp(-1), '0.368')
holds(Integral(exp(-x**2), (x, 1, oo)).evalf() <= exp(-1)); rounds(Integral(exp(-x**2), (x, 1, oo)).evalf(30), '0.1394')
same(diff(x - log(x), x), 1 - 1/x); same((x - log(x)).subs(x, 1), 1); holds(all(1 - 1/v > 0 for v in (Rational(11, 10), 2, 10)))
limit_is(log(t) - log(2), t, oo, oo); holds(all(1/log(v) > 1/Integer(v) for v in (2, 3, 10, 100)))
```
:::

Part (a) settles a question that matters below: $\int_{-\infty}^{\infty} e^{-x^2}\,dx$ converges. The interval $[1, \infty)$ is part (a), $[0, 1]$ gives an ordinary integral, and $e^{-x^2}$ is even, so the negative half behaves like the positive half.

::: pitfall
A comparison must go the right way. To show that $\int_1^\infty \frac{dx}{\sqrt x + 1}$ diverges, comparing with $\frac{1}{\sqrt x}$ proves nothing: $\frac{1}{\sqrt x + 1} \le \frac{1}{\sqrt x}$, and a function below one whose integral diverges may have an integral that converges or diverges. Compare from below instead: for $x \ge 1$, $\sqrt x + 1 \le 2\sqrt x$, so $\frac{1}{\sqrt x + 1} \ge \frac{1}{2\sqrt x}$, whose integral diverges ($p = \tfrac12$).

```check
holds(all(1/(sqrt(v) + 1) <= 1/sqrt(v) for v in (1, 2, 9, 100))); holds(all(sqrt(v) + 1 <= 2*sqrt(v) for v in (1, 2, 9, 100)))
same(integrate(1/(2*sqrt(x)), (x, 1, oo)), oo)
```
:::

Finding the right inequality takes some care. Often it is easier to compare the behaviour for large $x$:

::: theorem Limit comparison
Let $f$ and $g$ be continuous and positive on $[a, \infty)$, with $f(x)/g(x) \to L$ as $x \to \infty$, where $0 < L < \infty$. Then $\int_a^\infty f(x)\,dx$ and $\int_a^\infty g(x)\,dx$ either both converge or both diverge.
:::

::: proof
Since $f(x)/g(x) \to L > 0$, the ratio lies between $\tfrac{L}{2}$ and $\tfrac{3L}{2}$ for all large enough $x$, say for $x \ge N$, where $N \ge a$; so $\tfrac{L}{2}g(x) \le f(x) \le \tfrac{3L}{2}g(x)$ there. If $\int_a^\infty g$ converges, then $\int_N^\infty f$ converges by comparison with $\tfrac{3L}{2}g$. If $\int_a^\infty g$ diverges, so does $\int_N^\infty g$, and then $\int_N^\infty f$ diverges by comparison with $\tfrac{L}{2}g$. Adding the ordinary integral $\int_a^N f$ does not change whether the integral converges.
:::

For the pitfall above, $\dfrac{1/(\sqrt x + 1)}{1/\sqrt x} = \dfrac{\sqrt x}{\sqrt x + 1} \to 1$, so $\int_1^\infty \frac{dx}{\sqrt x + 1}$ diverges with $\int_1^\infty \frac{dx}{\sqrt x}$, with no inequality to find.

```check
limit_is(sqrt(x)/(sqrt(x) + 1), x, oo, 1); same((1/(sqrt(x) + 1))/(1/sqrt(x)), sqrt(x)/(sqrt(x) + 1))
same(integrate(1/sqrt(x), (x, 1, oo)), oo)
```

### Gabriel's horn {#gabriel}

::: example Gabriel's horn
Rotate the region under $y = 1/x$, $x \ge 1$, about the $x$-axis. The solid, a horn that grows thinner without end, is called **Gabriel's horn**. Find its volume.

By discs, with an improper integral,

$$\begin{aligned} V &= \pi\int_1^\infty \Big(\frac1x\Big)^2\,dx = \pi\int_1^\infty \frac{dx}{x^2} \\ &= \pi \cdot 1 = \pi, \end{aligned}$$

by Theorem 12.2 with $p = 2$. The horn has a finite volume, $\pi$ cubic units, although the region that sweeps it out has infinite area: $\int_1^\infty dx/x$ diverges.

```check
same(pi*integrate((1/x)**2, (x, 1, oo)), pi); same(1/(2 - 1), 1); same(integrate(1/x, (x, 1, oo)), oo)
```
:::

::: deeper The horn's surface area
When the graph of $f \ge 0$, with $f'$ continuous on $[a, b]$, rotates about the $x$-axis, it sweeps out a surface of area

$$S = 2\pi\int_a^b f(x)\sqrt{1 + f'(x)^2}\,dx.$$

The idea of the proof: each chord of the polygon of Section 12.5 sweeps out a band, the curved side of a cone with its tip cut off. Cutting the band open and flattening it shows that its area is $\pi(r_1 + r_2)\ell$, where $r_1$ and $r_2$ are the radii of its two ends and $\ell$ is its slant length, here the length of the chord, $\sqrt{1 + f'(x_i^*)^2}\,\Delta x$. With $r_1 + r_2 \approx 2f(x_i^*)$, the bands add up to approximately a Riemann sum of $2\pi f(x)\sqrt{1 + f'(x)^2}$. (Module 20 treats the area of surfaces in general.) A check: for a ball of radius $a$, $f(x) = \sqrt{a^2 - x^2}$ gives $f(x)\sqrt{1 + f'(x)^2} = a$, and $S = 2\pi \cdot a \cdot 2a = 4\pi a^2$, the familiar area of a sphere.

For the horn, $f(x) = 1/x$ and $f'(x) = -1/x^2$, so the integrand is

$$\frac{2\pi}{x}\sqrt{1 + \frac{1}{x^4}} \ge \frac{2\pi}{x},$$

and $\int_1^\infty 2\pi\,dx/x$ diverges, so by the comparison test the horn's surface area is infinite. The horn holds $\pi$ cubic units of paint, yet no finite amount of paint could cover its inside with a coat of a fixed thickness $d$, which would need about $S\,d$ of paint. There is no contradiction: far along the horn, the paint that fills it forms a layer thinner than any fixed $d$.

```check
fsph = sqrt(aq**2 - x**2)
same(simplify(1 + diff(fsph, x)**2), aq**2/(aq**2 - x**2))
dpos = symbols('d', positive=True)                         # d = a^2 - x^2 > 0 for -a < x < a
same(sqrt(dpos)*sqrt(aq**2/dpos), aq)
same(2*pi*integrate(aq, (x, -aq, aq)), 4*pi*aq**2)
xh = symbols('x', positive=True)
same(diff(1/xh, xh), -1/xh**2); holds(all(sqrt(1 + 1/Integer(v)**4) >= 1 for v in (1, 2, 10)))
same(integrate(2*pi/x, (x, 1, oo)), oo)
```
:::

::: compute Improper integrals with SymPy
SymPy's `integrate` accepts `sp.oo`, infinity, as a limit, and answers `oo` when an integral diverges to infinity:

```python
import sympy as sp
x = sp.symbols('x')
print(sp.integrate(1/x**2, (x, 1, sp.oo)))
print(sp.integrate(1/x, (x, 1, sp.oo)))
print(sp.integrate(sp.exp(-x**2), (x, -sp.oo, sp.oo)))
print(sp.integrate(1/x**2, (x, -1, 1)))
```

```output
1
oo
sqrt(pi)
oo
```

The last line is the pitfall of Section 12.8: SymPy notices the trouble at 0 inside the interval. Your own use of an antiderivative does not:

```python
F = sp.integrate(1/x**2, x)
print(F, F.subs(x, 1) - F.subs(x, -1))
```

```output
-1/x -2
```

With a symbol for the power, SymPy states when the $p$-integral converges:

```python
p = sp.symbols('p', positive=True)
print(sp.integrate(x**(-p), (x, 1, sp.oo)))
```

```output
Piecewise((1/(p - 1), p > 1), (Integral(x**(-p), (x, 1, oo)), True))
```

A `Piecewise` result reads like a definition by cases: $1/(p - 1)$ when $p > 1$, and otherwise the integral left unevaluated, because it diverges.
:::

## Probability {#probability}

### Probability densities {#densities}

Some quantities are random: the time until the next request reaches a web server, the lifetime of a component, the error of a measurement. Their values cannot be predicted, but their probabilities can. The **probability** of an event, $P(\text{event})$, is a number from 0 to 1, the fraction of the time the event happens in a long run of repetitions; 1 means certain. A **random variable** $X$ is a quantity whose value is decided by chance; it is **continuous** if it can take any value in an interval.

Measure such an $X$ many times and draw a histogram in which the area of each bar is the fraction of the measurements in its bin. With more measurements and narrower bins, the tops of the bars settle onto a curve $y = f(x)$, and the fraction of the values between $a$ and $b$ settles onto the area under the curve from $a$ to $b$.

::: definition Probability density function
A **probability density function** is a function $f$ with $f(x) \ge 0$ for every $x$ and

$$\int_{-\infty}^{\infty} f(x)\,dx = 1.$$

A random variable $X$ has density $f$ if, for all numbers $a \le b$,

$$P(a \le X \le b) = \int_a^b f(x)\,dx.$$
:::

The total area 1 says that $X$ is certain to take some value. A density may jump, as the exponential density below does at 0; split the integrals at the jumps. Two consequences: a single value has probability $P(X = a) = \int_a^a f(x)\,dx = 0$, so it does not matter whether the inequalities are strict ($<$) or not ($\le$); and $f(x)$ is not a probability but a probability per unit length, $P(x \le X \le x + \Delta x) \approx f(x)\,\Delta x$ for a small $\Delta x$, so $f(x)$ can be larger than 1.

The simplest density is the **uniform** density on $[0, 1]$, equal to 1 there and 0 elsewhere: for $0 \le a \le b \le 1$, $P(a \le X \le b) = b - a$, the length of the interval. A computer's random-number generator, such as Python's `random.random()`, imitates it.

::: example A density on an interval
Find the constant $c$ for which $f(x) = cx(2 - x)$ for $0 \le x \le 2$, and $f(x) = 0$ otherwise, is a probability density function. Then find $P\big(X \le \tfrac12\big)$ for a random variable $X$ with this density.

For $c \ge 0$, $f \ge 0$, since $x(2 - x) \ge 0$ on $[0, 2]$. The total area must be 1:

$$\begin{aligned} &\int_0^2 cx(2 - x)\,dx = c\Big[x^2 - \frac{x^3}{3}\Big]_0^2 \\ &\qquad= c\Big(4 - \frac83\Big) = \frac{4c}{3} = 1, \end{aligned}$$

so $c = \tfrac34$. Then, since $f = 0$ to the left of 0,

$$\begin{aligned} P\Big(X \le \frac12\Big) &= \frac34\int_0^{1/2} \big(2x - x^2\big)\,dx \\ &= \frac34\Big(\frac14 - \frac{1}{24}\Big) \\ &= \frac{5}{32} \approx 0.156. \end{aligned}$$

```check
antideriv(x**2 - x**3/3, x*(2 - x), x); same(integrate(c*x*(2 - x), (x, 0, 2)), 4*c/3); same(solve(Eq(4*c/3, 1), c), [Rational(3, 4)])
same(Rational(3, 4)*integrate(2*x - x**2, (x, 0, Rational(1, 2))), Rational(5, 32)); same(Rational(3, 4)*(Rational(1, 4) - Rational(1, 24)), Rational(5, 32))
rounds(Rational(5, 32), '0.156')
```
:::

### Expected value {#expected-value}

Average many values of $X$. About the fraction $f(x)\,\Delta x$ of them lie in a thin slice near $x$, and they contribute about $x \cdot f(x)\,\Delta x$ to the average. Adding the slices and taking the limit gives the expected value.

::: definition Expected value
The **expected value**, or **mean**, of a random variable $X$ with density $f$ is

$$\mu = E(X) = \int_{-\infty}^{\infty} x\,f(x)\,dx,$$

provided the integral converges. ($\mu$ is the Greek letter "mu".)
:::

This is the centre of mass of a rod (Definition 12.5) with density $f$ and total mass 1: the mean is the point where the graph of the density would balance. The density of Example 12.20 is symmetric about $x = 1$, so its mean is 1, and the integral agrees: $\tfrac34\int_0^2 x^2(2 - x)\,dx = \tfrac34 \cdot \tfrac43 = 1$.

```check
same(Rational(3, 4)*integrate(x**2*(2 - x), (x, 0, 2)), 1); same(integrate(x**2*(2 - x), (x, 0, 2)), Rational(4, 3))
same((x*(2 - x)).subs(x, 1 + h), (x*(2 - x)).subs(x, 1 - h))
```

::: pitfall
Not every density has a mean. The function $f(x) = \dfrac{1}{\pi(1 + x^2)}$ is a density (Example 12.16(c) shows that its total area is 1), and its graph is symmetric about 0. But, with the substitution $u = 1 + x^2$,

$$\int_0^t \frac{x}{\pi(1 + x^2)}\,dx = \frac{\ln(1 + t^2)}{2\pi} \to \infty,$$

so the integral for the mean diverges, and this random variable (it follows the Cauchy distribution) has no expected value. Symmetry gives the mean only when the integral converges.

```check
same(integrate(1/(pi*(1 + x**2)), (x, -oo, oo)), 1)
tp2 = symbols('t', positive=True); same(integrate(x/(pi*(1 + x**2)), (x, 0, tp2)), log(1 + tp2**2)/(2*pi)); limit_is(log(1 + t**2)/(2*pi), t, oo, oo)
```
:::

### The exponential distribution {#exponential-distribution}

Some events happen at random times, independently of one another, at a steady average rate of $\lambda$ per unit of time ($\lambda$ is the Greek letter "lambda"): the decays of the atoms in a radioactive sample, or requests arriving at a busy server. The waiting time $X$ for the next such event is modelled by the **exponential density** with **rate** $\lambda > 0$,

$$f(x) = \begin{cases} \lambda e^{-\lambda x} & \text{if } x \ge 0, \\ 0 & \text{if } x < 0. \end{cases}$$

It is a density: $f \ge 0$, and $\int_0^\infty \lambda e^{-\lambda x}\,dx = \lim_{t\to\infty}\big(1 - e^{-\lambda t}\big) = 1$. In the same way, for $t \ge 0$,

$$P(X > t) = \int_t^\infty \lambda e^{-\lambda x}\,dx = e^{-\lambda t}:$$

the chance of waiting longer than $t$ decays exponentially (Module 6). For the mean, substitute $u = \lambda x$ and use Example 12.16(b):

$$\begin{aligned} E(X) &= \int_0^\infty x\,\lambda e^{-\lambda x}\,dx \\ &= \frac{1}{\lambda}\int_0^\infty ue^{-u}\,du = \frac1\lambda. \end{aligned}$$

At an average of $\lambda$ events per second, the average wait is $1/\lambda$ seconds.

```check
lam = symbols('lambda', positive=True)
same(integrate(lam*exp(-lam*x), (x, 0, t)), 1 - exp(-lam*t)); limit_is(1 - exp(-lam*t), t, oo, 1)
same(integrate(lam*exp(-lam*x), (x, tp2, oo)), exp(-lam*tp2))
same((x*lam*exp(-lam*x)).subs(x, u/lam)/lam, u*exp(-u)/lam)
same(integrate(x*lam*exp(-lam*x), (x, 0, oo)), 1/lam)
```

::: example Waiting for a request
Suppose requests reach a server at random at an average rate of 2 per second (a hypothetical server), so that the waiting time $X$, in seconds, for the next request has the exponential density with $\lambda = 2$ (Figure 12.5, left). Find (a) $P(X > 1)$, (b) $P(0.5 \le X \le 1)$, (c) the mean wait and (d) the median wait, the time $m$ with $P(X \le m) = \tfrac12$.

**(a)** $P(X > 1) = e^{-2 \cdot 1} = e^{-2} \approx 0.135$.

**(b)** $P(0.5 \le X \le 1) = P(X \ge 0.5) - P(X > 1) = e^{-1} - e^{-2} \approx 0.233$.

**(c)** $E(X) = 1/\lambda = 0.5$ s.

**(d)** $P(X \le m) = 1 - e^{-2m} = \tfrac12$ gives $e^{-2m} = \tfrac12$, so $-2m = \ln\tfrac12 = -\ln 2$, and $m = \tfrac12\ln 2 \approx 0.347$ s. Half the waits are shorter than 0.347 s, although the mean is 0.5 s: the rare long waits pull the mean up. For radioactive atoms, the median lifetime $\ln 2/\lambda$ is the half-life of exponential decay (Module 6).

```check
same(exp(-2*1), exp(-2)); rounds(exp(-2), '0.135'); rounds(exp(-1) - exp(-2), '0.233')
same(integrate(2*exp(-2*x), (x, Rational(1, 2), 1)), exp(-1) - exp(-2))
mm = symbols('m', positive=True); same(solve(Eq(1 - exp(-2*mm), Rational(1, 2)), mm), [log(2)/2]); rounds(log(2)/2, '0.347')
```
:::

::: figure id=fig-12-5
Probabilities are areas under a density. Left: the exponential density $f(x) = 2e^{-2x}$ of Example 12.21; the shaded area is $P(0.5 \le X \le 1) = e^{-1} - e^{-2} \approx 0.233$. The filled dot shows $f(0) = 2$: a density can exceed 1. Right: the standard normal density $\varphi$, introduced below; the shaded area, $P(-1 \le Z \le 1) \approx 0.683$, is the probability of landing within one standard deviation of the mean.
:::

The exponential distribution has a striking property. The **conditional probability** $P(A \mid B)$, read "the probability of A given B", is the probability that $A$ happens among the occasions on which $B$ happens:

$$P(A \mid B) = \frac{P(A \text{ and } B)}{P(B)}, \quad\text{for } P(B) > 0.$$

::: theorem The exponential distribution has no memory
If $X$ has the exponential density with rate $\lambda$, then for all $s \ge 0$ and $t \ge 0$,

$$P(X > s + t \mid X > s) = P(X > t).$$
:::

::: proof
If $X > s + t$ then $X > s$, so the event "$X > s + t$ and $X > s$" is the event $X > s + t$. Therefore

$$\begin{aligned} &P(X > s + t \mid X > s) \\ &\quad= \frac{P(X > s + t)}{P(X > s)} = \frac{e^{-\lambda(s + t)}}{e^{-\lambda s}} \\ &\quad= e^{-\lambda t} = P(X > t). \end{aligned}$$
:::

```check
sm, tm = symbols('s t', nonnegative=True)
same(exp(-lam*(sm + tm))/exp(-lam*sm), exp(-lam*tm))
```

Having waited $s$ seconds for a request does not bring the next one any closer: the remaining wait has the same distribution as a fresh one. As a model of lifetimes, the exponential distribution describes things that do not wear out, such as an atom that has not yet decayed; it is a poor model for things that age, such as tyres or people.

::: pitfall
The condition changes the answer. With $\lambda = 2$, the probability of waiting more than 1.5 s in all, given that you have already waited 1 s, is $P(X > 0.5) = e^{-1} \approx 0.368$, not $P(X > 1.5) = e^{-3} \approx 0.050$: the second is the probability, before you start waiting, of waiting that long.

```check
same(exp(-2*Rational(3, 2))/exp(-2*1), exp(-2*Rational(1, 2))); rounds(exp(-1), '0.368'); rounds(exp(-3), '0.050')
```
:::

### The normal distribution {#normal}

The most important density in statistics is the bell-shaped **standard normal density**

$$\varphi(z) = \frac{1}{\sqrt{2\pi}}\,e^{-z^2/2},$$

where $\varphi$ is the Greek letter "phi" (Figure 12.5, right). Measurement errors, and many quantities that are the sum of many small independent effects, are distributed approximately like this, shifted and scaled; the reason, the central limit theorem of probability theory, is beyond this series.

Why the factor $1/\sqrt{2\pi}$? The total area must be 1. Section 12.8 showed, after Example 12.18, that $\int_{-\infty}^{\infty} e^{-x^2}\,dx$ converges. Its value is the **Gaussian integral**

$$\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}.$$

No antiderivative helps here, since $e^{-x^2}$ has no elementary one (Module 11). Module 19 proves this value with a beautiful trick, a double integral in polar coordinates; this module quotes it. The substitution $z = \sqrt2\,x$, with $dz = \sqrt2\,dx$ (Module 10; the infinite limits stay infinite), gives

$$\int_{-\infty}^{\infty} e^{-z^2/2}\,dz = \sqrt2\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{2\pi},$$

so $\varphi$ has total area 1. Its mean is 0: the integral $\int_0^\infty z e^{-z^2/2}\,dz$ converges, to 1 (substitute $u = z^2/2$), and $z\varphi(z)$ is odd, so the two halves of the integral for the mean cancel.

```check
same(integrate(exp(-x**2), (x, -oo, oo)), sqrt(pi)); same(integrate(exp(-z**2/2), (z, -oo, oo)), sqrt(2*pi))
same((exp(-z**2/2)).subs(z, sqrt(2)*x)*sqrt(2), sqrt(2)*exp(-x**2))
phi12 = exp(-z**2/2)/sqrt(2*pi)
same(integrate(phi12, (z, -oo, oo)), 1); same(integrate(z*exp(-z**2/2), (z, 0, oo)), 1); same(integrate(z*phi12, (z, -oo, oo)), 0)
```

More generally, the **normal distribution** with mean $\mu$ and **standard deviation** $\sigma > 0$ (the Greek "sigma") has the density

$$f(x) = \frac{1}{\sigma\sqrt{2\pi}}\,e^{-(x - \mu)^2/(2\sigma^2)},$$

a bell centred at $\mu$ whose width is proportional to $\sigma$. Exercise 12.12 shows that $\sigma^2$ is the mean squared distance from the mean, and that the bell's points of inflection are at $\mu \pm \sigma$. The substitution $z = (x - \mu)/\sigma$ turns $f$ into $\varphi$: if $X$ has this density and $Z$ has the standard normal density, then

$$P(a \le X \le b) = P\Big(\frac{a - \mu}{\sigma} \le Z \le \frac{b - \mu}{\sigma}\Big).$$

One function, $\varphi$, serves every normal distribution.

```check
mu_, sg = symbols('mu sigma', positive=True); aa, bb = symbols('a b', real=True)
fN = exp(-(x - mu_)**2/(2*sg**2))/(sg*sqrt(2*pi))
same(fN.subs(x, mu_ + sg*z)*sg, phi12); same(integrate(fN, (x, -oo, oo)), 1)
same(integrate(fN, (x, aa, bb)), integrate(phi12, (z, (aa - mu_)/sg, (bb - mu_)/sg)))
```

**Computing normal probabilities.** Since $\varphi$ has no elementary antiderivative, normal probabilities are computed numerically, for example with Simpson's rule (Module 11), or with the **error function** of Module 11,

$$\operatorname{erf}(x) = \frac{2}{\sqrt\pi}\int_0^x e^{-t^2}\,dt,$$

which calculators and programming languages provide (in Python, `math.erf`). Since $\varphi$ is even, $P(-c \le Z \le c) = 2\int_0^c \varphi(z)\,dz$ for $c > 0$, and the substitution $z = \sqrt2\,t$ turns this into an error function:

$$\begin{aligned} P(-c \le Z \le c) &= \frac{2}{\sqrt{2\pi}}\int_0^{c} e^{-z^2/2}\,dz \\ &= \frac{2}{\sqrt\pi}\int_0^{c/\sqrt2} e^{-t^2}\,dt \\ &= \operatorname{erf}\Big(\frac{c}{\sqrt2}\Big). \end{aligned}$$

```valuetable
c = 1, 1.645, 1.96, 2, 2.576, 3
$P(-c \le Z \le c) = \operatorname{erf}(c/\sqrt2)$ = erf(c/sqrt(2))
digits = 4
---
c | P(-c \le Z \le c) = \operatorname{erf}(c/\sqrt2)
1 | 0.6827
1.645 | 0.9000
1.96 | 0.9500
2 | 0.9545
2.576 | 0.9900
3 | 0.9973
```

The rows for 1, 2 and 3 are the **68–95–99.7 rule**: a normal random variable lies within one standard deviation of its mean about 68% of the time, within two about 95% of the time, and within three about 99.7% of the time. The values 1.645, 1.96 and 2.576 give 90%, 95% and 99%; statisticians use them to state how precise an estimate is.

```check
cp_ = symbols('c', positive=True)
same(2*integrate(phi12, (z, 0, cp_)), erf(cp_/sqrt(2)))
same((2/sqrt(2*pi)*exp(-z**2/2)).subs(z, sqrt(2)*t)*sqrt(2), 2/sqrt(pi)*exp(-t**2))
for cv, txt in ((1, '0.68'), (2, '0.95'), (3, '0.997')):
    rounds(erf(cv/sqrt(2)), txt)
```

::: example A sensor's error
Suppose a thermometer's error, its reading minus the true temperature, is normally distributed with mean 0 °C and standard deviation 0.4 °C (a hypothetical sensor). Find the probability that (a) a reading is within 0.5 °C of the true temperature, and (b) the error is more than 1 °C either way.

**(a)** Standardise with $z = x/0.4$: $0.5$ °C becomes $z = 1.25$, so

$$\begin{aligned} &P(-0.5 \le X \le 0.5) \\ &\qquad= P(-1.25 \le Z \le 1.25) \\ &\qquad= \operatorname{erf}\Big(\frac{1.25}{\sqrt2}\Big) \approx 0.789. \end{aligned}$$

**(b)** Now 1 °C becomes $z = 2.5$, and the error is more than 1 °C either way exactly when it is not within 1 °C:

$$\begin{aligned} P(\abs{X} > 1) &= 1 - P(-2.5 \le Z \le 2.5) \\ &= 1 - \operatorname{erf}\Big(\frac{2.5}{\sqrt2}\Big) \approx 0.0124, \end{aligned}$$

so about 1.2% of the readings are that far off.

```check
same(Rational(5, 10)/Rational(4, 10), Rational(125, 100)); same(1/Rational(4, 10), Rational(25, 10))
rounds(erf(Rational(125, 100)/sqrt(2)), '0.789'); P1222 = 1 - erf(Rational(25, 10)/sqrt(2)); rounds(P1222, '0.0124'); rounds(100*P1222, '1.2')
fS = exp(-x**2/(2*Rational(4, 10)**2))/(Rational(4, 10)*sqrt(2*pi))
near(Integral(fS, (x, -Rational(1, 2), Rational(1, 2))).evalf(30), erf(Rational(125, 100)/sqrt(2)).evalf(30), 1e-20)
```
:::

::: pitfall
Standardise before you use the table or the error function. In Example 12.22, $P(-0.5 \le X \le 0.5)$ is not $\operatorname{erf}(0.5/\sqrt2) \approx 0.383$: that would be the answer for a standard deviation of 1 °C, not 0.4 °C.

```check
rounds(erf(Rational(1, 2)/sqrt(2)), '0.383')
```
:::

::: compute Probabilities by computer
Python's `math` module has `exp`, `log` and `erf`, enough for the probabilities of Examples 12.21 and 12.22:

```python
import math
lam = 2.0
print("P(X > 1)         =", math.exp(-lam*1))
print("P(0.5 <= X <= 1) =", math.exp(-lam*0.5) - math.exp(-lam*1))
print("median wait      =", math.log(2)/lam)
print("P(|Z| <= 1.25)   =", math.erf(1.25/math.sqrt(2)))
```

```output
P(X > 1)         = 0.1353352832366127
P(0.5 <= X <= 1) = 0.23254415793482963
median wait      = 0.34657359027997264
P(|Z| <= 1.25)   = 0.7887004526662894
```

You can also watch probabilities emerge from simulated data. If $U$ is uniform on $[0, 1)$, then $X = -\ln(1 - U)/\lambda$ has the exponential density, because $P(X > t) = P\big(1 - U < e^{-\lambda t}\big) = e^{-\lambda t}$. Simulate 100,000 waits (the seed fixes the random numbers, so you see the same output as here):

```python
import random
random.seed(2026)
waits = [-math.log(1 - random.random())/lam for _ in range(100_000)]
long_waits = [w for w in waits if w > 1]
longer = [w for w in long_waits if w > 1.5]
print("mean of the waits:   ", round(sum(waits)/len(waits), 4))
print("fraction over 1 s:   ", round(len(long_waits)/len(waits), 4))
print("of those, over 1.5 s:", round(len(longer)/len(long_waits), 4))
```

```output
mean of the waits:    0.498
fraction over 1 s:    0.1343
of those, over 1.5 s: 0.3658
```

The simulated mean is close to $1/\lambda = 0.5$, the fraction of waits longer than 1 s is close to $e^{-2} \approx 0.135$, and, among those, the fraction that last at least another 0.5 s is close to $e^{-1} \approx 0.368$: the memoryless property, seen in data.
:::

## What you learned {#summary}

- **Slice, approximate, add, take the limit.** A quantity spread over $[a, b]$ whose slice near $x$ holds about $q(x)\,\Delta x$ is $\int_a^b q(x)\,dx$. The true amount in each slice must lie between $\Delta x$ times the least and the greatest values of $q$ there; check the units of $q(x)\,dx$.
- **Areas**: $\int_a^b (\text{top} - \text{bottom})\,dx$ with vertical strips, $\int_c^d (\text{right} - \text{left})\,dy$ with horizontal strips. Find where the curves meet, and split where they cross.
- **Volumes**: $\int_a^b A(x)\,dx$ for known cross-sections (a pyramid or cone is $\tfrac13$ base times height). For solids of revolution: discs $\pi\int f^2$, washers $\pi\int (R^2 - r^2)$, shells $2\pi\int (\text{radius})(\text{height})$, with radii measured from the axis.
- **Arc length**: $L = \int_a^b \sqrt{1 + f'(x)^2}\,dx$, the limit of the lengths of inscribed polygons (Pythagoras and the Mean Value Theorem). Most arc length integrals need numerical evaluation.
- **Work**: $W = \int_a^b F(x)\,dx$, in joules when the force is in newtons and the distance in metres. A spring obeys $F = kx$ (Hooke's law); for ropes and tanks, slice the object and multiply each slice's weight by its own distance.
- **Centre of mass**: $\bar x = \int x\rho\,dx \big/ \int \rho\,dx$ for a rod; for a plate, the centroid $\bar x = \frac1A\int x(f - g)\,dx$, $\bar y = \frac1A\int \tfrac12\big(f^2 - g^2\big)\,dx$, on any line of symmetry.
- **Improper integrals** are limits of ordinary integrals, over infinite intervals or of unbounded integrands; they converge or diverge. $\int_1^\infty dx/x^p$ converges exactly when $p > 1$, $\int_0^1 dx/x^p$ exactly when $p < 1$. The comparison and limit comparison tests decide convergence without evaluating. Look for hidden infinities before using the Fundamental Theorem. Gabriel's horn has volume $\pi$ but infinite surface area.
- **Probability**: a density $f \ge 0$ with total area 1 gives $P(a \le X \le b) = \int_a^b f(x)\,dx$ and mean $\mu = \int x f(x)\,dx$ (when it converges). The exponential density $\lambda e^{-\lambda x}$ has $P(X > t) = e^{-\lambda t}$, mean $1/\lambda$ and no memory. The normal density rests on the Gaussian integral $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$ (proved in Module 19); its probabilities come from the error function or numerical integration: $P(\abs{Z} \le c) = \operatorname{erf}(c/\sqrt2)$, the 68–95–99.7 rule.

```check
same(integrate(exp(-x**2), (x, -oo, oo)), sqrt(pi))
```

## Exercises {#exercises}

:::: exercise Curves that cross {#ex-12-1} ★
Find the area of the region enclosed by the curves $y = x^3$ and $y = x$. Explain why $\int_{-1}^{1} (x - x^3)\,dx$ is not the answer.

::: solution
The curves meet where $x^3 = x$, that is, $x(x - 1)(x + 1) = 0$: at $x = -1$, 0 and 1. On $[0, 1]$, at $x = \tfrac12$, the line gives $\tfrac12$ and the cubic $\tfrac18$, so the line is on top. On $[-1, 0]$, at $x = -\tfrac12$, the cubic gives $-\tfrac18$ and the line $-\tfrac12$, so the cubic is on top. Split at the crossing:

$$\begin{aligned} A &= \int_{-1}^{0} \big(x^3 - x\big)\,dx \\ &\qquad + \int_0^1 \big(x - x^3\big)\,dx \\ &= \Big[\frac{x^4}{4} - \frac{x^2}{2}\Big]_{-1}^{0} \\ &\qquad + \Big[\frac{x^2}{2} - \frac{x^4}{4}\Big]_0^1 \\ &= \frac14 + \frac14 = \frac12. \end{aligned}$$

$\int_{-1}^{1}(x - x^3)\,dx = 0$, because on $[-1, 0]$ the line is below the cubic and that part counts as $-\tfrac14$: the integral is a net (signed) area, not the area. The region consists of two pieces, mirror images of each other through the origin, each of area $\tfrac14$.

```check
same_set(solve(x**3 - x, x), [-1, 0, 1])
holds(Rational(1, 2) > Rational(1, 8)); holds(-Rational(1, 8) > -Rational(1, 2))
same(integrate(x**3 - x, (x, -1, 0)), Rational(1, 4)); same(integrate(x - x**3, (x, 0, 1)), Rational(1, 4))
antideriv(x**4/4 - x**2/2, x**3 - x, x); same(integrate(Abs(x - x**3), (x, -1, 1)), Rational(1, 2))
same(integrate(x - x**3, (x, -1, 1)), 0)
```
:::
::::

:::: exercise Discs and shells {#ex-12-2} ★
The region under $y = \sqrt x$, $0 \le x \le 4$, rotates (a) about the $x$-axis and (b) about the $y$-axis. Find both volumes, using shells in (b).

::: solution
**(a)** Discs of radius $\sqrt x$:

$$\begin{aligned} V &= \pi\int_0^4 \big(\sqrt x\big)^2\,dx \\ &= \pi\int_0^4 x\,dx \\ &= \pi\cdot\frac{16}{2} = 8\pi \approx 25.13. \end{aligned}$$

**(b)** A strip at $x$ has radius $x$ and height $\sqrt x$:

$$\begin{aligned} V &= 2\pi\int_0^4 x\sqrt x\,dx \\ &= 2\pi\int_0^4 x^{3/2}\,dx \\ &= 2\pi\cdot\frac25\cdot 4^{5/2} = 2\pi\cdot\frac25\cdot 32 \\ &= \frac{128\pi}{5} \approx 80.42. \end{aligned}$$

A check with washers: at height $y$, for $0 \le y \le 2$, the region runs from $x = y^2$ to $x = 4$, so $R = 4$, $r = y^2$, and $\pi\int_0^2 \big(16 - y^4\big)\,dy = \pi\big(32 - \tfrac{32}{5}\big) = \tfrac{128\pi}{5}$.

```check
same(pi*integrate(x, (x, 0, 4)), 8*pi); rounds(8*pi, '25.13')
xq2 = symbols('x', positive=True); same(xq2*sqrt(xq2), xq2**Rational(3, 2)); antideriv(Rational(2, 5)*xq2**Rational(5, 2), xq2**Rational(3, 2), xq2)
same(Integer(4)**Rational(5, 2), 32); same(2*pi*Rational(2, 5)*32, 128*pi/5); same(2*pi*integrate(x*sqrt(x), (x, 0, 4)), 128*pi/5)
rounds(128*pi/5, '80.42'); same(pi*integrate(16 - y**4, (y, 0, 2)), 128*pi/5); same(pi*(32 - Rational(32, 5)), 128*pi/5)
```
:::
::::

:::: exercise A spring {#ex-12-3} ★
A spring has a natural length of 20 cm. A force of 12 N holds it at a length of 25 cm. How much work does it take to stretch it from a length of 25 cm to a length of 35 cm?

::: solution
Work in metres. At 25 cm the spring is stretched $0.05$ m, so Hooke's law gives $12 = k \times 0.05$ and $k = 240$ N/m. Stretching from 25 cm to 35 cm takes the stretch from 0.05 m to 0.15 m:

$$\begin{aligned} W &= \int_{0.05}^{0.15} 240x\,dx \\ &= \big[120x^2\big]_{0.05}^{0.15} \\ &= 120\,(0.0225 - 0.0025) \\ &= 2.4 \text{ J}. \end{aligned}$$

The common wrong answer integrates over the lengths, from 0.25 to 0.35, and gets $120(0.1225 - 0.0625) = 7.2$ J; but Hooke's law is about the stretch beyond the natural length, not the length itself.

```check
same(Rational(12)/Rational(5, 100), 240); antideriv(120*x**2, 240*x, x)
steps(Integral(240*x, (x, Rational(5, 100), Rational(15, 100))), 120*(Rational(225, 10000) - Rational(25, 10000)), Rational(24, 10))
same(integrate(240*x, (x, Rational(25, 100), Rational(35, 100))), Rational(72, 10)); same(120*(Rational(1225, 10000) - Rational(625, 10000)), Rational(72, 10))
```
:::
::::

:::: exercise Converge or diverge? {#ex-12-4} ★
Decide whether each integral converges, and find its value if it does.

- (a) $\displaystyle\int_1^\infty \frac{dx}{x^{3/2}}$
- (b) $\displaystyle\int_0^1 \frac{dx}{x^{3/2}}$
- (c) $\displaystyle\int_0^\infty e^{-3x}\,dx$
- (d) $\displaystyle\int_0^4 \frac{dx}{\sqrt{4 - x}}$

::: solution
**(a)** A $p$-integral with $p = \tfrac32 > 1$: it converges, to $\dfrac{1}{3/2 - 1} = 2$. Directly: $\int_1^t x^{-3/2}\,dx = 2 - \dfrac{2}{\sqrt t} \to 2$.

**(b)** Near 0 the $p$-integral needs $p < 1$, and $p = \tfrac32$: it diverges. Directly: $\int_t^1 x^{-3/2}\,dx = \dfrac{2}{\sqrt t} - 2 \to \infty$ as $t \to 0^+$.

**(c)** $\int_0^t e^{-3x}\,dx = \Big[-\dfrac{e^{-3x}}{3}\Big]_0^t = \dfrac{1 - e^{-3t}}{3} \to \dfrac13$: it converges, to $\tfrac13$.

**(d)** The integrand is unbounded near $x = 4$. An antiderivative of $(4 - x)^{-1/2}$ is $-2\sqrt{4 - x}$ (substitute $u = 4 - x$), so for $0 < t < 4$

$$\int_0^t \frac{dx}{\sqrt{4 - x}} = 4 - 2\sqrt{4 - t},$$

which approaches 4 as $t \to 4^-$. It converges, to 4.

```check
same(integrate(x**Rational(-3, 2), (x, 1, t)), 2 - 2/sqrt(t)); limit_is(2 - 2/sqrt(t), t, oo, 2); same(1/(Rational(3, 2) - 1), 2)
same(integrate(x**Rational(-3, 2), (x, t, 1)), 2/sqrt(t) - 2); limit_is(2/sqrt(t) - 2, t, 0, oo, '+')
antideriv(-exp(-3*x)/3, exp(-3*x), x); same(integrate(exp(-3*x), (x, 0, t)), (1 - exp(-3*t))/3); limit_is((1 - exp(-3*t))/3, t, oo, Rational(1, 3))
antideriv(-2*sqrt(4 - x), 1/sqrt(4 - x), x)
tq4 = symbols('t', positive=True); same(integrate(1/sqrt(4 - x), (x, 0, tq4)).subs(tq4, Rational(3)), 4 - 2*sqrt(4 - 3))
limit_is(4 - 2*sqrt(4 - t), t, 4, 4, '-'); same(integrate(1/sqrt(4 - x), (x, 0, 4)), 4)
```
:::
::::

:::: exercise Horizontal strips {#ex-12-5} ★★
Find the area of the region enclosed by the parabola $x = y^2 - 4$ and the line $x + y = 2$. Why would vertical strips make this harder?

::: solution
Write the line as $x = 2 - y$. The curves meet where $y^2 - 4 = 2 - y$, that is, $y^2 + y - 6 = 0$, or $(y + 3)(y - 2) = 0$: at $y = -3$ and $y = 2$, the points $(5, -3)$ and $(0, 2)$. At $y = 0$ the line is at $x = 2$ and the parabola at $x = -4$, so the line is on the right. Right minus left is $(2 - y) - (y^2 - 4) = 6 - y - y^2$, and

$$\begin{aligned} A &= \int_{-3}^{2} \big(6 - y - y^2\big)\,dy \\ &= \Big[6y - \frac{y^2}{2} - \frac{y^3}{3}\Big]_{-3}^{2} \\ &= \frac{22}{3} - \Big(-\frac{27}{2}\Big) \\ &= \frac{125}{6} \approx 20.83. \end{aligned}$$

With vertical strips, the lower boundary is the lower half of the parabola, $y = -\sqrt{x + 4}$, all the way, but the upper boundary changes at $x = 0$: for $-4 \le x \le 0$ it is the upper half of the parabola, $y = \sqrt{x + 4}$, and for $0 \le x \le 5$ it is the line $y = 2 - x$. That means two integrals, both with square roots.

```check
same_set(solve(Eq(y**2 - 4, 2 - y), y), [-3, 2]); same(factor(y**2 + y - 6), (y + 3)*(y - 2))
same(((y**2 - 4).subs(y, -3), (2 - y).subs(y, -3)), (5, 5)); same(((y**2 - 4).subs(y, 2), (2 - y).subs(y, 2)), (0, 0))
H125 = 6*y - y**2/2 - y**3/3
antideriv(H125, 6 - y - y**2, y); same(H125.subs(y, 2), Rational(22, 3)); same(H125.subs(y, -3), -Rational(27, 2))
same(Rational(22, 3) + Rational(27, 2), Rational(125, 6)); rounds(Rational(125, 6), '20.83')
same(integrate(sqrt(x + 4) - (-sqrt(x + 4)), (x, -4, 0)) + integrate(2 - x - (-sqrt(x + 4)), (x, 0, 5)), Rational(125, 6))
```
:::
::::

:::: exercise Two arc lengths {#ex-12-6} ★★
- (a) Find the exact length of $y = \dfrac{x^2}{4} - \dfrac{\ln x}{2}$ for $1 \le x \le e$. (Hint: $1 + f'(x)^2$ is a perfect square.)
- (b) Write down the integral for the length of $y = x^3$, $0 \le x \le 1$, and estimate it with Simpson's rule with $n = 4$.

::: solution
**(a)** $f'(x) = \dfrac{x}{2} - \dfrac{1}{2x}$, so

$$\begin{aligned} 1 + f'(x)^2 &= 1 + \frac{x^2}{4} - \frac12 + \frac{1}{4x^2} \\ &= \frac{x^2}{4} + \frac12 + \frac{1}{4x^2} \\ &= \Big(\frac{x}{2} + \frac{1}{2x}\Big)^2. \end{aligned}$$

For $x > 0$ the bracket is positive, so the square root is $\dfrac{x}{2} + \dfrac{1}{2x}$, and

$$\begin{aligned} L &= \int_1^e \Big(\frac{x}{2} + \frac{1}{2x}\Big)\,dx \\ &= \Big[\frac{x^2}{4} + \frac{\ln x}{2}\Big]_1^e \\ &= \frac{e^2}{4} + \frac12 - \frac14 \\ &= \frac{e^2 + 1}{4} \approx 2.097. \end{aligned}$$

**(b)** $f'(x) = 3x^2$, so $L = \int_0^1 \sqrt{1 + 9x^4}\,dx$, which has no elementary antiderivative. With $n = 4$, $\Delta x = 0.25$, and $g(x) = \sqrt{1 + 9x^4}$: $g(0) = 1$, $g(0.25) \approx 1.01743$, $g(0.5) = 1.25$, $g(0.75) \approx 1.96154$ and $g(1) = \sqrt{10} \approx 3.16228$. Simpson's rule gives

$$\begin{aligned} S_4 &= \frac{0.25}{3}\big[1 + 4(1.01743) \\ &\qquad + 2(1.25) + 4(1.96154) \\ &\qquad + 3.16228\big] \approx 1.5482. \end{aligned}$$

A more accurate value is $L \approx 1.5479$.

```check
f126 = x**2/4 - log(x)/2
same(diff(f126, x), x/2 - 1/(2*x)); same(expand(1 + diff(f126, x)**2), expand((x/2 + 1/(2*x))**2))
antideriv(x**2/4 + log(x)/2, x/2 + 1/(2*x), x); same(integrate(x/2 + 1/(2*x), (x, 1, E)), (E**2 + 1)/4); rounds((E**2 + 1)/4, '2.097')
g126 = sqrt(1 + 9*x**4); same(diff(x**3, x), 3*x**2)
same(g126.subs(x, 0), 1); rounds(g126.subs(x, Rational(1, 4)), '1.01743'); same(g126.subs(x, Rational(1, 2)), Rational(5, 4)); rounds(g126.subs(x, Rational(3, 4)), '1.96154'); rounds(sqrt(10), '3.16228')
S4_126 = Rational(1, 4)/3*(g126.subs(x, 0) + 4*g126.subs(x, Rational(1, 4)) + 2*g126.subs(x, Rational(1, 2)) + 4*g126.subs(x, Rational(3, 4)) + g126.subs(x, 1))
rounds(S4_126, '1.5482'); rounds(Integral(g126, (x, 0, 1)).evalf(30), '1.5479')
```
:::
::::

:::: exercise Pumping water {#ex-12-7} ★★
A cylindrical tank with a vertical axis has radius 1 m and height 3 m. It holds water to a depth of 2 m. How much work does it take to pump all the water out over the top of the tank? (Water has density 1000 kg/m³; take $g = 9.8$ m/s².)

::: solution
Let $y$ be the height above the bottom. The layer of water between heights $y$ and $y + \Delta y$, for $0 \le y \le 2$, is a disc of radius 1 m and thickness $\Delta y$: volume $\pi\,\Delta y$ m³, mass $1000\pi\,\Delta y$ kg, weight $9800\pi\,\Delta y$ N. It is lifted $3 - y$ metres, to the top of the tank. So

$$\begin{aligned} W &= \int_0^2 9800\pi(3 - y)\,dy \\ &= 9800\pi\Big[3y - \frac{y^2}{2}\Big]_0^2 \\ &= 9800\pi(6 - 2) = 39\,200\pi \\ &\approx 1.23 \times 10^5 \text{ J}. \end{aligned}$$

A check with the centre of mass: the water has mass $2000\pi$ kg, and its centre of mass is 1 m above the bottom. Every layer ends up at the top, 3 m up, so on average the water rises 2 m, and $2000\pi \times 9.8 \times 2 = 39\,200\pi$ J. Two slips to avoid: the distance is $3 - y$, to the top of the tank, not $2 - y$, to the surface of the water; and the limits are 0 and 2, where the water is, not 0 and 3.

```check
same(1000*pi*Rational(98, 10), 9800*pi); antideriv(3*y - y**2/2, 3 - y, y)
steps(Integral(9800*pi*(3 - y), (y, 0, 2)), 9800*pi*(6 - 2), 39200*pi)
rounds(39200*pi/10**5, '1.23'); same(1000*pi*1**2*2*Rational(98, 10)*2, 39200*pi)
same(integrate(y*pi, (y, 0, 2))/integrate(pi, (y, 0, 2)), 1)
```
:::
::::

:::: exercise A centroid {#ex-12-8} ★★
Find the centroid of the region between $y = x$ and $y = x^2$, $0 \le x \le 1$, and check that it lies inside the region.

::: solution
For $0 \le x \le 1$, $x \ge x^2$, so $f(x) = x$ and $g(x) = x^2$. The area is $A = \int_0^1 (x - x^2)\,dx = \tfrac12 - \tfrac13 = \tfrac16$. Then

$$\begin{aligned} \bar x &= 6\int_0^1 x\big(x - x^2\big)\,dx \\ &= 6\Big(\frac13 - \frac14\Big) = \frac12, \\ \bar y &= 6\int_0^1 \frac12\big(x^2 - x^4\big)\,dx \\ &= 3\Big(\frac13 - \frac15\Big) = \frac25. \end{aligned}$$

The centroid is $\big(\tfrac12, \tfrac25\big)$. At $x = \tfrac12$ the region runs from $y = \tfrac14$ to $y = \tfrac12$, and $\tfrac25 = 0.4$ lies between them, so the centroid is inside the region.

```check
A128 = integrate(x - x**2, (x, 0, 1)); same(A128, Rational(1, 6))
same(integrate(x*(x - x**2), (x, 0, 1))/A128, Rational(1, 2)); same(6*(Rational(1, 3) - Rational(1, 4)), Rational(1, 2))
same(integrate((x**2 - x**4)/2, (x, 0, 1))/A128, Rational(2, 5)); same(3*(Rational(1, 3) - Rational(1, 5)), Rational(2, 5))
holds(Rational(1, 4) < Rational(2, 5)); holds(Rational(2, 5) < Rational(1, 2))
```
:::
::::

:::: exercise How long does a component last? {#ex-12-9} ★★
The lifetime, in hours, of a type of electronic component has the exponential density with mean 2000 hours (hypothetical figures).

- (a) Find $\lambda$, and the probability that a component lasts more than 3000 hours.
- (b) A component has already worked for 1000 hours. Find the probability that it lasts at least another 3000 hours.
- (c) Find the median lifetime.

::: solution
**(a)** The mean is $1/\lambda = 2000$, so $\lambda = \tfrac{1}{2000}$ per hour, and $P(X > 3000) = e^{-3000/2000} = e^{-1.5} \approx 0.223$.

**(b)** By the memoryless property (Theorem 12.5) with $s = 1000$ and $t = 3000$,

$$\begin{aligned} &P(X > 4000 \mid X > 1000) \\ &\qquad= P(X > 3000) \approx 0.223. \end{aligned}$$

Directly: $\dfrac{P(X > 4000)}{P(X > 1000)} = \dfrac{e^{-2}}{e^{-0.5}} = e^{-1.5}$. The component's past 1000 hours make no difference.

**(c)** $1 - e^{-m/2000} = \tfrac12$ gives $e^{-m/2000} = \tfrac12$, so $m = 2000\ln 2 \approx 1386$ hours, well below the mean.

```check
lam129 = Rational(1, 2000); same(1/lam129, 2000); same(exp(-lam129*3000), exp(-Rational(3, 2))); rounds(exp(-Rational(3, 2)), '0.223')
same(exp(-lam129*4000)/exp(-lam129*1000), exp(-Rational(3, 2))); same(exp(-2)/exp(-Rational(1, 2)), exp(-Rational(3, 2)))
same(solve(Eq(1 - exp(-mm/2000), Rational(1, 2)), mm), [2000*log(2)]); rounds(2000*log(2), '1386')
```
:::
::::

:::: exercise Volumes from centroids {#ex-12-10} ★★★
- (a) A region between $y = g(x)$ and $y = f(x)$, $a \le x \le b$, with $0 \le g(x) \le f(x)$, rotates about the $x$-axis. Show that the volume of the solid is $V = 2\pi\bar yA$, where $A$ is the area of the region and $\bar y$ the height of its centroid: the area times the distance the centroid travels.
- (b) Check (a) for the region of Exercise 12.8.
- (c) A **torus**, the shape of a ring doughnut, is swept out when a disc of radius $a$ rotates about a line in its plane at distance $R > a$ from its centre. Find its volume with (a), and check the result with washers.

::: solution
**(a)** By washers, with outer radius $f(x)$ and inner radius $g(x)$, $V = \pi\int_a^b \big(f(x)^2 - g(x)^2\big)\,dx$. By the definition of the centroid (Definition 12.6),

$$\begin{aligned} \bar yA &= \int_a^b \frac12\big(f(x)^2 - g(x)^2\big)\,dx \\ &= \frac{V}{2\pi}, \end{aligned}$$

so $V = 2\pi\bar yA$. The centroid travels round a circle of radius $\bar y$, of length $2\pi\bar y$.

**(b)** $A = \tfrac16$ and $\bar y = \tfrac25$, so $2\pi\bar yA = 2\pi \cdot \tfrac25 \cdot \tfrac16 = \tfrac{2\pi}{15}$. By washers, $\pi\int_0^1 \big(x^2 - x^4\big)\,dx = \pi\big(\tfrac13 - \tfrac15\big) = \tfrac{2\pi}{15}$.

**(c)** Put the axis along the $x$-axis and the centre of the disc at $(0, R)$. The disc is symmetric about its centre, so its centroid is the centre, $\bar y = R$, and $A = \pi a^2$. So

$$V = 2\pi R \cdot \pi a^2 = 2\pi^2Ra^2.$$

With washers: the disc is $x^2 + (y - R)^2 \le a^2$, so at $x$ it runs from $y = R - \sqrt{a^2 - x^2}$ to $y = R + \sqrt{a^2 - x^2}$, and both are at least $R - a > 0$. The difference of the squared radii is $\big(R + \sqrt{a^2 - x^2}\big)^2 - \big(R - \sqrt{a^2 - x^2}\big)^2 = 4R\sqrt{a^2 - x^2}$, so

$$\begin{aligned} V &= \pi\int_{-a}^{a} 4R\sqrt{a^2 - x^2}\,dx \\ &= 4\pi R \cdot \frac{\pi a^2}{2} = 2\pi^2Ra^2, \end{aligned}$$

because $\int_{-a}^{a} \sqrt{a^2 - x^2}\,dx$ is the area of a half disc of radius $a$.

```check
fF, gF = Function('f'), Function('g')
same(pi*Integral(fF(x)**2 - gF(x)**2, (x, a, b)), 2*pi*Integral((fF(x)**2 - gF(x)**2)/2, (x, a, b)))
same(2*pi*Rational(2, 5)*Rational(1, 6), 2*pi/15); same(pi*integrate(x**2 - x**4, (x, 0, 1)), 2*pi/15)
Rt, at = symbols('R a', positive=True)
same(expand((Rt + sqrt(at**2 - x**2))**2 - (Rt - sqrt(at**2 - x**2))**2), 4*Rt*sqrt(at**2 - x**2))
same(integrate(sqrt(at**2 - x**2), (x, -at, at)), pi*at**2/2)
same(pi*integrate(4*Rt*sqrt(at**2 - x**2), (x, -at, at)), 2*pi**2*Rt*at**2); same(2*pi*Rt*pi*at**2, 2*pi**2*Rt*at**2)
```
:::
::::

:::: exercise Shells and washers agree {#ex-12-11} ★★★
Let $f$ be strictly decreasing on $[0, b]$, with $f'$ continuous, $f(0) = h$ and $f(b) = 0$, and let $g$ be its inverse function (Module 1). The region under $y = f(x)$, $0 \le x \le b$, rotates about the $y$-axis.

- (a) Explain why slicing perpendicular to the axis gives $V = \pi\int_0^h g(y)^2\,dy$.
- (b) Substitute $y = f(x)$, then integrate by parts, to show that this equals $2\pi\int_0^b x\,f(x)\,dx$, the shell formula.
- (c) Check both formulas with $f(x) = 1 - x^2$ on $[0, 1]$.

::: solution
**(a)** Slice at height $y$, $0 \le y \le h$. Since $f$ is strictly decreasing, $f(x) \ge y$ exactly when $x \le g(y)$, so the region at height $y$ is the segment $0 \le x \le g(y)$. Rotating about the $y$-axis, it sweeps out a disc of radius $g(y)$, of area $\pi g(y)^2$, so $V = \pi\int_0^h g(y)^2\,dy$.

**(b)** Substitute $y = f(x)$, $dy = f'(x)\,dx$ (Module 10). When $x = 0$, $y = h$; when $x = b$, $y = 0$; and $g(y) = g\big(f(x)\big) = x$. So

$$\begin{aligned} &\pi\int_0^h g(y)^2\,dy \\ &\quad= -\pi\int_h^0 g(y)^2\,dy \\ &\quad= -\pi\int_0^b x^2f'(x)\,dx. \end{aligned}$$

Integrate by parts (Module 11) with $u = x^2$ and $dv = f'(x)\,dx$, so $du = 2x\,dx$ and $v = f(x)$:

$$\begin{aligned} &\int_0^b x^2f'(x)\,dx \\ &\quad= \big[x^2f(x)\big]_0^b - \int_0^b 2x\,f(x)\,dx \\ &\quad= -2\int_0^b x\,f(x)\,dx, \end{aligned}$$

because $b^2f(b) = 0$ and $0^2f(0) = 0$. Therefore $\pi\int_0^h g(y)^2\,dy = 2\pi\int_0^b x\,f(x)\,dx$.

**(c)** Here $h = 1$ and $g(y) = \sqrt{1 - y}$. Slicing: $\pi\int_0^1 (1 - y)\,dy = \tfrac{\pi}{2}$. Shells: $2\pi\int_0^1 x\big(1 - x^2\big)\,dx = 2\pi\big(\tfrac12 - \tfrac14\big) = \tfrac{\pi}{2}$.

```check
fS_ = Function('f')
same(x**2*diff(fS_(x), x), diff(x**2*fS_(x), x) - 2*x*fS_(x))      # the product rule behind the parts step
same((x**2*fS_(x)).subs(x, b) - (x**2*fS_(x)).subs(x, 0), b**2*fS_(b)); same((b**2*fS_(b)).subs(fS_(b), 0), 0)
for f_try in (1 - x**2, (1 - x)**3, cos(pi*x/2)):          # instances: decreasing on [0, 1] from f(0) to 0
    same(-pi*integrate(x**2*diff(f_try, x), (x, 0, 1)), 2*pi*integrate(x*f_try, (x, 0, 1)))
yq = symbols('y', nonnegative=True)
same((1 - x**2).subs(x, sqrt(1 - yq)), yq); same(pi*integrate(1 - y, (y, 0, 1)), pi/2); same(2*pi*integrate(x*(1 - x**2), (x, 0, 1)), pi/2)
```
:::
::::

:::: exercise The spread of the normal distribution {#ex-12-12} ★★★
Let $\varphi(z) = \dfrac{1}{\sqrt{2\pi}}e^{-z^2/2}$.

- (a) Show that $\varphi''(z) = (z^2 - 1)\varphi(z)$, and deduce that the graph of $\varphi$ changes concavity (Module 8) at $z = \pm1$. Where are the points of inflection of the normal density with mean $\mu$ and standard deviation $\sigma$?
- (b) Integrate by parts, with $u = z$ and $dv = z\varphi(z)\,dz$, to show that $\int_{-\infty}^{\infty} z^2\varphi(z)\,dz = 1$. You may use the Gaussian integral.
- (c) Deduce that, for the normal density $f$ with mean $\mu$ and standard deviation $\sigma$, $\int_{-\infty}^{\infty} (x - \mu)^2f(x)\,dx = \sigma^2$. (This mean squared distance from the mean is called the **variance**.)

::: solution
**(a)** By the chain rule, $\varphi'(z) = -z\varphi(z)$. By the product rule,

$$\begin{aligned} \varphi''(z) &= -\varphi(z) - z\varphi'(z) \\ &= -\varphi(z) + z^2\varphi(z) \\ &= \big(z^2 - 1\big)\varphi(z). \end{aligned}$$

Since $\varphi(z) > 0$, $\varphi''$ has the sign of $z^2 - 1$: negative for $\abs{z} < 1$ (concave down) and positive for $\abs{z} > 1$ (concave up). So the concavity changes at $z = \pm1$, the points of inflection. The normal density is $f(x) = \tfrac1\sigma\varphi\big(\tfrac{x - \mu}{\sigma}\big)$, so by the chain rule $f''(x) = \tfrac{1}{\sigma^3}\varphi''\big(\tfrac{x - \mu}{\sigma}\big)$, which changes sign where $\tfrac{x - \mu}{\sigma} = \pm1$: at $x = \mu \pm \sigma$.

**(b)** With $u = z$ and $dv = z\varphi(z)\,dz$, $du = dz$ and $v = -\varphi(z)$ (by (a), $\varphi' = -z\varphi$). For $t > 0$,

$$\begin{aligned} &\int_0^t z^2\varphi(z)\,dz \\ &\quad= \big[-z\varphi(z)\big]_0^t + \int_0^t \varphi(z)\,dz \\ &\quad= -t\varphi(t) + \int_0^t \varphi(z)\,dz. \end{aligned}$$

As $t \to \infty$, $t\varphi(t) \to 0$: for $t \ge 2$, $t^2/2 \ge t$, so $0 < te^{-t^2/2} \le te^{-t}$, which approaches 0 (Theorem 7.7). And $\int_0^t \varphi \to \tfrac12$, half the total area 1, since $\varphi$ is even. So $\int_0^\infty z^2\varphi(z)\,dz = \tfrac12$, and since $z^2\varphi(z)$ is even, $\int_{-\infty}^{\infty} z^2\varphi(z)\,dz = 1$.

**(c)** Substitute $z = (x - \mu)/\sigma$, so $x - \mu = \sigma z$ and $dx = \sigma\,dz$:

$$\begin{aligned} &\int_{-\infty}^{\infty} (x - \mu)^2\,\frac1\sigma\varphi\Big(\frac{x - \mu}{\sigma}\Big)\,dx \\ &\qquad= \int_{-\infty}^{\infty} \sigma^2z^2\varphi(z)\,dz = \sigma^2. \end{aligned}$$

```check
same(diff(phi12, z), -z*phi12); same(diff(phi12, z, 2), (z**2 - 1)*phi12)
holds((z**2 - 1).subs(z, Rational(1, 2)) < 0); holds((z**2 - 1).subs(z, 2) > 0)
same(diff(phi12.subs(z, (x - mu_)/sg)/sg, x, 2), ((z**2 - 1)*phi12).subs(z, (x - mu_)/sg)/sg**3)
same(solve(((x - mu_)/sg)**2 - 1, x), [mu_ - sg, mu_ + sg])
tz = symbols('t', positive=True)
same(integrate(z**2*phi12, (z, 0, tz)), -tz*phi12.subs(z, tz) + integrate(phi12, (z, 0, tz)))
limit_is(t*exp(-t**2/2), t, oo, 0); holds(all(Integer(v)**2/2 >= v for v in (2, 3, 10)))
same(integrate(phi12, (z, 0, oo)), Rational(1, 2)); same(integrate(z**2*phi12, (z, -oo, oo)), 1)
same(integrate((x - mu_)**2*fN, (x, -oo, oo)), sg**2)
```
:::
::::

## Check yourself {#quiz}

```quiz
? The area of the region between $y = x$ and $y = x^2$ for $0 \le x \le 1$ is
- [ ] $\tfrac12$
- [x] $\tfrac16$
- [ ] $-\tfrac16$
- [ ] $\tfrac13$
> Top minus bottom: $\int_0^1 (x - x^2)\,dx = \tfrac12 - \tfrac13 = \tfrac16$. $\tfrac12$ is the area under the line alone and $\tfrac13$ the area under the parabola alone; $-\tfrac16$ subtracts the wrong way round, bottom minus top, and an area is never negative.

? The region between $y = x^2$ and $y = 2$, for $0 \le x \le \sqrt2$, rotates about the $x$-axis. Its volume is
- [ ] $\pi\displaystyle\int_0^{\sqrt2} \big(2 - x^2\big)^2\,dx$
- [ ] $\pi\displaystyle\int_0^{\sqrt2} \big(2 - x^2\big)\,dx$
- [x] $\pi\displaystyle\int_0^{\sqrt2} \big(4 - x^4\big)\,dx$
- [ ] $2\pi\displaystyle\int_0^{\sqrt2} x\big(2 - x^2\big)\,dx$
> Each slice is a washer with outer radius 2 and inner radius $x^2$, of area $\pi\big(2^2 - (x^2)^2\big) = \pi\big(4 - x^4\big)$. $\pi(2 - x^2)^2$ is $\pi(R - r)^2$, the wrong area; $\pi(2 - x^2)$ forgets to square the radii; and the last integral is the shell formula for rotation about the $y$-axis, a different solid.

? The region between $y = x$ and $y = x^2$, $0 \le x \le 1$, rotates about the line $x = 2$. By shells, its volume is
- [x] $2\pi\displaystyle\int_0^1 (2 - x)\big(x - x^2\big)\,dx$
- [ ] $2\pi\displaystyle\int_0^1 x\big(x - x^2\big)\,dx$
- [ ] $2\pi\displaystyle\int_0^1 (x - 2)\big(x - x^2\big)\,dx$
- [ ] $\pi\displaystyle\int_0^1 \big(x^2 - x^4\big)\,dx$
> A strip at $x$ is $2 - x$ from the axis $x = 2$ and has height $x - x^2$. Radius $x$ belongs to rotation about the $y$-axis; $x - 2$ is negative on $[0, 1]$, so it gives a negative "volume"; and the last integral is the washer formula for rotation about the $x$-axis.

? Which integral is the length of the curve $y = x^3$ from $x = 0$ to $x = 1$?
- [ ] $\displaystyle\int_0^1 \sqrt{1 + x^6}\,dx$
- [ ] $\displaystyle\int_0^1 \big(1 + 3x^2\big)\,dx$
- [ ] $\displaystyle\int_0^1 \sqrt{1 + 3x^2}\,dx$
- [x] $\displaystyle\int_0^1 \sqrt{1 + 9x^4}\,dx$
> The formula uses the derivative, $f'(x) = 3x^2$, squared: $1 + (3x^2)^2 = 1 + 9x^4$. $\sqrt{1 + x^6}$ squares $f$ instead of $f'$; $1 + 3x^2$ adds the lengths of the steps of a staircase, which do not follow the curve; and $\sqrt{1 + 3x^2}$ forgets to square $f'$.

? A chain 10 m long, with a mass of 2 kg per metre, hangs from a winch. How much work does it take to wind it all up? (Take $g = 9.8$ m/s².)
- [ ] 1960 J
- [x] 980 J
- [ ] 100 J
- [ ] 196 J
> The piece at depth $y$ weighs $2 \times 9.8\,\Delta y$ N and rises $y$ metres: $W = \int_0^{10} 19.6\,y\,dy = 19.6 \times 50 = 980$ J. 1960 J lifts the whole weight, 196 N, through 10 m, but only the bottom end rises that far; 100 J forgets $g$ (it is in kg m, not joules); and 196 N is the chain's weight, a force, not a work.

? Which of these improper integrals converges?
- [ ] $\displaystyle\int_1^\infty \frac{dx}{x^{0.9}}$
- [ ] $\displaystyle\int_{-1}^{1} \frac{dx}{x^2}$
- [x] $\displaystyle\int_1^\infty \frac{dx}{x^{1.1}}$
- [ ] $\displaystyle\int_0^1 \frac{dx}{x}$
> At infinity a $p$-integral converges exactly when $p > 1$, so $p = 1.1$ converges (to 10) and $p = 0.9$ diverges. $\int_{-1}^{1} dx/x^2$ is improper at 0, where its right half diverges; the value $-2$ from the antiderivative is wrong. $\int_0^1 dx/x$ diverges: near 0 the integral needs $p < 1$.

? Calls to a help desk arrive at random, and the waiting time in minutes for the next call has the exponential density with $\lambda = 0.1$ (a mean of 10 minutes). You have already waited 5 minutes. The probability that you wait more than 10 further minutes is
- [x] $e^{-1} \approx 0.368$
- [ ] $e^{-1.5} \approx 0.223$
- [ ] $e^{-0.5} \approx 0.607$
- [ ] $0.5$
> The exponential distribution has no memory: $P(X > 15 \mid X > 5) = P(X > 10) = e^{-0.1 \times 10} = e^{-1}$. $e^{-1.5}$ is $P(X > 15)$, the probability before you start waiting; $e^{-0.5}$ is $P(X > 5)$; and 0.5 confuses the mean with the median.

? A quantity $X$ is normally distributed with mean 50 and standard deviation 10. $P(X \le 70)$ is about
- [ ] 0.954
- [ ] 0.683
- [ ] 1.000
- [x] 0.977
> Standardise: $z = (70 - 50)/10 = 2$. $P(Z \le 2) = \tfrac12 + \tfrac12P(-2 \le Z \le 2) \approx 0.5 + 0.477 = 0.977$. 0.954 is $P(-2 \le Z \le 2)$, which leaves out the lower tail; 0.683 is the probability within one standard deviation; and 1.000 comes from forgetting to standardise, treating 70 as a value of $Z$.
```

```check
same(integrate(x - x**2, (x, 0, 1)), Rational(1, 6)); same(integrate(x, (x, 0, 1)), Rational(1, 2)); same(integrate(x**2, (x, 0, 1)), Rational(1, 3))
same(pi*(2**2 - (x**2)**2), pi*(4 - x**4)); holds(pi*integrate((2 - x**2)**2, (x, 0, sqrt(2))) < pi*integrate(4 - x**4, (x, 0, sqrt(2))))
holds(integrate((x - 2)*(x - x**2), (x, 0, 1)) < 0); same(2*pi*integrate((2 - x)*(x - x**2), (x, 0, 1)), pi/2)
same(1 + diff(x**3, x)**2, 1 + 9*x**4)
same(integrate(2*Rational(98, 10)*y, (y, 0, 10)), 980); same(2*10*Rational(98, 10)*10, 1960); same(integrate(2*y, (y, 0, 10)), 100); same(2*10*Rational(98, 10), 196)
same(integrate(x**Rational(-11, 10), (x, 1, oo)), 10); same(integrate(x**Rational(-9, 10), (x, 1, oo)), oo); same(integrate(1/x, (x, 0, 1)), oo); same(integrate(1/x**2, (x, -1, 1)), oo)
lq = Rational(1, 10)
same(exp(-lq*15)/exp(-lq*5), exp(-1)); rounds(exp(-1), '0.368'); rounds(exp(-Rational(15, 10)), '0.223'); rounds(exp(-Rational(5, 10)), '0.607')
rounds(Rational(1, 2) + erf(2/sqrt(2))/2, '0.977'); rounds(erf(2/sqrt(2)), '0.954'); rounds(erf(1/sqrt(2)), '0.683'); rounds(erf(2/sqrt(2))/2, '0.477')
rounds(1/2 + erf(70/sqrt(2))/2, '1.000')
```
