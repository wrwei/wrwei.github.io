---
title: The Fundamental Theorem of Calculus
part: 3
lead: Connect the two halves of calculus. You will find functions from their derivatives, watch the area under a graph grow as its right end moves, prove that it grows at a rate equal to the height of the graph, evaluate integrals with antiderivatives instead of limits of sums, reverse the chain rule with substitution, and integrate with SymPy.
minutes: 255
needs: Modules 1 to 9, especially the chain rule (Module 5), the Mean Value Theorem and its consequences (Module 8) and the definite integral (Module 9)
goals:
  - Find antiderivatives with a table of basic ones, explain the constant $C$, and solve initial value problems such as finding position from velocity
  - Read the area function $A(x) = \int_a^x f(t)\,dt$ from a graph and from numbers, and say where it increases, decreases and is largest
  - State both parts of the Fundamental Theorem of Calculus with their hypotheses, prove them, and differentiate integrals whose limits vary
  - Evaluate definite integrals with antiderivatives, and use the net change theorem for displacement, distance travelled and accumulated amounts
  - Integrate by substitution, in indefinite and in definite integrals, changing the limits correctly
  - Integrate with SymPy, check an antiderivative by differentiating it, and explain answers that differ by a constant or use special functions
---

## Antiderivatives {#antiderivatives}

Module 4 started from a position and found a velocity: differentiate $s(t)$ and you get $v(t)$. Often the question runs the other way. A car's speedometer records its velocity, and you want to know where the car is; a phone's accelerometer measures acceleration, and the phone wants its velocity; a model says how fast a quantity changes, and you want the quantity itself. Each time you know a derivative and want the function it came from. This section and the next undo derivatives. The rest of the module shows that undoing a derivative is also the way to compute the areas of Module 9, and that this connection, the Fundamental Theorem of Calculus, joins the two halves of calculus into one subject.

Start with a guess. Which function has derivative $2x$? You know one: $x^2$, since $\big(x^2\big)' = 2x$. But $x^2 + 1$ has derivative $2x$ too, and so do $x^2 - 7$ and $x^2 + \pi$: the derivative of a constant is 0, so adding a constant changes nothing.

::: definition Antiderivative
Let $f$ be a function defined on an interval $I$. A function $F$ is an **antiderivative** of $f$ on $I$ if $F'(x) = f(x)$ for every $x$ in $I$. (At an endpoint of $I$ that belongs to $I$, $F'$ means the one-sided derivative of Module 4.)
:::

So $x^2$ is an antiderivative of $2x$ on $\R$, $\sin x$ is an antiderivative of $\cos x$, $-\cos x$ of $\sin x$, and $e^x$ of itself. By Module 6, $\ln x$ is an antiderivative of $1/x$ on $(0, \infty)$.

```check
antideriv(x**2, 2*x, x); antideriv(x**2 + 1, 2*x, x); antideriv(x**2 - 7, 2*x, x); antideriv(x**2 + pi, 2*x, x)
antideriv(sin(x), cos(x), x); antideriv(-cos(x), sin(x), x); antideriv(exp(x), exp(x), x)
xp = symbols('x', positive=True)
antideriv(log(xp), 1/xp, xp)
```

Figure 10.1 shows the antiderivatives $\tfrac13 x^3 - x + C$ of $f(x) = x^2 - 1$ for five values of the constant $C$. Adding a constant moves a graph up or down without tilting it, so at each $x$ all these curves have the same slope, $f(x)$: their tangent lines there are parallel.

::: figure id=fig-10-1
The antiderivatives $\tfrac13 x^3 - x + C$ of $f(x) = x^2 - 1$, for $C = -2, -1, 0, 1, 2$ from bottom to top. Each curve is the one below it shifted up by 1, so at every $x$ they have the same slope: at $x = 1.5$ their tangent lines (orange) are parallel, with slope $f(1.5) = 1.25$. Exactly one of them passes through the point $(0, 1)$: the blue one, with $C = 1$ (Section 10.2).
:::

```check
F1 = x**3/3 - x + c
antideriv(F1, x**2 - 1, x); same((x**2 - 1).subs(x, Rational(3, 2)), Rational(5, 4))
same(F1.subs(c, c + 1) - F1, 1); same(solve(Eq(F1.subs(x, 0), 1), c), [1])
```

Are there other antiderivatives, not of the form "one of them plus a constant"? No, as long as you stay on an interval.

::: theorem The antiderivatives of a function
If $F$ is an antiderivative of $f$ on an interval $I$, then the antiderivatives of $f$ on $I$ are exactly the functions
$$F(x) + C,$$
where $C$ is a constant.
:::

::: proof
For every constant $C$, $(F + C)' = F' + 0 = f$ on $I$, so $F + C$ is an antiderivative. Conversely, let $G$ be any antiderivative of $f$ on $I$, and let $H = G - F$, so that $H'(x) = f(x) - f(x) = 0$ for every $x$ in $I$. Module 8 proved that such a function is constant on an open interval ([Theorem 8.5](module_08_EN.html#consequences)), and the same argument works on any interval. Take two numbers $x_1 < x_2$ in $I$. $H$ has a derivative at every point of $[x_1, x_2]$ (a one-sided one at an endpoint of $I$), so it is continuous on $[x_1, x_2]$ by [Theorem 4.1](module_04_EN.html#continuity), whose proof works from one side too. By the Mean Value Theorem, $H(x_2) - H(x_1) = H'(c)(x_2 - x_1) = 0$ for some $c$ between $x_1$ and $x_2$. So $H$ takes the same value $C$ at every point of $I$: $G = F + C$.
:::

The function $F(x) + C$, with $C$ standing for any constant, is the **general antiderivative** of $f$ on $I$, and $C$ is the **constant of integration**. The interval matters: the proof applies the Mean Value Theorem on $[x_1, x_2]$, so all of $[x_1, x_2]$ must lie in $I$. The function $1/x$ is defined on $(-\infty, 0) \cup (0, \infty)$, which is not an interval. Module 6 showed that $\dfrac{d}{dx}\ln\abs{x} = \dfrac1x$ for every $x \ne 0$, so on each half the antiderivatives are $\ln\abs{x} + C$. But the function equal to $\ln\abs{x}$ for $x > 0$ and to $\ln\abs{x} + 5$ for $x < 0$ also has derivative $1/x$ at every $x \ne 0$, and it is not $\ln\abs{x} + C$ for any single constant $C$: the constant may differ from one interval to the other. And since $1/x$ is not defined at 0, no antiderivative of it reaches across 0; Section 10.5 shows what that means for integrals.

```check
antideriv(log(x), 1/x, x); antideriv(log(-x), 1/x, x); antideriv(log(-x) + 5, 1/x, x)
xneg = symbols('x', negative=True)
same(log(Abs(xneg)), log(-xneg))      # for x < 0, ln|x| = ln(-x)
```

### A table of antiderivatives {#table}

Each rule of differentiation, read backwards, gives an antiderivative. In the table, the derivative of each entry in the middle column is the entry on its left; to get the general antiderivative, add $C$, on each interval where the formula holds.

| $f(x)$ | An antiderivative $F(x)$ | Where |
|---|---|---|
| $x^n$, $n \ne -1$ | $\dfrac{x^{n+1}}{n + 1}$ | see below |
| $\dfrac{1}{x}$ | $\ln\abs{x}$ | $x \ne 0$ |
| $e^x$ | $e^x$ | |
| $e^{kx}$, $k \ne 0$ | $\dfrac{e^{kx}}{k}$ | |
| $a^x$, $a > 0$, $a \ne 1$ | $\dfrac{a^x}{\ln a}$ | |
| $\sin x$ | $-\cos x$ | |
| $\cos x$ | $\sin x$ | |
| $\sin kx$, $k \ne 0$ | $-\dfrac{\cos kx}{k}$ | |
| $\cos kx$, $k \ne 0$ | $\dfrac{\sin kx}{k}$ | |
| $\sec^2 x$ | $\tan x$ | $\cos x \ne 0$ |
| $\csc^2 x$ | $-\cot x$ | $\sin x \ne 0$ |
| $\sec x\tan x$ | $\sec x$ | $\cos x \ne 0$ |
| $\csc x\cot x$ | $-\csc x$ | $\sin x \ne 0$ |
| $\dfrac{1}{1 + x^2}$ | $\arctan x$ | |
| $\dfrac{1}{\sqrt{1 - x^2}}$ | $\arcsin x$ | $-1 < x < 1$ |
| $\sinh x$ | $\cosh x$ | |
| $\cosh x$ | $\sinh x$ | |

The first row, the **power rule for antiderivatives**, holds on $(0, \infty)$ for every real $n \ne -1$. When $n$ is an integer it holds for negative $x$ as well, and for $n = 0, 1, 2, \dots$ on all of $\R$. In words: raise the power by 1 and divide by the new power. For $n = -1$ it would divide by 0; the second row takes its place. The rows with $k$ follow from the chain rule (Module 5): $\dfrac{d}{dx}\dfrac{e^{kx}}{k} = \dfrac{k e^{kx}}{k} = e^{kx}$. The derivatives behind the other rows are those of Modules 4 to 6.

```check
for N_ in (-4, -2, 0, 1, 2, 5):
    antideriv(x**(N_ + 1)/(N_ + 1), x**N_, x)
nr = symbols('n', real=True)
antideriv(xp**(nr + 1)/(nr + 1), xp**nr, xp)
kn = symbols('k', nonzero=True); ap = symbols('a', positive=True)
antideriv(exp(kn*x)/kn, exp(kn*x), x); antideriv(-cos(kn*x)/kn, sin(kn*x), x); antideriv(sin(kn*x)/kn, cos(kn*x), x)
same(diff(exp(kn*x)/kn, x), kn*exp(kn*x)/kn)
antideriv(ap**x/log(ap), ap**x, x)
antideriv(tan(x), sec(x)**2, x); antideriv(-cot(x), csc(x)**2, x)
antideriv(sec(x), sec(x)*tan(x), x); antideriv(-csc(x), csc(x)*cot(x), x)
antideriv(atan(x), 1/(1 + x**2), x); antideriv(asin(x), 1/sqrt(1 - x**2), x)
antideriv(cosh(x), sinh(x), x); antideriv(sinh(x), cosh(x), x)
```

Two rules of Module 4 carry over. If $F$ and $G$ are antiderivatives of $f$ and $g$ on an interval, and $c$ is a constant, then $cF$ is an antiderivative of $cf$, and $F + G$ of $f + g$, because $(cF + G)' = cF' + G' = cf + g$. So you can find antiderivatives term by term, keeping constant factors.

::: example Antiderivatives from the table
Find the general antiderivative of each function.

- (a) $f(x) = 6x^2 - 4x + 5$
- (b) $g(x) = 3\sqrt{x} - \dfrac{2}{x^2}$, for $x > 0$
- (c) $h(t) = 4e^{2t} - 3\cos t$
- (d) $q(x) = \dfrac{(x + 1)^2}{x}$, for $x \ne 0$

**(a)** Term by term, raising each power by 1 and dividing by the new power: $6 \cdot \dfrac{x^3}{3} - 4 \cdot \dfrac{x^2}{2} + 5x$, so the general antiderivative is $2x^3 - 2x^2 + 5x + C$.

**(b)** First write the terms as powers: $g(x) = 3x^{1/2} - 2x^{-2}$. The power rule gives
$$3\cdot\frac{x^{3/2}}{3/2} - 2\cdot\frac{x^{-1}}{-1} = 2x^{3/2} + \frac{2}{x},$$
so the general antiderivative is $2x^{3/2} + \dfrac2x + C$ on $(0, \infty)$.

**(c)** With $k = 2$ in the table, $4\cdot\dfrac{e^{2t}}{2} = 2e^{2t}$; and $-3\cos t$ gives $-3\sin t$. The answer is $2e^{2t} - 3\sin t + C$.

**(d)** There is no rule for quotients, so expand and divide each term by $x$ first: $\dfrac{x^2 + 2x + 1}{x} = x + 2 + \dfrac1x$. The general antiderivative is $\dfrac{x^2}{2} + 2x + \ln\abs{x} + C$ on $(0, \infty)$, and the same formula, with a constant that may differ, on $(-\infty, 0)$.

Check every answer by differentiating it. For (b): $\dfrac{d}{dx}\Big(2x^{3/2} + 2x^{-1}\Big) = 3x^{1/2} - 2x^{-2}$, which is $g(x)$.

```check
same(6*x**3/3 - 4*x**2/2 + 5*x, 2*x**3 - 2*x**2 + 5*x); antideriv(2*x**3 - 2*x**2 + 5*x, 6*x**2 - 4*x + 5, x)
same(3*sqrt(xp) - 2/xp**2, 3*xp**Rational(1, 2) - 2*xp**(-2))
same(3*xp**Rational(3, 2)/Rational(3, 2) - 2*xp**(-1)/(-1), 2*xp**Rational(3, 2) + 2/xp)
antideriv(2*xp**Rational(3, 2) + 2/xp, 3*sqrt(xp) - 2/xp**2, xp)
steps(Derivative(2*xp**Rational(3, 2) + 2*xp**(-1), xp), 3*xp**Rational(1, 2) - 2*xp**(-2))
same(4*exp(2*t)/2, 2*exp(2*t)); antideriv(2*exp(2*t) - 3*sin(t), 4*exp(2*t) - 3*cos(t), t)
same(expand((x + 1)**2/x), x + 2 + 1/x)
antideriv(x**2/2 + 2*x + log(x), (x + 1)**2/x, x); antideriv(x**2/2 + 2*x + log(-x), (x + 1)**2/x, x)
```
:::

::: tip
Differentiating is easier than undoing a derivative, so always check an antiderivative by differentiating it. It takes a few seconds and catches almost every slip.
:::

::: pitfall
Three slips. **(1)** The power rule backwards raises the power and divides: an antiderivative of $x^3$ is $\tfrac14 x^4$, not $3x^2$ (that is the derivative) and not $x^4$ (whose derivative is $4x^3$). **(2)** There is no product rule for antiderivatives: an antiderivative of $x\cos x$ is not $\tfrac12 x^2\sin x$, whose derivative is $x\sin x + \tfrac12 x^2\cos x$. Module 11 integrates such products; Section 10.7 handles products in which one factor is the derivative of something inside the other. **(3)** "$+\,C$" is part of the answer when you are asked for all antiderivatives, and on a domain made of several intervals, such as $x \ne 0$, the constant may differ on each.

```check
antideriv(x**4/4, x**3, x); same(diff(x**3, x), 3*x**2); same(diff(x**4, x), 4*x**3)
same(diff(x**2*sin(x)/2, x), x*sin(x) + x**2*cos(x)/2); holds(Ne((x*sin(x) + x**2*cos(x)/2).subs(x, 1), cos(1)))
```
:::

## Initial value problems {#initial-value}

Figure 10.1 shows how to pick one antiderivative out of the family: ask for the one whose graph passes through a given point. Of the curves $\tfrac13 x^3 - x + C$, only the one with $C = 1$ passes through $(0, 1)$.

::: definition Initial value problem
An **initial value problem** asks for a function $y = F(x)$ with
$$\begin{aligned} &F'(x) = f(x) \text{ for every } x \text{ in } I, \\ &F(x_0) = y_0, \end{aligned}$$
where $I$ is an interval, $x_0$ a point of $I$ and $y_0$ a number. The equation $F' = f$ is the simplest kind of **differential equation**, an equation for an unknown function that involves its derivative, and $F(x_0) = y_0$ is the **initial condition**.
:::

If $f$ has an antiderivative $G$ on $I$, the problem has exactly one solution. By Theorem 10.1 every solution has the form $G + C$; the initial condition says $G(x_0) + C = y_0$, so $C = y_0 - G(x_0)$, and the solution is
$$F(x) = G(x) - G(x_0) + y_0.$$
To solve one: find the general antiderivative, put in the initial condition, and solve for $C$. Module 13 studies differential equations in which the derivative depends on the unknown function as well, such as $y' = ky$.

```check
G_ = Function('G')
same((G_(x) - G_(a) + b).subs(x, a), b); same(diff(G_(x) - G_(a) + b, x), diff(G_(x), x))
```

::: example An initial value problem
Find the function $F$ with $F'(x) = 3\sqrt x - \dfrac{2}{x^2}$ for $x > 0$ and $F(1) = 5$.

By Example 10.1(b), the general antiderivative is $F(x) = 2x^{3/2} + \dfrac2x + C$. The initial condition gives
$$F(1) = 2 + 2 + C = 4 + C = 5,$$
so $C = 1$ and
$$F(x) = 2x^{3/2} + \frac2x + 1, \qquad x > 0.$$
Check: $F(1) = 2 + 2 + 1 = 5$, and $F'$ is the given function, as Example 10.1 showed.

```check
F2 = 2*xp**Rational(3, 2) + 2/xp
same((F2 + c).subs(xp, 1), 4 + c); same(solve(Eq(4 + c, 5), c), [1])
antideriv(F2 + 1, 3*sqrt(xp) - 2/xp**2, xp); same((F2 + 1).subs(xp, 1), 5)
```
:::

Motion is the classic source of initial value problems: velocity is the derivative of position and acceleration the derivative of velocity (Module 4), so from the acceleration and two initial conditions you recover the whole motion.

::: example The falling ball again
Module 1 took the distance fallen by a dropped ball, $s(t) = 4.9t^2$ metres, as given. Derive it. Measure distances downwards from the point of release. Near the Earth's surface, with air resistance negligible, the ball's acceleration is constant, $a(t) = 9.8$ m/s², and it is released from rest: $v(0) = 0$ and $s(0) = 0$.

