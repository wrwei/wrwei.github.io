---
title: Formula sheet
lead: The formulas of the series in one place, from limits to vector calculus, each with the conditions under which it holds and the module that teaches it.
---

Every formula on this page was checked with the SymPy computer algebra system, as the worked examples
of the modules are. Angles are in radians, $\ln$ is the natural logarithm, and $C$ is an arbitrary
constant. The conditions beside a formula are part of it: outside them the formula can be false.

## Algebra and trigonometry {#algebra}

The series assumes school algebra; the [Optional algebra refresher](../math/module_00_EN.html) of
Mathematical Foundations revises it. [Module 1](module_01_EN.html) recalls the exponential,
logarithmic and trigonometric functions.

### Algebra {#school-algebra}

| Name | Formula | Holds for |
|---|---|---|
| Quadratic formula | ${ax^2 + bx + c = 0 \iff x = \dfrac{-b \pm \sqrt{b^2 - 4ac}}{2a}}$ | ${a \ne 0;}$ real roots when ${b^2 - 4ac \ge 0}$ |
| Completing the square | ${ax^2 + bx + c = a\Big(x + \dfrac{b}{2a}\Big)^2 + c - \dfrac{b^2}{4a}}$ | ${a \ne 0}$ |
| Difference of powers | ${x^n - a^n = (x - a)(x^{n-1} + x^{n-2}a + \cdots + a^{n-1})}$ | ${n = 1, 2, 3, \ldots}$ |
| Distance on the line | ${\abs{x - a} < \delta \iff a - \delta < x < a + \delta}$ | ${\delta > 0}$ |
| Triangle inequality | ${\abs{a + b} \le \abs{a} + \abs{b}}$ | all real ${a,}$ ${b}$ |

The last two rows are the language of the precise definition of a limit in [Module 2](module_02_EN.html).

```check
# quadratic formula, completing the square (a != 0)
same_set(solve(a*x**2 + b*x + c, x), [(-b + sqrt(b**2 - 4*a*c))/(2*a), (-b - sqrt(b**2 - 4*a*c))/(2*a)])
same(a*(x + b/(2*a))**2 + c - b**2/(4*a), a*x**2 + b*x + c)
for N_ in range(1, 8):                                        # x^n - a^n, n = 1..7
    same((x - a)*sum(x**(N_ - 1 - j)*a**j for j in range(N_)), x**N_ - a**N_)
xr, ar = symbols('x_r a_r', real=True)
dl = symbols('delta', positive=True)
same(solveset(Abs(xr - ar) < dl, xr, S.Reals), Interval.open(ar - dl, ar + dl))
# triangle inequality: (|a| + |b|)^2 - (a + b)^2 = 2(|ab| - ab) >= 0, and instances
ra, rb = symbols('r_a r_b', real=True)
same((Abs(ra) + Abs(rb))**2 - (ra + rb)**2, 2*(Abs(ra*rb) - ra*rb))
for p_, q_ in ((3, -5), (-2, -7), (4, 6), (0, -1), (Rational(1, 2), Rational(-3, 4))):
    holds(abs(p_ + q_) <= abs(p_) + abs(q_)); holds(abs(p_*q_) >= p_*q_)
```

### Exponents and logarithms {#exponents-logarithms}

| Law | Formula | Holds for |
|---|---|---|
| Product | ${a^x a^y = a^{x+y}}$ | ${a > 0;}$ ${x,}$ ${y}$ real |
| Quotient | ${\dfrac{a^x}{a^y} = a^{x-y}}$ | ${a > 0}$ |
| Power of a power | ${(a^x)^y = a^{xy}}$ | ${a > 0}$ |
| Power of a product | ${(ab)^x = a^x b^x}$ | ${a > 0,}$ ${b > 0}$ |
| Zero and negative exponents | ${a^0 = 1,}$ ${\ a^{-x} = \dfrac{1}{a^x}}$ | ${a > 0}$ |
| Roots | ${a^{m/n} = \sqrt[n]{a^m}}$ | ${a > 0;}$ ${m,}$ ${n}$ integers, ${n \ge 1}$ |

For whole-number exponents the same laws hold for every $a \ne 0$ and $b \ne 0$. For other exponents a
negative base breaks them: $\big((-1)^2\big)^{1/2} = 1$, but $(-1)^{2 \cdot 1/2} = -1$.

| Law | Formula | Holds for | Module |
|---|---|---|---|
| Inverse functions | ${e^{\ln x} = x}$ | ${x > 0}$ | [1](module_01_EN.html) |
| | ${\ln(e^x) = x}$ | every real ${x}$ | [1](module_01_EN.html) |
| Product | ${\ln(xy) = \ln x + \ln y}$ | ${x > 0,}$ ${y > 0}$ | [1](module_01_EN.html) |
| Quotient | ${\ln\dfrac{x}{y} = \ln x - \ln y}$ | ${x > 0,}$ ${y > 0}$ | [1](module_01_EN.html) |
| Power | ${\ln(x^r) = r\ln x}$ | ${x > 0,}$ ${r}$ real | [1](module_01_EN.html) |
| Even power | ${\ln(x^2) = 2\ln\abs{x}}$ | ${x \ne 0}$ | [1](module_01_EN.html) |
| Values | ${\ln 1 = 0,}$ ${\ \ln e = 1}$ | | [1](module_01_EN.html) |
| Change of base | ${\log_a x = \dfrac{\ln x}{\ln a}}$ | ${a > 0,}$ ${a \ne 1,}$ ${x > 0}$ | [1](module_01_EN.html) |
| Base ${e}$ | ${a^x = e^{x\ln a}}$ | ${a > 0,}$ ${x}$ real | [6](module_06_EN.html) |

```check
A_, B_ = symbols('A B', positive=True)                        # bases a, b > 0
X_, Y_ = symbols('X Y', real=True)                            # real exponents
same(A_**X_*A_**Y_, A_**(X_ + Y_)); same(A_**X_/A_**Y_, A_**(X_ - Y_))
same((A_**X_)**Y_, A_**(X_*Y_)); same((A_*B_)**X_, A_**X_*B_**X_)
same(A_**0, 1); same(A_**(-X_), 1/A_**X_)
mi, ni = symbols('m_i n_i', integer=True); ni = symbols('n_i', integer=True, positive=True)
same(A_**(mi/ni), root(A_**mi, ni))
for base in (S(-2), S(-3), Rational(-1, 2), S(5)):        # whole-number exponents, any base != 0
    for m_, n_ in ((3, -5), (2, 4), (-1, -2), (0, 3)):
        same(base**m_*base**n_, base**(m_ + n_)); same((base**m_)**n_, base**(m_*n_))
        same(base**m_/base**n_, base**(m_ - n_)); same((base*7)**m_, base**m_*7**m_)
same(((-1)**2)**Rational(1, 2), 1); same((-1)**(2*Rational(1, 2)), -1)   # a negative base breaks them
P_, Q_ = symbols('P Q', positive=True)                        # x, y > 0
same(exp(log(P_)), P_); same(log(exp(X_)), X_)
same(log(P_*Q_), log(P_) + log(Q_)); same(log(P_/Q_), log(P_) - log(Q_)); same(log(P_**Y_), Y_*log(P_))
xnz = symbols('x_nz', real=True, nonzero=True)
same(log(xnz**2), 2*log(Abs(xnz)))
for v_ in (-3, Rational(-1, 2), 2, 5):
    same(log(v_**2), 2*log(abs(v_)))
same(log(1), 0); same(log(E), 1)
same(log(P_, A_), log(P_)/log(A_)); same(log(8, 2), 3); same(log(1000, 10), 3)
same(exp(X_*log(A_)), A_**X_); same(exp(3*log(2)), 8)
```

### Trigonometric identities {#trigonometry}

They hold for all real angles, except where a condition is given.

| Name | Identity | Holds for |
|---|---|---|
| Pythagorean | ${\sin^2\theta + \cos^2\theta = 1}$ | |
| | ${1 + \tan^2\theta = \sec^2\theta}$ | ${\cos\theta \ne 0}$ |
| | ${1 + \cot^2\theta = \csc^2\theta}$ | ${\sin\theta \ne 0}$ |
| Definitions | ${\tan\theta = \dfrac{\sin\theta}{\cos\theta},}$ ${\ \sec\theta = \dfrac{1}{\cos\theta}}$ | ${\cos\theta \ne 0}$ |
| | ${\cot\theta = \dfrac{\cos\theta}{\sin\theta},}$ ${\ \csc\theta = \dfrac{1}{\sin\theta}}$ | ${\sin\theta \ne 0}$ |
| Symmetry | ${\sin(-\theta) = -\sin\theta,}$ ${\ \cos(-\theta) = \cos\theta}$ | |
| Periods | ${\sin(\theta + 2\pi) = \sin\theta,}$ ${\ \cos(\theta + 2\pi) = \cos\theta}$ | |
| | ${\tan(\theta + \pi) = \tan\theta}$ | ${\cos\theta \ne 0}$ |
| Complements | ${\sin\big(\tfrac{\pi}{2} - \theta\big) = \cos\theta,}$ ${\ \cos\big(\tfrac{\pi}{2} - \theta\big) = \sin\theta}$ | |
| Supplements | ${\sin(\pi - \theta) = \sin\theta,}$ ${\ \cos(\pi - \theta) = -\cos\theta}$ | |
| Addition | ${\sin(\alpha \pm \beta) = \sin\alpha\cos\beta \pm \cos\alpha\sin\beta}$ | |
| | ${\cos(\alpha \pm \beta) = \cos\alpha\cos\beta \mp \sin\alpha\sin\beta}$ | |
| | ${\tan(\alpha + \beta) = \dfrac{\tan\alpha + \tan\beta}{1 - \tan\alpha\tan\beta}}$ | both sides defined |
| Double angle | ${\sin 2\theta = 2\sin\theta\cos\theta}$ | |
| | ${\cos 2\theta = \cos^2\theta - \sin^2\theta = 2\cos^2\theta - 1 = 1 - 2\sin^2\theta}$ | |
| Squares | ${\sin^2\theta = \tfrac12(1 - \cos 2\theta),}$ ${\ \cos^2\theta = \tfrac12(1 + \cos 2\theta)}$ | |
| Products | ${\sin\alpha\cos\beta = \tfrac12\big[\sin(\alpha - \beta) + \sin(\alpha + \beta)\big]}$ | |
| | ${\sin\alpha\sin\beta = \tfrac12\big[\cos(\alpha - \beta) - \cos(\alpha + \beta)\big]}$ | |
| | ${\cos\alpha\cos\beta = \tfrac12\big[\cos(\alpha - \beta) + \cos(\alpha + \beta)\big]}$ | |

```check
al, be = symbols('alpha beta', real=True)
th = symbols('theta', real=True)
same(sin(th)**2 + cos(th)**2, 1); same(1 + tan(th)**2, sec(th)**2); same(1 + cot(th)**2, csc(th)**2)
same(tan(th), sin(th)/cos(th)); same(sec(th), 1/cos(th)); same(cot(th), cos(th)/sin(th)); same(csc(th), 1/sin(th))
same(sin(-th), -sin(th)); same(cos(-th), cos(th))
same(sin(th + 2*pi), sin(th)); same(cos(th + 2*pi), cos(th)); same(tan(th + pi), tan(th))
same(sin(pi/2 - th), cos(th)); same(cos(pi/2 - th), sin(th)); same(sin(pi - th), sin(th)); same(cos(pi - th), -cos(th))
for sg in (1, -1):                                            # the upper and the lower signs
    same(sin(al + sg*be), sin(al)*cos(be) + sg*cos(al)*sin(be))
    same(cos(al + sg*be), cos(al)*cos(be) - sg*sin(al)*sin(be))
same(tan(al + be), (tan(al) + tan(be))/(1 - tan(al)*tan(be)))
same(sin(2*th), 2*sin(th)*cos(th))
steps(cos(2*th), cos(th)**2 - sin(th)**2, 2*cos(th)**2 - 1, 1 - 2*sin(th)**2)
same(sin(th)**2, (1 - cos(2*th))/2); same(cos(th)**2, (1 + cos(2*th))/2)
same(sin(al)*cos(be), (sin(al - be) + sin(al + be))/2)
same(sin(al)*sin(be), (cos(al - be) - cos(al + be))/2)
same(cos(al)*cos(be), (cos(al - be) + cos(al + be))/2)
```

### Exact values {#exact-values}

Since $\pi$ radians is $180^\circ$, an angle of $d$ degrees is $\pi d/180$ radians.

| ${\theta}$ | ${\sin\theta}$ | ${\cos\theta}$ | ${\tan\theta}$ |
|---|---|---|---|
| ${0}$ | ${0}$ | ${1}$ | ${0}$ |
| ${\pi/6\;\;(30^\circ)}$ | ${1/2}$ | ${\sqrt3/2}$ | ${1/\sqrt3 = \sqrt3/3}$ |
| ${\pi/4\;\;(45^\circ)}$ | ${\sqrt2/2}$ | ${\sqrt2/2}$ | ${1}$ |
| ${\pi/3\;\;(60^\circ)}$ | ${\sqrt3/2}$ | ${1/2}$ | ${\sqrt3}$ |
| ${\pi/2\;\;(90^\circ)}$ | ${1}$ | ${0}$ | undefined |
| ${\pi\;\;(180^\circ)}$ | ${0}$ | ${-1}$ | ${0}$ |
| ${3\pi/2\;\;(270^\circ)}$ | ${-1}$ | ${0}$ | undefined |

The other standard angles follow from the symmetries above: for example
$\sin(5\pi/6) = \sin(\pi/6) = 1/2$ and $\cos(2\pi/3) = -\cos(\pi/3) = -1/2$.

```check
values = {0: (0, 1, 0), pi/6: (Rational(1, 2), sqrt(3)/2, sqrt(3)/3), pi/4: (sqrt(2)/2, sqrt(2)/2, 1),
          pi/3: (sqrt(3)/2, Rational(1, 2), sqrt(3)), pi/2: (1, 0, None), pi: (0, -1, 0), 3*pi/2: (-1, 0, None)}
for ang, (s_, c_, t_) in values.items():
    same(sin(ang), s_); same(cos(ang), c_)
    if t_ is None:
        holds(cos(ang) == 0)                                  # tan undefined: cos = 0
    else:
        same(tan(ang), t_)
same(1/sqrt(3), sqrt(3)/3)
for deg, rad in ((30, pi/6), (45, pi/4), (60, pi/3), (90, pi/2), (180, pi), (270, 3*pi/2)):
    same(pi*deg/180, rad)
steps(sin(5*pi/6), sin(pi/6), Rational(1, 2)); steps(cos(2*pi/3), -cos(pi/3), Rational(-1, 2))
```

## Limits {#limits}

| Limit | Value | Holds for | Module |
|---|---|---|---|
| ${\lim\limits_{\theta\to0}\dfrac{\sin\theta}{\theta}}$ | ${1}$ | ${\theta}$ in radians | [2](module_02_EN.html) |
| ${\lim\limits_{\theta\to0}\dfrac{1 - \cos\theta}{\theta}}$ | ${0}$ | ${\theta}$ in radians | [2](module_02_EN.html) |
| ${\lim\limits_{n\to\infty}\Big(1 + \dfrac{1}{n}\Big)^n}$ | ${e}$ | | [6](module_06_EN.html) |
| ${\lim\limits_{n\to\infty}\Big(1 + \dfrac{x}{n}\Big)^n}$ | ${e^x}$ | every real ${x}$ | [6](module_06_EN.html) |
| ${\lim\limits_{h\to0}\dfrac{e^h - 1}{h}}$ | ${1}$ | | [6](module_06_EN.html) |
| ${\lim\limits_{x\to\infty}\dfrac{1}{x^p}}$ | ${0}$ | ${p > 0}$ | [3](module_03_EN.html) |
| ${\lim\limits_{x\to\infty}\dfrac{\ln x}{x^p}}$ | ${0}$ | ${p > 0}$ | [3](module_03_EN.html), [7](module_07_EN.html) |
| ${\lim\limits_{x\to\infty}\dfrac{x^p}{a^x}}$ | ${0}$ | ${p}$ real, ${a > 1}$ | [3](module_03_EN.html), [7](module_07_EN.html) |
| ${\lim\limits_{n\to\infty}\dfrac{a^n}{n!}}$ | ${0}$ | ${a}$ real | [3](module_03_EN.html) |
| ${\lim\limits_{n\to\infty}\dfrac{n!}{n^n}}$ | ${0}$ | | [3](module_03_EN.html) |
| ${\lim\limits_{x\to0^+} x\ln x}$ | ${0}$ | | [7](module_07_EN.html) |

**Growth rates.** Write $f \ll g$ when $f/g \to 0$. As $x \to \infty$, and for $p > 0$ and $a > 1$,
$$\ln x \ll x^p \ll a^x, \qquad\text{and for whole numbers } n\text{:}\quad a^n \ll n! \ll n^n.$$

