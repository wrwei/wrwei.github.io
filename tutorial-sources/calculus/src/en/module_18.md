---
title: Optimisation in several variables
part: 5
lead: Find the highest and lowest points of a function of two or more variables. You will classify critical points with the Hessian, find absolute extreme values on closed bounded regions, optimise under constraints with Lagrange multipliers, fit a line to data by least squares, and see why gradient descent can zigzag when a function curves much more steeply in one direction than in another.
minutes: 270
needs: Module 8 (optimisation in one variable) and Modules 16 and 17 (vectors, partial derivatives and the gradient); the quadratic approximation uses Taylor polynomials from Module 15, and one optional proof uses Taylor's theorem from the same module
goals:
  - Find the critical points of a function of two variables and classify them with the second derivative test
  - Find the absolute maximum and minimum values of a continuous function on a closed bounded region
  - Solve optimisation problems with constraints by Lagrange multipliers, and explain the method with level curves
  - Fit a line to data by least squares, deriving the normal equations from partial derivatives
  - Explain how the step size and the shape of the level curves decide whether, and how fast, gradient descent converges
---

## Local extrema and critical points {#critical-points}

Picture a function of two variables as a landscape: above the point $(x, y)$ of a map the ground is at height $z = f(x, y)$, and the level curves $f(x, y) = c$ are the contour lines of the map (Module 17). Three kinds of place have level ground underfoot: the top of a hill, the bottom of a hollow, and a mountain pass, the lowest point of a ridge and the highest point of the path across it. This module finds such places and tells them apart. Then it finds the extreme values of a function on a region, optimises under constraints, fits lines to data, and studies how gradient descent, a method used to train machine-learning models, searches for the bottom of a valley. Unless a passage says otherwise, $f$ is a function of two variables; most of the ideas extend to more.

::: definition Local and absolute extrema
Let $f$ be a function of two variables with domain $D$, and let $(a, b)$ be a point of $D$.

- $f(a, b)$ is the **absolute maximum** value of $f$ if $f(a, b) \ge f(x, y)$ for every point $(x, y)$ of $D$, and the **absolute minimum** value if $f(a, b) \le f(x, y)$ for every $(x, y)$ in $D$.
- $f(a, b)$ is a **local maximum** value of $f$ if $f(a, b) \ge f(x, y)$ for every $(x, y)$ in some open disc centred at $(a, b)$ that lies in $D$, and a **local minimum** value if $f(a, b) \le f(x, y)$ for every $(x, y)$ in such a disc.

The **open disc** of radius $r > 0$ centred at $(a, b)$ is the set of points $(x, y)$ with $(x - a)^2 + (y - b)^2 < r^2$: the points whose distance from $(a, b)$ is less than $r$.
:::

These are the **extreme values**, or **extrema**. "Local" means "compared with every nearby point, in every direction", so a point on the edge of the domain is never a local extremum, as in Module 8.

::: theorem Fermat's theorem in two variables
If $f$ has a local maximum or a local minimum at $(a, b)$, and the first partial derivatives of $f$ exist at $(a, b)$, then

$$f_x(a, b) = 0 \quad\text{and}\quad f_y(a, b) = 0,$$

that is, $\nabla f(a, b) = \vb{0}$.
:::

