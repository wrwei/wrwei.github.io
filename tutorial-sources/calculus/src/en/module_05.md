---
title: Rules of differentiation
part: 2
lead: Differentiate products, quotients, trigonometric functions and compositions by rule instead of by limit, know why each rule is true, and check your answers by hand, on a graph and with SymPy. You will also see how a program differentiates another program exactly, with dual numbers.
minutes: 255
needs: Modules 1 to 4, in particular the derivative and its first rules (Module 4)
goals:
  - Prove and use the product and quotient rules, and extend the power rule to negative integers
  - Differentiate the six trigonometric functions, starting from the limits of Module 2
  - Recognise a composition and differentiate it with the chain rule, through chains of any length
  - Combine the rules systematically, and simplify and check the results
  - Use SymPy to differentiate, and decide whether two different-looking answers are equal
  - Explain how automatic differentiation with dual numbers computes exact derivatives
---

## Building derivatives from pieces {#pieces}

Module 4 defined the derivative of a function $f$ at $x$ as a limit,

$$f'(x) = \lim_{h\to0}\frac{f(x + h) - f(x)}{h},$$

and worked it out for the simplest functions: a constant has derivative 0, and $\dfrac{d}{dx}x^n = nx^{n-1}$ for every positive integer $n$ (the **power rule**). It also proved two rules that build new derivatives from old ones: the derivative of a sum or a difference is the sum or difference of the derivatives, $(f \pm g)' = f' \pm g'$, and a constant factor stays where it is, $(cf)' = cf'$. With these, every polynomial can be differentiated term by term:

$$\frac{d}{dx}\big(4x^3 - 5x^2 + 7\big) = 12x^2 - 10x.$$

```check
same(diff(4*x**3 - 5*x**2 + 7, x), 12*x**2 - 10*x)
```

