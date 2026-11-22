---
title: Techniques of integration
part: 3
lead: Integrate products, powers of trigonometric functions, square roots of quadratics and rational functions, by parts, with identities, with trigonometric substitutions and with partial fractions. You will also learn to choose a method, to check a computer's answer, to recognise integrals that no formula can express, and to compute any integral numerically with a guaranteed accuracy.
minutes: 270
needs: Modules 1 to 10, especially the product and chain rules (Module 5), the derivatives of Modules 5 and 6, and antiderivatives and substitution (Module 10)
goals:
  - Integrate by parts, choosing $u$ and $dv$, repeatedly or in a table, in definite integrals and to derive reduction formulas
  - Integrate powers of sines, cosines, tangents and secants with identities and substitutions
  - Evaluate integrals containing $\sqrt{a^2 - x^2}$, $\sqrt{a^2 + x^2}$ or $\sqrt{x^2 - a^2}$ by trigonometric substitution, and return to $x$ with a triangle
  - Integrate rational functions by long division and partial fractions
  - Choose a method, check a computer's answer by differentiating it, and recognise integrands with no elementary antiderivative
  - Approximate integrals with the midpoint, trapezoidal and Simpson's rules, and bound their errors
---

## Integration by parts {#parts}

Module 10 turned the chain rule round and got the substitution rule. This section turns the product rule round. Products are everywhere in integrals, $x\cos x$, $xe^{-x}$, $x^2\ln x$, $e^x\sin x$, and Module 10 warned that there is no product rule for antiderivatives: an antiderivative of $x\cos x$ is not $\tfrac12x^2\sin x$ ([Section 10.1](module_10_EN.html#antiderivatives)).

Start from the [product rule](module_05_EN.html#product) of Module 5, $(fg)' = f'g + fg'$. Read backwards, it says that $fg$ is an antiderivative of $f'g + fg'$. So if you can integrate one of the two terms, you can integrate the other. Try it on $x\cos x$, with $f(x) = x$ and $g(x) = \sin x$, so that $fg' = x\cos x$ is the integrand and $f'g = \sin x$ is easy:

$$\frac{d}{dx}(x\sin x) = \sin x + x\cos x.$$

So $x\cos x = (x\sin x)' - \sin x$, and an antiderivative of the right side is $x\sin x - (-\cos x)$:

$$\int x\cos x\,dx = x\sin x + \cos x + C.$$

Check: $\dfrac{d}{dx}(x\sin x + \cos x) = \sin x + x\cos x - \sin x = x\cos x$.

```check
same(diff(x*sin(x), x), sin(x) + x*cos(x))
same(x*cos(x), diff(x*sin(x), x) - sin(x))
antideriv(x*sin(x) - (-cos(x)), x*cos(x), x)
steps(Derivative(x*sin(x) + cos(x), x), sin(x) + x*cos(x) - sin(x), x*cos(x))
```

::: theorem Integration by parts
Let $f$ and $g$ have continuous derivatives on an interval $I$. Then, on $I$,

$$\begin{aligned} &\int f(x)\,g'(x)\,dx \\ &\quad= f(x)\,g(x) - \int f'(x)\,g(x)\,dx. \end{aligned}$$

That is: if $G$ is an antiderivative of $f'g$ on $I$, then $fg - G$ is an antiderivative of $fg'$.
:::

::: proof
The function $f'g$ is continuous on $I$, so it has an antiderivative $G$ there, by Part 1 of the Fundamental Theorem ([Section 10.4](module_10_EN.html#ftc1)). By the product rule,

$$(fg - G)' = f'g + fg' - f'g = fg'$$

on $I$. So $fg - G$ is an antiderivative of $fg'$.
:::

```check
fF, gF, GF = Function('f'), Function('g'), Function('G')
same(diff(fF(x)*gF(x), x) - diff(fF(x), x)*gF(x), fF(x)*diff(gF(x), x))
expr_ = diff(fF(x)*gF(x) - GF(x), x).subs(Derivative(GF(x), x), diff(fF(x), x)*gF(x))
same(expr_, fF(x)*diff(gF(x), x))                       # (fg - G)' = fg' when G' = f'g
```

In Leibniz's notation, put $u = f(x)$ and $v = g(x)$, so that $du = f'(x)\,dx$ and $dv = g'(x)\,dx$ are their [differentials](module_07_EN.html#differentials). The formula becomes

$$\int u\,dv = uv - \int v\,du,$$

read "the integral of u d v is u v minus the integral of v d u". To use it, split the integrand into two factors: $u$, which you will differentiate, and $dv$, which includes $dx$ and which you must be able to integrate. The formula trades $\int u\,dv$ for $\int v\,du$, and it helps when the new integral is simpler than the old.

::: example Three integrals by parts
Find (a) $\displaystyle\int xe^{-x}\,dx$, (b) $\displaystyle\int \ln x\,dx$, for $x > 0$, and (c) $\displaystyle\int \arctan x\,dx$.

**(a)** Let $u = x$ and $dv = e^{-x}\,dx$. Then $du = dx$ and $v = -e^{-x}$; any antiderivative of $e^{-x}$ will do, so take the simplest. So

$$\begin{aligned} &\int xe^{-x}\,dx \\ &\quad= x\big(-e^{-x}\big) - \int \big(-e^{-x}\big)\,dx \\ &\quad= -xe^{-x} + \int e^{-x}\,dx \\ &\quad= -xe^{-x} - e^{-x} + C. \end{aligned}$$

Check: $\dfrac{d}{dx}\big(-xe^{-x} - e^{-x}\big) = -e^{-x} + xe^{-x} + e^{-x} = xe^{-x}$.

**(b)** There seems to be only one factor, but $\ln x\,dx$ is $u\,dv$ with $u = \ln x$ and $dv = dx$. Then $du = \dfrac{dx}{x}$ and $v = x$:

$$\begin{aligned} \int \ln x\,dx &= x\ln x - \int x\cdot\frac1x\,dx \\ &= x\ln x - x + C. \end{aligned}$$

**(c)** The same trick: $u = \arctan x$ and $dv = dx$, so $du = \dfrac{dx}{1 + x^2}$ and $v = x$. Then

$$\begin{aligned} &\int \arctan x\,dx \\ &\quad= x\arctan x - \int \frac{x}{1 + x^2}\,dx \\ &\quad= x\arctan x - \tfrac12\ln\big(1 + x^2\big) + C, \end{aligned}$$

the last integral by the substitution $w = 1 + x^2$, $dw = 2x\,dx$ (Module 10), with no absolute value bars because $1 + x^2 > 0$.

```check
steps(Integral(x*exp(-x), x), x*(-exp(-x)) - Integral(-exp(-x), x), -x*exp(-x) + Integral(exp(-x), x), -x*exp(-x) - exp(-x))
antideriv(-exp(-x), exp(-x), x); antideriv(-x*exp(-x) - exp(-x), x*exp(-x), x)
steps(Derivative(-x*exp(-x) - exp(-x), x), -exp(-x) + x*exp(-x) + exp(-x), x*exp(-x))
xp = symbols('x', positive=True)
same(diff(log(xp), xp), 1/xp); antideriv(xp, 1, xp)
steps(Integral(log(xp), xp), xp*log(xp) - Integral(xp*(1/xp), xp), xp*log(xp) - xp)
antideriv(xp*log(xp) - xp, log(xp), xp)
same(diff(atan(x), x), 1/(1 + x**2)); antideriv(log(1 + x**2)/2, x/(1 + x**2), x)
steps(Integral(atan(x), x), x*atan(x) - Integral(x/(1 + x**2), x), x*atan(x) - log(1 + x**2)/2)
antideriv(x*atan(x) - log(1 + x**2)/2, atan(x), x)
```
:::

### Choosing u and dv {#choosing}

The choice matters. In $\int x\cos x\,dx$, take the opposite roles, $u = \cos x$ and $dv = x\,dx$. Then $du = -\sin x\,dx$ and $v = \tfrac12x^2$, and

$$\int x\cos x\,dx = \tfrac12x^2\cos x + \tfrac12\int x^2\sin x\,dx.$$

That is true, but the new integral is harder than the old one: the power of $x$ went up instead of down. Integration by parts pays off when differentiating $u$ makes it simpler, and integrating $dv$ does not make it much worse.

```check
steps(Integral(x*cos(x), x), cos(x)*x**2/2 - Integral(x**2/2*(-sin(x)), x), x**2*cos(x)/2 + Integral(x**2*sin(x), x)/2)
```

::: keyidea
A rough guide to the choice of $u$ is the word **LIATE**. Take for $u$ the factor whose kind comes first in the list

1. **L**ogarithmic: $\ln x$
2. **I**nverse trigonometric: $\arctan x$, $\arcsin x$
3. **A**lgebraic: powers and polynomials, such as $x$, $x^3$, $\sqrt x$
4. **T**rigonometric: $\sin x$, $\cos x$
5. **E**xponential: $e^x$, $e^{-2x}$, $2^x$

and let $dv$ be the rest, with $dx$. The kinds early in the list get simpler when they are differentiated ($\ln x$ becomes $1/x$, $\arctan x$ becomes $1/(1 + x^2)$, $x^3$ becomes $3x^2$); the kinds late in the list are easy to integrate and stay the same kind.
:::

In $\int xe^{-x}\,dx$, algebraic comes before exponential, so $u = x$; in $\int \ln x\,dx$ and $\int \arctan x\,dx$, the logarithm and the inverse tangent come first, and $dv = dx$. But LIATE is a rule of thumb, not a theorem, and the requirement that you can integrate $dv$ comes first.

::: example When the guide misleads
Find $\displaystyle\int x^3e^{x^2}\,dx$.

LIATE suggests $u = x^3$ and $dv = e^{x^2}\,dx$. But then $v$ would be an antiderivative of $e^{x^2}$, and no formula built from the functions of Module 1's catalogue is one (Section 11.6). Split the integrand differently. The factor $e^{x^2}$ can be integrated only together with a factor $x$, by the substitution $w = x^2$, $dw = 2x\,dx$: $\int xe^{x^2}\,dx = \tfrac12e^{x^2} + C$. So take

$$\begin{aligned} u &= x^2, & dv &= xe^{x^2}\,dx, \\ du &= 2x\,dx, & v &= \tfrac12e^{x^2}. \end{aligned}$$

Then

$$\begin{aligned} \int x^3e^{x^2}\,dx &= \tfrac12x^2e^{x^2} - \int \tfrac12e^{x^2}\cdot 2x\,dx \\ &= \tfrac12x^2e^{x^2} - \tfrac12e^{x^2} + C \\ &= \tfrac12\big(x^2 - 1\big)e^{x^2} + C, \end{aligned}$$

the middle integral by the same substitution. Check: $\dfrac{d}{dx}\Big(\tfrac12\big(x^2 - 1\big)e^{x^2}\Big) = xe^{x^2} + \tfrac12\big(x^2 - 1\big)2xe^{x^2} = x^3e^{x^2}$.

```check
antideriv(exp(x**2)/2, x*exp(x**2), x); same(diff(x**2, x), 2*x)
steps(Integral(x**3*exp(x**2), x), x**2*exp(x**2)/2 - Integral(exp(x**2)/2*2*x, x), x**2*exp(x**2)/2 - exp(x**2)/2, (x**2 - 1)*exp(x**2)/2)
steps(Derivative((x**2 - 1)*exp(x**2)/2, x), x*exp(x**2) + (x**2 - 1)/2*2*x*exp(x**2), x**3*exp(x**2))
```
:::

::: pitfall
Three slips with parts. **(1)** The sign: $\int u\,dv$ is $uv$ *minus* $\int v\,du$. **(2)** Integrating $dv$ carelessly. In $\int xe^{3x}\,dx$, with $u = x$ and $dv = e^{3x}\,dx$, $v$ is $\tfrac13e^{3x}$, not $e^{3x}$, and the answer is $\tfrac13xe^{3x} - \tfrac19e^{3x} + C$; with $v = e^{3x}$ you would get $xe^{3x} - e^{3x}$, whose derivative is $3xe^{3x} - 2e^{3x}$. **(3)** A choice that cannot work: a $dv$ you cannot integrate, as in Example 11.2, or a $u$ that does not get simpler. Differentiate the answer to catch all three.

```check
antideriv(x*exp(3*x)/3 - exp(3*x)/9, x*exp(3*x), x)
same(diff(x*exp(3*x) - exp(3*x), x), 3*x*exp(3*x) - 2*exp(3*x))
```
:::

### Repeated parts and the tabular method {#repeated}

Sometimes the new integral is simpler but still a product, and a second round of parts finishes the job.

::: example Twice by parts
Find $\displaystyle\int x^2\sin x\,dx$.

By LIATE, $u = x^2$ and $dv = \sin x\,dx$, so $du = 2x\,dx$ and $v = -\cos x$:

$$\begin{aligned} &\int x^2\sin x\,dx \\ &\quad= -x^2\cos x + \int 2x\cos x\,dx. \end{aligned}$$

The new integrand is again a product, with a lower power of $x$. It is twice the integral found at the start of this section (by parts with $u = x$ and $dv = \cos x\,dx$), that is, $2(x\sin x + \cos x) + C$. So

$$\begin{aligned} &\int x^2\sin x\,dx \\ &\quad= -x^2\cos x + 2x\sin x \\ &\qquad + 2\cos x + C. \end{aligned}$$

Each round lowers the power of $x$ by one, so $x^n$ needs $n$ rounds.

```check
same(diff(x**2, x), 2*x); antideriv(-cos(x), sin(x), x)
steps(Integral(x**2*sin(x), x), -x**2*cos(x) + Integral(2*x*cos(x), x), -x**2*cos(x) + 2*(x*sin(x) + cos(x)), -x**2*cos(x) + 2*x*sin(x) + 2*cos(x))
antideriv(-x**2*cos(x) + 2*x*sin(x) + 2*cos(x), x**2*sin(x), x)
```
:::

When $u$ is a polynomial, the rounds follow a pattern that a table organises: the **tabular method**. Write $u$ and its successive derivatives in one column, down to 0, and the function in $dv$ and its successive antiderivatives in the other. Multiply each entry of the left column by the entry one row lower in the right column, give the products the signs $+, -, +, -, \dots$ in turn, and add them up.

::: example The tabular method
Find $\displaystyle\int x^3e^{2x}\,dx$.

Differentiate $x^3$ until it becomes 0, and integrate $e^{2x}$ as many times:

| Sign | Differentiate | Integrate |
|---|---|---|
| $+$ | $x^3$ | $e^{2x}$ |
| $-$ | $3x^2$ | $\tfrac12e^{2x}$ |
| $+$ | $6x$ | $\tfrac14e^{2x}$ |
| $-$ | $6$ | $\tfrac18e^{2x}$ |
| | $0$ | $\tfrac1{16}e^{2x}$ |

Multiplying along the diagonals, with the signs of the first column,

$$\begin{aligned} &\int x^3e^{2x}\,dx \\ &\quad= \tfrac12x^3e^{2x} - \tfrac34x^2e^{2x} \\ &\qquad + \tfrac34xe^{2x} - \tfrac38e^{2x} + C \\ &\quad= \tfrac18e^{2x}\big(4x^3 - 6x^2 + 6x - 3\big) + C. \end{aligned}$$

Each diagonal is one round of parts. The first round gives $x^3\cdot\tfrac12e^{2x} - \int 3x^2\cdot\tfrac12e^{2x}\,dx$: the first product, minus the integral of the next row's two entries. That integral is treated the same way, with every sign reversed, and so on. The process stops when the left column reaches 0, because then the leftover integral is 0.

```check
same([diff(x**3, x, k_) for k_ in range(5)], [x**3, 3*x**2, 6*x, 6, 0])
same([diff(exp(2*x)/2**k_, x) for k_ in range(1, 5)], [exp(2*x)/2**(k_ - 1) for k_ in range(1, 5)])   # each entry integrates the one above
steps(Integral(x**3*exp(2*x), x), x**3*exp(2*x)/2 - Integral(3*x**2*exp(2*x)/2, x))
diag_ = x**3*exp(2*x)/2 - 3*x**2*exp(2*x)/4 + 6*x*exp(2*x)/8 - 6*exp(2*x)/16
same(diag_, x**3*exp(2*x)/2 - Rational(3, 4)*x**2*exp(2*x) + Rational(3, 4)*x*exp(2*x) - Rational(3, 8)*exp(2*x))
same(diag_, exp(2*x)*(4*x**3 - 6*x**2 + 6*x - 3)/8); antideriv(diag_, x**3*exp(2*x), x)
```
:::

### Definite integrals by parts {#definite-parts}

For a definite integral, evaluate $uv$ between the limits.

::: theorem Integration by parts in definite integrals
If $f$ and $g$ have continuous derivatives on $[a, b]$, then

$$\begin{aligned} &\int_a^b f(x)\,g'(x)\,dx \\ &\quad= \big[f(x)\,g(x)\big]_a^b - \int_a^b f'(x)\,g(x)\,dx. \end{aligned}$$
:::

::: proof
The functions $fg'$ and $f'g$ are continuous on $[a, b]$, so both integrals exist. Let $G$ be an antiderivative of $f'g$ on $[a, b]$. By Theorem 11.1, $fg - G$ is an antiderivative of $fg'$, so by Part 2 of the Fundamental Theorem ([Section 10.5](module_10_EN.html#ftc2)) the left side is $\big[fg - G\big]_a^b = \big[fg\big]_a^b - \big[G\big]_a^b$, and $\big[G\big]_a^b = \int_a^b f'g\,dx$, by Part 2 again.
:::

```check
same(integrate(x*cos(x), (x, 0, 2)), (x*sin(x)).subs(x, 2) - (x*sin(x)).subs(x, 0) - integrate(sin(x), (x, 0, 2)))   # an instance
same(integrate(log(x)*x, (x, 1, 3)), (log(x)*x**2/2).subs(x, 3) - (log(x)*x**2/2).subs(x, 1) - integrate(x/2, (x, 1, 3)))
```

When $u = f(x)$ and $v = g(x)$ are never negative and both increase with $x$, the theorem has a picture (Figure 11.1). As $x$ runs from $a$ to $b$, the point $(u, v)$ traces a curve from $(u_1, v_1)$ to $(u_2, v_2)$, where $u_1 = f(a)$, $v_1 = g(a)$, $u_2 = f(b)$ and $v_2 = g(b)$. The integral $\int v\,du = \int_a^b g(x)f'(x)\,dx$ is the area between this curve and the $u$-axis, and $\int u\,dv = \int_a^b f(x)g'(x)\,dx$ is the area between the curve and the $v$-axis. Together the two regions fill the rectangle $u_2v_2$ except for the rectangle $u_1v_1$:

$$\int u\,dv + \int v\,du = u_2v_2 - u_1v_1 = \big[uv\big]_a^b,$$

which is Theorem 11.2.

::: figure id=fig-11-1
Integration by parts as areas. Left: the curve traced by $(u, v)$ from $(u_1, v_1)$ to $(u_2, v_2)$. The blue region, between the curve and the $u$-axis, has area $\int v\,du$; the orange region, between the curve and the $v$-axis, has area $\int u\,dv$. Together they make the large rectangle $u_2v_2$ minus the small rectangle $u_1v_1$. Right: the case $u = x$, $v = \ln x$ for $1 \le x \le e$ (Example 11.5(a)). The blue area $\int_1^e \ln x\,dx$ and the orange area $\int_0^1 e^v\,dv = e - 1$ add up to the rectangle $e \times 1$, so the blue area is 1.
:::

::: example Definite integrals by parts
Evaluate (a) $\displaystyle\int_1^e \ln x\,dx$ and (b) $\displaystyle\int_0^\pi x\sin x\,dx$.

**(a)** With $u = \ln x$ and $dv = dx$, as in Example 11.1(b),

$$\begin{aligned} &\int_1^e \ln x\,dx \\ &\quad= \big[x\ln x\big]_1^e - \int_1^e x\cdot\frac1x\,dx \\ &\quad= (e\ln e - 1\cdot\ln 1) - (e - 1) \\ &\quad= e - (e - 1) = 1. \end{aligned}$$

Figure 11.1 (right) shows this area as the rectangle of area $e$ minus the region of area $e - 1$ to the left of the curve.

**(b)** With $u = x$ and $dv = \sin x\,dx$, so $du = dx$ and $v = -\cos x$,

$$\begin{aligned} &\int_0^\pi x\sin x\,dx \\ &\quad= \big[-x\cos x\big]_0^\pi + \int_0^\pi \cos x\,dx \\ &\quad= (-\pi\cos\pi + 0) + \big[\sin x\big]_0^\pi \\ &\quad= \pi + 0 = \pi. \end{aligned}$$

```check
steps(Integral(log(x), (x, 1, E)), (E*log(E) - 1*log(1)) - Integral(x*(1/x), (x, 1, E)), E - (E - 1), 1)
same(integrate(exp(v), (v, 0, 1)), E - 1); same(E*1 - 1*0, E)                   # the picture: e - (e - 1) = 1
steps(Integral(x*sin(x), (x, 0, pi)), (-pi*cos(pi) + 0*cos(0)) + Integral(cos(x), (x, 0, pi)), pi + (sin(pi) - sin(0)), pi)
```
:::

### When the integral comes back {#comes-back}

In some integrals neither factor gets simpler when differentiated. Then two rounds of parts may bring back the integral you started with, and you can solve for it.

::: example An integral that comes back
Find $\displaystyle\int e^x\sin x\,dx$.

Call the integral $I$. Take $u = \sin x$ and $dv = e^x\,dx$, so $du = \cos x\,dx$ and $v = e^x$:

$$I = e^x\sin x - \int e^x\cos x\,dx.$$

The new integral is of the same kind. Integrate by parts again, with the factors in the same roles, $u = \cos x$ and $dv = e^x\,dx$, so $du = -\sin x\,dx$:

$$\begin{aligned} &\int e^x\cos x\,dx \\ &\quad= e^x\cos x + \int e^x\sin x\,dx \\ &\quad= e^x\cos x + I. \end{aligned}$$

Put this into the first equation:

$$I = e^x\sin x - e^x\cos x - I.$$

The unknown integral appears on both sides, so solve for it as in an equation: $2I = e^x(\sin x - \cos x)$, and

$$\int e^x\sin x\,dx = \tfrac12e^x(\sin x - \cos x) + C.$$

Each indefinite integral stands for a family of functions that differ by constants, so these equations hold up to constants; the $+\,C$ at the end collects them. Check: $\dfrac{d}{dx}\Big(\tfrac12e^x(\sin x - \cos x)\Big) = \tfrac12e^x(\sin x - \cos x) + \tfrac12e^x(\cos x + \sin x) = e^x\sin x$.

```check
steps(Integral(exp(x)*sin(x), x), exp(x)*sin(x) - Integral(exp(x)*cos(x), x))
steps(Integral(exp(x)*cos(x), x), exp(x)*cos(x) - Integral(exp(x)*(-sin(x)), x), exp(x)*cos(x) + Integral(exp(x)*sin(x), x))
Iq = symbols('I_q')
same(solve(Eq(Iq, exp(x)*sin(x) - exp(x)*cos(x) - Iq), Iq), [exp(x)*(sin(x) - cos(x))/2])
antideriv(exp(x)*(sin(x) - cos(x))/2, exp(x)*sin(x), x)
steps(Derivative(exp(x)*(sin(x) - cos(x))/2, x), exp(x)*(sin(x) - cos(x))/2 + exp(x)*(cos(x) + sin(x))/2, exp(x)*sin(x))
```
:::

::: pitfall
In the second round, keep the roles of the first. With $u = e^x$ and $dv = \cos x\,dx$ instead, the second round undoes the first: $\int e^x\cos x\,dx = e^x\sin x - I$, and the first equation becomes $I = e^x\sin x - e^x\sin x + I$, that is, $I = I$. True, but no help.

```check
steps(Integral(exp(x)*cos(x), x), exp(x)*sin(x) - Integral(exp(x)*sin(x), x))
same(exp(x)*sin(x) - (exp(x)*sin(x) - Iq), Iq)
```
:::

### Reduction formulas {#reduction}

Some integrals depend on a whole number $n$, such as $\int \sin^n x\,dx$ or $\int x^ne^x\,dx$. Integration by parts can lower $n$. A **reduction formula** expresses such an integral in terms of the same integral with a smaller $n$; applied again and again, it brings $n$ down to 0 or 1.

::: theorem A reduction formula for powers of sine
For every whole number $n \ge 2$,

$$\begin{aligned} \int \sin^n x\,dx &= -\frac{\sin^{n-1}x\cos x}{n} \\ &\quad + \frac{n - 1}{n}\int \sin^{n-2}x\,dx. \end{aligned}$$
:::

::: proof
Write $\sin^n x = \sin^{n-1}x\cdot\sin x$ and integrate by parts with $u = \sin^{n-1}x$ and $dv = \sin x\,dx$. By the chain rule $du = (n - 1)\sin^{n-2}x\cos x\,dx$, and $v = -\cos x$:

$$\begin{aligned} &\int \sin^n x\,dx \\ &\quad= -\sin^{n-1}x\cos x \\ &\qquad + (n - 1)\int \sin^{n-2}x\cos^2 x\,dx. \end{aligned}$$

Replace $\cos^2 x$ by $1 - \sin^2 x$ and split the integral:

$$\begin{aligned} &\int \sin^n x\,dx \\ &\quad= -\sin^{n-1}x\cos x \\ &\qquad + (n - 1)\int \sin^{n-2}x\,dx \\ &\qquad - (n - 1)\int \sin^n x\,dx. \end{aligned}$$

The integral of $\sin^n x$ has come back, as in Example 11.6. Add $(n - 1)\int \sin^n x\,dx$ to both sides and divide by $n$.
:::

```check
for N_ in range(2, 10):
    same(diff(-sin(x)**(N_ - 1)*cos(x)/N_, x) + Rational(N_ - 1, N_)*sin(x)**(N_ - 2), sin(x)**N_)
    same(diff(sin(x)**(N_ - 1), x), (N_ - 1)*sin(x)**(N_ - 2)*cos(x))
    steps(Integral(sin(x)**N_, x), -sin(x)**(N_ - 1)*cos(x) + (N_ - 1)*Integral(sin(x)**(N_ - 2)*cos(x)**2, x),
          -sin(x)**(N_ - 1)*cos(x) + (N_ - 1)*Integral(sin(x)**(N_ - 2), x) - (N_ - 1)*Integral(sin(x)**N_, x))
```

::: example Powers of sine
Find (a) $\displaystyle\int \sin^2 x\,dx$, (b) $\displaystyle\int \sin^4 x\,dx$ and (c) $\displaystyle\int_0^{\pi/2} \sin^4 x\,dx$.

**(a)** With $n = 2$, and $\sin^0 x = 1$,

$$\int \sin^2 x\,dx = -\tfrac12\sin x\cos x + \tfrac12x + C.$$

**(b)** With $n = 4$, and then (a),

$$\begin{aligned} &\int \sin^4 x\,dx \\ &\quad= -\tfrac14\sin^3 x\cos x + \tfrac34\int \sin^2 x\,dx \\ &\quad= -\tfrac14\sin^3 x\cos x - \tfrac38\sin x\cos x \\ &\qquad + \tfrac38x + C. \end{aligned}$$

**(c)** In a definite integral, the reduction formula holds with its first term evaluated between the limits (use Theorem 11.2 in the proof). On $[0, \pi/2]$ that term vanishes at both ends, since $\sin 0 = 0$, $\cos\tfrac{\pi}{2} = 0$ and the power $n - 1$ is at least 1. So, applying the formula twice,

$$\begin{aligned} \int_0^{\pi/2} \sin^4 x\,dx &= \frac34\int_0^{\pi/2} \sin^2 x\,dx \\ &= \frac34\cdot\frac12\int_0^{\pi/2} 1\,dx \\ &= \frac34\cdot\frac12\cdot\frac{\pi}{2} \\ &= \frac{3\pi}{16} \approx 0.5890. \end{aligned}$$

The second line says that $\int_0^{\pi/2} \sin^2 x\,dx = \tfrac12\cdot\tfrac{\pi}{2} = \tfrac{\pi}{4}$, as [Exercise 10.12](module_10_EN.html#ex-10-12) found by symmetry.

```check
antideriv(-sin(x)*cos(x)/2 + x/2, sin(x)**2, x)
steps(Integral(sin(x)**4, x), -sin(x)**3*cos(x)/4 + Rational(3, 4)*Integral(sin(x)**2, x), -sin(x)**3*cos(x)/4 - Rational(3, 8)*sin(x)*cos(x) + Rational(3, 8)*x)
antideriv(-sin(x)**3*cos(x)/4 - Rational(3, 8)*sin(x)*cos(x) + Rational(3, 8)*x, sin(x)**4, x)
for N_ in (2, 3, 4):
    same((-sin(x)**(N_ - 1)*cos(x)/N_).subs(x, pi/2) - (-sin(x)**(N_ - 1)*cos(x)/N_).subs(x, 0), 0)
steps(Integral(sin(x)**4, (x, 0, pi/2)), Rational(3, 4)*Integral(sin(x)**2, (x, 0, pi/2)), Rational(3, 4)*Rational(1, 2)*Integral(1, (x, 0, pi/2)), Rational(3, 4)*Rational(1, 2)*pi/2, 3*pi/16)
rounds(3*pi/16, '0.5890'); same(integrate(sin(x)**2, (x, 0, pi/2)), Rational(1, 2)*pi/2); same(Rational(1, 2)*pi/2, pi/4)
```
:::

## Trigonometric integrals {#trig-integrals}

Example 11.7 integrated powers of the sine with a reduction formula. Most products of powers of sines and cosines give way faster, to an identity and a substitution. Three identities do the work. The first is the Pythagorean identity $\sin^2 x + \cos^2 x = 1$ of [Module 1](module_01_EN.html#trig); dividing it by $\cos^2 x$ gives the second, $\tan^2 x + 1 = \sec^2 x$. The third comes from the addition formula $\cos(x + y) = \cos x\cos y - \sin x\sin y$ of Module 1, with $y = x$:

$$\cos 2x = \cos^2 x - \sin^2 x.$$

Replacing $\cos^2 x$ by $1 - \sin^2 x$, or $\sin^2 x$ by $1 - \cos^2 x$, and solving gives the **half-angle identities**

$$\begin{aligned} \sin^2 x &= \frac{1 - \cos 2x}{2}, \\ \cos^2 x &= \frac{1 + \cos 2x}{2}. \end{aligned}$$

They trade a square for a cosine of twice the angle, which is easy to integrate. In the same way the addition formula for the sine gives $\sin 2x = 2\sin x\cos x$.

```check
same(sin(x)**2 + cos(x)**2, 1); same(sin(x)**2/cos(x)**2 + 1, sec(x)**2); same(tan(x)**2 + 1, sec(x)**2)
same(expand_trig(cos(x + y)).subs(y, x), cos(x)**2 - sin(x)**2); same(cos(2*x), cos(x)**2 - sin(x)**2)
same(cos(2*x), 1 - 2*sin(x)**2); same(cos(2*x), 2*cos(x)**2 - 1)
same(sin(x)**2, (1 - cos(2*x))/2); same(cos(x)**2, (1 + cos(2*x))/2); same(sin(2*x), 2*sin(x)*cos(x))
```

### Powers of sine and cosine {#sin-cos}

::: keyidea
To integrate $\sin^m x\cos^n x$, where $m$ and $n$ are whole numbers:

- If the power $n$ of the cosine is odd, save one factor $\cos x$, write the remaining even power of the cosine in terms of the sine with $\cos^2 x = 1 - \sin^2 x$, and substitute $u = \sin x$, $du = \cos x\,dx$.
- If the power $m$ of the sine is odd, save one factor $\sin x$, use $\sin^2 x = 1 - \cos^2 x$, and substitute $u = \cos x$, $du = -\sin x\,dx$.
- If both powers are even, use the half-angle identities, again and again if needed, or the reduction formula of Theorem 11.3.
:::

::: example Odd powers
Find (a) $\displaystyle\int \sin^3 x\,dx$ and (b) $\displaystyle\int \sin^2 x\cos^3 x\,dx$.

**(a)** The power of the sine is odd. Save one $\sin x$: $\sin^3 x = \sin^2 x\cdot\sin x = \big(1 - \cos^2 x\big)\sin x$. With $u = \cos x$ and $du = -\sin x\,dx$,

$$\begin{aligned} \int \sin^3 x\,dx &= -\int \big(1 - u^2\big)\,du \\ &= -u + \frac{u^3}{3} + C \\ &= -\cos x + \tfrac13\cos^3 x + C. \end{aligned}$$

**(b)** The power of the cosine is odd. Save one $\cos x$: $\sin^2 x\cos^3 x = \sin^2 x\big(1 - \sin^2 x\big)\cos x$. With $u = \sin x$ and $du = \cos x\,dx$,

$$\begin{aligned} &\int \sin^2 x\cos^3 x\,dx \\ &\quad= \int \big(u^2 - u^4\big)\,du \\ &\quad= \tfrac13\sin^3 x - \tfrac15\sin^5 x + C. \end{aligned}$$

```check
same(sin(x)**3, (1 - cos(x)**2)*sin(x)); antideriv(-u + u**3/3, -(1 - u**2), u)
antideriv(-cos(x) + cos(x)**3/3, sin(x)**3, x)
same(sin(x)**2*cos(x)**3, sin(x)**2*(1 - sin(x)**2)*cos(x)); antideriv(u**3/3 - u**5/5, u**2 - u**4, u)
antideriv(sin(x)**3/3 - sin(x)**5/5, sin(x)**2*cos(x)**3, x)
```
:::

::: example Even powers
Find (a) $\displaystyle\int \cos^2 x\,dx$ and (b) $\displaystyle\int_0^\pi \sin^4 x\,dx$.

**(a)** By the half-angle identity, and with $\int \cos 2x\,dx = \tfrac12\sin 2x + C$ from Module 10's table,

$$\begin{aligned} \int \cos^2 x\,dx &= \frac12\int (1 + \cos 2x)\,dx \\ &= \frac{x}{2} + \frac{\sin 2x}{4} + C. \end{aligned}$$

**(b)** Square the half-angle identity for $\sin^2 x$, then use the one for $\cos^2$ again, with $2x$ in place of $x$:

$$\begin{aligned} \sin^4 x &= \Big(\frac{1 - \cos 2x}{2}\Big)^2 \\ &= \frac14\big(1 - 2\cos 2x + \cos^2 2x\big) \\ &= \frac14\Big(1 - 2\cos 2x + \frac{1 + \cos 4x}{2}\Big) \\ &= \frac38 - \frac12\cos 2x + \frac18\cos 4x. \end{aligned}$$

So

$$\begin{aligned} &\int_0^\pi \sin^4 x\,dx \\ &\quad= \Big[\frac{3x}{8} - \frac{\sin 2x}{4} + \frac{\sin 4x}{32}\Big]_0^\pi \\ &\quad= \frac{3\pi}{8} \approx 1.178, \end{aligned}$$

since all the sines vanish at 0 and at $\pi$. This is twice the value $\tfrac{3\pi}{16}$ found on $[0, \pi/2]$ in Example 11.7, as it should be: the graph of $\sin^4 x$ is symmetric about $x = \pi/2$, because $\sin(\pi - x) = \sin x$.

```check
antideriv(x/2 + sin(2*x)/4, cos(x)**2, x); antideriv(sin(2*x)/2, cos(2*x), x)
steps(sin(x)**4, ((1 - cos(2*x))/2)**2, (1 - 2*cos(2*x) + cos(2*x)**2)/4, (1 - 2*cos(2*x) + (1 + cos(4*x))/2)/4, Rational(3, 8) - cos(2*x)/2 + cos(4*x)/8)
F4 = 3*x/8 - sin(2*x)/4 + sin(4*x)/32
antideriv(F4, Rational(3, 8) - cos(2*x)/2 + cos(4*x)/8, x)
same(F4.subs(x, pi) - F4.subs(x, 0), 3*pi/8); rounds(3*pi/8, '1.178'); same(3*pi/8, 2*(3*pi/16))
same(sin(pi - x), sin(x)); same(integrate(sin(x)**4, (x, 0, pi)), 3*pi/8)
```
:::

::: pitfall
Three slips. **(1)** $\sin^2 x$ is $(\sin x)^2$, not $\sin(x^2)$. **(2)** The power rule does not apply to $\sin^2 x$ as if $\sin x$ were $x$: $\int \sin^2 x\,dx$ is not $\tfrac13\sin^3 x + C$, whose derivative is $\sin^2 x\cos x$ by the chain rule. **(3)** $\int \cos 2x\,dx = \tfrac12\sin 2x + C$, not $\sin 2x + C$; and $\cos 2x$ is not $2\cos x$.

```check
same(diff(sin(x)**3/3, x), sin(x)**2*cos(x)); holds(Ne(cos(2*1), 2*cos(1)))
antideriv(sin(2*x)/2, cos(2*x), x); same(diff(sin(2*x), x), 2*cos(2*x))
```
:::

### Powers of tangent and secant {#tan-sec}

For tangents and secants the derivatives $(\tan x)' = \sec^2 x$ and $(\sec x)' = \sec x\tan x$ of [Module 5](module_05_EN.html#other-trig) play the parts of $\cos x$ and $\sin x$, and $\sec^2 x = 1 + \tan^2 x$ plays the part of the Pythagorean identity.

::: keyidea
To integrate $\tan^m x\sec^n x$, where $m$ and $n$ are whole numbers:

- If the power $n$ of the secant is even and at least 2, save $\sec^2 x$, write the other secants in terms of the tangent with $\sec^2 x = 1 + \tan^2 x$, and substitute $u = \tan x$, $du = \sec^2 x\,dx$.
- If the power $m$ of the tangent is odd and $n \ge 1$, save $\sec x\tan x$, write the other tangents in terms of the secant with $\tan^2 x = \sec^2 x - 1$, and substitute $u = \sec x$, $du = \sec x\tan x\,dx$.
- Otherwise use identities, the integrals of $\tan x$ ([Example 10.11](module_10_EN.html#substitution)) and $\sec x$ (Theorem 11.4), or parts (Example 11.11).
:::

::: example Tangents and secants
Find (a) $\displaystyle\int \tan^2 x\sec^4 x\,dx$, (b) $\displaystyle\int \tan^3 x\sec x\,dx$ and (c) $\displaystyle\int \tan^2 x\,dx$, on an interval where $\cos x \ne 0$.

**(a)** The power of the secant is even: $\tan^2 x\sec^4 x = \tan^2 x\big(1 + \tan^2 x\big)\sec^2 x$. With $u = \tan x$,

$$\begin{aligned} &\int \big(u^2 + u^4\big)\,du \\ &\quad= \tfrac13\tan^3 x + \tfrac15\tan^5 x + C. \end{aligned}$$

**(b)** The power of the tangent is odd: $\tan^3 x\sec x = \big(\sec^2 x - 1\big)\sec x\tan x$. With $u = \sec x$,

$$\int \big(u^2 - 1\big)\,du = \tfrac13\sec^3 x - \sec x + C.$$

**(c)** There is no secant, but the identity still helps:

$$\begin{aligned} \int \tan^2 x\,dx &= \int \big(\sec^2 x - 1\big)\,dx \\ &= \tan x - x + C. \end{aligned}$$

```check
same(tan(x)**2*sec(x)**4, tan(x)**2*(1 + tan(x)**2)*sec(x)**2); antideriv(u**3/3 + u**5/5, u**2 + u**4, u)
antideriv(tan(x)**3/3 + tan(x)**5/5, tan(x)**2*sec(x)**4, x)
same(tan(x)**3*sec(x), (sec(x)**2 - 1)*sec(x)*tan(x)); antideriv(u**3/3 - u, u**2 - 1, u)
antideriv(sec(x)**3/3 - sec(x), tan(x)**3*sec(x), x)
same(tan(x)**2, sec(x)**2 - 1); antideriv(tan(x) - x, tan(x)**2, x)
```
:::

The integral of $\sec x$ itself needs a trick.

::: theorem The integral of the secant
On every interval on which $\cos x \ne 0$,

$$\int \sec x\,dx = \ln\abs{\sec x + \tan x} + C.$$
:::

::: proof
Where $\cos x \ne 0$, $\sec x + \tan x = \dfrac{1 + \sin x}{\cos x}$ is never 0: $1 + \sin x = 0$ would mean $\sin x = -1$, and then $\cos x = 0$. So $\ln\abs{\sec x + \tan x}$ is differentiable there, and by the chain rule, with $\dfrac{d}{dx}\ln\abs{w} = \dfrac{w'}{w}$ ([Module 6](module_06_EN.html#derivative-ln)),

$$\begin{aligned} &\frac{d}{dx}\ln\abs{\sec x + \tan x} \\ &\quad= \frac{\sec x\tan x + \sec^2 x}{\sec x + \tan x} \\ &\quad= \frac{\sec x(\tan x + \sec x)}{\sec x + \tan x} = \sec x. \end{aligned}$$
:::

```check
same(sec(x) + tan(x), (1 + sin(x))/cos(x)); same(cos(x)**2, 1 - sin(x)**2); same((1 - sin(x)**2).subs(sin(x), -1), 0)   # sin x = -1 forces cos x = 0
nZ = symbols('n', integer=True); same(sin(2*nZ*pi - pi/2), -1); same(cos(2*nZ*pi - pi/2), 0)
antideriv(log(sec(x) + tan(x)), sec(x), x); antideriv(log(-(sec(x) + tan(x))), sec(x), x)    # where sec + tan > 0, and where it is < 0
steps(diff(sec(x) + tan(x), x)/(sec(x) + tan(x)), (sec(x)*tan(x) + sec(x)**2)/(sec(x) + tan(x)), sec(x))
```

The proof checks the formula; it does not show how anyone could find it. Here is one way, with a trick: multiply the integrand by 1, in the form $\dfrac{\sec x + \tan x}{\sec x + \tan x}$. Then

$$\int \sec x\,dx = \int \frac{\sec^2 x + \sec x\tan x}{\sec x + \tan x}\,dx,$$

and the numerator is the derivative of the denominator, so the substitution $w = \sec x + \tan x$ gives $\int \dfrac{dw}{w} = \ln\abs{w} + C$. Tricks like this one come from experience, which is one reason to check every antiderivative by differentiating it.

```check
same(sec(x)*(sec(x) + tan(x))/(sec(x) + tan(x)), (sec(x)**2 + sec(x)*tan(x))/(sec(x) + tan(x)))
same(diff(sec(x) + tan(x), x), sec(x)**2 + sec(x)*tan(x))
```

::: example The secant cubed
Find $\displaystyle\int \sec^3 x\,dx$ on an interval where $\cos x \ne 0$.

The power of the secant is odd and there is no tangent, so neither substitution applies. Integrate by parts with $u = \sec x$ and $dv = \sec^2 x\,dx$, so $du = \sec x\tan x\,dx$ and $v = \tan x$:

$$\begin{aligned} &\int \sec^3 x\,dx \\ &\quad= \sec x\tan x - \int \sec x\tan^2 x\,dx \\ &\quad= \sec x\tan x \\ &\qquad - \int \sec x\big(\sec^2 x - 1\big)\,dx \\ &\quad= \sec x\tan x - \int \sec^3 x\,dx \\ &\qquad + \int \sec x\,dx. \end{aligned}$$

The integral has come back, as in Example 11.6. Solve for it, and use Theorem 11.4:

$$\begin{aligned} &\int \sec^3 x\,dx \\ &\quad= \tfrac12\sec x\tan x \\ &\qquad + \tfrac12\ln\abs{\sec x + \tan x} + C. \end{aligned}$$

```check
same(diff(sec(x), x), sec(x)*tan(x)); antideriv(tan(x), sec(x)**2, x)
steps(Integral(sec(x)**3, x), sec(x)*tan(x) - Integral(sec(x)*tan(x)**2, x), sec(x)*tan(x) - Integral(sec(x)*(sec(x)**2 - 1), x),
      sec(x)*tan(x) - Integral(sec(x)**3, x) + Integral(sec(x), x))
antideriv(sec(x)*tan(x)/2 + log(sec(x) + tan(x))/2, sec(x)**3, x); antideriv(sec(x)*tan(x)/2 + log(-sec(x) - tan(x))/2, sec(x)**3, x)
```
:::

## Trigonometric substitution {#trig-substitution}

The area of a disc of radius $r$ is $\pi r^2$, and Module 9 used that formula to evaluate integrals such as $\int_0^3 \sqrt{9 - x^2}\,dx$ ([Section 9.6](module_09_EN.html#geometry)). Now integration can prove the formula. The upper half of the circle $x^2 + y^2 = r^2$ is the graph of $y = \sqrt{r^2 - x^2}$, but no substitution $u = g(x)$ of Module 10 helps with this integrand: there is no factor $g'(x)$ to go with $dx$. Instead, go the other way, and replace $x$ by a function of a new variable. Since $1 - \sin^2\theta = \cos^2\theta$, the substitution $x = r\sin\theta$ turns $\sqrt{r^2 - x^2}$ into $\sqrt{r^2\cos^2\theta}$, a square root that goes away.

The substitution rule of Module 10 justifies this, read from right to left.

::: theorem Substitution in reverse
Let $g$ have a continuous derivative on an interval $J$.

- (a) If $f$ is continuous on an interval that contains every value of $g$ on $J$, then for all $\alpha$ and $\beta$ in $J$
  $$\begin{aligned} &\int_{g(\alpha)}^{g(\beta)} f(x)\,dx \\ &\quad= \int_\alpha^\beta f\big(g(\theta)\big)\,g'(\theta)\,d\theta. \end{aligned}$$
- (b) Suppose that $J$ is open, that $g$ is one-to-one on $J$, that $f$ is continuous on the interval $I$ of the values of $g$ on $J$, and that $G$ is an antiderivative of $f\big(g(\theta)\big)\,g'(\theta)$ on $J$. Then $G\big(g^{-1}(x)\big)$ is an antiderivative of $f$ on $I$.
:::

::: proof
(a) is the substitution rule for definite integrals ([Theorem 10.7](module_10_EN.html#definite-substitution)), with $x = g(\theta)$, read from right to left. For (b): $I$ is an open interval, because $g$ is continuous and one-to-one on the open interval $J$. By Part 1 of the Fundamental Theorem, $f$ has an antiderivative $F$ on $I$, and by the substitution rule ([Theorem 10.6](module_10_EN.html#substitution)), $F\big(g(\theta)\big)$ is an antiderivative of $f\big(g(\theta)\big)\,g'(\theta)$ on $J$. So $G(\theta) = F\big(g(\theta)\big) + C_0$ for a constant $C_0$ ([Theorem 10.1](module_10_EN.html#antiderivatives)). For $x$ in $I$, put $\theta = g^{-1}(x)$: then $G\big(g^{-1}(x)\big) = F(x) + C_0$, which is an antiderivative of $f$.
:::

```check
Fq, gq = Function('F'), Function('g')
same(diff(Fq(gq(theta)), theta), Subs(Derivative(Fq(u), u), u, gq(theta))*Derivative(gq(theta), theta))   # the chain rule behind (b)
same(integrate(sqrt(1 - x**2), (x, 0, 1)), integrate(cos(theta)*cos(theta), (theta, 0, pi/2)))   # (a), an instance: x = sin(theta)
near(N(Integral(sqrt(1 - x**2), (x, 0, 1)), 30), N(pi/4, 30), 1e-20); same(integrate(cos(theta)**2, (theta, 0, pi/2)), pi/4)
```

Three substitutions cover the three square roots of the form $\sqrt{\pm x^2 \pm a^2}$ that can be real. In each row $a > 0$:

| Integrand contains | Substitute | Identity used |
|---|---|---|
| $\sqrt{a^2 - x^2}$ | $x = a\sin\theta$, $-\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}$ | $1 - \sin^2\theta = \cos^2\theta$ |
| $\sqrt{a^2 + x^2}$ | $x = a\tan\theta$, $-\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}$ | $1 + \tan^2\theta = \sec^2\theta$ |
| $\sqrt{x^2 - a^2}$ | $x = a\sec\theta$, $0 \le \theta < \tfrac{\pi}{2}$ | $\sec^2\theta - 1 = \tan^2\theta$ |

The ranges of $\theta$ do two jobs. On them $\cos\theta \ge 0$, $\sec\theta > 0$ and $\tan\theta \ge 0$ respectively, so the square roots are $\sqrt{a^2 - x^2} = a\cos\theta$, $\sqrt{a^2 + x^2} = a\sec\theta$ and $\sqrt{x^2 - a^2} = a\tan\theta$, with no absolute value signs. And on them each substitution is one-to-one, so $\theta$ can be recovered from $x$: $\theta = \arcsin\dfrac{x}{a}$, $\theta = \arctan\dfrac{x}{a}$ and, for $x \ge a$, $\theta = \arccos\dfrac{a}{x}$ (since $\sec\theta = x/a$ means $\cos\theta = a/x$).

```check
ap = symbols('a', positive=True)
same(ap**2 - (ap*sin(theta))**2, (ap*cos(theta))**2); same(ap**2 + (ap*tan(theta))**2, (ap*sec(theta))**2); same((ap*sec(theta))**2 - ap**2, (ap*tan(theta))**2)
for th_ in (-pi/2, -1, 0, Rational(1, 2), pi/2):
    holds(cos(th_) >= 0); same(sqrt(9 - (3*sin(th_))**2), 3*cos(th_)); same(asin(3*sin(th_)/3), th_)
for th_ in (Rational(-3, 2), -1, 0, 1, Rational(3, 2)):
    holds(sec(th_) > 0); near(sqrt(4 + (2*tan(th_))**2), 2*sec(th_), 1e-20); same(atan(2*tan(th_)/2), th_)
for th_ in (0, Rational(1, 2), 1, Rational(3, 2)):
    holds(tan(th_) >= 0); same(sqrt((2*sec(th_))**2 - 4), 2*tan(th_)); same(acos(2/(2*sec(th_))), th_)
```

::: example The area of a circle and of an ellipse
Find the area enclosed by the circle $x^2 + y^2 = r^2$, and by the ellipse $\dfrac{x^2}{a^2} + \dfrac{y^2}{b^2} = 1$, where $r$, $a$ and $b$ are positive.

**The circle.** The disc lies between the lower half $y = -\sqrt{r^2 - x^2}$ and the upper half $y = \sqrt{r^2 - x^2}$, for $-r \le x \le r$, so its area is $\int_{-r}^{r} 2\sqrt{r^2 - x^2}\,dx$. Substitute $x = r\sin\theta$ with $-\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}$. Then $dx = r\cos\theta\,d\theta$, and $\sqrt{r^2 - r^2\sin^2\theta} = \sqrt{r^2\cos^2\theta} = r\cos\theta$, because $\cos\theta \ge 0$ on this range. The limits $x = -r$ and $x = r$ correspond to $\theta = -\tfrac{\pi}{2}$ and $\theta = \tfrac{\pi}{2}$. By Theorem 11.5(a) and Example 11.9(a),

$$\begin{aligned} &\int_{-r}^{r} 2\sqrt{r^2 - x^2}\,dx \\ &\quad= \int_{-\pi/2}^{\pi/2} 2r\cos\theta\cdot r\cos\theta\,d\theta \\ &\quad= 2r^2\int_{-\pi/2}^{\pi/2} \cos^2\theta\,d\theta \\ &\quad= 2r^2\Big[\frac{\theta}{2} + \frac{\sin 2\theta}{4}\Big]_{-\pi/2}^{\pi/2} \\ &\quad= 2r^2\cdot\frac{\pi}{2} = \pi r^2. \end{aligned}$$

**The ellipse.** Solving its equation for $y$, the ellipse is the region between $y = -\tfrac{b}{a}\sqrt{a^2 - x^2}$ and $y = \tfrac{b}{a}\sqrt{a^2 - x^2}$, for $-a \le x \le a$. Its area is $\tfrac{b}{a}$ times that of the disc of radius $a$:

$$\frac{b}{a}\int_{-a}^{a} 2\sqrt{a^2 - x^2}\,dx = \frac{b}{a}\cdot\pi a^2 = \pi ab.$$

For $a = b = r$ the ellipse is the circle, and $\pi ab = \pi r^2$, as it should be.

```check
rp = symbols('r', positive=True); bp = symbols('b', positive=True)
same(diff(rp*sin(theta), theta), rp*cos(theta)); same(rp**2 - rp**2*sin(theta)**2, rp**2*cos(theta)**2)
same(rp*sin(-pi/2), -rp); same(rp*sin(pi/2), rp)
steps(Integral(2*sqrt(rp**2 - x**2), (x, -rp, rp)), Integral(2*rp*cos(theta)*rp*cos(theta), (theta, -pi/2, pi/2)), 2*rp**2*Integral(cos(theta)**2, (theta, -pi/2, pi/2)))
Fc = theta/2 + sin(2*theta)/4; antideriv(Fc, cos(theta)**2, theta)
same(2*rp**2*(Fc.subs(theta, pi/2) - Fc.subs(theta, -pi/2)), pi*rp**2); same(Fc.subs(theta, pi/2) - Fc.subs(theta, -pi/2), pi/2)
same_set(solve(Eq(x**2/ap**2 + y**2/bp**2, 1), y), [bp/ap*sqrt(ap**2 - x**2), -bp/ap*sqrt(ap**2 - x**2)])
steps(bp/ap*Integral(2*sqrt(ap**2 - x**2), (x, -ap, ap)), bp/ap*pi*ap**2, pi*ap*bp)
same((pi*ap*bp).subs({ap: rp, bp: rp}), pi*rp**2)
near(N(Integral(2*sqrt(4 - x**2), (x, -2, 2)), 30), N(4*pi, 30), 1e-20)                  # independent numerical value, r = 2
near(N(Rational(3, 2)*Integral(2*sqrt(4 - x**2), (x, -2, 2)), 30), N(pi*2*3, 30), 1e-20)   # a = 2, b = 3
```
:::

### Back to x with a triangle {#triangle}

In an indefinite integral the answer comes out in terms of $\theta$ and must be written in terms of $x$ again. A right triangle does it. Draw one with an angle $\theta$ whose sides make the substitution true; Pythagoras' theorem gives the third side, and the other trigonometric functions of $\theta$ can be read off (Figure 11.2).

::: figure id=fig-11-2
The reference triangles of the three substitutions. Left: $x = a\sin\theta$ means $\sin\theta = x/a$, opposite side over hypotenuse; the third side is $\sqrt{a^2 - x^2}$, so, for example, $\cos\theta = \sqrt{a^2 - x^2}/a$ and $\cot\theta = \sqrt{a^2 - x^2}/x$. Middle: $x = a\tan\theta$, with hypotenuse $\sqrt{a^2 + x^2}$. Right: $x = a\sec\theta$, that is, $\cos\theta = a/x$, with opposite side $\sqrt{x^2 - a^2}$. The triangles show $0 < \theta < \pi/2$; the formulas read from them hold on the whole ranges in the table.
:::

::: example Back to x
Find $\displaystyle\int \frac{\sqrt{9 - x^2}}{x^2}\,dx$ for $0 < x < 3$.

Substitute $x = 3\sin\theta$ with $0 < \theta < \tfrac{\pi}{2}$, one-to-one onto $(0, 3)$. Then $dx = 3\cos\theta\,d\theta$ and $\sqrt{9 - x^2} = 3\cos\theta$, so

$$\begin{aligned} &\int \frac{\sqrt{9 - x^2}}{x^2}\,dx \\ &\quad= \int \frac{3\cos\theta}{9\sin^2\theta}\,3\cos\theta\,d\theta \\ &\quad= \int \cot^2\theta\,d\theta \\ &\quad= \int \big(\csc^2\theta - 1\big)\,d\theta \\ &\quad= -\cot\theta - \theta + C, \end{aligned}$$

where $\cot^2\theta = \csc^2\theta - 1$ comes from dividing $\cos^2\theta + \sin^2\theta = 1$ by $\sin^2\theta$, and $-\cot\theta$ is an antiderivative of $\csc^2\theta$ (Module 10's table). Now back to $x$, with the left triangle of Figure 11.2 and $a = 3$: $\cot\theta = \dfrac{\sqrt{9 - x^2}}{x}$ and $\theta = \arcsin\dfrac{x}{3}$. By Theorem 11.5(b),

$$\begin{aligned} &\int \frac{\sqrt{9 - x^2}}{x^2}\,dx \\ &\quad= -\frac{\sqrt{9 - x^2}}{x} - \arcsin\frac{x}{3} + C. \end{aligned}$$

The same steps, with $-\tfrac{\pi}{2} < \theta < 0$, give the same formula on $(-3, 0)$. Check by differentiating: the derivative of $-\sqrt{9 - x^2}/x$ is $\dfrac{9}{x^2\sqrt{9 - x^2}}$ (quotient rule, then a common denominator), that of $-\arcsin\dfrac{x}{3}$ is $-\dfrac{1}{\sqrt{9 - x^2}}$, and their sum is $\dfrac{9 - x^2}{x^2\sqrt{9 - x^2}} = \dfrac{\sqrt{9 - x^2}}{x^2}$.

```check
same(diff(3*sin(theta), theta), 3*cos(theta)); same(9 - (3*sin(theta))**2, (3*cos(theta))**2)
same(3*cos(theta)/(9*sin(theta)**2)*3*cos(theta), cot(theta)**2); same(cot(theta)**2, csc(theta)**2 - 1)
antideriv(-cot(theta) - theta, csc(theta)**2 - 1, theta); antideriv(-cot(theta), csc(theta)**2, theta)
x3 = symbols('x', positive=True)
same(cot(asin(x3/3)), sqrt(9 - x3**2)/x3)
Fb = -sqrt(9 - x**2)/x - asin(x/3)
antideriv(Fb, sqrt(9 - x**2)/x**2, x)
same(diff(-sqrt(9 - x**2)/x, x), 9/(x**2*sqrt(9 - x**2))); same(diff(-asin(x/3), x), -1/sqrt(9 - x**2))
same(9/(x**2*sqrt(9 - x**2)) - 1/sqrt(9 - x**2), (9 - x**2)/(x**2*sqrt(9 - x**2))); same((9 - x**2)/(x**2*sqrt(9 - x**2)), sqrt(9 - x**2)/x**2)
```
:::

::: example Tangent and secant substitutions
Find (a) $\displaystyle\int \frac{dx}{\sqrt{x^2 + 4}}$ and (b) $\displaystyle\int \frac{\sqrt{x^2 - 4}}{x}\,dx$ for $x > 2$.

**(a)** Substitute $x = 2\tan\theta$ with $-\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}$. Then $dx = 2\sec^2\theta\,d\theta$ and $\sqrt{x^2 + 4} = \sqrt{4\tan^2\theta + 4} = 2\sec\theta$, so, by Theorem 11.4,

$$\begin{aligned} \int \frac{dx}{\sqrt{x^2 + 4}} &= \int \frac{2\sec^2\theta}{2\sec\theta}\,d\theta \\ &= \int \sec\theta\,d\theta \\ &= \ln\abs{\sec\theta + \tan\theta} + C_1. \end{aligned}$$

The middle triangle of Figure 11.2, with $a = 2$, gives $\tan\theta = \dfrac{x}{2}$ and $\sec\theta = \dfrac{\sqrt{x^2 + 4}}{2}$. So the integral is

$$\begin{aligned} &\ln\Big|\frac{x + \sqrt{x^2 + 4}}{2}\Big| + C_1 \\ &\quad= \ln\big(x + \sqrt{x^2 + 4}\big) + C, \end{aligned}$$

where $C = C_1 - \ln 2$, and the absolute value bars can go because $x + \sqrt{x^2 + 4} > x + \abs{x} \ge 0$. In the same way, for every constant $a \ne 0$,

$$\begin{aligned} &\int \frac{dx}{\sqrt{x^2 + a^2}} \\ &\quad= \ln\big(x + \sqrt{x^2 + a^2}\big) + C. \end{aligned}$$

For $a = 1$ this antiderivative is the inverse hyperbolic sine, $\operatorname{arsinh} x$, of [Exercise 6.10](module_06_EN.html#ex-6-10).

**(b)** Substitute $x = 2\sec\theta$ with $0 < \theta < \tfrac{\pi}{2}$, one-to-one onto $(2, \infty)$. Then $dx = 2\sec\theta\tan\theta\,d\theta$ and $\sqrt{x^2 - 4} = 2\tan\theta$, so, with Example 11.10(c),

$$\begin{aligned} &\int \frac{\sqrt{x^2 - 4}}{x}\,dx \\ &\quad= \int \frac{2\tan\theta}{2\sec\theta}\,2\sec\theta\tan\theta\,d\theta \\ &\quad= 2\int \tan^2\theta\,d\theta \\ &\quad= 2\tan\theta - 2\theta + C. \end{aligned}$$

The right triangle of Figure 11.2 gives $\tan\theta = \dfrac{\sqrt{x^2 - 4}}{2}$, and $\cos\theta = \dfrac{2}{x}$ gives $\theta = \arccos\dfrac{2}{x}$. So, for $x > 2$,

$$\begin{aligned} &\int \frac{\sqrt{x^2 - 4}}{x}\,dx \\ &\quad= \sqrt{x^2 - 4} - 2\arccos\frac{2}{x} + C. \end{aligned}$$

```check
same(diff(2*tan(theta), theta), 2*sec(theta)**2); same(4*tan(theta)**2 + 4, (2*sec(theta))**2)
same(2*sec(theta)**2/(2*sec(theta)), sec(theta))
same(tan(atan(x/2)), x/2); same(sec(atan(x/2)), sqrt(x**2 + 4)/2)
xr = symbols('x', real=True)
same(log((xr + sqrt(xr**2 + 4))/2), log(xr + sqrt(xr**2 + 4)) - log(2))
same((sqrt(xr**2 + 4))**2 - Abs(xr)**2, 4); holds(all(v_ + sqrt(v_**2 + 4) > 0 for v_ in (-50, -3, -1, 0, 2)))
antideriv(log(x + sqrt(x**2 + 4)), 1/sqrt(x**2 + 4), x)
anz = symbols('a', real=True, nonzero=True); antideriv(log(x + sqrt(x**2 + anz**2)), 1/sqrt(x**2 + anz**2), x)
same(asinh(xr).rewrite(log), log(xr + sqrt(xr**2 + 1)))
same(diff(2*sec(theta), theta), 2*sec(theta)*tan(theta)); same((2*sec(theta))**2 - 4, (2*tan(theta))**2)
same(2*tan(theta)/(2*sec(theta))*2*sec(theta)*tan(theta), 2*tan(theta)**2); antideriv(2*tan(theta) - 2*theta, 2*tan(theta)**2, theta)
xg = symbols('x', positive=True)
same(tan(acos(2/(xg + 2))), sqrt((xg + 2)**2 - 4)/2)          # x = x_g + 2 > 2
Fsec = sqrt(x**2 - 4) - 2*acos(2/x)
same(diff(Fsec, x), x/sqrt(x**2 - 4) - 4/(x**2*sqrt(1 - 4/x**2)))
same((x**2*sqrt(1 - 4/x**2)).subs(x, xg + 2), (x*sqrt(x**2 - 4)).subs(x, xg + 2))      # for x > 2: x^2 sqrt(1 - 4/x^2) = x sqrt(x^2 - 4)
same(x/sqrt(x**2 - 4) - 4/(x*sqrt(x**2 - 4)), sqrt(x**2 - 4)/x)
antideriv(Fsec.subs(x, xg + 2), (sqrt(x**2 - 4)/x).subs(x, xg + 2), xg)
same((sqrt(x**2 - 4) - 2*acos(2/x)).diff(x).subs(x, 5), sqrt(21)/5)
```
:::

::: pitfall
Four slips with trigonometric substitution. **(1)** Forgetting that $dx$ changes too: with $x = a\sin\theta$, $dx = a\cos\theta\,d\theta$, not $d\theta$. **(2)** $\sqrt{\cos^2\theta} = \abs{\cos\theta}$; it is $\cos\theta$ only because the range of $\theta$ keeps $\cos\theta \ge 0$. **(3)** In a definite integral, change the limits to values of $\theta$, as in Example 11.12, or return to $x$ before using the old limits. **(4)** A quadratic with a term in $x$ needs completing the square first: $\sqrt{5 - 4x - x^2} = \sqrt{9 - (x + 2)^2}$, and then $x + 2 = 3\sin\theta$.

```check
same(9 - (x + 2)**2, 5 - 4*x - x**2); same(sqrt(cos(2*pi/3)**2), Abs(cos(2*pi/3))); holds(cos(2*pi/3) < 0)
```
:::

## Partial fractions {#partial-fractions}

Adding fractions is school algebra:

$$\begin{aligned} \frac{2}{x - 2} + \frac{3}{x + 1} &= \frac{2(x + 1) + 3(x - 2)}{(x - 2)(x + 1)} \\ &= \frac{5x - 4}{x^2 - x - 2}. \end{aligned}$$

The left side is easy to integrate, to $2\ln\abs{x - 2} + 3\ln\abs{x + 1} + C$. So the right side is easy to integrate too, once you can run the addition backwards. Writing a rational function as a sum of simpler fractions of this kind is called decomposing it into **partial fractions**, and it works for every rational function.

```check
steps(2/(x - 2) + 3/(x + 1), (2*(x + 1) + 3*(x - 2))/((x - 2)*(x + 1)), (5*x - 4)/(x**2 - x - 2))
antideriv(2*log(x - 2) + 3*log(x + 1), 2/(x - 2) + 3/(x + 1), x)
```

::: definition Proper and improper rational functions
A rational function $\dfrac{P(x)}{Q(x)}$ ([Module 1](module_01_EN.html#rational)) is **proper** if the degree of the polynomial $P$ is less than the degree of $Q$, and **improper** otherwise.
:::

Long division of polynomials turns an improper rational function into a polynomial plus a proper one: dividing $P$ by $Q$ gives a quotient $S$ and a remainder $R$, polynomials with $P = SQ + R$ and $\deg R < \deg Q$, so that

$$\frac{P(x)}{Q(x)} = S(x) + \frac{R(x)}{Q(x)}.$$

The polynomial $S$ is integrated term by term; partial fractions are for the proper part.

### Distinct linear factors {#linear-factors}

Start with a denominator that is a product of different linear factors, such as $x^2 - x - 2 = (x - 2)(x + 1)$, and suppose you did not know the answer above. Look for constants $A$ and $B$ with

$$\frac{5x - 4}{(x - 2)(x + 1)} = \frac{A}{x - 2} + \frac{B}{x + 1}.$$

Multiply both sides by $(x - 2)(x + 1)$:

$$5x - 4 = A(x + 1) + B(x - 2).$$

This must hold for every $x$ except 2 and $-1$, and so for every $x$, since both sides are straight lines and two lines that share more than one point are the same line. Put $x = 2$: $6 = 3A$, so $A = 2$. Put $x = -1$: $-9 = -3B$, so $B = 3$. (Comparing coefficients works too: $A + B = 5$ and $A - 2B = -4$.)

There is a shortcut. To find $A$, the coefficient of $\dfrac{1}{x - 2}$, cover up the factor $x - 2$ in the denominator of the left side and put $x = 2$ in what is left: $\dfrac{5\cdot 2 - 4}{2 + 1} = 2$. For $B$, cover up $x + 1$ and put $x = -1$: $\dfrac{5(-1) - 4}{-1 - 2} = 3$. This is the **cover-up method**. It works because multiplying the decomposition by $x - 2$ gives

$$\frac{5x - 4}{x + 1} = A + B\,\frac{x - 2}{x + 1}$$

for $x$ near 2; as $x \to 2$, the left side tends to its value at 2 and the last term tends to 0, which leaves $A$.

```check
same(solve([Eq(6, 3*a), Eq(-9, -3*b)], [a, b]), {a: 2, b: 3}); same(solve([a + b - 5, a - 2*b + 4], [a, b]), {a: 2, b: 3})
same(expand(2*(x + 1) + 3*(x - 2)), 5*x - 4)
same(((5*x - 4)/(x + 1)).subs(x, 2), 2); same(((5*x - 4)/(x - 2)).subs(x, -1), 3)
same(expand((x - 2)*(2/(x - 2) + 3/(x + 1))), expand(2 + 3*(x - 2)/(x + 1))); limit_is(3*(x - 2)/(x + 1), x, 2, 0)
```

::: keyidea
**The cover-up method.** If $x - r$ is a factor of the denominator $Q(x)$ that appears only once, the coefficient of $\dfrac{1}{x - r}$ in the decomposition of $\dfrac{P(x)}{Q(x)}$ is the value at $x = r$ of the fraction with the factor $x - r$ covered up.
:::

::: example Two logarithms
Find (a) $\displaystyle\int \frac{5x - 4}{x^2 - x - 2}\,dx$ and (b) $\displaystyle\int \frac{dx}{x^2 - a^2}$, where $a \ne 0$ is a constant.

**(a)** By the decomposition above, on each interval that avoids 2 and $-1$,

$$\begin{aligned} &\int \frac{5x - 4}{x^2 - x - 2}\,dx \\ &\quad= 2\ln\abs{x - 2} + 3\ln\abs{x + 1} + C. \end{aligned}$$

**(b)** $x^2 - a^2 = (x - a)(x + a)$, two different factors since $a \ne 0$. Cover up $x - a$ and put $x = a$: the coefficient of $\dfrac{1}{x - a}$ is $\dfrac{1}{a + a} = \dfrac{1}{2a}$. Cover up $x + a$ and put $x = -a$: the coefficient of $\dfrac{1}{x + a}$ is $\dfrac{1}{-a - a} = -\dfrac{1}{2a}$. So

$$\frac{1}{x^2 - a^2} = \frac{1}{2a}\Big(\frac{1}{x - a} - \frac{1}{x + a}\Big),$$

and, for $x \ne \pm a$,

$$\begin{aligned} &\int \frac{dx}{x^2 - a^2} \\ &\quad= \frac{1}{2a}\big(\ln\abs{x - a} - \ln\abs{x + a}\big) + C \\ &\quad= \frac{1}{2a}\ln\Big|\frac{x - a}{x + a}\Big| + C. \end{aligned}$$

```check
same(apart((5*x - 4)/(x**2 - x - 2), x), 2/(x - 2) + 3/(x + 1))
antideriv(2*log(x - 2) + 3*log(x + 1), (5*x - 4)/(x**2 - x - 2), x); antideriv(2*log(2 - x) + 3*log(-1 - x), (5*x - 4)/(x**2 - x - 2), x)
anz = symbols('a', real=True, nonzero=True)
same((1/(x + anz)).subs(x, anz), 1/(2*anz)); same((1/(x - anz)).subs(x, -anz), -1/(2*anz))
same(1/(x**2 - anz**2), (1/(2*anz))*(1/(x - anz) - 1/(x + anz)))
antideriv(log((x - anz)/(x + anz))/(2*anz), 1/(x**2 - anz**2), x); antideriv(log(-(x - anz)/(x + anz))/(2*anz), 1/(x**2 - anz**2), x)
```
:::

The method works whenever the denominator is a product of different linear factors.

::: theorem Partial fractions with distinct linear factors
Let $Q(x) = (x - r_1)(x - r_2)\cdots(x - r_n)$, where the numbers $r_1, \dots, r_n$ are all different, and let $P$ be a polynomial of degree less than $n$. Then there are unique constants $A_1, \dots, A_n$ with

$$\begin{aligned} \frac{P(x)}{Q(x)} &= \frac{A_1}{x - r_1} + \frac{A_2}{x - r_2} \\ &\quad + \dots + \frac{A_n}{x - r_n} \end{aligned}$$

for every $x$ other than $r_1, \dots, r_n$. Each $A_k$ is given by the cover-up method:

$$\begin{aligned} A_k &= \frac{P(r_k)}{Q_k(r_k)}, \quad\text{where} \\ Q_k(x) &= \frac{Q(x)}{x - r_k}. \end{aligned}$$
:::

::: proof
*Existence.* $Q_k$ is the product of the $n - 1$ factors other than $x - r_k$, a polynomial of degree $n - 1$, and $Q_k(r_k) \ne 0$ because the numbers $r_j$ are all different. Define $A_k$ by the formula, and consider the polynomial

$$\begin{aligned} D(x) &= P(x) - A_1Q_1(x) - A_2Q_2(x) \\ &\quad - \dots - A_nQ_n(x). \end{aligned}$$

Its degree is less than $n$. At $x = r_k$, every $Q_j$ with $j \ne k$ contains the factor $x - r_k$ and so vanishes, and $D(r_k) = P(r_k) - A_kQ_k(r_k) = 0$ by the choice of $A_k$. So $D$ has the $n$ different zeros $r_1, \dots, r_n$. But a polynomial of degree less than $n$ that is not the zero polynomial has fewer than $n$ zeros (by school algebra, each zero $r$ gives a factor $x - r$, and $n$ such factors would make the degree at least $n$). So $D$ is the zero polynomial: $P = A_1Q_1 + \dots + A_nQ_n$. Divide by $Q$, using $\dfrac{Q_k(x)}{Q(x)} = \dfrac{1}{x - r_k}$.

*Uniqueness.* Suppose the constants $A_k$ satisfy the equation. Multiply it by $x - r_k$: for $x$ near $r_k$, $x \ne r_k$,

$$\frac{P(x)}{Q_k(x)} = A_k + (x - r_k)\sum_{j \ne k} \frac{A_j}{x - r_j}.$$

Let $x \to r_k$. Both sides are continuous at $r_k$, and the right side tends to $A_k$, so $A_k = P(r_k)/Q_k(r_k)$: the constants can only be those of the formula.
:::

```check
r1, r2, r3, p0, p1, p2 = symbols('r1 r2 r3 p0 p1 p2')
Pq = p2*x**2 + p1*x + p0; Qq = (x - r1)*(x - r2)*(x - r3)
Ak = [Pq.subs(x, rk)/(Qq/(x - rk)).cancel().subs(x, rk) for rk in (r1, r2, r3)]
same(cancel(Pq/Qq - sum(A_/(x - rk) for A_, rk in zip(Ak, (r1, r2, r3)))), 0)       # the decomposition, for every P of degree < 3
same((Qq/(x - r1)).cancel(), (x - r2)*(x - r3)); same(((x - r2)*(x - r3)).subs(x, r2), 0)
same(apart((x**2 + 1)/((x - 1)*(x - 2)*(x - 3)), x), Rational(1, 1)/(x - 1) - 5/(x - 2) + 5/(x - 3))   # an instance: 2/2, 5/(-1), 10/2
```

::: example Long division first
Find $\displaystyle\int \frac{x^3 + 2x^2 + 2x - 2}{x^2 + x - 2}\,dx$.

The fraction is improper, degree 3 over degree 2, so divide first. $x^3$ divided by $x^2$ is $x$; subtract $x\big(x^2 + x - 2\big) = x^3 + x^2 - 2x$ from the numerator, which leaves $x^2 + 4x - 2$. Then $x^2$ divided by $x^2$ is 1; subtract $x^2 + x - 2$, which leaves $3x$. The remainder $3x$ has degree less than 2, so stop: the quotient is $x + 1$ and the remainder $3x$,

$$\begin{aligned} &\frac{x^3 + 2x^2 + 2x - 2}{x^2 + x - 2} \\ &\quad= x + 1 + \frac{3x}{x^2 + x - 2}. \end{aligned}$$

Now $x^2 + x - 2 = (x - 1)(x + 2)$, and the cover-up method gives the coefficients $\dfrac{3\cdot 1}{1 + 2} = 1$ and $\dfrac{3(-2)}{-2 - 1} = 2$:

$$\frac{3x}{(x - 1)(x + 2)} = \frac{1}{x - 1} + \frac{2}{x + 2}.$$

So

$$\begin{aligned} &\int \frac{x^3 + 2x^2 + 2x - 2}{x^2 + x - 2}\,dx \\ &\quad= \frac{x^2}{2} + x + \ln\abs{x - 1} \\ &\qquad + 2\ln\abs{x + 2} + C. \end{aligned}$$

```check
Pd, Qd = x**3 + 2*x**2 + 2*x - 2, x**2 + x - 2
same(expand(Pd - x*Qd), x**2 + 4*x - 2); same(expand(x**2 + 4*x - 2 - Qd), 3*x)
same(div(Pd, Qd, x), (x + 1, 3*x)); same(Pd/Qd, x + 1 + 3*x/Qd)
same(factor(Qd), (x - 1)*(x + 2)); same((3*x/(x + 2)).subs(x, 1), 1); same((3*x/(x - 1)).subs(x, -2), 2)
same(apart(3*x/Qd, x), 1/(x - 1) + 2/(x + 2))
antideriv(x**2/2 + x + log(x - 1) + 2*log(x + 2), Pd/Qd, x); antideriv(x**2/2 + x + log(1 - x) + 2*log(-x - 2), Pd/Qd, x)
```
:::

### Repeated and quadratic factors {#repeated-factors}

Two things can complicate a denominator. A factor may be repeated, as in $(x - 1)^2(x + 1)$. And a quadratic factor such as $x^2 + 1$ may have no real zeros, so that it does not split into real linear factors. A quadratic $x^2 + px + q$ with $p^2 < 4q$ (a negative discriminant) is called **irreducible**. A theorem of algebra, which this series uses without proof, says that every polynomial with real coefficients is a product of a constant, linear factors and irreducible quadratic factors. (It follows from the fundamental theorem of algebra.) So the next theorem covers every proper rational function, at least in principle: finding the factors of $Q$ can be the hard part.

::: theorem Partial fraction decomposition
Let $\dfrac{P(x)}{Q(x)}$ be a proper rational function, and let $Q$ be factored into powers of different linear factors $x - r$ and of different irreducible quadratic factors $x^2 + px + q$. Then $\dfrac{P(x)}{Q(x)}$ is a sum of the following terms, with unique constants:

- for each factor $(x - r)^k$ of $Q$, the $k$ terms $\dfrac{A_1}{x - r} + \dfrac{A_2}{(x - r)^2} + \dots + \dfrac{A_k}{(x - r)^k}$;
- for each factor $\big(x^2 + px + q\big)^m$ of $Q$, the $m$ terms $\dfrac{B_1x + C_1}{x^2 + px + q} + \dots + \dfrac{B_mx + C_m}{\big(x^2 + px + q\big)^m}$.
:::

Theorem 11.6 is the case in which every power is 1 and there are no quadratic factors; the general case is proved in algebra courses, and this series uses it without proof. To find the constants, multiply by $Q(x)$ and compare coefficients, or put convenient values of $x$; the cover-up method still gives the coefficient of the highest power of each linear factor. Each term then integrates with the methods you know: a power of $x - r$ by the power rule or to a logarithm, and a quadratic term by completing the square, a logarithm and an arctangent. (A power $m \ge 2$ of an irreducible quadratic needs a trigonometric substitution as well.)

::: example Repeated and quadratic factors
Find (a) $\displaystyle\int \frac{4x}{(x - 1)^2(x + 1)}\,dx$ and (b) $\displaystyle\int \frac{2x^2 + 4x + 4}{(x + 1)\big(x^2 + 1\big)}\,dx$.

**(a)** By Theorem 11.7, with constants $A$, $B$ and $D$,

$$\begin{aligned} \frac{4x}{(x - 1)^2(x + 1)} &= \frac{A}{x - 1} + \frac{B}{(x - 1)^2} \\ &\quad + \frac{D}{x + 1}. \end{aligned}$$

The cover-up method gives the coefficient of the highest power of $x - 1$, $B = \dfrac{4\cdot 1}{1 + 1} = 2$, and $D = \dfrac{4(-1)}{(-1 - 1)^2} = -1$. For $A$, multiply by the denominator,

$$\begin{aligned} 4x &= A(x - 1)(x + 1) \\ &\quad + B(x + 1) + D(x - 1)^2, \end{aligned}$$

and compare the coefficients of $x^2$: $0 = A + D$, so $A = 1$. Then

$$\begin{aligned} &\int \frac{4x}{(x - 1)^2(x + 1)}\,dx \\ &\quad= \int \Big(\frac{1}{x - 1} + \frac{2}{(x - 1)^2} \\ &\qquad - \frac{1}{x + 1}\Big)\,dx \\ &\quad= \ln\abs{x - 1} - \frac{2}{x - 1} \\ &\qquad - \ln\abs{x + 1} + C. \end{aligned}$$

**(b)** $x^2 + 1$ is irreducible ($0^2 < 4\cdot 1$), so

$$\frac{2x^2 + 4x + 4}{(x + 1)\big(x^2 + 1\big)} = \frac{A}{x + 1} + \frac{Bx + D}{x^2 + 1}.$$

The cover-up method gives $A = \dfrac{2 - 4 + 4}{(-1)^2 + 1} = 1$. Multiply by the denominator: $2x^2 + 4x + 4 = \big(x^2 + 1\big) + (Bx + D)(x + 1)$. Comparing the coefficients of $x^2$ gives $2 = 1 + B$, so $B = 1$, and the constant terms give $4 = 1 + D$, so $D = 3$; the coefficients of $x$ agree, $4 = B + D$. So the integrand is

$$\frac{1}{x + 1} + \frac{x}{x^2 + 1} + \frac{3}{x^2 + 1},$$

and, with the substitution $w = x^2 + 1$ for the middle term,

$$\begin{aligned} &\int \frac{2x^2 + 4x + 4}{(x + 1)\big(x^2 + 1\big)}\,dx \\ &\quad= \ln\abs{x + 1} + \tfrac12\ln\big(x^2 + 1\big) \\ &\qquad + 3\arctan x + C. \end{aligned}$$

```check
Aq, Bq, Dq = symbols('A B D')
same((4*x/(x + 1)).subs(x, 1), 2); same((4*x/(x - 1)**2).subs(x, -1), -1)
same(Poly(expand(Aq*(x - 1)*(x + 1) + 2*(x + 1) - (x - 1)**2), x).coeff_monomial(x**2), Aq - 1); same(solve(Aq - 1, Aq), [1])
same(expand(1*(x - 1)*(x + 1) + 2*(x + 1) - 1*(x - 1)**2), 4*x)
same(apart(4*x/((x - 1)**2*(x + 1)), x), 1/(x - 1) + 2/(x - 1)**2 - 1/(x + 1))
antideriv(log(x - 1) - 2/(x - 1) - log(x + 1), 4*x/((x - 1)**2*(x + 1)), x); antideriv(-2/(x - 1), 2/(x - 1)**2, x)
holds(0**2 < 4*1); same(((2*x**2 + 4*x + 4)/(x**2 + 1)).subs(x, -1), 1)
same(solve(Poly(expand((x**2 + 1) + (Bq*x + Dq)*(x + 1) - (2*x**2 + 4*x + 4)), x).all_coeffs(), [Bq, Dq]), {Bq: 1, Dq: 3})
same(apart((2*x**2 + 4*x + 4)/((x + 1)*(x**2 + 1)), x), 1/(x + 1) + x/(x**2 + 1) + 3/(x**2 + 1))
antideriv(log(x**2 + 1)/2, x/(x**2 + 1), x)
antideriv(log(x + 1) + log(x**2 + 1)/2 + 3*atan(x), (2*x**2 + 4*x + 4)/((x + 1)*(x**2 + 1)), x)
```
:::

::: pitfall
Four slips with partial fractions. **(1)** Not dividing first. $\dfrac{x^3}{x^2 - 1}$ is improper; it is $x + \dfrac{x}{x^2 - 1}$, and only the second part has the form $\dfrac{A}{x - 1} + \dfrac{B}{x + 1}$. **(2)** Leaving out a power of a repeated factor. In Example 11.17(a), the form $\dfrac{B}{(x - 1)^2} + \dfrac{D}{x + 1}$ without $\dfrac{A}{x - 1}$ has no solution: in $4x = B(x + 1) + D(x - 1)^2$, the terms in $x^2$ give $D = 0$, then the terms in $x$ give $B = 4$, and then the constant terms say $0 = B + D = 4$. **(3)** A constant numerator over an irreducible quadratic: it must be $Bx + C$. **(4)** Missing a substitution: $\displaystyle\int \frac{x^2 + 1}{x^3 + 3x}\,dx = \tfrac13\ln\abs{x^3 + 3x} + C$ with $u = x^3 + 3x$, no partial fractions needed.

```check
same(x**3/(x**2 - 1), x + x/(x**2 - 1)); same(apart(x/(x**2 - 1), x), 1/(2*(x - 1)) + 1/(2*(x + 1)))
same(solve(Poly(expand(Bq*(x + 1) + Dq*(x - 1)**2 - 4*x), x).all_coeffs(), [Bq, Dq]), [])
same(Poly(expand(Bq*(x + 1) + Dq*(x - 1)**2 - 4*x), x).all_coeffs(), [Dq, Bq - 2*Dq - 4, Bq + Dq])
same(diff(x**3 + 3*x, x), 3*(x**2 + 1)); antideriv(log(x**3 + 3*x)/3, (x**2 + 1)/(x**3 + 3*x), x)
```
:::

::: compute Partial fractions with SymPy
SymPy's `factor` finds the factors, `div` divides polynomials, and `apart` decomposes a rational function into partial fractions:

```python
import sympy as sp
x = sp.symbols('x')
P = x**3 + 2*x**2 + 2*x - 2
Q = x**2 + x - 2
print(sp.factor(Q))
print(sp.div(P, Q, x))                  # (quotient, remainder)
print(sp.apart(P/Q, x))                 # Example 11.16
print(sp.apart((2*x**2 + 4*x + 4)/((x + 1)*(x**2 + 1)), x))
```

```output
(x - 1)*(x + 2)
(x + 1, 3*x)
x + 1 + 2/(x + 2) + 1/(x - 1)
(x + 3)/(x**2 + 1) + 1/(x + 1)
```

These are Example 11.16, in SymPy's order of terms, and Example 11.17(b) before its last split. SymPy factors over the rational numbers, so a denominator such as $x^2 - 2$, whose zeros $\pm\sqrt2$ are irrational, stays whole unless you say which numbers to allow:

```python
print(sp.apart(1/(x**2 - 2), x))
print(sp.apart(1/(x**2 - 2), x, extension=sp.sqrt(2)))
```

```output
1/(x**2 - 2)
-sqrt(2)/(4*(x + sqrt(2))) + sqrt(2)/(4*(x - sqrt(2)))
```

The second answer is Example 11.15(b) with $a = \sqrt2$, since $\tfrac{1}{2\sqrt2} = \tfrac{\sqrt2}{4}$.
:::

```check
same(Rational(1, 1)/(2*sqrt(2)), sqrt(2)/4)
same(apart(1/(x**2 - 2), x, extension=sqrt(2)), (1/(2*sqrt(2)))*(1/(x - sqrt(2)) - 1/(x + sqrt(2))))
```

## A strategy for integration {#strategy}

Differentiation is mechanical: the rules of Modules 4 to 6 differentiate every formula built from the catalogue of Module 1. Integration is not. No set of rules always works, the same integrand may give way to several methods, and some integrands give way to none (Section 11.6). What you have is a toolbox and a checklist.

::: keyidea
**A strategy for integration.**

1. **Simplify** the integrand if you can: expand, cancel, split a fraction, use an identity such as $\sin x\cos x = \tfrac12\sin 2x$ or $\tan^2 x = \sec^2 x - 1$. Then look in the table of [Section 10.1](module_10_EN.html#table).
2. **Substitute** if the integrand contains a function together with its derivative, perhaps up to a constant factor ([Section 10.7](module_10_EN.html#substitution)).
3. **Classify** the integrand by its form:
   - a product of a power of $x$ with $e^{kx}$, $\sin kx$ or $\cos kx$, or with $\ln x$ or an inverse trigonometric function: by parts (Section 11.1);
   - powers of trigonometric functions: identities and substitutions (Section 11.2);
   - $\sqrt{a^2 - x^2}$, $\sqrt{a^2 + x^2}$ or $\sqrt{x^2 - a^2}$, perhaps after completing the square: a trigonometric substitution (Section 11.3);
   - a rational function: long division if it is improper, then partial fractions (Section 11.4);
   - a root $\sqrt[n]{g(x)}$: try $u = \sqrt[n]{g(x)}$.
4. **Try again**: combine methods (a substitution, then parts), multiply by a clever form of 1 (as for $\sec x$), or relate the integral to one you have done. If nothing works, the integrand may have no elementary antiderivative (Section 11.6): compute the integral numerically (Section 11.7).
:::

::: example Choosing a method
Choose a method for each integral, and evaluate it.

- (a) $\displaystyle\int \frac{x}{x^2 + 4}\,dx$
- (b) $\displaystyle\int e^{\sqrt x}\,dx$, for $x > 0$
- (c) $\displaystyle\int \frac{dx}{x^2 - 4x + 13}$
- (d) $\displaystyle\int \frac{\sqrt x}{1 + x}\,dx$, for $x > 0$

**(a)** A rational function, but step 2 comes first: the numerator is half the derivative of the denominator. With $u = x^2 + 4$, $du = 2x\,dx$:

$$\begin{aligned} \int \frac{x}{x^2 + 4}\,dx &= \frac12\int \frac{du}{u} \\ &= \frac12\ln\big(x^2 + 4\big) + C. \end{aligned}$$

**(b)** A root: let $w = \sqrt x$, so that $x = w^2$ and $dx = 2w\,dw$ (Theorem 11.5(b), with the one-to-one substitution $x = w^2$, $w > 0$). The integral becomes $2\int we^w\,dw$, a product for parts: with $u = w$ and $dv = e^w\,dw$,

$$\begin{aligned} 2\int we^w\,dw &= 2\big(we^w - e^w\big) + C \\ &= 2\big(\sqrt x - 1\big)e^{\sqrt x} + C. \end{aligned}$$

**(c)** A rational function whose denominator has no real zeros, since $(-4)^2 - 4\cdot 13 = -36 < 0$. Complete the square, $x^2 - 4x + 13 = (x - 2)^2 + 9$, and use $\int \frac{du}{u^2 + a^2} = \frac1a\arctan\frac{u}{a} + C$ ([Example 10.11](module_10_EN.html#substitution)) with $u = x - 2$ and $a = 3$:

$$\begin{aligned} &\int \frac{dx}{x^2 - 4x + 13} \\ &\quad= \frac13\arctan\frac{x - 2}{3} + C. \end{aligned}$$

**(d)** A root again: $w = \sqrt x$, $dx = 2w\,dw$, gives $2\int \dfrac{w^2}{1 + w^2}\,dw$, an improper rational function. Divide, or write $w^2 = (1 + w^2) - 1$:

$$\begin{aligned} &2\int \frac{w^2}{1 + w^2}\,dw \\ &\quad= 2\int \Big(1 - \frac{1}{1 + w^2}\Big)\,dw \\ &\quad= 2w - 2\arctan w + C \\ &\quad= 2\sqrt x - 2\arctan\sqrt x + C. \end{aligned}$$

```check
same(diff(x**2 + 4, x), 2*x); antideriv(log(x**2 + 4)/2, x/(x**2 + 4), x)
wq = symbols('w', positive=True)
same(diff(wq**2, wq), 2*wq); same(exp(sqrt(wq**2))*2*wq, 2*wq*exp(wq))
steps(Integral(2*wq*exp(wq), wq), 2*(wq*exp(wq) - Integral(exp(wq), wq)), 2*(wq*exp(wq) - exp(wq)))
xp2 = symbols('x', positive=True)
antideriv(2*(sqrt(xp2) - 1)*exp(sqrt(xp2)), exp(sqrt(xp2)), xp2)
same((-4)**2 - 4*13, -36); same(expand((x - 2)**2 + 9), x**2 - 4*x + 13)
antideriv(atan((x - 2)/3)/3, 1/(x**2 - 4*x + 13), x)
same(sqrt(wq**2)/(1 + wq**2)*2*wq, 2*wq**2/(1 + wq**2)); same(wq**2/(1 + wq**2), 1 - 1/(1 + wq**2))
antideriv(2*wq - 2*atan(wq), 2*wq**2/(1 + wq**2), wq)
antideriv(2*sqrt(xp2) - 2*atan(sqrt(xp2)), sqrt(xp2)/(1 + xp2), xp2)
```
:::

::: pitfall
Reaching for a heavy method when a light one works. $\int \dfrac{x}{x^2 + 4}\,dx$ needs no partial fractions, and $\int x\sqrt{x^2 + 1}\,dx$ needs no trigonometric substitution: $u = x^2 + 1$ gives $\tfrac13\big(x^2 + 1\big)^{3/2} + C$ in one line. Look for a substitution before anything else.

```check
antideriv((x**2 + 1)**Rational(3, 2)/3, x*sqrt(x**2 + 1), x)
```
:::

## Integration by computer {#by-computer}

Computer algebra systems such as SymPy integrate with the methods of this module and with algorithms that handle whole families of integrands at once. Module 10 introduced `sp.integrate` ([Section 10.8](module_10_EN.html#sympy)); here it is on integrals of this module, with the lesson of Module 10 in mind: an answer that looks different is not necessarily wrong.

::: compute Integrals of this module by computer
```python
import sympy as sp
x = sp.symbols('x')
print(sp.integrate(x**2*sp.sin(x), x))                 # Example 11.3
print(sp.integrate(sp.exp(x)*sp.sin(x), x))            # Example 11.6
print(sp.integrate((5*x - 4)/(x**2 - x - 2), x))       # Example 11.15(a)
print(sp.integrate(1/sp.sqrt(x**2 + 4), x))            # Example 11.14(a)
print(sp.integrate(sp.sec(x), x))                      # Theorem 11.4
```

```output
-x**2*cos(x) + 2*x*sin(x) + 2*cos(x)
exp(x)*sin(x)/2 - exp(x)*cos(x)/2
2*log(x - 2) + 3*log(x + 1)
asinh(x/2)
-log(sin(x) - 1)/2 + log(sin(x) + 1)/2
```

The first two are the answers of Examples 11.3 and 11.6, in SymPy's order of terms. The third writes $\ln(x - 2)$ for $\ln\abs{x - 2}$, as Module 10 explained: SymPy's `log` works with complex numbers, and its answer is right where $x > 2$. The fourth is $\operatorname{arsinh}\dfrac{x}{2} = \ln\Big(\dfrac{x}{2} + \sqrt{\dfrac{x^2}{4} + 1}\Big) = \ln\big(x + \sqrt{x^2 + 4}\big) - \ln 2$, by [Exercise 6.10](module_06_EN.html#ex-6-10): Example 11.14's answer minus the constant $\ln 2$. The fifth looks nothing like $\ln\abs{\sec x + \tan x}$. Where $\cos x \ne 0$, $\sin x - 1 < 0$, so SymPy's $\ln(\sin x - 1)$ is a complex number, $\ln(1 - \sin x)$ plus the constant $\pi i$. Up to a constant, then, SymPy's answer is

$$\begin{aligned} \frac12\ln\frac{1 + \sin x}{1 - \sin x} &= \frac12\ln\frac{(1 + \sin x)^2}{\cos^2 x} \\ &= \ln\abs{\sec x + \tan x}, \end{aligned}$$

where the middle step multiplies the top and the bottom by $1 + \sin x$. Two right answers, again. To check an answer, differentiate it:

```python
mine = sp.log(x + sp.sqrt(x**2 + 4))                   # Example 11.14(a)
print(sp.simplify(sp.diff(mine, x) - 1/sp.sqrt(x**2 + 4)))
print(sp.simplify(sp.diff(sp.log(sp.sec(x) + sp.tan(x)), x) - sp.sec(x)))
print(sp.N((mine - sp.asinh(x/2)).subs(x, 3)), sp.N(sp.log(2)))
```

```output
0
0
0.693147180559945 0.693147180559945
```

Both differences of derivatives are 0, and the difference between Example 11.14's answer and SymPy's, at $x = 3$ or anywhere else, is $\ln 2$. Finally, an integral that defeats SymPy, the length of an arch of the sine curve in Module 12:

```python
print(sp.integrate(sp.sqrt(1 + sp.cos(x)**2), x))
```

```output
Integral(sqrt(cos(x)**2 + 1), x)
```

SymPy returns the integral unevaluated: it has found no antiderivative.
:::

```check
same(integrate(x**2*sin(x), x), -x**2*cos(x) + 2*x*sin(x) + 2*cos(x)); same(integrate(exp(x)*sin(x), x), exp(x)*(sin(x) - cos(x))/2)
xr2 = symbols('x', real=True)
same(asinh(xr2/2).rewrite(log), log(xr2/2 + sqrt(xr2**2/4 + 1))); same(log(xr2/2 + sqrt(xr2**2/4 + 1)), log(xr2 + sqrt(xr2**2 + 4)) - log(2))
same(log(sin(Rational(1, 3)) - 1), log(1 - sin(Rational(1, 3))) + pi*I)      # log of a negative number: ln|.| + pi i
Fsym = -log(sin(x) - 1)/2 + log(sin(x) + 1)/2                                       # SymPy's answer: up to -pi i/2, it is ln|sec x + tan x|
for v_ in (Rational(1, 2), 1, -Rational(13, 10), 2):                                # points on three intervals where cos x != 0
    near(Fsym.subs(x, v_) - log(Abs(sec(v_) + tan(v_))), -pi*I/2, 1e-25)
same((1 + sin(x))/(1 - sin(x)), (1 + sin(x))**2/cos(x)**2); same((1 + sin(x))**2/cos(x)**2, (sec(x) + tan(x))**2)
for v_ in (Rational(1, 2), 1, -Rational(13, 10)):
    near(log((1 + sin(v_))/(1 - sin(v_)))/2, log(Abs(sec(v_) + tan(v_))), 1e-25)
rounds(log(2), '0.693147180559945')
```

::: pitfall
Three things to remember about a computer's antiderivative. **(1)** It leaves out "$+\,C$" and usually the absolute value bars, and it may use complex logarithms. **(2)** A different-looking answer may well be right: differentiate it, or compare it with yours at a few points, where the difference must be the same constant. **(3)** An unevaluated `Integral(...)` means that SymPy found no antiderivative, not that none exists; and a correct answer can be so long that a numerical value (Section 11.7) is more useful.
:::

### Functions with no elementary antiderivative {#nonelementary}

The integral of the last Compute it box is not unusual. Most of the functions in this module's examples were chosen because their antiderivatives can be written down; most functions that turn up in practice cannot be integrated that way.

::: definition Elementary function
An **elementary function** is a function that can be built from constants and $x$ with finitely many additions, subtractions, multiplications, divisions, powers, roots, exponentials, logarithms, trigonometric and inverse trigonometric functions, and compositions of these.
:::

Every function of Module 1's catalogue is elementary, and so are combinations such as $e^{-x^2}$, $\sqrt{1 + \cos^2 x}$, $\sinh x = \tfrac12\big(e^x - e^{-x}\big)$ and $\ln\big(x + \sqrt{x^2 + 1}\big)$. The derivative of an elementary function is elementary: the rules of Modules 4 to 6 produce it. The antiderivative of an elementary function need not be. **Liouville's theorem** describes what an elementary antiderivative must look like, if there is one; from it one can prove that none of

$$e^{-x^2}, \quad \frac{\sin x}{x}, \quad \frac{1}{\ln x}, \quad \frac{e^x}{x}, \quad \sin\big(x^2\big)$$

has an elementary antiderivative. The proofs are beyond this series. The consequence is not: no cleverness with the methods of this module will find such an antiderivative, because none exists.

These functions do have antiderivatives, all the same. Each is continuous on an interval, so by Part 1 of the Fundamental Theorem its area function is an antiderivative ([Section 10.4](module_10_EN.html#ftc1)). The most useful of them have names, and their values are computed numerically, in the same way as calculators compute $\sin x$ and $\ln x$.

::: definition Three functions defined by integrals
- The **error function** is $\operatorname{erf} x = \dfrac{2}{\sqrt\pi}\displaystyle\int_0^x e^{-t^2}\,dt$, for every real $x$ (Module 10).
- The **sine integral** is $\operatorname{Si} x = \displaystyle\int_0^x \frac{\sin t}{t}\,dt$, for every real $x$, where the integrand is given the value 1 at $t = 0$, its limit there ([Module 2](module_02_EN.html#trig-limits)), so that it is continuous.
- The **logarithmic integral** is $\operatorname{Li} x = \displaystyle\int_2^x \frac{dt}{\ln t}$, for $x > 1$.
:::

By Part 1 of the Fundamental Theorem, $(\operatorname{erf} x)' = \dfrac{2}{\sqrt\pi}e^{-x^2}$, $(\operatorname{Si} x)' = \dfrac{\sin x}{x}$ for $x \ne 0$, and $(\operatorname{Li} x)' = \dfrac{1}{\ln x}$. Figure 11.3 shows the three, and here are a few values of the first two:

```valuetable
x = 0.5, 1, 2, 3
$\operatorname{erf} x$ = erf(x)
$\operatorname{Si} x$ = Si(x)
digits = 6
---
x | \operatorname{erf} x | \operatorname{Si} x
0.5 | 0.520500 | 0.493107
1 | 0.842701 | 0.946083
2 | 0.995322 | 1.60541
3 | 0.999978 | 1.84865
```

The error function is the workhorse of probability, where $e^{-x^2}$ is the shape of the normal distribution (Module 12). The sine integral turns up in signal processing and optics. The logarithmic integral counts primes: the number of prime numbers up to $x$ is close to $\operatorname{Li} x$ when $x$ is large, in the sense that their ratio tends to 1 as $x \to \infty$. That is the prime number theorem, and the Compute it box below tests it at a million.

```check
xq = symbols('x', positive=True)
same(diff(Integral(exp(-t**2), (t, 0, x))*2/sqrt(pi), x), 2*exp(-x**2)/sqrt(pi)); same(diff(erf(x), x), 2*exp(-x**2)/sqrt(pi))
same(diff(Integral(sin(t)/t, (t, 0, x)), x), sin(x)/x); same(diff(Si(x), x), sin(x)/x); limit_is(sin(t)/t, t, 0, 1)
same(diff(Integral(1/log(t), (t, 2, xq)), xq), 1/log(xq)); same(diff(Li(x), x), 1/log(x)); same(Li(2), 0)
near(Integral(1/log(t), (t, 2, 10)).evalf(30), Li(10).evalf(30), 1e-20)
near(Integral(sin(t)/t, (t, 0, 2)).evalf(30), Si(2).evalf(30), 1e-20)
same(sinh(x), (exp(x) - exp(-x))/2)
```

::: figure id=fig-11-3
Three integrands with no elementary antiderivative (blue) and the antiderivatives defined by their integrals (orange). Left: $e^{-x^2}$ and $\int_0^x e^{-t^2}\,dt = \tfrac{\sqrt\pi}{2}\operatorname{erf} x$, which levels off at $\tfrac{\sqrt\pi}{2} \approx 0.886$. Middle: $\dfrac{\sin x}{x}$ and $\operatorname{Si} x$, which rises while the integrand is positive and falls while it is negative, and settles towards $\tfrac{\pi}{2} \approx 1.571$. Right: $\dfrac{1}{\ln x}$ and $\operatorname{Li} x$, for $x \ge 2$; $\operatorname{Li} x$ keeps growing, because $\dfrac{1}{\ln x}$ stays positive.
:::

```check
limit_is(sqrt(pi)/2*erf(x), x, oo, sqrt(pi)/2); rounds(sqrt(pi)/2, '0.886'); limit_is(Si(x), x, oo, pi/2); rounds(pi/2, '1.571')
```

::: compute Special functions in SymPy
Asked for these antiderivatives, SymPy names them:

```python
import sympy as sp
x = sp.symbols('x')
for f in [sp.exp(-x**2), sp.sin(x)/x, 1/sp.log(x), sp.exp(x)/x]:
    print(sp.integrate(f, x))
```

```output
sqrt(pi)*erf(x)/2
Si(x)
li(x)
Ei(x)
```

`Ei` is the exponential integral, another named antiderivative. SymPy's `li` is another antiderivative of $\dfrac{1}{\ln x}$, defined by an integral from 0 that needs special care at $t = 1$, where $\dfrac{1}{\ln t}$ is undefined; it differs from $\operatorname{Li}$ by the constant $\operatorname{li} 2$. The prime numbers up to a million, counted by `primepi`, against $\operatorname{Li}$ of a million:

```python
print(sp.N(sp.li(2)))
print(sp.primepi(10**6), sp.N(sp.Li(10**6)))
print(sp.Integral(sp.exp(-x**2), (x, 0, 1)).evalf())
```

```output
1.04516378011749
78498 78626.5039956821
0.746824132812427
```

There are 78,498 primes below a million, and $\operatorname{Li} 10^6 \approx 78{,}627$: a difference of less than 0.2%. The last line is $\int_0^1 e^{-x^2}\,dx$, which `evalf` computes numerically, the value that Module 9 estimated with midpoint sums.
:::

```check
same(integrate(exp(-x**2), x), sqrt(pi)*erf(x)/2); same(integrate(sin(x)/x, x), Si(x)); same(integrate(1/log(x), x), li(x)); same(integrate(exp(x)/x, x), Ei(x))
same(diff(li(x), x), 1/log(x)); same(diff(Ei(x), x), exp(x)/x); same(Li(x).rewrite(li), li(x) - li(2))
rounds(li(2), '1.04516378011749'); same(primepi(10**6), 78498); rounds(Li(10**6), '78627')
holds((Li(10**6) - 78498)/78498 < Rational(2, 1000)); rounds(Integral(exp(-x**2), (x, 0, 1)).evalf(30), '0.746824132812427')
```

::: pitfall
"No elementary antiderivative" does not mean "no antiderivative", and it does not stop you from evaluating definite integrals: $\int_0^1 e^{-x^2}\,dx \approx 0.746824$ is a perfectly good number. And small changes matter. $\int xe^{-x^2}\,dx = -\tfrac12e^{-x^2} + C$ and $\int x\sin\big(x^2\big)\,dx = -\tfrac12\cos\big(x^2\big) + C$, by substitution; without the factor $x$, neither has an elementary antiderivative.

```check
rounds(sqrt(pi)*erf(1)/2, '0.746824'); antideriv(-exp(-x**2)/2, x*exp(-x**2), x); antideriv(-cos(x**2)/2, x*sin(x**2), x)
```
:::

## Numerical integration {#numerical}

Two kinds of integral call for numbers rather than formulas: integrals of functions with no elementary antiderivative, such as $\int_0^1 e^{-x^2}\,dx$, and integrals of functions known only through measurements, such as a speed or a power read every few seconds. A **numerical integration rule** computes an integral from values of the integrand. Module 9 met the **midpoint rule**

$$M_n = \Delta x\,\big[f(\bar x_1) + f(\bar x_2) + \dots + f(\bar x_n)\big],$$

where $\Delta x = \tfrac{b - a}{n}$, $x_i = a + i\,\Delta x$, and $\bar x_i = \tfrac12(x_{i-1} + x_i)$ is the midpoint of the $i$th subinterval (read "x bar i"; Module 9 wrote $m_i$). Its error shrank like $\tfrac{1}{n^2}$ ([Section 9.3](module_09_EN.html#riemann-sums)). This section adds two rules, explains why the errors behave as they do, and bounds them.

### The trapezoidal rule {#trapezoidal}

In Example 9.2 a car's speed was read every 2 seconds. The left and right sums gave 100 m and 140 m, and their average, 120 m, was a better single estimate. Averaging $L_n$ and $R_n$ term by term gives

$$\frac{L_n + R_n}{2} = \sum_{i=1}^{n} \frac{f(x_{i-1}) + f(x_i)}{2}\,\Delta x,$$

and each term is the area of a trapezoid: when $f$ is positive, the region under the chord that joins the points $(x_{i-1}, f(x_{i-1}))$ and $(x_i, f(x_i))$ of the graph (Figure 11.4, left). Every value of $f$ except the first and the last belongs to two neighbouring trapezoids, so collecting terms gives the following rule.

::: definition The trapezoidal rule
Let $f$ be defined on $[a, b]$, let $n \ge 1$ be a whole number, $\Delta x = \tfrac{b - a}{n}$ and $x_i = a + i\,\Delta x$. The **trapezoidal rule** with $n$ subintervals is

$$\begin{aligned} T_n = \frac{\Delta x}{2}\big[&f(x_0) + 2f(x_1) \\ &+ 2f(x_2) + \dots \\ &+ 2f(x_{n-1}) + f(x_n)\big]. \end{aligned}$$

It is the average $\tfrac12(L_n + R_n)$ of the left and right sums.
:::

The **error** of a rule is the integral minus the approximation: $E_T = \int_a^b f(x)\,dx - T_n$ and $E_M = \int_a^b f(x)\,dx - M_n$. A positive error means that the rule underestimates.

```check
fT = Function('f'); dX = symbols('Delta_x', positive=True)
xs_ = [fT(k_) for k_ in range(4)]                                   # n = 3: values f(x_0), ..., f(x_3)
same(dX/2*(xs_[0] + 2*xs_[1] + 2*xs_[2] + xs_[3]), (dX*(xs_[0] + xs_[1] + xs_[2]) + dX*(xs_[1] + xs_[2] + xs_[3]))/2)
V92 = [0, 6, 11, 15, 18, 20]
same(Rational(2, 2)*(V92[0] + 2*sum(V92[1:5]) + V92[5]), 120); same((100 + 140)/Integer(2), 120)
```

::: example The trapezoidal and midpoint rules for ln 2
Compute $T_4$ for $\displaystyle\int_1^2 \frac{dx}{x} = \ln 2$, and compare the errors of $T_4$ and $M_4$.

Here $\Delta x = 0.25$, and $\dfrac1x$ takes the values $1$, $\tfrac45$, $\tfrac23$, $\tfrac47$ and $\tfrac12$ at $x = 1$, 1.25, 1.5, 1.75 and 2 ([Example 9.4](module_09_EN.html#riemann-sums)). So

$$\begin{aligned} T_4 &= \frac{0.25}{2}\Big[1 + 2\cdot\frac45 + 2\cdot\frac23 \\ &\qquad + 2\cdot\frac47 + \frac12\Big] \\ &= \frac{1171}{1680} \approx 0.69702, \end{aligned}$$

which is the average of $L_4 = \tfrac{319}{420}$ and $R_4 = \tfrac{533}{840}$ from Example 9.4. That example also found $M_4 \approx 0.69122$. With $\ln 2 \approx 0.693147$,

$$\begin{aligned} E_T &= \ln 2 - T_4 \approx -0.00388, \\ E_M &= \ln 2 - M_4 \approx 0.00193. \end{aligned}$$

The trapezoidal rule overestimates, the midpoint rule underestimates, and the midpoint error is about half the size of the trapezoidal one.

```check
fr_ = lambda X: 1/sympify(X)
same([fr_(v_) for v_ in (1, Rational(5, 4), Rational(3, 2), Rational(7, 4), 2)], [1, Rational(4, 5), Rational(2, 3), Rational(4, 7), Rational(1, 2)])
T4 = Rational(1, 8)*(1 + 2*Rational(4, 5) + 2*Rational(2, 3) + 2*Rational(4, 7) + Rational(1, 2))
same(T4, Rational(1171, 1680)); rounds(T4, '0.69702'); same((Rational(319, 420) + Rational(533, 840))/2, T4)
M4 = Rational(1, 4)*sum(fr_(1 + (k_ + Rational(1, 2))/4) for k_ in range(4)); rounds(M4, '0.69122'); rounds(log(2), '0.693147')
rounds(log(2) - T4, '-0.00388'); rounds(log(2) - M4, '0.00193'); holds(log(2) - T4 < 0); holds(log(2) - M4 > 0)
```
:::

Here is the same comparison for more subintervals:

```valuetable
n = 4, 8, 16, 32
$E_T$ = log(2) - (1 + 2*Sum(1/(1 + i/n), (i, 1, n - 1)) + 1/2)/(2*n)
$E_M$ = log(2) - Sum(1/(1 + (i - 1/2)/n), (i, 1, n))/n
decimals = 7
---
n | E_T | E_M
4 | -0.0038766 | 0.0019273
8 | -0.0009747 | 0.0004866
16 | -0.0002440 | 0.0001220
32 | -0.0000610 | 0.0000305
```

Two patterns stand out. Each time $n$ doubles, both errors are divided by about 4, as Module 9 found for midpoint sums. And at every $n$, $E_T \approx -2E_M$.

The signs come from the shape of the graph. The second derivative of $\tfrac1x$ is $\tfrac{2}{x^3} > 0$, so the graph is concave up on $[1, 2]$ ([Section 8.4](module_08_EN.html#concavity)): it bends away below each chord, and each trapezoid covers more than the region under the graph. So $T_n$ overestimates (Figure 11.4, left). For the midpoint rule, draw the tangent line at the midpoint of a subinterval. It passes through the middle of the top of the midpoint rectangle and cuts off two triangles of equal area, one above the top on one side and one below it on the other. So the rectangle has the same area as the trapezoid under the tangent line (Figure 11.4, right). A concave-up graph lies above its tangent lines ([Theorem 8.11](module_08_EN.html#concavity)), so that trapezoid lies below the graph, and $M_n$ underestimates. For a graph that is concave down, both conclusions turn round, as Module 9 saw in [Exercise 9.2](module_09_EN.html#ex-9-2), where $M_4$ overestimated $\int_0^2 (4 - x^2)\,dx$.

```check
same(diff(1/x, x, 2), 2/x**3)
same(diff(4 - x**2, x, 2), -2); same(Rational(43, 8) - integrate(4 - x**2, (x, 0, 2)), Rational(1, 24))   # Exercise 9.2: M_4 = 43/8 overestimates
mq, hq = symbols('m h', positive=True); fM = Function('f')
same(integrate(fM(mq) + Subs(Derivative(fM(x), x), x, mq)*(x - mq), (x, mq - hq, mq + hq)), 2*hq*fM(mq))   # the tangent trapezoid has the rectangle's area
```

::: figure id=fig-11-4
One subinterval of the two rules for $\int_1^2 \frac{dx}{x}$, with $n = 1$ so that the errors are visible. Left: the trapezoid under the chord has area 0.75, more than the area $\ln 2 \approx 0.693$ under the graph: the graph, concave up, sags below the chord, and the orange sliver is the excess. Right: the midpoint rectangle (dashed) has area $\tfrac23 \approx 0.667$, the same as the trapezoid under the tangent line at the midpoint, because the two small triangles between them are equal; the graph lies above the tangent, so the rectangle is too small by the green sliver.
:::

```check
same((1 + Rational(1, 2))/2, Rational(3, 4)); rounds(log(2), '0.693'); holds(Rational(3, 4) > log(2))
same(1/Rational(3, 2), Rational(2, 3)); rounds(Rational(2, 3), '0.667'); holds(Rational(2, 3) < log(2))
same(integrate(Rational(2, 3) + Rational(-4, 9)*(x - Rational(3, 2)), (x, 1, 2)), Rational(2, 3))   # the tangent at 3/2: slope -1/(3/2)^2
same(diff(1/x, x).subs(x, Rational(3, 2)), Rational(-4, 9))
```

### Error bounds {#error-bounds}

::: theorem Error bounds for the midpoint and trapezoidal rules
Let $f''$ be continuous on $[a, b]$, and let $K$ be a number with $\abs{f''(x)} \le K$ for every $x$ in $[a, b]$. Then, for every $n \ge 1$,

$$\begin{aligned} \abs{E_T} &\le \frac{K(b - a)^3}{12n^2} \quad\text{and} \\ \abs{E_M} &\le \frac{K(b - a)^3}{24n^2}. \end{aligned}$$

If $f''(x) \ge 0$ for every $x$ in $[a, b]$, then $M_n \le \int_a^b f(x)\,dx \le T_n$; if $f''(x) \le 0$ for every $x$ in $[a, b]$, then $T_n \le \int_a^b f(x)\,dx \le M_n$.
:::

Such a $K$ exists: $\abs{f''}$ is continuous on the closed interval $[a, b]$, so it has a largest value there, by the Extreme Value Theorem ([Module 3](module_03_EN.html#evt)). The bounds shrink like $\tfrac{1}{n^2}$, which is why doubling $n$ divides the errors by about 4, and the bound for $M_n$ is half the bound for $T_n$. The Going deeper box proves the trapezoidal half of the theorem; Exercise 11.12 proves the midpoint half in the same way.

```check
Kq, nq = symbols('K n', positive=True); aq, bq_ = symbols('a b', real=True)
same((Kq*(bq_ - aq)**3/(12*nq**2))/(Kq*(bq_ - aq)**3/(12*(2*nq)**2)), 4); same(Kq*(bq_ - aq)**3/(24*nq**2), (Kq*(bq_ - aq)**3/(12*nq**2))/2)
```

::: deeper Why the theorem is true, and the factors 4 and −2
Take one subinterval $[p, q]$, of width $w = q - p$, and the function $k(x) = \tfrac12(x - p)(q - x)$. It is at least 0 on $[p, q]$ and 0 at both ends; $k'(x) = \tfrac{p + q}{2} - x$, so $k'(p) = \tfrac{w}{2}$ and $k'(q) = -\tfrac{w}{2}$; and $k''(x) = -1$. Integrate $\int_p^q k f''\,dx$ by parts twice (Theorem 11.2), first with $u = k$ and $dv = f''(x)\,dx$, then with $u = k'$ and $dv = f'(x)\,dx$:

$$\begin{aligned} &\int_p^q k f''\,dx \\ &\quad= \big[kf'\big]_p^q - \int_p^q k'f'\,dx \\ &\quad= 0 - \big[k'f\big]_p^q + \int_p^q k''f\,dx \\ &\quad= \frac{w}{2}\big(f(p) + f(q)\big) - \int_p^q f\,dx. \end{aligned}$$

So the error of a single trapezoid is

$$\begin{aligned} &\int_p^q f(x)\,dx - \frac{w}{2}\big(f(p) + f(q)\big) \\ &\quad= -\int_p^q k(x)\,f''(x)\,dx. \end{aligned}$$

**The bound.** Since $k \ge 0$ and $-K \le f'' \le K$, the comparison theorem ([Theorem 9.7](module_09_EN.html#properties)) puts the right side between $-K\int_p^q k\,dx$ and $K\int_p^q k\,dx$, and $\int_p^q k(x)\,dx = \tfrac{w^3}{12}$. So each trapezoid is in error by at most $\tfrac{Kw^3}{12}$. There are $n$ trapezoids, each of width $w = \tfrac{b - a}{n}$, so

$$\begin{aligned} \abs{E_T} &\le n\cdot\frac{K}{12}\Big(\frac{b - a}{n}\Big)^3 \\ &= \frac{K(b - a)^3}{12n^2}. \end{aligned}$$

**The sign.** If $f'' \ge 0$, each $-\int_p^q kf''\,dx$ is at most 0, so $E_T \le 0$: $T_n$ overestimates.

**The factors 4 and $-2$.** If $f''$ hardly changes across $[p, q]$, the error of one trapezoid is close to $-f''(p)\int_p^q k\,dx = -f''(p)\tfrac{w^3}{12}$. Adding up over the subintervals, with $w = \Delta x$,

$$\begin{aligned} E_T &\approx -\frac{\Delta x^2}{12}\sum_{i=1}^{n} f''(x_{i-1})\,\Delta x \\ &\approx -\frac{\Delta x^2}{12}\int_a^b f''(x)\,dx \\ &= -\frac{\Delta x^2}{12}\big(f'(b) - f'(a)\big), \end{aligned}$$

because the sum is a Riemann sum of $f''$. In the same way (Exercise 11.12), $E_M \approx \tfrac{\Delta x^2}{24}\big(f'(b) - f'(a)\big)$. Halving $\Delta x$ divides both by 4, and $E_T \approx -2E_M$. For $\ln 2$ with $n = 4$, $f'(x) = -\tfrac{1}{x^2}$ gives $f'(2) - f'(1) = \tfrac34$, and the two formulas predict $E_T \approx -0.00391$ and $E_M \approx 0.00195$, close to the true $-0.00388$ and $0.00193$ of Example 11.19.
:::

```check
pq_, qq_ = symbols('p q', real=True); kq = (x - pq_)*(qq_ - x)/2
same(diff(kq, x).subs(x, pq_), (qq_ - pq_)/2); same(diff(kq, x).subs(x, qq_), -(qq_ - pq_)/2); same(diff(kq, x, 2), -1)
same(kq.subs(x, pq_), 0); same(kq.subs(x, qq_), 0); same(integrate(kq, (x, pq_, qq_)), (qq_ - pq_)**3/12)
for fk in (x**5, exp(x), sin(3*x), 1/x):                  # the error formula, on instances with symbolic ends (p, q > 0 for 1/x)
    pp_, qp_ = (symbols('p q', positive=True) if fk == 1/x else (pq_, qq_))
    kk = (x - pp_)*(qp_ - x)/2
    same(integrate(fk, (x, pp_, qp_)) - (qp_ - pp_)/2*(fk.subs(x, pp_) + fk.subs(x, qp_)), -integrate(kk*diff(fk, x, 2), (x, pp_, qp_)))
same(nq*(Kq/12)*((bq_ - aq)/nq)**3, Kq*(bq_ - aq)**3/(12*nq**2))
dfp = -1/x**2; same(dfp.subs(x, 2) - dfp.subs(x, 1), Rational(3, 4))
rounds(-Rational(1, 16)/12*Rational(3, 4), '-0.00391'); rounds(Rational(1, 16)/24*Rational(3, 4), '0.00195')
```

::: example How many subintervals?
How large must $n$ be for $T_n$, and for $M_n$, to approximate $\ln 2 = \int_1^2 \frac{dx}{x}$ with an error of at most $10^{-6}$?

$f(x) = \tfrac1x$ has $f''(x) = \tfrac{2}{x^3}$, which on $[1, 2]$ is positive and largest at $x = 1$, so take $K = 2$. With $b - a = 1$, Theorem 11.8 guarantees

$$\abs{E_T} \le \frac{2}{12n^2} = \frac{1}{6n^2}.$$

This is at most $10^{-6}$ when $n^2 \ge \tfrac{10^6}{6} \approx 166{,}667$. Since $408^2 = 166{,}464$ is too small and $409^2 = 167{,}281$ is enough, $n = 409$ subintervals suffice. For the midpoint rule, $\tfrac{1}{12n^2} \le 10^{-6}$ needs $n^2 \ge 83{,}334$, and $n = 289$ suffices ($288^2 = 82{,}944$, $289^2 = 83{,}521$). These values of $n$ are guaranteed to be enough; they may be more than necessary, because over most of $[1, 2]$ the second derivative is much smaller than $K$.

```check
same(diff(1/x, x, 2), 2/x**3); same(maximum(2/x**3, x, Interval(1, 2)), 2); holds(minimum(2/x**3, x, Interval(1, 2)) > 0)
same(diff(2/x**3, x), -6/x**4); same((2/x**3).subs(x, 1), 2); same((2/x**3).subs(x, 2), Rational(1, 4))   # decreasing, from 2 to 1/4
rounds(Rational(10**6, 6), '166667'); same(408**2, 166464); same(409**2, 167281)
holds(Rational(1, 6*408**2) > Rational(1, 10**6)); holds(Rational(1, 6*409**2) <= Rational(1, 10**6))
holds(Rational(10**6, 12) > 83333); same(288**2, 82944); same(289**2, 83521)
holds(Rational(1, 12*288**2) > Rational(1, 10**6)); holds(Rational(1, 12*289**2) <= Rational(1, 10**6))
```
:::

::: pitfall
$K$ must bound $\abs{f''}$ on the whole interval: take its largest value, not its value at a convenient point. With $K = f''(2) = \tfrac14$ for $\tfrac1x$ on $[1, 2]$, the "bound" for $T_4$ would be $\tfrac{1}{768} \approx 0.0013$, less than the actual error, 0.0039. And a bound is a guarantee, not an estimate: the true error may be much smaller.

```check
same((2/x**3).subs(x, 2), Rational(1, 4)); same(Rational(1, 4)/(12*16), Rational(1, 768)); rounds(Rational(1, 768), '0.0013')
rounds(abs(log(2) - Rational(1171, 1680)), '0.0039'); holds(Rational(1, 768) < abs(log(2) - Rational(1171, 1680)))
```
:::

### Simpson's rule {#simpson}

The trapezoidal rule replaces the graph by chords, straight lines through two points. A parabola through three points can follow a curve much more closely, and the area under one is easy to find. Let $y = Ax^2 + Bx + C$ pass through the points $(-h, y_0)$, $(0, y_1)$ and $(h, y_2)$, where $h > 0$. Then, since the odd term $Bx$ contributes 0,

$$\begin{aligned} \int_{-h}^{h} \big(Ax^2 + Bx + C\big)\,dx &= \frac23Ah^3 + 2Ch \\ &= \frac{h}{3}\big(2Ah^2 + 6C\big). \end{aligned}$$

The three points give $y_0 = Ah^2 - Bh + C$, $y_1 = C$ and $y_2 = Ah^2 + Bh + C$, so $y_0 + 4y_1 + y_2 = 2Ah^2 + 6C$, and the area is

$$\frac{h}{3}\big(y_0 + 4y_1 + y_2\big).$$

Such a parabola always exists: $C = y_1$, $B = \tfrac{y_2 - y_0}{2h}$ and $A = \tfrac{y_0 - 2y_1 + y_2}{2h^2}$ (a straight line if $A = 0$). The area depends only on the three heights and the spacing $h$, so it is the same for any three equally spaced points, wherever they are on the $x$-axis: sliding the picture sideways does not change it. Now cut $[a, b]$ into an even number $n$ of subintervals, pass a parabola through the points of the graph above $x_0$, $x_1$ and $x_2$, another through those above $x_2$, $x_3$ and $x_4$, and so on, and add up the areas under them (Figure 11.5, left).

```check
Ap, Bp, Cp, hp, y0p, y1p, y2p = symbols('A B C h y_0 y_1 y_2'); par = Ap*x**2 + Bp*x + Cp
steps(Integral(par, (x, -hp, hp)), Rational(2, 3)*Ap*hp**3 + 2*Cp*hp, hp/3*(2*Ap*hp**2 + 6*Cp))
same(par.subs(x, -hp) + 4*par.subs(x, 0) + par.subs(x, hp), 2*Ap*hp**2 + 6*Cp)
same(solve([par.subs(x, -hp) - y0p, par.subs(x, 0) - y1p, par.subs(x, hp) - y2p], [Ap, Bp, Cp]), {Ap: (y0p - 2*y1p + y2p)/(2*hp**2), Bp: (y2p - y0p)/(2*hp), Cp: y1p})
cs_ = symbols('c_s')
same(integrate(par.subs(x, x - cs_), (x, cs_ - hp, cs_ + hp)), integrate(par, (x, -hp, hp)))   # sliding sideways
```

::: definition Simpson's rule
Let $n$ be even, $\Delta x = \tfrac{b - a}{n}$ and $x_i = a + i\,\Delta x$. **Simpson's rule** with $n$ subintervals is

$$\begin{aligned} S_n = \frac{\Delta x}{3}\big[&f(x_0) + 4f(x_1) + 2f(x_2) \\ &+ 4f(x_3) + \dots + 2f(x_{n-2}) \\ &+ 4f(x_{n-1}) + f(x_n)\big]. \end{aligned}$$
:::

The coefficients follow the pattern $1, 4, 2, 4, 2, \dots, 4, 1$: each point with an odd index is the middle of a pair of subintervals, with weight 4, and each interior point with an even index is shared by two pairs, with weight $1 + 1 = 2$. The error is $E_S = \int_a^b f(x)\,dx - S_n$.

```check
fS = Function('f')
pairs_ = sum(dX/3*(fS(2*j_) + 4*fS(2*j_ + 1) + fS(2*j_ + 2)) for j_ in range(3))      # n = 6: three parabolas
same(pairs_, dX/3*(fS(0) + 4*fS(1) + 2*fS(2) + 4*fS(3) + 2*fS(4) + 4*fS(5) + fS(6)))
```

::: example Simpson's rule for ln 2
Compute $S_4$ for $\displaystyle\int_1^2 \frac{dx}{x}$.

With $\Delta x = 0.25$ and the values of $\tfrac1x$ used in Example 11.19,

$$\begin{aligned} S_4 &= \frac{0.25}{3}\Big[1 + 4\cdot\frac45 + 2\cdot\frac23 \\ &\qquad + 4\cdot\frac47 + \frac12\Big] \\ &= \frac{1747}{2520} \approx 0.693254. \end{aligned}$$

Its error is $E_S = \ln 2 - S_4 \approx -0.000107$, about 36 times smaller than the error of $T_4$, from the same five values of $f$.

Simpson's rule is in fact a weighted average of the other two. The points of $S_{2n}$ are those of $T_n$ together with the midpoints used by $M_n$, and grouping the terms shows that

$$S_{2n} = \frac{T_n + 2M_n}{3}.$$

Here, with $T_2 = \tfrac{17}{24}$ and $M_2 = \tfrac{24}{35}$, $\tfrac13\big(\tfrac{17}{24} + \tfrac{48}{35}\big) = \tfrac{1747}{2520} = S_4$. Since $E_T \approx -2E_M$, the weights 1 and 2 make the two errors nearly cancel.

```check
S4 = Rational(1, 12)*(1 + 4*Rational(4, 5) + 2*Rational(2, 3) + 4*Rational(4, 7) + Rational(1, 2))
same(S4, Rational(1747, 2520)); rounds(S4, '0.693254'); rounds(log(2) - S4, '-0.000107')
rounds((log(2) - Rational(1171, 1680))/(log(2) - S4), '36')
T2 = Rational(1, 4)*(1 + 2*Rational(2, 3) + Rational(1, 2)); M2 = Rational(1, 2)*(fr_(Rational(5, 4)) + fr_(Rational(7, 4)))
same(T2, Rational(17, 24)); same(M2, Rational(24, 35)); same((T2 + 2*M2)/3, S4); same(Rational(17, 24) + Rational(48, 35), 3*S4)
nS = 3; hS = symbols('h', positive=True)                       # S_2n = (T_n + 2 M_n)/3 for n = 3, any f and spacing
Tn_ = hS/2*(fS(0) + 2*fS(2) + 2*fS(4) + fS(6)); Mn_ = hS*(fS(1) + fS(3) + fS(5))     # f(k) = f at a + k h/2
S2n_ = (hS/2)/3*(fS(0) + 4*fS(1) + 2*fS(2) + 4*fS(3) + 2*fS(4) + 4*fS(5) + fS(6))
same(S2n_, (Tn_ + 2*Mn_)/3)
```
:::

A rule built to be exact for parabolas turns out to be exact for more.

::: theorem Simpson's rule is exact for cubics
If $f$ is a polynomial of degree at most 3, then $S_n = \int_a^b f(x)\,dx$ for every even $n$.
:::

::: proof
$S_n$ adds up the rule over pairs of subintervals, and the integral adds up over them too, so it is enough to show that the rule is exact on one pair, $[m - h, m + h]$. Substituting $x = m + s$ and expanding the powers $(m + s)^k$ writes $f$ as $c_0 + c_1(x - m) + c_2(x - m)^2 + c_3(x - m)^3$, with constants $c_j$. The part $c_0 + c_1(x - m) + c_2(x - m)^2$ is a parabola or a line, so the rule gives its integral exactly, by construction. For $(x - m)^3$, the integral over $[m - h, m + h]$ is 0, because the function is odd about $m$; and the rule gives $\tfrac{h}{3}\big((-h)^3 + 4\cdot 0 + h^3\big) = 0$ too. Both the integral and the rule are linear (the value for a sum of functions is the sum of the values, and constant factors come out), so the rule is exact for $f$.
:::

```check
c0_, c1_, c2_, c3_ = symbols('c0:4'); cub = c0_ + c1_*(x - mq) + c2_*(x - mq)**2 + c3_*(x - mq)**3
same(integrate(cub, (x, mq - hq, mq + hq)), hq/3*(cub.subs(x, mq - hq) + 4*cub.subs(x, mq) + cub.subs(x, mq + hq)))
same(integrate((x - mq)**3, (x, mq - hq, mq + hq)), 0); same(hq/3*((-hq)**3 + 4*0 + hq**3), 0)
same(expand((mq + s)**3), mq**3 + 3*mq**2*s + 3*mq*s**2 + s**3)
```

The error bound for Simpson's rule involves the fourth derivative $f^{(4)}$.

::: theorem Error bound for Simpson's rule
Let $f^{(4)}$ be continuous on $[a, b]$, and let $K$ be a number with $\abs{f^{(4)}(x)} \le K$ for every $x$ in $[a, b]$. Then, for every even $n$,

$$\abs{E_S} \le \frac{K(b - a)^5}{180n^4}.$$
:::

The proof uses the idea of the Going deeper box with a longer calculation, and this series omits it. The bound agrees with Theorem 11.9: for a cubic, $f^{(4)} = 0$, so $K = 0$ and the error is 0. It shrinks like $\tfrac{1}{n^4}$, so doubling $n$ divides it by about $2^4 = 16$. For $\ln 2$, $f^{(4)}(x) = \tfrac{24}{x^5} \le 24$ on $[1, 2]$, and $\tfrac{24}{180n^4} \le 10^{-6}$ needs $n^4 \ge 133{,}334$, that is, $n \ge 19.11$. With $n$ even, $n = 20$ suffices: twenty subintervals, where the trapezoidal rule needed 409.

```check
same(diff(1/x, x, 4), 24/x**5); same(maximum(24/x**5, x, Interval(1, 2)), 24); same(diff(24/x**5, x), -120/x**6); same((24/x**5).subs(x, 1), 24)
same(Kq*(bq_ - aq)**5/(180*nq**4)/(Kq*(bq_ - aq)**5/(180*(2*nq)**4)), 16)
holds(Rational(24*10**6, 180) > 133333); rounds(Rational(24*10**6, 180)**Rational(1, 4), '19.11')
holds(Rational(24, 180*20**4) <= Rational(1, 10**6)); holds(Rational(24, 180*18**4) > Rational(1, 10**6))
```

::: compute The three rules side by side
Each rule is a few lines of Python. The test integral $\int_0^1 e^{-x^2}\,dx$ has no elementary antiderivative, but Python's `math.erf` gives its value, $\tfrac{\sqrt\pi}{2}\operatorname{erf} 1$, to about 16 significant digits:

```python
import math

def midpoint(f, a, b, n):
    dx = (b - a)/n
    return dx*sum(f(a + (i + 0.5)*dx) for i in range(n))

def trapezoid(f, a, b, n):
    dx = (b - a)/n
    return dx*(f(a)/2 + sum(f(a + i*dx) for i in range(1, n)) + f(b)/2)

def simpson(f, a, b, n):                    # n must be even
    dx = (b - a)/n
    inner = sum((4 if i % 2 else 2)*f(a + i*dx) for i in range(1, n))
    return dx/3*(f(a) + inner + f(b))
```

Now the errors as $n$ doubles, and the ratio of each error to the next:

```python
f = lambda x: math.exp(-x**2)
exact = math.sqrt(math.pi)/2*math.erf(1)        # the integral from 0 to 1
ns = [4, 8, 16, 32, 64]
rules = {'M': midpoint, 'T': trapezoid, 'S': simpson}
err = {r: [exact - rule(f, 0, 1, n) for n in ns] for r, rule in rules.items()}
print('  n        E_M        E_T        E_S')
for k, n in enumerate(ns):
    print(f'{n:3d}' + ''.join(f'{err[r][k]:11.2e}' for r in rules))
for r in rules:
    print(r, [round(err[r][k - 1]/err[r][k], 2) for k in range(1, len(ns))])
```

```output
  n        E_M        E_T        E_S
  4  -1.92e-03   3.84e-03  -3.12e-05
  8  -4.79e-04   9.59e-04  -1.99e-06
 16  -1.20e-04   2.40e-04  -1.25e-07
 32  -2.99e-05   5.99e-05  -7.79e-09
 64  -7.48e-06   1.50e-05  -4.87e-10
M [4.01, 4.0, 4.0, 4.0]
T [4.01, 4.0, 4.0, 4.0]
S [15.72, 15.95, 15.99, 16.0]
```

The midpoint and trapezoidal errors fall by a factor of 4 at each doubling, and Simpson's by a factor close to 16, as Theorems 11.8 and 11.10 predict. With 16 subintervals Simpson's rule is already within $2 \times 10^{-7}$ of the integral, closer than the trapezoidal rule with 64. The midpoint rule overestimates here, because the graph of $e^{-x^2}$ is concave down on most of $[0, 1]$ (more precisely, because $f'(1) - f'(0) = -\tfrac{2}{e}$ is negative, in the estimate of the Going deeper box); and $E_T \approx -2E_M$ once more.
:::

```check
fg_ = lambda X: exp(-sympify(X)**2)
def Mq_(f_, a_, b_, n_):
    d_ = (sympify(b_) - a_)/n_; return d_*sum(f_(a_ + (i_ + Rational(1, 2))*d_) for i_ in range(n_))
def Tq_(f_, a_, b_, n_):
    d_ = (sympify(b_) - a_)/n_; return d_*(f_(a_)/2 + sum(f_(a_ + i_*d_) for i_ in range(1, n_)) + f_(b_)/2)
def Sq_(f_, a_, b_, n_):
    d_ = (sympify(b_) - a_)/n_; return d_/3*(f_(a_) + sum((4 if i_ % 2 else 2)*f_(a_ + i_*d_) for i_ in range(1, n_)) + f_(b_))
Jg = sqrt(pi)/2*erf(1)
eM = [N(Jg - Mq_(fg_, 0, 1, n_), 30) for n_ in (4, 8, 16, 32, 64)]
eT = [N(Jg - Tq_(fg_, 0, 1, n_), 30) for n_ in (4, 8, 16, 32, 64)]
eS = [N(Jg - Sq_(fg_, 0, 1, n_), 30) for n_ in (4, 8, 16, 32, 64)]
for k_ in range(4):
    holds(3.9 < eM[k_]/eM[k_ + 1] < 4.1); holds(3.9 < eT[k_]/eT[k_ + 1] < 4.1); holds(15.5 < eS[k_]/eS[k_ + 1] < 16.1)
holds(abs(eS[2]) < 2e-7); holds(abs(eS[2]) < abs(eT[4])); holds(all(e_ < 0 for e_ in eM))
for k_ in range(5):
    holds(-2.1 < eT[k_]/eM[k_] < -1.9)
holds((diff(exp(-x**2), x, 2)).subs(x, Rational(7, 10)) < 0); same(solve(diff(exp(-x**2), x, 2), x), [-sqrt(2)/2, sqrt(2)/2])
same(diff(exp(-x**2), x).subs(x, 1) - diff(exp(-x**2), x).subs(x, 0), -2/E); holds(-2/E < 0)
```

::: figure id=fig-11-5
Simpson's rule. Left: with $n = 4$, two parabolas (purple, dashed), each through three points of the graph of $f(x) = 1 + \tfrac12\sin 2x + \tfrac{x}{4}$ (blue), replace the graph on $[0, 4]$; the shaded areas under them add up to $S_4$. Right: the size of the errors of the three rules for $\int_0^1 e^{-x^2}\,dx$ against $n$, on logarithmic scales, on which a power $C/n^p$ is a straight line of slope $-p$. The midpoint and trapezoidal errors fall along lines of slope $-2$, the errors of Simpson's rule along a line of slope $-4$.
:::

::: widget name=riemann-sums
Choose $e^x$ on $[0, 1]$, the trapezoid rule and $n = 4$: the shaded trapezoids hug the curve, and $T_4 \approx 1.72722$ is a little more than the integral $e - 1 \approx 1.71828$. Press **Double n** three times. The table keeps the error at each $n$ and the ratio of each error to the next: close to 4 every time. Switch to the midpoint rule and do the same: the errors are about half as large, with the opposite sign, and the ratios are again close to 4. Then choose Simpson's rule: the purple curves are the parabolas, and the ratios are close to 16. Two experiments to finish. Choose **type your own**, keep $x^3 - x$ on $[0, 2]$ and choose Simpson's rule: the error is 0, to within rounding error, for every even $n$ (Theorem 11.9). And choose $\sqrt x$ on $[0, 1]$ with Simpson's rule: the ratios are only about 2.8, because the derivatives of $\sqrt x$ are unbounded near 0, and Theorem 11.10 does not apply.
:::

```check
Tw = Rational(1, 8)*(exp(0) + 2*(exp(Rational(1, 4)) + exp(Rational(1, 2)) + exp(Rational(3, 4))) + E)
rounds(Tw, '1.72722'); rounds(E - 1, '1.71828'); holds(Tw > E - 1)
Mw = Rational(1, 4)*sum(exp((k_ + Rational(1, 2))/4) for k_ in range(4)); holds(-0.55 < (E - 1 - Mw)/(E - 1 - Tw) < -0.45)
same(Sq_(lambda X: sympify(X)**3 - sympify(X), 0, 2, 4), integrate(x**3 - x, (x, 0, 2)))
eR = [N(Rational(2, 3) - Sq_(lambda X: sqrt(sympify(X)), 0, 1, n_), 30) for n_ in (4, 8, 16, 32)]
for k_ in range(3):
    holds(2.7 < eR[k_]/eR[k_ + 1] < 2.9)
```

### Which rule to use {#which-rule}

- **A smooth function given by a formula.** Simpson's rule, or a library routine. Doubling $n$ is a practical check: for Simpson's rule the error of $S_{2n}$ is about $\tfrac{1}{15}(S_{2n} - S_n)$, since $S_{2n} - S_n = E_S(n) - E_S(2n) \approx 16E_S(2n) - E_S(2n)$. Library routines go further: they use **adaptive** rules, which keep halving the subintervals only where the integrand changes fast. The widget computes its accurate value of the integral that way, with Simpson's rule.
- **Measurements.** Readings at equally spaced times suit the trapezoidal rule, or Simpson's rule when the number of intervals is even; the midpoint rule needs values at the midpoints, which you usually do not have. Readings at unequal spacing are added up as trapezoids, one interval at a time.
- **A kink or an infinite slope.** The error bounds need a bounded $f''$ or $f^{(4)}$. For $\sqrt x$ on $[0, 1]$, $\big(\sqrt x\big)'' = -\tfrac14x^{-3/2}$ is unbounded near 0, and doubling $n$ divides the errors by only about 2.8. Split the interval at a kink, or remove the trouble with a substitution: $x = t^2$ turns $\int_0^1 \sqrt x\,dx$ into $\int_0^1 2t^2\,dt$, which Simpson's rule integrates exactly.
- **Very many subintervals.** Every value of $f$ carries a rounding error of about $10^{-16}$ of its size (Module 2), and adding up millions of them can add those errors up. A good rule with a moderate $n$ is both faster and more accurate.

```check
Ee = symbols('E_e')
same((16*Ee - Ee)/15, Ee)
same(diff(sqrt(x), x, 2), -x**Rational(-3, 2)/4)
tq = symbols('t', positive=True); same(sqrt(tq**2)*diff(tq**2, tq), 2*tq**2); same(integrate(2*tq**2, (tq, 0, 1)), Rational(2, 3)); same(integrate(sqrt(x), (x, 0, 1)), Rational(2, 3))
same(Sq_(lambda X: 2*sympify(X)**2, 0, 1, 2), Rational(2, 3))
```

::: pitfall
Three slips with Simpson's rule. **(1)** It needs an even number of subintervals: five readings give four intervals and can be used, six readings give five intervals and cannot (use the trapezoidal rule, or Simpson's rule on four of the intervals and a trapezoid for the last). **(2)** The weights are $1, 4, 2, 4, \dots, 2, 4, 1$, starting and ending with 1 and with 4 next to each end. **(3)** The factor in front is $\tfrac{\Delta x}{3}$, not $\tfrac{\Delta x}{2}$ as in the trapezoidal rule.
:::

## What you learned {#summary}

- **Integration by parts** reverses the product rule: $\int u\,dv = uv - \int v\,du$, and $\int_a^b f g'\,dx = \big[fg\big]_a^b - \int_a^b f'g\,dx$ for definite integrals. Choose $u$ to get simpler when differentiated (LIATE is a rough guide) and $dv$ to be integrable. Repeat it, organise the rounds in a table, solve for an integral that comes back ($\int e^x\sin x\,dx$), or derive a reduction formula ($\int \sin^n x\,dx$).
- **Trigonometric integrals**: for $\sin^m x\cos^n x$, save one factor of an odd power and substitute, or use the half-angle identities $\sin^2 x = \tfrac12(1 - \cos 2x)$ and $\cos^2 x = \tfrac12(1 + \cos 2x)$; for $\tan^m x\sec^n x$, save $\sec^2 x$ or $\sec x\tan x$. $\int \sec x\,dx = \ln\abs{\sec x + \tan x} + C$.
- **Trigonometric substitution**: $x = a\sin\theta$, $a\tan\theta$ or $a\sec\theta$ removes $\sqrt{a^2 - x^2}$, $\sqrt{a^2 + x^2}$ or $\sqrt{x^2 - a^2}$; the ranges of $\theta$ make the square roots positive, and a right triangle takes the answer back to $x$. It proves that a circle encloses $\pi r^2$ and an ellipse $\pi ab$.
- **Partial fractions**: divide first if the rational function is improper; then write it as a sum of terms $\dfrac{A}{(x - r)^j}$ and $\dfrac{Bx + C}{(x^2 + px + q)^j}$. The cover-up method finds the coefficients of distinct linear factors, because multiplying by $x - r$ and letting $x \to r$ isolates them.
- **Strategy**: simplify, substitute, classify (parts, trigonometric, substitution, partial fractions, roots), try again. Check every antiderivative by differentiating it.
- **By computer**: SymPy's antiderivatives may differ from yours by a constant, drop absolute values or use complex logarithms; differentiate to check. **Elementary** functions need not have elementary antiderivatives: by Liouville's theorem $e^{-x^2}$, $\tfrac{\sin x}{x}$ and $\tfrac{1}{\ln x}$ have none, and their antiderivatives are named by integrals: $\operatorname{erf}$, $\operatorname{Si}$, $\operatorname{Li}$.
- **Numerical integration**: the midpoint rule $M_n$, the trapezoidal rule $T_n = \tfrac12(L_n + R_n)$ and Simpson's rule $S_n$ ($n$ even, weights $1, 4, 2, \dots, 4, 1$). With $\abs{f''} \le K$, $\abs{E_T} \le \tfrac{K(b - a)^3}{12n^2}$ and $\abs{E_M} \le \tfrac{K(b - a)^3}{24n^2}$; with $\abs{f^{(4)}} \le K$, $\abs{E_S} \le \tfrac{K(b - a)^5}{180n^4}$. Doubling $n$ divides the errors by about 4, 4 and 16; Simpson's rule is exact for cubics; concavity gives the signs of $E_T$ and $E_M$.

## Exercises {#exercises}

:::: exercise Integration by parts {#ex-11-1} ★
Find:

- (a) $\displaystyle\int x\sin 2x\,dx$
- (b) $\displaystyle\int x^2\ln x\,dx$, for $x > 0$
- (c) $\displaystyle\int_0^1 xe^{-x}\,dx$, exactly and to four decimal places

::: solution
**(a)** $u = x$, $dv = \sin 2x\,dx$, so $du = dx$ and $v = -\tfrac12\cos 2x$:

$$\begin{aligned} &\int x\sin 2x\,dx \\ &\quad= -\tfrac12x\cos 2x \\ &\qquad + \tfrac12\int \cos 2x\,dx \\ &\quad= -\tfrac12x\cos 2x + \tfrac14\sin 2x + C. \end{aligned}$$

**(b)** By LIATE, $u = \ln x$ and $dv = x^2\,dx$, so $du = \dfrac{dx}{x}$ and $v = \dfrac{x^3}{3}$:

$$\begin{aligned} &\int x^2\ln x\,dx \\ &\quad= \frac{x^3}{3}\ln x - \int \frac{x^3}{3}\cdot\frac{1}{x}\,dx \\ &\quad= \frac{x^3}{3}\ln x - \frac{x^3}{9} + C. \end{aligned}$$

The other choice, $u = x^2$ and $dv = \ln x\,dx$, needs $v = x\ln x - x$ (Example 11.1(b)) and leads to a harder integral.

**(c)** Example 11.1(a) gives the antiderivative $-xe^{-x} - e^{-x} = -(x + 1)e^{-x}$, so

$$\begin{aligned} \int_0^1 xe^{-x}\,dx &= \big[-(x + 1)e^{-x}\big]_0^1 \\ &= -2e^{-1} + 1 \\ &= 1 - \frac{2}{e} \approx 0.2642. \end{aligned}$$

```check
antideriv(-cos(2*x)/2, sin(2*x), x)
steps(Integral(x*sin(2*x), x), -x*cos(2*x)/2 + Integral(cos(2*x), x)/2, -x*cos(2*x)/2 + sin(2*x)/4)
antideriv(-x*cos(2*x)/2 + sin(2*x)/4, x*sin(2*x), x)
steps(Integral(xp**2*log(xp), xp), xp**3/3*log(xp) - Integral(xp**3/3*(1/xp), xp), xp**3/3*log(xp) - xp**3/9)
antideriv(xp**3*log(xp)/3 - xp**3/9, xp**2*log(xp), xp)
same(-x*exp(-x) - exp(-x), -(x + 1)*exp(-x))
steps(Integral(x*exp(-x), (x, 0, 1)), -(1 + 1)*exp(-1) + (0 + 1)*exp(0), 1 - 2/E); rounds(1 - 2/E, '0.2642')
```
:::
::::

:::: exercise Trigonometric integrals {#ex-11-2} ★
Find:

- (a) $\displaystyle\int \cos^3 x\,dx$
- (b) $\displaystyle\int \sin^2 x\cos^2 x\,dx$
- (c) $\displaystyle\int_0^{\pi/4} \sec^4 x\,dx$

::: solution
**(a)** The power of the cosine is odd: $\cos^3 x = \big(1 - \sin^2 x\big)\cos x$. With $u = \sin x$,

$$\begin{aligned} &\int \big(1 - u^2\big)\,du \\ &\quad= \sin x - \tfrac13\sin^3 x + C. \end{aligned}$$

**(b)** Both powers are even. Use $\sin x\cos x = \tfrac12\sin 2x$, then the half-angle identity with $2x$ in place of $x$:

$$\begin{aligned} \sin^2 x\cos^2 x &= \tfrac14\sin^2 2x \\ &= \tfrac18\big(1 - \cos 4x\big), \end{aligned}$$

so

$$\begin{aligned} &\int \sin^2 x\cos^2 x\,dx \\ &\quad= \frac{x}{8} - \frac{\sin 4x}{32} + C. \end{aligned}$$

**(c)** The power of the secant is even: $\sec^4 x = \big(1 + \tan^2 x\big)\sec^2 x$. With $u = \tan x$, the limits become $\tan 0 = 0$ and $\tan\tfrac{\pi}{4} = 1$:

$$\begin{aligned} &\int_0^{\pi/4} \sec^4 x\,dx \\ &\quad= \int_0^1 \big(1 + u^2\big)\,du \\ &\quad= 1 + \frac13 = \frac43. \end{aligned}$$

```check
same(cos(x)**3, (1 - sin(x)**2)*cos(x)); antideriv(sin(x) - sin(x)**3/3, cos(x)**3, x)
same(sin(x)**2*cos(x)**2, sin(2*x)**2/4); same(sin(2*x)**2/4, (1 - cos(4*x))/8)
antideriv(x/8 - sin(4*x)/32, sin(x)**2*cos(x)**2, x)
same(sec(x)**4, (1 + tan(x)**2)*sec(x)**2); same(tan(pi/4), 1)
steps(Integral(sec(x)**4, (x, 0, pi/4)), Integral(1 + u**2, (u, 0, 1)), 1 + Rational(1, 3), Rational(4, 3))
```
:::
::::

:::: exercise Partial fractions {#ex-11-3} ★
- (a) Find $\displaystyle\int \frac{x + 7}{x^2 - x - 6}\,dx$.
- (b) Evaluate $\displaystyle\int_0^1 \frac{dx}{(x + 1)(x + 2)}$, exactly and to four decimal places.
- (c) Explain why $\displaystyle\int \frac{x^2 + 1}{x^2 - 1}\,dx$ needs long division first, and find it.

::: solution
**(a)** $x^2 - x - 6 = (x - 3)(x + 2)$. Cover-up: the coefficient of $\dfrac{1}{x - 3}$ is $\dfrac{3 + 7}{3 + 2} = 2$, and that of $\dfrac{1}{x + 2}$ is $\dfrac{-2 + 7}{-2 - 3} = -1$. So

$$\begin{aligned} &\int \frac{x + 7}{x^2 - x - 6}\,dx \\ &\quad= 2\ln\abs{x - 3} \\ &\qquad - \ln\abs{x + 2} + C. \end{aligned}$$

**(b)** Cover-up: $\dfrac{1}{(x + 1)(x + 2)} = \dfrac{1}{x + 1} - \dfrac{1}{x + 2}$. On $[0, 1]$ both factors are positive, so

$$\begin{aligned} &\int_0^1 \frac{dx}{(x + 1)(x + 2)} \\ &\quad= \big[\ln(x + 1) - \ln(x + 2)\big]_0^1 \\ &\quad= (\ln 2 - \ln 3) - (0 - \ln 2) \\ &\quad= 2\ln 2 - \ln 3 \\ &\quad= \ln\frac43 \approx 0.2877. \end{aligned}$$

**(c)** The numerator and the denominator have the same degree, 2, so the fraction is improper, and Theorem 11.7 does not apply to it. Divide: $x^2 + 1 = 1\cdot\big(x^2 - 1\big) + 2$, so the integrand is $1 + \dfrac{2}{x^2 - 1}$, and by Example 11.15(b) with $a = 1$,

$$\begin{aligned} &\int \frac{x^2 + 1}{x^2 - 1}\,dx \\ &\quad= x + \ln\Big|\frac{x - 1}{x + 1}\Big| + C. \end{aligned}$$

Trying $\dfrac{A}{x - 1} + \dfrac{B}{x + 1}$ directly fails: that sum is always a proper fraction.

```check
same(factor(x**2 - x - 6), (x - 3)*(x + 2)); same(((x + 7)/(x + 2)).subs(x, 3), 2); same(((x + 7)/(x - 3)).subs(x, -2), -1)
same(apart((x + 7)/(x**2 - x - 6), x), 2/(x - 3) - 1/(x + 2)); antideriv(2*log(x - 3) - log(x + 2), (x + 7)/(x**2 - x - 6), x)
same(apart(1/((x + 1)*(x + 2)), x), 1/(x + 1) - 1/(x + 2))
steps(Integral(1/((x + 1)*(x + 2)), (x, 0, 1)), (log(2) - log(3)) - (0 - log(2)), 2*log(2) - log(3), log(Rational(4, 3))); rounds(log(Rational(4, 3)), '0.2877')
same(div(x**2 + 1, x**2 - 1, x), (1, 2)); same((x**2 + 1)/(x**2 - 1), 1 + 2/(x**2 - 1))
antideriv(x + log((x - 1)/(x + 1)), (x**2 + 1)/(x**2 - 1), x)
holds(Poly(together(a/(x - 1) + b/(x + 1)).as_numer_denom()[0], x).degree() < 2)
```
:::
::::

:::: exercise A power log, revisited {#ex-11-4} ★
In [Exercise 9.9](module_09_EN.html#ex-9-9), a program logged a GPU's power draw every 10 seconds during a one-minute job. The made-up readings were 120, 180, 250, 260, 240, 200 and 150 W at $t = 0, 10, \dots, 60$ s.

- (a) Estimate the energy $E = \int_0^{60} P(t)\,dt$ with the trapezoidal rule and with Simpson's rule.
- (b) Compare the trapezoidal estimate with the left and right sums of Exercise 9.9, 12,500 J and 12,800 J.
- (c) Why can you not use the midpoint rule with 6 subintervals here? Which midpoint estimate can you make, and how is it related to the others?

::: solution
**(a)** There are $n = 6$ intervals of $\Delta t = 10$ s, an even number, so both rules apply:

$$\begin{aligned} T_6 &= \frac{10}{2}\big[120 + 2(180 \\ &\qquad + 250 + 260 + 240 \\ &\qquad + 200) + 150\big] \\ &= 5\cdot 2530 = 12{,}650 \text{ J}, \\ S_6 &= \frac{10}{3}\big[120 + 4\cdot 180 \\ &\qquad + 2\cdot 250 + 4\cdot 260 \\ &\qquad + 2\cdot 240 + 4\cdot 200 \\ &\qquad + 150\big] \\ &= \frac{10}{3}\cdot 3810 \\ &= 12{,}700 \text{ J}. \end{aligned}$$

**(b)** $T_6 = 12{,}650$ J is the average of 12,500 J and 12,800 J, as Definition 11.4 says it must be.

**(c)** $M_6$ needs the power at the midpoints 5, 15, …, 55 s, which were not measured. With 3 subintervals of 20 s, though, the midpoints are 10, 30 and 50 s, which were: $M_3 = 20(180 + 260 + 200) = 12{,}800$ J. With $T_3 = \tfrac{20}{2}(120 + 2\cdot 250 + 2\cdot 240 + 150) = 12{,}500$ J, the relation of Example 11.21 gives back Simpson's estimate: $\tfrac13(T_3 + 2M_3) = \tfrac13(12{,}500 + 25{,}600) = 12{,}700$ J $= S_6$. None of these estimates comes with a guarantee: ten-second readings say nothing about the power between them.

```check
P9 = [120, 180, 250, 260, 240, 200, 150]
same(120 + 2*(180 + 250 + 260 + 240 + 200) + 150, 2530); same(5*2530, 12650); same(Rational(10, 2)*(P9[0] + 2*sum(P9[1:6]) + P9[6]), 12650)
same(sum(c_*p_ for c_, p_ in zip([1, 4, 2, 4, 2, 4, 1], P9)), 3810); same(Rational(10, 3)*3810, 12700)
same((12500 + 12800)/Integer(2), 12650)
M3 = 20*(P9[1] + P9[3] + P9[5]); T3 = 10*(P9[0] + 2*P9[2] + 2*P9[4] + P9[6])
same(M3, 12800); same(T3, 12500); same((T3 + 2*M3)/Integer(3), 12700)
```
:::
::::

:::: exercise Repeated parts {#ex-11-5} ★★
Find:

- (a) $\displaystyle\int x^3e^{-x}\,dx$, with the tabular method
- (b) $\displaystyle\int e^{2x}\cos x\,dx$
- (c) $\displaystyle\int (\ln x)^2\,dx$, for $x > 0$

::: solution
**(a)** Differentiate $x^3$ in column D and integrate $e^{-x}$ in column I:

| Sign | D | I |
|---|---|---|
| $+$ | $x^3$ | $e^{-x}$ |
| $-$ | $3x^2$ | $-e^{-x}$ |
| $+$ | $6x$ | $e^{-x}$ |
| $-$ | $6$ | $-e^{-x}$ |
| | $0$ | $e^{-x}$ |

Multiplying along the diagonals with the signs,

$$\begin{aligned} &\int x^3e^{-x}\,dx \\ &\quad= -x^3e^{-x} - 3x^2e^{-x} \\ &\qquad - 6xe^{-x} - 6e^{-x} + C \\ &\quad= -e^{-x}\big(x^3 + 3x^2 \\ &\qquad + 6x + 6\big) + C. \end{aligned}$$

**(b)** Call it $I$. With $u = \cos x$ and $dv = e^{2x}\,dx$, so $v = \tfrac12e^{2x}$:

$$I = \tfrac12e^{2x}\cos x + \tfrac12\int e^{2x}\sin x\,dx.$$

Again, keeping the roles, with $u = \sin x$: $\int e^{2x}\sin x\,dx = \tfrac12e^{2x}\sin x - \tfrac12I$. So

$$I = \tfrac12e^{2x}\cos x + \tfrac14e^{2x}\sin x - \tfrac14I,$$

and solving, $\tfrac54I = \tfrac14e^{2x}(2\cos x + \sin x)$:

$$\begin{aligned} &\int e^{2x}\cos x\,dx \\ &\quad= \tfrac15e^{2x}(2\cos x + \sin x) + C. \end{aligned}$$

**(c)** $u = (\ln x)^2$ and $dv = dx$, so $du = \dfrac{2\ln x}{x}\,dx$ and $v = x$. Then, with Example 11.1(b),

$$\begin{aligned} &\int (\ln x)^2\,dx \\ &\quad= x(\ln x)^2 - 2\int \ln x\,dx \\ &\quad= x(\ln x)^2 - 2x\ln x \\ &\qquad + 2x + C. \end{aligned}$$

```check
same([diff(x**3, x, k_) for k_ in range(5)], [x**3, 3*x**2, 6*x, 6, 0]); same([diff((-1)**k_*exp(-x), x) for k_ in range(1, 5)], [(-1)**(k_ - 1)*exp(-x) for k_ in range(1, 5)])
same(x**3*(-exp(-x)) - 3*x**2*exp(-x) + 6*x*(-exp(-x)) - 6*exp(-x), -(x**3 + 3*x**2 + 6*x + 6)*exp(-x))
antideriv(-(x**3 + 3*x**2 + 6*x + 6)*exp(-x), x**3*exp(-x), x)
steps(Integral(exp(2*x)*cos(x), x), exp(2*x)*cos(x)/2 + Integral(exp(2*x)*sin(x), x)/2)
steps(Integral(exp(2*x)*sin(x), x), exp(2*x)*sin(x)/2 - Integral(exp(2*x)*cos(x), x)/2)
Ic = symbols('I_c'); same(solve(Eq(Ic, exp(2*x)*cos(x)/2 + exp(2*x)*sin(x)/4 - Ic/4), Ic), [exp(2*x)*(2*cos(x) + sin(x))/5])
antideriv(exp(2*x)*(2*cos(x) + sin(x))/5, exp(2*x)*cos(x), x)
steps(Integral(log(xp)**2, xp), xp*log(xp)**2 - Integral(xp*2*log(xp)/xp, xp), xp*log(xp)**2 - 2*(xp*log(xp) - xp))
antideriv(xp*log(xp)**2 - 2*xp*log(xp) + 2*xp, log(xp)**2, xp)
```
:::
::::

:::: exercise Trigonometric substitutions {#ex-11-6} ★★
- (a) Find $\displaystyle\int \frac{x^2}{\sqrt{9 - x^2}}\,dx$, for $-3 < x < 3$.
- (b) Find $\displaystyle\int \frac{dx}{\big(x^2 + 9\big)^{3/2}}$.
- (c) Evaluate $\displaystyle\int_0^1 \sqrt{1 + x^2}\,dx$, exactly and to four decimal places. (Module 12 shows that it is the length of the parabola $y = \tfrac12x^2$ from $x = 0$ to $x = 1$.)

::: solution
**(a)** $x = 3\sin\theta$ with $-\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}$, so $dx = 3\cos\theta\,d\theta$ and $\sqrt{9 - x^2} = 3\cos\theta$:

$$\begin{aligned} &\int \frac{9\sin^2\theta}{3\cos\theta}\,3\cos\theta\,d\theta \\ &\quad= 9\int \sin^2\theta\,d\theta \\ &\quad= \frac92(\theta - \sin\theta\cos\theta) + C, \end{aligned}$$

by Example 11.7(a). The left triangle of Figure 11.2, with $a = 3$, gives $\sin\theta = \tfrac{x}{3}$ and $\cos\theta = \tfrac{\sqrt{9 - x^2}}{3}$, so

$$\begin{aligned} &\int \frac{x^2}{\sqrt{9 - x^2}}\,dx \\ &\quad= \frac92\arcsin\frac{x}{3} \\ &\qquad - \frac{x}{2}\sqrt{9 - x^2} + C. \end{aligned}$$

**(b)** $x = 3\tan\theta$ with $-\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}$, so $dx = 3\sec^2\theta\,d\theta$ and $\big(x^2 + 9\big)^{3/2} = \big(9\sec^2\theta\big)^{3/2} = 27\sec^3\theta$:

$$\begin{aligned} &\int \frac{3\sec^2\theta}{27\sec^3\theta}\,d\theta \\ &\quad= \frac19\int \cos\theta\,d\theta \\ &\quad= \frac19\sin\theta + C. \end{aligned}$$

The middle triangle gives $\sin\theta = \dfrac{x}{\sqrt{x^2 + 9}}$, so the integral is $\dfrac{x}{9\sqrt{x^2 + 9}} + C$.

**(c)** $x = \tan\theta$, so $dx = \sec^2\theta\,d\theta$ and $\sqrt{1 + x^2} = \sec\theta$; $x = 0$ and $x = 1$ give $\theta = 0$ and $\theta = \tfrac{\pi}{4}$. By Example 11.11,

$$\begin{aligned} &\int_0^1 \sqrt{1 + x^2}\,dx \\ &\quad= \int_0^{\pi/4} \sec^3\theta\,d\theta \\ &\quad= \Big[\tfrac12\sec\theta\tan\theta \\ &\qquad + \tfrac12\ln\abs{\sec\theta + \tan\theta}\Big]_0^{\pi/4} \\ &\quad= \tfrac12\sqrt2 + \tfrac12\ln\big(\sqrt2 + 1\big) \\ &\quad\approx 1.1478, \end{aligned}$$

since $\sec\tfrac{\pi}{4} = \sqrt2$, $\tan\tfrac{\pi}{4} = 1$, and the bracket is 0 at $\theta = 0$.

```check
same(9*sin(theta)**2/(3*cos(theta))*3*cos(theta), 9*sin(theta)**2); antideriv(Rational(9, 2)*(theta - sin(theta)*cos(theta)), 9*sin(theta)**2, theta)
same(cos(asin(x/3)), sqrt(9 - x**2)/3)
antideriv(Rational(9, 2)*asin(x/3) - x*sqrt(9 - x**2)/2, x**2/sqrt(9 - x**2), x)
same(9*tan(theta)**2 + 9, 9*sec(theta)**2); same(3*sec(theta)**2/(27*sec(theta)**3), cos(theta)/9)
same(sin(atan(x/3)), x/sqrt(x**2 + 9)); antideriv(x/(9*sqrt(x**2 + 9)), 1/(x**2 + 9)**Rational(3, 2), x)
same(sec(pi/4), sqrt(2)); same(tan(pi/4), 1); same(sqrt(1 + tan(theta)**2)*sec(theta)**2, sqrt(sec(theta)**2)*sec(theta)**2)
holds(cos(pi/4) > 0); same(diff(cos(theta), theta), -sin(theta))     # cos decreases on [0, pi/4] from 1 to cos(pi/4) > 0, so sec > 0 there
for th_ in (0, Rational(1, 4), Rational(1, 2), Rational(3, 4), pi/4):
    near(sqrt(1 + tan(th_)**2), sec(th_), 1e-25)
Fs3 = sec(theta)*tan(theta)/2 + log(sec(theta) + tan(theta))/2
same(Fs3.subs(theta, pi/4) - Fs3.subs(theta, 0), sqrt(2)/2 + log(sqrt(2) + 1)/2); same(Fs3.subs(theta, 0), 0)
same(integrate(sqrt(1 + x**2), (x, 0, 1)), sqrt(2)/2 + log(1 + sqrt(2))/2); rounds(sqrt(2)/2 + log(1 + sqrt(2))/2, '1.1478')
near(N(Integral(sqrt(1 + x**2), (x, 0, 1)), 30), N(sqrt(2)/2 + log(1 + sqrt(2))/2, 30), 1e-20)
same(sqrt(1 + diff(x**2/2, x)**2), sqrt(1 + x**2))
```
:::
::::

:::: exercise More partial fractions {#ex-11-7} ★★
- (a) Find $\displaystyle\int \frac{x^2 + 2}{x(x + 1)^2}\,dx$.
- (b) Find $\displaystyle\int \frac{3x + 1}{x^3 + x}\,dx$.
- (c) In a model of a population $y$ that cannot exceed a size $K > 0$ (Module 13), the integral $\displaystyle\int \frac{dy}{y(K - y)}$ appears, for $0 < y < K$. Find it.

::: solution
**(a)** By Theorem 11.7, $\dfrac{x^2 + 2}{x(x + 1)^2} = \dfrac{A}{x} + \dfrac{B}{x + 1} + \dfrac{D}{(x + 1)^2}$. Cover-up: $A = \dfrac{0 + 2}{(0 + 1)^2} = 2$, and for the highest power of $x + 1$, $D = \dfrac{1 + 2}{-1} = -3$. Multiplying by the denominator, $x^2 + 2 = A(x + 1)^2 + Bx(x + 1) + Dx$, and the coefficients of $x^2$ give $1 = A + B$, so $B = -1$. So

$$\begin{aligned} &\int \frac{x^2 + 2}{x(x + 1)^2}\,dx \\ &\quad= \int \Big(\frac2x - \frac{1}{x + 1} \\ &\qquad - \frac{3}{(x + 1)^2}\Big)\,dx \\ &\quad= 2\ln\abs{x} - \ln\abs{x + 1} \\ &\qquad + \frac{3}{x + 1} + C. \end{aligned}$$

**(b)** $x^3 + x = x\big(x^2 + 1\big)$, with $x^2 + 1$ irreducible: $\dfrac{3x + 1}{x(x^2 + 1)} = \dfrac{A}{x} + \dfrac{Bx + D}{x^2 + 1}$. Cover-up: $A = \dfrac{1}{1} = 1$. Then $3x + 1 = \big(x^2 + 1\big) + (Bx + D)x$; the coefficients of $x^2$ give $0 = 1 + B$, so $B = -1$, and those of $x$ give $D = 3$. So

$$\begin{aligned} &\int \frac{3x + 1}{x^3 + x}\,dx \\ &\quad= \int \Big(\frac1x - \frac{x}{x^2 + 1} \\ &\qquad + \frac{3}{x^2 + 1}\Big)\,dx \\ &\quad= \ln\abs{x} - \tfrac12\ln\big(x^2 + 1\big) \\ &\qquad + 3\arctan x + C. \end{aligned}$$

**(c)** The two factors $y$ and $K - y = -(y - K)$ are distinct linear factors. Cover-up: at $y = 0$ the coefficient of $\dfrac1y$ is $\dfrac{1}{K}$, and covering up $K - y$ and putting $y = K$ gives the coefficient $\dfrac1K$ of $\dfrac{1}{K - y}$. So

$$\frac{1}{y(K - y)} = \frac1K\Big(\frac1y + \frac{1}{K - y}\Big),$$

and, since $y > 0$ and $K - y > 0$, and $\int \frac{dy}{K - y} = -\ln(K - y) + C$ (substitute $w = K - y$),

$$\begin{aligned} &\int \frac{dy}{y(K - y)} \\ &\quad= \frac{\ln y - \ln(K - y)}{K} + C \\ &\quad= \frac1K\ln\frac{y}{K - y} + C. \end{aligned}$$

```check
same(((x**2 + 2)/(x + 1)**2).subs(x, 0), 2); same(((x**2 + 2)/x).subs(x, -1), -3)
same(solve(Poly(expand(2*(x + 1)**2 + Bq*x*(x + 1) - 3*x - (x**2 + 2)), x).all_coeffs(), [Bq]), {Bq: -1})
same(apart((x**2 + 2)/(x*(x + 1)**2), x), 2/x - 1/(x + 1) - 3/(x + 1)**2)
antideriv(2*log(x) - log(x + 1) + 3/(x + 1), (x**2 + 2)/(x*(x + 1)**2), x)
same(solve(Poly(expand((x**2 + 1) + (Bq*x + Dq)*x - (3*x + 1)), x).all_coeffs(), [Bq, Dq]), {Bq: -1, Dq: 3})
same(apart((3*x + 1)/(x**3 + x), x), 1/x - x/(x**2 + 1) + 3/(x**2 + 1))
antideriv(log(x) - log(x**2 + 1)/2 + 3*atan(x), (3*x + 1)/(x**3 + x), x)
Kp = symbols('K', positive=True)
same(1/(y*(Kp - y)), (1/Kp)*(1/y + 1/(Kp - y))); antideriv(-log(Kp - y), 1/(Kp - y), y)
antideriv(log(y/(Kp - y))/Kp, 1/(y*(Kp - y)), y)
```
:::
::::

:::: exercise Choosing a method {#ex-11-8} ★★
Choose a method for each integral, and evaluate it.

- (a) $\displaystyle\int x\cos\big(x^2\big)\,dx$
- (b) $\displaystyle\int x^2\cos x\,dx$
- (c) $\displaystyle\int \frac{dx}{x^2 + 2x + 2}$
- (d) $\displaystyle\int \frac{x}{\sqrt{1 - x^4}}\,dx$, for $-1 < x < 1$

::: solution
**(a)** A function of $x^2$ times $x$, half the derivative of $x^2$: substitute $u = x^2$, $du = 2x\,dx$, to get $\tfrac12\int \cos u\,du = \tfrac12\sin\big(x^2\big) + C$. Parts would only make it worse.

**(b)** A power times a cosine: parts, twice (tabular). With the signs $+, -, +$ and the antiderivatives $\sin x$, $-\cos x$, $-\sin x$ of $\cos x$,

$$\begin{aligned} &\int x^2\cos x\,dx \\ &\quad= x^2\sin x + 2x\cos x \\ &\qquad - 2\sin x + C. \end{aligned}$$

**(c)** A rational function with an irreducible denominator: $2^2 - 4\cdot 2 = -4 < 0$. Complete the square, $x^2 + 2x + 2 = (x + 1)^2 + 1$, and substitute $u = x + 1$:

$$\begin{aligned} &\int \frac{dx}{x^2 + 2x + 2} \\ &\quad= \int \frac{du}{u^2 + 1} \\ &\quad= \arctan(x + 1) + C. \end{aligned}$$

**(d)** It looks like a trigonometric substitution, but a substitution comes first: $x^4 = \big(x^2\big)^2$, and $x$ is half the derivative of $x^2$. With $u = x^2$, $du = 2x\,dx$, and $0 \le u < 1$,

$$\begin{aligned} &\int \frac{x}{\sqrt{1 - x^4}}\,dx \\ &\quad= \frac12\int \frac{du}{\sqrt{1 - u^2}} \\ &\quad= \frac12\arcsin\big(x^2\big) + C. \end{aligned}$$

```check
antideriv(sin(u)/2, cos(u)/2, u); antideriv(sin(x**2)/2, x*cos(x**2), x)
same([diff(x**2, x, k_) for k_ in range(3)], [x**2, 2*x, 2]); same([diff(F_, x) for F_ in (sin(x), -cos(x), -sin(x))], [cos(x), sin(x), -cos(x)])
same(x**2*sin(x) - 2*x*(-cos(x)) + 2*(-sin(x)), x**2*sin(x) + 2*x*cos(x) - 2*sin(x)); antideriv(x**2*sin(x) + 2*x*cos(x) - 2*sin(x), x**2*cos(x), x)
same(2**2 - 4*2, -4); same(expand((x + 1)**2 + 1), x**2 + 2*x + 2); antideriv(atan(x + 1), 1/(x**2 + 2*x + 2), x)
same(diff(x**2, x), 2*x); antideriv(asin(u)/2, 1/(2*sqrt(1 - u**2)), u); antideriv(asin(x**2)/2, x/sqrt(1 - x**4), x)
```
:::
::::

:::: exercise How many subintervals? {#ex-11-9} ★★
Let $f(x) = e^{-x^2}$.

- (a) Find $f''(x)$ and $f^{(4)}(x)$, and show that $\abs{f''(x)} \le 2$ and $\abs{f^{(4)}(x)} \le 20$ for $0 \le x \le 1$.
- (b) How large must $n$ be to guarantee that $T_n$, and that $S_n$, approximates $\int_0^1 e^{-x^2}\,dx$ with an error of at most $10^{-6}$?
- (c) Compare with the errors printed in the Compute it box of Section 11.7.

::: solution
**(a)** By the chain and product rules, $f'(x) = -2xe^{-x^2}$ and $f''(x) = \big(4x^2 - 2\big)e^{-x^2}$; differentiating twice more, $f'''(x) = \big(12x - 8x^3\big)e^{-x^2}$ and $f^{(4)}(x) = \big(16x^4 - 48x^2 + 12\big)e^{-x^2}$. For $0 \le x \le 1$, $0 < e^{-x^2} \le 1$. And $4x^2 - 2$ lies between $-2$ and 2, so $\abs{f''(x)} \le 2$. With $s = x^2$, which lies in $[0, 1]$, the polynomial $16s^2 - 48s + 12$ has derivative $32s - 48 < 0$, so it decreases from 12 at $s = 0$ to $-20$ at $s = 1$; so $\abs{16x^4 - 48x^2 + 12} \le 20$, and $\abs{f^{(4)}(x)} \le 20$.

**(b)** Trapezoidal rule, with $K = 2$ and $b - a = 1$: $\dfrac{2}{12n^2} \le 10^{-6}$ needs $n^2 \ge 166{,}667$, so $n = 409$ suffices, as in Example 11.20. Simpson's rule, with $K = 20$: $\dfrac{20}{180n^4} \le 10^{-6}$ needs $n^4 \ge 111{,}112$, that is, $n \ge 18.26$; with $n$ even, $n = 20$ suffices.

**(c)** The box shows $\abs{E_T} \approx 1.5 \times 10^{-5}$ at $n = 64$, still too big; since the errors fall like $\tfrac{1}{n^2}$, the trapezoidal rule reaches $10^{-6}$ near $n = 250$, before the guaranteed 409. Simpson's rule already has $\abs{E_S} \approx 1.25 \times 10^{-7}$ at $n = 16$ and about $2 \times 10^{-6}$ at $n = 8$, so $n = 16$ is enough, a little before the guaranteed 20. The bounds are guarantees, and cautious ones: $\abs{f^{(4)}}$ is in fact at most 12 on $[0, 1]$, which would give $n = 18$.

```check
fe_ = exp(-x**2)
same(diff(fe_, x), -2*x*exp(-x**2)); same(diff(fe_, x, 2), (4*x**2 - 2)*exp(-x**2)); same(diff(fe_, x, 3), (12*x - 8*x**3)*exp(-x**2)); same(diff(fe_, x, 4), (16*x**4 - 48*x**2 + 12)*exp(-x**2))
same(function_range(4*x**2 - 2, x, Interval(0, 1)), Interval(-2, 2)); holds(exp(-Rational(1, 1)) > 0)
same(diff(4*x**2 - 2, x), 8*x); same((4*x**2 - 2).subs(x, 0), -2); same((4*x**2 - 2).subs(x, 1), 2)   # increasing on [0, 1]
sq_ = symbols('s'); same(diff(16*sq_**2 - 48*sq_ + 12, sq_), 32*sq_ - 48); same((16*sq_**2 - 48*sq_ + 12).subs(sq_, 0), 12); same((16*sq_**2 - 48*sq_ + 12).subs(sq_, 1), -20)
same(function_range(16*sq_**2 - 48*sq_ + 12, sq_, Interval(0, 1)), Interval(-20, 12))
holds(Rational(2*10**6, 12) > 166666); holds(Rational(2, 12*409**2) <= Rational(1, 10**6)); holds(Rational(2, 12*408**2) > Rational(1, 10**6))
holds(Rational(20*10**6, 180) > 111111); rounds(Rational(20*10**6, 180)**Rational(1, 4), '18.26')
holds(Rational(20, 180*20**4) <= Rational(1, 10**6)); holds(Rational(20, 180*18**4) > Rational(1, 10**6))
rounds(abs(eT[4]), '1.5e-5'); rounds(abs(eS[2]), '1.25e-7'); rounds(abs(eS[1]), '2e-6')
nT = sqrt(abs(eT[0])*16/Rational(1, 10**6)); holds(240 < nT < 260)
holds(abs(eS[2]) < 1e-6); holds(abs(eS[1]) > 1e-6)
fe4 = (16*x**4 - 48*x**2 + 12)*exp(-x**2); same(maximum(fe4, x, Interval(0, 1)), 12); holds(minimum(fe4, x, Interval(0, 1)) > -12)
same(diff(fe4, x), -8*x*(4*x**4 - 20*x**2 + 15)*exp(-x**2)); holds(all(-12 < fe4.subs(x, Rational(k_, 100)) <= 12 for k_ in range(101)))
holds(Rational(12, 180*18**4) <= Rational(1, 10**6)); holds(Rational(12, 180*16**4) > Rational(1, 10**6))
```
:::
::::

:::: exercise Wallis's integrals {#ex-11-10} ★★★
Let $I_n = \displaystyle\int_0^{\pi/2} \sin^n x\,dx$ for $n = 0, 1, 2, \dots$

- (a) Show that $I_0 = \tfrac{\pi}{2}$, $I_1 = 1$, and $I_n = \dfrac{n - 1}{n}I_{n-2}$ for $n \ge 2$.
- (b) Find $I_5$ and $I_6$.
- (c) Prove that $nI_nI_{n-1} = \dfrac{\pi}{2}$ for every $n \ge 1$.

::: solution
**(a)** $I_0 = \int_0^{\pi/2} 1\,dx = \tfrac{\pi}{2}$ and $I_1 = \big[-\cos x\big]_0^{\pi/2} = 0 + 1 = 1$. For $n \ge 2$, Theorem 11.3 in its definite form (Example 11.7(c)) gives

$$\begin{aligned} I_n &= \Big[-\frac{\sin^{n-1}x\cos x}{n}\Big]_0^{\pi/2} \\ &\quad + \frac{n - 1}{n}I_{n-2}, \end{aligned}$$

and the bracket is 0: at $x = \tfrac{\pi}{2}$ because $\cos\tfrac{\pi}{2} = 0$, and at $x = 0$ because $\sin 0 = 0$ and $n - 1 \ge 1$.

**(b)** $I_5 = \tfrac45\cdot\tfrac23\cdot I_1 = \tfrac{8}{15}$ and $I_6 = \tfrac56\cdot\tfrac34\cdot\tfrac12\cdot I_0 = \tfrac{15}{48}\cdot\tfrac{\pi}{2} = \tfrac{5\pi}{32} \approx 0.4909$.

**(c)** By induction on $n$. For $n = 1$: $1\cdot I_1I_0 = \tfrac{\pi}{2}$. Suppose $nI_nI_{n-1} = \tfrac{\pi}{2}$ for some $n \ge 1$. By (a), $I_{n+1} = \tfrac{n}{n + 1}I_{n-1}$, so

$$\begin{aligned} &(n + 1)I_{n+1}I_n \\ &\quad= (n + 1)\cdot\frac{n}{n + 1}I_{n-1}\cdot I_n \\ &\quad= nI_nI_{n-1} = \frac{\pi}{2}. \end{aligned}$$

So the statement holds for every $n \ge 1$.

```check
Iw = [integrate(sin(x)**k_, (x, 0, pi/2)) for k_ in range(8)]
same(Iw[0], pi/2); same(Iw[1], 1); same(-cos(pi/2) + cos(0), 1)
for k_ in range(2, 8):
    same(Iw[k_], Rational(k_ - 1, k_)*Iw[k_ - 2]); same((-sin(x)**(k_ - 1)*cos(x)/k_).subs(x, pi/2) - (-sin(x)**(k_ - 1)*cos(x)/k_).subs(x, 0), 0)
same(Iw[5], Rational(8, 15)); same(Rational(4, 5)*Rational(2, 3), Rational(8, 15)); same(Iw[6], 5*pi/32); same(Rational(15, 48)*pi/2, 5*pi/32); rounds(5*pi/32, '0.4909')
for k_ in range(1, 8):
    same(k_*Iw[k_]*Iw[k_ - 1], pi/2)
nI = symbols('n', positive=True); I1_, I2_ = symbols('I_1 I_2')
same((nI + 1)*(nI/(nI + 1))*I1_*I2_, nI*I1_*I2_)
```
:::
::::

:::: exercise Simpson's rule and x⁴ {#ex-11-11} ★★★
- (a) Show that Simpson's rule with $n = 2$ gives the exact values of $\int_{-1}^{1} x^3\,dx$ and $\int_0^2 x^3\,dx$, but not of $\int_{-1}^{1} x^4\,dx$.
- (b) Find the error $E_S$ for $\int_{-1}^{1} x^4\,dx$ with $n = 2$, and compare it with the bound of Theorem 11.10.
- (c) Do the same with $n = 4$. What do you conclude about the bound?

::: solution
**(a)** With $n = 2$ on $[-1, 1]$, $\Delta x = 1$ and $S_2 = \tfrac13\big[f(-1) + 4f(0) + f(1)\big]$. For $x^3$: $\tfrac13(-1 + 0 + 1) = 0 = \int_{-1}^{1} x^3\,dx$. On $[0, 2]$: $\tfrac13(0 + 4\cdot 1 + 8) = 4 = \int_0^2 x^3\,dx$. For $x^4$: $S_2 = \tfrac13(1 + 0 + 1) = \tfrac23$, but $\int_{-1}^{1} x^4\,dx = \tfrac25$.

**(b)** $E_S = \tfrac25 - \tfrac23 = -\tfrac{4}{15}$. The fourth derivative of $x^4$ is the constant 24, so $K = 24$, and the bound is

$$\frac{24\cdot 2^5}{180\cdot 2^4} = \frac{768}{2880} = \frac{4}{15}.$$

The error equals the bound.

**(c)** With $n = 4$, $\Delta x = \tfrac12$ and the points $-1, -\tfrac12, 0, \tfrac12, 1$:

$$\begin{aligned} S_4 &= \frac{1}{6}\Big[1 + 4\cdot\frac{1}{16} + 0 \\ &\qquad + 4\cdot\frac{1}{16} + 1\Big] \\ &= \frac16\cdot\frac52 = \frac{5}{12}, \end{aligned}$$

so $E_S = \tfrac25 - \tfrac{5}{12} = -\tfrac{1}{60}$, exactly 16 times smaller than with $n = 2$. The bound is $\dfrac{24\cdot 2^5}{180\cdot 4^4} = \dfrac{1}{60}$: equal to the error again. So the constant 180 in Theorem 11.10 cannot be replaced by a larger number: for $x^4$ the bound is attained. (The same happens for $x^2$ with the bounds of Theorem 11.8.)

```check
same(Sq_(lambda X: sympify(X)**3, -1, 1, 2), 0); same(integrate(x**3, (x, -1, 1)), 0)
same(Sq_(lambda X: sympify(X)**3, 0, 2, 2), 4); same(Rational(1, 3)*(0 + 4 + 8), 4); same(integrate(x**3, (x, 0, 2)), 4)
same(Sq_(lambda X: sympify(X)**4, -1, 1, 2), Rational(2, 3)); same(integrate(x**4, (x, -1, 1)), Rational(2, 5))
same(Rational(2, 5) - Rational(2, 3), -Rational(4, 15)); same(diff(x**4, x, 4), 24); same(Rational(24*2**5, 180*2**4), Rational(4, 15)); same(Rational(768, 2880), Rational(4, 15))
same(Sq_(lambda X: sympify(X)**4, -1, 1, 4), Rational(5, 12)); same(Rational(1, 6)*(1 + Rational(4, 16) + 0 + Rational(4, 16) + 1), Rational(5, 12))
same(Rational(2, 5) - Rational(5, 12), -Rational(1, 60)); same((-Rational(4, 15))/(-Rational(1, 60)), 16); same(Rational(24*2**5, 180*4**4), Rational(1, 60))
same(integrate(x**2, (x, 0, 1)) - Mq_(lambda X: sympify(X)**2, 0, 1, 3), Rational(2, 24*9))     # midpoint: error = bound for x^2
same(Tq_(lambda X: sympify(X)**2, 0, 1, 3) - integrate(x**2, (x, 0, 1)), Rational(2, 12*9))     # trapezoid: |error| = bound for x^2
```
:::
::::

:::: exercise The midpoint error {#ex-11-12} ★★★
This exercise proves the midpoint half of Theorem 11.8. Centre a subinterval at 0: for a subinterval $[m - h, m + h]$, apply what follows to $g(t) = f(m + t)$, whose integral over $[-h, h]$ is the integral of $f$ over $[m - h, m + h]$. So let $f''$ be continuous on $[-h, h]$, where $h > 0$.

- (a) Integrate by parts twice to show that
  $$\begin{aligned} &\int_0^h f(x)\,dx \\ &\quad= hf(0) + \frac{h^2}{2}f'(0) \\ &\qquad + \frac12\int_0^h (h - x)^2 f''(x)\,dx. \end{aligned}$$
  (Start with $u = f(x)$ and $dv = dx$, taking $v = x - h$.)
- (b) Find the corresponding formula for $\int_{-h}^0 f(x)\,dx$, and deduce that
  $$\begin{aligned} &\int_{-h}^{h} f(x)\,dx - 2hf(0) \\ &\quad= \frac12\int_{-h}^{h} \big(h - \abs{x}\big)^2 f''(x)\,dx. \end{aligned}$$
- (c) Deduce the bound for $\abs{E_M}$ in Theorem 11.8, and that $M_n \le \int_a^b f(x)\,dx$ when $f'' \ge 0$.

::: solution
**(a)** With $u = f(x)$, $dv = dx$ and $v = x - h$, which is 0 at $x = h$,

$$\begin{aligned} &\int_0^h f\,dx \\ &\quad= \big[f(x)(x - h)\big]_0^h \\ &\qquad - \int_0^h f'(x)(x - h)\,dx \\ &\quad= hf(0) \\ &\qquad + \int_0^h (h - x)f'(x)\,dx. \end{aligned}$$

Again, with $u = f'(x)$ and $dv = (h - x)\,dx$, so that $v = -\tfrac12(h - x)^2$:

$$\begin{aligned} &\int_0^h (h - x)f'(x)\,dx \\ &\quad= \Big[-\tfrac12(h - x)^2f'(x)\Big]_0^h \\ &\qquad + \frac12\int_0^h (h - x)^2f''(x)\,dx \\ &\quad= \frac{h^2}{2}f'(0) \\ &\qquad + \frac12\int_0^h (h - x)^2f''(x)\,dx. \end{aligned}$$

Putting this into the first result gives the formula.

**(b)** In the same way, with $v = x + h$ and then $v = \tfrac12(x + h)^2$,

$$\begin{aligned} &\int_{-h}^0 f\,dx \\ &\quad= hf(0) - \frac{h^2}{2}f'(0) \\ &\qquad + \frac12\int_{-h}^0 (x + h)^2f''(x)\,dx. \end{aligned}$$

Add the two formulas: the terms in $f'(0)$ cancel. On $[0, h]$, $h - x = h - \abs{x}$, and on $[-h, 0]$, $x + h = h - \abs{x}$, so the two integrals combine into the one stated.

**(c)** $2hf(0)$ is the midpoint rule on $[-h, h]$, a subinterval of width $w = 2h$, so the left side of (b) is the error of the midpoint rule on one subinterval. The weight $\tfrac12(h - \abs{x})^2$ is at least 0, and

$$\begin{aligned} &\frac12\int_{-h}^{h} \big(h - \abs{x}\big)^2\,dx \\ &\quad= \int_0^h (h - x)^2\,dx \\ &\quad= \frac{h^3}{3} = \frac{w^3}{24}. \end{aligned}$$

So, if $\abs{f''} \le K$, the comparison theorem bounds the error of one subinterval by $\tfrac{Kw^3}{24}$, and adding up $n$ subintervals of width $\tfrac{b - a}{n}$ gives $\abs{E_M} \le \tfrac{K(b - a)^3}{24n^2}$. If $f'' \ge 0$, each error is at least 0, so $E_M \ge 0$, that is, $M_n \le \int_a^b f(x)\,dx$.

```check
for fk in (x**5, exp(x), sin(3*x), cos(x)**2):
    same(integrate(fk, (x, 0, hq)), hq*fk.subs(x, 0) + hq**2/2*diff(fk, x).subs(x, 0) + integrate((hq - x)**2*diff(fk, x, 2), (x, 0, hq))/2)
    same(integrate(fk, (x, -hq, 0)), hq*fk.subs(x, 0) - hq**2/2*diff(fk, x).subs(x, 0) + integrate((x + hq)**2*diff(fk, x, 2), (x, -hq, 0))/2)
    same(integrate(fk, (x, -hq, hq)) - 2*hq*fk.subs(x, 0), (integrate((hq - x)**2*diff(fk, x, 2), (x, 0, hq)) + integrate((hq + x)**2*diff(fk, x, 2), (x, -hq, 0)))/2)
same(diff(x - hq, x), 1); same((x - hq).subs(x, hq), 0); same(-((x - hq).subs(x, 0)), hq); same(diff(-(hq - x)**2/2, x), hq - x)
same(diff(x + hq, x), 1); same((x + hq).subs(x, -hq), 0); same(diff((x + hq)**2/2, x), x + hq)
same(Rational(1, 2)*(integrate((hq - x)**2, (x, 0, hq)) + integrate((hq + x)**2, (x, -hq, 0))), hq**3/3)
same(integrate((hq - x)**2, (x, 0, hq)), hq**3/3); same(hq**3/3, (2*hq)**3/24)
near(N(Integral((1 - Abs(x))**2, (x, -1, 1)), 30)/2, Rational(1, 3), 1e-12)                  # h = 1, with the absolute value, numerically
same(integrate(sin(mq + t), (t, -hq, hq)), integrate(sin(x), (x, mq - hq, mq + hq)))      # translation: g(t) = f(m + t), an instance
same(nq*(Kq/24)*((bq_ - aq)/nq)**3, Kq*(bq_ - aq)**3/(24*nq**2))
```
:::
::::

## Check yourself {#quiz}

```quiz
? Which choice of $u$ and $dv$ makes $\displaystyle\int xe^{3x}\,dx$ easier?
- [ ] $u = e^{3x}$, $dv = x\,dx$
- [x] $u = x$, $dv = e^{3x}\,dx$
- [ ] $u = xe^{3x}$, $dv = dx$
- [ ] $u = 3x$, $dv = e^{x}\,dx$
> With $u = x$, $du = dx$ and $v = \tfrac13e^{3x}$, the new integral $\int \tfrac13e^{3x}\,dx$ is easy, and the answer is $\tfrac13xe^{3x} - \tfrac19e^{3x} + C$. With $u = e^{3x}$ and $dv = x\,dx$, the new integral is $\int \tfrac12x^2\cdot 3e^{3x}\,dx$: the power of $x$ goes up. With $u = xe^{3x}$ and $dv = dx$, the new integral $\int x\big(e^{3x} + 3xe^{3x}\big)\,dx$ is worse. And $3x\cdot e^x$ is not the integrand at all.

? The best first step for $\displaystyle\int \sin^3 x\cos^2 x\,dx$ is
- [x] to write $\sin^3 x = \big(1 - \cos^2 x\big)\sin x$ and substitute $u = \cos x$
- [ ] to use the half-angle identities
- [ ] to substitute $u = \sin x$
- [ ] to integrate by parts with $u = \sin^3 x$
> The power of the sine is odd, so save one $\sin x$ for $du = -\sin x\,dx$ and write the rest in terms of $\cos x$: the integral becomes $-\int \big(1 - u^2\big)u^2\,du$. The half-angle identities are for even powers. $u = \sin x$ needs a spare factor $\cos x$ with the rest even, but the power of the cosine here is even. Parts could work only with much more effort.

? Which substitution suits $\displaystyle\int \frac{dx}{x^2\sqrt{x^2 + 16}}$?
- [ ] $x = 4\sin\theta$
- [ ] $x = 4\sec\theta$
- [x] $x = 4\tan\theta$
- [ ] $x = 16\tan\theta$
> $\sqrt{x^2 + a^2}$ with $a = 4$ calls for $x = 4\tan\theta$, since $16\tan^2\theta + 16 = 16\sec^2\theta$. The sine suits $\sqrt{16 - x^2}$ and the secant $\sqrt{x^2 - 16}$. $x = 16\tan\theta$ uses $a^2$ instead of $a$: $256\tan^2\theta + 16$ is not a perfect square.

? The form of the partial fraction decomposition of $\dfrac{x + 3}{x^2(x - 1)}$ is
- [ ] $\dfrac{A}{x^2} + \dfrac{B}{x - 1}$
- [ ] $\dfrac{A}{x} + \dfrac{B}{x - 1}$
- [ ] $\dfrac{A}{x^2(x - 1)}$
- [x] $\dfrac{A}{x} + \dfrac{B}{x^2} + \dfrac{C}{x - 1}$
> The factor $x$ is repeated, so it needs a term for each power, $x$ and $x^2$ (Theorem 11.7); here $A = -4$, $B = -3$ and $C = 4$. Leaving out either power gives equations with no solution, and $\dfrac{A}{x^2(x - 1)}$ with a constant $A$ cannot equal a fraction whose numerator is $x + 3$.

? You find $\displaystyle\int \frac{dx}{\sqrt{x^2 + 4}} = \ln\big(x + \sqrt{x^2 + 4}\big) + C$, and SymPy prints `asinh(x/2)`. Which is true?
- [ ] Your answer is wrong
- [x] Both are right: they differ by the constant $\ln 2$
- [ ] SymPy's answer is wrong
- [ ] They cannot both be right, because they are different functions
> $\operatorname{arsinh}\dfrac{x}{2} = \ln\Big(\dfrac{x}{2} + \sqrt{\dfrac{x^2}{4} + 1}\Big) = \ln\big(x + \sqrt{x^2 + 4}\big) - \ln 2$. Antiderivatives on an interval may differ by a constant, so both are right; differentiating either gives $\dfrac{1}{\sqrt{x^2 + 4}}$. Different functions can be antiderivatives of the same function, which is what "$+\,C$" says.

? Which of these integrands has no elementary antiderivative?
- [ ] $xe^{-x^2}$
- [ ] $x^2e^{-x}$
- [x] $e^{-x^2}$
- [ ] $e^{-2x}$
> By Liouville's theorem, $e^{-x^2}$ has none; its antiderivatives are $\tfrac{\sqrt\pi}{2}\operatorname{erf} x + C$. The others are elementary: $-\tfrac12e^{-x^2}$ by substitution, $-\big(x^2 + 2x + 2\big)e^{-x}$ by parts twice, and $-\tfrac12e^{-2x}$ from the table.

? If $\abs{f''(x)} \le 3$ on $[0, 2]$, the error bound of Theorem 11.8 for $T_{10}$ is
- [x] $0.02$
- [ ] $0.01$
- [ ] $0.2$
- [ ] $0.002$
> $\dfrac{K(b - a)^3}{12n^2} = \dfrac{3\cdot 2^3}{12\cdot 10^2} = \dfrac{24}{1200} = 0.02$. 0.01 is the bound for the midpoint rule, which has 24 in place of 12. 0.2 divides by $n$ instead of $n^2$, and 0.002 by $n^3$.

? For a function with a continuous fourth derivative, doubling $n$ in Simpson's rule divides the error by about
- [ ] 2
- [ ] 4
- [ ] 8
- [x] 16
> The bound $\dfrac{K(b - a)^5}{180n^4}$ is divided by $2^4 = 16$ when $n$ doubles, and the actual errors follow it, as the Compute it box and the widget show. 4 is the factor for the midpoint and trapezoidal rules, whose bounds shrink like $\tfrac{1}{n^2}$; 2 is the factor for left and right sums.
```

```check
antideriv(x*exp(3*x)/3 - exp(3*x)/9, x*exp(3*x), x)
steps(Integral(x*exp(3*x), x), x**2/2*exp(3*x) - Integral(x**2/2*3*exp(3*x), x))
steps(Integral(x*exp(3*x), x), x*exp(3*x)*x - Integral(x*(exp(3*x) + 3*x*exp(3*x)), x))
same(sin(x)**3*cos(x)**2, (1 - cos(x)**2)*sin(x)*cos(x)**2); antideriv(-(u**3/3 - u**5/5), -(1 - u**2)*u**2, u)
antideriv(-cos(x)**3/3 + cos(x)**5/5, sin(x)**3*cos(x)**2, x)
same(16*tan(theta)**2 + 16, 16*sec(theta)**2); holds(Ne(sqrt(256*tan(Rational(1, 3))**2 + 16), 16*sec(Rational(1, 3))))
same(apart((x + 3)/(x**2*(x - 1)), x), -4/x - 3/x**2 + 4/(x - 1))
same(solve(Poly(expand(Aq*(x - 1) + Bq*x**2 - (x + 3)), x).all_coeffs(), [Aq, Bq]), []); same(solve(Poly(expand(Aq*x*(x - 1) + Bq*x**2 - (x + 3)), x).all_coeffs(), [Aq, Bq]), [])
same(asinh(xr2/2).rewrite(log), log(xr2 + sqrt(xr2**2 + 4)) - log(2)); same(diff(asinh(x/2), x), 1/sqrt(x**2 + 4))
same(integrate(exp(-x**2), x), sqrt(pi)*erf(x)/2); antideriv(-exp(-x**2)/2, x*exp(-x**2), x)
antideriv(-(x**2 + 2*x + 2)*exp(-x), x**2*exp(-x), x); antideriv(-exp(-2*x)/2, exp(-2*x), x)
same(Rational(3*2**3, 12*10**2), Rational(2, 100)); same(Rational(3*2**3, 24*10**2), Rational(1, 100)); same(Rational(3*2**3, 12*10), Rational(2, 10)); same(Rational(3*2**3, 12*10**3), Rational(2, 1000))
same(Rational(1, 2**4), Rational(1, 16))
```
