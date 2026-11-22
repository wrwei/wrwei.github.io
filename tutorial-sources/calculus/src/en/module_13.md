---
title: Differential equations
part: 3
lead: Write down the equations that describe growth, cooling, falling and mixing, and read their solutions from a picture before you solve anything. Then compute solutions step by step with Euler's method, solve the main kinds of equation exactly, from separable and linear equations to the vibrations of a spring, and check every answer by substituting it back.
minutes: 270
needs: Modules 1 to 12, especially the rules of differentiation (Modules 4 to 6) and the techniques of integration (Modules 10 and 11)
goals:
  - Explain what a differential equation, its order and its solutions are, and check a solution by substituting it
  - Model growth, cooling, a falling body and a mixing tank with differential equations
  - Read direction fields, find equilibrium solutions and decide whether they are stable
  - Approximate solutions with Euler's method, and explain why its error is proportional to the step size
  - Solve separable, logistic and first-order linear equations, and second-order linear equations with constant coefficients
  - Solve and check differential equations with SymPy, and numerically
---

## What a differential equation is {#what}

[Section 1.3](module_01_EN.html#functions) dropped a ball and gave the distance it falls in $t$ seconds: $s(t) = 4.9t^2$ metres. Physics does not hand you that formula. What it gives is a statement about rates: near the Earth's surface, if air resistance is negligible, a falling body has the constant acceleration $g \approx 9.8$ m/s². In symbols,

$$s''(t) = 9.8.$$

This is an equation for an unknown function, $s$, and it involves a derivative of $s$. Integrating twice (Module 10) gives $s'(t) = 9.8t + C_1$ and $s(t) = 4.9t^2 + C_1t + C_2$. A ball dropped from rest has $s(0) = 0$ and $s'(0) = 0$, so $C_2 = 0$ and $C_1 = 0$: $s(t) = 4.9t^2$, the formula of Module 1.

```check
rounds(Rational(980665, 100000), '9.8')          # standard gravity is 9.80665 m/s^2
C1, C2 = symbols('C1 C2')
s13 = Rational(49, 10)*t**2 + C1*t + C2
same(diff(s13, t, 2), Rational(98, 10)); same(diff(s13, t), Rational(98, 10)*t + C1)
same(solve([s13.subs(t, 0), diff(s13, t).subs(t, 0)], [C1, C2]), {C1: 0, C2: 0})
```

Module 6 met another such equation, $y' = ky$, the law of exponential growth and decay, and checked that $y = Ce^{kt}$ satisfies it. Most laws of science are statements about rates of change: Newton's laws of motion, the laws of cooling and of radioactive decay, the laws of electric circuits. Their natural form is an equation like these two, and this module is about finding the functions they describe.

::: definition Differential equation
A **differential equation** is an equation that involves an unknown function and one or more of its derivatives. Its **order** is the order of the highest derivative in it.
:::

So $y' = ky$ and $y' = t - y$ have order 1, and $s'' = 9.8$ and $mx'' + cx' + kx = 0$ (a vibrating spring, Section 13.8) have order 2. In this module the unknown is a function of one variable, usually time $t$; such equations are called **ordinary** differential equations. Equations for functions of several variables, with partial derivatives (Module 17), are partial differential equations, and beyond this course. Following custom, the equations write $y$ for $y(t)$ and $y'$ for $dy/dt$: $y' = t - y$ means $y'(t) = t - y(t)$ for every $t$ considered.

::: definition Solution and initial value problem
A **solution** of a differential equation on an open interval $I$ is a function that has the derivatives the equation involves at every point of $I$ and makes the equation true for every $t$ in $I$. A formula, with arbitrary constants, that gives every solution is the **general solution**; any one solution is a **particular solution**. An **initial value problem** asks for the solution that also satisfies **initial conditions** at a time $t_0$: $y(t_0) = y_0$ for a first-order equation, and $y(t_0) = y_0$ and $y'(t_0) = v_0$ for a second-order one.
:::

$t_0$ and $y_0$ are read "t nought" and "y nought". To check that a function is a solution, substitute it: compute its derivatives, put everything into the equation, and see that the two sides agree for every $t$.

::: example Checking a solution
Show that $y = t - 1 + Ce^{-t}$ is a solution of $y' = t - y$ for every constant $C$, and find the solution with $y(0) = 1$.

Differentiate: $y' = 1 - Ce^{-t}$. The right side of the equation is

$$\begin{aligned} t - y &= t - \big(t - 1 + Ce^{-t}\big) \\ &= 1 - Ce^{-t}. \end{aligned}$$

The two sides agree for every $t$, so every function of the family is a solution on $(-\infty, \infty)$. For the initial condition, $y(0) = 0 - 1 + C = C - 1$, which is 1 when $C = 2$. The solution is

$$y = t - 1 + 2e^{-t}.$$

Section 13.7 shows that the family contains every solution: it is the general solution.

```check
yC = t - 1 + c*exp(-t)                      # c stands for C
same(diff(yC, t), 1 - c*exp(-t)); steps(t - yC, 1 - c*exp(-t)); same(diff(yC, t) - (t - yC), 0)
same(yC.subs(t, 0), c - 1); same(solve(Eq(yC.subs(t, 0), 1), c), [2])
y131 = t - 1 + 2*exp(-t)
yf = Function('y')
holds(checkodesol(Eq(yf(t).diff(t), t - yf(t)), Eq(yf(t), y131))[0]); same(y131.subs(t, 0), 1)
```
:::

::: example A second-order equation
Show that $x = \cos 3t$ and $x = \sin 3t$ are solutions of $x'' + 9x = 0$, and find the solution with $x(0) = 2$ and $x'(0) = 3$.

For $x = \cos 3t$, the chain rule gives $x' = -3\sin 3t$ and $x'' = -9\cos 3t$, so $x'' + 9x = -9\cos 3t + 9\cos 3t = 0$. For $x = \sin 3t$, $x'' = -9\sin 3t$, and again $x'' + 9x = 0$. The same holds for $x = C_1\cos 3t + C_2\sin 3t$, whatever the constants $C_1$ and $C_2$: its second derivative is $-9x$. Now fit the two conditions. $x(0) = C_1$, so $C_1 = 2$. And

$$x'(t) = -3C_1\sin 3t + 3C_2\cos 3t,$$

so $x'(0) = 3C_2 = 3$ and $C_2 = 1$. The solution is $x = 2\cos 3t + \sin 3t$. A second-order equation takes two conditions, and its solutions here have two constants; Section 13.8 shows that this is no accident.

```check
for xs_ in (cos(3*t), sin(3*t)):
    same(diff(xs_, t, 2) + 9*xs_, 0)
x2_ = C1*cos(3*t) + C2*sin(3*t)
same(diff(x2_, t, 2), -9*x2_); same(diff(x2_, t), -3*C1*sin(3*t) + 3*C2*cos(3*t))
same(solve([x2_.subs(t, 0) - 2, diff(x2_, t).subs(t, 0) - 3], [C1, C2]), {C1: 2, C2: 1})
same(diff(2*cos(3*t) + sin(3*t), t, 2) + 9*(2*cos(3*t) + sin(3*t)), 0)
```
:::

::: pitfall
A solution must satisfy the equation at every $t$ of an interval, not at a few points. The function $y = t^2$ is not a solution of $y' = 2y$: here $y' = 2t$ and $2y = 2t^2$, which agree at $t = 0$ and at $t = 1$, but at $t = 2$ they are 4 and 8.

```check
same((2*t).subs(t, 0), (2*t**2).subs(t, 0)); same((2*t).subs(t, 1), (2*t**2).subs(t, 1))
same((2*t).subs(t, 2), 4); same((2*t**2).subs(t, 2), 8)
```
:::

### When there is exactly one solution {#existence}

In Example 13.1 exactly one function of the family has $y(0) = 1$. For first-order equations written as $y' = F(t, y)$, exactly one solution through a given point is the usual situation, and a theorem says when it is guaranteed. It needs one new piece of notation: $F_y$, read "F sub y", denotes the derivative of $F(t, y)$ with respect to $y$, with $t$ held fixed as if it were a constant. For $F(t, y) = t - y^2$, $F_y = -2y$. (This is a **partial derivative**, the subject of Module 17.)

```check
same(diff(t - y**2, y), -2*y)
```

::: theorem Existence and uniqueness
Suppose that $F$ and $F_y$ are continuous on an open rectangle $R$, the set of points $(t, y)$ with $a < t < b$ and $c < y < d$, that contains the point $(t_0, y_0)$. The ends $a$, $b$, $c$ and $d$ may be infinite, so $R$ may be the whole plane. Then the initial value problem

$$y' = F(t, y), \qquad y(t_0) = y_0$$

has a solution on some open interval containing $t_0$, and only one: two solutions of the problem whose graphs lie in $R$ agree on every open interval containing $t_0$ on which both are defined.
:::

The proof, by a sequence of better and better approximations, belongs to a course on differential equations; this series uses the theorem without proof. Outside $R$ it promises nothing, which is why the graphs must stay in $R$. Two examples show what it promises and what it does not.

- **The interval can be short.** $F(t, y) = y^2$ and $F_y = 2y$ are continuous everywhere, yet the solution of $y' = y^2$, $y(0) = 1$, is $y = \dfrac{1}{1 - t}$ (check: $y' = \dfrac{1}{(1 - t)^2} = y^2$), which exists only for $t < 1$: it **blows up**, growing without bound as $t$ approaches 1. Nothing in the equation warns you.
- **Without the hypothesis on $F_y$, uniqueness can fail.** The problem $y' = 3y^{2/3}$, $y(0) = 0$, has two solutions, $y = 0$ and $y = t^3$: for $y = t^3$, $y' = 3t^2$ and $3y^{2/3} = 3(t^3)^{2/3} = 3t^2$ (with $y^{2/3}$ the square of the real cube root). Here $F_y = 2y^{-1/3}$ is not defined at $y = 0$.

```check
same(diff(1/(1 - t), t), (1/(1 - t))**2); same((1/(1 - t)).subs(t, 0), 1); limit_is(1/(1 - t), t, 1, oo, '-')
tp = symbols('t', positive=True)
same(diff(tp**3, tp), 3*(tp**3)**Rational(2, 3))                       # t > 0
same(3*real_root(Integer(-8), 3)**2, 3*(-2)**2); same(diff(t**3, t).subs(t, -2), 12)   # and t < 0, at t = -2
same(diff(3*y**Rational(2, 3), y), 2*y**Rational(-1, 3))
```

Uniqueness has a picture. Where $F$ and $F_y$ are continuous, the graphs of two different solutions of $y' = F(t, y)$ never cross or touch: at a common point both would solve the same initial value problem, and so they would be the same solution.

## Models {#models}

Most differential equations in science come from one principle: a quantity changes at the rate at which it is created or flows in, minus the rate at which it is destroyed or flows out. Writing that sentence in symbols is **modelling**, and the equation is a **model**: a simplified description, good when its assumptions hold. Four models recur in this module. Their numbers are hypothetical, chosen so that the arithmetic stays clean.

**Growth and decay.** A population with plenty of food and space has births and deaths in proportion to its size, so it changes at a rate proportional to its size: $y' = ky$, where $k$, the birth rate minus the death rate per individual, is positive when births outnumber deaths. The constant $k$ is measured per unit of time: with $t$ in years, $k = 0.02$ per year means that the population grows at 2% of its current size per year. In a radioactive sample, each atom has the same chance of decaying in each second, so the number decaying per second is proportional to the number left: $y' = ky$ with $k < 0$, now per second (Module 6).

**Newton's law of cooling.** A hot drink cools quickly when it is much hotter than the room, and slowly as it approaches room temperature. Newton's law of cooling makes the rate proportional to the difference: if $T(t)$ is the temperature of an object in surroundings at a constant temperature $T_s$, then

$$\frac{dT}{dt} = -k(T - T_s),$$

with a constant $k > 0$ that depends on the object and its surroundings, measured per unit of time (per minute, say). The sign is right: when $T > T_s$ the right side is negative and $T$ falls; when $T < T_s$, $T$ rises. Like every model, this one is an approximation; it ignores, for example, that the outside of a cup cools faster than the inside.

**A falling body with air resistance.** Take downwards as positive. A body of mass $m$ falling at speed $v$ feels its weight $mg$ pulling down and air resistance pushing up. For small, slow bodies the resistance is roughly proportional to the speed, $cv$ with a constant $c > 0$ in kilograms per second (so that $cv$ is a force in newtons), and Newton's second law (mass times acceleration equals the total force) gives

$$m\frac{dv}{dt} = mg - cv.$$

The speed stops changing when $mg - cv = 0$, at the **terminal velocity** $v_T = mg/c$. Suppose $c/m = 0.2$ per second: dividing by $m$, $v' = 9.8 - 0.2v$, and $v_T = 49$ m/s. For large, fast bodies such as a skydiver, a resistance proportional to $v^2$ fits better (Exercise 13.11).

```check
same(solve(Rational(98, 10) - Rational(2, 10)*v, v), [49]); same(Rational(98, 10)/Rational(2, 10), 49)
```

**Mixing.** A stirred tank with liquid flowing in and out:

::: example A mixing tank
A tank holds 100 litres of salt water containing 5 kg of dissolved salt. Salt water with 0.2 kg of salt per litre flows in at 3 litres per minute; the tank is stirred so that it stays uniform, and the mixture flows out at the same rate. Write an initial value problem for the amount of salt, $y(t)$ kg, after $t$ minutes, and find the amount at which it would stop changing.

The volume stays at 100 litres, since 3 litres per minute flow in and 3 flow out. Salt flows in at $0.2 \times 3 = 0.6$ kg per minute. At time $t$ the concentration in the tank is $y/100$ kg per litre, so salt flows out at $\tfrac{y}{100} \times 3 = 0.03y$ kg per minute. Rate of change equals rate in minus rate out:

$$y' = 0.6 - 0.03y, \qquad y(0) = 5.$$

Every term is in kg per minute, as it should be. The amount stops changing when $0.6 - 0.03y = 0$, at $y = 20$ kg; the tank then has the inflow's concentration, $20/100 = 0.2$ kg per litre. The constant function $y = 20$ is a solution, an equilibrium (Section 13.3). Exercise 13.6 finds how $y$ gets there.

```check
same(Rational(2, 10)*3, Rational(6, 10)); same(y/100*3, Rational(3, 100)*y)
same(solve(Rational(6, 10) - Rational(3, 100)*y, y), [20]); same(Rational(20, 100), Rational(2, 10))
```
:::

::: keyidea
Rate of change = rate in − rate out. Before you solve a model, check that every term has the same units, and that the signs push the quantity the way it must move.
:::

::: pitfall
A wrong sign gives a model that runs away. $T' = k(T - T_s)$ with $k > 0$ makes a hot cup of tea heat up further, faster and faster. Ask which way the quantity must move, and check that the equation agrees. And keep units consistent: with flows in litres per minute, $t$ is in minutes, and a rate per hour must be converted first.
:::

## Direction fields and equilibria {#direction-fields}

You can draw the solutions of $y' = F(t, y)$ before you solve it. At every point $(t, y)$ the equation tells you the slope that a solution through that point must have. For $y' = t - y$, the slope at $(0, 1)$ is $0 - 1 = -1$; at $(1, 1)$ it is 0; at $(2, 1)$ it is 1. Draw a short segment with that slope at each point of a grid, and the solutions appear as curves that follow the segments (Figure 13.1).

::: definition Direction field
The **direction field**, or slope field, of $y' = F(t, y)$ is the picture with a short line segment of slope $F(t, y)$ drawn at each point $(t, y)$ of a grid. The graph of a solution is tangent, at each of its points, to the direction field there.
:::

::: figure id=fig-13-1
Two direction fields, with solutions drawn through them. Left: $y' = t - y$. Every solution approaches the line $y = t - 1$ (orange), which is itself a solution; the blue curve is the solution through $(0, 1)$ from Example 13.1. Right: $y' = (y - 1)(y - 3)$. The slope depends only on $y$. The constant solutions are $y = 1$ (stable, green) and $y = 3$ (unstable, red): the solutions that start below 3 approach 1, and those that start above 3 grow without bound.
:::

On the left of Figure 13.1 the segments are horizontal along the line $t - y = 0$, that is, $y = t$; more generally the slope is the same number $m$ all along the line $t - y = m$. Curves along which the slope is constant are **isoclines**, and they make direction fields easy to sketch by hand: draw an isocline, and put segments of its slope along it. The isocline for $m = 1$, the line $y = t - 1$, is special: its own slope is 1, the slope that the field asks for along it, so it is a solution, the one with $C = 0$ in Example 13.1. The picture shows every other solution approaching it as $t$ grows, which agrees with the formula $y = t - 1 + Ce^{-t}$: the term $Ce^{-t}$ dies away.

```check
same((t - y).subs(t, 0).subs(y, 1), -1); same((t - y).subs({t: 1, y: 1}), 0); same((t - y).subs({t: 2, y: 1}), 1)
same(diff(t - 1, t), t - (t - 1)); limit_is(c*exp(-t), t, oo, 0)
```

::: example Reading a direction field
For $y' = t - y$: (a) where do solutions increase, and where do they decrease? (b) Where does the solution through $(0, 1)$ have its lowest point?

**(a)** A solution increases where $y' > 0$, that is, where $t - y > 0$: below the line $y = t$. Above that line, solutions decrease. In Figure 13.1 the segments slope upwards below the line $y = t$ and downwards above it.

**(b)** The solution through $(0, 1)$ starts above the line $y = t$, so it decreases at first; its lowest point is where $y' = 0$, on the isocline $y = t$. With the formula $y = t - 1 + 2e^{-t}$ of Example 13.1, that is where $t - 1 + 2e^{-t} = t$, that is, $e^{-t} = \tfrac12$, so $t = \ln 2$, and there $y = t = \ln 2$. The lowest point is $(\ln 2, \ln 2) \approx (0.693, 0.693)$: the bottom of the blue curve in Figure 13.1.

```check
same(solve(Eq(y131, t), t), [log(2)]); same(y131.subs(t, log(2)), log(2)); rounds(log(2), '0.693')
same(diff(y131, t).subs(t, log(2)), 0); holds(diff(y131, t, 2).subs(t, log(2)) > 0)
```
:::

### Equilibria and stability {#equilibria}

When $F$ does not depend on $t$, the equation $y' = f(y)$ is called **autonomous**. Its slope depends only on the height $y$, so its direction field is the same along every horizontal line (Figure 13.1, right). All four models of Section 13.2 are autonomous.

