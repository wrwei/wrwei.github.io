---
title: Curves and vectors
part: 5
lead: Describe curves by a moving point and by polar coordinates, and find their slopes, lengths and areas. Then learn the language of calculus in several variables, vectors in the plane and in space, and use it to describe lines, planes and motion along a path.
minutes: 270
needs: Modules 1 to 15, especially the chain rule (Module 5), derivatives of inverse functions (Module 6), the closed interval method (Module 8), substitution (Module 10) and arc length (Module 12)
goals:
  - Describe curves by parametric equations and in polar coordinates, and convert between descriptions
  - Find the tangent lines and arc lengths of parametric curves, and the slopes and areas of polar curves
  - Compute with vectors in the plane and in space, including lengths, angles, projections and the dot and cross products
  - Write equations of lines and planes in space, and find the distance from a point to a plane
  - Differentiate and integrate vector functions to find velocity, acceleration and the length of a space curve
  - Model projectile motion, and find the launch angle that gives the greatest range
---

## Parametric curves {#parametric}

So far the curves in this series have mostly been graphs of functions, $y = f(x)$. Many curves are not: a circle fails the vertical line test of [Section 1.3](module_01_EN.html#graphs), and so do the orbit of a satellite and the track of a point on a rolling wheel. An equation such as the circle's $x^2 + y^2 = 25$ ([Section 6.4](module_06_EN.html#implicit)) says where such a curve goes, but not how a point travels along it. This module describes a curve the way physics describes motion: by the position of a moving point at each time $t$.

Suppose a point moves so that at time $t$ it is at $x = t^2$, $y = t^3 - 3t$. Its positions at a few times:

```valuetable
t = -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2
$x = t^2$ = t**2
$y = t^3 - 3t$ = t**3 - 3*t
---
t | x = t^2 | y = t^3 - 3t
-2 | 4 | -2
-1.5 | 2.25 | 1.125
-1 | 1 | 2
-0.5 | 0.25 | 1.375
0 | 0 | 0
0.5 | 0.25 | -1.375
1 | 1 | -2
1.5 | 2.25 | -1.125
2 | 4 | 2
```

Plot the points in order of $t$ and join them (Figure 16.1, left). The point comes in from the lower right, at $(4, -2)$ when $t = -2$, and climbs to $(1, 2)$ at $t = -1$. There it turns, sweeps down through the origin at $t = 0$ to $(1, -2)$ at $t = 1$, turns again and heads up to $(4, 2)$. On the way it passes through $(3, 0)$ twice, at $t = -\sqrt3$ and at $t = \sqrt3$, since then $x = 3$ and $y = t(t^2 - 3) = 0$. The curve is not the graph of a function of $x$: the vertical line $x = 1$ meets it at $(1, 2)$ and at $(1, -2)$.

```check
xq1, yq1 = t**2, t**3 - 3*t
same([(xq1.subs(t, v), yq1.subs(t, v)) for v in (-2, -1, 0, 1, 2)], [(4, -2), (1, 2), (0, 0), (1, -2), (4, 2)])
same(yq1, t*(t**2 - 3)); same_set(solve(xq1 - 3, t), [sqrt(3), -sqrt(3)])
same([yq1.subs(t, v) for v in (sqrt(3), -sqrt(3))], [0, 0])
same_set(solve(diff(yq1, t), t), [-1, 1])             # where y(t) turns: t = -1 and t = 1
holds(diff(yq1, t, 2).subs(t, -1) < 0); holds(diff(yq1, t, 2).subs(t, 1) > 0)
```

::: figure id=fig-16-1
Left: the curve $x = t^2$, $y = t^3 - 3t$ for $-2 \le t \le 2$, with the points of the table at whole-number $t$; arrows show the direction of increasing $t$. It crosses itself at $(3, 0)$, where it has two tangent lines (dashed; Example 16.3). Right: the graphs of $x(t) = t^2$ and $y(t) = t^3 - 3t$ against $t$, the two functions that the curve is built from.
:::

::: definition Parametric curve
Let $f$ and $g$ be continuous functions on an interval $I$. As $t$ runs through $I$, the point $\big(f(t), g(t)\big)$ traces a **parametric curve**, given by the **parametric equations**

$$x = f(t), \qquad y = g(t).$$

The variable $t$ is the **parameter**. If $I = [a, b]$, the curve starts at its **initial point** $\big(f(a), g(a)\big)$ and ends at its **terminal point** $\big(f(b), g(b)\big)$.
:::

The parameter is often time, but it need not be: in Section 16.3 it is an angle. Equations $x = f(t)$, $y = g(t)$ that trace a given curve are a **parametrisation** of it, and the direction in which the point moves as $t$ increases is the curve's **orientation**, shown in figures by arrows.

::: example Circles and ellipses
Describe the curves traced for $0 \le t \le 2\pi$ by (a) $x = \cos t$, $y = \sin t$; (b) $x = 3\cos t$, $y = 2\sin t$; (c) $x = \cos 2t$, $y = \sin 2t$; (d) $x = \sin t$, $y = \cos t$.

**(a)** By the definition of sine and cosine in [Section 1.4](module_01_EN.html#trig), $(\cos t, \sin t)$ is the point of the unit circle at angle $t$. So as $t$ runs from 0 to $2\pi$ the point goes once round the unit circle, anticlockwise, from $(1, 0)$ back to $(1, 0)$. Every point satisfies $x^2 + y^2 = \cos^2 t + \sin^2 t = 1$.

**(b)** Here $x/3 = \cos t$ and $y/2 = \sin t$, so

$$\frac{x^2}{9} + \frac{y^2}{4} = \cos^2 t + \sin^2 t = 1.$$

This is an **ellipse**: the unit circle stretched horizontally by the factor 3 and vertically by the factor 2 ([Section 1.5](module_01_EN.html#transformations)). It crosses the $x$-axis at $\pm3$ and the $y$-axis at $\pm2$, and the point goes round it once anticlockwise from $(3, 0)$. In general, for $a, b > 0$, $x = a\cos t$, $y = b\sin t$ traces the ellipse $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$; with $a = b = r$ it is the circle of radius $r$ centred at the origin.

**(c)** Again $x^2 + y^2 = 1$, but the point is at angle $2t$: it goes round the unit circle twice as fast, and twice as $t$ runs from 0 to $2\pi$.

**(d)** Again $x^2 + y^2 = \sin^2 t + \cos^2 t = 1$. The point starts at $(0, 1)$ when $t = 0$ and is at $(1, 0)$ when $t = \pi/2$: it goes once round the circle **clockwise**, starting at the top.

So one curve has many parametrisations, which differ in where they start, how fast they go and in which direction.

```check
same(cos(t)**2 + sin(t)**2, 1); same((cos(0), sin(0)), (1, 0)); same((cos(2*pi), sin(2*pi)), (1, 0)); same((cos(pi/2), sin(pi/2)), (0, 1))
same((3*cos(t))**2/9 + (2*sin(t))**2/4, 1); same((3*cos(0), 2*sin(0)), (3, 0)); same((3*cos(pi/2), 2*sin(pi/2)), (0, 2))
ap_, bp_, rp_ = symbols('a b r', positive=True)
same((ap_*cos(t))**2/ap_**2 + (bp_*sin(t))**2/bp_**2, 1); same((rp_*cos(t))**2 + (rp_*sin(t))**2, rp_**2)
same(cos(2*t)**2 + sin(2*t)**2, 1); same((cos(2*2*pi), sin(2*2*pi)), (1, 0)); same((cos(2*pi/2), sin(2*pi/2)), (-1, 0))
same(sin(t)**2 + cos(t)**2, 1); same((sin(0), cos(0)), (0, 1)); same((sin(pi/2), cos(pi/2)), (1, 0)); same((sin(pi), cos(pi)), (0, -1))
```
:::

::: pitfall
Do not confuse the curve with the graphs of $x(t)$ and $y(t)$ (Figure 16.1, right). Those graphs have $t$ on the horizontal axis; the curve lives in the $xy$-plane, where $t$ is not a coordinate but a label on its points.
:::

### Eliminating the parameter {#eliminating}

To recognise a parametric curve, look for an equation in $x$ and $y$ alone that its points satisfy. That is **eliminating the parameter**: solve one equation for $t$ and substitute into the other, or combine the two so that $t$ disappears, as $\cos^2 t + \sin^2 t = 1$ did in Example 16.1.

::: example Eliminating the parameter
Eliminate the parameter, and describe each curve, for all real $t$: (a) $x = 1 + 2t$, $y = 3 - t$; (b) $x = t^2$, $y = t^3 - 3t$; (c) $x = e^t$, $y = e^{2t}$.

**(a)** Solve the first equation for $t$: $t = (x - 1)/2$. Substitute into the second:

$$y = 3 - \frac{x - 1}{2} = \frac{7 - x}{2}.$$

The curve is the line of slope $-\tfrac12$ through $(1, 3)$, the point at $t = 0$. As $t$ runs through $\R$, so does $x = 1 + 2t$, so the whole line is traced, from left to right.

**(b)** Solving $x = t^2$ for $t$ gives two answers, $t = \pm\sqrt{x}$. Instead, square $y$:

$$y^2 = t^2\big(t^2 - 3\big)^2 = x(x - 3)^2.$$

Conversely, every point with $y^2 = x(x - 3)^2$ is on the curve: such a point has $x \ge 0$ (for $x < 0$ the right side is negative), and its two possible values $y = \pm\sqrt{x}\,(x - 3)$ come from $t = \sqrt x$ and $t = -\sqrt x$. So the curve is exactly $y^2 = x(x - 3)^2$; Figure 16.1 shows its part with $-2 \le t \le 2$.

**(c)** $y = e^{2t} = \big(e^t\big)^2 = x^2$. But $x = e^t$ is always positive, and takes every positive value. So the curve is only the right half of the parabola $y = x^2$, the part with $x > 0$: the origin and the left half are never reached.

```check
same(solve(Eq(x, 1 + 2*t), t), [(x - 1)/2]); same((3 - t).subs(t, (x - 1)/2), (7 - x)/2); same(((7 - x)/2).subs(x, 1), 3)
steps((t**3 - 3*t)**2, t**2*(t**2 - 3)**2, (t**2)*((t**2) - 3)**2)
xn_ = symbols('x', negative=True); holds(xn_*(xn_ - 3)**2 < 0)
xnn_ = symbols('x', nonnegative=True)
same((t*(t**2 - 3)).subs(t, sqrt(xnn_)), sqrt(xnn_)*(xnn_ - 3)); same((t*(t**2 - 3)).subs(t, -sqrt(xnn_)), -sqrt(xnn_)*(xnn_ - 3))
same((sqrt(xnn_)*(xnn_ - 3))**2, xnn_*(xnn_ - 3)**2)
tr16 = symbols('t', real=True)
same(exp(2*tr16), exp(tr16)**2); same(function_range(exp(x), x, S.Reals), Interval.open(0, oo))
```
:::

::: pitfall
Eliminating the parameter forgets which part of the curve is traced, and how. In Example 16.2(c) the equation $y = x^2$ describes a whole parabola, but the point reaches only its right half. The curve $x = \sin t$, $y = \sin^2 t$ also satisfies $y = x^2$, yet it moves back and forth for ever along the arc from $(-1, 1)$ to $(1, 1)$. After eliminating $t$, always check which values $x$ and $y$ can take.

```check
same(sin(t)**2, (sin(t))**2); same(function_range(sin(x), x, S.Reals), Interval(-1, 1))
same((sin(-pi/2), sin(-pi/2)**2), (-1, 1)); same((sin(pi/2), sin(pi/2)**2), (1, 1))
```
:::

### The cycloid {#cycloid}

A **cycloid** is the curve traced by a point on the rim of a wheel that rolls along a straight line: a reflector on a bicycle wheel, seen from the side. It has no simple equation in $x$ and $y$, but its parametric equations follow from one fact about rolling.

Let a circle of radius $r > 0$ roll to the right along the $x$-axis, without slipping, and let $P$ be the point of the circle that touches the ground at the origin at the start. As the parameter, take the angle $t$ (in radians) through which the circle has turned. Rolling without slipping means that the arc of the circle that has touched the ground is as long as the stretch of ground it touched. An arc of angle $t$ on a circle of radius $r$ has length $rt$, so the circle has rolled the distance $rt$: its centre is at $C = (rt, r)$, above the point of contact $T = (rt, 0)$ (Figure 16.2).

Where is $P$? Seen from $C$, it started straight down, at angle $-\pi/2$, and the circle rolls to the right by turning clockwise, so after turning through $t$ the point $P$ is at angle $-\pi/2 - t$. By the definition of sine and cosine, it is displaced from $C$ by

$$\Big(r\cos\big(-\tfrac{\pi}{2} - t\big),\ r\sin\big(-\tfrac{\pi}{2} - t\big)\Big) = (-r\sin t,\ -r\cos t).$$

For $0 < t < \pi/2$, as in Figure 16.2, that is $r\sin t$ to the left of $C$ and $r\cos t$ below it. Adding $C = (rt, r)$:

$$x = r(t - \sin t), \qquad y = r(1 - \cos t).$$

As $t$ runs from 0 to $2\pi$, $P$ traces one **arch** of the cycloid: up from the origin to its highest point $(\pi r, 2r)$ at $t = \pi$, and down to $(2\pi r, 0)$, where it touches the ground again. The whole cycloid is a row of such arches, each $2\pi r$ wide and $2r$ high.

```check
same(cos(-pi/2 - t), -sin(t)); same(sin(-pi/2 - t), -cos(t))
cyx, cyy = r*(t - sin(t)), r*(1 - cos(t))
same(cyx, r*t - r*sin(t)); same(cyy, r - r*cos(t))
same((cyx.subs(t, 0), cyy.subs(t, 0)), (0, 0)); same((cyx.subs(t, pi), cyy.subs(t, pi)), (pi*r, 2*r))
same((cyx.subs(t, 2*pi), cyy.subs(t, 2*pi)), (2*pi*r, 0))
same(maximum(1 - cos(x), x, Interval(0, 2*pi)), 2); same(solve(1 - cos(x), x), [0, 2*pi])
same(cyx.subs(t, t + 2*pi) - cyx, 2*pi*r); same(cyy.subs(t, t + 2*pi), cyy)
```

::: figure id=fig-16-2
A circle of radius $r$ rolls to the right along the $x$-axis. When it has turned through the angle $t$, it has rolled the distance $rt$ (the green segment, as long as the green arc), so its centre is $C = (rt, r)$, and the point $P$ that started at the origin is $r\sin t$ to the left of $C$ and $r\cos t$ below it. The dashed part of the arch is still to come.
:::

**Lissajous curves.** Let $x$ and $y$ oscillate at different rates: $x = \sin 2t$, $y = \sin 3t$, $0 \le t \le 2\pi$. The point stays in the square $-1 \le x \le 1$, $-1 \le y \le 1$, swinging left and right twice while it swings up and down three times, and returns to its start at $t = 2\pi$. Such a **Lissajous curve** appears on an oscilloscope when two sine waves drive the horizontal and the vertical deflection of its beam, and the ratio of their frequencies can be read off the picture: this curve touches the top and the bottom of the square three times each (at $t = \pi/6, 5\pi/6, 3\pi/2$ and $t = \pi/2, 7\pi/6, 11\pi/6$) and each side twice. Trace it in the widget of Section 16.2.

```check
same_set(solveset(Eq(sin(3*x), 1), x, Interval.Ropen(0, 2*pi)), [pi/6, 5*pi/6, 3*pi/2])
same_set(solveset(Eq(sin(3*x), -1), x, Interval.Ropen(0, 2*pi)), [pi/2, 7*pi/6, 11*pi/6])
same_set(solveset(Eq(sin(2*x), 1), x, Interval.Ropen(0, 2*pi)), [pi/4, 5*pi/4])
same_set(solveset(Eq(sin(2*x), -1), x, Interval.Ropen(0, 2*pi)), [3*pi/4, 7*pi/4])
same((sin(2*(t + 2*pi)), sin(3*(t + 2*pi))), (sin(2*t), sin(3*t)))
```

## Calculus with parametric curves {#parametric-calculus}

### Tangent lines {#tangents}

Near most of its points, a parametric curve is the graph of a function and has a tangent line, whose slope comes from the chain rule. If near some $t$ the curve $x = f(t)$, $y = g(t)$ is the graph of a differentiable function $y = F(x)$, then $g(t) = F\big(f(t)\big)$, and the chain rule ([Section 5.5](module_05_EN.html#chain)) gives $g'(t) = F'\big(f(t)\big)\,f'(t)$, that is,

$$\frac{dy}{dt} = \frac{dy}{dx}\cdot\frac{dx}{dt},$$

and where $dx/dt \ne 0$ you can divide by it. The theorem says when the assumption holds.

::: theorem The slope of a parametric curve
Let $f$ and $g$ be differentiable on an open interval $I$, with $f'$ continuous on $I$, and let $t_0$ be a point of $I$ with $f'(t_0) \ne 0$. Then there is an open interval $J$ around $t_0$ on which $f$ is one-to-one; the part of the curve $x = f(t)$, $y = g(t)$ with $t$ in $J$ is the graph of a function $y = F(x)$; and $F$ is differentiable at $x_0 = f(t_0)$, with

$$F'(x_0) = \frac{g'(t_0)}{f'(t_0)}, \quad\text{that is,}\quad \frac{dy}{dx} = \frac{dy/dt}{dx/dt}.$$
:::

::: proof
As $t \to t_0$, $f'(t) \to f'(t_0)$, because $f'$ is continuous; since $f'(t_0) \ne 0$, $f'(t)$ has the sign of $f'(t_0)$ for all $t$ in some open interval $J$ around $t_0$. A function whose derivative is positive on an interval is strictly increasing there, and one whose derivative is negative is strictly decreasing (Module 8, a consequence of the Mean Value Theorem). Either way $f$ is one-to-one on $J$, and continuous, being differentiable. So each value $x = f(t)$ with $t$ in $J$ comes from exactly one $t = f^{-1}(x)$, and the part of the curve with $t$ in $J$ is the graph of $F(x) = g\big(f^{-1}(x)\big)$. By the theorem on the derivative of an inverse function ([Section 6.2](module_06_EN.html#inverse-functions)), $f^{-1}$ is differentiable at $x_0$, with derivative $1/f'(t_0)$. By the chain rule, $F$ is differentiable at $x_0$ and

$$F'(x_0) = g'\big(f^{-1}(x_0)\big)\,\big(f^{-1}\big)'(x_0) = \frac{g'(t_0)}{f'(t_0)}.$$
:::

```check
fP, gP, FP = Function('f'), Function('g'), Function('F')
same(diff(FP(fP(t)), t), Subs(Derivative(FP(u), u), u, fP(t))*Derivative(fP(t), t))   # the chain rule step
import mpmath
mpmath.mp.dps = 30
finv16 = lambda X: mpmath.findroot(lambda T: T**3 + T - X, 1)   # a test case: x = t^3 + t, y = sin t, t0 = 1, x0 = 2
near(mpmath.diff(lambda X: mpmath.sin(finv16(X)), 2), cos(1)/(3*1**2 + 1), 1e-20)
```

The continuity of $f'$ is what makes $f$ one-to-one near $t_0$. The Leibniz form is easy to remember, as if $dt$ cancelled. Two special cases matter most.

::: keyidea
On the curve $x = f(t)$, $y = g(t)$, with $f'$ and $g'$ continuous near the parameter value in question:

- where $\dfrac{dy}{dt} = 0$ and $\dfrac{dx}{dt} \ne 0$, the tangent line is **horizontal**;
- where $\dfrac{dx}{dt} = 0$ and $\dfrac{dy}{dt} \ne 0$, the tangent line is **vertical** (Theorem 16.1 with the roles of $x$ and $y$ swapped: near such a point the curve is a graph $x = G(y)$ with $dx/dy = 0$);
- where both are 0, the formula says nothing: look more closely.
:::

::: example Tangents of a self-crossing curve
For the curve $x = t^2$, $y = t^3 - 3t$ of Figure 16.1, find $dy/dx$, the points where the tangent line is horizontal or vertical, and the tangent lines at $(3, 0)$.

Here $\dfrac{dx}{dt} = 2t$ and $\dfrac{dy}{dt} = 3t^2 - 3 = 3(t - 1)(t + 1)$. For $t \ne 0$,

$$\frac{dy}{dx} = \frac{3t^2 - 3}{2t}.$$

**Horizontal:** $dy/dt = 0$ at $t = \pm1$, where $dx/dt = \pm2 \ne 0$. The tangent line is horizontal at $(1, -2)$ ($t = 1$) and at $(1, 2)$ ($t = -1$), where $y(t)$ turns.

**Vertical:** $dx/dt = 0$ only at $t = 0$, where $dy/dt = -3 \ne 0$. The tangent line is vertical at the origin, where $x(t)$ turns.

**At $(3, 0)$:** the point is reached twice, at $t = \sqrt3$ and at $t = -\sqrt3$. At $t = \sqrt3$ the slope is $\dfrac{9 - 3}{2\sqrt3} = \dfrac{3}{\sqrt3} = \sqrt3$; at $t = -\sqrt3$ it is $\dfrac{6}{-2\sqrt3} = -\sqrt3$. So the curve has two tangent lines there, one for each pass:

$$y = \sqrt3\,(x - 3) \quad\text{and}\quad y = -\sqrt3\,(x - 3).$$

The slope is a function of $t$, not of the point: to find the slope at a point, first find the values of $t$ that give it.

```check
xe3, ye3 = t**2, t**3 - 3*t
same(diff(xe3, t), 2*t); steps(diff(ye3, t), 3*t**2 - 3, 3*(t - 1)*(t + 1))
same(diff(ye3, t)/diff(xe3, t), (3*t**2 - 3)/(2*t))
same_set(solve(diff(ye3, t), t), [1, -1]); same([diff(xe3, t).subs(t, v) for v in (1, -1)], [2, -2])
same([(xe3.subs(t, v), ye3.subs(t, v)) for v in (1, -1)], [(1, -2), (1, 2)])
same(solve(diff(xe3, t), t), [0]); same(diff(ye3, t).subs(t, 0), -3); same((xe3.subs(t, 0), ye3.subs(t, 0)), (0, 0))
sl3 = (3*t**2 - 3)/(2*t)
steps(sl3.subs(t, sqrt(3)), (9 - 3)/(2*sqrt(3)), 3/sqrt(3), sqrt(3)); steps(sl3.subs(t, -sqrt(3)), 6/(-2*sqrt(3)), -sqrt(3))
same((sqrt(3)*(x - 3)).subs(x, 3), 0)
```
:::

::: example The slope of the cycloid
Find the slope of the cycloid $x = r(t - \sin t)$, $y = r(1 - \cos t)$, and describe the curve where it touches the ground.

$\dfrac{dx}{dt} = r(1 - \cos t)$ and $\dfrac{dy}{dt} = r\sin t$. The first is 0 exactly when $\cos t = 1$, at $t = 0, \pm2\pi, \pm4\pi, \dots$: where $P$ touches the ground. Elsewhere

$$\frac{dy}{dx} = \frac{r\sin t}{r(1 - \cos t)} = \frac{\sin t}{1 - \cos t}.$$

This simplifies. The addition formulas of [Section 1.4](module_01_EN.html#trig), with both angles equal to $t/2$, give the **double-angle formulas**

$$\begin{aligned} \sin t &= 2\sin\tfrac{t}{2}\cos\tfrac{t}{2}, \\ \cos t &= \cos^2\tfrac{t}{2} - \sin^2\tfrac{t}{2} = 1 - 2\sin^2\tfrac{t}{2}, \end{aligned}$$

the last step by $\cos^2 + \sin^2 = 1$. So $1 - \cos t = 2\sin^2\tfrac{t}{2}$, and

$$\frac{dy}{dx} = \frac{2\sin\frac{t}{2}\cos\frac{t}{2}}{2\sin^2\frac{t}{2}} = \frac{\cos\frac{t}{2}}{\sin\frac{t}{2}} = \cot\frac{t}{2}.$$

At $t = \pi$, the top of the arch, the slope is $\cot\tfrac{\pi}{2} = 0$. As $t \to 0^+$, $\cos\tfrac{t}{2} \to 1$ and $\sin\tfrac{t}{2} \to 0^+$, so the slope tends to $+\infty$; as $t \to 2\pi^-$ it tends to $-\infty$. So each arch leaves the ground vertically and comes back down vertically, and neighbouring arches meet in a sharp point, a **cusp**. There both $dx/dt$ and $dy/dt$ are 0: $P$ is momentarily at rest, as the point of a rolling wheel that touches the ground always is.

```check
same(diff(r*(t - sin(t)), t), r*(1 - cos(t))); same(diff(r*(1 - cos(t)), t), r*sin(t))
same_set(solveset(1 - cos(x), x, Interval(-4*pi, 4*pi)), [-4*pi, -2*pi, 0, 2*pi, 4*pi])
same(expand_trig(sin(2*u)), 2*sin(u)*cos(u)); same(expand_trig(cos(2*u)), cos(u)**2 - sin(u)**2); same(cos(u)**2 - sin(u)**2, 1 - 2*sin(u)**2)
same(1 - cos(t), 2*sin(t/2)**2)
steps(r*sin(t)/(r*(1 - cos(t))), sin(t)/(1 - cos(t)), 2*sin(t/2)*cos(t/2)/(2*sin(t/2)**2), cos(t/2)/sin(t/2), cot(t/2))
same(cot(pi/2), 0); limit_is(cot(t/2), t, 0, oo, '+'); limit_is(cot(t/2), t, 2*pi, -oo, '-')
same((r*(1 - cos(t))).subs(t, 0), 0); same((r*sin(t)).subs(t, 0), 0); same((r*sin(t)).subs(t, 2*pi), 0)
```
:::

::: pitfall
The slope is $\dfrac{dy/dt}{dx/dt}$, not $\dfrac{dx/dt}{dy/dt}$: the second is $dx/dy$, the slope with the axes swapped. And where $dx/dt$ and $dy/dt$ are both 0, no conclusion follows. The curve $x = t^3$, $y = t^2$ has a cusp at the origin (it is $y = x^{2/3}$), while $x = t^3$, $y = t^3$ is the smooth line $y = x$, traced with a pause at the origin; both have $dx/dt = dy/dt = 0$ at $t = 0$.

```check
same(diff(t**3, t).subs(t, 0), 0); same(diff(t**2, t).subs(t, 0), 0)
tp16 = symbols('t', positive=True); same(real_root(tp16**3, 3)**2, tp16**2); limit_is(diff(t**2, t)/diff(t**3, t), t, 0, oo, '+')
same(diff(t**3, t)/diff(t**3, t), 1)                     # x = t^3, y = t^3: slope 1 wherever t != 0
```
:::

**Velocity.** If $t$ is time, draw an arrow from the point $(x, y)$ with horizontal part $dx/dt$ and vertical part $dy/dt$, the rates at which the point moves across and up. When $dx/dt \ne 0$, its slope is $\dfrac{dy/dt}{dx/dt} = \dfrac{dy}{dx}$; when $dx/dt = 0$ and $dy/dt \ne 0$, the arrow is vertical. In either case it lies along the tangent line, pointing the way the curve is traced. Its length $\sqrt{(dx/dt)^2 + (dy/dt)^2}$ is the **speed** of the point (integrating it gives the distance travelled, as the next subsection shows). If both derivatives are 0, the speed is 0 and the arrow has no direction. Section 16.4 calls such an arrow a vector, and Section 16.8 calls this one the **velocity**.

::: widget name=parametric-curve
Choose a curve and press **Play**, or move the slider. The blue curve is traced up to the current value of the parameter, and the orange arrow is the velocity $\langle x', y'\rangle$, drawn to the scale stated under the plot; the readout gives its components and speed, rounded where needed. With the circle, check Example 16.1(a) at $t = \pi/2$: where is the point, and which way does the arrow point? With the cycloid, watch the arrow shrink to nothing as $P$ reaches the ground (Example 16.4). For the polar curves of Section 16.3 the parameter is the angle $\theta$, and a dashed ray shows the direction $\theta$: with the rose $r = \cos 3\theta$, watch where the point is when $r < 0$.
:::

### Arc length {#arc-length}

Module 12 defined the length of the graph of a function as the limit of the lengths of inscribed polygons, and found the formula $L = \int_a^b \sqrt{1 + f'(x)^2}\,dx$. The same polygons measure a parametric curve. Cut $[a, b]$ into $n$ equal pieces, at $a = t_0 < t_1 < \dots < t_n = b$, with $\Delta t = (b - a)/n$, and join the points $P_i = \big(f(t_i), g(t_i)\big)$ in order. With $\Delta x_i = f(t_i) - f(t_{i-1})$ and $\Delta y_i = g(t_i) - g(t_{i-1})$, the chord from $P_{i-1}$ to $P_i$ has length

$$\sqrt{(\Delta x_i)^2 + (\Delta y_i)^2} = \sqrt{\Big(\frac{\Delta x_i}{\Delta t}\Big)^2 + \Big(\frac{\Delta y_i}{\Delta t}\Big)^2}\;\Delta t.$$

As $\Delta t \to 0$, the two difference quotients approach $f'(t)$ and $g'(t)$, so the sum of the chords should approach an integral. The **length of the path** traced from $t = a$ to $t = b$ is the limit of the lengths of these polygons as $n \to \infty$, if the limit exists; when the path traces a curve once, it is the length of the curve.

```check
dxq, dyq = symbols('Delta_x Delta_y', real=True)
dtq = symbols('Delta_t', positive=True)
same(sqrt((dxq/dtq)**2 + (dyq/dtq)**2)*dtq, sqrt(dxq**2 + dyq**2))
```

::: theorem Arc length of a parametric curve
If $f'$ and $g'$ are continuous on $[a, b]$, the length of the path $x = f(t)$, $y = g(t)$, $a \le t \le b$, is

$$L = \int_a^b \sqrt{\Big(\frac{dx}{dt}\Big)^2 + \Big(\frac{dy}{dt}\Big)^2}\,dt.$$
:::

**The idea of the proof.** By the Mean Value Theorem (Module 8), $\Delta x_i = f'(t_i^*)\,\Delta t$ and $\Delta y_i = g'(t_i^{**})\,\Delta t$ for some points $t_i^*$ and $t_i^{**}$ in $[t_{i-1}, t_i]$. So the polygon has length

$$\sum_{i=1}^{n} \sqrt{f'(t_i^*)^2 + g'(t_i^{**})^2}\;\Delta t.$$

If $t_i^{**}$ were $t_i^*$, this would be a Riemann sum of the continuous function $\sqrt{f'(t)^2 + g'(t)^2}$, and it would approach the integral (Module 9), exactly as in Module 12. The two points may differ, but they are at most $\Delta t$ apart, so $g'(t_i^{**})$ is close to $g'(t_i^*)$ when $\Delta t$ is small. The Going deeper box makes "close" precise.

::: deeper Why the polygons approach the integral
Let $P_n$ be the length of the polygon, and $Q_n = \sum \sqrt{f'(t_i^*)^2 + g'(t_i^*)^2}\,\Delta t$, a Riemann sum that tends to $L$ (Module 9). For any numbers $p$, $q$ and $q'$,

$$\Big|\sqrt{p^2 + q^2} - \sqrt{p^2 + q'^2}\Big| \le \abs{q - q'}:$$

the square roots are the distances from the origin to the points $(p, q)$ and $(p, q')$, which are $\abs{q - q'}$ apart, and by the triangle inequality two such distances differ by at most that much. So

$$\abs{P_n - Q_n} \le \sum_{i=1}^{n} \abs{g'(t_i^{**}) - g'(t_i^*)}\,\Delta t.$$

A function continuous on a closed interval is **uniformly continuous** there: for every $\varepsilon > 0$ there is a $\delta > 0$ such that $\abs{g'(s) - g'(s')} < \varepsilon$ whenever $s$ and $s'$ in $[a, b]$ are less than $\delta$ apart. (This theorem, like the integrability of continuous functions in Module 9, needs the completeness of the real numbers; the series uses it without proof.) Once $\Delta t < \delta$, every term of the sum is less than $\varepsilon\,\Delta t$, so $\abs{P_n - Q_n} < \varepsilon(b - a)$. Hence $P_n - Q_n \to 0$, and $P_n \to L$.

```check
for vals in ((1, 2, 5), (-3, 1, -2), (0, 4, 4), (2, -7, 3)):
    holds(Abs(sqrt(vals[0]**2 + vals[1]**2) - sqrt(vals[0]**2 + vals[2]**2)) <= Abs(vals[1] - vals[2]))
```
:::

If $t$ is time, the integrand is the speed, and Theorem 16.2 says that the distance travelled is the integral of the speed: like the car of [Section 1.1](module_01_EN.html#about), whose odometer adds up its speedometer's readings. For the graph of $y = f(x)$, take $x = t$, $y = f(t)$: the integrand becomes $\sqrt{1 + f'(t)^2}$, and Theorem 16.2 gives Module 12's formula.

```check
same(sqrt(diff(t, t)**2 + diff(fP(t), t)**2), sqrt(1 + Derivative(fP(t), t)**2))
```

::: example Two lengths
Let $r > 0$. Find the length of (a) the circle $x = r\cos t$, $y = r\sin t$, $0 \le t \le 2\pi$, and (b) one arch of the cycloid $x = r(t - \sin t)$, $y = r(1 - \cos t)$, $0 \le t \le 2\pi$.

**(a)** $\dfrac{dx}{dt} = -r\sin t$ and $\dfrac{dy}{dt} = r\cos t$, so the integrand is $\sqrt{r^2\sin^2 t + r^2\cos^2 t} = r$, and

$$L = \int_0^{2\pi} r\,dt = 2\pi r,$$

the circumference, as it should be.

**(b)** Square and add the derivatives of Example 16.4, and use $\cos^2 t + \sin^2 t = 1$ and then $1 - \cos t = 2\sin^2\tfrac{t}{2}$:

$$\begin{aligned} \Big(\frac{dx}{dt}\Big)^2 + \Big(\frac{dy}{dt}\Big)^2 &= r^2(1 - \cos t)^2 + r^2\sin^2 t \\ &= r^2\big(1 - 2\cos t + \cos^2 t + \sin^2 t\big) \\ &= r^2(2 - 2\cos t) = 4r^2\sin^2\tfrac{t}{2}. \end{aligned}$$

For $0 \le t \le 2\pi$, the angle $t/2$ lies in $[0, \pi]$, where $\sin\tfrac{t}{2} \ge 0$; so the square root is $2r\sin\tfrac{t}{2}$. Substitute $u = t/2$, $du = \tfrac12\,dt$ ([Section 10.7](module_10_EN.html#definite-substitution)); the limits $t = 0$ and $t = 2\pi$ become $u = 0$ and $u = \pi$:

$$\begin{aligned} L &= \int_0^{2\pi} 2r\sin\tfrac{t}{2}\,dt = 4r\int_0^{\pi} \sin u\,du \\ &= 4r\big[-\cos u\big]_0^{\pi} = 4r(1 + 1) = 8r. \end{aligned}$$

One arch of a cycloid is exactly $8r$ long, four times the diameter of the wheel, although its base is only $2\pi r \approx 6.28r$. In one turn of a bicycle wheel, the reflector travels $8/(2\pi) \approx 1.273$ times as far as the bicycle: about 27% further.

```check
same(sqrt(diff(rp_*cos(t), t)**2 + diff(rp_*sin(t), t)**2), rp_); same(integrate(r, (t, 0, 2*pi)), 2*pi*r)
cxs = diff(r*(t - sin(t)), t)**2 + diff(r*(1 - cos(t)), t)**2
steps(cxs, r**2*(1 - cos(t))**2 + r**2*sin(t)**2, r**2*(1 - 2*cos(t) + cos(t)**2 + sin(t)**2), r**2*(2 - 2*cos(t)), 4*r**2*sin(t/2)**2)
holds(minimum(sin(x/2), x, Interval(0, 2*pi)) >= 0)
xr16 = symbols('x', real=True); same(sqrt(4*rp_**2*sin(xr16/2)**2), 2*rp_*Abs(sin(xr16/2)))
steps(Integral(2*r*sin(t/2), (t, 0, 2*pi)), 4*r*Integral(sin(u), (u, 0, pi)), 4*r*(-cos(pi) + cos(0)), 4*r*(1 + 1), 8*r)
rounds(2*pi, '6.28'); rounds(8/(2*pi), '1.273'); rounds(100*(8/(2*pi) - 1), '27')
```
:::

::: pitfall
$\sqrt{\sin^2(t/2)}$ is $\abs{\sin(t/2)}$, not $\sin(t/2)$. Over two arches, $0 \le t \le 4\pi$, $\sin\tfrac{t}{2}$ is negative for $2\pi < t < 4\pi$, and $\int_0^{4\pi} 2r\sin\tfrac{t}{2}\,dt = 0$: nonsense for a length. Split the interval where the sign changes, or use symmetry: two arches are $16r$ long. In the same way, a path that retraces itself is measured with each pass: $x = \cos 2t$, $y = \sin 2t$, $0 \le t \le 2\pi$, has speed 2 and gives $\int_0^{2\pi} 2\,dt = 4\pi$, the distance travelled twice round the unit circle, not the circle's length.

```check
same(integrate(2*r*sin(t/2), (t, 0, 4*pi)), 0); holds(sin(Rational(5, 2)*pi/2) < 0)
same(integrate(2*r*sin(t/2), (t, 0, 2*pi)) + integrate(-2*r*sin(t/2), (t, 2*pi, 4*pi)), 16*r)
same(sqrt(diff(cos(2*t), t)**2 + diff(sin(2*t), t)**2), 2); same(integrate(2, (t, 0, 2*pi)), 4*pi)
```
:::

## Polar coordinates {#polar}

A radar station does not report an aircraft as "40 km east and 30 km north". It reports a distance, 50 km, and a direction. Describing points by a distance and an angle gives **polar coordinates**, in which circles centred at the origin, spirals and flower-like curves have short equations.

```check
same(sqrt(40**2 + 30**2), 50)
```

::: definition Polar coordinates
Fix the origin $O$, called the **pole**, and the positive $x$-axis, called the **polar axis**. A point $P$ has **polar coordinates** $(r, \theta)$ if

$$x = r\cos\theta, \qquad y = r\sin\theta.$$

For $r > 0$, $r$ is the distance from $O$ to $P$, and $\theta$ is an angle (in radians) from the polar axis to the ray from $O$ through $P$, measured anticlockwise. For $r < 0$, the point $(r, \theta)$ lies on the opposite ray, at distance $\abs{r}$ from $O$. The pole is $(0, \theta)$ for every $\theta$.
:::

Figure 16.3 (top left) shows a point with its polar coordinates. Unlike Cartesian coordinates, polar coordinates are not unique: $(r, \theta)$, $(r, \theta + 2\pi)$ and $(-r, \theta + \pi)$ are the same point, because sine and cosine have period $2\pi$, while $\cos(\theta + \pi) = -\cos\theta$ and $\sin(\theta + \pi) = -\sin\theta$. To go back, square and add, and divide:

$$r^2 = x^2 + y^2, \qquad \tan\theta = \frac{y}{x} \quad (x \ne 0).$$

```check
same((r*cos(theta + 2*pi), r*sin(theta + 2*pi)), (r*cos(theta), r*sin(theta)))
same((-r*cos(theta + pi), -r*sin(theta + pi)), (r*cos(theta), r*sin(theta)))
same((r*cos(theta))**2 + (r*sin(theta))**2, r**2); same((r*sin(theta))/(r*cos(theta)), tan(theta))
```

::: example Converting coordinates
(a) Find the Cartesian coordinates of the points with polar coordinates $(4, 5\pi/6)$ and $(-2, \pi/4)$. (b) Find polar coordinates, with $r > 0$ and $0 \le \theta < 2\pi$, of the points $(-1, \sqrt3)$ and $(-3, -3)$.

**(a)** For $(4, 5\pi/6)$: $x = 4\cos\tfrac{5\pi}{6} = 4\big(-\tfrac{\sqrt3}{2}\big) = -2\sqrt3$ and $y = 4\sin\tfrac{5\pi}{6} = 4\cdot\tfrac12 = 2$, so the point is $\big(-2\sqrt3, 2\big)$. For $(-2, \pi/4)$: $x = -2\cos\tfrac{\pi}{4} = -\sqrt2$ and $y = -2\sin\tfrac{\pi}{4} = -\sqrt2$. The point $\big(-\sqrt2, -\sqrt2\big)$ is in the third quadrant, opposite to the direction $\pi/4$, as a negative $r$ requires.

**(b)** For $(-1, \sqrt3)$: $r = \sqrt{1 + 3} = 2$, and $\theta$ must satisfy $\cos\theta = x/r = -\tfrac12$ and $\sin\theta = y/r = \tfrac{\sqrt3}{2}$, so $\theta = \tfrac{2\pi}{3}$ (Example 1.8). For $(-3, -3)$: $r = \sqrt{18} = 3\sqrt2$, and $\cos\theta = \sin\theta = -\tfrac{1}{\sqrt2}$, so $\theta = \tfrac{5\pi}{4}$.

```check
same((4*cos(5*pi/6), 4*sin(5*pi/6)), (-2*sqrt(3), 2)); same((-2*cos(pi/4), -2*sin(pi/4)), (-sqrt(2), -sqrt(2)))
same(sqrt(1 + 3), 2); same((cos(2*pi/3), sin(2*pi/3)), (-Rational(1, 2), sqrt(3)/2)); same((2*cos(2*pi/3), 2*sin(2*pi/3)), (-1, sqrt(3)))
same(sqrt(18), 3*sqrt(2)); same((cos(5*pi/4), sin(5*pi/4)), (-1/sqrt(2), -1/sqrt(2))); same((3*sqrt(2)*cos(5*pi/4), 3*sqrt(2)*sin(5*pi/4)), (-3, -3))
```
:::

::: pitfall
When choosing $r > 0$, $\theta = \arctan(y/x)$ is right only when $x > 0$: the arctangent gives angles between $-\pi/2$ and $\pi/2$, which point into the right half of the plane. For $(-3, -3)$, $\arctan\dfrac{-3}{-3} = \arctan 1 = \dfrac{\pi}{4}$ points into the first quadrant, exactly the wrong way; the right angle is $\dfrac{\pi}{4} + \pi = \dfrac{5\pi}{4}$. Decide the quadrant from the signs of $x$ and $y$ first. (Python's `math.atan2(y, x)` does this, and returns an angle in $[-\pi, \pi]$.)

```check
same(atan(Rational(-3, -3)), pi/4); same(pi/4 + pi, 5*pi/4); same(atan2(-3, -3), -3*pi/4); same(-3*pi/4 + 2*pi, 5*pi/4)
import math
same(math.atan2(0.0, -1.0), math.pi); same(math.atan2(-0.0, -1.0), -math.pi)   # both endpoint signs occur
```
:::

### Polar curves {#polar-curves}

The graph of a polar equation $r = f(\theta)$ is the set of points with polar coordinates $\big(f(\theta), \theta\big)$. It is a parametric curve with the angle as the parameter:

$$x = f(\theta)\cos\theta, \qquad y = f(\theta)\sin\theta.$$

The simplest are $r = a$, for a constant $a > 0$, the circle of radius $a$ centred at the pole, and $\theta = \alpha$, the line through the pole at angle $\alpha$ (with negative $r$ included, the whole line). Others need a calculation. Multiplying $r = 2\sin\theta$ by $r$ gives $r^2 = 2r\sin\theta$, that is, $x^2 + y^2 = 2y$; completing the square, $x^2 + (y - 1)^2 = 1$. So $r = 2\sin\theta$ is the circle of radius 1 centred at $(0, 1)$, traced once as $\theta$ runs from 0 to $\pi$ (Figure 16.3, top right). For $\pi \le \theta \le 2\pi$, $r = 2\sin\theta \le 0$, and the point goes round the same circle again.

```check
same(expand((2*sin(theta))**2 - 2*(2*sin(theta))*sin(theta)), 0)
same(expand(x**2 + (y - 1)**2 - 1), x**2 + y**2 - 2*y)
X_, Y_ = 2*sin(theta)*cos(theta), 2*sin(theta)*sin(theta)
same(X_**2 + (Y_ - 1)**2, 1); same((X_.subs(theta, 0), Y_.subs(theta, 0)), (0, 0)); same((X_.subs(theta, pi/2), Y_.subs(theta, pi/2)), (0, 2))
same((X_.subs(theta, theta + pi), Y_.subs(theta, theta + pi)), (X_, Y_))
```

A table shows how a less familiar curve, the **cardioid** $r = 1 + \cos\theta$ (Greek for "heart-shaped"), is traced:

```valuetable
theta = 0, pi/6, pi/3, pi/2, 2*pi/3, 5*pi/6, pi
$r = 1 + \cos\theta$ = 1 + cos(theta)
$x = r\cos\theta$ = (1 + cos(theta))*cos(theta)
$y = r\sin\theta$ = (1 + cos(theta))*sin(theta)
digits = 4
---
\theta | r = 1 + \cos\theta | x = r\cos\theta | y = r\sin\theta
0 | 2 | 2 | 0
\frac{\pi}{6} | 1.866 | 1.616 | 0.9330
\frac{\pi}{3} | 1.5 | 0.75 | 1.299
\frac{\pi}{2} | 1 | 0 | 1
\frac{2 \pi}{3} | 0.5 | -0.25 | 0.4330
\frac{5 \pi}{6} | 0.1340 | -0.1160 | 0.06699
\pi | 0 | 0 | 0
```

As $\theta$ increases from 0 to $\pi$, $r$ shrinks from 2 to 0: the point starts at $(2, 0)$, swings round through the upper half-plane and arrives at the pole. Since $\cos(-\theta) = \cos\theta$, the lower half is the mirror image of the upper half in the $x$-axis, traced as $\theta$ runs on from $\pi$ to $2\pi$ (Figure 16.3, bottom left).

::: figure id=fig-16-3
Polar coordinates and polar curves, on a grey polar grid. Top left: the point $(r, \theta) = (2, \pi/3)$ is $(r\cos\theta, r\sin\theta) = \big(1, \sqrt3\big)$. Top middle: a region bounded by a polar curve and two rays, sliced by rays from the pole; the shaded slice is nearly a sector of area $\tfrac12 r^2\,\Delta\theta$ (Theorem 16.3). Top right: the circle $r = 2\sin\theta$. Bottom: the cardioid $r = 1 + \cos\theta$ (area $3\pi/2$), the rose $r = \cos 3\theta$ with one petal (area $\pi/12$) shaded, and the spiral $r = \theta/2$ for $0 \le \theta \le 4\pi$.
:::

```check
same((2*cos(pi/3), 2*sin(pi/3)), (1, sqrt(3)))
```

Two more families. The **rose** $r = \cos 3\theta$ (Figure 16.3, bottom middle) has three petals. For $-\pi/6 \le \theta \le \pi/6$, $r \ge 0$, and the point draws the petal along the polar axis. For $\pi/6 \le \theta \le \pi/2$, $r \le 0$, so the point lies on the ray opposite to $\theta$ and draws the petal pointing in the direction $4\pi/3$ (its tip, $r = -1$, comes at $\theta = \pi/3$); the third petal points in the direction $2\pi/3$. After $\theta = \pi$ the curve repeats, because $\cos\big(3(\theta + \pi)\big) = -\cos 3\theta$ and $(-r, \theta + \pi)$ is the same point as $(r, \theta)$. In general, for a positive integer $n$, $r = \cos n\theta$ has $n$ petals when $n$ is odd and $2n$ when $n$ is even.

```check
same(cos(3*(theta + pi)), -cos(3*theta)); same(cos(3*0), 1); same(cos(3*pi/3), -1); same(cos(3*2*pi/3), 1)
same(solveset(cos(3*x), x, Interval(-pi/2, pi/2)), FiniteSet(-pi/2, -pi/6, pi/6, pi/2))
holds(pi/6 < 1); holds(1 < pi/2); holds(cos(3*1) < 0)                # theta = 1 lies in (pi/6, pi/2): r < 0
same((-1*cos(pi/3), -1*sin(pi/3)), (cos(4*pi/3), sin(4*pi/3)))
same(cos(2*(theta + pi)), cos(2*theta)); same(cos(5*(theta + pi)), -cos(5*theta))
```

The spiral $r = \theta/2$, $\theta \ge 0$ (Figure 16.3, bottom right), is an **Archimedean spiral**: each full turn adds $2\pi$ to $\theta$ and $\pi$ to $r$, so successive turns are the same distance $\pi$ apart, like the layers of a rolled carpet seen from the end.

```check
same((theta + 2*pi)/2 - theta/2, pi)
```

### Slopes of polar curves {#polar-slopes}

For $f$ with a continuous derivative, the polar curve $r = f(\theta)$ is the parametric curve $x = f(\theta)\cos\theta$, $y = f(\theta)\sin\theta$, so Theorem 16.1 gives its slopes. By the product rule,

$$\begin{aligned} \frac{dx}{d\theta} &= f'(\theta)\cos\theta - f(\theta)\sin\theta, \\ \frac{dy}{d\theta} &= f'(\theta)\sin\theta + f(\theta)\cos\theta, \end{aligned}$$

and, where $dx/d\theta \ne 0$,

$$\frac{dy}{dx} = \frac{f'(\theta)\sin\theta + f(\theta)\cos\theta}{f'(\theta)\cos\theta - f(\theta)\sin\theta}.$$

At the pole the formula is especially simple. If $f(\theta_0) = 0$ and $f'(\theta_0) \ne 0$, the terms with $f(\theta_0)$ drop out and the slope is $\tan\theta_0$ (when $\cos\theta_0 \ne 0$; if $\cos\theta_0 = 0$ the tangent line is vertical): the curve passes through the pole along the line $\theta = \theta_0$. The rose $r = \cos 3\theta$ is 0 at $\theta = \pi/6$, $\pi/2$ and $5\pi/6$, so its petals meet at the pole along the lines at those three angles.

```check
fpo = Function('f')
same(diff(fpo(theta)*cos(theta), theta), Derivative(fpo(theta), theta)*cos(theta) - fpo(theta)*sin(theta))
same(diff(fpo(theta)*sin(theta), theta), Derivative(fpo(theta), theta)*sin(theta) + fpo(theta)*cos(theta))
dpo = symbols('d', nonzero=True)
same(((dpo*sin(theta) + 0*cos(theta))/(dpo*cos(theta) - 0*sin(theta))), tan(theta))
same_set(solveset(cos(3*x), x, Interval.Ropen(0, pi)), [pi/6, pi/2, 5*pi/6])
same([diff(cos(3*theta), theta).subs(theta, v) for v in (pi/6, pi/2, 5*pi/6)], [-3, 3, -3])
```

::: example Tangents to the cardioid
Find the tangent line to the cardioid $r = 1 + \cos\theta$ at the point where $\theta = \pi/2$, and the points where the tangent line is horizontal.

Here $f(\theta) = 1 + \cos\theta$ and $f'(\theta) = -\sin\theta$, so

$$\begin{aligned} \frac{dx}{d\theta} &= -\sin\theta\cos\theta - (1 + \cos\theta)\sin\theta = -\sin\theta\,(1 + 2\cos\theta), \\ \frac{dy}{d\theta} &= -\sin^2\theta + (1 + \cos\theta)\cos\theta \\ &= 2\cos^2\theta + \cos\theta - 1, \end{aligned}$$

where the last step replaced $\sin^2\theta$ by $1 - \cos^2\theta$. The quadratic in $\cos\theta$ factors: $\dfrac{dy}{d\theta} = (2\cos\theta - 1)(\cos\theta + 1)$.

**At $\theta = \pi/2$:** $r = 1$, so the point is $(0, 1)$, and $\dfrac{dx}{d\theta} = -1$, $\dfrac{dy}{d\theta} = -1$. The slope is $\dfrac{-1}{-1} = 1$, and the tangent line is $y = x + 1$.

**Horizontal tangents:** $dy/d\theta = 0$ when $\cos\theta = \tfrac12$, at $\theta = \pi/3$ and $5\pi/3$, or when $\cos\theta = -1$, at $\theta = \pi$. At $\theta = \pi/3$, $r = \tfrac32$ and the point is $\big(\tfrac34, \tfrac{3\sqrt3}{4}\big) \approx (0.75, 1.299)$; there $\dfrac{dx}{d\theta} = -\tfrac{\sqrt3}{2}\cdot 2 = -\sqrt3 \ne 0$, so the tangent line is horizontal: this is the top of the cardioid. By symmetry, $\theta = 5\pi/3$ gives the bottom, $\big(\tfrac34, -\tfrac{3\sqrt3}{4}\big)$. At $\theta = \pi$ the point is the pole, and $dx/d\theta = 0$ as well, so the derivative formula says nothing. Instead, consider a secant from the pole to a nearby point of the curve. Its slope is

$$\frac{y}{x} = \frac{(1 + \cos\theta)\sin\theta}{(1 + \cos\theta)\cos\theta} = \tan\theta \longrightarrow 0 \qquad (\theta \to \pi).$$

Thus the cusp at the pole also has a horizontal tangent, $y = 0$. The three points with horizontal tangent lines are the top, the bottom and the pole.

```check
fc_ = 1 + cos(theta)
dxc = diff(fc_*cos(theta), theta); dyc = diff(fc_*sin(theta), theta)
same(diff(fc_, theta), -sin(theta))
steps(dxc, -sin(theta)*cos(theta) - (1 + cos(theta))*sin(theta), -sin(theta)*(1 + 2*cos(theta)))
steps(dyc, -sin(theta)**2 + (1 + cos(theta))*cos(theta), 2*cos(theta)**2 + cos(theta) - 1, (2*cos(theta) - 1)*(cos(theta) + 1))
same((fc_*cos(theta)).subs(theta, pi/2), 0); same((fc_*sin(theta)).subs(theta, pi/2), 1)
same(dxc.subs(theta, pi/2), -1); same(dyc.subs(theta, pi/2), -1); same(expand(1 + 1*(x - 0)), x + 1)
same_set(solveset(dyc, theta, Interval.Ropen(0, 2*pi)), [pi/3, 5*pi/3, pi])
same(fc_.subs(theta, pi/3), Rational(3, 2)); same(((fc_*cos(theta)).subs(theta, pi/3), (fc_*sin(theta)).subs(theta, pi/3)), (Rational(3, 4), 3*sqrt(3)/4))
rounds(3*sqrt(3)/4, '1.299'); same(dxc.subs(theta, pi/3), -sqrt(3))
same(((fc_*cos(theta)).subs(theta, 5*pi/3), (fc_*sin(theta)).subs(theta, 5*pi/3)), (Rational(3, 4), -3*sqrt(3)/4)); holds(Ne(dxc.subs(theta, 5*pi/3), 0))
same(fc_.subs(theta, pi), 0); same(dxc.subs(theta, pi), 0)
same((fc_*sin(theta))/(fc_*cos(theta)), tan(theta)); limit_is(tan(theta), theta, pi, 0)
limit_is(dyc/dxc, theta, pi, 0)
same(maximum(fc_*sin(theta), theta, Interval(0, pi)), 3*sqrt(3)/4)
```
:::

### Area in polar coordinates {#polar-area}

The natural building block for areas in polar coordinates is not a rectangle but a sector. A sector of a circle of radius $r$ with angle $\Delta\theta$ (in radians) is the fraction $\Delta\theta/(2\pi)$ of the disc, so its area is

$$\frac{\Delta\theta}{2\pi}\cdot\pi r^2 = \frac12 r^2\,\Delta\theta.$$

```check
same(theta/(2*pi)*pi*r**2, r**2*theta/2)
```

::: theorem Area in polar coordinates
Let $f$ be continuous and $f(\theta) \ge 0$ on $[\alpha, \beta]$, where $0 < \beta - \alpha \le 2\pi$. The region bounded by the polar curve $r = f(\theta)$ and the rays $\theta = \alpha$ and $\theta = \beta$ has area

$$A = \int_\alpha^\beta \frac12 f(\theta)^2\,d\theta = \frac12\int_\alpha^\beta r^2\,d\theta.$$
:::

::: proof
Cut $[\alpha, \beta]$ into $n$ pieces of width $\Delta\theta = (\beta - \alpha)/n$; the rays at the cuts slice the region into $n$ thin pieces (Figure 16.3, top middle). The condition $\beta - \alpha \le 2\pi$ makes sure that the pieces do not overlap. On the $i$th piece of $[\alpha, \beta]$, let $m_i$ and $M_i$ be the least and the greatest value of $f$; they exist by the Extreme Value Theorem (Module 3). The $i$th slice contains the sector of radius $m_i$ and lies inside the sector of radius $M_i$, both with angle $\Delta\theta$, so its area is between $\tfrac12 m_i^2\,\Delta\theta$ and $\tfrac12 M_i^2\,\Delta\theta$. Adding over the slices,

$$\sum_{i=1}^{n} \frac12 m_i^2\,\Delta\theta \le A \le \sum_{i=1}^{n} \frac12 M_i^2\,\Delta\theta.$$

Since $f \ge 0$, $\tfrac12 m_i^2$ and $\tfrac12 M_i^2$ are the least and greatest values of $\tfrac12 f^2$ on the $i$th piece, so the two sides are Riemann sums of the continuous function $\tfrac12 f(\theta)^2$, with $n$ equal subintervals. As $n \to \infty$ both approach $\int_\alpha^\beta \tfrac12 f(\theta)^2\,d\theta$ (Module 9), and $A$, caught between them for every $n$, is that integral.
:::

::: example The area of a cardioid and of a petal
Find (a) the area inside the cardioid $r = 1 + \cos\theta$, and (b) the area of one petal of the rose $r = \cos 3\theta$.

Both need the integral of a squared cosine. The addition formula for $\cos(u + u)$ gives $\cos 2u = \cos^2 u - \sin^2 u = 2\cos^2 u - 1$, so

$$\cos^2 u = \frac{1 + \cos 2u}{2}.$$

**(a)** The cardioid is traced once as $\theta$ runs from 0 to $2\pi$, with $r \ge 0$. Expand the square and replace $\cos^2\theta$:

$$\begin{aligned} A &= \frac12\int_0^{2\pi} (1 + \cos\theta)^2\,d\theta = \frac12\int_0^{2\pi} \big(1 + 2\cos\theta + \cos^2\theta\big)\,d\theta \\ &= \frac12\int_0^{2\pi} \Big(\frac32 + 2\cos\theta + \frac12\cos 2\theta\Big)\,d\theta \\ &= \frac12\Big[\frac{3\theta}{2} + 2\sin\theta + \frac14\sin 2\theta\Big]_0^{2\pi} \\ &= \frac12\cdot 3\pi = \frac{3\pi}{2}. \end{aligned}$$

The cardioid encloses $3\pi/2 \approx 4.712$, one and a half times the area of the unit circle.

**(b)** One petal is traced as $\theta$ runs from $-\pi/6$ to $\pi/6$, where $r = \cos 3\theta \ge 0$. With $u = 3\theta$ in the formula for $\cos^2 u$:

$$\begin{aligned} A &= \frac12\int_{-\pi/6}^{\pi/6} \cos^2 3\theta\,d\theta = \frac12\int_{-\pi/6}^{\pi/6} \frac{1 + \cos 6\theta}{2}\,d\theta \\ &= \frac14\Big[\theta + \frac{\sin 6\theta}{6}\Big]_{-\pi/6}^{\pi/6} \\ &= \frac14\cdot\frac{\pi}{3} = \frac{\pi}{12}, \end{aligned}$$

since $\sin 6\theta = \sin(\pm\pi) = 0$ at both limits. One petal has area $\pi/12 \approx 0.2618$, and the three petals together $3\cdot\pi/12 = \pi/4$.

```check
same(expand_trig(cos(2*u)), 2*cos(u)**2 - 1); same(cos(u)**2, (1 + cos(2*u))/2)
steps(Integral((1 + cos(theta))**2/2, (theta, 0, 2*pi)), Integral((1 + 2*cos(theta) + cos(theta)**2)/2, (theta, 0, 2*pi)),
      Integral((Rational(3, 2) + 2*cos(theta) + cos(2*theta)/2)/2, (theta, 0, 2*pi)), Rational(1, 2)*3*pi, 3*pi/2)
antideriv(3*theta/2 + 2*sin(theta) + sin(2*theta)/4, Rational(3, 2) + 2*cos(theta) + cos(2*theta)/2, theta)
same((3*theta/2 + 2*sin(theta) + sin(2*theta)/4).subs(theta, 2*pi) - (3*theta/2 + 2*sin(theta) + sin(2*theta)/4).subs(theta, 0), 3*pi)
rounds(3*pi/2, '4.712'); same((3*pi/2)/(pi*1**2), Rational(3, 2))
holds(minimum(1 + cos(x), x, Interval(0, 2*pi)) >= 0)
holds(minimum(cos(3*x), x, Interval(-pi/6, pi/6)) >= 0)
steps(Integral(cos(3*theta)**2/2, (theta, -pi/6, pi/6)), Integral((1 + cos(6*theta))/4, (theta, -pi/6, pi/6)),
      Rational(1, 4)*((pi/6 + sin(pi)/6) - (-pi/6 + sin(-pi)/6)), Rational(1, 4)*pi/3, pi/12)
antideriv(theta + sin(6*theta)/6, 1 + cos(6*theta), theta)
rounds(pi/12, '0.2618'); same(3*pi/12, pi/4)
```
:::

::: pitfall
Choose limits that trace the region exactly once. $\tfrac12\int_0^{2\pi} \cos^2 3\theta\,d\theta = \pi/2$, twice the area of the rose, because the rose is traced twice as $\theta$ runs from 0 to $2\pi$. For the region between two polar curves, suppose that $f$ and $g$ are continuous, $0 \le g(\theta) \le f(\theta)$ on $[\alpha, \beta]$, and $0 < \beta - \alpha \le 2\pi$. Subtract the inner sectors from the outer ones: the area is $\tfrac12\int_\alpha^\beta \big(f(\theta)^2 - g(\theta)^2\big)\,d\theta$, not $\tfrac12\int_\alpha^\beta \big(f(\theta) - g(\theta)\big)^2\,d\theta$. Negative radii point along the opposite ray, so translate them into nonnegative radii before using this rule.

```check
same(integrate(cos(3*theta)**2/2, (theta, 0, 2*pi)), pi/2); same(pi/2, 2*(pi/4))
fo_, gi_ = 3*cos(theta), 1 + cos(theta)                     # the circle and the cardioid of Exercise 16.7
holds(Ne(integrate((fo_**2 - gi_**2)/2, (theta, -pi/3, pi/3)), integrate((fo_ - gi_)**2/2, (theta, -pi/3, pi/3))))
```
:::

::: compute Curves with SymPy
SymPy finds slopes and the points where they are 0 or undefined. For the curve of Example 16.3:

```python
import sympy as sp
t = sp.symbols('t')
x, y = t**2, t**3 - 3*t
slope = sp.diff(y, t)/sp.diff(x, t)
print(slope)
print(sp.solve(sp.diff(y, t), t), sp.solve(sp.diff(x, t), t))
print([slope.subs(t, v) for v in (sp.sqrt(3), -sp.sqrt(3))])
```

```output
(3*t**2 - 3)/(2*t)
[-1, 1] [0]
[sqrt(3), -sqrt(3)]
```

The first list gives the horizontal tangents ($t = \pm1$), the second the vertical one ($t = 0$), and the last line the two slopes at the crossing point $(3, 0)$. Arc lengths are harder. Asked for the length of a cycloid arch, SymPy simplifies the speed but cannot integrate it:

```python
r = sp.symbols('r', positive=True)
X, Y = r*(t - sp.sin(t)), r*(1 - sp.cos(t))
speed = sp.sqrt(sp.diff(X, t)**2 + sp.diff(Y, t)**2)
print(sp.simplify(speed))
print(sp.integrate(speed, (t, 0, 2*sp.pi)))
```

```output
r*sqrt(2 - 2*cos(t))
r*Integral(sqrt(sin(t)**2 + cos(t)**2 - 2*cos(t) + 1), (t, 0, 2*pi))
```

SymPy returns the integral unevaluated: it did not see that $2 - 2\cos t = 4\sin^2\tfrac{t}{2}$, nor that the square root of that is $2\sin\tfrac{t}{2}$ for $0 \le t \le 2\pi$. Give it the simplified integrand of Example 16.5, and it finds the length. Many lengths have no formula in elementary functions: the perimeter of the ellipse of Example 16.1(b) is an **elliptic integral**, whose integrand has no elementary antiderivative, so it is computed numerically:

```python
print(sp.integrate(2*r*sp.sin(t/2), (t, 0, 2*sp.pi)))
ellipse = sp.Integral(sp.sqrt(9*sp.sin(t)**2 + 4*sp.cos(t)**2), (t, 0, 2*sp.pi))
print(ellipse.evalf(10))
```

```output
8*r
15.86543959
```

Polar areas are ordinary integrals in $\theta$; here are the cardioid and the petal of Example 16.8:

```python
th = sp.symbols('theta')
print(sp.integrate((1 + sp.cos(th))**2/2, (th, 0, 2*sp.pi)))
print(sp.integrate(sp.cos(3*th)**2/2, (th, -sp.pi/6, sp.pi/6)))
```

```output
3*pi/2
pi/12
```
:::

## Vectors {#vectors}

Calculus in several variables needs a language for quantities that have a direction as well as a size: a displacement, a velocity, a force, and in Module 17 the gradient. That language is **vectors**, and it works the same way in the plane and in space. First, space itself.

### Points in space {#space}

To locate a point in space, take three number lines through one point $O$, the origin, each perpendicular to the other two: the $x$-, $y$- and $z$-axes. Think of a corner of a room, with the $x$- and $y$-axes along the edges of the floor and the $z$-axis up the vertical edge. The axes are arranged by the **right-hand rule**: when the fingers of your right hand curl from the positive $x$-axis towards the positive $y$-axis, your thumb points along the positive $z$-axis. A point $P$ has coordinates $(a, b, c)$ if you reach it from $O$ by moving $a$ along the $x$-axis, then $b$ parallel to the $y$-axis, then $c$ parallel to the $z$-axis (Figure 16.4, left). The plane $z = 0$ is the **$xy$-plane** (the floor); $x = 0$ and $y = 0$ are the $yz$- and $xz$-planes.

The distance between $P_1(x_1, y_1, z_1)$ and $P_2(x_2, y_2, z_2)$ is

$$\abs{P_1P_2} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}.$$

This is Pythagoras' theorem twice: the point $Q(x_2, y_2, z_1)$, level with $P_1$ and directly above or below $P_2$, has $\abs{P_1Q}^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2$, and the triangle $P_1QP_2$ has a right angle at $Q$, so $\abs{P_1P_2}^2 = \abs{P_1Q}^2 + (z_2 - z_1)^2$. For example, the distance from $(1, 2, -1)$ to $(3, -1, 5)$ is $\sqrt{4 + 9 + 36} = \sqrt{49} = 7$. The points at distance $R$ from a point $(a, b, c)$ form the **sphere** $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$.

```check
x1_, y1_, z1_, x2_, y2_, z2_ = symbols('x1 y1 z1 x2 y2 z2', real=True)
P1m, Qm, P2m = Matrix([x1_, y1_, z1_]), Matrix([x2_, y2_, z1_]), Matrix([x2_, y2_, z2_])
same((Qm - P1m).dot(P2m - Qm), 0)                                  # the right angle at Q
same((Qm - P1m).dot(Qm - P1m) + (P2m - Qm).dot(P2m - Qm), (x2_ - x1_)**2 + (y2_ - y1_)**2 + (z2_ - z1_)**2)
steps(sqrt((3 - 1)**2 + (-1 - 2)**2 + (5 - (-1))**2), sqrt(4 + 9 + 36), sqrt(49), 7)
```

### Vectors and their components {#components}

::: definition Vector
A **vector** is a quantity with a length and a direction. It is drawn as an arrow; arrows with the same length and the same direction represent the same vector, wherever they start. The vector from $A(x_1, y_1, z_1)$ to $B(x_2, y_2, z_2)$ is

$$\overrightarrow{AB} = \langle x_2 - x_1,\ y_2 - y_1,\ z_2 - z_1\rangle,$$

and these three numbers are its **components**. The **length** (or **magnitude**) of $\vb{a} = \langle a_1, a_2, a_3\rangle$ is

$$\norm{\vb{a}} = \sqrt{a_1^2 + a_2^2 + a_3^2}.$$

Vectors in the plane have two components, $\vb{a} = \langle a_1, a_2\rangle$, and $\norm{\vb{a}} = \sqrt{a_1^2 + a_2^2}$.
:::

Vectors are printed in bold, $\vb{a}$, and handwritten with an arrow, $\vec a$. The angle brackets keep the vector $\langle a_1, a_2, a_3\rangle$ apart from the point $(a_1, a_2, a_3)$; the arrow from $O$ to that point, which represents the vector, is the point's **position vector**. $\norm{\vb{a}}$ reads "the length of a" (also called its norm). By the distance formula, the length of $\overrightarrow{AB}$ is the distance from $A$ to $B$. The **zero vector** $\vb{0} = \langle 0, 0, 0\rangle$ has length 0 and no direction, and ordinary numbers are called **scalars**.

### Adding and scaling {#arithmetic}

Walk along the arrow $\vb{a}$ and then along $\vb{b}$, drawn from where $\vb{a}$ ends: the arrow from your start to your finish is the **sum** $\vb{a} + \vb{b}$ (Figure 16.4, middle). Walking along $\vb{b}$ first and then along $\vb{a}$ gets you to the same place: the two routes are the sides of a parallelogram, and $\vb{a} + \vb{b}$ is its diagonal. A **scalar multiple** $c\,\vb{a}$ is $\vb{a}$ stretched by the factor $\abs{c}$, and reversed if $c < 0$ (Figure 16.4, right). In components, both act one component at a time:

$$\begin{aligned} \vb{a} + \vb{b} &= \langle a_1 + b_1,\ a_2 + b_2,\ a_3 + b_3\rangle, \\ c\,\vb{a} &= \langle c a_1,\ c a_2,\ c a_3\rangle. \end{aligned}$$

The length of $c\,\vb{a}$ is $\sqrt{c^2a_1^2 + c^2a_2^2 + c^2a_3^2} = \abs{c}\,\norm{\vb{a}}$. The **difference** is $\vb{a} - \vb{b} = \vb{a} + (-1)\vb{b}$; when $\vb{a}$ and $\vb{b}$ start at the same point, $\vb{a} - \vb{b}$ is the arrow from the tip of $\vb{b}$ to the tip of $\vb{a}$. Two nonzero vectors are **parallel** if one is a scalar multiple of the other. Because everything works component by component, the rules of ordinary algebra hold, such as $\vb{a} + \vb{b} = \vb{b} + \vb{a}$, $(\vb{a} + \vb{b}) + \vb{c} = \vb{a} + (\vb{b} + \vb{c})$, $c(\vb{a} + \vb{b}) = c\vb{a} + c\vb{b}$ and $(c + d)\vb{a} = c\vb{a} + d\vb{a}$.

```check
A3, B3, C3 = Matrix(symbols('a1:4')), Matrix(symbols('b1:4')), Matrix(symbols('c1:4'))
cs_, ds_ = symbols('c d', real=True)
same(A3 + B3, B3 + A3); same((A3 + B3) + C3, A3 + (B3 + C3)); same(A3 + zeros(3, 1), A3); same(A3 + (-A3), zeros(3, 1))
same(cs_*(A3 + B3), cs_*A3 + cs_*B3); same((cs_ + ds_)*A3, cs_*A3 + ds_*A3); same((cs_*ds_)*A3, cs_*(ds_*A3))
Ar = Matrix(symbols('a1:4', real=True)); same((cs_*Ar).norm(), Abs(cs_)*Ar.norm())
```

::: figure id=fig-16-4
Left: the point $P(2, 4, 3)$, reached from the origin by moving 2 along the $x$-axis, 4 parallel to the $y$-axis and 3 up, with its position vector $\langle 2, 4, 3\rangle$ and the unit vectors $\vb{i}$, $\vb{j}$, $\vb{k}$. Middle: $\vb{a} = \langle 3, 1\rangle$ and $\vb{b} = \langle 1, 2\rangle$ add to $\vb{a} + \vb{b} = \langle 4, 3\rangle$, the diagonal of their parallelogram, whichever is drawn first. Right: multiples of $\vb{v} = \langle 2, 1\rangle$.
:::

```check
same(Matrix([3, 1]) + Matrix([1, 2]), Matrix([4, 3]))
```

A **unit vector** has length 1. The **standard unit vectors**

$$\vb{i} = \langle 1, 0, 0\rangle, \qquad \vb{j} = \langle 0, 1, 0\rangle, \qquad \vb{k} = \langle 0, 0, 1\rangle$$

point along the axes, and every vector is made of them: $\langle a_1, a_2, a_3\rangle = a_1\vb{i} + a_2\vb{j} + a_3\vb{k}$. (In the plane, $\vb{i} = \langle 1, 0\rangle$ and $\vb{j} = \langle 0, 1\rangle$.) For a vector $\vb{a} \ne \vb{0}$, the unit vector in the same direction is

$$\vb{u} = \frac{\vb{a}}{\norm{\vb{a}}},$$

since its length is $\norm{\vb{a}}/\norm{\vb{a}} = 1$. Dividing a vector by its length is called **normalising** it.

```check
iv, jv, kv = Matrix([1, 0, 0]), Matrix([0, 1, 0]), Matrix([0, 0, 1])
a1_, a2_, a3_ = symbols('a1 a2 a3'); same(a1_*iv + a2_*jv + a3_*kv, Matrix([a1_, a2_, a3_]))
same((Ar/Ar.norm()).norm(), 1)
```

::: example Vector arithmetic
Let $\vb{a} = \langle 2, -1, 2\rangle$ and $\vb{b} = \langle 1, 3, 0\rangle$. Find $\vb{a} + \vb{b}$, $2\vb{a} - 3\vb{b}$, $\norm{\vb{a}}$, $\norm{\vb{b}}$, and the unit vector in the direction of $\vb{a}$. Write $\vb{a}$ with $\vb{i}$, $\vb{j}$ and $\vb{k}$.

Work component by component:

$$\begin{aligned} \vb{a} + \vb{b} &= \langle 2 + 1,\ -1 + 3,\ 2 + 0\rangle = \langle 3, 2, 2\rangle, \\ 2\vb{a} - 3\vb{b} &= \langle 4 - 3,\ -2 - 9,\ 4 - 0\rangle = \langle 1, -11, 4\rangle. \end{aligned}$$

The lengths are $\norm{\vb{a}} = \sqrt{4 + 1 + 4} = 3$ and $\norm{\vb{b}} = \sqrt{1 + 9 + 0} = \sqrt{10}$. The unit vector in the direction of $\vb{a}$ is $\tfrac13\vb{a} = \big\langle \tfrac23, -\tfrac13, \tfrac23\big\rangle$; check: $\tfrac49 + \tfrac19 + \tfrac49 = 1$. Finally, $\vb{a} = 2\vb{i} - \vb{j} + 2\vb{k}$.

These two vectors return in Sections 16.5 and 16.6.

```check
av, bv = Matrix([2, -1, 2]), Matrix([1, 3, 0])
same(av + bv, Matrix([3, 2, 2])); same(2*av - 3*bv, Matrix([1, -11, 4]))
same(av.norm(), 3); same(bv.norm(), sqrt(10)); same(av/av.norm(), Matrix([Rational(2, 3), -Rational(1, 3), Rational(2, 3)]))
same(Rational(4, 9) + Rational(1, 9) + Rational(4, 9), 1); same(2*iv - jv + 2*kv, av)
```
:::

In applications, a **displacement** is the vector from where something starts to where it ends; a nonzero **velocity** has the direction of motion and the speed as its length; and a nonzero **force** has the direction of its push or pull and its strength (in newtons, N) as its length. Forces acting on one object add as vectors, and on an object that remains at rest they add to $\vb{0}$. Being momentarily at rest is not enough: a ball at the top of a vertical throw still has gravity acting on it.

::: example Velocities and forces
(a) A boat heads due north across a river at 4 m/s relative to the water, while the current carries the water due east at 3 m/s. Find the boat's velocity relative to the ground, and its speed. (b) A weight of 100 N hangs at rest from two ropes, which make angles of $30^\circ$ and $60^\circ$ with the horizontal, one on each side. Find the tension in each rope. (The numbers in both parts are made up.)

**(a)** Take $x$ east and $y$ north. Relative to the water the boat moves with velocity $\langle 0, 4\rangle$, and the water moves with velocity $\langle 3, 0\rangle$, so relative to the ground the boat moves with

$$\langle 0, 4\rangle + \langle 3, 0\rangle = \langle 3, 4\rangle,$$

at speed $\sqrt{9 + 16} = 5$ m/s, in a direction east of north by the angle $\arctan\tfrac34 \approx 36.87^\circ$.

**(b)** Let the ropes pull with tensions $T_1$ (the $30^\circ$ rope, on the left) and $T_2$ (the $60^\circ$ rope, on the right), as vectors $T_1\langle -\cos 30^\circ, \sin 30^\circ\rangle$ and $T_2\langle \cos 60^\circ, \sin 60^\circ\rangle$. The weight is $\langle 0, -100\rangle$. At rest the three forces add to $\vb{0}$; comparing components,

$$-\frac{\sqrt3}{2}T_1 + \frac12 T_2 = 0, \qquad \frac12 T_1 + \frac{\sqrt3}{2}T_2 - 100 = 0.$$

The first equation gives $T_2 = \sqrt3\,T_1$; then the second becomes $\tfrac12 T_1 + \tfrac32 T_1 = 100$, so $T_1 = 50$ N and $T_2 = 50\sqrt3 \approx 86.60$ N. The steeper rope carries more of the weight. The two tensions add up to more than 100 N, because their horizontal pulls cancel each other and do nothing to hold up the weight.

```check
same(Matrix([0, 4]) + Matrix([3, 0]), Matrix([3, 4])); same(sqrt(9 + 16), 5); rounds(atan(Rational(3, 4))*180/pi, '36.87')
T1_, T2_ = symbols('T1 T2')
c30, s30, c60, s60 = cos(pi/6), sin(pi/6), cos(pi/3), sin(pi/3)
same(T1_*Matrix([-c30, s30]) + T2_*Matrix([c60, s60]) + Matrix([0, -100]), Matrix([-sqrt(3)/2*T1_ + T2_/2, T1_/2 + sqrt(3)/2*T2_ - 100]))
sol_ = solve([-sqrt(3)/2*T1_ + T2_/2, T1_/2 + sqrt(3)/2*T2_ - 100], [T1_, T2_])
same(sol_[T1_], 50); same(sol_[T2_], 50*sqrt(3)); rounds(50*sqrt(3), '86.60')
same(solve(-sqrt(3)/2*T1_ + T2_/2, T2_), [sqrt(3)*T1_]); same(Rational(1, 2) + sqrt(3)/2*sqrt(3), 2); holds(50 + 50*sqrt(3) > 100)
```
:::

::: pitfall
Lengths do not in general add: $\norm{\vb{a} + \vb{b}}$ need not equal $\norm{\vb{a}} + \norm{\vb{b}}$. In Example 16.10(a) the speeds 4 and 3 m/s combine to 5 m/s, not 7. The sides of the triangle in Figure 16.4 (middle) show the **triangle inequality**, $\norm{\vb{a} + \vb{b}} \le \norm{\vb{a}} + \norm{\vb{b}}$, with equality when either vector is zero or when both are nonzero and point the same way (Exercise 16.11 proves it).

```check
same(Matrix([3, 4]).norm(), 5); holds(Matrix([3, 4]).norm() < 3 + 4)
same(Matrix([3, 1]).norm(), sqrt(10)); same(Matrix([1, 2]).norm(), sqrt(5)); holds(Matrix([4, 3]).norm() < sqrt(10) + sqrt(5))
same((av + zeros(3, 1)).norm(), av.norm() + zeros(3, 1).norm())
same((av + 2*av).norm(), av.norm() + (2*av).norm())
```
:::

## The dot product {#dot}

Pull a sled along level ground with a rope at an angle $\theta$ to the ground. Only the part of the pull along the ground, $\norm{\vb{F}}\cos\theta$, moves the sled forward. So physics defines the **work** done by a constant force $\vb{F}$ along a straight displacement $\vb{D}$ as that part of the force times the distance moved:

$$W = \norm{\vb{F}}\,\norm{\vb{D}}\cos\theta.$$

Such products of two lengths and the cosine of the angle between them have a simple formula in components.

::: definition Dot product
The **dot product** of $\vb{a} = \langle a_1, a_2, a_3\rangle$ and $\vb{b} = \langle b_1, b_2, b_3\rangle$ is the number

$$\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2 + a_3b_3,$$

read "a dot b". In the plane, $\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2$.
:::

The dot product of two vectors is a scalar, not a vector; it is also called the **scalar product**. From the definition, for all vectors $\vb{a}$, $\vb{b}$, $\vb{c}$ and scalars $k$:

$$\begin{aligned} \vb{a}\cdot\vb{a} &= \norm{\vb{a}}^2, \qquad \vb{a}\cdot\vb{b} = \vb{b}\cdot\vb{a}, \\ \vb{a}\cdot(\vb{b} + \vb{c}) &= \vb{a}\cdot\vb{b} + \vb{a}\cdot\vb{c}, \\ (k\vb{a})\cdot\vb{b} &= k(\vb{a}\cdot\vb{b}) = \vb{a}\cdot(k\vb{b}). \end{aligned}$$

For example, with $\vb{a} = \langle 2, -1, 2\rangle$ and $\vb{b} = \langle 1, 3, 0\rangle$ from Example 16.9, $\vb{a}\cdot\vb{b} = 2 - 3 + 0 = -1$ and $\vb{a}\cdot\vb{a} = 4 + 1 + 4 = 9 = \norm{\vb{a}}^2$.

```check
same(A3.dot(A3), sum(ai**2 for ai in A3)); same(Ar.dot(Ar), Ar.norm()**2); same(A3.dot(B3), B3.dot(A3))
same(A3.dot(B3 + C3), A3.dot(B3) + A3.dot(C3)); same((k*A3).dot(B3), k*A3.dot(B3)); same(A3.dot(k*B3), k*A3.dot(B3))
same(av.dot(bv), -1); steps(av.dot(bv), 2 - 3 + 0, -1); same(av.dot(av), 9); same(av.norm()**2, 9)
```

::: theorem The dot product and the angle
If $\theta$ is the angle between the nonzero vectors $\vb{a}$ and $\vb{b}$, drawn from the same point ($0 \le \theta \le \pi$), then

$$\vb{a}\cdot\vb{b} = \norm{\vb{a}}\,\norm{\vb{b}}\cos\theta.$$
:::

::: proof
The proof uses the **law of cosines**: in a triangle with sides $p$, $q$ and $s$, where $\gamma$ is the angle between the sides $p$ and $q$,

$$s^2 = p^2 + q^2 - 2pq\cos\gamma.$$

To prove it, put the corner at $\gamma$ at the origin and the side $p$ along the positive $x$-axis, ending at $(p, 0)$. By the definition of sine and cosine the side $q$ ends at $(q\cos\gamma, q\sin\gamma)$, and the distance formula gives

$$\begin{aligned} s^2 &= (q\cos\gamma - p)^2 + q^2\sin^2\gamma \\ &= q^2\big(\cos^2\gamma + \sin^2\gamma\big) - 2pq\cos\gamma + p^2 \\ &= p^2 + q^2 - 2pq\cos\gamma. \end{aligned}$$

If $\vb{a}$ and $\vb{b}$ are not parallel, they are two sides of a triangle whose third side is $\vb{a} - \vb{b}$, from the tip of $\vb{b}$ to the tip of $\vb{a}$, and the angle between $\vb{a}$ and $\vb{b}$ is $\theta$. The law of cosines gives

$$\norm{\vb{a} - \vb{b}}^2 = \norm{\vb{a}}^2 + \norm{\vb{b}}^2 - 2\norm{\vb{a}}\,\norm{\vb{b}}\cos\theta.$$

The rules of the dot product give the same left side another way:

$$\begin{aligned} \norm{\vb{a} - \vb{b}}^2 &= (\vb{a} - \vb{b})\cdot(\vb{a} - \vb{b}) \\ &= \vb{a}\cdot\vb{a} - 2\,\vb{a}\cdot\vb{b} + \vb{b}\cdot\vb{b} \\ &= \norm{\vb{a}}^2 - 2\,\vb{a}\cdot\vb{b} + \norm{\vb{b}}^2. \end{aligned}$$

Comparing the two, $\vb{a}\cdot\vb{b} = \norm{\vb{a}}\,\norm{\vb{b}}\cos\theta$. If $\vb{a}$ and $\vb{b}$ are parallel, $\vb{b} = k\vb{a}$ with $k \ne 0$; then $\vb{a}\cdot\vb{b} = k\norm{\vb{a}}^2$, while $\theta = 0$ (if $k > 0$) or $\pi$ (if $k < 0$), and $\norm{\vb{a}}\,\norm{\vb{b}}\cos\theta = \abs{k}\,\norm{\vb{a}}^2\cdot(\pm1) = k\norm{\vb{a}}^2$ as well.
:::

```check
pp_, qq_, gm_ = symbols('p q gamma', positive=True)
steps((qq_*cos(gm_) - pp_)**2 + qq_**2*sin(gm_)**2, qq_**2*(cos(gm_)**2 + sin(gm_)**2) - 2*pp_*qq_*cos(gm_) + pp_**2, pp_**2 + qq_**2 - 2*pp_*qq_*cos(gm_))
same((A3 - B3).dot(A3 - B3), A3.dot(A3) - 2*A3.dot(B3) + B3.dot(B3))
kp_ = symbols('k', positive=True); kn_ = symbols('k', negative=True)
same(factor((kp_*Ar).norm()), kp_*Ar.norm()); same(factor((kn_*Ar).norm()), -kn_*Ar.norm())
same(Ar.dot(kp_*Ar), Ar.norm()*(kp_*Ar.norm())*cos(0)); same(Ar.dot(kn_*Ar), Ar.norm()*(-kn_*Ar.norm())*cos(pi))
```

So the dot product measures how far two vectors point the same way. Solving for the angle,

$$\cos\theta = \frac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}\,\norm{\vb{b}}}.$$

For nonzero vectors, the sign of $\vb{a}\cdot\vb{b}$ is the sign of $\cos\theta$: positive for $0 \le \theta < \pi/2$, negative for $\pi/2 < \theta \le \pi$, and 0 at a right angle. Two vectors are **orthogonal** (perpendicular) if $\vb{a}\cdot\vb{b} = 0$; the zero vector counts as orthogonal to every vector, although it has no direction or angle. For the vectors of Example 16.9, $\cos\theta = \dfrac{-1}{3\sqrt{10}} \approx -0.1054$, so $\theta \approx 96.05^\circ$, a little more than a right angle.

```check
th9 = acos(av.dot(bv)/(av.norm()*bv.norm()))
same(av.dot(bv)/(av.norm()*bv.norm()), -1/(3*sqrt(10))); rounds(-1/(3*sqrt(10)), '-0.1054'); rounds(th9*180/pi, '96.05')
```

### Angles and orthogonality {#angles}

::: example The angle in a methane molecule
In a molecule of methane, CH₄, the carbon atom sits at the centre of a regular tetrahedron and the four hydrogen atoms at its corners. Put the carbon at the origin and the hydrogens at $(1, 1, 1)$, $(1, -1, -1)$, $(-1, 1, -1)$ and $(-1, -1, 1)$, four corners of a cube, no two of them joined by an edge of the cube. Find the angle between two of the bonds.

The bonds from the carbon to the first two hydrogens are $\vb{a} = \langle 1, 1, 1\rangle$ and $\vb{b} = \langle 1, -1, -1\rangle$. Then $\vb{a}\cdot\vb{b} = 1 - 1 - 1 = -1$ and $\norm{\vb{a}} = \norm{\vb{b}} = \sqrt3$, so

$$\cos\theta = \frac{-1}{\sqrt3\cdot\sqrt3} = -\frac13, \qquad \theta = \arccos\Big(-\frac13\Big) \approx 1.9106 \approx 109.47^\circ.$$

Every pair of the four bond vectors has dot product $-1$, so every angle between two bonds is the same: this is the **tetrahedral angle**, about $109.5^\circ$, the angle between the bonds of a methane molecule.

```check
Hs = [Matrix([1, 1, 1]), Matrix([1, -1, -1]), Matrix([-1, 1, -1]), Matrix([-1, -1, 1])]
same(Hs[0].dot(Hs[1]), -1); same(Hs[0].norm(), sqrt(3)); same(Hs[1].norm(), sqrt(3)); same(-1/(sqrt(3)*sqrt(3)), -Rational(1, 3))
holds(all(Hs[i_].dot(Hs[j_]) == -1 for i_ in range(4) for j_ in range(i_ + 1, 4)))
holds(all((Hs[i_] - Hs[j_]).norm() == 2*sqrt(2) for i_ in range(4) for j_ in range(i_ + 1, 4)))   # a regular tetrahedron
rounds(acos(-Rational(1, 3)), '1.9106'); rounds(acos(-Rational(1, 3))*180/pi, '109.47'); rounds(acos(-Rational(1, 3))*180/pi, '109.5')
```
:::

The formula $\cos\theta = \dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}\,\norm{\vb{b}}}$ makes sense for nonzero vectors with any number of components. One application represents words and documents by vectors and compares their directions: the cosine of the angle between them is their **cosine similarity**. Its usefulness as a measure of similarity depends on how the vectors were chosen. (Exercise 16.11 shows that the fraction always lies between $-1$ and 1, so that the angle exists.) It is undefined if either vector is zero.

### Projections {#projections}

Drop a perpendicular from the tip of $\vb{b}$ to the line of $\vb{a}$ (Figure 16.5, left). It cuts off the shadow of $\vb{b}$ on that line, the part of $\vb{b}$ that points along $\vb{a}$. Its signed length, $\norm{\vb{b}}\cos\theta$, is the **scalar projection** of $\vb{b}$ onto $\vb{a}$, and the shadow itself is the **vector projection**. By Theorem 16.4, for $\vb{a} \ne \vb{0}$,

$$\begin{aligned} \operatorname{comp}_{\vb{a}}\vb{b} &= \norm{\vb{b}}\cos\theta = \frac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}, \\ \operatorname{proj}_{\vb{a}}\vb{b} &= \frac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}\cdot\frac{\vb{a}}{\norm{\vb{a}}} = \frac{\vb{a}\cdot\vb{b}}{\vb{a}\cdot\vb{a}}\,\vb{a}, \end{aligned}$$

read "the component of b along a" and "the projection of b onto a". The angle form assumes $\vb{b} \ne \vb{0}$ too; the dot-product formulas also define the projection of $\vb{0}$, giving scalar projection 0 and vector projection $\vb{0}$. The rest of $\vb{b}$ is orthogonal to $\vb{a}$:

$$\vb{a}\cdot\big(\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b}\big) = \vb{a}\cdot\vb{b} - \frac{\vb{a}\cdot\vb{b}}{\vb{a}\cdot\vb{a}}\,(\vb{a}\cdot\vb{a}) = 0.$$

So every vector $\vb{b}$ splits into a part along $\vb{a}$ and a part perpendicular to it, $\vb{b} = \operatorname{proj}_{\vb{a}}\vb{b} + \big(\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b}\big)$; engineers split the weight of a box on a ramp this way, into a part along the ramp and a part pressing into it.

```check
projv = lambda A_, B_: (A_.dot(B_)/A_.dot(A_))*A_
same(A3.dot(B3 - projv(A3, B3)), 0); same(projv(A3, B3) + (B3 - projv(A3, B3)), B3)
same((Ar.dot(Matrix(symbols('b1:4', real=True)))/Ar.norm())*(Ar/Ar.norm()), projv(Ar, Matrix(symbols('b1:4', real=True))))
same(av.dot(zeros(3, 1))/av.norm(), 0); same(projv(av, zeros(3, 1)), zeros(3, 1))
```

::: example A projection
Find the scalar and vector projections of $\vb{b} = \langle 3, 4\rangle$ onto $\vb{a} = \langle 2, 1\rangle$, and split $\vb{b}$ into a part along $\vb{a}$ and a part perpendicular to it.

$\vb{a}\cdot\vb{b} = 6 + 4 = 10$ and $\vb{a}\cdot\vb{a} = 5$, so

$$\begin{aligned} \operatorname{comp}_{\vb{a}}\vb{b} &= \frac{10}{\sqrt5} = 2\sqrt5 \approx 4.472, \\ \operatorname{proj}_{\vb{a}}\vb{b} &= \frac{10}{5}\,\vb{a} = \langle 4, 2\rangle. \end{aligned}$$

The perpendicular part is $\vb{b} - \langle 4, 2\rangle = \langle -1, 2\rangle$; check: $\langle -1, 2\rangle\cdot\langle 2, 1\rangle = -2 + 2 = 0$. So $\langle 3, 4\rangle = \langle 4, 2\rangle + \langle -1, 2\rangle$ (Figure 16.5, left). The angle between $\vb{a}$ and $\vb{b}$ has $\cos\theta = 10/(\sqrt5\cdot5) = 2/\sqrt5$, about $26.57^\circ$.

```check
a2v, b2v = Matrix([2, 1]), Matrix([3, 4])
same(a2v.dot(b2v), 10); same(a2v.dot(a2v), 5); steps(a2v.dot(b2v)/a2v.norm(), 10/sqrt(5), 2*sqrt(5)); rounds(2*sqrt(5), '4.472')
same(projv(a2v, b2v), Matrix([4, 2])); same(b2v - projv(a2v, b2v), Matrix([-1, 2])); same(Matrix([-1, 2]).dot(a2v), 0)
same(Matrix([4, 2]) + Matrix([-1, 2]), b2v); same(a2v.dot(b2v)/(a2v.norm()*b2v.norm()), 2/sqrt(5)); rounds(acos(2/sqrt(5))*180/pi, '26.57')
```
:::

::: pitfall
The vector projection divides by $\vb{a}\cdot\vb{a} = \norm{\vb{a}}^2$, not by $\norm{\vb{a}}$: one factor $\norm{\vb{a}}$ turns $\vb{a}\cdot\vb{b}$ into a length, and the other turns $\vb{a}$ into a unit vector. In Example 16.12, $\dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}\,\vb{a} = 2\sqrt5\,\langle 2, 1\rangle$ is $\sqrt5$ times too long. And the order matters: $\operatorname{proj}_{\vb{b}}\vb{a} = \tfrac{10}{25}\langle 3, 4\rangle = \big\langle \tfrac65, \tfrac85\big\rangle$ lies along $\vb{b}$, not along $\vb{a}$.

```check
same((a2v.dot(b2v)/a2v.norm())*a2v, 2*sqrt(5)*a2v); same(((a2v.dot(b2v)/a2v.norm())*a2v).norm()/projv(a2v, b2v).norm(), sqrt(5))
same(projv(b2v, a2v), Matrix([Rational(6, 5), Rational(8, 5)])); same(Rational(10, 25)*b2v, Matrix([Rational(6, 5), Rational(8, 5)]))
```
:::

### Work {#work}

With the dot product, the work done by a constant force $\vb{F}$ along a straight displacement $\vb{D}$ is

$$W = \vb{F}\cdot\vb{D} = \norm{\vb{F}}\,\norm{\vb{D}}\cos\theta.$$

The angle form assumes that both vectors are nonzero; if either is zero, the dot-product form gives $W = 0$. With $\vb{F}$ in newtons and $\vb{D}$ in metres, $W$ is in **joules** (J). A force at right angles to the motion does no work, and a force against it does negative work. Module 12 computes the work of a force that varies along a straight line, $W = \int_a^b F(x)\,dx$; Module 20 combines the two ideas, for a varying force along a curved path.

::: example Pulling a sled
(a) A sled is pulled 50 m along level ground by a rope at $30^\circ$ above the horizontal, with a constant tension of 40 N. How much work does the rope do? (b) A constant force $\vb{F} = \langle 3, 4, 5\rangle$ N moves an object in a straight line from $(2, 1, 0)$ to $(4, 6, 2)$, in metres. How much work does it do?

**(a)** $W = \norm{\vb{F}}\,\norm{\vb{D}}\cos\theta = 40\cdot 50\cdot\cos 30^\circ = 2000\cdot\tfrac{\sqrt3}{2} = 1000\sqrt3 \approx 1732$ J. In components, $\vb{F} = \langle 40\cos 30^\circ, 40\sin 30^\circ\rangle = \big\langle 20\sqrt3, 20\big\rangle$ and $\vb{D} = \langle 50, 0\rangle$, and $\vb{F}\cdot\vb{D} = 1000\sqrt3$ again: the upward part of the pull does no work.

**(b)** The displacement is $\vb{D} = \langle 4 - 2, 6 - 1, 2 - 0\rangle = \langle 2, 5, 2\rangle$, so $W = \vb{F}\cdot\vb{D} = 6 + 20 + 10 = 36$ J.

```check
steps(40*50*cos(pi/6), 2000*sqrt(3)/2, 1000*sqrt(3)); rounds(1000*sqrt(3), '1732')
same(Matrix([40*cos(pi/6), 40*sin(pi/6)]), Matrix([20*sqrt(3), 20])); same(Matrix([20*sqrt(3), 20]).dot(Matrix([50, 0])), 1000*sqrt(3))
same(Matrix([4, 6, 2]) - Matrix([2, 1, 0]), Matrix([2, 5, 2])); same(Matrix([3, 4, 5]).dot(Matrix([2, 5, 2])), 36)
```
:::

::: figure id=fig-16-5
Left: projecting $\vb{b} = \langle 3, 4\rangle$ onto $\vb{a} = \langle 2, 1\rangle$ (Example 16.12). The dashed segment meets the line of $\vb{a}$ at a right angle; $\operatorname{proj}_{\vb{a}}\vb{b} = \langle 4, 2\rangle$ is the shadow of $\vb{b}$ on that line, and $\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b} = \langle -1, 2\rangle$ is perpendicular to $\vb{a}$. Right: the cross product $\vb{a} \times \vb{b}$ (Section 16.6) is perpendicular to $\vb{a}$ and $\vb{b}$, its length is the area of the shaded parallelogram they span, and it points the way your right thumb does when your fingers curl from $\vb{a}$ towards $\vb{b}$.
:::

## The cross product {#cross}

Many questions in space need a vector perpendicular to two given vectors $\vb{a}$ and $\vb{b}$: the direction a plane faces, or the axis about which a force turns a spanner. Look for $\vb{n} = \langle n_1, n_2, n_3\rangle$ with $\vb{a}\cdot\vb{n} = 0$ and $\vb{b}\cdot\vb{n} = 0$:

$$a_1n_1 + a_2n_2 + a_3n_3 = 0, \qquad b_1n_1 + b_2n_2 + b_3n_3 = 0.$$

Multiply the first equation by $b_3$ and the second by $a_3$, and subtract: $n_3$ drops out, leaving $(a_1b_3 - a_3b_1)\,n_1 + (a_2b_3 - a_3b_2)\,n_2 = 0$. One solution is $n_1 = a_2b_3 - a_3b_2$, $n_2 = a_3b_1 - a_1b_3$, and then $n_3 = a_1b_2 - a_2b_1$ satisfies both equations (substitute and expand). This solution is the cross product.

```check
nn_ = Matrix([a2_*symbols('b3') - a3_*symbols('b2'), a3_*symbols('b1') - a1_*symbols('b3'), a1_*symbols('b2') - a2_*symbols('b1')])
b1_, b2_, b3_ = symbols('b1 b2 b3')
same(expand(b3_*(a1_*nn_[0] + a2_*nn_[1] + a3_*nn_[2]) - a3_*(b1_*nn_[0] + b2_*nn_[1] + b3_*nn_[2])), expand((a1_*b3_ - a3_*b1_)*nn_[0] + (a2_*b3_ - a3_*b2_)*nn_[1]))
same(expand((a1_*b3_ - a3_*b1_)*nn_[0] + (a2_*b3_ - a3_*b2_)*nn_[1]), 0)
same(expand(a1_*nn_[0] + a2_*nn_[1] + a3_*nn_[2]), 0); same(expand(b1_*nn_[0] + b2_*nn_[1] + b3_*nn_[2]), 0)
```

::: definition Cross product
The **cross product** of $\vb{a} = \langle a_1, a_2, a_3\rangle$ and $\vb{b} = \langle b_1, b_2, b_3\rangle$ is the vector

$$\vb{a}\times\vb{b} = \langle a_2b_3 - a_3b_2,\ a_3b_1 - a_1b_3,\ a_1b_2 - a_2b_1\rangle,$$

read "a cross b". This is the usual three-dimensional cross product.
:::

The formula is easier to remember as a determinant. A $2 \times 2$ **determinant** is $\begin{vmatrix} p & q \\ r & s \end{vmatrix} = ps - qr$, and each component of $\vb{a}\times\vb{b}$ is one of them. Arrange $\vb{i}$, $\vb{j}$, $\vb{k}$ and the components of $\vb{a}$ and $\vb{b}$ in three rows, and expand along the first row, covering up the row and the column of each entry in turn:

$$\begin{aligned} \vb{a}\times\vb{b} &= \begin{vmatrix} \vb{i} & \vb{j} & \vb{k} \\ a_1 & a_2 & a_3 \\ b_1 & b_2 & b_3 \end{vmatrix} \\ &= \begin{vmatrix} a_2 & a_3 \\ b_2 & b_3 \end{vmatrix}\vb{i} - \begin{vmatrix} a_1 & a_3 \\ b_1 & b_3 \end{vmatrix}\vb{j} + \begin{vmatrix} a_1 & a_2 \\ b_1 & b_2 \end{vmatrix}\vb{k}. \end{aligned}$$

Note the minus sign on the middle term. (The first row holds vectors, not numbers, so this is a memory aid rather than a true determinant.) For example, $\vb{i}\times\vb{j} = \langle 0\cdot0 - 0\cdot1,\ 0\cdot0 - 1\cdot0,\ 1\cdot1 - 0\cdot0\rangle = \vb{k}$.

```check
A3v, B3v = Matrix([a1_, a2_, a3_]), Matrix([b1_, b2_, b3_])
same(A3v.cross(B3v), nn_)
same(Matrix([[a2_, a3_], [b2_, b3_]]).det(), a2_*b3_ - a3_*b2_); same(-Matrix([[a1_, a3_], [b1_, b3_]]).det(), a3_*b1_ - a1_*b3_); same(Matrix([[a1_, a2_], [b1_, b2_]]).det(), a1_*b2_ - a2_*b1_)
I_, J_, K_ = symbols('I J K')
same(Matrix([[I_, J_, K_], [a1_, a2_, a3_], [b1_, b2_, b3_]]).det(), (a2_*b3_ - a3_*b2_)*I_ + (a3_*b1_ - a1_*b3_)*J_ + (a1_*b2_ - a2_*b1_)*K_)
same(iv.cross(jv), kv)
```

::: theorem Properties of the cross product
For vectors $\vb{a}$, $\vb{b}$, $\vb{c}$ in space and every scalar $k$:

1. $\vb{a}\times\vb{b}$ is orthogonal to $\vb{a}$ and to $\vb{b}$.
2. If $\vb{a}$ and $\vb{b}$ are nonzero and $\theta$ is the angle between them, $\norm{\vb{a}\times\vb{b}} = \norm{\vb{a}}\,\norm{\vb{b}}\sin\theta$: the area of the parallelogram with sides $\vb{a}$ and $\vb{b}$.
3. $\vb{b}\times\vb{a} = -(\vb{a}\times\vb{b})$, and $\vb{a}\times\vb{b} = \vb{0}$ exactly when $\vb{a}$ and $\vb{b}$ are parallel or one of them is $\vb{0}$.
4. $\vb{a}\times(\vb{b} + \vb{c}) = \vb{a}\times\vb{b} + \vb{a}\times\vb{c}$, and $(k\vb{a})\times\vb{b} = k(\vb{a}\times\vb{b}) = \vb{a}\times(k\vb{b})$.
:::

::: proof
(1) Expand $\vb{a}\cdot(\vb{a}\times\vb{b}) = a_1(a_2b_3 - a_3b_2) + a_2(a_3b_1 - a_1b_3) + a_3(a_1b_2 - a_2b_1)$: the six terms cancel in pairs. The same happens for $\vb{b}\cdot(\vb{a}\times\vb{b})$.

(2) Expanding both sides and collecting the same products proves **Lagrange's identity**,

$$\norm{\vb{a}\times\vb{b}}^2 = \norm{\vb{a}}^2\norm{\vb{b}}^2 - (\vb{a}\cdot\vb{b})^2.$$

By Theorem 16.4 the right side is $\norm{\vb{a}}^2\norm{\vb{b}}^2 - \norm{\vb{a}}^2\norm{\vb{b}}^2\cos^2\theta = \norm{\vb{a}}^2\norm{\vb{b}}^2\sin^2\theta$, and $\sin\theta \ge 0$ for $0 \le \theta \le \pi$, so taking square roots gives $\norm{\vb{a}\times\vb{b}} = \norm{\vb{a}}\,\norm{\vb{b}}\sin\theta$. The parallelogram has base $\norm{\vb{a}}$ and height $\norm{\vb{b}}\sin\theta$ (Figure 16.5, right), so this is its area.

(3) Swapping $\vb{a}$ and $\vb{b}$ swaps the two products in each component, which changes its sign. By (2), for nonzero vectors, $\vb{a}\times\vb{b} = \vb{0}$ exactly when $\sin\theta = 0$, that is, when $\theta = 0$ or $\pi$: when the vectors are parallel.

(4) Each component of $\vb{a}\times\vb{b}$ is a sum of terms of the form (a component of $\vb{a}$) times (a component of $\vb{b}$), so it adds up over sums and scales with $k$.
:::

```check
same(expand(A3v.dot(A3v.cross(B3v))), 0); same(expand(B3v.dot(A3v.cross(B3v))), 0)
same(expand(A3v.cross(B3v).dot(A3v.cross(B3v))), expand(A3v.dot(A3v)*B3v.dot(B3v) - A3v.dot(B3v)**2))
same(expand(A3v.dot(A3v)*B3v.dot(B3v)*(1 - cos(theta)**2)), expand(A3v.dot(A3v)*B3v.dot(B3v)*sin(theta)**2))
same(B3v.cross(A3v), -A3v.cross(B3v)); same(A3v.cross(k*A3v), zeros(3, 1))
C3v = Matrix(symbols('c1:4'))
same(A3v.cross(B3v + C3v), A3v.cross(B3v) + A3v.cross(C3v)); same((k*A3v).cross(B3v), k*A3v.cross(B3v)); same(A3v.cross(k*B3v), k*A3v.cross(B3v))
```

For two nonzero, nonparallel vectors, Theorem 16.5 fixes the line along which $\vb{a}\times\vb{b}$ points and its length, which leaves two opposite directions. Since $\vb{i}\times\vb{j} = \vb{k}$, the choice follows the right-hand rule that arranged the axes: if the fingers of your right hand curl from $\vb{a}$ towards $\vb{b}$, through the angle $\theta$, your thumb points along $\vb{a}\times\vb{b}$ (Figure 16.5, right). (The idea of a proof: turn $\vb{a}$ and $\vb{b}$ gradually into $\vb{i}$ and $\vb{j}$, never parallel; $\vb{a}\times\vb{b}$ changes gradually, is never $\vb{0}$, and so cannot jump to the opposite side.) If either vector is zero or they are parallel, their cross product is zero and has no direction. For the unit vectors,

$$\begin{aligned} \vb{i}\times\vb{j} &= \vb{k}, & \vb{j}\times\vb{k} &= \vb{i}, & \vb{k}\times\vb{i} &= \vb{j}, \\ \vb{j}\times\vb{i} &= -\vb{k}, & \vb{k}\times\vb{j} &= -\vb{i}, & \vb{i}\times\vb{k} &= -\vb{j}, \end{aligned}$$

and $\vb{i}\times\vb{i} = \vb{j}\times\vb{j} = \vb{k}\times\vb{k} = \vb{0}$.

```check
same([iv.cross(jv), jv.cross(kv), kv.cross(iv)], [kv, iv, jv]); same([jv.cross(iv), kv.cross(jv), iv.cross(kv)], [-kv, -iv, -jv])
same([iv.cross(iv), jv.cross(jv), kv.cross(kv)], [zeros(3, 1)]*3)
```

::: pitfall
The cross product is not commutative, $\vb{b}\times\vb{a} = -(\vb{a}\times\vb{b})$, and not associative: $(\vb{i}\times\vb{i})\times\vb{j} = \vb{0}\times\vb{j} = \vb{0}$, but $\vb{i}\times(\vb{i}\times\vb{j}) = \vb{i}\times\vb{k} = -\vb{j}$. Keep the order and the brackets. And do not drop the minus sign on the middle term of the determinant.

```check
same(iv.cross(iv).cross(jv), zeros(3, 1)); same(iv.cross(iv.cross(jv)), -jv)
```
:::

::: example Cross products and areas
(a) For $\vb{a} = \langle 2, -1, 2\rangle$ and $\vb{b} = \langle 1, 3, 0\rangle$ (Example 16.9), find $\vb{a}\times\vb{b}$, check that it is orthogonal to both vectors, and find the area of the parallelogram they span. (b) Find the area of the triangle with vertices $P(1, 0, 1)$, $Q(2, 2, 0)$ and $R(0, 1, 3)$.

**(a)** Expand the determinant:

$$\begin{aligned} \vb{a}\times\vb{b} &= \begin{vmatrix} \vb{i} & \vb{j} & \vb{k} \\ 2 & -1 & 2 \\ 1 & 3 & 0 \end{vmatrix} \\ &= \big((-1)\cdot0 - 2\cdot3\big)\vb{i} - \big(2\cdot0 - 2\cdot1\big)\vb{j} \\ &\qquad + \big(2\cdot3 - (-1)\cdot1\big)\vb{k} \\ &= -6\vb{i} + 2\vb{j} + 7\vb{k} = \langle -6, 2, 7\rangle. \end{aligned}$$

Check: $\langle 2, -1, 2\rangle\cdot\langle -6, 2, 7\rangle = -12 - 2 + 14 = 0$ and $\langle 1, 3, 0\rangle\cdot\langle -6, 2, 7\rangle = -6 + 6 + 0 = 0$. The area is $\norm{\vb{a}\times\vb{b}} = \sqrt{36 + 4 + 49} = \sqrt{89} \approx 9.434$. Lagrange's identity agrees: $\norm{\vb{a}}^2\norm{\vb{b}}^2 - (\vb{a}\cdot\vb{b})^2 = 9\cdot10 - (-1)^2 = 89$.

**(b)** The triangle is half of the parallelogram spanned by $\overrightarrow{PQ} = \langle 1, 2, -1\rangle$ and $\overrightarrow{PR} = \langle -1, 1, 2\rangle$. Their cross product is

$$\begin{aligned} \overrightarrow{PQ}\times\overrightarrow{PR} &= \big\langle 2\cdot2 - (-1)\cdot1,\ (-1)(-1) - 1\cdot2,\ 1\cdot1 - 2\cdot(-1)\big\rangle \\ &= \langle 5, -1, 3\rangle, \end{aligned}$$

of length $\sqrt{25 + 1 + 9} = \sqrt{35}$, so the triangle has area $\tfrac12\sqrt{35} \approx 2.958$.

```check
cr = av.cross(bv)
steps(cr, Matrix([(-1)*0 - 2*3, -(2*0 - 2*1), 2*3 - (-1)*1]), Matrix([-6, 2, 7]))
same(Matrix([[I_, J_, K_], [2, -1, 2], [1, 3, 0]]).det(), -6*I_ + 2*J_ + 7*K_)
same(av.dot(cr), 0); same(bv.dot(cr), 0); steps(av.dot(cr), -12 - 2 + 14, 0); steps(bv.dot(cr), -6 + 6 + 0, 0)
steps(cr.norm(), sqrt(36 + 4 + 49), sqrt(89)); rounds(sqrt(89), '9.434'); same(av.norm()**2*bv.norm()**2 - av.dot(bv)**2, 89)
Pp, Qp, Rp = Matrix([1, 0, 1]), Matrix([2, 2, 0]), Matrix([0, 1, 3])
same(Qp - Pp, Matrix([1, 2, -1])); same(Rp - Pp, Matrix([-1, 1, 2]))
same((Qp - Pp).cross(Rp - Pp), Matrix([5, -1, 3])); same(Matrix([5, -1, 3]).norm(), sqrt(35)); rounds(sqrt(35)/2, '2.958')
```
:::

**Torque.** A force $\vb{F}$ applied at the point with position vector $\vb{r}$, measured from a chosen point $O$, has **torque about $O$** $\boldsymbol{\tau} = \vb{r}\times\vb{F}$ ($\tau$ is the Greek letter tau). This measures its turning effect, as when a spanner turns a bolt. For nonzero, nonparallel $\vb{r}$ and $\vb{F}$, its length is $\norm{\vb{r}}\,\norm{\vb{F}}\sin\theta$, and its direction is perpendicular to their plane, by the right-hand rule; otherwise the torque is zero. For a fixed rotation axis through $O$ with unit direction $\vb{u}$, the signed torque about that axis is the component $\boldsymbol{\tau}\cdot\vb{u}$. For a spanner and force in the plane perpendicular to the bolt, the torque points along the bolt. A force of 40 N applied 0.25 m from the bolt at right angles to the spanner gives a torque of length $0.25\cdot40 = 10$ newton-metres (N·m); at $60^\circ$ to the spanner, $10\sin 60^\circ = 5\sqrt3 \approx 8.66$ N·m.

```check
same(Rational(1, 4)*40*sin(pi/2), 10); steps(10*sin(pi/3), 5*sqrt(3)); rounds(5*sqrt(3), '8.66')
same(Matrix([Rational(1, 4), 0, 0]).cross(Matrix([0, 40, 0])), Matrix([0, 0, 10]))
same(Matrix([Rational(1, 4), 0, 0]).cross(Matrix([40*cos(pi/3), 40*sin(pi/3), 0])), Matrix([0, 0, 5*sqrt(3)]))
```

**A three-dimensional operation.** For vectors of the plane, written as $\langle a_1, a_2, 0\rangle$ and $\langle b_1, b_2, 0\rangle$, the cross product $\langle 0, 0, a_1b_2 - a_2b_1\rangle$ is perpendicular to the plane, and its length $\abs{a_1b_2 - a_2b_1}$ is the area of their parallelogram. Two nonparallel vectors in three dimensions fix one perpendicular line. In four or more dimensions the vectors perpendicular to both fill at least a plane, with no line singled out by these conditions. So the construction used here does not extend to higher dimensions in the way the dot product does.

```check
same(Matrix([a1_, a2_, 0]).cross(Matrix([b1_, b2_, 0])), Matrix([0, 0, a1_*b2_ - a2_*b1_]))
same(Matrix([[3, 1], [1, 2]]).det(), 5); same(Matrix([3, 1, 0]).cross(Matrix([1, 2, 0])).norm(), 5)
w4 = Matrix(symbols('w1:5')); e1_, e2_ = Matrix([1, 0, 0, 0]), Matrix([0, 1, 0, 0])
sol4 = solve([e1_.dot(w4), e2_.dot(w4)], list(w4)); same(sol4, {w4[0]: 0, w4[1]: 0})   # in 4D, w3 and w4 stay free: a whole plane
```

## Lines and planes {#lines-planes}

### Lines {#lines}

A nonvertical line in the plane is fixed by a point and a slope. A direction vector also handles vertical lines and lines in space: choose $\vb{v} \ne \vb{0}$ parallel to the line. If $\vb{r}_0$ is the position vector of a point $P_0$ on the line, a point with position vector $\vb{r}$ lies on the line exactly when $\vb{r} - \vb{r}_0$ is a multiple of $\vb{v}$, that is, when

$$\vb{r} = \vb{r}_0 + t\,\vb{v}$$

for some number $t$. This is a **vector equation** of the line. With $\vb{r} = \langle x, y, z\rangle$, $\vb{r}_0 = \langle x_0, y_0, z_0\rangle$ and $\vb{v} = \langle a, b, c\rangle$, comparing components gives **parametric equations**,

$$x = x_0 + at, \qquad y = y_0 + bt, \qquad z = z_0 + ct,$$

a parametric curve in space with parameter $t$: a point moving along the line with constant velocity $\vb{v}$. If $a$, $b$ and $c$ are all nonzero, solve each equation for $t$ and equate the results to get **symmetric equations**,

$$\frac{x - x_0}{a} = \frac{y - y_0}{b} = \frac{z - z_0}{c}.$$

::: example A line through two points
Find vector, parametric and symmetric equations of the line through $A(1, 2, 3)$ and $B(3, 3, 1)$. Where does it meet the $xy$-plane? Do $C(5, 4, -1)$ and $D(7, 5, -2)$ lie on it?

A direction is $\vb{v} = \overrightarrow{AB} = \langle 2, 1, -2\rangle$. With $P_0 = A$:

$$\begin{aligned} &\vb{r} = \langle 1, 2, 3\rangle + t\langle 2, 1, -2\rangle; \\ &x = 1 + 2t, \quad y = 2 + t, \quad z = 3 - 2t; \\ &\frac{x - 1}{2} = \frac{y - 2}{1} = \frac{z - 3}{-2}. \end{aligned}$$

The parameter is $t = 0$ at $A$ and $t = 1$ at $B$. The line meets the $xy$-plane where $z = 3 - 2t = 0$, at $t = \tfrac32$: the point $\big(4, \tfrac72, 0\big)$. For $C$, the $x$-coordinate needs $1 + 2t = 5$, so $t = 2$; then $y = 4$ and $z = -1$, which match: $C$ is on the line. For $D$, $1 + 2t = 7$ gives $t = 3$, and then $y = 5$ but $z = -3 \ne -2$: $D$ is not on the line.

```check
Ap_, Bp_ = Matrix([1, 2, 3]), Matrix([3, 3, 1]); vv = Bp_ - Ap_
same(vv, Matrix([2, 1, -2])); Lr = Ap_ + t*vv
same(Lr.subs(t, 0), Ap_); same(Lr.subs(t, 1), Bp_)
same(solve(Lr[2], t), [Rational(3, 2)]); same(Lr.subs(t, Rational(3, 2)), Matrix([4, Rational(7, 2), 0]))
same(solve(Lr[0] - 5, t), [2]); same(Lr.subs(t, 2), Matrix([5, 4, -1]))
same(solve(Lr[0] - 7, t), [3]); same(Lr.subs(t, 3), Matrix([7, 5, -3]))
same([((Lr[0] - 1)/2), (Lr[1] - 2)/1, (Lr[2] - 3)/(-2)], [t, t, t])
```
:::

Two lines in the plane either meet or are parallel. In space there is a third possibility: lines that are not parallel and never meet, like a road that crosses a railway on a bridge, are called **skew**.

### Planes {#planes}

A plane in space is fixed by a point $P_0$ on it and the direction it faces, given by a **normal vector** $\vb{n} \ne \vb{0}$, perpendicular to the plane. A point $P$, with position vector $\vb{r}$, lies on the plane exactly when the vector $\vb{r} - \vb{r}_0$ from $P_0$ to $P$ lies in the plane, that is, when it is orthogonal to $\vb{n}$:

$$\vb{n}\cdot(\vb{r} - \vb{r}_0) = 0.$$

With $\vb{n} = \langle a, b, c\rangle$ this reads

$$a(x - x_0) + b(y - y_0) + c(z - z_0) = 0,$$

or, multiplying out, $ax + by + cz = d$, where $d = ax_0 + by_0 + cz_0$.

Conversely, if $a$, $b$ and $c$ are not all 0, the solutions of $ax + by + cz = d$ form a plane with normal vector $\langle a, b, c\rangle$: pick one solution as $P_0$, and the equation says $\vb{n}\cdot(\vb{r} - \vb{r}_0) = 0$. So one linear equation in $x$, $y$ and $z$ describes a plane, not a line. A line can be described parametrically, or as the intersection of two planes with nonparallel normal vectors.

```check
xs_, ys_, zs_, x0_, y0_, z0_, aa_, bb_, cc_ = symbols('x y z x0 y0 z0 a b c')
same(Matrix([aa_, bb_, cc_]).dot(Matrix([xs_ - x0_, ys_ - y0_, zs_ - z0_])), aa_*(xs_ - x0_) + bb_*(ys_ - y0_) + cc_*(zs_ - z0_))
same(expand(aa_*(xs_ - x0_) + bb_*(ys_ - y0_) + cc_*(zs_ - z0_)), aa_*xs_ + bb_*ys_ + cc_*zs_ - (aa_*x0_ + bb_*y0_ + cc_*z0_))
```

::: example The plane through three points
Find an equation of the plane through $P(1, 0, 1)$, $Q(2, 2, 0)$ and $R(0, 1, 3)$.

The vectors $\overrightarrow{PQ}$ and $\overrightarrow{PR}$ lie in the plane, so their cross product is a normal vector. Example 16.14(b) found it: $\vb{n} = \langle 5, -1, 3\rangle$. The plane through $P$ with this normal is

$$5(x - 1) - (y - 0) + 3(z - 1) = 0, \quad\text{that is,}\quad 5x - y + 3z = 8.$$

Check with all three points: $5 - 0 + 3 = 8$, $10 - 2 + 0 = 8$ and $0 - 1 + 9 = 8$. Any nonzero multiple of $\vb{n}$ is also a normal vector: $10x - 2y + 6z = 16$ is the same plane.

```check
nP = (Qp - Pp).cross(Rp - Pp); same(nP, Matrix([5, -1, 3]))
same(expand(5*(x - 1) - (y - 0) + 3*(z - 1)), 5*x - y + 3*z - 8)
same([5*q_[0] - q_[1] + 3*q_[2] for q_ in (Pp, Qp, Rp)], [8, 8, 8])
same(solve(10*x - 2*y + 6*z - 16, x), solve(5*x - y + 3*z - 8, x))
```
:::

The angle between two planes is the angle between their normal vectors (or $\pi$ minus it, whichever is at most $\pi/2$). Parallel normals mean that the planes are parallel or are the same plane.

::: theorem Distance from a point to a plane
The distance from the point $P_1(x_1, y_1, z_1)$ to the plane $ax + by + cz = d$, where $a$, $b$ and $c$ are not all 0, is

$$D = \frac{\abs{ax_1 + by_1 + cz_1 - d}}{\sqrt{a^2 + b^2 + c^2}}.$$
:::

::: proof
If $P_1$ lies in the plane, its distance is 0 and the numerator of the formula is 0. Otherwise, let $\vb{n} = \langle a, b, c\rangle$, let $P_0$ be any point of the plane, and let $F$ be the foot of the perpendicular from $P_1$, the point where the line through $P_1$ with direction $\vb{n}$ meets the plane. For any other point $X$ of the plane, the triangle $P_1FX$ has a right angle at $F$, so $\abs{P_1X}^2 = \abs{P_1F}^2 + \abs{FX}^2 \ge \abs{P_1F}^2$: $F$ is the point of the plane nearest to $P_1$, and $D = \abs{P_1F}$. Now $\overrightarrow{P_0P_1} = \overrightarrow{P_0F} + \overrightarrow{FP_1}$, where $\overrightarrow{P_0F}$ lies in the plane, orthogonal to $\vb{n}$, and $\overrightarrow{FP_1}$ is parallel to $\vb{n}$. So $\overrightarrow{FP_1}$ is the vector projection of $\overrightarrow{P_0P_1}$ onto $\vb{n}$, and its length is the absolute value of the scalar projection:

$$\begin{aligned} D &= \frac{\abs{\vb{n}\cdot\overrightarrow{P_0P_1}}}{\norm{\vb{n}}} = \frac{\abs{a(x_1 - x_0) + b(y_1 - y_0) + c(z_1 - z_0)}}{\sqrt{a^2 + b^2 + c^2}} \\ &= \frac{\abs{ax_1 + by_1 + cz_1 - d}}{\sqrt{a^2 + b^2 + c^2}}, \end{aligned}$$

because $ax_0 + by_0 + cz_0 = d$.
:::

```check
x1s, y1s, z1s, sF = symbols('x1 y1 z1 s', real=True)
nv_ = Matrix([aa_, bb_, cc_]); P1v = Matrix([x1s, y1s, z1s])
sF_ = solve(nv_.dot(P1v + sF*nv_) - (aa_*x0_ + bb_*y0_ + cc_*z0_), sF)[0]            # where the line through P1 along n meets the plane
Fv = P1v + sF_*nv_; same(nv_.dot(Fv), aa_*x0_ + bb_*y0_ + cc_*z0_)
P0v = Matrix([x0_, y0_, z0_])
same(P1v - Fv, (nv_.dot(P1v - P0v)/nv_.dot(nv_))*nv_)                               # F P1 is the projection of P0 P1 onto n
same(nv_.dot(P1v - P0v), aa_*x1s + bb_*y1s + cc_*z1s - (aa_*x0_ + bb_*y0_ + cc_*z0_))
```

::: example Distances to a plane
Find the distances from $S(2, 3, 4)$ and from the origin to the plane $5x - y + 3z = 8$ of Example 16.16.

Here $\sqrt{a^2 + b^2 + c^2} = \sqrt{25 + 1 + 9} = \sqrt{35}$. For $S$,

$$D = \frac{\abs{5\cdot2 - 3 + 3\cdot4 - 8}}{\sqrt{35}} = \frac{11}{\sqrt{35}} \approx 1.859,$$

and for the origin, $D = \dfrac{\abs{0 - 8}}{\sqrt{35}} = \dfrac{8}{\sqrt{35}} \approx 1.352$.

```check
Dpl = lambda X_, Y_, Z_: Abs(5*X_ - Y_ + 3*Z_ - 8)/sqrt(25 + 1 + 9)
same(sqrt(25 + 1 + 9), sqrt(35)); same(Dpl(2, 3, 4), 11/sqrt(35)); rounds(11/sqrt(35), '1.859'); same(Dpl(0, 0, 0), 8/sqrt(35)); rounds(8/sqrt(35), '1.352')
same(Dpl(1, 0, 1), 0)                                                # a point already in the plane
sS = symbols('s'); foot = Matrix([2, 3, 4]) + sS*Matrix([5, -1, 3]); sf_ = solve(5*foot[0] - foot[1] + 3*foot[2] - 8, sS)[0]
same((foot.subs(sS, sf_) - Matrix([2, 3, 4])).norm(), 11/sqrt(35))        # the same distance through the foot of the perpendicular
```
:::

::: compute Vectors with SymPy and NumPy
In SymPy a vector is a `Matrix` with one column. `dot`, `cross` and `norm` do what their names say:

```python
import sympy as sp
a = sp.Matrix([2, -1, 2])
b = sp.Matrix([1, 3, 0])
print(a.dot(b), a.norm(), b.norm())
print(a.cross(b).T, a.cross(b).norm())
angle = sp.acos(a.dot(b)/(a.norm()*b.norm()))
print(angle, sp.N(angle*180/sp.pi, 6))
```

```output
-1 3 sqrt(10)
Matrix([[-6, 2, 7]]) sqrt(89)
acos(-sqrt(10)/30) 96.0508
```

SymPy prints column vectors as matrices; `.T` (the transpose) prints one as a row. The angle comes out exact, with $-\tfrac{1}{3\sqrt{10}}$ written as $-\tfrac{\sqrt{10}}{30}$ (SymPy moves square roots out of denominators), and then in degrees. The plane through three points, and the distance from $S$ to it:

```python
P, Q, R = sp.Matrix([1, 0, 1]), sp.Matrix([2, 2, 0]), sp.Matrix([0, 1, 3])
n = (Q - P).cross(R - P)
x, y, z = sp.symbols('x y z')
print(n.T, sp.expand(n.dot(sp.Matrix([x, y, z]) - P)))
S = sp.Matrix([2, 3, 4])
print(sp.Abs(n.dot(S - P))/n.norm())
```

```output
Matrix([[5, -1, 3]]) 5*x - y + 3*z - 8
11*sqrt(35)/35
```

The plane is printed as the expression that equals 0, $5x - y + 3z - 8 = 0$, and the distance $11/\sqrt{35}$ as $11\sqrt{35}/35$. NumPy works with decimals, which is what you want for large or measured data:

```python
import numpy as np
a, b = np.array([2, -1, 2]), np.array([1, 3, 0])
print(np.dot(a, b), np.cross(a, b), np.linalg.norm(a))
cos_t = np.dot(a, b)/(np.linalg.norm(a)*np.linalg.norm(b))
print(np.degrees(np.arccos(cos_t)))
```

```output
-1 [-6  2  7] 3.0
96.05074601591174
```
:::

## Vector functions and motion {#motion}

A point that moves through space has three coordinates, each a function of time. Collect them into one vector.

::: definition Vector function
A **vector function** assigns a vector to each number $t$ of its domain:

$$\vb{r}(t) = \langle f(t), g(t), h(t)\rangle = f(t)\,\vb{i} + g(t)\,\vb{j} + h(t)\,\vb{k}.$$

The functions $f$, $g$ and $h$ are its **component functions**. Limits are taken component by component: $\lim_{t\to a}\vb{r}(t) = \big\langle \lim_{t\to a} f(t), \lim_{t\to a} g(t), \lim_{t\to a} h(t)\big\rangle$ if the three limits exist, and $\vb{r}$ is **continuous** at $a$ if $f$, $g$ and $h$ are. If the component functions are continuous on an interval, the tip of $\vb{r}(t)$, drawn from the origin, traces a **space curve** as $t$ varies over that interval.
:::

The parametric curves of Section 16.1 are vector functions in the plane, with two components, and the line $\vb{r} = \vb{r}_0 + t\vb{v}$ of Section 16.7 is one in space. A new example: $\vb{r}(t) = \langle \cos t, \sin t, t\rangle$. Its first two components go round the unit circle (Example 16.1), while its height $z = t$ rises steadily. So the curve winds round the cylinder $x^2 + y^2 = 1$, climbing $2\pi$ in each turn: it is a **helix**, the shape of a spring, of a spiral staircase, and of each strand of DNA.

```check
tR = symbols('t', real=True); rh = Matrix([cos(tR), sin(tR), tR])
same(rh[0]**2 + rh[1]**2, 1); same(rh.subs(tR, tR + 2*pi) - rh, Matrix([0, 0, 2*pi]))
```

### Velocity and acceleration {#velocity}

::: definition Derivative of a vector function
The **derivative** of $\vb{r}$ is

$$\vb{r}'(t) = \lim_{h\to0} \frac{\vb{r}(t + h) - \vb{r}(t)}{h},$$

where the limit exists. The difference quotient is formed component by component, so $\vb{r}'(t) = \langle f'(t), g'(t), h'(t)\rangle$: differentiate each component.
:::

Geometrically, $\vb{r}(t + h) - \vb{r}(t)$ is the vector from one point of the curve to a nearby one, a secant; dividing by $h$ rescales it, and as $h \to 0$ its direction turns into the direction of the tangent line. So where $\vb{r}'(t) \ne \vb{0}$ it is a **tangent vector**, pointing the way the curve is traced. If $t$ is time, the derivatives have the names of Module 4's motion along a line ([Section 4.6](module_04_EN.html#motion)), now as vectors: the **velocity** is $\vb{v}(t) = \vb{r}'(t)$, the **speed** is its length $\norm{\vb{v}(t)}$, and the **acceleration** is $\vb{a}(t) = \vb{v}'(t) = \vb{r}''(t)$. For a parametric curve in the plane, the velocity is the arrow $\langle x'(t), y'(t)\rangle$ of Section 16.2. Working one component at a time, the rules of Modules 4 and 5 carry over: $(\vb{u} + \vb{w})' = \vb{u}' + \vb{w}'$, $(f\vb{u})' = f'\vb{u} + f\vb{u}'$ for a scalar function $f$, the chain rule $\big(\vb{u}(f(t))\big)' = f'(t)\,\vb{u}'\big(f(t)\big)$, and two product rules:

$$(\vb{u}\cdot\vb{w})' = \vb{u}'\cdot\vb{w} + \vb{u}\cdot\vb{w}', \qquad (\vb{u}\times\vb{w})' = \vb{u}'\times\vb{w} + \vb{u}\times\vb{w}'.$$

For the first, $\vb{u}\cdot\vb{w} = u_1w_1 + u_2w_2 + u_3w_3$; differentiate each term with the product rule and collect the terms with primes on $\vb{u}$ and those with primes on $\vb{w}$. The second is proved the same way, and the order of its factors must be kept.

```check
U_ = Matrix([Function('u1')(t), Function('u2')(t), Function('u3')(t)]); W_ = Matrix([Function('w1')(t), Function('w2')(t), Function('w3')(t)])
fS = Function('f')(t)
same(diff(U_ + W_, t), diff(U_, t) + diff(W_, t)); same(diff(fS*U_, t), diff(fS, t)*U_ + fS*diff(U_, t))
same(diff(U_.dot(W_), t), diff(U_, t).dot(W_) + U_.dot(diff(W_, t))); same(diff(U_.cross(W_), t), diff(U_, t).cross(W_) + U_.cross(diff(W_, t)))
same(diff(rh.subs(tR, tR**2), tR), 2*tR*diff(rh, tR).subs(tR, tR**2))
```

One consequence is used again and again. **If $\norm{\vb{r}(t)}$ is constant, then $\vb{r}(t)\cdot\vb{r}'(t) = 0$**: differentiating $\vb{r}\cdot\vb{r} = c^2$ gives $2\,\vb{r}\cdot\vb{r}' = 0$. A point that moves on a sphere centred at the origin always moves at right angles to its position vector, as the tangent to a circle is perpendicular to the radius.

```check
rS = Matrix([cos(t)*cos(t**2), cos(t)*sin(t**2), sin(t)])            # a path on the unit sphere
same(rS.dot(rS), 1); same(rS.dot(diff(rS, t)), 0); same(diff(U_.dot(U_), t), 2*U_.dot(diff(U_, t)))
```

::: example Motion along a helix
A particle moves along the helix $\vb{r}(t) = \langle \cos t, \sin t, t\rangle$. Find its velocity, speed and acceleration, and show that the acceleration is perpendicular to the velocity.

Differentiate each component:

$$\vb{v}(t) = \langle -\sin t, \cos t, 1\rangle, \qquad \vb{a}(t) = \langle -\cos t, -\sin t, 0\rangle.$$

The speed is $\norm{\vb{v}(t)} = \sqrt{\sin^2 t + \cos^2 t + 1} = \sqrt2$, the same at every moment. The acceleration is horizontal, with length 1: it is $-\langle \cos t, \sin t, 0\rangle$, which points from the particle straight towards the axis of the helix. And $\vb{v}\cdot\vb{a} = \sin t\cos t - \sin t\cos t + 0 = 0$. That is no accident: the speed is constant, so $\vb{v}\cdot\vb{v}$ is constant, and its derivative $2\,\vb{v}\cdot\vb{a}$ is 0 (Exercise 16.10).

```check
vh = diff(rh, tR); ah = diff(vh, tR)
same(vh, Matrix([-sin(tR), cos(tR), 1])); same(ah, Matrix([-cos(tR), -sin(tR), 0]))
steps(vh.norm(), sqrt(sin(tR)**2 + cos(tR)**2 + 1), sqrt(2)); same(ah.norm(), 1); same(ah, -Matrix([cos(tR), sin(tR), 0]))
steps(vh.dot(ah), sin(tR)*cos(tR) - sin(tR)*cos(tR) + 0, 0)
```
:::

### Integrals and arc length {#integrals}

Integrals are taken component by component too: $\int_a^b \vb{r}(t)\,dt = \Big\langle \int_a^b f(t)\,dt, \int_a^b g(t)\,dt, \int_a^b h(t)\,dt\Big\rangle$. Applying the Fundamental Theorem ([Section 10.5](module_10_EN.html#ftc2)) to each component: if $\vb{R}'(t) = \vb{r}(t)$, with $\vb{r}$ continuous, then

$$\int_a^b \vb{r}(t)\,dt = \vb{R}(b) - \vb{R}(a),$$

and every antiderivative of $\vb{r}$ is $\vb{R}(t) + \vb{C}$ for a constant vector $\vb{C}$. In particular, integrating the velocity gives the change of position: $\int_a^b \vb{v}(t)\,dt = \vb{r}(b) - \vb{r}(a)$.

```check
same(integrate(vh, (tR, 0, 2*pi)), rh.subs(tR, 2*pi) - rh.subs(tR, 0)); same(integrate(vh, (tR, 0, 2*pi)), Matrix([0, 0, 2*pi]))
```

The length of a space curve comes from the polygons of Section 16.2, with a third component in each chord. If $\vb{r}'$ is continuous on $[a, b]$, the length of the path $\vb{r}(t)$, $a \le t \le b$, is

$$L = \int_a^b \norm{\vb{r}'(t)}\,dt = \int_a^b \sqrt{f'(t)^2 + g'(t)^2 + h'(t)^2}\,dt:$$

the distance travelled is the integral of the speed. One turn of the helix has length

$$L = \int_0^{2\pi} \sqrt2\,dt = 2\pi\sqrt2 \approx 8.886.$$

Geometry agrees. Cut the cylinder along a vertical line and unroll it flat: the unit circle becomes a segment of length $2\pi$, and one turn of the helix becomes the hypotenuse of a right triangle with sides $2\pi$ (once round) and $2\pi$ (the climb), of length $\sqrt{(2\pi)^2 + (2\pi)^2} = 2\pi\sqrt2$.

```check
same(integrate(vh.norm(), (tR, 0, 2*pi)), 2*pi*sqrt(2)); rounds(2*pi*sqrt(2), '8.886'); same(sqrt((2*pi)**2 + (2*pi)**2), 2*pi*sqrt(2))
```

Where $\vb{r}'(t) \ne \vb{0}$, dividing it by its length gives the **unit tangent vector**

$$\vb{T}(t) = \frac{\vb{r}'(t)}{\norm{\vb{r}'(t)}}.$$

For the helix, $\vb{T}(t) = \tfrac{1}{\sqrt2}\langle -\sin t, \cos t, 1\rangle$; since $\vb{T}\cdot\vb{k} = \tfrac{1}{\sqrt2} = \cos\tfrac{\pi}{4}$, the helix climbs at a constant angle of $\pi/4$ to the vertical. The **arc length function** $s(t) = \int_a^t \norm{\vb{r}'(u)}\,du$ measures the distance travelled since time $a$, and by Part 1 of the Fundamental Theorem ([Section 10.4](module_10_EN.html#ftc1)), $ds/dt = \norm{\vb{r}'(t)}$: distance grows at the rate given by the speed.

```check
Th = vh/vh.norm(); same(Th, Matrix([-sin(tR), cos(tR), 1])/sqrt(2)); same(Th.norm(), 1); same(Th.dot(kv), 1/sqrt(2)); same(cos(pi/4), 1/sqrt(2))
sfun = Integral(vh.norm().subs(tR, u), (u, 0, tR)); same(diff(sfun, tR), sqrt(2))
```

### Projectile motion {#projectiles}

Throw a ball or aim a jet of water. Near the Earth's surface, neglect air resistance and model gravity as a constant downward acceleration of magnitude $g > 0$, about 9.8 m/s². With the launch point at the origin, $x$ horizontal and $y$ up, $\vb{a}(t) = \langle 0, -g\rangle$. Let the projectile leave with speed $v_0 > 0$ at the angle $\alpha$ (alpha) above the horizontal, with $0 < \alpha < \pi/2$, so that $\vb{v}(0) = \langle v_0\cos\alpha, v_0\sin\alpha\rangle$ and $\vb{r}(0) = \vb{0}$. For times $t \ge 0$ before landing, integrate each component as Module 13 did for $s'' = 9.8$, fixing the constants by $\vb{v}(0)$ and $\vb{r}(0)$:

$$\begin{aligned} \vb{v}(t) &= \langle v_0\cos\alpha,\ v_0\sin\alpha - gt\rangle, \\ \vb{r}(t) &= \big\langle (v_0\cos\alpha)\,t,\ (v_0\sin\alpha)\,t - \tfrac12 gt^2\big\rangle. \end{aligned}$$

The horizontal velocity never changes; only the vertical velocity feels gravity. For $0 < \alpha < \pi/2$, eliminating $t = x/(v_0\cos\alpha)$ gives $y = (\tan\alpha)\,x - \dfrac{g}{2v_0^2\cos^2\alpha}\,x^2$: the path is a parabola.

```check
g_, v0_, al_ = symbols('g v_0 alpha', positive=True)
vproj = Matrix([integrate(0, t) + v0_*cos(al_), integrate(-g_, t) + v0_*sin(al_)])
same(vproj, Matrix([v0_*cos(al_), v0_*sin(al_) - g_*t])); same(diff(vproj, t), Matrix([0, -g_])); same(vproj.subs(t, 0), Matrix([v0_*cos(al_), v0_*sin(al_)]))
rproj = Matrix([v0_*cos(al_)*t, v0_*sin(al_)*t - g_*t**2/2])
same(diff(rproj, t), vproj); same(rproj.subs(t, 0), Matrix([0, 0]))
same(rproj[1].subs(t, x/(v0_*cos(al_))), tan(al_)*x - g_/(2*v0_**2*cos(al_)**2)*x**2)
```

**Flight time, range and height.** On level ground the projectile lands when $y = 0$, that is, when $t\big(v_0\sin\alpha - \tfrac12 gt\big) = 0$: at $t = 0$, when it is launched, and at the **flight time** $t_f = \dfrac{2v_0\sin\alpha}{g}$. It has then travelled the **range**

$$R = (v_0\cos\alpha)\,t_f = \frac{2v_0^2\sin\alpha\cos\alpha}{g} = \frac{v_0^2\sin 2\alpha}{g},$$

using the double-angle formula $\sin 2\alpha = 2\sin\alpha\cos\alpha$ of Example 16.4. It is highest when its vertical velocity is 0, at $t = v_0\sin\alpha/g$, half the flight time, at the height $H = \dfrac{v_0^2\sin^2\alpha}{2g}$. Here are the three for a launch speed of $v_0 = 20$ m/s and the angles $\pi/12$, $\pi/6$, $\pi/4$, $\pi/3$ and $5\pi/12$, that is, $15^\circ$, $30^\circ$, $45^\circ$, $60^\circ$ and $75^\circ$:

```valuetable
alpha = pi/12, pi/6, pi/4, pi/3, 5*pi/12
$t_f\text{ (s)}$ = 40*sin(alpha)/(49/5)
$R\text{ (m)}$ = 400*sin(2*alpha)/(49/5)
$H\text{ (m)}$ = 400*sin(alpha)**2/(98/5)
digits = 4
---
\alpha | t_f\text{ (s)} | R\text{ (m)} | H\text{ (m)}
\frac{\pi}{12} | 1.056 | 20.41 | 1.367
\frac{\pi}{6} | 2.041 | 35.35 | 5.102
\frac{\pi}{4} | 2.886 | 40.82 | 10.20
\frac{\pi}{3} | 3.535 | 35.35 | 15.31
\frac{5 \pi}{12} | 3.943 | 20.41 | 19.04
```

```check
same(solve(t*(v0_*sin(al_) - g_*t/2), t), [0, 2*v0_*sin(al_)/g_]); same(factor(rproj[1]), factor(t*(v0_*sin(al_) - g_*t/2)))
tf_ = 2*v0_*sin(al_)/g_
steps(rproj[0].subs(t, tf_), 2*v0_**2*sin(al_)*cos(al_)/g_, v0_**2*sin(2*al_)/g_)
same(solve(vproj[1], t), [v0_*sin(al_)/g_]); same(v0_*sin(al_)/g_, tf_/2); same(rproj[1].subs(t, v0_*sin(al_)/g_), v0_**2*sin(al_)**2/(2*g_))
same([d_*pi/180 for d_ in (15, 30, 45, 60, 75)], [pi/12, pi/6, pi/4, pi/3, 5*pi/12])
```

**The best angle.** Which angle gives the longest range? Extend the range formula to $[0, \pi/2]$: the limiting horizontal launch has no flight time above level ground, and the vertical launch has no horizontal displacement, so both have range 0. On this closed interval, $R(\alpha) = \dfrac{v_0^2}{g}\sin 2\alpha$ is continuous, so the closed interval method of Module 8 applies. $R'(\alpha) = \dfrac{2v_0^2}{g}\cos 2\alpha$ is 0 only at $2\alpha = \pi/2$, that is, $\alpha = \pi/4$; comparing $R(0) = R(\pi/2) = 0$ with $R(\pi/4) = v_0^2/g$, the greatest range, $v_0^2/g$, comes at $45^\circ$: about 40.82 m for $v_0 = 20$ m/s. The table also shows a symmetry: since $\sin(\pi - 2\alpha) = \sin 2\alpha$, $R(\pi/2 - \alpha) = R(\alpha)$, so complementary angles such as $30^\circ$ and $60^\circ$ give the same range. The steeper throw goes higher and stays up longer, but moves forwards more slowly.

```check
Ra = v0_**2*sin(2*al_)/g_
same(diff(Ra, al_), 2*v0_**2*cos(2*al_)/g_); same(solveset(cos(2*x), x, Interval(0, pi/2)), FiniteSet(pi/4))
same([Ra.subs(al_, 0), Ra.subs(al_, pi/2), Ra.subs(al_, pi/4)], [0, 0, v0_**2/g_])
rounds(400/Rational(98, 10), '40.82'); same(sin(pi - 2*al_), sin(2*al_)); same(Ra.subs(al_, pi/2 - al_), Ra)
```

::: example A kicked ball
A ball is kicked from level ground at 20 m/s, at $30^\circ$ above the horizontal (the numbers are made up). Ignoring air resistance, find its velocity after 1 s, its flight time, range and greatest height, and its velocity when it lands.

With $v_0 = 20$, $\alpha = \pi/6$ and $g = 9.8$: $v_0\cos\alpha = 10\sqrt3$ and $v_0\sin\alpha = 10$, so $\vb{v}(t) = \big\langle 10\sqrt3, 10 - 9.8t\big\rangle$. After 1 s, $\vb{v}(1) = \big\langle 10\sqrt3, 0.2\big\rangle \approx \langle 17.32, 0.2\rangle$ m/s: the ball is still rising, but slowly. Then

$$\begin{aligned} t_f &= \frac{2\cdot10}{9.8} \approx 2.041\text{ s}, \\ R &= \frac{400\sin 60^\circ}{9.8} = \frac{200\sqrt3}{9.8} \approx 35.35\text{ m}, \\ H &= \frac{400\cdot\frac14}{2\cdot9.8} \approx 5.102\text{ m}. \end{aligned}$$

On landing, $\vb{v}(t_f) = \big\langle 10\sqrt3,\ 10 - 9.8\cdot\tfrac{20}{9.8}\big\rangle = \big\langle 10\sqrt3, -10\big\rangle$, with speed $\sqrt{300 + 100} = 20$ m/s, at $30^\circ$ below the horizontal: the flight is symmetric, and the ball lands as fast as it was kicked.

```check
gn = Rational(98, 10); vb = lambda T: Matrix([20*cos(pi/6), 20*sin(pi/6) - gn*T])
same(vb(t), Matrix([10*sqrt(3), 10 - gn*t])); same(vb(1), Matrix([10*sqrt(3), Rational(2, 10)])); rounds(10*sqrt(3), '17.32')
tfb = 2*20*sin(pi/6)/gn; same(tfb, 20/gn); rounds(tfb, '2.041')
steps(400*sin(pi/3)/gn, 200*sqrt(3)/gn); rounds(200*sqrt(3)/gn, '35.35'); same(400*sin(pi/6)**2/(2*gn), 400*Rational(1, 4)/(2*gn)); rounds(100/(2*gn), '5.102')
same(vb(tfb), Matrix([10*sqrt(3), -10])); same(vb(tfb).norm(), 20); same(atan(Rational(10, 1)/(10*sqrt(3))), pi/6)
```
:::

::: pitfall
The $45^\circ$ rule assumes that the projectile lands at the height from which it was launched, and that air resistance is negligible. A shot put released 2 m above the ground at 14 m/s (made-up numbers, still neglecting air resistance) goes furthest when launched at about $42^\circ$, not $45^\circ$. Air resistance changes the calculation too; the optimum depends on the drag model and on any wind.

```check
import mpmath
mpmath.mp.dps = 30
Rh = lambda A: 14*mpmath.cos(A)/mpmath.mpf('9.8')*(14*mpmath.sin(A) + mpmath.sqrt((14*mpmath.sin(A))**2 + 2*mpmath.mpf('9.8')*2))
abest = mpmath.findroot(lambda A: mpmath.diff(Rh, A), 0.7)
rounds(abest*180/mpmath.pi, '42'); holds(Rh(abest) > Rh(mpmath.pi/4))
yh = 2 + 14*sin(al_)*t - Rational(49, 10)*t**2                       # height of the shot; it lands at the positive root
tl = [s_ for s_ in solve(yh, t) if s_.subs(al_, 1).is_positive][0]
near(N((14*cos(al_)*tl).subs(al_, Rational(7, 10)), 30), Rh(mpmath.mpf('0.7')), 1e-20)
qlaunch = symbols('q_launch', nonnegative=True)                 # q_launch = tan(alpha), 0 <= alpha < pi/2
rangeq = Rational(14, 1)/Rational(49, 5)*(14*qlaunch + sqrt((14**2 + 2*Rational(49, 5)*2)*qlaunch**2 + 2*Rational(49, 5)*2))/(1 + qlaunch**2)
qbest = sqrt(30)/6
same(solve(diff(rangeq, qlaunch), qlaunch), [qbest])             # the only stationary point for q_launch >= 0
same(simplify(rangeq.subs(qlaunch, qbest)), 4*sqrt(30)); same(rangeq.subs(qlaunch, 0), 4*sqrt(5))
limit_is(rangeq, qlaunch, oo, 0); holds(4*sqrt(30) > 4*sqrt(5)); rounds(atan(qbest)*180/pi, '42')
near(abest, N(atan(qbest), 30), 1e-25)
```
:::

::: deeper Curvature
How sharply does a curve bend? Measure how fast its direction turns per unit of distance travelled. Suppose $\vb{r}$ has continuous first and second derivatives and $\vb{r}'(t) \ne \vb{0}$ on the interval considered, so that its unit tangent $\vb{T}$ is differentiable. Its **curvature** is

$$\kappa = \Big\|\frac{d\vb{T}}{ds}\Big\| = \frac{\norm{\vb{T}'(t)}}{\norm{\vb{r}'(t)}},$$

where the second form uses the chain rule, $\vb{T}'(t) = \dfrac{d\vb{T}}{ds}\,\dfrac{ds}{dt}$, and $ds/dt = \norm{\vb{r}'(t)}$ ($\kappa$ is the Greek letter kappa). For a circle of radius $R$, $\vb{r}(t) = \langle R\cos t, R\sin t\rangle$: $\vb{r}'(t) = \langle -R\sin t, R\cos t\rangle$ has length $R$, so $\vb{T} = \langle -\sin t, \cos t\rangle$, $\vb{T}' = \langle -\cos t, -\sin t\rangle$ has length 1, and $\kappa = 1/R$. A small circle bends sharply and a large one gently; a straight line, whose $\vb{T}$ never changes, has curvature 0.

A formula without $\vb{T}$: $\kappa = \dfrac{\norm{\vb{r}'(t)\times\vb{r}''(t)}}{\norm{\vb{r}'(t)}^3}$. To prove it, write $s' = \norm{\vb{r}'}$, so that $\vb{r}' = s'\vb{T}$. By the product rule, $\vb{r}'' = s''\vb{T} + s'\vb{T}'$, and since $\vb{T}\times\vb{T} = \vb{0}$,

$$\vb{r}'\times\vb{r}'' = s's''\,(\vb{T}\times\vb{T}) + (s')^2\,(\vb{T}\times\vb{T}') = (s')^2\,(\vb{T}\times\vb{T}').$$

$\vb{T}$ has constant length 1, so $\vb{T}\cdot\vb{T}' = 0$, as shown above for every vector function of constant length. If $\vb{T}' \ne \vb{0}$, the vectors meet at a right angle and Theorem 16.5 gives $\norm{\vb{T}\times\vb{T}'} = 1\cdot\norm{\vb{T}'}\cdot\sin\tfrac{\pi}{2} = \norm{\vb{T}'}$; if $\vb{T}' = \vb{0}$, both sides are 0. So $\norm{\vb{r}'\times\vb{r}''} = (s')^2\,\norm{\vb{T}'} = (s')^3\kappa$. For the helix, $\vb{r}'\times\vb{r}'' = \langle -\sin t, \cos t, 1\rangle\times\langle -\cos t, -\sin t, 0\rangle = \langle \sin t, -\cos t, 1\rangle$, of length $\sqrt2$, and $\norm{\vb{r}'}^3 = 2\sqrt2$: $\kappa = \tfrac12$. The helix bends half as sharply as the unit circle it winds round; the climb straightens it.

The same computation explains why fast bends are dangerous. If a car moves at constant speed $v$, then $s'' = 0$ and the acceleration is $\vb{r}'' = s'\vb{T}'$, of length $v\cdot\kappa v = \kappa v^2$: on a bend of radius $R$ the car needs a sideways acceleration $v^2/R$, supplied by the grip of its tyres. Double the speed and it needs four times as much.

```check
Rr = symbols('R', positive=True)
rc = Matrix([Rr*cos(tR), Rr*sin(tR)]); Tc = diff(rc, tR)/diff(rc, tR).norm()
same(diff(rc, tR).norm(), Rr); same(Tc, Matrix([-sin(tR), cos(tR)])); same(diff(Tc, tR).norm(), 1); same(diff(Tc, tR).norm()/diff(rc, tR).norm(), 1/Rr)
sp_, Tf = Function('s')(t), Matrix([Function('T1')(t), Function('T2')(t), Function('T3')(t)])
r1_ = diff(sp_, t)*Tf; r2_ = diff(r1_, t)
same(r2_, diff(sp_, t, 2)*Tf + diff(sp_, t)*diff(Tf, t)); same(r1_.cross(r2_), diff(sp_, t)**2*Tf.cross(diff(Tf, t)))
same(vh.cross(ah), Matrix([sin(tR), -cos(tR), 1])); same(vh.cross(ah).norm(), sqrt(2)); same(vh.norm()**3, 2*sqrt(2)); same(vh.cross(ah).norm()/vh.norm()**3, Rational(1, 2))
same(diff(Th, tR).norm()/vh.norm(), Rational(1, 2))
vc = symbols('v', positive=True); rcar = Matrix([Rr*cos(vc*tR/Rr), Rr*sin(vc*tR/Rr)])
same(diff(rcar, tR).norm(), vc); same(diff(rcar, tR, 2).norm(), vc**2/Rr)
```
:::

::: compute Motion with SymPy
Projectile motion from the acceleration alone: integrate twice, choosing the constants from the starting values, then solve for the landing time and maximise the range.

```python
import sympy as sp
t, alpha = sp.symbols('t alpha', positive=True)
g, v0 = sp.Rational(98, 10), 20
a = sp.Matrix([0, -g])                       # the acceleration
v_start = sp.Matrix([v0*sp.cos(alpha), v0*sp.sin(alpha)])
v = v_start + sp.integrate(a, (t, 0, t))
r = sp.integrate(v, (t, 0, t))               # starts at the origin
print(r.T)
t_f = sp.solve(r[1], t)
print(t_f)
R = sp.simplify(r[0].subs(t, t_f[0]))
print(R)
critical = sp.solveset(sp.diff(R, alpha), alpha, domain=sp.Interval(0, sp.pi/2))
best = max([0, sp.pi/2, *critical], key=lambda angle: R.subs(alpha, angle))
print(critical, best, R.subs(alpha, best), sp.N(R.subs(alpha, best), 6))
```

```output
Matrix([[20*t*cos(alpha), -49*t**2/10 + 20*t*sin(alpha)]])
[200*sin(alpha)/49]
2000*sin(2*alpha)/49
{pi/4} pi/4 2000/49 40.8163
```

`integrate` with the limits 0 and $t$ gives the antiderivative that is 0 at $t = 0$, so adding the starting velocity fixes the constant. The landing time is $t_f = \tfrac{200}{49}\sin\alpha$, which is $\tfrac{2v_0\sin\alpha}{g}$ with $v_0 = 20$ and $g = \tfrac{49}{5}$ (the root $t = 0$ is missing because `t` was declared positive), and the range is $R = \tfrac{2000}{49}\sin 2\alpha$. `solveset` finds the critical angles within the stated interval $[0, \pi/2]$, giving only $\pi/4$. Comparing its range with those at both endpoints selects $\pi/4$, where $R = \tfrac{2000}{49} \approx 40.82$ m. This applies the same closed interval method as the calculation above. The same tools handle space curves. The length of one turn of the helix, and its curvature:

```python
r = sp.Matrix([sp.cos(t), sp.sin(t), t])
v, a = r.diff(t), r.diff(t, 2)
speed = sp.simplify(v.norm())
print(speed, sp.integrate(speed, (t, 0, 2*sp.pi)))
print(sp.simplify(v.cross(a).norm()/speed**3))
```

```output
sqrt(2) 2*sqrt(2)*pi
1/2
```
:::

## What you learned {#summary}

- A parametric curve $x = f(t)$, $y = g(t)$ is traced by a moving point. Eliminating $t$ gives an equation in $x$ and $y$, but forgets the direction and which part is traced. Examples: ellipses $x = a\cos t$, $y = b\sin t$; the cycloid $x = r(t - \sin t)$, $y = r(1 - \cos t)$; Lissajous curves.
- The slope of a parametric curve is $\dfrac{dy}{dx} = \dfrac{dy/dt}{dx/dt}$ where $dx/dt \ne 0$: horizontal tangents where $dy/dt = 0$ and $dx/dt \ne 0$, vertical ones where $dx/dt = 0$ and $dy/dt \ne 0$. If both derivatives vanish, examine the curve separately. The length of a path is $\int_a^b \sqrt{(dx/dt)^2 + (dy/dt)^2}\,dt$, the integral of the speed; a cycloid arch is $8r$ long.
- Polar coordinates: $x = r\cos\theta$, $y = r\sin\theta$, $r^2 = x^2 + y^2$, with $\theta$ in the right quadrant. Polar curves $r = f(\theta)$ (circles, cardioids, roses, spirals) are parametric curves with parameter $\theta$; the area they sweep out is $\tfrac12\int_\alpha^\beta r^2\,d\theta$, with limits that trace the region once.
- Vectors $\langle a_1, a_2, a_3\rangle = a_1\vb{i} + a_2\vb{j} + a_3\vb{k}$ have a length and, when nonzero, a direction. They add tip to tail and scale component by component, modelling displacements, velocities and forces.
- The dot product $\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2 + a_3b_3$ gives angles, orthogonality ($\vb{a}\cdot\vb{b} = 0$), projections and work, $W = \vb{F}\cdot\vb{D}$. For nonzero vectors, $\vb{a}\cdot\vb{b} = \norm{\vb{a}}\,\norm{\vb{b}}\cos\theta$.
- In three dimensions, the cross product $\vb{a}\times\vb{b}$ is orthogonal to $\vb{a}$ and $\vb{b}$. Its length is the area of their parallelogram: $\norm{\vb{a}}\,\norm{\vb{b}}\sin\theta$ for nonzero inputs. When nonzero it follows the right-hand rule; $\vb{b}\times\vb{a} = -\vb{a}\times\vb{b}$. Torque about a chosen point is $\vb{r}\times\vb{F}$, where $\vb{r}$ runs from that point to where the force acts.
- A line is $\vb{r} = \vb{r}_0 + t\vb{v}$ with $\vb{v} \ne \vb{0}$; a plane is $\vb{n}\cdot(\vb{r} - \vb{r}_0) = 0$ with $\vb{n} \ne \vb{0}$, that is, $ax + by + cz = d$. A cross product of two nonparallel directions gives a normal; the distance from a point to the plane is $\abs{ax_1 + by_1 + cz_1 - d}/\sqrt{a^2 + b^2 + c^2}$.
- Vector functions are differentiated and integrated component by component: velocity $\vb{r}'$, speed $\norm{\vb{r}'}$, acceleration $\vb{r}''$, unit tangent $\vb{T}$, length $\int_a^b \norm{\vb{r}'(t)}\,dt$.
- A projectile without air resistance follows $\vb{r}(t) = \big\langle (v_0\cos\alpha)t, (v_0\sin\alpha)t - \tfrac12gt^2\big\rangle$; on level ground its range $v_0^2\sin 2\alpha/g$ is greatest at $45^\circ$.

## Exercises {#exercises}

:::: exercise Eliminating the parameter {#ex-16-1} ★
Eliminate the parameter, and describe the curve: which part of it is traced, from where to where?

- (a) $x = 2t - 1$, $y = 4 - t$, $0 \le t \le 2$
- (b) $x = 2\cos t$, $y = 5\sin t$, $0 \le t \le \pi$
- (c) $x = \cosh t$, $y = \sinh t$, for all real $t$ (the hyperbolic functions of [Section 6.7](module_06_EN.html#hyperbolic))
- (d) $x = \sqrt t$, $y = 1 - t$, $t \ge 0$

::: solution
**(a)** $t = \dfrac{x + 1}{2}$, so $y = 4 - \dfrac{x + 1}{2} = \dfrac{7 - x}{2}$: a line of slope $-\tfrac12$. Only $0 \le t \le 2$ is used, so the curve is the segment from $(-1, 4)$ (at $t = 0$) to $(3, 2)$ (at $t = 2$).

**(b)** $\dfrac{x^2}{4} + \dfrac{y^2}{25} = \cos^2 t + \sin^2 t = 1$: an ellipse that crosses the $x$-axis at $\pm2$ and the $y$-axis at $\pm5$. For $0 \le t \le \pi$, $y = 5\sin t \ge 0$: the upper half, traced anticlockwise from $(2, 0)$ to $(-2, 0)$.

**(c)** By the identity $\cosh^2 t - \sinh^2 t = 1$ of Module 6, $x^2 - y^2 = 1$: a hyperbola. But $x = \cosh t \ge 1$, so only its right branch is traced; as $t$ increases, $y = \sinh t$ increases through every real number, so the whole branch is traced from bottom to top (at the point with $\sinh t = y$, $x = \cosh t = \sqrt{1 + y^2}$).

**(d)** From $x = \sqrt t$, $x \ge 0$ and $t = x^2$, so $y = 1 - x^2$ with $x \ge 0$: the right half of a parabola opening downwards, traced from $(0, 1)$ downwards to the right. Forgetting $x \ge 0$ would give the whole parabola.

```check
same(solve(Eq(x, 2*t - 1), t), [(x + 1)/2]); same((4 - t).subs(t, (x + 1)/2), (7 - x)/2); same([((7 - x)/2).subs(x, v) for v in (-1, 3)], [4, 2])
same(((2*t - 1).subs(t, 0), (4 - t).subs(t, 0)), (-1, 4)); same(((2*t - 1).subs(t, 2), (4 - t).subs(t, 2)), (3, 2))
same((2*cos(t))**2/4 + (5*sin(t))**2/25, 1); same(((2*cos(0)), 5*sin(0)), (2, 0)); same((2*cos(pi), 5*sin(pi)), (-2, 0))
same(cosh(t)**2 - sinh(t)**2, 1); same(minimum(cosh(x), x, S.Reals), 1); same(diff(sinh(t), t), cosh(t))
same(sinh(asinh(y)), y); same(cosh(asinh(y)), sqrt(1 + y**2))
tpos = symbols('t', nonnegative=True); same(sqrt(tpos)**2, tpos); same((1 - x**2).subs(x, sqrt(tpos)), 1 - tpos)
```
:::
::::

:::: exercise Polar coordinates {#ex-16-2} ★
- (a) Find the Cartesian coordinates of the points with polar coordinates $(6, -\pi/3)$ and $(-4, 7\pi/6)$.
- (b) Find polar coordinates, with $r > 0$ and $0 \le \theta < 2\pi$, of $(0, -5)$ and $(\sqrt3, -1)$.
- (c) Write $r = 4\cos\theta$ as an equation in $x$ and $y$, and describe the curve.

::: solution
**(a)** $\big(6\cos(-\tfrac{\pi}{3}), 6\sin(-\tfrac{\pi}{3})\big) = \big(3, -3\sqrt3\big)$. For $(-4, 7\pi/6)$: $x = -4\cos\tfrac{7\pi}{6} = -4\big(-\tfrac{\sqrt3}{2}\big) = 2\sqrt3$ and $y = -4\sin\tfrac{7\pi}{6} = -4\big(-\tfrac12\big) = 2$: the point $\big(2\sqrt3, 2\big)$, in the first quadrant, opposite to the direction $7\pi/6$.

**(b)** $(0, -5)$ is 5 units below the origin: $r = 5$, $\theta = \tfrac{3\pi}{2}$. (Here $\tan\theta = y/x$ is undefined, since $x = 0$: read the angle from the picture.) For $\big(\sqrt3, -1\big)$: $r = \sqrt{3 + 1} = 2$, $\cos\theta = \tfrac{\sqrt3}{2}$ and $\sin\theta = -\tfrac12$, so the point is in the fourth quadrant and $\theta = \tfrac{11\pi}{6}$. (The arctangent gives $-\tfrac{\pi}{6}$, the same direction, but outside $[0, 2\pi)$.)

**(c)** Multiply by $r$: $r^2 = 4r\cos\theta$, that is, $x^2 + y^2 = 4x$. Complete the square: $(x - 2)^2 + y^2 = 4$, the circle of radius 2 centred at $(2, 0)$, which passes through the pole. (Multiplying by $r$ could only add the pole, and the pole is already on the curve, at $\theta = \pi/2$.)

```check
same((6*cos(-pi/3), 6*sin(-pi/3)), (3, -3*sqrt(3))); same((-4*cos(7*pi/6), -4*sin(7*pi/6)), (2*sqrt(3), 2))
same((5*cos(3*pi/2), 5*sin(3*pi/2)), (0, -5)); same(sqrt(3 + 1), 2); same((2*cos(11*pi/6), 2*sin(11*pi/6)), (sqrt(3), -1))
same(atan(-1/sqrt(3)), -pi/6); same(-pi/6 + 2*pi, 11*pi/6)
same(expand((x - 2)**2 + y**2 - 4), x**2 + y**2 - 4*x)
Xc4, Yc4 = 4*cos(theta)*cos(theta), 4*cos(theta)*sin(theta); same((Xc4 - 2)**2 + Yc4**2, 4); same((Xc4.subs(theta, pi/2), Yc4.subs(theta, pi/2)), (0, 0))
```
:::
::::

:::: exercise Vector arithmetic {#ex-16-3} ★
Let $\vb{u} = \langle 1, -2, 2\rangle$ and $\vb{w} = \langle 3, 0, -4\rangle$.

- (a) Find $\vb{u} + \vb{w}$ and $3\vb{u} - 2\vb{w}$.
- (b) Find $\norm{\vb{u}}$, $\norm{\vb{w}}$ and the unit vector in the direction of $\vb{w}$.
- (c) Find $\vb{u}\cdot\vb{w}$ and the angle between $\vb{u}$ and $\vb{w}$.
- (d) Find $\vb{u}\times\vb{w}$, check that it is orthogonal to $\vb{u}$ and $\vb{w}$, and find the area of the parallelogram that $\vb{u}$ and $\vb{w}$ span.

::: solution
**(a)** $\vb{u} + \vb{w} = \langle 4, -2, -2\rangle$ and $3\vb{u} - 2\vb{w} = \langle 3 - 6, -6 - 0, 6 + 8\rangle = \langle -3, -6, 14\rangle$.

**(b)** $\norm{\vb{u}} = \sqrt{1 + 4 + 4} = 3$ and $\norm{\vb{w}} = \sqrt{9 + 0 + 16} = 5$, so the unit vector is $\tfrac15\vb{w} = \big\langle \tfrac35, 0, -\tfrac45\big\rangle$.

**(c)** $\vb{u}\cdot\vb{w} = 3 + 0 - 8 = -5$, so $\cos\theta = \dfrac{-5}{3\cdot5} = -\dfrac13$ and $\theta = \arccos\big(-\tfrac13\big) \approx 109.47^\circ$: the tetrahedral angle of Example 16.11 again.

**(d)** Expanding the determinant,

$$\begin{aligned} \vb{u}\times\vb{w} &= \big((-2)(-4) - 2\cdot0\big)\vb{i} - \big(1\cdot(-4) - 2\cdot3\big)\vb{j} \\ &\qquad + \big(1\cdot0 - (-2)\cdot3\big)\vb{k} = \langle 8, 10, 6\rangle. \end{aligned}$$

Check: $\vb{u}\cdot\langle 8, 10, 6\rangle = 8 - 20 + 12 = 0$ and $\vb{w}\cdot\langle 8, 10, 6\rangle = 24 + 0 - 24 = 0$. The area is $\sqrt{64 + 100 + 36} = \sqrt{200} = 10\sqrt2 \approx 14.14$; by Lagrange's identity it is also $\sqrt{9\cdot25 - (-5)^2} = \sqrt{200}$. The middle term is where slips happen: forgetting its minus sign gives $\langle 8, -10, 6\rangle$, which is not orthogonal to $\vb{u}$.

```check
uu, ww = Matrix([1, -2, 2]), Matrix([3, 0, -4])
same(uu + ww, Matrix([4, -2, -2])); same(3*uu - 2*ww, Matrix([-3, -6, 14]))
same(uu.norm(), 3); same(ww.norm(), 5); same(ww/ww.norm(), Matrix([Rational(3, 5), 0, -Rational(4, 5)]))
same(uu.dot(ww), -5); same(uu.dot(ww)/(uu.norm()*ww.norm()), -Rational(1, 3)); rounds(acos(-Rational(1, 3))*180/pi, '109.47')
same(uu.cross(ww), Matrix([8, 10, 6])); same(Matrix([[I_, J_, K_], [1, -2, 2], [3, 0, -4]]).det(), 8*I_ + 10*J_ + 6*K_)
same(uu.dot(uu.cross(ww)), 0); same(ww.dot(uu.cross(ww)), 0); steps(uu.cross(ww).norm(), sqrt(200), 10*sqrt(2)); rounds(10*sqrt(2), '14.14')
same(sqrt(9*25 - (-5)**2), sqrt(200)); holds(Ne(uu.dot(Matrix([8, -10, 6])), 0))
```
:::
::::

:::: exercise A line in space {#ex-16-4} ★
Let $L$ be the line through $P(2, 0, -1)$ and $Q(5, 2, 3)$.

- (a) Give vector, parametric and symmetric equations of $L$.
- (b) Does $(8, 4, 7)$ lie on $L$? Does $(-1, -2, -4)$?
- (c) Where does $L$ cross the $xy$-plane?
- (d) Show that $L$ is parallel to the plane $2x + y - 2z = 7$ but does not lie in it.

::: solution
**(a)** A direction is $\overrightarrow{PQ} = \langle 3, 2, 4\rangle$, so $\vb{r} = \langle 2, 0, -1\rangle + t\langle 3, 2, 4\rangle$; that is, $x = 2 + 3t$, $y = 2t$, $z = -1 + 4t$; and $\dfrac{x - 2}{3} = \dfrac{y}{2} = \dfrac{z + 1}{4}$.

**(b)** For $(8, 4, 7)$: $2 + 3t = 8$ gives $t = 2$, and then $y = 4$ and $z = 7$: yes. For $(-1, -2, -4)$: $2 + 3t = -1$ gives $t = -1$, and then $y = -2$ but $z = -5 \ne -4$: no.

**(c)** $z = -1 + 4t = 0$ at $t = \tfrac14$, the point $\big(\tfrac{11}{4}, \tfrac12, 0\big)$.

**(d)** The plane has normal $\vb{n} = \langle 2, 1, -2\rangle$, and $\vb{n}\cdot\langle 3, 2, 4\rangle = 6 + 2 - 8 = 0$: the direction of $L$ is orthogonal to the normal, so $L$ is parallel to the plane. But $P$ gives $2\cdot2 + 0 - 2\cdot(-1) = 6 \ne 7$, so $L$ is not in the plane: indeed $2(2 + 3t) + 2t - 2(-1 + 4t) = 6$ for every $t$, never 7, so $L$ never meets it.

```check
P4, Q4 = Matrix([2, 0, -1]), Matrix([5, 2, 3]); v4 = Q4 - P4; same(v4, Matrix([3, 2, 4])); L4 = P4 + t*v4
same(L4, Matrix([2 + 3*t, 2*t, -1 + 4*t])); same([(L4[0] - 2)/3, L4[1]/2, (L4[2] + 1)/4], [t, t, t])
same(solve(L4[0] - 8, t), [2]); same(L4.subs(t, 2), Matrix([8, 4, 7])); same(solve(L4[0] + 1, t), [-1]); same(L4.subs(t, -1), Matrix([-1, -2, -5]))
same(solve(L4[2], t), [Rational(1, 4)]); same(L4.subs(t, Rational(1, 4)), Matrix([Rational(11, 4), Rational(1, 2), 0]))
same(Matrix([2, 1, -2]).dot(v4), 0); same(2*2 + 0 - 2*(-1), 6); same(expand(2*L4[0] + L4[1] - 2*L4[2]), 6)
```
:::
::::

:::: exercise A figure eight {#ex-16-5} ★★
The Lissajous curve $x = \sin t$, $y = \sin 2t$, $0 \le t \le 2\pi$, looks like a figure eight lying on its side.

- (a) Find the two parameter values in $[0, 2\pi)$ at which it passes through the origin, and find its two tangent lines there. The endpoint $t = 2\pi$ repeats the starting point.
- (b) Find the points where the tangent line is horizontal, and where it is vertical.
- (c) Show that every point of the curve satisfies $y^2 = 4x^2\big(1 - x^2\big)$.

::: solution
Here $\dfrac{dx}{dt} = \cos t$ and $\dfrac{dy}{dt} = 2\cos 2t$.

**(a)** $x = \sin t = 0$ at $t = 0$, $\pi$ and $2\pi$, and there $y = \sin 2t = 0$ too; $t = 2\pi$ is the end of the loop, back at its start, so the curve passes through the origin at $t = 0$ and at $t = \pi$. At $t = 0$ the slope is $\dfrac{2\cos 0}{\cos 0} = 2$; at $t = \pi$ it is $\dfrac{2\cos 2\pi}{\cos\pi} = -2$. The tangent lines are $y = 2x$ and $y = -2x$.

**(b)** Horizontal: $\cos 2t = 0$ at $t = \tfrac{\pi}{4}, \tfrac{3\pi}{4}, \tfrac{5\pi}{4}, \tfrac{7\pi}{4}$, where $\cos t = \pm\tfrac{\sqrt2}{2} \ne 0$. The points are $\big(\tfrac{\sqrt2}{2}, 1\big)$, $\big(\tfrac{\sqrt2}{2}, -1\big)$, $\big(-\tfrac{\sqrt2}{2}, 1\big)$ and $\big(-\tfrac{\sqrt2}{2}, -1\big)$, the tops and bottoms of the two loops. Vertical: $\cos t = 0$ at $t = \tfrac{\pi}{2}$ and $\tfrac{3\pi}{2}$, where $\dfrac{dy}{dt} = 2\cos\pi = 2\cos 3\pi = -2 \ne 0$. The points are $(1, 0)$ and $(-1, 0)$, the two ends of the eight.

**(c)** By the double-angle formula, $y = \sin 2t = 2\sin t\cos t$, so $y^2 = 4\sin^2 t\cos^2 t = 4\sin^2 t\big(1 - \sin^2 t\big) = 4x^2\big(1 - x^2\big)$.

```check
xf, yf = sin(t), sin(2*t)
same(diff(xf, t), cos(t)); same(diff(yf, t), 2*cos(2*t))
same_set(solveset(sin(x), x, Interval(0, 2*pi)), [0, pi, 2*pi]); same([yf.subs(t, v) for v in (0, pi, 2*pi)], [0, 0, 0])
slf = diff(yf, t)/diff(xf, t); same(slf.subs(t, 0), 2); same(slf.subs(t, pi), -2)
same_set(solveset(cos(2*x), x, Interval.Ropen(0, 2*pi)), [pi/4, 3*pi/4, 5*pi/4, 7*pi/4])
same([(xf.subs(t, v), yf.subs(t, v)) for v in (pi/4, 3*pi/4, 5*pi/4, 7*pi/4)], [(sqrt(2)/2, 1), (sqrt(2)/2, -1), (-sqrt(2)/2, 1), (-sqrt(2)/2, -1)])
holds(all(cos(v) != 0 for v in (pi/4, 3*pi/4, 5*pi/4, 7*pi/4)))
same_set(solveset(cos(x), x, Interval.Ropen(0, 2*pi)), [pi/2, 3*pi/2]); same([diff(yf, t).subs(t, v) for v in (pi/2, 3*pi/2)], [-2, -2])
same([(xf.subs(t, v), yf.subs(t, v)) for v in (pi/2, 3*pi/2)], [(1, 0), (-1, 0)])
same(yf**2, 4*xf**2*(1 - xf**2))
```
:::
::::

:::: exercise The length of an astroid {#ex-16-6} ★★
The **astroid** is the curve $x = \cos^3 t$, $y = \sin^3 t$, $0 \le t \le 2\pi$.

- (a) Show that its points satisfy $x^{2/3} + y^{2/3} = 1$.
- (b) Find the points where $dx/dt$ and $dy/dt$ are both 0.
- (c) Find the length of the astroid.

::: solution
**(a)** With real cube roots, $x^{1/3} = \cos t$ and $y^{1/3} = \sin t$, so $x^{2/3} + y^{2/3} = \cos^2 t + \sin^2 t = 1$.

**(b)** $\dfrac{dx}{dt} = -3\cos^2 t\,\sin t$ and $\dfrac{dy}{dt} = 3\sin^2 t\,\cos t$ are both 0 exactly when $\sin t\cos t = 0$, at $t = 0, \tfrac{\pi}{2}, \pi, \tfrac{3\pi}{2}, 2\pi$. These give the four points $(1, 0)$, $(0, 1)$, $(-1, 0)$ and $(0, -1)$, with $2\pi$ repeating the first. The astroid has a cusp at each of them.

**(c)** Square, add and factor:

$$\begin{aligned} \Big(\frac{dx}{dt}\Big)^2 + \Big(\frac{dy}{dt}\Big)^2 &= 9\cos^4 t\sin^2 t + 9\sin^4 t\cos^2 t \\ &= 9\sin^2 t\cos^2 t\big(\cos^2 t + \sin^2 t\big) = 9\sin^2 t\cos^2 t. \end{aligned}$$

The square root is $3\abs{\sin t\cos t}$. The four quarters of the astroid are mirror images of each other, and on $[0, \pi/2]$ both $\sin t$ and $\cos t$ are non-negative. So, with the substitution $u = \sin t$, $du = \cos t\,dt$,

$$L = 4\int_0^{\pi/2} 3\sin t\cos t\,dt = 12\int_0^1 u\,du = 12\cdot\frac12 = 6.$$

The common wrong answer is 0: $\int_0^{2\pi} 3\sin t\cos t\,dt = 0$, because without the absolute value the negative values cancel the positive ones.

```check
xa, ya = cos(t)**3, sin(t)**3
tq_ = symbols('t', positive=True)
same(real_root(cos(Rational(1, 3))**3, 3), cos(Rational(1, 3))); same(real_root(cos(Rational(5, 2))**3, 3), cos(Rational(5, 2)))
same(cos(t)**2 + sin(t)**2, 1)
same(diff(xa, t), -3*cos(t)**2*sin(t)); same(diff(ya, t), 3*sin(t)**2*cos(t))
same_set(solveset(sin(x)*cos(x), x, Interval(0, 2*pi)), [0, pi/2, pi, 3*pi/2, 2*pi])
same((xa.subs(t, 2*pi), ya.subs(t, 2*pi)), (1, 0))
same([(xa.subs(t, v), ya.subs(t, v)) for v in (0, pi/2, pi, 3*pi/2)], [(1, 0), (0, 1), (-1, 0), (0, -1)])
steps(diff(xa, t)**2 + diff(ya, t)**2, 9*cos(t)**4*sin(t)**2 + 9*sin(t)**4*cos(t)**2, 9*sin(t)**2*cos(t)**2*(cos(t)**2 + sin(t)**2), 9*sin(t)**2*cos(t)**2)
steps(4*Integral(3*sin(t)*cos(t), (t, 0, pi/2)), 12*Integral(u, (u, 0, 1)), 12*Rational(1, 2), 6)
near(Integral(3*Abs(sin(t)*cos(t)), (t, 0, 2*pi)).evalf(30), 6, 1e-20); same(integrate(3*sin(t)*cos(t), (t, 0, 2*pi)), 0)
```
:::
::::

:::: exercise Area between polar curves {#ex-16-7} ★★
Find the area of the region inside the circle $r = 3\cos\theta$ and outside the cardioid $r = 1 + \cos\theta$.

::: solution
Away from the pole, the curves meet where $3\cos\theta = 1 + \cos\theta$, that is, $\cos\theta = \tfrac12$: at $\theta = \pm\tfrac{\pi}{3}$. They also meet at the pole, reached on the circle at $\theta = \pi/2$ and on the cardioid at $\theta = \pi$; equating radii at the same angle misses this point.

The circle lies in the right half-plane and has nonnegative radius for $-\pi/2 \le \theta \le \pi/2$. On those rays it extends beyond the cardioid exactly when $\cos\theta > \tfrac12$, so the region with positive area lies between the angles $-\pi/3$ and $\pi/3$. There $0 < 1 + \cos\theta \le 3\cos\theta$, and the region is $1 + \cos\theta \le r \le 3\cos\theta$. The relevant boundary arcs are traced once; the isolated common pole adds no area. Subtract the areas, by Theorem 16.3 and the pitfall that follows it, and use $\cos^2\theta = \tfrac12(1 + \cos 2\theta)$:

$$\begin{aligned} A &= \frac12\int_{-\pi/3}^{\pi/3} \Big(9\cos^2\theta - (1 + \cos\theta)^2\Big)\,d\theta \\ &= \frac12\int_{-\pi/3}^{\pi/3} \big(8\cos^2\theta - 2\cos\theta - 1\big)\,d\theta \\ &= \frac12\int_{-\pi/3}^{\pi/3} \big(3 + 4\cos 2\theta - 2\cos\theta\big)\,d\theta \\ &= \frac12\Big[3\theta + 2\sin 2\theta - 2\sin\theta\Big]_{-\pi/3}^{\pi/3}. \end{aligned}$$

At $\theta = \tfrac{\pi}{3}$ the bracket is $\pi + \sqrt3 - \sqrt3 = \pi$, and at $-\tfrac{\pi}{3}$ it is $-\pi$. So $A = \tfrac12(\pi + \pi) = \pi$.

```check
same_set(solveset(Eq(3*cos(x), 1 + cos(x)), x, Interval(-pi, pi)), [-pi/3, pi/3])
same((3*cos(pi/2)*cos(pi/2), 3*cos(pi/2)*sin(pi/2)), (0, 0))
same(((1 + cos(pi))*cos(pi), (1 + cos(pi))*sin(pi)), (0, 0))
same(3*cos(theta) - (1 + cos(theta)), 2*cos(theta) - 1)
holds(minimum(cos(x), x, Interval(-pi/2, pi/2)) >= 0)
holds(minimum(3*cos(x) - (1 + cos(x)), x, Interval(-pi/3, pi/3)) >= 0); holds(minimum(1 + cos(x), x, Interval(-pi/3, pi/3)) >= 0)
same(expand(9*cos(theta)**2 - (1 + cos(theta))**2), 8*cos(theta)**2 - 2*cos(theta) - 1)
same(8*cos(theta)**2 - 2*cos(theta) - 1, 3 + 4*cos(2*theta) - 2*cos(theta))
antideriv(3*theta + 2*sin(2*theta) - 2*sin(theta), 3 + 4*cos(2*theta) - 2*cos(theta), theta)
Fa = 3*theta + 2*sin(2*theta) - 2*sin(theta); same(Fa.subs(theta, pi/3), pi); same(Fa.subs(theta, -pi/3), -pi)
same(integrate((9*cos(theta)**2 - (1 + cos(theta))**2)/2, (theta, -pi/3, pi/3)), pi)
```
:::
::::

:::: exercise A plane, a triangle and a distance {#ex-16-8} ★★
Let $A(1, 0, 0)$, $B(0, 2, 0)$ and $C(0, 0, 3)$.

- (a) Find an equation of the plane through $A$, $B$ and $C$.
- (b) Find the area of the triangle $ABC$.
- (c) Find the distance from the origin $O$ to the plane.
- (d) Check your answers: the tetrahedron $OABC$ has volume $\tfrac13\times(\text{area of a face})\times(\text{height above it})$. Compute it with the face $ABC$, and with the face $OAB$ in the $xy$-plane.

::: solution
**(a)** $\overrightarrow{AB} = \langle -1, 2, 0\rangle$ and $\overrightarrow{AC} = \langle -1, 0, 3\rangle$, so a normal is

$$\begin{aligned} \vb{n} = \overrightarrow{AB}\times\overrightarrow{AC} &= \big\langle 2\cdot3 - 0\cdot0,\ 0\cdot(-1) - (-1)\cdot3,\ (-1)\cdot0 - 2\cdot(-1)\big\rangle \\ &= \langle 6, 3, 2\rangle. \end{aligned}$$

Through $A$: $6(x - 1) + 3y + 2z = 0$, that is, $6x + 3y + 2z = 6$. Check: $B$ gives $6$ and $C$ gives $6$.

**(b)** $\norm{\vb{n}} = \sqrt{36 + 9 + 4} = 7$, so the triangle has area $\tfrac72$.

**(c)** $D = \dfrac{\abs{0 + 0 + 0 - 6}}{7} = \dfrac67 \approx 0.857$.

**(d)** With face $ABC$: $\tfrac13\cdot\tfrac72\cdot\tfrac67 = 1$. With face $OAB$, a right triangle with legs 1 and 2 and area 1, and height 3 (the distance from $C$ to the $xy$-plane): $\tfrac13\cdot1\cdot3 = 1$. The answers agree.

```check
A9, B9, C9 = Matrix([1, 0, 0]), Matrix([0, 2, 0]), Matrix([0, 0, 3])
same(B9 - A9, Matrix([-1, 2, 0])); same(C9 - A9, Matrix([-1, 0, 3])); n9 = (B9 - A9).cross(C9 - A9); same(n9, Matrix([6, 3, 2]))
same(expand(6*(x - 1) + 3*y + 2*z), 6*x + 3*y + 2*z - 6); same([6*q_[0] + 3*q_[1] + 2*q_[2] for q_ in (A9, B9, C9)], [6, 6, 6])
same(n9.norm(), 7); same(n9.norm()/2, Rational(7, 2)); same(Abs(0 - 6)/n9.norm(), Rational(6, 7)); rounds(Rational(6, 7), '0.857')
same(Rational(1, 3)*Rational(7, 2)*Rational(6, 7), 1); same(Rational(1, 3)*(Rational(1, 2)*1*2)*3, 1)
same(Abs(Matrix([1, 0, 0]).dot(Matrix([0, 2, 0]).cross(Matrix([0, 0, 3]))))/6, 1)
```
:::
::::

:::: exercise Hitting a target {#ex-16-9} ★★
A ball is thrown from ground level at 15 m/s towards a target on the ground 20 m away. Ignoring air resistance, with $g = 9.8$ m/s², at what angles can it be thrown to hit the target? How long does each throw take? What is the furthest target that can be hit at this speed?

::: solution
The range must be $R = \dfrac{v_0^2\sin 2\alpha}{g} = 20$, so

$$\sin 2\alpha = \frac{20\cdot9.8}{15^2} = \frac{196}{225} \approx 0.8711.$$

With $0 < \alpha < \tfrac{\pi}{2}$, $2\alpha$ lies between 0 and $\pi$, where the sine takes this value twice: $2\alpha = \arcsin\tfrac{196}{225} \approx 60.59^\circ$ and $2\alpha \approx 180^\circ - 60.59^\circ = 119.41^\circ$. So $\alpha \approx 30.29^\circ$ or $\alpha \approx 59.71^\circ$, two complementary angles. The flight times $t_f = \dfrac{2v_0\sin\alpha}{g}$ are about $1.544$ s for the low throw and $2.643$ s for the high one. The furthest target is at the range for $45^\circ$, $\dfrac{v_0^2}{g} = \dfrac{225}{9.8} \approx 22.96$ m; beyond that, $\sin 2\alpha$ would have to exceed 1.

```check
gq_ = Rational(98, 10)
same(20*gq_/15**2, Rational(196, 225)); rounds(Rational(196, 225), '0.8711')
a2a = asin(Rational(196, 225)); rounds(a2a*180/pi, '60.59'); rounds(180 - a2a*180/pi, '119.41')
al1, al2 = a2a/2, (pi - a2a)/2; rounds(al1*180/pi, '30.29'); rounds(al2*180/pi, '59.71'); same(al1 + al2, pi/2)
same(15**2*sin(2*al1)/gq_, 20); same(15**2*sin(2*al2)/gq_, 20)
rounds(2*15*sin(al1)/gq_, '1.544'); rounds(2*15*sin(al2)/gq_, '2.643'); rounds(225/gq_, '22.96')
```
:::
::::

:::: exercise Constant speed {#ex-16-10} ★★★
Assume that the position $\vb{r}(t)$ is twice differentiable on an interval of time.

- (a) Prove that if a particle moves with constant speed, its acceleration is always orthogonal to its velocity.
- (b) A particle moves round the circle of radius $R > 0$ centred at the origin with constant speed $v > 0$: $\vb{r}(t) = \big\langle R\cos\omega t, R\sin\omega t\big\rangle$, where $\omega = v/R$. Show that its acceleration is $-\omega^2\,\vb{r}(t)$: it points towards the centre and has length $v^2/R$.
- (c) Is the converse of (a) true: if $\vb{a}(t)\cdot\vb{v}(t) = 0$ for all $t$, is the speed constant?

::: solution
**(a)** The speed $\norm{\vb{v}}$ is constant, so $\vb{v}\cdot\vb{v} = \norm{\vb{v}}^2 = c$ for a constant $c$. Differentiate with the product rule for dot products: $\vb{v}'\cdot\vb{v} + \vb{v}\cdot\vb{v}' = 0$, that is, $2\,\vb{a}\cdot\vb{v} = 0$. So $\vb{a}\cdot\vb{v} = 0$ at every time: $\vb{a}$ is orthogonal to $\vb{v}$ (or $\vb{0}$).

**(b)** By the chain rule,

$$\begin{aligned} \vb{v}(t) &= \langle -R\omega\sin\omega t,\ R\omega\cos\omega t\rangle, \\ \vb{a}(t) &= \langle -R\omega^2\cos\omega t,\ -R\omega^2\sin\omega t\rangle = -\omega^2\,\vb{r}(t). \end{aligned}$$

The speed is $\norm{\vb{v}} = R\omega = v$, constant, as required. The acceleration points opposite to the position vector, towards the centre, and has length $\omega^2\norm{\vb{r}} = \omega^2 R = \dfrac{v^2}{R^2}\,R = \dfrac{v^2}{R}$. This **centripetal acceleration** is the $\kappa v^2$ of the Going deeper box on curvature, with $\kappa = 1/R$; it also confirms (a), since $\vb{a}$ is along the radius and $\vb{v}$ along the tangent.

**(c)** Yes. If $\vb{a}\cdot\vb{v} = 0$ for all $t$ in an interval, then $\dfrac{d}{dt}(\vb{v}\cdot\vb{v}) = 2\,\vb{a}\cdot\vb{v} = 0$ there, so $\norm{\vb{v}}^2$ is constant (Module 8), and so is the speed. For a particle of constant mass, a resultant force orthogonal to its velocity cannot change its speed.

```check
Vv = Matrix([Function('v1')(t), Function('v2')(t), Function('v3')(t)])
same(diff(Vv.dot(Vv), t), 2*diff(Vv, t).dot(Vv))
Rq, wq = symbols('R omega', positive=True); rq = Matrix([Rq*cos(wq*tR), Rq*sin(wq*tR)])
same(diff(rq, tR), Matrix([-Rq*wq*sin(wq*tR), Rq*wq*cos(wq*tR)])); same(diff(rq, tR, 2), -wq**2*rq)
same(diff(rq, tR).norm(), Rq*wq); same((wq**2*rq).norm(), wq**2*Rq)
vq = symbols('v', positive=True); same((wq**2*Rq).subs(wq, vq/Rq), vq**2/Rq); same(diff(rq, tR, 2).dot(diff(rq, tR)), 0)
```
:::
::::

:::: exercise The Cauchy–Schwarz inequality {#ex-16-11} ★★★
For vectors with $n$ real components, $\vb{a} = \langle a_1, \dots, a_n\rangle$, define $\vb{a}\cdot\vb{b} = a_1b_1 + \dots + a_nb_n$ and $\norm{\vb{a}} = \sqrt{\vb{a}\cdot\vb{a}}$; the rules of the dot product in Section 16.5 hold, with the same proofs.

- (a) Prove the **Cauchy–Schwarz inequality** $\abs{\vb{a}\cdot\vb{b}} \le \norm{\vb{a}}\,\norm{\vb{b}}$. (Hint: for $\vb{a} \ne \vb{0}$, the quadratic $q(s) = \norm{s\vb{a} + \vb{b}}^2$ is never negative.)
- (b) Deduce the triangle inequality $\norm{\vb{a} + \vb{b}} \le \norm{\vb{a}} + \norm{\vb{b}}$.
- (c) Explain why $\cos\theta = \dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}\,\norm{\vb{b}}}$ defines an angle $\theta$ for any two nonzero vectors with $n$ components, and find the angle between $\langle 1, 1, 0, 1\rangle$ and $\langle 1, 0, 1, 1\rangle$.

::: solution
**(a)** If $\vb{a} = \vb{0}$, both sides are 0. Otherwise expand, with the rules of the dot product:

$$q(s) = (s\vb{a} + \vb{b})\cdot(s\vb{a} + \vb{b}) = \norm{\vb{a}}^2 s^2 + 2(\vb{a}\cdot\vb{b})\,s + \norm{\vb{b}}^2.$$

This is a quadratic in $s$ with positive leading coefficient, and $q(s) \ge 0$ for every $s$, as a squared length. Two distinct real roots would make it negative between them, so it has at most one real root, and its discriminant is not positive:

$$4(\vb{a}\cdot\vb{b})^2 - 4\norm{\vb{a}}^2\norm{\vb{b}}^2 \le 0.$$

So $(\vb{a}\cdot\vb{b})^2 \le \norm{\vb{a}}^2\norm{\vb{b}}^2$; take square roots.

**(b)** By (a), $\vb{a}\cdot\vb{b} \le \abs{\vb{a}\cdot\vb{b}} \le \norm{\vb{a}}\,\norm{\vb{b}}$, so

$$\begin{aligned} \norm{\vb{a} + \vb{b}}^2 &= \norm{\vb{a}}^2 + 2\,\vb{a}\cdot\vb{b} + \norm{\vb{b}}^2 \\ &\le \norm{\vb{a}}^2 + 2\norm{\vb{a}}\,\norm{\vb{b}} + \norm{\vb{b}}^2 = \big(\norm{\vb{a}} + \norm{\vb{b}}\big)^2. \end{aligned}$$

Both sides are non-negative, so taking square roots gives the triangle inequality.

**(c)** By (a), the fraction lies in $[-1, 1]$, and on that interval the arccosine gives exactly one $\theta$ in $[0, \pi]$. In three dimensions this $\theta$ is the geometric angle (Theorem 16.4); in more dimensions it is the definition of the angle, which is how cosine similarity works. For the two vectors, $\vb{a}\cdot\vb{b} = 1 + 0 + 0 + 1 = 2$ and $\norm{\vb{a}} = \norm{\vb{b}} = \sqrt3$, so $\cos\theta = \tfrac23$ and $\theta \approx 48.19^\circ$.

```check
s_ = symbols('s', real=True)
An, Bn = Matrix(symbols('a1:5', real=True)), Matrix(symbols('b1:5', real=True))
same(expand((s_*An + Bn).dot(s_*An + Bn)), expand(An.dot(An)*s_**2 + 2*An.dot(Bn)*s_ + Bn.dot(Bn)))
same(discriminant(An.dot(An)*s_**2 + 2*An.dot(Bn)*s_ + Bn.dot(Bn), s_), 4*An.dot(Bn)**2 - 4*An.dot(An)*Bn.dot(Bn))
same(expand((An + Bn).dot(An + Bn)), expand(An.dot(An) + 2*An.dot(Bn) + Bn.dot(Bn)))
a4, b4 = Matrix([1, 1, 0, 1]), Matrix([1, 0, 1, 1])
same(a4.dot(b4), 2); same(a4.norm(), sqrt(3)); same(b4.norm(), sqrt(3)); same(a4.dot(b4)/(a4.norm()*b4.norm()), Rational(2, 3)); rounds(acos(Rational(2, 3))*180/pi, '48.19')
holds(Abs(a4.dot(b4)) <= a4.norm()*b4.norm()); holds((a4 + b4).norm() <= a4.norm() + b4.norm())
```
:::
::::

## Check yourself {#quiz}

```quiz
? For the curve $x = t^2$, $y = t^3$, the slope $dy/dx$ at the point where $t = 2$ is
- [ ] $\dfrac13$
- [ ] $12$
- [x] $3$
- [ ] $4$
> $\dfrac{dy}{dx} = \dfrac{dy/dt}{dx/dt} = \dfrac{3t^2}{2t} = \dfrac{3t}{2}$, which is 3 at $t = 2$. $\tfrac13$ is the ratio upside down, $dx/dy$; 12 is $dy/dt$ alone and 4 is $dx/dt$ alone.

? The curve $x = \cos t$, $y = \sin t$, $0 \le t \le \pi$, is
- [x] the upper half of the unit circle, traced anticlockwise from $(1, 0)$ to $(-1, 0)$
- [ ] the whole unit circle, traced once
- [ ] the upper half of the unit circle, traced clockwise from $(-1, 0)$ to $(1, 0)$
- [ ] the right half of the unit circle
> The point is at angle $t$ on the unit circle, and $y = \sin t \ge 0$ for $0 \le t \le \pi$: it covers the upper half once, from $(\cos 0, \sin 0) = (1, 0)$ to $(\cos\pi, \sin\pi) = (-1, 0)$, anticlockwise. The whole circle needs $0 \le t \le 2\pi$, and the right half would need $-\pi/2 \le t \le \pi/2$.

? The point with polar coordinates $(-2, \pi/3)$ has Cartesian coordinates
- [ ] $\big(1, \sqrt3\big)$
- [x] $\big(-1, -\sqrt3\big)$
- [ ] $\big(-1, \sqrt3\big)$
- [ ] $\big(\sqrt3, 1\big)$
> $x = r\cos\theta = -2\cdot\tfrac12 = -1$ and $y = r\sin\theta = -2\cdot\tfrac{\sqrt3}{2} = -\sqrt3$: with $r < 0$ the point lies on the ray opposite to the direction $\pi/3$. $\big(1, \sqrt3\big)$ ignores the sign of $r$, and $\big(\sqrt3, 1\big)$ swaps cosine and sine.

? The area of the region inside the circle $r = 2\sin\theta$ is
- [ ] $2\pi$
- [ ] $4\pi$
- [ ] $\pi/2$
- [x] $\pi$
> $r = 2\sin\theta$ is a circle of radius 1, traced once for $0 \le \theta \le \pi$, and $\tfrac12\int_0^\pi 4\sin^2\theta\,d\theta = \pi$. Integrating from 0 to $2\pi$ gives $2\pi$, because the circle is traced twice. $4\pi$ would be the area of a circle of radius 2, but here 2 is the diameter.

? Which vector is orthogonal to $\langle 2, -1, 3\rangle$?
- [ ] $\langle 1, 2, 1\rangle$
- [x] $\langle 1, 5, 1\rangle$
- [ ] $\langle -2, 1, -3\rangle$
- [ ] $\langle 3, -1, 2\rangle$
> Orthogonal means a dot product of 0: $\langle 2, -1, 3\rangle\cdot\langle 1, 5, 1\rangle = 2 - 5 + 3 = 0$. The others give $2 - 2 + 3 = 3$, $-4 - 1 - 9 = -14$ (it is parallel to the given vector, pointing the opposite way) and $6 + 1 + 6 = 13$.

? $(\vb{i}\times\vb{j})\times\vb{j}$ equals
- [ ] $\vb{0}$
- [ ] $\vb{i}$
- [x] $-\vb{i}$
- [ ] $\vb{k}$
> $\vb{i}\times\vb{j} = \vb{k}$, and $\vb{k}\times\vb{j} = -(\vb{j}\times\vb{k}) = -\vb{i}$. The answer $\vb{0}$ comes from computing $\vb{i}\times(\vb{j}\times\vb{j})$ instead: the cross product is not associative, so the brackets matter. $\vb{k}$ is only the first step, and $\vb{i}$ has the wrong sign: $\vb{k}\times\vb{j}$ is $-\vb{i}$ by the right-hand rule.

? The plane through $(1, 3, 2)$ with normal vector $\langle 2, -1, 4\rangle$ has equation
- [x] $2x - y + 4z = 7$
- [ ] $x + 3y + 2z = 7$
- [ ] $2x - y + 4z = 0$
- [ ] $\dfrac{x - 1}{2} = \dfrac{y - 3}{-1} = \dfrac{z - 2}{4}$
> $2(x - 1) - (y - 3) + 4(z - 2) = 0$ gives $2x - y + 4z = 2 - 3 + 8 = 7$. The second swaps the roles of the point and the normal; the third is the parallel plane through the origin; the fourth describes the line through the point in the direction of the normal, not a plane.

? The helix $\vb{r}(t) = \langle 3\cos t, 3\sin t, 4t\rangle$, from $t = 0$ to $t = 2\pi$, has length
- [ ] $6\pi$
- [ ] $8\pi$
- [ ] $14\pi$
- [x] $10\pi$
> $\vb{r}'(t) = \langle -3\sin t, 3\cos t, 4\rangle$ has length $\sqrt{9 + 16} = 5$ for every $t$, so $L = \int_0^{2\pi} 5\,dt = 10\pi$. $6\pi$ is the length of the circle that the helix winds round and $8\pi$ the height it climbs; adding the speeds 3 and 4 instead of combining them by Pythagoras gives $14\pi$.
```

```check
same(diff(t**3, t)/diff(t**2, t), 3*t/2); same((3*t/2).subs(t, 2), 3); same(diff(t**3, t).subs(t, 2), 12); same(diff(t**2, t).subs(t, 2), 4)
holds(minimum(sin(x), x, Interval(0, pi)) >= 0); same((cos(pi), sin(pi)), (-1, 0))
same((-2*cos(pi/3), -2*sin(pi/3)), (-1, -sqrt(3)))
same(integrate(4*sin(theta)**2/2, (theta, 0, pi)), pi); same(integrate(4*sin(theta)**2/2, (theta, 0, 2*pi)), 2*pi)
nq = Matrix([2, -1, 3]); same([nq.dot(Matrix(w_)) for w_ in ([1, 2, 1], [1, 5, 1], [-2, 1, -3], [3, -1, 2])], [3, 0, -14, 13])
same(iv.cross(jv).cross(jv), -iv); same(iv.cross(jv.cross(jv)), zeros(3, 1))
same(expand(2*(x - 1) - (y - 3) + 4*(z - 2)), 2*x - y + 4*z - 7); same(1*1 + 3*3 + 2*2, 14); same(2*1 - 3 + 4*2, 7)
rq8 = Matrix([3*cos(tR), 3*sin(tR), 4*tR]); same(diff(rq8, tR).norm(), 5); same(integrate(5, (tR, 0, 2*pi)), 10*pi)
```
