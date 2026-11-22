---
title: Partial derivatives and the gradient
part: 5
lead: Extend the derivative to functions of several variables. You will read surfaces and contour maps, compute partial derivatives, tangent planes and linear approximations, and use the chain rule with tree diagrams; then you will find the direction of steepest ascent with the gradient and put it to work as machine learning does, in gradient descent and backpropagation.
minutes: 270
needs: Modules 1 to 16, especially limits (Module 2), the chain rule (Module 5), linearisation (Module 7), gradient descent (Module 8), and vectors, the dot product and planes (Module 16)
goals:
  - Describe a function of two or three variables by its domain, its graph, and its level curves or level surfaces
  - Decide whether a limit in two variables exists, by comparing paths or by squeezing
  - Compute partial derivatives of every order, and use Clairaut's theorem
  - Find tangent planes and linear approximations, and explain why differentiability needs more than partial derivatives
  - Apply the chain rule with tree diagrams, including implicit differentiation
  - Compute directional derivatives and gradients, and use them for steepest ascent, gradient descent and backpropagation
---

## Functions of several variables {#functions}

So far every function in this series has had one input. Most quantities depend on several. The volume of a cylindrical can depends on its radius $r$ and its height $h$: $V = \pi r^2 h$. The temperature on a weather map depends on two coordinates, the temperature in a room on three, and the error of a machine-learning model on all of its parameters, often millions of them. This module extends the derivative to such functions. Two variables already show every new idea, and most of what follows carries over to three variables, or to a million, unchanged.

::: definition Function of two variables
A **function of two variables** $f$ is a rule that assigns to each ordered pair of real numbers $(x, y)$ in a set $D$ exactly one real number $f(x, y)$, read "f of x, y". The set $D$, a set of points of the plane, is the **domain** of $f$, and the set of all values $f(x, y)$ for $(x, y)$ in $D$ is its **range**. A **function of three variables** assigns a number $f(x, y, z)$ to each point $(x, y, z)$ of a set $D$ in space.
:::

As in Module 1, when a function is given by a formula and nothing is said about its domain, the domain is the set of all points at which the formula gives a real number. One often writes $z = f(x, y)$ and calls $x$ and $y$ the **independent variables** and $z$ the **dependent variable**.

::: example Domains and ranges
Find the domain and the range of (a) $f(x, y) = \sqrt{9 - x^2 - y^2}$ and (b) $g(x, y) = \ln(y - x^2)$.

**(a)** The square root needs $9 - x^2 - y^2 \ge 0$, that is, $x^2 + y^2 \le 9$. Since $x^2 + y^2$ is the square of the distance from $(x, y)$ to the origin (Module 16), the domain is the disc of radius 3 centred at the origin, together with its edge, the circle $x^2 + y^2 = 9$. On the domain, $9 - x^2 - y^2$ lies between 0 and 9, so $f(x, y)$ lies between 0 and 3. Every number in $[0, 3]$ is a value: along the $x$-axis, $f(x, 0) = \sqrt{9 - x^2}$ runs through all of $[0, 3]$ as $x$ runs from 3 down to 0. The range is $[0, 3]$.

**(b)** The logarithm needs $y - x^2 > 0$, that is, $y > x^2$: the domain is the region above the parabola $y = x^2$, without the parabola itself. Along the $y$-axis, $g(0, y) = \ln y$ takes every real value as $y$ runs through $(0, \infty)$, so the range is $\R$.

```check
r_ = symbols('r', nonnegative=True)                                       # r_ = the distance from the origin
same(solve_univariate_inequality(9 - r_**2 >= 0, r_, relational=False).intersect(Interval(0, oo)), Interval(0, 3))
f171 = sqrt(9 - x**2 - y**2)
same(f171.subs({x: 0, y: 0}), 3); same(f171.subs({x: 3, y: 0}), 0)
same(function_range(sqrt(9 - x**2), x, Interval(0, 3)), Interval(0, 3))   # f(x, 0) for 0 <= x <= 3
same(function_range(log(y), y, Interval.open(0, oo)), S.Reals)            # g(0, y) = ln y
```
:::

### Graphs {#graphs}

The **graph** of a function $f$ of two variables is the set of points $(x, y, z)$ in space with $z = f(x, y)$ and $(x, y)$ in the domain. Above each point $(x, y)$ of the domain it has exactly one point, at height $f(x, y)$: it is a **surface** (Figure 17.1, left). The graph of $f(x, y) = \sqrt{9 - x^2 - y^2}$ from Example 17.1 is a dome: squaring $z = \sqrt{9 - x^2 - y^2}$ gives $x^2 + y^2 + z^2 = 9$ with $z \ge 0$, the upper half of the sphere of radius 3 centred at the origin. The graph of a linear function $f(x, y) = ax + by + c$ is a plane (Module 16).

```check
same(f171**2 + x**2 + y**2, 9)
```

Drawing a surface by hand is hard, and even a computer's picture of one hides some parts behind others. Mapmakers met this problem long ago.

### Level curves and contour maps {#level-curves}

A hiking map does not show a mountain in three dimensions. It draws **contour lines**, each joining the points at one height above sea level, and labels them with their heights. Weather maps do the same with **isotherms**, curves of equal temperature, and **isobars**, curves of equal air pressure.

::: definition Level curves
The **level curves** of a function $f$ of two variables are the curves $f(x, y) = k$, for constants $k$ in the range of $f$. A drawing of level curves for equally spaced values of $k$, labelled with the values, is a **contour map** of $f$.
:::

The level curve $f(x, y) = k$ is the set of points of the domain above which the surface has height $k$: cut the surface with the horizontal plane $z = k$, and look at the cut from above. Figure 17.1 shows a surface with two peaks, with its level curves drawn on it at their heights, and the contour map that they make.

::: figure id=fig-17-1
Left: the graph of $f(x, y) = (x^2 + 3y^2)e^{1 - x^2 - y^2}$, a landscape with two peaks of height 3 at $(0, \pm1)$, a pit at the origin and two passes at $(\pm1, 0)$. Its level curves $f = 0.5, 1, 1.5, 2, 2.5$ are drawn on the surface at their heights. Right: the same level curves seen from above, the contour map. The level curve $f = 1$ crosses itself at the passes.
:::

```check
fL = (x**2 + 3*y**2)*exp(1 - x**2 - y**2)
same([fL.subs({x: 0, y: 1}), fL.subs({x: 0, y: -1}), fL.subs({x: 1, y: 0}), fL.subs({x: -1, y: 0}), fL.subs({x: 0, y: 0})], [3, 3, 1, 1, 0])
same_set(solve([diff(fL, x), diff(fL, y)], [x, y], dict=True), [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}])
holds(diff(fL.subs(y, 0), x, 2).subs(x, 1) < 0); holds(diff(fL.subs(x, 1), y, 2).subs(y, 0) > 0)   # a pass: down along x, up along y
holds(diff(fL.subs(x, 0), y, 2).subs(y, 1) < 0); holds(diff(fL.subs(y, 1), x, 2).subs(x, 0) < 0)   # a peak at (0, 1)
```

A contour map is read like this:

- Where the level curves crowd together, the surface is steep; where they spread out, it is gentle. Equal steps in height take little horizontal distance on a steep slope.
- Small closed level curves nested around a point mark a peak or a pit; the labels tell you which.
- At a pass the level curve through it crosses itself, as $f = 1$ does in Figure 17.1.

::: example Level curves of a dome
Describe the level curves $f(x, y) = k$ of $f(x, y) = \sqrt{9 - x^2 - y^2}$ for $k = 0, 1, 2, 3$, and explain how they show the shape of the dome.

For $0 \le k \le 3$, $\sqrt{9 - x^2 - y^2} = k$ means $9 - x^2 - y^2 = k^2$ (both sides are non-negative, so squaring loses nothing), that is,

$$x^2 + y^2 = 9 - k^2,$$

the circle centred at the origin with radius $\sqrt{9 - k^2}$. The radii are 3, $\sqrt8 \approx 2.83$, $\sqrt5 \approx 2.24$ and 0: for $k = 3$ the "circle" is the single point $(0, 0)$, the top of the dome. The gaps between consecutive circles are about 0.17, 0.59 and 2.24. The circles crowd together near the edge, where the dome is steep (its sides are vertical there), and spread out near the top, where it is nearly flat.

```check
kk = symbols('k', nonnegative=True)
same(sqrt(9 - (9 - kk**2)), kk)                                         # on x^2 + y^2 = 9 - k^2, f = k
same([sqrt(9 - kv**2) for kv in (0, 1, 2, 3)], [3, sqrt(8), sqrt(5), 0])
rounds(sqrt(8), '2.83'); rounds(sqrt(5), '2.24')
rounds(3 - sqrt(8), '0.17'); rounds(sqrt(8) - sqrt(5), '0.59')
holds(3 - sqrt(8) < sqrt(8) - sqrt(5)); holds(sqrt(8) - sqrt(5) < sqrt(5))
```
:::

::: pitfall
A contour map alone cannot tell a peak from a pit: both are nested closed curves. Read the labels. And do not confuse level curves with the graph: the level curves of $f(x, y) = x^2 + y^2$ are circles, but its graph is a bowl, the surface $z = x^2 + y^2$, whose horizontal cuts are those circles.
:::

### Three variables and level surfaces {#level-surfaces}

The graph of a function of three variables would need four dimensions. Instead, one studies its **level surfaces** $f(x, y, z) = k$. For the temperature in a room, they are the surfaces of equal temperature. For $f(x, y, z) = x^2 + y^2 + z^2$, the square of the distance from the origin, the level surface $f = k$ is the sphere of radius $\sqrt k$ centred at the origin when $k > 0$, the single point $(0, 0, 0)$ when $k = 0$, and empty when $k < 0$. Section 17.6 finds tangent planes to level surfaces.

## Limits and continuity {#limits}

On the number line, $x$ can approach $a$ from two sides only. In the plane, $(x, y)$ can approach $(a, b)$ from every direction, along straight lines, spirals or any other path, and a limit must not depend on the path.

::: definition Limit
Let $f$ be defined at every point of a disc centred at $(a, b)$, except perhaps at $(a, b)$ itself. Then

$$\lim_{(x, y)\to(a, b)} f(x, y) = L,$$

read "the limit of f of x, y as (x, y) approaches (a, b) is L", if for every number $\varepsilon > 0$ there is a number $\delta > 0$ such that $\abs{f(x, y) - L} < \varepsilon$ for every point $(x, y)$ with

$$0 < \sqrt{(x - a)^2 + (y - b)^2} < \delta.$$
:::

