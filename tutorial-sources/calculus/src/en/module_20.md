---
title: Vector calculus
part: 5
lead: Do calculus with vector fields, the arrows of wind, flowing water, gravity and electricity. You will integrate fields along curves and over surfaces, measure how a flow turns and spreads with curl and divergence, and meet Green's theorem, Stokes' theorem and the divergence theorem, which turn out to be the Fundamental Theorem of Calculus in new forms.
minutes: 270
needs: Modules 1 to 19, especially the Fundamental Theorem of Calculus (Module 10), vectors, the dot and cross products and vector functions (Module 16), partial derivatives and the gradient (Module 17) and double and triple integrals (Module 19)
goals:
  - Draw and read vector fields in the plane and in space, and recognise gradient fields
  - Compute line integrals of functions and of vector fields, and explain how they depend on the curve and its direction
  - Test whether a field is conservative, find a potential, and evaluate line integrals with the fundamental theorem for line integrals
  - State Green's theorem with its hypotheses, prove it for simple regions, and use it for circulation, flux and area
  - Compute curl, divergence, surface areas, surface integrals and flux, and explain what curl and divergence measure
  - State Stokes' theorem and the divergence theorem, check them on examples, and explain the one pattern behind all the fundamental theorems
---

## Vector fields {#fields}

A weather map shows the wind as arrows: at each place an arrow points the way the wind blows, and its length shows how fast. The velocity of the water in a river, the pull of the Earth's gravity and the electric field around a charged particle are of the same kind: each attaches a vector, a direction and a size, to every point of a region.

This last module integrates such fields along curves (the work done by a force along a path) and over surfaces (the rate at which a fluid flows through a net), and differentiates them, to measure how much a flow turns and how much it spreads out. Its main theorems, Green's theorem, Stokes' theorem and the divergence theorem, are the Fundamental Theorem of Calculus of Module 10 in new forms (Section 20.8).

::: definition Vector field
Let $D$ be a set of points in the plane. A **vector field** on $D$ is a function $\vb{F}$ that assigns to each point $(x, y)$ of $D$ a vector

$$\begin{aligned} \vb{F}(x, y) &= \big\langle P(x, y), Q(x, y)\big\rangle \\ &= P\,\vb{i} + Q\,\vb{j}. \end{aligned}$$

A vector field on a set $E$ of points in space assigns to each point $(x, y, z)$ of $E$ a vector $\vb{F}(x, y, z) = \langle P, Q, R\rangle$. The functions $P$, $Q$ and $R$, whose values are numbers, are the **components** of $\vb{F}$.
:::

$\vb{F}(x, y)$ reads "F of x, y". A function whose values are numbers, such as the temperature of a metal plate, is called a **scalar field** when it must be kept apart from vector fields. To draw a vector field, draw the arrow $\vb{F}(x, y)$ with its tail at $(x, y)$, for the points of a grid, all shortened by the same factor so that they do not overlap.

::: example Rotation and source
Describe the vector fields $\vb{F}(x, y) = \langle -y, x\rangle$ and $\vb{G}(x, y) = \langle x, y\rangle$.

Start with numbers:

| Point | $\vb{F} = \langle -y, x\rangle$ | $\vb{G} = \langle x, y\rangle$ |
|---|---|---|
| $(1, 0)$ | $\langle 0, 1\rangle$ | $\langle 1, 0\rangle$ |
| $(0, 1)$ | $\langle -1, 0\rangle$ | $\langle 0, 1\rangle$ |
| $(-1, 0)$ | $\langle 0, -1\rangle$ | $\langle -1, 0\rangle$ |
| $(0, -1)$ | $\langle 1, 0\rangle$ | $\langle 0, -1\rangle$ |
| $(2, 2)$ | $\langle -2, 2\rangle$ | $\langle 2, 2\rangle$ |

At $(1, 0)$, $\vb{F}$ points straight up; a quarter turn further round, at $(0, 1)$, it points left. In general $\vb{F}(x, y)\cdot\langle x, y\rangle = -yx + xy = 0$, so away from the origin $\vb{F}$ is perpendicular to the position vector $\langle x, y\rangle$: it is tangent to the circle through $(x, y)$ centred at the origin, and points anticlockwise round it. Its length, $\sqrt{y^2 + x^2}$, is the distance from the origin. So $\vb{F}$ is the velocity field of a wheel turning anticlockwise at one radian per second (Figure 20.1, left).

$\vb{G}$ points straight away from the origin, again with length equal to the distance from the origin. A flow with velocity $\vb{G}$ spreads out everywhere, since points further from the origin move outwards faster. This is an example of a **source** field. Its opposite, $-\vb{G} = \langle -x, -y\rangle$, gathers inwards and is an example of a **sink** field. Both fields are zero at the origin.

```check
F201 = lambda X, Y: Matrix([-Y, X]); G201 = lambda X, Y: Matrix([X, Y])
pts201 = [(1, 0), (0, 1), (-1, 0), (0, -1), (2, 2)]
same([F201(*p_) for p_ in pts201], [Matrix([0, 1]), Matrix([-1, 0]), Matrix([0, -1]), Matrix([1, 0]), Matrix([-2, 2])])
same([G201(*p_) for p_ in pts201], [Matrix(p_) for p_ in pts201])
same(F201(x, y).dot(Matrix([x, y])), 0)
xr, yr = symbols('x y', real=True)
same(F201(xr, yr).norm(), sqrt(xr**2 + yr**2)); same(G201(xr, yr).norm(), sqrt(xr**2 + yr**2))
```
:::

By Newton's law of gravitation, a point mass $M > 0$ at the origin pulls a mass $m > 0$ at position $\vb{r} = \langle x, y, z\rangle \ne \vb{0}$ with the force

$$\vb{F}(x, y, z) = -\frac{GMm}{\norm{\vb{r}}^3}\,\vb{r},$$

where $G$ is the gravitational constant. The force points towards the origin (the minus sign), and its length is $GMm/\norm{\vb{r}}^2$: twice as far away, a quarter of the pull. Such an **inverse square field** (Figure 20.1, middle) also gives the electric field of a charged particle, by Coulomb's law.

```check
Gc, Mc, mc = symbols('G M m', positive=True)
rv = Matrix([xr, yr, symbols('z', real=True)]); rn_ = sqrt(rv.dot(rv))
same(simplify((Gc*Mc*mc/rn_**3*rv).norm()), Gc*Mc*mc/rn_**2)
same((Gc*Mc*mc/rn_**2).subs({xr: 2*xr, yr: 2*yr, rv[2]: 2*rv[2]})/(Gc*Mc*mc/rn_**2), Rational(1, 4))
```

Module 17 met vector fields without the name: the gradient $\nabla f = \langle f_x, f_y\rangle$ of a differentiable function $f(x, y)$ is a vector field, the **gradient field** of $f$. Where $\nabla f$ is nonzero, it points in the direction in which $f$ increases fastest, and its length is that rate of increase. At a zero gradient all directional derivatives are zero. Along any differentiable level curve, the gradient is perpendicular to its tangent vector by the chain rule.

::: example A gradient field
Find the gradient field of $f(x, y) = x^2 + 2y^2$, and check at the point $(2, 1)$ that it is perpendicular to the level curve of $f$ through that point.

