---
title: Multiple integrals
part: 5
lead: Add up quantities spread over a region of the plane or of space, such as the volume under a surface, the mass of a plate, the balance point of a solid or the probability that a random point lands in a region. You will define double and triple integrals as limits of Riemann sums, evaluate them one variable at a time, choose the coordinates (polar, cylindrical, spherical or your own) that make them easy, and prove the value of the Gaussian integral that Module 12 quoted.
minutes: 270
needs: Modules 1 to 18, in particular the definite integral (Module 9), the Fundamental Theorem and substitution (Module 10), applications and improper integrals (Module 12), polar coordinates and vectors (Module 16) and partial derivatives (Module 17)
goals:
  - Define a double integral as a limit of double Riemann sums, and evaluate it as an iterated integral with Fubini's theorem
  - Describe a region by its boundary curves in either order, set up the limits from a sketch, and reverse the order of integration
  - Evaluate double integrals in polar coordinates, and prove that $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$
  - Compute areas, volumes, masses, centres of mass, moments of inertia and probabilities with multiple integrals
  - Set up and evaluate triple integrals in rectangular, cylindrical and spherical coordinates
  - Change the variables of a double integral with the Jacobian
---

## Volumes and double integrals {#double-integrals}

Module 9 found the area under a curve by cutting an interval into short pieces, standing a thin rectangle on each and adding up the rectangles; the limit of those sums is the definite integral. This module takes the same idea up one dimension. A function of two variables $f(x, y)$, the subject of Module 17, has a surface for its graph, $z = f(x, y)$. Over a region of the $xy$-plane, the solid between the region and the surface has a volume. Cut the region into small rectangles, stand a thin box on each, and add up the boxes: the limit of these sums is the **double integral**. It computes much more than volumes. A sum of the same kind is how a computer adds up anything recorded on a grid: the rainfall on each square of a weather map times the area of the square, added over a river's catchment, approximates the volume of water that fell on it.

Start with a rectangle in the $xy$-plane,

$$R = [a, b] \times [c, d] = \{(x, y) : a \le x \le b,\ c \le y \le d\},$$

read "$[a, b]$ cross $[c, d]$": the points whose $x$ lies in $[a, b]$ and whose $y$ lies in $[c, d]$. Suppose first that $f(x, y) \ge 0$ on $R$. The solid that lies above $R$ and below the surface $z = f(x, y)$ is the set of points $(x, y, z)$ with $(x, y)$ in $R$ and $0 \le z \le f(x, y)$. What is its volume?

Cut $[a, b]$ into $m$ subintervals of width $\Delta x = (b - a)/m$ and $[c, d]$ into $n$ subintervals of width $\Delta y = (d - c)/n$. The lines $x = x_i$ and $y = y_j$ through the cut points divide $R$ into $mn$ small rectangles

$$R_{ij} = [x_{i-1}, x_i] \times [y_{j-1}, y_j],$$

each of area $\Delta A = \Delta x\,\Delta y$. Choose a **sample point** $(x_{ij}^*, y_{ij}^*)$ in each $R_{ij}$ and stand on $R_{ij}$ a box of height $f(x_{ij}^*, y_{ij}^*)$. Its volume is $f(x_{ij}^*, y_{ij}^*)\,\Delta A$, and together the boxes have the volume

$$\sum_{i=1}^{m}\sum_{j=1}^{n} f(x_{ij}^*, y_{ij}^*)\,\Delta A,$$

a **double Riemann sum**. The two summation signs add one term for every pair $(i, j)$: $mn$ terms in all (Figure 19.1).

::: figure id=fig-19-1
Sixteen boxes under the surface $z = 8 - x^2 - y^2$ over the square $[0, 2] \times [0, 2]$ (Example 19.1 with $n = 4$). Each box stands on a small square of area $\Delta A = 0.25$, and its height is the value of $f$ at the corner of its square farthest from the origin. There $f$ is smallest on the square, so every box lies under the surface: the grid lines drawn on the surface pass through the far top corners of the boxes. Together the boxes have volume 17, less than the volume $64/3 \approx 21.33$ under the surface.
:::

::: example Trapping a volume
Let $f(x, y) = 8 - x^2 - y^2$ and $R = [0, 2] \times [0, 2]$. Cut $R$ into four squares of side 1. Find two double Riemann sums that trap the volume $V$ of the solid under the surface $z = f(x, y)$ and above $R$, and the sum whose sample points are the centres of the squares.

The squares are $[0, 1] \times [0, 1]$, $[1, 2] \times [0, 1]$, $[0, 1] \times [1, 2]$ and $[1, 2] \times [1, 2]$, each of area $\Delta A = 1$. For $x \ge 0$ and $y \ge 0$, $f$ decreases as $x$ grows and as $y$ grows, because $x^2$ and $y^2$ grow. So on each square $f$ is largest at the corner nearest the origin and smallest at the corner farthest from it. With the far corners $(1, 1)$, $(2, 1)$, $(1, 2)$ and $(2, 2)$ as sample points, the boxes lie under the surface, and their total volume is

$$\begin{aligned} &\big(f(1, 1) + f(2, 1) + f(1, 2) + f(2, 2)\big)\cdot 1 \\ &\quad= 6 + 3 + 3 + 0 = 12. \end{aligned}$$

With the near corners $(0, 0)$, $(1, 0)$, $(0, 1)$ and $(1, 1)$, the boxes contain the solid:

$$\begin{aligned} &\big(f(0, 0) + f(1, 0) + f(0, 1) + f(1, 1)\big)\cdot 1 \\ &\quad= 8 + 7 + 7 + 6 = 28. \end{aligned}$$

So $12 \le V \le 28$. The centres $\big(\tfrac12, \tfrac12\big)$, $\big(\tfrac32, \tfrac12\big)$, $\big(\tfrac12, \tfrac32\big)$ and $\big(\tfrac32, \tfrac32\big)$ give the single estimate

$$7.5 + 5.5 + 5.5 + 3.5 = 22.$$

Section 19.2 shows that $V = \tfrac{64}{3} \approx 21.33$.

```check
f191 = 8 - x**2 - y**2
same(diff(f191, x), -2*x); same(diff(f191, y), -2*y)                  # negative for x > 0 and y > 0: f decreases
far = [f191.subs({x: p, y: q}) for p, q in ((1, 1), (2, 1), (1, 2), (2, 2))]
near_ = [f191.subs({x: p, y: q}) for p, q in ((0, 0), (1, 0), (0, 1), (1, 1))]
same(far, [6, 3, 3, 0]); same(sum(far), 12); same(near_, [8, 7, 7, 6]); same(sum(near_), 28)
half = Rational(1, 2)
cen = [f191.subs({x: p, y: q}) for p, q in ((half, half), (3*half, half), (half, 3*half), (3*half, 3*half))]
same(cen, [Rational(15, 2), Rational(11, 2), Rational(11, 2), Rational(7, 2)]); same(sum(cen), 22)
V191 = integrate(f191, (y, 0, 2), (x, 0, 2)); same(V191, Rational(64, 3)); rounds(V191, '21.33')
holds(12 < V191); holds(V191 < 28)
```
:::

Smaller squares close the gap. Cut each side of $R$ into $n$ equal parts, making $n^2$ squares of side $2/n$, and compute the three sums: $L_n$ with the far corners (a lower sum), $U_n$ with the near corners (an upper sum) and $M_n$ with the centres (a midpoint sum).

```valuetable
n = 2, 4, 8, 16, 32
$L_n$ = Sum(Sum(8 - (2*i/n)**2 - (2*j/n)**2, (i, 1, n)), (j, 1, n)).doit()*4/n**2
$U_n$ = Sum(Sum(8 - (2*i/n)**2 - (2*j/n)**2, (i, 0, n - 1)), (j, 0, n - 1)).doit()*4/n**2
$M_n$ = Sum(Sum(8 - ((2*i - 1)/n)**2 - ((2*j - 1)/n)**2, (i, 1, n)), (j, 1, n)).doit()*4/n**2
digits = 9
```

The lower sums rise and the upper sums fall, and the gap between them, $U_n - L_n = 32/n$, halves each time $n$ doubles. The midpoint sums close in on $\tfrac{64}{3} = 21.333\ldots$ much faster: the error of $M_n$ is exactly $\tfrac{8}{3n^2}$, divided by 4 each time $n$ doubles, as for the midpoint sums of Module 9.

```check
Ln = lambda N_: Rational(4, N_**2)*sum(f191.subs({x: Rational(2*p, N_), y: Rational(2*q, N_)}) for p in range(1, N_ + 1) for q in range(1, N_ + 1))
Un = lambda N_: Rational(4, N_**2)*sum(f191.subs({x: Rational(2*p, N_), y: Rational(2*q, N_)}) for p in range(N_) for q in range(N_))
Mn = lambda N_: Rational(4, N_**2)*sum(f191.subs({x: Rational(2*p - 1, N_), y: Rational(2*q - 1, N_)}) for p in range(1, N_ + 1) for q in range(1, N_ + 1))
for N_ in (2, 4, 8, 16, 32):
    same(Un(N_) - Ln(N_), Rational(32, N_)); same(Mn(N_) - Rational(64, 3), Rational(8, 3*N_**2))
    holds(Ln(N_) < Rational(64, 3)); holds(Rational(64, 3) < Un(N_))
same(Ln(4), 17); same(Un(4), 25); same(Mn(4), Rational(43, 2)); same(Mn(32), Rational(2731, 128))
```

::: definition Double integral over a rectangle
Let $f$ be defined on the rectangle $R = [a, b] \times [c, d]$. Then $f$ is **integrable** on $R$ if there is a number $I$ that its double Riemann sums approach: for every $\varepsilon > 0$ there is a whole number $N$ such that

$$\Big|\sum_{i=1}^{m}\sum_{j=1}^{n} f(x_{ij}^*, y_{ij}^*)\,\Delta A - I\Big| < \varepsilon$$

whenever $m \ge N$ and $n \ge N$, wherever the sample points are. Then $I$ is the **double integral** of $f$ over $R$:

$$\iint_R f(x, y)\,dA = \lim_{m, n\to\infty}\sum_{i=1}^{m}\sum_{j=1}^{n} f(x_{ij}^*, y_{ij}^*)\,\Delta A.$$
:::