This is the ε–δ definition of [Section 2.7](module_02_EN.html#precise), with the distance $\abs{x - a}$ on the line replaced by the distance in the plane: the values $f(x, y)$ are as close to $L$ as you like at all points close enough to $(a, b)$, in whatever direction they lie. (A disc centred at $(a, b)$ is the set of points at a distance less than some radius $\rho > 0$ from it. When $(a, b)$ is on the edge of the domain, as $(3, 0)$ is for the dome of Example 17.1, the same definition is used with $(x, y)$ restricted to the domain, as one-sided limits restrict $x$ to one side.)

The limit laws of Module 2 hold, with the same proofs: limits of sums, products and quotients are the sums, products and quotients of the limits (for quotients, when the limit of the denominator is not 0). In particular, for a polynomial in $x$ and $y$, or a rational function whose denominator is not 0 at $(a, b)$, the limit is the value. For example, $\lim_{(x,y)\to(1,2)} \dfrac{x^2 y + 1}{x + y} = \dfrac{2 + 1}{3} = 1$.

```check
same(((x**2*y + 1)/(x + y)).subs({x: 1, y: 2}), 1)
```

### Paths {#paths}

Here is a function with no limit at the origin:

$$f(x, y) = \frac{xy}{x^2 + y^2}, \qquad (x, y) \ne (0, 0).$$

Approach the origin along four lines, with $x = t$ shrinking towards 0:

```valuetable
t = 0.1, 0.01, 0.001, -0.001
$f(t, 0)$ = (t*0)/(t**2 + 0)
$f(t, t)$ = (t*t)/(t**2 + t**2)
$f(t, 2t)$ = (t*2*t)/(t**2 + 4*t**2)
$f(t, -t)$ = (t*(-t))/(t**2 + t**2)
---
t | f(t, 0) | f(t, t) | f(t, 2t) | f(t, -t)
0.1 | 0 | 0.5 | 0.4 | -0.5
0.01 | 0 | 0.5 | 0.4 | -0.5
0.001 | 0 | 0.5 | 0.4 | -0.5
-0.001 | 0 | 0.5 | 0.4 | -0.5
```

Along each line the values do not change at all, but they differ from line to line: 0 along the $x$-axis, 0.5 along $y = x$, 0.4 along $y = 2x$ and $-0.5$ along $y = -x$. However close to the origin you look, there are values near 0.5 and values near $-0.5$, so no single number $L$ satisfies Definition 17.3.

::: theorem Limits along paths
Suppose that $\lim_{(x, y)\to(a, b)} f(x, y) = L$, and let $x(t)$ and $y(t)$ be functions with $x(t) \to a$ and $y(t) \to b$ as $t \to t_0$, and $\big(x(t), y(t)\big) \ne (a, b)$ for $t \ne t_0$ near $t_0$. Then

$$\lim_{t\to t_0} f\big(x(t), y(t)\big) = L.$$

So if $f$ approaches different numbers along two such paths, or no number along one of them, then $\lim_{(x, y)\to(a, b)} f(x, y)$ does not exist.
:::

::: proof
Let $\varepsilon > 0$, and take $\delta$ as in Definition 17.3. As $t \to t_0$, the distance $\sqrt{(x(t) - a)^2 + (y(t) - b)^2}$ tends to 0, so it is less than $\delta$ for every $t \ne t_0$ close enough to $t_0$; and it is not 0 there, since the point is not $(a, b)$. For those $t$, $\abs{f(x(t), y(t)) - L} < \varepsilon$, which is what $\lim_{t\to t_0} f(x(t), y(t)) = L$ means. If the limit existed, it would therefore be the limit along every path, which is impossible when two paths give different numbers.
:::

::: example A limit that depends on the path
Show that $\lim_{(x, y)\to(0, 0)} \dfrac{xy}{x^2 + y^2}$ does not exist.

Along the line $y = mx$, with $x \ne 0$,

$$f(x, mx) = \frac{x \cdot mx}{x^2 + m^2x^2} = \frac{m x^2}{(1 + m^2)x^2} = \frac{m}{1 + m^2}.$$

So $f$ is constant along each line through the origin: 0 along the $x$-axis ($m = 0$) and $\tfrac12$ along $y = x$ ($m = 1$). Two paths give two different limits, so by Theorem 17.1 the limit does not exist. Near the origin the graph is a twisted surface: every value from $-\tfrac12$ to $\tfrac12$ (the range of $m/(1 + m^2)$) is taken on a whole line through the origin, arbitrarily close to it.

```check
fp172 = x*y/(x**2 + y**2)
steps(fp172.subs(y, m*x), m*x**2/((1 + m**2)*x**2), m/(1 + m**2))
same((m/(1 + m**2)).subs(m, 0), 0); same((m/(1 + m**2)).subs(m, 1), Rational(1, 2)); same((m/(1 + m**2)).subs(m, 2), Rational(2, 5))
same(function_range(m/(1 + m**2), m, S.Reals), Interval(-Rational(1, 2), Rational(1, 2)))
limit_is(fp172.subs(y, 0), x, 0, 0); limit_is(fp172.subs(y, x), x, 0, Rational(1, 2)); same(fp172.subs(x, 0), 0)
```
:::

::: pitfall
Agreement along every straight line does not prove that a limit exists. For $g(x, y) = \dfrac{x^2 y}{x^4 + y^2}$, every line through the origin gives the limit 0: along $y = mx$, $g = \dfrac{mx}{x^2 + m^2}$, which tends to 0 (for $m = 0$ it is 0), and along the $y$-axis $g = 0$. But along the parabola $y = x^2$, $g = \dfrac{x^4}{2x^4} = \dfrac12$. The limit does not exist. To prove that a limit exists, you need an argument that covers all points near $(a, b)$ at once.

```check
g173 = x**2*y/(x**4 + y**2)
same(g173.subs(y, m*x), m*x/(x**2 + m**2)); limit_is(m*x/(x**2 + m**2), x, 0, 0)
same(g173.subs(y, 0), 0); same(g173.subs(x, 0), 0); same(g173.subs(y, x**2), Rational(1, 2))
```
:::

### Squeezing {#squeeze}

The squeeze theorem of [Section 2.6](module_02_EN.html#squeeze) gives such an argument.

::: theorem The squeeze theorem in two variables
Suppose that $\abs{f(x, y) - L} \le g(x, y)$ for every point $(x, y) \ne (a, b)$ of a disc centred at $(a, b)$, and that $\lim_{(x, y)\to(a, b)} g(x, y) = 0$. Then $\lim_{(x, y)\to(a, b)} f(x, y) = L$.
:::

::: proof
Let $\varepsilon > 0$. Since $g \to 0$, there is a $\delta > 0$, which may be taken no larger than the radius of the disc, such that $g(x, y) < \varepsilon$ whenever $0 < \sqrt{(x - a)^2 + (y - b)^2} < \delta$. For those points, $\abs{f(x, y) - L} \le g(x, y) < \varepsilon$.
:::

::: example A limit by squeezing
Find $\lim_{(x, y)\to(0, 0)} \dfrac{3x^2 y}{x^2 + y^2}$.

Along the line $y = mx$ the function is $\dfrac{3m x^3}{(1 + m^2)x^2} = \dfrac{3m x}{1 + m^2}$, which tends to 0, and along the $y$-axis it is 0. So if the limit exists, it is 0 (Theorem 17.1). To prove that it exists, squeeze. For $(x, y) \ne (0, 0)$, $x^2 \le x^2 + y^2$, so $\dfrac{x^2}{x^2 + y^2} \le 1$ and

$$\abs{\frac{3x^2 y}{x^2 + y^2} - 0} = 3\abs{y}\,\frac{x^2}{x^2 + y^2} \le 3\abs{y}.$$

As $(x, y) \to (0, 0)$, $3\abs{y} \to 0$, because $\abs{y} \le \sqrt{x^2 + y^2}$. By Theorem 17.2 the limit is 0. In ε–δ terms, $\delta = \varepsilon/3$ works: $\sqrt{x^2 + y^2} < \varepsilon/3$ gives $3\abs{y} < \varepsilon$.

```check
f174 = 3*x**2*y/(x**2 + y**2)
same(f174.subs(y, m*x), 3*m*x/(1 + m**2)); limit_is(3*m*x/(1 + m**2), x, 0, 0); same(f174.subs(x, 0), 0)
xr, yr = symbols('x y', real=True)
same(3*Abs(yr) - Abs(3*xr**2*yr/(xr**2 + yr**2)), 3*Abs(yr)*yr**2/(xr**2 + yr**2))   # the gap below 3|y| is >= 0
holds(all(abs(f174.subs({x: p_, y: q_})) <= 3*abs(q_) for p_ in (Rational(1, 3), -2, Rational(7, 10)) for q_ in (Rational(1, 5), -1, 3)))
```
:::

### Continuity {#continuity}

::: definition Continuity
Let $f$ be defined on a disc centred at $(a, b)$. Then $f$ is **continuous at $(a, b)$** if

$$\lim_{(x, y)\to(a, b)} f(x, y) = f(a, b).$$

It is **continuous on a set** if it is continuous at every point of the set (at points on the edge of the domain, with the limit taken over points of the domain).
:::

As in [Module 3](module_03_EN.html#continuous-functions), sums, products and quotients of continuous functions are continuous (quotients where the denominator is not 0), and so are compositions: if $g(x, y)$ is continuous at $(a, b)$ and a function $h$ of one variable is continuous at $g(a, b)$, then $h\big(g(x, y)\big)$ is continuous at $(a, b)$. Since $x$ and $y$ themselves are continuous, every polynomial in $x$ and $y$ is continuous everywhere, every rational function wherever its denominator is not 0, and functions such as $e^{xy}\sin y$ and $\ln(x^2 + y^2)$ wherever they are defined.

At a point where a formula breaks down, look closer. The functions of Examples 17.3 and 17.4 are both undefined at the origin. Give each the value 0 there: the function of Example 17.4 becomes continuous everywhere, since its limit at the origin is 0, but the function of Example 17.3 is not continuous at the origin, since it has no limit there. It returns in Section 17.4, as a warning.

## Partial derivatives {#partial-derivatives}

Take a can of radius $r = 3$ cm and height $h = 10$ cm, with volume $V(3, 10) = 90\pi \approx 282.7$ cm³. How fast does the volume change when the radius changes and the height does not? Widen the can by $\Delta$ cm, or make it $\Delta$ cm taller, and divide each change of volume by $\Delta$:

```valuetable
Delta = 1, 0.1, 0.01, 0.001, -0.001
$\dfrac{V(3 + \Delta, 10) - V(3, 10)}{\Delta}$ = (pi*(3 + Delta)**2*10 - 90*pi)/Delta
$\dfrac{V(3, 10 + \Delta) - V(3, 10)}{\Delta}$ = (pi*9*(10 + Delta) - 90*pi)/Delta
---
\Delta | \dfrac{V(3 + \Delta, 10) - V(3, 10)}{\Delta} | \dfrac{V(3, 10 + \Delta) - V(3, 10)}{\Delta}
1 | 219.911 | 28.2743
0.1 | 191.637 | 28.2743
0.01 | 188.810 | 28.2743
0.001 | 188.527 | 28.2743
-0.001 | 188.464 | 28.2743
```

With the height held at 10, $V = 10\pi r^2$ is a function of $r$ alone, and the first column approaches its derivative at $r = 3$, $20\pi r = 60\pi \approx 188.5$. With the radius held at 3, $V = 9\pi h$ is a linear function of $h$, and the second column is its slope, $9\pi \approx 28.27$, whatever $\Delta$ is. These two numbers are the **partial derivatives** of $V$ at $(3, 10)$: near this size the volume grows by about 188.5 cm³ per centimetre of radius and by about 28.3 cm³ per centimetre of height. Widening the can adds volume more than six times as fast as lengthening it.

```check
Vc = pi*r**2*h
same(Vc.subs({r: 3, h: 10}), 90*pi); rounds(90*pi, '282.7')
same(diff(10*pi*r**2, r).subs(r, 3), 60*pi); rounds(60*pi, '188.5'); same(diff(9*pi*h, h), 9*pi); rounds(9*pi, '28.27'); rounds(9*pi, '28.3')
holds(6 < 60*pi/(9*pi)); holds(60*pi/(9*pi) < 7)
```

::: definition Partial derivatives
Let $f$ be a function of two variables defined on a disc centred at $(a, b)$. The **partial derivative of $f$ with respect to $x$** at $(a, b)$ is

$$f_x(a, b) = \lim_{h\to0}\frac{f(a + h, b) - f(a, b)}{h},$$

and the **partial derivative with respect to $y$** is

$$f_y(a, b) = \lim_{h\to0}\frac{f(a, b + h) - f(a, b)}{h},$$

provided that the limits exist.
:::

$f_x$ reads "f sub x". Other notations are $\dfrac{\partial f}{\partial x}$, read "partial f by partial x" (the rounded $\partial$, read "partial", warns that $f$ has other variables, held fixed), and $\dfrac{\partial z}{\partial x}$ when $z = f(x, y)$. Letting the point vary gives two new functions of two variables, $f_x(x, y)$ and $f_y(x, y)$.

The definition says that $f_x(a, b)$ is the ordinary derivative at $a$ of the function of one variable $x \mapsto f(x, b)$, in which $y$ is frozen at $b$. That gives the rule for computing partial derivatives.

::: keyidea
To find $f_x$, treat $y$ as a constant and differentiate with respect to $x$ by the rules of Modules 4 to 6. To find $f_y$, treat $x$ as a constant and differentiate with respect to $y$.
:::

Geometrically, the vertical plane $y = b$ cuts the surface $z = f(x, y)$ along the curve $z = f(x, b)$, and $f_x(a, b)$ is the slope of that curve at the point $P(a, b, f(a, b))$: the rate at which the surface rises as you move from $P$ in the direction of the positive $x$-axis. Likewise $f_y(a, b)$ is the slope of the curve cut by the plane $x = a$ (Figure 17.2, left). For $f(x, y) = 6 - x^2 - 2y^2$ at $P(1, 1, 3)$, the plane $y = 1$ cuts out the curve $z = 4 - x^2$, of slope $-2x = -2$ at $x = 1$, and the plane $x = 1$ cuts out $z = 5 - 2y^2$, of slope $-4y = -4$ at $y = 1$. So $f_x(1, 1) = -2$ and $f_y(1, 1) = -4$; by the rule, $f_x = -2x$ and $f_y = -4y$ everywhere.

```check
fd = 6 - x**2 - 2*y**2
same(fd.subs({x: 1, y: 1}), 3); same(fd.subs(y, 1), 4 - x**2); same(fd.subs(x, 1), 5 - 2*y**2)
same(diff(4 - x**2, x).subs(x, 1), -2); same(diff(5 - 2*y**2, y).subs(y, 1), -4)
same(diff(fd, x), -2*x); same(diff(fd, y), -4*y)
same(limit((fd.subs({x: 1 + h, y: 1}) - fd.subs({x: 1, y: 1}))/h, h, 0), -2)      # from the definition
```

::: figure id=fig-17-2
Left: the surface $z = 6 - x^2 - 2y^2$ and the point $P(1, 1, 3)$. The plane $y = 1$ cuts out the blue curve $z = 4 - x^2$, whose tangent line at $P$ (dark) has slope $f_x(1, 1) = -2$; the plane $x = 1$ cuts out the orange curve $z = 5 - 2y^2$, whose tangent line (red) has slope $f_y(1, 1) = -4$. Right: the tangent plane $z = 9 - 2x - 4y$ at $P$ (Section 17.4) contains both tangent lines.
:::

### Computing partial derivatives {#computing}

::: example Partial derivatives by the rules
Find the partial derivatives of (a) $f(x, y) = x^3y^2 - 5xy + 2y^3$, with their values at $(1, 2)$, (b) $g(x, y) = \sin(xy^2)$ and (c) $q(x, y) = \dfrac{x}{x^2 + y^2}$.

**(a)** With $y$ held constant, $y^2$ is a constant factor of $x^3y^2$, $-5y$ a constant factor of $x$, and $2y^3$ a constant:

$$f_x = 3x^2y^2 - 5y, \qquad f_y = 2x^3y - 5x + 6y^2.$$

At $(1, 2)$: $f_x(1, 2) = 12 - 10 = 2$ and $f_y(1, 2) = 4 - 5 + 24 = 23$.

**(b)** By the chain rule, with the inner function $xy^2$, whose partial derivatives are $y^2$ and $2xy$:

$$g_x = y^2\cos(xy^2), \qquad g_y = 2xy\cos(xy^2).$$

**(c)** By the quotient rule. With $y$ constant, the derivative of the denominator is $2x$, so

$$q_x = \frac{(x^2 + y^2) - x \cdot 2x}{(x^2 + y^2)^2} = \frac{y^2 - x^2}{(x^2 + y^2)^2}.$$

With $x$ constant, the numerator is a constant, so

$$q_y = -\frac{x \cdot 2y}{(x^2 + y^2)^2} = -\frac{2xy}{(x^2 + y^2)^2},$$

both for $(x, y) \ne (0, 0)$.

```check
f175 = x**3*y**2 - 5*x*y + 2*y**3
same(diff(f175, x), 3*x**2*y**2 - 5*y); same(diff(f175, y), 2*x**3*y - 5*x + 6*y**2)
same((3*x**2*y**2 - 5*y).subs({x: 1, y: 2}), 2); same((2*x**3*y - 5*x + 6*y**2).subs({x: 1, y: 2}), 23)
g175 = sin(x*y**2)
same(diff(g175, x), y**2*cos(x*y**2)); same(diff(g175, y), 2*x*y*cos(x*y**2))
q175 = x/(x**2 + y**2)
steps(diff(q175, x), ((x**2 + y**2) - x*2*x)/(x**2 + y**2)**2, (y**2 - x**2)/(x**2 + y**2)**2)
steps(diff(q175, y), -x*2*y/(x**2 + y**2)**2, -2*x*y/(x**2 + y**2)**2)
```
:::

::: pitfall
When you differentiate with respect to $x$, a factor that contains only $y$ is a constant: $\dfrac{\partial}{\partial x}\big(x^3y^2\big) = 3x^2y^2$, not $3x^2y^2 + 2x^3y$, and $\dfrac{\partial}{\partial x}\big(y^3\big) = 0$. The product rule is needed only when both factors contain $x$.

```check
same(diff(x**3*y**2, x), 3*x**2*y**2); same(diff(y**3, x), 0)
```
:::

For a function of three variables, $f_x$, $f_y$ and $f_z$ are defined in the same way, each with the other two variables held fixed. For $w = xy^2z^3$: $w_x = y^2z^3$, $w_y = 2xyz^3$ and $w_z = 3xy^2z^2$.

```check
w3 = x*y**2*z**3
same(diff(w3, x), y**2*z**3); same(diff(w3, y), 2*x*y*z**3); same(diff(w3, z), 3*x*y**2*z**2)
```

### Higher partial derivatives {#higher}

The partial derivatives $f_x$ and $f_y$ are again functions of $x$ and $y$, with partial derivatives of their own, the four **second partial derivatives** of $f$:

$$\begin{aligned} f_{xx} &= (f_x)_x = \frac{\partial^2 f}{\partial x^2}, & f_{xy} &= (f_x)_y = \frac{\partial^2 f}{\partial y\,\partial x}, \\ f_{yx} &= (f_y)_x = \frac{\partial^2 f}{\partial x\,\partial y}, & f_{yy} &= (f_y)_y = \frac{\partial^2 f}{\partial y^2}. \end{aligned}$$

$f_{xy}$ reads "f sub x y". Mind the order: in $f_{xy}$ you differentiate first with respect to $x$, then $y$, reading from left to right; in $\dfrac{\partial^2 f}{\partial y\,\partial x}$, the same derivative, you read from right to left. $f_{xy}$ and $f_{yx}$ are the **mixed partial derivatives**.

::: example Second partial derivatives
Find the four second partial derivatives of $f(x, y) = x^3y^2 - 5xy + 2y^3$ from Example 17.5, and the mixed partial derivatives of $g(x, y) = \sin(xy^2)$.

From $f_x = 3x^2y^2 - 5y$ and $f_y = 2x^3y - 5x + 6y^2$:

$$\begin{aligned} f_{xx} &= 6xy^2, & f_{xy} &= 6x^2y - 5, \\ f_{yx} &= 6x^2y - 5, & f_{yy} &= 2x^3 + 12y. \end{aligned}$$

For $g$, differentiate $g_x = y^2\cos(xy^2)$ with respect to $y$, and $g_y = 2xy\cos(xy^2)$ with respect to $x$, each by the product rule and the chain rule:

$$\begin{aligned} g_{xy} &= 2y\cos(xy^2) - y^2\sin(xy^2)\cdot 2xy \\ &= 2y\cos(xy^2) - 2xy^3\sin(xy^2), \\ g_{yx} &= 2y\cos(xy^2) - 2xy\sin(xy^2)\cdot y^2 \\ &= 2y\cos(xy^2) - 2xy^3\sin(xy^2). \end{aligned}$$

Both times the mixed partial derivatives agree, though they were computed in different ways.

```check
same(diff(f175, x, x), 6*x*y**2); same(diff(f175, x, y), 6*x**2*y - 5); same(diff(f175, y, x), 6*x**2*y - 5); same(diff(f175, y, y), 2*x**3 + 12*y)
steps(diff(y**2*cos(x*y**2), y), 2*y*cos(x*y**2) - y**2*sin(x*y**2)*2*x*y, 2*y*cos(x*y**2) - 2*x*y**3*sin(x*y**2))
steps(diff(2*x*y*cos(x*y**2), x), 2*y*cos(x*y**2) - 2*x*y*sin(x*y**2)*y**2, 2*y*cos(x*y**2) - 2*x*y**3*sin(x*y**2))
same(diff(g175, x, y), diff(g175, y, x))
```
:::

The agreement is no accident.

::: theorem Clairaut's theorem
Suppose that $f$ is defined on a disc $D$ that contains the point $(a, b)$. If the functions $f_{xy}$ and $f_{yx}$ are both continuous on $D$, then $f_{xy}(a, b) = f_{yx}(a, b)$.
:::

The functions met in this series have mixed partial derivatives given by formulas built from the catalogue of Module 1, which are continuous wherever they are defined; there the order of differentiation does not matter. The hypothesis cannot be dropped: Exercise 17.10 gives a function with $f_{xy}(0, 0) = -1$ but $f_{yx}(0, 0) = 1$. The theorem extends to higher derivatives: for example, $f_{xyy} = f_{yxy} = f_{yyx}$ when these are continuous.

::: deeper The proof of Clairaut's theorem
A first reading may skip this proof. It uses the Mean Value Theorem ([Theorem 8.4](module_08_EN.html#mvt)) four times. For a small $h \ne 0$, so small that the square with corners $(a, b)$ and $(a + h, b + h)$ lies in $D$, consider the combination of four values

$$\Delta(h) = f(a + h, b + h) - f(a + h, b) - f(a, b + h) + f(a, b).$$

**First grouping.** Let $G(x) = f(x, b + h) - f(x, b)$, so that $\Delta(h) = G(a + h) - G(a)$. The partial derivative $f_x$ exists on $D$ (it must, for $f_{xy}$ to exist there), so $G$ is differentiable, with $G'(x) = f_x(x, b + h) - f_x(x, b)$. By the Mean Value Theorem there is a number $c$ between $a$ and $a + h$ with

$$\Delta(h) = h\,G'(c) = h\big(f_x(c, b + h) - f_x(c, b)\big).$$

The function $y \mapsto f_x(c, y)$ has the derivative $f_{xy}(c, y)$, so by the Mean Value Theorem again there is a number $d$ between $b$ and $b + h$ with $f_x(c, b + h) - f_x(c, b) = h\,f_{xy}(c, d)$. So $\Delta(h) = h^2 f_{xy}(c, d)$.

**Second grouping.** Let $H(y) = f(a + h, y) - f(a, y)$, so that $\Delta(h) = H(b + h) - H(b)$. The same two steps, first in $y$ and then in $x$, give numbers $c'$ and $d'$, within $\abs{h}$ of $a$ and $b$, with $\Delta(h) = h^2 f_{yx}(c', d')$.

So $f_{xy}(c, d) = f_{yx}(c', d')$ for every small $h \ne 0$. As $h \to 0$, both points $(c, d)$ and $(c', d')$ approach $(a, b)$, and since $f_{xy}$ and $f_{yx}$ are continuous there, the two sides approach $f_{xy}(a, b)$ and $f_{yx}(a, b)$. Equal quantities have equal limits.

```check
Fq = Function('F')
D_ = Fq(a + h, b + h) - Fq(a + h, b) - Fq(a, b + h) + Fq(a, b)
G_ = lambda X: Fq(X, b + h) - Fq(X, b); H_ = lambda Y: Fq(a + h, Y) - Fq(a, Y)
same(G_(a + h) - G_(a), D_); same(H_(b + h) - H_(b), D_)
```
:::

Many laws of physics are equations between partial derivatives, called **partial differential equations**. The temperature $u(x, t)$ at position $x$ along a thin rod at time $t$ obeys the **heat equation** $u_t = k\,u_{xx}$ for a constant $k > 0$ that depends on the material; steady temperatures in a flat plate obey **Laplace's equation** $u_{xx} + u_{yy} = 0$ (Exercise 17.9). Solving such equations is beyond this course, but checking a solution needs only partial derivatives: $u = e^{-t}\sin x$ satisfies the heat equation with $k = 1$, since $u_t = -e^{-t}\sin x$ and $u_{xx} = -e^{-t}\sin x$.

```check
uh = exp(-t)*sin(x)
same(diff(uh, t), -exp(-t)*sin(x)); same(diff(uh, x, 2), -exp(-t)*sin(x))
```

::: compute Partial derivatives with SymPy
`sp.diff` takes partial derivatives: name the variable, and SymPy holds the others fixed. Several variables in a row give higher derivatives, taken in the order written:

```python
import sympy as sp
x, y = sp.symbols('x y')
f = x**3*y**2 - 5*x*y + 2*y**3                  # Example 17.5
print(sp.diff(f, x), '|', sp.diff(f, y))
print(sp.diff(f, x, y), '|', sp.diff(f, y, x))  # f_xy and f_yx
print(sp.diff(f, x).subs({x: 1, y: 2}))         # f_x(1, 2)
```

```output
3*x**2*y**2 - 5*y | 2*x**3*y - 5*x + 6*y**2
6*x**2*y - 5 | 6*x**2*y - 5
2
```

`sp.diff(f, x, y)` differentiates first with respect to $x$, then $y$: it is $f_{xy}$. A repeated variable can be given with a count: `sp.diff(f, x, 2)` is $f_{xx}$. The can from the start of this section:

```python
r, h = sp.symbols('r h', positive=True)
V = sp.pi*r**2*h
print(sp.diff(V, r), '|', sp.diff(V, h))
Vr = sp.diff(V, r).subs({r: 3, h: 10})     # V_r(3, 10)
print(Vr, '=', sp.N(Vr))
```

```output
2*pi*h*r | pi*r**2
60*pi = 188.495559215388
```

SymPy writes $2\pi rh$ as `2*pi*h*r`, with the factors in its own order. At $(3, 10)$ it is $60\pi \approx 188.5$, the number that the first column of the table at the start of this section approaches.
:::

```check
same(2*pi*h*r, 2*pi*r*h); rounds(60*pi, '188.495559215388')
```

## Tangent planes and linear approximation {#tangent-planes}

Zoom in on the graph of a differentiable function of one variable and it looks more and more like a straight line, its tangent line; [Section 7.2](module_07_EN.html#linear-approximation) turned that into linear approximation. Zoom in on a smooth surface, and it looks more and more like a plane, its **tangent plane**.

Which plane? A plane through the point $P(a, b, c)$ that is not vertical has an equation $z - c = A(x - a) + B(y - b)$ (Module 16). The vertical plane $y = b$ cuts it along the line $z - c = A(x - a)$, of slope $A$. If the plane is to touch the surface at $P$, this line should be the tangent line of the curve that the same vertical plane cuts out of the surface, whose slope is $f_x(a, b)$. So $A = f_x(a, b)$, and in the same way $B = f_y(a, b)$: the tangent plane is the plane through the two tangent lines of Figure 17.2.

::: definition Tangent plane
Suppose that the partial derivatives of $f$ exist on a disc centred at $(a, b)$ and are continuous at $(a, b)$. The **tangent plane** to the surface $z = f(x, y)$ at the point $P(a, b, f(a, b))$ is the plane

$$z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b).$$
:::

The condition of continuity makes sure that this plane fits the surface in every direction, not only in the two directions of the slices; the subsection on differentiability below explains why it is needed.

::: example A tangent plane
Find the tangent plane to the surface $z = 6 - x^2 - 2y^2$ at $P(1, 1, 3)$.

The partial derivatives $f_x = -2x$ and $f_y = -4y$ are polynomials, continuous everywhere, and at $(1, 1)$ they are $-2$ and $-4$ (Section 17.3). The tangent plane is

$$\begin{aligned} z &= 3 - 2(x - 1) - 4(y - 1), \\ \text{that is,}\quad z &= 9 - 2x - 4y. \end{aligned}$$

It passes through $P$: $9 - 2 - 4 = 3$. The surface lies below it, because the difference is

$$(6 - x^2 - 2y^2) - (9 - 2x - 4y) = -(x - 1)^2 - 2(y - 1)^2,$$

which is negative except at $(1, 1)$. Like the graph of a concave down function and its tangent lines (Module 8), the surface bends away below its tangent plane (Figure 17.2, right).

```check
plane177 = 3 - 2*(x - 1) - 4*(y - 1)
same(expand(plane177), 9 - 2*x - 4*y); same((9 - 2*x - 4*y).subs({x: 1, y: 1}), 3)
same(expand(fd - (9 - 2*x - 4*y)), expand(-(x - 1)**2 - 2*(y - 1)**2))
```
:::

The function whose graph is the tangent plane,

$$L(x, y) = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b),$$

is the **linearisation** of $f$ at $(a, b)$, and $f(x, y) \approx L(x, y)$ for $(x, y)$ near $(a, b)$ is the **linear approximation** of $f$ at $(a, b)$. With $\Delta x = x - a$ and $\Delta y = y - b$ it reads

$$f(a + \Delta x, b + \Delta y) \approx f(a, b) + f_x(a, b)\,\Delta x + f_y(a, b)\,\Delta y:$$

each variable contributes its own rate times its own change.

::: example Linear approximation of a hypotenuse
A right triangle with legs 3 and 4 has hypotenuse 5. Use the linearisation of $f(x, y) = \sqrt{x^2 + y^2}$ at $(3, 4)$ to estimate the hypotenuse when the legs are 3.02 and 3.97.

By the chain rule, $f_x = \dfrac{x}{\sqrt{x^2 + y^2}}$ and $f_y = \dfrac{y}{\sqrt{x^2 + y^2}}$, which are continuous wherever $(x, y) \ne (0, 0)$. At $(3, 4)$ they are $\tfrac35$ and $\tfrac45$, so

$$L(x, y) = 5 + \tfrac35(x - 3) + \tfrac45(y - 4).$$

With $\Delta x = 0.02$ and $\Delta y = -0.03$,

$$\begin{aligned} L(3.02, 3.97) &= 5 + 0.6(0.02) + 0.8(-0.03) \\ &= 5 + 0.012 - 0.024 = 4.988. \end{aligned}$$

A calculator gives $\sqrt{3.02^2 + 3.97^2} = \sqrt{24.8813} \approx 4.98812$: the estimate is off by about 0.00012.

```check
fh = sqrt(x**2 + y**2)
same(diff(fh, x), x/sqrt(x**2 + y**2)); same(diff(fh, y), y/sqrt(x**2 + y**2))
same(diff(fh, x).subs({x: 3, y: 4}), Rational(3, 5)); same(diff(fh, y).subs({x: 3, y: 4}), Rational(4, 5)); same(fh.subs({x: 3, y: 4}), 5)
Lh = 5 + Rational(3, 5)*(x - 3) + Rational(4, 5)*(y - 4)
X1, Y1 = Rational(302, 100), Rational(397, 100)
steps(Lh.subs({x: X1, y: Y1}), 5 + Rational(6, 10)*Rational(2, 100) + Rational(8, 10)*(-Rational(3, 100)), 5 + Rational(12, 1000) - Rational(24, 1000), Rational(4988, 1000))
same(X1**2 + Y1**2, Rational(248813, 10000)); rounds(fh.subs({x: X1, y: Y1}), '4.98812'); rounds(fh.subs({x: X1, y: Y1}) - Rational(4988, 1000), '0.00012')
```
:::

How good is the approximation in general? Move from $(3, 4)$ to $(3 + t, 4 - t)$, a distance $\sqrt2\,\abs{t}$ away, and compare $f$ with $L$:

```valuetable
t = 0.1, 0.01, 0.001
$f$ = sqrt((3 + t)**2 + (4 - t)**2)
$L$ = 5 + 3*t/5 - 4*t/5
$f - L$ = sqrt((3 + t)**2 + (4 - t)**2) - 5 + t/5
$\dfrac{f - L}{\sqrt2\,t}$ = (sqrt((3 + t)**2 + (4 - t)**2) - 5 + t/5)/(sqrt(2)*t)
---
t | f | L | f - L | \dfrac{f - L}{\sqrt2\,t}
0.1 | 4.98197 | 4.98 | 0.00196748 | 0.0139122
0.01 | 4.99802 | 4.998 | 1.96078\times10^{-5} | 0.00138648
0.001 | 4.99980 | 4.9998 | 1.96008\times10^{-7} | 0.000138598
```

As in Module 7, the error $f - L$ shrinks about a hundredfold each time the distance shrinks tenfold, so the error divided by the distance, in the last column, tends to 0: near $(3, 4)$ the error is small even compared with the distance from $(3, 4)$. That property is what makes a plane tangent.

```check
E_ = lambda T: fh.subs({x: 3 + T, y: 4 - T}) - Lh.subs({x: 3 + T, y: 4 - T})
same(Lh.subs({x: 3 + t, y: 4 - t}), 5 + 3*t/5 - 4*t/5); same(Lh.subs({x: 3 + t, y: 4 - t}), 5 - t/5)
rounds(E_(Rational(1, 10))/E_(Rational(1, 100)), '100'); rounds(E_(Rational(1, 100))/E_(Rational(1, 1000)), '100')
limit_is(E_(t)/(sqrt(2)*t), t, 0, 0, '+')
```

### Differentiability {#differentiability}

::: definition Differentiability
A function $f$ of two variables is **differentiable at $(a, b)$** if $f_x(a, b)$ and $f_y(a, b)$ exist and the error of its linearisation, $E(x, y) = f(x, y) - L(x, y)$, satisfies

$$\lim_{(x, y)\to(a, b)}\frac{E(x, y)}{\sqrt{(x - a)^2 + (y - b)^2}} = 0.$$

It is **differentiable on a set** if it is differentiable at every point of the set.
:::

For one variable, [Theorem 7.1](module_07_EN.html#how-good) showed that $E(x)/(x - a) \to 0$ whenever $f'(a)$ exists. For two variables the two partial derivatives are not enough, as the Going deeper box below shows: differentiability asks the plane to fit in every direction at once. Two theorems make the definition usable. The first is the analogue of [Theorem 4.1](module_04_EN.html#continuity).

::: theorem Differentiable functions are continuous
If $f$ is differentiable at $(a, b)$, then $f$ is continuous at $(a, b)$.
:::

::: proof
Write $\rho = \sqrt{(x - a)^2 + (y - b)^2}$. For $(x, y) \ne (a, b)$,

$$f(x, y) = L(x, y) + \frac{E(x, y)}{\rho}\,\rho.$$

As $(x, y) \to (a, b)$: $L(x, y) \to L(a, b) = f(a, b)$, because $L$ is a polynomial; $E/\rho \to 0$, by differentiability; and $\rho \to 0$. So $f(x, y) \to f(a, b) + 0 \cdot 0 = f(a, b)$.
:::

::: theorem Continuous partial derivatives give differentiability
If $f_x$ and $f_y$ exist on a disc centred at $(a, b)$ and are continuous at $(a, b)$, then $f$ is differentiable at $(a, b)$.
:::

The proof is in the Going deeper box below. Theorem 17.5 is how differentiability is checked in practice. Polynomials are differentiable everywhere, and functions such as $e^{xy}\sin y$ or $\ln(x^2 + y^2)$ wherever they are defined: the rules give partial derivatives that are again formulas of the same kind, continuous there. The definition of the tangent plane (Definition 17.6) asks for continuous partial derivatives for this reason: then $f$ is differentiable, and the plane is the one that fits.

::: deeper Partial derivatives are not enough
A first reading may skip this box. Let $f(x, y) = \dfrac{xy}{x^2 + y^2}$ for $(x, y) \ne (0, 0)$ and $f(0, 0) = 0$, the function of Example 17.3. On both axes $f$ is 0, so

$$f_x(0, 0) = \lim_{h\to0}\frac{f(h, 0) - f(0, 0)}{h} = \lim_{h\to0}\frac{0 - 0}{h} = 0,$$

and $f_y(0, 0) = 0$ in the same way. Both partial derivatives exist, and the linearisation at the origin is $L(x, y) = 0$. But $f$ is not continuous at the origin (Section 17.2), so by Theorem 17.4 it is not differentiable there, and the plane $z = 0$ is no tangent plane: along the line $y = x$ the surface stays at height $\tfrac12$, however close to the origin. The partial derivatives see only the slices along the two axes, and this surface is flat along them and nowhere else near the origin.

**Proof of Theorem 17.5.** Let $(x, y)$ be in the disc, and write $\Delta x = x - a$, $\Delta y = y - b$ and $\rho = \sqrt{\Delta x^2 + \Delta y^2}$. Go from $(a, b)$ to $(x, y)$ in two legs, first changing $y$, then $x$:

$$f(x, y) - f(a, b) = \big[f(x, y) - f(a, y)\big] + \big[f(a, y) - f(a, b)\big].$$

By the Mean Value Theorem, applied to $f$ as a function of $x$ alone on the first leg and of $y$ alone on the second, the brackets are $f_x(c, y)\,\Delta x$ and $f_y(a, d)\,\Delta y$, for some $c$ between $a$ and $x$ and some $d$ between $b$ and $y$. Subtract $f_x(a, b)\,\Delta x + f_y(a, b)\,\Delta y$ from both sides:

$$E(x, y) = \big[f_x(c, y) - f_x(a, b)\big]\Delta x + \big[f_y(a, d) - f_y(a, b)\big]\Delta y.$$

Since $\abs{\Delta x} \le \rho$ and $\abs{\Delta y} \le \rho$,

$$\frac{\abs{E(x, y)}}{\rho} \le \abs{f_x(c, y) - f_x(a, b)} + \abs{f_y(a, d) - f_y(a, b)}.$$

As $(x, y) \to (a, b)$, the points $(c, y)$ and $(a, d)$ approach $(a, b)$ too, so by the continuity of $f_x$ and $f_y$ at $(a, b)$ the right side tends to 0. So does $\abs{E}/\rho$: $f$ is differentiable at $(a, b)$.

```check
same((x*y/(x**2 + y**2)).subs({x: h, y: 0}), 0); same((x*y/(x**2 + y**2)).subs({x: 0, y: h}), 0)
same(limit((0 - 0)/h, h, 0), 0); same(fp172.subs(y, x), Rational(1, 2))
Fxc, Fyd, fx0, fy0, dX, dY = symbols('F_xc F_yd f_x0 f_y0 dX dY')
same((Fxc*dX + Fyd*dY) - (fx0*dX + fy0*dY), (Fxc - fx0)*dX + (Fyd - fy0)*dY)   # the error E after the two legs
```
:::

### The total differential {#differential}

The differentials of [Section 7.2](module_07_EN.html#differentials) have a version for several variables.

::: definition Total differential
For a differentiable function $z = f(x, y)$, let the **differentials** $dx$ and $dy$ be independent variables. The **total differential** of $z$ is

$$dz = f_x(x, y)\,dx + f_y(x, y)\,dy = \frac{\partial z}{\partial x}\,dx + \frac{\partial z}{\partial y}\,dy.$$
:::

When $x$ and $y$ change by $dx$ and $dy$, the actual change of $z$ is $\Delta z = f(x + dx, y + dy) - f(x, y)$, while $dz$ is the change of the linearisation; $\Delta z \approx dz$ when $dx$ and $dy$ are small. As in [Section 7.3](module_07_EN.html#errors), this propagates measurement errors, now from several measurements at once.

::: example Measurement errors in a can
The radius and the height of a can are measured as $r = 3$ cm and $h = 10$ cm, with errors of at most 0.02 cm in $r$ and 0.05 cm in $h$. Estimate the largest possible error in the computed volume $V = \pi r^2 h$, and the relative error.

$dV = V_r\,dr + V_h\,dh = 2\pi rh\,dr + \pi r^2\,dh$, and at $(3, 10)$, $V_r = 60\pi$ and $V_h = 9\pi$. The error is largest when both terms have the same sign:

$$\abs{dV} \le 60\pi(0.02) + 9\pi(0.05) = 1.2\pi + 0.45\pi = 1.65\pi \approx 5.18 \text{ cm}^3.$$

So the computed volume, $90\pi \approx 282.7$ cm³, may be off by about 5.2 cm³. Dividing $dV$ by $V = \pi r^2 h$ gives a neat rule for the relative error:

$$\frac{dV}{V} = \frac{2\pi rh\,dr + \pi r^2\,dh}{\pi r^2 h} = 2\,\frac{dr}{r} + \frac{dh}{h},$$

here at most $2 \cdot \tfrac{0.02}{3} + \tfrac{0.05}{10} \approx 0.0133 + 0.005 = 0.0183$, about 1.8%. The relative error in the radius counts twice, because the radius appears squared.

```check
same(diff(Vc, r), 2*pi*r*h); same(diff(Vc, h), pi*r**2)
same(diff(Vc, r).subs({r: 3, h: 10}), 60*pi); same(diff(Vc, h).subs({r: 3, h: 10}), 9*pi)
steps(60*pi*Rational(2, 100) + 9*pi*Rational(5, 100), Rational(12, 10)*pi + Rational(45, 100)*pi, Rational(165, 100)*pi)
rounds(Rational(165, 100)*pi, '5.18'); rounds(Rational(165, 100)*pi, '5.2')
dr_, dh_ = symbols('dr dh')
same((2*pi*r*h*dr_ + pi*r**2*dh_)/(pi*r**2*h), 2*dr_/r + dh_/h)
rounds(2*Rational(2, 100)/3, '0.0133'); same(Rational(5, 100)/10, Rational(5, 1000)); rounds(2*Rational(2, 100)/3 + Rational(5, 1000), '0.0183')
rounds(100*(2*Rational(2, 100)/3 + Rational(5, 1000)), '1.8'); same(Rational(165, 100)*pi/(90*pi), 2*Rational(2, 100)/3 + Rational(5, 1000))
```
:::

::: pitfall
$dz$ is not $\Delta z$: $dz$ is the change along the tangent plane, $\Delta z$ the change along the surface, and they are close only when $dx$ and $dy$ are small. And for the largest possible error, add the sizes of the terms, $\abs{f_x}\abs{dx} + \abs{f_y}\abs{dy}$: errors in two measurements can push the result the same way.
:::

## The chain rule {#chain-rule}

In one variable, rates multiply ([Section 5.5](module_05_EN.html#chain)). When $z$ depends on $x$ and $y$, and both depend on time $t$, a change in $t$ reaches $z$ by two routes, through $x$ and through $y$, and the two contributions add.

::: theorem The chain rule
Suppose that $x = x(t)$ and $y = y(t)$ are differentiable at $t_0$, and that $z = f(x, y)$ is differentiable at $\big(x(t_0), y(t_0)\big)$. Then $z = f\big(x(t), y(t)\big)$ is differentiable at $t_0$, and

$$\frac{dz}{dt} = \frac{\partial z}{\partial x}\,\frac{dx}{dt} + \frac{\partial z}{\partial y}\,\frac{dy}{dt},$$

with the partial derivatives taken at $\big(x(t_0), y(t_0)\big)$ and the other derivatives at $t_0$.
:::

::: proof
Let $\Delta t \ne 0$, and let $\Delta x$, $\Delta y$ and $\Delta z$ be the changes of $x$, $y$ and $z$ when $t$ changes from $t_0$ to $t_0 + \Delta t$. Write $\rho = \sqrt{\Delta x^2 + \Delta y^2}$. By the definition of differentiability,

$$\Delta z = f_x\,\Delta x + f_y\,\Delta y + E,$$

where $E/\rho \to 0$ as $(\Delta x, \Delta y) \to (0, 0)$. Let $\varepsilon = E/\rho$ when $\rho \ne 0$ and $\varepsilon = 0$ when $\rho = 0$. Then $E = \varepsilon\rho$ in both cases: if $\rho = 0$, then $x$ and $y$ do not change, so neither does $z$, and $E = 0$. Divide by $\Delta t$:

$$\frac{\Delta z}{\Delta t} = f_x\,\frac{\Delta x}{\Delta t} + f_y\,\frac{\Delta y}{\Delta t} + \varepsilon\,\frac{\rho}{\Delta t}.$$

Let $\Delta t \to 0$. The quotients $\Delta x/\Delta t$ and $\Delta y/\Delta t$ tend to $dx/dt$ and $dy/dt$. The changes $\Delta x$ and $\Delta y$ tend to 0, because differentiable functions are continuous, so $\varepsilon \to 0$; and $\abs{\rho/\Delta t} = \sqrt{(\Delta x/\Delta t)^2 + (\Delta y/\Delta t)^2}$ stays bounded, since it tends to $\sqrt{(dx/dt)^2 + (dy/dt)^2}$. So the last term tends to 0, and $\Delta z/\Delta t$ tends to $f_x\,\dfrac{dx}{dt} + f_y\,\dfrac{dy}{dt}$.
:::

::: example A changing cylinder
The radius of a cylinder grows at 0.1 cm/s while its height shrinks at 0.3 cm/s. At the moment when $r = 3$ cm and $h = 10$ cm, is the volume growing or shrinking, and how fast?

By Theorem 17.6,

$$\frac{dV}{dt} = \frac{\partial V}{\partial r}\,\frac{dr}{dt} + \frac{\partial V}{\partial h}\,\frac{dh}{dt} = 2\pi rh\,\frac{dr}{dt} + \pi r^2\,\frac{dh}{dt}.$$

At this moment $\partial V/\partial r = 60\pi$, $\partial V/\partial h = 9\pi$, $dr/dt = 0.1$ and $dh/dt = -0.3$, so

$$\frac{dV}{dt} = 60\pi(0.1) + 9\pi(-0.3) = 6\pi - 2.7\pi = 3.3\pi \approx 10.37 \text{ cm}^3/\text{s}.$$

The volume is growing. The height shrinks three times as fast as the radius grows, but the volume is more than six times as sensitive to the radius.

```check
Rt, Ht = Function('R')(t), Function('H')(t)
same(diff(pi*Rt**2*Ht, t), 2*pi*Rt*Ht*diff(Rt, t) + pi*Rt**2*diff(Ht, t))
steps(60*pi*Rational(1, 10) + 9*pi*(-Rational(3, 10)), 6*pi - Rational(27, 10)*pi, Rational(33, 10)*pi)
rounds(Rational(33, 10)*pi, '10.37'); holds(Rational(33, 10)*pi > 0); same(Rational(3, 10)/Rational(1, 10), 3)
```
:::

### Tree diagrams {#tree-diagrams}

With more variables, a **tree diagram** keeps track of the routes (Figure 17.3). Put the dependent variable at the top, the intermediate variables below it and the independent variables at the bottom, and join each variable to the variables it depends on directly. Label each branch with the derivative of the upper variable with respect to the lower one.

::: keyidea
The derivative of the top variable with respect to a bottom variable is the sum, over all paths from the top down to that variable, of the products of the labels along each path.
:::

::: figure id=fig-17-3
Tree diagrams for the chain rule. Left: $z = f(x, y)$, with $x$ and $y$ functions of $t$; the two paths from $z$ down to $t$ give the two terms of Theorem 17.6. Right: $x$ and $y$ functions of $s$ and $t$; the two coloured paths from $z$ to $s$ give $\partial z/\partial s$, and the two paths to $t$ give $\partial z/\partial t$ in the same way.
:::

When $x$ and $y$ depend on two variables $s$ and $t$, hold $t$ fixed: then $x$ and $y$ are functions of $s$ alone, and Theorem 17.6 applies with $s$ in place of $t$. Derivatives with respect to $s$ with $t$ held fixed are partial derivatives, so:

::: theorem The chain rule with two parameters
Suppose that $x = x(s, t)$ and $y = y(s, t)$ have partial derivatives at $(s, t)$, and that $z = f(x, y)$ is differentiable at $\big(x(s, t), y(s, t)\big)$. Then

$$\begin{aligned} \frac{\partial z}{\partial s} &= \frac{\partial z}{\partial x}\,\frac{\partial x}{\partial s} + \frac{\partial z}{\partial y}\,\frac{\partial y}{\partial s}, \\ \frac{\partial z}{\partial t} &= \frac{\partial z}{\partial x}\,\frac{\partial x}{\partial t} + \frac{\partial z}{\partial y}\,\frac{\partial y}{\partial t}. \end{aligned}$$
:::

The same proof, with more terms, gives the general rule of the key idea. Differentiability is defined for $n$ variables as for two, with the distance in $n$ dimensions; if $u$ is a differentiable function of $x_1, \dots, x_n$, each of which has partial derivatives with respect to $t_1, \dots, t_m$, then for each $i$

$$\frac{\partial u}{\partial t_i} = \frac{\partial u}{\partial x_1}\frac{\partial x_1}{\partial t_i} + \frac{\partial u}{\partial x_2}\frac{\partial x_2}{\partial t_i} + \dots + \frac{\partial u}{\partial x_n}\frac{\partial x_n}{\partial t_i}.$$

::: example Polar coordinates
Let $z = x^2y$, where $x = r\cos\theta$ and $y = r\sin\theta$ are given by polar coordinates (Module 16). Find $\partial z/\partial r$ and $\partial z/\partial\theta$ at $r = 2$, $\theta = \pi/6$, and check by substituting first.

The tree is the right-hand one of Figure 17.3, with $r$ and $\theta$ in place of $s$ and $t$. The labels are $z_x = 2xy$, $z_y = x^2$, $x_r = \cos\theta$, $y_r = \sin\theta$, $x_\theta = -r\sin\theta$ and $y_\theta = r\cos\theta$, so

$$\begin{aligned} \frac{\partial z}{\partial r} &= 2xy\cos\theta + x^2\sin\theta, \\ \frac{\partial z}{\partial \theta} &= -2xy\,r\sin\theta + x^2\,r\cos\theta. \end{aligned}$$

At $r = 2$ and $\theta = \pi/6$, $x = 2\cos\frac{\pi}{6} = \sqrt3$ and $y = 2\sin\frac{\pi}{6} = 1$, so

$$\begin{aligned} \frac{\partial z}{\partial r} &= 2\sqrt3\cdot\frac{\sqrt3}{2} + 3\cdot\frac12 = 3 + \frac32 = \frac92, \\ \frac{\partial z}{\partial \theta} &= -2\sqrt3\cdot 2\cdot\frac12 + 3\cdot 2\cdot\frac{\sqrt3}{2} = -2\sqrt3 + 3\sqrt3 = \sqrt3. \end{aligned}$$

Check: substituting first, $z = r^3\cos^2\theta\sin\theta$, so $\partial z/\partial r = 3r^2\cos^2\theta\sin\theta = 3 \cdot 4 \cdot \tfrac34 \cdot \tfrac12 = \tfrac92$. The chain rule needs no such substitution, which for a complicated $f$ may be impractical.

```check
xp_, yp_ = r*cos(theta), r*sin(theta)
zp = x**2*y
same(diff(zp, x), 2*x*y); same(diff(zp, y), x**2)
same(diff(zp.subs({x: xp_, y: yp_}), r), (2*x*y*cos(theta) + x**2*sin(theta)).subs({x: xp_, y: yp_}))
same(diff(zp.subs({x: xp_, y: yp_}), theta), (-2*x*y*r*sin(theta) + x**2*r*cos(theta)).subs({x: xp_, y: yp_}))
P_ = {r: 2, theta: pi/6}
same(xp_.subs(P_), sqrt(3)); same(yp_.subs(P_), 1)
steps(2*sqrt(3)*sqrt(3)/2 + 3*Rational(1, 2), 3 + Rational(3, 2), Rational(9, 2))
steps(-2*sqrt(3)*2*Rational(1, 2) + 3*2*sqrt(3)/2, -2*sqrt(3) + 3*sqrt(3), sqrt(3))
same(zp.subs({x: xp_, y: yp_}), r**3*cos(theta)**2*sin(theta))
same(diff(r**3*cos(theta)**2*sin(theta), r).subs(P_), Rational(9, 2)); same(3*4*Rational(3, 4)*Rational(1, 2), Rational(9, 2))
same(diff(r**3*cos(theta)**2*sin(theta), theta).subs(P_), sqrt(3))
```
:::

::: pitfall
Every path contributes. A common slip is to write $\dfrac{\partial z}{\partial s} = \dfrac{\partial z}{\partial x}\dfrac{\partial x}{\partial s}$, as if the $\partial x$'s cancelled, and to forget the path through $y$. Partial derivatives are not fractions, and with two intermediate variables the chain rule has two terms.
:::

### Implicit differentiation {#implicit}

[Section 6.4](module_06_EN.html#implicit) found slopes of curves such as the circle $x^2 + y^2 = 25$ by differentiating their equations. The chain rule explains the method and turns it into a formula. Write the curve as $F(x, y) = 0$, and suppose that near a point of it the curve is the graph of a differentiable function $y = y(x)$. Then $F\big(x, y(x)\big) = 0$ for all $x$ near the point. Differentiate with respect to $x$ by Theorem 17.6, with $x$ itself as the first intermediate variable ($dx/dx = 1$):

$$F_x + F_y\,\frac{dy}{dx} = 0, \quad\text{so}\quad \frac{dy}{dx} = -\frac{F_x}{F_y} \quad (F_y \ne 0).$$

```check
Yi = Function('Y')(x)
for Fi in (x**3*y**2 + sin(x*y), exp(x - y**2) + x/y):                     # instances of F(x, y(x)) = 0, differentiated
    same(diff(Fi.subs(y, Yi), x), (diff(Fi, x) + diff(Fi, y)*diff(Yi, x)).subs(y, Yi))
```

Module 6 promised a theorem that guarantees the function $y(x)$ whenever the coefficient of $dy/dx$, here $F_y$, is not 0:

::: theorem The implicit function theorem
Suppose that $F$ has continuous partial derivatives on a disc centred at $(a, b)$, that $F(a, b) = 0$, and that $F_y(a, b) \ne 0$. Then near $(a, b)$ the points of the curve $F(x, y) = 0$ form the graph of a differentiable function $y = y(x)$, defined on an open interval containing $a$, with $y(a) = b$ and

$$\frac{dy}{dx} = -\frac{F_x(x, y)}{F_y(x, y)}.$$
:::

Its proof belongs to a course in analysis; this series uses the theorem without proof.

::: example The folium of Descartes again
Find $dy/dx$ on the folium $x^3 + y^3 = 6xy$ of [Example 6.5](module_06_EN.html#implicit) with the formula, and the slope at $(3, 3)$.

Write the curve as $F(x, y) = x^3 + y^3 - 6xy = 0$. Then $F_x = 3x^2 - 6y$ and $F_y = 3y^2 - 6x$, so where $y^2 \ne 2x$,

$$\frac{dy}{dx} = -\frac{3x^2 - 6y}{3y^2 - 6x} = \frac{2y - x^2}{y^2 - 2x},$$

the answer of Example 6.5. At $(3, 3)$, $F_y = 27 - 18 = 9 \ne 0$, and the slope is $\dfrac{6 - 9}{9 - 6} = -1$. At the origin $F_x = F_y = 0$: the implicit function theorem says nothing there, and indeed the curve crosses itself.

```check
Ff = x**3 + y**3 - 6*x*y
same(diff(Ff, x), 3*x**2 - 6*y); same(diff(Ff, y), 3*y**2 - 6*x)
same(-(3*x**2 - 6*y)/(3*y**2 - 6*x), (2*y - x**2)/(y**2 - 2*x)); same(idiff(Ff, y, x), (2*y - x**2)/(y**2 - 2*x))
same(Ff.subs({x: 3, y: 3}), 0); same((3*y**2 - 6*x).subs({x: 3, y: 3}), 9); same(((2*y - x**2)/(y**2 - 2*x)).subs({x: 3, y: 3}), -1)
same([diff(Ff, x).subs({x: 0, y: 0}), diff(Ff, y).subs({x: 0, y: 0})], [0, 0])
```
:::

In the same way, an equation $F(x, y, z) = 0$ defines $z$ as a function of $x$ and $y$ near a point where $F_z \ne 0$ (the theorem has a version for three variables). Holding $y$ fixed and differentiating $F\big(x, y, z(x, y)\big) = 0$ with respect to $x$ gives $F_x + F_z\,\dfrac{\partial z}{\partial x} = 0$, and similarly for $y$:

$$\frac{\partial z}{\partial x} = -\frac{F_x}{F_z}, \qquad \frac{\partial z}{\partial y} = -\frac{F_y}{F_z}.$$

Example 17.14 uses these formulas.

## Directional derivatives and the gradient {#gradient}

Stand on a hillside. How steep the ground is depends on which way you face: straight up the slope it is steep, along the slope it is level. The partial derivatives $f_x$ and $f_y$ give the slopes in two directions only, east and north on a map. This section finds the slope in every direction, and the direction in which it is steepest.

::: definition Directional derivative
Let $\vb{u} = \langle u_1, u_2\rangle$ be a unit vector. The **directional derivative** of $f$ at $(a, b)$ in the direction of $\vb{u}$ is

$$D_{\vb{u}} f(a, b) = \lim_{h\to0}\frac{f(a + hu_1, b + hu_2) - f(a, b)}{h},$$

provided that the limit exists.
:::

$D_{\vb{u}} f$ reads "D sub u of f". The point $(a + hu_1, b + hu_2)$ lies at a distance $\abs{h}$ from $(a, b)$ in the direction of $\vb{u}$, because $\norm{\vb{u}} = 1$; so $D_{\vb{u}} f(a, b)$ is the rate of change of $f$ per unit of distance as you move from $(a, b)$ in that direction. For $\vb{u} = \vb{i} = \langle 1, 0\rangle$ it is $f_x(a, b)$, and for $\vb{u} = \vb{j} = \langle 0, 1\rangle$ it is $f_y(a, b)$.

::: definition Gradient
The **gradient** of $f$ at $(a, b)$ is the vector of its partial derivatives,

$$\nabla f(a, b) = \big\langle f_x(a, b), f_y(a, b)\big\rangle.$$

For a function of three variables, $\nabla f = \langle f_x, f_y, f_z\rangle$.
:::

The symbol $\nabla$ is called "nabla", and $\nabla f$ reads "del f" or "grad f". The gradient of a function of two variables is a vector in the plane of its domain, a direction on the contour map, not a direction in space. With it, the linear approximation of Section 17.4 reads $f(a + \Delta x, b + \Delta y) \approx f(a, b) + \nabla f(a, b)\cdot\langle\Delta x, \Delta y\rangle$, with the dot product of Module 16. Directional derivatives come from the gradient in the same way.

::: theorem Directional derivatives from the gradient
If $f$ is differentiable at $(a, b)$, then $f$ has a directional derivative at $(a, b)$ in the direction of every unit vector $\vb{u} = \langle u_1, u_2\rangle$, and

$$D_{\vb{u}} f(a, b) = \nabla f(a, b)\cdot\vb{u} = f_x(a, b)\,u_1 + f_y(a, b)\,u_2.$$
:::

::: proof
Let $g(h) = f(a + hu_1, b + hu_2)$. The limit that defines $D_{\vb{u}} f(a, b)$ is $\lim_{h\to0}\dfrac{g(h) - g(0)}{h} = g'(0)$. Here $g$ is $f$ composed with $x(h) = a + hu_1$ and $y(h) = b + hu_2$, whose derivatives are $u_1$ and $u_2$. By the chain rule (Theorem 17.6), $g'(0)$ exists and

$$g'(0) = f_x(a, b)\,u_1 + f_y(a, b)\,u_2 = \nabla f(a, b)\cdot\vb{u}.$$
:::

::: example A directional derivative
Let $f(x, y) = xe^y$. Find the rate of change of $f$ at $(2, 0)$ in the direction of the point $(5, 4)$.

$f_x = e^y$ and $f_y = xe^y$ are continuous, so $f$ is differentiable (Theorem 17.5), and $\nabla f(2, 0) = \langle e^0, 2e^0\rangle = \langle 1, 2\rangle$. The direction from $(2, 0)$ to $(5, 4)$ is $\vb{v} = \langle 3, 4\rangle$, of length 5, so the unit vector in that direction is $\vb{u} = \vb{v}/\norm{\vb{v}} = \big\langle \tfrac35, \tfrac45\big\rangle$. By Theorem 17.9,

$$D_{\vb{u}} f(2, 0) = \langle 1, 2\rangle\cdot\big\langle \tfrac35, \tfrac45\big\rangle = \frac35 + \frac85 = \frac{11}{5} = 2.2.$$

Moving from $(2, 0)$ towards $(5, 4)$, $f$ increases at 2.2 units per unit of distance, faster than along either axis ($f_x = 1$, $f_y = 2$).

```check
fe = x*exp(y)
gfe = Matrix([diff(fe, x), diff(fe, y)])
same(gfe, Matrix([exp(y), x*exp(y)])); same(gfe.subs({x: 2, y: 0}), Matrix([1, 2]))
vv = Matrix([3, 4]); same(vv.norm(), 5); uu = vv/vv.norm(); same(uu, Matrix([Rational(3, 5), Rational(4, 5)]))
steps(gfe.subs({x: 2, y: 0}).dot(uu), Rational(3, 5) + Rational(8, 5), Rational(11, 5)); same(Rational(11, 5), Rational(22, 10))
same(limit((fe.subs({x: 2 + h*uu[0], y: h*uu[1]}) - fe.subs({x: 2, y: 0}))/h, h, 0), Rational(11, 5))   # from the definition
```
:::

### Steepest ascent {#steepest-ascent}

::: theorem The direction of steepest ascent
Let $f$ be differentiable at $(a, b)$, with $\nabla f(a, b) \ne \vb{0}$. Among all unit vectors $\vb{u}$, the directional derivative $D_{\vb{u}} f(a, b)$

- is largest, equal to $\norm{\nabla f(a, b)}$, when $\vb{u}$ points in the direction of $\nabla f(a, b)$;
- is smallest, equal to $-\norm{\nabla f(a, b)}$, when $\vb{u}$ points in the opposite direction;
- is 0 when $\vb{u}$ is perpendicular to $\nabla f(a, b)$.
:::

::: proof
Let $\theta$ be the angle between $\nabla f(a, b)$ and $\vb{u}$. By Theorem 17.9 and the angle form of the dot product (Module 16),

$$D_{\vb{u}} f(a, b) = \nabla f(a, b)\cdot\vb{u} = \norm{\nabla f(a, b)}\,\norm{\vb{u}}\cos\theta = \norm{\nabla f(a, b)}\cos\theta,$$

since $\norm{\vb{u}} = 1$. As $\vb{u}$ turns, only $\cos\theta$ changes. It is largest, 1, exactly when $\theta = 0$; smallest, $-1$, exactly when $\theta = \pi$; and 0 when $\theta = \pi/2$.
:::

So the gradient points uphill, in the steepest direction, and its length is the slope in that direction. For $f(x, y) = xe^y$ at $(2, 0)$ (Example 17.13), the steepest rate is $\norm{\langle 1, 2\rangle} = \sqrt5 \approx 2.236$, in the direction $\langle 1, 2\rangle/\sqrt5$. The rate 2.2 towards $(5, 4)$ comes close to it because $\langle 3, 4\rangle$ points within about $10.3^\circ$ of $\langle 1, 2\rangle$ ($\cos\theta = 2.2/\sqrt5$). The fastest decrease, at the rate $-\sqrt5$, is in the direction $\langle -1, -2\rangle/\sqrt5$, and the rate of change is 0 in the directions $\pm\langle 2, -1\rangle/\sqrt5$. Water running downhill follows $-\nabla f$, the direction of steepest descent.

```check
gg = Matrix([1, 2])
same(gg.norm(), sqrt(5)); rounds(sqrt(5), '2.236'); same(gg.dot(gg/gg.norm()), sqrt(5)); same(gg.dot(-gg/gg.norm()), -sqrt(5))
rounds(acos(Rational(11, 5)/sqrt(5))*180/pi, '10.3'); same(gg.dot(Matrix([2, -1])), 0)
ph_ = symbols('phi', real=True); ue_ = Matrix([cos(ph_), sin(ph_)])
same(gg.dot(gg) - gg.dot(ue_)**2, (gg[0]*sin(ph_) - gg[1]*cos(ph_))**2)      # no unit vector beats |grad f|
```

### Gradients and level curves {#perpendicular}

Along the level curve through $(a, b)$, $f$ does not change at all, so its rate of change along the curve should be 0. By Theorem 17.10, that happens in the directions perpendicular to the gradient.

::: theorem The gradient is perpendicular to level curves
Let $f$ be differentiable at $(a, b)$, and let $\vb{r}(t) = \langle x(t), y(t)\rangle$ be a curve that lies on the level curve $f(x, y) = k$ through $(a, b)$, with $\vb{r}(t_0) = \langle a, b\rangle$, differentiable at $t_0$ with $\vb{r}'(t_0) \ne \vb{0}$. Then

$$\nabla f(a, b)\cdot\vb{r}'(t_0) = 0:$$

the gradient is perpendicular to the tangent vector of the level curve.
:::

::: proof
For every $t$, $f\big(x(t), y(t)\big) = k$. Differentiate both sides at $t_0$, with the chain rule on the left: $f_x(a, b)\,x'(t_0) + f_y(a, b)\,y'(t_0) = 0$, that is, $\nabla f(a, b)\cdot\vb{r}'(t_0) = 0$.
:::

So on a contour map the gradient at each point, where it is not $\vb{0}$, is perpendicular to the contour through the point, points towards higher values, and is long where the contours crowd together and short where they spread out (Figure 17.4, left). For $f(x, y) = x^2 + y^2$, $\nabla f = \langle 2x, 2y\rangle$ points straight away from the origin, across the circles $x^2 + y^2 = k$ at right angles, and its length $2\sqrt{x^2 + y^2}$ grows with the distance from the origin, where the circles crowd together.

```check
gq = Matrix([diff(x**2 + y**2, x), diff(x**2 + y**2, y)]); same(gq, 2*Matrix([x, y]))
kp = symbols('k', positive=True); rc = Matrix([sqrt(kp)*cos(t), sqrt(kp)*sin(t)])        # the circle x^2 + y^2 = k
same(rc[0]**2 + rc[1]**2, kp); same(gq.subs({x: rc[0], y: rc[1]}).dot(rc.diff(t)), 0)
same(Matrix([2*xr, 2*yr]).norm(), 2*sqrt(xr**2 + yr**2))
```

::: figure id=fig-17-4
Left: the contour map of Figure 17.1, with the gradient at points of three level curves, drawn at 0.13 of its length. Each arrow crosses its level curve at a right angle and points uphill; the arrows are longest where the contours crowd together. Right: gradient descent (Section 17.7) on $f(x, y) = x^2 + 3y^2$ from $(3, 1)$. With the step size $\eta = 0.1$ (blue) the points slide smoothly into the valley; with $\eta = 0.3$ (orange) they zigzag across it, overshooting in the steep $y$-direction.
:::

::: widget name=contour-gradient
Choose a function, then click the map, or set $x$ and $y$ with the sliders, to pick a point. The red arrow is the gradient there, drawn to a scale (its true length $\norm{\nabla f}$ is in the readout); the green arrow is the unit vector $\vb{u}$, at the angle set by its slider; the purple curve is the level curve through the point. Turn $\vb{u}$ and watch $D_{\vb{u}} f = \nabla f\cdot\vb{u}$: largest when $\vb{u}$ points along $\nabla f$, smallest when it points the opposite way, 0 along the level curve. With $x^2 + y^2$, every gradient points away from the origin. On the landscape of Figure 17.1, pick a point near a pass at $(\pm1, 0)$, where $\nabla f$ is almost $\vb{0}$. Then type `x e^y`, pick the point $(2, 0)$ and set the angle to $53^\circ$, close to the direction of $\langle 3, 4\rangle$: the readout shows Example 17.13.
:::

### Level surfaces and tangent planes {#tangent-planes-3d}

Everything in this section holds for functions of three variables, with $\nabla f = \langle f_x, f_y, f_z\rangle$ and unit vectors $\vb{u}$ in space: $D_{\vb{u}} f = \nabla f\cdot\vb{u}$, the gradient points in the direction of steepest ascent, and, by the proof of Theorem 17.11 with three variables, it is perpendicular to every curve through the point that lies on the level surface. A plane is fixed by a point and a normal vector (Module 16), so the gradient gives tangent planes to level surfaces.

::: definition Tangent plane to a level surface
Let $F$ be a function of three variables, differentiable at a point $P(x_0, y_0, z_0)$ of the level surface $F(x, y, z) = k$, with $\nabla F(P) \ne \vb{0}$. The **tangent plane** to the surface at $P$ is the plane through $P$ with normal vector $\nabla F(P)$:

$$F_x(P)(x - x_0) + F_y(P)(y - y_0) + F_z(P)(z - z_0) = 0.$$
:::

The graph $z = f(x, y)$ is the level surface $F(x, y, z) = f(x, y) - z = 0$, with $\nabla F = \langle f_x, f_y, -1\rangle$; at $P(a, b, c)$ Definition 17.11 gives $f_x(a, b)(x - a) + f_y(a, b)(y - b) - (z - c) = 0$, the tangent plane of Definition 17.6 again.

```check
fg_ = Function('f')
Fg = fg_(x, y) - z
same(diff(Fg, z), -1); same(diff(Fg, x), diff(fg_(x, y), x))
c0, fx0_, fy0_ = symbols('c0 f_x0 f_y0')
same(solve(fx0_*(x - a) + fy0_*(y - b) - (z - c0), z), [c0 + fx0_*(x - a) + fy0_*(y - b)])
```

::: example A tangent plane to a level surface
Find the tangent plane to the surface $x^2 + 2y^2 + 3z^2 = 6$ at $P(1, 1, 1)$, and the partial derivatives $\partial z/\partial x$ and $\partial z/\partial y$ there.

The point is on the surface, since $1 + 2 + 3 = 6$. With $F(x, y, z) = x^2 + 2y^2 + 3z^2$, $\nabla F = \langle 2x, 4y, 6z\rangle$, so $\nabla F(1, 1, 1) = \langle 2, 4, 6\rangle$, and the tangent plane is

$$2(x - 1) + 4(y - 1) + 6(z - 1) = 0, \quad\text{that is,}\quad x + 2y + 3z = 6.$$

By implicit differentiation (Section 17.5), $\dfrac{\partial z}{\partial x} = -\dfrac{F_x}{F_z} = -\dfrac{2}{6} = -\dfrac13$ and $\dfrac{\partial z}{\partial y} = -\dfrac{F_y}{F_z} = -\dfrac46 = -\dfrac23$. The two answers agree: solved for $z$, the tangent plane is $z = 2 - \tfrac13 x - \tfrac23 y$, with exactly these slopes.

```check
Fs = x**2 + 2*y**2 + 3*z**2
same(Fs.subs({x: 1, y: 1, z: 1}), 6)
gFs = Matrix([diff(Fs, v_) for v_ in (x, y, z)]); same(gFs, Matrix([2*x, 4*y, 6*z])); same(gFs.subs({x: 1, y: 1, z: 1}), Matrix([2, 4, 6]))
same(expand(2*(x - 1) + 4*(y - 1) + 6*(z - 1)), 2*(x + 2*y + 3*z - 6))
same(solve(x + 2*y + 3*z - 6, z), [2 - x/3 - 2*y/3])
same((-gFs[0]/gFs[2]).subs({x: 1, y: 1, z: 1}), -Rational(1, 3)); same((-gFs[1]/gFs[2]).subs({x: 1, y: 1, z: 1}), -Rational(2, 3))
same(idiff(Fs - 6, z, x).subs({x: 1, y: 1, z: 1}), -Rational(1, 3)); same(idiff(Fs - 6, z, y).subs({x: 1, y: 1, z: 1}), -Rational(2, 3))
```
:::

::: pitfall
A directional derivative needs a unit vector. With $\vb{v} = \langle 3, 4\rangle$ in place of $\vb{u}$ in Example 17.13, $\nabla f\cdot\vb{v} = 11$, five times too large, because $\vb{v}$ has length 5: divide by the length first. And $\nabla f$ is a vector, not a number; its length $\norm{\nabla f}$ is the steepest slope.

```check
same(Matrix([1, 2]).dot(Matrix([3, 4])), 11); same(11/Rational(11, 5), 5)
```
:::

::: compute Gradients with SymPy and NumPy
A SymPy `Matrix` holds a gradient; `.dot` takes dot products and `.norm()` lengths. Example 17.13 again:

```python
import sympy as sp
x, y = sp.symbols('x y')
f = x*sp.exp(y)
grad = sp.Matrix([sp.diff(f, x), sp.diff(f, y)])
g = grad.subs({x: 2, y: 0})
u = sp.Matrix([3, 4])/5
print(grad.T, '|', g.T, '|', g.dot(u), '|', g.norm())
```

```output
Matrix([[exp(y), x*exp(y)]]) | Matrix([[1, 2]]) | 11/5 | sqrt(5)
```

`.T` turns the column of the gradient into a row for printing: $\nabla f = \langle e^y, xe^y\rangle$, then $\langle 1, 2\rangle$ at $(2, 0)$, $D_{\vb{u}} f = \tfrac{11}{5}$ and $\norm{\nabla f} = \sqrt5$.

Theorem 17.10 says that no direction beats $\norm{\nabla f} = \sqrt5$. Try 720 directions, every half degree, with NumPy:

```python
import numpy as np
gx, gy = 1.0, 2.0                               # grad f(2, 0)
alpha = np.radians(np.arange(0, 360, 0.5))      # the angles of u = <cos a, sin a>
D = gx*np.cos(alpha) + gy*np.sin(alpha)         # D_u f for each direction
k = np.argmax(D)
print(f"largest D_u f: {D[k]:.6f}, at {np.degrees(alpha[k])} degrees")
print(f"|grad f| = {np.hypot(gx, gy):.6f}, at {np.degrees(np.arctan2(gy, gx)):.4f} degrees")
```

```output
largest D_u f: 2.236067, at 63.50000000000001 degrees
|grad f| = 2.236068, at 63.4349 degrees
```

The best of the 720 directions, at $63.5^\circ$, is the one nearest to the direction of the gradient, $63.4349^\circ$, and its rate falls short of $\norm{\nabla f}$ only in the sixth decimal place. (The digits `00000000000001` are floating-point rounding, from converting radians back to degrees.)
:::

```check
rounds(atan2(2, 1)*180/pi, '63.4349'); rounds(sqrt(5), '2.236068')
rounds(sqrt(5)*cos((Rational(635, 10) - atan2(2, 1)*180/pi)*pi/180), '2.236067')
holds(abs(Rational(635, 10) - atan2(2, 1)*180/pi) < Rational(1, 4))
```

## Gradient descent {#gradient-descent}

[Section 8.7](module_08_EN.html#gradient-descent) minimised functions of one variable by stepping against the derivative, $x_{k+1} = x_k - \eta f'(x_k)$. In several variables the gradient takes the place of the derivative, and Theorem 17.10 says which way to step: along $-\nabla f$, the direction of steepest descent.

::: definition Gradient descent
To minimise a differentiable function $f$ of two (or more) variables, choose a starting point $\vb{x}_0$ and a **step size** $\eta > 0$ (the learning rate), and compute

$$\vb{x}_{k+1} = \vb{x}_k - \eta\,\nabla f(\vb{x}_k), \qquad k = 0, 1, 2, \dots$$

Here $\vb{x}_k = \langle x_k, y_k\rangle$ is the $k$th point, written as a vector, and $f(\vb{x}_k)$ means $f(x_k, y_k)$.
:::

Each step moves in the direction of steepest descent, a distance $\eta\norm{\nabla f(\vb{x}_k)}$: long steps where the surface is steep, short ones where it is flat. By the linear approximation in its gradient form (Section 17.6),

$$\begin{aligned} f(\vb{x}_{k+1}) &\approx f(\vb{x}_k) + \nabla f(\vb{x}_k)\cdot(\vb{x}_{k+1} - \vb{x}_k) \\ &= f(\vb{x}_k) - \eta\norm{\nabla f(\vb{x}_k)}^2, \end{aligned}$$

which is less than $f(\vb{x}_k)$ when $\nabla f(\vb{x}_k) \ne \vb{0}$, at least when the step is small enough for the approximation to be good. The points stop moving only where $\nabla f = \vb{0}$; Module 18 studies these critical points.

```check
g1_, g2_, et_ = symbols('g1 g2 eta')
gv_ = Matrix([g1_, g2_])
same(gv_.dot(-et_*gv_), -et_*(g1_**2 + g2_**2))
```

::: example Gradient descent on a bowl
Apply gradient descent to $f(x, y) = x^2 + 3y^2$, from $(3, 1)$ with $\eta = 0.1$. Find a formula for the $k$th point, and the step sizes for which the points approach the minimum at $(0, 0)$.

Here $\nabla f = \langle 2x, 6y\rangle$. First step: $\nabla f(3, 1) = \langle 6, 6\rangle$, so

$$\vb{x}_1 = \langle 3, 1\rangle - 0.1\,\langle 6, 6\rangle = \langle 2.4, 0.4\rangle,$$

and $f$ drops from 12 to $5.76 + 0.48 = 6.24$. Second step: $\nabla f(2.4, 0.4) = \langle 4.8, 2.4\rangle$, so $\vb{x}_2 = \langle 1.92, 0.16\rangle$, where $f = 3.7632$. Each step multiplies each coordinate by a fixed factor,

$$x_{k+1} = x_k - 2\eta x_k = (1 - 2\eta)x_k, \qquad y_{k+1} = (1 - 6\eta)y_k,$$

so with $\eta = 0.1$, $x_k = 3(0.8)^k$ and $y_k = (0.4)^k$:

```valuetable
k = 0, 1, 2, 3, 4, 5, 6
$x_k$ = 3*(4/5)**k
$y_k$ = (2/5)**k
$f(x_k, y_k)$ = 9*(16/25)**k + 3*(4/25)**k
---
k | x_k | y_k | f(x_k, y_k)
0 | 3 | 1 | 12
1 | 2.4 | 0.4 | 6.24
2 | 1.92 | 0.16 | 3.7632
3 | 1.536 | 0.064 | 2.37158
4 | 1.2288 | 0.0256 | 1.51192
5 | 0.98304 | 0.01024 | 0.966682
6 | 0.786432 | 0.004096 | 0.618526
```

From $(3, 1)$ the points approach $(0, 0)$ exactly when both factors lie strictly between $-1$ and 1, as for the parabola of Section 8.7, once for each coordinate. $\abs{1 - 2\eta} < 1$ needs $0 < \eta < 1$, and $\abs{1 - 6\eta} < 1$ needs $0 < \eta < \tfrac13$; so gradient descent converges exactly when $0 < \eta < \tfrac13$. With $\eta = 0.3$ the factors are 0.4 and $-0.8$: $y_k$ changes sign at every step, and the points zigzag across the valley while closing in slowly (Figure 17.4, right).

```check
fb = x**2 + 3*y**2
same(Matrix([diff(fb, x), diff(fb, y)]), Matrix([2*x, 6*y]))
p1 = Matrix([3, 1]) - Rational(1, 10)*Matrix([6, 6]); same(p1, Matrix([Rational(24, 10), Rational(4, 10)]))
same(fb.subs({x: 3, y: 1}), 12); steps(fb.subs({x: p1[0], y: p1[1]}), Rational(576, 100) + Rational(48, 100), Rational(624, 100))
same(Matrix([2*p1[0], 6*p1[1]]), Matrix([Rational(48, 10), Rational(24, 10)]))
p2 = p1 - Rational(1, 10)*Matrix([2*p1[0], 6*p1[1]]); same(p2, Matrix([Rational(192, 100), Rational(16, 100)])); same(fb.subs({x: p2[0], y: p2[1]}), Rational(37632, 10000))
eta_ = symbols('eta', positive=True); xk_, yk_ = symbols('x_k y_k')
same(xk_ - eta_*2*xk_, (1 - 2*eta_)*xk_); same(yk_ - eta_*6*yk_, (1 - 6*eta_)*yk_)
pts_ = [Matrix([3, 1])]
for _ in range(6):
    pts_.append(pts_[-1] - Rational(1, 10)*Matrix([2*pts_[-1][0], 6*pts_[-1][1]]))
same([q_[0] for q_ in pts_], [3*Rational(4, 5)**k_ for k_ in range(7)]); same([q_[1] for q_ in pts_], [Rational(2, 5)**k_ for k_ in range(7)])
same([fb.subs({x: q_[0], y: q_[1]}) for q_ in pts_], [9*Rational(16, 25)**k_ + 3*Rational(4, 25)**k_ for k_ in range(7)])
er_ = symbols('eta', real=True)
same(solve_univariate_inequality(Abs(1 - 2*er_) < 1, er_, relational=False), Interval.open(0, 1))
same(solve_univariate_inequality(Abs(1 - 6*er_) < 1, er_, relational=False), Interval.open(0, Rational(1, 3)))
same([1 - 2*Rational(3, 10), 1 - 6*Rational(3, 10)], [Rational(2, 5), -Rational(4, 5)])
```
:::

::: compute Gradient descent with NumPy
Each step is one line:

```python
import numpy as np

def grad(p):                            # f(x, y) = x**2 + 3*y**2
    return np.array([2*p[0], 6*p[1]])

def descent(eta, steps, p=(3.0, 1.0)):
    p = np.array(p)
    for _ in range(steps):
        p = p - eta*grad(p)
    return p

for eta in (0.1, 0.3):
    for k in (1, 2, 5, 10, 20):
        x, y = descent(eta, k)
        print(f"eta = {eta}, k = {k:2d}: ({x:9.6f}, {y:9.6f})")
```

```output
eta = 0.1, k =  1: ( 2.400000,  0.400000)
eta = 0.1, k =  2: ( 1.920000,  0.160000)
eta = 0.1, k =  5: ( 0.983040,  0.010240)
eta = 0.1, k = 10: ( 0.322123,  0.000105)
eta = 0.1, k = 20: ( 0.034588,  0.000000)
eta = 0.3, k =  1: ( 1.200000, -0.800000)
eta = 0.3, k =  2: ( 0.480000,  0.640000)
eta = 0.3, k =  5: ( 0.030720, -0.327680)
eta = 0.3, k = 10: ( 0.000315,  0.107374)
eta = 0.3, k = 20: ( 0.000000,  0.011529)
```

With $\eta = 0.1$ the $y$-coordinate, multiplied by 0.4 at each step, is soon negligible, and the $x$-coordinate, multiplied by 0.8, lags behind: after 20 steps it is still about 0.035. With $\eta = 0.3$ the roles swap: $x$ shrinks by the factor 0.4, but $y$ changes sign at every step and shrinks only by the factor 0.8. How many steps until $\norm{\nabla f} < 10^{-8}$, for different step sizes?

```python
def steps_needed(eta, tol=1e-8):
    p, k = np.array([3.0, 1.0]), 0
    while tol < np.linalg.norm(grad(p)) < 1e6:
        p, k = p - eta*grad(p), k + 1
    return k if np.linalg.norm(grad(p)) <= tol else None

for eta in (0.05, 0.1, 0.2, 0.25, 0.3, 0.33, 0.34):
    k = steps_needed(eta)
    print(f"eta = {eta}: " + (f"{k} steps" if k is not None else "diverges"))
```

```output
eta = 0.05: 192 steps
eta = 0.1: 91 steps
eta = 0.2: 40 steps
eta = 0.25: 30 steps
eta = 0.3: 91 steps
eta = 0.33: 1001 steps
eta = 0.34: diverges
```

The best of these step sizes is 0.25, where the two factors $1 - 2\eta = 0.5$ and $1 - 6\eta = -0.5$ are equally small. At $\eta = 0.33$ the factor $1 - 6\eta = -0.98$ is close to $-1$, and the zigzag takes a thousand steps to die down; at 0.34, beyond $\tfrac13$, it grows, and gradient descent diverges. The steep direction limits the step size, while the gentle direction would like long steps. When the curvature is very different in different directions, gradient descent is slow whatever $\eta$ is; Module 18 studies this problem, called ill-conditioning.
:::

```check
rounds(3*Rational(4, 5)**20, '0.034588'); rounds(3*Rational(4, 5)**20, '0.035'); holds(Rational(2, 5)**20 < Rational(5, 10**7))
same([1 - 2*Rational(1, 4), 1 - 6*Rational(1, 4)], [Rational(1, 2), -Rational(1, 2)]); same(1 - 6*Rational(33, 100), -Rational(98, 100))
holds(abs(1 - 6*Rational(34, 100)) > 1); rounds(Rational(4, 5)**20, '0.011529')
```

In machine learning, $\vb{x}$ is the list of a model's parameters, its weights, often millions of them, and $f$ is the **loss**, a measure of the model's error on its training data. Training is gradient descent or one of its variants: stochastic gradient descent estimates the gradient at each step from a small random batch of the training data, and methods such as momentum and Adam adapt each step to the gradients of earlier steps. Every step needs the whole gradient, one partial derivative per parameter, and the next section shows how to compute it efficiently. The series [AI: From Machine Learning to Large Language Models](../ai/index.html) puts these methods to work.

## Backpropagation {#backpropagation}

The loss of a neural network is computed by a long chain of simple operations: multiplications by weights, sums, and simple functions of one variable. [Section 5.8](module_05_EN.html#autodiff) showed how a program can differentiate such a computation with dual numbers, carrying derivatives forwards, one input at a time. With a million parameters that takes a million runs. **Backpropagation** finds the derivative of the loss with respect to every parameter in one backward pass, at a cost of a small multiple of computing the loss itself. It is the chain rule of Section 17.5, organised on a graph.

::: definition Computational graph
A **computational graph** of a computation has a node for each input and for each intermediate result, and an arrow from each node to each node computed directly from it. The nodes that a node points to are its **children**. Each arrow carries a **local derivative**: the partial derivative of the child with respect to the node the arrow comes from. If the computation ends with the number $L$, the **adjoint** of a node $v$ is $\bar v = \partial L/\partial v$, read "v bar".
:::

The graph is evaluated in two passes.

1. **The forward pass** computes the value of every node, from the inputs to the output, and keeps the values.
2. **The backward pass** computes the adjoints, from the output back to the inputs. It starts with $\bar L = 1$, and gives every other node $v$ the sum over its children $c$:

$$\bar v = \sum_{c}\,\bar c\,\frac{\partial c}{\partial v}.$$

Why is this right? $L$ depends on $v$ only through the children of $v$, so the general chain rule of Section 17.5, with the children as the intermediate variables, gives exactly this sum. Unwound, it is the key idea of Section 17.5: $\partial L/\partial v$ is the sum, over all paths from $v$ to $L$, of the products of the local derivatives along the path. The backward pass adds up these products economically. Each adjoint $\bar c$ is computed once and then serves every path through $c$, so each arrow is used once, and the backward pass costs a small multiple of the forward pass, however many inputs there are.

::: figure id=fig-17-5
The computational graph of the loss $L(w, b) = (w + b - 1)^2 + (2w + b - 3)^2$ of Example 17.16, at $w = b = 0$. Each arrow carries its local derivative. The forward pass gives the values (blue); the backward pass, from $\bar L = 1$ back to the inputs, gives the adjoints (orange), and $\bar w = -14$ and $\bar b = -8$ are the two partial derivatives of $L$.
:::

::: example A forward and a backward pass
A model predicts the value $wx + b$ from an input $x$, with two parameters $w$ and $b$. On the two data points $(x, t) = (1, 1)$ and $(2, 3)$, where $t$ is the true value, its errors are $e_1 = w \cdot 1 + b - 1$ and $e_2 = w \cdot 2 + b - 3$, and its loss is $L = e_1^2 + e_2^2$. Starting from $w = b = 0$, find $\partial L/\partial w$ and $\partial L/\partial b$ by a forward and a backward pass (Figure 17.5), and take one step of gradient descent with $\eta = 0.05$.

**Forward pass.** $e_1 = -1$, $e_2 = -3$ and $L = 1 + 9 = 10$.

**Backward pass.** Start with $\bar L = 1$. The local derivatives of $L = e_1^2 + e_2^2$ are $2e_1$ and $2e_2$, so $\bar e_1 = \bar L \cdot 2e_1 = -2$ and $\bar e_2 = \bar L \cdot 2e_2 = -6$. The node $w$ has two children, $e_1$ and $e_2$, with local derivatives 1 and 2, the inputs $x$ of the two points; $b$ has the same children, with local derivatives 1 and 1:

$$\begin{aligned} \bar w &= \bar e_1 \cdot 1 + \bar e_2 \cdot 2 = -2 - 12 = -14, \\ \bar b &= \bar e_1 \cdot 1 + \bar e_2 \cdot 1 = -2 - 6 = -8. \end{aligned}$$

| Node | Forward pass | Backward pass |
|---|---|---|
| $w$, $b$ | $0$, $0$ | $\bar w = -14$, $\bar b = -8$ |
| $e_1 = w + b - 1$ | $-1$ | $\bar e_1 = \bar L \cdot 2e_1 = -2$ |
| $e_2 = 2w + b - 3$ | $-3$ | $\bar e_2 = \bar L \cdot 2e_2 = -6$ |
| $L = e_1^2 + e_2^2$ | $10$ | $\bar L = 1$ |

So $\nabla L(0, 0) = \langle -14, -8\rangle$. Check by differentiating $L(w, b) = (w + b - 1)^2 + (2w + b - 3)^2$ directly: $L_w = 2(w + b - 1) + 4(2w + b - 3)$ and $L_b = 2(w + b - 1) + 2(2w + b - 3)$, which are $-2 - 12 = -14$ and $-2 - 6 = -8$ at $(0, 0)$.

One step of gradient descent gives $\langle w, b\rangle = \langle 0, 0\rangle - 0.05\,\langle -14, -8\rangle = \langle 0.7, 0.4\rangle$, where $e_1 = 0.1$, $e_2 = -1.2$ and $L = 0.01 + 1.44 = 1.45$, down from 10. Further steps approach $w = 2$, $b = -1$, the line $t = 2x - 1$ through both points, where $L = 0$; Module 18 finds such best-fitting lines directly, by least squares.

```check
W_, B_ = symbols('w b')
e1_, e2_ = W_ + B_ - 1, 2*W_ + B_ - 3
Lw = e1_**2 + e2_**2
same([e1_.subs({W_: 0, B_: 0}), e2_.subs({W_: 0, B_: 0}), Lw.subs({W_: 0, B_: 0})], [-1, -3, 10])
same([2*(-1), 2*(-3)], [-2, -6]); same([diff(e1_, W_), diff(e2_, W_), diff(e1_, B_), diff(e2_, B_)], [1, 2, 1, 1])
steps(-2*1 + (-6)*2, -2 - 12, -14); steps(-2*1 + (-6)*1, -2 - 6, -8)
same(diff(Lw, W_), 2*(W_ + B_ - 1) + 4*(2*W_ + B_ - 3)); same(diff(Lw, B_), 2*(W_ + B_ - 1) + 2*(2*W_ + B_ - 3))
same(Matrix([diff(Lw, W_), diff(Lw, B_)]).subs({W_: 0, B_: 0}), Matrix([-14, -8]))
st1 = Matrix([0, 0]) - Rational(5, 100)*Matrix([-14, -8]); same(st1, Matrix([Rational(7, 10), Rational(4, 10)]))
same([e1_.subs({W_: st1[0], B_: st1[1]}), e2_.subs({W_: st1[0], B_: st1[1]})], [Rational(1, 10), -Rational(12, 10)])
steps(Lw.subs({W_: st1[0], B_: st1[1]}), Rational(1, 100) + Rational(144, 100), Rational(145, 100))
same(solve([e1_, e2_], [W_, B_]), {W_: 2, B_: -1})
```
:::

::: pitfall
Every child of a node contributes to its adjoint. Here $w$ influences $L$ through both data points; keeping only the path through $e_1$ would give $\bar w = -2$ instead of $-14$. A program therefore accumulates adjoints: each starts at 0, and each child adds its share.
:::

::: compute Backpropagation in Python
A few lines of Python record the graph while a computation runs, and then run the backward pass. Each `Var` holds a value, its parents with the local derivatives, and its adjoint, called `grad`:

```python
class Var:
    """A node of a computational graph."""
    def __init__(self, value, parents=()):
        self.value, self.parents, self.grad = value, parents, 0.0
    def __add__(self, other):
        other = other if isinstance(other, Var) else Var(other)
        return Var(self.value + other.value, [(self, 1.0), (other, 1.0)])
    def __mul__(self, other):
        other = other if isinstance(other, Var) else Var(other)
        return Var(self.value*other.value, [(self, other.value), (other, self.value)])
    def __sub__(self, other):
        return self + (-1.0)*other
    __radd__, __rmul__ = __add__, __mul__
```

The backward pass lists the nodes so that each comes after the nodes it was computed from, then walks the list backwards; each node passes its adjoint times the local derivative to each parent, which adds up what it receives:

```python
def backward(out):
    order, seen = [], set()
    def visit(v):
        if id(v) not in seen:
            seen.add(id(v))
            for p, _ in v.parents:
                visit(p)
            order.append(v)
    visit(out)
    out.grad = 1.0
    for v in reversed(order):
        for p, local in v.parents:
            p.grad += v.grad*local
```

Example 17.16:

```python
w, b = Var(0.0), Var(0.0)
data = [(1, 1), (2, 3)]                 # the points (x, t)
L = 0
for x, t in data:
    e = w*x + b - t                     # the error at this point
    L = L + e*e
backward(L)
print(L.value, w.grad, b.grad)
```

```output
10.0 -14.0 -8.0
```

The product `e*e` lists `e` twice as a parent, with the local derivative $e$ each time, so `e` receives $2e$ times the adjoint of the product: the product rule, done by the graph. SymPy, given the formula, agrees:

```python
import sympy as sp
ws, bs = sp.symbols('w b')
Ls = sum((ws*x + bs - t)**2 for x, t in data)
print(sp.expand(Ls), '|', [sp.diff(Ls, v).subs({ws: 0, bs: 0}) for v in (ws, bs)])
```

```output
2*b**2 + 6*b*w - 8*b + 5*w**2 - 14*w + 10 | [-14, -8]
```

SymPy expands the loss to $L = 5w^2 + 6wb + 2b^2 - 14w - 8b + 10$, with the terms in its own order, and its partial derivatives at $(0, 0)$ are those of the backward pass.

Training is a loop of forward pass, backward pass and gradient descent step:

```python
w, b = Var(0.0), Var(0.0)
for step in range(1, 501):
    L = 0
    for x, t in data:
        e = w*x + b - t
        L = L + e*e
    backward(L)
    if step in (1, 2, 3, 10, 100, 500):
        print(f"step {step:3d}: L = {L.value:.3g} at w = {w.value:.4f}, b = {b.value:.4f}")
    w, b = Var(w.value - 0.05*w.grad), Var(b.value - 0.05*b.grad)
```

```output
step   1: L = 10 at w = 0.0000, b = 0.0000
step   2: L = 1.45 at w = 0.7000, b = 0.4000
step   3: L = 0.59 at w = 0.9300, b = 0.5100
step  10: L = 0.405 at w = 1.1239, b = 0.4175
step 100: L = 0.0288 at w = 1.7666, b = -0.6224
step 500: L = 2.25e-07 at w = 1.9993, b = -0.9989
```

The second line is the step of Example 17.16. The loss falls fast at first and then slowly: after 100 steps it is still 0.0288, and only after some hundreds of steps do $w$ and $b$ settle near 2 and $-1$. The valley of this loss is long and narrow, the situation that Module 18 explains.
:::

```check
Lq = 5*W_**2 + 6*W_*B_ + 2*B_**2 - 14*W_ - 8*B_ + 10; same(expand(Lw), Lq)
st2 = st1 - Rational(5, 100)*Matrix([diff(Lw, W_), diff(Lw, B_)]).subs({W_: st1[0], B_: st1[1]})
same(st2, Matrix([Rational(93, 100), Rational(51, 100)])); rounds(Lw.subs({W_: st2[0], B_: st2[1]}), '0.59')
```

Neural networks are trained in exactly this way, with arrays of numbers in place of single numbers, nonlinear functions between the layers, and graphs of millions of nodes. The series [AI: From Machine Learning to Large Language Models](../ai/index.html) works through backpropagation in neural networks in [its Module 2](../ai/module_02_EN.html), and [Module 18 of Mathematical Foundations](../math/module_18_EN.html) writes the same chain rule with matrices.

## What you learned {#summary}

- A function of two or three variables has a domain in the plane or in space. The graph of $f(x, y)$ is a surface; its level curves $f(x, y) = k$ make a contour map, on which crowded contours mean steep ground. Functions of three variables have level surfaces $f(x, y, z) = k$.
- $\lim_{(x,y)\to(a,b)} f(x, y) = L$ needs the values to approach $L$ along every path. Two paths with different limits prove that no limit exists; agreement along every line proves nothing; a squeeze $\abs{f - L} \le g \to 0$ proves that the limit exists.
- The partial derivatives $f_x = \partial f/\partial x$ and $f_y$ are found by holding the other variable fixed; they are the slopes of slices of the surface. Clairaut's theorem: $f_{xy} = f_{yx}$ where both are continuous.
- The tangent plane $z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)$ gives the linear approximation. $f$ is differentiable when the error is small compared with the distance; continuous partial derivatives guarantee it, partial derivatives alone do not. The total differential $dz = f_x\,dx + f_y\,dy$ propagates errors.
- The chain rule adds one product for each path in the tree diagram, as in $\dfrac{dz}{dt} = \dfrac{\partial z}{\partial x}\dfrac{dx}{dt} + \dfrac{\partial z}{\partial y}\dfrac{dy}{dt}$; it gives implicit differentiation, $dy/dx = -F_x/F_y$ where $F_y \ne 0$.
- The gradient $\nabla f = \langle f_x, f_y\rangle$ gives every directional derivative, $D_{\vb{u}} f = \nabla f\cdot\vb{u}$. It points in the direction of steepest ascent, with rate $\norm{\nabla f}$, and is perpendicular to level curves; $\nabla F$ is normal to the level surface $F = k$.
- Gradient descent $\vb{x}_{k+1} = \vb{x}_k - \eta\nabla f(\vb{x}_k)$ steps downhill; too large a step size makes it zigzag or diverge. Backpropagation finds every partial derivative of a loss in one backward pass over the computational graph, adding over the children of each node: the chain rule, organised for many inputs.

## Exercises {#exercises}

:::: exercise Domain, range and level curves {#ex-17-1} ★
Let $f(x, y) = \sqrt{16 - x^2 - 4y^2}$.

- (a) Find and describe the domain and the range of $f$.
- (b) Describe the level curves $f(x, y) = k$ for $k = 0, 1, 2, 3, 4$. Where are they closest together, and what does that say about the surface?

::: solution
**(a)** The square root needs $16 - x^2 - 4y^2 \ge 0$, that is, $x^2 + 4y^2 \le 16$, or $\dfrac{x^2}{16} + \dfrac{y^2}{4} \le 1$: the ellipse with semi-axes 4 along the $x$-axis and 2 along the $y$-axis, together with its inside. On the domain, $16 - x^2 - 4y^2$ lies between 0 and 16, so $f$ takes values in $[0, 4]$; along the $x$-axis, $f(x, 0) = \sqrt{16 - x^2}$ takes every value from 0 to 4 as $x$ goes from 4 down to 0. The range is $[0, 4]$.

**(b)** For $0 \le k \le 4$, $f(x, y) = k$ means $x^2 + 4y^2 = 16 - k^2$ (square both sides, which are non-negative): an ellipse centred at the origin with semi-axes $\sqrt{16 - k^2}$ and $\tfrac12\sqrt{16 - k^2}$, always of the same shape. For $k = 0$ it is the edge of the domain. It crosses the positive $x$-axis at 4, $\sqrt{15} \approx 3.87$, $\sqrt{12} \approx 3.46$ and $\sqrt7 \approx 2.65$ for $k = 0, 1, 2, 3$; for $k = 4$ the level curve is the single point $(0, 0)$, the top. The gaps grow, from about 0.13 to 0.41, 0.82 and 2.65: the level curves are closest together near the edge, where the surface, the top half of an ellipsoid, is steepest.

```check
f_e1 = sqrt(16 - x**2 - 4*y**2)
same(function_range(sqrt(16 - x**2), x, Interval(0, 4)), Interval(0, 4)); same(f_e1.subs({x: 0, y: 0}), 4)
same([sqrt(16 - kv**2) for kv in range(5)], [4, sqrt(15), sqrt(12), sqrt(7), 0])
rounds(sqrt(15), '3.87'); rounds(sqrt(12), '3.46'); rounds(sqrt(7), '2.65')
same(f_e1.subs({x: sqrt(15), y: 0}), 1); same(f_e1.subs({x: 0, y: sqrt(15)/2}), 1)
gaps_ = [4 - sqrt(15), sqrt(15) - sqrt(12), sqrt(12) - sqrt(7), sqrt(7)]
rounds(gaps_[0], '0.13'); rounds(gaps_[1], '0.41'); rounds(gaps_[2], '0.82'); rounds(gaps_[3], '2.65')
holds(gaps_[0] < gaps_[1] < gaps_[2] < gaps_[3])
```
:::
::::

:::: exercise Partial derivatives {#ex-17-2} ★
Find all the first partial derivatives:

- (a) $f(x, y) = x^4y - 3x^2y^3 + 7$, and their values at $(1, -1)$
- (b) $g(x, y) = \ln(x^2 + y^2)$
- (c) $h(x, y, z) = \dfrac{xy^2}{z}$

::: solution
**(a)** Holding $y$ fixed, $f_x = 4x^3y - 6xy^3$; holding $x$ fixed, $f_y = x^4 - 9x^2y^2$. At $(1, -1)$: $f_x = -4 + 6 = 2$ and $f_y = 1 - 9 = -8$.

**(b)** By the chain rule, with the inner function $x^2 + y^2$ and the derivative $1/u$ of $\ln u$: $g_x = \dfrac{2x}{x^2 + y^2}$ and $g_y = \dfrac{2y}{x^2 + y^2}$, for $(x, y) \ne (0, 0)$.

**(c)** For $z \ne 0$: $h_x = \dfrac{y^2}{z}$ and $h_y = \dfrac{2xy}{z}$, since $\dfrac{1}{z}$ is a constant factor when $z$ is held fixed; and $h_z = -\dfrac{xy^2}{z^2}$, the constant $xy^2$ times the derivative of $\dfrac1z$. The quotient rule would give the same answers with more work.

```check
f_e2 = x**4*y - 3*x**2*y**3 + 7
same(diff(f_e2, x), 4*x**3*y - 6*x*y**3); same(diff(f_e2, y), x**4 - 9*x**2*y**2)
same(diff(f_e2, x).subs({x: 1, y: -1}), 2); same(diff(f_e2, y).subs({x: 1, y: -1}), -8)
same(diff(log(x**2 + y**2), x), 2*x/(x**2 + y**2)); same(diff(log(x**2 + y**2), y), 2*y/(x**2 + y**2))
h_e2 = x*y**2/z
same(diff(h_e2, x), y**2/z); same(diff(h_e2, y), 2*x*y/z); same(diff(h_e2, z), -x*y**2/z**2)
```
:::
::::

:::: exercise Two limits {#ex-17-3} ★
- (a) Show that $\lim_{(x, y)\to(0, 0)} \dfrac{x^2 - y^2}{x^2 + y^2}$ does not exist.
- (b) Find $\lim_{(x, y)\to(0, 0)} \dfrac{x^2 + y^2}{\sqrt{x^2 + y^2 + 1} - 1}$.

::: solution
**(a)** Along the $x$-axis ($y = 0$, $x \ne 0$) the function is $\dfrac{x^2}{x^2} = 1$; along the $y$-axis it is $\dfrac{-y^2}{y^2} = -1$. Two paths give two different limits, so by Theorem 17.1 the limit does not exist. (Along $y = mx$ it is $\dfrac{1 - m^2}{1 + m^2}$, which depends on $m$.)

**(b)** Direct substitution gives $\tfrac00$. The function depends on $x$ and $y$ only through $s = x^2 + y^2$, so rationalise as in [Section 2.5](module_02_EN.html#rationalise): for $s > 0$,

$$\frac{s}{\sqrt{s + 1} - 1} = \frac{s\big(\sqrt{s + 1} + 1\big)}{(s + 1) - 1} = \sqrt{s + 1} + 1.$$

As $(x, y) \to (0, 0)$, $s \to 0$, and $\sqrt{x^2 + y^2 + 1} + 1$ is continuous with the value 2 at the origin. The limit is 2.

```check
f_e3 = (x**2 - y**2)/(x**2 + y**2)
same(f_e3.subs(y, 0), 1); same(f_e3.subs(x, 0), -1); same(simplify(f_e3.subs(y, m*x)), (1 - m**2)/(1 + m**2))
sp_ = symbols('s', positive=True)
steps(sp_/(sqrt(sp_ + 1) - 1), sp_*(sqrt(sp_ + 1) + 1)/((sp_ + 1) - 1), sqrt(sp_ + 1) + 1)
limit_is(s/(sqrt(s + 1) - 1), s, 0, 2, '+'); same((sqrt(x**2 + y**2 + 1) + 1).subs({x: 0, y: 0}), 2)
```
:::
::::

:::: exercise A gradient and its directions {#ex-17-4} ★
Let $f(x, y) = x^2y - y^3$.

- (a) Find $\nabla f(2, 1)$.
- (b) Find the directional derivative of $f$ at $(2, 1)$ in the direction of $\langle 1, -1\rangle$.
- (c) In which direction does $f$ increase fastest at $(2, 1)$, and at what rate? In which directions is the rate of change 0?

::: solution
**(a)** $f_x = 2xy$ and $f_y = x^2 - 3y^2$, so $\nabla f(2, 1) = \langle 4, 4 - 3\rangle = \langle 4, 1\rangle$.

**(b)** $\langle 1, -1\rangle$ has length $\sqrt2$, so $\vb{u} = \langle 1, -1\rangle/\sqrt2$, and by Theorem 17.9

$$D_{\vb{u}} f(2, 1) = \frac{4 \cdot 1 + 1 \cdot (-1)}{\sqrt2} = \frac{3}{\sqrt2} \approx 2.121.$$

Using $\langle 1, -1\rangle$ itself would give 3, which is wrong: it is not a unit vector.

**(c)** Fastest in the direction of $\nabla f(2, 1)$, that is, $\vb{u} = \langle 4, 1\rangle/\sqrt{17}$, at the rate $\norm{\langle 4, 1\rangle} = \sqrt{17} \approx 4.123$ (Theorem 17.10). The rate is 0 in the two directions perpendicular to the gradient, $\pm\langle 1, -4\rangle/\sqrt{17}$, along the level curve through $(2, 1)$: indeed $\langle 4, 1\rangle\cdot\langle 1, -4\rangle = 4 - 4 = 0$.

```check
f_e4 = x**2*y - y**3
g_e4 = Matrix([diff(f_e4, x), diff(f_e4, y)]); same(g_e4, Matrix([2*x*y, x**2 - 3*y**2])); same(g_e4.subs({x: 2, y: 1}), Matrix([4, 1]))
G4 = Matrix([4, 1]); u4 = Matrix([1, -1])/sqrt(2)
same(G4.dot(u4), 3/sqrt(2)); rounds(3/sqrt(2), '2.121'); same(G4.dot(Matrix([1, -1])), 3)
same(G4.norm(), sqrt(17)); rounds(sqrt(17), '4.123'); same(G4.dot(Matrix([1, -4])), 0)
```
:::
::::

:::: exercise A limit by squeezing {#ex-17-5} ★★
Show that $\lim_{(x, y)\to(0, 0)} \dfrac{x^3 + y^3}{x^2 + y^2} = 0$.

::: solution
Let $(x, y) \ne (0, 0)$, and let $\rho = \sqrt{x^2 + y^2}$ be its distance from the origin. Since $\abs{x} \le \rho$, $\abs{x^3} = \abs{x}\,x^2 \le \rho\,x^2$; in the same way $\abs{y^3} \le \rho\,y^2$. So

$$\abs{\frac{x^3 + y^3}{x^2 + y^2}} \le \frac{\abs{x^3} + \abs{y^3}}{x^2 + y^2} \le \frac{\rho\,(x^2 + y^2)}{x^2 + y^2} = \rho.$$

As $(x, y) \to (0, 0)$, $\rho \to 0$, so by the squeeze theorem (Theorem 17.2, with $g = \rho$ and $L = 0$) the limit is 0. Checking paths would only have suggested the answer: along $y = mx$ the function is $\dfrac{(1 + m^3)x}{1 + m^2}$, which tends to 0, but Example 17.3's pitfall shows that lines alone prove nothing.

```check
xr2, yr2 = symbols('x y', real=True)
rho_ = sqrt(xr2**2 + yr2**2)
holds(all(abs(((x**3 + y**3)/(x**2 + y**2)).subs({x: p_, y: q_})) <= sqrt(p_**2 + q_**2) for p_ in (Rational(1, 2), -3, Rational(2, 7)) for q_ in (-Rational(1, 3), 2, 5)))
same(Abs(xr2**3), Abs(xr2)*xr2**2); same(rho_**2 - xr2**2, yr2**2)                # |x^3| = |x| x^2, and |x| <= rho since rho^2 - x^2 = y^2 >= 0
same(simplify(((x**3 + y**3)/(x**2 + y**2)).subs(y, m*x)), (1 + m**3)*x/(1 + m**2)); limit_is((1 + m**3)*x/(1 + m**2), x, 0, 0)
same(rho_*(xr2**2 + yr2**2)/(xr2**2 + yr2**2), rho_)
```
:::
::::

:::: exercise A tangent plane and an estimate {#ex-17-6} ★★
Let $f(x, y) = xe^{xy}$.

- (a) Find the tangent plane to the surface $z = f(x, y)$ at $(1, 0, 1)$.
- (b) Use the linear approximation to estimate $f(1.1, -0.1)$, and compare with the value from a calculator.

::: solution
**(a)** By the product and chain rules, $f_x = e^{xy} + xye^{xy} = (1 + xy)e^{xy}$ and $f_y = x \cdot xe^{xy} = x^2e^{xy}$, both continuous everywhere. At $(1, 0)$: $f(1, 0) = 1$, $f_x(1, 0) = 1$ and $f_y(1, 0) = 1$. The tangent plane is $z = 1 + (x - 1) + (y - 0)$, that is, $z = x + y$.

**(b)** $f(1.1, -0.1) \approx 1.1 + (-0.1) = 1$. A calculator gives $1.1e^{-0.11} \approx 0.98542$, so the estimate is about 0.015 too high: the point is a distance $\sqrt{0.1^2 + 0.1^2} \approx 0.14$ from $(1, 0)$, not very close.

```check
f_e6 = x*exp(x*y)
same(diff(f_e6, x), (1 + x*y)*exp(x*y)); same(diff(f_e6, y), x**2*exp(x*y))
same([f_e6.subs({x: 1, y: 0}), diff(f_e6, x).subs({x: 1, y: 0}), diff(f_e6, y).subs({x: 1, y: 0})], [1, 1, 1])
same(expand(1 + (x - 1) + (y - 0)), x + y); same((x + y).subs({x: Rational(11, 10), y: -Rational(1, 10)}), 1)
same(f_e6.subs({x: Rational(11, 10), y: -Rational(1, 10)}), Rational(11, 10)*exp(-Rational(11, 100)))
rounds(f_e6.subs({x: Rational(11, 10), y: -Rational(1, 10)}), '0.98542'); rounds(1 - Rational(11, 10)*exp(-Rational(11, 100)), '0.015')
rounds(sqrt(Rational(2, 100)), '0.14')
```
:::
::::

:::: exercise A chain rule with three routes {#ex-17-7} ★★
Let $w = x^2 + yz$, where $x = t^2$, $y = \cos t$ and $z = \sin t$.

- (a) Draw the tree diagram, and use it to find $dw/dt$ as a function of $t$.
- (b) Check by substituting first.
- (c) Find $dw/dt$ at $t = 0$ and at $t = \pi/4$.

::: solution
**(a)** The tree has $w$ at the top, three branches down to $x$, $y$ and $z$, labelled $w_x = 2x$, $w_y = z$ and $w_z = y$, and from each of these a branch down to $t$, labelled $dx/dt = 2t$, $dy/dt = -\sin t$ and $dz/dt = \cos t$. Three paths give three products:

$$\begin{aligned} \frac{dw}{dt} &= 2x\cdot 2t + z\cdot(-\sin t) + y\cos t \\ &= 4t^3 - \sin^2 t + \cos^2 t = 4t^3 + \cos 2t, \end{aligned}$$

using $x = t^2$, $y = \cos t$, $z = \sin t$ and $\cos^2 t - \sin^2 t = \cos 2t$ (the addition formula of Module 1 with both angles $t$).

**(b)** $w = t^4 + \cos t\sin t = t^4 + \tfrac12\sin 2t$, so $\dfrac{dw}{dt} = 4t^3 + \cos 2t$, as in (a).

**(c)** At $t = 0$: $\dfrac{dw}{dt} = 0 + 1 = 1$. At $t = \pi/4$: $4\Big(\dfrac{\pi}{4}\Big)^3 + \cos\dfrac{\pi}{2} = \dfrac{\pi^3}{16} \approx 1.938$.

```check
xw, yw, zw = t**2, cos(t), sin(t)
ww = x**2 + y*z
steps((diff(ww, x)*diff(xw, t) + diff(ww, y)*diff(yw, t) + diff(ww, z)*diff(zw, t)).subs({x: xw, y: yw, z: zw}), 4*t**3 - sin(t)**2 + cos(t)**2, 4*t**3 + cos(2*t))
same(ww.subs({x: xw, y: yw, z: zw}), t**4 + sin(2*t)/2); same(diff(t**4 + sin(2*t)/2, t), 4*t**3 + cos(2*t))
same((4*t**3 + cos(2*t)).subs(t, 0), 1); same((4*t**3 + cos(2*t)).subs(t, pi/4), pi**3/16); rounds(pi**3/16, '1.938')
```
:::
::::

:::: exercise A level surface {#ex-17-8} ★★
The point $(1, 2, 3)$ lies on the surface $xyz = 6$.

- (a) Find the tangent plane to the surface there.
- (b) Near $(1, 2, 3)$ the surface is the graph of a function $z(x, y)$. Find $\partial z/\partial x$ and $\partial z/\partial y$ at $(1, 2)$ by implicit differentiation.
- (c) Check (b) in two ways: with the tangent plane of (a), and by solving for $z$.

::: solution
**(a)** With $F(x, y, z) = xyz$, $\nabla F = \langle yz, xz, xy\rangle$, so $\nabla F(1, 2, 3) = \langle 6, 3, 2\rangle$. The tangent plane is

$$6(x - 1) + 3(y - 2) + 2(z - 3) = 0, \quad\text{that is,}\quad 6x + 3y + 2z = 18.$$

**(b)** $F_z(1, 2, 3) = 2 \ne 0$, so $\dfrac{\partial z}{\partial x} = -\dfrac{F_x}{F_z} = -\dfrac62 = -3$ and $\dfrac{\partial z}{\partial y} = -\dfrac{F_y}{F_z} = -\dfrac32$.

**(c)** Solved for $z$, the tangent plane is $z = 9 - 3x - \tfrac32 y$, whose slopes are $-3$ and $-\tfrac32$. And $z = \dfrac{6}{xy}$, so at $(1, 2)$, $z_x = -\dfrac{6}{x^2y} = -\dfrac62 = -3$ and $z_y = -\dfrac{6}{xy^2} = -\dfrac64 = -\dfrac32$.

```check
F_e8 = x*y*z; P8 = {x: 1, y: 2, z: 3}
same(F_e8.subs(P8), 6)
g8 = Matrix([diff(F_e8, v_) for v_ in (x, y, z)]); same(g8, Matrix([y*z, x*z, x*y])); same(g8.subs(P8), Matrix([6, 3, 2]))
same(expand(6*(x - 1) + 3*(y - 2) + 2*(z - 3)), 6*x + 3*y + 2*z - 18)
same((-g8[0]/g8[2]).subs(P8), -3); same((-g8[1]/g8[2]).subs(P8), -Rational(3, 2))
same(solve(6*x + 3*y + 2*z - 18, z), [9 - 3*x - Rational(3, 2)*y])
zf8 = 6/(x*y); same(diff(zf8, x), -6/(x**2*y)); same(diff(zf8, y), -6/(x*y**2))
same(diff(zf8, x).subs({x: 1, y: 2}), -3); same(diff(zf8, y).subs({x: 1, y: 2}), -Rational(3, 2))
```
:::
::::

:::: exercise Laplace's equation {#ex-17-9} ★★
Show that $u(x, y) = \ln(x^2 + y^2)$ satisfies Laplace's equation $u_{xx} + u_{yy} = 0$ for $(x, y) \ne (0, 0)$, and check that $u_{xy} = u_{yx}$.

::: solution
From Exercise 17.2(b), $u_x = \dfrac{2x}{x^2 + y^2}$ and $u_y = \dfrac{2y}{x^2 + y^2}$. By the quotient rule, holding $y$ fixed,

$$u_{xx} = \frac{2(x^2 + y^2) - 2x\cdot 2x}{(x^2 + y^2)^2} = \frac{2(y^2 - x^2)}{(x^2 + y^2)^2},$$

and in the same way, holding $x$ fixed, $u_{yy} = \dfrac{2(x^2 - y^2)}{(x^2 + y^2)^2}$. The two cancel: $u_{xx} + u_{yy} = 0$.

For the mixed partial derivatives, the numerator $2x$ of $u_x$ is a constant when $x$ is held fixed, so

$$u_{xy} = 2x\cdot\frac{-2y}{(x^2 + y^2)^2} = -\frac{4xy}{(x^2 + y^2)^2},$$

and in the same way $u_{yx} = 2y\cdot\dfrac{-2x}{(x^2 + y^2)^2} = -\dfrac{4xy}{(x^2 + y^2)^2}$. They are equal, as Clairaut's theorem predicts: both are continuous away from the origin.

```check
uL = log(x**2 + y**2)
steps(diff(uL, x, 2), (2*(x**2 + y**2) - 2*x*2*x)/(x**2 + y**2)**2, 2*(y**2 - x**2)/(x**2 + y**2)**2)
same(diff(uL, y, 2), 2*(x**2 - y**2)/(x**2 + y**2)**2); same(diff(uL, x, 2) + diff(uL, y, 2), 0)
steps(diff(uL, x, y), 2*x*(-2*y)/(x**2 + y**2)**2, -4*x*y/(x**2 + y**2)**2); same(diff(uL, y, x), -4*x*y/(x**2 + y**2)**2)
```
:::
::::

:::: exercise When Clairaut's theorem does not apply {#ex-17-10} ★★★
Let $f(x, y) = \dfrac{xy(x^2 - y^2)}{x^2 + y^2}$ for $(x, y) \ne (0, 0)$, and $f(0, 0) = 0$.

- (a) Show that $f_x(0, y) = -y$ for every $y$, and that $f_y(x, 0) = x$ for every $x$.
- (b) Deduce that $f_{xy}(0, 0) = -1$ and $f_{yx}(0, 0) = 1$.
- (c) Which hypothesis of Clairaut's theorem fails?

::: solution
**(a)** Fix $y \ne 0$. Since $f(0, y) = 0$, the definition gives

$$f_x(0, y) = \lim_{h\to0}\frac{f(h, y) - 0}{h} = \lim_{h\to0}\frac{y(h^2 - y^2)}{h^2 + y^2} = \frac{y(-y^2)}{y^2} = -y,$$

by direct substitution, since the denominator tends to $y^2 \ne 0$. For $y = 0$: $f(h, 0) = 0$ for every $h$, so $f_x(0, 0) = 0 = -0$. So $f_x(0, y) = -y$ for every $y$. In the same way, for $x \ne 0$, since $f(x, 0) = 0$,

$$f_y(x, 0) = \lim_{h\to0}\frac{f(x, h)}{h} = \lim_{h\to0}\frac{x(x^2 - h^2)}{x^2 + h^2} = x,$$

and $f_y(0, 0) = 0$ because $f(0, h) = 0$. So $f_y(x, 0) = x$ for every $x$.

**(b)** $f_{xy}(0, 0)$ is the derivative of $y \mapsto f_x(0, y) = -y$ at $y = 0$, which is $-1$. $f_{yx}(0, 0)$ is the derivative of $x \mapsto f_y(x, 0) = x$ at $x = 0$, which is $1$.

**(c)** Clairaut's theorem needs $f_{xy}$ and $f_{yx}$ to be continuous on a disc around the origin. They cannot both be, or the theorem would make them equal there. Indeed, for $(x, y) \ne (0, 0)$ the rules give

$$f_{xy} = \frac{x^6 + 9x^4y^2 - 9x^2y^4 - y^6}{(x^2 + y^2)^3},$$

which is 1 on the $x$-axis and $-1$ on the $y$-axis, so it has no limit at the origin. The function itself is continuous (it is squeezed by $\abs{f} \le \abs{xy}$) and has both first partial derivatives everywhere: only the continuity of the mixed partial derivatives fails.

```check
fC = x*y*(x**2 - y**2)/(x**2 + y**2)
same(simplify(fC.subs(x, h)/h), y*(h**2 - y**2)/(h**2 + y**2)); limit_is(y*(h**2 - y**2)/(h**2 + y**2), h, 0, -y)
same(fC.subs({x: h, y: 0}), 0); same(fC.subs({x: 0, y: h}), 0)
same(simplify(fC.subs(y, h)/h), x*(x**2 - h**2)/(x**2 + h**2)); limit_is(x*(x**2 - h**2)/(x**2 + h**2), h, 0, x)
same(diff(-y, y), -1); same(diff(x, x), 1)
same(diff(fC, x, y), (x**6 + 9*x**4*y**2 - 9*x**2*y**4 - y**6)/(x**2 + y**2)**3)
same(diff(fC, x, y).subs(y, 0), 1); same(diff(fC, x, y).subs(x, 0), -1)
same(Abs(xr*yr) - Abs(fC.subs({x: xr, y: yr})), Abs(xr*yr)*(1 - Abs(xr**2 - yr**2)/(xr**2 + yr**2)))
holds(all(abs(fC.subs({x: p_, y: q_})) <= abs(p_*q_) for p_ in (Rational(1, 2), -3, 2) for q_ in (Rational(1, 3), 1, -4)))
```
:::
::::

:::: exercise Backpropagation through a shared weight {#ex-17-11} ★★★
A recurrent network applies the same step twice, with the same parameters $w$ and $b$: from an input $x$ it computes $h_1 = wx + b$, then $h_2 = wh_1 + b$, and its loss is $L = (h_2 - t)^2$ for a target $t$.

- (a) Draw the computational graph, with its local derivatives. Which nodes have two children?
- (b) With $x = 1$, $t = 5$, $w = 2$ and $b = 1$, do a forward and a backward pass to find $\partial L/\partial w$ and $\partial L/\partial b$.
- (c) Check by writing $L$ as a function of $w$ and $b$ and differentiating.
- (d) Take one step of gradient descent with $\eta = 0.01$. Does the loss decrease?

::: solution
**(a)** The nodes are $w$, $b$, $h_1 = wx + b$, $h_2 = wh_1 + b$ and $L = (h_2 - t)^2$; the input $x$ and the target $t$ are constants. The arrows run $w \to h_1$ and $b \to h_1$; $w \to h_2$, $b \to h_2$ and $h_1 \to h_2$; and $h_2 \to L$. The parameters $w$ and $b$ each have two children, $h_1$ and $h_2$, because they are used at both steps. The local derivatives are $\partial h_1/\partial w = x$, $\partial h_1/\partial b = 1$, $\partial h_2/\partial w = h_1$, $\partial h_2/\partial b = 1$, $\partial h_2/\partial h_1 = w$ and $\partial L/\partial h_2 = 2(h_2 - t)$.

**(b)** Forward: $h_1 = 2 \cdot 1 + 1 = 3$, $h_2 = 2 \cdot 3 + 1 = 7$ and $L = (7 - 5)^2 = 4$. Backward: $\bar L = 1$; $\bar h_2 = \bar L \cdot 2(h_2 - t) = 4$; $\bar h_1 = \bar h_2 \cdot w = 8$. Each parameter adds the contributions of its two children:

$$\begin{aligned} \bar w &= \bar h_2 \cdot h_1 + \bar h_1 \cdot x = 4 \cdot 3 + 8 \cdot 1 = 20, \\ \bar b &= \bar h_2 \cdot 1 + \bar h_1 \cdot 1 = 4 + 8 = 12. \end{aligned}$$

So $\partial L/\partial w = 20$ and $\partial L/\partial b = 12$.

**(c)** $h_2 = w(wx + b) + b = w^2x + wb + b$, so $L = (w^2x + wb + b - t)^2$, and by the chain rule

$$\begin{aligned} L_w &= 2(h_2 - t)(2wx + b) = 2 \cdot 2 \cdot 5 = 20, \\ L_b &= 2(h_2 - t)(w + 1) = 2 \cdot 2 \cdot 3 = 12. \end{aligned}$$

**(d)** $\langle w, b\rangle = \langle 2, 1\rangle - 0.01\,\langle 20, 12\rangle = \langle 1.8, 0.88\rangle$. Then $h_1 = 1.8 + 0.88 = 2.68$, $h_2 = 1.8 \cdot 2.68 + 0.88 = 5.704$, and $L = 0.704^2 \approx 0.496$: the loss has dropped from 4.

```check
wv, bv, xv, tv = 2, 1, 1, 5
h1v = wv*xv + bv; h2v = wv*h1v + bv; Lv = (h2v - tv)**2
same([h1v, h2v, Lv], [3, 7, 4])
hb2 = 2*(h2v - tv); hb1 = hb2*wv; same([hb2, hb1], [4, 8])
steps(hb2*h1v + hb1*xv, 4*3 + 8*1, 20); steps(hb2 + hb1, 4 + 8, 12)
Ws, Bs = symbols('w b')
Ls11 = (Ws*(Ws*xv + Bs) + Bs - tv)**2
same(expand(Ws*(Ws*x + Bs) + Bs), Ws**2*x + Ws*Bs + Bs)
same(diff(Ls11, Ws), 2*(Ws**2*xv + Ws*Bs + Bs - tv)*(2*Ws*xv + Bs)); same(diff(Ls11, Bs), 2*(Ws**2*xv + Ws*Bs + Bs - tv)*(Ws + 1))
same([diff(Ls11, Ws).subs({Ws: 2, Bs: 1}), diff(Ls11, Bs).subs({Ws: 2, Bs: 1})], [20, 12])
w1, b1 = 2 - Rational(1, 100)*20, 1 - Rational(1, 100)*12; same([w1, b1], [Rational(18, 10), Rational(88, 100)])
same(w1*xv + b1, Rational(268, 100)); same(w1*(w1*xv + b1) + b1, Rational(5704, 1000)); rounds(Ls11.subs({Ws: w1, Bs: b1}), '0.496')
```
:::
::::

## Check yourself {#quiz}

```quiz
? The level curves of $f(x, y) = x^2 + 4y^2$ are
- [ ] circles centred at the origin
- [ ] parabolas
- [x] ellipses centred at the origin, and the single point $(0, 0)$
- [ ] straight lines through the origin
> For $k > 0$, $x^2 + 4y^2 = k$ is an ellipse that reaches $\sqrt k$ along the $x$-axis but only $\sqrt k/2$ along the $y$-axis; for $k = 0$ it is the origin alone. They are not circles, because the coefficients of $x^2$ and $y^2$ differ. Parabolas and lines would need $x$ or $y$ to appear without a square.

? For $f(x, y) = x^2y^3$, $f_x$ is
- [x] $2xy^3$
- [ ] $3x^2y^2$
- [ ] $2xy^3 + 3x^2y^2$
- [ ] $6xy^2$
> Hold $y$ fixed: $y^3$ is a constant factor, and the derivative of $x^2$ is $2x$. $3x^2y^2$ is $f_y$; $2xy^3 + 3x^2y^2$ differentiates with respect to both variables at once; $6xy^2$ is the mixed partial derivative $f_{xy}$.

? Along the line $y = 2x$, with $x \ne 0$, the function $\dfrac{xy}{x^2 + y^2}$ equals
- [ ] $\dfrac12$
- [x] $\dfrac25$
- [ ] $0$
- [ ] $2$
> $\dfrac{x \cdot 2x}{x^2 + 4x^2} = \dfrac{2x^2}{5x^2} = \dfrac25$. $\tfrac12$ is the value along $y = x$, and 0 the value along the axes; since different lines give different values, the function has no limit at the origin. 2 is the slope of the line, not a value of the function.

? The tangent plane to $z = x^2 + y^2$ at $(1, 2, 5)$ is
- [ ] $z = 2x + 4y$
- [ ] $z = 5 + 2x + 4y$
- [ ] $z = 5 + 2x(x - 1) + 2y(y - 2)$
- [x] $z = 5 + 2(x - 1) + 4(y - 2)$
> $f_x = 2x$ and $f_y = 2y$ are 2 and 4 at $(1, 2)$, so the plane is $z = f(1, 2) + 2(x - 1) + 4(y - 2)$. $z = 2x + 4y$ has the right slopes but the height 10 at $(1, 2)$, not 5; $z = 5 + 2x + 4y$ forgets to subtract $a$ and $b$; the third keeps $f_x = 2x$ and $f_y = 2y$ without evaluating them at the point, and is not a plane.

? At a point, $\nabla f = \langle 3, -4\rangle$. Which statement is true?
- [ ] The largest directional derivative there is 7.
- [ ] $f$ increases fastest in the direction $\langle -3, 4\rangle/5$.
- [x] The largest directional derivative there is 5, in the direction $\langle 3, -4\rangle/5$.
- [ ] $D_{\vb{u}} f = 0$ for $\vb{u} = \langle 3, -4\rangle/5$.
> The largest rate is $\norm{\nabla f} = \sqrt{9 + 16} = 5$, in the direction of $\nabla f$ (Theorem 17.10). 7 adds the sizes of the components instead of taking the length; $\langle -3, 4\rangle/5$ is the direction of fastest decrease; and the rate is 0 in the directions $\pm\langle 4, 3\rangle/5$, perpendicular to $\nabla f$, not along it.

? Clairaut's theorem says that $f_{xy}(a, b) = f_{yx}(a, b)$ if
- [x] $f_{xy}$ and $f_{yx}$ are continuous on a disc containing $(a, b)$
- [ ] $f_x$ and $f_y$ exist at $(a, b)$
- [ ] $f$ is continuous at $(a, b)$
- [ ] nothing more: it holds for every function
> The hypothesis is the continuity of the mixed partial derivatives near the point. The existence of $f_x$ and $f_y$, and the continuity of $f$, are not enough: the function of Exercise 17.10 is continuous, has both first partial derivatives everywhere, and has $f_{xy}(0, 0) = -1$ but $f_{yx}(0, 0) = 1$.

? One step of gradient descent on $f(x, y) = x^2 + y^2$ from $(1, 2)$ with $\eta = 0.25$ leads to
- [ ] $(1.5, 3)$
- [x] $(0.5, 1)$
- [ ] $(0.75, 1.75)$
- [ ] $(0, 0)$
> $\nabla f(1, 2) = \langle 2, 4\rangle$, so the new point is $(1, 2) - 0.25\,\langle 2, 4\rangle = (0.5, 1)$. $(1.5, 3)$ adds $\eta\nabla f$ and climbs uphill; $(0.75, 1.75)$ subtracts $\eta$ itself instead of $\eta\nabla f$; $(0, 0)$, the minimum, is where one step with $\eta = 0.5$ would land.

? In a backward pass, a node $v$ whose value is used by two later nodes $c_1$ and $c_2$ gets the adjoint
- [ ] $\bar c_1\,\dfrac{\partial c_1}{\partial v}\cdot\bar c_2\,\dfrac{\partial c_2}{\partial v}$
- [ ] the larger of $\bar c_1$ and $\bar c_2$
- [ ] $\bar c_1\,\dfrac{\partial c_1}{\partial v}$, from the first of the two children only
- [x] $\bar c_1\,\dfrac{\partial c_1}{\partial v} + \bar c_2\,\dfrac{\partial c_2}{\partial v}$
> $L$ depends on $v$ through both $c_1$ and $c_2$, and the chain rule adds one term for each route, as in a tree diagram. Multiplying the two terms, taking the larger adjoint, or keeping only one term all lose part of the dependence.
```

```check
same((x**2 + 4*y**2).subs({x: sqrt(k), y: 0}), k); same((x**2 + 4*y**2).subs({x: 0, y: sqrt(k)/2}), k)
same(diff(x**2*y**3, x), 2*x*y**3); same(diff(x**2*y**3, y), 3*x**2*y**2); same(diff(x**2*y**3, x, y), 6*x*y**2)
same((x*y/(x**2 + y**2)).subs(y, 2*x), Rational(2, 5))
pl_ = 5 + 2*(x - 1) + 4*(y - 2); same(pl_.subs({x: 1, y: 2}), 5); same((2*x + 4*y).subs({x: 1, y: 2}), 10)
same([diff(x**2 + y**2, x).subs({x: 1, y: 2}), diff(x**2 + y**2, y).subs({x: 1, y: 2})], [2, 4]); same((x**2 + y**2).subs({x: 1, y: 2}), 5)
same(Matrix([3, -4]).norm(), 5); same(Matrix([3, -4]).dot(Matrix([4, 3])), 0)
same(Matrix([1, 2]) - Rational(1, 4)*Matrix([2, 4]), Matrix([Rational(1, 2), 1])); same(Matrix([1, 2]) - Rational(1, 2)*Matrix([2, 4]), Matrix([0, 0]))
```
