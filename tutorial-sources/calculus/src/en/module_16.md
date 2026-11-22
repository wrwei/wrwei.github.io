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

Until now every curve in this series has been the graph of a function, $y = f(x)$. Many curves are not graphs: a circle fails the vertical line test of [Section 1.3](module_01_EN.html#graphs), and so do the orbit of a satellite, the outline of a letter in a font and the track of a point on a rolling wheel. A graph also says only where a curve goes, not how a point travels along it. This module describes a curve the way physics describes motion: by giving the position of a moving point at each time $t$.

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
Left: the curve $x = t^2$, $y = t^3 - 3t$ for $-2 \le t \le 2$, with the points of the table at whole-number values of $t$ and arrows showing the direction of increasing $t$. The curve crosses itself at $(3, 0)$, where it has two tangent lines (dashed; Example 16.3). Right: the graphs of the two functions $x(t) = t^2$ and $y(t) = t^3 - 3t$, plotted against $t$. The curve on the left is built from them, but it is neither of them: $t$ appears on it only as a label on its points.
:::

::: definition Parametric curve
Let $f$ and $g$ be functions defined on an interval $I$. As $t$ runs through $I$, the point $\big(f(t), g(t)\big)$ traces a **parametric curve**, given by the **parametric equations**

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
Do not confuse the curve with the graphs of $x(t)$ and $y(t)$. Those graphs (Figure 16.1, right) have $t$ on the horizontal axis and pass the vertical line test; the curve lives in the $xy$-plane, where $t$ is not a coordinate at all. Reading Figure 16.1, left, as "$y$ against $t$" would make no sense: the curve doubles back on itself.
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

Conversely, every point with $y^2 = x(x - 3)^2$ is on the curve. Such a point has $x \ge 0$ (for $x < 0$ the right side is negative), so $y = \pm\sqrt{x}\,(x - 3)$, and the two signs come from $t = \sqrt x$ and $t = -\sqrt x$, which give $y = t(t^2 - 3) = \pm\sqrt{x}\,(x - 3)$. So the curve is exactly the curve $y^2 = x(x - 3)^2$; Figure 16.1 shows its part with $-2 \le t \le 2$.

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

Let a circle of radius $r$ roll to the right along the $x$-axis, without slipping, and let $P$ be the point of the circle that touches the ground at the origin at the start. As the parameter, take the angle $t$ (in radians) through which the circle has turned. Rolling without slipping means that the arc of the circle that has touched the ground is as long as the stretch of ground it touched. An arc of angle $t$ on a circle of radius $r$ has length $rt$ (that is what an angle of $t$ radians means, scaled by $r$), so the circle has rolled the distance $rt$: its centre is at $C = (rt, r)$, directly above the point of contact $T = (rt, 0)$ (Figure 16.2).

Where is $P$? Seen from $C$, it started straight down, at angle $-\pi/2$, and the circle rolls to the right by turning clockwise, so after turning through $t$ the point $P$ is at angle $-\pi/2 - t$. By the definition of sine and cosine, it is displaced from $C$ by

$$\Big(r\cos\big(-\tfrac{\pi}{2} - t\big),\ r\sin\big(-\tfrac{\pi}{2} - t\big)\Big) = (-r\sin t,\ -r\cos t).$$

For $0 < t < \pi/2$, as in Figure 16.2, that is $r\sin t$ to the left of $C$ and $r\cos t$ below it. Adding $C = (rt, r)$:

$$x = r(t - \sin t), \qquad y = r(1 - \cos t).$$

As $t$ runs from 0 to $2\pi$, $P$ traces one **arch** of the cycloid: up from the origin to its highest point $(\pi r, 2r)$ at $t = \pi$, when $P$ is at the top of the wheel, and down to $(2\pi r, 0)$, where it touches the ground again. Then the motion repeats: the whole cycloid is a row of arches, each $2\pi r$ wide and $2r$ high.

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
A circle of radius $r$ rolls to the right along the $x$-axis. When it has turned through the angle $t$, it has rolled the distance $rt$ (the green segment, as long as the green arc), so its centre is $C = (rt, r)$. The point $P$, which started at the origin, is then $r\sin t$ to the left of $C$ and $r\cos t$ below it. As $t$ runs from 0 to $2\pi$, $P$ traces one arch of the cycloid; the dashed part is still to come.
:::

**Lissajous curves.** Let $x$ and $y$ oscillate at different rates: $x = \sin 2t$, $y = \sin 3t$, $0 \le t \le 2\pi$. The point stays in the square $-1 \le x \le 1$, $-1 \le y \le 1$, swinging left and right twice while it swings up and down three times, and returns to its start at $t = 2\pi$, having traced a closed, knotted-looking curve. Such a **Lissajous curve** appears on an oscilloscope when two sine-wave signals drive the horizontal and the vertical deflection of its beam, and the ratio of the two frequencies can be read off the picture: this curve touches the top and the bottom of the square three times each (at $t = \pi/6, 5\pi/6, 3\pi/2$ and $t = \pi/2, 7\pi/6, 11\pi/6$), and each side twice. Trace it in the widget of Section 16.2.

```check
same_set(solveset(Eq(sin(3*x), 1), x, Interval.Ropen(0, 2*pi)), [pi/6, 5*pi/6, 3*pi/2])
same_set(solveset(Eq(sin(3*x), -1), x, Interval.Ropen(0, 2*pi)), [pi/2, 7*pi/6, 11*pi/6])
same_set(solveset(Eq(sin(2*x), 1), x, Interval.Ropen(0, 2*pi)), [pi/4, 5*pi/4])
same_set(solveset(Eq(sin(2*x), -1), x, Interval.Ropen(0, 2*pi)), [3*pi/4, 7*pi/4])
same((sin(2*(t + 2*pi)), sin(3*(t + 2*pi))), (sin(2*t), sin(3*t)))
```

## Calculus with parametric curves {#parametric-calculus}

### Tangent lines {#tangents}

Near most of its points, a parametric curve is the graph of a function, and has a tangent line. Its slope comes from the chain rule. Suppose that near some value of $t$ the curve $x = f(t)$, $y = g(t)$ is the graph of a differentiable function $y = F(x)$, so that $g(t) = F\big(f(t)\big)$. The chain rule ([Section 5.5](module_05_EN.html#chain)) gives $g'(t) = F'\big(f(t)\big)\,f'(t)$, that is,

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
On the curve $x = f(t)$, $y = g(t)$:

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

At $t = \pi$, the top of the arch, the slope is $\cot\tfrac{\pi}{2} = 0$. As $t \to 0^+$, $\cos\tfrac{t}{2} \to 1$ and $\sin\tfrac{t}{2} \to 0^+$, so the slope tends to $+\infty$; as $t \to 2\pi^-$ it tends to $-\infty$. Each arch rises vertically out of the ground and comes down vertically into it, and neighbouring arches meet in a sharp point, a **cusp**. At the cusps both $dx/dt$ and $dy/dt$ are 0: $P$ is momentarily at rest. The point of a rolling wheel that touches the ground is at rest at that instant, which is what rolling without slipping means, and the cusp is the trace of that pause.

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
tp16 = symbols('t', positive=True); same(real_root(tp16**3, 3)**2, tp16**2); same((t**3, t**3), (t**3, t**3))
```
:::

**Velocity.** If $t$ is time, $dx/dt$ is the rate at which the point moves horizontally and $dy/dt$ the rate at which it moves vertically. Draw an arrow from the point $(x, y)$ with horizontal part $dx/dt$ and vertical part $dy/dt$. Its slope is $\dfrac{dy/dt}{dx/dt} = \dfrac{dy}{dx}$, so it lies along the tangent line, and it points the way the curve is traced. Its length, $\sqrt{(dx/dt)^2 + (dy/dt)^2}$, is the **speed** of the point: the next subsection shows that integrating it gives the distance travelled. Section 16.4 calls such an arrow a vector, and Section 16.8 calls this one the **velocity**.

::: widget name=parametric-curve
Choose a curve and press **Play**, or move the slider. The blue curve is traced up to the current value of the parameter; the orange arrow is the velocity $\langle x', y'\rangle$, drawn to the scale stated under the plot, and the readout gives its exact components and the speed. With the circle, check Example 16.1(a): where is the point at $t = \pi/2$, and which way does the arrow point? With the cycloid, watch the arrow shrink to nothing as $P$ reaches the ground (Example 16.4). With the Lissajous curve, count the swings. For the polar curves of Section 16.3 the parameter is the angle $\theta$ and a dashed ray shows the direction $\theta$: with the rose $r = \cos 3\theta$, watch where the point is when $r$ is negative.
:::

### Arc length {#arc-length}

Module 12 defined the length of the graph of a function as the limit of the lengths of inscribed polygons, and found the formula $L = \int_a^b \sqrt{1 + f'(x)^2}\,dx$. The same polygons measure a parametric curve. Cut $[a, b]$ into $n$ equal pieces, at $a = t_0 < t_1 < \dots < t_n = b$, with $\Delta t = (b - a)/n$, and join the points $P_i = \big(f(t_i), g(t_i)\big)$ in order. With $\Delta x_i = f(t_i) - f(t_{i-1})$ and $\Delta y_i = g(t_i) - g(t_{i-1})$, the chord from $P_{i-1}$ to $P_i$ has length

$$\sqrt{(\Delta x_i)^2 + (\Delta y_i)^2} = \sqrt{\Big(\frac{\Delta x_i}{\Delta t}\Big)^2 + \Big(\frac{\Delta y_i}{\Delta t}\Big)^2}\;\Delta t.$$

As $\Delta t \to 0$, the two difference quotients approach $f'(t)$ and $g'(t)$, so the sum of the chords should approach an integral. The **length of the path** traced from $t = a$ to $t = b$ is the limit of the lengths of these polygons as $n \to \infty$, if the limit exists; when the path traces a curve once, it is the length of the curve.

```check
dxq, dyq, dtq = symbols('Delta_x Delta_y Delta_t', positive=True)
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
Let $P_n$ be the length of the polygon above, and $Q_n = \sum \sqrt{f'(t_i^*)^2 + g'(t_i^*)^2}\,\Delta t$, a Riemann sum that tends to $L$ as $n \to \infty$ (Module 9). For any numbers $p$, $q$ and $q'$,

$$\Big|\sqrt{p^2 + q^2} - \sqrt{p^2 + q'^2}\Big| \le \abs{q - q'}:$$

the two square roots are the distances from the origin to the points $(p, q)$ and $(p, q')$, which are $\abs{q - q'}$ apart, and two distances from the origin cannot differ by more than the distance between the points (the triangle inequality). So

$$\abs{P_n - Q_n} \le \sum_{i=1}^{n} \abs{g'(t_i^{**}) - g'(t_i^*)}\,\Delta t.$$

A function that is continuous on a closed interval is **uniformly continuous** there: for every $\varepsilon > 0$ there is a $\delta > 0$ such that $\abs{g'(s) - g'(s')} < \varepsilon$ for all $s$ and $s'$ in $[a, b]$ less than $\delta$ apart. (This theorem, like the integrability of continuous functions in Module 9, needs the completeness of the real numbers, and the series uses it without proof.) Once $\Delta t < \delta$, every term of the sum is less than $\varepsilon\,\Delta t$, so $\abs{P_n - Q_n} < \varepsilon\,n\,\Delta t = \varepsilon(b - a)$. Hence $P_n - Q_n \to 0$, and $P_n \to L$.

```check
pq16, qa16, qb16 = symbols('p q qq', real=True)
for vals in ((1, 2, 5), (-3, 1, -2), (0, 4, 4), (2, -7, 3)):
    holds(Abs(sqrt(vals[0]**2 + vals[1]**2) - sqrt(vals[0]**2 + vals[2]**2)) <= Abs(vals[1] - vals[2]))
```
:::

If $t$ is time, the integrand is the speed, and Theorem 16.2 says that the distance travelled is the integral of the speed: like the car of [Section 1.1](module_01_EN.html#about), whose odometer adds up its speedometer's readings. For the graph of $y = f(x)$, take $x = t$, $y = f(t)$: the integrand becomes $\sqrt{1 + f'(t)^2}$, and Theorem 16.2 gives Module 12's formula.

```check
same(sqrt(diff(t, t)**2 + diff(fP(t), t)**2), sqrt(1 + Derivative(fP(t), t)**2))
```

::: example Two lengths
Find the length of (a) the circle $x = r\cos t$, $y = r\sin t$, $0 \le t \le 2\pi$, and (b) one arch of the cycloid $x = r(t - \sin t)$, $y = r(1 - \cos t)$, $0 \le t \le 2\pi$.

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
$\theta = \arctan(y/x)$ is right only when $x > 0$: the arctangent gives angles between $-\pi/2$ and $\pi/2$, which point into the right half of the plane. For $(-3, -3)$, $\arctan\dfrac{-3}{-3} = \arctan 1 = \dfrac{\pi}{4}$ points into the first quadrant, exactly the wrong way; the right angle is $\dfrac{\pi}{4} + \pi = \dfrac{5\pi}{4}$. Decide the quadrant from the signs of $x$ and $y$ first. (Python's `math.atan2(y, x)` does this, and returns an angle in $(-\pi, \pi]$.)

```check
same(atan(Rational(-3, -3)), pi/4); same(pi/4 + pi, 5*pi/4); same(atan2(-3, -3), -3*pi/4); same(-3*pi/4 + 2*pi, 5*pi/4)
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
Polar coordinates and polar curves; the grey circles and rays are a polar grid. Top left: the point with polar coordinates $(r, \theta) = (2, \pi/3)$ has Cartesian coordinates $x = r\cos\theta = 1$, $y = r\sin\theta = \sqrt3$. Top middle: a region bounded by a polar curve and two rays, cut into thin slices by rays from the pole; the shaded sector, of radius $r$ and angle $\Delta\theta$, has area $\tfrac12 r^2\,\Delta\theta$ (Theorem 16.3). Top right: the circle $r = 2\sin\theta$. Bottom: the cardioid $r = 1 + \cos\theta$, whose inside has area $3\pi/2$; the rose $r = \cos 3\theta$, with one petal shaded, of area $\pi/12$; and the spiral $r = \theta/2$ for $0 \le \theta \le 4\pi$.
:::

```check
same((2*cos(pi/3), 2*sin(pi/3)), (1, sqrt(3)))
```

Two more families. The **rose** $r = \cos 3\theta$ (Figure 16.3, bottom middle) has three petals. For $-\pi/6 \le \theta \le \pi/6$, $r \ge 0$ and the point draws the petal along the polar axis, reaching $(1, 0)$ at $\theta = 0$. For $\pi/6 \le \theta \le \pi/2$, $r \le 0$, so the point is on the ray opposite to $\theta$: it draws the petal that points down to the left, whose tip $r = -1$ comes at $\theta = \pi/3$, in the direction $\pi/3 + \pi = 4\pi/3$. The third petal points in the direction $2\pi/3$. After $\theta = \pi$ the curve repeats itself, because $\cos\big(3(\theta + \pi)\big) = -\cos 3\theta$, and $(-r, \theta + \pi)$ is the same point as $(r, \theta)$. In general $r = \cos n\theta$ has $n$ petals when $n$ is odd and $2n$ when $n$ is even.

```check
same(cos(3*(theta + pi)), -cos(3*theta)); same(cos(3*0), 1); same(cos(3*pi/3), -1); same(cos(3*2*pi/3), 1)
same(solveset(cos(3*x), x, Interval(-pi/2, pi/2)), FiniteSet(-pi/2, -pi/6, pi/6, pi/2))
holds(pi/6 < 1); holds(1 < pi/2); holds(cos(3*1) < 0)                # theta = 1 lies in (pi/6, pi/2): r < 0
same((-1*cos(pi/3), -1*sin(pi/3)), (cos(4*pi/3), sin(4*pi/3)))
same(cos(2*(theta + pi)), cos(2*theta)); same(cos(5*(theta + pi)), -cos(5*theta))
```

The spiral $r = \theta/2$, $\theta \ge 0$ (Figure 16.3, bottom right), is an **Archimedean spiral**: its distance from the pole grows in proportion to the angle, so each full turn adds $2\pi$ to $\theta$ and $\pi$ to $r$, and successive turns are the same distance $\pi$ apart, like the layers of a tightly rolled carpet seen from the end.

```check
same((theta + 2*pi)/2 - theta/2, pi)
```

### Slopes of polar curves {#polar-slopes}

A polar curve $r = f(\theta)$ is the parametric curve $x = f(\theta)\cos\theta$, $y = f(\theta)\sin\theta$, so Theorem 16.1 gives its slopes. By the product rule,

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

$$\begin{aligned} \frac{dx}{d\theta} &= -\sin\theta\cos\theta - (1 + \cos\theta)\sin\theta = -\sin\theta\,(1 + 2\cos\theta), \\ \frac{dy}{d\theta} &= -\sin^2\theta + (1 + \cos\theta)\cos\theta = 2\cos^2\theta + \cos\theta - 1, \end{aligned}$$

where the last step replaced $\sin^2\theta$ by $1 - \cos^2\theta$. The quadratic in $\cos\theta$ factors: $\dfrac{dy}{d\theta} = (2\cos\theta - 1)(\cos\theta + 1)$.

**At $\theta = \pi/2$:** $r = 1$, so the point is $(0, 1)$, and $\dfrac{dx}{d\theta} = -1$, $\dfrac{dy}{d\theta} = -1$. The slope is $\dfrac{-1}{-1} = 1$, and the tangent line is $y = x + 1$.

**Horizontal tangents:** $dy/d\theta = 0$ when $\cos\theta = \tfrac12$, at $\theta = \pi/3$ and $5\pi/3$, or when $\cos\theta = -1$, at $\theta = \pi$. At $\theta = \pi/3$, $r = \tfrac32$ and the point is $\big(\tfrac34, \tfrac{3\sqrt3}{4}\big) \approx (0.75, 1.299)$; there $\dfrac{dx}{d\theta} = -\tfrac{\sqrt3}{2}\cdot 2 = -\sqrt3 \ne 0$, so the tangent line is horizontal: this is the top of the cardioid. By symmetry, $\theta = 5\pi/3$ gives the bottom, $\big(\tfrac34, -\tfrac{3\sqrt3}{4}\big)$. At $\theta = \pi$ the point is the pole, and $dx/d\theta = 0$ as well, so the formula says nothing. Figure 16.3 shows what happens: the two halves of the cardioid meet at the pole in a cusp.

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

$$\begin{aligned} A &= \frac12\int_0^{2\pi} (1 + \cos\theta)^2\,d\theta = \frac12\int_0^{2\pi} \big(1 + 2\cos\theta + \cos^2\theta\big)\,d\theta \\ &= \frac12\int_0^{2\pi} \Big(\frac32 + 2\cos\theta + \frac12\cos 2\theta\Big)\,d\theta \\ &= \frac12\Big[\frac{3\theta}{2} + 2\sin\theta + \frac14\sin 2\theta\Big]_0^{2\pi} = \frac12\cdot 3\pi = \frac{3\pi}{2}. \end{aligned}$$

The cardioid encloses $3\pi/2 \approx 4.712$, one and a half times the area of the unit circle.

**(b)** One petal is traced as $\theta$ runs from $-\pi/6$ to $\pi/6$, where $r = \cos 3\theta \ge 0$. With $u = 3\theta$ in the formula for $\cos^2 u$:

$$\begin{aligned} A &= \frac12\int_{-\pi/6}^{\pi/6} \cos^2 3\theta\,d\theta = \frac12\int_{-\pi/6}^{\pi/6} \frac{1 + \cos 6\theta}{2}\,d\theta \\ &= \frac14\Big[\theta + \frac{\sin 6\theta}{6}\Big]_{-\pi/6}^{\pi/6} = \frac14\cdot\frac{\pi}{3} = \frac{\pi}{12}, \end{aligned}$$

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
Choose limits that trace the region exactly once. $\tfrac12\int_0^{2\pi} \cos^2 3\theta\,d\theta = \pi/2$, twice the area of the rose, because the rose is traced twice as $\theta$ runs from 0 to $2\pi$. And for the region between two polar curves, $r = g(\theta) \le r = f(\theta)$, subtract the areas: $\tfrac12\int_\alpha^\beta \big(f(\theta)^2 - g(\theta)^2\big)\,d\theta$, which is not $\tfrac12\int_\alpha^\beta \big(f(\theta) - g(\theta)\big)^2\,d\theta$.

```check
same(integrate(cos(3*theta)**2/2, (theta, 0, 2*pi)), pi/2); same(pi/2, 2*(pi/4))
holds(Ne(integrate(((2) - (1))**2, (theta, 0, 1)), integrate((2**2 - 1**2), (theta, 0, 1))))
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

SymPy returns the integral unevaluated: it did not see that $2 - 2\cos t = 4\sin^2\tfrac{t}{2}$, nor that the square root of that is $2\sin\tfrac{t}{2}$ for $0 \le t \le 2\pi$. Give it the simplified integrand of Example 16.5, and it finds the length. Many lengths have no formula at all: the perimeter of the ellipse of Example 16.1(b) is an **elliptic integral**, which has no elementary antiderivative, and must be computed numerically:

```python
print(sp.integrate(2*r*sp.sin(t/2), (t, 0, 2*sp.pi)))
ellipse = sp.Integral(sp.sqrt(9*sp.sin(t)**2 + 4*sp.cos(t)**2), (t, 0, 2*sp.pi))
print(ellipse.evalf(10))
```

```output
8*r
15.86543959
```

Polar areas are ordinary integrals in $\theta$; here are the cardioid and the petal of Example 16.7:

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

This is Pythagoras' theorem twice. The point $Q(x_2, y_2, z_1)$ lies at the height of $P_1$, directly above or below $P_2$. In the horizontal plane $z = z_1$, $\abs{P_1Q}^2 = (x_2 - x_1)^2 + (y_2 - y_1)^2$; and the triangle $P_1QP_2$ has a right angle at $Q$, so $\abs{P_1P_2}^2 = \abs{P_1Q}^2 + (z_2 - z_1)^2$. For example, the distance from $(1, 2, -1)$ to $(3, -1, 5)$ is $\sqrt{4 + 9 + 36} = \sqrt{49} = 7$. The points at distance $R$ from a point $(a, b, c)$ form the **sphere** $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$.

```check
x1_, y1_, z1_, x2_, y2_, z2_ = symbols('x1 y1 z1 x2 y2 z2', real=True)
same(((x2_ - x1_)**2 + (y2_ - y1_)**2) + (z2_ - z1_)**2, (x2_ - x1_)**2 + (y2_ - y1_)**2 + (z2_ - z1_)**2)
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

Vectors are printed in bold, $\vb{a}$; by hand, write $\vec a$ (with an arrow on top). The angle brackets keep the vector $\langle a_1, a_2, a_3\rangle$ apart from the point $(a_1, a_2, a_3)$; the arrow from $O$ to that point represents the vector, the point's **position vector**. $\norm{\vb{a}}$ reads "the length of a" (or "the norm of a", the name used in linear algebra). By the distance formula, the length of $\overrightarrow{AB}$ is the distance from $A$ to $B$. The **zero vector** $\vb{0} = \langle 0, 0, 0\rangle$ has length 0 and no direction. Ordinary numbers are called **scalars**, to keep them apart from vectors.

### Adding and scaling {#arithmetic}

Walk along the arrow $\vb{a}$ and then along $\vb{b}$, drawn from where $\vb{a}$ ends: the arrow from your start to your finish is the **sum** $\vb{a} + \vb{b}$ (Figure 16.4, middle). Walking along $\vb{b}$ first and then along $\vb{a}$ gets you to the same place: the two routes are the sides of a parallelogram, and $\vb{a} + \vb{b}$ is its diagonal. A **scalar multiple** $c\,\vb{a}$ is $\vb{a}$ stretched by the factor $\abs{c}$, and reversed if $c < 0$ (Figure 16.4, right). In components, both act one component at a time:

$$\begin{aligned} \vb{a} + \vb{b} &= \langle a_1 + b_1,\ a_2 + b_2,\ a_3 + b_3\rangle, \\ c\,\vb{a} &= \langle c a_1,\ c a_2,\ c a_3\rangle. \end{aligned}$$

The length of $c\,\vb{a}$ is $\sqrt{c^2a_1^2 + c^2a_2^2 + c^2a_3^2} = \abs{c}\,\norm{\vb{a}}$. The **difference** is $\vb{a} - \vb{b} = \vb{a} + (-1)\vb{b}$; when $\vb{a}$ and $\vb{b}$ start at the same point, $\vb{a} - \vb{b}$ is the arrow from the tip of $\vb{b}$ to the tip of $\vb{a}$. Two nonzero vectors are **parallel** if one is a scalar multiple of the other. Because everything works component by component, the rules of ordinary algebra hold: $\vb{a} + \vb{b} = \vb{b} + \vb{a}$, $(\vb{a} + \vb{b}) + \vb{c} = \vb{a} + (\vb{b} + \vb{c})$, $\vb{a} + \vb{0} = \vb{a}$, $\vb{a} + (-\vb{a}) = \vb{0}$, $c(\vb{a} + \vb{b}) = c\vb{a} + c\vb{b}$, $(c + d)\vb{a} = c\vb{a} + d\vb{a}$ and $(cd)\vb{a} = c(d\vb{a})$.

```check
A3, B3, C3 = Matrix(symbols('a1:4')), Matrix(symbols('b1:4')), Matrix(symbols('c1:4'))
cs_, ds_ = symbols('c d', real=True)
same(A3 + B3, B3 + A3); same((A3 + B3) + C3, A3 + (B3 + C3)); same(A3 + zeros(3, 1), A3); same(A3 + (-A3), zeros(3, 1))
same(cs_*(A3 + B3), cs_*A3 + cs_*B3); same((cs_ + ds_)*A3, cs_*A3 + ds_*A3); same((cs_*ds_)*A3, cs_*(ds_*A3))
Ar = Matrix(symbols('a1:4', real=True)); same((cs_*Ar).norm(), Abs(cs_)*Ar.norm())
```

::: figure id=fig-16-4
Left: the point $P(2, 4, 3)$ in space, reached from the origin by moving 2 along the $x$-axis, 4 parallel to the $y$-axis and 3 up; its position vector $\langle 2, 4, 3\rangle$ is the arrow from $O$ to $P$, and $\vb{i}$, $\vb{j}$, $\vb{k}$ are the unit vectors along the axes. Middle: $\vb{a} = \langle 3, 1\rangle$ and $\vb{b} = \langle 1, 2\rangle$ add to $\vb{a} + \vb{b} = \langle 4, 3\rangle$, the diagonal of the parallelogram they span, whichever is drawn first. Right: multiples of $\vb{v} = \langle 2, 1\rangle$: $2\vb{v}$ is twice as long, $-\vb{v}$ points the other way, and $\tfrac12\vb{v}$ is half as long.
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

These two vectors return in Examples 16.12 and 16.15.

```check
av, bv = Matrix([2, -1, 2]), Matrix([1, 3, 0])
same(av + bv, Matrix([3, 2, 2])); same(2*av - 3*bv, Matrix([1, -11, 4]))
same(av.norm(), 3); same(bv.norm(), sqrt(10)); same(av/av.norm(), Matrix([Rational(2, 3), -Rational(1, 3), Rational(2, 3)]))
same(Rational(4, 9) + Rational(1, 9) + Rational(4, 9), 1); same(2*iv - jv + 2*kv, av)
```
:::

Vectors model three kinds of quantity in this series. A **displacement** is the vector from where something starts to where it ends. A **velocity** has the direction of motion and the speed as its length. A **force** has the direction in which it pulls or pushes and its strength (in newtons, N) as its length; forces acting on one object add as vectors, and an object at rest has forces adding to $\vb{0}$ (Newton's first law).

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
Lengths do not add: $\norm{\vb{a} + \vb{b}}$ is not $\norm{\vb{a}} + \norm{\vb{b}}$. In Example 16.10(a) the speeds 4 and 3 m/s combine to 5 m/s, not 7. The sides of the triangle in Figure 16.4 (middle) show the **triangle inequality**, $\norm{\vb{a} + \vb{b}} \le \norm{\vb{a}} + \norm{\vb{b}}$, with equality only when $\vb{a}$ and $\vb{b}$ point the same way (Exercise 16.12 proves it).

```check
same(Matrix([3, 4]).norm(), 5); holds(Matrix([3, 4]).norm() < 3 + 4)
same(Matrix([3, 1]).norm(), sqrt(10)); same(Matrix([1, 2]).norm(), sqrt(5)); holds(Matrix([4, 3]).norm() < sqrt(10) + sqrt(5))
```
:::

## The dot product {#dot}

Pull a sled along level ground with a rope that makes an angle $\theta$ with the ground. Only the part of the pull along the ground, $\norm{\vb{F}}\cos\theta$, moves the sled forward; the rest lifts the front of the sled a little. Physics defines the **work** done by a constant force $\vb{F}$ that moves an object along a straight displacement $\vb{D}$ as the component of the force along the displacement times the distance moved:

$$W = \norm{\vb{F}}\,\norm{\vb{D}}\cos\theta.$$

Products like this, of two lengths and the cosine of the angle between the vectors, turn out to have a very simple formula in components.

::: definition Dot product
The **dot product** of $\vb{a} = \langle a_1, a_2, a_3\rangle$ and $\vb{b} = \langle b_1, b_2, b_3\rangle$ is the number

$$\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2 + a_3b_3,$$

read "a dot b". In the plane, $\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2$.
:::

The dot product of two vectors is a scalar, not a vector; it is also called the **scalar product**. From the definition, for all vectors $\vb{a}$, $\vb{b}$, $\vb{c}$ and scalars $k$:

$$\begin{aligned} \vb{a}\cdot\vb{a} &= \norm{\vb{a}}^2, & \vb{a}\cdot\vb{b} &= \vb{b}\cdot\vb{a}, \\ \vb{a}\cdot(\vb{b} + \vb{c}) &= \vb{a}\cdot\vb{b} + \vb{a}\cdot\vb{c}, & (k\vb{a})\cdot\vb{b} &= k(\vb{a}\cdot\vb{b}) = \vb{a}\cdot(k\vb{b}). \end{aligned}$$

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

$$\begin{aligned} \norm{\vb{a} - \vb{b}}^2 &= (\vb{a} - \vb{b})\cdot(\vb{a} - \vb{b}) = \vb{a}\cdot\vb{a} - 2\,\vb{a}\cdot\vb{b} + \vb{b}\cdot\vb{b} \\ &= \norm{\vb{a}}^2 - 2\,\vb{a}\cdot\vb{b} + \norm{\vb{b}}^2. \end{aligned}$$

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

The sign of $\vb{a}\cdot\vb{b}$ is the sign of $\cos\theta$: positive when the angle is acute, negative when it is obtuse, and 0 when it is a right angle. Two vectors are **orthogonal** (perpendicular) if $\vb{a}\cdot\vb{b} = 0$; the zero vector counts as orthogonal to every vector. For the vectors of Example 16.9, $\cos\theta = \dfrac{-1}{3\sqrt{10}} \approx -0.1054$, so $\theta \approx 96.05^\circ$, a little more than a right angle.

```check
th9 = acos(av.dot(bv)/(av.norm()*bv.norm()))
same(av.dot(bv)/(av.norm()*bv.norm()), -1/(3*sqrt(10))); rounds(-1/(3*sqrt(10)), '-0.1054'); rounds(th9*180/pi, '96.05')
```

### Angles and orthogonality {#angles}

::: example The angle in a methane molecule
In a molecule of methane, CH₄, the carbon atom sits at the centre of a regular tetrahedron and the four hydrogen atoms at its corners. Put the carbon at the origin and the hydrogens at $(1, 1, 1)$, $(1, -1, -1)$, $(-1, 1, -1)$ and $(-1, -1, 1)$, four corners of a cube, no two of them joined by an edge of the cube. Find the angle between two of the bonds.

The bonds from the carbon to the first two hydrogens are $\vb{a} = \langle 1, 1, 1\rangle$ and $\vb{b} = \langle 1, -1, -1\rangle$. Then $\vb{a}\cdot\vb{b} = 1 - 1 - 1 = -1$ and $\norm{\vb{a}} = \norm{\vb{b}} = \sqrt3$, so

$$\cos\theta = \frac{-1}{\sqrt3\cdot\sqrt3} = -\frac13, \qquad \theta = \arccos\Big(-\frac13\Big) \approx 1.9106 \approx 109.47^\circ.$$

Every pair of the four bond vectors has dot product $-1$, so every angle between two bonds is the same: this is the **tetrahedral angle**, about $109.5^\circ$, which chemistry predicts for the bonds of methane.

```check
Hs = [Matrix([1, 1, 1]), Matrix([1, -1, -1]), Matrix([-1, 1, -1]), Matrix([-1, -1, 1])]
same(Hs[0].dot(Hs[1]), -1); same(Hs[0].norm(), sqrt(3)); same(Hs[1].norm(), sqrt(3)); same(-1/(sqrt(3)*sqrt(3)), -Rational(1, 3))
holds(all(Hs[i_].dot(Hs[j_]) == -1 for i_ in range(4) for j_ in range(i_ + 1, 4)))
holds(all((Hs[i_] - Hs[j_]).norm() == 2*sqrt(2) for i_ in range(4) for j_ in range(i_ + 1, 4)))   # a regular tetrahedron
rounds(acos(-Rational(1, 3)), '1.9106'); rounds(acos(-Rational(1, 3))*180/pi, '109.47'); rounds(acos(-Rational(1, 3))*180/pi, '109.5')
```
:::

The formula $\cos\theta = \dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}\,\norm{\vb{b}}}$ makes sense for vectors with any number of components, and computing uses it all the time. Search engines and language models represent words and documents by vectors with hundreds of components, and the cosine of the angle between two such vectors, their **cosine similarity**, measures how alike they are: close to 1 for vectors pointing almost the same way, close to 0 for unrelated ones. Exercise 16.12 shows that the fraction always lies between $-1$ and 1, so that the angle exists.

### Projections {#projections}

Shine a light straight down onto the line of $\vb{a}$ (Figure 16.5, left): the shadow of $\vb{b}$ on that line is the part of $\vb{b}$ that points along $\vb{a}$. Its signed length, $\norm{\vb{b}}\cos\theta$, is the **scalar projection** of $\vb{b}$ onto $\vb{a}$, and the shadow itself is the **vector projection**. By Theorem 16.4, for $\vb{a} \ne \vb{0}$,

$$\operatorname{comp}_{\vb{a}}\vb{b} = \norm{\vb{b}}\cos\theta = \frac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}, \qquad \operatorname{proj}_{\vb{a}}\vb{b} = \frac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}}\cdot\frac{\vb{a}}{\norm{\vb{a}}} = \frac{\vb{a}\cdot\vb{b}}{\vb{a}\cdot\vb{a}}\,\vb{a},$$

read "the component of b along a" and "the projection of b onto a". The rest of $\vb{b}$ is orthogonal to $\vb{a}$:

$$\vb{a}\cdot\big(\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b}\big) = \vb{a}\cdot\vb{b} - \frac{\vb{a}\cdot\vb{b}}{\vb{a}\cdot\vb{a}}\,(\vb{a}\cdot\vb{a}) = 0.$$

So every vector $\vb{b}$ splits into a part along $\vb{a}$ and a part perpendicular to it, $\vb{b} = \operatorname{proj}_{\vb{a}}\vb{b} + \big(\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b}\big)$. Engineers split forces this way: the weight of a box on a ramp splits into a part along the ramp, which makes it slide, and a part pressing into the ramp.

```check
projv = lambda A_, B_: (A_.dot(B_)/A_.dot(A_))*A_
same(A3.dot(B3 - projv(A3, B3)), 0); same(projv(A3, B3) + (B3 - projv(A3, B3)), B3)
same((Ar.dot(Matrix(symbols('b1:4', real=True)))/Ar.norm())*(Ar/Ar.norm()), projv(Ar, Matrix(symbols('b1:4', real=True))))
```

::: example A projection
Find the scalar and vector projections of $\vb{b} = \langle 3, 4\rangle$ onto $\vb{a} = \langle 2, 1\rangle$, and split $\vb{b}$ into a part along $\vb{a}$ and a part perpendicular to it.

$\vb{a}\cdot\vb{b} = 6 + 4 = 10$ and $\vb{a}\cdot\vb{a} = 5$, so

$$\operatorname{comp}_{\vb{a}}\vb{b} = \frac{10}{\sqrt5} = 2\sqrt5 \approx 4.472, \qquad \operatorname{proj}_{\vb{a}}\vb{b} = \frac{10}{5}\,\vb{a} = \langle 4, 2\rangle.$$

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

With $\vb{F}$ in newtons and $\vb{D}$ in metres, $W$ is in newton-metres, called **joules** (J). A force at right angles to the motion does no work; a force against the motion does negative work. Module 12 computes the work done by a force that varies along a straight line, $W = \int_a^b F(x)\,dx$; Module 20 combines the two ideas, for a varying force along a curved path.

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
Left: projecting $\vb{b} = \langle 3, 4\rangle$ onto $\vb{a} = \langle 2, 1\rangle$ (Example 16.12). The dashed segment from the tip of $\vb{b}$ meets the line of $\vb{a}$ at a right angle; $\operatorname{proj}_{\vb{a}}\vb{b} = \langle 4, 2\rangle$ is the shadow of $\vb{b}$ on that line, and $\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b} = \langle -1, 2\rangle$ is perpendicular to $\vb{a}$. Right: the cross product (Section 16.6). $\vb{a} \times \vb{b}$ is perpendicular to both $\vb{a}$ and $\vb{b}$, its length is the area of the shaded parallelogram that they span, and its direction follows the right-hand rule: curl the fingers of your right hand from $\vb{a}$ towards $\vb{b}$, and your thumb points along $\vb{a} \times \vb{b}$.
:::

## The cross product {#cross}

Many questions in space need a vector perpendicular to two given vectors $\vb{a}$ and $\vb{b}$: the direction a plane faces, or the axis about which a force turns a spanner. Look for $\vb{n} = \langle n_1, n_2, n_3\rangle$ with $\vb{a}\cdot\vb{n} = 0$ and $\vb{b}\cdot\vb{n} = 0$:

$$a_1n_1 + a_2n_2 + a_3n_3 = 0, \qquad b_1n_1 + b_2n_2 + b_3n_3 = 0.$$

Multiply the first equation by $b_3$ and the second by $a_3$, and subtract: $n_3$ drops out, leaving $(a_1b_3 - a_3b_1)\,n_1 + (a_2b_3 - a_3b_2)\,n_2 = 0$. One solution is $n_1 = a_2b_3 - a_3b_2$ and $n_2 = a_3b_1 - a_1b_3$, and then $n_3 = a_1b_2 - a_2b_1$ satisfies both of the original equations (substitute and expand: every term cancels). This solution is the cross product.

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

read "a cross b". It is defined only for vectors in space.
:::

The formula is easier to remember as a determinant. A $2 \times 2$ **determinant** is $\begin{vmatrix} p & q \\ r & s \end{vmatrix} = ps - qr$, and each component of $\vb{a}\times\vb{b}$ is one of them. Arrange $\vb{i}$, $\vb{j}$, $\vb{k}$ and the components of $\vb{a}$ and $\vb{b}$ in three rows, and expand along the first row, covering up the row and the column of each entry in turn:

$$\vb{a}\times\vb{b} = \begin{vmatrix} \vb{i} & \vb{j} & \vb{k} \\ a_1 & a_2 & a_3 \\ b_1 & b_2 & b_3 \end{vmatrix} = \begin{vmatrix} a_2 & a_3 \\ b_2 & b_3 \end{vmatrix}\vb{i} - \begin{vmatrix} a_1 & a_3 \\ b_1 & b_3 \end{vmatrix}\vb{j} + \begin{vmatrix} a_1 & a_2 \\ b_1 & b_2 \end{vmatrix}\vb{k}.$$

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

(2) Expanding both sides and comparing the terms (which takes patience but no ideas) proves **Lagrange's identity**,

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

Theorem 16.5 fixes the line along which $\vb{a}\times\vb{b}$ points and its length, which leaves two opposite directions. Since $\vb{i}\times\vb{j} = \vb{k}$, the choice follows the right-hand rule that arranged the axes: if the fingers of your right hand curl from $\vb{a}$ towards $\vb{b}$, through the angle $\theta$, your thumb points along $\vb{a}\times\vb{b}$ (Figure 16.5, right). A proof needs more than this module has; the idea is that you can turn $\vb{a}$ and $\vb{b}$ gradually into $\vb{i}$ and $\vb{j}$ without ever making them parallel, and then $\vb{a}\times\vb{b}$ changes gradually, is never $\vb{0}$, and so never jumps to the opposite side. For the unit vectors,

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

$$\begin{aligned} \vb{a}\times\vb{b} &= \begin{vmatrix} \vb{i} & \vb{j} & \vb{k} \\ 2 & -1 & 2 \\ 1 & 3 & 0 \end{vmatrix} \\ &= \big((-1)\cdot0 - 2\cdot3\big)\vb{i} - \big(2\cdot0 - 2\cdot1\big)\vb{j} + \big(2\cdot3 - (-1)\cdot1\big)\vb{k} \\ &= -6\vb{i} + 2\vb{j} + 7\vb{k} = \langle -6, 2, 7\rangle. \end{aligned}$$

Check: $\langle 2, -1, 2\rangle\cdot\langle -6, 2, 7\rangle = -12 - 2 + 14 = 0$ and $\langle 1, 3, 0\rangle\cdot\langle -6, 2, 7\rangle = -6 + 6 + 0 = 0$. The area is $\norm{\vb{a}\times\vb{b}} = \sqrt{36 + 4 + 49} = \sqrt{89} \approx 9.434$. Lagrange's identity agrees: $\norm{\vb{a}}^2\norm{\vb{b}}^2 - (\vb{a}\cdot\vb{b})^2 = 9\cdot10 - (-1)^2 = 89$.

**(b)** The triangle is half of the parallelogram spanned by $\overrightarrow{PQ} = \langle 1, 2, -1\rangle$ and $\overrightarrow{PR} = \langle -1, 1, 2\rangle$. Their cross product is

$$\overrightarrow{PQ}\times\overrightarrow{PR} = \big\langle 2\cdot2 - (-1)\cdot1,\ (-1)(-1) - 1\cdot2,\ 1\cdot1 - 2\cdot(-1)\big\rangle = \langle 5, -1, 3\rangle,$$

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

**Torque.** A force $\vb{F}$ that acts at a point with position vector $\vb{r}$, measured from an axis, tends to turn the object about the axis; think of a spanner turning a bolt. The turning effect is measured by the **torque** $\boldsymbol{\tau} = \vb{r}\times\vb{F}$ ($\tau$ is the Greek letter tau). Its length, $\norm{\vb{r}}\,\norm{\vb{F}}\sin\theta$, grows with the length of the lever arm and is greatest when you push at right angles to the spanner; its direction, by the right-hand rule, is along the axis about which the force turns the object. For example, a force of 40 N applied 0.25 m from the bolt, at right angles to the spanner, gives a torque of length $0.25\cdot40 = 10$ newton-metres (N·m); at $60^\circ$ to the spanner, $10\sin 60^\circ = 5\sqrt3 \approx 8.66$ N·m.

```check
same(Rational(1, 4)*40*sin(pi/2), 10); steps(10*sin(pi/3), 5*sqrt(3)); rounds(5*sqrt(3), '8.66')
same(Matrix([Rational(1, 4), 0, 0]).cross(Matrix([0, 40, 0])), Matrix([0, 0, 10]))
```

**Only in space.** For vectors in the plane, write them as $\langle a_1, a_2, 0\rangle$ and $\langle b_1, b_2, 0\rangle$: their cross product is $\langle 0, 0, a_1b_2 - a_2b_1\rangle$, which points out of the plane. So $\abs{a_1b_2 - a_2b_1}$ is the area of the parallelogram that two vectors span in the plane, but the cross product itself is not a vector of the plane. In four or more dimensions, the directions perpendicular to two given vectors form a whole plane or more, so there is no single perpendicular direction to choose. Space, with three dimensions, is where two vectors determine one perpendicular line; that is why the cross product, unlike the dot product, belongs to three dimensions.

```check
same(Matrix([a1_, a2_, 0]).cross(Matrix([b1_, b2_, 0])), Matrix([0, 0, a1_*b2_ - a2_*b1_]))
same(Matrix([[3, 1], [1, 2]]).det(), 5); same(Matrix([3, 1, 0]).cross(Matrix([1, 2, 0])).norm(), 5)
w4 = Matrix(symbols('w1:5')); e1_, e2_ = Matrix([1, 0, 0, 0]), Matrix([0, 1, 0, 0])
sol4 = solve([e1_.dot(w4), e2_.dot(w4)], list(w4)); same(sol4, {w4[0]: 0, w4[1]: 0})   # in 4D, w3 and w4 stay free: a whole plane
```

## Lines and planes {#lines-planes}

### Lines {#lines}

A line in the plane is fixed by a point and a slope. In space a slope makes no sense (a slope in which plane?), so give a direction instead: a vector $\vb{v} \ne \vb{0}$ parallel to the line. Let $\vb{r}_0$ be the position vector of a point $P_0$ on the line. A point with position vector $\vb{r}$ lies on the line exactly when $\vb{r} - \vb{r}_0$ is parallel to $\vb{v}$ (or is $\vb{0}$), that is, when

$$\vb{r} = \vb{r}_0 + t\,\vb{v}$$

for some number $t$. This is a **vector equation** of the line. With $\vb{r} = \langle x, y, z\rangle$, $\vb{r}_0 = \langle x_0, y_0, z_0\rangle$ and $\vb{v} = \langle a, b, c\rangle$, comparing components gives **parametric equations**,

$$x = x_0 + at, \qquad y = y_0 + bt, \qquad z = z_0 + ct,$$

a parametric curve in space with parameter $t$: a point moving along the line with constant velocity $\vb{v}$. If $a$, $b$ and $c$ are all nonzero, solve each equation for $t$ and equate the results to get **symmetric equations**,

$$\frac{x - x_0}{a} = \frac{y - y_0}{b} = \frac{z - z_0}{c}.$$

::: example A line through two points
Find vector, parametric and symmetric equations of the line through $A(1, 2, 3)$ and $B(3, 3, 1)$. Where does it meet the $xy$-plane? Do $C(5, 4, -1)$ and $D(7, 5, -2)$ lie on it?

A direction is $\vb{v} = \overrightarrow{AB} = \langle 2, 1, -2\rangle$. With $P_0 = A$:

$$\vb{r} = \langle 1, 2, 3\rangle + t\langle 2, 1, -2\rangle; \qquad x = 1 + 2t,\ y = 2 + t,\ z = 3 - 2t; \qquad \frac{x - 1}{2} = \frac{y - 2}{1} = \frac{z - 3}{-2}.$$

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

$$a(x - x_0) + b(y - y_0) + c(z - z_0) = 0, \quad\text{or}\quad ax + by + cz = d, \quad\text{where } d = ax_0 + by_0 + cz_0.$$

Conversely, if $a$, $b$ and $c$ are not all 0, the solutions of $ax + by + cz = d$ form a plane with normal vector $\langle a, b, c\rangle$: pick one solution as $P_0$, and the equation says $\vb{n}\cdot(\vb{r} - \vb{r}_0) = 0$. So one linear equation in $x$, $y$ and $z$ describes a plane, not a line; a line in space needs parametric equations, or two linear equations (it is where two planes meet).

```check
xs_, ys_, zs_, x0_, y0_, z0_, aa_, bb_, cc_ = symbols('x y z x0 y0 z0 a b c')
same(Matrix([aa_, bb_, cc_]).dot(Matrix([xs_ - x0_, ys_ - y0_, zs_ - z0_])), aa_*(xs_ - x0_) + bb_*(ys_ - y0_) + cc_*(zs_ - z0_))
same(expand(aa_*(xs_ - x0_) + bb_*(ys_ - y0_) + cc_*(zs_ - z0_)), aa_*xs_ + bb_*ys_ + cc_*zs_ - (aa_*x0_ + bb_*y0_ + cc_*z0_))
```

::: example The plane through three points
Find an equation of the plane through $P(1, 0, 1)$, $Q(2, 2, 0)$ and $R(0, 1, 3)$.

The vectors $\overrightarrow{PQ}$ and $\overrightarrow{PR}$ lie in the plane, so their cross product is a normal vector. Example 16.15(b) found it: $\vb{n} = \langle 5, -1, 3\rangle$. The plane through $P$ with this normal is

$$5(x - 1) - (y - 0) + 3(z - 1) = 0, \quad\text{that is,}\quad 5x - y + 3z = 8.$$

Check with all three points: $5 - 0 + 3 = 8$, $10 - 2 + 0 = 8$ and $0 - 1 + 9 = 8$. Any nonzero multiple of $\vb{n}$ is also a normal vector: $10x - 2y + 6z = 16$ is the same plane.

```check
nP = (Qp - Pp).cross(Rp - Pp); same(nP, Matrix([5, -1, 3]))
same(expand(5*(x - 1) - (y - 0) + 3*(z - 1)), 5*x - y + 3*z - 8)
same([5*q_[0] - q_[1] + 3*q_[2] for q_ in (Pp, Qp, Rp)], [8, 8, 8])
same(solve(10*x - 2*y + 6*z - 16, x), solve(5*x - y + 3*z - 8, x))
```
:::

The angle between two planes is the angle between their normal vectors, and two planes are parallel when their normals are.

::: theorem Distance from a point to a plane
The distance from the point $P_1(x_1, y_1, z_1)$ to the plane $ax + by + cz = d$ is

$$D = \frac{\abs{ax_1 + by_1 + cz_1 - d}}{\sqrt{a^2 + b^2 + c^2}}.$$
:::

::: proof
Let $\vb{n} = \langle a, b, c\rangle$, let $P_0$ be any point of the plane, and let $F$ be the foot of the perpendicular from $P_1$, the point where the line through $P_1$ with direction $\vb{n}$ meets the plane. For every point $X$ of the plane, the triangle $P_1FX$ has a right angle at $F$, so $\abs{P_1X}^2 = \abs{P_1F}^2 + \abs{FX}^2 \ge \abs{P_1F}^2$: $F$ is the point of the plane nearest to $P_1$, and $D = \abs{P_1F}$. Now $\overrightarrow{P_0P_1} = \overrightarrow{P_0F} + \overrightarrow{FP_1}$, where $\overrightarrow{P_0F}$ lies in the plane, orthogonal to $\vb{n}$, and $\overrightarrow{FP_1}$ is parallel to $\vb{n}$. So $\overrightarrow{FP_1}$ is the vector projection of $\overrightarrow{P_0P_1}$ onto $\vb{n}$, and its length is the absolute value of the scalar projection:

$$D = \frac{\abs{\vb{n}\cdot\overrightarrow{P_0P_1}}}{\norm{\vb{n}}} = \frac{\abs{a(x_1 - x_0) + b(y_1 - y_0) + c(z_1 - z_0)}}{\sqrt{a^2 + b^2 + c^2}} = \frac{\abs{ax_1 + by_1 + cz_1 - d}}{\sqrt{a^2 + b^2 + c^2}},$$

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
Find the distances from $S(2, 3, 4)$ and from the origin to the plane $5x - y + 3z = 8$ of Example 16.17.

Here $\sqrt{a^2 + b^2 + c^2} = \sqrt{25 + 1 + 9} = \sqrt{35}$. For $S$,

$$D = \frac{\abs{5\cdot2 - 3 + 3\cdot4 - 8}}{\sqrt{35}} = \frac{11}{\sqrt{35}} \approx 1.859,$$

and for the origin, $D = \dfrac{\abs{0 - 8}}{\sqrt{35}} = \dfrac{8}{\sqrt{35}} \approx 1.352$.

```check
Dpl = lambda X_, Y_, Z_: Abs(5*X_ - Y_ + 3*Z_ - 8)/sqrt(25 + 1 + 9)
same(sqrt(25 + 1 + 9), sqrt(35)); same(Dpl(2, 3, 4), 11/sqrt(35)); rounds(11/sqrt(35), '1.859'); same(Dpl(0, 0, 0), 8/sqrt(35)); rounds(8/sqrt(35), '1.352')
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

The functions $f$, $g$ and $h$ are its **component functions**. As $t$ varies, the tip of $\vb{r}(t)$, drawn from the origin, traces a **space curve**. Limits are taken component by component: $\lim_{t\to a}\vb{r}(t) = \big\langle \lim_{t\to a} f(t), \lim_{t\to a} g(t), \lim_{t\to a} h(t)\big\rangle$ if the three limits exist, and $\vb{r}$ is **continuous** at $a$ if $f$, $g$ and $h$ are.
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

Geometrically, $\vb{r}(t + h) - \vb{r}(t)$ is the vector from one point of the curve to a nearby one, a secant; dividing by $h$ rescales it, and as $h \to 0$ its direction turns into the direction of the tangent line. So where $\vb{r}'(t) \ne \vb{0}$ it is a **tangent vector**, pointing the way the curve is traced. If $t$ is time, the derivatives have the names of Module 4's motion along a line ([Section 4.6](module_04_EN.html#motion)), now as vectors:

$$\text{velocity } \vb{v}(t) = \vb{r}'(t), \qquad \text{speed } \norm{\vb{v}(t)}, \qquad \text{acceleration } \vb{a}(t) = \vb{v}'(t) = \vb{r}''(t).$$

For a parametric curve in the plane, the velocity is the arrow $\langle x'(t), y'(t)\rangle$ of Section 16.2. Working one component at a time, the rules of Modules 4 and 5 carry over: $(\vb{u} + \vb{w})' = \vb{u}' + \vb{w}'$, $(c\,\vb{u})' = c\,\vb{u}'$, $(f\vb{u})' = f'\vb{u} + f\vb{u}'$ for a scalar function $f$, the chain rule $\big(\vb{u}(f(t))\big)' = f'(t)\,\vb{u}'\big(f(t)\big)$, and two product rules:

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

The speed is $\norm{\vb{v}(t)} = \sqrt{\sin^2 t + \cos^2 t + 1} = \sqrt2$, the same at every moment. The acceleration is horizontal, with length 1: it is $-\langle \cos t, \sin t, 0\rangle$, which points from the particle straight towards the axis of the helix. And $\vb{v}\cdot\vb{a} = \sin t\cos t - \sin t\cos t + 0 = 0$. That is no accident: the speed is constant, so $\vb{v}\cdot\vb{v}$ is constant, and its derivative $2\,\vb{v}\cdot\vb{a}$ is 0 (Exercise 16.11).

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

Throw a ball, kick a football or aim a jet of water from a hose. If air resistance is negligible, the only force is gravity, and the acceleration is constant: $g \approx 9.8$ m/s², straight down. Put the launch point at the origin, with $x$ horizontal and $y$ up, so that $\vb{a}(t) = \langle 0, -g\rangle$, and let the projectile leave with speed $v_0$ at the angle $\alpha$ above the horizontal (the Greek letter alpha), so that $\vb{v}(0) = \langle v_0\cos\alpha, v_0\sin\alpha\rangle$ and $\vb{r}(0) = \vb{0}$. Module 13 integrates $s'' = 9.8$ twice for a falling body; here the same is done for each component. Integrating $\vb{a}$, with the constant fixed by $\vb{v}(0)$, and then $\vb{v}$, with $\vb{r}(0) = \vb{0}$:

$$\begin{aligned} \vb{v}(t) &= \langle v_0\cos\alpha,\ v_0\sin\alpha - gt\rangle, \\ \vb{r}(t) &= \big\langle (v_0\cos\alpha)\,t,\ (v_0\sin\alpha)\,t - \tfrac12 gt^2\big\rangle. \end{aligned}$$

The horizontal velocity never changes; only the vertical velocity feels gravity. For $0 < \alpha < \pi/2$, eliminating $t = x/(v_0\cos\alpha)$ gives $y = (\tan\alpha)\,x - \dfrac{g}{2v_0^2\cos^2\alpha}\,x^2$: the path is a parabola.

```check
g_, v0_, al_ = symbols('g v_0 alpha', positive=True)
C1, C2 = symbols('C1 C2')
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

**The best angle.** Which angle gives the longest range? On $[0, \pi/2]$, $R(\alpha) = \dfrac{v_0^2}{g}\sin 2\alpha$ is continuous, so the closed interval method of Module 8 finds its largest value. Its derivative $R'(\alpha) = \dfrac{2v_0^2}{g}\cos 2\alpha$ is 0 only where $2\alpha = \pi/2$, at $\alpha = \pi/4$. Compare the values there and at the ends: $R(0) = R(\pi/2) = 0$ and $R(\pi/4) = v_0^2/g$. So the greatest range, $v_0^2/g$, comes at $45^\circ$: about 40.82 m for $v_0 = 20$ m/s. The table also shows a symmetry: since $\sin(\pi - 2\alpha) = \sin 2\alpha$, $R(\pi/2 - \alpha) = R(\alpha)$, and complementary angles such as $30^\circ$ and $60^\circ$ give the same range. The steeper throw goes higher and stays up longer, but moves forwards more slowly.

```check
Ra = v0_**2*sin(2*al_)/g_
same(diff(Ra, al_), 2*v0_**2*cos(2*al_)/g_); same(solveset(cos(2*x), x, Interval(0, pi/2)), FiniteSet(pi/4))
same([Ra.subs(al_, 0), Ra.subs(al_, pi/2), Ra.subs(al_, pi/4)], [0, 0, v0_**2/g_])
rounds(400/Rational(98, 10), '40.82'); same(sin(pi - 2*al_), sin(2*al_)); same(Ra.subs(al_, pi/2 - al_), Ra)
```

::: example A kicked ball
A ball is kicked from level ground at 20 m/s, at $30^\circ$ above the horizontal (the numbers are made up). Ignoring air resistance, find its velocity after 1 s, its flight time, range and greatest height, and its velocity when it lands.

With $v_0 = 20$, $\alpha = \pi/6$ and $g = 9.8$: $v_0\cos\alpha = 10\sqrt3$ and $v_0\sin\alpha = 10$, so $\vb{v}(t) = \big\langle 10\sqrt3, 10 - 9.8t\big\rangle$. After 1 s, $\vb{v}(1) = \big\langle 10\sqrt3, 0.2\big\rangle \approx \langle 17.32, 0.2\rangle$ m/s: the ball is still rising, but only just. Then

$$t_f = \frac{2\cdot10}{9.8} \approx 2.041\text{ s}, \qquad R = \frac{400\sin 60^\circ}{9.8} = \frac{200\sqrt3}{9.8} \approx 35.35\text{ m}, \qquad H = \frac{400\cdot\frac14}{2\cdot9.8} \approx 5.102\text{ m}.$$

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
The $45^\circ$ rule assumes that the projectile lands at the height from which it was launched, and that air resistance is negligible. Launched from above the ground, a projectile does best at a lower angle: a shot put released 2 m above the ground at 14 m/s (made-up numbers) goes furthest when launched at about $42^\circ$, not $45^\circ$. Air resistance shortens every range, and usually lowers the best angle too.

```check
import mpmath
mpmath.mp.dps = 30
Rh = lambda A: 14*mpmath.cos(A)/mpmath.mpf('9.8')*(14*mpmath.sin(A) + mpmath.sqrt((14*mpmath.sin(A))**2 + 2*mpmath.mpf('9.8')*2))
abest = mpmath.findroot(lambda A: mpmath.diff(Rh, A), 0.7)
rounds(abest*180/mpmath.pi, '42'); holds(Rh(abest) > Rh(mpmath.pi/4))
yh = 2 + 14*sin(al_)*t - Rational(49, 10)*t**2                       # height of the shot; it lands at the positive root
tl = [s_ for s_ in solve(yh, t) if s_.subs(al_, 1).is_positive][0]
near(N((14*cos(al_)*tl).subs(al_, Rational(7, 10)), 30), Rh(mpmath.mpf('0.7')), 1e-20)
```
:::

::: deeper Curvature
How sharply does a curve bend? Measure how fast its direction turns per unit of distance travelled: the **curvature** of a curve with unit tangent $\vb{T}$ is

$$\kappa = \Big\|\frac{d\vb{T}}{ds}\Big\| = \frac{\norm{\vb{T}'(t)}}{\norm{\vb{r}'(t)}},$$

where the second form uses the chain rule, $\vb{T}'(t) = \dfrac{d\vb{T}}{ds}\,\dfrac{ds}{dt}$, and $ds/dt = \norm{\vb{r}'(t)}$ ($\kappa$ is the Greek letter kappa). For a circle of radius $R$, $\vb{r}(t) = \langle R\cos t, R\sin t\rangle$: $\vb{r}'(t) = \langle -R\sin t, R\cos t\rangle$ has length $R$, so $\vb{T} = \langle -\sin t, \cos t\rangle$, $\vb{T}' = \langle -\cos t, -\sin t\rangle$ has length 1, and $\kappa = 1/R$. A small circle bends sharply and a large one gently; a straight line, whose $\vb{T}$ never changes, has curvature 0.

A formula without $\vb{T}$: $\kappa = \dfrac{\norm{\vb{r}'(t)\times\vb{r}''(t)}}{\norm{\vb{r}'(t)}^3}$. To prove it, write $s' = \norm{\vb{r}'}$, so that $\vb{r}' = s'\vb{T}$. By the product rule, $\vb{r}'' = s''\vb{T} + s'\vb{T}'$, and since $\vb{T}\times\vb{T} = \vb{0}$,

$$\vb{r}'\times\vb{r}'' = s's''\,(\vb{T}\times\vb{T}) + (s')^2\,(\vb{T}\times\vb{T}') = (s')^2\,(\vb{T}\times\vb{T}').$$

$\vb{T}$ has constant length 1, so $\vb{T}\cdot\vb{T}' = 0$ (Section 16.8): $\vb{T}$ and $\vb{T}'$ are orthogonal, and by Theorem 16.5, $\norm{\vb{T}\times\vb{T}'} = 1\cdot\norm{\vb{T}'}\cdot\sin\tfrac{\pi}{2} = \norm{\vb{T}'}$. So $\norm{\vb{r}'\times\vb{r}''} = (s')^2\,\norm{\vb{T}'} = (s')^3\kappa$. For the helix, $\vb{r}'\times\vb{r}'' = \langle -\sin t, \cos t, 1\rangle\times\langle -\cos t, -\sin t, 0\rangle = \langle \sin t, -\cos t, 1\rangle$, of length $\sqrt2$, and $\norm{\vb{r}'}^3 = 2\sqrt2$: $\kappa = \tfrac12$. The helix bends half as sharply as the unit circle it winds round; the climb straightens it.

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
v = sp.Matrix([v0*sp.cos(alpha), v0*sp.sin(alpha)]) + sp.integrate(sp.Matrix([0, -g]), (t, 0, t))
r = sp.integrate(v, (t, 0, t))
print(r.T)
t_f = sp.solve(r[1], t)
print(t_f)
R = sp.simplify(r[0].subs(t, t_f[0]))
print(R)
best = sp.solve(sp.diff(R, alpha), alpha)
print(best, R.subs(alpha, best[0]), sp.N(R.subs(alpha, best[0]), 6))
```

```output
Matrix([[20*t*cos(alpha), -49*t**2/10 + 20*t*sin(alpha)]])
[200*sin(alpha)/49]
2000*sin(2*alpha)/49
[pi/4, 3*pi/4] 2000/49 40.8163
```

`integrate` with the limits 0 and $t$ gives the antiderivative that is 0 at $t = 0$, so adding the starting velocity fixes the constant. The landing time is $t_f = \tfrac{200}{49}\sin\alpha$, which is $\tfrac{2v_0\sin\alpha}{g}$ with $v_0 = 20$ and $g = \tfrac{49}{5}$ (the root $t = 0$ is missing because `t` was declared positive), and the range is $R = \tfrac{2000}{49}\sin 2\alpha$. Setting $R'(\alpha) = 0$ gives two critical numbers, $\pi/4$ and $3\pi/4$, but only $\pi/4$ lies in $[0, \pi/2]$; there $R = \tfrac{2000}{49} \approx 40.82$ m, the table's best range. The same tools handle space curves. The length of one turn of the helix, and its curvature:

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