The symbol $\iint_R f(x, y)\,dA$ reads "the double integral over $R$ of $f$ of $x$, $y$, $dA$", and $dA$, the **element of area**, recalls the areas $\Delta A$ of the small rectangles. When $f \ge 0$ on $R$, the double integral is the volume of the solid between $R$ and the graph of $f$: it defines that volume, and it agrees with the volumes of boxes, prisms and pyramids that you already know. Where $f$ is negative the boxes hang below the $xy$-plane and count as negative, so in general the double integral is a signed volume, like the signed area of [Section 9.4](module_09_EN.html#signed-area). Module 9 also allowed subintervals of different widths; equal widths keep the notation light here and give the same integrals.

::: theorem Integrable functions
If $f$ is continuous on the rectangle $R$, then $f$ is integrable on $R$. More generally, $f$ is integrable on $R$ if it is bounded on $R$ and continuous at every point of $R$ except those on finitely many curves, each the graph $y = g(x)$ or $x = h(y)$ of a continuous function on a closed interval.
:::

As in Module 9, the proof belongs to a course in real analysis, and this series uses the theorem without proof. Its second sentence matters in Section 19.3, where a function is set to 0 outside a region and jumps along the region's boundary. The properties of single integrals ([Section 9.5](module_09_EN.html#properties)) carry over, with the same proofs from the Riemann sums: for integrable $f$ and $g$ and a constant $c$,

$$\begin{aligned} \iint_R (f + g)\,dA &= \iint_R f\,dA + \iint_R g\,dA, \\ \iint_R c\,f\,dA &= c\iint_R f\,dA, \end{aligned}$$

and if $f(x, y) \le g(x, y)$ at every point of $R$, then $\iint_R f\,dA \le \iint_R g\,dA$.

::: pitfall
Each term of a double Riemann sum is a volume, the height $f(x_{ij}^*, y_{ij}^*)$ times the area $\Delta A = \Delta x\,\Delta y$ of the small rectangle, not the height alone. In Example 19.1 with $n = 4$ the sixteen far-corner heights add up to 68, and only multiplying by $\Delta A = 0.25$ gives the lower sum $L_4 = 17$.

```check
same(sum(f191.subs({x: Rational(p, 2), y: Rational(q, 2)}) for p in range(1, 5) for q in range(1, 5)), 68); same(68*Rational(1, 4), 17)
```
:::

## Iterated integrals and Fubini's theorem {#iterated}

Limits of double sums are hard to compute directly. Module 12 had a better way to find a volume: slice the solid, find the area of each slice, and integrate the areas ([Section 12.3](module_12_EN.html#volumes)). Fix $x$ in $[a, b]$, and slice the solid of Section 19.1 by the plane through $x$ parallel to the $yz$-plane. The slice is the region under the curve $z = f(x, y)$, $c \le y \le d$, with $x$ held constant, and its area is

$$A(x) = \int_c^d f(x, y)\,dy.$$

Computing it is **partial integration** with respect to $y$: treat $x$ as a constant and integrate in $y$, as a partial derivative treats $x$ as a constant and differentiates in $y$ (Module 17). The result is a function of $x$ alone. Integrating the areas of the slices gives the volume:

$$V = \int_a^b A(x)\,dx = \int_a^b\Big[\int_c^d f(x, y)\,dy\Big]\,dx.$$

The right side is an **iterated integral**, usually written without the brackets,

$$\int_a^b\int_c^d f(x, y)\,dy\,dx.$$

Work from the inside out: the inner integral, whose $dy$ and limits $c$ and $d$ sit nearest to $f$, comes first. Slicing the other way, by planes $y = \text{constant}$, gives the iterated integral $\int_c^d\int_a^b f(x, y)\,dx\,dy$, with the $x$-integral inside.

::: example The volume of Example 19.1
Find the volume under $z = 8 - x^2 - y^2$ and above $R = [0, 2] \times [0, 2]$, slicing first by planes $x = \text{constant}$ and then by planes $y = \text{constant}$.

**Slices at fixed $x$.** With $x$ held constant, an antiderivative of $8 - x^2 - y^2$ with respect to $y$ is $8y - x^2y - \tfrac{y^3}{3}$, so

$$\begin{aligned} A(x) &= \int_0^2 \big(8 - x^2 - y^2\big)\,dy \\ &= \Big[8y - x^2y - \frac{y^3}{3}\Big]_{y=0}^{y=2} \\ &= 16 - 2x^2 - \frac83 = \frac{40}{3} - 2x^2. \end{aligned}$$

For example, $A(0) = \tfrac{40}{3}$ is the area under the parabola $z = 8 - y^2$ for $0 \le y \le 2$, the face of the solid in the plane $x = 0$. Then

$$V = \int_0^2 \Big(\frac{40}{3} - 2x^2\Big)\,dx = \frac{80}{3} - \frac{16}{3} = \frac{64}{3}.$$

**Slices at fixed $y$.** The integrand does not change when $x$ and $y$ are swapped, so the same steps with the letters swapped give the inner integral $\int_0^2 (8 - x^2 - y^2)\,dx = \tfrac{40}{3} - 2y^2$ and again $V = \tfrac{64}{3} \approx 21.33$. It lies between the bounds 12 and 28 of Example 19.1, close to the midpoint estimate 22.

```check
antideriv(8*y - x**2*y - y**3/3, f191, y)
A192 = integrate(f191, (y, 0, 2))
steps(Integral(f191, (y, 0, 2)), 16 - 2*x**2 - Rational(8, 3), Rational(40, 3) - 2*x**2)
same(A192.subs(x, 0), Rational(40, 3)); same(integrate(8 - y**2, (y, 0, 2)), Rational(40, 3))
steps(Integral(A192, (x, 0, 2)), Rational(80, 3) - Rational(16, 3), Rational(64, 3))
same(f191.subs({x: y, y: x}, simultaneous=True), f191)
same(integrate(f191, (x, 0, 2)), Rational(40, 3) - 2*y**2); same(integrate(f191, (x, 0, 2), (y, 0, 2)), Rational(64, 3))
```
:::

Both orders gave the volume that the boxes of Section 19.1 approach. That is no accident:

::: theorem Fubini's theorem
If $f$ is continuous on the rectangle $R = [a, b] \times [c, d]$, then

$$\begin{aligned} \iint_R f(x, y)\,dA &= \int_a^b\int_c^d f(x, y)\,dy\,dx \\ &= \int_c^d\int_a^b f(x, y)\,dx\,dy. \end{aligned}$$

More generally, the same holds if $f$ is bounded on $R$, continuous except on finitely many curves of the kind in Theorem 19.1, and the iterated integrals exist.
:::

For $f \ge 0$ the theorem says that slicing gives the volume that the boxes define. Its power is in computing: a double integral becomes two single integrals, each done with the methods of Modules 10 and 11, in whichever order is easier. The Going deeper box below proves it for continuous $f$.

::: deeper Why Fubini's theorem holds
Here is a proof for continuous $f$. It takes one fact from real analysis on trust: the function $A(x) = \int_c^d f(x, y)\,dy$ is continuous on $[a, b]$. (This rests on a property of functions continuous on a closed rectangle called uniform continuity.) Then $A$ is integrable on $[a, b]$ (Theorem 9.3).

Cut $[a, b]$ and $[c, d]$ into $m$ and $n$ equal parts, and choose any points $x_i^*$ in $[x_{i-1}, x_i]$. By additivity over intervals (Theorem 9.6) and the Mean Value Theorem for integrals (Theorem 9.9), applied to the continuous function $y \mapsto f(x_i^*, y)$ on each $[y_{j-1}, y_j]$, there are points $y_{ij}^*$ in $[y_{j-1}, y_j]$ with

$$\begin{aligned} A(x_i^*) &= \sum_{j=1}^{n}\int_{y_{j-1}}^{y_j} f(x_i^*, y)\,dy \\ &= \sum_{j=1}^{n} f(x_i^*, y_{ij}^*)\,\Delta y. \end{aligned}$$

Multiply by $\Delta x$ and add over $i$:

$$\sum_{i=1}^{m} A(x_i^*)\,\Delta x = \sum_{i=1}^{m}\sum_{j=1}^{n} f(x_i^*, y_{ij}^*)\,\Delta A.$$

The right side is a double Riemann sum of $f$, with the sample point $(x_i^*, y_{ij}^*)$ in $R_{ij}$. Let $I = \iint_R f\,dA$ and $\varepsilon > 0$, and take $N$ as in Definition 19.1. For $m \ge N$, choose $n = m$: the right side is within $\varepsilon$ of $I$. The left side does not involve $n$ at all; it is a Riemann sum of $A$ on $[a, b]$ with $m$ equal subintervals. So every such Riemann sum of $A$ with $m \ge N$ is within $\varepsilon$ of $I$, whatever the points $x_i^*$. Their limit as $m \to \infty$ is therefore $I$; by Theorem 9.4 it is also $\int_a^b A(x)\,dx$. That proves the first equality. The second follows in the same way with the roles of $x$ and $y$ swapped.
:::

The hypothesis cannot be dropped. On $R = [0, 1] \times [0, 1]$, let

$$f(x, y) = \frac{x^2 - y^2}{\big(x^2 + y^2\big)^2}$$

for $(x, y) \ne (0, 0)$, and $f(0, 0) = 0$. For $x > 0$ the quotient rule shows that $\dfrac{\partial}{\partial y}\Big(\dfrac{y}{x^2 + y^2}\Big) = f(x, y)$, so the inner integral is $\int_0^1 f(x, y)\,dy = \dfrac{1}{x^2 + 1}$, and

$$\int_0^1\int_0^1 f(x, y)\,dy\,dx = \int_0^1 \frac{dx}{1 + x^2} = \frac{\pi}{4}.$$

But swapping $x$ and $y$ changes the sign of $f$, so the other order gives $-\tfrac{\pi}{4}$. The two iterated integrals disagree because $f$ is not bounded on $R$: along the $x$-axis, $f(x, 0) = 1/x^2$, which grows without bound as $x \to 0$. Fubini's theorem does not apply, and $f$ has no double integral over $R$.

```check
xq, yq = symbols('x y', positive=True)
fF = (xq**2 - yq**2)/(xq**2 + yq**2)**2
same(diff(yq/(xq**2 + yq**2), yq), fF); same(integrate(fF, (yq, 0, 1)), 1/(xq**2 + 1)); same(integrate(1/(1 + x**2), (x, 0, 1)), pi/4)
same(fF.subs({xq: yq, yq: xq}, simultaneous=True), -fF); same(integrate(fF, (xq, 0, 1)), -1/(yq**2 + 1))
same(fF.subs(yq, 0), 1/xq**2); limit_is(1/x**2, x, 0, oo, '+')
```

::: example Choosing the order
Evaluate $\displaystyle\iint_R x\cos(xy)\,dA$, where $R = [0, \pi] \times [0, 1]$.

The integrand is continuous, so by Fubini's theorem either order gives the answer. Integrating first in $y$ is the easy way. With $x$ held constant, the chain rule gives $\dfrac{\partial}{\partial y}\sin(xy) = x\cos(xy)$, so

$$\begin{aligned} \iint_R x\cos(xy)\,dA &= \int_0^\pi\Big[\sin(xy)\Big]_{y=0}^{y=1}\,dx \\ &= \int_0^\pi \sin x\,dx = 2. \end{aligned}$$

In the other order, the inner integral $\int_0^\pi x\cos(xy)\,dx$ needs integration by parts (Module 11), and for $0 < y \le 1$ it gives

$$\frac{\pi\sin(\pi y)}{y} + \frac{\cos(\pi y) - 1}{y^2}.$$

An antiderivative of this is $\dfrac{1 - \cos(\pi y)}{y}$, which takes some finding, and the integral from 0 to 1 needs a limit at $y = 0$; the answer is 2 again. When one order is hard, try the other.

```check
same(diff(sin(x*y), y), x*cos(x*y)); same(integrate(xq*cos(xq*y), (y, 0, 1)), sin(xq))
same(integrate(sin(x), (x, 0, pi)), 2); same(integrate(x*cos(x*y), (y, 0, 1), (x, 0, pi)), 2)
yp = symbols('y', positive=True)
same(integrate(x*cos(x*yp), (x, 0, pi)), pi*sin(pi*yp)/yp + (cos(pi*yp) - 1)/yp**2)
antideriv((1 - cos(pi*yp))/yp, pi*sin(pi*yp)/yp + (cos(pi*yp) - 1)/yp**2, yp)
limit_is((1 - cos(pi*y))/y, y, 0, 0, '+'); same(((1 - cos(pi*y))/y).subs(y, 1), 2)
```
:::

When the integrand is a product $g(x)h(y)$ and the region is a rectangle, the inner integral of $\int_a^b\int_c^d g(x)h(y)\,dy\,dx$ is $g(x)\int_c^d h(y)\,dy$, a constant times $g(x)$, and the iterated integral splits into a product:

$$\iint_R g(x)h(y)\,dA = \int_a^b g(x)\,dx\int_c^d h(y)\,dy.$$

For example, $\iint_R \sin x\cos y\,dA = 1 \cdot 1 = 1$ over $R = [0, \pi/2] \times [0, \pi/2]$. This product rule needs a rectangle, whose limits are constants; Section 19.4 uses it to compute the Gaussian integral.

```check
gF, hF = Function('g'), Function('h')
same(Integral(gF(x)*hF(y), (y, c, b), (x, a, b)).doit(), Integral(gF(x), (x, a, b)).doit()*Integral(hF(y), (y, c, b)).doit())
same(integrate(sin(x)*cos(y), (y, 0, pi/2), (x, 0, pi/2)), 1); same(integrate(sin(x), (x, 0, pi/2)), 1); same(integrate(cos(y), (y, 0, pi/2)), 1)
```

The average value of a function of one variable is its integral divided by the length of the interval ([Section 9.7](module_09_EN.html#average)). In two variables, divide by the area.

::: definition Average value
The **average value** of a function $f$ integrable on the rectangle $R$ is

$$f_{\text{avg}} = \frac{1}{A(R)}\iint_R f(x, y)\,dA,$$

where $A(R) = (b - a)(d - c)$ is the area of $R$.
:::

It is the number that the averages of $f$ over the sample points of finer and finer grids approach, as in Module 9; when $f \ge 0$, a box of height $f_{\text{avg}}$ on $R$ has the same volume as the solid under the graph. The surface of Example 19.2 has the average height $\tfrac{64}{3} \big/ 4 = \tfrac{16}{3} \approx 5.33$ over the square $[0, 2] \times [0, 2]$. Section 19.3 extends the definition to other regions, with the area of the region in place of $A(R)$.

```check
same(Rational(64, 3)/4, Rational(16, 3)); rounds(Rational(16, 3), '5.33'); same(integrate(f191, (x, 0, 2), (y, 0, 2))/(2*2), Rational(16, 3))
```

::: compute Double integrals by computer
SymPy's `integrate` takes one tuple per integral, the inner one first: `(y, 0, 2)` below is the inner integral, in $y$.

```python
import sympy as sp
x, y = sp.symbols('x y')
f = 8 - x**2 - y**2
print(sp.integrate(f, (y, 0, 2)))              # the inner integral A(x)
print(sp.integrate(f, (y, 0, 2), (x, 0, 2)))   # y first, then x
print(sp.integrate(x*sp.cos(x*y), (y, 0, 1), (x, 0, sp.pi)))
```

```output
40/3 - 2*x**2
64/3
2
```

These are $A(x)$ and the volume of Example 19.2, with the terms of $A(x)$ in SymPy's order, and the integral of Example 19.3. Numerically, a midpoint sum adds $f$ at the centres of an $n \times n$ grid. NumPy's `meshgrid` builds every pair of centres $(x_i, y_j)$ at once, so even a million boxes take a fraction of a second:

```python
import numpy as np

def midpoint2d(f, a, b, c, d, n):
    dx, dy = (b - a)/n, (d - c)/n
    xs = a + (np.arange(n) + 0.5)*dx        # centres of the subintervals of [a, b]
    ys = c + (np.arange(n) + 0.5)*dy
    X, Y = np.meshgrid(xs, ys)              # all n*n centres (x_i, y_j)
    return np.sum(f(X, Y))*dx*dy

for n in [2, 10, 100, 1000]:
    print(n, midpoint2d(lambda x, y: 8 - x**2 - y**2, 0, 2, 0, 2, n))
```

```output
2 22.0
10 21.360000000000003
100 21.3336
1000 21.333336
```

The sums approach $\tfrac{64}{3} = 21.333\ldots$, with the error $\tfrac{8}{3n^2}$ found above: each tenfold increase in $n$ divides it by 100, until floating-point rounding shows in the last digits.
:::

::: pitfall
Keep each variable with its own limits. In $\int_0^2\int_0^1 f(x, y)\,dy\,dx$ the inner limits 0 and 1 belong to $y$, the variable of the inner $dy$, and the outer limits 0 and 2 belong to $x$. Reading them the other way round integrates over $[0, 1] \times [0, 2]$ instead of $[0, 2] \times [0, 1]$: for $f(x, y) = x^2y$ the right reading gives $\tfrac43$, the wrong one $\tfrac23$.

```check
same(integrate(x**2*y, (y, 0, 1), (x, 0, 2)), Rational(4, 3)); same(integrate(x**2*y, (y, 0, 2), (x, 0, 1)), Rational(2, 3))
```
:::

## Integrals over general regions {#general-regions}

Most regions are not rectangles: a disc, a triangle, the region between two curves. To integrate over a bounded region $D$, enclose it in a rectangle $R$ and extend $f$ by zero:

$$F(x, y) = \begin{cases} f(x, y) & \text{if } (x, y) \text{ is in } D, \\ 0 & \text{if } (x, y) \text{ is in } R \text{ but not in } D, \end{cases}$$

and define $\iint_D f(x, y)\,dA = \iint_R F(x, y)\,dA$ when the right side exists. The boxes outside $D$ have height 0 and add nothing, so the choice of $R$ does not matter. $F$ usually jumps at the boundary of $D$, which is why Theorem 19.1 allows discontinuities along curves. Two shapes of region cover most cases (Figure 19.2).

::: definition Type I and type II regions
A region $D$ is of **type I** if it lies between the graphs of two continuous functions of $x$:

$$D = \{(x, y) : a \le x \le b,\ g_1(x) \le y \le g_2(x)\},$$

with $g_1(x) \le g_2(x)$ for $a \le x \le b$. It is of **type II** if it lies between the graphs of two continuous functions of $y$:

$$D = \{(x, y) : c \le y \le d,\ h_1(y) \le x \le h_2(y)\},$$

with $h_1(y) \le h_2(y)$ for $c \le y \le d$.
:::

::: figure id=fig-19-2
Left: a type I region lies between a lower curve $y = g_1(x)$ and an upper curve $y = g_2(x)$, for $a \le x \le b$. Each vertical line between $a$ and $b$ meets it in one segment (orange), from $g_1(x)$ to $g_2(x)$. Right: a type II region lies between a left curve $x = h_1(y)$ and a right curve $x = h_2(y)$, for $c \le y \le d$; each horizontal line between $c$ and $d$ meets it in one segment, from $h_1(y)$ to $h_2(y)$.
:::

::: theorem Iterated integrals over type I and type II regions
If $f$ is continuous on a type I region $D$ as in Definition 19.3, then

$$\iint_D f(x, y)\,dA = \int_a^b\int_{g_1(x)}^{g_2(x)} f(x, y)\,dy\,dx.$$

If $f$ is continuous on a type II region $D$, then

$$\iint_D f(x, y)\,dA = \int_c^d\int_{h_1(y)}^{h_2(y)} f(x, y)\,dx\,dy.$$
:::

::: proof
Take a type I region; the type II case is the same with $x$ and $y$ swapped. The continuous functions $g_1$ and $g_2$ are bounded on $[a, b]$ (the Extreme Value Theorem, Module 3), so there are numbers $c$ and $d$ with $c \le g_1(x)$ and $g_2(x) \le d$ for all $x$ in $[a, b]$. Let $F$ be $f$ extended by zero to $R = [a, b] \times [c, d]$. The function $f$ is bounded on the closed bounded region $D$ (by the Extreme Value Theorem for such regions, Module 18), so $F$ is bounded on $R$, and it is continuous except perhaps on the graphs of $g_1$ and $g_2$. By Theorem 19.1, $\iint_D f\,dA = \iint_R F\,dA$ exists. For each $x$, $F(x, y)$ equals $f(x, y)$ for $g_1(x) \le y \le g_2(x)$ and 0 for the other $y$ in $[c, d]$, so

$$\int_c^d F(x, y)\,dy = \int_{g_1(x)}^{g_2(x)} f(x, y)\,dy.$$

Fubini's theorem in its general form now gives the formula, provided that this inner integral is an integrable function of $x$; that it is (it is even continuous) is another fact of real analysis taken on trust here.
:::

To set up the limits, draw a picture.

::: keyidea
**Limits from a sketch.** To set up $\iint_D f\,dA$:

1. Sketch $D$, label its boundary curves, and find where they meet.
2. For the order $dy\,dx$, draw a vertical line through $D$ at a typical $x$. It enters $D$ on the lower curve $y = g_1(x)$ and leaves on the upper curve $y = g_2(x)$: these are the inner limits. The outer limits are the least and the greatest $x$ in $D$.
3. For the order $dx\,dy$, draw a horizontal line at a typical $y$. It enters $D$ on the left curve and leaves on the right curve, both written as $x = \dots$: these are the inner limits. The outer limits are the least and the greatest $y$ in $D$.

The outer limits are always constants. The inner limits may depend on the outer variable, never on the inner one.
:::

::: example Both orders on a region between curves
Let $D$ be the region between the parabola $y = x^2$ and the line $y = x$. Evaluate $\iint_D xy\,dA$ in both orders.

The curves meet where $x^2 = x$, at $x = 0$ and $x = 1$, that is, at $(0, 0)$ and $(1, 1)$. Between them the line is above the parabola, since $x > x^2$ for $0 < x < 1$.

**Vertical slices.** A vertical line at $x$, $0 \le x \le 1$, enters $D$ on the parabola and leaves on the line:

$$\begin{aligned} \iint_D xy\,dA &= \int_0^1\int_{x^2}^{x} xy\,dy\,dx \\ &= \int_0^1 x\Big[\frac{y^2}{2}\Big]_{y=x^2}^{y=x}\,dx \\ &= \int_0^1 \frac{x^3 - x^5}{2}\,dx \\ &= \frac12\Big(\frac14 - \frac16\Big) = \frac{1}{24}. \end{aligned}$$

**Horizontal slices.** As functions of $y$, the line is $x = y$ and the parabola, where $x \ge 0$, is $x = \sqrt y$. A horizontal line at $y$, $0 \le y \le 1$, enters $D$ on the line and leaves on the parabola, since $y \le \sqrt y$ there:

$$\begin{aligned} \iint_D xy\,dA &= \int_0^1\int_{y}^{\sqrt y} xy\,dx\,dy \\ &= \int_0^1 y\Big[\frac{x^2}{2}\Big]_{x=y}^{x=\sqrt y}\,dy \\ &= \int_0^1 \frac{y^2 - y^3}{2}\,dy \\ &= \frac12\Big(\frac13 - \frac14\Big) = \frac{1}{24}. \end{aligned}$$

The same answer, as Theorem 19.3 promises: $D$ is of both types.

```check
same_set(solve(x**2 - x, x), [0, 1]); holds(Rational(1, 2) > Rational(1, 4))
steps(Integral(x*y, (y, x**2, x), (x, 0, 1)), Integral((x**3 - x**5)/2, (x, 0, 1)), Rational(1, 2)*(Rational(1, 4) - Rational(1, 6)), Rational(1, 24))
same(integrate(x*y, (y, x**2, x)), (x**3 - x**5)/2)
steps(Integral(x*y, (x, y, sqrt(y)), (y, 0, 1)), Integral((y**2 - y**3)/2, (y, 0, 1)), Rational(1, 2)*(Rational(1, 3) - Rational(1, 4)), Rational(1, 24))
same(integrate(x*y, (x, y, sqrt(y))), (y**2 - y**3)/2)
yn = symbols('y', nonnegative=True); same(sqrt(yn)**2, yn); holds(Rational(1, 4) <= sqrt(Rational(1, 4)))
```
:::

::: widget name=region-slicer
Start with the region of Example 19.4 and the order $dy\,dx$, and move the slider: the orange segment is the slice, and the readout gives its ends twice, as formulas (the inner limits $x^2$ and $x$) and as numbers. Switch to $dx\,dy$: now the slice is horizontal, the boundary curves are labelled $x = y$ and $x = \sqrt y$, and the inner limits change with them. Try the other regions. For the quarter disc, compare the inner limits $\sqrt{1 - x^2}$ and $\sqrt{1 - y^2}$. For the region between $y = \sqrt x$ and $y = x/2$, watch the outer limits change from $0 \le x \le 4$ to $0 \le y \le 2$. Each time, the area computed with vertical slices and with horizontal slices comes out the same.
:::

With $f = 1$ the double integral is the area of $D$. For a type I region,

$$A(D) = \iint_D 1\,dA = \int_a^b\big(g_2(x) - g_1(x)\big)\,dx,$$

the formula for the area between curves of [Section 12.2](module_12_EN.html#area), and the average value of $f$ over $D$ is $\tfrac{1}{A(D)}\iint_D f\,dA$. Two more properties follow from those of Section 19.1. If $D$ is made of two regions $D_1$ and $D_2$ that overlap at most along their boundaries, then $\iint_D f\,dA = \iint_{D_1} f\,dA + \iint_{D_2} f\,dA$ (the common boundary has no area). And if $f \ge 0$ and $D_1$ lies inside $D_2$, then $\iint_{D_1} f\,dA \le \iint_{D_2} f\,dA$, because $f$ extended by zero outside $D_1$ is at most $f$ extended by zero outside $D_2$.

::: example The volume of a tetrahedron
For $a, b, c > 0$, the plane $\dfrac{x}{a} + \dfrac{y}{b} + \dfrac{z}{c} = 1$ meets the axes at $(a, 0, 0)$, $(0, b, 0)$ and $(0, 0, c)$. Find the volume of the tetrahedron bounded by this plane and the three coordinate planes.

The tetrahedron is the solid under the plane, $z = c\big(1 - \tfrac{x}{a} - \tfrac{y}{b}\big)$, above the triangle $D$ that the coordinate axes and the line $\tfrac{x}{a} + \tfrac{y}{b} = 1$ cut from the $xy$-plane (where $z = 0$). So $D$ is the type I region $0 \le x \le a$, $0 \le y \le b\big(1 - \tfrac{x}{a}\big)$. Write $w = 1 - \tfrac{x}{a}$ for short; it does not depend on $y$. The inner integral is

$$\begin{aligned} \int_0^{bw} c\Big(w - \frac{y}{b}\Big)\,dy &= c\Big[wy - \frac{y^2}{2b}\Big]_0^{bw} \\ &= c\Big(bw^2 - \frac{bw^2}{2}\Big) = \frac{bc}{2}w^2, \end{aligned}$$

and, substituting $u = 1 - \tfrac{x}{a}$ (Module 10),

$$\begin{aligned} V &= \frac{bc}{2}\int_0^a\Big(1 - \frac{x}{a}\Big)^2\,dx \\ &= \frac{bc}{2}\cdot a\int_0^1 u^2\,du = \frac{abc}{6}. \end{aligned}$$

The base triangle has area $\tfrac12 ab$ and the height is $c$, so $V = \tfrac13 \cdot \tfrac12 ab \cdot c$: one third of the base times the height, as for the pyramids of [Section 12.3](module_12_EN.html#slicing).

```check
ap, bp, cp, wp = symbols('a b c w', positive=True)
steps(Integral(cp*(wp - y/bp), (y, 0, bp*wp)), cp*(bp*wp**2 - bp*wp**2/2), bp*cp*wp**2/2)
same((cp*(1 - x/ap - y/bp)).subs(x, ap*(1 - wp)), cp*(wp - y/bp))
same(integrate((1 - x/ap)**2, (x, 0, ap)), ap*integrate(u**2, (u, 0, 1)))
same(bp*cp/2*integrate((1 - x/ap)**2, (x, 0, ap)), ap*bp*cp/6)
same(integrate(cp*(1 - x/ap - y/bp), (y, 0, bp*(1 - x/ap)), (x, 0, ap)), ap*bp*cp/6)
same(Rational(1, 3)*Rational(1, 2)*ap*bp*cp, ap*bp*cp/6)
```
:::

::: pitfall
The inner limits describe one slice, not the corners of the region. For the triangle $0 \le y \le x \le 1$, writing $\int_0^1\int_0^1 f\,dy\,dx$ integrates over the whole square; a vertical slice at $x$ runs only from $y = 0$ to $y = x$. And an outer limit can never contain a variable: in $\int_0^x\int_0^1 \dots$ the $x$ has nothing to refer to.
:::

### Reversing the order {#reversing}

Sometimes only one order can be done by hand.

::: example An integral that needs reversing
Evaluate $\displaystyle\int_0^1\int_x^1 e^{y^2}\,dy\,dx$.

As written, the inner integral asks for an antiderivative of $e^{y^2}$, and there is no elementary one (Module 11). So reverse the order. The limits say that $0 \le x \le 1$ and $x \le y \le 1$: the region $D$ is the triangle with vertices $(0, 0)$, $(0, 1)$ and $(1, 1)$, above the line $y = x$. Slice it horizontally: at height $y$, for $0 \le y \le 1$, a horizontal line enters $D$ on the $y$-axis and leaves on the line $x = y$. As a type II region $D$ is $0 \le y \le 1$, $0 \le x \le y$, so

$$\begin{aligned} \int_0^1\int_x^1 e^{y^2}\,dy\,dx &= \int_0^1\int_0^y e^{y^2}\,dx\,dy \\ &= \int_0^1 y\,e^{y^2}\,dy = \Big[\frac{e^{y^2}}{2}\Big]_0^1 \\ &= \frac{e - 1}{2} \approx 0.859. \end{aligned}$$

The inner integral, in $x$, treats $e^{y^2}$ as a constant and multiplies it by the length $y$ of the slice; that factor $y$ is what the substitution $u = y^2$ needs (Module 10).

```check
same(integrate(exp(y**2), (x, 0, y)), y*exp(y**2)); antideriv(exp(y**2)/2, y*exp(y**2), y)
steps(Integral(exp(y**2), (x, 0, y), (y, 0, 1)), Integral(y*exp(y**2), (y, 0, 1)), (E - 1)/2)
rounds((E - 1)/2, '0.859')
same(integrate(exp(y**2), (y, x, 1), (x, 0, 1)), (E - 1)/2)          # the original order, done by SymPy with a special function
```
:::

::: compute Reversing the order by computer
SymPy can do the original order, but only with a special function:

```python
import sympy as sp
x, y = sp.symbols('x y')
inner = sp.integrate(sp.exp(y**2), (y, x, 1))
print(inner)
print(sp.simplify(sp.integrate(inner, (x, 0, 1))))
print(sp.integrate(sp.exp(y**2), (x, 0, y), (y, 0, 1)))   # reversed: x first
```

```output
-sqrt(pi)*erfi(x)/2 + sqrt(pi)*erfi(1)/2
-1/2 + E/2
-1/2 + E/2
```

The inner integral is written with `erfi`, the "imaginary error function", a relative of the error function of Module 11 and, like it, not an elementary function. SymPy knows how to integrate it and, after simplifying, reaches $\tfrac{e - 1}{2}$, the answer of Example 19.6, which the reversed order gives at once.
:::

::: pitfall
To reverse an order, sketch the region and read the new limits from the picture; never move the limits around as they stand. Keeping the constant limits of $\int_0^1\int_x^1 e^{y^2}\,dy\,dx$ and dropping the others gives $\int_0^1\int_0^1 e^{y^2}\,dx\,dy = \int_0^1 e^{y^2}\,dy \approx 1.4627$, the integral over the whole square: not the triangle of Example 19.6, whose integral is about 0.859.

```check
rounds(Integral(exp(y**2), (y, 0, 1)).evalf(30), '1.4627')
```
:::

## Polar coordinates {#polar}

Discs, rings and sectors are awkward in $x$ and $y$: the disc $x^2 + y^2 \le 1$ needs the limits $\pm\sqrt{1 - x^2}$. In the polar coordinates of Module 16, $x = r\cos\theta$ and $y = r\sin\theta$ with $r \ge 0$, the same disc is $0 \le r \le 1$, $0 \le \theta \le 2\pi$: a rectangle in $r$ and $\theta$. A **polar rectangle** is a region

$$\{(r, \theta) : r_0 \le r \le r_1,\ \alpha \le \theta \le \beta\},$$

with $0 \le r_0 < r_1$ and $0 < \beta - \alpha \le 2\pi$: a piece of a ring between two rays (Figure 19.3, left). The Greek letters $\alpha$ and $\beta$ are "alpha" and "beta".

What is its area? A sector of radius $r$ and angle $\Delta\theta$ has area $\tfrac12 r^2\Delta\theta$ (Module 16), and the polar rectangle, with $\Delta\theta = \beta - \alpha$, is the difference of two sectors:

$$\begin{aligned} \frac12 r_1^2\,\Delta\theta - \frac12 r_0^2\,\Delta\theta &= \frac{r_0 + r_1}{2}\,(r_1 - r_0)\,\Delta\theta \\ &= \bar r\,\Delta r\,\Delta\theta, \end{aligned}$$

where $\Delta r = r_1 - r_0$ and $\bar r = \tfrac{r_0 + r_1}{2}$ is the average radius. A small polar rectangle is nearly a rectangle with sides $\Delta r$, along a ray, and $\bar r\,\Delta\theta$, along an arc of radius $\bar r$. Its area is not $\Delta r\,\Delta\theta$ but $\bar r\,\Delta r\,\Delta\theta$: polar rectangles with the same $\Delta r$ and $\Delta\theta$ get bigger further from the origin.

```check
r0, r1, dth = symbols('r_0 r_1 Delta_theta', positive=True)
same(Rational(1, 2)*r1**2*dth - Rational(1, 2)*r0**2*dth, (r0 + r1)/2*(r1 - r0)*dth)
same(integrate(r, (r, r0, r1), (theta, 0, dth)), (r0 + r1)/2*(r1 - r0)*dth)
```

::: figure id=fig-19-3
Left: a polar rectangle, the part of a ring between two radii and between the rays at angles $\theta$ and $\theta + \Delta\theta$. Its sides are $\Delta r$ along a ray and about $r\,\Delta\theta$ along an arc, and its area is exactly $\bar r\,\Delta r\,\Delta\theta$, with $\bar r$ the average radius. Right: the disc $D_a$ of radius $a$ lies inside the square $S_a = [-a, a] \times [-a, a]$, which lies inside the disc $D_{a\sqrt2}$ through its corners. The proof of Theorem 19.5 squeezes an integral over the square between integrals over the two discs.
:::

::: theorem Double integrals in polar coordinates
Let $f$ be continuous on a region $D$ described in polar coordinates by

$$\alpha \le \theta \le \beta, \qquad h_1(\theta) \le r \le h_2(\theta),$$

where $0 < \beta - \alpha \le 2\pi$ and $h_1$, $h_2$ are continuous on $[\alpha, \beta]$ with $0 \le h_1(\theta) \le h_2(\theta)$. Then

$$\iint_D f(x, y)\,dA = \int_\alpha^\beta\int_{h_1(\theta)}^{h_2(\theta)} f(r\cos\theta, r\sin\theta)\,r\,dr\,d\theta.$$
:::

In short, $dA = r\,dr\,d\theta$: replace $x$ and $y$ by $r\cos\theta$ and $r\sin\theta$, and $dA$ by $r\,dr\,d\theta$. For a polar rectangle, $h_1$ and $h_2$ are the constants $r_0$ and $r_1$. With $f = 1$ and $h_1 = 0$, the inner integral is $\int_0^{h_2(\theta)} r\,dr = \tfrac12 h_2(\theta)^2$, and the theorem gives the area $\int_\alpha^\beta \tfrac12 h_2(\theta)^2\,d\theta$: the formula for areas in polar coordinates of Module 16.

**The idea of the proof.** Take a polar rectangle, and cut $[r_0, r_1]$ and $[\alpha, \beta]$ into $m$ and $n$ equal parts. The circles and rays through the cut points divide the region into $mn$ small polar rectangles; the one between $r_{i-1}$ and $r_i$ and between $\theta_{j-1}$ and $\theta_j$ has area $\bar r_i\,\Delta r\,\Delta\theta$, where $\bar r_i$ is its average radius. With the sample point at radius $\bar r_i$ and some angle $\theta_j^*$, the sum

$$\sum_{i=1}^{m}\sum_{j=1}^{n} f\big(\bar r_i\cos\theta_j^*, \bar r_i\sin\theta_j^*\big)\,\bar r_i\,\Delta r\,\Delta\theta$$

adds up $f$ times the areas of the pieces of $D$, like a double Riemann sum. It is also an ordinary double Riemann sum of the function $f(r\cos\theta, r\sin\theta)\,r$ over the rectangle $[r_0, r_1] \times [\alpha, \beta]$ of the $r\theta$-plane, so it approaches the right side of the theorem. That it also approaches $\iint_D f\,dA$ needs Riemann sums over pieces that are not rectangles, which this module does not develop; Section 19.8 places the theorem in a general rule.

::: example Under a paraboloid
Find the volume of the solid under the paraboloid $z = 4 - x^2 - y^2$ and above the $xy$-plane.

The paraboloid meets the plane $z = 0$ in the circle $x^2 + y^2 = 4$, so the solid stands on the disc $D$ of radius 2, where $4 - x^2 - y^2 \ge 0$. In polar coordinates $x^2 + y^2 = r^2$, so the height is $4 - r^2$, and $D$ is $0 \le r \le 2$, $0 \le \theta \le 2\pi$:

$$\begin{aligned} V &= \int_0^{2\pi}\int_0^2 \big(4 - r^2\big)\,r\,dr\,d\theta \\ &= \int_0^{2\pi}\Big[2r^2 - \frac{r^4}{4}\Big]_0^2\,d\theta \\ &= \int_0^{2\pi} 4\,d\theta = 8\pi \approx 25.13. \end{aligned}$$

The cylinder of radius 2 and height 4 has volume $16\pi$, so the dome fills exactly half of it. In $x$ and $y$ the same volume is $\int_{-2}^{2}\int_{-\sqrt{4 - x^2}}^{\sqrt{4 - x^2}} \big(4 - x^2 - y^2\big)\,dy\,dx$, a much longer computation.

```check
same((r*cos(theta))**2 + (r*sin(theta))**2, r**2)
antideriv(2*r**2 - r**4/4, (4 - r**2)*r, r); same((2*r**2 - r**4/4).subs(r, 2), 4)
steps(Integral((4 - r**2)*r, (r, 0, 2), (theta, 0, 2*pi)), Integral(4, (theta, 0, 2*pi)), 8*pi)
rounds(8*pi, '25.13'); same(pi*2**2*4, 16*pi)
same(integrate(4 - x**2 - y**2, (y, -sqrt(4 - x**2), sqrt(4 - x**2)), (x, -2, 2)), 8*pi)
```
:::

::: example A disc through the origin
Evaluate $\displaystyle\iint_D \sqrt{x^2 + y^2}\,dA$, where $D$ is the disc bounded by the circle $x^2 + y^2 = 2x$.

Completing the square, $(x - 1)^2 + y^2 = 1$: the disc of radius 1 centred at $(1, 0)$, which touches the origin. In polar coordinates the circle is $r^2 = 2r\cos\theta$, that is, $r = 2\cos\theta$ (or $r = 0$, the origin). The disc lies in the half-plane $x \ge 0$, so $\theta$ runs from $-\pi/2$ to $\pi/2$, and the ray at angle $\theta$ runs through $D$ from $r = 0$ to $r = 2\cos\theta$. With $\sqrt{x^2 + y^2} = r$,

$$\begin{aligned} \iint_D \sqrt{x^2 + y^2}\,dA &= \int_{-\pi/2}^{\pi/2}\int_0^{2\cos\theta} r\cdot r\,dr\,d\theta \\ &= \int_{-\pi/2}^{\pi/2} \frac{8\cos^3\theta}{3}\,d\theta \\ &= \frac83\cdot\frac43 = \frac{32}{9}. \end{aligned}$$

For the last integral, write $\cos^3\theta = (1 - \sin^2\theta)\cos\theta$ and substitute $u = \sin\theta$: $\int_{-\pi/2}^{\pi/2}\cos^3\theta\,d\theta = \int_{-1}^{1}(1 - u^2)\,du = \tfrac43$. The disc has area $\pi$, so the average distance of its points from the origin is $\tfrac{32}{9\pi} \approx 1.13$, a little more than the distance 1 of its centre.

```check
same(expand((x - 1)**2 + y**2 - 1), x**2 + y**2 - 2*x)
same(solve(r**2 - 2*r*cos(theta), r), [0, 2*cos(theta)])
same(integrate(r*r, (r, 0, 2*cos(theta))), 8*cos(theta)**3/3)
same(((1 - sin(theta)**2)*cos(theta)), cos(theta)**3); same(integrate(1 - u**2, (u, -1, 1)), Rational(4, 3))
same(integrate(cos(theta)**3, (theta, -pi/2, pi/2)), Rational(4, 3))
steps(Integral(r*r, (r, 0, 2*cos(theta)), (theta, -pi/2, pi/2)), Rational(8, 3)*Rational(4, 3), Rational(32, 9))
rounds(Rational(32, 9)/pi, '1.13'); holds(Rational(32, 9)/pi > 1)
```
:::

::: pitfall
Two slips with polar coordinates. Forgetting the factor $r$: $\int_0^{2\pi}\int_0^1 dr\,d\theta = 2\pi$ is not the area of the unit disc; $\int_0^{2\pi}\int_0^1 r\,dr\,d\theta = \pi$ is. And the wrong range of $\theta$: the circle $r = 2\cos\theta$ of Example 19.8 is traced once as $\theta$ runs from $-\pi/2$ to $\pi/2$. Letting $\theta$ run from 0 to $2\pi$ gives $\int_0^{2\pi} \tfrac83\cos^3\theta\,d\theta = 0$, because for $\pi/2 < \theta < 3\pi/2$ the "radius" $2\cos\theta$ is negative, which Theorem 19.4 does not allow.

```check
same(integrate(1, (r, 0, 1), (theta, 0, 2*pi)), 2*pi); same(integrate(r, (r, 0, 1), (theta, 0, 2*pi)), pi)
same(integrate(Rational(8, 3)*cos(theta)**3, (theta, 0, 2*pi)), 0); holds(2*cos(pi) < 0)
```
:::

### The Gaussian integral {#gaussian}

Module 12 needed the value of $\int_{-\infty}^{\infty} e^{-x^2}\,dx$ to show that the normal density has total area 1, and quoted it ([Section 12.9](module_12_EN.html#normal)) with the promise of a proof here. No antiderivative of $e^{-x^2}$ helps. The trick is to square the integral: the square is a double integral, and in polar coordinates the factor $r$ makes $e^{-r^2}$ easy to integrate.

::: theorem The Gaussian integral
$$\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi.$$
:::

::: proof
For $a > 0$ let

$$I_a = \int_{-a}^{a} e^{-x^2}\,dx.$$

**The square of $I_a$ is a double integral.** The name of the variable does not matter, so $I_a = \int_{-a}^{a} e^{-y^2}\,dy$ too, and by the product rule of Section 19.2 on the square $S_a = [-a, a] \times [-a, a]$,

$$\begin{aligned} I_a^2 &= \int_{-a}^{a} e^{-x^2}\,dx\int_{-a}^{a} e^{-y^2}\,dy \\ &= \iint_{S_a} e^{-(x^2 + y^2)}\,dA. \end{aligned}$$

**Squeeze it between two discs.** Let $D_R$ be the disc of radius $R$ centred at the origin. The disc $D_a$ lies inside $S_a$, and $S_a$ lies inside the disc $D_{a\sqrt2}$ through its corners (Figure 19.3, right). The integrand is positive, so a larger region gives a larger integral (Section 19.3):

$$\iint_{D_a} e^{-(x^2 + y^2)}\,dA \le I_a^2 \le \iint_{D_{a\sqrt2}} e^{-(x^2 + y^2)}\,dA.$$

**Integrate over a disc in polar coordinates.** On $D_R$, $x^2 + y^2 = r^2$, and the substitution $u = r^2$ (Module 10) integrates $e^{-r^2}r$:

$$\begin{aligned} \iint_{D_R} e^{-(x^2 + y^2)}\,dA &= \int_0^{2\pi}\int_0^R e^{-r^2}\,r\,dr\,d\theta \\ &= 2\pi\Big[-\frac{e^{-r^2}}{2}\Big]_0^R \\ &= \pi\big(1 - e^{-R^2}\big). \end{aligned}$$

With $R = a$ and $R = a\sqrt2$, the squeeze becomes

$$\pi\big(1 - e^{-a^2}\big) \le I_a^2 \le \pi\big(1 - e^{-2a^2}\big).$$

**Let $a \to \infty$.** Both bounds approach $\pi$, because $e^{-a^2}$ and $e^{-2a^2}$ approach 0. By the squeeze theorem ([Section 2.6](module_02_EN.html#squeeze), which holds for limits at infinity too), $I_a^2 \to \pi$; since $I_a > 0$ and the square root is continuous, $I_a \to \sqrt\pi$. Finally, $e^{-x^2}$ is even, so $\int_0^a e^{-x^2}\,dx = \tfrac12 I_a \to \tfrac{\sqrt\pi}{2}$, and likewise $\int_{-a}^0 e^{-x^2}\,dx \to \tfrac{\sqrt\pi}{2}$. Both halves of the improper integral converge ([Section 12.8](module_12_EN.html#infinite-intervals), with $c = 0$), and their sum is $\sqrt\pi$.
:::

```check
ag = symbols('a', positive=True)
same(integrate(exp(-x**2), (x, -ag, ag))*integrate(exp(-y**2), (y, -ag, ag)), integrate(exp(-x**2)*exp(-y**2), (y, -ag, ag), (x, -ag, ag)))
same(exp(-x**2)*exp(-y**2), exp(-(x**2 + y**2)))
holds(sqrt(2)*ag > ag); same((ag**2 + ag**2), (sqrt(2)*ag)**2)                 # the corners (±a, ±a) are at distance a*sqrt(2)
Rg = symbols('R', positive=True)
antideriv(-exp(-r**2)/2, exp(-r**2)*r, r)
steps(Integral(exp(-r**2)*r, (r, 0, Rg), (theta, 0, 2*pi)), 2*pi*(Rational(1, 2) - exp(-Rg**2)/2), pi*(1 - exp(-Rg**2)))
same((pi*(1 - exp(-Rg**2))).subs(Rg, sqrt(2)*ag), pi*(1 - exp(-2*ag**2)))
limit_is(pi*(1 - exp(-ag**2)), ag, oo, pi); limit_is(pi*(1 - exp(-2*ag**2)), ag, oo, pi)
limit_is(integrate(exp(-x**2), (x, 0, ag)), ag, oo, sqrt(pi)/2); same(integrate(exp(-x**2), (x, -oo, oo)), sqrt(pi))
for av in (Rational(1, 2), 1, 2):
    Ia2 = Integral(exp(-x**2), (x, -av, av)).evalf(30)**2
    holds(pi*(1 - exp(-av**2)) <= Ia2); holds(Ia2 <= pi*(1 - exp(-2*av**2)))
```

The squeeze in numbers: the middle column below comes from computing $I_a$ numerically, and both bounds close in on $\pi = 3.14159\ldots$

```valuetable
a = 0.5, 1, 1.5, 2, 3
$\pi\big(1 - e^{-a^2}\big)$ = pi*(1 - exp(-a**2))
$I_a^2$ = Integral(exp(-x**2), (x, -a, a))**2
$\pi\big(1 - e^{-2a^2}\big)$ = pi*(1 - exp(-2*a**2))
digits = 6
---
a | \pi\big(1 - e^{-a^2}\big) | I_a^2 | \pi\big(1 - e^{-2a^2}\big)
0.5 | 0.694918 | 0.851121 | 1.23612
1 | 1.98587 | 2.23099 | 2.71642
1.5 | 2.81047 | 2.93223 | 3.10669
2 | 3.08405 | 3.11227 | 3.14054
3 | 3.14120 | 3.14145 | 3.14159
```

::: note
Why the squeeze? A shorter argument writes the square of $\int_{-\infty}^{\infty} e^{-x^2}\,dx$ as one integral over the whole plane and switches to polar coordinates in one step: $\int_0^{2\pi}\int_0^\infty e^{-r^2}r\,dr\,d\theta = \pi$. That is the idea, but it uses a double integral over an unbounded region, which is improper and needs its own definition. The proof above uses only integrals over bounded regions and lets $a \to \infty$ at the end.
:::

Two consequences for probability. For $c > 0$, the substitution $x = \sqrt c\,t$, with $dx = \sqrt c\,dt$, gives

$$\int_{-\infty}^{\infty} e^{-ct^2}\,dt = \frac{1}{\sqrt c}\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\frac{\pi}{c}}.$$

With $c = \tfrac12$ this is $\int_{-\infty}^{\infty} e^{-t^2/2}\,dt = \sqrt{2\pi}$, the total area that makes the standard normal density $\varphi(z) = e^{-z^2/2}/\sqrt{2\pi}$ of Module 12 a density. And since the integrand is even, $\int_0^\infty e^{-x^2}\,dx = \tfrac{\sqrt\pi}{2}$.

```check
cg = symbols('c', positive=True)
same(integrate(exp(-cg*t**2), (t, -oo, oo)), sqrt(pi/cg)); same(sqrt(pi/cg).subs(cg, Rational(1, 2)), sqrt(2*pi))
same((exp(-x**2)).subs(x, sqrt(cg)*t)*sqrt(cg), sqrt(cg)*exp(-cg*t**2))
same(integrate(exp(-z**2/2)/sqrt(2*pi), (z, -oo, oo)), 1); same(integrate(exp(-x**2), (x, 0, oo)), sqrt(pi)/2)
```

## Mass, centre of mass and probability {#applications}

Volumes and areas are the start. Whenever a quantity is spread over a region with a known amount per unit area, a double integral adds it up, by the method of [Section 12.1](module_12_EN.html#method): slice (now into small rectangles), approximate, add, and take the limit.

### Mass and centre of mass {#mass}

A thin flat plate, a **lamina**, occupies a region $D$ of the plane, and its **density** at $(x, y)$, its mass per unit area, is $\rho(x, y)$ kg/m². A small rectangle of the plate around a sample point has mass about $\rho\,\Delta A$, and its **moment** about the $y$-axis is about its mass times its signed distance $x$ from that axis; its moment about the $x$-axis uses $y$. Adding and taking the limit:

::: definition Mass and centre of mass of a plate
A lamina occupying the region $D$ with continuous density $\rho(x, y) > 0$ has the **mass** and the **moments** about the $y$-axis and the $x$-axis

$$m = \iint_D \rho\,dA, \quad M_y = \iint_D x\rho\,dA, \quad M_x = \iint_D y\rho\,dA,$$

and its **centre of mass** is the point $(\bar x, \bar y)$ with

$$\bar x = \frac{M_y}{m}, \qquad \bar y = \frac{M_x}{m}.$$

If $\rho$ is constant, it cancels, and the centre of mass is the **centroid** of $D$.
:::

The plate balances on a point under its centre of mass, as the rods and plates of [Section 12.7](module_12_EN.html#centre-of-mass) did. Module 12's centroid formulas for a uniform plate between two graphs are this definition with the inner integral done: integrating $x$ and $y$ in $y$ from $g(x)$ to $f(x)$ gives $x\big(f(x) - g(x)\big)$ and $\tfrac12\big(f(x)^2 - g(x)^2\big)$.

```check
fU, gU = Function('f'), Function('g')
same(integrate(x, (y, gU(x), fU(x))), x*(fU(x) - gU(x))); same(integrate(y, (y, gU(x), fU(x))), (fU(x)**2 - gU(x)**2)/2)
```

::: example A plate that is denser at the rim
A thin plate occupies the quarter disc $x^2 + y^2 \le 1$, $x \ge 0$, $y \ge 0$, with lengths in metres, and its density is proportional to the distance from the origin: $\rho = k\sqrt{x^2 + y^2}$ kg/m², for a constant $k > 0$ (a hypothetical plate). Find its centre of mass.

In polar coordinates $\rho = kr$, and the quarter disc is $0 \le r \le 1$, $0 \le \theta \le \pi/2$:

$$\begin{aligned} m &= \int_0^{\pi/2}\int_0^1 kr\cdot r\,dr\,d\theta = \frac{\pi}{2}\cdot\frac{k}{3} = \frac{k\pi}{6}, \\ M_y &= \int_0^{\pi/2}\int_0^1 (r\cos\theta)\,kr\cdot r\,dr\,d\theta \\ &= k\int_0^{\pi/2}\cos\theta\,d\theta\int_0^1 r^3\,dr = \frac{k}{4}. \end{aligned}$$

So $\bar x = \dfrac{k/4}{k\pi/6} = \dfrac{3}{2\pi} \approx 0.477$ m. Swapping $x$ and $y$ changes neither the quarter disc nor the density, so $M_x = M_y$ and $\bar y = \bar x$: the centre of mass is $\big(\tfrac{3}{2\pi}, \tfrac{3}{2\pi}\big)$, and the constant $k$ has cancelled. A plate of constant density balances at the centroid of the quarter disc, $\big(\tfrac{4}{3\pi}, \tfrac{4}{3\pi}\big) \approx (0.424, 0.424)$, the same height as for the half disc of Module 12: the extra mass near the rim moves the balance point outwards.

```check
kp = symbols('k', positive=True)
m199 = integrate(kp*r*r, (r, 0, 1), (theta, 0, pi/2)); same(m199, kp*pi/6)
My199 = integrate(r*cos(theta)*kp*r*r, (r, 0, 1), (theta, 0, pi/2)); same(My199, kp/4)
same(integrate(cos(theta), (theta, 0, pi/2))*integrate(r**3, (r, 0, 1)), Rational(1, 4))
same(My199/m199, 3/(2*pi)); rounds(3/(2*pi), '0.477')
same(integrate(r*sin(theta)*kp*r*r, (r, 0, 1), (theta, 0, pi/2)), My199)
cent = integrate(r*cos(theta)*r, (r, 0, 1), (theta, 0, pi/2))/integrate(r, (r, 0, 1), (theta, 0, pi/2))
same(cent, 4/(3*pi)); rounds(4/(3*pi), '0.424'); holds(3/(2*pi) > 4/(3*pi))
```
:::

### Moments of inertia {#inertia}

::: definition Moments of inertia
The **moments of inertia** of the lamina of Definition 19.4 about the $x$-axis, about the $y$-axis and about the origin are

$$\begin{aligned} I_x &= \iint_D y^2\rho\,dA, \qquad I_y = \iint_D x^2\rho\,dA, \\ I_0 &= \iint_D \big(x^2 + y^2\big)\rho\,dA = I_x + I_y. \end{aligned}$$
:::

Each piece of the plate counts with its mass times the square of its distance from the axis; for $I_0$, the distance from the origin, which is the distance from the axis through the origin perpendicular to the plate. The moment of inertia measures how hard it is to start or stop the plate turning about that axis, as mass measures how hard it is to change a velocity: a body turning at $\omega$ radians per second about an axis has kinetic energy $\tfrac12 I\omega^2$, the counterpart of $\tfrac12 mv^2$. Because of the square, mass far from the axis counts most.

::: example A disc and a ring
Find the moment of inertia $I_0$ of a uniform disc of radius $a$ and mass $M$ about its centre, and compare it with that of a thin ring of the same radius and mass.

The density is $\rho = \dfrac{M}{\pi a^2}$, and in polar coordinates $x^2 + y^2 = r^2$:

$$\begin{aligned} I_0 &= \int_0^{2\pi}\int_0^a r^2\,\frac{M}{\pi a^2}\,r\,dr\,d\theta \\ &= \frac{M}{\pi a^2}\cdot 2\pi\cdot\frac{a^4}{4} = \frac12 Ma^2. \end{aligned}$$

In a thin ring all the mass is at distance $a$ from the centre, so $I_0 = Ma^2$: twice as much. Spinning the ring up to the same angular speed takes twice the energy, which is why a flywheel, built to store energy, carries much of its mass in a heavy rim.

```check
aM, Mm = symbols('a M', positive=True)
steps(Integral(r**2*Mm/(pi*aM**2)*r, (r, 0, aM), (theta, 0, 2*pi)), Mm/(pi*aM**2)*2*pi*aM**4/4, Mm*aM**2/2)
same(Mm*aM**2/(Mm*aM**2/2), 2)
```
:::

### Joint densities {#joint-densities}

Module 12 described one random quantity by a density ([Section 12.9](module_12_EN.html#densities)). Two at once, such as the waiting times at two servers, or the two coordinates of a dart's hit on a board, are described by one function of two variables.

::: definition Joint density
A **joint density** is a function $f(x, y) \ge 0$ whose integral over the whole plane is 1. A pair of random variables $(X, Y)$ has the joint density $f$ if, for every region $D$,

$$P\big((X, Y) \in D\big) = \iint_D f(x, y)\,dA.$$
:::

$P\big((X, Y) \in D\big)$ reads "the probability that the point $(X, Y)$ lies in $D$". The integral over the whole plane is improper. For the densities of this module, which are continuous on a region and 0 outside it, it is the limit of the integrals over the squares $[-a, a] \times [-a, a]$ as $a \to \infty$, as in the proof of Theorem 19.5, and an improper double integral of a function $f \ge 0$ can be computed as an iterated integral of improper integrals, in either order. This extension of Fubini's theorem is taken on trust here.

**Independence.** Two random variables $X$ and $Y$ with densities $f_1$ and $f_2$ are **independent** if their joint density is the product $f(x, y) = f_1(x)f_2(y)$. Then, by the product rule of Section 19.2,

$$\begin{aligned} &P(a \le X \le b \text{ and } c \le Y \le d) \\ &\quad= \int_a^b f_1(x)\,dx\int_c^d f_2(y)\,dy \\ &\quad= P(a \le X \le b)\,P(c \le Y \le d): \end{aligned}$$

knowing where $X$ landed does not change the chances for $Y$. This is independence in outline; probability theory defines independence for all random variables, and proves that for random variables with densities it amounts to this product rule.

::: example Which request arrives first?
Two servers each wait for their next request (a hypothetical system). The waiting times, in seconds, are independent: the first, $X$, has the exponential density with rate 1, and the second, $Y$, the exponential density with rate 2 ([Section 12.9](module_12_EN.html#exponential-distribution)). Find the probability $P(Y < X)$ that the second server's request arrives first.

The joint density is $f(x, y) = e^{-x}\cdot 2e^{-2y}$ for $x \ge 0$ and $y \ge 0$, and 0 elsewhere; the integrals of the two factors over $[0, \infty)$ are both 1, so its integral over the plane is 1. The event $Y < X$ is the part of the first quadrant below the line $y = x$: for each $x \ge 0$, $y$ runs from 0 to $x$. So

$$\begin{aligned} P(Y < X) &= \int_0^\infty\int_0^x e^{-x}\,2e^{-2y}\,dy\,dx \\ &= \int_0^\infty e^{-x}\big(1 - e^{-2x}\big)\,dx \\ &= \int_0^\infty \big(e^{-x} - e^{-3x}\big)\,dx = 1 - \frac13 = \frac23. \end{aligned}$$

The faster stream of requests wins two times out of three: its rate, 2, is two thirds of the total rate, 3.

```check
fJ = exp(-x)*2*exp(-2*y)
same(integrate(fJ, (y, 0, oo), (x, 0, oo)), 1)
same(integrate(2*exp(-2*y), (y, 0, x)), 1 - exp(-2*x)); same(expand(exp(-x)*(1 - exp(-2*x))), exp(-x) - exp(-3*x))
same(integrate(exp(-x), (x, 0, oo)), 1); same(integrate(exp(-3*x), (x, 0, oo)), Rational(1, 3))
same(integrate(fJ, (y, 0, x), (x, 0, oo)), Rational(2, 3)); same(integrate(fJ, (x, y, oo), (y, 0, oo)), Rational(2, 3))
```
:::

::: pitfall
Two slips with joint densities. A joint density is not a probability, and can be larger than 1: in Example 19.11, $f(0, 0) = 2$. Probabilities come from integrating it over a region. And the limits must describe the event within the region where the density is not 0. For $Y < X$ above, $y$ starts at 0, where the density starts, not at $-\infty$: the formula $e^{-x}\cdot 2e^{-2y}$, integrated from $y = -\infty$, would diverge, although the density there is 0.

```check
same(fJ.subs({x: 0, y: 0}), 2); same(integrate(2*exp(-2*y), (y, -oo, 0)), oo)
```
:::

::: compute Probabilities by simulation
A probability can also be estimated by simulating the random variables many times and counting. NumPy's random-number generator draws exponential waiting times directly; its `scale` is the mean, $1/\lambda$, and the seed makes the output repeatable:

```python
import numpy as np
rng = np.random.default_rng(2026)
N = 1_000_000
X = rng.exponential(scale=1.0, size=N)     # rate 1
Y = rng.exponential(scale=0.5, size=N)     # rate 2
print(np.mean(Y < X))                      # the fraction of trials with Y < X
```

```output
0.666296
```

The fraction is close to $\tfrac23 \approx 0.6667$, as Example 19.11 found. The error of such an estimate shrinks only like $1/\sqrt N$: a million trials give about three correct digits. Integrals in many dimensions, where grids of boxes need too many points, are often computed this way, by **Monte Carlo** methods.
:::

## Triple integrals {#triple}

A function of three variables $f(x, y, z)$ might give the density of a solid at each point, or the temperature in a room. For a box

$$B = [a, b] \times [c, d] \times [p, q],$$

cut each edge into equal parts, so that $B$ is cut into small boxes of volume $\Delta V = \Delta x\,\Delta y\,\Delta z$, choose a sample point in each, and add up the values of $f$ at the sample points times $\Delta V$: a **triple Riemann sum**. Its limit, defined as in Definition 19.1, is the **triple integral** $\iiint_B f(x, y, z)\,dV$, read "the triple integral over $B$ of $f$, $dV$". For solids that are not boxes, extend $f$ by zero, as in Section 19.3. A solid $E$ is of **type 1** if it lies between two surfaces over a region $D$ of the $xy$-plane,

$$E = \{(x, y, z) : (x, y) \in D,\ u_1(x, y) \le z \le u_2(x, y)\},$$

with $u_1$ and $u_2$ continuous and $u_1 \le u_2$; the solid's shadow on the $xy$-plane is $D$.

::: theorem Triple integrals as iterated integrals
If $f$ is continuous on the box $B$, then $\iiint_B f\,dV$ equals an iterated integral in any of the six orders, for example

$$\iiint_B f\,dV = \int_a^b\int_c^d\int_p^q f(x, y, z)\,dz\,dy\,dx.$$

If $f$ is continuous on a type 1 solid $E$ whose shadow $D$ is of type I or type II, then

$$\iiint_E f\,dV = \iint_D\Big[\int_{u_1(x, y)}^{u_2(x, y)} f(x, y, z)\,dz\Big]\,dA.$$
:::

The proofs are those of Theorems 19.2 and 19.3, one dimension up. The double integral over $D$ is then set up as in Section 19.3. Solids that lie between two surfaces $x = \dots$ over a region of the $yz$-plane, or between two surfaces $y = \dots$ over a region of the $xz$-plane, work the same way with the letters changed. With $f = 1$, $\iiint_E dV$ is the **volume** of $E$. A solid with density $\rho(x, y, z)$ has mass $m = \iiint_E \rho\,dV$ and centre of mass $(\bar x, \bar y, \bar z)$, where $\bar x = \tfrac1m\iiint_E x\rho\,dV$, and similarly for $\bar y$ and $\bar z$; with constant density it is the **centroid** of $E$.

::: example The centroid of a tetrahedron
Find the volume and the centroid of the tetrahedron $E$ with vertices $(0, 0, 0)$, $(1, 0, 0)$, $(0, 1, 0)$ and $(0, 0, 1)$.

The face opposite the origin lies in the plane $x + y + z = 1$, so $E$ is the type 1 solid $0 \le z \le 1 - x - y$ over the triangle $D$: $0 \le x \le 1$, $0 \le y \le 1 - x$. Its volume is

$$\begin{aligned} V &= \int_0^1\int_0^{1-x}\int_0^{1-x-y} dz\,dy\,dx \\ &= \int_0^1\int_0^{1-x}(1 - x - y)\,dy\,dx \\ &= \int_0^1\frac{(1 - x)^2}{2}\,dx = \frac16, \end{aligned}$$

as Example 19.5 gives with $a = b = c = 1$. For the centroid,

$$\begin{aligned} \iiint_E z\,dV &= \int_0^1\int_0^{1-x}\frac{(1 - x - y)^2}{2}\,dy\,dx \\ &= \int_0^1\frac{(1 - x)^3}{6}\,dx = \frac{1}{24}, \end{aligned}$$

so $\bar z = \dfrac{1/24}{1/6} = \dfrac14$. Swapping any two of $x$, $y$ and $z$ leaves $E$ unchanged, so $\bar x = \bar y = \bar z = \tfrac14$. The centroid $\big(\tfrac14, \tfrac14, \tfrac14\big)$ is the average of the four vertices, a quarter of the way from the face $z = 0$ to the opposite vertex.

```check
same(integrate(1, (z, 0, 1 - x - y)), 1 - x - y); same(integrate(1 - x - y, (y, 0, 1 - x)), (1 - x)**2/2)
V1912 = integrate(1, (z, 0, 1 - x - y), (y, 0, 1 - x), (x, 0, 1)); same(V1912, Rational(1, 6))
same(integrate(z, (z, 0, 1 - x - y)), (1 - x - y)**2/2); same(integrate((1 - x - y)**2/2, (y, 0, 1 - x)), (1 - x)**3/6)
Mz1912 = integrate(z, (z, 0, 1 - x - y), (y, 0, 1 - x), (x, 0, 1)); same(Mz1912, Rational(1, 24)); same(Mz1912/V1912, Rational(1, 4))
same(integrate(x, (z, 0, 1 - x - y), (y, 0, 1 - x), (x, 0, 1)), Rational(1, 24)); same(integrate(y, (z, 0, 1 - x - y), (y, 0, 1 - x), (x, 0, 1)), Rational(1, 24))
same((Rational(0) + 1 + 0 + 0)/4, Rational(1, 4))
```
:::

**Choosing the order.** The same tetrahedron can be described in all six orders. Projecting it onto the $yz$-plane, for example, gives $0 \le y \le 1$, $0 \le z \le 1 - y$, $0 \le x \le 1 - y - z$, and $V = \int_0^1\int_0^{1-y}\int_0^{1-y-z} dx\,dz\,dy$. The recipe of Section 19.3 works one variable at a time. The innermost limits are the two surfaces through which a line parallel to that variable's axis enters and leaves $E$; the other two variables describe the shadow of $E$ on the plane of their axes, as in two dimensions. Choose the order in which the shadow and the integrals are simplest.

```check
same(integrate(1, (x, 0, 1 - y - z), (z, 0, 1 - y), (y, 0, 1)), Rational(1, 6))
```

::: pitfall
In a triple iterated integral the innermost limits may depend on both outer variables, the middle limits only on the outermost variable, and the outermost limits on none. In $\int_0^1\int_0^{1-x}\int_0^{1-x-y} f\,dz\,dy\,dx$, the limit $1 - x - y$ belongs inside, with $dz$; it cannot move to the middle integral, where $y$ is the variable being integrated.
:::

## Cylindrical and spherical coordinates {#cylindrical-spherical}

### Cylindrical coordinates {#cylindrical}

**Cylindrical coordinates** $(r, \theta, z)$ describe a point by the polar coordinates $(r, \theta)$ of its shadow on the $xy$-plane and its height $z$:

$$x = r\cos\theta, \qquad y = r\sin\theta, \qquad z = z.$$

The cylinder $x^2 + y^2 = 4$ becomes $r = 2$, and the paraboloid $z = x^2 + y^2$ becomes $z = r^2$. For a type 1 solid whose shadow is described in polar coordinates, Theorem 19.6 with Theorem 19.4 for the double integral gives $dV = dz\,dA = r\,dz\,dr\,d\theta$:

::: theorem Triple integrals in cylindrical coordinates
Let $E$ be the solid $u_1(x, y) \le z \le u_2(x, y)$ over the region $D$ given by $\alpha \le \theta \le \beta$, $h_1(\theta) \le r \le h_2(\theta)$, with $h_1$ and $h_2$ as in Theorem 19.4 and $u_1 \le u_2$ continuous. If $f$ is continuous on $E$, then

$$\iiint_E f\,dV = \int_\alpha^\beta\int_{h_1(\theta)}^{h_2(\theta)}\int_{u_1(r\cos\theta,\,r\sin\theta)}^{u_2(r\cos\theta,\,r\sin\theta)} f(r\cos\theta, r\sin\theta, z)\,r\,dz\,dr\,d\theta.$$
:::

::: example Water in a parabolic bowl
The bowl of [Example 12.7](module_12_EN.html#other-axes) is the surface $z = x^2 + y^2$, the parabola $z = x^2$ turned about the $z$-axis (Module 12 called the vertical axis $y$). It holds water to the depth $h$. Find the volume of the water and the height of its centre of mass.

The water is the solid $r^2 \le z \le h$ over the disc $0 \le r \le \sqrt h$, $0 \le \theta \le 2\pi$, where the bowl is below the water level. Its volume is

$$\begin{aligned} V &= \int_0^{2\pi}\int_0^{\sqrt h}\int_{r^2}^{h} r\,dz\,dr\,d\theta \\ &= 2\pi\int_0^{\sqrt h}\big(h - r^2\big)\,r\,dr \\ &= 2\pi\Big(\frac{h^2}{2} - \frac{h^2}{4}\Big) = \frac{\pi h^2}{2}, \end{aligned}$$

as Module 12 found by discs. The water does not change when it is turned about the $z$-axis, so its centre of mass lies on the axis. Its height needs

$$\begin{aligned} \iiint z\,dV &= 2\pi\int_0^{\sqrt h}\Big[\frac{z^2}{2}\Big]_{r^2}^{h}\,r\,dr \\ &= \pi\int_0^{\sqrt h}\big(h^2 - r^4\big)\,r\,dr \\ &= \pi\Big(\frac{h^3}{2} - \frac{h^3}{6}\Big) = \frac{\pi h^3}{3}, \end{aligned}$$

so $\bar z = \dfrac{\pi h^3/3}{\pi h^2/2} = \dfrac{2h}{3}$: two thirds of the way up, because the bowl is widest at the top. (Pumping all the water over the rim therefore lifts its mass $m$ by $h - \tfrac{2h}{3} = \tfrac{h}{3}$ on average, and takes the work $\tfrac13 mgh$.)

```check
hb = symbols('h', positive=True)
same(integrate(r, (z, r**2, hb)), (hb - r**2)*r)
steps(Integral(r, (z, r**2, hb), (r, 0, sqrt(hb)), (theta, 0, 2*pi)), 2*pi*(hb**2/2 - hb**2/4), pi*hb**2/2)
same(integrate(z*r, (z, r**2, hb)), (hb**2 - r**4)*r/2)
steps(Integral(z*r, (z, r**2, hb), (r, 0, sqrt(hb)), (theta, 0, 2*pi)), pi*(hb**3/2 - hb**3/6), pi*hb**3/3)
same((pi*hb**3/3)/(pi*hb**2/2), 2*hb/3); same(hb - 2*hb/3, hb/3)
same(pi*integrate(y, (y, 0, hb)), pi*hb**2/2)
```
:::

### Spherical coordinates {#spherical}

Balls, cones with their tip at the origin and the regions between spheres call for coordinates of their own.

::: definition Spherical coordinates
The **spherical coordinates** $(\rho, \theta, \varphi)$ of a point $P$ are its distance $\rho \ge 0$ from the origin $O$; the angle $\theta$ of its cylindrical coordinates; and the angle $\varphi$ between the positive $z$-axis and the segment $OP$, with $0 \le \varphi \le \pi$. Then

$$x = \rho\sin\varphi\cos\theta, \quad y = \rho\sin\varphi\sin\theta, \quad z = \rho\cos\varphi,$$

and $\rho^2 = x^2 + y^2 + z^2$.
:::

The Greek letters are $\rho$, "rho" (here a distance, not a density), and $\varphi$, "phi". In the vertical half-plane through the $z$-axis and $P$, the segment $OP$ has length $\rho$ and makes the angle $\varphi$ with the $z$-axis, so $P$ has the height $z = \rho\cos\varphi$ and lies at the distance $r = \rho\sin\varphi$ from the $z$-axis (Figure 19.4); then $x = r\cos\theta$ and $y = r\sin\theta$, as in cylindrical coordinates. The equation $\rho = a$ describes the sphere of radius $a$; $\varphi = c$ describes a cone around the $z$-axis (and the $xy$-plane when $c = \pi/2$); $\theta = c$ describes a half-plane.

```check
rh, ph = symbols('rho phi', nonnegative=True)
same((rh*sin(ph)*cos(theta))**2 + (rh*sin(ph)*sin(theta))**2 + (rh*cos(ph))**2, rh**2)
same((rh*sin(ph)*cos(theta))**2 + (rh*sin(ph)*sin(theta))**2, (rh*sin(ph))**2)
```

::: note
Conventions differ. This series, like most mathematics books, measures $\varphi$ from the positive $z$-axis, so that $\varphi = 0$ on the positive $z$-axis, $\varphi = \pi/2$ in the $xy$-plane and $\varphi = \pi$ on the negative $z$-axis, and keeps $\theta$ for the angle around the $z$-axis, as in polar and cylindrical coordinates. Most physics books swap the two names, writing $\theta$ for the angle from the $z$-axis and $\varphi$ for the angle around it, and geography measures latitude from the equator, not from the pole. Before you use a formula from another source, check which angle is which.
:::

::: figure id=fig-19-4
Spherical coordinates. The point $P$ is at the distance $\rho$ from the origin and at the angle $\varphi$ from the positive $z$-axis. Its shadow on the $xy$-plane is at the distance $r = \rho\sin\varphi$ from the origin, at the angle $\theta$ of polar coordinates, and its height is $z = \rho\cos\varphi$. The grey arcs outline the part of the sphere of radius $\rho$ in the first octant; the dashed arcs through $P$ are the circle of constant $\varphi$ and the half-circle of constant $\theta$.
:::

**The volume element.** A small **spherical wedge**, between the radii $\rho$ and $\rho + \Delta\rho$, the angles $\theta$ and $\theta + \Delta\theta$ and the angles $\varphi$ and $\varphi + \Delta\varphi$, is nearly a box. Its edge along a ray from the origin has length $\Delta\rho$. Its edge along the half-circle of constant $\theta$, which has radius $\rho$, has length about $\rho\,\Delta\varphi$. Its edge along the circle of constant $\varphi$, which has radius $r = \rho\sin\varphi$ about the $z$-axis, has length about $\rho\sin\varphi\,\Delta\theta$. The three edges meet at right angles, so the wedge has volume about $\rho^2\sin\varphi\,\Delta\rho\,\Delta\theta\,\Delta\varphi$, and

$$dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi.$$

::: theorem Triple integrals in spherical coordinates
Let $E$ be the spherical wedge $\rho_0 \le \rho \le \rho_1$, $\alpha \le \theta \le \beta$, $\varphi_0 \le \varphi \le \varphi_1$, where $\rho_0 \ge 0$, $0 < \beta - \alpha \le 2\pi$ and $0 \le \varphi_0 < \varphi_1 \le \pi$. If $f$ is continuous on $E$, then

$$\iiint_E f\,dV = \int_{\varphi_0}^{\varphi_1}\int_\alpha^\beta\int_{\rho_0}^{\rho_1} f(x, y, z)\,\rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi,$$

with $x$, $y$ and $z$ replaced by their expressions in $\rho$, $\theta$ and $\varphi$.
:::

The wedge argument above is the idea of the proof; Section 19.8 gives the general reason, in which $\rho^2\sin\varphi$ is a Jacobian. The same formula holds when $\rho$ runs between two continuous functions of $\theta$ and $\varphi$.

::: example A ball and an ice-cream cone
(a) Find the volume of a ball of radius $a$. (b) Find the volume of the part of the ball that lies within the angle $\pi/3$ of the positive $z$-axis, an "ice-cream cone".

**(a)** The ball is $0 \le \rho \le a$, $0 \le \theta \le 2\pi$, $0 \le \varphi \le \pi$. All the limits are constants and the integrand is a product of a function of each variable, so the integral splits as in Section 19.2:

$$\begin{aligned} V &= \int_0^\pi\int_0^{2\pi}\int_0^a \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi \\ &= \int_0^\pi \sin\varphi\,d\varphi\int_0^{2\pi} d\theta\int_0^a \rho^2\,d\rho \\ &= 2\cdot 2\pi\cdot\frac{a^3}{3} = \frac43\pi a^3, \end{aligned}$$

the volume that [Example 12.5](module_12_EN.html#washers) found with discs.

**(b)** Now $0 \le \varphi \le \pi/3$, and the factor $\int_0^{\pi/3}\sin\varphi\,d\varphi = 1 - \cos\tfrac{\pi}{3} = \tfrac12$ replaces the 2:

$$V = \frac12\cdot 2\pi\cdot\frac{a^3}{3} = \frac{\pi a^3}{3},$$

a quarter of the ball. The cone $\varphi = \pi/3$ is the surface $z = \tfrac{1}{\sqrt3}\sqrt{x^2 + y^2}$, since $r = z\tan\tfrac{\pi}{3} = \sqrt3\,z$ on it. In $x$, $y$ and $z$ the ice-cream cone needs limits with square roots, and the inner integral meets the cone below and the sphere above; in spherical coordinates all six limits are constants.

```check
aB = symbols('a', positive=True)
same(integrate(sin(ph), (ph, 0, pi)), 2); same(integrate(rh**2, (rh, 0, aB)), aB**3/3)
steps(Integral(rh**2*sin(ph), (rh, 0, aB), (theta, 0, 2*pi), (ph, 0, pi)), 2*2*pi*aB**3/3, Rational(4, 3)*pi*aB**3)
same(integrate(sin(ph), (ph, 0, pi/3)), Rational(1, 2)); same(1 - cos(pi/3), Rational(1, 2))
same(integrate(rh**2*sin(ph), (rh, 0, aB), (theta, 0, 2*pi), (ph, 0, pi/3)), pi*aB**3/3); same((pi*aB**3/3)/(Rational(4, 3)*pi*aB**3), Rational(1, 4))
same(tan(pi/3), sqrt(3)); same((rh*sin(ph)/(rh*cos(ph))).subs(ph, pi/3), sqrt(3))
```
:::

::: pitfall
$\varphi$ runs from 0 to $\pi$, not to $2\pi$: at $\varphi = \pi$ the segment $OP$ already points down the negative $z$-axis. With $0 \le \varphi \le 2\pi$, the factor $\int_0^{2\pi}\sin\varphi\,d\varphi = 0$ would give a ball the volume 0. And the factor is $\rho^2\sin\varphi$: without the $\sin\varphi$, $\int_0^\pi\int_0^{2\pi}\int_0^a \rho^2\,d\rho\,d\theta\,d\varphi = \tfrac{2\pi^2a^3}{3} \approx 6.58a^3$ instead of $\tfrac43\pi a^3 \approx 4.19a^3$.

```check
same(integrate(sin(ph), (ph, 0, 2*pi)), 0); same(integrate(rh**2, (rh, 0, aB), (theta, 0, 2*pi), (ph, 0, pi)), 2*pi**2*aB**3/3)
rounds(2*pi**2/3, '6.58'); rounds(Rational(4, 3)*pi, '4.19')
```
:::

::: compute Coordinates and their volume elements
SymPy's `Matrix.jacobian` builds the array of all the first partial derivatives of a transformation, and `.det()` takes its determinant, the Jacobian of Section 19.8. For polar, cylindrical and spherical coordinates:

```python
import sympy as sp
r, theta, z, rho, phi = sp.symbols('r theta z rho phi', nonnegative=True)
polar = sp.Matrix([r*sp.cos(theta), r*sp.sin(theta)])
cyl = sp.Matrix([r*sp.cos(theta), r*sp.sin(theta), z])
sph = sp.Matrix([rho*sp.sin(phi)*sp.cos(theta), rho*sp.sin(phi)*sp.sin(theta), rho*sp.cos(phi)])
print(sp.simplify(polar.jacobian([r, theta]).det()))
print(sp.simplify(cyl.jacobian([r, theta, z]).det()))
print(sp.simplify(sph.jacobian([rho, phi, theta]).det()))
```

```output
r
r
rho**2*sin(phi)
```

These are the factors in $dA = r\,dr\,d\theta$, $dV = r\,dz\,dr\,d\theta$ and $dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$. (Listing the spherical variables in the order $\rho$, $\theta$, $\varphi$ instead changes the sign of the determinant; the formulas use its absolute value.) A ball's volume and the ice-cream cone of Example 19.14 follow:

```python
J = rho**2*sp.sin(phi)
a = sp.symbols('a', positive=True)
print(sp.integrate(J, (rho, 0, a), (theta, 0, 2*sp.pi), (phi, 0, sp.pi)))
print(sp.integrate(J, (rho, 0, a), (theta, 0, 2*sp.pi), (phi, 0, sp.pi/3)))
```

```output
4*pi*a**3/3
pi*a**3/3
```
:::

## Change of variables {#change-of-variables}

Polar, cylindrical and spherical coordinates are instances of one idea: describe a region with new variables in which it is simple, and pay for the change with a factor that measures how the new variables stretch areas or volumes. In one variable this is substitution: with $x = g(u)$, $\int_{g(c)}^{g(d)} f(x)\,dx = \int_c^d f\big(g(u)\big)\,g'(u)\,du$ ([Section 10.7](module_10_EN.html#definite-substitution)), where $g'(u)$ is the factor by which $g$ stretches short intervals. In two variables, a **transformation** $T$ sends each point $(u, v)$ of a region $S$ of the $uv$-plane to a point $(x, y) = T(u, v)$ of the $xy$-plane, by formulas

$$x = x(u, v), \qquad y = y(u, v),$$

and the stretching factor is a determinant. A **2 × 2 determinant** is the number

$$\begin{vmatrix} a & b \\ c & d \end{vmatrix} = ad - bc$$

([Module 10 of Mathematical Foundations](../math/module_10_EN.html#s6) treats determinants in general). The parallelogram spanned by two vectors $\langle a, c\rangle$ and $\langle b, d\rangle$ of the plane has area $\abs{ad - bc}$: regarded as the vectors $\langle a, c, 0\rangle$ and $\langle b, d, 0\rangle$ of space, they have the cross product $\langle 0, 0, ad - bc\rangle$, and the length of a cross product is the area of the parallelogram the two vectors span (Module 16).

```check
p1, p2, p3, p4 = symbols('p1 p2 p3 p4')
same(Matrix([p1, p3, 0]).cross(Matrix([p2, p4, 0])), Matrix([0, 0, p1*p4 - p2*p3])); same(Matrix([[p1, p2], [p3, p4]]).det(), p1*p4 - p2*p3)
```

::: definition Jacobian
Let $x = x(u, v)$ and $y = y(u, v)$ have continuous first partial derivatives. The **Jacobian** of the transformation is

$$\frac{\partial(x, y)}{\partial(u, v)} = \begin{vmatrix} \dfrac{\partial x}{\partial u} & \dfrac{\partial x}{\partial v} \\[8pt] \dfrac{\partial y}{\partial u} & \dfrac{\partial y}{\partial v} \end{vmatrix} = \frac{\partial x}{\partial u}\frac{\partial y}{\partial v} - \frac{\partial x}{\partial v}\frac{\partial y}{\partial u}.$$
:::

$\dfrac{\partial(x, y)}{\partial(u, v)}$ reads "the Jacobian of $x$ and $y$ with respect to $u$ and $v$". It is a function of $u$ and $v$.

::: theorem Change of variables in a double integral
Let $T$ have continuous first partial derivatives, and let it map a region $S$ of the $uv$-plane onto a region $D$ of the $xy$-plane, one-to-one except perhaps on the boundary of $S$, with a Jacobian that is not 0 except perhaps on the boundary of $S$. Let $S$ and $D$ be of type I or type II. If $f$ is continuous on $D$, then

$$\iint_D f(x, y)\,dA = \iint_S f\big(x(u, v), y(u, v)\big)\,\Big|\frac{\partial(x, y)}{\partial(u, v)}\Big|\,du\,dv.$$
:::

In short, $dA = \Big|\dfrac{\partial(x, y)}{\partial(u, v)}\Big|\,du\,dv$: the absolute value of the Jacobian is the factor by which $T$ multiplies small areas near each point. The Going deeper box below explains why; a complete proof belongs to a course in advanced calculus. In one variable the sign of $g'(u)$ is taken care of by the order of the limits; areas have no direction, so here the absolute value does that job.

::: example Polar coordinates again
Find the Jacobian of the polar coordinates $x = r\cos\theta$, $y = r\sin\theta$.

With $r$ and $\theta$ in the roles of $u$ and $v$,

$$\begin{aligned} \frac{\partial(x, y)}{\partial(r, \theta)} &= \begin{vmatrix} \cos\theta & -r\sin\theta \\ \sin\theta & r\cos\theta \end{vmatrix} \\ &= r\cos^2\theta + r\sin^2\theta = r. \end{aligned}$$

For $r \ge 0$ its absolute value is $r$, so $dA = r\,dr\,d\theta$, as Theorem 19.4 says. The rectangle $0 \le r \le a$, $0 \le \theta \le 2\pi$ is mapped onto the disc of radius $a$, one-to-one except on its boundary: the whole side $r = 0$ goes to the origin, where the Jacobian is 0, and the sides $\theta = 0$ and $\theta = 2\pi$ go to the same segment. Theorem 19.9 allows both.

```check
Jp = Matrix([r*cos(theta), r*sin(theta)]).jacobian([r, theta]); same(Jp, Matrix([[cos(theta), -r*sin(theta)], [sin(theta), r*cos(theta)]]))
steps(Jp.det(), r*cos(theta)**2 + r*sin(theta)**2, r)
```
:::

::: example An ellipse
Find the area of the region $E$ inside the ellipse $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$, where $a, b > 0$, and the integral $\iint_E x^2\,dA$.

The transformation $x = au$, $y = bv$ maps the disc $u^2 + v^2 \le 1$ one-to-one onto $E$, since $\tfrac{x^2}{a^2} + \tfrac{y^2}{b^2} = u^2 + v^2$. Its Jacobian is

$$\frac{\partial(x, y)}{\partial(u, v)} = \begin{vmatrix} a & 0 \\ 0 & b \end{vmatrix} = ab.$$

So the area of $E$ is $\iint ab\,du\,dv$ over the unit disc: $ab$ times its area $\pi$, that is, $\pi ab$. In the same way, with polar coordinates in the $uv$-plane for the last step,

$$\begin{aligned} \iint_E x^2\,dA &= \iint_{u^2 + v^2 \le 1} a^2u^2\cdot ab\,du\,dv \\ &= a^3b\int_0^{2\pi}\int_0^1 r^2\cos^2\theta\,r\,dr\,d\theta \\ &= a^3b\cdot\frac14\cdot\pi = \frac{\pi a^3b}{4}, \end{aligned}$$

since $\int_0^{2\pi}\cos^2\theta\,d\theta = \pi$ (write $\cos^2\theta = \tfrac12(1 + \cos 2\theta)$, Module 11). For a uniform elliptical plate of density $\rho$, this gives the moment of inertia $I_y = \tfrac{\pi\rho a^3b}{4} = \tfrac14 Ma^2$ about the $y$-axis, where $M = \rho\pi ab$ is its mass.

```check
aE, bE, rE = symbols('a b rho', positive=True)
same((x**2/aE**2 + y**2/bE**2).subs({x: aE*u, y: bE*v}), u**2 + v**2)
same(Matrix([aE*u, bE*v]).jacobian([u, v]).det(), aE*bE)
same(integrate(aE*bE*r, (r, 0, 1), (theta, 0, 2*pi)), pi*aE*bE)
same(integrate(cos(theta)**2, (theta, 0, 2*pi)), pi); same(integrate(r**3, (r, 0, 1)), Rational(1, 4))
steps(aE**3*bE*Integral(r**2*cos(theta)**2*r, (r, 0, 1), (theta, 0, 2*pi)), aE**3*bE*Rational(1, 4)*pi, pi*aE**3*bE/4)
same(integrate(x**2, (y, -bE*sqrt(1 - x**2/aE**2), bE*sqrt(1 - x**2/aE**2)), (x, -aE, aE)), pi*aE**3*bE/4)
same(rE*pi*aE**3*bE/4, Rational(1, 4)*(rE*pi*aE*bE)*aE**2)
```
:::

::: example A parallelogram
Evaluate $\displaystyle\iint_D (2x - y)\,e^{2y - x}\,dA$, where $D$ is the parallelogram with vertices $(0, 0)$, $(2, 1)$, $(3, 3)$ and $(1, 2)$.

The sides of $D$ lie on the lines $2x - y = 0$ (through $(0, 0)$ and $(1, 2)$), $2x - y = 3$ (through $(2, 1)$ and $(3, 3)$), $2y - x = 0$ (through $(0, 0)$ and $(2, 1)$) and $2y - x = 3$ (through $(1, 2)$ and $(3, 3)$). In $x$ and $y$, $D$ would need three iterated integrals in either order. The integrand and the sides suggest the new variables

$$u = 2x - y, \qquad v = 2y - x,$$

in which $D$ becomes the square $S$: $0 \le u \le 3$, $0 \le v \le 3$. To find $x$ and $y$, add twice the first equation to the second, $2u + v = 3x$, and the first to twice the second, $u + 2v = 3y$:

$$x = \frac{2u + v}{3}, \qquad y = \frac{u + 2v}{3}.$$

The Jacobian is

$$\frac{\partial(x, y)}{\partial(u, v)} = \begin{vmatrix} 2/3 & 1/3 \\ 1/3 & 2/3 \end{vmatrix} = \frac49 - \frac19 = \frac13,$$

so, by the product rule of Section 19.2,

$$\begin{aligned} \iint_D (2x - y)\,e^{2y - x}\,dA &= \int_0^3\int_0^3 u\,e^v\,\frac13\,du\,dv \\ &= \frac13\cdot\frac92\cdot\big(e^3 - 1\big) \\ &= \frac32\big(e^3 - 1\big) \approx 28.63. \end{aligned}$$

A check: the area of $D$ is $\iint_S \tfrac13\,du\,dv = \tfrac13 \cdot 9 = 3$, and the parallelogram spanned by $\langle 2, 1\rangle$ and $\langle 1, 2\rangle$ has area $\abs{2 \cdot 2 - 1 \cdot 1} = 3$.

```check
xT, yT = (2*u + v)/3, (u + 2*v)/3
same([(xT.subs({u: p, v: q}), yT.subs({u: p, v: q})) for p, q in ((0, 0), (3, 0), (3, 3), (0, 3))], [(0, 0), (2, 1), (3, 3), (1, 2)])
same((2*x - y).subs({x: xT, y: yT}), u); same((2*y - x).subs({x: xT, y: yT}), v)
same([2*p - q for p, q in ((0, 0), (1, 2))], [0, 0]); same([2*p - q for p, q in ((2, 1), (3, 3))], [3, 3])
same([2*q - p for p, q in ((0, 0), (2, 1))], [0, 0]); same([2*q - p for p, q in ((1, 2), (3, 3))], [3, 3])
JT = Matrix([xT, yT]).jacobian([u, v]).det(); steps(JT, Rational(4, 9) - Rational(1, 9), Rational(1, 3))
steps(Integral(u*exp(v)*Rational(1, 3), (u, 0, 3), (v, 0, 3)), Rational(1, 3)*Rational(9, 2)*(exp(3) - 1), Rational(3, 2)*(exp(3) - 1))
rounds(Rational(3, 2)*(exp(3) - 1), '28.63')
gD = (2*x - y)*exp(2*y - x)
direct = integrate(gD, (y, x/2, 2*x), (x, 0, 1)) + integrate(gD, (y, x/2, (x + 3)/2), (x, 1, 2)) + integrate(gD, (y, 2*x - 3, (x + 3)/2), (x, 2, 3))
same(direct, Rational(3, 2)*(exp(3) - 1))                          # in x and y, with D cut at x = 1 and x = 2
same(integrate(Rational(1, 3), (u, 0, 3), (v, 0, 3)), 3); same(abs(2*2 - 1*1), 3)
```
:::

::: figure id=fig-19-5
The transformation $x = u^2 - v^2$, $y = 2uv$ maps the grid of squares on the left onto the curved grid on the right. The small rectangle with corner $(u, v)$ and sides $\Delta u$ and $\Delta v$ (orange) becomes a small curved quadrilateral, which is nearly the parallelogram (dashed) spanned by the vectors $\Delta u\,\vb{r}_u$ and $\Delta v\,\vb{r}_v$. That parallelogram has area $\abs{\partial(x, y)/\partial(u, v)}\,\Delta u\,\Delta v$.
:::

::: deeper Why the Jacobian measures area
Take a small rectangle in the $uv$-plane with one corner at $(u_0, v_0)$ and sides $\Delta u$ and $\Delta v$. By the linear approximation of Module 17, for small $h$ and $k$,

$$\begin{aligned} x(u_0 + h, v_0 + k) &\approx x(u_0, v_0) + x_u h + x_v k, \\ y(u_0 + h, v_0 + k) &\approx y(u_0, v_0) + y_u h + y_v k, \end{aligned}$$

with the partial derivatives taken at $(u_0, v_0)$. In vector form, $T(u_0 + h, v_0 + k) \approx T(u_0, v_0) + h\,\vb{r}_u + k\,\vb{r}_v$, where $\vb{r}_u = \langle x_u, y_u\rangle$ and $\vb{r}_v = \langle x_v, y_v\rangle$. As $h$ runs from 0 to $\Delta u$ and $k$ from 0 to $\Delta v$, the right side fills the parallelogram with a corner at $T(u_0, v_0)$ spanned by $\Delta u\,\vb{r}_u$ and $\Delta v\,\vb{r}_v$. So the image of the small rectangle is nearly that parallelogram (Figure 19.5), whose area is

$$\big|(x_u\Delta u)(y_v\Delta v) - (x_v\Delta v)(y_u\Delta u)\big| = \Big|\frac{\partial(x, y)}{\partial(u, v)}\Big|\,\Delta u\,\Delta v.$$

Cut $S$ into small rectangles. Their images cut $D$ into small pieces, of areas about $\abs{J}\,\Delta u\,\Delta v$ with $J$ the Jacobian at a corner, so

$$\iint_D f\,dA \approx \sum f\big(T(u_i, v_j)\big)\,\abs{J(u_i, v_j)}\,\Delta u\,\Delta v,$$

and the right side is a Riemann sum for the right side of Theorem 19.9. The approximations improve as the rectangles shrink. Turning this into a proof means showing that the errors of all the linear approximations together tend to 0, which is the work of an advanced calculus course.

For a linear transformation, $x = au + bv$ and $y = cu + dv$, there is nothing to approximate: $T(u_0 + h, v_0 + k) = T(u_0, v_0) + h\langle a, c\rangle + k\langle b, d\rangle$ exactly, so every rectangle is mapped onto a parallelogram with exactly $\abs{ad - bc}$ times its area. That is what happened in Example 19.17.

```check
x0_, y0_, xu_, xv_, yu_, yv_, du_, dv_ = symbols('x0 y0 x_u x_v y_u y_v Delta_u Delta_v')
same((xu_*du_)*(yv_*dv_) - (xv_*dv_)*(yu_*du_), (xu_*yv_ - xv_*yu_)*du_*dv_)
pa, pb, pc, pd = symbols('a b c d')
TL = Matrix([pa*u + pb*v, pc*u + pd*v])
same(TL.subs({u: u + h, v: v + k}) - TL, h*Matrix([pa, pc]) + k*Matrix([pb, pd])); same(TL.jacobian([u, v]).det(), pa*pd - pb*pc)
```
:::

In three dimensions, a transformation $x = x(u, v, w)$, $y = y(u, v, w)$, $z = z(u, v, w)$ has a Jacobian $\dfrac{\partial(x, y, z)}{\partial(u, v, w)}$, the determinant of the 3 × 3 array of its nine first partial derivatives, and $dV = \Big|\dfrac{\partial(x, y, z)}{\partial(u, v, w)}\Big|\,du\,dv\,dw$, under conditions like those of Theorem 19.9. For cylindrical coordinates the Jacobian is $r$ and for spherical coordinates $\rho^2\sin\varphi$, as the compute box of Section 19.7 shows: the factors found there from pictures.

::: pitfall
Two slips with the Jacobian. First, use its absolute value. The transformation $x = v$, $y = u$, which swaps the axes, has Jacobian $-1$, yet it does not make areas negative. Second, use the Jacobian of $x$ and $y$ with respect to $u$ and $v$: it converts $du\,dv$ into $dA$. In Example 19.17 the formulas for $u$ and $v$ give $\dfrac{\partial(u, v)}{\partial(x, y)} = \begin{vmatrix} 2 & -1 \\ -1 & 2 \end{vmatrix} = 3$ at once; that is the reciprocal of the factor needed, $\tfrac13$. (At matching points the two are always reciprocals, a consequence of the chain rule.) Using 3 by mistake gives an answer 9 times too large.

```check
same(Matrix([v, u]).jacobian([u, v]).det(), -1)
same(Matrix([2*x - y, 2*y - x]).jacobian([x, y]).det(), 3); same(3*JT, 1)
```
:::

## What you learned {#summary}

- A **double integral** $\iint_R f\,dA$ is the limit of double Riemann sums $\sum_i\sum_j f(x_{ij}^*, y_{ij}^*)\,\Delta A$: boxes on small rectangles. For $f \ge 0$ it is the volume under the graph; in general a signed volume. Continuous functions, and bounded functions that jump only along finitely many curves, are integrable.
- **Fubini's theorem**: for $f$ continuous on a rectangle, $\iint_R f\,dA = \int_a^b\int_c^d f\,dy\,dx = \int_c^d\int_a^b f\,dx\,dy$, computed from the inside out by partial integration. Without the hypothesis, the two orders can disagree. On a rectangle, $\iint g(x)h(y)\,dA = \int g\,dx\int h\,dy$. The average value of $f$ is $\tfrac{1}{\text{area}}\iint f\,dA$.
- Over a **type I** region $a \le x \le b$, $g_1(x) \le y \le g_2(x)$, the integral is $\int_a^b\int_{g_1(x)}^{g_2(x)} f\,dy\,dx$; over a **type II** region, $\int_c^d\int_{h_1(y)}^{h_2(y)} f\,dx\,dy$. Read the inner limits from a slice of a sketch; outer limits are constants. **Reversing the order** can turn an impossible integral, such as $\int_0^1\int_x^1 e^{y^2}\,dy\,dx = \tfrac{e - 1}{2}$, into an easy one.
- In **polar coordinates** $dA = r\,dr\,d\theta$. Squaring the Gaussian integral, squeezing the integral over a square between two discs and letting the size grow proves $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$, and so $\int_{-\infty}^{\infty} e^{-ct^2}\,dt = \sqrt{\pi/c}$.
- A plate with density $\rho$ has mass $\iint_D \rho\,dA$, centre of mass $\big(\tfrac{M_y}{m}, \tfrac{M_x}{m}\big)$ with $M_y = \iint x\rho\,dA$ and $M_x = \iint y\rho\,dA$, and moments of inertia $I_x = \iint y^2\rho\,dA$, $I_y = \iint x^2\rho\,dA$, $I_0 = I_x + I_y$; a uniform disc has $I_0 = \tfrac12 Ma^2$. A **joint density** gives $P\big((X, Y) \in D\big) = \iint_D f\,dA$; independent random variables have the joint density $f_1(x)f_2(y)$.
- **Triple integrals** $\iiint_E f\,dV$ are computed as iterated integrals in any of six orders; for a solid between two surfaces over $D$, integrate in $z$ first. In **cylindrical coordinates** $dV = r\,dz\,dr\,d\theta$; in **spherical coordinates**, with $\varphi$ measured from the positive $z$-axis and $0 \le \varphi \le \pi$, $dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$. A ball of radius $a$ has volume $\tfrac43\pi a^3$.
- **Change of variables**: $dA = \Big|\dfrac{\partial(x, y)}{\partial(u, v)}\Big|\,du\,dv$, with the Jacobian $x_uy_v - x_vy_u$, the factor by which the transformation multiplies small areas (linear approximation turns small rectangles into near-parallelograms). Polar coordinates have Jacobian $r$; $x = au$, $y = bv$ turns a disc into an ellipse of area $\pi ab$; linear substitutions turn parallelograms into rectangles.

## Exercises {#exercises}

:::: exercise A double integral on a square {#ex-19-1} ★
Let $f(x, y) = xy^2 + 1$ and $R = [0, 2] \times [0, 2]$.

- (a) Estimate $\iint_R f\,dA$ with the midpoint sum on the four squares of side 1.
- (b) Find the exact value as an iterated integral, in both orders.
- (c) Is the midpoint sum too large or too small? Explain why from the shape of $f$.

::: solution
**(a)** The centres are $\big(\tfrac12, \tfrac12\big)$, $\big(\tfrac32, \tfrac12\big)$, $\big(\tfrac12, \tfrac32\big)$ and $\big(\tfrac32, \tfrac32\big)$, where $f$ takes the values $\tfrac98$, $\tfrac{11}{8}$, $\tfrac{17}{8}$ and $\tfrac{35}{8}$. Each square has area $\Delta A = 1$, so the midpoint sum is

$$\frac{9 + 11 + 17 + 35}{8} = \frac{72}{8} = 9.$$

**(b)** In the order $dy\,dx$, the inner integral holds $x$ constant:

$$\begin{aligned} \int_0^2 \big(xy^2 + 1\big)\,dy &= \Big[\frac{xy^3}{3} + y\Big]_{y=0}^{y=2} = \frac{8x}{3} + 2, \\ \int_0^2\Big(\frac{8x}{3} + 2\Big)\,dx &= \frac{16}{3} + 4 = \frac{28}{3} \approx 9.333. \end{aligned}$$

In the order $dx\,dy$:

$$\begin{aligned} \int_0^2 \big(xy^2 + 1\big)\,dx &= \Big[\frac{x^2y^2}{2} + x\Big]_{x=0}^{x=2} = 2y^2 + 2, \\ \int_0^2 \big(2y^2 + 2\big)\,dy &= \frac{16}{3} + 4 = \frac{28}{3}. \end{aligned}$$

The two orders agree, as Fubini's theorem says.

**(c)** The midpoint sum, 9, is too small, by $\tfrac13$. In $x$ the function is linear, and a linear function's average over an interval is its value at the midpoint, so the $x$-direction causes no error. In $y$, $f$ grows like $y^2$, which curves upwards: on $[0, 1]$, for instance, $y^2$ averages $\tfrac13$ but equals only $\tfrac14$ at the midpoint. So the value at each centre is below the average over its square.

```check
fE1 = x*y**2 + 1
cE1 = [fE1.subs({x: p, y: q}) for p, q in ((half, half), (3*half, half), (half, 3*half), (3*half, 3*half))]
same(cE1, [Rational(9, 8), Rational(11, 8), Rational(17, 8), Rational(35, 8)]); same(sum(cE1), 9); same(Rational(72, 8), 9)
same(integrate(fE1, (y, 0, 2)), 8*x/3 + 2); same(integrate(8*x/3 + 2, (x, 0, 2)), Rational(28, 3)); rounds(Rational(28, 3), '9.333')
same(integrate(fE1, (x, 0, 2)), 2*y**2 + 2); same(integrate(2*y**2 + 2, (y, 0, 2)), Rational(28, 3))
same(Rational(28, 3) - 9, Rational(1, 3)); same(integrate(y**2, (y, 0, 1)), Rational(1, 3)); same(half**2, Rational(1, 4))
```
:::
::::

:::: exercise Limits from a sketch {#ex-19-2} ★
Let $D$ be the region between the curves $y = \sqrt x$ and $y = x/2$.

- (a) Sketch $D$ and find where the curves meet.
- (b) Write $\iint_D f\,dA$ as an iterated integral in both orders.
- (c) Find the area of $D$ both ways.
- (d) Find $\iint_D y\,dA$, and the height $\bar y$ of the centroid of $D$.

Check (b) and (c) with the widget of Section 19.3.

::: solution
**(a)** The curves meet where $\sqrt x = x/2$. Squaring, $x = x^2/4$, so $x(x - 4) = 0$: at $x = 0$ and $x = 4$, the points $(0, 0)$ and $(4, 2)$. Both are true meeting points, since $\sqrt4 = 2 = 4/2$. At $x = 1$ the curves are at heights 1 and $\tfrac12$, so $y = \sqrt x$ is the upper curve.

**(b)** Vertical slices: for $0 \le x \le 4$, $y$ runs from $x/2$ to $\sqrt x$, so $\iint_D f\,dA = \int_0^4\int_{x/2}^{\sqrt x} f\,dy\,dx$. Horizontal slices: written as functions of $y$, the curves are $x = y^2$ (from $y = \sqrt x$, with $y \ge 0$) and $x = 2y$. At $y = 1$ they are at $x = 1$ and $x = 2$, so $x = y^2$ is the left curve, and $y$ runs from 0 to 2:

$$\iint_D f\,dA = \int_0^2\int_{y^2}^{2y} f\,dx\,dy.$$

**(c)** With $f = 1$:

$$\begin{aligned} \int_0^4\Big(\sqrt x - \frac x2\Big)\,dx &= \Big[\frac23x^{3/2} - \frac{x^2}{4}\Big]_0^4 = \frac{16}{3} - 4 = \frac43, \\ \int_0^2 \big(2y - y^2\big)\,dy &= \Big[y^2 - \frac{y^3}{3}\Big]_0^2 = 4 - \frac83 = \frac43. \end{aligned}$$

**(d)** Horizontal slices are easier here:

$$\begin{aligned} \iint_D y\,dA &= \int_0^2 y\big(2y - y^2\big)\,dy \\ &= \Big[\frac{2y^3}{3} - \frac{y^4}{4}\Big]_0^2 = \frac{16}{3} - 4 = \frac43. \end{aligned}$$

So $\bar y = \dfrac{4/3}{4/3} = 1$. (With vertical slices, $\int_0^4\big[\tfrac{y^2}{2}\big]_{x/2}^{\sqrt x}\,dx = \int_0^4\big(\tfrac x2 - \tfrac{x^2}{8}\big)\,dx = 4 - \tfrac83 = \tfrac43$, the same.)

```check
same_set(solve(Eq(x, x**2/4), x), [0, 4]); same(sqrt(4), Rational(4, 2)); holds(sqrt(1) > Rational(1, 2))
xn = symbols('x', nonnegative=True); same(sqrt(xn)**2, xn); holds(1**2 < 2*1)
antideriv(Rational(2, 3)*xn**Rational(3, 2) - xn**2/4, sqrt(xn) - xn/2, xn)
same(integrate(sqrt(x) - x/2, (x, 0, 4)), Rational(4, 3)); same(integrate(2*y - y**2, (y, 0, 2)), Rational(4, 3))
same(integrate(1, (y, x/2, sqrt(x)), (x, 0, 4)), Rational(4, 3)); same(integrate(1, (x, y**2, 2*y), (y, 0, 2)), Rational(4, 3))
same(integrate(y*(2*y - y**2), (y, 0, 2)), Rational(4, 3)); same(integrate(y, (y, x/2, sqrt(x)), (x, 0, 4)), Rational(4, 3))
same(integrate(x/2 - x**2/8, (x, 0, 4)), Rational(4, 3))
```
:::
::::

:::: exercise One order or two? {#ex-19-3} ★
Let $D$ be the triangle with vertices $(0, 0)$, $(2, 0)$ and $(1, 1)$.

- (a) Explain why the order $dy\,dx$ needs two iterated integrals and the order $dx\,dy$ needs only one.
- (b) Evaluate $\iint_D y\,dA$ in both orders, and find the height $\bar y$ of the centroid of $D$.

::: solution
**(a)** The sides of $D$ lie on the lines $y = 0$, $y = x$ (from $(0, 0)$ to $(1, 1)$) and $y = 2 - x$ (from $(1, 1)$ to $(2, 0)$). A vertical line at $x$ enters $D$ on $y = 0$, but it leaves on $y = x$ when $0 \le x \le 1$ and on $y = 2 - x$ when $1 \le x \le 2$: the upper curve changes at $x = 1$, so $[0, 2]$ must be split there. A horizontal line at $y$, $0 \le y \le 1$, always enters on the line $x = y$ and leaves on the line $x = 2 - y$: one formula each.

**(b)** In the order $dy\,dx$, split at $x = 1$:

$$\begin{aligned} &\int_0^1\int_0^x y\,dy\,dx + \int_1^2\int_0^{2-x} y\,dy\,dx \\ &\quad= \int_0^1\frac{x^2}{2}\,dx + \int_1^2\frac{(2 - x)^2}{2}\,dx = \frac16 + \frac16 = \frac13. \end{aligned}$$

In the order $dx\,dy$, the slice at height $y$ has length $(2 - y) - y = 2 - 2y$:

$$\int_0^1\int_y^{2-y} y\,dx\,dy = \int_0^1 \big(2y - 2y^2\big)\,dy = 1 - \frac23 = \frac13.$$

The triangle has base 2 and height 1, so its area is 1 and $\bar y = \tfrac13$: the centroid of a triangle lies a third of the way up from its base.

```check
same(integrate(y, (y, 0, x)), x**2/2); same(integrate(x**2/2, (x, 0, 1)), Rational(1, 6)); same(integrate((2 - x)**2/2, (x, 1, 2)), Rational(1, 6))
same(integrate(y, (y, 0, x), (x, 0, 1)) + integrate(y, (y, 0, 2 - x), (x, 1, 2)), Rational(1, 3))
same(integrate(y, (x, y, 2 - y)), 2*y - 2*y**2); same(integrate(2*y - 2*y**2, (y, 0, 1)), Rational(1, 3))
same(integrate(1, (x, y, 2 - y), (y, 0, 1)), 1); same(Rational(1, 2)*2*1, 1)
```
:::
::::

:::: exercise Polar or Cartesian {#ex-19-4} ★
Let $D$ be the quarter disc $x^2 + y^2 \le 1$, $x \ge 0$, $y \ge 0$. Evaluate $\iint_D xy\,dA$ (a) in polar coordinates and (b) as an iterated integral in $x$ and $y$.

::: solution
**(a)** In polar coordinates $xy = r^2\cos\theta\sin\theta$ and $dA = r\,dr\,d\theta$, and $D$ is $0 \le r \le 1$, $0 \le \theta \le \pi/2$. The integrand is a product, so the integral splits:

$$\begin{aligned} \iint_D xy\,dA &= \int_0^{\pi/2}\int_0^1 r^2\cos\theta\sin\theta\,r\,dr\,d\theta \\ &= \int_0^1 r^3\,dr\int_0^{\pi/2}\sin\theta\cos\theta\,d\theta = \frac14\cdot\frac12 = \frac18, \end{aligned}$$

since $\int_0^{\pi/2}\sin\theta\cos\theta\,d\theta = \big[\tfrac12\sin^2\theta\big]_0^{\pi/2} = \tfrac12$ (substitute $u = \sin\theta$).

**(b)** A vertical slice at $x$ runs from $y = 0$ up to the circle, $y = \sqrt{1 - x^2}$:

$$\begin{aligned} \int_0^1\int_0^{\sqrt{1 - x^2}} xy\,dy\,dx &= \int_0^1 \frac{x\big(1 - x^2\big)}{2}\,dx \\ &= \frac12\Big(\frac12 - \frac14\Big) = \frac18. \end{aligned}$$

The common slip in (a) is to forget the factor $r$ of $dA$, which gives $\int_0^1 r^2\,dr \cdot \tfrac12 = \tfrac16$.

```check
same(expand((r*cos(theta))*(r*sin(theta))), r**2*cos(theta)*sin(theta))
same(integrate(r**3, (r, 0, 1)), Rational(1, 4)); same(integrate(sin(theta)*cos(theta), (theta, 0, pi/2)), Rational(1, 2))
antideriv(sin(theta)**2/2, sin(theta)*cos(theta), theta)
same(integrate(r**2*cos(theta)*sin(theta)*r, (r, 0, 1), (theta, 0, pi/2)), Rational(1, 8))
same(integrate(x*y, (y, 0, sqrt(1 - x**2))), x*(1 - x**2)/2); same(integrate(x*(1 - x**2)/2, (x, 0, 1)), Rational(1, 8))
same(integrate(r**2, (r, 0, 1))*Rational(1, 2), Rational(1, 6))
```
:::
::::

:::: exercise Reverse the order {#ex-19-5} ★★
Evaluate $\displaystyle\int_0^1\int_{\sqrt x}^{1} \sqrt{1 + y^3}\,dy\,dx$.

::: solution
The inner integral needs an antiderivative of $\sqrt{1 + y^3}$, and there is no elementary one, so reverse the order. The limits say $0 \le x \le 1$ and $\sqrt x \le y \le 1$. For $x \ge 0$ and $y \ge 0$, $y \ge \sqrt x$ is the same as $x \le y^2$, so the region is bounded by the $y$-axis, the parabola $x = y^2$ and the line $y = 1$: a horizontal line at height $y$, $0 \le y \le 1$, enters it on the $y$-axis and leaves it on the parabola $x = y^2$. So

$$\begin{aligned} \int_0^1\int_{\sqrt x}^{1} \sqrt{1 + y^3}\,dy\,dx &= \int_0^1\int_0^{y^2}\sqrt{1 + y^3}\,dx\,dy \\ &= \int_0^1 y^2\sqrt{1 + y^3}\,dy. \end{aligned}$$

Substitute $u = 1 + y^3$, $du = 3y^2\,dy$; the limits become $u = 1$ and $u = 2$:

$$\begin{aligned} \frac13\int_1^2 u^{1/2}\,du &= \frac13\cdot\frac23\Big[u^{3/2}\Big]_1^2 \\ &= \frac29\big(2\sqrt2 - 1\big) \approx 0.4063. \end{aligned}$$

```check
xn2, yn2 = symbols('x y', nonnegative=True)
holds(all((sqrt(Rational(p_, 10)) <= Rational(q_, 10)) == (Rational(p_, 10) <= Rational(q_, 10)**2) for p_ in range(11) for q_ in range(11)))   # y >= sqrt(x) exactly when x <= y^2
same(integrate(sqrt(1 + y**3), (x, 0, y**2)), y**2*sqrt(1 + y**3))
same(diff(1 + y**3, y), 3*y**2); same((1 + y**3).subs(y, 0), 1); same((1 + y**3).subs(y, 1), 2)
steps(Integral(y**2*sqrt(1 + y**3), (y, 0, 1)), Rational(1, 3)*Integral(sqrt(u), (u, 1, 2)), Rational(2, 9)*(2*sqrt(2) - 1))
rounds(Rational(2, 9)*(2*sqrt(2) - 1), '0.4063')
import mpmath
mpmath.mp.dps = 30
near(mpmath.quad(lambda X: mpmath.quad(lambda Y: mpmath.sqrt(1 + Y**3), [mpmath.sqrt(X), 1]), [0, 1]), Rational(2, 9)*(2*sqrt(2) - 1), 1e-20)   # the original order, numerically
```
:::
::::

:::: exercise Two random numbers {#ex-19-6} ★★
Let $X$ and $Y$ be independent random numbers, each uniform on $[0, 1]$: their joint density is 1 on the square $[0, 1] \times [0, 1]$ and 0 elsewhere. Find

- (a) $P(X + Y \le 1)$,
- (b) $P\big(Y \le X^2\big)$,
- (c) $P\big(XY \le \tfrac12\big)$.

::: solution
Each probability is the integral of 1 over the part of the square where the event happens, that is, the area of that part.

**(a)** $x + y \le 1$ is the triangle $0 \le x \le 1$, $0 \le y \le 1 - x$, of area $\int_0^1 (1 - x)\,dx = \tfrac12$.

**(b)** $y \le x^2$ is the region under the parabola: $P = \int_0^1\int_0^{x^2} dy\,dx = \int_0^1 x^2\,dx = \tfrac13$.

**(c)** Work with the complement, $xy > \tfrac12$, which is one region: $y > \dfrac{1}{2x}$, and since $y \le 1$ this needs $\dfrac{1}{2x} < 1$, that is, $x > \tfrac12$. So

$$\begin{aligned} P\Big(XY > \frac12\Big) &= \int_{1/2}^{1}\Big(1 - \frac{1}{2x}\Big)\,dx \\ &= \frac12 - \frac12\Big(\ln 1 - \ln\frac12\Big) = \frac12 - \frac{\ln 2}{2}, \end{aligned}$$

and

$$P\Big(XY \le \frac12\Big) = 1 - \Big(\frac12 - \frac{\ln 2}{2}\Big) = \frac{1 + \ln 2}{2} \approx 0.847.$$

(Directly, the event $xy \le \tfrac12$ needs two pieces: the whole strip $0 \le x \le \tfrac12$, and $0 \le y \le \tfrac{1}{2x}$ for $\tfrac12 \le x \le 1$.)

```check
same(integrate(1 - x, (x, 0, 1)), Rational(1, 2)); same(integrate(1, (y, 0, x**2), (x, 0, 1)), Rational(1, 3))
same(solve(Eq(1/(2*x), 1), x), [Rational(1, 2)])
steps(Integral(1 - 1/(2*x), (x, Rational(1, 2), 1)), Rational(1, 2) - Rational(1, 2)*(log(1) - log(Rational(1, 2))), Rational(1, 2) - log(2)/2)
same(1 - (Rational(1, 2) - log(2)/2), (1 + log(2))/2); rounds((1 + log(2))/2, '0.847')
same(Rational(1, 2) + integrate(1/(2*x), (x, Rational(1, 2), 1)), (1 + log(2))/2)
```
:::
::::

:::: exercise A plate denser at the top {#ex-19-7} ★★
A thin plate occupies the half disc $x^2 + y^2 \le a^2$, $y \ge 0$, and its density is proportional to the distance from the $x$-axis: $\rho = ky$, with a constant $k > 0$. Find its mass and its centre of mass, and compare with the centroid $\big(0, \tfrac{4a}{3\pi}\big)$ of a uniform half disc ([Example 12.15](module_12_EN.html#centre-of-mass)).

::: solution
In polar coordinates the half disc is $0 \le r \le a$, $0 \le \theta \le \pi$, and $\rho = kr\sin\theta$. The mass is

$$\begin{aligned} m &= \int_0^\pi\int_0^a kr\sin\theta\cdot r\,dr\,d\theta \\ &= k\int_0^\pi\sin\theta\,d\theta\int_0^a r^2\,dr = k\cdot 2\cdot\frac{a^3}{3} = \frac{2ka^3}{3}. \end{aligned}$$

The plate and its density do not change when $x$ is replaced by $-x$, so the moments of mirror-image pieces about the $y$-axis cancel: $M_y = 0$ and $\bar x = 0$. (In the integral, $\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$.) For $\bar y$, with $\int_0^\pi \sin^2\theta\,d\theta = \tfrac{\pi}{2}$ (write $\sin^2\theta = \tfrac12(1 - \cos 2\theta)$),

$$\begin{aligned} M_x &= \iint_D y\cdot ky\,dA = k\int_0^\pi\int_0^a r^2\sin^2\theta\cdot r\,dr\,d\theta \\ &= k\cdot\frac{\pi}{2}\cdot\frac{a^4}{4} = \frac{k\pi a^4}{8}, \end{aligned}$$

so

$$\bar y = \frac{k\pi a^4/8}{2ka^3/3} = \frac{3\pi a}{16} \approx 0.589a.$$

The centre of mass is $\big(0, \tfrac{3\pi a}{16}\big)$, higher than the centroid $\tfrac{4a}{3\pi} \approx 0.424a$ of a uniform half disc, because the density grows towards the top of the plate.

```check
aP = symbols('a', positive=True)
mP = integrate(kp*r*sin(theta)*r, (r, 0, aP), (theta, 0, pi)); same(mP, 2*kp*aP**3/3)
same(integrate(sin(theta), (theta, 0, pi)), 2); same(integrate(cos(theta)*sin(theta), (theta, 0, pi)), 0)
same(integrate(sin(theta)**2, (theta, 0, pi)), pi/2); same(sin(theta)**2, (1 - cos(2*theta))/2)
MxP = integrate(kp*(r*sin(theta))**2*r, (r, 0, aP), (theta, 0, pi)); same(MxP, kp*pi*aP**4/8)
same(MxP/mP, 3*pi*aP/16); rounds(3*pi/16, '0.589'); rounds(4/(3*pi), '0.424'); holds(3*pi/16 > 4/(3*pi))
same(integrate(r*cos(theta)*kp*r*sin(theta)*r, (r, 0, aP), (theta, 0, pi)), 0)
```
:::
::::

:::: exercise One sixth of a cube {#ex-19-8} ★★
- (a) Evaluate $V = \displaystyle\int_0^1\int_0^x\int_0^y dz\,dy\,dx$.
- (b) Describe the solid $E$ over which it integrates, and write $V$ as an iterated integral in the order $dx\,dy\,dz$.
- (c) Explain why $V = \tfrac16$ without integrating.
- (d) Find the coordinate $\bar x$ of the centroid of $E$.

::: solution
**(a)** From the inside out: $\int_0^y dz = y$, then $\int_0^x y\,dy = \tfrac{x^2}{2}$, then $\int_0^1 \tfrac{x^2}{2}\,dx = \tfrac16$.

**(b)** The limits say $0 \le x \le 1$, $0 \le y \le x$ and $0 \le z \le y$: $E$ is the set of points of the unit cube with $0 \le z \le y \le x \le 1$. For the order $dx\,dy\,dz$, the outermost variable $z$ runs over all its values in $E$, from 0 to 1. For a fixed $z$, $y$ runs from $z$ to 1, and for fixed $y$ and $z$, $x$ runs from $y$ to 1:

$$V = \int_0^1\int_z^1\int_y^1 dx\,dy\,dz.$$

**(c)** Every point of the cube $[0, 1]^3$ has its three coordinates in some order: $x \ge y \ge z$, as in $E$, or $x \ge z \ge y$, or one of the four other orders. So the six solids defined by the six orders fill the cube, and they overlap only on planes such as $x = y$, which have no volume. Swapping two coordinates, a reflection in a plane such as $x = y$, turns one of these solids into another without changing volumes, so all six have the same volume, $\tfrac16$ of the cube.

**(d)** $\iiint_E x\,dV = \int_0^1 x\cdot\frac{x^2}{2}\,dx = \frac18$ (the inner two integrals are as in (a), with the factor $x$ outside), so $\bar x = \dfrac{1/8}{1/6} = \dfrac34$.

```check
same(integrate(1, (z, 0, y)), y); same(integrate(y, (y, 0, x)), x**2/2); same(integrate(x**2/2, (x, 0, 1)), Rational(1, 6))
same(integrate(1, (x, y, 1), (y, z, 1), (z, 0, 1)), Rational(1, 6))
same(integrate(x, (z, 0, y), (y, 0, x), (x, 0, 1)), Rational(1, 8)); same(Rational(1, 8)/Rational(1, 6), Rational(3, 4))
same(6*integrate(1, (z, 0, y), (y, 0, x), (x, 0, 1)), 1)
```
:::
::::

:::: exercise Inside a ball {#ex-19-9} ★★
Take a ball of radius $a$ centred at the origin, with constant density $k$, so that its mass is $M = \tfrac43\pi a^3k$.

- (a) Find the average distance of the points of the ball from its centre.
- (b) Find its moment of inertia about the $z$-axis, $I_z = \iiint \big(x^2 + y^2\big)k\,dV$, in terms of $M$ and $a$, and compare with the uniform disc of Example 19.10.

::: solution
**(a)** The average of the distance $\rho$ over the ball is its integral divided by the volume $\tfrac43\pi a^3$. The integral splits into three single integrals:

$$\begin{aligned} \iiint \rho\,dV &= \int_0^\pi\int_0^{2\pi}\int_0^a \rho\cdot\rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi \\ &= \frac{a^4}{4}\cdot 2\pi\cdot 2 = \pi a^4, \end{aligned}$$

so the average distance is $\dfrac{\pi a^4}{\tfrac43\pi a^3} = \dfrac{3a}{4}$. Most of a ball's volume lies near its surface.

**(b)** In spherical coordinates $x^2 + y^2 = r^2 = \rho^2\sin^2\varphi$, so

$$\begin{aligned} I_z &= k\int_0^\pi\int_0^{2\pi}\int_0^a \rho^2\sin^2\varphi\cdot\rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi \\ &= k\cdot\frac{a^5}{5}\cdot 2\pi\int_0^\pi\sin^3\varphi\,d\varphi. \end{aligned}$$

For the last integral write $\sin^3\varphi = \big(1 - \cos^2\varphi\big)\sin\varphi$ and substitute $u = \cos\varphi$: $\int_0^\pi \sin^3\varphi\,d\varphi = \int_{-1}^{1}\big(1 - u^2\big)\,du = \tfrac43$. So

$$I_z = \frac{8\pi ka^5}{15} = \frac25\cdot\frac43\pi a^3k\cdot a^2 = \frac25 Ma^2.$$

A uniform disc of the same mass and radius has $I_0 = \tfrac12 Ma^2$, more than $\tfrac25 Ma^2$: in the ball, much of the mass lies near the axis, above and below the centre.

```check
aK = symbols('a', positive=True)
Ir = integrate(rh*rh**2*sin(ph), (rh, 0, aK), (theta, 0, 2*pi), (ph, 0, pi)); same(Ir, pi*aK**4)
same(Ir/(Rational(4, 3)*pi*aK**3), 3*aK/4)
same((rh*sin(ph)*cos(theta))**2 + (rh*sin(ph)*sin(theta))**2, rh**2*sin(ph)**2)
same(integrate(sin(ph)**3, (ph, 0, pi)), Rational(4, 3)); same(integrate(1 - u**2, (u, -1, 1)), Rational(4, 3)); same((1 - cos(ph)**2)*sin(ph), sin(ph)**3)
Iz = integrate(kp*rh**2*sin(ph)**2*rh**2*sin(ph), (rh, 0, aK), (theta, 0, 2*pi), (ph, 0, pi)); same(Iz, 8*pi*kp*aK**5/15)
same(Iz, Rational(2, 5)*(Rational(4, 3)*pi*aK**3*kp)*aK**2); holds(Rational(1, 2) > Rational(2, 5))
```
:::
::::

:::: exercise Between two hyperbolas {#ex-19-10} ★★★
Let $D$ be the region of the first quadrant bounded by the hyperbolas $xy = 1$ and $xy = 4$ and the lines $y = x$ and $y = 4x$.

- (a) Show that the new variables $u = xy$ and $v = y/x$ describe $D$ as the square $1 \le u \le 4$, $1 \le v \le 4$, and that $x = \sqrt{u/v}$ and $y = \sqrt{uv}$.
- (b) Find the Jacobian $\dfrac{\partial(x, y)}{\partial(u, v)}$, and check it with $\dfrac{\partial(u, v)}{\partial(x, y)}$.
- (c) Find the area of $D$.

::: solution
**(a)** In the first quadrant $x > 0$ and $y > 0$, so $u = xy > 0$ and $v = y/x > 0$. The hyperbolas are $u = 1$ and $u = 4$, and the lines are $v = 1$ and $v = 4$; $D$ lies between both pairs, so it is described by $1 \le u \le 4$, $1 \le v \le 4$. Conversely $uv = y^2$ and $u/v = x^2$, and taking the positive roots, $y = \sqrt{uv}$ and $x = \sqrt{u/v}$. So each point of the square comes from exactly one point of $D$.

**(b)** With $x = u^{1/2}v^{-1/2}$ and $y = u^{1/2}v^{1/2}$,

$$\begin{aligned} x_u &= \frac{1}{2\sqrt{uv}}, & x_v &= -\frac{\sqrt u}{2v^{3/2}}, \\ y_u &= \frac{\sqrt v}{2\sqrt u}, & y_v &= \frac{\sqrt u}{2\sqrt v}, \end{aligned}$$

so

$$\begin{aligned} \frac{\partial(x, y)}{\partial(u, v)} &= x_uy_v - x_vy_u \\ &= \frac{1}{4v} + \frac{1}{4v} = \frac{1}{2v}. \end{aligned}$$

The check: from $u = xy$ and $v = y/x$,

$$\frac{\partial(u, v)}{\partial(x, y)} = \begin{vmatrix} y & x \\ -y/x^2 & 1/x \end{vmatrix} = \frac yx + \frac yx = \frac{2y}{x} = 2v,$$

the reciprocal of $\tfrac{1}{2v}$, as the pitfall of Section 19.8 says it must be.

**(c)** The Jacobian is positive, so

$$\begin{aligned} A(D) &= \int_1^4\int_1^4\frac{1}{2v}\,du\,dv \\ &= 3\cdot\frac12\ln 4 = 3\ln 2 \approx 2.079. \end{aligned}$$

In $x$ and $y$ the area takes two integrals, split at the corner $x = 1$: $\int_{1/2}^{1}\big(4x - \tfrac1x\big)\,dx + \int_1^2\big(\tfrac4x - x\big)\,dx$, which also gives $3\ln 2$.

```check
up, vp = symbols('u v', positive=True)
xH, yH = sqrt(up/vp), sqrt(up*vp)
same(xH*yH, up); same(yH/xH, vp)
same(diff(xH, up), 1/(2*sqrt(up*vp))); same(diff(xH, vp), -sqrt(up)/(2*vp**Rational(3, 2))); same(diff(yH, up), sqrt(vp)/(2*sqrt(up))); same(diff(yH, vp), sqrt(up)/(2*sqrt(vp)))
JH = Matrix([xH, yH]).jacobian([up, vp]).det(); steps(JH, 1/(4*vp) + 1/(4*vp), 1/(2*vp))
xp_, yp_ = symbols('x y', positive=True)
JI = Matrix([xp_*yp_, yp_/xp_]).jacobian([xp_, yp_]).det(); same(JI, 2*yp_/xp_); same(JI.subs({xp_: xH, yp_: yH})*JH, 1)
steps(Integral(1/(2*vp), (up, 1, 4), (vp, 1, 4)), 3*Rational(1, 2)*log(4), 3*log(2)); rounds(3*log(2), '2.079')
same(integrate(4*x - 1/x, (x, Rational(1, 2), 1)) + integrate(4/x - x, (x, 1, 2)), 3*log(2))
```
:::
::::

:::: exercise A napkin ring {#ex-19-11} ★★★
A cylindrical hole of radius $b$ is drilled through the centre of a ball of radius $a > b$, along a diameter, leaving a ring.

- (a) Use cylindrical coordinates to find the volume of the ring.
- (b) Show that it equals $\dfrac{\pi h^3}{6}$, where $h = 2\sqrt{a^2 - b^2}$ is the height of the ring. So the volume depends only on the height.
- (c) Check with $a = 2$ and $b = 1$.

::: solution
**(a)** Put the hole along the $z$-axis. The ball is $r^2 + z^2 \le a^2$, so at the distance $r$ from the axis it runs from $z = -\sqrt{a^2 - r^2}$ to $z = \sqrt{a^2 - r^2}$. The ring is the part with $b \le r \le a$:

$$\begin{aligned} V &= \int_0^{2\pi}\int_b^a\int_{-\sqrt{a^2 - r^2}}^{\sqrt{a^2 - r^2}} r\,dz\,dr\,d\theta \\ &= 2\pi\int_b^a 2r\sqrt{a^2 - r^2}\,dr. \end{aligned}$$

With $w = a^2 - r^2$, $dw = -2r\,dr$, an antiderivative of $2r\sqrt{a^2 - r^2}$ is $-\tfrac23\big(a^2 - r^2\big)^{3/2}$, so

$$V = 2\pi\cdot\frac23\big(a^2 - b^2\big)^{3/2} = \frac{4\pi}{3}\big(a^2 - b^2\big)^{3/2}.$$

**(b)** The wall of the hole meets the sphere where $r = b$, at heights $z = \pm\sqrt{a^2 - b^2}$, so the ring has the height $h = 2\sqrt{a^2 - b^2}$. Then $\big(a^2 - b^2\big)^{3/2} = \big(\tfrac h2\big)^3 = \tfrac{h^3}{8}$, and

$$V = \frac{4\pi}{3}\cdot\frac{h^3}{8} = \frac{\pi h^3}{6}.$$

A ring 6 cm tall cut from an orange and one 6 cm tall cut from a ball the size of the Earth have the same volume, $36\pi \approx 113$ cm³: the larger ball has a much wider hole, and its ring is wider but thinner.

**(c)** With $a = 2$ and $b = 1$: $\tfrac{4\pi}{3}\cdot 3^{3/2} = 4\sqrt3\,\pi$, and $h = 2\sqrt3$ gives $\tfrac{\pi(2\sqrt3)^3}{6} = \tfrac{24\sqrt3\,\pi}{6} = 4\sqrt3\,\pi \approx 21.77$.

```check
aR, bR = symbols('a b', positive=True)
same(integrate(r, (z, -sqrt(aR**2 - r**2), sqrt(aR**2 - r**2))), 2*r*sqrt(aR**2 - r**2))
antideriv(-Rational(2, 3)*(aR**2 - r**2)**Rational(3, 2), 2*r*sqrt(aR**2 - r**2), r)
Fr = -Rational(2, 3)*(aR**2 - r**2)**Rational(3, 2); same(Fr.subs(r, aR) - Fr.subs(r, bR), Rational(2, 3)*(aR**2 - bR**2)**Rational(3, 2))
Vring = 2*pi*Rational(2, 3)*(aR**2 - bR**2)**Rational(3, 2); same(Vring, 4*pi/3*(aR**2 - bR**2)**Rational(3, 2))
same(Vring.subs({aR: 2, bR: 1}), 4*sqrt(3)*pi)
same(2*pi*integrate(2*r*sqrt(4 - r**2), (r, 1, 2)), 4*sqrt(3)*pi)
hR = 2*sqrt(aR**2 - bR**2); same((hR/2)**3, (aR**2 - bR**2)**Rational(3, 2)); same(pi*hR**3/6, Vring)
same(pi*(2*sqrt(3))**3/6, 4*sqrt(3)*pi); rounds(4*sqrt(3)*pi, '21.77'); same(pi*6**3/6, 36*pi); rounds(36*pi, '113')
```
:::
::::

:::: exercise Darts and the normal distribution {#ex-19-12} ★★★
Model the horizontal and vertical errors $X$ and $Y$ of a dart player's throws, measured in units of their standard deviation, as independent standard normal random variables (a hypothetical model). Their joint density is

$$\varphi(x)\varphi(y) = \frac{1}{2\pi}e^{-(x^2 + y^2)/2}.$$

- (a) Use polar coordinates to show that the probability of landing within the distance $c$ of the target is $1 - e^{-c^2/2}$. Evaluate it for $c = 1$, 2 and 3, and compare with the 68–95–99.7 rule of Module 12.
- (b) As Module 12 defined the mean of one random variable, the mean of a quantity $g(X, Y)$ is $\iint g(x, y)f(x, y)\,dA$ over the plane. Show that the mean distance from the target is $\sqrt{\pi/2} \approx 1.253$. You may use the Gaussian integral.

::: solution
**(a)** The event is the disc $x^2 + y^2 \le c^2$, which is $0 \le r \le c$, $0 \le \theta \le 2\pi$ in polar coordinates. With $u = r^2/2$,

$$\begin{aligned} P &= \int_0^{2\pi}\int_0^c \frac{1}{2\pi}e^{-r^2/2}\,r\,dr\,d\theta \\ &= \Big[-e^{-r^2/2}\Big]_0^c = 1 - e^{-c^2/2}. \end{aligned}$$

For $c = 1$, 2 and 3 this is $1 - e^{-1/2} \approx 0.393$, $1 - e^{-2} \approx 0.865$ and $1 - e^{-9/2} \approx 0.989$. In one dimension the probabilities of landing within 1, 2 and 3 standard deviations are about 0.683, 0.954 and 0.997. A dart must be close in both directions at once, so far fewer land within one standard deviation of the target.

**(b)** The distance is $r$, so the mean distance is

$$\int_0^{2\pi}\int_0^\infty r\cdot\frac{1}{2\pi}e^{-r^2/2}\,r\,dr\,d\theta = \int_0^\infty r^2e^{-r^2/2}\,dr,$$

an improper integral of a positive function. Integrate by parts with $u = r$ and $dv = re^{-r^2/2}\,dr$, so $v = -e^{-r^2/2}$: for $t > 0$,

$$\int_0^t r^2e^{-r^2/2}\,dr = -te^{-t^2/2} + \int_0^t e^{-r^2/2}\,dr.$$

As $t \to \infty$, $te^{-t^2/2} \to 0$ (by L'Hôpital's rule, Module 7, applied to $t\big/e^{t^2/2}$), and by the Gaussian integral with $c = \tfrac12$ (Section 19.4), $\int_0^\infty e^{-r^2/2}\,dr$ is half of $\sqrt{2\pi}$. So the mean distance is

$$\frac{\sqrt{2\pi}}{2} = \sqrt{\frac{\pi}{2}} \approx 1.253.$$

```check
cD = symbols('c', positive=True)
same(exp(-x**2/2)/sqrt(2*pi)*exp(-y**2/2)/sqrt(2*pi), exp(-(x**2 + y**2)/2)/(2*pi))
PD = integrate(exp(-r**2/2)*r/(2*pi), (r, 0, cD), (theta, 0, 2*pi)); same(PD, 1 - exp(-cD**2/2))
rounds(1 - exp(-Rational(1, 2)), '0.393'); rounds(1 - exp(-2), '0.865'); rounds(1 - exp(-Rational(9, 2)), '0.989')
rounds(erf(1/sqrt(2)), '0.683'); rounds(erf(2/sqrt(2)), '0.954'); rounds(erf(3/sqrt(2)), '0.997')
tD = symbols('t', positive=True)
same(integrate(r**2*exp(-r**2/2), (r, 0, tD)), -tD*exp(-tD**2/2) + integrate(exp(-r**2/2), (r, 0, tD)))
limit_is(t*exp(-t**2/2), t, oo, 0); same(integrate(exp(-r**2/2), (r, 0, oo)), sqrt(2*pi)/2)
same(integrate(r*exp(-r**2/2)*r/(2*pi), (r, 0, oo), (theta, 0, 2*pi)), sqrt(pi/2)); same(sqrt(2*pi)/2, sqrt(pi/2)); rounds(sqrt(pi/2), '1.253')
```
:::
::::

## Check yourself {#quiz}

```quiz
? Which iterated integral equals $\iint_D f(x, y)\,dA$, where $D$ is the triangle $0 \le y \le x \le 1$ (vertices $(0, 0)$, $(1, 0)$ and $(1, 1)$)?
- [ ] $\displaystyle\int_0^1\int_0^y f(x, y)\,dx\,dy$
- [ ] $\displaystyle\int_0^1\int_0^x f(x, y)\,dx\,dy$
- [ ] $\displaystyle\int_0^x\int_0^1 f(x, y)\,dy\,dx$
- [x] $\displaystyle\int_0^1\int_y^1 f(x, y)\,dx\,dy$
> A horizontal line at height $y$ crosses $D$ from the line $x = y$ to the side $x = 1$, so $x$ runs from $y$ to 1, and $y$ from 0 to 1. $\int_0^y \dots\,dx$ covers the other triangle, $0 \le x \le y$; $\int_0^x \dots\,dx$ has the variable of integration in its own limit; and an outer limit $x$ is not a constant.

? $\displaystyle\int_0^1\int_0^2 (x + 2y)\,dy\,dx$ equals
- [ ] 4
- [x] 5
- [ ] $2x + 4$
- [ ] 4.5
> The inner integral, in $y$ from 0 to 2, is $2x + 4$, and $\int_0^1 (2x + 4)\,dx = 1 + 4 = 5$. $2x + 4$ is only the inner integral, a function of $x$, not the value; 4 attaches the limits to the wrong variables, integrating over $[0, 2] \times [0, 1]$; 4.5 adds $\int_0^1 x\,dx$ and $\int_0^2 2y\,dy$, forgetting that integrating $x$ over $y$ from 0 to 2 multiplies it by 2.

? Which integral is the area of the disc $x^2 + y^2 \le 9$?
- [ ] $\displaystyle\int_0^{2\pi}\int_0^3 dr\,d\theta$
- [ ] $\displaystyle\int_0^{\pi}\int_0^3 r\,dr\,d\theta$
- [x] $\displaystyle\int_0^{2\pi}\int_0^3 r\,dr\,d\theta$
- [ ] $\displaystyle\int_0^{2\pi}\int_0^9 r\,dr\,d\theta$
> The disc is $0 \le r \le 3$, $0 \le \theta \le 2\pi$, and $dA = r\,dr\,d\theta$, which gives $9\pi$. Without the factor $r$ the integral is $6\pi$; $\theta$ up to $\pi$ covers only the upper half disc; and the radius is 3, not $r^2 = 9$.

? Reversing the order of integration, $\displaystyle\int_0^1\int_x^1 g(y)\,dy\,dx$ equals
- [x] $\displaystyle\int_0^1 y\,g(y)\,dy$
- [ ] $\displaystyle\int_0^1 (1 - y)\,g(y)\,dy$
- [ ] $\displaystyle\int_0^1 g(y)\,dy$
- [ ] $\displaystyle\int_0^1\int_0^1 g(y)\,dx\,dy$
> The region is $0 \le x \le y \le 1$. At height $y$, $x$ runs from 0 to $y$, a slice of length $y$, so the integral is $\int_0^1\int_0^y g(y)\,dx\,dy = \int_0^1 y\,g(y)\,dy$. The factor $1 - y$ belongs to the other triangle, $y \le x \le 1$; $\int_0^1 g(y)\,dy$ forgets the length of the slice; and the last integral is over the whole square.

? The transformation $x = 2u + v$, $y = u - v$ maps the unit square $0 \le u \le 1$, $0 \le v \le 1$ onto a parallelogram. Its area is
- [ ] $-3$
- [ ] 1
- [x] 3
- [ ] 2
> The Jacobian is $x_uy_v - x_vy_u = 2 \cdot (-1) - 1 \cdot 1 = -3$, and areas scale by its absolute value: $3 \cdot 1 = 3$. $-3$ forgets the absolute value (an area is never negative); 1 adds the two products, $-2 + 1 = -1$, instead of subtracting them.

? In spherical coordinates, with $\varphi$ measured from the positive $z$-axis, the volume element $dV$ is
- [ ] $\rho\sin\varphi\,d\rho\,d\theta\,d\varphi$
- [x] $\rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$
- [ ] $\rho^2\cos\varphi\,d\rho\,d\theta\,d\varphi$
- [ ] $\rho^2\,d\rho\,d\theta\,d\varphi$
> A small wedge has edges $\Delta\rho$, $\rho\,\Delta\varphi$ and $\rho\sin\varphi\,\Delta\theta$, so $dV = \rho^2\sin\varphi\,d\rho\,d\theta\,d\varphi$. $\rho\sin\varphi$ misses one factor $\rho$; $\cos\varphi$ would be right only if $\varphi$ were measured from the $xy$-plane, like a latitude; and without $\sin\varphi$ a ball of radius $a$ would get the volume $\tfrac23\pi^2a^3$ instead of $\tfrac43\pi a^3$.

? $X$ and $Y$ are independent and each uniform on $[0, 1]$. $P\big(X + Y \le \tfrac12\big)$ is
- [ ] $\tfrac14$
- [ ] $\tfrac12$
- [ ] $\tfrac{1}{16}$
- [x] $\tfrac18$
> The joint density is 1 on the unit square, so the probability is the area of the triangle $x \ge 0$, $y \ge 0$, $x + y \le \tfrac12$, with legs $\tfrac12$: $\tfrac12 \cdot \tfrac12 \cdot \tfrac12 = \tfrac18$. $\tfrac14$ is the square $\big[0, \tfrac12\big] \times \big[0, \tfrac12\big]$; $\tfrac12$ is $P(X + Y \le 1)$; $\tfrac{1}{16}$ squares the side $\tfrac14$ of nothing in particular.

? $\displaystyle\int_0^\infty e^{-x^2}\,dx$ equals
- [x] $\dfrac{\sqrt\pi}{2}$
- [ ] $\sqrt\pi$
- [ ] $\dfrac{\pi}{4}$
- [ ] $\pi$
> $e^{-x^2}$ is even, so the integral over $[0, \infty)$ is half of $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt\pi$. $\sqrt\pi$ is the integral over the whole line; $\tfrac{\pi}{4}$ is the square of the answer, the integral of $e^{-(x^2 + y^2)}$ over the first quadrant; $\pi$ is the integral of $e^{-(x^2 + y^2)}$ over the whole plane.
```

```check
same(integrate(1, (x, y, 1), (y, 0, 1)), Rational(1, 2)); same(integrate(1, (y, 0, x), (x, 0, 1)), Rational(1, 2))
same(integrate(x + 2*y, (y, 0, 2)), 2*x + 4); same(integrate(x + 2*y, (y, 0, 2), (x, 0, 1)), 5)
same(integrate(x + 2*y, (y, 0, 1), (x, 0, 2)), 4); same(integrate(x, (x, 0, 1)) + integrate(2*y, (y, 0, 2)), Rational(9, 2))
same(integrate(r, (r, 0, 3), (theta, 0, 2*pi)), 9*pi); same(integrate(1, (r, 0, 3), (theta, 0, 2*pi)), 6*pi)
same(integrate(r, (r, 0, 3), (theta, 0, pi)), 9*pi/2); same(integrate(r, (r, 0, 9), (theta, 0, 2*pi)), 81*pi)
gq = Function('g'); same(Integral(gq(y), (x, 0, y)).doit(), y*gq(y))
same(Matrix([2*u + v, u - v]).jacobian([u, v]).det(), -3); same(2*(-1) + 1*1, -1)
same(integrate(1, (y, 0, Rational(1, 2) - x), (x, 0, Rational(1, 2))), Rational(1, 8))
same(integrate(exp(-x**2), (x, 0, oo)), sqrt(pi)/2); same((sqrt(pi)/2)**2, pi/4)
same(integrate(exp(-r**2)*r, (r, 0, oo), (theta, 0, pi/2)), pi/4); same(integrate(exp(-r**2)*r, (r, 0, oo), (theta, 0, 2*pi)), pi)
same(integrate(rh**2, (rh, 0, aB), (theta, 0, 2*pi), (ph, 0, pi)), Rational(2, 3)*pi**2*aB**3)
```