$\nabla f(x, y) = \langle 2x, 4y\rangle$, so $\nabla f(2, 1) = \langle 4, 4\rangle$. The level curve through $(2, 1)$ is the ellipse $x^2 + 2y^2 = 6$. Implicit differentiation ([Section 6.4](module_06_EN.html#implicit)) gives $2x + 4y\,y' = 0$, so its slope is $y' = -x/(2y)$, which is $-1$ at $(2, 1)$: the tangent line there has direction $\langle 1, -1\rangle$. Then $\langle 4, 4\rangle\cdot\langle 1, -1\rangle = 0$. For $c > 0$, the arrows cross the ellipses $x^2 + 2y^2 = c$ at right angles and point outwards, to larger values of $f$ (Figure 20.1, right).

```check
f202 = x**2 + 2*y**2
same(Matrix([diff(f202, x), diff(f202, y)]), Matrix([2*x, 4*y])); same(Matrix([2*x, 4*y]).subs({x: 2, y: 1}), Matrix([4, 4]))
same(f202.subs({x: 2, y: 1}), 6)
same(idiff(f202 - 6, y, x), -x/(2*y)); same((-x/(2*y)).subs({x: 2, y: 1}), -1)
same(Matrix([4, 4]).dot(Matrix([1, -1])), 0)
```
:::

::: figure id=fig-20-1
Three vector fields. Left: the rotation field $\langle -y, x\rangle$ of Example 20.1, tangent to circles about the origin and longer further out; the dashed circle is a flow line. Middle: an inverse square field pointing towards the origin, like gravity, with all arrows drawn the same length to show only their directions. The open circle marks where the field is undefined. Right: the gradient field of $f(x, y) = x^2 + 2y^2$ (Example 20.2), crossing the level curves of $f$ (orange ellipses) at right angles.
:::

In a steady flow with velocity field $\vb{F}$, a particle follows a **flow line** (or streamline): a curve $\vb{r}(t)$ whose velocity is the field at its position, $\vb{r}'(t) = \vb{F}\big(\vb{r}(t)\big)$. For the rotation field the origin is stationary and the other flow lines are circles. For $a > 0$, $\vb{r}(t) = \langle a\cos t, a\sin t\rangle$ has $\vb{r}'(t) = \langle -a\sin t, a\cos t\rangle$, which is $\vb{F}$ at $\vb{r}(t)$. Finding flow lines means solving differential equations, as with the direction fields of [Section 13.3](module_13_EN.html#direction-fields).

```check
rfl = Matrix([a*cos(t), a*sin(t)]); same(rfl.diff(t), F201(rfl[0], rfl[1]))
```

::: pitfall
A picture samples the field at grid points. Compare lengths only when the arrows share one scale, and take exact values from the formula. And keep vectors and numbers apart: $\vb{F}(2, 2) = \langle -2, 2\rangle$ is a vector, while its length $\norm{\vb{F}(2, 2)} = 2\sqrt2$ and the dot product $\vb{F}(2, 2)\cdot\vb{G}(2, 2) = 0$ are numbers.

```check
same(F201(2, 2).norm(), 2*sqrt(2)); same(F201(2, 2).dot(G201(2, 2)), 0)
```
:::

## Line integrals {#line-integrals}

A thin wire is bent into the upper half of the circle $x^2 + y^2 = 1$, with lengths in metres, and its density at the point $(x, y)$ is $\rho(x, y) = 1 + y$ kilograms per metre: it is heavier towards the top. What is its mass? Cut the wire into $n$ arcs of length $\pi/n$. On a short arc the density hardly changes, so the arc's mass is about the density at its midpoint times its length. The midpoint of the $i$th arc is at the angle $\theta_i = (i - \tfrac12)\pi/n$, at height $\sin\theta_i$, so the mass is about

```valuetable
n = 4, 16, 64, 256
$\sum_{i=1}^{n}\big(1 + \sin\theta_i\big)\dfrac{\pi}{n}$ = Sum((1 + sin((i - 1/2)*pi/n))*pi/n, (i, 1, n))
digits = 7
---
n | \sum_{i=1}^{n}\big(1 + \sin\theta_i\big)\dfrac{\pi}{n}
4 | 5.193937
16 | 5.144809
64 | 5.141793
256 | 5.141605
```

The sums settle down near 5.1416. Their limit is a new kind of integral, an integral along a curve.

A **smooth path** $C$ is traced by a function $\vb{r}(t)$, $a \le t \le b$, with $a < b$ and a continuous derivative that is nonzero for $a < t < b$. The velocity may vanish at an endpoint. A **piecewise smooth path** is made of finitely many such pieces joined end to end. The path records the direction and order of travel, so it can cross itself or retrace a segment. An integral counts each passage. A stationary piece contributes zero. In a short time $\Delta t$ the point $\vb{r}(t)$ moves about speed times time, $\norm{\vb{r}'(t)}\,\Delta t$, which gives the arc length $L = \int_a^b \norm{\vb{r}'(t)}\,dt$ of Module 16.

::: definition Line integral of a function
Let $C$ be a smooth curve traced by $\vb{r}(t)$, $a \le t \le b$, and let $f$ be a function that is continuous on $C$. The **line integral** of $f$ along $C$ is

$$\int_C f\,ds = \int_a^b f\big(\vb{r}(t)\big)\,\norm{\vb{r}'(t)}\,dt.$$

For a piecewise smooth curve, add the line integrals along its smooth pieces.
:::

$\int_C f\,ds$ reads "the integral of f along C, d s"; $ds = \norm{\vb{r}'(t)}\,dt$ stands for the length of a short piece of the curve, and sums of $f$ times such lengths, like those in the table, are Riemann sums (Module 9) of the integral on the right. With $f = 1$ the line integral is the length of $C$; with a density, the mass of a wire along $C$; and dividing by the length of $C$, when it is positive, gives the average of $f$ along $C$.

::: example The mass of a wire
Find the mass of the wire above, and the height of its centre of mass.

Trace the semicircle by $\vb{r}(t) = \langle\cos t, \sin t\rangle$, $0 \le t \le \pi$. Then $\vb{r}'(t) = \langle -\sin t, \cos t\rangle$ and $\norm{\vb{r}'(t)} = \sqrt{\sin^2 t + \cos^2 t} = 1$: the parameter $t$ is the arc length. On the wire $\rho = 1 + y = 1 + \sin t$, so

$$\begin{aligned} M &= \int_C (1 + y)\,ds = \int_0^\pi (1 + \sin t)\,dt \\ &= \big[t - \cos t\big]_0^\pi = \pi + 2 \approx 5.142 \text{ kg}, \end{aligned}$$

the number that the sums approached. By symmetry the centre of mass lies on the $y$-axis. Its height is the first moment in $y$ divided by the mass, as for a rod in [Section 12.7](module_12_EN.html#centre-of-mass), with $y\,\rho\,ds$ in place of $x\,\rho(x)\,dx$. With $\int_0^\pi \sin^2 t\,dt = \pi/2$ ([Exercise 10.12](module_10_EN.html#ex-10-12)),

$$\begin{aligned} \bar y &= \frac{1}{M}\int_C y(1 + y)\,ds \\ &= \frac{1}{M}\int_0^\pi \big(\sin t + \sin^2 t\big)\,dt \\ &= \frac{2 + \pi/2}{\pi + 2} \approx 0.694 \text{ m}. \end{aligned}$$

A uniform semicircular wire has its centre of mass at the height $\tfrac{1}{\pi}\int_0^\pi \sin t\,dt = 2/\pi \approx 0.637$ m; the heavier top lifts it.

```check
r203 = Matrix([cos(t), sin(t)])
same(r203.diff(t), Matrix([-sin(t), cos(t)])); same(sqrt(r203.diff(t).dot(r203.diff(t))), 1)
M203 = integrate(1 + sin(t), (t, 0, pi))
antideriv(t - cos(t), 1 + sin(t), t)
steps(Integral(1 + sin(t), (t, 0, pi)), (pi - cos(pi)) - (0 - cos(0)), pi + 2); rounds(M203, '5.142'); rounds(M203, '5.1416')
iS = symbols('i', integer=True)
near(Sum((1 + sin((iS - Rational(1, 2))*pi/256))*pi/256, (iS, 1, 256)).evalf(30), M203, 2e-5)   # the sums approach the mass
same(integrate(sin(t)**2, (t, 0, pi)), pi/2)
ybar203 = integrate(sin(t) + sin(t)**2, (t, 0, pi))/M203
same(ybar203, (2 + pi/2)/(pi + 2)); rounds(ybar203, '0.694')
same(integrate(sin(t), (t, 0, pi))/pi, 2/pi); rounds(2/pi, '0.637'); holds(ybar203 > 2/pi)
```
:::

The parameter does not matter. Trace the same wire twice as fast, with $\vb{r}(u) = \langle\cos 2u, \sin 2u\rangle$, $0 \le u \le \pi/2$: now the speed is $\norm{\vb{r}'(u)} = 2$, and $\int_0^{\pi/2} (1 + \sin 2u)\cdot 2\,du = \pi + 2$ again. Theorem 20.1 below explains why.

```check
r2u = Matrix([cos(2*u), sin(2*u)]); same(sqrt(simplify(r2u.diff(u).dot(r2u.diff(u)))), 2)
same(integrate((1 + sin(2*u))*2, (u, 0, pi/2)), pi + 2)
```

### Work {#work}

A constant force $\vb{F}$ that moves an object along a straight displacement $\vb{D}$ does the work $W = \vb{F}\cdot\vb{D}$ (Module 16), and [Section 12.6](module_12_EN.html#work) integrated a force that varies along a straight line. Now let the force vary from point to point and the path curve. From $t$ to $t + \Delta t$, an object moving along $\vb{r}(t)$ is displaced by about $\vb{r}'(t)\,\Delta t$, so the force does work of about $\vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,\Delta t$. Adding these, and letting $\Delta t \to 0$, gives an integral.

::: definition Line integral of a vector field
Let $C$ be a smooth curve traced by $\vb{r}(t)$, $a \le t \le b$, and let $\vb{F}$ be a vector field that is continuous on $C$. The **line integral** of $\vb{F}$ along $C$ is

$$\int_C \vb{F}\cdot d\vb{r} = \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt.$$

For a piecewise smooth path, add the integrals over its smooth pieces. If $\vb{F}$ is a force, this is the **work** it does on an object that moves along $C$.
:::

Read it as "the integral along C of F dot d r". Two other ways of writing it are common. With the unit tangent vector $\vb{T} = \vb{r}'/\norm{\vb{r}'}$ of Module 16, $\vb{F}\cdot\vb{r}'\,dt = (\vb{F}\cdot\vb{T})\,\norm{\vb{r}'}\,dt = (\vb{F}\cdot\vb{T})\,ds$, so

$$\int_C \vb{F}\cdot d\vb{r} = \int_C \vb{F}\cdot\vb{T}\,ds,$$

the line integral of the tangential component of $\vb{F}$: only the part of the force along the path does work. And in components, with $\vb{F} = \langle P, Q\rangle$ and $\vb{r}(t) = \langle x(t), y(t)\rangle$, the integrand is $P\,x'(t)\,dt + Q\,y'(t)\,dt$. Writing $dx = x'(t)\,dt$ and $dy = y'(t)\,dt$,

$$\int_C \vb{F}\cdot d\vb{r} = \int_C P\,dx + Q\,dy,$$

with $+\,R\,dz$ in space.

::: example Work along three paths
Find the work done by the force $\vb{F}(x, y) = \langle -y, x\rangle$ on an object that moves from $(0, 0)$ to $(1, 1)$ (a) along the line $y = x$, (b) along the parabola $y = x^2$, (c) along the $x$-axis to $(1, 0)$ and then straight up to $(1, 1)$.

**(a)** Take $\vb{r}(t) = \langle t, t\rangle$, $0 \le t \le 1$. Then $\vb{F}\big(\vb{r}(t)\big) = \langle -t, t\rangle$ and $\vb{r}'(t) = \langle 1, 1\rangle$, so $\vb{F}\cdot\vb{r}' = -t + t = 0$ and $W = 0$. The line is a radius of the circles that $\vb{F}$ follows, so the force is perpendicular to the motion all the way.

**(b)** Take $\vb{r}(t) = \langle t, t^2\rangle$. Then $\vb{F}\big(\vb{r}(t)\big) = \langle -t^2, t\rangle$ and $\vb{r}'(t) = \langle 1, 2t\rangle$, so

$$\begin{aligned} W &= \int_0^1 \big(-t^2 + 2t^2\big)\,dt \\ &= \int_0^1 t^2\,dt = \frac13. \end{aligned}$$

**(c)** Two smooth pieces. Along the $x$-axis, $\vb{r}(t) = \langle t, 0\rangle$: the force $\langle 0, t\rangle$ is perpendicular to $\vb{r}' = \langle 1, 0\rangle$, so it does no work. Up the line $x = 1$, $\vb{r}(t) = \langle 1, t\rangle$: the force is $\langle -t, 1\rangle$ and $\vb{r}' = \langle 0, 1\rangle$, so $\vb{F}\cdot\vb{r}' = 1$ and the work is $\int_0^1 1\,dt = 1$. In all, $W = 0 + 1 = 1$.

Three paths with the same ends give three different amounts of work, $0$, $\tfrac13$ and $1$ (Figure 20.2).

```check
def lint(F_, r_, a_, b_, var=t):
    """The line integral of the field F_ (a Matrix in x, y or x, y, z) along r_(var), a_ <= var <= b_."""
    r_ = Matrix(r_); sub_ = dict(zip((x, y, z), r_))
    return integrate(simplify(F_.subs(sub_, simultaneous=True).dot(r_.diff(var))), (var, a_, b_))
F204 = Matrix([-y, x])
paths204 = [Matrix([t, t]), Matrix([t, t**2]), Matrix([t, 0]), Matrix([1, t])]
same([path.diff(t) for path in paths204], [Matrix([1, 1]), Matrix([1, 2*t]), Matrix([1, 0]), Matrix([0, 1])])
same(F204.subs({x: t, y: t}), Matrix([-t, t])); same(Matrix([-t, t]).dot(Matrix([1, 1])), 0); same(lint(F204, [t, t], 0, 1), 0)
same(F204.subs({x: t, y: t**2}), Matrix([-t**2, t])); same(Matrix([-t**2, t]).dot(Matrix([1, 2*t])), t**2)
steps(Integral(-t**2 + 2*t**2, (t, 0, 1)), Integral(t**2, (t, 0, 1)), Rational(1, 3)); same(lint(F204, [t, t**2], 0, 1), Rational(1, 3))
same(F204.subs({x: t, y: 0}).dot(Matrix([1, 0])), 0); same(F204.subs({x: 1, y: t}), Matrix([-t, 1])); same(Matrix([-t, 1]).dot(Matrix([0, 1])), 1)
same(lint(F204, [t, 0], 0, 1) + lint(F204, [1, t], 0, 1), 1)
```
:::

::: figure id=fig-20-2
The force field $\langle -y, x\rangle$ of Example 20.4 and three paths from $(0, 0)$ to $(1, 1)$. Along the line $y = x$ (green) the force is perpendicular to the motion and does no work. Along the parabola $y = x^2$ (blue) it does work $\tfrac13$. Along the corner path (orange) it does no work on the bottom edge and work 1 on the right edge.
:::

### Direction and parametrisation {#direction}

Trace the parabola backwards, from $(1, 1)$ to $(0, 0)$: $\vb{r}(t) = \langle 1 - t, (1 - t)^2\rangle$, $0 \le t \le 1$. Now $\vb{r}'(t) = \langle -1, -2(1 - t)\rangle$ and $\vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t) = (1 - t)^2 - 2(1 - t)^2 = -(1 - t)^2$, so the work is $-\tfrac13$: going the other way, the force works against the motion wherever it helped before. Write $-C$ for the curve $C$ traced in the opposite direction.

```check
rb = Matrix([1 - t, (1 - t)**2]); same(rb.diff(t), Matrix([-1, -2*(1 - t)]))
same(F204.subs({x: rb[0], y: rb[1]}, simultaneous=True).dot(rb.diff(t)), -(1 - t)**2); same(lint(F204, rb, 0, 1), -Rational(1, 3))
```

::: theorem Parametrisation and direction
Let $C$ be a smooth curve traced by $\vb{r}(t)$, $a \le t \le b$. Let $g$ be a function on $[c, d]$ with a continuous derivative that is never 0, whose values fill $[a, b]$, and let $\tilde{\vb{r}}(u) = \vb{r}\big(g(u)\big)$, $c \le u \le d$. Then $\tilde{\vb{r}}$ traces the same curve, and for every continuous field $\vb{F}$ and function $f$ on $C$:

- if $g' > 0$, $\tilde{\vb{r}}$ traces $C$ in the same direction, and gives the same line integral of $\vb{F}$;
- if $g' < 0$, $\tilde{\vb{r}}$ traces $-C$, and $\displaystyle\int_{-C} \vb{F}\cdot d\vb{r} = -\int_C \vb{F}\cdot d\vb{r}$;
- in both cases it gives the same $\displaystyle\int_C f\,ds$: in particular $\displaystyle\int_{-C} f\,ds = \int_C f\,ds$.
:::

::: proof
By the chain rule, $\tilde{\vb{r}}'(u) = \vb{r}'\big(g(u)\big)\,g'(u)$. If $g' > 0$, then $g$ is increasing, with $g(c) = a$ and $g(d) = b$, and the substitution $t = g(u)$ (Theorem 10.7) gives

$$\begin{aligned} &\int_c^d \vb{F}\big(\vb{r}(g(u))\big)\cdot\vb{r}'\big(g(u)\big)\,g'(u)\,du \\ &\qquad= \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt. \end{aligned}$$

If $g' < 0$, then $g$ is decreasing, with $g(c) = b$ and $g(d) = a$, so the same substitution gives $\int_b^a$, which is $-\int_a^b$. For $\int_C f\,ds$, the speed is $\norm{\tilde{\vb{r}}'(u)} = \norm{\vb{r}'(g(u))}\,\abs{g'(u)}$. When $g' < 0$, $\abs{g'} = -g'$, and this second minus sign cancels the one that comes from reversing the limits.
:::

```check
gF = Function('g'); rF = Function('r')
same(diff(rF(gF(u)), u), Subs(Derivative(rF(t), t), t, gF(u))*Derivative(gF(u), u))
same(integrate((1 + sin(pi - u))*1, (u, 0, pi)), pi + 2)     # the wire traced backwards, t = pi - u
```

A change of speed that preserves the ordered traversal leaves either integral unchanged. Reversing the traversal also leaves the scalar integral unchanged, while it negates the work integral. Tracing the path twice would count both traversals.

::: pitfall
Two slips. **(1)** Leaving out the speed: $\int_C f\,ds$ is $\int_a^b f\big(\vb{r}(t)\big)\,\norm{\vb{r}'(t)}\,dt$, not $\int_a^b f\big(\vb{r}(t)\big)\,dt$. With $\langle\cos 2u, \sin 2u\rangle$, $0 \le u \le \pi/2$, forgetting the speed 2 gives the wire a mass of $(\pi + 2)/2$, half the truth. **(2)** Using the position instead of the velocity: in Example 20.4(b), the dot product of $\vb{F}$ with $\vb{r}(t) = \langle t, t^2\rangle$ instead of $\vb{r}'(t)$ gives $-t^3 + t^3 = 0$, and a wrong "work" of 0.

```check
same(integrate(1 + sin(2*u), (u, 0, pi/2)), (pi + 2)/2)
same(Matrix([-t**2, t]).dot(Matrix([t, t**2])), 0)
```
:::

::: compute Line integrals with SymPy
Store a field and a path as SymPy matrices; `.subs` puts the path into the field, `.diff(t)` differentiates the path, and `.dot` takes the dot product:

```python
import sympy as sp
x, y, t = sp.symbols('x y t')
F = sp.Matrix([-y, x])

def work(F, path, a, b):
    """The line integral of F along the path (x(t), y(t)), a <= t <= b."""
    r = sp.Matrix(path)
    on_path = F.subs({x: r[0], y: r[1]}, simultaneous=True)
    return sp.integrate(on_path.dot(r.diff(t)), (t, a, b))

print(work(F, [t, t], 0, 1), work(F, [t, t**2], 0, 1))
print(work(F, [t, 0], 0, 1) + work(F, [1, t], 0, 1))
print(work(F, [1 - t, (1 - t)**2], 0, 1))
```

```output
0 1/3
1
-1/3
```

These are the works of Example 20.4 along the line, the parabola and the corner path, and along the parabola backwards. For $\int_C f\,ds$, multiply by the speed instead; here is the mass of the wire of Example 20.3:

```python
r = sp.Matrix([sp.cos(t), sp.sin(t)])
speed = sp.sqrt(r.diff(t).dot(r.diff(t)))
print(speed, sp.simplify(speed))
M = sp.integrate((1 + r[1])*sp.simplify(speed), (t, 0, sp.pi))
print(M, sp.N(M, 4))
```

```output
sqrt(sin(t)**2 + cos(t)**2) 1
2 + pi 5.142
```

SymPy does not use $\sin^2 t + \cos^2 t = 1$ until `sp.simplify` asks it to. Finally, a picture: matplotlib's `quiver` draws an arrow with components `U`, `V` at each point `X`, `Y` of a grid.

```python
import numpy as np
import matplotlib.pyplot as plt
X, Y = np.meshgrid(np.linspace(-0.2, 1.2, 8), np.linspace(-0.2, 1.2, 8))
plt.quiver(X, Y, -Y, X, color='grey')            # the field <-y, x>
s = np.linspace(0, 1, 100)
plt.plot(s, s, s, s**2, [0, 1, 1], [0, 0, 1])   # the three paths
plt.gca().set_aspect('equal')
plt.show()
```

With an interactive matplotlib backend, the plot opens in a window and shows the field and the three paths, as in Figure 20.2.
:::

## Conservative fields {#conservative}

Work usually depends on the path, as Example 20.4 showed. For gravity near the ground it does not: lifting a book from the floor to a shelf takes the same work against gravity by any route. This section finds the fields with that property. For them a line integral is computed as in Module 10: find a function whose derivative is the integrand, and subtract its values at the ends.

::: theorem The fundamental theorem for line integrals
Let $C$ be a piecewise smooth curve traced by $\vb{r}(t)$, $a \le t \le b$, from the point $A = \vb{r}(a)$ to the point $B = \vb{r}(b)$. Let $f$ be a function of two or three variables that is differentiable, with a continuous gradient, on an open region that contains $C$. Then

$$\int_C \nabla f\cdot d\vb{r} = f(B) - f(A).$$
:::

::: proof
First let $C$ be smooth, and let $g(t) = f\big(\vb{r}(t)\big)$ be the value of $f$ at the moving point. By the chain rule of Module 17,

$$\begin{aligned} g'(t) &= f_x\,x'(t) + f_y\,y'(t) + f_z\,z'(t) \\ &= \nabla f\big(\vb{r}(t)\big)\cdot\vb{r}'(t) \end{aligned}$$

(without the last term in the plane), and this is continuous on $[a, b]$. By the net change theorem ([Theorem 10.5](module_10_EN.html#net-change-theorem)),

$$\begin{aligned} \int_C \nabla f\cdot d\vb{r} &= \int_a^b g'(t)\,dt = g(b) - g(a) \\ &= f(B) - f(A). \end{aligned}$$

If $C$ is made of smooth pieces from $A = A_0$ to $A_1$, from $A_1$ to $A_2$, and so on to $A_n = B$, add the results for the pieces: the sum $\big(f(A_1) - f(A_0)\big) + \dots + \big(f(A_n) - f(A_{n-1})\big)$ telescopes to $f(B) - f(A)$.
:::

```check
grad3 = lambda f_: Matrix([diff(f_, w_) for w_ in (x, y, z)])
fT = x**2*y + y*z**2; rT = Matrix([cos(t), sin(t), t])                     # an instance, along a helix
onT = lambda e_: e_.subs({x: rT[0], y: rT[1], z: rT[2]}, simultaneous=True)
same(diff(onT(fT), t), onT(grad3(fT)).dot(rT.diff(t)))                     # g'(t) = grad f(r(t)) . r'(t)
same(lint(grad3(fT), rT, 0, pi/2), fT.subs({x: 0, y: 1, z: pi/2}) - fT.subs({x: 1, y: 0, z: 0}))
same(lint(grad3(fT), rT, 0, pi/2), pi**2/4)
```

::: definition Conservative field and potential
A vector field $\vb{F}$ on an open region $D$ is **conservative** if $\vb{F} = \nabla f$ for a differentiable function $f$ on $D$. Such an $f$ is a **potential function**, or **potential**, of $\vb{F}$.
:::

As with antiderivatives, $f + K$ is a potential too, for every constant $K$. For a continuous field on an open connected region (defined below), there are no others: if $\nabla f = \nabla g$, Theorem 20.2 for $h = f - g$ gives $h(B) - h(A) = \int_C \vb{0}\cdot d\vb{r} = 0$ for any two points joined by a curve $C$.

By Theorem 20.2, the line integral of a continuous conservative field $\vb{F} = \nabla f$ depends only on the ends of the curve: it is **independent of the path**. In particular, along a **closed curve**, one that ends where it starts, $B = A$ and the line integral is 0. A circle on the integral sign marks a closed curve: $\oint_C \vb{F}\cdot d\vb{r}$ reads "the integral of F dot d r round C".

::: example Gravity is conservative
Show that the gravitational field $\vb{F} = -GMm\,\vb{r}/\norm{\vb{r}}^3$ is the gradient of $f = GMm/\norm{\vb{r}}$ on space without the origin, and find the work that gravity does on the body of mass $m$ as it moves from distance $r_1$ to distance $r_2$ from the origin, along any path that avoids the origin.

Write $1/\norm{\vb{r}} = (x^2 + y^2 + z^2)^{-1/2}$. By the chain rule,

$$\begin{aligned} &\frac{\partial}{\partial x}\,(x^2 + y^2 + z^2)^{-1/2} \\ &\quad= -\tfrac12(x^2 + y^2 + z^2)^{-3/2}\cdot 2x \\ &\quad= -\frac{x}{\norm{\vb{r}}^3}, \end{aligned}$$

and in the same way for $y$ and $z$. So $\nabla\big(1/\norm{\vb{r}}\big) = -\vb{r}/\norm{\vb{r}}^3$, and $\nabla f = \vb{F}$. The value of $f$ depends only on the distance from the origin, so by Theorem 20.2 the work is

$$\begin{aligned} W &= f(B) - f(A) \\ &= GMm\Big(\frac{1}{r_2} - \frac{1}{r_1}\Big), \end{aligned}$$

whatever the path: positive when the body falls closer ($r_2 < r_1$), negative when it climbs away. Physicists call $U = -f = -GMm/\norm{\vb{r}}$ the **potential energy**, so the work done by gravity is the drop $U(A) - U(B)$. When gravity is the only force, this work is also the gain in kinetic energy. The sum of kinetic and potential energies stays constant, hence the name "conservative".

```check
rnorm = sqrt(x**2 + y**2 + z**2)
same(diff((x**2 + y**2 + z**2)**Rational(-1, 2), x), -x/rnorm**3)
fgrav = Gc*Mc*mc/rnorm
same(grad3(fgrav), -Gc*Mc*mc*Matrix([x, y, z])/rnorm**3)
r1, r2 = symbols('r_1 r_2', positive=True)
same(fgrav.subs({x: r2, y: 0, z: 0}) - fgrav.subs({x: r1, y: 0, z: 0}), Gc*Mc*mc*(1/r2 - 1/r1))
holds((1/r2 - 1/r1).subs({r1: 2, r2: 1}) > 0); holds((1/r2 - 1/r1).subs({r1: 1, r2: 2}) < 0)
```
:::

A region $D$, in the plane or in space, is **open** if around each of its points there is a disc (a ball, in space) that lies in $D$, and **connected** if any two of its points can be joined by a piecewise smooth curve in $D$.

::: theorem Conservative fields and closed curves
Let $\vb{F}$ be a continuous vector field on an open connected region $D$. These three statements are equivalent: each implies the other two.

1. $\vb{F}$ is conservative on $D$.
2. $\int_C \vb{F}\cdot d\vb{r}$ depends only on the ends of $C$, for piecewise smooth curves $C$ in $D$.
3. $\oint_C \vb{F}\cdot d\vb{r} = 0$ for every piecewise smooth closed curve $C$ in $D$.
:::

::: proof
**1 ⇒ 2** is Theorem 20.2. **2 ⇒ 3:** split a closed curve $C$ at two of its points $A$ and $B$ into $C_1$, from $A$ to $B$, and $C_2$, from $B$ back to $A$. Both $C_1$ and $-C_2$ run from $A$ to $B$, so by 2, $\int_{C_1} = \int_{-C_2} = -\int_{C_2}$, and $\oint_C = \int_{C_1} + \int_{C_2} = 0$. **3 ⇒ 2:** if $C_1$ and $C_2$ both run from $A$ to $B$, then $C_1$ followed by $-C_2$ is a closed curve, so $0 = \int_{C_1} - \int_{C_2}$.

**2 ⇒ 1** (in the plane). Fix a point $A$ of $D$. For each point $(x, y)$ of $D$, let $f(x, y) = \int_C \vb{F}\cdot d\vb{r}$ along any piecewise smooth curve $C$ in $D$ from $A$ to $(x, y)$; there is one, because $D$ is connected, and by 2 the value does not depend on the choice. Since $D$ is open, it contains a short horizontal segment through $(x, y)$, from a point $(x_1, y)$ with $x_1 < x$ to a point on the right of $(x, y)$. For each point $(x', y)$ of this segment, choose $C$ to run from $A$ to $(x_1, y)$ and then along the segment to $(x', y)$; on the segment $y$ is constant, so $dy = 0$, and

$$f(x', y) = f(x_1, y) + \int_{x_1}^{x'} P(s, y)\,ds.$$

The first term does not depend on $x'$, so Part 1 of the Fundamental Theorem ([Section 10.4](module_10_EN.html#ftc1)) gives $f_x(x, y) = P(x, y)$. A short vertical segment gives $f_y = Q$ in the same way. In space, a third segment gives $f_z = R$. These partial derivatives are continuous because $\vb{F}$ is continuous, so $f$ is differentiable by Module 17 and $\nabla f = \vb{F}$.
:::

```check
Ps = Function('P')
same(diff(Integral(Ps(s, y), (s, symbols('x_1'), x)), x), Ps(x, y))
```

### A test for conservative fields {#test}

How can you tell whether $\vb{F} = \langle P, Q\rangle$ is conservative without finding a potential? If $\vb{F} = \nabla f$, then $P = f_x$ and $Q = f_y$, and Clairaut's theorem (Module 17) says that the mixed partial derivatives of $f$ agree.

::: theorem A condition for conservative fields
If $\vb{F} = \langle P, Q\rangle$ is conservative on an open region $D$, and $P$ and $Q$ have continuous first partial derivatives on $D$, then

$$\frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x} \quad\text{throughout } D.$$
:::

::: proof
Let $\vb{F} = \nabla f$, so $P = f_x$ and $Q = f_y$. Then $f_{xy} = P_y$ and $f_{yx} = Q_x$ are continuous on $D$, and Clairaut's theorem gives $f_{xy} = f_{yx}$, that is, $P_y = Q_x$.
:::

So the rotation field $\langle -y, x\rangle$, with $P_y = -1$ and $Q_x = 1$, is not conservative, as Example 20.4 found: the work from $(0, 0)$ to $(1, 1)$ depended on the path. Does the converse hold? Not always.

```check
same(diff(-y, y), -1); same(diff(x, x), 1)
```

::: example A field with a hole
Let $\vb{F}(x, y) = \Big\langle \dfrac{-y}{x^2 + y^2}, \dfrac{x}{x^2 + y^2}\Big\rangle$, on the plane without the origin.

- (a) Show that $\partial P/\partial y = \partial Q/\partial x$ wherever $\vb{F}$ is defined.
- (b) Find $\oint_C \vb{F}\cdot d\vb{r}$, where $C$ is the unit circle, traced once anticlockwise.
- (c) Is $\vb{F}$ conservative?

**(a)** By the quotient rule,

$$\begin{aligned} \frac{\partial P}{\partial y} &= \frac{-(x^2 + y^2) + y\cdot 2y}{(x^2 + y^2)^2} \\ &= \frac{y^2 - x^2}{(x^2 + y^2)^2}, \\ \frac{\partial Q}{\partial x} &= \frac{(x^2 + y^2) - x\cdot 2x}{(x^2 + y^2)^2} \\ &= \frac{y^2 - x^2}{(x^2 + y^2)^2}. \end{aligned}$$

**(b)** Take $\vb{r}(t) = \langle\cos t, \sin t\rangle$, $0 \le t \le 2\pi$. On $C$, $x^2 + y^2 = 1$, so $\vb{F}\big(\vb{r}(t)\big) = \langle -\sin t, \cos t\rangle$, which is $\vb{r}'(t)$. So $\vb{F}\cdot\vb{r}' = \sin^2 t + \cos^2 t = 1$, and $\oint_C \vb{F}\cdot d\vb{r} = 2\pi$.

**(c)** No. By Theorem 20.3, a conservative field has line integral 0 round every closed curve, and this one has $2\pi$ round $C$, although $P_y = Q_x$ everywhere. On the right half-plane $x > 0$, though, $\vb{F}$ is the gradient of $\theta(x, y) = \arctan(y/x)$, the polar angle of Module 16 (differentiate to check). Going once round the origin increases the polar angle by $2\pi$: that is the $2\pi$ of (b). On the whole plane without the origin there is no potential, because the angle cannot be defined continuously all the way round: somewhere it must jump by $2\pi$.

```check
P206, Q206 = -y/(x**2 + y**2), x/(x**2 + y**2)
same(diff(P206, y), (y**2 - x**2)/(x**2 + y**2)**2); same(diff(Q206, x), (y**2 - x**2)/(x**2 + y**2)**2)
rc206 = Matrix([cos(t), sin(t)]); Fr206 = Matrix([P206, Q206]).subs({x: cos(t), y: sin(t)}, simultaneous=True)
same(Fr206, Matrix([-sin(t), cos(t)])); same(Fr206, rc206.diff(t)); same(Fr206.dot(rc206.diff(t)), 1)
same(lint(Matrix([P206, Q206]), rc206, 0, 2*pi), 2*pi)
xpos = symbols('x', positive=True)
same(diff(atan(y/xpos), xpos), P206.subs(x, xpos)); same(diff(atan(y/xpos), y), Q206.subs(x, xpos))
```
:::

What went wrong is a hole. The unit circle lies where $\vb{F}$ is defined, but it goes round a point, the origin, where $\vb{F}$ is not defined.

::: definition Simply connected region
A **simple** curve has no repeated points, apart from the common start and end allowed for a simple closed curve. A region $D$ of the plane is **simply connected** if it is connected and every simple closed curve in $D$ encloses only points of $D$.
:::

Informally, a simply connected region has no holes. A disc, a half-plane, the whole plane and the inside of any simple closed curve are simply connected; a ring between two circles, and the plane without the origin, are not.

::: theorem A test for conservative fields
Let $P$ and $Q$ have continuous first partial derivatives on an open, simply connected region $D$ of the plane, with

$$\frac{\partial P}{\partial y} = \frac{\partial Q}{\partial x} \quad\text{throughout } D.$$

Then $\vb{F} = \langle P, Q\rangle$ is conservative on $D$.
:::

Section 20.4 shows why, with Green's theorem. Example 20.6 shows that "simply connected" cannot be left out.

::: pitfall
$P_y = Q_x$ on its own does not make a field conservative: check also that the region where $P$ and $Q$ have continuous partial derivatives is simply connected (Example 20.6). And compare the right derivatives, each component differentiated with respect to the other variable: for the rotation field $\langle -y, x\rangle$, $P_x = 0 = Q_y$, but $P_y = -1 \ne 1 = Q_x$, and the field is not conservative.
:::

### Finding a potential {#potential}

When the test says yes, find $f$ by undoing the partial derivatives one variable at a time.

::: example Finding a potential
Let $\vb{F}(x, y) = \big\langle y\cos x + 2xe^y,\ \sin x + x^2e^y + 2y\big\rangle$.

- (a) Show that $\vb{F}$ is conservative on the plane.
- (b) Find a potential $f$.
- (c) Find the work done by $\vb{F}$ along the curve $\vb{r}(t) = \langle \pi t/2, t^2\rangle$, $0 \le t \le 1$.

**(a)** $P_y = \cos x + 2xe^y$ and $Q_x = \cos x + 2xe^y$ are equal and continuous on the whole plane, which is simply connected, so by Theorem 20.5 $\vb{F}$ is conservative.

**(b)** Since $f_x = P$, $f$ is an antiderivative of $P$ with respect to $x$, with $y$ held fixed:

$$f(x, y) = y\sin x + x^2e^y + g(y).$$

The "constant" of integration may depend on $y$, because $y$ was held fixed. Now differentiate with respect to $y$ and compare with $Q$:

$$\begin{aligned} f_y &= \sin x + x^2e^y + g'(y) \\ &= \sin x + x^2e^y + 2y, \end{aligned}$$

so $g'(y) = 2y$ and $g(y) = y^2 + K$. With $K = 0$,

$$f(x, y) = y\sin x + x^2e^y + y^2.$$

Check: $\nabla f = \vb{F}$.

**(c)** The curve runs from $\vb{r}(0) = (0, 0)$ to $\vb{r}(1) = (\pi/2, 1)$. By Theorem 20.2, without integrating along the curve,

$$\begin{aligned} W &= f\big(\tfrac{\pi}{2}, 1\big) - f(0, 0) \\ &= 1 + \frac{\pi^2}{4}e + 1 - 0 \\ &= 2 + \frac{\pi^2 e}{4} \approx 8.707. \end{aligned}$$

Every other path from $(0, 0)$ to $(\pi/2, 1)$ gives the same work.

```check
P207 = y*cos(x) + 2*x*exp(y); Q207 = sin(x) + x**2*exp(y) + 2*y
same(diff(P207, y), cos(x) + 2*x*exp(y)); same(diff(Q207, x), cos(x) + 2*x*exp(y))
antideriv(y*sin(x) + x**2*exp(y), P207, x)
same(diff(y*sin(x) + x**2*exp(y), y), sin(x) + x**2*exp(y)); same(Q207 - (sin(x) + x**2*exp(y)), 2*y); antideriv(y**2, 2*y, y)
f207 = y*sin(x) + x**2*exp(y) + y**2
same(Matrix([diff(f207, x), diff(f207, y)]), Matrix([P207, Q207]))
r207 = Matrix([pi*t/2, t**2]); same(r207.subs(t, 0), Matrix([0, 0])); same(r207.subs(t, 1), Matrix([pi/2, 1]))
same(f207.subs({x: pi/2, y: 1}), 1 + pi**2*E/4 + 1); same(f207.subs({x: 0, y: 0}), 0)
W207 = f207.subs({x: pi/2, y: 1}) - f207.subs({x: 0, y: 0})
same(W207, 2 + pi**2*E/4); rounds(W207, '8.707')
near(Integral(Matrix([P207, Q207]).subs({x: r207[0], y: r207[1]}, simultaneous=True).dot(r207.diff(t)), (t, 0, 1)).evalf(30), W207, 1e-20)
```
:::

::: pitfall
Two slips. **(1)** Writing a plain constant $C$ for the "constant" of integration with respect to $x$: it may depend on $y$, and here a plain constant would lose the term $y^2$. **(2)** Integrating $P$ with respect to $x$ and $Q$ with respect to $y$ and adding the results: that counts the terms they share, $y\sin x + x^2e^y$, twice, and the gradient of the sum is not $\vb{F}$. Check a potential by computing its gradient.

```check
wrong207 = (y*sin(x) + x**2*exp(y)) + (y*sin(x) + x**2*exp(y) + y**2)
same(diff(wrong207, x), 2*P207); holds(Ne(diff(wrong207, x).subs({x: 0, y: 1}), P207.subs({x: 0, y: 1})))
```
:::

## Green's theorem {#green}

The parabola and the line of Example 20.4 together make a closed curve: out along the parabola from $(0, 0)$ to $(1, 1)$, and back along the line. Round it, the rotation field $\langle -y, x\rangle$ does work $\tfrac13$ on the way out and $0$ on the way back: $\tfrac13$ in all. The region between the two curves has area $\int_0^1 (x - x^2)\,dx = \tfrac16$, and for this field $\partial Q/\partial x - \partial P/\partial y = 1 - (-1) = 2$ everywhere. And $\tfrac13 = 2 \times \tfrac16$. This is no coincidence.

```check
same(lint(F204, [t, t**2], 0, 1) - lint(F204, [t, t], 0, 1), Rational(1, 3))
same(integrate(x - x**2, (x, 0, 1)), Rational(1, 6)); same(diff(x, x) - diff(-y, y), 2); same(2*Rational(1, 6), Rational(1, 3))
```

Here is the idea. Take a small square with lower left corner $(x, y)$ and side $h > 0$. The anticlockwise traversal goes up on the right and down on the left, so the vertical sides together contribute

$$\int_y^{y+h} \big[Q(x+h,v)-Q(x,v)\big]\,dv.$$

If the first partial derivatives are continuous, the bracket divided by $h$ is close to $Q_x(x,y)$ throughout this short interval, by the Mean Value Theorem. The contribution is therefore about $Q_x(x,y)h^2$. The traversal goes right on the bottom and left on the top, so the horizontal sides contribute about $-P_y(x,y)h^2$ by the same argument. Thus the circulation is approximately $(Q_x-P_y)h^2$, with an error small compared with $h^2$.

For a region made of small squares (Figure 20.3), add these circulations. A shared edge is traced twice in opposite directions, so its contributions cancel. Only the boundary integral remains. The sum of $(Q_x-P_y)$ times the square areas approximates the double integral of $Q_x-P_y$ over the region.

::: figure id=fig-20-3
Left: a region $D$ and its boundary $C$, traced anticlockwise, so that $D$ is on the left; at one point, the unit tangent $\vb{T}$ and the outward unit normal $\vb{n}$. Right: the same idea in small squares, each traced anticlockwise. On every inner edge two arrows point in opposite directions (grey), so their line integrals cancel; only the outer boundary (blue) is left.
:::

A simple closed curve $C$ in the plane is **positively oriented** if it is traced anticlockwise, that is, so that the region it encloses is on your left as you walk along it.

::: theorem Green's theorem
Let $C$ be a positively oriented, piecewise smooth, simple closed curve in the plane, and let $D$ be the region made of $C$ and the points it encloses. If $P$ and $Q$ have continuous first partial derivatives on an open region that contains $D$, then

$$\begin{aligned} &\oint_C P\,dx + Q\,dy \\ &\quad= \iint_D \Big(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\Big)\,dA. \end{aligned}$$
:::

The proof below is for regions that Module 19 calls both type I and type II, such as discs, triangles and the region between the parabola and the line.

::: proof of Green's theorem for a region of type I and type II
It is enough to prove

$$\begin{aligned} \oint_C P\,dx &= -\iint_D \frac{\partial P}{\partial y}\,dA \quad\text{and} \\ \oint_C Q\,dy &= \iint_D \frac{\partial Q}{\partial x}\,dA, \end{aligned}$$

and add. For the first, describe $D$ as a type I region: $a \le x \le b$ and $g_1(x) \le y \le g_2(x)$. By Fubini's theorem (Module 19), and then Part 2 of the Fundamental Theorem in $y$, with $x$ held fixed,

$$\begin{aligned} \iint_D \frac{\partial P}{\partial y}\,dA &= \int_a^b \int_{g_1(x)}^{g_2(x)} \frac{\partial P}{\partial y}\,dy\,dx \\ &= \int_a^b \Big[P\big(x, g_2(x)\big) \\ &\qquad\quad - P\big(x, g_1(x)\big)\Big]\,dx. \end{aligned}$$

Now go round $C$ anticlockwise in four parts, some of which may be single points. Along the bottom, $x$ runs from $a$ to $b$ and $y=g_1(x)$. Using a piecewise smooth parametrisation of this arc and substituting its $x$-coordinate into the integral gives $\int P\,dx = \int_a^b P\big(x, g_1(x)\big)\,dx$. This only requires $g_1$ to be continuous, so it also works for an arc with a vertical tangent at an endpoint. Up the right side, $x = b$ does not change, so $dx = 0$ and $\int P\,dx = 0$. Along the top, the graph of $g_2$ traced from $x = b$ back to $x = a$, $\int P\,dx = -\int_a^b P\big(x, g_2(x)\big)\,dx$. Down the left side, $dx = 0$ again. Adding the four parts,

$$\begin{aligned} \oint_C P\,dx &= \int_a^b \Big[P\big(x, g_1(x)\big) \\ &\qquad\quad - P\big(x, g_2(x)\big)\Big]\,dx \\ &= -\iint_D \frac{\partial P}{\partial y}\,dA. \end{aligned}$$

For the second formula, describe $D$ as a type II region, $c \le y \le d$ and $h_1(y) \le x \le h_2(y)$. In the same way, $\iint_D Q_x\,dA = \int_c^d \big[Q\big(h_2(y), y\big) - Q\big(h_1(y), y\big)\big]\,dy$. Going round $C$ anticlockwise traces the right edge $x = h_2(y)$ upwards and the left edge $x = h_1(y)$ downwards, while on the horizontal parts $dy = 0$, so $\oint_C Q\,dy$ is the same integral.
:::

```check
Pf_, g1_, g2_ = Function('P'), Function('g_1'), Function('g_2')
same(integrate(diff(Pf_(x, y), y), (y, g1_(x), g2_(x))), Pf_(x, g2_(x)) - Pf_(x, g1_(x)))
Qf_, h1_, h2_ = Function('Q'), Function('h_1'), Function('h_2')
same(integrate(diff(Qf_(x, y), x), (x, h1_(y), h2_(y))), Qf_(h2_(y), y) - Qf_(h1_(y), y))
# an instance: P = x*y**2 + y, Q = x**3 on the region between y = x**2 and y = x, edge by edge
P_i, Q_i = x*y**2 + y, x**3
bottom_ = lint(Matrix([P_i, Q_i]), [t, t**2], 0, 1); top_ = lint(Matrix([P_i, Q_i]), [1 - t, 1 - t], 0, 1)
same(bottom_ + top_, integrate(diff(Q_i, x) - diff(P_i, y), (y, x**2, x), (x, 0, 1)))
```

**Other regions.** Green's theorem holds as stated for every region bounded by a piecewise smooth simple closed curve, but the general proof is beyond this series. A region that can be cut into finitely many pieces of type I and type II follows by applying the proof to each piece and adding: each cut is traced twice, once in each direction, so the line integrals along the cuts cancel, as in Figure 20.3. The same cancellation gives Green's theorem for a region with holes, when every boundary curve is traced with $D$ on its left: the outer curve anticlockwise and the inner ones clockwise.

**Why the test of Section 20.3 works.** Let $D$ be open and simply connected, with $P_y = Q_x$ throughout $D$. A simple closed curve $C$ in $D$ encloses a region $R$ that lies in $D$, since $D$ has no holes, and Green's theorem gives $\oint_C \vb{F}\cdot d\vb{r} = \pm\iint_R (Q_x - P_y)\,dA = 0$ (the sign set by the direction of $C$). To include closed paths that cross or retrace themselves, first consider a closed polygonal walk in $D$. Split its edges at crossings and at the endpoints of any overlaps. The walk can be split at repeated vertices into simple polygonal loops and pairs of edges traced there and back. The loops give 0 by Green's theorem, and the pairs cancel.

For a general piecewise smooth closed path, join successive points on it by short chords. The path is compact inside the open set $D$, so sufficiently short chords stay in $D$. On each smooth piece the resulting polygonal parametrisations approach the path uniformly, and their velocities approach its velocity uniformly away from the subdivision points, by continuity of $\vb{r}'$. Hence the line integrals of the polygonal walks approach the line integral of the path. Each is 0, so the integral along the path is 0 as well. Theorem 20.3 now gives Theorem 20.5. For the field of Example 20.6, Green's theorem cannot be used on the unit disc, which contains the origin, where the field is not defined.

::: example A line integral made easy
Evaluate $\displaystyle\oint_C \big(xy - e^{x^2}\big)\,dx + \big(x^2 + 3x + \ln(1 + y^2)\big)\,dy$, where $C$ is the circle $x^2 + y^2 = 4$, traced anticlockwise.

A direct parametrisation produces terms such as $2e^{4\cos^2 t}\sin t$. Green's theorem avoids integrating those terms along the circle. Here $P = xy - e^{x^2}$ and $Q = x^2 + 3x + \ln(1 + y^2)$ have continuous partial derivatives on the whole plane, and

$$\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y} = (2x + 3) - x = x + 3.$$

The awkward terms are gone: $e^{x^2}$ does not depend on $y$, and $\ln(1 + y^2)$ does not depend on $x$. With $D$ the disc of radius 2, in polar coordinates (Module 19),

$$\begin{aligned} &\oint_C P\,dx + Q\,dy = \iint_D (x + 3)\,dA \\ &\quad= \int_0^{2\pi}\!\!\int_0^2 (r\cos\theta + 3)\,r\,dr\,d\theta \\ &\quad= 0 + 3\cdot\pi\cdot 2^2 = 12\pi. \end{aligned}$$

The integral of $x$ over the disc is 0, because the disc is symmetric about the $y$-axis and $x$ is odd: in polar form, $\int_0^{2\pi}\cos\theta\,d\theta = 0$.

```check
P208 = x*y - exp(x**2); Q208 = x**2 + 3*x + log(1 + y**2)
same(diff(Q208, x), 2*x + 3); same(diff(P208, y), x)
same(diff(Q208, x) - diff(P208, y), x + 3)
same(integrate((r*cos(theta) + 3)*r, (r, 0, 2), (theta, 0, 2*pi)), 12*pi)
same(integrate(r*cos(theta)*r, (r, 0, 2), (theta, 0, 2*pi)), 0); same(3*pi*2**2, 12*pi)
same((-exp(x**2)).subs(x, 2*cos(t))*diff(2*cos(t), t), 2*exp(4*cos(t)**2)*sin(t))
rc208 = Matrix([2*cos(t), 2*sin(t)])
lhs208 = Integral(Matrix([P208, Q208]).subs({x: rc208[0], y: rc208[1]}, simultaneous=True).dot(rc208.diff(t)), (t, 0, 2*pi)).evalf(30)
near(lhs208, 12*pi, 1e-20)
```
:::

### Circulation and flux {#flux-form}

Since $P\,dx + Q\,dy = \vb{F}\cdot\vb{T}\,ds$, the left side of Green's theorem is $\oint_C \vb{F}\cdot\vb{T}\,ds$, the **circulation** of $\vb{F}$ round $C$. If $\vb{F}$ is the velocity of a fluid, it measures how strongly the fluid flows along $C$, round the loop.

The other natural question is how much fluid flows out across $C$, and only the normal component of the velocity carries fluid across. Turning the unit tangent $\vb{T} = \langle x', y'\rangle/\norm{\vb{r}'}$ a quarter turn clockwise gives the **outward unit normal**

$$\vb{n} = \frac{\langle y'(t), -x'(t)\rangle}{\norm{\vb{r}'(t)}},$$

which points away from $D$, because $D$ is on the left. On the unit circle traced by $\langle\cos t, \sin t\rangle$, for example, $\vb{n} = \langle\cos t, \sin t\rangle$. The **flux** of $\vb{F}$ across $C$ is $\oint_C \vb{F}\cdot\vb{n}\,ds$.

```check
rcu = Matrix([cos(t), sin(t)]); same(Matrix([rcu.diff(t)[1], -rcu.diff(t)[0]]), rcu)
```

::: theorem Green's theorem, flux form
Under the hypotheses of Theorem 20.6, with $\vb{n}$ the outward unit normal of $C$,

$$\oint_C \vb{F}\cdot\vb{n}\,ds = \iint_D \Big(\frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y}\Big)\,dA.$$
:::

::: proof
Since $\vb{n}\,ds = \langle y'(t), -x'(t)\rangle\,dt$,

$$\begin{aligned} \vb{F}\cdot\vb{n}\,ds &= \big(P\,y'(t) - Q\,x'(t)\big)\,dt \\ &= -Q\,dx + P\,dy. \end{aligned}$$

The field $\langle -Q, P\rangle$ also has components with continuous partial derivatives, and Green's theorem for it is

$$\begin{aligned} &\oint_C (-Q)\,dx + P\,dy \\ &\quad= \iint_D \Big(\frac{\partial P}{\partial x} - \frac{\partial(-Q)}{\partial y}\Big)\,dA, \end{aligned}$$

which is the formula.
:::

If $\vb{F}$ is the velocity of a two-dimensional flow, the flux is the net rate at which fluid leaves $D$ across $C$ (in area per unit time), and $P_x + Q_y$, which Section 20.5 names the divergence, measures how fast the flow spreads out from each point. For the source $\vb{G} = \langle x, y\rangle$ and the unit circle, $\vb{G}\cdot\vb{n} = \cos^2 t + \sin^2 t = 1$, so the flux is $2\pi$, and indeed $\iint_D (1 + 1)\,dA = 2\pi$; the circulation is 0, since $\vb{G}$ is perpendicular to the circle. For the rotation field it is the other way round: circulation $2\pi$, flux 0.

```check
Gs = Matrix([x, y]); on_c = lambda e_: e_.subs({x: cos(t), y: sin(t)}, simultaneous=True)
same(on_c(Gs).dot(rcu), 1); same(integrate(on_c(Gs).dot(rcu), (t, 0, 2*pi)), 2*pi); same(integrate(2*r, (r, 0, 1), (theta, 0, 2*pi)), 2*pi)
same(lint(Gs, rcu, 0, 2*pi), 0); same(lint(F204, rcu, 0, 2*pi), 2*pi); same(integrate(on_c(F204).dot(rcu), (t, 0, 2*pi)), 0)
```

::: widget name=vector-field
Choose a field, then move the circle with the sliders, or drag on the picture to move its centre. The readout gives the circulation $\oint \vb{F}\cdot d\vb{r}$ (anticlockwise) and the outward flux $\oint \vb{F}\cdot\vb{n}\,ds$ round the circle, each beside the double integral over the disc that Green's theorem says it equals, all computed numerically. With the rotation field the circulation is $2\pi r^2$ wherever the circle is, because $Q_x - P_y = 2$ everywhere. With the shear $\langle y, 0\rangle$ every arrow is horizontal, yet the circulation is $-\pi r^2$. With the gradient field the circulation is 0 for every circle (Theorem 20.3). Then choose your own field, type $P$ = `-y/(x^2+y^2)` and $Q$ = `x/(x^2+y^2)` (Example 20.6), and compare circles with the origin strictly outside and strictly inside. With radius 1, try centres $(2,1)$ and $(0.3,0.2)$, respectively. The circulation is 0 outside and $2\pi$ inside (Exercise 20.11). Although $Q_x-P_y=0$ wherever the field is defined, a disc containing the origin fails the hypotheses of Green's theorem. The readout can flag a mismatch or withhold unreliable estimates. Numerical agreement alone cannot check the hypotheses.
:::

### Area from the boundary {#area}

Under the hypotheses of Green's theorem, if $Q_x - P_y = 1$, the area of $D$ is a line integral round its positively oriented boundary. Three simple choices are $P = 0$, $Q = x$; $P = -y$, $Q = 0$; and $P = -y/2$, $Q = x/2$:

$$\begin{aligned} A &= \oint_C x\,dy = -\oint_C y\,dx \\ &= \frac12\oint_C x\,dy - y\,dx. \end{aligned}$$

::: example The area of an ellipse
Find the area enclosed by the ellipse $x = a\cos t$, $y = b\sin t$, $0 \le t \le 2\pi$, where $a, b > 0$.

The ellipse is traced anticlockwise. With $dx = -a\sin t\,dt$ and $dy = b\cos t\,dt$,

$$\begin{aligned} A &= \frac12\oint_C x\,dy - y\,dx \\ &= \frac12\int_0^{2\pi} \big(ab\cos^2 t + ab\sin^2 t\big)\,dt \\ &= \pi ab. \end{aligned}$$

With $a = b = r$ this is the area of a circle, $\pi r^2$.

```check
ae, be_ = symbols('a b', positive=True)
xe, ye = ae*cos(t), be_*sin(t)
same(xe*diff(ye, t) - ye*diff(xe, t), ae*be_)
same(integrate((xe*diff(ye, t) - ye*diff(xe, t))/2, (t, 0, 2*pi)), pi*ae*be_)
same(integrate(xe*diff(ye, t), (t, 0, 2*pi)), pi*ae*be_)
```
:::

**Planimeters.** A planimeter is a mechanical instrument that measures the area of a region drawn on paper, such as a field on a map, while its pointer traces the boundary once. With the fixed pivot outside the region, the measuring wheel accumulates a line integral as the pointer goes round. Green's theorem relates this integral to the area.

**Polygons.** For a polygon the area formula becomes a sum. Along the edge from $(x_1, y_1)$ to $(x_2, y_2)$, traced by $x = x_1 + t(x_2 - x_1)$, $y = y_1 + t(y_2 - y_1)$, $0 \le t \le 1$,

$$\begin{aligned} &x\,dy - y\,dx \\ &\quad= \big[x\,(y_2 - y_1) - y\,(x_2 - x_1)\big]\,dt \\ &\quad= (x_1y_2 - x_2y_1)\,dt, \end{aligned}$$

because on expanding, the terms with $t$ cancel. So each edge contributes $x_1y_2 - x_2y_1$, and a simple polygon with corners $(x_1, y_1), \dots, (x_n, y_n)$, listed anticlockwise, has area

$$A = \frac12\sum_{k=1}^{n} \big(x_ky_{k+1} - x_{k+1}y_k\big),$$

where $(x_{n+1}, y_{n+1})$ means the first corner $(x_1, y_1)$ again. This is the **shoelace formula** (or surveyor's formula), which mapping and graphics software uses for the areas of polygons.

```check
x1s, y1s, x2s, y2s = symbols('x_1 y_1 x_2 y_2')
xs_, ys_ = x1s + t*(x2s - x1s), y1s + t*(y2s - y1s)
same(expand(xs_*diff(ys_, t) - ys_*diff(xs_, t)), x1s*y2s - x2s*y1s)
```

::: compute Areas from corners
The shoelace formula is a few lines of Python:

```python
import math

def area(corners):
    """The signed area of a simple polygon, with corners in boundary order."""
    n = len(corners)
    total = 0
    for k in range(n):
        x1, y1 = corners[k]
        x2, y2 = corners[(k + 1) % n]    # next corner; wraps round to the first
        total += x1*y2 - x2*y1
    return total/2

print(area([(0, 0), (2, 0), (2, 1), (0, 1)]))
print(area([(0, 0), (0, 1), (2, 1), (2, 0)]))
print(area([(0, 0), (4, 0), (4, 3), (2, 1), (0, 3)]))
```

```output
2.0
-2.0
8.0
```

The first rectangle, 2 by 1, has area 2. The second is the same rectangle with its corners listed clockwise: the sign of the answer gives the direction of the boundary. The third polygon has a notch cut into its top; the formula does not need it to be convex. The area of a regular polygon inscribed in the unit circle approaches the area of the disc as the number of sides increases:

```python
for n in [6, 100, 10000]:
    step = 2*math.pi/n          # angle between neighbouring corners
    corners = [(math.cos(k*step), math.sin(k*step)) for k in range(n)]
    print(f"{n} {area(corners):.10f}")
print(f"{math.pi:.10f}")
```

```output
6 2.5980762114
100 3.1395259765
10000 3.1415924469
3.1415926536
```

The values, shown to ten decimal places, approach $\pi$, the area of the unit disc.
:::

```check
sh = lambda P_: Rational(sum(P_[k_][0]*P_[(k_ + 1) % len(P_)][1] - P_[(k_ + 1) % len(P_)][0]*P_[k_][1] for k_ in range(len(P_))), 2)
same(sh([(0, 0), (2, 0), (2, 1), (0, 1)]), 2); same(sh([(0, 0), (0, 1), (2, 1), (2, 0)]), -2)
same(sh([(0, 0), (4, 0), (4, 3), (2, 1), (0, 3)]), 8); same(4*3 - Rational(1, 2)*4*2, 8)     # the rectangle minus the notch
ak_, dk_ = symbols('alpha delta'); same(cos(ak_)*sin(ak_ + dk_) - cos(ak_ + dk_)*sin(ak_), sin(dk_))   # each term of a regular n-gon
nP = symbols('n', positive=True, integer=True); same(Sum(sin(2*pi/nP)/2, (Symbol('k'), 0, nP - 1)).doit(), nP/2*sin(2*pi/nP))
nL = symbols('n_L', positive=True); limit_is(nL/2*sin(2*pi/nL), nL, oo, pi)
for n_, shown_ in [(6, '2.5980762114'), (100, '3.1395259765'), (10000, '3.1415924469')]:
    rounds(n_*sin(2*pi/n_)/2, shown_)
rounds(pi, '3.1415926536')
```

## Curl and divergence {#curl-divergence}

The two forms of Green's theorem have two integrands, $Q_x - P_y$ and $P_x + Q_y$. In space they become the curl and the divergence. Write $\nabla$, read "del", for the vector of partial derivative operators $\big\langle \partial/\partial x, \partial/\partial y, \partial/\partial z\big\rangle$. Applied to a function $f$ it gives the gradient $\nabla f$; "crossed" and "dotted" with a field $\vb{F}$, it gives the following.

::: definition Curl and divergence
Let $\vb{F} = \langle P, Q, R\rangle$ be a vector field whose components have first partial derivatives. The **curl** of $\vb{F}$ is the vector field

$$\begin{aligned} &\operatorname{curl}\vb{F} = \nabla\times\vb{F} \\ &\quad= \big\langle R_y - Q_z,\ P_z - R_x,\ Q_x - P_y\big\rangle, \end{aligned}$$

and the **divergence** of $\vb{F}$ is the function

$$\operatorname{div}\vb{F} = \nabla\cdot\vb{F} = P_x + Q_y + R_z.$$

Here the subscripts are partial derivatives: $R_y = \partial R/\partial y$, and so on.
:::

Read "curl F" (or "del cross F") and "div F" (or "del dot F"). The curl is the cross product of Module 16, with the operators of $\nabla$ in the middle row of the determinant:

$$\nabla\times\vb{F} = \begin{vmatrix} \vb{i} & \vb{j} & \vb{k} \\ \partial/\partial x & \partial/\partial y & \partial/\partial z \\ P & Q & R \end{vmatrix},$$

where "$\partial/\partial y$ times $R$" means $\partial R/\partial y$. The curl is a vector field; the divergence is a scalar field. A field $\langle P(x, y), Q(x, y)\rangle$ in the plane counts as the field $\langle P, Q, 0\rangle$ in space, and then

$$\begin{aligned} \operatorname{curl}\vb{F} &= \langle 0, 0, Q_x - P_y\rangle, \\ \operatorname{div}\vb{F} &= P_x + Q_y, \end{aligned}$$

the two integrands of Green's theorem. Its two forms read

$$\begin{aligned} \oint_C \vb{F}\cdot\vb{T}\,ds &= \iint_D (\operatorname{curl}\vb{F})\cdot\vb{k}\,dA, \\ \oint_C \vb{F}\cdot\vb{n}\,ds &= \iint_D \operatorname{div}\vb{F}\,dA. \end{aligned}$$

```check
curl3 = lambda F_: Matrix([diff(F_[2], y) - diff(F_[1], z), diff(F_[0], z) - diff(F_[2], x), diff(F_[1], x) - diff(F_[0], y)])
div3 = lambda F_: diff(F_[0], x) + diff(F_[1], y) + diff(F_[2], z)
Pg_, Qg_, Rg_ = [Function(nm_)(x, y, z) for nm_ in ('P', 'Q', 'R')]
same(curl3(Matrix([Pg_, Qg_, Rg_])), Matrix([diff(Rg_, y) - diff(Qg_, z), diff(Pg_, z) - diff(Rg_, x), diff(Qg_, x) - diff(Pg_, y)]))
iv, jv, kv = Matrix([1, 0, 0]), Matrix([0, 1, 0]), Matrix([0, 0, 1])
detc = iv*(diff(Rg_, y) - diff(Qg_, z)) - jv*(diff(Rg_, x) - diff(Pg_, z)) + kv*(diff(Qg_, x) - diff(Pg_, y))   # the determinant, along its first row
same(detc, curl3(Matrix([Pg_, Qg_, Rg_])))
P2_, Q2_ = Function('P')(x, y), Function('Q')(x, y)
same(curl3(Matrix([P2_, Q2_, 0])), Matrix([0, 0, diff(Q2_, x) - diff(P2_, y)])); same(div3(Matrix([P2_, Q2_, 0])), diff(P2_, x) + diff(Q2_, y))
```

::: example Curl and divergence
(a) Find the curl and the divergence of $\vb{F} = \langle xy, yz, zx\rangle$. (b) Find $Q_x - P_y$ and $P_x + Q_y$ for the rotation field $\langle -y, x\rangle$, the source $\langle x, y\rangle$, the sink $\langle -x, -y\rangle$, the shear $\langle y, 0\rangle$ and the constant field $\langle 1, 0.5\rangle$ of the demonstration in Section 20.4.

**(a)** With $P = xy$, $Q = yz$ and $R = zx$:

$$\begin{aligned} \operatorname{curl}\vb{F} &= \langle 0 - y,\ 0 - z,\ 0 - x\rangle \\ &= \langle -y, -z, -x\rangle, \\ \operatorname{div}\vb{F} &= y + z + x. \end{aligned}$$

**(b)** One derivative at a time:

| Field | $Q_x - P_y$ | $P_x + Q_y$ |
|---|---|---|
| rotation $\langle -y, x\rangle$ | $1 - (-1) = 2$ | $0$ |
| source $\langle x, y\rangle$ | $0$ | $1 + 1 = 2$ |
| sink $\langle -x, -y\rangle$ | $0$ | $-2$ |
| shear $\langle y, 0\rangle$ | $0 - 1 = -1$ | $0$ |
| constant $\langle 1, 0.5\rangle$ | $0$ | $0$ |

So round every circle of radius $r$, Green's theorem predicts circulation $2\pi r^2$ and flux 0 for the rotation field, circulation 0 and flux $2\pi r^2$ for the source, and circulation $-\pi r^2$ for the shear, wherever the circle is.

```check
F210 = Matrix([x*y, y*z, z*x]); same(curl3(F210), Matrix([-y, -z, -x])); same(div3(F210), x + y + z)
fields210 = [Matrix([-y, x, 0]), Matrix([x, y, 0]), Matrix([-x, -y, 0]), Matrix([y, 0, 0]), Matrix([1, Rational(1, 2), 0])]
same([curl3(F_)[2] for F_ in fields210], [2, 0, 0, -1, 0]); same([div3(F_) for F_ in fields210], [0, 2, -2, 0, 0])
R210 = symbols('r_210', positive=True)
disc210 = lambda g_: integrate(g_*r, (r, 0, R210), (theta, 0, 2*pi))
same([disc210(curl3(F_)[2]) for F_ in fields210], [2*pi*R210**2, 0, 0, -pi*R210**2, 0])
same([disc210(div3(F_)) for F_ in fields210], [0, 2*pi*R210**2, -2*pi*R210**2, 0, 0])
```
:::

### What curl and divergence measure {#meaning}

**Rotation.** Put a tiny paddle wheel into a flowing fluid. It turns if the fluid pushes harder on the paddles on one side of its axle than on the other. Green's theorem makes this precise. Suppose $\vb{F}$ has continuous first partial derivatives near $P_0$. Let $C_r$ be the circle of radius $r > 0$ about $P_0$, traced anticlockwise, and $D_r$ its disc. Then $\oint_{C_r} \vb{F}\cdot d\vb{r} = \iint_{D_r} (Q_x - P_y)\,dA$. If $Q_x - P_y$ is continuous, then on a small enough disc it differs from its value at $P_0$ by less than any number $\varepsilon > 0$ you choose, so the double integral differs from that value times $\pi r^2$ by less than $\varepsilon\pi r^2$. Dividing by the area and letting $r \to 0$:

$$(\operatorname{curl}\vb{F})(P_0)\cdot\vb{k} = \lim_{r\to0}\frac{1}{\pi r^2}\oint_{C_r} \vb{F}\cdot d\vb{r}.$$

The curl measures the limiting circulation per unit area. In space, Stokes' theorem (Section 20.7) gives the component along $\vb{n}$ when the small loop lies in a plane with unit normal $\vb{n}$. The largest signed value occurs when $\vb{n}$ points along the curl, if the curl is nonzero. This explains the paddle-wheel picture in the limit of a tiny wheel. For a rigid rotation the curl is twice the angular velocity: a wheel turning about the $z$-axis at $\omega$ radians per second has velocity field $\vb{v} = \langle -\omega y, \omega x, 0\rangle$, and $\operatorname{curl}\vb{v} = \langle 0, 0, \omega - (-\omega)\rangle = \langle 0, 0, 2\omega\rangle$.

**Expansion.** In the same way, the flux form of Green's theorem gives

$$(\operatorname{div}\vb{F})(P_0) = \lim_{r\to0}\frac{1}{\pi r^2}\oint_{C_r} \vb{F}\cdot\vb{n}\,ds.$$

So the divergence is the rate at which the flow carries fluid out of small regions, per unit of area (per unit of volume, in space, by the divergence theorem of Section 20.7). Where $\operatorname{div}\vb{F} > 0$ the fluid spreads out, as from the source; where it is negative the fluid gathers, as into the sink. An incompressible flow with no sources or sinks has $\operatorname{div}\vb{F} = 0$: what flows into a region flows out again.

```check
wv = symbols('omega', positive=True)
same(curl3(Matrix([-wv*y, wv*x, 0])), Matrix([0, 0, 2*wv]))
# circulation per unit area for <-y^3/3, x^3/3>, whose Q_x - P_y = x^2 + y^2, round circles about (1, 0)
Fq = Matrix([-y**3/3, x**3/3]); rho_ = symbols('rho', positive=True)
circq = lint(Fq, [1 + rho_*cos(t), rho_*sin(t)], 0, 2*pi)
same(circq/(pi*rho_**2), 1 + rho_**2/2); limit_is(circq/(pi*rho_**2), rho_, 0, 1, dir='+'); same(curl3(Matrix([Fq[0], Fq[1], 0]))[2].subs({x: 1, y: 0}), 1)
```

::: pitfall
A field can turn without arrows that go round, and arrows that go round need not turn. The shear $\langle y, 0\rangle$ has parallel arrows, yet $\operatorname{curl}\vb{F} = \langle 0, 0, -1\rangle$: above the $x$-axis the fluid moves to the right, faster further up, so a paddle wheel is pushed harder at its top than at its bottom, and it turns clockwise. The arrows of the field of Example 20.6 go round the origin, yet its curl is $\vb{0}$ wherever it is defined: the limiting circulation per unit area around a point away from the origin is zero.

```check
same(curl3(Matrix([y, 0, 0])), Matrix([0, 0, -1])); same(curl3(Matrix([P206, Q206, 0])).applyfunc(simplify), zeros(3, 1))
```
:::

### Two identities {#identities}

::: theorem Two identities
If $f$ has continuous second partial derivatives, then $\operatorname{curl}(\nabla f) = \vb{0}$. If the components of $\vb{F}$ have continuous second partial derivatives, then $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$.
:::

::: proof
With $\nabla f = \langle f_x, f_y, f_z\rangle$,

$$\begin{aligned} &\operatorname{curl}(\nabla f) \\ &\quad= \big\langle f_{zy} - f_{yz},\ f_{xz} - f_{zx},\ f_{yx} - f_{xy}\big\rangle, \end{aligned}$$

and each component is 0 by Clairaut's theorem. In the same way,

$$\begin{aligned} &\operatorname{div}(\operatorname{curl}\vb{F}) \\ &\quad= (R_y - Q_z)_x + (P_z - R_x)_y \\ &\qquad + (Q_x - P_y)_z \\ &\quad= R_{yx} - Q_{zx} + P_{zy} \\ &\qquad - R_{xy} + Q_{xz} - P_{yz}, \end{aligned}$$

and the six terms cancel in pairs, by Clairaut's theorem again.
:::

```check
fg_ = Function('f')(x, y, z)
same(curl3(grad3(fg_)), zeros(3, 1)); same(div3(curl3(Matrix([Pg_, Qg_, Rg_]))), 0)
```

For a field $\vb{F}$ with continuous first partial derivatives, a nonzero curl rules out a potential by the first identity. Conversely, if $\operatorname{curl}\vb{F} = \vb{0}$ on an open, **simply connected** region of space, then $\vb{F}$ is conservative. Here simply connected means connected and every closed path can be continuously shrunk to a point within the region. For example, a ball and space with one point removed are simply connected. A loop round a removed line cannot shrink to a point without crossing the line. Section 20.7 gives the idea behind the converse.

By the second identity, a field with nonzero divergence, such as $\langle x, y, z\rangle$, cannot be the curl of a field with continuous second partial derivatives.

::: compute Curl and divergence with SymPy
SymPy's `sympy.vector` module knows the operators of this section. It works in a coordinate system, here called `N`, with coordinates `N.x`, `N.y`, `N.z` and unit vectors `N.i`, `N.j`, `N.k`:

```python
import sympy as sp
from sympy.vector import CoordSys3D, curl, divergence, gradient
N = CoordSys3D('N')
x, y, z = N.x, N.y, N.z
F = x*y*N.i + y*z*N.j + z*x*N.k          # Example 20.10
print(curl(F))
print(divergence(F))
print(divergence(curl(F)))
```

```output
(-N.y)*N.i + (-N.z)*N.j + (-N.x)*N.k
N.x + N.y + N.z
0
```

The answers of Example 20.10, written with SymPy's unit vectors, and the identity $\operatorname{div}\operatorname{curl}\vb{F} = 0$. The other identity, and a potential:

```python
f = x**2*y*sp.sin(z)
print(gradient(f))
print(curl(gradient(f)))
from sympy.vector import is_conservative, scalar_potential
G = 2*x*y*N.i + (x**2 + 2*y*z)*N.j + y**2*N.k
print(is_conservative(G), scalar_potential(G, N))
```

```output
(2*N.x*N.y*sin(N.z))*N.i + (N.x**2*sin(N.z))*N.j + (N.x**2*N.y*cos(N.z))*N.k
0
True N.x**2*N.y + N.y**2*N.z
```

`is_conservative` checks only that the curl is $\vb{0}$, and `scalar_potential` finds a potential by integrating, as in Example 20.7. Neither looks at the region:

```python
V = -y/(x**2 + y**2)*N.i + x/(x**2 + y**2)*N.j      # Example 20.6
print(is_conservative(V))
```

```output
True
```

SymPy says yes, but Example 20.6 showed that this field is not conservative on the plane without the origin. The hypothesis "simply connected" is yours to check.
:::

```check
from sympy.vector import CoordSys3D as CS3_, curl as vcurl_, divergence as vdiv_, gradient as vgrad_
Nv = CS3_('Nv'); sv_ = {x: Nv.x, y: Nv.y, z: Nv.z}
Fv_ = F210[0].subs(sv_)*Nv.i + F210[1].subs(sv_)*Nv.j + F210[2].subs(sv_)*Nv.k
same(vcurl_(Fv_).to_matrix(Nv), curl3(F210).subs(sv_)); same(vdiv_(Fv_), div3(F210).subs(sv_))
same(grad3(x**2*y + y**2*z), Matrix([2*x*y, x**2 + 2*y*z, y**2])); same(curl3(Matrix([2*x*y, x**2 + 2*y*z, y**2])), zeros(3, 1))
```

## Surfaces and surface integrals {#surfaces}

### Parametric surfaces {#parametric-surfaces}

A curve in space is traced by a point that depends on one parameter, $\vb{r}(t)$. A surface is traced by a point that depends on two.

::: definition Parametric surface
A **parametric surface** $S$ is the set of points

$$\vb{r}(u, v) = \big\langle x(u, v), y(u, v), z(u, v)\big\rangle$$

for $(u, v)$ in a region $D$ of the $uv$-plane. The function $\vb{r}$ is a **parametrisation** of $S$.
:::

Three examples recur. The radius $a$ and cylinder height $h$ are positive:

- the sphere of radius $a$ centred at the origin, from the spherical coordinates of Module 19 with $\rho = a$: $\vb{r}(\varphi, \theta) = \langle a\sin\varphi\cos\theta, a\sin\varphi\sin\theta, a\cos\varphi\rangle$, $0 \le \varphi \le \pi$, $0 \le \theta \le 2\pi$;
- the cylinder $x^2 + y^2 = a^2$, $0 \le z \le h$: $\vb{r}(\theta, z) = \langle a\cos\theta, a\sin\theta, z\rangle$, $0 \le \theta \le 2\pi$, $0 \le z \le h$;
- the graph of a function $z = g(x, y)$ over a region $D$: $\vb{r}(x, y) = \langle x, y, g(x, y)\rangle$, with $x$ and $y$ themselves as the parameters.

Holding $v$ fixed and letting $u$ vary traces a curve on $S$, a **grid curve**, whose tangent vector is the partial derivative $\vb{r}_u = \partial\vb{r}/\partial u$ (differentiate each component); holding $u$ fixed gives a grid curve with tangent vector $\vb{r}_v$. When these vectors are linearly independent, they span the tangent plane of $S$. Their cross product

$$\vb{N} = \vb{r}_u\times\vb{r}_v$$

is perpendicular to $S$: a **normal vector** (Figure 20.4). Here we use **smooth patches** with continuously differentiable parametrisations on a neighbourhood of $D$ and $\vb{r}_u\times\vb{r}_v \ne \vb{0}$ in its interior. Each patch is traced once apart from possible repeats along its edges. A **piecewise smooth surface** is made of finitely many such patches that meet only along edges or at points.

::: example Normal vectors of a sphere and of a graph
Find $\vb{r}_u\times\vb{r}_v$ (a) for the sphere of radius $a$, and (b) for the graph of $z = g(x, y)$.

**(a)** Here $\vb{r}_\varphi = \langle a\cos\varphi\cos\theta, a\cos\varphi\sin\theta, -a\sin\varphi\rangle$ and $\vb{r}_\theta = \langle -a\sin\varphi\sin\theta, a\sin\varphi\cos\theta, 0\rangle$. The cross product, simplified with $\cos^2\theta + \sin^2\theta = 1$, is

$$\begin{aligned} &\vb{r}_\varphi\times\vb{r}_\theta \\ &\quad= \big\langle a^2\sin^2\varphi\cos\theta, a^2\sin^2\varphi\sin\theta, \\ &\qquad\ a^2\sin\varphi\cos\varphi\big\rangle \\ &\quad= a\sin\varphi\;\vb{r}(\varphi, \theta). \end{aligned}$$

For $0 < \varphi < \pi$ this is a positive multiple of $\vb{r}$, so it points outwards. At the poles it is zero, because the longitude grid curve collapses there. Its length is $a\sin\varphi \cdot a = a^2\sin\varphi$.

**(b)** Here $\vb{r}_x = \langle 1, 0, g_x\rangle$ and $\vb{r}_y = \langle 0, 1, g_y\rangle$, so $\vb{r}_x\times\vb{r}_y = \langle -g_x, -g_y, 1\rangle$. It points upwards (its $z$-component is 1), and its length is $\sqrt{1 + g_x^2 + g_y^2}$.

```check
aS = symbols('a', positive=True); phs, ths = symbols('phi theta', real=True)
Sph = lambda A_: Matrix([A_*sin(phs)*cos(ths), A_*sin(phs)*sin(ths), A_*cos(phs)])
Sa = Sph(aS)
same(Sa.diff(phs), Matrix([aS*cos(phs)*cos(ths), aS*cos(phs)*sin(ths), -aS*sin(phs)])); same(Sa.diff(ths), Matrix([-aS*sin(phs)*sin(ths), aS*sin(phs)*cos(ths), 0]))
NSa = Sa.diff(phs).cross(Sa.diff(ths))
same(NSa, Matrix([aS**2*sin(phs)**2*cos(ths), aS**2*sin(phs)**2*sin(ths), aS**2*sin(phs)*cos(phs)])); same(NSa, aS*sin(phs)*Sa)
same(NSa.dot(NSa), (aS**2*sin(phs))**2)
same(NSa.subs(phs, 0), zeros(3, 1)); same(NSa.subs(phs, pi), zeros(3, 1))
gS = Function('g')(x, y); Gr = Matrix([x, y, gS])
same(Gr.diff(x).cross(Gr.diff(y)), Matrix([-diff(gS, x), -diff(gS, y), 1]))
```
:::

::: figure id=fig-20-4
A parametric surface: the sphere of Example 20.11. A small rectangle of sides $\Delta\varphi$ and $\Delta\theta$ in the $\varphi\theta$-plane (left) is carried by $\vb{r}$ to a small patch of the sphere (right, orange), close to the parallelogram spanned by $\vb{r}_\varphi\Delta\varphi$ and $\vb{r}_\theta\Delta\theta$. The normal vector $\vb{N} = \vb{r}_\varphi\times\vb{r}_\theta$ is perpendicular to the sphere, and $\norm{\vb{N}}\,\Delta\varphi\,\Delta\theta$ is close to the patch's area.
:::

### Surface area {#surface-area}

Cut $D$ into small rectangles of sides $\Delta u$ and $\Delta v$. The one with corner $(u, v)$ is carried to a small curved patch of $S$ with a corner at $\vb{r}(u, v)$. Since $\vb{r}(u + \Delta u, v) - \vb{r}(u, v) \approx \vb{r}_u\,\Delta u$ and $\vb{r}(u, v + \Delta v) - \vb{r}(u, v) \approx \vb{r}_v\,\Delta v$, the patch is close to the parallelogram spanned by $\vb{r}_u\,\Delta u$ and $\vb{r}_v\,\Delta v$, whose area is $\norm{\vb{r}_u\times\vb{r}_v}\,\Delta u\,\Delta v$ (Module 16). Adding over the patches:

::: definition Surface area
If $S$ is traced once by a smooth parametrisation $\vb{r}(u, v)$ over a bounded region $D$ with piecewise smooth boundary, its **surface area** is

$$A(S) = \iint_D \norm{\vb{r}_u\times\vb{r}_v}\,dA.$$
:::

"Traced once" allows repeats on the edge of $D$: the sphere's parametrisation gives the points with $\theta = 0$ and $\theta = 2\pi$ twice, and each pole for a whole edge of $D$, but those repeats have zero surface area. For a piecewise smooth surface, add the areas of its patches. For a smooth graph $z = g(x, y)$, by Example 20.11(b),

$$A(S) = \iint_D \sqrt{1 + g_x^2 + g_y^2}\,dA.$$

::: example Two surface areas
(a) Find the area of the sphere of radius $a$. (b) Find the area of the dome $z = 1 - x^2 - y^2$, $z \ge 0$.

**(a)** By Example 20.11, $\norm{\vb{r}_\varphi\times\vb{r}_\theta} = a^2\sin\varphi$, so

$$\begin{aligned} A &= \int_0^{2\pi}\!\!\int_0^\pi a^2\sin\varphi\,d\varphi\,d\theta \\ &= 2\pi a^2\big[-\cos\varphi\big]_0^\pi = 4\pi a^2, \end{aligned}$$

the familiar formula, which Module 12 also found from a surface of revolution.

**(b)** The dome is the graph of $g(x, y) = 1 - x^2 - y^2$ over the unit disc $D$ (where $z \ge 0$). With $g_x = -2x$ and $g_y = -2y$, in polar coordinates,

$$\begin{aligned} A &= \iint_D \sqrt{1 + 4x^2 + 4y^2}\,dA \\ &= \int_0^{2\pi}\!\!\int_0^1 \sqrt{1 + 4r^2}\,r\,dr\,d\theta. \end{aligned}$$

Substitute $w = 1 + 4r^2$, $dw = 8r\,dr$: $\int_0^1 \sqrt{1 + 4r^2}\,r\,dr = \frac18\int_1^5 \sqrt w\,dw = \frac{1}{12}\big(5\sqrt5 - 1\big)$. So

$$A = \frac{\pi}{6}\big(5\sqrt5 - 1\big) \approx 5.330,$$

against $\pi \approx 3.142$ for the flat disc under the dome.

```check
same(sqrt(NSa.dot(NSa)), aS**2*Abs(sin(phs))); holds(minimum(sin(x), x, Interval(0, pi)) >= 0)    # sin(phi) >= 0 for 0 <= phi <= pi
antideriv(-cos(phs), sin(phs), phs)
steps(Integral(aS**2*sin(phs), (phs, 0, pi), (ths, 0, 2*pi)), 2*pi*aS**2*(-cos(pi) + cos(0)), 4*pi*aS**2)
gd = 1 - x**2 - y**2
same(diff(gd, x), -2*x); same(diff(gd, y), -2*y)
same(1 + diff(gd, x)**2 + diff(gd, y)**2, 1 + 4*x**2 + 4*y**2)
wq = symbols('w', positive=True)
steps(Integral(sqrt(1 + 4*r**2)*r, (r, 0, 1)), Integral(sqrt(wq), (wq, 1, 5))/8, (5*sqrt(5) - 1)/12)
Adome = integrate(sqrt(1 + 4*r**2)*r, (r, 0, 1), (theta, 0, 2*pi))
same(Adome, pi*(5*sqrt(5) - 1)/6); rounds(Adome, '5.330'); rounds(pi, '3.142')
```
:::

### Surface integrals {#surface-integrals}

Think of a thin shell whose density varies across its surface. Approximate its mass by splitting it into patches and multiplying each patch's area by the density at one point. The limit uses the same area factor as before, with an extra factor for the density.

::: definition Surface integral of a function
Let $S$ be traced once by a smooth parametrisation $\vb{r}(u, v)$, $(u, v)$ in $D$, and let $f$ be continuous on $S$. The **surface integral** of $f$ over $S$ is

$$\begin{aligned} &\iint_S f\,dS \\ &\quad= \iint_D f\big(\vb{r}(u, v)\big)\,\norm{\vb{r}_u\times\vb{r}_v}\,dA. \end{aligned}$$
:::

As $\int_C f\,ds$ adds up $f$ times short lengths, $\iint_S f\,dS$ adds up $f$ times small areas $dS = \norm{\vb{r}_u\times\vb{r}_v}\,dA$. With $f = 1$ it is the area of $S$; with a density, it gives the mass of a thin shell. Divide by the area, if it is positive, to get the average of $f$. For a surface made of several patches, add their integrals. A smooth change of parameters multiplies the cross product by its signed Jacobian determinant, by the chain rule. The length picks up the absolute value, exactly the factor in Module 19's change of variables formula. This makes the integral independent of the choice of smooth parameters.

::: example The centre of mass of a shell
Find the height of the centre of mass of a thin shell of uniform positive density in the shape of the hemisphere $x^2 + y^2 + z^2 = a^2$, $z \ge 0$, with $a > 0$.

By symmetry $\bar x = \bar y = 0$. With a constant density, $\bar z$ is the average of $z$ over the shell, $\bar z = \frac{1}{A}\iint_S z\,dS$, where $A = 2\pi a^2$ is half the area of the sphere. With the sphere's parametrisation and $0 \le \varphi \le \pi/2$,

$$\begin{aligned} &\iint_S z\,dS \\ &\quad= \int_0^{2\pi}\!\!\int_0^{\pi/2} (a\cos\varphi)(a^2\sin\varphi)\,d\varphi\,d\theta \\ &\quad= 2\pi a^3\Big[\tfrac12\sin^2\varphi\Big]_0^{\pi/2} = \pi a^3. \end{aligned}$$

So $\bar z = \pi a^3/(2\pi a^2) = a/2$: the centre of mass is exactly halfway up. For a uniform solid hemisphere the horizontal slices have area $\pi(a^2-z^2)$, which decreases with height. Its centre of mass is lower, at $\dfrac{\int_0^a z(a^2-z^2)\,dz}{\int_0^a (a^2-z^2)\,dz} = 3a/8$.

```check
same(Sa[2], aS*cos(phs))
antideriv(sin(phs)**2/2, cos(phs)*sin(phs), phs)
steps(Integral(aS*cos(phs)*aS**2*sin(phs), (phs, 0, pi/2), (ths, 0, 2*pi)), 2*pi*aS**3*(sin(pi/2)**2/2 - 0), pi*aS**3)
same(integrate(aS**2*sin(phs), (phs, 0, pi/2), (ths, 0, 2*pi)), 2*pi*aS**2); same(pi*aS**3/(2*pi*aS**2), aS/2)
rs_ = symbols('rho_s', positive=True)
slice_area = pi*(aS**2 - z**2)
same(integrate(slice_area, (z, 0, aS)), 2*pi*aS**3/3)
same(integrate(z*slice_area, (z, 0, aS)), pi*aS**4/4)
same(integrate(z*slice_area, (z, 0, aS))/integrate(slice_area, (z, 0, aS)), 3*aS/8)
```
:::

### Orientation and flux {#flux}

A sphere, or a dome, has two sides. To **orient** a smooth surface, choose a unit normal $\vb{n}$ that varies continuously and points towards the chosen side. On a piecewise smooth surface, the choices on adjoining patches must pick the same side, though the normals may differ at a crease. A **closed** surface such as a sphere or the surface of a cube has no edge. When it bounds a solid, the **outward** orientation points away from that solid. On a regular patch, $\vb{n} = (\vb{r}_u\times\vb{r}_v)/\norm{\vb{r}_u\times\vb{r}_v}$ chooses one side and $-\vb{n}$ chooses the other. Not every surface has two sides: a Möbius strip, a strip of paper given half a twist before its ends are joined, has only one, and cannot be oriented.

Now let a fluid with velocity $\vb{F}$ flow through $S$, as water through a net. Through a small, nearly flat patch of area $\Delta S$ with unit normal $\vb{n}$, the fluid that crosses in a short time $\Delta t$ fills a slanted box with base $\Delta S$ and height $\abs{\vb{F}\cdot\vb{n}}\,\Delta t$. The signed rate across the patch is $(\vb{F}\cdot\vb{n})\,\Delta S$, in volume per unit time. A negative sign means flow against the chosen normal. The tangential part carries nothing across. Adding over the patches:

::: definition Flux
Let $S$ be an oriented surface with unit normal $\vb{n}$, and let $\vb{F}$ be a continuous vector field on $S$. The **flux** of $\vb{F}$ across $S$ is

$$\iint_S \vb{F}\cdot d\vb{S} = \iint_S \vb{F}\cdot\vb{n}\,dS.$$
:::

To compute it, trace $S$ once by $\vb{r}(u, v)$, $(u, v)$ in $D$, with $\vb{r}_u\times\vb{r}_v$ pointing to the side that $\vb{n}$ chooses. Then the lengths cancel,

$$\begin{aligned} \vb{n}\,dS &= \frac{\vb{r}_u\times\vb{r}_v}{\norm{\vb{r}_u\times\vb{r}_v}}\,\norm{\vb{r}_u\times\vb{r}_v}\,dA \\ &= \big(\vb{r}_u\times\vb{r}_v\big)\,dA, \end{aligned}$$

and so

$$\iint_S \vb{F}\cdot d\vb{S} = \iint_D \vb{F}\big(\vb{r}(u, v)\big)\cdot\big(\vb{r}_u\times\vb{r}_v\big)\,dA.$$

If $\vb{r}_u\times\vb{r}_v$ points to the other side, the flux is minus this. The same definition gives electric flux, magnetic flux and the flux of heat across a surface.

::: example Flux out of a sphere
Find the flux of $\vb{F}(x, y, z) = \langle x, y, z\rangle$ outwards across the sphere of radius $a$ centred at the origin.

By Example 20.11, $\vb{r}_\varphi\times\vb{r}_\theta = a\sin\varphi\,\vb{r}(\varphi, \theta)$ points outwards away from the poles, and $\vb{F}\big(\vb{r}(\varphi, \theta)\big) = \vb{r}(\varphi, \theta)$, whose length is $a$. So $\vb{F}\cdot(\vb{r}_\varphi\times\vb{r}_\theta) = a\sin\varphi\,\norm{\vb{r}}^2 = a^3\sin\varphi$, and

$$\begin{aligned} \iint_S \vb{F}\cdot d\vb{S} &= \int_0^{2\pi}\!\!\int_0^\pi a^3\sin\varphi\,d\varphi\,d\theta \\ &= 4\pi a^3. \end{aligned}$$

The same without the parametrisation: on the sphere $\vb{n} = \vb{r}/a$, so $\vb{F}\cdot\vb{n} = \norm{\vb{r}}^2/a = a$ everywhere, and the flux is $a$ times the area, $a\cdot 4\pi a^2 = 4\pi a^3$.

```check
same(Sa.dot(Sa/aS), aS); same(aS*(4*pi*aS**2), 4*pi*aS**3)
same(Sa.dot(NSa), aS**3*sin(phs)); same(integrate(aS**3*sin(phs), (phs, 0, pi), (ths, 0, 2*pi)), 4*pi*aS**3)
same(Sa.dot(Sa/aS), aS); same(aS*4*pi*aS**2, 4*pi*aS**3)
```
:::

::: pitfall
Two slips with surfaces. **(1)** Forgetting $\norm{\vb{r}_u\times\vb{r}_v}$ in $\iint_S f\,dS$: it is the factor that turns $du\,dv$ into area, as $\norm{\vb{r}'(t)}$ turns $dt$ into length. **(2)** In a flux integral, using the length $\norm{\vb{r}_u\times\vb{r}_v}$ where the vector $\vb{r}_u\times\vb{r}_v$ belongs, or not checking which way it points: with $\vb{r}_\theta\times\vb{r}_\varphi = -\vb{r}_\varphi\times\vb{r}_\theta$, the normal of the sphere points inwards, and the flux of Example 20.14 comes out as $-4\pi a^3$. The flux changes sign when the orientation is reversed, as $\int_C \vb{F}\cdot d\vb{r}$ does when $C$ is reversed, while $\iint_S f\,dS$, like $\int_C f\,ds$, does not.

```check
same(Sa.dot(Sa.diff(ths).cross(Sa.diff(phs))), -aS**3*sin(phs)); same(integrate(-aS**3*sin(phs), (phs, 0, pi), (ths, 0, 2*pi)), -4*pi*aS**3)
```
:::

## Stokes' theorem and the divergence theorem {#stokes-divergence}

### Stokes' theorem {#stokes}

Green's theorem relates the circulation round a closed curve in the plane to the curl inside it. The same circle in space can be the edge of a flat disc or a curved dome. When both surfaces are oriented compatibly and the field is smooth on a neighbourhood of each, Stokes' theorem says the circulation round the circle equals the flux of the curl through either surface.

The boundary curve $C$ of an oriented surface $S$ is **positively oriented** if, when you walk along $C$ with your head pointing in the direction of $\vb{n}$, the surface is on your left. For a flat disc, curl the fingers of your right hand in the direction of $C$ and your thumb points along $\vb{n}$ (the **right-hand rule**; Figure 20.5, left).

::: theorem Stokes' theorem
Let $S$ be an oriented, piecewise smooth surface whose boundary is a simple closed, piecewise smooth curve $C$ with positive orientation. If the components of $\vb{F}$ have continuous first partial derivatives on an open region of space that contains $S$, then

$$\oint_C \vb{F}\cdot d\vb{r} = \iint_S \operatorname{curl}\vb{F}\cdot d\vb{S}.$$
:::

When $S$ is a flat region of the $xy$-plane, oriented upwards, $\vb{n} = \vb{k}$ and $\operatorname{curl}\vb{F}\cdot\vb{k} = Q_x - P_y$. Stokes' theorem becomes Green's theorem in its circulation form. More generally, the boundary integral adds the contributions of all boundary curves with their induced orientations. In particular it is 0 for a closed surface. These extensions use cancellation along cuts between patches.

**The idea of the proof.** Cut $S$ into small, nearly flat patches. Round each patch the circulation is about $(\operatorname{curl}\vb{F}\cdot\vb{n})\,\Delta S$: the small-square estimate of Section 20.4, made in the plane of the patch, with its normal $\vb{n}$ in place of $\vb{k}$. Add over the patches. An edge shared by two patches is traced once in each direction, so its contributions cancel, and what is left is the circulation round $C$; meanwhile the terms $(\operatorname{curl}\vb{F}\cdot\vb{n})\,\Delta S$ add up to about $\iint_S \operatorname{curl}\vb{F}\cdot d\vb{S}$. For a surface that is a graph, a longer computation with the chain rule reduces Stokes' theorem to Green's theorem; the general proof is beyond this series.

::: example Stokes' theorem on a dome
Let $\vb{F} = \langle z, x, y\rangle$, and let $S$ be the dome $z = 1 - x^2 - y^2$, $z \ge 0$, oriented upwards. Check Stokes' theorem by computing both sides.

**The line integral.** The edge of the dome is the unit circle in the $xy$-plane. For the upward orientation of the graph, the region projects to the left of an anticlockwise traversal of the rim, so the positive direction is anticlockwise seen from above: $\vb{r}(t) = \langle\cos t, \sin t, 0\rangle$, $0 \le t \le 2\pi$. Then $\vb{F}\big(\vb{r}(t)\big) = \langle 0, \cos t, \sin t\rangle$ and $\vb{r}'(t) = \langle -\sin t, \cos t, 0\rangle$, so

$$\oint_C \vb{F}\cdot d\vb{r} = \int_0^{2\pi} \cos^2 t\,dt = \pi.$$

**The surface integral.** With $P = z$, $Q = x$ and $R = y$,

$$\begin{aligned} \operatorname{curl}\vb{F} &= \langle 1 - 0,\ 1 - 0,\ 1 - 0\rangle \\ &= \langle 1, 1, 1\rangle. \end{aligned}$$

By Example 20.11(b) with $g = 1 - x^2 - y^2$, the upward normal is $\langle -g_x, -g_y, 1\rangle = \langle 2x, 2y, 1\rangle$, so

$$\iint_S \operatorname{curl}\vb{F}\cdot d\vb{S} = \iint_D (2x + 2y + 1)\,dA$$

over the unit disc $D$. The terms $2x$ and $2y$ integrate to 0 by symmetry, which leaves the area of $D$: $\pi$. Both sides are $\pi$.

The flat unit disc, oriented upwards, has the same boundary, and on it $\operatorname{curl}\vb{F}\cdot\vb{k} = 1$, so its flux is $\pi$ as well. That is no accident: by Stokes' theorem, the flux of $\operatorname{curl}\vb{F}$ is the same through any two surfaces with the same oriented boundary, provided the field meets the hypotheses on both.

```check
F215 = Matrix([z, x, y]); rc215 = Matrix([cos(t), sin(t), 0])
same(F215.subs({x: cos(t), y: sin(t), z: 0}, simultaneous=True), Matrix([0, cos(t), sin(t)])); same(rc215.diff(t), Matrix([-sin(t), cos(t), 0]))
same(Matrix([0, cos(t), sin(t)]).dot(rc215.diff(t)), cos(t)**2); same(integrate(cos(t)**2, (t, 0, 2*pi)), pi); same(lint(F215, rc215, 0, 2*pi), pi)
same(curl3(F215), Matrix([1, 1, 1]))
same(Matrix([-diff(gd, x), -diff(gd, y), 1]), Matrix([2*x, 2*y, 1])); same(curl3(F215).dot(Matrix([2*x, 2*y, 1])), 2*x + 2*y + 1)
pol = {x: r*cos(theta), y: r*sin(theta)}
same(integrate((2*x + 2*y).subs(pol)*r, (r, 0, 1), (theta, 0, 2*pi)), 0); same(integrate((2*x + 2*y + 1).subs(pol)*r, (r, 0, 1), (theta, 0, 2*pi)), pi)
same(curl3(F215).dot(Matrix([0, 0, 1])), 1)
```
:::

::: figure id=fig-20-5
Left: Stokes' theorem on the dome of Example 20.15. The normals point upwards, and the boundary circle is traced anticlockwise seen from above: walking along it with your head along the normals, the dome is on your left. Right: the divergence theorem on the solid cylinder of Example 20.16. The boundary has three pieces, the top, the bottom and the side, and on each the normal points outwards.
:::

**Why the test in space works.** Suppose $\vb{F}$ has continuous first partial derivatives and zero curl on an open, simply connected region. If a loop bounds an oriented surface within the region, Stokes' theorem gives zero circulation. For the general case, shrinking the loop to a point gives a continuous map of a disc into the region. The image can overlap itself. Approximate the map by small triangles, joining nearby image points by straight segments. Fineness keeps those triangles in the region because the image is compact and the region is open. Stokes' theorem gives zero circulation round each triangle. Shared edges cancel even if the triangles overlap in space, and the remaining boundary chords tend to the original loop as in Section 20.4. Thus every piecewise smooth loop has zero circulation, which gives a potential by Theorem 20.3.

### The divergence theorem {#divergence-theorem}

The flux form of Green's theorem relates the flux out of a plane region to the divergence inside. Here is its version in space.

::: theorem The divergence theorem
Let $E$ be a bounded solid region including its boundary $S$, with $S$ a closed, piecewise smooth surface, oriented outwards. If the components of $\vb{F}$ have continuous first partial derivatives on an open region that contains $E$, then

$$\iint_S \vb{F}\cdot d\vb{S} = \iiint_E \operatorname{div}\vb{F}\,dV.$$
:::

It is also called Gauss's theorem. In words: the net rate at which a fluid flows out through the boundary equals the total, over the inside, of the rate at which the fluid is produced or expands there.

::: proof of the divergence theorem for a box
Let $E$ be the box $a_1 \le x \le b_1$, $a_2 \le y \le b_2$, $a_3 \le z \le b_3$, and write $\vb{F} = \langle P, 0, 0\rangle + \langle 0, Q, 0\rangle + \langle 0, 0, R\rangle$. Both sides of the theorem are sums of the corresponding terms for these three fields, so take $\langle 0, 0, R\rangle$. On the four side faces of the box $\vb{n}$ is horizontal, and $\langle 0, 0, R\rangle\cdot\vb{n} = 0$. On the top $\vb{n} = \vb{k}$, and on the bottom $\vb{n} = -\vb{k}$. With $Z$ the rectangle $a_1 \le x \le b_1$, $a_2 \le y \le b_2$,

$$\begin{aligned} &\iint_S \langle 0, 0, R\rangle\cdot d\vb{S} \\ &\quad= \iint_Z \big[R(x, y, b_3) - R(x, y, a_3)\big]\,dA \\ &\quad= \iint_Z \int_{a_3}^{b_3} \frac{\partial R}{\partial z}\,dz\,dA \\ &\quad= \iiint_E \frac{\partial R}{\partial z}\,dV, \end{aligned}$$

by Part 2 of the Fundamental Theorem in $z$ and Fubini's theorem. In the same way the flux of $\langle P, 0, 0\rangle$ is $\iiint_E P_x\,dV$, and that of $\langle 0, Q, 0\rangle$ is $\iiint_E Q_y\,dV$. Adding the three gives the theorem.
:::

```check
Rf_ = Function('R'); a1_, b1_, a2_, b2_, a3_, b3_ = symbols('a_1 b_1 a_2 b_2 a_3 b_3')
same(integrate(diff(Rf_(x, y, z), z), (z, a3_, b3_)), Rf_(x, y, b3_) - Rf_(x, y, a3_))
Fb = Matrix([x**2*y, y*z**2, x*z**3]); faces = 0
for i_, (lo_, hi_) in enumerate(((0, 1), (0, 2), (0, 3))):           # the box [0, 1] x [0, 2] x [0, 3], face by face
    others = [(w_, l_, h_) for j_, (w_, l_, h_) in enumerate(zip((x, y, z), (0, 0, 0), (1, 2, 3))) if j_ != i_]
    w_i = (x, y, z)[i_]
    faces += integrate(Fb[i_].subs(w_i, hi_) - Fb[i_].subs(w_i, lo_), *others)
same(faces, integrate(div3(Fb), (x, 0, 1), (y, 0, 2), (z, 0, 3)))
```

A solid made of boxes with disjoint interiors follows by adding: on a face shared by two boxes their outward normals point in opposite directions, so the fluxes through it cancel. General solids need a finer argument, beyond this series. The theorem also holds for a solid with cavities, such as a thick spherical shell, when every part of its boundary is oriented away from $E$: the outer surface outwards, and the surface of each cavity into the cavity.

::: example The divergence theorem on a cylinder
Let $\vb{F} = \langle x, y, z^2\rangle$, and let $E$ be the solid cylinder $x^2 + y^2 \le 1$, $0 \le z \le 2$. Check the divergence theorem by computing both sides.

**The volume integral.** $\operatorname{div}\vb{F} = 1 + 1 + 2z = 2 + 2z$. Each horizontal slice of the cylinder is a disc of area $\pi$, on which $2 + 2z$ is constant, so

$$\begin{aligned} \iiint_E (2 + 2z)\,dV &= \int_0^2 (2 + 2z)\,\pi\,dz \\ &= \pi\big[2z + z^2\big]_0^2 = 8\pi. \end{aligned}$$

**The flux.** The boundary has three smooth pieces. On the top ($z = 2$, $\vb{n} = \vb{k}$), $\vb{F}\cdot\vb{n} = z^2 = 4$, so the flux is $4\times\pi = 4\pi$. On the bottom ($z = 0$, $\vb{n} = -\vb{k}$), $\vb{F}\cdot\vb{n} = -z^2 = 0$: flux 0. On the side, where $x^2 + y^2 = 1$, the outward unit normal is $\vb{n} = \langle x, y, 0\rangle$, so $\vb{F}\cdot\vb{n} = x^2 + y^2 = 1$, and the flux is the area of the side, $2\pi\cdot 1\cdot 2 = 4\pi$. In all, $4\pi + 0 + 4\pi = 8\pi$.

```check
F216 = Matrix([x, y, z**2]); same(div3(F216), 2 + 2*z)
antideriv(2*z + z**2, 2 + 2*z, z)
steps(Integral((2 + 2*z)*pi, (z, 0, 2)), pi*((2*2 + 2**2) - 0), 8*pi); same(integrate(div3(F216).subs(pol)*r, (r, 0, 1), (theta, 0, 2*pi), (z, 0, 2)), 8*pi)
top216 = integrate(F216[2].subs(z, 2)*r, (r, 0, 1), (theta, 0, 2*pi)); bot216 = integrate(-F216[2].subs(z, 0)*r, (r, 0, 1), (theta, 0, 2*pi))
same(top216, 4*pi); same(bot216, 0)
Cy = Matrix([cos(theta), sin(theta), z]); NCy = Cy.diff(theta).cross(Cy.diff(z)); same(NCy, Matrix([cos(theta), sin(theta), 0]))
side216 = integrate(F216.subs({x: Cy[0], y: Cy[1], z: Cy[2]}, simultaneous=True).dot(NCy), (theta, 0, 2*pi), (z, 0, 2))
same(side216, 4*pi); same(2*pi*1*2, 4*pi); same(top216 + bot216 + side216, 8*pi)
```
:::

If $\vb{F}$ has continuous first partial derivatives near $P_0$, apply the divergence theorem to small balls $B_r$ centred at $P_0$. The average divergence over each ball tends to its value at $P_0$ by continuity. Thus $(\operatorname{div}\vb{F})(P_0)$ is the limit of the outward flux through the surface of $B_r$ divided by the volume of $B_r$, the outflow per unit volume. Under the theorem's hypotheses, if $\operatorname{div}\vb{F} = 0$ throughout $E$, the flux in equals the flux out.

::: compute Both sides with SymPy
The two theorems can be checked by computer. First Stokes' theorem on the dome of Example 20.15. The helper `at` puts a point into an expression, and `curl` follows Definition 20.6:

```python
import sympy as sp
x, y, z, t, r, th = sp.symbols('x y z t r theta')

def at(e, p):
    """e (an expression or a Matrix in x, y, z) at the point p."""
    return e.subs({x: p[0], y: p[1], z: p[2]}, simultaneous=True)

def curl(F):
    P, Q, R = F
    return sp.Matrix([sp.diff(R, y) - sp.diff(Q, z),
                      sp.diff(P, z) - sp.diff(R, x),
                      sp.diff(Q, x) - sp.diff(P, y)])

F = sp.Matrix([z, x, y])
edge = sp.Matrix([sp.cos(t), sp.sin(t), 0])
print(sp.integrate(at(F, edge).dot(edge.diff(t)), (t, 0, 2*sp.pi)))
```

```output
pi
```

That is the line integral round the edge. For the surface integral, parametrise the dome with polar coordinates, $\vb{r}(r, \theta) = \langle r\cos\theta, r\sin\theta, 1 - r^2\rangle$:

```python
dome = sp.Matrix([r*sp.cos(th), r*sp.sin(th), 1 - r**2])
N = dome.diff(r).cross(dome.diff(th))          # r_r x r_theta
print(sp.simplify(N[2]))
integrand = sp.simplify(at(curl(F), dome).dot(N))
print(sp.integrate(integrand, (r, 0, 1), (th, 0, 2*sp.pi)))
```

```output
r
pi
```

The $z$-component $r$ of $\vb{r}_r\times\vb{r}_\theta$ is positive for $r>0$, so this normal points upwards, as the orientation asks, and both sides are $\pi$. Now the divergence theorem for $\vb{F} = \langle x^3, y^3, z^3\rangle$ and the unit ball, whose surface is the unit sphere of Example 20.11:

```python
phi, rho = sp.symbols('phi rho')
G = sp.Matrix([x**3, y**3, z**3])
sphere = sp.Matrix([sp.sin(phi)*sp.cos(th), sp.sin(phi)*sp.sin(th),
                    sp.cos(phi)])
N = sphere.diff(phi).cross(sphere.diff(th))    # outwards
flux = sp.integrate(sp.simplify(at(G, sphere).dot(N)),
                    (phi, 0, sp.pi), (th, 0, 2*sp.pi))
divG = sp.diff(G[0], x) + sp.diff(G[1], y) + sp.diff(G[2], z)
dV = rho**2*sp.sin(phi)                         # spherical coordinates
inside = sp.integrate(at(divG, rho*sphere)*dV,
                      (rho, 0, 1), (phi, 0, sp.pi), (th, 0, 2*sp.pi))
print(divG)
print(flux, inside)
```

```output
3*x**2 + 3*y**2 + 3*z**2
12*pi/5 12*pi/5
```

The volume integral uses spherical coordinates, with $dV = \rho^2\sin\varphi\,d\rho\,d\varphi\,d\theta$ (Module 19). Again the two sides agree.
:::

```check
domeS = Matrix([r*cos(theta), r*sin(theta), 1 - r**2]); Nd = domeS.diff(r).cross(domeS.diff(theta)); same(Nd[2], r)
same(integrate(simplify(curl3(F215).subs({x: domeS[0], y: domeS[1], z: domeS[2]}, simultaneous=True).dot(Nd)), (r, 0, 1), (theta, 0, 2*pi)), pi)
G3 = Matrix([x**3, y**3, z**3]); S1 = Sph(1); NS1 = S1.diff(phs).cross(S1.diff(ths))
same(div3(G3), 3*x**2 + 3*y**2 + 3*z**2)
same(integrate(simplify(G3.subs({x: S1[0], y: S1[1], z: S1[2]}, simultaneous=True).dot(NS1)), (phs, 0, pi), (ths, 0, 2*pi)), Rational(12, 5)*pi)
same(integrate(div3(G3).subs({x: rs_*S1[0], y: rs_*S1[1], z: rs_*S1[2]}, simultaneous=True)*rs_**2*sin(phs), (rs_, 0, 1), (phs, 0, pi), (ths, 0, 2*pi)), Rational(12, 5)*pi)
```

### Maxwell's equations {#maxwell}

The classic application of these theorems is electromagnetism. Maxwell's equations describe how electric and magnetic fields $\vb{E}$ and $\vb{B}$ are produced by charges and currents, and how they change in time. In SI units, the equations for the fields and total charge and current use fluxes and circulations. For a closed surface $S$ oriented outwards, with $Q$ the electric charge inside it,

$$\begin{aligned} \iint_S \vb{E}\cdot d\vb{S} &= \frac{Q}{\varepsilon_0} \quad\text{(Gauss's law)}, \\ \iint_S \vb{B}\cdot d\vb{S} &= 0, \end{aligned}$$

and for a fixed oriented surface $S$ with positively oriented boundary $C$, with $I$ the signed electric current through $S$ along its chosen normal,

$$\begin{aligned} \oint_C \vb{E}\cdot d\vb{r} &= -\frac{d}{dt}\iint_S \vb{B}\cdot d\vb{S}, \\ \oint_C \vb{B}\cdot d\vb{r} &= \mu_0 I \\ &\quad+ \mu_0\varepsilon_0\frac{d}{dt}\iint_S \vb{E}\cdot d\vb{S}, \end{aligned}$$

where $\varepsilon_0$ and $\mu_0$ are physical constants; the first of these two laws is Faraday's law. In differential form, about divergence and curl at each point, Maxwell's equations read

$$\begin{aligned} \operatorname{div}\vb{E} &= \frac{\rho}{\varepsilon_0}, & \operatorname{div}\vb{B} &= 0, \\ \operatorname{curl}\vb{E} &= -\frac{\partial\vb{B}}{\partial t}, & \operatorname{curl}\vb{B} &= \mu_0\vb{J} + \mu_0\varepsilon_0\frac{\partial\vb{E}}{\partial t}, \end{aligned}$$

where $\rho$ is the charge density (charge per unit volume) and $\vb{J}$ the current density, so $I=\iint_S \vb{J}\cdot d\vb{S}$.

The divergence theorem and Stokes' theorem translate each law from one form to the other, where the fields have continuous first derivatives in space and time and the charge and current densities are continuous. For a fixed surface, a continuous time derivative can be taken inside the flux integral. For Gauss's law, write $Q = \iiint_E \rho\,dV$ for the solid $E$ inside $S$; the divergence theorem turns the left side into $\iiint_E \operatorname{div}\vb{E}\,dV$, so

$$\iiint_E \Big(\operatorname{div}\vb{E} - \frac{\rho}{\varepsilon_0}\Big)\,dV = 0$$

for every solid $E$. If the continuous function in brackets were positive at some point, it would be positive on a small ball around that point, and its integral over that ball would be positive; in the same way it cannot be negative anywhere. So $\operatorname{div}\vb{E} = \rho/\varepsilon_0$ at every point. For the circulation laws, Stokes' theorem gives zero flux of the difference of the two differential expressions through every small disc. If that difference were nonzero at a point, a sufficiently small disc with its normal along the difference there would have positive flux, by continuity. In empty space the four differential equations combine into equations for waves that travel at the speed $1/\sqrt{\mu_0\varepsilon_0}$, which is the speed of light: light is an electromagnetic wave.

```check
qch = symbols('q', real=True); e0 = symbols('varepsilon_0', positive=True)
Eq_ = qch/(4*pi*e0)*Matrix([x, y, z])/(x**2 + y**2 + z**2)**Rational(3, 2)     # the field of a point charge
same(simplify(div3(Eq_)), 0)
same(integrate(simplify(Eq_.subs({x: Sa[0], y: Sa[1], z: Sa[2]}, simultaneous=True).dot(NSa)), (phs, 0, pi), (ths, 0, 2*pi)), qch/e0)
```

## The one pattern {#pattern}

[Module 1](module_01_EN.html#about) began with a car's speedometer and odometer, and with a promise: calculus is about rates and accumulation, and the Fundamental Theorem of Calculus connects them. This module has proved or stated four more theorems of the same kind. Side by side:

| Theorem and region | Integral of a derivative over the region = values on its boundary |
|---|---|
| Fundamental Theorem (Module 10): an interval $[a, b]$ | $\displaystyle\int_a^b F'(x)\,dx = F(b) - F(a)$ |
| Line integrals (Theorem 20.2): a curve from $A$ to $B$ | $\displaystyle\int_C \nabla f\cdot d\vb{r} = f(B) - f(A)$ |
| Green (Theorem 20.6): a plane region $D$ with edge $C$ | $\displaystyle\iint_D (Q_x - P_y)\,dA = \oint_C P\,dx + Q\,dy$ |
| Stokes (Theorem 20.9): a surface $S$ with edge $C$ | $\displaystyle\iint_S \operatorname{curl}\vb{F}\cdot d\vb{S} = \oint_C \vb{F}\cdot d\vb{r}$ |
| Divergence (Theorem 20.10): a solid $E$ with surface $S$ | $\displaystyle\iiint_E \operatorname{div}\vb{F}\,dV = \iint_S \vb{F}\cdot d\vb{S}$ |

Under the hypotheses of each theorem, the left side integrates a derivative over a region, and the right side involves only the thing differentiated, on the region's boundary. The derivative fits the dimension: $F'$ for a function of one variable, the gradient for a scalar field along a curve, the curl for circulation round the edge of a surface, the divergence for flux out of a solid. Each boundary carries the orientation that the region gives it: the edge of a plane region with the region on the left, the edge of a surface by the right-hand rule, the surface of a solid outwards. Even the first row has one: the two ends of $[a, b]$ count with signs, $+F(b)$ and $-F(a)$.

The proofs share one idea as well. For a small piece of the region, the theorem is the Fundamental Theorem in one variable, as in the proofs of Green's theorem and of the divergence theorem for a box. Adding the pieces, everything on the inner boundaries cancels, because each inner boundary belongs to two pieces that trace it in opposite directions; only the outer boundary is left.

Even the identities of Section 20.5 fit the pattern. The boundary of a region has no boundary of its own: a closed curve has no ends, and a closed surface has no edge. Correspondingly, $\operatorname{curl}(\nabla f) = \vb{0}$ and $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$. For example, if $\vb{F}$ meets the hypotheses of Stokes' theorem on a closed surface, the flux of $\operatorname{curl}\vb{F}$ is 0 because the surface has no edge. If the surface bounds a solid and $\vb{F}$ has continuous second partial derivatives near the solid, the divergence theorem gives the same result from $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$. Exercise 20.10 uses this argument.

::: keyidea
Every fundamental theorem says the same thing: **adding up a derivative over a region gives the values on the region's boundary**. Module 1's speedometer and odometer were the first case: add up the rate over a stretch of time, and you get the change between its two ends. In this module the same sentence describes flowing fluids, gravity and electricity, in two and three dimensions.
:::

### Where to go next {#next}

This is the end of the series, and the start of several roads.

- **Differential equations.** Module 13 solved equations for functions of one variable. The laws of physics in differential form, such as Maxwell's equations, are **partial differential equations**: the heat equation, the wave equation, and Laplace's equation $\operatorname{div}(\nabla u) = 0$. The divergence theorem is how a conservation law ("what flows out of a region is what is lost inside it") becomes such an equation, and numerical methods that simulate fluids and heat are built on it.
- **Real analysis** proves, with the ε–δ reasoning of [Section 2.7](module_02_EN.html#precise), results this series uses without a full proof, including the Extreme Value Theorem, the integrability of continuous functions, the more general forms of Fubini's theorem, the change of variables formula, and Green's theorem for general regions.
- **Complex analysis** does calculus with functions of a complex variable, the setting of Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$ in Module 15. Its central theorem, Cauchy's, says that $\oint_C f(z)\,dz = 0$ for a piecewise smooth closed path $C$ when $f$ is complex differentiable throughout an open, simply connected region containing $C$. It is a close relative of Green's theorem. For $1/z$, whose domain has a hole at 0, the $2\pi$ of Example 20.6 returns as $\oint_C dz/z = 2\pi i$ round a circle centred at 0 and traced once anticlockwise.
- **Differential geometry** studies curves and surfaces with calculus: how they bend, and the shortest paths on them. In its language of **differential forms**, the five theorems of the table are one theorem, written $\int_M d\omega = \int_{\partial M} \omega$: the integral of the derivative of $\omega$ over a region $M$ equals the integral of $\omega$ over its boundary $\partial M$.

On this site, [Mathematical Foundations for Computer Science and AI](../math/index.html) continues with linear algebra, probability and statistics, optimisation and numerical computation, and [AI: From Machine Learning to Large Language Models](../ai/index.html) puts gradients and the chain rule to work in neural networks.

```check
zc = symbols('z_c'); same(integrate(exp(I*t)**(-1)*diff(exp(I*t), t), (t, 0, 2*pi)), 2*pi*I)   # dz/z round the unit circle
uL = Function('u')(x, y, z); same(div3(grad3(uL)), diff(uL, x, 2) + diff(uL, y, 2) + diff(uL, z, 2))
```

## What you learned {#summary}

- A **vector field** assigns a vector to each point: wind, fluid velocity, gravity, the electric field, the gradient $\nabla f$ of a function. Its pictures are arrows on a grid, scaled to fit; a **flow line** follows the arrows.
- The **line integral** of a function, $\int_C f\,ds = \int_a^b f\big(\vb{r}(t)\big)\norm{\vb{r}'(t)}\,dt$, adds up $f$ times length (mass, average values). The line integral of a field, $\int_C \vb{F}\cdot d\vb{r} = \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt = \int_C P\,dx + Q\,dy$, adds up the tangential component (work). Neither depends on the parametrisation; the second changes sign when the direction is reversed.
- **The fundamental theorem for line integrals**: $\int_C \nabla f\cdot d\vb{r} = f(B) - f(A)$. A field is **conservative**, $\vb{F} = \nabla f$, exactly when its line integrals are independent of the path, exactly when they are 0 round closed curves. For a planar field with continuous first partial derivatives on an open region, $P_y = Q_x$ is necessary. On a **simply connected** region it is sufficient; $\langle -y, x\rangle/(x^2 + y^2)$, with circulation $2\pi$ round the origin, shows why the region matters. Find a potential by integrating one variable at a time.
- **Green's theorem**: $\oint_C P\,dx + Q\,dy = \iint_D (Q_x - P_y)\,dA$ for a positively oriented, piecewise smooth, simple closed curve and components with continuous first partial derivatives on a neighbourhood of the enclosed region. Its flux form is $\oint_C \vb{F}\cdot\vb{n}\,ds = \iint_D (P_x + Q_y)\,dA$. Areas are line integrals, $A = \tfrac12\oint_C x\,dy - y\,dx$: the planimeter and the shoelace formula.
- $\operatorname{curl}\vb{F} = \nabla\times\vb{F}$ measures rotation (circulation per unit area; twice the angular velocity of a rigid rotation), and $\operatorname{div}\vb{F} = \nabla\cdot\vb{F}$ measures expansion (outflow per unit area or volume). With continuous second partial derivatives, $\operatorname{curl}(\nabla f) = \vb{0}$ and $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$.
- A **parametric surface** $\vb{r}(u, v)$ has normal $\vb{r}_u\times\vb{r}_v$, area $\iint_D \norm{\vb{r}_u\times\vb{r}_v}\,dA$, surface integrals $\iint_S f\,dS$, and **flux** $\iint_S \vb{F}\cdot d\vb{S} = \iint_D \vb{F}\big(\vb{r}(u,v)\big)\cdot(\vb{r}_u\times\vb{r}_v)\,dA$ when the cross product agrees with the chosen orientation.
- **Stokes' theorem**, $\oint_C \vb{F}\cdot d\vb{r} = \iint_S \operatorname{curl}\vb{F}\cdot d\vb{S}$ (with the right-hand rule), and the **divergence theorem**, $\iint_S \vb{F}\cdot d\vb{S} = \iiint_E \operatorname{div}\vb{F}\,dV$ (outward normal), carry Green's theorem into space. The field needs continuous first partial derivatives near the surface for Stokes' theorem and near the solid for the divergence theorem. The two theorems relate Maxwell's integral and differential equations.
- All the fundamental theorems share one pattern: the integral of a derivative over a region equals the values on its boundary.

## Exercises {#exercises}

:::: exercise Reading a field {#ex-20-1} ★
Let $\vb{F}(x, y) = \langle x - y, x + y\rangle$.

- (a) Find $\vb{F}$ at $(1, 0)$, $(0, 1)$, $(-1, 0)$, $(0, -1)$ and $(1, 1)$, and describe the picture.
- (b) Write $\vb{F}$ as the sum of two fields of Example 20.1, and find $Q_x - P_y$ and $P_x + Q_y$.
- (c) Is $\vb{F}$ conservative?

::: solution
**(a)** $\vb{F}(1, 0) = \langle 1, 1\rangle$, $\vb{F}(0, 1) = \langle -1, 1\rangle$, $\vb{F}(-1, 0) = \langle -1, -1\rangle$, $\vb{F}(0, -1) = \langle 1, -1\rangle$ and $\vb{F}(1, 1) = \langle 0, 2\rangle$. Each arrow points outwards and anticlockwise at once. In general $\vb{F}\cdot\langle x, y\rangle = x^2 + y^2$ and $\norm{\vb{F}} = \sqrt{2}\sqrt{x^2 + y^2}$, so away from the origin the angle $\alpha$ between $\vb{F}$ and the position vector has $\cos\alpha = 1/\sqrt2$: every arrow makes an angle of $\pi/4$ with the direction away from the origin. A fluid with this velocity spirals outwards.

**(b)** $\langle x - y, x + y\rangle = \langle -y, x\rangle + \langle x, y\rangle$, the rotation field plus the source. $Q_x - P_y = 1 - (-1) = 2$ and $P_x + Q_y = 1 + 1 = 2$: the field turns like the rotation field and spreads like the source.

**(c)** No: $P_y = -1$ and $Q_x = 1$ differ, so by Theorem 20.4 it is not conservative on any open region.

```check
F_e1 = Matrix([x - y, x + y])
same([F_e1.subs({x: p_[0], y: p_[1]}) for p_ in [(1, 0), (0, 1), (-1, 0), (0, -1), (1, 1)]], [Matrix([1, 1]), Matrix([-1, 1]), Matrix([-1, -1]), Matrix([1, -1]), Matrix([0, 2])])
same(F_e1.dot(Matrix([x, y])), x**2 + y**2); same(F_e1.subs({x: xr, y: yr}).norm(), sqrt(2)*sqrt(xr**2 + yr**2))
same((xr**2 + yr**2)/(sqrt(2)*sqrt(xr**2 + yr**2)*sqrt(xr**2 + yr**2)), 1/sqrt(2)); same(acos(1/sqrt(2)), pi/4)
same(F_e1, Matrix([-y, x]) + Matrix([x, y]))
same(diff(F_e1[1], x) - diff(F_e1[0], y), 2); same(diff(F_e1[0], x) + diff(F_e1[1], y), 2)
```
:::
::::

:::: exercise A helical spring {#ex-20-2} ★
A wire is wound along one turn of the helix $\vb{r}(t) = \langle 3\cos t, 3\sin t, 4t\rangle$, $0 \le t \le 2\pi$, with lengths in centimetres.

- (a) Find the length of the wire.
- (b) Let $C$ be the path of the wire. Find $\int_C z\,ds$ and the average height of the wire.
- (c) Does the answer to (b) change if the helix is traced from top to bottom?

::: solution
**(a)** $\vb{r}'(t) = \langle -3\sin t, 3\cos t, 4\rangle$, so $\norm{\vb{r}'(t)} = \sqrt{9\sin^2 t + 9\cos^2 t + 16} = \sqrt{25} = 5$. The length is $\int_0^{2\pi} 5\,dt = 10\pi \approx 31.42$ cm.

**(b)** On the wire $z = 4t$, so

$$\begin{aligned} \int_C z\,ds &= \int_0^{2\pi} 4t\cdot 5\,dt \\ &= 20\Big[\frac{t^2}{2}\Big]_0^{2\pi} \\ &= 40\pi^2 \approx 394.8\text{ cm}^2. \end{aligned}$$

The average height is $40\pi^2/(10\pi) = 4\pi \approx 12.57$ cm: half the height of the top of the wire, $8\pi$, because the wire climbs at a steady rate.

**(c)** No. By Theorem 20.1, $\int_{-C} f\,ds = \int_C f\,ds$. For instance, $\vb{r}(2\pi - t)$ traces the helix from the top, and gives $\int_0^{2\pi} 4(2\pi - t)\cdot 5\,dt = 40\pi^2$ again.

```check
hx = Matrix([3*cos(t), 3*sin(t), 4*t]); same(hx.diff(t), Matrix([-3*sin(t), 3*cos(t), 4])); same(sqrt(simplify(hx.diff(t).dot(hx.diff(t)))), 5)
same(integrate(5, (t, 0, 2*pi)), 10*pi); rounds(10*pi, '31.42')
steps(Integral(4*t*5, (t, 0, 2*pi)), 20*(2*pi)**2/2, 40*pi**2); rounds(40*pi**2, '394.8')
same(40*pi**2/(10*pi), 4*pi); rounds(4*pi, '12.57'); same(hx[2].subs(t, 2*pi)/2, 4*pi)
same(integrate(4*(2*pi - t)*5, (t, 0, 2*pi)), 40*pi**2)
```
:::
::::

:::: exercise Work and direction {#ex-20-3} ★
Let $\vb{F}(x, y) = \langle y, 2x\rangle$. Find the work done by $\vb{F}$:

- (a) along the quarter of the unit circle from $(1, 0)$ to $(0, 1)$, anticlockwise;
- (b) along the same quarter circle from $(0, 1)$ to $(1, 0)$;
- (c) along the straight segment from $(1, 0)$ to $(0, 1)$.

What does the comparison of (a) and (c) tell you about $\vb{F}$?

::: solution
**(a)** Take $\vb{r}(t) = \langle\cos t, \sin t\rangle$, $0 \le t \le \pi/2$. Then $\vb{F}\big(\vb{r}(t)\big) = \langle\sin t, 2\cos t\rangle$ and $\vb{r}'(t) = \langle -\sin t, \cos t\rangle$, so $\vb{F}\cdot\vb{r}' = -\sin^2 t + 2\cos^2 t$. Since $\int_0^{\pi/2} \sin^2 t\,dt = \int_0^{\pi/2} \cos^2 t\,dt = \pi/4$ ([Exercise 10.12](module_10_EN.html#ex-10-12)),

$$W = -\frac{\pi}{4} + 2\cdot\frac{\pi}{4} = \frac{\pi}{4} \approx 0.785.$$

**(b)** The same curve in the opposite direction: by Theorem 20.1, $W = -\pi/4$.

**(c)** Take $\vb{r}(t) = \langle 1 - t, t\rangle$, $0 \le t \le 1$. Then $\vb{F}\big(\vb{r}(t)\big) = \langle t, 2(1 - t)\rangle$ and $\vb{r}'(t) = \langle -1, 1\rangle$, so $\vb{F}\cdot\vb{r}' = -t + 2 - 2t = 2 - 3t$, and $W = \int_0^1 (2 - 3t)\,dt = 2 - \tfrac32 = \tfrac12$.

Two paths with the same ends give different work, $\pi/4$ and $\tfrac12$, so $\vb{F}$ is not conservative (Theorem 20.3). The test agrees: $P_y = 1$ and $Q_x = 2$ differ.

```check
F_e3 = Matrix([y, 2*x]); qc = Matrix([cos(t), sin(t)])
same(F_e3.subs({x: cos(t), y: sin(t)}), Matrix([sin(t), 2*cos(t)])); same(Matrix([sin(t), 2*cos(t)]).dot(qc.diff(t)), -sin(t)**2 + 2*cos(t)**2)
same(integrate(sin(t)**2, (t, 0, pi/2)), pi/4); same(integrate(cos(t)**2, (t, 0, pi/2)), pi/4)
same(lint(F_e3, qc, 0, pi/2), pi/4); rounds(pi/4, '0.785'); same(lint(F_e3, [cos(pi/2 - t), sin(pi/2 - t)], 0, pi/2), -pi/4)
sg = Matrix([1 - t, t]); same(F_e3.subs({x: 1 - t, y: t}).dot(sg.diff(t)), 2 - 3*t); same(lint(F_e3, sg, 0, 1), Rational(1, 2))
same(diff(y, y), 1); same(diff(2*x, x), 2)
```
:::
::::

:::: exercise Curl and divergence {#ex-20-4} ★
Let $\vb{F}(x, y, z) = \langle x^2y, -xy^2, z\rangle$.

- (a) Find $\operatorname{curl}\vb{F}$ and $\operatorname{div}\vb{F}$.
- (b) Is $\vb{F}$ conservative?
- (c) Is $\vb{F}$ the curl of some field $\vb{G}$ whose components have continuous second partial derivatives?

::: solution
**(a)** With $P = x^2y$, $Q = -xy^2$ and $R = z$:

$$\begin{aligned} &\operatorname{curl}\vb{F} \\ &\quad= \langle 0 - 0,\ 0 - 0,\ -y^2 - x^2\rangle \\ &\quad= \langle 0, 0, -(x^2 + y^2)\rangle, \\ &\operatorname{div}\vb{F} = 2xy - 2xy + 1 = 1. \end{aligned}$$

**(b)** No. If $\vb{F} = \nabla f$, then $f$ would have continuous second partial derivatives (the first partial derivatives of $P$, $Q$ and $R$), so $\operatorname{curl}\vb{F} = \operatorname{curl}(\nabla f) = \vb{0}$ by Theorem 20.8. But at $(1, 0, 0)$, $\operatorname{curl}\vb{F} = \langle 0, 0, -1\rangle$.

**(c)** No. By Theorem 20.8, $\operatorname{div}(\operatorname{curl}\vb{G}) = 0$, but $\operatorname{div}\vb{F} = 1$.

```check
F_e4 = Matrix([x**2*y, -x*y**2, z]); same(curl3(F_e4), Matrix([0, 0, -(x**2 + y**2)])); same(div3(F_e4), 1)
same(curl3(F_e4).subs({x: 1, y: 0, z: 0}), Matrix([0, 0, -1]))
```
:::
::::

:::: exercise A potential in the plane {#ex-20-5} ★★
Let $\vb{F}(x, y) = \langle 3x^2y + y,\ x^3 + x + 2y\rangle$.

- (a) Show that $\vb{F}$ is conservative.
- (b) Find a potential.
- (c) Find $\int_C \vb{F}\cdot d\vb{r}$, where $C$ is traced by $\vb{r}(t) = \langle t^2, t^3 + 1\rangle$, $0 \le t \le 1$.
- (d) What is $\oint_C \vb{F}\cdot d\vb{r}$ round any closed curve?

::: solution
**(a)** $P_y = 3x^2 + 1$ and $Q_x = 3x^2 + 1$ are equal and continuous on the whole plane, which is simply connected, so $\vb{F}$ is conservative by Theorem 20.5.

**(b)** Integrate $P$ with respect to $x$: $f = x^3y + xy + g(y)$. Then $f_y = x^3 + x + g'(y)$, and comparing with $Q$ gives $g'(y) = 2y$, so $g(y) = y^2$ (taking the constant 0) and

$$f(x, y) = x^3y + xy + y^2.$$

Check: $f_x = 3x^2y + y$ and $f_y = x^3 + x + 2y$.

**(c)** The curve runs from $\vb{r}(0) = (0, 1)$ to $\vb{r}(1) = (1, 2)$. The velocity vanishes only at the first endpoint, which is allowed in Theorem 20.2. So

$$\begin{aligned} &\int_C \vb{F}\cdot d\vb{r} = f(1, 2) - f(0, 1) \\ &\quad= (2 + 2 + 4) - (0 + 0 + 1) \\ &\quad= 7. \end{aligned}$$

Computing $\int_0^1 \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt$ directly gives 7 too, after expanding a polynomial of degree 8.

**(d)** 0, by Theorem 20.3: $\vb{F}$ is conservative on the whole plane.

```check
P_e5, Q_e5 = 3*x**2*y + y, x**3 + x + 2*y
same(diff(P_e5, y), 3*x**2 + 1); same(diff(Q_e5, x), 3*x**2 + 1)
antideriv(x**3*y + x*y, P_e5, x); same(Q_e5 - diff(x**3*y + x*y, y), 2*y)
f_e5 = x**3*y + x*y + y**2; same(Matrix([diff(f_e5, x), diff(f_e5, y)]), Matrix([P_e5, Q_e5]))
c_e5 = Matrix([t**2, t**3 + 1]); same(c_e5.subs(t, 0), Matrix([0, 1])); same(c_e5.subs(t, 1), Matrix([1, 2]))
same(f_e5.subs({x: 1, y: 2}) - f_e5.subs({x: 0, y: 1}), 7); same(lint(Matrix([P_e5, Q_e5]), c_e5, 0, 1), 7)
same(degree(expand(Matrix([P_e5, Q_e5]).subs({x: c_e5[0], y: c_e5[1]}, simultaneous=True).dot(c_e5.diff(t))), t), 8)
```
:::
::::

:::: exercise A potential in space {#ex-20-6} ★★
Let $\vb{F}(x, y, z) = \langle 2xy + z^2,\ x^2 + 2yz,\ y^2 + 2xz\rangle$.

- (a) Show that $\operatorname{curl}\vb{F} = \vb{0}$.
- (b) Find a potential $f$.
- (c) Find the work done by $\vb{F}$ along the helix $\vb{r}(t) = \langle\cos t, \sin t, t\rangle$, $0 \le t \le \pi$.

::: solution
**(a)**

$$\begin{aligned} &\operatorname{curl}\vb{F} \\ &\enspace= \langle 2y - 2y, 2z - 2z, 2x - 2x\rangle \\ &\enspace= \vb{0}. \end{aligned}$$

Space is simply connected, so $\vb{F}$ is conservative (Section 20.5).

**(b)** Integrate $P$ with respect to $x$: $f = x^2y + xz^2 + g(y, z)$, where the "constant" may depend on $y$ and $z$. Then $f_y = x^2 + g_y = x^2 + 2yz$, so $g_y = 2yz$ and $g = y^2z + h(z)$. Then $f_z = 2xz + y^2 + h'(z) = y^2 + 2xz$, so $h'(z) = 0$; take $h = 0$:

$$f(x, y, z) = x^2y + xz^2 + y^2z.$$

**(c)** The helix runs from $\vb{r}(0) = (1, 0, 0)$ to $\vb{r}(\pi) = (-1, 0, \pi)$. By Theorem 20.2,

$$\begin{aligned} W &= f(-1, 0, \pi) - f(1, 0, 0) \\ &= (0 - \pi^2 + 0) - 0 = -\pi^2. \end{aligned}$$

```check
F_e6 = Matrix([2*x*y + z**2, x**2 + 2*y*z, y**2 + 2*x*z]); same(curl3(F_e6), zeros(3, 1))
same(curl3(F_e6), Matrix([2*y - 2*y, 2*z - 2*z, 2*x - 2*x]))
antideriv(x**2*y + x*z**2, F_e6[0], x); same(F_e6[1] - diff(x**2*y + x*z**2, y), 2*y*z); antideriv(y**2*z, 2*y*z, y)
same(F_e6[2] - diff(x**2*y + x*z**2 + y**2*z, z), 0)
f_e6 = x**2*y + x*z**2 + y**2*z; same(grad3(f_e6), F_e6)
hl = Matrix([cos(t), sin(t), t]); same(hl.subs(t, 0), Matrix([1, 0, 0])); same(hl.subs(t, pi), Matrix([-1, 0, pi]))
same(f_e6.subs({x: -1, y: 0, z: pi}) - f_e6.subs({x: 1, y: 0, z: 0}), -pi**2); same(lint(F_e6, hl, 0, pi), -pi**2)
```
:::
::::

:::: exercise Green's theorem on a square {#ex-20-7} ★★
Let $P = xy$ and $Q = x^2$, and let $C$ be the boundary of the square $0 \le x \le 1$, $0 \le y \le 1$, traced anticlockwise.

- (a) Compute $\oint_C P\,dx + Q\,dy$ directly, edge by edge.
- (b) Compute it with Green's theorem.
- (c) What is the answer if $C$ is traced clockwise?

::: solution
**(a)** Along the bottom ($y = 0$, $x$ from 0 to 1): $P = 0$ and $dy = 0$, so the edge gives 0. Up the right side ($x = 1$, $y$ from 0 to 1): $dx = 0$ and $Q = 1$, so it gives $\int_0^1 1\,dy = 1$. Along the top ($y = 1$, $x$ from 1 back to 0): $P = x$ and $dy = 0$, so it gives $\int_1^0 x\,dx = -\tfrac12$. Down the left side ($x = 0$): $dx = 0$ and $Q = 0$, so it gives 0. In all, $0 + 1 - \tfrac12 + 0 = \tfrac12$.

**(b)** $Q_x - P_y = 2x - x = x$, so

$$\begin{aligned} \oint_C P\,dx + Q\,dy &= \int_0^1\!\!\int_0^1 x\,dx\,dy \\ &= \frac12. \end{aligned}$$

**(c)** $-\tfrac12$: reversing the direction changes the sign of the line integral (Theorem 20.1), and Green's theorem in the form stated needs the anticlockwise direction.

```check
F_e7 = Matrix([x*y, x**2])
edges7 = [lint(F_e7, [t, 0], 0, 1), lint(F_e7, [1, t], 0, 1), lint(F_e7, [1 - t, 1], 0, 1), lint(F_e7, [0, 1 - t], 0, 1)]
same(edges7, [0, 1, -Rational(1, 2), 0]); same(integrate(x, (x, 1, 0)), -Rational(1, 2)); same(sum(edges7), Rational(1, 2))
same(diff(x**2, x) - diff(x*y, y), x); same(integrate(x, (x, 0, 1), (y, 0, 1)), Rational(1, 2))
same(lint(F_e7, [0, t], 0, 1) + lint(F_e7, [t, 1], 0, 1) + lint(F_e7, [1, 1 - t], 0, 1) + lint(F_e7, [1 - t, 0], 0, 1), -Rational(1, 2))
```
:::
::::

:::: exercise Areas from boundaries {#ex-20-8} ★★
- (a) Use the shoelace formula to find the area of the quadrilateral with corners $(0, 0)$, $(4, 0)$, $(5, 3)$ and $(1, 4)$, and check the answer by cutting it into two triangles.
- (b) Find the area enclosed by the astroid $x = \cos^3 t$, $y = \sin^3 t$, $0 \le t \le 2\pi$.

::: solution
**(a)** The corners are listed anticlockwise. The four terms $x_ky_{k+1} - x_{k+1}y_k$ are

$$\begin{aligned} &0\cdot0 - 4\cdot0 = 0, \\ &4\cdot3 - 5\cdot0 = 12, \\ &5\cdot4 - 1\cdot3 = 17, \\ &1\cdot0 - 0\cdot4 = 0, \end{aligned}$$

so $A = \tfrac12(0 + 12 + 17 + 0) = \tfrac{29}{2} = 14.5$. The diagonal from $(0, 0)$ to $(5, 3)$ cuts the quadrilateral into two triangles. Half the magnitude of the cross product of the two sides from the origin (Module 16) gives their areas $\tfrac12(4\cdot3 - 5\cdot0) = 6$ and $\tfrac12(5\cdot4 - 1\cdot3) = \tfrac{17}{2}$, and $6 + \tfrac{17}{2} = \tfrac{29}{2}$.

**(b)** Here $dx = -3\cos^2 t\sin t\,dt$ and $dy = 3\sin^2 t\cos t\,dt$, and the astroid is traced anticlockwise. The velocity is nonzero between successive axis crossings and zero at the four cusps. Split the boundary at the cusps to get a piecewise smooth path. So

$$\begin{aligned} &x\,dy - y\,dx \\ &\quad= \big(3\cos^4 t\sin^2 t \\ &\qquad\quad + 3\sin^4 t\cos^2 t\big)\,dt \\ &\quad= 3\sin^2 t\cos^2 t\,dt \\ &\quad= \tfrac34\sin^2 2t\,dt, \end{aligned}$$

taking out the factor $3\sin^2 t\cos^2 t$ and using $\cos^2 t + \sin^2 t = 1$ and $\sin 2t = 2\sin t\cos t$. Since $\int_0^{2\pi} \sin^2 2t\,dt = \pi$,

$$\begin{aligned} A &= \frac12\int_0^{2\pi} \frac34\sin^2 2t\,dt \\ &= \frac{3\pi}{8} \approx 1.178. \end{aligned}$$

```check
same(sh([(0, 0), (4, 0), (5, 3), (1, 4)]), Rational(29, 2)); same(Rational(29, 2), Rational(145, 10))
quad20 = [(0, 0), (4, 0), (5, 3), (1, 4)]
same([a_[0]*b_[1] - b_[0]*a_[1] for a_, b_ in zip(quad20, quad20[1:] + quad20[:1])], [0, 12, 17, 0])
p20, q20, r20 = [Matrix([px_, py_, 0]) for px_, py_ in quad20[1:]]
same(p20.cross(q20).norm()/2, 6); same(q20.cross(r20).norm()/2, Rational(17, 2))
same(6 + Rational(17, 2), Rational(29, 2))
xa, ya = cos(t)**3, sin(t)**3; same(diff(xa, t), -3*cos(t)**2*sin(t)); same(diff(ya, t), 3*sin(t)**2*cos(t))
steps(xa*diff(ya, t) - ya*diff(xa, t), 3*cos(t)**4*sin(t)**2 + 3*sin(t)**4*cos(t)**2, 3*sin(t)**2*cos(t)**2, Rational(3, 4)*sin(2*t)**2)
same(integrate(sin(2*t)**2, (t, 0, 2*pi)), pi); same(integrate(Rational(3, 8)*sin(2*t)**2, (t, 0, 2*pi)), 3*pi/8); rounds(3*pi/8, '1.178')
```
:::
::::

:::: exercise Flux through a dome {#ex-20-9} ★★
Let $\vb{F} = \langle x, y, z\rangle$, and let $S$ be the dome $z = 1 - x^2 - y^2$, $z \ge 0$, oriented upwards.

- (a) Compute the flux of $\vb{F}$ across $S$.
- (b) Check your answer with the divergence theorem, applied to the solid $E$ between the dome and the unit disc in the $xy$-plane.

::: solution
**(a)** As in Example 20.15, the upward normal of the graph is $\langle 2x, 2y, 1\rangle$, and on the dome $\vb{F} = \langle x, y, 1 - x^2 - y^2\rangle$. So

$$\begin{aligned} &\vb{F}\cdot\langle 2x, 2y, 1\rangle \\ &\quad= 2x^2 + 2y^2 + 1 - x^2 - y^2 \\ &\quad= 1 + x^2 + y^2, \end{aligned}$$

and over the unit disc $D$, in polar coordinates,

$$\begin{aligned} &\iint_S \vb{F}\cdot d\vb{S} \\ &\quad= \int_0^{2\pi}\!\!\int_0^1 (1 + r^2)\,r\,dr\,d\theta \\ &\quad= 2\pi\Big(\frac12 + \frac14\Big) = \frac{3\pi}{2}. \end{aligned}$$

**(b)** The boundary of $E$ is the dome, oriented outwards (upwards), and the disc, oriented outwards, which here means downwards: $\vb{n} = -\vb{k}$. On the disc $z = 0$, so $\vb{F}\cdot\vb{n} = -z = 0$, and its flux is 0. So the flux out of $E$ is $\tfrac{3\pi}{2} + 0$. On the other side, $\operatorname{div}\vb{F} = 3$, and the volume of $E$ is $\int_0^{2\pi}\int_0^1 (1 - r^2)\,r\,dr\,d\theta = 2\pi\big(\tfrac12 - \tfrac14\big) = \tfrac{\pi}{2}$, so $\iiint_E 3\,dV = \tfrac{3\pi}{2}$. The two agree.

```check
F_e9 = Matrix([x, y, z]); same(F_e9.subs(z, gd).dot(Matrix([2*x, 2*y, 1])), 1 + x**2 + y**2)
same(integrate((1 + r**2)*r, (r, 0, 1), (theta, 0, 2*pi)), 3*pi/2); same(2*pi*(Rational(1, 2) + Rational(1, 4)), 3*pi/2)
same(F_e9.subs(z, 0).dot(Matrix([0, 0, -1])), 0); same(div3(F_e9), 3)
same(integrate((1 - r**2)*r, (r, 0, 1), (theta, 0, 2*pi)), pi/2); same(3*pi/2, 3*(pi/2))
```
:::
::::

:::: exercise One boundary, two surfaces {#ex-20-10} ★★★
Let $\vb{F} = \big\langle -y^3,\ x^3,\ e^z\sin(xy)\big\rangle$, let $H$ be the hemisphere $x^2 + y^2 + z^2 = 1$, $z \ge 0$, oriented outwards, and let $D$ be the unit disc in the $xy$-plane, oriented upwards.

- (a) Use Stokes' theorem to show that $\iint_H \operatorname{curl}\vb{F}\cdot d\vb{S} = \iint_D \operatorname{curl}\vb{F}\cdot d\vb{S}$, and compute the common value.
- (b) Explain the equality in (a) again, with the divergence theorem instead.

::: solution
**(a)** Both surfaces have the same boundary, the unit circle $C$, and the outward normal on $H$ and the upward normal on $D$ both induce the anticlockwise orientation when seen from above. By Stokes' theorem both fluxes equal $\oint_C \vb{F}\cdot d\vb{r}$. With $\vb{r}(t) = \langle\cos t, \sin t, 0\rangle$, $\vb{F}\big(\vb{r}(t)\big) = \langle -\sin^3 t, \cos^3 t, \sin(\cos t\sin t)\rangle$ and $\vb{r}'(t) = \langle -\sin t, \cos t, 0\rangle$, so the integrand is $\sin^4 t + \cos^4 t$. Since

$$\begin{aligned} &\sin^4 t + \cos^4 t \\ &\quad= \big(\sin^2 t + \cos^2 t\big)^2 \\ &\qquad - 2\sin^2 t\cos^2 t \\ &\quad= 1 - \tfrac12\sin^2 2t, \end{aligned}$$

the circulation is $2\pi - \tfrac12\cdot\pi = \tfrac{3\pi}{2}$. Over the flat disc the computation is short too: $\operatorname{curl}\vb{F}\cdot\vb{k} = Q_x - P_y = 3x^2 + 3y^2$, and $\int_0^{2\pi}\int_0^1 3r^2\cdot r\,dr\,d\theta = \tfrac{3\pi}{2}$. On the hemisphere, by contrast, $\operatorname{curl}\vb{F}$ has the components $xe^z\cos(xy)$ and $-ye^z\cos(xy)$ as well, and the direct computation is unpleasant.

**(b)** $H$, oriented outwards, together with $D$, oriented downwards, is the closed surface of the solid half ball $E$, oriented outwards. By the divergence theorem the flux of $\operatorname{curl}\vb{F}$ out of $E$ is $\iiint_E \operatorname{div}(\operatorname{curl}\vb{F})\,dV = 0$, by Theorem 20.8. So the flux up through $H$ plus the flux down through $D$ is 0: the flux up through $H$ equals the flux up through $D$.

```check
F_e10 = Matrix([-y**3, x**3, exp(z)*sin(x*y)]); ce = Matrix([cos(t), sin(t), 0])
same(F_e10.subs({x: cos(t), y: sin(t), z: 0}, simultaneous=True), Matrix([-sin(t)**3, cos(t)**3, sin(cos(t)*sin(t))]))
same(F_e10.subs({x: cos(t), y: sin(t), z: 0}, simultaneous=True).dot(ce.diff(t)), sin(t)**4 + cos(t)**4)
steps(sin(t)**4 + cos(t)**4, (sin(t)**2 + cos(t)**2)**2 - 2*sin(t)**2*cos(t)**2, 1 - sin(2*t)**2/2)
same(integrate(1 - sin(2*t)**2/2, (t, 0, 2*pi)), 3*pi/2); same(lint(F_e10, ce, 0, 2*pi), 3*pi/2)
cF10 = curl3(F_e10); same(cF10, Matrix([x*exp(z)*cos(x*y), -y*exp(z)*cos(x*y), 3*x**2 + 3*y**2]))
same(integrate(3*r**2*r, (r, 0, 1), (theta, 0, 2*pi)), 3*pi/2); same(div3(cF10), 0)
import numpy as np_
fH = lambdify((phs, ths), cF10.subs({x: Sph(1)[0], y: Sph(1)[1], z: Sph(1)[2]}, simultaneous=True).dot(NS1), 'numpy')
gp, gw = np_.polynomial.legendre.leggauss(40); hp, hw = np_.polynomial.legendre.leggauss(80)
PH, TH = np_.meshgrid(np_.pi/4*(gp + 1), np_.pi*(hp + 1), indexing='ij')
near(float((np_.outer(gw, hw)*fH(PH, TH)).sum()*(np_.pi/4)*np_.pi), 3*pi/2, 1e-9)       # the flux through the hemisphere, numerically
```
:::
::::

:::: exercise The vortex round any curve {#ex-20-11} ★★★
Let $\vb{F} = \big\langle -y, x\big\rangle/(x^2 + y^2)$, the field of Example 20.6.

- (a) Show that the line integral of $\vb{F}$ anticlockwise round the circle $C_\varepsilon$ of radius $\varepsilon$ centred at the origin is $2\pi$, for every $\varepsilon > 0$.
- (b) Let $C$ be a positively oriented, piecewise smooth, simple closed curve whose inside contains the origin. Use Green's theorem for a region with a hole to show that $\oint_C \vb{F}\cdot d\vb{r} = 2\pi$.
- (c) What is $\oint_C \vb{F}\cdot d\vb{r}$ if the origin is strictly outside $C$?

::: solution
**(a)** With $\vb{r}(t) = \langle\varepsilon\cos t, \varepsilon\sin t\rangle$, $x^2 + y^2 = \varepsilon^2$, so $\vb{F}\big(\vb{r}(t)\big) = \tfrac{1}{\varepsilon}\langle -\sin t, \cos t\rangle$, while $\vb{r}'(t) = \varepsilon\langle -\sin t, \cos t\rangle$. Their dot product is $\sin^2 t + \cos^2 t = 1$: the $\varepsilon$'s cancel, and the line integral is $2\pi$.

**(b)** The inside of $C$ is open and contains the origin, so it contains a small circle $C_\varepsilon$ with its disc. Let $R$ be the region between $C$ and $C_\varepsilon$, a region with one hole. Its boundary, traced with $R$ on the left, is $C$ anticlockwise together with $C_\varepsilon$ clockwise. $P$ and $Q$ have continuous partial derivatives everywhere except at the origin, which is not in $R$, and by Example 20.6, $Q_x - P_y = 0$ there. So Green's theorem for $R$ gives

$$\begin{aligned} &\oint_C \vb{F}\cdot d\vb{r} + \oint_{-C_\varepsilon} \vb{F}\cdot d\vb{r} \\ &\quad= \iint_R 0\,dA = 0, \end{aligned}$$

and $\oint_C \vb{F}\cdot d\vb{r} = \oint_{C_\varepsilon} \vb{F}\cdot d\vb{r} = 2\pi$, by (a).

**(c)** 0. Now the region $D$ inside $C$ does not contain the origin, and $\vb{F}$ has continuous partial derivatives on an open region that contains $D$ (the plane without a small enough disc about the origin). Green's theorem gives $\oint_C \vb{F}\cdot d\vb{r} = \iint_D 0\,dA = 0$. So the line integral of $\vb{F}$ round a simple closed curve is $2\pi$ or 0, depending only on whether the curve goes round the origin: this is how $\vb{F}$ counts turns. When $C$ passes through the origin, the field is undefined there, so the ordinary line integral definition does not apply.

```check
ep = symbols('varepsilon', positive=True); ceps = Matrix([ep*cos(t), ep*sin(t)])
same(Matrix([P206, Q206]).subs({x: ceps[0], y: ceps[1]}, simultaneous=True), Matrix([-sin(t), cos(t)])/ep); same(ceps.diff(t), ep*Matrix([-sin(t), cos(t)]))
same(lint(Matrix([P206, Q206]), ceps, 0, 2*pi), 2*pi)
same(simplify(diff(Q206, x) - diff(P206, y)), 0)
same(lint(Matrix([P206, Q206]), [3 + cos(t), sin(t)], 0, 2*pi), 0)                   # a circle that does not go round the origin
near(Integral(Matrix([P206, Q206]).subs({x: 2*cos(t) + Rational(1, 2), y: sin(t)}, simultaneous=True).dot(Matrix([-2*sin(t), cos(t)])), (t, 0, 2*pi)).evalf(30), 2*pi, 1e-20)   # an ellipse round it
```
:::
::::

:::: exercise Gauss's law {#ex-20-12} ★★★
Let $\vb{F} = \vb{r}/\norm{\vb{r}}^3$, with $\vb{r} = \langle x, y, z\rangle$, on space without the origin.

- (a) Show that $\operatorname{div}\vb{F} = 0$.
- (b) Show that the outward flux of $\vb{F}$ across every sphere centred at the origin is $4\pi$.
- (c) Let $S$ be a closed, piecewise smooth surface, bounding a solid whose inside contains the origin. Show that the outward flux of $\vb{F}$ across $S$ is $4\pi$.
- (d) The electric field of a point charge $q$ at the origin is $\vb{E} = \dfrac{q}{4\pi\varepsilon_0}\vb{F}$. Deduce Gauss's law for it: the flux of $\vb{E}$ out of $S$ is $q/\varepsilon_0$.

::: solution
**(a)** Write $\norm{\vb{r}} = \rho$, so $P = x\rho^{-3}$ with $\rho^2 = x^2 + y^2 + z^2$. By the product and chain rules, $\partial\rho/\partial x = x/\rho$ and

$$\begin{aligned} P_x &= \rho^{-3} - 3x\rho^{-4}\cdot\frac{x}{\rho} \\ &= \frac{\rho^2 - 3x^2}{\rho^5}. \end{aligned}$$

In the same way $Q_y = (\rho^2 - 3y^2)/\rho^5$ and $R_z = (\rho^2 - 3z^2)/\rho^5$, and the sum is $\big(3\rho^2 - 3(x^2 + y^2 + z^2)\big)/\rho^5 = 0$.

**(b)** On the sphere of radius $a$, $\vb{n} = \vb{r}/a$ and $\norm{\vb{r}} = a$, so $\vb{F}\cdot\vb{n} = \dfrac{\vb{r}\cdot\vb{r}}{a\cdot a^3} = \dfrac{1}{a^2}$, a constant. The flux is $\dfrac{1}{a^2}\cdot 4\pi a^2 = 4\pi$, whatever the radius.

**(c)** The divergence theorem cannot be applied to the solid inside $S$, because $\vb{F}$ is not defined at the origin. Instead, choose a sphere $S_a$ about the origin, so small that it lies inside $S$, and let $E$ be the solid between $S$ and $S_a$: a solid with a cavity, which does not contain the origin. $\vb{F}$ has continuous partial derivatives on an open region containing $E$, so by the divergence theorem, with the surface of the cavity oriented into the cavity, that is, towards the origin,

$$\begin{aligned} &\iint_S \vb{F}\cdot d\vb{S} + \iint_{S_a,\ \text{inwards}} \vb{F}\cdot d\vb{S} \\ &\quad= \iiint_E 0\,dV = 0. \end{aligned}$$

The flux inwards across $S_a$ is $-4\pi$, by (b), so the flux out of $S$ is $4\pi$.

**(d)** The flux of $\vb{E}$ is $\dfrac{q}{4\pi\varepsilon_0}$ times that of $\vb{F}$: $\dfrac{q}{4\pi\varepsilon_0}\cdot 4\pi = \dfrac{q}{\varepsilon_0}$, the integral form of Gauss's law in Section 20.7, for a point charge.

```check
F_e12 = Matrix([x, y, z])/(x**2 + y**2 + z**2)**Rational(3, 2); rq = sqrt(x**2 + y**2 + z**2)
same(diff(rq, x), x/rq)
same([diff(F_e12[i_], v_) for i_, v_ in enumerate((x, y, z))], [(rq**2 - 3*v_**2)/rq**5 for v_ in (x, y, z)])
same(simplify(div3(F_e12)), 0)
same(simplify(F_e12.subs({x: Sa[0], y: Sa[1], z: Sa[2]}, simultaneous=True).dot(Sa/aS)), 1/aS**2); same(1/aS**2*4*pi*aS**2, 4*pi)
same(integrate(simplify(F_e12.subs({x: Sa[0], y: Sa[1], z: Sa[2]}, simultaneous=True).dot(NSa)), (phs, 0, pi), (ths, 0, 2*pi)), 4*pi)
same(qch/(4*pi*e0)*4*pi, qch/e0)
```
:::
::::

## Check yourself {#quiz}

```quiz
? Which sign rule holds when you reverse the direction of a curve $C$?
- [ ] both integrals are negated
- [ ] $\int_C f\,ds$ is negated and $\int_C \vb{F}\cdot d\vb{r}$ is unchanged
- [x] $\int_C f\,ds$ is unchanged and $\int_C \vb{F}\cdot d\vb{r}$ is negated
- [ ] both integrals are unchanged
> $\int_C \vb{F}\cdot d\vb{r}$ adds up the component of $\vb{F}$ along the direction of motion, and reversing the motion reverses that component: the integral is negated, which leaves it unchanged if it is zero (Theorem 20.1). $\int_C f\,ds$ adds up $f$ times lengths, and lengths are positive whichever way you go. A wire has the same mass from either end.

? Let $\vb{F} = \langle 2x, 2y\rangle$. The work done by $\vb{F}$ along any piecewise smooth path from $(1, 0)$ to $(0, 2)$ is
- [x] $3$
- [ ] $5$
- [ ] $-3$
- [ ] different for different paths
> $\vb{F} = \nabla f$ with $f = x^2 + y^2$, so by the fundamental theorem for line integrals the work is $f(0, 2) - f(1, 0) = 4 - 1 = 3$, for every path. $-3$ subtracts in the wrong order, $5$ adds instead of subtracting, and a conservative field's work never depends on the path.

? Which of these fields is conservative on the whole plane?
- [ ] $\langle -y, x\rangle$
- [ ] $\langle y, -x\rangle$
- [ ] $\langle x^2, xy\rangle$
- [x] $\langle y, x\rangle$
> For $\langle y, x\rangle$, $P_y = 1 = Q_x$ on the simply connected plane, and indeed it is $\nabla(xy)$. $\langle -y, x\rangle$ has $P_y = -1 \ne 1 = Q_x$; $\langle y, -x\rangle$ has $P_y = 1 \ne -1 = Q_x$; $\langle x^2, xy\rangle$ has $P_y = 0$ but $Q_x = y$.

? The field $\langle -y, x\rangle/(x^2 + y^2)$ has $P_y = Q_x$ wherever it is defined, yet its line integral round the unit circle is $2\pi$. Why does this not contradict the test for conservative fields?
- [ ] $P_y$ and $Q_x$ are not continuous at the points of the circle
- [x] the plane without the origin is not simply connected
- [ ] the unit circle is not a smooth curve
- [ ] the test only applies to fields in space
> The test needs a simply connected region, and the circle goes round the hole at the origin, where the field is not defined. On the circle the partial derivatives are continuous, and the circle is smooth ($\vb{r}' \ne \vb{0}$). The test of Theorem 20.5 is about fields in the plane.

? If $C$ is the circle $x^2 + y^2 = 4$, traced anticlockwise, then $\oint_C x\,dy$ equals
- [ ] $0$
- [ ] $2\pi$
- [ ] $8\pi$
- [x] $4\pi$
> With $P = 0$ and $Q = x$, $Q_x - P_y = 1$, so by Green's theorem the integral is the area of the disc, $\pi\cdot 2^2 = 4\pi$. $2\pi$ is the area of the unit disc times 2, and $8\pi$ uses $2\pi r^2$. The integral cannot be 0 here because its area integrand is 1 everywhere on the disc.

? The curl of $\vb{F} = \langle -y, x, 0\rangle$ is
- [x] $\langle 0, 0, 2\rangle$
- [ ] $\langle 0, 0, 0\rangle$
- [ ] $\langle 0, 0, -2\rangle$
- [ ] the number 2
> $\operatorname{curl}\vb{F} = \langle R_y - Q_z, P_z - R_x, Q_x - P_y\rangle = \langle 0, 0, 1 - (-1)\rangle = \langle 0, 0, 2\rangle$: twice the angular velocity of the rotation. The first two components vanish, but the third is 2. Reversing the order of subtraction gives $-2$ in error, and the number 2 alone omits the curl's direction.

? The flux of $\vb{F} = \langle x, y, z\rangle$ out of the sphere of radius 2 centred at the origin is
- [ ] $16\pi$
- [x] $32\pi$
- [ ] $\dfrac{32\pi}{3}$
- [ ] $8\pi$
> By the divergence theorem, the flux is $\operatorname{div}\vb{F} = 3$ times the volume $\tfrac43\pi\cdot 2^3 = \tfrac{32\pi}{3}$: $32\pi$. Directly: on the sphere $\vb{F}\cdot\vb{n} = 2$, and the area is $16\pi$. $16\pi$ is the area alone, $\tfrac{32\pi}{3}$ the volume alone, and $8\pi$ treats $\vb{F}\cdot\vb{n}$ as $\tfrac12$.

? If $f$ and the components of $\vb{F}$ have continuous second partial derivatives, which of these is always 0?
- [ ] $\operatorname{curl}\vb{F}$
- [ ] $\operatorname{div}(\nabla f)$
- [x] $\operatorname{div}(\operatorname{curl}\vb{F})$
- [ ] $\nabla(\operatorname{div}\vb{F})$
> $\operatorname{div}(\operatorname{curl}\vb{F}) = 0$ by Theorem 20.8. $\operatorname{curl}\vb{F}$ is not 0 in general (for $\langle -y, x, 0\rangle$ it is $\langle 0, 0, 2\rangle$). $\operatorname{div}(\nabla f) = f_{xx} + f_{yy} + f_{zz}$, which is 2 for $f = x^2$. And $\nabla(\operatorname{div}\vb{F})$ is $\langle 2, 0, 0\rangle$ for $\vb{F} = \langle x^2, 0, 0\rangle$.
```

```check
same(grad3(x**2 + y**2), Matrix([2*x, 2*y, 0]))
same((x**2 + y**2).subs({x: 0, y: 2}) - (x**2 + y**2).subs({x: 1, y: 0}), 3)
same(grad3(x*y)[:2, 0], Matrix([y, x])); same(diff(y, y), diff(x, x)); same(diff(x**2, y), 0); same(diff(x*y, x), y)
same(integrate(1*r, (r, 0, 2), (theta, 0, 2*pi)), 4*pi); same(lint(Matrix([0, x]), [2*cos(t), 2*sin(t)], 0, 2*pi), 4*pi)
same(curl3(Matrix([-y, x, 0])), Matrix([0, 0, 2])); same(div3(Matrix([-y, x, 0])), 0)
same(3*Rational(4, 3)*pi*2**3, 32*pi); same(4*pi*2**2, 16*pi); same(2*16*pi, 32*pi)
same(div3(grad3(x**2)), 2); same(grad3(div3(Matrix([x**2, 0, 0]))), Matrix([2, 0, 0]))
```
