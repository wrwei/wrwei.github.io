---
title: The derivative
part: 2
lead: Turn the average rates of Module 1 into instantaneous ones. You will define the derivative as a limit, read it as the slope of a tangent line and as a velocity, prove the first rules of differentiation, and compute derivatives by computer, exactly with SymPy and numerically, where small steps meet the limits of floating-point arithmetic.
minutes: 255
needs: Modules 1, 2 and 3
goals:
  - Compute derivatives from the limit definition, and write the equation of a tangent line
  - Interpret a derivative as a slope, a velocity and a rate of change, with its units
  - Sketch the graph of f′ from the graph of f, and recognise where a function has no derivative
  - Prove the power, constant multiple and sum rules, and use them to differentiate polynomials
  - Find higher derivatives, and the velocity, acceleration and jerk of a moving object
  - Estimate derivatives numerically, and choose a step that balances truncation and rounding error
---

## Tangent lines and velocity {#tangents}

In Module 1 you dropped a ball. After $t$ seconds it has fallen $s(t) = 4.9t^2$ metres, and from $t = 1$ to $t = 1 + h$ its average speed is

$$\frac{s(1 + h) - s(1)}{h} = 9.8 + 4.9h \qquad (h \ne 0),$$

as [Example 1.12](module_01_EN.html#difference-quotient) showed. As $h$ shrinks towards 0, from either side, these averages settle on 9.8 m/s. Module 2 gave that settling a precise meaning, a limit, and found the speed of the ball at every time $a$, not only at $t = 1$:

$$\begin{aligned} \lim_{h\to0}\frac{s(a + h) - s(a)}{h} &= \lim_{h\to0}\,(9.8a + 4.9h) \\ &= 9.8a \text{ m/s}. \end{aligned}$$

The quotient equals $9.8a + 4.9h$ for every $h \ne 0$, and a limit as $h \to 0$ never uses the value at $h = 0$ itself; then direct substitution gives $9.8a$. So the ball falls at 9.8 m/s after one second and at 19.6 m/s after two. This limit is what a speedometer on the ball would show.

```check
s49 = Rational(49, 10)*t**2
dq1 = (s49.subs(t, a + h) - s49.subs(t, a))/h
same(cancel(dq1.subs(a, 1)), Rational(98, 10) + Rational(49, 10)*h)   # the quotient at t = 1 (Example 1.12)
same(cancel(dq1), Rational(98, 10)*a + Rational(49, 10)*h)
limit_is(dq1, h, 0, Rational(98, 10)*a)
same((Rational(98, 10)*a + Rational(49, 10)*h).subs(h, 0), Rational(98, 10)*a)
same([Rational(98, 10)*T_ for T_ in (1, 2)], [Rational(98, 10), Rational(196, 10)])
```

::: definition Instantaneous velocity
Suppose an object moves along a straight line, and $s(t)$ is its position at time $t$, measured from a fixed point. Its **instantaneous velocity**, or **velocity** for short, at time $a$ is

$$v(a) = \lim_{h\to0}\frac{s(a + h) - s(a)}{h},$$

provided that this limit exists. Its **speed** at time $a$ is $\abs{v(a)}$.
:::

Velocity has a sign: a positive velocity means that the object is moving in the positive direction, a negative one that it is moving the other way. Speed ignores the direction. For the falling ball, with distances measured downwards, the two are the same.

::: example A braking car
Suppose a driver brakes steadily, and $t$ seconds after braking begins the car has travelled $s(t) = 20t - 2t^2$ metres. (The numbers are made up.) Find the velocity at time $a$, what the speedometer shows at $t = 0$ and at $t = 2$, and when and where the car stops.

Substitute $a + h$ for $t$, keeping the brackets, and expand, with $(a + h)^2 = a^2 + 2ah + h^2$:

$$\begin{aligned} &s(a + h) \\ &\quad= 20(a + h) - 2(a + h)^2 \\ &\quad= 20a + 20h - 2(a^2 + 2ah + h^2) \\ &\quad= 20a + 20h - 2a^2 - 4ah - 2h^2. \end{aligned}$$

Subtract $s(a) = 20a - 2a^2$: the terms $20a$ and $-2a^2$ cancel, and $s(a + h) - s(a) = 20h - 4ah - 2h^2$. Every remaining term contains $h$, so divide by $h$ (allowed, since $h \ne 0$), then let $h \to 0$:

$$\begin{aligned} v(a) &= \lim_{h\to0}\frac{20h - 4ah - 2h^2}{h} \\ &= \lim_{h\to0}\,(20 - 4a - 2h) \\ &= 20 - 4a \text{ m/s}. \end{aligned}$$

At $t = 0$ the speedometer shows 20 m/s, which is 72 km/h (multiply m/s by 3.6 to get km/h); at $t = 2$ it shows $20 - 8 = 12$ m/s. The velocity falls by 4 m/s every second and reaches 0 when $20 - 4a = 0$, at $t = 5$ s. By then the car has travelled $s(5) = 100 - 50 = 50$ m. The formula describes the car only for $0 \le t \le 5$: after $t = 5$ it would have the car reversing, which brakes do not do.

```check
sc = 20*t - 2*t**2
same(expand((a + h)**2), a**2 + 2*a*h + h**2)
steps(sc.subs(t, a + h), 20*(a + h) - 2*(a + h)**2, 20*a + 20*h - 2*(a**2 + 2*a*h + h**2), 20*a + 20*h - 2*a**2 - 4*a*h - 2*h**2)
same(sc.subs(t, a + h) - sc.subs(t, a), 20*h - 4*a*h - 2*h**2)
steps(Limit((20*h - 4*a*h - 2*h**2)/h, h, 0, '+-'), Limit(20 - 4*a - 2*h, h, 0, '+-'), 20 - 4*a)
same((sc.subs(t, a + h) - sc.subs(t, a))/h, 20 - 4*a - 2*h)
limit_is((sc.subs(t, a + h) - sc.subs(t, a))/h, h, 0, 20 - 4*a)
same((20 - 4*a).subs(a, 0), 20); same(20*Rational(36, 10), 72); same((20 - 4*a).subs(a, 2), 12)
same(solve(20 - 4*a, a), [5]); same(sc.subs(t, 5), 50); same(100 - 50, 50)
holds((20 - 4*a).subs(a, 6) < 0)
```
:::

### The tangent line {#tangent-line}

Module 1 described the tangent line at a point $P$ of a curve as the line that the secant lines through $P$ settle on as a second point $Q$ slides towards $P$ ([Figure 1.5](module_01_EN.html#fig-01-5) shows it for the ball). The slope of the secant through $P = (a, f(a))$ and $Q = (a + h, f(a + h))$ is the difference quotient, so the slope of the tangent is the limit of the difference quotients: the same limit as the velocity.

::: definition Tangent line
Let $f$ be defined on an open interval that contains $a$, and let $P = (a, f(a))$. If the limit

$$m = \lim_{h\to0}\frac{f(a + h) - f(a)}{h}$$

exists, the **tangent line** to the graph of $f$ at $P$ is the line through $P$ with slope $m$. By the point-slope form of [Section 1.4](module_01_EN.html#linear), its equation is

$$y = f(a) + m(x - a).$$
:::

The open interval makes sure that $f(a + h)$ is defined for every small $h$, positive or negative, so that secants can approach from both sides.

::: example The tangent to $y = x^3$ at $(1, 1)$
Find the tangent line to $y = x^3$ at the point $(1, 1)$, and find where else it meets the curve.

In [Exercise 1.8](module_01_EN.html#ex-1-8) you expanded $(1 + h)^3 = 1 + 3h + 3h^2 + h^3$ and found, for $h \ne 0$,

$$\begin{aligned} \frac{(1 + h)^3 - 1}{h} &= \frac{3h + 3h^2 + h^3}{h} \\ &= 3 + 3h + h^2. \end{aligned}$$

The table shows these secant slopes on both sides of $P$:

```valuetable
h = 0.1, 0.01, 0.001, -0.001, -0.01, -0.1
$\dfrac{(1+h)^3 - 1}{h}$ = ((1 + h)**3 - 1)/h
digits = 7
---
h | \dfrac{(1+h)^3 - 1}{h}
0.1 | 3.31
0.01 | 3.0301
0.001 | 3.003001
-0.001 | 2.997001
-0.01 | 2.9701
-0.1 | 2.71
```

They approach 3, from above when $h > 0$ and from below when $h < 0$. By direct substitution, $m = \lim_{h\to0}(3 + 3h + h^2) = 3$, so the tangent line is

$$y = 1 + 3(x - 1), \quad\text{that is,}\quad y = 3x - 2.$$

It meets the curve where $x^3 = 3x - 2$, that is, where $x^3 - 3x + 2 = 0$. Since $x = 1$ is a solution, $x - 1$ is a factor ([Module 2](module_02_EN.html#factor)). To find the other factor, write $-3x + 2$ as $-x - (2x - 2)$ and group the terms:

$$\begin{aligned} x^3 - 3x + 2 &= (x^3 - x) - (2x - 2) \\ &= x(x - 1)(x + 1) - 2(x - 1) \\ &= (x - 1)(x^2 + x - 2) \\ &= (x - 1)^2(x + 2), \end{aligned}$$

where the last step factors $x^2 + x - 2 = (x - 1)(x + 2)$. So the line meets the curve again at $x = -2$, at the point $(-2, -8)$. The repeated factor $(x - 1)^2$ is the algebraic mark of a tangent: the line meets the curve "twice" at $x = 1$.

```check
steps(((1 + h)**3 - 1)/h, (3*h + 3*h**2 + h**3)/h, 3 + 3*h + h**2)
same([(3 + 3*h + h**2).subs(h, v_) for v_ in (Rational(1, 10), Rational(-1, 10))], [Rational(331, 100), Rational(271, 100)])
same(3 + 3*h + h**2 - 3, h*(3 + h))      # above 3 for h > 0, below 3 for -3 < h < 0
holds(all(sign((h*(3 + h)).subs(h, v_)) == sign(v_) for v_ in (Rational(1, 10), Rational(1, 1000), -Rational(1, 1000), -Rational(1, 10))))
limit_is(((1 + h)**3 - 1)/h, h, 0, 3)
same(expand(1 + 3*(x - 1)), 3*x - 2)
same(-3*x + 2, -x - (2*x - 2))
steps(x**3 - 3*x + 2, (x**3 - x) - (2*x - 2), x*(x - 1)*(x + 1) - 2*(x - 1), (x - 1)*(x**2 + x - 2), (x - 1)**2*(x + 2))
same(factor(x**2 + x - 2), (x - 1)*(x + 2)); same((x**3 - 3*x + 2).subs(x, 1), 0)
same_set(solve(x**3 - (3*x - 2), x), [1, -2]); same((-2)**3, -8); same(3*(-2) - 2, -8)
```
:::

::: pitfall
"A tangent line touches the curve at only one point." That is true for a circle, not in general: the tangent of Example 4.2 crosses $y = x^3$ again at $(-2, -8)$. And a line that meets a curve only once need not be a tangent: the vertical line $x = 1$ meets $y = x^3$ only at $(1, 1)$. What makes a line the tangent at $P$ is its slope, the limit of the secant slopes.
:::

Zoom in on the point of tangency and you see why the tangent deserves its name. Figure 4.1 magnifies the graph of $y = x^3$ around $(1, 1)$ tenfold, and then tenfold again. In the first window the curve bends away from its tangent, in the second much less, and in the third the two cannot be told apart. Close to the point, the curve looks straight, and the straight line it looks like is the tangent.

::: figure id=fig-04-1
Zooming in on $y = x^3$ (blue) at the point $(1, 1)$, with its tangent line $y = 3x - 2$ (dashed). Each box marks the window of the next panel, ten times smaller in both directions. In the last window, 0.03 wide, the curve and the tangent look the same.
:::

## The derivative {#derivative}

Velocity and the slope of a tangent are the same limit. So is every other instantaneous rate of change: how fast water drains from a tank, in litres per second; how fast a cup of tea cools, in degrees per minute; how fast the error of a machine-learning model changes as one of its parameters changes. The limit gets its own name.

::: definition Derivative at a point
Let $f$ be defined on an open interval that contains $a$. The **derivative of $f$ at $a$** is

$$f'(a) = \lim_{h\to0}\frac{f(a + h) - f(a)}{h},$$

provided that this limit exists (as a real number). Then $f$ is **differentiable at $a$**. The symbol $f'(a)$ reads "f prime of a".
:::

Putting $x = a + h$ gives a second form, often more convenient:

$$f'(a) = \lim_{x\to a}\frac{f(x) - f(a)}{x - a}.$$

The two forms say the same thing. For every $x \ne a$, the quotient in the second form at $x$ equals the quotient in the definition at $h = x - a$; and $\abs{x - a} < \delta$ is the same condition as $\abs{h} < \delta$, so by the ε–δ definition of Module 2 one limit exists exactly when the other does, with the same value.

With this name, three ideas become one.

::: keyidea
The derivative $f'(a)$ is

- the **slope of the tangent line** to $y = f(x)$ at $(a, f(a))$, which is $y = f(a) + f'(a)(x - a)$;
- the **instantaneous rate of change** of $f$ at $a$, measured in units of $f$ per unit of $x$;
- the **velocity** at time $a$, when $f(t)$ is the position of a moving object at time $t$.
:::

::: example A derivative from the definition
Let $f(x) = 2x^2 - 5x + 1$. Find $f'(2)$ and the tangent line to the graph at $x = 2$.

First, $f(2) = 8 - 10 + 1 = -1$. Next substitute $2 + h$, keeping the brackets, and expand, with $(2 + h)^2 = 4 + 4h + h^2$:

$$\begin{aligned} f(2 + h) &= 2(2 + h)^2 - 5(2 + h) + 1 \\ &= 2(4 + 4h + h^2) - 10 - 5h + 1 \\ &= 8 + 8h + 2h^2 - 10 - 5h + 1 \\ &= -1 + 3h + 2h^2. \end{aligned}$$

So $f(2 + h) - f(2) = 3h + 2h^2$, and

$$\begin{aligned} f'(2) &= \lim_{h\to0}\frac{3h + 2h^2}{h} \\ &= \lim_{h\to0}\,(3 + 2h) = 3. \end{aligned}$$

The tangent line is $y = -1 + 3(x - 2)$, that is, $y = 3x - 7$. Check that it passes through the point: at $x = 2$ it gives $6 - 7 = -1 = f(2)$.

```check
f43 = 2*x**2 - 5*x + 1
same(f43.subs(x, 2), -1); same(8 - 10 + 1, -1)
same(expand((2 + h)**2), 4 + 4*h + h**2)
steps(f43.subs(x, 2 + h), 2*(4 + 4*h + h**2) - 10 - 5*h + 1, 8 + 8*h + 2*h**2 - 10 - 5*h + 1, -1 + 3*h + 2*h**2)
same(f43.subs(x, 2 + h) - f43.subs(x, 2), 3*h + 2*h**2)
steps(Limit((3*h + 2*h**2)/h, h, 0, '+-'), Limit(3 + 2*h, h, 0, '+-'), 3); same((3*h + 2*h**2)/h, 3 + 2*h)
limit_is((f43.subs(x, 2 + h) - f43.subs(x, 2))/h, h, 0, 3)
same(expand(-1 + 3*(x - 2)), 3*x - 7); same((3*x - 7).subs(x, 2), -1)
```
:::

::: widget name=secant-tangent
Start with $f(x) = x^2$ and $a = 1$; the slider for $\abs{h}$ runs on a logarithmic scale, from 1 down to 0.001. The purple line is the secant through $(a, f(a))$ and $(a + h, f(a + h))$; the dashed orange line is the tangent at $a$. Press **Halve h** again and again and watch the secant turn towards the tangent, and the difference quotient approach $f'(1) = 2$: for $x^2$ the quotient is $2a + h$, so each halving halves the gap. Switch the sign of $h$ to see secants from the left. Then try $\sqrt x$ at $a = 0$, where the quotients grow without bound, and type `|x|` with $a = 0$, where the two sides disagree (Section 4.4). For $\sin x$ and $e^x$ the widget takes $f'(a)$ from formulas that Modules 5 and 6 prove; for a function you type, it estimates $f'(a)$ numerically, as Section 4.7 explains.
:::

```check
same(expand(((a + h)**2 - a**2)/h), 2*a + h)
```

::: example Two more derivatives from the definition
Find (a) $f'(2)$ for $f(x) = \dfrac1x$, using the second form, and (b) $g'(4)$ for $g(x) = \sqrt x$, using the first. Give the tangent line in each case.

**(a)** Combine the fractions over the common denominator $2x$:

$$f(x) - f(2) = \frac1x - \frac12 = \frac{2 - x}{2x} = -\frac{x - 2}{2x}.$$

Divide by $x - 2$ (allowed, since $x \ne 2$ inside the limit) and let $x \to 2$:

$$f'(2) = \lim_{x\to2}\left(-\frac{1}{2x}\right) = -\frac14.$$

The tangent line is $y = \tfrac12 - \tfrac14(x - 2)$, that is, $y = 1 - \tfrac{x}{4}$. The slope is negative because $1/x$ decreases; [Exercise 1.9](module_01_EN.html#ex-1-9) found the same number, $-1/a^2$ at $a = 2$, with the first form.

**(b)** The quotient $\dfrac{\sqrt{4 + h} - 2}{h}$ is $\tfrac00$ at $h = 0$ and contains a square root, so rationalise: multiply the top and the bottom by $\sqrt{4 + h} + 2$, and use $(p - q)(p + q) = p^2 - q^2$ on the top:

$$\begin{aligned} \frac{\sqrt{4 + h} - 2}{h} &= \frac{(4 + h) - 4}{h\big(\sqrt{4 + h} + 2\big)} \\ &= \frac{1}{\sqrt{4 + h} + 2}. \end{aligned}$$

By the limit laws, $g'(4) = \dfrac{1}{\sqrt4 + 2} = \dfrac14$. The tangent line is $y = 2 + \tfrac14(x - 4)$, that is, $y = 1 + \tfrac{x}{4}$. Near $x = 4$ it is a good stand-in for the curve: at $x = 4.1$ it gives 2.025, while $\sqrt{4.1} \approx 2.0248$. Module 7 turns this observation into a method, linear approximation.

```check
steps(1/x - Rational(1, 2), (2 - x)/(2*x), -(x - 2)/(2*x))
same((1/x - Rational(1, 2))/(x - 2), -1/(2*x))
limit_is((1/x - Rational(1, 2))/(x - 2), x, 2, -Rational(1, 4)); same((-1/a**2).subs(a, 2), -Rational(1, 4))
same(expand(Rational(1, 2) - Rational(1, 4)*(x - 2)), 1 - x/4)
steps((sqrt(4 + h) - 2)/h, ((4 + h) - 4)/(h*(sqrt(4 + h) + 2)), 1/(sqrt(4 + h) + 2))
limit_is((sqrt(4 + h) - 2)/h, h, 0, Rational(1, 4)); same(1/(sqrt(4) + 2), Rational(1, 4))
same(expand(2 + Rational(1, 4)*(x - 4)), 1 + x/4); same((1 + x/4).subs(x, Rational(41, 10)), Rational(2025, 1000))
rounds(sqrt(Rational(41, 10)), '2.0248')
```
:::

::: pitfall
Two slips in derivatives from the definition. First, keep writing "$\lim$" until the step where you let $h \to 0$: $\dfrac{3h + 2h^2}{h} = 3 + 2h$ is true for $h \ne 0$, but it is not 3; its limit is 3. Second, never put $h = 0$ into the quotient before cancelling: that gives $\tfrac00$, which is not a number. Cancel the factor $h$ first (allowed, since $h \ne 0$), then let $h \to 0$.
:::

## The derivative as a function {#derivative-function}

Module 2 and Example 4.1 found velocities at every time at once: $9.8a$ for the ball and $20 - 4a$ for the car. Letting the point vary turns the derivative into a new function.

::: definition The derivative function
The **derivative** of $f$ is the function $f'$ given by

$$f'(x) = \lim_{h\to0}\frac{f(x + h) - f(x)}{h}$$

at every $x$ where this limit exists. Its domain is the set of those $x$, which may be smaller than the domain of $f$. Finding $f'$ is called **differentiating** $f$.
:::

In the limit, $x$ stays fixed while $h$ moves.

::: example The derivatives of $x^2$ and $\sqrt x$
Find $f'(x)$ for $f(x) = x^2$ and $g'(x)$ for $g(x) = \sqrt x$, with their domains.

For $f$: $(x + h)^2 - x^2 = 2xh + h^2$, so for $h \ne 0$ the difference quotient is $2x + h$, and $f'(x) = \lim_{h\to0}(2x + h) = 2x$ for every real $x$.

For $g$, rationalise as in Example 4.4: for $x > 0$,

$$\begin{aligned} \frac{\sqrt{x + h} - \sqrt x}{h} &= \frac{(x + h) - x}{h\big(\sqrt{x + h} + \sqrt x\big)} \\ &= \frac{1}{\sqrt{x + h} + \sqrt x}, \end{aligned}$$

so $g'(x) = \dfrac{1}{2\sqrt x}$ for $x > 0$. (At $x = 4$ this gives $\tfrac14$, as before.) At $x = 0$ the definition does not apply, because $\sqrt x$ is not defined to the left of 0; and even from the right, the quotient $\dfrac{\sqrt h - 0}{h} = \dfrac{1}{\sqrt h}$ grows without bound as $h \to 0^+$. So $g$ has domain $[0, \infty)$, but $g'$ has domain $(0, \infty)$: the graph of $\sqrt x$ starts out vertically at the origin.

```check
steps(((x + h)**2 - x**2)/h, (2*x*h + h**2)/h, 2*x + h)
limit_is(((x + h)**2 - x**2)/h, h, 0, 2*x)
xp = symbols('x', positive=True)
steps((sqrt(xp + h) - sqrt(xp))/h, ((xp + h) - xp)/(h*(sqrt(xp + h) + sqrt(xp))), 1/(sqrt(xp + h) + sqrt(xp)))
limit_is((sqrt(xp + h) - sqrt(xp))/h, h, 0, 1/(2*sqrt(xp)))
same((1/(2*sqrt(x))).subs(x, 4), Rational(1, 4))
hp = symbols('h', positive=True)
same((sqrt(hp) - 0)/hp, 1/sqrt(hp)); limit_is(sqrt(h)/h, h, 0, oo, '+')
```
:::

### Reading the graph of $f'$ {#graph-of-derivative}

The height of the graph of $f'$ at $x$ is the slope of the graph of $f$ at $x$. That one sentence lets you sketch $f'$ from a picture of $f$, without a formula. Figure 4.2 shows $f(x) = x^3 - 3x$ with its tangent lines at five points, and below it the graph of its derivative: each dot on the lower graph records the slope of one tangent above it.

::: figure id=fig-04-2
Top: $f(x) = x^3 - 3x$ with its tangent lines at $x = -2, -1, 0, 1, 2$. Bottom: its derivative $f'(x) = 3x^2 - 3$; the dots are the slopes of those five tangents (9, 0, $-3$, 0, 9). Where the tangent is horizontal, at $x = \pm1$ (dashed), $f'$ is zero; where $f$ rises, $f'$ is positive; where $f$ falls, $f'$ is negative.
:::

::: example Reading Figure 4.2
For $f(x) = x^3 - 3x$, find $f'(x)$ from the definition, and compare it with what the graph of $f$ shows.

Expand $(x + h)^3 = x^3 + 3x^2h + 3xh^2 + h^3$ (multiply $x^2 + 2xh + h^2$ by $x + h$ and collect terms). Then

$$\begin{aligned} &f(x + h) - f(x) \\ &\quad= \big[(x + h)^3 - x^3\big] - 3\big[(x + h) - x\big] \\ &\quad= 3x^2h + 3xh^2 + h^3 - 3h, \end{aligned}$$

so the difference quotient is $3x^2 + 3xh + h^2 - 3$ for $h \ne 0$, and

$$\begin{aligned} f'(x) &= \lim_{h\to0}\big(3x^2 + 3xh + h^2 - 3\big) \\ &= 3x^2 - 3. \end{aligned}$$

Now compare with the top graph.

- The graph of $f$ has horizontal tangents at its peak $(-1, 2)$ and at its trough $(1, -2)$. Indeed $f'(x) = 3x^2 - 3 = 0$ exactly when $x = \pm1$.
- To the left of $-1$ and to the right of 1 the graph rises, and there $f'(x) = 3(x^2 - 1) > 0$, since $x^2 > 1$.
- Between $-1$ and 1 the graph falls, and $f'(x) < 0$. It falls most steeply at $x = 0$, where $f'(0) = -3$ is the smallest value of $f'$.
- A half turn about the origin leaves the graph of $f$ unchanged ($f$ is odd), and a half turn turns every line into a parallel one. So the tangents at $x$ and at $-x$ have the same slope: $f'$ is even, $f'(-x) = f'(x)$.

```check
from sympy.calculus.util import function_range
f46 = x**3 - 3*x
steps((x + h)**3, (x**2 + 2*x*h + h**2)*(x + h), x**3 + 3*x**2*h + 3*x*h**2 + h**3)
steps(f46.subs(x, x + h) - f46, ((x + h)**3 - x**3) - 3*((x + h) - x), 3*x**2*h + 3*x*h**2 + h**3 - 3*h)
same((3*x**2*h + 3*x*h**2 + h**3 - 3*h)/h, 3*x**2 + 3*x*h + h**2 - 3)
limit_is((f46.subs(x, x + h) - f46)/h, h, 0, 3*x**2 - 3)
same(f46.subs(x, -1), 2); same(f46.subs(x, 1), -2)
same_set(solve(3*x**2 - 3, x), [1, -1]); same(3*x**2 - 3, 3*(x**2 - 1))
same(solve_univariate_inequality(3*x**2 - 3 > 0, x, relational=False), Union(Interval.open(-oo, -1), Interval.open(1, oo)))
same(solve_univariate_inequality(3*x**2 - 3 < 0, x, relational=False), Interval.open(-1, 1))
same(function_range(3*x**2 - 3, x, S.Reals), Interval(-3, oo)); same((3*x**2 - 3).subs(x, 0), -3)
same([(3*x**2 - 3).subs(x, v_) for v_ in (-2, -1, 0, 1, 2)], [9, 0, -3, 0, 9])
same(f46.subs(x, -x), -f46); same((3*x**2 - 3).subs(x, -x), 3*x**2 - 3)
```
:::

The same reading works for any graph.

::: keyidea
To sketch $f'$ from the graph of $f$:

- where the tangent to $f$ is horizontal (at peaks, troughs and some flat points), $f' = 0$: the graph of $f'$ meets the $x$-axis;
- where $f$ rises, $f' \ge 0$; where $f$ falls, $f' \le 0$;
- the steeper $f$ is, the further the graph of $f'$ is from the $x$-axis;
- where $f$ has a corner, a cusp, a vertical tangent or a jump, $f'$ is not defined (Section 4.4).
:::

The second rule follows from the definition. Call $f$ **increasing** on an interval if $x_1 < x_2$ in the interval always gives $f(x_1) < f(x_2)$ (strictly increasing, in [Exercise 1.10](module_01_EN.html#ex-1-10)). If $f$ is increasing on an open interval that contains $x$, then for every small $h \ne 0$ the numerator $f(x + h) - f(x)$ has the same sign as $h$, so every difference quotient is positive. Their limit $f'(x)$ cannot be negative: if it were, the quotients for small $h$ would lie within $\abs{f'(x)}/2$ of it and so would be negative too. The limit can be 0, though: $x^3$ is increasing, yet its tangent at 0 is horizontal. The converse, that $f' > 0$ on an interval makes $f$ increasing there, is true as well, but its proof needs the Mean Value Theorem of Module 8.

```check
same(diff(x**3, x).subs(x, 0), 0)
holds(all((x**3).subs(x, p_) < (x**3).subs(x, q_) for p_, q_ in ((-2, -1), (-1, 0), (0, 1), (Rational(-1, 10), Rational(1, 10)))))
```

::: pitfall
The graph of $f'$ records slopes, not heights. At the peak of $f$, where $f$ is largest nearby, $f'$ is 0; and $f'$ can be large where $f$ is negative, as at $x = -2$ in Figure 4.2, where $f(-2) = -2$ but $f'(-2) = 9$. Before you sketch $f'$, ask at each point "how steep, and uphill or downhill?", not "how high?".

```check
same(f46.subs(x, -2), -2); same((3*x**2 - 3).subs(x, -2), 9)
```
:::

### Notation {#notation}

Several notations for the derivative are in use, and you will meet them all. If $y = f(x)$, each of these means the derivative:

$$f'(x) = y' = \frac{dy}{dx} = \frac{df}{dx} = \frac{d}{dx}f(x) = Df(x).$$

| Notation | Read aloud |
|---|---|
| $f'(x)$, $y'$ | "f prime of x", "y prime" |
| $\dfrac{dy}{dx}$ | "dee y by dee x" |
| $\dfrac{d}{dx}f(x)$ | "dee by dee x of f of x" |
| $Df(x)$ | "D f of x" |

The prime is compact and names the function. Leibniz's notation $\dfrac{dy}{dx}$ shows which variable changes, and recalls the quotient $\dfrac{\Delta y}{\Delta x}$ whose limit it is. The symbol $\dfrac{d}{dx}$ is an instruction, "differentiate with respect to $x$": $\dfrac{d}{dx}\big(x^2\big) = 2x$. For the value at a point, write $f'(a)$ or, in Leibniz's notation,

$$\left.\frac{dy}{dx}\right|_{x=a},$$

read "dee y by dee x at x equals a". For the falling ball, $\dfrac{ds}{dt} = 9.8t$ and $\left.\dfrac{ds}{dt}\right|_{t=2} = 19.6$ m/s. Physicists also write a dot for a derivative with respect to time: $\dot s$, read "s dot", means $\dfrac{ds}{dt}$.

The units come with the notation: $\dfrac{ds}{dt}$ is measured in units of $s$ per unit of $t$, here metres per second; the derivative of a temperature in degrees Celsius with respect to a time in minutes is in degrees Celsius per minute.

```check
same(diff(x**2, x), 2*x); same(diff(s49, t), Rational(98, 10)*t); same(diff(s49, t).subs(t, 2), Rational(196, 10))
```

::: pitfall
$\dfrac{dy}{dx}$ is not a fraction: $dy$ and $dx$ are not numbers here, and you cannot cancel the $d$s to get $\dfrac{y}{x}$. (For $y = x^2$, $\dfrac{dy}{dx} = 2x$, while $\dfrac{y}{x} = x$.) Module 5 shows that it often behaves like a fraction all the same, which is much of its appeal. A second slip: $f'(3)$ means "differentiate, then put $x = 3$". Putting $x = 3$ first gives a number, and a number does not change, so its derivative is 0: for $f(x) = x^2$, $f'(3) = 2 \cdot 3 = 6$, but $\dfrac{d}{dx}\big(f(3)\big) = \dfrac{d}{dx}(9) = 0$.

```check
same(diff(x**2, x), 2*x); same((x**2)/x, x)
same(diff(x**2, x).subs(x, 3), 6); same(diff((x**2).subs(x, 3), x), 0)
```
:::

## Differentiability {#differentiability}

### Where derivatives fail {#failures}

Not every function has a derivative at every point. Figure 4.3 shows four functions that have none at 0. In it, $x^{1/3} = \sqrt[3]{x}$ is the real cube root, defined for every $x$ ([Section 1.4](module_01_EN.html#roots)), $x^{2/3} = \big(\sqrt[3]{x}\big)^2$, and $H$ is the **unit step function**, $H(x) = 0$ for $x < 0$ and $H(x) = 1$ for $x \ge 0$.

::: figure id=fig-04-3
Four ways to have no derivative at 0. A corner: $\abs{x}$ has slope $-1$ on the left and 1 on the right (the dashed lines). A cusp: the slopes of $x^{2/3}$ fall towards $-\infty$ on the left and rise towards $\infty$ on the right. A vertical tangent: the graph of $x^{1/3}$ becomes vertical at 0 (dashed). A jump: the step function $H$ is not continuous at 0.
:::

Since $f(0) = 0$ for the first three functions, their difference quotients at 0 are $f(h)/h$:

```valuetable
h = 0.1, 0.001, 0.00001, -0.00001, -0.001, -0.1
$\dfrac{\abs{h}}{h}$ = Abs(h)/h
$\dfrac{h^{2/3}}{h}$ = real_root(h**2, 3)/h
$\dfrac{h^{1/3}}{h}$ = real_root(h, 3)/h
digits = 4
---
h | \dfrac{\abs{h}}{h} | \dfrac{h^{2/3}}{h} | \dfrac{h^{1/3}}{h}
0.1 | 1 | 2.154 | 4.642
0.001 | 1 | 10 | 100
0.00001 | 1 | 46.42 | 2154
-0.00001 | -1 | -46.42 | 2154
-0.001 | -1 | -10 | 100
-0.1 | -1 | -2.154 | 4.642
```

The three columns behave in three different ways. For $\abs{x}$ the quotients are 1 on one side of 0 and $-1$ on the other; for $x^{2/3}$ they grow without bound, positive on the right and negative on the left; for $x^{1/3}$ they grow without bound on both sides. Limits from one side, as in Module 2, describe each column precisely.

::: definition One-sided derivatives
The **right-hand derivative** and the **left-hand derivative** of $f$ at $a$ are

$$\begin{aligned} f'_+(a) &= \lim_{h\to0^+}\frac{f(a + h) - f(a)}{h}, \\ f'_-(a) &= \lim_{h\to0^-}\frac{f(a + h) - f(a)}{h}, \end{aligned}$$

when these limits exist. A function is **differentiable on an open interval** if it is differentiable at every point of the interval, and **differentiable on a closed interval** $[a, b]$ if it is differentiable on $(a, b)$ and has a right-hand derivative at $a$ and a left-hand derivative at $b$.
:::

The symbols read "f prime plus of a" and "f prime minus of a". A two-sided limit exists exactly when both one-sided limits exist and are equal (Module 2), so $f'(a)$ exists exactly when both one-sided derivatives exist and are equal, and then all three are the same number. Now the four functions, one by one.

- **Corner.** For $\abs{x}$, the quotient $\abs{h}/h$ is 1 for every $h > 0$ and $-1$ for every $h < 0$. So $f'_+(0) = 1$ and $f'_-(0) = -1$: both one-sided derivatives exist, but they differ, so $f'(0)$ does not. The graph has a **corner**, and no single line is its tangent there. Away from 0, $\abs{x}$ is differentiable, with derivative $-1$ for $x < 0$ and 1 for $x > 0$. The ReLU of neural networks, $\max(0, x)$ ([Section 1.3](module_01_EN.html#piecewise)), has a corner at 0 too, with one-sided derivatives 0 and 1; software that trains networks must still return some number there, and usually returns 0.
- **Cusp.** For $x^{2/3}$, the quotient is $h^{2/3}/h = h^{-1/3} = 1/\sqrt[3]{h}$, which tends to $\infty$ as $h \to 0^+$ and to $-\infty$ as $h \to 0^-$. The graph plunges into the origin and leaves it as steeply: a **cusp**, where the quotients of a continuous function tend to $\infty$ on one side and $-\infty$ on the other.
- **Vertical tangent.** For $x^{1/3}$, the quotient is $h^{-2/3} = 1\big/\big(\sqrt[3]{h}\big)^2$, which tends to $\infty$ from both sides, so the secants become vertical. When $f$ is continuous at $a$ and its difference quotients tend to $\infty$ from both sides (or to $-\infty$ from both sides), the graph has a **vertical tangent** at $a$, the line $x = a$. Zoomed in, the graph looks like this line, as in Figure 4.1; but a vertical line has no slope, so $f'(0)$ still does not exist.
- **Jump.** For $H$, with $H(0) = 1$, the quotient for $h < 0$ is $\dfrac{H(h) - H(0)}{h} = \dfrac{0 - 1}{h} = -\dfrac1h$, which grows without bound as $h \to 0^-$. The next theorem shows that this is no accident: a function is never differentiable where it is not continuous.

```check
hp = symbols('h', positive=True); hn = symbols('h', negative=True)
same(Abs(hp)/hp, 1); same(Abs(hn)/hn, -1)
limit_is(Abs(h)/h, h, 0, 1, '+'); limit_is(Abs(h)/h, h, 0, -1, '-')
same(real_root(hp**2, 3)/hp, hp**Rational(-1, 3)); same(real_root(hp, 3)/hp, hp**Rational(-2, 3))
same(real_root(hn**2, 3)/hn, -1/real_root(-hn, 3)); same(real_root(hn, 3)/hn, 1/real_root(-hn, 3)**2)
limit_is(real_root(h**2, 3)/h, h, 0, oo, '+'); limit_is(real_root(h**2, 3)/h, h, 0, -oo, '-')
limit_is(real_root(h, 3)/h, h, 0, oo, '+'); limit_is(real_root(h, 3)/h, h, 0, oo, '-')
Hs = Piecewise((0, h < 0), (1, True))
same(Hs.subs(h, 0), 1); same(Hs.subs(h, hn), 0); same((Hs.subs(h, hn) - 1)/hn, -1/hn); limit_is(-1/h, h, 0, oo, '-')
relu = Piecewise((0, h < 0), (h, True))
limit_is(relu/h, h, 0, 1, '+'); same(relu.subs(h, hn)/hn, 0)
same(Abs(x).subs(x, -2 + hn), 2 - hn); same((Abs(-2 + hn) - 2)/hn, -1); same((Abs(2 + hp) - 2)/hp, 1)
```

### Differentiable functions are continuous {#continuity}

::: theorem Differentiable implies continuous
If $f$ is differentiable at $a$, then $f$ is continuous at $a$.
:::

::: proof
For $x \ne a$ in the open interval where $f$ is defined, write

$$f(x) - f(a) = \frac{f(x) - f(a)}{x - a}\cdot(x - a).$$

As $x \to a$, the first factor tends to $f'(a)$, by the second form of the definition, and the second factor tends to 0. By the product law for limits (Module 2),

$$\lim_{x\to a}\big(f(x) - f(a)\big) = f'(a)\cdot0 = 0,$$

so $\lim_{x\to a}f(x) = f(a)$, which is what continuity at $a$ means (Module 3).
:::

The hypothesis does its work in the product law, which needs both factors to have limits that are numbers. For $x^{1/3}$ at 0 the first factor tends to $\infty$, and the argument proves nothing (though $x^{1/3}$ happens to be continuous).

```check
F = Function('F')
same((F(x) - F(a))/(x - a)*(x - a), F(x) - F(a))
```

Two consequences are worth separating.

- **The contrapositive**: if $f$ is not continuous at $a$, it is not differentiable at $a$. That settles the jump of Figure 4.3, and every other discontinuity, at once.
- **The converse is false**: a continuous function need not be differentiable. $\abs{x}$, $x^{2/3}$ and $x^{1/3}$ are all continuous at 0 (Module 3), and none of them is differentiable there.

So differentiability is the stronger property. Continuity says that the graph has no breaks; differentiability says, in addition, that it has no corners, cusps or vertical tangents there: zoomed in, it looks like a line that is not vertical.

```check
limit_is(Abs(x), x, 0, 0); limit_is(real_root(x**2, 3), x, 0, 0); limit_is(real_root(x, 3), x, 0, 0)
```

::: pitfall
"$f$ is continuous at $a$, so $f'(a)$ exists" is the converse of Theorem 4.1, and it is false: $\abs{x}$ at 0 is the standard counterexample. A related slip is to trust a formula for $f'$ at a point where it was not derived. The derivative of $\abs{x}$ is $-1$ for $x < 0$ and 1 for $x > 0$, and some programs write it as $\operatorname{sign}(x)$; but $\operatorname{sign}(0) = 0$ does not make $\abs{x}$ differentiable at 0. Section 4.5 shows SymPy doing exactly this.
:::

::: deeper Differentiable means locally linear
Figure 4.1 suggests what differentiability means geometrically: near $a$, the graph is almost a straight line. Here is the precise statement. For a slope $m$, let

$$E(h) = f(a + h) - \big(f(a) + mh\big)$$

be the error of the line $y = f(a) + m(x - a)$ at $x = a + h$. Then **$f$ is differentiable at $a$ with $f'(a) = m$ exactly when $E(h)/h \to 0$ as $h \to 0$.** Indeed,

$$\frac{E(h)}{h} = \frac{f(a + h) - f(a)}{h} - m,$$

which tends to 0 exactly when the difference quotient tends to $m$. For any other slope $m_1 \ne f'(a)$, the same computation gives $E_1(h)/h \to f'(a) - m_1 \ne 0$. So the tangent is the one line through $(a, f(a))$ whose error shrinks faster than $h$ itself. For $f(x) = x^3$ at $a = 1$, $E(h) = (1 + h)^3 - (1 + 3h) = 3h^2 + h^3$, so $E(h)/h = 3h + h^2 \to 0$; in the last window of Figure 4.1, where $\abs{h} \le 0.015$, the error is at most about 0.0007, too small to see. Module 7 builds linear approximation on this, and Module 17 uses the same idea to define differentiability for functions of several variables.

```check
m1_ = symbols('m_1')
same((F(a + h) - (F(a) + m*h))/h, (F(a + h) - F(a))/h - m)
same(expand((1 + h)**3 - (1 + 3*h)), 3*h**2 + h**3); same(expand((3*h**2 + h**3)/h), 3*h + h**2)
limit_is(((1 + h)**3 - (1 + m1_*h))/h, h, 0, 3 - m1_)
same(3*Rational(15, 1000)**2 + Rational(15, 1000)**3, Rational(678375, 1000000000)); rounds(Rational(678375, 1000000000), '0.0007')
holds(3*Rational(15, 1000)**2 + Rational(15, 1000)**3 < Rational(9, 100)/100)
```
:::

## The first rules {#rules}

Computing every derivative from the definition is slow. A handful of rules, each proved once from the definition, makes it quick: with the rules of this section you can differentiate any polynomial in a line. Module 5 adds the product, quotient and chain rules.

### Constants and powers {#power-rule}

Look at what the definition has given so far: $\big(x^2\big)' = 2x$ (Example 4.5), and the computation in Example 4.6 shows $\big(x^3\big)' = 3x^2$. The pattern: the exponent comes down in front, and the new exponent is one less. Example 4.6 also shows why. In

$$(x + h)^3 = x^3 + 3x^2h + 3xh^2 + h^3,$$

the $x^3$ cancels against $-x^3$, the term $3x^2h$ becomes $3x^2$ after dividing by $h$, and every other term contains $h^2$, so it still contains $h$ after dividing and vanishes in the limit. That is the whole proof, for every power.

::: theorem Constant rule and power rule
For every constant $c$, every positive integer $n$ and every real $x$,

$$\frac{d}{dx}(c) = 0 \qquad\text{and}\qquad \frac{d}{dx}\big(x^n\big) = nx^{n-1}.$$

In particular, $\dfrac{d}{dx}(x) = 1$ (here $x^0$ means 1, also at $x = 0$).
:::

::: proof
**Constant.** If $f(x) = c$, every difference quotient is $\dfrac{c - c}{h} = 0$, so the limit is 0.

**Power.** Write $(x + h)^n = (x + h)(x + h)\cdots(x + h)$, with $n$ factors. Multiplying out, each term of the result picks either $x$ or $h$ from each of the $n$ factors and multiplies the picks together. Picking $x$ every time gives $x^n$. Picking $h$ from exactly one factor and $x$ from the other $n - 1$ gives $x^{n-1}h$, and there are $n$ ways to choose that one factor, so these terms add up to $nx^{n-1}h$. Every other term picks $h$ at least twice, so it contains $h^2$. Collecting those terms,

$$(x + h)^n = x^n + nx^{n-1}h + h^2\,Q(x, h),$$

where $Q(x, h)$ is a polynomial in $x$ and $h$ (and $Q = 0$ when $n = 1$). So, for $h \ne 0$,

$$\frac{(x + h)^n - x^n}{h} = nx^{n-1} + h\,Q(x, h).$$

As $h \to 0$, $Q(x, h)$ tends to $Q(x, 0)$ by direct substitution, since it is a polynomial in $h$; so $h\,Q(x, h)$ tends to $0 \cdot Q(x, 0) = 0$, and the quotient tends to $nx^{n-1}$.
:::

```check
for N_ in range(1, 9):
    Q_ = expand((expand((x + h)**N_) - x**N_ - N_*x**(N_ - 1)*h)/h**2)
    holds(Q_.is_polynomial(x, h))
    same(expand((x + h)**N_), x**N_ + N_*x**(N_ - 1)*h + h**2*Q_)
    limit_is(((x + h)**N_ - x**N_)/h, h, 0, N_*x**(N_ - 1))
same(diff(c, x), 0); same(diff(x, x), 1)
same(expand((x + h)**3), x**3 + 3*x**2*h + 3*x*h**2 + h**3)
```

::: note
Counting the picks exactly gives the **binomial theorem**. The term $x^{n-k}h^k$ appears once for each way of choosing which $k$ of the $n$ factors supply an $h$, so

$$\begin{aligned} (x + h)^n &= x^n + \binom{n}{1}x^{n-1}h \\ &\quad + \binom{n}{2}x^{n-2}h^2 + \dots + h^n, \end{aligned}$$

where $\binom{n}{k} = \dfrac{n!}{k!\,(n - k)!}$, read "n choose k", counts the ways to choose $k$ things from $n$ (with $0! = 1$). For example, $(x + h)^4 = x^4 + 4x^3h + 6x^2h^2 + 4xh^3 + h^4$. The proof above needs only the first two terms.

```check
same(expand((x + h)**4), x**4 + 4*x**3*h + 6*x**2*h**2 + 4*x*h**3 + h**4)
same([binomial(4, k_) for k_ in range(5)], [1, 4, 6, 4, 1]); same(binomial(4, 2), factorial(4)/(factorial(2)*factorial(2)))
for N_ in range(1, 8):
    same(expand((x + h)**N_), sum(binomial(N_, k_)*x**(N_ - k_)*h**k_ for k_ in range(N_ + 1)))
same(factorial(0), 1)
```
:::

The formula $nx^{n-1}$ seems to work beyond positive integers too: Example 4.4 found the slope of $1/x = x^{-1}$ at 2 to be $-\tfrac14 = (-1) \cdot 2^{-2}$, and Example 4.5 found $\big(\sqrt x\big)' = \dfrac{1}{2\sqrt x} = \tfrac12 x^{-1/2}$. Theorem 4.2 does not prove these, since its proof multiplies out $n$ factors. Module 5 proves the rule for negative integers and Module 6 for every real exponent.

```check
same(-1*Integer(2)**(-2), -Rational(1, 4)); same(Rational(1, 2)*x**Rational(-1, 2), 1/(2*sqrt(x)))
```

### Constant multiples and sums {#sum-rule}

::: theorem Constant multiple rule and sum rule
Let $f$ and $g$ be differentiable at $x$, and let $c$ be a constant. Then $cf$, $f + g$ and $f - g$ are differentiable at $x$, and

$$\begin{aligned} (cf)'(x) &= c\,f'(x), \\ (f + g)'(x) &= f'(x) + g'(x), \\ (f - g)'(x) &= f'(x) - g'(x). \end{aligned}$$
:::

::: proof
Each rule follows from a limit law of Module 2. For the constant multiple, the difference quotient of $cf$ is

$$\frac{cf(x + h) - cf(x)}{h} = c\cdot\frac{f(x + h) - f(x)}{h},$$

which tends to $c\,f'(x)$ by the constant multiple law. For the sum, the difference quotient of $f + g$ splits into two:

$$\begin{aligned} &\frac{\big(f(x + h) + g(x + h)\big) - \big(f(x) + g(x)\big)}{h} \\ &\quad= \frac{f(x + h) - f(x)}{h} + \frac{g(x + h) - g(x)}{h}, \end{aligned}$$

which tends to $f'(x) + g'(x)$ by the sum law. Finally, $f - g = f + (-1)g$, so the first two rules give $(f - g)' = f' + (-1)g' = f' - g'$.
:::

```check
G = Function('G')
same((c*F(x + h) - c*F(x))/h, c*(F(x + h) - F(x))/h)
same(((F(x + h) + G(x + h)) - (F(x) + G(x)))/h, (F(x + h) - F(x))/h + (G(x + h) - G(x))/h)
same(diff(c*F(x), x), c*diff(F(x), x)); same(diff(F(x) + G(x), x), diff(F(x), x) + diff(G(x), x))
same(diff(F(x) - G(x), x), diff(F(x), x) - diff(G(x), x))
```

The hypotheses matter: the formulas need $f'(x)$ and $g'(x)$ to exist. Without them the sum may or may not be differentiable: $\abs{x}$ and $-\abs{x}$ have no derivative at 0, but their sum, the constant 0, has one.

```check
same(Abs(x) + (-Abs(x)), 0); same(diff(Abs(x) + (-Abs(x)), x), 0)
limit_is((Abs(h) - 0)/h, h, 0, 1, '+'); limit_is((-Abs(h) - 0)/h, h, 0, 1, '-')
```

Applied repeatedly, the sum rule covers sums of any number of terms. In words: the derivative of a sum is the sum of the derivatives, and constant factors come along unchanged. Together, these two rules say that differentiation is **linear**.

### Polynomials {#polynomials}

With these rules, a polynomial is differentiated term by term:

$$\begin{aligned} &\frac{d}{dx}\big(a_nx^n + \dots + a_1x + a_0\big) \\ &\quad= na_nx^{n-1} + \dots + 2a_2x + a_1. \end{aligned}$$

The constant term $a_0$ disappears. So every polynomial is differentiable on $\R$, and its derivative is again a polynomial, of degree one less when the degree is at least 1.

```check
for N_ in range(1, 6):
    cs = symbols(f'c0:{N_ + 1}')
    poly_ = sum(cs[i]*x**i for i in range(N_ + 1))
    same(diff(poly_, x), sum(i*cs[i]*x**(i - 1) for i in range(1, N_ + 1)))
```

::: example Differentiating a polynomial
Differentiate $p(x) = 4x^5 - 3x^3 + 7x - 2$, and find the tangent line at $x = 1$.

By the sum and difference rules, differentiate term by term; by the constant multiple rule, keep each coefficient; then use the power rule and the constant rule:

$$\begin{aligned} p'(x) &= 4\frac{d}{dx}\big(x^5\big) - 3\frac{d}{dx}\big(x^3\big) \\ &\quad + 7\frac{d}{dx}(x) - \frac{d}{dx}(2) \\ &= 4 \cdot 5x^4 - 3 \cdot 3x^2 + 7 \cdot 1 - 0 \\ &= 20x^4 - 9x^2 + 7. \end{aligned}$$

At $x = 1$: $p(1) = 4 - 3 + 7 - 2 = 6$ and $p'(1) = 20 - 9 + 7 = 18$, so the tangent line is $y = 6 + 18(x - 1)$, that is, $y = 18x - 12$.

```check
p47 = 4*x**5 - 3*x**3 + 7*x - 2
steps(Derivative(p47, x), 4*Derivative(x**5, x) - 3*Derivative(x**3, x) + 7*Derivative(x, x) - Derivative(2, x), 4*5*x**4 - 3*3*x**2 + 7*1 - 0, 20*x**4 - 9*x**2 + 7)
same(p47.subs(x, 1), 6); same(diff(p47, x).subs(x, 1), 18)
same(expand(6 + 18*(x - 1)), 18*x - 12)
```
:::

::: example Horizontal tangents
Find the points where the graph of $g(x) = 2x^3 - 9x^2 + 12x - 4$ has a horizontal tangent.

A horizontal tangent has slope 0, so solve $g'(x) = 0$. By the rules,

$$\begin{aligned} g'(x) &= 6x^2 - 18x + 12 \\ &= 6(x^2 - 3x + 2) = 6(x - 1)(x - 2), \end{aligned}$$

which is 0 exactly at $x = 1$ and $x = 2$. Since $g(1) = 2 - 9 + 12 - 4 = 1$ and $g(2) = 16 - 36 + 24 - 4 = 0$, the graph has horizontal tangents at $(1, 1)$ and $(2, 0)$. For $1 < x < 2$ one factor is positive and the other negative, so $g'(x) < 0$: the tangents there slope downwards. Module 8 proves that the graph then falls from $(1, 1)$ to $(2, 0)$, and turns this reasoning into a method for finding maxima and minima.

```check
g48 = 2*x**3 - 9*x**2 + 12*x - 4
steps(diff(g48, x), 6*x**2 - 18*x + 12, 6*(x**2 - 3*x + 2), 6*(x - 1)*(x - 2))
same_set(solve(diff(g48, x), x), [1, 2])
same(g48.subs(x, 1), 1); same(2 - 9 + 12 - 4, 1); same(g48.subs(x, 2), 0); same(16 - 36 + 24 - 4, 0)
same(solve_univariate_inequality(6*(x - 1)*(x - 2) < 0, x, relational=False), Interval.open(1, 2))
```
:::

::: pitfall
Three tempting rules that are false. **(1)** The derivative of a product is not the product of the derivatives: $\big(x \cdot x\big)' = \big(x^2\big)' = 2x$, not $1 \cdot 1 = 1$. Until Module 5's product rule, multiply out first: $\dfrac{d}{dx}\big((x^2 + 1)(x - 3)\big) = \dfrac{d}{dx}\big(x^3 - 3x^2 + x - 3\big) = 3x^2 - 6x + 1$. **(2)** A constant has derivative 0, however it looks: $\dfrac{d}{dx}\big(\pi^2\big) = 0$, not $2\pi$, because $\pi^2$ is a number. **(3)** The power rule needs the variable in the base and a constant exponent: $\dfrac{d}{dx}\big(2^x\big)$ is not $x \cdot 2^{x-1}$; Module 6 finds it.

```check
same(diff(x*x, x), 2*x); same(diff(x*x, x).subs(x, 1), 2)
same(expand((x**2 + 1)*(x - 3)), x**3 - 3*x**2 + x - 3); same(diff(x**3 - 3*x**2 + x - 3, x), 3*x**2 - 6*x + 1)
same(diff(pi**2, x), 0)
holds(Ne(diff(2**x, x).subs(x, 1), (x*2**(x - 1)).subs(x, 1)))
```
:::

::: compute Derivatives with SymPy
SymPy differentiates with `sp.diff`, which knows the rules of this section and many more. Here is Example 4.7, the derivative at a point, and the definition itself as a limit:

```python
import sympy as sp
x, h = sp.symbols('x h')
p = 4*x**5 - 3*x**3 + 7*x - 2
dp = sp.diff(p, x)                 # the derivative p'(x)
print(dp)
print(dp.subs(x, 1))               # p'(1): differentiate first, then substitute
q = (p.subs(x, x + h) - p)/h       # the difference quotient
print(sp.limit(q, h, 0, '+-'))     # its two-sided limit: the definition
```

```output
20*x**4 - 9*x**2 + 7
18
20*x**4 - 9*x**2 + 7
```

The fourth argument of `sp.limit`, `'+-'`, asks for the two-sided limit; without it, SymPy approaches from the right only. The answers can look different from yours, because SymPy may factor or reorder:

```python
print(sp.diff(p, x, 2))            # the second derivative (Section 4.6)
print(sp.diff(sp.sqrt(x), x))      # Example 4.5
```

```output
2*x*(40*x**2 - 9)
1/(2*sqrt(x))
```

`2*x*(40*x**2 - 9)` is $80x^3 - 18x$ in factored form, the derivative of $20x^4 - 9x^2 + 7$. Now the warning of Section 4.4. With $x$ declared real (for complex numbers SymPy's answer is more complicated):

```python
xr = sp.symbols('x', real=True)
d = sp.diff(sp.Abs(xr), xr)
print(d, d.subs(xr, 0))
print(sp.limit(sp.Abs(h)/h, h, 0, '+'), sp.limit(sp.Abs(h)/h, h, 0, '-'))
```

```output
sign(x) 0
1 -1
```

For real $x \ne 0$, `sign(x)` is right: $-1$ for $x < 0$ and 1 for $x > 0$. But substituting 0 gives 0, as if $\abs{x}$ had derivative 0 there, while the one-sided limits of its difference quotient, 1 and $-1$, show that it has none; with `'+-'`, SymPy would refuse the two-sided limit, as in Module 2. A formula for $f'$ tells you nothing at a point where $f$ is not differentiable.
:::

```check
same(expand(2*x*(40*x**2 - 9)), 80*x**3 - 18*x); same(diff(20*x**4 - 9*x**2 + 7, x), 80*x**3 - 18*x)
xr_ = symbols('x', real=True)
same(diff(Abs(xr_), xr_), sign(xr_)); same(sign(xr_).subs(xr_, 0), 0)
```

## Higher derivatives and motion {#higher-derivatives}

The derivative $f'$ is a function, so it can be differentiated in its turn.

::: definition Higher derivatives
The **second derivative** of $f$ is the derivative of $f'$: $f'' = (f')'$. The **third derivative** is $f''' = (f'')'$, and in general the **$n$th derivative** $f^{(n)}$ is the derivative of $f^{(n-1)}$, wherever these derivatives exist. In Leibniz's notation, for $y = f(x)$,

$$\begin{aligned} f''(x) &= \frac{d^2y}{dx^2} = \frac{d}{dx}\left(\frac{dy}{dx}\right), \\ f^{(n)}(x) &= \frac{d^ny}{dx^n}. \end{aligned}$$
:::

Read $f''(x)$ as "f double prime of x", $f'''(x)$ as "f triple prime of x", $f^{(4)}(x)$ as "the fourth derivative of f at x", and $\dfrac{d^2y}{dx^2}$ as "dee two y by dee x squared". The 2s count differentiations; they are not powers. The brackets in $f^{(4)}$ keep it apart from the power $f^4$.

::: example All the derivatives of a polynomial
Find every derivative of $p(x) = x^4 - 2x^3 + 5x$.

Apply the rules again and again:

$$\begin{aligned} p'(x) &= 4x^3 - 6x^2 + 5, \\ p''(x) &= 12x^2 - 12x, \\ p'''(x) &= 24x - 12, \\ p^{(4)}(x) &= 24, \\ p^{(5)}(x) &= 0, \end{aligned}$$

and every later derivative is 0 as well. Each differentiation lowers the degree by 1, so a polynomial of degree $n$ has a constant $n$th derivative, and all its derivatives after the $n$th are 0. For $x^n$ itself the $n$th derivative is $n(n - 1)\cdots2 \cdot 1 = n!$; here $p^{(4)} = 24 = 4!$, because the leading coefficient of $p$ is 1.

```check
p49 = x**4 - 2*x**3 + 5*x
same(diff(p49, x), 4*x**3 - 6*x**2 + 5); same(diff(p49, x, 2), 12*x**2 - 12*x); same(diff(p49, x, 3), 24*x - 12)
same(diff(p49, x, 4), 24); same(diff(p49, x, 5), 0); same(diff(p49, x, 6), 0); same(factorial(4), 24)
for N_ in range(1, 8):
    same(diff(x**N_, x, N_), factorial(N_)); same(diff(x**N_, x, N_ + 1), 0)
```
:::

### Velocity, acceleration and jerk {#motion}

For an object moving along a line, with position $s(t)$ at time $t$, the first three derivatives have names:

| Quantity | Definition | Units |
|---|---|---|
| velocity | $v(t) = s'(t) = \dfrac{ds}{dt}$ | m/s |
| acceleration | $a(t) = v'(t) = s''(t) = \dfrac{d^2s}{dt^2}$ | m/s² |
| jerk | $j(t) = a'(t) = s'''(t) = \dfrac{d^3s}{dt^3}$ | m/s³ |

The units are those for $s$ in metres and $t$ in seconds. Acceleration is the rate of change of velocity: the falling ball has $v(t) = 9.8t$, so its acceleration is constant, $a(t) = 9.8$ m/s², the acceleration due to gravity of Module 1. The braking car of Example 4.1 has $v(t) = 20 - 4t$ and $a(t) = -4$ m/s²: negative, because its velocity decreases. Jerk, the rate of change of acceleration, is what you feel as a jolt when a lift or a train starts or stops abruptly; lifts, trains and robot arms are designed to keep it small.

The sign of $a$ tells you which way $v$ is changing (Module 8 proves that a positive derivative means an increasing function). So an object **speeds up** when its velocity and acceleration have the same sign, and **slows down** when their signs differ.

```check
same(diff(Rational(98, 10)*t, t), Rational(98, 10)); same(diff(s49, t, 2), Rational(98, 10))
```

::: example A particle moving back and forth
Suppose a particle moves along a line so that its position after $t$ seconds is $s(t) = t^3 - 6t^2 + 9t$ metres, for $t \ge 0$; the motion is made up, with numbers chosen to be easy to work with. Find its velocity, acceleration and jerk. When is it at rest, when does it move backwards, and when does it speed up?

Differentiate three times:

$$\begin{aligned} v(t) &= 3t^2 - 12t + 9 = 3(t - 1)(t - 3), \\ a(t) &= 6t - 12 = 6(t - 2), \\ j(t) &= 6. \end{aligned}$$

The particle is at rest when $v(t) = 0$: at $t = 1$, at the position $s(1) = 4$ m, and at $t = 3$, back at $s(3) = 0$. For $1 < t < 3$ the factors $t - 1$ and $t - 3$ have opposite signs, so $v < 0$ and the particle moves backwards; before $t = 1$ and after $t = 3$, $v > 0$ and it moves forwards. In the first 4 seconds it goes forwards from 0 to 4 m, back to 0, and forwards again to $s(4) = 4$ m: it covers $4 + 4 + 4 = 12$ m of ground, although it ends only 4 m from where it started.

The acceleration changes sign at $t = 2$. Comparing the signs of $v$ and $a$:

| Interval | $v$ | $a$ | The particle |
|---|---|---|---|
| $0 < t < 1$ | $+$ | $-$ | moves forwards, slowing down |
| $1 < t < 2$ | $-$ | $-$ | moves backwards, speeding up |
| $2 < t < 3$ | $-$ | $+$ | moves backwards, slowing down |
| $t > 3$ | $+$ | $+$ | moves forwards, speeding up |

Figure 4.4 shows the three graphs. Where $s$ has a horizontal tangent, $v$ is 0; where $v$ has its horizontal tangent, at its lowest point $t = 2$, $a$ is 0: each graph is the slope picture of the one above it.

```check
s410 = t**3 - 6*t**2 + 9*t
v410 = diff(s410, t); a410 = diff(v410, t); j410 = diff(a410, t)
steps(v410, 3*t**2 - 12*t + 9, 3*(t - 1)*(t - 3)); steps(a410, 6*t - 12, 6*(t - 2)); same(j410, 6)
same_set(solve(v410, t), [1, 3]); same(s410.subs(t, 1), 4); same(s410.subs(t, 3), 0); same(s410.subs(t, 4), 4); same(s410.subs(t, 0), 0)
same(solve_univariate_inequality(v410 < 0, t, relational=False), Interval.open(1, 3))
same(solve_univariate_inequality(v410 > 0, t, relational=False), Union(Interval.open(-oo, 1), Interval.open(3, oo)))
same(Abs(s410.subs(t, 1) - s410.subs(t, 0)) + Abs(s410.subs(t, 3) - s410.subs(t, 1)) + Abs(s410.subs(t, 4) - s410.subs(t, 3)), 12)
same(solve(a410, t), [2]); same(v410.subs(t, 2), -3)
for t_, sv, sa in ((Rational(1, 2), 1, -1), (Rational(3, 2), -1, -1), (Rational(5, 2), -1, 1), (4, 1, 1)):
    same(sign(v410.subs(t, t_)), sv); same(sign(a410.subs(t, t_)), sa)
```
:::

::: figure id=fig-04-4
The particle of Example 4.10. Top: its position $s(t)$, with horizontal tangents at $t = 1$ and $t = 3$. Middle: its velocity $v(t) = s'(t)$, zero at $t = 1$ and $t = 3$ and negative in between, while the particle moves backwards; its lowest point is at $t = 2$. Bottom: its acceleration $a(t) = v'(t)$, zero at $t = 2$.
:::

::: pitfall
Velocity is not speed, and a negative acceleration does not mean slowing down. Between $t = 1$ and $t = 2$ in Example 4.10 the acceleration is negative, yet the particle speeds up: it moves backwards faster and faster, its velocity going from 0 to $-3$ m/s and its speed from 0 to 3 m/s. Whether an object speeds up depends on whether $v$ and $a$ have the same sign, not on the sign of $a$ alone.

```check
same(v410.subs(t, 1), 0); same(v410.subs(t, 2), -3); same(Abs(v410.subs(t, 2)), 3); holds(a410.subs(t, Rational(3, 2)) < 0)
```
:::

## Numerical differentiation {#numerical}

Sometimes there is no formula to differentiate. A function may be known only as a program, such as a simulation that takes minutes to run, or only through measurements, such as the positions of a car recorded once a second. Then the derivative is estimated from a few values of the function, with a difference quotient and a small step $h$. Two choices decide how good the estimate is: which quotient, and which $h$.

### Forward and central differences {#differences}

::: definition Forward and central differences
For a step $h > 0$, the **forward difference** and the **central difference** of $f$ at $a$ are

$$\begin{aligned} &\text{forward:} && \frac{f(a + h) - f(a)}{h}, \\ &\text{central:} && \frac{f(a + h) - f(a - h)}{2h}. \end{aligned}$$

The amount by which such an estimate differs from $f'(a)$ is its **error**.
:::

The forward difference is the difference quotient itself, the slope of the secant from $a$ to $a + h$. The central difference is the slope of the secant from $a - h$ to $a + h$, over an interval centred on $a$. It is the average of the forward difference and the **backward difference** $\dfrac{f(a) - f(a - h)}{h}$, the quotient with $-h$ in place of $h$. If $f$ is differentiable at $a$, the forward and backward differences both tend to $f'(a)$ as $h \to 0$, and so does their average.

```check
same(((F(a + h) - F(a))/h + (F(a) - F(a - h))/h)/2, (F(a + h) - F(a - h))/(2*h))
same((F(a + (-h)) - F(a))/(-h), (F(a) - F(a - h))/h)
```

::: example Two differences for $x^3$
For $f(x) = x^3$, find the forward and central differences at $a$, and their errors.

By the expansion in Example 4.6, $(a + h)^3 = a^3 + 3a^2h + 3ah^2 + h^3$, and with $-h$ in place of $h$, $(a - h)^3 = a^3 - 3a^2h + 3ah^2 - h^3$. So

$$\begin{aligned} \frac{(a + h)^3 - a^3}{h} &= 3a^2 + 3ah + h^2, \\ \frac{(a + h)^3 - (a - h)^3}{2h} &= \frac{6a^2h + 2h^3}{2h} \\ &= 3a^2 + h^2. \end{aligned}$$

Since $f'(a) = 3a^2$, the errors are exactly $3ah + h^2$ and $h^2$. At $a = 1$ with $h = 0.1$ the forward difference is 3.31 and the central difference 3.01; with $h = 0.01$ they are 3.0301 and 3.0001. A tenfold cut in $h$ cuts the forward error about tenfold but the central error a hundredfold. In the central difference the terms $3ah^2$, which do not change sign with $h$, cancel: that is why centring pays.

```check
steps((a + h)**3, a**3 + 3*a**2*h + 3*a*h**2 + h**3); same(expand((a - h)**3), a**3 - 3*a**2*h + 3*a*h**2 - h**3)
same(cancel(((a + h)**3 - a**3)/h), 3*a**2 + 3*a*h + h**2)
steps(((a + h)**3 - (a - h)**3)/(2*h), (6*a**2*h + 2*h**3)/(2*h), 3*a**2 + h**2)
same(diff(x**3, x).subs(x, a), 3*a**2); same(3*a**2 + 3*a*h + h**2 - 3*a**2, 3*a*h + h**2)
fw_ = lambda hv: 3 + 3*hv + hv**2; cw_ = lambda hv: 3 + hv**2
same(fw_(Rational(1, 10)), Rational(331, 100)); same(cw_(Rational(1, 10)), Rational(301, 100))
same(fw_(Rational(1, 100)), Rational(30301, 10000)); same(cw_(Rational(1, 100)), Rational(30001, 10000))
```
:::

The pattern holds for other functions. The table shows the two errors for $\sqrt x$ at $a = 4$, where $f'(4) = \tfrac14$ (Example 4.4), computed exactly:

```valuetable
h = 0.1, 0.01, 0.001, 0.0001
$\text{forward} - \tfrac14$ = (sqrt(4 + h) - 2)/h - 1/4
$\text{central} - \tfrac14$ = (sqrt(4 + h) - sqrt(4 - h))/(2*h) - 1/4
digits = 4
---
h | \text{forward} - \tfrac14 | \text{central} - \tfrac14
0.1 | -0.001543 | 1.954\times10^{-5}
0.01 | -0.0001561 | 1.953\times10^{-7}
0.001 | -1.562\times10^{-5} | 1.953\times10^{-9}
0.0001 | -1.562\times10^{-6} | 1.953\times10^{-11}
```

Each row divides $h$ by 10; the forward error shrinks by a factor of 10 and the central error by a factor of 100.

Central differences are also the natural choice for measured data. [Exercise 1.11](module_01_EN.html#ex-1-11) showed that for a quadratic, such as the falling ball's $s(t) = 4.9t^2$, the central difference is exact for every $h$.

::: compute Velocities from measurements
Suppose you know the falling ball only from its table of positions in Section 1.3, measured every 0.5 s. Central differences estimate the velocity at the inner times; NumPy's `np.gradient` computes the same central differences, with a forward and a backward difference at the two ends:

```python
import numpy as np
dt = 0.5
t = np.arange(0, 3.01, dt)            # 0, 0.5, 1, ..., 3
s = 4.9*t**2                          # the measured positions
central = (s[2:] - s[:-2])/(2*dt)     # at t = 0.5, 1, ..., 2.5
print(central)
print(np.gradient(s, dt))
print(9.8*t)                          # the exact velocities
```

```output
[ 4.9  9.8 14.7 19.6 24.5]
[ 2.45  4.9   9.8  14.7  19.6  24.5  26.95]
[ 0.   4.9  9.8 14.7 19.6 24.5 29.4]
```

`s[2:] - s[:-2]` subtracts from each position the one two places before it. The central differences are exact, as Exercise 1.11 predicts. The estimates at the ends, 2.45 and 26.95 m/s, are each off by 2.45 m/s: one-sided differences with $h = 0.5$ have error $4.9h$ here, as the quotient $9.8a + 4.9h$ of Module 2 shows.
:::

```check
same(Rational(98, 10)*0 + Rational(49, 10)*Rational(1, 2), Rational(245, 100))
same((s49.subs(t, 3) - s49.subs(t, Rational(5, 2)))/Rational(1, 2), Rational(2695, 100)); same(Rational(294, 10) - Rational(2695, 100), Rational(245, 100))
same((s49.subs(t, Rational(3, 2)) - s49.subs(t, Rational(1, 2)))/1, Rational(98, 10))
```

### Truncation error {#truncation}

The error that remains when the arithmetic is exact comes from stopping at a step $h > 0$ instead of going to the limit; it is called **truncation error**. To compare such errors, use the big-O notation of Module 3, now as $h \to 0$ rather than for large inputs.

::: definition Big-O as $h \to 0$
An error $E(h)$ is $O(h^p)$ as $h \to 0$, read "big O of h to the p", if there are constants $C$ and $\delta > 0$ such that $\abs{E(h)} \le C\abs{h}^p$ whenever $0 < \abs{h} < \delta$.
:::

For $x^3$ at $a$, the forward error $3ah + h^2$ is $O(h)$, because for $0 < h < 1$, $h^2 \le h$ and so $\abs{3ah + h^2} \le (3\abs{a} + 1)h$; the central error $h^2$ is $O(h^2)$. A method whose error is $O(h^p)$, and no better, has **order** $p$: the forward difference has order 1 and the central difference order 2. Halving $h$ roughly halves an error of order 1, and quarters an error of order 2.

```check
hq = symbols('h', positive=True)
same(expand((3*Abs(a) + 1)*hq - (3*Abs(a)*hq + hq**2)), hq*(1 - hq))
holds(Abs(3*a*hq + hq**2).subs({a: -2, hq: Rational(1, 2)}) <= ((3*Abs(a) + 1)*hq).subs({a: -2, hq: Rational(1, 2)}))
same((h/2)**2/h**2, Rational(1, 4))
```

This is not special to $x^3$:

::: keyidea
If $f''$ is continuous near $a$, the forward difference has error about $\tfrac{h}{2}f''(a)$, which is $O(h)$. If $f'''$ is continuous near $a$, the central difference has error about $\tfrac{h^2}{6}f'''(a)$, which is $O(h^2)$. Module 15 proves both, with Taylor's theorem.
:::

For $x^3$ these give $3ah$ and $h^2$, the leading parts of the errors of Example 4.11. For $\sqrt x$ at 4 they predict $-\tfrac{h}{64}$ and $\tfrac{h^2}{512}$; for $h = 0.1$ that is $-0.00156$ and $0.0000195$, close to the first row of the table above.

```check
same(diff(x**3, x, 2).subs(x, a)*h/2, 3*a*h); same(diff(x**3, x, 3)*h**2/6, h**2)
same(diff(sqrt(x), x, 2).subs(x, 4)*h/2, -h/64); same(diff(sqrt(x), x, 3).subs(x, 4)*h**2/6, h**2/512)
rounds(-Rational(1, 640), '-0.00156'); rounds(Rational(1, 51200), '0.0000195')
holds(Abs((sqrt(Rational(41, 10)) - 2)/Rational(1, 10) - Rational(1, 4) + Rational(1, 640)) < Rational(2, 10**5))
holds(Abs((sqrt(Rational(41, 10)) - sqrt(Rational(39, 10)))/Rational(2, 10) - Rational(1, 4) - Rational(1, 51200)) < Rational(1, 10**7))
```

### Rounding error and the best step {#rounding}

On paper, the smaller $h$, the better. On a computer, not so. Floating-point numbers ([Section 1.7](module_01_EN.html#first-session)) carry about 16 significant digits: the gap between 1 and the next larger number that the computer can store is the **machine epsilon**

$$\varepsilon = 2^{-52} \approx 2.2 \times 10^{-16},$$

and a computed value of $f$ may be off by a few units of $\varepsilon\abs{f(a)}$. In the forward difference, $f(a + h)$ and $f(a)$ are nearly equal when $h$ is small, so their difference keeps only the few digits in which they differ: cancellation, as in Module 2. Dividing by the small $h$ then magnifies what is left of the rounding. The **rounding error** of the quotient is about $\varepsilon\abs{f(a)}/h$, and it grows as $h$ shrinks.

```check
rounds(Integer(2)**-52, '2.2e-16'); same(Integer(2)**-52, Rational(1, 4503599627370496))
```

So the total error has two parts pulling in opposite directions. For the forward difference of $x^3$ at 1, where $\abs{f(1)} = 1$, it is about

$$3h + \frac{\varepsilon}{h}.$$

The first part is large when $h$ is large, the second when $h$ is small.

::: compute Rounding error in action
Python's floats are the 16-digit numbers described above. The machine epsilon, and what it means:

```python
import sys
print(sys.float_info.epsilon)
print(1.0 + 1e-16 == 1.0, 1.0 + 1e-15 == 1.0)
```

```output
2.220446049250313e-16
True False
```

Adding $10^{-16}$ to 1 changes nothing: the result rounds back to 1. Now the errors of the two differences of $f(x) = x^3$ at $a = 1$, where $f'(1) = 3$, as $h$ shrinks from $10^{-1}$ to $10^{-15}$:

```python
def f(x):
    return x**3

a, exact = 1.0, 3.0
print(f"{'h':>7}  {'forward error':>13}  {'central error':>13}")
for k in range(1, 16):
    h = 10.0**(-k)
    forward = (f(a + h) - f(a))/h
    central = (f(a + h) - f(a - h))/(2*h)
    print(f"{h:7.0e}  {abs(forward - exact):13.2e}  {abs(central - exact):13.2e}")
```

```output
      h  forward error  central error
  1e-01       3.10e-01       1.00e-02
  1e-02       3.01e-02       1.00e-04
  1e-03       3.00e-03       1.00e-06
  1e-04       3.00e-04       1.00e-08
  1e-05       3.00e-05       9.74e-11
  1e-06       3.00e-06       8.03e-11
  1e-07       3.02e-07       8.63e-11
  1e-08       3.97e-09       7.13e-09
  1e-09       2.48e-07       8.17e-08
  1e-10       2.48e-07       2.48e-07
  1e-11       2.48e-07       2.48e-07
  1e-12       2.67e-04       1.00e-04
  1e-13       2.40e-03       7.32e-04
  1e-14       2.40e-03       2.40e-03
  1e-15       3.31e-01       1.64e-01
```

Read down the columns. The forward error shrinks tenfold per row, as $3h$ predicts, down to about $4 \times 10^{-9}$ at $h = 10^{-8}$; then it grows again. The central error shrinks a hundredfold per row, to about $10^{-10}$ at $h = 10^{-5}$, stays there down to $h = 10^{-7}$, and then grows too. At $h = 10^{-15}$ both estimates are wrong in the first decimal place.
:::

```check
fwd_f = lambda hv: abs(((1.0 + hv)**3 - 1.0)/hv - 3.0)                       # the table above, in floating point
cen_f = lambda hv: abs(((1.0 + hv)**3 - (1.0 - hv)**3)/(2*hv) - 3.0)
rounds(fwd_f(1e-8), '4e-9'); holds(fwd_f(1e-8) < min(fwd_f(10.0**-k_) for k_ in range(1, 16) if k_ != 8))
for k_ in range(1, 8):
    holds(Rational(8, 100) < fwd_f(10.0**-k_)/10.0**-k_/3 < 2)              # about 3h: tenfold per row
for k_ in range(1, 5):
    near(cen_f(10.0**-k_)/10.0**(-2*k_), 1, 1e-3)                           # h^2: a hundredfold per row
for k_ in (5, 6, 7):
    rounds(cen_f(10.0**-k_), '1e-10')
holds(cen_f(1e-8) > 10*cen_f(1e-7)); holds(fwd_f(1e-9) > 10*fwd_f(1e-8))
holds(Abs(((1.0 + 1e-15)**3 - 1.0)/1e-15 - 3.0) > 0.1); holds(Abs(((1.0 + 1e-15)**3 - (1.0 - 1e-15)**3)/2e-15 - 3.0) > 0.1)
same(1.0 + 1e-16 == 1.0, True); same(1.0 + 1e-15 == 1.0, False)
```

Figure 4.5 plots the same errors for 481 values of $h$. On logarithmic axes a power $Ch^p$ appears as a straight line of slope $p$, because $\log\big(Ch^p\big) = \log C + p\log h$: the truncation errors are lines of slopes 1 and 2, and the rounding error a ragged band along $\varepsilon/h$, of slope $-1$.

::: figure id=fig-04-5
The errors of the forward (blue) and central (orange) differences of $f(x) = x^3$ at $a = 1$, computed in floating point for 481 steps $h$ between $10^{-16}$ and 1, on logarithmic scales. On the right, truncation error dominates, along the dashed lines $3h$ and $h^2$. On the left, rounding error dominates, ragged and close to $\varepsilon/h$ (dashed grey). The dotted lines mark the best steps, about $10^{-8}$ for the forward difference and $5 \times 10^{-6}$ for the central one.
:::

The best step is where the two kinds of error balance. For the forward difference, $3h + \varepsilon/h$ is smallest when its two parts are equal (Exercise 4.12 proves it), at $h = \sqrt{\varepsilon/3} \approx 9 \times 10^{-9}$, where the error is about $2\sqrt{3\varepsilon} \approx 5 \times 10^{-8}$. For the central difference, $h^2 + \varepsilon/h$ is smallest at $h = (\varepsilon/2)^{1/3} \approx 5 \times 10^{-6}$ (Module 8 shows how to find such minima), where the error is about $7 \times 10^{-11}$. The table agrees: errors of a few times $10^{-9}$ and about $10^{-10}$ near those steps.

```check
eps_ = Integer(2)**-52
rounds(sqrt(eps_/3), '9e-9'); rounds(2*sqrt(3*eps_), '5e-8'); rounds(sqrt(eps_/3), '1e-8')
hstar = (eps_/2)**Rational(1, 3)
rounds(hstar, '5e-6'); rounds(hstar**2 + eps_/hstar, '7e-11')
same(diff(h**2 + eps_/h, h).subs(h, hstar), 0); holds(diff(h**2 + eps_/h, h, 2).subs(h, hstar) > 0)
same(3*sqrt(eps_/3), eps_/sqrt(eps_/3))
```

::: keyidea
A rule of thumb for 16-digit floating point: a forward difference with $h \approx 10^{-8}$ gets about 8 correct digits, and a central difference with $h \approx 10^{-5}$ about 10. Make $h$ smaller and the answer gets worse, not better. When $a$ is far from 1, scale the step with it, as in $h = 10^{-5}(1 + \abs{a})$: the widget of Section 4.2 uses that step, with central differences, for the functions you type.
:::

::: pitfall
"The smaller $h$, the more accurate the derivative." True in exact arithmetic, false in floating point. With $h = 10^{-15}$, the forward difference of $x^3$ at 1 is off by about 0.33, in the first decimal place; with $h = 10^{-16}$, $1 + h$ rounds to 1 and the forward difference is 0. Choose $h$ by the rule of thumb, or avoid the problem: SymPy differentiates exactly, and automatic differentiation (Module 5) computes derivatives of programs to full precision, without any $h$.

```check
rounds(abs(((1.0 + 1e-15)**3 - 1.0)/1e-15 - 3.0), '0.33'); same(((1.0 + 1e-16)**3 - 1.0)/1e-16, 0)
```
:::

## What you learned {#summary}

- The velocity of a moving object and the slope of the tangent line to a graph are both limits of difference quotients. That limit is the derivative, $f'(a) = \lim_{h\to0}\dfrac{f(a + h) - f(a)}{h} = \lim_{x\to a}\dfrac{f(x) - f(a)}{x - a}$.
- The tangent line at $(a, f(a))$ is $y = f(a) + f'(a)(x - a)$; zoomed in, the graph of a differentiable function looks like it. A derivative is measured in units of $f$ per unit of $x$.
- The derivative is a function, $f'$, whose height at $x$ is the slope of $f$ at $x$; it is written $f'(x)$, $y'$, $\dfrac{dy}{dx}$, $\dfrac{d}{dx}f(x)$ or $Df(x)$.
- A function has no derivative at a corner, a cusp, a vertical tangent or a discontinuity. Differentiable implies continuous; continuous does not imply differentiable ($\abs{x}$ at 0).
- $\dfrac{d}{dx}(c) = 0$, $\dfrac{d}{dx}\big(x^n\big) = nx^{n-1}$ for positive integers $n$, $(cf)' = cf'$ and $(f \pm g)' = f' \pm g'$: polynomials are differentiated term by term.
- Higher derivatives $f''$, $f'''$, $f^{(n)}$. For motion along a line, velocity $v = s'$, acceleration $a = s''$ and jerk $j = s'''$; an object speeds up when $v$ and $a$ have the same sign.
- Numerically, the forward difference has truncation error $O(h)$ and the central difference $O(h^2)$. Rounding error grows like $\varepsilon/h$, so in floating point the best steps are about $10^{-8}$ and $10^{-5}$, and smaller steps make things worse.
- SymPy: `sp.diff(f, x)`, `sp.diff(f, x, 2)`, and `sp.limit(q, h, 0, '+-')` for the definition; a formula for $f'$ says nothing at a point where $f$ is not differentiable.

## Exercises {#exercises}

:::: exercise Derivatives from the definition {#ex-4-1} ★
- (a) Use the definition $f'(a) = \lim_{h\to0}\dfrac{f(a + h) - f(a)}{h}$ to find $f'(-1)$ for $f(x) = 3x^2 - x$, and the tangent line at $x = -1$.
- (b) Use the form $\lim_{x\to a}\dfrac{g(x) - g(a)}{x - a}$ to find $g'(3)$ for $g(x) = x^2 - 4x$.

::: solution
**(a)** First $f(-1) = 3 + 1 = 4$. Substitute $-1 + h$, with brackets:

$$\begin{aligned} f(-1 + h) &= 3(-1 + h)^2 - (-1 + h) \\ &= 3 - 6h + 3h^2 + 1 - h \\ &= 4 - 7h + 3h^2. \end{aligned}$$

So

$$\begin{aligned} f'(-1) &= \lim_{h\to0}\frac{-7h + 3h^2}{h} \\ &= \lim_{h\to0}\,(-7 + 3h) = -7. \end{aligned}$$

The tangent line is $y = 4 - 7(x + 1)$, that is, $y = -7x - 3$; at $x = -1$ it gives $7 - 3 = 4$. The common slip is to drop the brackets around $-1 + h$ in the term $-x$, which gives $-1 + h$ instead of $+1 - h$.

**(b)** $g(3) = 9 - 12 = -3$, so $g(x) - g(3) = x^2 - 4x + 3 = (x - 1)(x - 3)$. Cancel the factor $x - 3$ (allowed, since $x \ne 3$ inside the limit):

$$\begin{aligned} g'(3) &= \lim_{x\to3}\frac{(x - 1)(x - 3)}{x - 3} \\ &= \lim_{x\to3}\,(x - 1) = 2. \end{aligned}$$

```check
fe1 = 3*x**2 - x
same(fe1.subs(x, -1), 4)
steps(fe1.subs(x, -1 + h), 3 - 6*h + 3*h**2 + 1 - h, 4 - 7*h + 3*h**2)
same((fe1.subs(x, -1 + h) - 4)/h, -7 + 3*h); limit_is((fe1.subs(x, -1 + h) - fe1.subs(x, -1))/h, h, 0, -7)
same(expand(4 - 7*(x + 1)), -7*x - 3); same((-7*x - 3).subs(x, -1), 4)
ge1 = x**2 - 4*x
same(ge1.subs(x, 3), -3); same(factor(ge1 - ge1.subs(x, 3)), (x - 1)*(x - 3))
limit_is((ge1 - ge1.subs(x, 3))/(x - 3), x, 3, 2); same(diff(ge1, x).subs(x, 3), 2)
```
:::
::::

:::: exercise Polynomials by the rules {#ex-4-2} ★
Differentiate:

- (a) $f(x) = 7x^4 - 2x^3 + x - 9$
- (b) $g(x) = (2x - 1)(x^2 + 3)$
- (c) $k(x) = \dfrac{x^3 - 4x}{x}$, for $x \ne 0$
- (d) $s(t) = \pi t^2 + \pi^2$

::: solution
**(a)** Term by term: $f'(x) = 7 \cdot 4x^3 - 2 \cdot 3x^2 + 1 - 0 = 28x^3 - 6x^2 + 1$.

**(b)** Multiply out first: $g(x) = 2x^3 + 6x - x^2 - 3 = 2x^3 - x^2 + 6x - 3$, so $g'(x) = 6x^2 - 2x + 6$. Multiplying the derivatives of the factors, $2 \cdot 2x = 4x$, would be wrong: the derivative of a product is not the product of the derivatives (Module 5 gives the right rule).

**(c)** For $x \ne 0$, divide each term by $x$: $k(x) = x^2 - 4$. So $k'(x) = 2x$, for $x \ne 0$: $k$ is not defined at 0, so neither is $k'$.

**(d)** $\pi$ and $\pi^2$ are constants: $s'(t) = 2\pi t$, and the constant term $\pi^2$ contributes 0.

```check
same(diff(7*x**4 - 2*x**3 + x - 9, x), 28*x**3 - 6*x**2 + 1)
same(expand((2*x - 1)*(x**2 + 3)), 2*x**3 - x**2 + 6*x - 3); same(diff((2*x - 1)*(x**2 + 3), x), 6*x**2 - 2*x + 6)
holds(Ne((6*x**2 - 2*x + 6).subs(x, 1), (2*2*x).subs(x, 1)))
same(cancel((x**3 - 4*x)/x), x**2 - 4); same(diff((x**3 - 4*x)/x, x), 2*x)
same(diff(pi*t**2 + pi**2, t), 2*pi*t)
```
:::
::::

:::: exercise A cooling cup of tea {#ex-4-3} ★
Suppose a cup of tea is poured at $t = 0$, and its temperature after $t$ minutes is $T(t)$ degrees Celsius, with $T(10) = 62$ and $T'(10) = -1.5$. (The numbers are made up.)

- (a) What are the units of $T'(10)$, and what does $T'(10) = -1.5$ say in words?
- (b) Use the tangent line at $t = 10$ to estimate the temperature at $t = 10.5$ and at $t = 12$.
- (c) Does $\left.\dfrac{dT}{dt}\right|_{t=10} = -1.5$ say the same as $T'(10) = -1.5$? Does $\dfrac{d}{dt}\big(T(10)\big) = -1.5$?

::: solution
**(a)** Degrees Celsius per minute. Ten minutes after it was poured, the tea is cooling at a rate of 1.5 degrees per minute: its temperature is falling, which is what the minus sign says.

**(b)** The tangent line is $T \approx 62 - 1.5(t - 10)$. At $t = 10.5$ it gives $62 - 0.75 = 61.25$ °C, and at $t = 12$ it gives $62 - 3 = 59$ °C. The second estimate is less reliable: the tangent line follows the curve only near $t = 10$, and tea cools more slowly as it approaches room temperature.

**(c)** Yes: $\left.\dfrac{dT}{dt}\right|_{t=10} = -1.5$ is $T'(10) = -1.5$ in Leibniz's notation. No: $\dfrac{d}{dt}\big(T(10)\big)$ is the derivative of the number $T(10) = 62$, a constant, so it is 0, not $-1.5$.

```check
same(62 - Rational(15, 10)*(Rational(105, 10) - 10), Rational(6125, 100)); same(62 - Rational(15, 10)*(12 - 10), 59)
same(diff(Integer(62), t), 0)
```
:::
::::

:::: exercise Where is it not differentiable? {#ex-4-4} ★
For each function, find the points where it is not differentiable, and say whether each is a corner, a cusp, a vertical tangent or a discontinuity. Give the one-sided derivatives where they exist.

- (a) $f(x) = \abs{x - 2}$
- (b) $g(x) = (x + 1)^{2/3}$, with the real cube root
- (c) $k(x) = x^2$ for $x < 1$, and $k(x) = 2x$ for $x \ge 1$

::: solution
**(a)** Away from 2, $f$ is $x - 2$ or $2 - x$ near each point, so it is differentiable, with derivative 1 or $-1$. At 2, $f(2) = 0$ and the quotient is $\dfrac{\abs{h}}{h}$, as for $\abs{x}$ at 0: $f'_+(2) = 1$ and $f'_-(2) = -1$. A corner at $x = 2$.

**(b)** At $-1$, $g(-1) = 0$ and the quotient is $\dfrac{(h^2)^{1/3}}{h} = h^{-1/3}$, which tends to $\infty$ as $h \to 0^+$ and to $-\infty$ as $h \to 0^-$. A cusp at $x = -1$, the cusp of $x^{2/3}$ moved 1 to the left; no one-sided derivative exists there. Elsewhere $g$ is differentiable (Module 5's chain rule gives the formula).

**(c)** $k(1) = 2$, but as $x \to 1^-$, $k(x) = x^2 \to 1$: $k$ is not continuous at 1, so by Theorem 4.1 it is not differentiable there. A discontinuity (a jump). With $k(1) = 2$, the quotients for $h > 0$ and for $h < 0$ are

$$\begin{aligned} \frac{2(1 + h) - 2}{h} &= 2, \\ \frac{(1 + h)^2 - 2}{h} &= \frac{-1 + 2h + h^2}{h}. \end{aligned}$$

So $k'_+(1) = 2$, while the left-hand quotient grows without bound as $h \to 0^-$ (its numerator tends to $-1$), and there is no left-hand derivative. Away from 1, $k$ is a polynomial near each point, hence differentiable.

```check
hp = symbols('h', positive=True); hn = symbols('h', negative=True)
same(Abs((2 + hp) - 2)/hp, 1); same(Abs((2 + hn) - 2)/hn, -1)
limit_is(real_root(h**2, 3)/h, h, 0, oo, '+'); limit_is(real_root(h**2, 3)/h, h, 0, -oo, '-')
same(real_root(((-1 + hp) + 1)**2, 3)/hp, hp**Rational(-1, 3))
same((2*(1 + h) - 2)/h, 2); same(expand((1 + h)**2 - 2), -1 + 2*h + h**2)
limit_is(((1 + h)**2 - 2)/h, h, 0, oo, '-'); limit_is(x**2, x, 1, 1, '-')
```
:::
::::

:::: exercise Tangent lines with a given slope {#ex-4-5} ★★
Let $f(x) = x^3 - 3x^2$.

- (a) Find the points where the tangent line is parallel to the line $y = 9x + 1$, and the equations of those tangent lines.
- (b) Is there a point where the tangent line has slope $-4$?

::: solution
**(a)** Parallel lines have equal slopes, so solve $f'(x) = 9$. By the rules $f'(x) = 3x^2 - 6x$, and

$$\begin{aligned} &3x^2 - 6x = 9 \\ &\iff x^2 - 2x - 3 = 0 \\ &\iff (x - 3)(x + 1) = 0, \end{aligned}$$

so $x = 3$ or $x = -1$. Since $f(3) = 27 - 27 = 0$, the tangent at $(3, 0)$ is $y = 9(x - 3)$, that is, $y = 9x - 27$. Since $f(-1) = -1 - 3 = -4$, the tangent at $(-1, -4)$ is $y = -4 + 9(x + 1)$, that is, $y = 9x + 5$.

**(b)** Complete the square: $f'(x) = 3(x^2 - 2x) = 3(x - 1)^2 - 3 \ge -3$ for every $x$. Every tangent line has slope at least $-3$, so none has slope $-4$. (The equation $3x^2 - 6x + 4 = 0$ has no real solution: its discriminant is $36 - 48 < 0$.)

```check
fe5 = x**3 - 3*x**2
same(diff(fe5, x), 3*x**2 - 6*x)
same(expand((x - 3)*(x + 1)), x**2 - 2*x - 3); same_set(solve(Eq(diff(fe5, x), 9), x), [3, -1])
same(fe5.subs(x, 3), 0); same(fe5.subs(x, -1), -4)
same(expand(9*(x - 3)), 9*x - 27); same(expand(-4 + 9*(x + 1)), 9*x + 5)
same(expand(3*(x - 1)**2 - 3), 3*x**2 - 6*x); same(function_range(3*x**2 - 6*x, x, S.Reals), Interval(-3, oo))
same([r_ for r_ in solve(Eq(3*x**2 - 6*x, -4), x) if r_.is_real], []); same(discriminant(3*x**2 - 6*x + 4, x), 36 - 48); holds(36 - 48 < 0)
```
:::
::::

:::: exercise A derivative function from the definition {#ex-4-6} ★★
Let $f(x) = \dfrac{1}{x + 1}$.

- (a) Use the definition to show that $f'(x) = -\dfrac{1}{(x + 1)^2}$ for $x \ne -1$.
- (b) Find the tangent line at $x = 1$.
- (c) Explain from the formula why every tangent line of this graph slopes downwards.

::: solution
**(a)** Let $x \ne -1$. Combine the fractions over the common denominator $(x + h + 1)(x + 1)$:

$$\begin{aligned} &f(x + h) - f(x) \\ &\quad= \frac{1}{x + h + 1} - \frac{1}{x + 1} \\ &\quad= \frac{(x + 1) - (x + h + 1)}{(x + h + 1)(x + 1)} \\ &\quad= \frac{-h}{(x + h + 1)(x + 1)}. \end{aligned}$$

Divide by $h \ne 0$ and let $h \to 0$; since $x + 1 \ne 0$, direct substitution applies:

$$\begin{aligned} f'(x) &= \lim_{h\to0}\frac{-1}{(x + h + 1)(x + 1)} \\ &= -\frac{1}{(x + 1)^2}. \end{aligned}$$

At $x = -1$, $f$ is not defined, so neither is $f'$.

**(b)** $f(1) = \tfrac12$ and $f'(1) = -\tfrac14$, so the tangent line is $y = \tfrac12 - \tfrac14(x - 1)$, that is, $y = \tfrac34 - \tfrac{x}{4}$.

**(c)** For $x \ne -1$, $(x + 1)^2 > 0$, so $f'(x) = -\dfrac{1}{(x + 1)^2} < 0$: every tangent line has a negative slope.

```check
fe6 = 1/(x + 1)
steps(fe6.subs(x, x + h) - fe6, ((x + 1) - (x + h + 1))/((x + h + 1)*(x + 1)), -h/((x + h + 1)*(x + 1)))
limit_is((fe6.subs(x, x + h) - fe6)/h, h, 0, -1/(x + 1)**2); same(diff(fe6, x), -1/(x + 1)**2)
same(fe6.subs(x, 1), Rational(1, 2)); same((-1/(x + 1)**2).subs(x, 1), -Rational(1, 4))
same(expand(Rational(1, 2) - Rational(1, 4)*(x - 1)), Rational(3, 4) - x/4)
```
:::
::::

:::: exercise A ball thrown upwards {#ex-4-7} ★★
Suppose you throw a ball straight up at 14.7 m/s from 1.5 m above the ground. If air resistance is negligible, its height after $t$ seconds is $y(t) = 1.5 + 14.7t - 4.9t^2$ metres, until it lands.

- (a) Find its velocity and its acceleration, and say what their signs mean.
- (b) When is the ball highest, and how high is it then?
- (c) When does it land, and at what speed? Give both to two decimal places.

::: solution
**(a)** $v(t) = y'(t) = 14.7 - 9.8t$ m/s and $a(t) = v'(t) = -9.8$ m/s². Heights are measured upwards, so $v > 0$ means rising and $v < 0$ falling; the constant negative acceleration is gravity, pulling downwards. While the ball rises, $v > 0$ and $a < 0$ have opposite signs, so it slows down; once it falls, both are negative and it speeds up.

**(b)** At the top the ball stops rising and has not yet started to fall: $v(t) = 0$, so $t = 14.7/9.8 = 1.5$ s. Then $y(1.5) = 1.5 + 22.05 - 11.025 = 12.525$ m.

**(c)** The ball lands when $y(t) = 0$, that is, $4.9t^2 - 14.7t - 1.5 = 0$. By the quadratic formula,

$$\begin{aligned} t &= \frac{14.7 \pm \sqrt{14.7^2 + 4 \cdot 4.9 \cdot 1.5}}{2 \cdot 4.9} \\ &= \frac{14.7 \pm \sqrt{245.49}}{9.8}. \end{aligned}$$

The minus sign gives a negative time, before the throw, so $t = \dfrac{14.7 + \sqrt{245.49}}{9.8} \approx 3.10$ s. Then $9.8t = 14.7 + \sqrt{245.49}$, so $v = 14.7 - 9.8t = -\sqrt{245.49} \approx -15.67$ m/s: the ball lands at about 15.67 m/s, faster than it was thrown, because it falls from higher than it started.

```check
yb = Rational(3, 2) + Rational(147, 10)*t - Rational(49, 10)*t**2
same(diff(yb, t), Rational(147, 10) - Rational(98, 10)*t); same(diff(yb, t, 2), -Rational(98, 10))
same(solve(diff(yb, t), t), [Rational(3, 2)]); same(Rational(147, 10)/Rational(98, 10), Rational(3, 2))
same(yb.subs(t, Rational(3, 2)), Rational(12525, 1000)); same(Rational(3, 2) + Rational(2205, 100) - Rational(11025, 1000), Rational(12525, 1000))
same(Rational(147, 10)**2 + 4*Rational(49, 10)*Rational(3, 2), Rational(24549, 100))
tl = (Rational(147, 10) + sqrt(Rational(24549, 100)))/Rational(98, 10)
same_set(solve(yb, t), [tl, (Rational(147, 10) - sqrt(Rational(24549, 100)))/Rational(98, 10)]); holds(Rational(147, 10) - sqrt(Rational(24549, 100)) < 0)
rounds(tl, '3.10'); same(diff(yb, t).subs(t, tl), -sqrt(Rational(24549, 100))); rounds(sqrt(Rational(24549, 100)), '15.67'); rounds(-sqrt(Rational(24549, 100)), '-15.67')
holds(sqrt(Rational(24549, 100)) > Rational(147, 10))
```
:::
::::

:::: exercise Making a piecewise function differentiable {#ex-4-8} ★★
Find the constants $b$ and $c$ for which

$$f(x) = \begin{cases} x^2 & \text{if } x \le 1, \\ bx + c & \text{if } x > 1 \end{cases}$$

is differentiable at $x = 1$.

::: solution
Two conditions are needed.

**Continuity.** By Theorem 4.1, $f$ must be continuous at 1. From the left, $f(x) = x^2 \to 1 = f(1)$; from the right, $f(x) = bx + c \to b + c$. So $b + c = 1$.

**Equal one-sided derivatives.** With $f(1) = 1$, the left-hand quotient is $\dfrac{(1 + h)^2 - 1}{h} = 2 + h$, so $f'_-(1) = 2$. For $h > 0$ the right-hand quotient is

$$\begin{aligned} \frac{b(1 + h) + c - 1}{h} &= \frac{(b + c - 1) + bh}{h} \\ &= b, \end{aligned}$$

using $b + c = 1$. So $f'_+(1) = b$, and the two agree exactly when $b = 2$. Then $c = 1 - b = -1$.

So $b = 2$ and $c = -1$. The line $y = 2x - 1$ is the tangent to $y = x^2$ at $(1, 1)$: the graph leaves the parabola along its own tangent line. If $b + c \ne 1$, the right-hand quotient has the term $\dfrac{b + c - 1}{h}$, which grows without bound, as Theorem 4.1 predicts for a function that is not continuous.

```check
bb, cc = symbols('b c')
same(solve(Eq(bb + cc, 1), cc), [1 - bb])
same(((1 + h)**2 - 1)/h, 2 + h); limit_is(((1 + h)**2 - 1)/h, h, 0, 2, '-')
same(((bb*(1 + h) + (1 - bb)) - 1)/h, bb)
same(solve([Eq(bb + cc, 1), Eq(bb, 2)], [bb, cc]), {bb: 2, cc: -1})
same(expand(1 + 2*(x - 1)), 2*x - 1)
limit_is(((2*(1 + h) + 3) - 1)/h, h, 0, oo, '+')
```
:::
::::

:::: exercise Forward and central differences for 1/x {#ex-4-9} ★★
Let $f(x) = \dfrac1x$ and $a = 1$, so that $f'(1) = -1$ (as in Example 4.4).

- (a) Show that, for $0 < h < 1$, the forward difference equals $-\dfrac{1}{1 + h}$ and the central difference equals $-\dfrac{1}{1 - h^2}$.
- (b) Compute both, and their errors, for $h = 0.1$ and $h = 0.01$, to six decimal places.
- (c) In exact arithmetic, roughly how small must $h$ be for each error to be below $10^{-6}$?

::: solution
**(a)** Forward: put the two terms over the common denominator $1 + h$,

$$\frac{1}{1 + h} - 1 = \frac{1 - (1 + h)}{1 + h} = \frac{-h}{1 + h},$$

and dividing by $h$ gives $-\dfrac{1}{1 + h}$. Central: over the common denominator $(1 + h)(1 - h) = 1 - h^2$,

$$\begin{aligned} \frac{1}{1 + h} - \frac{1}{1 - h} &= \frac{(1 - h) - (1 + h)}{1 - h^2} \\ &= \frac{-2h}{1 - h^2}, \end{aligned}$$

and dividing by $2h$ gives $-\dfrac{1}{1 - h^2}$.

**(b)** The errors are the estimates minus $f'(1) = -1$:

$$\begin{aligned} -\frac{1}{1 + h} + 1 &= \frac{h}{1 + h}, \\ -\frac{1}{1 - h^2} + 1 &= -\frac{h^2}{1 - h^2}. \end{aligned}$$

At the two steps:

- $h = 0.1$: forward $-0.909091$, error $0.090909$; central $-1.010101$, error $-0.010101$.
- $h = 0.01$: forward $-0.990099$, error $0.009901$; central $-1.000100$, error $-0.000100$.

**(c)** The sizes of the errors are

$$\frac{h}{1 + h} < h \qquad\text{and}\qquad \frac{h^2}{1 - h^2} > h^2.$$

The forward error is a little less than $h$, so it falls below $10^{-6}$ when $h$ is about $10^{-6}$; at $h = 10^{-6}$ it is $10^{-6}/(1 + 10^{-6}) < 10^{-6}$. The central error is a little more than $h^2$, so $h$ about $10^{-3}$ suffices: $h = 0.000999$ gives about $9.98 \times 10^{-7}$. The central difference reaches the same accuracy with a step a thousand times larger; in floating point that matters, because larger steps suffer less rounding error.

```check
steps((1/(1 + h) - 1)/h, ((1 - (1 + h))/(1 + h))/h, -1/(1 + h))
steps(1/(1 + h) - 1/(1 - h), ((1 - h) - (1 + h))/(1 - h**2), -2*h/(1 - h**2)); same((-2*h/(1 - h**2))/(2*h), -1/(1 - h**2))
same(-1/(1 + h) + 1, h/(1 + h)); same(-1/(1 - h**2) + 1, -h**2/(1 - h**2))
fwd9 = lambda hv: -1/(1 + hv); cen9 = lambda hv: -1/(1 - hv**2)
rounds(fwd9(Rational(1, 10)), '-0.909091'); rounds(fwd9(Rational(1, 10)) + 1, '0.090909'); rounds(cen9(Rational(1, 10)), '-1.010101'); rounds(cen9(Rational(1, 10)) + 1, '-0.010101')
rounds(fwd9(Rational(1, 100)), '-0.990099'); rounds(fwd9(Rational(1, 100)) + 1, '0.009901'); rounds(cen9(Rational(1, 100)), '-1.000100'); rounds(cen9(Rational(1, 100)) + 1, '-0.000100')
holds(Rational(1, 10**6)/(1 + Rational(1, 10**6)) < Rational(1, 10**6))
hh9 = Rational(999, 10**6)
holds(hh9**2/(1 - hh9**2) < Rational(1, 10**6)); rounds(hh9**2/(1 - hh9**2), '9.98e-7')
```
:::
::::

:::: exercise The power rule by factoring {#ex-4-10} ★★★
- (a) Show that for every positive integer $n$,
  $$\begin{aligned} x^n - a^n &= (x - a)\big(x^{n-1} + x^{n-2}a \\ &\qquad + \dots + xa^{n-2} + a^{n-1}\big). \end{aligned}$$
- (b) Use (a) and the second form of the definition, $f'(a) = \lim_{x\to a}\dfrac{f(x) - f(a)}{x - a}$, to give another proof of the power rule.

::: solution
**(a)** Multiply out the right-hand side. Multiplying the long bracket by $x$ gives

$$x^n + x^{n-1}a + x^{n-2}a^2 + \dots + xa^{n-1},$$

and multiplying it by $-a$ gives

$$-x^{n-1}a - x^{n-2}a^2 - \dots - xa^{n-1} - a^n.$$

Every term of the first line except $x^n$ cancels against a term of the second line, and every term of the second line except $-a^n$ cancels against a term of the first. What remains is $x^n - a^n$. (For $n = 1$ the bracket is the single term 1, and the identity reads $x - a = x - a$.)

**(b)** For $x \ne a$, divide (a) by $x - a$:

$$\begin{aligned} \frac{x^n - a^n}{x - a} &= x^{n-1} + x^{n-2}a \\ &\quad + \dots + xa^{n-2} + a^{n-1}. \end{aligned}$$

The right-hand side is a polynomial in $x$ with $n$ terms. As $x \to a$, direct substitution turns each term into $a^{n-1}$, so the limit is $na^{n-1}$. So $\big(x^n\big)' = nx^{n-1}$ at every point $a$: the power rule again, this time without the binomial expansion.

```check
for N_ in range(1, 10):
    bracket = sum(x**(N_ - 1 - i)*a**i for i in range(N_))
    same(expand((x - a)*bracket), x**N_ - a**N_)
    same(expand(x*bracket), sum(x**(N_ - i)*a**i for i in range(N_)))
    same(bracket.subs(x, a), N_*a**(N_ - 1))
    limit_is((x**N_ - a**N_)/(x - a), x, a, N_*a**(N_ - 1))
```
:::
::::

:::: exercise Wiggles at the origin {#ex-4-11} ★★★
Let $f(x) = x\sin\dfrac1x$ and $g(x) = x^2\sin\dfrac1x$ for $x \ne 0$, with $f(0) = g(0) = 0$.

- (a) Show that $f$ is continuous at 0 but not differentiable there.
- (b) Show that $g$ is differentiable at 0, with $g'(0) = 0$.

(Use the squeeze theorem of Module 2.)

::: solution
**(a)** For $x \ne 0$, $\abs{\sin(1/x)} \le 1$, so $-\abs{x} \le x\sin\dfrac1x \le \abs{x}$. Both bounds tend to 0, so by the squeeze theorem $\lim_{x\to0}f(x) = 0 = f(0)$: $f$ is continuous at 0. Its difference quotient at 0 is

$$\frac{f(h) - f(0)}{h} = \frac{h\sin(1/h)}{h} = \sin\frac1h,$$

which has no limit as $h \to 0$. At $h = \dfrac{1}{\pi/2 + 2k\pi}$ it equals 1, and at $h = \dfrac{1}{3\pi/2 + 2k\pi}$ it equals $-1$, for every positive integer $k$; both lists of $h$ tend to 0. A limit $L$ would have to be within $\tfrac12$ of both 1 and $-1$ for all small $h$, which is impossible. So $f'(0)$ does not exist: the secants from the origin swing between slopes $-1$ and 1 forever.

**(b)** The difference quotient of $g$ at 0 is

$$\frac{g(h) - g(0)}{h} = \frac{h^2\sin(1/h)}{h} = h\sin\frac1h,$$

and $-\abs{h} \le h\sin\dfrac1h \le \abs{h}$, so it tends to 0 by the squeeze theorem: $g'(0) = 0$. The graph of $g$ wiggles infinitely often near 0, but the wiggles are trapped between $y = x^2$ and $y = -x^2$, which both have the horizontal tangent $y = 0$ at the origin, and so does $g$.

```check
kk = symbols('k', integer=True, positive=True)
limit_is(x*sin(1/x), x, 0, 0); limit_is(Abs(x), x, 0, 0)
same(x*sin(1/x)/x, sin(1/x)); same(x**2*sin(1/x)/x, x*sin(1/x))
same(sin(1/(1/(pi/2 + 2*kk*pi))), 1); same(sin(1/(1/(3*pi/2 + 2*kk*pi))), -1)
limit_is(1/(pi/2 + 2*kk*pi), kk, oo, 0); limit_is(1/(3*pi/2 + 2*kk*pi), kk, oo, 0)
same(limit(sin(1/h), h, 0), AccumBounds(-1, 1))
limit_is(h*sin(1/h), h, 0, 0); limit_is(x**2, x, 0, 0); same(diff(x**2, x).subs(x, 0), 0)
```
:::
::::

:::: exercise The best step size {#ex-4-12} ★★★
Section 4.7 modelled the error of the forward difference of $x^3$ at 1 as $3h + \varepsilon/h$. More generally, let $E(h) = Ch + \dfrac{K}{h}$, with positive constants $C$ and $K$.

- (a) Show that $E(h) \ge 2\sqrt{CK}$ for every $h > 0$, with equality exactly when $h = \sqrt{K/C}$. (Expand $\big(\sqrt{Ch} - \sqrt{K/h}\big)^2 \ge 0$.)
- (b) So the best step is $h^* = \sqrt{K/C}$, where the two parts of the error are equal. Find $h^*$ and $E(h^*)$ for $C = 3$ and $K = \varepsilon \approx 2.2 \times 10^{-16}$, and compare with the table in Section 4.7.
- (c) Suppose the values of $f$ carried only about 8 correct digits, as with noisy measurements, so that $K = 10^{-8}$. What are the best step and the smallest error now?

::: solution
**(a)** For $h > 0$ both square roots are defined, and

$$\begin{aligned} &\Big(\sqrt{Ch} - \sqrt{K/h}\Big)^2 \\ &\quad= Ch - 2\sqrt{Ch \cdot K/h} + \frac{K}{h} \\ &\quad= Ch - 2\sqrt{CK} + \frac{K}{h}. \end{aligned}$$

A square is never negative, so $Ch + \dfrac{K}{h} \ge 2\sqrt{CK}$. Equality holds exactly when the square is 0, that is, when $\sqrt{Ch} = \sqrt{K/h}$, which means $Ch = K/h$, or $h^2 = K/C$, or (since $h > 0$) $h = \sqrt{K/C}$. At that $h$ the two parts $Ch$ and $K/h$ are equal.

**(b)** $h^* = \sqrt{\varepsilon/3} \approx 8.6 \times 10^{-9}$ and $E(h^*) = 2\sqrt{3\varepsilon} \approx 5.2 \times 10^{-8}$. The table in Section 4.7 has its smallest forward error at $h = 10^{-8}$, the step nearest $h^*$, as predicted. The error there, about $4 \times 10^{-9}$, is smaller than the model's $5.2 \times 10^{-8}$, because the rounding errors partly cancelled by luck; at the neighbouring steps $10^{-7}$ and $10^{-9}$ the errors, about $3 \times 10^{-7}$ and $2.5 \times 10^{-7}$, are what the model predicts ($3.0 \times 10^{-7}$ and $2.3 \times 10^{-7}$).

**(c)** $h^* = \sqrt{10^{-8}/3} \approx 5.8 \times 10^{-5}$, and $E(h^*) = 2\sqrt{3 \times 10^{-8}} \approx 3.5 \times 10^{-4}$. With values good to 8 digits, a forward difference gives only about 4 correct digits, and it needs a much larger step. Noisy data give rough derivatives.

```check
Cp, Kp, hp_ = symbols('C K h', positive=True)
same(expand((sqrt(Cp*hp_) - sqrt(Kp/hp_))**2), Cp*hp_ - 2*sqrt(Cp*Kp) + Kp/hp_)
same((Cp*hp_ + Kp/hp_).subs(hp_, sqrt(Kp/Cp)), 2*sqrt(Cp*Kp)); same(solve(Eq(Cp*hp_, Kp/hp_), hp_), [sqrt(Kp/Cp)])
eps_ = Integer(2)**-52
rounds(sqrt(eps_/3), '8.6e-9'); rounds(2*sqrt(3*eps_), '5.2e-8')
E12 = lambda hv: 3*hv + eps_/hv
rounds(E12(Rational(1, 10**7)), '3.0e-7'); rounds(E12(Rational(1, 10**9)), '2.3e-7')
fwd_float = lambda hv: abs(((1.0 + hv)**3 - 1.0)/hv - 3.0)          # the table of Section 4.7, in floating point
rounds(fwd_float(1e-8), '4e-9'); rounds(fwd_float(1e-7), '3e-7'); rounds(fwd_float(1e-9), '2.5e-7')
holds(fwd_float(1e-8) < min(fwd_float(10.0**-k_) for k_ in range(1, 16) if k_ != 8))
rounds(sqrt(Rational(1, 10**8)/3), '5.8e-5'); rounds(2*sqrt(3*Rational(1, 10**8)), '3.5e-4')
```
:::
::::

## Check yourself {#quiz}

```quiz
? For $f(x) = x^2$, which expression is $f'(3)$?
- [ ] $\dfrac{(3 + h)^2 - 9}{h}$
- [x] $\lim\limits_{h\to0}\dfrac{(3 + h)^2 - 9}{h}$
- [ ] $\lim\limits_{h\to0}\dfrac{(9 + h) - 9}{h}$
- [ ] $\lim\limits_{x\to3}\dfrac{x^2 - 9}{x + 3}$
> The derivative is the limit of the difference quotient: $\lim_{h\to0}\dfrac{(3 + h)^2 - 9}{h} = \lim_{h\to0}(6 + h) = 6$. The quotient without the limit is the slope of one secant, not of the tangent. $(9 + h)$ replaces $f(3 + h)$ by $f(3) + h$, and that limit is 1, not 6. The last expression has $x + 3$ where $x - 3$ belongs; its limit is 0.

? If $f(2) = 5$ and $f'(2) = -3$, the tangent line to the graph of $f$ at $x = 2$ is
- [ ] $y = -3x + 5$
- [ ] $y = 5x - 3$
- [x] $y = -3x + 11$
- [ ] $y = -3x - 1$
> The tangent line is $y = f(2) + f'(2)(x - 2) = 5 - 3(x - 2) = -3x + 11$; at $x = 2$ it gives 5, as it must. $y = -3x + 5$ has the right slope but passes through $(0, 5)$, not $(2, 5)$; $y = -3x - 1$ comes from $5 - 3(x + 2)$, a sign slip; $y = 5x - 3$ swaps the slope and the value.

? Which of these functions is continuous at 0 but not differentiable there?
- [ ] $x^2$
- [ ] $H(x)$, equal to 0 for $x < 0$ and 1 for $x \ge 0$
- [ ] $x^3$
- [x] $\abs{x}$
> $\abs{x}$ is continuous at 0, but its one-sided derivatives there are $-1$ and 1, so it has a corner and no derivative. $x^2$ and $x^3$ are polynomials, differentiable everywhere (both have derivative 0 at 0). The step $H$ is not even continuous at 0, so by Theorem 4.1 it is not differentiable there either.

? $\dfrac{d}{dx}\big(5x^4 - 2x + 7\big)$ is
- [x] $20x^3 - 2$
- [ ] $20x^4 - 2$
- [ ] $20x^3 - 2 + 7$
- [ ] $5x^3 - 2$
> Term by term: $5 \cdot 4x^3 - 2 \cdot 1 + 0 = 20x^3 - 2$. $20x^4$ forgets to lower the exponent; keeping the $+7$ forgets that a constant has derivative 0; $5x^3$ lowers the exponent but forgets to bring the 4 down in front.

? If $y = x^3$, then $\left.\dfrac{dy}{dx}\right|_{x=2}$ equals
- [ ] $8$
- [x] $12$
- [ ] $6$
- [ ] $0$
> Differentiate first, then substitute: $\dfrac{dy}{dx} = 3x^2$, which is 12 at $x = 2$. 8 is the value of $y$, not of its derivative; 6 is $3x$ at $x = 2$, which forgets the square in $3x^2$; 0 is what you get by substituting first and differentiating the constant 8.

? At a point where the graph of $f$ has a horizontal tangent, the graph of $f'$
- [x] meets the $x$-axis
- [ ] has a horizontal tangent
- [ ] has its highest point
- [ ] is not defined
> The height of $f'$ is the slope of $f$, and a horizontal tangent has slope 0, so $f'$ is 0 there: its graph meets the $x$-axis. The other answers describe the shape of $f'$ itself, which a horizontal tangent of $f$ does not determine; in Figure 4.2, $f'$ crosses the axis at $x = \pm1$ with no horizontal tangent and no maximum there. $f'$ is undefined only where $f$ is not differentiable.

? A particle moves along a line with position $s(t) = t^3 - 3t$ metres after $t$ seconds. Its acceleration at $t = 2$ is
- [ ] $9$ m/s
- [ ] $2$ m
- [x] $12$ m/s²
- [ ] $6$ m/s³
> $v(t) = 3t^2 - 3$ and $a(t) = 6t$, so $a(2) = 12$ m/s². 9 m/s is the velocity at $t = 2$, and 2 m the position; 6 m/s³ is the jerk $s'''(t) = 6$, the derivative of the acceleration.

? In floating-point arithmetic, why is the forward difference of $x^3$ at 1 worse with $h = 10^{-14}$ than with $h = 10^{-8}$?
- [ ] Its truncation error grows as $h$ shrinks
- [ ] $x^3$ is not differentiable at 1
- [ ] Python cannot store the number $10^{-14}$
- [x] Rounding error, about $\varepsilon/h$, grows as $h$ shrinks
> $f(1 + h)$ and $f(1)$ agree in almost all their digits, so their difference loses most of its accuracy, and dividing by the tiny $h$ magnifies the rounding error, about $\varepsilon/h$ with $\varepsilon \approx 2.2 \times 10^{-16}$. The truncation error $3h + h^2$ shrinks with $h$; $x^3$ is differentiable everywhere; and $10^{-14}$ is stored without trouble, to about 16 significant digits.
```

```check
limit_is(((3 + h)**2 - 9)/h, h, 0, 6); limit_is(((9 + h) - 9)/h, h, 0, 1); limit_is((x**2 - 9)/(x + 3), x, 3, 0)
same(expand(5 - 3*(x - 2)), -3*x + 11); same(expand(5 - 3*(x + 2)), -3*x - 1)
limit_is(Abs(h)/h, h, 0, 1, '+'); same(diff(x**2, x).subs(x, 0), 0); same(diff(x**3, x).subs(x, 0), 0)
same(diff(5*x**4 - 2*x + 7, x), 20*x**3 - 2)
same(diff(x**3, x).subs(x, 2), 12); same((x**3).subs(x, 2), 8)
sq = t**3 - 3*t
same(diff(sq, t).subs(t, 2), 9); same(sq.subs(t, 2), 2); same(diff(sq, t, 2).subs(t, 2), 12); same(diff(sq, t, 3), 6)
same(expand(((1 + h)**3 - 1)/h - 3), 3*h + h**2)
```