Most functions are built with more than sums and constant multiples. $x^2\sin x$ is a product, $\dfrac{1}{1 + x^2}$ a quotient, and $\sin(x^2)$ and $\sqrt{1 + x^2}$ are compositions ([Section 1.5](module_01_EN.html#composition)). Each could be differentiated from the definition, with a new limit to work out every time. This module does that work once and for all: it proves one rule for each way of combining two functions, and it finds the derivatives of the trigonometric functions. After that, the derivative of a formula follows the way the formula is built.

| Built as | Its derivative | Proved in |
|---|---|---|
| $f + g$ | $f' + g'$ | Module 4 |
| $cf$, $c$ a constant | $cf'$ | Module 4 |
| $fg$ | $f'g + fg'$ | Section 5.2 |
| $\dfrac{f}{g}$ | $\dfrac{f'g - fg'}{g^2}$ | Section 5.3 |
| $f\big(g(x)\big)$ | $f'\big(g(x)\big)\,g'(x)$ | Section 5.5 |

```check
fF, gF, kF = Function('f'), Function('g'), Function('k')
same(diff(fF(x) + gF(x), x), diff(fF(x), x) + diff(gF(x), x)); same(diff(c*fF(x), x), c*diff(fF(x), x))
same(diff(fF(x)*gF(x), x), diff(fF(x), x)*gF(x) + fF(x)*diff(gF(x), x))
same(diff(fF(x)/gF(x), x), (diff(fF(x), x)*gF(x) - fF(x)*diff(gF(x), x))/gF(x)**2)
same(diff(fF(gF(x)), x), diff(fF(u), u).subs(u, gF(x))*diff(gF(x), x))
```

The proofs use three facts from earlier modules: a function that is differentiable at a point is continuous there ([Theorem 4.1](module_04_EN.html#continuity)); limits of sums, products and quotients are the sums, products and quotients of the limits, provided these exist and no denominator is 0 (the [limit laws](module_02_EN.html#laws) of Module 2); and, for the trigonometric functions, the [two limits](module_02_EN.html#trig-limits) that Module 2 proved,

$$\lim_{\theta\to0}\frac{\sin\theta}{\theta} = 1, \qquad \lim_{\theta\to0}\frac{1 - \cos\theta}{\theta} = 0.$$

```check
limit_is(sin(theta)/theta, theta, 0, 1); limit_is((1 - cos(theta))/theta, theta, 0, 0)
```

Sections 5.2 to 5.5 prove the rules. Sections 5.6 to 5.8 put them to work: a strategy for combining them, derivatives with SymPy, and the way programs compute derivatives.

## The product rule {#product}

The derivative of a sum is the sum of the derivatives, so you might hope that the derivative of a product is the product of the derivatives. It is not. Take $f(x) = x$ and $g(x) = x^2$. Their product is $x^3$, with derivative $3x^2$; the product of their derivatives is $1 \cdot 2x = 2x$. At $x = 1$ these are 3 and 2.

```check
same(diff(x*x**2, x), 3*x**2); same(diff(x, x)*diff(x**2, x), 2*x)
same((3*x**2).subs(x, 1), 3); same((2*x).subs(x, 1), 2)
```

### A growing rectangle {#rectangle}

To find the right rule, picture a product as an area. Let $u = f(x)$ and $v = g(x)$ be the sides of a rectangle (for the picture, suppose they are positive), so that its area is $A = uv$. When $x$ increases by $h$, the sides change by

$$\begin{aligned} \Delta u &= f(x + h) - f(x), \\ \Delta v &= g(x + h) - g(x), \end{aligned}$$

and the area becomes $(u + \Delta u)(v + \Delta v)$. Figure 5.1 cuts the new rectangle into the old one, a strip of area $u\,\Delta v$ along the top, a strip of area $v\,\Delta u$ down the side, and a small corner of area $\Delta u\,\Delta v$:

$$\begin{aligned} \Delta A &= (u + \Delta u)(v + \Delta v) - uv \\ &= u\,\Delta v + v\,\Delta u + \Delta u\,\Delta v. \end{aligned}$$

::: figure id=fig-05-1
The product rule as a growing rectangle with sides $u = f(x)$ and $v = g(x)$. When $x$ changes by $h$, the area $uv$ gains a green strip $u\,\Delta v$, an orange strip $v\,\Delta u$ and a purple corner $\Delta u\,\Delta v$. On the right the change in $x$ is halved, so $\Delta u$ and $\Delta v$ are about half as large: the strips halve, but the corner shrinks to a quarter.
:::

Divide by $h$ to get the average rate of change of the area:

$$\frac{\Delta A}{h} = u\,\frac{\Delta v}{h} + v\,\frac{\Delta u}{h} + \Delta u\,\frac{\Delta v}{h}.$$

As $h \to 0$, $\Delta v/h \to g'(x)$ and $\Delta u/h \to f'(x)$, while $\Delta u \to 0$. The corner is small in both directions, so even after division by $h$ it disappears, and what is left is $u\,g'(x) + v\,f'(x)$: each side's rate of change times the other side.

```check
du_, dv_ = symbols('Delta_u Delta_v')
same(expand((u + du_)*(v + dv_) - u*v), u*dv_ + v*du_ + du_*dv_)
same((u + du_/2)*(v + dv_/2) - u*v - (u*dv_ + v*du_)/2, du_*dv_/4)   # halve the changes: the corner is a quarter
```

::: theorem The product rule
If $f$ and $g$ are differentiable at $x$, then so is their product $fg$, and

$$(fg)'(x) = f'(x)\,g(x) + f(x)\,g'(x).$$

In Leibniz's notation, with $u = f(x)$ and $v = g(x)$: $\dfrac{d}{dx}(uv) = \dfrac{du}{dx}\,v + u\,\dfrac{dv}{dx}$.
:::

::: proof
The proof turns the picture into limits. Write $f$ and $g$ for $f(x)$ and $g(x)$, and for $h \ne 0$ let $\Delta f = f(x + h) - f(x)$ and $\Delta g = g(x + h) - g(x)$, so that $f(x + h) = f + \Delta f$ and $g(x + h) = g + \Delta g$. Expand the product, as in the rectangle, and divide by $h$:

$$\begin{aligned} &\frac{f(x + h)\,g(x + h) - fg}{h} \\ &\quad= \frac{(f + \Delta f)(g + \Delta g) - fg}{h} \\ &\quad= \frac{\Delta f}{h}\,g + f\,\frac{\Delta g}{h} + \Delta f\,\frac{\Delta g}{h}. \end{aligned}$$

Now let $h \to 0$. Since $f$ and $g$ are differentiable at $x$, $\Delta f/h \to f'(x)$ and $\Delta g/h \to g'(x)$. And $\Delta f \to 0$, because a function that is differentiable at $x$ is continuous there (Theorem 4.1). By the limit laws for sums and products, the expression approaches $f'(x)\,g(x) + f(x)\,g'(x) + 0\cdot g'(x)$, which is the product rule.
:::

```check
fv_, gv_, df_, dg_ = symbols('f g Delta_f Delta_g')
steps(((fv_ + df_)*(gv_ + dg_) - fv_*gv_)/h, df_/h*gv_ + fv_*dg_/h + df_*dg_/h)
lhs_p = (fF(x + h)*gF(x + h) - fF(x)*gF(x))/h
same(lhs_p, (fF(x + h) - fF(x))/h*gF(x) + fF(x)*(gF(x + h) - gF(x))/h + (fF(x + h) - fF(x))*(gF(x + h) - gF(x))/h)
```

In words: the derivative of a product is the derivative of the first factor times the second, plus the first times the derivative of the second. The last term of the proof, $\Delta f\,\Delta g/h$, is the corner of the picture, and the continuity of $f$ is what makes it vanish.

The hypotheses are what the proof needs, not what a product needs in order to have a derivative. If $f$ or $g$ is not differentiable at $x$, the theorem says nothing: $\abs{x}$ has no derivative at 0 (its graph has a corner there), but $\abs{x}\cdot\abs{x} = x^2$ does.

```check
xr0 = symbols('x', real=True)
same(Abs(xr0)*Abs(xr0), xr0**2); limit_is(Abs(h)/h, h, 0, 1, '+'); limit_is(Abs(h)/h, h, 0, -1, '-')
```

::: example Two ways to differentiate a product
Differentiate $F(x) = (x^2 + 1)(x^3 - 2x)$ with the product rule, and check by expanding first.

With $f(x) = x^2 + 1$ and $g(x) = x^3 - 2x$, the derivatives are $f'(x) = 2x$ and $g'(x) = 3x^2 - 2$, so

$$\begin{aligned} F'(x) &= 2x(x^3 - 2x) \\ &\quad + (x^2 + 1)(3x^2 - 2) \\ &= (2x^4 - 4x^2) + (3x^4 + x^2 - 2) \\ &= 5x^4 - 3x^2 - 2. \end{aligned}$$

Expanding first: $F(x) = x^5 - 2x^3 + x^3 - 2x = x^5 - x^3 - 2x$, so $F'(x) = 5x^4 - 3x^2 - 2$, the same.

```check
F1 = (x**2 + 1)*(x**3 - 2*x)
steps(Derivative(F1, x), 2*x*(x**3 - 2*x) + (x**2 + 1)*(3*x**2 - 2), (2*x**4 - 4*x**2) + (3*x**4 + x**2 - 2), 5*x**4 - 3*x**2 - 2)
same(expand(2*x*(x**3 - 2*x)), 2*x**4 - 4*x**2); same(expand((x**2 + 1)*(3*x**2 - 2)), 3*x**4 + x**2 - 2)
same(expand(F1), x**5 - x**3 - 2*x); same(diff(x**5 - x**3 - 2*x, x), 5*x**4 - 3*x**2 - 2)
```
:::

Expanding works for polynomials. The product rule works for every product, including those that cannot be expanded, such as $x^2\sin x$ (Section 5.4), and it works with nothing but numbers.

::: example Power in a circuit
The electrical power delivered to a component is $P = VI$, the voltage across it times the current through it. Suppose that at some instant the voltage is 12 V and falling at 0.5 V per second, while the current is 2 A and rising at 0.1 A per second. Is the power rising or falling, and how fast?

$V$ and $I$ are functions of time $t$, and at that instant $V = 12$, $V' = -0.5$, $I = 2$ and $I' = 0.1$. By the product rule,

$$\begin{aligned} P' &= V'I + VI' \\ &= (-0.5)(2) + (12)(0.1) \\ &= -1 + 1.2 = 0.2. \end{aligned}$$

The power is rising, at 0.2 watts per second: the rising current outweighs the falling voltage.

```check
V0, Vd, I0, Id = 12, Rational(-1, 2), 2, Rational(1, 10)
steps(Vd*I0 + V0*Id, -1 + Rational(12, 10), Rational(2, 10))
Vt, It = Function('V')(t), Function('I')(t)
same(diff(Vt*It, t), diff(Vt, t)*It + Vt*diff(It, t))
```
:::

Used twice, the product rule differentiates a product of three functions:

$$\begin{aligned} (fgk)' &= \big((fg)k\big)' = (fg)'k + (fg)k' \\ &= f'gk + fg'k + fgk'. \end{aligned}$$

Each term differentiates one factor and leaves the others alone; Exercise 5.10 takes this further.

```check
same(diff(fF(x)*gF(x)*kF(x), x), diff(fF(x), x)*gF(x)*kF(x) + fF(x)*diff(gF(x), x)*kF(x) + fF(x)*gF(x)*diff(kF(x), x))
```

::: pitfall
$(fg)' = f'g'$ is wrong, as $x \cdot x^2$ showed. Two ways to remember the right rule: each term differentiates exactly one factor; and in the rectangle, the change in each side sweeps out a strip along the other side.
:::

## The quotient rule {#quotient}

A quotient changes when its top changes and when its bottom changes, and the two effects pull in opposite directions: a larger numerator makes the fraction larger, a larger denominator makes it smaller. The rule has both, with a minus sign between them.

::: theorem The quotient rule
If $f$ and $g$ are differentiable at $x$ and $g(x) \ne 0$, then $f/g$ is differentiable at $x$, and

$$\Big(\frac{f}{g}\Big)'(x) = \frac{f'(x)\,g(x) - f(x)\,g'(x)}{g(x)^2}.$$
:::

::: proof
First, $f/g$ is defined near $x$: $g$ is continuous at $x$, so for $h$ close enough to 0, $g(x + h)$ is close to $g(x)$, which is not 0, and so $g(x + h) \ne 0$. For such $h \ne 0$, with $f$, $g$, $\Delta f$ and $\Delta g$ as in the proof of Theorem 5.1, put the two fractions over a common denominator:

$$\begin{aligned} &\frac{f + \Delta f}{g + \Delta g} - \frac{f}{g} \\ &\quad= \frac{(f + \Delta f)\,g - f\,(g + \Delta g)}{g\,(g + \Delta g)} \\ &\quad= \frac{\Delta f\cdot g - f\cdot\Delta g}{g\,(g + \Delta g)}. \end{aligned}$$

Dividing by $h$,

$$\begin{aligned} &\frac{1}{h}\Big(\frac{f(x + h)}{g(x + h)} - \frac{f(x)}{g(x)}\Big) \\ &\quad= \frac{\dfrac{\Delta f}{h}\,g - f\,\dfrac{\Delta g}{h}}{g\,(g + \Delta g)}. \end{aligned}$$

As $h \to 0$, $\Delta f/h \to f'(x)$ and $\Delta g/h \to g'(x)$, and $\Delta g \to 0$ because $g$ is continuous at $x$. So the denominator approaches $g(x)^2$, which is not 0, and by the limit laws the expression approaches $\dfrac{f'(x)g(x) - f(x)g'(x)}{g(x)^2}$.
:::

```check
steps((fv_ + df_)/(gv_ + dg_) - fv_/gv_, ((fv_ + df_)*gv_ - fv_*(gv_ + dg_))/(gv_*(gv_ + dg_)), (df_*gv_ - fv_*dg_)/(gv_*(gv_ + dg_)))
same(((fv_ + df_)/(gv_ + dg_) - fv_/gv_)/h, (df_/h*gv_ - fv_*dg_/h)/(gv_*(gv_ + dg_)))
lhs_q = (fF(x + h)/gF(x + h) - fF(x)/gF(x))/h
same(lhs_q, ((fF(x + h) - fF(x))/h*gF(x) - fF(x)*(gF(x + h) - gF(x))/h)/(gF(x)*gF(x + h)))
```

The numerator is the product rule's $f'g + fg'$ with a minus sign, so the order matters: the derivative of the top comes first. A rhyme helps some people: "low d-high minus high d-low, over the square of what's below".

::: example A quotient of polynomials
Differentiate $y = \dfrac{x^2 - 1}{x^2 + 1}$, and find where its tangent line is horizontal.

The denominator $x^2 + 1$ is never 0, so the rule applies at every $x$. Both $x^2 - 1$ and $x^2 + 1$ have derivative $2x$:

$$\begin{aligned} y' &= \frac{2x(x^2 + 1) - (x^2 - 1)(2x)}{(x^2 + 1)^2} \\ &= \frac{2x^3 + 2x - 2x^3 + 2x}{(x^2 + 1)^2} \\ &= \frac{4x}{(x^2 + 1)^2}. \end{aligned}$$

The tangent is horizontal where $y' = 0$. A fraction is 0 when its numerator is 0, so $4x = 0$: only at $x = 0$, the point $(0, -1)$. It is the lowest point of the graph. Indeed, writing $x^2 - 1 = (x^2 + 1) - 2$ gives $y = 1 - \dfrac{2}{x^2 + 1}$; since $x^2 + 1 \ge 1$, the fraction is at most 2, so $y \ge 1 - 2 = -1$. The slope is negative to the left of 0 and positive to the right.

```check
y3 = (x**2 - 1)/(x**2 + 1)
steps(Derivative(y3, x), (2*x*(x**2 + 1) - (x**2 - 1)*(2*x))/(x**2 + 1)**2, (2*x**3 + 2*x - 2*x**3 + 2*x)/(x**2 + 1)**2, 4*x/(x**2 + 1)**2)
same(solve(4*x/(x**2 + 1)**2, x), [0]); same(y3.subs(x, 0), -1); same(y3, 1 - 2/(x**2 + 1))
same(function_range(2/(x**2 + 1), x, S.Reals), Interval.Lopen(0, 2)); same(function_range(y3, x, S.Reals), Interval.Ropen(-1, 1))   # y >= 1 - 2 = -1
xneg, xpos = symbols('x_n', negative=True), symbols('x_p', positive=True)
holds((4*xneg/(xneg**2 + 1)**2).is_negative); holds((4*xpos/(xpos**2 + 1)**2).is_positive)
```
:::

### Negative powers {#negative-powers}

The quotient rule completes the power rule for integers.

::: theorem The power rule for integers
For every integer $n$,

$$\frac{d}{dx}x^n = nx^{n-1},$$

for every $x$ if $n \ge 1$, and for every $x \ne 0$ if $n \le 0$.
:::

::: proof
Module 4 proved the case $n \ge 1$. For $n = 0$, $x^0 = 1$ is constant, with derivative $0 = 0 \cdot x^{-1}$. If $n$ is negative, write $n = -m$ with $m$ a positive integer, so that $x^n = 1/x^m$ for $x \ne 0$. By the quotient rule, with numerator 1 (derivative 0) and denominator $x^m$ (derivative $mx^{m-1}$),

$$\begin{aligned} \frac{d}{dx}\frac{1}{x^m} &= \frac{0 \cdot x^m - 1 \cdot mx^{m-1}}{(x^m)^2} \\ &= \frac{-mx^{m-1}}{x^{2m}} = -mx^{-m-1}, \end{aligned}$$

and $-mx^{-m-1} = nx^{n-1}$.
:::

```check
mp = symbols('m', positive=True, integer=True)
steps(Derivative(1/x**mp, x), (0*x**mp - 1*mp*x**(mp - 1))/(x**mp)**2, -mp*x**(mp - 1)/x**(2*mp), -mp*x**(-mp - 1))
same(-mp*x**(-mp - 1), (n*x**(n - 1)).subs(n, -mp))
for N_ in range(-6, 1):
    same(diff(x**N_, x), N_*x**(N_ - 1))
same(diff(1/x, x), -1/x**2)
```

For example, $\dfrac{d}{dx}\dfrac{1}{x} = \dfrac{d}{dx}x^{-1} = -x^{-2} = -\dfrac{1}{x^2}$, the number that the difference quotients of $1/x$ approached in [Exercise 1.9](module_01_EN.html#ex-1-9).

::: example How fast gravity weakens
The gravitational pull between two bodies at distance $r$ is $F(r) = \dfrac{k}{r^2}$, where $k > 0$ is a constant that depends on their masses. How fast does $F$ change with $r$?

Write $F(r) = kr^{-2}$ and use the power rule with $n = -2$:

$$F'(r) = k \cdot (-2)r^{-3} = -\frac{2k}{r^3}.$$

The derivative is negative: the pull weakens as the distance grows. Compare it with $F$ itself: $F'(r) = -\dfrac{2}{r}\cdot\dfrac{k}{r^2} = -\dfrac{2}{r}F(r)$. Near $r$ the graph of $F$ is close to its tangent line (Module 4), so a small step $\Delta r$ outwards changes the pull by about

$$F'(r)\,\Delta r = -2\,\frac{\Delta r}{r}\,F(r):$$

moving 1% further away weakens the pull by about 2%. (Exactly: $1/1.01^2 \approx 0.9803$, a loss of about 1.97%.)

```check
kp, rp, drp = symbols('k r Delta_r', positive=True)
Fg = kp/rp**2
steps(Derivative(Fg, rp), kp*(-2)*rp**(-3), -2*kp/rp**3, -2/rp*Fg)
same(diff(Fg, rp)*drp, -2*drp/rp*Fg)
same((-2*drp/rp*Fg/Fg).subs(drp, rp/100), Rational(-2, 100))      # a 1% step: about -2%
rounds(1/Rational(101, 100)**2, '0.9803'); rounds((1 - 1/Rational(101, 100)**2)*100, '1.97')
```
:::

::: pitfall
$\Big(\dfrac{f}{g}\Big)' = \dfrac{f'}{g'}$ is wrong. For $x \ne 0$, $\dfrac{x^2}{x} = x$ has derivative 1, but $\dfrac{(x^2)'}{(x)'} = \dfrac{2x}{1} = 2x$. Keep the order in the numerator, $f'g - fg'$: swapping it changes the sign of the answer. And use the simplest tool: for $\dfrac{3}{x^4} = 3x^{-4}$ the power rule is quicker than the quotient rule, and for $\dfrac{x^3 + x}{5}$, with a constant denominator, the constant multiple rule is.
:::

```check
same(diff(x**2/x, x), 1); same(diff(x**2, x)/diff(x, x), 2*x)
same(diff(3/x**4, x), -12/x**5); same(diff((x**3 + x)/5, x), (3*x**2 + 1)/5)
```

## Derivatives of the trigonometric functions {#trig}

Figure 5.2 shows the graph of $\sin x$ with some of its tangent lines. At $x = 0$ the graph climbs with slope 1; at the crest $x = \pi/2$ it is flat; at $x = \pi$ it falls with slope $-1$; at the trough $x = 3\pi/2$ it is flat again; and at $x = 2\pi$ it climbs with slope 1 once more. These slopes, $1, 0, -1, 0, 1$, are the values of $\cos x$ at the same points. The table compares the difference quotients of $\sin x$, with $h = 0.001$, with $\cos x$ at more points:

```valuetable
x = 0, pi/6, pi/4, pi/3, pi/2, 2*pi/3, pi
$\dfrac{\sin(x + 0.001) - \sin x}{0.001}$ = (sin(x + 1/1000) - sin(x))/(1/1000)
$\cos x$ = cos(x)
decimals = 4
---
x | \dfrac{\sin(x + 0.001) - \sin x}{0.001} | \cos x
0 | 1.0000 | 1.0000
\frac{\pi}{6} | 0.8658 | 0.8660
\frac{\pi}{4} | 0.7068 | 0.7071
\frac{\pi}{3} | 0.4996 | 0.5000
\frac{\pi}{2} | -0.0005 | 0.0000
\frac{2 \pi}{3} | -0.5004 | -0.5000
\pi | -1.0000 | -1.0000
```

In every row the two columns agree to within 0.0005, and a smaller $h$ makes the agreement closer.

```check
same([cos(X_) for X_ in (0, pi/2, pi, 3*pi/2, 2*pi)], [1, 0, -1, 0, 1])                       # the slopes of Figure 5.2
for X_ in (0, pi/6, pi/4, pi/3, pi/2, 2*pi/3, pi):
    holds(Abs((sin(X_ + Rational(1, 1000)) - sin(X_))*1000 - cos(X_)) < Rational(5, 10000))
    holds(Abs((sin(X_ + Rational(1, 10000)) - sin(X_))*10000 - cos(X_)) < Rational(5, 100000))   # h = 0.0001: closer
```

::: figure id=fig-05-2
Top: $y = \sin x$ with its tangent lines at $0$, $\pi/2$, $\pi$, $3\pi/2$ and $2\pi$, whose slopes are $1, 0, -1, 0, 1$. Bottom: $y = \cos x$ passes through exactly those values (orange dots). Where the sine curve is flat, at its crest and its trough, the cosine crosses zero.
:::

The reason is in the addition formulas and the two limits of Module 2.

::: theorem Derivatives of sine and cosine
For every real number $x$ (in radians),

$$\begin{aligned} \frac{d}{dx}\sin x &= \cos x, \\ \frac{d}{dx}\cos x &= -\sin x. \end{aligned}$$
:::

::: proof
By the addition formula $\sin(x + h) = \sin x\cos h + \cos x\sin h$ ([Section 1.4](module_01_EN.html#trig)),

$$\begin{aligned} &\frac{\sin(x + h) - \sin x}{h} \\ &\quad= \frac{\sin x\cos h - \sin x + \cos x\sin h}{h} \\ &\quad= -\sin x\cdot\frac{1 - \cos h}{h} + \cos x\cdot\frac{\sin h}{h}. \end{aligned}$$

Here $x$ is fixed and only $h$ varies. As $h \to 0$ the two fractions approach 0 and 1 (Module 2), so the difference quotient approaches $-\sin x \cdot 0 + \cos x \cdot 1 = \cos x$.

For the cosine, the addition formula $\cos(x + h) = \cos x\cos h - \sin x\sin h$ gives in the same way

$$\begin{aligned} &\frac{\cos(x + h) - \cos x}{h} \\ &\quad= -\cos x\cdot\frac{1 - \cos h}{h} - \sin x\cdot\frac{\sin h}{h}, \end{aligned}$$

which approaches $-\cos x \cdot 0 - \sin x \cdot 1 = -\sin x$.
:::

```check
steps((sin(x + h) - sin(x))/h, (sin(x)*cos(h) - sin(x) + cos(x)*sin(h))/h, -sin(x)*(1 - cos(h))/h + cos(x)*sin(h)/h)
steps((cos(x + h) - cos(x))/h, -cos(x)*(1 - cos(h))/h - sin(x)*sin(h)/h)
limit_is((sin(x + h) - sin(x))/h, h, 0, cos(x)); limit_is((cos(x + h) - cos(x))/h, h, 0, -sin(x))
same(diff(sin(x), x), cos(x)); same(diff(cos(x), x), -sin(x))
```

The minus sign in $(\cos x)' = -\sin x$ shows in the graphs: for $x$ a little above 0, the cosine falls from its crest, while $\sin x$ is positive.

::: deeper Where the addition formulas come from
Module 1 quoted the addition formulas from school trigonometry. Here is a proof from the unit circle. Let $P$ and $Q$ be the points of the unit circle at angles $x$ and $y$. Turning the whole picture through the angle $-y$ moves $Q$ to $(1, 0)$ and $P$ to the point at angle $x - y$, and turning does not change distances. So the squared distance from $P$ to $Q$ equals the squared distance from $\big(\cos(x - y), \sin(x - y)\big)$ to $(1, 0)$:

$$\begin{aligned} &(\cos x - \cos y)^2 + (\sin x - \sin y)^2 \\ &\quad= \big(\cos(x - y) - 1\big)^2 + \sin^2(x - y). \end{aligned}$$

Expand both sides and use $\sin^2\theta + \cos^2\theta = 1$: the left side is $2 - 2(\cos x\cos y + \sin x\sin y)$ and the right side is $2 - 2\cos(x - y)$. Hence

$$\cos(x - y) = \cos x\cos y + \sin x\sin y.$$

Everything else follows from this. Replacing $y$ by $-y$ (cosine is even, sine is odd) gives the first formula below; taking $x = \pi/2$, where the cosine is 0 and the sine is 1, gives the second:

$$\begin{aligned} \cos(x + y) &= \cos x\cos y - \sin x\sin y, \\ \cos(\tfrac{\pi}{2} - y) &= \sin y. \end{aligned}$$

With $\pi/2 - y$ in place of $y$, the second says $\sin(\pi/2 - y) = \cos y$. Finally,

$$\begin{aligned} \sin(x + y) &= \cos\big((\tfrac{\pi}{2} - x) - y\big) \\ &= \cos(\tfrac{\pi}{2} - x)\cos y \\ &\quad + \sin(\tfrac{\pi}{2} - x)\sin y \\ &= \sin x\cos y + \cos x\sin y. \end{aligned}$$

```check
xr, yr = symbols('x y', real=True)
same(expand((cos(xr) - cos(yr))**2 + (sin(xr) - sin(yr))**2), 2 - 2*(cos(xr)*cos(yr) + sin(xr)*sin(yr)))
same((cos(xr - yr) - 1)**2 + sin(xr - yr)**2, 2 - 2*cos(xr - yr))
same(cos(xr - yr), cos(xr)*cos(yr) + sin(xr)*sin(yr))
same(cos(xr)*cos(-yr) + sin(xr)*sin(-yr), cos(xr)*cos(yr) - sin(xr)*sin(yr))
same(cos(pi/2)*cos(yr) + sin(pi/2)*sin(yr), sin(yr)); same(cos(pi/2 - (pi/2 - yr)), cos(yr))
steps(sin(xr + yr), cos((pi/2 - xr) - yr), cos(pi/2 - xr)*cos(yr) + sin(pi/2 - xr)*sin(yr), sin(xr)*cos(yr) + cos(xr)*sin(yr))
```
:::

**Why radians.** The limit $\dfrac{\sin h}{h} \to 1$ holds because $h$ is measured in radians, as an arc of the unit circle (Module 2). In degrees, a stray factor $\pi/180$ appears in the derivative (Example 5.8). Radians are the unit in which the derivative of the sine is exactly the cosine.

### The other four functions {#other-trig}

The quotient rule gives the derivatives of the other four trigonometric functions from those of sine and cosine.

::: theorem Derivatives of tan, cot, sec and csc
Where $\cos x \ne 0$,

$$\begin{aligned} \frac{d}{dx}\tan x &= \sec^2 x, \\ \frac{d}{dx}\sec x &= \sec x\tan x, \end{aligned}$$

and where $\sin x \ne 0$,

$$\begin{aligned} \frac{d}{dx}\cot x &= -\csc^2 x, \\ \frac{d}{dx}\csc x &= -\csc x\cot x. \end{aligned}$$
:::

::: proof
Each is a quotient of the sine and the cosine (or of 1 and one of them), so use the quotient rule, then $\sin^2 x + \cos^2 x = 1$. Where $\cos x \ne 0$,

$$\begin{aligned} &\frac{d}{dx}\frac{\sin x}{\cos x} \\ &\quad= \frac{\cos x\cos x - \sin x(-\sin x)}{\cos^2 x} \\ &\quad= \frac{\cos^2 x + \sin^2 x}{\cos^2 x} \\ &\quad= \frac{1}{\cos^2 x} = \sec^2 x, \\[6pt] &\frac{d}{dx}\frac{1}{\cos x} \\ &\quad= \frac{0\cdot\cos x - 1\cdot(-\sin x)}{\cos^2 x} \\ &\quad= \frac{1}{\cos x}\cdot\frac{\sin x}{\cos x} = \sec x\tan x. \end{aligned}$$

Where $\sin x \ne 0$,

$$\begin{aligned} &\frac{d}{dx}\frac{\cos x}{\sin x} \\ &\quad= \frac{(-\sin x)\sin x - \cos x\cos x}{\sin^2 x} \\ &\quad= -\frac{\sin^2 x + \cos^2 x}{\sin^2 x} \\ &\quad= -\frac{1}{\sin^2 x} = -\csc^2 x, \\[6pt] &\frac{d}{dx}\frac{1}{\sin x} \\ &\quad= \frac{0\cdot\sin x - 1\cdot\cos x}{\sin^2 x} \\ &\quad= -\frac{1}{\sin x}\cdot\frac{\cos x}{\sin x} = -\csc x\cot x. \end{aligned}$$
:::

```check
steps(Derivative(sin(x)/cos(x), x), (cos(x)*cos(x) - sin(x)*(-sin(x)))/cos(x)**2, (cos(x)**2 + sin(x)**2)/cos(x)**2, 1/cos(x)**2, sec(x)**2)
steps(Derivative(1/cos(x), x), (0*cos(x) - 1*(-sin(x)))/cos(x)**2, 1/cos(x)*(sin(x)/cos(x)), sec(x)*tan(x))
steps(Derivative(cos(x)/sin(x), x), ((-sin(x))*sin(x) - cos(x)*cos(x))/sin(x)**2, -(sin(x)**2 + cos(x)**2)/sin(x)**2, -1/sin(x)**2, -csc(x)**2)
steps(Derivative(1/sin(x), x), (0*sin(x) - 1*cos(x))/sin(x)**2, -1/sin(x)*(cos(x)/sin(x)), -csc(x)*cot(x))
same(diff(tan(x), x), sec(x)**2); same(diff(sec(x), x), sec(x)*tan(x)); same(diff(cot(x), x), -csc(x)**2); same(diff(csc(x), x), -csc(x)*cot(x))
```

A pattern to remember: the three "co" functions, cosine, cotangent and cosecant, have the minus signs.

::: example Products and quotients with sine and cosine
Differentiate (a) $x^2\sin x$, (b) $\sin x\cos x$, and (c) $\dfrac{\sin x}{x}$ for $x \ne 0$.

**(a)** Product rule: $\dfrac{d}{dx}\big(x^2\sin x\big) = 2x\sin x + x^2\cos x$.

**(b)** Product rule again:

$$\begin{aligned} &\frac{d}{dx}(\sin x\cos x) \\ &\quad= \cos x\cos x + \sin x(-\sin x) \\ &\quad= \cos^2 x - \sin^2 x. \end{aligned}$$

**(c)** Quotient rule: $\dfrac{d}{dx}\dfrac{\sin x}{x} = \dfrac{\cos x\cdot x - \sin x\cdot 1}{x^2} = \dfrac{x\cos x - \sin x}{x^2}$.

```check
same(diff(x**2*sin(x), x), 2*x*sin(x) + x**2*cos(x))
steps(Derivative(sin(x)*cos(x), x), cos(x)*cos(x) + sin(x)*(-sin(x)), cos(x)**2 - sin(x)**2)
steps(Derivative(sin(x)/x, x), (cos(x)*x - sin(x)*1)/x**2, (x*cos(x) - sin(x))/x**2)
```
:::

::: example A mass on a spring
A mass bounces on a spring. Suppose its height above its resting point after $t$ seconds is $s(t) = 4\sin t + 3\cos t$ centimetres. Find its velocity $v = s'$ and its acceleration $a = v'$, and compare $a$ with $s$.

$$\begin{aligned} v(t) &= 4\cos t - 3\sin t \ \text{cm/s}, \\ a(t) &= -4\sin t - 3\cos t \ \text{cm/s}^2. \end{aligned}$$

So $a(t) = -s(t)$ at every instant: the acceleration always points back towards the resting point, and is proportional to the distance from it. That is how a spring pulls (Hooke's law), and Module 13 shows that every motion with this property is a combination of a sine and a cosine. At $t = 0$ the mass is 3 cm up and moving upwards at 4 cm/s.

```check
s6 = 4*sin(t) + 3*cos(t)
v6 = diff(s6, t); a6 = diff(v6, t)
same(v6, 4*cos(t) - 3*sin(t)); same(a6, -4*sin(t) - 3*cos(t)); same(a6, -s6)
same(s6.subs(t, 0), 3); same(v6.subs(t, 0), 4)
```
:::

::: pitfall
Two sign slips: $(\cos x)' = -\sin x$, not $\sin x$; and the derivatives of $\cot x$ and $\csc x$ carry minus signs too. All six formulas assume radians: check them with a calculator in degree mode and they fail.
:::

## The chain rule {#chain}

Compositions are everywhere: $\sin(2x)$, $(x^2 + 1)^{10}$, $\sqrt{1 + x^2}$. Start with numbers. What is the slope of $y = \sin(2x)$ at $x = 0$? The difference quotients there are $\dfrac{\sin(2h) - \sin 0}{h} = \dfrac{\sin(2h)}{h}$:

```valuetable
h = 0.1, 0.01, 0.001
$\dfrac{\sin(2h)}{h}$ = sin(2*h)/h
digits = 7
---
h | \dfrac{\sin(2h)}{h}
0.1 | 1.986693
0.01 | 1.999867
0.001 | 1.999999
```

They approach 2, not $\cos(2 \cdot 0) = 1$. [Section 1.5](module_01_EN.html#transformations) explains why: the graph of $\sin(2x)$ is the graph of $\sin x$ squashed horizontally by the factor 2, so it climbs twice as steeply, and every slope doubles. The derivative of $\sin(2x)$ is $2\cos(2x)$: the derivative of the outer function, the sine, evaluated at the inner function $2x$, times the rate 2 at which the inner function changes.

```check
limit_is(sin(2*h)/h, h, 0, 2); same(diff(sin(2*x), x), 2*cos(2*x)); same(cos(2*0), 1)
```

### Rates multiply {#rates-multiply}

In Figure 5.3, gear A has 36 teeth, gear B 18 and gear C 6. While A turns once, 36 teeth pass the point where it meets B, so B turns $36/18 = 2$ times. For each turn of B, 18 teeth pass C, so C turns $18/6 = 3$ times. So C turns $3 \cdot 2 = 6$ times as fast as A. If $\theta_A$, $\theta_B$ and $\theta_C$ are the angles through which the gears have turned, each measured in its own direction of turning,

$$\frac{d\theta_C}{d\theta_A} = \frac{d\theta_C}{d\theta_B}\cdot\frac{d\theta_B}{d\theta_A} = 3 \cdot 2 = 6.$$

::: figure id=fig-05-3
Rates multiply. Gear B turns twice for each turn of gear A, and gear C three times for each turn of B, so C turns $3 \cdot 2 = 6$ times for each turn of A. Gears that touch turn in opposite directions (arrows).
:::

Converting units works the same way. Suppose a car uses 0.06 litres of fuel per kilometre and drives at 90 km/h. Then it uses $0.06 \cdot 90 = 5.4$ litres per hour, and the units cancel like fractions: (litres per km) times (km per hour) is litres per hour.

```check
same(Rational(36, 18), 2); same(Rational(18, 6), 3); same(3*2, 6); same(Rational(36, 6), 6)
same(Rational(6, 100)*90, Rational(54, 10))
```

For gears and fuel the rates are constant. For curves they change from point to point, but near each point a differentiable function is close to its tangent line, which has a constant rate, its slope. So, point by point, the rates multiply.

::: theorem The chain rule
If $g$ is differentiable at $x$ and $f$ is differentiable at $g(x)$, then the composition $F = f \circ g$, $F(x) = f\big(g(x)\big)$, is differentiable at $x$, and

$$F'(x) = f'\big(g(x)\big)\,g'(x).$$

In Leibniz's notation, with $y = f(u)$ and $u = g(x)$,

$$\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx},$$

where $dy/du$ is evaluated at $u = g(x)$.
:::

In words: differentiate the outer function, leaving the inner function inside it unchanged, and multiply by the derivative of the inner function. The symbol $f'\big(g(x)\big)$ reads "f prime of g of x": the derivative of $f$, evaluated at the number $g(x)$. The Leibniz form looks like cancelling $du$: here $dy/dx$ behaves like a fraction, which makes the rule easy to remember. It is not a proof, though, because $dy/du$ is a single symbol for a limit (Module 4), not a fraction.

Note where $f$ must be differentiable: at $g(x)$, the point where it is used, not at $x$. Without that hypothesis the rule can fail: with $f(u) = \abs{u}$ and $g(x) = x^2 - 1$, $f$ is differentiable at 1 but not at $g(1) = 0$, and $f\big(g(x)\big) = \abs{x^2 - 1}$ has a corner at $x = 1$.

```check
same(diff(fF(gF(x)), x), Subs(Derivative(fF(u), u), u, gF(x))*Derivative(gF(x), x))
same((x**2 - 1).subs(x, 1), 0); limit_is((Abs(1 + h) - 1)/h, h, 0, 1)        # |u| is differentiable at u = 1
cq = Abs(((1 + h)**2 - 1))/h                                  # the difference quotient of |x^2 - 1| at 1
limit_is(cq, h, 0, 2, '+'); limit_is(cq, h, 0, -2, '-')
```

**The idea of the proof.** Let $u = g(x)$, and when $x$ changes by $h$, let $\Delta u = g(x + h) - g(x)$ and $\Delta y = f(u + \Delta u) - f(u)$ be the changes in $u$ and in $y$. If $\Delta u \ne 0$,

$$\frac{\Delta y}{h} = \frac{\Delta y}{\Delta u}\cdot\frac{\Delta u}{h}.$$

As $h \to 0$, $\Delta u \to 0$ (because $g$ is continuous at $x$), so $\Delta y/\Delta u \to f'(u)$, while $\Delta u/h \to g'(x)$; the product approaches $f'(u)\,g'(x)$. This is the gear argument with limits, and it is almost a proof. The gap: $\Delta u$ can be 0 for values of $h \ne 0$ as close to 0 as you like (for a constant $g$, it is 0 for every $h$; Exercise 5.11 gives a less obvious example), and then $\Delta y/\Delta u$ is $0/0$. The next box closes the gap with a complete proof; a first reading may skip it.

::: deeper A proof of the chain rule
The way round the division by $\Delta u$ is to describe the differentiability of $f$ without dividing. Let $u = g(x)$. Since $f$ is differentiable at $u$, it is defined on an open interval around $u$; for $k \ne 0$ with $u + k$ in that interval, let

$$E(k) = \frac{f(u + k) - f(u)}{k} - f'(u),$$

the error of the difference quotient, and let $E(0) = 0$. That $f$ is differentiable at $u$ says exactly that $E(k) \to 0$ as $k \to 0$; since $E(0) = 0$, $E$ is continuous at 0. Multiplying by $k$,

$$f(u + k) - f(u) = \big(f'(u) + E(k)\big)\,k,$$

for $k \ne 0$, and also for $k = 0$, when both sides are 0.

Now let $h \ne 0$ be small enough that $g(x + h)$ lies in the interval (possible because $g$ is continuous at $x$), and put $k = \Delta u = g(x + h) - g(x)$, which is allowed whether $\Delta u$ is 0 or not. Dividing by $h$,

$$\begin{aligned} &\frac{f\big(g(x + h)\big) - f\big(g(x)\big)}{h} \\ &\quad= \big(f'(u) + E(\Delta u)\big)\,\frac{\Delta u}{h}. \end{aligned}$$

Let $h \to 0$. Then $\Delta u/h \to g'(x)$, since $g$ is differentiable at $x$. Also $\Delta u \to 0$, since $g$ is continuous at $x$, and therefore $E(\Delta u) \to E(0) = 0$, since $E$ is continuous at 0 (the limit of a composition, [Theorem 3.4](module_03_EN.html#composition)). So the right side approaches $f'(u)\,g'(x)$, which proves the chain rule.

Each hypothesis was used: the differentiability of $g$ at $x$, for $\Delta u/h \to g'(x)$ and, through continuity, for $\Delta u \to 0$; and the differentiability of $f$ at $u = g(x)$, not at $x$, for $E(k) \to 0$.

```check
kk = symbols('k')
Ek = (sin(u + kk) - sin(u))/kk - cos(u)          # E(k) for f = sin at u
same((cos(u) + Ek)*kk, sin(u + kk) - sin(u)); limit_is(Ek, kk, 0, 0)
Ek2 = ((u + kk)**3 - u**3)/kk - 3*u**2              # and for f(u) = u^3
same((3*u**2 + Ek2)*kk, (u + kk)**3 - u**3); limit_is(Ek2, kk, 0, 0)
```
:::

### Using the chain rule {#using-chain}

To use the chain rule, name the inner function, differentiate the outer function with the inner one left inside, and multiply by the inner derivative.

::: example Three compositions
Differentiate (a) $(2x + 1)^5$, (b) $\sin(x^2)$ and (c) $\sin^2 x$.

**(a)** The inner function is $u = 2x + 1$, with $du/dx = 2$, and the outer function is $u^5$:

$$\begin{aligned} \frac{d}{dx}(2x + 1)^5 &= 5(2x + 1)^4 \cdot 2 \\ &= 10(2x + 1)^4. \end{aligned}$$

Expanding $(2x + 1)^5$ first would also work, with much more effort.

**(b)** Inner $u = x^2$, outer $\sin u$: $\dfrac{d}{dx}\sin(x^2) = \cos(x^2)\cdot 2x = 2x\cos(x^2)$.

**(c)** $\sin^2 x$ means $(\sin x)^2$: inner $u = \sin x$, outer $u^2$. So $\dfrac{d}{dx}\sin^2 x = 2\sin x\cdot\cos x$.

In (b) the sine is outside and in (c) inside: the same two functions, composed in the two orders, have different derivatives.

```check
steps(Derivative((2*x + 1)**5, x), 5*(2*x + 1)**4*2, 10*(2*x + 1)**4)
steps(Derivative(sin(x**2), x), cos(x**2)*2*x, 2*x*cos(x**2))
same(diff(sin(x)**2, x), 2*sin(x)*cos(x)); holds(Ne((2*x*cos(x**2)).subs(x, 1), (2*sin(x)*cos(x)).subs(x, 1)))    # different functions: compare at x = 1
```
:::

::: example Sine in degrees
In degree mode, a calculator's sine key computes $S(x) = \sin(x^\circ) = \sin\Big(\dfrac{\pi x}{180}\Big)$. Find $S'(x)$.

The inner function is $u = \dfrac{\pi x}{180}$, with $du/dx = \dfrac{\pi}{180}$, and the outer function is $\sin u$:

$$\begin{aligned} S'(x) &= \cos\Big(\frac{\pi x}{180}\Big)\cdot\frac{\pi}{180} \\ &= \frac{\pi}{180}\cos(x^\circ). \end{aligned}$$

At $x = 0$ the slope is $\pi/180 \approx 0.017453$ per degree. Every derivative of a trigonometric function would carry this factor if angles were measured in degrees.

```check
S8 = sin(pi*x/180)
steps(Derivative(S8, x), cos(pi*x/180)*pi/180)
same(diff(S8, x).subs(x, 0), pi/180); rounds(pi/180, '0.017453')
```
:::

The chain rule extends to longer chains: apply it once for each link, working from the outside in.

::: example A chain of three links
Differentiate $y = \sin^3(4x)$, which means $\big(\sin(4x)\big)^3$.

Three functions act in turn: $v = 4x$, then $u = \sin v$, then $y = u^3$. The chain rule, used twice, multiplies three rates:

$$\begin{aligned} \frac{dy}{dx} &= \frac{dy}{du}\cdot\frac{du}{dv}\cdot\frac{dv}{dx} = 3u^2\cdot\cos v\cdot 4 \\ &= 12\sin^2(4x)\cos(4x). \end{aligned}$$

In one line: the cube first, bringing down a 3 and leaving $\sin(4x)$ inside; then the sine, leaving $4x$ inside; then $4x$ itself.

```check
steps(Derivative(sin(4*x)**3, x), 3*sin(4*x)**2*cos(4*x)*4, 12*sin(4*x)**2*cos(4*x))
vv = symbols('v')
same((diff(u**3, u)*diff(sin(vv), vv)*diff(4*x, x)).subs(u, sin(vv)).subs(vv, 4*x), 12*sin(4*x)**2*cos(4*x))
```
:::

### Powers and roots of functions {#powers}

With the power rule for integers (Theorem 5.3) as the outer derivative, the chain rule gives, wherever $g$ is differentiable, for every integer $n$ (with $g(x) \ne 0$ if $n \le 0$),

$$\frac{d}{dx}\big(g(x)\big)^n = n\big(g(x)\big)^{n-1}g'(x).$$

```check
for N_ in (-3, -1, 2, 5):
    same(diff(gF(x)**N_, x), N_*gF(x)**(N_ - 1)*diff(gF(x), x))
```

::: example A negative power of a function
Differentiate $y = \dfrac{1}{(x^2 + 1)^3}$.

Write $y = (x^2 + 1)^{-3}$. With $n = -3$ and $g(x) = x^2 + 1$,

$$y' = -3(x^2 + 1)^{-4}\cdot 2x = -\frac{6x}{(x^2 + 1)^4}.$$

The quotient rule gives the same answer after cancelling a factor $(x^2 + 1)^2$, with more work.

```check
steps(Derivative((x**2 + 1)**(-3), x), -3*(x**2 + 1)**(-4)*2*x, -6*x/(x**2 + 1)**4)
q10 = (0*(x**2 + 1)**3 - 1*3*(x**2 + 1)**2*2*x)/((x**2 + 1)**3)**2     # the quotient rule's form
same(q10, -6*x/(x**2 + 1)**4)
```
:::

The power rule for fractional exponents is proved in Module 6, for every real exponent. One fractional power is known already: [Example 4.5](module_04_EN.html#derivative-function) found from the definition that

$$\frac{d}{dx}\sqrt x = \frac{1}{2\sqrt x} \qquad (x > 0),$$

which is $\tfrac12 x^{-1/2}$, the power rule with $n = \tfrac12$. (Multiplying the top and the bottom of the difference quotient by $\sqrt{x + h} + \sqrt x$ turns it into $\dfrac{1}{\sqrt{x + h} + \sqrt x}$, which approaches $\dfrac{1}{2\sqrt x}$.) At $x = 0$ there is no derivative: $\sqrt x$ is not defined to the left of 0, and from the right its difference quotients $\dfrac{\sqrt h - 0}{h} = \dfrac{1}{\sqrt h}$ grow without bound as $h \to 0^+$, so the graph leaves the origin vertically.

```check
xp = symbols('x', positive=True)
same((sqrt(xp + h) - sqrt(xp))/h, 1/(sqrt(xp + h) + sqrt(xp)))
limit_is(1/(sqrt(xp + h) + sqrt(xp)), h, 0, 1/(2*sqrt(xp)))
same(diff(sqrt(xp), xp), 1/(2*sqrt(xp))); same(1/(2*sqrt(xp)), Rational(1, 2)*xp**Rational(-1, 2))
hpos = symbols('h', positive=True)
same((sqrt(hpos) - 0)/hpos, 1/sqrt(hpos)); limit_is(sqrt(h)/h, h, 0, oo, '+')
```

With the chain rule, wherever $g(x) > 0$ and $g$ is differentiable,

$$\frac{d}{dx}\sqrt{g(x)} = \frac{g'(x)}{2\sqrt{g(x)}}.$$

```check
same(diff(sqrt(gF(x)), x), diff(gF(x), x)/(2*sqrt(gF(x))))
```

::: example Square roots of polynomials
Differentiate (a) $\sqrt{1 + x^2}$ and (b) $(x^2 + 1)^{3/2}$.

**(a)** $1 + x^2 > 0$ for every $x$, so for every $x$

$$\frac{d}{dx}\sqrt{1 + x^2} = \frac{2x}{2\sqrt{1 + x^2}} = \frac{x}{\sqrt{1 + x^2}}.$$

**(b)** The power $\tfrac32$ is not yet covered, but $(x^2 + 1)^{3/2} = (x^2 + 1)\sqrt{x^2 + 1}$, a product. By the product rule and (a),

$$\begin{aligned} &\frac{d}{dx}(x^2 + 1)^{3/2} \\ &\quad= 2x\sqrt{x^2 + 1} + (x^2 + 1)\frac{x}{\sqrt{x^2 + 1}} \\ &\quad= 2x\sqrt{x^2 + 1} + x\sqrt{x^2 + 1} \\ &\quad= 3x\sqrt{x^2 + 1}. \end{aligned}$$

The power rule with $n = \tfrac32$, which Module 6 proves, agrees: $\tfrac32(x^2 + 1)^{1/2}\cdot 2x = 3x\sqrt{x^2 + 1}$.

```check
steps(Derivative(sqrt(1 + x**2), x), 2*x/(2*sqrt(1 + x**2)), x/sqrt(1 + x**2))
same((x**2 + 1)**Rational(3, 2), (x**2 + 1)*sqrt(x**2 + 1))
steps(Derivative((x**2 + 1)*sqrt(x**2 + 1), x), 2*x*sqrt(x**2 + 1) + (x**2 + 1)*x/sqrt(x**2 + 1), 2*x*sqrt(x**2 + 1) + x*sqrt(x**2 + 1), 3*x*sqrt(x**2 + 1))
same(Rational(3, 2)*(x**2 + 1)**Rational(1, 2)*2*x, 3*x*sqrt(x**2 + 1)); same(diff((x**2 + 1)**Rational(3, 2), x), 3*x*sqrt(x**2 + 1))
```
:::

::: pitfall
Three chain rule slips. Forgetting the inner derivative: $\dfrac{d}{dx}\sin(2x)$ is $2\cos(2x)$, not $\cos(2x)$. Changing the inside: the outer derivative is evaluated at the inner function, unchanged, so $\dfrac{d}{dx}\sin(x^2) = \cos(x^2)\cdot 2x$, not $\cos x\cdot 2x$ and not $\cos(2x)$. And confusing a composition with a product: $\sin(x^2)$ needs the chain rule, $x\sin x$ the product rule.
:::

## Combining the rules {#strategy}

Real formulas combine several rules. A systematic order keeps the work under control.

::: keyidea
To differentiate a formula:

1. **Rewrite it if that helps.** Use negative powers for reciprocals ($\dfrac{3}{x^4} = 3x^{-4}$); cancel common factors, noting the points left out; expand a short product of polynomials.
2. **Find the last operation**: the one you would carry out last when computing the formula's value at a number. It chooses the rule: a sum, the sum rule; a product, the product rule; a quotient, the quotient rule; a function applied to something other than $x$ itself, the chain rule.
3. **Apply that rule**, and treat each piece it leaves to differentiate in the same way, until only the basic derivatives remain.
4. **Simplify**: take out common factors, combine fractions, use identities such as $\sin^2 x + \cos^2 x = 1$, and say where the result holds.
5. **Check** it: at a point with a difference quotient, on a graph (the grapher below), or with SymPy (Section 5.7).
:::

| Formula | Last operation | First rule |
|---|---|---|
| $x^2\sin x$ | multiply $x^2$ by $\sin x$ | product |
| $\sin(x^2)$ | take the sine of $x^2$ | chain |
| $\sin^2 x$ | square $\sin x$ | chain |
| $\dfrac{x}{\sin x}$ | divide $x$ by $\sin x$ | quotient |
| $\sin x\cos(3x)$ | multiply | product, then chain for $\cos(3x)$ |

```check
same(diff(sin(x)*cos(3*x), x), cos(x)*cos(3*x) + sin(x)*(-3*sin(3*x)))
same(diff(x/sin(x), x), (sin(x) - x*cos(x))/sin(x)**2)
```

::: example A product of powers
Differentiate $y = x^3(2x - 1)^4$, simplify, and find where the tangent is horizontal.

The last operation is the product of $x^3$ and $(2x - 1)^4$. The second factor needs the chain rule: its derivative is $4(2x - 1)^3 \cdot 2 = 8(2x - 1)^3$. So

$$y' = 3x^2(2x - 1)^4 + x^3 \cdot 8(2x - 1)^3.$$

Both terms contain $x^2(2x - 1)^3$; take it out:

$$\begin{aligned} y' &= x^2(2x - 1)^3\big[3(2x - 1) + 8x\big] \\ &= x^2(2x - 1)^3(14x - 3). \end{aligned}$$

The factored form shows at once where $y' = 0$: at $x = 0$, $x = \tfrac12$ and $x = \tfrac{3}{14}$. The tangent is horizontal at these three points. The expanded form, $112x^6 - 192x^5 + 120x^4 - 32x^3 + 3x^2$, hides this.

```check
y13 = x**3*(2*x - 1)**4
steps(Derivative((2*x - 1)**4, x), 4*(2*x - 1)**3*2, 8*(2*x - 1)**3)
steps(Derivative(y13, x), 3*x**2*(2*x - 1)**4 + x**3*8*(2*x - 1)**3, x**2*(2*x - 1)**3*(3*(2*x - 1) + 8*x), x**2*(2*x - 1)**3*(14*x - 3))
same_set(solve(x**2*(2*x - 1)**3*(14*x - 3), x), [0, Rational(1, 2), Rational(3, 14)])
same(expand(x**2*(2*x - 1)**3*(14*x - 3)), 112*x**6 - 192*x**5 + 120*x**4 - 32*x**3 + 3*x**2)
```
:::

::: example A quotient that simplifies
Differentiate $y = \dfrac{\sin x}{1 + \cos x}$, where $\cos x \ne -1$.

The quotient rule, then the Pythagorean identity in the numerator:

$$\begin{aligned} y' &= \frac{\cos x\,(1 + \cos x) - \sin x\,(-\sin x)}{(1 + \cos x)^2} \\ &= \frac{\cos x + \cos^2 x + \sin^2 x}{(1 + \cos x)^2} \\ &= \frac{1 + \cos x}{(1 + \cos x)^2} = \frac{1}{1 + \cos x}. \end{aligned}$$

```check
y14 = sin(x)/(1 + cos(x))
steps(Derivative(y14, x), (cos(x)*(1 + cos(x)) - sin(x)*(-sin(x)))/(1 + cos(x))**2, (cos(x) + cos(x)**2 + sin(x)**2)/(1 + cos(x))**2,
      (1 + cos(x))/(1 + cos(x))**2, 1/(1 + cos(x)))
```
:::

::: example A chain around a quotient
Differentiate $y = \Big(\dfrac{x - 1}{x + 1}\Big)^4$, for $x \ne -1$.

The last operation is the fourth power, so the chain rule comes first, with the quotient as the inner function. Its derivative, by the quotient rule, is

$$\begin{aligned} \frac{d}{dx}\frac{x - 1}{x + 1} &= \frac{1\cdot(x + 1) - (x - 1)\cdot 1}{(x + 1)^2} \\ &= \frac{2}{(x + 1)^2}, \end{aligned}$$

so

$$\begin{aligned} y' &= 4\Big(\frac{x - 1}{x + 1}\Big)^3\cdot\frac{2}{(x + 1)^2} \\ &= \frac{8(x - 1)^3}{(x + 1)^5}. \end{aligned}$$

```check
inner15 = (x - 1)/(x + 1)
steps(Derivative(inner15, x), (1*(x + 1) - (x - 1)*1)/(x + 1)**2, 2/(x + 1)**2)
steps(Derivative(inner15**4, x), 4*inner15**3*2/(x + 1)**2, 8*(x - 1)**3/(x + 1)**5)
```
:::

The grapher draws a function and its derivative together. It computes $f'$ numerically, with a central difference (Module 4), so it can check a formula that you found by hand.

::: widget name=derivative-grapher
The top graph shows $y = f(x)$ and its tangent line at $x = a$; the bottom graph shows $y = f'(x)$, computed numerically, with the point $(a, f'(a))$. Move $a$ with the slider, or click either graph. Start with $x^3 - 3x$: find the two points where the readout says the graph is flat, and watch the lower graph cross zero there. Then choose $x\sin x$ and predict $f'(0)$ with the product rule before you move $a$ to 0. Finally type `sin(x)/(1 + cos(x))` from Example 5.13: its derivative $\dfrac{1}{1 + \cos x}$ is positive, so the readout should say rising wherever the function is defined.
:::

```check
same(diff(x**3 - 3*x, x), 3*x**2 - 3); same_set(solve(3*x**2 - 3, x), [-1, 1])
same(diff(x*sin(x), x).subs(x, 0), 0)
same(diff(sin(x)/(1 + cos(x)), x), 1/(1 + cos(x)))
for v_ in (-3, -2, -1, 0, 1, 2, 3):
    holds(1/(1 + cos(v_)) > 0)
same(function_range(1 + cos(x), x, S.Reals), Interval(0, 2))      # so 1/(1 + cos x) > 0 wherever cos x != -1
```

::: pitfall
Simplify a function before you differentiate it when that is cheap, but keep track of what the simplification assumes. For $x \ne 1$, $\dfrac{x^2 - 1}{x - 1} = x + 1$, so its derivative is 1 at every $x \ne 1$; at $x = 1$ the function is not defined, so it has no derivative there. And an unsimplified answer is not wrong, only harder to use: Example 5.12 needed the factored form to find where the tangent is horizontal.
:::

```check
same(cancel((x**2 - 1)/(x - 1)), x + 1); same(diff((x**2 - 1)/(x - 1), x), 1)
holds(((x**2 - 1)/(x - 1)).subs(x, 1) is S.NaN)
```

## Derivatives with SymPy {#sympy}

SymPy's `diff` (Module 4) knows every rule of this module. `sp.diff(expr, x)` differentiates `expr` with respect to `x`; `sp.factor` and `sp.simplify` (Module 1) tidy the result.

::: compute Differentiating with SymPy
```python
import sympy as sp
x = sp.symbols('x')
y = x**3*(2*x - 1)**4            # Example 5.12
dy = sp.diff(y, x)
print(dy)
print(sp.factor(dy))
print(sp.expand(dy))
```

```output
8*x**3*(2*x - 1)**3 + 3*x**2*(2*x - 1)**4
x**2*(2*x - 1)**3*(14*x - 3)
112*x**6 - 192*x**5 + 120*x**4 - 32*x**3 + 3*x**2
```

The first line is the product rule's answer before any simplifying, with the terms in SymPy's order; `factor` gives the form of Example 5.12, and `expand` the expanded form, correct but no help in finding where $y' = 0$. SymPy also applies the rules to functions it knows nothing about:

```python
f, g = sp.Function('f'), sp.Function('g')
print(sp.diff(f(x)*g(x), x))
print(sp.diff(f(g(x)), x))
print(sp.diff(sp.tan(x), x))
```

```output
f(x)*Derivative(g(x), x) + g(x)*Derivative(f(x), x)
Derivative(f(g(x)), g(x))*Derivative(g(x), x)
tan(x)**2 + 1
```

The first line is the product rule and the second the chain rule: `Derivative(f(g(x)), g(x))` means $f'$ evaluated at $g(x)$. The third is $\sec^2 x$ in disguise: dividing $\sin^2 x + \cos^2 x = 1$ by $\cos^2 x$ gives $\tan^2 x + 1 = \sec^2 x$.

SymPy differentiates SymPy expressions only. Python's `math.sin` works with numbers, so it fails on a symbol:

```python fails
import math
print(sp.diff(math.sin(x), x))
```

```output
TypeError: Cannot convert expression to float
```

Use `sp.sin`, `sp.cos`, `sp.sqrt` and the other SymPy functions in formulas you want to differentiate.
:::

```check
same(tan(x)**2 + 1, sec(x)**2)
```

### Why the answers can look different {#different-looks}

SymPy applies the rules mechanically and tidies up only a little. Its answer and yours can differ in the order of the terms, in how they are grouped, in which identities were used ($\tan^2 x + 1$ for $\sec^2 x$, or $\cos^2 x - \sin^2 x$ for $\cos 2x$, the addition formula with $y = x$), or because one of you simplified and the other did not. Two expressions $A$ and $B$ are equal exactly when $A - B = 0$, so to compare two answers, simplify their difference.

::: compute Is my answer right?
```python
import sympy as sp
x = sp.symbols('x')
theirs = sp.diff(sp.sin(x)/(1 + sp.cos(x)), x)     # Example 5.13
mine = 1/(1 + sp.cos(x))
print(theirs)
print(sp.simplify(theirs - mine))
```

```output
cos(x)/(cos(x) + 1) + sin(x)**2/(cos(x) + 1)**2
0
```

The difference simplifies to 0, so the answers agree. A wrong answer leaves something behind. Suppose you forgot the inner derivative of $\sin(x^2)$ and wrote $\cos(x^2)$:

```python
wrong = sp.cos(x**2)
gap = sp.simplify(sp.diff(sp.sin(x**2), x) - wrong)
print(gap)
print([round(float(gap.subs(x, v)), 4) for v in (0.5, 1, 2)])
```

```output
(2*x - 1)*cos(x**2)
[0.0, 0.5403, -1.9609]
```

The last line evaluates the difference at three numbers. At $x = 0.5$ the wrong answer happens to be right, because $2x - 1 = 0$ there; at 1 and 2 it is not, and one non-zero value is enough to prove two expressions different.
:::

```check
same(diff(sin(x)/(1 + cos(x)), x) - 1/(1 + cos(x)), 0)
same(simplify(diff(sin(x**2), x) - cos(x**2)), (2*x - 1)*cos(x**2))
same(((2*x - 1)*cos(x**2)).subs(x, Rational(1, 2)), 0); rounds(cos(1), '0.5403'); rounds(3*cos(4), '-1.9609')
```

::: keyidea
To check that two answers $A$ and $B$ are equal, simplify $A - B$. If you get 0, they are equal wherever both are defined. If not, evaluate $A - B$ at a few numbers: a value that is not 0 proves them different. `simplify` does not find every simplification, so a difference that does not simplify to 0 does not by itself prove the answers different; a non-zero value does.
:::

::: pitfall
A difference that is 0 at one or two points proves nothing: $(2x - 1)\cos(x^2)$ is 0 at $x = 0.5$. Test several points, not round numbers only, or simplify.
:::

## Automatic differentiation {#autodiff}

Training a neural network, fitting a model to data, steering a robot arm: each needs derivatives of functions that exist only as programs, often long ones with loops and branches. How can one program differentiate another? There are three ways.

- **Finite differences** (Module 4): run the program at $a$ and at $a + h$, and compute $\dfrac{f(a + h) - f(a)}{h}$. This needs nothing but the program, but it is an approximation: a large $h$ gives a truncation error, a small one a rounding error, and the best compromise keeps only about half of the 16 significant digits that floating-point numbers carry.
- **Symbolic differentiation**, as in SymPy: turn the program into a formula and apply the rules of this module. The result is exact, but the formulas can grow very large, and loops and branches must first be turned into a formula.
- **Automatic differentiation**: run the program once, on numbers that carry a derivative along with their value, updated at every step by the rules of this module. There is no step $h$ and so no truncation error: the result is exact apart from floating-point rounding, of the kind that affects the value of $f$ itself, and it costs a few extra operations per step.

The simplest way to carry derivatives along is with dual numbers.

::: definition Dual numbers
A **dual number** is an expression $a + b\varepsilon$, where $a$ and $b$ are real numbers and $\varepsilon$ (the Greek letter epsilon) is a new symbol with $\varepsilon^2 = 0$. Dual numbers are added and multiplied like polynomials in $\varepsilon$, with $\varepsilon^2$ replaced by 0:

$$\begin{aligned} &(a + b\varepsilon) + (c + d\varepsilon) \\ &\quad= (a + c) + (b + d)\varepsilon, \\ &(a + b\varepsilon)(c + d\varepsilon) \\ &\quad= ac + (ad + bc)\varepsilon. \end{aligned}$$

A real number $c$ is the dual number $c + 0\varepsilon$; $b$ is the **$\varepsilon$-part** of $a + b\varepsilon$.
:::

No real number except 0 has square 0, so $\varepsilon$ is not a real number: it is a symbol with one rule. (Books on automatic differentiation use the letter $\varepsilon$ for it; it has nothing to do with the $\varepsilon$ of Module 2's limits or the machine epsilon of Module 4.) Look at the product. Its $\varepsilon$-part, $ad + bc$, is the product rule: if $a$ and $c$ are the values of two functions and $b$ and $d$ their derivatives, then the product has value $ac$ and derivative $ad + bc$. That is the whole trick.

```check
ep = symbols('epsilon')
same(expand((a + b*ep)*(c + ep*symbols('d'))).subs(ep**2, 0), a*c + (a*symbols('d') + b*c)*ep)
```

::: theorem Dual numbers carry derivatives
If $p$ is a polynomial, then for all real numbers $a$ and $b$,

$$p(a + b\varepsilon) = p(a) + p'(a)\,b\,\varepsilon.$$

In particular, the $\varepsilon$-part of $p(a + \varepsilon)$ is the derivative $p'(a)$.
:::

::: proof
A polynomial is built from constants and $x$ by additions and multiplications. Call a function $q$ good if $q(a + b\varepsilon) = q(a) + q'(a)\,b\,\varepsilon$ for all $a$ and $b$. A constant $c$ is good, since $c = c + 0\varepsilon$ and $c' = 0$; so is $x$, since $x' = 1$. If $q$ and $r$ are good, then $q + r$ is good, by the sum rule, and so is $qr$:

$$\begin{aligned} &q(a + b\varepsilon)\,r(a + b\varepsilon) \\ &\quad= \big(q(a) + q'(a)b\varepsilon\big) \\ &\qquad \cdot \big(r(a) + r'(a)b\varepsilon\big) \\ &\quad= q(a)r(a) \\ &\qquad + \big(q'(a)r(a) + q(a)r'(a)\big)b\varepsilon, \end{aligned}$$

which is $(qr)(a) + (qr)'(a)\,b\,\varepsilon$ by the product rule. Every step of building $p$ keeps it good, so $p$ is good.
:::

```check
q0, q1, r0, r1 = symbols('q0 q1 r0 r1')
same(expand((q0 + q1*b*ep)*(r0 + r1*b*ep)).subs(ep**2, 0), q0*r0 + (q1*r0 + q0*r1)*b*ep)
same(expand((3 + ep)**2).subs(ep**2, 0), 9 + 6*ep); same((x**2).subs(x, 3), 9); same(diff(x**2, x).subs(x, 3), 6)
```

For example, $(3 + \varepsilon)^2 = 9 + 6\varepsilon + \varepsilon^2 = 9 + 6\varepsilon$, and $x^2$ has value 9 and derivative 6 at $x = 3$.

Other functions join in by declaring their own derivative. For the sine, define $\sin(a + b\varepsilon) = \sin a + (\cos a)\,b\,\varepsilon$. Then for a good function $g$,

$$\begin{aligned} &\sin\big(g(a + b\varepsilon)\big) \\ &\quad= \sin\big(g(a) + g'(a)\,b\,\varepsilon\big) \\ &\quad= \sin g(a) + \cos g(a)\,g'(a)\,b\,\varepsilon, \end{aligned}$$

whose $\varepsilon$-part is the chain rule's $(\sin g)'(a)$ times $b$. Each operation in the program knows only its own derivative; the chain rule, applied step by step as the program runs, does the rest.

```check
same(diff(sin(gF(x)), x), cos(gF(x))*diff(gF(x), x))
```

::: compute Dual numbers in Python
A class with two numbers, the value `a` and the $\varepsilon$-part `b`, and the rules of Definition 5.1 for `+` and `*`:

```python
class Dual:
    """A dual number a + b·ε, where ε² = 0."""
    def __init__(self, a, b=0.0):
        self.a, self.b = a, b              # the value and the ε-part
    def __add__(self, other):
        other = other if isinstance(other, Dual) else Dual(other)
        return Dual(self.a + other.a, self.b + other.b)
    def __mul__(self, other):
        other = other if isinstance(other, Dual) else Dual(other)
        return Dual(self.a*other.a, self.a*other.b + self.b*other.a)
    __radd__ = __add__                     # 1 + d and 3*d: number first
    __rmul__ = __mul__
```

Python calls `__add__` for `+` and `__mul__` for `*`, so any function written with `+` and `*` now works on dual numbers. Take $f(x) = x^3 - 2x + 1$ at $x = 1.5$, and run it on $1.5 + 1\varepsilon$:

```python
def f(x):
    return x*x*x + (-2)*x + 1          # x³ − 2x + 1, with + and * only

y = f(Dual(1.5, 1.0))
print(y.a, y.b)                        # f(1.5) and f'(1.5)
```

```output
1.375 4.75
```

These are $f(1.5) = 1.375$ and $f'(1.5) = 3(1.5)^2 - 2 = 4.75$, exactly. The same function, run on ordinary numbers, gives forward differences:

```python
for h in [1e-1, 1e-4, 1e-8, 1e-12]:
    print(f"h = {h:g}: {(f(1.5 + h) - f(1.5))/h}")
```

```output
h = 0.1: 5.210000000000008
h = 0.0001: 4.750450010000407
h = 1e-08: 4.749999993336473
h = 1e-12: 4.75042227776612
```

With $h = 0.1$ the truncation error is about 0.46. With $h = 10^{-8}$, about the best step, the error is about $7 \times 10^{-9}$; at $h = 10^{-12}$ rounding errors take over, and the error grows again, to about $4 \times 10^{-4}$. SymPy, given the formula, differentiates it exactly:

```python
import sympy as sp
x = sp.symbols('x')
fp = sp.diff(x**3 - 2*x + 1, x)
print(fp, '|', fp.subs(x, 1.5))
```

```output
3*x**2 - 2 | 4.75000000000000
```

To add the sine, give it its derivative rule; the chain rule then comes free. Here is the derivative of $\sin(x^2)$ at 1, which is $2\cos 1$:

```python
import math
def sin(d):                            # sin(a + bε) = sin a + (cos a)·b ε
    return Dual(math.sin(d.a), math.cos(d.a)*d.b)

t = Dual(1.0, 1.0)
print(sin(t*t).b, 2*math.cos(1.0))
```

```output
1.0806046117362795 1.0806046117362795
```

Automatic differentiation also goes through loops, which a formula does not have. This function squares and adds three times:

```python
def g(x):
    y = x
    for _ in range(3):                 # three times: y becomes y² + x
        y = y*y + x
    return y

print(g(Dual(0.5, 1.0)).b)
print(sp.diff(g(x), x).subs(x, sp.Rational(1, 2)))
```

```output
9.5
19/2
```

The program `g` computes the polynomial $\big((x^2 + x)^2 + x\big)^2 + x$, of degree 8, and dual numbers found its derivative at 0.5 without anyone writing that formula down. SymPy agrees: run on the symbol `x`, the same program builds the formula, which `sp.diff` then differentiates.
:::

```check
fd = lambda X: X**3 - 2*X + 1
same(fd(Rational(3, 2)), Rational(11, 8)); same(diff(fd(x), x).subs(x, Rational(3, 2)), Rational(19, 4))
same((fd(Rational(16, 10)) - fd(Rational(15, 10)))/Rational(1, 10), Rational(521, 100)); rounds(Rational(521, 100) - Rational(19, 4), '0.46')
ff_ = lambda X: X*X*X + (-2)*X + 1                       # the box's f, in floating point
rounds(abs((ff_(1.5 + 1e-8) - ff_(1.5))/1e-8 - 4.75), '7e-9'); rounds(abs((ff_(1.5 + 1e-12) - ff_(1.5))/1e-12 - 4.75), '4e-4')
gd = x
for _ in range(3):
    gd = gd*gd + x
same(gd, ((x**2 + x)**2 + x)**2 + x); same(degree(expand(gd), x), 8); same(diff(gd, x).subs(x, Rational(1, 2)), Rational(19, 2))
same(diff(sin(x**2), x).subs(x, 1), 2*cos(1))
```

Figure 5.4 compares the methods over the whole range of steps $h$.

::: figure id=fig-05-4
How many significant digits of $f'(1.5) = 4.75$, for $f(x) = x^3 - 2x + 1$, each method gets right. Here forward differences (blue) never get more than about 9 digits, central differences (green) about 11: shrinking $h$ helps until rounding errors take over. Dual numbers (orange) give 4.75 exactly.
:::

```check
import math as _m
fl = lambda X: X*X*X - 2*X + 1
dig = lambda A: -_m.log10(abs(A - 4.75)/4.75) if A != 4.75 else 16
hs_ = [10.0**(-q/4) for q in range(2, 63)]
best_f = max(dig((fl(1.5 + H) - fl(1.5))/H) for H in hs_); best_c = max(dig((fl(1.5 + H) - fl(1.5 - H))/(2*H)) for H in hs_)
holds(8.5 < best_f < 9.5); holds(10.5 < best_c < 11.5)
```

### Forwards and backwards {#backprop}

Dual numbers carry derivatives forwards, from the input through each step of the program to the output: this is **forward mode** automatic differentiation. One run gives the derivative with respect to one input. A neural network, though, has millions of parameters and one number to make small, its error on the training data, and training needs the derivative of that error with respect to every parameter. One forward run per parameter would be far too slow. **Backpropagation** applies the same chain rule in the other direction: it records the steps of one run, then goes back from the output towards the inputs, multiplying the rates of the steps, and finds all the derivatives in a single backward pass. Backpropagation is the chain rule, organised for many inputs; Module 17 shows how it works.

::: pitfall
Automatic differentiation differentiates the steps that the program takes, not the function that the programmer had in mind. A program that returns 1 when $x = 1$ and $x \cdot x$ otherwise computes $x^2$ for every $x$, but at $x = 1$ it takes the constant branch, so it reports the derivative 0 there instead of 2.
:::

## What you learned {#summary}

- The **product rule** $(fg)' = f'g + fg'$ and the **quotient rule** $\Big(\dfrac{f}{g}\Big)' = \dfrac{f'g - fg'}{g^2}$ (where $g \ne 0$); a growing rectangle explains the first. The derivative of a product is not the product of the derivatives.
- The power rule $\dfrac{d}{dx}x^n = nx^{n-1}$ holds for every integer $n$ ($x \ne 0$ when $n \le 0$), and $\dfrac{d}{dx}\sqrt x = \dfrac{1}{2\sqrt x}$ for $x > 0$.
- In radians, $(\sin x)' = \cos x$ and $(\cos x)' = -\sin x$, from the addition formulas and the limits of Module 2; then $(\tan x)' = \sec^2 x$, $(\sec x)' = \sec x\tan x$, $(\cot x)' = -\csc^2 x$ and $(\csc x)' = -\csc x\cot x$.
- The **chain rule** $\big(f(g(x))\big)' = f'\big(g(x)\big)\,g'(x)$, or $\dfrac{dy}{dx} = \dfrac{dy}{du}\cdot\dfrac{du}{dx}$: rates multiply, like gear ratios and unit conversions. Longer chains multiply more rates, from the outside in.
- To combine the rules, find the last operation, apply its rule, repeat on the pieces, then simplify (factor) and check.
- `sp.diff` differentiates; SymPy's answer may look different from yours, so compare by simplifying the difference, and evaluate it at several points if it does not simplify to 0.
- Programs differentiate programs by **automatic differentiation**: dual numbers $a + b\varepsilon$ with $\varepsilon^2 = 0$ carry each value's derivative along, exactly apart from rounding, unlike finite differences. Backpropagation is the chain rule run backwards (Module 17).

## Exercises {#exercises}

:::: exercise Products, quotients and powers {#ex-5-1} ★
Differentiate:

- (a) $y = (3x^2 - 1)(x^3 + 2x)$, with the product rule; then check by expanding first.
- (b) $y = \dfrac{2x + 1}{x - 3}$, for $x \ne 3$.
- (c) $y = \dfrac{5}{x^3} - \dfrac{1}{x}$, for $x \ne 0$.
- (d) $y = \dfrac{x^2}{x^2 + 4}$.

::: solution
**(a)** With $f = 3x^2 - 1$ and $g = x^3 + 2x$, $f' = 6x$ and $g' = 3x^2 + 2$:

$$\begin{aligned} y' &= 6x(x^3 + 2x) \\ &\quad + (3x^2 - 1)(3x^2 + 2) \\ &= (6x^4 + 12x^2) \\ &\quad + (9x^4 + 3x^2 - 2) \\ &= 15x^4 + 15x^2 - 2. \end{aligned}$$

Expanding first: $y = 3x^5 + 6x^3 - x^3 - 2x = 3x^5 + 5x^3 - 2x$, and $y' = 15x^4 + 15x^2 - 2$ again.

**(b)** Quotient rule, with $(2x + 1)' = 2$ and $(x - 3)' = 1$:

$$\begin{aligned} y' &= \frac{2(x - 3) - (2x + 1)\cdot 1}{(x - 3)^2} \\ &= \frac{2x - 6 - 2x - 1}{(x - 3)^2} \\ &= -\frac{7}{(x - 3)^2}. \end{aligned}$$

It is negative for every $x \ne 3$: every tangent line slopes downwards, and the graph falls on each side of $x = 3$ (Module 8 proves that a negative derivative on an interval means a falling graph).

**(c)** Rewrite with negative powers and use the power rule: $y = 5x^{-3} - x^{-1}$, so

$$\begin{aligned} y' &= -15x^{-4} + x^{-2} \\ &= -\frac{15}{x^4} + \frac{1}{x^2}. \end{aligned}$$

**(d)** Quotient rule: $y' = \dfrac{2x(x^2 + 4) - x^2\cdot 2x}{(x^2 + 4)^2} = \dfrac{8x}{(x^2 + 4)^2}$.

```check
ya = (3*x**2 - 1)*(x**3 + 2*x)
steps(Derivative(ya, x), 6*x*(x**3 + 2*x) + (3*x**2 - 1)*(3*x**2 + 2), (6*x**4 + 12*x**2) + (9*x**4 + 3*x**2 - 2), 15*x**4 + 15*x**2 - 2)
same(expand((3*x**2 - 1)*(3*x**2 + 2)), 9*x**4 + 3*x**2 - 2)
same(expand(ya), 3*x**5 + 5*x**3 - 2*x); same(diff(3*x**5 + 5*x**3 - 2*x, x), 15*x**4 + 15*x**2 - 2)
steps(Derivative((2*x + 1)/(x - 3), x), (2*(x - 3) - (2*x + 1)*1)/(x - 3)**2, (2*x - 6 - 2*x - 1)/(x - 3)**2, -7/(x - 3)**2)
steps(Derivative(5/x**3 - 1/x, x), Derivative(5*x**(-3) - x**(-1), x), -15*x**(-4) + x**(-2), -15/x**4 + 1/x**2)
steps(Derivative(x**2/(x**2 + 4), x), (2*x*(x**2 + 4) - x**2*2*x)/(x**2 + 4)**2, 8*x/(x**2 + 4)**2)
```
:::
::::

:::: exercise Trigonometric derivatives {#ex-5-2} ★
Differentiate:

- (a) $x^3\cos x$
- (b) $\tan x - x$, where $\cos x \ne 0$
- (c) $\dfrac{\sin x}{1 - \sin x}$, where $\sin x \ne 1$

and (d) find the slope of $y = \sec x$ at $x = \pi/4$.

::: solution
**(a)** Product rule: $3x^2\cos x + x^3(-\sin x) = 3x^2\cos x - x^3\sin x$.

**(b)** $\sec^2 x - 1$. Dividing $\sin^2 x + \cos^2 x = 1$ by $\cos^2 x$ gives $\tan^2 x + 1 = \sec^2 x$, so this is $\tan^2 x$.

**(c)** Quotient rule, with $(1 - \sin x)' = -\cos x$. Its numerator, the derivative of the top times the bottom minus the top times the derivative of the bottom, is

$$\begin{aligned} &\cos x\,(1 - \sin x) \\ &\qquad - \sin x\,(-\cos x) \\ &\quad= \cos x - \sin x\cos x \\ &\qquad + \sin x\cos x \\ &\quad= \cos x, \end{aligned}$$

so

$$\frac{d}{dx}\frac{\sin x}{1 - \sin x} = \frac{\cos x}{(1 - \sin x)^2}.$$

**(d)** $\dfrac{d}{dx}\sec x = \sec x\tan x$, and at $\pi/4$, $\sec\dfrac{\pi}{4} = \dfrac{1}{\cos(\pi/4)} = \sqrt2$ and $\tan\dfrac{\pi}{4} = 1$. The slope is $\sqrt2 \approx 1.414$.

```check
same(diff(x**3*cos(x), x), 3*x**2*cos(x) - x**3*sin(x))
same(diff(tan(x) - x, x), sec(x)**2 - 1); same(sec(x)**2 - 1, tan(x)**2)
steps(cos(x)*(1 - sin(x)) - sin(x)*(-cos(x)), cos(x) - sin(x)*cos(x) + sin(x)*cos(x), cos(x))    # the numerator
steps(Derivative(sin(x)/(1 - sin(x)), x), (cos(x)*(1 - sin(x)) - sin(x)*(-cos(x)))/(1 - sin(x))**2, cos(x)/(1 - sin(x))**2)
same(sec(pi/4), sqrt(2)); same(tan(pi/4), 1); same(diff(sec(x), x).subs(x, pi/4), sqrt(2)); rounds(sqrt(2), '1.414')
```
:::
::::

:::: exercise The chain rule {#ex-5-3} ★
Differentiate:

- (a) $(1 - 4x)^6$
- (b) $\cos(x^3)$
- (c) $\cos^3 x$
- (d) $\dfrac{1}{(x^2 + 9)^2}$
- (e) $\sqrt{4 - x^2}$, for $-2 < x < 2$

::: solution
In each part, name the inner function $u$ and multiply the outer derivative by $du/dx$.

**(a)** $u = 1 - 4x$, outer $u^6$: $6(1 - 4x)^5\cdot(-4) = -24(1 - 4x)^5$.

**(b)** $u = x^3$, outer $\cos u$: $-\sin(x^3)\cdot 3x^2 = -3x^2\sin(x^3)$.

**(c)** $u = \cos x$, outer $u^3$: $3\cos^2 x\cdot(-\sin x) = -3\cos^2 x\sin x$.

**(d)** $u = x^2 + 9$, outer $u^{-2}$: $-2(x^2 + 9)^{-3}\cdot 2x = -\dfrac{4x}{(x^2 + 9)^3}$.

**(e)** $u = 4 - x^2$, which is positive for $-2 < x < 2$; outer $\sqrt u$: $\dfrac{-2x}{2\sqrt{4 - x^2}} = -\dfrac{x}{\sqrt{4 - x^2}}$. This is the slope of the semicircle of [Example 1.2](module_01_EN.html#domains): 0 at the top, $x = 0$, negative to the right, and growing without bound in size as $x$ approaches $\pm 2$, where the semicircle meets the $x$-axis vertically.

```check
steps(Derivative((1 - 4*x)**6, x), 6*(1 - 4*x)**5*(-4), -24*(1 - 4*x)**5)
steps(Derivative(cos(x**3), x), -sin(x**3)*3*x**2, -3*x**2*sin(x**3))
steps(Derivative(cos(x)**3, x), 3*cos(x)**2*(-sin(x)), -3*cos(x)**2*sin(x))
steps(Derivative((x**2 + 9)**(-2), x), -2*(x**2 + 9)**(-3)*2*x, -4*x/(x**2 + 9)**3)
steps(Derivative(sqrt(4 - x**2), x), -2*x/(2*sqrt(4 - x**2)), -x/sqrt(4 - x**2))
same((-x/sqrt(4 - x**2)).subs(x, 0), 0); limit_is(-x/sqrt(4 - x**2), x, 2, -oo, '-'); limit_is(-x/sqrt(4 - x**2), x, -2, oo, '+')
```
:::
::::

:::: exercise Rates multiply {#ex-5-4} ★
- (a) A bicycle's pedals turn a front sprocket with 44 teeth; the chain drives a rear sprocket with 11 teeth, fixed to the back wheel, whose circumference is 2.1 m. You pedal at one turn per second. How fast does the bicycle go, in metres per second and in kilometres per hour?
- (b) Suppose $g(2) = 5$, $g'(2) = 3$, $f'(2) = 7$ and $f'(5) = -2$. Find the derivative of $f\big(g(x)\big)$ at $x = 2$.

::: solution
**(a)** Three rates multiply. Let $p$ and $w$ be the numbers of turns made by the pedals and by the wheel, and $s$ the distance travelled, in metres. Each turn of the pedals moves 44 links of chain, which turn the rear sprocket, and the wheel, $44/11 = 4$ times: $dw/dp = 4$. Each turn of the wheel moves the bicycle 2.1 m: $ds/dw = 2.1$. And $dp/dt = 1$ turn per second. So

$$\begin{aligned} \frac{ds}{dt} &= \frac{ds}{dw}\cdot\frac{dw}{dp}\cdot\frac{dp}{dt} \\ &= 2.1 \cdot 4 \cdot 1 = 8.4 \text{ m/s}. \end{aligned}$$

In kilometres per hour, $8.4 \cdot 3600/1000 = 30.24$: about 30 km/h.

**(b)** By the chain rule, $(f \circ g)'(2) = f'\big(g(2)\big)\,g'(2) = f'(5)\cdot 3 = -2\cdot 3 = -6$. The value $f'(2) = 7$ is a trap: the outer derivative is evaluated at $g(2) = 5$, not at 2. The wrong answer $f'(2)\,g'(2) = 21$ comes from falling into it.

```check
same(Rational(44, 11), 4); same(Rational(21, 10)*4*1, Rational(84, 10)); same(Rational(84, 10)*3600/1000, Rational(3024, 100))
rounds(Rational(3024, 100), '30')
fv = {2: 7, 5: -2}
same(fv[5]*3, -6); same(fv[2]*3, 21)
```
:::
::::

:::: exercise Horizontal tangents and a tangent line {#ex-5-5} ★★
Let $y = \sin x + \cos x$.

- (a) Find the points of the graph with $0 \le x \le 2\pi$ where the tangent line is horizontal.
- (b) Find the equation of the tangent line at $x = \pi/2$.

::: solution
**(a)** $y' = \cos x - \sin x$. The tangent is horizontal where $\cos x = \sin x$. At such an $x$, $\cos x \ne 0$ (if $\cos x = 0$, then $\sin x = \pm 1$, which is not equal to it), so you may divide by $\cos x$: $\tan x = 1$. In $[0, 2\pi]$ that happens at $x = \pi/4$ and $x = 5\pi/4$. There

$$\begin{aligned} y\Big(\frac{\pi}{4}\Big) &= \frac{\sqrt2}{2} + \frac{\sqrt2}{2} = \sqrt2, \\ y\Big(\frac{5\pi}{4}\Big) &= -\frac{\sqrt2}{2} - \frac{\sqrt2}{2} = -\sqrt2. \end{aligned}$$

The points are $\big(\pi/4, \sqrt2\big)$ and $\big(5\pi/4, -\sqrt2\big)$. They are the highest and the lowest points of the graph. Squaring, $y^2 = \sin^2 x + 2\sin x\cos x + \cos^2 x = 1 + 2\sin x\cos x$, and $2\sin x\cos x \le \sin^2 x + \cos^2 x = 1$ because $(\sin x - \cos x)^2 \ge 0$. So $y^2 \le 2$, that is, $-\sqrt2 \le y \le \sqrt2$, and the two points reach these bounds.

**(b)** At $x = \pi/2$, $y = 1 + 0 = 1$ and $y' = 0 - 1 = -1$. The tangent line through $(\pi/2, 1)$ with slope $-1$ is $y - 1 = -(x - \pi/2)$, that is,

$$y = -x + 1 + \frac{\pi}{2}.$$

```check
y5 = sin(x) + cos(x)
same(diff(y5, x), cos(x) - sin(x))
same_set(solveset(cos(x) - sin(x), x, Interval(0, 2*pi)), [pi/4, 5*pi/4])
same(y5.subs(x, pi/4), sqrt(2)); same(y5.subs(x, 5*pi/4), -sqrt(2))
same(expand(y5**2), 1 + 2*sin(x)*cos(x)); same(expand((sin(x) - cos(x))**2), 1 - 2*sin(x)*cos(x))
same(y5.subs(x, pi/2), 1); same(diff(y5, x).subs(x, pi/2), -1)
same(solve(Eq(y - 1, -(x - pi/2)), y), [-x + 1 + pi/2])
```
:::
::::

:::: exercise Combining the rules {#ex-5-6} ★★
Differentiate and simplify:

- (a) $x^2(1 - 3x)^5$
- (b) $\sqrt{x^2 + 4x}$, for $x > 0$
- (c) $\sec(x^2)$, where $\cos(x^2) \ne 0$
- (d) $\dfrac{x}{\sqrt{x^2 + 1}}$

::: solution
**(a)** Product rule, with the chain rule for the second factor, whose derivative is $5(1 - 3x)^4(-3) = -15(1 - 3x)^4$. Both terms of the result contain $x(1 - 3x)^4$; taking it out leaves $2(1 - 3x) - 15x = 2 - 21x$, so

$$\begin{aligned} y' &= 2x(1 - 3x)^5 \\ &\quad - 15x^2(1 - 3x)^4 \\ &= x(1 - 3x)^4(2 - 21x). \end{aligned}$$

**(b)** For $x > 0$, $x^2 + 4x > 0$, and the chain rule for the square root gives

$$\frac{2x + 4}{2\sqrt{x^2 + 4x}} = \frac{x + 2}{\sqrt{x^2 + 4x}}.$$

**(c)** Outer $\sec u$, inner $u = x^2$: $\sec(x^2)\tan(x^2)\cdot 2x = 2x\sec(x^2)\tan(x^2)$.

**(d)** Quotient rule, with $\big(\sqrt{x^2 + 1}\big)' = \dfrac{x}{\sqrt{x^2 + 1}}$ (Example 5.11). Then multiply the top and the bottom by $\sqrt{x^2 + 1}$:

$$\begin{aligned} y' &= \frac{\sqrt{x^2 + 1} - x\cdot\dfrac{x}{\sqrt{x^2 + 1}}}{x^2 + 1} \\ &= \frac{(x^2 + 1) - x^2}{(x^2 + 1)\sqrt{x^2 + 1}} \\ &= \frac{1}{(x^2 + 1)^{3/2}}. \end{aligned}$$

```check
y6a = x**2*(1 - 3*x)**5
steps(Derivative(y6a, x), 2*x*(1 - 3*x)**5 - 15*x**2*(1 - 3*x)**4, x*(1 - 3*x)**4*(2*(1 - 3*x) - 15*x), x*(1 - 3*x)**4*(2 - 21*x))
same(expand(2*(1 - 3*x) - 15*x), 2 - 21*x)
same(diff((1 - 3*x)**5, x), -15*(1 - 3*x)**4)
steps(Derivative(sqrt(x**2 + 4*x), x), (2*x + 4)/(2*sqrt(x**2 + 4*x)), (x + 2)/sqrt(x**2 + 4*x))
same(diff(sec(x**2), x), 2*x*sec(x**2)*tan(x**2))
steps(Derivative(x/sqrt(x**2 + 1), x), (sqrt(x**2 + 1) - x*x/sqrt(x**2 + 1))/(x**2 + 1), ((x**2 + 1) - x**2)/((x**2 + 1)*sqrt(x**2 + 1)), 1/(x**2 + 1)**Rational(3, 2))
```
:::
::::

:::: exercise A spring at twice the frequency {#ex-5-7} ★★
A mass on a stiffer spring has height $s(t) = 3\cos(2t) + 4\sin(2t)$ centimetres after $t$ seconds.

- (a) Find its velocity $v(t)$ and acceleration $a(t)$.
- (b) Show that $a = -4s$ at every instant, and explain where the 4 comes from.
- (c) Find the position and velocity at $t = 0$ and at $t = \pi/4$.

::: solution
**(a)** Each term needs the chain rule with inner function $2t$, whose derivative is 2. In cm/s and cm/s²,

$$\begin{aligned} v(t) &= -6\sin(2t) + 8\cos(2t), \\ a(t) &= -12\cos(2t) - 16\sin(2t). \end{aligned}$$

**(b)** $a(t) = -4\big(3\cos(2t) + 4\sin(2t)\big) = -4s(t)$. Each differentiation brings out a factor 2 from the inner function $2t$, and two differentiations bring out $2 \cdot 2 = 4$. (In Example 5.6, with $\sin t$ and $\cos t$, the factor was $1 \cdot 1 = 1$.)

**(c)** At $t = 0$: $s = 3$ cm and $v = 8$ cm/s, upwards. At $t = \pi/4$, $2t = \pi/2$, so $s = 3 \cdot 0 + 4 \cdot 1 = 4$ cm and $v = -6 \cdot 1 + 8 \cdot 0 = -6$ cm/s: the mass is 4 cm up and moving down at 6 cm/s.

```check
s7 = 3*cos(2*t) + 4*sin(2*t)
v7 = diff(s7, t); a7 = diff(v7, t)
same(v7, -6*sin(2*t) + 8*cos(2*t)); same(a7, -12*cos(2*t) - 16*sin(2*t)); same(a7, -4*s7)
same([s7.subs(t, 0), v7.subs(t, 0)], [3, 8]); same([s7.subs(t, pi/4), v7.subs(t, pi/4)], [4, -6])
```
:::
::::

:::: exercise Same derivative, different looks {#ex-5-8} ★★
- (a) Differentiate $\tan^2 x$ and $\sec^2 x$ (where $\cos x \ne 0$), and show that the two derivatives are equal.
- (b) Explain without differentiating why they must be equal.
- (c) For the first, SymPy prints `(2*tan(x)**2 + 2)*tan(x)`. Show that it agrees with your answer, by hand and with SymPy.

::: solution
**(a)** By the chain rule with outer function $u^2$: $\dfrac{d}{dx}\tan^2 x = 2\tan x\sec^2 x$, and $\dfrac{d}{dx}\sec^2 x = 2\sec x\cdot\sec x\tan x = 2\sec^2 x\tan x$. They are equal.

**(b)** $\tan^2 x + 1 = \sec^2 x$ (divide $\sin^2 x + \cos^2 x = 1$ by $\cos^2 x$). So the two functions differ by the constant 1, and the derivative of a constant is 0.

**(c)** $(2\tan^2 x + 2)\tan x = 2(\tan^2 x + 1)\tan x = 2\sec^2 x\tan x$. With SymPy, simplify the difference:

```python
import sympy as sp
x = sp.symbols('x')
a = sp.diff(sp.tan(x)**2, x)
b = sp.diff(sp.sec(x)**2, x)
print(a, '|', b)
print(sp.simplify(a - b))
```

```output
(2*tan(x)**2 + 2)*tan(x) | 2*tan(x)*sec(x)**2
0
```

The difference is 0: the two answers are the same function, written two ways.

```check
same(diff(tan(x)**2, x), 2*tan(x)*sec(x)**2); same(diff(sec(x)**2, x), 2*sec(x)**2*tan(x))
same(sec(x)**2 - tan(x)**2, 1)
steps((2*tan(x)**2 + 2)*tan(x), 2*(tan(x)**2 + 1)*tan(x), 2*sec(x)**2*tan(x))
```
:::
::::

:::: exercise Dual numbers by hand {#ex-5-9} ★★
Use the arithmetic of dual numbers, with $\varepsilon^2 = 0$.

- (a) Compute $(2 + \varepsilon)^2$ and $(2 + \varepsilon)^3$.
- (b) Let $f(x) = x^3 - 4x$. Compute $f(2 + \varepsilon)$, read off $f(2)$ and $f'(2)$, and check $f'(2)$ with the power rule.
- (c) Compute $f(3 + 2\varepsilon)$, and explain its $\varepsilon$-part with Theorem 5.7.

::: solution
**(a)** $(2 + \varepsilon)^2 = 4 + 4\varepsilon + \varepsilon^2 = 4 + 4\varepsilon$, and

$$\begin{aligned} (2 + \varepsilon)^3 &= (4 + 4\varepsilon)(2 + \varepsilon) \\ &= 8 + 4\varepsilon + 8\varepsilon + 4\varepsilon^2 \\ &= 8 + 12\varepsilon. \end{aligned}$$

**(b)** $f(2 + \varepsilon) = (8 + 12\varepsilon) - 4(2 + \varepsilon) = 8 + 12\varepsilon - 8 - 4\varepsilon = 0 + 8\varepsilon$. So $f(2) = 0$ and $f'(2) = 8$. Check: $f'(x) = 3x^2 - 4$, and $f'(2) = 12 - 4 = 8$.

**(c)** $(3 + 2\varepsilon)^2 = 9 + 12\varepsilon$ and $(3 + 2\varepsilon)^3 = (9 + 12\varepsilon)(3 + 2\varepsilon) = 27 + 54\varepsilon$, so

$$\begin{aligned} f(3 + 2\varepsilon) &= 27 + 54\varepsilon - 12 - 8\varepsilon \\ &= 15 + 46\varepsilon. \end{aligned}$$

By Theorem 5.7 with $a = 3$ and $b = 2$, the $\varepsilon$-part is $f'(3)\cdot 2$, and indeed $f'(3) = 27 - 4 = 23$ and $23 \cdot 2 = 46$. Read the input as a quantity $x$ that depends on time, with value 3 and rate $dx/dt = 2$: then the output's $\varepsilon$-part is $\dfrac{df}{dx}\cdot\dfrac{dx}{dt}$, the chain rule again.

```check
dual = lambda expr: expand(expr).subs(ep**2, 0).subs(ep**3, 0)
same(dual((2 + ep)**2), 4 + 4*ep); same(dual((2 + ep)**3), 8 + 12*ep); same(dual((4 + 4*ep)*(2 + ep)), 8 + 12*ep)
f9 = lambda X: X**3 - 4*X
same(dual(f9(2 + ep)), 8*ep); same(f9(2), 0); same(diff(f9(x), x), 3*x**2 - 4); same(diff(f9(x), x).subs(x, 2), 8)
same(dual((3 + 2*ep)**2), 9 + 12*ep); same(dual((3 + 2*ep)**3), 27 + 54*ep); same(dual(f9(3 + 2*ep)), 15 + 46*ep)
same(f9(3), 15); same(diff(f9(x), x).subs(x, 3)*2, 46)
```
:::
::::

:::: exercise The power rule by induction {#ex-5-10} ★★★
A proof by **induction** shows that a statement holds for every positive integer $n$ in two steps. The **base case** shows it for $n = 1$. The **inductive step** shows that whenever it holds for some $n$, it also holds for $n + 1$. Then it holds for 1, so for 2, so for 3, and so on for every $n$, like a row of falling dominoes. (Module 9 uses the method again.)

Use only the product rule and the derivative of $x$ (no other part of Module 4's power rule).

- (a) Prove by induction that $\dfrac{d}{dx}x^n = nx^{n-1}$ for every positive integer $n$.
- (b) Prove in the same way that if $f$ is differentiable at $x$, then $\dfrac{d}{dx}f(x)^n = nf(x)^{n-1}f'(x)$ for every positive integer $n$: the chain rule for powers, without the chain rule.

::: solution
**(a)** *Base case.* For $n = 1$: the difference quotient of $x$ is $\dfrac{(x + h) - x}{h} = 1$ for every $h \ne 0$, so $\dfrac{d}{dx}x = 1 = 1\cdot x^0$.

*Inductive step.* Suppose that $\dfrac{d}{dx}x^n = nx^{n-1}$ for some $n \ge 1$. Then $x^{n+1} = x \cdot x^n$, and by the product rule

$$\begin{aligned} \frac{d}{dx}x^{n+1} &= 1 \cdot x^n + x \cdot nx^{n-1} \\ &= x^n + nx^n \\ &= (n + 1)x^n, \end{aligned}$$

which is the statement for $n + 1$. By induction it holds for every positive integer $n$.

**(b)** *Base case.* For $n = 1$ the statement says $(f^1)' = 1\cdot f'$, which is true.

*Inductive step.* Suppose that $(f^n)' = nf^{n-1}f'$ at $x$. Then $f^{n+1} = f\cdot f^n$, and by the product rule

$$\begin{aligned} (f^{n+1})' &= f'\cdot f^n + f\cdot nf^{n-1}f' \\ &= (1 + n)f^n f', \end{aligned}$$

which is the statement for $n + 1$. This is the product rule's pattern, each term differentiates one factor: $f^n$ has $n$ factors $f$, so its derivative has $n$ equal terms $f^{n-1}f'$.

```check
steps(((x + h) - x)/h, 1)
same(1*x**n + x*n*x**(n - 1), (n + 1)*x**n)
fx_, fpx_ = symbols('f fp')
same(fpx_*fx_**n + fx_*n*fx_**(n - 1)*fpx_, (n + 1)*fx_**n*fpx_)
for N_ in range(1, 7):
    same(diff(fF(x)**N_, x), N_*fF(x)**(N_ - 1)*diff(fF(x), x))
```
:::
::::

:::: exercise When the inner change is zero {#ex-5-11} ★★★
Let $g(x) = x^2\sin(1/x)$ for $x \ne 0$, and $g(0) = 0$.

- (a) Show from the definition, with the squeeze theorem, that $g'(0) = 0$.
- (b) Show that $g(h) = 0$ for $h = \dfrac{1}{k\pi}$, $k = 1, 2, 3, \dots$. Why does this break the idea of the proof of the chain rule at $x = 0$?
- (c) Let $f(u) = u^2 + u$ and $F(x) = f\big(g(x)\big)$. Find $F'(0)$ with the chain rule, and check it from the definition.

::: solution
**(a)** This is [Exercise 4.11](module_04_EN.html#ex-4-11)(b) again. For $h \ne 0$, the difference quotient is $\dfrac{g(h) - g(0)}{h} = \dfrac{h^2\sin(1/h)}{h} = h\sin(1/h)$. Since $-1 \le \sin(1/h) \le 1$, it lies between $-\abs{h}$ and $\abs{h}$, and both of these approach 0. By the squeeze theorem, $h\sin(1/h) \to 0$: $g'(0) = 0$.

**(b)** $g\Big(\dfrac{1}{k\pi}\Big) = \dfrac{1}{k^2\pi^2}\sin(k\pi) = 0$, since $\sin(k\pi) = 0$. So $\Delta u = g(0 + h) - g(0)$ is 0 for $h = 1/\pi, 1/(2\pi), 1/(3\pi), \dots$, numbers that come as close to 0 as you like. For those $h$, the quotient $\Delta y/\Delta u$ in the idea of the proof is $0/0$, so that argument cannot be completed at $x = 0$. The proof in the Going deeper box of Section 5.5 never divides by $\Delta u$, so it covers this case.

**(c)** $f'(u) = 2u + 1$, so by the chain rule $F'(0) = f'\big(g(0)\big)\,g'(0) = (2\cdot 0 + 1)\cdot 0 = 0$. From the definition: $F(0) = f(0) = 0$, and for $h \ne 0$

$$\begin{aligned} &\frac{F(h) - F(0)}{h} \\ &\quad= \frac{g(h)^2 + g(h)}{h} \\ &\quad= g(h)\cdot\frac{g(h)}{h} + \frac{g(h)}{h}. \end{aligned}$$

By (a), $g(h)/h \to 0$, and $g(h) \to 0$ because $\abs{g(h)} \le h^2$. So the quotient approaches $0 \cdot 0 + 0 = 0$, as the chain rule says.

```check
g11 = x**2*sin(1/x)
limit_is((g11.subs(x, h) - 0)/h, h, 0, 0); same(g11.subs(x, h)/h, h*sin(1/h))
same([g11.subs(x, 1/(j*pi)) for j in range(1, 7)], [0]*6)
f11 = u**2 + u
same(diff(f11, u), 2*u + 1); same((2*u + 1).subs(u, 0)*0, 0)
same((f11.subs(u, g11.subs(x, h)))/h, g11.subs(x, h)*(g11.subs(x, h)/h) + g11.subs(x, h)/h)
limit_is(f11.subs(u, g11.subs(x, h))/h, h, 0, 0)
```
:::
::::

:::: exercise Dividing dual numbers {#ex-5-12} ★★★
- (a) Let $c \ne 0$. Find the dual number $p + q\varepsilon$ with $(c + d\varepsilon)(p + q\varepsilon) = a + b\varepsilon$, which is the quotient $\dfrac{a + b\varepsilon}{c + d\varepsilon}$.
- (b) Explain why the result is the quotient rule.
- (c) Add division to the `Dual` class of Section 5.8 and compute the derivative of $f(x) = \dfrac{1}{1 + x^2}$ at $x = 2$. Compare with the quotient rule.

::: solution
**(a)** Multiply out: $(c + d\varepsilon)(p + q\varepsilon) = cp + (cq + dp)\varepsilon$. This equals $a + b\varepsilon$ when $cp = a$ and $cq + dp = b$. Since $c \ne 0$, $p = \dfrac{a}{c}$, and then $q = \dfrac{b - dp}{c} = \dfrac{b - ad/c}{c} = \dfrac{bc - ad}{c^2}$. So

$$\frac{a + b\varepsilon}{c + d\varepsilon} = \frac{a}{c} + \frac{bc - ad}{c^2}\,\varepsilon.$$

**(b)** Put in the values and derivatives of two functions: $a = f(x)$, $b = f'(x)$, $c = g(x)$, $d = g'(x)$. The $\varepsilon$-part becomes $\dfrac{f'(x)g(x) - f(x)g'(x)}{g(x)^2}$, the quotient rule. (The condition $c \ne 0$ is the quotient rule's $g(x) \ne 0$.)

**(c)** Two methods: `__truediv__` for `d / e`, and `__rtruediv__` for a plain number divided by a dual, as in `1/(1 + x*x)`:

```python
class Dual:
    def __init__(self, a, b=0.0):
        self.a, self.b = a, b
    def __add__(self, other):
        other = other if isinstance(other, Dual) else Dual(other)
        return Dual(self.a + other.a, self.b + other.b)
    def __mul__(self, other):
        other = other if isinstance(other, Dual) else Dual(other)
        return Dual(self.a*other.a, self.a*other.b + self.b*other.a)
    def __truediv__(self, other):            # (a + bε)/(c + dε), with c ≠ 0
        other = other if isinstance(other, Dual) else Dual(other)
        a, b, c, d = self.a, self.b, other.a, other.b
        return Dual(a/c, (b*c - a*d)/c**2)
    def __rtruediv__(self, other):           # number / dual
        return Dual(other)/self
    __radd__, __rmul__ = __add__, __mul__
```

```python
def f(x):
    return 1/(1 + x*x)

y = f(Dual(2.0, 1.0))
print(y.a, y.b)
```

```output
0.2 -0.16
```

The quotient rule gives $f'(x) = \dfrac{0\cdot(1 + x^2) - 1\cdot 2x}{(1 + x^2)^2} = -\dfrac{2x}{(1 + x^2)^2}$, so $f(2) = \dfrac15 = 0.2$ and $f'(2) = -\dfrac{4}{25} = -0.16$: the same numbers.

```check
pq_, qq2 = symbols('p q')
dd = symbols('d')
sol12 = solve([Eq(c*pq_, a), Eq(c*qq2 + dd*pq_, b)], [pq_, qq2], dict=True)[0]
same(sol12[pq_], a/c); same(sol12[qq2], (b*c - a*dd)/c**2)
same(expand((c + dd*ep)*(a/c + (b*c - a*dd)/c**2*ep)).subs(ep**2, 0), a + b*ep)
same(((fF(x)/gF(x)).diff(x)), (diff(fF(x), x)*gF(x) - fF(x)*diff(gF(x), x))/gF(x)**2)
f12 = 1/(1 + x**2)
steps(Derivative(f12, x), (0*(1 + x**2) - 1*2*x)/(1 + x**2)**2, -2*x/(1 + x**2)**2)
same(f12.subs(x, 2), Rational(1, 5)); same(diff(f12, x).subs(x, 2), Rational(-4, 25)); same(Rational(-4, 25), Rational(-16, 100))
```
:::
::::

## Check yourself {#quiz}

```quiz
? $\dfrac{d}{dx}\big(x^3\sin x\big)$ equals
- [ ] $3x^2\cos x$
- [x] $3x^2\sin x + x^3\cos x$
- [ ] $3x^2\sin x - x^3\cos x$
- [ ] $x^3\cos x$
> By the product rule, the derivative of the first factor times the second, plus the first times the derivative of the second: $3x^2\sin x + x^3\cos x$. $3x^2\cos x$ multiplies the two derivatives, which is not a rule; $x^3\cos x$ differentiates only the second factor; and the minus sign belongs to the quotient rule.

? $\dfrac{d}{dx}\dfrac{x}{x + 1}$, for $x \ne -1$, equals
- [ ] $1$
- [ ] $-\dfrac{1}{(x + 1)^2}$
- [ ] $\dfrac{2x + 1}{(x + 1)^2}$
- [x] $\dfrac{1}{(x + 1)^2}$
> Quotient rule: $\dfrac{1\cdot(x + 1) - x\cdot 1}{(x + 1)^2} = \dfrac{1}{(x + 1)^2}$. The answer 1 divides the derivatives, $1/1$; $-\dfrac{1}{(x + 1)^2}$ has the numerator in the wrong order; $\dfrac{2x + 1}{(x + 1)^2}$ uses a plus sign instead of the minus.

? The slope of $y = \cos x$ at $x = \pi/2$ is
- [x] $-1$
- [ ] $0$
- [ ] $1$
- [ ] $\pi/2$
> $(\cos x)' = -\sin x$, and $-\sin(\pi/2) = -1$: the cosine is falling as it crosses the axis. 0 is the value $\cos(\pi/2)$, not the slope; 1 forgets the minus sign.

? $\dfrac{d}{dx}\sin(3x)$ equals
- [ ] $\cos(3x)$
- [ ] $3\cos x$
- [x] $3\cos(3x)$
- [ ] $-3\cos(3x)$
> Chain rule with inner function $3x$: $\cos(3x)\cdot 3$. $\cos(3x)$ forgets the inner derivative; $3\cos x$ changes the inside of the cosine; the minus sign belongs to the derivative of the cosine, not the sine.

? $\dfrac{d}{dx}(x^2 + 1)^{10}$ equals
- [ ] $10(x^2 + 1)^9$
- [x] $20x(x^2 + 1)^9$
- [ ] $10(2x)^9$
- [ ] $20x(x^2 + 1)^{10}$
> Chain rule: $10(x^2 + 1)^9\cdot 2x$. $10(x^2 + 1)^9$ forgets the inner derivative $2x$; $10(2x)^9$ differentiates inside the power; and the exponent must drop to 9.

? Suppose $g(1) = 2$, $g'(1) = 3$, $f'(1) = 7$ and $f'(2) = 5$. The derivative of $f\big(g(x)\big)$ at $x = 1$ is
- [x] $15$
- [ ] $21$
- [ ] $10$
- [ ] $5$
> $f'\big(g(1)\big)\,g'(1) = f'(2)\cdot 3 = 15$. 21 evaluates $f'$ at 1 instead of at $g(1) = 2$; 10 multiplies by $g(1)$ instead of $g'(1)$; 5 forgets the inner derivative.

? SymPy prints `tan(x)**2 + 1` for `sp.diff(sp.tan(x), x)`. Which is true?
- [ ] SymPy is wrong: the derivative is $\sec^2 x$
- [ ] It equals $\sec^2 x$ only at $x = 0$
- [ ] It equals $\sec^2 x$ only for small $x$
- [x] It equals $\sec^2 x$ wherever $\cos x \ne 0$
> Dividing $\sin^2 x + \cos^2 x = 1$ by $\cos^2 x$ gives $\tan^2 x + 1 = \sec^2 x$ for every $x$ with $\cos x \ne 0$: two ways of writing the same function. Simplifying the difference of the two forms gives 0.

? With $\varepsilon^2 = 0$, $f(x) = x^2 + 3x$ evaluated at $2 + \varepsilon$ gives
- [ ] $10 + 4\varepsilon$
- [ ] $10 + \varepsilon$
- [x] $10 + 7\varepsilon$
- [ ] $10 + 7\varepsilon + \varepsilon^2$
> $(2 + \varepsilon)^2 + 3(2 + \varepsilon) = 4 + 4\varepsilon + 6 + 3\varepsilon = 10 + 7\varepsilon$: the value $f(2) = 10$ and the derivative $f'(2) = 2\cdot 2 + 3 = 7$. $10 + 4\varepsilon$ forgets the $\varepsilon$ from $3x$; $10 + \varepsilon$ is $f(2) + \varepsilon$, as if a change in the input passed unchanged to the output; and $\varepsilon^2$ is 0 by definition.
```

```check
same(diff(x**3*sin(x), x), 3*x**2*sin(x) + x**3*cos(x))
same(diff(x/(x + 1), x), 1/(x + 1)**2)
same((x*1 - 1*(x + 1))/(x + 1)**2, -1/(x + 1)**2); same((1*(x + 1) + x*1)/(x + 1)**2, (2*x + 1)/(x + 1)**2)   # the numerator in the wrong order; a plus sign
same(diff(cos(x), x).subs(x, pi/2), -1); same(cos(pi/2), 0)
same(diff(sin(3*x), x), 3*cos(3*x))
same(diff((x**2 + 1)**10, x), 20*x*(x**2 + 1)**9)
same(5*3, 15); same(7*3, 21); same(5*2, 10)
same(tan(x)**2 + 1, sec(x)**2)
same(expand((2 + ep)**2 + 3*(2 + ep)).subs(ep**2, 0), 10 + 7*ep); same(diff(x**2 + 3*x, x).subs(x, 2), 7)
same(expand((2 + ep)**2 + 3*2).subs(ep**2, 0), 10 + 4*ep)                    # forgetting the epsilon from 3x
```