::: proof
Suppose that $f(a, b)$ is a local maximum value: $f(x, y) \le f(a, b)$ on an open disc of radius $r$ centred at $(a, b)$ that lies in the domain. Walk along the horizontal line through $(a, b)$: the function $g(x) = f(x, b)$ is defined for $\abs{x - a} < r$, since those points $(x, b)$ lie in the disc, and $g(x) \le g(a)$ there. So $g$ has a local maximum at $a$. Its derivative there is $g'(a) = f_x(a, b)$, which exists, because a partial derivative is the ordinary derivative along such a line (Module 17). By Fermat's theorem in one variable ([Theorem 8.1](module_08_EN.html#extrema)), $g'(a) = 0$, that is, $f_x(a, b) = 0$. The vertical line through $(a, b)$, with $h(y) = f(a, y)$, gives $f_y(a, b) = 0$ in the same way. Finally, a local minimum of $f$ is a local maximum of $-f$.
:::

Geometrically: where a local extremum has a tangent plane $z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$ (Module 17), the plane is horizontal, $z = f(a, b)$.

::: definition Critical point
A **critical point** of $f$ is a point $(a, b)$ of its domain where $\nabla f(a, b) = \vb{0}$, that is, $f_x(a, b) = f_y(a, b) = 0$, or where $f_x$ or $f_y$ does not exist.
:::

In these words, Theorem 18.1 says: **every local extremum is at a critical point.** As in one variable, the converse fails. The simplest example is $f(x, y) = x^2 - y^2$. Its gradient $\nabla f = \langle 2x, -2y\rangle$ is $\vb{0}$ only at the origin, where $f(0, 0) = 0$. Walk through the origin along the two axes:

```valuetable
t = -1, -0.5, -0.1, 0, 0.1, 0.5, 1
$f(t, 0) = t^2$ = t**2
$f(0, t) = -t^2$ = -t**2
---
t | f(t, 0) = t^2 | f(0, t) = -t^2
-1 | 1 | -1
-0.5 | 0.25 | -0.25
-0.1 | 0.01 | -0.01
0 | 0 | 0
0.1 | 0.01 | -0.01
0.5 | 0.25 | -0.25
1 | 1 | -1
```

Along the $x$-axis the origin is the lowest point; along the $y$-axis it is the highest. So every disc around the origin contains points where $f > 0$ and points where $f < 0$, and $f(0, 0) = 0$ is neither a local maximum nor a local minimum. The surface is shaped like a saddle, or a mountain pass (Figure 18.1).

```check
fs = x**2 - y**2
same(diff(fs, x), 2*x); same(diff(fs, y), -2*y)
same(solve([2*x, -2*y], [x, y], dict=True), [{x: 0, y: 0}])
same(fs.subs(y, 0), x**2); same(fs.subs(x, 0), -y**2)
holds(fs.subs({x: Rational(1, 10), y: 0}) > 0); holds(fs.subs({x: 0, y: Rational(1, 10)}) < 0)
```

::: figure id=fig-18-1
Left: the surface $z = x^2 - y^2$. Along the $x$-axis it follows the parabola $z = x^2$ (green), lowest at the origin; along the $y$-axis it follows $z = -y^2$ (orange), highest at the origin. Right: its level curves $x^2 - y^2 = c$ are hyperbolas, green for $c = 1, 2, 3$ and orange for $c = -1, -2, -3$; the level curve $c = 0$ is the pair of dashed lines $y = \pm x$, which cross at the saddle point.
:::

::: definition Saddle point
A critical point $(a, b)$ in the interior of the domain of $f$ (so some open disc centred there lies in the domain) is a **saddle point** if $f$ has neither a local maximum nor a local minimum there: every open disc centred at $(a, b)$ contains domain points where $f(x, y) > f(a, b)$ and points where $f(x, y) < f(a, b)$.
:::

Common contour pictures are small closed loops around a hilltop or a hollow, and a level curve crossing itself at a saddle point, like the lines $y = \pm x$ in Figure 18.1. These pictures are guides, not definitions: a saddle's level curve need not cross itself, as $x^2 + y^3 = 0$ in Example 18.3 will show.

::: example Critical points of a cubic
Find the critical points of $f(x, y) = x^3 + y^3 - 3xy$.

$f$ is a polynomial, so its partial derivatives exist everywhere, and the critical points are the solutions of $\nabla f = \vb{0}$:

$$f_x = 3x^2 - 3y = 0, \qquad f_y = 3y^2 - 3x = 0.$$

The first equation says $y = x^2$, the second $x = y^2$. Substitute the first into the second: $x = (x^2)^2 = x^4$, that is,

$$x^4 - x = x(x^3 - 1) = x(x - 1)(x^2 + x + 1) = 0.$$

The quadratic factor has no real zeros, since its discriminant is $1 - 4 = -3 < 0$. So $x = 0$ or $x = 1$, and $y = x^2$ gives the two critical points $(0, 0)$ and $(1, 1)$. Check the second: $f_x(1, 1) = 3 - 3 = 0$ and $f_y(1, 1) = 3 - 3 = 0$.

```check
f181 = x**3 + y**3 - 3*x*y
same(diff(f181, x), 3*x**2 - 3*y); same(diff(f181, y), 3*y**2 - 3*x)
steps(x**4 - x, x*(x**3 - 1), x*(x - 1)*(x**2 + x + 1)); same(discriminant(x**2 + x + 1, x), -3)
xr_, yr_ = symbols('x y', real=True)
f181r = f181.subs({x: xr_, y: yr_})
same_set(solve([diff(f181r, xr_), diff(f181r, yr_)], [xr_, yr_], dict=True), [{xr_: 0, yr_: 0}, {xr_: 1, yr_: 1}])
same(diff(f181, x).subs({x: 1, y: 1}), 0); same(diff(f181, y).subs({x: 1, y: 1}), 0)
```
:::

::: pitfall
Three slips with critical points. **Calling every critical point an extremum**: the origin is a critical point of $x^2 - y^2$ but a saddle point. **Forgetting the points where a partial derivative does not exist**: the cone $f(x, y) = \sqrt{x^2 + y^2}$ has its absolute minimum 0 at the origin, where $f_x$ does not exist, since $\big(f(h, 0) - f(0, 0)\big)/h = \abs{h}/h$ is 1 for $h > 0$ and $-1$ for $h < 0$. **Losing solutions by dividing**: dividing $x = x^4$ by $x$ gives $x^3 = 1$ and loses $x = 0$, the critical point $(0, 0)$. Factor instead.
:::

```check
hr = symbols('h', real=True)
same(sqrt(hr**2 + 0**2), Abs(hr)); limit_is(Abs(h)/h, h, 0, 1, '+'); limit_is(Abs(h)/h, h, 0, -1, '-')
holds(0 in solve(x**4 - x, x)); holds(0 not in solve(x**3 - 1, x))
```

## The second derivative test {#second-derivative-test}

Module 8 told a peak from a valley by the sign of $f''(c)$. In two variables the test uses all three second partial derivatives, and the reason is a quadratic approximation.

**The quadratic approximation.** Let $f$ have continuous second partial derivatives near $(a, b)$, and look at $f$ along the line from $(a, b)$ towards $(a + h, b + k)$: $g(t) = f(a + th, b + tk)$. By the chain rule of Module 17, $g'(t) = f_x h + f_y k$, and differentiating again, with Clairaut's theorem $f_{yx} = f_{xy}$,

$$g''(t) = f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2,$$

where the partial derivatives are taken at $(a + th, b + tk)$. The Taylor polynomial of degree 2 of $g$ at 0 (Module 15), evaluated at $t = 1$, gives

$$\begin{aligned} &f(a + h, b + k) \\ &\quad\approx f(a, b) + f_x h + f_y k \\ &\qquad + \tfrac12\big(f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2\big), \end{aligned}$$

with every partial derivative now taken at $(a, b)$. The first three terms are the linear approximation of Module 17. At a critical point $f_x = f_y = 0$, so near $(a, b)$

$$\begin{gathered} f(a + h, b + k) - f(a, b) \approx \tfrac12\,Q(h, k), \\ Q(h, k) = Ah^2 + 2Bhk + Ck^2, \end{gathered}$$

where $A = f_{xx}(a, b)$, $B = f_{xy}(a, b)$ and $C = f_{yy}(a, b)$. Near a critical point the graph looks like the graph of the quadratic $Q$, so the question becomes: when is $Q(h, k)$ positive, when negative, and when both?

```check
fF = Function('f'); hh_, kk_ = symbols('h k')
gF = fF(a + t*hh_, b + t*kk_)
same(diff(gF, t).subs(t, 0), hh_*Subs(Derivative(fF(x, b), x), x, a) + kk_*Subs(Derivative(fF(a, y), y), y, b))
fpoly = x**3*y + 2*x*y**2 - y + 5                     # an instance: g'' is the quadratic in h and k
gp = fpoly.subs({x: a + t*hh_, y: b + t*kk_})
same(diff(gp, t, 2).subs(t, 0), (diff(fpoly, x, 2)*hh_**2 + 2*diff(fpoly, x, y)*hh_*kk_ + diff(fpoly, y, 2)*kk_**2).subs({x: a, y: b}))
same(diff(gp, t, 2), (diff(fpoly, x, 2)*hh_**2 + 2*diff(fpoly, x, y)*hh_*kk_ + diff(fpoly, y, 2)*kk_**2).subs({x: a + t*hh_, y: b + t*kk_}))
```

**The sign of a quadratic.** If $A \ne 0$, complete the square:

$$\begin{aligned} &Ah^2 + 2Bhk + Ck^2 \\ &\quad= A\Big(h + \frac{B}{A}k\Big)^2 + \frac{AC - B^2}{A}\,k^2. \end{aligned}$$

- If $AC - B^2 > 0$, both terms have the sign of $A$, and both are 0 only when $k = 0$ and then $h = 0$. So $Q(h, k)$ has the sign of $A$ for every $(h, k) \ne (0, 0)$: a bowl if $A > 0$, a dome if $A < 0$.
- If $AC - B^2 < 0$, then $Q(1, 0) = A$, while along the line $h = -\tfrac{B}{A}k$ the first term vanishes and $Q$ has the opposite sign: $Q$ takes both signs, as on a saddle. (If $A = 0$ and $B \ne 0$, $Q = k(2Bh + Ck)$ takes both signs too.)
- If $AC - B^2 = 0$, $Q$ is 0 along a whole line through the origin, and the quadratic cannot decide.

The three models are $h^2 + k^2$ (a bowl), $-h^2 - k^2$ (a dome) and $h^2 - k^2$ (the saddle of Figure 18.1). The quadratic $2hk$, with $A = C = 0$ and $B = 1$, is the same saddle turned through $45^\circ$: with $h = (u - v)/\sqrt2$ and $k = (u + v)/\sqrt2$, it becomes $u^2 - v^2$.

```check
A_, B_, C_ = symbols('A B C')
same(A_*(hh_ + B_/A_*kk_)**2 + (A_*C_ - B_**2)/A_*kk_**2, A_*hh_**2 + 2*B_*hh_*kk_ + C_*kk_**2)
same((A_*hh_**2 + 2*B_*hh_*kk_ + C_*kk_**2).subs({hh_: 1, kk_: 0}), A_)
same((A_*hh_**2 + 2*B_*hh_*kk_ + C_*kk_**2).subs(hh_, -B_/A_*kk_), (A_*C_ - B_**2)/A_*kk_**2)
same((2*B_*hh_*kk_ + C_*kk_**2), kk_*(2*B_*hh_ + C_*kk_))
same((2*B_*hh_*kk_ + C_*kk_**2).subs({hh_: (1 - C_)/(2*B_), kk_: 1}), 1)
same((2*B_*hh_*kk_ + C_*kk_**2).subs({hh_: (-1 - C_)/(2*B_), kk_: 1}), -1)
same((2*hh_*kk_).subs({hh_: (u - v)/sqrt(2), kk_: (u + v)/sqrt(2)}), u**2 - v**2)
```

::: definition The Hessian and its determinant
The **Hessian matrix** of $f$ at $(a, b)$ is the square array of its second partial derivatives there,

$$H = \begin{pmatrix} f_{xx} & f_{xy} \\ f_{yx} & f_{yy} \end{pmatrix},$$

and, when $f_{yx} = f_{xy}$, its **determinant** is the number

$$D = f_{xx}f_{yy} - f_{xy}^2.$$

(A rectangular array of numbers is a **matrix**; the determinant of a two-by-two matrix $\begin{pmatrix} p & q \\ r & s \end{pmatrix}$ is $ps - qr$.)
:::

$D$ is the $AC - B^2$ of the completed square. Mathematical Foundations studies matrices in its [linear algebra modules](../math/module_10_EN.html), and in [its Module 13](../math/module_13_EN.html) the quadratic forms behind this test in any number of variables.

::: theorem The second derivative test
Suppose that the second partial derivatives of $f$ are continuous on an open disc centred at $(a, b)$, and that $f_x(a, b) = 0$ and $f_y(a, b) = 0$. Let $D = f_{xx}(a, b)f_{yy}(a, b) - f_{xy}(a, b)^2$.

- If $D > 0$ and $f_{xx}(a, b) > 0$, then $f(a, b)$ is a local minimum value.
- If $D > 0$ and $f_{xx}(a, b) < 0$, then $f(a, b)$ is a local maximum value.
- If $D < 0$, then $(a, b)$ is a saddle point.
- If $D = 0$, the test is inconclusive.
:::

When $D > 0$, $f_{xx}f_{yy} > f_{xy}^2 \ge 0$, so $f_{xx}$ and $f_{yy}$ have the same sign, and either one decides. The continuity of the second partial derivatives is what makes the quadratic $Q$ describe $f$ near $(a, b)$; the proof below shows where it is used.

:::: deeper Why the second derivative test works
A first reading may skip this proof. Take $(h, k) \ne (0, 0)$ so small that the segment from $(a, b)$ to $(a + h, b + k)$ lies in the disc, and let $g(t) = f(a + th, b + tk)$ for $0 \le t \le 1$, as above. Since the second partial derivatives are continuous, $f_x$ and $f_y$ are differentiable, so the chain rule applies twice, and $g''(t) = f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2$, with the partial derivatives at $(a + th, b + tk)$. Taylor's theorem with $n = 1$ (Module 15) gives $g(1) = g(0) + g'(0) + \tfrac12g''(c)$ for some $c$ between 0 and 1. Since $g'(0) = f_x(a, b)h + f_y(a, b)k = 0$,

$$\begin{aligned} &f(a + h, b + k) - f(a, b) \\ &\quad= \tfrac12\big(f_{xx}h^2 + 2f_{xy}hk + f_{yy}k^2\big), \end{aligned} \tag{$*$}$$

with the partial derivatives at $(a + ch, b + ck)$.

**Minimum.** Suppose $D > 0$ and $f_{xx} > 0$ at $(a, b)$. The functions $f_{xx}$ and $f_{xx}f_{yy} - f_{xy}^2$ are continuous and positive at $(a, b)$, so they stay positive on some smaller disc centred at $(a, b)$. If $(a + h, b + k)$ lies in that disc, so does $(a + ch, b + ck)$, and at that point the completed square shows that the bracket in $(*)$ is positive. So $f(a + h, b + k) > f(a, b)$ for every such $(h, k) \ne (0, 0)$: a local minimum. **Maximum.** Apply this to $-f$.

**Saddle.** Suppose $D < 0$ at $(a, b)$. The completed square gives directions $(h_1, k_1)$ and $(h_2, k_2)$ with $Q(h_1, k_1) > 0$ and $Q(h_2, k_2) < 0$ for the second partial derivatives at $(a, b)$. Put $(h, k) = (sh_1, sk_1)$ in $(*)$: then $f(a + sh_1, b + sk_1) - f(a, b) = \tfrac12s^2\big(f_{xx}h_1^2 + 2f_{xy}h_1k_1 + f_{yy}k_1^2\big)$ at a point between $(a, b)$ and $(a + sh_1, b + sk_1)$. As $s \to 0$ that point tends to $(a, b)$, and by continuity the bracket tends to $Q(h_1, k_1) > 0$; so $f > f(a, b)$ at points $(a + sh_1, b + sk_1)$ with small $s \ne 0$. In the same way $f < f(a, b)$ at points $(a + sh_2, b + sk_2)$ with small $s \ne 0$. Every disc centred at $(a, b)$ contains both kinds of point: a saddle point. **Inconclusive.** Example 18.3 shows three functions with $D = 0$: a minimum, and two saddle points.
::::

::: example Classifying the critical points of the cubic
Classify the critical points $(0, 0)$ and $(1, 1)$ of $f(x, y) = x^3 + y^3 - 3xy$ (Example 18.1), and decide whether $f$ has absolute extreme values.

The second partial derivatives are $f_{xx} = 6x$, $f_{xy} = -3$ and $f_{yy} = 6y$, all continuous, so

$$D = (6x)(6y) - (-3)^2 = 36xy - 9.$$

- At $(0, 0)$: $D = -9 < 0$, a saddle point. You can see it directly: along the line $y = x$, $f(t, t) = 2t^3 - 3t^2 = t^2(2t - 3) < 0$ for $t \ne 0$ near 0, while along $y = -x$, $f(t, -t) = 3t^2 > 0$.
- At $(1, 1)$: $D = 36 - 9 = 27 > 0$ and $f_{xx} = 6 > 0$, so $f(1, 1) = 1 + 1 - 3 = -1$ is a local minimum value.

The local minimum is not absolute: along the $x$-axis $f(x, 0) = x^3$, which tends to $-\infty$ as $x \to -\infty$ and to $\infty$ as $x \to \infty$. So $f$ has no absolute minimum and no absolute maximum. Figure 18.2 shows the level curves: small closed loops around $(1, 1)$, and the level curve $f = 0$ crossing itself at the saddle point.

```check
H181 = hessian(f181, (x, y))
same(H181, Matrix([[6*x, -3], [-3, 6*y]])); same(H181.det(), 36*x*y - 9)
same(H181.det().subs({x: 0, y: 0}), -9); same(H181.det().subs({x: 1, y: 1}), 27); same(H181[0, 0].subs(x, 1), 6)
same(f181.subs({x: 1, y: 1}), -1); same(1 + 1 - 3, -1)
steps(f181.subs(y, x), 2*x**3 - 3*x**2, x**2*(2*x - 3)); same(f181.subs(y, -x), 3*x**2)
holds(f181.subs({x: Rational(1, 10), y: Rational(1, 10)}) < 0); holds(f181.subs({x: Rational(-1, 10), y: Rational(-1, 10)}) < 0)
same(f181.subs(y, 0), x**3); limit_is(x**3, x, -oo, -oo); limit_is(x**3, x, oo, oo)
```
:::

::: figure id=fig-18-2
Level curves of $f(x, y) = x^3 + y^3 - 3xy$. Around the local minimum at $(1, 1)$ the level curves $f = -0.8$ and $f = -0.4$ (blue) are closed loops; through the saddle point at the origin passes the level curve $f = 0$ (purple), which crosses itself there. The dashed square and the dots belong to Example 18.4: they mark the candidates for the absolute extreme values of $f$ on the square.
:::

::: example When $D = 0$
Show that $f_1 = x^2 + y^4$, $f_2 = x^2 - y^4$ and $f_3 = x^2 + y^3$ each have exactly one critical point, the origin, with $D = 0$ there, and decide what each has at the origin.

The gradients are $\langle 2x, 4y^3\rangle$, $\langle 2x, -4y^3\rangle$ and $\langle 2x, 3y^2\rangle$, which are $\vb{0}$ only at $(0, 0)$. At the origin all three have $f_{xx} = 2$, $f_{xy} = 0$ and $f_{yy} = 0$ (it is $12y^2$, $-12y^2$ and $6y$), so $D = 2 \cdot 0 - 0^2 = 0$: the test is inconclusive, and you must look at $f$ itself.

- $f_1(x, y) = x^2 + y^4 \ge 0 = f_1(0, 0)$: an absolute minimum.
- $f_2(x, 0) = x^2 > 0$ for $x \ne 0$, but $f_2(0, y) = -y^4 < 0$ for $y \ne 0$: a saddle point.
- $f_3(0, y) = y^3$ is positive for $y > 0$ and negative for $y < 0$: a saddle point, although $f_{xx} > 0$ and no direction makes $Q = 2h^2$ negative. Its zero level curve $x^2 = -y^3$ has a cusp at the origin, not a crossing.

```check
for fz in (x**2 + y**4, x**2 - y**4, x**2 + y**3):
    same(solve([diff(fz, x), diff(fz, y)], [x, y], dict=True), [{x: 0, y: 0}])
    Hz = hessian(fz, (x, y)).subs({x: 0, y: 0})
    same(Hz, Matrix([[2, 0], [0, 0]])); same(Hz.det(), 0)
same([diff(fz, y, 2) for fz in (x**2 + y**4, x**2 - y**4, x**2 + y**3)], [12*y**2, -12*y**2, 6*y])
same([[diff(fz, s_) for s_ in (x, y)] for fz in (x**2 + y**4, x**2 - y**4, x**2 + y**3)], [[2*x, 4*y**3], [2*x, -4*y**3], [2*x, 3*y**2]])
holds(xr_**2 + yr_**4 >= 0)
same((x**2 + y**3).subs({x: t**3, y: -t**2}), 0)       # the zero level curve is a cusp
holds((x**2 - y**4).subs({x: Rational(1, 10), y: 0}) > 0); holds((x**2 - y**4).subs({x: 0, y: Rational(1, 10)}) < 0)
holds((x**2 + y**3).subs({x: 0, y: Rational(1, 10)}) > 0); holds((x**2 + y**3).subs({x: 0, y: -Rational(1, 10)}) < 0)
```
:::

::: pitfall
Three slips with the test. **Reading $f_{xx}$ when $D < 0$**: then the point is a saddle point, whatever the sign of $f_{xx}$. **Checking only $f_{xx}$ and $f_{yy}$**: $f(x, y) = x^2 + 3xy + y^2$ has $f_{xx} = f_{yy} = 2 > 0$ at its critical point $(0, 0)$, but $D = 4 - 9 = -5 < 0$, and indeed $f(t, -t) = -t^2 < 0$: the mixed term $3xy$ wins along the line $y = -x$. **Treating $D = 0$ as a saddle point**: it means only that the test is inconclusive (Example 18.3).
:::

```check
fq_ = x**2 + 3*x*y + y**2
same(hessian(fq_, (x, y)), Matrix([[2, 3], [3, 2]])); same(hessian(fq_, (x, y)).det(), -5); same(fq_.subs(y, -x), -x**2)
same(solve([diff(fq_, x), diff(fq_, y)], [x, y], dict=True), [{x: 0, y: 0}])
```

::: compute Classifying critical points with SymPy
`sp.hessian` builds the Hessian matrix, and `solve` with a list of equations solves the system $\nabla f = \vb{0}$. Declare the symbols real, so that only real solutions come back:

```python
import sympy as sp
x, y = sp.symbols('x y', real=True)
f = x**3 + y**3 - 3*x*y
crit = sp.solve([sp.diff(f, x), sp.diff(f, y)], [x, y], dict=True)
H = sp.hessian(f, (x, y))
print(crit)
print(H, ' D =', H.det())
```

```output
[{x: 0, y: 0}, {x: 1, y: 1}]
Matrix([[6*x, -3], [-3, 6*y]])  D = 36*x*y - 9
```

The test itself is three comparisons:

```python
def classify(D, fxx):
    if D > 0:
        return 'local minimum' if fxx > 0 else 'local maximum'
    if D < 0:
        return 'saddle point'
    return 'inconclusive'

for p in crit:
    D, fxx = H.det().subs(p), H[0, 0].subs(p)
    print(p, ' D =', D, ' f_xx =', fxx, ':', classify(D, fxx), ' f =', f.subs(p))
```

```output
{x: 0, y: 0}  D = -9  f_xx = 0 : saddle point  f = 0
{x: 1, y: 1}  D = 27  f_xx = 6 : local minimum  f = -1
```

Without `real=True`, `solve` also returns the points where $x$ is one of the two complex cube roots of 1 (the zeros of $x^2 + x + 1$), which have no place on a map of the plane:

```python
u, v = sp.symbols('u v')                  # no assumptions
g = u**3 + v**3 - 3*u*v
print(len(sp.solve([sp.diff(g, u), sp.diff(g, v)], [u, v], dict=True)), 'solutions')
```

```output
4 solutions
```
:::

## Absolute extrema on closed bounded regions {#absolute-extrema}

Module 8 found the absolute extreme values of a continuous function on a closed interval $[a, b]$ by comparing its values at the critical numbers and at the two endpoints. In two variables the interval becomes a region, and we must check its whole boundary, usually made of curves.

::: definition Interior, boundary, closed and bounded
Let $R$ be a set of points of the plane. A point $P$ is an **interior point** of $R$ if some open disc centred at $P$ lies in $R$, and a **boundary point** of $R$ if every open disc centred at $P$ contains points of $R$ and points not in $R$. The set $R$ is **closed** if it contains all its boundary points, and **bounded** if it lies inside some disc.
:::

The disc $x^2 + y^2 \le 1$ is closed and bounded; its boundary is the circle $x^2 + y^2 = 1$. The open disc $x^2 + y^2 < 1$ is bounded but not closed, since it leaves out the whole circle. A rectangle with its sides, the set of points with $a \le x \le b$ and $c \le y \le d$, is closed and bounded, and so is a triangle with its sides. The half-plane $y \ge 0$ is closed but not bounded.

::: theorem The Extreme Value Theorem in two variables
If $f$ is continuous on a nonempty, closed, bounded set $R$ in the plane, then $f$ has an absolute maximum value $f(x_1, y_1)$ and an absolute minimum value $f(x_2, y_2)$ on $R$, at some points $(x_1, y_1)$ and $(x_2, y_2)$ of $R$.
:::

As for the one-variable theorem of [Module 3](module_03_EN.html#evt), the proof belongs to real analysis, and this series uses the theorem without proof; it holds in three or more variables too. Each hypothesis is needed. On the open disc $x^2 + y^2 < 1$, $f(x, y) = x + y$ has no maximum: its values come as close to $\sqrt2$ as you like near $\big(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2}\big)$, a point of the missing circle, but never reach it. On the half-plane $y \ge 0$ the same $f$ is not bounded. And on the closed disc, the function equal to $x + y$ except at $\big(\tfrac{1}{\sqrt2}, \tfrac{1}{\sqrt2}\big)$, where it is 0, is not continuous and has no maximum.

```check
same(2*(x**2 + y**2) - (x + y)**2, (x - y)**2)                  # so x + y < sqrt(2) inside the open disc
same((x + y).subs({x: 1/sqrt(2), y: 1/sqrt(2)}), sqrt(2)); same((1/sqrt(2))**2 + (1/sqrt(2))**2, 1)
same((x**2 + y**2).subs({x: t/sqrt(2), y: t/sqrt(2)}), t**2)
same((x + y).subs({x: t/sqrt(2), y: t/sqrt(2)}), sqrt(2)*t); limit_is(sqrt(2)*t, t, 1, sqrt(2), '-')
limit_is((x + y).subs(y, 0), x, oo, oo)              # unbounded on the closed half-plane
```

::: theorem Where the absolute extreme values are
Let $f$ be continuous on a nonempty, closed, bounded set $R$. Then $f$ has an absolute maximum value and an absolute minimum value on $R$, and each of them is taken at a boundary point of $R$ or at a critical point of $f$ that is an interior point of $R$.
:::

::: proof
By Theorem 18.3, the absolute maximum value on $R$ is $f(P)$ for some point $P$ of $R$. If $P$ is a boundary point, there is nothing to prove. Otherwise $P$ is an interior point: some open disc centred at $P$ lies in $R$, and $f(P) \ge f$ on that disc, so $f(P)$ is a local maximum value. If both partial derivatives exist at $P$, they are 0 by Theorem 18.1; if not, $P$ is a critical point by definition. The minimum is the same.
:::

::: keyidea
**The closed region method.** To find the absolute extreme values of a continuous function $f$ on a nonempty, closed, bounded region $R$:

1. Find the critical points of $f$ inside $R$, and the values of $f$ there.
2. Find the largest and the smallest values of $f$ on the boundary of $R$. Usually the boundary consists of pieces (the sides of a polygon, arcs of curves) on each of which $f$ becomes a function of one variable: substitute the equation of a side, such as $y = 2$, or a parametrisation, such as $(\cos t, \sin t)$ on a circle, and use the closed interval method of [Module 8](module_08_EN.html#closed-interval), with the ends of each piece.
3. The largest of all these values is the absolute maximum value; the smallest is the absolute minimum value.
:::

As in one variable, no test of the critical points is needed: you compare a list of numbers.

::: example The extreme values on a square
Find the absolute maximum and minimum values of $f(x, y) = x^3 + y^3 - 3xy$ on the square $R$ of points with $-1 \le x \le 2$ and $-1 \le y \le 2$.

$f$ is a polynomial, so continuous, and the square is closed and bounded: the extreme values exist (Theorem 18.3).

**Step 1: inside.** The critical points are $(0, 0)$ and $(1, 1)$ (Example 18.1), both inside the square, with $f(0, 0) = 0$ and $f(1, 1) = -1$. The saddle point is a candidate like any other: the method compares values, it does not classify.

**Step 2: the boundary.** The square has four sides. Since $f(x, y) = f(y, x)$, the bottom side $y = -1$ behaves like the left side $x = -1$, and the top side $y = 2$ like the right side $x = 2$, with $x$ and $y$ swapped.

- Left side, $x = -1$ and $-1 \le y \le 2$: $f(-1, y) = y^3 + 3y - 1$. Its derivative $3y^2 + 3$ is positive, so it is increasing, and its extreme values are at the ends: $f(-1, -1) = -5$ and $f(-1, 2) = 13$.
- Right side, $x = 2$ and $-1 \le y \le 2$: $f(2, y) = y^3 - 6y + 8$. Its derivative $3y^2 - 6$ is 0 at $y = \pm\sqrt2$, and only $\sqrt2$ lies in $[-1, 2]$. The values are $f(2, \sqrt2) = 2\sqrt2 - 6\sqrt2 + 8 = 8 - 4\sqrt2 \approx 2.343$ and, at the ends, $f(2, -1) = -1 + 6 + 8 = 13$ and $f(2, 2) = 8 - 12 + 8 = 4$.
- Bottom and top sides, by the symmetry: $-5$ at $(-1, -1)$ and $13$ at $(2, -1)$; $8 - 4\sqrt2$ at $(\sqrt2, 2)$, $13$ at $(-1, 2)$ and $4$ at $(2, 2)$.

**Step 3: compare.**

| Point | Where it comes from | $f$ |
|---|---|---|
| $(0, 0)$ | critical point, saddle | $0$ |
| $(1, 1)$ | critical point, local minimum | $-1$ |
| $(2, \sqrt2)$, $(\sqrt2, 2)$ | critical points of $f$ on a side | $8 - 4\sqrt2 \approx 2.343$ |
| $(-1, -1)$ | corner | $-5$ |
| $(2, -1)$, $(-1, 2)$ | corners | $13$ |
| $(2, 2)$ | corner | $4$ |

The absolute maximum value is 13, at $(2, -1)$ and at $(-1, 2)$; the absolute minimum value is $-5$, at the corner $(-1, -1)$. All three are corners, and the local minimum at $(1, 1)$ is not the absolute minimum on the square (Figure 18.2).

```check
same(f181.subs({x: y, y: x}, simultaneous=True), f181)
fL = f181.subs(x, -1); fR = f181.subs(x, 2)
same(expand(fL), y**3 + 3*y - 1); same(diff(fL, y), 3*y**2 + 3); holds(minimum(3*y**2 + 3, y, S.Reals) > 0)
same(minimum(fL, y, Interval(-1, 2)), -5); same(maximum(fL, y, Interval(-1, 2)), 13)
same(expand(fR), y**3 - 6*y + 8); same(diff(fR, y), 3*y**2 - 6); same_set(solve(3*y**2 - 6, y), [sqrt(2), -sqrt(2)])
holds(-sqrt(2) < -1); holds(sqrt(2) < 2)
steps(fR.subs(y, sqrt(2)), 2*sqrt(2) - 6*sqrt(2) + 8, 8 - 4*sqrt(2)); rounds(8 - 4*sqrt(2), '2.343')
same(minimum(fR, y, Interval(-1, 2)), 8 - 4*sqrt(2)); same(maximum(fR, y, Interval(-1, 2)), 13)
for (px, py), val in {(0, 0): 0, (1, 1): -1, (-1, -1): -5, (2, -1): 13, (-1, 2): 13, (2, 2): 4}.items():
    same(f181.subs({x: px, y: py}), val)
same(-1 + 6 + 8, 13); same(8 - 12 + 8, 4)
holds(max(0, -1, 8 - 4*sqrt(2), -5, 13, 4) == 13); holds(min(0, -1, 8 - 4*sqrt(2), -5, 13, 4) == -5)
```
:::

::: pitfall
Three slips. **Forgetting the ends of the boundary pieces**: in Example 18.4 both extreme values are at corners, which no derivative finds. **Classifying instead of comparing**: the local minimum $-1$ is not the smallest value on the square, and a saddle point can be a candidate too. **Keeping points outside the region**: $y = -\sqrt2$ solves $3y^2 - 6 = 0$, but $(2, -\sqrt2)$ is not on the square.
:::

## Lagrange multipliers {#lagrange}

Many problems ask for the best point of a curve or a surface: the largest rectangle that fits in an ellipse, the point of a curve closest to a given point, the box with the most volume for a given amount of cardboard. Their variables are tied by an equation $g(x, y) = c$, a **constraint**. Section 18.3 parametrised the boundary; that works when a parametrisation is easy to find. The method of this section works with the equation itself, and its picture explains every answer.

Take the largest rectangle, with sides parallel to the axes, inside the ellipse $\tfrac{x^2}{4} + y^2 = 1$. We can centre it at the origin: moving any such rectangle there decreases or preserves the largest absolute $x$-coordinate and the largest absolute $y$-coordinate of its corners, so it still fits and has the same area. Then enlarge it until its corners reach the ellipse. Thus we can take the corners to be $(\pm x, \pm y)$ with $(x, y)$ on the ellipse, $x \ge 0$ and $y \ge 0$, and its area is $A = (2x)(2y) = 4xy$. Numbers first. The points $(2\cos t, \sin t)$ lie on the ellipse, since $\tfrac{4\cos^2 t}{4} + \sin^2 t = 1$, and $0 \le t \le \tfrac{\pi}{2}$ gives the quarter in the first quadrant:

```valuetable
t = 0, pi/12, pi/6, pi/4, pi/3, 5*pi/12, pi/2
$x = 2\cos t$ = 2*cos(t)
$y = \sin t$ = sin(t)
$A = 4xy$ = 8*cos(t)*sin(t)
digits = 4
---
t | x = 2\cos t | y = \sin t | A = 4xy
0 | 2 | 0 | 0
\frac{\pi}{12} | 1.932 | 0.2588 | 2
\frac{\pi}{6} | 1.732 | 0.5 | 3.464
\frac{\pi}{4} | 1.414 | 0.7071 | 4
\frac{\pi}{3} | 1 | 0.8660 | 3.464
\frac{5 \pi}{12} | 0.5176 | 0.9659 | 2
\frac{\pi}{2} | 0 | 1 | 0
```

The largest area in the table is 4, at $t = \tfrac{\pi}{4}$, the point $\big(\sqrt2, \tfrac{\sqrt2}{2}\big) \approx (1.414, 0.7071)$. In fact $A = 8\cos t\sin t = 4\sin 2t$, whose largest value is 4.

```check
half_x, half_y = symbols('half_x half_y', positive=True)
off_x, off_y = symbols('off_x off_y', nonnegative=True)
holds((off_x + half_x)**2/4 + (off_y + half_y)**2 - half_x**2/4 - half_y**2 >= 0)  # recentering preserves feasibility
same((2*cos(t))**2/4 + sin(t)**2, 1); same(8*cos(t)*sin(t), 4*sin(2*t)); same(4*sin(2*(pi/4)), 4)
same(2*cos(pi/4), sqrt(2)); same(sin(pi/4), sqrt(2)/2); rounds(sqrt(2), '1.414'); rounds(sqrt(2)/2, '0.7071')
same(maximum(4*sin(2*t), t, Interval(0, pi/2)), 4)
```

Now the picture (Figure 18.3). For $k > 0$, the level curves of the area, $4xy = k$, are hyperbolas. When $0 < k < 4$ the level curve crosses the quarter of the ellipse twice: two rectangles in the ellipse have that area. As $k$ grows towards 4, the two crossing points move together, and at $k = 4$ they merge: the level curve **touches** the ellipse. For $k > 4$ it misses the ellipse altogether. Where the two curves touch they have the same tangent line, so the vectors perpendicular to them are parallel. The gradient of a differentiable function is perpendicular to its level curves where it is nonzero (Module 17), and the ellipse is the level curve $g = 1$ of $g(x, y) = \tfrac{x^2}{4} + y^2$. Both gradients are nonzero at the best point, so $\nabla A$ is parallel to $\nabla g$: $\nabla A = \lambda\nabla g$ for some number $\lambda$, read "lambda".

::: figure id=fig-18-3
The ellipse $\tfrac{x^2}{4} + y^2 = 1$ (green) and the level curves $A = 2$, $4$ and $6$ of the area $A = 4xy$. The level curve $A = 4$ (orange) touches the ellipse at $\big(\sqrt2, \tfrac{\sqrt2}{2}\big)$, a corner of the largest rectangle (shaded); there $\nabla A$ and $\nabla g$ point the same way, and $\nabla A$ is 4 times as long (both arrows are drawn at a quarter of their length). Where $A = 2$ crosses the ellipse, at $(2\cos 75^\circ, \sin 75^\circ)$, the gradients are not parallel, and moving along the ellipse towards the touching point increases $A$. $A = 6$ misses the ellipse.
:::

```check
xe_, ye_ = 2*cos(5*pi/12), sin(5*pi/12)                              # the point at t = 75 degrees
same(4*xe_*ye_, 2); same(xe_**2/4 + ye_**2, 1)
holds(diff(4*sin(2*t), t).subs(t, 5*pi/12) < 0)                    # A grows as t decreases towards 45 degrees
holds(Ne((4*ye_)*(2*ye_) - (4*xe_)*(xe_/2), 0))                     # grad A and grad g are not parallel there
gradA_ = Matrix([4*y, 4*x]).subs({x: sqrt(2), y: sqrt(2)/2}); gradg_ = Matrix([x/2, 2*y]).subs({x: sqrt(2), y: sqrt(2)/2})
same(gradA_, 4*gradg_)                                              # at the touching point, grad A = 4 grad g
same(maximum(4*sin(2*t), t, Interval(0, 2*pi)), 4); holds(Integer(6) > 4)   # the level curve A = 6 misses the ellipse
```

::: theorem Lagrange multipliers
Let $f$ and $g$ have continuous first partial derivatives near a point $(a, b)$ of the curve $g(x, y) = c$, and suppose that $\nabla g(a, b) \ne \vb{0}$. If $f$, restricted to the curve, has a local maximum or a local minimum at $(a, b)$ (that is, $f(a, b) \ge f(x, y)$, or $f(a, b) \le f(x, y)$, for every point $(x, y)$ of the curve in some disc centred at $(a, b)$), then there is a number $\lambda$ with

$$\nabla f(a, b) = \lambda\,\nabla g(a, b).$$
:::

::: proof
Since $\nabla g(a, b) \ne \vb{0}$, $g_x(a, b)$ or $g_y(a, b)$ is not 0; say $g_y(a, b) \ne 0$ (otherwise exchange the roles of $x$ and $y$). By the implicit function theorem of Module 17, applied to $g(x, y) - c$, near $(a, b)$ the points of the curve form the graph of a differentiable function $y = \varphi(x)$ with $\varphi(a) = b$. So for small $t$ the curve is traced by $\vb{r}(t) = \langle a + t, \varphi(a + t)\rangle$, with $\vb{r}(0) = \langle a, b\rangle$ and $\vb{r}'(0) = \langle 1, \varphi'(a)\rangle$.

The function $k(t) = f\big(\vb{r}(t)\big)$ has a local extremum at $t = 0$, so $k'(0) = 0$ by Fermat's theorem (Theorem 8.1), and by the chain rule (Module 17) $k'(0) = \nabla f(a, b) \cdot \vb{r}'(0)$. Also $g\big(\vb{r}(t)\big) = c$ for every $t$, and differentiating gives $\nabla g(a, b) \cdot \vb{r}'(0) = 0$. So both gradients are perpendicular to $\vb{r}'(0) = \langle 1, \varphi'(a)\rangle$. A vector $\langle u, v\rangle$ perpendicular to it has $u + \varphi'(a)v = 0$, so it is $v\langle -\varphi'(a), 1\rangle$: both gradients are multiples of $\langle -\varphi'(a), 1\rangle$, namely $\nabla f(a, b) = f_y(a, b)\langle -\varphi'(a), 1\rangle$ and $\nabla g(a, b) = g_y(a, b)\langle -\varphi'(a), 1\rangle$. Since $g_y(a, b) \ne 0$, $\nabla f(a, b) = \lambda\nabla g(a, b)$ with $\lambda = f_y(a, b)/g_y(a, b)$.
:::

The number $\lambda$ is a **Lagrange multiplier**. The same holds in three variables, with $f$ and $g$ again having continuous first partial derivatives near the point: if $f(x, y, z)$, restricted to the surface $g(x, y, z) = c$, has a local extremum at a point where $\nabla g \ne \vb{0}$, then $\nabla f = \lambda\nabla g$ there. The proof is the same, with the three-variable implicit function theorem, applied to every curve in the surface through the point: $\nabla f$ is perpendicular to all their tangent vectors, which fill the plane perpendicular to $\nabla g$, so $\nabla f$ is a multiple of $\nabla g$. The multiple can be 0: the theorem allows $\nabla f = \vb{0}$.

```check
uu_, vv2_, mphi = symbols('u v m')
same(solve(Matrix([uu_, vv2_]).dot(Matrix([1, mphi])), uu_), [-mphi*vv2_]); same(vv2_*Matrix([-mphi, 1]), Matrix([-mphi*vv2_, vv2_]))
fx_s, fy_s, gx_s, gy_s = symbols('f_x f_y g_x g_y')
same(solve(fx_s + fy_s*mphi, fx_s), [-fy_s*mphi]); same(Matrix([-fy_s*mphi, fy_s]), fy_s*Matrix([-mphi, 1]))   # grad f . <1, m> = 0
same((fy_s*Matrix([-mphi, 1])), (fy_s/gy_s)*(gy_s*Matrix([-mphi, 1])))                                       # so grad f = (f_y/g_y) grad g
gT_ = x**2 + 3*y**3 + y; phi1 = -diff(gT_, x)/diff(gT_, y)           # an instance: phi'(a) from implicit differentiation
same(Matrix([diff(gT_, x), diff(gT_, y)]).dot(Matrix([1, phi1])), 0); same(Matrix([diff(gT_, x), diff(gT_, y)]), diff(gT_, y)*Matrix([-phi1, 1]))
```

::: keyidea
**The method of Lagrange multipliers.** Suppose $f$ and $g$ have continuous first partial derivatives near the constraint curve. To find the extreme values of $f(x, y)$ subject to $g(x, y) = c$:

1. Solve the equations $f_x = \lambda g_x$, $f_y = \lambda g_y$ and $g(x, y) = c$ for $x$, $y$ and $\lambda$.
2. Add the points of the curve where $\nabla g = \vb{0}$, and the ends of the curve if it has ends.
3. Evaluate $f$ at all these points. If the curve is nonempty, closed and bounded, like a circle or an ellipse, the largest value is the maximum and the smallest the minimum (Theorem 18.3). Otherwise an extra argument must show that an extremum exists.

In three variables, solve $\nabla f = \lambda\nabla g$ and $g(x, y, z) = c$: four equations for $x$, $y$, $z$ and $\lambda$.
:::

::: widget name=lagrange
Choose $f$ and the constraint, and move the point along the curve with the slider or the arrow keys. Orange: $\nabla f$ and the level curve of $f$ through the point; green: $\nabla g$. Start with $xy$ on the ellipse: it is one-quarter of the rectangle area $A = 4xy$ in Example 18.5, so at its maximum the widget gives $\lambda = 1$, while the area's multiplier is 4. Find where the arrows line up and read off $\lambda$. The "nearly parallel" readout means the arrows are within $0.5^\circ$ of parallel; it gives an approximate multiplier and suggests a nearby candidate to locate exactly with algebra. Elsewhere the readout says which way $f$ changes as you move on: follow it to the maximum, then to the minimum. Then try $x^2 + 2y^2$ on the circle (Exercise 18.3), and $2x + y$ on the circle, whose maximum is not at a whole number of degrees.
:::

::: example The largest rectangle in an ellipse
Find the largest rectangle, with sides parallel to the axes, inside the ellipse $\tfrac{x^2}{4} + y^2 = 1$.

Maximise $A = 4xy$ subject to $g(x, y) = \tfrac{x^2}{4} + y^2 = 1$, where $(x, y)$ is the corner with $x \ge 0$ and $y \ge 0$. **A maximum exists.** The quarter of the ellipse in the first quadrant is closed and bounded, and $A$ is continuous, so $A$ has a largest value on it (Theorem 18.3). At the ends of the arc, $(2, 0)$ and $(0, 1)$, the rectangle is flat and $A = 0$, so the largest value is at a point with $x > 0$ and $y > 0$, where Theorem 18.5 applies: $\nabla g = \big\langle \tfrac{x}{2}, 2y\big\rangle$ is never $\vb{0}$ on the ellipse.

**The equations.** $\nabla A = \langle 4y, 4x\rangle$, so

$$4y = \lambda\frac{x}{2}, \quad 4x = 2\lambda y, \quad \frac{x^2}{4} + y^2 = 1.$$

With $x, y > 0$, the first two give $\lambda = \dfrac{8y}{x}$ and $\lambda = \dfrac{2x}{y}$. So $\dfrac{8y}{x} = \dfrac{2x}{y}$, that is, $8y^2 = 2x^2$, and $x = 2y$, since both are positive. The constraint becomes $\tfrac{4y^2}{4} + y^2 = 2y^2 = 1$, so $y = \tfrac{1}{\sqrt2} = \tfrac{\sqrt2}{2}$, $x = \sqrt2$ and $\lambda = \tfrac{2x}{y} = 4$.

**The answer.** The largest rectangle is $2\sqrt2$ by $\sqrt2$, with area $4 \cdot \sqrt2 \cdot \tfrac{\sqrt2}{2} = 4$, as the row $t = \tfrac{\pi}{4}$ of the table above suggested. The corner lies on the line $y = \tfrac{x}{2}$, the diagonal of the 4 by 2 rectangle around the ellipse, and the best rectangle has exactly half its area.

```check
xp_, yp_, lp_ = symbols('x y lambda', positive=True)
A185 = 4*xp_*yp_; g185 = xp_**2/4 + yp_**2
same(diff(A185, xp_), 4*yp_); same(diff(A185, yp_), 4*xp_); same(diff(g185, xp_), xp_/2); same(diff(g185, yp_), 2*yp_)
same(solve([4*yp_ - lp_*xp_/2, 4*xp_ - 2*lp_*yp_, g185 - 1], [xp_, yp_, lp_], dict=True), [{xp_: sqrt(2), yp_: sqrt(2)/2, lp_: 4}])
same(solve(Eq(8*yp_/xp_, 2*xp_/yp_), xp_), [2*yp_]); same(((2*yp_)**2/4 + yp_**2), 2*yp_**2)
same(A185.subs({xp_: sqrt(2), yp_: sqrt(2)/2}), 4); same(A185.subs({xp_: 2, yp_: 0}), 0); same(A185.subs({xp_: 0, yp_: 1}), 0)
same(4*2, 8); same(Rational(8, 2), 4)
same(Rational(1, 2)*sqrt(2), sqrt(2)/2); same(Rational(1, 2)*2, 1)     # (sqrt2, sqrt2/2) and the corner (2, 1) of the 4 by 2 rectangle lie on y = x/2
```
:::

::: example The closest point on a parabola, again
Find the point of the parabola $y = x^2$ closest to $(3, 0)$, the problem of [Example 8.15](module_08_EN.html#optimisation), with Lagrange multipliers.

Minimise the square of the distance, $D(x, y) = (x - 3)^2 + y^2$, subject to $g(x, y) = y - x^2 = 0$. Here $\nabla D = \langle 2(x - 3), 2y\rangle$ and $\nabla g = \langle -2x, 1\rangle$, which is never $\vb{0}$. The equations are

$$2(x - 3) = -2\lambda x, \quad 2y = \lambda, \quad y = x^2.$$

The last two give $\lambda = 2y = 2x^2$, and then the first becomes $2(x - 3) = -4x^3$, that is, $4x^3 + 2x - 6 = 2(2x^3 + x - 3) = 0$. As in Example 8.15, $2x^3 + x - 3 = (x - 1)(2x^2 + 2x + 3)$, and the quadratic factor has no real zero, so $x = 1$, $y = 1$ and $\lambda = 2$: one candidate, $(1, 1)$, at distance $\sqrt{D(1, 1)} = \sqrt{4 + 1} = \sqrt5 \approx 2.236$.

**It is the minimum.** The parabola is not bounded, so Theorem 18.3 needs help. Where $\abs{x} \ge 3$, $D \ge y^2 = x^4 \ge 81$, far more than $D(1, 1) = 5$. On the arc with $\abs{x} \le 3$, which is closed and bounded, $D$ has a smallest value, at most 5, so not at the ends of the arc, where $D \ge 81$. That point is a local minimum of $D$ on the parabola, so it solves the equations: it is $(1, 1)$, and $D(1, 1) = 5$ is the smallest value on the whole parabola.

**The picture.** $\nabla D = 2\langle x - 3, y\rangle$ is twice the vector from $(3, 0)$ to the point $(x, y)$, and $\nabla g$ is perpendicular to the parabola. So $\nabla D = \lambda\nabla g$ says that the segment from $(3, 0)$ to the closest point is perpendicular to the curve: the check at the end of Example 8.15, which the method now explains.

```check
D186 = (x - 3)**2 + y**2; g186 = y - x**2
same(diff(D186, x), 2*(x - 3)); same(diff(D186, y), 2*y); same(diff(g186, x), -2*x); same(diff(g186, y), 1)
xr6, yr6, lr6 = symbols('x y lambda', real=True)
same(solve([2*(xr6 - 3) + 2*lr6*xr6, 2*yr6 - lr6, yr6 - xr6**2], [xr6, yr6, lr6], dict=True), [{xr6: 1, yr6: 1, lr6: 2}])
steps(2*(x - 3) + 4*x**3, 4*x**3 + 2*x - 6, 2*(2*x**3 + x - 3), 2*(x - 1)*(2*x**2 + 2*x + 3)); same(discriminant(2*x**2 + 2*x + 3, x), -20)
same(D186.subs({x: 1, y: 1}), 5); same(sqrt(4 + 1), sqrt(5)); rounds(sqrt(5), '2.236')
same(D186.subs(y, x**2), x**4 + (x - 3)**2); holds(Integer(3)**4 == 81)
same(minimum(D186.subs(y, x**2), x, Interval(-3, 3)), 5)
same(Matrix([2*(1 - 3), 2*1]), 2*Matrix([-2*1, 1]))                       # grad D = 2 grad g at (1, 1)
```
:::

::: example A box from a sheet of cardboard
An open box (with no lid) is to be made from 300 cm² of cardboard. Ignoring joins and waste, which dimensions give the largest volume?

Let the base be $x$ by $y$ and the height $z$, in centimetres. Maximise $V = xyz$ subject to $g(x, y, z) = xy + 2xz + 2yz = 300$ (the base and the four sides), with $x, y, z > 0$. Here $\nabla V = \langle yz, xz, xy\rangle$ and $\nabla g = \langle y + 2z,\ x + 2z,\ 2x + 2y\rangle$, which is nonzero for positive dimensions, so

$$\begin{aligned} yz &= \lambda(y + 2z), \\ xz &= \lambda(x + 2z), \\ xy &= \lambda(2x + 2y). \end{aligned}$$

Multiply the first equation by $x$, the second by $y$ and the third by $z$: all three left sides become $xyz$, so

$$\begin{aligned} \lambda(xy + 2xz) &= \lambda(xy + 2yz) \\ &= \lambda(2xz + 2yz). \end{aligned}$$

$\lambda \ne 0$, since $xyz > 0$; divide by it. The first equality gives $xz = yz$, so $x = y$; the second gives $xy = 2xz$, so $y = 2z$. So $x = y = 2z$, and the constraint becomes $4z^2 + 4z^2 + 4z^2 = 12z^2 = 300$: $z = 5$, $x = y = 10$, and $\lambda = \dfrac{yz}{y + 2z} = \dfrac{50}{20} = \dfrac52$. The volume is $10 \cdot 10 \cdot 5 = 500$ cm³.

**It is the maximum.** The surface $g = 300$ is not bounded, and Theorem 18.5 says only that a largest box, if there is one, has these dimensions. An inequality settles it: for positive numbers $p$, $q$ and $r$,

$$\frac{p + q + r}{3} \ge \sqrt[3]{pqr}, \quad\text{with equality only when } p = q = r,$$

the inequality of the arithmetic and geometric means, which Exercise 18.11 proves. With $p = xy$, $q = 2xz$ and $r = 2yz$, the sum is $p + q + r = 300$ and the product is $pqr = 4(xyz)^2 = 4V^2$. So $100 \ge \sqrt[3]{4V^2}$, that is, $4V^2 \le 100^3$, and $V \le 500$, with equality only when $xy = 2xz = 2yz$, which is the box found. The largest box is 10 cm by 10 cm, and 5 cm deep.

```check
xb, yb, zb, lb = symbols('x y z lambda', positive=True)
Vb = xb*yb*zb; gb = xb*yb + 2*xb*zb + 2*yb*zb
same([diff(Vb, s_) for s_ in (xb, yb, zb)], [yb*zb, xb*zb, xb*yb])
same([diff(gb, s_) for s_ in (xb, yb, zb)], [yb + 2*zb, xb + 2*zb, 2*xb + 2*yb])
holds(yb + 2*zb > 0); holds(xb + 2*zb > 0); holds(2*xb + 2*yb > 0)
same(solve([diff(Vb, s_) - lb*diff(gb, s_) for s_ in (xb, yb, zb)] + [gb - 300], [xb, yb, zb, lb], dict=True), [{xb: 10, yb: 10, zb: 5, lb: Rational(5, 2)}])
same(xb*(lb*(yb + 2*zb)), lb*(xb*yb + 2*xb*zb)); same(yb*(lb*(xb + 2*zb)), lb*(xb*yb + 2*yb*zb)); same(zb*(lb*(2*xb + 2*yb)), lb*(2*xb*zb + 2*yb*zb))
same(gb.subs({xb: 2*zb, yb: 2*zb}), 12*zb**2); same(solve(12*zb**2 - 300, zb), [5])
same(Rational(10*5, 10 + 2*5), Rational(5, 2)); same(10*10*5, 500)
same((xb*yb)*(2*xb*zb)*(2*yb*zb), 4*(xb*yb*zb)**2)
Vpos = symbols('V', positive=True); same(solve(4*Vpos**2 - 100**3, Vpos), [500])   # 4V^2 = 100^3 gives V = 500
same(Rational(300, 3), 100)
same((10*10, 2*10*5, 2*10*5), (100, 100, 100))
```
:::

::: pitfall
Three slips with Lagrange multipliers. **Dividing by a variable that can be 0**: in $2x = 2\lambda x$, cancelling $x$ to get $\lambda = 1$ loses every candidate with $x = 0$ (Exercise 18.3); write $x(1 - \lambda) = 0$ instead. **Forgetting the points where $\nabla g = \vb{0}$**: on the curve $y^2 = x^3$, the function $f = x$ is smallest at the origin, since $x = \sqrt[3]{y^2} \ge 0$ on the curve; but there $\nabla g = \langle -3x^2, 2y\rangle$ is $\vb{0}$, and the equations $1 = -3\lambda x^2$, $0 = 2\lambda y$, $y^2 = x^3$ have no solution at all. **Taking a candidate for an extremum without an argument**: on the branch of the hyperbola $xy = 1$ with $x > 0$, $f = x + y$ has the single candidate $(1, 1)$, where $f = 2$. It is the minimum, since $x + \tfrac1x - 2 = \tfrac{(x - 1)^2}{x} \ge 0$, but there is no maximum: $f \to \infty$ as $x \to \infty$.
:::

```check
xr7, yr7, lr7 = symbols('x y lambda', real=True)
same(solve([1 + 3*lr7*xr7**2, 2*lr7*yr7, yr7**2 - xr7**3], [xr7, yr7, lr7], dict=True), [])
same(Matrix([diff(y**2 - x**3, x), diff(y**2 - x**3, y)]).subs({x: 0, y: 0}), Matrix([0, 0]))
same(solve([1 - lr7*yr7, 1 - lr7*xr7, xr7*yr7 - 1], [xr7, yr7, lr7], dict=True), [{xr7: -1, yr7: -1, lr7: -1}, {xr7: 1, yr7: 1, lr7: 1}])
same(solve([1 - lp_*yp_, 1 - lp_*xp_, xp_*yp_ - 1], [xp_, yp_, lp_], dict=True), [{xp_: 1, yp_: 1, lp_: 1}])
holds((xp_ - 1)**2/xp_ >= 0)
same(x + 1/x - 2, (x - 1)**2/x); limit_is(x + 1/x, x, oo, oo)
```

:::: deeper What the multiplier measures
In the examples, $\lambda$ was found and then forgotten. It has a meaning. Let $M(c)$ be the largest value of $f$ on the curve $g = c$, taken at a point $\big(x(c), y(c)\big)$ with multiplier $\lambda(c)$. Suppose that this family is defined for $c$ in an open interval, that $x(c)$ and $y(c)$ are differentiable there, and that $f$ and $g$ have continuous first partial derivatives near these points. Then

$$M'(c) = \lambda(c).$$

Indeed $M(c) = f\big(x(c), y(c)\big)$, and by the chain rule and the Lagrange equations

$$\begin{aligned} M'(c) &= f_x x' + f_y y' = \lambda\,(g_x x' + g_y y') \\ &= \lambda\,\frac{d}{dc}\,g\big(x(c), y(c)\big) = \lambda\,\frac{d}{dc}\,c = \lambda. \end{aligned}$$

The same argument works for the smallest value. So $\lambda$ is the rate at which the best value changes as the constraint level changes: if $c$ is a budget, $\lambda$ is about what one more unit of budget is worth at the optimum, provided that unit is small enough for the linear approximation. Economists call it a **shadow price**.

For the rectangle in the ellipse $\tfrac{x^2}{4} + y^2 = c$ with $c > 0$, the steps of Example 18.5 give the corner $\big(\sqrt{2c}, \sqrt{c/2}\big)$ and the largest area $M(c) = 4c$, so $M'(c) = 4$: the $\lambda = 4$ found there. For the box with $A$ cm² of cardboard, where $A > 0$, they give $x = y = 2z$ with $12z^2 = A$, so the largest volume is $V(A) = 4z^3 = 4\big(\tfrac{A}{12}\big)^{3/2}$, and $V'(A) = \tfrac12\big(\tfrac{A}{12}\big)^{1/2} = \tfrac{z}{2}$, which at $A = 300$ is $\tfrac52$: the multiplier of Example 18.7. Each extra cm² of cardboard adds about 2.5 cm³ of volume, near this size.

```check
cc_ = symbols('c', positive=True)
same(solve([4*yp_ - lp_*xp_/2, 4*xp_ - 2*lp_*yp_, xp_**2/4 + yp_**2 - cc_], [xp_, yp_, lp_], dict=True), [{xp_: sqrt(2*cc_), yp_: sqrt(cc_/2), lp_: 4}])
same(4*sqrt(2*cc_)*sqrt(cc_/2), 4*cc_); same(diff(4*cc_, cc_), 4)
Ab = symbols('A', positive=True)
zA = sqrt(Ab/12); VA = 4*zA**3
same((2*zA)*(2*zA) + 2*(2*zA)*zA + 2*(2*zA)*zA, Ab); same(VA, 4*(Ab/12)**Rational(3, 2))
same(diff(VA, Ab), Rational(1, 2)*(Ab/12)**Rational(1, 2)); same(diff(VA, Ab), zA/2); same(diff(VA, Ab).subs(Ab, 300), Rational(5, 2))
same(VA.subs(Ab, 300), 500)
fx_, fy_, gx_, gy_, xd, yd, lam_ = symbols('f_x f_y g_x g_y xd yd lambda')
same((lam_*gx_)*xd + (lam_*gy_)*yd, lam_*(gx_*xd + gy_*yd))
```
::::

### Two constraints {#two-constraints}

Suppose that $f$, $g$ and $h$ have continuous first partial derivatives near a point where $g(x, y, z) = c$ and $h(x, y, z) = d$. To find extreme values of $f$ on their intersection, add a second multiplier $\mu$, read "mu": at a constrained local extremum,

$$\nabla f = \lambda\,\nabla g + \mu\,\nabla h,$$

provided $\nabla g$ and $\nabla h$ are not parallel there (and neither is $\vb{0}$). These hypotheses ensure that the intersection is locally a differentiable curve with a nonzero tangent vector, by a version of the implicit function theorem of Module 17. The reason for the multiplier equation is the same as before. The curve lies in both surfaces, so its tangent vector $\vb{T}$ is perpendicular to $\nabla g$ and to $\nabla h$; and at an extremum $\nabla f$ is perpendicular to $\vb{T}$ too. The vectors perpendicular to $\vb{T}$ form a plane, and two non-parallel vectors in it, $\nabla g$ and $\nabla h$, combine to give every vector of the plane, $\nabla f$ included. With the two constraints, that makes five equations for $x$, $y$, $z$, $\lambda$ and $\mu$.

::: example The highest point of a tilted circle
The plane $x + y + z = 0$ meets the sphere $x^2 + y^2 + z^2 = 6$ in a circle. Find its highest and lowest points.

Maximise and minimise $f = z$ subject to $g = x + y + z = 0$ and $h = x^2 + y^2 + z^2 = 6$. The equations $\langle 0, 0, 1\rangle = \lambda\langle 1, 1, 1\rangle + \mu\langle 2x, 2y, 2z\rangle$ are

$$\begin{aligned} 0 &= \lambda + 2\mu x, \\ 0 &= \lambda + 2\mu y, \\ 1 &= \lambda + 2\mu z, \end{aligned}$$

with the two constraints. Subtracting the first two gives $2\mu(x - y) = 0$. If $\mu = 0$, the first gives $\lambda = 0$, and then the third says $1 = 0$, which is impossible; so $x = y$. The plane then gives $z = -2x$, and the sphere $x^2 + x^2 + 4x^2 = 6$, so $x = \pm1$. The candidates are $(1, 1, -2)$ and $(-1, -1, 2)$, with $\lambda = \tfrac13$ and $\mu = \mp\tfrac16$. The gradients $\langle 1, 1, 1\rangle$ and $\langle 2x, 2y, 2z\rangle$ are parallel only where $x = y = z$, which on the plane means the origin, not on the sphere; so the method applies everywhere on the circle. The circle is closed and bounded, so $f$ has a largest and a smallest value on it (the Extreme Value Theorem in three variables), and they are among the candidates: the highest point is $(-1, -1, 2)$ and the lowest is $(1, 1, -2)$.

```check
xr8, yr8, zr8, lr8, mr8 = symbols('x y z lambda mu', real=True)
eq8 = [0 - lr8 - 2*mr8*xr8, 0 - lr8 - 2*mr8*yr8, 1 - lr8 - 2*mr8*zr8, xr8 + yr8 + zr8, xr8**2 + yr8**2 + zr8**2 - 6]
same_set(solve(eq8, [xr8, yr8, zr8, lr8, mr8], dict=True),
         [{xr8: 1, yr8: 1, zr8: -2, lr8: Rational(1, 3), mr8: -Rational(1, 6)}, {xr8: -1, yr8: -1, zr8: 2, lr8: Rational(1, 3), mr8: Rational(1, 6)}])
same((lr8 + 2*mr8*xr8) - (lr8 + 2*mr8*yr8), 2*mr8*(xr8 - yr8))
same(solve(x**2 + x**2 + 4*x**2 - 6, x), [-1, 1])
same(Matrix([1, 1, 1]).cross(Matrix([2*x, 2*y, 2*z])), Matrix([2*z - 2*y, 2*x - 2*z, 2*y - 2*x]))
same((2*z - 2*y)**2 + (2*x - 2*z)**2 + (2*y - 2*x)**2, 12*(x**2 + y**2 + z**2) - 4*(x + y + z)**2)
same(12*6 - 4*0**2, 72); holds(72 > 0)                         # the gradients are independent everywhere on the circle
```
:::

::: compute Lagrange systems with SymPy
`solve` handles the systems of this section. Declaring the dimensions positive keeps only the boxes that can be built; the multiplier is left real:

```python
import sympy as sp
x, y, z = sp.symbols('x y z', positive=True)
lam = sp.symbols('lambda', real=True)
V = x*y*z                                   # the open box of Example 18.7
g = x*y + 2*x*z + 2*y*z
eqs = [sp.diff(V, s) - lam*sp.diff(g, s) for s in (x, y, z)] + [g - 300]
print(sp.solve(eqs, [x, y, z, lam], dict=True))
```

```output
[{lambda: 5/2, x: 10, y: 10, z: 5}]
```

With two constraints there are two multipliers; here the unknowns are real, of either sign:

```python
x, y, z, lam, mu = sp.symbols('x y z lambda mu', real=True)
f, g, h = z, x + y + z, x**2 + y**2 + z**2   # Example 18.8
eqs = [sp.diff(f, s) - lam*sp.diff(g, s) - mu*sp.diff(h, s) for s in (x, y, z)]
eqs += [g, h - 6]
for sol in sp.solve(eqs, [x, y, z, lam, mu], dict=True):
    print(sol, ' f =', f.subs(sol))
```

```output
{lambda: 1/3, mu: -1/6, x: 1, y: 1, z: -2}  f = -2
{lambda: 1/3, mu: 1/6, x: -1, y: -1, z: 2}  f = 2
```

`solve` finds the candidates; deciding which is the maximum, and whether a maximum exists, is still your job.
:::

## Least squares {#least-squares}

Data from an experiment or a log file often lie roughly along a line, and you want the line that fits them best. Suppose, hypothetically, that five measurements give the points $(0, 1)$, $(1, 4)$, $(2, 3)$, $(3, 6)$ and $(4, 6)$ (made-up numbers). No line passes through all five. For a line $y = mx + b$, the **residual**, or error, of the point $(x_i, y_i)$ is

$$e_i = y_i - (mx_i + b),$$

the vertical distance, with a sign, from the line up to the point. One number measures how badly the line misses all the points at once: the **sum of squared errors**

$$E(m, b) = \sum_{i=1}^{n}\big(y_i - mx_i - b\big)^2.$$

Here the data are fixed numbers, and the unknowns are the slope $m$ and the intercept $b$: $E$ is a function of two variables.

::: definition Least-squares line
A **least-squares line**, or **regression line**, of a nonempty finite collection of data points $(x_1, y_1), \dots, (x_n, y_n)$ is a line $y = mx + b$ whose slope and intercept minimise the sum of squared errors $E(m, b)$. The next theorem gives the condition for this line to be unique.
:::

Squares, rather than absolute values of the errors, make $E$ a smooth function of $m$ and $b$, so that calculus applies; a large error can outweigh several smaller ones, which matters when the data contain a wild value. Mathematical Foundations' [least squares module](../math/module_12_EN.html) treats the same problem with vectors and projections; here partial derivatives find the answer.

::: theorem The normal equations
Let $(x_1, y_1), \dots, (x_n, y_n)$ be data points with at least two different $x_i$. Then $E(m, b)$ has exactly one critical point, the solution of the **normal equations**

$$\begin{aligned} \Big(\sum x_i^2\Big)m + \Big(\sum x_i\Big)b &= \sum x_iy_i, \\ \Big(\sum x_i\Big)m + nb &= \sum y_i, \end{aligned}$$

and $E$ takes its absolute minimum value there, and nowhere else. (Each sum runs over $i = 1, \dots, n$.)
:::

::: proof
**The critical point.** $E$ is a polynomial in $m$ and $b$. By the chain rule,

$$\begin{aligned} \frac{\partial E}{\partial m} &= -2\sum x_i\big(y_i - mx_i - b\big), \\ \frac{\partial E}{\partial b} &= -2\sum\big(y_i - mx_i - b\big). \end{aligned}$$

Setting both to 0 and moving the terms with $m$ and $b$ to the left gives the normal equations. To solve them, let $\bar x = \tfrac1n\sum x_i$ and $\bar y = \tfrac1n\sum y_i$ be the means, read "x bar" and "y bar". The second equation divided by $n$ says $b = \bar y - m\bar x$. Substituting this into the first gives

$$\Big(\sum x_i^2 - n\bar x^2\Big)m = \sum x_iy_i - n\bar x\bar y.$$

Expanding the square shows that $\sum (x_i - \bar x)^2 = \sum x_i^2 - 2\bar x\sum x_i + n\bar x^2 = \sum x_i^2 - n\bar x^2$, and this is positive, because not every $x_i$ equals $\bar x$. So $m$ is determined, then $b$: exactly one solution $(m^*, b^*)$.

**The minimum.** Let $e_i = y_i - m^*x_i - b^*$ be the residuals of this line. The normal equations say exactly that $\sum e_i = 0$ and $\sum x_ie_i = 0$. For any other line, with $m = m^* + p$ and $b = b^* + q$,

$$\begin{aligned} &E(m^* + p, b^* + q) \\ &\quad= \sum\big(e_i - px_i - q\big)^2 \\ &\quad= \sum e_i^2 - 2p\sum x_ie_i - 2q\sum e_i \\ &\qquad + \sum\big(px_i + q\big)^2 \\ &\quad= E(m^*, b^*) + \sum\big(px_i + q\big)^2. \end{aligned}$$

The last sum is never negative, and it is 0 only when $px_i + q = 0$ for every $i$; for two different $x_i$ that forces $p = q = 0$.
:::

So the least-squares line passes through the **mean point** $(\bar x, \bar y)$, and its slope is

$$m = \frac{\sum x_iy_i - n\bar x\bar y}{\sum x_i^2 - n\bar x^2}.$$

```check
X5 = symbols('x1:5'); Y5 = symbols('y1:5'); nn = 4
xbar = sum(X5)/nn; ybar = sum(Y5)/nn
E5 = sum((Y5[i] - m*X5[i] - b)**2 for i in range(nn))
same(diff(E5, m), -2*sum(X5[i]*(Y5[i] - m*X5[i] - b) for i in range(nn))); same(diff(E5, b), -2*sum(Y5[i] - m*X5[i] - b for i in range(nn)))
same(sum((X5[i] - xbar)**2 for i in range(nn)), sum(X5[i]**2 for i in range(nn)) - nn*xbar**2)
sol5 = solve([diff(E5, m), diff(E5, b)], [m, b], dict=True)[0]
same(sol5[b], ybar - sol5[m]*xbar)
same(sol5[m], (sum(X5[i]*Y5[i] for i in range(nn)) - nn*xbar*ybar)/(sum(X5[i]**2 for i in range(nn)) - nn*xbar**2))
e_ = symbols('e1:5'); p, q = symbols('p q')
same(expand(sum((e_[i] - p*X5[i] - q)**2 for i in range(nn))), expand(sum(e_[i]**2 for i in range(nn)) - 2*p*sum(X5[i]*e_[i] for i in range(nn)) - 2*q*sum(e_) + sum((p*X5[i] + q)**2 for i in range(nn))))
```

::: example Fitting a line to five points
Find the least-squares line of the points $(0, 1)$, $(1, 4)$, $(2, 3)$, $(3, 6)$ and $(4, 6)$, its residuals and $E$.

The sums: $n = 5$, $\sum x_i = 10$, $\sum x_i^2 = 0 + 1 + 4 + 9 + 16 = 30$, $\sum y_i = 20$ and $\sum x_iy_i = 0 + 4 + 6 + 18 + 24 = 52$. The normal equations are

$$30m + 10b = 52, \qquad 10m + 5b = 20.$$

Subtract twice the second from the first: $10m = 12$, so $m = 1.2$, and then $5b = 20 - 12$ gives $b = 1.6$. The least-squares line is

$$y = 1.2x + 1.6.$$

It passes through the mean point $(\bar x, \bar y) = (2, 4)$. At $x = 0, 1, 2, 3, 4$ the line gives $1.6$, $2.8$, $4.0$, $5.2$ and $6.4$, so the residuals are $-0.6$, $1.2$, $-1.0$, $0.8$ and $-0.4$. They add up to 0, and so do their products with the $x_i$, $0 + 1.2 - 2.0 + 2.4 - 1.6 = 0$, as the normal equations promise. Finally

$$E(1.2, 1.6) = 0.36 + 1.44 + 1.00 + 0.64 + 0.16 = 3.6,$$

and every other line has a larger sum of squared errors. Figure 18.4 shows the line and its residuals.

```check
X9 = [0, 1, 2, 3, 4]; Y9 = [1, 4, 3, 6, 6]
E9 = sum((yi - m*xi - b)**2 for xi, yi in zip(X9, Y9))
same([len(X9), sum(X9), sum(xi**2 for xi in X9), sum(Y9), sum(xi*yi for xi, yi in zip(X9, Y9))], [5, 10, 30, 20, 52])
same(solve([diff(E9, m), diff(E9, b)], [m, b], dict=True), [{m: Rational(6, 5), b: Rational(8, 5)}])
same(solve([30*m + 10*b - 52, 10*m + 5*b - 20], [m, b], dict=True), [{m: Rational(6, 5), b: Rational(8, 5)}])
same((30*m + 10*b) - 2*(10*m + 5*b), 10*m); same(52 - 2*20, 12)
res9 = [yi - Rational(6, 5)*xi - Rational(8, 5) for xi, yi in zip(X9, Y9)]
same([Rational(6, 5)*xi + Rational(8, 5) for xi in X9], [Rational(8, 5), Rational(14, 5), 4, Rational(26, 5), Rational(32, 5)])
same(res9, [-Rational(3, 5), Rational(6, 5), -1, Rational(4, 5), -Rational(2, 5)]); same(sum(res9), 0); same(sum(xi*ei for xi, ei in zip(X9, res9)), 0)
same(E9.subs({m: Rational(6, 5), b: Rational(8, 5)}), Rational(18, 5)); same(Rational(6, 5)*2 + Rational(8, 5), 4)
same([r_**2 for r_ in res9], [Rational(36, 100), Rational(144, 100), 1, Rational(64, 100), Rational(16, 100)]); same(sum(r_**2 for r_ in res9), Rational(36, 10))
same(sum(Y9)/Integer(5), 4); same(sum(X9)/Integer(5), 2)
```
:::

::: figure id=fig-18-4
The least-squares line $y = 1.2x + 1.6$ of Example 18.9 and its residuals (orange): the vertical errors $-0.6$, $1.2$, $-1.0$, $0.8$ and $-0.4$, whose squares add up to $3.6$, less than for any other line.
:::

::: compute Least squares with NumPy
The normal equations are two linear equations for $m$ and $b$, and `np.linalg.solve` solves them. NumPy also has a ready-made fit, `np.polyfit`:

```python
import numpy as np
xs = np.array([0, 1, 2, 3, 4])
ys = np.array([1, 4, 3, 6, 6])
n = len(xs)
A = np.array([[np.sum(xs**2), np.sum(xs)],
              [np.sum(xs),    n]])
rhs = np.array([np.sum(xs*ys), np.sum(ys)])
m, b = np.linalg.solve(A, rhs)               # the normal equations
print(f"normal equations: m = {m:.4f}, b = {b:.4f}")
print("np.polyfit:", np.polyfit(xs, ys, 1))
e = ys - (m*xs + b)
print("residuals:", np.round(e, 4), " E =", round(float(np.sum(e**2)), 4))
```

```output
normal equations: m = 1.2000, b = 1.6000
np.polyfit: [1.2 1.6]
residuals: [-0.6  1.2 -1.   0.8 -0.4]  E = 3.6
```

`np.polyfit(xs, ys, 1)` fits a polynomial of degree 1 and returns its coefficients highest power first, $[m, b]$, here as floating-point numbers. With degree 2 it fits $y = ax^2 + bx + c$ by least squares; the minimiser satisfies three normal equations and is unique when there are at least three distinct input values. The fitted coefficient $a$ can be 0, so the result need not be a parabola. The numerical routine solves a scaled least-squares system rather than forming these normal equations. NumPy recommends `numpy.polynomial.Polynomial.fit` for new code because it is more stable numerically.
:::

::: pitfall
Three slips with least squares. **Expecting the line to treat $x$ and $y$ alike**: it minimises vertical errors. Fitting $x$ as a function of $y$ to the data of Example 18.9 gives $x = \tfrac23y - \tfrac23$, that is, $y = 1.5x + 1$, a different line (both pass through the mean point). **Forgetting the condition**: if every $x_i$ equals the same number $a$, only the fitted value $ma + b$ is determined. It must equal $\bar y$, so infinitely many pairs with $b = \bar y - ma$ minimise $E$. **Trusting a fit blindly**: a least-squares fit exists for every nonempty finite data set, even data that follow a curve. A pattern in the residuals, such as positive at both ends and negative in the middle, suggests that a line is a poor model; it is evidence, not proof, because measurements can contain noise.
:::

```check
E9x = sum((xi - m*yi - b)**2 for xi, yi in zip(X9, Y9))
same(solve([diff(E9x, m), diff(E9x, b)], [m, b], dict=True), [{m: Rational(2, 3), b: -Rational(2, 3)}])
same(solve(Eq(x, Rational(2, 3)*y - Rational(2, 3)), y), [Rational(3, 2)*x + 1]); same(Rational(3, 2)*2 + 1, 4)
E3c = sum((7 - m*3 - b)**2 for _ in range(3))
same(hessian(E3c, (m, b)).det(), 0)                                          # equal x values: no unique solution
same(E3c.subs(b, 7 - 3*m), 0)
same([diff(E3c, v_).subs(b, 7 - 3*m) for v_ in (m, b)], [0, 0])
```

## Gradient descent: step size and conditioning {#gradient-descent}

Solving $\nabla f = \vb{0}$ by algebra works only for simple functions. A machine-learning model may have millions of parameters, and training often seeks smaller loss by gradient descent, met in one variable in [Module 8](module_08_EN.html#gradient-descent) and in two in [Module 17](module_17_EN.html#gradient-descent). For a differentiable function $f$, from a starting point $\vb{x}_0$, with a step size $\eta > 0$ ("eta"),

$$\vb{x}_{k+1} = \vb{x}_k - \eta\,\nabla f(\vb{x}_k), \qquad k = 0, 1, 2, \dots,$$

where $\vb{x}_k = \langle x_k, y_k\rangle$, and each new point must stay in the domain. A nonzero gradient gives the direction of fastest decrease through $-\nabla f$, but a finite step can still increase $f$ if it is too large. [Example 8.18](module_08_EN.html#gradient-descent) showed that on the parabola $\tfrac q2x^2$, with $q > 0$, convergence to the minimum from every starting point holds exactly when $0 < \eta < 2/q$. In two variables a bowl can curve more steeply in one direction than in another, and that affects the choice of step size.

::: example Gradient descent in a long valley
Run gradient descent on $f(x, y) = \tfrac12(x^2 + 10y^2)$ from $(-6, 2.5)$ with step size $\eta = 0.18$.

$\nabla f = \langle x, 10y\rangle$, so one step is

$$\begin{aligned} x_{k+1} &= x_k - 0.18x_k = 0.82\,x_k, \\ y_{k+1} &= y_k - 1.8\,y_k = -0.8\,y_k. \end{aligned}$$

The two coordinates evolve separately: $x_k = -6(0.82)^k$ and $y_k = 2.5(-0.8)^k$. The table shows the points and the values of $f$ there:

```valuetable
k = 0, 1, 2, 3, 4, 5, 10, 20
$x_k$ = -6*(41/50)**k
$y_k$ = (5/2)*(-4/5)**k
$f$ = ((-6*(41/50)**k)**2 + 10*((5/2)*(-4/5)**k)**2)/2
digits = 4
---
k | x_k | y_k | f
0 | -6 | 2.5 | 49.25
1 | -4.92 | -2 | 32.10
2 | -4.034 | 1.6 | 20.94
3 | -3.308 | -1.28 | 13.66
4 | -2.713 | 1.024 | 8.922
5 | -2.224 | -0.8192 | 5.830
10 | -0.8247 | 0.2684 | 0.7003
20 | -0.1134 | 0.02882 | 0.01058
```

The $x$-coordinate creeps towards 0, losing 18% of its magnitude each step. The $y$-coordinate overshoots every time: it changes sign at each step, and its magnitude shrinks by only 20%. The path zigzags across the valley while it drifts slowly along it (Figure 18.5, left); after 20 steps $f$ has fallen from 49.25 to about 0.0106.

```check
fb18 = (x**2 + 10*y**2)/2
same(diff(fb18, x), x); same(diff(fb18, y), 10*y)
same(x - Rational(18, 100)*diff(fb18, x), Rational(82, 100)*x); same(y - Rational(18, 100)*diff(fb18, y), -Rational(8, 10)*y)
pk = [(Integer(-6), Rational(5, 2))]
for _ in range(20):
    px_, py_ = pk[-1]; pk.append((px_ - Rational(18, 100)*px_, py_ - Rational(18, 100)*10*py_))
same([pk[j] for j in (0, 1, 2, 3, 20)], [(-6*Rational(41, 50)**j, Rational(5, 2)*(-Rational(4, 5))**j) for j in (0, 1, 2, 3, 20)])
rounds(fb18.subs({x: pk[20][0], y: pk[20][1]}), '0.0106'); same(fb18.subs({x: -6, y: Rational(5, 2)}), Rational(197, 4)); rounds(Rational(197, 4), '49.25')
```
:::

::: figure id=fig-18-5
Left: gradient descent on $f(x, y) = \tfrac12(x^2 + 10y^2)$ from $(-6, 2.5)$ with $\eta = 0.18$, over the level curves of $f$. Each step is perpendicular to the level curve it leaves, so on these long ellipses it points mostly across the valley: the path zigzags. Right: the same function in the coordinates $x$ and $v = \sqrt{10}\,y$, where it is $\tfrac12(x^2 + v^2)$ and its level curves are circles. Now every step points straight at the minimum; with $\eta = 0.5$ each step halves the distance, and $\eta = 1$ would reach the minimum in one step.
:::

::: theorem Gradient descent on a quadratic bowl
Let $f(x, y) = \tfrac12(ax^2 + cy^2)$ with $0 < a \le c$. Gradient descent with step size $\eta > 0$ converges to the minimum $(0, 0)$ from every starting point exactly when $\eta < \dfrac{2}{c}$.
:::

::: proof
$\nabla f = \langle ax, cy\rangle$, so $x_{k+1} = (1 - \eta a)x_k$ and $y_{k+1} = (1 - \eta c)y_k$, and therefore $x_k = (1 - \eta a)^kx_0$ and $y_k = (1 - \eta c)^ky_0$. As in Example 8.18, the powers $r^k$ of a number $r$ tend to 0 exactly when $\abs{r} < 1$. To converge from every start, including starts with $x_0 \ne 0$ and $y_0 \ne 0$, gradient descent needs $\abs{1 - \eta a} < 1$ and $\abs{1 - \eta c} < 1$, that is, $0 < \eta < 2/a$ and $0 < \eta < 2/c$. Since $a \le c$, $2/c \le 2/a$, and the two conditions together say $0 < \eta < 2/c$.
:::

```check
ab_, cb_, eb_ = symbols('a c eta', positive=True); x0b, y0b = symbols('x_0 y_0')
fab = (ab_*x**2 + cb_*y**2)/2
same(diff(fab, x), ab_*x); same(diff(fab, y), cb_*y)
pts_ = [(x0b, y0b)]
for _ in range(4):
    px_, py_ = pts_[-1]; pts_.append((px_ - eb_*ab_*px_, py_ - eb_*cb_*py_))
same(pts_[4], ((1 - eb_*ab_)**4*x0b, (1 - eb_*cb_)**4*y0b))
er_ = symbols('eta', real=True)
for cv_ in (1, 10, 25):
    same(solve_univariate_inequality(Abs(1 - cv_*er_) < 1, er_, relational=False), Interval.open(0, Rational(2, cv_)))
    for e_ in (Rational(-1, 10), 0, Rational(1, 10*cv_), Rational(1, cv_), Rational(19, 10*cv_), Rational(2, cv_), Rational(21, 10*cv_), 1 + Rational(2, cv_)):
        holds(bool(Abs(1 - cv_*e_) < 1) == bool(0 < e_ < Rational(2, cv_)))   # a point in each piece, and the ends
```

### Ill-conditioning {#ill-conditioning}

Theorem 18.7 says that convergence from every starting point requires $\eta < 2/c$, where $c$ is the larger curvature. In the flatter direction, with curvature $a$, the factor $1 - \eta a$ is then more than $1 - 2a/c$, which is close to 1 when $c$ is much larger than $a$: a nonzero coordinate in that direction creeps towards 0. To minimise the larger of the two coordinate factors in magnitude, the best fixed step is $\eta^* = \dfrac{2}{a + c}$, which makes the two factors equal in size:

$$1 - \eta^*a = \frac{c - a}{c + a}, \qquad 1 - \eta^*c = -\frac{c - a}{c + a}.$$

Exercise 18.10 shows that no other fixed step size makes that larger factor smaller. With $\kappa = c/a$, read "kappa", the **condition number** of the bowl, the factor is

$$\frac{c - a}{c + a} = \frac{\kappa - 1}{\kappa + 1}.$$

For the valley of Example 18.10, $\kappa = 10$: this best fixed step is $\eta^* = \tfrac{2}{11} \approx 0.18$, and with it each step shrinks both coordinates, in size, by the factor $\tfrac{9}{11} \approx 0.82$. When $\kappa$ is large the factor is close to 1, and gradient descent is slow: to reduce the distance from the minimum by a fixed factor, the number of steps with $\eta^*$ grows asymptotically in proportion to $\kappa$ (the Compute it box below counts them, and Exercise 18.10 explains why).

```check
same(1 - 2*ab_/(ab_ + cb_), (cb_ - ab_)/(cb_ + ab_)); same(1 - 2*cb_/(ab_ + cb_), -(cb_ - ab_)/(cb_ + ab_))
kp_ = symbols('kappa', positive=True)
same(((cb_ - ab_)/(cb_ + ab_)).subs(cb_, kp_*ab_), (kp_ - 1)/(kp_ + 1))
same(Rational(2, 1 + 10), Rational(2, 11)); rounds(Rational(2, 11), '0.18'); same((10 - 1)/Integer(10 + 1), Rational(9, 11)); rounds(Rational(9, 11), '0.82')
Cp_ = symbols('C', positive=True)
same(fab.subs({x: sqrt(2*Cp_/ab_), y: 0}), Cp_); same(fab.subs({x: 0, y: sqrt(2*Cp_/cb_)}), Cp_)
same(sqrt(2*Cp_/ab_)/sqrt(2*Cp_/cb_), sqrt(cb_/ab_))
limit_is((-1/log((kp_ - 1)/(kp_ + 1)))/kp_, kp_, oo, Rational(1, 2))
```

The picture explains it. For $C > 0$, the level curves $\tfrac12(ax^2 + cy^2) = C$ are ellipses with semi-axes $\sqrt{2C/a}$ and $\sqrt{2C/c}$, so they are $\sqrt\kappa$ times as long as they are wide. The gradient is perpendicular to the level curve through the point (Module 17), and often points across the valley rather than directly towards the minimum. A quadratic bowl with a large condition number, and hence long, thin elliptical level curves, is **ill-conditioned**. Gradient descent can zigzag on it, as in Figure 18.5, though smaller steps or a start on an axis need not zigzag.

### Rescaling {#rescaling}

The shape of the level curves depends on the variables you choose. Put $v = \sqrt{10}\,y$ in Example 18.10: then $f = \tfrac12(x^2 + v^2)$, whose level curves in the $(x, v)$ plane are circles, with $\kappa = 1$. Its gradient is $\langle x, v\rangle$, which points straight away from the minimum, and gradient descent in $x$ and $v$ with $\eta = 1$ gives $(x, v) - \langle x, v\rangle = (0, 0)$: the minimum in one step (Figure 18.5, right). In terms of the original variables, the new method divides each partial derivative by the curvature in its direction before stepping.

```check
vv_ = symbols('v')
same(fb18.subs(y, vv_/sqrt(10)), (x**2 + vv_**2)/2)
same(Matrix([x, vv_]) - 1*Matrix([diff((x**2 + vv_**2)/2, x), diff((x**2 + vv_**2)/2, vv_)]), Matrix([0, 0]))
same(sqrt(10)*(vv_/sqrt(10)), vv_)
same(Matrix([x, vv_]) - Rational(1, 2)*Matrix([x, vv_]), Matrix([x/2, vv_/2]))
same((vv_ - eb_*vv_).subs(vv_, sqrt(10)*y)/sqrt(10), y - eb_*diff(fb18, y)/10)
```

A common cause of ill-conditioning is variables measured on very different scales. One common preprocessing step is to **standardise** nonconstant input features: subtract each feature's training-data mean and divide by its **standard deviation**, the square root of the mean squared distance from that mean. The transformed training values then have mean 0 and standard deviation 1. This can help conditioning, though it does not remove every cause, such as strongly related features. Even centring alone can help. For the data of Example 18.9, the second partial derivatives of $E(m, b)$ are $E_{mm} = 2\sum x_i^2 = 60$, $E_{mb} = 2\sum x_i = 20$ and $E_{bb} = 2n = 10$; the mixed term tilts the elliptical level curves, and they are long and thin. Centre the inputs, using $x_i - 2$ in place of $x_i$, where 2 is their mean: then $\sum (x_i - 2) = 0$, the mixed term disappears, and $E_{mm} = 20$, $E_{mb} = 0$, $E_{bb} = 10$, a condition number of 2. The fitted line is the same, $y = 1.2(x - 2) + 4 = 1.2x + 1.6$ (Exercise 18.12), but gradient descent finds it far faster in the computation below.

```check
same(hessian(E9, (m, b)), Matrix([[60, 20], [20, 10]]))
X9c = [xi - 2 for xi in X9]; E9c = sum((yi - m*xi - b)**2 for xi, yi in zip(X9c, Y9))
same(sum(X9c), 0); same(hessian(E9c, (m, b)), Matrix([[20, 0], [0, 10]])); same(Rational(20, 10), 2)
same(solve([diff(E9c, m), diff(E9c, b)], [m, b], dict=True), [{m: Rational(6, 5), b: 4}]); same(expand(Rational(6, 5)*(x - 2) + 4), Rational(6, 5)*x + Rational(8, 5))
```

For a quadratic bowl whose elliptical level curves are tilted, the same analysis holds along the axes of the ellipses; their curvatures are the positive **eigenvalues** of the Hessian matrix, which Mathematical Foundations' [Module 13](../math/module_13_EN.html) studies. For a function with continuous second partial derivatives near a minimum, this gives a local guide when both Hessian eigenvalues there are positive: the quadratic approximation is a bowl. It is not a global convergence guarantee. A minimum with a zero eigenvalue, such as the origin for $x^4 + y^4$, needs a different analysis. Mathematical Foundations' [Module 19](../math/module_19_EN.html) treats gradient methods and conditioning from the computing side, and the [AI series](../ai/index.html) shows them training real models.

::: compute Condition number and steps
How many steps does gradient descent with the best fixed step need on $f = \tfrac12(x^2 + \kappa y^2)$, from $(1, 1)$, to bring the point a million times closer to the minimum?

```python
import math

def steps_needed(kappa, max_steps=100000):
    if not math.isfinite(kappa) or kappa < 1:
        raise ValueError("kappa must be finite and at least 1")
    eta = 2/(1 + kappa)                         # the best fixed step
    x, y = 1.0, 1.0
    for k in range(max_steps + 1):
        if math.hypot(x, y) <= 1e-6*math.sqrt(2):
            return k                           # completed updates
        if k == max_steps:
            break
        x, y = x - eta*x, y - eta*kappa*y
    raise RuntimeError("distance tolerance not reached within the step limit")

for kappa in (1, 10, 100, 1000):
    print(f"kappa = {kappa:4}   steps needed: {steps_needed(kappa)}")
```

```output
kappa =    1   steps needed: 1
kappa =   10   steps needed: 69
kappa =  100   steps needed: 691
kappa = 1000   steps needed: 6908
```

From $\kappa = 10$ onwards, each tenfold increase in this table multiplies the work by about ten. The step limit prevents an endless loop if the requested reduction takes too long or floating-point arithmetic stops making progress.

Now least squares: fit the line of Example 18.9 by gradient descent on $E(m, b)$, with the raw inputs and with the inputs centred, using the same step size $\eta = 0.025$ for both, and stop when both partial derivatives have magnitude below $10^{-6}$:

```python
import numpy as np
xs = np.array([0, 1, 2, 3, 4.0])
ys = np.array([1, 4, 3, 6, 6.0])

def fit_by_descent(xs, ys, eta=0.025, max_steps=100000):
    m = b = 0.0
    for k in range(max_steps + 1):
        e = ys - (m*xs + b)                       # the residuals
        Em, Eb = -2*np.sum(xs*e), -2*np.sum(e)    # the partial derivatives of E
        if not np.isfinite([Em, Eb]).all():
            raise RuntimeError("nonfinite gradient; try a smaller step")
        if max(abs(Em), abs(Eb)) < 1e-6:
            return k, m, b                       # completed updates
        if k == max_steps:
            break
        m, b = m - eta*Em, b - eta*Eb
    raise RuntimeError("gradient tolerance not reached within the step limit")

for name, x in (("raw", xs), ("centred", xs - 2)):
    k, m, b = fit_by_descent(x, ys)
    print(f"{name:8} inputs: {k} steps, m = {m:.6f}, b = {b:.6f}")
```

```output
raw      inputs: 193 steps, m = 1.200000, b = 1.600000
centred  inputs: 61 steps, m = 1.200000, b = 4.000000
```

With the same step size, the centred inputs need 61 steps instead of 193. They also allow larger steps: the centred Hessian is diagonal with curvatures 20 and 10, so Theorem 18.7, applied after shifting the minimum to the origin, gives convergence from every start when $0 < \eta < 0.1$. From the same zero start, the raw inputs diverge already for $\eta = 0.03$. The centred fit reports $b \approx 4$, the intercept at $x = 2$: the line $y = 1.2(x - 2) + 4$, the same line as before. Both functions report an error if their tolerance is not reached within the permitted number of updates.
:::

```check
Hraw = hessian(E9, (m, b))
same_set(list(Hraw.eigenvals().keys()), [35 + 5*sqrt(41), 35 - 5*sqrt(41)])
holds(Abs(1 - Rational(3, 100)*(35 + 5*sqrt(41))) > 1); holds(Abs(1 - Rational(3, 100)*(35 - 5*sqrt(41))) < 1)   # eta = 0.03 diverges (raw)
vfast_ = Matrix([(5 + sqrt(41))/4, 1])
same(Hraw*vfast_, (35 + 5*sqrt(41))*vfast_)
holds(Matrix([-Rational(6, 5), -Rational(8, 5)]).dot(vfast_) < 0)       # the zero start has a nonzero unstable component
same(2/Integer(20), Rational(1, 10)); same(hessian(E9c, (m, b))[0, 0], 20)
for curvature_, count_ in ((10, 69), (100, 691), (1000, 6908)):
    rho_ = Rational(curvature_ - 1, curvature_ + 1)
    holds(rho_**count_ <= Rational(1, 10**6)); holds(rho_**(count_ - 1) > Rational(1, 10**6))
same(1 - Rational(2, 1 + 1), 0)                                    # kappa = 1: one update
for objective_, count_ in ((E9, 193), (E9c, 61)):
    H_ = hessian(objective_, (m, b))
    g0_ = Matrix([diff(objective_, v_).subs({m: 0, b: 0}) for v_ in (m, b)])
    before_ = (eye(2) - H_/40)**(count_ - 1)*g0_
    after_ = (eye(2) - H_/40)*before_
    holds(max(abs(v_) for v_ in before_) >= Rational(1, 10**6))
    holds(max(abs(v_) for v_ in after_) < Rational(1, 10**6))
same(hessian(x**4 + y**4, (x, y)).subs({x: 0, y: 0}), zeros(2))
import numpy as _np
def _gd(xv, eta, n):
    mm_ = bb_ = 0.0
    for _ in range(n):
        e_ = _np.array([1, 4, 3, 6, 6.0]) - (mm_*xv + bb_); mm_, bb_ = mm_ + 2*eta*_np.sum(xv*e_), bb_ + 2*eta*_np.sum(e_)
    return mm_, bb_
holds(abs(_gd(_np.array([0, 1, 2, 3, 4.0]), 0.03, 400)[0]) > 50); near(_gd(_np.array([-2, -1, 0, 1, 2.0]), 0.099, 2000)[1], 4, 1e-6)
```

::: pitfall
Three slips with gradient descent. **"A larger step is always faster"**: a larger step can be worse even below $2/c$. For the quadratic bowl, a step above $2/c$ makes any nonzero component in the steepest direction grow. **"Gradient descent heads for the minimum"**: a nonzero negative gradient gives the direction of steepest local decrease. On an elliptical bowl it points directly at the minimum on the axes, but usually across the valley elsewhere; circular level curves make every such direction radial. **"It always finds a minimum"**: it need not converge, and even a convergent sequence can reach a saddle. On $f = x^2 - y^2$, with $0 < \eta < 1$, a start on the $x$-axis stays there and converges to the saddle at the origin; a start off the axis escapes because its $y$-coordinate is multiplied by $1 + 2\eta > 1$ at every step.
:::

```check
xs_, ys_ = Integer(1), Integer(0)
same(Matrix([x, y]) - eb_*Matrix([2*x, -2*y]), Matrix([(1 - 2*eb_)*x, (1 + 2*eb_)*y]))
same(solve_univariate_inequality(Abs(1 - 2*er_) < 1, er_, relational=False), Interval.open(0, 1))
holds(1 + 2*eb_ > 1)
for _ in range(30):
    xs_, ys_ = xs_ - Rational(1, 10)*2*xs_, ys_ + Rational(1, 10)*2*ys_
holds(ys_ == 0); holds(abs(xs_) < Rational(1, 100)); same(xs_, Rational(4, 5)**30)
xs_, ys_ = Integer(1), Rational(1, 1000)
for _ in range(30):
    xs_, ys_ = xs_ - Rational(1, 10)*2*xs_, ys_ + Rational(1, 10)*2*ys_
holds(ys_ > 0.2); holds(Rational(1, 1000)*Rational(12, 10)**5 < Rational(3, 1000))
```

## What you learned {#summary}

- A local extremum of $f(x, y)$ is at a **critical point**, where $\nabla f = \vb{0}$ or a partial derivative does not exist. An interior critical point that is neither a local maximum nor a local minimum is a **saddle point**, like the origin for $x^2 - y^2$.
- **The second derivative test** applies at an interior point where $\nabla f = \vb{0}$, when the second partial derivatives are continuous nearby. With $D = f_{xx}f_{yy} - f_{xy}^2$, the determinant of the **Hessian matrix**: $D > 0$ and $f_{xx} > 0$, local minimum; $D > 0$ and $f_{xx} < 0$, local maximum; $D < 0$, saddle point; $D = 0$, inconclusive. It reads the sign of the quadratic approximation.
- A continuous function on a **nonempty, closed, bounded** region has absolute extreme values (the Extreme Value Theorem): compare its values at the critical points inside with its extreme values on the boundary, found piece by piece with one-variable methods.
- **Lagrange multipliers**: for $f$ and $g$ with continuous first partial derivatives nearby, an extremum of $f$ on $g = c$ where $\nabla g \ne \vb{0}$ satisfies $\nabla f = \lambda\nabla g$. Add singular points and any ends of the constraint, compare, and make sure an extremum exists. With two such constraints and independent gradients, $\nabla f = \lambda\nabla g + \mu\nabla h$. Along a differentiable family of optimal points, the multiplier is the rate at which the best value changes with $c$.
- **Least squares**: the line $y = mx + b$ that minimises $E(m, b) = \sum(y_i - mx_i - b)^2$ solves the normal equations, $\partial E/\partial m = \partial E/\partial b = 0$. It passes through the mean point and is unique when at least two inputs differ.
- **Gradient descent** on a bowl $\tfrac12(ax^2 + cy^2)$, with $0 < a \le c$, converges from every starting point exactly when $0 < \eta < 2/c$. The best fixed step shrinks the distance to the minimum by $\tfrac{\kappa - 1}{\kappa + 1}$ per step, where $\kappa = c/a$ is the **condition number**. Long, thin level curves can lead to slow, zigzagging paths; rescaling or centring can help.

## Exercises {#exercises}

:::: exercise Critical points and the test {#ex-18-1} ★
Find and classify the critical points of

- (a) $f(x, y) = x^2 + xy + y^2 - 3x$
- (b) $g(x, y) = x^3 - 12x + y^2 + 4y$

::: solution
**(a)** $f_x = 2x + y - 3$ and $f_y = x + 2y$. The second equation gives $x = -2y$; then the first becomes $-4y + y - 3 = 0$, so $y = -1$ and $x = 2$. The only critical point is $(2, -1)$. The second partial derivatives are constants, $f_{xx} = 2$, $f_{xy} = 1$ and $f_{yy} = 2$, so $D = 4 - 1 = 3 > 0$ with $f_{xx} > 0$: $f(2, -1) = 4 - 2 + 1 - 6 = -3$ is a local minimum value. In fact it is the absolute minimum: for a polynomial of degree 2 the quadratic approximation is exact, $f(2 + h, -1 + k) = -3 + h^2 + hk + k^2$, and $h^2 + hk + k^2 = \big(h + \tfrac{k}{2}\big)^2 + \tfrac34k^2 > 0$ for $(h, k) \ne (0, 0)$.

**(b)** $g_x = 3x^2 - 12 = 0$ gives $x = \pm2$, and $g_y = 2y + 4 = 0$ gives $y = -2$: the critical points are $(2, -2)$ and $(-2, -2)$. With $g_{xx} = 6x$, $g_{xy} = 0$ and $g_{yy} = 2$, $D = 12x$.

- At $(2, -2)$: $D = 24 > 0$ and $g_{xx} = 12 > 0$, so $g(2, -2) = 8 - 24 + 4 - 8 = -20$ is a local minimum value.
- At $(-2, -2)$: $D = -24 < 0$, a saddle point, with $g(-2, -2) = -8 + 24 + 4 - 8 = 12$.

```check
f1a = x**2 + x*y + y**2 - 3*x
same(diff(f1a, x), 2*x + y - 3); same(diff(f1a, y), x + 2*y)
same(solve([diff(f1a, x), diff(f1a, y)], [x, y], dict=True), [{x: 2, y: -1}])
same(hessian(f1a, (x, y)), Matrix([[2, 1], [1, 2]])); same(hessian(f1a, (x, y)).det(), 3); same(f1a.subs({x: 2, y: -1}), -3)
same(expand(f1a.subs({x: 2 + h, y: -1 + k})), -3 + h**2 + h*k + k**2); same(expand((h + k/2)**2 + Rational(3, 4)*k**2), h**2 + h*k + k**2)
g1b = x**3 - 12*x + y**2 + 4*y
same(diff(g1b, x), 3*x**2 - 12); same(diff(g1b, y), 2*y + 4)
same_set(solve([diff(g1b, x), diff(g1b, y)], [x, y], dict=True), [{x: 2, y: -2}, {x: -2, y: -2}])
same(hessian(g1b, (x, y)), Matrix([[6*x, 0], [0, 2]]))
same(hessian(g1b, (x, y)).det(), 12*x)
same(g1b.subs({x: 2, y: -2}), -20); same(g1b.subs({x: -2, y: -2}), 12); same(8 - 24 + 4 - 8, -20); same(-8 + 24 + 4 - 8, 12)
```
:::
::::

:::: exercise Reading the test {#ex-18-2} ★
At five interior critical points of functions with continuous second partial derivatives nearby, the second partial derivatives are:

| Point | $f_{xx}$ | $f_{xy}$ | $f_{yy}$ |
|---|---|---|---|
| $P_1$ | $2$ | $3$ | $5$ |
| $P_2$ | $-1$ | $2$ | $-3$ |
| $P_3$ | $-4$ | $1$ | $-1$ |
| $P_4$ | $4$ | $-2$ | $1$ |
| $P_5$ | $0$ | $1$ | $0$ |

- (a) Classify each point, as far as the second derivative test allows.
- (b) At $P_2$, both $f_{xx}$ and $f_{yy}$ are negative. Use the quadratic $Q(h, k)$ of Section 18.2 to find a direction in which $f$ increases away from $P_2$.

::: solution
**(a)** Compute $D = f_{xx}f_{yy} - f_{xy}^2$ at each point.

- $P_1$: $D = 10 - 9 = 1 > 0$ and $f_{xx} > 0$: a local minimum.
- $P_2$: $D = 3 - 4 = -1 < 0$: a saddle point.
- $P_3$: $D = 4 - 1 = 3 > 0$ and $f_{xx} < 0$: a local maximum.
- $P_4$: $D = 4 - 4 = 0$: the test is inconclusive.
- $P_5$: $D = 0 - 1 = -1 < 0$: a saddle point.

**(b)** At $P_2$, $Q(h, k) = -h^2 + 4hk - 3k^2 = -(h - k)(h - 3k)$. It is positive when $h - k$ and $h - 3k$ have opposite signs, for example at $(h, k) = (2, 1)$, where $Q = -4 + 8 - 3 = 1$. For displacements $(h, k) = (2t, t)$, $Q = t^2$, so the quadratic approximation and its smaller remainder give $f(P_2 + (2t, t)) > f(P_2)$ for sufficiently small nonzero $t$. Along $(t, 0)$, $Q = -t^2$, and the values are smaller. A saddle point can hide behind two negative pure second derivatives; the mixed one decides.

```check
tab = {1: (2, 3, 5), 2: (-1, 2, -3), 3: (-4, 1, -1), 4: (4, -2, 1), 5: (0, 1, 0)}
same({kname: fxx_*fyy_ - fxy_**2 for kname, (fxx_, fxy_, fyy_) in tab.items()}, {1: 1, 2: -1, 3: 3, 4: 0, 5: -1})
QQ = -hh_**2 + 2*2*hh_*kk_ - 3*kk_**2
same(QQ, -(hh_ - kk_)*(hh_ - 3*kk_)); same(QQ.subs({hh_: 2, kk_: 1}), 1); same(QQ.subs({hh_: -2, kk_: -1}), 1); same(QQ.subs({hh_: 1, kk_: 0}), -1)
same(QQ.subs({hh_: 2*t, kk_: t}), t**2); same(QQ.subs({hh_: t, kk_: 0}), -t**2)
```
:::
::::

:::: exercise A constrained extremum on a circle {#ex-18-3} ★
Use Lagrange multipliers to find the largest and smallest values of $f(x, y) = x^2 + 2y^2$ on the circle $x^2 + y^2 = 1$, and the multiplier at each candidate. Check your answer with the widget of Section 18.4, and explain with level curves why the extremes are where they are.

::: solution
With $g = x^2 + y^2$, $\nabla f = \langle 2x, 4y\rangle$ and $\nabla g = \langle 2x, 2y\rangle$, never $\vb{0}$ on the circle. The equations are

$$2x = 2\lambda x, \quad 4y = 2\lambda y, \quad x^2 + y^2 = 1,$$

that is, $x(1 - \lambda) = 0$ and $y(2 - \lambda) = 0$. If $x \ne 0$, then $\lambda = 1$, so $y(2 - 1) = 0$ gives $y = 0$ and $x = \pm1$. If $x = 0$, the circle gives $y = \pm1$, and then $\lambda = 2$. The candidates are $(\pm1, 0)$, with $f = 1$ and $\lambda = 1$, and $(0, \pm1)$, with $f = 2$ and $\lambda = 2$. The circle is closed and bounded, so the largest value of $f$ on it is 2, at $(0, \pm1)$, and the smallest is 1, at $(\pm1, 0)$.

Cancelling $x$ in the first equation to get $\lambda = 1$ would have lost the two maximum points. In the widget, choose $x^2 + 2y^2$ and the circle: at $t = 0^\circ$ and $180^\circ$ it reports $\lambda = 1$, at $90^\circ$ and $270^\circ$ $\lambda = 2$. For $k > 0$, the level curves $x^2 + 2y^2 = k$ are ellipses, $\sqrt2$ times as wide as they are high. The ellipse $k = 1$, with semi-axes 1 and $\tfrac{1}{\sqrt2}$, lies inside the circle and touches it at $(\pm1, 0)$; the ellipse $k = 2$, with semi-axes $\sqrt2$ and 1, lies outside it and touches it at $(0, \pm1)$.

```check
xr3, yr3, lr3 = symbols('x y lambda', real=True)
same_set(solve([2*xr3 - 2*lr3*xr3, 4*yr3 - 2*lr3*yr3, xr3**2 + yr3**2 - 1], [xr3, yr3, lr3], dict=True),
         [{xr3: 1, yr3: 0, lr3: 1}, {xr3: -1, yr3: 0, lr3: 1}, {xr3: 0, yr3: 1, lr3: 2}, {xr3: 0, yr3: -1, lr3: 2}])
same(2*x - 2*lam_*x, 2*x*(1 - lam_)); same([(x**2 + 2*y**2).subs({x: px_, y: py_}) for px_, py_ in ((1, 0), (0, 1))], [1, 2])
same(maximum(cos(t)**2 + 2*sin(t)**2, t, Interval(0, 2*pi)), 2); same(minimum(cos(t)**2 + 2*sin(t)**2, t, Interval(0, 2*pi)), 1)
holds(1/sqrt(2) < 1); same((x**2 + 2*y**2).subs({x: 0, y: 1/sqrt(2)}), 1); same((x**2 + 2*y**2).subs({x: sqrt(2), y: 0}), 2)
level18 = symbols('level', positive=True); same(sqrt(level18)/sqrt(level18/2), sqrt(2))
```
:::
::::

:::: exercise A line through three points {#ex-18-4} ★
Find the least-squares line of the points $(1, 2)$, $(2, 3)$ and $(3, 5)$, its residuals and the sum of squared errors. Check that it passes through the mean point.

::: solution
The sums: $n = 3$, $\sum x_i = 6$, $\sum x_i^2 = 1 + 4 + 9 = 14$, $\sum y_i = 10$ and $\sum x_iy_i = 2 + 6 + 15 = 23$. The normal equations are

$$14m + 6b = 23, \qquad 6m + 3b = 10.$$

Subtract twice the second from the first: $2m = 3$, so $m = \tfrac32$, and then $3b = 10 - 9 = 1$, so $b = \tfrac13$. The line is $y = \tfrac32x + \tfrac13$. At $x = 1, 2, 3$ it gives $\tfrac{11}{6}$, $\tfrac{10}{3}$ and $\tfrac{29}{6}$, so the residuals are $\tfrac16$, $-\tfrac13$ and $\tfrac16$ (they add up to 0), and

$$E = \frac{1}{36} + \frac{1}{9} + \frac{1}{36} = \frac{1}{6}.$$

The mean point is $\big(2, \tfrac{10}{3}\big)$, and indeed $\tfrac32 \cdot 2 + \tfrac13 = \tfrac{10}{3}$.

```check
X4 = [1, 2, 3]; Y4 = [2, 3, 5]
E4 = sum((yi - m*xi - b)**2 for xi, yi in zip(X4, Y4))
same([sum(X4), sum(xi**2 for xi in X4), sum(Y4), sum(xi*yi for xi, yi in zip(X4, Y4))], [6, 14, 10, 23])
same(solve([diff(E4, m), diff(E4, b)], [m, b], dict=True), [{m: Rational(3, 2), b: Rational(1, 3)}])
same((14*m + 6*b) - 2*(6*m + 3*b), 2*m); same(23 - 2*10, 3)
same([Rational(3, 2)*xi + Rational(1, 3) for xi in X4], [Rational(11, 6), Rational(10, 3), Rational(29, 6)])
res4 = [yi - Rational(3, 2)*xi - Rational(1, 3) for xi, yi in zip(X4, Y4)]
same(res4, [Rational(1, 6), -Rational(1, 3), Rational(1, 6)]); same(sum(res4), 0)
same(E4.subs({m: Rational(3, 2), b: Rational(1, 3)}), Rational(1, 6)); same(Rational(1, 36) + Rational(1, 9) + Rational(1, 36), Rational(1, 6))
same(Rational(3, 2)*2 + Rational(1, 3), Rational(10, 3)); same(Rational(sum(Y4), 3), Rational(10, 3))
```
:::
::::

:::: exercise Four critical points {#ex-18-5} ★★
Find the critical points of $f(x, y) = 2x^3 + xy^2 + 5x^2 + y^2$ and classify them. Does $f$ have an absolute maximum?

::: solution
$f_x = 6x^2 + y^2 + 10x$ and $f_y = 2xy + 2y = 2y(x + 1)$. The second is 0 when $y = 0$ or $x = -1$.

- If $y = 0$: $6x^2 + 10x = 2x(3x + 5) = 0$, so $x = 0$ or $x = -\tfrac53$.
- If $x = -1$: $6 + y^2 - 10 = 0$, so $y^2 = 4$ and $y = \pm2$.

The critical points are $(0, 0)$, $\big(-\tfrac53, 0\big)$, $(-1, 2)$ and $(-1, -2)$. The second partial derivatives are $f_{xx} = 12x + 10$, $f_{xy} = 2y$ and $f_{yy} = 2x + 2$, so:

- At $(0, 0)$: $f_{xx} = 10$, $f_{xy} = 0$, $f_{yy} = 2$, so $D = 20 > 0$ with $f_{xx} > 0$: a local minimum, $f(0, 0) = 0$.
- At $\big(-\tfrac53, 0\big)$: $f_{xx} = -10$, $f_{xy} = 0$, $f_{yy} = -\tfrac43$, so $D = \tfrac{40}{3} > 0$ with $f_{xx} < 0$: a local maximum, $f = \tfrac{125}{27}$.
- At $(-1, \pm2)$: $f_{xx} = -2$, $f_{xy} = \pm4$, $f_{yy} = 0$, so $D = -16 < 0$: two saddle points, where $f = 3$.

For instance

$$f\big(-\tfrac53, 0\big) = 2\Big(-\frac{125}{27}\Big) + 5 \cdot \frac{25}{9} = \frac{-250 + 375}{27} = \frac{125}{27} \approx 4.630.$$

The local maximum is not an absolute maximum, and there is none: $f(x, 0) = 2x^3 + 5x^2 \to \infty$ as $x \to \infty$.

```check
f5 = 2*x**3 + x*y**2 + 5*x**2 + y**2
same(diff(f5, x), 6*x**2 + y**2 + 10*x); same(factor(diff(f5, y)), 2*y*(x + 1)); same(factor(6*x**2 + 10*x), 2*x*(3*x + 5))
same_set(solve([diff(f5, x), diff(f5, y)], [x, y], dict=True), [{x: 0, y: 0}, {x: -Rational(5, 3), y: 0}, {x: -1, y: 2}, {x: -1, y: -2}])
H5 = hessian(f5, (x, y)); same(H5, Matrix([[12*x + 10, 2*y], [2*y, 2*x + 2]]))
for (px_, py_), (dv, fv) in {(0, 0): (20, 0), (-Rational(5, 3), 0): (Rational(40, 3), Rational(125, 27)), (-1, 2): (-16, 3), (-1, -2): (-16, 3)}.items():
    same(H5.det().subs({x: px_, y: py_}), dv); same(f5.subs({x: px_, y: py_}), fv)
same(H5.subs({x: -Rational(5, 3), y: 0}), Matrix([[-10, 0], [0, -Rational(4, 3)]])); same(H5[0, 0].subs(x, 0), 10)
steps(f5.subs({x: -Rational(5, 3), y: 0}), 2*(-Rational(125, 27)) + 5*Rational(25, 9), Rational(-250 + 375, 27), Rational(125, 27)); rounds(Rational(125, 27), '4.630')
limit_is(f5.subs(y, 0), x, oo, oo)
```
:::
::::

:::: exercise Extreme values on a disc {#ex-18-6} ★★
Find the absolute maximum and minimum values of $f(x, y) = x^2 + 2y^2 - 2x$ on the disc $x^2 + y^2 \le 4$.

::: solution
$f$ is continuous and the disc is closed and bounded, so both values exist.

**Inside.** $f_x = 2x - 2$ and $f_y = 4y$ are 0 only at $(1, 0)$, which is inside the disc since $1 < 4$. There $f(1, 0) = 1 - 2 = -1$.

**On the boundary.** Parametrise the circle by $x = 2\cos t$, $y = 2\sin t$, $0 \le t \le 2\pi$. With $\sin^2 t = 1 - \cos^2 t$,

$$f = 4\cos^2 t + 8\sin^2 t - 4\cos t = 8 - 4\cos^2 t - 4\cos t.$$

As $t$ runs round the circle, $u = \cos t$ runs through $[-1, 1]$, so find the extreme values of $\varphi(u) = 8 - 4u^2 - 4u$ on $[-1, 1]$. $\varphi'(u) = -8u - 4 = 0$ at $u = -\tfrac12$, with $\varphi\big(-\tfrac12\big) = 8 - 1 + 2 = 9$; at the ends, $\varphi(1) = 0$ and $\varphi(-1) = 8$. The value 9 is taken where $\cos t = -\tfrac12$, at the points $(-1, \pm\sqrt3)$; the value 0 at $(2, 0)$, and 8 at $(-2, 0)$.

**Compare** $-1$, $9$, $0$ and $8$: the absolute maximum value is 9, at $(-1, \sqrt3)$ and $(-1, -\sqrt3)$, and the absolute minimum value is $-1$, at $(1, 0)$, inside the disc.

```check
f6 = x**2 + 2*y**2 - 2*x
same(solve([diff(f6, x), diff(f6, y)], [x, y], dict=True), [{x: 1, y: 0}]); same(f6.subs({x: 1, y: 0}), -1)
steps(f6.subs({x: 2*cos(t), y: 2*sin(t)}), 4*cos(t)**2 + 8*sin(t)**2 - 4*cos(t), 8 - 4*cos(t)**2 - 4*cos(t))
ph6 = 8 - 4*u**2 - 4*u
same(solve(diff(ph6, u), u), [-Rational(1, 2)]); same([ph6.subs(u, uv) for uv in (-Rational(1, 2), 1, -1)], [9, 0, 8])
same(f6.subs({x: -1, y: sqrt(3)}), 9); same(f6.subs({x: -1, y: -sqrt(3)}), 9); same(f6.subs({x: 2, y: 0}), 0); same(f6.subs({x: -2, y: 0}), 8)
same((-1)**2 + sqrt(3)**2, 4); same(maximum(ph6, u, Interval(-1, 1)), 9); same(minimum(ph6, u, Interval(-1, 1)), 0)
```
:::
::::

:::: exercise The closest point of a plane {#ex-18-7} ★★
Use Lagrange multipliers to find the point of the plane $x + 2y + 2z = 14$ closest to the point $(1, 1, 1)$, and the distance. Explain why a closest point exists, and check the answer geometrically.

::: solution
Minimise the square of the distance, $f = (x - 1)^2 + (y - 1)^2 + (z - 1)^2$, subject to $g = x + 2y + 2z = 14$, with $\nabla g = \langle 1, 2, 2\rangle \ne \vb{0}$. The equations $\nabla f = \lambda\nabla g$ are

$$2(x - 1) = \lambda, \quad 2(y - 1) = 2\lambda, \quad 2(z - 1) = 2\lambda,$$

so $x = 1 + \tfrac{\lambda}{2}$ and $y = z = 1 + \lambda$. The plane gives $\big(1 + \tfrac{\lambda}{2}\big) + 2(1 + \lambda) + 2(1 + \lambda) = 5 + \tfrac92\lambda = 14$, so $\lambda = 2$ and the point is $(2, 3, 3)$. Its distance from $(1, 1, 1)$ is $\sqrt{1 + 4 + 4} = 3$.

**A closest point exists.** The points of the plane with $f \le 9$ form a closed, bounded set, nonempty because it contains $(2, 3, 3)$. On it $f$ has a smallest value (the Extreme Value Theorem in three variables), at most 9, and outside it $f > 9$. So that smallest value is the minimum over the whole plane, at a point where the method applies: it is the only candidate, $(2, 3, 3)$. The set with $f \le 9$ therefore consists of that point.

**Geometrically**, $(2, 3, 3) - (1, 1, 1) = \langle 1, 2, 2\rangle$, the normal vector of the plane (Module 16): the shortest segment from a point to a plane is perpendicular to the plane. Module 16's formula for the distance from a point to a plane gives the same answer:

$$\frac{\abs{1 + 2 \cdot 1 + 2 \cdot 1 - 14}}{\sqrt{1^2 + 2^2 + 2^2}} = \frac{9}{3} = 3.$$

```check
xr9, yr9, zr9, lr9 = symbols('x y z lambda', real=True)
f7 = (xr9 - 1)**2 + (yr9 - 1)**2 + (zr9 - 1)**2
same(solve([diff(f7, s_) - lr9*c_ for s_, c_ in zip((xr9, yr9, zr9), (1, 2, 2))] + [xr9 + 2*yr9 + 2*zr9 - 14], [xr9, yr9, zr9, lr9], dict=True),
     [{xr9: 2, yr9: 3, zr9: 3, lr9: 2}])
same((1 + lr9/2) + 2*(1 + lr9) + 2*(1 + lr9), 5 + Rational(9, 2)*lr9); same(solve(5 + Rational(9, 2)*x - 14, x), [2])
same(sqrt(f7.subs({xr9: 2, yr9: 3, zr9: 3})), 3); same(Matrix([2, 3, 3]) - Matrix([1, 1, 1]), Matrix([1, 2, 2]))
same(Abs(1 + 2*1 + 2*1 - 14)/sqrt(1**2 + 2**2 + 2**2), 3); same(Rational(9, 3), 3)
```
:::
::::

:::: exercise Gradient descent by hand {#ex-18-8} ★★
Let $f(x, y) = x^2 + 4y^2$.

- (a) Starting from $(4, 2)$, take three steps of gradient descent with $\eta = 0.2$.
- (b) For which step sizes does gradient descent converge from every starting point? What happens with $\eta = 0.3$?
- (c) Which step size is best in the sense of Section 18.6, and what is the condition number?
- (d) Rescale $y$ so that the level curves become circles, and find a step size that reaches the minimum in one step.

::: solution
**(a)** $\nabla f = \langle 2x, 8y\rangle$, so with $\eta = 0.2$, $x_{k+1} = x_k - 0.4x_k = 0.6x_k$ and $y_{k+1} = y_k - 1.6y_k = -0.6y_k$:

$$(4, 2) \to (2.4, -1.2) \to (1.44, 0.72) \to (0.864, -0.432).$$

**(b)** $f = \tfrac12(2x^2 + 8y^2)$, so $a = 2$ and $c = 8$ in Theorem 18.7: gradient descent converges from every start exactly when $0 < \eta < \tfrac28 = 0.25$. With $\eta = 0.3$, $y_{k+1} = (1 - 2.4)y_k = -1.4y_k$: from any start with $y_0 \ne 0$ the $y$-coordinate zigzags with growing size, and the method diverges.

**(c)** The best fixed step is $\eta^* = \tfrac{2}{a + c} = \tfrac{2}{10} = 0.2$, the step of (a), where both coordinates shrink by the factor $0.6 = \tfrac{8 - 2}{8 + 2}$. The condition number is $\kappa = \tfrac82 = 4$, and indeed $\tfrac{\kappa - 1}{\kappa + 1} = \tfrac35$.

**(d)** Put $v = 2y$: then $f = x^2 + v^2$, whose level curves are circles. Its gradient in $x$ and $v$ is $\langle 2x, 2v\rangle$, and the step $\eta = 0.5$ gives $(x, v) - 0.5\langle 2x, 2v\rangle = (0, 0)$: the minimum in one step, from any start.

```check
pg = [(Integer(4), Integer(2))]
same([diff(x**2 + 4*y**2, v) for v in (x, y)], [2*x, 8*y])
for _ in range(3):
    px_, py_ = pg[-1]; pg.append((px_ - Rational(1, 5)*2*px_, py_ - Rational(1, 5)*8*py_))
same(pg, [(4, 2), (Rational(12, 5), -Rational(6, 5)), (Rational(36, 25), Rational(18, 25)), (Rational(108, 125), -Rational(54, 125))])
same([(Rational(12, 5), -Rational(6, 5)), (Rational(36, 25), Rational(18, 25)), (Rational(108, 125), -Rational(54, 125))], [(Rational(24, 10), -Rational(12, 10)), (Rational(144, 100), Rational(72, 100)), (Rational(864, 1000), -Rational(432, 1000))])
same((2*x**2 + 8*y**2)/2, x**2 + 4*y**2); same(Rational(2, 8), Rational(1, 4)); same(1 - Rational(3, 10)*8, -Rational(14, 10))
same(Rational(2, 2 + 8), Rational(1, 5)); same(Rational(8 - 2, 8 + 2), Rational(3, 5)); same((4 - 1)/Integer(4 + 1), Rational(3, 5))
same((x**2 + 4*y**2).subs(y, vv_/2), x**2 + vv_**2); same(Matrix([x, vv_]) - Rational(1, 2)*Matrix([2*x, 2*vv_]), Matrix([0, 0]))
```
:::
::::

:::: exercise The cheapest can, with a multiplier {#ex-18-9} ★★
[Example 8.14](module_08_EN.html#optimisation) found the closed cylindrical can of volume 330 cm³ with the least surface area by eliminating $h$. Solve the same problem with Lagrange multipliers: minimise $A(r, h) = 2\pi r^2 + 2\pi rh$ subject to $\pi r^2h = 330$, with $r, h > 0$. Then use the meaning of $\lambda$ (Section 18.4) to estimate how much more metal a can of 331 cm³ needs.

::: solution
$\nabla A = \langle 4\pi r + 2\pi h,\ 2\pi r\rangle$ and, with $V = \pi r^2h$, $\nabla V = \langle 2\pi rh,\ \pi r^2\rangle$. The equations are

$$\begin{aligned} 4\pi r + 2\pi h &= \lambda\,2\pi rh, \\ 2\pi r &= \lambda\,\pi r^2, \\ \pi r^2h &= 330. \end{aligned}$$

The second, divided by $\pi r > 0$, gives $\lambda = \tfrac{2}{r}$. Then the first becomes $4\pi r + 2\pi h = \tfrac2r \cdot 2\pi rh = 4\pi h$, so $4\pi r = 2\pi h$ and $h = 2r$: the best can is as tall as it is wide, as in Example 8.14. The volume gives $2\pi r^3 = 330$, so $r = \sqrt[3]{165/\pi} \approx 3.745$ cm, $h \approx 7.49$ cm and $\lambda = \tfrac2r \approx 0.534$. That this candidate gives the minimum was shown in Example 8.14.

By the Going deeper box of Section 18.4, $\lambda$ is the rate at which the least area grows with the volume: about 0.534 cm² of metal per extra cm³. So a 331 cm³ can needs about 0.53 cm² more metal. (The exact least area is $6\pi r^2$ with $r^3 = \tfrac{V}{2\pi}$, and $6\pi\big(\tfrac{331}{2\pi}\big)^{2/3} - 6\pi\big(\tfrac{330}{2\pi}\big)^{2/3} \approx 0.534$.)

```check
rr_, hc_, lc_ = symbols('r h lambda', positive=True)
Ac = 2*pi*rr_**2 + 2*pi*rr_*hc_; Vc = pi*rr_**2*hc_
same(diff(Ac, rr_), 4*pi*rr_ + 2*pi*hc_); same(diff(Ac, hc_), 2*pi*rr_); same(diff(Vc, rr_), 2*pi*rr_*hc_); same(diff(Vc, hc_), pi*rr_**2)
same(solve(2*pi*rr_ - lc_*pi*rr_**2, lc_), [2/rr_]); same(4*pi*rr_ + 2*pi*hc_ - (2/rr_)*2*pi*rr_*hc_, 4*pi*rr_ - 2*pi*hc_)
solc = solve([diff(Ac, rr_) - lc_*diff(Vc, rr_), diff(Ac, hc_) - lc_*diff(Vc, hc_), Vc - 330], [rr_, hc_, lc_], dict=True)
rstar18 = (165/pi)**Rational(1, 3)
same(len(solc), 1); same(solc[0][rr_], rstar18); same(solc[0][hc_], 2*rstar18); same(solc[0][lc_], 2/rstar18)
rounds(rstar18, '3.745'); rounds(2*rstar18, '7.49'); rounds(2/rstar18, '0.534')
Vv = symbols('V', positive=True); Astar = 6*pi*(Vv/(2*pi))**Rational(2, 3)
same(Astar.subs(Vv, 330), Ac.subs({rr_: rstar18, hc_: 2*rstar18})); same(diff(Astar, Vv).subs(Vv, 330), 2/rstar18)
rounds(Astar.subs(Vv, 331) - Astar.subs(Vv, 330), '0.534'); rounds(2/rstar18, '0.53')
```
:::
::::

:::: exercise The best fixed step {#ex-18-10} ★★★
Let $f(x, y) = \tfrac12(ax^2 + cy^2)$ with $0 < a < c$, and $\kappa = c/a$.

- (a) Show that one step of gradient descent multiplies the distance from the minimum by at most $\rho(\eta) = \max\big(\abs{1 - \eta a}, \abs{1 - \eta c}\big)$, and exactly by $\rho(\eta)$ for a suitable starting point.
- (b) Show that $\rho(\eta)$ is smallest at $\eta^* = \dfrac{2}{a + c}$, where it equals $\dfrac{\kappa - 1}{\kappa + 1}$.
- (c) With $\eta^*$, about how many steps does it take to bring the point $10^6$ times closer to the minimum when $\kappa$ is large? Use $\ln(1 + u) \approx u$ for small $u$, and compare with the Compute it box of Section 18.6.

::: solution
**(a)** A step takes $(x, y)$ to $\big((1 - \eta a)x,\ (1 - \eta c)y\big)$, whose distance from the origin is

$$\sqrt{(1 - \eta a)^2x^2 + (1 - \eta c)^2y^2} \le \sqrt{\rho^2x^2 + \rho^2y^2} = \rho\sqrt{x^2 + y^2}.$$

If $\rho = \abs{1 - \eta a}$, a start on the $x$-axis is multiplied by exactly $\rho$; if $\rho = \abs{1 - \eta c}$, a start on the $y$-axis is.

**(b)** For every $\eta > 0$, $\rho(\eta) \ge 1 - \eta a$ and $\rho(\eta) \ge \eta c - 1$, since $\abs{s} \ge s$ and $\abs{s} \ge -s$. At $\eta^*$, $1 - \eta^*a = \tfrac{c - a}{c + a}$ and $\eta^*c - 1 = \tfrac{c - a}{c + a}$, so $\rho(\eta^*) = \tfrac{c - a}{c + a}$. If $\eta < \eta^*$, then $\rho(\eta) \ge 1 - \eta a > 1 - \eta^*a = \rho(\eta^*)$; if $\eta > \eta^*$, then $\rho(\eta) \ge \eta c - 1 > \eta^*c - 1 = \rho(\eta^*)$. So $\eta^*$ is the best fixed step, and dividing the top and bottom by $a$ gives $\rho(\eta^*) = \tfrac{\kappa - 1}{\kappa + 1}$.

**(c)** After $k$ steps the distance is at most $\rho^k$ times the first one, so it is enough that $\rho^k \le 10^{-6}$, that is,

$$k \ge \frac{\ln 10^6}{\ln\frac{\kappa + 1}{\kappa - 1}}.$$

With $u = \tfrac1\kappa$, $\ln\tfrac{\kappa + 1}{\kappa - 1} = \ln(1 + u) - \ln(1 - u) \approx u - (-u) = \tfrac{2}{\kappa}$, so $k \approx \tfrac{\ln 10^6}{2}\,\kappa \approx 6.91\kappa$: about 69 steps for $\kappa = 10$, 691 for $\kappa = 100$ and 6908 for $\kappa = 1000$. The Compute it box counted 69, 691 and 6908 steps (from $(1, 1)$, where both coordinates shrink by exactly $\rho$). The work grows in proportion to the condition number.

```check
ar_, cr_, et_ = symbols('a c eta', positive=True)
same((1 - 2*ar_/(ar_ + cr_)), (cr_ - ar_)/(cr_ + ar_)); same(2*cr_/(ar_ + cr_) - 1, (cr_ - ar_)/(cr_ + ar_))
same(((cr_ - ar_)/(cr_ + ar_)).subs(cr_, kp_*ar_), (kp_ - 1)/(kp_ + 1))
for av_, cv_ in ((1, 10), (2, 8), (1, 3)):
    rho_ = lambda e_: Max(Abs(1 - e_*av_), Abs(1 - e_*cv_))
    es_ = Rational(2, av_ + cv_)
    holds(all(rho_(es_ + d_) > rho_(es_) for d_ in (Rational(-1, 100), Rational(1, 100), Rational(-1, 10)*es_, Rational(1, 10)*es_)))
    same(rho_(es_), Rational(cv_ - av_, cv_ + av_))
rounds(log(10**6)/2, '6.91')
import math as _m
for kv_, want_ in ((10, '69'), (100, '691'), (1000, '6908')):
    rounds(log(10**6)/2*kv_, want_)
    holds(abs(_m.log(1e6)/_m.log((kv_ + 1)/(kv_ - 1)) - _m.log(1e6)/2*kv_) < 1)
    same(ceiling(log(10**6)/log(Rational(kv_ + 1, kv_ - 1))), Integer(want_))
```
:::
::::

:::: exercise Means and boxes {#ex-18-11} ★★★
- (a) Show that $a^3 + b^3 + c^3 - 3abc = \tfrac12(a + b + c)\big[(a - b)^2 + (b - c)^2 + (c - a)^2\big]$, and deduce that $a^3 + b^3 + c^3 \ge 3abc$ for positive $a$, $b$, $c$, with equality only when $a = b = c$.
- (b) Deduce the inequality of the arithmetic and geometric means used in Example 18.7: for positive $p$, $q$, $r$, $\tfrac{p + q + r}{3} \ge \sqrt[3]{pqr}$, with equality only when $p = q = r$.
- (c) Prove that a closed box (with a lid) of surface area $S$ has volume at most $\big(\tfrac S6\big)^{3/2}$, with equality only for a cube. Check with Lagrange multipliers for $S = 24$.

::: solution
**(a)** Expand the right side. The bracket is $2(a^2 + b^2 + c^2) - 2(ab + bc + ca)$, so the right side is $(a + b + c)(a^2 + b^2 + c^2 - ab - bc - ca)$; multiplying out, the terms $a^2b$, $ab^2$, … cancel in pairs and leave $a^3 + b^3 + c^3 - 3abc$. For positive $a$, $b$, $c$ the factor $a + b + c$ is positive and the bracket, a sum of squares, is at least 0, so $a^3 + b^3 + c^3 - 3abc \ge 0$. Equality needs the bracket to be 0, that is, $a = b = c$.

**(b)** Put $a = \sqrt[3]p$, $b = \sqrt[3]q$ and $c = \sqrt[3]r$, which are positive. Then (a) says $p + q + r \ge 3\sqrt[3]{p}\sqrt[3]{q}\sqrt[3]{r} = 3\sqrt[3]{pqr}$, with equality only when $\sqrt[3]p = \sqrt[3]q = \sqrt[3]r$, that is, $p = q = r$.

**(c)** For a box $x$ by $y$ by $z$, the area is $S = 2(xy + yz + zx)$ and the volume $V = xyz$. Apply (b) to $p = xy$, $q = yz$ and $r = zx$, whose sum is $\tfrac S2$ and whose product is $(xyz)^2 = V^2$: $\tfrac S6 \ge V^{2/3}$, so $V \le \big(\tfrac S6\big)^{3/2}$. Equality needs $xy = yz = zx$, which for positive numbers means $x = y = z$: a cube. For $S = 24$ the bound is $4^{3/2} = 8$, the cube of side 2. With Lagrange multipliers, $\nabla V = \lambda\nabla\big(2(xy + yz + zx)\big)$ reads $yz = 2\lambda(y + z)$, $xz = 2\lambda(x + z)$, $xy = 2\lambda(x + y)$; multiplying by $x$, $y$ and $z$ as in Example 18.7 gives $xy + xz = xy + yz = xz + yz$, so $x = y = z$, and $6x^2 = 24$ gives $x = 2$ and $\lambda = \tfrac{yz}{2(y + z)} = \tfrac12$.

```check
a3, b3, c3 = symbols('a b c')
same(expand(a3**3 + b3**3 + c3**3 - 3*a3*b3*c3), expand(Rational(1, 2)*(a3 + b3 + c3)*((a3 - b3)**2 + (b3 - c3)**2 + (c3 - a3)**2)))
same(expand((a3 - b3)**2 + (b3 - c3)**2 + (c3 - a3)**2), expand(2*(a3**2 + b3**2 + c3**2) - 2*(a3*b3 + b3*c3 + c3*a3)))
pp3 = symbols('p', positive=True); same(real_root(pp3, 3)**3, pp3)
xc, yc, zc, lcb = symbols('x y z lambda', positive=True)
same(solve([diff(xc*yc*zc, s_) - lcb*diff(2*(xc*yc + yc*zc + zc*xc), s_) for s_ in (xc, yc, zc)] + [2*(xc*yc + yc*zc + zc*xc) - 24], [xc, yc, zc, lcb], dict=True),
     [{xc: 2, yc: 2, zc: 2, lcb: Rational(1, 2)}])
same((Integer(24)/6)**Rational(3, 2), 8); same(2**3, 8); same(Rational(2*2, 2*(2 + 2)), Rational(1, 2))
same((xc*yc)*(yc*zc)*(zc*xc), (xc*yc*zc)**2)
```
:::
::::

:::: exercise Centring the data {#ex-18-12} ★★★
Let $(x_1, y_1), \dots, (x_n, y_n)$ be data with at least two different $x_i$, and means $\bar x$, $\bar y$.

- (a) Show that the slope of the least-squares line is $m = \dfrac{\sum(x_i - \bar x)(y_i - \bar y)}{\sum(x_i - \bar x)^2}$.
- (b) Suppose the data are centred: $\bar x = 0$. Show that the normal equations become $\big(\sum x_i^2\big)m = \sum x_iy_i$ and $b = \bar y$, and that $E_{mb} = 0$.
- (c) Fit the data of Example 18.9 with $x - 2$ in place of $x$, and check that you get the line found there.

::: solution
**(a)** The proof of Theorem 18.6 found $m = \dfrac{\sum x_iy_i - n\bar x\bar y}{\sum x_i^2 - n\bar x^2}$ and showed that the denominator is $\sum(x_i - \bar x)^2$. For the numerator, expand:

$$\sum(x_i - \bar x)(y_i - \bar y) = \sum x_iy_i - \bar y\sum x_i - \bar x\sum y_i + n\bar x\bar y = \sum x_iy_i - n\bar x\bar y,$$

since $\sum x_i = n\bar x$ and $\sum y_i = n\bar y$.

**(b)** If $\bar x = 0$, then $\sum x_i = 0$, and the normal equations lose their mixed terms: $\big(\sum x_i^2\big)m = \sum x_iy_i$ and $nb = \sum y_i$, that is, $b = \bar y$. The mixed partial derivative is $E_{mb} = 2\sum x_i = 0$: above the minimum value, the level curves of $E$ are ellipses with axes along the $m$ and $b$ directions (circles if $\sum x_i^2 = n$), and the two unknowns can be found separately. At the minimum value the level set is a single point.

**(c)** The centred inputs are $-2, -1, 0, 1, 2$, with the same $y$ values $1, 4, 3, 6, 6$. Then $\sum x_i^2 = 10$ and $\sum x_iy_i = -2 - 4 + 0 + 6 + 12 = 12$, so $m = \tfrac{12}{10} = 1.2$, and $b = \bar y = 4$. The line is $y = 1.2(x - 2) + 4 = 1.2x + 1.6$, as in Example 18.9.

```check
X6 = symbols('x1:4'); Y6 = symbols('y1:4'); n6 = 3
xb6 = sum(X6)/n6; yb6 = sum(Y6)/n6
same(expand(sum((X6[i] - xb6)*(Y6[i] - yb6) for i in range(n6))), expand(sum(X6[i]*Y6[i] for i in range(n6)) - n6*xb6*yb6))
E6 = sum((Y6[i] - m*X6[i] - b)**2 for i in range(n6)); s6 = solve([diff(E6, m), diff(E6, b)], [m, b], dict=True)[0]
same(s6[m], sum((X6[i] - xb6)*(Y6[i] - yb6) for i in range(n6))/sum((X6[i] - xb6)**2 for i in range(n6)))
same(diff(E6, m, b), 2*sum(X6))
same([xi - 2 for xi in X9], [-2, -1, 0, 1, 2]); same(sum((xi - 2)**2 for xi in X9), 10); same(sum((xi - 2)*yi for xi, yi in zip(X9, Y9)), 12)
same(Rational(12, 10), Rational(6, 5)); same(expand(Rational(6, 5)*(x - 2) + 4), Rational(6, 5)*x + Rational(8, 5))
```
:::
::::

## Check yourself {#quiz}

```quiz
? At an interior critical point of a function with continuous second partial derivatives nearby, $f_{xx} = 3$, $f_{xy} = 4$ and $f_{yy} = 2$. The point is
- [ ] a local minimum, since $f_{xx} > 0$ and $f_{yy} > 0$
- [ ] a local maximum
- [x] a saddle point
- [ ] impossible to classify with the second derivative test
> $D = 3 \cdot 2 - 4^2 = -10 < 0$, so it is a saddle point. The signs of $f_{xx}$ and $f_{yy}$ decide the classification when $D > 0$; here the mixed term wins, as for $x^2 + 3xy + y^2$. When $D = 0$ the test is inconclusive.

? At an interior point of the domain, $\nabla f(a, b) = \vb{0}$. Which statement must be true?
- [x] $(a, b)$ is a critical point, which may be a local maximum, a local minimum or a saddle point
- [ ] $f$ has a local extremum at $(a, b)$
- [ ] $f$ has an absolute extremum at $(a, b)$
- [ ] $f$ is constant near $(a, b)$
> Fermat's theorem does not work backwards: $x^2 - y^2$ has $\nabla f = \vb{0}$ at the origin, a saddle point. Even a local minimum need not be absolute, like $(1, 1)$ for $x^3 + y^3 - 3xy$. And a zero gradient at one point says nothing about nearby points.

? At an interior point $(a, b)$ where $f_x = f_y = 0$, the second partial derivatives are continuous nearby, $D = 0$ and $f_{xx} = 2$. Then
- [ ] $(a, b)$ is a saddle point
- [ ] $f$ has a local minimum there, since $f_{xx} > 0$
- [ ] $f$ has no extremum there
- [x] the test does not decide between a local minimum and a saddle point
> $x^2 + y^4$, $x^2 - y^4$ and $x^2 + y^3$ all have $D = 0$ and $f_{xx} = 2$ at the origin, and they have a minimum, a saddle point and a saddle point. A local maximum is ruled out: along $y = b$, the one-variable second derivative test gives a strict minimum at $x = a$ because $f_{xx} = 2 > 0$.

? On which of these sets does every continuous function $f(x, y)$ have an absolute maximum and an absolute minimum?
- [ ] the open disc $x^2 + y^2 < 1$
- [x] the triangle with vertices $(0, 0)$, $(1, 0)$ and $(0, 1)$, with its sides
- [ ] the half-plane $y \ge 0$
- [ ] the whole plane
> The Extreme Value Theorem needs a closed, bounded set, and the triangle with its sides is both. The open disc is not closed ($x + y$ comes as close to $\sqrt2$ as you like there without reaching it); the half-plane and the plane are not bounded ($x$ has no largest value on them).

? $f$ and $g$ have continuous first partial derivatives near $(a, b)$. There $f$ has a maximum on the curve $g(x, y) = c$, and $\nabla g(a, b) \ne \vb{0}$. Then at $(a, b)$
- [ ] $\nabla f(a, b) = \vb{0}$
- [ ] $\nabla f$ is perpendicular to $\nabla g$
- [x] $\nabla f = \lambda\nabla g$ for some real $\lambda$, possibly 0
- [ ] the level curve of $f$ crosses the constraint curve
> By Lagrange's theorem $\nabla f = \lambda\nabla g$. $\nabla f$ need not be $\vb{0}$: $x + y$ has gradient $\langle 1, 1\rangle$ at its maximum on a circle. When $\nabla f \ne \vb{0}$, its level curve is tangent to the constraint. But a zero gradient is possible too: $f = -x^2 - y^2$ is largest on $g = y = 0$ at the origin, where $\lambda = 0$ and the level set $f = 0$ is a single point.

? The largest value of $f(x, y) = x + y$ on the circle $x^2 + y^2 = 2$ is
- [ ] $\sqrt2$
- [x] $2$
- [ ] $2\sqrt2$
- [ ] $4$
> $1 = 2\lambda x$ and $1 = 2\lambda y$ give $x = y$, and $2x^2 = 2$ gives $x = \pm1$: the candidates $(1, 1)$ and $(-1, -1)$, with $f = 2$ and $f = -2$. $\sqrt2$ is the largest value on the unit circle, of radius 1; $2\sqrt2$ is the diameter of this circle, and 4 is $(x + y)^2$ at the maximum.

? The least-squares line $y = mx + b$ of data $(x_1, y_1), \dots, (x_n, y_n)$ always
- [ ] passes through at least two of the data points
- [ ] passes through the origin
- [ ] makes the sum of the residuals as small as possible
- [x] passes through the mean point $(\bar x, \bar y)$
> The second normal equation says $b = \bar y - m\bar x$. The line of Example 18.9 passes through none of the data points, and through $(0, 1.6)$, not the origin. The residuals add up to 0, but that sum is not what is minimised: a line high above the data makes it as negative as you like.

? Gradient descent on $f(x, y) = \tfrac12(x^2 + 25y^2)$ converges to the minimum from every starting point exactly when
- [x] $0 < \eta < 0.08$
- [ ] $0 < \eta < 0.04$
- [ ] $0 < \eta < 1$
- [ ] $0 < \eta < 2$
> By Theorem 18.7, $0 < \eta < 2/c = \tfrac{2}{25} = 0.08$, set by the steeper direction. $0.04 = \tfrac{1}{25}$ is the step that removes the $y$-error in a single step, but larger steps strictly below 0.08 still converge, with a zigzag when $y_0 \ne 0$. At $\eta = 0.08$, the $y$-factor is $-1$, so nonzero $y$-coordinates alternate without shrinking. $0 < \eta < 2$ is the condition for the $x$-direction alone: with $\eta = 1$ the factor in $y$ is $1 - 25 = -24$.
```

```check
same(3*2 - 4**2, -10)
same(diff(x**2 - y**2, x).subs({x: 0, y: 0}), 0)
for fq3 in (x**2 + y**4, x**2 - y**4, x**2 + y**3):
    same([diff(fq3, v).subs({x: 0, y: 0}) for v in (x, y)], [0, 0])
    same(hessian(fq3, (x, y)).subs({x: 0, y: 0}), Matrix([[2, 0], [0, 0]]))
    same(fq3.subs(y, 0), x**2)
same((x**2 - y**4).subs(x, 0), -y**4); same((x**2 + y**3).subs(x, 0), y**3)
fq5 = -x**2 - y**2; same([diff(fq5, v).subs({x: 0, y: 0}) for v in (x, y)], [0, 0])
same(fq5.subs(y, 0), -x**2); same([diff(y, v) for v in (x, y)], [0, 1])
same((x + y).subs({x: 1, y: 1}), 2); same(solve(2*x**2 - 2, x), [-1, 1]); same(2*sqrt(2), 2*sqrt(2)*1); same(((x + y)**2).subs({x: 1, y: 1}), 4)
xq8, yq8, lq8 = symbols('x y lambda', real=True)
same_set(solve([1 - 2*lq8*xq8, 1 - 2*lq8*yq8, xq8**2 + yq8**2 - 2], [xq8, yq8, lq8], dict=True), [{xq8: 1, yq8: 1, lq8: Rational(1, 2)}, {xq8: -1, yq8: -1, lq8: -Rational(1, 2)}])
same(Rational(6, 5)*0 + Rational(8, 5), Rational(8, 5)); holds(all(Rational(6, 5)*xi + Rational(8, 5) != yi for xi, yi in zip(X9, Y9)))
same(Rational(2, 25), Rational(8, 100)); same(Rational(1, 25), Rational(4, 100)); same(1 - 25*1, -24)
same(1 - 25*Rational(8, 100), -1)
same(solve_univariate_inequality(Abs(1 - 25*er_) < 1, er_, relational=False), Interval.open(0, Rational(2, 25)))
holds(all(bool(Abs(1 - 25*e_) < 1) == bool(0 < e_ < Rational(8, 100)) for e_ in (Rational(-1, 100), 0, Rational(4, 100), Rational(79, 1000), Rational(8, 100), Rational(81, 1000), 1)))
```