```check
limit_is(sin(theta)/theta, theta, 0, 1)
limit_is((1 - cos(theta))/theta, theta, 0, 0)
limit_is((1 + 1/n)**n, n, oo, E)
limit_is((1 + x/n)**n, n, oo, exp(x))
limit_is((exp(h) - 1)/h, h, 0, 1)
pp = symbols('p', positive=True); pr = symbols('p_r', real=True); qq = symbols('q', positive=True)
limit_is(1/x**pp, x, oo, 0)
limit_is(log(x)/x**pp, x, oo, 0)
limit_is(x**pr/(1 + qq)**x, x, oo, 0)                         # a = 1 + q > 1, any real p
limit_is(pp**n/factorial(n), n, oo, 0)                        # |a^n/n!| = |a|^n/n!, and a = 0 is immediate
limit_is(factorial(n)/n**n, n, oo, 0)
limit_is(x*log(x), x, 0, 0, '+')
limit_is(x**pp/(1 + qq)**x, x, oo, 0); limit_is((1 + qq)**n/factorial(n), n, oo, 0)   # the chain of growth rates
```

## Derivatives {#derivatives}

### Definition and estimates {#derivative-definition}

| Name | Formula | Module |
|---|---|---|
| Derivative at ${a}$ | ${f'(a) = \lim\limits_{h \to 0} \dfrac{f(a + h) - f(a)}{h},}$ when the limit exists | [4](module_04_EN.html) |
| Tangent line at ${a}$ | ${y = f(a) + f'(a)(x - a)}$ | [4](module_04_EN.html) |
| Linear approximation | ${f(x) \approx f(a) + f'(a)(x - a)}$ for ${x}$ near ${a}$ | [7](module_07_EN.html) |
| Forward difference | ${f'(a) \approx \dfrac{f(a + h) - f(a)}{h},}$ error about ${-\tfrac{h}{2}f''(a)}$ | [4](module_04_EN.html), [15](module_15_EN.html) |
| Central difference | ${f'(a) \approx \dfrac{f(a + h) - f(a - h)}{2h},}$ error about ${-\tfrac{h^2}{6}f'''(a)}$ | [4](module_04_EN.html), [15](module_15_EN.html) |

As everywhere in the series, the error of an estimate is the exact value minus the estimate, here
$f'(a)$ minus the difference. The two error estimates hold for small $h > 0$ when $f''$ (forward) or
$f'''$ (central) is continuous near $a$. In floating point, rounding adds an error of size about
$\varepsilon/h$, which is why steps of about $10^{-8}$ (forward) and $10^{-5}$ (central) work best.

```check
same(limit(((a + h)**3 - a**3)/h, h, 0, '+-'), 3*a**2)          # the definition, for x^3
same(expand(1 + 3*(x - 1)), 3*x - 2)                           # tangent line of x^3 at 1
same(series(x**3, x, 1, 2).removeO(), 3*x - 2)                 # the same line is the linear approximation
fw = ((a + h)**3 - a**3)/h; ce = ((a + h)**3 - (a - h)**3)/(2*h)
same(3*a**2 - fw, -3*a*h - h**2); same(3*a**2 - ce, -h**2)     # exact errors for x^3 (Module 4)
same(-(h/2)*diff(x**3, x, 2).subs(x, a), -3*a*h); same(-(h**2/6)*diff(x**3, x, 3), -h**2)
for F_ in (sin(x), exp(2*x), log(1 + x**2)):                   # the leading terms, for three smooth f at 1/2
    a_ = Rational(1, 2); d1 = diff(F_, x).subs(x, a_)
    same(limit((d1 - (F_.subs(x, a_ + h) - F_.subs(x, a_))/h)/h, h, 0, '+-'), -diff(F_, x, 2).subs(x, a_)/2)
    same(limit((d1 - (F_.subs(x, a_ + h) - F_.subs(x, a_ - h))/(2*h))/h**2, h, 0, '+-'), -diff(F_, x, 3).subs(x, a_)/6)
```

### Rules {#derivative-rules}

In each rule $f$ and $g$ are differentiable at $x$, and $c$ is a constant.

| Rule | Formula | Module |
|---|---|---|
| Constant | ${\dfrac{d}{dx}(c) = 0}$ | [4](module_04_EN.html) |
| Constant multiple | ${\dfrac{d}{dx}\big(c\,f(x)\big) = c\,f'(x)}$ | [4](module_04_EN.html) |
| Sum and difference | ${(f \pm g)' = f' \pm g'}$ | [4](module_04_EN.html) |
| Product | ${(fg)' = f'g + fg'}$ | [5](module_05_EN.html) |
| Quotient | ${\Big(\dfrac{f}{g}\Big)' = \dfrac{f'g - fg'}{g^2},}$ where ${g(x) \ne 0}$ | [5](module_05_EN.html) |
| Chain | ${\dfrac{d}{dx}f\big(g(x)\big) = f'\big(g(x)\big)\,g'(x),}$ or ${\dfrac{dy}{dx} = \dfrac{dy}{du}\,\dfrac{du}{dx}}$ | [5](module_05_EN.html) |
| Inverse function | ${(f^{-1})'(x) = \dfrac{1}{f'\big(f^{-1}(x)\big)},}$ where ${f'\big(f^{-1}(x)\big) \ne 0}$ | [6](module_06_EN.html) |
| Implicit | for a curve ${F(x, y) = 0}$: ${\dfrac{dy}{dx} = -\dfrac{F_x}{F_y},}$ where ${F_y \ne 0}$ | [6](module_06_EN.html), [17](module_17_EN.html) |
| Logarithmic | ${f'(x) = f(x)\,\dfrac{d}{dx}\ln\abs{f(x)},}$ where ${f(x) \ne 0}$ | [6](module_06_EN.html) |

The inverse-function rule needs $f$ continuous and one-to-one on an open interval, and
differentiable at $f^{-1}(x)$ with a nonzero derivative there. Implicit
differentiation in practice: differentiate both sides of the equation with $y = y(x)$ (the chain
rule turns $y^2$ into $2y\,y'$), then solve for $y'$; Module 17 explains the formula with $F_x$ and
$F_y$.

```check
f, g = Function('f'), Function('g')
same(diff(c, x), 0)
same(diff(c*f(x), x), c*diff(f(x), x))
same(diff(f(x) + g(x), x), diff(f(x), x) + diff(g(x), x)); same(diff(f(x) - g(x), x), diff(f(x), x) - diff(g(x), x))
same(diff(f(x)*g(x), x), diff(f(x), x)*g(x) + f(x)*diff(g(x), x))
same(diff(f(x)/g(x), x), (diff(f(x), x)*g(x) - f(x)*diff(g(x), x))/g(x)**2)
same(diff(f(g(x)), x), diff(f(u), u).subs(u, g(x))*diff(g(x), x))
# inverse function: if g is the inverse of f, differentiate f(g(x)) = x and solve for g'(x)
same(solve(diff(f(g(x)), x) - 1, Derivative(g(x), x))[0], 1/diff(f(u), u).subs(u, g(x)))
same(diff(atan(x), x), 1/diff(tan(u), u).subs(u, atan(x)))   # instances: f = tan, f = exp
xp = symbols('x_p', positive=True)
same(diff(log(xp), xp), 1/diff(exp(u), u).subs(u, log(xp)))
# implicit differentiation: -F_x/F_y agrees with SymPy's idiff on three curves
for curve in (x**2 + y**2 - 25, x**3 + y**3 - 6*x*y, sin(x*y) + y - x**2):
    same(idiff(curve, y, x), -diff(curve, x)/diff(curve, y))
# logarithmic differentiation: ln|f| = ln f where f > 0 and ln(-f) where f < 0
same(f(x)*diff(log(f(x)), x), diff(f(x), x)); same(f(x)*diff(log(-f(x)), x), diff(f(x), x))
same(x**x*diff(x*log(x), x), diff(x**x, x))                   # an instance: x^x = e^(x ln x)
```

### Derivatives of the standard functions {#derivative-table}

| ${f(x)}$ | ${f'(x)}$ | Holds for | Module |
|---|---|---|---|
| ${x^n}$ | ${nx^{n-1}}$ | ${n}$ real and ${x > 0;}$ every ${x \ne 0}$ if ${n}$ is an integer; every ${x}$ if ${n = 1, 2, 3, \ldots}$ | [4](module_04_EN.html), [5](module_05_EN.html), [6](module_06_EN.html) |
| ${e^x}$ | ${e^x}$ | every ${x}$ | [6](module_06_EN.html) |
| ${e^{kx}}$ | ${ke^{kx}}$ | ${k}$ constant | [6](module_06_EN.html) |
| ${a^x}$ | ${a^x\ln a}$ | ${a > 0}$ | [6](module_06_EN.html) |
| ${\ln x}$ | ${\dfrac{1}{x}}$ | ${x > 0}$ | [6](module_06_EN.html) |
| ${\ln\abs{x}}$ | ${\dfrac{1}{x}}$ | ${x \ne 0}$ | [6](module_06_EN.html) |
| ${\log_a x}$ | ${\dfrac{1}{x\ln a}}$ | ${a > 0,}$ ${a \ne 1,}$ ${x > 0}$ | [6](module_06_EN.html) |

Module 4 proves the power rule for positive integers $n$, Module 5 for negative integers and Module 6
for every real $n$.

```check
nr = symbols('n_r', real=True)
same(diff(xp**nr, xp), nr*xp**(nr - 1))
nz = symbols('n_z', integer=True); xq = symbols('x_q', real=True, nonzero=True)
same(diff(xq**nz, xq), nz*xq**(nz - 1))
for N_ in range(-4, 6):
    same(diff(x**N_, x), N_*x**(N_ - 1))
for N_ in range(1, 6):                                        # positive integers: at x = 0 too, from the definition
    same(limit(((0 + h)**N_ - 0**N_)/h, h, 0, '+-'), N_*Integer(0)**(N_ - 1))
same(diff(exp(x), x), exp(x)); same(diff(exp(k*x), x), k*exp(k*x))
ap = symbols('a_p', positive=True)
same(diff(ap**x, x), ap**x*log(ap))
same(diff(log(xp), xp), 1/xp)
xn = symbols('x_n', negative=True)
same(diff(log(Abs(xp)), xp), 1/xp); same(diff(log(Abs(xn)), xn), 1/xn)
same(diff(log(xp, ap), xp), 1/(xp*log(ap)))
```

**Trigonometric functions** ([Module 5](module_05_EN.html)):

| ${f(x)}$ | ${f'(x)}$ | Holds for |
|---|---|---|
| ${\sin x}$ | ${\cos x}$ | every ${x}$ |
| ${\cos x}$ | ${-\sin x}$ | every ${x}$ |
| ${\tan x}$ | ${\sec^2 x}$ | ${\cos x \ne 0}$ |
| ${\cot x}$ | ${-\csc^2 x}$ | ${\sin x \ne 0}$ |
| ${\sec x}$ | ${\sec x\tan x}$ | ${\cos x \ne 0}$ |
| ${\csc x}$ | ${-\csc x\cot x}$ | ${\sin x \ne 0}$ |

These need $x$ in radians: in degrees, $\dfrac{d}{dx}\sin x^\circ = \dfrac{\pi}{180}\cos x^\circ$.

```check
same(diff(sin(x), x), cos(x)); same(diff(cos(x), x), -sin(x))
same(diff(tan(x), x), sec(x)**2); same(diff(cot(x), x), -csc(x)**2)
same(diff(sec(x), x), sec(x)*tan(x)); same(diff(csc(x), x), -csc(x)*cot(x))
same(diff(sin(pi*x/180), x), pi/180*cos(pi*x/180))           # sin of x degrees
```

**Inverse trigonometric functions** ([Module 6](module_06_EN.html)):

| ${f(x)}$ | ${f'(x)}$ | Holds for | Values in |
|---|---|---|---|
| ${\arcsin x}$ | ${\dfrac{1}{\sqrt{1 - x^2}}}$ | ${-1 < x < 1}$ | ${[-\pi/2, \pi/2]}$ |
| ${\arccos x}$ | ${-\dfrac{1}{\sqrt{1 - x^2}}}$ | ${-1 < x < 1}$ | ${[0, \pi]}$ |
| ${\arctan x}$ | ${\dfrac{1}{1 + x^2}}$ | every ${x}$ | ${(-\pi/2, \pi/2)}$ |
| ${\arcsec x}$ | ${\dfrac{1}{\abs{x}\sqrt{x^2 - 1}}}$ | ${\abs{x} > 1}$ | ${[0, \pi/2) \cup (\pi/2, \pi]}$ |

The series takes $\arcsec x = \arccos(1/x)$; books that choose another range for $\arcsec$ get another
sign in its derivative for $x < -1$.

```check
same(diff(asin(x), x), 1/sqrt(1 - x**2)); same(diff(acos(x), x), -1/sqrt(1 - x**2)); same(diff(atan(x), x), 1/(1 + x**2))
same(asin(-1), -pi/2); same(asin(1), pi/2); same(acos(1), 0); same(acos(-1), pi)
limit_is(atan(x), x, oo, pi/2); limit_is(atan(x), x, -oo, -pi/2)
for v_ in (Rational(-9, 10), Rational(-1, 2), 0, Rational(3, 10), 1):   # arcsin and arccos invert sin and cos
    same(sin(asin(v_)), v_); same(cos(acos(v_)), v_)
# arcsec x = arccos(1/x) (the series' range), with slope 1/(|x| sqrt(x^2 - 1)) on both pieces
for v_ in (Integer(2), Integer(-2), Rational(5, 4), Integer(-3)):
    same(asec(v_).rewrite(acos), acos(1/v_)); same(diff(acos(1/x), x).subs(x, v_), 1/(Abs(v_)*sqrt(v_**2 - 1)))
xa = symbols('x_a', positive=True)                             # x = 1 + x_a > 1 and x = -1 - x_a < -1
same(diff(acos(1/x), x).subs(x, 1 + xa), 1/((1 + xa)*sqrt((1 + xa)**2 - 1)))
same(diff(acos(1/x), x).subs(x, -1 - xa), 1/((1 + xa)*sqrt((1 + xa)**2 - 1)))
```

**Hyperbolic functions** ([Module 6](module_06_EN.html)):
$$\sinh x = \frac{e^x - e^{-x}}{2}, \qquad \cosh x = \frac{e^x + e^{-x}}{2}, \qquad \cosh^2 x - \sinh^2 x = 1,$$
with $\tanh x = \dfrac{\sinh x}{\cosh x}$ and $\sech x = \dfrac{1}{\cosh x}$; for $x \ne 0$, also
$\coth x = \dfrac{\cosh x}{\sinh x}$ and $\csch x = \dfrac{1}{\sinh x}$.

| ${f(x)}$ | ${f'(x)}$ | Holds for |
|---|---|---|
| ${\sinh x}$ | ${\cosh x}$ | every ${x}$ |
| ${\cosh x}$ | ${\sinh x}$ | every ${x}$ |
| ${\tanh x}$ | ${\sech^2 x}$ | every ${x}$ |
| ${\coth x}$ | ${-\csch^2 x}$ | ${x \ne 0}$ |
| ${\sech x}$ | ${-\sech x\tanh x}$ | every ${x}$ |
| ${\csch x}$ | ${-\csch x\coth x}$ | ${x \ne 0}$ |

```check
same(sinh(x), (exp(x) - exp(-x))/2); same(cosh(x), (exp(x) + exp(-x))/2)
same(tanh(x), sinh(x)/cosh(x)); same(coth(x), cosh(x)/sinh(x)); same(sech(x), 1/cosh(x)); same(csch(x), 1/sinh(x))
same(cosh(x)**2 - sinh(x)**2, 1)
same(diff(sinh(x), x), cosh(x)); same(diff(cosh(x), x), sinh(x))
same(diff(tanh(x), x), sech(x)**2); same(diff(coth(x), x), -csch(x)**2)
same(diff(sech(x), x), -sech(x)*tanh(x)); same(diff(csch(x), x), -csch(x)*coth(x))
same(diff((exp(x) - exp(-x))/(exp(x) + exp(-x)), x), 4/(exp(x) + exp(-x))**2)   # tanh' from the definitions
```

## Integrals {#integrals}

### Properties of the definite integral {#integral-properties}

[Module 9](module_09_EN.html) teaches these. In each, $f$ and $g$ are integrable on the intervals
involved (continuous functions are) and $k$ is a constant.

| Property | Formula | Holds for |
|---|---|---|
| Definition | ${\displaystyle\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum_{i=1}^{n} f(x_i^*)\,\Delta x,}$ ${\ \Delta x = \dfrac{b - a}{n}}$ | any ${x_i^*}$ in the ${i}$th subinterval |
| Sum | ${\displaystyle\int_a^b \big(f(x) + g(x)\big)\,dx = \int_a^b f(x)\,dx + \int_a^b g(x)\,dx}$ | |
| Constant multiple | ${\displaystyle\int_a^b k\,f(x)\,dx = k\int_a^b f(x)\,dx}$ | |
| Reversed limits | ${\displaystyle\int_b^a f(x)\,dx = -\int_a^b f(x)\,dx,}$ ${\ \displaystyle\int_a^a f(x)\,dx = 0}$ | |
| Adjacent intervals | ${\displaystyle\int_a^b f(x)\,dx + \int_b^c f(x)\,dx = \int_a^c f(x)\,dx}$ | ${a,}$ ${b,}$ ${c}$ in any order |
| Comparison | ${\displaystyle\int_a^b f(x)\,dx \le \int_a^b g(x)\,dx}$ | ${f(x) \le g(x)}$ on ${[a, b],}$ and ${a \le b}$ |
| Bounds | ${m(b - a) \le \displaystyle\int_a^b f(x)\,dx \le M(b - a)}$ | ${m \le f(x) \le M}$ on ${[a, b],}$ and ${a \le b}$ |
| Absolute value | ${\abs{\displaystyle\int_a^b f(x)\,dx} \le \displaystyle\int_a^b \abs{f(x)}\,dx}$ | ${a \le b}$ |
| Even function | ${\displaystyle\int_{-a}^{a} f(x)\,dx = 2\int_0^a f(x)\,dx}$ | ${f(-x) = f(x)}$ |
| Odd function | ${\displaystyle\int_{-a}^{a} f(x)\,dx = 0}$ | ${f(-x) = -f(x)}$ |
| Mean value theorem | ${\displaystyle\int_a^b f(x)\,dx = f(c)\,(b - a)}$ for some ${c}$ in ${[a, b]}$ | ${f}$ continuous on ${[a, b]}$ |

**Sums** (Module 9), for $n = 1, 2, 3, \ldots$:
$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}, \qquad \sum_{i=1}^{n} i^2 = \frac{n(n+1)(2n+1)}{6}, \qquad \sum_{i=1}^{n} i^3 = \Big(\frac{n(n+1)}{2}\Big)^2.$$

```check
f, g = Function('f'), Function('g')
ii = symbols('i', integer=True, positive=True); nn = symbols('n', integer=True, positive=True)
# definition: right, left and midpoint sums of x^2 on [0, b] all tend to b^3/3
for shift in (0, 1, Rational(1, 2)):
    limit_is(summation((b*(ii - shift)/nn)**2*(b/nn), (ii, 1, nn)), nn, oo, b**3/3)
same(integrate(x**2, (x, 0, b)), b**3/3)
same(Integral(f(x) + g(x), (x, a, b)), Integral(f(x), (x, a, b)) + Integral(g(x), (x, a, b)))
same(Integral(k*f(x), (x, a, b)), k*Integral(f(x), (x, a, b)))
for F1 in (x**2*exp(x), cos(x)**3, 1/(1 + x**2)):              # reversed limits, adjacent intervals
    same(integrate(F1, (x, b, a)), -integrate(F1, (x, a, b))); same(integrate(F1, (x, a, a)), 0)
    same(integrate(F1, (x, a, b)) + integrate(F1, (x, b, c)), integrate(F1, (x, a, c)))
holds(integrate(sin(x), (x, 0, pi)) <= integrate(1, (x, 0, pi)))  # sin x <= 1 on [0, pi]
I1 = integrate(exp(-x**2), (x, 0, 1))                          # e^(-1) <= e^(-x^2) <= 1 on [0, 1]
holds(exp(-1)*(1 - 0) <= I1); holds(I1 <= 1*(1 - 0))
same(integrate(Abs(sin(x)), (x, 0, 2*pi)), 4); holds(Abs(integrate(sin(x), (x, 0, 2*pi))) <= 4)
ap = symbols('a_p', positive=True)
same(integrate(x**4*cos(x), (x, -ap, ap)), 2*integrate(x**4*cos(x), (x, 0, ap)))   # even
same(integrate(x**3*cos(x), (x, -ap, ap)), 0); same(integrate(sin(x)**5, (x, -ap, ap)), 0)   # odd
same(integrate(x**2, (x, 0, 3)), sqrt(3)**2*(3 - 0)); holds(0 <= sqrt(3)); holds(sqrt(3) <= 3)   # c = sqrt(3)
same(summation(ii, (ii, 1, nn)), nn*(nn + 1)/2)
same(summation(ii**2, (ii, 1, nn)), nn*(nn + 1)*(2*nn + 1)/6)
same(summation(ii**3, (ii, 1, nn)), (nn*(nn + 1)/2)**2)
```

### The Fundamental Theorem of Calculus {#fundamental-theorem}

[Module 10](module_10_EN.html) proves both parts.

| Statement | Formula | Holds for |
|---|---|---|
| Part 1 | ${\dfrac{d}{dx}\displaystyle\int_a^x f(t)\,dt = f(x)}$ | ${f}$ continuous on ${[a, b],}$ ${x}$ in ${(a, b)}$ |
| Part 1 with the chain rule | ${\dfrac{d}{dx}\displaystyle\int_a^{u(x)} f(t)\,dt = f\big(u(x)\big)\,u'(x)}$ | ${f}$ continuous, ${u}$ differentiable |
| Variable lower limit | ${\dfrac{d}{dx}\displaystyle\int_x^b f(t)\,dt = -f(x)}$ | ${f}$ continuous |
| Part 2 | ${\displaystyle\int_a^b f(x)\,dx = F(b) - F(a) = \big[F(x)\big]_a^b}$ | ${f}$ continuous on ${[a, b]}$ and ${F' = f}$ there |
| Net change | ${\displaystyle\int_a^b F'(x)\,dx = F(b) - F(a)}$ | ${F'}$ continuous on ${[a, b]}$ |
| Indefinite integral | ${\displaystyle\int f(x)\,dx = F(x) + C}$ | means ${F'(x) = f(x)}$ on an interval |

```check
F = Function('F'); uf = Function('u_f')
same(diff(Integral(f(t), (t, a, x)), x), f(x))
same(diff(Integral(f(t), (t, a, uf(x))), x), f(uf(x))*diff(uf(x), x))
same(diff(Integral(f(t), (t, x, b)), x), -f(x))
same(integrate(diff(F(x), x), (x, a, b)), F(b) - F(a))
same(diff(integrate(cos(t)*exp(t), (t, 0, x)), x), cos(x)*exp(x))     # Part 1 on an instance
same(diff(Integral(sqrt(1 + t**4), (t, 0, x**2)), x), sqrt(1 + x**8)*2*x)
same(integrate(cos(x), (x, a, b)), sin(b) - sin(a))                   # Part 2 on an instance
```

### Techniques {#integration-techniques}

| Technique | Formula | Module |
|---|---|---|
| Substitution | ${\displaystyle\int f\big(g(x)\big)\,g'(x)\,dx = \int f(u)\,du,}$ with ${u = g(x)}$ | [10](module_10_EN.html) |
| Substitution, definite | ${\displaystyle\int_a^b f\big(g(x)\big)\,g'(x)\,dx = \int_{g(a)}^{g(b)} f(u)\,du}$ | [10](module_10_EN.html) |
| By parts | ${\displaystyle\int u\,dv = uv - \int v\,du}$ | [11](module_11_EN.html) |
| By parts, definite | ${\displaystyle\int_a^b f(x)\,g'(x)\,dx = \big[f(x)\,g(x)\big]_a^b - \int_a^b f'(x)\,g(x)\,dx}$ | [11](module_11_EN.html) |
| Reduction formula | ${\displaystyle\int \sin^n x\,dx = -\frac{\sin^{n-1}x\cos x}{n} + \frac{n-1}{n}\int \sin^{n-2}x\,dx,}$ ${\ n \ge 2}$ | [11](module_11_EN.html) |
| Partial fractions | ${\dfrac{1}{(x - p)(x - q)} = \dfrac{1}{p - q}\Big(\dfrac{1}{x - p} - \dfrac{1}{x - q}\Big),}$ ${\ p \ne q}$ | [11](module_11_EN.html) |

Substitution needs $g'$ continuous on $[a, b]$ and $f$ continuous on the values of $g$; integration by
parts needs $f'$ and $g'$ continuous on $[a, b]$.

```check
# substitution: if F' = f, then F(g(x)) is an antiderivative of f(g(x)) g'(x) (the chain rule)
antideriv(F(g(x)), diff(F(u), u).subs(u, g(x))*diff(g(x), x), x)
same(integrate(cos(x**2)*2*x, (x, 0, 2)), integrate(cos(u), (u, 0, 4)))      # u = x^2
same(integrate(sin(x)**3*cos(x), (x, 0, pi/2)), integrate(u**3, (u, 0, 1)))  # u = sin x
# by parts: the integrands agree (the product rule), then instances
same(f(x)*diff(g(x), x), diff(f(x)*g(x), x) - diff(f(x), x)*g(x))
same(integrate(x*exp(x), (x, 0, 1)), (1*exp(1) - 0) - integrate(exp(x), (x, 0, 1)))
xp = symbols('x_p', positive=True)
steps(Integral(log(xp), xp), xp*log(xp) - Integral(xp*(1/xp), xp), xp*log(xp) - xp)
for N_ in range(2, 9):                                         # the reduction formula, n = 2..8
    same(diff(-sin(x)**(N_ - 1)*cos(x)/N_, x) + Rational(N_ - 1, N_)*sin(x)**(N_ - 2), sin(x)**N_)
pq, qq = symbols('p q')
same(1/((x - pq)*(x - qq)), (1/(pq - qq))*(1/(x - pq) - 1/(x - qq)))
```

### Antiderivatives {#antiderivatives}

$C$ is an arbitrary constant. Where the domain has several intervals (such as $x \ne 0$ for
$1/x$), the constant may differ from one interval to the next.

| ${f(x)}$ | ${\displaystyle\int f(x)\,dx}$ | Holds for | Module |
|---|---|---|---|
| ${x^n}$ | ${\dfrac{x^{n+1}}{n + 1} + C}$ | ${n \ne -1;}$ ${x > 0}$ unless ${n}$ is an integer | [10](module_10_EN.html) |
| ${\dfrac{1}{x}}$ | ${\ln\abs{x} + C}$ | ${x \ne 0}$ | [10](module_10_EN.html) |
| ${e^x}$ | ${e^x + C}$ | | [10](module_10_EN.html) |
| ${e^{kx}}$ | ${\dfrac{1}{k}e^{kx} + C}$ | ${k \ne 0}$ | [10](module_10_EN.html) |
| ${a^x}$ | ${\dfrac{a^x}{\ln a} + C}$ | ${a > 0,}$ ${a \ne 1}$ | [10](module_10_EN.html) |
| ${\sin x}$ | ${-\cos x + C}$ | | [10](module_10_EN.html) |
| ${\cos x}$ | ${\sin x + C}$ | | [10](module_10_EN.html) |
| ${\sec^2 x}$ | ${\tan x + C}$ | ${\cos x \ne 0}$ | [10](module_10_EN.html) |
| ${\csc^2 x}$ | ${-\cot x + C}$ | ${\sin x \ne 0}$ | [10](module_10_EN.html) |
| ${\sec x\tan x}$ | ${\sec x + C}$ | ${\cos x \ne 0}$ | [10](module_10_EN.html) |
| ${\csc x\cot x}$ | ${-\csc x + C}$ | ${\sin x \ne 0}$ | [10](module_10_EN.html) |
| ${\tan x}$ | ${\ln\abs{\sec x} + C}$ | ${\cos x \ne 0}$ | [10](module_10_EN.html) |
| ${\cot x}$ | ${\ln\abs{\sin x} + C}$ | ${\sin x \ne 0}$ | [10](module_10_EN.html) |
| ${\sec x}$ | ${\ln\abs{\sec x + \tan x} + C}$ | ${\cos x \ne 0}$ | [11](module_11_EN.html) |
| ${\csc x}$ | ${\ln\abs{\csc x - \cot x} + C}$ | ${\sin x \ne 0}$ | [11](module_11_EN.html) |
| ${\sin^2 x}$ | ${\dfrac{x}{2} - \dfrac{\sin 2x}{4} + C}$ | | [11](module_11_EN.html) |
| ${\cos^2 x}$ | ${\dfrac{x}{2} + \dfrac{\sin 2x}{4} + C}$ | | [11](module_11_EN.html) |
| ${\ln x}$ | ${x\ln x - x + C}$ | ${x > 0}$ | [11](module_11_EN.html) |
| ${\dfrac{1}{a^2 + x^2}}$ | ${\dfrac{1}{a}\arctan\dfrac{x}{a} + C}$ | ${a \ne 0}$ | [10](module_10_EN.html), [11](module_11_EN.html) |
| ${\dfrac{1}{\sqrt{a^2 - x^2}}}$ | ${\arcsin\dfrac{x}{a} + C}$ | ${a > 0,}$ ${\abs{x} < a}$ | [10](module_10_EN.html), [11](module_11_EN.html) |
| ${\dfrac{1}{x^2 - a^2}}$ | ${\dfrac{1}{2a}\ln\abs{\dfrac{x - a}{x + a}} + C}$ | ${a \ne 0,}$ ${x \ne \pm a}$ | [11](module_11_EN.html) |
| ${\dfrac{1}{\sqrt{x^2 + a^2}}}$ | ${\ln\big(x + \sqrt{x^2 + a^2}\big) + C}$ | ${a \ne 0}$ | [11](module_11_EN.html) |
| ${\sinh x}$ | ${\cosh x + C}$ | | [10](module_10_EN.html) |
| ${\cosh x}$ | ${\sinh x + C}$ | | [10](module_10_EN.html) |

```check
def ln_abs_antideriv(G, f_, var, factor=1):
    """factor*ln|G| is an antiderivative of f_ where G > 0 (ln G) and where G < 0 (ln(-G))."""
    antideriv(factor*log(G), f_, var); antideriv(factor*log(-G), f_, var)
nr = symbols('n_r', real=True)
antideriv(xp**(nr + 1)/(nr + 1), xp**nr, xp)
for N_ in (-5, -3, -2, 0, 1, 2, 7):
    antideriv(x**(N_ + 1)/(N_ + 1), x**N_, x)
ln_abs_antideriv(x, 1/x, x)
antideriv(exp(x), exp(x), x)
knz = symbols('k_nz', nonzero=True); antideriv(exp(knz*x)/knz, exp(knz*x), x)
antideriv(ap**x/log(ap), ap**x, x)
antideriv(-cos(x), sin(x), x); antideriv(sin(x), cos(x), x)
antideriv(tan(x), sec(x)**2, x); antideriv(-cot(x), csc(x)**2, x)
antideriv(sec(x), sec(x)*tan(x), x); antideriv(-csc(x), csc(x)*cot(x), x)
ln_abs_antideriv(sec(x), tan(x), x); ln_abs_antideriv(sin(x), cot(x), x)
ln_abs_antideriv(sec(x) + tan(x), sec(x), x); ln_abs_antideriv(csc(x) - cot(x), csc(x), x)
antideriv(x/2 - sin(2*x)/4, sin(x)**2, x); antideriv(x/2 + sin(2*x)/4, cos(x)**2, x)
antideriv(xp*log(xp) - xp, log(xp), xp)
anz = symbols('a_nz', real=True, nonzero=True)
antideriv(atan(x/anz)/anz, 1/(anz**2 + x**2), x)
antideriv(asin(x/ap), 1/sqrt(ap**2 - x**2), x)
ln_abs_antideriv((x - anz)/(x + anz), 1/(x**2 - anz**2), x, factor=1/(2*anz))
antideriv(log(x + sqrt(x**2 + anz**2)), 1/sqrt(x**2 + anz**2), x)
xr = symbols('x_r', real=True)                               # sqrt(x^2 + a^2) > |x|, so x + sqrt(x^2 + a^2) > 0:
same(sqrt(xr**2 + anz**2)**2 - Abs(xr)**2, anz**2); holds(anz**2 > 0)   # both are >= 0 and their squares differ by a^2 > 0
antideriv(cosh(x), sinh(x), x); antideriv(sinh(x), cosh(x), x)
```

### Trigonometric substitution {#trig-substitution}

[Module 11](module_11_EN.html) teaches this. In each row $a > 0$; the range of $\theta$ makes the
substitution one-to-one and the square root come out without a sign.

| Integrand contains | Substitute | Then |
|---|---|---|
| ${\sqrt{a^2 - x^2}}$ | ${x = a\sin\theta,}$ ${\ -\tfrac{\pi}{2} \le \theta \le \tfrac{\pi}{2}}$ | ${\sqrt{a^2 - x^2} = a\cos\theta,}$ ${\ dx = a\cos\theta\,d\theta}$ |
| ${\sqrt{a^2 + x^2}}$ | ${x = a\tan\theta,}$ ${\ -\tfrac{\pi}{2} < \theta < \tfrac{\pi}{2}}$ | ${\sqrt{a^2 + x^2} = a\sec\theta,}$ ${\ dx = a\sec^2\theta\,d\theta}$ |
| ${\sqrt{x^2 - a^2}}$ | ${x = a\sec\theta,}$ ${\ 0 \le \theta < \tfrac{\pi}{2}}$ (for ${x \ge a}$) | ${\sqrt{x^2 - a^2} = a\tan\theta,}$ ${\ dx = a\sec\theta\tan\theta\,d\theta}$ |

```check
same(ap**2 - (ap*sin(theta))**2, (ap*cos(theta))**2); same(diff(ap*sin(theta), theta), ap*cos(theta))
same(ap**2 + (ap*tan(theta))**2, (ap*sec(theta))**2); same(diff(ap*tan(theta), theta), ap*sec(theta)**2)
same((ap*sec(theta))**2 - ap**2, (ap*tan(theta))**2); same(diff(ap*sec(theta), theta), ap*sec(theta)*tan(theta))
# no sign in the square roots: a cos, a sec and a tan are >= 0 on the ranges (sampled across each range)
for th_ in (-pi/2, -1, 0, Rational(1, 2), pi/2):
    holds(cos(th_) >= 0); same(sqrt(9 - (3*sin(th_))**2), 3*cos(th_))
for th_ in (Rational(-3, 2), -1, 0, 1, Rational(3, 2), Rational(157, 100)):
    holds(sec(th_) > 0)
for th_ in (0, Rational(1, 2), 1, Rational(3, 2), Rational(157, 100)):
    holds(tan(th_) >= 0)
# an instance: the quarter disc, with x = a sin(theta)
same(integrate(ap*cos(theta)*ap*cos(theta), (theta, 0, pi/2)), integrate(sqrt(ap**2 - x**2), (x, 0, ap)))
same(integrate(sqrt(ap**2 - x**2), (x, 0, ap)), pi*ap**2/4)
```

### Numerical integration {#numerical-integration}

[Module 11](module_11_EN.html) teaches these rules. Divide $[a, b]$ into $n$ subintervals of width
$\Delta x = (b - a)/n$, with endpoints $x_i = a + i\,\Delta x$ and midpoints
$\bar{x}_i = \tfrac12(x_{i-1} + x_i)$.
$$M_n = \Delta x\,\big[f(\bar{x}_1) + f(\bar{x}_2) + \cdots + f(\bar{x}_n)\big]$$
$$T_n = \frac{\Delta x}{2}\big[f(x_0) + 2f(x_1) + 2f(x_2) + \cdots + 2f(x_{n-1}) + f(x_n)\big]$$
$$S_n = \frac{\Delta x}{3}\big[f(x_0) + 4f(x_1) + 2f(x_2) + 4f(x_3) + \cdots + 2f(x_{n-2}) + 4f(x_{n-1}) + f(x_n)\big], \quad n \text{ even}$$

The error $E$ is the integral minus the approximation.

| Rule | Error bound | Exact for |
|---|---|---|
| Midpoint ${M_n}$ | ${\abs{E_M} \le \dfrac{K(b - a)^3}{24n^2},}$ where ${\abs{f''(x)} \le K}$ on ${[a, b]}$ | polynomials of degree ${\le 1}$ |
| Trapezoidal ${T_n}$ | ${\abs{E_T} \le \dfrac{K(b - a)^3}{12n^2},}$ where ${\abs{f''(x)} \le K}$ on ${[a, b]}$ | polynomials of degree ${\le 1}$ |
| Simpson ${S_n}$ | ${\abs{E_S} \le \dfrac{K(b - a)^5}{180n^4},}$ where ${\abs{f^{(4)}(x)} \le K}$ on ${[a, b]}$ | polynomials of degree ${\le 3}$ |

The bounds cannot be improved: for $f(x) = x^2$ the midpoint and trapezoidal errors equal their bounds,
and for $f(x) = x^4$ Simpson's error equals its bound.

```check
def M_(f_, a_, b_, n_):
    d_ = (b_ - a_)/n_; return d_*sum(f_(a_ + (i_ - Rational(1, 2))*d_) for i_ in range(1, n_ + 1))
def T_(f_, a_, b_, n_):
    d_ = (b_ - a_)/n_; return d_/2*(f_(a_) + 2*sum(f_(a_ + i_*d_) for i_ in range(1, n_)) + f_(b_))
def S_(f_, a_, b_, n_):
    d_ = (b_ - a_)/n_; return d_/3*(f_(a_) + sum((4 if i_ % 2 else 2)*f_(a_ + i_*d_) for i_ in range(1, n_)) + f_(b_))
# f = x^2 (f'' = 2 = K), any n: E_M equals its bound, and -E_T equals its bound
dn = (b - a)/nn
Mn = dn*summation((a + (ii - Rational(1, 2))*dn)**2, (ii, 1, nn))
Tn = dn/2*(a**2 + 2*summation((a + ii*dn)**2, (ii, 1, nn - 1)) + b**2)
same(integrate(x**2, (x, a, b)) - Mn, 2*(b - a)**3/(24*nn**2))
same(Tn - integrate(x**2, (x, a, b)), 2*(b - a)**3/(12*nn**2))
same(M_(lambda s: s**2, a, b, 5), Mn.subs(nn, 5)); same(T_(lambda s: s**2, a, b, 5), Tn.subs(nn, 5))
# f = x^4 (f'''' = 24 = K), n = 2m: Simpson's error equals its bound
mm = symbols('m', integer=True, positive=True); d2 = (b - a)/(2*mm)
S2m = d2/3*summation((a + (2*ii - 2)*d2)**4 + 4*(a + (2*ii - 1)*d2)**4 + (a + 2*ii*d2)**4, (ii, 1, mm))
same(S2m - integrate(x**4, (x, a, b)), 24*(b - a)**5/(180*(2*mm)**4))
same(S_(lambda s: s**4, a, b, 6), S2m.subs(mm, 3))
# exact for degree <= 1 (midpoint, trapezoidal) and degree <= 3 (Simpson)
c0, c1, c2, c3 = symbols('c0:4')
lin = lambda s: c0 + c1*s; cub = lambda s: c0 + c1*s + c2*s**2 + c3*s**3
for n_ in (1, 2, 3):
    same(M_(lin, a, b, n_), integrate(lin(x), (x, a, b))); same(T_(lin, a, b, n_), integrate(lin(x), (x, a, b)))
for n_ in (2, 4):
    same(S_(cub, a, b, n_), integrate(cub(x), (x, a, b)))
# the bounds hold for f = e^x on [0, 1] (K = e for f'' and f'''') and f = sin x on [0, pi] (K = 1)
for n_ in (2, 4, 10):
    holds(Abs(E - 1 - M_(exp, 0, 1, n_)) <= E/(24*n_**2)); holds(Abs(E - 1 - T_(exp, 0, 1, n_)) <= E/(12*n_**2))
    holds(Abs(E - 1 - S_(exp, 0, 1, n_)) <= E/(180*n_**4))
    holds(Abs(2 - M_(sin, 0, pi, n_)) <= pi**3/(24*n_**2)); holds(Abs(2 - S_(sin, 0, pi, n_)) <= pi**5/(180*n_**4))
```

### Improper integrals {#improper-integrals}

[Module 12](module_12_EN.html) teaches these. An improper integral **converges** when the limit
that defines it exists and is finite:
$$\int_a^\infty f(x)\,dx = \lim_{t\to\infty}\int_a^t f(x)\,dx, \qquad \int_a^b f(x)\,dx = \lim_{t\to b^-}\int_a^t f(x)\,dx \ \text{ if } f \text{ is unbounded near } b,$$
and $\int_{-\infty}^{\infty} f(x)\,dx = \int_{-\infty}^{c} f(x)\,dx + \int_{c}^{\infty} f(x)\,dx$ when both
integrals on the right converge. (Both are needed: $\int_{-t}^{t} x\,dx = 0$ for every $t$, yet
$\int_{-\infty}^{\infty} x\,dx$ diverges.)

| Integral | Value | Holds for |
|---|---|---|
| ${\displaystyle\int_1^\infty \frac{dx}{x^p}}$ | ${\dfrac{1}{p - 1}}$ | ${p > 1;}$ diverges for ${p \le 1}$ |
| ${\displaystyle\int_0^1 \frac{dx}{x^p}}$ | ${\dfrac{1}{1 - p}}$ | ${p < 1;}$ diverges for ${p \ge 1}$ |
| ${\displaystyle\int_0^\infty e^{-ax}\,dx}$ | ${\dfrac{1}{a}}$ | ${a > 0}$ |
| ${\displaystyle\int_{-\infty}^{\infty} \frac{dx}{1 + x^2}}$ | ${\pi}$ | |
| ${\displaystyle\int_{-\infty}^{\infty} e^{-x^2}\,dx}$ | ${\sqrt{\pi}}$ | quoted in Module 12, proved in [Module 19](module_19_EN.html) |

**Comparison.** If $0 \le f(x) \le g(x)$ for $x \ge a$, then $\int_a^\infty f(x)\,dx$ converges when
$\int_a^\infty g(x)\,dx$ converges, and $\int_a^\infty g(x)\,dx$ diverges when $\int_a^\infty f(x)\,dx$
diverges.

```check
qp = symbols('q', positive=True)                               # p = 1 + q > 1, p = 1 - q < 1
same(integrate(x**(-(1 + qp)), (x, 1, oo)), 1/qp); same(1/qp, 1/((1 + qp) - 1))
same(integrate(x**(-(1 - qp)), (x, 1, oo)), oo); same(integrate(1/x, (x, 1, oo)), oo)
same(integrate(x**(-(1 - qp)), (x, 0, 1)), 1/qp); same(1/qp, 1/(1 - (1 - qp)))
same(integrate(x**(-(1 + qp)), (x, 0, 1)), oo); same(integrate(1/x, (x, 0, 1)), oo)
tt = symbols('t', positive=True)
limit_is(integrate(1/x**2, (x, 1, tt)), tt, oo, 1); limit_is(integrate(1/sqrt(x), (x, tt, 1)), tt, 0, 2, '+')
same(integrate(x, (x, -tt, tt)), 0); same(integrate(x, (x, 0, oo)), oo)
same(integrate(exp(-ap*x), (x, 0, oo)), 1/ap)
same(integrate(1/(1 + x**2), (x, -oo, oo)), pi)
same(integrate(exp(-x**2), (x, -oo, oo)), sqrt(pi))
# comparison: 0 <= e^(-x^2) <= e^(-x) for x >= 1 (x^2 >= x), so the first integral is at most 1/e
same(integrate(exp(-x), (x, 1, oo)), exp(-1)); holds(integrate(exp(-x**2), (x, 1, oo)) <= exp(-1))
x1 = symbols('x_1', positive=True); same(((1 + x1)**2 - (1 + x1)).expand(), x1**2 + x1)   # x^2 - x >= 0 for x = 1 + x1
# and 1/x <= 1/sqrt(x) for x >= 1, where the integral of 1/x diverges
same(integrate(1/sqrt(x), (x, 1, oo)), oo)
```

## Applications of integration {#applications}

[Module 12](module_12_EN.html) teaches these, except the average value
([Module 9](module_09_EN.html)) and the arc length of a parametric curve ([Module 16](module_16_EN.html)).

| Quantity | Formula | Use it when |
|---|---|---|
| Area between curves | ${A = \displaystyle\int_a^b \big(f(x) - g(x)\big)\,dx}$ | ${f(x) \ge g(x)}$ on ${[a, b]}$: vertical strips, top minus bottom. If the curves cross, integrate ${\abs{f(x) - g(x)},}$ splitting at the crossings |
| Area, horizontal strips | ${A = \displaystyle\int_c^d \big(x_R(y) - x_L(y)\big)\,dy}$ | the region is easier to describe by its right and left boundaries ${x = x_R(y)}$ and ${x = x_L(y)}$ |
| Volume by slicing | ${V = \displaystyle\int_a^b A(x)\,dx}$ | the slice perpendicular to the ${x}$-axis at ${x}$ has a known area ${A(x)}$ |
| Discs | ${V = \pi\displaystyle\int_a^b f(x)^2\,dx}$ | the region under ${y = f(x) \ge 0}$ turns about the ${x}$-axis: each slice is a disc of radius ${f(x)}$ |
| Washers | ${V = \pi\displaystyle\int_a^b \big(R(x)^2 - r(x)^2\big)\,dx}$ | each slice is a ring with outer radius ${R(x)}$ and inner radius ${r(x),}$ ${0 \le r(x) \le R(x)}$ |
| Shells | ${V = 2\pi\displaystyle\int_a^b x\,f(x)\,dx}$ | the region under ${y = f(x) \ge 0,}$ ${0 \le a \le x \le b,}$ turns about the ${y}$-axis; in general ${2\pi\int(\text{radius})(\text{height})}$ |
| Arc length | ${L = \displaystyle\int_a^b \sqrt{1 + f'(x)^2}\,dx}$ | a curve ${y = f(x)}$ with ${f'}$ continuous on ${[a, b]}$ |
| Arc length, parametric | ${L = \displaystyle\int_\alpha^\beta \sqrt{x'(t)^2 + y'(t)^2}\,dt}$ | a curve ${\big(x(t), y(t)\big)}$ traced once for ${\alpha \le t \le \beta,}$ with ${x',}$ ${y'}$ continuous |
| Average value | ${f_{\text{avg}} = \dfrac{1}{b - a}\displaystyle\int_a^b f(x)\,dx}$ | ${f}$ integrable on ${[a, b]}$ |
| Work | ${W = \displaystyle\int_a^b F(x)\,dx}$ | a force ${F(x)}$ acts along a line from ${x = a}$ to ${x = b;}$ a spring obeys ${F(x) = kx}$ (Hooke's law); to pump a liquid, add up (weight of a thin layer) ${\times}$ (distance it is lifted) |
| Centre of mass of a rod | ${\bar{x} = \dfrac{\int_a^b x\,\rho(x)\,dx}{\int_a^b \rho(x)\,dx}}$ | a rod on ${[a, b]}$ with density ${\rho(x)}$ (mass per unit length) |
| Centroid of a plate | ${\bar{x} = \dfrac{1}{A}\displaystyle\int_a^b x\big(f(x) - g(x)\big)\,dx}$ | a uniform plate ${g(x) \le y \le f(x),}$ ${a \le x \le b,}$ of area ${A}$ |
| | ${\bar{y} = \dfrac{1}{A}\displaystyle\int_a^b \tfrac12\big(f(x)^2 - g(x)^2\big)\,dx}$ | the same plate |
| Probability | ${P(a \le X \le b) = \displaystyle\int_a^b f(x)\,dx}$ | ${f}$ is a probability density: ${f \ge 0}$ and ${\int_{-\infty}^{\infty} f(x)\,dx = 1}$ |
| Mean | ${\mu = \displaystyle\int_{-\infty}^{\infty} x\,f(x)\,dx}$ | ${X}$ has the density ${f}$ |

With the force in newtons and the distance in metres, the work is in joules.

```check
rp, hp, Rp, bp, sp_, dp, rho_ = symbols('r h R b s d rho', positive=True)
# areas: a disc of radius r, a triangle (0,0), (b,0), (b,h) by vertical and by horizontal strips
same(integrate(sqrt(rp**2 - x**2) - (-sqrt(rp**2 - x**2)), (x, -rp, rp)), pi*rp**2)
same(integrate(hp*x/bp - 0, (x, 0, bp)), bp*hp/2); same(integrate(bp - bp*y/hp, (y, 0, hp)), bp*hp/2)
# curves that cross: sin x and cos x on [0, pi] cross at pi/4
A_sc = integrate(cos(x) - sin(x), (x, 0, pi/4)) + integrate(sin(x) - cos(x), (x, pi/4, pi))
same(A_sc, 2*sqrt(2)); same(integrate(Abs(sin(x) - cos(x)), (x, 0, pi)), 2*sqrt(2))
# slicing: a pyramid with a square base of side s and height h has volume s^2 h / 3
same(integrate((sp_*x/hp)**2, (x, 0, hp)), sp_**2*hp/3)
# discs: a ball and a cone
same(pi*integrate(sqrt(rp**2 - x**2)**2, (x, -rp, rp)), Rational(4, 3)*pi*rp**3)
same(pi*integrate((Rp*x/hp)**2, (x, 0, hp)), pi*Rp**2*hp/3)
# washers: a ball of radius sqrt(c^2 + rho^2) with a hole of radius rho leaves a ring of height L = 2c
# whose volume is pi L^3 / 6 whatever rho is (the napkin ring)
cp = symbols('c_p', positive=True)
same(pi*integrate((cp**2 + rho_**2 - x**2) - rho_**2, (x, -cp, cp)), pi*(2*cp)**3/6)
# shells: the ball again (height 2 sqrt(r^2 - x^2)), and the cone (height h(1 - x/R))
same(2*pi*integrate(x*2*sqrt(rp**2 - x**2), (x, 0, rp)), Rational(4, 3)*pi*rp**3)
same(2*pi*integrate(x*hp*(1 - x/Rp), (x, 0, Rp)), pi*Rp**2*hp/3)
# arc length: a quarter circle (pi r / 2), a segment of slope m (Pythagoras), a circle traced once
fq = sqrt(rp**2 - x**2)
same(1 + diff(fq, x)**2, rp**2/(rp**2 - x**2)); same(integrate(rp/sqrt(rp**2 - x**2), (x, 0, rp)), pi*rp/2)
same(integrate(sqrt(1 + diff(m*x + c, x)**2), (x, 0, 1)), sqrt(1 + m**2))
same(integrate(sqrt(diff(rp*cos(t), t)**2 + diff(rp*sin(t), t)**2), (t, 0, 2*pi)), 2*pi*rp)
# average value: a linear function averages to its value at the midpoint; sin on [0, pi] averages 2/pi
same(integrate(m*x + c, (x, a, b))/(b - a), m*(a + b)/2 + c); same(integrate(sin(x), (x, 0, pi))/pi, 2/pi)
# work: a constant force; a spring stretched by d stores k d^2 / 2;
# emptying a full cylindrical tank (radius R, depth h) over its top lifts its mass by h/2 on average
same(integrate(5, (x, 0, dp)), 5*dp); same(integrate(k*x, (x, 0, dp)), k*dp**2/2)
gp = symbols('g', positive=True)
same(integrate(rho_*gp*pi*Rp**2*(hp - y), (y, 0, hp)), (rho_*pi*Rp**2*hp)*gp*hp/2)
# centres of mass: a uniform rod, a triangle (the mean of its vertices), a half disc (4r/(3 pi))
Lp = symbols('L', positive=True)
same(integrate(x*1, (x, 0, Lp))/integrate(1, (x, 0, Lp)), Lp/2)
Atri = bp*hp/2
same(integrate(x*(hp*x/bp - 0), (x, 0, bp))/Atri, (0 + bp + bp)/3)
same(integrate(((hp*x/bp)**2 - 0)/2, (x, 0, bp))/Atri, (0 + 0 + hp)/3)
same(integrate((rp**2 - x**2)/2, (x, -rp, rp))/(pi*rp**2/2), 4*rp/(3*pi))
same(integrate(x*(sqrt(rp**2 - x**2) - 0), (x, -rp, rp)), 0)
# probability: the exponential density and the uniform density
lam = symbols('lambda', positive=True)
same(integrate(lam*exp(-lam*x), (x, 0, oo)), 1); same(integrate(x*lam*exp(-lam*x), (x, 0, oo)), 1/lam)
same(integrate(1/(b - a), (x, a, b)), 1); same(integrate(x/(b - a), (x, a, b)), (a + b)/2)
```

## Differential equations {#differential-equations}

[Module 13](module_13_EN.html) teaches these; [Module 6](module_06_EN.html) checks the solution of
$y' = ky$ by substitution.

| Model | Equation | Solution | Holds for |
|---|---|---|---|
| Growth and decay | ${\dfrac{dy}{dt} = ky}$ | ${y = y_0e^{kt}}$ | ${y(0) = y_0;}$ growth if ${k > 0}$ (doubling time ${\ln 2/k}$), decay if ${k < 0}$ (half-life ${\ln 2/\abs{k}}$) |
| Newton's law of cooling | ${\dfrac{dT}{dt} = -k(T - T_s)}$ | ${T = T_s + (T_0 - T_s)e^{-kt}}$ | ${k > 0,}$ ${T(0) = T_0,}$ surroundings at ${T_s}$ |
| Logistic | ${\dfrac{dP}{dt} = kP\Big(1 - \dfrac{P}{M}\Big)}$ | ${P = \dfrac{M}{1 + Ae^{-kt}},}$ ${\ A = \dfrac{M - P_0}{P_0}}$ | ${k > 0,}$ ${M > 0,}$ ${P(0) = P_0 > 0;}$ ${P \to M}$ as ${t \to \infty}$ |
| Separable | ${\dfrac{dy}{dx} = g(x)\,h(y)}$ | ${\displaystyle\int \frac{dy}{h(y)} = \int g(x)\,dx}$ | where ${h(y) \ne 0;}$ each zero ${y_1}$ of ${h}$ gives the constant solution ${y = y_1}$ |
| First-order linear | ${y' + P(x)\,y = Q(x)}$ | ${y = \dfrac{1}{I(x)}\Big(\displaystyle\int I(x)\,Q(x)\,dx + C\Big),}$ ${\ I(x) = e^{\int P(x)\,dx}}$ | ${P}$ and ${Q}$ continuous on an interval |

**Second-order linear equations with constant coefficients**, $ay'' + by' + cy = 0$ with $a \ne 0$:
try $y = e^{rx}$, which gives the characteristic equation $ar^2 + br + c = 0$.

| Roots of ${ar^2 + br + c = 0}$ | General solution | When |
|---|---|---|
| two real roots ${r_1 \ne r_2}$ | ${y = C_1e^{r_1x} + C_2e^{r_2x}}$ | ${b^2 - 4ac > 0}$ |
| one double root ${r = -\dfrac{b}{2a}}$ | ${y = (C_1 + C_2x)\,e^{rx}}$ | ${b^2 - 4ac = 0}$ |
| complex roots ${\alpha \pm i\beta}$ | ${y = e^{\alpha x}(C_1\cos\beta x + C_2\sin\beta x)}$ | ${b^2 - 4ac < 0;}$ ${\ \alpha = -\dfrac{b}{2a},}$ ${\ \beta = \dfrac{\sqrt{4ac - b^2}}{2\abs{a}}}$ |

**Euler's method** for $y' = F(x, y)$ with $y(x_0) = y_0$ and step $h$:
$$x_{n+1} = x_n + h, \qquad y_{n+1} = y_n + h\,F(x_n, y_n).$$
The error at a fixed $x$ is roughly proportional to $h$: halving the step roughly halves the error.
For $y' = y$ with $y(0) = 1$ the method gives $(1 + h)^{1/h}$ at $x = 1$ (when $1/h$ is a whole number),
and the error $e - (1 + h)^{1/h}$ is about $\tfrac{e}{2}\,h$ for small $h$.

```check
y0_, T0, Ts = symbols('y_0 T_0 T_s'); kp, Mp, P0p = symbols('k_p M P_0', positive=True)
Yg = y0_*exp(k*t)
same(diff(Yg, t), k*Yg); same(Yg.subs(t, 0), y0_)
yf = Function('y')
same(dsolve(Eq(yf(t).diff(t), k*yf(t)), yf(t), ics={yf(0): y0_}).rhs, Yg)
same(exp(kp*(log(2)/kp)), 2); same(exp(-kp*(log(2)/Abs(-kp))), Rational(1, 2))   # doubling time, half-life
Tt = Ts + (T0 - Ts)*exp(-kp*t)
same(diff(Tt, t), -kp*(Tt - Ts)); same(Tt.subs(t, 0), T0)
Pt = Mp/(1 + (Mp - P0p)/P0p*exp(-kp*t))
same(diff(Pt, t), kp*Pt*(1 - Pt/Mp)); same(Pt.subs(t, 0), P0p); limit_is(Pt, t, oo, Mp)
# separable, two instances: y' = x y^2 (int dy/y^2 = int x dx gives -1/y = x^2/2 + C1) and y' = y cos x
C1, C2 = symbols('C1 C2')
ys = -1/(x**2/2 + C1)
same(-1/ys, x**2/2 + C1); same(diff(ys, x), x*ys**2); same(diff(0*x, x), x*0**2)   # and the constant solution y = 0
yc = C1*exp(sin(x)); same(diff(yc, x), yc*cos(x))
# first-order linear: the formula solves y' + P y = Q for any continuous P and Q
Pf, Qf = Function('P'), Function('Q')
I_ = exp(Integral(Pf(x), x))
ylin = (Integral(I_*Qf(x), x) + C1)/I_
holds(simplify(diff(ylin, x) + Pf(x)*ylin - Qf(x)) == 0)
yl2 = exp(-2*x)*(integrate(exp(2*x)*exp(x), x) + C1)           # an instance: y' + 2y = e^x
same(diff(yl2, x) + 2*yl2, exp(x)); same(yl2, exp(x)/3 + C1*exp(-2*x))
# second order: with given roots, b and c follow from the roots (Vieta); each solution satisfies the equation
an = symbols('a_n', real=True, nonzero=True)
r1, r2, al_, be_ = symbols('r_1 r_2 alpha beta', real=True)
Lop = lambda Y_, B_, C_: an*diff(Y_, x, 2) + B_*diff(Y_, x) + C_*Y_
B1, Cq1 = -an*(r1 + r2), an*r1*r2
same(Lop(C1*exp(r1*x) + C2*exp(r2*x), B1, Cq1), 0); same_set(solve(an*r**2 + B1*r + Cq1, r), [r1, r2])
same(B1**2 - 4*an*Cq1, an**2*(r1 - r2)**2)                     # > 0 when r1 != r2
B2, Cq2 = -2*an*r1, an*r1**2
same(Lop((C1 + C2*x)*exp(r1*x), B2, Cq2), 0); same(B2**2 - 4*an*Cq2, 0); same(-B2/(2*an), r1)
B3, Cq3 = -2*an*al_, an*(al_**2 + be_**2)
same(Lop(exp(al_*x)*(C1*cos(be_*x) + C2*sin(be_*x)), B3, Cq3), 0)
same_set(solve(an*r**2 + B3*r + Cq3, r), [al_ + I*be_, al_ - I*be_])
same(B3**2 - 4*an*Cq3, -4*an**2*be_**2)                       # < 0 when beta != 0
bpos = symbols('beta_p', positive=True)
same(-B3/(2*an), al_); same(sqrt(4*an*Cq3.subs(be_, bpos) - B3.subs(be_, bpos)**2)/(2*Abs(an)), bpos)
# Euler's method for y' = y, y(0) = 1: (1 + h)^(1/h) at x = 1, error about (e/2) h
def euler(F_, x0, y0e, h_, n_):
    for _ in range(n_):
        x0, y0e = x0 + h_, y0e + h_*F_(x0, y0e)
    return y0e
for h_ in (Rational(1, 10), Rational(1, 20), Rational(1, 40)):
    same(euler(lambda X1, Y1: Y1, 0, 1, h_, int(1/h_)), (1 + h_)**int(1/h_))
limit_is((E - (1 + h)**(1/h))/h, h, 0, E/2, '+')
e10, e20 = E - Rational(11, 10)**10, E - Rational(21, 20)**20     # halving h roughly halves the error
holds(e10/e20 > Rational(19, 10)); holds(e10/e20 < Rational(21, 10))
```

## Series {#series}

### Standard series {#standard-series}

[Module 14](module_14_EN.html) teaches these.

| Series | Sum | Holds for |
|---|---|---|
| Geometric: ${\displaystyle\sum_{n=0}^{\infty} ar^n = a + ar + ar^2 + \cdots}$ | ${\dfrac{a}{1 - r}}$ | ${\abs{r} < 1;}$ diverges for ${\abs{r} \ge 1}$ (if ${a \ne 0}$) |
| Geometric partial sum: ${\displaystyle\sum_{n=0}^{N-1} ar^n}$ | ${a\,\dfrac{1 - r^N}{1 - r}}$ | ${r \ne 1}$ |
| ${p}$-series: ${\displaystyle\sum_{n=1}^{\infty} \frac{1}{n^p}}$ | converges | ${p > 1;}$ diverges for ${p \le 1}$ |
| Harmonic: ${\displaystyle\sum_{n=1}^{\infty} \frac{1}{n}}$ | diverges | the ${N}$th partial sum grows like ${\ln N}$ |
| Telescoping: ${\displaystyle\sum_{n=1}^{\infty} \frac{1}{n(n+1)} = \sum_{n=1}^{\infty}\Big(\frac{1}{n} - \frac{1}{n+1}\Big)}$ | ${1}$ | |

```check
nn = symbols('n', integer=True, positive=True); NN = symbols('N', integer=True, positive=True)
gs = Sum(r**n, (n, 0, oo)).doit()                              # SymPy's answer, with its condition
same(gs.args[0][0], 1/(1 - r)); holds(gs.args[0][1] == (Abs(r) < 1))
same(summation(3*Rational(1, 2)**n, (n, 0, oo)), 6); same(summation(Rational(-1, 3)**n, (n, 0, oo)), Rational(3, 4))
for N_ in range(1, 8):
    same(sum(a*r**j for j in range(N_)), a*(1 - r**N_)/(1 - r))
limit_is(a*(1 - Rational(1, 2)**NN)/(1 - Rational(1, 2)), NN, oo, 2*a)
qp = symbols('q', positive=True)                               # |r| >= 1: the terms do not tend to 0
limit_is((1 + qp)**n, n, oo, oo); same(summation(1, (n, 0, oo)), oo)
same([sum((-1)**j for j in range(N_)) for N_ in range(1, 7)], [1, 0, 1, 0, 1, 0])   # r = -1: partial sums 1, 0, 1, 0, ...
for p_, conv in ((3, True), (2, True), (Rational(3, 2), True), (1, False), (Rational(1, 2), False), (0, False)):
    holds(Sum(1/n**p_, (n, 1, oo)).is_convergent() == conv)
same(summation(1/n, (n, 1, oo)), oo); limit_is(harmonic(n) - log(n), n, oo, EulerGamma)   # H_N - ln N -> 0.5772...
same(1/(n*(n + 1)), 1/n - 1/(n + 1)); same(summation(1/(nn*(nn + 1)), (nn, 1, NN)), 1 - 1/(NN + 1))
same(summation(1/(n*(n + 1)), (n, 1, oo)), 1)
```

### Convergence tests {#convergence-tests}

[Module 14](module_14_EN.html) teaches these tests for a series $\sum a_n$. Their hypotheses need to
hold only from some $n$ on: the first terms of a series do not affect whether it converges.

| Test | If | Then |
|---|---|---|
| Divergence | ${\lim\limits_{n\to\infty} a_n \ne 0,}$ or the limit does not exist | ${\sum a_n}$ diverges. If ${a_n \to 0,}$ the test says nothing |
| Integral | ${a_n = f(n),}$ with ${f}$ continuous, positive and decreasing on ${[1, \infty)}$ | ${\sum a_n}$ and ${\int_1^\infty f(x)\,dx}$ both converge or both diverge; the remainder ${R_N = \sum_{n=N+1}^{\infty} a_n}$ satisfies ${\int_{N+1}^{\infty} f(x)\,dx \le R_N \le \int_N^\infty f(x)\,dx}$ |
| Comparison | ${0 \le a_n \le b_n}$ | if ${\sum b_n}$ converges, so does ${\sum a_n;}$ if ${\sum a_n}$ diverges, so does ${\sum b_n}$ |
| Limit comparison | ${a_n > 0,}$ ${b_n > 0}$ and ${\lim\limits_{n\to\infty} \dfrac{a_n}{b_n} = L}$ with ${0 < L < \infty}$ | ${\sum a_n}$ and ${\sum b_n}$ both converge or both diverge |
| Alternating series | ${a_n = (-1)^{n-1}b_n}$ with ${b_n > 0,}$ ${b_{n+1} \le b_n}$ and ${b_n \to 0}$ | ${\sum a_n}$ converges, and its sum ${S}$ satisfies ${\abs{S - S_N} \le b_{N+1}}$ |
| Absolute convergence | ${\sum \abs{a_n}}$ converges | ${\sum a_n}$ converges. The converse is false: ${\sum (-1)^{n-1}/n}$ converges, ${\sum 1/n}$ does not |
| Ratio | ${\rho = \lim\limits_{n\to\infty} \abs{\dfrac{a_{n+1}}{a_n}}}$ | ${\rho < 1}$: ${\sum a_n}$ converges absolutely; ${\rho > 1}$ or ${\rho = \infty}$: it diverges; ${\rho = 1}$: no conclusion |
| Root | ${\rho = \lim\limits_{n\to\infty} \abs{a_n}^{1/n}}$ | the same three conclusions as the ratio test |

```check
# divergence test, and a_n -> 0 is not enough
limit_is(n/(n + 1), n, oo, 1); same(summation(n/(n + 1), (n, 1, oo)), oo)
limit_is(1/n, n, oo, 0); same(summation(1/n, (n, 1, oo)), oo)
# integral test remainder for 1/n^2 with N = 10, 20
for N_ in (10, 20):
    RN = pi**2/6 - summation(1/n**2, (n, 1, N_))
    holds(integrate(1/x**2, (x, N_ + 1, oo)) <= RN); holds(RN <= integrate(1/x**2, (x, N_, oo)))
same(summation(1/n**2, (n, 1, oo)), pi**2/6)
# comparison: 1/(n^2 + 1) <= 1/n^2 (converges); 1/n <= 1/sqrt(n) (diverges)
s_cmp = summation(1/(n**2 + 1), (n, 1, oo)); holds(s_cmp <= pi**2/6); holds(Sum(1/(n**2 + 1), (n, 1, oo)).is_convergent())
holds(not Sum(1/sqrt(n), (n, 1, oo)).is_convergent())
# limit comparison with 1/n^2 (converges) and 1/n (diverges); L = 1 both times
limit_is(((n + 1)/(n**3 + 2))/(1/n**2), n, oo, 1); holds(Sum((n + 1)/(n**3 + 2), (n, 1, oo)).is_convergent())
limit_is(((n + 1)/(n**2 + 5))/(1/n), n, oo, 1); holds(not Sum((n + 1)/(n**2 + 5), (n, 1, oo)).is_convergent())
# alternating series: sum (-1)^(n-1)/n = ln 2, error at most the first omitted term
same(summation((-1)**(n - 1)/n, (n, 1, oo)), log(2))
for N_ in (5, 10, 50):
    holds(Abs(log(2) - sum(Rational((-1)**(j - 1), j) for j in range(1, N_ + 1))) <= Rational(1, N_ + 1))
# absolute convergence: sum (-1)^(n-1)/n^2 converges (to pi^2/12) because sum 1/n^2 does
same(summation((-1)**(n - 1)/n**2, (n, 1, oo)), pi**2/12)
# ratio test: 1/n! (rho = 0, sum e), 2^n/n (rho = 2, diverges), 1/n and 1/n^2 (rho = 1 for both)
same(factorial(nn)/factorial(nn + 1), 1/(nn + 1)); limit_is(1/(n + 1), n, oo, 0); same(summation(1/factorial(n), (n, 0, oo)), E)
limit_is((2**(n + 1)/(n + 1))/(2**n/n), n, oo, 2); limit_is(2**n/n, n, oo, oo)
limit_is(n/(n + 1), n, oo, 1); limit_is(n**2/(n + 1)**2, n, oo, 1)
# root test: (n/(2n + 1))^n has rho = 1/2; indeed n/(2n + 1) < 1/2, so the terms are below (1/2)^n
limit_is(n/(2*n + 1), n, oo, Rational(1, 2)); same(Rational(1, 2) - nn/(2*nn + 1), 1/(2*(2*nn + 1)))
```

### Taylor's formula {#taylor}

If $f$ has $n + 1$ derivatives on an open interval containing $a$ and $x$
([Module 15](module_15_EN.html)), then
$$f(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x - a)^k + R_n(x), \qquad R_n(x) = \frac{f^{(n+1)}(c)}{(n + 1)!}(x - a)^{n+1}$$
for some $c$ between $a$ and $x$ (the Lagrange form of the remainder). The sum is the Taylor
polynomial $T_n(x)$ of degree $n$ about $a$; with $a = 0$ it is a Maclaurin polynomial.

**Taylor's inequality.** If $\abs{f^{(n+1)}(t)} \le M$ for every $t$ between $a$ and $x$, then
$$\abs{R_n(x)} \le \frac{M}{(n + 1)!}\,\abs{x - a}^{n+1}.$$
**Taylor series.** The series $\sum_{k=0}^{\infty} c_k(x - a)^k$ with $c_k = f^{(k)}(a)/k!$ equals
$f(x)$ exactly when $R_n(x) \to 0$ as $n \to \infty$.

```check
# T_n from the derivatives agrees with SymPy's series, about a = 0, 1 and 4
for fn_, a_, n_ in ((exp(x), 0, 6), (log(x), 1, 6), (sqrt(x), 4, 5), (sin(x), pi/6, 5)):
    Tn_ = sum(diff(fn_, x, j).subs(x, a_)/factorial(j)*(x - a_)**j for j in range(n_ + 1))
    same(series(fn_, x, a_, n_ + 1).removeO(), Tn_)
# Lagrange form: e^x, a = 0, n = 3, x = 1: R_3 = e - 8/3 = e^c/4! with c = ln(24(e - 8/3)) in (0, 1)
c_ = log(24*(E - Rational(8, 3)))
same(exp(c_)/factorial(4)*1**4, E - (1 + 1 + Rational(1, 2) + Rational(1, 6))); holds(0 < c_); holds(c_ < 1)
# cos x, a = 0, n = 3, x = 1/2: R_3 = cos(c) (1/2)^4 / 4! with c = arccos(384 (cos(1/2) - 7/8)) in (0, 1/2)
c2 = acos(384*(cos(Rational(1, 2)) - Rational(7, 8)))
same(cos(c2)/factorial(4)*Rational(1, 2)**4, cos(Rational(1, 2)) - (1 - Rational(1, 8))); holds(0 < c2); holds(c2 < Rational(1, 2))
# Taylor's inequality: sin x (M = 1, n = 4, T_4 = x - x^3/6) and e^x on [0, 1] (M = e, n = 5)
holds(Abs(sin(1) - Rational(5, 6)) <= Rational(1, 120))
holds(Abs(E - sum(Rational(1, factorial(j)) for j in range(6))) <= E/factorial(6))
# R_n -> 0 for e^x at every x: |R_n| <= e^|x| |x|^(n+1)/(n+1)!
limit_is(exp(Abs(x))*Abs(x)**(n + 1)/factorial(n + 1), n, oo, 0)
```

### Maclaurin series {#maclaurin}

[Module 15](module_15_EN.html) teaches these.

| Function | Series | Equals the function for |
|---|---|---|
| ${e^x}$ | ${\displaystyle\sum_{n=0}^{\infty} \frac{x^n}{n!} = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots}$ | every ${x}$ |
| ${\sin x}$ | ${\displaystyle\sum_{n=0}^{\infty} (-1)^n\frac{x^{2n+1}}{(2n+1)!} = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots}$ | every ${x}$ |
| ${\cos x}$ | ${\displaystyle\sum_{n=0}^{\infty} (-1)^n\frac{x^{2n}}{(2n)!} = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots}$ | every ${x}$ |
| ${\dfrac{1}{1 - x}}$ | ${\displaystyle\sum_{n=0}^{\infty} x^n = 1 + x + x^2 + x^3 + \cdots}$ | ${-1 < x < 1}$ |
| ${\ln(1 + x)}$ | ${\displaystyle\sum_{n=1}^{\infty} (-1)^{n-1}\frac{x^n}{n} = x - \frac{x^2}{2} + \frac{x^3}{3} - \cdots}$ | ${-1 < x \le 1}$ |
| ${\arctan x}$ | ${\displaystyle\sum_{n=0}^{\infty} (-1)^n\frac{x^{2n+1}}{2n+1} = x - \frac{x^3}{3} + \frac{x^5}{5} - \cdots}$ | ${-1 \le x \le 1}$ |
| ${(1 + x)^k}$ | ${\displaystyle\sum_{n=0}^{\infty} \binom{k}{n}x^n = 1 + kx + \frac{k(k-1)}{2!}x^2 + \cdots}$ | ${-1 < x < 1,}$ ${k}$ real |

In the binomial series $\dbinom{k}{n} = \dfrac{k(k-1)\cdots(k-n+1)}{n!}$ and $\dbinom{k}{0} = 1$. When
$k$ is a whole number the series stops at $n = k$ and holds for every $x$ (the binomial theorem). At
the ends $x = \pm 1$ it depends on $k$: for $k > 0$ the series converges on $[-1, 1]$, for
$-1 < k < 0$ on $(-1, 1]$, and for $k \le -1$ only on $(-1, 1)$.

At $x = 1$ the series give $\ln 2 = 1 - \tfrac12 + \tfrac13 - \cdots$ and
$\tfrac{\pi}{4} = 1 - \tfrac13 + \tfrac15 - \cdots$. **Euler's formula** (Module 15):
$e^{i\theta} = \cos\theta + i\sin\theta$ for every real $\theta$; in particular $e^{i\pi} = -1$.

```check
NT = 10                                                        # the first terms agree with SymPy's series
same(series(exp(x), x, 0, NT).removeO(), sum(x**j/factorial(j) for j in range(NT)))
same(series(sin(x), x, 0, 2*NT).removeO(), sum((-1)**j*x**(2*j + 1)/factorial(2*j + 1) for j in range(NT)))
same(series(cos(x), x, 0, 2*NT).removeO(), sum((-1)**j*x**(2*j)/factorial(2*j) for j in range(NT)))
same(series(1/(1 - x), x, 0, NT).removeO(), sum(x**j for j in range(NT)))
same(series(log(1 + x), x, 0, NT).removeO(), sum((-1)**(j - 1)*x**j/j for j in range(1, NT)))
same(series(atan(x), x, 0, 2*NT).removeO(), sum((-1)**j*x**(2*j + 1)/(2*j + 1) for j in range(NT)))
same(series((1 + x)**k, x, 0, 6).removeO(), sum(binomial(k, j)*x**j for j in range(6)))
same(expand_func(binomial(k, 3)), k*(k - 1)*(k - 2)/factorial(3)); same(binomial(k, 0), 1)
# the sums: SymPy sums each series and states where; the conditions give the intervals in the table
same(summation(x**n/factorial(n), (n, 0, oo)), exp(x))
same(summation((-1)**n*x**(2*n + 1)/factorial(2*n + 1), (n, 0, oo)), sin(x))
same(summation((-1)**n*x**(2*n)/factorial(2*n), (n, 0, oo)), cos(x))
xs_in = lambda cond, pts: [bool(cond.subs(x, p_)) for p_ in pts]
pts = (-2, -1, Rational(-1, 2), 0, Rational(1, 2), 1, 2)
g1 = summation(x**n, (n, 0, oo)); same(g1.args[0][0], 1/(1 - x))
same(xs_in(g1.args[0][1], pts), [False, False, True, True, True, False, False])
g2 = summation((-1)**(n - 1)*x**n/n, (n, 1, oo))              # SymPy writes -Piecewise((-log(x + 1), ...), ...)
pw2 = [f_ for f_ in Mul.make_args(g2) if isinstance(f_, Piecewise)][0]; same(g2, -pw2)
same(-pw2.args[0][0], log(1 + x)); same(xs_in(pw2.args[0][1], pts), [False, False, True, True, True, True, False])
g3 = summation((-1)**n*x**(2*n + 1)/(2*n + 1), (n, 0, oo)); same(g3.args[0][0], atan(x))
same(xs_in(g3.args[0][1], pts), [False, True, True, True, True, True, False])
same(summation((-1)**(n - 1)/n, (n, 1, oo)), log(2)); same(summation((-1)**n/(2*n + 1), (n, 0, oo)), pi/4)
holds(not Sum(-1/n, (n, 1, oo)).is_convergent())              # ln(1 + x) at x = -1
holds(Sum(-(-1)**n/(2*n + 1), (n, 0, oo)).is_convergent())    # arctan at x = -1
# the binomial series: |x| < 1 always (ratio |x|), whole k: the binomial theorem, ends depend on k
limit_is(Abs((k - n)/(n + 1))*Abs(x), n, oo, Abs(x))
for K_ in range(0, 6):
    same(expand((1 + x)**K_), sum(binomial(K_, j)*x**j for j in range(K_ + 1))); same(binomial(K_, K_ + 1), 0)
kr = symbols('k_r', real=True)
g4 = summation(binomial(kr, n)*x**n, (n, 0, oo)); same(g4.args[0][0], (1 + x)**kr)
for k_, at_minus1, at_plus1 in ((Rational(1, 2), True, True), (3, True, True), (Rational(-1, 2), False, True),
                                (-1, False, False), (Rational(-3, 2), False, False)):
    same([bool(g4.args[0][1].subs({kr: k_, x: X1})) for X1 in (-1, 1, Rational(1, 2))], [at_minus1, at_plus1, True])
same(summation(binomial(Rational(1, 2), n), (n, 0, oo)), sqrt(2))   # k = 1/2 at x = 1
same([binomial(-1, j) for j in range(6)], [1, -1, 1, -1, 1, -1])      # k = -1 at x = 1: terms +-1, no limit 0
th = symbols('theta', real=True)
same(exp(I*th), cos(th) + I*sin(th)); same(exp(I*pi), -1)
```

## Several variables {#several-variables}

### Vectors, lines and planes {#vectors}

[Module 16](module_16_EN.html) teaches these. Here $\vb{a} = \langle a_1, a_2, a_3\rangle$,
$\vb{b} = \langle b_1, b_2, b_3\rangle$, $\vb{c} = \langle c_1, c_2, c_3\rangle$, and $\theta$ is the
angle between $\vb{a}$ and $\vb{b}$, $0 \le \theta \le \pi$.

| Quantity | Formula | Notes |
|---|---|---|
| Length | ${\norm{\vb{a}} = \sqrt{a_1^2 + a_2^2 + a_3^2} = \sqrt{\vb{a}\cdot\vb{a}}}$ | |
| Dot product | ${\vb{a}\cdot\vb{b} = a_1b_1 + a_2b_2 + a_3b_3 = \norm{\vb{a}}\norm{\vb{b}}\cos\theta}$ | ${\vb{a}}$ and ${\vb{b}}$ are perpendicular when ${\vb{a}\cdot\vb{b} = 0}$ |
| Projection | ${\operatorname{proj}_{\vb{a}}\vb{b} = \dfrac{\vb{a}\cdot\vb{b}}{\norm{\vb{a}}^2}\,\vb{a}}$ | ${\vb{a} \ne \vb{0};}$ ${\vb{b} - \operatorname{proj}_{\vb{a}}\vb{b}}$ is perpendicular to ${\vb{a}}$ |
| Cross product | ${\vb{a}\times\vb{b} = \langle a_2b_3 - a_3b_2,\ a_3b_1 - a_1b_3,\ a_1b_2 - a_2b_1\rangle}$ | perpendicular to ${\vb{a}}$ and ${\vb{b}}$ (right-hand rule: ${\vb{i}\times\vb{j} = \vb{k}}$); ${\vb{b}\times\vb{a} = -\vb{a}\times\vb{b}}$ |
| Length of ${\vb{a}\times\vb{b}}$ | ${\norm{\vb{a}\times\vb{b}} = \norm{\vb{a}}\norm{\vb{b}}\sin\theta}$ | the area of the parallelogram with sides ${\vb{a}}$ and ${\vb{b}}$ |
| Triple product | ${\vb{a}\cdot(\vb{b}\times\vb{c}) = \det\begin{pmatrix} a_1 & a_2 & a_3\\ b_1 & b_2 & b_3\\ c_1 & c_2 & c_3\end{pmatrix}}$ | its absolute value is the volume of the box (parallelepiped) on ${\vb{a},}$ ${\vb{b},}$ ${\vb{c}}$ |
| Line | ${\vb{r}(t) = \vb{r}_0 + t\,\vb{v},}$ that is ${x = x_0 + v_1t,}$ ${y = y_0 + v_2t,}$ ${z = z_0 + v_3t}$ | through ${(x_0, y_0, z_0)}$ with direction ${\vb{v} = \langle v_1, v_2, v_3\rangle \ne \vb{0}}$ |
| Plane | ${a(x - x_0) + b(y - y_0) + c(z - z_0) = 0}$ | through ${(x_0, y_0, z_0)}$ with normal ${\vb{n} = \langle a, b, c\rangle \ne \vb{0}}$ |
| Distance from a point to a plane | ${D = \dfrac{\abs{ax_1 + by_1 + cz_1 + d}}{\sqrt{a^2 + b^2 + c^2}}}$ | the point ${(x_1, y_1, z_1),}$ the plane ${ax + by + cz + d = 0}$ |

```check
a1, a2, a3, b1, b2, b3, c1, c2, c3 = symbols('a1:4 b1:4 c1:4', real=True)
Av, Bv, Cv = Matrix([a1, a2, a3]), Matrix([b1, b2, b3]), Matrix([c1, c2, c3])
same(Av.norm(), sqrt(a1**2 + a2**2 + a3**2)); same(Av.norm(), sqrt(Av.dot(Av)))
same(Av.dot(Bv), a1*b1 + a2*b2 + a3*b3)
# |a||b| cos(theta) = a.b is the law of cosines for the triangle with sides a, b and a - b
same(Av.dot(Bv), (Av.norm()**2 + Bv.norm()**2 - (Av - Bv).norm()**2)/2)
same(acos(Matrix([1, 0, 0]).dot(Matrix([1, 1, 0]))/(1*sqrt(2))), pi/4)          # an instance: 45 degrees
proj = Av.dot(Bv)/Av.dot(Av)*Av; same(Av.dot(Bv - proj), 0)
Xv = Av.cross(Bv)
same(Xv, Matrix([a2*b3 - a3*b2, a3*b1 - a1*b3, a1*b2 - a2*b1]))
same(Av.dot(Xv), 0); same(Bv.dot(Xv), 0); same(Bv.cross(Av), -Xv)
same(Matrix([1, 0, 0]).cross(Matrix([0, 1, 0])), Matrix([0, 0, 1]))
# |a x b|^2 = |a|^2 |b|^2 - (a.b)^2 = |a|^2 |b|^2 (1 - cos^2 theta), and sin theta >= 0 on [0, pi]
same(Xv.dot(Xv), Av.dot(Av)*Bv.dot(Bv) - Av.dot(Bv)**2)
same(Matrix([3, 0, 0]).cross(Matrix([1, 2, 0])).norm(), 3*2)  # a parallelogram with base 3 and height 2
same(Av.dot(Bv.cross(Cv)), Matrix([[a1, a2, a3], [b1, b2, b3], [c1, c2, c3]]).det())
same(Matrix([2, 0, 0]).dot(Matrix([0, 3, 0]).cross(Matrix([0, 0, 4]))), 2*3*4)  # a 2 x 3 x 4 box
x0, y0, z0, v1, v2, v3 = symbols('x0 y0 z0 v1 v2 v3', real=True)
ln_ = Matrix([x0, y0, z0]) + t*Matrix([v1, v2, v3])
same(ln_.subs(t, 0), Matrix([x0, y0, z0])); same(ln_.diff(t), Matrix([v1, v2, v3]))
# a plane through P0 spanned by U and W has normal n = U x W; every point P0 + sU + tW satisfies the equation
U3, W3 = Matrix(symbols('U1:4', real=True)), Matrix(symbols('W1:4', real=True))
nv = U3.cross(W3); P0v = Matrix([x0, y0, z0]); Pt3 = P0v + s*U3 + t*W3
same(nv[0]*(Pt3[0] - x0) + nv[1]*(Pt3[1] - y0) + nv[2]*(Pt3[2] - z0), 0)
pa, pb, pc, pd, X1, Y1, Z1 = symbols('a_p b_p c_p d_p x_1 y_1 z_1', real=True)
nq, Pq = Matrix([pa, pb, pc]), Matrix([X1, Y1, Z1])
Qq = Pq - (nq.dot(Pq) + pd)/nq.dot(nq)*nq                       # the foot of the perpendicular from P
same(nq.dot(Qq) + pd, 0); same((Pq - Qq).cross(nq), zeros(3, 1))   # Q is on the plane and PQ is along n
same((Pq - Qq).dot(Pq - Qq), (pa*X1 + pb*Y1 + pc*Z1 + pd)**2/(pa**2 + pb**2 + pc**2))
same(Abs(1*1 + 2*2 + 2*3 - 2)/sqrt(1 + 4 + 4), 3)              # the point (1, 2, 3), the plane x + 2y + 2z = 2
```

### Partial derivatives and the gradient {#partial-derivatives}

[Module 17](module_17_EN.html) teaches these. The functions are differentiable where the formulas
are used.

| Idea | Formula | Holds for |
|---|---|---|
| Partial derivatives | ${f_x = \dfrac{\partial f}{\partial x}}$: differentiate in ${x}$ with ${y}$ held fixed; ${\ f_y = \dfrac{\partial f}{\partial y}}$ | |
| Second partials | ${f_{xx} = \dfrac{\partial^2 f}{\partial x^2},}$ ${\ f_{xy} = (f_x)_y = \dfrac{\partial^2 f}{\partial y\,\partial x}}$ | |
| Clairaut's theorem | ${f_{xy} = f_{yx}}$ | ${f_{xy}}$ and ${f_{yx}}$ continuous near the point |
| Gradient | ${\nabla f = \langle f_x, f_y, f_z\rangle}$ | |
| Directional derivative | ${D_{\vb{u}}f = \nabla f\cdot\vb{u}}$ | ${\vb{u}}$ a unit vector |
| Steepest ascent | the largest ${D_{\vb{u}}f}$ is ${\norm{\nabla f},}$ in the direction of ${\nabla f;}$ ${\nabla f}$ is perpendicular to the level curves (or surfaces) | ${\nabla f \ne \vb{0}}$ |
| Chain rule | ${\dfrac{dz}{dt} = \dfrac{\partial z}{\partial x}\dfrac{dx}{dt} + \dfrac{\partial z}{\partial y}\dfrac{dy}{dt}}$ | ${z = f(x, y),}$ ${x = x(t),}$ ${y = y(t)}$ |
| Chain rule, two parameters | ${\dfrac{\partial z}{\partial s} = \dfrac{\partial z}{\partial x}\dfrac{\partial x}{\partial s} + \dfrac{\partial z}{\partial y}\dfrac{\partial y}{\partial s},}$ and the same for ${t}$ | ${x = x(s, t),}$ ${y = y(s, t)}$ |
| Tangent plane | ${z = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)}$ | the graph ${z = f(x, y)}$ at ${(a, b)}$ |
| Linear approximation | ${f(x, y) \approx f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b)}$ | ${(x, y)}$ near ${(a, b)}$ |
| Tangent plane to a level surface | ${\nabla F(P)\cdot\langle x - x_0,\ y - y_0,\ z - z_0\rangle = 0}$ | the surface ${F(x, y, z) = k}$ through ${P = (x_0, y_0, z_0),}$ ${\nabla F(P) \ne \vb{0}}$ |

Without continuity Clairaut's theorem can fail: for $f(x, y) = \dfrac{xy(x^2 - y^2)}{x^2 + y^2}$, with
$f(0, 0) = 0$, the mixed partials at the origin are $f_{xy}(0, 0) = -1$ and $f_{yx}(0, 0) = 1$.

```check
fxy = x**3*y**2 + sin(x*y) + exp(x - 2*y)
same(diff(fxy, x, y), diff(diff(fxy, x), y)); same(diff(fxy, x, y), diff(fxy, y, x))   # notation; Clairaut
fc = x*y*(x**2 - y**2)/(x**2 + y**2)                            # the counterexample, f(0, 0) = 0
fx_on_axis = limit((fc.subs(x, h) - 0)/h, h, 0)                 # f_x(0, y) for y != 0: (f(h, y) - f(0, y))/h
fy_on_axis = limit((fc.subs(y, h) - 0)/h, h, 0)                 # f_y(x, 0) for x != 0
same(fx_on_axis, -y); same(fy_on_axis, x)
same(limit((fc.subs({x: h, y: 0}) - 0)/h, h, 0), 0)            # f_x(0, 0) = 0
same(limit((fc.subs({x: 0, y: h}) - 0)/h, h, 0), 0)             # f_y(0, 0) = 0
same(diff(fx_on_axis, y), -1); same(diff(fy_on_axis, x), 1)     # f_xy(0, 0) = -1, f_yx(0, 0) = 1
# directional derivative: the limit definition agrees with grad f . u
F2 = x**2*y + y**3; P0 = {x: 1, y: 2}; uv = Matrix([Rational(3, 5), Rational(4, 5)])
gr = Matrix([diff(F2, x), diff(F2, y)]).subs(P0)
same(limit((F2.subs({x: 1 + h*uv[0], y: 2 + h*uv[1]}) - F2.subs(P0))/h, h, 0), gr.dot(uv))
# steepest ascent: |grad f|^2 - (grad f . u)^2 >= 0 for every unit u, with equality for u = grad f/|grad f|
ph_ = symbols('phi', real=True); ue = Matrix([cos(ph_), sin(ph_)])
same(gr.dot(gr) - gr.dot(ue)**2, (gr[0]*sin(ph_) - gr[1]*cos(ph_))**2); same(gr.dot(gr/gr.norm()), gr.norm())
rc2 = Matrix([cos(t), sin(t)]); same(Matrix([2*x, 2*y]).subs({x: rc2[0], y: rc2[1]}).dot(rc2.diff(t)), 0)   # x^2 + y^2 = 1
# chain rule: for every cubic f(x, y) and any curves x(t), y(t); then an instance with two parameters
cf = symbols('c_0:10'); Xf, Yf = Function('X')(t), Function('Y')(t)
fpoly = sum(cf[j]*x**i_*y**k_ for j, (i_, k_) in enumerate([(i_, k_) for i_ in range(4) for k_ in range(4) if i_ + k_ <= 3]))
same(diff(fpoly.subs({x: Xf, y: Yf}), t), (diff(fpoly, x)*diff(Xf, t) + diff(fpoly, y)*diff(Yf, t)).subs({x: Xf, y: Yf}))
zf = x**2*y + exp(x*y); xs2, ys2 = s*t, s + t**2
same(diff(zf.subs({x: xs2, y: ys2}), s), (diff(zf, x)*diff(xs2, s) + diff(zf, y)*diff(ys2, s)).subs({x: xs2, y: ys2}))
same(diff(zf.subs({x: xs2, y: ys2}), t), (diff(zf, x)*diff(xs2, t) + diff(zf, y)*diff(ys2, t)).subs({x: xs2, y: ys2}))
# tangent plane to z = x^2 + y^2 at (1, 2): the error is (x - 1)^2 + (y - 2)^2, of second order
fp = x**2 + y**2; Pab = {x: 1, y: 2}
plane = fp.subs(Pab) + diff(fp, x).subs(Pab)*(x - 1) + diff(fp, y).subs(Pab)*(y - 2)
same(plane, 5 + 2*(x - 1) + 4*(y - 2)); same(fp - plane, (x - 1)**2 + (y - 2)**2)
# level surface x^2 + y^2 + z^2 = 14 at (1, 2, 3): the same plane as for the graph z = sqrt(14 - x^2 - y^2)
nP = Matrix([diff(x**2 + y**2 + z**2, w_) for w_ in (x, y, z)]).subs({x: 1, y: 2, z: 3}); same(nP, Matrix([2, 4, 6]))
zg = sqrt(14 - x**2 - y**2)
same_set(solve(nP.dot(Matrix([x - 1, y - 2, z - 3])), z), [3 + diff(zg, x).subs(Pab)*(x - 1) + diff(zg, y).subs(Pab)*(y - 2)])
```

### Optimisation {#optimisation}

[Module 18](module_18_EN.html) teaches these. A **critical point** of $f(x, y)$ is a point where
$\nabla f = \vb{0}$ or a partial derivative does not exist; local maxima and minima inside the
domain occur only at critical points. At a critical point $(a, b)$, with the second partials
continuous near it, let
$$H = \begin{pmatrix} f_{xx} & f_{xy}\\ f_{yx} & f_{yy}\end{pmatrix}, \qquad D = \det H = f_{xx}f_{yy} - f_{xy}^2 \quad\text{at } (a, b).$$

| ${D}$ | ${f_{xx}(a, b)}$ | ${(a, b)}$ is |
|---|---|---|
| ${D > 0}$ | ${f_{xx} > 0}$ | a local minimum |
| ${D > 0}$ | ${f_{xx} < 0}$ | a local maximum |
| ${D < 0}$ | | a saddle point |
| ${D = 0}$ | | not decided by the test |

**Lagrange multipliers.** The extreme values of $f(x, y, z)$ subject to $g(x, y, z) = k$ occur at
points where
$$\nabla f = \lambda\,\nabla g, \qquad g(x, y, z) = k \qquad (\nabla g \ne \vb{0} \text{ there}),$$
and with two constraints $g = k$ and $h = c$, where $\nabla f = \lambda\,\nabla g + \mu\,\nabla h$
($\nabla g$ and $\nabla h$ not parallel there).

```check
O0 = {x: 0, y: 0}
for fq, kind in ((x**2 + 3*y**2, 'min'), (-x**2 - x*y - y**2, 'max'), (x**2 - y**2, 'saddle'), (x*y, 'saddle')):
    same([diff(fq, w_).subs(O0) for w_ in (x, y)], [0, 0])     # (0, 0) is a critical point
    Hq = hessian(fq, (x, y)).subs(O0); Dq, fxx_ = Hq.det(), Hq[0, 0]
    same(Hq[0, 0]*Hq[1, 1] - Hq[0, 1]**2, Dq)
    ev = list(Hq.eigenvals())                                   # f = (1/2) X^T H X: the signs of the eigenvalues decide
    if kind == 'min': holds(Dq > 0); holds(fxx_ > 0); holds(all(e_ > 0 for e_ in ev))
    if kind == 'max': holds(Dq > 0); holds(fxx_ < 0); holds(all(e_ < 0 for e_ in ev))
    if kind == 'saddle': holds(Dq < 0); holds(min(ev) < 0); holds(max(ev) > 0)
# D = 0 decides nothing: x^4 + y^4 (minimum), x^4 - y^4 (saddle), x^2 + y^3 (neither)
for fq in (x**4 + y**4, x**4 - y**4, x**2 + y**3):
    same(hessian(fq, (x, y)).subs(O0).det(), 0)
holds((x**4 + y**4).subs({x: Rational(1, 10), y: Rational(-1, 5)}) > 0)
same([(x**4 - y**4).subs({x: h, y: 0}), (x**4 - y**4).subs({x: 0, y: h})], [h**4, -h**4])
same([(x**2 + y**3).subs({x: 0, y: h}), (x**2 + y**3).subs({x: 0, y: -h})], [h**3, -h**3])
# Lagrange, one constraint: f = xy on x + y = 10 is largest at (5, 5), as substitution confirms
lam_, mu_ = symbols('lambda mu')
sol1 = solve([y - lam_*1, x - lam_*1, x + y - 10], [x, y, lam_], dict=True)
same(sol1, [{x: 5, y: 5, lam_: 5}]); same(solve(diff(x*(10 - x), x), x), [5]); same((x*(10 - x)).subs(x, 5), 25)
# two constraints: x^2 + y^2 + z^2 on x + y + z = 1 and x - y = 0 is smallest at (1/3, 1/3, 1/3)
sol2 = solve([2*x - lam_ - mu_, 2*y - lam_ + mu_, 2*z - lam_, x + y + z - 1, x - y], [x, y, z, lam_, mu_], dict=True)
same(sol2, [{x: Rational(1, 3), y: Rational(1, 3), z: Rational(1, 3), lam_: Rational(2, 3), mu_: 0}])
same(solve(diff(2*s**2 + (1 - 2*s)**2, s), s), [Rational(1, 3)])   # along the line (s, s, 1 - 2s)
```

### Multiple integrals {#multiple-integrals}

[Module 19](module_19_EN.html) teaches these.

| Coordinates | Change of variables | Element of area or volume |
|---|---|---|
| Polar | ${x = r\cos\theta,}$ ${\ y = r\sin\theta}$ | ${dA = r\,dr\,d\theta}$ |
| Cylindrical | ${x = r\cos\theta,}$ ${\ y = r\sin\theta,}$ ${\ z = z}$ | ${dV = r\,dz\,dr\,d\theta}$ |
| Spherical | ${x = \rho\sin\phi\cos\theta,}$ ${\ y = \rho\sin\phi\sin\theta,}$ ${\ z = \rho\cos\phi}$ | ${dV = \rho^2\sin\phi\,d\rho\,d\phi\,d\theta}$ |

Here $r \ge 0$, $\rho \ge 0$, and $\phi$ is the angle from the positive $z$-axis, $0 \le \phi \le \pi$
(many physics books swap the names $\theta$ and $\phi$).

- **Fubini's theorem.** If $f$ is continuous on the rectangle $R = [a, b] \times [c, d]$, then
  $$\iint_R f(x, y)\,dA = \int_a^b\!\!\int_c^d f(x, y)\,dy\,dx = \int_c^d\!\!\int_a^b f(x, y)\,dx\,dy.$$
- **Change of variables.** If $x = g(u, v)$, $y = h(u, v)$ maps a region $S$ one-to-one onto $R$
  (except perhaps on the boundary), with continuous first partials and a non-zero Jacobian, then
  $$\iint_R f(x, y)\,dA = \iint_S f\big(g(u, v), h(u, v)\big)\,\abs{\frac{\partial(x, y)}{\partial(u, v)}}\,du\,dv, \qquad \frac{\partial(x, y)}{\partial(u, v)} = \det\begin{pmatrix} x_u & x_v\\ y_u & y_v\end{pmatrix}.$$
- **Mass and centre of mass** of a plate $D$ with density $\rho(x, y)$:
  $$m = \iint_D \rho\,dA, \qquad \bar{x} = \frac{1}{m}\iint_D x\rho\,dA, \qquad \bar{y} = \frac{1}{m}\iint_D y\rho\,dA.$$
- **The Gaussian integral.** In polar coordinates $\iint_{\R^2} e^{-(x^2 + y^2)}\,dA = \pi$, so
  $\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}$.

```check
rs, phs, ths, rhos, zs = symbols('r_s phi_s theta_s rho_s z_s', nonnegative=True)
same(Matrix([rs*cos(ths), rs*sin(ths)]).jacobian([rs, ths]).det(), rs)
same(Matrix([rs*cos(ths), rs*sin(ths), zs]).jacobian([rs, ths, zs]).det(), rs)
sph = Matrix([rhos*sin(phs)*cos(ths), rhos*sin(phs)*sin(ths), rhos*cos(phs)])
same(sph.jacobian([rhos, phs, ths]).det(), rhos**2*sin(phs)); same(sph.dot(sph), rhos**2)
same(acos(sph[2]/rhos).subs({phs: Rational(1, 3)}), Rational(1, 3))   # phi is the angle from the z-axis
same(integrate(x*y**2 + exp(x), (y, 0, 2), (x, 0, 1)), integrate(x*y**2 + exp(x), (x, 0, 1), (y, 0, 2)))   # Fubini
Rq, hq = symbols('R_q h_q', positive=True)
same(integrate(rs, (rs, 0, Rq), (ths, 0, 2*pi)), pi*Rq**2)                         # a disc
same(integrate(rs, (zs, 0, hq), (rs, 0, Rq), (ths, 0, 2*pi)), pi*Rq**2*hq)          # a cylinder
same(integrate(rhos**2*sin(phs), (rhos, 0, Rq), (phs, 0, pi), (ths, 0, 2*pi)), Rational(4, 3)*pi*Rq**3)   # a ball
same(integrate(exp(-rs**2)*rs, (rs, 0, oo), (ths, 0, 2*pi)), pi); same(integrate(exp(-x**2), (x, -oo, oo))**2, pi)
# x = u + v, y = u - v (Jacobian -2) maps the unit square onto the square with corners (0,0), (1,1), (2,0), (1,-1)
uc, vc = symbols('u_c v_c')
Jc = Matrix([uc + vc, uc - vc]).jacobian([uc, vc]).det(); same(Jc, -2)
direct = integrate(x**2, (y, -x, x), (x, 0, 1)) + integrate(x**2, (y, x - 2, 2 - x), (x, 1, 2))
same(integrate((uc + vc)**2*Abs(Jc), (uc, 0, 1), (vc, 0, 1)), direct); same(direct, Rational(7, 3))
# a uniform half disc y >= 0 of radius R: y-bar = 4R/(3 pi), as found with one variable
mh = integrate(1*rs, (rs, 0, Rq), (ths, 0, pi)); same(mh, pi*Rq**2/2)
same(integrate(rs*sin(ths)*rs, (rs, 0, Rq), (ths, 0, pi))/mh, 4*Rq/(3*pi))
same(integrate(rs*cos(ths)*rs, (rs, 0, Rq), (ths, 0, pi))/mh, 0)
```

### Vector calculus {#vector-calculus}

[Module 20](module_20_EN.html) teaches these. $\vb{F} = \langle P, Q, R\rangle$ is a vector field and
$C$ a curve traced once by $\vb{r}(t)$, $a \le t \le b$, with $\vb{r}'$ continuous.

| Idea | Formula | Holds for |
|---|---|---|
| Line integral of a function | ${\displaystyle\int_C f\,ds = \int_a^b f\big(\vb{r}(t)\big)\,\norm{\vb{r}'(t)}\,dt}$ | |
| Line integral of a field (work) | ${\displaystyle\int_C \vb{F}\cdot d\vb{r} = \int_a^b \vb{F}\big(\vb{r}(t)\big)\cdot\vb{r}'(t)\,dt}$ | also written ${\int_C P\,dx + Q\,dy + R\,dz;}$ reversing the direction changes the sign |
| Fundamental theorem for line integrals | ${\displaystyle\int_C \nabla f\cdot d\vb{r} = f\big(\vb{r}(b)\big) - f\big(\vb{r}(a)\big)}$ | ${\nabla f}$ continuous on ${C}$ |
| Conservative fields | ${\langle P, Q\rangle = \nabla f}$ for some ${f}$ exactly when ${P_y = Q_x;}$ in space, ${\vb{F} = \nabla f}$ exactly when ${\operatorname{curl}\vb{F} = \vb{0}}$ | continuous first partials on an open region with no holes (every closed curve in it can be shrunk to a point inside it) |
| Curl | ${\operatorname{curl}\vb{F} = \nabla\times\vb{F} = \langle R_y - Q_z,\ P_z - R_x,\ Q_x - P_y\rangle}$ | subscripts are partial derivatives: ${R_y = \partial R/\partial y}$ |
| Divergence | ${\operatorname{div}\vb{F} = \nabla\cdot\vb{F} = P_x + Q_y + R_z}$ | |
| Identities | ${\operatorname{curl}(\nabla f) = \vb{0},}$ ${\ \operatorname{div}(\operatorname{curl}\vb{F}) = 0}$ | continuous second partials |
| Surface integral | ${\displaystyle\iint_S f\,dS = \iint_D f\big(\vb{r}(u, v)\big)\,\norm{\vb{r}_u\times\vb{r}_v}\,du\,dv}$ | ${S}$ given by ${\vb{r}(u, v),}$ ${(u, v)}$ in ${D}$ |
| Flux | ${\displaystyle\iint_S \vb{F}\cdot d\vb{S} = \iint_D \vb{F}\big(\vb{r}(u, v)\big)\cdot(\vb{r}_u\times\vb{r}_v)\,du\,dv}$ | ${\vb{r}_u\times\vb{r}_v}$ points to the chosen side of ${S}$ |

The region must have no holes: $\vb{F} = \dfrac{\langle -y, x\rangle}{x^2 + y^2}$ has
$\partial P/\partial y = \partial Q/\partial x$ away from the origin, yet its line integral once
anticlockwise round the unit circle is $2\pi$, so it is not conservative there.

| Theorem | Formula | Holds for |
|---|---|---|
| Green's theorem | ${\displaystyle\oint_C P\,dx + Q\,dy = \iint_D \Big(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\Big)\,dA}$ | ${C}$ a piecewise smooth simple closed curve traced anticlockwise, bounding ${D;}$ ${P,}$ ${Q}$ with continuous first partials on an open region containing ${D}$ |
| Area from Green's theorem | ${A = \dfrac12\displaystyle\oint_C x\,dy - y\,dx}$ | the same ${C}$ and ${D}$ |
| Stokes' theorem | ${\displaystyle\oint_C \vb{F}\cdot d\vb{r} = \iint_S \operatorname{curl}\vb{F}\cdot d\vb{S}}$ | ${S}$ an oriented piecewise smooth surface whose boundary ${C}$ is a simple closed curve, traced so that ${S}$ is on your left when you walk along ${C}$ with your head along the normal of ${S}$ (the right-hand rule); ${\vb{F}}$ with continuous first partials |
| Divergence theorem | ${\displaystyle\iint_S \vb{F}\cdot d\vb{S} = \iiint_E \operatorname{div}\vb{F}\,dV}$ | ${S}$ the closed surface bounding the solid ${E,}$ oriented outwards; ${\vb{F}}$ with continuous first partials |

All five fundamental theorems (of calculus, for line integrals, Green's, Stokes' and the divergence
theorem) have the same shape: integrating a derivative over a region gives the function on the
region's boundary (the two ends of an interval or a curve, the edge of a surface, the surface of a
solid).

```check
from sympy.vector import CoordSys3D, curl as v_curl, divergence as v_div
curl_ = lambda F_: Matrix([diff(F_[2], y) - diff(F_[1], z), diff(F_[0], z) - diff(F_[2], x), diff(F_[1], x) - diff(F_[0], y)])
div_ = lambda F_: diff(F_[0], x) + diff(F_[1], y) + diff(F_[2], z)
grad_ = lambda f_: Matrix([diff(f_, w_) for w_ in (x, y, z)])
at = lambda e_, rv: e_.subs({x: rv[0], y: rv[1], z: rv[2]}, simultaneous=True)   # e evaluated on r(t) or r(u, v)
# the component formulas agree with sympy.vector on a field; the identities hold for every field
N3 = CoordSys3D('N3'); Fi = Matrix([x*y**2, y*z**3, z*x + sin(x*y)]); sub3 = {x: N3.x, y: N3.y, z: N3.z}
Fv = Fi[0].subs(sub3)*N3.i + Fi[1].subs(sub3)*N3.j + Fi[2].subs(sub3)*N3.k
same(v_curl(Fv).to_matrix(N3), curl_(Fi).subs(sub3)); same(v_div(Fv), div_(Fi).subs(sub3))
Fg = Matrix([Function(nm)(x, y, z) for nm in ('P', 'Q', 'R')]); fg = Function('f')(x, y, z)
same(curl_(grad_(fg)), zeros(3, 1)); same(div_(curl_(Fg)), 0)
# line integrals: one turn of the helix (cos t, sin t, t) has length 2 pi sqrt(2) (unrolled: legs 2 pi and 2 pi)
tr = symbols('t_r', real=True)
hel = Matrix([cos(tr), sin(tr), tr]); speed = sqrt(hel.diff(tr).dot(hel.diff(tr)))
same(speed, sqrt(2)); same(integrate(speed, (tr, 0, 2*pi)), 2*pi*sqrt(2))
Fc = Matrix([-y, x, 0]); circ = Matrix([cos(t), sin(t), 0])
W1 = integrate(at(Fc, circ).dot(circ.diff(t)), (t, 0, 2*pi)); same(W1, 2*pi)
circ_back = Matrix([cos(-t), sin(-t), 0]); same(integrate(at(Fc, circ_back).dot(circ_back.diff(t)), (t, 0, 2*pi)), -W1)
# fundamental theorem for line integrals, on half a turn of the helix
fh = x**2*y + y*z + z**2
same(integrate(at(grad_(fh), hel).dot(hel.diff(tr)), (tr, 0, pi)), at(fh, hel).subs(tr, pi) - at(fh, hel).subs(tr, 0))
# conservative: <2xy, x^2 + 3y^2> = grad(x^2 y + y^3); the field with a hole at the origin is not
same(diff(2*x*y, y), diff(x**2 + 3*y**2, x)); same(Matrix([diff(x**2*y + y**3, x), diff(x**2*y + y**3, y)]), Matrix([2*x*y, x**2 + 3*y**2]))
Fsp = Matrix([y*z, x*z, x*y]); same(curl_(Fsp), zeros(3, 1)); same(grad_(x*y*z), Fsp)   # in space: curl 0, and a potential
Ph, Qh = -y/(x**2 + y**2), x/(x**2 + y**2); same(diff(Ph, y), diff(Qh, x))
same(integrate(at(Matrix([Ph, Qh, 0]), circ).dot(circ.diff(t)), (t, 0, 2*pi)), 2*pi)
# Green's theorem on the unit disc and on the unit square (anticlockwise)
Pg, Qg = -y + x**2, x + x*y
lhs_g = integrate(at(Matrix([Pg, Qg, 0]), circ).dot(circ.diff(t)), (t, 0, 2*pi))
rhs_g = integrate((diff(Qg, x) - diff(Pg, y)).subs({x: rs*cos(ths), y: rs*sin(ths)})*rs, (rs, 0, 1), (ths, 0, 2*pi))
same(lhs_g, rhs_g); same(rhs_g, 2*pi)
Ps, Qs = x*y**2, x**3 + y
edges = [Matrix([t, 0, 0]), Matrix([1, t, 0]), Matrix([1 - t, 1, 0]), Matrix([0, 1 - t, 0])]
lhs_s = sum(integrate(at(Matrix([Ps, Qs, 0]), e_).dot(e_.diff(t)), (t, 0, 1)) for e_ in edges)
same(lhs_s, integrate(diff(Qs, x) - diff(Ps, y), (x, 0, 1), (y, 0, 1))); same(lhs_s, Rational(1, 2))
ae, be_e = symbols('a_e b_e', positive=True); ell = Matrix([ae*cos(t), be_e*sin(t), 0])   # an ellipse: area pi a b
same(integrate((ell[0]*ell.diff(t)[1] - ell[1]*ell.diff(t)[0])/2, (t, 0, 2*pi)), pi*ae*be_e)
# surfaces: the unit sphere r(phi, theta); r_phi x r_theta = sin(phi) r points outwards and has length sin(phi) >= 0
Sr = Matrix([sin(phs)*cos(ths), sin(phs)*sin(ths), cos(phs)]); Nr = Sr.diff(phs).cross(Sr.diff(ths))
same(Nr, sin(phs)*Sr); same(Nr.dot(Nr), sin(phs)**2)
same(integrate(sin(phs), (phs, 0, pi), (ths, 0, 2*pi)), 4*pi)  # the area of the unit sphere
# Stokes: F = <z, x, y> on the upper unit hemisphere (normal upwards) and its boundary circle (anticlockwise)
Fs = Matrix([z, x, y])
flux_curl = integrate(at(curl_(Fs), Sr).dot(Nr), (phs, 0, pi/2), (ths, 0, 2*pi))
same(flux_curl, integrate(at(Fs, circ).dot(circ.diff(t)), (t, 0, 2*pi))); same(flux_curl, pi)
# divergence theorem: F = <x^3, y^3, z^3> on the unit ball: both sides are 12 pi / 5
Fd = Matrix([x**3, y**3, z**3])
flux_d = integrate(at(Fd, Sr).dot(Nr), (phs, 0, pi), (ths, 0, 2*pi))
vol_d = integrate(at(div_(Fd), rhos*Sr)*rhos**2*sin(phs), (rhos, 0, 1), (phs, 0, pi), (ths, 0, 2*pi))
same(flux_d, vol_d); same(vol_d, Rational(12, 5)*pi)
```

## SymPy commands {#sympy}

The commands the series uses, written as in its "Compute it" boxes, after `import sympy as sp`. The
module column says where each is introduced.

| Command | What it does | Module |
|---|---|---|
| `sp.symbols('x n')` | creates symbols: `x, n = sp.symbols('x n')`; `positive=True` adds an assumption | [1](module_01_EN.html), [6](module_06_EN.html) |
| `f.subs(x, 2)` | substitutes ${2}$ for ${x}$ in `f` | [1](module_01_EN.html) |
| `sp.expand(f)` | expands products and powers | [1](module_01_EN.html) |
| `sp.factor(f)` | factorises | [1](module_01_EN.html) |
| `sp.simplify(f)` | simplifies | [1](module_01_EN.html) |
| `sp.N(f, 10)` | the value of `f` to 10 significant digits | [1](module_01_EN.html) |
| `sp.lambdify(x, f)` | turns `f` into a fast Python function | [1](module_01_EN.html) |
| `sp.log(x)` | ${\ln x,}$ as is `math.log(x)`; `sp.log(x, 10)` is ${\log_{10} x}$ | [1](module_01_EN.html) |
| `sp.limit(f, x, a, '+-')` | the limit as ${x \to a;}$ without `'+-'` SymPy gives the limit from the right (`'+'`, its default); `'-'` gives the limit from the left | [2](module_02_EN.html) |
| `sp.oo` | ${\infty,}$ as in `sp.limit(f, x, sp.oo)` | [2](module_02_EN.html), [3](module_03_EN.html) |
| `sp.diff(f, x)` | the derivative; `sp.diff(f, x, 2)` is the second derivative | [4](module_04_EN.html) |
| `sp.solve(f, x)` | a list of the solutions of ${f = 0}$ | [8](module_08_EN.html) |
| `sp.summation(a, (n, 1, N))` | the sum ${\sum_{n=1}^{N} a;}$ ${N}$ may be `sp.oo` | [9](module_09_EN.html), [14](module_14_EN.html) |
| `sp.integrate(f, x)` | an antiderivative, without ${+\,C}$ | [10](module_10_EN.html) |
| `sp.integrate(f, (x, a, b))` | the definite integral ${\int_a^b f\,dx}$ | [10](module_10_EN.html) |
| `sp.dsolve(eq, y(x))` | solves a differential equation; first `y = sp.Function('y')` | [13](module_13_EN.html) |
| `sp.series(f, x, a, n)` | the Taylor series about ${a}$ up to ${(x - a)^{n-1},}$ then ${O\big((x - a)^n\big)}$ | [15](module_15_EN.html) |

::: compute Eleven commands in one session

```python
import sympy as sp
x, n = sp.symbols('x n')
y = sp.Function('y')
f = x**2 * sp.exp(x)
print("diff:     ", sp.diff(f, x))
print("integrate:", sp.integrate(f, x))
print("definite: ", sp.integrate(f, (x, 0, 1)))
print("limit:    ", sp.limit(sp.sin(x)/x, x, 0))
print("series:   ", sp.series(sp.cos(x), x, 0, 6))
print("solve:    ", sp.solve(x**2 - 5*x + 6, x))
print("summation:", sp.summation(1/n**2, (n, 1, sp.oo)))
print("dsolve:   ", sp.dsolve(y(x).diff(x) - 2*y(x), y(x)))
print("N:        ", sp.N(sp.pi, 10))
print("simplify: ", sp.simplify(sp.sin(x)**2 + sp.cos(x)**2))
print("lambdify: ", sp.lambdify(x, f)(1.0))
```

```output
diff:      x**2*exp(x) + 2*x*exp(x)
integrate: (x**2 - 2*x + 2)*exp(x)
definite:  -2 + E
limit:     1
series:    1 - x**2/2 + x**4/24 + O(x**6)
solve:     [2, 3]
summation: pi**2/6
dsolve:    Eq(y(x), C1*exp(2*x))
N:         3.141592654
simplify:  1
lambdify:  2.718281828459045
```

:::

SymPy writes `E` for $e$ and `exp(x)` for $e^x$, so the definite integral is $e - 2$. The
antiderivative $(x^2 - 2x + 2)e^x$ comes without $+\,C$, while `dsolve` names its arbitrary constant
`C1`. The series of $\cos x$ stops before $x^6$ and says so with `O(x**6)`. `sp.N` gives $\pi$ to 10
significant digits, and the function made by `sp.lambdify` returns an ordinary floating-point number:
$e^1 \approx 2.718281828459045$.

```check
f_s = x**2*exp(x)
same(diff(f_s, x), x**2*exp(x) + 2*x*exp(x)); antideriv((x**2 - 2*x + 2)*exp(x), f_s, x)
same(integrate(f_s, (x, 0, 1)), E - 2); limit_is(sin(x)/x, x, 0, 1)
same(series(cos(x), x, 0, 6).removeO(), 1 - x**2/2 + x**4/24)
same_set(solve(x**2 - 5*x + 6, x), [2, 3]); same(summation(1/n**2, (n, 1, oo)), pi**2/6)
C1s = symbols('C1'); yC = C1s*exp(2*x); same(diff(yC, x) - 2*yC, 0)
same(sin(x)**2 + cos(x)**2, 1); rounds(pi, '3.141592654'); rounds(E, '2.718281828459045')
```