::: definition Equilibrium and stability
An **equilibrium solution** of $y' = f(y)$ is a constant solution $y = y^*$ (read "y star"). Its derivative is 0, so the equilibria are the numbers $y^*$ with $f(y^*) = 0$. An equilibrium is **stable** if every solution that starts close enough to it approaches it as $t \to \infty$, and **unstable** if some solutions that start as close to it as you like move away from it.
:::

Between two neighbouring equilibria, a continuous $f$ has no zero, so it has one sign throughout (by the Intermediate Value Theorem of Module 3). So every solution there moves steadily up if $f > 0$, or steadily down if $f < 0$; and by uniqueness it never crosses an equilibrium. A sketch of the $y$-axis with arrows, up where $f > 0$ and down where $f < 0$, is the equation's **phase line**: it shows at a glance where every solution goes. The derivative of $f$ gives a quick test.

::: theorem A test for stability
Let $f$ have a continuous derivative, and let $f(y^*) = 0$. If $f'(y^*) < 0$, the equilibrium $y^*$ of $y' = f(y)$ is stable; if $f'(y^*) > 0$, it is unstable.
:::

**The idea of the proof.** If $f'(y^*) < 0$, then $f' < 0$ on an interval around $y^*$ (because $f'$ is continuous), so $f$ is decreasing there (Module 8). Since $f(y^*) = 0$, $f$ is positive on the part of that interval below $y^*$ and negative on the part above it: solutions a little below $y^*$ rise towards it, and solutions a little above fall towards it. If $f'(y^*) > 0$ the signs are reversed and solutions move away. That a solution moving towards $y^*$ actually reaches it in the limit, rather than stopping short, takes two more facts: a function that keeps increasing but stays below a bound has a limit (for sequences, this is the Monotone Convergence Theorem of Module 14), and that limit must be a zero of $f$, which on this interval only $y^*$ is. The linear approximation of Module 7 shows the mechanism: near $y^*$, $f(y) \approx f'(y^*)(y - y^*)$, so the distance $u = y - y^*$ obeys $u' \approx f'(y^*)\,u$, exponential decay if $f'(y^*) < 0$ and growth if $f'(y^*) > 0$.

::: example Equilibria of $y' = (y - 1)(y - 3)$
Find the equilibria of $y' = (y - 1)(y - 3)$, decide whether they are stable, and describe the solutions.

Here $f(y) = (y - 1)(y - 3) = y^2 - 4y + 3$, which is 0 at $y = 1$ and $y = 3$: these are the equilibria. Since $f'(y) = 2y - 4$, $f'(1) = -2 < 0$ and $f'(3) = 2 > 0$, so 1 is stable and 3 is unstable.

The phase line confirms it and says more. For $y < 1$ both factors are negative, so $f > 0$ and solutions rise towards 1. For $1 < y < 3$, $f < 0$ and solutions fall towards 1. For $y > 3$, $f > 0$ and solutions rise away from 3, faster and faster: they grow without bound, as in Figure 13.1. So every solution that starts below 3 approaches 1, and every solution that starts above 3 escapes.

```check
f135 = (y - 1)*(y - 3)
same(expand(f135), y**2 - 4*y + 3); same_set(solve(f135, y), [1, 3])
same(diff(f135, y), 2*y - 4); same(diff(f135, y).subs(y, 1), -2); same(diff(f135, y).subs(y, 3), 2)
holds(f135.subs(y, 0) > 0); holds(f135.subs(y, 2) < 0); holds(f135.subs(y, 4) > 0)
```
:::

::: pitfall
An equilibrium is where $f(y) = 0$, not where $f'(y) = 0$; the derivative only decides stability. And when $f'(y^*) = 0$ the test says nothing: $y' = -y^3$, $y' = y^3$ and $y' = y^2$ all have $f'(0) = 0$, yet 0 is stable for the first, unstable for the second, and for the third it attracts the solutions below it and repels those above (so it is unstable). Use the signs of $f$ on each side instead.

```check
for fq_ in (-y**3, y**3, y**2):
    same(diff(fq_, y).subs(y, 0), 0)
holds((-y**3).subs(y, Rational(1, 2)) < 0); holds((-y**3).subs(y, -Rational(1, 2)) > 0)       # towards 0 from both sides
holds((y**3).subs(y, Rational(1, 2)) > 0); holds((y**3).subs(y, -Rational(1, 2)) < 0)         # away from 0 on both sides
holds((y**2).subs(y, -Rational(1, 2)) > 0); holds((y**2).subs(y, Rational(1, 2)) > 0)         # up from below, up and away above
```
:::

The widget at the end of Section 13.4 draws the direction field of five equations, or of one that you type, and the solution through any point you click.

## Euler's method {#euler}

Most differential equations have no solution formula, and for those that have one, a numerical solution is often all that an application needs. The simplest numerical method turns the direction field into an algorithm.

Start at the point $(t_0, y_0)$. The equation gives the slope of the solution there, $F(t_0, y_0)$, so you know the solution's tangent line at that point. Follow the tangent line for a short time $h$, the **step size**. By the linear approximation of [Section 7.2](module_07_EN.html#linear-approximation),

$$y(t_0 + h) \approx y_0 + h\,F(t_0, y_0).$$

Call this value $y_1$, and the new time $t_1 = t_0 + h$. At $(t_1, y_1)$ the equation gives a new slope, $F(t_1, y_1)$; follow it for another step of length $h$, and so on.

::: definition Euler's method
To approximate the solution of $y' = F(t, y)$, $y(t_0) = y_0$, choose a step size $h > 0$ and compute, for $n = 0, 1, 2, \dots$,

$$\begin{aligned} t_{n+1} &= t_n + h, \\ y_{n+1} &= y_n + h\,F(t_n, y_n). \end{aligned}$$

The number $y_n$ is the approximation to $y(t_n)$.
:::

::: example Euler's method by hand
Use Euler's method with $h = 0.5$ to approximate $y(2)$ for $y' = t - y$, $y(0) = 1$, and compare with the exact solution of Example 13.1.

Here $F(t, y) = t - y$, and four steps of 0.5 lead from $t = 0$ to $t = 2$. Each row computes the slope at $(t_n, y_n)$ and takes a step along it, $y_{n+1} = y_n + 0.5 \times \text{slope}$:

| $n$ | $t_n$ | $y_n$ | slope $t_n - y_n$ | $y_{n+1}$ |
|---|---|---|---|---|
| 0 | 0 | 1 | $-1$ | 0.5 |
| 1 | 0.5 | 0.5 | 0 | 0.5 |
| 2 | 1 | 0.5 | 0.5 | 0.75 |
| 3 | 1.5 | 0.75 | 0.75 | 1.125 |
| 4 | 2 | 1.125 | | |

So $y(2) \approx y_4 = 1.125$. The exact value is $y(2) = 2 - 1 + 2e^{-2} = 1 + 2e^{-2} \approx 1.2707$, so the error, the exact value minus the approximation, is about 0.146. Every approximation is too low. The reason is that the solution is concave up ($y'' = 2e^{-t} > 0$; Module 8), and a step along a tangent line of a curve that is concave up ends below the curve. Exercise 13.10 proves that the approximations stay below the solution at every step.

```check
F136 = lambda T, Y: T - Y
ts6, ys6 = [Integer(0)], [Integer(1)]
for _ in range(4):
    ys6.append(ys6[-1] + Rational(1, 2)*F136(ts6[-1], ys6[-1])); ts6.append(ts6[-1] + Rational(1, 2))
same(ts6, [0, Rational(1, 2), 1, Rational(3, 2), 2]); same(ys6, [1, Rational(1, 2), Rational(1, 2), Rational(3, 4), Rational(9, 8)])
same([F136(T, Y) for T, Y in zip(ts6[:4], ys6[:4])], [-1, 0, Rational(1, 2), Rational(3, 4)])
ex2 = y131.subs(t, 2)
same(ex2, 1 + 2*exp(-2)); rounds(ex2, '1.2707'); rounds(ex2 - Rational(9, 8), '0.146')
same(diff(y131, t, 2), 2*exp(-t))
for T_, Y_ in zip(ts6[1:], ys6[1:]):
    holds(y131.subs(t, T_) > Y_)                    # every approximation is below the solution
```
:::

::: figure id=fig-13-2
Euler's method for $y' = t - y$, $y(0) = 1$, on its direction field (light grey). With $h = 0.5$ (orange), the four steps of Example 13.6 end at 1.125; with $h = 0.25$ (green), eight steps end at 1.2002. The exact value is $y(2) = 1 + 2e^{-2} \approx 1.2707$ (blue). Each step follows the slope at its starting point. Halving the step roughly halves the error at $t = 2$, from 0.146 to 0.070.
:::

```check
ys8 = [Integer(1)]; ts8 = [Integer(0)]
for _ in range(8):
    ys8.append(ys8[-1] + Rational(1, 4)*(ts8[-1] - ys8[-1])); ts8.append(ts8[-1] + Rational(1, 4))
same(ts8[-1], 2); rounds(ys8[-1], '1.2002'); rounds(ex2 - ys8[-1], '0.070')
```

### How the error depends on the step {#euler-error}

For $y' = y$, $y(0) = 1$, whose solution is $e^t$, Euler's method is especially transparent. Each step computes $y_{n+1} = y_n + h\,y_n = (1 + h)\,y_n$: it multiplies by $1 + h$. So $y_n = (1 + h)^n$. Reaching $t = 1$ takes $n = 1/h$ steps, so Euler's approximation to $y(1) = e$ is $(1 + h)^{1/h} = \big(1 + \tfrac1n\big)^n$: the compound interest of Module 6, with each step one compounding period. The table halves $h$ again and again; the error is $e - (1 + h)^{1/h}$:

```valuetable
h = 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.001
$(1 + h)^{1/h}$ = (1 + h)**(1/h)
$\text{error}$ = E - (1 + h)**(1/h)
$\text{error}/h$ = (E - (1 + h)**(1/h))/h
digits = 4
---
h | (1 + h)^{1/h} | \text{error} | \text{error}/h
0.5 | 2.25 | 0.4683 | 0.9366
0.25 | 2.441 | 0.2769 | 1.108
0.125 | 2.566 | 0.1525 | 1.220
0.0625 | 2.638 | 0.08035 | 1.286
0.03125 | 2.677 | 0.04129 | 1.321
0.001 | 2.717 | 0.001358 | 1.358
```

Each halving of $h$ roughly halves the error, and the error divided by $h$ settles down, towards $e/2 \approx 1.359$: for small $h$ the error is about $\tfrac{e}{2}h$.

```check
rounds(E/2, '1.359')
for hv_ in (Rational(1, 2), Rational(1, 4), Rational(1, 8), Rational(1, 16)):
    holds(Rational(16, 10) < (E - (1 + hv_)**(1/hv_))/(E - (1 + hv_/2)**(2/hv_)) < Rational(21, 10))   # halving h roughly halves the error
holds(Abs((E - Rational(1001, 1000)**1000)/Rational(1, 1000) - E/2) < Rational(2, 1000))
```

Why proportional to $h$? Each step follows a tangent line, and [Section 7.2](module_07_EN.html#how-good) stated (Module 15 proves it) that over a step of length $h$ the tangent line misses the curve by about $\tfrac{h^2}{2}y''$. So each step makes a new error of order $h^2$. Reaching a fixed time $T$ takes $(T - t_0)/h$ steps, and $(T - t_0)/h$ errors of size about $\text{constant} \times h^2$ add up to about a constant times $h$. Errors made early on are also carried along by the later steps, which can magnify or shrink them; that changes the constant but not the power of $h$. For $y' = y$ on $[0, 1]$, the step at time $t$ makes an error of about $\tfrac{h^2}{2}e^t$, which the equation magnifies by the factor $e^{1-t}$ by the time $t = 1$ (solutions of $y' = y$ spread apart like $e^t$). So each step contributes about $\tfrac{h^2}{2}e$, and the $1/h$ steps add up to $\tfrac{e}{2}h$: the constant in the table.

```check
same(diff(exp(t), t, 2)*h**2/2*exp(1 - t), h**2/2*E); same(h**2/2*E*(1/h), E*h/2)
```

::: keyidea
Euler's method has **order 1**: at a fixed time, its error is about a constant times $h$, that is, $O(h)$ in the notation of [Section 4.7](module_04_EN.html#truncation). Halving $h$ roughly halves the error and doubles the work; one more correct decimal costs about ten times as many steps.
:::

::: deeper A bound for the error of Euler's method
Suppose the solution $y$ of $y' = F(t, y)$, $y(t_0) = y_0$, satisfies $\abs{y''} \le M$ on $[t_0, T]$, and that $\abs{F_y(t, y)} \le L$ for $t_0 \le t \le T$ and every $y$, with $L > 0$. Then the errors $e_n = y(t_n) - y_n$ of Euler's method satisfy, whenever $t_n \le T$,

$$\abs{e_n} \le \frac{Mh}{2L}\Big(e^{L(t_n - t_0)} - 1\Big).$$

The bound is proportional to $h$. Here is why. By the error bound for linear approximation ([Section 7.2](module_07_EN.html#how-good); Module 15 proves it), $y(t_{n+1}) = y(t_n) + h\,y'(t_n) + \tau_n$ with $\abs{\tau_n} \le \tfrac{M}{2}h^2$, and $y'(t_n) = F\big(t_n, y(t_n)\big)$. Subtract $y_{n+1} = y_n + h\,F(t_n, y_n)$:

$$\begin{aligned} e_{n+1} &= e_n + \tau_n \\ &\quad + h\Big[F\big(t_n, y(t_n)\big) - F(t_n, y_n)\Big]. \end{aligned}$$

By the Mean Value Theorem (Module 8), applied to $F(t_n, y)$ as a function of $y$, the bracket is $F_y$ at some point between $y_n$ and $y(t_n)$, times $e_n$; so it is at most $L\abs{e_n}$ in size, and

$$\abs{e_{n+1}} \le (1 + hL)\abs{e_n} + \tfrac{M}{2}h^2.$$

Start from $e_0 = 0$ and apply this $n$ times. With $q = 1 + hL$, and the sum $1 + q + \dots + q^{n-1} = \dfrac{q^n - 1}{q - 1}$ (multiply out $(q - 1)(1 + q + \dots + q^{n-1})$ to see it),

$$\begin{aligned} \abs{e_n} &\le \frac{M}{2}h^2\,\frac{(1 + hL)^n - 1}{hL} \\ &= \frac{Mh}{2L}\Big((1 + hL)^n - 1\Big). \end{aligned}$$

Finally, $1 + hL \le e^{hL}$, because the graph of $e^x$ lies above its tangent line $y = 1 + x$ at 0 (it is concave up, Module 8). So $(1 + hL)^n \le e^{nhL} = e^{L(t_n - t_0)}$.

The bound is often pessimistic. For Example 13.6, $F_y = -1$ gives $L = 1$, and $y'' = 2e^{-t} \le 2$ gives $M = 2$; at $t = 2$ the bound is $(e^2 - 1)h \approx 6.4h$, while the actual error is about $0.27h$. But it proves that the error is $O(h)$.

```check
Fy_ = diff(t - y, y); same(Fy_, -1)
Mb, Lb, hb, en = symbols('M L h e_n', positive=True)
qb = 1 + hb*Lb
nb = symbols('n', integer=True, positive=True)
same(expand((qb - 1)*Sum(qb**k, (k, 0, nb - 1)).doit()), expand(qb**nb - 1))
same(Mb/2*hb**2*(qb**nb - 1)/(hb*Lb), Mb*hb/(2*Lb)*(qb**nb - 1))
same((Mb*hb/(2*Lb)*(exp(Lb*2) - 1)).subs({Mb: 2, Lb: 1}), (exp(2) - 1)*hb); rounds(exp(2) - 1, '6.4')
holds(exp(Rational(1, 3)) > 1 + Rational(1, 3)); holds(exp(Rational(2, 1)) > 3)
```
:::

### Runge–Kutta methods {#rk4}

Euler's method uses one slope per step, the slope at the start. Better methods sample the direction field at several points of each step and average. The most famous is the classical **fourth-order Runge–Kutta method**, called RK4:

$$\begin{aligned} k_1 &= F(t_n, y_n), \\ k_2 &= F\big(t_n + \tfrac{h}{2},\ y_n + \tfrac{h}{2}k_1\big), \\ k_3 &= F\big(t_n + \tfrac{h}{2},\ y_n + \tfrac{h}{2}k_2\big), \\ k_4 &= F(t_n + h,\ y_n + h\,k_3), \\ y_{n+1} &= y_n + \tfrac{h}{6}\big(k_1 + 2k_2 + 2k_3 + k_4\big). \end{aligned}$$

$k_1$ is Euler's slope at the start of the step; $k_2$ and $k_3$ are slopes at the middle of the step, at points reached with $k_1$ and then with $k_2$; $k_4$ is a slope at the end. When $F$ depends on $t$ only, so that the equation is $y' = F(t)$ and the answer is an integral, $k_2 = k_3$ and the step is Simpson's rule (Module 11) for $\int F(t)\,dt$ over the step. When $F$ is smooth, RK4's error at a fixed time is $O(h^4)$: halving $h$ divides it by about 16. Methods of this family, with a step size that the program adjusts as it goes, are standard in numerical software. The `solve_ivp` function of SciPy, a Python library that this series does not install, uses one unless told otherwise: RK45, a Runge–Kutta method of order 5(4). Each of its steps makes two estimates, of orders 5 and 4, and their difference serves to adapt the step size to an error tolerance.

```check
Ft = Function('F')
tn_, hh_ = symbols('t_n h')
simp = hh_/6*(Ft(tn_) + 2*Ft(tn_ + hh_/2) + 2*Ft(tn_ + hh_/2) + Ft(tn_ + hh_))
same(simp, hh_/6*(Ft(tn_) + 4*Ft(tn_ + hh_/2) + Ft(tn_ + hh_)))        # Simpson's rule on [t_n, t_n + h]
same((h/2)**4/h**4, Rational(1, 16))
```

::: compute Euler's method and RK4 in Python
A function for Euler's method, and its errors for $y' = t - y$, $y(0) = 1$ at $t = 2$ as $h$ halves:

```python
import math

def euler(F, t, y, h, n):
    """n steps of Euler's method from (t, y) with step h; returns the last y."""
    for _ in range(n):
        y, t = y + h*F(t, y), t + h
    return y

F = lambda t, y: t - y                 # y' = t - y, y(0) = 1
exact = 1 + 2*math.exp(-2)             # y(2), from Example 13.1
for n in [10, 20, 40, 80]:
    h = 2/n
    err = exact - euler(F, 0, 1, h, n)
    print(f"h = {h:<6} error = {err:.6f}   error/h = {err/h:.4f}")
```

```output
h = 0.2    error = 0.055922   error/h = 0.2796
h = 0.1    error = 0.027517   error/h = 0.2752
h = 0.05   error = 0.013646   error/h = 0.2729
h = 0.025  error = 0.006795   error/h = 0.2718
```

Halving $h$ halves the error, and the error divided by $h$ settles near 0.27. (`y, t = y + h*F(t, y), t + h` updates both variables at once, using the old values on the right.) Now RK4, at the same step sizes:

```python
def rk4(F, t, y, h, n):
    """n steps of the classical Runge-Kutta method; returns the last y."""
    for _ in range(n):
        k1 = F(t, y)
        k2 = F(t + h/2, y + h/2*k1)
        k3 = F(t + h/2, y + h/2*k2)
        k4 = F(t + h, y + h*k3)
        y, t = y + h/6*(k1 + 2*k2 + 2*k3 + k4), t + h
    return y

for n in [10, 20, 40]:
    h = 2/n
    e1, e4 = exact - euler(F, 0, 1, h, n), exact - rk4(F, 0, 1, h, n)
    print(f"h = {h:<5} Euler error = {e1:.2e}   RK4 error = {e4:.2e}")
```

```output
h = 0.2   Euler error = 5.59e-02   RK4 error = -8.53e-06
h = 0.1   Euler error = 2.75e-02   RK4 error = -4.90e-07
h = 0.05  Euler error = 1.36e-02   RK4 error = -2.94e-08
```

RK4's errors are negative because it overshoots slightly, and each halving of $h$ divides them by about 16 (from $8.5 \times 10^{-6}$ to $4.9 \times 10^{-7}$ to $2.9 \times 10^{-8}$). RK4 costs four evaluations of $F$ per step, so compare equal work: RK4 with $h = 0.2$ evaluates $F$ 40 times and is off by about $10^{-5}$; Euler's method with $h = 0.05$ also evaluates $F$ 40 times, and is off by about $10^{-2}$.
:::

```check
import math as _m
def _euler(F_, t_, y_, h_, n_):
    for _ in range(n_):
        y_, t_ = y_ + h_*F_(t_, y_), t_ + h_
    return y_
def _rk4(F_, t_, y_, h_, n_):
    for _ in range(n_):
        k1_ = F_(t_, y_); k2_ = F_(t_ + h_/2, y_ + h_/2*k1_); k3_ = F_(t_ + h_/2, y_ + h_/2*k2_); k4_ = F_(t_ + h_, y_ + h_*k3_)
        y_, t_ = y_ + h_/6*(k1_ + 2*k2_ + 2*k3_ + k4_), t_ + h_
    return y_
_F = lambda T, Y: T - Y
_ex = 1 + 2*_m.exp(-2)
e4s = [_ex - _rk4(_F, 0, 1, 2/n_, n_) for n_ in (10, 20, 40)]
rounds(-e4s[0], '8.5e-6'); rounds(-e4s[1], '4.9e-7'); rounds(-e4s[2], '2.9e-8')
for k_ in range(2):
    holds(15 < e4s[k_]/e4s[k_ + 1] < 18)
holds(abs(e4s[0]) < 1e-5); rounds(_ex - _euler(_F, 0, 1, 0.05, 40), '0.01')
for n_ in (10, 20, 40, 80):
    holds(Rational(27, 100) < (_ex - _euler(_F, 0, 1, 2/n_, n_))/(2/n_) < Rational(28, 100))
rounds(2*exp(-2), '0.27'); rounds((_ex - _euler(_F, 0, 1, 2/80, 80))/(2/80), '0.27')      # the limit of error/h, and its last value
```

::: pitfall
A step that is too large can make Euler's method useless, not merely inaccurate. For $y' = -20y$, $y(0) = 1$, the solution $e^{-20t}$ decays fast. Euler's method computes $y_{n+1} = y_n - 20h\,y_n = (1 - 20h)\,y_n$, so $y_n = (1 - 20h)^n$. With $h = 0.15$ the factor is $-2$, and the approximations $1, -2, 4, -8, \dots$ swing ever more wildly. They decay, as the solution does, only if $\abs{1 - 20h} < 1$, that is, for $h < 0.1$. Equations with such fast-decaying parts are called **stiff**, and numerical software has special methods for them.

```check
same(1 - 20*Rational(15, 100), -2); same([(-2)**k_ for k_ in range(4)], [1, -2, 4, -8])
hpos = symbols('h', positive=True)
same(solve_univariate_inequality(Abs(1 - 20*hpos) < 1, hpos, relational=False), Interval.open(0, Rational(1, 10)))
```
:::

::: widget name=slope-field
Choose an equation, then click the plot, or use the $t_0$ and $y_0$ sliders, to choose a starting point. The blue curve is the solution through it, computed accurately with RK4; the orange dots are Euler's method with step $h$, up to the end time $T$ (dashed line), and the readout compares the two at $T$. With $y' = t - y$ from $(0, 1)$ and $h = 0.5$ you see Example 13.6. Move the $h$ slider one notch at a time: each notch halves $h$, the error roughly halves too, and the error divided by $h$ settles down. Start on the line $y = t - 1$: why is Euler's method exact there? Then try $y' = y$ from $(0, 1)$, which gives the table above, the logistic equation $y' = y(1 - y)$ from several heights, and $y' = t - y^2$ from points below the $t$-axis.
:::

## Separable equations {#separable}

Euler's method gives numbers. Some equations can be solved exactly, with a formula, and the most common kind is the following.

::: definition Separable equation
A first-order differential equation is **separable** if it can be written as

$$y' = g(t)\,h(y),$$

a function of $t$ times a function of $y$.
:::

$y' = ky$, $y' = 2ty^2$, the cooling equation $T' = -k(T - T_s)$ and the equation of the mixing tank are separable. $y' = t - y$ is not: $t - y$ is not a product of a function of $t$ and a function of $y$ (Section 13.7 solves it another way).

The method is quickest in Leibniz notation. Write $y'$ as $\dfrac{dy}{dt}$, move everything that contains $y$ to one side and everything that contains $t$ to the other, as if $dy$ and $dt$ were numbers, and integrate both sides:

$$\begin{aligned} \frac{dy}{dt} &= g(t)h(y), \\ \frac{dy}{h(y)} &= g(t)\,dt, \\ \int\frac{dy}{h(y)} &= \int g(t)\,dt. \end{aligned}$$

Nothing so far allows you to split $\dfrac{dy}{dt}$ like a fraction: it is a single symbol for a limit ([Section 4.2](module_04_EN.html#derivative)). The chain rule is what makes the result right.

::: theorem Separation of variables
Let $g$ be continuous on an open interval $I$, and let $h$ be continuous and never 0 on an open interval $J$. Let $G$ be an antiderivative of $g$ on $I$, and $H$ an antiderivative of $1/h$ on $J$. A differentiable function $y$ on $I$ with values in $J$ is a solution of $y' = g(t)h(y)$ exactly when, for some constant $C$,

$$H\big(y(t)\big) = G(t) + C \quad\text{for every } t \text{ in } I.$$
:::

::: proof
By the [chain rule](module_05_EN.html#chain), the derivative of $H\big(y(t)\big)$ is $H'\big(y(t)\big)\,y'(t) = \dfrac{y'(t)}{h\big(y(t)\big)}$. Since $h\big(y(t)\big) \ne 0$, the equation $y' = g(t)h(y)$ holds at $t$ exactly when $\dfrac{y'(t)}{h(y(t))} = g(t)$, that is, when

$$\frac{d}{dt}\Big[H\big(y(t)\big) - G(t)\Big] = 0.$$

A function whose derivative is 0 at every point of an interval is constant there (a consequence of the Mean Value Theorem, Module 8), and a constant has derivative 0. So $y$ is a solution on $I$ exactly when $H\big(y(t)\big) - G(t)$ is a constant $C$.
:::

```check
Hf, Gf, yy = Function('H'), Function('G'), Function('y')
same(diff(Hf(yy(t)) - Gf(t), t), Subs(Derivative(Hf(u), u), u, yy(t))*Derivative(yy(t), t) - Derivative(Gf(t), t))
```

::: keyidea
To solve $y' = g(t)h(y)$:

1. Separate: $\dfrac{dy}{h(y)} = g(t)\,dt$, where $h(y) \ne 0$.
2. Integrate both sides; one constant $C$, on one side, is enough.
3. Solve for $y$ if you can, and use the initial condition to find $C$.
4. Look for constant solutions $y = y^*$ with $h(y^*) = 0$: they are solutions, and step 1 lost them.
:::

When $g$ is continuous and $h$ has a continuous derivative, these steps find every solution. Theorem 13.1 applies, since $F = g(t)h(y)$ and $F_y = g(t)h'(y)$ are continuous: a solution that took a value $y^*$ with $h(y^*) = 0$ at one time would be the constant solution $y^*$. So every other solution keeps $h(y) \ne 0$, and dividing by $h(y)$ is allowed for it. Without the condition on $h'$ this can fail: $y = t^3$ solves $y' = 3y^{2/3}$ (Section 13.1) and passes through 0, a zero of $h(y) = 3y^{2/3}$.

```check
gfn, hfn = Function('g'), Function('h')
same(diff(gfn(t)*hfn(y), y), gfn(t)*Derivative(hfn(y), y))      # F_y = g(t) h'(y)
same(3*Integer(0)**Rational(2, 3), 0); same((t**3).subs(t, 0), 0)  # h(0) = 0, and t^3 passes through 0
```

::: example A solution that blows up
Solve $y' = 2ty^2$ with (a) $y(0) = 1$, (b) $y(0) = -1$, (c) $y(0) = 0$.

Here $g(t) = 2t$ and $h(y) = y^2$, which has a continuous derivative, so, by the paragraph above, the only solution that is ever 0 is the constant solution $y = 0$. The solutions of (a) and (b) are never 0, so you may divide by $y^2$. Separate and integrate:

$$\begin{aligned} \int \frac{dy}{y^2} &= \int 2t\,dt, \\ -\frac1y &= t^2 + C, \\ y &= -\frac{1}{t^2 + C}. \end{aligned}$$

**(a)** $y(0) = -\dfrac1C = 1$ gives $C = -1$, so $y = \dfrac{1}{1 - t^2}$. The formula makes sense for every $t \ne \pm1$, but a solution lives on an interval, and the one containing $t = 0$ is $(-1, 1)$. As $t$ approaches 1 or $-1$, $y$ grows without bound: the solution blows up (Figure 13.3). The parts of the graph with $\abs{t} > 1$ belong to other solutions of the equation, not to this one: nothing connects them to $y(0) = 1$.

**(b)** $y(0) = -\dfrac1C = -1$ gives $C = 1$, so $y = -\dfrac{1}{1 + t^2}$, defined for every $t$.

**(c)** No constant $C$ gives $y(0) = 0$, because $-\dfrac{1}{t^2 + C}$ is never 0. Dividing by $y^2$ assumed that $y \ne 0$. The constant function $y = 0$ satisfies $y' = 0 = 2t \cdot 0^2$, so it is a solution: the one the method lost. By Theorem 13.1 ($F = 2ty^2$ and $F_y = 4ty$ are continuous everywhere) it is the only solution with $y(0) = 0$.

```check
same(integrate(1/y**2, y), -1/y); same(integrate(2*t, t), t**2)
same(solve(Eq(-1/y, t**2 + c), y), [-1/(t**2 + c)])
same(solve(Eq(-1/c, 1), c), [-1]); same(solve(Eq(-1/c, -1), c), [1])
ya = 1/(1 - t**2); yb = -1/(1 + t**2)
for sol_, y0_ in ((ya, 1), (yb, -1)):
    same(diff(sol_, t), 2*t*sol_**2); same(sol_.subs(t, 0), y0_)
holds(checkodesol(Eq(yf(t).diff(t), 2*t*yf(t)**2), Eq(yf(t), ya))[0])
limit_is(ya, t, 1, oo, '-'); limit_is(ya, t, -1, oo, '+')
same(diff(2*t*y**2, y), 4*t*y); same(solve(-1/(t**2 + c), t), [])
```
:::

::: figure id=fig-13-3
Solutions of $y' = 2ty^2$ (Example 13.7) on its direction field. The solution with $y(0) = 1$, $y = 1/(1 - t^2)$ (dark blue), exists only for $-1 < t < 1$; the dotted curves outside belong to other solutions. The solution with $y(0) = \tfrac14$, $y = 1/(4 - t^2)$, lasts until $t = \pm2$; the solution with $y(0) = -1$ (orange) exists for every $t$. The constant solution $y = 0$ (green) is the one that dividing by $y^2$ loses.
:::

```check
same((1/(4 - t**2)).subs(t, 0), Rational(1, 4)); same(diff(1/(4 - t**2), t), 2*t*(1/(4 - t**2))**2)
```

::: pitfall
Two slips with separable equations. First, the constant: from $\ln\abs{y} = kt + C$, the next step is $\abs{y} = e^{C}e^{kt}$, not $y = e^{kt} + C$; a constant added before you exponentiate becomes a factor afterwards. Second, dividing by $h(y)$ loses the solutions where $h(y) = 0$: look for them every time.
:::

### Growth and decay {#growth-decay}

Module 6 checked that $Ce^{kt}$ solves $y' = ky$, and promised that there are no other solutions. Separation finds the solutions that are never 0: $\displaystyle\int\frac{dy}{y} = \int k\,dt$ gives $\ln\abs{y} = kt + C$, so $\abs{y} = e^Ce^{kt}$ and $y = Ae^{kt}$ with $A = \pm e^C$, a constant that is not 0; the lost solution $y = 0$ is the case $A = 0$. But could a solution be 0 at some times and not at others, so that Theorem 13.3 does not apply to it on a whole interval? Theorem 13.1 rules that out, as it does for every separable equation with a continuous $h'$. The next theorem proves it directly, with an argument that never divides by $y$ and does not need Theorem 13.1, which this series does not prove.

::: theorem Exponential growth and decay
Let $k$ be a constant and $I$ an open interval containing $t_0$. A differentiable function $y$ satisfies $y' = ky$ on $I$ exactly when

$$y(t) = y(t_0)\,e^{k(t - t_0)} \quad\text{for every } t \text{ in } I.$$
:::

::: proof
If $y(t) = y(t_0)e^{k(t - t_0)}$, then $y' = ky$ by the chain rule. Conversely, suppose that $y' = ky$ on $I$, and let $w(t) = y(t)e^{-kt}$. By the product rule,

$$\begin{aligned} w' &= y'e^{-kt} - k\,y\,e^{-kt} \\ &= (y' - ky)\,e^{-kt} = 0 \end{aligned}$$

on $I$, so $w$ is constant on $I$ (Module 8): $w(t) = w(t_0)$, that is, $y(t)e^{-kt} = y(t_0)e^{-kt_0}$. Multiply both sides by $e^{kt}$.
:::

```check
yfun = Function('y'); t0s, y0s = symbols('t_0 y_0')
same(diff(yfun(t)*exp(-k*t), t), (Derivative(yfun(t), t) - k*yfun(t))*exp(-k*t))
same(diff(y0s*exp(k*(t - t0s)), t), k*y0s*exp(k*(t - t0s))); same((y0s*exp(k*(t - t0s))).subs(t, t0s), y0s)
same(y0s*exp(-k*t0s)*exp(k*t), y0s*exp(k*(t - t0s)))
```

So a quantity whose rate of change is $k$ times its size is $y(t_0)e^{k(t - t_0)}$, and nothing else: it grows exponentially if $k > 0$ and decays if $k < 0$, with doubling time or half-life $\ln 2/\abs{k}$ (Module 6).

### Newton's law of cooling {#cooling}

The cooling equation $T' = -k(T - T_s)$ becomes the decay equation if you measure temperature from $T_s$. Put $u = T - T_s$; since $T_s$ is constant, $u' = T' = -ku$. By Theorem 13.4, $u = u(0)e^{-kt}$, that is,

$$T(t) = T_s + \big(T(0) - T_s\big)e^{-kt}.$$

The difference from the surroundings decays exponentially: the temperature approaches $T_s$, a stable equilibrium, and never quite reaches it. The same shift solves every equation of the form $y' = -k(y - A)$, with constants $k$ and $A$: the falling body, $v' = 9.8 - 0.2v = -0.2(v - 49)$, and the mixing tank, $y' = 0.6 - 0.03y = -0.03(y - 20)$, are two more (Exercise 13.6).

```check
Ts, T0 = symbols('T_s T_0')
Tc = Ts + (T0 - Ts)*exp(-k*t)
same(diff(Tc, t), -k*(Tc - Ts)); same(Tc.subs(t, 0), T0)
same(Rational(98, 10) - Rational(2, 10)*v, -Rational(2, 10)*(v - 49)); same(Rational(6, 10) - Rational(3, 100)*y, -Rational(3, 100)*(y - 20))
```

::: keyidea
For constants $k > 0$ and $A$, the solution of $y' = -k(y - A)$ is $y = A + \big(y(0) - A\big)e^{-kt}$. It approaches the equilibrium $A$ exponentially; in each time $1/k$, called the **time constant**, the distance from $A$ shrinks by the factor $e$.
:::

::: example A cooling cup of tea
Suppose a cup of tea at 90 °C is left in a room at 20 °C, and after 5 minutes it is at 70 °C. Assuming Newton's law of cooling, find $k$, the temperature after 15 minutes, and when the tea reaches 40 °C.

By the formula, $T(t) = 20 + 70e^{-kt}$. At $t = 5$: $70 = 20 + 70e^{-5k}$, so $e^{-5k} = \tfrac{50}{70} = \tfrac57$ and

$$k = \frac{1}{5}\ln\frac75 \approx 0.0673 \text{ per minute}.$$

After 15 minutes, $e^{-15k} = \big(e^{-5k}\big)^3 = \big(\tfrac57\big)^3$, so $T(15) = 20 + 70 \cdot \tfrac{125}{343} \approx 45.5$ °C. For 40 °C, solve $20 + 70e^{-kt} = 40$: $e^{-kt} = \tfrac27$, so

$$t = \frac{\ln(7/2)}{k} = \frac{5\ln 3.5}{\ln 1.4} \approx 18.6 \text{ minutes}.$$

The first 20 degrees took 5 minutes; the next 30 take about 13.6 more. The closer the tea is to room temperature, the more slowly it cools.

```check
kt_ = log(Rational(7, 5))/5
Ttea = 20 + 70*exp(-kt_*t)
same(Ttea.subs(t, 5), 70); rounds(kt_, '0.0673'); same(Rational(50, 70), Rational(5, 7))
same(Ttea.subs(t, 15), 20 + 70*Rational(125, 343)); rounds(Ttea.subs(t, 15), '45.5')
t40 = solve(Eq(Ttea, 40), t)
same(t40, [5*log(Rational(7, 2))/log(Rational(7, 5))]); same(log(Rational(7, 2))/kt_, 5*log(Rational(35, 10))/log(Rational(14, 10)))
rounds(t40[0], '18.6'); rounds(t40[0] - 5, '13.6')
```
:::

## The logistic equation {#logistic}

Exponential growth cannot last. A population that grows at the continuous rate $k = 0.05$ per year, 5% a year, multiplies by $e^{0.05 \cdot 200} = e^{10} \approx 22{,}000$ in two centuries; long before that, food and space run short and growth slows. The simplest model of the slowdown starts from the per-capita growth rate $y'/y$, which is the constant $k$ in exponential growth, and lets it fall in a straight line as the population grows: from a value $r$ when $y$ is small, to 0 when $y$ reaches a level $K$, the **carrying capacity**. So $y'/y = r(1 - y/K)$, that is,

$$y' = r\,y\Big(1 - \frac{y}{K}\Big),$$

with constants $r > 0$, measured per unit of time like $k$, and $K > 0$, in the units of $y$ (a number of animals, say). This is the **logistic equation**.

```check
rounds(exp(10)/1000, '22'); same(Rational(5, 100)*200, 10)
```

It is autonomous. Its right side $f(y) = ry(1 - y/K)$ is 0 at $y = 0$ and $y = K$, and $f'(y) = r - 2ry/K$, so $f'(0) = r > 0$ and $f'(K) = -r < 0$: by Theorem 13.2, 0 is unstable and $K$ is stable. Between 0 and $K$, $f > 0$ and solutions rise towards $K$; above $K$, $f < 0$ and they fall towards it. A small population grows almost exponentially at first, since $y' \approx ry$ when $y$ is small compared with $K$; every positive population approaches $K$.

```check
rp, Kp = symbols('r K', positive=True)
flog = rp*y*(1 - y/Kp)
same_set(solve(flog, y), [0, Kp]); same(diff(flog, y), rp - 2*rp*y/Kp)
same(diff(flog, y).subs(y, 0), rp); same(diff(flog, y).subs(y, Kp), -rp)
```

To solve it, take $0 < y_0 < K$, where $y_0 = y(0)$; then $0 < y < K$ for all $t$ (the solution cannot cross the equilibria). Separate:

$$\int\frac{dy}{y(1 - y/K)} = \int r\,dt.$$

By partial fractions (Module 11),

$$\frac{1}{y(1 - y/K)} = \frac{K}{y(K - y)} = \frac{1}{y} + \frac{1}{K - y},$$

and since $\displaystyle\int\frac{dy}{K - y} = -\ln\abs{K - y}$, the left side is $\ln y - \ln(K - y) = \ln\dfrac{y}{K - y}$ (both $y$ and $K - y$ are positive). So $\ln\dfrac{y}{K - y} = rt + C$, and

$$\frac{y}{K - y} = Ae^{rt}, \qquad A = e^C = \frac{y_0}{K - y_0},$$

the value of $A$ coming from $t = 0$. Solve for $y$: $y = Ae^{rt}(K - y)$, so $y\big(1 + Ae^{rt}\big) = KAe^{rt}$; divide by $1 + Ae^{rt}$, and then divide the top and the bottom by $Ae^{rt}$:

$$y(t) = \frac{K}{1 + \dfrac{K - y_0}{y_0}\,e^{-rt}}.$$

Substituting into the equation confirms it, and shows that the same formula is the solution for every $y_0 > 0$, also above $K$; it is defined for all $t \ge 0$. Its graph, from a small $y_0$, is the S-shaped **logistic curve** (Figure 13.4).

```check
y0p = symbols('y_0', positive=True)
same(apart(1/(y*(1 - y/Kp)), y), 1/y - 1/(y - Kp)); same(1/y + 1/(Kp - y), Kp/(y*(Kp - y)))
same(integrate(1/(Kp - y), y).diff(y), 1/(Kp - y)); antideriv(-log(Kp - y), 1/(Kp - y), y)
same(solve(Eq(y/(Kp - y), c*exp(rp*t)), y), [Kp*c*exp(rp*t)/(c*exp(rp*t) + 1)])
ylog = Kp/(1 + (Kp - y0p)/y0p*exp(-rp*t))
same(simplify(Kp*c*exp(rp*t)/(c*exp(rp*t) + 1) - ylog.subs(y0p, Kp*c/(1 + c))), 0)
same(diff(ylog, t), rp*ylog*(1 - ylog/Kp)); same(ylog.subs(t, 0), y0p)
holds(checkodesol(Eq(yf(t).diff(t), rp*yf(t)*(1 - yf(t)/Kp)), Eq(yf(t), ylog))[0])
den_ = 1 + (Kp - y0p)/y0p*exp(-rp*t)                       # the denominator: K/y0 > 0 at t = 0, and for y0 > K
same(den_.subs(t, 0), Kp/y0p); same(diff(den_, t), rp*(y0p - Kp)/y0p*exp(-rp*t))   # it increases, so it stays positive for t >= 0
```

**The fastest growth.** The rate $y' = ry(1 - y/K)$ is a downward parabola in $y$, largest at $y = K/2$, where it is $rK/4$. By the chain rule $y'' = f'(y)\,y' = r\big(1 - \tfrac{2y}{K}\big)y'$, which changes sign as $y$ passes $K/2$: a logistic curve that starts below $K/2$ has its inflection point at half the carrying capacity, at the time $t^*$ with $y(t^*) = K/2$, that is, $\dfrac{K - y_0}{y_0}e^{-rt^*} = 1$, or

$$t^* = \frac1r\ln\frac{K - y_0}{y_0}.$$

```check
same(solve(diff(flog, y), y), [Kp/2]); same(flog.subs(y, Kp/2), rp*Kp/4)
same(simplify(diff(ylog, t, 2) - rp*(1 - 2*ylog/Kp)*diff(ylog, t)), 0)
tstar = log((Kp - y0p)/y0p)/rp
same(simplify(ylog.subs(t, tstar)), Kp/2)
```

::: example Fish in a lake
Suppose a lake can support $K = 10{,}000$ fish of some species, 1000 are introduced, and the population follows the logistic equation with $r = 0.5$ per year. Find the population after 10 years, when it reaches half the carrying capacity, and its fastest rate of growth.

Here $\dfrac{K - y_0}{y_0} = \dfrac{9000}{1000} = 9$, so

$$y(t) = \frac{10{,}000}{1 + 9e^{-0.5t}}.$$

After 10 years, $y(10) = \dfrac{10{,}000}{1 + 9e^{-5}} \approx 9428$ fish. Half the capacity is reached when $9e^{-0.5t} = 1$, at $t = 2\ln 9 \approx 4.39$ years, and then the population grows fastest, at $rK/4 = 0.5 \cdot 10{,}000/4 = 1250$ fish per year.

```check
yfish = 10000/(1 + 9*exp(-t/2))
same(yfish, ylog.subs({Kp: 10000, y0p: 1000, rp: Rational(1, 2)})); rounds(yfish.subs(t, 10), '9428')
same(solve(Eq(yfish, 5000), t), [2*log(9)]); rounds(2*log(9), '4.39')
same(diff(yfish, t).subs(t, 2*log(9)), 1250); same(Rational(1, 2)*10000/4, 1250)
```
:::

::: figure id=fig-13-4
Logistic growth $y' = 0.5y(1 - y/10{,}000)$, with $y$ in thousands. From $y(0) = 1000$ (dark blue, Example 13.9) the population follows an S-curve, with its inflection point at $y = K/2$ after $2\ln 9 \approx 4.39$ years. From 100 the S-curve comes later; from 6000, above $K/2$, the curve has no inflection; from 15,000, above $K$, the population falls towards $K$.
:::

In machine learning, the logistic curve with $r = 1$, $K = 1$ and $y(0) = \tfrac12$, the function $\sigma(t) = \dfrac{1}{1 + e^{-t}}$ (read "sigma of t"), is called the **sigmoid**. Because it solves $y' = y(1 - y)$, its derivative is $\sigma' = \sigma(1 - \sigma)$: once a program has computed $\sigma(t)$, the derivative costs one subtraction and one multiplication.

```check
sig = 1/(1 + exp(-t))
same(diff(sig, t), sig*(1 - sig)); same(sig.subs(t, 0), Rational(1, 2))
same(sig, ylog.subs({Kp: 1, rp: 1, y0p: Rational(1, 2)}))
```

::: pitfall
Watch the sign in $\displaystyle\int\frac{dy}{K - y} = -\ln\abs{K - y} + C$: by the chain rule, the derivative of $\ln\abs{K - y}$ is $-\dfrac{1}{K - y}$. With the wrong sign you get $\ln\big(y(K - y)\big) = rt + C$, whose solutions do not level off at $K$; the direction field, where every solution approaches $K$, catches the mistake.

```check
same(diff(log(Kp - y), y), -1/(Kp - y))
```
:::

## First-order linear equations {#linear}

Example 13.1 checked that $y = t - 1 + Ce^{-t}$ solves $y' = t - y$. But how would you find that formula, and how do you know that there are no other solutions? The equation is not separable. It belongs to another family, with a method of its own.

::: definition First-order linear equation
A first-order differential equation is **linear** if it can be written in the **standard form**

$$y' + p(t)\,y = q(t),$$

where $p$ and $q$ are functions of $t$ alone.
:::

"Linear" refers to $y$ and $y'$: each appears to the first power, not multiplied by the other and not inside another function. $y' = t - y$ is linear, with standard form $y' + y = t$, so $p(t) = 1$ and $q(t) = t$; so are the equations of cooling, of the falling body and of the mixing tank. $y' = 2ty^2$ and the logistic equation are not.

The left side $y' + py$ looks almost like the result of the product rule. Multiply the equation by a function $\mu(t)$ (read "mu of t"), still to be chosen: $\mu y' + \mu p\,y = \mu q$. If $\mu' = \mu p$, the left side is exactly $(\mu y)' = \mu y' + \mu' y$. The function $\mu = e^{P(t)}$, with $P$ an antiderivative of $p$, does this: by the chain rule, $\mu' = e^{P}P' = \mu p$. Then the equation says $(\mu y)' = \mu q$, and integrating gives $\mu y$.

::: theorem First-order linear equations
Let $p$ and $q$ be continuous on an open interval $I$. Let $P$ be an antiderivative of $p$ on $I$, let $\mu = e^{P}$, the **integrating factor**, and let $R$ be an antiderivative of $\mu q$ on $I$. Then the solutions of $y' + p(t)y = q(t)$ on $I$ are exactly the functions

$$y = \frac{R(t) + C}{\mu(t)}, \qquad C \text{ a constant}.$$

For every $t_0$ in $I$ and every number $y_0$, exactly one of them satisfies $y(t_0) = y_0$, and it is defined on the whole of $I$.
:::

::: proof
The antiderivatives $P$ and $R$ exist because $p$ and $\mu q$ are continuous (the Fundamental Theorem of Calculus, Module 10). The function $\mu$ is positive, and $\mu' = p\mu$ by the chain rule. For any differentiable $y$ on $I$, the product rule gives $(\mu y)' = \mu y' + p\mu y = \mu(y' + py)$. Since $\mu \ne 0$, $y$ is a solution on $I$ exactly when $(\mu y)' = \mu q = R'$, that is, when $(\mu y - R)' = 0$, that is, when $\mu y - R$ is a constant $C$ on $I$ (Module 8). This is the formula. The condition $y(t_0) = y_0$ holds for exactly one constant, $C = \mu(t_0)y_0 - R(t_0)$.
:::

```check
pf, qf, Pf = Function('p'), Function('q'), Function('P')
muf = exp(Pf(t))
same(diff(muf, t).subs(Derivative(Pf(t), t), pf(t)), pf(t)*muf)
same(diff(muf*yfun(t), t).subs(Derivative(Pf(t), t), pf(t)), muf*(Derivative(yfun(t), t) + pf(t)*yfun(t)))
Rf, C0 = Function('R'), symbols('C')
same(solve(Eq((Rf(t0s) + C0)/exp(Pf(t0s)), y0s), C0), [exp(Pf(t0s))*y0s - Rf(t0s)])
```

Compare Theorem 13.1: for a linear equation, the solution exists on the whole interval where $p$ and $q$ are continuous. A linear equation cannot blow up the way $y = 1/(1 - t^2)$ did.

::: keyidea
To solve $y' + p(t)y = q(t)$:

1. Put the equation in standard form, with $y'$ alone (coefficient 1).
2. Compute $\mu = e^{\int p\,dt}$; any antiderivative will do, so leave out the constant.
3. Multiply the equation by $\mu$: the left side is $(\mu y)'$.
4. Integrate both sides, with a constant $C$, and divide by $\mu$.
:::

::: example Solving $y' = t - y$
Find the general solution of $y' = t - y$.

In standard form, $y' + y = t$, so $p = 1$ and $\mu = e^{t}$. Multiply by $e^t$, and the left side becomes the derivative of a product:

$$\begin{aligned} e^t y' + e^t y &= te^t, \\ \big(e^t y\big)' &= te^t. \end{aligned}$$

Integrate by parts (Module 11), with $u = t$ and $dv = e^t\,dt$: $\displaystyle\int te^t\,dt = te^t - \int e^t\,dt = (t - 1)e^t + C$. So $e^t y = (t - 1)e^t + C$, and

$$y = t - 1 + Ce^{-t}.$$

This is the family of Example 13.1, found rather than guessed, and by Theorem 13.5 there are no other solutions.

```check
same(diff(exp(t)*yfun(t), t), exp(t)*(Derivative(yfun(t), t) + yfun(t)))
steps(Integral(t*exp(t), t), t*exp(t) - Integral(exp(t), t), (t - 1)*exp(t))
antideriv((t - 1)*exp(t), t*exp(t), t)
same(((t - 1)*exp(t) + c)/exp(t), t - 1 + c*exp(-t))
same(dsolve(Eq(yf(t).diff(t), t - yf(t))).rhs.subs('C1', c), t - 1 + c*exp(-t))
```
:::

::: example A tank that fills up
The tank of Example 13.3 starts again, now with 100 litres of pure water and room for 200 litres. Salt water with 0.2 kg of salt per litre flows in at 3 litres per minute, but the mixture flows out at only 2 litres per minute. How much salt is in the tank when it becomes full?

The volume grows by 1 litre per minute, so after $t$ minutes it is $100 + t$ litres, and the tank is full at $t = 100$. The concentration is $\dfrac{y}{100 + t}$, so salt leaves at $\dfrac{2y}{100 + t}$ kg per minute, and

$$y' = 0.6 - \frac{2y}{100 + t}, \qquad y(0) = 0.$$

This equation is linear but not autonomous. In standard form, $y' + \dfrac{2}{100 + t}\,y = 0.6$. For $t > -100$, an antiderivative of $p$ is $2\ln(100 + t)$, so

$$\mu = e^{2\ln(100 + t)} = (100 + t)^2.$$

Then $\big((100 + t)^2y\big)' = 0.6(100 + t)^2$, and integrating, $(100 + t)^2y = 0.2(100 + t)^3 + C$. At $t = 0$: $0 = 0.2 \cdot 10^6 + C$, so $C = -200{,}000$ and

$$y = 0.2(100 + t) - \frac{200{,}000}{(100 + t)^2}.$$

When the tank is full, $y(100) = 40 - \dfrac{200{,}000}{40{,}000} = 35$ kg of salt, a concentration of $35/200 = 0.175$ kg per litre, still below the inflow's 0.2.

```check
p1311 = 2/(100 + t)
same(integrate(p1311, t), 2*log(t + 100)); same(exp(2*log(100 + t)), (100 + t)**2)
antideriv(Rational(1, 5)*(100 + t)**3, Rational(6, 10)*(100 + t)**2, t)
same(solve(Eq(0, Rational(1, 5)*100**3 + c), c), [-200000])
ytank = Rational(1, 5)*(100 + t) - 200000/(100 + t)**2
same(diff(ytank, t), Rational(6, 10) - 2*ytank/(100 + t)); same(ytank.subs(t, 0), 0)
same(ytank.subs(t, 100), 35); same(Rational(35, 200), Rational(175, 1000))
holds(checkodesol(Eq(yf(t).diff(t), Rational(3, 5) - 2*yf(t)/(100 + t)), Eq(yf(t), ytank))[0])
```
:::

::: example Charging a capacitor
In an electric circuit, a resistor of $R$ ohms and a capacitor of $C$ farads are connected in series to a battery of constant voltage $E$ volts. The voltages across the resistor, $Ri$ with current $i = q'$, and across the capacitor, $q/C$ with charge $q$ on the capacitor, add up to the battery's voltage:

$$Rq' + \frac{q}{C} = E.$$

Suppose $R = 10{,}000$ ohms, $C = 100$ microfarads $= 10^{-4}$ farads, $E = 5$ volts, and the capacitor starts uncharged. Find $q(t)$ and the voltage across the capacitor.

Divide by $R$: $q' + \dfrac{q}{RC} = \dfrac{E}{R}$. Here $RC = 10^4 \cdot 10^{-4} = 1$ second and $E/R = 5 \times 10^{-4}$ amperes, so, with $t$ in seconds, $q' + q = 5 \times 10^{-4}$, and $\mu = e^t$. Then $(e^tq)' = 5 \times 10^{-4}e^t$, and $e^tq = 5 \times 10^{-4}e^t + A$, where the constant is called $A$ because $C$ is taken. So $q = 5 \times 10^{-4} + Ae^{-t}$, and $q(0) = 0$ gives $A = -5 \times 10^{-4}$:

$$\begin{aligned} q(t) &= 5 \times 10^{-4}\big(1 - e^{-t}\big) \text{ coulombs}, \\ \frac{q}{C} &= 5\big(1 - e^{-t}\big) \text{ volts}. \end{aligned}$$

After 1 second the capacitor is at $5(1 - e^{-1}) \approx 3.16$ volts, 63% of the way to 5 volts; after 5 seconds, at about 4.97 volts.

```check
Rr, Cc, Ee = 10**4, Rational(1, 10**4), 5
same(Rr*Cc, 1); same(Rational(Ee, Rr), Rational(5, 10**4))
qc = Rational(5, 10**4)*(1 - exp(-t))
same(Rr*diff(qc, t) + qc/Cc, Ee); same(qc.subs(t, 0), 0)
same(solve(Eq(Rational(5, 10**4) + c, 0), c), [-Rational(5, 10**4)])
same(qc/Cc, 5*(1 - exp(-t))); rounds(5*(1 - exp(-1)), '3.16'); rounds(100*(1 - exp(-1)), '63'); rounds(5*(1 - exp(-5)), '4.97')
```
:::

In general the solution is $q = CE\big(1 - e^{-t/(RC)}\big)$: the product $\tau = RC$ (read "tau"), measured in seconds, is the circuit's time constant, as in the key idea of Section 13.5. Such a circuit is the simplest **low-pass filter**: it follows slow changes of its input voltage and smooths out fast ones (Exercise 13.12).

```check
Rs, Cs, Es = symbols('R C E', positive=True)
qg = Cs*Es*(1 - exp(-t/(Rs*Cs)))
same(Rs*diff(qg, t) + qg/Cs, Es); same(qg.subs(t, 0), 0)
```

::: pitfall
Two slips with integrating factors. Compute $\mu$ from the standard form: for $2y' + 4y = 6$, divide by 2 first, so $p = 2$ and $\mu = e^{2t}$, not $e^{4t}$. And divide the constant by $\mu$ too: from $\mu y = R + C$, $y = \dfrac{R}{\mu} + \dfrac{C}{\mu}$. In Example 13.10, forgetting that gives $t - 1 + C$ instead of $t - 1 + Ce^{-t}$, and $y = t - 1 + C$ is not a solution unless $C = 0$.

```check
y2p = Function('w')
same(solve(Eq(2*Derivative(y2p(t), t) + 4*y2p(t), 6), Derivative(y2p(t), t)), [3 - 2*y2p(t)])
same(exp(integrate(2, t)), exp(2*t)); same(diff(exp(2*t)*y2p(t), t), exp(2*t)*(Derivative(y2p(t), t) + 2*y2p(t)))   # mu = e^(2t)
same(diff(t - 1 + c, t) - (t - (t - 1 + c)), c)
```
:::

## Second-order linear equations {#second-order}

Pull a mass on a spring and let go: it moves back and forth, less and less, and comes to rest. Think of a mass of $m$ kilograms on a smooth horizontal table, attached to a spring, and let $x(t)$ be its displacement in metres from the rest position after $t$ seconds, positive when the spring is stretched and negative when it is compressed. Two forces act on it. The spring pulls back with a force $-kx$ proportional to the displacement (**Hooke's law**; the constant $k > 0$, in newtons per metre, is the spring's stiffness). A damper, such as a car's shock absorber, resists the motion with a force $-cx'$ proportional to the velocity, with a **damping constant** $c \ge 0$ in newton-seconds per metre. Mass times acceleration is the total force, so $mx'' = -kx - cx'$, that is,

$$mx'' + cx' + kx = 0.$$

The same equation, with charge in place of displacement, describes an electric circuit with an inductor, a resistor and a capacitor: $Lq'' + Rq' + q/C = 0$.

**No damping.** With $c = 0$ the equation says $x'' = -\tfrac{k}{m}x$: the second derivative is a negative multiple of the function. Example 13.2 suggests what to try: with $\omega = \sqrt{k/m}$ (read "omega"), $(\cos\omega t)'' = -\omega^2\cos\omega t$ and $(\sin\omega t)'' = -\omega^2\sin\omega t$, so $x = C_1\cos\omega t + C_2\sin\omega t$ is a solution. The mass oscillates for ever with period $2\pi/\omega = 2\pi\sqrt{m/k}$: **simple harmonic motion**. A stiffer spring or a lighter mass oscillates faster.

A pendulum of length $\ell$ obeys $\theta'' = -\tfrac{g}{\ell}\sin\theta$, where $\theta$ is its angle from the vertical. For small swings, replacing $\sin\theta$ by $\theta$ (Section 7.2) gives $\theta'' = -\tfrac{g}{\ell}\theta$, the same equation with $\omega = \sqrt{g/\ell}$: the pendulum swings with period $2\pi\sqrt{\ell/g}$, whatever the size of its swings, as long as they stay small.

```check
mp_, kp_ = symbols('m k', positive=True)
w_ = sqrt(kp_/mp_)
xsh = C1*cos(w_*t) + C2*sin(w_*t)
same(mp_*diff(xsh, t, 2) + kp_*xsh, 0); same(2*pi/w_, 2*pi*sqrt(mp_/kp_))
gl_, ell_ = symbols('g ell', positive=True)
thp = C1*cos(sqrt(gl_/ell_)*t) + C2*sin(sqrt(gl_/ell_)*t)
same(diff(thp, t, 2), -gl_/ell_*thp); same(2*pi/sqrt(gl_/ell_), 2*pi*sqrt(ell_/gl_))   # the small-angle pendulum
```

**The general equation.** The spring equation is an instance of

$$ay'' + by' + cy = 0,$$

with constants $a \ne 0$, $b$ and $c$: a second-order **linear homogeneous equation with constant coefficients** ("homogeneous" because the right side is 0). Two facts make it manageable.

::: theorem Superposition
If $y_1$ and $y_2$ are solutions of $ay'' + by' + cy = 0$, then so is $C_1y_1 + C_2y_2$, for all constants $C_1$ and $C_2$.
:::

::: proof
Let $Y = C_1y_1 + C_2y_2$. Derivatives of sums and constant multiples are the sums and constant multiples of the derivatives (Module 4), so $Y' = C_1y_1' + C_2y_2'$ and $Y'' = C_1y_1'' + C_2y_2''$. Collect the terms with $C_1$ and those with $C_2$:

$$\begin{aligned} &aY'' + bY' + cY \\ &\quad= C_1\big(ay_1'' + by_1' + cy_1\big) \\ &\qquad + C_2\big(ay_2'' + by_2' + cy_2\big) \\ &\quad= C_1 \cdot 0 + C_2 \cdot 0 = 0. \end{aligned}$$
:::

::: theorem Existence and uniqueness for $ay'' + by' + cy = 0$
Let $a \ne 0$, $b$ and $c$ be constants. For all numbers $t_0$, $y_0$ and $v_0$, the equation $ay'' + by' + cy = 0$ has a solution with $y(t_0) = y_0$ and $y'(t_0) = v_0$ that is defined for every $t$, and only one: any solution with these two values on an open interval containing $t_0$ agrees with it there.
:::

As with Theorem 13.1, this series uses the theorem without proof, although the formulas of Theorem 13.8 below prove the existence half. It says that a solution is decided by two numbers, the starting position and the starting velocity, which is why two constants appear.

```check
y1f, y2f = Function('y1'), Function('y2')
L_ = lambda Y: a*diff(Y, t, 2) + b*diff(Y, t) + c*Y
same(expand(L_(C1*y1f(t) + C2*y2f(t)) - C1*L_(y1f(t)) - C2*L_(y2f(t))), 0)
```

**Trying exponentials.** Exponentials keep their shape when differentiated, so try $y = e^{rt}$. Then $y' = re^{rt}$ and $y'' = r^2e^{rt}$, and

$$ay'' + by' + cy = \big(ar^2 + br + c\big)e^{rt}.$$

Since $e^{rt}$ is never 0, $y = e^{rt}$ is a solution exactly when

$$ar^2 + br + c = 0,$$

the **characteristic equation** of the differential equation. Its roots are $r = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}$, and the sign of the discriminant $b^2 - 4ac$ decides what the solutions look like.

```check
same(L_(exp(r*t)), (a*r**2 + b*r + c)*exp(r*t))
```

::: theorem Solutions of $ay'' + by' + cy = 0$
Let $a \ne 0$, $b$ and $c$ be constants. Every solution of $ay'' + by' + cy = 0$ has the following form, for some constants $C_1$ and $C_2$, and every function of this form is a solution.

1. If $b^2 - 4ac > 0$, the characteristic equation has two real roots $r_1 \ne r_2$, and $y = C_1e^{r_1t} + C_2e^{r_2t}$.
2. If $b^2 - 4ac = 0$, it has one root $r = -\dfrac{b}{2a}$, and $y = (C_1 + C_2t)\,e^{rt}$.
3. If $b^2 - 4ac < 0$, it has no real roots, and $y = e^{\alpha t}\big(C_1\cos\beta t + C_2\sin\beta t\big)$, where $\alpha = -\dfrac{b}{2a}$ and $\beta = \dfrac{\sqrt{4ac - b^2}}{2a}$ (read "alpha" and "beta").
:::

::: proof
**Each formula is a solution.** By Theorem 13.6 it is enough to check the two functions that each formula combines. In case 1, $e^{r_1t}$ and $e^{r_2t}$ are solutions, as shown above. In case 2, so is $e^{rt}$; for $y = te^{rt}$, the product rule gives $y' = (1 + rt)e^{rt}$ and $y'' = (2r + r^2t)e^{rt}$, so

$$\begin{aligned} &ay'' + by' + cy \\ &\quad= \Big[\big(ar^2 + br + c\big)t + (2ar + b)\Big]e^{rt} \\ &\quad= 0, \end{aligned}$$

because $ar^2 + br + c = 0$ and $2ar + b = 0$ when $r = -b/(2a)$. In case 3, for $y = e^{\alpha t}\cos\beta t$,

$$\begin{aligned} y' &= e^{\alpha t}\big(\alpha\cos\beta t - \beta\sin\beta t\big), \\ y'' &= e^{\alpha t}\big((\alpha^2 - \beta^2)\cos\beta t \\ &\qquad - 2\alpha\beta\sin\beta t\big), \end{aligned}$$

so $ay'' + by' + cy = e^{\alpha t}\big(P\cos\beta t - Q\sin\beta t\big)$, where

$$\begin{aligned} P &= a(\alpha^2 - \beta^2) + b\alpha + c, \\ Q &= (2a\alpha + b)\beta. \end{aligned}$$

Here $2a\alpha + b = 0$, so $Q = 0$; and since $a\alpha^2 = \dfrac{b^2}{4a}$, $a\beta^2 = \dfrac{4ac - b^2}{4a}$ and $b\alpha = -\dfrac{b^2}{2a}$,

$$P = \frac{b^2}{4a} - \frac{4ac - b^2}{4a} - \frac{b^2}{2a} + c = 0.$$

The same calculation works for $e^{\alpha t}\sin\beta t$.

**Every solution has this form.** Let $y$ be any solution, say on an interval that contains 0 (on another interval, use one of its points in place of 0; the algebra is the same, with extra exponential factors). In each case, choose the constants so that the formula has the same value and the same derivative as $y$ at $t = 0$. In case 1 that means $C_1 + C_2 = y(0)$ and $r_1C_1 + r_2C_2 = y'(0)$, which can be solved because $r_1 \ne r_2$; in case 2, $C_1 = y(0)$ and $rC_1 + C_2 = y'(0)$; in case 3, $C_1 = y(0)$ and $\alpha C_1 + \beta C_2 = y'(0)$, which can be solved because $\beta \ne 0$. Then $y$ and the formula solve the same initial value problem, so $y$ agrees with the formula on its interval, by Theorem 13.7.
:::

```check
rr0 = -b/(2*a)
same(L_(t*exp(r*t)), ((a*r**2 + b*r + c)*t + (2*a*r + b))*exp(r*t)); same(2*a*rr0 + b, 0)
same(diff(t*exp(r*t), t), (1 + r*t)*exp(r*t)); same(diff(t*exp(r*t), t, 2), (2*r + r**2*t)*exp(r*t))
al, be = symbols('alpha beta')
yc_ = exp(al*t)*cos(be*t)
same(diff(yc_, t), exp(al*t)*(al*cos(be*t) - be*sin(be*t))); same(diff(yc_, t, 2), exp(al*t)*((al**2 - be**2)*cos(be*t) - 2*al*be*sin(be*t)))
same(L_(yc_), exp(al*t)*((a*(al**2 - be**2) + b*al + c)*cos(be*t) - (2*a*al + b)*be*sin(be*t)))
ap_ = symbols('a', positive=True); bq_, cq_ = symbols('b c', real=True)
al3, be3 = -bq_/(2*ap_), sqrt(4*ap_*cq_ - bq_**2)/(2*ap_)
steps(ap_*(al3**2 - be3**2) + bq_*al3 + cq_, bq_**2/(4*ap_) - (4*ap_*cq_ - bq_**2)/(4*ap_) - bq_**2/(2*ap_) + cq_, 0)
same(2*ap_*al3 + bq_, 0); same(ap_*al3**2, bq_**2/(4*ap_)); same(ap_*be3**2, (4*ap_*cq_ - bq_**2)/(4*ap_)); same(bq_*al3, -bq_**2/(2*ap_))
Lp = lambda Y: ap_*diff(Y, t, 2) + bq_*diff(Y, t) + cq_*Y
same(Lp(exp(al3*t)*sin(be3*t)), 0); same(Lp(exp(al3*t)*cos(be3*t)), 0)
r1_, r2_ = symbols('r1 r2'); u0_, v0_ = symbols('u0 v0')
holds(Matrix([[1, 1], [r1_, r2_]]).det() == r2_ - r1_)
holds(Matrix([[1, 0], [al, be]]).det() == be)
```

In case 3 the characteristic equation has no real roots. In the complex numbers, where $i^2 = -1$, its roots are $\alpha \pm \beta i$, and Module 15 shows, with Euler's formula $e^{i\theta} = \cos\theta + i\sin\theta$, how $e^{(\alpha + \beta i)t}$ produces $e^{\alpha t}\cos\beta t$ and $e^{\alpha t}\sin\beta t$. Here they were checked directly, which is all a proof needs.

**Springs again.** For $mx'' + cx' + kx = 0$ with $m > 0$, $k > 0$ and $c \ge 0$, the discriminant is $c^2 - 4mk$, and the three cases have names:

- **Overdamped**, $c^2 > 4mk$: two negative roots (their sum $-c/m$ is negative and their product $k/m$ positive), so $x$ is a combination of two decaying exponentials and does not oscillate.
- **Critically damped**, $c^2 = 4mk$: $x = (C_1 + C_2t)e^{-ct/(2m)}$, which does not oscillate either.
- **Underdamped**, $c^2 < 4mk$: $x = e^{-ct/(2m)}\big(C_1\cos\beta t + C_2\sin\beta t\big)$ with $\beta = \sqrt{4mk - c^2}/(2m)$, an oscillation whose size shrinks like $e^{-ct/(2m)}$. With $c = 0$ it is simple harmonic motion.

```check
cd_ = symbols('c', nonnegative=True)
rts = solve(mp_*r**2 + cd_*r + kp_, r)
same(rts[0] + rts[1], -cd_/mp_); same(expand(rts[0]*rts[1]), kp_/mp_)
same(solve((mp_*r**2 + cd_*r + kp_).subs(cd_, 2*sqrt(mp_*kp_)), r), [-2*sqrt(mp_*kp_)/(2*mp_)])   # critical: the one root -c/(2m)
same((sqrt(4*a*c - b**2)/(2*a)).subs({a: mp_, b: cd_, c: kp_}, simultaneous=True), sqrt(4*mp_*kp_ - cd_**2)/(2*mp_))
same(-cd_/(2*mp_), (-b/(2*a)).subs({a: mp_, b: cd_}))
```

::: example An underdamped spring
A mass of 1 kg is attached to a spring with $k = 5$ N/m and damping constant $c = 2$ N·s/m. It is pulled 1 m from its rest position and released, so $x(0) = 1$ and $x'(0) = 0$. Find $x(t)$.

The equation is $x'' + 2x' + 5x = 0$, with characteristic equation $r^2 + 2r + 5 = 0$. Its discriminant is $4 - 20 = -16 < 0$, so the motion is underdamped, with $\alpha = -\tfrac22 = -1$ and $\beta = \tfrac{\sqrt{16}}{2} = 2$:

$$x = e^{-t}\big(C_1\cos 2t + C_2\sin 2t\big).$$

$x(0) = C_1 = 1$. By the product rule, $x' = e^{-t}\big((2C_2 - C_1)\cos 2t - (C_2 + 2C_1)\sin 2t\big)$, so $x'(0) = 2C_2 - C_1 = 0$, and $C_2 = \tfrac12$:

$$x = e^{-t}\Big(\cos 2t + \tfrac12\sin 2t\Big).$$

The mass swings through its rest position every $\pi/2$ seconds, a full oscillation every $\pi$ seconds, and the size of the swings shrinks like $e^{-t}$.

```check
x1313 = exp(-t)*(cos(2*t) + sin(2*t)/2)
same(4 - 20, -16); same(solve(r**2 + 2*r + 5, r), [-1 - 2*I, -1 + 2*I])
xg_ = exp(-t)*(C1*cos(2*t) + C2*sin(2*t))
same(diff(xg_, t), exp(-t)*((2*C2 - C1)*cos(2*t) - (C2 + 2*C1)*sin(2*t)))
same(solve([xg_.subs(t, 0) - 1, diff(xg_, t).subs(t, 0)], [C1, C2]), {C1: 1, C2: Rational(1, 2)})
same(diff(x1313, t, 2) + 2*diff(x1313, t) + 5*x1313, 0); same(x1313.subs(t, 0), 1); same(diff(x1313, t).subs(t, 0), 0)
bra = cos(2*t) + sin(2*t)/2
same(bra.subs(t, (pi - atan(2))/2), 0); same(simplify(bra.subs(t, t + pi/2) + bra), 0)   # a zero, and a sign change every pi/2
same(bra.subs(t, t + pi), bra)
```
:::

::: example Critical damping
A mass of 1 kg is attached to a spring with $k = 4$ N/m. Which damping constant makes the motion critically damped? Find the motion from $x(0) = 1$, $x'(0) = 0$ for that damping, and for $c = 10$.

Critical damping needs $c^2 = 4mk = 16$, so $c = 4$. Then $r^2 + 4r + 4 = (r + 2)^2 = 0$, with the single root $r = -2$, and $x = (C_1 + C_2t)e^{-2t}$. $x(0) = C_1 = 1$, and $x'(0) = -2C_1 + C_2 = 0$ gives $C_2 = 2$:

$$x = (1 + 2t)\,e^{-2t}.$$

With $c = 10$ the characteristic equation $r^2 + 10r + 4 = 0$ has the roots $r = -5 \pm \sqrt{21}$, about $-0.417$ and $-9.58$: overdamped. The same initial conditions give $C_1 + C_2 = 1$ and $r_1C_1 + r_2C_2 = 0$, so $C_1 \approx 1.046$ and $C_2 \approx -0.046$. The slowly decaying term $1.046e^{-0.417t}$ dominates: at $t = 3$ the overdamped mass is still at about 0.30 m, while the critically damped one is at $7e^{-6} \approx 0.017$ m. More damping does not mean a faster return. Critical damping is the least damping that prevents oscillation, and in the long run it brings the mass to rest at the fastest exponential rate: here $e^{-2t}$, against $e^{-0.417t}$ for $c = 10$ and $e^{-t/2}$ for $c = 1$ (Figure 13.5).

```check
same(solve(Eq(c**2, 16), c), [-4, 4]); same(expand((r + 2)**2), r**2 + 4*r + 4)
xcr = (1 + 2*t)*exp(-2*t)
same(diff(xcr, t, 2) + 4*diff(xcr, t) + 4*xcr, 0); same(xcr.subs(t, 0), 1); same(diff(xcr, t).subs(t, 0), 0)
r1o, r2o = -5 + sqrt(21), -5 - sqrt(21)
same_set(solve(r**2 + 10*r + 4, r), [r1o, r2o]); rounds(r1o, '-0.417'); rounds(r2o, '-9.58')
C1o, C2o = -r2o/(r1o - r2o), r1o/(r1o - r2o)
same(C1o + C2o, 1); same(r1o*C1o + r2o*C2o, 0); rounds(C1o, '1.046'); rounds(C2o, '-0.046')
xov = C1o*exp(r1o*t) + C2o*exp(r2o*t)
same(diff(xov, t, 2) + 10*diff(xov, t) + 4*xov, 0)
rounds(xov.subs(t, 3), '0.30'); same(xcr.subs(t, 3), 7*exp(-6)); rounds(7*exp(-6), '0.017')
holds(r1o > -2); holds(-Rational(1, 2) > -2)                       # e^(-2t) decays fastest
for cv_ in (5, 10, 20):
    holds((cv_ - sqrt(cv_**2 - 16))/2 < 2)                         # overdamped (m = 1, k = 4): slowest rate below 2
for cv_ in (1, 2, 3):
    holds(Rational(cv_, 2) < 2)                                    # underdamped: rate c/2 below 2
```
:::

::: figure id=fig-13-5
A mass of 1 kg on a spring with $k = 4$ N/m, released from $x = 1$ at rest. Left: with $c = 1$ the motion is underdamped; it oscillates inside the dashed envelope $\pm 1.03e^{-t/2}$. Right: with $c = 4$ (critical damping) and $c = 10$ (overdamped) it does not oscillate, and the critically damped mass comes to rest much sooner.
:::

```check
w15 = sqrt(15)/2
xu1 = exp(-t/2)*(cos(w15*t) + sin(w15*t)/sqrt(15))
same(diff(xu1, t, 2) + diff(xu1, t) + 4*xu1, 0); same(xu1.subs(t, 0), 1); same(diff(xu1, t).subs(t, 0), 0)
same(sqrt(1 + Rational(1, 15)), 4/sqrt(15)); rounds(4/sqrt(15), '1.03')
```

::: pitfall
With a repeated root $r$, the formula $C_1e^{rt} + C_2e^{rt}$ is not the general solution: it is $(C_1 + C_2)e^{rt}$, a single constant times $e^{rt}$, and it cannot meet two initial conditions. For $x'' + 4x' + 4x = 0$ with $x(0) = 1$ and $x'(0) = 0$, it would need $C_1 + C_2 = 1$ and $-2(C_1 + C_2) = 0$ at once. The second solution is $te^{rt}$. And in case 3, $\beta$ is $\sqrt{4ac - b^2}/(2a)$, the square root of the positive number $4ac - b^2$.

```check
same(solve([C1 + C2 - 1, -2*(C1 + C2)], [C1, C2]), [])
```
:::

## Solving with a computer {#computer}

SymPy solves many differential equations exactly with `dsolve`, and `checkodesol` checks a proposed solution by substituting it, as you did by hand in Example 13.1. The unknown must be a SymPy **function**, made with `sp.Function`, not a symbol; derivatives are written with `.diff`, and the equation with `sp.Eq`.

::: compute Exact solutions with dsolve
The equation of Examples 13.1 and 13.10, without and with an initial condition:

```python
import sympy as sp
t = sp.symbols('t')
y = sp.Function('y')                   # an unknown function of t
ode = sp.Eq(y(t).diff(t), t - y(t))    # y' = t - y
print(sp.dsolve(ode))
sol = sp.dsolve(ode, ics={y(0): 1})    # with the initial condition y(0) = 1
print(sol)
print(sp.checkodesol(ode, sol))
```

```output
Eq(y(t), C1*exp(-t) + t - 1)
Eq(y(t), t - 1 + 2*exp(-t))
(True, 0)
```

The first line is the general solution, with SymPy's name `C1` for the constant; the second is the solution of Example 13.1. `checkodesol` substitutes the solution into the equation: `(True, 0)` means that the two sides differ by 0. Next, a logistic equation and the spring of Example 13.13; a condition on a derivative is written with `.diff(t).subs(t, 0)`:

```python
logistic = sp.Eq(y(t).diff(t), y(t)*(1 - y(t)))
print(sp.dsolve(logistic, ics={y(0): sp.Rational(1, 10)}))
x = sp.Function('x')
spring = sp.Eq(x(t).diff(t, 2) + 2*x(t).diff(t) + 5*x(t), 0)
print(sp.dsolve(spring))
print(sp.dsolve(spring, ics={x(0): 1, x(t).diff(t).subs(t, 0): 0}))
```

```output
Eq(y(t), 1/(1 + 9*exp(-t)))
Eq(x(t), (C1*sin(2*t) + C2*cos(2*t))*exp(-t))
Eq(x(t), (sin(2*t)/2 + cos(2*t))*exp(-t))
```

The logistic solution is the formula of Section 13.6 with $K = 1$, $r = 1$ and $y_0 = \tfrac{1}{10}$, so that $(K - y_0)/y_0 = 9$. In the general solution of the spring equation SymPy attaches `C1` to the sine and `C2` to the cosine, the other way round from Theorem 13.8; that changes nothing, since both constants are arbitrary. The last line is the answer of Example 13.13. The most common mistake is to make the unknown a symbol:

```python fails
z = sp.symbols('z')                    # a symbol, not a function
print(sp.dsolve(sp.Eq(z(t).diff(t), z(t))))
```

```output
TypeError: 'Symbol' object is not callable
```

A symbol stands for a number, and `z(t)` asks for "z at t", which makes sense only for a function.
:::

```check
yq = Function('y')
same(dsolve(Eq(yq(t).diff(t), yq(t)*(1 - yq(t))), ics={yq(0): Rational(1, 10)}).rhs, 1/(1 + 9*exp(-t)))
same(ylog.subs({Kp: 1, rp: 1, y0p: Rational(1, 10)}), 1/(1 + 9*exp(-t)))
xq = Function('x')
same(dsolve(xq(t).diff(t, 2) + 2*xq(t).diff(t) + 5*xq(t), ics={xq(0): 1, xq(t).diff(t).subs(t, 0): 0}).rhs, x1313)
```

Not every equation has a formula. For $y' = t - y^2$, one of the equations in the widget, no formula built from the functions of this course solves it (its solutions need special functions, the Airy functions), and `dsolve` does not produce one: SymPy 1.14 stops with an error message. Numerical methods do not care. Run RK4 with a step $h$ and again with $h/2$: the digits that do not change are usually the ones you can trust.

```check
try:
    dsolve(Eq(yf(t).diff(t), t - yf(t)**2)); _gave = True
except Exception:
    _gave = False
holds(not _gave)                                            # dsolve gives no formula (SymPy 1.14 raises an error)
_u = Symbol('A')*airyai(t) + Symbol('B')*airybi(t)
same(diff(diff(_u, t)/_u, t), t - (diff(_u, t)/_u)**2)      # y = u'/u, u made of Airy functions, solves y' = t - y^2
```

::: compute Numerical solutions
The solution of $y' = t - y^2$, $y(0) = 0$, at $t = 2$, with the `rk4` function of Section 13.4 and three step sizes:

```python
def rk4(F, t, y, h, n):
    """n steps of the classical Runge-Kutta method; returns the last y."""
    for _ in range(n):
        k1 = F(t, y)
        k2 = F(t + h/2, y + h/2*k1)
        k3 = F(t + h/2, y + h/2*k2)
        k4 = F(t + h, y + h*k3)
        y, t = y + h/6*(k1 + 2*k2 + 2*k3 + k4), t + h
    return y

F = lambda t, y: t - y**2
for n in [20, 40, 80]:
    print(f"h = {2/n:<6} y(2) = {rk4(F, 0.0, 0.0, 2/n, n):.10f}")
```

```output
h = 0.1    y(2) = 1.1935739964
h = 0.05   y(2) = 1.1935758583
h = 0.025  y(2) = 1.1935759682
```

From $h = 0.05$ on, the values agree to six decimal places: $y(2) \approx 1.193576$. A second-order equation becomes a pair of first-order ones. For the spring of Example 13.13, $x'' = -2x' - 5x$, call the velocity $v = x'$; then $x' = v$ and $v' = -2v - 5x$. The same `rk4` works with a NumPy array $u = (x, v)$ in place of a number, because it only adds and multiplies:

```python
import numpy as np
G = lambda t, u: np.array([u[1], -2*u[1] - 5*u[0]])   # (x, v) -> (x', v')
u = rk4(G, 0.0, np.array([1.0, 0.0]), 0.01, 300)     # 300 steps, to t = 3
exact = np.exp(-3)*(np.cos(6) + np.sin(6)/2)          # Example 13.13, t = 3
print(f"RK4: x(3) = {u[0]:.10f}   exact: {exact:.10f}")
```

```output
RK4: x(3) = 0.0408484252   exact: 0.0408484245
```

The two differ by less than $10^{-9}$. Libraries such as SciPy do the same with more care: their solvers choose and adjust the step automatically to meet an error tolerance that you set.
:::

```check
import mpmath as _mp
_mp.mp.dps = 25
y2r = _mp.odefun(lambda T_, Y_: T_ - Y_**2, 0, 0)(2)
rounds(Float(y2r, 25), '1.193576')
v20, v40, v80 = [_rk4(lambda T_, Y_: T_ - Y_**2, 0.0, 0.0, 2/n_, n_) for n_ in (20, 40, 80)]
rounds(v40, '1.193576'); rounds(v80, '1.193576'); holds(round(v20, 6) != round(v40, 6))
import numpy as _np
G_ = lambda T_, U_: _np.array([U_[1], -2*U_[1] - 5*U_[0]])
u_ = _rk4(G_, 0.0, _np.array([1.0, 0.0]), 0.01, 300)
same(x1313.subs(t, 3), exp(-3)*(cos(6) + sin(6)/2)); rounds(x1313.subs(t, 3), '0.0408484245'); rounds(u_[0], '0.0408484252')
holds(abs(u_[0] - float(N(x1313.subs(t, 3), 20))) < 1e-9)
```

## What you learned {#summary}

- A differential equation relates an unknown function to its derivatives; its order is that of the highest derivative. A solution makes the equation true on an interval, and you check one by substituting it. An initial value problem adds $y(t_0) = y_0$, and $y'(t_0) = v_0$ for a second-order equation.
- If $F$ and $F_y$ are continuous, $y' = F(t, y)$, $y(t_0) = y_0$ has exactly one solution near $t_0$ (Theorem 13.1), although it may blow up after a finite time; without the condition on $F_y$, uniqueness can fail.
- Models come from "rate of change = rate in − rate out": growth and decay $y' = ky$, cooling $T' = -k(T - T_s)$, a falling body $mv' = mg - cv$, and mixing tanks.
- A direction field shows the solutions before you solve anything. For $y' = f(y)$, the equilibria are the zeros of $f$; an equilibrium is stable if $f'(y^*) < 0$ and unstable if $f'(y^*) > 0$, and the signs of $f$ on the phase line tell where every solution goes.
- Euler's method, $y_{n+1} = y_n + h\,F(t_n, y_n)$, follows tangent lines. Its error at a fixed time is $O(h)$, so halving $h$ roughly halves it; for a smooth $F$, RK4's is $O(h^4)$. Too large a step can make Euler's method swing out of control.
- Separable equations $y' = g(t)h(y)$: $\int\frac{dy}{h(y)} = \int g(t)\,dt$, justified by the chain rule; constant solutions with $h(y^*) = 0$ get lost and must be added back. The solutions of $y' = ky$ are exactly $y(t_0)e^{k(t - t_0)}$, and those of $y' = -k(y - A)$ are $A + \big(y(0) - A\big)e^{-kt}$: cooling, falling bodies, tanks and RC circuits.
- The logistic equation $y' = ry(1 - y/K)$ has the S-shaped solution $y = K\big/\big(1 + \frac{K - y_0}{y_0}e^{-rt}\big)$, with carrying capacity $K$ and the fastest growth at $y = K/2$.
- Linear equations $y' + p(t)y = q(t)$: multiply by $\mu = e^{\int p\,dt}$, so that the left side is $(\mu y)'$, and integrate; the solution exists wherever $p$ and $q$ are continuous.
- $ay'' + by' + cy = 0$: the roots of $ar^2 + br + c = 0$ give $C_1e^{r_1t} + C_2e^{r_2t}$, $(C_1 + C_2t)e^{rt}$ or $e^{\alpha t}(C_1\cos\beta t + C_2\sin\beta t)$; for springs these are overdamped, critically damped and underdamped motion.
- SymPy: `sp.Function`, `sp.dsolve(ode, ics=...)` and `sp.checkodesol`; numerically, RK4, with a second-order equation turned into a first-order system.

## Exercises {#exercises}

:::: exercise Orders and solutions {#ex-13-1} ★
- (a) State the order of each equation: (i) $y' + ty = e^t$; (ii) $y'' = 6y - y'$; (iii) $(y')^2 + y = t$.
- (b) Show that $y = 3 + Ce^{-2t}$ is a solution of $y' = 6 - 2y$ for every constant $C$, and find the solution with $y(0) = 1$.
- (c) Which solution is constant, and what do the other solutions do as $t \to \infty$?

::: solution
**(a)** (i) Order 1. (ii) Order 2: the highest derivative is $y''$. (iii) Order 1: the highest derivative is $y'$, and squaring it does not change the order.

**(b)** Differentiate: $y' = -2Ce^{-2t}$. The right side is $6 - 2y = 6 - 2\big(3 + Ce^{-2t}\big) = -2Ce^{-2t}$. The two sides agree for every $t$, so every function of the family is a solution. Then $y(0) = 3 + C = 1$ gives $C = -2$:

$$y = 3 - 2e^{-2t}.$$

**(c)** $C = 0$ gives the constant solution $y = 3$, the equilibrium: $6 - 2 \cdot 3 = 0$. For every other $C$, $Ce^{-2t} \to 0$, so every solution approaches 3: the equilibrium is stable, as Theorem 13.2 confirms, since $f(y) = 6 - 2y$ has $f'(3) = -2 < 0$.

```check
y1e = 3 + c*exp(-2*t)
same(diff(y1e, t), -2*c*exp(-2*t)); same(6 - 2*y1e, -2*c*exp(-2*t))
same(solve(Eq(y1e.subs(t, 0), 1), c), [-2]); same(diff(3 - 2*exp(-2*t), t), 6 - 2*(3 - 2*exp(-2*t)))
same(solve(6 - 2*y, y), [3]); same(diff(6 - 2*y, y), -2); limit_is(c*exp(-2*t), t, oo, 0)
holds(ode_order(Derivative(yf(t), t) + t*yf(t) - exp(t), yf(t)) == 1); holds(ode_order(Derivative(yf(t), t, 2) - 6*yf(t) + Derivative(yf(t), t), yf(t)) == 2)
holds(ode_order(Derivative(yf(t), t)**2 + yf(t) - t, yf(t)) == 1)
```
:::
::::

:::: exercise Equilibria and stability {#ex-13-2} ★
For $y' = y^2 - y - 2$:

- (a) Find the equilibria, and decide whether each is stable or unstable.
- (b) Describe what the solutions with $y(0) = 0$, $y(0) = 3$ and $y(0) = -2$ do as $t$ increases.

::: solution
**(a)** $f(y) = y^2 - y - 2 = (y - 2)(y + 1)$, which is 0 at $y = 2$ and $y = -1$. Since $f'(y) = 2y - 1$, $f'(-1) = -3 < 0$ and $f'(2) = 3 > 0$: $-1$ is stable and 2 is unstable.

**(b)** The signs of $f$: for $y < -1$ both factors are negative, so $f > 0$; for $-1 < y < 2$, $f < 0$; for $y > 2$, $f > 0$.

- $y(0) = 0$ lies between the equilibria, where $f < 0$: the solution decreases and approaches $-1$, without ever reaching it.
- $y(0) = 3$ lies above 2, where $f > 0$: the solution increases, away from 2, without bound.
- $y(0) = -2$ lies below $-1$, where $f > 0$: the solution increases and approaches $-1$ from below.

```check
f2e = y**2 - y - 2
same(factor(f2e), (y - 2)*(y + 1)); same_set(solve(f2e, y), [2, -1])
same(diff(f2e, y).subs(y, -1), -3); same(diff(f2e, y).subs(y, 2), 3)
holds(f2e.subs(y, -2) > 0); holds(f2e.subs(y, 0) < 0); holds(f2e.subs(y, 3) > 0)
```
:::
::::

:::: exercise Euler's method by hand {#ex-13-3} ★
For $y' = y + t$, $y(0) = 1$:

- (a) Use Euler's method with $h = 0.25$ to approximate $y(1)$.
- (b) Check that $y = 2e^t - t - 1$ is the exact solution, and find the error of your approximation.
- (c) Without computing, about what error would $h = 0.125$ give?

::: solution
**(a)** Here $F(t, y) = y + t$, and four steps of 0.25 reach $t = 1$. Each step adds 0.25 times the slope: $y_{n+1} = y_n + 0.25\,(y_n + t_n)$.

| $n$ | $t_n$ | $y_n$ | slope $y_n + t_n$ |
|---|---|---|---|
| 0 | 0 | 1 | 1 |
| 1 | 0.25 | 1.25 | 1.5 |
| 2 | 0.5 | 1.625 | 2.125 |
| 3 | 0.75 | 2.15625 | 2.90625 |
| 4 | 1 | 2.8828125 | |

So $y(1) \approx 2.8828$.

**(b)** For $y = 2e^t - t - 1$: $y' = 2e^t - 1$, and $y + t = 2e^t - t - 1 + t = 2e^t - 1$, the same; and $y(0) = 2 - 0 - 1 = 1$. So it is the solution, and $y(1) = 2e - 2 \approx 3.4366$. The error is about $3.4366 - 2.8828 = 0.554$.

**(c)** Euler's method has order 1, so halving $h$ should roughly halve the error, to about 0.28. (Eight steps of 0.125 give 3.1316, an error of 0.305: a little more than half, because $h$ is not yet small. Halving $h$ again and again, the ratio of successive errors is 1.82, 1.90, 1.95, 1.97: it approaches 2.)

```check
F3e = lambda T, Y: Y + T
def eul_(F_, y0_, h_, n_):
    T_, Y_ = Integer(0), y0_
    for _ in range(n_):
        Y_, T_ = Y_ + h_*F_(T_, Y_), T_ + h_
    return Y_
same([eul_(F3e, Integer(1), Rational(1, 4), k_) for k_ in range(1, 5)], [Rational(5, 4), Rational(13, 8), Rational(69, 32), Rational(369, 128)])
same([Y_ + T_ for T_, Y_ in zip((0, Rational(1, 4), Rational(1, 2), Rational(3, 4)), (1, Rational(5, 4), Rational(13, 8), Rational(69, 32)))], [1, Rational(3, 2), Rational(17, 8), Rational(93, 32)])
same([Rational(3, 2), Rational(17, 8), Rational(93, 32)], [Rational(15, 10), Rational(2125, 1000), Rational(290625, 100000)])
same(Rational(369, 128), Rational(28828125, 10**7)); rounds(Rational(369, 128), '2.8828')
y3e = 2*exp(t) - t - 1
same(diff(y3e, t), y3e + t); same(y3e.subs(t, 0), 1); same(y3e.subs(t, 1), 2*E - 2); rounds(2*E - 2, '3.4366')
rounds(2*E - 2 - Rational(369, 128), '0.554'); rounds((2*E - 2 - Rational(369, 128))/2, '0.28')
e8 = 2*E - 2 - eul_(F3e, Integer(1), Rational(1, 8), 8)
rounds(eul_(F3e, Integer(1), Rational(1, 8), 8), '3.1316'); rounds(e8, '0.305')
errs3 = [2*E - 2 - eul_(F3e, Integer(1), Rational(1, 4*2**k_), 4*2**k_) for k_ in range(5)]
for k_, r_ in zip(range(4), ('1.82', '1.90', '1.95', '1.97')):
    rounds(errs3[k_]/errs3[k_ + 1], r_)
```
:::
::::

:::: exercise Two separable equations {#ex-13-4} ★
Solve:

- (a) $y' = 3t^2y$, $y(0) = 5$;
- (b) $y' = \dfrac{t}{y}$, $y(0) = -2$.

::: solution
**(a)** The solution cannot touch the equilibrium $y = 0$ (by Theorem 13.1, since $F = 3t^2y$ and $F_y = 3t^2$ are continuous), so it stays positive and you may divide by $y$. Separate and integrate:

$$\begin{aligned} \int\frac{dy}{y} &= \int 3t^2\,dt, \\ \ln y &= t^3 + C, \\ y &= e^{C}e^{t^3}. \end{aligned}$$

$y(0) = e^C = 5$, so $y = 5e^{t^3}$. Check: $y' = 5e^{t^3} \cdot 3t^2 = 3t^2y$.

**(b)** Multiply by $y$ and integrate: $\displaystyle\int y\,dy = \int t\,dt$, so $\tfrac12y^2 = \tfrac12t^2 + C$, that is, $y^2 = t^2 + 2C$. At $t = 0$: $4 = 2C$, so

$$y^2 = t^2 + 4.$$

So $y = \sqrt{t^2 + 4}$ or $y = -\sqrt{t^2 + 4}$. Only the second has $y(0) = -2$, and since $t^2 + 4$ is never 0, the solution cannot switch from one branch to the other: $y = -\sqrt{t^2 + 4}$ for every $t$. The common wrong answer, $\sqrt{t^2 + 4}$, has $y(0) = 2$. Check: $y' = -\dfrac{t}{\sqrt{t^2 + 4}} = \dfrac{t}{y}$.

```check
same(integrate(1/y, y), log(y)); same(integrate(3*t**2, t), t**3)
y4a = 5*exp(t**3); same(diff(y4a, t), 3*t**2*y4a); same(y4a.subs(t, 0), 5)
same(integrate(y, y), y**2/2); same(solve(Eq(Integer(4), 2*c), c), [2])
y4b = -sqrt(t**2 + 4); same(diff(y4b, t), t/y4b); same(y4b.subs(t, 0), -2); same(sqrt(t**2 + 4).subs(t, 0), 2)
holds(checkodesol(Eq(yf(t).diff(t), t/yf(t)), Eq(yf(t), y4b))[0])
```
:::
::::

:::: exercise A thermometer {#ex-13-5} ★★
A thermometer reading 5 °C is brought into a room at 22 °C. After 1 minute it reads 12 °C. Assuming Newton's law of cooling, when will it read 21 °C?

::: solution
Newton's law covers warming too: when $T < T_s$, $T' = -k(T - T_s) > 0$. By Section 13.5, $T(t) = 22 + (5 - 22)e^{-kt} = 22 - 17e^{-kt}$, with $t$ in minutes and $k$ per minute. At $t = 1$:

$$\begin{aligned} 12 &= 22 - 17e^{-k}, \\ e^{-k} &= \frac{10}{17}, \\ k &= \ln 1.7 \approx 0.531. \end{aligned}$$

For 21 °C: $22 - 17e^{-kt} = 21$ gives $e^{-kt} = \tfrac{1}{17}$, so $t = \dfrac{\ln 17}{k}$, that is,

$$t = \frac{\ln 17}{\ln 1.7} \approx 5.34 \text{ minutes}.$$

```check
k5e = log(Rational(17, 10)); T5e = 22 - 17*exp(-k5e*t)
same(T5e.subs(t, 0), 5); same(T5e.subs(t, 1), 12); rounds(k5e, '0.531')
same(diff(T5e, t), -k5e*(T5e - 22))
same(solve(Eq(T5e, 21), t), [log(17)/log(Rational(17, 10))]); rounds(log(17)/log(Rational(17, 10)), '5.34')
```
:::
::::

:::: exercise The tank and the falling body {#ex-13-6} ★★
- (a) Solve the initial value problem of the mixing tank, Example 13.3: $y' = 0.6 - 0.03y$, $y(0) = 5$. When does the tank hold 15 kg of salt?
- (b) Solve $v' = 9.8 - 0.2v$, $v(0) = 0$, the falling body of Section 13.2. How long does the body take to reach 95% of its terminal velocity?

::: solution
Both equations have the form $y' = -k(y - A)$ of the key idea in Section 13.5, with solution $A + \big(y(0) - A\big)e^{-kt}$.

**(a)** $y' = -0.03(y - 20)$, so

$$\begin{aligned} y &= 20 + (5 - 20)e^{-0.03t} \\ &= 20 - 15e^{-0.03t}. \end{aligned}$$

The tank holds 15 kg when $15e^{-0.03t} = 5$, that is, $e^{-0.03t} = \tfrac13$, at $t = \dfrac{\ln 3}{0.03} \approx 36.6$ minutes.

**(b)** $v' = -0.2(v - 49)$, so $v = 49 + (0 - 49)e^{-0.2t} = 49\big(1 - e^{-0.2t}\big)$. It reaches 95% of 49 m/s when $1 - e^{-0.2t} = 0.95$, that is, $e^{-0.2t} = 0.05$, at $t = \dfrac{\ln 20}{0.2}$:

$$t = 5\ln 20 \approx 15.0 \text{ seconds}.$$

```check
y6a = 20 - 15*exp(-Rational(3, 100)*t)
same(diff(y6a, t), Rational(6, 10) - Rational(3, 100)*y6a); same(y6a.subs(t, 0), 5)
tre = symbols('t', real=True)
same(solve(Eq(y6a.subs(t, tre), 15), tre), [log(3)/Rational(3, 100)]); rounds(log(3)/Rational(3, 100), '36.6')
v6b = 49*(1 - exp(-t/5))
same(diff(v6b, t), Rational(98, 10) - Rational(2, 10)*v6b); same(v6b.subs(t, 0), 0)
same(solve(Eq(v6b.subs(t, tre), Rational(95, 100)*49), tre), [5*log(20)]); rounds(5*log(20), '15.0')
```
:::
::::

:::: exercise An integrating factor {#ex-13-7} ★★
Solve $ty' + 2y = 4t^2$ for $t > 0$, with $y(1) = 2$. Which solution of the equation stays finite as $t \to 0^+$?

::: solution
For $t > 0$ you may divide by $t$, which gives the standard form

$$y' + \frac{2}{t}\,y = 4t.$$

Here $p(t) = 2/t$ is continuous on $(0, \infty)$, with antiderivative $2\ln t$, so $\mu = e^{2\ln t} = t^2$. Multiply: $t^2y' + 2ty = 4t^3$, that is, $(t^2y)' = 4t^3$. Integrate: $t^2y = t^4 + C$, so

$$y = t^2 + \frac{C}{t^2}.$$

$y(1) = 1 + C = 2$ gives $C = 1$: $y = t^2 + \dfrac{1}{t^2}$ for $t > 0$. By Theorem 13.5 it is the only solution with $y(1) = 2$ on $(0, \infty)$. As $t \to 0^+$ (a [one-sided limit](module_02_EN.html#one-sided)), $C/t^2$ is unbounded unless $C = 0$ (it tends to $\infty$ if $C > 0$ and to $-\infty$ if $C < 0$), so the only solution that stays finite is $y = t^2$; indeed it solves the original equation for every $t$, since $t \cdot 2t + 2t^2 = 4t^2$.

```check
tq = symbols('t', positive=True)
same(integrate(2/tq, tq), 2*log(tq)); same(exp(2*log(tq)), tq**2)
same(diff(tq**2*yfun(tq), tq), tq**2*(Derivative(yfun(tq), tq) + 2/tq*yfun(tq)))
antideriv(tq**4, 4*tq**3, tq)
y7e = tq**2 + 1/tq**2
same(tq*diff(y7e, tq) + 2*y7e, 4*tq**2); same(y7e.subs(tq, 1), 2)
limit_is(1/t**2, t, 0, oo, '+'); limit_is(-1/t**2, t, 0, -oo, '+')                 # C/t^2 is unbounded unless C = 0
same(t*diff(t**2, t) + 2*t**2, 4*t**2)
```
:::
::::

:::: exercise A rumour {#ex-13-8} ★★
A rumour spreads through a school of 1000 students. Suppose it spreads at a rate proportional both to the number $y$ of students who have heard it and to the number $1000 - y$ who have not.

- (a) Show that $y$ satisfies a logistic equation.
- (b) At the start 100 students have heard it, and a day later 200. Find $r$.
- (c) When have 900 heard it?

::: solution
**(a)** $y' = a\,y(1000 - y)$ for a constant $a > 0$. Taking 1000 out of the bracket, $y' = 1000a\,y\big(1 - \tfrac{y}{1000}\big)$: the logistic equation with $K = 1000$ and $r = 1000a$.

**(b)** With $y_0 = 100$, $\dfrac{K - y_0}{y_0} = 9$, so $y = \dfrac{1000}{1 + 9e^{-rt}}$. Then $y(1) = 200$ means $1 + 9e^{-r} = 5$, so $e^{-r} = \tfrac49$ and

$$r = \ln\frac94 \approx 0.811 \text{ per day}.$$

**(c)** $y = 900$ means $1 + 9e^{-rt} = \tfrac{10}{9}$, so $e^{-rt} = \tfrac{1}{81}$ and

$$\begin{aligned} t &= \frac{\ln 81}{r} = \frac{\ln 81}{\ln(9/4)} \\ &= \frac{2\ln 3}{\ln 1.5} \approx 5.42 \text{ days}. \end{aligned}$$

This is exactly twice the time $\dfrac{\ln 9}{r} \approx 2.71$ days at which half the students have heard it: the logistic curve climbs from 100 to 500 as fast as from 500 to 900.

```check
a8 = symbols('a', positive=True)
same(expand(a8*y*(1000 - y) - 1000*a8*y*(1 - y/1000)), 0)
r8 = log(Rational(9, 4)); y8 = 1000/(1 + 9*exp(-r8*t))
same(y8, ylog.subs({Kp: 1000, y0p: 100, rp: r8})); same(y8.subs(t, 0), 100); same(simplify(y8.subs(t, 1)), 200); rounds(r8, '0.811')
t9 = log(81)/r8
same(simplify(y8.subs(t, t9)), 900); same(t9, 2*log(3)/log(Rational(3, 2))); rounds(t9, '5.42')
same(simplify(y8.subs(t, log(9)/r8)), 500); same(t9, 2*log(9)/r8); rounds(log(9)/r8, '2.71')
```
:::
::::

:::: exercise Three second-order equations {#ex-13-9} ★★
Solve:

- (a) $y'' - y' - 6y = 0$, $y(0) = 1$, $y'(0) = 8$;
- (b) $y'' + 6y' + 9y = 0$, $y(0) = 2$, $y'(0) = -1$;
- (c) $y'' + 4y' + 13y = 0$, $y(0) = 0$, $y'(0) = 6$.

::: solution
**(a)** $r^2 - r - 6 = (r - 3)(r + 2) = 0$ gives $r = 3$ and $r = -2$, so $y = C_1e^{3t} + C_2e^{-2t}$. The conditions: $C_1 + C_2 = 1$ and $3C_1 - 2C_2 = 8$. Adding twice the first to the second gives $5C_1 = 10$, so $C_1 = 2$ and $C_2 = -1$:

$$y = 2e^{3t} - e^{-2t}.$$

**(b)** $r^2 + 6r + 9 = (r + 3)^2 = 0$ has the single root $r = -3$, so $y = (C_1 + C_2t)e^{-3t}$. $y(0) = C_1 = 2$; $y' = \big(C_2 - 3C_1 - 3C_2t\big)e^{-3t}$, so $y'(0) = C_2 - 3C_1 = -1$ and $C_2 = 5$:

$$y = (2 + 5t)\,e^{-3t}.$$

**(c)** $r^2 + 4r + 13 = 0$ has discriminant $16 - 52 = -36 < 0$, so $\alpha = -\tfrac42 = -2$ and $\beta = \tfrac{\sqrt{36}}{2} = 3$: $y = e^{-2t}\big(C_1\cos 3t + C_2\sin 3t\big)$. $y(0) = C_1 = 0$, so $y = C_2e^{-2t}\sin 3t$, with $y' = C_2e^{-2t}\big(3\cos 3t - 2\sin 3t\big)$; $y'(0) = 3C_2 = 6$ gives $C_2 = 2$:

$$y = 2e^{-2t}\sin 3t.$$

```check
same(factor(r**2 - r - 6), (r - 3)*(r + 2)); same(solve([C1 + C2 - 1, 3*C1 - 2*C2 - 8], [C1, C2]), {C1: 2, C2: -1})
L9 = lambda Y, p_, q_: diff(Y, t, 2) + p_*diff(Y, t) + q_*Y
y9a = 2*exp(3*t) - exp(-2*t); same(L9(y9a, -1, -6), 0); same(y9a.subs(t, 0), 1); same(diff(y9a, t).subs(t, 0), 8)
same(factor(r**2 + 6*r + 9), (r + 3)**2)
same(diff((C1 + C2*t)*exp(-3*t), t), (C2 - 3*C1 - 3*C2*t)*exp(-3*t))
y9b = (2 + 5*t)*exp(-3*t); same(L9(y9b, 6, 9), 0); same(y9b.subs(t, 0), 2); same(diff(y9b, t).subs(t, 0), -1)
same(16 - 52, -36); same(solve(r**2 + 4*r + 13, r), [-2 - 3*I, -2 + 3*I])
same(diff(C2*exp(-2*t)*sin(3*t), t), C2*exp(-2*t)*(3*cos(3*t) - 2*sin(3*t)))
y9c = 2*exp(-2*t)*sin(3*t); same(L9(y9c, 4, 13), 0); same(y9c.subs(t, 0), 0); same(diff(y9c, t).subs(t, 0), 6)
```
:::
::::

:::: exercise Euler's method, exactly {#ex-13-10} ★★★
Run Euler's method with step $h$, where $0 < h < 1$, on $y' = t - y$, $y(0) = 1$, so that $t_n = nh$.

- (a) Prove by induction that $y_n = t_n - 1 + 2(1 - h)^n$ for $n = 0, 1, 2, \dots$
- (b) Deduce that with $n$ steps to $t = 2$ (so $h = 2/n$), Euler's approximation to $y(2)$ is $1 + 2\big(1 - \tfrac2n\big)^n$, and prove that it tends to the exact value $1 + 2e^{-2}$ as $n \to \infty$.
- (c) Check the formula against Example 13.6 and Figure 13.2, and show that every approximation $y_n$ with $n \ge 1$ lies below the exact value $y(t_n)$.

::: solution
**(a)** For $n = 0$: $t_0 - 1 + 2(1 - h)^0 = 0 - 1 + 2 = 1 = y_0$. Now suppose that $y_n = t_n - 1 + 2(1 - h)^n$ for some $n$. Then

$$\begin{aligned} y_{n+1} &= y_n + h(t_n - y_n) \\ &= (1 - h)y_n + ht_n \\ &= (1 - h)(t_n - 1) + ht_n \\ &\qquad + 2(1 - h)^{n+1} \\ &= t_n - 1 + h + 2(1 - h)^{n+1} \\ &= t_{n+1} - 1 + 2(1 - h)^{n+1}, \end{aligned}$$

where the third step substitutes the formula for $y_n$ and multiplies out, the fourth expands $(1 - h)(t_n - 1) + ht_n = t_n - 1 - ht_n + h + ht_n = t_n - 1 + h$, and the last uses $t_{n+1} = t_n + h$. So the formula holds for $n + 1$, and by induction for every $n$.

**(b)** With $h = 2/n$, $t_n = 2$, so $y_n = 2 - 1 + 2\big(1 - \tfrac2n\big)^n = 1 + 2\big(1 - \tfrac2n\big)^n$. Module 6 proved that $\big(1 + \tfrac{x}{n}\big)^n \to e^x$ for every $x$; with $x = -2$, $\big(1 - \tfrac2n\big)^n \to e^{-2}$, so $y_n \to 1 + 2e^{-2} = y(2)$. (Or directly: $\ln\big(1 - \tfrac2n\big)^n = n\ln\big(1 - \tfrac2n\big) \to -2$, a limit of the form $\infty \cdot 0$ that [L'Hôpital's rule](module_07_EN.html#products-differences) settles.) Euler's method converges to the solution as the step shrinks.

**(c)** $n = 4$ ($h = 0.5$): $1 + 2\big(\tfrac12\big)^4 = 1.125$, as in Example 13.6. $n = 8$ ($h = 0.25$): $1 + 2\big(\tfrac34\big)^8 = 1 + \tfrac{6561}{32768} \approx 1.2002$, as in Figure 13.2.

For the comparison, the exact solution of Example 13.1 gives $y(t_n) = t_n - 1 + 2e^{-nh} = t_n - 1 + 2\big(e^{-h}\big)^n$. So $y_n < y(t_n)$ exactly when $(1 - h)^n < \big(e^{-h}\big)^n$. Now $1 + x \le e^x$ for every $x$, with equality only at $x = 0$: the graph of $e^x$ is concave up, so it lies above its tangent line $y = 1 + x$ at 0, touching it only there. With $x = -h$, and $0 < h < 1$, this gives $0 < 1 - h < e^{-h}$. Raising both sides to the power $n \ge 1$ keeps the inequality, because both sides are positive. So every approximation is below the exact value, for the reason that Example 13.6 gave: a curve that is concave up lies above its tangent lines. In particular, Euler's approximation $1 + 2\big(1 - \tfrac2n\big)^n$ to $y(2)$ is below $1 + 2e^{-2}$ for every $n \ge 3$.

```check
hs, ns = symbols('h n', positive=True)
yn_ = lambda N_: N_*hs - 1 + 2*(1 - hs)**N_
same(yn_(0), 1)
steps(yn_(ns) + hs*(ns*hs - yn_(ns)), (1 - hs)*yn_(ns) + hs*ns*hs, (1 - hs)*(ns*hs - 1) + 2*(1 - hs)**(ns + 1) + hs*ns*hs, ns*hs - 1 + hs + 2*(1 - hs)**(ns + 1), yn_(ns + 1))
same(expand((1 - hs)*(t - 1)), t - 1 - hs*t + hs)
same(yn_(ns).subs(hs, 2/ns), 1 + 2*(1 - 2/ns)**ns)
limit_is((1 - 2/n)**n, n, oo, exp(-2), '+'); limit_is(n*log(1 - 2/n), n, oo, -2, '+')
same((1 + 2*(1 - 2/n)**n).subs(n, 4), Rational(9, 8)); same((1 + 2*(1 - 2/n)**n).subs(n, 8), 1 + Rational(6561, 32768)); rounds(1 + Rational(6561, 32768), '1.2002')
same(y131.subs(t, ns*hs), ns*hs - 1 + 2*exp(-hs)**ns)                    # y(t_n) = t_n - 1 + 2(e^(-h))^n
for hv_ in (Rational(1, 100), Rational(1, 4), Rational(1, 2), Rational(9, 10)):
    holds(0 < 1 - hv_ < exp(-hv_))
    for N_ in (1, 2, 5, 20):
        holds(yn_(N_).subs(hs, hv_) < y131.subs(t, N_*hv_))                  # y_n < y(t_n) at every step
for N_ in (3, 4, 10, 100):
    holds((1 - Rational(2, N_))**N_ < exp(-2))
```
:::
::::

:::: exercise Air resistance proportional to $v^2$ {#ex-13-11} ★★★
For fast bodies, air resistance is closer to proportional to $v^2$. Suppose that a body falling from rest satisfies $v' = 9.8 - \dfrac{v^2}{245}$, $v(0) = 0$ (hypothetical numbers).

- (a) Find the terminal velocity.
- (b) Solve the equation with partial fractions, and show that $v = 49\tanh(t/5)$.
- (c) How long does the body take to reach 95% of its terminal velocity? Compare with Exercise 13.6, where the resistance was $0.2v$ and the terminal velocity also 49 m/s.

::: solution
**(a)** $v' = 0$ when $v^2 = 9.8 \cdot 245 = 2401$, at the terminal velocity $v = 49$ m/s.

**(b)** Write $v' = \dfrac{2401 - v^2}{245}$. The solution starts at 0, below the equilibrium 49, so $0 \le v < 49$ for $t \ge 0$ (it rises, since $v' > 0$ there, and cannot cross the equilibrium), and you may separate:

$$\int\frac{dv}{2401 - v^2} = \int\frac{dt}{245}.$$

By partial fractions, $\dfrac{1}{2401 - v^2} = \dfrac{1}{(49 - v)(49 + v)} = \dfrac{1}{98}\Big(\dfrac{1}{49 - v} + \dfrac{1}{49 + v}\Big)$, so the left side is

$$\begin{aligned} &\frac{1}{98}\Big(-\ln(49 - v) + \ln(49 + v)\Big) \\ &\quad= \frac{1}{98}\ln\frac{49 + v}{49 - v}. \end{aligned}$$

At $t = 0$, $v = 0$ and both sides are 0, so the constant is 0, and $\ln\dfrac{49 + v}{49 - v} = \dfrac{98t}{245} = \dfrac{2t}{5}$. Hence $\dfrac{49 + v}{49 - v} = e^{2t/5}$, so $49 + v = e^{2t/5}(49 - v)$, $v\big(1 + e^{2t/5}\big) = 49\big(e^{2t/5} - 1\big)$, and, multiplying the top and the bottom by $e^{-t/5}$,

$$\begin{aligned} v &= 49\,\frac{e^{2t/5} - 1}{e^{2t/5} + 1} \\ &= 49\,\frac{e^{t/5} - e^{-t/5}}{e^{t/5} + e^{-t/5}} \\ &= 49\tanh\frac{t}{5}, \end{aligned}$$

since $\tanh x = \dfrac{\sinh x}{\cosh x} = \dfrac{e^x - e^{-x}}{e^x + e^{-x}}$ (Module 6).

**(c)** $\tanh\dfrac t5 = 0.95$ means $\dfrac{e^{2t/5} - 1}{e^{2t/5} + 1} = 0.95$, so $e^{2t/5} = \dfrac{1.95}{0.05} = 39$ and

$$t = \frac52\ln 39 \approx 9.16 \text{ seconds},$$

against 15.0 seconds in Exercise 13.6. For $0 < v < 49$, $\dfrac{v^2}{245} < \dfrac{49v}{245} = 0.2v$: at every speed below the terminal velocity the quadratic resistance is the weaker of the two, so this body speeds up faster.

```check
same(Rational(98, 10)*245, 2401); same(sqrt(2401), 49)
same_set(solve(Rational(98, 10) - v**2/245, v), [-49, 49]); holds((Rational(98, 10) - v**2/245).subs(v, 0) > 0)   # v' > 0 for -49 < v < 49
same(apart(1/(2401 - v**2), v), Rational(1, 98)*(1/(49 - v) + 1/(49 + v)))
antideriv(log((49 + v)/(49 - v))/98, 1/(2401 - v**2), v)
same(Rational(98, 245), Rational(2, 5))
sol11 = solve(Eq((49 + v)/(49 - v), exp(2*t/5)), v)
same(len(sol11), 1); same(sol11[0].rewrite(exp), 49*(exp(2*t/5) - 1)/(exp(2*t/5) + 1))
v11 = 49*tanh(t/5)
steps(49*(exp(2*t/5) - 1)/(exp(2*t/5) + 1), 49*(exp(t/5) - exp(-t/5))/(exp(t/5) + exp(-t/5)), v11.rewrite(exp))
same(diff(v11, t), Rational(98, 10) - v11**2/245); same(v11.subs(t, 0), 0)
same(solve(Eq((exp(x) - 1)/(exp(x) + 1), Rational(95, 100)), x), [log(39)]); same(Rational(195, 100)/Rational(5, 100), 39)
rounds(Rational(5, 2)*log(39), '9.16'); rounds(5*log(20), '15.0')
vq = symbols('v', positive=True); same(49*vq/245, vq/5)
```
:::
::::

:::: exercise An RC circuit as a filter {#ex-13-12} ★★★
An RC circuit with $R = 1$ ohm and $C = 1$ farad, so that its time constant is $RC = 1$ second, is driven by the alternating voltage $\sin t$ volts. Its charge satisfies $q' + q = \sin t$, and $q(0) = 0$.

- (a) Solve the initial value problem.
- (b) Show that once the term with $e^{-t}$ has died away, $q(t) = \dfrac{1}{\sqrt2}\sin\Big(t - \dfrac{\pi}{4}\Big)$: a wave of the same frequency as the input, smaller by the factor $\tfrac{1}{\sqrt2}$ and delayed by $\tfrac{\pi}{4}$.

::: solution
**(a)** The equation is in standard form with $p = 1$, so $\mu = e^t$ and $(e^tq)' = e^t\sin t$. Integrate by parts twice (Module 11). Let $J = \int e^t\sin t\,dt$. With $u = \sin t$ and $dv = e^t\,dt$, $J = e^t\sin t - \int e^t\cos t\,dt$; and with $u = \cos t$, $\int e^t\cos t\,dt = e^t\cos t + \int e^t\sin t\,dt = e^t\cos t + J$. So $J = e^t\sin t - e^t\cos t - J$, and

$$\begin{aligned} &\int e^t\sin t\,dt \\ &\quad= \frac{e^t(\sin t - \cos t)}{2} + C. \end{aligned}$$

Then $e^tq = \tfrac12 e^t(\sin t - \cos t) + C$, so $q = \tfrac12(\sin t - \cos t) + Ce^{-t}$, and $q(0) = -\tfrac12 + C = 0$ gives $C = \tfrac12$:

$$q(t) = \frac{\sin t - \cos t + e^{-t}}{2}.$$

**(b)** After a few seconds $e^{-t}$ is negligible, and $q \approx \tfrac12(\sin t - \cos t)$. By the addition formula of [Section 1.4](module_01_EN.html#trig), $\sin\big(t - \tfrac\pi4\big) = \sin t\cos\tfrac\pi4 - \cos t\sin\tfrac\pi4$, and $\cos\tfrac\pi4 = \sin\tfrac\pi4 = \tfrac{1}{\sqrt2}$, so

$$\sin\Big(t - \frac\pi4\Big) = \frac{\sin t - \cos t}{\sqrt2},$$

so $\tfrac12(\sin t - \cos t) = \tfrac{1}{\sqrt2}\sin\big(t - \tfrac\pi4\big)$. The input has amplitude 1; the response has amplitude $\tfrac{1}{\sqrt2} \approx 0.707$ and lags an eighth of a period behind. With the input $\sin\omega t$ the same steps give the amplitude $1/\sqrt{1 + \omega^2}$: the faster the input oscillates, the smaller the response. That is what a low-pass filter does.

```check
same(diff(exp(t)*yfun(t), t), exp(t)*(Derivative(yfun(t), t) + yfun(t)))
steps(Integral(exp(t)*sin(t), t), exp(t)*sin(t) - Integral(exp(t)*cos(t), t))
steps(Integral(exp(t)*cos(t), t), exp(t)*cos(t) + Integral(exp(t)*sin(t), t))
antideriv(exp(t)*(sin(t) - cos(t))/2, exp(t)*sin(t), t)
q12 = (sin(t) - cos(t) + exp(-t))/2
same(diff(q12, t) + q12, sin(t)); same(q12.subs(t, 0), 0)
same(expand_trig(sin(t - pi/4)), sin(t)*cos(pi/4) - cos(t)*sin(pi/4)); same(cos(pi/4), 1/sqrt(2)); same(sin(pi/4), 1/sqrt(2))
same(sin(t - pi/4), (sin(t) - cos(t))/sqrt(2)); same((sin(t) - cos(t))/2, sin(t - pi/4)/sqrt(2)); rounds(1/sqrt(2), '0.707')
wq = symbols('omega', positive=True)
qw = (sin(wq*t) - wq*cos(wq*t))/(1 + wq**2)
same(diff(qw, t) + qw, sin(wq*t)); same(sqrt(1 + wq**2)/(1 + wq**2), 1/sqrt(1 + wq**2))
```
:::
::::

## Check yourself {#quiz}

```quiz
? The order of the differential equation $y'' + (y')^3 = t$ is
- [ ] 3
- [x] 2
- [ ] 1
- [ ] 6
> The order is the order of the highest derivative in the equation, here $y''$, so it is 2. The exponent in $(y')^3$ is a power of the first derivative, not a third derivative: 3 and 6 mix up powers and orders, and 1 overlooks $y''$.

? Which function is the solution of $y' = 2y$ with $y(0) = 3$?
- [x] $3e^{2t}$
- [ ] $e^{2t} + 2$
- [ ] $2e^{3t}$
- [ ] $3e^{t/2}$
> By Theorem 13.4 the solutions of $y' = 2y$ are $y(0)e^{2t}$, here $3e^{2t}$. $e^{2t} + 2$ has the right value at 0, but its derivative $2e^{2t}$ is not $2y = 2e^{2t} + 4$. $2e^{3t}$ swaps the two constants, and $3e^{t/2}$ grows at the rate $\tfrac12y$.

? In the direction field of $y' = t - y$, the segment at the point $(2, -1)$ has slope
- [ ] $1$
- [ ] $-3$
- [ ] $-\tfrac12$
- [x] $3$
> The slope at $(t, y)$ is $t - y = 2 - (-1) = 3$. The answer 1 adds $t$ and $y$ instead; $-3$ computes $y - t$; $-\tfrac12$ is the slope of the line from the origin to the point, which has nothing to do with the field.

? The equilibria of $y' = y(2 - y)$ are
- [ ] 0, stable, and 2, unstable
- [ ] 0 and 2, both stable
- [x] 0, unstable, and 2, stable
- [ ] 2 only, which is stable
> $f(y) = y(2 - y)$ is 0 at $y = 0$ and $y = 2$, and $f'(y) = 2 - 2y$ gives $f'(0) = 2 > 0$ (unstable) and $f'(2) = -2 < 0$ (stable): between 0 and 2, $f > 0$, so solutions rise away from 0 towards 2. The constant solution $y = 0$ is an equilibrium too, so "2 only" misses it.

? Euler's method with $h = 0.5$ for $y' = y$, $y(0) = 1$, approximates $y(1)$ by
- [ ] 1.5
- [x] 2.25
- [ ] 2
- [ ] 2.718
> Each step multiplies by $1 + h = 1.5$, and two steps reach $t = 1$: $1.5^2 = 2.25$. 1.5 is the value after one step, at $t = 0.5$; 2 is what one step with $h = 1$ gives, or two steps that keep the starting slope 1; 2.718 is the exact value $e$, which no finite number of Euler steps reaches.

? With step $h = 0.1$, Euler's method has error 0.04 at $t = 2$. With $h = 0.05$ its error at $t = 2$ is about
- [ ] 0.04
- [ ] 0.01
- [ ] 0.0025
- [x] 0.02
> Euler's method has order 1: its error is about a constant times $h$, so halving $h$ roughly halves the error. 0.01 would be the behaviour of a method of order 2, and 0.0025 of one of order 4, such as RK4. The error does not stay at 0.04: shorter steps follow the solution more closely.

? An integrating factor for $y' + 3y = e^t$ is
- [x] $e^{3t}$
- [ ] $e^{t}$
- [ ] $3t$
- [ ] $e^{-3t}$
> In standard form $p(t) = 3$, so $\mu = e^{\int 3\,dt} = e^{3t}$, and then $\big(e^{3t}y\big)' = e^{4t}$. $e^t$ comes from the right side, which plays no part in $\mu$; $3t$ is the antiderivative of $p$ without the exponential; with $e^{-3t}$ the left side is not the derivative of a product.

? The general solution of $y'' + 2y' + 5y = 0$ is
- [ ] $C_1e^{t} + C_2e^{-5t}$
- [ ] $e^{-2t}\big(C_1\cos t + C_2\sin t\big)$
- [x] $e^{-t}\big(C_1\cos 2t + C_2\sin 2t\big)$
- [ ] $(C_1 + C_2t)\,e^{-t}$
> The characteristic equation $r^2 + 2r + 5 = 0$ has discriminant $4 - 20 = -16 < 0$, so $\alpha = -1$ and $\beta = \sqrt{16}/2 = 2$. Swapping $\alpha$ and $\beta$ gives the second option; real exponentials would need real roots (1 and $-5$ are the roots of $r^2 + 4r - 5$); $(C_1 + C_2t)e^{-t}$ needs a repeated root.
```

```check
holds(ode_order(Derivative(yf(t), t, 2) + Derivative(yf(t), t)**3 - t, yf(t)) == 2)
same(diff(3*exp(2*t), t), 2*3*exp(2*t)); same((3*exp(2*t)).subs(t, 0), 3); same(diff(exp(2*t) + 2, t) - 2*(exp(2*t) + 2), -4)
same((t - y).subs({t: 2, y: -1}), 3)
same_set(solve(y*(2 - y), y), [0, 2]); same(diff(y*(2 - y), y).subs(y, 0), 2); same(diff(y*(2 - y), y).subs(y, 2), -2)
same(Rational(3, 2)**2, Rational(9, 4)); same(1 + Rational(1, 2), Rational(3, 2)); same(1 + 1*1, 2); same(1 + Rational(1, 2)*1 + Rational(1, 2)*1, 2); rounds(E, '2.718')
same(Rational(4, 100)/2, Rational(2, 100))
same(exp(integrate(3, t)), exp(3*t)); same(diff(exp(3*t)*yf(t), t), exp(3*t)*(Derivative(yf(t), t) + 3*yf(t))); same(exp(3*t)*exp(t), exp(4*t))
same(solve(r**2 + 2*r + 5, r), [-1 - 2*I, -1 + 2*I]); same(solve(r**2 + 4*r - 5, r), [-5, 1])
same(diff(exp(-t)*cos(2*t), t, 2) + 2*diff(exp(-t)*cos(2*t), t) + 5*exp(-t)*cos(2*t), 0)
```
