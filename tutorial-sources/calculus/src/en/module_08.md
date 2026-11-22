---
title: The shape of a graph and optimisation
part: 2
lead: Use derivatives to find the largest and smallest values of a function, to see where its graph rises, falls and bends, and to solve optimisation problems from geometry, physics and economics. You will prove the Mean Value Theorem and the tests that rest on it, sketch graphs from their derivatives, and minimise a function the way machine learning does, by gradient descent.
minutes: 270
needs: Modules 1 to 7, in particular the rules of differentiation (Modules 4 to 6), asymptotes (Module 3) and linearisation (Module 7)
goals:
  - Find the absolute extreme values of a continuous function on a closed interval with the closed interval method
  - Prove Rolle's theorem and the Mean Value Theorem, and use them to prove the tests for increasing and constant functions
  - Classify critical numbers with the first and second derivative tests, and find intervals of concavity and inflection points
  - Sketch a graph from its domain, intercepts, symmetry, asymptotes and the signs of its first and second derivatives
  - Solve optimisation problems, and justify that the answer is an absolute maximum or minimum
  - Minimise a function by gradient descent, and explain how the step size decides whether it converges
---

## Maximum and minimum values {#extrema}

Many questions ask for a best value. What shape of can holds a given volume with the least metal? Which path does light take between two points? How many units should a factory make to keep the cost of each unit as low as possible? Which setting of a machine-learning model makes its error smallest? Each question asks for the largest or the smallest value of a function, and derivatives answer it. [Example 4.8](module_04_EN.html#polynomials) found the horizontal tangents of a graph by solving $f'(x) = 0$. This module shows why that finds the peaks and the valleys, and what the signs of $f'$ and $f''$ say about the whole shape of a graph.

Figure 8.1 shows a function on the interval $[-1, 5.5]$. Its highest point is at the left end; its lowest point is at $x = 5$, where the tangent is horizontal. In between, the peak at $x = 2$ and the valley at $x = 0$ are the highest and lowest points near them, but not of the whole graph; there too the tangent is horizontal.

::: figure id=fig-08-1
The graph of $f(x) = \tfrac14x^4 - \tfrac73x^3 + 5x^2$ on $[-1, 5.5]$. The largest value is at the endpoint $x = -1$, the smallest at $x = 5$; the peak at $x = 2$ and the valley at $x = 0$ are only local. At the three points inside the interval the tangent (dashed) is horizontal; at the endpoints it need not be.
:::

```check
F81 = x**4/4 - Rational(7, 3)*x**3 + 5*x**2
same(factor(diff(F81, x)), x*(x - 2)*(x - 5))
same([F81.subs(x, v_) for v_ in (-1, 0, 2, 5)], [Rational(91, 12), 0, Rational(16, 3), -Rational(125, 12)])
same(maximum(F81, x, Interval(-1, Rational(11, 2))), Rational(91, 12)); same(minimum(F81, x, Interval(-1, Rational(11, 2))), -Rational(125, 12))
holds(F81.subs(x, Rational(11, 2)) > F81.subs(x, 5)); holds(F81.subs(x, Rational(11, 2)) < F81.subs(x, -1))
holds(diff(F81, x).subs(x, -1) != 0); holds(diff(F81, x).subs(x, Rational(11, 2)) != 0)
holds(diff(F81, x, 2).subs(x, 2) < 0); holds(diff(F81, x, 2).subs(x, 0) > 0); holds(diff(F81, x, 2).subs(x, 5) > 0)   # peak at 2, valleys at 0 and 5
```

::: definition Absolute and local extrema
Let $c$ be a number in the domain $D$ of a function $f$.

- $f(c)$ is the **absolute maximum** value of $f$ if $f(c) \ge f(x)$ for every $x$ in $D$, and the **absolute minimum** value if $f(c) \le f(x)$ for every $x$ in $D$.
- $f(c)$ is a **local maximum** value of $f$ if $f(c) \ge f(x)$ for every $x$ in some open interval that contains $c$ and lies in $D$, and a **local minimum** value if $f(c) \le f(x)$ for every $x$ in such an interval.

Maximum and minimum values are **extreme values**, or **extrema** (singular **extremum**). The absolute maximum value of $f$ **on** an interval $I$ is the absolute maximum value of $f$ with its domain cut down to $I$, and similarly for the others.
:::

Absolute extrema are also called **global**. The maximum value on an interval of Module 3 is the absolute maximum on that interval. "Local" means "compared with the points on both sides", so in this series an endpoint of the domain is never a local extremum; some books allow it, so check the convention when you read elsewhere.

Some examples. $x^2$ has the absolute minimum value 0, at 0, which is also a local minimum; it has no maximum value. $x^3$ has no extremum at all: every interval around a number $c$ contains points where $x^3$ is larger than $c^3$ and points where it is smaller. $\cos x$ has the absolute maximum value 1, at $x = 0, \pm2\pi, \pm4\pi, \dots$, and the absolute minimum value $-1$, at $x = \pm\pi, \pm3\pi, \dots$; these are local extrema too. In Figure 8.1, the absolute maximum value is $f(-1) = \tfrac{91}{12} \approx 7.58$, which is not a local maximum, since $-1$ is an endpoint; $f(5) = -\tfrac{125}{12} \approx -10.42$ is the absolute minimum and a local minimum; $f(2) = \tfrac{16}{3}$ is a local maximum and $f(0) = 0$ a local minimum.

```check
same(minimum(x**2, x, S.Reals), 0); same(maximum(x**2, x, S.Reals), oo)
same(maximum(cos(x), x, S.Reals), 1); same(minimum(cos(x), x, S.Reals), -1)
same([cos(2*k_*pi) for k_ in (0, 1, 2)], [1, 1, 1]); same([cos((2*k_ + 1)*pi) for k_ in (-1, 0, 1)], [-1, -1, -1])
rounds(Rational(91, 12), '7.58'); rounds(-Rational(125, 12), '-10.42')
```

Every local extremum in Figure 8.1 sits where the tangent is horizontal. That is no accident.

::: theorem Fermat's theorem
If $f$ has a local maximum or a local minimum at $c$, and $f'(c)$ exists, then $f'(c) = 0$.
:::

::: proof
Suppose first that $f(c)$ is a local maximum value: $f(x) \le f(c)$ for every $x$ in an open interval around $c$. For every $h \ne 0$ small enough that $c + h$ lies in that interval, $f(c + h) - f(c) \le 0$, so the difference quotient

$$\frac{f(c + h) - f(c)}{h}$$

is $\le 0$ when $h > 0$ and $\ge 0$ when $h < 0$. As $h \to 0$ it tends to $f'(c)$. If $f'(c)$ were positive, then for all small enough $h$ the quotients would lie within $f'(c)/2$ of $f'(c)$, so they would be positive; but they are not, for $h > 0$. If $f'(c)$ were negative, the quotients with small $h < 0$ would be negative, which they are not either. So $f'(c) = 0$. If $f(c)$ is a local minimum value, $-f$ has a local maximum at $c$, and the first part gives $-f'(c) = 0$.
:::

```check
ff = Function('f')
same((-ff(c + h) - (-ff(c)))/h, -((ff(c + h) - ff(c))/h))
```

::: pitfall
Fermat's theorem says only this: at a local extremum where $f'$ exists, $f' = 0$. It does not work backwards, and it says nothing where its hypotheses fail.

- **A horizontal tangent without an extremum.** For $f(x) = x^3$, $f'(0) = 0$, but there is no extremum at 0, as above.
- **An extremum without a derivative.** $\abs{x}$ has its absolute minimum at 0, where it has no derivative (Module 4).
- **An extremum at an endpoint.** On $[0, 1]$, $f(x) = x$ has its absolute maximum at 1, where the slope is 1. An endpoint is not a local extremum, so the theorem does not apply there.
:::

```check
same(diff(x**3, x).subs(x, 0), 0); holds((-Rational(1, 10))**3 < 0); holds(Rational(1, 10)**3 > 0)
limit_is(Abs(h)/h, h, 0, 1, '+'); limit_is(Abs(h)/h, h, 0, -1, '-')
same(diff(x, x), 1)
```

So the candidates for local extrema are the points where $f' = 0$ and the points where $f'$ does not exist.

::: definition Critical number
A **critical number** of $f$ is a number $c$ in the domain of $f$ at which $f'(c) = 0$ or $f'(c)$ does not exist.
:::

Some books say **critical point**. In these words, Fermat's theorem says: **every local extremum is at a critical number.** Not every critical number gives an extremum ($x^3$ at 0 does not), so the critical numbers are only the candidates.

::: example Critical numbers
Find the critical numbers of (a) $f(x) = 2x^3 - 3x^2 - 12x + 1$ and (b) $g(x) = x^{2/3}(x - 5)$, where $x^{2/3} = \big(\sqrt[3]{x}\big)^2$ with the real cube root, as in Module 4.

**(a)** $f$ is a polynomial, differentiable everywhere, so its critical numbers are the solutions of $f'(x) = 0$:

$$\begin{aligned} f'(x) &= 6x^2 - 6x - 12 \\ &= 6(x^2 - x - 2) = 6(x - 2)(x + 1). \end{aligned}$$

The critical numbers are $-1$ and $2$.

**(b)** Multiply out, $g(x) = x^{5/3} - 5x^{2/3}$, and use the power rule for real exponents (Module 6), which holds for powers of the real cube root at every $x \ne 0$:

$$\begin{aligned} g'(x) &= \tfrac53 x^{2/3} - \tfrac{10}{3}x^{-1/3} \\ &= \tfrac53 x^{-1/3}(x - 2) = \frac{5(x - 2)}{3\sqrt[3]{x}}, \quad x \ne 0. \end{aligned}$$

(To factor, write $x^{2/3} = x^{-1/3}\cdot x$.) So $g'(x) = 0$ at $x = 2$. At 0, $g$ is defined, $g(0) = 0$, but $g'(0)$ does not exist: the difference quotient

$$\frac{g(h) - g(0)}{h} = \frac{h^{2/3}(h - 5)}{h} = \frac{h - 5}{\sqrt[3]{h}}$$

tends to $-\infty$ as $h \to 0^+$ and to $\infty$ as $h \to 0^-$: a cusp like that of $x^{2/3}$ in Module 4, but pointing upwards. The critical numbers of $g$ are 0 and 2.

```check
f81 = 2*x**3 - 3*x**2 - 12*x + 1
steps(diff(f81, x), 6*x**2 - 6*x - 12, 6*(x**2 - x - 2), 6*(x - 2)*(x + 1))
same_set(solve(diff(f81, x), x), [-1, 2])
xp = symbols('x', positive=True); xn = symbols('x', negative=True)
gR = lambda X: real_root(X, 3)**2*(X - 5)                        # x^(2/3)(x - 5) with the real cube root
same(expand(gR(xp)), xp**Rational(5, 3) - 5*xp**Rational(2, 3))
same(diff(gR(xp), xp), Rational(5, 3)*xp**Rational(2, 3) - Rational(10, 3)*xp**Rational(-1, 3))
same(diff(gR(xp), xp), 5*(xp - 2)/(3*real_root(xp, 3)))
same(diff(gR(xn), xn), 5*(xn - 2)/(3*real_root(xn, 3)))          # the same formula for x < 0
same(Rational(5, 3)*xp**Rational(-1, 3)*(xp - 2), Rational(5, 3)*xp**Rational(2, 3) - Rational(10, 3)*xp**Rational(-1, 3))
same(gR(0), 0); same(gR(Integer(2)), -3*2**Rational(2, 3))
same((gR(xp) - 0)/xp, (xp - 5)/real_root(xp, 3))
limit_is((h - 5)/real_root(h, 3), h, 0, -oo, '+'); limit_is((h - 5)/real_root(h, 3), h, 0, oo, '-')
```
:::

### The closed interval method {#closed-interval}

The Extreme Value Theorem of Module 3 promised that a function continuous on a closed interval $[a, b]$ has an absolute maximum value and an absolute minimum value there. Fermat's theorem says where to look for them.

::: theorem The closed interval method
Let $f$ be continuous on a closed interval $[a, b]$. Then $f$ has an absolute maximum value and an absolute minimum value on $[a, b]$, and each of them is a value of $f$ at an endpoint, $a$ or $b$, or at a critical number of $f$ in $(a, b)$.
:::

::: proof
By the Extreme Value Theorem, $f$ takes its absolute maximum value on $[a, b]$ at some $c$ in $[a, b]$. If $c$ is $a$ or $b$, there is nothing more to prove. Otherwise $a < c < b$, and $f(c) \ge f(x)$ for every $x$ in the open interval $(a, b)$, which contains $c$, so $f(c)$ is a local maximum value. If $f'(c)$ does not exist, $c$ is a critical number; if it exists, it is 0 by Fermat's theorem, and $c$ is a critical number again. The same argument works for the minimum.
:::

::: keyidea
**The closed interval method.** To find the absolute maximum and minimum values of a continuous function $f$ on $[a, b]$:

1. Find the critical numbers of $f$ in $(a, b)$.
2. Evaluate $f$ at each of them, and at $a$ and $b$.
3. The largest of these values is the absolute maximum value; the smallest is the absolute minimum value.
:::

No test of the critical numbers is needed: you compare a short list of numbers.

::: example The closed interval method
Find the absolute maximum and minimum values of (a) $f(x) = 2x^3 - 3x^2 - 12x + 1$ on $[-2, 3]$ and (b) $g(x) = x^{2/3}(x - 5)$ on $[-1, 4]$, the functions of Example 8.1.

**(a)** $f$ is a polynomial, so it is continuous, and both of its critical numbers, $-1$ and 2, lie in $(-2, 3)$. The values at them and at the endpoints:

| $x$ | $-2$ | $-1$ | $2$ | $3$ |
|---|---|---|---|---|
| $f(x)$ | $-3$ | $8$ | $-19$ | $-8$ |

For instance $f(-1) = -2 - 3 + 12 + 1 = 8$. The absolute maximum value is 8, at $x = -1$, and the absolute minimum value is $-19$, at $x = 2$; here both are inside the interval.

**(b)** The real cube root is continuous everywhere (Module 3), so $g$ is continuous on $[-1, 4]$, and both of its critical numbers, 0 and 2, lie in $(-1, 4)$. Since $(-1)^{2/3} = \big(\sqrt[3]{-1}\big)^2 = (-1)^2 = 1$, $4^{2/3} = \sqrt[3]{16}$ and $2^{2/3} = \sqrt[3]{4}$:

| $x$ | $-1$ | $0$ | $2$ | $4$ |
|---|---|---|---|---|
| $g(x)$ | $-6$ | $0$ | $-3\sqrt[3]{4} \approx -4.762$ | $-\sqrt[3]{16} \approx -2.520$ |

The absolute maximum value is 0, at the cusp $x = 0$, where $g'$ does not exist; the absolute minimum value is $-6$, at the endpoint $x = -1$. Solving $g'(x) = 0$ alone would have found neither.

```check
same([f81.subs(x, v_) for v_ in (-2, -1, 2, 3)], [-3, 8, -19, -8]); same(-2 - 3 + 12 + 1, 8)
same(maximum(f81, x, Interval(-2, 3)), 8); same(minimum(f81, x, Interval(-2, 3)), -19)
same(real_root(-1, 3)**2, 1); same(real_root(4, 3)**2, real_root(16, 3)); same(real_root(2, 3)**2, real_root(4, 3))
same([gR(Integer(v_)) for v_ in (-1, 0, 2, 4)], [-6, 0, -3*real_root(4, 3), -real_root(16, 3)])
rounds(-3*real_root(4, 3), '-4.762'); rounds(-real_root(16, 3), '-2.520')
holds(-6 < -3*real_root(4, 3)); holds(-real_root(16, 3) < 0)
```
:::

::: pitfall
Three slips with the closed interval method. Forgetting the endpoints: the minimum in Example 8.2(b) is at one. Forgetting the points where $f'$ does not exist: the maximum there is at one. And using critical numbers outside the interval: on $[0, 3]$ the function of part (a) has only the critical number 2, its values $f(0) = 1$, $f(2) = -19$ and $f(3) = -8$ give the maximum value 1, and the number $f(-1) = 8$ is not a value of $f$ on $[0, 3]$ at all. Finally, the method needs a function continuous on a closed interval. $1/x$ is not even defined at 0, which lies in $[-1, 1]$, and it has no maximum value there: $1/x \to \infty$ as $x \to 0^+$.
:::

```check
same(f81.subs(x, 0), 1); same(maximum(f81, x, Interval(0, 3)), 1)
limit_is(1/x, x, 0, oo, '+')
```

::: compute The closed interval method with SymPy
`sp.solve(expr, x)` returns a list of the solutions of the equation $\text{expr} = 0$. With it, the closed interval method for Example 8.2(a) takes a few lines:

```python
import sympy as sp
x = sp.symbols('x')
f = 2*x**3 - 3*x**2 - 12*x + 1
crit = sp.solve(sp.diff(f, x), x)       # where f'(x) = 0
print(crit)
for c in [-2] + crit + [3]:             # the critical numbers and the endpoints
    print(c, f.subs(x, c))
```

```output
[-1, 2]
-2 -3
-1 8
2 -19
3 -8
```

Both critical numbers lie in $(-2, 3)$; in general, keep only those in the interval. Now part (b). Python, and SymPy too, take $x^{2/3}$ of a negative number to be complex, as [Section 1.7](module_01_EN.html#first-session) showed for $(-8)^{1/3}$, so write $x^{2/3}$ as `sp.cbrt(x**2)`, the cube root of $x^2 \ge 0$, which is real for every $x$:

```python
g = sp.cbrt(x**2)*(x - 5)
dg = sp.simplify(sp.diff(g, x))
print(dg)
print(sp.solve(dg, x), dg.subs(x, 0))
print(sp.N((x**sp.Rational(2, 3)*(x - 5)).subs(x, -1)), g.subs(x, -1))
```

```output
5*(x - 2)*(x**2)**(1/3)/(3*x)
[2] nan
3.0 - 5.19615242270663*I -6
```

SymPy's derivative looks different from Example 8.1, but for $x \ne 0$, $(x^2)^{1/3}/x = 1/\sqrt[3]{x}$, so it is $\dfrac{5(x - 2)}{3\sqrt[3]{x}}$. `solve` finds the zero 2 of $g'$ but not the critical number 0, where $g'$ does not exist; substituting 0 gives `nan`. Look for the points where $f'$ is undefined yourself. The last line shows the trap: `x**sp.Rational(2, 3)` at $-1$ is the complex number $3 - 5.196i$, not $g(-1) = -6$.
:::

```check
same(simplify(real_root(xp**2, 3)/xp - 1/real_root(xp, 3)), 0); same(simplify(real_root(xn**2, 3)/xn - 1/real_root(xn, 3)), 0)
same(expand_complex((x**Rational(2, 3)*(x - 5)).subs(x, -1)), 3 - 3*sqrt(3)*I); rounds(3*sqrt(3), '5.196')
```

## The Mean Value Theorem {#mvt}

On some roads, speed is checked by **average speed cameras**. One camera records the time at which a car passes it, a second camera a known distance further on does the same, and the car's average speed is the distance divided by the time. Suppose, hypothetically, that the cameras are 5 km apart, the limit is 80 km/h, and a car passes the second camera 3 minutes after the first. Its average speed is

$$\frac{5 \text{ km}}{\tfrac{1}{20} \text{ h}} = 100 \text{ km/h}.$$

Its driver may protest that no camera saw them at 100 km/h. But at some instant between the cameras the speedometer did show exactly 100 km/h. The theorem that guarantees it, the Mean Value Theorem, connects an average rate of change with an instantaneous one, and it is the key to the rest of this module. Its special case comes first.

```check
same(Rational(3, 60), Rational(1, 20)); same(5/Rational(1, 20), 100)
```

::: theorem Rolle's theorem
Let $f$ be continuous on $[a, b]$ and differentiable on $(a, b)$, with $f(a) = f(b)$. Then there is a number $c$ in $(a, b)$ with $f'(c) = 0$.
:::

::: proof
By the Extreme Value Theorem, $f$ has an absolute maximum value and an absolute minimum value on $[a, b]$. If both are taken at the endpoints, they are equal, since $f(a) = f(b)$; then the largest and the smallest values of $f$ on $[a, b]$ are the same number, $f$ is constant, and $f'(c) = 0$ for every $c$ in $(a, b)$. Otherwise one of them is taken at a point $c$ inside the interval. As in the proof of Theorem 8.2, $f(c)$ is then a local extremum; $f'(c)$ exists, because $f$ is differentiable on $(a, b)$; so $f'(c) = 0$ by Fermat's theorem.
:::

In pictures (Figure 8.2, left): a smooth graph that starts and ends at the same height must turn round somewhere in between, and where it turns, its tangent is horizontal.

::: figure id=fig-08-2
Left: Rolle's theorem for $f(x) = x^3 - 3x$ on $[a, b] = [-2, 1]$, where $f(a) = f(b) = -2$: the tangent at $c = -1$ is horizontal. Right: the Mean Value Theorem for the same function on $[-2, 2]$: the secant from $(-2, -2)$ to $(2, 2)$ has slope 1, and so have the tangents at $c_1 = -2/\sqrt3$ and $c_2 = 2/\sqrt3$. The Mean Value Theorem is Rolle's theorem tilted: the secant takes the place of the horizontal segment, and the tangents parallel to it the place of the horizontal tangent.
:::

```check
f82 = x**3 - 3*x
same(f82.subs(x, -2), -2); same(f82.subs(x, 1), -2); same_set(solve(diff(f82, x), x), [-1, 1]); same(f82.subs(x, -1), 2)
same((f82.subs(x, 2) - f82.subs(x, -2))/(2 - (-2)), 1); same_set(solve(diff(f82, x) - 1, x), [-2/sqrt(3), 2/sqrt(3)])
holds(-2 < -2/sqrt(3)); holds(2/sqrt(3) < 2)
```

Each hypothesis is needed. Without continuity on the closed interval: $f(x) = x$ for $0 \le x < 1$ with $f(1) = 0$ has $f(0) = f(1)$, but $f'(x) = 1$ on $(0, 1)$. Without differentiability: $\abs{x}$ on $[-1, 1]$ has equal values at the ends, but its derivative is $-1$ or 1 wherever it exists. Without $f(a) = f(b)$: $x$ on $[0, 1]$ has slope 1 everywhere.

```check
fjump = Piecewise((x, x < 1), (0, True))
same(fjump.subs(x, 0), fjump.subs(x, 1)); same(diff(x, x), 1); limit_is(fjump, x, 1, 1, '-')   # f(0) = f(1) = 0, slope 1, but f jumps at 1
same(Abs(-1), Abs(1)); same(diff(Abs(xp), xp), 1); same(diff(Abs(xn), xn), -1)
```

::: example Exactly one root
Show that the equation $x^5 + 3x - 1 = 0$ has exactly one real solution.

Let $f(x) = x^5 + 3x - 1$, a polynomial, so continuous and differentiable everywhere.

**At least one.** $f(0) = -1 < 0$ and $f(1) = 3 > 0$, so by the Intermediate Value Theorem (Module 3) there is a solution between 0 and 1.

**At most one.** Suppose there were two, $r < s$, with $f(r) = f(s) = 0$. By Rolle's theorem on $[r, s]$ there would be a $c$ between them with $f'(c) = 0$. But $f'(x) = 5x^4 + 3 \ge 3$ for every $x$, so $f'$ is never 0. So there is exactly one solution; Newton's method (Module 7) gives $x \approx 0.33199$.

```check
p83 = x**5 + 3*x - 1
same(p83.subs(x, 0), -1); same(p83.subs(x, 1), 3)
same(diff(p83, x), 5*x**4 + 3); same(minimum(5*x**4 + 3, x, S.Reals), 3)
same(len(real_roots(p83)), 1); rounds(nsolve(p83, x, 0.3), '0.33199')
```
:::

Now tilt the picture. In Figure 8.2, right, the ends of the graph are at different heights, and the secant line joining them has slope 1. Somewhere in between, at $c_1$ and at $c_2$, the tangent is parallel to the secant.

::: theorem The Mean Value Theorem
Let $f$ be continuous on $[a, b]$ and differentiable on $(a, b)$. Then there is a number $c$ in $(a, b)$ with

$$f'(c) = \frac{f(b) - f(a)}{b - a},$$

that is, $f(b) - f(a) = f'(c)(b - a)$.
:::

::: proof
Let $m = \dfrac{f(b) - f(a)}{b - a}$, the slope of the secant line, and let

$$h(x) = f(x) - \big(f(a) + m(x - a)\big),$$

the height of the graph above the secant line. Like $f$, $h$ is continuous on $[a, b]$ and differentiable on $(a, b)$, because it is $f$ minus a linear function. At the ends, $h(a) = 0$ and $h(b) = f(b) - f(a) - m(b - a) = 0$. By Rolle's theorem there is a $c$ in $(a, b)$ with $h'(c) = 0$. Since $h'(c) = f'(c) - m$, this says $f'(c) = m$.
:::

```check
fm = Function('f')
mm = (fm(b) - fm(a))/(b - a)
hh = fm(x) - (fm(a) + mm*(x - a))
same(hh.subs(x, a), 0); same(hh.subs(x, b), 0); same(diff(hh, x), diff(fm(x), x) - mm)
```

The **mean** in the name is the average: the average rate of change of $f$ over $[a, b]$ equals its instantaneous rate of change at some point inside.

::: example Average speed cameras
Prove the claim about the car that passed the two cameras, 5 km apart, 3 minutes apart.

Measure time $t$ in hours from the moment the car passes the first camera, and let $s(t)$ be the distance in kilometres that it has travelled by then. So $s(0) = 0$ and $s\big(\tfrac{1}{20}\big) = 5$. A car does not jump, and its velocity $s'(t)$ exists at every instant (it is what the speedometer shows), so $s$ is continuous on $\big[0, \tfrac{1}{20}\big]$ and differentiable on $\big(0, \tfrac{1}{20}\big)$. By the Mean Value Theorem there is a time $c$ between 0 and $\tfrac{1}{20}$ with

$$s'(c) = \frac{s\big(\tfrac{1}{20}\big) - s(0)}{\tfrac{1}{20} - 0} = \frac{5}{1/20} = 100 \text{ km/h}.$$

At that instant the car was travelling at 100 km/h, 20 km/h over the limit. The theorem does not say when; it says that the instant exists.

```check
same((5 - 0)/(Rational(1, 20) - 0), 100); same(100 - 80, 20)
```
:::

::: pitfall
The Mean Value Theorem says that a suitable $c$ exists, not where it is, and there may be several: two in Figure 8.2. And it needs its hypotheses. On $[-1, 2]$, $\abs{x}$ has secant slope $\dfrac{2 - 1}{2 - (-1)} = \dfrac13$, but its derivative is $-1$ or 1 wherever it exists, never $\tfrac13$: $\abs{x}$ is not differentiable at 0, inside the interval.
:::

```check
same((Abs(2) - Abs(-1))/(2 - (-1)), Rational(1, 3))
```

### Consequences {#consequences}

The Mean Value Theorem turns information about $f'$ into information about $f$. The first consequence: a function whose derivative is 0 everywhere on an interval does not change. Read as a statement about motion, it says that an object whose velocity is 0 throughout a time interval does not move; but even this needs a proof, and the proof needs the Mean Value Theorem.

::: theorem Functions with zero derivative
If $f'(x) = 0$ for every $x$ in an open interval $I$, then $f$ is constant on $I$.
:::

::: proof
Let $x_1 < x_2$ be two numbers in $I$. Since $f$ is differentiable on $I$, it is continuous on $[x_1, x_2]$ ([Theorem 4.1](module_04_EN.html#continuity)) and differentiable on $(x_1, x_2)$. By the Mean Value Theorem, $f(x_2) - f(x_1) = f'(c)(x_2 - x_1)$ for some $c$ between them, and $f'(c) = 0$. So $f(x_1) = f(x_2)$: any two values of $f$ on $I$ are equal.
:::

::: theorem Functions with equal derivatives
If $f'(x) = g'(x)$ for every $x$ in an open interval $I$, then $f - g$ is constant on $I$: there is a number $C$ with $f(x) = g(x) + C$ for every $x$ in $I$.
:::

::: proof
$(f - g)' = f' - g' = 0$ on $I$, so $f - g$ is constant on $I$ by Theorem 8.5.
:::

So two functions with the same derivative on an interval differ by a constant: their graphs are vertical shifts of each other. Module 10 builds on this; it is why every antiderivative ends in "$+\,C$".

```check
gm = Function('g')
same(diff(fm(x) - gm(x), x), diff(fm(x), x) - diff(gm(x), x))
same(diff(x**2 + 7, x), diff(x**2, x))
```

::: example An identity from derivatives
Show that $\arcsin x + \arccos x = \dfrac{\pi}{2}$ for every $x$ in $[-1, 1]$.

Let $F(x) = \arcsin x + \arccos x$. For $-1 < x < 1$, the derivatives of Module 6 give

$$F'(x) = \frac{1}{\sqrt{1 - x^2}} - \frac{1}{\sqrt{1 - x^2}} = 0,$$

so by Theorem 8.5, $F$ is constant on $(-1, 1)$. Its value at 0 is $0 + \dfrac{\pi}{2}$, so $F(x) = \dfrac{\pi}{2}$ for $-1 < x < 1$. At the ends, $F(1) = \dfrac{\pi}{2} + 0$ and $F(-1) = -\dfrac{\pi}{2} + \pi = \dfrac{\pi}{2}$. So $F(x) = \dfrac{\pi}{2}$ on all of $[-1, 1]$. Module 6 proved the same identity from the addition formula; here a derivative of 0 proves it.

```check
same(diff(asin(x), x), 1/sqrt(1 - x**2)); same(diff(acos(x), x), -1/sqrt(1 - x**2)); same(diff(asin(x) + acos(x), x), 0)
same(asin(0) + acos(0), pi/2); same(asin(1) + acos(1), pi/2); same(asin(-1) + acos(-1), pi/2)
same(asin(-1), -pi/2); same(acos(-1), pi)
```
:::

::: pitfall
The interval matters. Module 6 found that $\arctan x + \arctan\dfrac1x$ has derivative 0 at every $x \ne 0$, yet it equals $\dfrac{\pi}{2}$ for $x > 0$ and $-\dfrac{\pi}{2}$ for $x < 0$. Its domain, $(-\infty, 0) \cup (0, \infty)$, is two intervals, and Theorem 8.5 applies to each one separately, with a constant of its own.
:::

```check
same(diff(atan(x) + atan(1/x), x), 0); same(atan(1) + atan(1), pi/2); same(atan(-1) + atan(-1), -pi/2)
```

:::: deeper Cauchy's mean value theorem and the proof of L'Hôpital's rule
Module 7 stated L'Hôpital's rule in general, proved it only in its simple form, and promised the general proof here. It rests on a mean value theorem for two functions at once.

::: theorem Cauchy's mean value theorem
Let $f$ and $g$ be continuous on $[a, b]$ and differentiable on $(a, b)$. Then there is a number $c$ in $(a, b)$ with

$$\big(f(b) - f(a)\big)g'(c) = \big(g(b) - g(a)\big)f'(c).$$

If also $g'(x) \ne 0$ for every $x$ in $(a, b)$, then $g(b) \ne g(a)$, and

$$\frac{f(b) - f(a)}{g(b) - g(a)} = \frac{f'(c)}{g'(c)}.$$
:::

::: proof
Let $h(x) = \big(f(b) - f(a)\big)g(x) - \big(g(b) - g(a)\big)f(x)$. It is continuous on $[a, b]$ and differentiable on $(a, b)$, and multiplying out shows that $h(a) = f(b)g(a) - f(a)g(b) = h(b)$. By Rolle's theorem, $h'(c) = 0$ for some $c$ in $(a, b)$, which is the first equation. If $g' \ne 0$ on $(a, b)$, then $g(b) \ne g(a)$, since otherwise Rolle's theorem would give a zero of $g'$; so you may divide by $\big(g(b) - g(a)\big)g'(c)$.
:::

With $g(x) = x$ it is the Mean Value Theorem. Recall the general rule, as [Theorem 7.5](module_07_EN.html#the-rule) states it: let $f$ and $g$ be differentiable on an open interval $I$ containing $a$, except possibly at $a$, with $g'(x) \ne 0$ for $x \ne a$ in $I$; if $f(x)/g(x)$ has the form $0/0$ or $\infty/\infty$ as $x \to a$, and $f'(x)/g'(x) \to L$, a real number or $\pm\infty$, then $f(x)/g(x) \to L$; and the same holds for one-sided limits and for $x \to \pm\infty$.

::: proof of L'Hôpital's rule
**The form $0/0$, from the right.** Suppose that $f$ and $g$ are differentiable on $(a, b)$, $g' \ne 0$ there, $f(x) \to 0$ and $g(x) \to 0$ as $x \to a^+$, and $f'(x)/g'(x) \to L$. Give $f$ and $g$ the values $f(a) = g(a) = 0$; this changes no limit as $x \to a^+$, and makes $f$ and $g$ continuous on $[a, y]$ for every $y$ in $(a, b)$. By Cauchy's theorem on $[a, y]$, there is a $c_y$ with $a < c_y < y$ and

$$\frac{f(y)}{g(y)} = \frac{f(y) - f(a)}{g(y) - g(a)} = \frac{f'(c_y)}{g'(c_y)}.$$

Let $L$ be a real number and $\varepsilon > 0$. There is a $\delta > 0$, with $a + \delta \le b$, such that $\abs{f'(t)/g'(t) - L} < \varepsilon$ whenever $a < t < a + \delta$. For $a < y < a + \delta$, the number $c_y$ lies in $(a, a + \delta)$ too, so $\abs{f(y)/g(y) - L} < \varepsilon$; that is, $f(y)/g(y) \to L$ as $y \to a^+$. If $L = \infty$, the same argument with "$f'(t)/g'(t) > M$" in place of "$\abs{f'(t)/g'(t) - L} < \varepsilon$", for an arbitrary $M$, shows $f(y)/g(y) > M$ for $a < y < a + \delta$; $L = -\infty$ is the same.

**Other directions.** From the left, use $[y, a]$ in the same way. A two-sided limit is a pair of one-sided limits. For $x \to \infty$, with $I = (b, \infty)$, where you may take $b > 0$ by shrinking $I$, put $F(t) = f(1/t)$ and $G(t) = g(1/t)$ for $0 < t < 1/b$. By the chain rule $F'(t) = -f'(1/t)/t^2$ and $G'(t) = -g'(1/t)/t^2 \ne 0$, so $F'(t)/G'(t) = f'(1/t)/g'(1/t) \to L$ as $t \to 0^+$, and the case above gives $F(t)/G(t) \to L$, which says that $f(x)/g(x) \to L$ as $x \to \infty$. For $x \to -\infty$ use $t = -1/x$.

**The form $\infty/\infty$, from the right, with $L$ real.** Now $\abs{g(x)} \to \infty$ as $x \to a^+$. Let $0 < \varepsilon < 1$, choose $\delta$ as before, and fix $y = a + \delta$ (shrinking $\delta$ first if necessary, so that $y < b$). For $a < x < y$, Cauchy's theorem on $[x, y]$ gives a $c$ between $x$ and $y$ with

$$Q = \frac{f(x) - f(y)}{g(x) - g(y)} = \frac{f'(c)}{g'(c)},$$

so $\abs{Q - L} < \varepsilon$ and $\abs{Q} < \abs{L} + 1$. For $x$ so close to $a$ that $g(x) \ne 0$, solving $f(x) = Q\big(g(x) - g(y)\big) + f(y)$ for the ratio gives

$$\frac{f(x)}{g(x)} - L = (Q - L) - Q\,\frac{g(y)}{g(x)} + \frac{f(y)}{g(x)}.$$

Since $y$ is fixed and $\abs{g(x)} \to \infty$, the last two fractions tend to 0 as $x \to a^+$; for $x$ close enough to $a$ each is smaller than $\varepsilon$ in size, and then $\abs{f(x)/g(x) - L} < \varepsilon + (\abs{L} + 1)\varepsilon + \varepsilon = (\abs{L} + 3)\varepsilon$. As $\varepsilon$ is arbitrary, $f(x)/g(x) \to L$. If $L = \infty$, take an arbitrary $M > 0$ and choose $y$ so that $f'(t)/g'(t) > 2M$ for $a < t < y$; then $Q > 2M$ for every $x$ in $(a, y)$. For $x$ close enough to $a$, also $1 - g(y)/g(x) > \tfrac12$ and $\abs{f(y)/g(x)} < 1$, so $f(x)/g(x) = Q\big(1 - g(y)/g(x)\big) + f(y)/g(x) > M - 1$; as $M$ is arbitrary, $f(x)/g(x) \to \infty$. If $L = -\infty$, apply this to $-f$. The other directions follow as for $0/0$.
:::

The proof of the form $\infty/\infty$ used only $\abs{g(x)} \to \infty$, not $f(x) \to \pm\infty$: the rule holds whenever $\abs{g(x)} \to \infty$ and $f'/g'$ has a limit.

```check
Fc, Gc = Function('F'), Function('G')
hC = (Fc(b) - Fc(a))*Gc(x) - (Gc(b) - Gc(a))*Fc(x)
same(expand(hC.subs(x, a)), Fc(b)*Gc(a) - Fc(a)*Gc(b)); same(expand(hC.subs(x, b)), Fc(b)*Gc(a) - Fc(a)*Gc(b))
same(diff(Fc(1/t), t), -Subs(Derivative(Fc(u), u), u, 1/t)/t**2)
Q_, fx, fy, gx, gy, L_ = symbols('Q f_x f_y g_x g_y L')
same(solve(Eq(Q_*(gx - gy) + fy, fx), fx)[0]/gx - L_, (Q_ - L_) - Q_*gy/gx + fy/gx)
same(Q_*(1 - gy/gx) + fy/gx, (Q_*(gx - gy) + fy)/gx)
```
::::

## Increasing and decreasing functions {#monotonic}

Module 4 observed that where a graph rises its tangents slope upwards, and promised a partial converse: where $f' > 0$ on an interval, $f$ rises. The Mean Value Theorem delivers it.

::: definition Increasing and decreasing functions
A function $f$ is **increasing** on an interval $I$ if $f(x_1) < f(x_2)$ whenever $x_1 < x_2$ in $I$, and **decreasing** on $I$ if $f(x_1) > f(x_2)$ whenever $x_1 < x_2$ in $I$.
:::

These are the definitions of [Section 4.3](module_04_EN.html#graph-of-derivative). Some books call them **strictly** increasing and decreasing, and use "increasing" for the weaker $f(x_1) \le f(x_2)$; this series follows Module 4.

::: theorem The increasing/decreasing test
Let $f$ be continuous on an interval $I$ and differentiable at every point of $I$ that is not an endpoint of $I$.

- If $f'(x) > 0$ at every such point, $f$ is increasing on $I$.
- If $f'(x) < 0$ at every such point, $f$ is decreasing on $I$.
:::

::: proof
Let $x_1 < x_2$ be in $I$. Then $f$ is continuous on $[x_1, x_2]$ and differentiable on $(x_1, x_2)$, whose points are not endpoints of $I$. By the Mean Value Theorem, $f(x_2) - f(x_1) = f'(c)(x_2 - x_1)$ for some $c$ between $x_1$ and $x_2$. If $f' > 0$, both factors are positive, so $f(x_2) > f(x_1)$. If $f' < 0$, the product is negative, so $f(x_2) < f(x_1)$.
:::

The endpoints may belong to $I$: $x^2$ is increasing on $[0, \infty)$, since its derivative $2x$ is positive for $x > 0$, although it is 0 at the endpoint 0. A single zero of $f'$ inside an interval does not spoil the conclusion either: $x^3$ is increasing on $(-\infty, 0]$ and on $[0, \infty)$, so for $x_1 < 0 < x_2$, $x_1^3 < 0 < x_2^3$, and $x^3$ is increasing on all of $\R$, although its derivative is 0 at 0. The same argument covers any finite number of zeros.

```check
same(solve_univariate_inequality(2*x > 0, x, relational=False), Interval.open(0, oo))
same(diff(x**3, x), 3*x**2); same(solve(3*x**2, x), [0])
```

To use the test you need the intervals on which $f'$ has one sign. If $f'$ is continuous on an interval and never 0 there, it cannot change sign there, because by the Intermediate Value Theorem a change of sign would need a zero in between. Every derivative in this module is continuous wherever it exists, so it can change sign only at critical numbers and at points outside the domain of $f$. (Not every derivative is continuous. The function $x^2\sin(1/x)$, with the value 0 at 0, of [Exercise 4.11](module_04_EN.html#ex-4-11) has a derivative at every point, but for $x \ne 0$ its derivative is $2x\sin(1/x) - \cos(1/x)$, which swings between values near $-1$ and near 1 as $x \to 0$, so it is not continuous at 0.) Mark those points on the number line; they cut it into intervals, and the sign of $f'$ at one test point of each interval is its sign on the whole interval. A table of these signs is a **sign chart**.

```check
gw = x**2*sin(1/x)
same(diff(gw, x), 2*x*sin(1/x) - cos(1/x)); limit_is(gw/x, x, 0, 0)                     # g'(0) = 0 from the definition
same([diff(gw, x).subs(x, 1/(2*k_*pi)) for k_ in (1, 2, 3)], [-1, -1, -1])                  # x = 1/(2k pi) -> 0
same([diff(gw, x).subs(x, 1/((2*k_ + 1)*pi)) for k_ in (1, 2, 3)], [1, 1, 1])              # x = 1/((2k+1) pi) -> 0
```

::: example Where a cubic rises and falls
Find where $g(x) = 2x^3 - 9x^2 + 12x - 4$ is increasing and where it is decreasing.

[Example 4.8](module_04_EN.html#polynomials) found $g'(x) = 6x^2 - 18x + 12 = 6(x - 1)(x - 2)$, which is continuous and 0 only at 1 and 2. The sign chart reads the sign of $g'$ from the signs of its factors:

| Interval | $x - 1$ | $x - 2$ | $g'(x)$ | $g$ |
|---|---|---|---|---|
| $x < 1$ | $-$ | $-$ | $+$ | increasing |
| $1 < x < 2$ | $+$ | $-$ | $-$ | decreasing |
| $x > 2$ | $+$ | $+$ | $+$ | increasing |

Since $g$ is continuous, Theorem 8.8 lets you include the endpoints: $g$ is increasing on $(-\infty, 1]$ and on $[2, \infty)$, and decreasing on $[1, 2]$. In particular the graph falls all the way from $(1, 1)$ to $(2, 0)$, as Module 4 promised.

```check
g86 = 2*x**3 - 9*x**2 + 12*x - 4
same(factor(diff(g86, x)), 6*(x - 1)*(x - 2))
same(solve_univariate_inequality(diff(g86, x) > 0, x, relational=False), Union(Interval.open(-oo, 1), Interval.open(2, oo)))
same(solve_univariate_inequality(diff(g86, x) < 0, x, relational=False), Interval.open(1, 2))
same(g86.subs(x, 1), 1); same(g86.subs(x, 2), 0)
same([sign(v_ - 1) for v_ in (0, Rational(3, 2), 3)], [-1, 1, 1]); same([sign(v_ - 2) for v_ in (0, Rational(3, 2), 3)], [-1, -1, 1])
```
:::

### The first derivative test {#first-derivative-test}

In Example 8.6 the graph rises to $x = 1$ and then falls: so $g(1)$ is a local maximum. Then it falls to $x = 2$ and rises again: $g(2)$ is a local minimum. That reasoning works at every critical number.

::: theorem The first derivative test
Let $c$ be a critical number of $f$, let $f$ be continuous at $c$, and let $f$ be differentiable on an open interval around $c$, except possibly at $c$ itself.

- If $f'$ changes from positive to negative at $c$ (that is, $f'(x) > 0$ for $x < c$ and $f'(x) < 0$ for $x > c$, in that interval), then $f(c)$ is a local maximum value.
- If $f'$ changes from negative to positive at $c$, then $f(c)$ is a local minimum value.
- If $f'$ has the same sign on both sides of $c$, then $f$ has no local extremum at $c$.
:::

::: proof
Let the interval be $(p, q)$. Suppose $f' > 0$ on $(p, c)$ and $f' < 0$ on $(c, q)$. On $(p, c]$, $f$ is continuous (it is differentiable on $(p, c)$ and continuous at $c$), so by Theorem 8.8 it is increasing there: $f(x) < f(c)$ for $p < x < c$. In the same way $f$ is decreasing on $[c, q)$: $f(x) < f(c)$ for $c < x < q$. So $f(c) \ge f(x)$ on all of $(p, q)$, a local maximum. The second case is the same with the inequalities reversed. In the third, if $f' > 0$ on both sides, $f$ is increasing on $(p, c]$ and on $[c, q)$, so for $p < x < c < y < q$, $f(x) < f(c) < f(y)$: every open interval around $c$ contains points where $f$ is smaller than $f(c)$ and points where it is larger, and $f(c)$ is not an extremum. The case $f' < 0$ is the same.
:::

::: example A local maximum at a cusp
Find the local extreme values of $g(x) = x^{2/3}(x - 5)$, the function of Examples 8.1 and 8.2.

Its critical numbers are 0 and 2, and $g'(x) = \dfrac{5(x - 2)}{3\sqrt[3]{x}}$ for $x \ne 0$. The cube root has the sign of $x$:

| Interval | $x - 2$ | $\sqrt[3]{x}$ | $g'(x)$ | $g$ |
|---|---|---|---|---|
| $x < 0$ | $-$ | $-$ | $+$ | increasing |
| $0 < x < 2$ | $-$ | $+$ | $-$ | decreasing |
| $x > 2$ | $+$ | $+$ | $+$ | increasing |

$g$ is continuous at 0, and $g'$ changes from positive to negative there, so $g(0) = 0$ is a local maximum value, at a cusp where $g'$ does not exist. At 2, $g'$ changes from negative to positive, so $g(2) = -3\sqrt[3]{4} \approx -4.762$ is a local minimum value.

```check
same(solve_univariate_inequality(5*(xp - 2)/(3*real_root(xp, 3)) < 0, xp, relational=False), Interval.open(0, 2))
holds(5*(-1 - 2)/(3*real_root(-1, 3)) > 0); holds(5*(3 - 2)/(3*real_root(3, 3)) > 0); holds(5*(1 - 2)/(3*real_root(1, 3)) < 0)
same(sign(real_root(-8, 3)), -1); same(gR(0), 0)
```
:::

The same reasoning proves inequalities that are hard to prove by algebra.

::: example An inequality for $e^x$
Show that $e^x \ge 1 + x$ for every real $x$, with equality only at $x = 0$.

Let $f(x) = e^x - 1 - x$. Then $f'(x) = e^x - 1$. Since $e^x$ is increasing and $e^0 = 1$, $f'(x) < 0$ for $x < 0$ and $f'(x) > 0$ for $x > 0$. By Theorem 8.8, $f$ is decreasing on $(-\infty, 0]$ and increasing on $[0, \infty)$, so $f(x) > f(0) = 0$ for every $x \ne 0$. That is, $e^x > 1 + x$ for $x \ne 0$, and $e^0 = 1 + 0$. Geometrically, the graph of $e^x$ lies above its tangent line $y = 1 + x$ at 0, the linearisation of Module 7; Section 8.4 explains why.

```check
f88 = exp(x) - 1 - x
same(diff(f88, x), exp(x) - 1); same(f88.subs(x, 0), 0)
same(solve_univariate_inequality(exp(x) - 1 < 0, x, relational=False), Interval.open(-oo, 0))
same(solve_univariate_inequality(exp(x) - 1 > 0, x, relational=False), Interval.open(0, oo))
same(minimum(f88, x, S.Reals), 0)
```
:::

::: pitfall
Two slips with sign charts. First, $f'$ can also change sign at a point outside the domain, such as a vertical asymptote, and there is no extremum there: $f(x) = 1/x^2$ has $f'(x) = -2/x^3$, positive for $x < 0$ and negative for $x > 0$, but $f$ has no maximum, since 0 is not in its domain and $f(x) \to \infty$ as $x \to 0$. Put such points on the chart, but never call them extrema. Second, "increasing on $(-\infty, 0)$ and on $(0, \infty)$" is not "increasing on $(-\infty, 0) \cup (0, \infty)$": $-1/x$ is increasing on each interval, yet $-1/(-1) = 1$ is larger than $-1/1 = -1$.
:::

```check
same(diff(1/x**2, x), -2/x**3); limit_is(1/x**2, x, 0, oo)
same(diff(-1/x, x), 1/x**2); same(-1/Integer(-1), 1); same(-1/Integer(1), -1)
```

## Concavity {#concavity}

The sign of $f'$ says whether a graph rises or falls; it does not say how it bends. Both halves of the graph in Figure 8.3 rise, but the left half bends upwards, like the inside of a bowl, and the right half bends downwards, like a dome. The curve is the **sigmoid function** of machine learning,

$$\sigma(x) = \frac{1}{1 + e^{-x}},$$

read "sigma of x", which turns any real number into a number between 0 and 1. By the chain rule, $\sigma'(x) = \dfrac{e^{-x}}{(1 + e^{-x})^2}$. Here are its slopes:

```valuetable
x = -3, -2, -1, 0, 1, 2, 3
$\sigma'(x)$ = exp(-x)/(1 + exp(-x))**2
digits = 4
layout = columns
---
x | \sigma'(x)
-3 | 0.04518
-2 | 0.1050
-1 | 0.1966
0 | 0.25
1 | 0.1966
2 | 0.1050
3 | 0.04518
```

```check
sg = 1/(1 + exp(-x))
same(diff(sg, x), exp(-x)/(1 + exp(-x))**2)
holds(Integer(0) < sg.subs(x, -10)); holds(sg.subs(x, 10) < 1)
```

From left to right the slopes increase up to $x = 0$ and then decrease. Where the slopes increase, the curve bends upwards and lies above its tangent lines; where they decrease, it bends downwards and lies below them (Figure 8.3).

::: figure id=fig-08-3
Top: the sigmoid $y = \sigma(x)$ with tangent lines at four points. For $x < 0$ (green) the graph is concave up and lies above its tangents; for $x > 0$ (purple) it is concave down and lies below them. The concavity changes at the inflection point $(0, \tfrac12)$. Bottom: the slopes $\sigma'(x)$ increase for $x < 0$ and decrease for $x > 0$; they are largest, $\tfrac14$, at the inflection point.
:::

::: definition Concavity
Let $f$ be differentiable on an open interval $I$. The graph of $f$ is **concave up** on $I$ if $f'$ is increasing on $I$, and **concave down** on $I$ if $f'$ is decreasing on $I$.
:::

In optimisation and machine learning a function whose graph is concave up is called **convex**, and one whose graph is concave down is called **concave**. Since $f''$ is the derivative of $f'$, Theorem 8.8 applied to $f'$ gives a test.

::: theorem The concavity test
If $f''(x) > 0$ for every $x$ in an open interval $I$, the graph of $f$ is concave up on $I$. If $f''(x) < 0$ for every $x$ in $I$, it is concave down on $I$.
:::

::: proof
$f'$ is differentiable on $I$, with derivative $f''$, so it is continuous on $I$; by Theorem 8.8 applied to $f'$, it is increasing on $I$ if $f'' > 0$ and decreasing if $f'' < 0$.
:::

The tangent lines of Figure 8.3 behave as they do for every function.

::: theorem Concavity and tangent lines
If the graph of $f$ is concave up on an open interval $I$, then for every $c$ in $I$ it lies above its tangent line at $c$:

$$f(x) > f(c) + f'(c)(x - c) \quad\text{for every } x \ne c \text{ in } I.$$

If it is concave down on $I$, it lies below its tangent lines. In particular, if the graph is concave up on $I$ and $f'(c) = 0$, then $f(c)$ is the absolute minimum value of $f$ on $I$, taken only at $c$; if it is concave down and $f'(c) = 0$, $f(c)$ is the absolute maximum value.
:::

::: proof
Let $x > c$ be in $I$. By the Mean Value Theorem, $f(x) - f(c) = f'(t)(x - c)$ for some $t$ in $(c, x)$. Since $f'$ is increasing and $t > c$, $f'(t) > f'(c)$; multiplying by $x - c > 0$ gives $f(x) - f(c) > f'(c)(x - c)$. If $x < c$, the Mean Value Theorem on $[x, c]$ gives $f(c) - f(x) = f'(t)(c - x)$ with $x < t < c$, so $f'(t) < f'(c)$, and $f(c) - f(x) < f'(c)(c - x)$, which rearranges to the same inequality. When $f'(c) = 0$ the tangent line is $y = f(c)$, so $f(x) > f(c)$ for every other $x$ in $I$. The concave-down case is the same with the inequalities reversed.
:::

```check
D_ = symbols('D')                                       # D stands for f'(c)
same((fm(x) - fm(c)) - D_*(x - c), -((fm(c) - fm(x)) - D_*(c - x)))   # "f(c) - f(x) < D(c - x)" is "f(x) > f(c) + D(x - c)"
holds(exp(Rational(1, 2)) > 1 + Rational(1, 2)); holds(exp(-Rational(1, 2)) > 1 - Rational(1, 2))   # e^x above its tangent at 0
```

The points where the concavity changes have a name.

::: definition Inflection point
A point $(c, f(c))$ of the graph of $f$ is an **inflection point** if $f$ is continuous at $c$ and the graph changes concavity at $c$: for some $\delta > 0$ it is concave up on $(c - \delta, c)$ and concave down on $(c, c + \delta)$, or concave down and then concave up.
:::

::: theorem The second derivative at an inflection point
If $(c, f(c))$ is an inflection point and $f''(c)$ exists, then $f''(c) = 0$.
:::

::: proof
Say the graph is concave up on $(c - \delta, c)$ and concave down on $(c, c + \delta)$, so that $f'$ is increasing on the first interval and decreasing on the second. Since $f''(c)$ exists, $f'$ is differentiable at $c$, hence continuous there. For $c - \delta < x < y < c$, $f'(x) < f'(y)$, and letting $y \to c$ gives $f'(x) \le f'(c)$; in the same way $f'(x) \le f'(c)$ for $c < x < c + \delta$. So $f'$ has a local maximum at $c$, and by Fermat's theorem, applied to $f'$, its derivative there is 0: $f''(c) = 0$. The other case gives a local minimum of $f'$, with the same conclusion.
:::

So the candidates for inflection points are the points where $f'' = 0$ and the points where $f''$ does not exist, and a sign chart of $f''$ decides. The proof also shows that the slope $f'$ has a local maximum or minimum at an inflection point where $f''$ exists: compared with its neighbourhood, the graph is steepest there, or least steep.

::: example The bend of the sigmoid
For $\sigma(x) = \dfrac{1}{1 + e^{-x}}$, show that $\sigma' = \sigma(1 - \sigma)$, find $\sigma''$, the intervals of concavity and the inflection point, and the largest value of $\sigma'$.

Since $1 - \sigma(x) = \dfrac{1 + e^{-x} - 1}{1 + e^{-x}} = \dfrac{e^{-x}}{1 + e^{-x}}$,

$$\sigma(x)\big(1 - \sigma(x)\big) = \frac{1}{1 + e^{-x}}\cdot\frac{e^{-x}}{1 + e^{-x}} = \frac{e^{-x}}{(1 + e^{-x})^2} = \sigma'(x).$$

Differentiate $\sigma' = \sigma - \sigma^2$, using the chain rule on $\sigma^2$:

$$\sigma'' = \sigma' - 2\sigma\sigma' = \sigma'(1 - 2\sigma).$$

Since $\sigma' > 0$, $\sigma''$ has the sign of $1 - 2\sigma$. Now $1 - 2\sigma(x) > 0$ exactly when $\sigma(x) < \tfrac12$, that is, when $1 + e^{-x} > 2$, that is, when $e^{-x} > 1$, that is, when $x < 0$. So $\sigma'' > 0$ for $x < 0$ and $\sigma'' < 0$ for $x > 0$: the graph is concave up on $(-\infty, 0)$ and concave down on $(0, \infty)$, and $\big(0, \sigma(0)\big) = \big(0, \tfrac12\big)$ is an inflection point. Finally, $\sigma'$ is increasing on $(-\infty, 0]$ and decreasing on $[0, \infty)$ (Theorem 8.8 applied to $\sigma'$, whose derivative is $\sigma''$), so its absolute maximum value is $\sigma'(0) = \tfrac14$: the sigmoid is steepest at its inflection point, as the table above showed.

```check
steps(1 - sg, (1 + exp(-x) - 1)/(1 + exp(-x)), exp(-x)/(1 + exp(-x)))
steps(sg*(1 - sg), 1/(1 + exp(-x))*exp(-x)/(1 + exp(-x)), exp(-x)/(1 + exp(-x))**2, diff(sg, x))
same(diff(sg - sg**2, x), diff(sg, x) - 2*sg*diff(sg, x)); same(diff(sg, x, 2), diff(sg, x)*(1 - 2*sg))
same(solve_univariate_inequality(1 - 2*sg > 0, x, relational=False), Interval.open(-oo, 0))
same(solve_univariate_inequality(1 - 2*sg < 0, x, relational=False), Interval.open(0, oo))
same(sg.subs(x, 0), Rational(1, 2)); same(diff(sg, x).subs(x, 0), Rational(1, 4))
same(maximum(diff(sg, x), x, S.Reals), Rational(1, 4))
```
:::

In machine learning, $\sigma(x)$ turns a score $x$ into a probability. Its slope is at most $\tfrac14$ and very small when $\abs{x}$ is large, which matters when a model is trained by following slopes, as in Section 8.7.

::: pitfall
Three slips with inflection points. **$f''(c) = 0$ is not enough**: $x^4$ has $f''(x) = 12x^2$, which is 0 at 0 but positive on both sides, so the graph is concave up on both sides and has no inflection point. **$f''$ need not exist at an inflection point**: $x^{1/3}$ has $f''(x) = -\tfrac29x^{-5/3}$, positive for $x < 0$ and negative for $x > 0$, so the origin is an inflection point (with a vertical tangent) although $f''(0)$ does not exist. **A change of concavity at a point outside the domain is not an inflection point**: $1/x$ is concave down for $x < 0$ and concave up for $x > 0$, but has no point at 0. And concave up is not increasing: $e^{-x}$ is concave up and decreasing.
:::

```check
same(diff(x**4, x, 2), 12*x**2); same(diff(xp**Rational(1, 3), xp, 2), -Rational(2, 9)*xp**Rational(-5, 3))
same(diff(-(-xn)**Rational(1, 3), xn, 2), -Rational(2, 9)*real_root(xn, 3)**(-5)); holds(-Rational(2, 9)*real_root(-1, 3)**(-5) > 0)
same(diff(1/x, x, 2), 2/x**3); same(diff(exp(-x), x, 2), exp(-x)); same(diff(exp(-x), x), -exp(-x))
```

### The second derivative test {#second-derivative-test}

At a critical number where $f'(c) = 0$, the tangent is horizontal. If the graph is concave up there, it lies above the horizontal tangent near $c$, a valley; if it is concave down, it lies below, a peak. That is the idea of a second test, which needs no sign chart of $f'$.

::: theorem The second derivative test
Suppose that $f'(c) = 0$ and $f''(c)$ exists.

- If $f''(c) > 0$, $f(c)$ is a local minimum value.
- If $f''(c) < 0$, $f(c)$ is a local maximum value.
- If $f''(c) = 0$, the test gives no information.
:::

::: proof
Suppose $f''(c) > 0$. Since $f'(c) = 0$,

$$f''(c) = \lim_{x\to c}\frac{f'(x) - f'(c)}{x - c} = \lim_{x\to c}\frac{f'(x)}{x - c} > 0.$$

So, as in the proof of Fermat's theorem, there is a $\delta > 0$ such that $\dfrac{f'(x)}{x - c} > 0$ whenever $0 < \abs{x - c} < \delta$: then $f'(x) < 0$ for $c - \delta < x < c$ and $f'(x) > 0$ for $c < x < c + \delta$. $f$ is differentiable near $c$ (as $f''(c)$ exists), so the first derivative test gives a local minimum. If $f''(c) < 0$, the signs reverse and give a local maximum. For the third case, the three functions $x^4$, $-x^4$ and $x^3$ all have $f'(0) = f''(0) = 0$, and they have a minimum, a maximum and neither at 0.
:::

```check
for f_, kind_ in ((x**4, 'min'), (-x**4, 'max'), (x**3, 'none')):
    same(diff(f_, x).subs(x, 0), 0); same(diff(f_, x, 2).subs(x, 0), 0)
same(minimum(x**4, x, S.Reals), 0); same(maximum(-x**4, x, S.Reals), 0)
```

::: example When the second derivative test fails
Find the local extrema and the inflection points of $f(x) = x^4 - 4x^3$.

The derivatives are

$$\begin{aligned} f'(x) &= 4x^3 - 12x^2 = 4x^2(x - 3), \\ f''(x) &= 12x^2 - 24x = 12x(x - 2). \end{aligned}$$

**Extrema.** The critical numbers are 0 and 3. At 3, $f''(3) = 108 - 72 = 36 > 0$, so $f(3) = 81 - 108 = -27$ is a local minimum value. At 0, $f''(0) = 0$, and the test says nothing. Use the first derivative test instead: for $x < 0$ and for $0 < x < 3$, $4x^2 > 0$ and $x - 3 < 0$, so $f'(x) < 0$ on both sides of 0. There is no extremum at 0: the graph flattens out for a moment as it falls. In fact $f$ is decreasing on $(-\infty, 3]$ and increasing on $[3, \infty)$, so $-27$ is the absolute minimum value.

**Concavity.** $f''(x) = 12x(x - 2)$ is positive for $x < 0$, negative for $0 < x < 2$ and positive for $x > 2$. The graph is concave up on $(-\infty, 0)$, concave down on $(0, 2)$ and concave up on $(2, \infty)$, with inflection points $(0, 0)$ and $(2, f(2)) = (2, -16)$. At the origin the graph has a horizontal tangent and an inflection point at once.

```check
f810 = x**4 - 4*x**3
steps(diff(f810, x), 4*x**3 - 12*x**2, 4*x**2*(x - 3)); steps(diff(f810, x, 2), 12*x**2 - 24*x, 12*x*(x - 2))
same_set(solve(diff(f810, x), x), [0, 3]); same(diff(f810, x, 2).subs(x, 3), 36); same(108 - 72, 36)
same(f810.subs(x, 3), -27); same(81 - 108, -27); same(diff(f810, x, 2).subs(x, 0), 0)
same(solve_univariate_inequality(diff(f810, x) < 0, x, relational=False), Union(Interval.open(-oo, 0), Interval.open(0, 3)))
same(minimum(f810, x, S.Reals), -27)
same(solve_univariate_inequality(diff(f810, x, 2) < 0, x, relational=False), Interval.open(0, 2))
same(solve_univariate_inequality(diff(f810, x, 2) > 0, x, relational=False), Union(Interval.open(-oo, 0), Interval.open(2, oo)))
same(f810.subs(x, 0), 0); same(f810.subs(x, 2), -16)
```
:::

::: tip
Which test should you use? The second derivative test is quick when $f''$ is easy to compute, and it decides most critical numbers where $f'(c) = 0$. The first derivative test always decides, also where $f''(c) = 0$ and where $f'(c)$ does not exist, and its sign chart tells you where $f$ increases and decreases as well.
:::

## Curve sketching {#sketching}

A computer draws a graph by plotting many points; it does not tell you which features matter, and it can miss them between its points or outside its window. The derivatives find the features, and with them you can sketch a graph that shows everything important.

::: keyidea
**A checklist for sketching $y = f(x)$.**

1. **Domain**: where is $f$ defined?
2. **Intercepts**: the $y$-intercept $f(0)$, if 0 is in the domain; the $x$-intercepts, the solutions of $f(x) = 0$, when you can find them.
3. **Symmetry**: is $f$ even, $f(-x) = f(x)$, or odd, $f(-x) = -f(x)$ ([Section 1.4](module_01_EN.html#polynomials))? Is it periodic?
4. **Asymptotes**: vertical, horizontal and oblique (Module 3).
5. **Increase and decrease**: a sign chart of $f'$.
6. **Local extrema**: the first or the second derivative test.
7. **Concavity and inflection points**: a sign chart of $f''$.
8. **Sketch**: draw the asymptotes, plot the points found, and join them with a curve that rises, falls and bends as the charts say.
:::

::: example Sketching a rational function
Sketch the graph of $f(x) = \dfrac{x^2}{x^2 - 4}$.

1. **Domain.** $x^2 - 4 = 0$ at $x = \pm2$, so the domain is all $x \ne \pm2$.
2. **Intercepts.** $f(0) = 0$, and $f(x) = 0$ only when $x^2 = 0$: the only intercept is the origin.
3. **Symmetry.** $f(-x) = f(x)$: $f$ is even, and its graph is symmetric about the $y$-axis.
4. **Asymptotes.** As $x \to \pm\infty$, dividing the top and the bottom by $x^2$ gives $f(x) = \dfrac{1}{1 - 4/x^2} \to 1$: the line $y = 1$ is a horizontal asymptote. Since $f(x) - 1 = \dfrac{4}{x^2 - 4}$, which is positive for $\abs{x} > 2$, the graph approaches it from above. As $x \to 2^+$, the top tends to 4 and the bottom to 0 through positive values, so $f(x) \to \infty$; as $x \to 2^-$, $f(x) \to -\infty$. By symmetry, $f(x) \to \infty$ as $x \to -2^-$ and $f(x) \to -\infty$ as $x \to -2^+$. The lines $x = \pm2$ are vertical asymptotes.
5. **Increase and decrease.** By the quotient rule (Module 5),

   $$f'(x) = \frac{2x(x^2 - 4) - x^2\cdot 2x}{(x^2 - 4)^2} = \frac{-8x}{(x^2 - 4)^2}.$$

   The denominator is positive, so $f'(x) > 0$ for $x < 0$ and $f'(x) < 0$ for $x > 0$ ($x \ne \pm2$). So $f$ is increasing on $(-\infty, -2)$ and on $(-2, 0]$, and decreasing on $[0, 2)$ and on $(2, \infty)$.
6. **Local extrema.** The only critical number is 0, where $f'$ changes from positive to negative: $f(0) = 0$ is a local maximum value. It is not an absolute maximum, since $f(x) \to \infty$ as $x \to 2^+$.
7. **Concavity.** Write $f'(x) = -8x(x^2 - 4)^{-2}$ and use the product and chain rules:

   $$\begin{aligned} f''(x) &= -8(x^2 - 4)^{-2} + 32x^2(x^2 - 4)^{-3} \\ &= \frac{-8(x^2 - 4) + 32x^2}{(x^2 - 4)^3} = \frac{8(3x^2 + 4)}{(x^2 - 4)^3}. \end{aligned}$$

   The top is always positive, so $f''$ has the sign of $x^2 - 4$: the graph is concave up on $(-\infty, -2)$ and $(2, \infty)$, and concave down on $(-2, 2)$. The concavity changes only at $\pm2$, which are not in the domain: no inflection points.
8. **Sketch.** Figure 8.4, left: two outer branches above $y = 1$, concave up, falling from the vertical asymptotes towards $y = 1$; a middle branch, concave down, with its peak at the origin and plunging to $-\infty$ at both asymptotes. Two more points help: $f(\pm1) = -\tfrac13$ and $f(\pm3) = \tfrac95$.

```check
f811 = x**2/(x**2 - 4)
same_set(solve(x**2 - 4, x), [-2, 2]); same(f811.subs(x, 0), 0); same(solve(x**2, x), [0]); same(f811.subs(x, -x), f811)
same(f811, 1/(1 - 4/x**2)); limit_is(f811, x, oo, 1); limit_is(f811, x, -oo, 1); same(f811 - 1, 4/(x**2 - 4))
limit_is(f811, x, 2, oo, '+'); limit_is(f811, x, 2, -oo, '-'); limit_is(f811, x, -2, oo, '-'); limit_is(f811, x, -2, -oo, '+')
steps(diff(f811, x), (2*x*(x**2 - 4) - x**2*2*x)/(x**2 - 4)**2, -8*x/(x**2 - 4)**2)
steps(diff(-8*x*(x**2 - 4)**(-2), x), -8*(x**2 - 4)**(-2) + 32*x**2*(x**2 - 4)**(-3), (-8*(x**2 - 4) + 32*x**2)/(x**2 - 4)**3, 8*(3*x**2 + 4)/(x**2 - 4)**3)
same(diff(f811, x, 2), 8*(3*x**2 + 4)/(x**2 - 4)**3)
same(f811.subs(x, 1), -Rational(1, 3)); same(f811.subs(x, -1), -Rational(1, 3)); same(f811.subs(x, 3), Rational(9, 5))
```
:::

::: example Sketching $x e^{-x}$
Sketch the graph of $f(x) = xe^{-x}$.

1. **Domain.** All real $x$.
2. **Intercepts.** $e^{-x} > 0$, so $f(x) = 0$ only at $x = 0$: the origin.
3. **Symmetry.** $f(-1) = -e$ and $f(1) = e^{-1}$, so $f$ is neither even nor odd.
4. **Asymptotes.** $f$ is continuous, so there are no vertical asymptotes. As $x \to \infty$, $xe^{-x} = \dfrac{x}{e^x} \to 0$, because exponentials grow faster than powers (Module 7, by L'Hôpital's rule): the $x$-axis is a horizontal asymptote on the right. As $x \to -\infty$, $x \to -\infty$ and $e^{-x} \to \infty$, so $f(x) \to -\infty$.
5. **Increase and decrease.** By the product rule, $f'(x) = e^{-x} - xe^{-x} = (1 - x)e^{-x}$. Since $e^{-x} > 0$, $f'$ has the sign of $1 - x$: $f$ is increasing on $(-\infty, 1]$ and decreasing on $[1, \infty)$.
6. **Extrema.** So $f(1) = e^{-1} = \tfrac1e \approx 0.368$ is not only a local maximum value but the absolute maximum value: $f$ rises to it and falls after it.
7. **Concavity.** $f''(x) = -e^{-x} - (1 - x)e^{-x} = (x - 2)e^{-x}$, negative for $x < 2$ and positive for $x > 2$. The graph is concave down on $(-\infty, 2)$ and concave up on $(2, \infty)$, with an inflection point at $\big(2, 2e^{-2}\big) \approx (2, 0.271)$.
8. **Sketch.** Figure 8.4, right: rising steeply from $-\infty$ through the origin, peaking at $\big(1, \tfrac1e\big)$, and decaying towards the $x$-axis, the bend reversing at $x = 2$.

```check
f812 = x*exp(-x)
same(solve(f812, x), [0]); same(f812.subs(x, -1), -E); same(f812.subs(x, 1), exp(-1))
limit_is(f812, x, oo, 0); limit_is(f812, x, -oo, -oo)
steps(diff(f812, x), exp(-x) - x*exp(-x), (1 - x)*exp(-x))
same(maximum(f812, x, S.Reals), exp(-1)); rounds(exp(-1), '0.368')
steps(diff(f812, x, 2), -exp(-x) - (1 - x)*exp(-x), (x - 2)*exp(-x))
same(solve_univariate_inequality((x - 2)*exp(-x) < 0, x, relational=False), Interval.open(-oo, 2))
rounds(2*exp(-2), '0.271')
```
:::

::: figure id=fig-08-4
The two sketches. Left: $y = \dfrac{x^2}{x^2 - 4}$, with vertical asymptotes $x = \pm2$, horizontal asymptote $y = 1$ (dashed), and a local maximum at the origin; it is concave up outside $[-2, 2]$ and concave down inside, without inflection points. Right: $y = xe^{-x}$, with its maximum $\tfrac1e$ at $x = 1$ and its inflection point at $x = 2$.
:::

The widget below does the sign charts for you, numerically. Use it to check a sketch, not to replace one: it looks only at its window and at the points of its grid.

::: widget name=shape-explorer
The curve is blue where $f$ is increasing and orange where it is decreasing; the background is green where the graph is concave up and purple where it is concave down. Dots mark the critical numbers, squares the inflection points, and the two charts below the graph give the signs of $f'$ and $f''$. Choose $x^4 - 4x^3$ and compare with Example 8.10: the flat point at 0 is a critical number but not an extremum, and it is also an inflection point. Choose $x\,e^{-x}$ and compare with Example 8.12. Then type `x^2/(x^2 - 4)` (Example 8.11), and `cbrt(x^2)(x - 5)`, the function of Example 8.7 (the widget, like Python, reads `x^(2/3)` as undefined for $x < 0$), and move the point with the slider to read $f(x)$, $f'(x)$ and $f''(x)$.
:::

::: compute Curve sketching with SymPy
SymPy does the algebra of a sketch. Declare $x$ real, so that `solve` looks only for real solutions:

```python
import sympy as sp
x = sp.symbols('x', real=True)
f = x**2/(x**2 - 4)
d1 = sp.factor(sp.diff(f, x))
d2 = sp.factor(sp.diff(f, x, 2))
print(d1)
print(d2)
print(sp.solve(d1, x), sp.solve(d2, x))
print(sp.limit(f, x, sp.oo), sp.limit(f, x, 2, '+'), sp.limit(f, x, 2, '-'))
```

```output
-8*x/((x - 2)**2*(x + 2)**2)
8*(3*x**2 + 4)/((x - 2)**3*(x + 2)**3)
[0] []
1 oo -oo
```

These are the derivatives of Example 8.11, with $x^2 - 4$ factored; $f'' = 0$ has no real solution. `solve` also solves inequalities, which gives the sign charts:

```python
print(sp.solve(d1 > 0, x))
print(sp.solve(d2 < 0, x))
z = sp.symbols('z')                  # a symbol with no assumptions
print(sp.solve(3*z**2 + 4, z))
```

```output
(x < 0) & Ne(x, -2)
(-2 < x) & (x < 2)
[-2*sqrt(3)*I/3, 2*sqrt(3)*I/3]
```

Read `&` as "and" and `Ne(x, -2)` as $x \ne -2$: $f' > 0$ for $x < 0$, $x \ne -2$, and $f'' < 0$ on $(-2, 2)$, as in the example. Without `real=True`, `solve` returns complex solutions too: $3z^2 + 4 = 0$ has the solutions $\pm\tfrac{2}{\sqrt3}i$, where $i^2 = -1$, which are of no use on a graph.
:::

```check
same(-2*sqrt(3)*I/3, -2/sqrt(3)*I); same(expand((2*sqrt(3)*I/3)**2*3 + 4), 0)
```

## Optimisation problems {#optimisation}

An optimisation problem in words becomes a problem about the extreme values of a function. The closed interval method handles a continuous function on a closed interval; many problems, though, live on open or unbounded intervals, such as all lengths $r > 0$. There the next theorem, or Theorem 8.11, shows that a critical number gives the absolute extremum.

::: theorem The first derivative test for absolute extrema
Let $f$ be continuous on an interval $I$, let $c$ be in $I$, and let $f$ be differentiable at every point of $I$ except possibly $c$ and the endpoints of $I$. If $f'(x) > 0$ at every such $x < c$ and $f'(x) < 0$ at every such $x > c$, then $f(c)$ is the absolute maximum value of $f$ on $I$. If $f'(x) < 0$ for $x < c$ and $f'(x) > 0$ for $x > c$, $f(c)$ is the absolute minimum value.
:::

::: proof
The points of $I$ that are $\le c$ form an interval on which $f$ is continuous, and $f' > 0$ at those of them that are not endpoints; by Theorem 8.8, $f$ is increasing there, so $f(x) < f(c)$ for every $x < c$ in $I$. In the same way $f$ is decreasing on the points of $I$ that are $\ge c$, so $f(x) < f(c)$ for $x > c$. The minimum is the same.
:::

::: keyidea
**Solving an optimisation problem.**

1. Read the problem and draw a picture. Name the quantities, with their units.
2. Write the quantity to be made largest or smallest as a function of the others.
3. Use the conditions of the problem to make it a function of one variable, and find the interval of values the variable can take.
4. Find the critical numbers in that interval.
5. Show that you have the absolute extremum: by the closed interval method if the interval is closed and bounded; otherwise by the sign of the derivative on each side (Theorem 8.14) or by concavity (Theorem 8.11).
6. Answer the question that was asked, with units, and check that the answer makes sense.
:::

::: example The biggest box from a sheet
Suppose a rectangular sheet of cardboard is 24 cm by 45 cm. Cut a square of side $x$ cm from each corner and fold up the sides to make an open box. Which $x$ gives the largest volume?

The base of the box is $(45 - 2x)$ by $(24 - 2x)$ cm and its height is $x$ cm, so its volume is

$$V(x) = x(24 - 2x)(45 - 2x) \text{ cm}^3.$$

The cuts need $x \ge 0$ and $24 - 2x \ge 0$, so $0 \le x \le 12$ (at the ends the box is flat, with volume 0). Numbers first:

```valuetable
x = 1, 2, 3, 4, 5, 6, 7, 8, 10, 12
$V(x)$ = x*(24 - 2*x)*(45 - 2*x)
layout = columns
---
x | V(x)
1 | 946
2 | 1640
3 | 2106
4 | 2368
5 | 2450
6 | 2376
7 | 2170
8 | 1856
10 | 1000
12 | 0
```

The best cut seems to be near 5 cm. Now calculus. Expand: $V(x) = 4x^3 - 138x^2 + 1080x$, so

$$\begin{aligned} V'(x) &= 12x^2 - 276x + 1080 \\ &= 12(x^2 - 23x + 90) = 12(x - 5)(x - 18). \end{aligned}$$

The critical numbers are 5 and 18, and only 5 lies in $[0, 12]$. By the closed interval method, compare $V(0) = 0$, $V(5) = 5 \cdot 14 \cdot 35 = 2450$ and $V(12) = 0$: the largest volume is 2450 cm³, about 2.45 litres, with cuts of 5 cm, for a box 35 cm by 14 cm by 5 cm deep. The critical number 18 is a value of $x$ for which no box exists.

```check
V813 = x*(24 - 2*x)*(45 - 2*x)
same(expand(V813), 4*x**3 - 138*x**2 + 1080*x)
steps(diff(V813, x), 12*x**2 - 276*x + 1080, 12*(x**2 - 23*x + 90), 12*(x - 5)*(x - 18))
same_set(solve(diff(V813, x), x), [5, 18]); same(V813.subs(x, 5), 2450); same(5*14*35, 2450)
same(V813.subs(x, 0), 0); same(V813.subs(x, 12), 0); same(maximum(V813, x, Interval(0, 12)), 2450)
same(45 - 2*5, 35); same(24 - 2*5, 14); same(Rational(2450, 1000), Rational(245, 100))
```
:::

::: example A can with the least metal
A cylindrical can must hold 330 cm³ (330 ml, a common size for drinks). Which radius $r$ and height $h$ need the least metal, that is, the least surface area, top and bottom included?

The area is $A = 2\pi r^2 + 2\pi rh$: two discs and the side, which unrolls into a rectangle of width $2\pi r$ and height $h$. The volume condition $\pi r^2h = 330$ gives $h = \dfrac{330}{\pi r^2}$, so

$$A(r) = 2\pi r^2 + 2\pi r\cdot\frac{330}{\pi r^2} = 2\pi r^2 + \frac{660}{r}, \qquad r > 0.$$

The interval $(0, \infty)$ is not closed: no closed interval method. Differentiate:

$$A'(r) = 4\pi r - \frac{660}{r^2} = \frac{4\pi r^3 - 660}{r^2},$$

which is 0 when $r^3 = \dfrac{660}{4\pi} = \dfrac{165}{\pi}$, at $r^* = \sqrt[3]{165/\pi} \approx 3.745$ cm. For $r < r^*$ the top $4\pi r^3 - 660$ is negative, and for $r > r^*$ it is positive, so by Theorem 8.14, $A(r^*)$ is the absolute minimum. The height is then

$$h = \frac{330}{\pi r^{*2}} = \frac{330}{\pi r^{*3}}\,r^* = \frac{330}{165}\,r^* = 2r^* \approx 7.49 \text{ cm},$$

using $\pi r^{*3} = 165$, and the area is $A(r^*) \approx 264.4$ cm². The best can is exactly as tall as it is wide: its height equals its diameter. The same steps with any volume $V$ in place of 330 give $r^{*3} = V/(2\pi)$ and again $h = 2r^*$. Real drinks cans are much taller than they are wide, so their makers weigh other things than the area of the metal.

```check
rc = symbols('r', positive=True)
A814 = 2*pi*rc**2 + 2*pi*rc*330/(pi*rc**2)
same(A814, 2*pi*rc**2 + 660/rc); same(diff(A814, rc), (4*pi*rc**3 - 660)/rc**2)
rstar = (165/pi)**Rational(1, 3)
same(solve(diff(A814, rc), rc), [rstar]); same(Rational(660, 4), 165); rounds(rstar, '3.745')
holds(4*pi*3**3 - 660 < 0); holds(4*pi*4**3 - 660 > 0)
same(330/(pi*rstar**2), 2*rstar); rounds(2*rstar, '7.49'); rounds(A814.subs(rc, rstar), '264.4')
```
:::

::: example The closest point on a parabola
Find the point of the parabola $y = x^2$ closest to the point $(3, 0)$.

The distance from $(x, x^2)$ to $(3, 0)$ is $\sqrt{(x - 3)^2 + x^4}$. The square root is increasing, so the distance is smallest where its square is smallest, and the square, free of the root, is easier to differentiate:

$$D(x) = (x - 3)^2 + x^4, \qquad x \text{ real}.$$

$D'(x) = 2(x - 3) + 4x^3 = 2(2x^3 + x - 3)$. Trying small integers, $x = 1$ is a root of $2x^3 + x - 3$, and dividing by $x - 1$ gives

$$D'(x) = 2(x - 1)(2x^2 + 2x + 3).$$

The quadratic factor has no real root, since its discriminant is $4 - 24 < 0$, so the only critical number is 1. And $D''(x) = 12x^2 + 2 > 0$ everywhere: $D$ is concave up on $\R$, so by Theorem 8.11 its critical number gives the absolute minimum. The closest point is $(1, 1)$, at distance $\sqrt{D(1)} = \sqrt{4 + 1} = \sqrt5 \approx 2.236$. A check: the segment from $(3, 0)$ to $(1, 1)$ has slope $-\tfrac12$, and the tangent to the parabola at $(1, 1)$ has slope 2; since $2 \cdot \big(-\tfrac12\big) = -1$, they are perpendicular, as the shortest path to a curve should be.

```check
D815 = (x - 3)**2 + x**4
steps(diff(D815, x), 2*(x - 3) + 4*x**3, 2*(2*x**3 + x - 3), 2*(x - 1)*(2*x**2 + 2*x + 3))
same(discriminant(2*x**2 + 2*x + 3, x), 4 - 24); same([r_ for r_ in solve(diff(D815, x), x) if r_.is_real], [1])
same(diff(D815, x, 2), 12*x**2 + 2); same(minimum(D815, x, S.Reals), 5)
same(sqrt(D815.subs(x, 1)), sqrt(5)); rounds(sqrt(5), '2.236')
same((1 - 0)/(1 - 3), -Rational(1, 2)); same(diff(x**2, x).subs(x, 1), 2)
```
:::

::: example Snell's law from the principle of least time
A lifeguard on a beach runs faster than she swims. To reach a swimmer in the sea as fast as possible she should not head straight for him: running a little further along the beach shortens the slow swim. Light faces the same problem when it passes from air into water, where it travels more slowly, and **Fermat's principle** says that light takes the path of least time. Find the path.

Put the boundary on the $x$-axis, the start $A = (0, a)$ above it and the end $B = (d, -b)$ below it, with $a, b, d > 0$. Light crosses the boundary at $P = (x, 0)$, travelling at speed $v_1$ from $A$ to $P$ and $v_2$ from $P$ to $B$. Distance over speed gives the time:

$$T(x) = \frac{\sqrt{a^2 + x^2}}{v_1} + \frac{\sqrt{b^2 + (d - x)^2}}{v_2}.$$

By the chain rule,

$$T'(x) = \frac{x}{v_1\sqrt{a^2 + x^2}} - \frac{d - x}{v_2\sqrt{b^2 + (d - x)^2}}.$$

Let $\theta_1$ be the angle between $AP$ and the vertical, and $\theta_2$ the angle between $PB$ and the vertical. For $0 < x < d$ the right triangles give $\sin\theta_1 = \dfrac{x}{\sqrt{a^2 + x^2}}$ and $\sin\theta_2 = \dfrac{d - x}{\sqrt{b^2 + (d - x)^2}}$, so

$$T'(x) = 0 \quad\iff\quad \frac{\sin\theta_1}{v_1} = \frac{\sin\theta_2}{v_2}.$$

This is **Snell's law of refraction**. Is it a minimum? Differentiating again,

$$T''(x) = \frac{a^2}{v_1(a^2 + x^2)^{3/2}} + \frac{b^2}{v_2\big(b^2 + (d - x)^2\big)^{3/2}} > 0,$$

so $T$ is concave up on $\R$. Also $T'(0) < 0 < T'(d)$, so by the Intermediate Value Theorem $T'$ has a zero between 0 and $d$, and only one, since $T'$ is increasing. By Theorem 8.11 that zero gives the absolute minimum of $T$: the path of least time obeys Snell's law. With numbers: light travels about 1.33 times as fast in air as in water (the refractive index of water is about 1.33), so take $v_1/v_2 = \tfrac43$, $a = 3$, $b = 4$ and $d = 7$. At $x = 4$, $\sin\theta_1 = \tfrac{4}{5}$ and $\sin\theta_2 = \tfrac{3}{5}$, and $\dfrac{4/5}{3/5} = \tfrac43 = \dfrac{v_1}{v_2}$: the light enters the water at $(4, 0)$.

```check
ap_, bp_, dp_, v1_, v2_ = symbols('a b d v_1 v_2', positive=True)
T816 = sqrt(ap_**2 + x**2)/v1_ + sqrt(bp_**2 + (dp_ - x)**2)/v2_
same(diff(T816, x), x/(v1_*sqrt(ap_**2 + x**2)) - (dp_ - x)/(v2_*sqrt(bp_**2 + (dp_ - x)**2)))
same(diff(T816, x, 2), ap_**2/(v1_*(ap_**2 + x**2)**Rational(3, 2)) + bp_**2/(v2_*(bp_**2 + (dp_ - x)**2)**Rational(3, 2)))
same(diff(T816, x).subs(x, 0), -dp_/(v2_*sqrt(bp_**2 + dp_**2))); same(diff(T816, x).subs(x, dp_), dp_/(v1_*sqrt(ap_**2 + dp_**2)))
T816n = T816.subs({ap_: 3, bp_: 4, dp_: 7, v1_: Rational(4, 3), v2_: 1})
same(diff(T816n, x).subs(x, 4), 0); same(4/sqrt(3**2 + 4**2), Rational(4, 5)); same((7 - 4)/sqrt(4**2 + 3**2), Rational(3, 5))
same(Rational(4, 5)/Rational(3, 5), Rational(4, 3))
```
:::

::: example The cheapest cost per unit
Suppose that making $q$ units of a product per week costs $C(q) = 1800 + 6q + 0.02q^2$ pounds (a made-up cost: a fixed £1800, plus costs that grow faster than the output). How many units minimise the **average cost** $A(q) = C(q)/q$, the cost per unit?

$$A(q) = \frac{1800}{q} + 6 + 0.02q, \qquad q > 0.$$

$A'(q) = -\dfrac{1800}{q^2} + 0.02$, which is 0 when $q^2 = 90\,000$, at $q = 300$. And $A''(q) = \dfrac{3600}{q^3} > 0$ for $q > 0$: $A$ is concave up on $(0, \infty)$, so by Theorem 8.11, $A(300)$ is the absolute minimum. The cheapest cost per unit is $A(300) = 6 + 6 + 6 = 18$, that is, £18, at 300 units a week.

Economists call the derivative $C'(q)$ the **marginal cost**: by linear approximation (Module 7), $C(q + 1) - C(q) \approx C'(q)$, the cost of one more unit. Here $C'(q) = 6 + 0.04q$, and $C'(300) = 18$: at the best output, the marginal cost equals the average cost. That is no coincidence. By the quotient rule,

$$A'(q) = \frac{qC'(q) - C(q)}{q^2},$$

which is 0 exactly when $C'(q) = C(q)/q$. While making one more unit costs less than the average, it pulls the average down; once it costs more, it pushes the average up.

```check
qp = symbols('q', positive=True)
C817 = 1800 + 6*qp + Rational(2, 100)*qp**2; A817 = C817/qp
same(expand(A817), 1800/qp + 6 + Rational(2, 100)*qp); same(diff(A817, qp), -1800/qp**2 + Rational(2, 100))
same(solve(diff(A817, qp), qp), [300]); same(1800/Rational(2, 100), 90000); same(diff(A817, qp, 2), 3600/qp**3)
same(A817.subs(qp, 300), 18); same(1800/Integer(300), 6); same(Rational(2, 100)*300, 6)
same(diff(C817, qp), 6 + Rational(4, 100)*qp); same(diff(C817, qp).subs(qp, 300), 18)
same(diff(A817, qp), (qp*diff(C817, qp) - C817)/qp**2)
```
:::

::: pitfall
Three slips in optimisation. **Ignoring the interval**: in Example 8.13 the critical number 18 has no box, and in a problem on a closed interval the answer may be at an end. **Stopping at a critical number**: $f'(c) = 0$ does not make $f(c)$ the largest or the smallest value; say which theorem shows it, as the examples do. **Answering a different question**: if the problem asks for the dimensions of a can, the minimum area alone is not the answer.
:::

## Gradient descent {#gradient-descent}

Every example so far solved $f'(x) = 0$ by algebra. Often that is impossible: the equation has no formula for its solution, or, in machine learning, $f$ is the error of a model with millions of parameters. Then you can search instead: start somewhere and walk downhill.

::: definition Gradient descent
To minimise a differentiable function $f$, choose a starting point $x_0$ and a **step size** $\eta > 0$, and compute

$$x_{k+1} = x_k - \eta f'(x_k), \qquad k = 0, 1, 2, \dots$$

The Greek letter $\eta$ is read "eta". In machine learning the step size is called the **learning rate**.
:::

Why does this go downhill? If $f'(x_k) > 0$, $f$ increases at $x_k$, and the step moves left; if $f'(x_k) < 0$, it moves right. By the linearisation of Module 7,

$$f(x_{k+1}) \approx f(x_k) + f'(x_k)(x_{k+1} - x_k) = f(x_k) - \eta f'(x_k)^2,$$

which is less than $f(x_k)$ when $f'(x_k) \ne 0$, at least when the step is small enough for the approximation to be good. And the steps stop moving exactly at critical numbers: $x_{k+1} = x_k$ means $f'(x_k) = 0$. How large should $\eta$ be? A parabola answers that completely.

```check
xk, eta_ = symbols('x_k eta', positive=True)
same(fm(xk) + diff(fm(xk), xk)*((xk - eta_*diff(fm(xk), xk)) - xk), fm(xk) - eta_*diff(fm(xk), xk)**2)
```

::: example Gradient descent on a parabola
Let $f(x) = \tfrac{q}{2}x^2$, where $q > 0$ is a constant, so that $f'(x) = qx$, $f''(x) = q$, and the minimum is at $x = 0$. Show that gradient descent gives $x_k = (1 - q\eta)^kx_0$, and find the step sizes for which $x_k$ approaches the minimum.

One step gives $x_{k+1} = x_k - \eta qx_k = (1 - q\eta)x_k$. Every step multiplies by the same factor $1 - q\eta$, so after $k$ steps $x_k = (1 - q\eta)^kx_0$. Powers of a number between $-1$ and 1 shrink towards 0, and powers of a number beyond $\pm1$ grow without bound. With $x_0 \ne 0$:

| Step size | Factor $1 - q\eta$ | The steps |
|---|---|---|
| $0 < \eta < 1/q$ | between 0 and 1 | approach 0 from one side; slowly if $\eta$ is small |
| $\eta = 1/q$ | 0 | land on 0 in one step |
| $1/q < \eta < 2/q$ | between $-1$ and 0 | zigzag about 0, closing in |
| $\eta = 2/q$ | $-1$ | bounce between $x_0$ and $-x_0$ for ever |
| $\eta > 2/q$ | below $-1$ | zigzag outwards: diverge |

So gradient descent finds the minimum exactly when $0 < \eta < 2/q$: the more sharply the parabola curves, the smaller the steps must be.

```check
qq8 = symbols('q', positive=True); x0_ = symbols('x_0')
xs8 = [x0_]
for _ in range(5):
    xs8.append(xs8[-1] - eta_*diff(qq8/2*x**2, x).subs(x, xs8[-1]))
same([expand(v_) for v_ in xs8], [expand((1 - qq8*eta_)**k_*x0_) for k_ in range(6)])
same(diff(qq8/2*x**2, x), qq8*x); same(diff(qq8/2*x**2, x, 2), qq8)
er_ = symbols('eta', real=True)                         # |1 - q eta| < 1 exactly when 0 < eta < 2/q, for instances of q
for qv_ in (Rational(1, 2), 1, 3, 10):
    same(solve_univariate_inequality(Abs(1 - qv_*er_) < 1, er_, relational=False), Interval.open(0, 2/qv_))
same((1 - qq8*eta_).subs(eta_, 1/qq8), 0); same((1 - qq8*eta_).subs(eta_, 2/qq8), -1)
```
:::

Near a minimum $c$ where $f''(c) > 0$, a function behaves much like this parabola, and the same rule applies there.

::: keyidea
**A rule of thumb for the step size.** Near a minimum $c$ with $f''(c) > 0$, the linearisation of $f'$ at $c$ (Module 7) gives $f'(x) \approx f''(c)(x - c)$, since $f'(c) = 0$. So one step of gradient descent gives

$$x_{k+1} - c \approx \big(1 - \eta f''(c)\big)(x_k - c),$$

the parabola of Example 8.18 with $q = f''(c)$. Started close to $c$, gradient descent settles at $c$ when $0 < \eta < 2/f''(c)$, and fastest when $\eta$ is near $1/f''(c)$. This is a rule of thumb, not a theorem: the approximation holds only close to $c$.
:::

Choosing $\eta = 1/f''(x_k)$ afresh at every step turns gradient descent into $x_{k+1} = x_k - f'(x_k)/f''(x_k)$: Newton's method (Module 7) for the equation $f'(x) = 0$. It converges fast, but it needs $f''$, which for a model with millions of parameters is too expensive to compute; gradient descent needs only $f'$.

Figure 8.5 tries three step sizes on

$$f(x) = \tfrac12x^2 + e^{-x}.$$

Here $f'(x) = x - e^{-x}$ and $f''(x) = 1 + e^{-x} > 0$, so the graph is concave up and its one critical number, the solution $x^* \approx 0.567143$ of $x = e^{-x}$ found by Newton's method in Module 7, gives the absolute minimum (Theorem 8.11). Since $e^{-x^*} = x^*$, $f''(x^*) = 1 + x^* \approx 1.567$: the rule of thumb predicts convergence for $\eta < 2/1.567 \approx 1.28$, fastest near $\eta \approx 0.64$.

```check
f818 = x**2/2 + exp(-x)
same(diff(f818, x), x - exp(-x)); same(diff(f818, x, 2), 1 + exp(-x))
xstar8 = nsolve(x - exp(-x), x, 0.5, prec=30); rounds(xstar8, '0.567143')
near(exp(-xstar8), xstar8, 1e-25); rounds(1 + xstar8, '1.567'); rounds(2/(1 + xstar8), '1.28'); rounds(1/(1 + xstar8), '0.64')
```

::: figure id=fig-08-5
Gradient descent on $f(x) = \tfrac12x^2 + e^{-x}$ from $x_0 = 3$; the dashed line marks the minimum at $x^* \approx 0.567$. With $\eta = 0.1$ the steps creep towards it: 12 steps reach only $x \approx 1.004$. With $\eta = 0.6$ the third step is already within 0.01 of it. With $\eta = 1.4$ the steps jump from side to side of the minimum, further out on each side every time they return to it; the fourth step lands at $x_4 \approx 10.15$.
:::

::: compute Gradient descent in Python
The method is a loop of one line. With $f'(x) = x - e^{-x}$:

```python
import math

def df(x):                              # f(x) = x**2/2 + exp(-x)
    return x - math.exp(-x)

def gradient_descent(x, eta, steps):
    xs = [x]
    for _ in range(steps):
        x = x - eta*df(x)
        xs.append(x)
    return xs

for eta in (0.1, 0.6, 1.4):
    xs = gradient_descent(3.0, eta, 7)
    print(f"eta = {eta}:", " ".join(f"{v:.4g}" for v in xs))
```

```output
eta = 0.1: 3 2.705 2.441 2.206 1.996 1.81 1.646 1.5
eta = 0.6: 3 1.23 0.6673 0.5748 0.5676 0.5672 0.5671 0.5671
eta = 1.4: 3 -1.13 4.787 -1.903 10.15 -4.061 82.85 -33.14
```

With $\eta = 1.4$ the next step lands near $3.5 \times 10^{14}$, and two steps later `math.exp` fails with an overflow error: the number $e^{x}$ it is asked for is too large for a float. A program needs a rule for when to stop, usually when $\abs{f'(x_k)}$ is tiny. How many steps does each step size need until $\abs{f'(x_k)} < 10^{-10}$?

```python
def steps_needed(eta, tol=1e-10):
    x, k = 3.0, 0
    while abs(df(x)) > tol and k < 10000:
        x, k = x - eta*df(x), k + 1
    return k

for eta in (0.1, 0.3, 0.6, 1.0, 1.2):
    print(f"eta = {eta}: {steps_needed(eta)} steps")
```

```output
eta = 0.1: 146 steps
eta = 0.3: 40 steps
eta = 0.6: 10 steps
eta = 1.0: 42 steps
eta = 1.2: 188 steps
```

The best step size is near $1/f''(x^*) \approx 0.64$, as the rule of thumb says. Smaller steps waste time; larger ones zigzag about the minimum and close in more slowly, and above about 1.28 they diverge.
:::

```check
import math as _m
def _gd(eta, n):
    xs_ = [3.0]
    for _ in range(n):
        xs_.append(xs_[-1] - eta*(xs_[-1] - _m.exp(-xs_[-1])))
    return xs_
rounds(_gd(0.1, 12)[-1], '1.004'); holds(abs(_gd(0.6, 3)[-1] - float(xstar8)) < 0.01); holds(abs(_gd(0.6, 2)[-1] - float(xstar8)) > 0.01)
rounds(_gd(1.4, 4)[-1], '10.15'); rounds(_gd(1.4, 8)[-1], '3.5e14')
_g14 = _gd(1.4, 7); holds(all((_g14[k_] - float(xstar8))*(_g14[k_ + 1] - float(xstar8)) < 0 for k_ in range(7)))   # side to side
holds(_g14[0] < _g14[2] < _g14[4] < _g14[6]); holds(_g14[1] > _g14[3] > _g14[5] > _g14[7])                              # further out each time
_x9 = _gd(1.4, 9)[-1]; holds(-_x9 > 710)            # x_10 needs e^(-x_9): a float overflows beyond about e^709.8
```

In machine learning, $x$ is a long list of parameters, $f$ is the **loss**, a measure of the model's error on its training data, $f'$ becomes the gradient of Module 17, and $\eta$ is the learning rate. The lessons of this section carry over: too small a learning rate wastes computing time, too large a rate makes the loss blow up, and the curvature of the loss decides which is which. Module 17 extends gradient descent to several variables, and Module 18 studies step sizes and what goes wrong when a function curves much more steeply in some directions than in others. The [Mathematical Foundations series](../math/module_19_EN.html) treats gradient methods and convexity from the computing side.

::: pitfall
Gradient descent finds a critical number, not necessarily the absolute minimum. On a function with several valleys, small steps settle in the valley where they start, and the steps can stall where $f'$ is nearly 0 without there being a minimum. For $f(x) = x^4 - 4x^3$ of Example 8.10, started at $x_0 = -1$ with $\eta = 0.01$, it creeps towards the flat point 0, which is not a minimum at all; after 1000 steps it is still at $x \approx -0.0081$, and it never gets past 0 to the true minimum at 3.
:::

```check
xg = -1.0
for _ in range(1000):
    xg = xg - 0.01*4*xg**2*(xg - 3)
rounds(xg, '-0.0081'); holds(xg < 0)
```

## What you learned {#summary}

- An absolute maximum or minimum is the largest or smallest value of $f$ on its whole domain (or on an interval); a local one is the largest or smallest among nearby values. By Fermat's theorem, local extrema occur at critical numbers, where $f' = 0$ or $f'$ does not exist; not every critical number gives an extremum.
- The closed interval method: a continuous function on $[a, b]$ takes its absolute extreme values at critical numbers inside the interval or at the endpoints; compare the values there.
- Rolle's theorem and the Mean Value Theorem: if $f$ is continuous on $[a, b]$ and differentiable on $(a, b)$, then $f'(c) = \dfrac{f(b) - f(a)}{b - a}$ for some $c$ in $(a, b)$. An average rate of change is an instantaneous rate somewhere. Cauchy's version proves L'Hôpital's rule.
- Consequences: $f' = 0$ on an interval makes $f$ constant there; equal derivatives on an interval mean that the functions differ by a constant; $f' > 0$ makes $f$ increasing and $f' < 0$ decreasing.
- The first derivative test classifies a critical number by the change of sign of $f'$; the second derivative test by the sign of $f''(c)$ when $f'(c) = 0$, and it says nothing when $f''(c) = 0$.
- $f'' > 0$ makes the graph concave up (convex), lying above its tangents; $f'' < 0$ concave down. Inflection points are where the concavity changes; $f''(c) = 0$ there if $f''(c)$ exists, but $f''(c) = 0$ alone does not make one.
- To sketch a graph: domain, intercepts, symmetry, asymptotes, sign charts of $f'$ and $f''$, extrema and inflection points.
- Optimisation: write the quantity as a function of one variable on the interval its meaning allows, find the critical numbers, and justify the absolute extremum by the closed interval method, by the sign of $f'$ on each side, or by concavity.
- Gradient descent, $x_{k+1} = x_k - \eta f'(x_k)$, walks downhill. As a rule of thumb, near a minimum $c$ it converges when $0 < \eta < 2/f''(c)$, fastest near $\eta = 1/f''(c)$; too large a step makes it diverge, and it can settle at a local minimum or stall at a flat point.

## Exercises {#exercises}

:::: exercise The closed interval method {#ex-8-1} ★
Find the absolute maximum and minimum values of each function on the given interval.

- (a) $f(x) = x^3 - 12x + 1$ on $[-3, 5]$
- (b) $g(x) = x - 2\sin x$ on $[0, 2\pi]$

::: solution
**(a)** $f'(x) = 3x^2 - 12 = 3(x - 2)(x + 2)$, so the critical numbers are $\pm2$, both in $(-3, 5)$. The values:

| $x$ | $-3$ | $-2$ | $2$ | $5$ |
|---|---|---|---|---|
| $f(x)$ | $10$ | $17$ | $-15$ | $66$ |

The absolute maximum value is 66, at the endpoint 5, and the absolute minimum value is $-15$, at 2. The local maximum at $-2$ is not the absolute maximum.

**(b)** $g'(x) = 1 - 2\cos x = 0$ when $\cos x = \tfrac12$, which in $(0, 2\pi)$ happens at $x = \tfrac{\pi}{3}$ and $x = \tfrac{5\pi}{3}$. With $\sin\tfrac{\pi}{3} = \tfrac{\sqrt3}{2}$ and $\sin\tfrac{5\pi}{3} = -\tfrac{\sqrt3}{2}$:

| $x$ | $0$ | $\pi/3$ | $5\pi/3$ | $2\pi$ |
|---|---|---|---|---|
| $g(x)$ | $0$ | $\pi/3 - \sqrt3 \approx -0.685$ | $5\pi/3 + \sqrt3 \approx 6.968$ | $2\pi \approx 6.283$ |

The absolute maximum value is $\tfrac{5\pi}{3} + \sqrt3 \approx 6.968$, at $\tfrac{5\pi}{3}$, and the absolute minimum value is $\tfrac{\pi}{3} - \sqrt3 \approx -0.685$, at $\tfrac{\pi}{3}$.

```check
fe1 = x**3 - 12*x + 1
same(factor(diff(fe1, x)), 3*(x - 2)*(x + 2)); same([fe1.subs(x, v_) for v_ in (-3, -2, 2, 5)], [10, 17, -15, 66])
same(maximum(fe1, x, Interval(-3, 5)), 66); same(minimum(fe1, x, Interval(-3, 5)), -15)
ge1 = x - 2*sin(x)
same_set(solveset(diff(ge1, x), x, Interval.open(0, 2*pi)), [pi/3, 5*pi/3])
same([ge1.subs(x, v_) for v_ in (0, pi/3, 5*pi/3, 2*pi)], [0, pi/3 - sqrt(3), 5*pi/3 + sqrt(3), 2*pi])
rounds(pi/3 - sqrt(3), '-0.685'); rounds(5*pi/3 + sqrt(3), '6.968'); rounds(2*pi, '6.283')
holds(5*pi/3 + sqrt(3) > 2*pi); holds(pi/3 - sqrt(3) < 0)
```
:::
::::

:::: exercise The number c of the Mean Value Theorem {#ex-8-2} ★
- (a) Check that $f(x) = x^2 - 4x$ satisfies the hypotheses of the Mean Value Theorem on $[1, 5]$, and find every $c$ that the theorem promises.
- (b) The same for $f(x) = \dfrac1x$ on $[1, 3]$.
- (c) Why does the theorem not apply to $f(x) = \abs{x - 1}$ on $[0, 3]$? Is there a $c$ anyway?
- (d) Show that for every quadratic $f(x) = px^2 + qx + r$, $p \ne 0$, and every interval $[a, b]$, the number $c$ is the midpoint $\tfrac{a + b}{2}$.

::: solution
**(a)** A polynomial is continuous and differentiable everywhere. $f(1) = -3$ and $f(5) = 5$, so the secant slope is $\dfrac{5 - (-3)}{5 - 1} = 2$, and $f'(c) = 2c - 4 = 2$ gives $c = 3$, which lies in $(1, 5)$.

**(b)** $\dfrac1x$ is continuous and differentiable for $x \ne 0$, so on $[1, 3]$. The secant slope is $\dfrac{\tfrac13 - 1}{3 - 1} = -\dfrac13$, and $f'(c) = -\dfrac{1}{c^2} = -\dfrac13$ gives $c^2 = 3$, so $c = \sqrt3 \approx 1.732$ (the solution $-\sqrt3$ is not in the interval).

**(c)** $\abs{x - 1}$ has a corner at $x = 1$, inside $(0, 3)$, so it is not differentiable on $(0, 3)$. And no $c$ exists: the secant slope is $\dfrac{2 - 1}{3 - 0} = \dfrac13$, while $f'(x)$ is $-1$ for $x < 1$ and 1 for $x > 1$.

**(d)** The secant slope is

$$\begin{aligned} \frac{f(b) - f(a)}{b - a} &= \frac{p(b^2 - a^2) + q(b - a)}{b - a} \\ &= p(b + a) + q, \end{aligned}$$

dividing by $b - a$ after factoring $b^2 - a^2 = (b - a)(b + a)$. And $f'(c) = 2pc + q$ equals it exactly when $c = \tfrac{a + b}{2}$. This is [Exercise 1.11](module_01_EN.html#ex-1-11) read backwards: the secant over $[a, b]$ is parallel to the tangent at the midpoint.

```check
fe2 = x**2 - 4*x
same(fe2.subs(x, 1), -3); same(fe2.subs(x, 5), 5); same((5 - (-3))/(5 - 1), 2); same(solve(diff(fe2, x) - 2, x), [3])
same((Rational(1, 3) - 1)/(3 - 1), -Rational(1, 3)); same_set(solve(-1/x**2 + Rational(1, 3), x), [sqrt(3), -sqrt(3)]); rounds(sqrt(3), '1.732')
same((Abs(3 - 1) - Abs(0 - 1))/(3 - 0), Rational(1, 3))
pq_, qq_, rq_ = symbols('p q r')
fq2 = lambda X: pq_*X**2 + qq_*X + rq_
same(cancel((fq2(b) - fq2(a))/(b - a)), pq_*(a + b) + qq_)
same(solve(Eq(diff(fq2(x), x), pq_*(a + b) + qq_), x), [(a + b)/2])
```
:::
::::

:::: exercise Rise, fall and bend of a cubic {#ex-8-3} ★
Let $f(x) = x^3 - 6x^2 + 9x + 2$.

- (a) Find the intervals on which $f$ is increasing or decreasing, and its local extreme values.
- (b) Find the intervals of concavity and the inflection point.
- (c) Show that the inflection point is the midpoint of the segment joining the local maximum and the local minimum points.

::: solution
**(a)** $f'(x) = 3x^2 - 12x + 9 = 3(x - 1)(x - 3)$. As in Example 8.6, $f' > 0$ for $x < 1$, $f' < 0$ for $1 < x < 3$, and $f' > 0$ for $x > 3$. So $f$ is increasing on $(-\infty, 1]$ and $[3, \infty)$ and decreasing on $[1, 3]$. By the first derivative test, $f(1) = 1 - 6 + 9 + 2 = 6$ is a local maximum value and $f(3) = 27 - 54 + 27 + 2 = 2$ a local minimum value.

**(b)** $f''(x) = 6x - 12$ is negative for $x < 2$ and positive for $x > 2$: concave down on $(-\infty, 2)$, concave up on $(2, \infty)$, with the inflection point $(2, f(2)) = (2, 4)$.

**(c)** The midpoint of $(1, 6)$ and $(3, 2)$ is $\big(\tfrac{1 + 3}{2}, \tfrac{6 + 2}{2}\big) = (2, 4)$, the inflection point. (Every cubic with two critical numbers behaves like this: its graph is symmetric under a half turn about its inflection point.)

```check
fe3 = x**3 - 6*x**2 + 9*x + 2
steps(diff(fe3, x), 3*x**2 - 12*x + 9, 3*(x - 1)*(x - 3))
same(solve_univariate_inequality(diff(fe3, x) < 0, x, relational=False), Interval.open(1, 3))
same(fe3.subs(x, 1), 6); same(fe3.subs(x, 3), 2); same(diff(fe3, x, 2), 6*x - 12); same(solve(6*x - 12, x), [2]); same(fe3.subs(x, 2), 4)
same(((1 + 3)/Integer(2), (6 + 2)/Integer(2)), (2, 4))
same(expand(fe3.subs(x, 2 + u) + fe3.subs(x, 2 - u)), 8)      # symmetric about (2, 4)
```
:::
::::

:::: exercise When the second derivative test fails {#ex-8-4} ★
Let $g(x) = 3x^5 - 5x^3$.

- (a) Find the critical numbers of $g$, and use the second derivative test where it works.
- (b) At which critical number does the test fail? Decide what happens there with the first derivative test.
- (c) Find the inflection points.

::: solution
**(a)** $g'(x) = 15x^4 - 15x^2 = 15x^2(x - 1)(x + 1)$, so the critical numbers are $-1$, 0 and 1. $g''(x) = 60x^3 - 30x = 30x(2x^2 - 1)$. At 1, $g''(1) = 30 > 0$: $g(1) = 3 - 5 = -2$ is a local minimum value. At $-1$, $g''(-1) = -30 < 0$: $g(-1) = -3 + 5 = 2$ is a local maximum value.

**(b)** At 0, $g''(0) = 0$, and the test says nothing. For $0 < \abs{x} < 1$, $15x^2 > 0$ and $x^2 - 1 < 0$, so $g'(x) < 0$ on both sides of 0: by the first derivative test, no extremum at 0. ($g$ is decreasing on $[-1, 1]$.)

**(c)** $g''(x) = 30x(2x^2 - 1) = 0$ at $x = 0$ and $x = \pm\tfrac{1}{\sqrt2}$, and $g''$ changes sign at each, since these are three simple zeros of a polynomial. With $g\big(\tfrac{1}{\sqrt2}\big) = \tfrac{3}{4\sqrt2} - \tfrac{5}{2\sqrt2} = -\tfrac{7}{4\sqrt2} = -\tfrac{7\sqrt2}{8} \approx -1.237$, and $g$ odd, the inflection points are $(0, 0)$ and $\big(\pm\tfrac{1}{\sqrt2}, \mp\tfrac{7\sqrt2}{8}\big)$.

```check
ge4 = 3*x**5 - 5*x**3
same(factor(diff(ge4, x)), 15*x**2*(x - 1)*(x + 1)); same(factor(diff(ge4, x, 2)), 30*x*(2*x**2 - 1))
same(diff(ge4, x, 2).subs(x, 1), 30); same(diff(ge4, x, 2).subs(x, -1), -30); same(ge4.subs(x, 1), -2); same(ge4.subs(x, -1), 2)
same(diff(ge4, x, 2).subs(x, 0), 0)
same(solve_univariate_inequality(diff(ge4, x) < 0, x, relational=False), Union(Interval.open(-1, 0), Interval.open(0, 1)))
same_set(solve(diff(ge4, x, 2), x), [0, 1/sqrt(2), -1/sqrt(2)])
for r_ in (0, 1/sqrt(2), -1/sqrt(2)):
    holds(diff(ge4, x, 2).subs(x, r_ - Rational(1, 100))*diff(ge4, x, 2).subs(x, r_ + Rational(1, 100)) < 0)
steps(ge4.subs(x, 1/sqrt(2)), 3/(4*sqrt(2)) - 5/(2*sqrt(2)), -7/(4*sqrt(2)), -7*sqrt(2)/8); rounds(-7*sqrt(2)/8, '-1.237')
same(ge4.subs(x, -x), -ge4)
```
:::
::::

:::: exercise A graph with an oblique asymptote {#ex-8-5} ★★
Sketch the graph of $f(x) = \dfrac{x^2}{x - 1}$, following the checklist of Section 8.5. (Hint: $x^2 = (x - 1)(x + 1) + 1$.)

::: solution
1. **Domain.** All $x \ne 1$.
2. **Intercepts.** $f(0) = 0$, and $f(x) = 0$ only at $x = 0$.
3. **Symmetry.** None: $f(-1) = -\tfrac12$, while $f(1)$ is not even defined.
4. **Asymptotes.** By the hint, $f(x) = x + 1 + \dfrac{1}{x - 1}$. As $x \to \pm\infty$, $\dfrac{1}{x - 1} \to 0$, so $y = x + 1$ is an oblique asymptote; the graph is above it for $x > 1$ and below it for $x < 1$. As $x \to 1^+$, $f(x) \to \infty$; as $x \to 1^-$, $f(x) \to -\infty$: $x = 1$ is a vertical asymptote.
5. **Increase and decrease.** $f'(x) = 1 - \dfrac{1}{(x - 1)^2} = \dfrac{(x - 1)^2 - 1}{(x - 1)^2} = \dfrac{x(x - 2)}{(x - 1)^2}$. The denominator is positive, so $f'$ has the sign of $x(x - 2)$: positive for $x < 0$ and $x > 2$, negative for $0 < x < 1$ and $1 < x < 2$. So $f$ is increasing on $(-\infty, 0]$ and $[2, \infty)$, and decreasing on $[0, 1)$ and $(1, 2]$.
6. **Extrema.** $f(0) = 0$ is a local maximum value and $f(2) = 4$ a local minimum value. Notice that the local minimum is larger than the local maximum: they are on different branches.
7. **Concavity.** $f''(x) = \dfrac{2}{(x - 1)^3}$, negative for $x < 1$ and positive for $x > 1$: concave down on $(-\infty, 1)$, concave up on $(1, \infty)$, and no inflection point, since 1 is not in the domain.
8. **Sketch.** Two branches hugging the line $y = x + 1$: on the left, rising to the peak $(0, 0)$ and plunging down the asymptote $x = 1$; on the right, coming down from $+\infty$ to the valley $(2, 4)$ and rising along $y = x + 1$.

```check
fe5 = x**2/(x - 1)
same(expand((x - 1)*(x + 1) + 1), x**2); same(fe5, x + 1 + 1/(x - 1)); same(fe5.subs(x, 0), 0); same(fe5.subs(x, -1), -Rational(1, 2))
limit_is(fe5 - (x + 1), x, oo, 0); limit_is(fe5 - (x + 1), x, -oo, 0); limit_is(fe5, x, 1, oo, '+'); limit_is(fe5, x, 1, -oo, '-')
steps(diff(fe5, x), 1 - 1/(x - 1)**2, ((x - 1)**2 - 1)/(x - 1)**2, x*(x - 2)/(x - 1)**2)
same(solve_univariate_inequality(x*(x - 2) < 0, x, relational=False), Interval.open(0, 2))
same(fe5.subs(x, 2), 4); same(diff(fe5, x, 2), 2/(x - 1)**3)
```
:::
::::

:::: exercise Bounds from the Mean Value Theorem {#ex-8-6} ★★
- (a) Show that $\abs{\sin b - \sin a} \le \abs{b - a}$ for all real $a$ and $b$.
- (b) Show that $\dfrac{x}{1 + x} < \ln(1 + x) < x$ for every $x > 0$. (Apply the Mean Value Theorem to $\ln$ on $[1, 1 + x]$.)
- (c) Use (b) to bound $\ln 1.1$, and compare with its value.

::: solution
**(a)** If $a = b$ both sides are 0. Otherwise, the Mean Value Theorem for $\sin$ on the interval between $a$ and $b$ gives $\sin b - \sin a = \cos c\,(b - a)$ for some $c$ between them, and $\abs{\cos c} \le 1$, so $\abs{\sin b - \sin a} = \abs{\cos c}\,\abs{b - a} \le \abs{b - a}$. In words: the sine never changes faster than its input, because its slope is never steeper than 1.

**(b)** $\ln$ is continuous and differentiable on $(0, \infty)$, with derivative $\dfrac1t$ (Module 6). On $[1, 1 + x]$ the Mean Value Theorem gives a $c$ with $1 < c < 1 + x$ and

$$\ln(1 + x) - \ln 1 = \frac1c\cdot x, \quad\text{so}\quad \ln(1 + x) = \frac{x}{c}.$$

Since $1 < c < 1 + x$, $\dfrac{1}{1 + x} < \dfrac1c < 1$; multiplying by $x > 0$ gives $\dfrac{x}{1 + x} < \ln(1 + x) < x$.

**(c)** With $x = 0.1$: $\dfrac{0.1}{1.1} \approx 0.0909 < \ln 1.1 < 0.1$. In fact $\ln 1.1 \approx 0.0953$, between the two bounds.

```check
same(function_range(cos(x), x, S.Reals), Interval(-1, 1)); same(diff(sin(x), x), cos(x)); same(diff(log(x), x), 1/x); same(log(1), 0)
same(Rational(1, 10)/Rational(11, 10), Rational(1, 11)); rounds(Rational(1, 11), '0.0909'); rounds(log(Rational(11, 10)), '0.0953')
holds(Rational(1, 11) < log(Rational(11, 10))); holds(log(Rational(11, 10)) < Rational(1, 10))
for xv_ in (Rational(1, 100), 1, 5, 100):
    holds(xv_/(1 + xv_) < log(1 + xv_)); holds(log(1 + xv_) < xv_)
```
:::
::::

:::: exercise Maximum power transfer {#ex-8-7} ★★
A battery with voltage $V$ and internal resistance $r > 0$ drives a device of resistance $R$. By Ohm's law the current is $I = \dfrac{V}{R + r}$, and the power delivered to the device is $P = I^2R$.

- (a) Show that $P(R) = \dfrac{V^2R}{(R + r)^2}$ is largest, over all $R > 0$, when $R = r$, and find the largest power.
- (b) Suppose, hypothetically, that $V = 12$ volts and $r = 0.5$ ohms. Find the best $R$ and the largest power, in watts.

::: solution
**(a)** By the quotient rule,

$$\begin{aligned} P'(R) &= V^2\,\frac{(R + r)^2 - R\cdot2(R + r)}{(R + r)^4} \\ &= V^2\,\frac{(R + r) - 2R}{(R + r)^3} = \frac{V^2(r - R)}{(R + r)^3}, \end{aligned}$$

cancelling one factor $R + r$. For $R > 0$ the denominator is positive, so $P'(R) > 0$ for $R < r$ and $P'(R) < 0$ for $R > r$. By Theorem 8.14 (with $I = (0, \infty)$), $P(r)$ is the absolute maximum:

$$P(r) = \frac{V^2r}{(2r)^2} = \frac{V^2}{4r}.$$

This is the **maximum power transfer theorem** of electrical engineering: a source delivers the most power to a load whose resistance matches its own.

**(b)** $R = 0.5$ ohms, and $P = \dfrac{12^2}{4 \cdot 0.5} = \dfrac{144}{2} = 72$ watts.

```check
Rr, rr8, VV = symbols('R r V', positive=True)
P8 = VV**2*Rr/(Rr + rr8)**2
steps(diff(P8, Rr), VV**2*((Rr + rr8)**2 - Rr*2*(Rr + rr8))/(Rr + rr8)**4, VV**2*((Rr + rr8) - 2*Rr)/(Rr + rr8)**3, VV**2*(rr8 - Rr)/(Rr + rr8)**3)
same(solve(diff(P8, Rr), Rr), [rr8]); same(P8.subs(Rr, rr8), VV**2/(4*rr8))
same((VV**2/(4*rr8)).subs({VV: 12, rr8: Rational(1, 2)}), 72); same(maximum(P8.subs({VV: 12, rr8: Rational(1, 2)}), Rr, Interval.open(0, oo)), 72)
```
:::
::::

:::: exercise The best step for a central difference {#ex-8-8} ★★
Section 4.7 modelled the error of the central difference of $x^3$ at 1, in floating point, as $E(h) = h^2 + \dfrac{\varepsilon}{h}$, where $\varepsilon = 2^{-52} \approx 2.2 \times 10^{-16}$, and stated that it is smallest at $h = (\varepsilon/2)^{1/3}$.

- (a) Prove it: show that $E$ has its absolute minimum on $(0, \infty)$ at $h^* = (\varepsilon/2)^{1/3}$, and that $E(h^*) = 3h^{*2}$.
- (b) Compute $h^*$ and $E(h^*)$, and compare with [Section 4.7](module_04_EN.html#rounding).

::: solution
**(a)** $E'(h) = 2h - \dfrac{\varepsilon}{h^2}$, which is 0 when $2h^3 = \varepsilon$, that is, at $h^* = (\varepsilon/2)^{1/3}$, its only critical number in $(0, \infty)$. And $E''(h) = 2 + \dfrac{2\varepsilon}{h^3} > 0$ for $h > 0$, so $E$ is concave up on $(0, \infty)$, and by Theorem 8.11 $E(h^*)$ is the absolute minimum. Since $h^{*3} = \varepsilon/2$, $\dfrac{\varepsilon}{h^*} = \dfrac{\varepsilon h^{*2}}{h^{*3}} = 2h^{*2}$, so $E(h^*) = h^{*2} + 2h^{*2} = 3h^{*2}$: at the best step, the rounding error is twice the truncation error.

**(b)** $h^* = \big(2^{-53}\big)^{1/3} \approx 4.8 \times 10^{-6}$ and $E(h^*) = 3h^{*2} \approx 6.9 \times 10^{-11}$. Section 4.7 gave "about $5 \times 10^{-6}$" and "about $7 \times 10^{-11}$", the same numbers rounded, and its table had its smallest central errors, about $10^{-10}$, near these steps.

```check
eps8 = Integer(2)**-52
hpos = symbols('h', positive=True); epp = symbols('varepsilon', positive=True)
E8 = hpos**2 + epp/hpos
same(diff(E8, hpos), 2*hpos - epp/hpos**2); same(solve(diff(E8, hpos), hpos), [(epp/2)**Rational(1, 3)])
same(diff(E8, hpos, 2), 2 + 2*epp/hpos**3); same(E8.subs(hpos, (epp/2)**Rational(1, 3)), 3*((epp/2)**Rational(1, 3))**2)
hs8 = (eps8/2)**Rational(1, 3)
same(hs8, (Integer(2)**-53)**Rational(1, 3)); rounds(hs8, '4.8e-6'); rounds(3*hs8**2, '6.9e-11'); rounds(eps8, '2.2e-16')
rounds(hs8, '5e-6'); rounds(3*hs8**2, '7e-11')
```
:::
::::

:::: exercise Gradient descent by hand {#ex-8-9} ★★
A machine-learning model predicts $y = wx$ from $x$, with one parameter $w$. On three (made-up) measurements $(x, y) = (1, 2)$, $(2, 3)$ and $(3, 7)$, its **mean squared error** is

$$L(w) = \frac{(w - 2)^2 + (2w - 3)^2 + (3w - 7)^2}{3}.$$

- (a) Expand $L$, and find the $w$ that minimises it.
- (b) Show that gradient descent with step size $\eta$ satisfies $w_{k+1} - w^* = \big(1 - \tfrac{28}{3}\eta\big)(w_k - w^*)$, where $w^*$ is the minimiser. For which $\eta$ does it converge? Which $\eta$ lands on $w^*$ in one step?
- (c) Starting from $w_0 = 0$, compute $w_1$, $w_2$, $w_3$ with $\eta = 0.05$, and then with $\eta = 0.25$.

::: solution
**(a)** Expanding the squares, $(w^2 - 4w + 4) + (4w^2 - 12w + 9) + (9w^2 - 42w + 49) = 14w^2 - 58w + 62$, so

$$L(w) = \frac{14w^2 - 58w + 62}{3}, \qquad L'(w) = \frac{28w - 58}{3}.$$

$L'(w) = 0$ at $w^* = \tfrac{58}{28} = \tfrac{29}{14} \approx 2.071$, and $L''(w) = \tfrac{28}{3} > 0$, so by Theorem 8.11 this is the absolute minimum.

**(b)** Since $58 = 28w^*$, $L'(w) = \tfrac{28}{3}(w - w^*)$, and one step gives

$$w_{k+1} - w^* = (w_k - w^*) - \eta\cdot\tfrac{28}{3}(w_k - w^*) = \big(1 - \tfrac{28}{3}\eta\big)(w_k - w^*).$$

This is Example 8.18 with $q = L'' = \tfrac{28}{3}$: it converges exactly when $0 < \eta < \tfrac{2}{28/3} = \tfrac{3}{14} \approx 0.214$, and $\eta = \tfrac{3}{28} \approx 0.107$ lands on $w^*$ in one step.

**(c)** By (b), $w_k = w^* - \big(1 - \tfrac{28}{3}\eta\big)^k w^*$. With $\eta = 0.05$ the factor is $1 - \tfrac{1.4}{3} = \tfrac{8}{15}$, and

$$w_1 = \tfrac{29}{30} \approx 0.967, \quad w_2 = \tfrac{667}{450} \approx 1.482, \quad w_3 = \tfrac{11861}{6750} \approx 1.757,$$

closing in on 2.071, each step removing the same fraction $\tfrac{7}{15}$ of the remaining distance. With $\eta = 0.25$, above $\tfrac{3}{14}$, the factor is $1 - \tfrac73 = -\tfrac43$, and

$$w_1 = \tfrac{29}{6} \approx 4.833, \quad w_2 = -\tfrac{29}{18} \approx -1.611, \quad w_3 = \tfrac{377}{54} \approx 6.981:$$

each step overshoots further than the last.

```check
wv = symbols('w')
L89 = ((wv - 2)**2 + (2*wv - 3)**2 + (3*wv - 7)**2)/3
same(expand(3*L89), 14*wv**2 - 58*wv + 62); same(diff(L89, wv), (28*wv - 58)/3); same(solve(diff(L89, wv), wv), [Rational(29, 14)])
rounds(Rational(29, 14), '2.071'); same(diff(L89, wv, 2), Rational(28, 3))
ws_ = Rational(29, 14)
same(diff(L89, wv), Rational(28, 3)*(wv - ws_)); same(expand(wv - eta_*diff(L89, wv) - ws_), expand((1 - Rational(28, 3)*eta_)*(wv - ws_)))
same(2/Rational(28, 3), Rational(3, 14)); rounds(Rational(3, 14), '0.214'); same(1/Rational(28, 3), Rational(3, 28)); rounds(Rational(3, 28), '0.107')
for et_, want_ in ((Rational(5, 100), [Rational(29, 30), Rational(667, 450), Rational(11861, 6750)]), (Rational(25, 100), [Rational(29, 6), -Rational(29, 18), Rational(377, 54)])):
    w_ = Integer(0); got_ = []
    for _ in range(3):
        w_ = w_ - et_*diff(L89, wv).subs(wv, w_); got_.append(w_)
    same(got_, want_)
same(1 - Rational(28, 3)*Rational(5, 100), Rational(8, 15)); same(1 - Rational(28, 3)*Rational(25, 100), -Rational(4, 3))
rounds(Rational(29, 30), '0.967'); rounds(Rational(667, 450), '1.482'); rounds(Rational(11861, 6750), '1.757')
rounds(Rational(29, 6), '4.833'); rounds(-Rational(29, 18), '-1.611'); rounds(Rational(377, 54), '6.981')
```
:::
::::

:::: exercise $e^\pi$ or $\pi^e$? {#ex-8-10} ★★★
- (a) Find the absolute maximum value of $f(x) = \dfrac{\ln x}{x}$ on $(0, \infty)$.
- (b) Without a calculator, decide which is larger, $e^\pi$ or $\pi^e$.
- (c) Module 6 found that $y = x^{1/x}$ has a horizontal tangent at $x = e$. Show that $e^{1/e}$ is its absolute maximum value on $(0, \infty)$.

::: solution
**(a)** By the quotient rule, $f'(x) = \dfrac{\frac1x\cdot x - \ln x}{x^2} = \dfrac{1 - \ln x}{x^2}$. Since $\ln$ is increasing with $\ln e = 1$, $f'(x) > 0$ for $0 < x < e$ and $f'(x) < 0$ for $x > e$. By Theorem 8.14 the absolute maximum value is $f(e) = \dfrac{1}{e}$, and $f(x) < \dfrac1e$ for every $x \ne e$.

**(b)** Since $\pi \ne e$, (a) gives $\dfrac{\ln\pi}{\pi} < \dfrac1e$. Multiply by $e\pi > 0$: $e\ln\pi < \pi$, that is, $\ln\big(\pi^e\big) < \ln\big(e^\pi\big)$. As $\ln$ is increasing, $\pi^e < e^\pi$. (In fact $e^\pi \approx 23.14$ and $\pi^e \approx 22.46$.)

**(c)** For $x > 0$, $x^{1/x} = e^{(\ln x)/x}$, and $e^u$ is increasing in $u$. By (a), the exponent $(\ln x)/x$ is largest, $\tfrac1e$, at $x = e$, and smaller everywhere else; so $x^{1/x}$ is largest at $x = e$, with value $e^{1/e} \approx 1.4447$. This is the promise Module 6 made.

```check
f810e = log(x)/x
same(diff(f810e, x), (1 - log(x))/x**2); same(f810e.subs(x, E), exp(-1))
same(maximum(f810e, x, Interval.open(0, oo)), exp(-1))
holds(log(pi)/pi < exp(-1)); holds(E*log(pi) < pi); holds(pi**E < E**pi)
rounds(E**pi, '23.14'); rounds(pi**E, '22.46'); rounds(exp(exp(-1)), '1.4447')
xpp = symbols('x', positive=True); same(xpp**(1/xpp), exp(log(xpp)/xpp))
```
:::
::::

:::: exercise The longest pipe round a corner {#ex-8-11} ★★★
A corridor 2.7 m wide meets a corridor 0.8 m wide at a right angle. A straight pipe, carried level and thin enough to ignore its thickness, is to be moved from one corridor into the other. What is the longest pipe that fits round the corner?

Hint: a segment that touches the inner corner and makes the angle $\theta$ with the walls of the wide corridor reaches the outer walls when its length is $L(\theta) = \dfrac{2.7}{\sin\theta} + \dfrac{0.8}{\cos\theta}$, for $0 < \theta < \dfrac{\pi}{2}$. A pipe can pass the corner exactly when it is no longer than every such segment.

::: solution
The pipe passes exactly when its length is at most the smallest value of $L$ on $\big(0, \tfrac{\pi}{2}\big)$; at the angle where $L$ is smallest, a longer pipe would jam. So minimise $L$. By the chain rule,

$$L'(\theta) = -\frac{2.7\cos\theta}{\sin^2\theta} + \frac{0.8\sin\theta}{\cos^2\theta} = \frac{0.8\sin^3\theta - 2.7\cos^3\theta}{\sin^2\theta\cos^2\theta}.$$

The top equals $\cos^3\theta\,(0.8\tan^3\theta - 2.7)$, so $L'(\theta) = 0$ when $\tan^3\theta = \dfrac{2.7}{0.8} = 3.375 = 1.5^3$, that is, at $\tan\theta^* = 1.5$. Since $\tan$ is increasing on $\big(0, \tfrac{\pi}{2}\big)$, $L' < 0$ for $\theta < \theta^*$ and $L' > 0$ for $\theta > \theta^*$, so by Theorem 8.14 $L(\theta^*)$ is the absolute minimum. A right triangle with legs 1 and 1.5 has hypotenuse $\sqrt{1 + 2.25} = \sqrt{3.25} = \tfrac{\sqrt{13}}{2}$, so $\sin\theta^* = \dfrac{3}{\sqrt{13}}$ and $\cos\theta^* = \dfrac{2}{\sqrt{13}}$, and

$$L(\theta^*) = \frac{2.7\sqrt{13}}{3} + \frac{0.8\sqrt{13}}{2} = (0.9 + 0.4)\sqrt{13} = 1.3\sqrt{13} \approx 4.687 \text{ m}.$$

The longest pipe that fits is about 4.69 m. In general, for corridors of widths $p$ and $q$ the same steps give $(p^{2/3} + q^{2/3})^{3/2}$; check that it gives 4.687 here.

```check
th = symbols('theta')
L811 = Rational(27, 10)/sin(th) + Rational(8, 10)/cos(th)
same(diff(L811, th), -Rational(27, 10)*cos(th)/sin(th)**2 + Rational(8, 10)*sin(th)/cos(th)**2)
same(diff(L811, th), (Rational(8, 10)*sin(th)**3 - Rational(27, 10)*cos(th)**3)/(sin(th)**2*cos(th)**2))
same(Rational(27, 10)/Rational(8, 10), Rational(3375, 1000)); same(Rational(3, 2)**3, Rational(3375, 1000))
ts = atan(Rational(3, 2))
same(sin(ts), 3/sqrt(13)); same(cos(ts), 2/sqrt(13)); same(sqrt(1 + Rational(9, 4)), sqrt(13)/2)
same(L811.subs(th, ts), Rational(13, 10)*sqrt(13)); rounds(Rational(13, 10)*sqrt(13), '4.687'); rounds(Rational(13, 10)*sqrt(13), '4.69')
same(diff(L811, th).subs(th, ts), 0); holds(diff(L811, th).subs(th, Rational(1, 2)) < 0); holds(diff(L811, th).subs(th, Rational(3, 2)) > 0)
near((Rational(27, 10)**Rational(2, 3) + Rational(8, 10)**Rational(2, 3))**Rational(3, 2), Rational(13, 10)*sqrt(13), 1e-20)
```
:::
::::

:::: exercise The equation $f' = kf$ {#ex-8-12} ★★★
- (a) Let $k$ be a constant, and let $f$ be differentiable on $\R$ with $f'(x) = kf(x)$ for every $x$. Show that $f(x) = f(0)e^{kx}$ for every $x$. (Consider $g(x) = f(x)e^{-kx}$.)
- (b) Deduce that $e^x$ is the only function with $f' = f$ and $f(0) = 1$.
- (c) In the same way, show that if $f'(x) = 2xf(x)$ for every $x$, then $f(x) = f(0)e^{x^2}$.

::: solution
**(a)** By the product rule and the chain rule,

$$g'(x) = f'(x)e^{-kx} + f(x)\cdot\big(-ke^{-kx}\big) = \big(f'(x) - kf(x)\big)e^{-kx} = 0$$

for every $x$, since $f' = kf$. By Theorem 8.5, applied on the interval $\R$, $g$ is constant: $g(x) = g(0) = f(0)e^0 = f(0)$. So $f(x)e^{-kx} = f(0)$, and multiplying by $e^{kx}$ gives $f(x) = f(0)e^{kx}$.

**(b)** With $k = 1$ and $f(0) = 1$, (a) gives $f(x) = e^x$. Module 6 showed that $e^x$ has these two properties; now no other function has them. In the same way, Module 6's models of growth and decay, $N(t) = N_0e^{kt}$, are the only solutions of $N' = kN$ with $N(0) = N_0$: a quantity that grows at a rate proportional to its size must grow exponentially. Module 13 meets such equations again.

**(c)** Let $g(x) = f(x)e^{-x^2}$. Then

$$g'(x) = f'(x)e^{-x^2} - 2xf(x)e^{-x^2} = \big(f'(x) - 2xf(x)\big)e^{-x^2} = 0,$$

so $g(x) = g(0) = f(0)$ for every $x$, and $f(x) = f(0)e^{x^2}$.

```check
kk8 = symbols('k')
gq = Function('f')
same(diff(gq(x)*exp(-kk8*x), x), (diff(gq(x), x) - kk8*gq(x))*exp(-kk8*x))
same(diff(gq(x)*exp(-kk8*x), x).subs(Derivative(gq(x), x), kk8*gq(x)), 0)
same(diff(c*exp(kk8*x), x), kk8*c*exp(kk8*x)); same((c*exp(kk8*x)).subs(x, 0), c)
same(diff(gq(x)*exp(-x**2), x).subs(Derivative(gq(x), x), 2*x*gq(x)), 0)
same(diff(c*exp(x**2), x), 2*x*c*exp(x**2))
```
:::
::::

## Check yourself {#quiz}

```quiz
? Suppose $f'(3) = 0$. Which statement must be true?
- [ ] $f$ has a local maximum or a local minimum at 3
- [x] The tangent line at $x = 3$ is horizontal, but $f$ may have no extremum there
- [ ] 3 is not a critical number of $f$
- [ ] $f$ is constant near 3
> $f'(3) = 0$ says that the slope at 3 is 0, so 3 is a critical number with a horizontal tangent. Fermat's theorem does not work backwards: $(x - 3)^3$ has derivative 0 at 3 and no extremum there. A derivative that is 0 at one point says nothing about nearby points, so $f$ need not be constant.

? The absolute maximum value of $f(x) = x^2 - 2x$ on $[0, 3]$ is
- [x] $3$
- [ ] $1$
- [ ] $0$
- [ ] $-1$
> The only critical number is 1, where $f'(x) = 2x - 2 = 0$. The values are $f(0) = 0$, $f(1) = -1$ and $f(3) = 3$, so the maximum is 3, at the endpoint 3. $-1$ is the minimum value; 1 is the critical number itself, not a value; 0 is the value at the other endpoint.

? $f$ is differentiable on $\R$, $f(1) = 2$ and $f(4) = 11$. The Mean Value Theorem guarantees a number $c$ in $(1, 4)$ with
- [ ] $f(c) = 3$
- [ ] $f'(c) = 9$
- [ ] $f'(c) = 0$
- [x] $f'(c) = 3$
> The average rate of change is $\dfrac{11 - 2}{4 - 1} = 3$, and the theorem says that $f'(c)$ equals it for some $c$ in $(1, 4)$. 9 is the change in $f$ without dividing by the change in $x$; $f'(c) = 0$ is Rolle's theorem, which needs $f(1) = f(4)$; and the theorem is about the derivative, not the value $f(c)$.

? $f'(x) = 0$ for every $x$ in the domain $(-\infty, 0) \cup (0, \infty)$ of $f$. What follows?
- [ ] $f$ is constant
- [ ] $f(x) = 0$ for every $x \ne 0$
- [x] $f$ is constant on $(-\infty, 0)$ and constant on $(0, \infty)$, possibly with different constants
- [ ] Nothing: Theorem 8.5 needs $f'(0) = 0$
> Theorem 8.5 applies on each interval separately, since the domain is two intervals. $\arctan x + \arctan(1/x)$ is $\tfrac{\pi}{2}$ on one and $-\tfrac{\pi}{2}$ on the other, so $f$ need not be one constant, and need not be 0. The theorem needs $f' = 0$ only on the interval where it is applied.

? $f'(2) = 0$ and $f''(2) = -3$. Then
- [x] $f$ has a local maximum at 2
- [ ] $f$ has a local minimum at 2
- [ ] $f$ has an inflection point at 2
- [ ] the second derivative test gives no information
> By the second derivative test, $f''(2) < 0$ at a critical number with a horizontal tangent means concave down there: a peak, a local maximum. A local minimum needs $f''(2) > 0$. At an inflection point where $f''$ exists it is 0 (Theorem 8.12), and $f''(2) = -3$ is not. The test is silent only when $f''(2) = 0$.

? Which of these functions has an inflection point at $x = 0$?
- [ ] $x^4$
- [x] $x^3 + x$
- [ ] $x^2$
- [ ] $e^x$
> For $x^3 + x$, $f''(x) = 6x$ changes sign at 0: concave down on the left, concave up on the right. For $x^4$, $f''(0) = 0$ but $f''(x) = 12x^2 \ge 0$, so the graph is concave up on both sides: no change, no inflection point. $x^2$ and $e^x$ have $f'' > 0$ everywhere.

? A rectangle has perimeter 20 cm. What is its largest possible area?
- [ ] $24$ cm²
- [ ] $100$ cm²
- [x] $25$ cm²
- [ ] $20$ cm²
> With sides $x$ and $10 - x$, the area is $A(x) = x(10 - x)$ on $[0, 10]$. $A'(x) = 10 - 2x = 0$ at $x = 5$, and $A(5) = 25$, larger than $A(0) = A(10) = 0$: the best rectangle is a square. 24 cm² is a 4 by 6 rectangle, which is not the best; 100 cm² would need a 10 by 10 square, whose perimeter is 40 cm; 20 is the perimeter, not an area.

? Gradient descent $x_{k+1} = x_k - \eta f'(x_k)$ on $f(x) = 2x^2$ approaches the minimum 0 from every $x_0 \ne 0$ exactly when
- [ ] $0 < \eta < 2$
- [ ] $0 < \eta < \tfrac14$
- [x] $0 < \eta < \tfrac12$
- [ ] $\eta > 0$
> $f'(x) = 4x$, so $x_{k+1} = (1 - 4\eta)x_k$, which shrinks to 0 exactly when $\abs{1 - 4\eta} < 1$, that is, $0 < \eta < \tfrac12 = 2/f''$. For $\tfrac14 < \eta < \tfrac12$ it still converges, zigzagging; $\eta = \tfrac14$ lands in one step. $0 < \eta < 2$ ignores the curvature $f'' = 4$: with $\eta = 1$ the factor is $-3$ and the steps blow up.
```

```check
same(diff((x - 3)**3, x).subs(x, 3), 0); holds((Rational(29, 10) - 3)**3 < 0); holds((Rational(31, 10) - 3)**3 > 0)
fq1 = x**2 - 2*x
same(solve(diff(fq1, x), x), [1]); same([fq1.subs(x, v_) for v_ in (0, 1, 3)], [0, -1, 3]); same(maximum(fq1, x, Interval(0, 3)), 3)
same((11 - 2)/Integer(4 - 1), 3)
same(diff(x**3 + x, x, 2), 6*x); same(diff(x**4, x, 2), 12*x**2); same(diff(x**2, x, 2), 2); same(diff(exp(x), x, 2), exp(x))
Aq = x*(10 - x)
same(solve(diff(Aq, x), x), [5]); same(Aq.subs(x, 5), 25); same(maximum(Aq, x, Interval(0, 10)), 25); same(4*6, 24); same(2*(10 + 10), 40)
same(diff(2*x**2, x), 4*x); same(solve_univariate_inequality(Abs(1 - 4*eta_) < 1, eta_, relational=False), Interval.open(0, Rational(1, 2)))
same(1 - 4*1, -3); same((1 - 4*eta_).subs(eta_, Rational(1, 4)), 0)
```