- (a) Find the velocity $v(t)$ and the distance fallen $s(t)$.
- (b) A ball is thrown straight up at 14.7 m/s from 1.5 m above the ground. With heights $y$ measured upwards, find $y(t)$.

**(a)** The velocity is an antiderivative of the acceleration: $v(t) = 9.8t + C_1$. The condition $v(0) = 0$ gives $C_1 = 0$, so $v(t) = 9.8t$. The position is an antiderivative of the velocity: $s(t) = 4.9t^2 + C_2$, and $s(0) = 0$ gives $C_2 = 0$. So
$$s(t) = 4.9t^2,$$
the formula of Module 1, now derived from one physical fact: the acceleration is constant.

**(b)** Heights are measured upwards and gravity pulls down, so $a(t) = -9.8$. Then $v(t) = -9.8t + C_1$, and $v(0) = 14.7$ gives $C_1 = 14.7$. Next $y(t) = -4.9t^2 + 14.7t + C_2$, and $y(0) = 1.5$ gives $C_2 = 1.5$:
$$y(t) = 1.5 + 14.7t - 4.9t^2,$$
the height that [Exercise 4.7](module_04_EN.html#ex-4-7) differentiated. In general, an object with constant acceleration $a$, initial velocity $v_0$ and initial position $s_0$ has position $s(t) = s_0 + v_0 t + \tfrac12 a t^2$.

```check
C1, C2 = symbols('C1 C2')
antideriv(Rational(98, 10)*t + C1, Rational(98, 10), t); same(solve((Rational(98, 10)*t + C1).subs(t, 0), C1), [0])
antideriv(Rational(49, 10)*t**2 + C2, Rational(98, 10)*t, t); same(solve((Rational(49, 10)*t**2 + C2).subs(t, 0), C2), [0])
antideriv(-Rational(98, 10)*t + C1, -Rational(98, 10), t); same(solve(Eq((-Rational(98, 10)*t + C1).subs(t, 0), Rational(147, 10)), C1), [Rational(147, 10)])
yb3 = -Rational(49, 10)*t**2 + Rational(147, 10)*t + C2
antideriv(yb3, -Rational(98, 10)*t + Rational(147, 10), t); same(solve(Eq(yb3.subs(t, 0), Rational(3, 2)), C2), [Rational(3, 2)])
a0, v0, s0 = symbols('a_0 v_0 s_0')
sg = s0 + v0*t + a0*t**2/2
same(diff(sg, t, 2), a0); same(diff(sg, t).subs(t, 0), v0); same(sg.subs(t, 0), s0)
same(sg.subs({s0: Rational(3, 2), v0: Rational(147, 10), a0: -Rational(98, 10)}), Rational(3, 2) + Rational(147, 10)*t - Rational(49, 10)*t**2)
```
:::

::: pitfall
Two slips with initial value problems. **(1)** Each antidifferentiation brings its own constant. In Example 10.3 the velocity needs $C_1$, fixed by $v(0)$, and the position needs $C_2$, fixed by $s(0)$; dropping $C_1$ loses the initial velocity. **(2)** $C$ is not always the initial value. If $s'(t) = \sin t$ and $s(0) = 0$, then $s(t) = -\cos t + C$ and $s(0) = -1 + C = 0$, so $C = 1$ and $s(t) = 1 - \cos t$; setting $C = 0$ would give $s(0) = -1$. Put the condition into the whole antiderivative, then solve for $C$.

```check
same(solve(Eq((-cos(t) + c).subs(t, 0), 0), c), [1]); antideriv(1 - cos(t), sin(t), t); same((1 - cos(t)).subs(t, 0), 0); same(-cos(0), -1)
```
:::

## The area function {#area-function}

Module 9 defined the definite integral $\int_a^b f(x)\,dx$ as the limit of the Riemann sums $\sum f(x_i^*)\,\Delta x_i$ as the norm of the partition, the width of its widest subinterval, shrinks to 0; when $f$ is continuous on $[a, b]$, the limit exists, and $f$ is integrable. Where $f$ is positive, the integral is the area between its graph and the $x$-axis; where $f$ is negative, that area counts as negative, so the integral is a signed area. This module uses these properties from Module 9:

- $\displaystyle\int_a^a f(x)\,dx = 0$ and $\displaystyle\int_b^a f(x)\,dx = -\int_a^b f(x)\,dx$;
- **splitting**: $\displaystyle\int_a^c f(x)\,dx = \int_a^b f(x)\,dx + \int_b^c f(x)\,dx$, for $a$, $b$ and $c$ in any order, when $f$ is integrable on a closed interval that contains all three;
- **linearity**: $\displaystyle\int_a^b \big(c f(x) + g(x)\big)\,dx = c\int_a^b f(x)\,dx + \int_a^b g(x)\,dx$;
- **bounds**: if $a < b$ and $m \le f(x) \le M$ for $a \le x \le b$, then $m(b - a) \le \displaystyle\int_a^b f(x)\,dx \le M(b - a)$;
- **the Mean Value Theorem for integrals**: if $f$ is continuous on $[a, b]$, where $a < b$, there is a number $c$ in $[a, b]$ with $\displaystyle\int_a^b f(x)\,dx = f(c)\,(b - a)$.

Now keep the left end fixed and let the right end move.

::: definition The area function
Let $I$ be an interval, let $f$ be integrable on every closed interval inside $I$ (as it is when $f$ is continuous on $I$), and let $a$ be a point of $I$. The **area function** of $f$ from $a$ is
$$A(x) = \int_a^x f(t)\,dt, \qquad x \text{ in } I.$$
:::

Read it as "A of x is the integral from a to x of f of t, d t". It is also called the **accumulation function**: as $x$ moves right, $A(x)$ accumulates the signed area under $f$. For $x < a$ the integral runs backwards, $A(x) = -\int_x^a f(t)\,dt$. As in Module 9, the letter $t$ is a dummy variable: $\int_a^x f(t)\,dt$ and $\int_a^x f(s)\,ds$ are the same number, as a sum $\sum_{i=1}^n i^2$ does not depend on the name $i$. Writing $\int_a^x f(x)\,dx$ would make $x$ mean two things at once, the right end and the variable that runs from $a$ to it, so the variable gets another name.

::: figure id=fig-10-2
The function $f$ of Example 10.4, made of straight pieces (top), and its area function $A(x) = \int_0^x f(t)\,dt$ (bottom). The area from 0 to 5 is shaded, blue where $f > 0$ (it counts as positive) and orange where $f < 0$ (negative), so $A(5) = 5 - 2.5 = 2.5$. $A$ rises while $f$ is positive and falls while $f$ is negative; it is largest at $x = 3$, where $f$ changes sign. The dashed line, the tangent to the graph of $A$ at $x = 5$, has slope $f(5) = -1$.
:::

::: example Reading an area function
Let $f$ be the function of Figure 10.2,
$$f(t) = \begin{cases} 2 & \text{if } 0 \le t \le 2, \\ 6 - 2t & \text{if } 2 < t \le 4, \\ t - 6 & \text{if } 4 < t \le 6, \end{cases}$$
and let $A(x) = \int_0^x f(t)\,dt$ for $0 \le x \le 6$.

- (a) Find $A(x)$ for $x = 0, 1, 2, \dots, 6$.
- (b) Where is $A$ increasing, where is it decreasing, and where is it largest?
- (c) Compare the slope of the graph of $A$ with the height of the graph of $f$.

**(a)** The regions are rectangles, triangles and trapezoids. $A(0) = 0$. On $[0, 2]$, $f = 2$, so $A(1) = 2$ and $A(2) = 4$. From 2 to 3, $f$ falls from 2 to 0: a triangle of area $\tfrac12 \cdot 1 \cdot 2 = 1$, so $A(3) = 5$. From 3 to 4, $f$ falls from 0 to $-2$: a triangle below the axis, of signed area $-1$, so $A(4) = 4$. From 4 to 5, $f$ rises from $-2$ to $-1$: a trapezoid below the axis, of signed area $-\tfrac{2 + 1}{2} \cdot 1 = -1.5$, so $A(5) = 2.5$. From 5 to 6, a triangle of signed area $-0.5$: $A(6) = 2$. So, for $x = 0, 1, \dots, 6$, $A(x)$ is 0, 2, 4, 5, 4, 2.5 and 2.

**(b)** While $x$ moves through $[0, 3]$, $f \ge 0$, so each step adds area and $A$ increases, from 0 to 5. On $[3, 6]$, $f \le 0$, so each step takes area away and $A$ decreases, from 5 to 2. $A$ is largest at $x = 3$, where $f$ changes from positive to negative: $A(3) = 5$.

**(c)** On $[0, 2]$, $A(x) = 2x$: a line of slope 2, and the height of $f$ there is 2. At $x = 3$ the graph of $A$ is flat at its top, and $f(3) = 0$. For $4 \le x \le 6$ the region between 4 and $x$ is a trapezoid below the axis, with parallel sides 2 and $6 - x$ and width $x - 4$, so
$$\begin{aligned} A(x) &= 4 - \tfrac12\,\big(2 + (6 - x)\big)(x - 4) \\ &= \tfrac12 x^2 - 6x + 20. \end{aligned}$$
By the rules of Module 4, $A'(x) = x - 6$, which is $f(x)$ on that piece; at $x = 5$, $A'(5) = -1 = f(5)$, the slope of the dashed tangent in Figure 10.2. Each time, the slope of $A$ at $x$ is the height of $f$ at $x$. Section 10.4 proves that this always happens when $f$ is continuous.

```check
fpw = Piecewise((2, t <= 2), (6 - 2*t, t <= 4), (t - 6, True))
Apw = lambda X: integrate(fpw, (t, 0, X))
same([Apw(k_) for k_ in range(7)], [0, 2, 4, 5, 4, Rational(5, 2), 2])
same(Rational(1, 2)*1*2, 1); same(-Rational(2 + 1, 2)*1, -Rational(3, 2)); same(Apw(6) - Apw(5), -Rational(1, 2))
same([fpw.subs(t, v_) for v_ in (2, 3, 4, 5, 6)], [2, 0, -2, -1, 0])
xx = symbols('xx')
same(Apw(xx).subs(xx, Rational(3, 2)), 3); same(2*xx, integrate(2, (t, 0, xx)))
steps(4 - Rational(1, 2)*(2 + (6 - xx))*(xx - 4), xx**2/2 - 6*xx + 20); same(4 + integrate(t - 6, (t, 4, xx)), xx**2/2 - 6*xx + 20)
same(diff(xx**2/2 - 6*xx + 20, xx), xx - 6); same((xx - 6).subs(xx, 5), -1)
```
:::

Here is a second example, with numbers instead of shapes. Let $f(t) = \cos t$ and $A(x) = \int_0^x \cos t\,dt$. No triangles help now. The values of $A$ in the table were computed numerically, as Riemann sums with very many rectangles would give them, and so were the forward differences of $A$ with step 0.001, the slopes of short secants of its graph:

```valuetable
x = 0.5, 1, 1.5, 2, 3
$A(x)$ = Integral(cos(t), (t, 0, x))
$\dfrac{A(x + 0.001) - A(x)}{0.001}$ = (Integral(cos(t), (t, 0, x + 1/1000)) - Integral(cos(t), (t, 0, x)))*1000
$\cos x$ = cos(x)
digits = 6
---
x | A(x) | \dfrac{A(x + 0.001) - A(x)}{0.001} | \cos x
0.5 | 0.479426 | 0.877343 | 0.877583
1 | 0.841471 | 0.539881 | 0.540302
1.5 | 0.997495 | 0.0702384 | 0.0707372
2 | 0.909297 | -0.416601 | -0.416147
3 | 0.141120 | -0.990063 | -0.989992
```

The slopes of $A$ agree with $\cos x$ to about three decimal places, as forward differences with step 0.001 do (Module 4). And $A$ rises while $\cos x > 0$, up to $x = \pi/2 \approx 1.571$, and falls after it. You may also recognise the values of $A$: $\sin 1 \approx 0.841471$ and $\sin 2 \approx 0.909297$. Both observations are the Fundamental Theorem at work.

```check
for v_ in (Rational(1, 2), 1, Rational(3, 2), 2, 3):
    near(integrate(cos(t), (t, 0, v_)), sin(v_), 1e-25)
    q_ = (sin(v_ + Rational(1, 1000)) - sin(v_))*1000
    holds(Abs(q_ - cos(v_)) < Rational(6, 10000))
rounds(pi/2, '1.571'); rounds(sin(1), '0.841471'); rounds(sin(2), '0.909297')
```

The demonstration below draws both graphs for any function you choose.

::: widget name=accumulation
Start with $f(x) = \sin x$ and $a = 0$, and move $x$ with its slider, with the arrow keys, or by clicking either graph. The top graph shades the area from $a$ to $x$, blue where it counts as positive and orange where it counts as negative; the bottom graph is $A(x)$, computed numerically. Compare the purple height $f(x)$ above with the purple tangent below: wherever you go, the readout shows that the slope of $A$ at $x$ equals $f(x)$, and where $f$ changes sign, $A$ has a peak or a valley. Then move $a$: the graph of $A$ moves up or down, it always passes through $(a, 0)$, and its slopes do not change (Section 10.4 explains why). Finally type `sign(x)`, which jumps at 0, set $a = -2$ and move $x$ to 0: $A$ has a corner there.
:::

::: pitfall
$A(x)$ is an area, $f(x)$ a height: different numbers. In Example 10.4, $A(5) = 2.5$ while $f(5) = -1$. A function that is decreasing need not be negative: $A$ decreases on $[3, 6]$ but stays positive, because the area lost after $x = 3$ is less than the area gained before. The sign of $f$ tells you whether $A$ goes up or down, not whether $A$ is positive.
:::

## The Fundamental Theorem, Part 1 {#ftc1}

In both examples of Section 10.3, the slope of the area function at $x$ was the height of $f$ at $x$. Here is why, in a picture. Move the right end from $x$ to $x + h$, with $h > 0$ small. The area grows by the thin strip between $x$ and $x + h$ (Figure 10.3), so by the splitting property
$$A(x + h) - A(x) = \int_x^{x + h} f(t)\,dt.$$
The strip is nearly a rectangle of width $h$ and height $f(x)$, so $A(x + h) - A(x) \approx f(x)\,h$, and the difference quotient of $A$ is close to $f(x)$. The thinner the strip, the better the approximation: in the limit, $A'(x) = f(x)$. The Mean Value Theorem for integrals turns this "$\approx$" into an exact statement.

::: figure id=fig-10-3
The idea of the proof of Part 1. The value $A(x)$ of the area function is the area of the light region from $a$ to $x$. Moving the right end from $x$ to $x + h$ adds the dark strip, of area $A(x + h) - A(x)$. The Mean Value Theorem for integrals gives a point $c$ between $x$ and $x + h$ such that the rectangle of height $f(c)$ (dashed) has exactly the strip's area. As $h \to 0$, $c$ is squeezed towards $x$, and $f(c)$ approaches $f(x)$.
:::

::: theorem The Fundamental Theorem of Calculus, Part 1
Let $f$ be continuous on $[a, b]$, and let
$$A(x) = \int_a^x f(t)\,dt, \qquad a \le x \le b.$$
Then $A$ is continuous on $[a, b]$ and differentiable on $(a, b)$, with $A'(x) = f(x)$ for every $x$ in $(a, b)$, and at the endpoints its one-sided derivatives are $A'_+(a) = f(a)$ and $A'_-(b) = f(b)$. So $A$ is an antiderivative of $f$ on $[a, b]$. In Leibniz's notation,
$$\frac{d}{dx}\int_a^x f(t)\,dt = f(x).$$
:::

The last line reads "the derivative with respect to x of the integral from a to x of f of t, d t, is f of x".

::: proof
Let $x$ be in $[a, b]$, and let $h \ne 0$ with $x + h$ in $[a, b]$. By the splitting property,
$$\begin{aligned} &A(x + h) - A(x) \\ &\quad= \int_a^{x + h} f(t)\,dt - \int_a^x f(t)\,dt \\ &\quad= \int_x^{x + h} f(t)\,dt. \end{aligned}$$
If $h > 0$, $f$ is continuous on $[x, x + h]$, so the Mean Value Theorem for integrals gives a number $c_h$ in $[x, x + h]$ with $\int_x^{x + h} f(t)\,dt = f(c_h)\,h$. If $h < 0$, it gives $c_h$ in $[x + h, x]$ with $\int_{x + h}^x f(t)\,dt = f(c_h)\,(-h)$, and reversing the limits changes the sign, so again $\int_x^{x + h} f(t)\,dt = f(c_h)\,h$. Either way,
$$\frac{A(x + h) - A(x)}{h} = f(c_h),$$
where $c_h$ lies between $x$ and $x + h$.

*Continuity.* $f$ is continuous on the closed interval $[a, b]$, so by the Extreme Value Theorem (Module 3) $\abs{f}$ has a largest value $M$ there. Then $\abs{A(x + h) - A(x)} = \abs{f(c_h)}\,\abs{h} \le M\abs{h}$, which tends to 0 as $h \to 0$. So $A$ is continuous at $x$ (from one side when $x$ is $a$ or $b$).

*Derivative.* Now let $x$ be in $(a, b)$, so that $h$ may have either sign. Since $c_h$ lies between $x$ and $x + h$, $\abs{c_h - x} \le \abs{h}$. Let $\varepsilon > 0$. Because $f$ is continuous at $x$, there is a $\delta > 0$ such that $\abs{f(c) - f(x)} < \varepsilon$ whenever $c$ is in $[a, b]$ and $\abs{c - x} < \delta$. For $0 < \abs{h} < \delta$ (with $x + h$ in $[a, b]$, as throughout), then, $\abs{c_h - x} < \delta$, so
$$\begin{aligned} \left\lvert \frac{A(x + h) - A(x)}{h} - f(x)\right\rvert &= \abs{f(c_h) - f(x)} \\ &< \varepsilon. \end{aligned}$$
By the definition of a limit, the difference quotient of $A$ tends to $f(x)$ as $h \to 0$: $A'(x) = f(x)$. At $x = a$ and $x = b$, where $h$ can have only one sign, the same argument shows that the one-sided derivatives of $A$ are $f(a)$ and $f(b)$.
:::

```check
fF = Function('f')
same(integrate(cos(t), (t, a, x + h)) - integrate(cos(t), (t, a, x)), integrate(cos(t), (t, x, x + h)))   # splitting, an instance
same(diff(Integral(fF(t), (t, a, x)), x), fF(x))
same(diff(integrate(cos(t)*exp(t), (t, 0, x)), x), cos(x)*exp(x))     # an instance
```

Every hypothesis was used. Continuity on $[a, b]$ gave the Mean Value Theorem for integrals and the bound $M$; continuity at $x$ made $f(c_h)$ approach $f(x)$. Without continuity the conclusion can fail. Let $f(t) = 0$ for $t < 0$ and $f(t) = 1$ for $t \ge 0$, a step that is integrable (its integrals are areas of rectangles) but not continuous at 0. Then $A(x) = \int_0^x f(t)\,dt$ is 0 for $x \le 0$ and $x$ for $x \ge 0$: its graph has a corner at 0, like the graph of $\abs{x}$ in [Section 4.4](module_04_EN.html#failures), and $A'(0)$ does not exist. In the demonstration of Section 10.3, `sign(x)` shows such a corner.

```check
step_ = Piecewise((0, t < 0), (1, True))
xq = symbols('x_q', positive=True); xn = symbols('x_n', negative=True)
same(integrate(step_, (t, 0, xq)), xq); same(integrate(step_, (t, 0, xn)), 0)
hq = symbols('h', positive=True)
same(integrate(step_, (t, 0, hq))/hq, 1); same(integrate(step_, (t, 0, -hq))/(-hq), 0)   # right and left difference quotients at 0
```

The starting point $a$ can be anywhere, with $x$ on either side of it. If $f$ is continuous on an open interval $I$ and $a$ is a point of $I$, then $A(x) = \int_a^x f(t)\,dt$ has $A'(x) = f(x)$ at every $x$ in $I$, on either side of $a$. Indeed, choose $p$ and $q$ in $I$ with $p$ less than both $a$ and $x$ and $q$ greater than both; by the splitting property,
$$A(x) = \int_p^x f(t)\,dt - \int_p^a f(t)\,dt,$$
Part 1 on $[p, q]$ differentiates the first term, and the second is a constant. The same formula shows what changing $a$ does: it changes $A$ by a constant, $\int_p^a f(t)\,dt$. Area functions from different starting points are antiderivatives that differ by constants, as Theorem 10.1 says they must; in the demonstration, moving $a$ moves the graph of $A$ up or down.

::: keyidea
Part 1 says that differentiation undoes integration: integrate $f$ from a fixed point to $x$, differentiate with respect to $x$, and you get $f$ back. In particular, **every continuous function on an interval has an antiderivative** there: $\int_a^x f(t)\,dt$ is one.
:::

That includes functions for which no formula built from the functions of Module 1's catalogue gives an antiderivative. The function $e^{-x^2}$ is continuous, so $\int_0^x e^{-t^2}\,dt$ is an antiderivative of it, a perfectly good function with no simpler formula; it returns in Section 10.8 under a name of its own.

### Integrals with variable limits {#variable-limits}

Part 1 differentiates an integral whose upper limit is $x$ itself. When a limit is a function of $x$, the chain rule of [Module 5](module_05_EN.html#chain) joins in.

::: theorem Integrals with variable limits
Let $f$ be continuous on an open interval $I$, let $a$ be in $I$, and let $u$ and $v$ be differentiable functions whose values lie in $I$. Then
$$\begin{aligned} \frac{d}{dx}\int_a^{u(x)} f(t)\,dt &= f\big(u(x)\big)\,u'(x), \\ \frac{d}{dx}\int_x^a f(t)\,dt &= -f(x) \quad (x \text{ in } I), \end{aligned}$$
and
$$\begin{aligned} &\frac{d}{dx}\int_{v(x)}^{u(x)} f(t)\,dt \\ &\quad= f\big(u(x)\big)\,u'(x) - f\big(v(x)\big)\,v'(x). \end{aligned}$$
:::

::: proof
Let $A(y) = \int_a^y f(t)\,dt$ for $y$ in $I$; by Part 1 in the form for open intervals given above, $A'(y) = f(y)$. The first integral is $A\big(u(x)\big)$, and the chain rule gives its derivative $A'\big(u(x)\big)\,u'(x) = f\big(u(x)\big)\,u'(x)$. The second is $-A(x)$, with derivative $-f(x)$. By the splitting property the third is $A\big(u(x)\big) - A\big(v(x)\big)$, and the chain rule, used twice, gives the last formula.
:::

```check
uF, vF = Function('u'), Function('v')
same(diff(Integral(fF(t), (t, a, uF(x))), x), fF(uF(x))*diff(uF(x), x))
same(diff(Integral(fF(t), (t, x, a)), x), -fF(x))
same(diff(Integral(fF(t), (t, vF(x), uF(x))), x), fF(uF(x))*diff(uF(x), x) - fF(vF(x))*diff(vF(x), x))
```

::: example Derivatives of integrals
Find:

- (a) $\dfrac{d}{dx}\displaystyle\int_1^x \sqrt{1 + t^3}\,dt$, for $x > -1$
- (b) $\dfrac{d}{dx}\displaystyle\int_0^{x^2} e^{-t^2}\,dt$
- (c) $\dfrac{d}{dx}\displaystyle\int_x^{2x} \frac{1}{t}\,dt$, for $x > 0$

**(a)** $f(t) = \sqrt{1 + t^3}$ is continuous on the open interval $(-1, \infty)$, which contains 1, so Part 1 applies: the derivative is $\sqrt{1 + x^3}$. No antiderivative of $\sqrt{1 + t^3}$ is needed, which is fortunate: no formula built from the functions of Module 1's catalogue gives one.

**(b)** The upper limit is $u(x) = x^2$, with $u'(x) = 2x$. Put $u(x)$ into the integrand and multiply by $u'(x)$:
$$\frac{d}{dx}\int_0^{x^2} e^{-t^2}\,dt = e^{-(x^2)^2}\cdot 2x = 2x\,e^{-x^4}.$$

**(c)** $1/t$ is continuous on $(0, \infty)$, and for $x > 0$ both limits lie there. With $u(x) = 2x$ and $v(x) = x$,
$$\frac{d}{dx}\int_x^{2x} \frac{dt}{t} = \frac{1}{2x}\cdot 2 - \frac{1}{x}\cdot 1 = 0.$$
The derivative is 0 on the interval $(0, \infty)$, so by Module 8 the integral has the same value for every $x > 0$: the area under $y = 1/t$ from $x$ to $2x$ does not depend on $x$, because as the region gets wider it gets lower in exactly the right proportion. Example 10.6 finds the value, $\ln 2$.

```check
same(diff(Integral(sqrt(1 + t**3), (t, 1, x)), x), sqrt(1 + x**3))
steps(Derivative(Integral(exp(-t**2), (t, 0, x**2)), x), exp(-(x**2)**2)*2*x, 2*x*exp(-x**4))
steps(Derivative(Integral(1/t, (t, xp, 2*xp)), xp), 1/(2*xp)*2 - 1/xp*1, 0)
same(integrate(1/t, (t, xp, 2*xp)), log(2))
```
:::

::: pitfall
Three slips. **(1)** Forgetting the chain rule: $\dfrac{d}{dx}\displaystyle\int_0^{x^2} e^{-t^2}\,dt$ is $2x\,e^{-x^4}$, not $e^{-x^4}$ and not $e^{-x^2}$. **(2)** Substituting the wrong letter: $\dfrac{d}{dx}\displaystyle\int_a^x f(t)\,dt$ is $f(x)$, a function of $x$, not $f(t)$. **(3)** An integral with two constant limits is a number, so its derivative is 0: $\dfrac{d}{dx}\displaystyle\int_0^1 e^{-t^2}\,dt = 0$, not $e^{-x^2}$.

```check
same(diff(Integral(exp(-t**2), (t, 0, 1)), x), 0)
holds(Ne((2*x*exp(-x**4)).subs(x, 2), exp(-2**4))); holds(Ne((2*x*exp(-x**4)).subs(x, 2), exp(-2**2)))
```
:::

## The Fundamental Theorem, Part 2 {#ftc2}

Part 1 says that integrating produces an antiderivative. Part 2 turns this round: to compute an integral, find any antiderivative.

::: theorem The Fundamental Theorem of Calculus, Part 2
Let $f$ be continuous on $[a, b]$, and let $F$ be continuous on $[a, b]$ with $F'(x) = f(x)$ for every $x$ in $(a, b)$; for instance, $F$ can be any antiderivative of $f$ on an interval that contains $[a, b]$. Then
$$\int_a^b f(x)\,dx = F(b) - F(a).$$
:::

The difference $F(b) - F(a)$ is written $\big[F(x)\big]_a^b$, read "F of x evaluated from a to b". Some books write $F(x)\big|_a^b$.

::: proof
Let $A(x) = \int_a^x f(t)\,dt$ for $a \le x \le b$. By Part 1, $A$ is continuous on $[a, b]$ and $A'(x) = f(x) = F'(x)$ for every $x$ in $(a, b)$. Two functions with the same derivative on an open interval differ by a constant ([Theorem 8.6](module_08_EN.html#consequences)), so $F(x) - A(x) = C$ for some constant $C$ and every $x$ in $(a, b)$. Both $F$ and $A$ are continuous at $a$ and at $b$, so letting $x \to a^+$ and $x \to b^-$ shows that $F(a) - A(a) = C$ and $F(b) - A(b) = C$ too. Therefore
$$\begin{aligned} F(b) - F(a) &= \big(A(b) + C\big) - \big(A(a) + C\big) \\ &= A(b) - A(a) \\ &= \int_a^b f(t)\,dt - 0, \end{aligned}$$
since $A(a) = \int_a^a f(t)\,dt = 0$. The name of the variable of integration does not matter, so this is $\int_a^b f(x)\,dx$.
:::

So the constant of an antiderivative never matters in Part 2: $(F(b) + C) - (F(a) + C) = F(b) - F(a)$. Any antiderivative will do.

```check
Fg = Function('F')
same(integrate(diff(Fg(x), x), (x, a, b)), Fg(b) - Fg(a))
same((Fg(b) + c) - (Fg(a) + c), Fg(b) - Fg(a))
```

::: example Integrals in two lines
Evaluate (a) $\displaystyle\int_0^1 x^2\,dx$, (b) $\displaystyle\int_0^\pi \sin x\,dx$, (c) $\displaystyle\int_1^2 \frac{dx}{x}$ and (d) $\displaystyle\int_0^1 \frac{dx}{1 + x^2}$.

For each, take an antiderivative from the table of Section 10.1, valid on the whole interval of integration, and subtract.

**(a)** $\displaystyle\int_0^1 x^2\,dx = \Big[\frac{x^3}{3}\Big]_0^1 = \frac13 - 0 = \frac13.$

**(b)** $\displaystyle\int_0^\pi \sin x\,dx = \big[-\cos x\big]_0^\pi = -\cos\pi - (-\cos 0) = 1 + 1 = 2.$

**(c)** $\ln x$ is an antiderivative of $1/x$ on $(0, \infty)$, which contains $[1, 2]$: $\displaystyle\int_1^2 \frac{dx}{x} = \ln 2 - \ln 1 = \ln 2 \approx 0.6931.$

**(d)** $\displaystyle\int_0^1 \frac{dx}{1 + x^2} = \arctan 1 - \arctan 0 = \frac{\pi}{4} \approx 0.7854.$

So one arch of the sine curve encloses an area of exactly 2, and the area under $y = 1/(1 + x^2)$ from 0 to 1 is $\pi/4$: $\pi$ appears from a curve with no circle in sight. By Example 10.5(c), (c) is also the area under $1/t$ from $x$ to $2x$, for every $x > 0$.

```check
steps(Integral(x**2, (x, 0, 1)), Rational(1, 3) - 0, Rational(1, 3))
steps(Integral(sin(x), (x, 0, pi)), -cos(pi) - (-cos(0)), 1 + 1, 2)
steps(Integral(1/x, (x, 1, 2)), log(2) - log(1), log(2)); rounds(log(2), '0.6931')
steps(Integral(1/(1 + x**2), (x, 0, 1)), atan(1) - atan(0), pi/4); rounds(pi/4, '0.7854')
same(integrate(1/t, (t, xp, 2*xp)), integrate(1/x, (x, 1, 2)))
```
:::

::: pitfall
**(1)** Part 2 needs $f$ continuous on the whole interval $[a, b]$, with an antiderivative valid on all of it. The "calculation" $\displaystyle\int_{-1}^1 \frac{dx}{x^2} = \Big[-\frac1x\Big]_{-1}^1 = -1 - 1 = -2$ is wrong: a positive function cannot have a negative integral. The function $1/x^2$ is not continuous at 0, not even bounded near it, and $-1/x$ is not an antiderivative on any interval containing 0; Module 12 shows that this area is in fact infinite. **(2)** The same goes for $1/x$. Its antiderivative $\ln\abs{x}$ is valid on $(0, \infty)$ and on $(-\infty, 0)$, so $\int_1^2 \frac{dx}{x} = \ln 2$ and $\int_{-2}^{-1} \frac{dx}{x} = \ln 1 - \ln 2 = -\ln 2$; but $\big[\ln\abs{x}\big]_{-1}^{2} = \ln 2$ is not the value of $\int_{-1}^{2} \frac{dx}{x}$. That integral does not exist: $1/x$ is unbounded near 0. **(3)** Subtract the whole of $F(a)$, inside brackets: $\big[x^2 - 3x\big]_1^2 = (4 - 6) - (1 - 3) = 0$, not $(4 - 6) - 1 - 3 = -6$.

```check
same((-1/x).subs(x, 1) - (-1/x).subs(x, -1), -2); xnz = symbols('x', real=True, nonzero=True); holds(1/xnz**2 > 0)
same(integrate(1/x**2, (x, -1, 1)), oo)
same(integrate(1/x, (x, 1, 2)), log(2)); steps(Integral(1/x, (x, -2, -1)), log(Abs(-1)) - log(Abs(-2)), log(1) - log(2), -log(2))
same(log(Abs(2)) - log(Abs(-1)), log(2)); holds(integrate(1/x, (x, -1, 2)) is S.NaN); same(integrate(1/x, (x, 0, 2)), oo)
same((4 - 6) - (1 - 3), 0); same((x**2 - 3*x).subs(x, 2) - (x**2 - 3*x).subs(x, 1), 0); same((4 - 6) - 1 - 3, -6)
```
:::

### Why the theorem is remarkable {#remarkable}

Compare Example 10.6 with the methods of Module 9. There, an integral such as $\int_0^1 x^2\,dx$ is the limit of Riemann sums: with $n$ rectangles and right endpoints the sum is $\dfrac{(n + 1)(2n + 1)}{6n^2}$, found with Module 9's formula for $1^2 + 2^2 + \dots + n^2$, and its limit as $n \to \infty$ is $\tfrac13$. That needed a formula for a sum and then a limit, and it works only for the few functions whose sums have formulas. For $\sin x$ on $[0, \pi]$, the midpoint sums $M_n$ with $n$ rectangles, each of width $\pi/n$, creep towards 2:

```valuetable
n = 10, 100, 1000
$M_n$ = Sum(sin((i - 1/2)*pi/n)*pi/n, (i, 1, n))
digits = 9
---
n | M_n
10 | 2.00824841
100 | 2.00008225
1000 | 2.00000082
```

while Part 2 gives exactly 2 in one line. Archimedes, in the 3rd century BC, found areas with the method of exhaustion, an ancestor of Riemann sums, using an ingenious argument for each shape. The Fundamental Theorem replaces all of that with one question: what function has this derivative? It turns the area problem of Module 1 into the problem of undoing a derivative, and it is why integration is a practical tool rather than a theory of limits. It also keeps a promise made in [Section 1.1](module_01_EN.html#about).

```check
nn = symbols('n', positive=True, integer=True); ii = symbols('i', integer=True)
same(summation((ii/nn)**2/nn, (ii, 1, nn)), (nn + 1)*(2*nn + 1)/(6*nn**2)); limit_is((nn + 1)*(2*nn + 1)/(6*nn**2), nn, oo, Rational(1, 3))
MN = lambda N_: (pi/N_)/sin(pi/(2*N_))      # the midpoint sum in closed form
near(sum(sin((k_ - Rational(1, 2))*pi/10) for k_ in range(1, 11))*pi/10, MN(10), 1e-25)
rounds(MN(10), '2.00824841'); rounds(MN(100), '2.00008225'); rounds(MN(1000), '2.00000082'); holds(MN(1000) > 2)
```

::: keyidea
Module 1 compared a car's speedometer and odometer, and promised that the Fundamental Theorem of Calculus would show that each undoes the other. Here is the promise kept. Let $s(t)$ be the odometer reading at time $t$ and $v(t) = s'(t)$ the speedometer reading, a continuous function.

- **Part 2:** add up the speedometer readings over a stretch of time, and you get the change in the odometer reading: $\displaystyle\int_a^b v(t)\,dt = s(b) - s(a)$.
- **Part 1:** ask how fast the accumulated total grows, and you get the speedometer reading back: $\dfrac{d}{dt}\displaystyle\int_a^t v(u)\,du = v(t)$.

Integration and differentiation are inverse processes, and the tangent problem and the area problem of Module 1 are two sides of one problem.
:::

::: deeper Part 2 straight from Riemann sums
Part 2 can also be proved without Part 1, from the definition of the integral, and the proof shows it holds whenever $f$ is integrable, continuous or not. Let $F$ be continuous on $[a, b]$ with $F' = f$ on $(a, b)$, and take any partition $a = x_0 < x_1 < \dots < x_n = b$. The sum
$$\begin{aligned} &\big(F(x_1) - F(x_0)\big) \\ &\quad+ \big(F(x_2) - F(x_1)\big) \\ &\quad+ \dots + \big(F(x_n) - F(x_{n-1})\big) \end{aligned}$$
telescopes to $F(b) - F(a)$. By the Mean Value Theorem (Module 8), each bracket is $F'(c_i)\,\Delta x_i = f(c_i)\,\Delta x_i$ for some $c_i$ in $(x_{i-1}, x_i)$, where $\Delta x_i = x_i - x_{i-1}$. So for every partition there is a Riemann sum of $f$, with sample points $c_i$, whose value is exactly $F(b) - F(a)$. If $f$ is integrable, Riemann sums approach $\int_a^b f(x)\,dx$ as the subintervals shrink, so the integral equals $F(b) - F(a)$.

```check
F_t = Function('F')
same(sum(F_t(k_) - F_t(k_ - 1) for k_ in range(1, 6)), F_t(5) - F_t(0))      # the sum telescopes
```
:::

## Indefinite integrals and net change {#net-change}

### Indefinite integrals {#indefinite}

Part 2 makes antiderivatives the way to compute integrals, and that explains the notation used for them.

::: definition Indefinite integral
The **indefinite integral** of $f$, written $\int f(x)\,dx$, is its general antiderivative on an interval:
$$\int f(x)\,dx = F(x) + C$$
means that $F'(x) = f(x)$ for every $x$ in the interval.
:::

Read $\int f(x)\,dx$ as "the integral of f of x, d x". A definite integral $\int_a^b f(x)\,dx$ is a number; an indefinite integral $\int f(x)\,dx$ is a family of functions. Part 2 links them: $\int_a^b f(x)\,dx = \Big[\int f(x)\,dx\Big]_a^b$, using any member of the family. To **integrate** $f$ is to find either. In this notation the table of Section 10.1 reads
$$\begin{aligned} \int x^n\,dx &= \frac{x^{n+1}}{n + 1} + C \quad (n \ne -1), \\ \int \frac{dx}{x} &= \ln\abs{x} + C, \\ \int \cos x\,dx &= \sin x + C, \end{aligned}$$
and so on, with the conditions of the table, and the rules for sums and constant multiples read $\int \big(c f(x) + g(x)\big)\,dx = c\int f(x)\,dx + \int g(x)\,dx$. The $dx$ says which letter is the variable: $\int x t^2\,dx = \tfrac12 x^2 t^2 + C$, while $\int x t^2\,dt = \tfrac13 x t^3 + C$.

```check
antideriv(x**2*t**2/2, x*t**2, x); antideriv(x*t**3/3, x*t**2, t)
antideriv(sin(x), cos(x), x); antideriv(log(xp), 1/xp, xp)
```

::: pitfall
An indefinite integral is not a number, and a definite integral is not a family. $\int 2x\,dx = x^2 + C$, not $x^2$ alone, which is one antiderivative among many; and $\int_0^1 2x\,dx = 1$, a number, with no $C$ and no $x$ left in it.
:::

### The net change theorem {#net-change-theorem}

Part 2 has a second reading. A function $F$ with a continuous derivative is an antiderivative of its own derivative, so Part 2 with $f = F'$ gives:

::: theorem The net change theorem
If $F'$ is continuous on $[a, b]$, then
$$\int_a^b F'(x)\,dx = F(b) - F(a).$$
:::

In words: **the integral of a rate of change is the net change**. If $s(t)$ is a position, $\int_a^b v(t)\,dt = s(b) - s(a)$ is the **displacement**, the change in position. If $V(t)$ is the volume of water in a tank and water flows in at the rate $r(t) = V'(t)$, then $\int_a^b r(t)\,dt$ is the change in volume. If $E(t)$ is the energy used up to time $t$, its rate of change is the **power** $P(t) = E'(t)$, and $\int_a^b P(t)\,dt$ is the energy used between $a$ and $b$. The units multiply: litres per minute times minutes gives litres; watts, which are joules per second, times seconds gives joules.

::: example Displacement and distance
Module 4's [Example 4.10](module_04_EN.html#motion) followed a particle with velocity $v(t) = 3t^2 - 12t + 9$ metres per second. Without using its position function, find (a) its displacement and (b) the distance it travels, over $0 \le t \le 4$.

**(a)** By the net change theorem, the displacement is
$$\begin{aligned} &\int_0^4 (3t^2 - 12t + 9)\,dt \\ &\quad= \big[t^3 - 6t^2 + 9t\big]_0^4 \\ &\quad= 64 - 96 + 36 = 4 \text{ m}. \end{aligned}$$

**(b)** Distance counts every metre covered, forwards or backwards, so it is the integral of the speed $\abs{v(t)}$. Factor: $v(t) = 3(t - 1)(t - 3)$, which is positive for $0 \le t < 1$, negative for $1 < t < 3$ and positive for $3 < t \le 4$. On each piece $\abs{v}$ is $v$ or $-v$, so integrate piece by piece, with $F(t) = t^3 - 6t^2 + 9t$:
$$\begin{aligned} \int_0^1 v\,dt &= F(1) - F(0) = 4, \\ \int_1^3 v\,dt &= F(3) - F(1) = 0 - 4 = -4, \\ \int_3^4 v\,dt &= F(4) - F(3) = 4 - 0 = 4. \end{aligned}$$
The distance is $4 + 4 + 4 = 12$ m: the particle goes 4 m forwards, 4 m back and 4 m forwards again, ending 4 m from where it started, as Module 4 found from $s(t)$. Figure 10.4 shows the two integrals as areas.

```check
v7 = 3*t**2 - 12*t + 9; F7 = t**3 - 6*t**2 + 9*t
antideriv(F7, v7, t)
steps(Integral(v7, (t, 0, 4)), F7.subs(t, 4) - F7.subs(t, 0), 64 - 96 + 36, 4)
same(factor(v7), 3*(t - 1)*(t - 3))
holds(v7.subs(t, Rational(1, 2)) > 0); holds(v7.subs(t, 2) < 0); holds(v7.subs(t, Rational(7, 2)) > 0)
same(F7.subs(t, 1) - F7.subs(t, 0), 4); same(F7.subs(t, 3) - F7.subs(t, 1), -4); same(F7.subs(t, 4) - F7.subs(t, 3), 4)
tr = symbols('t', real=True)
same(integrate(Piecewise((3*tr**2 - 12*tr + 9, tr <= 1), (-(3*tr**2 - 12*tr + 9), tr <= 3), (3*tr**2 - 12*tr + 9, True)), (tr, 0, 4)), 12)
```
:::

::: figure id=fig-10-4
Displacement and distance for the particle of Example 10.7. Left: the velocity $v(t) = 3t^2 - 12t + 9$; the signed areas $4$, $-4$ and $4$ add up to the displacement, 4 m. Right: the speed $\abs{v(t)}$; its areas, all positive, add up to the distance travelled, 12 m.
:::

::: example Water in a tank
Suppose a tank holds 500 litres at time $t = 0$, and water flows in at $r(t) = 40 - 4t$ litres per minute for $0 \le t \le 15$, where a negative rate means water flowing out. How much water is in the tank after 15 minutes? When is it fullest, and how full is it then?

The change in volume over the 15 minutes is
$$\begin{aligned} \int_0^{15} (40 - 4t)\,dt &= \big[40t - 2t^2\big]_0^{15} \\ &= 600 - 450 = 150 \text{ litres}, \end{aligned}$$
so the tank holds $500 + 150 = 650$ litres at $t = 15$. The volume increases while $r(t) > 0$ and decreases while $r(t) < 0$; $r(t) = 0$ at $t = 10$, so the tank is fullest at $t = 10$ minutes, with $500 + \big[40t - 2t^2\big]_0^{10} = 500 + 400 - 200 = 700$ litres. From $t = 10$ to $t = 15$ it loses 50 litres.

```check
r8 = 40 - 4*t
antideriv(40*t - 2*t**2, r8, t)
steps(Integral(r8, (t, 0, 15)), (40*15 - 2*15**2) - 0, 600 - 450, 150); same(500 + 150, 650)
same(solve(r8, t), [10]); same(500 + integrate(r8, (t, 0, 10)), 700); same(500 + 400 - 200, 700); same(integrate(r8, (t, 10, 15)), -50)
```
:::

::: example Energy from power
Suppose a GPU's power draw during a one-minute task is $P(t) = 250 + 150\sin\dfrac{\pi t}{60}$ watts, for $0 \le t \le 60$ seconds. How much energy does it use, in joules and in kilowatt-hours (1 kWh is $3.6 \times 10^6$ J)? What is its average power over the minute?

The energy is the integral of the power. With $k = \pi/60$ in the table, an antiderivative of $\sin\dfrac{\pi t}{60}$ is $-\dfrac{60}{\pi}\cos\dfrac{\pi t}{60}$, so
$$\begin{aligned} E &= \int_0^{60} P(t)\,dt \\ &= \Big[250t - \frac{9000}{\pi}\cos\frac{\pi t}{60}\Big]_0^{60} \\ &= 15000 - \frac{9000}{\pi}(\cos\pi - \cos 0) \\ &= 15000 + \frac{18000}{\pi} \approx 20729.6 \text{ J}. \end{aligned}$$
That is about 20.7 kJ, or $20729.6/(3.6 \times 10^6) \approx 0.00576$ kWh. The average power is the average value of $P$ (Module 9), $E/60 \approx 345.5$ W, between the lowest draw, 250 W, and the highest, 400 W.

```check
P9 = 250 + 150*sin(pi*t/60); F9 = 250*t - 9000/pi*cos(pi*t/60)
same(150*60/pi, 9000/pi); antideriv(-60/pi*cos(pi*t/60), sin(pi*t/60), t); antideriv(F9, P9, t)
steps(Integral(P9, (t, 0, 60)), F9.subs(t, 60) - F9.subs(t, 0), 15000 - 9000/pi*(cos(pi) - cos(0)), 15000 + 18000/pi)
E9 = 15000 + 18000/pi
rounds(E9, '20729.6'); rounds(E9/1000, '20.7'); rounds(E9/(36*10**5), '0.00576'); rounds(E9/60, '345.5')
same(P9.subs(t, 0), 250); same(P9.subs(t, 30), 400); holds(250 < E9/60); holds(E9/60 < 400)
```
:::

::: pitfall
Displacement is not distance. $\int_a^b v(t)\,dt$ adds forward and backward motion with opposite signs, so it can be small, or 0, while the object travels far. For the distance, integrate the speed $\abs{v(t)}$: find where $v$ changes sign, split the interval there, and add the sizes of the pieces. And keep the units: the integral of a rate has the units of the rate times the units of time.
:::

## The substitution rule {#substitution}

The table of Section 10.1 handles sums of basic functions. It cannot handle $\int 2x\cos(x^2)\,dx$: the integrand is a product, and not of anything in the table. But you have seen it before, as a derivative. By the chain rule,
$$\frac{d}{dx}\sin(x^2) = \cos(x^2)\cdot 2x,$$
so $\int 2x\cos(x^2)\,dx = \sin(x^2) + C$. The integrand has the shape $f\big(g(x)\big)\,g'(x)$: an outer function $f$ evaluated at an inner function $g(x)$, times the derivative of the inner function. Whenever $F' = f$, the chain rule says that such an integrand is the derivative of $F\big(g(x)\big)$.

```check
same(diff(sin(x**2), x), cos(x**2)*2*x); antideriv(sin(x**2), 2*x*cos(x**2), x)
```

Leibniz's notation makes the pattern mechanical. Name the inner function $u = g(x)$. Its differential, defined in [Section 7.2](module_07_EN.html#differentials), is $du = g'(x)\,dx$. Replace $g(x)$ by $u$ and $g'(x)\,dx$ by $du$:
$$\begin{aligned} \int \cos(x^2)\cdot 2x\,dx &= \int \cos u\,du \\ &= \sin u + C = \sin(x^2) + C. \end{aligned}$$

::: theorem The substitution rule
Let $g$ be differentiable on an interval $I$, and let $F$ be an antiderivative of $f$ on an open interval that contains every value of $g$. Then
$$\int f\big(g(x)\big)\,g'(x)\,dx = F\big(g(x)\big) + C$$
on $I$. With $u = g(x)$ and $du = g'(x)\,dx$, this says $\int f\big(g(x)\big)\,g'(x)\,dx = \int f(u)\,du$, with $u = g(x)$ put back at the end.
:::

::: proof
By the chain rule, $\dfrac{d}{dx}F\big(g(x)\big) = F'\big(g(x)\big)\,g'(x) = f\big(g(x)\big)\,g'(x)$ for every $x$ in $I$. So $F\big(g(x)\big)$ is an antiderivative of $f\big(g(x)\big)\,g'(x)$ on $I$, and Theorem 10.1 gives all the others.
:::

```check
gF = Function('g')
same(diff(Fg(gF(x)), x), Subs(Derivative(Fg(u), u), u, gF(x))*Derivative(gF(x), x))
```

::: keyidea
To integrate by substitution:

1. **Choose** $u = g(x)$, an inner function whose derivative appears as a factor of the integrand, perhaps up to a constant factor.
2. **Compute** $du = g'(x)\,dx$, and solve for the part of the integrand it replaces (for example $x\,dx = \tfrac12\,du$).
3. **Rewrite** the whole integral in terms of $u$; no $x$ may remain, not even in $dx$.
4. **Integrate** in $u$, then put $u = g(x)$ back.
5. **Check** by differentiating.
:::

::: example Four substitutions
Find:

- (a) $\displaystyle\int 2x(x^2 + 1)^3\,dx$
- (b) $\displaystyle\int x^2\sqrt{x^3 + 1}\,dx$, for $x > -1$
- (c) $\displaystyle\int \frac{e^x}{1 + e^x}\,dx$
- (d) $\displaystyle\int \frac{\ln x}{x}\,dx$, for $x > 0$

**(a)** Let $u = x^2 + 1$; then $du = 2x\,dx$, exactly the remaining factor:
$$\int u^3\,du = \frac{u^4}{4} + C = \frac{(x^2 + 1)^4}{4} + C.$$

**(b)** Let $u = x^3 + 1$, so $du = 3x^2\,dx$ and $x^2\,dx = \tfrac13\,du$. For $x > -1$, $u > 0$, and
$$\begin{aligned} \int \sqrt u\cdot\tfrac13\,du &= \frac13\cdot\frac23 u^{3/2} + C \\ &= \frac29 (x^3 + 1)^{3/2} + C. \end{aligned}$$
Check: $\dfrac{d}{dx}\,\dfrac29(x^3 + 1)^{3/2} = \dfrac29\cdot\dfrac32(x^3 + 1)^{1/2}\cdot 3x^2 = x^2\sqrt{x^3 + 1}$.

**(c)** Let $u = 1 + e^x$, so $du = e^x\,dx$:
$$\int \frac{du}{u} = \ln\abs{u} + C = \ln(1 + e^x) + C,$$
without absolute value bars, since $1 + e^x > 0$.

**(d)** Let $u = \ln x$, so $du = \dfrac{dx}{x}$:
$$\int u\,du = \frac{u^2}{2} + C = \frac{(\ln x)^2}{2} + C.$$

```check
same(diff(x**2 + 1, x), 2*x); antideriv(u**4/4, u**3, u); antideriv((x**2 + 1)**4/4, 2*x*(x**2 + 1)**3, x)
same(diff(x**3 + 1, x), 3*x**2); antideriv(Rational(1, 3)*Rational(2, 3)*u**Rational(3, 2), sqrt(u)/3, u)
steps(Derivative(Rational(2, 9)*(x**3 + 1)**Rational(3, 2), x), Rational(2, 9)*Rational(3, 2)*(x**3 + 1)**Rational(1, 2)*3*x**2, x**2*sqrt(x**3 + 1))
same(diff(1 + exp(x), x), exp(x)); antideriv(log(u), 1/u, u); antideriv(log(1 + exp(x)), exp(x)/(1 + exp(x)), x)
same(diff(log(xp), xp), 1/xp); antideriv(u**2/2, u, u); antideriv(log(xp)**2/2, log(xp)/xp, xp)
```
:::

The next three need a second look: in the first the derivative of the inner function hides in a quotient, in the second a constant has to be arranged, and in the third some $x$ is left over.

::: example Substitutions that need a second look
Find:

- (a) $\displaystyle\int \tan x\,dx$
- (b) $\displaystyle\int \frac{dx}{a^2 + x^2}$, where $a \ne 0$ is a constant
- (c) $\displaystyle\int x\sqrt{x - 1}\,dx$, for $x > 1$

**(a)** Write $\tan x = \dfrac{\sin x}{\cos x}$ and let $u = \cos x$, so $du = -\sin x\,dx$:
$$\begin{aligned} \int \frac{\sin x}{\cos x}\,dx &= -\int \frac{du}{u} = -\ln\abs{u} + C \\ &= -\ln\abs{\cos x} + C, \end{aligned}$$
on each interval where $\cos x \ne 0$. Since $-\ln\abs{\cos x} = \ln\dfrac{1}{\abs{\cos x}}$, the answer is also written $\ln\abs{\sec x} + C$.

**(b)** Take $a^2$ out of the denominator, $a^2 + x^2 = a^2\big(1 + (x/a)^2\big)$, and let $u = x/a$, so $du = dx/a$ and $dx = a\,du$:
$$\begin{aligned} \int \frac{dx}{a^2 + x^2} &= \int \frac{a\,du}{a^2(1 + u^2)} \\ &= \frac1a \arctan u + C \\ &= \frac1a\arctan\frac{x}{a} + C. \end{aligned}$$
In the same way, for a constant $a > 0$, $\displaystyle\int \frac{dx}{\sqrt{a^2 - x^2}} = \arcsin\frac{x}{a} + C$ for $-a < x < a$; Exercise 10.6 does the case $a = 3$.

**(c)** Let $u = x - 1$, so $du = dx$. The factor $x$ is left over, but it can be written in terms of $u$: $x = u + 1$. Then
$$\begin{aligned} \int (u + 1)\sqrt u\,du &= \int \big(u^{3/2} + u^{1/2}\big)\,du \\ &= \frac25 u^{5/2} + \frac23 u^{3/2} + C \\ &= \frac25 (x - 1)^{5/2} \\ &\qquad + \frac23 (x - 1)^{3/2} + C. \end{aligned}$$

```check
same(diff(cos(x), x), -sin(x)); antideriv(-log(u), -1/u, u)
antideriv(-log(cos(x)), tan(x), x); antideriv(-log(-cos(x)), tan(x), x)      # where cos x > 0, and where cos x < 0
yq = symbols('y', positive=True); same(-log(yq), log(1/yq))       # with y = |cos x| > 0
xr = symbols('x', real=True); same(1/Abs(cos(xr)), Abs(sec(xr)))
anz = symbols('a', real=True, nonzero=True)
same(anz**2*(1 + (x/anz)**2), anz**2 + x**2); same(anz/(anz**2*(1 + u**2)), (1/anz)/(1 + u**2))
antideriv(atan(u)/anz, (1/anz)/(1 + u**2), u); antideriv(atan(x/anz)/anz, 1/(anz**2 + x**2), x)
antideriv(asin(x/ap), 1/sqrt(ap**2 - x**2), x)
up = symbols('u', positive=True)
same(expand((up + 1)*sqrt(up)), up**Rational(3, 2) + up**Rational(1, 2))
antideriv(Rational(2, 5)*up**Rational(5, 2) + Rational(2, 3)*up**Rational(3, 2), up**Rational(3, 2) + up**Rational(1, 2), up)
antideriv(Rational(2, 5)*(x - 1)**Rational(5, 2) + Rational(2, 3)*(x - 1)**Rational(3, 2), x*sqrt(x - 1), x)
```
:::

::: pitfall
Three slips with substitution. **(1)** Forgetting $du$: replacing $\cos(x^2)\cdot 2x\,dx$ by "$\cos u\,dx$" leaves a $dx$ in an integral in $u$, which is meaningless; the $2x\,dx$ becomes $du$. **(2)** Treating a leftover variable as a constant. With $u = x^2$, $\int \cos(x^2)\,dx$ has no factor $x$ to go with $dx$, and dividing by $2x$ inside the integral, as if it were a constant, gives the wrong answer $\dfrac{\sin(x^2)}{2x}$. Constant factors can be moved through an integral sign; variables cannot. (In fact no formula built from the functions of Module 1's catalogue has derivative $\cos(x^2)$.) **(3)** Leaving the answer in $u$, or forgetting to check it.

```check
holds(Ne(cos(1) - sin(1)/2, cos(1)))          # so the derivative of sin(x^2)/(2x) is not cos(x^2)
same(diff(sin(x**2)/(2*x), x).subs(x, 1), cos(1) - sin(1)/2)
```
:::

### Definite integrals {#definite-substitution}

For a definite integral there are two ways to use a substitution. One is to find an antiderivative in $x$, as above, and apply Part 2 with the original limits. The other is to change the limits along with the variable, and never return to $x$. Figure 10.5 shows what the second way does: it changes the region but not its area.

::: theorem Substitution in definite integrals
Let $g'$ be continuous on $[a, b]$, and let $f$ be continuous on an interval $J$ that contains $g(x)$ for every $x$ in $[a, b]$. Then
$$\int_a^b f\big(g(x)\big)\,g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du.$$
:::

::: proof
If $J$ contains an endpoint, extend $f$ past it with the value it has there; the extended function is continuous on an open interval that contains $J$ and agrees with $f$ on $J$, so neither side of the formula changes. So suppose $J$ is open. By Part 1, $f$ has an antiderivative $F$ on $J$. By Theorem 10.6, $F\big(g(x)\big)$ is an antiderivative of $f\big(g(x)\big)\,g'(x)$, which is continuous on $[a, b]$; so Part 2 gives the left side as $F\big(g(b)\big) - F\big(g(a)\big)$. Part 2 on the interval between $g(a)$ and $g(b)$, which lies in $J$, gives the right side as $F\big(g(b)\big) - F\big(g(a)\big)$ too. (When $g(b) < g(a)$ this uses the convention $\int_p^q = -\int_q^p$, and when $g(a) = g(b)$ both sides are 0.)
:::

::: example Changing the limits
Evaluate (a) $\displaystyle\int_0^{\sqrt\pi} 2x\sin(x^2)\,dx$, (b) $\displaystyle\int_0^1 \frac{x}{1 + x^2}\,dx$ and (c) $\displaystyle\int_0^{\pi/2} \sin x\cos^2 x\,dx$.

**(a)** Let $u = x^2$, so $du = 2x\,dx$. When $x = 0$, $u = 0$; when $x = \sqrt\pi$, $u = \pi$. So
$$\begin{aligned} \int_0^{\sqrt\pi} 2x\sin(x^2)\,dx &= \int_0^\pi \sin u\,du \\ &= \big[-\cos u\big]_0^\pi = 2, \end{aligned}$$
the area of one arch of the sine curve (Example 10.6(b)).

**(b)** Let $u = 1 + x^2$, so $du = 2x\,dx$ and $x\,dx = \tfrac12\,du$; $x = 0$ gives $u = 1$ and $x = 1$ gives $u = 2$:
$$\begin{aligned} \int_0^1 \frac{x\,dx}{1 + x^2} &= \frac12\int_1^2 \frac{du}{u} = \frac12\big[\ln u\big]_1^2 \\ &= \frac{\ln 2}{2} \approx 0.3466. \end{aligned}$$
The other way: an antiderivative in $x$ is $\tfrac12\ln(1 + x^2)$, and $\big[\tfrac12\ln(1 + x^2)\big]_0^1 = \tfrac12\ln 2 - \tfrac12\ln 1$, the same.

**(c)** Let $u = \cos x$, so $du = -\sin x\,dx$; $x = 0$ gives $u = 1$ and $x = \pi/2$ gives $u = 0$:
$$\begin{aligned} \int_0^{\pi/2} \cos^2 x\,\sin x\,dx &= \int_1^0 u^2\,(-du) \\ &= \int_0^1 u^2\,du = \frac13. \end{aligned}$$
The new limits came out in reverse order, and the minus sign from $du$ turned them round. Keep the limits where the substitution puts them: the value of $u$ at the lower $x$-limit goes at the bottom of the integral sign, even when it is the larger number.

```check
steps(Integral(2*x*sin(x**2), (x, 0, sqrt(pi))), Integral(sin(u), (u, 0, pi)), -cos(pi) - (-cos(0)), 2)
steps(Integral(x/(1 + x**2), (x, 0, 1)), Rational(1, 2)*Integral(1/u, (u, 1, 2)), Rational(1, 2)*(log(2) - log(1)), log(2)/2); rounds(log(2)/2, '0.3466')
antideriv(log(1 + x**2)/2, x/(1 + x**2), x); same((log(1 + x**2)/2).subs(x, 1) - (log(1 + x**2)/2).subs(x, 0), log(2)/2)
same(cos(0), 1); same(cos(pi/2), 0)
steps(Integral(sin(x)*cos(x)**2, (x, 0, pi/2)), Integral(-u**2, (u, 1, 0)), Integral(u**2, (u, 0, 1)), Rational(1, 3))
```
:::

::: figure id=fig-10-5
Substitution changes the region but not its area. Left: the region under $y = 2x\sin(x^2)$ from $x = 0$ to $\sqrt\pi$, tall and narrow. Right: the region under $y = \sin u$ from $u = 0$ to $\pi$, low and wide. With $u = x^2$, Theorem 10.7 says that the two areas are equal, and Example 10.12(a) finds both to be 2. The two panels have the same scales.
:::

::: pitfall
The most common slip with definite integrals: changing the variable but not the limits. With $u = x^2 + 1$,
$$\begin{aligned} \int_0^2 x(x^2 + 1)^2\,dx &= \frac12\int_1^5 u^2\,du \\ &= \frac12\cdot\frac{125 - 1}{3} = \frac{62}{3}. \end{aligned}$$
Keeping the old limits gives $\tfrac12\int_0^2 u^2\,du = \tfrac43$, which is wrong; so is using the $u$-antiderivative $\tfrac16 u^3$ with the $x$-limits 0 and 2. And dropping the factor $\tfrac12$ gives $\tfrac{124}{3}$. Either change the limits, or return to $x$ before using the old ones.

```check
same(integrate(x*(x**2 + 1)**2, (x, 0, 2)), Rational(62, 3)); same(Rational(1, 2)*integrate(u**2, (u, 1, 5)), Rational(62, 3)); same(Rational(1, 2)*(125 - 1)/3, Rational(62, 3))
same(Rational(1, 2)*integrate(u**2, (u, 0, 2)), Rational(4, 3)); same((u**3/6).subs(u, 2) - (u**3/6).subs(u, 0), Rational(4, 3)); same(integrate(u**2, (u, 1, 5)), Rational(124, 3))
```
:::

### Odd and even functions {#symmetry}

Module 9 used symmetry to find integrals over intervals $[-a, a]$: for an even function the area to the left of the $y$-axis is the mirror image of the area to its right, and for an odd function the two cancel. It proved this with Riemann sums ([Section 9.6](module_09_EN.html#symmetry)); for continuous functions, substitution gives a two-line proof.

::: theorem Integrals of even and odd functions
Let $f$ be continuous on $[-a, a]$, where $a > 0$.

- If $f$ is even, $\displaystyle\int_{-a}^a f(x)\,dx = 2\int_0^a f(x)\,dx$.
- If $f$ is odd, $\displaystyle\int_{-a}^a f(x)\,dx = 0$.
:::

::: proof
Split at 0: $\int_{-a}^a f(x)\,dx = \int_{-a}^0 f(x)\,dx + \int_0^a f(x)\,dx$. In the first integral substitute $u = -x$, so $du = -dx$; $x = -a$ gives $u = a$ and $x = 0$ gives $u = 0$. By Theorem 10.7,
$$\begin{aligned} \int_{-a}^0 f(x)\,dx &= \int_a^0 f(-u)\,(-du) \\ &= \int_0^a f(-u)\,du. \end{aligned}$$
If $f$ is even, $f(-u) = f(u)$, so this is $\int_0^a f(u)\,du$, and the total is $2\int_0^a f(x)\,dx$. If $f$ is odd, $f(-u) = -f(u)$, so it is $-\int_0^a f(u)\,du$, and the total is 0.
:::

```check
fe_, fo_ = cos(x) + x**2, x**2*sin(x)
same(integrate(fe_, (x, -a, a)), 2*integrate(fe_, (x, 0, a))); same(integrate(fo_, (x, -a, a)), 0)
same(integrate(fe_.subs(x, -u)*(-1), (u, a, 0)), integrate(fe_.subs(x, -u), (u, 0, a)))
```

::: example Symmetry saves work
Evaluate (a) $\displaystyle\int_{-1}^1 (x^6 + 4x^3 - x + 1)\,dx$, (b) $\displaystyle\int_{-\pi/2}^{\pi/2} (x^3 + 1)\cos x\,dx$ and (c) $\displaystyle\int_{-1}^1 \frac{\tan x}{1 + x^2}\,dx$.

**(a)** $x^6 + 1$ is even and $4x^3 - x$ is odd, so
$$\begin{aligned} &\int_{-1}^1 (x^6 + 4x^3 - x + 1)\,dx \\ &\quad= 2\int_0^1 (x^6 + 1)\,dx + 0 \\ &\quad= 2\Big(\frac17 + 1\Big) = \frac{16}{7}. \end{aligned}$$

**(b)** $x^3\cos x$ is odd (an odd function times an even one) and $\cos x$ is even, so the integral is $0 + 2\int_0^{\pi/2}\cos x\,dx = 2\big[\sin x\big]_0^{\pi/2} = 2$.

**(c)** $\tan x$ is odd and $1 + x^2$ even, so their quotient is odd; it is continuous on $[-1, 1]$, where $\cos x \ne 0$. The integral is 0, and no antiderivative was needed.

```check
same((x**6 + 1).subs(x, -x), x**6 + 1); same((4*x**3 - x).subs(x, -x), -(4*x**3 - x))
steps(Integral(x**6 + 4*x**3 - x + 1, (x, -1, 1)), 2*Integral(x**6 + 1, (x, 0, 1)) + 0, 2*(Rational(1, 7) + 1), Rational(16, 7))
same((x**3*cos(x)).subs(x, -x), -x**3*cos(x)); steps(Integral((x**3 + 1)*cos(x), (x, -pi/2, pi/2)), 2*Integral(cos(x), (x, 0, pi/2)), 2)
same((tan(x)/(1 + x**2)).subs(x, -x), -tan(x)/(1 + x**2)); holds(cos(1) > 0)
near(Integral(tan(x)/(1 + x**2), (x, -1, 1)).evalf(30), 0, 1e-20)
```
:::

::: pitfall
Both shortcuts need a symmetric interval and an integrable function. $\int_{-1}^2 x^3\,dx$ is not 0: the interval is not symmetric, and the integral is $\tfrac{16}{4} - \tfrac14 = \tfrac{15}{4}$. And $\int_{-1}^1 \frac{dx}{x}$ is not 0 "by symmetry": $1/x$ is odd but not defined at 0, and it is unbounded near it, so the integral does not exist in the sense of Module 9.

```check
same(integrate(x**3, (x, -1, 2)), Rational(15, 4)); same(Rational(16, 4) - Rational(1, 4), Rational(15, 4))
```
:::

## Integration with SymPy {#sympy}

SymPy integrates with `sp.integrate`. With a variable as its second argument it returns an antiderivative; with a tuple `(x, a, b)` it returns the definite integral from `a` to `b`.

::: compute Integrals with SymPy
```python
import sympy as sp
x, t = sp.symbols('x t')
print(sp.integrate(x**2 - 1, x))                     # an antiderivative: no + C
print(sp.integrate(x**2, (x, 0, 1)))                 # a definite integral, exactly
print(sp.integrate(1/(1 + x**2), (x, 0, 1)))         # Example 10.6(d)
print(sp.integrate(2*x*sp.sin(x**2), (x, 0, sp.sqrt(sp.pi))))   # Example 10.12(a)
```

```output
x**3/3 - x
1/3
pi/4
2
```

SymPy leaves out the $+\,C$, and gives exact answers: `pi/4`, not 0.785. To check an antiderivative of your own, differentiate it and simplify the difference from the integrand; 0 means it is right:

```python
F = sp.Rational(2, 9)*(x**3 + 1)**sp.Rational(3, 2)   # Example 10.10(b)
print(sp.simplify(sp.diff(F, x) - x**2*sp.sqrt(x**3 + 1)))
```

```output
0
```

`sp.Integral` writes an integral down without evaluating it, and `.doit()` evaluates it. `sp.diff` applies Part 1 and the chain rule to integrals with variable limits, without finding any antiderivative:

```python
I = sp.Integral(sp.exp(-t**2), (t, 0, x**2))
print(sp.diff(I, x))                                 # Example 10.5(b)
print(sp.diff(sp.Integral(1/t, (t, x, 2*x)), x))     # Example 10.5(c)
print(sp.Integral(x**2, (x, 0, 1)).doit())
```

```output
2*x*exp(-x**4)
0
1/3
```

The middle answer is 0 for every $x$, as Example 10.5(c) found. SymPy also knows the trap of Section 10.5:

```python
print(sp.integrate(1/x**2, (x, -1, 1)))
```

```output
oo
```

`oo` is SymPy's $\infty$: the area under $1/x^2$ from $-1$ to 1 is infinite, not $-2$.
:::

```check
same(integrate(x**2 - 1, x), x**3/3 - x); same(integrate(2*x*sin(x**2), (x, 0, sqrt(pi))), 2); rounds(pi/4, '0.785')
same(diff(Rational(2, 9)*(x**3 + 1)**Rational(3, 2), x) - x**2*sqrt(x**3 + 1), 0)
```

### Why SymPy's answer may look different {#different-answers}

Two correct antiderivatives of the same function can look quite different: by Theorem 10.1 they may differ by a constant, and like derivatives in [Section 5.7](module_05_EN.html#different-looks), they may be written in different but equal forms.

::: compute Answers that differ by a constant
```python
import sympy as sp
x = sp.symbols('x')
mine = (x**2 + 1)**4/4                               # Example 10.10(a), by substitution
theirs = sp.integrate(2*x*(x**2 + 1)**3, x)
print(theirs)
print(sp.expand(mine - theirs))
```

```output
x**8/4 + x**6 + 3*x**4/2 + x**2
1/4
```

SymPy expanded the integrand and integrated term by term, so its antiderivative has no constant term. Expanded, $\tfrac14(x^2 + 1)^4$ is the same polynomial plus $\tfrac14$: the two answers differ by the constant $\tfrac14$, and both are right. Another integral can be done by substitution in two ways:

```python
print(sp.integrate(sp.sin(x)*sp.cos(x), x))
print(sp.simplify(sp.sin(x)**2/2 - (-sp.cos(x)**2/2)))
```

```output
sin(x)**2/2
1/2
```

With $u = \sin x$, $\int \sin x\cos x\,dx = \tfrac12\sin^2 x + C$, which is SymPy's answer. With $u = \cos x$ and $du = -\sin x\,dx$, the same integral is $-\tfrac12\cos^2 x + C$. Both are right: since $\sin^2 x + \cos^2 x = 1$, they differ by $\tfrac12$. One more difference:

```python
print(sp.integrate(1/x, x))
print(sp.integrate(1/x, (x, -2, -1)))
```

```output
log(x)
-log(2)
```

SymPy writes $\ln x$, not $\ln\abs{x}$. That is an antiderivative of $1/x$ for $x > 0$; for negative $x$ SymPy's `log(x)` is not a real number, because SymPy works with complex numbers. For real work on $(-\infty, 0)$ use $\ln\abs{x}$. Definite integrals still come out right: $\big[\ln\abs{x}\big]_{-2}^{-1} = \ln 1 - \ln 2 = -\ln 2$.
:::

```check
same(integrate(2*x*(x**2 + 1)**3, x), x**8/4 + x**6 + 3*x**4/2 + x**2); same(expand((x**2 + 1)**4/4) - (x**8/4 + x**6 + 3*x**4/2 + x**2), Rational(1, 4))
same(integrate(sin(x)*cos(x), x), sin(x)**2/2); antideriv(-cos(x)**2/2, sin(x)*cos(x), x); same(sin(x)**2/2 + cos(x)**2/2, Rational(1, 2))
same(integrate(1/x, (x, -2, -1)), -log(2)); same(log(abs(-1)) - log(abs(-2)), -log(2))
```

::: pitfall
Do not check your antiderivative by subtracting SymPy's: two right answers may differ by a constant, as $\tfrac14(x^2 + 1)^4$ and SymPy's polynomial do, so the difference need not be 0. Differentiate your answer instead and compare it with the integrand, as in the first box: `sp.simplify(sp.diff(F, x) - f)` must give 0. A difference that comes out as a constant also means that both answers are right.

```check
same(simplify(diff((x**2 + 1)**4/4, x) - 2*x*(x**2 + 1)**3), 0); same(diff((x**2 + 1)**4/4 - (x**8/4 + x**6 + 3*x**4/2 + x**2), x), 0)
```
:::

### When no formula exists {#special-functions}

Ask SymPy for an antiderivative of $e^{-x^2}$, and it answers with a function you have not met:

::: compute Integrals with special functions
```python
import sympy as sp
x = sp.symbols('x')
print(sp.integrate(sp.exp(-x**2), x))
print(sp.diff(sp.erf(x), x))
I = sp.integrate(sp.exp(-x**2), (x, 0, 1))
print(I, sp.N(I))
```

```output
sqrt(pi)*erf(x)/2
2*exp(-x**2)/sqrt(pi)
sqrt(pi)*erf(1)/2 0.746824132812427
```

`erf` is the **error function**, defined as an area function:
$$\operatorname{erf} x = \frac{2}{\sqrt\pi}\int_0^x e^{-t^2}\,dt.$$
By Part 1 its derivative is $\dfrac{2}{\sqrt\pi}e^{-x^2}$, as the second line confirms, so $\dfrac{\sqrt\pi}{2}\operatorname{erf} x$ is an antiderivative of $e^{-x^2}$: SymPy's answer is Part 1 at work, with a name attached. Its values are computed numerically, as those of $\sin x$ and $\ln x$ are. A midpoint sum with a thousand rectangles agrees with SymPy's value in its first seven digits:

```python
import numpy as np
n = 1000
mids = (np.arange(n) + 0.5)/n                        # midpoints of [0, 1] cut into n pieces
print(np.sum(np.exp(-mids**2))/n)
```

```output
0.7468241634690489
```

The sine integral $\operatorname{Si} x = \int_0^x \frac{\sin t}{t}\,dt$ is another such function; at $t = 0$ its integrand is given the value 1, its limit there ([Module 2](module_02_EN.html#trig-limits)), so that it is continuous:

```python
print(sp.integrate(sp.sin(x)/x, x))
```

```output
Si(x)
```
:::

```check
same(integrate(exp(-x**2), x), sqrt(pi)*erf(x)/2); same(diff(erf(x), x), 2*exp(-x**2)/sqrt(pi))
same(diff(Integral(exp(-t**2), (t, 0, x))*2/sqrt(pi), x), 2*exp(-x**2)/sqrt(pi)); antideriv(sqrt(pi)*erf(x)/2, exp(-x**2), x)
rounds(sqrt(pi)*erf(1)/2, '0.746824'); rounds(sqrt(pi)*erf(1)/2, '0.746824132812427')
holds(Abs(Float('0.7468241634690489') - sqrt(pi)*erf(1)/2) < 4e-8); same(floor(Float('0.7468241634690489')*10**7), floor(sqrt(pi)*erf(1)/2*10**7))
same(integrate(sin(x)/x, x), Si(x)); same(diff(Si(x), x), sin(x)/x); limit_is(sin(t)/t, t, 0, 1)
```

No formula built from the functions of Module 1's catalogue has derivative $e^{-x^2}$ or $\frac{\sin x}{x}$; this is a theorem, beyond this series, and Module 11 returns to such functions. The error function is central in probability and statistics, where $e^{-x^2}$ is the shape of the normal distribution (Module 12). When SymPy answers with `erf`, `Si` or another special function, it has not failed: by Part 1, the integral is a perfectly good function, and SymPy has named it.

## What you learned {#summary}

- An **antiderivative** of $f$ on an interval is a function $F$ with $F' = f$. On an interval, all antiderivatives are $F + C$ (Theorem 10.1, from Module 8's theorem that equal derivatives mean a constant difference); on a domain made of several intervals, the constant may differ on each.
- A table of basic antiderivatives follows from the rules of differentiation read backwards: $\dfrac{x^{n+1}}{n + 1}$ for $x^n$ ($n \ne -1$), $\ln\abs{x}$ for $\dfrac1x$, $-\cos x$ for $\sin x$, $\arctan x$ for $\dfrac{1}{1 + x^2}$, and so on. Check every antiderivative by differentiating it.
- An **initial value problem** $F' = f$, $F(x_0) = y_0$ has exactly one solution on an interval where $f$ is continuous; from a constant acceleration and two initial conditions come $v(t) = v_0 + at$ and $s(t) = s_0 + v_0t + \tfrac12at^2$, the falling ball's $s = 4.9t^2$ among them.
- The **area function** $A(x) = \int_a^x f(t)\,dt$ accumulates signed area: it increases where $f > 0$ and decreases where $f < 0$.
- **Fundamental Theorem, Part 1:** if $f$ is continuous on an interval that contains $a$, then $\dfrac{d}{dx}\displaystyle\int_a^x f(t)\,dt = f(x)$ there (a one-sided derivative at an endpoint). So every continuous function on an interval has an antiderivative, and with the chain rule, $\dfrac{d}{dx}\displaystyle\int_a^{u(x)} f(t)\,dt = f\big(u(x)\big)u'(x)$.
- **Fundamental Theorem, Part 2:** if $f$ is continuous on $[a, b]$ and $F$ is an antiderivative of $f$ there, then $\int_a^b f(x)\,dx = F(b) - F(a) = \big[F(x)\big]_a^b$. Limits of Riemann sums become two-line computations; the speedometer and the odometer undo each other.
- The **indefinite integral** $\int f(x)\,dx = F(x) + C$ is the general antiderivative. The **net change theorem**, $\int_a^b F'(x)\,dx = F(b) - F(a)$: the integral of a rate is the net change. Displacement is $\int v\,dt$; distance travelled is $\int \abs{v}\,dt$.
- **Substitution** reverses the chain rule: $\int f\big(g(x)\big)g'(x)\,dx = \int f(u)\,du$ with $u = g(x)$, $du = g'(x)\,dx$; in a definite integral, change the limits to $g(a)$ and $g(b)$. Over $[-a, a]$, even functions give twice the integral over $[0, a]$ and odd functions give 0.
- SymPy: `sp.integrate(f, x)` (no $+\,C$), `sp.integrate(f, (x, a, b))`, `sp.Integral(...)` and `.doit()`. Its answers may differ from yours by a constant, write $\ln x$ for $\ln\abs{x}$, or use special functions such as $\operatorname{erf}$, defined as area functions.

## Exercises {#exercises}

:::: exercise Antiderivatives {#ex-10-1} ★
Find the general antiderivative of each function, and check your answer by differentiating it.

- (a) $f(x) = 8x^3 - 6x^2 + 1$
- (b) $g(x) = \dfrac{1}{x^3} - \dfrac{4}{\sqrt x}$, for $x > 0$
- (c) $h(t) = 3e^{-t} + 2\sin 3t$
- (d) $q(x) = \dfrac{(1 + x)^2}{\sqrt x}$, for $x > 0$

::: solution
**(a)** Term by term: $8\cdot\dfrac{x^4}{4} - 6\cdot\dfrac{x^3}{3} + x = 2x^4 - 2x^3 + x$, so the answer is $2x^4 - 2x^3 + x + C$. Check: $8x^3 - 6x^2 + 1$.

**(b)** As powers, $g(x) = x^{-3} - 4x^{-1/2}$. The power rule gives
$$\frac{x^{-2}}{-2} - 4\cdot\frac{x^{1/2}}{1/2} = -\frac{1}{2x^2} - 8\sqrt x,$$
so the answer is $-\dfrac{1}{2x^2} - 8\sqrt x + C$. Check: $\dfrac{d}{dx}\Big(-\tfrac12 x^{-2} - 8x^{1/2}\Big) = x^{-3} - 4x^{-1/2}$.

**(c)** With $k = -1$, an antiderivative of $e^{-t}$ is $\dfrac{e^{-t}}{-1} = -e^{-t}$; with $k = 3$, one of $\sin 3t$ is $-\dfrac{\cos 3t}{3}$. The answer is $-3e^{-t} - \dfrac23\cos 3t + C$. Check: $3e^{-t} + 2\sin 3t$.

**(d)** Expand the numerator and divide each term by $\sqrt x = x^{1/2}$:
$$\frac{1 + 2x + x^2}{x^{1/2}} = x^{-1/2} + 2x^{1/2} + x^{3/2}.$$
The answer is $2x^{1/2} + \dfrac43 x^{3/2} + \dfrac25 x^{5/2} + C$. The tempting shortcut of integrating the top and the bottom separately has no basis: there is no quotient rule for antiderivatives.

```check
antideriv(2*x**4 - 2*x**3 + x, 8*x**3 - 6*x**2 + 1, x)
same(1/xp**3 - 4/sqrt(xp), xp**(-3) - 4*xp**Rational(-1, 2))
same(xp**(-2)/(-2) - 4*xp**Rational(1, 2)/Rational(1, 2), -1/(2*xp**2) - 8*sqrt(xp))
antideriv(-1/(2*xp**2) - 8*sqrt(xp), 1/xp**3 - 4/sqrt(xp), xp)
antideriv(-exp(-t), exp(-t), t); antideriv(-cos(3*t)/3, sin(3*t), t); antideriv(-3*exp(-t) - Rational(2, 3)*cos(3*t), 3*exp(-t) + 2*sin(3*t), t)
same(expand((1 + xp)**2/sqrt(xp)), xp**Rational(-1, 2) + 2*xp**Rational(1, 2) + xp**Rational(3, 2))
antideriv(2*xp**Rational(1, 2) + Rational(4, 3)*xp**Rational(3, 2) + Rational(2, 5)*xp**Rational(5, 2), (1 + xp)**2/sqrt(xp), xp)
```
:::
::::

:::: exercise Integrals by Part 2 {#ex-10-2} ★
Evaluate:

- (a) $\displaystyle\int_1^3 (2x - 1)^2\,dx$
- (b) $\displaystyle\int_0^{\pi/3} \sec^2 x\,dx$
- (c) $\displaystyle\int_1^4 \Big(\sqrt x + \frac{1}{\sqrt x}\Big)\,dx$
- (d) $\displaystyle\int_0^{1/2} \frac{dx}{\sqrt{1 - x^2}}$

::: solution
**(a)** Expand: $(2x - 1)^2 = 4x^2 - 4x + 1$, with antiderivative $F(x) = \tfrac43 x^3 - 2x^2 + x$. Then $F(3) = 36 - 18 + 3 = 21$ and $F(1) = \tfrac43 - 2 + 1 = \tfrac13$, so the integral is $21 - \tfrac13 = \tfrac{62}{3}$. (Substitution with $u = 2x - 1$ gives the same: $\tfrac12\int_1^5 u^2\,du = \tfrac12\cdot\tfrac{124}{3} = \tfrac{62}{3}$.)

**(b)** $\tan x$ is an antiderivative of $\sec^2 x$ on $(-\pi/2, \pi/2)$, which contains $[0, \pi/3]$: $\tan\dfrac{\pi}{3} - \tan 0 = \sqrt3$.

**(c)** As powers, $x^{1/2} + x^{-1/2}$, with antiderivative $\tfrac23 x^{3/2} + 2x^{1/2}$. At 4 it is $\tfrac23\cdot 8 + 2\cdot 2 = \tfrac{28}{3}$; at 1 it is $\tfrac23 + 2 = \tfrac83$. The integral is $\tfrac{28}{3} - \tfrac83 = \tfrac{20}{3}$.

**(d)** $\arcsin x$ is an antiderivative on $(-1, 1)$, which contains $[0, \tfrac12]$: $\arcsin\tfrac12 - \arcsin 0 = \dfrac{\pi}{6} \approx 0.5236$.

```check
same(expand((2*x - 1)**2), 4*x**2 - 4*x + 1); F_2a = Rational(4, 3)*x**3 - 2*x**2 + x
antideriv(F_2a, 4*x**2 - 4*x + 1, x); same(F_2a.subs(x, 3), 21); same(36 - 18 + 3, 21); same(F_2a.subs(x, 1), Rational(1, 3))
same(integrate((2*x - 1)**2, (x, 1, 3)), Rational(62, 3)); same(Rational(1, 2)*integrate(u**2, (u, 1, 5)), Rational(62, 3)); same(integrate(u**2, (u, 1, 5)), Rational(124, 3))
same(integrate(sec(x)**2, (x, 0, pi/3)), sqrt(3)); same(tan(pi/3) - tan(0), sqrt(3))
F_2c = Rational(2, 3)*x**Rational(3, 2) + 2*x**Rational(1, 2)
antideriv(F_2c, sqrt(x) + 1/sqrt(x), x); same(F_2c.subs(x, 4), Rational(28, 3)); same(F_2c.subs(x, 1), Rational(8, 3)); same(integrate(sqrt(x) + 1/sqrt(x), (x, 1, 4)), Rational(20, 3))
same(asin(Rational(1, 2)) - asin(0), pi/6); same(integrate(1/sqrt(1 - x**2), (x, 0, Rational(1, 2))), pi/6); rounds(pi/6, '0.5236')
```
:::
::::

:::: exercise Derivatives of integrals {#ex-10-3} ★
Find the derivative of each function.

- (a) $F(x) = \displaystyle\int_2^x \ln(1 + t^2)\,dt$
- (b) $G(x) = \displaystyle\int_x^5 \sqrt{1 + t^4}\,dt$
- (c) $H(x) = \displaystyle\int_0^{\sin x} e^{t^2}\,dt$
- (d) $K(x) = \displaystyle\int_x^{x^2} t^3\,dt$, in two ways: with Theorem 10.3, and by evaluating the integral first.

::: solution
**(a)** $\ln(1 + t^2)$ is continuous on $\R$, so by Part 1, $F'(x) = \ln(1 + x^2)$.

**(b)** The variable is the lower limit: $G(x) = -\int_5^x \sqrt{1 + t^4}\,dt$, so $G'(x) = -\sqrt{1 + x^4}$.

**(c)** The upper limit is $u(x) = \sin x$, with $u'(x) = \cos x$: $H'(x) = e^{\sin^2 x}\cos x$.

**(d)** By Theorem 10.3 with $u(x) = x^2$ and $v(x) = x$:
$$\begin{aligned} K'(x) &= (x^2)^3\cdot 2x - x^3\cdot 1 \\ &= 2x^7 - x^3. \end{aligned}$$
Evaluating first, $K(x) = \Big[\dfrac{t^4}{4}\Big]_x^{x^2} = \dfrac{x^8}{4} - \dfrac{x^4}{4}$, so $K'(x) = 2x^7 - x^3$: the same.

```check
same(diff(Integral(log(1 + t**2), (t, 2, x)), x), log(1 + x**2))
same(diff(Integral(sqrt(1 + t**4), (t, x, 5)), x), -sqrt(1 + x**4))
same(diff(Integral(exp(t**2), (t, 0, sin(x))), x), exp(sin(x)**2)*cos(x))
steps(Derivative(Integral(t**3, (t, x, x**2)), x), (x**2)**3*2*x - x**3*1, 2*x**7 - x**3)
same(integrate(t**3, (t, x, x**2)), x**8/4 - x**4/4); same(diff(x**8/4 - x**4/4, x), 2*x**7 - x**3)
```
:::
::::

:::: exercise Displacement and distance {#ex-10-4} ★
A cyclist rides along a straight road with velocity $v(t) = 2t - 4$ metres per second for $0 \le t \le 5$, where a positive velocity means eastwards.

- (a) Find the displacement over the 5 seconds.
- (b) Find the distance travelled.
- (c) Check both answers with areas of triangles.

::: solution
**(a)** The displacement is $\displaystyle\int_0^5 (2t - 4)\,dt = \big[t^2 - 4t\big]_0^5 = 25 - 20 = 5$ m: the cyclist ends 5 m east of the start.

**(b)** $v(t) < 0$ for $t < 2$ (riding west) and $v(t) > 0$ for $t > 2$. With $F(t) = t^2 - 4t$, $\int_0^2 v\,dt = F(2) - F(0) = -4$ and $\int_2^5 v\,dt = F(5) - F(2) = 5 - (-4) = 9$. The distance is $\abs{-4} + 9 = 13$ m: 4 m west, then 9 m east.

**(c)** The graph of $v$ is a line through $(2, 0)$. From 0 to 2 it bounds a triangle below the axis with base 2 and height 4, of area 4; from 2 to 5, a triangle above the axis with base 3 and height 6, of area 9. Signed, $-4 + 9 = 5$; unsigned, $4 + 9 = 13$.

```check
F_4 = t**2 - 4*t; antideriv(F_4, 2*t - 4, t)
same(integrate(2*t - 4, (t, 0, 5)), 5); same(F_4.subs(t, 5) - F_4.subs(t, 0), 25 - 20)
same(solve(2*t - 4, t), [2]); same(F_4.subs(t, 2) - F_4.subs(t, 0), -4); same(F_4.subs(t, 5) - F_4.subs(t, 2), 9)
same(Rational(1, 2)*2*4, 4); same(Rational(1, 2)*3*6, 9); same((2*t - 4).subs(t, 0), -4); same((2*t - 4).subs(t, 5), 6)
```
:::
::::

:::: exercise A braking car {#ex-10-5} ★★
A car travelling at 30 m/s brakes with a constant deceleration of 6 m/s² (its acceleration is $-6$ m/s²) until it stops.

- (a) Find its velocity $v(t)$ and its position $s(t)$, measured from the point where braking starts, $t$ seconds after braking starts.
- (b) When does it stop, and how far does it travel while braking?
- (c) How far would it travel if the deceleration were halved? And if, with deceleration 6 m/s², it started at 60 m/s?

::: solution
**(a)** $v$ is an antiderivative of $a = -6$: $v(t) = -6t + C_1$, and $v(0) = 30$ gives $v(t) = 30 - 6t$. Then $s(t) = 30t - 3t^2 + C_2$, and $s(0) = 0$ gives $s(t) = 30t - 3t^2$. These hold until the car stops; after that it stays put.

**(b)** $v(t) = 0$ when $t = 5$ s, and then $s(5) = 150 - 75 = 75$ m.

**(c)** With $a = -3$: $v(t) = 30 - 3t$ is 0 at $t = 10$, and $s(10) = 300 - 150 = 150$ m, twice as far. In general, with initial speed $v_0$ and deceleration $d$, the car stops at $t = v_0/d$ after travelling
$$v_0\cdot\frac{v_0}{d} - \frac{d}{2}\Big(\frac{v_0}{d}\Big)^2 = \frac{v_0^2}{2d}.$$
So at 60 m/s with $d = 6$, it travels $\dfrac{3600}{12} = 300$ m: twice the speed means four times the braking distance, which is why speed matters so much on the road.

```check
same(solve(Eq((-6*t + C1).subs(t, 0), 30), C1), [30]); antideriv(30*t - 3*t**2, 30 - 6*t, t); same((30*t - 3*t**2).subs(t, 0), 0)
same(solve(30 - 6*t, t), [5]); same((30*t - 3*t**2).subs(t, 5), 75)
same(solve(30 - 3*t, t), [10]); same((30*t - 3*t**2/2).subs(t, 10), 150); antideriv(30*t - 3*t**2/2, 30 - 3*t, t)
dd = symbols('d', positive=True); V0 = symbols('v_0', positive=True)
steps(V0*(V0/dd) - dd/2*(V0/dd)**2, V0**2/(2*dd)); same((V0**2/(2*dd)).subs({V0: 30, dd: 6}), 75); same((V0**2/(2*dd)).subs({V0: 60, dd: 6}), 300)
```
:::
::::

:::: exercise Substitution {#ex-10-6} ★★
Find:

- (a) $\displaystyle\int x(3x^2 + 1)^4\,dx$
- (b) $\displaystyle\int \frac{\sin x}{2 + \cos x}\,dx$
- (c) $\displaystyle\int \frac{e^{\sqrt x}}{\sqrt x}\,dx$, for $x > 0$
- (d) $\displaystyle\int \frac{dx}{\sqrt{9 - x^2}}$, for $-3 < x < 3$
- (e) $\displaystyle\int \sin x\cos x\,dx$, once with $u = \sin x$ and once with $u = \cos x$. Explain why the two answers look different.

::: solution
**(a)** $u = 3x^2 + 1$, $du = 6x\,dx$, so $x\,dx = \tfrac16\,du$:
$$\begin{aligned} \frac16\int u^4\,du &= \frac{u^5}{30} + C \\ &= \frac{(3x^2 + 1)^5}{30} + C. \end{aligned}$$

**(b)** $u = 2 + \cos x$, $du = -\sin x\,dx$:
$$\begin{aligned} -\int \frac{du}{u} &= -\ln\abs{u} + C \\ &= -\ln(2 + \cos x) + C, \end{aligned}$$
without absolute value bars, since $2 + \cos x \ge 1$.

**(c)** $u = \sqrt x$, $du = \dfrac{dx}{2\sqrt x}$, so $\dfrac{dx}{\sqrt x} = 2\,du$: $\displaystyle 2\int e^u\,du = 2e^{\sqrt x} + C$.

**(d)** $9 - x^2 = 9\big(1 - (x/3)^2\big)$, and $\sqrt9 = 3$. Let $u = x/3$, so $dx = 3\,du$:
$$\begin{aligned} \int \frac{3\,du}{3\sqrt{1 - u^2}} &= \arcsin u + C \\ &= \arcsin\frac{x}{3} + C. \end{aligned}$$

**(e)** With $u = \sin x$, $du = \cos x\,dx$: $\int u\,du = \tfrac12\sin^2 x + C$. With $u = \cos x$, $du = -\sin x\,dx$: $-\int u\,du = -\tfrac12\cos^2 x + C$. Both are right. Their difference, $\tfrac12\sin^2 x + \tfrac12\cos^2 x = \tfrac12$, is a constant, and by Theorem 10.1 antiderivatives on an interval may differ by a constant: the "$+\,C$" in each answer absorbs it.

```check
same(diff(3*x**2 + 1, x), 6*x); antideriv((3*x**2 + 1)**5/30, x*(3*x**2 + 1)**4, x); antideriv(u**5/30, u**4/6, u)
same(diff(2 + cos(x), x), -sin(x)); antideriv(-log(2 + cos(x)), sin(x)/(2 + cos(x)), x); holds(2 + cos(pi) >= 1)
same(diff(sqrt(xp), xp), 1/(2*sqrt(xp))); antideriv(2*exp(sqrt(xp)), exp(sqrt(xp))/sqrt(xp), xp)
same(9*(1 - (x/3)**2), 9 - x**2); same(3/(3*sqrt(1 - u**2)), 1/sqrt(1 - u**2)); antideriv(asin(x/3), 1/sqrt(9 - x**2), x)
antideriv(sin(x)**2/2, sin(x)*cos(x), x); antideriv(-cos(x)**2/2, sin(x)*cos(x), x); same(sin(x)**2/2 - (-cos(x)**2/2), Rational(1, 2))
```
:::
::::

:::: exercise Definite integrals by substitution {#ex-10-7} ★★
- (a) Evaluate $\displaystyle\int_0^1 x e^{-x^2}\,dx$, exactly and to four decimal places.
- (b) Evaluate $\displaystyle\int_0^{\pi/4} \tan x\sec^2 x\,dx$.
- (c) Evaluate $\displaystyle\int_0^3 \frac{x}{\sqrt{x + 1}}\,dx$.
- (d) A student writes $\displaystyle\int_0^2 \frac{x}{x^2 + 1}\,dx = \frac12\int_0^2 \frac{du}{u}$. Find the mistake, and the right value.

::: solution
**(a)** $u = -x^2$, $du = -2x\,dx$, so $x\,dx = -\tfrac12\,du$; $x = 0$ gives $u = 0$ and $x = 1$ gives $u = -1$:
$$\begin{aligned} \int_0^1 x e^{-x^2}\,dx &= -\frac12\int_0^{-1} e^u\,du \\ &= \frac12\int_{-1}^0 e^u\,du \\ &= \frac12\big(1 - e^{-1}\big) \approx 0.3161. \end{aligned}$$

**(b)** $u = \tan x$, $du = \sec^2 x\,dx$; the limits become $\tan 0 = 0$ and $\tan\dfrac{\pi}{4} = 1$: $\displaystyle\int_0^1 u\,du = \frac12$.

**(c)** $u = x + 1$, $du = dx$, and the leftover $x$ is $u - 1$; the limits become 1 and 4:
$$\begin{aligned} &\int_1^4 \frac{u - 1}{\sqrt u}\,du \\ &\quad= \int_1^4 \big(u^{1/2} - u^{-1/2}\big)\,du \\ &\quad= \Big[\frac23 u^{3/2} - 2u^{1/2}\Big]_1^4 \\ &\quad= \Big(\frac{16}{3} - 4\Big) - \Big(\frac23 - 2\Big) = \frac83. \end{aligned}$$

**(d)** With $u = x^2 + 1$ the integrand is right, $\tfrac12\cdot\tfrac{du}{u}$, but the limits are still those of $x$. When $x = 0$, $u = 1$; when $x = 2$, $u = 5$. The right value is
$$\frac12\int_1^5 \frac{du}{u} = \frac12\ln 5 \approx 0.8047.$$
The student's integral is not even defined: $1/u$ is unbounded near $u = 0$.

```check
steps(Integral(x*exp(-x**2), (x, 0, 1)), -Rational(1, 2)*Integral(exp(u), (u, 0, -1)), Rational(1, 2)*Integral(exp(u), (u, -1, 0)), Rational(1, 2)*(1 - exp(-1))); rounds((1 - exp(-1))/2, '0.3161')
same(diff(tan(x), x), sec(x)**2); same(tan(pi/4), 1); steps(Integral(tan(x)*sec(x)**2, (x, 0, pi/4)), Integral(u, (u, 0, 1)), Rational(1, 2))
steps(Integral(x/sqrt(x + 1), (x, 0, 3)), Integral((u - 1)/sqrt(u), (u, 1, 4)), (Rational(16, 3) - 4) - (Rational(2, 3) - 2), Rational(8, 3))
antideriv(Rational(2, 3)*up**Rational(3, 2) - 2*up**Rational(1, 2), (up - 1)/sqrt(up), up)
steps(Integral(x/(x**2 + 1), (x, 0, 2)), Rational(1, 2)*Integral(1/u, (u, 1, 5)), log(5)/2); rounds(log(5)/2, '0.8047')
same(integrate(1/u, (u, 0, 2)), oo)
```
:::
::::

:::: exercise An area function from a formula {#ex-10-8} ★★
Let $g(x) = \displaystyle\int_0^x (t^2 - 4t + 3)\,dt$.

- (a) Find $g'(x)$ without evaluating the integral.
- (b) On which intervals is $g$ increasing, and on which decreasing? Where does it have a local maximum and a local minimum?
- (c) Where is the graph of $g$ concave up, and where concave down?
- (d) Find a formula for $g(x)$, and use it to find $g$ at the points of (b). What does $g(3)$ say about areas?

::: solution
**(a)** The integrand is continuous on $\R$, so by Part 1, $g'(x) = x^2 - 4x + 3 = (x - 1)(x - 3)$.

**(b)** $g'(x) > 0$ for $x < 1$ and for $x > 3$, and $g'(x) < 0$ for $1 < x < 3$. So $g$ is increasing on $(-\infty, 1]$ and on $[3, \infty)$, and decreasing on $[1, 3]$. By the first derivative test (Module 8), $g$ has a local maximum at $x = 1$ and a local minimum at $x = 3$.

**(c)** $g''(x) = 2x - 4$, which is negative for $x < 2$ and positive for $x > 2$: the graph is concave down on $(-\infty, 2)$ and concave up on $(2, \infty)$, with an inflection point at $x = 2$.

**(d)** By Part 2, $g(x) = \Big[\dfrac{t^3}{3} - 2t^2 + 3t\Big]_0^x = \dfrac{x^3}{3} - 2x^2 + 3x$. Then $g(1) = \tfrac13 - 2 + 3 = \tfrac43$ and $g(3) = 9 - 18 + 9 = 0$. So the area from 0 to 1, where the integrand is positive, is $\tfrac43$, and the signed area from 1 to 3, where it is negative, is $-\tfrac43$: on $[0, 3]$ they cancel.

```check
same(diff(Integral(t**2 - 4*t + 3, (t, 0, x)), x), x**2 - 4*x + 3); same(factor(x**2 - 4*x + 3), (x - 1)*(x - 3))
holds((x**2 - 4*x + 3).subs(x, 0) > 0); holds((x**2 - 4*x + 3).subs(x, 2) < 0); holds((x**2 - 4*x + 3).subs(x, 4) > 0)
same(diff(x**2 - 4*x + 3, x), 2*x - 4); same(solve(2*x - 4, x), [2])
g8 = x**3/3 - 2*x**2 + 3*x
same(integrate(t**2 - 4*t + 3, (t, 0, x)), g8); same(g8.subs(x, 1), Rational(4, 3)); same(g8.subs(x, 3), 0)
same(integrate(t**2 - 4*t + 3, (t, 1, 3)), -Rational(4, 3))
```
:::
::::

:::: exercise Charge from current {#ex-10-9} ★★
Electric current is the rate at which charge flows: one ampere is one coulomb per second. Suppose the current flowing into a capacitor is $I(t) = 0.2e^{-t/5}$ amperes for $t \ge 0$ seconds.

- (a) How much charge flows in during the first 5 seconds? During the first 10 seconds? Give both to three decimal places.
- (b) Find the charge $Q(T)$ that flows in during the first $T$ seconds, and the number it approaches as $T \to \infty$.

::: solution
**(a)** By the net change theorem, the charge is the integral of the current. With $k = -\tfrac15$, an antiderivative of $e^{-t/5}$ is $\dfrac{e^{-t/5}}{-1/5} = -5e^{-t/5}$, so one of $I(t)$ is $0.2\cdot(-5e^{-t/5}) = -e^{-t/5}$. Then
$$\begin{aligned} \int_0^5 0.2e^{-t/5}\,dt &= \big[-e^{-t/5}\big]_0^5 \\ &= 1 - e^{-1} \approx 0.632 \text{ C}, \end{aligned}$$
and in the same way $\int_0^{10} 0.2e^{-t/5}\,dt = 1 - e^{-2} \approx 0.865$ C.

**(b)** $Q(T) = \big[-e^{-t/5}\big]_0^T = 1 - e^{-T/5}$ coulombs. As $T \to \infty$, $e^{-T/5} \to 0$ (Module 3), so $Q(T) \to 1$: in all, the capacitor takes on a charge approaching 1 coulomb, two thirds of it, roughly, in the first 5 seconds.

```check
antideriv(-5*exp(-t/5), exp(-t/5), t); antideriv(-exp(-t/5), Rational(2, 10)*exp(-t/5), t)
same(integrate(Rational(2, 10)*exp(-t/5), (t, 0, 5)), 1 - exp(-1)); rounds(1 - exp(-1), '0.632')
same(integrate(Rational(2, 10)*exp(-t/5), (t, 0, 10)), 1 - exp(-2)); rounds(1 - exp(-2), '0.865')
Tp = symbols('T', positive=True)
same(integrate(Rational(2, 10)*exp(-t/5), (t, 0, Tp)), 1 - exp(-Tp/5)); limit_is(1 - exp(-Tp/5), Tp, oo, 1)
holds(Abs((1 - exp(-1)) - Rational(2, 3)) < Rational(4, 100))
```
:::
::::

:::: exercise The logarithm as an area {#ex-10-10} ★★★
This exercise rebuilds the natural logarithm from an integral, without using anything you know about $\ln$. For $x > 0$ let
$$L(x) = \int_1^x \frac{dt}{t}.$$

- (a) Show that $L$ is differentiable on $(0, \infty)$ with $L'(x) = 1/x$, and that $L(1) = 0$.
- (b) Fix $y > 0$. Show that the functions $x \mapsto L(xy)$ and $x \mapsto L(x) + L(y)$ have the same derivative on $(0, \infty)$, and deduce that $L(xy) = L(x) + L(y)$ for all $x, y > 0$.
- (c) Deduce that $L(1/x) = -L(x)$, and that $L(x^n) = nL(x)$ for every positive integer $n$.
- (d) Show that $L(2) \ge \tfrac12$, and deduce that $L(x) \to \infty$ as $x \to \infty$.

::: solution
**(a)** $1/t$ is continuous on the open interval $(0, \infty)$, which contains 1. By Part 1, in the form for open intervals, $L$ is differentiable at every $x > 0$, with $L'(x) = 1/x$. And $L(1) = \int_1^1 \frac{dt}{t} = 0$.

**(b)** By the chain rule, $\dfrac{d}{dx}L(xy) = L'(xy)\cdot y = \dfrac{y}{xy} = \dfrac1x$. And $\dfrac{d}{dx}\big(L(x) + L(y)\big) = \dfrac1x + 0$, since $L(y)$ does not depend on $x$. The two functions have the same derivative on the interval $(0, \infty)$, so by Module 8 they differ by a constant: $L(xy) = L(x) + L(y) + C$ for every $x > 0$. At $x = 1$ this says $L(y) = 0 + L(y) + C$, so $C = 0$.

**(c)** By (b), $L(x) + L(1/x) = L\big(x\cdot\tfrac1x\big) = L(1) = 0$, so $L(1/x) = -L(x)$. For powers use induction: $L(x^1) = 1\cdot L(x)$, and if $L(x^n) = nL(x)$, then $L(x^{n+1}) = L(x^n\cdot x) = nL(x) + L(x) = (n + 1)L(x)$.

**(d)** For $1 \le t \le 2$, $\dfrac1t \ge \dfrac12$, so by the bounds property of integrals, $L(2) \ge \tfrac12(2 - 1) = \tfrac12$. By (c), $L(2^n) = nL(2) \ge \tfrac{n}{2}$. Since $L' = 1/x > 0$, $L$ is increasing (Module 8), so $L(x) \ge \tfrac{n}{2}$ for every $x \ge 2^n$. Given any number $M$, take $n > 2M$: then $L(x) > M$ for all $x \ge 2^n$. So $L(x) \to \infty$.

These are the properties of $\ln$, and indeed $L = \ln$: both have derivative $1/x$ on $(0, \infty)$ and the value 0 at 1. Some books start here and define $\ln x$ as this integral.

```check
same(diff(Integral(1/t, (t, 1, x)), x), 1/x); same(integrate(1/t, (t, 1, 1)), 0)
yp = symbols('y', positive=True)
same(diff(Integral(1/t, (t, 1, xp*yp)), xp), 1/xp); same((1/(xp*yp))*yp, 1/xp)
same(integrate(1/t, (t, 1, xp*yp)), integrate(1/t, (t, 1, xp)) + integrate(1/t, (t, 1, yp)))
same(integrate(1/t, (t, 1, 1/xp)), -integrate(1/t, (t, 1, xp)))
for N_ in range(1, 6):
    same(integrate(1/t, (t, 1, xp**N_)), N_*integrate(1/t, (t, 1, xp)))
same(integrate(1/t, (t, 1, 2)), log(2)); holds(log(2) >= Rational(1, 2)); holds(Rational(1, 2)*(2 - 1) == Rational(1, 2))
same(integrate(1/t, (t, 1, x)), log(x))
```
:::
::::

:::: exercise Periodic functions {#ex-10-11} ★★★
Let $f$ be continuous on $\R$ and periodic with period $p > 0$: $f(x + p) = f(x)$ for every $x$.

- (a) Show that $I(a) = \displaystyle\int_a^{a + p} f(x)\,dx$ has the same value for every $a$. (Differentiate with respect to $a$.)
- (b) Deduce that $\displaystyle\int_0^{np} f(x)\,dx = n\int_0^p f(x)\,dx$ for every positive integer $n$.
- (c) Use (a) to evaluate $\displaystyle\int_1^{1 + \pi} \abs{\sin x}\,dx$, and check the answer by splitting the interval where $\sin x$ changes sign.

::: solution
**(a)** By the splitting property, $I(a) = \int_0^{a + p} f(x)\,dx - \int_0^a f(x)\,dx$. By Theorem 10.3, with $u(a) = a + p$,
$$I'(a) = f(a + p)\cdot 1 - f(a) = 0,$$
by periodicity. A function with derivative 0 on the interval $\R$ is constant (Module 8), so $I(a) = I(0)$ for every $a$.

**(b)** Split $[0, np]$ into the $n$ intervals $[kp, (k + 1)p]$, for $k = 0, 1, \dots, n - 1$:
$$\begin{aligned} \int_0^{np} f(x)\,dx &= \sum_{k=0}^{n-1} I(kp) = n\,I(0) \\ &= n\int_0^p f(x)\,dx. \end{aligned}$$

**(c)** $\abs{\sin x}$ is continuous, and periodic with period $\pi$, since $\abs{\sin(x + \pi)} = \abs{-\sin x} = \abs{\sin x}$. By (a),
$$\begin{aligned} \int_1^{1 + \pi} \abs{\sin x}\,dx &= \int_0^\pi \abs{\sin x}\,dx \\ &= \int_0^\pi \sin x\,dx = 2. \end{aligned}$$
Check: $\sin x > 0$ on $(1, \pi)$ and $\sin x < 0$ on $(\pi, 1 + \pi)$, so the integral is
$$\begin{aligned} &\int_1^\pi \sin x\,dx - \int_\pi^{1 + \pi} \sin x\,dx \\ &\quad= (1 + \cos 1) + (1 - \cos 1) = 2. \end{aligned}$$

```check
pp = symbols('p', positive=True); fP = Function('f')
same(diff(Integral(fP(x), (x, a, a + pp)), a), fP(a + pp) - fP(a))
same(sin(x + pi), -sin(x)); same(Abs(-sin(Rational(1, 3))), Abs(sin(Rational(1, 3))))
same(integrate(sin(x), (x, 0, pi)), 2)
same(integrate(sin(x), (x, 1, pi)), 1 + cos(1)); same(-integrate(sin(x), (x, pi, 1 + pi)), 1 - cos(1)); same((1 + cos(1)) + (1 - cos(1)), 2)
holds(sin(pi - Rational(1, 10)) > 0); holds(sin(pi + 1 - Rational(1, 10)) < 0)
for A_ in (0, Rational(1, 2), 1, 3):                    # the cosine over one period: the same for every a
    same(integrate(cos(x)**2, (x, A_, A_ + pi)), pi/2)
same(integrate(cos(x)**2, (x, 0, 3*pi)), 3*integrate(cos(x)**2, (x, 0, pi)))
```
:::
::::

:::: exercise Sine squared by symmetry {#ex-10-12} ★★★
- (a) Use the substitution $u = \dfrac{\pi}{2} - x$ to show that $\displaystyle\int_0^{\pi/2} \sin^n x\,dx = \int_0^{\pi/2} \cos^n x\,dx$ for every positive integer $n$.
- (b) Deduce, with $\sin^2 x + \cos^2 x = 1$, that $\displaystyle\int_0^{\pi/2} \sin^2 x\,dx = \frac{\pi}{4}$.
- (c) Find $\displaystyle\int_0^\pi \sin^2 x\,dx$ and the average value of $\sin^2 x$ over $[0, \pi]$.

::: solution
**(a)** With $u = \dfrac{\pi}{2} - x$, $du = -dx$; $x = 0$ gives $u = \dfrac{\pi}{2}$ and $x = \dfrac{\pi}{2}$ gives $u = 0$. By the addition formula of Module 1, $\sin\Big(\dfrac{\pi}{2} - u\Big) = \sin\dfrac{\pi}{2}\cos u - \cos\dfrac{\pi}{2}\sin u = \cos u$. So by Theorem 10.7
$$\begin{aligned} \int_0^{\pi/2} \sin^n x\,dx &= \int_{\pi/2}^0 \cos^n u\,(-du) \\ &= \int_0^{\pi/2} \cos^n u\,du. \end{aligned}$$

**(b)** Let $S = \int_0^{\pi/2} \sin^2 x\,dx$. By (a), $\int_0^{\pi/2} \cos^2 x\,dx = S$ too. Adding,
$$\begin{aligned} 2S &= \int_0^{\pi/2} \big(\sin^2 x + \cos^2 x\big)\,dx \\ &= \int_0^{\pi/2} 1\,dx = \frac{\pi}{2}, \end{aligned}$$
so $S = \dfrac{\pi}{4}$. No antiderivative of $\sin^2 x$ was needed.

**(c)** On $[\tfrac{\pi}{2}, \pi]$ substitute $u = \pi - x$: since $\sin(\pi - u) = \sin u$, $\int_{\pi/2}^\pi \sin^2 x\,dx = \int_0^{\pi/2} \sin^2 u\,du = \dfrac{\pi}{4}$. So $\int_0^\pi \sin^2 x\,dx = \dfrac{\pi}{2}$, and the average value is $\dfrac{1}{\pi}\cdot\dfrac{\pi}{2} = \dfrac12$. This is why an alternating voltage $V_0\sin\omega t$ delivers, on average, the power of a steady voltage $V_0/\sqrt2$: power is proportional to the square of the voltage, and the average of $\sin^2$ over a half period is $\tfrac12$.

```check
same(sin(pi/2 - u), cos(u)); same(sin(pi/2)*cos(u) - cos(pi/2)*sin(u), cos(u))
for N_ in range(1, 7):
    same(integrate(sin(x)**N_, (x, 0, pi/2)), integrate(cos(x)**N_, (x, 0, pi/2)))
same(integrate(sin(x)**2 + cos(x)**2, (x, 0, pi/2)), pi/2); same(integrate(sin(x)**2, (x, 0, pi/2)), pi/4)
same(sin(pi - u), sin(u)); same(integrate(sin(x)**2, (x, pi/2, pi)), pi/4); same(integrate(sin(x)**2, (x, 0, pi)), pi/2); same((1/pi)*(pi/2), Rational(1, 2))
V0s, w_ = symbols('V_0 omega', positive=True)
same(integrate((V0s*sin(w_*t))**2, (t, 0, pi/w_))/(pi/w_), (V0s/sqrt(2))**2)
```
:::
::::

## Check yourself {#quiz}

```quiz
? Which function is an antiderivative of $\dfrac{1}{x^2}$ on $(0, \infty)$?
- [ ] $\ln(x^2)$
- [x] $-\dfrac{1}{x}$
- [ ] $-\dfrac{2}{x^3}$
- [ ] $\dfrac{1}{x}$
> Write $\dfrac{1}{x^2} = x^{-2}$, raise the power by 1 and divide by the new power: $\dfrac{x^{-1}}{-1} = -\dfrac1x$; check: $\big(-x^{-1}\big)' = x^{-2}$. $-\dfrac{2}{x^3}$ is the derivative of $\dfrac{1}{x^2}$, not an antiderivative. $\ln(x^2) = 2\ln x$ has derivative $\dfrac2x$. $\dfrac1x$ has derivative $-\dfrac{1}{x^2}$: the sign is wrong.

? Let $f$ be continuous on $\R$ and $A(x) = \displaystyle\int_2^x f(t)\,dt$. Then $A'(x)$ is
- [ ] $f(x) - f(2)$
- [ ] $f'(x)$
- [x] $f(x)$
- [ ] $f(2)$
> By Part 1 of the Fundamental Theorem, the derivative of the area function is the integrand at the upper limit: $f(x)$. The lower limit 2 only shifts $A$ by a constant, so it does not appear in $A'$; $f(x) - f(2)$ and $f(2)$ wrongly bring it in. $f'(x)$ differentiates once too often.

? $\dfrac{d}{dx}\displaystyle\int_0^{x^3} \cos t\,dt$ equals
- [x] $3x^2\cos(x^3)$
- [ ] $\cos(x^3)$
- [ ] $\sin(x^3)$
- [ ] $3x^2\cos x$
> With $u(x) = x^3$, Theorem 10.3 gives $\cos\big(u(x)\big)\,u'(x) = 3x^2\cos(x^3)$. $\cos(x^3)$ forgets the factor $u'(x) = 3x^2$. $\sin(x^3)$ is the integral itself, $\sin(x^3) - \sin 0$, not its derivative. $3x^2\cos x$ puts $x$ instead of $x^3$ into the cosine.

? $\displaystyle\int_1^3 3x^2\,dx$ equals
- [ ] $12$
- [ ] $27$
- [ ] $28$
- [x] $26$
> $x^3$ is an antiderivative, so the integral is $3^3 - 1^3 = 27 - 1 = 26$. 27 forgets to subtract $F(1)$, and 28 adds it. 12 is $\big[6x\big]_1^3 = 18 - 6$, which uses the derivative of $3x^2$ instead of an antiderivative.

? A particle moves along a line with velocity $v(t) = t - 2$ metres per second for $0 \le t \le 4$. How far does it travel?
- [ ] 0 m
- [ ] 2 m
- [x] 4 m
- [ ] 8 m
> The speed $\abs{t - 2}$ bounds two triangles, each with base 2 and height 2, so area 2: the distance is $2 + 2 = 4$ m. 0 m is the displacement, $\int_0^4 (t - 2)\,dt$: the particle goes 2 m backwards and 2 m forwards and ends where it started. 2 m counts only one of the two stretches, and 8 m is $\int_0^4 t\,dt$, which leaves out the $-2$.

? With $u = x^2 + 1$, the integral $\displaystyle\int_0^1 x(x^2 + 1)^3\,dx$ becomes
- [x] $\dfrac12\displaystyle\int_1^2 u^3\,du$
- [ ] $\displaystyle\int_1^2 u^3\,du$
- [ ] $\dfrac12\displaystyle\int_0^1 u^3\,du$
- [ ] $\displaystyle\int_0^1 u^3\,du$
> $du = 2x\,dx$, so $x\,dx = \tfrac12\,du$; and the limits change with the variable: $x = 0$ gives $u = 1$ and $x = 1$ gives $u = 2$. So the integral is $\tfrac12\int_1^2 u^3\,du = \tfrac{15}{8}$. The other options forget the factor $\tfrac12$, or keep the old limits 0 and 1, or both.

? Integrating $\sin x\cos x$ with $u = \cos x$, you get $-\tfrac12\cos^2 x + C$; SymPy prints `sin(x)**2/2`. Which is true?
- [ ] Your answer is wrong, and SymPy's is right
- [ ] SymPy's answer is wrong, because it has no $+\,C$
- [ ] Both are wrong, because they are different functions
- [x] Both are right: they differ by the constant $\tfrac12$
> $\tfrac12\sin^2 x - \big(-\tfrac12\cos^2 x\big) = \tfrac12(\sin^2 x + \cos^2 x) = \tfrac12$, a constant, and antiderivatives on an interval may differ by a constant (Theorem 10.1); differentiating either gives $\sin x\cos x$. SymPy leaves out "$+\,C$" by convention, which does not make its answer wrong, and two different functions can both be antiderivatives of the same function.

? $\displaystyle\int_{-1}^1 (x^3 + 3x^2)\,dx$ equals
- [ ] $0$
- [x] $2$
- [ ] $4$
- [ ] $1$
> $x^3$ is odd, so its integral over $[-1, 1]$ is 0; $3x^2$ is even, so its integral is $2\int_0^1 3x^2\,dx = 2\big[x^3\big]_0^1 = 2$. The total is 2. 0 treats the whole integrand as odd; 1 forgets to double; 4 doubles twice.
```

```check
antideriv(-1/xp, 1/xp**2, xp); same(diff(1/xp**2, xp), -2/xp**3); same(diff(log(xp**2), xp), 2/xp); same(diff(1/xp, xp), -1/xp**2)
same(diff(Integral(fF(t), (t, 2, x)), x), fF(x))
same(diff(Integral(cos(t), (t, 0, x**3)), x), 3*x**2*cos(x**3)); same(integrate(cos(t), (t, 0, x**3)), sin(x**3))
same(integrate(3*x**2, (x, 1, 3)), 26); same(6*3 - 6*1, 12)
same(integrate(t - 2, (t, 0, 4)), 0); same(integrate(Abs(tr - 2), (tr, 0, 4)), 4); same(integrate(t, (t, 0, 4)), 8)
same(integrate(2 - t, (t, 0, 2)) + integrate(t - 2, (t, 2, 4)), 4); same(Rational(1, 2)*2*2, 2)          # the two triangles
steps(Integral(x*(x**2 + 1)**3, (x, 0, 1)), Rational(1, 2)*Integral(u**3, (u, 1, 2)), Rational(15, 8))
same(sin(x)**2/2 - (-cos(x)**2/2), Rational(1, 2))
same(integrate(x**3 + 3*x**2, (x, -1, 1)), 2); same(integrate(x**3, (x, -1, 1)), 0); same(2*integrate(3*x**2, (x, 0, 1)), 2)
```
